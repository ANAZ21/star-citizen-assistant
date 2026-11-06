/* =========================================================
   MOBIGLAS · 尼克斯相关星门补充
   ---------------------------------------------------------
   Alpha 4.10.2。data-locations.js / data-nyx.js 保持原值，
   这里补齐三个跨星系星门站：斯坦顿侧尼克斯星门、尼克斯侧
   派罗星门与斯坦顿星门。商店数据由 data-shops-uex.js 提供。
   ========================================================= */

(function () {
  if (!window.SC || !Array.isArray(SC.locations)) return;

  var rows = [
    {
      id: 'stanton-nyx-jump', system: 'stanton', name: 'Nyx Jump Point', cn: '尼克斯跳跃点', type: 'jump', parent: 'Stanton',
      mapX: 620, mapY: 120, danger: 1,
      services: ['跨星系跳跃（未开放）'],
      desc: '斯坦顿通往尼克斯的跳跃点。通道开放后，这里是从斯坦顿进入尼克斯的主要入口。',
      tips: '跳跃点附近常有巡逻舰，保持航向稳定。',
      howTo: '从 Nyx Gateway 起飞，对准跳跃点加速。'
    },
    {
      id: 'pyro-nyx-jump', system: 'pyro', name: 'Nyx Jump Point', cn: '尼克斯跳跃点', type: 'jump', parent: 'Pyro',
      mapX: 300, mapY: 600, danger: 3,
      services: ['跨星系跳跃'],
      desc: '派罗通往尼克斯的跳跃点。周边没有统一治安，跳跃前后都可能遇到伏击。',
      tips: '跳跃前绕行侦察，不要在固定航线上停留。',
      howTo: '从 Nyx Gateway（派罗侧）起飞，对准跳跃点加速。'
    },
    {
      id: 'nyx-gateway', system: 'stanton', name: 'Nyx Gateway', cn: '尼克斯星门（斯坦顿侧）', type: 'station', parent: 'Stanton',
      mapX: 620, mapY: 120, danger: 1,
      services: ['补给维修', '医疗', '任务', '跳跃通行'],
      desc: '斯坦顿侧通往尼克斯的跳跃点检查站。设有加油、维修与租赁终端，是前往尼克斯前最后的整备点。',
      tips: '尼克斯治安复杂，出发前把燃料、弹药和补给一次补齐。',
      howTo: '从斯坦顿任意轨道站量子航行至 Nyx Gateway，再飞向跳跃点。'
    },
    {
      id: 'pyro-gateway-nyx', system: 'nyx', name: 'Pyro Gateway', cn: '派罗星门（尼克斯侧）', type: 'station', parent: 'Nyx',
      mapX: 250, mapY: 480, danger: 2,
      services: ['补给维修', '医疗', '租赁', '跳跃通行'],
      desc: '尼克斯侧通往派罗的星门站。派罗方向冲突频繁，站内提供基础补给与飞船租赁。',
      tips: '进入派罗前确认量子燃料与护盾状态，星门另一侧常有伏击。',
      howTo: '从列夫斯基或尼克斯任意站点量子航行至 Pyro Gateway (Nyx)。'
    },
    {
      id: 'stanton-gateway-nyx', system: 'nyx', name: 'Stanton Gateway', cn: '斯坦顿星门（尼克斯侧）', type: 'station', parent: 'Nyx',
      mapX: 950, mapY: 300, danger: 1,
      services: ['补给维修', '医疗', '租赁', '跳跃通行'],
      desc: '尼克斯侧通往斯坦顿的星门站，往返斯坦顿与尼克斯的主要中转点，设有飞船租赁终端。',
      tips: '回斯坦顿前在这里修船加油，斯坦顿侧的检查站更严格。',
      howTo: '从列夫斯基量子航行至 Stanton Gateway (Nyx)，再飞向跳跃点。'
    },
    {
      id: 'magnus-gateway', system: 'stanton', name: 'Magnus Gateway', cn: '马格努斯之门', type: 'station', parent: 'Stanton',
      mapX: 140, mapY: 180, danger: 1,
      services: ['补给维修', '医疗', '跳跃点（未开放）'],
      desc: '斯坦顿侧通往马格努斯星系的跳跃点检查站。通道目前未开放，站内仍有配件商店与基本补给。',
      tips: '马格努斯跳跃点尚未开放，这里适合补给和采购配件。',
      howTo: '从斯坦顿任意轨道站量子航行至 Magnus Gateway。'
    }
  ];

  rows.forEach(function (loc) {
    if (!SC.locationById || !SC.locationById(loc.id)) SC.locations.push(loc);
  });

  if (window.SC_I18N) {
    SC_I18N.locations = SC_I18N.locations || {};
    SC_I18N.locations['nyx-gateway'] = '尼克斯星门（斯坦顿侧）';
    SC_I18N.locations['pyro-gateway-nyx'] = '派罗星门（尼克斯侧）';
    SC_I18N.locations['stanton-gateway-nyx'] = '斯坦顿星门（尼克斯侧）';
    SC_I18N.locations['magnus-gateway'] = '马格努斯之门';
    SC_I18N.locations['stanton-nyx-jump'] = '尼克斯跳跃点';
    SC_I18N.locations['pyro-nyx-jump'] = '尼克斯跳跃点';
  }
})();
