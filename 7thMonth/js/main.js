import { CONFIG as C } from './config.js';
import { createWorld } from './world.js';
import { buildStage } from './stage.js';
import { createStory } from './scenes.js';

const $ = s => document.querySelector(s);
document.querySelectorAll('[data-t]').forEach(e => (e.textContent = C.title[e.dataset.t]));
const h1 = $('#h1'), go = $('#go'), hint = $('#hint'), title = $('#title');
let li = 0;   // each word is an unbreakable group of animated letters
C.title.main.split(' ').forEach((word, wi, all) => { const w = document.createElement('span'); w.className = 'w';
  [...word].forEach(ch => { const s = document.createElement('span'); s.textContent = ch; s.style.setProperty('--i', li++); w.append(s); });
  h1.append(w); if (wi < all.length - 1) h1.append(' '); });
h1.setAttribute('aria-label', C.title.main); go.textContent = C.title.button;

const ui = {
  reveal: () => title.classList.add('on'),
  ready: () => { go.hidden = false; },
  leave: () => { go.hidden = true; title.classList.replace('on', 'off'); },
  hint: t => { if (C.devHints) { hint.textContent = t; hint.hidden = false; } },
};

(async () => {
  let world;
  try { world = createWorld($('#world'), C); }
  catch (e) {   // no WebGL: show the title and a friendly note instead of a blank page
    document.documentElement.classList.add('no-webgl'); $('#loader').classList.add('done'); ui.reveal(); ui.ready();
    go.onclick = () => { ui.leave(); hint.hidden = false; hint.textContent = 'This device can’t show the 3D world yet.'; };
    return;
  }
  const stage = buildStage(world, C), story = createStory({ world, stage, ui, cfg: C });
  await world.ready(); world.start(); $('#loader').classList.add('done');
  story.intro();
  addEventListener('pointerdown', () => story.skip(), { once: true });
  addEventListener('keydown', e => { if (e.key === 'Escape') story.skip(); });
  go.onclick = () => story.go();
  addEventListener('pagehide', () => world.dispose());
})();
