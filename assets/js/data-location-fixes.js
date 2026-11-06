/* =========================================================
   MOBIGLAS · 地点设施字段校正
   ---------------------------------------------------------
   仅覆盖展示层中与商店库存不一致的设施描述，不改
   data-locations.js / data-ships.js。依据：
   - Star Citizen Wiki：New Babbage 只有飞船租赁，没有飞船经销商；
     Factory Line 是 microTech 电子产品店。
   - Star Citizen Wiki：Grim HEX 没有飞船经销商，设有 Dumper's Depot
     等装备/配件商店。
   - Star Citizen Wiki / UEX：Ruin、Checkmate、Orbituary 有飞船商店。
   ========================================================= */

(function () {
  var fixes = {
    'new-babbage': {
      services: ['飞船租赁', '装备商店', '医疗', '任务', '科技展馆'],
      tips: '城市很大，第一次来容易迷路；太空港提供飞船租赁，购买飞船可前往 Lorville、Area18 或 Orison。'
    },
    'grim-hex': {
      services: ['黑市', '补给维修', '非法任务', '装备商店']
    },
    'checkmate': {
      services: ['飞船商店', '黑市', '补给维修', '任务', '医疗（有限）']
    },
    'ruin': {
      services: ['飞船商店', '黑市', '改装船', '非法任务', '补给维修']
    },
    'orbituary': {
      services: ['飞船商店', '补给维修', '医疗（有限）', '任务']
    }
  };
  if (!window.SC || !Array.isArray(SC.locations)) return;
  SC.locations.forEach(function (loc) {
    var fix = fixes[loc.id];
    if (!fix) return;
    if (fix.services) loc.services = fix.services.slice();
    if (fix.tips) loc.tips = fix.tips;
  });
})();
