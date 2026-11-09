/* =========================================================
   MOBIGLAS · System Atlas + location index
   ========================================================= */

import * as THREE from '../vendor/three.module.min.js';

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (value) => Number(value).toLocaleString('en-US');
const zhName = (loc) => ((window.SC_I18N && SC_I18N.locations[loc.id]) || loc.cn || loc.name || '');
const zhParent = (parent) => SC.zhParent ? SC.zhParent(parent) : parent;
const parentLabel = (loc) => SC.parentLabel ? SC.parentLabel(loc) : zhParent(loc.parent);
const typeLabel = (type) => ({ planet: '行星', moon: '卫星', landing: '着陆区', station: '空间站', poi: '兴趣点', jump: '跳跃点' }[type] || type);
const riskLabel = (danger) => ['安全', '低风险', '中风险', '高风险', '极高风险'][danger] || '';
const weaponName = (weapon) => SC.weaponName ? SC.weaponName(weapon) : weapon.name;
const weaponManu = (weapon) => SC.weaponManu ? SC.weaponManu(weapon) : weapon.manu;
const shopName = (name) => SC.shopName ? SC.shopName(name) : name;
const componentMeta = window.SC_COMPONENT_META || { types: {}, classes: {} };
const componentTypes = componentMeta.types || {};
const componentClasses = componentMeta.classes || {};
const componentTypeLabel = (type) => (componentTypes[type] && componentTypes[type].label) || type;
const componentClassLabel = (value) => value ? (componentClasses[value] || value) : '';
const componentOrder = { power: 0, shield: 1, cooler: 2, quantum: 3, weapon: 4, missile: 5, missilelauncher: 6, bomb: 7, radar: 8, fueltank: 9, fuelintake: 10, qig: 11, emp: 12, turret: 13, tractor: 14, mining: 15, salvage: 16 };
const weaponComponentTypes = { weapon: 1, missile: 1, missilelauncher: 1, bomb: 1 };
const weaponComponentKind = (entry) => {
  if (entry.type === 'missile') return '导弹/鱼雷';
  if (entry.type === 'missilelauncher') return '导弹发射器';
  if (entry.type === 'bomb') return '炸弹';
  const type = SC.weaponType ? SC.weaponType({ name: entry.en || entry.name }) : '';
  const known = ['实弹', '能量', '激光', '畸变', '电磁', '电浆', '点防御'];
  for (const kind of known) if (type.indexOf(kind) !== -1) return kind;
  return '其他';
};
const isShop = (id) => !!(window.SC_SHOPS && SC_SHOPS.locations && SC_SHOPS.locations[id]);
const shopBuy = (id) => isShop(id) && SC_SHOPS.locations[id].counts.buy > 0;
const systemById = (id) => SC.systems.find((system) => system.id === id);
const storyFor = (loc) => (window.SC_STORIES && SC_STORIES[loc.id]) || null;
const locationMedia = (loc) => (window.SC_LOCATION_MEDIA && SC_LOCATION_MEDIA[loc.id]) || null;

const PLANET_TEXTURES = {
  hurston: 'assets/img/planets/hurston.webp',
  crusader: 'assets/img/planets/crusader.webp',
  arccorp: 'assets/img/planets/arccorp.webp',
  microtech: 'assets/img/planets/microtech.webp',
  'pyro-i': 'assets/img/planets/pyro-i.webp',
  monox: 'assets/img/planets/monox.webp',
  bloom: 'assets/img/planets/bloom.webp',
  fairo: 'assets/img/planets/fairo.webp',
  fuego: 'assets/img/planets/fuego.webp',
  terminus: 'assets/img/planets/terminus.webp',
  delamar: 'assets/img/planets/delamar.webp'
};

const MOON_TEXTURES = window.SC_MOON_TEXTURES || {};
const PLANET_DETAIL = window.SC_PLANET_DETAIL || {};
const STAR_TEXTURE = 'assets/img/systems/star.webp';

const state = {
  system: 'stanton',
  filter: 'all',
  tab: 'ships',
  weaponSize: 'all',
  stockPage: 1,
  stockFilter: 'all',
  componentType: 'all',
  componentGrade: 'all',
  componentClass: 'all',
  componentWeapon: 'all',
  shipRole: 'all',
  selected: null
};

const atlasState = {
  yaw: 0.35,
  pitch: 0.78,
  distance: 112,
  yawGoal: 0.35,
  pitchGoal: 0.78,
  distanceGoal: 112,
  auto: true,
  dragging: null,
  selected: null,
  hover: null,
  focus: null,
  tween: null,
  fullscreen: false,
  expanding: false,
  expandRect: null,
  expandRadius: null,
  expandTimer: null,
  expandBackdrop: null,
  detailId: null,
  target: new THREE.Vector3(),
  targetGoal: new THREE.Vector3(),
  layout: null,
  labels: {}
};

let renderer = null;
let scene = null;
let camera = null;
let atlasInView = true;
let systemGroup = null;
let starField = null;
let labelLayer = null;
let atlasLoading = null;
let textures = {};
let detailTextures = {};
let cityIconTexture = null;
let raycaster = null;
let pointer = new THREE.Vector2();
let atlasW = 1;
let atlasH = 1;
let lastFrame = 0;
let elapsed = 0;
let labelTimer = 0;
let zoomAnchor = null;
let zoomAnchorTimer = null;
let atlasClickTimer = null;
let suppressClick = false;
let lastHoverPick = 0;
let texturesReady = false;
let fillLight = null;
let ambientLight = null;

const els = {};

/* ---------- utility icons ---------- */
function markerIcon(type) {
  if (type === 'landing') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20v-8h4v8M10 20V6h4v14M16 20v-6h4v6"/></svg>';
  if (type === 'station') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="2.4"/><ellipse cx="12" cy="12" rx="8.6" ry="3.4" transform="rotate(-28 12 12)"/></svg>';
  if (type === 'poi') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l8 17H4z"/><path d="M12 10v5"/></svg>';
  if (type === 'jump') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="7"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/></svg>';
  if (type === 'moon') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="6"/><path d="M15.5 9.5a3 3 0 0 0 3-3"/></svg>';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></svg>';
}

function makeCityIconTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  ctx.strokeStyle = '#ffb347';
  ctx.fillStyle = 'rgba(255,159,10,.16)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const bars = [[28, 82, 16, 30], [50, 62, 16, 50], [72, 74, 16, 38], [94, 52, 14, 60]];
  bars.forEach(([x, y, w, h]) => { ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); });
  ctx.beginPath();
  ctx.moveTo(22, 112); ctx.lineTo(110, 112);
  ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/* ---------- data / layout ---------- */

function layoutSystem(systemId) {
  const system = systemById(systemId);
  const all = SC.locations.filter((loc) => loc.system === systemId && !(SC.isHiddenLocation && SC.isHiddenLocation(loc.id)) && !(loc.type === 'station' && /-l\d$/i.test(loc.id)));
  const byName = {};
  all.forEach((loc) => { byName[loc.name] = loc; });
  const planets = all.filter((loc) => loc.type === 'planet');
  const orbits = system.orbits || [];
  const maxOrbit = orbits[orbits.length - 1] || 1;
  const positions = {};
  const nodes = [];

  const add = (loc, x, y, z, opts) => {
    const node = {
      id: loc.id,
      loc,
      position: new THREE.Vector3(x, y, z),
      radius: opts.radius,
      color: opts.color,
      priority: opts.priority,
      shop: isShop(loc.id),
      buy: shopBuy(loc.id),
      host: opts.host || null
    };
    positions[loc.id] = node;
    nodes.push(node);
    return node;
  };

  planets.forEach((planet, index) => {
    const angle = Math.atan2((planet.mapY || 350) - 350, (planet.mapX || 600) - 600);
    const orbit = orbits[Math.min(index, orbits.length - 1)] || (index + 1) * 60;
    const radius = 18 + (orbit / maxOrbit) * 34;
    const gas = planet.id === 'crusader' || planet.id === 'fuego';
    add(planet, Math.cos(angle) * radius, 0, Math.sin(angle) * radius, {
      radius: gas ? 5.1 : 3.6,
      color: '#d6e5ee',
      priority: 0
    });
  });

  planets.forEach((planet) => {
    const host = positions[planet.id];
    if (!host) return;
    const moons = all.filter((loc) => loc.type === 'moon' && loc.parent === planet.name);
    moons.forEach((moon, index) => {
      const angle = Math.atan2((planet.mapY || 350) - 350, (planet.mapX || 600) - 600) + 0.5 + (index / moons.length) * Math.PI * 2;
      const r = 6.4 + (index % 2) * 1.4;
      add(moon, host.position.x + Math.cos(angle) * r, 0.25, host.position.z + Math.sin(angle) * r, {
        radius: 0.48, color: '#9caab5', priority: 3, host: { id: planet.id, position: host.position }
      });
    });
  });

  all.filter((loc) => loc.type === 'landing').forEach((loc) => {
    const parent = byName[loc.parent];
    const host = parent && positions[parent.id];
    if (!host) return;
    const angle = Math.atan2((loc.mapY || parent.mapY) - parent.mapY, (loc.mapX || parent.mapX) - parent.mapX);
    const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
    const surface = host.position.clone().add(dir.multiplyScalar(host.radius * 1.04));
    const surfaceNode = add(loc, surface.x, surface.y, surface.z, {
      radius: 0.22, color: shopBuy(loc.id) ? '#ff9f0a' : '#aebbc5',
      priority: 2,
      host: { id: parent.id, position: host.position }
    });
    surfaceNode.surface = true;
  });

  const stationHost = { checkmate: 'monox', ruin: 'terminus', orbituary: 'bloom', starlight: 'bloom' };
  const gatewayJumps = {
    'pyro-gateway': 'stanton-pyro-jump',
    'terra-gateway': 'stanton-terra-jump',
    'nyx-gateway': 'stanton-nyx-jump',
    'stanton-gateway-pyro': 'pyro-jump',
    'nyx-gateway-pyro': 'pyro-nyx-jump',
    'pyro-gateway-nyx': 'nyx-pyro-jump',
    'stanton-gateway-nyx': 'nyx-stanton-jump'
  };
  const jumpAngles = {};
  all.filter((loc) => loc.type === 'jump').forEach((jump) => {
    jumpAngles[jump.id] = Math.atan2((jump.mapY || 350) - 350, (jump.mapX || 600) - 600);
  });
  const stationAngle = { checkmate: 0.85, ruin: 3.55, orbituary: 2.35, starlight: 5.35, 'patch-city': 2.75, gaslight: 1.65, 'rats-nest': 4.95, endgame: 2.75, 'megumi-refueling': 4.95, 'rods-fuel': 3.85, 'dudley-daughters': 3.85 };
  const stationLagrange = { gaslight: 2, 'rats-nest': 5, 'rods-fuel': 4, endgame: 3, 'megumi-refueling': 5, 'dudley-daughters': 4, 'patch-city': 3, checkmate: 4, starlight: 1 };
  all.filter((loc) => loc.type === 'station').forEach((loc) => {
    const hostId = stationHost[loc.id];
    const host = (hostId && SC.locationById(hostId)) || byName[loc.parent];
    const hp = host && positions[host.id];
    const parsedLagrange = (loc.name.match(/-L(\d)/i) || [])[1];
    const lagrange = Number(stationLagrange[loc.id] || parsedLagrange || 0);
    const angle = stationAngle[loc.id] != null ? stationAngle[loc.id] : (lagrange ? (lagrange - 1) * 1.1 + 0.55 : 2.3);
    if (hp && lagrange) {
      const orbitRadius = Math.hypot(hp.position.x, hp.position.z);
      const orbitAngle = Math.atan2(hp.position.z, hp.position.x);
      const clearance = Math.max((host.radius || 3.6) * 2.6, 7.5);
      let stationRadius = orbitRadius;
      let stationAngle = orbitAngle;
      if (lagrange === 1) { stationRadius = Math.max(orbitRadius - clearance, 13); stationAngle = orbitAngle; }
      else if (lagrange === 2) { stationRadius = orbitRadius + clearance; stationAngle = orbitAngle; }
      else if (lagrange === 3) { stationRadius = orbitRadius + clearance * 1.15; stationAngle = orbitAngle + Math.PI; }
      else if (lagrange === 4) { stationAngle = orbitAngle + Math.PI / 3; }
      else if (lagrange === 5) { stationAngle = orbitAngle - Math.PI / 3; }
      add(loc, Math.cos(stationAngle) * stationRadius, 0.4, Math.sin(stationAngle) * stationRadius, {
        radius: 0.5, color: shopBuy(loc.id) ? '#ff9f0a' : (isShop(loc.id) ? '#64d2ff' : '#a9c3d2'),
        priority: 2,
        host: { id: host.id, position: hp.position }
      });
    } else if (hp) {
      const r = loc.id === 'starlight' ? 14 : Math.max((host.radius || 3.6) * 4.15, 13.5);
      add(loc, hp.position.x + Math.cos(angle) * r, 0.4, hp.position.z + Math.sin(angle) * r, {
        radius: 0.5, color: shopBuy(loc.id) ? '#ff9f0a' : (isShop(loc.id) ? '#64d2ff' : '#a9c3d2'),
        priority: 2,
        host: { id: host.id, position: hp.position }
      });
    } else {
      const jumpId = gatewayJumps[loc.id];
      const a = jumpId && jumpAngles[jumpId] != null
        ? jumpAngles[jumpId]
        : Math.atan2((loc.mapY || 350) - 350, (loc.mapX || 600) - 600);
      const gatewayRadius = jumpId ? (loc.system === 'nyx' ? 38 : 66) : 68;
      add(loc, Math.cos(a) * gatewayRadius, 0.5, Math.sin(a) * gatewayRadius, {
        radius: 0.5,
        color: isShop(loc.id) ? '#64d2ff' : '#a9c3d2',
        priority: 2
      });
    }
  });

  all.filter((loc) => loc.type === 'poi').forEach((loc) => {
    const parent = byName[loc.parent];
    const host = parent && positions[parent.id];
    const angle = (loc.id.length * 0.7) % (Math.PI * 2);
    if (host) {
      add(loc, host.position.x + Math.cos(angle) * 7, 0.5, host.position.z + Math.sin(angle) * 7, {
        radius: 0.18, color: '#ff665c', priority: 4, host: { id: parent.id, position: host.position }
      });
    } else {
      const a = Math.atan2((loc.mapY || 350) - 350, (loc.mapX || 600) - 600);
      add(loc, Math.cos(a) * 53, 0.5, Math.sin(a) * 53, { radius: 0.18, color: '#ff665c', priority: 4 });
    }
  });

  all.filter((loc) => loc.type === 'jump').forEach((loc) => {
    const a = Math.atan2((loc.mapY || 350) - 350, (loc.mapX || 600) - 600);
    const jumpRadius = systemId === 'nyx' ? 36 : 62;
    add(loc, Math.cos(a) * jumpRadius, 0.4, Math.sin(a) * jumpRadius, { radius: 0.52, color: '#30d158', priority: 4 });
  });

  nodes.sort((a, b) => b.priority - a.priority);
  return { system, nodes, positions };
}

/* ---------- 3D scene ---------- */
function makeGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,248,220,1)');
  g.addColorStop(0.22, 'rgba(255,220,158,.72)');
  g.addColorStop(0.55, 'rgba(255,170,88,.17)');
  g.addColorStop(1, 'rgba(255,130,50,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeStarfield() {
  const positions = [];
  const colors = [];
  const color = new THREE.Color();
  let seed = 1337;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 1500; i++) {
    const r = 90 + rand() * 190;
    const t = rand() * Math.PI * 2;
    const p = Math.acos(2 * rand() - 1);
    positions.push(Math.sin(p) * Math.cos(t) * r, Math.cos(p) * r, Math.sin(p) * Math.sin(t) * r);
    color.setHSL(0.53 + rand() * 0.08, 0.15 + rand() * 0.28, 0.55 + rand() * 0.4);
    colors.push(color.r, color.g, color.b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ vertexColors: true, size: 0.34, transparent: true, opacity: 0.72, depthWrite: false }));
}

function disposeGroup(group) {
  if (!group) return;
  group.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach((material) => { material.dispose(); });
    }
  });
}


/* ---------- station models ---------- */
function stationMaterials(accent) {
  return {
    metal: new THREE.MeshStandardMaterial({ color: 0x6d7884, metalness: 0.78, roughness: 0.34 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1b2229, metalness: 0.55, roughness: 0.48 }),
    panel: new THREE.MeshStandardMaterial({ color: 0x10171d, metalness: 0.35, roughness: 0.55 }),
    glow: new THREE.MeshStandardMaterial({ color: 0x0a0d10, emissive: accent || 0x64d2ff, emissiveIntensity: 1.4 }),
    accent: new THREE.MeshStandardMaterial({ color: accent || 0xff9f0a, metalness: 0.4, roughness: 0.45, emissive: accent || 0xff9f0a, emissiveIntensity: 0.35 })
  };
}

function addStationMesh(group, geometry, material, position, rotation) {
  const mesh = new THREE.Mesh(geometry, material);
  if (position) mesh.position.set(position[0], position[1], position[2]);
  if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  group.add(mesh);
  return mesh;
}

function makeStationModel(id) {
  const group = new THREE.Group();
  const accent = id === 'checkmate' || id === 'ruin' || id === 'orbituary' || id === 'starlight' ? 0xff9f0a : 0x64d2ff;
  const m = stationMaterials(accent);
  const ring = (r, tube, material) => addStationMesh(group, new THREE.TorusGeometry(r, tube, 16, 72), material);
  const spoke = (len, material, rotation) => addStationMesh(group, new THREE.BoxGeometry(len, 0.045, 0.045), material, null, rotation);

  if (id === 'everus') {
    addStationMesh(group, new THREE.CylinderGeometry(0.16, 0.22, 1.1, 16), m.metal);
    ring(0.86, 0.055, m.metal).rotation.x = Math.PI / 2;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      spoke(1.72, m.metal, [0, a, 0]);
    }
    addStationMesh(group, new THREE.BoxGeometry(0.42, 0.18, 0.3), m.dark, [0, 0.58, 0]);
    addStationMesh(group, new THREE.BoxGeometry(0.5, 0.05, 0.05), m.glow, [0, 0.68, 0]);
    addStationMesh(group, new THREE.CylinderGeometry(0.015, 0.015, 0.75, 6), m.metal, [0, 1.15, 0]);
  } else if (id === 'seraphim') {
    ring(0.9, 0.05, m.metal).rotation.x = Math.PI / 2;
    ring(0.72, 0.04, m.accent).rotation.y = Math.PI / 2;
    addStationMesh(group, new THREE.SphereGeometry(0.24, 20, 14), m.dark);
    addStationMesh(group, new THREE.CylinderGeometry(0.08, 0.12, 0.7, 10), m.metal, [0, 0.62, 0]);
    addStationMesh(group, new THREE.BoxGeometry(1.4, 0.02, 0.34), m.panel, [0, 0.72, 0]);
  } else if (id === 'baijini') {
    addStationMesh(group, new THREE.BoxGeometry(1.45, 0.16, 0.22), m.metal);
    addStationMesh(group, new THREE.BoxGeometry(0.55, 0.38, 0.5), m.dark, [-0.62, 0.12, 0]);
    for (let i = 0; i < 4; i++) {
      addStationMesh(group, new THREE.BoxGeometry(0.22, 0.16, 0.36), m.accent, [0.05 + i * 0.25, 0.24, 0]);
    }
    addStationMesh(group, new THREE.BoxGeometry(1.1, 0.03, 0.65), m.panel, [0.35, 0.42, 0]);
    addStationMesh(group, new THREE.BoxGeometry(0.03, 0.03, 0.85), m.metal, [0.9, 0.05, 0]);
  } else if (id === 'tressler') {
    addStationMesh(group, new THREE.CylinderGeometry(0.1, 0.1, 1.8, 12), m.metal);
    for (let i = 0; i < 3; i++) {
      const r = ring(0.58 + i * 0.18, 0.035, i === 1 ? m.accent : m.metal);
      r.rotation.x = Math.PI / 2;
      r.position.y = -0.5 + i * 0.5;
    }
    addStationMesh(group, new THREE.BoxGeometry(1.5, 0.02, 0.28), m.panel, [0, 0.55, 0]);
    addStationMesh(group, new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), m.metal, [0, 1.1, 0]);
  } else if (id === 'grim-hex') {
    addStationMesh(group, new THREE.DodecahedronGeometry(0.55, 0), new THREE.MeshStandardMaterial({ color: 0x4b4038, metalness: 0.25, roughness: 0.92 }));
    addStationMesh(group, new THREE.BoxGeometry(0.5, 0.16, 0.28), m.dark, [0.45, 0.18, 0]);
    addStationMesh(group, new THREE.BoxGeometry(0.26, 0.18, 0.32), m.accent, [-0.35, -0.2, 0.15]);
    addStationMesh(group, new THREE.CylinderGeometry(0.015, 0.015, 0.8, 6), m.metal, [0.1, 0.75, 0]);
  } else if (id === 'kareah') {
    addStationMesh(group, new THREE.CylinderGeometry(0.45, 0.55, 0.28, 8), m.metal);
    addStationMesh(group, new THREE.BoxGeometry(0.65, 0.24, 0.65), m.dark, [0, 0.24, 0]);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      addStationMesh(group, new THREE.BoxGeometry(0.22, 0.08, 0.36), m.accent, [Math.cos(a) * 0.62, 0.2, Math.sin(a) * 0.62], [0, -a, 0]);
    }
    ring(0.82, 0.025, m.glow).rotation.x = Math.PI / 2;
  } else if (id === 'pyro-gateway' || id === 'terra-gateway' || id === 'lagrange') {
    const gate = id !== 'lagrange';
    if (gate) {
      addStationMesh(group, new THREE.TorusGeometry(1.05, 0.09, 16, 64), m.metal);
      addStationMesh(group, new THREE.TorusGeometry(0.8, 0.025, 8, 64), m.glow);
      addStationMesh(group, new THREE.BoxGeometry(0.8, 0.12, 0.12), m.dark, [0, -1.02, 0]);
      addStationMesh(group, new THREE.BoxGeometry(0.12, 0.55, 0.12), m.metal, [-0.85, -0.7, 0]);
      addStationMesh(group, new THREE.BoxGeometry(0.12, 0.55, 0.12), m.metal, [0.85, -0.7, 0]);
    } else {
      addStationMesh(group, new THREE.BoxGeometry(0.55, 0.22, 0.4), m.dark);
      addStationMesh(group, new THREE.BoxGeometry(1.3, 0.025, 0.3), m.panel);
      addStationMesh(group, new THREE.CylinderGeometry(0.24, 0.24, 0.05, 20), m.glow, [0, 0.24, 0]);
      addStationMesh(group, new THREE.CylinderGeometry(0.02, 0.02, 0.7, 6), m.metal, [0, 0.5, 0]);
    }
  } else if (id === 'checkmate') {
    addStationMesh(group, new THREE.BoxGeometry(0.7, 0.32, 0.5), m.dark);
    ring(0.78, 0.045, m.metal).rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      addStationMesh(group, new THREE.BoxGeometry(0.28, 0.08, 0.08), m.accent, [Math.cos(a) * 0.75, 0.2, Math.sin(a) * 0.75], [0, -a, 0]);
    }
    addStationMesh(group, new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), m.metal, [0.15, 0.65, 0]);
  } else if (id === 'ruin') {
    const broken = addStationMesh(group, new THREE.TorusGeometry(0.86, 0.06, 12, 32, Math.PI * 1.35), m.metal);
    broken.rotation.x = Math.PI / 2;
    addStationMesh(group, new THREE.BoxGeometry(0.5, 0.2, 0.3), m.dark, [0.35, 0.12, 0.2], [0.2, 0.5, 0.4]);
    addStationMesh(group, new THREE.BoxGeometry(0.35, 0.14, 0.28), m.accent, [-0.42, -0.15, 0.1], [0.1, -0.4, 0.2]);
    addStationMesh(group, new THREE.CylinderGeometry(0.015, 0.015, 0.7, 6), m.metal, [0.2, 0.55, -0.1], [0.3, 0, 0.2]);
  } else if (id === 'orbituary') {
    addStationMesh(group, new THREE.CylinderGeometry(0.08, 0.08, 1.9, 10), m.metal);
    for (let i = 0; i < 3; i++) {
      const y = -0.6 + i * 0.6;
      addStationMesh(group, new THREE.CylinderGeometry(0.22, 0.22, 0.36, 12), m.dark, [0, y, 0], [Math.PI / 2, 0, 0]);
      addStationMesh(group, new THREE.BoxGeometry(0.9, 0.02, 0.35), m.panel, [0, y + 0.2, 0]);
    }
    addStationMesh(group, new THREE.CylinderGeometry(0.26, 0.26, 0.05, 20), m.glow, [0, 0.55, 0]);
  } else {
    addStationMesh(group, new THREE.BoxGeometry(0.5, 0.24, 0.36), m.dark);
    addStationMesh(group, new THREE.BoxGeometry(1.2, 0.02, 0.22), m.panel);
    addStationMesh(group, new THREE.CylinderGeometry(0.2, 0.2, 0.05, 18), m.glow, [0, 0.2, 0]);
    addStationMesh(group, new THREE.CylinderGeometry(0.015, 0.015, 0.6, 6), m.metal, [0, 0.45, 0]);
  }
  group.scale.setScalar(0.74);
  group.userData.station = true;
  group.userData.id = id;
  group.traverse((child) => { if (child.isMesh) child.userData.id = id; });
  return group;
}

function makeJumpGateModel(id) {
  const group = new THREE.Group();
  const accent = id === 'stanton-pyro-jump' || id === 'pyro-jump' ? 0x8fc7ff : 0xc8d8e8;
  const metal = new THREE.MeshStandardMaterial({ color: 0x68737e, metalness: 0.86, roughness: 0.28 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x121920, metalness: 0.7, roughness: 0.4 });
  const glow = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false });
  const add = (geo, mat, pos, rot) => {
    const mesh = new THREE.Mesh(geo, mat);
    if (pos) mesh.position.set(pos[0], pos[1], pos[2]);
    if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
    group.add(mesh);
    return mesh;
  };
  add(new THREE.TorusGeometry(1.12, 0.075, 12, 64), metal);
  add(new THREE.TorusGeometry(0.92, 0.022, 8, 64), glow);
  add(new THREE.TorusGeometry(1.36, 0.028, 8, 64), dark, [0, 0, 0], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    add(new THREE.BoxGeometry(0.5, 0.035, 0.06), metal, [Math.cos(a) * 1.12, Math.sin(a) * 1.12, 0], [0, 0, a]);
    add(new THREE.BoxGeometry(0.18, 0.09, 0.06), dark, [Math.cos(a) * 1.34, Math.sin(a) * 1.34, 0], [0, 0, a]);
  }
  add(new THREE.CircleGeometry(1.03, 48), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.12, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  add(new THREE.RingGeometry(1.03, 1.1, 48), glow);
  group.scale.setScalar(0.78);
  group.userData.station = true;
  group.userData.gate = true;
  group.userData.id = id;
  group.traverse((child) => { if (child.isMesh) child.userData.id = id; });
  return group;
}

function makeAnamorphicTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 512, 0);
  g.addColorStop(0, 'rgba(255,220,170,0)');
  g.addColorStop(.23, 'rgba(255,220,170,.05)');
  g.addColorStop(.47, 'rgba(255,240,210,.72)');
  g.addColorStop(.5, 'rgba(255,255,240,1)');
  g.addColorStop(.53, 'rgba(255,240,210,.72)');
  g.addColorStop(.77, 'rgba(255,220,170,.05)');
  g.addColorStop(1, 'rgba(255,220,170,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeStarRaysTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.translate(256, 256);
  for (let i = 0; i < 18; i++) {
    const angle = i / 18 * Math.PI * 2;
    const spread = 0.022 + (i % 4) * 0.008;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle - spread) * 46, Math.sin(angle - spread) * 46);
    ctx.lineTo(Math.cos(angle) * (135 + (i % 5) * 24), Math.sin(angle) * (135 + (i % 5) * 24));
    ctx.lineTo(Math.cos(angle + spread) * 46, Math.sin(angle + spread) * 46);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,230,190,' + (0.05 + (i % 3) * 0.025) + ')';
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildSystem(systemId) {
  restorePlanetDetail();
  atlasState.tween = null;
  if (systemGroup) {
    scene.remove(systemGroup);
    disposeGroup(systemGroup);
  }
  atlasState.labels = {};
  if (labelLayer) labelLayer.innerHTML = '';
  const layout = layoutSystem(systemId);
  atlasState.layout = layout;
  systemGroup = new THREE.Group();
  scene.add(systemGroup);

  const glowTexture = makeGlowTexture();
  if (!cityIconTexture) cityIconTexture = makeCityIconTexture();
  const pyro = systemId === 'pyro';
  const starUniforms = { uMap: { value: textures.sun || null }, uTime: { value: 0 } };
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(7.2, 72, 48),
    new THREE.ShaderMaterial({
      uniforms: starUniforms,
      vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv=uv; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'uniform sampler2D uMap; uniform float uTime; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vec2 uv=vUv; uv.x+=sin(uv.y*34.0+uTime*.12)*0.0007; vec3 base=texture2D(uMap,uv).rgb; float rim=pow(1.0-max(dot(vN,vV),0.0),2.2); vec3 hot=vec3(1.0,.72,.35); vec3 col=base+hot*rim*.6+vec3(.08,.11,.16)*rim; gl_FragColor=vec4(col,1.0); }'
    })
  );
  systemGroup.add(star);
  const prominence = new THREE.Mesh(
    new THREE.TorusGeometry(8.1, 0.06, 8, 96),
    new THREE.MeshBasicMaterial({ color: pyro ? 0xff7a45 : 0xffd28a, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  prominence.rotation.x = Math.PI / 2.45;
  prominence.rotation.z = 0.25;
  systemGroup.add(prominence);
  systemGroup.userData.starUniforms = starUniforms;
  systemGroup.userData.prominence = prominence;
  const starLight = new THREE.PointLight(pyro ? 0xffb07a : 0xffd7a2, 3.8, 0, 0);
  systemGroup.add(starLight);
  systemGroup.userData.star = star;

  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x64d2ff, transparent: true, opacity: 0.11 });
  layout.nodes.filter((node) => node.loc.type === 'planet').forEach((node) => {
    const r = Math.hypot(node.position.x, node.position.z);
    const pts = [];
    for (let i = 0; i <= 140; i++) {
      const a = (i / 140) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    systemGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), orbitMaterial.clone()));
  });

  layout.nodes.forEach((node) => {
    const loc = node.loc;
    let mesh;
    if (loc.type === 'planet') {
      const texture = textures[loc.id];
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(node.radius, 64, 40),
        new THREE.MeshStandardMaterial({ map: texture || null, color: texture ? 0xffffff : 0x8997a3, roughness: 0.86, metalness: 0.02, emissive: new THREE.Color(0x0a0806) })
      );
      node.baseMap = texture || null;
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0x9cc9dd, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.14 }));
      glow.scale.set(node.radius * 5.5, node.radius * 5.5, 1);
      glow.position.copy(node.position);
      systemGroup.add(glow);
      const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(node.radius * 1.045, 48, 32),
        new THREE.ShaderMaterial({
          transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
          uniforms: { uColor: { value: new THREE.Color(loc.id === 'fuego' || loc.id === 'crusader' ? 0x8fc7d8 : 0xa6b8c4) } },
          vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
          fragmentShader: 'uniform vec3 uColor; varying vec3 vN; varying vec3 vV; void main(){ float rim=pow(1.0-max(dot(vN,vV),0.0),2.8); gl_FragColor=vec4(uColor, rim*0.28); }'
        })
      );
      atmo.position.copy(node.position);
      systemGroup.add(atmo);
      if (loc.id === 'fuego') {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(node.radius * 1.45, node.radius * 2.05, 72),
          new THREE.MeshBasicMaterial({ color: 0xd89a66, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })
        );
        ring.rotation.x = Math.PI / 2 + 0.15;
        ring.position.copy(node.position);
        systemGroup.add(ring);
      }
    } else if (loc.type === 'moon') {
      const texture = textures[loc.id];
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(node.radius, 32, 20),
        new THREE.MeshStandardMaterial({ map: texture || null, color: texture ? 0xffffff : 0x8997a3, roughness: 1 })
      );
    } else if (loc.type === 'station') {
      const restStop = /-l\d$/i.test(loc.id);
      const beaconColor = node.buy ? 0xff9f0a : (node.shop ? 0x64d2ff : 0xa9c3d2);
      if (restStop) {
        // Lagrange rest stops are beacons, not large models; this keeps the
        // orbital diagram readable and prevents station meshes from covering planets.
        mesh = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: beaconColor, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.62 }));
        mesh.scale.set(0.82, 0.82, 1);
        mesh.userData.stationBeacon = true;
      } else {
        mesh = makeStationModel(loc.id);
        mesh.scale.setScalar(0.56);
      }
      const beacon = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: beaconColor, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.32 }));
      beacon.scale.set(1.45, 1.45, 1);
      beacon.position.copy(node.position);
      beacon.userData.stationBeacon = true;
      systemGroup.add(beacon);
      node.beacon = beacon;
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.5, 0.62, 48),
        new THREE.MeshBasicMaterial({ color: beaconColor, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false })
      );
      halo.rotation.x = Math.PI / 2;
      halo.position.copy(node.position);
      halo.userData.id = loc.id;
      halo.userData.stationHalo = true;
      systemGroup.add(halo);
      node.halo = halo;
    } else if (loc.type === 'jump') {
      mesh = makeJumpGateModel(loc.id);
    } else if (loc.type === 'landing') {
      mesh = new THREE.Sprite(new THREE.SpriteMaterial({ map: cityIconTexture, color: 0xffffff, transparent: true, depthWrite: false, depthTest: true }));
      mesh.scale.set(0.72, 0.72, 1);
    } else {
      mesh = new THREE.Mesh(new THREE.SphereGeometry(node.radius, 12, 10), new THREE.MeshBasicMaterial({ color: node.color }));
    }
    mesh.position.copy(node.position);
    mesh.userData.id = loc.id;
    systemGroup.add(mesh);
    node.mesh = mesh;

    if (node.shop) {
      const ringInner = loc.type === 'station' ? 1.05 : Math.max(0.55, node.radius + 0.35);
      const ringOuter = loc.type === 'station' ? 1.28 : Math.max(0.7, node.radius + 0.5);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(ringInner, ringOuter, 40),
        new THREE.MeshBasicMaterial({ color: node.buy ? 0xff9f0a : 0x64d2ff, transparent: true, opacity: 0.52, side: THREE.DoubleSide, depthWrite: false })
      );
      ring.position.copy(node.position);
      ring.userData.id = loc.id;
      ring.userData.shopRing = true;
      systemGroup.add(ring);
      node.shopRing = ring;
    }
    createLabel(node);
  });

  layout.nodes.forEach((node) => { if (!atlasState.labels[node.id]) createLabel(node); });
  updateLabelVisibility();
}

function createLabel(node) {
  if (!labelLayer || atlasState.labels[node.id]) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'atlas-node ' + node.loc.type + (node.shop ? ' shop' : '') + (node.shop && !node.buy ? ' rent-only' : '') + (node.loc.type === 'station' ? ' kind-station' : '');
  button.dataset.id = node.id;
  button.dataset.priority = node.priority;
  const primary = zhName(node.loc);
  const secondary = node.loc.type === 'station'
    ? (/空间站|站$/.test(primary) ? '' : '空间站')
    : `${node.loc.name} · ${typeLabel(node.loc.type)}`;
  const dot = node.loc.type === 'planet' ? '' : `<span class="atlas-node-dot">${markerIcon(node.loc.type)}</span>`;
  button.innerHTML = dot + `<span class="atlas-node-label"><b>${esc(primary)}</b><small>${esc(secondary)}</small></span>`;
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    selectAtlasNode(node.id);
  });
  labelLayer.appendChild(button);
  atlasState.labels[node.id] = button;
}

function updateLabelVisibility() {
  if (!atlasState.layout) return;
  const distance = atlasState.distance;
  const level = distance < 54 ? 4 : distance < 78 ? 3 : distance < 103 ? 2 : 1;
  const focus = atlasState.focus;
  atlasState.layout.nodes.forEach((node) => {
    const label = atlasState.labels[node.id];
    if (!label) return;
    const visible = focus
      ? (!!(node.host && node.host.id === focus) && !atlasState.dragging && !atlasState.auto)
      : (atlasState.selected === node.id || atlasState.hover === node.id
        || (node.loc.type === 'station' && node.shop)
        || node.priority <= level);
    label.classList.toggle('show', visible);
    label.classList.toggle('hidden', !visible);
    label.classList.toggle('selected', atlasState.selected === node.id);
    label.classList.toggle('hover', atlasState.hover === node.id);
  });
}

function updateLabelPositions() {
  if (!atlasState.layout || !camera || !labelLayer) return;
  const camDir = new THREE.Vector3();
  camera.getWorldDirection(camDir);
  Object.values(atlasState.labels).forEach((label) => { label.classList.remove('collide'); label.classList.remove('offscreen'); });
  const camRight = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  atlasState.layout.nodes.forEach((node) => {
    const label = atlasState.labels[node.id];
    if (!label || label.classList.contains('hidden')) return;
    const direction = node.position.clone().sub(camera.position);
    if (direction.dot(camDir) < -0.2) { label.classList.add('offscreen'); return; }
    if (node.surface && node.host) {
      const normal = node.position.clone().sub(node.host.position).normalize();
      const toCamera = camera.position.clone().sub(node.position).normalize();
      if (normal.dot(toCamera) <= 0.03) { label.classList.add('offscreen'); return; }
    }
    const projected = node.position.clone().project(camera);
    if (projected.z < -1 || projected.z > 1) { label.classList.add('offscreen'); return; }
    const x = (projected.x * .5 + .5) * atlasW;
    const y = (-projected.y * .5 + .5) * atlasH;
    if (x < 2 || x > atlasW - 2 || y < 2 || y > atlasH - 2) { label.classList.add('offscreen'); return; }
    const leftSide = x > atlasW * 0.57;
    const yOffset = node.loc.type === 'planet' ? -14 : (node.loc.id === 'ruin' ? -38 : (node.loc.type === 'station' ? 0 : (node.shop ? 10 : 0)));
    let anchor = 11;
    if (node.loc.type === 'planet') {
      const edge = node.position.clone().add(camRight.clone().multiplyScalar(node.radius || 3.6)).project(camera);
      const edgeX = (edge.x * .5 + .5) * atlasW;
      anchor = Math.max(11, Math.abs(edgeX - x) + 9);
    }
    label.dataset.x = x;
    label.dataset.y = y;
    label.dataset.dy = yOffset;
    label.dataset.anchor = anchor;
    label.style.left = `${x + (leftSide ? -anchor : anchor)}px`;
    label.style.top = `${y + yOffset}px`;
    label.style.transform = leftSide ? 'translate(-100%, -50%)' : 'translate(0, -50%)';
    label.classList.toggle('label-left', leftSide);
    label.classList.toggle('label-up', y > atlasH * 0.78);
  });

  const visible = atlasState.layout.nodes
    .filter((node) => {
      const label = atlasState.labels[node.id];
      return label && !label.classList.contains('hidden');
    })
    .sort((a, b) => {
      const rank = (node) => (node.id === atlasState.selected || node.id === atlasState.hover) ? 0
        : (node.loc.type === 'planet' ? 1
          : (node.loc.type === 'station' ? 2
            : (node.loc.type === 'landing' ? 3 : (node.shop ? 4 : 5))));
      return rank(a) - rank(b) || a.priority - b.priority;
    });

  /* The star is the brightest object on screen; keep labels off its disc. */
  let starBox = null;
  const starCenter = new THREE.Vector3(0, 0, 0).project(camera);
  const starEdge = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(9.2).project(camera);
  const scx = (starCenter.x * .5 + .5) * atlasW;
  const scy = (-starCenter.y * .5 + .5) * atlasH;
  const sex = (starEdge.x * .5 + .5) * atlasW;
  const sey = (-starEdge.y * .5 + .5) * atlasH;
  const starRadius = Math.hypot(sex - scx, sey - scy);
  if (isFinite(starRadius) && starRadius > 0) {
    starBox = { left: scx - starRadius - 8, right: scx + starRadius + 8, top: scy - starRadius - 8, bottom: scy + starRadius + 8 };
  }

  const boxes = [];
  const hitsBox = (box) => boxes.some((b) => !(box.right < b.left || box.left > b.right || box.bottom < b.top || box.top > b.bottom));
  const hitsStar = (box) => !!starBox && !(box.right < starBox.left || box.left > starBox.right || box.bottom < starBox.top || box.top > starBox.bottom);
  const outside = (box) => box.left < 4 || box.right > atlasW - 4 || box.top < 4 || box.bottom > atlasH - 4;

  visible.forEach((node) => {
    const label = atlasState.labels[node.id];
    const x = Number(label.dataset.x);
    const y = Number(label.dataset.y);
    const dy = Number(label.dataset.dy) || 0;
    const w = label.offsetWidth;
    const h = label.offsetHeight;
    if (!w || !h || !isFinite(x) || !isFinite(y)) return;
    const primaryLeft = x > atlasW * 0.57;
    const candidates = [
      { left: primaryLeft, dy: dy },
      { left: !primaryLeft, dy: dy },
      { left: primaryLeft, dy: dy - 26 },
      { left: primaryLeft, dy: dy + 26 },
      { left: !primaryLeft, dy: dy - 26 },
      { left: !primaryLeft, dy: dy + 26 }
    ];
    const anchor = Number(label.dataset.anchor) || 11;
    const boxFor = (candidate) => {
      const anchorX = x + (candidate.left ? -anchor : anchor);
      const left = candidate.left ? anchorX - w - 4 : anchorX - 4;
      const top = y + candidate.dy - h / 2 - 3;
      return { left: left, right: left + w + 8, top: top, bottom: top + h + 6 };
    };
    let chosen = null;
    if (node.id === atlasState.selected || node.id === atlasState.hover) {
      chosen = { candidate: candidates[0], box: boxFor(candidates[0]) };
    } else {
      /* Prefer a spot clear of other labels, the star, and the canvas edge. */
      for (const candidate of candidates) {
        const box = boxFor(candidate);
        if (!hitsBox(box) && !hitsStar(box) && !outside(box)) { chosen = { candidate: candidate, box: box }; break; }
      }
      if (!chosen) {
        for (const candidate of candidates) {
          const box = boxFor(candidate);
          if (!hitsBox(box)) { chosen = { candidate: candidate, box: box }; break; }
        }
      }
    }
    if (!chosen) { label.classList.add('collide'); return; }
    const candidate = chosen.candidate;
    let left = x + (candidate.left ? -anchor : anchor);
    let top = y + candidate.dy;
    /* Keep the whole label inside the canvas, even for edge nodes. */
    const box = chosen.box;
    if (box.left < 4) left += 4 - box.left;
    else if (box.right > atlasW - 4) left -= box.right - (atlasW - 4);
    if (box.top < 4) top += 4 - box.top;
    else if (box.bottom > atlasH - 4) top -= box.bottom - (atlasH - 4);
    label.style.left = `${left}px`;
    label.style.top = `${top}px`;
    label.style.transform = candidate.left ? 'translate(-100%, -50%)' : 'translate(0, -50%)';
    label.classList.toggle('label-left', candidate.left);
    label.classList.remove('label-up');
    boxes.push(chosen.box);
  });
}

function zoomRange() {
  if (atlasState.focus && atlasState.layout) {
    const node = atlasState.layout.positions[atlasState.focus];
    const radius = node ? node.radius : 3.6;
    return { min: Math.max(7, radius * 1.55), max: Math.max(34, radius * 13) };
  }
  return { min: 44, max: 150 };
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function startCameraTween(to, duration) {
  atlasState.tween = {
    start: performance.now() / 1000,
    duration,
    from: {
      yaw: atlasState.yaw,
      pitch: atlasState.pitch,
      distance: atlasState.distance,
      target: atlasState.target.clone()
    },
    to: {
      yaw: to.yaw,
      pitch: to.pitch,
      distance: to.distance,
      target: to.target.clone()
    }
  };
  atlasState.yawGoal = to.yaw;
  atlasState.pitchGoal = to.pitch;
  atlasState.distanceGoal = to.distance;
  atlasState.targetGoal.copy(to.target);
}

function focusView(node, yaw) {
  const aspect = atlasW / atlasH;
  const vFov = (camera.fov * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const diameterFraction = atlasState.fullscreen ? 0.60 : 0.54;
  const distance = Math.max(node.radius * 2.2, node.radius / Math.tan((diameterFraction * hFov) / 2));
  const shiftFraction = atlasState.fullscreen ? 0.19 : 0.21;
  const shift = shiftFraction * 2 * distance * Math.tan(hFov / 2);
  const useYaw = yaw == null ? atlasState.yaw : yaw;
  const right = new THREE.Vector3(Math.cos(useYaw), 0, -Math.sin(useYaw));
  return {
    target: node.position.clone().add(right.multiplyScalar(shift)),
    distance,
    yaw: useYaw,
    pitch: atlasState.pitch
  };
}

function restorePlanetDetail() {
  const id = atlasState.detailId;
  if (!id) return;
  const node = atlasState.layout && atlasState.layout.positions[id];
  if (node && node.mesh && node.mesh.material) {
    node.mesh.material.map = node.baseMap;
    node.mesh.material.needsUpdate = true;
  }
  if (detailTextures[id]) {
    detailTextures[id].dispose();
    delete detailTextures[id];
  }
  atlasState.detailId = null;
}

function applyPlanetDetail(id) {
  if (atlasState.focus !== id) return;
  const node = atlasState.layout && atlasState.layout.positions[id];
  const texture = detailTextures[id];
  if (!node || !node.mesh || !texture) return;
  if (atlasState.detailId && atlasState.detailId !== id) restorePlanetDetail();
  node.mesh.material.map = texture;
  node.mesh.material.needsUpdate = true;
  atlasState.detailId = id;
}

function loadPlanetDetail(id) {
  const src = PLANET_DETAIL[id];
  if (!src) return;
  if (detailTextures[id]) {
    applyPlanetDetail(id);
    return;
  }
  new THREE.TextureLoader().load(src, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
    detailTextures[id] = texture;
    applyPlanetDetail(id);
  });
}

function focusPlanet(id) {
  const node = atlasState.layout && atlasState.layout.positions[id];
  const loc = SC.locationById(id);
  if (!node || !loc) return;
  atlasState.focus = id;
  atlasState.selected = id;
  atlasState.hover = null;
  const view = focusView(node);
  atlasState.auto = false;
  updateAutoButton();
  updateFocusHud();
  updateLabelVisibility();
  updateLabelPositions();
  startCameraTween(view, 1.65);
  loadPlanetDetail(id);
  const stage = $('#atlas-stage');
  if (stage) stage.classList.add('is-focused');
  const hint = $('#atlas-hint');
  if (hint) hint.classList.add('hidden');
}

function leaveFocus() {
  restorePlanetDetail();
  atlasState.focus = null;
  atlasState.selected = null; atlasState.hover = null;
  atlasState.auto = true;
  updateAutoButton();
  updateFocusHud();
  updateLabelVisibility();
  const yaw = atlasState.fullscreen ? 0.35 : atlasState.yaw;
  const pitch = atlasState.fullscreen ? 0.78 : atlasState.pitch;
  startCameraTween({ target: new THREE.Vector3(0, 0, 0), distance: 112, yaw, pitch }, 1.15);
  const stage = $('#atlas-stage');
  if (stage) stage.classList.remove('is-focused');
  const hint = $('#atlas-hint');
  if (hint) hint.classList.remove('hidden');
}

function updateFocusHud() {
  const host = $('#atlas-focus');
  if (!host) return;
  const id = atlasState.focus;
  const loc = id && SC.locationById(id);
  if (!loc) { host.hidden = true; return; }
  host.hidden = false;
  const name = $('#atlas-focus-name');
  const meta = $('#atlas-focus-meta');
  const stats = $('#atlas-focus-stats');
  const storyHost = $('#atlas-focus-story');
  const sitesHost = $('#atlas-focus-sites');
  if (name) name.textContent = zhName(loc);
  if (meta) meta.textContent = `${loc.name} · ${typeLabel(loc.type)}`;
  const siteRank = { landing: 0, station: 1, poi: 2 };
  const sites = atlasState.layout
    ? atlasState.layout.nodes
      .filter((item) => item.host && item.host.id === loc.id && item.loc.type !== 'moon')
      .sort((a, b) => (siteRank[a.loc.type] == null ? 3 : siteRank[a.loc.type]) - (siteRank[b.loc.type] == null ? 3 : siteRank[b.loc.type]))
    : [];
  const moons = SC.locations.filter((item) => item.system === loc.system && item.type === 'moon' && item.parent === loc.name).length;
  if (stats) {
    const risk = riskLabel(loc.danger);
    stats.innerHTML = `<span><b>${moons}</b>卫星</span><span><b>${sites.length}</b>地点</span>${risk ? `<span class="risk d${loc.danger}"><b>${esc(risk)}</b>风险</span>` : ''}`;
  }
  if (storyHost) {
    const story = storyFor(loc);
    const siteNames = sites.map((item) => zhName(item.loc)).filter(Boolean).join('、');
    const summary = `该行星记录有 ${moons} 颗卫星与 ${sites.length} 个可访问地点${siteNames ? '，主要地点包括' + siteNames : ''}。`;
    const body = story ? story.story.map((paragraph) => `<p>${esc(SC.localizeShopText ? SC.localizeShopText(paragraph) : paragraph)}</p>`).join('') : `<p>${esc(SC.localizeShopText ? SC.localizeShopText(SC.zhText(loc.desc || '')) : SC.zhText(loc.desc || ''))}</p>`;
    storyHost.innerHTML = body;
  }
  if (sitesHost) {
    sitesHost.innerHTML = sites.length
      ? sites.map((item) => {
        const siteStory = storyFor(item.loc);
        const siteText = siteStory ? siteStory.tagline : SC.zhText(item.loc.desc || '');
        return `<button type="button" data-focus-site="${esc(item.loc.id)}"><b>${esc(zhName(item.loc))}</b><small>${esc(typeLabel(item.loc.type))}</small><em>${esc(siteText)}</em></button>`;
      }).join('')
      : '<span class="atlas-focus-empty">暂无附属地点</span>';
  }
}

function selectAtlasNode(id) {
  const loc = SC.locationById(id);
  if (loc && loc.type === 'planet') { focusPlanet(id); return; }
  atlasState.selected = id;
  updateLabelVisibility();
  openLocation(id, false);
}

function pickAtlasId(event) {
  if (!renderer || !camera || !systemGroup) return null;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(systemGroup.children, true);
  const hit = hits.find((item) => item.object.userData && item.object.userData.id);
  return hit ? hit.object.userData.id : null;
}

function scheduleAtlasClick(event) {
  clearTimeout(atlasClickTimer);
  atlasClickTimer = setTimeout(() => {
    atlasClickTimer = null;
    pickAtlas(event);
  }, 280);
}

function pickAtlas(event) {
  const id = pickAtlasId(event);
  if (id) selectAtlasNode(id);
}

/* ---------- camera ---------- */
function updateFullscreenButton() {
  $$('[data-atlas-action="fullscreen"]').forEach((button) => {
    button.textContent = atlasState.fullscreen ? '退出全屏' : '全屏星图';
  });
}

function toggleFullscreen(force) {
  const stage = $('#atlas-stage');
  if (!stage || atlasState.expanding) return;
  const entering = force == null ? !atlasState.fullscreen : force;
  if (entering === atlasState.fullscreen) return;

  const clearStageStyles = () => {
    ['position', 'left', 'top', 'right', 'bottom', 'inset', 'width', 'height',
      'borderRadius', 'zIndex', 'boxShadow', 'margin', 'transition', 'transform', 'transformOrigin', 'willChange'].forEach((key) => {
      stage.style[key] = '';
    });
  };
  const removeBackdrop = (backdrop, delay) => {
    window.setTimeout(() => {
      backdrop.remove();
      if (atlasState.expandBackdrop === backdrop) atlasState.expandBackdrop = null;
    }, delay || 0);
  };

  atlasState.expanding = true;
  const backdrop = document.createElement('div');
  backdrop.className = 'atlas-expand-backdrop';
  document.body.appendChild(backdrop);
  atlasState.expandBackdrop = backdrop;

  if (entering) {
    restorePlanetDetail();
    atlasState.focus = null;
    atlasState.selected = null;
    atlasState.hover = null;
    atlasState.tween = null;
    updateFocusHud();
    updateLabelVisibility();
    const hint = $('#atlas-hint');
    if (hint) hint.classList.remove('hidden');

    const rect = stage.getBoundingClientRect();
    const radius = getComputedStyle(stage).borderRadius || '18px';
    atlasState.expandRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    atlasState.expandRadius = radius;
    atlasState.fullscreen = true;
    updateFullscreenButton();

    document.body.classList.add('atlas-expanding');
    stage.classList.add('is-expanding');
    stage.style.position = 'fixed';
    stage.style.inset = '0';
    stage.style.left = '0';
    stage.style.top = '0';
    stage.style.width = '100vw';
    stage.style.height = '100vh';
    stage.style.margin = '0';
    stage.style.borderRadius = radius;
    stage.style.zIndex = '9999';
    stage.style.boxShadow = '0 34px 120px rgba(0,0,0,.55)';
    stage.style.transformOrigin = '0 0';
    stage.style.transform = 'translate(' + rect.left + 'px,' + rect.top + 'px) scale(' +
      (rect.width / window.innerWidth) + ',' + (rect.height / window.innerHeight) + ')';
    resizeAtlas(window.innerWidth, window.innerHeight);
    void stage.offsetWidth;

    window.setTimeout(() => {
      stage.style.transform = 'translate(0px,0px) scale(1,1)';
      stage.style.borderRadius = '0px';
      backdrop.classList.add('show');
    }, 30);

    atlasState.expandTimer = window.setTimeout(() => {
      stage.classList.remove('is-expanding');
      stage.classList.add('is-fullscreen');
      clearStageStyles();
      stage.style.transition = 'none';
      void stage.offsetWidth;
      stage.style.transition = '';
      document.body.classList.remove('atlas-expanding');
      document.body.classList.add('atlas-fullscreen');
      backdrop.classList.remove('show');
      removeBackdrop(backdrop, 520);
      atlasState.expanding = false;
      window.setTimeout(() => {
        resizeAtlas();
        startCameraTween({ target: new THREE.Vector3(0, 0, 0), distance: 112, yaw: atlasState.yaw, pitch: atlasState.pitch }, 0.9);
      }, 30);
    }, 680);
  } else {
    const rect = atlasState.expandRect || stage.getBoundingClientRect();
    const radius = atlasState.expandRadius || '18px';
    atlasState.fullscreen = false;
    updateFullscreenButton();

    document.body.classList.add('atlas-expanding');
    stage.classList.add('is-expanding');
    stage.style.position = 'fixed';
    stage.style.inset = '0';
    stage.style.left = '0';
    stage.style.top = '0';
    stage.style.width = '100vw';
    stage.style.height = '100vh';
    stage.style.margin = '0';
    stage.style.borderRadius = '0px';
    stage.style.zIndex = '9999';
    stage.style.transformOrigin = '0 0';
    stage.style.transform = 'translate(0px,0px) scale(1,1)';
    backdrop.classList.add('show');
    void stage.offsetWidth;

    window.setTimeout(() => {
      stage.style.transform = 'translate(' + rect.left + 'px,' + rect.top + 'px) scale(' +
        (rect.width / window.innerWidth) + ',' + (rect.height / window.innerHeight) + ')';
      stage.style.borderRadius = radius;
      stage.style.boxShadow = '0 34px 120px rgba(0,0,0,.55)';
      backdrop.classList.remove('show');
    }, 30);

    atlasState.expandTimer = window.setTimeout(() => {
      stage.classList.remove('is-expanding', 'is-fullscreen');
      clearStageStyles();
      stage.style.transition = 'none';
      void stage.offsetWidth;
      stage.style.transition = '';
      document.body.classList.remove('atlas-fullscreen', 'atlas-expanding');
      backdrop.remove();
      atlasState.expandBackdrop = null;
      atlasState.expanding = false;
      window.setTimeout(() => resizeAtlas(), 30);
    }, 680);
  }
}

function bindAtlas() {
  const canvas = renderer.domElement;
  canvas.style.cursor = 'grab';
  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    atlasState.tween = null;
    atlasState.dragging = { x: event.clientX, y: event.clientY, yaw: atlasState.yaw, pitch: atlasState.pitch, moved: false, captured: false };
    if (atlasState.focus) updateLabelVisibility();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!atlasState.dragging) {
      const now = performance.now();
      if (atlasState.focus || now - lastHoverPick < 80) return;
      lastHoverPick = now;
      const hoverId = pickAtlasId(event);
      if (hoverId !== atlasState.hover) {
        atlasState.hover = hoverId;
        updateLabelVisibility();
      }
      canvas.style.cursor = hoverId ? 'pointer' : 'grab';
      return;
    }
    const dx = event.clientX - atlasState.dragging.x;
    const dy = event.clientY - atlasState.dragging.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) atlasState.dragging.moved = true;
    if (atlasState.dragging.moved && !atlasState.dragging.captured) {
      try { canvas.setPointerCapture(event.pointerId); } catch (e) {}
      atlasState.dragging.captured = true;
    }
    atlasState.yawGoal = atlasState.dragging.yaw - dx * 0.005;
    atlasState.pitchGoal = Math.max(-0.12, Math.min(0.95, atlasState.dragging.pitch + dy * 0.004));
    atlasState.auto = false;
    if (atlasState.focus && atlasState.layout) {
      const node = atlasState.layout.positions[atlasState.focus];
      if (node) atlasState.targetGoal.copy(focusView(node, atlasState.yawGoal).target);
    }
    updateAutoButton();
  });
  canvas.addEventListener('pointerleave', () => {
    if (atlasState.hover) {
      atlasState.hover = null;
      updateLabelVisibility();
    }
  });
  const end = (event) => {
    if (!atlasState.dragging) return;
    if (atlasState.dragging.moved) suppressClick = true;
    if (atlasState.dragging.captured) {
      try { canvas.releasePointerCapture(event.pointerId); } catch (e) {}
    }
    atlasState.dragging = null;
    canvas.style.cursor = 'grab';
    updateLabelVisibility();
    updateLabelPositions();
    if (!suppressClick) scheduleAtlasClick(event);
    setTimeout(() => { suppressClick = false; }, 50);
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('dblclick', (event) => {
    event.preventDefault();
    clearTimeout(atlasClickTimer);
    atlasClickTimer = null;
    toggleFullscreen();
  });
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    atlasState.tween = null;
    const range = zoomRange();
    const oldDistance = atlasState.distanceGoal;
    const nextDistance = Math.max(range.min, Math.min(range.max, oldDistance * (event.deltaY < 0 ? 0.9 : 1.1)));
    const hoverNode = atlasState.hover && atlasState.layout && atlasState.layout.positions[atlasState.hover];
    let anchor = hoverNode ? hoverNode.position : null;
    if (!anchor && camera) {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hit = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, hit)) anchor = hit;
    }
    if (anchor) {
      const ratio = nextDistance / oldDistance;
      const offset = atlasState.targetGoal.clone().sub(anchor).multiplyScalar(ratio);
      atlasState.targetGoal.copy(anchor).add(offset);
    }
    atlasState.distanceGoal = nextDistance;
    if (atlasState.distanceGoal >= 108) atlasState.targetGoal.set(0, 0, 0);
    clearTimeout(zoomAnchorTimer);
    zoomAnchorTimer = window.setTimeout(() => { zoomAnchor = null; }, 220);
    atlasState.auto = false;
    updateAutoButton();
  }, { passive: false });

  const focusHost = $('#atlas-focus');
  const focusClose = $('[data-atlas-focus-close]');
  if (focusClose) {
    focusClose.addEventListener('click', (event) => {
      event.stopPropagation();
      leaveFocus();
    });
  }
  if (focusHost) {
    focusHost.addEventListener('click', (event) => {
      if (event.target.closest('[data-atlas-focus-close]') || event.target.closest('[data-atlas-focus-back]')) { leaveFocus(); return; }
      if (event.target.closest('[data-atlas-focus-info]') && atlasState.focus) openLocation(atlasState.focus, false);
      const site = event.target.closest('[data-focus-site]');
      if (site) openLocation(site.dataset.focusSite, false);
    });
  }
  $$('[data-atlas-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.atlasAction;
      if (action === 'fullscreen') { toggleFullscreen(); return; }
      if (action === 'zoom-in' || action === 'zoom-out') atlasState.tween = null;
      const range = zoomRange();
      if (action === 'zoom-in') atlasState.distanceGoal = Math.max(range.min, atlasState.distanceGoal * 0.84);
      if (action === 'zoom-out') atlasState.distanceGoal = Math.min(range.max, atlasState.distanceGoal * 1.18);
      if (action === 'auto') { atlasState.auto = !atlasState.auto; updateAutoButton(); }
      if (action === 'reset') {
        restorePlanetDetail();
        atlasState.tween = null;
        atlasState.yawGoal = 0.35; atlasState.pitchGoal = 0.78; atlasState.distanceGoal = 112;
        atlasState.focus = null; atlasState.selected = null; atlasState.hover = null; atlasState.targetGoal.set(0, 0, 0);
        atlasState.auto = true; updateAutoButton(); updateFocusHud();
        const stage = $('#atlas-stage'); if (stage) stage.classList.remove('is-focused');
        const hint = $('#atlas-hint'); if (hint) hint.classList.remove('hidden');
      }
      updateLabelVisibility();
    });
  });
  window.addEventListener('resize', resizeAtlas);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || (els.dialog && els.dialog.open)) return;
    const search = document.getElementById('search-overlay');
    if (search && !search.hidden) return;
    if (atlasState.fullscreen) { toggleFullscreen(false); return; }
    if (atlasState.focus) leaveFocus();
  });
}

function updateAutoButton() {
  const dot = $('[data-atlas-action="auto"] .rotate-dot');
  if (dot) dot.classList.toggle('active', atlasState.auto);
}

function resizeAtlas(width, height) {
  if (!renderer || !camera) return;
  atlasW = width || els.canvas.clientWidth;
  atlasH = height || els.canvas.clientHeight;
  if (!atlasW || !atlasH) return;
  renderer.setSize(atlasW, atlasH);
  camera.aspect = atlasW / atlasH;
  camera.updateProjectionMatrix();
}

function animate(t) {
  requestAnimationFrame(animate);
  if (!renderer) return;
  if (document.hidden || !atlasInView) {
    lastFrame = (typeof t === 'number' ? t : performance.now()) * 0.001;
    return;
  }
  if (typeof t !== 'number') t = performance.now();
  const now = t * 0.001;
  const delta = Math.min(now - (lastFrame || now), 0.05);
  lastFrame = now;
  elapsed += delta;
  if (texturesReady && atlasState.auto && !atlasState.dragging) atlasState.yawGoal += delta * 0.012;
  if (atlasState.tween) {
    const tw = atlasState.tween;
    const k = Math.min(1, (now - tw.start) / tw.duration);
    const e = easeInOutCubic(k);
    atlasState.yaw = lerp(tw.from.yaw, tw.to.yaw, e);
    atlasState.pitch = lerp(tw.from.pitch, tw.to.pitch, e);
    atlasState.distance = lerp(tw.from.distance, tw.to.distance, e);
    atlasState.target.copy(tw.from.target).lerp(tw.to.target, e);
    if (k >= 1) atlasState.tween = null;
  } else {
    atlasState.yaw = lerp(atlasState.yaw, atlasState.yawGoal, 0.06);
    atlasState.pitch = lerp(atlasState.pitch, atlasState.pitchGoal, 0.06);
    atlasState.distance = lerp(atlasState.distance, atlasState.distanceGoal, 0.06);
    atlasState.target.lerp(atlasState.targetGoal, 0.1);
  }
  const r = atlasState.distance;
  const p = atlasState.pitch;
  camera.position.set(
    atlasState.target.x + Math.sin(atlasState.yaw) * Math.cos(p) * r,
    atlasState.target.y + Math.sin(p) * r,
    atlasState.target.z + Math.cos(atlasState.yaw) * Math.cos(p) * r
  );
  camera.lookAt(atlasState.target);
  if (fillLight) {
    fillLight.position.copy(camera.position);
    fillLight.target.position.copy(atlasState.target);
    fillLight.intensity = lerp(fillLight.intensity, atlasState.focus ? 2.6 : 0.35, 0.05);
  }
  if (ambientLight) ambientLight.intensity = lerp(ambientLight.intensity, atlasState.focus ? 1.35 : 0.95, 0.05);
  if (systemGroup) systemGroup.updateMatrixWorld();
  if (starField) starField.rotation.y += delta * 0.0015;
  if (systemGroup && systemGroup.userData.star) {
    systemGroup.userData.star.rotation.y += delta * 0.025;
    if (systemGroup.userData.starUniforms) systemGroup.userData.starUniforms.uTime.value = elapsed;
    const prominence = systemGroup.userData.prominence;
    if (prominence) {
      prominence.rotation.z += delta * 0.035;
      prominence.material.opacity = 0.24 + Math.sin(elapsed * 1.1) * 0.08;
    }
  }
  if (systemGroup) {
    systemGroup.children.forEach((obj) => {
      if (obj.userData && obj.userData.shopRing) { obj.quaternion.copy(camera.quaternion); obj.visible = !atlasState.focus; }
      if (obj.userData && (obj.userData.stationBeacon || obj.userData.stationHalo)) obj.visible = !atlasState.focus;
      if (obj.userData && obj.userData.station) obj.rotation.y += delta * 0.055;
    });
  }
  labelTimer += delta;
  if (!isFinite(labelTimer)) labelTimer = 0;
  if (labelTimer > 0.12) {
    updateLabelVisibility();
    updateLabelPositions();
    labelTimer = 0;
  }
  renderer.render(scene, camera);
}

function lerp(a, b, t) { return a + (b - a) * t; }

/* ---------- atlas init ---------- */
function initAtlas() {
  els.canvas = $('#atlas-canvas');
  els.labels = $('#atlas-labels');
  els.loading = $('#atlas-loading');
  if (!els.canvas) return;
  atlasW = els.canvas.clientWidth;
  atlasH = els.canvas.clientHeight;
  labelLayer = els.labels;

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    if (els.loading) els.loading.classList.add('done');
    const stage = document.getElementById('atlas-stage');
    if (stage && !stage.querySelector('.atlas-fallback')) {
      const fallback = document.createElement('div');
      fallback.className = 'atlas-fallback';
      fallback.innerHTML = '<b>三维星图无法启动</b><span>当前浏览器或显卡未启用 WebGL。地点与商店列表仍可正常使用；开启硬件加速或更换浏览器后可查看三维星图。</span>';
      stage.appendChild(fallback);
    }
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setSize(atlasW, atlasH);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.domElement.setAttribute('aria-label', '斯坦顿、派罗与尼克斯三维星系图');
  els.canvas.appendChild(renderer.domElement);
  if ('IntersectionObserver' in window) {
    const viewObserver = new IntersectionObserver((entries) => {
      atlasInView = entries.some((entry) => entry.isIntersecting);
    }, { threshold: 0.01 });
    viewObserver.observe(els.canvas);
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(44, atlasW / atlasH, 0.1, 600);
  raycaster = new THREE.Raycaster();
  scene.add(makeStarfield());
  starField = scene.children[scene.children.length - 1];
  ambientLight = new THREE.AmbientLight(0x718391, 0.95);
  scene.add(ambientLight);
  fillLight = new THREE.DirectionalLight(0xb9d4e6, 0.35);
  fillLight.position.set(0, 8, 24);
  fillLight.target.position.set(0, 0, 0);
  scene.add(fillLight);
  scene.add(fillLight.target);
  const sun = new THREE.DirectionalLight(0xffd7ad, 2.8);
  sun.position.set(-25, 18, 24);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x6f9bb7, 0.95);
  rim.position.set(20, -10, -24);
  scene.add(rim);

  const manager = new THREE.LoadingManager();
  manager.onLoad = () => {
    texturesReady = true;
    if (els.loading) els.loading.classList.add('done');
    buildSystem(state.system);
    updateLabelVisibility();
  };
  manager.onError = () => {
    if (els.loading) els.loading.innerHTML = '<b>ATLAS TEXTURE ERROR</b><small>无法载入行星贴图</small>';
  };
  const loader = new THREE.TextureLoader(manager);
  Object.entries({ sun: STAR_TEXTURE, ...PLANET_TEXTURES, ...MOON_TEXTURES }).forEach(([id, src]) => {
    const texture = loader.load(src);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textures[id] = texture;
  });

  bindAtlas();
  resizeAtlas();
  requestAnimationFrame(animate);
}

/* ---------- location index ---------- */
function locationSorted(systemId) {
  return SC.locations.filter((loc) => loc.system === systemId && !(SC.isHiddenLocation && SC.isHiddenLocation(loc.id))).sort((a, b) => {
    const feature = (loc) => (loc.type === 'landing' || ['checkmate', 'ruin', 'orbituary'].includes(loc.id)) ? 0 : (isShop(loc.id) ? 1 : 2);
    return feature(a) - feature(b) || a.name.localeCompare(b.name);
  });
}

function filteredLocations() {
  let locations = locationSorted(state.system);
  if (state.filter === 'main') locations = locations.filter((loc) => loc.type === 'landing' || ['checkmate', 'ruin', 'orbituary'].includes(loc.id));
  if (state.filter === 'shops') locations = locations.filter((loc) => isShop(loc.id));
  if (state.filter === 'ships') locations = locations.filter((loc) => { const d = SC_SHOPS.locations[loc.id]; return d && d.counts.buy; });
  if (state.filter === 'weapons') locations = locations.filter((loc) => { const d = SC_SHOPS.locations[loc.id]; return d && d.counts.weapons; });
  if (state.filter === 'rent') locations = locations.filter((loc) => { const d = SC_SHOPS.locations[loc.id]; return d && d.counts.rent; });
  return locations;
}

function renderFilters() {
  const host = els.filters;
  if (!host) return;
  const locations = locationSorted(state.system);
  const count = (fn) => locations.filter(fn).length;
  const defs = [
    ['all', '全部', locations.length],
    ['main', '主要地点', count((l) => l.type === 'landing' || ['checkmate', 'ruin', 'orbituary'].includes(l.id))],
    ['shops', '商店', count((l) => isShop(l.id))],
    ['ships', '有飞船商店', count((l) => { const d = SC_SHOPS.locations[l.id]; return d && d.counts.buy; })],
    ['weapons', '有飞船武器', count((l) => { const d = SC_SHOPS.locations[l.id]; return d && d.counts.weapons; })],
    ['rent', '可租赁', count((l) => { const d = SC_SHOPS.locations[l.id]; return d && d.counts.rent; })]
  ];
  host.innerHTML = defs.map(([key, label, n]) => `<button type="button" class="${state.filter === key ? 'active' : ''}" data-filter="${key}">${label} <small>${n}</small></button>`).join('');
}

function shipPreview(loc, shop) {
  if (!shop || !shop.buy.length) return '';
  const seen = [];
  const html = [];
  shop.buy.forEach((entry) => {
    if (seen.includes(entry.shipId) || html.length >= 3) return;
    const ship = SC.shipById(entry.shipId);
    const media = ship && SC.shipMedia(ship.id);
    if (!ship || !media || !media.card) return;
    seen.push(entry.shipId);
    html.push(`<img src="${esc(media.card)}" width="800" height="450" alt="${esc(ship.name)}" loading="lazy" decoding="async">`);
  });
  if (!html.length) return '';
  const more = shop.counts.buy - html.length;
  return `<div class="place-preview">${html.join('')}${more > 0 ? `<span class="place-preview-more">+${more}</span>` : ''}</div>`;
}

function locationArt(loc, large) {
  const seed = String(loc.id).split('').reduce((n, c) => (n * 33 + c.charCodeAt(0)) >>> 0, 5381);
  const rnd = (i) => ((seed >>> (i % 16)) & 31) / 31;
  const stroke = 'stroke="currentColor" fill="none" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"';
  if (loc.type === 'landing') {
    let x = 18;
    let d = 'M18 132h204M18 146h204';
    for (let i = 0; i < 9; i++) {
      const w = 14 + rnd(i) * 12;
      const h = 28 + rnd(i + 3) * 76;
      const roof = rnd(i + 7) > 0.5 ? `M${x} ${132 - h}l${w / 2} -10 ${w / 2} 10` : `M${x} ${132 - h}h${w}`;
      d += `M${x} 132V${132 - h}${roof}`;
      x += w + 6;
    }
    return `<svg viewBox="0 0 240 160" aria-hidden="true" ${stroke}>${`<path d="${d}"/>`}<path d="M28 120h186" stroke-dasharray="3 7" opacity=".45"/><circle cx="${60 + rnd(4) * 100}" cy="${90 + rnd(5) * 20}" r="2.5" fill="currentColor" stroke="none"/></svg>`;
  }
  if (loc.type === 'station') {
    const r = 32 + rnd(2) * 12;
    return `<svg viewBox="0 0 240 160" aria-hidden="true" ${stroke}>
      <circle cx="120" cy="80" r="${r}"/><circle cx="120" cy="80" r="${r + 18}" stroke-dasharray="3 8"/>
      <ellipse cx="120" cy="80" rx="${84 + rnd(3) * 12}" ry="${18 + rnd(4) * 8}" transform="rotate(${-24 + rnd(5) * 38} 120 80)" stroke-dasharray="2 7"/>
      <rect x="${120 - 11}" y="${80 - 11}" width="22" height="22" transform="rotate(45 120 80)"/><circle cx="120" cy="80" r="4" fill="currentColor" stroke="none"/>
    </svg>`;
  }
  if (loc.type === 'salvage') {
    return `<svg viewBox="0 0 240 160" aria-hidden="true" ${stroke}><path d="M74 78a46 46 0 1 1-8 35"/><path d="M58 78h22V56"/><path d="M110 68l20 24M130 68l-20 24"/><circle cx="120" cy="80" r="58" stroke-dasharray="3 8" opacity=".4"/></svg>`;
  }
  if (loc.type === 'moon') {
    return `<svg viewBox="0 0 240 160" aria-hidden="true" ${stroke}><circle cx="120" cy="80" r="42"/><path d="M88 60c18 4 22 20 8 32M132 94c20-8 28-2 34 14" opacity=".45"/><circle cx="120" cy="80" r="64" stroke-dasharray="3 8" opacity=".4"/></svg>`;
  }
  if (loc.type === 'poi') {
    return `<svg viewBox="0 0 240 160" aria-hidden="true" ${stroke}><path d="M120 22v116M62 80h116"/><circle cx="120" cy="80" r="26"/><circle cx="120" cy="80" r="4" fill="currentColor" stroke="none"/><path d="M90 50l60 60M150 50l-60 60" opacity=".35"/></svg>`;
  }
  if (loc.type === 'jump') {
    return `<svg viewBox="0 0 240 160" aria-hidden="true" ${stroke}><circle cx="120" cy="80" r="35"/><circle cx="120" cy="80" r="55" stroke-dasharray="3 8"/><path d="M120 25v18M120 117v18M65 80h18M157 80h18"/><path d="M104 92l16-24 16 24"/></svg>`;
  }
  return `<svg viewBox="0 0 240 160" aria-hidden="true" ${stroke}><path d="M120 22l58 34v68l-58 34-58-34V56z"/><circle cx="120" cy="80" r="5" fill="currentColor" stroke="none"/></svg>`;
}

function stockPreview(shop, feature) {
  if (!shop) return '';
  const limit = feature ? 2 : 1;
  const lines = [];
  const weapons = shop.weapons || [];
  const rent = shop.rent || [];
  if (weapons.length) {
    const names = weapons.slice().sort((a, b) => a.size - b.size || a.price - b.price).slice(0, limit).map(weaponName).join(' · ');
    const more = weapons.length - Math.min(limit, weapons.length);
    lines.push(`<p class="place-stock-line"><span>飞船武器</span>${esc(names)}${more > 0 ? ` <em>+${more}</em>` : ''}</p>`);
  }
  if (rent.length) {
    const names = rent.slice(0, limit).map((item) => { const ship = SC.shipById(item.shipId); return ship ? ship.name : ''; }).filter(Boolean).join(' · ');
    const more = rent.length - Math.min(limit, rent.length);
    if (names) lines.push(`<p class="place-stock-line rent"><span>租赁</span>${esc(names)}${more > 0 ? ` <em>+${more}</em>` : ''}</p>`);
  }
  if (shop.components && shop.components.length) {
    const unique = new Set(shop.components.map((entry) => entry.componentId)).size;
    lines.push(`<p class="place-stock-line components"><span>配件</span>${unique} 件在售</p>`);
  }
  return lines.join('');
}

function cardMarkup(loc, index) {
  const shop = SC_SHOPS.locations[loc.id];
  const story = storyFor(loc);
  const media = locationMedia(loc);
  const feature = loc.type === 'landing' || ['checkmate', 'ruin', 'orbituary'].includes(loc.id);
  const tagline = story ? (feature ? story.story[0] : story.tagline) : SC.zhText(loc.desc);
  const taglineText = SC.localizeShopText ? SC.localizeShopText(tagline) : tagline;
  const countItems = shop ? [['buy', '在售'], ['components', '配件'], ['rent', '租赁']].filter(([key]) => ((shop.counts || {})[key] || 0) > 0) : [];
  const counts = countItems.length
    ? `<div class="place-counts">${countItems.map(([key, label]) => `<span><b>${shop.counts[key]}</b>${label}</span>`).join('')}</div>`
    : '';
  const facilities = (loc.services || []).slice(0, 4).map((service) => `<span>${esc(SC.serviceName ? SC.serviceName(service) : service)}</span>`).join('');
  const risk = riskLabel(loc.danger);
  const visual = media
    ? `<img class="place-visual-media" src="${esc(media.card)}" alt="${esc(zhName(loc))} 实景" loading="lazy" decoding="async">`
    : `<div class="place-visual-art">${locationArt(loc)}</div>`;
  return `<a class="place-card reveal${feature ? ' feature' : ''}${!shop ? ' no-shop' : ''}" href="systems.html?loc=${esc(loc.id)}" data-loc="${esc(loc.id)}" style="--i:${index % 6}">
    <div class="place-visual">
      ${visual}
      <span class="place-type-chip${risk ? ' risk-d' + loc.danger : ''}">${esc(typeLabel(loc.type))}${risk ? ' · ' + esc(risk) : ''}</span>
      <div class="place-visual-title"><h3>${esc(zhName(loc))}</h3><p>${esc(loc.name)} · ${esc(parentLabel(loc))}</p></div>
      ${counts}
    </div>
    <div class="place-body">
      <p class="place-tagline">${esc(taglineText)}</p>
      ${facilities ? `<div class="place-facilities">${facilities}</div>` : ''}
      ${stockPreview(shop, feature)}
      ${shipPreview(loc, shop)}
      <div class="place-foot"><span>${shop ? (shop.counts.buy ? '商店档案 · ' + shop.counts.buy + ' 艘在售' : (shop.counts.components ? '配件档案 · ' + shop.counts.components + ' 种有售' : '商店档案')) : esc(typeLabel(loc.type)) + '档案'}</span><span class="open">${shop ? '查看商品' : '查看地点'} →</span></div>
    </div>
  </a>`;
}

function renderCards() {
  if (!els.grid) return;
  const locations = filteredLocations();
  if (!locations.length) {
    els.grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><b>没有匹配的地点</b>调整筛选条件。</div>';
    return;
  }
  els.grid.innerHTML = locations.map(cardMarkup).join('');
  if (typeof SC.refreshReveal === 'function') SC.refreshReveal();
  if (SC.bindTilt) SC.bindTilt('.place-card');
}

function switchSystem(id, updateUrl) {
  if (!systemById(id)) return;
  state.system = id;
  state.filter = 'all';
  atlasState.selected = null; atlasState.hover = null;
  restorePlanetDetail();
  atlasState.tween = null;
  $$('[data-system]', els.tabs).forEach((button) => button.classList.toggle('active', button.dataset.system === id));
  if (renderer && texturesReady) buildSystem(id);
  atlasState.focus = null;
  atlasState.yawGoal = 0.35; atlasState.pitchGoal = 0.78; atlasState.distanceGoal = 112;
  atlasState.targetGoal.set(0, 0, 0);
  atlasState.auto = true; updateAutoButton();
  updateFocusHud();
  const stage = $('#atlas-stage'); if (stage) stage.classList.remove('is-focused');
  const hint = $('#atlas-hint'); if (hint) hint.classList.remove('hidden');
  updateCount();
  renderFilters();
  renderCards();
  closeDialog(false);
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('system', id);
    url.searchParams.delete('loc');
    try { history.replaceState({}, '', url.pathname + '?' + url.searchParams.toString() + url.hash); } catch (e) {}
  }
}

function updateCount() {}

/* ---------- location dialog ---------- */
function componentSpecs(entry) {
  if (entry.statLines && entry.statLines.length) {
    return entry.statLines.slice(0, 4).map((line) => `<span><i>${esc(line.label)}</i><b>${esc(line.value)}</b></span>`).join('');
  }
  const stats = entry.stats || {};
  const rows = [];
  const add = (label, value, digits) => {
    if (value == null || value === '') return;
    rows.push(`<span><i>${label}</i><b>${Number(value).toLocaleString('en-US', { maximumFractionDigits: digits == null ? 1 : digits })}</b></span>`);
  };
  if (entry.type === 'power') {
    add('出力', stats.output);
    add('耐久', stats.durability);
  } else if (entry.type === 'shield') {
    add('护盾', stats.max, 0);
    add('恢复 / 秒', stats.regen, 0);
    add('功耗', stats.power);
    add('耐久', stats.durability, 0);
  } else if (entry.type === 'cooler') {
    add('制冷', stats.rate);
    add('功耗', stats.power);
  } else if (entry.type === 'quantum') {
    if (stats.speed != null) rows.push(`<span><i>速度</i><b>${fmt(Math.round(stats.speed / 1000))} km/s</b></span>`);
    add('充能', stats.spool);
    add('冷却', stats.cooldown);
    add('燃料', stats.fuel);
  } else if (entry.type === 'weapon') {
    add('DPS', stats.dps);
    add('持续 DPS', stats.sustained);
    if (stats.range != null) rows.push(`<span><i>射程</i><b>${(stats.range / 1000).toFixed(1)} km</b></span>`);
    add('单发伤害', stats.alpha);
  }
  return rows.slice(0, 4).join('');
}

function stockCard(entry, kind) {
  if (kind === 'weapon' || kind === 'weapons') {
    const type = SC.weaponType ? SC.weaponType(entry) : '';
    const stats = SC.weaponStats ? SC.weaponStats(entry) : null;
    const stat = (value, digits) => value == null ? '—' : Number(value).toLocaleString('en-US', { maximumFractionDigits: digits == null ? 1 : digits });
    const range = stats && stats.range != null ? (stats.range / 1000).toFixed(1) + ' km' : '—';
    return `<article class="stock-card weapon">
      <div class="stock-card-head"><span class="stock-size">S${esc(entry.size || '—')}</span><span class="stock-kind">${esc(type)}</span></div>
      <b class="stock-name">${esc(weaponName(entry))}</b>
      <small class="stock-sub">${esc(weaponManu(entry))} · ${esc(shopName(entry.shop))}</small>
      <div class="weapon-combat">
        <span><i>DPS</i><b>${stat(stats && stats.dps)}</b></span>
        <span><i>持续 DPS</i><b>${stat(stats && stats.sustained)}</b></span>
        <span><i>射程</i><b>${range}</b></span>
        <span><i>单发伤害</i><b>${stat(stats && stats.alpha)}</b></span>
      </div>
      <div class="stock-price">${fmt(entry.price)}<small>aUEC</small></div>
    </article>`;
  }
  if (kind === 'component' || kind === 'components') {
    const displayName = entry.type === 'weapon' ? weaponName(entry) : entry.name;
    const klass = entry.type === 'weapon' && SC.weaponType ? SC.weaponType({ name: entry.en || entry.name }) : componentClassLabel(entry.itemClass);
    const classText = klass ? ` · ${esc(klass)}` : '';
    const gradeText = entry.grade ? ` · ${esc(entry.grade)} 级` : '';
    const warning = entry.type === 'weapon' && entry.stats && !entry.stats.dps ? '<p class="stock-warning">点防御发射器，暂无舰炮 DPS。</p>' : '';
    return `<article class="stock-card component">
      <div class="stock-card-head"><span class="stock-size">S${esc(entry.size == null ? '—' : entry.size)}</span><span class="stock-kind">${esc(componentTypeLabel(entry.type))}</span></div>
      <b class="stock-name">${esc(displayName)}</b>
      <small class="stock-sub">${esc(SC.manuName ? SC.manuName(entry.manu) : entry.manu)}${classText}${gradeText} · ${esc(shopName(entry.shop))}</small>
      <div class="stock-specs">${componentSpecs(entry)}</div>
      ${warning}
      <div class="stock-price">${fmt(entry.price)}<small>aUEC</small></div>
    </article>`;
  }
  const ship = SC.shipById(entry.shipId);
  if (!ship) return '';
  const media = SC.shipMedia(ship.id) || {};
  const image = media.card ? `<img src="${esc(media.card)}" width="800" height="450" alt="${esc(ship.name)}" loading="lazy" decoding="async">` : '';
  const specs = `<div class="stock-specs">
    <span><i>货舱</i><b>${ship.cargo ? fmt(ship.cargo) + ' SCU' : '—'}</b></span>
    <span><i>乘员</i><b>${esc(ship.crew)}</b></span>
    <span><i>SCM</i><b>${ship.scm ? fmt(ship.scm) + ' m/s' : '—'}</b></span>
    <span><i>武装</i><b>${esc(ship.weapons || '—')}</b></span>
  </div>`;
  if (kind === 'rent') {
    return `<article class="stock-card">
      <div class="stock-card-media">${image}</div>
      <div class="stock-card-body">
        <b class="stock-name">${esc(ship.name)}</b>
        <small class="stock-sub">${esc([ship.cn, shopName(entry.shop)].filter(Boolean).join(' · '))}</small>
        ${specs}
        <div class="stock-price">${fmt(entry.days[0])}<small>1日 / aUEC</small></div>
        <div class="stock-days">7日 ${fmt(entry.days[2])} · 30日 ${fmt(entry.days[3])}</div>
      </div>
    </article>`;
  }
  return `<article class="stock-card">
    <div class="stock-card-media">${image}</div>
    <div class="stock-card-body">
      <b class="stock-name">${esc(ship.name)}</b>
      <small class="stock-sub">${esc(ship.cn)} · ${esc(SC.manuName(ship.maker))}</small>
      ${specs}
      <div class="stock-price">${fmt(entry.price)}<small>aUEC</small></div>
    </div>
  </article>`;
}

function stockItems(shop, tab) {
  if (!shop) return [];
  if (tab === 'ships') return shop.buy.slice().sort((a, b) => a.price - b.price);
  if (tab === 'weapons') return shop.weapons.slice().sort((a, b) => a.size - b.size || a.price - b.price);
  if (tab === 'rent') return shop.rent.slice().sort((a, b) => a.days[0] - b.days[0]);
  if (tab === 'components') {
    return (shop.components || []).slice().sort((a, b) =>
      (componentOrder[a.type] || 0) - (componentOrder[b.type] || 0) ||
      (a.size || 0) - (b.size || 0) ||
      a.name.localeCompare(b.name));
  }
  return [];
}

function stockSizeOf(entry, tab) {
  if (tab === 'weapons' || tab === 'components') return entry.size;
  const ship = SC.shipById(entry.shipId);
  return ship ? ship.size : null;
}

function renderStockTools(loc, tab) {
  const host = $('#dialog-stock-tools');
  if (!host) return;
  const shop = SC_SHOPS.locations[loc.id];
  const items = stockItems(shop, tab);
  if (!items.length) { host.innerHTML = ''; return; }
  const base = stockItems(shop, tab);
  const uniqueBase = [];
  const seenBase = {};
  base.forEach((entry) => {
    const key = entry.componentId || entry.shipId || entry.name;
    if (seenBase[key]) return;
    seenBase[key] = true;
    uniqueBase.push(entry);
  });
  const scoped = tab === 'components'
    ? items.filter((entry) =>
      (state.componentType === 'all' || entry.type === state.componentType) &&
      (!weaponComponentTypes[state.componentType] || state.componentWeapon === 'all' || weaponComponentKind(entry) === state.componentWeapon) &&
      (state.componentGrade === 'all' || entry.grade === state.componentGrade) &&
      (state.componentClass === 'all' || (entry.itemClass || '') === state.componentClass))
    : (tab === 'ships' || tab === 'rent'
      ? items.filter((entry) => {
        if (state.shipRole === 'all') return true;
        const ship = SC.shipById(entry.shipId);
        return ship && SC.primaryRole && SC.primaryRole(ship) === state.shipRole;
      })
      : items);
  const sizes = Array.from(new Set(scoped.map((entry) => stockSizeOf(entry, tab)).filter((value) => value != null))).sort((a, b) => a - b);
  const prices = scoped.map((entry) => tab === 'rent' ? entry.days[0] : entry.price);
  const sizeLabel = (size) => tab === 'weapons' || tab === 'components' ? 'S' + size : (SC.sizes[size] || size);
  const typeCounts = tab === 'components'
    ? Array.from(new Set(uniqueBase.map((entry) => entry.type))).sort((a, b) => (componentOrder[a] || 0) - (componentOrder[b] || 0)).map((type) => [type, uniqueBase.filter((entry) => entry.type === type).length])
    : [];
  const typeFilter = typeCounts.length > 1
    ? `<div class="component-type-filter" role="group" aria-label="按配件类别筛选">
        <button type="button" class="${state.componentType === 'all' ? 'active' : ''}" data-component-type="all">全部类别 <small>${uniqueBase.length}</small></button>
        ${typeCounts.map(([type, n]) => `<button type="button" class="${state.componentType === type ? 'active' : ''}" data-component-type="${esc(type)}">${esc(componentTypeLabel(type))} <small>${n}</small></button>`).join('')}
      </div>`
    : '';
  const typeBase = state.componentType === 'all' ? uniqueBase : uniqueBase.filter((entry) => entry.type === state.componentType);
  const grades = tab === 'components' ? Array.from(new Set(typeBase.map((entry) => entry.grade).filter(Boolean))).sort() : [];
  const weaponMode = !!weaponComponentTypes[state.componentType];
  const classes = tab === 'components' ? Array.from(new Set(typeBase.filter((entry) => !weaponComponentTypes[entry.type]).map((entry) => entry.itemClass || '').filter(Boolean))).sort() : [];
  const weaponKinds = weaponMode ? Array.from(new Set(uniqueBase.filter((entry) => entry.type === state.componentType).map(weaponComponentKind))).sort() : [];
  const shipRoles = (tab === 'ships' || tab === 'rent')
    ? Array.from(new Set(uniqueBase.map((entry) => { const ship = SC.shipById(entry.shipId); return ship && SC.primaryRole ? SC.primaryRole(ship) : null; }).filter(Boolean))).sort()
    : [];
  const shipRoleFilter = shipRoles.length > 1
    ? `<div class="component-type-filter" role="group" aria-label="按用途筛选">
        <button type="button" class="${state.shipRole === 'all' ? 'active' : ''}" data-ship-role="all">全部用途 <small>${uniqueBase.length}</small></button>
        ${shipRoles.map((role) => `<button type="button" class="${state.shipRole === role ? 'active' : ''}" data-ship-role="${esc(role)}">${esc(role)} <small>${uniqueBase.filter((entry) => { const ship = SC.shipById(entry.shipId); return ship && SC.primaryRole && SC.primaryRole(ship) === role; }).length}</small></button>`).join('')}
      </div>`
    : '';
  const weaponFilter = weaponMode && weaponKinds.length > 1
    ? `<div class="component-type-filter" role="group" aria-label="按武器类型筛选"><span class="filter-caption">武器类型</span>
        <button type="button" class="${state.componentWeapon === 'all' ? 'active' : ''}" data-component-weapon="all">全部</button>
        ${weaponKinds.map((kind) => `<button type="button" class="${state.componentWeapon === kind ? 'active' : ''}" data-component-weapon="${esc(kind)}">${esc(kind)}</button>`).join('')}
      </div>`
    : '';
  const gradeFilter = !weaponMode && grades.length > 1
    ? `<div class="component-type-filter" role="group" aria-label="按等级筛选"><span class="filter-caption">品质等级</span>
        <button type="button" class="${state.componentGrade === 'all' ? 'active' : ''}" data-component-grade="all">全部</button>
        ${grades.map((grade) => `<button type="button" class="${state.componentGrade === grade ? 'active' : ''}" data-component-grade="${esc(grade)}">${esc(grade)} 级</button>`).join('')}
      </div>`
    : '';
  const classFilter = !weaponMode && classes.length > 1
    ? `<div class="component-type-filter" role="group" aria-label="按级别筛选"><span class="filter-caption">用途级别</span>
        <button type="button" class="${state.componentClass === 'all' ? 'active' : ''}" data-component-class="all">全部</button>
        ${classes.map((value) => `<button type="button" class="${state.componentClass === value ? 'active' : ''}" data-component-class="${esc(value)}">${esc(componentClassLabel(value))}</button>`).join('')}
      </div>`
    : '';
  const priceSummary = prices.length
    ? `价格区间 <b>${fmt(Math.min.apply(null, prices))}</b> – <b>${fmt(Math.max.apply(null, prices))}</b> aUEC`
    : '当前筛选无结果';
  const uniqueCount = tab === 'components'
    ? new Set(scoped.map((entry) => entry.componentId)).size
    : scoped.length;
  const countText = tab === 'components'
    ? `共 <b>${scoped.length}</b> 条购买记录 · <b>${uniqueCount}</b> 种配件`
    : `共 <b>${scoped.length}</b> 条记录`;
  host.innerHTML = `<div class="stock-summary"><span>${countText}</span><span>${priceSummary}</span></div>
    ${shipRoleFilter}${typeFilter}${weaponFilter}${gradeFilter}${classFilter}
    ${sizes.length > 1 ? `<div class="weapon-sizes" role="group" aria-label="按尺寸筛选">
      <button type="button" class="${state.stockFilter === 'all' ? 'active' : ''}" data-stock-filter="all">全部 <small>${scoped.length}</small></button>
      ${sizes.map((size) => `<button type="button" class="${String(state.stockFilter) === String(size) ? 'active' : ''}" data-stock-filter="${esc(size)}">${esc(sizeLabel(size))}</button>`).join('')}
    </div>` : ''}`;
}

function renderDialogStock(loc, tab) {
  const shop = SC_SHOPS.locations[loc.id];
  const host = $('#dialog-stock-body');
  const pager = $('#dialog-stock-pager');
  if (!host) return;
  if (!shop) {
    host.innerHTML = '<div class="dialog-stock-empty">该地点没有商店商品记录。</div>';
    if (pager) pager.innerHTML = '';
    renderStockTools(loc, tab);
    return;
  }
  if (tab === 'packages') {
    const p = SC_SHOPS.package;
    host.innerHTML = p ? `<div class="dialog-stock-list"><article class="stock-card"><div class="stock-card-media"><img src="${esc(p.image)}" width="1600" height="900" alt="${esc(p.name)}" loading="lazy" decoding="async"></div><div class="stock-card-body"><b class="stock-name">${esc(p.name)}</b><small class="stock-sub">RSI 官网商品</small><div class="stock-specs"><span><i>内容</i><b>${esc(p.includes.join(' · '))}</b></span></div><div class="stock-price">$${p.priceUSD}<small>官网</small></div></div></article></div>` : '<div class="dialog-stock-empty">暂无套装记录。</div>';
    if (pager) pager.innerHTML = '';
    renderStockTools(loc, tab);
    return;
  }
  const allTyped = stockItems(shop, tab);
  const typed = tab === 'components'
    ? allTyped.filter((entry) =>
      (state.componentType === 'all' || entry.type === state.componentType) &&
      (!weaponComponentTypes[state.componentType] || state.componentWeapon === 'all' || weaponComponentKind(entry) === state.componentWeapon) &&
      (state.componentGrade === 'all' || entry.grade === state.componentGrade) &&
      (state.componentClass === 'all' || (entry.itemClass || '') === state.componentClass))
    : ((tab === 'ships' || tab === 'rent')
      ? allTyped.filter((entry) => {
        if (state.shipRole === 'all') return true;
        const ship = SC.shipById(entry.shipId);
        return ship && SC.primaryRole && SC.primaryRole(ship) === state.shipRole;
      })
      : allTyped);
  const items = typed.filter((entry) => state.stockFilter === 'all' || String(stockSizeOf(entry, tab)) === String(state.stockFilter));
  const pageSize = 4;
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  state.stockPage = Math.min(Math.max(1, state.stockPage), pages);
  const start = (state.stockPage - 1) * pageSize;
  const visible = items.slice(start, start + pageSize);
  let listHtml = '';
  let lastType = '';
  visible.forEach((entry) => {
    if (tab === 'components' && entry.type !== lastType) {
      listHtml += `<div class="component-group-title"><span>${esc(componentTypeLabel(entry.type))}</span><small>${items.filter((item) => item.type === entry.type).length}</small></div>`;
      lastType = entry.type;
    }
    listHtml += stockCard(entry, tab);
  });
  host.innerHTML = visible.length
    ? '<div class="dialog-stock-list">' + listHtml + '</div>'
    : '<div class="dialog-stock-empty">该分类暂无记录。</div>';
  if (pager) {
    pager.innerHTML = pages > 1 ? `<div class="stock-pager"><button type="button" data-stock-page="prev" ${state.stockPage <= 1 ? 'disabled' : ''}>上一页</button><span>第 <b>${state.stockPage}</b> / ${pages} 页</span><button type="button" data-stock-page="next" ${state.stockPage >= pages ? 'disabled' : ''}>下一页</button></div>` : `<div class="stock-pager"><span>共 ${items.length} 项</span></div>`;
  }
  renderStockTools(loc, tab);
}

function openLocation(id, scroll) {
  const loc = SC.locationById(id);
  if (!loc) return;
  if (loc.system !== state.system) switchSystem(loc.system, true);
  state.selected = id;
  state.weaponSize = 'all';
  state.stockPage = 1;
  state.stockFilter = 'all';
  state.componentType = 'all';
  state.componentGrade = 'all';
  state.componentClass = 'all';
  state.componentWeapon = 'all';
  state.shipRole = 'all';
  atlasState.selected = id;
  updateLabelVisibility();
  renderDialog(loc);
  const dialogShell = $('#location-dialog-shell');
  if (dialogShell) dialogShell.scrollTop = 0;
  const dialog = $('#location-dialog');
  document.body.classList.add('drawer-open');
  if (dialog && !dialog.open) {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }
  const url = new URL(location.href);
  url.searchParams.set('system', state.system);
  url.searchParams.set('loc', id);
  try { history.replaceState({}, '', url.pathname + '?' + url.searchParams.toString() + url.hash); } catch (e) {}
  if (scroll) {
    const stage = $('#atlas');
    if (stage) stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderDialog(loc) {
  const shell = $('#location-dialog-shell');
  if (!shell) return;
  const shop = SC_SHOPS.locations[loc.id];
  const media = locationMedia(loc);
  const story = storyFor(loc);
  const storyText = story ? story.story : [SC.zhText(loc.desc)];
  const storyLocalized = storyText.map((p) => SC.localizeShopText ? SC.localizeShopText(p) : p);
  const danger = riskLabel(loc.danger);
  const tabs = shop ? [
    ['ships', '飞船', shop.counts.buy],
    ['components', '配件', shop.counts.components || 0],
    ['rent', '租赁', shop.counts.rent]
  ].filter(([, , n]) => n > 0) : [];
  state.tab = tabs.some(([key]) => key === state.tab) ? state.tab : (tabs[0] ? tabs[0][0] : 'ships');
  shell.innerHTML = `
    <header class="dialog-hero${media ? ' has-media' : ''}">
      ${media ? `<img class="dialog-hero-img" src="${esc(media.card)}" alt="${esc(zhName(loc))} 实景" decoding="async">` : `<div class="dialog-art">${locationArt(loc, true)}</div>`}
      <button class="dialog-close" type="button" data-dialog-close aria-label="关闭地点档案">×</button>
      <div class="dialog-kicker"><span>${esc((systemById(loc.system) || {}).en || '')} // ${esc(typeLabel(loc.type))}</span><span>${esc(loc.id.toUpperCase())}</span></div>
      <h2 class="dialog-title">${esc(zhName(loc))}</h2>
      <div class="dialog-zh">${esc(loc.name)} · ${esc(parentLabel(loc))}</div>
    </header>
    <div class="dialog-body">
      <div class="dialog-story">${storyLocalized.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      <aside class="dialog-side">
        <h4>地点信息</h4>
        <div class="dialog-facts">
          <span><b>${esc(typeLabel(loc.type))}</b><small>类型</small></span>
          <span><b${danger ? ` class="risk-d${loc.danger}"` : ''}>${esc(danger || '—')}</b><small>风险</small></span>
          <span><b>${esc(parentLabel(loc))}</b><small>归属</small></span>
          <span><b>${esc((systemById(loc.system) || {}).name || '')}</b><small>星系</small></span>
        </div>
        ${(loc.services || []).length ? `<h4 style="margin-top:18px">设施</h4><div class="dialog-services">${loc.services.map((s) => `<span>${esc(SC.serviceName ? SC.serviceName(s) : s)}</span>`).join('')}</div>` : ''}
      </aside>
    </div>
    <section class="dialog-stock">
      <div class="dialog-stock-head"><h3>${shop ? '商品与租赁' : '地点档案'}</h3>
        ${tabs.length ? `<div class="dialog-stock-tabs">${tabs.map(([key, label, n]) => `<button type="button" class="${state.tab === key ? 'active' : ''}" data-dialog-tab="${key}">${label} <small>${n}</small></button>`).join('')}</div>` : ''}
      </div>
      <div id="dialog-stock-tools"></div>
      <div id="dialog-stock-body"></div>
      <div id="dialog-stock-pager"></div>
      <div class="dialog-note">${shop ? '价格单位：aUEC' : ''}</div>
    </section>`;
  if (shop) renderDialogStock(loc, state.tab);
}

function closeDialog(clearSelection) {
  document.body.classList.remove('drawer-open');
  const dialog = $('#location-dialog');
  if (dialog && dialog.open) dialog.close();
  if (clearSelection !== false) {
    atlasState.selected = null; atlasState.hover = null;
    state.selected = null;
    updateLabelVisibility();
  }
  const url = new URL(location.href);
  if (url.searchParams.has('loc')) {
    url.searchParams.delete('loc');
    try { history.replaceState({}, '', url.pathname + '?' + url.searchParams.toString() + url.hash); } catch (e) {}
  }
}

/* ---------- init ---------- */
function init() {
  els.tabs = $('#atlas-tabs');
  els.filters = $('#location-filters');
  els.grid = $('#location-grid');
  els.dialog = $('#location-dialog');
  document.body.classList.add('systems-page');

  if (els.tabs) {
    els.tabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-system]');
      if (button) switchSystem(button.dataset.system, true);
    });
  }
  if (els.filters) {
    els.filters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      state.filter = button.dataset.filter;
      renderFilters();
      renderCards();
    });
  }
  if (els.grid) {
    els.grid.addEventListener('click', (event) => {
      const card = event.target.closest('[data-loc]');
      if (!card) return;
      event.preventDefault();
      openLocation(card.dataset.loc, false);
    });
  }
  if (els.dialog) {
    els.dialog.addEventListener('click', (event) => {
      if (event.target.closest('[data-dialog-close]') || event.target === els.dialog) { closeDialog(true); return; }
      const filter = event.target.closest('[data-stock-filter]');
      if (filter && state.selected) {
        state.stockFilter = filter.dataset.stockFilter;
        state.stockPage = 1;
        renderDialogStock(SC.locationById(state.selected), state.tab);
        return;
      }
      const componentType = event.target.closest('[data-component-type]');
      if (componentType && state.selected) {
        state.componentType = componentType.dataset.componentType;
        state.componentWeapon = 'all';
        state.componentGrade = 'all';
        state.componentClass = 'all';
        state.stockPage = 1;
        state.stockFilter = 'all';
        renderDialogStock(SC.locationById(state.selected), state.tab);
        return;
      }
      const shipRole = event.target.closest('[data-ship-role]');
      if (shipRole && state.selected) {
        state.shipRole = shipRole.dataset.shipRole;
        state.stockPage = 1;
        state.stockFilter = 'all';
        renderDialogStock(SC.locationById(state.selected), state.tab);
        return;
      }
      const componentWeapon = event.target.closest('[data-component-weapon]');
      if (componentWeapon && state.selected) {
        state.componentWeapon = componentWeapon.dataset.componentWeapon;
        state.stockPage = 1;
        state.stockFilter = 'all';
        renderDialogStock(SC.locationById(state.selected), state.tab);
        return;
      }
      const componentGrade = event.target.closest('[data-component-grade]');
      if (componentGrade && state.selected) {
        state.componentGrade = componentGrade.dataset.componentGrade;
        state.stockPage = 1;
        state.stockFilter = 'all';
        renderDialogStock(SC.locationById(state.selected), state.tab);
        return;
      }
      const componentClass = event.target.closest('[data-component-class]');
      if (componentClass && state.selected) {
        state.componentClass = componentClass.dataset.componentClass;
        state.stockPage = 1;
        state.stockFilter = 'all';
        renderDialogStock(SC.locationById(state.selected), state.tab);
        return;
      }
      const pageButton = event.target.closest('[data-stock-page]');
      if (pageButton && state.selected) {
        state.stockPage = Math.max(1, state.stockPage + (pageButton.dataset.stockPage === 'next' ? 1 : -1));
        renderDialogStock(SC.locationById(state.selected), state.tab);
        return;
      }
      const tab = event.target.closest('[data-dialog-tab]');
      if (tab) {
        state.tab = tab.dataset.dialogTab;
        state.stockPage = 1;
        state.stockFilter = 'all';
        state.componentType = 'all';
        state.componentGrade = 'all';
        state.componentClass = 'all';
        state.shipRole = 'all';
        renderDialog(SC.locationById(state.selected));
      }
    });
    els.dialog.addEventListener('close', () => closeDialog(true));
  }

  const params = new URLSearchParams(location.search);
  const sysParam = params.get('system');
  const sys = ['stanton', 'pyro', 'nyx'].includes(sysParam) ? sysParam : 'stanton';
  state.system = sys;
  $$('[data-system]', els.tabs).forEach((button) => button.classList.toggle('active', button.dataset.system === sys));
  updateCount();
  renderFilters();
  renderCards();
  initAtlas();
  if (params.get('loc') && SC.locationById(params.get('loc'))) {
    const loc = SC.locationById(params.get('loc'));
    if (loc.system !== state.system) {
      state.system = loc.system;
      $$('[data-system]', els.tabs).forEach((button) => button.classList.toggle('active', button.dataset.system === loc.system));
      updateCount();
      renderFilters();
      renderCards();
    }
    setTimeout(() => {
      const target = els.grid && els.grid.querySelector(`[data-loc="${loc.id}"]`);
      if (!target) {
        /* Hidden rest stops have no card; still open their shop drawer. */
        if (typeof SC.openLocation === 'function') SC.openLocation(loc.id, false);
        return;
      }
      target.classList.add('is-target');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => target.classList.remove('is-target'), 4500);
    }, 120);
  }
}

/* Public helper used by the global search */
SC.openLocation = function (id, scroll) {
  openLocation(id, !!scroll);
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
