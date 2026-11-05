/* =========================================================
   MOBIGLAS · 首页（电影感 hero + 商店网络）
   ========================================================= */

(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'home') return;

  var HERO_SHIPS = ['carrack', 'polaris', '890-jump'];
  var FEATURED = ['cutlass-black', 'gladius', 'andromeda', 'polaris'];
  var currentHero = 0;
  var heroTimer = null;
  var heroLayers = [];
  var heroVisible = 0;

  function init() {
    var homeShipCount = document.getElementById('hero-ship-count-home');
    if (homeShipCount && window.SC && SC.ships) homeShipCount.textContent = SC.ships.length;
    var componentCount = document.getElementById('hero-component-count');
    if (componentCount && window.SC_COMPONENT_SEARCH) componentCount.textContent = SC_COMPONENT_SEARCH.length;
    initHero();
    renderStats();
    renderFeatured();
    renderShops();
    renderPackage();
    renderSystems();
    if (typeof SC.refreshReveal === 'function') SC.refreshReveal();
  }

  /* ---------- Hero ---------- */
  function initHero() {
    var a = document.getElementById('hero-img-a');
    var b = document.getElementById('hero-img-b');
    if (!a || !b) return;
    heroLayers = [a, b];
    var dots = document.getElementById('hero-dots');
    dots.innerHTML = HERO_SHIPS.map(function (id, i) {
      var s = SC.shipById(id);
      return '<button class="cinema-dot' + (i === 0 ? ' active' : '') + '" type="button" data-hero="' + i + '" aria-label="' + SC.escapeHtml(s.name) + '"></button>';
    }).join('');
    dots.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-hero]');
      if (btn) switchHero(parseInt(btn.getAttribute('data-hero'), 10), true);
    });

    var hero = document.getElementById('cinema-hero');
    hero.addEventListener('mouseenter', pauseHero);
    hero.addEventListener('mouseleave', resumeHero);
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty('--px', (x * 12).toFixed(2));
      hero.style.setProperty('--py', (y * 8).toFixed(2));
    });

    updateHeroText(0);
    pauseHero();
    resumeHero();
  }

  function switchHero(index, manual) {
    if (index === currentHero) return;
    currentHero = index;
    var s = SC.shipById(HERO_SHIPS[index]);
    var media = SC.shipMedia(s.id) || {};
    var nextLayer = heroLayers[1 - heroVisible];
    var src = media.hero || media.card;
    if (src) {
      nextLayer.onload = function () {
        nextLayer.classList.add('active');
        heroLayers[heroVisible].classList.remove('active');
        heroVisible = 1 - heroVisible;
        nextLayer.onload = null;
      };
      nextLayer.src = src;
      nextLayer.alt = s.name + ' 飞船外观';
      if (nextLayer.complete) nextLayer.onload();
    }
    updateHeroText(index);
    if (manual) { pauseHero(); resumeHero(); }
  }

  function updateHeroText(index) {
    var s = SC.shipById(HERO_SHIPS[index]);
    var role = document.getElementById('hero-ship-role');
    var price = document.getElementById('hero-ship-price');
    var link = document.getElementById('hero-ship-link');
    if (link) { link.textContent = s.name; link.href = 'ships.html?ship=' + s.id; }
    if (role) role.textContent = s.cn || s.role;
    if (price) price.textContent = s.usd != null ? '$' + s.usd : s.role;
    Array.prototype.forEach.call(document.querySelectorAll('.cinema-dot'), function (d, i) {
      d.classList.toggle('active', i === index);
    });
  }

  function pauseHero() {
    if (heroTimer) clearInterval(heroTimer);
    heroTimer = null;
  }
  function resumeHero() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    pauseHero();
    heroTimer = setInterval(function () {
      switchHero((currentHero + 1) % HERO_SHIPS.length, false);
    }, 8000);
  }

  /* ---------- 统计 ---------- */
  function renderStats() {
    var shops = (window.SC_SHOPS && SC_SHOPS.locations) ? Object.keys(SC_SHOPS.locations).length : 0;
    document.getElementById('stat-ships').textContent = SC.ships.length;
    document.getElementById('stat-locations').textContent = SC.locations.length;
    document.getElementById('stat-systems').textContent = SC.systems.length;
    document.getElementById('stat-shops').textContent = shops;
  }

  /* ---------- 精选飞船 ---------- */
  function renderFeatured() {
    var host = document.getElementById('home-featured');
    if (!host) return;
    host.innerHTML = FEATURED.map(function (id, i) {
      var s = SC.shipById(id);
      if (!s) return '';
      var media = SC.shipMedia(id) || {};
      var src = media.hero || media.card || '';
      var img = src
        ? '<img src="' + SC.escapeHtml(src) + '" width="1600" height="900" alt="' + SC.escapeHtml(s.name) + ' 飞船外观" loading="lazy" decoding="async">'
        : '<div class="media-fallback"><strong>' + SC.escapeHtml(s.name) + '</strong></div>';
      return '<a class="featured-card reveal" href="ships.html?ship=' + id + '" style="--i:' + i + '">' +
        img +
        '<span class="featured-price">' + (s.usd != null ? SC.fmtUSD(s.usd) : '—') + '</span>' +
        '<span class="featured-copy"><small>' + SC.escapeHtml(SC.manuName(s.maker)) + '</small><b>' + SC.escapeHtml(s.name) + '</b><em>' + SC.escapeHtml(s.role) + '</em></span>' +
      '</a>';
    }).join('');
  }

  /* ---------- 商店网络 ---------- */
  function renderShops() {
    var host = document.getElementById('home-shops');
    if (!host || !window.SC_SHOPS) return;
    var locs = SC_SHOPS.locations;
    var ids = ['lorville', 'area18', 'orison', 'checkmate', 'ruin', 'orbituary'];
    host.innerHTML = ids.map(function (id, i) {
      var d = locs[id];
      var l = SC.locationById(id);
      if (!d || !l) return '';
      var allShops = d.shops || [];
      var names = allShops.slice(0, 3).join(' · ') + (allShops.length > 3 ? ' +' + (allShops.length - 3) : '');
      return '<a class="shop-card reveal" href="systems.html?loc=' + id + '" style="--i:' + i + '">' +
        '<div class="shop-card-top"><span class="shop-kicker">' + SC.escapeHtml((SC.systemById(l.system) || {}).name) + ' · ' + SC.typeLabels[l.type] + '</span><span class="shop-index">0' + (i + 1) + '</span></div>' +
        '<h3>' + SC.escapeHtml(SC.zhName(l)) + '</h3>' +
        '<p class="shop-names">' + SC.escapeHtml(names) + '</p>' +
        '<div class="shop-counts">' +
          '<span><b>' + d.counts.buy + '</b> 飞船</span>' +
          '<span><b>' + d.counts.rent + '</b> 租赁</span>' +
          '<span><b>' + d.counts.weapons + '</b> 飞船武器</span>' +
        '</div>' +
        '<span class="shop-open">查看商品 <span class="arrow">→</span></span>' +
      '</a>';
    }).join('');
  }

  /* ---------- 船包 ---------- */
  function renderPackage() {
    var host = document.getElementById('home-package');
    var p = window.SC_SHOPS && SC_SHOPS.package;
    if (!host || !p) return;
    host.innerHTML = '<article class="package-card reveal">' +
      '<div class="package-media"><img src="' + SC.escapeHtml(p.image) + '" width="1600" height="900" alt="' + SC.escapeHtml(p.name) + '" loading="lazy" decoding="async"><span class="package-badge">RSI 官网</span></div>' +
      '<div class="package-body">' +
        '<div class="kicker">Starter Package</div>' +
        '<h3>' + SC.escapeHtml(p.name) + '</h3>' +
        '<div class="package-price"><b>$' + p.priceUSD + '</b><span>$' + p.warbondUSD + ' Warbond</span></div>' +
        '<ul class="package-list">' + p.includes.map(function (x) { return '<li>' + SC.escapeHtml(x) + '</li>'; }).join('') + '</ul>' +
        '<a class="btn btn-primary" href="' + SC.escapeHtml(p.source) + '" target="_blank" rel="noopener">在 RSI 查看</a>' +
      '</div>' +
    '</article>';
  }

  /* ---------- 星系 ---------- */
  function renderSystems() {
    var host = document.getElementById('home-systems');
    if (!host) return;
    host.innerHTML = SC.systems.map(function (system, idx) {
      var locs = SC.locationsBySystem(system.id);
      var media = SC.systemMedia(system.id) || {};
      var map = media.preview || media.map || '';
      var img = map
        ? '<img src="' + SC.escapeHtml(map) + '" width="800" height="800" alt="' + SC.escapeHtml(system.name) + ' 星图" loading="lazy" decoding="async">'
        : '<div class="media-fallback"><strong>' + SC.escapeHtml(system.name) + '</strong></div>';
      return '<a class="system-card reveal" href="systems.html?system=' + system.id + '" style="--i:' + idx + '">' +
        '<div class="system-card-map">' + img + '</div>' +
        '<div class="system-card-body">' +
          '<div class="kicker">System // ' + String(idx + 1).padStart(2, '0') + '</div>' +
          '<h3>' + SC.escapeHtml(system.name) + '<small>' + system.en + '</small></h3>' +
          '<p>' + SC.escapeHtml((window.SC_SYSTEM_COPY && SC_SYSTEM_COPY[system.id]) || system.desc) + '</p>' +
          '<div class="system-tags"><span>' + locs.filter(function (l) { return l.type === 'station'; }).length + ' 空间站</span><span>' + (system.id === 'pyro' ? '无政府' : (system.id === 'nyx' ? '无法地带' : 'UEE 管辖')) + '</span></div>' +
          '<span class="system-card-link">打开航图 <span class="arrow">→</span></span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
