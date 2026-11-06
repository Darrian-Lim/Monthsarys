import * as THREE from 'three';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';
import { rng, clamp } from './utils.js';

// ── helpers ────────────────────────────────────────────────
const cache = new Map();
export const mat = (c, o = {}) => { const k = c + JSON.stringify(o);
  if (!cache.has(k)) cache.set(k, new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.5, ...o })); return cache.get(k); };
export const gloss = c => mat(c, { roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 });
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };

let shadowTex;
export function blobShadow(w, d, x, z, opacity = 0.45) {
  if (!shadowTex) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(90,50,120,.7)'); r.addColorStop(1, 'rgba(90,50,120,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); shadowTex = new THREE.CanvasTexture(c); shadowTex.colorSpace = THREE.SRGBColorSpace; }
  const m = mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity }), x, 0.014, z);
  m.rotation.x = -Math.PI / 2; m.scale.set(w, d, 1); return m;
}

// ── floating island: grass top, clay layer, faceted rock underneath ──
export function createIsland({ r = 4, seed = 1, flowers = 30, keep = [] } = {}) {
  const R = rng(seed), ph = [R() * 6, R() * 6, R() * 6], g = new THREE.Group();
  const rad = a => r * (1 + 0.05 * Math.sin(2 * a + ph[0]) + 0.045 * Math.sin(3 * a + ph[1]) + 0.025 * Math.sin(5 * a + ph[2]));
  const warp = geo => { const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), k = rad(Math.atan2(z, x)) / r; p.setX(i, x * k); p.setZ(i, z * k); }
    geo.computeVertexNormals(); return geo; };

  const grass = warp(new THREE.CylinderGeometry(r, r * 0.97, 0.45, 64)), pa = grass.attributes.position, col = [];
  const lite = new THREE.Color('#b4efa0'), mid = new THREE.Color('#8fdc78'), dark = new THREE.Color('#78c467'), t = new THREE.Color();
  for (let i = 0; i < pa.count; i++) { const rr = Math.hypot(pa.getX(i), pa.getZ(i)) / r; t.copy(pa.getY(i) > 0 ? mid.clone().lerp(lite, 1 - rr) : dark); col.push(t.r, t.g, t.b); }
  grass.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.add(mesh(grass, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }), 0, -0.225, 0));
  g.add(mesh(warp(new THREE.CylinderGeometry(r * 0.96, r * 0.8, 0.5, 48)), mat('#d9a58a', { roughness: 0.9 }), 0, -0.7, 0));

  const d = r * 1.1, rock = new THREE.ConeGeometry(r * 0.8, d, 16, 5), rp = rock.attributes.position, rc = [];
  rock.rotateX(Math.PI);
  const top = new THREE.Color('#c9aaa5'), bot = new THREE.Color('#8f7fb5');
  for (let i = 0; i < rp.count; i++) { const x = rp.getX(i), y = rp.getY(i), z = rp.getZ(i), a = Math.atan2(z, x),
      n = Math.sin(a * 3 + ph[0]) * 0.5 + Math.sin(a * 7 + ph[1] + y * 1.3) * 0.3 + Math.sin(a * 11 + y * 2.1) * 0.2, k = 1 + 0.18 * n;
    rp.setX(i, x * k); rp.setZ(i, z * k); const c = top.clone().lerp(bot, clamp(0.5 - y / d)); rc.push(c.r, c.g, c.b); }
  rock.setAttribute('color', new THREE.Float32BufferAttribute(rc, 3));
  g.add(mesh(rock, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }), 0, -0.95 - d / 2, 0));

  // little flowers (one instanced mesh), kept clear of anything standing on the island
  const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshStandardMaterial({ roughness: 0.6 }), flowers);
  const m4 = new THREE.Matrix4(), pal = ['#ffffff', '#ffb3d9', '#c9b3ff', '#ffe08a']; let n = 0;
  for (let i = 0; i < 600 && n < flowers; i++) {
    const a = R() * 6.283, rr = Math.sqrt(R()) * 0.88 * rad(a), x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (keep.some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr)) continue;
    m4.compose(new THREE.Vector3(x, 0.07, z), new THREE.Quaternion(), new THREE.Vector3(1, 0.55, 1)); fl.setMatrixAt(n, m4); fl.setColorAt(n, new THREE.Color(pal[n % 4])); n++;
  }
  fl.count = n; g.add(fl);
  return { group: g, rad };
}

// ── the big glossy 7 (one extruded outline with rounded corners, normals smoothed so it looks inflated) ──
export function createSeven(color) {
  const P = [[-0.9, 2.6], [0.95, 2.6], [0.95, 2.35], [0.18, 0], [-0.4, 0], [0.27, 2.05], [-0.9, 2.05]].map(p => new THREE.Vector2(...p)), s = new THREE.Shape(), n = P.length;
  for (let i = 0; i < n; i++) { const p0 = P[(i + n - 1) % n], p1 = P[i], p2 = P[(i + 1) % n];
    const a = p0.clone().sub(p1).setLength(0.2).add(p1), b = p2.clone().sub(p1).setLength(0.2).add(p1);
    i ? s.lineTo(a.x, a.y) : s.moveTo(a.x, a.y); s.quadraticCurveTo(p1.x, p1.y, b.x, b.y); }
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.4, bevelThickness: 0.28, bevelSize: 0.16, bevelSegments: 8, curveSegments: 10 }); geo.center();
  const p = geo.attributes.position, nr = geo.attributes.normal, acc = new Map(), key = i => `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
  for (let i = 0; i < p.count; i++) { const k = key(i), a = acc.get(k) || new THREE.Vector3(); a.add(new THREE.Vector3(nr.getX(i), nr.getY(i), nr.getZ(i))); acc.set(k, a); }
  for (let i = 0; i < p.count; i++) { const v = acc.get(key(i)).clone().normalize(); nr.setXYZ(i, v.x, v.y, v.z); }
  geo.computeBoundingBox();
  const g = new THREE.Group(); g.add(mesh(geo, gloss(color))); g.userData.h = geo.boundingBox.max.y; return g;
}

// ── balloon + string ──
export function createBalloon(c) {
  const g = new THREE.Group(), b = mesh(new THREE.SphereGeometry(0.5, 32, 24), gloss(c)); b.scale.y = 1.18;
  g.add(b, mesh(new THREE.ConeGeometry(0.07, 0.12, 12), gloss(c), 0, -0.62, 0)); return g;
}
export const createString = () => mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 5), mat('#ffffff', { roughness: 0.8 }));
const UP = new THREE.Vector3(0, 1, 0), _d = new THREE.Vector3();
export function setString(m, a, b) { m.position.copy(a).add(b).multiplyScalar(0.5); _d.copy(b).sub(a); m.scale.y = _d.length(); m.quaternion.setFromUnitVectors(UP, _d.normalize()); }

// ── present: body, ribbon, bow, and a lid on a hinge (lid.rotation.x opens it in Scene 2) ──
export function createGift(s, c, rb = '#fff4c2') {
  const g = new THREE.Group(), h = s * 0.72, box = (w, hh, d, y, z = 0) => mesh(new THREE.BoxGeometry(w, hh, d), gloss(rb), 0, y, z);
  g.add(mesh(new RoundedBoxGeometry(s, h, s, 4, s * 0.07), gloss(c), 0, h / 2, 0), box(s * 0.2, h * 1.01, s * 1.01, h / 2), box(s * 1.01, h * 1.01, s * 0.2, h / 2));
  const lid = new THREE.Group(); lid.position.set(0, h, -s * 0.54); g.add(lid);
  lid.add(mesh(new RoundedBoxGeometry(s * 1.08, s * 0.24, s * 1.08, 4, s * 0.06), gloss(c), 0, s * 0.12, s * 0.54), box(s * 0.2, s * 0.25, s * 1.09, s * 0.125, s * 0.54), box(s * 1.09, s * 0.25, s * 0.2, s * 0.125, s * 0.54));
  for (const r of [0.6, -0.6]) { const l = mesh(new THREE.TorusGeometry(s * 0.15, s * 0.05, 10, 24), gloss(rb), r * s * 0.2, s * 0.34, s * 0.54); l.scale.set(1, 1.2, 0.7); l.rotation.z = r; lid.add(l); }
  lid.add(mesh(new THREE.SphereGeometry(s * 0.07, 12, 10), gloss(rb), 0, s * 0.3, s * 0.54));
  return { group: g, lid };
}

// ── Cloud Cat: glossy cream vinyl-toy cat. Faces +z. ──
export function createCat() {
  const root = new THREE.Group(), body = new THREE.Group(), fur = mat('#fff3e8', { roughness: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.35 });
  const pink = mat('#ffb0c8', { roughness: 0.7 }), ink = gloss('#2b1d3a'), S = (m, x, y, z) => (m.scale.set(x, y, z), m);
  root.add(body);
  body.add(S(mesh(new THREE.SphereGeometry(0.5, 32, 24), fur, 0, 0.5, 0), 1, 1.08, 0.92));
  const feet = [-1, 1].map(s => { const f = S(mesh(new THREE.SphereGeometry(0.2, 16, 12), fur, s * 0.22, 0.13, 0.14), 1, 0.7, 1.25); body.add(f); return f; });

  const head = new THREE.Group(); head.position.set(0, 0.98, 0.02); body.add(head);
  head.add(S(mesh(new THREE.SphereGeometry(0.66, 40, 28), fur, 0, 0.3, 0), 1.14, 0.92, 1.02));
  const profile = []; for (let i = 0; i <= 10; i++) profile.push(new THREE.Vector2(0.26 * (1 - i / 10) ** 0.85, (i / 10) * 0.42));
  const earG = new THREE.LatheGeometry(profile, 16), ears = [];
  for (const s of [-1, 1]) { const e = new THREE.Group(); e.position.set(s * 0.42, 0.78, 0); e.rotation.z = -s * 0.32;
    e.add(S(mesh(earG, fur), 1, 1, 0.6), S(mesh(earG, pink, 0, 0, 0.05), 0.62, 0.8, 0.5)); head.add(e); ears.push(e); }
  const eyes = new THREE.Group(); head.add(eyes);
  for (const s of [-1, 1]) { const e = new THREE.Group(); e.position.set(s * 0.27, 0.33, 0.6);
    e.add(S(mesh(new THREE.SphereGeometry(0.085, 20, 16), ink), 1, 1.3, 0.55), mesh(new THREE.SphereGeometry(0.028, 8, 8), new THREE.MeshBasicMaterial({ color: '#fff' }), 0.025, 0.045, 0.05)); eyes.add(e);
    head.add(S(mesh(new THREE.SphereGeometry(0.09, 16, 12), pink, s * 0.46, 0.18, 0.5), 1, 0.7, 0.4));
    const m = mesh(new THREE.TorusGeometry(0.05, 0.011, 8, 16, Math.PI), ink, s * 0.05, 0.15, 0.655); m.rotation.z = Math.PI; head.add(m); }
  head.add(S(mesh(new THREE.SphereGeometry(0.045, 12, 10), mat('#ff8fb0'), 0, 0.2, 0.66), 1.3, 0.9, 0.8));
  const collar = mesh(new THREE.TorusGeometry(0.4, 0.045, 10, 32), gloss('#ff86b8'), 0, -0.02, 0); collar.rotation.x = Math.PI / 2; head.add(collar);
  head.add(mesh(new THREE.SphereGeometry(0.07, 14, 12), mat('#ffd36e', { metalness: 0.6, roughness: 0.25 }), 0, -0.06, 0.42));

  const arm = s => { const a = new THREE.Group(); a.position.set(s * 0.44, 0.82, 0.08); a.rotation.z = s * 0.15;
    a.add(mesh(new THREE.CapsuleGeometry(0.1, 0.3, 6, 12), fur, 0, -0.2, 0)); const tip = new THREE.Object3D(); tip.position.set(0, -0.42, 0); a.add(tip); a.userData.tip = tip; body.add(a); return a; };
  const armHold = arm(1), armWave = arm(-1);   // hold = the arm with the balloon (viewer's right)
  armHold.rotation.z = 2.2;
  const tail = new THREE.Group(); tail.position.set(0, 0.28, -0.42); body.add(tail);
  tail.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0, 0, 0], [0, 0.08, -0.18], [0.04, 0.3, -0.3], [0, 0.55, -0.28]].map(p => new THREE.Vector3(...p))), 24, 0.075, 12), fur), mesh(new THREE.SphereGeometry(0.075, 12, 10), fur, 0, 0.55, -0.28));

  // animation state
  let blinkAt = 2, blinkT = -1, waveT = -1, tugT = -1, yaw = 0, pitch = 0; const _v = new THREE.Vector3();
  const api = {
    group: root, hand: armHold.userData.tip, lift: 0,
    wave() { waveT = 0; }, tug() { if (tugT < 0) tugT = 0; },
    update(t, dt, lookAt, calm) {
      const k = calm ? 0 : 1;
      body.scale.set(1, 1 + Math.sin(t * 2.2) * 0.015 * k, 1);
      tail.rotation.y = Math.sin(t * 1.6) * 0.35 * k; tail.rotation.z = Math.sin(t * 1.1) * 0.1 * k;
      if (t > blinkAt && blinkT < 0) blinkT = 0;
      if (blinkT >= 0) { blinkT += dt; eyes.scale.y = Math.max(0.08, Math.abs(1 - Math.sin((blinkT / 0.18) * Math.PI)) ); if (blinkT > 0.18) { blinkT = -1; eyes.scale.y = 1; blinkAt = t + 2.5 + Math.random() * 3; if (Math.random() < 0.3) ears[1].rotation.z += 0.0; } }
      root.worldToLocal(_v.copy(lookAt)); _v.sub(head.position);
      yaw += (Math.max(-0.6, Math.min(0.6, Math.atan2(_v.x, _v.z))) - yaw) * 0.06; pitch += (Math.max(-0.3, Math.min(0.35, -Math.atan2(_v.y - 0.3, Math.hypot(_v.x, _v.z)))) - pitch) * 0.06;
      head.rotation.set(pitch, yaw, Math.sin(t * 0.8) * 0.04 * k);
      if (waveT >= 0) { waveT += dt; armWave.rotation.z = -2.1 - Math.sin(waveT * 12) * 0.3; if (waveT > 1.8) { waveT = -1; armWave.rotation.z = -0.15; } }
      // clumsy moment: the balloon lifts the cat onto tiptoes, it dangles, then drops with a squash
      let lift = 0, sq = 0;
      if (tugT >= 0) { tugT += dt;
        if (tugT < 0.55) lift = 0.42 * (1 - (1 - tugT / 0.55) ** 3);
        else if (tugT < 1.25) { lift = 0.42 + Math.sin(tugT * 6) * 0.02; feet[0].rotation.x = Math.sin(tugT * 16) * 0.3; feet[1].rotation.x = -Math.sin(tugT * 16) * 0.3; }
        else if (tugT < 1.47) { lift = 0.42 * (1 - ((tugT - 1.25) / 0.22) ** 2); }
        else if (tugT < 2.1) { const u = (tugT - 1.47) / 0.63; sq = Math.sin(u * Math.PI * 3) * (1 - u) * 0.18; feet.forEach(f => (f.rotation.x = 0)); }
        else tugT = -1; }
      api.lift = lift; root.position.y = lift; body.scale.y *= 1 - sq; body.scale.x = 1 + sq * 0.6;
    },
  };
  return api;
}

// ── clouds: lots of soft puffs in ONE instanced mesh, tinted lavender at the bottom ──
export function createClouds(seed, list) {
  const R = rng(seed), puffs = [];
  list.forEach(([x, y, z, s]) => { for (let i = 0; i < 7; i++) puffs.push([x + (R() - 0.5) * 4.4 * s, y + (R() - 0.5) * 0.9 * s, z + (R() - 0.5) * 2.4 * s, (0.9 + R() * 0.9) * s, y]); });
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshStandardMaterial({ roughness: 1 }), puffs.length), m = new THREE.Matrix4(), c = new THREE.Color(), tint = new THREE.Color('#e3c6f5');
  puffs.forEach(([x, y, z, r, y0], i) => { m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(r, r * 0.72, r)); im.setMatrixAt(i, m); im.setColorAt(i, c.set('#ffffff').lerp(tint, clamp((y0 - y) * 0.6 + 0.15))); });
  return im;
}

// ── a few slow motes of light: they give depth during the camera glide ──
export function createDust(n = 70) {
  const g = new THREE.BufferGeometry(), a = new Float32Array(n * 3), R = rng(9);
  for (let i = 0; i < n * 3; i += 3) { a[i] = (R() - 0.5) * 30; a[i + 1] = R() * 14 - 2; a[i + 2] = R() * 40 - 8; }
  g.setAttribute('position', new THREE.BufferAttribute(a, 3));
  const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32);
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.22, map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, opacity: 0.8 }));
  p.userData.a = a; return p;
}
