/* =========================================================
   MOBIGLAS · 星系与地点数据库
   ---------------------------------------------------------
   type: planet / moon / landing / station / poi / jump
   danger: 0 安全 · 1 低风险 · 2 中风险 · 3 高风险 · 4 极高风险
   mapX / mapY: 航图坐标（viewBox 1200 × 700）
   ========================================================= */

window.SC = window.SC || {};

SC.typeLabels = {
  planet: '行星',
  moon: '卫星',
  landing: '着陆区',
  station: '空间站',
  poi: '兴趣点',
  jump: '跳跃点'
};

SC.dangerLabels = ['安全', '低风险', '中风险', '高风险', '极高风险'];
SC.dangerColors = ['#57e0a2', '#63d8ff', '#ffb45a', '#ff8a5a', '#ff5f6d'];

SC.systems = [
  {
    id: 'stanton',
    name: '斯坦顿',
    en: 'STANTON',
    star: 'G 型主序星',
    security: '高 · UEE 管辖',
    planets: 4,
    moons: 12,
    desc: 'UEE 的核心星系之一，四颗行星分别由巨型企业掌控。治安相对稳定、设施齐全，是绝大多数玩家开始星际公民的地方。',
    orbits: [195, 250, 310, 390],
    starPos: { x: 600, y: 350 },
    mapNote: 'STANTON // 4 PLANETS',
    jump: '派罗（已开放）· 泰拉等（未开放）'
  },
  {
    id: 'pyro',
    name: '派罗',
    en: 'PYRO',
    star: '暗弱恒星',
    security: '无 · 帮派控制',
    planets: 6,
    moons: 0,
    desc: '被 UEE 放弃的边境星系，六颗行星、零法律、帮派与走私者横行。资源与风险都极高，不建议新手单独前往。',
    orbits: [70, 110, 160, 190, 230, 280],
    starPos: { x: 600, y: 350 },
    mapNote: 'PYRO // 6 PLANETS',
    jump: '斯坦顿（已开放）'
  }
];

SC.locations = [
  /* ================= STANTON ================= */
  {
    id: 'hurston', system: 'stanton', name: 'Hurston', cn: '赫斯顿', type: 'planet', parent: '斯坦顿',
    mapX: 430, mapY: 255, mapR: 16, danger: 2, services: [],
    desc: '赫斯顿动力公司把整颗星球变成工业基地，地表常年被污染与雾霾笼罩。首府 Lorville 是打工人与商人的聚集地。',
    tips: '大气有毒，离开着陆区前检查氧气与防护；轨道站 Everus Harbor 是更安全的落脚点。',
    howTo: '从 Everus Harbor 量子航行至 Lorville，跟随 Teasa 太空港的降落指引。'
  },
  {
    id: 'crusader', system: 'stanton', name: 'Crusader', cn: '十字军', type: 'planet', parent: '斯坦顿',
    mapX: 790, mapY: 200, mapR: 21, danger: 1, services: [],
    desc: '气态巨行星，云层上方漂浮着云城 Orison。这里也是 Crusader Industries 的造船基地，风景在斯坦顿数一数二。',
    tips: 'Orison 的平台之间靠缆车移动，第一次来预留时间；Yela 一带常有走私与 PvP。',
    howTo: '直接量子航行至 Orison，进入云层后按塔台指引降落在 August Dunlow 太空港。'
  },
  {
    id: 'arccorp', system: 'stanton', name: 'ArcCorp', cn: '弧光星', type: 'planet', parent: '斯坦顿',
    mapX: 880, mapY: 485, mapR: 17, danger: 1, services: [],
    desc: '整颗星球几乎被城市覆盖，Area18 是斯坦顿最亮的霓虹区。企业总部、船店与黑市在这里共存。',
    tips: 'Area18 玩家密度高，注意别在禁飞区乱开火；Astro Armada 是主要船店。',
    howTo: '从 Baijini Point 量子航行至 Area18，降落后乘电梯进入广场。'
  },
  {
    id: 'microtech', system: 'stanton', name: 'microTech', cn: '微科', type: 'planet', parent: '斯坦顿',
    mapX: 285, mapY: 570, mapR: 16, danger: 2, services: [],
    desc: 'microTech 的私有星球，低温、雪山与高科技园区并存。New Babbage 是它的首府与研发中心。',
    tips: '地表寒冷，准备保暖装备；Ghost Hollow 附近有敌对 NPC，别空手过去。',
    howTo: '从 Port Tressler 量子航行至 New Babbage，降落在星际太空港。'
  },

  /* ---------- Landing zones ---------- */
  {
    id: 'lorville', system: 'stanton', name: 'Lorville', cn: '洛维尔', type: 'landing', parent: 'Hurston',
    mapX: 430, mapY: 306, danger: 2,
    services: ['船舶商店', '装备店', '医疗', '任务', '餐饮'],
    desc: '赫斯顿的首府，典型的公司城：中央商务区灯火通明，工人区灰暗拥挤。地铁连接太空港与市区。',
    tips: '雾霾会影响能见度；市中心有船店与装备店，补给方便。',
    howTo: '降落在 Teasa 太空港，乘地铁进入 Lorville 市区。'
  },
  {
    id: 'orison', system: 'stanton', name: 'Orison', cn: '奥里森', type: 'landing', parent: 'Crusader',
    mapX: 790, mapY: 252, danger: 1,
    services: ['船舶商店', '装备店', '医疗', '任务', '观光'],
    desc: '漂浮在十字军云层上的度假城市，平台、花园与缆车组成了独特的立体都市。',
    tips: '记得坐一次城市缆车看风景；Orison 展厅可以买 Crusader 的船。',
    howTo: '降落在 August Dunlow 太空港，乘电梯与缆车前往各平台。'
  },
  {
    id: 'area18', system: 'stanton', name: 'Area18', cn: '区域 18', type: 'landing', parent: 'ArcCorp',
    mapX: 880, mapY: 532, danger: 1,
    services: ['船舶商店', '装备店', '医疗', '任务', '夜生活'],
    desc: '弧光星的门面城市，霓虹、广告牌与高密度人流是它的标签。Astro Armada 船店就在市中心。',
    tips: '夜间人多，注意帧数；地铁可以快速往返太空港与广场。',
    howTo: '降落在 Riker Memorial 太空港，乘电梯下到 Area18 主广场。'
  },
  {
    id: 'new-babbage', system: 'stanton', name: 'New Babbage', cn: '新巴贝奇', type: 'landing', parent: 'microTech',
    mapX: 285, mapY: 615, danger: 1,
    services: ['船舶商店', '装备店', '医疗', '任务', '科技展馆'],
    desc: '微科的首府，一座建在雪原上的科技都市。穹顶、轨道列车与新巴贝奇太空港是它的名片。',
    tips: '城市很大，第一次来容易迷路；Factory Line 船店在市区。',
    howTo: '降落在 New Babbage 星际太空港，乘列车进入市区。'
  },

  /* ---------- Moons ---------- */
  {
    id: 'arial', system: 'stanton', name: 'Arial', cn: '阿里尔', type: 'moon', parent: 'Hurston',
    mapX: 390, mapY: 235, danger: 2, services: [],
    desc: '赫斯顿的岩石卫星，地表荒芜，分布着矿点与小型前哨。',
    tips: '低空飞行注意地形起伏，矿点附近常有 NPC 活动。',
    howTo: '从 Hurston 轨道量子航行至 Arial，选择前哨或野地降落。'
  },
  {
    id: 'aberdeen', system: 'stanton', name: 'Aberdeen', cn: '阿伯丁', type: 'moon', parent: 'Hurston',
    mapX: 420, mapY: 289, danger: 3, services: [],
    desc: '拥有浓厚有毒大气，地表昏暗压抑，是赫斯顿的工业采掘区之一。',
    tips: '必须带好防护装备，能见度低，不建议新手单独前往。',
    howTo: '从 Hurston 轨道量子航行至 Aberdeen，优先选择有停机坪的前哨。'
  },
  {
    id: 'magda', system: 'stanton', name: 'Magda', cn: '玛格达', type: 'moon', parent: 'Hurston',
    mapX: 455, mapY: 222, danger: 2, services: [],
    desc: '冰封卫星，地表覆盖着冰层，科研与前哨设施零星分布。',
    tips: '地表湿滑，载具容易打滑；夜间温度极低。',
    howTo: '从 Hurston 轨道量子航行至 Magda。'
  },
  {
    id: 'ita', system: 'stanton', name: 'Ita', cn: '伊塔', type: 'moon', parent: 'Hurston',
    mapX: 480, mapY: 290, danger: 2, services: [],
    desc: '岩石与冰混合的卫星，矿点不少，环境比 Aberdeen 温和。',
    tips: '适合练手地面采矿，注意避开帮派前哨。',
    howTo: '从 Hurston 轨道量子航行至 Ita。'
  },
  {
    id: 'daymar', system: 'stanton', name: 'Daymar', cn: '戴玛', type: 'moon', parent: 'Crusader',
    mapX: 735, mapY: 172, danger: 2, services: [],
    desc: '十字军的沙漠卫星，视野开阔，是 ROC 地面采矿的热门地点。',
    tips: '白天高温、夜间寒冷；带好补给，矿点之间距离不近。',
    howTo: '从 Crusader 轨道量子航行至 Daymar，在矿点附近降落。'
  },
  {
    id: 'yela', system: 'stanton', name: 'Yela', cn: '耶拉', type: 'moon', parent: 'Crusader',
    mapX: 812, mapY: 158, danger: 3, services: [],
    desc: '冰封与碎石带环绕的卫星，Grim HEX 和 Jumptown 都在这里，法外气息浓厚。',
    tips: '这里常年有 PvP 与走私活动，单独行动前先看雷达。',
    howTo: '从 Crusader 轨道量子航行至 Yela，Grim HEX 位于小行星带内。'
  },
  {
    id: 'cellin', system: 'stanton', name: 'Cellin', cn: '赛林', type: 'moon', parent: 'Crusader',
    mapX: 838, mapY: 218, danger: 2, services: [],
    desc: '岩石卫星，地表遍布矿点与前哨，适合地面采矿和打捞。',
    tips: '部分区域有敌对 NPC，采矿时留一艘船在附近待命。',
    howTo: '从 Crusader 轨道量子航行至 Cellin。'
  },
  {
    id: 'lyria', system: 'stanton', name: 'Lyria', cn: '莱里亚', type: 'moon', parent: 'ArcCorp',
    mapX: 917, mapY: 516, danger: 2, services: [],
    desc: '冰封卫星，地形起伏大，是新手 ROC 采矿的经典去处。',
    tips: '地表裂缝多，驾驶 ROC 时慢一点；带好备用补给。',
    howTo: '从 ArcCorp 轨道量子航行至 Lyria，在矿点附近降落。'
  },
  {
    id: 'wala', system: 'stanton', name: 'Wala', cn: '瓦拉', type: 'moon', parent: 'ArcCorp',
    mapX: 838, mapY: 520, danger: 1, services: [],
    desc: '拥有浅海与岛屿的卫星，环境相对温和，适合观光与低风险任务。',
    tips: '水面附近飞行高度低，注意别一头扎进海里。',
    howTo: '从 ArcCorp 轨道量子航行至 Wala。'
  },
  {
    id: 'calliope', system: 'stanton', name: 'Calliope', cn: '卡利俄佩', type: 'moon', parent: 'microTech',
    mapX: 253, mapY: 600, danger: 2, services: [],
    desc: '地形多样的卫星，森林、苔原与矿点交错，前哨分布较散。',
    tips: '前哨之间距离远，出发前加满油。',
    howTo: '从 microTech 轨道量子航行至 Calliope。'
  },
  {
    id: 'clio', system: 'stanton', name: 'Clio', cn: '克利俄', type: 'moon', parent: 'microTech',
    mapX: 325, mapY: 650, danger: 2, services: [],
    desc: '冰封卫星，雪原与冰谷广布，适合安静的探索与采集。',
    tips: '能见度受天气影响大，建议白天行动。',
    howTo: '从 microTech 轨道量子航行至 Clio。'
  },
  {
    id: 'euterpe', system: 'stanton', name: 'Euterpe', cn: '欧忒耳佩', type: 'moon', parent: 'microTech',
    mapX: 235, mapY: 505, danger: 2, services: [],
    desc: '岩石卫星，分布着废弃回收场与小型前哨，是打捞玩家的常去地点。',
    tips: '回收场附近可能有敌对 NPC，建议两人以上前往。',
    howTo: '从 microTech 轨道量子航行至 Euterpe。'
  },

  /* ---------- Stations ---------- */
  {
    id: 'everus', system: 'stanton', name: 'Everus Harbor', cn: '埃弗勒斯港', type: 'station', parent: 'Hurston',
    mapX: 500, mapY: 305, danger: 1,
    services: ['补给维修', '医疗', '任务', '商店'],
    desc: '赫斯顿轨道上的大型补给站，医疗、维修、任务终端齐全，是 Lorville 之外最方便的落脚点。',
    tips: '去赫斯顿地表前，先在这里存船和补给。',
    howTo: '从 Lorville 起飞后量子航行至 Everus Harbor。'
  },
  {
    id: 'seraphim', system: 'stanton', name: 'Seraphim Station', cn: '炽天使站', type: 'station', parent: 'Crusader',
    mapX: 735, mapY: 245, danger: 1,
    services: ['补给维修', '医疗', '任务', '商店'],
    desc: '十字军轨道站，接替退役的 Port Olisar 成为区域枢纽。设施齐全，也是前往 Orison 的中转站。',
    tips: '这里人气很高，起降时注意避让；去 Yela 前可以在此补给。',
    howTo: '从 Crusader 轨道量子航行至 Seraphim Station。'
  },
  {
    id: 'baijini', system: 'stanton', name: 'Baijini Point', cn: '巴伊尼站', type: 'station', parent: 'ArcCorp',
    mapX: 925, mapY: 445, danger: 1,
    services: ['补给维修', '医疗', '任务', '商店'],
    desc: '弧光星轨道站，往返 Area18 的中转点，补给与任务设施完善。',
    tips: '去 Area18 前在这里接任务，落地后直接做。',
    howTo: '从 ArcCorp 轨道量子航行至 Baijini Point。'
  },
  {
    id: 'tressler', system: 'stanton', name: 'Port Tressler', cn: '特雷斯勒港', type: 'station', parent: 'microTech',
    mapX: 370, mapY: 492, danger: 1,
    services: ['补给维修', '医疗', '任务', '商店'],
    desc: '微科轨道站，前往 New Babbage 前的补给点，医疗与维修都有。',
    tips: '这里离 Ghost Hollow 不远，做战斗任务前先补满弹药。',
    howTo: '从 microTech 轨道量子航行至 Port Tressler。'
  },
  {
    id: 'grim-hex', system: 'stanton', name: 'Grim HEX', cn: '格林赫克斯', type: 'station', parent: 'Yela',
    mapX: 862, mapY: 146, danger: 3,
    services: ['黑市', '补给维修', '非法任务', '船舶商店'],
    desc: '建在 Yela 小行星带里的法外空间站，黑市、改装船和非法任务都在这儿。没有 UEE 执法，别轻易相信任何人。',
    tips: '犯罪等级高时这里更“方便”，但也被其他玩家盯着；停船后别把货舱敞着。',
    howTo: '量子航行至 Yela 附近，跟随 Grim HEX 的导航标记穿过小行星带。'
  },
  {
    id: 'kareah', system: 'stanton', name: 'Security Post Kareah', cn: '卡瑞亚安保站', type: 'station', parent: 'Crusader',
    mapX: 770, mapY: 462, danger: 3,
    services: ['安保站', '犯罪等级清除', '高风险'],
    desc: 'UEE 安保站，玩家可以在这里黑入终端清除犯罪等级。也正因如此，这里常年有 PvP 蹲守。',
    tips: '清犯罪等级前先在外部绕一圈，确认没有埋伏；带一个队友望风。',
    howTo: '从 Crusader 轨道量子航行至 Kareah，停靠后进入安保站。'
  },
  {
    id: 'pyro-gateway', system: 'stanton', name: 'Pyro Gateway', cn: '派罗之门', type: 'station', parent: 'Stanton',
    mapX: 1060, mapY: 205, danger: 2,
    services: ['补给维修', '医疗', '任务', '跳跃通行'],
    desc: '斯坦顿侧的跳跃点检查站，前往派罗前最后的补给点。站内有医疗与维修，但价格不算便宜。',
    tips: '跨星系前加满量子燃料；检查货舱里有没有不该带的东西。',
    howTo: '从斯坦顿任意轨道站量子航行至 Pyro Gateway，再飞向跳跃点。'
  },
  {
    id: 'terra-gateway', system: 'stanton', name: 'Terra Gateway', cn: '泰拉之门', type: 'station', parent: 'Stanton',
    mapX: 155, mapY: 620, danger: 1,
    services: ['补给维修', '跳跃点（未开放）'],
    desc: '泰拉跳跃点旁的空间站。通道目前未开放，站内仍提供基本补给。',
    tips: '这里适合拍照和看跳跃点奇观，不要指望能跳过去。',
    howTo: '从斯坦顿任意轨道站量子航行至 Terra Gateway。'
  },
  {
    id: 'lagrange', system: 'stanton', name: 'Lagrange Stations', cn: '拉格朗日站群', type: 'station', parent: 'Stanton',
    mapX: 620, mapY: 628, danger: 1,
    services: ['补给维修', '精炼', '货运', '任务'],
    desc: '分布在四颗行星拉格朗日点的补给站群，常见的有 HUR-L1、CRU-L1、ARC-L1、MIC-L1 等。适合加油、维修和接任务。',
    tips: '不同站点的服务和库存不一样，跑货运前先查一下。',
    howTo: '在星图里选择对应行星的 L1 站点，量子航行即可。'
  },
  {
    id: 'jumptown', system: 'stanton', name: 'Jumptown', cn: '跳镇', type: 'poi', parent: 'Yela',
    mapX: 830, mapY: 188, danger: 4,
    services: ['毒品交易', '战利品', 'PvP'],
    desc: 'Yela 上的废弃毒品实验室，活动期间会变成高价值物资争夺点。枪声一响，整片区域都会变成 PvP 战场。',
    tips: '不要单人裸奔过去；带好医疗、弹药和撤离路线。',
    howTo: '量子航行至 Yela 附近，跟随地表标记飞往实验室。'
  },
  {
    id: 'ghost-hollow', system: 'stanton', name: 'Ghost Hollow', cn: '幽灵谷', type: 'poi', parent: 'microTech',
    mapX: 365, mapY: 600, danger: 3,
    services: ['敌对 NPC', '战利品', '回收'],
    desc: 'microTech 的废弃配送中心，敌对 NPC 与战利品并存，适合小队清扫和回收。',
    tips: '先清外围再进建筑；带可回收工具能多赚一笔。',
    howTo: '从 Port Tressler 量子航行至 microTech 地表，跟随任务标记前往。'
  },
  {
    id: 'stanton-pyro-jump', system: 'stanton', name: 'Pyro Jump Point', cn: '派罗跳跃点', type: 'jump', parent: 'Stanton',
    mapX: 1150, mapY: 155, danger: 3, labelAnchor: 'end',
    services: ['跨星系跳跃'],
    desc: '斯坦顿通往派罗的跳跃点，目前唯一开放的跨星系通道。跳过去之前，确认燃料、补给和队友。',
    tips: '跳跃点附近是常见的伏击位置，进入前先扫雷达。',
    howTo: '从 Pyro Gateway 起飞，对准跳跃点加速并保持稳定。'
  },
  {
    id: 'stanton-terra-jump', system: 'stanton', name: 'Terra Jump Point', cn: '泰拉跳跃点', type: 'jump', parent: 'Stanton',
    mapX: 75, mapY: 665, danger: 0,
    services: ['跨星系跳跃（未开放）'],
    desc: '通往泰拉星系的跳跃点，目前处于未开放状态，只有导航标记与巡逻舰。',
    tips: '别在这里尝试卡 bug 穿模，容易被系统送回。',
    howTo: '从 Stanton 任意位置量子航行至跳跃点附近即可。'
  },

  /* ================= PYRO ================= */
  {
    id: 'pyro-i', system: 'pyro', name: 'Pyro I', cn: '派罗 I', type: 'planet', parent: '派罗',
    mapX: 555, mapY: 290, mapR: 11, danger: 3, services: [],
    desc: '派罗最内侧的行星，被恒星炙烤，无大气，熔岩裂缝与废弃设施交错。',
    tips: '地表温度极高，没有可靠补给点，快去快回。',
    howTo: '从 Checkmate 或 Starlight Service 量子航行至 Pyro I。'
  },
  {
    id: 'monox', system: 'pyro', name: 'Monox', cn: '莫诺克斯', type: 'planet', parent: '派罗',
    mapX: 665, mapY: 270, mapR: 13, danger: 3, services: [],
    desc: '锈红色的荒芜世界，大气有毒，能见度差。废弃矿站与帮派前哨散布地表。',
    tips: '带好防护装备；地表前哨可能有人蹲守。',
    howTo: '从派罗内圈站点量子航行至 Monox，选择前哨降落。'
  },
  {
    id: 'bloom', system: 'pyro', name: 'Bloom', cn: '布鲁姆', type: 'planet', parent: '派罗',
    mapX: 755, mapY: 350, mapR: 14, danger: 3, services: [],
    desc: '一次失败的地球化改造留下了苔原、酸湖与半废弃的研究站，是派罗少见的“有生机”的地方。',
    tips: '酸湖会腐蚀载具，别拿悬浮车去试。',
    howTo: '从派罗内圈站点量子航行至 Bloom。'
  },
  {
    id: 'fairo', system: 'pyro', name: 'Fairo', cn: '法伊罗', type: 'planet', parent: '派罗',
    mapX: 715, mapY: 485, mapR: 14, danger: 3, services: [],
    desc: '沙尘暴频繁的沙漠行星，废弃殖民地与残骸吸引着拾荒者。',
    tips: '沙尘暴会干扰视野和雷达，拾荒时留好撤离路线。',
    howTo: '从派罗中圈站点量子航行至 Fairo。'
  },
  {
    id: 'fuego', system: 'pyro', name: 'Fuego', cn: '富埃戈', type: 'planet', parent: '派罗',
    mapX: 445, mapY: 475, mapR: 22, danger: 3, services: [],
    desc: '带环的气态巨行星，轨道与环带中散布着空间站和残骸，是派罗的交通与交易枢纽。',
    tips: '环带里视野差、碰撞多，空间站附近注意 PvP。',
    howTo: '从派罗内圈站点量子航行至 Fuego，跟随空间站标记。'
  },
  {
    id: 'terminus', system: 'pyro', name: 'Terminus', cn: '终点星', type: 'planet', parent: '派罗',
    mapX: 340, mapY: 295, mapR: 14, danger: 4, services: [],
    desc: '派罗最外缘的冰封世界，补给困难、信号微弱，是深入边境前的最后一站。',
    tips: '外圈任务耗时长，带足燃料和医疗；一个人去等于给海盗送快递。',
    howTo: '从 Orbituary 或派罗外圈站点量子航行至 Terminus。'
  },
  {
    id: 'checkmate', system: 'pyro', name: 'Checkmate Station', cn: '将死站', type: 'station', parent: '派罗',
    mapX: 520, mapY: 425, danger: 4,
    services: ['黑市', '补给维修', '任务', '医疗（有限）'],
    desc: '派罗内圈的重要贸易站，由帮派控制。黑市、任务与补给都有，但价格和风险一样高。',
    tips: '不要在站内久留，交易完就走；注意同屏的其他玩家。',
    howTo: '从派罗内圈量子航行至 Checkmate Station。'
  },
  {
    id: 'ruin', system: 'pyro', name: 'Ruin Station', cn: '废墟站', type: 'station', parent: '派罗',
    mapX: 415, mapY: 505, danger: 4,
    services: ['黑市', '改装船', '非法任务', '补给维修'],
    desc: '藏在残骸与小行星之间的老空间站，改装船、黑市和见不得光的交易都在这里。',
    tips: '这里没有法律，只有价码；停靠前先确认没有尾随。',
    howTo: '量子航行至 Fuego 环带附近，跟随 Ruin Station 标记。'
  },
  {
    id: 'orbituary', system: 'pyro', name: 'Orbituary Station', cn: '讣告站', type: 'station', parent: '派罗',
    mapX: 300, mapY: 250, danger: 4,
    services: ['补给维修', '医疗（有限）', '任务'],
    desc: '派罗外圈的边陲站，医疗与补给有限，是深入外圈任务前的跳板。',
    tips: '外圈补给点很少，离开前把燃料和医疗补满。',
    howTo: '从派罗外圈量子航行至 Orbituary Station。'
  },
  {
    id: 'starlight', system: 'pyro', name: 'Starlight Service', cn: '星光服务站', type: 'station', parent: '派罗',
    mapX: 820, mapY: 430, danger: 3,
    services: ['补给维修', '任务', '商店'],
    desc: '派罗少见的“中立”服务站，提供补给、维修与任务。价格偏高，但至少不会一进门就被打。',
    tips: '适合作为派罗行动的临时基地；离开时注意是否有人跟跳。',
    howTo: '从派罗中圈量子航行至 Starlight Service。'
  },
  {
    id: 'pyro-outposts', system: 'pyro', name: 'Gang Outposts', cn: '帮派前哨', type: 'poi', parent: '派罗',
    mapX: 600, mapY: 560, danger: 4,
    services: ['敌对 NPC', '战利品', '回收'],
    desc: '派罗各行星表面的帮派前哨与废弃设施，通常有敌对 NPC、战利品和可回收物。',
    tips: '先侦察再落地；带好载具和撤离方案，别把船停在唯一出口。',
    howTo: '在派罗各行星地表跟随任务标记，选择前哨附近降落。'
  },
  {
    id: 'pyro-jump', system: 'pyro', name: 'Stanton Jump Point', cn: '斯坦顿跳跃点', type: 'jump', parent: '派罗',
    mapX: 1060, mapY: 180, danger: 3, labelAnchor: 'end',
    services: ['跨星系跳跃'],
    desc: '派罗返回斯坦顿的跳跃点。离开前确认没有被尾随，跳跃点附近是常见的伏击位置。',
    tips: '跳跃前先绕一圈，别在直线上给人当靶子。',
    howTo: '从派罗任意站点量子航行至跳跃点，对准后加速。'
  }
];

SC.futureSystems = [
  {
    name: '尼克斯 · Nyx',
    status: '开发中',
    desc: '小行星带中的边境星系，Levski 着陆区预计回归。具体上线时间以官方进度为准。'
  },
  {
    name: '泰拉 · Terra',
    status: '未开放',
    desc: 'UEE 的“花园世界”，地球化程度极高，是未来版本的标志性星系。'
  }
];

SC.systemById = function (id) {
  return SC.systems.find(function (s) { return s.id === id; });
};

SC.locationById = function (id) {
  return SC.locations.find(function (l) { return l.id === id; });
};

SC.locationsBySystem = function (systemId) {
  return SC.locations.filter(function (l) { return l.system === systemId; });
};
