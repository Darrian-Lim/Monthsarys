import * as THREE from 'three';
import { createCat, gloss, mat, blobShadow } from './objects.js';
import { ease, clamp, wait } from './utils.js';
import { canvasTex, fitText, starShape, heartShape, extrude, backOut } from './awards.js';

// ──────────────────────────────────────────────────────────────────────────────
// WISH UPON A CLOUD: a small, peaceful island with floating wishing clouds.
// All wording comes from CONFIG.wishes (js/config.js). This file builds the 3D scene and runs the
// interaction, reusing the world's camera rig, panel, hint pill and Cloud Cat.
// ──────────────────────────────────────────────────────────────────────────────

const TAU = Math.PI * 2;
const FONT = 'ui-rounded,"Arial Rounded MT Bold","Varela Round","Nunito",system-ui,sans-serif';
const CENTER = new THREE.Vector3(0, 1.55, 1.0);   // where a chosen cloud floats to
const PLAT_Z = 0.4;                                // the wishing platform sits at (0, 0, PLAT_Z)
const FINAL_POS = new THREE.Vector3(0, 2.9, PLAT_Z);
const HEART_POS = new THREE.Vector3(0, 3.35, 1.0);

// ── cloud body ─────────────────────────────────────────────────────────────────
const BLOBS = [[0, 0, 0, 0.42], [-0.42, -0.07, 0.02, 0.3], [0.42, -0.07, 0.02, 0.3], [-0.2, 0.24, 0, 0.3], [0.22, 0.27, 0.02, 0.26],
  [-0.72, -0.13, 0, 0.2], [0.72, -0.13, 0, 0.2], [0, -0.1, 0.25, 0.3]];
const blobGeo = new THREE.SphereGeometry(1, 28, 20);
const ink = () => gloss('#2b1d3a');

function makeCloud(color) {
  const g = new THREE.Group(), body = new THREE.Group(); body.scale.y = 0.86; g.add(body);
  const m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.5, clearcoat: 0.4, clearcoatRoughness: 0.3, emissive: new THREE.Color(color), emissiveIntensity: 0 });
  const blobs = BLOBS.map(([x, y, z, r]) => { const b = new THREE.Mesh(blobGeo, m); b.position.set(x, y, z); b.scale.setScalar(r); body.add(b); return { b, base: new THREE.Vector3(x, y, z) }; });
  // a sleepy little face on the front puff
  const face = new THREE.Group(); face.position.set(0, -0.04, 0); body.add(face);
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 10), ink()); e.position.set(s * 0.12, 0, 0.515); e.scale.set(1, 1.3, 0.5); face.add(e);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), mat('#ff8fb8', { roughness: 0.8 })); b.position.set(s * 0.21, -0.06, 0.465); b.scale.set(1, 0.65, 0.3); face.add(b);
  }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.009, 8, 14, Math.PI), ink()); smile.position.set(0, -0.06, 0.55); smile.rotation.z = Math.PI; face.add(smile);
  // soft light that shines out when the cloud opens
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#fff2c4', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.position.z = -0.25; g.add(glow);   // behind the puffs, so the light frames the face instead of washing it out
  return { group: g, body, blobs, face, mat: m, glow };
}

let _glow = null;
function glowTex() {
  return (_glow ||= canvasTex(64, 64, (g, w, h) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }));
}

// ── the little symbols that float on each cloud ───────────────────────────────
const star = (R, color, emissive = 0) => { const m = extrude(starShape(R, R * 0.46), new THREE.MeshStandardMaterial({ color, roughness: 0.3, emissive: new THREE.Color(color), emissiveIntensity: emissive }), R * 0.5); return m; };
const miniHeart = (color) => { const m = extrude(heartShape(), new THREE.MeshStandardMaterial({ color, roughness: 0.3, emissive: new THREE.Color(color), emissiveIntensity: 0.7 }), 0.12); m.scale.setScalar(0.115); return m; };

function makeSymbol(kind) {
  const g = new THREE.Group(); let tick = () => {};
  if (kind === 'island') {                       // a tiny floating island with a winding path
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.19, 0.05, 24), gloss('#9be28d')); g.add(top);
    const rock = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.22, 16), gloss('#c9a7e8')); rock.rotation.x = Math.PI; rock.position.y = -0.135; g.add(rock);
    const pts = [[-0.16, 0.06], [-0.07, 0.11], [0.04, 0.03], [-0.02, -0.06], [0.09, -0.11], [0.16, -0.03]].map(([x, z]) => new THREE.Vector3(x, 0.032, z));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, 0.013, 6), gloss('#fff1dc')));
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), gloss('#ff9ccf')); bush.position.set(-0.11, 0.06, -0.08); g.add(bush);
    const flag = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 4), gloss('#ffd36e')); flag.position.set(0.14, 0.09, -0.02); g.add(flag);
    g.scale.setScalar(1.85); tick = t => { g.rotation.y = Math.sin(t * 0.5) * 0.4; };
  } else if (kind === 'bounceStars') {           // three little stars bouncing
    const ss = [-0.36, 0, 0.36].map((x, i) => { const s = star(0.1, '#ffd23f', 0.5); s.position.set(x, 0.05, i === 1 ? 0.12 : 0); g.add(s); return s; });
    tick = t => ss.forEach((s, i) => { s.position.y = 0.04 + Math.abs(Math.sin(t * 2.6 + i * 1.3)) * 0.15; s.rotation.z = Math.sin(t * 2 + i) * 0.3; });
  } else if (kind === 'hearts') {                // tiny glowing hearts around the cloud
    const hs = [0, 1, 2, 3, 4, 5].map(i => { const h = miniHeart(i % 2 ? '#ff86c0' : '#ff9ccf'); const a = (i / 6) * TAU; h.userData = { a, r: 0.62, y: 0.0 + (i % 3) * 0.12 }; h.position.set(Math.cos(a) * 0.62, h.userData.y, Math.sin(a) * 0.3 + 0.1); g.add(h); return h; });
    tick = t => hs.forEach((h, i) => { const a = h.userData.a + Math.sin(t * 0.4 + i) * 0.12; h.position.set(Math.cos(a) * 0.62, h.userData.y + Math.sin(t * 1.4 + i * 1.7) * 0.05, Math.sin(a) * 0.3 + 0.12); h.scale.setScalar(0.115 * (1 + Math.sin(t * 2 + i) * 0.1)); });
  } else if (kind === 'moonStars') {             // a miniature moon and a few stars
    const s = new THREE.Shape(); s.absarc(0, 0, 0.16, 0.9025, TAU - 0.9025, false); s.absarc(0.075, 0, 0.128, TAU - 1.38, 1.38, true);
    const moon = extrude(s, gloss('#fff0a8'), 0.06); moon.rotation.z = 0.35; g.add(moon);
    const ss = [[0.3, 0.05], [0.2, 0.22], [-0.3, 0.12]].map(([x, y], i) => { const st = star(0.06, i % 2 ? '#ffffff' : '#ffe27a', 0.6); st.position.set(x, y, 0.05); g.add(st); return st; });
    tick = t => { moon.rotation.z = 0.35 + Math.sin(t * 0.7) * 0.12; ss.forEach((st, i) => { st.scale.setScalar(1 + Math.sin(t * 2 + i * 2) * 0.18); }); };
  } else if (kind === 'sevenStars') {            // seven stars for seven months
    const ss = Array.from({ length: 7 }, (_, i) => { const a = Math.PI * (0.88 - (i / 6) * 0.76), s = star(0.072, '#ffcc33', 0.6); s.position.set(Math.cos(a) * 0.55, Math.sin(a) * 0.26 + 0.08, 0.04); s.userData.y = s.position.y; g.add(s); return s; });
    tick = t => ss.forEach((s, i) => { s.position.y = s.userData.y + Math.sin(t * 1.5 + i * 0.7) * 0.025; s.scale.setScalar(1 + Math.sin(t * 2 + i * 0.9) * 0.12); s.rotation.z = Math.sin(t + i) * 0.15; });
  }
  return { group: g, tick };
}

// ── the controller ─────────────────────────────────────────────────────────────
export function createWishes({ world, island, ui, cfg, nav }) {
  const W = cfg.wishes, L = W.labels, list = W.list, N = list.length;
  const S = () => (world.reduced ? 0.02 : 1);
  const root = new THREE.Group(); island.group.add(root);
  const canvas = world.canvas;

  // The glowing wishing platform in the middle of the island
  const plat = new THREE.Group(); plat.position.set(0, 0, PLAT_Z); root.add(plat);
  { const add = (geo, m, y) => { const o = new THREE.Mesh(geo, m); o.position.y = y; plat.add(o); return o; };
    add(new THREE.CylinderGeometry(0.85, 0.9, 0.12, 48), gloss('#fff1e4'), 0.06);
    const rim = add(new THREE.TorusGeometry(0.88, 0.04, 12, 64), gloss('#ff9ccf'), 0.12); rim.rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.6, 0.6, 0.02, 40), gloss('#dccbff'), 0.125);
    add(new THREE.CylinderGeometry(0.05, 0.08, 0.3, 14), gloss('#c9b3ff'), 0.27); }
  const glowPool = new THREE.Mesh(new THREE.CircleGeometry(0.55, 40), new THREE.MeshBasicMaterial({ map: glowTex(), color: '#ff9fd0', transparent: true, opacity: 0.8, depthWrite: false }));
  glowPool.rotation.x = -Math.PI / 2; glowPool.position.y = 0.14; plat.add(glowPool);
  const wishStar = star(0.13, '#ffd23f', 0.9); wishStar.position.y = 0.62; plat.add(wishStar);
  const starHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ffe6a0', transparent: true, opacity: 0.7, depthWrite: false })); starHalo.scale.setScalar(0.55); starHalo.position.y = 0.62; plat.add(starHalo);
  root.add(blobShadow(2.1, 2.1, 0, PLAT_Z, 0.28));

  // The wishing clouds, floating in a gentle arc behind the platform
  const homes = list.map((_, i) => { const t = N > 1 ? i / (N - 1) : 0.5; return new THREE.Vector3(-2.05 + 4.1 * t, 1.55 + (i % 2) * 0.6, -0.25 - 0.75 * Math.sin(Math.PI * t)); });
  const hits = [];
  const proxy = (id, r, parent) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), new THREE.MeshBasicMaterial({ visible: false })); m.userData.id = id; parent.add(m); hits.push(m); return m; };
  const C = list.map((w, i) => {
    const cl = makeCloud(w.color), sym = makeSymbol(w.symbol); sym.group.position.y = 0.78; sym.base = 1.35; cl.group.add(sym.group);
    cl.group.position.copy(homes[i]); cl.group.scale.setScalar(0.82); root.add(cl.group);
    return { i, ...cl, sym, home: homes[i], s0: 0.82, sp: 0.55 + (i * 0.37) % 0.4, ph: i * 1.9, want: 0, sw: 0, open: 0, seen: false, flash: 0, hit: proxy(i, 0.66, cl.group) };
  });
  // The special final cloud: larger, warm gold-pink, above the platform, hidden until all wishes are found
  const F = (() => {
    const cl = makeCloud(W.final.color); cl.group.position.copy(FINAL_POS); cl.group.scale.setScalar(0.0001); cl.group.visible = false; root.add(cl.group);
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, map: canvasTex(512, 128, (g, w, h) => {
      g.fillStyle = 'rgba(255,248,238,.92)'; g.beginPath(); g.roundRect(6, 14, w - 12, h - 28, 50); g.fill(); g.lineWidth = 6; g.strokeStyle = '#ffd36e'; g.stroke();
      g.fillStyle = '#b4458d'; fitText(g, W.final.cloudTitle, w - 70, 60); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(W.final.cloudTitle, w / 2, h / 2 + 3);
    }) }));
    label.scale.set(1.2, 0.3, 1); label.position.set(0, -0.66, 0.4); cl.group.add(label);
    // gentle glowing particles orbiting the cloud
    const n = 14, pa = new Float32Array(n * 3), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3));
    const orbit = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.14, map: glowTex(), color: '#ffcf70', transparent: true, depthWrite: false, opacity: 0.95 })); orbit.frustumCulled = false; cl.group.add(orbit);
    return { ...cl, label, orbit, pa, n, want: 0, open: 0, appear: 0, flash: 0, s0: 1.12, hit: proxy('final', 0.8, cl.group) };
  })();
  // the glowing heart-shaped light released by the final cloud
  const heart = extrude(heartShape(), new THREE.MeshStandardMaterial({ color: '#ff8cc6', roughness: 0.25, emissive: new THREE.Color('#ff5fa8'), emissiveIntensity: 1.1 }), 0.14);
  heart.scale.setScalar(0.0001); heart.position.copy(FINAL_POS); heart.visible = false; root.add(heart);
  const heartHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ff9ccf', transparent: true, opacity: 0, depthWrite: false })); heartHalo.visible = false; root.add(heartHalo);

  // Ambient stars + drifting motes + orbiting stars + a small burst pool (all low-count, all gentle)
  const starGeo = new THREE.ShapeGeometry(starShape(0.1, 0.045));
  const deco = [[-2.3, 2.9, -0.5], [2.3, 3.0, -0.3], [-1.45, 3.3, -0.9], [1.5, 3.35, -0.9], [-2.45, 1.2, 0.5], [2.45, 1.0, 0.4], [0.9, 3.7, -0.4], [-0.8, 0.9, 1.1]].map(([x, y, z], i) => {
    const m = new THREE.Mesh(starGeo, new THREE.MeshBasicMaterial({ color: ['#ffd36e', '#fff', '#ff9ccf'][i % 3], transparent: true, opacity: 0.9, depthWrite: false }));
    m.position.set(x, y, z); m.userData = { y, ph: i * 1.7, s: 0.7 + (i % 3) * 0.3 }; m.scale.setScalar(m.userData.s); root.add(m); return m;
  });
  const MN = 30, mp = new Float32Array(MN * 3), mc = new Float32Array(MN * 3), mph = [], tc = new THREE.Color();
  for (let i = 0; i < MN; i++) { mp[i * 3] = (Math.random() - 0.5) * 6.4; mp[i * 3 + 1] = 0.3 + Math.random() * 3.8; mp[i * 3 + 2] = (Math.random() - 0.5) * 3.4 - 0.1; mph.push(Math.random() * TAU); tc.set(['#ffcf3f', '#ff7fb8', '#ffffff', '#a98cff'][i % 4]).toArray(mc, i * 3); }
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3)); mg.setAttribute('color', new THREE.BufferAttribute(mc, 3));
  const motes = new THREE.Points(mg, new THREE.PointsMaterial({ size: 0.1, map: glowTex(), vertexColors: true, transparent: true, depthWrite: false, opacity: 0.9 })); motes.frustumCulled = false; root.add(motes);
  const mkStar = c => { const m = new THREE.Mesh(starGeo, new THREE.MeshBasicMaterial({ color: c, transparent: true, depthWrite: false })); m.visible = false; root.add(m); return m; };
  const orbitStars = Array.from({ length: 6 }, (_, i) => mkStar(['#ffd36e', '#ff86c0', '#fff', '#b79cff'][i % 4]));
  const pool = Array.from({ length: 12 }, (_, i) => { const m = mkStar(['#ffd36e', '#ff86c0', '#fff', '#b79cff'][i % 4]); m.userData = { life: 0, v: new THREE.Vector3() }; return m; });
  function burst(p, n = 8, power = 1) {
    let k = 0;
    for (const m of pool) {
      if (k >= n) break; if (m.userData.life > 0) continue;
      const a = (k / n) * TAU + Math.random() * 0.6, sp = (0.45 + Math.random() * 0.5) * power;
      m.position.copy(p); m.userData.v.set(Math.cos(a) * sp, 0.5 + Math.random() * 0.7, Math.sin(a) * sp * 0.5); m.userData.life = 1; m.visible = true; k++;
    }
  }

  // Cloud Cat, watching the wishes from a little cloud seat beside the platform
  const cat = createCat();
  const catWrap = new THREE.Group(), hopper = new THREE.Group(); catWrap.position.set(1.8, 0, 1.0); catWrap.scale.setScalar(0.46);
  hopper.add(cat.group); catWrap.add(blobShadow(1.8, 1.4, 0, 0, 0.35), hopper); root.add(catWrap);
  { const sm = mat('#ffffff', { roughness: 0.6, clearcoat: 0.3 }); [[0, 0.12, 0, 0.6], [-0.45, 0.08, 0.05, 0.4], [0.45, 0.08, 0.05, 0.4]].forEach(([x, y, z, r]) => { const b = new THREE.Mesh(blobGeo, sm); b.position.set(x, y - 0.12, z); b.scale.set(r, r * 0.45, r * 0.8); hopper.add(b); }); cat.group.position.y = 0.1; }
  let cheerT = -1, lookUntil = 0, lookIdx = 0, nextAntic = 0;

  // ── state ────────────────────────────────────────────────────────────────────
  let active = false, ready = false, sel = -1, mode = 'idle', tok = 0, muteHide = false;
  let finalShown = false, finalDone = false, heartT = -1;
  const seen = new Set();
  const frame = k => {
    const [ix, iy, iz] = island.pos, wide = innerWidth / innerHeight > 1;
    if (k === 'sel') return { pos: [ix + 0.15, iy + 2.4, iz + 6.2], look: [ix + (wide ? -0.65 : 0), iy + (wide ? 1.45 : 1.15), iz + 0.7] };
    if (k === 'final') return { pos: [ix, iy + 2.9, iz + 6.4], look: [ix + (wide ? -0.7 : 0), iy + (wide ? 2.05 : 1.65), iz + 0.3] };
    return { pos: [ix + 0.2, iy + 2.75, iz + 7.4], look: [ix + (wide ? -0.8 : 0), iy + (wide ? 1.55 : 1.2), iz + 0.2] };
  };
  const fill = (s, v) => s.replace('{n}', v).replace('{total}', N);
  function showHint() {
    if (!active) return;
    ui.hint(finalShown && !finalDone ? L.hintFinal : finalDone && seen.size >= N ? L.hintDone : seen.size ? `${W.hint} · ${fill(W.counter, seen.size)}` : W.hint);
  }
  const cheer = () => { cheerT = 0; };
  const worldPos = (obj, v = new THREE.Vector3()) => obj.getWorldPosition(v);

  async function enter() {
    active = true; ready = false; sel = -1; mode = 'welcome'; tok++; ui.hint(''); ui.onPanelHide = onHide;
    await world.rig.fly(frame('all'), 1.8 * S(), ease.inOut);
    if (!active) return;
    ready = true; ui.sound('pop'); wait(0.7 * S()).then(() => active && cheer());
    ui.showPanel({
      kicker: W.welcome.kicker, title: W.welcome.title, text: W.welcome.text,
      actions: [{ label: W.welcome.start, run: () => ui.hidePanel(), primary: true }, { label: L.back, run: nav.islands }]
    });
  }
  function exit() {
    if (!active) return;
    active = false; ready = false; sel = -1; mode = 'idle'; tok++; ui.onPanelHide = null; ui.hint(''); canvas.style.cursor = '';
    C.forEach(c => (c.want = 0)); F.want = 0;
  }
  // The panel was closed (×, Esc, or a button): the cloud drifts home and the island is explorable again.
  function onHide() {
    if (!active || !ready || muteHide) return;
    if (mode === 'wish' || mode === 'final') {
      tok++; if (sel === 'final') F.want = 0; else if (sel >= 0) C[sel].want = 0;
      sel = -1; mode = 'explore'; world.rig.fly(frame('all'), 1.1 * S(), ease.inOut);
    } else mode = 'explore';
    showHint();
  }

  function select(i) {
    if (!active || !ready) return;
    const my = ++tok;
    if (sel === 'final') F.want = 0; else if (sel >= 0 && sel !== i) C[sel].want = 0;
    sel = i; mode = 'wish'; C[i].want = 1; ui.hint('');
    muteHide = true; ui.hidePanel(); muteHide = false;
    ui.sound('pop'); worldPos(C[i].group, _p); burst(root.worldToLocal(_p), 6, 0.8);
    world.rig.fly(frame('sel'), 1.3 * S(), ease.inOut);
    wait(1.25 * S()).then(() => {   // the cloud has floated over and opened: reveal the wish
      if (my !== tok || !active || sel !== i) return;
      seen.add(i); C[i].seen = true; C[i].flash = 1; cat.wave(); ui.sound('chime');
      ui.showPanel({
        kicker: `${list[i].icon}  ${fill(W.counter, seen.size).toUpperCase()}`, title: list[i].title, text: list[i].text,
        actions: [{ label: L.close, run: () => ui.hidePanel(), primary: true }, { label: L.back, run: nav.islands }]
      });
      if (seen.size >= N && !finalShown) wait(2.4 * S()).then(() => active && revealFinal());
    });
  }
  function revealFinal() {
    if (finalShown) return;
    finalShown = true; F.group.visible = true; F.flash = 1; burst(FINAL_POS, 10, 1.1); ui.sound('chime'); ui.toast(L.finalAppears);
    cat.wave(); cheer(); lookUntil = performance.now() + 4000; lookIdx = -1;
  }
  function openFinal() {
    if (!active || !ready || !finalShown) return;
    const my = ++tok;
    if (sel >= 0 && sel !== 'final') C[sel].want = 0;
    sel = 'final'; mode = 'final'; F.want = 1; ui.hint('');
    muteHide = true; ui.hidePanel(); muteHide = false;
    world.rig.fly(frame('final'), 1.6 * S(), ease.inOut);
    wait(1.5 * S()).then(() => {   // the cloud opens and lets go of a heart-shaped light
      if (my !== tok || !active || sel !== 'final') return;
      heartT = 0; heart.visible = true; heartHalo.visible = true; F.flash = 1; burst(FINAL_POS, 12, 1.2); ui.sound('chime'); cheer(); cat.wave();
    });
    wait(3.3 * S()).then(() => {
      if (my !== tok || !active || sel !== 'final') return;
      finalDone = true;
      ui.showPanel({
        kicker: `${W.final.icon}  ${W.final.kicker}`, title: W.final.title, text: W.final.text,
        actions: [{ label: L.celebrate, run: nav.finale, primary: true }, { label: L.close, run: () => ui.hidePanel() }, { label: L.back, run: nav.islands }]
      });
    });
  }

  // Tapping / clicking the clouds
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), _p = new THREE.Vector3();
  const pick = e => {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, world.camera);
    return ray.intersectObjects(hits.filter(h => h.userData.id !== 'final' || finalShown), false)[0]?.object.userData.id;
  };
  canvas.addEventListener('click', e => {
    if (!active || !ready) return;
    const id = pick(e);
    if (id === 'final') openFinal(); else if (id !== undefined) select(id);
  });
  canvas.addEventListener('pointermove', e => {
    if (!active || !ready || e.pointerType === 'touch') return;
    canvas.style.cursor = pick(e) !== undefined ? 'pointer' : '';
  });

  // ── per-frame animation ──────────────────────────────────────────────────────
  const tmp = new THREE.Vector3(), look = new THREE.Vector3();
  const animateCloud = (c, t, dt, m, isFinal) => {
    const k = 1 - Math.exp(-dt * 2.2);
    c.sw = isFinal ? 0 : c.sw + (c.want - c.sw) * k;
    const e = ease.inOut(clamp(c.sw));
    c.open += ((isFinal ? c.want : clamp((c.sw - 0.45) / 0.55)) - c.open) * (1 - Math.exp(-dt * 2.4));
    const sp = isFinal ? 0.5 : c.sp, ph = isFinal ? 0 : c.ph, fa = 1 - 0.7 * e;
    const home = isFinal ? FINAL_POS : c.home;
    const fx = Math.sin(t * sp + ph) * 0.07 * m, fy = Math.sin(t * sp * 1.3 + ph * 1.7) * 0.13 * m;
    c.group.position.set(home.x + fx * fa, home.y + fy * fa, home.z);
    if (!isFinal) c.group.position.lerp(tmp.set(CENTER.x, CENTER.y + fy * 0.4, CENTER.z), e);   // drifts to the centre, still gently bobbing
    const grow = isFinal ? c.appear : 1, sc = c.s0 * (1 + 0.45 * e + (isFinal ? 0.12 * c.open : 0));
    c.group.scale.setScalar(Math.max(0.0001, sc * (isFinal ? backOut(clamp(grow)) : 1)));
    c.flash = Math.max(0, c.flash - dt * 0.7);
    c.mat.emissiveIntensity += (((isFinal ? 0.28 : c.seen ? 0.2 : 0.13) + 0.3 * e) - c.mat.emissiveIntensity) * 0.1;   // brighter when chosen; found wishes keep a soft glow
    const spread = 1 + 0.45 * c.open;
    c.blobs.forEach(b => { b.b.position.set(b.base.x * spread, b.base.y * spread + 0.04 * c.open, b.base.z); });
    c.glow.material.opacity = clamp(c.open * 0.7 + c.flash * 0.5); c.glow.scale.setScalar(1.6 + c.open * 1.3 + c.flash * 0.6);
    if (c.sym) { c.sym.tick(t); c.sym.group.position.y = 0.78 + 0.22 * c.open; c.sym.group.scale.setScalar(c.sym.base * (1 + 0.12 * c.open)); }
  };

  world.onUpdate((t, dt) => {
    const m = world.reduced ? 0 : 1, q = world.camera.quaternion;
    // burst stars, the wishing star, ambient stars
    pool.forEach(s => {
      const u = s.userData; if (u.life <= 0) return;
      u.life -= dt / 1.1; u.v.y -= 1.4 * dt; s.position.addScaledVector(u.v, dt); s.quaternion.copy(q);
      s.scale.setScalar(Math.max(0.001, Math.sin(Math.min(1, u.life) * Math.PI) * 1.2)); s.material.opacity = clamp(u.life * 1.6); if (u.life <= 0) s.visible = false;
    });
    wishStar.rotation.y = t * 0.8 * m; wishStar.position.y = 0.62 + Math.sin(t * 1.4) * 0.04 * m; starHalo.position.y = wishStar.position.y;
    starHalo.material.opacity = 0.55 + Math.sin(t * 1.6) * 0.12 * m; glowPool.material.opacity = 0.7 + Math.sin(t * 1.1) * 0.12 * m;
    deco.forEach(d => { d.position.y = d.userData.y + Math.sin(t * 0.9 + d.userData.ph) * 0.09 * m; d.quaternion.copy(q); d.scale.setScalar(d.userData.s * (1 + Math.sin(t * 1.3 + d.userData.ph) * 0.08 * m)); });
    // drifting motes
    if (m) { for (let i = 0; i < MN; i++) { mp[i * 3 + 1] += dt * 0.07; mp[i * 3] += Math.sin(t * 0.4 + mph[i]) * dt * 0.05; if (mp[i * 3 + 1] > 4.4) mp[i * 3 + 1] = 0.2; } mg.attributes.position.needsUpdate = true; }

    C.forEach(c => animateCloud(c, t, dt, m, false));
    // final cloud
    if (finalShown) {
      F.appear = clamp(F.appear + dt / 1.4);
      animateCloud(F, t, dt, m, true);
      F.label.material.opacity = clamp(F.appear * 1.4) * (1 - F.open);
      for (let i = 0; i < F.n; i++) { const a = t * 0.45 * (m || 0.001) + (i / F.n) * TAU, r = 0.95 + Math.sin(i * 2.3) * 0.18; F.pa[i * 3] = Math.cos(a) * r; F.pa[i * 3 + 1] = Math.sin(a * 1.7 + i) * 0.28 + 0.1; F.pa[i * 3 + 2] = Math.sin(a) * r * 0.45 + 0.1; }
      F.orbit.geometry.attributes.position.needsUpdate = true; F.orbit.material.opacity = clamp(F.appear);
    }
    // the heart-shaped light: appears inside the opened cloud, then rises and hovers with a soft pulse
    if (heartT >= 0) {
      heartT = Math.min(1, heartT + dt / 2.4);
      const k = ease.out(heartT), pulse = 1 + Math.sin(t * 2) * 0.05 * m;
      heart.position.set(HEART_POS.x * k + FINAL_POS.x * (1 - k), FINAL_POS.y + (HEART_POS.y - FINAL_POS.y) * k + Math.sin(t * 1.2) * 0.04 * m * k, FINAL_POS.z + (HEART_POS.z - FINAL_POS.z) * k);
      heart.scale.setScalar(Math.max(0.0001, 0.62 * backOut(clamp(heartT * 2)) * pulse)); heart.rotation.y = Math.sin(t * 0.7) * 0.35 * m;
      heartHalo.position.copy(heart.position); heartHalo.scale.setScalar(1.35 * clamp(heartT * 2) * pulse); heartHalo.material.opacity = 0.55 * clamp(heartT * 2);
    }
    // orbiting stars around the chosen cloud (they fade in/out with the selection)
    const cur = typeof sel === 'number' && sel >= 0 ? C[sel] : sel === 'final' ? F : null, ow = cur ? (sel === 'final' ? F.open : cur.sw) : 0;
    orbitStars.forEach((s, i) => {
      s.visible = ow > 0.15 && !!cur;
      if (!s.visible) return;
      const R = cur.group.scale.x * 0.95 + 0.12, a = t * 0.9 * (m || 0.2) + (i / orbitStars.length) * TAU;
      // a tilted ring: it passes above the cloud at the front, so the little stars never cover the face
      s.position.copy(cur.group.position).add(tmp.set(Math.cos(a) * R, 0.3 + Math.sin(a) * 0.5, Math.sin(a) * R * 0.35)); s.quaternion.copy(q);
      s.scale.setScalar(0.8 * ow * (1 + Math.sin(t * 2 + i) * 0.15 * m)); s.material.opacity = clamp(ow * 1.3);
    });

    // Cloud Cat: watches the selected cloud (or one that drifts by), hops when happy, points / looks up now and then
    let hop = 0;
    if (cheerT >= 0) { cheerT += dt; if (cheerT > 0.8) cheerT = -1; else hop = Math.abs(Math.sin((cheerT / 0.4) * Math.PI)) * 0.3 * (1 - cheerT / 0.8) * m; }
    hopper.position.y = hop;
    root.updateMatrixWorld(true);
    if (cur) worldPos(cur.group, look);
    else if (performance.now() < lookUntil) worldPos(lookIdx < 0 ? F.group : C[lookIdx % N].group, look);
    else look.copy(world.camera.position);
    cat.update(t, dt, look, !m);
    if (active && ready && m && !cur && t > nextAntic) {
      if (nextAntic > 0) { const r = Math.random(); lookIdx = Math.floor(Math.random() * N); if (r < 0.4) { lookUntil = performance.now() + 3000; } else if (r < 0.75) { lookUntil = performance.now() + 2200; cat.wave(); } else cat.tug(); }
      nextAntic = t + 9 + Math.random() * 6;
    }
  });

  return { enter, exit, get active() { return active; } };
}
