/**
 * 修复模拟沙盒模块
 */
const Repair = (() => {
  let selectedPlan = null;
  let simulationRunning = false;

  function renderPanel(container) {
    const plans = MockData.repairPlans;
    const agents = MockData.agentDiscussion;

    let html = `
      <div class="panel-title"><i class="fas fa-wrench"></i> 修复模拟沙盒</div>

      <div class="panel-title" style="font-size:12px;margin-top:4px"><i class="fas fa-robot"></i> 智能体协同推理</div>
      <div class="agent-panel">
    `;

    agents.forEach(a => {
      const cls = a.agent === 'material' ? 'material' : (a.agent === 'process' ? 'process' : 'risk');
      html += `
        <div class="agent-card">
          <div class="agent-header">
            <div class="agent-avatar ${cls}"><i class="fas fa-brain"></i></div>
            <div>
              <div class="agent-name">${a.name}</div>
              <div class="agent-role">${a.role}</div>
            </div>
          </div>
          <div class="agent-msg">${a.msg}</div>
        </div>
      `;
    });

    html += `</div>`;

    html += `
      <div class="panel-title" style="margin-top:16px"><i class="fas fa-balance-scale"></i> 方案对比推演</div>
      <div class="plan-compare">
    `;

    plans.forEach(p => {
      html += `
        <div class="plan-card" data-plan="${p.id}" onclick="Repair.selectPlan('${p.id}')">
          <div class="plan-color" style="background:${p.color}"></div>
          <h4 style="color:${p.color}">${p.name}</h4>
          <div class="plan-params">
            <div>附着力: ${p.adhesion}</div>
            <div>耐湿: ${p.humidityResistance}</div>
            <div>寿命: ${p.lifespan}</div>
          </div>
        </div>
      `;
    });

    html += `
      </div>
      <div id="planDetail" style="margin-top:12px"></div>
      <button class="btn-primary" style="width:100%;margin-top:12px;justify-content:center" onclick="Repair.startSimulation()">
        <i class="fas fa-play"></i> 开始模拟推演
      </button>
      <div id="simResult" style="margin-top:12px"></div>
    `;

    container.innerHTML = html;
  }

  function selectPlan(id) {
    selectedPlan = MockData.repairPlans.find(p => p.id === id);
    document.querySelectorAll('.plan-card').forEach(el => el.classList.remove('selected'));
    document.querySelector(`.plan-card[data-plan="${id}"]`).classList.add('selected');

    const detail = document.getElementById('planDetail');
    if (selectedPlan) {
      detail.innerHTML = `
        <div class="panel-block">
          <h4>方案详情</h4>
          <ul class="info-list">
            <li><span class="label">材料</span><span class="val">${selectedPlan.material}</span></li>
            <li><span class="label">步骤</span><span class="val">${selectedPlan.steps.join(' → ')}</span></li>
            <li><span class="label">风险</span><span class="val" style="color:var(--amber)">${selectedPlan.risk}</span></li>
          </ul>
        </div>
      `;
    }
  }

  function startSimulation() {
    if (!selectedPlan) {
      App.showToast('请先选择一个修复方案', 'warning');
      return;
    }
    if (simulationRunning) return;
    simulationRunning = true;

    const resultDiv = document.getElementById('simResult');
    resultDiv.innerHTML = `
      <div class="panel-block" style="text-align:center">
        <div style="margin-bottom:8px;color:var(--cyan);font-size:13px"><i class="fas fa-spinner fa-spin"></i> 正在模拟推演...</div>
        <div class="loading-progress" style="margin:0 auto;width:80%"><div class="loading-bar" id="simBar" style="width:0%"></div></div>
      </div>
    `;

    // 模拟进度
    let pct = 0;
    const bar = document.getElementById('simBar');
    const timer = setInterval(() => {
      pct += 5;
      bar.style.width = pct + '%';
      if (pct >= 100) {
        clearInterval(timer);
        showSimResult();
      }
    }, 100);

    // 同步3D效果
    Viewer.showRepairPlan(selectedPlan.color, 0.7);
  }

  function showSimResult() {
    simulationRunning = false;
    const resultDiv = document.getElementById('simResult');
    const p = selectedPlan;
    resultDiv.innerHTML = `
      <div class="panel-block">
        <h4 style="color:var(--green)"><i class="fas fa-check-circle"></i> 推演完成</h4>
        <ul class="info-list">
          <li><span class="label">控制湿度(45%RH)修复效果</span><span class="val" style="color:var(--green)">${p.effect5y}</span></li>
          <li><span class="label">未控湿度(65%RH)修复效果</span><span class="val" style="color:${p.effect5yHumid.includes('无变化') ? 'var(--green)' : 'var(--amber)'}">${p.effect5yHumid}</span></li>
        </ul>
      </div>
      <button class="btn-primary" style="width:100%;margin-top:8px;justify-content:center" onclick="App.showReport()">
        <i class="fas fa-file-alt"></i> 生成会诊报告
      </button>
    `;
  }

  return { renderPanel, selectPlan, startSimulation };
})();
