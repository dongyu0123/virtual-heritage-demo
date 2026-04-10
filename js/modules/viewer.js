/**
 * Three.js 三维文物查看器
 * 程序化生成西周青铜鼎模型
 */
const Viewer = (() => {
  let scene, camera, renderer, canvas;
  let dingGroup, crackGroup, annotationGroup;
  let raycaster, mouse;
  let isRotating = true;
  let annotateMode = false;
  let animationId;
  let onModelClick = null;

  function init() {
    canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    const container = canvas.parentElement;
    const w = container.clientWidth;
    const h = container.clientHeight;

    // 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080f);
    scene.fog = new THREE.FogExp2(0x06080f, 0.015);

    // 相机
    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0.8, 0);

    // 渲染器
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // 灯光
    setupLights();

    // 地面
    setupGround();

    // 构建青铜鼎
    buildBronzeDing();

    // 裂缝标记
    crackGroup = new THREE.Group();
    scene.add(crackGroup);
    buildCracks();

    // 标注组
    annotationGroup = new THREE.Group();
    scene.add(annotationGroup);

    // 射线检测
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 事件
    canvas.addEventListener('click', onCanvasClick);
    window.addEventListener('resize', onResize);

    // 鼠标拖拽旋转
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

    animate();
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

    // 底部光
    const bottomLight = new THREE.PointLight(0x1a1a2e, 0.3, 5);
    bottomLight.position.set(0, -1, 0);
    scene.add(bottomLight);
  }

  function setupGround() {
    // 圆形地面
    const groundGeo = new THREE.CircleGeometry(8, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e1a,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // 发光圆环
    const ringGeo = new THREE.RingGeometry(2.5, 2.55, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.49;
    scene.add(ring);
  }

  function buildBronzeDing() {
    dingGroup = new THREE.Group();

    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0x5a7a4a,
      roughness: 0.4,
      metalness: 0.7,
      envMapIntensity: 0.8,
    });

    const darkBronzeMat = new THREE.MeshStandardMaterial({
      color: 0x3a5a3a,
      roughness: 0.5,
      metalness: 0.6,
    });

    // 鼎身 - 使用LatheGeometry创建旋转体
    const bodyPoints = [];
    // 底部
    bodyPoints.push(new THREE.Vector2(0.6, 0));
    bodyPoints.push(new THREE.Vector2(0.85, 0.05));
    bodyPoints.push(new THREE.Vector2(1.0, 0.15));
    bodyPoints.push(new THREE.Vector2(1.1, 0.4));
    // 腹部
    bodyPoints.push(new THREE.Vector2(1.35, 0.8));
    bodyPoints.push(new THREE.Vector2(1.45, 1.2));
    bodyPoints.push(new THREE.Vector2(1.45, 1.5));
    bodyPoints.push(new THREE.Vector2(1.35, 1.8));
    // 颈部
    bodyPoints.push(new THREE.Vector2(1.15, 2.0));
    bodyPoints.push(new THREE.Vector2(1.1, 2.1));
    // 口沿
    bodyPoints.push(new THREE.Vector2(1.15, 2.2));
    bodyPoints.push(new THREE.Vector2(1.2, 2.25));
    bodyPoints.push(new THREE.Vector2(1.18, 2.3));
    bodyPoints.push(new THREE.Vector2(1.1, 2.28));

    const bodyGeo = new THREE.LatheGeometry(bodyPoints, 48);
    const body = new THREE.Mesh(bodyGeo, bronzeMat);
    body.castShadow = true;
    body.receiveShadow = true;
    body.name = 'dingBody';
    dingGroup.add(body);

    // 三足
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
      const legGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.7, 12);
      const leg = new THREE.Mesh(legGeo, darkBronzeMat);
      leg.position.set(Math.cos(angle) * 0.8, -0.35, Math.sin(angle) * 0.8);
      leg.castShadow = true;
      leg.name = 'leg';
      dingGroup.add(leg);

      // 足底
      const footGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.08, 12);
      const foot = new THREE.Mesh(footGeo, darkBronzeMat);
      foot.position.set(Math.cos(angle) * 0.8, -0.72, Math.sin(angle) * 0.8);
      dingGroup.add(foot);
    }

    // 双耳
    for (let side of [-1, 1]) {
      const earGroup = new THREE.Group();

      // 耳身（圆环）
      const earGeo = new THREE.TorusGeometry(0.22, 0.05, 8, 16, Math.PI);
      const ear = new THREE.Mesh(earGeo, darkBronzeMat);
      ear.rotation.z = Math.PI;
      earGroup.add(ear);

      // 耳根连接
      const connGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.15, 8);
      const conn1 = new THREE.Mesh(connGeo, darkBronzeMat);
      conn1.position.set(-0.18, -0.05, 0);
      earGroup.add(conn1);
      const conn2 = new THREE.Mesh(connGeo, darkBronzeMat);
      conn2.position.set(0.18, -0.05, 0);
      earGroup.add(conn2);

      earGroup.position.set(side * 1.4, 2.15, 0);
      earGroup.rotation.y = side > 0 ? 0 : Math.PI;
      dingGroup.add(earGroup);
    }

    // 纹饰带（装饰条纹）
    const bandGeo = new THREE.TorusGeometry(1.42, 0.03, 8, 48);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0x6a8a5a, roughness: 0.3, metalness: 0.8 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.y = 1.2;
    band.rotation.x = Math.PI / 2;
    dingGroup.add(band);

    const band2 = new THREE.Mesh(bandGeo.clone(), bandMat);
    band2.position.y = 1.9;
    band2.rotation.x = Math.PI / 2;
    band2.scale.set(0.82, 0.82, 0.82);
    dingGroup.add(band2);

    // 浮雕纹饰示意（腹部小凸起，模拟兽面纹）
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const decoGeo = new THREE.SphereGeometry(0.06, 6, 6);
      const deco = new THREE.Mesh(decoGeo, bandMat);
      deco.position.set(
        Math.cos(angle) * 1.38,
        1.5 + (i % 2) * 0.15,
        Math.sin(angle) * 1.38
      );
      deco.scale.set(1, 1.5, 0.5);
      dingGroup.add(deco);
    }

    dingGroup.position.y = 0.7;
    scene.add(dingGroup);
  }

  function buildCracks() {
    // 裂缝 #01 - 腹部左侧
    addCrackLine(
      [new THREE.Vector3(-0.9, 1.6, 0.8), new THREE.Vector3(-0.95, 1.4, 0.85), new THREE.Vector3(-1.0, 1.2, 0.9)],
      0xf59e0b, 'D01'
    );

    // 裂缝 #02 - 腹部右侧
    addCrackLine(
      [new THREE.Vector3(0.85, 1.5, 0.9), new THREE.Vector3(0.9, 1.35, 0.88)],
      0x3b82f6, 'D02'
    );

    // 裂缝 #03 - 腹部正面（主要裂缝）
    addCrackLine(
      [new THREE.Vector3(-0.3, 1.8, 1.3), new THREE.Vector3(-0.2, 1.6, 1.35), new THREE.Vector3(0.0, 1.4, 1.4), new THREE.Vector3(0.15, 1.2, 1.38), new THREE.Vector3(0.25, 1.0, 1.32)],
      0xef4444, 'D03'
    );

    // 裂缝高亮（半透明区域）
    const highlightGeo = new THREE.PlaneGeometry(0.8, 1.2);
    const highlightMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthTest: false
    });
    const highlight = new THREE.Mesh(highlightGeo, highlightMat);
    highlight.position.set(0, 1.4, 1.45);
    highlight.rotation.x = -0.15;
    highlight.name = 'crackHighlight';
    crackGroup.add(highlight);
  }

  function addCrackLine(points, color, id) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, 20, 0.012, 6, false);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = { id, type: 'crack' };
    crackGroup.add(mesh);

    // 发光效果
    const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
    const glowGeo = new THREE.TubeGeometry(curve, 20, 0.025, 6, false);
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.userData = { id, type: 'crackGlow' };
    crackGroup.add(glow);
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
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    if (dingGroup && isRotating) {
      dingGroup.rotation.y += 0.003;
    }

    // 裂缝发光动画
    const time = Date.now() * 0.001;
    crackGroup.children.forEach(child => {
      if (child.userData.type === 'crackGlow') {
        child.material.opacity = 0.15 + Math.sin(time * 2) * 0.05;
      }
    });

    renderer.render(scene, camera);
  }

  /* ====== 公共接口 ====== */
  function showCracks(show, year) {
    const data = MockData.crackTimeline;
    const maxYear = 2024;
    const progress = ((year || 2019) - 2019) / (maxYear - 2019);

    crackGroup.children.forEach(child => {
      if (child.userData.type === 'crack') {
        child.material.opacity = show ? 0.9 : 0;
      }
      if (child.userData.type === 'crackGlow') {
        child.material.opacity = show ? (0.15 + progress * 0.2) : 0;
      }
      if (child.name === 'crackHighlight') {
        child.material.opacity = show ? progress * 0.12 : 0;
      }
    });
  }

  function showHighlight(damageId) {
    // 重置所有
    crackGroup.children.forEach(child => {
      if (child.userData.type === 'crack' && child.userData.id !== damageId) {
        child.material.opacity = 0.5;
      }
      if (child.userData.type === 'crackGlow' && child.userData.id !== damageId) {
        child.material.opacity = 0.1;
      }
    });
    // 高亮选中
    crackGroup.children.forEach(child => {
      if (child.userData.id === damageId) {
        child.material.opacity = 1;
        if (child.userData.type === 'crackGlow') {
          child.material.opacity = 0.4;
        }
      }
    });
  }

  function showRepairPlan(planColor, progress) {
    // 在裂缝#03上方显示修复效果
    crackGroup.children.forEach(child => {
      if (child.userData.id === 'D03' && child.userData.type === 'crack') {
        if (progress > 0) {
          child.material.color.set(planColor);
          child.material.opacity = 1 - progress * 0.5;
        } else {
          child.material.color.set(0xef4444);
        }
      }
    });
  }

  function resetRepair() {
    crackGroup.children.forEach(child => {
      if (child.userData.id === 'D03' && child.userData.type === 'crack') {
        child.material.color.set(0xef4444);
      }
    });
  }

  function toggleRotation(val) {
    isRotating = val;
  }

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

    // 连线
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
    if (dingGroup) {
      dingGroup.rotation.set(0, 0, 0);
    }
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
