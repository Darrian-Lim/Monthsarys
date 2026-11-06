import * as THREE from 'three';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';
import { createCat, gloss, mat, blobShadow } from './objects.js';
import { ease, clamp, wait } from './utils.js';

// ──────────────────────────────────────────────────────────────────────────────
// THE LITTLE AWARDS: a miniature award ceremony built on one of the floating islands.
// All wording comes from CONFIG.awards (js/config.js). This file only builds the 3D stage and
// runs the interaction, reusing the world's camera rig, panel UI, confetti and Cloud Cat.
// ──────────────────────────────────────────────────────────────────────────────

const TAU = Math.PI * 2;
const FONT = 'ui-rounded,"Arial Rounded MT Bold","Varela Round","Nunito",system-ui,sans-serif';
const backOut = t => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;

const PLAT = 0.14;                 // stage platform height above the grass
const PED_H = 0.42, PED_W = 0.56;  // regular podiums
const TOP = PLAT + PED_H + 0.05;   // y where a regular trophy stands
const HERO_H = 0.5, HERO_Z = 0.85; // the big podium for the final award
const HTOP = PLAT + HERO_H + 0.05;
const PEDESTALS = ['#ffc2e0', '#dccbff', '#fff1dc'];
const RIBBONS = ['#b79cff', '#ff9ccf', '#ffd36e'];
const TOPPERS = ['#ff86c0', '#b79cff', '#7ec8ff', '#ffd36e'];

// ── little helpers ─────────────────────────────────────────────────────────────
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function fitText(g, text, maxW, size, weight = 800) {
  do { g.font = `${weight} ${size}px ${FONT}`; size -= 4; } while (g.measureText(text).width > maxW && size > 16);
}
function starShape(R, r, n = 5) {
  const s = new THREE.Shape();
  for (let i = 0; i < n * 2; i++) { const a = Math.PI / 2 + (i * Math.PI) / n, d = i % 2 ? r : R, x = Math.cos(a) * d, y = Math.sin(a) * d; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  s.closePath(); return s;
}
function heartShape() {
  const s = new THREE.Shape(); s.moveTo(0, -0.22); s.bezierCurveTo(-0.58, 0.12, -0.48, 0.62, 0, 0.42); s.bezierCurveTo(0.48, 0.62, 0.58, 0.12, 0, -0.22); return s;
}
function crownShape() {
  const s = new THREE.Shape(); [[-.15, -.09], [.15, -.09], [.15, .1], [.075, .02], [0, .13], [-.075, .02], [-.15, .1]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s;
}
const extrude = (shape, m, d = 0.05) => {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 10 });
  geo.center(); return new THREE.Mesh(geo, m);
};

// The small shape that floats above each trophy.
function makeTopper(icon, color) {
  const g = new THREE.Group(), m = gloss(color);
  switch (icon) {
    case 'heart': { const h = extrude(heartShape(), m, 0.13); h.scale.setScalar(0.27); g.add(h); break; }
    case 'sparkle': g.add(extrude(starShape(0.18, 0.05, 4), m)); break;
    case 'crown': g.add(extrude(crownShape(), m, 0.06)); break;
    case 'flower': {
      for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU, p = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), m); p.position.set(Math.cos(a) * 0.085, Math.sin(a) * 0.085, 0); p.scale.z = 0.6; g.add(p); }
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), gloss('#fff3c2')); c.scale.z = 0.7; g.add(c); break;
    }
    default: g.add(extrude(starShape(0.16, 0.075), m));
  }
  return g;
}

// A miniature glossy gold trophy. Origin is the bottom of the plinth.
function makeTrophy(icon, topperColor, plinthColor) {
  const g = new THREE.Group();
  const gold = new THREE.MeshPhysicalMaterial({ color: '#ffe27a', metalness: 0.72, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.08,
    emissive: new THREE.Color('#ffb94a'), emissiveIntensity: 0.1, side: THREE.DoubleSide });
  const add = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); g.add(o); return o; };
  add(new THREE.CylinderGeometry(0.19, 0.22, 0.07, 32), gloss(plinthColor), 0, 0.035, 0);
  add(new THREE.CylinderGeometry(0.04, 0.065, 0.2, 16), gold, 0, 0.17, 0);
  add(new THREE.SphereGeometry(0.075, 20, 14), gold, 0, 0.3, 0).scale.y = 0.8;
  const profile = [[0.001, 0], [0.06, 0.015], [0.12, 0.07], [0.19, 0.17], [0.235, 0.3], [0.25, 0.4]].map(([x, y]) => new THREE.Vector2(x, y));
  add(new THREE.LatheGeometry(profile, 36), gold, 0, 0.3, 0);
  const rim = add(new THREE.TorusGeometry(0.25, 0.016, 10, 40), gold, 0, 0.7, 0); rim.rotation.x = Math.PI / 2;
  const arc = Math.PI * 1.15;
  const hr = add(new THREE.TorusGeometry(0.1, 0.022, 10, 24, arc), gold, 0.255, 0.52, 0); hr.rotation.z = -arc / 2;
  const hl = add(new THREE.TorusGeometry(0.1, 0.022, 10, 24, arc), gold, -0.255, 0.52, 0); hl.rotation.z = Math.PI - arc / 2;
  const topper = makeTopper(icon, topperColor); topper.position.y = 0.92; g.add(topper);
  return { group: g, gold, topper };
}

// ── the controller ─────────────────────────────────────────────────────────────
export function createAwards({ world, island, ui, cfg, nav }) {
  const A = cfg.awards, L = A.labels, list = A.list, N = list.length;
  const S = () => (world.reduced ? 0.02 : 1);
  const root = new THREE.Group(); island.group.add(root);

  // Stage platform with a pink rim
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.1, PLAT, 64), gloss('#fff1e4')); platform.position.y = PLAT / 2; root.add(platform);
  const rimRing = new THREE.Mesh(new THREE.TorusGeometry(2.07, 0.045, 12, 96), gloss('#ff9ccf')); rimRing.rotation.x = Math.PI / 2; rimRing.position.y = PLAT; root.add(rimRing);

  // Podium positions on a gentle arc at the back of the stage
  const span = (Math.min(76, (N - 1) * 13) * Math.PI) / 180;
  const P = list.map((_, i) => { const th = N > 1 ? -span + (2 * span * i) / (N - 1) : 0; return { x: 1.6 * Math.sin(th), z: -0.45 - 0.75 * Math.cos(th) }; });

  const hits = [];   // invisible, slightly generous tap targets (a trophy is small on a phone)
  const proxy = (id, x, z, r, h) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), new THREE.MeshBasicMaterial({ visible: false }));
    m.position.set(x, PLAT + h / 2, z); m.userData.id = id; root.add(m); hits.push(m); return m;
  };
  const numberTex = n => canvasTex(96, 96, (g, w, h) => {
    g.fillStyle = '#ffd36e'; g.beginPath(); g.arc(w / 2, h / 2, 44, 0, TAU); g.fill();
    g.lineWidth = 6; g.strokeStyle = '#fff6d8'; g.stroke();
    g.fillStyle = '#6a3b86'; fitText(g, String(n), 60, 64); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), w / 2, h / 2 + 3);
  });

  // Regular podiums + trophies
  const T = list.map((a, i) => {
    const { x, z } = P[i];
    const ped = new THREE.Group(); ped.position.set(x, PLAT, z); ped.rotation.y = Math.atan2(-x * 0.6, 6 - z); root.add(ped);
    const add = (geo, m, y) => { const o = new THREE.Mesh(geo, m); o.position.y = y; ped.add(o); return o; };
    add(new RoundedBoxGeometry(PED_W, PED_H, PED_W, 4, 0.08), gloss(PEDESTALS[i % 3]), PED_H / 2);
    add(new RoundedBoxGeometry(PED_W + 0.06, 0.05, PED_W + 0.06, 3, 0.02), gloss('#ffe08a'), PED_H + 0.025);
    add(new RoundedBoxGeometry(PED_W + 0.03, 0.07, PED_W + 0.03, 3, 0.02), gloss(RIBBONS[i % 3]), 0.09);
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: numberTex(i + 1), transparent: true }));
    plaque.position.set(0, 0.24, PED_W / 2 + 0.012); ped.add(plaque);
    root.add(blobShadow(0.95, 0.95, x, z, 0.3));
    const tr = makeTrophy(a.icon, TOPPERS[i % 4], i % 2 ? '#ff9ccf' : '#c9b3ff');
    tr.group.position.set(x, TOP, z); tr.group.scale.setScalar(0.0001); root.add(tr.group);
    proxy(i, x, z, 0.4, 1.5);
    return { i, ...tr, baseS: 0.62, delay: i * 0.09, lift: 0, want: 0, spin: 0, pop: -1 };
  });

  // The big podium for THE MOST IMPORTANT AWARD: sealed under a pink cloth until every award has been seen
  const hped = new THREE.Group(); hped.position.set(0, PLAT, HERO_Z); root.add(hped);
  { const add = (geo, m, y) => { const o = new THREE.Mesh(geo, m); o.position.y = y; hped.add(o); return o; };
    add(new RoundedBoxGeometry(1.0, HERO_H, 0.8, 4, 0.1), gloss('#ff9ccf'), HERO_H / 2);
    add(new RoundedBoxGeometry(1.08, 0.055, 0.88, 3, 0.02), gloss('#ffd36e'), HERO_H + 0.027);
    add(new RoundedBoxGeometry(1.03, 0.07, 0.83, 3, 0.02), gloss('#fff1dc'), 0.09);
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.2), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(310, 100, (g, w, h) => {
      g.fillStyle = '#fff6df'; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 26); g.fill(); g.lineWidth = 6; g.strokeStyle = '#ffd36e'; g.stroke();
      g.fillStyle = '#b4458d'; fitText(g, A.final.plaque, w - 50, 60); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(A.final.plaque, w / 2, h / 2 + 3);
    }) }));
    plaque.position.set(0, 0.27, 0.4 + 0.012); hped.add(plaque); }
  root.add(blobShadow(1.7, 1.4, 0, HERO_Z, 0.3));
  const hero = makeTrophy('heart', '#ff86c0', '#ff9ccf'); hero.group.position.set(0, HTOP, HERO_Z); hero.group.scale.setScalar(0.0001); root.add(hero.group);
  const cloth = new THREE.Group(); cloth.position.set(0, HTOP, HERO_Z); root.add(cloth);
  { const dome = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16, 0, TAU, 0, Math.PI / 2), mat('#ffb3d9', { roughness: 0.7, clearcoat: 0.3 })); dome.scale.y = 0.85; cloth.add(dome);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.03, 10, 48), gloss('#ffd36e')); band.rotation.x = Math.PI / 2; band.position.y = 0.012; cloth.add(band);
    for (const s of [-1, 1]) { const loop = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 10, 24), gloss('#fff1dc')); loop.position.set(s * 0.1, 0.45, 0); loop.scale.set(1, 1.25, 0.7); loop.rotation.z = s * 0.5; cloth.add(loop); }
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), gloss('#fff1dc')); knot.position.y = 0.43; cloth.add(knot);
    const q = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.26), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(96, 96, (g, w, h) => {
      g.fillStyle = '#ffd36e'; g.beginPath(); g.arc(w / 2, h / 2, 44, 0, TAU); g.fill(); g.fillStyle = '#6a3b86'; g.font = `800 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', w / 2, h / 2 + 4);
    }) })); q.position.set(0, 0.2, 0.47); cloth.add(q); }
  const heroHit = proxy('final', 0, HERO_Z, 0.55, 1.5);   // kept short while the podium is sealed; grows with the trophy

  // Banner on two gold poles, with a couple of streamers
  const banner = new THREE.Group(); banner.position.set(0, 2.3, -1.45); root.add(banner);
  for (const s of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 2.7, 10), mat('#ffd36e', { metalness: 0.7, roughness: 0.25 })); pole.position.set(s * 1.5, 1.35, -1.45); root.add(pole);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 10), gloss('#ff86c0')); ball.position.set(s * 1.5, 2.72, -1.45); root.add(ball);
    for (let k = 0; k < 2; k++) {
      const geo = new THREE.PlaneGeometry(0.09, 1.1, 1, 10), p = geo.attributes.position;
      for (let v = 0; v < p.count; v++) p.setZ(v, Math.sin(p.getY(v) * 4 + k) * 0.06);
      const st = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: k ? '#b79cff' : '#ff9ccf', side: THREE.DoubleSide, roughness: 0.5 }));
      st.geometry.translate(0, -0.55, 0); st.position.set(s * (1.5 + (k ? 0.1 : -0.1)), 2.62, -1.43); st.userData.ph = k + (s > 0 ? 2 : 0); root.add(st); (root.userData.streamers ||= []).push(st);
    }
  }
  const bannerTex = canvasTex(1024, 300, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, w, 0); grad.addColorStop(0, '#ff9ccf'); grad.addColorStop(0.5, '#cdb4ff'); grad.addColorStop(1, '#ff9ccf');
    g.fillStyle = grad; g.beginPath(); g.moveTo(14, 14); g.lineTo(w - 14, 14); g.lineTo(w - 14, h - 90);
    const n = 8, sw = (w - 28) / n; for (let i = 0; i < n; i++) { const x1 = w - 14 - i * sw; g.quadraticCurveTo(x1 - sw / 2, h + 30, x1 - sw, h - 90); }
    g.closePath(); g.fill(); g.lineWidth = 10; g.strokeStyle = '#fff6df'; g.stroke();
    const t = `★ ${A.banner} ★`; fitText(g, t, w - 150, 110); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 14; g.lineJoin = 'round'; g.strokeStyle = '#a24f9c'; g.strokeText(t, w / 2, 110); g.fillStyle = '#fff'; g.fillText(t, w / 2, 110);
  });
  const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.88), new THREE.MeshBasicMaterial({ map: bannerTex, transparent: true, side: THREE.DoubleSide }));
  bannerMesh.position.y = -0.1; banner.add(bannerMesh);

  // A few calm floating stars (billboards)
  const starGeo = new THREE.ShapeGeometry(starShape(0.1, 0.045));
  const deco = [[-2.0, 1.7, -0.6], [2.05, 1.5, -0.2], [-1.2, 3.0, -1.2], [1.4, 3.05, -1.0], [0, 3.35, -1.4], [-2.1, 2.5, 0.4], [2.1, 2.6, 0.6]].map(([x, y, z], i) => {
    const m = new THREE.Mesh(starGeo, new THREE.MeshBasicMaterial({ color: ['#ffd36e', '#fff', '#ff9ccf'][i % 3], transparent: true, opacity: 0.9, depthWrite: false }));
    m.position.set(x, y, z); m.userData = { y, ph: i * 1.7, s: 0.8 + (i % 3) * 0.3 }; m.scale.setScalar(m.userData.s); root.add(m); return m;
  });
  // Star burst pool, used briefly when an award is revealed (no constant particles)
  const pool = Array.from({ length: 16 }, (_, i) => {
    const m = new THREE.Mesh(starGeo, new THREE.MeshBasicMaterial({ color: ['#ffd36e', '#ff86c0', '#fff', '#b79cff'][i % 4], transparent: true, depthWrite: false }));
    m.visible = false; m.userData = { life: 0, v: new THREE.Vector3() }; root.add(m); return m;
  });
  function burst(x, y, z, n = 10, power = 1) {
    let k = 0;
    for (const m of pool) {
      if (k >= n) break; if (m.userData.life > 0) continue;
      const a = (k / n) * TAU + Math.random() * 0.5, sp = (0.6 + Math.random() * 0.7) * power;
      m.position.set(x, y, z); m.userData.v.set(Math.cos(a) * sp, 1.1 + Math.random() * 1.1, Math.sin(a) * sp * 0.5); m.userData.life = 1; m.visible = true; k++;
    }
  }

  // Spotlight: a soft beam + a light + a glow disc on the podium. Warm for awards, pink for the final one.
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color('#fff0d6') }, uOp: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    vertexShader: 'varying float vY;varying vec3 vN;varying vec3 vV;void main(){vY=uv.y;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader: `uniform vec3 uColor;uniform float uOp;varying float vY;varying vec3 vN;varying vec3 vV;
      void main(){float edge=smoothstep(0.,.65,abs(dot(normalize(vN),normalize(vV))));float a=uOp*(.2+.8*vY)*edge;gl_FragColor=vec4(uColor,a);
      #include <colorspace_fragment>
      }` });
  const beam = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 40, 1, true), beamMat); beam.visible = false; root.add(beam);
  const glowTex = canvasTex(64, 64, (g, w, h) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,.95)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: glowTex, color: '#fff0d6', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.rotation.x = -Math.PI / 2; glow.visible = false; root.add(glow);
  const light = new THREE.SpotLight('#fff0d6', 0, 0, 0.32, 1, 2); root.add(light, light.target);
  const warm = new THREE.Color('#fff0d6'), pink = new THREE.Color('#ff8fc8');
  const spot = { x: 0, z: P[0].z, y: TOP, r: 0.5, tx: 0, tz: P[0].z, ty: TOP, tr: 0.5, hero: 0, on: 0 };
  const APEX = 3.7;

  // Presenter: Cloud Cat holding a tiny trophy, who wanders to whichever podium is in the spotlight
  const cat = createCat();
  const catWrap = new THREE.Group(), hopper = new THREE.Group(); catWrap.add(blobShadow(1.5, 1.2, 0, 0, 0.4), hopper); hopper.add(cat.group); catWrap.scale.setScalar(0.0001); root.add(catWrap);
  { const mini = makeTrophy('star', '#ff86c0', '#c9b3ff').group; mini.scale.setScalar(0.34); mini.rotation.z = -2.2; cat.hand.add(mini); }
  const CAT_S = 0.42, home = { x: 1.35, z: 1.2 };   // smaller than the main-island cat so it never hides a trophy
  const catPos = { ...home }, catGo = { ...home };
  let cheerT = -1, spinT = -1, nextAntic = 0;

  // ── state ────────────────────────────────────────────────────────────────────
  let active = false, ready = false, sel = -1, mode = 'idle', enteredAt = -1, heroK = 0, heroWant = 0;
  const seen = new Set();
  const canvas = world.canvas;

  function standBeside(i) {
    // Front row, a little further out than the podium: from the camera's raised angle the cat's head stays
    // below the trophy (so it never hides it), and it keeps clear of the big podium's shadow in the middle.
    const { x, z } = P[i];
    catGo.x = Math.abs(x) >= 0.6 ? Math.max(-1.5, Math.min(1.5, x * 1.25)) : x < 0 ? -0.9 : 0.9;
    catGo.z = z + 1.0;
  }
  const cheer = () => { cheerT = 0; };
  const frame = ({ px = 0, pz = 0, zoom = 1, hero: h = false } = {}) => {
    const [ix, iy, iz] = island.pos, wide = innerWidth / innerHeight > 1;
    if (h) return { pos: [ix + 0.2, iy + 1.9, iz + 5.0], look: [ix + (wide ? -0.7 : 0), iy + (wide ? 0.85 : 0.55), iz + 0.2] };
    return { pos: [ix + 0.3 + px * 0.25, iy + 2.3, iz + 6.0 * zoom], look: [ix + (wide ? -0.8 : 0) + px * 0.45, iy + (wide ? 0.8 : 0.45), iz + pz * 0.3 - 0.1] };
  };

  async function enter() {
    active = true; ready = false; sel = -1; mode = 'welcome'; heroWant = 0;
    Object.assign(catGo, home); Object.assign(spot, { on: 0 });
    await world.rig.fly(frame({ zoom: 1.12 }), 1.8 * S(), ease.inOut);
    if (!active) return;
    ready = true;
    if (enteredAt < 0) { enteredAt = world.time; wait(0.9 * S()).then(() => active && cheer()); }
    ui.sound('pop');
    ui.showPanel({
      kicker: A.welcome.kicker, title: A.welcome.title, text: A.welcome.text,
      actions: [{ label: A.welcome.start, run: () => select(0), primary: true }, { label: L.back, run: nav.islands }]
    });
  }
  function exit() {
    if (!active) return;
    active = false; ready = false; sel = -1; mode = 'idle'; T.forEach(t => (t.want = 0)); canvas.style.cursor = '';
  }

  function select(i) {
    if (!active || !ready) return;
    sel = i; mode = 'award'; seen.add(i); heroWant = 0;
    T.forEach((t, j) => (t.want = j === i ? 1 : 0)); T[i].pop = 0;
    Object.assign(spot, { tx: P[i].x, tz: P[i].z, ty: TOP, tr: 0.5, hero: 0, on: 1 });
    burst(P[i].x, TOP + 0.85, P[i].z, 9);
    standBeside(i); cat.wave(); cheer(); ui.sound('pop');
    world.rig.fly(frame({ px: P[i].x, pz: P[i].z, zoom: 0.92 }), 1.0 * S(), ease.inOut);
    const last = i === N - 1, all = seen.size >= N;
    ui.showPanel({
      kicker: `AWARD ${i + 1} OF ${N}`, title: list[i].title, text: list[i].text,
      actions: [
        ...(i > 0 ? [{ label: L.prev, run: () => select(i - 1) }] : []),
        { label: last && all ? L.final : L.next, run: next, primary: true },
        { label: L.back, run: nav.islands }
      ]
    });
  }
  function next() {
    if (sel < N - 1) return select(sel + 1);
    const open = list.findIndex((_, j) => !seen.has(j));
    if (open < 0) return showFinal();
    ui.toast(L.unseen); select(open);
  }
  function showFinal() {
    if (!active || !ready) return;
    if (seen.size < N) { ui.toast(L.locked); return; }
    sel = -1; mode = 'final'; heroWant = 1; T.forEach(t => (t.want = 0));
    Object.assign(spot, { tx: 0, tz: HERO_Z, ty: HTOP, tr: 0.85, hero: 1, on: 1 });
    catGo.x = 1.25; catGo.z = HERO_Z + 0.15; cat.wave();
    world.rig.fly(frame({ hero: true }), 1.3 * S(), ease.inOut);
    wait(0.55 * S()).then(() => {
      if (!active || mode !== 'final') return;
      burst(0, HTOP + 1.2, HERO_Z, 16, 1.5); cheer(); ui.confetti(); ui.sound('chime');
    });
    ui.showPanel({
      kicker: A.final.kicker, title: A.final.title, text: A.final.text,
      actions: [
        { label: L.celebrate, run: nav.finale, primary: true },
        { label: L.replay, run: () => select(0) },
        { label: L.back, run: nav.islands }
      ]
    });
  }

  // Tapping / clicking the 3D trophies
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const pick = e => { ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, world.camera); return ray.intersectObjects(hits, false)[0]?.object.userData.id; };
  canvas.addEventListener('click', e => {
    if (!active || !ready) return;
    const id = pick(e);
    if (id === 'final') showFinal(); else if (id !== undefined) select(id);
  });
  canvas.addEventListener('pointermove', e => {
    if (!active || !ready || e.pointerType === 'touch') return;
    canvas.style.cursor = pick(e) !== undefined ? 'pointer' : '';
  });

  // ── per-frame animation ──────────────────────────────────────────────────────
  const tmpC = new THREE.Color();
  world.onUpdate((time, dt) => {
    const m = world.reduced ? 0 : 1, q = world.camera.quaternion;
    // decorations: gentle bobbing, always facing the camera
    deco.forEach(d => { d.position.y = d.userData.y + Math.sin(time * 0.9 + d.userData.ph) * 0.08 * m; d.quaternion.copy(q); d.scale.setScalar(d.userData.s * (1 + Math.sin(time * 1.3 + d.userData.ph) * 0.08 * m)); });
    root.userData.streamers.forEach(s => { s.rotation.z = Math.sin(time * 0.9 + s.userData.ph) * 0.1 * m; });
    banner.rotation.x = Math.sin(time * 0.8) * 0.02 * m;
    for (const s of pool) {
      const u = s.userData; if (u.life <= 0) continue;
      u.life -= dt / 0.95; u.v.y -= 2.2 * dt; s.position.addScaledVector(u.v, dt); s.quaternion.copy(q);
      s.scale.setScalar(Math.max(0.001, Math.sin(Math.min(1, u.life) * Math.PI) * 1.25)); s.material.opacity = clamp(u.life * 1.6); if (u.life <= 0) s.visible = false;
    }
    if (enteredAt < 0) return;   // nothing is revealed until Karis first arrives
    const age = time - enteredAt;

    // trophies: pop in, rise + spin + shine when selected
    T.forEach(t => {
      let s = t.baseS * backOut(clamp((age - t.delay) / 0.55));
      if (t.pop >= 0) { t.pop += dt; const u = t.pop / 0.55; if (u >= 1) t.pop = -1; else s *= 1 + Math.sin(u * Math.PI) * 0.16; }
      t.lift += (t.want - t.lift) * (1 - Math.exp(-dt * 6));
      t.group.scale.setScalar(Math.max(0.0001, s));
      t.group.position.y = TOP + t.lift * 0.22 + Math.sin(time * 1.4 + t.i) * 0.012 * m;
      if (t.want > 0 && m) t.spin += dt * 1.5; else { t.spin %= TAU; if (t.spin > Math.PI) t.spin -= TAU; t.spin *= Math.exp(-dt * 5); }
      t.group.rotation.y = t.spin;
      t.gold.emissiveIntensity += ((t.want > 0 ? 0.35 + 0.14 * Math.sin(time * 3.2) * m : 0.1) - t.gold.emissiveIntensity) * 0.15;
      t.topper.position.y = 0.92 + Math.sin(time * 1.8 + t.i) * 0.025 * m; t.topper.rotation.y = time * 0.8 * m;
    });

    // the final trophy: the cloth lifts away and the big trophy rises out
    heroK = clamp(heroK + Math.sign(heroWant - heroK) * Math.min(Math.abs(heroWant - heroK), dt * 1.8));
    const c = 1 - ease.inOut(clamp(heroK * 1.6)), h = clamp((heroK - 0.35) / 0.65);
    heroHit.scale.y = 0.55 + heroK * 0.55; heroHit.position.y = PLAT + 0.75 * heroHit.scale.y;
    cloth.visible = c > 0.01; cloth.scale.setScalar(Math.max(0.0001, c)); cloth.position.y = HTOP + heroK * 0.25;
    hero.group.visible = h > 0.001; hero.group.scale.setScalar(Math.max(0.0001, 1.2 * backOut(h))); hero.group.position.y = HTOP - (1 - h) * 0.2 + Math.sin(time * 1.3) * 0.015 * m * h;
    if (heroWant > 0 && m) hero.group.rotation.y += dt * 0.9; else { hero.group.rotation.y %= TAU; if (hero.group.rotation.y > Math.PI) hero.group.rotation.y -= TAU; hero.group.rotation.y *= Math.exp(-dt * 5); }
    hero.gold.emissiveIntensity += ((heroWant > 0 && h > 0.9 ? 0.38 + 0.14 * Math.sin(time * 3) * m : 0.1) - hero.gold.emissiveIntensity) * 0.15;
    hero.topper.position.y = 0.92 + Math.sin(time * 1.8) * 0.025 * m; hero.topper.rotation.y = time * 0.8 * m;

    // spotlight glides to wherever the selection is
    const f = 1 - Math.exp(-dt * 5);
    spot.x += (spot.tx - spot.x) * f; spot.z += (spot.tz - spot.z) * f; spot.y += (spot.ty - spot.y) * f; spot.r += (spot.tr - spot.r) * f;
    const wantOn = active && (sel >= 0 || mode === 'final') ? spot.on : 0, onK = (wantOn - (beamMat.uniforms.uOp.value / 0.2)) * Math.min(1, dt * 4);
    const on = clamp(beamMat.uniforms.uOp.value / 0.2 + onK);
    beamMat.uniforms.uOp.value = on * 0.2;
    tmpC.copy(warm).lerp(pink, spot.hero); beamMat.uniforms.uColor.value.copy(tmpC); glow.material.color.copy(tmpC); light.color.copy(tmpC);
    const H = APEX - spot.y; beam.visible = on > 0.01; beam.scale.set(spot.r, H, spot.r); beam.position.set(spot.x, spot.y + H / 2, spot.z);
    glow.visible = on > 0.01; glow.material.opacity = on * 0.8; glow.scale.setScalar(spot.r * 1.9); glow.position.set(spot.x, spot.y + 0.015, spot.z);
    light.intensity = on * 26; light.position.set(spot.x, APEX, spot.z + 0.9); light.target.position.set(spot.x, spot.y + 0.3, spot.z);

    // Cloud Cat: pops in, wanders to the podium, hops when happy, and occasionally does something silly
    const k = backOut(clamp((age - 0.7) / 0.6));
    catWrap.scale.setScalar(Math.max(0.0001, CAT_S * k));
    const dx = catGo.x - catPos.x, dz = catGo.z - catPos.z, fm = 1 - Math.exp(-dt * 3);
    catPos.x += dx * fm; catPos.z += dz * fm;
    let hop = Math.abs(Math.sin(time * 11)) * 0.09 * clamp(Math.hypot(dx, dz) * 1.4) * m;
    if (cheerT >= 0) { cheerT += dt; if (cheerT > 0.7) cheerT = -1; else hop += Math.abs(Math.sin((cheerT / 0.35) * Math.PI)) * 0.2 * (1 - cheerT / 0.7) * m; }
    if (spinT >= 0) { spinT += dt; hopper.rotation.y = ease.inOut(clamp(spinT / 0.9)) * TAU; if (spinT > 0.9) { spinT = -1; hopper.rotation.y = 0; } }
    catWrap.position.set(catPos.x, PLAT, catPos.z); hopper.position.y = hop;
    root.updateMatrixWorld(true);
    cat.update(time, dt, world.camera.position, !m);
    if (active && ready && m && time > nextAntic) {
      if (nextAntic > 0) { const r = Math.random(); if (r < 0.34) cat.wave(); else if (r < 0.67) cat.tug(); else if (spinT < 0) spinT = 0; }
      nextAntic = time + 9 + Math.random() * 6;
    }
  });

  return { enter, exit, select, showFinal, get active() { return active; } };
}

// shared with js/wishes.js
export { canvasTex, fitText, starShape, heartShape, extrude, backOut };
