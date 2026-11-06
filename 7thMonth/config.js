// ─────────────────────────────────────────────────────────────
// Everything you'd want to edit lives here: text, colors, timing,
// camera positions, music. Nothing personal is hard-coded elsewhere.
// ─────────────────────────────────────────────────────────────
export const CONFIG = {
  title: {
    eyebrow: 'MONTH 7',
    main: 'Cloud Nine',
    tagline: 'The Grand Little Celebration',
    subline: 'A little world made for you.',
    button: 'Let’s go!',
  },
  mascot: { internalName: 'Cloud Cat', displayName: null }, // displayName is optional, decide later
  devHints: true,                       // set false before sharing; shows "what's next" notes
  devHint: 'Next up: the celebration machine.',

  timing: { glide: 8, titleAt: 4.4, fly: 3.2 },   // seconds

  // Camera waypoints: pos = where the camera is, look = what it faces.
  cam: {
    start:     { pos: [-8, 9, 52], look: [0, 4, -4] },
    glidePath: [[-8, 9, 52], [-5, 7, 38], [1, 5, 26], [5.4, 3.5, 15.5]],
    rest:      { pos: [5.4, 3.5, 15.5], look: [0.4, 2, 0] },
    island:    { pos: [3.8, 2.6, 9.6], look: [0.5, 1.6, 0] },
  },

  // Sky stages. "day" is used now; "sunset" is reserved for the finale.
  sky: {
    day:    { top: '#8ea6ff', mid: '#cdb4ff', hor: '#ffc8e6', glow: '#ffe6b0', str: 0.55, fog: '#e9c9f3', key: '#fff1dc' },
    sunset: { top: '#6f7fe0', mid: '#e9a3d6', hor: '#ffb38a', glow: '#ffd27a', str: 1.0,  fog: '#f6b9c8', key: '#ffd3a1' },
  },

  colors: { seven: '#ff86c0', gifts: ['#a98cff', '#ff9ccf', '#7ec8ff'], balloons: ['#ff86c0', '#b79cff', '#ffd36e'], heart: '#7ec8ff' },

  music: { src: '', volume: 0.5 },   // put your mp3 in assets/audio/ and set e.g. 'assets/audio/song.mp3' (wired up in a later step)
};
