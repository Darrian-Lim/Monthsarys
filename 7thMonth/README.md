# Cloud Nine — Month 7 ☁️💗

A cheerful, interactive pastel 3D world for a seventh-monthsary celebration. It includes floating islands, a glossy number 7, Cloud Cat, an animated gift with a little heart surprise, three explorable islands (Memories, The Little Awards, Wish Upon a Cloud), confetti, optional sound effects, and a personalized finale.

## Run locally

**Easiest:** double-click `open-without-server.html`. It uses a pre-built copy of the scripts (`dist/cloud-nine.js`), so it works straight from your files with no server.

> If you edit anything in `js/`, `open-without-server.html` will not change until the bundle is rebuilt:
> `npx esbuild js/main.js --bundle --minify --format=iife --alias:three=./vendor/three.module.min.js --outfile=dist/cloud-nine.js`

`index.html` loads `js/` directly (needs a server or GitHub Pages) and always reflects your edits. From the folder that contains `7thMonth/`, run `python -m http.server 8000` and open `http://localhost:8000/7thMonth/`. On GitHub Pages, upload the `7thMonth/` folder as-is.

## Personalize it

Edit `js/config.js`:

- `memoryText`: a real memory and date.
- `memoryPhoto`: optional relative path, such as `assets/images/memory-01.webp`.
- `awards`: everything on The Little Awards island: banner text, welcome message, the list of awards (`title`, `text`, `icon`), the final award, and button labels.
- `wishes`: everything on the Wish Upon a Cloud island: welcome text, the list of wishing clouds (`title`, `text`, `icon`, `color`, `symbol`), the final wish, and button labels.
- `finalMessage`: your own monthsary message.
- `mascot.displayName`: optional displayed name for Cloud Cat.

Replace placeholder text with real details. The website intentionally does not invent personal memories.

## Controls

- Click **Let's go!** to enter Cloud Nine.
- Choose **Open the big gift** to trigger the gift-opening animation and reveal the little heart.
- Choose **Explore the islands** to visit Memories, The Little Awards, and Wish Upon a Cloud.
- Close a panel with its close button or Escape. Use the Menu button to return to the main island.
- Sound effects are off by default; use the sound toggle to enable them.

## Before publishing

- Replace the sample text and add any personal images.
- Test the opening, gift, all three islands, return-to-home, and finale on desktop and mobile.
- Check the browser console for errors.
- Verify any personal image paths are correct.

## Technical notes

- Three.js is included locally in `vendor/`; the normal local-server/GitHub Pages version does not require a CDN.
- The renderer caps pixel ratio for performance.
- Reduced-motion preferences are respected.
- Sound effects are synthesized locally; no audio files are required.

## Gift model update

The main present now uses rounded geometry with satin bands placed on the outer faces, and a lid that pivots from the back edge. The heart starts inside the box and rises above the rim during the opening animation. If you change the gift size, adjust `hiddenY` and `revealY` in `js/stage.js` together with the reveal animation in `js/scenes.js`.

## The Little Awards

The old Inside Jokes island is now a miniature award ceremony (`js/awards.js`). Cloud Cat presents a row of small gold trophies on numbered podiums; a spotlight follows the selected award, the trophy rises and shines, and a few stars pop. Tap a trophy in the 3D scene, or use Previous / Next. The big pink podium in front stays sealed ("?") until every award has been seen, then reveals THE MOST IMPORTANT AWARD.

- Edit, add or remove awards in `awards.list` in `js/config.js` (5-8 works best; the stage rearranges itself). `icon` can be `star`, `heart`, `sparkle`, `flower` or `crown`.
- The final award text and the name on the big podium are `awards.final` (`plaque` is the engraved text).
- The sample award wording is placeholder-style and intentionally generic; replace it with things that are true for you two.
- After editing anything in `js/`, rebuild the bundle (command above) so `open-without-server.html` picks it up.

## Wish Upon a Cloud

The old Surprise island is now a peaceful wishing island (`js/wishes.js`). Five little clouds float above a glowing wishing platform while Cloud Cat watches from a cloud seat. Tap a cloud and it drifts to the centre, brightens and opens, and its wish appears in the panel. Wishes can be opened in any order; the hint pill at the bottom shows how many have been discovered. After all five, a larger golden-pink cloud ("ONE LAST WISH...") appears above the platform; opening it releases a heart-shaped light and shows the final message.

- Edit, add or remove wishes in `wishes.list` in `js/config.js` (4-6 clouds work best). `symbol` can be `island`, `bounceStars`, `hearts`, `moonStars` or `sevenStars`; `color` sets the cloud's colour; `icon` is the emoji on the panel.
- The final message is `wishes.final.text` (a blank line starts a new paragraph).
- Closing the panel (button, ×, or Esc) sends the cloud back to its place, and clouds stay tappable.
