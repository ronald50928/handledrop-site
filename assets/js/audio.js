// Minimal WebAudio: tick, whoosh, optional ambient pad. No autoplay; lazy-init on first interaction.
(function(){
  const state = {
    ctx: null,
    master: null,
    ambient: { on: false, g: null, oscA: null, oscB: null, lpf: null },
    muted: true,
    inited: false,
  };

  function loadMute() {
    try {
      const v = localStorage.getItem('hd_audio_muted');
      // Default to muted when no prior choice exists
      state.muted = (v === null) ? true : (v === '1');
    } catch {
      state.muted = true;
    }
  }
  function saveMute() {
    try { localStorage.setItem('hd_audio_muted', state.muted ? '1' : '0'); } catch {}
  }

  function ensureCtx() {
    if (state.inited) return;
    state.ctx = new (window.AudioContext || window.webkitAudioContext)();
    state.master = state.ctx.createGain();
    state.master.gain.value = state.muted ? 0 : 0.8;
    state.master.connect(state.ctx.destination);
    state.inited = true;
  }

  function resumeIfNeeded() {
    if (state.ctx && state.ctx.state === 'suspended') state.ctx.resume();
  }

  function makeEnv(dest, attack=0.005, decay=0.12, sustain=0.0) {
    const g = state.ctx.createGain();
    g.gain.value = 0;
    const t = state.ctx.currentTime;
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1, t + attack);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain), t + attack + decay);
    g.connect(dest);
    return g;
  }

  function playTick() {
    if (state.muted) return;
    ensureCtx(); resumeIfNeeded();
    const o = state.ctx.createOscillator();
    o.type = 'square'; o.frequency.value = 880;
    const g = makeEnv(state.master, 0.002, 0.08, 0.0001);
    o.connect(g); o.start(); o.stop(state.ctx.currentTime + 0.12);
  }

  function makeNoiseBuf() {
    const len = 0.5 * state.ctx.sampleRate;
    const buf = state.ctx.createBuffer(1, len, state.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random()*2 - 1) * 0.6;
    return buf;
  }

  function playWhoosh() {
    if (state.muted) return;
    ensureCtx(); resumeIfNeeded();
    const src = state.ctx.createBufferSource();
    src.buffer = makeNoiseBuf();
    const lpf = state.ctx.createBiquadFilter();
    lpf.type = 'lowpass'; lpf.frequency.value = 1200;
    const g = makeEnv(state.master, 0.01, 0.3, 0.0001);
    src.connect(lpf); lpf.connect(g);
    src.start(); src.stop(state.ctx.currentTime + 0.5);
  }

  function toggleAmbient() {
    ensureCtx(); resumeIfNeeded();
    if (!state.ambient.on) {
      const g = state.ctx.createGain(); g.gain.value = state.muted ? 0 : 0.12;
      const lpf = state.ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 800;
      const a = state.ctx.createOscillator(); a.type = 'sine'; a.frequency.value = 220;
      const b = state.ctx.createOscillator(); b.type = 'sine'; b.frequency.value = 329.63;
      a.connect(lpf); b.connect(lpf); lpf.connect(g); g.connect(state.master);
      a.start(); b.start();
      state.ambient = { on: true, g, lpf, oscA: a, oscB: b };
    } else {
      const t = state.ctx.currentTime;
      if (state.ambient.g) {
        state.ambient.g.gain.cancelScheduledValues(t);
        state.ambient.g.gain.setValueAtTime(state.ambient.g.gain.value, t);
        state.ambient.g.gain.linearRampToValueAtTime(0.0001, t + 0.4);
      }
      setTimeout(() => {
        try { state.ambient.oscA && state.ambient.oscA.stop(); } catch {}
        try { state.ambient.oscB && state.ambient.oscB.stop(); } catch {}
      }, 450);
      state.ambient.on = false;
    }
  }

  function setMuted(v) { state.muted = !!v; saveMute(); if (state.master) state.master.gain.value = state.muted ? 0 : 0.8; }

  // Lazy init on first user gesture
  loadMute();
  const first = () => { ensureCtx(); document.removeEventListener('pointerdown', first); document.removeEventListener('keydown', first); };
  document.addEventListener('pointerdown', first, { once: true });
  document.addEventListener('keydown', first, { once: true });

  window.HDAudio = { playTick, playWhoosh, toggleAmbient, setMuted, get muted(){ return state.muted; } };
})();
