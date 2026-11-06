/* =========================================================
   MOBIGLAS · 斯坦顿拉格朗日休息站
   ---------------------------------------------------------
   数据源：Star Citizen Wiki「Category:Rest stops」与游戏 local.ini，
   Alpha 4.10.2。18 个休息站拆分为独立地点；原 lagrange 汇总
   节点隐藏，商店库存按站位分配到各站。不修改 data-locations.js。
   ========================================================= */

(function () {
  if (!window.SC || !Array.isArray(SC.locations)) return;
  var rows = [
  {
    "id": "hur-l1",
    "system": "stanton",
    "name": "HUR-L1 Green Glade Station",
    "cn": "赫-L1 绿色林地站",
    "type": "station",
    "parent": "Hurston",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "赫-L1 绿色林地站位于赫斯顿的 L1 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往赫斯顿的 L1 拉格朗日点，停靠赫-L1 绿色林地站。"
  },
  {
    "id": "hur-l2",
    "system": "stanton",
    "name": "HUR-L2 Faithful Dream Station",
    "cn": "赫-L2 坚贞梦想站",
    "type": "station",
    "parent": "Hurston",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "赫-L2 坚贞梦想站位于赫斯顿的 L2 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往赫斯顿的 L2 拉格朗日点，停靠赫-L2 坚贞梦想站。"
  },
  {
    "id": "hur-l3",
    "system": "stanton",
    "name": "HUR-L3 Thundering Express Station",
    "cn": "赫-L3 雷霆快车站",
    "type": "station",
    "parent": "Hurston",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "赫-L3 雷霆快车站位于赫斯顿的 L3 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往赫斯顿的 L3 拉格朗日点，停靠赫-L3 雷霆快车站。"
  },
  {
    "id": "hur-l4",
    "system": "stanton",
    "name": "HUR-L4 Melodic Fields Station",
    "cn": "赫-L4 旋律领域站",
    "type": "station",
    "parent": "Hurston",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "赫-L4 旋律领域站位于赫斯顿的 L4 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往赫斯顿的 L4 拉格朗日点，停靠赫-L4 旋律领域站。"
  },
  {
    "id": "hur-l5",
    "system": "stanton",
    "name": "HUR-L5 High Course Station",
    "cn": "赫-L5 高速路线站",
    "type": "station",
    "parent": "Hurston",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "赫-L5 高速路线站位于赫斯顿的 L5 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往赫斯顿的 L5 拉格朗日点，停靠赫-L5 高速路线站。"
  },
  {
    "id": "cru-l1",
    "system": "stanton",
    "name": "CRU-L1 Ambitious Dream Station",
    "cn": "十-L1 雄心伟梦站",
    "type": "station",
    "parent": "Crusader",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "十-L1 雄心伟梦站位于十字军的 L1 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往十字军的 L1 拉格朗日点，停靠十-L1 雄心伟梦站。"
  },
  {
    "id": "cru-l4",
    "system": "stanton",
    "name": "CRU-L4 Shallow Fields Station",
    "cn": "十-L4 轻浅田野站",
    "type": "station",
    "parent": "Crusader",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "十-L4 轻浅田野站位于十字军的 L4 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往十字军的 L4 拉格朗日点，停靠十-L4 轻浅田野站。"
  },
  {
    "id": "cru-l5",
    "system": "stanton",
    "name": "CRU-L5 Beautiful Glen Station",
    "cn": "十-L5 美丽峡谷站",
    "type": "station",
    "parent": "Crusader",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "十-L5 美丽峡谷站位于十字军的 L5 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往十字军的 L5 拉格朗日点，停靠十-L5 美丽峡谷站。"
  },
  {
    "id": "arc-l1",
    "system": "stanton",
    "name": "ARC-L1 Wide Forest Station",
    "cn": "弧-L1 广袤森林站",
    "type": "station",
    "parent": "ArcCorp",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "弧-L1 广袤森林站位于弧光星的 L1 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往弧光星的 L1 拉格朗日点，停靠弧-L1 广袤森林站。"
  },
  {
    "id": "arc-l2",
    "system": "stanton",
    "name": "ARC-L2 Lively Pathway Station",
    "cn": "弧-L2 活力小径站",
    "type": "station",
    "parent": "ArcCorp",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "弧-L2 活力小径站位于弧光星的 L2 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往弧光星的 L2 拉格朗日点，停靠弧-L2 活力小径站。"
  },
  {
    "id": "arc-l3",
    "system": "stanton",
    "name": "ARC-L3 Modern Express Station",
    "cn": "弧-L3 摩登快车站",
    "type": "station",
    "parent": "ArcCorp",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "弧-L3 摩登快车站位于弧光星的 L3 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往弧光星的 L3 拉格朗日点，停靠弧-L3 摩登快车站。"
  },
  {
    "id": "arc-l4",
    "system": "stanton",
    "name": "ARC-L4 Faint Glen Station",
    "cn": "弧-L4 黯淡幽谷站",
    "type": "station",
    "parent": "ArcCorp",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "弧-L4 黯淡幽谷站位于弧光星的 L4 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往弧光星的 L4 拉格朗日点，停靠弧-L4 黯淡幽谷站。"
  },
  {
    "id": "arc-l5",
    "system": "stanton",
    "name": "ARC-L5 Yellow Core Station",
    "cn": "弧-L5 黄色核心站",
    "type": "station",
    "parent": "ArcCorp",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "弧-L5 黄色核心站位于弧光星的 L5 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往弧光星的 L5 拉格朗日点，停靠弧-L5 黄色核心站。"
  },
  {
    "id": "mic-l1",
    "system": "stanton",
    "name": "MIC-L1 Shallow Frontier Station",
    "cn": "微-L1 浅边站",
    "type": "station",
    "parent": "microTech",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "微-L1 浅边站位于微科的 L1 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往微科的 L1 拉格朗日点，停靠微-L1 浅边站。"
  },
  {
    "id": "mic-l2",
    "system": "stanton",
    "name": "MIC-L2 Long Forest Station",
    "cn": "微-L2 长林站",
    "type": "station",
    "parent": "microTech",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "微-L2 长林站位于微科的 L2 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往微科的 L2 拉格朗日点，停靠微-L2 长林站。"
  },
  {
    "id": "mic-l3",
    "system": "stanton",
    "name": "MIC-L3 Endless Odyssey Station",
    "cn": "微-L3 无尽漫游站",
    "type": "station",
    "parent": "microTech",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "微-L3 无尽漫游站位于微科的 L3 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往微科的 L3 拉格朗日点，停靠微-L3 无尽漫游站。"
  },
  {
    "id": "mic-l4",
    "system": "stanton",
    "name": "MIC-L4 Red Crossroads Station",
    "cn": "微-L4 红色十字路口站",
    "type": "station",
    "parent": "microTech",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "微-L4 红色十字路口站位于微科的 L4 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往微科的 L4 拉格朗日点，停靠微-L4 红色十字路口站。"
  },
  {
    "id": "mic-l5",
    "system": "stanton",
    "name": "MIC-L5 Modern Icarus Station",
    "cn": "微-L5 现代伊卡洛斯站",
    "type": "station",
    "parent": "microTech",
    "danger": 1,
    "services": [
      "补给维修",
      "医疗"
    ],
    "desc": "微-L5 现代伊卡洛斯站位于微科的 L5 拉格朗日点，是斯坦顿航线上的休息与补给站。",
    "tips": "休息站提供燃料、维修和基础医疗；高峰时段留意停机位。",
    "howTo": "前往微科的 L5 拉格朗日点，停靠微-L5 现代伊卡洛斯站。"
  }
];
  rows.forEach(function (row) { SC.locations.push(row); });

  if (window.SC_I18N) {
    SC_I18N.locations = SC_I18N.locations || {};
    rows.forEach(function (row) { SC_I18N.locations[row.id] = row.cn; });
  }

  if (window.SC_SHOPS && SC_SHOPS.locations && SC_SHOPS.locations.lagrange) {
    var source = SC_SHOPS.locations.lagrange;
    rows.forEach(function (row) {
      var code = row.name.split(' ')[0];
      function pick(list) {
        return (list || []).filter(function (item) { return String(item.place || '').indexOf(code) !== -1; });
      }
      var current = SC_SHOPS.locations[row.id] || {};
      var rent = (current.rent && current.rent.length) ? current.rent : pick(source.rent);
      var weapons = (current.weapons && current.weapons.length) ? current.weapons : pick(source.weapons);
      var components = (current.components && current.components.length) ? current.components : pick(source.components);
      var shops = Array.from(new Set([].concat(rent, weapons, components).map(function (x) { return x.shop; }).filter(Boolean)));
      var entry = { buy: current.buy || [], rent: rent, weapons: weapons, components: components, shops: shops, counts: {} };
      entry.counts.rent = rent.length;
      entry.counts.weapons = weapons.length;
      var ids = {}; components.forEach(function (x) { ids[x.componentId] = 1; });
      entry.counts.components = Object.keys(ids).length;
      entry.counts.buy = 0;
      SC_SHOPS.locations[row.id] = entry;
      if (components.length || weapons.length) row.services.push('装备商店');
      if (rent.length) row.services.push('飞船租赁');
    });
    delete SC_SHOPS.locations.lagrange;
  }
})();
