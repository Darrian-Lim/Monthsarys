import { ease, wait } from './utils.js';

// The story: which things happen, in what order. Scene 1 = intro glide → "Let's go!" → arrive at the island.
// Scenes 2–4 (celebration machine, three islands, finale) will be added here as new functions.
export function createStory({ world, stage, ui, cfg }) {
  const T = cfg.timing, running = [], track = p => (running.push(p), p);
  const slow = world.reduced ? 0.01 : 1;

  async function intro() {
    world.rig.set(cfg.cam.start);
    const glide = track(world.rig.glide(cfg.cam.glidePath, [cfg.cam.start.look, cfg.cam.rest.look], T.glide * slow, ease.inOut));
    track(wait(T.titleAt * slow)).then(ui.reveal);
    await glide; ui.ready();
  }
  const skip = () => running.forEach(p => p.finish());   // tap or Esc during the intro jumps to the end

  async function go() {
    ui.leave(); world.setComp(0, 2.2 * slow);
    await world.rig.fly(cfg.cam.island, T.fly * slow, ease.inOut);
    stage.cat.wave(); ui.hint(cfg.devHint);
  }
  return { intro, go, skip };
}
