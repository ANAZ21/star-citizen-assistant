/* =========================================================
   MOBIGLAS · 新手指南 · 商店速查
   ========================================================= */

(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'guide') return;

  var host = document.getElementById('guide-shops');
  if (!host || !window.SC_SHOPS) return;

  var data = SC_SHOPS.locations || {};
  var pins = SC_SHOPS.pins || [];
  var primary = pins.filter(function (id) { return data[id]; });
  var stations = Object.keys(data).filter(function (id) { return pins.indexOf(id) === -1; });

  stations.sort(function (a, b) {
    var da = data[a], db = data[b];
    var sa = da.counts.rent * 100 + da.counts.weapons;
    var sb = db.counts.rent * 100 + db.counts.weapons;
    return sb - sa;
  });

  var totalShips = 0, totalWeapons = 0, totalRent = 0;
  Object.keys(data).forEach(function (id) {
    var c = data[id].counts;
    totalShips += c.buy;
    totalWeapons += c.weapons;
    totalRent += c.rent;
  });

  host.innerHTML =
    '<div class="guide-shop-summary">' +
      '<span><b>' + Object.keys(data).length + '</b> 处商店地点</span>' +
      '<span><b>' + totalShips + '</b> 艘可购飞船</span>' +
      '<span><b>' + totalWeapons + '</b> 件武器</span>' +
      '<span><b>' + totalRent + '</b> 项租赁</span>' +
    '</div>' +
    '<div class="guide-shop-grid">' + primary.map(cardHTML).join('') + '</div>' +
    '<div class="guide-stations">' +
      '<div class="guide-stations-head"><b>空间站与租赁点</b><small>城市太空港、轨道站与中转站</small></div>' +
      stationRows() +
    '</div>';

  function shipPool(d) {
    var ids = [];
    d.buy.forEach(function (x) { if (ids.indexOf(x.shipId) === -1) ids.push(x.shipId); });
    if (ids.length < 3) d.rent.forEach(function (x) { if (ids.indexOf(x.shipId) === -1) ids.push(x.shipId); });
    return ids;
  }

  function cardHTML(id) {
    var d = data[id];
    var l = SC.locationById(id) || {};
    var c = d.counts;
    var pool = shipPool(d);
    var thumbs = pool.slice(0, 3).map(function (sid, i) {
      var s = SC.shipById(sid);
      var media = SC.shipMedia(sid) || {};
      if (!s || !media.card) return '';
      return '<span class="gsc-thumb" style="--t:' + i + '"><img src="' + SC.escapeHtml(media.card) + '" width="800" height="450" alt="' + SC.escapeHtml(s.name) + '" loading="lazy" decoding="async"></span>';
    }).join('');
    var more = pool.length > 3 ? '<span class="gsc-more">+' + (pool.length - 3) + '</span>' : '';
    var displayName = SC.zhName(l) || String(l.name || id).replace(/\s+Station$/, '');
    var displayEn = String(l.name || id).replace(/\s+Station$/, '');
    var system = SC.systemById(l.system) || {};
    return '<a class="guide-shop-card" href="systems.html?loc=' + id + '">' +
      '<span class="gsc-head"><span><b>' + SC.escapeHtml(displayName) + '</b><small>' + SC.escapeHtml(displayEn) + '</small></span><em>' + SC.escapeHtml(system.en || '') + '</em></span>' +
      '<span class="gsc-shops">' + SC.escapeHtml((d.shops || []).join(' · ')) + '</span>' +
      '<span class="gsc-thumbs">' + thumbs + more + '</span>' +
      '<span class="gsc-stats">' +
        '<span><b>' + c.buy + '</b> 飞船</span>' +
        '<span><b>' + c.rent + '</b> 租赁</span>' +
        '<span><b>' + c.weapons + '</b> 武器</span>' +
      '</span>' +
      '<span class="gsc-foot">查看库存 <i>→</i></span>' +
    '</a>';
  }

  function stationRows() {
    return stations.map(function (id) {
      var d = data[id];
      var l = SC.locationById(id) || {};
      var c = d.counts;
      return '<a class="guide-station-row" href="systems.html?loc=' + id + '">' +
        '<span class="gsr-main"><b>' + SC.escapeHtml(SC.zhName(l)) + '</b><small>' + SC.escapeHtml(l.name || id) + '</small></span>' +
        '<span class="gsr-shops">' + SC.escapeHtml((d.shops || []).join(' · ')) + '</span>' +
        '<span class="gsr-counts"><span><b>' + c.buy + '</b> 船</span><span><b>' + c.rent + '</b> 租</span><span><b>' + c.weapons + '</b> 武器</span></span>' +
        '<span class="gsr-arrow">→</span>' +
      '</a>';
    }).join('');
  }

  if (typeof SC.refreshReveal === 'function') SC.refreshReveal();
})();
