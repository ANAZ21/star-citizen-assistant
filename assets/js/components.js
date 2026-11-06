/* =========================================================
   MOBIGLAS · 飞船配件索引
   ========================================================= */

(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'components') return;

  var meta = window.SC_COMPONENT_META || { types: {}, classes: {}, manufacturers: {} };
  var items = window.SC_COMPONENTS || [];
  var typeOrder = { power: 0, shield: 1, cooler: 2, quantum: 3, weapon: 4, missile: 5, missilelauncher: 6, bomb: 7, radar: 8, fueltank: 9, fuelintake: 10, qig: 11, emp: 12, turret: 13, tractor: 14, mining: 15, salvage: 16 };
  var typeKeys = ['power', 'shield', 'cooler', 'quantum', 'weapon', 'missile', 'missilelauncher', 'bomb', 'radar', 'fueltank', 'fuelintake', 'qig', 'emp', 'turret', 'tractor', 'mining', 'salvage'];
  var PAGE_SIZE = 12;

  var state = { type: 'all', q: '', size: 'all', grade: 'all', itemClass: 'all', sale: 'all', weaponKind: 'all', sort: 'default', page: 1 };
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
    return value ? (meta.classes[value] || value) : '';
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
  var placeAliases = {
    'platinumbay': '白金湾',
    "dumper'sdepot": '倾卸者仓库',
    'dumperdepot': '倾卸者仓库',
    'centermass': '核心区域',
    'buyandfly': '购船中心',
    'newdeal': '全新交易',
    'astroarmada': '天文舰队',
    'crusadershowroom': '十字军展厅',
    'shipparts': '飞船配件',
    'shipweapons': '飞船武器',
    'vantagerentals': '优越租赁',
    'travelerentals': '旅行者租赁',
    "teach'sshipshop": '蒂奇的飞船店',
    "teach'sitemshop": '蒂奇的物品店',
    'everusharbor': '埃弗勒斯港',
    'pyrogateway(nyx)': '派罗星门（尼克斯侧）',
    'stantongateway(nyx)': '斯坦顿星门（尼克斯侧）',
    'stantongateway(pyro)': '斯坦顿星门（派罗侧）',
    'nyxgateway(pyro)': '尼克斯星门（派罗侧）',
    'terragateway(stanton)': '泰拉星门（斯坦顿侧）',
    'pyrogateway(stanton)': '派罗星门（斯坦顿侧）'
  };
  var placeKey = function (value) {
    return String(value || '').toLowerCase().replace(/[\s·_\-()（）]+/g, '');
  };
  var translatedPlacePart = function (value) {
    var part = String(value || '').trim();
    if (!part) return '';
    var alias = placeAliases[placeKey(part)];
    if (alias) return alias;
    var normalized = part.toLowerCase();
    var loc = (SC.locations || []).filter(function (entry) {
      return String(entry.name || '').toLowerCase() === normalized;
    })[0];
    if (loc) return SC.zhName(loc) || loc.cn || loc.name;
    var shop = shopName(part);
    if (shop && shop !== part) return shop;
    return part;
  };
  var PYR_NUMBER = {
    'pyro i': 'pyro-i', 'pyro ii': 'monox', 'pyro iii': 'bloom',
    'pyro iv': 'fairo', 'pyro v': 'fuego', 'pyro vi': 'terminus'
  };
  var localizedPlace = function (shop) {
    var loc = shop.locId ? locationName(shop.locId) : '';
    if (!loc) loc = shop.loc || '';
    loc = loc || translatedPlacePart(shop.loc) || '未知地点';
    if (shop.locId === 'pyro-outposts' && shop.site) {
      var parts = String(shop.site).split(' · ').filter(Boolean);
      if (parts.length) {
        var numbered = PYR_NUMBER[parts[0].toLowerCase()];
        parts[0] = numbered ? locationName(numbered) : (SC.zhParent(parts[0]) || parts[0]);
        loc += ' · ' + parts.join(' · ');
      }
    }
    return loc;
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
  var weaponKinds = ['实弹', '能量', '激光', '畸变', '电磁', '电浆', '点防御', '导弹/鱼雷', '导弹发射器', '炸弹'];
  var weaponKind = function (item) {
    if (item.type === 'missile') return '导弹/鱼雷';
    if (item.type === 'missilelauncher') return '导弹发射器';
    if (item.type === 'bomb') return '炸弹';
    var type = item.type === 'weapon' && SC.weaponType ? SC.weaponType({ name: item.en || item.name }) : '';
    for (var i = 0; i < weaponKinds.length; i++) if (type.indexOf(weaponKinds[i]) !== -1) return weaponKinds[i];
    if (/Pepperbox/i.test(item.en || '')) return '点防御';
    if (type && ['加农炮', '速射炮', '霰弹炮', '炮塔'].indexOf(type) === -1) return type;
    return '其他';
  };
  var weaponTypes = { weapon: 1, missile: 1, missilelauncher: 1, bomb: 1 };

  function shopLine(shop) {
    var place = shop.loc || locationName(shop.locId) || '未知地点';
    if (shop.site) place += ' · ' + shop.site;
    return place;
  }

  function statRows(item) {
    if (item.statLines && item.statLines.length) return item.statLines.map(function (line) { return { label: line.label, value: line.value }; });
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
      var place = localizedPlace(shop);
      var body =
        '<span class="component-shop-place"><b>' + esc(place) + '</b><small>' + esc(translatedPlacePart(shop.shop)) + '</small></span>' +
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
      '<p class="component-maker">' + esc(manuLabel(item.manu)) + (itemClass(item) ? ' · ' + esc(itemClass(item)) : '') + (item.grade ? ' · ' + esc(item.grade) + ' 级' : '') + '</p>' +
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
      if (weaponTypes[state.type] && state.weaponKind !== 'all' && weaponKind(item) !== state.weaponKind) return false;
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
    } else if (state.sort === 'dps-desc') {
      list.sort(function (a, b) {
        var da = (a.stats && a.stats.dps) || 0;
        var dbb = (b.stats && b.stats.dps) || 0;
        return dbb - da;
      });
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
    var defs = [['all', '全部', items.length]].concat(typeKeys.filter(function (type) { return items.some(function (item) { return item.type === type; }); }).map(function (type) {
      return [type, typeLabel(type), items.filter(function (item) { return item.type === type; }).length];
    }));
    els.tabs.innerHTML = defs.map(function (def) {
      return '<button type="button" role="tab" aria-selected="' + (state.type === def[0] ? 'true' : 'false') + '" class="' + (state.type === def[0] ? 'active' : '') + '" data-type="' + def[0] + '">' +
        esc(def[1]) + ' <small>' + def[2] + '</small></button>';
    }).join('');
  }

  function sourceItems() {
    return state.type === 'all' ? items : items.filter(function (item) { return item.type === state.type; });
  }

  function renderSizes() {
    if (!els.size) return;
    var source = sourceItems();
    var sizes = Array.from(new Set(source.map(function (item) { return item.size; }).filter(function (size) { return size != null; }))).sort(function (a, b) { return a - b; });
    els.size.innerHTML = '<option value="all">全部尺寸</option>' + sizes.map(function (size) {
      return '<option value="' + size + '">S' + size + '</option>';
    }).join('');
    if (sizes.map(String).indexOf(String(state.size)) === -1) state.size = 'all';
    els.size.value = state.size;
    var grades = Array.from(new Set(source.map(function (item) { return item.grade; }).filter(Boolean))).sort();
    els.grade.innerHTML = '<option value="all">全部品质等级</option>' + grades.map(function (grade) {
      return '<option value="' + esc(grade) + '">' + esc(grade) + ' 级</option>';
    }).join('');
    if (grades.indexOf(state.grade) === -1) state.grade = 'all';
    els.grade.value = state.grade;
    var classes = Array.from(new Set(source.filter(function (item) { return !weaponTypes[item.type]; }).map(function (item) { return item.itemClass || ''; }).filter(Boolean))).sort();
    els.itemClass.innerHTML = '<option value="all">全部用途级别</option>' + classes.map(function (value) {
      return '<option value="' + esc(value) + '">' + esc(classLabel(value)) + '</option>';
    }).join('');
    if (classes.indexOf(state.itemClass) === -1) state.itemClass = 'all';
    els.itemClass.value = state.itemClass;
    if (els.weaponType) {
      var weaponSource = weaponTypes[state.type] ? items.filter(function (item) { return item.type === state.type; }) : items.filter(function (item) { return weaponTypes[item.type]; });
      var kinds = Array.from(new Set(weaponSource.map(weaponKind))).sort();
      els.weaponType.innerHTML = '<option value="all">全部武器类型</option>' + kinds.map(function (kind) {
        return '<option value="' + esc(kind) + '">' + esc(kind) + '</option>';
      }).join('');
      if (kinds.indexOf(state.weaponKind) === -1) state.weaponKind = 'all';
      els.weaponType.value = state.weaponKind;
    }
  }

  function syncFilterVisibility() {
    var isWeapon = !!weaponTypes[state.type];
    var source = sourceItems();
    var sizes = new Set(source.map(function (item) { return item.size; }).filter(function (size) { return size != null; }));
    var grades = new Set(source.map(function (item) { return item.grade; }).filter(Boolean));
    var classes = new Set(source.filter(function (item) { return !weaponTypes[item.type]; }).map(function (item) { return item.itemClass || ''; }).filter(Boolean));
    var soldCount = source.filter(function (item) { return (item.shops || []).length; }).length;
    var hasSaleMix = soldCount > 0 && soldCount < source.length;
    var weaponKinds = new Set(items.filter(function (item) { return isWeapon ? item.type === state.type : weaponTypes[item.type]; }).map(weaponKind));
    var visible = {
      size: sizes.size > 1,
      grade: !isWeapon && grades.size > 1,
      itemClass: !isWeapon && classes.size > 1,
      sale: !isWeapon && hasSaleMix,
      weaponType: isWeapon && weaponKinds.size > 1
    };
    if (!visible.sale && state.sale !== 'all') {
      state.sale = 'all';
      if (els.sale) els.sale.value = 'all';
    }
    [['size', els.size], ['grade', els.grade], ['itemClass', els.itemClass], ['sale', els.sale], ['weaponType', els.weaponType]].forEach(function (pair) {
      var select = pair[1];
      if (!select) return;
      var wrap = select.closest('.sc-select');
      if (wrap) wrap.hidden = !visible[pair[0]];
    });
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
      var lastType = '';
      var cards = [];
      visible.forEach(function (item, index) {
        if (item.type !== lastType) {
          cards.push('<div class="component-group-title"><span>' + esc(typeLabel(item.type)) + '</span><small>' + items.filter(function (entry) { return entry.type === item.type; }).length + '</small></div>');
          lastType = item.type;
        }
        cards.push(cardMarkup(item, index));
      });
      els.grid.innerHTML = cards.join('');
    }
    els.pager.innerHTML = pagerMarkup(pages);
    renderTypeTabs();
    syncFilterVisibility();
    if (SC.refreshReveal) SC.refreshReveal();
    if (SC.bindTilt) SC.bindTilt('.component-card');
  }

  function setType(type) {
    state.type = type;
    state.page = 1;
    if (weaponTypes[type]) {
      state.grade = 'all'; state.itemClass = 'all'; state.sale = 'all';
      if (els.grade) els.grade.value = 'all';
      if (els.itemClass) els.itemClass.value = 'all';
      if (els.sale) els.sale.value = 'all';
    } else {
      state.weaponKind = 'all';
      if (els.weaponType) els.weaponType.value = 'all';
    }
    renderSizes();
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
      var place = localizedPlace(shop);
      var body =
        '<span class="component-shop-place"><b>' + esc(place) + '</b><small>' + esc(translatedPlacePart(shop.shop)) + '</small></span>' +
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
      els.inner.scrollTop = 0;
      document.body.classList.add('modal-open');
    }
  }

  SC.openComponent = openDetail;

  function closeDetail() {
    if (els.dialog.open) els.dialog.close();
    document.body.classList.remove('modal-open');
  }

  function initHeroSlides() {
    var slides = window.SC_COMPONENT_HERO || [];
    var hosts = [document.getElementById('components-hero-media'), document.getElementById('component-showcase')].filter(Boolean);
    if (!hosts.length || !slides.length) return;
    hosts.forEach(function (host) {
      host.innerHTML = slides.map(function (src, i) { return '<img src="' + esc(src) + '" alt="" class="' + (i === 0 ? 'active' : '') + '"' + (i === 0 ? '' : ' loading="lazy"') + ' decoding="async">'; }).join('');
    });
    var groups = hosts.map(function (host) { return Array.prototype.slice.call(host.querySelectorAll('img')); });
    var max = Math.max.apply(null, groups.map(function (imgs) { return imgs.length; }));
    var hero = document.querySelector('.components-hero');
    if (hero) {
      hero.addEventListener('mousemove', function (event) {
        var r = hero.getBoundingClientRect();
        var x = (event.clientX - r.left) / r.width - 0.5;
        var y = (event.clientY - r.top) / r.height - 0.5;
        hero.style.setProperty('--px', (x * 30).toFixed(2));
        hero.style.setProperty('--py', (y * 20).toFixed(2));
      });
      hero.addEventListener('mouseleave', function () {
        hero.style.setProperty('--px', '0');
        hero.style.setProperty('--py', '0');
      });
    }
    if (max < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var index = 0;
    setInterval(function () {
      var previous = index;
      index = (index + 1) % max;
      groups.forEach(function (imgs) {
        if (imgs[previous]) imgs[previous].classList.remove('active');
        if (imgs[index]) imgs[index].classList.add('active');
      });
    }, 7000);
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
    els.weaponType = document.getElementById('component-weapon-type-filter');
    els.sort = document.getElementById('component-sort');
    els.reset = document.getElementById('component-reset');
    els.dialog = document.getElementById('component-dialog');
    els.inner = document.getElementById('component-modal-inner');

    var heroCount = document.getElementById('component-hero-count');
    var heroShops = document.getElementById('component-hero-shops');
    if (heroCount) heroCount.textContent = items.length;
    if (heroShops) heroShops.textContent = items.reduce(function (sum, item) { return sum + item.shops.length; }, 0).toLocaleString('en-US');
    var typeCount = document.getElementById('component-type-count');
    if (typeCount) typeCount.textContent = Object.keys(meta.types || {}).filter(function (type) { return items.some(function (item) { return item.type === type; }); }).length;

    var params = new URLSearchParams(window.location.search);
    if (params.get('type') && (params.get('type') === 'all' || meta.types[params.get('type')])) state.type = params.get('type');
    if (params.get('q')) { state.q = params.get('q'); els.search.value = state.q; }

    initHeroSlides();
    renderSizes();
    if (SC.syncSelects) SC.syncSelects();
    render();
    if (params.get('component')) setTimeout(function () { openDetail(params.get('component')); }, 80);

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

    if (els.weaponType) els.weaponType.addEventListener('change', function () {
      state.weaponKind = els.weaponType.value;
      state.page = 1;
      render();
    });

    els.sort.addEventListener('change', function () {
      state.sort = els.sort.value;
      state.page = 1;
      render();
    });

    els.reset.addEventListener('click', function () {
      state.type = 'all'; state.q = ''; state.size = 'all'; state.grade = 'all'; state.itemClass = 'all'; state.sale = 'all'; state.weaponKind = 'all'; state.sort = 'default'; state.page = 1;
      els.search.value = ''; els.size.value = 'all'; els.grade.value = 'all'; els.itemClass.value = 'all'; els.sale.value = 'all'; if (els.weaponType) els.weaponType.value = 'all'; els.sort.value = 'default';
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
