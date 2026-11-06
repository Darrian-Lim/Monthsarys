import * as THREE from 'three';
import { lerp, tween, stepTweens } from './utils.js';

const V = a => new THREE.Vector3(...a);

// The engine: renderer, sky, lighting, camera rig, render loop.
export function createWorld(canvas, cfg) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.toneMapping = THREE.NeutralToneMapping;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(40, 1, 0.3, 1000);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  scene.fog = new THREE.Fog('#e9c9f3', 45, 260);
  scene.add(new THREE.HemisphereLight('#d9e4ff', '#ffd4ec', 0.8));
  const key = new THREE.DirectionalLight('#fff1dc', 2.2); key.position.set(-8, 14, 10); scene.add(key);

  // Sky: one gradient shader. Colors are tweened via setSky() (used later for the sunset).
  const U = { top: new THREE.Color(), mid: new THREE.Color(), hor: new THREE.Color(), glow: new THREE.Color() }, str = { value: 1 };
  const uni = { uTop: { value: U.top }, uMid: { value: U.mid }, uHor: { value: U.hor }, uGlow: { value: U.glow }, uStr: str };
  const skyMesh = r => new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), new THREE.ShaderMaterial({
    uniforms: uni, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 d;void main(){d=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform vec3 uTop,uMid,uHor,uGlow;uniform float uStr;varying vec3 d;
      void main(){float h=d.y;vec3 c=mix(uHor,uMid,smoothstep(-.1,.32,h));c=mix(c,uTop,smoothstep(.25,.85,h));
      float g=max(dot(normalize(d),normalize(vec3(-.5,.25,-1.))),0.);c+=uGlow*(pow(g,6.)*.55+pow(g,40.)*.9)*uStr;
      gl_FragColor=vec4(c,1.);
      #include <colorspace_fragment>
      }` }));
  function setSky(a, b = a, k = 0) {
    const A = cfg.sky[a], B = cfg.sky[b], mix = (c, n) => c.set(A[n]).lerp(new THREE.Color(B[n]), k);
    ['top', 'mid', 'hor', 'glow'].forEach(n => mix(U[n], n)); str.value = lerp(A.str, B.str, k);
    scene.fog.color.set(A.fog).lerp(new THREE.Color(B.fog), k); key.color.set(A.key).lerp(new THREE.Color(B.key), k);
  }
  setSky('day');
  const dome = skyMesh(500); scene.add(dome);

  // Soft studio-style environment so glossy things get nice window reflections.
  const envScene = new THREE.Scene(); envScene.add(skyMesh(100));
  [[30, 18, [-25, 30, 20], 4, '#fff6ee'], [40, 10, [0, 45, -10], 2, '#ffffff'], [16, 30, [40, 5, 10], 1.5, '#ffd9f0']].forEach(([w, h, p, i, c]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
    m.position.set(...p); m.lookAt(0, 0, 0); envScene.add(m);
  });
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(envScene, 0.03).texture; pm.dispose();
  scene.environmentIntensity = 0.9;

  // Camera rig: we animate pos/look; the render loop applies them (plus a tiny idle drift).
  const rig = {
    pos: V([0, 5, 40]), look: V([0, 3, 0]),
    set(w) { rig.pos.copy(V(w.pos)); rig.look.copy(V(w.look)); },
    fly(w, s, e) { const p0 = rig.pos.clone(), l0 = rig.look.clone(), p1 = V(w.pos), l1 = V(w.look);
      return tween(s, k => { rig.pos.lerpVectors(p0, p1, k); rig.look.lerpVectors(l0, l1, k); }, e); },
    glide(pts, look, s, e) { const c = new THREE.CatmullRomCurve3(pts.map(V)), l0 = V(look[0]), l1 = V(look[1]);
      return tween(s, k => { c.getPoint(k, rig.pos); rig.look.lerpVectors(l0, l1, k); }, e); },
  };

  // Sizing. comp=1 shifts the scene to make room for the title (right on wide screens, down on tall ones).
  let W = 1, H = 1, comp = 1;
  const dpr = Math.min(devicePixelRatio, matchMedia('(pointer:coarse)').matches ? 1.75 : 2);
  const view = () => { const wide = W / H > 1.15;
    camera.setViewOffset(W, H, wide ? -W * 0.15 * comp : 0, wide ? 0 : -H * 0.1 * comp, W, H); camera.updateProjectionMatrix(); };
  const resize = () => { W = innerWidth; H = innerHeight; renderer.setPixelRatio(dpr); renderer.setSize(W, H, false); camera.aspect = W / H; view(); };
  addEventListener('resize', resize); resize();
  const setComp = (v, s) => { const c0 = comp; return tween(s, k => { comp = lerp(c0, v, k); view(); }); };
  const reach = () => Math.max(1, 1.7 / (W / H)) ** 0.62;   // pull back on tall/narrow screens

  // Render loop (pauses when the tab is hidden).
  const ups = []; let time = 0, last = 0, raf = 0, px = 0, py = 0, tx = 0, ty = 0; const tmp = new THREE.Vector3();
  addEventListener('pointermove', e => { tx = (e.clientX / W) * 2 - 1; ty = (e.clientY / H) * 2 - 1; });
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000 || 0.016));  // rAF's timestamp can precede performance.now() on the first frame last = now; time += dt;
    stepTweens(dt); ups.forEach(f => f(time, dt));
    px += (tx - px) * 0.05; py += (ty - py) * 0.05;
    const P = reduce.matches ? 0 : 1;
    tmp.copy(rig.pos).sub(rig.look).multiplyScalar(reach()).add(rig.look);
    camera.position.copy(tmp); camera.lookAt(rig.look);
    camera.translateX((px * 0.45 + Math.sin(time * 0.35) * 0.06) * P); camera.translateY((-py * 0.3 + Math.cos(time * 0.28) * 0.05) * P);
    dome.position.copy(camera.position);
    renderer.render(scene, camera);
  }
  const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : raf || start()));

  return {
    scene, camera, rig, setSky, setComp, start, stop,
    add: o => scene.add(o), onUpdate: f => ups.push(f),
    get time() { return time; }, get reduced() { return reduce.matches; },
    async ready() { try { await renderer.compileAsync(scene, camera); } catch (e) { /* first frame will compile */ } renderer.render(scene, camera); },
    dispose() { stop(); scene.traverse(o => { o.geometry?.dispose(); [].concat(o.material || []).forEach(m => m.dispose()); }); renderer.dispose(); },
  };
}
