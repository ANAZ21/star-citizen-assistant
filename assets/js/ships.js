/* =========================================================
   MOBIGLAS · 飞船页（商店价格版）
   ========================================================= */

(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'ships') return;

  var state = {
    q: '', role: '全部', size: '全部', maker: '', status: '', sort: 'default',
    favOnly: false, shopOnly: false, compare: []
  };
  var els = {};


  function initBackToTop() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.innerHTML = '回到顶部 ↑';
    document.body.appendChild(btn);
    function toggle() { btn.classList.toggle('show', window.scrollY > 700); }
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  function initShipHeroSlides() {
    var host = document.getElementById('ships-hero-slides');
    var caption = document.getElementById('ships-hero-caption');
    if (!host) return;
    var ids = ['carrack', 'polaris', '890-jump', 'reclaimer', 'constellation-phoenix', 'f8c-lightning'];
    var slides = ids.map(function (id) {
      var ship = SC.shipById(id);
      var media = SC.shipMedia(id);
      return ship && media && (media.hero || media.card) ? { ship: ship, src: media.hero || media.card } : null;
    }).filter(Boolean);
    if (!slides.length) return;
    host.innerHTML = slides.map(function (slide, i) {
      return '<img src="' + SC.escapeHtml(slide.src) + '" width="1600" height="900" alt="' + SC.escapeHtml(slide.ship.name) + ' 飞船展示" class="' + (i === 0 ? 'active' : '') + '"' + (i === 0 ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">';
    }).join('');
    var imgs = Array.prototype.slice.call(host.querySelectorAll('img'));
    function label(slide) {
      if (caption) caption.textContent = slide.ship.name.toUpperCase() + ' / ' + slide.ship.role;
    }
    label(slides[0]);
    var hero = document.getElementById('ships-hero');
    if (hero) {
      hero.addEventListener('mousemove', function (event) {
        var r = hero.getBoundingClientRect();
        var x = (event.clientX - r.left) / r.width - 0.5;
        var y = (event.clientY - r.top) / r.height - 0.5;
        hero.style.setProperty('--px', (x * 34).toFixed(2));
        hero.style.setProperty('--py', (y * 22).toFixed(2));
      });
      hero.addEventListener('mouseleave', function () {
        hero.style.setProperty('--px', '0');
        hero.style.setProperty('--py', '0');
      });
    }
    if (imgs.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var index = 0;
    setInterval(function () {
      imgs[index].classList.remove('active');
      index = (index + 1) % imgs.length;
      imgs[index].classList.add('active');
      label(slides[index]);
    }, 7000);
  }

  function init() {
    initBackToTop();
    initShipHeroSlides();
    var heroCount = document.getElementById('hero-ship-count');
    if (heroCount) heroCount.textContent = SC.ships.length;

    els.grid = document.getElementById('ship-grid');
    els.count = document.getElementById('result-count');
    els.search = document.getElementById('ship-search');
    els.maker = document.getElementById('maker-filter');
    els.status = document.getElementById('status-filter');
    els.sort = document.getElementById('sort-select');
    els.roleChips = document.getElementById('role-chips');
    els.sizeChips = document.getElementById('size-chips');
    els.favFilter = document.getElementById('fav-filter');
    els.shopFilter = document.getElementById('shop-filter');
    els.reset = document.getElementById('reset-filters');
    els.tray = document.getElementById('compare-tray');
    els.trayChips = document.getElementById('tray-chips');
    els.trayCount = document.getElementById('tray-count');
    els.compareOpen = document.getElementById('compare-open');
    els.compareClear = document.getElementById('compare-clear');
    els.shipDialog = document.getElementById('ship-modal');
    els.shipInner = document.getElementById('ship-modal-inner');
    els.compareDialog = document.getElementById('compare-dialog');
    els.compareInner = document.getElementById('compare-modal-inner');

    buildFilterOptions();
    bindEvents();
    render();

    var params = new URLSearchParams(window.location.search);
    var shipId = params.get('ship');
    if (shipId && SC.shipById(shipId)) setTimeout(function () { openShip(shipId, false); }, 80);
  }

  function shop(id) { return SC.shipShop(id); }

  /* ---------- 筛选器 ---------- */
  function countByRole(role) {
    return SC.ships.filter(function (s) { return role === '全部' || (s.tags || []).indexOf(role) !== -1; }).length;
  }
  function countBySize(size) {
    return SC.ships.filter(function (s) { return size === '全部' || s.size === size; }).length;
  }
  function countAvailable() {
    return SC.ships.filter(function (s) { var x = shop(s.id); return x.buy.length || x.rent.length || s.auec; }).length;
  }

  function matchesExcept(exclude, s) {
    if (exclude !== 'role' && state.role !== '全部' && (s.tags || []).indexOf(state.role) === -1) return false;
    if (exclude !== 'size' && state.size !== '全部' && s.size !== state.size) return false;
    if (state.maker && SC.manuName(s.maker) !== state.maker) return false;
    if (state.status && s.status !== state.status) return false;
    if (state.favOnly && !SC.isFav('ship', s.id)) return false;
    if (state.shopOnly) { var sh = shop(s.id); if (!sh.buy.length && !sh.rent.length && !s.auec) return false; }
    if (state.q) {
      var hay = [s.name, s.cn, s.maker, SC.manuName(s.maker), s.role, (s.tags || []).join(' '), SC.shipBlurb(s), SC.shipFit(s), s.buy].join(' ').toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  function updateFilterCounts() {
    if (!els.roleChips || !els.sizeChips) return;
    var roleBase = SC.ships.filter(function (s) { return matchesExcept('role', s); });
    var sizeBase = SC.ships.filter(function (s) { return matchesExcept('size', s); });
    Array.prototype.forEach.call(els.roleChips.querySelectorAll('[data-role]'), function (btn) {
      var role = btn.getAttribute('data-role');
      var n = role === '全部' ? roleBase.length : roleBase.filter(function (s) { return (s.tags || []).indexOf(role) !== -1; }).length;
      var small = btn.querySelector('small');
      if (small) small.textContent = n;
    });
    Array.prototype.forEach.call(els.sizeChips.querySelectorAll('[data-size]'), function (btn) {
      var size = btn.getAttribute('data-size');
      var n = size === '全部' ? sizeBase.length : sizeBase.filter(function (s) { return s.size === size; }).length;
      var small = btn.querySelector('small');
      if (small) small.textContent = n;
    });
  }

  function buildFilterOptions() {
    var roles = ['全部'].concat(SC.roles);
    els.roleChips.innerHTML = roles.map(function (r) {
      return '<button class="chip' + (r === '全部' ? ' active' : '') + '" type="button" data-role="' + r + '">' + SC.escapeHtml(r) + ' <small>' + countByRole(r) + '</small></button>';
    }).join('');

    var sizes = ['全部', 'S', 'M', 'L', 'CAP', 'GND'];
    els.sizeChips.innerHTML = sizes.map(function (sz) {
      return '<button class="chip' + (sz === '全部' ? ' active' : '') + '" type="button" data-size="' + sz + '">' + SC.escapeHtml(sz === '全部' ? '全部舰级' : SC.sizes[sz]) + ' <small>' + countBySize(sz) + '</small></button>';
    }).join('');

    var makerLabels = {};
    SC.ships.forEach(function (s) { makerLabels[SC.manuName(s.maker)] = 1; });
    var makers = Object.keys(makerLabels).sort();
    els.maker.innerHTML = '<option value="">全部制造商</option>' + makers.map(function (m) {
      return '<option value="' + SC.escapeHtml(m) + '">' + SC.escapeHtml(m) + '</option>';
    }).join('');

    els.status.innerHTML = '<option value="">全部状态</option>' + SC.statuses.map(function (s) {
      return '<option value="' + s + '">' + s + '</option>';
    }).join('');

    els.favFilter.querySelector('small').textContent = SC.favs.ships.length;
    els.shopFilter.querySelector('small').textContent = countAvailable();
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    els.search.addEventListener('input', SC.debounce(function () {
      state.q = els.search.value.trim().toLowerCase();
      render();
    }, 120));

    els.roleChips.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-role]'); if (!btn) return;
      state.role = btn.getAttribute('data-role');
      SC.$$('.chip', els.roleChips).forEach(function (b) { b.classList.toggle('active', b === btn); });
      render();
    });
    els.sizeChips.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-size]'); if (!btn) return;
      state.size = btn.getAttribute('data-size');
      SC.$$('.chip', els.sizeChips).forEach(function (b) { b.classList.toggle('active', b === btn); });
      render();
    });

    els.maker.addEventListener('change', function () { state.maker = els.maker.value; render(); });
    els.status.addEventListener('change', function () { state.status = els.status.value; render(); });
    els.sort.addEventListener('change', function () { state.sort = els.sort.value; render(); });

    els.favFilter.addEventListener('click', function () {
      state.favOnly = !state.favOnly;
      els.favFilter.classList.toggle('active', state.favOnly);
      render();
    });
    els.shopFilter.addEventListener('click', function () {
      state.shopOnly = !state.shopOnly;
      els.shopFilter.classList.toggle('active', state.shopOnly);
      render();
    });

    els.reset.addEventListener('click', resetFilters);

    els.grid.addEventListener('click', function (e) {
      var card = e.target.closest('.ship-card'); if (!card) return;
      var id = card.getAttribute('data-id');
      var action = e.target.closest('[data-action]');
      var kind = action ? action.getAttribute('data-action') : 'open';
      if (kind === 'fav') { toggleFavorite(id, action); return; }
      if (kind === 'compare') { toggleCompare(id); return; }
      openShip(id, true);
    });

    els.trayChips.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-remove]');
      if (btn) toggleCompare(btn.getAttribute('data-remove'));
    });
    els.compareOpen.addEventListener('click', openCompare);
    els.compareClear.addEventListener('click', function () {
      state.compare = [];
      render();
    });

    [els.shipDialog, els.compareDialog].forEach(function (dlg) {
      var close = SC.$('.modal-close', dlg);
      if (close) close.addEventListener('click', function () {
        if (dlg === els.shipDialog) closeShipModal(); else closeCompareModal();
      });
      dlg.addEventListener('click', function (e) {
        if (e.target !== dlg) return;
        if (dlg === els.shipDialog) closeShipModal(); else closeCompareModal();
      });
      dlg.addEventListener('close', function () {
        document.body.classList.remove('modal-open');
        if (dlg === els.shipDialog) clearShipParam();
      });
      dlg.addEventListener('cancel', function () {
        document.body.classList.remove('modal-open');
        if (dlg === els.shipDialog) clearShipParam();
      });
    });
  }

  function clearShipParam() {
    var url = new URL(window.location.href);
    if (!url.searchParams.has('ship')) return;
    url.searchParams.delete('ship');
    try { window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash); } catch (e) {}
  }
  function closeShipModal() {
    if (els.shipDialog && els.shipDialog.open) els.shipDialog.close();
    document.body.classList.remove('modal-open');
    clearShipParam();
  }
  function closeCompareModal() {
    if (els.compareDialog && els.compareDialog.open) els.compareDialog.close();
    document.body.classList.remove('modal-open');
  }

  function resetFilters() {
    state.q = ''; state.role = '全部'; state.size = '全部'; state.maker = ''; state.status = ''; state.sort = 'default'; state.favOnly = false; state.shopOnly = false;
    els.search.value = ''; els.maker.value = ''; els.status.value = ''; els.sort.value = 'default';
    els.favFilter.classList.remove('active'); els.shopFilter.classList.remove('active');
    if (SC.syncSelects) SC.syncSelects();
    SC.$$('.chip', els.roleChips).forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-role') === '全部'); });
    SC.$$('.chip', els.sizeChips).forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-size') === '全部'); });
    render();
  }

  /* ---------- 过滤 / 排序 ---------- */
  function filteredShips() {
    var list = SC.ships.filter(function (s) {
      if (state.role !== '全部' && (s.tags || []).indexOf(state.role) === -1) return false;
      if (state.size !== '全部' && s.size !== state.size) return false;
      if (state.maker && SC.manuName(s.maker) !== state.maker) return false;
      if (state.status && s.status !== state.status) return false;
      if (state.favOnly && !SC.isFav('ship', s.id)) return false;
      if (state.shopOnly) { var sh = shop(s.id); if (!sh.buy.length && !sh.rent.length && !s.auec) return false; }
      if (state.q) {
        var hay = [s.name, s.cn, s.maker, SC.manuName(s.maker), s.role, (s.tags || []).join(' '), SC.shipBlurb(s), SC.shipFit(s), s.buy].join(' ').toLowerCase();
        if (hay.indexOf(state.q) === -1) return false;
      }
      return true;
    });

    if (state.sort !== 'default') {
      list = list.slice().sort(function (a, b) {
        var av, bv;
        var sa = shop(a.id).buy[0] || (a.auec ? { price: a.auec } : null);
        var sb = shop(b.id).buy[0] || (b.auec ? { price: b.auec } : null);
        switch (state.sort) {
          case 'auec-asc': av = sa ? sa.price : Infinity; bv = sb ? sb.price : Infinity; break;
          case 'auec-desc': av = sa ? sa.price : -1; bv = sb ? sb.price : -1; break;
          case 'usd-asc': av = a.usd == null ? Infinity : a.usd; bv = b.usd == null ? Infinity : b.usd; break;
          case 'usd-desc': av = a.usd == null ? -1 : a.usd; bv = b.usd == null ? -1 : b.usd; break;
          case 'cargo-desc': av = a.cargo || 0; bv = b.cargo || 0; break;
          case 'speed-desc': av = a.max || 0; bv = b.max || 0; break;
          default: av = 0; bv = 0;
        }
        if (av === bv) return a.name.localeCompare(b.name);
        return av < bv ? 1 : -1;
      });
      if (state.sort.indexOf('asc') !== -1) list.reverse();
    }
    return list;
  }

  function statusClass(status) { return status === '限时' ? 'limited' : (status === '概念' ? 'concept' : 'live'); }
  function sizeLabel(size) { return SC.sizes[size] || size; }

  function fallbackMarkup(name) {
    return '<div class="media-fallback">' + SC.icon.ship + '<strong>' + SC.escapeHtml(name) + '</strong></div>';
  }
  function shipImage(s, variant) {
    var media = SC.shipMedia(s.id) || {};
    var src = variant === 'hero' ? (media.hero || media.card) : (media.card || media.hero);
    if (!src) return fallbackMarkup(s.name);
    return '<img src="' + SC.escapeHtml(src) + '" width="' + (variant === 'hero' ? 1600 : 800) + '" height="' + (variant === 'hero' ? 900 : 450) + '" alt="' + SC.escapeHtml(s.name) + ' 飞船外观" ' +
      (variant === 'hero' ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">';
  }

  function loadoutData(ship) {
    var data = window.SC_SHIP_LOADOUTS && SC_SHIP_LOADOUTS[ship.id];
    if (!data || (!data.guns.length && !data.missiles.length)) return null;
    return data;
  }

  function weaponLabel(name) {
    return SC.weaponName ? SC.weaponName(name) : name;
  }

  function loadoutMarkup(ship) {
    var data = loadoutData(ship);
    if (data) {
      var cards = data.guns.map(function (gun) {
        return '<span class="loadout-card"><small>' + gun.count + '×</small><b>S' + gun.size + '</b><em>' + SC.escapeHtml(weaponLabel(gun.name)) + '</em>' + (gun.mount ? '<i>' + SC.escapeHtml(gun.mount) + '</i>' : '') + '</span>';
      });
      cards = cards.concat(data.missiles.map(function (missile) {
        return '<span class="loadout-card missile"><small>' + missile.count + '×</small><b>S' + missile.size + '</b><em>' + SC.escapeHtml(weaponLabel(missile.name)) + '</em><i>导弹</i></span>';
      }));
      if (cards.length) return cards.join('');
    }
    var segments = String(ship.weapons || '').split('·').map(function (part) { return part.trim(); }).filter(Boolean);
    var fallback = segments.map(function (segment) {
      var match = segment.match(/^(\d+)×\s*(S\d+)\s*(.*)$/i);
      if (!match) return '<span class="loadout-card"><b>' + SC.escapeHtml(segment) + '</b></span>';
      return '<span class="loadout-card"><small>' + match[1] + '×</small><b>' + match[2].toUpperCase() + '</b><em>' + SC.escapeHtml(match[3] ? weaponLabel(match[3]) : '固定') + '</em></span>';
    });
    if (ship.missiles && ship.missiles !== '—') {
      fallback.push('<span class="loadout-card missile"><small>导弹</small><b>' + SC.escapeHtml(ship.missiles) + '</b></span>');
    }
    return fallback.length ? fallback.join('') : '<span class="muted-line">暂无武装记录</span>';
  }

  function loadoutSummary(ship) {
    var data = loadoutData(ship);
    if (!data) return ship.weapons || '—';
    var parts = data.guns.slice(0, 3).map(function (gun) {
      return gun.count + '× S' + gun.size + ' ' + weaponLabel(gun.name);
    });
    if (data.missiles.length) {
      parts.push(data.missiles[0].count + '× S' + data.missiles[0].size + ' ' + weaponLabel(data.missiles[0].name));
    }
    return parts.join(' · ') || ship.weapons || '—';
  }

  function shipDetails(ship) {
    return (window.SC_SHIP_DETAILS && SC_SHIP_DETAILS[ship.id]) || {};
  }

  function oneDecimal(value) {
    if (value == null || isNaN(Number(value))) return '—';
    var number = Number(value);
    return Math.abs(number - Math.round(number)) < 0.05
      ? String(Math.round(number))
      : number.toFixed(1);
  }

  function dimensionText(detail) {
    var dim = detail.dim || {};
    if (!dim.length || !dim.width || !dim.height) return '—';
    return oneDecimal(dim.length) + '×' + oneDecimal(dim.width) + '×' + oneDecimal(dim.height) + ' m';
  }

  function massText(value) {
    return value ? oneDecimal(Number(value) / 1000) + ' t' : '—';
  }

  function rangeText(value) {
    return value ? oneDecimal(Number(value) / 1e9) + ' Gm' : '—';
  }

  function dpsText(value) {
    if (!value) return '—';
    return Number(value).toLocaleString('en-US', { maximumFractionDigits: 1 });
  }

  function pilotDps(detail) {
    if (detail.pilotDps != null) return detail.pilotDps;
    return detail.dps;
  }

  function shipWeaponHtml(ship) {
    var data = loadoutData(ship);
    if (!data) return SC.escapeHtml(ship.weapons || '—');
    var guns = data.guns.map(function (gun) {
      return gun.count + '× S' + gun.size + ' ' + SC.escapeHtml(weaponLabel(gun.name));
    }).join(' · ');
    var missiles = data.missiles.map(function (missile) {
      return missile.count + '× S' + missile.size + ' ' + SC.escapeHtml(weaponLabel(missile.name));
    }).join(' · ');
    return guns + (missiles ? (guns ? '<br>' : '') + '<i>导弹</i> ' + missiles : '');
  }

  function shipSpecRows(ship) {
    var detail = shipDetails(ship);
    var agility = detail.agility || {};
    return [
      ['外形尺寸', dimensionText(detail)],
      ['质量', massText(detail.mass)],
      ['乘员', SC.escapeHtml(ship.crew || '—')],
      ['货舱', ship.cargo ? SC.fmtNumber(ship.cargo) + ' SCU' : '—'],
      ['SCM', ship.scm ? SC.fmtNumber(ship.scm) + ' m/s' : '—'],
      ['极速', ship.max ? SC.fmtNumber(ship.max) + ' m/s' : '—'],
      ['护盾', detail.shieldHp ? SC.fmtNumber(detail.shieldHp) + ' HP' : SC.escapeHtml(ship.shield || '—')],
      ['船体', detail.hull ? SC.fmtNumber(detail.hull) + ' HP' : (ship.hull ? SC.fmtNumber(ship.hull) + ' HP' : '—')],
      ['量子燃料', detail.qFuel ? oneDecimal(detail.qFuel) + ' SCU' : '—'],
      ['量子航程', rangeText(detail.qRange)],
      ['机动', (agility.pitch || agility.yaw || agility.roll) ? oneDecimal(agility.pitch) + '/' + oneDecimal(agility.yaw) + '/' + oneDecimal(agility.roll) : '—'],
      ['飞行员 DPS', dpsText(pilotDps(detail))],
      ['武器配置', shipWeaponHtml(ship), true]
    ];
  }

  function shipCardMarkup(ship, index) {
    var selected = state.compare.indexOf(ship.id) !== -1;
    var fav = SC.isFav('ship', ship.id);
    var status = statusClass(ship.status);
    var sh = shop(ship.id);
    var minBuy = sh.buy[0] ? sh.buy[0].price : ship.auec;
    var rows = shipSpecRows(ship).map(function (row) {
      var cls = row[2] ? 'wide' : (row[0] === '外形尺寸' ? 'dim' : '');
      return '<div' + (cls ? ' class="' + cls + '"' : '') + '><dt>' + row[0] + '</dt><dd>' + row[1] + '</dd></div>';
    }).join('');
    return '<article class="ship-card ship-hud reveal' + (selected ? ' selected' : '') + '" data-id="' + ship.id + '" style="--i:' + (index % 6) + '">' +
      '<div class="ship-media">' + shipImage(ship, 'card') +
        '<div class="ship-hud-grid"></div><div class="ship-hud-scan"></div>' +
        '<div class="ship-hud-reticle"><i></i><i></i><i></i><i></i></div>' +
        '<div class="ship-hud-top"><span>SHIP DOSSIER // ' + String(index + 1).padStart(3, '0') + '</span><span>舰级 // ' + sizeLabel(ship.size) + '</span></div>' +
        '<div class="ship-media-actions">' +
          '<button class="icon-btn fav' + (fav ? ' on' : '') + '" type="button" data-action="fav" data-id="' + ship.id + '" aria-label="收藏 ' + SC.escapeHtml(ship.name) + '">' + SC.favIcon(fav) + '</button>' +
          '<button class="icon-btn compare' + (selected ? ' on' : '') + '" type="button" data-action="compare" data-id="' + ship.id + '" aria-label="加入对比">' + (selected ? SC.icon.check : SC.icon.plus) + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="ship-content">' +
        '<div class="ship-head"><div><small>' + SC.escapeHtml(SC.manuName(ship.maker)) + '</small><h3 class="ship-name">' + SC.escapeHtml(ship.name) + (ship.cn && ship.cn !== ship.name ? '<em>' + SC.escapeHtml(ship.cn) + '</em>' : '') + '</h3></div><span class="ship-price">' + (ship.usd != null ? SC.fmtUSD(ship.usd) : '—') + '</span></div>' +
        '<div class="ship-role">用途 ' + SC.escapeHtml(ship.role) + ' · 状态 <span class="' + status + '">' + SC.escapeHtml(ship.status) + '</span></div>' +
        '<dl class="ship-specs">' + rows + '</dl>' +
        '<div class="ship-foot"><div><small>aUEC REFERENCE</small><b>' + (minBuy ? SC.fmtNumber(minBuy) : '—') + '</b></div><button class="card-open" type="button" data-action="open">查看档案 ' + SC.icon.arrow + '</button></div>' +
      '</div>' +
    '</article>';
  }

  var COMPONENT_LABELS = {
    radar: '雷达', power_plants: '动力装置', coolers: '冷却器', shield_generators: '护盾发生器',
    quantum_drives: '量子引擎', fuel_tanks: '燃料箱', quantum_fuel_tanks: '量子燃料箱',
    jump_modules: '跳跃模块', life_support: '生命维持'
  };

  var INTERNAL_COMPONENT_ZH = {
    'Internal Tank': '内置燃料箱',
    'Fuel Tank': '燃料箱',
    'Quantum Fuel Tank': '量子燃料箱',
    'Manned Turret': '载人炮塔',
    'Remote Turret': '遥控炮塔',
    'Turret': '炮塔',
    'Maneuver Thrusters': '机动推进器',
    'Main Thrusters': '主推进器',
    'Retro Thrusters': '反推推进器',
    'VTOL Thrusters': '垂直起降推进器',
    'Shield Generator': '护盾发生器',
    'Power Plant': '动力装置',
    'Cooler': '冷却器',
    'Quantum Drive': '量子引擎',
    'Radar': '雷达',
    'Life Support': '生命维持',
    'Jump Module': '跳跃模块',
    'Fuel Intake': '燃料进气口',
    'Salvage Head': '打捞头',
    'Tractor Beam': '牵引光束'
  };
  function componentName(name) {
    return INTERNAL_COMPONENT_ZH[name] || (SC.weaponName ? SC.weaponName(name) : name);
  }

  function componentMarkup(ship) {
    var components = shipDetails(ship).components || [];
    var seen = {};
    var rows = components.filter(function (component) {
      if (!COMPONENT_LABELS[component.type]) return false;
      var key = component.type + '|' + component.name + '|' + component.size;
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    }).map(function (component) {
      var size = component.size ? 'S' + component.size : '—';
      var count = component.mounts > 1 ? ' ×' + component.mounts : '';
      return '<div class="component-row"><span>' + COMPONENT_LABELS[component.type] + '</span><b>' + SC.escapeHtml(componentName(component.name)) + '</b><small>' + size + count + '</small></div>';
    });
    return rows.length ? rows.join('') : '<p class="muted-line">暂无组件记录</p>';
  }

  function combatMarkup(ship) {
    var detail = shipDetails(ship);
    var turret = Number(detail.turretDps) || 0;
    var pilot = pilotDps(detail);
    var total = Number(detail.dps) || 0;
    var stats = [['飞行员 DPS', dpsText(pilot)]];
    if (turret > 0) {
      stats.push(['炮手 DPS', dpsText(turret)]);
      stats.push(['合计 DPS', dpsText(total || (Number(pilot) || 0) + turret)]);
    }
    if (detail.sustainedDps != null) stats.push(['持续 DPS', dpsText(detail.sustainedDps)]);
    if (detail.missileDamage != null) stats.push(['导弹齐射伤害', dpsText(detail.missileDamage)]);
    return '<div class="combat-stats">' + stats.map(function (row) {
      return '<div><span>' + row[0] + '</span><b>' + row[1] + '</b></div>';
    }).join('') + '</div>' +
      '<p class="combat-note">DPS 按默认配置计算：飞行员 DPS 为飞行员可控制的武器，炮手 DPS 为需要炮手操作的炮塔；护盾、船体与机动数据见上方参数表。</p>';
  }

  function detailMetricsMarkup(ship) {
    return shipSpecRows(ship).slice(0, 12).map(function (row) {
      var agility = row[0] === '机动';
      var label = agility ? '机动性 · 俯仰 / 偏航 / 滚转' : row[0];
      var value = agility ? row[1] + ' °/s' : row[1];
      return '<div class="detail-metric"><span>' + label + '</span><b>' + value + '</b></div>';
    }).join('');
  }

  /* ---------- 卡片 ---------- */
  function render() {
    var list = filteredShips();
    updateFilterCounts();
    els.count.textContent = '共 ' + SC.ships.length + ' 艘 · 当前 ' + list.length + ' 艘';
    updateTray();

    if (!list.length) {
      els.grid.innerHTML = '<div class="empty-state"><b>没有匹配的飞船</b>调整筛选条件。<button class="btn-small" type="button" id="empty-reset" style="margin-top:14px">清空筛选</button></div>';
      var er = document.getElementById('empty-reset');
      if (er) er.addEventListener('click', resetFilters);
      return;
    }

    els.grid.innerHTML = list.map(function (s, i) { return shipCardMarkup(s, i); }).join('');

    if (typeof SC.refreshReveal === 'function') SC.refreshReveal();
    if (SC.bindTilt) SC.bindTilt('.ship-card');
  }

  /* ---------- 收藏 / 对比 ---------- */
  function toggleFavorite(id, btn) {
    var fav = SC.toggleFav('ship', id);
    if (btn) { btn.classList.toggle('on', fav); btn.innerHTML = SC.favIcon(fav); }
    els.favFilter.querySelector('small').textContent = SC.favs.ships.length;
    if (state.favOnly && !fav) render();
  }
  function toggleCompare(id) {
    var idx = state.compare.indexOf(id);
    if (idx === -1) {
      if (state.compare.length >= 3) { toast('最多对比 3 艘'); return; }
      state.compare.push(id);
    } else state.compare.splice(idx, 1);
    render();
  }
  function updateTray() {
    els.tray.classList.toggle('show', state.compare.length > 0);
    els.trayCount.textContent = state.compare.length + ' / 3';
    els.trayChips.innerHTML = state.compare.map(function (id) {
      var s = SC.shipById(id);
      return '<span class="tray-chip">' + SC.escapeHtml(s.name) + '<button type="button" data-remove="' + id + '" aria-label="移除">×</button></span>';
    }).join('');
    els.compareOpen.disabled = state.compare.length < 2;
    els.compareClear.disabled = state.compare.length === 0;
  }
  function toast(msg) {
    var el = document.getElementById('sc-toast');
    if (!el) { el = document.createElement('div'); el.id = 'sc-toast'; el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  /* ---------- 详情 ---------- */
  function openShip(id, updateUrl) {
    var s = SC.shipById(id); if (!s) return;
    var sh = shop(id);
    var fav = SC.isFav('ship', id);
    var inCompare = state.compare.indexOf(id) !== -1;
    var status = statusClass(s.status);
    var media = SC.shipMedia(id) || {};
    var minBuy = sh.buy[0] ? sh.buy[0].price : s.auec;
    var hero = shipImage(s, 'hero');
    var credit = media.credit || 'CIG / RSI';
    var source = media.source ? '<a class="detail-credit" href="' + SC.escapeHtml(media.source) + '" target="_blank" rel="noopener">图片 © ' + SC.escapeHtml(credit) + '</a>' : '';
    var shieldText = s.shield || '';
    if (s.shieldHp) shieldText = (shieldText && shieldText !== '—' ? shieldText + ' · ' : '') + SC.fmtNumber(s.shieldHp) + ' HP';
    if (!shieldText) shieldText = '—';

    var buyRows = sh.buy.map(function (b) {
      var l = SC.locationById(b.locId) || {};
      return '<a class="shop-row" href="systems.html?loc=' + b.locId + '">' +
        '<span class="shop-row-loc"><b>' + SC.escapeHtml(SC.zhName(l) || l.name || b.locId) + '</b><small>' + SC.escapeHtml(SC.shopName(b.shop)) + '</small></span>' +
        '<span class="shop-row-price"><b>' + SC.fmtNumber(b.price) + '</b><small>aUEC</small></span>' +
      '</a>';
    }).join('');
    var buyFallback = (!sh.buy.length && s.buy) ? '<p class="shop-note">历史参考购买点（当前快照无在售记录）：' + SC.escapeHtml(SC.localizeShopText(s.buy)) + (s.auec ? ' · 最低 ' + SC.fmtNumber(s.auec) + ' aUEC' : '') + '</p>' : '';
    var rentFallback = (!sh.rent.length && s.rent) ? '<p class="shop-note">历史参考租赁点（当前快照无租赁记录）：' + SC.escapeHtml(SC.localizeShopText(s.rent)) + '</p>' : '';
    var rentRows = sh.rent.map(function (r) {
      var l = SC.locationById(r.locId) || {};
      return '<a class="shop-row rent" href="systems.html?loc=' + r.locId + '">' +
        '<span class="shop-row-loc"><b>' + SC.escapeHtml(SC.zhName(l) || l.name || r.locId) + '</b><small>' + SC.escapeHtml(SC.shopName(r.shop)) + '</small></span>' +
        '<span class="rent-values"><span>1日 <b>' + SC.fmtNumber(r.days[0]) + '</b></span><span>7日 <b>' + SC.fmtNumber(r.days[2]) + '</b></span><span>30日 <b>' + SC.fmtNumber(r.days[3]) + '</b></span></span>' +
      '</a>';
    }).join('');

    els.shipInner.innerHTML =
      '<button class="modal-close" type="button" aria-label="关闭">' + SC.icon.close + '</button>' +
      '<div class="detail-hero detail-hero-v2">' + hero + source + '</div>' +
      '<div class="detail-head detail-head-v2">' +
        '<div class="detail-title-block">' +
          '<div class="kicker">SHIP DOSSIER // ' + SC.escapeHtml(s.maker).toUpperCase() + '</div>' +
          '<h2>' + SC.escapeHtml(s.name) + (s.cn && s.cn !== s.name ? '<span>' + SC.escapeHtml(s.cn) + '</span>' : '') + '</h2>' +
          '<div class="badges"><span class="badge role">用途 · ' + SC.escapeHtml(s.role) + '</span><span class="badge">舰级 · ' + sizeLabel(s.size) + '</span><span class="badge ' + status + '">状态 · ' + SC.escapeHtml(s.status) + '</span>' + (fav ? '<span class="badge limited">已收藏</span>' : '') + '</div>' +
          '<p class="detail-manu">' + SC.escapeHtml(SC.manuName(s.maker)) + ' · ' + SC.escapeHtml(s.role) + '</p>' +
        '</div>' +
        '<div class="detail-price-panel">' +
          '<div><span>USD</span><b>' + SC.fmtUSD(s.usd) + '</b></div>' +
          '<div class="auec"><span>aUEC 参考价</span><b>' + (minBuy ? SC.fmtNumber(minBuy) : '—') + '</b></div>' +
          '<small class="price-note">官网 standalone 未税参考价 · 快照 2026-11</small>' +
        '</div>' +
      '</div>' +
      '<div class="detail-metrics">' + detailMetricsMarkup(s) + '</div>' +
      '<div class="detail-sections">' +
        '<section class="detail-panel detail-panel-weapons">' +
          '<div class="detail-panel-head"><span>默认武器</span><small>DEFAULT LOADOUT</small></div>' +
          '<div class="loadout-panel detail-loadout-panel">' + loadoutMarkup(s) + '</div>' +
          '<div class="detail-panel-head detail-panel-subhead"><span>核心组件</span><small>CORE COMPONENTS</small></div>' +
          '<div class="component-list">' + componentMarkup(s) + '</div>' +
        '</section>' +
        '<section class="detail-panel detail-panel-combat">' +
          '<div class="detail-panel-head"><span>战术数据</span><small>COMBAT TELEMETRY</small></div>' +
          combatMarkup(s) +
        '</section>' +
      '</div>' +
      '<div class="detail-market">' +
        '<section class="detail-panel">' +
          '<div class="detail-panel-head"><span>购买' + (sh.buy.length ? ' · ' + sh.buy.length + ' 个地点' : (s.buy ? ' · 参考购买点' : '')) + '</span><small>PURCHASE</small></div>' +
          (buyRows ? '<div class="shop-rows">' + buyRows + '</div>' : (buyFallback || '<p class="muted-line">暂无游戏内购买记录</p>')) +
        '</section>' +
        '<section class="detail-panel">' +
          '<div class="detail-panel-head"><span>租赁' + (sh.rent.length ? ' · ' + sh.rent.length + ' 个地点' : (s.rent ? ' · 参考租赁点' : '')) + '</span><small>RENTAL</small></div>' +
          (rentRows ? '<div class="shop-rows">' + rentRows + '</div>' : (rentFallback || '<p class="muted-line">暂无可租赁地点</p>')) +
        '</section>' +
      '</div>' +
      '<p class="hull-note detail-note">船体耐久为结构 HP，不含护盾与装甲减伤；实际承受伤害还会受武器伤害类型影响。</p>';

    els.shipInner.querySelector('.modal-close').addEventListener('click', closeShipModal);
    if (!els.shipDialog.open) { els.shipDialog.showModal(); document.body.classList.add('modal-open'); }
    els.shipInner.scrollTop = 0;
    if (updateUrl) {
      var url = new URL(window.location.href);
      url.searchParams.set('ship', id);
      try { window.history.replaceState({}, '', url.pathname + '?' + url.searchParams.toString() + url.hash); } catch (e) {}
    }
  }
  SC.openShip = openShip;

  /* ---------- 对比 ---------- */
  function bar(value, max) {
    if (value == null || !max) return '';
    return '<div class="bar"><i style="width:' + Math.max(3, Math.min(100, value / max * 100)) + '%"></i></div>';
  }
  function openCompare() {
    var ships = state.compare.map(SC.shipById).filter(Boolean);
    if (ships.length < 2) return;
    function minBuy(s) { var b = shop(s.id).buy[0]; return b ? b.price : (s.auec || null); }
    var maxCargo = Math.max.apply(null, ships.map(function (s) { return s.cargo || 0; }));
    var maxSpeed = Math.max.apply(null, ships.map(function (s) { return s.max || 0; }));
    var maxUsd = Math.max.apply(null, ships.map(function (s) { return s.usd || 0; }));
    var maxAuec = Math.max.apply(null, ships.map(function (s) { return minBuy(s) || 0; }));
    var head = '<tr><th></th>' + ships.map(function (s) { return '<th>' + SC.escapeHtml(s.name) + '<small>' + SC.escapeHtml(SC.manuName(s.maker)) + '</small></th>'; }).join('') + '</tr>';
    function row(label, cells) { return '<tr><th>' + label + '</th>' + cells.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }
    var rows = '';
    rows += row('用途', ships.map(function (s) { return SC.escapeHtml(s.role); }));
    rows += row('舰级 / 状态', ships.map(function (s) { return sizeLabel(s.size) + ' · ' + s.status; }));
    rows += row('货舱', ships.map(function (s) { return (s.cargo ? SC.fmtNumber(s.cargo) + ' SCU' : '—') + bar(s.cargo, maxCargo); }));
    rows += row('最高速度', ships.map(function (s) { return (s.max ? SC.fmtNumber(s.max) + ' m/s' : '—') + bar(s.max, maxSpeed); }));
    rows += row('USD', ships.map(function (s) { return SC.fmtUSD(s.usd) + bar(s.usd, maxUsd); }));
    rows += row('aUEC 参考价', ships.map(function (s) { var v = minBuy(s); return (v ? SC.fmtNumber(v) : '—') + bar(v, maxAuec); }));
    rows += row('护盾 / 船体', ships.map(function (s) {
      var detail = shipDetails(s);
      var shieldHp = detail.shieldHp || s.shieldHp;
      var hull = detail.hull || s.hull;
      var shield = shieldHp ? SC.fmtNumber(shieldHp) + ' HP' : (/HP/.test(String(s.shield || '')) ? SC.escapeHtml(s.shield) : '—');
      return shield + ' · ' + (hull ? '≈ ' + SC.fmtNumber(hull) : '—');
    }));
    rows += row('默认武装', ships.map(function (s) { return SC.escapeHtml(s.weapons); }));
    els.compareInner.innerHTML =
      '<button class="modal-close" type="button" aria-label="关闭">' + SC.icon.close + '</button>' +
      '<div class="compare-head"><div class="kicker">Ship Comparison // ' + ships.length + ' Units</div><h2>飞船对比</h2><p>条形长度按本次对比范围缩放。</p></div>' +
      '<div class="compare-wrap"><table class="compare-table"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>';
    els.compareInner.querySelector('.modal-close').addEventListener('click', closeCompareModal);
    if (!els.compareDialog.open) { els.compareDialog.showModal(); document.body.classList.add('modal-open'); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
