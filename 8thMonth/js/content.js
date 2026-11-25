/* ═══════════════════════════════════════════════════════════════════════════
   THE MUSEUM OF US · Month 8
   ---------------------------------------------------------------------------
   EVERYTHING PERSONAL LIVES IN THIS FILE. You never need to touch app.js.

   ✎ at the START of a text  = an empty slot. It shows on the site as a dashed
                               "curator's note" so you can spot it. Replace it.
   ✎ at the END of a text    = a line I wrote in your voice. It displays normally
                               (the ✎ is hidden). Keep it or rewrite it.
   Lines with no ✎ came from your earlier monthsary pages: your own words.

   Photos: drop a .webp/.jpg into assets/images/ and put its path in `photo`.
           Keep each under ~250 KB (900px on the long side is plenty).
           Leave photo: '' for an illustrated frame instead.
   Tip: a blank line inside a text ("\n\n") starts a new paragraph.
   ═══════════════════════════════════════════════════════════════════════════ */

window.MUSEUM = {

  her: 'Karis',
  me: 'Darrian',
  since: '2026-04-08',            // the day it all began (used for the live counter)
  monthsary: 8,

  /* ── Opening ──────────────────────────────────────────────────────────── */
  opening: {
    welcome: 'Welcome, Karis.',
    line: 'Every little moment we’ve shared deserves a place in this museum.',
    button: 'Enter Our Museum ♡',
    plaque: 'EST. 8 APRIL 2026'
  },

  /* ── Grand Hall ───────────────────────────────────────────────────────── */
  hall: {
    kicker: 'THE GRAND HALL',
    title: 'Five galleries. One story.',
    hint: 'Choose a doorway to begin. Some things in here are hidden, so look closely.',
    finaleLocked: 'The final exhibition opens once you’ve visited every gallery.',
    finaleOpen: 'The final exhibition is open ♡'
  },

  /* ── The little curator in the Grand Hall ─────────────────────────────── */
  // A tiny guide who gives gentle hints. Tap it in the Grand Hall to hear the next one.
  // {g} is replaced with the name of a gallery she hasn't visited yet.
  guide: {
    name: 'The Curator',
    hello: 'Hi Karis! I look after this museum. Pick any doorway you like.',
    next: '{g} is still waiting for you.',
    keyHint: 'Have you looked closely at the cabinet in Gallery 04? Something small is hanging there.',
    paintingHint: 'That little key in your pocket… I think the painting by the wall has a keyhole.',
    finale: 'Every gallery visited. The glass dome is glowing now. It’s ready for you.',
    done: 'You’ve seen everything. I’ll keep it all safe here. Come back any time ♡'
  },

  /* ── GALLERY 01 · The Time Capsule ────────────────────────────────────── */
  // A glass cabinet of keepsakes. Each keepsake opens with its own animation.
  // Add, remove or reorder entries in `keepsakes` (4 to 6 look best).
  //   type: 'letter' | 'photo' | 'calendar' | 'music' | 'gift'
  //   name: the little label under the keepsake in the cabinet
  //
  //   letter   → date, title, text, sign
  //   photo    → date, title, photo, alt, focus, text
  //   calendar → title, dates: [{ date: 'YYYY-MM-DD', label, text }]  (as many as you like)
  //   music    → heading, title (song name), artist, src (path to an .mp3), text
  //   gift     → title, text
  timeCapsule: {
    title: 'Some moments are too precious to leave behind.',
    subtitle: 'So I kept a little piece of them here, just for us.',
    hint: 'Tap a keepsake to take it out of the capsule.',
    plaque: 'THE TIME CAPSULE · SEALED 8 APRIL 2026',
    keepsakes: [
      { type: 'letter', name: 'A sealed letter',
        date: 'That night', title: 'The confession',
        text: 'You, confessing that night.\n\nI still remember how fast my heart was beating. I was so shocked when you said it, and I think I said “omg” about ten times.',
        sign: '— Dummy ♡' },

      { type: 'photo', name: 'A photograph',
        date: '8 April 2026', title: 'Our first date',
        photo: 'assets/images/first-date-flowers.webp',
        alt: 'Karis among the flowers at Gardens by the Bay on our first date', focus: '50% 40%',
        text: 'Gardens by the Bay. The day it officially became us.\n\nIt started with a “good morning bb” from you at 8:00 AM, and I felt really happy that whole day.' },

      { type: 'calendar', name: 'A little calendar',
        title: 'Dates I never want to forget',
        dates: [
          { date: '2026-02-10', label: 'The first “let’s jam”',
            text: 'The very first jam session. Neither of us knew it was the start of something.' },
          { date: '2026-02-15', label: 'The tater tots · 5:21 PM',
            text: 'You were reheating yesterday’s tater tots, and I told you not to burn yourself.' },
          { date: '2026-04-08', label: 'Our first date',
            text: 'Gardens by the Bay. The day it officially became us.' },
          { date: '2026-07-17', label: '100 days',
            text: '100 days in, and it was still my favourite part of the day to text you good morning. It still is. ♡' },
          { date: '2026-10-08', label: 'Six months',
            text: 'The Science Centre, potat for lunch, and looking for a dress for you together.' },
          { date: '2026-12-08', label: 'Eight months',
            text: 'Right now. You, opening this capsule.' }
        ] },

      // src points at the song already in your 6th-month folder. Use any .mp3 you like,
      // e.g. 'assets/audio/our-song.mp3'. Leave src: '' to show the record without a play button.
      { type: 'music', name: 'A music player',
        heading: 'Our song', title: 'Voyager', artist: 'Xdinary Heroes', src: '../6thMonth/audio/voyager.mp3',
        text: 'It all started with a “let’s jam”, and we still do them every now and then. Every single one still feels a little bit like the first. ✎' },

      { type: 'gift', name: 'A gift box',
        title: 'One more thing',
        text: 'A coupon, redeemable whenever we’re both free: one slow day planned completely around you. Your favourite food, no rushing out the door, and me all yours from morning till night.\n\nThis is the newest keepsake. There’s room in this capsule for a lot more. ✎' }
    ]
  },

  /* ── GALLERY 02 · Our Little Memories ─────────────────────────────────── */
  // Polaroids hanging in the gallery. `caption` is the handwritten line on the
  // front, `note` is what’s written on the back when she opens the case.
  memories: {
    title: 'Our Little Memories',
    intro: 'Tap a photo to open its display case. Every polaroid has something written on the back.',
    items: [
      { photo: 'assets/images/first-date-gardens.webp', alt: 'Mirror selfie at Gardens by the Bay', focus: '50% 30%',
        caption: 'our first date ♡', date: '8 April 2026',
        note: 'The first photo of us. I still look at it more than I’d admit. ✎' },
      { photo: 'assets/images/karis-beanie.webp', alt: 'Karis in a black beanie and round glasses', focus: '50% 40%',
        caption: 'beanie day', date: '',
        note: 'I remember loving this pic so much because of how cute you looked in it.' },
      { photo: 'assets/images/science-centre.webp', alt: 'A kiss on the cheek at the Science Centre', focus: '50% 40%',
        caption: 'science centre', date: '8 October 2026',
        note: 'Six months. Potat for lunch, then dress hunting. A perfect day.' },
      { photo: 'assets/images/karis-drink.webp', alt: 'Karis eating a cheese stick', focus: '50% 35%',
        caption: 'mid cheese stick', date: '',
        note: 'You and your cheese sticks.' },
      { photo: 'assets/images/us-smiling.webp', alt: 'The two of us smiling in a selfie', focus: '50% 50%',
        caption: 'us :)', date: '22 September 2026',
        note: 'Both of us smiling like this. One of my favourite pictures of us. ✎' },
      { photo: 'assets/images/karis-closeup.webp', alt: 'A close-up of Karis in round glasses', focus: '50% 45%',
        caption: 'hi :)', date: '',
        note: 'ehe, forehead.' },
      { photo: '', alt: '', caption: 'reserved', date: '8 December 2026',
        note: 'This frame is saved for the next memory we make. Maybe today’s. ✎' }
    ]
  },

  /* ── GALLERY 03 · Things I Love About You ─────────────────────────────── */
  // The LAST card in this list is the rare golden one. It stays sealed until
  // every other card has been opened.
  reasons: {
    title: 'Things I Love About You',
    intro: 'A collection of rare cards. Tap one to lift it out of its case.',
    cards: [
      'You listen to understand, not just to answer.',
      'The exact look on your face right before you start laughing.',
      'You hold space for my thoughts even when they’re half-formed.',
      'The way you make ordinary places feel like somewhere worth staying.',
      'You never make me feel silly for caring deeply about small things.',
      'You make the quiet hours feel full instead of lonely.',
      'You let me ramble about things you don’t even care about.',
      'You are remarkably patient with me, even when I’m indecisive.',
      'Being around you feels like coming home.',
      'Loving you is the easiest choice I make every single day.'
    ],
    rareLabel: 'THE RAREST CARD'
  },

  /* ── GALLERY 04 · The Little Things ───────────────────────────────────── */
  // A cabinet of curiosities. Each drawer opens to show a little object + note.
  // object: 'chat' | 'glasses' | 'smile' | 'bubble' | 'phone' | 'school' | 'fries' | 'guitar' | 'band'
  littleThings: {
    title: 'The Little Things',
    intro: 'Small things that might seem ordinary. To me, they belong in a museum.',
    drawers: [
      { label: 'Our conversations', object: 'chat',
        text: 'We stopped filling silences. That was the month I knew.',
        sub: '265,171 messages since February. I didn’t want to miss a single one. ✎' },
      { label: 'The long calls', object: 'phone',
        text: 'You fell asleep talking and I stayed on the line.',
        sub: 'Sometimes with your camera still on. I never minded.' },
      { label: 'Your usual order', object: 'fries',
        text: 'Potato Corner for lunch: cheese sticks and tater tots.',
        sub: 'And Pastamania for dinner. I could order for you with my eyes closed. ✎' },
      { label: 'Your smile', object: 'smile',
        text: 'It changes the whole room for me in half a second.',
        sub: '' },
      { label: 'Your rubber band', object: 'band',
        text: 'I took your rubber band all the way to Shenzhen, and slept next to it.',
        sub: 'A rubber band for a hoodie. Awesome trade. Next time I’m bringing you instead.' },
      { label: 'Things you do without realising', object: 'glasses',
        text: 'All the small things you do without even noticing. They get cuter every time.',
        sub: '' },
      { label: 'After school', object: 'school',
        text: 'Me, sending you home after school.',
        sub: 'The walk was never long enough. ✎' },
      { label: 'The jam sessions', object: 'guitar',
        text: 'The jam sessions we do every now and then.',
        sub: 'Still one of my favourite things we do. ✎' }
    ]
  },

  /* ── GALLERY 05 · Our Future Exhibition ───────────────────────────────── */
  // Stars on the night map. kind: 'place' | 'date' | 'dream'
  // The places and dates below are real plans from your chat with her.
  future: {
    title: 'Our story isn’t finished.',
    subtitle: 'There’s still so much waiting for us.',
    intro: 'Each star is something still to come. Tap them to draw our constellation.',
    stars: [
      { kind: 'place', title: 'Genting', text: 'Our first overseas trip together. I said somewhere to photoshoot, you said somewhere close, and we both landed on Genting. You said “we shall plan this out next time”. So let’s plan it.' },
      { kind: 'date',  title: 'The beach', text: 'I’ve only been when I was too small to remember any of it. You said “isokay, we go tgt”. So we will.' },
      { kind: 'dream', title: 'Many more monthsaries', text: 'My biggest wish is that we get to celebrate many more little milestones together.' },
      { kind: 'date',  title: 'A photobooth', text: 'You said we should take one in a photobooth, and that one day you want to set it as our pfp.' },
      { kind: 'place', title: 'Japan or China', text: 'You said “i can’t wait for us to go overseas tgt” and asked where I’d want to go first. My answer: Japan or China.' },
      { kind: 'dream', title: 'More little moments', text: 'I hope we keep finding happiness in the simplest moments, even when we’re doing absolutely nothing.' },
      { kind: 'date',  title: 'USS', text: '“okay next time we go uss.” I said okay, and I meant it.' },
      { kind: 'dream', title: 'Our first anniversary', text: '8 April 2027. I’m already looking forward to it.' }
    ]
  },

  /* ── The Secret Exhibition (hidden) ───────────────────────────────────── */
  secret: {
    kicker: 'YOU FOUND THE SECRET EXHIBITION',
    title: 'The room that isn’t on the map',
    text: 'If you found this behind the painting, it means you looked in the one place most people wouldn’t. I hid a little piece of you in every corner of this museum, even the ones nobody checks.\n\nYou’re still my favourite secret, and my favourite person to come back to.',
    sign: '— Dummy ♡'
  },

  /* ── The Grand Finale ─────────────────────────────────────────────────── */
  finale: {
    title: '8 Months of Us.',
    line: 'Eight months, countless memories, and so many more moments waiting to be made.',
    message: 'Eight months in, and what gets me most isn’t everything we’ve done. It’s how easy being with you still feels.\n\nThank you for every laugh, every quiet moment, every long talk when things were hard, and for letting me keep loving you day after day.\n\nHere’s to eight months, and so many more after this.',
    thanks: 'Thank you for being part of my story, Karis.',
    end: 'Happy 8th Monthsary, my love. ♡',
    sign: 'Yours, Darrian'
  },

  /* ── Music ────────────────────────────────────────────────────────────── */
  // By default a soft music-box melody is generated in the browser (no file needed).
  // To use a real song instead, put an .mp3 in assets/audio/ and set src, e.g.
  //   src: 'assets/audio/our-song.mp3'
  music: { src: '', volume: 0.5 }
};
