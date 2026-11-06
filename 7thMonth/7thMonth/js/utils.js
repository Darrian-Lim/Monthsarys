export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = { out: t => 1 - (1 - t) ** 3, inOut: t => (t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2), sine: t => -(Math.cos(Math.PI * t) - 1) / 2 };

// Small seeded random so the world looks the same every visit.
export function rng(s) {
  return () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Tweens are stepped by the world's render loop, so they pause with the tab.
// A tween is a Promise with .finish() to jump to its end state.
const live = new Set();
export function tween(sec, fn, e = ease.inOut) {
  let t = 0, done = false, res; const p = new Promise(r => (res = r));
  const it = { step(dt) { t += dt; const k = sec <= 0 ? 1 : Math.max(0, Math.min(1, t / sec)); fn(e(k), k); if (k >= 1) end(); } };
  function end() { if (done) return; done = true; live.delete(it); res(); }
  p.finish = () => { if (!done) { fn(e(1), 1); end(); } };
  live.add(it); return p;
}
export const wait = s => tween(s, () => {});
export const stepTweens = dt => [...live].forEach(i => i.step(dt));
