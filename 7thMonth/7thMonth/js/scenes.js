import { ease, wait, tween } from './utils.js';
import { createAwards } from './awards.js';
import { createWishes } from './wishes.js';

export function createStory({ world, stage, ui, cfg }) {
  const T = cfg.timing;
  const visited = new Set();
  let state = 'intro';
  let busy = false;
  let finale = false;
  const slow = world.reduced ? 0.02 : 1;

  const moveTo = (pos, look, seconds = 2) =>
    world.rig.fly({ pos, look }, seconds * slow, ease.inOut);
  const islandCamera = island => ({
    pos: [island.pos[0] + 3.4, island.pos[1] + 3.2, island.pos[2] + 8.2],
    look: [island.pos[0], island.pos[1] + 0.5, island.pos[2]]
  });
  const allowMenu = () => { ui.menuOn = true; };
  const hideForTransition = () => { ui.menuOn = false; ui.hidePanel(); awards.exit(); wishes.exit(); };
  // The Little Awards (replaces the old Inside Jokes island). Its text lives in cfg.awards.
  const awards = createAwards({ world, island: stage.islands.find(i => i.kind === 'awards'), ui, cfg,
    nav: { islands: () => showIslands(), finale: () => doFinale() } });
  // Wish Upon a Cloud (replaces the old Surprise island). Its text lives in cfg.wishes.
  const wishes = createWishes({ world, island: stage.islands.find(i => i.kind === 'wishes'), ui, cfg,
    nav: { islands: () => showIslands(), finale: () => doFinale() } });

  async function intro() {
    world.rig.set(cfg.cam.start);
    const glide = world.rig.glide(cfg.cam.glidePath,
      [cfg.cam.start.look, cfg.cam.rest.look], T.glide * slow, ease.inOut);
    wait(T.titleAt * slow).then(ui.reveal);
    await glide;
    ui.ready();
  }

  async function go() {
    if (state !== 'intro' || busy) return;
    busy = true;
    state = 'home';
    hideForTransition();
    ui.leave();
    try {
      await world.setComp(0, 1.2 * slow);
      await moveTo(cfg.cam.island.pos, cfg.cam.island.look, T.fly);
      stage.cat.wave();
      allowMenu();
      ui.showPanel({
        kicker: 'WELCOME TO CLOUD NINE',
        title: 'Your little world awaits ☁️',
        text: 'A giant celebration, three tiny islands, and one very enthusiastic cat. Where should we start?',
        actions: [
          { label: 'Open the big gift 🎁', run: openGift, primary: true },
          { label: 'Explore the islands ✨', run: showIslands }
        ]
      });
    } catch (error) {
      console.error('Could not enter Cloud Nine:', error);
      allowMenu();
      ui.toast('Almost there! Please try that again.');
    } finally { busy = false; }
  }

  async function openGift() {
    if (busy || state === 'gift') return;
    busy = true;
    state = 'gift';
    hideForTransition();
    stage.cat.wave();
    ui.confetti();
    ui.sound('pop');
    const lid = stage.big.lid;
    const gift = stage.big.group;
    const contents = stage.big.contents;
    lid.rotation.x = 0;
    gift.position.y = 0;
    gift.scale.setScalar(1);
    if (contents) { contents.scale.setScalar(0.001); contents.position.y = contents.userData.hiddenY ?? 0.68; }

    try {
      const duration = 1.05 * slow;
      await new Promise(resolve => {
        let elapsed = 0;
        const remove = world.onUpdate((_, dt) => {
          elapsed += dt;
          const k = Math.min(1, elapsed / duration);
          const eased = 1 - Math.pow(1 - k, 3);
          lid.rotation.x = -1.82 * eased;
          // Lift the heart independently of the gift body so it clears the rim.
          gift.position.y = Math.sin(k * Math.PI) * 0.16;
          gift.rotation.z = Math.sin(k * Math.PI * 2) * 0.012 * (1 - k);
          if (contents) {
            const pop = 1 - Math.pow(1 - k, 2.2);
            contents.scale.setScalar(Math.max(0.001, pop * 1.12));
            contents.position.y = (contents.userData.hiddenY ?? 0.68) + ((contents.userData.revealY ?? 1.48) - (contents.userData.hiddenY ?? 0.68)) * pop;
            contents.rotation.z = Math.sin(k * Math.PI * 2) * 0.08 * (1 - k);
          }
          if (k >= 1) {
            gift.position.y = 0;
            gift.rotation.z = 0;
            if (contents) { contents.position.y = contents.userData.revealY ?? 1.48; contents.scale.setScalar(1.12); contents.rotation.z = 0; }
            remove();
            resolve();
          }
        });
      });
      state = 'gift-done';
      allowMenu();
      ui.confetti();
      ui.sound('chime');
      ui.showPanel({
        kicker: 'GIFT OPENED!',
        title: 'Surprise! 🎉',
        text: 'Seven months deserves at least seven thousand balloons. We compromised.',
        actions: [
          { label: 'Explore the islands ✨', run: showIslands, primary: true },
          { label: 'More confetti please!', run: () => {
            ui.confetti(); ui.sound('pop');
            ui.toast('The confetti department says: absolutely.');
          } },
          { label: 'Final celebration 💗', run: doFinale }
        ]
      });
    } catch (error) {
      console.error('Gift animation failed:', error);
      state = 'home';
      allowMenu();
      ui.showPanel({ title: 'A little surprise 🎁', text: 'The gift is ready! Let’s keep exploring.', actions: [{ label: 'Explore the islands ✨', run: showIslands, primary: true }] });
    } finally { busy = false; }
  }

  function showIslands() {
    if (busy) return;
    state = 'islands';
    awards.exit();
    wishes.exit();
    ui.hidePanel();
    ui.showPanel({
      kicker: 'PICK AN ISLAND',
      title: 'Three little surprises',
      text: 'Choose wherever your curiosity takes you. You can come back here anytime.',
      actions: stage.islands.map(island => ({
        label: ({ memory: '🌷 Memories', awards: '🏆 The Little Awards', wishes: '☁️ Wish Upon a Cloud' })[island.kind] + (visited.has(island.id) ? ' ✓' : ''),
        run: () => visitIsland(island)
      })).concat([{ label: 'Back to the main island', run: home, primary: true }])
    });
  }

  // One memory at a time, with a "Next memory" button when there is more than one.
  function memoryPanel(i) {
    const list = cfg.personal.memories, m = list[i];
    ui.showPanel({
      kicker: m.date.toUpperCase(), title: cfg.personal.memoryTitle, text: m.text, image: m.photo || '', alt: m.alt, focus: m.focus,
      actions: [
        ...(list.length > 1 ? [{ label: `Next memory (${i + 1}/${list.length})`, run: () => memoryPanel((i + 1) % list.length) }] : []),
        { label: 'Explore another island', run: showIslands, primary: true },
        { label: 'Return to the main island', run: home }
      ]
    });
  }

  async function visitIsland(island) {
    if (busy) return;
    busy = true;
    state = 'visiting';
    hideForTransition();
    try {
      const camera = islandCamera(island);
      island.visited = true;
      visited.add(island.id);
      if (island.kind === 'awards') {
        state = 'island-open';
        allowMenu();
        await awards.enter();   // flies the camera in, then shows the welcome panel
        return;
      }
      if (island.kind === 'wishes') {
        state = 'island-open';
        allowMenu();
        await wishes.enter();   // flies the camera in, then shows the welcome panel
        return;
      }
      await moveTo(camera.pos, camera.look, 1.8);
      stage.cat.wave();
      ui.sound('pop');
      const key = 'memory';   // the Memories island is the only generic island left
      const personal = cfg.personal[`${key}Text`];
      const title = cfg.personal[`${key}Title`];
      const fallback = {
        memory: 'A little place for a real photo or memory from your seven months. Replace the sample text in js/config.js with a moment that means something to you both.'
      };
      state = 'island-open';
      allowMenu();
      if (key === 'memory' && cfg.personal.memories?.length) { memoryPanel(0); return; }
      ui.showPanel({
        kicker: 'CLOUD NINE DISCOVERY',
        title,
        text: personal && !personal.startsWith('[INSERT') ? personal : fallback[key],
        image: key === 'memory' ? cfg.personal.memoryPhoto : '',
        actions: [
          { label: 'Explore another island', run: showIslands, primary: true },
          { label: 'Return to the main island', run: home }
        ]
      });
    } catch (error) {
      console.error('Island transition failed:', error);
      allowMenu();
      ui.toast('Let’s try that island again.');
      showIslands();
    } finally { busy = false; }
  }

  async function home() {
    if (busy) return;
    busy = true;
    state = 'home';
    hideForTransition();
    try {
      await moveTo(cfg.cam.island.pos, cfg.cam.island.look, 1.6);
      allowMenu();
      ui.showPanel({
        kicker: 'CLOUD NINE',
        title: 'Where to next?',
        text: 'The cat has appointed itself Head of Celebrations. It has no qualifications.',
        actions: [
          { label: 'Open the big gift 🎁', run: openGift, primary: true },
          { label: 'Explore the islands ✨', run: showIslands },
          { label: 'Final celebration 💗', run: doFinale }
        ]
      });
    } catch (error) {
      console.error('Return to main island failed:', error);
      allowMenu(); ui.toast('Please try returning to the island again.');
    } finally { busy = false; }
  }

  async function doFinale() {
    if (busy) return;
    busy = true;
    finale = true;
    state = 'finale';
    hideForTransition();
    ui.leave();
    ui.confetti();
    ui.sound('chime');
    try {
      await Promise.all([
        tween(3.2 * slow, k => world.setSky('day', 'sunset', k), ease.inOut),
        moveTo(cfg.cam.finale.pos, cfg.cam.finale.look, 3.2)
      ]);
      state = 'finale-open';
      allowMenu();
      ui.showPanel({
        kicker: 'MONTH SEVEN · CLOUD NINE',
        title: 'Happy 7th Monthsary! 💗',
        text: cfg.personal.finalMessage && !cfg.personal.finalMessage.startsWith('[WRITE') ? cfg.personal.finalMessage : 'Seven months of little moments, silly jokes, and memories still to come. I’m so glad we get to celebrate this together. 💗',
        actions: [
          { label: 'One last little surprise ✨', run: () => {
            ui.confetti(); ui.sound('pop'); ui.toast('A whole sky full of love, just for you.');
          } },
          { label: 'Explore the islands again', run: showIslands, primary: true },
          { label: 'Back to the main island', run: home }
        ]
      });
    } catch (error) {
      console.error('Finale failed:', error);
      finale = false; allowMenu(); ui.toast('The celebration is still here. Try again!');
    } finally { busy = false; }
  }

  return { intro, go, openGift, showIslands, visitIsland, home, doFinale };
}
