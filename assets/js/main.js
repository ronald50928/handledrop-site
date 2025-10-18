/* Main interactions and visuals */
(function () {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  // Year footer
  const year = new Date().getFullYear();
  $$('#year').forEach(el => el.textContent = String(year));

  // Mobile nav toggle
  const toggle = $('.nav-toggle');
  const list = $('#nav-list');
  if (toggle && list) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      list.style.display = expanded ? 'none' : 'flex';
    });
  }

  // Smooth scroll for on-page anchors
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id && id.length > 1) {
        const target = $(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Value Measurer — seeded random per day
  function cyrb128(str){
    let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
  }
  function mulberry32(a){
    return function(){
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }
  const d = new Date();
  const seedStr = `${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}`;
  const [s] = cyrb128(seedStr);
  const rand = mulberry32(s);

  // Highest trade today ($)
  const highest = Math.round((rand() * 4800) + 50);
  const highestStr = `$${highest.toLocaleString()}`;
  const fastMin = Math.max(4, Math.round(rand() * 120));
  const fastestStr = fastMin < 60 ? `${fastMin} min` : `${Math.round(fastMin/60)} hr`;
  const items = [
    'Nintendo Switch', 'AirPods Pro', 'iPad Mini', 'LEGO Millennium Falcon', 'Kindle Paperwhite',
    'PS5 Controller', 'Vintage Polaroid', 'iPhone 13', 'Dyson V8', 'Yeti Microphone'
  ];
  const requested = items[Math.floor(rand() * items.length)];

  const elHighest = $('#stat-highest');
  const elRequested = $('#stat-requested');
  const elFastest = $('#stat-fastest');
  if (elHighest) elHighest.textContent = highestStr;
  if (elRequested) elRequested.textContent = requested;
  if (elFastest) elFastest.textContent = fastestStr;

  // Bind audio feedback on CTAs and hover
  function bindAudio() {
    if (!window.HDAudio) return;
    $$('.cta-start').forEach(btn => {
      btn.addEventListener('click', () => window.HDAudio.playWhoosh());
      btn.addEventListener('mouseenter', () => window.HDAudio.playTick());
      btn.addEventListener('focus', () => window.HDAudio.playTick());
    });
    $$('#nav-list a').forEach(a => {
      a.addEventListener('mouseenter', () => window.HDAudio.playTick());
      a.addEventListener('focus', () => window.HDAudio.playTick());
    });
  }
  document.addEventListener('DOMContentLoaded', bindAudio);

  // Canvas starfield (reduced-motion aware)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('bg-canvas');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');
    let w, h, stars;
    const STAR_COUNT = 200;
    function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();
    function makeStars(){
      stars = Array.from({length: STAR_COUNT}, () => ({
        x: (rand()*2 - 1) * w, y: (rand()*2 - 1) * h, z: rand()*1 + 0.2
      }));
    }
    makeStars();
    function step(){
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = '#06080d';
      ctx.fillRect(0,0,w,h);
      for (const s of stars){
        s.x += s.z * 0.3; s.y += s.z * 0.3;
        if (s.x > w/2 || s.y > h/2) { s.x = -w/2; s.y = -h/2; s.z = rand()*1 + 0.2; }
        const sx = s.x + w/2; const sy = s.y + h/2;
        const size = s.z * 1.8;
        ctx.fillStyle = 'rgba(14,165,233,0.9)';
        ctx.fillRect(sx, sy, size, size);
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
})();

