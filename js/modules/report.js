/**
 * 报告生成模块
 */
const Report = (() => {

  function show() {
    const overlay = document.getElementById('reportOverlay');
    const body = document.getElementById('reportBody');
    const data = MockData.report;

    let html = `
      <h3>${data.title}</h3>
      <p><b>会诊日期:</b> ${data.date}</p>
      <p><b>参与专家:</b></p>
      <ul style="padding-left:20px;margin:8px 0">
        ${data.participants.map(p => `<li>${p.name} · ${p.role} · ${p.org}</li>`).join('')}
      </ul>

      <h3>一、文物基本信息</h3>
      <p>详见全息档案。主要参数：西周中期青铜礼器，通高38.2cm，口径28.6cm，一级文物，1974年宝鸡茹家庄出土。</p>

      <h3>二、裂缝发展分析</h3>
      <p>核心裂缝(#03)位于腹部正面，2019年初始长度3.2cm，至2024年已扩展至12.4cm，年均增长约1.8cm。2022年雨季为关键加速期（单年增长4.4cm），与环境湿度持续超标（72%RH）高度相关。</p>

      <h3>三、修复方案对比</h3>
      <table>
        <tr><th>对比项</th><th>环氧树脂方案</th><th>纳米封护方案（推荐）</th></tr>
        <tr><td>附着力</td><td>≥5.0 MPa</td><td>≥6.5 MPa</td></tr>
        <tr><td>耐湿性</td><td>60%RH</td><td>75%RH</td></tr>
        <tr><td>使用寿命</td><td>15-20年</td><td>25-30年</td></tr>
        <tr><td>控湿修复效果</td><td>轻微变色</td><td>外观稳定</td></tr>
        <tr><td>未控湿效果</td><td>材料处轻微开裂</td><td>材料稳定，无变化</td></tr>
      </table>

      <h3>四、最优方案</h3>
      <p style="color:var(--green);font-weight:600">推荐采用纳米SiO₂复合封护材料加固方案 + 湿度精准控制（40-50%RH）</p>
      <p>该方案耐湿性优良、附着力强、使用寿命长，可最大程度保障修复效果。</p>

      <h3>五、风险控制措施</h3>
      <ul style="padding-left:20px">
        <li>修复前完成环境湿度调控系统升级</li>
        <li>修复过程全程记录与数字孪生同步</li>
        <li>修复后每季度进行一次检测复查，持续跟踪修复效果</li>
        <li>建立预警机制，湿度超标自动通知</li>
      </ul>
    `;

    body.innerHTML = html;
    overlay.style.display = 'flex';
  }

  function hide() {
    document.getElementById('reportOverlay').style.display = 'none';
  }

  function init() {
    document.getElementById('reportClose').addEventListener('click', hide);
    document.getElementById('exportPdf').addEventListener('click', () => {
      App.showToast('报告已导出为PDF', 'success');
    });
    document.getElementById('saveArchive').addEventListener('click', () => {
      App.showToast('已归档至全息文物档案库', 'success');
    });
  }

  return { show, hide, init };
})();
