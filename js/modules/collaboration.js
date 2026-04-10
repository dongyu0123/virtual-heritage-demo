/**
 * 协同交互模块
 */
const Collaboration = (() => {

  function renderPanel(container) {
    const users = MockData.collaborators;
    const artifact = MockData.artifact;

    let html = `
      <div class="panel-title"><i class="fas fa-users"></i> 协同会诊</div>

      <div class="panel-block">
        <h4>在线专家</h4>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
          ${users.map(u => `
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:32px;height:32px;border-radius:50%;background:${u.color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">${u.id}</div>
              <div>
                <div style="font-size:13px;font-weight:600">${u.name} · ${u.role}</div>
                <div style="font-size:11px;color:var(--green)"><i class="fas fa-circle" style="font-size:6px"></i> 在线</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="panel-title" style="margin-top:14px"><i class="fas fa-comments"></i> 协作记录</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="panel-block" style="margin:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="width:22px;height:22px;border-radius:50%;background:#3b82f6;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700">A</span>
            <span style="font-size:12px;font-weight:600">专家A</span>
            <span style="font-size:10px;color:var(--text-muted)">14:32</span>
          </div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.6">
            2022年雨季裂缝加速扩展明显，建议优先分析环境湿度因素。
          </div>
        </div>
        <div class="panel-block" style="margin:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="width:22px;height:22px;border-radius:50%;background:#22c55e;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700">B</span>
            <span style="font-size:12px;font-weight:600">专家B</span>
            <span style="font-size:10px;color:var(--text-muted)">14:35</span>
          </div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.6">
            湿度超标是主因。建议选用耐湿性更好的纳米封护材料。
            <div class="voice-wave" style="margin-top:6px">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
        </div>
        <div class="panel-block" style="margin:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="width:22px;height:22px;border-radius:50%;background:#f59e0b;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700">C</span>
            <span style="font-size:12px;font-weight:600">专家C</span>
            <span style="font-size:10px;color:var(--text-muted)">14:38</span>
          </div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.6">
            同意B的分析。我来演示一下两种材料的修复模拟效果对比。
          </div>
        </div>
      </div>

      <div style="margin-top:14px">
        <button class="btn-primary" style="width:100%;justify-content:center" onclick="Collaboration.startDemo()">
          <i class="fas fa-play-circle"></i> 演示协同会诊流程
        </button>
      </div>
    `;

    container.innerHTML = html;
  }

  function startDemo() {
    // 模拟协同会诊流程
    App.showToast('专家A 正在操作时间轴...', 'info');

    setTimeout(() => {
      Timeline.setYear(2022);
      App.showToast('专家A 定位到2022年雨季关键节点', 'info');
    }, 2000);

    setTimeout(() => {
      App.showToast('专家B 添加了标注: "湿度超标区域"', 'success');
      Viewer.setAnnotateMode(true, (point) => {
        Viewer.addAnnotation(point, '湿度超标区域', '#22c55e');
        Viewer.setAnnotateMode(false);
      });
    }, 4000);

    setTimeout(() => {
      App.showToast('专家C 发起AI检索: 同类青铜器保护案例', 'info');
      App.toggleAI(true);
    }, 6000);

    setTimeout(() => {
      App.showToast('协同会诊演示完成', 'success');
    }, 10000);
  }

  return { renderPanel, startDemo };
})();
