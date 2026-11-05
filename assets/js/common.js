/* =========================================================
   MOBIGLAS · 公共脚本（iOS 深色界面版）
   ========================================================= */

(function () {
  'use strict';

  window.SC = window.SC || {};

  SC.$ = function (sel, root) { return (root || document).querySelector(sel); };
  SC.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  SC.escapeHtml = function (str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  SC.debounce = function (fn, wait) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait || 150);
    };
  };

  /* 地点中文名以汉化包为准，data-locations.js 不动 */
  SC.zhName = function (loc) {
    if (!loc) return '';
    var map = (window.SC_I18N && SC_I18N.locations) || {};
    return map[loc.id] || loc.cn || loc.name || '';
  };

  SC.zhParent = function (parent) {
    if (!parent) return '';
    var loc = SC.locations.filter(function (l) {
      return l.name === parent || l.cn === parent;
    })[0];
    if (loc) return SC.zhName(loc);
    var sys = SC.systems.filter(function (s) {
      return s.name === parent || String(s.en || '').toLowerCase() === String(parent).toLowerCase();
    })[0];
    return sys ? sys.name : parent;
  };

  /* 空间站归属行星：数据层 parent 为星系时，显示更具体的母星 */
  var STATION_HOSTS = { checkmate: 'monox', ruin: 'terminus', orbituary: 'bloom', starlight: 'bloom' };
  SC.parentLabel = function (loc) {
    if (!loc) return '';
    var hostId = STATION_HOSTS[loc.id];
    var host = hostId && SC.locationById(hostId);
    return host ? SC.zhName(host) : SC.zhParent(loc.parent);
  };

  function normalizeKey(value) {
    return String(value == null ? '' : value).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  }

  SC.manuName = function (name) {
    var map = (window.SC_I18N && SC_I18N.manufacturers) || {};
    return map[normalizeKey(name)] || name || '';
  };

  SC.shopName = function (name) {
    var map = (window.SC_I18N && SC_I18N.shops) || {};
    return map[normalizeKey(name)] || name || '';
  };

  var weaponLookup = null;
  function getWeaponLookup() {
    if (weaponLookup) return weaponLookup;
    var raw = (window.SC_I18N && SC_I18N.weapons) || {};
    weaponLookup = {};
    Object.keys(raw).forEach(function (key) { weaponLookup[normalizeKey(key)] = raw[key]; });
    return weaponLookup;
  }

  SC.weaponName = function (weapon) {
    var name = typeof weapon === 'string' ? weapon : (weapon && weapon.name);
    return getWeaponLookup()[normalizeKey(name)] || name || '';
  };

  SC.weaponManu = function (weapon) {
    var name = typeof weapon === 'string' ? '' : (weapon && weapon.manu);
    return SC.manuName(name);
  };

  SC.weaponType = function (weapon) {
    var name = SC.weaponName(weapon);
    var types = ['能量速射炮', '实弹速射炮', '畸变速射炮', '激光速射炮', '实弹加特林', '激光加特林', '实弹加农炮', '能量加农炮', '激光加农炮', '畸变加农炮', '电磁加农炮', '电磁炮', '实弹霰弹炮', '能量霰弹炮', '电浆霰弹炮', '激光炮塔', '点防御发射器', '加农炮', '速射炮', '加特林', '霰弹炮'];
    for (var i = 0; i < types.length; i++) {
      if (name.indexOf(types[i]) !== -1) return types[i];
    }
    return '飞船武器';
  };

  var weaponStatsLookup = null;
  function getWeaponStatsLookup() {
    if (weaponStatsLookup) return weaponStatsLookup;
    var raw = window.SC_WEAPON_STATS || {};
    weaponStatsLookup = {};
    Object.keys(raw).forEach(function (key) { weaponStatsLookup[normalizeKey(key)] = raw[key]; });
    return weaponStatsLookup;
  }

  SC.weaponStats = function (weapon) {
    var name = typeof weapon === 'string' ? weapon : (weapon && weapon.name);
    return getWeaponStatsLookup()[normalizeKey(name)] || null;
  };

  SC.serviceName = function (name) {
    return String(name == null ? '' : name)
      .replace(/船舶商店/g, '飞船商店')
      .replace(/装备店/g, '装备商店');
  };

  SC.shipBlurb = function (ship) {
    var copy = window.SC_SHIP_COPY && SC_SHIP_COPY[ship.id];
    return (copy && copy.blurb) || ship.blurb;
  };

  SC.shipFit = function (ship) {
    var copy = window.SC_SHIP_COPY && SC_SHIP_COPY[ship.id];
    return (copy && copy.fit) || ship.fit;
  };

  /* 性能覆盖层：data-ships.js 保持原值，此处合并核对后的当前版本数据 */
  SC.applyShipStats = function () {
    var stats = window.SC_SHIP_STATS;
    if (!stats) return;
    SC.ships.forEach(function (ship) {
      var patch = stats[ship.id];
      if (!patch) return;
      Object.keys(patch).forEach(function (key) { ship[key] = patch[key]; });
    });
  };
  SC.applyShipStats();

  /* 描述中的英文地名统一成汉化包译名，不改 data-locations 原文 */
  SC.zhText = function (text) {
    if (!text) return '';
    return String(text)
      .replace(/Crusader Industries/g, '十字军工业')
      .replace(/Hurston Dynamics/g, '赫斯顿动力')
      .replace(/Port Olisar/g, '奥利萨港')
      .replace(/New Babbage/g, '新巴贝奇')
      .replace(/Lorville/g, '罗威尔')
      .replace(/Orison/g, '奥里森')
      .replace(/Area18/g, '18区')
      .replace(/Grim HEX/g, '六角湾')
      .replace(/Jumptown/g, '跃动小镇')
      .replace(/microTech/g, '微科公司')
      .replace(/Crusader/g, '十字军')
      .replace(/Hurston/g, '赫斯顿')
      .replace(/ArcCorp/g, '弧光集团')
      .replace(/Aberdeen/g, '阿伯丁')
      .replace(/Daymar/g, '戴玛尔')
      .replace(/Yela/g, '耶拉')
      .replace(/\s+([一-鿿])/g, '$1')
      .replace(/([一-鿿])\s+/g, '$1');
  };

  SC.roleColors = {
    '战斗': '#FF453A',
    '货运': '#64D2FF',
    '多用途': '#30D158',
    '探索': '#409CFF',
    '工业': '#FF9F0A',
    '支援': '#64D2FF',
    '竞速': '#FF9F0A',
    '地面': '#AEAEB2'
  };

  SC.primaryRole = function (ship) {
    for (var i = 0; i < ship.tags.length; i++) {
      if (SC.roleColors[ship.tags[i]]) return ship.tags[i];
    }
    return '多用途';
  };

  SC.media = window.SC_MEDIA || { ships: {}, systems: {} };
  SC.shipMedia = function (id) { return (SC.media.ships || {})[id] || null; };
  SC.systemMedia = function (id) { return (SC.media.systems || {})[id] || null; };


  /* ---------- 飞船商店索引 ---------- */
  SC.shopIndex = (function () {
    var index = {};
    if (!window.SC_SHOPS || !SC_SHOPS.locations) return index;
    Object.keys(SC_SHOPS.locations).forEach(function (locId) {
      var d = SC_SHOPS.locations[locId];
      (d.buy || []).forEach(function (b) {
        if (!index[b.shipId]) index[b.shipId] = { buy: [], rent: [] };
        index[b.shipId].buy.push({ locId: locId, shop: b.shop, price: b.price });
      });
      (d.rent || []).forEach(function (r) {
        if (!index[r.shipId]) index[r.shipId] = { buy: [], rent: [] };
        index[r.shipId].rent.push({ locId: locId, shop: r.shop, days: r.days });
      });
    });
    Object.keys(index).forEach(function (id) {
      index[id].buy.sort(function (a, b) { return a.price - b.price; });
      index[id].rent.sort(function (a, b) { return a.days[0] - b.days[0]; });
    });
    return index;
  })();

  SC.shipShop = function (id) {
    return SC.shopIndex[id] || { buy: [], rent: [] };
  };

  /* ---------- 收藏 ---------- */
  var FAV_KEY = 'mobiglas_favs_v1';

  function loadFavs() {
    try {
      var raw = localStorage.getItem(FAV_KEY);
      if (!raw) return { ships: [], locations: [] };
      var parsed = JSON.parse(raw);
      return {
        ships: Array.isArray(parsed.ships) ? parsed.ships : [],
        locations: Array.isArray(parsed.locations) ? parsed.locations : []
      };
    } catch (e) {
      return { ships: [], locations: [] };
    }
  }

  SC.favs = loadFavs();

  SC.isFav = function (type, id) {
    var list = type === 'ship' ? SC.favs.ships : SC.favs.locations;
    return list.indexOf(id) !== -1;
  };

  SC.toggleFav = function (type, id) {
    var list = type === 'ship' ? SC.favs.ships : SC.favs.locations;
    var idx = list.indexOf(id);
    if (idx === -1) list.push(id);
    else list.splice(idx, 1);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(SC.favs)); } catch (e) { /* 隐私模式 */ }
    return idx === -1;
  };

  SC.favIcon = function (filled) {
    return filled
      ? '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.9 5.8 6.4.9-4.6 4.5 1.1 6.4L12 17.4l-5.8 3 1.1-6.4L2.7 9.5l6.4-.9L12 2.8z"/></svg>'
      : '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3z"/></svg>';
  };

  SC.icon = {
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>',
    arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    arrowUpRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>',
    close: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    plus: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg>',
    ship: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.8l6 9.2v5.6l-6 3.6-6-3.6V12l6-9.2z"/><path d="M12 6.5v9.8M9 15l3 2 3-2"/></svg>',
    orbit: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="2.6"/><ellipse cx="12" cy="12" rx="9.5" ry="4.5" transform="rotate(-28 12 12)"/><circle cx="19" cy="7.5" r="1.2" fill="currentColor"/></svg>',
    guide: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5h6.5A2.5 2.5 0 0113 8v11a2.5 2.5 0 00-2.5-2.5H4v-11z"/><path d="M20 5.5h-4.5A2.5 2.5 0 0013 8v11a2.5 2.5 0 012.5-2.5H20v-11z"/></svg>',
    home: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 10.5L12 3.5l8.5 7v9a1 1 0 01-1 1h-5v-6h-5v6h-5a1 1 0 01-1-1v-9z"/></svg>',
    star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3z"/></svg>',
    location: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>'
  };

  var PAGE_TITLES = { home: '总览', ships: '飞船数据库', components: '飞船配件', systems: '星系与商店' };
  var PAGE_KICKERS = { home: 'HOME', ships: 'SHIPS', components: 'COMPONENTS', systems: 'SYSTEMS' };

  function brandMark() {
    return '<svg class="brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">' +
      '<path d="M20 2.8L34.6 11v18L20 37.2 5.4 29V11L20 2.8z" stroke="currentColor" stroke-width="1.75"/>' +
      '<path d="M20 11.2L27.6 15.5v9L20 28.8l-7.6-4.3v-9L20 11.2z" stroke="currentColor" stroke-opacity=".4" stroke-width="1.4"/>' +
      '<circle cx="20" cy="20" r="2.6" fill="currentColor"/>' +
      '</svg>';
  }

  /* ---------- 导航 ---------- */
  function buildHeader() {
    var host = SC.$('#site-header');
    if (!host) return;
    var page = document.body.getAttribute('data-page') || 'home';
    var links = [
      { id: 'home', href: 'index.html', label: '总览' },
      { id: 'ships', href: 'ships.html', label: '飞船' },
      { id: 'components', href: 'components.html', label: '配件' },
      { id: 'systems', href: 'systems.html', label: '星系' }
    ];
    var nav = links.map(function (l) {
      return '<a href="' + l.href + '" class="ios-nav-link' + (page === l.id ? ' active' : '') + '">' + l.label + '</a>';
    }).join('');

    host.className = 'ios-nav';
    host.innerHTML =
      '<div class="ios-nav-inner">' +
        '<a class="ios-brand" href="index.html" aria-label="MOBIGLAS 星际公民助手首页">' +
          brandMark() + '<span class="ios-brand-name">MOBIGLAS</span>' +
        '</a>' +
        '<nav class="ios-nav-links" aria-label="主导航">' + nav + '</nav>' +
        '<div class="ios-nav-title" id="nav-title">' + (PAGE_TITLES[page] || '') + '</div>' +
        '<div class="ios-nav-actions">' +
          '<button class="ios-search-btn" id="global-search-btn" type="button" aria-label="打开搜索">' +
            SC.icon.search + '<span>搜索</span>' +
          '</button>' +
        '</div>' +
      '</div>';
  }

  /* ---------- 页脚 ---------- */
  function buildFooter() {
    var host = SC.$('#site-footer');
    if (!host) return;
    host.className = 'ios-footer';
    host.innerHTML =
      '<div class="ios-footer-inner">' +
        '<div class="ios-footer-brand">' +
          '<a class="ios-brand" href="index.html">' + brandMark() + '<span class="ios-brand-name">MOBIGLAS</span></a>' +
          '<p>飞船价格、性能参数、星系航图与地点设施资料。非官方粉丝站点，与 Cloud Imperium Games 无隶属或合作关系。</p>' +
        '</div>' +
        '<div class="ios-footer-col">' +
          '<h4>数据库</h4>' +
          '<a href="ships.html">飞船档案</a>' +
          '<a href="components.html">飞船配件</a>' +
          '<a href="systems.html">星系与地点</a>' +
          '<a href="systems.html#locations">地点商店</a>' +
        '</div>' +
        '<div class="ios-footer-col">' +
          '<h4>参考</h4>' +
          '<a href="https://robertsspaceindustries.com/" target="_blank" rel="noopener">RSI 官方网站</a>' +
          '<a href="https://starcitizen.tools/" target="_blank" rel="noopener">Star Citizen Wiki</a>' +
          '<a href="https://erkul.games/" target="_blank" rel="noopener">Erkul Games</a>' +
          '<a href="https://uexcorp.space/" target="_blank" rel="noopener">UEX Corp</a>' +
        '</div>' +
      '</div>' +
      '<div class="ios-footer-bottom">' +
        '<span>© 2026 MOBIGLAS · 玩家制作的资料站</span>' +
      '</div>';
  }

  /* ---------- 搜索 ---------- */
  var searchState = { index: 0, items: [] };

  function buildSearch() {
    if (SC.$('#search-overlay')) return;
    var el = document.createElement('div');
    el.className = 'search-overlay';
    el.id = 'search-overlay';
    el.hidden = true;
    el.innerHTML =
      '<div class="search-sheet" role="dialog" aria-modal="true" aria-label="全站搜索">' +
        '<div class="search-sheet-head">' +
          '<div class="ios-search-field search-sheet-field">' +
            SC.icon.search +
            '<input id="global-search-input" type="search" placeholder="飞船、配件、地点、星系" autocomplete="off" spellcheck="false" aria-label="搜索">' +
          '</div>' +
          '<button class="search-cancel" id="search-cancel" type="button">取消</button>' +
        '</div>' +
        '<div class="search-results" id="global-search-results"></div>' +
        '<div class="search-hint">↑↓ 选择 · Enter 打开 · Esc 关闭</div>' +
      '</div>';
    document.body.appendChild(el);

    var input = SC.$('#global-search-input');
    var results = SC.$('#global-search-results');
    var cancel = SC.$('#search-cancel');

    function render() {
      var q = input.value.trim().toLowerCase();
      var ships = SC.ships.filter(function (s) {
        if (!q) return ['avenger-titan', 'cutlass-black', 'carrack', 'prospector', 'gladius', 'andromeda'].indexOf(s.id) !== -1;
        var hay = [s.name, s.cn, s.maker, SC.manuName(s.maker), s.role, (s.tags || []).join(' '), SC.shipBlurb(s)].join(' ').toLowerCase();
        return hay.indexOf(q) !== -1;
      }).slice(0, q ? 7 : 4);

      var locs = SC.locations.filter(function (l) {
        if (!q) return ['area18', 'new-babbage', 'grim-hex', 'checkmate', 'jumptown', 'pyro-i'].indexOf(l.id) !== -1;
        var story = window.SC_STORIES && SC_STORIES[l.id];
        var hay = [l.name, l.cn, SC.zhName(l), l.parent, SC.zhParent(l.parent), l.desc, story && story.tagline, SC.typeLabels[l.type], (SC.systemById(l.system) || {}).name].join(' ').toLowerCase();
        return hay.indexOf(q) !== -1;
      }).slice(0, q ? 7 : 4);

      var comps = (window.SC_COMPONENT_SEARCH || []).filter(function (c) {
        if (!q) return false;
        var label = c.type === 'weapon' && SC.weaponName ? SC.weaponName(c.en) : c.name;
        var hay = [c.name, c.en, c.manu, SC.manuName(c.manu), c.typeLabel, label].join(' ').toLowerCase();
        return hay.indexOf(q) !== -1;
      }).slice(0, 6);

      var html = '';
      searchState.items = [];

      if (ships.length) {
        html += '<div class="search-group-label">飞船档案</div>';
        ships.forEach(function (s) {
          var i = searchState.items.length;
          searchState.items.push({ kind: 'ship', id: s.id });
          html += '<button class="search-item' + (i === 0 ? ' active' : '') + '" type="button" data-kind="ship" data-id="' + s.id + '">' +
            '<span class="si-type">SHIP</span>' +
            '<span class="si-main"><b>' + SC.escapeHtml(s.name) + (s.cn ? ' · ' + SC.escapeHtml(s.cn) : '') + '</b>' +
            '<small>' + SC.escapeHtml(SC.manuName(s.maker)) + ' · ' + SC.escapeHtml(s.role) + ' · ' + (SC.sizes[s.size] || '') + '</small></span>' +
            '</button>';
        });
      }

      if (locs.length) {
        html += '<div class="search-group-label">星系地点</div>';
        locs.forEach(function (l) {
          var i = searchState.items.length;
          searchState.items.push({ kind: 'location', id: l.id });
          html += '<button class="search-item' + (i === 0 && !ships.length ? ' active' : '') + '" type="button" data-kind="location" data-id="' + l.id + '">' +
            '<span class="si-type">' + SC.escapeHtml(SC.typeLabels[l.type]) + '</span>' +
            '<span class="si-main"><b>' + SC.escapeHtml(l.name) + (SC.zhName(l) ? ' · ' + SC.escapeHtml(SC.zhName(l)) : '') + '</b>' +
            '<small>' + SC.escapeHtml((SC.systemById(l.system) || {}).name || '') + ' · ' + SC.escapeHtml(SC.zhParent(l.parent)) + '</small></span>' +
            '</button>';
        });
      }

      if (comps.length) {
        html += '<div class="search-group-label">配件与飞船武器</div>';
        comps.forEach(function (c) {
          var i = searchState.items.length;
          searchState.items.push({ kind: 'component', id: c.id });
          var label = c.type === 'weapon' && SC.weaponName ? SC.weaponName(c.en) : c.name;
          html += '<button class="search-item' + (i === 0 ? ' active' : '') + '" type="button" data-kind="component" data-id="' + c.id + '">' +
            '<span class="si-type">' + (c.type === 'weapon' ? 'WEAPON' : 'COMP') + '</span>' +
            '<span class="si-main"><b>' + SC.escapeHtml(label) + '</b>' +
            '<small>' + SC.escapeHtml(SC.manuName(c.manu)) + ' · ' + SC.escapeHtml(c.typeLabel) + ' · S' + SC.escapeHtml(c.size == null ? '—' : c.size) + '</small></span>' +
            '</button>';
        });
      }

      if (!html) html = '<div class="search-empty">没有找到匹配的飞船、地点或配件。<br>试试英文名、制造商或星系名。</div>';
      results.innerHTML = html;
      searchState.index = 0;

      SC.$$('.search-item', results).forEach(function (btn) {
        btn.addEventListener('click', function () { openResult(btn.getAttribute('data-kind'), btn.getAttribute('data-id')); });
        btn.addEventListener('mouseenter', function () {
          SC.$$('.search-item', results).forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          searchState.index = SC.$$('.search-item', results).indexOf(btn);
        });
      });
    }

    function openResult(kind, id) {
      closeSearch();
      if (kind === 'ship') {
        if (typeof SC.openShip === 'function' && document.body.getAttribute('data-page') === 'ships') SC.openShip(id);
        else window.location.href = 'ships.html?ship=' + encodeURIComponent(id);
      } else if (kind === 'component') {
        if (typeof SC.openComponent === 'function' && document.body.getAttribute('data-page') === 'components') SC.openComponent(id);
        else window.location.href = 'components.html?component=' + encodeURIComponent(id);
      } else {
        if (typeof SC.openLocation === 'function' && document.body.getAttribute('data-page') === 'systems') SC.openLocation(id, true);
        else window.location.href = 'systems.html?loc=' + encodeURIComponent(id);
      }
    }

    function openSearch() {
      el.hidden = false;
      document.body.classList.add('search-open');
      input.value = '';
      render();
      setTimeout(function () { input.focus(); }, 30);
    }

    function closeSearch() {
      el.hidden = true;
      document.body.classList.remove('search-open');
    }

    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
      var items = SC.$$('.search-item', results);
      if (!items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        searchState.index = (searchState.index + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach(function (b, i) { b.classList.toggle('active', i === searchState.index); });
        items[searchState.index].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        var active = items[searchState.index];
        if (active) openResult(active.getAttribute('data-kind'), active.getAttribute('data-id'));
      }
    });

    el.addEventListener('mousedown', function (e) { if (e.target === el) closeSearch(); });
    if (cancel) cancel.addEventListener('click', closeSearch);

    SC.openSearch = openSearch;
    SC.closeSearch = closeSearch;

    var btn = SC.$('#global-search-btn');
    if (btn) btn.addEventListener('click', openSearch);

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (el.hidden) openSearch(); else closeSearch();
      }
      if (e.key === 'Escape' && !el.hidden) closeSearch();
    });
  }

  /* ---------- 星空（仅首页 hero 内容区） ---------- */
  function initStarfield() {
    var canvas = document.getElementById('starfield');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var host = canvas.parentElement;
    var stars = [];
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      var w = host.clientWidth || 800;
      var h = host.clientHeight || 500;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(160, Math.max(60, Math.floor((w * h) / 6000)));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 0.95 + 0.25,
          a: Math.random() * 0.45 + 0.12,
          s: Math.random() * 0.04 + 0.008,
          p: Math.random() * Math.PI * 2
        });
      }
      draw(0);
    }

    function draw(t) {
      var w = host.clientWidth || 800;
      var h = host.clientHeight || 500;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        var tw = 0.75 + Math.sin(t * 0.0008 + st.p) * 0.25;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(235,235,245,' + (st.a * tw) + ')';
        ctx.fill();
        if (!reduced) {
          st.y -= st.s;
          if (st.y < -2) { st.y = h + 2; st.x = Math.random() * w; }
        }
      }
    }

    var raf;
    function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
    window.addEventListener('resize', SC.debounce(resize, 180));
    resize();
    if (!reduced) raf = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduced) raf = requestAnimationFrame(loop);
    });
  }

  /* ---------- 大标题滚动收缩 ---------- */
  function initScrollTitle() {
    var update = function () {
      document.body.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- 表格：补 data-label 以支持移动端分组列表 ---------- */
  function enhanceTables() {
    SC.$$('table.info-table').forEach(function (table) {
      var headers = SC.$$('thead th', table).map(function (th) { return th.textContent.trim(); });
      if (!headers.length) return;
      SC.$$('tbody tr', table).forEach(function (tr) {
        SC.$$('td', tr).forEach(function (td, i) {
          if (!td.getAttribute('data-label') && headers[i]) td.setAttribute('data-label', headers[i]);
        });
      });
    });
  }

  /* ---------- 图片错误统一占位 ---------- */
  function initImageFallbacks() {
    document.addEventListener('error', function (e) {
      var img = e.target;
      if (!img || img.tagName !== 'IMG' || !img.isConnected) return;
      var label = (img.getAttribute('alt') || '图片').replace(/\s*飞船外观$/, '').replace(/\s*星图$/, '');
      var fb = document.createElement('div');
      fb.className = 'media-fallback';
      fb.innerHTML = SC.icon.ship + '<strong>' + SC.escapeHtml(label) + '</strong><span>暂无图片</span>';
      img.replaceWith(fb);
    }, true);
  }

  /* ---------- 滚动出现 ---------- */
  var revealObserver = null;

  function ensureRevealObserver() {
    if (revealObserver || !("IntersectionObserver" in window)) return;
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  }

  function initReveal() {
    var items = SC.$$(".reveal:not(.in)");
    if (!items.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    ensureRevealObserver();
    items.forEach(function (el) { revealObserver.observe(el); });
    setTimeout(function () { items.forEach(function (el) { el.classList.add("in"); }); }, 1600);
  }


  /* 卡片轻微 3D 倾斜与光斑跟随 */
  /* ---------- 暗色下拉框（统一向下展开） ---------- */
  var customSelects = [];

  function closeCustomSelects(except) {
    customSelects.forEach(function (item) {
      if (item.wrap !== except) item.close();
    });
  }

  SC.syncSelects = function () {
    customSelects.forEach(function (item) { item.sync(); });
  };

  SC.enhanceSelects = function (scope) {
    SC.$$('select.filter-select', scope || document).forEach(function (select) {
      if (select.__scSelect) return;
      select.__scSelect = true;
      var wrap = document.createElement('div');
      wrap.className = 'sc-select';
      select.parentNode.insertBefore(wrap, select);
      wrap.appendChild(select);
      select.classList.add('sc-select-native');
      select.setAttribute('tabindex', '-1');

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'sc-select-button filter-select';
      button.setAttribute('aria-haspopup', 'listbox');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', select.getAttribute('aria-label') || '选择');

      var menu = document.createElement('div');
      menu.className = 'sc-select-menu';
      menu.setAttribute('role', 'listbox');
      menu.hidden = true;
      wrap.appendChild(button);
      wrap.appendChild(menu);

      function selectedLabel() {
        var option = select.options[select.selectedIndex];
        return option ? option.textContent : '选择';
      }
      function renderMenu() {
        menu.innerHTML = Array.prototype.map.call(select.options, function (option, index) {
          return '<button type="button" role="option" class="sc-select-option' + (option.selected ? ' active' : '') + '" data-index="' + index + '" aria-selected="' + (option.selected ? 'true' : 'false') + '">' + SC.escapeHtml(option.textContent) + '</button>';
        }).join('');
      }
      function sync() {
        button.textContent = selectedLabel();
        button.setAttribute('aria-expanded', menu.hidden ? 'false' : 'true');
        renderMenu();
      }
      function close() {
        menu.hidden = true;
        button.setAttribute('aria-expanded', 'false');
        wrap.classList.remove('open');
      }
      function open() {
        closeCustomSelects(wrap);
        renderMenu();
        menu.hidden = false;
        wrap.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        menu.style.top = '';
        menu.style.bottom = '';
        var rect = menu.getBoundingClientRect();
        var buttonRect = button.getBoundingClientRect();
        if (rect.bottom > window.innerHeight - 10 && buttonRect.top > rect.height + 12) {
          menu.style.top = 'auto';
          menu.style.bottom = 'calc(100% + 6px)';
        }
        menu.style.left = rect.right > window.innerWidth - 12 ? 'auto' : '0';
        menu.style.right = rect.right > window.innerWidth - 12 ? '0' : 'auto';
        var active = menu.querySelector('.active');
        if (active) active.scrollIntoView({ block: 'nearest' });
      }
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        if (menu.hidden) open(); else close();
      });
      button.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
          var first = menu.querySelector('.sc-select-option');
          if (first) first.focus();
        } else if (event.key === 'Escape') {
          close();
        }
      });
      menu.addEventListener('click', function (event) {
        var option = event.target.closest('[data-index]');
        if (!option) return;
        var index = Number(option.getAttribute('data-index'));
        if (select.selectedIndex !== index) {
          select.selectedIndex = index;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
        sync();
        close();
        button.focus();
      });
      menu.addEventListener('keydown', function (event) {
        var options = Array.prototype.slice.call(menu.querySelectorAll('.sc-select-option'));
        var current = options.indexOf(document.activeElement);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          var next = event.key === 'ArrowDown' ? Math.min(options.length - 1, current + 1) : Math.max(0, current - 1);
          if (options[next]) options[next].focus();
        } else if (event.key === 'Escape') {
          close();
          button.focus();
        }
      });
      var observer = new MutationObserver(function () { sync(); });
      observer.observe(select, { childList: true, subtree: true, characterData: true });
      customSelects.push({ wrap: wrap, close: close, sync: sync });
      sync();
    });
  };

  document.addEventListener('click', function (event) {
    customSelects.forEach(function (item) {
      if (!item.wrap.contains(event.target)) item.close();
    });
  });

  SC.bindTilt = function (selector) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    SC.$$(selector).forEach(function (card) {
      if (card.__tiltBound) return;
      card.__tiltBound = true;
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width;
        var y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty('--ry', ((x - 0.5) * 5).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - y) * 4).toFixed(2) + 'deg');
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
      });
    });
  };
  SC.refreshReveal = initReveal;

  /* ---------- 启动 ---------- */
  function init() {
    buildHeader();
    buildFooter();
    buildSearch();
    initStarfield();
    initScrollTitle();
    initImageFallbacks();
    enhanceTables();
    SC.enhanceSelects();
    initReveal();
    if (typeof SC.afterChromeReady === 'function') SC.afterChromeReady();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
