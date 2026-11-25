/* Particle layer: ambient dust, sparkles and hearts, bursts, and the finale heart. */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HP = new Path2D('M50 92C20 72 4 52 4 32 4 16 16 6 29 6c9 0 16 5 21 12 5-7 12-12 21-12 13 0 25 10 25 26 0 20-16 40-46 60z');

  const MODES = {
    opening: { colors: ['#fff3d6', '#ffd1e2', '#e6dcff'], kinds: { dot: 5, spark: 3, heart: 2 }, density: 1, glow: true, up: .25 },
    hall:    { colors: ['#fff1cf', '#f7dfa4', '#ffe1ea'], kinds: { dot: 8, spark: 2 }, density: .6, glow: true, up: .06 },
    g1:      { colors: ['#ffffff', '#ffd3e4', '#d9c8ff', '#f7dfa4'], kinds: { dot: 5, spark: 5, heart: 1 }, density: .85, glow: false, up: .1 },
    g2:      { colors: ['#ffffff', '#e6dcff', '#ffd9e8'], kinds: { dot: 6, spark: 3 }, density: .6, glow: false, up: .1 },
    g3:      { colors: ['#f7dfa4', '#ffcfe0', '#fff3d6'], kinds: { dot: 4, spark: 5, heart: 1 }, density: .8, glow: true, up: .15 },
    g4:      { colors: ['#fff6d8', '#f7d3df', '#e6efd8'], kinds: { dot: 9, spark: 1 }, density: .5, glow: false, up: .05 },
    g5:      { colors: ['#ffffff', '#ffe3b0', '#d9c8ff', '#ffc4d8'], kinds: { dot: 3, spark: 6 }, density: 1.1, glow: true, up: .02 },
    secret:  { colors: ['#ffb3c9', '#ffe3ee', '#d9c8ff'], kinds: { dot: 5, spark: 3, heart: 1 }, density: .8, glow: true, up: .2 },
    finaleQuiet: { colors: ['#e6dcff', '#ffd9e6', '#ffffff'], kinds: { dot: 1 }, density: .3, glow: true, up: .04 },
    finale:  { colors: ['#ffd9e6', '#f7dfa4', '#e6dcff', '#ffffff'], kinds: { dot: 4, spark: 3, heart: 2 }, density: .8, glow: true, up: .3 },
    off:     { colors: ['#fff'], kinds: { dot: 1 }, density: 0, glow: false, up: 0 }
  };

  let cv, ctx, W = 0, H = 0, dpr = 1, mode = MODES.off, modeName = 'off';
  const ambient = [], bursts = [], form = [], wisps = [];
  let fresh = true, formEl = null, formOn = false, formT0 = 0, last = 0, running = true;
  const sprites = {};

  function sprite(color) {
    if (sprites[color]) return sprites[color];
    const s = document.createElement('canvas'); s.width = s.height = 64;
    const g = s.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, color); r.addColorStop(.25, color + 'cc'); r.addColorStop(1, color + '00');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); return (sprites[color] = s);
  }
  const pick = a => a[(Math.random() * a.length) | 0];
  function pickKind(k) { const e = Object.entries(k); let t = e.reduce((s, [, w]) => s + w, 0) * Math.random();
    for (const [n, w] of e) { if ((t -= w) <= 0) return n; } return e[0][0]; }

  const heartAt = (t) => [16 * Math.pow(Math.sin(t), 3), -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))];
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function target() { return Math.round(Math.min(70, Math.max(14, W * H / 21000)) * mode.density * (reduce ? .35 : 1)); }

  function spawn(initial) {
    const kind = pickKind(mode.kinds);
    const p = { kind, color: pick(mode.colors), x: Math.random() * W, y: initial ? Math.random() * H : H + 20,
      vx: (Math.random() - .5) * .25, vy: -(mode.up + Math.random() * .35) * (reduce ? .4 : 1),
      size: kind === 'heart' ? 5 + Math.random() * 7 : kind === 'spark' ? 2 + Math.random() * 3 : 1.5 + Math.random() * 3,
      life: 0, max: 500 + Math.random() * 700, rot: (Math.random() - .5) * .6, vr: (Math.random() - .5) * .01, ph: Math.random() * 6.28 };
    if (mode.up < .06) { p.y = initial ? p.y : Math.random() * H; p.vy *= .3; }
    ambient.push(p);
  }

  function drawHeart(x, y, s, rot, color, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s / 50, s / 50); ctx.translate(-50, -50);
    ctx.fillStyle = color; ctx.fill(HP); ctx.restore();
  }
  function drawSpark(x, y, s, color, a) {
    ctx.globalAlpha = a; ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(x, y - s * 2); ctx.quadraticCurveTo(x, y, x + s * 2, y); ctx.quadraticCurveTo(x, y, x, y + s * 2);
    ctx.quadraticCurveTo(x, y, x - s * 2, y); ctx.quadraticCurveTo(x, y, x, y - s * 2); ctx.fill();
  }
  function drawP(p, a) {
    if (p.kind === 'heart') return drawHeart(p.x, p.y, p.size, p.rot, p.color, a * .85);
    if (p.kind === 'spark') return drawSpark(p.x, p.y, p.size, p.color, a);
    const s = p.size * (mode.glow ? 5 : 3.2); ctx.globalAlpha = a * (mode.glow ? .9 : .7);
    ctx.drawImage(sprite(p.color), p.x - s / 2, p.y - s / 2, s, s);
  }

  function tick(t) {
    requestAnimationFrame(tick);
    if (!running) return;
    const dt = Math.min(48, t - (last || t)) / 16.67; last = t;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = mode.glow ? 'lighter' : 'source-over';

    const want = target();
    let alive = 0; for (const p of ambient) if (!p.dying) alive++;
    if (fresh) { while (alive < want) { spawn(true); alive++; } fresh = false; }
    else if (alive < want && Math.random() < .5) spawn(false);
    for (let i = ambient.length - 1; i >= 0; i--) {
      const p = ambient[i]; p.life += dt; p.ph += .03 * dt;
      p.x += (p.vx + Math.sin(p.ph) * .15) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const fade = Math.min(1, p.life / 60, (p.max - p.life) / 80);
      const tw = p.kind === 'spark' ? .55 + .45 * Math.sin(p.ph * 2.2) : 1;
      if (p.life > p.max || p.y < -30) { ambient.splice(i, 1); continue; }
      drawP(p, Math.max(0, fade) * tw);
    }

    ctx.globalCompositeOperation = 'source-over';
    for (let i = bursts.length - 1; i >= 0; i--) {
      const p = bursts[i]; p.life += dt;
      p.vx *= .97; p.vy = p.vy * .97 + .045 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const a = 1 - p.life / p.max; if (a <= 0) { bursts.splice(i, 1); continue; }
      drawP(p, a);
    }

    if (form.length) {
      ctx.globalCompositeOperation = 'lighter';
      let cx = W / 2, cy = H / 2, sc = Math.min(W, H) * .018;
      if (formEl) { const r = formEl.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height * .52; sc = r.width / 36; }
      const age = (t - formT0) / 1000, beat = 1 + .035 * Math.sin(age * 4.2) + .02 * Math.sin(age * 8.4);
      for (const p of form) {
        const k = Math.min(1, Math.max(0, (age - p.delay) / 2.4)), e = formOn ? 1 - Math.pow(1 - k, 3) : 0;
        if (!formOn) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= .02 * dt; p.a *= .985; }
        else { const tx = cx + p.tx * sc * beat, ty = cy + p.ty * sc * beat; p.x = p.sx + (tx - p.sx) * e; p.y = p.sy + (ty - p.sy) * e; }
        const tw = .6 + .4 * Math.sin(age * 3 + p.ph);
        const s = p.size * (formOn ? 4.2 : 3); ctx.globalAlpha = Math.max(0, p.a * tw * (formOn ? Math.max(.15, e) : 1));
        ctx.drawImage(sprite(p.color), p.x - s / 2, p.y - s / 2, s, s);
      }
      // light trails that circle the outline (and drift outward a little) once the heart has formed
      if (formOn && wisps.length) {
        const show = Math.min(1, Math.max(0, (age - 3.2) / 2));
        for (const w of wisps) {
          w.t += w.v * dt;
          for (let k = 0; k < 7; k++) {
            const [hx, hy] = heartAt(w.t - k * .035 * Math.sign(w.v)), out = w.r + k * .012;
            const s = (w.size - k * .2) * 3.4; if (s <= 0) continue;
            ctx.globalAlpha = show * (1 - k / 7) * .8;
            ctx.drawImage(sprite(w.color), cx + hx * sc * beat * out - s / 2, cy + hy * sc * beat * out - s / 2, s, s);
          }
        }
      }
      if (!formOn && form.every(p => p.a < .02)) { form.length = 0; wisps.length = 0; }
    }
    ctx.globalAlpha = 1;
  }

  window.FX = {
    init(canvas) {
      cv = canvas; ctx = cv.getContext('2d'); resize();
      addEventListener('resize', resize);
      document.addEventListener('visibilitychange', () => { running = !document.hidden; last = 0; });
      requestAnimationFrame(tick);
    },
    mode(name) {
      if (name === modeName) return; modeName = name; mode = MODES[name] || MODES.off;
      // fade old ambient particles out by shortening their lives
      for (const p of ambient) { p.dying = true; p.max = Math.min(p.max, p.life + 80); }
      fresh = true;
    },
    burst(x, y, opts = {}) {
      const n = Math.round((opts.count || 18) * (reduce ? .4 : 1)), colors = opts.colors || ['#e88fae', '#f7dfa4', '#c7b6ea', '#ffd1e2'];
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, v = (opts.power || 3.2) * (.4 + Math.random() * .8);
        const kind = opts.kinds ? pick(opts.kinds) : (Math.random() < .55 ? 'heart' : 'spark');
        bursts.push({ kind, color: pick(colors), x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2.2, rot: (Math.random() - .5),
          vr: (Math.random() - .5) * .08, size: kind === 'heart' ? 6 + Math.random() * 7 : 2.5 + Math.random() * 2.5, life: 0, max: 50 + Math.random() * 40 });
      }
    },
    burstAt(el, opts) { const r = el.getBoundingClientRect(); this.burst(r.left + r.width / 2, r.top + r.height / 2, opts); },
    heart(el) {
      formEl = el; formOn = true; formT0 = performance.now(); form.length = 0; wisps.length = 0;
      const wn = Math.round((W < 600 ? 14 : 24) * (reduce ? .4 : 1));
      for (let i = 0; i < wn; i++) wisps.push({ t: Math.random() * 6.28, v: (Math.random() < .5 ? -1 : 1) * (.006 + Math.random() * .01), r: 1.02 + Math.random() * .16, size: 1.6 + Math.random() * 1.4, color: pick(['#ffd9e6', '#ffffff', '#e6dcff', '#ffc4d8']) });
      const n = Math.round((W < 600 ? 260 : 420) * (reduce ? .5 : 1)), colors = ['#ffd9e6', '#ffb3c9', '#f7dfa4', '#ffffff', '#e6dcff'];
      for (let i = 0; i < n; i++) {
        let tx, ty;
        const t = Math.random() * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3), hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        if (i < n * .62) { tx = hx; ty = hy; }               // outline
        else { const k = Math.sqrt(Math.random()) * .92; tx = hx * k; ty = hy * k; } // fill
        const edge = Math.random();
        const sx = edge < .5 ? Math.random() * W : (edge < .75 ? -20 : W + 20), sy = edge < .5 ? H + 30 : Math.random() * H;
        form.push({ tx, ty, sx, sy, x: sx, y: sy, vx: 0, vy: 0, size: 1.4 + Math.random() * 2.4, color: pick(colors),
          delay: Math.random() * 1.6, ph: Math.random() * 6.28, a: i < n * .62 ? 1 : .55 });
      }
    },
    release() {
      wisps.length = 0;
      if (!form.length) return; formOn = false;
      for (const p of form) { const a = Math.random() * Math.PI * 2; p.vx = Math.cos(a) * 2; p.vy = Math.sin(a) * 2 - 1; }
    },
    clearHeart() { form.length = 0; wisps.length = 0; formOn = false; }
  };
})();
