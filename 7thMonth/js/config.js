// Edit this file to personalize Cloud Nine. Keep personal memories truthful.
export const CONFIG = {
  title: { eyebrow: 'MONTH 7 · MONTHSARY', main: 'Cloud Nine', tagline: 'The Grand Little Celebration', subline: 'A little world made just for you.', button: "Let's go!" },
  mascot: { internalName: 'Cloud Cat', displayName: null },
  devHints: false,
  timing: { glide: 6.5, titleAt: 3.6, fly: 2.1 },
  cam: {
    start: { pos: [-9, 10, 54], look: [0, 4, -4] },
    glidePath: [[-9, 10, 54], [-6, 8, 39], [0, 6, 26], [4.5, 4, 16]],
    rest: { pos: [4.5, 4, 16], look: [0.4, 2.5, 0] },
    island: { pos: [3.8, 3.6, 10.6], look: [0.5, 2.7, 0] },
    finale: { pos: [0, 12, 27], look: [0, 2, -1] }
  },
  sky: {
    day: { top: '#8ea6ff', mid: '#cdb4ff', hor: '#ffc8e6', glow: '#ffe6b0', str: .22, fog: '#e9c9f3', key: '#fff1dc' },
    sunset: { top: '#777fdb', mid: '#efa7d5', hor: '#ffbd9a', glow: '#ffd27a', str: .95, fog: '#f6c3d8', key: '#ffd3a1' }
  },
  colors: { seven: '#ff86c0', gifts: ['#a98cff', '#ff9ccf', '#7ec8ff', '#ffd36e'], balloons: ['#ff86c0', '#b79cff', '#ffd36e'], heart: '#ff86c0' },
  personal: {
    memoryTitle: 'A little memory',
    memoryText: '10 February 2026: the first “let’s jam”. 15 February 2026, 5:21 PM: you were reheating yesterday’s tater tots, and I told you not to burn yourself.',
    memoryPhoto: '',   // optional, e.g. 'assets/images/memory-01.webp' (keep it under ~200 KB)
    // Memories (shown in order, with a "Next memory" button). Add photos by dropping a small WebP in assets/images/
    // and setting photo, e.g. 'assets/images/memory-02.webp' (keep each under ~200 KB). Leave '' for text only.
    memories: [
      { date: '8 April 2026', photo: 'assets/images/memory-02.webp', alt: 'The two of us at Gardens by the Bay', focus: '50% 22%',
        text: 'Our first date, at Gardens by the Bay. It started with a “good morning bb” from you at 8:00 AM, and I felt really happy that whole day.' },
      { date: '8 October 2026', photo: 'assets/images/memory-03.webp', alt: 'A kiss on the cheek at the Science Centre', focus: '50% 40%',
        text: 'Our 6th monthsary. We went to the Science Centre, ate potat for lunch and looked for a dress for you together.' },
    ],
    finalMessage: '[WRITE MY PERSONAL MONTHSARY MESSAGE HERE]'
  },
  // ── The Little Awards (replaces the old Inside Jokes island) ─────────────────────────────
  // Everything shown on that island is edited here. Add, remove or reorder entries in `list`
  // (5–8 works best; the stage rearranges itself). Keep the wording true to the two of you.
  //   icon: the little topper floating above the trophy → 'star' | 'heart' | 'sparkle' | 'flower' | 'crown'
  awards: {
    banner: 'THE LITTLE AWARDS',
    welcome: {
      kicker: 'THE LITTLE AWARDS 🏆',
      title: 'WELCOME TO THE LITTLE AWARDS',
      text: 'Tonight’s most important guest: YOU. Tap any trophy, or let’s begin the ceremony.',
      start: 'Start the ceremony 🏆'
    },
    list: [
      { title: 'Professional Cuteness Award',   text: 'For being effortlessly adorable.',                      icon: 'star' },
      { title: 'CEO of Making My Day Better',   text: 'For making ordinary days feel special.',                icon: 'crown' },
      { title: 'Best Good Morning Messenger',   text: 'For making mornings a little nicer.',                   icon: 'sparkle' },
      { title: 'World’s Most Precious Human',   text: 'A very serious award for a very important person.',     icon: 'heart' },
      { title: 'Best Person to Spend Time With', text: 'For making even simple moments enjoyable.',            icon: 'flower' },
      { title: 'Certified Mood Booster',        text: 'For bringing happiness into everyday moments.',         icon: 'sparkle' },
      { title: 'Lifetime Achievement Award',    text: 'For being Karis.',                                      icon: 'star' }
    ],
    final: {
      kicker: 'THE MOST IMPORTANT AWARD',
      title: 'Presented to: KARIS 💗',
      plaque: 'KARIS ♥',            // text engraved on the big podium (keep it short)
      text: 'Thank you for being part of these seven months. This little ceremony wouldn’t exist without you.'
    },
    labels: {
      prev: '‹ Previous', next: 'Next award ›', final: 'The final award 💗', replay: 'Replay the awards 🏆',
      celebrate: 'Final celebration 💗', back: 'Back to the islands',
      locked: 'The most important award is saved for last. Visit every trophy first 💗',
      unseen: 'A few awards are still waiting for you…'
    }
  },
  // ── Wish Upon a Cloud (replaces the old Surprise island) ─────────────────────────────────
  // Every word on that island is edited here. `list` holds the floating clouds (4–6 works best).
  //   icon:   emoji shown on the wish panel
  //   color:  the cloud's colour
  //   symbol: the little decoration floating on the cloud → 'island' | 'bounceStars' | 'hearts' | 'moonStars' | 'sevenStars'
  // In `final.text`, a blank line starts a new paragraph.
  wishes: {
    welcome: {
      kicker: 'WISH UPON A CLOUD ☁️',
      title: 'WISH UPON A CLOUD',
      text: 'Some little wishes for everything still to come.',
      start: 'Start wishing ☁️'
    },
    hint: 'Tap a cloud to discover a wish',
    counter: '{n} of {total} discovered',
    list: [
      { icon: '🌷', title: 'MORE ADVENTURES',        color: '#d9eeff', symbol: 'island',
        text: 'I hope we get to discover more places together, try new things, and collect little memories along the way.' },
      { icon: '☀️', title: 'MORE LAUGHTER',          color: '#fff1a6', symbol: 'bounceStars',
        text: 'I hope we never run out of silly conversations, random laughter, and reasons to smile.' },
      { icon: '💗', title: 'MORE LITTLE MOMENTS',    color: '#ffc4df', symbol: 'hearts',
        text: 'I hope we continue finding happiness in the simplest moments, even when we’re doing absolutely nothing.' },
      { icon: '⭐', title: 'MORE DREAMS TO SHARE',   color: '#dfd2ff', symbol: 'moonStars',
        text: 'I hope we keep supporting each other and discovering all the things we want to experience.' },
      { icon: '🎀', title: 'MANY MORE MONTHSARIES',  color: '#ffe6a3', symbol: 'sevenStars',
        text: 'My biggest wish is that we get to celebrate many more little milestones together.' }
    ],
    final: {
      icon: '💗', cloudTitle: 'ONE LAST WISH...', color: '#ffd9b8',
      kicker: 'THE LAST WISH', title: 'ONE LAST WISH...',
      text: 'Out of all the wishes I could make, I’m just really happy that I get to share these seven months with you.\n\nHere’s to all the little moments and adventures still waiting for us.\n\nHappy 7th Monthsary, Karis. 💗'
    },
    labels: {
      close: 'Back to the clouds ☁️', back: 'Back to the islands', celebrate: 'Final celebration 💗',
      finalAppears: 'Something is glowing above the wishing platform ✨',
      hintFinal: 'Tap the glowing cloud for one last wish ✨',
      hintDone: 'All the wishes are yours 💗 Tap any cloud to read it again'
    }
  },
  music: { src: '', volume: .45 }
};