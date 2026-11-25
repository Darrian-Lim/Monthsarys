/* ═══════════════════════════════════════════════════════════════
   THE MUSEUM OF US · app logic
   Personal content lives in js/content.js. You shouldn't need to edit this file.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const M = window.MUSEUM, ART = window.ART;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clean = s => String(s == null ? '' : s).replace(/\s*✎\s*/g, ' ').trim();
  /* Text → paragraphs. A paragraph starting with ✎ is an empty slot shown as a curator's note. */
  function paras(text) {
    return String(text || '').split(/\n\s*\n/).filter(p => p.trim()).map(p => {
      const t = p.trim();
      if (t.startsWith('✎')) return `<p class="ph">${esc(t.replace(/^✎\s*/, ''))}</p>`;
      return `<p>${esc(clean(t)).replace(/\n/g, '<br>')}</p>`;
    }).join('');
  }
  const get = (path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), M);

  /* ── galleries ─────────────────────────────────────────────── */
  const G = [
    { id: 'g1', no: '01', name: 'The Time Capsule', room: 'linear-gradient(180deg,#efe6fa,#f7d6e4)', key: 'pick', total: () => M.timeCapsule.keepsakes.length },
    { id: 'g2', no: '02', name: 'Our Little Memories', room: 'linear-gradient(180deg,#e8def7,#c9b4e4)', key: 'film', total: () => M.memories.items.length },
    { id: 'g3', no: '03', name: 'Things I Love About You', room: 'radial-gradient(ellipse at 50% 0,#8a4f86,#3b2148 70%)', key: 'pin', total: () => M.reasons.cards.length },
    { id: 'g4', no: '04', name: 'The Little Things', room: 'linear-gradient(180deg,#eef0e2,#d9dfc8)', key: 'key', total: () => M.littleThings.drawers.length },
    { id: 'g5', no: '05', name: 'Our Future Exhibition', room: 'radial-gradient(ellipse at 50% 100%,#4a3a85,#171331 75%)', key: 'star', total: () => M.future.stars.length }
  ];
  const gById = id => G.find(g => g.id === id);

  const KEEPSAKES = [
    { id: 'pick', name: 'A guitar pick', desc: 'From the very first jam. Collected by opening every keepsake in the Time Capsule.', hint: 'Waiting in Gallery 01.' },
    { id: 'film', name: 'A roll of film', desc: 'For turning over every polaroid in Gallery 02.', hint: 'Waiting in Gallery 02.' },
    { id: 'pin', name: 'A golden heart pin', desc: 'Awarded for discovering every card in Gallery 03, even the rarest one.', hint: 'Waiting in Gallery 03.' },
    { id: 'key', name: 'A little brass key', desc: 'Found hanging on the side of the cabinet in Gallery 04. It must open something…', hint: 'Hidden somewhere. Look very closely.' },
    { id: 'star', name: 'A paper star', desc: 'For connecting every star in Gallery 05.', hint: 'Waiting in Gallery 05.' },
    { id: 'secret', name: 'A secret heart', desc: 'Only for the one who found the room that isn’t on the map.', hint: '? ? ?' }
  ];

  /* ── state (kept in this browser so she can come back later) ── */
  const KEY = 'museum-of-us-8';
  const fresh = () => ({ visited: {}, found: { g1: [], g2: [], g3: [], g4: [], g5: [] }, keepsakes: {}, secret: false, finale: false, hints: 0 });
  let S = fresh();
  try { const raw = JSON.parse(localStorage.getItem(KEY)); if (raw && raw.found) S = Object.assign(fresh(), raw, { found: Object.assign(fresh().found, raw.found) }); } catch (e) {}
  G.forEach(g => { S.found[g.id] = (S.found[g.id] || []).filter(i => Number.isInteger(i) && i >= 0 && i < g.total()); });
  const returning = Object.keys(S.visited).length > 0;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const foundCount = id => S.found[id].length;
  const isComplete = id => foundCount(id) >= gById(id).total();
  const allVisited = () => G.every(g => S.visited[g.id]);

  function markFound(gid, idx) {
    if (S.found[gid].includes(idx)) return false;
    S.found[gid].push(idx); save(); updateProgress(); return true;
  }

  /* ── toast ── */
  let toastT;
  function toast(msg, ms = 3600) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms);
  }

  /* ── progress ── */
  function updateProgress() {
    const total = G.reduce((s, g) => s + g.total(), 0) + 2;
    const done = G.reduce((s, g) => s + Math.min(foundCount(g.id), g.total()), 0) + (S.secret ? 1 : 0) + (S.finale ? 1 : 0);
    const pct = Math.round(done / total * 100);
    $('#progressPct').textContent = pct + '%';
    $('#ring').style.strokeDashoffset = (100.5 * (1 - pct / 100)).toFixed(1);
    $('.hud-progress').setAttribute('aria-label', `${pct} percent of the museum explored`);
    const n = Object.keys(S.keepsakes).length; $('#pocketCount').textContent = n;
    updateHall();
  }

  /* ── keepsakes ── */
  function collect(id, fromEl) {
    if (S.keepsakes[id]) return;
    S.keepsakes[id] = Date.now(); save();
    const k = KEEPSAKES.find(x => x.id === id);
    if (fromEl) flyToPocket(fromEl, id);
    setTimeout(() => { const b = $('#pocketBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); updateProgress(); }, fromEl ? 900 : 0);
    AUDIO.sfx('unlock');
    toast(`Keepsake found: ${k.name} ♡ (it’s in your pocket, top right)`, 4200);
  }
  function flyToPocket(fromEl, id) {
    const a = fromEl.getBoundingClientRect(), b = $('#pocketBtn').getBoundingClientRect();
    const f = document.createElement('div'); f.innerHTML = ART.keepsake[id];
    Object.assign(f.style, { position: 'fixed', zIndex: 70, left: a.left + a.width / 2 - 24 + 'px', top: a.top + a.height / 2 - 24 + 'px', width: '48px', height: '48px', pointerEvents: 'none' });
    document.body.appendChild(f);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    f.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${dx * .5}px,${dy * .5 - 80}px) scale(1.5)`, opacity: 1, offset: .45 }, { transform: `translate(${dx}px,${dy}px) scale(.4)`, opacity: .2 }],
      { duration: 1000, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => f.remove();
  }

  /* ═════════════ SCENE TRAVEL ("camera") ═════════════ */
  const DARK = ['g3', 'g5', 'secret', 'finale'];
  let cur = 'opening', busy = false;

  function originOf(el) {
    if (!el) return [innerWidth / 2, innerHeight / 2];
    const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2];
  }
  function hallOriginFor(id) {
    if (id === 'secret') return $('#painting');
    if (id === 'finale') return $('#finaleDoor');
    return $(`.arch[data-g="${id}"] .arch-frame`);
  }

  async function travel(to, opts = {}) {
    if (busy || to === cur) { closeAllModals(); return; }
    if (to === 'finale' && !allVisited()) { toast(clean(M.hall.finaleLocked)); return; }
    busy = true; closeAllModals();
    const A = document.getElementById(cur), B = document.getElementById(to);
    const gi = id => G.findIndex(g => g.id === id);
    let type = 'into';
    if (to === 'hall') type = 'out';
    else if (gi(cur) > -1 && gi(to) > -1) type = 'pan';

    leaveScene(cur);
    B.classList.add('is-moving'); B.scrollTop = 0;
    AUDIO.sfx('whoosh');
    const dur = reduce ? 450 : 1150, E = 'cubic-bezier(.7,0,.3,1)';
    let a1, a2;
    if (reduce) {
      a1 = A.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, fill: 'forwards' });
      a2 = B.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, fill: 'both' });
    } else if (type === 'into') {
      const [x, y] = originOf(opts.origin); A.style.transformOrigin = `${x}px ${y}px`;
      a1 = A.animate([{ transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' }, { transform: 'scale(2.6)', opacity: 0, filter: 'blur(8px)' }], { duration: dur, easing: E, fill: 'forwards' });
      a2 = B.animate([{ transform: 'scale(.86)', opacity: 0, filter: 'blur(6px)' }, { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' }], { duration: dur - 150, delay: 420, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' });
      flashVeil(.55, dur + 300);
    } else if (type === 'out') {
      const o = hallOriginFor(cur); const [x, y] = originOf(o); B.style.transformOrigin = `${x}px ${y}px`;
      a1 = A.animate([{ transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' }, { transform: 'scale(.82)', opacity: 0, filter: 'blur(6px)' }], { duration: dur - 200, easing: E, fill: 'forwards' });
      a2 = B.animate([{ transform: 'scale(2.4)', opacity: 0, filter: 'blur(8px)' }, { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' }], { duration: dur, delay: 250, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' });
      flashVeil(.35, dur + 200);
    } else {
      const dir = gi(to) > gi(cur) ? 1 : -1;
      a1 = A.animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${-26 * dir}%)`, opacity: 0 }], { duration: dur - 150, easing: E, fill: 'forwards' });
      a2 = B.animate([{ transform: `translateX(${26 * dir}%)`, opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], { duration: dur, delay: 200, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' });
    }
    enterScene(to);
    await Promise.all([a1.finished, a2.finished]).catch(() => {});
    A.classList.remove('is-active'); A.style.transformOrigin = '';
    B.classList.add('is-active'); B.classList.remove('is-moving'); B.style.transformOrigin = '';
    a1.cancel(); a2.cancel();
    cur = to; busy = false;
    afterEnter(to);
  }
  function flashVeil(peak, dur) {
    if (reduce) return;
    $('#veil').animate([{ opacity: 0 }, { opacity: peak, offset: .45 }, { opacity: 0 }], { duration: dur, easing: 'ease-in-out' });
  }

  function leaveScene(id) {
    if (id === 'finale') { FX.release(); finaleTimers.forEach(clearTimeout); finaleTimers = []; setTimeout(() => { if (cur !== 'finale') resetFinale(); }, 1400); }
    if (id === 'g4') closeDrawers();
    if (id === 'g1') forceCloseKeep();
    if (id === 'hall') guideHush();
  }
  function enterScene(id) {
    document.body.classList.toggle('dark-hud', DARK.includes(id));
    FX.mode(id);
    $('#hud').hidden = id === 'opening';
    if (id === 'hall') updateHall();
    if (gById(id)) { S.visited[id] = true; save(); updateProgress(); updateFooter(id); }
    if (id === 'secret') enterSecret();
    if (id === 'finale') playFinale();
  }
  function afterEnter(id) {
    const s = document.getElementById(id), h = s.querySelector('h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    if (id === 'hall') setTimeout(() => { if (cur === 'hall' && !busy) guideSay(false); }, 1300);
    if (id === 'hall' && S.keepsakes.key && !S.secret) setTimeout(() => { const f = $('#painting .painting-frame'); if (f && cur === 'hall') FX.burstAt(f, { count: 12, power: 2, kinds: ['spark'], colors: ['#f7dfa4', '#fff'] }); }, 900);
  }

  /* ═════════════ OPENING ═════════════ */
  function buildOpening() {
    const sky = $('.sky-stars'); let html = '';
    for (let i = 0; i < 70; i++) html += `<i style="left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 100).toFixed(2)}%;--d:${(2.5 + Math.random() * 4).toFixed(1)}s;--dl:${(-Math.random() * 5).toFixed(1)}s;${Math.random() < .2 ? 'width:3px;height:3px;' : ''}"></i>`;
    sky.innerHTML = html;
    $('#finStars').innerHTML = html;
    const hearts = $('.entrance-hearts'), cols = ['#f3a9c4', '#ffd1e2', '#d9c8ff', '#f7dfa4']; html = '';
    for (let i = 0; i < 12; i++) html += `<i style="left:${(34 + Math.random() * 32).toFixed(1)}%;--s:${(1.2 + Math.random() * 1.8).toFixed(2)}cqw;--t:${(6 + Math.random() * 5).toFixed(1)}s;--dl:${(-Math.random() * 10).toFixed(1)}s;--x:${(Math.random() * 60 - 30).toFixed(0)}px;--c:${cols[i % 4]}"></i>`;
    hearts.innerHTML = html;
  }
  async function enterMuseum() {
    if (busy) return; busy = true;
    const op = $('#opening'), facade = $('#facade'), hall = $('#hall');
    $('#enterBtn').disabled = true;
    AUDIO.start(); AUDIO.sfx('unlock');
    op.classList.add('is-opening');
    FX.burstAt($('.doors'), { count: 26, power: 3.6 });
    await wait(reduce ? 200 : 1000);
    const veil = $('#veil');
    if (!reduce) {
      facade.animate([{ transform: 'scale(1)' }, { transform: 'scale(6.5)' }], { duration: 1700, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' });
      await veil.animate([{ opacity: 0 }, { opacity: 0, offset: .45 }, { opacity: 1 }], { duration: 1500, easing: 'ease-in', fill: 'forwards' }).finished;
    } else { await veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' }).finished; }
    op.classList.remove('is-active'); hall.classList.add('is-active'); cur = 'hall';
    enterScene('hall');
    veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduce ? 300 : 1300, easing: 'ease-out', fill: 'forwards' }).finished.then(a => { veil.getAnimations().forEach(x => x.cancel()); });
    $$('.arch', hall).forEach((a, i) => { a.style.animation = 'none'; void a.offsetWidth; a.style.animation = ''; a.style.setProperty('--dl', (0.5 + i * .12) + 's'); });
    busy = false; afterEnter('hall');
    setTimeout(() => { if (cur === 'hall' && !busy) toast(returning ? 'Welcome back. Everything you found is still here ♡' : 'Tip: the map (top right) lets you revisit any room.', 4200); }, 9000);
  }
  function replayOpening() {
    closeAllModals();
    const op = $('#opening'), facade = $('#facade');
    facade.getAnimations().forEach(a => a.cancel());
    op.classList.remove('is-opening'); $('#enterBtn').disabled = false;
    const A = document.getElementById(cur); leaveScene(cur);
    A.classList.remove('is-active'); op.classList.add('is-active'); cur = 'opening';
    enterScene('opening');
  }

  /* ═════════════ GRAND HALL ═════════════ */
  function buildHall() {
    $('#hallSvg').innerHTML = ART.hall;
    $('#chandelier').innerHTML = ART.chandelier;
    $('#guideBtn').innerHTML = ART.guide;
    const nav = $('#arches');
    nav.innerHTML = G.map((g, i) => {
      const o = i - 2;
      return `<button class="arch" type="button" data-g="${g.id}" style="--room:${g.room};--tf:rotateY(${-o * 11}deg) translateZ(${-Math.abs(o) * 34}px);--dl:${.15 + i * .1}s" aria-label="Gallery ${g.no}: ${esc(g.name)}">
        <span class="arch-frame"><span class="arch-key" aria-hidden="true"></span><span class="arch-in"><span class="arch-floor"></span><span class="arch-emblem">${ART.emblem[g.id]}</span><span class="arch-veil"></span></span><span class="arch-new" aria-hidden="true"></span></span>
        <span class="arch-plaque"><b>GALLERY ${g.no}</b><span>${esc(g.name)}</span><span class="arch-pips" aria-hidden="true"></span><span class="arch-state"></span></span></button>`;
    }).join('');
    nav.addEventListener('click', e => { const a = e.target.closest('.arch'); if (a) travel(a.dataset.g, { origin: a.querySelector('.arch-frame') }); });

    const since = new Date(M.since + 'T00:00:00'), days = Math.floor((Date.now() - since) / 864e5) + 1;
    if (days > 0) { const p = document.createElement('p'); p.className = 'hall-hint'; p.style.cssText = 'margin-top:.35rem;font-family:var(--f-hand);font-size:1.35rem;color:var(--rose-deep)'; p.textContent = `Today is day ${days.toLocaleString()} of us.`; $('.hall-head').appendChild(p); }

    $('#finaleDoor').addEventListener('click', () => {
      if (allVisited()) return travel('finale', { origin: $('#finaleDoor .glass-dome') });
      const left = G.filter(g => !S.visited[g.id]).map(g => `Gallery ${g.no}`);
      toast(`${clean(M.hall.finaleLocked)} Still to visit: ${left.join(', ')}.`, 4600);
      $('#finaleDoor').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 360 });
    });

    let clicks = 0;
    $('#painting').addEventListener('click', () => {
      if (S.keepsakes.key) return openSecretDoor();
      clicks++;
      const lines = ['“Untitled, 2026.” The little plaque reads: some rooms are kept behind closed doors.',
        'The painting sits slightly away from the wall, as if something is behind it.',
        'There’s a tiny keyhole hidden in the paint. Maybe something among the little things would fit.'];
      toast(lines[Math.min(clicks, 3) - 1], 4200); AUDIO.sfx('soft');
      $('#painting .painting-frame').animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(2deg)' }, { transform: 'rotate(0)' }], { duration: 500 });
    });
    $('#guideBtn').addEventListener('click', () => guideSay(true));
  }
  function updateHall() {
    $$('.arch').forEach(a => {
      const id = a.dataset.g, g = gById(id), f = Math.min(foundCount(id), g.total()), t = g.total(), done = isComplete(id), seen = !!S.visited[id];
      a.classList.toggle('visited', seen); a.classList.toggle('complete', done);
      a.querySelector('.arch-key').textContent = done ? '★' : '';
      a.querySelector('.arch-pips').innerHTML = seen ? (t <= 12 ? Array.from({ length: t }, (_, j) => `<i class="${j < f ? 'on' : ''}"></i>`).join('') : '') : '';
      a.querySelector('.arch-state').textContent = done ? 'completed' : seen ? `exploring · ${f} / ${t}` : 'not yet explored';
      a.setAttribute('aria-label', `Gallery ${g.no}: ${g.name}. ${done ? 'Completed' : seen ? `Exploring, ${f} of ${t} found` : 'Not yet explored'}`);
    });
    const open = allVisited(), ped = $('#finaleDoor');
    ped.classList.toggle('open', open);
    const n = G.filter(g => S.visited[g.id]).length;
    $('#finaleLabel').textContent = open ? clean(M.hall.finaleOpen) : `The Final Exhibition · ${n} of 5 galleries visited`;
    $('#painting').classList.toggle('has-key', !!S.keepsakes.key && !S.secret);
    $('#painting').classList.toggle('opened', !!S.secret);
    $('#painting .painting-tag').textContent = S.keepsakes.key ? (S.secret ? 'Untitled, 2026 · unlocked' : 'Untitled, 2026 · a keyhole?') : 'Untitled, 2026';
  }

  /* ── the little curator: one gentle, relevant hint at a time ── */
  let guideT, guideIdx = 0;
  function guideHints() {
    const gd = M.guide || {}, out = [];
    const unvisited = G.find(g => !S.visited[g.id]);
    if (!Object.keys(S.visited).length) out.push(gd.hello);
    if (S.keepsakes.key && !S.secret) out.push(gd.paintingHint);
    if (S.visited.g4 && !S.keepsakes.key) out.push(gd.keyHint);
    if (unvisited) out.push(String(gd.next || '').replace('{g}', `Gallery ${unvisited.no}, ${unvisited.name},`));
    if (allVisited() && !S.finale) out.push(gd.finale);
    if (!out.length || (allVisited() && S.finale && S.secret)) out.push(gd.done);
    return out.filter(Boolean).map(clean);
  }
  function guideSay(fromTap) {
    const box = $('#guide'), b = $('#guideBubble'), hints = guideHints();
    if (!hints.length) return;
    if (fromTap && box.classList.contains('talk')) guideIdx = (guideIdx + 1) % hints.length; else if (!fromTap) guideIdx = 0;
    b.innerHTML = `<b>${esc(clean((M.guide || {}).name || 'The Curator'))}</b>${esc(hints[guideIdx % hints.length])}`;
    box.classList.add('talk'); box.classList.remove('wiggle'); void box.offsetWidth; box.classList.add('wiggle');
    if (fromTap) AUDIO.sfx('soft');
    clearTimeout(guideT); guideT = setTimeout(() => box.classList.remove('talk'), 7000);
  }
  function guideHush() { clearTimeout(guideT); $('#guide').classList.remove('talk'); }

  /* ═════════════ THE SECRET DOORWAY ═════════════ */
  const KEY_SVG = '<svg viewBox="0 0 40 70"><circle cx="20" cy="16" r="10" fill="none" stroke="#e8c27a" stroke-width="5"/><path d="M14 16c0-3 6-3 6 0 0-3 6-3 6 0 0 3-6 6-6 6s-6-3-6-6z" fill="#ff9fbe"/><path d="M20 26v38M20 52h8M20 60h6" stroke="#e8c27a" stroke-width="5" stroke-linecap="round"/></svg>';
  async function openSecretDoor() {
    if (busy) return; busy = true; closeAllModals(); guideHush();
    const p = $('#painting'), dw = $('#doorway'), pf = $('.dw-painting .painting-frame'), key = $('.dw-key');
    key.innerHTML = KEY_SVG;
    AUDIO.sfx('unlock'); FX.burstAt(p, { count: 20, kinds: ['spark'], colors: ['#f7dfa4', '#ffd1e2', '#fff'] });
    // zoom into the painting
    if (!reduce) await p.animate([{ transform: 'rotate(-2deg) scale(1)' }, { transform: 'rotate(0) scale(1.25)' }], { duration: 450, easing: 'ease-out', fill: 'forwards' }).finished;
    dw.classList.remove('unlocking'); dw.hidden = false; FX.mode('off');
    const fadeIn = dw.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduce ? 200 : 700, fill: 'forwards' });
    await fadeIn.finished; p.getAnimations().forEach(a => a.cancel());
    // the painting swings away to reveal the little door
    pf.style.opacity = 1;
    if (!reduce) { AUDIO.sfx('whoosh'); await pf.animate([{ transform: 'rotateY(0)' }, { transform: 'rotateY(-100deg)', opacity: 0 }], { duration: 1100, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' }).finished; }
    pf.style.opacity = 0;
    // the key floats to the keyhole and turns
    const kh = $('.dw-keyhole').getBoundingClientRect(), fr = $('.dw-frame').getBoundingClientRect();
    key.style.left = (kh.left - fr.left + kh.width / 2 - 17) + 'px'; key.style.top = (kh.top - fr.top - 12) + 'px';
    if (!reduce) {
      await key.animate([{ opacity: 0, transform: 'translate(120px,-160px) rotate(-40deg) scale(1.4)' }, { opacity: 1, transform: 'translate(0,0) rotate(0) scale(.8)' }], { duration: 1100, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'forwards' }).finished;
      AUDIO.sfx('drawer');
      await key.animate([{ opacity: 1, transform: 'scale(.8) rotate(0)' }, { opacity: 1, transform: 'scale(.8) rotate(90deg)' }], { duration: 450, easing: 'ease-in-out', fill: 'forwards' }).finished;
      await wait(250);
    }
    // the doors open and the heart lights the way
    key.getAnimations().forEach(a => a.cancel()); key.style.opacity = 0;
    dw.classList.add('unlocking'); dw.scrollLeft = 0; dw.scrollTop = 0; AUDIO.sfx('unlock');
    setTimeout(() => FX.burstAt($('.dw-heart'), { count: 34, power: 4, colors: ['#ffd1e2', '#ff9fbe', '#fff'] }), reduce ? 0 : 700);
    await wait(reduce ? 300 : 1700);
    // walk through
    const fr2 = $('.dw-frame');
    if (!reduce) await fr2.animate([{ transform: 'scale(1)' }, { transform: 'scale(4.2)' }], { duration: 1100, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' }).finished;
    const A = document.getElementById(cur), B = $('#secret');
    leaveScene(cur); A.classList.remove('is-active'); B.classList.add('is-active'); B.scrollTop = 0; cur = 'secret';
    enterScene('secret');
    await dw.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduce ? 200 : 900, fill: 'forwards' }).finished;
    dw.hidden = true; dw.classList.remove('unlocking'); [dw, fr2, pf].forEach(el => el.getAnimations().forEach(a => a.cancel())); pf.style.opacity = '';
    busy = false; afterEnter('secret');
  }

  /* the brass key: a small moment of its own before it goes into the pocket */
  async function discoverKey(el) {
    if (S.keepsakes.key) return;
    el.classList.add('taken');
    const r = el.getBoundingClientRect(), f = document.createElement('div');
    f.className = 'key-moment'; f.innerHTML = `<div class="km-glow"></div><div class="km-key">${KEY_SVG}</div><p>A little brass key</p>`;
    document.body.appendChild(f);
    const k = f.querySelector('.km-key'), cx = innerWidth / 2, cy = innerHeight / 2;
    AUDIO.sfx('chime'); FX.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 22, kinds: ['spark'], colors: ['#f7dfa4', '#fff3c4', '#ffd1e2'] });
    if (!reduce) {
      await k.animate([{ transform: `translate(${r.left + r.width / 2 - cx}px,${r.top + r.height / 2 - cy}px) scale(.5) rotate(0)` }, { transform: 'translate(0,0) scale(1.6) rotate(360deg)' }], { duration: 1300, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'forwards' }).finished;
      FX.burst(cx, cy, { count: 30, power: 4, kinds: ['spark'], colors: ['#f7dfa4', '#fff', '#ffd1e2'] });
      await wait(1400);
    }
    f.classList.add('out'); collect('key', k);
    setTimeout(() => f.remove(), 600);
    setTimeout(() => toast('A little brass key with a heart on it. I wonder what it opens…', 4600), 4400);
  }

  /* ── gallery footers ── */
  function updateFooter(id) {
    const i = G.findIndex(g => g.id === id), f = $(`#${id} .g-foot`), prev = G[i - 1], next = G[i + 1];
    let html = `<button class="btn btn-ghost" type="button" data-go="hall">← Grand Hall</button>`;
    if (prev) html += `<button class="btn btn-ghost" type="button" data-go="${prev.id}">‹ Gallery ${prev.no}</button>`;
    if (next) html += `<button class="btn btn-primary" type="button" data-go="${next.id}">Gallery ${next.no}: ${esc(next.name)} →</button>`;
    else if (allVisited()) html += `<button class="btn btn-primary" type="button" data-go="finale">To the final exhibition ♡</button>`;
    else html += `<button class="btn btn-primary" type="button" data-go="hall">Back to the Grand Hall</button>`;
    f.innerHTML = html;
  }

  /* ═════════════ GALLERY 01 · The Time Capsule ═════════════ */
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const pad2 = n => String(n).padStart(2, '0');
  const parseDate = s => { const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || '').trim()); return m && +m[2] >= 1 && +m[2] <= 12 ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null; };
  const mmss = s => !isFinite(s) ? '--:--' : `${Math.floor(s / 60)}:${pad2(Math.floor(s % 60))}`;
  // how long each object takes to open before its card appears (seconds)
  const REVEAL = { letter: 1.15, photo: .85, calendar: .75, music: 1.05, gift: 1.75 };
  let keepOpen = -1, keepBusy = false, keepBtn = null, keepWantClose = false, song = null;

  /* The object itself. The same markup is used small (on the shelf) and large (in focus). */
  function keepObject(k) {
    switch (k.type) {
      case 'letter': return '<span class="kobj o-letter"><span class="env"><i class="env-back"></i><i class="env-paper"></i><i class="env-front"></i><i class="env-flap"></i><i class="env-seal"></i></span></span>';
      case 'photo': return `<span class="kobj o-photo"><i class="ph-back" data-d="${esc(clean(k.date || ''))}"></i><span class="ph-front"><i class="ph-img"${k.photo ? ` style="background-image:url('${esc(encodeURI(k.photo))}');background-position:${esc(k.focus || '50% 50%')}"` : ''}></i><i class="ph-fog"></i><em class="ph-cap">${esc(clean(k.date || ''))}</em></span></span>`;
      case 'calendar': { const d = parseDate(((k.dates || [])[0] || {}).date) || { y: new Date(M.since).getFullYear(), m: 3, d: 8 };
        return `<span class="kobj o-cal"><span class="cal-body"><b class="cal-month">${MONTHS[d.m].slice(0, 3).toUpperCase()}</b><strong class="cal-day">${d.d}</strong><em class="cal-year">${d.y}</em><i class="cal-cover"></i><i class="cal-flip"></i></span></span>`; }
      case 'music': return '<span class="kobj o-music"><span class="mu-case"><i class="mu-grille"></i><i class="mu-knob k1"></i><i class="mu-knob k2"></i></span><span class="mu-disc"><i></i></span><i class="mu-arm"></i><i class="mu-lid"></i><span class="mu-notes"><i>♪</i><i>♫</i></span></span>';
      default: return '<span class="kobj o-gift"><i class="gf-glow"></i><i class="gf-card"></i><span class="gf-box"><i class="gf-band"></i></span><span class="gf-lid"><i class="gf-band"></i><span class="gf-bow"><i class="gf-tail l"></i><i class="gf-tail r"></i><i class="gf-loop l"></i><i class="gf-loop r"></i><i class="gf-knot"></i></span></span></span>';
    }
  }
  /* What the keepsake reveals in its card. */
  function keepBody(k) {
    switch (k.type) {
      case 'letter': {
        let n = 0; const ps = paras(k.text).replace(/<p(?= |>)/g, () => `<p style="--i:${n++}"`);
        return `<div class="kv-letter">${ps}${k.sign ? `<p class="sign" style="--i:${n}">${esc(clean(k.sign))}</p>` : ''}</div>`; }
      case 'photo': return (k.photo ? `<figure class="kv-photo"><span class="pv"><img src="${esc(k.photo)}" alt="${esc(k.alt || clean(k.title || ''))}" decoding="async"></span>${k.date ? `<figcaption>${esc(clean(k.date))}</figcaption>` : ''}</figure>` : '') + paras(k.text);
      case 'calendar': return `<div class="kv-cal"><div class="cal-head"><button class="cal-nav" type="button" id="calPrev" aria-label="Previous month">‹</button><b id="calMonth"></b><button class="cal-nav" type="button" id="calNext" aria-label="Next month">›</button></div>
        <div class="cal-sheet" id="calSheet"></div><div class="cal-memo" id="calMemo" aria-live="polite"></div><div class="cal-dots" id="calDots" aria-hidden="true"></div></div>`;
      case 'music': return `<div class="kv-player" id="kvPlayer"><div class="pl-top"><button class="kv-play" id="kvPlay" type="button" aria-label="Play the song">▶</button><div class="pl-meta"><b>${esc(clean(k.title || 'Our song'))}</b><span>${esc(clean(k.artist || ''))}</span></div><div class="pl-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div>
        <div class="pl-row"><span id="plCur">0:00</span><input type="range" id="plSeek" min="0" max="1000" value="0" step="1" aria-label="Position in the song"><span id="plDur">--:--</span></div>
        <div class="pl-row"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg><input type="range" id="plVol" min="0" max="100" value="80" aria-label="Volume"><span id="plVolN">80</span></div>
        <small class="pl-note" id="plNote">tap ▶ to play</small></div>${paras(k.text)}`;
      default: return `<div class="kv-gift">${paras(k.text)}</div>`;
    }
  }

  function buildG1() {
    const ks = M.timeCapsule.keepsakes, box = $('#capsuleItems');
    $('#capTotal').textContent = ks.length;
    const item = (k, i) => `<button class="keep${S.found.g1.includes(i) ? ' found' : ''}" type="button" data-i="${i}" style="--bd:${(-i * 0.9).toFixed(1)}s" aria-label="Keepsake ${i + 1}: ${esc(clean(k.name || k.type))}">
        <span class="keep-shine" aria-hidden="true"></span><span class="keep-float">${keepObject(k)}</span>
        <span class="keep-tag"><b>No. ${pad2(i + 1)}</b><em>${esc(clean(k.name || k.type))}</em></span><span class="keep-star" aria-hidden="true">★</span></button>`;
    // two glass shelves: the top one holds the first half, the bottom one the rest
    const split = ks.length <= 3 ? ks.length : Math.floor(ks.length / 2);
    const rows = [ks.slice(0, split), ks.slice(split)].filter(r => r.length);
    let idx = 0;
    box.innerHTML = rows.map(r => `<div class="cab-shelf">${r.map(k => item(k, idx++)).join('')}</div>`).join('');
    box.addEventListener('click', e => { const b = e.target.closest('.keep'); if (b) openKeep(+b.dataset.i, b); });
    updateCapsule(false);
  }
  function updateCapsule(bump) {
    const n = M.timeCapsule.keepsakes.length, done = isComplete('g1');
    $('#capCount').textContent = Math.min(foundCount('g1'), n);
    $('#capsule').classList.toggle('complete', done);
    $('#capPlaque').textContent = done ? `ALL ${n} KEEPSAKES OPENED ♡` : clean(M.timeCapsule.plaque);
    if (bump) { const c = $('.tc-count'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
  }
  /* Fly the object between its place on the shelf and the centre of the room. */
  function flyKeep(el, shelf, focus, dur, back) {
    const dx = shelf.left + shelf.width / 2 - (focus.left + focus.width / 2), dy = shelf.top + shelf.height / 2 - (focus.top + focus.height / 2), s = shelf.width / focus.width;
    const kf = [{ transform: `translate(${dx}px,${dy}px) scale(${s})` }, { transform: `translate(${dx * .35}px,${dy * .35 - 34}px) scale(${Math.min(1.12, s + (1 - s) * .8)})`, offset: back ? .4 : .6 }, { transform: 'translate(0,0) scale(1)' }];
    return el.animate(back ? kf.reverse() : kf, { duration: dur, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'both' }).finished.catch(() => {});
  }
  async function openKeep(i, btn) {
    if (keepBusy || keepOpen > -1 || busy) return;
    keepBusy = true; keepOpen = i; keepBtn = btn;
    const k = M.timeCapsule.keepsakes[i], kv = $('#keepView'), obj = $('#kvObject');
    $('#kvKicker').textContent = `Keepsake No. ${pad2(i + 1)} · ${clean(k.name || k.type)}`;
    $('#kvTitle').textContent = clean(k.type === 'music' ? (k.heading || 'Our song') : (k.title || k.name || ''));
    const sub = (k.type === 'music' || k.type === 'calendar' || k.type === 'photo') ? '' : clean(k.date || '');
    $('#kvDate').textContent = sub; $('#kvDate').hidden = !sub;
    kv.style.setProperty('--reveal', (reduce ? .1 : (REVEAL[k.type] || .7)) + 's');
    kv.dataset.type = k.type;
    $('#kvBody').innerHTML = keepBody(k); obj.innerHTML = keepObject(k);
    kv.classList.remove('opened', 'in'); kv.hidden = false; kv.scrollTop = 0; void kv.offsetWidth; kv.classList.add('in');
    if (k.type === 'calendar') setupCal(k);
    if (k.type === 'music') setupSong(k);
    const from = btn.querySelector('.kobj').getBoundingClientRect(); btn.classList.add('away');
    AUDIO.sfx('whoosh');
    await flyKeep(obj, from, obj.getBoundingClientRect(), reduce ? 1 : 820, false);
    if (keepOpen !== i) return;
    obj.getAnimations().forEach(a => a.cancel());
    obj.firstElementChild.classList.add('open'); kv.classList.add('opened');
    openSound(k.type, i);
    markFound('g1', i);
    await wait(reduce ? 60 : 900);
    if (keepOpen !== i) return;
    keepBusy = false; $('#kvClose').focus({ preventScroll: true });
    if (keepWantClose) closeKeep();
  }
  /* each keepsake sounds and sparkles a little differently as it opens */
  function openSound(type, i) {
    const obj = $('#kvObject'), later = (ms, fn) => setTimeout(() => { if (keepOpen === i) fn(); }, reduce ? 0 : ms);
    const soft = { kinds: ['spark'], colors: ['#fff', '#ffd9e8', '#f7dfa4', '#e6dcff'] };
    if (type === 'letter') { AUDIO.sfx('pop'); later(500, () => AUDIO.sfx('soft')); later(700, () => FX.burstAt(obj, { count: 10, power: 2, ...soft })); }
    else if (type === 'photo') { AUDIO.sfx('soft'); later(4000, () => { AUDIO.sfx('chime'); const p = $('.kv-photo'); if (p) FX.burstAt(p, { count: 14, power: 2.6, ...soft }); }); }
    else if (type === 'calendar') { AUDIO.sfx('drawer'); later(350, () => AUDIO.sfx('soft')); }
    else if (type === 'music') { AUDIO.sfx('soft'); later(600, () => FX.burstAt(obj, { count: 8, power: 1.8, kinds: ['spark'], colors: ['#ffd3e2', '#fff'] })); }
    else { AUDIO.sfx('drawer'); later(850, () => AUDIO.sfx('pop')); later(1200, () => { AUDIO.sfx('unlock'); FX.burstAt(obj, { count: 26, power: 3.6, kinds: ['spark', 'spark', 'heart'], colors: ['#fff3c4', '#ffd9e8', '#f7dfa4', '#fff'] }); }); }
  }
  async function closeKeep() {
    if (keepOpen < 0) return;
    if (keepBusy) { keepWantClose = true; return; }   // still opening: close as soon as it has opened
    keepBusy = true; keepWantClose = false;
    const i = keepOpen, kv = $('#keepView'), obj = $('#kvObject'), btn = keepBtn;
    stopSong(); AUDIO.sfx('soft');
    kv.classList.remove('opened'); if (obj.firstElementChild) obj.firstElementChild.classList.remove('open', 'playing');
    await wait(reduce ? 40 : 620);
    if (keepOpen !== i) return;
    kv.classList.remove('in');
    await flyKeep(obj, btn.querySelector('.kobj').getBoundingClientRect(), obj.getBoundingClientRect(), reduce ? 1 : 620, true);
    if (keepOpen !== i) return;
    endKeep(true);
  }
  function endKeep(celebrate) {
    const kv = $('#keepView'), obj = $('#kvObject'), btn = keepBtn;
    kv.hidden = true; kv.classList.remove('in', 'opened');
    obj.getAnimations().forEach(a => a.cancel()); obj.innerHTML = ''; $('#kvBody').innerHTML = '';
    keepOpen = -1; keepBusy = false; keepBtn = null; keepWantClose = false;
    if (!btn) return;
    const isNew = !btn.classList.contains('found');
    btn.classList.remove('away'); btn.classList.toggle('found', S.found.g1.includes(+btn.dataset.i));
    updateCapsule(celebrate && isNew);
    if (!celebrate) return;
    btn.focus({ preventScroll: true });
    if (isNew) { AUDIO.sfx('pop'); FX.burstAt(btn.querySelector('.kobj'), { count: 10, power: 2.4, kinds: ['spark'], colors: ['#f7dfa4', '#fff', '#ffd9e8'] }); }
    if (isComplete('g1') && !S.keepsakes.pick) setTimeout(() => { if (cur === 'g1') collect('pick', $('#capsule .cab-glass')); }, 800);
  }
  function forceCloseKeep() { if (keepOpen < 0) return; stopSong(); endKeep(false); }

  /* calendar keepsake: a real little month; the meaningful days are tappable */
  function setupCal(k) {
    const list = (k.dates || []).map((e, j) => ({ ...e, j, d: parseDate(e.date) })).filter(e => e.d);
    if (!list.length) { $('#calSheet').innerHTML = '<p class="ph">Add dates to the calendar in content.js.</p>'; return; }
    const months = [...new Set(list.map(e => e.d.y * 12 + e.d.m))].sort((a, b) => a - b);
    let mi = 0, sel = list[0];
    const sheet = $('#calSheet');
    const page = () => {
      const key = months[mi], y = Math.floor(key / 12), m = key % 12;
      const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
      let h = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(w => `<span class="wd">${w}</span>`).join('') + '<span></span>'.repeat(first);
      for (let d = 1; d <= days; d++) {
        const e = list.find(x => x.d.y === y && x.d.m === m && x.d.d === d);
        h += e ? `<button type="button" data-j="${e.j}" class="${e === sel ? 'sel' : ''}" aria-label="${d} ${MONTHS[m]}: ${esc(clean(e.label || ''))}">${d}</button>` : `<span>${d}</span>`;
      }
      return `<div class="cal-page"><div class="cal-grid">${h}</div></div>`;
    };
    const memo = (swap) => {
      const box = $('#calMemo'), o = $('#kvObject');
      box.innerHTML = `<p class="md">${sel.d.d} ${MONTHS[sel.d.m]} ${sel.d.y}</p><p class="ml">${esc(clean(sel.label || ''))}</p>${paras(sel.text)}`;
      if (swap) { box.classList.remove('swap'); void box.offsetWidth; box.classList.add('swap'); }
      $('#calDots').innerHTML = list.map(e => `<i class="${e === sel ? 'on' : ''}"></i>`).join('');
      if (o.querySelector('.cal-day')) {
        o.querySelector('.cal-month').textContent = MONTHS[sel.d.m].slice(0, 3).toUpperCase(); o.querySelector('.cal-day').textContent = sel.d.d; o.querySelector('.cal-year').textContent = sel.d.y;
        if (swap) { const f = o.querySelector('.cal-flip'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
      }
    };
    const render = (turn) => {
      const key = months[mi];
      $('#calMonth').textContent = `${MONTHS[key % 12]} ${Math.floor(key / 12)}`;
      if (turn && !reduce) { const old = sheet.querySelector('.cal-page'); if (old) { old.classList.add('old'); setTimeout(() => old.remove(), 700); } sheet.insertAdjacentHTML('afterbegin', page()); }
      else sheet.innerHTML = page();
      $('#calPrev').disabled = mi === 0; $('#calNext').disabled = mi === months.length - 1;
    };
    const go = (dir) => {
      const n = mi + dir; if (n < 0 || n >= months.length) return;
      mi = n; sel = list.find(e => e.d.y * 12 + e.d.m === months[mi]);
      render(true); memo(true); AUDIO.sfx('soft');
    };
    $('#calPrev').addEventListener('click', () => go(-1));
    $('#calNext').addEventListener('click', () => go(1));
    sheet.addEventListener('click', e => {
      const b = e.target.closest('button[data-j]'); if (!b) return;
      sel = list.find(x => x.j === +b.dataset.j);
      sheet.querySelectorAll('.cal-page:not(.old) button').forEach(x => x.classList.toggle('sel', x === b));
      memo(true); AUDIO.sfx('pop');
    });
    render(false); memo(false);
  }

  /* music keepsake: the record player; the museum's own music steps aside while it plays */
  function setupSong(k) {
    const btn = $('#kvPlay'), note = $('#plNote'), seek = $('#plSeek'), vol = $('#plVol'), box = $('#kvPlayer');
    const fill = (el) => el.style.setProperty('--p', (el.value / el.max * 100) + '%');
    // no song set in content.js: show the record player and its words, but no controls that can't do anything
    if (!k.src) { box.hidden = true; return; }
    const s = new Audio(); s.preload = 'metadata'; s.volume = .8; song = s;
    let dragging = false, failed = false, loadT = 0, gain = null;
    // iPads and iPhones ignore audio.volume, so there the song is routed through a Web Audio gain node instead
    const fixedVolume = (() => { try { const t = new Audio(); t.volume = .5; return t.volume === 1; } catch (e) { return false; } })();
    const volRow = vol.closest('.pl-row');
    const route = () => {
      if (!fixedVolume) return;
      if (gain) { AUDIO.context(); return; }   // make sure the context is awake before the song plays through it
      try { const c = AUDIO.context(); if (!c) throw 0; const n = c.createMediaElementSource(s); gain = c.createGain(); gain.gain.value = vol.value / 100; n.connect(gain).connect(c.destination); }
      catch (e) { gain = null; volRow.hidden = true; }   // no way to change the volume here: hide the slider rather than show one that does nothing
    };
    fill(vol); fill(seek);
    const setControls = on => { seek.disabled = vol.disabled = !on; box.classList.toggle('off', !on); };
    const playing = on => { if (song !== s) return; clearTimeout(loadT); const o = $('#kvObject').firstElementChild; if (o) o.classList.toggle('playing', on);
      box.classList.toggle('on', on); btn.textContent = on ? '❚❚' : '▶'; btn.setAttribute('aria-label', on ? 'Pause the song' : 'Play the song');
      note.textContent = on ? 'now playing ♫' : (s.currentTime > 0 ? 'paused' : 'tap ▶ to play'); AUDIO.duck(on); };
    // the song can't be reached (missing file, offline…): say so kindly and offer to try again
    const unavailable = msg => { if (song !== s) return; failed = true; playing(false); setControls(false);
      btn.textContent = '↻'; btn.setAttribute('aria-label', 'Try loading the song again'); note.textContent = msg || 'The song couldn’t load right now. Tap ↻ to try again.'; };
    const load = () => { failed = false; setControls(true); s.src = k.src; s.load(); };
    s.addEventListener('error', () => { if (s.getAttribute('src')) unavailable(); });
    s.addEventListener('loadedmetadata', () => { if (song === s) $('#plDur').textContent = mmss(s.duration); });
    s.addEventListener('timeupdate', () => { if (song !== s || dragging || !s.duration) return; seek.value = Math.round(s.currentTime / s.duration * 1000); fill(seek); $('#plCur').textContent = mmss(s.currentTime); });
    s.addEventListener('ended', () => playing(false));
    s.addEventListener('pause', () => playing(false));
    s.addEventListener('playing', () => playing(true));
    btn.addEventListener('click', () => {
      if (failed) { note.textContent = 'trying again…'; btn.textContent = '▶'; btn.setAttribute('aria-label', 'Play the song'); load(); return; }
      if (!s.paused) { s.pause(); return; }
      AUDIO.start(); route(); note.textContent = 'loading…';
      clearTimeout(loadT); loadT = setTimeout(() => { if (song === s && s.paused) unavailable('Still loading… tap ↻ to try again.'); }, 15000);
      s.play().catch(err => { if (song !== s || failed) return; clearTimeout(loadT); if (err && err.name === 'NotAllowedError') note.textContent = 'Tap ▶ again to play'; });
    });
    seek.addEventListener('input', () => { dragging = true; fill(seek); if (s.duration) $('#plCur').textContent = mmss(seek.value / 1000 * s.duration); });
    seek.addEventListener('change', () => { dragging = false; if (s.duration) s.currentTime = seek.value / 1000 * s.duration; });
    vol.addEventListener('input', () => { s.volume = vol.value / 100; if (gain) gain.gain.value = vol.value / 100; fill(vol); $('#plVolN').textContent = vol.value; });
    load();
  }
  function stopSong() { const s = song; song = null; if (s) { try { s.pause(); s.removeAttribute('src'); s.load(); } catch (e) {} } AUDIO.duck(false); }

  /* ═════════════ GALLERY 02 ═════════════ */
  let caseIdx = 0;
  // an empty frame that looks deliberate: an undeveloped polaroid, waiting for the next memory
  const RESERVED = '<span class="pol-empty"><svg viewBox="0 0 48 40" aria-hidden="true"><rect x="3" y="9" width="42" height="28" rx="6"/><path d="M16 9l3-5h10l3 5"/><circle cx="24" cy="23" r="8"/><path d="M24 26.5s-4-2.4-4-5a2.1 2.1 0 0 1 4-1 2.1 2.1 0 0 1 4 1c0 2.6-4 5-4 5z" class="h"/></svg><em>reserved for our next memory</em></span>';
  function buildG2() {
    const items = M.memories.items, wall = $('#polaroids');
    const rot = [-3, 2.5, -1.5, 3, -2.5, 1.5, -1], str = [30, 64, 42, 78, 36, 58, 48];
    wall.innerHTML = items.map((m, i) => `
      <div class="pol${m.photo ? '' : ' reserved'}${S.found.g2.includes(i) ? ' seen' : ''}" data-i="${i}" style="--r:${rot[i % 7]}deg;--str:${str[i % 7]}px;--sw:${(5 + (i % 3)).toFixed(1)}s;--sd:${(-i * 1.3).toFixed(1)}s">
        <span class="pol-nail" aria-hidden="true"></span>
        <button class="pol-card" type="button" aria-label="Open the display case: ${esc(clean(m.caption))}">
          <div class="pol-photo">${m.photo ? `<img class="fade" src="${esc(m.photo)}" alt="${esc(m.alt || '')}" loading="lazy" decoding="async">` : RESERVED}</div>
          <p class="pol-cap">${esc(clean(m.caption))}</p>
        </button>
        <span class="sticker">${ART.keepsake.pin}</span>
      </div>`).join('');
    wall.addEventListener('click', e => { const p = e.target.closest('.pol'); if (p) openCase(+p.dataset.i); });
    $('#caseFlip').addEventListener('click', flipCase);
    $('#flipPolaroid').addEventListener('click', flipCase);
    $('#casePrev').addEventListener('click', () => showCase(caseIdx - 1, true));
    $('#caseNext').addEventListener('click', () => showCase(caseIdx + 1, true));
    updateMemCounter();
  }
  function openCase(i) { showCase(i, false); openModal($('#caseModal')); AUDIO.sfx('soft'); }
  function showCase(i, animate) {
    const items = M.memories.items; caseIdx = (i + items.length) % items.length; const m = items[caseIdx];
    const fp = $('#flipPolaroid'); fp.classList.remove('flipped');
    const ph = $('#casePhoto');
    if (m.photo) {
      ph.classList.remove('empty'); ph.innerHTML = `<img class="fade" src="${esc(m.photo)}" alt="${esc(m.alt || '')}" decoding="async">`;
    } else { ph.classList.add('empty'); ph.innerHTML = RESERVED; }
    $('#caseCaption').textContent = clean(m.caption);
    $('#caseDate').textContent = clean(m.date) || 'a little memory';
    $('#caseNote').innerHTML = paras(m.note);
    $('#caseTitle').textContent = clean(m.caption);
    $('#caseFlip').textContent = 'Turn it over ↻';
    if (animate && !reduce) fp.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'ease-out' });
  }
  function flipCase() {
    const fp = $('#flipPolaroid'), on = !fp.classList.contains('flipped'); fp.classList.toggle('flipped', on);
    $('#caseFlip').textContent = on ? 'Turn it back ↺' : 'Turn it over ↻';
    AUDIO.sfx('soft');
    if (on && markFound('g2', caseIdx)) {
      $(`.pol[data-i="${caseIdx}"]`).classList.add('seen'); updateMemCounter();
      FX.burstAt(fp, { count: 12, power: 2.4 });
      if (isComplete('g2')) setTimeout(() => collect('film', fp), 700);
    }
  }
  function updateMemCounter() { $('#memCounter').textContent = `${foundCount('g2')} of ${M.memories.items.length} polaroids turned over`; }

  /* ═════════════ GALLERY 03 ═════════════ */
  function buildG3() {
    const cards = M.reasons.cards, last = cards.length - 1, box = $('#niches');
    $('#reasonTotal').textContent = cards.length;
    box.innerHTML = cards.map((c, i) => `
      <div class="niche${i === last ? ' rare' : ''}" data-i="${i}">
        ${i === last ? `<span class="rare-tag">${esc(M.reasons.rareLabel)}</span>` : ''}
        <button class="lcard${S.found.g3.includes(i) ? ' flipped' : ''}" type="button" aria-label="Reason number ${i + 1}">
          <span class="lc-face lc-back"><span class="seal">${ART.heartIcon}</span><b>No. ${String(i + 1).padStart(2, '0')}</b></span>
          <span class="lc-face lc-front"><i></i>${paras(c)}<b>No. ${String(i + 1).padStart(2, '0')}</b></span>
        </button>
      </div>`).join('');
    box.addEventListener('click', e => {
      const card = e.target.closest('.lcard'); if (!card) return;
      const n = card.closest('.niche'), i = +n.dataset.i;
      if (i === last && n.classList.contains('locked')) {
        toast(`The rarest card is sealed. Discover the other ${last} first (${Math.min(foundCount('g3'), last)} / ${last}).`);
        card.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(0)' }], { duration: 400 }); return;
      }
      const on = !card.classList.contains('flipped'); card.classList.toggle('flipped', on);
      if (!on) { AUDIO.sfx('soft'); return; }
      AUDIO.sfx('pop');
      if (markFound('g3', i)) {
        FX.burstAt(card, { count: i === last ? 60 : 18, power: i === last ? 5 : 3, colors: i === last ? ['#f7dfa4', '#ffd1e2', '#d9c8ff', '#fff'] : undefined });
        const cc = $('.collect-count'); cc.classList.remove('bump'); void cc.offsetWidth; cc.classList.add('bump');
        updateVault(true);
        if (i === last) setTimeout(() => collect('pin', card), 1000);
      }
    });
    box.addEventListener('pointermove', e => { const c = e.target.closest('.lcard'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (100 - (e.clientX - r.left) / r.width * 100).toFixed(0) + '%'); });
    updateVault(false);
  }
  function updateVault(announce) {
    const last = M.reasons.cards.length - 1, others = S.found.g3.filter(i => i !== last).length;
    $('#reasonCount').textContent = foundCount('g3');
    const rare = $('.niche.rare'); const wasLocked = rare.classList.contains('locked');
    const locked = others < last && !S.found.g3.includes(last);
    rare.classList.toggle('locked', locked); rare.classList.toggle('ready', !locked && !S.found.g3.includes(last));
    if (announce && wasLocked && !locked) { AUDIO.sfx('unlock'); toast('Something golden just unsealed itself… ✨', 3600); FX.burstAt(rare, { count: 30, colors: ['#f7dfa4', '#fff3c4'] }); }
  }

  /* ═════════════ GALLERY 04 ═════════════ */
  function buildG4() {
    const d = M.littleThings.drawers, box = $('#drawers');
    box.innerHTML = d.map((x, i) => `
      <div class="drawer${S.found.g4.includes(i) ? ' seen' : ''}" data-i="${i}">
        <span class="drawer-peek" aria-hidden="true">${ART.object[x.object] || ART.object.smile}</span>
        <button class="drawer-front" type="button" aria-expanded="false"><span class="drawer-label">${esc(clean(x.label))}</span><span class="drawer-knob"></span></button>
      </div>`).join('');
    box.addEventListener('click', e => {
      const b = e.target.closest('.drawer-front'); if (!b) return;
      const dr = b.closest('.drawer'), i = +dr.dataset.i, open = dr.classList.contains('open');
      closeDrawers(); AUDIO.sfx('drawer');
      if (open) { setNote(-1); return; }
      dr.classList.add('open', 'seen'); b.setAttribute('aria-expanded', 'true'); setNote(i);
      if (markFound('g4', i)) { updateDrawerCounter(); if (isComplete('g4')) setTimeout(() => toast('Every drawer opened. These are the little things that make it us ♡', 4200), 600); }
      if (innerWidth <= 760) $('#curioNote').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });
    const key = $('#hookKey');
    if (S.keepsakes.key) key.classList.add('taken');
    key.addEventListener('click', () => discoverKey(key));
    updateDrawerCounter();
  }
  function closeDrawers() { $$('.drawer.open').forEach(x => { x.classList.remove('open'); x.querySelector('.drawer-front').setAttribute('aria-expanded', 'false'); }); }
  function setNote(i) {
    const n = $('#curioNote');
    if (i < 0) { $('#noteObject').innerHTML = ''; $('#noteTitle').textContent = 'Open a drawer'; $('#noteText').innerHTML = '<p>Each drawer holds one of the little things.</p>'; return; }
    const x = M.littleThings.drawers[i];
    $('#noteObject').innerHTML = ART.object[x.object] || ART.object.smile;
    $('#noteTitle').textContent = clean(x.label);
    $('#noteText').innerHTML = paras(x.text) + (x.sub ? paras(x.sub) : '');
    n.classList.remove('pop'); void n.offsetWidth; n.classList.add('pop');
  }
  function updateDrawerCounter() { $('#drawerCounter').textContent = `${foundCount('g4')} of ${M.littleThings.drawers.length} drawers opened`; }

  /* ═════════════ GALLERY 05 ═════════════ */
  // heart-shaped constellation (x%, y%) — stars are placed in this order
  const HEART = [[50, 86], [25, 62], [13, 36], [29, 15], [50, 31], [71, 15], [87, 36], [75, 62]];
  const KIND = { place: 'A place we want to visit', date: 'A date idea', dream: 'A little dream' };
  const STAMP = { place: 'someday', date: 'soon', dream: 'always' };
  function starPos(i, n) {
    if (n <= HEART.length) return HEART[Math.round(i * HEART.length / n) % HEART.length];
    const t = i / n * Math.PI * 2, x = 16 * Math.pow(Math.sin(t), 3), y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [50 + x * 2.3, 46 - y * 2.6];
  }
  function buildG5() {
    const stars = M.future.stars, map = $('#skyMap'), n = stars.length;
    map.insertAdjacentHTML('beforeend', stars.map((s, i) => { const [x, y] = starPos(i, n);
      return `<button class="star${S.found.g5.includes(i) ? ' found' : ''}${x < 22 ? ' edge-l' : x > 78 ? ' edge-r' : ''}" type="button" data-i="${i}" style="left:${x}%;top:${y}%;--tw:${(2.4 + (i % 4) * .6).toFixed(1)}s" aria-label="${esc(KIND[s.kind] || 'A star')}: ${esc(clean(s.title))}">
        <span class="glyph">${ART.glyph[s.kind] || ART.glyph.dream}</span><span class="star-label">${esc(clean(s.title))}</span></button>`; }).join(''));
    $('.g5 .g-backdrop .horizon').innerHTML = ART.horizon;
    map.addEventListener('click', e => {
      const b = e.target.closest('.star'); if (!b) return; const i = +b.dataset.i;
      b.classList.add('found'); AUDIO.sfx('chime');
      openPostcard(i);
      if (markFound('g5', i)) {
        drawLines(true); updateStarCounter();
        if (isComplete('g5')) setTimeout(() => {
          map.classList.add('complete'); FX.burstAt(map, { count: 60, power: 5, colors: ['#ffd1e2', '#f7dfa4', '#fff', '#d9c8ff'] });
          collect('star', map); setTimeout(() => toast('Look what our future makes ♡', 4000), 4300);
        }, 900);
      }
    });
    drawLines(false); updateStarCounter();
    if (isComplete('g5')) map.classList.add('complete');
  }
  function drawLines(animate) {
    const n = M.future.stars.length, svg = $('#constellation'), f = S.found.g5; let html = '';
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; if (f.includes(i) && f.includes(j)) { const [x1, y1] = starPos(i, n), [x2, y2] = starPos(j, n);
      html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${animate ? ' class="drawn"' : ''}/>`; } }
    svg.innerHTML = html;
  }
  function openPostcard(i) {
    const s = M.future.stars[i];
    $('#pcArt').innerHTML = ART.postcard[s.kind] || ART.postcard.dream;
    $('#pcKind').textContent = KIND[s.kind] || 'Someday';
    $('#pcStamp').textContent = STAMP[s.kind] || 'someday';
    $('#pcTitle').textContent = clean(s.title);
    $('#pcText').innerHTML = paras(s.text);
    openModal($('#postcard'));
  }
  function updateStarCounter() { $('#starCounter').textContent = `${foundCount('g5')} of ${M.future.stars.length} stars found`; }

  /* ═════════════ SECRET ═════════════ */
  function enterSecret() {
    $('#secretText').innerHTML = paras(M.secret.text);
    const sc = $('#secret'); sc.classList.remove('play'); void sc.offsetWidth; sc.classList.add('play');
    AUDIO.sfx('unlock');
    if (!S.secret) { S.secret = true; save(); updateProgress(); setTimeout(() => collect('secret', $('.beating')), 2600); }
    setTimeout(() => FX.burstAt($('.beating'), { count: 40, power: 4.4, colors: ['#ffd1e2', '#f7cfa0', '#fff'] }), 1100);
  }

  /* ═════════════ FINALE ═════════════ */
  // A slow sequence: a quiet sky, a heart of light forming, the camera leaning in, a pause,
  // the title, then a letter in an envelope that she opens herself.
  let finaleTimers = [], finOpened = false;
  const finAt = (ms, fn) => finaleTimers.push(setTimeout(() => { if (cur === 'finale' || $('#finale').classList.contains('is-moving')) fn(); }, reduce ? Math.min(ms, 400) : ms));
  function resetFinale() {
    const fin = $('#finale');
    finaleTimers.forEach(clearTimeout); finaleTimers = []; finOpened = false;
    FX.clearHeart();
    fin.classList.remove('play', 'zoom', 'titles', 'env', 'opened', 'read', 'thanks');
  }
  function playFinale() {
    const fin = $('#finale'), t = $('.finale-title span');
    resetFinale();
    const txt = clean(M.finale.title);
    t.innerHTML = Array.from(txt).map((ch, i) => ch === ' ' ? ' ' : `<span class="ch" style="--i:${i}">${esc(ch)}</span>`).join('');
    let n = 0;
    $('#finaleMessage').innerHTML = paras(M.finale.message).replace(/<p(?= |>)/g, () => `<p style="--i:${n++}"`);
    $('.finale-letter .sign').style.setProperty('--i', n);
    fin.scrollTop = 0; void fin.offsetWidth;
    FX.mode('finaleQuiet');
    fin.classList.add('play');                                                   // 1. a quiet, dark sky fades in
    finAt(1200, () => { FX.heart($('#finHeart')); AUDIO.sfx('soft'); });         // 2. light gathers into a heart
    finAt(1600, () => fin.classList.add('zoom'));                                // 3. the camera slowly leans in
    finAt(8200, () => { fin.classList.add('titles'); AUDIO.sfx('chime'); });     // 4–5. a pause, then the title
    finAt(13200, () => {                                                          // 6. the letter arrives
      fin.classList.add('env');
      const w = $('#finEnvWrap'); fin.scrollTo({ top: Math.max(0, w.offsetTop - innerHeight * .42), behavior: reduce ? 'auto' : 'smooth' });
    });
    finAt(25000, () => openFinaleLetter());                                       // she can open it herself; it opens on its own if she waits
    if (!S.finale) { S.finale = true; save(); updateProgress(); }
  }
  function openFinaleLetter() {
    const fin = $('#finale');
    if (finOpened || !fin.classList.contains('env')) return;
    finOpened = true;
    fin.classList.add('opened'); AUDIO.sfx('pop'); setTimeout(() => AUDIO.sfx('soft'), 500);
    FX.burstAt($('#finEnv'), { count: 16, power: 2.6, kinds: ['spark'], colors: ['#fff', '#ffd9e8', '#f7dfa4'] });
    finAt(1900, () => {                                                           // 7. the letter unfolds and is written in
      fin.classList.add('read');
      setTimeout(() => { const l = $('#finaleLetter'); fin.scrollTo({ top: Math.max(0, l.offsetTop - 90), behavior: reduce ? 'auto' : 'smooth' }); }, 120);
    });
    const paraCount = $$('#finaleMessage p').length + 1;
    finAt(1900 + 1100 + paraCount * 1500 + 1800, () => {                          // 8. the last words, then gentle hearts
      fin.classList.add('thanks');
      FX.mode('finale');
      setTimeout(() => { if (cur !== 'finale') return; const r = $('.finale-end').getBoundingClientRect();
        FX.burst(innerWidth / 2, Math.min(innerHeight * .75, Math.max(80, r.top + r.height / 2)), { count: 40, power: 5, kinds: ['heart', 'spark'] }); AUDIO.sfx('chime'); }, 2200);
    });
  }

  /* ═════════════ MAP + POCKET ═════════════ */
  function buildMap() {
    const room = (id, no, name, cls, pos, extra = '') => {
      const g = gById(id), f = g ? Math.min(foundCount(id), g.total()) : 0, t = g ? g.total() : 0;
      return `<button class="room ${cls}${cur === id ? ' here' : ''}" type="button" data-room="${id}" style="grid-area:${pos}"><b>${no}</b><span>${name}</span>${g ? `<small>${S.visited[id] ? `${f} / ${t} found` : 'not visited yet'}</small><span class="bar"><i style="width:${t ? f / t * 100 : 0}%"></i></span>` : extra}</button>`;
    };
    const open = allVisited();
    $('#floorplan').innerHTML =
      room('g1', 'GALLERY 01', 'The Time Capsule', '', '1/1') + room('g2', 'GALLERY 02', 'Our Little Memories', '', '1/2') + room('g3', 'GALLERY 03', 'Things I Love About You', '', '1/3') +
      room('opening', 'ENTRANCE', 'Watch the doors open again', '', '2/1', '<small>replay the welcome</small>') +
      room('hall', 'CENTRE', 'The Grand Hall', 'hall-room-btn', '2/2', `<small>${G.filter(g => S.visited[g.id]).length} of 5 galleries visited</small>`) +
      room('g4', 'GALLERY 04', 'The Little Things', '', '2/3') +
      (S.secret ? room('secret', 'HIDDEN', 'The Secret Exhibition', '', '3/1', '<small>you found it ♡</small>')
                : `<div class="room mystery" style="grid-area:3/1" aria-label="An unmapped room"><b>? ? ?</b><span>Not on the map</span></div>`) +
      room('finale', 'NO. 08', 'The Final Exhibition', open ? '' : 'locked', '3/2', `<small>${open ? 'open ♡' : 'opens after every gallery'}</small>`) +
      room('g5', 'GALLERY 05', 'Our Future Exhibition', '', '3/3');
    const keeps = Object.keys(S.keepsakes).length;
    $('#mapSummary').textContent = `${$('#progressPct').textContent} explored · ${keeps} of ${KEEPSAKES.length} keepsakes`;
  }
  function buildPocket() {
    $('#keepsakes').innerHTML = KEEPSAKES.map(k => {
      const has = !!S.keepsakes[k.id];
      let desc = has ? k.desc : k.hint;
      if (k.id === 'key' && has && S.secret) desc = 'It opened the painting in the Grand Hall.';
      return `<li class="${has ? '' : 'missing'}"><span class="ks-ico">${ART.keepsake[k.id]}</span><div><b>${has ? esc(k.name) : 'Not found yet'}</b><small>${esc(desc)}</small></div></li>`;
    }).join('');
  }

  /* ═════════════ MODALS ═════════════ */
  let lastFocus = null;
  function openModal(m) {
    if (!m.hidden && !m.classList.contains('closing')) return;
    lastFocus = document.activeElement; m.classList.remove('closing'); m.hidden = false;
    const f = m.querySelector('.btn, .x, button'); if (f) setTimeout(() => f.focus({ preventScroll: true }), 50);
  }
  function closeModal(m) {
    if (m.hidden || m.classList.contains('closing')) return;
    m.classList.add('closing');
    setTimeout(() => { m.hidden = true; m.classList.remove('closing'); }, reduce ? 50 : 650);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function closeAllModals() { $$('.modal').forEach(m => { if (!m.hidden) { m.hidden = true; m.classList.remove('closing'); } }); forceCloseKeep(); }

  /* ═════════════ WIRING ═════════════ */
  function fillText() {
    $$('[data-c]').forEach(el => { const v = get(el.dataset.c); if (typeof v === 'string') el.textContent = clean(v); });
  }
  function wire() {
    $('#enterBtn').addEventListener('click', enterMuseum);
    document.addEventListener('click', e => {
      const go = e.target.closest('[data-go]'); if (go) { e.preventDefault(); travel(go.dataset.go, { origin: go }); return; }
      const c = e.target.closest('[data-close]'); if (c) { closeModal(c.closest('.modal')); }
    });
    $('#mapBtn').addEventListener('click', () => { buildMap(); openModal($('#mapModal')); AUDIO.sfx('soft'); });
    $('#pocketBtn').addEventListener('click', () => { buildPocket(); openModal($('#pocketModal')); AUDIO.sfx('soft'); });
    $('#floorplan').addEventListener('click', e => {
      const r = e.target.closest('[data-room]'); if (!r) return; const id = r.dataset.room;
      if (id === 'opening') return replayOpening();
      if (id === 'finale' && !allVisited()) { toast(clean(M.hall.finaleLocked)); return; }
      closeModal($('#mapModal')); setTimeout(() => travel(id, { origin: null }), 150);
    });
    const mb = $('#musicBtn');
    const syncMusic = () => { mb.setAttribute('aria-pressed', String(!AUDIO.muted)); mb.setAttribute('aria-label', AUDIO.muted ? 'Unmute music' : 'Mute music'); };
    mb.addEventListener('click', () => { AUDIO.start(); AUDIO.toggle(); syncMusic(); toast(AUDIO.muted ? 'Music off' : 'Music on ♫', 1600); });
    syncMusic();
    let armed = 0;
    $('#resetBtn').addEventListener('click', e => {
      const b = e.currentTarget;
      if (Date.now() - armed > 4000) { armed = Date.now(); b.textContent = 'Tap again to reset everything'; b.classList.add('confirm'); setTimeout(() => { b.textContent = 'Start the visit over'; b.classList.remove('confirm'); }, 4000); return; }
      try { localStorage.removeItem(KEY); } catch (err) {}
      location.reload();
    });
    $('#replayFinale').addEventListener('click', () => { AUDIO.sfx('whoosh'); playFinale(); });
    $('#finEnv').addEventListener('click', openFinaleLetter);
    $('#kvClose').addEventListener('click', closeKeep);
    $('#keepView').addEventListener('click', e => { if (e.target.closest('[data-kv-close]')) closeKeep(); });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      const open = $$('.modal').filter(m => !m.hidden); if (open.length) { closeModal(open[open.length - 1]); return; }
      if (keepOpen > -1) { closeKeep(); return; }
      if (cur !== 'hall' && cur !== 'opening' && !busy) travel('hall');
    });
    document.addEventListener('load', e => { if (e.target instanceof HTMLImageElement) e.target.classList.add('loaded'); }, true);
    // image fallback: if a photo path is wrong, show a labelled frame instead of a broken image
    document.addEventListener('error', e => {
      const img = e.target; if (!(img instanceof HTMLImageElement) || img.dataset.failed) return; img.dataset.failed = '1';
      const box = img.parentElement, div = document.createElement('div');
      div.style.cssText = 'display:grid;place-items:center;width:100%;height:100%;padding:1rem;text-align:center;font-size:.8rem;color:#a2557a;background:repeating-linear-gradient(45deg,#fff5f8 0 10px,#fdeef3 10px 20px)';
      div.textContent = 'Photo not found: ' + img.getAttribute('src'); box.replaceChild(div, img);
    }, true);
  }

  function init() {
    fillText(); buildOpening(); buildHall(); buildG1(); buildG2(); buildG3(); buildG4(); buildG5();
    wire(); updateProgress();
    $$('img.fade').forEach(i => { if (i.complete && i.naturalWidth) i.classList.add('loaded'); });
    FX.init($('#fx')); FX.mode('opening');
    const ready = () => document.body.classList.remove('is-loading');
    Promise.race([Promise.all([document.fonts ? document.fonts.ready : 0, wait(900)]), wait(3000)]).then(ready);
  }
  init();
})();
