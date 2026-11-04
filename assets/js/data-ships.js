/* =========================================================
   MOBIGLAS · 飞船数据库
   ---------------------------------------------------------
   说明：
   - usd 为官网 standalone 未税参考价（2026-11 按 RSI 官网核对），礼包价另计
   - 官网无货的船显示最后一次挂牌价；部分地区结算价会加税
   - auec 为游戏内主要船店参考价，null = 暂无常规售卖
   - 性能数值为社区常用参考快照，会随版本与配件变化
   - 更新方式：直接修改本文件中对应字段即可
   ========================================================= */

window.SC = window.SC || {};

SC.meta = {
  snapshot: '2026-11',
  patch: 'Alpha 4.x',
  pricesNote: '美元价已按 RSI 官网 2026-11 核对，口径为 standalone 未税价；无货船显示官网最后一次挂牌价。部分地区结算时按当地税率加收，例如 10% 税率下 $75.00 会显示为约 $82.50。aUEC 为游戏内船店参考价。价格随版本、活动与税率变化，购买前请以官网与游戏内终端为准。',
  statsNote: '速度、护盾、船体耐久为常用参考值，实际以当前版本和配件配置为准。'
};

SC.ships = [
  /* ---------------- 入门 / 轻型多用途 ---------------- */
  {
    id: 'aurora-mr', name: 'Aurora MR', cn: '极光 MR', maker: 'Roberts Space Industries',
    role: '多用途', tags: ['多用途'], size: 'S', crew: '1', cargo: 3,
    usd: 30, auec: 184500, status: '可飞',
    scm: 175, max: 1105, shield: '1×S1', hull: 2600,
    weapons: '2×S1 固定 · 2×S1 挂点', missiles: '2×S2',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '最经典的入门船，能跑快递、能打小架，炸了也不太心疼。',
    fit: '刚进游戏、预算有限、想先熟悉飞行和任务循环的玩家。'
  },
  {
    id: 'aurora-ln', name: 'Aurora LN', cn: '极光 LN', maker: 'Roberts Space Industries',
    role: '轻型战斗', tags: ['战斗', '多用途'], size: 'S', crew: '1', cargo: 3,
    usd: 40, auec: 233000, status: '可飞',
    scm: 180, max: 1115, shield: '2×S1', hull: 3200,
    weapons: '2×S2 固定 · 2×S1 挂点', missiles: '2×S2',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '极光的武装强化版，多两面盾和更大的机炮，仍保留货舱。',
    fit: '想要一艘能打能跑、又不想投入太多的单人玩家。'
  },
  {
    id: 'mustang-alpha', name: 'Mustang Alpha', cn: '野马 Alpha', maker: 'Consolidated Outland',
    role: '多用途', tags: ['多用途'], size: 'S', crew: '1', cargo: 4,
    usd: 30, auec: 190900, status: '可飞',
    scm: 195, max: 1150, shield: '1×S1', hull: 1700,
    weapons: '2×S1 固定', missiles: '2×S2',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '视野好、操控轻快的入门船，货舱藏在机腹，适合快递与观光。',
    fit: '喜欢灵活手感、以跑腿任务为主的萌新。'
  },
  {
    id: 'c8x-pisces', name: 'C8X Pisces Expedition', cn: '双鱼座 C8X', maker: 'Anvil Aerospace',
    role: '通勤 / 多用途', tags: ['多用途'], size: 'S', crew: '1–2', cargo: 4,
    usd: 45, auec: 414700, status: '可飞',
    scm: 210, max: 1200, shield: '1×S1', hull: 2400,
    weapons: '2×S1 固定', missiles: '—',
    buy: 'Astro Armada（Area18）· Orison 展厅（Crusader）',
    blurb: '克拉克的随身小艇，起降快、油耗低，是城市间通勤的好选择。',
    fit: '已经有一艘大船、需要一艘代步小艇的玩家。'
  },
  {
    id: 'cutter', name: 'Cutter', cn: '切割者', maker: 'Drake Interplanetary',
    role: '多用途', tags: ['多用途'], size: 'S', crew: '1', cargo: 4,
    usd: 45, auec: 606000, status: '可飞',
    scm: 170, max: 1000, shield: '1×S1', hull: 4000,
    weapons: '2×S2 固定', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '德雷克风格的“太空面包车”，结构简单、维护便宜，生活舱很实用。',
    fit: '想低成本体验生存玩法、经常在外过夜的独狼。'
  },
  {
    id: 'avenger-titan', name: 'Avenger Titan', cn: '复仇者 泰坦', maker: 'Aegis Dynamics',
    role: '多用途', tags: ['多用途'], size: 'S', crew: '1', cargo: 8,
    usd: 60, auec: 793600, status: '可飞',
    scm: 210, max: 1200, shield: '2×S1', hull: 7800,
    weapons: '1×S4 机首 · 2×S3 翼下', missiles: '4×S2',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '被社区称为“萌新版本答案”：速度、火力、货舱都不差。',
    fit: '想用一艘船覆盖快递、赏金和少量货运的起步玩家。'
  },
  {
    id: '300i', name: '300i', cn: '300i', maker: 'Origin Jumpworks',
    role: '豪华多用途', tags: ['多用途', '豪华'], size: 'S', crew: '1', cargo: 8,
    usd: 60, auec: 726600, status: '可飞',
    scm: 220, max: 1250, shield: '1×S1', hull: 3600,
    weapons: '2×S3 固定', missiles: '2×S2',
    buy: 'Factory Line（New Babbage）· Astro Armada（Area18）',
    blurb: '流线型豪华通勤船，内饰精致，速度和续航都很舒服。',
    fit: '重视观感与驾驶体验、任务强度不高的玩家。'
  },
  {
    id: '325a', name: '325a', cn: '325a', maker: 'Origin Jumpworks',
    role: '轻型战斗', tags: ['战斗', '豪华'], size: 'S', crew: '1', cargo: 8,
    usd: 70, auec: 1073000, status: '可飞',
    scm: 220, max: 1250, shield: '2×S1', hull: 4000,
    weapons: '1×S4 · 2×S3', missiles: '4×S2',
    buy: 'Factory Line（New Babbage）· Astro Armada（Area18）',
    blurb: '300 系列的武装型，兼顾颜值与火力，单挑小船不虚。',
    fit: '喜欢 Origin 设计、又想打赏金任务的单人玩家。'
  },
  {
    id: 'reliant-kore', name: 'Reliant Kore', cn: '信实 Kore', maker: 'MISC',
    role: '轻型货运', tags: ['货运', '多用途'], size: 'S', crew: '2', cargo: 6,
    usd: 65, auec: 916000, status: '可飞',
    scm: 190, max: 1100, shield: '2×S1', hull: 5000,
    weapons: '2×S3 固定', missiles: '2×S2',
    buy: 'New Deal（Lorville）· Factory Line（New Babbage）',
    blurb: '可切换飞行姿态的异形小船，双人协作时效率更高。',
    fit: '喜欢奇特设计、有固定队友的休闲玩家。'
  },
  {
    id: 'hull-a', name: 'Hull A', cn: '赫尔 A', maker: 'MISC',
    role: '轻型货运', tags: ['货运'], size: 'S', crew: '1', cargo: 48,
    usd: 100, auec: 1336000, status: '可飞',
    scm: 150, max: 950, shield: '1×S1', hull: 5500,
    weapons: '1×S1 防御', missiles: '—',
    buy: 'New Deal（Lorville）· Factory Line（New Babbage）',
    blurb: '外挂货架的轻型货船，单位价格能拉的货很多，但装卸偏慢。',
    fit: '想做小额货运、能接受慢节奏的独狼商人。'
  },
  {
    id: 'nomad', name: 'Nomad', cn: '游牧者', maker: 'Consolidated Outland',
    role: '多用途', tags: ['多用途', '货运'], size: 'S', crew: '1', cargo: 24,
    usd: 80, auec: 1218100, status: '可飞',
    scm: 190, max: 1100, shield: '2×S1', hull: 9000,
    weapons: '3×S3 固定', missiles: '2×S2',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '悬浮货斗加生活舱，像一艘会飞的皮卡，兼顾货运与日常。',
    fit: '想从快递升级到正经货运、但预算有限的玩家。'
  },
  {
    id: 'syulen', name: 'Syulen', cn: '叙伦', maker: 'Gatac Manufacture',
    role: '多用途', tags: ['多用途'], size: 'S', crew: '1', cargo: 6,
    usd: 70, auec: 1323000, status: '可飞',
    scm: 200, max: 1200, shield: '2×S1', hull: 6000,
    weapons: '3×S3 固定', missiles: '4×S2',
    buy: '活动 / 限时（官网）· Astro Armada（Area18）',
    blurb: '垂直起降的异星小船，火力在入门级里相当扎眼。',
    fit: '喜欢外星设计、想要一艘个性战斗兼通勤船的玩家。'
  },
  {
    id: 'intrepid', name: 'Intrepid', cn: '无畏', maker: 'Crusader Industries',
    role: '多用途', tags: ['多用途'], size: 'S', crew: '1', cargo: 8,
    usd: 65, auec: 600000, status: '可飞',
    scm: 195, max: 1150, shield: '2×S1', hull: 5000,
    weapons: '2×S3 固定', missiles: '2×S2',
    buy: 'Orison 展厅（Crusader）· Astro Armada（Area18）',
    blurb: '十字军工业的新入门船，方正实用，生活区比外形看起来宽敞。',
    fit: '想要一艘便宜、好开、能过夜的新手船。'
  },

  /* ---------------- 轻型 / 中型战斗 ---------------- */
  {
    id: 'arrow', name: 'Arrow', cn: '箭矢', maker: 'Anvil Aerospace',
    role: '轻型战斗', tags: ['战斗'], size: 'S', crew: '1', cargo: 0,
    usd: 75, auec: 1013100, status: '可飞',
    scm: 225, max: 1235, shield: '2×S1', hull: 3700,
    weapons: '2×S3 · 2×S1', missiles: '4×S2',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '纸装甲但极其灵活，靠走位吃饭的经典轻型战斗机。',
    fit: '喜欢高机动狗斗、愿意练操作的老手或进阶萌新。'
  },
  {
    id: 'gladius', name: 'Gladius', cn: '短剑', maker: 'Aegis Dynamics',
    role: '轻型战斗', tags: ['战斗'], size: 'S', crew: '1', cargo: 0,
    usd: 90, auec: 1126700, status: '可飞',
    scm: 215, max: 1220, shield: '2×S1', hull: 6400,
    weapons: '3×S3 固定', missiles: '4×S2',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '军用轻型战斗机的标杆，机动、火力、生存性平衡得最好。',
    fit: '想认真打 PvE 赏金、又不想开大船的玩家。'
  },
  {
    id: 'buccaneer', name: 'Buccaneer', cn: '海盗', maker: 'Drake Interplanetary',
    role: '轻型战斗', tags: ['战斗'], size: 'S', crew: '1', cargo: 0,
    usd: 110, auec: 1468300, status: '可飞',
    scm: 205, max: 1200, shield: '2×S1', hull: 5600,
    weapons: '2×S3 · 1×S4', missiles: '4×S2',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '德雷克式暴力美学，火力猛、皮薄，打带跑很对味。',
    fit: '喜欢贴脸输出、不介意船经常进维修厂的玩家。'
  },
  {
    id: 'talon', name: 'Talon', cn: '利爪', maker: 'Esperia',
    role: '轻型战斗', tags: ['战斗'], size: 'S', crew: '1', cargo: 0,
    usd: 115, auec: 1721000, status: '可飞',
    scm: 215, max: 1225, shield: '2×S1', hull: 4800,
    weapons: '2×S4 固定', missiles: '4×S2',
    buy: '活动 / 限时（官网）· Astro Armada（Area18）',
    blurb: '外星仿制舰，双 S4 主炮加独特外形，是艘有脾气的轻战。',
    fit: '追求个性和大口径、愿意接受外星船维护成本的玩家。'
  },
  {
    id: 'khartu-al', name: 'Khartu-al', cn: '卡图阿尔', maker: 'Aopoa',
    role: '轻型战斗', tags: ['战斗'], size: 'S', crew: '1', cargo: 0,
    usd: 175, auec: 2057000, status: '可飞',
    scm: 230, max: 1250, shield: '2×S1', hull: 4200,
    weapons: '2×S3 · 2×S2', missiles: '—',
    buy: '活动 / 限时（官网）',
    blurb: '希安风格的双体战机，横向机动性惊人，武器布置很特别。',
    fit: '想体验完全不同飞行手感、预算充足的战斗玩家。'
  },
  {
    id: 'fury', name: 'Fury', cn: '狂怒', maker: 'Mirai',
    role: '轻型战斗', tags: ['战斗'], size: 'S', crew: '1', cargo: 0,
    usd: 55, auec: 438600, status: '可飞',
    scm: 225, max: 1235, shield: '1×S1', hull: 2900,
    weapons: '2×S3 · 2×S1', missiles: '2×S2',
    buy: 'Astro Armada（Area18）· Orison 展厅（Crusader）',
    blurb: '超小型战机，火力密度高但生存性差，适合当舰载机。',
    fit: '已有母舰、需要一艘便宜舰载机的玩家。'
  },
  {
    id: 'mantis', name: 'Mantis', cn: '螳螂', maker: 'Roberts Space Industries',
    role: '拦截', tags: ['战斗', '支援'], size: 'S', crew: '1', cargo: 0,
    usd: 150, auec: 2257000, status: '可飞',
    scm: 180, max: 1100, shield: '2×S1', hull: 6500,
    weapons: '2×S2 固定', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '能生成量子拦截场的专业船，抓人、堵路、护航都靠它。',
    fit: '喜欢组队 PvP、负责“关门”的战术玩家。'
  },
  {
    id: 'herald', name: 'Herald', cn: '先驱', maker: 'Drake Interplanetary',
    role: '数据跑者', tags: ['竞速'], size: 'S', crew: '1', cargo: 0,
    usd: 85, auec: 1144000, status: '可飞',
    scm: 240, max: 1300, shield: '1×S1', hull: 4500,
    weapons: '2×S1 固定', missiles: '—',
    buy: 'New Deal（Lorville）· Astro Armada（Area18）',
    blurb: '游戏里数一数二的直线快船，机房里塞满了服务器。',
    fit: '喜欢竞速、跑数据任务或单纯追求速度感的玩家。'
  },
  {
    id: 'hornet-f7c', name: 'F7C Hornet', cn: '大黄蜂 F7C', maker: 'Anvil Aerospace',
    role: '战斗机', tags: ['战斗'], size: 'S', crew: '1', cargo: 0,
    usd: 125, auec: 1564500, status: '可飞',
    scm: 210, max: 1200, shield: '2×S1', hull: 8500,
    weapons: '2×S3 · 2×S2', missiles: '4×S2',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: 'UEE 主力舰载机的民用型，耐打、火力稳，狗斗底子扎实。',
    fit: '喜欢传统战斗机手感、想要高容错的赏金玩家。'
  },
  {
    id: 'super-hornet', name: 'F7C-M Super Hornet', cn: '超级大黄蜂', maker: 'Anvil Aerospace',
    role: '重型战斗', tags: ['战斗'], size: 'S', crew: '2', cargo: 0,
    usd: 180, auec: 2543000, status: '可飞',
    scm: 205, max: 1180, shield: '2×S1', hull: 9500,
    weapons: '2×S3 · 2×S2 炮塔', missiles: '4×S2',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '双座重型战斗机，副炮手能让火力利用率翻倍。',
    fit: '有固定搭档、想一起打高难赏金的玩家。'
  },
  {
    id: 'sabre', name: 'Sabre', cn: '军刀', maker: 'Aegis Dynamics',
    role: '中型战斗', tags: ['战斗'], size: 'S', crew: '1', cargo: 0,
    usd: 175, auec: 2173800, status: '可飞',
    scm: 215, max: 1225, shield: '3×S1', hull: 7800,
    weapons: '3×S3 固定', missiles: '4×S2',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '隐身中型战斗机，雷达特征小，适合先手偷袭。',
    fit: '喜欢潜行接敌、打 PvP 或高危赏金的玩家。'
  },
  {
    id: 'scorpius', name: 'Scorpius', cn: '天蝎座', maker: 'Roberts Space Industries',
    role: '重型战斗', tags: ['战斗'], size: 'S', crew: '2', cargo: 0,
    usd: 240, auec: 2875600, status: '可飞',
    scm: 195, max: 1150, shield: '2×S2', hull: 8800,
    weapons: '4×S3 炮塔', missiles: '8×S2',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '四炮塔双座战机，后座火力全开时输出非常可观。',
    fit: '有队友一起飞、追求正面火力的玩家。'
  },
  {
    id: 'hurricane', name: 'Hurricane', cn: '飓风', maker: 'Anvil Aerospace',
    role: '重型战斗', tags: ['战斗'], size: 'S', crew: '2', cargo: 0,
    usd: 210, auec: 2593000, status: '可飞',
    scm: 200, max: 1180, shield: '2×S2', hull: 7500,
    weapons: '2×S4 炮塔 · 2×S3', missiles: '4×S3',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '双座炮塔战机，副炮手掌握两门 S4，集火时非常凶。',
    fit: '喜欢双人协作、以火力压制为主的战斗组合。'
  },
  {
    id: 'ares-ion', name: 'Ares Ion', cn: '战神 Ion', maker: 'Crusader Industries',
    role: '重型战斗', tags: ['战斗'], size: 'S', crew: '1', cargo: 0,
    usd: 250, auec: 2946000, status: '可飞',
    scm: 200, max: 1150, shield: '2×S1', hull: 7000,
    weapons: '1×S7 激光炮', missiles: '—',
    buy: 'Orison 展厅（Crusader）· Astro Armada（Area18）',
    blurb: '围绕一门 S7 激光炮设计的“狙击机”，专打大船模块。',
    fit: '喜欢远程点射、参与组队反舰作战的玩家。'
  },
  {
    id: 'ares-inferno', name: 'Ares Inferno', cn: '战神 Inferno', maker: 'Crusader Industries',
    role: '重型战斗', tags: ['战斗'], size: 'S', crew: '1', cargo: 0,
    usd: 250, auec: 2946000, status: '可飞',
    scm: 195, max: 1150, shield: '2×S1', hull: 7000,
    weapons: '1×S7 机炮', missiles: '—',
    buy: 'Orison 展厅（Crusader）· Astro Armada（Area18）',
    blurb: 'Ion 的实弹版本，弹药量大，持续输出更稳定。',
    fit: '偏爱实弹武器、想稳定拆大船的玩家。'
  },
  {
    id: 'vanguard-warden', name: 'Vanguard Warden', cn: '先锋 守望者', maker: 'Aegis Dynamics',
    role: '重型战斗', tags: ['战斗', '探索'], size: 'M', crew: '1', cargo: 0,
    usd: 260, auec: 3138600, status: '可飞',
    scm: 190, max: 1150, shield: '2×S2', hull: 14000,
    weapons: '1×S5 · 4×S2', missiles: '4×S5',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '长航程重型战斗机，能独立深入远航，生存性一流。',
    fit: '喜欢单人远航、长时间在外的赏金猎人。'
  },
  {
    id: 'eclipse', name: 'Eclipse', cn: '日蚀', maker: 'Aegis Dynamics',
    role: '轰炸', tags: ['战斗'], size: 'S', crew: '1', cargo: 0,
    usd: 300, auec: 3804500, status: '可飞',
    scm: 190, max: 1100, shield: '2×S1', hull: 6800,
    weapons: '3×S9 鱼雷', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '隐身鱼雷艇，三发 S9 足以威胁大型目标，打完就跑。',
    fit: '喜欢潜行接近、用一发入魂解决战斗的玩家。'
  },
  {
    id: 'gladiator', name: 'Gladiator', cn: '角斗士', maker: 'Anvil Aerospace',
    role: '轰炸', tags: ['战斗'], size: 'S', crew: '2', cargo: 0,
    usd: 165, auec: 2343000, status: '可飞',
    scm: 190, max: 1150, shield: '2×S2', hull: 9000,
    weapons: '2×S5 鱼雷 · 2×S3', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '老牌鱼雷轰炸机，双座配置，反舰和打地面目标都灵活。',
    fit: '喜欢对舰打击、有队友一起飞的玩家。'
  },
  {
    id: 'retaliator-bomber', name: 'Retaliator Bomber', cn: '报复者 轰炸型', maker: 'Aegis Dynamics',
    role: '重型轰炸', tags: ['战斗'], size: 'M', crew: '5', cargo: 0,
    usd: 275, auec: 6197400, status: '可飞',
    scm: 175, max: 1050, shield: '4×S2', hull: 30000,
    weapons: '6×S9 鱼雷 · 2×S3 炮塔', missiles: '—',
    buy: '官网 Retaliator 基础型 $175（当前无货）；Bomber 配置以官网/活动为准',
    blurb: '六发 S9 鱼雷的多人轰炸平台，一轮齐射足以改写战局。',
    fit: '有固定小队、想体验多人协同反舰的玩家。'
  },
  {
    id: 'redeemer', name: 'Redeemer', cn: '救赎者', maker: 'Aegis Dynamics',
    role: '炮艇', tags: ['战斗'], size: 'M', crew: '3', cargo: 0,
    usd: 330, auec: 6632300, status: '可飞',
    scm: 180, max: 1100, shield: '3×S2', hull: 25000,
    weapons: '2×S5 炮塔 · 2×S3 炮塔', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '为护航而生的武装炮艇，多座炮塔覆盖全向，硬度也够。',
    fit: '经常组队跑高危区域、需要火力掩护的玩家。'
  },
  {
    id: 'valkyrie', name: 'Valkyrie', cn: '女武神', maker: 'Anvil Aerospace',
    role: '运输 / 支援', tags: ['支援', '货运'], size: 'M', crew: '5', cargo: 30,
    usd: 375, auec: 6865600, status: '可飞',
    scm: 180, max: 1100, shield: '2×S2', hull: 28000,
    weapons: '2×S4 炮塔 · 2×S3', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '重型突击运输机，能运兵、运车，也能挂载不少火力。',
    fit: '喜欢地面行动、团队投送与火力支援的玩家。'
  },

  /* ---------------- 中型多用途 / 货运 ---------------- */
  {
    id: 'cutlass-black', name: 'Cutlass Black', cn: '弯刀 黑', maker: 'Drake Interplanetary',
    role: '多用途', tags: ['多用途', '货运'], size: 'M', crew: '2', cargo: 46,
    usd: 110, auec: 1385300, status: '可飞',
    scm: 190, max: 1110, shield: '2×S2', hull: 22000,
    weapons: '2×S3 · 2×S3 炮塔', missiles: '8×S2',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '星际公民最实用的万金油：能打、能拉、能带车，价格也友好。',
    fit: '想用一艘船覆盖赏金、货运和探索的进阶玩家。'
  },
  {
    id: 'cutlass-red', name: 'Cutlass Red', cn: '弯刀 红', maker: 'Drake Interplanetary',
    role: '医疗', tags: ['支援', '多用途'], size: 'M', crew: '2', cargo: 24,
    usd: 135, auec: 1562000, status: '可飞',
    scm: 185, max: 1100, shield: '2×S1', hull: 20000,
    weapons: '2×S2 · 2×S2 炮塔', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '带医疗床的弯刀，救援任务和组队保障都很好用。',
    fit: '喜欢医疗救援玩法、或经常给队伍当后勤的玩家。'
  },
  {
    id: 'freelancer', name: 'Freelancer', cn: '自由职业者', maker: 'MISC',
    role: '多用途', tags: ['多用途', '货运'], size: 'M', crew: '2', cargo: 66,
    usd: 110, auec: 1649500, status: '可飞',
    scm: 180, max: 1080, shield: '2×S2', hull: 24000,
    weapons: '4×S3 固定 · 2×S2 炮塔', missiles: '6×S3',
    buy: 'New Deal（Lorville）· Factory Line（New Babbage）',
    blurb: '经典米氏货船，货舱大、续航好，外形低调耐看。',
    fit: '想稳定跑货运、偶尔打打赏金的二人组。'
  },
  {
    id: 'freelancer-max', name: 'Freelancer MAX', cn: '自由职业者 MAX', maker: 'MISC',
    role: '货运', tags: ['货运'], size: 'M', crew: '2', cargo: 120,
    usd: 150, auec: 2181000, status: '可飞',
    scm: 175, max: 1050, shield: '2×S2', hull: 28000,
    weapons: '4×S3 固定', missiles: '6×S3',
    buy: 'New Deal（Lorville）· Factory Line（New Babbage）',
    blurb: '自由职业者的加宽货运版，120 SCU 在中小型货船里很能打。',
    fit: '想认真跑货运、需要大一点货舱的商人。'
  },
  {
    id: 'msr', name: 'Mercury Star Runner', cn: '水星 星跑者', maker: 'Crusader Industries',
    role: '数据运输', tags: ['货运', '多用途', '竞速'], size: 'M', crew: '3', cargo: 114,
    usd: 260, auec: 4774100, status: '可飞',
    scm: 215, max: 1250, shield: '2×S2', hull: 32000,
    weapons: '2×S3 · 2×S2 炮塔', missiles: '—',
    buy: 'Orison 展厅（Crusader）· Astro Armada（Area18）',
    blurb: '跑得快、装得多、还有秘密货舱，是数据与走私题材的门面船。',
    fit: '喜欢高速货运、潜行和“来路不明”任务的玩家。'
  },
  {
    id: 'c1-spirit', name: 'C1 Spirit', cn: 'C1 精灵', maker: 'Crusader Industries',
    role: '多用途货运', tags: ['货运', '多用途'], size: 'M', crew: '2', cargo: 64,
    usd: 125, auec: 2300000, status: '可飞',
    scm: 205, max: 1200, shield: '2×S2', hull: 18000,
    weapons: '2×S3 · 2×S2 炮塔', missiles: '—',
    buy: 'Orison 展厅（Crusader）· Astro Armada（Area18）',
    blurb: '外形优雅的中型货船，速度与货舱平衡，驾驶感很轻。',
    fit: '喜欢新式设计、想兼顾快递与货运的玩家。'
  },
  {
    id: 'zeus-cl', name: 'Zeus Mk II CL', cn: '宙斯 CL', maker: 'Roberts Space Industries',
    role: '货运', tags: ['货运'], size: 'M', crew: '2', cargo: 128,
    usd: 175, auec: 1957000, status: '可飞',
    scm: 190, max: 1150, shield: '2×S2', hull: 20000,
    weapons: '2×S3 · 2×S2 炮塔', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '复古未来风的 RSI 中型货船，货舱规整，价格相对亲民。',
    fit: '想要一艘好看、能装、成本不高的货运船。'
  },
  {
    id: 'zeus-es', name: 'Zeus Mk II ES', cn: '宙斯 ES', maker: 'Roberts Space Industries',
    role: '探索', tags: ['探索'], size: 'M', crew: '2', cargo: 32,
    usd: 175, auec: 1850000, status: '可飞',
    scm: 190, max: 1150, shield: '2×S2', hull: 20000,
    weapons: '2×S3 · 2×S2 炮塔', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '宙斯的探索型，带扫描设备与更长的续航，适合跑远路。',
    fit: '想入门探索、预算又不高的玩家。'
  },
  {
    id: '400i', name: '400i', cn: '400i', maker: 'Origin Jumpworks',
    role: '探索', tags: ['探索', '豪华'], size: 'M', crew: '3', cargo: 42,
    usd: 250, auec: 6148000, status: '可飞',
    scm: 220, max: 1250, shield: '2×S2', hull: 24000,
    weapons: '2×S3 · 2×S2 炮塔', missiles: '—',
    buy: 'Factory Line（New Babbage）· Astro Armada（Area18）',
    blurb: 'Origin 的豪华探索艇，速度、续航、居住性都很出色。',
    fit: '喜欢精致内装、独自或两人远航的玩家。'
  },
  {
    id: 'terrapin', name: 'Terrapin', cn: '龟甲', maker: 'Anvil Aerospace',
    role: '探索 / 侦察', tags: ['探索', '支援'], size: 'S', crew: '1', cargo: 4,
    usd: 220, auec: 2905600, status: '可飞',
    scm: 180, max: 1100, shield: '2×S2', hull: 12000,
    weapons: '2×S2 固定', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '装甲厚实的侦察船，扫描能力突出，生存性在小型船里罕见。',
    fit: '喜欢侦察、测绘和高危区域探路的玩家。'
  },
  {
    id: 'andromeda', name: 'Constellation Andromeda', cn: '星座 仙女座', maker: 'Roberts Space Industries',
    role: '多用途', tags: ['多用途', '战斗', '货运'], size: 'L', crew: '4', cargo: 96,
    usd: 240, auec: 3548000, status: '可飞',
    scm: 150, max: 950, shield: '2×S3', hull: 54000,
    weapons: '4×S5 · 2×S2 炮塔', missiles: '28×S2',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '四门 S5 加导弹海的经典多用途舰，能打能拉，还带小艇。',
    fit: '想要一艘全能型多人船、以赏金和货运为主的小队。'
  },
  {
    id: 'taurus', name: 'Constellation Taurus', cn: '星座 金牛座', maker: 'Roberts Space Industries',
    role: '货运', tags: ['货运'], size: 'L', crew: '4', cargo: 174,
    usd: 200, auec: 3126200, status: '可飞',
    scm: 150, max: 950, shield: '2×S3', hull: 50000,
    weapons: '4×S4 · 2×S2 炮塔', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '星座的货运版，174 SCU 加不错的火力，性价比很突出。',
    fit: '想用较低预算进入中型货运的玩家。'
  },
  {
    id: 'corsair', name: 'Corsair', cn: '海盗船', maker: 'Drake Interplanetary',
    role: '探索 / 战斗', tags: ['探索', '战斗', '多用途'], size: 'L', crew: '4', cargo: 72,
    usd: 250, auec: 4935600, status: '可飞',
    scm: 165, max: 1000, shield: '2×S2', hull: 40000,
    weapons: '4×S5 · 2×S3 炮塔', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '德雷克的大型探索舰，前向火力夸张，适合“探索到别人家里”。',
    fit: '喜欢高风险探索、兼顾战斗的独狼或小队。'
  },
  {
    id: '600i-explorer', name: '600i Explorer', cn: '600i 探索型', maker: 'Origin Jumpworks',
    role: '豪华探索', tags: ['探索', '豪华'], size: 'L', crew: '5', cargo: 40,
    usd: 475, auec: 9472000, status: '可飞',
    scm: 160, max: 1000, shield: '3×S3', hull: 66000,
    weapons: '3×S5 · 2×S3 炮塔', missiles: '—',
    buy: 'Factory Line（New Babbage）· Astro Armada（Area18）',
    blurb: '移动的豪华公寓，探索配置齐全，外观与内装都很有排面。',
    fit: '追求居住体验和长航程、预算充裕的玩家。'
  },
  {
    id: 'carrack', name: 'Carrack', cn: '克拉克', maker: 'Anvil Aerospace',
    role: '探索', tags: ['探索', '多用途'], size: 'L', crew: '6', cargo: 456,
    usd: 600, auec: 26536500, status: '可飞',
    scm: 150, max: 950, shield: '2×S3', hull: 110000,
    weapons: '2×S5 · 2×S3 炮塔', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '远征探索的标杆：医疗床、机库、无人机、货舱一应俱全。',
    fit: '想长期在外探索、组队远航的玩家。'
  },
  {
    id: 'starlancer-max', name: 'Starlancer MAX', cn: 'Starlancer MAX', maker: 'MISC',
    role: '货运', tags: ['货运', '多用途'], size: 'L', crew: '4', cargo: 224,
    usd: 250, auec: 4300000, status: '可飞',
    scm: 165, max: 1000, shield: '2×S3', hull: 60000,
    weapons: '4×S4 · 2×S3 炮塔', missiles: '—',
    buy: 'New Deal（Lorville）· Factory Line（New Babbage）',
    blurb: '米氏新一代中型货船，224 SCU 加居住区，长途货运很舒服。',
    fit: '想升级到中型货运、重视生活区的玩家。'
  },

  /* ---------------- 大型货运 / 工业 ---------------- */
  {
    id: 'caterpillar', name: 'Caterpillar', cn: '毛虫', maker: 'Drake Interplanetary',
    role: '重型货运', tags: ['货运'], size: 'L', crew: '4', cargo: 576,
    usd: 330, auec: 9929300, status: '可飞',
    scm: 150, max: 950, shield: '2×S3', hull: 80000,
    weapons: '2×S4 · 2×S3 炮塔', missiles: '—',
    buy: 'New Deal（Lorville）· Astro Armada（Area18）',
    blurb: '模块化货运巨兽，货舱可换装，是大型贸易路线的常客。',
    fit: '有稳定货源、想跑大宗货运的商人或团队。'
  },
  {
    id: 'c2-hercules', name: 'Hercules C2', cn: '大力神 C2', maker: 'Crusader Industries',
    role: '重型运输', tags: ['货运'], size: 'L', crew: '2', cargo: 696,
    usd: 400, auec: 13354000, status: '可飞',
    scm: 145, max: 940, shield: '2×S3', hull: 130000,
    weapons: '2×S5 · 2×S3 炮塔', missiles: '—',
    buy: 'Orison 展厅（Crusader）· Astro Armada（Area18）',
    blurb: '696 SCU 的重型运输机，装载车辆和集装箱都很方便。',
    fit: '做大规模货运、或需要运载地面载具的团队。'
  },
  {
    id: 'm2-hercules', name: 'Hercules M2', cn: '大力神 M2', maker: 'Crusader Industries',
    role: '军用运输', tags: ['货运', '战斗'], size: 'L', crew: '2', cargo: 522,
    usd: 520, auec: 15376000, status: '可飞',
    scm: 145, max: 940, shield: '3×S3', hull: 150000,
    weapons: '2×S5 · 2×S3 炮塔', missiles: '—',
    buy: 'Orison 展厅（Crusader）· Astro Armada（Area18）',
    blurb: 'C2 的军用版，装甲与护盾更厚，适合危险区域运输。',
    fit: '经常穿越高危区域、需要硬货舱的团队。'
  },
  {
    id: 'hull-c', name: 'Hull C', cn: '赫尔 C', maker: 'MISC',
    role: '重型货运', tags: ['货运'], size: 'L', crew: '2', cargo: 4608,
    usd: 500, auec: 14900000, status: '可飞',
    scm: 140, max: 900, shield: '2×S3', hull: 90000,
    weapons: '2×S3 炮塔', missiles: '—',
    buy: 'New Deal（Lorville）· Factory Line（New Babbage）',
    blurb: '外挂货箱的极致，4608 SCU 的运力，装卸和护航都需要规划。',
    fit: '组织大型贸易、有护航船队的商队。'
  },
  {
    id: 'reclaimer', name: 'Reclaimer', cn: '回收者', maker: 'Aegis Dynamics',
    role: '回收', tags: ['工业'], size: 'CAP', crew: '4', cargo: 180,
    usd: 400, auec: 15126600, status: '可飞',
    scm: 130, max: 880, shield: '4×S3', hull: 160000,
    weapons: '2×S5 · 2×S3 炮塔', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '会走路的回收工厂，能把整艘残骸拆成材料，收益上限很高。',
    fit: '喜欢打捞玩法、能接受慢节奏和多人协作的玩家。'
  },
  {
    id: 'hammerhead', name: 'Hammerhead', cn: '锤头鲨', maker: 'Aegis Dynamics',
    role: '炮艇', tags: ['战斗'], size: 'CAP', crew: '6', cargo: 40,
    usd: 725, auec: 12734700, status: '可飞',
    scm: 145, max: 930, shield: '4×S3', hull: 180000,
    weapons: '6× 四联装 S4 炮塔', missiles: '—',
    buy: 'Astro Armada（Area18）· New Deal（Lorville）',
    blurb: '六座四联装炮塔的防空平台，专治各种不服的小船。',
    fit: '有固定船员、想体验多人炮塔协同的团队。'
  },
  {
    id: 'polaris', name: 'Polaris', cn: '北极星', maker: 'Roberts Space Industries',
    role: '护卫舰', tags: ['战斗', '多用途'], size: 'CAP', crew: '8', cargo: 216,
    usd: 975, auec: null, status: '可飞',
    scm: 150, max: 950, shield: '2×S3', hull: 220000,
    weapons: '1×S7 炮塔 · 4×S10 鱼雷', missiles: '—',
    buy: '活动 / 限时（官网）；游戏内暂无常规售卖',
    blurb: '带机库的轻型护卫舰，鱼雷齐射是它的名片。',
    fit: '有大型团队、想体验主力舰作战的玩家。'
  },
  {
    id: '890-jump', name: '890 Jump', cn: '890 跃迁', maker: 'Origin Jumpworks',
    role: '豪华游艇', tags: ['豪华', '多用途'], size: 'CAP', crew: '8', cargo: 96,
    usd: 950, auec: 32404500, status: '可飞',
    scm: 145, max: 940, shield: '3×S3', hull: 140000,
    weapons: '2×S5 · 2×S3 炮塔', missiles: '—',
    buy: 'Astro Armada（Area18）· Factory Line（New Babbage）',
    blurb: '顶级豪华游艇，泳池、酒吧、观景台应有尽有，战斗力只是附加项。',
    fit: '预算充足、想把星际公民玩成社交和观光游戏的玩家。'
  },
  {
    id: 'prospector', name: 'Prospector', cn: '勘探者', maker: 'MISC',
    role: '采矿', tags: ['工业'], size: 'S', crew: '1', cargo: 32,
    usd: 155, auec: 2113000, status: '可飞',
    scm: 160, max: 1000, shield: '1×S1', hull: 8000,
    weapons: '1×S1 采矿激光', missiles: '—',
    buy: 'New Deal（Lorville）· Factory Line（New Babbage）',
    blurb: '单人采矿的主力船，找矿、破碎、装袋一气呵成。',
    fit: '想稳定赚钱、喜欢安静玩法的独狼。'
  },
  {
    id: 'vulture', name: 'Vulture', cn: '秃鹫', maker: 'Drake Interplanetary',
    role: '回收', tags: ['工业'], size: 'S', crew: '1', cargo: 12,
    usd: 175, auec: 2649000, status: '可飞',
    scm: 165, max: 1020, shield: '2×S1', hull: 10000,
    weapons: '2×S1 回收光束', missiles: '—',
    buy: 'New Deal（Lorville）· Astro Armada（Area18）',
    blurb: '单人打捞船，剥船壳、收材料，是低风险赚钱的好路子。',
    fit: '想稳定刷钱、又不想卷入战斗的玩家。'
  },
  {
    id: 'mole', name: 'MOLE', cn: '鼹鼠', maker: 'Argo Astronautics',
    role: '多人采矿', tags: ['工业'], size: 'M', crew: '3', cargo: 64,
    usd: 315, auec: 5548000, status: '可飞',
    scm: 155, max: 980, shield: '2×S2', hull: 30000,
    weapons: '3×S2 采矿激光', missiles: '—',
    buy: 'New Deal（Lorville）',
    blurb: '三人三激光的采矿平台，分工协作时效率远超单人船。',
    fit: '有固定采矿小队、想提高产量的玩家。'
  },
  {
    id: 'srv', name: 'SRV', cn: 'SRV', maker: 'Argo Astronautics',
    role: '拖船', tags: ['工业', '支援'], size: 'M', crew: '1', cargo: 0,
    usd: 165, auec: 2800000, status: '可飞',
    scm: 165, max: 1020, shield: '2×S2', hull: 20000,
    weapons: '牵引光束', missiles: '—',
    buy: 'New Deal（Lorville）',
    blurb: '专业拖船，能把抛锚或被打瘫的船拖回站里。',
    fit: '喜欢后勤、救援和团队支援玩法的玩家。'
  },

  /* ---------------- 地面载具 ---------------- */
  {
    id: 'ursa', name: 'Ursa Rover', cn: '熊座', maker: 'Roberts Space Industries',
    role: '地面载具', tags: ['地面', '多用途'], size: 'GND', crew: '2', cargo: 4,
    usd: 50, auec: 105000, status: '可飞',
    scm: null, max: 30, shield: '—', hull: 6000,
    weapons: '1×S1 车顶炮塔', missiles: '—',
    buy: 'New Deal（Lorville）· Astro Armada（Area18）',
    blurb: '经典六轮漫游车，能坐能装，适合地表探索和运送队友。',
    fit: '需要一辆可靠地表车的探索或货运玩家。'
  },
  {
    id: 'cyclone', name: 'Cyclone', cn: '旋风', maker: 'Tumbril Land Systems',
    role: '地面载具', tags: ['地面'], size: 'GND', crew: '2', cargo: 0,
    usd: 55, auec: 76000, status: '可飞',
    scm: null, max: 40, shield: '—', hull: 2500,
    weapons: '可选 S1 武器站', missiles: '—',
    buy: 'New Deal（Lorville）',
    blurb: '轻便的越野车，速度快、好装船，适合侦察和代步。',
    fit: '需要一辆能塞进小船的地表代步车。'
  },
  {
    id: 'roc', name: 'ROC', cn: 'ROC', maker: 'Greycat Industrial',
    role: '地面采矿', tags: ['地面', '工业'], size: 'GND', crew: '1', cargo: 0,
    usd: 55, auec: 172000, status: '可飞',
    scm: null, max: 25, shield: '—', hull: 1500,
    weapons: '采矿臂', missiles: '—',
    buy: 'New Deal（Lorville）',
    blurb: '单人地面采矿车，配合小船就能开始低成本挖矿。',
    fit: '想用最低成本体验采矿的萌新。'
  },
  {
    id: 'nova', name: 'Nova', cn: '新星', maker: 'Aegis Dynamics',
    role: '主战坦克', tags: ['地面', '战斗'], size: 'GND', crew: '3', cargo: 0,
    usd: 120, auec: 1700000, status: '可飞',
    scm: null, max: 20, shield: '—', hull: 25000,
    weapons: '1×S5 主炮 · 车顶机枪', missiles: '—',
    buy: 'New Deal（Lorville）· Astro Armada（Area18）',
    blurb: '重装甲主战坦克，正面交战很硬，但需要运输船投送。',
    fit: '喜欢地面 PvP 或大规模行动的玩家。'
  },
  {
    id: 'ballista', name: 'Ballista', cn: '弩炮', maker: 'Anvil Aerospace',
    role: '防空车', tags: ['地面', '战斗', '支援'], size: 'GND', crew: '3', cargo: 0,
    usd: 140, auec: 1500000, status: '可飞',
    scm: null, max: 25, shield: '—', hull: 12000,
    weapons: '4×S5 防空导弹', missiles: '—',
    buy: 'Anvil / 活动 · New Deal（Lorville）',
    blurb: '地面防空平台，专门对付低空飞行的目标和运输机。',
    fit: '负责地面防空、保护队友的战术玩家。'
  },
  {
    id: 'dragonfly', name: 'Dragonfly', cn: '蜻蜓', maker: 'Drake Interplanetary',
    role: '悬浮摩托', tags: ['地面', '多用途'], size: 'GND', crew: '2', cargo: 0,
    usd: 40, auec: 63000, status: '可飞',
    scm: null, max: 60, shield: '—', hull: 1200,
    weapons: '2×S1', missiles: '—',
    buy: 'New Deal（Lorville）· Astro Armada（Area18）',
    blurb: '可折叠的双人悬浮摩托，塞进货舱就能带走。',
    fit: '需要地表代步、或想玩“车载突袭”的玩家。'
  },
  {
    id: 'nox', name: 'Nox', cn: '诺克斯', maker: 'Aopoa',
    role: '悬浮摩托', tags: ['地面', '竞速'], size: 'GND', crew: '1', cargo: 0,
    usd: 45, auec: 63000, status: '可飞',
    scm: null, max: 65, shield: '—', hull: 1000,
    weapons: '2×S1', missiles: '—',
    buy: '活动 / 限时（官网）· Astro Armada（Area18）',
    blurb: '外星悬浮摩托，速度极快，操控需要一点适应期。',
    fit: '喜欢竞速和低空贴地飞行的玩家。'
  },
  {
    id: 'pulse', name: 'Pulse', cn: '脉冲', maker: 'Mirai',
    role: '悬浮摩托', tags: ['地面', '多用途'], size: 'GND', crew: '1', cargo: 0,
    usd: 30, auec: 87500, status: '可飞',
    scm: null, max: 70, shield: '—', hull: 900,
    weapons: '—', missiles: '—',
    buy: 'Astro Armada（Area18）· Orison 展厅（Crusader）',
    blurb: '便宜好用的单人悬浮车，适合从着陆点溜达到任务点。',
    fit: '想省下跑路时间、预算有限的地表玩家。'
  },
  {
    id: 'storm', name: 'Storm', cn: '风暴', maker: 'Anvil Aerospace',
    role: '防空车', tags: ['地面', '战斗', '支援'], size: 'GND', crew: '2', cargo: 0,
    usd: 90, auec: 1200000, status: '可飞',
    scm: null, max: 35, shield: '—', hull: 8000,
    weapons: '4×S3 防空导弹', missiles: '—',
    buy: 'Anvil / 活动 · New Deal（Lorville）',
    blurb: '轻量化防空车，比弩炮更便宜灵活，适合快速部署。',
    fit: '想低成本体验地面防空的玩家。'
  },

  /* ---------------- 限时 ---------------- */
  {
    id: 'f8c-lightning', name: 'F8C Lightning', cn: 'F8C 闪电', maker: 'Anvil Aerospace',
    role: '重型战斗', tags: ['战斗'], size: 'S', crew: '1', cargo: 0,
    usd: 300, auec: null, status: '限时',
    scm: 210, max: 1200, shield: '2×S2', hull: 14000,
    weapons: '6×S3 · 2×S2', missiles: '—',
    buy: '限时活动 / 官网；游戏内无常规售卖',
    blurb: 'UEE 精英舰载机，火力与生存性都远超普通轻型战机。',
    fit: '参与限时活动、追求稀有战斗机的玩家。'
  },

  /* ---------------- 概念船 ---------------- */
  {
    id: 'merchantman', name: 'Banu Merchantman', cn: '巴努商人', maker: 'Banu',
    role: '重型货船', tags: ['货运', '多用途'], size: 'CAP', crew: '4', cargo: 2880,
    usd: 650, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '规划中', missiles: '—',
    buy: '官网概念销售 / 限时活动',
    blurb: '巴努人的移动市场，既是货船也是交易站，概念阶段就人气极高。',
    fit: '喜欢异星文化、想做移动贸易的玩家。'
  },
  {
    id: 'perseus', name: 'Perseus', cn: '珀尔修斯', maker: 'Roberts Space Industries',
    role: '重型炮舰', tags: ['战斗'], size: 'L', crew: '6', cargo: 96,
    usd: 800, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '2×S7 主炮 · 鱼雷', missiles: '—',
    buy: '官网概念销售 / 限时活动',
    blurb: '双 S7 主炮的中型炮舰，设计目标是“以舰制舰”。',
    fit: '有组织、想参与舰队战的玩家。'
  },
  {
    id: 'galaxy', name: 'Galaxy', cn: '银河', maker: 'Roberts Space Industries',
    role: '模块化多用途', tags: ['多用途'], size: 'L', crew: '6', cargo: 64,
    usd: 380, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '规划中', missiles: '—',
    buy: '官网概念销售 / 限时活动',
    blurb: '可更换任务模块的大型多用途舰，货运、医疗、精炼一船搞定。',
    fit: '喜欢一船多用、长期规划的玩家。'
  },
  {
    id: 'odyssey', name: 'Odyssey', cn: '奥德赛', maker: 'MISC',
    role: '探索', tags: ['探索'], size: 'L', crew: '6', cargo: 200,
    usd: 700, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '规划中', missiles: '—',
    buy: '官网概念销售 / 限时活动',
    blurb: '为超长航程设计的探索舰，自带精炼与燃料采集能力。',
    fit: '梦想进行深空远征的探索玩家。'
  },
  {
    id: 'orion', name: 'Orion', cn: '猎户座', maker: 'Roberts Space Industries',
    role: '重型采矿', tags: ['工业'], size: 'CAP', crew: '4', cargo: 384,
    usd: 650, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '规划中', missiles: '—',
    buy: '官网概念销售 / 限时活动',
    blurb: '工业级采矿平台，目标是把整颗小行星拆成可精炼的矿石。',
    fit: '想组织大型采矿作业的工业玩家。'
  },
  {
    id: 'crucible', name: 'Crucible', cn: '坩埚', maker: 'Anvil Aerospace',
    role: '维修', tags: ['支援'], size: 'L', crew: '4', cargo: 0,
    usd: 350, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '规划中', missiles: '—',
    buy: '官网概念销售 / 限时活动',
    blurb: '带维修臂与机库的移动船坞，是舰队后勤的核心。',
    fit: '喜欢后勤支援、有固定团队的玩家。'
  },
  {
    id: 'apollo-triage', name: 'Apollo Triage', cn: '阿波罗 分诊', maker: 'Roberts Space Industries',
    role: '医疗', tags: ['支援'], size: 'M', crew: '3', cargo: 0,
    usd: 260, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '规划中', missiles: '—',
    buy: '官网概念销售 / 限时活动',
    blurb: '专业医疗船，多张医疗床加快速响应能力，是救援队的核心。',
    fit: '热衷医疗救援玩法的玩家。'
  },
  {
    id: 'vulcan', name: 'Vulcan', cn: '火神', maker: 'Aegis Dynamics',
    role: '支援', tags: ['支援'], size: 'M', crew: '3', cargo: 12,
    usd: 200, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '规划中', missiles: '—',
    buy: '官网概念销售 / 限时活动',
    blurb: '集补给、维修、加油于一体的支援船，舰队出勤的奶妈。',
    fit: '喜欢服务团队、赚“辛苦费”的玩家。'
  },
  {
    id: 'liberator', name: 'Liberator', cn: '解放者', maker: 'Anvil Aerospace',
    role: '轻型航母', tags: ['支援', '货运'], size: 'L', crew: '2', cargo: 400,
    usd: 575, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '规划中', missiles: '—',
    buy: '官网概念销售 / 限时活动',
    blurb: '能搭载多艘小船的轻型航母，是移动机库与前线基地。',
    fit: '拥有多艘小船、喜欢组建飞行队的玩家。'
  },
  {
    id: 'nautilus', name: 'Nautilus', cn: '鹦鹉螺', maker: 'Aegis Dynamics',
    role: '布雷舰', tags: ['战斗', '支援'], size: 'L', crew: '4', cargo: 0,
    usd: 725, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '水雷 / 反舰雷', missiles: '—',
    buy: '官网概念销售 / 限时活动',
    blurb: '专业布雷舰，能在关键航道布置雷场，改变战场地形。',
    fit: '喜欢战术布局和舰队战的玩家。'
  },
  {
    id: 'genesis', name: 'Genesis Starliner', cn: '创世纪 星际客机', maker: 'Crusader Industries',
    role: '客运', tags: ['支援'], size: 'L', crew: '6', cargo: 0,
    usd: 400, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '规划中', missiles: '—',
    buy: '官网概念销售 / 限时活动',
    blurb: '大型客运船，把 NPC 与玩家从 A 点舒适地送到 B 点。',
    fit: '想经营航线、体验民用航空的玩家。'
  },
  {
    id: 'idris-p', name: 'Idris-P', cn: '伊德里斯 P', maker: 'Aegis Dynamics',
    role: '护卫舰', tags: ['战斗'], size: 'CAP', crew: '10', cargo: 300,
    usd: 1900, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '主炮 · 多座炮塔 · 机库', missiles: '—',
    buy: '官网限量销售 / 活动',
    blurb: 'UEE 现役护卫舰的民用版，带机库与主炮，是舰队旗舰。',
    fit: '大型组织、舰队核心成员。'
  },
  {
    id: 'javelin', name: 'Javelin', cn: '标枪', maker: 'Aegis Dynamics',
    role: '驱逐舰', tags: ['战斗'], size: 'CAP', crew: '20', cargo: 500,
    usd: 3000, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '重型炮塔 · 鱼雷 · 机库', missiles: '—',
    buy: '官网限量销售 / 活动',
    blurb: '驱逐舰级主力舰，需要整支团队才能开动，是身份与组织力的象征。',
    fit: '大型舰队与公会。'
  },
  {
    id: 'kraken', name: 'Kraken', cn: '海妖', maker: 'Drake Interplanetary',
    role: '航母', tags: ['货运', '支援', '战斗'], size: 'CAP', crew: '10', cargo: 3792,
    usd: 1650, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '规划中', missiles: '—',
    buy: '官网限量销售 / 活动',
    blurb: '德雷克的民用航母，甲板能停多艘小船，货舱也大得离谱。',
    fit: '想要移动基地与舰载机平台的团队。'
  },
  {
    id: 'starlancer-tac', name: 'Starlancer TAC', cn: 'Starlancer TAC', maker: 'MISC',
    role: '战斗运输', tags: ['战斗', '货运'], size: 'L', crew: '4', cargo: 168,
    usd: 375, auec: null, status: '概念',
    scm: null, max: null, shield: '规划中', hull: null,
    weapons: '规划中', missiles: '—',
    buy: '官网概念销售 / 限时活动',
    blurb: 'Starlancer 的武装运输型，兼顾货舱、载员与火力。',
    fit: '需要在高危区域运货或投送人员的团队。'
  }
];

/* 供页面使用的派生数据 */
SC.roles = ['战斗', '货运', '多用途', '探索', '工业', '支援', '竞速', '地面'];
SC.sizes = { S: '小型', M: '中型', L: '大型', CAP: '主力舰', GND: '地面' };
SC.statuses = ['可飞', '限时', '概念'];

SC.shipById = function (id) {
  return SC.ships.find(function (s) { return s.id === id; });
};

SC.fmtNumber = function (n) {
  return n == null ? '—' : Number(n).toLocaleString('en-US');
};

SC.fmtUSD = function (n) {
  if (n == null) return '—';
  return '$' + Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

SC.fmtAuec = function (n) {
  return n == null ? '—' : Number(n).toLocaleString('en-US') + ' aUEC';
};
