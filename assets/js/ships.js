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

  function init() {
    initBackToTop();
    var heroCount = document.getElementById('hero-ship-count');
    if (heroCount) heroCount.textContent = SC.ships.length;
    var note = document.getElementById('ship-coverage-note');
    if (note) note.textContent = '当前收录 ' + SC.ships.length + ' 艘标准可飞与在售舰船，不含活动涂装与特别版。';

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

  function buildFilterOptions() {
    var roles = ['全部'].concat(SC.roles);
    els.roleChips.innerHTML = roles.map(function (r) {
      return '<button class="chip' + (r === '全部' ? ' active' : '') + '" type="button" data-role="' + r + '">' + SC.escapeHtml(r) + ' <small>' + countByRole(r) + '</small></button>';
    }).join('');

    var sizes = ['全部', 'S', 'M', 'L', 'CAP', 'GND'];
    els.sizeChips.innerHTML = sizes.map(function (sz) {
      return '<button class="chip' + (sz === '全部' ? ' active' : '') + '" type="button" data-size="' + sz + '">' + SC.escapeHtml(sz === '全部' ? '全部尺寸' : SC.sizes[sz]) + ' <small>' + countBySize(sz) + '</small></button>';
    }).join('');

    var makers = Array.from(new Set(SC.ships.map(function (s) { return s.maker; }))).sort();
    els.maker.innerHTML = '<option value="">全部制造商</option>' + makers.map(function (m) {
      return '<option value="' + SC.escapeHtml(m) + '">' + SC.escapeHtml(SC.manuName(m)) + '</option>';
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
      if (state.maker && s.maker !== state.maker) return false;
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

  function loadoutMarkup(ship) {
    var segments = String(ship.weapons || '').split('·').map(function (part) { return part.trim(); }).filter(Boolean);
    var cards = segments.map(function (segment) {
      var match = segment.match(/^(\d+)×\s*(S\d+)\s*(.*)$/i);
      if (!match) return '<span class="loadout-card"><b>' + SC.escapeHtml(segment) + '</b></span>';
      return '<span class="loadout-card"><small>' + match[1] + '×</small><b>' + match[2].toUpperCase() + '</b><em>' + SC.escapeHtml(match[3] || '固定') + '</em></span>';
    });
    if (ship.missiles && ship.missiles !== '—') {
      cards.push('<span class="loadout-card missile"><small>导弹</small><b>' + SC.escapeHtml(ship.missiles) + '</b></span>');
    }
    return cards.length ? cards.join('') : '<span class="muted-line">暂无武装记录</span>';
  }

  /* ---------- 卡片 ---------- */
  function render() {
    var list = filteredShips();
    els.count.textContent = '共 ' + SC.ships.length + ' 艘 · 当前 ' + list.length + ' 艘';

    if (!list.length) {
      els.grid.innerHTML = '<div class="empty-state"><b>没有匹配的飞船</b>调整筛选条件。<button class="btn-small" type="button" id="empty-reset" style="margin-top:14px">清空筛选</button></div>';
      var er = document.getElementById('empty-reset');
      if (er) er.addEventListener('click', resetFilters);
      return;
    }

    els.grid.innerHTML = list.map(function (s, i) {
      var selected = state.compare.indexOf(s.id) !== -1;
      var fav = SC.isFav('ship', s.id);
      var status = statusClass(s.status);
      var sh = shop(s.id);
      var minBuy = sh.buy[0] ? sh.buy[0].price : s.auec;
      var avail = '';
      if (sh.buy.length) avail += '<span class="avail-buy">' + sh.buy.length + ' 地点有售</span>';
      else if (s.auec) avail += '<span class="avail-buy">游戏内参考价</span>';
      if (sh.rent.length) avail += '<span class="avail-rent">' + sh.rent.length + ' 地点可租</span>';
      if (!avail) avail = '<span>暂无游戏内购买记录</span>';
      return '<article class="ship-card reveal' + (selected ? ' selected' : '') + '" data-id="' + s.id + '" style="--i:' + (i % 6) + '">' +
        '<div class="ship-media">' + shipImage(s, 'card') +
          '<div class="ship-media-actions">' +
            '<button class="icon-btn fav' + (fav ? ' on' : '') + '" type="button" data-action="fav" data-id="' + s.id + '" aria-label="收藏 ' + SC.escapeHtml(s.name) + '">' + SC.favIcon(fav) + '</button>' +
            '<button class="icon-btn compare' + (selected ? ' on' : '') + '" type="button" data-action="compare" data-id="' + s.id + '" aria-label="加入对比">' + (selected ? SC.icon.check : SC.icon.plus) + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="ship-content">' +
          '<div class="ship-top"><span class="maker">' + SC.escapeHtml(SC.manuName(s.maker)) + '</span></div>' +
          '<h3 class="ship-name">' + SC.escapeHtml(s.name) + (s.cn && s.cn !== s.name ? '<span class="cn">' + SC.escapeHtml(s.cn) + '</span>' : '') + '</h3>' +
          '<div class="badges"><span class="badge role">' + SC.escapeHtml(s.role) + '</span><span class="badge">' + sizeLabel(s.size) + '</span><span class="badge ' + status + '">' + s.status + '</span></div>' +
          '<div class="ship-availability">' + avail + '</div>' +
          '<dl class="ship-specs">' +
            '<div><dt>货舱</dt><dd>' + (s.cargo ? SC.fmtNumber(s.cargo) + ' SCU' : '—') + '</dd></div>' +
            '<div><dt>乘员</dt><dd>' + SC.escapeHtml(s.crew) + '</dd></div>' +
            '<div><dt>SCM</dt><dd>' + (s.scm ? SC.fmtNumber(s.scm) + ' m/s' : '—') + '</dd></div>' +
            '<div><dt>最高速度</dt><dd>' + (s.max ? SC.fmtNumber(s.max) + ' m/s' : '—') + '</dd></div>' +
            '<div><dt>护盾</dt><dd>' + SC.escapeHtml(s.shield) + '</dd></div>' +
            '<div><dt>船体耐久</dt><dd>' + (s.hull ? SC.fmtNumber(s.hull) + ' HP' : '—') + '</dd></div>' +
            '<div class="wide"><dt>默认武装</dt><dd>' + SC.escapeHtml(s.weapons) + '</dd></div>' +
            '<div class="wide"><dt>导弹</dt><dd>' + SC.escapeHtml(s.missiles || '—') + '</dd></div>' +
          '</dl>' +
          '<div class="price-row"><div><span>USD</span><strong>' + SC.fmtUSD(s.usd) + '</strong></div><div class="auec"><span>aUEC</span><strong>' + (minBuy ? SC.fmtNumber(minBuy) : '—') + '</strong></div></div>' +
          '<button class="card-open" type="button" data-action="open">查看档案 ' + SC.icon.arrow + '</button>' +
        '</div>' +
      '</article>';
    }).join('');

    updateTray();
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
    var buyFallback = (!sh.buy.length && s.buy) ? '<p class="shop-note">参考购买点：' + SC.escapeHtml(s.buy) + (s.auec ? ' · 最低 ' + SC.fmtNumber(s.auec) + ' aUEC' : '') + '</p>' : '';
    var rentFallback = (!sh.rent.length && s.rent) ? '<p class="shop-note">参考租赁点：' + SC.escapeHtml(s.rent) + '</p>' : '';
    var rentRows = sh.rent.map(function (r) {
      var l = SC.locationById(r.locId) || {};
      return '<a class="shop-row rent" href="systems.html?loc=' + r.locId + '">' +
        '<span class="shop-row-loc"><b>' + SC.escapeHtml(SC.zhName(l) || l.name || r.locId) + '</b><small>' + SC.escapeHtml(SC.shopName(r.shop)) + '</small></span>' +
        '<span class="rent-values"><span>1日 <b>' + SC.fmtNumber(r.days[0]) + '</b></span><span>7日 <b>' + SC.fmtNumber(r.days[2]) + '</b></span><span>30日 <b>' + SC.fmtNumber(r.days[3]) + '</b></span></span>' +
      '</a>';
    }).join('');

    els.shipInner.innerHTML =
      '<button class="modal-close" type="button" aria-label="关闭">' + SC.icon.close + '</button>' +
      '<div class="detail-hero">' + hero + source + '</div>' +
      '<div class="detail-head"><div class="kicker">Ship Dossier // ' + SC.escapeHtml(s.maker).toUpperCase() + '</div>' +
        '<h2>' + SC.escapeHtml(s.name) + (s.cn && s.cn !== s.name ? '<span>' + SC.escapeHtml(s.cn) + '</span>' : '') + '</h2>' +
        '<div class="badges"><span class="badge role">' + SC.escapeHtml(s.role) + '</span><span class="badge">' + sizeLabel(s.size) + '</span><span class="badge ' + status + '">' + s.status + '</span>' + (fav ? '<span class="badge limited">已收藏</span>' : '') + '</div>' +
      '</div>' +
      '<div class="detail-layout">' +
        '<div class="detail-price-aside">' +
          '<div class="detail-price-card"><div><span>USD</span><b>' + SC.fmtUSD(s.usd) + '</b></div><div class="auec"><span>aUEC 参考价</span><b>' + (minBuy ? SC.fmtNumber(minBuy) : '—') + '</b></div></div>' +
          '<div class="stat-grid">' +
            '<div class="stat-cell"><dt>制造商</dt><dd>' + SC.escapeHtml(SC.manuName(s.maker)) + '</dd></div>' +
            '<div class="stat-cell"><dt>尺寸</dt><dd>' + sizeLabel(s.size) + '</dd></div>' +
            '<div class="stat-cell"><dt>乘员</dt><dd>' + SC.escapeHtml(s.crew) + '</dd></div>' +
            '<div class="stat-cell"><dt>货舱</dt><dd>' + (s.cargo ? SC.fmtNumber(s.cargo) + ' SCU' : '无') + '</dd></div>' +
            '<div class="stat-cell"><dt>SCM 速度</dt><dd>' + (s.scm ? SC.fmtNumber(s.scm) + ' m/s' : '—') + '</dd></div>' +
            '<div class="stat-cell"><dt>最高速度</dt><dd>' + (s.max ? SC.fmtNumber(s.max) + ' m/s' : '—') + '</dd></div>' +
            '<div class="stat-cell"><dt>护盾</dt><dd>' + SC.escapeHtml(shieldText) + '</dd></div>' +
            '<div class="stat-cell"><dt>船体耐久</dt><dd>' + (s.hull ? '≈ ' + SC.fmtNumber(s.hull) + ' HP' : '—') + '</dd></div>' +
          '</div>' +
        '</div>' +
        '<div class="detail-body">' +
          '<h4>默认武装</h4><div class="loadout-panel">' + loadoutMarkup(s) + '</div><p class="hull-note">船体耐久为结构 HP，不含护盾与装甲减伤；实际承受伤害还会受武器伤害类型影响。</p>' +
          '<h4>购买' + (sh.buy.length ? ' · ' + sh.buy.length + ' 个地点' : (s.buy ? ' · 参考购买点' : '')) + '</h4>' +
          (buyRows ? '<div class="shop-rows">' + buyRows + '</div>' : (buyFallback || '<p class="muted-line">暂无游戏内购买记录</p>')) +
          '<h4>租赁' + (sh.rent.length ? ' · ' + sh.rent.length + ' 个地点' : (s.rent ? ' · 参考租赁点' : '')) + '</h4>' +
          (rentRows ? '<div class="shop-rows">' + rentRows + '</div>' : (rentFallback || '<p class="muted-line">暂无可租赁地点</p>')) +
        '</div>' +
      '</div>';

    els.shipInner.querySelector('.modal-close').addEventListener('click', closeShipModal);
    if (!els.shipDialog.open) { els.shipDialog.showModal(); document.body.classList.add('modal-open'); }
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
    rows += row('角色', ships.map(function (s) { return SC.escapeHtml(s.role); }));
    rows += row('尺寸 / 状态', ships.map(function (s) { return sizeLabel(s.size) + ' · ' + s.status; }));
    rows += row('货舱', ships.map(function (s) { return (s.cargo ? SC.fmtNumber(s.cargo) + ' SCU' : '—') + bar(s.cargo, maxCargo); }));
    rows += row('最高速度', ships.map(function (s) { return (s.max ? SC.fmtNumber(s.max) + ' m/s' : '—') + bar(s.max, maxSpeed); }));
    rows += row('USD', ships.map(function (s) { return SC.fmtUSD(s.usd) + bar(s.usd, maxUsd); }));
    rows += row('aUEC 参考价', ships.map(function (s) { var v = minBuy(s); return (v ? SC.fmtNumber(v) : '—') + bar(v, maxAuec); }));
    rows += row('护盾 / 船体', ships.map(function (s) {
      var shield = s.shieldHp ? SC.fmtNumber(s.shieldHp) + ' HP' : SC.escapeHtml(s.shield);
      return shield + ' · ' + (s.hull ? '≈ ' + SC.fmtNumber(s.hull) : '—');
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
