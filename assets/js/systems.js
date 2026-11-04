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
const componentClassLabel = (value) => componentClasses[value] || value || '';
const componentOrder = { power: 0, shield: 1, cooler: 2, quantum: 3 };
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
  selected: null
};

const atlasState = {
  yaw: 0.35,
  pitch: 0.48,
  distance: 112,
  yawGoal: 0.35,
  pitchGoal: 0.48,
  distanceGoal: 112,
  auto: true,
  dragging: null,
  selected: null,
  hover: null,
  focus: null,
  tween: null,
  fullscreen: false,
  detailId: null,
  target: new THREE.Vector3(),
  targetGoal: new THREE.Vector3(),
  layout: null,
  labels: {}
};

let renderer = null;
let scene = null;
let camera = null;
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
  const all = SC.locations.filter((loc) => loc.system === systemId);
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
  const stationAngle = { checkmate: 0.85, ruin: 3.55, orbituary: 2.35, starlight: 5.35 };
  all.filter((loc) => loc.type === 'station').forEach((loc) => {
    const hostId = stationHost[loc.id];
    const host = (hostId && SC.locationById(hostId)) || byName[loc.parent];
    const hp = host && positions[host.id];
    const angle = stationAngle[loc.id] != null ? stationAngle[loc.id] : (parseInt(loc.id.replace(/\D/g, ''), 10) || 1) * 0.7;
    if (hp) {
      const r = loc.id === 'starlight' ? 8.2 : (host.type === 'moon' ? 3 : 6.6);
      add(loc, hp.position.x + Math.cos(angle) * r, 0.4, hp.position.z + Math.sin(angle) * r, {
        radius: 0.22, color: shopBuy(loc.id) ? '#ff9f0a' : (isShop(loc.id) ? '#64d2ff' : '#8997a3'),
        priority: isShop(loc.id) ? (shopBuy(loc.id) ? 2 : 3) : 3,
        host: { id: host.id, position: hp.position }
      });
    } else {
      const a = Math.atan2((loc.mapY || 350) - 350, (loc.mapX || 600) - 600);
      add(loc, Math.cos(a) * 58, 0.5, Math.sin(a) * 58, {
        radius: 0.22,
        color: isShop(loc.id) ? '#64d2ff' : '#8997a3',
        priority: 3
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
    add(loc, Math.cos(a) * 62, 0.4, Math.sin(a) * 62, { radius: 0.52, color: '#30d158', priority: 4 });
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
  group.scale.setScalar(0.62);
  group.userData.station = true;
  group.userData.id = id;
  group.traverse((child) => { if (child.isMesh) child.userData.id = id; });
  return group;
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
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(2.3, 64, 40),
    new THREE.MeshBasicMaterial({ map: textures.sun || null, color: pyro ? 0xffb07a : 0xfff4dc })
  );
  systemGroup.add(star);
  const starGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: pyro ? 0xff7a45 : 0xffc26e, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.82 }));
  starGlow.scale.set(pyro ? 24 : 22, pyro ? 24 : 22, 1);
  systemGroup.add(starGlow);
  const corona = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: pyro ? 0xff5a2a : 0xffd28a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.24 }));
  corona.scale.set(36, 36, 1);
  systemGroup.add(corona);
  const starLight = new THREE.PointLight(pyro ? 0xffb07a : 0xffd7a2, 3.8, 0, 0);
  systemGroup.add(starLight);
  systemGroup.userData.star = star;
  systemGroup.userData.corona = corona;

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
      mesh = makeStationModel(loc.id);
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
  const secondary = `${node.loc.name} · ${typeLabel(node.loc.type)}`;
  button.innerHTML = `<span class="atlas-node-dot">${markerIcon(node.loc.type)}</span><span class="atlas-node-label"><b>${esc(primary)}</b><small>${esc(secondary)}</small></span>`;
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
      : (atlasState.selected === node.id || atlasState.hover === node.id || node.priority <= level);
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
  Object.values(atlasState.labels).forEach((label) => label.classList.remove('collide'));
  atlasState.layout.nodes.forEach((node) => {
    const label = atlasState.labels[node.id];
    if (!label || label.classList.contains('hidden')) return;
    const direction = node.position.clone().sub(camera.position);
    if (direction.dot(camDir) < 0.3) { label.classList.add('hidden'); return; }
    if (node.surface && node.host) {
      const normal = node.position.clone().sub(node.host.position).normalize();
      const toCamera = camera.position.clone().sub(node.position).normalize();
      if (normal.dot(toCamera) <= 0.03) { label.classList.add('hidden'); return; }
    }
    const projected = node.position.clone().project(camera);
    if (projected.z < -1 || projected.z > 1) { label.classList.add('hidden'); return; }
    const x = (projected.x * .5 + .5) * atlasW;
    const y = (-projected.y * .5 + .5) * atlasH;
    if (x < 10 || x > atlasW - 10 || y < 10 || y > atlasH - 10) { label.classList.add('hidden'); return; }
    const leftSide = x > atlasW * 0.57;
    const yOffset = node.loc.type === 'planet' ? -14 : (node.loc.id === 'ruin' ? -38 : (node.shop ? 15 : 0));
    label.style.left = `${x + (leftSide ? -11 : 11)}px`;
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
      const rank = (node) => (node.id === atlasState.selected || node.id === atlasState.hover) ? 0 : (node.loc.type === 'planet' ? 1 : (node.loc.type === 'landing' ? 2 : (node.shop ? 3 : 4)));
      return rank(a) - rank(b) || a.priority - b.priority;
    });
  const boxes = [];
  visible.forEach((node) => {
    const label = atlasState.labels[node.id];
    if (node.id !== atlasState.selected && label.classList.contains('label-up') && node.shop) {
      // label-up is only a fallback near the bottom edge
    }
    const rect = label.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const box = { left: rect.left - 4, top: rect.top - 3, right: rect.right + 4, bottom: rect.bottom + 3 };
    if (node.id === atlasState.selected) { boxes.push(box); return; }
    const hit = boxes.some((b) => !(box.right < b.left || box.left > b.right || box.bottom < b.top || box.top > b.bottom));
    if (hit) label.classList.add('collide');
    else boxes.push(box);
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
    setTimeout(() => applyPlanetDetail(id), 900);
    return;
  }
  new THREE.TextureLoader().load(src, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
    detailTextures[id] = texture;
    setTimeout(() => applyPlanetDetail(id), 900);
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
  startCameraTween({ target: new THREE.Vector3(0, 0, 0), distance: 112, yaw: atlasState.yaw, pitch: atlasState.pitch }, 1.15);
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
    const body = story ? story.story.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('') : `<p>${esc(SC.zhText(loc.desc || ''))}</p>`;
    storyHost.innerHTML = body + `<p class="atlas-focus-summary">${esc(summary)}</p>`;
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
  if (!stage) return;
  atlasState.fullscreen = force == null ? !atlasState.fullscreen : force;
  stage.classList.toggle('is-fullscreen', atlasState.fullscreen);
  document.body.classList.toggle('atlas-fullscreen', atlasState.fullscreen);
  updateFullscreenButton();
  requestAnimationFrame(() => {
    resizeAtlas();
    if (atlasState.focus && atlasState.layout) {
      const node = atlasState.layout.positions[atlasState.focus];
      if (node) startCameraTween(focusView(node), 0.9);
    }
  });
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
    if (!suppressClick) pickAtlas(event);
    setTimeout(() => { suppressClick = false; }, 50);
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    atlasState.tween = null;
    const range = zoomRange();
    atlasState.distanceGoal = Math.max(range.min, Math.min(range.max, atlasState.distanceGoal * (event.deltaY < 0 ? 0.9 : 1.1)));
    atlasState.auto = false;
    updateAutoButton();
  }, { passive: false });

  const focusHost = $('#atlas-focus');
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
        atlasState.yawGoal = 0.35; atlasState.pitchGoal = 0.48; atlasState.distanceGoal = 112;
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
    if (atlasState.fullscreen) { toggleFullscreen(false); return; }
    if (atlasState.focus) leaveFocus();
  });
}

function updateAutoButton() {
  const dot = $('[data-atlas-action="auto"] .rotate-dot');
  if (dot) dot.classList.toggle('active', atlasState.auto);
}

function resizeAtlas() {
  if (!renderer || !camera) return;
  atlasW = els.canvas.clientWidth;
  atlasH = els.canvas.clientHeight;
  renderer.setSize(atlasW, atlasH);
  camera.aspect = atlasW / atlasH;
  camera.updateProjectionMatrix();
}

function animate(t) {
  requestAnimationFrame(animate);
  if (!renderer) return;
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
    atlasState.target.lerp(atlasState.targetGoal, 0.07);
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
    const corona = systemGroup.userData.corona;
    if (corona) {
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 1.4);
      corona.material.opacity = 0.18 + pulse * 0.1;
      const size = 34 + pulse * 5;
      corona.scale.set(size, size, 1);
    }
  }
  if (systemGroup) {
    systemGroup.children.forEach((obj) => {
      if (obj.userData && obj.userData.shopRing) { obj.quaternion.copy(camera.quaternion); obj.visible = !atlasState.focus; }
      if (obj.userData && obj.userData.station) obj.rotation.y += delta * 0.055;
    });
  }
  labelTimer += delta;
  if (!isFinite(labelTimer)) labelTimer = 0;
  if (labelTimer > 0.08) {
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

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(atlasW, atlasH);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.domElement.setAttribute('aria-label', '斯坦顿与派罗三维星系图');
  els.canvas.appendChild(renderer.domElement);

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
  return SC.locations.filter((loc) => loc.system === systemId).sort((a, b) => {
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
    ['main', '主城', count((l) => l.type === 'landing' || ['checkmate', 'ruin', 'orbituary'].includes(l.id))],
    ['shops', '商店', count((l) => isShop(l.id))],
    ['ships', '有飞船', count((l) => { const d = SC_SHOPS.locations[l.id]; return d && d.counts.buy; })],
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
  if (shop.weapons.length) {
    const names = shop.weapons.slice().sort((a, b) => a.size - b.size || a.price - b.price).slice(0, limit).map(weaponName).join(' · ');
    const more = shop.weapons.length - Math.min(limit, shop.weapons.length);
    lines.push(`<p class="place-stock-line"><span>飞船武器</span>${esc(names)}${more > 0 ? ` <em>+${more}</em>` : ''}</p>`);
  }
  if (shop.rent.length) {
    const names = shop.rent.slice(0, limit).map((item) => { const ship = SC.shipById(item.shipId); return ship ? ship.name : ''; }).filter(Boolean).join(' · ');
    const more = shop.rent.length - Math.min(limit, shop.rent.length);
    if (names) lines.push(`<p class="place-stock-line rent"><span>租赁</span>${esc(names)}${more > 0 ? ` <em>+${more}</em>` : ''}</p>`);
  }
  if (shop.components && shop.components.length) {
    lines.push(`<p class="place-stock-line components"><span>配件</span>${shop.components.length} 件在售</p>`);
  }
  return lines.join('');
}

function cardMarkup(loc, index) {
  const shop = SC_SHOPS.locations[loc.id];
  const story = storyFor(loc);
  const media = locationMedia(loc);
  const feature = loc.type === 'landing' || ['checkmate', 'ruin', 'orbituary'].includes(loc.id);
  const tagline = story ? (feature ? story.story[0] : story.tagline) : SC.zhText(loc.desc);
  const countItems = shop ? [['buy', '飞船'], ['weapons', '飞船武器'], ['rent', '租赁']].filter(([key]) => shop.counts[key] > 0) : [];
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
      <span class="place-code">${String(index + 1).padStart(2, '0')}</span>
      <div class="place-visual-title"><h3>${esc(zhName(loc))}</h3><p>${esc(loc.name)} · ${esc(parentLabel(loc))}</p></div>
      ${counts}
    </div>
    <div class="place-body">
      <p class="place-tagline">${esc(tagline)}</p>
      ${facilities ? `<div class="place-facilities">${facilities}</div>` : ''}
      ${stockPreview(shop, feature)}
      ${shipPreview(loc, shop)}
      <div class="place-foot"><span>${shop ? (shop.counts.buy ? '商店档案 · ' + shop.counts.buy + ' 艘在售' : (shop.counts.components ? '配件档案 · ' + shop.counts.components + ' 件有售' : '商店档案')) : esc(typeLabel(loc.type)) + '档案'}</span><span class="open">${shop ? '查看商品' : '查看地点'} →</span></div>
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
  atlasState.yawGoal = 0.35; atlasState.pitchGoal = 0.48; atlasState.distanceGoal = 112;
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

function updateCount() {
  const count = SC.locations.filter((loc) => loc.system === state.system).length;
  const el = $('#atlas-object-count');
  if (el) el.textContent = `${count} 个地点`;
}

/* ---------- location dialog ---------- */
function componentSpecs(entry) {
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
    const site = entry.site ? ` · ${entry.site}` : '';
    return `<article class="stock-card component">
      <div class="stock-card-head"><span class="stock-size">S${esc(entry.size == null ? '—' : entry.size)}</span><span class="stock-kind">${esc(componentTypeLabel(entry.type))}</span></div>
      <b class="stock-name">${esc(entry.name)}</b>
      <small class="stock-sub">${esc(SC.manuName ? SC.manuName(entry.manu) : entry.manu)} · ${esc(componentClassLabel(entry.itemClass))} · ${esc(entry.grade)} 级 · ${esc(shopName(entry.shop))}${esc(site)}</small>
      <div class="stock-specs">${componentSpecs(entry)}</div>
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
        <small class="stock-sub">${esc(ship.cn)} · ${esc(shopName(entry.shop))}</small>
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
  const scoped = tab === 'components' && state.componentType !== 'all'
    ? items.filter((entry) => entry.type === state.componentType)
    : items;
  const sizes = Array.from(new Set(scoped.map((entry) => stockSizeOf(entry, tab)).filter((value) => value != null))).sort((a, b) => a - b);
  const prices = scoped.map((entry) => tab === 'rent' ? entry.days[0] : entry.price);
  const sizeLabel = (size) => tab === 'weapons' || tab === 'components' ? 'S' + size : (SC.sizes[size] || size);
  const typeCounts = tab === 'components'
    ? Array.from(new Set(base.map((entry) => entry.type))).sort((a, b) => (componentOrder[a] || 0) - (componentOrder[b] || 0)).map((type) => [type, base.filter((entry) => entry.type === type).length])
    : [];
  const typeFilter = typeCounts.length > 1
    ? `<div class="component-type-filter" role="group" aria-label="按配件类别筛选">
        <button type="button" class="${state.componentType === 'all' ? 'active' : ''}" data-component-type="all">全部类别 <small>${base.length}</small></button>
        ${typeCounts.map(([type, n]) => `<button type="button" class="${state.componentType === type ? 'active' : ''}" data-component-type="${esc(type)}">${esc(componentTypeLabel(type))} <small>${n}</small></button>`).join('')}
      </div>`
    : '';
  host.innerHTML = `<div class="stock-summary"><span>共 <b>${scoped.length}</b> 项</span><span>价格区间 <b>${fmt(Math.min.apply(null, prices))}</b> – <b>${fmt(Math.max.apply(null, prices))}</b> aUEC</span></div>
    ${typeFilter}
    <div class="weapon-sizes" role="group" aria-label="按尺寸筛选">
      <button type="button" class="${state.stockFilter === 'all' ? 'active' : ''}" data-stock-filter="all">全部 <small>${scoped.length}</small></button>
      ${sizes.map((size) => `<button type="button" class="${String(state.stockFilter) === String(size) ? 'active' : ''}" data-stock-filter="${esc(size)}">${esc(sizeLabel(size))}</button>`).join('')}
    </div>`;
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
  const typed = tab === 'components' && state.componentType !== 'all'
    ? stockItems(shop, tab).filter((entry) => entry.type === state.componentType)
    : stockItems(shop, tab);
  const items = typed.filter((entry) => state.stockFilter === 'all' || String(stockSizeOf(entry, tab)) === String(state.stockFilter));
  const pageSize = 4;
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  state.stockPage = Math.min(Math.max(1, state.stockPage), pages);
  const start = (state.stockPage - 1) * pageSize;
  const visible = items.slice(start, start + pageSize);
  host.innerHTML = visible.length
    ? '<div class="dialog-stock-list">' + visible.map((entry) => stockCard(entry, tab)).join('') + '</div>'
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
  atlasState.selected = id;
  updateLabelVisibility();
  renderDialog(loc);
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
  const danger = riskLabel(loc.danger);
  const tabs = shop ? [
    ['ships', '飞船', shop.counts.buy],
    ['weapons', '飞船武器', shop.counts.weapons],
    ['rent', '租赁', shop.counts.rent],
    ['components', '配件', shop.counts.components || 0],
    ['packages', '套装', 1]
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
      <div class="dialog-story">${storyText.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
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
      <div class="dialog-stock-head"><h3>${shop ? '商店商品与租赁' : '地点档案'}</h3>
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
      if (!target) return;
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
