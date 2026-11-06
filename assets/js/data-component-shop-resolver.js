/* =========================================================
   MOBIGLAS · 配件商店解析器
   ---------------------------------------------------------
   把 CStone 的英文终端路径解析成站点 locId 与统一品牌名。
   data-components.js 在向地点汇总库存时调用这里。
   ========================================================= */

(function () {
  if (!window.SC) return;

  var LOCATION_RULES = [
    [/Pyro Gateway \(Nyx\)/i, 'pyro-gateway-nyx'],
    [/Pyro Gateway \(Stanton\)/i, 'pyro-gateway'],
    [/Nyx Gateway \(Pyro\)/i, 'nyx-gateway-pyro'],
    [/Nyx Gateway \(Stanton\)/i, 'nyx-gateway'],
    [/Stanton Gateway \(Pyro\)/i, 'stanton-gateway-pyro'],
    [/Stanton Gateway \(Nyx\)/i, 'stanton-gateway-nyx'],
    [/Terra Gateway/i, 'terra-gateway'],
    [/Magnus Gateway/i, 'magnus-gateway'],
    [/Everus Harbor/i, 'everus'],
    [/Port Tressler/i, 'tressler'],
    [/Baijini Point/i, 'baijini'],
    [/Seraphim/i, 'seraphim'],
    [/Grim\s*HEX/i, 'grim-hex'],
    [/Area\s*18/i, 'area18'],
    [/Lorville/i, 'lorville'],
    [/Orison/i, 'orison'],
    [/New Babbage/i, 'new-babbage'],
    [/Levski/i, 'levski'],
    [/Checkmate/i, 'checkmate'],
    [/Ruin Station/i, 'ruin'],
    [/Orbituary/i, 'orbituary'],
    [/Starlight/i, 'starlight'],
    [/Patch City/i, 'patch-city'],
    [/Gaslight/i, 'gaslight'],
    [/Rat's Nest/i, 'rats-nest'],
    [/Endgame/i, 'endgame'],
    [/Megumi/i, 'megumi-refueling'],
    [/Rod's Fuel/i, 'rods-fuel'],
    [/Dudley/i, 'dudley-daughters']
  ];

  var BRANDS = [
    [/^Platinum Bay/i, 'Platinum Bay'],
    [/^Dumper'?s(?:\s*Depot)?/i, "Dumper's Depot"],
    [/^(?:CenterMass|Centermass|CentreMass)/i, 'CenterMass'],
    [/^Cousin Crow'?s/i, "Cousin Crow's"],
    [/^Ship Weapons/i, 'Ship Weapons'],
    [/^Ship Parts/i, 'Ship Parts'],
    [/^Omega/i, 'Omega Pro'],
    [/^Teach'?s.*Item/i, "Teach's Item Shop"],
    [/^Teach/i, "Teach's Ship Shop"],
    [/^Refinery Shop/i, 'Refinery Shop'],
    [/^Cargo Center Supplies/i, 'Cargo Center Supplies'],
    [/^Cargo Services/i, 'Cargo Services'],
    [/^Tammany/i, 'Tammany and Sons'],
    [/^Shubin/i, 'Shubin Interstellar'],
    [/^HD Showcase/i, 'HD Showcase'],
    [/^Main Hall/i, 'Main Hall'],
    [/^Galleria/i, 'Galleria'],
    [/^Casaba/i, 'Casaba'],
    [/^Cubby Blast/i, 'Cubby Blast'],
    [/^Live Fire/i, 'Live Fire Weapons'],
    [/^Skutters/i, 'Skutters'],
    [/^Keltour/i, 'Keltour'],
    [/^商店终端/, '商店终端']
  ];

  SC.componentShopLocId = function (row) {
    if (!row) return '';
    var text = [row.place, row.site, row.shop, row.loc].join(' | ');
    /* 带侧别的星门名优先于预置 locId（部分数据把尼克斯侧标成了斯坦顿侧） */
    if (/Pyro Gateway \(Nyx\)/i.test(text)) return 'pyro-gateway-nyx';
    if (/Pyro Gateway \(Stanton\)/i.test(text)) return 'pyro-gateway';
    if (/Nyx Gateway \(Pyro\)/i.test(text)) return 'nyx-gateway-pyro';
    if (/Nyx Gateway \(Stanton\)/i.test(text)) return 'nyx-gateway';
    if (/Stanton Gateway \(Pyro\)/i.test(text)) return 'stanton-gateway-pyro';
    if (/Stanton Gateway \(Nyx\)/i.test(text)) return 'stanton-gateway-nyx';
    /* 派罗拉格朗日站常被 CStone 归到 pyro-outposts，按站名归位 */
    if (/Patch City/i.test(text)) return 'patch-city';
    if (/Gaslight/i.test(text)) return 'gaslight';
    if (/Rod.?s Fuel/i.test(text)) return 'rods-fuel';
    if (/Rat.?s Nest/i.test(text)) return 'rats-nest';
    if (/Endgame/i.test(text)) return 'endgame';
    if (/Dudley/i.test(text)) return 'dudley-daughters';
    if (/Megumi/i.test(text)) return 'megumi-refueling';
    /* 拉格朗日站：优先落到具体站点（HUR-L2 → hur-l2） */
    var lp = text.match(/\b(HUR|CRU|ARC|MIC)-L(\d)\b/i);
    if (lp) {
      var stopId = (lp[1] + '-l' + lp[2]).toLowerCase();
      if (SC.locationById && SC.locationById(stopId)) return stopId;
      return 'lagrange';
    }
    if (row.locId && SC.locationById && SC.locationById(row.locId)) return row.locId;
    for (var i = 0; i < LOCATION_RULES.length; i++) {
      if (LOCATION_RULES[i][0].test(text)) return LOCATION_RULES[i][1];
    }
    if (/Pyro Gateway/i.test(text)) return /Nyx/i.test(text) ? 'pyro-gateway-nyx' : 'pyro-gateway';
    if (/Nyx Gateway/i.test(text)) return /Pyro/i.test(text) ? 'nyx-gateway-pyro' : 'nyx-gateway';
    if (/Stanton Gateway/i.test(text)) return /Pyro/i.test(text) ? 'stanton-gateway-pyro' : 'stanton-gateway-nyx';
    return '';
  };

  SC.componentShopBrand = function (value) {
    var name = String(value || '').trim();
    for (var i = 0; i < BRANDS.length; i++) {
      if (BRANDS[i][0].test(name)) return BRANDS[i][1];
    }
    return name;
  };
})();
