/**
 * 损伤检测模块
 */
const Detection = (() => {

  function renderPanel(container) {
    const damages = MockData.damages;
    const artifact = MockData.artifact;

    let html = `
      <div class="panel-title"><i class="fas fa-microscope"></i> 病害检测报告</div>
      <div class="panel-block">
        <h4>检测文物</h4>
        <div style="font-size:14px;font-weight:600;margin-bottom:4px">${artifact.name}</div>
        <div style="font-size:12px;color:var(--text-muted)">${artifact.era} · ${artifact.level}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div class="panel-block" style="margin:0">
          <h4>损伤总数</h4>
          <div class="value">${damages.length}</div>
        </div>
        <div class="panel-block" style="margin:0">
          <h4>严重以上</h4>
          <div class="value danger">${damages.filter(d => d.level === 'danger' || d.level === 'severe').length}</div>
        </div>
      </div>
      <div class="panel-title" style="margin-top:8px"><i class="fas fa-list"></i> 损伤列表</div>
      <ul class="damage-list">
    `;

    damages.forEach(d => {
      const levelMap = { general: '一般', moderate: '较重', severe: '严重', danger: '危险' };
      const levelClass = 'level-' + d.level;
      html += `
        <li class="damage-item" data-id="${d.id}" onclick="Detection.selectDamage('${d.id}')">
          <span class="damage-dot" style="background:${d.color}"></span>
          <span class="dmg-name">${d.name}</span>
          <span class="dmg-level ${levelClass}">${levelMap[d.level]}</span>
        </li>
        <div style="display:none;padding:8px 12px;background:var(--bg-primary);border-radius:6px;margin-bottom:8px;font-size:12px;color:var(--text-secondary);line-height:1.8"
          id="detail-${d.id}">
          <div><b>位置:</b> ${d.position}</div>
          <div><b>类型:</b> ${d.type}</div>
          <div><b>长度:</b> ${d.length}cm &nbsp; <b>宽度:</b> ${d.width}cm</div>
          <div><b>深度:</b> ${d.depth}cm &nbsp; <b>面积:</b> ${d.area}cm²</div>
          <div><b>发现时间:</b> ${d.discovered}年</div>
        </div>
      `;
    });

    html += `</ul>`;
    container.innerHTML = html;
  }

  function selectDamage(id) {
    // 切换详情显示
    const detail = document.getElementById('detail-' + id);
    if (detail) {
      const isVisible = detail.style.display !== 'none';
      detail.style.display = isVisible ? 'none' : 'block';
    }

    // 高亮列表项
    document.querySelectorAll('.damage-item').forEach(el => el.classList.remove('active'));
    const item = document.querySelector(`.damage-item[data-id="${id}"]`);
    if (item) item.classList.add('active');

    // 高亮3D模型上对应的裂缝
    Viewer.showHighlight(id);
  }

  return { renderPanel, selectDamage };
})();
