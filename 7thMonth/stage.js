import * as THREE from 'three';
import { createIsland, createSeven, createBalloon, createString, setString, createGift, createCat, createClouds, createDust, blobShadow } from './objects.js';

// The set: where everything lives. Island-local coordinates: y=0 is the grass surface.
export function buildStage(world, cfg) {
  const C = cfg.colors, keep = [[-0.9, -1.4, 1.8], [1.5, 1.2, 1.3], [3.1, -0.1, 1], [-2.2, 1.6, 0.9]];
  const main = createIsland({ r: 5.2, seed: 3, flowers: 70, keep }), g = main.group; world.add(g);

  const seven = createSeven(C.seven); seven.position.set(-0.9, seven.userData.h + 0.12, -1.4); seven.rotation.y = 0.3;
  g.add(seven, blobShadow(3.6, 2.2, -0.9, -1.4));

  const big = createGift(1.5, C.gifts[0]); big.group.position.set(1.5, 0, 1.2); big.group.rotation.y = -0.3;   // Scene 2: the celebration machine
  const g2 = createGift(0.75, C.gifts[1]); g2.group.position.set(-2.2, 0, 1.6); g2.group.rotation.y = 0.5;
  g.add(big.group, g2.group, blobShadow(2.2, 2.2, 1.5, 1.2), blobShadow(1.1, 1.1, -2.2, 1.6));

  const cat = createCat(); cat.group.position.set(3.1, 0, -0.1); cat.group.rotation.y = 0.15; g.add(cat.group, blobShadow(1.5, 1.2, 3.1, -0.1));
  const heart = createBalloon(C.heart), heartStr = createString(); g.add(heart, heartStr);

  // three balloons tied to the corner of the 7
  const anchor = new THREE.Vector3(0, 3.0, -1.68), floats = [[-0.5, 1.9, 0.2], [0.55, 2.3, -0.1], [0.05, 2.7, 0.3]].map(([x, y, z], i) => {
    const b = createBalloon(C.balloons[i]), s = createString(); g.add(b, s); return { b, s, base: anchor.clone().add(new THREE.Vector3(x, y, z)), ph: i * 2.1 }; });

  // distant islands + clouds + dust for depth
  const far = [[3.2, 7, [-15, 2.5, -17]], [2.6, 11, [13, 5, -20]], [1.8, 5, [-8.5, 6, -7]], [2.2, 13, [11.5, -1, -8]], [3.6, 17, [-30, 8, -42]], [2.8, 19, [24, 10, -38]]]
    .map(([r, seed, p], i) => { const o = createIsland({ r, seed, flowers: 18 }); o.group.position.set(...p); world.add(o.group); return { g: o.group, y: p[1], ph: i * 1.3 }; });
  const layers = [[1, [[-40, -14, -30, 3], [-10, -16, -40, 3.5], [30, -13, -25, 3], [55, -12, -45, 3.5], [-60, -12, -50, 4], [10, -15, -10, 3], [-30, -14, 0, 3], [40, -14, 5, 3]], 0.3],
    [2, [[-18, -7, -10, 2], [16, -8, -14, 2], [0, -9, -22, 2.4], [-26, -4, -30, 2.4], [26, -3, -28, 2.4], [-6, -8, 6, 2], [0, -7.5, 0, 1.8]], 0.5],
    [3, [[-9, -6.5, 14, 1.6], [8, -7, 16, 1.8], [0, -8.5, 20, 2], [16, -6, 8, 1.4], [-16, -6, 8, 1.4]], 0.7]].map(([seed, list, amp]) => { const c = createClouds(seed, list); world.add(c); return { c, amp }; });
  const dust = createDust(); world.add(dust);

  const P = new THREE.Vector3(), Q = new THREE.Vector3(); let nextTug = 7;
  world.onUpdate((t, dt) => {
    const m = world.reduced ? 0 : 1;
    g.position.y = Math.sin(t * 0.6) * 0.1 * m; g.rotation.y = Math.sin(t * 0.25) * 0.02 * m; g.updateMatrixWorld();
    far.forEach(f => (f.g.position.y = f.y + Math.sin(t * 0.5 + f.ph) * 0.25 * m));
    layers.forEach((l, i) => (l.c.position.x = Math.sin(t * 0.04 * (i + 1) + i) * l.amp * 6 * m));
    floats.forEach(f => { f.b.position.copy(f.base); f.b.position.y += Math.sin(t * 0.9 + f.ph) * 0.12 * m; f.b.position.x += Math.sin(t * 0.6 + f.ph) * 0.1 * m;
      Q.copy(f.b.position); Q.y -= 0.6; setString(f.s, anchor, Q); });
    if (t > nextTug && !world.reduced) { cat.tug(); nextTug = t + 14 + Math.random() * 8; }
    cat.update(t, dt, world.camera.position, world.reduced);
    cat.hand.getWorldPosition(P); g.worldToLocal(P);
    heart.position.set(P.x + 0.1, P.y + 1.7 + Math.sin(t * 1.1) * 0.08 * m, P.z); heart.rotation.z = Math.sin(t * 0.8) * 0.06 * m;
    Q.copy(heart.position); Q.y -= 0.6; setString(heartStr, P, Q);
    const a = dust.userData.a; if (!world.reduced) { for (let i = 1; i < a.length; i += 3) { a[i] += dt * 0.15; if (a[i] > 12) a[i] = -2; } dust.geometry.attributes.position.needsUpdate = true; }
  });
  return { main, cat, big, seven };
}
