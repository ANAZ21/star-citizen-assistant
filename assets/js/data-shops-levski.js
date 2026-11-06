/* =========================================================
   MOBIGLAS · 列夫斯基 Teach's Ship Shop 库存补充
   ---------------------------------------------------------
   数据源：Star Citizen Wiki「Teach's Ship Shop」价格表，
   最后核验 Alpha 4.10.2（2026-10-22）。不修改 data-shops.js /
   data-ships.js / data-locations.js。价格为 aUEC。
   ========================================================= */

(function () {
  if (!window.SC_SHOPS || !SC_SHOPS.locations) return;
  var buy = [
    { "shipId": "atls", "price": 75600, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "atls-geo", "price": 90720, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "avenger-titan", "price": 1358280, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "gladius", "price": 2381400, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "reclaimer", "price": 33339600, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "arrow", "price": 1984500, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "terrapin", "price": 5433120, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "mole", "price": 9376763, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "moth", "price": 8930250, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "mpuv-tractor", "price": 415800, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "raft", "price": 3543750, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "srv", "price": 3969000, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "mustang-alpha", "price": 642600, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "nomad", "price": 1512000, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "a2-hercules-starlifter", "price": 44296876, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "clipper", "price": 3810240, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "cutter", "price": 635040, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "golem", "price": 1111320, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "mule", "price": 68040, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "vulture", "price": 2778300, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "shiv", "price": 5556600, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "stinger", "price": 8930250, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "ptv", "price": 28350, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "roc", "price": 103950, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "roc-ds", "price": 141750, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "fortune", "price": 1984500, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "freelancer-dur", "price": 3316950, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "hull-a", "price": 1701000, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "hull-b", "price": 7938000, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "reliant-kore", "price": 1719900, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "starfarer", "price": 13891500, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "apollo-medivac", "price": 8295210, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "apollo-triage", "price": 7541100, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "aurora-mk-ii", "price": 904932, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "taurus", "price": 7641648, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "hermes", "price": 7110180, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "salvation", "price": 1185030, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" },
    { "shipId": "ursa-medivac", "price": 118503, "shop": "Teach's Ship Shop", "place": "Nyx - Delamar - Levski - Sublevel 01 - Hangar transit - Teach's Ship Shop" }
  ];
  SC_SHOPS.locations.levski = {
    buy: buy,
    rent: [],
    weapons: [],
    shops: ["Teach's Ship Shop"],
    counts: { buy: buy.length, rent: 0, weapons: 0, components: 0 }
  };
})();
