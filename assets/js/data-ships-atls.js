/* =========================================================
   MOBIGLAS · 南船座 ATLS 系列补充
   ---------------------------------------------------------
   数据源：Star Citizen Wiki / UEX / 游戏 local.ini，Alpha 4.10.2。
   本文件只提供补充数据，由 common.js 合并进 SC.ships，
   不修改 data-ships.js 与 data-locations.js。
   ========================================================= */

window.SC_SHIPS_ATLS = [
  {
    id: 'atls',
    name: 'ATLS',
    cn: '南船座 ATLS',
    maker: 'Argo Astronautics',
    role: '货运',
    tags: ['货运', '地面'],
    size: 'GND',
    crew: '1',
    cargo: 0,
    usd: 40,
    auec: 75600,
    status: '可飞',
    scm: null,
    max: null,
    shield: '—',
    hull: null,
    weapons: '牵引光束',
    missiles: '—',
    buy: '洛维尔 New Deal / 18 区 Astro Armada / 奥里森 New Deal',
    rent: '',
    blurb: '南船座宇航的辅助运输装载系统，经过实地测试，让穿着 ATLS 动力装甲的作业更像身体的自然延伸。',
    fit: '适合搬运大件货物、装卸与地面装载。',
    source: 'Star Citizen Wiki / UEX / 游戏 local.ini',
    pledge: 'https://robertsspaceindustries.com/en/pledge/ships/atls/ATLS',
    statusRaw: 'flight-ready'
  },
  {
    id: 'atls-geo',
    name: 'ATLS GEO',
    cn: '南船座 ATLS GEO',
    maker: 'Argo Astronautics',
    role: '工业',
    tags: ['工业', '地面'],
    size: 'GND',
    crew: '1',
    cargo: 0,
    usd: 45,
    auec: 90720,
    status: '可飞',
    scm: null,
    max: null,
    shield: '—',
    hull: null,
    weapons: '采矿激光',
    missiles: '—',
    buy: '洛维尔 New Deal / 18 区 Astro Armada / 奥里森 New Deal',
    rent: '',
    blurb: '在 ATLS 的基础上，南船座宇航将动力服改造成个人采矿平台，配备采矿激光、牵引光束和可拆卸矿石储存器。',
    fit: '适合单人采矿、地面勘探与矿石转运。',
    source: 'Star Citizen Wiki / UEX / 游戏 local.ini',
    pledge: 'https://robertsspaceindustries.com/en/pledge/ships/atls/ATLS-GEO',
    statusRaw: 'flight-ready'
  }
];

if (window.SC_MEDIA) {
  SC_MEDIA.ships = SC_MEDIA.ships || {};
  SC_MEDIA.ships.atls = { card: 'assets/img/ships/atls.webp', hero: 'assets/img/ships/atls.webp', credit: 'Star Citizen Wiki / Cloud Imperium Games' };
  SC_MEDIA.ships['atls-geo'] = { card: 'assets/img/ships/atls-geo.webp', hero: 'assets/img/ships/atls-geo.webp', credit: 'Star Citizen Wiki / Cloud Imperium Games' };
}
