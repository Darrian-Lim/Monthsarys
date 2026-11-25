# The Museum of Us · Month 8 💗

*Eight Months of Little Moments, Endless Memories.*

A little interactive museum made for Karis: a cinematic entrance with opening doors, a Grand Hall with five galleries, a hidden room, and a grand finale.

## Rooms

| Room | What happens there |
| --- | --- |
| Entrance | Twilight sky, glowing museum sign, doors that swing open and pull you inside |
| Grand Hall | A pink rotunda with a swaying crystal chandelier, starry arched windows and a grand staircase. Five doorways show their state: veiled with a little sparkle (not yet explored), lit with progress pips (exploring), or gold with a star (completed). The glass dome is frosted and padlocked until every gallery is visited, then clears and glows. A tiny curator in the corner gives gentle hints (tap it for the next one) |
| Gallery 01 · The Time Capsule | A pink marble cabinet with glass shelves. Each keepsake opens its own way: the letter's seal pops, it slides out, unfolds and is "written" in; the polaroid develops and glows; the calendar is a real little month where the special days are tappable and the pages turn; the record player's lid lifts, the arm swings onto the record, with play/pause, a seek bar and volume; the gift's bow comes undone, the ribbon slips off and the lid lifts |
| Gallery 02 · Our Little Memories | Polaroids hanging on strings, shown at each photo's real proportions. Open a display case and turn each photo over |
| Gallery 03 · Things I Love About You | Ten collectible cards in velvet niches. The rarest card unseals after the other nine |
| Gallery 04 · The Little Things | A cabinet of curiosities. Every drawer holds one little thing. A small brass key glows faintly on its side |
| Gallery 05 · Our Future Exhibition | A night sky of eight stars. Each opens a postcard, and together they draw a heart |
| The Secret Exhibition | Take the key from Gallery 04 and the painting in the Grand Hall starts to glow and rattle. Tap it: it swings away to reveal a little pink door, the key turns, the doors open onto a glowing heart and you walk through into a starlit indigo room |
| The Grand Finale | A quiet night sky, light gathering into a heart while the camera slowly leans in, a pause, "8 Months of Us.", then an envelope she opens herself. The letter unfolds and is written in line by line, then the closing words and a few floating hearts. "Watch it again" replays the whole thing |

## Personalise it

**Everything personal is in `js/content.js`.** You never need to edit `app.js`.

- A text that **starts with ✎** is an empty slot. It shows on the site as a dashed "curator's note" so you can spot it. Replace the whole text with your own words.
- A text that **ends with ✎** is a line written in your voice. It displays normally (the ✎ is hidden). Keep it or rewrite it.
- Texts with no ✎ came from your earlier monthsary pages (your own words).

Slots still waiting for you (search content.js for `'✎`):
1. Gallery 01: the sealed letter (the confession night) and the gift box surprise
2. Gallery 02: notes on the back of four photos (beanie, mid-sip, by the window, hi :))
3. Gallery 04: her smile, an inside joke, something she does without realising
4. Gallery 05: five future ideas are suggestions, swap in your real plans
5. The Secret Exhibition message
6. The Finale message

**The curator's hints** are in `guide` in `js/content.js`.

**Photos:** put a `.webp` or `.jpg` (about 900px on the long side, under ~250 KB) in `assets/images/` and set `photo: 'assets/images/your-file.webp'`. `focus: '50% 30%'` moves which part of the photo stays in frame. If a path is wrong, the site shows "Photo not found: …" instead of a broken image.

**Time Capsule keepsakes (Gallery 01):** edit `timeCapsule.keepsakes` in `js/content.js`. Each entry has a `type` (`letter`, `photo`, `calendar`, `music` or `gift`) and its own fields; the comment above the list shows them. Add, remove or reorder entries freely (4 to 6 look best). The calendar takes as many `dates` as you like. The music player plays the `.mp3` in `src`; it currently points at `../6thMonth/audio/voyager.mp3`, so keep the `6thMonth/` folder in the repo or change the path.

**Music:** to use a real song instead of the music box, drop an mp3 in `assets/audio/` and set `music: { src: 'assets/audio/our-song.mp3', volume: 0.5 }`.

**Testing again from scratch:** open the map and tap "Start the visit over" (tap twice). This clears the saved progress in that browser.

## Run locally

Double-click `index.html`. It works straight from your files: no server and no build step.

## Deploy (GitHub Pages)

Upload the whole `8thMonth/` folder to the root of the Monthsarys repo, next to `7thMonth/`. Live at:
`https://darrian-lim.github.io/Monthsarys/8thMonth/`

## Files

- `index.html`: the page.
- `css/museum.css`: shared styles, entrance, HUD, map and pocket.
- `css/galleries.css`: Galleries 02 to 05.
- `css/capsule.css`: Gallery 01, the Time Capsule, and its keepsake overlay.
- `css/scenes.css`: the Grand Hall, the curator, the secret doorway, the secret exhibition and the finale.
- `js/content.js`: everything personal.
- `js/app.js`: how it all works. `js/art.js`: the drawings. `js/fx.js`: particles. `js/audio.js`: music and sounds.
- `assets/images/`: the photos.

## Technical notes

- Plain HTML, CSS and JavaScript (no frameworks, no modules), so every path is relative and it works on GitHub Pages and from `file://`.
- Fonts (Fraunces, Nunito, Caveat) come from Google Fonts, with system fallbacks if offline.
- One shared particle canvas with a capped pixel ratio, paused when the tab is hidden; reduced-motion settings are respected.
- Tested at 390×844 (phone) and 1440×900 (desktop), including reduced-motion, saved progress after reload and the reset, with no console errors.
