/* =========================================================
   MOBIGLAS · 配件购买点修正（页面数据整理）
   ---------------------------------------------------------
   解析器在 data-component-shop-resolver.js。这里补齐站点、
   统一品牌名、写入中文地点，并去掉同一终端同一价格的重复行。
   原始 data-components*.js 不修改，只在运行时应用。
   ========================================================= */

(function () {
  if (!window.SC_COMPONENTS || !Array.isArray(SC_COMPONENTS)) return;
  if (!window.SC || !Array.isArray(SC.locations)) return;
  if (!SC.componentShopLocId || !SC.componentShopBrand) return;

  function zhLocation(id) {
    var loc = id && SC.locationById ? SC.locationById(id) : null;
    if (!loc) return '';
    return (SC.zhName ? SC.zhName(loc) : '') || loc.cn || loc.name || '';
  }

  /* 同一 type/名称/尺寸/等级/厂商的重复条目合并，购买点取并集 */
  var groups = {};
  var merged = [];
  SC_COMPONENTS.forEach(function (item) {
    var key = [item.type, item.name, item.en, item.size, item.grade, item.manu].join('|');
    var target = groups[key];
    if (target) {
      target.shops = (target.shops || []).concat(item.shops || []);
      if (item.stats && (!target.stats || !Object.keys(target.stats).length)) target.stats = item.stats;
      if (item.statLines && (!target.statLines || !target.statLines.length)) target.statLines = item.statLines;
      target.sold = target.sold || item.sold;
      if (item.minPrice != null && (target.minPrice == null || item.minPrice < target.minPrice)) target.minPrice = item.minPrice;
      return;
    }
    groups[key] = item;
    merged.push(item);
  });
  if (merged.length !== SC_COMPONENTS.length) {
    SC_COMPONENTS.length = 0;
    Array.prototype.push.apply(SC_COMPONENTS, merged);
  }

  SC_COMPONENTS.forEach(function (item) {
    var shops = item.shops || [];
    if (!shops.length) return;
    var seen = {};
    var rows = [];
    shops.forEach(function (row) {
      var id = SC.componentShopLocId(row);
      if (id) {
        row.locId = id;
        var name = zhLocation(id);
        if (name) row.loc = name;
      }
      row.shop = SC.componentShopBrand(row.shop);
      var place = String(row.place || '').toLowerCase().replace(/\s+/g, ' ');
      var key = [row.locId || row.loc || '', place, row.shop, row.price].join('|');
      if (seen[key]) return;
      seen[key] = 1;
      rows.push(row);
    });
    item.shops = rows;
    if (rows.length) {
      item.minPrice = rows.reduce(function (min, row) { return row.price < min ? row.price : min; }, rows[0].price);
    } else {
      item.minPrice = null;
    }
  });
})();
