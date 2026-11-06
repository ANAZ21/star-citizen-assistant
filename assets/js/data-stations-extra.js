/* =========================================================
   MOBIGLAS · 派罗空间站补充
   ---------------------------------------------------------
   数据源：Star Citizen Wiki「Pyro system」及各站点页面，
   游戏版本 Alpha 4.10.2。只追加地点，不修改 data-locations.js。
   ========================================================= */

(function () {
  if (!window.SC || !Array.isArray(SC.locations)) return;
  var rows = [
    {
      id: 'patch-city', system: 'pyro', name: 'Patch City', cn: '补丁城', type: 'station', parent: 'Bloom',
      mapX: 640, mapY: 390, danger: 4, services: ['补给维修', '医疗', '任务'],
      desc: '补丁城是 Rough & Ready 控制的 L3 空间站，位于盛放星轨道附近，为经过派罗 III 的船只提供补给、医疗和维修。',
      tips: '站内由 Rough & Ready 控制，交易前确认对方身份。',
      howTo: '前往盛放星 L3 拉格朗日点，停靠补丁城。'
    },
    {
      id: 'gaslight', system: 'pyro', name: 'Gaslight', cn: '煤气灯空间站', type: 'station', parent: 'Fuego',
      mapX: 600, mapY: 330, danger: 4, services: ['补给维修', '医疗', '任务'],
      desc: '煤气灯空间站位于派罗 V 的 L2 拉格朗日点，由 Rough & Ready 控制，是派罗 V 航线上的补给与医疗节点。',
      tips: '派罗 V 附近航线复杂，进站前留意敌对船只。',
      howTo: '前往派罗 V 的 L2 拉格朗日点，停靠煤气灯空间站。'
    },
    {
      id: 'rats-nest', system: 'pyro', name: "Rat's Nest", cn: '鼠巢空间站', type: 'station', parent: 'Fuego',
      mapX: 565, mapY: 430, danger: 4, services: [],
      desc: '鼠巢空间站位于派罗 V 的 L5 拉格朗日点，由 Rough & Ready 控制。站点信息有限，进入前应自行确认补给条件。',
      tips: '该站点公开服务记录很少，建议携带补给后再前往。',
      howTo: '前往派罗 V 的 L5 拉格朗日点，停靠鼠巢空间站。'
    },
    {
      id: 'endgame', system: 'pyro', name: 'Endgame', cn: '终局空间站', type: 'station', parent: 'Terminus',
      mapX: 430, mapY: 650, danger: 4, services: ['补给维修', '医疗', '任务'],
      desc: '终局空间站位于终点星的 L3 拉格朗日点，由 Rough & Ready 控制，提供维修、补给和基础医疗服务。',
      tips: '终点星附近太阳活动频繁，注意航行安全。',
      howTo: '前往终点星的 L3 拉格朗日点，停靠终局空间站。'
    },
    {
      id: 'megumi-refueling', system: 'pyro', name: 'Megumi Refueling', cn: '恩惠加油站', type: 'station', parent: 'Terminus',
      mapX: 390, mapY: 610, danger: 4, services: ['补给维修'],
      desc: '恩惠加油站位于终点星的 L5 拉格朗日点，是派罗少数专门提供燃料补给的站点之一，由 Rough & Ready 控制。',
      tips: '派罗补给点稀少，离开前确认燃料已补满。',
      howTo: '前往终点星的 L5 拉格朗日点，停靠恩惠加油站。'
    },
    {
      id: 'rods-fuel', system: 'pyro', name: "Rod's Fuel 'N Supplies", cn: '路德补给站', type: 'station', parent: 'Fuego',
      mapX: 700, mapY: 420, danger: 4, services: ['补给维修', '医疗'],
      desc: '路德补给站位于派罗 V 的 L4 拉格朗日点，由 Citizens for Prosperity 运营，提供燃料、补给和基础医疗。',
      tips: '站点服务以燃料和补给为主，深空航行前值得停靠。',
      howTo: '前往派罗 V 的 L4 拉格朗日点，停靠路德补给站。'
    },
    {
      id: 'dudley-daughters', system: 'pyro', name: 'Dudley & Daughters', cn: '达德利父女空间站', type: 'station', parent: 'Terminus',
      mapX: 460, mapY: 560, danger: 3, services: ['补给维修', '医疗'],
      desc: '达德利父女空间站位于终点星的 L4 拉格朗日点，由 Citizens for Prosperity 运营，提供停靠、维修和基础医疗。',
      tips: '相对温和的停靠点，适合在派罗外缘整理补给。',
      howTo: '前往终点星的 L4 拉格朗日点，停靠达德利父女空间站。'
    },
    {
      id: 'stanton-gateway-pyro', system: 'pyro', name: 'Stanton Gateway', cn: '斯坦顿星门（派罗侧）', type: 'station', parent: 'Pyro',
      mapX: 850, mapY: 180, danger: 3, services: ['补给维修', '医疗', '任务'],
      desc: '斯坦顿星门位于派罗一侧的派罗—斯坦顿跳跃点附近，是往返两系的出入境节点，设有行政、货运、医疗和维修设施。',
      tips: '跳跃点附近有星云和残骸，接近时降低速度。',
      howTo: '前往派罗—斯坦顿跳跃点，停靠斯坦顿星门。'
    },
    {
      id: 'nyx-gateway-pyro', system: 'pyro', name: 'Nyx Gateway', cn: '尼克斯星门（派罗侧）', type: 'station', parent: 'Pyro',
      mapX: 340, mapY: 220, danger: 3, services: ['补给维修', '医疗', '任务'],
      desc: '尼克斯星门位于派罗—尼克斯跳跃点附近，是连接派罗与尼克斯的出入境站点，设有货运、精炼、医疗和维修设施。',
      tips: '跨境航线较长，出发前确认燃料和补给。',
      howTo: '前往派罗—尼克斯跳跃点，停靠尼克斯星门。'
    }
  ];
  rows.forEach(function (row) { SC.locations.push(row); });

  if (window.SC_I18N) {
    SC_I18N.locations = SC_I18N.locations || {};
    rows.forEach(function (row) { SC_I18N.locations[row.id] = row.cn; });
  }
  if (window.SC_LOCATION_MEDIA) {
    rows.forEach(function (row) {
      SC_LOCATION_MEDIA[row.id] = { card: 'assets/img/locations/' + row.id + '.webp', source: 'https://starcitizen.tools', page: row.name, fallback: false };
    });
    SC_LOCATION_MEDIA.orbituary = {
      card: 'assets/img/locations/orbituary.webp',
      source: 'https://starcitizen.tools/File:Pyro_-_Orbituary_space_station.png',
      page: 'Orbituary',
      fallback: false
    };
  }
})();
