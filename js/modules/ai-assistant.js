/**
 * AI助手模块
 */
const AIAssistant = (() => {
  let chatBody, inputEl;
  let conversationHistory = [];

  function init() {
    chatBody = document.getElementById('aiChatBody');
    inputEl = document.getElementById('aiInput');

    document.getElementById('aiSend').addEventListener('click', send);
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') send(); });
    document.getElementById('aiVoice').addEventListener('click', voiceInput);
  }

  function greet() {
    addMessage('bot', MockData.aiPresets.greeting);
  }

  function send() {
    const text = inputEl.value.trim();
    if (!text) return;
    addMessage('user', text);
    inputEl.value = '';

    // 显示打字中
    showTyping();

    // 模拟回复
    setTimeout(() => {
      removeTyping();
      const reply = findReply(text);
      addMessage('bot', reply);
    }, 1500);
  }

  function voiceInput() {
    App.showToast('正在识别语音...', 'info');
    setTimeout(() => {
      const query = MockData.aiPresets.queryCase.question;
      inputEl.value = query;
      addMessage('user', query);
      showTyping();
      setTimeout(() => {
        removeTyping();
        addMessage('bot', MockData.aiPresets.queryCase.answer);
        // 展示案例卡片
        showCaseCards();
      }, 2000);
    }, 1500);
  }

  function findReply(text) {
    if (text.includes('材料') || text.includes('纳米') || text.includes('环氧')) {
      return MockData.aiPresets.queryMaterial.answer;
    }
    if (text.includes('湿度') || text.includes('环境')) {
      return MockData.aiPresets.queryEnv.answer;
    }
    if (text.includes('案例') || text.includes('检索') || text.includes('类似')) {
      return MockData.aiPresets.queryCase.answer;
    }
    return '基于全息档案库与知识图谱的分析，我建议您先查看裂缝#03的发展趋势与环境数据，结合同类案例的修复经验，选择耐湿性更优的纳米封护材料。需要我为您详细分析吗？';
  }

  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `ai-msg ${role}`;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'ai-msg bot';
    div.id = 'typing-indicator';
    div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function showCaseCards() {
    const cases = MockData.cases.slice(0, 3);
    const container = document.createElement('div');
    container.className = 'ai-msg bot';
    let html = '<div style="font-size:12px;margin-bottom:8px">检索到以下相关案例：</div>';
    cases.forEach(c => {
      html += `
        <div style="background:var(--bg-primary);padding:8px;border-radius:4px;margin-bottom:6px;border-left:3px solid var(--cyan)">
          <div style="font-size:12px;font-weight:600">${c.title}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px">匹配度: ${c.similarity} · ${c.method} · 效果: ${c.effect}</div>
        </div>
      `;
    });
    container.innerHTML = html;
    chatBody.appendChild(container);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function clear() {
    if (chatBody) chatBody.innerHTML = '';
  }

  return { init, greet, send, clear };
})();
