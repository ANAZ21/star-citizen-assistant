/* =========================================================
   MOBIGLAS · 尼克斯星系补充数据
   ---------------------------------------------------------
   游戏已开放尼克斯。该文件作为数据层补充，不修改
   data-locations.js / data-ships.js 原文件。
   ========================================================= */

window.SC = window.SC || {};

SC.systems.push({
  id: 'nyx',
  name: '尼克斯',
  en: 'NYX',
  star: '暗弱恒星',
  security: '无 · 无法地带',
  planets: 1,
  moons: 0,
  desc: '尼克斯是斯坦顿与派罗之外的边境星系，长期处于 UEE 管辖之外。戴拉玛与列夫斯基是主要活动区域，冰川环带和基格带提供采矿与打捞机会。',
  orbits: [120],
  starPos: { x: 600, y: 350 },
  mapNote: 'NYX // DELAMAR',
  jump: '斯坦顿（已开放）'
});

SC.locations.push(
  {
    id: 'delamar',
    system: 'nyx',
    name: 'Delamar',
    cn: '德拉玛',
    type: 'planet',
    parent: 'Nyx',
    mapX: 600,
    mapY: 350,
    danger: 4,
    services: [],
    desc: '德拉玛是尼克斯星系中的岩质天体，表面荒凉，长期被采矿与非法活动占据。列夫斯基位于其地表。',
    tips: '没有统一执法，降落前确认舰船状态与撤离路线。',
    howTo: '从尼克斯星门进入星系，定位德拉玛后前往列夫斯基。'
  },
  {
    id: 'levski',
    system: 'nyx',
    name: 'Levski',
    cn: '列夫斯基',
    type: 'landing',
    parent: 'Delamar',
    mapX: 610,
    mapY: 360,
    danger: 4,
    services: ['飞船商店', '装备商店', '医疗', '任务', '黑市'],
    desc: '列夫斯基是德拉玛地表的主要着陆区，由旧采矿设施扩建而成。这里提供舰船、装备、医疗和任务服务，也是尼克斯最重要的落脚点。',
    tips: '区域不受 UEE 直接管辖，交易与人员构成复杂。',
    howTo: '降落在列夫斯基太空港，步行进入综合体。'
  },
  {
    id: 'glaciem-ring',
    system: 'nyx',
    name: 'Glaciem Ring',
    cn: '冰川环带',
    type: 'poi',
    parent: 'Nyx',
    mapX: 440,
    mapY: 300,
    danger: 4,
    services: [],
    desc: '冰川环带是尼克斯外缘的小行星带，分布着矿点、残骸和非法前哨。',
    tips: '适合采矿与打捞，需注意敌对船只。',
    howTo: '从列夫斯基起飞后按星图标记进入环带。'
  },
  {
    id: 'keeger-belt',
    system: 'nyx',
    name: 'Keeger Belt',
    cn: '基格带',
    type: 'poi',
    parent: 'Nyx',
    mapX: 760,
    mapY: 300,
    danger: 3,
    services: [],
    desc: '基格带是尼克斯的另一处小行星带，矿点分布较散，常有独立矿工和拾荒者活动。',
    tips: '区域信号较弱，建议组队进入。',
    howTo: '从列夫斯基起飞后沿星图标记前往。'
  }
);

if (window.SC_I18N && SC_I18N.locations) {
  SC_I18N.locations.delamar = '德拉玛';
  SC_I18N.locations.levski = '列夫斯基';
  SC_I18N.locations['glaciem-ring'] = '冰川环带';
  SC_I18N.locations['keeger-belt'] = '基格带';
}

if (window.SC_SYSTEM_COPY) {
  SC_SYSTEM_COPY.nyx = '斯坦顿与派罗之外的边境星系，长期处于 UEE 管辖之外。戴拉玛与列夫斯基是主要活动区域。';
}

if (window.SC_STORIES) {
  SC_STORIES.delamar = {
    tagline: '尼克斯的荒凉岩质天体，列夫斯基所在地。',
    story: [
      '德拉玛是尼克斯星系中的岩质天体，表面缺乏稳定大气，长期被采矿与非法活动占据。',
      '列夫斯基位于其地表，是尼克斯少数具备完整补给与维修能力的落脚点。'
    ]
  };
  SC_STORIES.levski = {
    tagline: '德拉玛地表的旧采矿城，尼克斯主要着陆区。',
    story: [
      '列夫斯基由旧采矿设施扩建而成，是尼克斯最重要的着陆区。综合体提供舰船、装备、医疗和任务服务。',
      '区域不受 UEE 直接管辖，人员构成复杂，交易与冲突都在同一片区域内发生。'
    ]
  };
  SC_STORIES['glaciem-ring'] = {
    tagline: '尼克斯外缘的小行星带。',
    story: [
      '冰川环带分布着矿点、残骸和非法前哨，是采矿与打捞的常用区域。',
      '环带内缺乏巡逻，进入前应确认舰船状态和撤离路线。'
    ]
  };
  SC_STORIES['keeger-belt'] = {
    tagline: '尼克斯的小行星采矿带。',
    story: [
      '基格带矿点分布较散，常有独立矿工和拾荒者活动。区域信号较弱，适合组队进入。'
    ]
  };
}

if (window.SC_LOCATION_MEDIA) {
  SC_LOCATION_MEDIA.delamar = { card: 'assets/img/locations/delamar.webp', source: 'Star Citizen Wiki', page: 'Delamar', fallback: false };
  SC_LOCATION_MEDIA.levski = { card: 'assets/img/locations/levski.webp', source: 'Star Citizen Wiki', page: 'Levski', fallback: false };
  SC_LOCATION_MEDIA['glaciem-ring'] = { card: 'assets/img/locations/glaciem-ring.webp', source: 'Star Citizen Wiki', page: 'Glaciem Ring', fallback: false };
  SC_LOCATION_MEDIA['keeger-belt'] = { card: 'assets/img/locations/keeger-belt.webp', source: 'Star Citizen Wiki', page: 'Keeger Belt', fallback: false };
}

if (window.SC_PLANET_DETAIL) {
  SC_PLANET_DETAIL.delamar = 'assets/img/planets/delamar-4k.webp';
}

if (window.SC_MEDIA && SC_MEDIA.systems) {
  SC_MEDIA.systems.nyx = { preview: 'assets/img/locations/delamar.webp', map: 'assets/img/locations/delamar.webp' };
}
