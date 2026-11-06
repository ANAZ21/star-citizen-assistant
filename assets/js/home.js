/* =========================================================
   MOBIGLAS · 首页（电影感 hero + 商店网络）
   ========================================================= */

(function () {
  'use strict';

  if (document.body.getAttribute('data-page') !== 'home') return;

  var HERO_SLIDES = [
    { type: 'ship', id: 'carrack' },
    { type: 'scene', loc: 'aberdeen', src: 'assets/img/scenery/aberdeen-sunset.webp' },
    { type: 'ship', id: 'polaris' },
    { type: 'scene', loc: 'microtech', src: 'assets/img/scenery/microtech-mountains.webp' },
    { type: 'ship', id: '890-jump' },
    { type: 'scene', loc: 'daymar', src: 'assets/img/scenery/daymar-javelin.webp' },
    { type: 'ship', id: 'constellation-phoenix' },
    { type: 'scene', loc: 'ita', src: 'assets/img/scenery/hurston-ita-valley.webp' },
    { type: 'ship', id: 'f8c-lightning' },
    { type: 'scene', loc: 'wala', src: 'assets/img/scenery/arccorp-wala.webp' }
  ];
  var FEATURED = [
    'cutlass-black', 'gladius', 'andromeda', 'polaris',
    'carrack', 'constellation-phoenix', 'guardian', 'asgard',
    'f8c-lightning', 'corsair', 'vulture', 'zeus-cl',
    'retaliator-bomber', 'hurricane', 'sabre', 'starlancer-max',
    'railen', 'ironclad', 'starfarer', 'prowler',
    '600i-touring', 'a1-spirit', 'scorpius', '890-jump'
  ];
  var FEATURED_PAGE_SIZE = 8;
  var featuredPage = 0;
  var featuredTimer = null;
  var currentHero = 0;
  var SHOP_MEDIA = {
    lorville: 'assets/img/locations/lorville.webp',
    area18: 'assets/img/locations/area18.webp',
    orison: 'assets/img/locations/orison.webp',
    checkmate: 'assets/img/locations/checkmate.webp',
    ruin: 'assets/img/locations/ruin.webp',
    orbituary: 'assets/img/locations/orbituary.webp'
  };
  var heroTimer = null;
  var heroLayers = [];

  function init() {
    var homeShipCount = document.getElementById('hero-ship-count-home');
    if (homeShipCount && window.SC && SC.ships) homeShipCount.textContent = SC.ships.length;
    var componentCount = document.getElementById('hero-component-count');
    if (componentCount && window.SC_COMPONENT_SEARCH) componentCount.textContent = SC_COMPONENT_SEARCH.length;
    initHero();
    renderFeatured();
    showFeaturedPage(0, false);
    initFeatured();
    renderShops();
    renderPackage();
    renderSystems();
    if (typeof SC.refreshReveal === 'function') SC.refreshReveal();
  }

  /* ---------- Hero ---------- */
  function heroSlideTitle(slide) {
    if (slide.type === 'ship') {
      var ship = SC.shipById(slide.id);
      return ship ? ship.name : '';
    }
    var loc = SC.locationById(slide.loc);
    return loc ? SC.zhName(loc) : '';
  }

  function heroSrc(slide) {
    if (slide.type === 'scene') return slide.src;
    var media = SC.shipMedia(slide.id) || {};
    return media.hero || media.card || '';
  }

  function initHero() {
    var media = document.querySelector('.cinema-media');
    if (!media) return;
    Array.prototype.forEach.call(media.querySelectorAll('.hero-layer'), function (img) { img.remove(); });
    HERO_SLIDES.forEach(function (slide, i) {
      var img = document.createElement('img');
      img.className = 'hero-layer' + (i === 0 ? ' active' : '');
      img.src = heroSrc(slide);
      img.alt = heroSlideTitle(slide) + (slide.type === 'ship' ? ' 飞船外观' : ' 行星地表');
      img.decoding = 'async';
      img.width = slide.type === 'scene' ? 2560 : 1600;
      img.height = slide.type === 'scene' ? 1440 : 900;
      if (i === 0) img.setAttribute('fetchpriority', 'high');
      media.insertBefore(img, media.firstChild);
    });
    heroLayers = Array.prototype.slice.call(media.querySelectorAll('.hero-layer'));
    heroLayers.reverse();

    var dots = document.getElementById('hero-dots');
    dots.innerHTML = HERO_SLIDES.map(function (slide, i) {
      return '<button class="cinema-dot' + (i === 0 ? ' active' : '') + '" type="button" data-hero="' + i + '" aria-label="' + SC.escapeHtml(heroSlideTitle(slide)) + '"></button>';
    }).join('');
    dots.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-hero]');
      if (btn) switchHero(parseInt(btn.getAttribute('data-hero'), 10), true);
    });

    var hero = document.getElementById('cinema-hero');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty('--px', (x * 38).toFixed(2));
      hero.style.setProperty('--py', (y * 26).toFixed(2));
    });
    hero.addEventListener('mouseleave', function () {
      hero.style.setProperty('--px', '0');
      hero.style.setProperty('--py', '0');
    });

    updateHeroText(0);
    resumeHero();
  }

  function switchHero(index, manual) {
    if (index === currentHero || !heroLayers[index]) return;
    heroLayers[currentHero].classList.remove('active');
    heroLayers[index].classList.add('active');
    currentHero = index;
    updateHeroText(index);
    if (manual) resumeHero();
  }

  function updateHeroText(index) {
    var slide = HERO_SLIDES[index];
    var label = document.getElementById('hero-slide-label');
    var role = document.getElementById('hero-ship-role');
    var price = document.getElementById('hero-ship-price');
    var link = document.getElementById('hero-ship-link');
    var card = document.querySelector('.cinema-ship-card');
    if (slide.type === 'ship') {
      var ship = SC.shipById(slide.id);
      if (!ship) return;
      if (label) label.textContent = '精选飞船';
      if (link) { link.textContent = ship.name; link.href = 'ships.html?ship=' + ship.id; }
      if (role) role.textContent = ship.cn || ship.role;
      if (price) price.textContent = ship.usd != null ? SC.fmtUSD(ship.usd) : '详情';
      if (card) card.classList.remove('is-scene');
    } else {
      var loc = SC.locationById(slide.loc);
      var system = loc && SC.systemById(loc.system);
      if (!loc) return;
      if (label) label.textContent = '行星地表';
      if (link) { link.textContent = SC.zhName(loc); link.href = 'systems.html?loc=' + loc.id; }
      if (role) role.textContent = SC.typeLabels[loc.type];
      if (price) price.textContent = system ? system.name : '';
      if (card) card.classList.add('is-scene');
    }
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
      switchHero((currentHero + 1) % HERO_SLIDES.length, false);
    }, 7000);
  }

  /* ---------- 统计 ---------- */
  function renderStats() {
    var shops = (window.SC_SHOPS && SC_SHOPS.locations) ? Object.keys(SC_SHOPS.locations).length : 0;
    document.getElementById('stat-ships').textContent = SC.ships.length;
    document.getElementById('stat-locations').textContent = SC.visibleLocations ? SC.visibleLocations().length : SC.locations.length;
    document.getElementById('stat-systems').textContent = SC.systems.length;
    document.getElementById('stat-shops').textContent = shops;
  }

  /* ---------- 精选飞船 ---------- */
  function renderFeatured() {
    var host = document.getElementById('home-featured');
    if (!host) return;
    host.innerHTML = FEATURED.map(function (id, index) {
      var s = SC.shipById(id);
      if (!s) return '';
      var media = SC.shipMedia(id) || {};
      var src = media.hero || media.card || '';
      var img = src
        ? '<img src="' + SC.escapeHtml(src) + '" width="1600" height="900" alt="' + SC.escapeHtml(s.name) + ' 飞船外观" loading="lazy" decoding="async">'
        : '<div class="media-fallback"><strong>' + SC.escapeHtml(s.name) + '</strong></div>';
      var page = Math.floor(index / FEATURED_PAGE_SIZE);
      return '<a class="featured-card" href="ships.html?ship=' + id + '" data-page="' + page + '" style="--i:' + (index % FEATURED_PAGE_SIZE) + '"' + (page ? ' hidden' : '') + '>' +
        img +
        '<span class="featured-price">' + (s.usd != null ? SC.fmtUSD(s.usd) : '—') + '</span>' +
        '<span class="featured-copy"><small>' + SC.escapeHtml(SC.manuName(s.maker)) + '</small><b>' + SC.escapeHtml(s.name) + '</b><em>' + SC.escapeHtml(s.role) + '</em></span>' +
      '</a>';
    }).join('');
  }

  function showFeaturedPage(page, animate) {
    var host = document.getElementById('home-featured');
    if (!host) return;
    featuredPage = page;
    Array.prototype.forEach.call(host.querySelectorAll('.featured-card'), function (card) {
      var active = parseInt(card.getAttribute('data-page'), 10) === page;
      card.hidden = !active;
      card.classList.remove('featured-enter');
      if (active && animate) {
        void card.offsetWidth;
        card.classList.add('featured-enter');
      }
    });
    preloadFeaturedPage((page + 1) % Math.ceil(FEATURED.length / FEATURED_PAGE_SIZE));
  }

  function preloadFeaturedPage(page) {
    window.setTimeout(function () {
      FEATURED.slice(page * FEATURED_PAGE_SIZE, (page + 1) * FEATURED_PAGE_SIZE).forEach(function (id) {
        var media = SC.shipMedia(id) || {};
        var src = media.hero || media.card;
        if (src) {
          var img = new Image();
          img.src = src;
        }
      });
    }, 1200);
  }

  function startFeaturedRotation() {
    pauseFeatured();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (FEATURED.length <= FEATURED_PAGE_SIZE) return;
    featuredTimer = setInterval(function () {
      var next = (featuredPage + 1) % Math.ceil(FEATURED.length / FEATURED_PAGE_SIZE);
      showFeaturedPage(next, true);
    }, 9000);
  }

  function pauseFeatured() {
    if (featuredTimer) clearInterval(featuredTimer);
    featuredTimer = null;
  }

  function initFeatured() {
    var host = document.getElementById('home-featured');
    if (!host) return;
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pauseFeatured();
      else startFeaturedRotation();
    });
    startFeaturedRotation();
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
      var allShops = (d.shops || []).map(function (name) {
        return SC.shopName ? SC.shopName(name) : name;
      }).filter(function (name, index, list) { return list.indexOf(name) === index; });
      var names = allShops.slice(0, 3).join(' · ') + (allShops.length > 3 ? ' +' + (allShops.length - 3) : '');
      var media = SHOP_MEDIA[id];
      var mediaUrl = media ? new URL(media, window.location.href).href : '';
      var style = '--i:' + i + (mediaUrl ? ';--shop-img:url(' + mediaUrl + ')' : '');
      return '<a class="shop-card reveal" href="systems.html?loc=' + id + '" style="' + style + '">' +
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
      var locs = SC.locationsBySystem(system.id).filter(function (l) { return !(SC.isHiddenLocation && SC.isHiddenLocation(l.id)); });
      var art = 'assets/img/systems/' + system.id + '-card.webp';
      var planets = locs.filter(function (l) { return l.type === 'planet'; }).length;
      var stations = locs.filter(function (l) { return l.type === 'station'; }).length;
      var jurisdiction = system.id === 'pyro' ? '无政府' : (system.id === 'nyx' ? '无法地带' : 'UEE 管辖');
      var tags = [planets + ' 行星'];
      if (stations) tags.push(stations + ' 空间站');
      tags.push(jurisdiction);
      return '<a class="system-card reveal" href="systems.html?system=' + system.id + '" style="--i:' + idx + '">' +
        '<div class="system-card-map"><img src="' + art + '" width="1600" height="1120" alt="' + SC.escapeHtml(system.name) + ' 星系图" loading="lazy" decoding="async"></div>' +
        '<div class="system-card-body">' +
          '<h3>' + SC.escapeHtml(system.name) + '<small>' + SC.escapeHtml(system.en) + '</small></h3>' +
          '<p>' + SC.escapeHtml((window.SC_SYSTEM_COPY && SC_SYSTEM_COPY[system.id]) || system.desc) + '</p>' +
          '<div class="system-tags">' + tags.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div>' +
          '<span class="system-card-link">打开航图 <span class="arrow">→</span></span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
