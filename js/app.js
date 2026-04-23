/**
 * 主应用逻辑 - 路由、模式切换、全局控制
 */
const App = (() => {
  let currentMode = 'archive';

  function init() {
    // 首页粒子背景
    initParticles();

    // 进入系统
    document.getElementById('enterSystem').addEventListener('click', enterSystem);

    // 模式切换
    document.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => switchMode(tab.dataset.mode));
    });

    // 视口工具栏
    document.getElementById('btnZoomIn').addEventListener('click', () => Viewer.zoomIn());
    document.getElementById('btnZoomOut').addEventListener('click', () => Viewer.zoomOut());
    document.getElementById('btnReset').addEventListener('click', () => Viewer.resetView());
    document.getElementById('btnRotate').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      btn.classList.toggle('active');
      Viewer.toggleRotation(btn.classList.contains('active'));
    });

    // 标注模式
    document.getElementById('btnAnnotate').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      btn.classList.toggle('active');
      Viewer.setAnnotateMode(btn.classList.contains('active'), (point) => {
        showAnnotationTool(point);
        btn.classList.remove('active');
      });
    });

    // 标注工具
    document.getElementById('annotCancel').addEventListener('click', hideAnnotationTool);
    document.getElementById('annotConfirm').addEventListener('click', confirmAnnotation);

    // AI助手
    document.getElementById('aiFab').addEventListener('click', () => toggleAI(true));
    document.getElementById('aiClose').addEventListener('click', () => toggleAI(false));

    // 报告
    Report.init();
  }

  /* ====== 粒子背景 ====== */
  function initParticles() {
    const canvas = document.getElementById('particle-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // 创建粒子
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 0.5,
        o: Math.random() * 0.5 + 0.1
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // 连线
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 粒子
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.o})`;
        ctx.fill();
      });

      if (document.getElementById('landing-view').classList.contains('active')) {
        requestAnimationFrame(draw);
      }
    }
    draw();
  }

  /* ====== 进入系统 ====== */
  function enterSystem() {
    const loading = document.getElementById('loadingOverlay');
    const bar = document.getElementById('loadingBar');
    loading.style.display = 'flex';

    let pct = 0;
    const timer = setInterval(() => {
      pct += Math.random() * 15 + 5;
      if (pct > 100) pct = 100;
      bar.style.width = pct + '%';

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          loading.style.display = 'none';
          document.getElementById('landing-view').classList.remove('active');
          document.getElementById('workspace-view').classList.add('active');

          // 初始化各模块
          Viewer.init();
          AIAssistant.init();
          Timeline.init(onTimelineChange);
          switchMode('archive');
          AIAssistant.greet();
        }, 300);
      }
    }, 200);
  }

  /* ====== 模式切换 ====== */
  function switchMode(mode) {
    currentMode = mode;
    const panel = document.getElementById('panelContent');

    // 更新标签样式
    document.querySelectorAll('.mode-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    // 更新工具栏按钮状态
    const btnAnnotate = document.getElementById('btnAnnotate');
    btnAnnotate.classList.remove('active');
    Viewer.setAnnotateMode(false);

    // 重置修复效果
    Viewer.resetRepair();

    // 根据模式切换面板内容
    switch (mode) {
      case 'archive':
        Viewer.showCracks(false);
        renderArchivePanel(panel);
        break;
      case 'detection':
        Viewer.showCracks(true, getCurrentYear());
        Detection.renderPanel(panel);
        break;
      case 'repair':
        Viewer.showCracks(true, 2024);
        Repair.renderPanel(panel);
        break;
      case 'collaborate':
        Viewer.showCracks(true, 2024);
        Collaboration.renderPanel(panel);
        break;
    }
  }

  /* ====== 全息档案面板 ====== */
  function renderArchivePanel(container) {
    const artifact = MockData.artifact;
    const archives = MockData.archives;
    const cases = MockData.cases.slice(0, 3);

    let html = `
      <div class="panel-title"><i class="fas fa-landmark"></i> 全息文物档案</div>

      <div class="panel-block">
        <h4>文物名称</h4>
        <div style="font-size:15px;font-weight:700;margin-bottom:2px">${artifact.name}</div>
        <div style="font-size:12px;color:var(--text-muted)">${artifact.era}</div>
      </div>

      <div class="search-box">
        <input type="text" placeholder="检索文物知识..." id="archiveSearch" />
        <button onclick="App.searchArchive()"><i class="fas fa-search"></i></button>
      </div>

      <ul class="info-list">
        <li><span class="label">编号</span><span class="val">${artifact.id}</span></li>
        <li><span class="label">级别</span><span class="val">${artifact.level}</span></li>
        <li><span class="label">材质</span><span class="val">${artifact.material}</span></li>
        <li><span class="label">尺寸</span><span class="val">${artifact.size}</span></li>
        <li><span class="label">重量</span><span class="val">${artifact.weight}</span></li>
        <li><span class="label">来源</span><span class="val">${artifact.origin}</span></li>
        <li><span class="label">收藏</span><span class="val">${artifact.collection}</span></li>
      </ul>

      <div class="panel-title" style="margin-top:16px"><i class="fas fa-folder-open"></i> 多模态资料</div>
      ${archives.map(a => `
        <div class="case-card">
          <div class="case-title"><i class="fas ${a.icon}" style="color:var(--cyan);margin-right:6px"></i>${a.title}</div>
          <div style="font-size:12px;color:var(--text-muted)">${a.desc}</div>
        </div>
      `).join('')}

      <div class="panel-title" style="margin-top:16px"><i class="fas fa-book"></i> 修复历史</div>
      <div class="panel-block">
        <div style="font-size:12px;color:var(--text-secondary);line-height:1.8">${artifact.history}</div>
      </div>
    `;

    container.innerHTML = html;
  }

  function searchArchive() {
    const input = document.getElementById('archiveSearch');
    const query = input.value.trim();
    if (!query) return;

    showToast('正在检索: "' + query + '"', 'info');
    setTimeout(() => {
      showToast('检索到 3 条相关资料', 'success');
    }, 1000);
  }

  /* ====== 时间轴回调 ====== */
  function onTimelineChange(year) {
    const yearInt = Math.floor(year);
    if (currentMode === 'detection') {
      Viewer.showCracks(true, year);
    }
  }

  function getCurrentYear() {
    const slider = document.getElementById('timelineSlider');
    return slider ? parseFloat(slider.value) : 2019;
  }

  /* ====== AI助手 ====== */
  function toggleAI(show) {
    const el = document.getElementById('aiAssistant');
    el.style.display = show ? 'flex' : 'none';
    document.getElementById('aiFab').style.display = show ? 'none' : 'flex';
  }

  /* ====== 报告 ====== */
  function showReport() {
    Report.show();
  }

  /* ====== 标注工具 ====== */
  let pendingAnnotationPoint = null;

  function showAnnotationTool(point) {
    pendingAnnotationPoint = point;
    const tool = document.getElementById('annotationTool');
    tool.style.display = 'block';
    tool.style.left = '50%';
    tool.style.top = '50%';
    tool.style.transform = 'translate(-50%, -50%)';
  }

  function hideAnnotationTool() {
    document.getElementById('annotationTool').style.display = 'none';
    pendingAnnotationPoint = null;
  }

  function confirmAnnotation() {
    const text = document.getElementById('annotText').value.trim();
    if (!text || !pendingAnnotationPoint) return;

    const activeColor = document.querySelector('.color-dot.active');
    const color = activeColor ? activeColor.dataset.color : '#ff6b6b';

    Viewer.addAnnotation(pendingAnnotationPoint, text, color);
    showToast('标注已添加: ' + text, 'success');
    hideAnnotationTool();
    document.getElementById('annotText').value = '';
  }

  /* ====== Toast通知 ====== */
  function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconMap = { success: 'fa-check-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    toast.innerHTML = `<i class="fas ${iconMap[type] || 'fa-info-circle'}"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  return {
    init, switchMode, toggleAI, showReport, searchArchive,
    showToast, renderArchivePanel
  };
})();

// 启动
document.addEventListener('DOMContentLoaded', () => App.init());
