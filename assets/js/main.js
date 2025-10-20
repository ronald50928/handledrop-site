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
    // Mute by default; sounds only on user opt-in via button
    const audioBtn = $('.audio-toggle');
    function setBtnState() {
      if (!audioBtn) return;
      const muted = window.HDAudio.muted;
      audioBtn.setAttribute('aria-pressed', String(!muted));
      audioBtn.textContent = muted ? 'Hear the sound of our network' : 'Silence the network';
    }
    if (audioBtn) {
      setBtnState();
      audioBtn.addEventListener('click', () => {
        if (window.HDAudio.muted) {
          window.HDAudio.setMuted(false);
          // Start ambient pad to showcase the network sound
          window.HDAudio.toggleAmbient();
          // Give a subtle confirmation
          window.HDAudio.playTick();
        } else {
          // Stop ambient if running, then mute
          window.HDAudio.toggleAmbient();
          window.HDAudio.setMuted(true);
        }
        setBtnState();
      });
    }
    // For CTAs and nav: only play if unmuted
    $$('.cta-start').forEach(btn => {
      btn.addEventListener('click', () => { if (!window.HDAudio.muted) window.HDAudio.playWhoosh(); });
      btn.addEventListener('mouseenter', () => { if (!window.HDAudio.muted) window.HDAudio.playTick(); });
      btn.addEventListener('focus', () => { if (!window.HDAudio.muted) window.HDAudio.playTick(); });
    });
    $$('#nav-list a').forEach(a => {
      a.addEventListener('mouseenter', () => { if (!window.HDAudio.muted) window.HDAudio.playTick(); });
      a.addEventListener('focus', () => { if (!window.HDAudio.muted) window.HDAudio.playTick(); });
    });
  }
  document.addEventListener('DOMContentLoaded', bindAudio);

  // Canvas neural network background (reduced-motion aware)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('bg-canvas');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    let nodes = [], edges = [], pulses = [];

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const cssW = window.innerWidth;
      const cssH = window.innerHeight;
      w = canvas.width = Math.floor(cssW * dpr);
      h = canvas.height = Math.floor(cssH * dpr);
      // CSS size remains full-bleed
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      initGraph();
    }
    window.addEventListener('resize', () => { clearTimeout(resize._t); resize._t = setTimeout(resize, 150); });

    // Graph construction
    function initGraph() {
      nodes = []; edges = []; pulses = [];
      const area = (w / dpr) * (h / dpr);
      const baseDensity = 0.00010; // nodes per pixel
      const count = Math.round(area * baseDensity);
      const N = Math.max(48, Math.min(120, count));
      for (let i = 0; i < N; i++) {
        nodes.push({ x: rand() * w, y: rand() * h, r: (0.8 + rand()*0.8) * dpr });
      }
      // Connect each node to its k nearest within a radius
      const k = 3; // desired degree
      const maxDist = Math.min(w, h) * 0.18;
      const seen = new Set();
      for (let i = 0; i < N; i++) {
        const dists = [];
        for (let j = 0; j < N; j++) {
          if (i === j) continue;
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.hypot(dx, dy);
          if (dist <= maxDist) dists.push({ j, dist, dx, dy });
        }
        dists.sort((a, b) => a.dist - b.dist);
        for (let n = 0; n < Math.min(k, dists.length); n++) {
          const j = dists[n].j;
          const a = Math.min(i, j), b = Math.max(i, j);
          const key = (a << 16) | b; // simple pair key (N <= 120)
          if (seen.has(key)) continue;
          seen.add(key);
          const dx = nodes[b].x - nodes[a].x;
          const dy = nodes[b].y - nodes[a].y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len, uy = dy / len;
          edges.push({ a, b, len, ux, uy });
        }
      }
      // Seed some pulses (fewer for magical effect)
      const targetPulses = Math.round(edges.length * 0.15);
      for (let i = 0; i < targetPulses; i++) spawnPulse();
    }

    function spawnPulse() {
      if (edges.length === 0) return;
      const e = edges[(Math.random() * edges.length) | 0];
      const dir = rand() > 0.5 ? 1 : -1; // travel either way
      const huePick = rand();
      const color = huePick < 0.6 ? 'rgba(14,165,233,0.95)' : 'rgba(244,63,94,0.98)'; // brand or accent
      // Much slower speed for magical shooting star effect
      const base = 0.00008 + rand()*0.00012; // slower progress per ms
      // Longer trail for shooting star effect (like wishing stars)
      const trailLength = 0.25 + rand()*0.35; // longer comet tail
      pulses.push({ e, t: rand()*0.95, dir, spd: base, color, trail: trailLength });
    }

    let last = performance.now();
    function step(now) {
      const dt = Math.min(50, now - last); // clamp to avoid big jumps
      last = now;

      // Background
      ctx.clearRect(0, 0, w, h);
      // Subtle radial vignette
      const bg = ctx.createRadialGradient(w*0.5, h*0.4, Math.min(w, h)*0.05, w*0.5, h*0.5, Math.max(w, h)*0.7);
      bg.addColorStop(0, '#0b0f14');
      bg.addColorStop(1, '#06080d');
      ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);

      // Draw connections
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < edges.length; i++) {
        const { a, b, len } = edges[i];
        const n1 = nodes[a], n2 = nodes[b];
        const alpha = Math.max(0.06, 0.18 - (len / Math.max(w,h)) * 0.18);
        ctx.strokeStyle = `rgba(148,163,184,${alpha})`;
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const r = n.r + (Math.sin((now*0.002) + i)*0.2*dpr);
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r*3);
        g.addColorStop(0, 'rgba(14,165,233,0.9)');
        g.addColorStop(1, 'rgba(14,165,233,0.0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r*3, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = 'rgba(226,240,255,0.9)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI*2);
        ctx.fill();
      }

      // Update and draw pulses
      const nextPulses = [];
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        p.t += p.spd * dt * (p.dir);
        if (p.t < 0 || p.t > 1) {
          // recycle
          if (rand() < 0.85) spawnPulse();
          continue;
        }
        nextPulses.push(p);
        const { e } = p;
        const n1 = nodes[e.a], n2 = nodes[e.b];
        const x = n1.x + e.ux * (e.len * p.t);
        const y = n1.y + e.uy * (e.len * p.t);
        // Trail (shooting star tail with gradient fade)
        const tail = e.len * p.trail;
        const tx = x - e.ux * tail * p.dir;
        const ty = y - e.uy * tail * p.dir;
        
        // Create gradient along the trail for ethereal effect
        const trailGrad = ctx.createLinearGradient(tx, ty, x, y);
        trailGrad.addColorStop(0, 'rgba(0,0,0,0)'); // fade out at tail
        trailGrad.addColorStop(0.3, p.color.replace(/[\d.]+\)$/g, '0.3)')); // soft middle
        trailGrad.addColorStop(1, p.color); // bright at head
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = 2.5 * dpr;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Larger, more magical head glow (like a wishing star)
        const rg = ctx.createRadialGradient(x, y, 0, x, y, 12 * dpr);
        rg.addColorStop(0, p.color);
        rg.addColorStop(0.4, p.color.replace(/[\d.]+\)$/g, '0.5)'));
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(x, y, 12 * dpr, 0, Math.PI*2);
        ctx.fill();
      }
      pulses = nextPulses;
      // Keep a steady number of pulses (fewer for magical effect)
      const minPulses = Math.round(edges.length * 0.12);
      const maxPulses = Math.round(edges.length * 0.25);
      if (pulses.length < minPulses) {
        for (let i = pulses.length; i < minPulses; i++) spawnPulse();
      } else if (pulses.length > maxPulses) {
        pulses.length = maxPulses;
      }

      ctx.restore();
      requestAnimationFrame(step);
    }

    resize();
    requestAnimationFrame(step);
  }
})();
