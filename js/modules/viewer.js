/**
 * Three.js 三维文物查看器
 * 加载真实青铜鼎 GLB 模型 + 表面热力色块病害可视化
 */
const Viewer = (() => {
  let scene, camera, renderer, canvas;
  let dingGroup, annotationGroup;
  let raycaster, mouse;
  let isRotating = true;
  let damagesVisible = false;
  let annotateMode = false;
  let animationId;
  let onModelClick = null;
  let scanProgress = 0;
  let isScanning = false;
  let modelBounds = null;

  // 病害区域：围绕鼎身的不同方向和高度
  // dirAngle: 绕鼎的角度位置, heightRatio: 高度比例(0=底,1=顶)
  // sizeRatio: 病害区域大小占模型高度的比例
  const damageZones = [
    { id: 'D01', dirAngle: -0.8, heightRatio: 0.42, sizeRatio: 0.12, color: 0xf59e0b },
    { id: 'D02', dirAngle: 0.9,  heightRatio: 0.38, sizeRatio: 0.08, color: 0x3b82f6 },
    { id: 'D03', dirAngle: 0.0,  heightRatio: 0.38, sizeRatio: 0.18, color: 0xef4444 },
    { id: 'D04', dirAngle: 3.14, heightRatio: 0.12, sizeRatio: 0.15, color: 0xf97316 },
    { id: 'D05', dirAngle: 2.2,  heightRatio: 0.72, sizeRatio: 0.08, color: 0xf59e0b },
    { id: 'D06', dirAngle: -1.8, heightRatio: 0.62, sizeRatio: 0.07, color: 0x3b82f6 },
  ];

  function init() {
    canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    const container = canvas.parentElement;
    const w = container.clientWidth;
    const h = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080f);
    scene.fog = new THREE.FogExp2(0x06080f, 0.015);

    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0.8, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;

    setupLights();
    setupGround();

    annotationGroup = new THREE.Group();
    scene.add(annotationGroup);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    canvas.addEventListener('click', onCanvasClick);
    window.addEventListener('resize', onResize);

    let isDragging = false, prevX = 0, prevY = 0;
    canvas.addEventListener('mousedown', (e) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging || !dingGroup) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      dingGroup.rotation.y += dx * 0.005;
      dingGroup.rotation.x = Math.max(-0.5, Math.min(0.5, dingGroup.rotation.x + dy * 0.005));
      prevX = e.clientX;
      prevY = e.clientY;
      isRotating = false;
    });
    canvas.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('wheel', (e) => {
      camera.position.z = Math.max(3, Math.min(10, camera.position.z + e.deltaY * 0.005));
    });

    loadModel();
    animate();
  }

  function loadModel() {
    const loader = new THREE.GLTFLoader();
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingBar = document.getElementById('loadingBar');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    loader.load(
      'assets/ding_food_vessel_11th-10th_century_bce.glb',
      (gltf) => {
        dingGroup = new THREE.Group();
        dingGroup.name = 'dingGroup';
        const model = gltf.scene;

        // 计算包围盒并缩放
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.5 / maxDim;

        model.scale.set(scale, scale, scale);
        model.position.sub(center.multiplyScalar(scale));
        model.position.y += 0.5;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        dingGroup.add(model);

        // 整体居中到平台上方
        const newBox = new THREE.Box3().setFromObject(dingGroup);
        const newCenter = newBox.getCenter(new THREE.Vector3());
        dingGroup.position.y -= newCenter.y - 0.7;

        scene.add(dingGroup);

        // 记录模型在 dingGroup 局部坐标系中的包围盒
        modelBounds = new THREE.Box3().setFromObject(model);

        // 延迟到下一帧构建病害色块，确保世界矩阵已正确计算
        requestAnimationFrame(() => {
          try {
            buildDamageOverlays();
          } catch (e) {
            console.warn('病害色块构建失败，使用回退方案:', e);
            buildDamageOverlaysFallback();
          }
        });

        if (loadingOverlay) loadingOverlay.style.display = 'none';
      },
      (xhr) => {
        if (xhr.total > 0 && loadingBar) {
          loadingBar.style.width = ((xhr.loaded / xhr.total) * 100) + '%';
        }
      },
      (error) => {
        console.error('模型加载失败:', error);
        if (loadingOverlay) loadingOverlay.style.display = 'none';
      }
    );
  }

  /**
   * 基于射线投射，精确定位鼎身表面的病害色块位置
   * 从模型中心向指定方向发射射线，命中模型表面的点即为色块位置
   */
  function buildDamageOverlays() {
    if (!modelBounds) return;

    const min = modelBounds.min;
    const max = modelBounds.max;
    const height = max.y - min.y;
    const centerX = (min.x + max.x) / 2;
    const centerY = (min.y + max.y) / 2;
    const centerZ = (min.z + max.z) / 2;
    const modelCenter = new THREE.Vector3(centerX, centerY, centerZ);

    // 收集 dingGroup 内所有 mesh，确保矩阵已更新
    const meshes = [];
    dingGroup.traverse(child => { if (child.isMesh) meshes.push(child); });
    dingGroup.updateMatrixWorld(true);

    // 从包围盒外部发射射线的距离
    const maxRadius = Math.max(max.x - min.x, max.z - min.z) * 0.8;

    damageZones.forEach(zone => {
      const patchSize = height * zone.sizeRatio;
      const targetY = min.y + height * zone.heightRatio;

      // 从模型外部朝向中心发射射线，必中模型外表面
      const localOrigin = new THREE.Vector3(
        centerX + Math.sin(zone.dirAngle) * maxRadius,
        targetY,
        centerZ + Math.cos(zone.dirAngle) * maxRadius
      );
      const worldOrigin = localOrigin.clone().applyMatrix4(dingGroup.matrixWorld);

      // 方向：朝向中心轴
      const localDir = new THREE.Vector3(
        -Math.sin(zone.dirAngle), 0, -Math.cos(zone.dirAngle)
      ).normalize();
      const worldDir = localDir.clone().transformDirection(dingGroup.matrixWorld).normalize();

      const rc = new THREE.Raycaster(worldOrigin, worldDir, 0.01, maxRadius * 3);
      const hits = rc.intersectObjects(meshes, false);

      let surfacePoint, surfaceNormal;

      if (hits.length > 0) {
        surfacePoint = hits[0].point.clone();
        const invMat = new THREE.Matrix4().copy(dingGroup.matrixWorld).invert();
        surfacePoint.applyMatrix4(invMat);
        surfaceNormal = hits[0].face
          ? hits[0].face.normal.clone().transformDirection(hits[0].object.matrixWorld)
          : new THREE.Vector3(Math.sin(zone.dirAngle), 0, Math.cos(zone.dirAngle)).normalize();
      } else {
        // 回退：包围盒估算
        const radiusX = (max.x - min.x) / 2;
        const radiusZ = (max.z - min.z) / 2;
        const avgRadius = (radiusX + radiusZ) / 2;
        const bellyFactor = 1 - Math.pow(2 * zone.heightRatio - 1, 2) * 0.3;
        const surfaceR = avgRadius * bellyFactor;
        surfacePoint = new THREE.Vector3(
          centerX + Math.sin(zone.dirAngle) * surfaceR,
          targetY,
          centerZ + Math.cos(zone.dirAngle) * surfaceR
        );
        surfaceNormal = new THREE.Vector3(Math.sin(zone.dirAngle), 0, Math.cos(zone.dirAngle)).normalize();
        console.warn('病害', zone.id, '射线未命中，使用估算位置');
      }

      // 病害组
      const patchGroup = new THREE.Group();
      patchGroup.position.copy(surfacePoint);
      patchGroup.userData = { id: zone.id, type: 'damageGroup' };

      // 朝向表面外侧
      const lookTarget = surfacePoint.clone().add(surfaceNormal);
      patchGroup.lookAt(lookTarget);

      // 第1层：大面积淡色光晕
      const haloGeo = new THREE.CircleGeometry(patchSize * 1.5, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: zone.color, transparent: true, opacity: 0,
        side: THREE.DoubleSide, depthWrite: false,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.z = 0.003;
      halo.userData = { layer: 'halo' };
      patchGroup.add(halo);

      // 第2层：主要色块
      const mainGeo = new THREE.CircleGeometry(patchSize, 32);
      const mainMat = new THREE.MeshBasicMaterial({
        color: zone.color, transparent: true, opacity: 0,
        side: THREE.DoubleSide, depthWrite: false,
      });
      const mainPatch = new THREE.Mesh(mainGeo, mainMat);
      mainPatch.position.z = 0.005;
      mainPatch.userData = { layer: 'main' };
      patchGroup.add(mainPatch);

      // 第3层：中心高亮
      const coreGeo = new THREE.CircleGeometry(patchSize * 0.4, 24);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0,
        side: THREE.DoubleSide, depthWrite: false,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.z = 0.008;
      core.userData = { layer: 'core' };
      patchGroup.add(core);

      // 中心标记点
      const dotGeo = new THREE.SphereGeometry(patchSize * 0.08, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0,
        depthTest: false,
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.z = 0.012;
      dot.userData = { layer: 'dot' };
      patchGroup.add(dot);

      dingGroup.add(patchGroup);
    });
  }

  /**
   * 回退方案：用包围盒几何估算表面位置（不依赖射线投射）
   */
  function buildDamageOverlaysFallback() {
    if (!modelBounds) return;

    const min = modelBounds.min;
    const max = modelBounds.max;
    const height = max.y - min.y;
    const centerX = (min.x + max.x) / 2;
    const centerZ = (min.z + max.z) / 2;
    const radiusX = (max.x - min.x) / 2;
    const radiusZ = (max.z - min.z) / 2;

    damageZones.forEach(zone => {
      const patchSize = height * zone.sizeRatio;
      const targetY = min.y + height * zone.heightRatio;
      const bellyFactor = 1 - Math.pow(2 * zone.heightRatio - 1, 2) * 0.3;
      const avgRadius = (radiusX + radiusZ) / 2 * bellyFactor;

      const sx = centerX + Math.sin(zone.dirAngle) * avgRadius;
      const sz = centerZ + Math.cos(zone.dirAngle) * avgRadius;

      const outward = new THREE.Vector3(Math.sin(zone.dirAngle), 0, Math.cos(zone.dirAngle)).normalize();

      const patchGroup = new THREE.Group();
      patchGroup.position.set(sx, targetY, sz);
      patchGroup.userData = { id: zone.id, type: 'damageGroup' };
      patchGroup.lookAt(patchGroup.position.clone().add(outward));

      const layers = [
        { geo: new THREE.CircleGeometry(patchSize * 1.5, 32), z: 0.003, opacity: 0, layer: 'halo' },
        { geo: new THREE.CircleGeometry(patchSize, 32), z: 0.005, opacity: 0, layer: 'main' },
        { geo: new THREE.CircleGeometry(patchSize * 0.4, 24), z: 0.008, opacity: 0, layer: 'core', color: 0xffffff },
        { geo: new THREE.SphereGeometry(patchSize * 0.08, 8, 8), z: 0.012, opacity: 0, layer: 'dot', color: 0xffffff },
      ];

      layers.forEach(l => {
        const mat = new THREE.MeshBasicMaterial({
          color: l.color || zone.color, transparent: true, opacity: 0,
          side: THREE.DoubleSide, depthWrite: false,
        });
        const mesh = new THREE.Mesh(l.geo, mat);
        mesh.position.z = l.z;
        mesh.userData = { layer: l.layer };
        patchGroup.add(mesh);
      });

      dingGroup.add(patchGroup);
    });
  }

  function setupLights() {
    const ambient = new THREE.AmbientLight(0x334466, 0.5);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(1024, 1024);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x00d4ff, 0.5, 10);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    const bottomLight = new THREE.PointLight(0x1a1a2e, 0.3, 5);
    bottomLight.position.set(0, -1, 0);
    scene.add(bottomLight);
  }

  function setupGround() {
    const groundGeo = new THREE.CircleGeometry(8, 64);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0e1a, roughness: 0.9, metalness: 0.1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    const ringGeo = new THREE.RingGeometry(2.5, 2.55, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.49;
    scene.add(ring);
  }

  function onCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(dingGroup.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      if (annotateMode && typeof onModelClick === 'function') {
        onModelClick(point);
      }
    }
  }

  function onResize() {
    if (!canvas || !camera || !renderer) return;
    const container = canvas.parentElement;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    if (dingGroup && isRotating) {
      dingGroup.rotation.y += 0.003;
    }

    // 扫描渐显动画
    if (isScanning) {
      scanProgress += 0.012;
      if (scanProgress >= 1.2) {
        scanProgress = 1.2;
        isScanning = false;
      }
      applyDamageOpacity(scanProgress);
    }

    // 呼吸脉冲
    if (damagesVisible && !isScanning) {
      const t = Date.now() * 0.001;
      forEachDamageLayer((patchGroup, idx) => {
        const halo = patchGroup.children.find(c => c.userData.layer === 'halo');
        const dot = patchGroup.children.find(c => c.userData.layer === 'dot');
        if (halo) halo.material.opacity = 0.15 + Math.sin(t * 1.5 + idx * 1.2) * 0.05;
        if (dot) dot.material.opacity = 0.6 + Math.sin(t * 3 + idx) * 0.3;
      });
    }

    renderer.render(scene, camera);
  }

  function forEachDamageLayer(callback) {
    if (!dingGroup) return;
    let idx = 0;
    dingGroup.children.forEach(child => {
      if (child.userData.type === 'damageGroup') {
        callback(child, idx++);
      }
    });
  }

  function applyDamageOpacity(progress) {
    const total = damageZones.length;
    forEachDamageLayer((patchGroup, idx) => {
      const localProg = Math.max(0, Math.min(1, progress * total - idx));
      const halo = patchGroup.children.find(c => c.userData.layer === 'halo');
      const main = patchGroup.children.find(c => c.userData.layer === 'main');
      const core = patchGroup.children.find(c => c.userData.layer === 'core');
      const dot  = patchGroup.children.find(c => c.userData.layer === 'dot');
      if (halo) halo.material.opacity = localProg * 0.15;
      if (main) main.material.opacity = localProg * 0.45;
      if (core) core.material.opacity = localProg * 0.25;
      if (dot)  dot.material.opacity = localProg * 0.8;
    });
  }

  /* ====== 公共接口 ====== */

  function showCracks(show, year) {
    damagesVisible = show;
    if (show) {
      scanProgress = 0;
      isScanning = true;
    } else {
      isScanning = false;
      forEachDamageLayer((patchGroup) => {
        patchGroup.children.forEach(c => { c.material.opacity = 0; });
      });
    }
  }

  function showHighlight(damageId) {
    forEachDamageLayer((patchGroup) => {
      const isTarget = patchGroup.userData.id === damageId;
      const halo = patchGroup.children.find(c => c.userData.layer === 'halo');
      const main = patchGroup.children.find(c => c.userData.layer === 'main');
      const core = patchGroup.children.find(c => c.userData.layer === 'core');
      const dot  = patchGroup.children.find(c => c.userData.layer === 'dot');
      if (halo) halo.material.opacity = isTarget ? 0.3 : 0.05;
      if (main) main.material.opacity = isTarget ? 0.7 : 0.12;
      if (core) core.material.opacity = isTarget ? 0.4 : 0.05;
      if (dot)  dot.material.opacity = isTarget ? 1 : 0.2;
    });
  }

  function showRepairPlan(planColor, progress) {
    forEachDamageLayer((patchGroup) => {
      if (patchGroup.userData.id === 'D03') {
        const main = patchGroup.children.find(c => c.userData.layer === 'main');
        const halo = patchGroup.children.find(c => c.userData.layer === 'halo');
        if (main) {
          if (progress > 0) {
            main.material.color.set(planColor);
            main.material.opacity = 0.7 - progress * 0.4;
          } else {
            main.material.color.set(0xef4444);
          }
        }
        if (halo && progress > 0) {
          halo.material.color.set(planColor);
        }
      }
    });
  }

  function resetRepair() {
    forEachDamageLayer((patchGroup) => {
      if (patchGroup.userData.id === 'D03') {
        const main = patchGroup.children.find(c => c.userData.layer === 'main');
        const halo = patchGroup.children.find(c => c.userData.layer === 'halo');
        if (main) main.material.color.set(0xef4444);
        if (halo) halo.material.color.set(0xef4444);
      }
    });
  }

  function toggleRotation(val) { isRotating = val; }

  function setAnnotateMode(val, callback) {
    annotateMode = val;
    onModelClick = callback;
    canvas.style.cursor = val ? 'crosshair' : 'default';
  }

  function addAnnotation(point, text, color) {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color) })
    );
    sphere.position.copy(point);
    sphere.position.y += 0.05;
    annotationGroup.add(sphere);

    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        point.clone().add(new THREE.Vector3(0, 0.05, 0)),
        point.clone().add(new THREE.Vector3(0, 0.4, 0))
      ]),
      new THREE.LineBasicMaterial({ color: new THREE.Color(color) })
    );
    annotationGroup.add(line);
  }

  function zoomIn() { camera.position.z = Math.max(3, camera.position.z - 0.5); }
  function zoomOut() { camera.position.z = Math.min(10, camera.position.z + 0.5); }
  function resetView() {
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0.8, 0);
    if (dingGroup) dingGroup.rotation.set(0, 0, 0);
    isRotating = true;
  }

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onResize);
  }

  return {
    init, showCracks, showHighlight, showRepairPlan, resetRepair,
    toggleRotation, setAnnotateMode, addAnnotation,
    zoomIn, zoomOut, resetView, destroy
  };
})();
