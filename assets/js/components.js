/* =========================================================
   MOBIGLAS · 飞船配件索引
   ========================================================= */

(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'components') return;

  var meta = window.SC_COMPONENT_META || { types: {}, classes: {}, manufacturers: {} };
  var items = window.SC_COMPONENTS || [];
  var typeOrder = { power: 0, shield: 1, cooler: 2, quantum: 3, weapon: 4 };
  var PAGE_SIZE = 12;

  var state = { type: 'all', q: '', size: 'all', grade: 'all', itemClass: 'all', sale: 'all', sort: 'default', page: 1 };
  var els = {};

  var esc = function (value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var fmt = function (value, digits) {
    if (value == null || value === '') return '—';
    return Number(value).toLocaleString('en-US', { maximumFractionDigits: digits == null ? 1 : digits });
  };
  var typeLabel = function (type) {
    return (meta.types[type] && meta.types[type].label) || type;
  };
  var classLabel = function (value) {
    return (meta.classes[value] || value || '未分类');
  };
  var manuLabel = function (value) {
    return (meta.manufacturers[value] || SC.manuName(value) || value || '—');
  };
  var shopName = function (value) {
    return SC.shopName ? SC.shopName(value) : value;
  };
  var aggregateLocations = { lagrange: true, 'pyro-outposts': true };
  var isAggregate = function (shop) { return !!aggregateLocations[shop.locId]; };
  var locationName = function (id) {
    var loc = id && SC.locationById ? SC.locationById(id) : null;
    return loc ? (SC.zhName(loc) || loc.name) : '';
  };
  var displayName = function (item) {
    if (item.type === 'weapon' && SC.weaponName) return SC.weaponName(item.en || item.name);
    return item.name || item.en;
  };
  var weaponClass = function (item) {
    return SC.weaponType ? SC.weaponType({ name: item.en || item.name }) : '飞船武器';
  };
  var itemClass = function (item) {
    return item.type === 'weapon' ? weaponClass(item) : classLabel(item.itemClass);
  };

  function shopLine(shop) {
    var place = shop.loc || locationName(shop.locId) || '未知地点';
    if (shop.site) place += ' · ' + shop.site;
    return place;
  }

  function statRows(item) {
    var s = item.stats || {};
    var rows = [];
    var add = function (label, value, suffix, digits) {
      if (value == null || value === '') return;
      rows.push({ label: label, value: fmt(value, digits) + (suffix || '') });
    };
    if (item.type === 'power') {
      add('出力', s.output);
      add('冷却消耗', s.coolant);
      add('耐久', s.durability, ' HP', 0);
      add('体积', s.volume, ' μSCU', 0);
    } else if (item.type === 'shield') {
      add('最大护盾', s.max, ' HP', 0);
      add('恢复 / 秒', s.regen, ' HP', 0);
      add('功耗', s.power);
      add('耐久', s.durability, ' HP', 0);
      add('重启延迟', s.downed, ' s');
      add('受伤延迟', s.dmgDelay, ' s');
      add('体积', s.volume, ' μSCU', 0);
    } else if (item.type === 'cooler') {
      add('制冷', s.rate);
      add('功耗', s.power);
      add('耐久', s.durability, ' HP', 0);
      add('体积', s.volume, ' μSCU', 0);
    } else if (item.type === 'quantum') {
      if (s.speed != null) rows.push({ label: '速度', value: fmt(Math.round(s.speed / 1000)) + ' km/s' });
      add('充能', s.spool, ' s');
      add('冷却', s.cooldown, ' s');
      add('燃料', s.fuel);
      add('功耗', s.power);
      add('耐久', s.durability, ' HP', 0);
      add('体积', s.volume, ' μSCU', 0);
    } else if (item.type === 'weapon') {
      add('DPS', s.dps);
      add('持续 DPS', s.sustained);
      if (s.range != null) rows.push({ label: '射程', value: (s.range / 1000).toFixed(1) + ' km' });
      add('单发伤害', s.alpha);
      add('射速', s.rpm, ' rpm', 0);
    }
    return rows;
  }

  function statsMarkup(item, expanded) {
    var rows = statRows(item);
    if (!expanded) rows = rows.slice(0, 4);
    var note = item.type === 'weapon' && !item.stats.dps ? '<p class="component-warning">点防御发射器，暂无舰炮 DPS 数据。</p>' : '';
    return '<div class="component-stats' + (expanded ? ' expanded' : '') + '">' + rows.map(function (row) {
      return '<span><i>' + esc(row.label) + '</i><b>' + esc(row.value) + '</b></span>';
    }).join('') + '</div>' + note;
  }

  function sortedShops(item) {
    return (item.shops || []).slice().sort(function (a, b) { return a.price - b.price; });
  }

  function shopRows(item, limit) {
    var shops = sortedShops(item);
    var shown = shops.slice(0, limit);
    var html = shown.map(function (shop) {
      var loc = shop.loc || locationName(shop.locId) || '未知地点';
      var site = shop.site ? ' · ' + shop.site : '';
      var body =
        '<span class="component-shop-place"><b>' + esc(loc) + esc(site) + '</b><small>' + esc(shopName(shop.shop)) + '</small></span>' +
        '<span class="component-shop-price"><b>' + fmt(shop.price, 0) + '</b><small>aUEC</small></span>';
      if (shop.locId && !isAggregate(shop)) {
        return '<a class="component-shop-row" href="systems.html?loc=' + encodeURIComponent(shop.locId) + '">' + body + '</a>';
      }
      return '<div class="component-shop-row' + (isAggregate(shop) ? ' aggregate' : '') + '"' + (isAggregate(shop) ? ' title="星图按区域汇总，具体站点见上方"' : '') + '>' + body + '</div>';
    }).join('');
    var more = shops.length - shown.length;
    if (more > 0) html += '<div class="component-shop-more">另有 ' + more + ' 个购买点有售</div>';
    return html;
  }

  function cardMarkup(item, index) {
    var name = displayName(item);
    var en = item.en && item.en !== name ? '<small>' + esc(item.en) + '</small>' : '';
    var shops = sortedShops(item);
    var acquire = '<div class="component-acquire"><i>获取</i><span>' + esc(item.acquisition || '无公开获取记录') + '</span></div>';
    var shopsBlock = shops.length
      ? '<div class="component-shops">' + shopRows(item, 3) + '</div>'
      : '';
    var foot = shops.length
      ? '<span>' + shops.length + ' 个购买点 · 最低 ' + (item.minPrice == null ? '—' : fmt(item.minPrice, 0) + ' aUEC') + '</span><button class="component-open" type="button" data-open-component="' + esc(item.id) + '">全部购买点 →</button>'
      : '<span>商店无售</span><button class="component-open" type="button" data-open-component="' + esc(item.id) + '">获取方式 →</button>';
    return '<article class="component-card reveal' + (shops.length ? '' : ' unsold') + '" data-component="' + esc(item.id) + '" tabindex="0" style="--i:' + (index % 6) + '">' +
      '<div class="component-card-head"><span class="component-type">' + esc(typeLabel(item.type)) + '</span><span class="component-size">S' + esc(item.size == null ? '—' : item.size) + '</span></div>' +
      '<h3 class="component-name">' + esc(name) + en + '</h3>' +
      '<p class="component-maker">' + esc(manuLabel(item.manu)) + ' · ' + esc(itemClass(item)) + (item.grade ? ' · ' + esc(item.grade) + ' 级' : '') + '</p>' +
      statsMarkup(item) + acquire + shopsBlock +
      '<div class="component-card-foot">' + foot + '</div>' +
    '</article>';
  }

  function filtered() {
    var q = state.q.trim().toLowerCase();
    var list = items.filter(function (item) {
      if (state.type !== 'all' && item.type !== state.type) return false;
      if (state.size !== 'all' && String(item.size) !== String(state.size)) return false;
      if (state.grade !== 'all' && item.grade !== state.grade) return false;
      if (state.itemClass !== 'all' && (item.itemClass || '') !== state.itemClass) return false;
      if (state.sale === 'sold' && !(item.shops || []).length) return false;
      if (state.sale === 'unsold' && (item.shops || []).length) return false;
      if (!q) return true;
      var hay = [item.name, item.en, item.manu, manuLabel(item.manu), item.itemClass, classLabel(item.itemClass), typeLabel(item.type)]
        .concat((item.shops || []).map(function (shop) { return [shop.loc, shop.site, shop.shop, shopName(shop.shop)].join(' '); }))
        .join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    if (state.sort === 'default') {
      list.sort(function (a, b) {
        return (typeOrder[a.type] || 0) - (typeOrder[b.type] || 0) || (a.size || 0) - (b.size || 0) || ((a.shops || []).length ? 0 : 1) - ((b.shops || []).length ? 0 : 1) || a.name.localeCompare(b.name);
      });
    } else if (state.sort === 'price-asc') {
      list.sort(function (a, b) { return (a.minPrice == null ? Infinity : a.minPrice) - (b.minPrice == null ? Infinity : b.minPrice); });
    } else if (state.sort === 'price-desc') {
      list.sort(function (a, b) { return (b.minPrice == null ? -1 : b.minPrice) - (a.minPrice == null ? -1 : a.minPrice); });
    } else if (state.sort === 'size-asc') {
      list.sort(function (a, b) { return (a.size || 0) - (b.size || 0) || a.name.localeCompare(b.name); });
    } else if (state.sort === 'name') {
      list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    }
    return list;
  }

  function renderMatrix() {
    var host = els.matrix;
    if (!host) return;
    var order = ['power', 'shield', 'cooler', 'quantum', 'weapon'];
    host.innerHTML = order.map(function (type) {
      var list = items.filter(function (item) { return item.type === type; });
      var min = Math.min.apply(null, list.map(function (item) { return item.minPrice == null ? Infinity : item.minPrice; }));
      return '<button type="button" class="component-matrix-cell" data-matrix-type="' + type + '">' +
        '<span class="component-matrix-label">' + esc(typeLabel(type)) + '</span>' +
        '<b>' + list.length + '</b>' +
        '<small>' + (isFinite(min) ? '最低 ' + fmt(min, 0) + ' aUEC' : '暂无报价') + '</small>' +
      '</button>';
    }).join('');
  }

  function renderTypeTabs() {
    if (!els.tabs) return;
    var defs = [['all', '全部', items.length]].concat(['power', 'shield', 'cooler', 'quantum', 'weapon'].map(function (type) {
      return [type, typeLabel(type), items.filter(function (item) { return item.type === type; }).length];
    }));
    els.tabs.innerHTML = defs.map(function (def) {
      return '<button type="button" role="tab" aria-selected="' + (state.type === def[0] ? 'true' : 'false') + '" class="' + (state.type === def[0] ? 'active' : '') + '" data-type="' + def[0] + '">' +
        esc(def[1]) + ' <small>' + def[2] + '</small></button>';
    }).join('');
  }

  function renderSizes() {
    if (!els.size) return;
    var sizes = Array.from(new Set(items.map(function (item) { return item.size; }).filter(function (size) { return size != null; }))).sort(function (a, b) { return a - b; });
    els.size.innerHTML = '<option value="all">全部尺寸</option>' + sizes.map(function (size) {
      return '<option value="' + size + '">S' + size + '</option>';
    }).join('');
    els.size.value = state.size;
    var grades = Array.from(new Set(items.map(function (item) { return item.grade; }).filter(Boolean))).sort();
    els.grade.innerHTML = '<option value="all">全部等级</option>' + grades.map(function (grade) {
      return '<option value="' + esc(grade) + '">' + esc(grade) + ' 级</option>';
    }).join('');
    els.grade.value = state.grade;
    var classes = Array.from(new Set(items.map(function (item) { return item.itemClass || ''; }))).sort();
    els.itemClass.innerHTML = '<option value="all">全部级别</option>' + classes.map(function (value) {
      return '<option value="' + esc(value) + '">' + esc(classLabel(value)) + '</option>';
    }).join('');
    els.itemClass.value = state.itemClass;
  }

  function pagerMarkup(pages) {
    if (pages <= 1) return '<span>共 ' + filtered().length + ' 件</span>';
    var current = state.page;
    var nums = [];
    for (var i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - current) <= 2) nums.push(i);
    }
    var out = '<button type="button" data-page="prev"' + (current <= 1 ? ' disabled' : '') + '>上一页</button>';
    var last = 0;
    nums.forEach(function (n) {
      if (last && n - last > 1) out += '<span class="component-pager-gap">…</span>';
      out += '<button type="button" data-page="' + n + '" class="' + (n === current ? 'active' : '') + '">' + n + '</button>';
      last = n;
    });
    out += '<button type="button" data-page="next"' + (current >= pages ? ' disabled' : '') + '>下一页</button>';
    return out;
  }

  function render() {
    var list = filtered();
    var pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    state.page = Math.min(Math.max(1, state.page), pages);
    var start = (state.page - 1) * PAGE_SIZE;
    var visible = list.slice(start, start + PAGE_SIZE);

    els.count.textContent = '共 ' + items.length + ' 件 · 当前 ' + list.length + ' 件';
    if (!visible.length) {
      els.grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><b>没有匹配的配件</b>调整类别、尺寸或搜索词。</div>';
    } else {
      els.grid.innerHTML = visible.map(cardMarkup).join('');
    }
    els.pager.innerHTML = pagerMarkup(pages);
    renderTypeTabs();
    if (SC.refreshReveal) SC.refreshReveal();
    if (SC.bindTilt) SC.bindTilt('.component-card');
  }

  function setType(type) {
    state.type = type;
    state.page = 1;
    render();
  }

  function updateUrl() {
    var url = new URL(window.location.href);
    if (state.type !== 'all') url.searchParams.set('type', state.type); else url.searchParams.delete('type');
    if (state.q) url.searchParams.set('q', state.q); else url.searchParams.delete('q');
    try { window.history.replaceState({}, '', url.pathname + (url.search || '') + url.hash); } catch (e) {}
  }

  function openDetail(id) {
    var item = items.filter(function (entry) { return entry.id === id; })[0];
    if (!item) return;
    var shops = sortedShops(item);
    var allShops = shops.map(function (shop) {
      var loc = shop.loc || locationName(shop.locId) || '未知地点';
      var site = shop.site ? ' · ' + shop.site : '';
      var body =
        '<span class="component-shop-place"><b>' + esc(loc) + esc(site) + '</b><small>' + esc(shopName(shop.shop)) + '</small></span>' +
        '<span class="component-shop-price"><b>' + fmt(shop.price, 0) + '</b><small>aUEC</small></span>';
      if (shop.locId && !isAggregate(shop)) {
        return '<a class="component-shop-row" href="systems.html?loc=' + encodeURIComponent(shop.locId) + '">' + body + '</a>';
      }
      return '<div class="component-shop-row' + (isAggregate(shop) ? ' aggregate' : '') + '"' + (isAggregate(shop) ? ' title="星图按区域汇总，具体站点见上方"' : '') + '>' + body + '</div>';
    }).join('');

    var name = displayName(item);
    var en = item.en && item.en !== name ? '<small>' + esc(item.en) + '</small>' : '';
    els.inner.innerHTML =
      '<button class="modal-close" type="button" data-component-close aria-label="关闭">' + SC.icon.close + '</button>' +
      '<div class="component-modal-head">' +
        '<div class="component-modal-kicker">' + esc(typeLabel(item.type)) + ' / S' + esc(item.size == null ? '—' : item.size) + '</div>' +
        '<h2>' + esc(name) + en + '</h2>' +
        '<p>' + esc(manuLabel(item.manu)) + ' · ' + esc(itemClass(item)) + (item.grade ? ' · ' + esc(item.grade) + ' 级' : '') + '</p>' +
        '<p class="component-modal-acquire">获取方式：' + esc(item.acquisition || '无公开获取记录') + '</p>' +
      '</div>' +
      statsMarkup(item, true) +
      '<div class="component-modal-shops-head"><h4>购买点</h4><span>' + (shops.length ? shops.length + ' 个购买点 · 按价格排序' : '商店无售') + '</span></div>' +
      '<div class="component-modal-shops">' + (allShops || '<div class="component-no-shop">商店无售，暂无购买点；获取方式见上方。</div>') + '</div>' +
      '<p class="component-modal-note">价格为 CStone Universal Item Finder 社区记录，单位 aUEC；DPS 与获取方式来自 Star Citizen Wiki API。库存、价格与性能可能随版本变动。' + (item.type === 'quantum' ? ' 量子速度按 CStone 原始 DriveSpeed 换算为 km/s。' : '') + (shops.some(isAggregate) ? ' 标记为区域汇总的购买点未在星图中细分到具体站点。' : '') + '</p>';

    els.inner.querySelector('[data-component-close]').addEventListener('click', closeDetail);
    if (!els.dialog.open) {
      els.dialog.showModal();
      document.body.classList.add('modal-open');
    }
  }

  SC.openComponent = openDetail;

  function closeDetail() {
    if (els.dialog.open) els.dialog.close();
    document.body.classList.remove('modal-open');
  }

  function init() {
    els.matrix = document.getElementById('component-matrix');
    els.tabs = document.getElementById('component-type-tabs');
    els.grid = document.getElementById('component-grid');
    els.count = document.getElementById('component-count');
    els.pager = document.getElementById('component-pager');
    els.search = document.getElementById('component-search');
    els.size = document.getElementById('component-size-filter');
    els.grade = document.getElementById('component-grade-filter');
    els.itemClass = document.getElementById('component-class-filter');
    els.sale = document.getElementById('component-sale-filter');
    els.sort = document.getElementById('component-sort');
    els.reset = document.getElementById('component-reset');
    els.dialog = document.getElementById('component-dialog');
    els.inner = document.getElementById('component-modal-inner');

    var heroCount = document.getElementById('component-hero-count');
    var heroShops = document.getElementById('component-hero-shops');
    if (heroCount) heroCount.textContent = items.length;
    if (heroShops) heroShops.textContent = items.reduce(function (sum, item) { return sum + item.shops.length; }, 0).toLocaleString('en-US');

    var params = new URLSearchParams(window.location.search);
    if (params.get('type') && (params.get('type') === 'all' || meta.types[params.get('type')])) state.type = params.get('type');
    if (params.get('q')) { state.q = params.get('q'); els.search.value = state.q; }

    renderMatrix();
    renderSizes();
    if (SC.syncSelects) SC.syncSelects();
    render();
    if (params.get('component')) setTimeout(function () { openDetail(params.get('component')); }, 80);

    els.matrix.addEventListener('click', function (event) {
      var button = event.target.closest('[data-matrix-type]');
      if (!button) return;
      setType(button.getAttribute('data-matrix-type'));
      var grid = document.getElementById('component-grid');
      if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    els.tabs.addEventListener('click', function (event) {
      var button = event.target.closest('[data-type]');
      if (!button) return;
      setType(button.getAttribute('data-type'));
      updateUrl();
    });

    els.search.addEventListener('input', SC.debounce(function () {
      state.q = els.search.value.trim();
      state.page = 1;
      render();
      updateUrl();
    }, 120));

    els.size.addEventListener('change', function () {
      state.size = els.size.value;
      state.page = 1;
      render();
    });

    els.grade.addEventListener('change', function () {
      state.grade = els.grade.value;
      state.page = 1;
      render();
    });

    els.itemClass.addEventListener('change', function () {
      state.itemClass = els.itemClass.value;
      state.page = 1;
      render();
    });

    els.sale.addEventListener('change', function () {
      state.sale = els.sale.value;
      state.page = 1;
      render();
    });

    els.sort.addEventListener('change', function () {
      state.sort = els.sort.value;
      state.page = 1;
      render();
    });

    els.reset.addEventListener('click', function () {
      state.type = 'all'; state.q = ''; state.size = 'all'; state.grade = 'all'; state.itemClass = 'all'; state.sale = 'all'; state.sort = 'default'; state.page = 1;
      els.search.value = ''; els.size.value = 'all'; els.grade.value = 'all'; els.itemClass.value = 'all'; els.sale.value = 'all'; els.sort.value = 'default';
      if (SC.syncSelects) SC.syncSelects();
      render();
      updateUrl();
    });

    els.pager.addEventListener('click', function (event) {
      var button = event.target.closest('[data-page]');
      if (!button || button.disabled) return;
      var value = button.getAttribute('data-page');
      var pages = Math.max(1, Math.ceil(filtered().length / PAGE_SIZE));
      if (value === 'prev') state.page = Math.max(1, state.page - 1);
      else if (value === 'next') state.page = Math.min(pages, state.page + 1);
      else state.page = Number(value);
      render();
    });

    els.grid.addEventListener('click', function (event) {
      if (event.target.closest('a')) return;
      var card = event.target.closest('[data-component]');
      if (card) openDetail(card.getAttribute('data-component'));
    });
    els.grid.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      var card = event.target.closest('[data-component]');
      if (!card || event.target.closest('a')) return;
      event.preventDefault();
      openDetail(card.getAttribute('data-component'));
    });

    els.dialog.addEventListener('click', function (event) {
      if (event.target === els.dialog) closeDetail();
    });
    els.dialog.addEventListener('close', function () { document.body.classList.remove('modal-open'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
