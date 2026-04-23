/**
 * 模拟数据 - 演示视频用
 */
const MockData = {

  /* ====== 文物基本信息 ====== */
  artifact: {
    id: 'QB-2024-0086',
    name: '商末周初青铜食器鼎',
    era: '商末周初（约公元前11-10世纪）',
    level: '一级文物',
    material: '青铜（铜锡合金）',
    size: '通高 38.2cm，口径 28.6cm，腹深 19.4cm',
    weight: '4.7kg',
    origin: '传世收藏',
    collection: '陕西省文物院',
    description: '此鼎为商末周初时期典型青铜食器，形制庄重，双立耳微外撇，深腹圜底，三足粗壮有力。腹部饰有精美的兽面纹与乳钉纹，以云雷纹为地，纹饰层次分明，铸造工艺精湛，体现了商周青铜器高超的冶铸水平。器身保存基本完整，腹部见多处裂缝与腐蚀病害，需进行保护性修复。',
    history: '此鼎为商末周初时期铸造的青铜食器，用于祭祀与宴飨场合。流传至今已有约三千年历史，历经多次保护性修复。2019年例行检测发现腹部裂缝延伸，2022年雨季裂缝加剧扩展，需重新评估修复方案。'
  },

  /* ====== 损伤数据 ====== */
  damages: [
    { id: 'D01', name: '裂缝 #01', type: '裂缝', position: '腹部左前方', level: 'moderate', color: '#f59e0b', length: 8.6, width: 0.2, depth: 0.5, area: 1.72, discovered: '2019' },
    { id: 'D02', name: '裂缝 #02', type: '裂缝', position: '腹部右前方', level: 'general', color: '#3b82f6', length: 4.2, width: 0.1, depth: 0.2, area: 0.42, discovered: '2019' },
    { id: 'D03', name: '裂缝 #03', type: '裂缝', position: '腹部正前方', level: 'danger', color: '#ef4444', length: 12.4, width: 0.3, depth: 0.8, area: 3.72, discovered: '2019' },
    { id: 'D04', name: '腐蚀区 #01', type: '腐蚀', position: '下腹部后方', level: 'severe', color: '#f97316', length: 15.0, width: 8.0, depth: 0.4, area: 120.0, discovered: '2015' },
    { id: 'D05', name: '剥落 #01', type: '剥落', position: '颈部右后方', level: 'moderate', color: '#f59e0b', length: 3.0, width: 1.5, depth: 0.6, area: 4.5, discovered: '2020' },
    { id: 'D06', name: '裂缝 #04', type: '裂缝', position: '上腹部左后方', level: 'general', color: '#3b82f6', length: 2.8, width: 0.1, depth: 0.3, area: 0.28, discovered: '2023' },
  ],

  /* ====== 裂缝发展数据（时间轴用） ====== */
  crackTimeline: {
    2019: { length: 3.2, depth: 0.2, status: '初始状态 · 裂缝长度 3.2cm', crackCount: 2 },
    2020: { length: 4.8, depth: 0.3, status: '轻微扩展 · 裂缝长度 4.8cm (+1.6cm)', crackCount: 2 },
    2021: { length: 6.4, depth: 0.4, status: '持续扩展 · 裂缝长度 6.4cm (+1.6cm)', crackCount: 3 },
    2022: { length: 10.8, depth: 0.6, status: '雨季加速 · 裂缝长度 10.8cm (+4.4cm)', crackCount: 3 },
    2023: { length: 11.6, depth: 0.7, status: '缓慢扩展 · 裂缝长度 11.6cm (+0.8cm)', crackCount: 4 },
    2024: { length: 12.4, depth: 0.8, status: '当前状态 · 裂缝长度 12.4cm (+0.8cm)', crackCount: 4 },
  },

  /* ====== 环境监测数据 ====== */
  environment: {
    humidity: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      data2022: [48, 45, 52, 55, 58, 65, 72, 74, 68, 55, 50, 46],
      standard: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
    },
    temperature: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      data2022: [8, 10, 14, 18, 23, 28, 32, 33, 27, 20, 14, 9],
      standard: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20]
    }
  },

  /* ====== RAG检索案例 ====== */
  cases: [
    { id: 'C001', title: '商代青铜鼎裂纹修复案例', type: '青铜器', method: '环氧树脂加固', year: '2020', similarity: '92%', effect: '良好', humidity: '控制后45%RH' },
    { id: 'C002', title: '青铜食器潮湿环境保护方案', type: '青铜器', method: '纳米封护材料', year: '2021', similarity: '88%', effect: '优良', humidity: '控制后42%RH' },
    { id: 'C003', title: '春秋青铜壶裂缝加固修复', type: '青铜器', method: '丙烯酸树脂', year: '2019', similarity: '79%', effect: '一般', humidity: '未控制' },
    { id: 'C004', title: '战国铜鼎腐蚀防护处理案例', type: '青铜器', method: 'B72保护涂层', year: '2022', similarity: '75%', effect: '良好', humidity: '控制后48%RH' },
    { id: 'C005', title: '汉代铜镜微裂缝修复案例', type: '青铜器', method: '纳米硅酸盐', year: '2023', similarity: '71%', effect: '优良', humidity: '控制后40%RH' },
  ],

  /* ====== 多模态档案资料 ====== */
  archives: [
    { type: 'text', title: '文物登记档案', icon: 'fa-file-alt', desc: '商末周初青铜食器鼎原始登记档案，含形制描述与历次检测记录' },
    { type: 'image', title: '文物细节特写（2024）', icon: 'fa-image', desc: '腹部纹饰高清特写，含裂缝部位详细照片' },
    { type: 'data', title: '材质检测数据', icon: 'fa-chart-bar', desc: 'XRF成分分析：Cu 82.3%, Sn 14.2%, Pb 3.5%' },
    { type: 'text', title: '历次修复记录', icon: 'fa-file-alt', desc: '保护修复档案：腹部裂缝加固、锈蚀清理、封护处理' },
    { type: 'data', title: '历年检测报告汇总', icon: 'fa-chart-line', desc: '2015-2024年病害监测数据趋势报告' },
  ],

  /* ====== 修复方案 ====== */
  repairPlans: [
    {
      id: 'P01',
      name: '环氧树脂加固方案',
      color: '#3b82f6',
      material: 'E-44环氧树脂 + 650聚酰胺',
      steps: ['清洁裂缝区域', '注入环氧树脂', '表面修整', '封护处理'],
      adhesion: '≥5.0 MPa',
      humidityResistance: '中等（耐湿60%RH）',
      lifespan: '15-20年',
      risk: '长期老化可能产生变色',
      effect5y: '裂缝无延伸，轻微变色',
      effect5yHumid: '材料处有轻微开裂'
    },
    {
      id: 'P02',
      name: '纳米封护材料方案',
      color: '#22c55e',
      material: '纳米SiO₂复合封护材料',
      steps: ['清洁裂缝区域', '纳米材料渗透加固', '表面封护', '效果检测'],
      adhesion: '≥6.5 MPa',
      humidityResistance: '优良（耐湿75%RH）',
      lifespan: '25-30年',
      risk: '初期固化时间较长（48h）',
      effect5y: '裂缝无延伸，外观稳定',
      effect5yHumid: '材料稳定，无变化'
    }
  ],

  /* ====== 多智能体对话 ====== */
  agentDiscussion: [
    { agent: 'material', name: '材料分析Agent', role: '修复材料专家', msg: '基于文物材质（青铜）与裂缝特征，推荐两种加固材料：环氧树脂（附着力强，但耐湿性中等）和纳米SiO₂复合封护材料（耐湿性优良，附着力更强）。考虑到存储环境湿度波动较大，建议优先选用纳米封护材料。' },
    { agent: 'process', name: '工艺推演Agent', role: '修复工艺专家', msg: '推荐修复步骤：①使用无水乙醇清洁裂缝区域；②以0.2MPa压力注入加固材料，确保渗透深度≥0.5mm；③固化后进行表面修整与颜色匹配；④最后进行整体封护处理。注意避免过度打磨导致纹饰损失。' },
    { agent: 'risk', name: '风险评估Agent', role: '修复风险专家', msg: '风险评估结论：当前最大风险因子为环境湿度波动。2022年雨季湿度持续超标（72%RH > 标准50%RH），是裂缝加速扩展的主要诱因。建议修复前先将存储环境湿度稳定控制在40-50%RH范围内，否则修复效果将大打折扣。' },
  ],

  /* ====== AI助手预设对话 ====== */
  aiPresets: {
    greeting: '您好！我是虚拟遗境AI修复助手。我可以帮您检索同类文物的保护案例、分析损伤原因、推荐修复材料与工艺。请问有什么需要帮助的？',
    queryCase: {
      question: '查询类似纹饰青铜器在潮湿环境下的保护案例',
      answer: '为您检索到5个同类案例。其中匹配度最高的是《青铜食器潮湿环境保护方案》（相似度88%），该案例采用纳米封护材料进行加固，修复后湿度控制在42%RH，经过3年跟踪观察，修复效果评定为"优良"。建议优先参考该案例的材料选择与湿度控制方案。'
    },
    queryMaterial: {
      question: '纳米封护材料与环氧树脂相比有什么优势？',
      answer: '纳米SiO₂复合封护材料相比传统环氧树脂具有三大优势：①耐湿性提升37.5%（75%RH vs 60%RH），更适合潮湿环境下的文物保护；②附着力提升30%（≥6.5MPa vs ≥5.0MPa），加固效果更持久；③使用寿命延长约50%（25-30年 vs 15-20年），减少二次修复风险。唯一不足是初期固化时间较长（约48h），操作周期略长。'
    },
    queryEnv: {
      question: '如何控制文物存储环境的湿度？',
      answer: '针对青铜器文物，建议采用以下湿度控制方案：①安装恒温恒湿空调系统，将湿度稳定控制在40-50%RH范围内；②在展柜内放置硅胶干燥剂作为辅助除湿手段；③部署IoT环境传感器进行24小时连续监测，湿度超标时自动预警；④雨季期间增加巡检频次，关注密封性。本系统已接入环境传感器数据，可在"环境监测"面板实时查看。'
    }
  },

  /* ====== 会诊报告内容 ====== */
  report: {
    title: '商末周初青铜食器鼎协同会诊报告',
    date: '2026年3月15日',
    participants: [
      { name: '专家A', role: '考古专家', org: '陕西省文物院' },
      { name: '专家B', role: '材料分析专家', org: '西北工业大学' },
      { name: '专家C', role: '修复工艺专家', org: '陕西省文物院' }
    ],
    sections: [
      { title: '一、文物基本信息', content: '详见全息档案，主要参数：商末周初青铜食器鼎，通高38.2cm，一级文物，传世收藏。' },
      { title: '二、裂缝发展分析', content: '核心裂缝(#03)位于腹部正前方，2019年初始长度3.2cm，至2024年已扩展至12.4cm，年均增长约1.8cm。2022年雨季为关键加速期（单年增长4.4cm），与环境湿度持续超标（72%RH）高度相关。' },
      { title: '三、环境因素分析', content: '2022年6-8月存储环境相对湿度持续高于70%RH，远超文物保护标准上限50%RH。高湿环境加速青铜器电化学腐蚀，是裂缝快速扩展的主要诱因。' },
      { title: '四、修复方案对比', content: '' },
      { title: '五、最优方案', content: '推荐采用纳米SiO₂复合封护材料加固方案 + 湿度精准控制（40-50%RH）。该方案耐湿性优良、附着力强、使用寿命长，可最大程度保障修复效果。' },
      { title: '六、风险控制', content: '①修复前完成环境湿度调控系统升级；②修复过程全程记录与数字孪生同步；③修复后每季度进行一次检测复查，持续跟踪修复效果。' },
    ],
    planCompare: [
      { name: '环氧树脂方案', adhesion: '≥5.0 MPa', humidity: '耐湿60%RH', lifespan: '15-20年', effect: '轻微变色' },
      { name: '纳米封护方案（推荐）', adhesion: '≥6.5 MPa', humidity: '耐湿75%RH', lifespan: '25-30年', effect: '外观稳定' },
    ]
  },

  /* ====== 协同用户 ====== */
  collaborators: [
    { id: 'A', name: '专家A', role: '考古专家', color: '#3b82f6' },
    { id: 'B', name: '专家B', role: '材料专家', color: '#22c55e' },
    { id: 'C', name: '专家C', role: '工艺专家', color: '#f59e0b' },
  ]
};
