/* Ambient music + soft sound effects, all generated in the browser.
   Set MUSEUM.music.src in content.js to use your own .mp3 instead of the music box. */
(function () {
  let ctx = null, master, musicBus, sfxBus, delay, timer = null, started = false, audioEl = null;
  let muted = false, boxVol = 0, ducked = false;
  try { muted = localStorage.getItem('museum8-muted') === '1'; } catch (e) {}

  const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
  // F major, gentle loop: Fmaj7 · Dm7 · B♭maj7 · Csus2→C
  const CHORDS = [
    { pad: [53, 57, 60, 64], tones: [65, 69, 72, 76, 77, 81] },
    { pad: [50, 53, 57, 60], tones: [62, 65, 69, 72, 74, 77] },
    { pad: [46, 50, 53, 57], tones: [65, 70, 74, 77, 81, 82] },
    { pad: [48, 52, 55, 62], tones: [67, 72, 74, 76, 79, 84] }
  ];
  const BEAT = 60 / 66, STEPS = 8; // eighth notes, 8 per chord (one bar of 4/4)
  let step = 0, nextTime = 0;

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 1;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    master.connect(comp).connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = 0;
    sfxBus = ctx.createGain(); sfxBus.gain.value = .55;
    delay = ctx.createDelay(1); delay.delayTime.value = BEAT * 0.75;
    const fb = ctx.createGain(); fb.gain.value = .32; const wet = ctx.createGain(); wet.gain.value = .28;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    delay.connect(fb).connect(lp).connect(delay); delay.connect(wet).connect(master);
    musicBus.connect(master); musicBus.connect(delay); sfxBus.connect(master); sfxBus.connect(delay);
    document.addEventListener('visibilitychange', () => { if (!ctx) return; document.hidden ? ctx.suspend() : (!muted && ctx.resume()); if (audioEl) document.hidden ? audioEl.pause() : (!muted && audioEl.play().catch(() => {})); });
    return true;
  }

  function bell(freq, t, vol, dur, bus) {
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain();
    o1.type = 'sine'; o2.type = 'sine'; o1.frequency.value = freq; o2.frequency.value = freq * 3.01;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    g2.gain.setValueAtTime(vol * .22, t); g2.gain.exponentialRampToValueAtTime(.0001, t + dur * .35);
    o1.connect(g).connect(bus); o2.connect(g2).connect(bus);
    o1.start(t); o2.start(t); o1.stop(t + dur + .05); o2.stop(t + dur + .05);
  }
  function pad(notes, t, dur) {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = .3;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.045, t + 1.4); g.gain.setValueAtTime(.045, t + dur - .6); g.gain.linearRampToValueAtTime(0, t + dur + .8);
    f.connect(g).connect(musicBus);
    notes.forEach((n, i) => { const o = ctx.createOscillator(); o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = NOTE(n); o.detune.value = (i - 1.5) * 4;
      o.connect(f); o.start(t); o.stop(t + dur + 1); });
  }
  // a little melodic shape over each chord (indexes into chord tones; -1 = rest)
  const SHAPES = [[0, 2, 4, 2, 3, -1, 1, -1], [1, 3, 5, 3, 2, -1, 4, -1], [0, 1, 2, 4, -1, 3, 2, -1], [2, -1, 3, 4, 5, 4, -1, 1]];
  function schedule() {
    while (nextTime < ctx.currentTime + .35) {
      const ci = Math.floor(step / STEPS) % CHORDS.length, s = step % STEPS, ch = CHORDS[ci];
      if (s === 0) { pad(ch.pad, nextTime, BEAT * 4); bell(NOTE(ch.pad[0] - 12), nextTime, .05, 2.6, musicBus); }
      const shape = SHAPES[(Math.floor(step / (STEPS * CHORDS.length)) + ci) % SHAPES.length], idx = shape[s];
      if (idx >= 0 && Math.random() > .12) bell(NOTE(ch.tones[idx]), nextTime + (Math.random() * .012), .075 + Math.random() * .03, 1.9, musicBus);
      nextTime += BEAT / 2; step++;
    }
  }

  function startMusic() {
    const src = (window.MUSEUM && MUSEUM.music && MUSEUM.music.src) || '';
    const vol = (window.MUSEUM && MUSEUM.music && MUSEUM.music.volume) || .5;
    if (src) {
      audioEl = new Audio(src); audioEl.loop = true; audioEl.volume = muted ? 0 : vol;
      audioEl.addEventListener('error', () => { audioEl = null; startBox(vol); });
      audioEl.play().catch(() => {});
      return;
    }
    startBox(vol);
  }
  function startBox(vol) {
    boxVol = vol; if (ducked) { musicBus.gain.value = 0; nextTime = ctx.currentTime + .15; schedule(); timer = setInterval(schedule, 120); return; }
    musicBus.gain.setValueAtTime(0, ctx.currentTime); musicBus.gain.linearRampToValueAtTime(vol, ctx.currentTime + 4);
    nextTime = ctx.currentTime + .15; schedule(); timer = setInterval(schedule, 120);
  }

  const SFX = {
    chime() { const t = ctx.currentTime; bell(NOTE(84), t, .09, 1.4, sfxBus); bell(NOTE(88), t + .09, .07, 1.6, sfxBus); bell(NOTE(91), t + .18, .06, 1.8, sfxBus); },
    soft() { const t = ctx.currentTime; bell(NOTE(81), t, .06, 1.1, sfxBus); },
    pop() { const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
      o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(980, t + .12);
      g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.0001, t + .2); o.connect(g).connect(sfxBus); o.start(t); o.stop(t + .25); },
    whoosh() { const t = ctx.currentTime, len = 1.1, b = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * .5;
      const n = ctx.createBufferSource(); n.buffer = b; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = .8;
      f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(1800, t + .5); f.frequency.exponentialRampToValueAtTime(500, t + len);
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.09, t + .35); g.gain.linearRampToValueAtTime(0, t + len);
      n.connect(f).connect(g).connect(sfxBus); n.start(t); },
    unlock() { const t = ctx.currentTime; [72, 76, 79, 84, 88, 91, 96].forEach((n, i) => bell(NOTE(n), t + i * .08, .07, 1.8, sfxBus)); },
    drawer() { const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle';
      o.frequency.setValueAtTime(140, t); o.frequency.linearRampToValueAtTime(90, t + .18);
      g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.0001, t + .25); o.connect(g).connect(sfxBus); o.start(t); o.stop(t + .3);
      bell(NOTE(86), t + .12, .04, .8, sfxBus); }
  };

  window.AUDIO = {
    get muted() { return muted; },
    start() {
      if (started) return; started = true;
      if (!ctx && !build()) return;
      if (ctx.state === 'suspended') ctx.resume();
      startMusic();
    },
    toggle() {
      muted = !muted;
      try { localStorage.setItem('museum8-muted', muted ? '1' : '0'); } catch (e) {}
      if (ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, .15); if (!muted) ctx.resume(); }
      if (audioEl) { audioEl.volume = (muted || ducked) ? 0 : ((MUSEUM.music && MUSEUM.music.volume) || .5); if (!muted) audioEl.play().catch(() => {}); }
      return muted;
    },
    /* step the museum's music aside (true) or bring it back (false), e.g. while a song plays */
    duck(on) {
      ducked = !!on;
      if (ctx && musicBus) { musicBus.gain.cancelScheduledValues(ctx.currentTime); musicBus.gain.setTargetAtTime(on ? 0 : boxVol, ctx.currentTime, .35); }
      if (audioEl) audioEl.volume = (on || muted) ? 0 : ((window.MUSEUM.music && MUSEUM.music.volume) || .5);
    },
    sfx(name) { if (!ctx || muted || !SFX[name]) return; try { SFX[name](); } catch (e) {} }
  };
})();
