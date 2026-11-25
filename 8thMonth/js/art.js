/* Little hand-drawn style illustrations (inline SVG), shared by every room. */
(function () {
  const H = 'M50 92C20 72 4 52 4 32 4 16 16 6 29 6c9 0 16 5 21 12 5-7 12-12 21-12 13 0 25 10 25 26 0 20-16 40-46 60z';
  const svg = (vb, body) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
  const heart = (x, y, s, fill) => `<path d="${H}" transform="translate(${x} ${y}) scale(${s})" fill="${fill}"/>`;

  const A = {};

  /* ── arch emblems (Grand Hall doorways) ── */
  A.emblem = {
    g1: svg('0 0 120 120', `<rect x="26" y="98" width="68" height="12" rx="5" fill="#f2dca8"/><rect x="34" y="92" width="52" height="8" rx="3" fill="#fffaf6"/>
      <path d="M32 92V52a28 28 0 0 1 56 0v40z" fill="rgba(255,255,255,.55)" stroke="#fff" stroke-width="3"/>
      <path d="M40 84V54a20 20 0 0 1 6-14" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".9"/>
      <g transform="rotate(-8 60 66)"><rect x="46" y="56" width="28" height="20" rx="3" fill="#f7d3df"/><path d="M46 58l14 10 14-10" stroke="#e9a6c4" stroke-width="2.5" fill="none"/>${heart(55.5, 62, .09, '#c9668c')}</g>
      <rect x="54" y="14" width="12" height="8" rx="3" fill="#f2dca8"/>${heart(52, 2, .16, '#e88fae')}
      <g fill="#fff3c4"><path d="M100 40l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M18 62l1.5 4 4 1.500-4 1.500-1.500 4-1.500-4-4-1.500 4-1.500z"/></g>`),
    g2: svg('0 0 120 120', `<rect x="18" y="34" width="84" height="62" rx="12" fill="#fffaf3"/><rect x="18" y="34" width="84" height="16" rx="8" fill="#c7b6ea"/>
      <rect x="30" y="26" width="22" height="12" rx="4" fill="#8d77c4"/><circle cx="60" cy="68" r="20" fill="#5e4482"/><circle cx="60" cy="68" r="13" fill="#9fd8f0"/>
      <circle cx="55" cy="63" r="4" fill="#fff"/><circle cx="90" cy="44" r="4" fill="#f3a9c4"/>
      <rect x="40" y="96" width="40" height="18" rx="2" fill="#fff" transform="rotate(-6 60 105)"/>`),
    g3: svg('0 0 120 120', `<rect x="26" y="16" width="68" height="92" rx="34" fill="#f2dca8" stroke="#c99b52" stroke-width="4" transform="rotate(-6 60 62)"/>
      <rect x="32" y="22" width="56" height="80" rx="28" fill="#fffaf3" transform="rotate(-6 60 62)"/>${heart(38, 44, .44, '#e88fae')}
      <circle cx="96" cy="20" r="4" fill="#fff3c4"/><circle cx="20" cy="96" r="3" fill="#fff3c4"/>`),
    g4: svg('0 0 120 120', `<rect x="20" y="20" width="80" height="88" rx="10" fill="#c4977c"/><rect x="26" y="28" width="68" height="22" rx="4" fill="#e7c6ac"/>
      <rect x="26" y="56" width="68" height="22" rx="4" fill="#e7c6ac" transform="translate(0 6)"/><rect x="26" y="84" width="68" height="18" rx="4" fill="#e7c6ac"/>
      <circle cx="60" cy="39" r="3.5" fill="#c99b52"/><circle cx="60" cy="73" r="3.5" fill="#c99b52"/><circle cx="60" cy="93" r="3.5" fill="#c99b52"/>
      ${heart(48, 48, .24, '#e88fae')}`),
    g5: svg('0 0 120 120', `<path d="M74 22a34 34 0 1 0 22 52A28 28 0 0 1 74 22z" fill="#ffe6c4"/>
      <g fill="#fff3c4"><circle cx="30" cy="30" r="3"/><circle cx="96" cy="30" r="2.5"/><circle cx="22" cy="80" r="2"/></g>
      <path d="M86 84l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#ffaecb"/>
      <path d="M0 104c30-14 80-14 120 0v16H0z" fill="#3d3170" opacity=".55"/>`)
  };

  /* ── Gallery 04 drawer objects ── */
  A.object = {
    chat: svg('0 0 80 80', `<rect x="6" y="12" width="46" height="28" rx="12" fill="#c7b6ea"/><path d="M14 38l-4 10 12-8z" fill="#c7b6ea"/>
      <rect x="28" y="34" width="46" height="28" rx="12" fill="#f7d3df"/><path d="M66 60l4 10-12-8z" fill="#f7d3df"/>
      <g fill="#fff"><circle cx="20" cy="26" r="3"/><circle cx="29" cy="26" r="3"/><circle cx="38" cy="26" r="3"/></g>${heart(44, 41, .14, '#c9668c')}`),
    phone: svg('0 0 80 80', `<rect x="24" y="6" width="32" height="68" rx="8" fill="#5e4482"/><rect x="28" y="14" width="24" height="50" rx="4" fill="#3b2c5c"/>
      <path d="M44 30a8 8 0 1 0 5 12 6 6 0 0 1-5-12z" fill="#ffe8c6"/><g fill="#fff3c4"><circle cx="34" cy="22" r="1"/><circle cx="48" cy="54" r="1"/></g>
      <text x="40" y="60" text-anchor="middle" font-size="6" font-family="Nunito,sans-serif" font-weight="800" fill="#c7b6ea">zzz</text>`),
    fries: svg('0 0 80 80', `<g fill="#f2c26b" stroke="#d8a44c" stroke-width="1.5"><rect x="22" y="10" width="7" height="32" rx="3" transform="rotate(-10 25 26)"/><rect x="32" y="6" width="7" height="34" rx="3"/><rect x="42" y="8" width="7" height="34" rx="3" transform="rotate(8 45 25)"/><rect x="50" y="14" width="7" height="28" rx="3" transform="rotate(16 53 28)"/></g>
      <path d="M16 34h48l-6 40H22z" fill="#e88fae"/><path d="M16 34h48l-1 8H17z" fill="#c9668c"/>${heart(32, 48, .16, '#fff')}`),
    smile: svg('0 0 80 80', `<circle cx="40" cy="40" r="32" fill="#ffe3b0"/><circle cx="28" cy="34" r="4" fill="#5e4482"/><circle cx="52" cy="34" r="4" fill="#5e4482"/>
      <path d="M24 46c6 12 26 12 32 0" stroke="#c9668c" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="20" cy="46" r="5" fill="#f7b3c9" opacity=".7"/><circle cx="60" cy="46" r="5" fill="#f7b3c9" opacity=".7"/>`),
    bubble: svg('0 0 80 80', `<path d="M10 16h60a6 6 0 0 1 6 6v30a6 6 0 0 1-6 6H34l-14 12 2-12H10a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6z" fill="#9fd8d0"/>
      <text x="40" y="44" text-anchor="middle" font-size="18" font-family="Caveat,cursive" font-weight="700" fill="#2f5e58">hehe</text>`),
    glasses: svg('0 0 80 80', `<g fill="rgba(199,182,234,.35)" stroke="#5e4482" stroke-width="4"><circle cx="22" cy="44" r="15"/><circle cx="58" cy="44" r="15"/></g>
      <path d="M37 42c2-3 4-3 6 0" stroke="#5e4482" stroke-width="4" fill="none"/><path d="M7 40L2 32M73 40l5-8" stroke="#5e4482" stroke-width="4" stroke-linecap="round"/>
      <path d="M14 38l6-6M50 38l6-6" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`),
    school: svg('0 0 80 80', `<path d="M6 70h68" stroke="#a9c6a6" stroke-width="4" stroke-linecap="round"/><rect x="14" y="30" width="52" height="40" rx="4" fill="#f7d3df"/>
      <path d="M10 32L40 12l30 20z" fill="#c9668c"/><rect x="34" y="48" width="12" height="22" rx="6" fill="#5e4482"/><circle cx="40" cy="28" r="5" fill="#fffaf3"/>
      <g fill="#fffaf3"><rect x="20" y="40" width="9" height="9" rx="2"/><rect x="51" y="40" width="9" height="9" rx="2"/></g>`),
    band: svg('0 0 80 80', `<ellipse cx="40" cy="62" rx="24" ry="5" fill="rgba(90,60,40,.18)"/>
      <ellipse cx="40" cy="42" rx="24" ry="17" fill="none" stroke="#c9668c" stroke-width="7"/>
      <ellipse cx="40" cy="42" rx="24" ry="17" fill="none" stroke="#f3a9c4" stroke-width="3.5"/>
      <path d="M22 34c4-6 10-8 16-8" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".8"/>
      ${heart(52, 18, .16, '#e88fae')}`),
    guitar: svg('0 0 80 80', `<g transform="rotate(30 40 40)"><rect x="37" y="2" width="6" height="40" rx="2" fill="#a87a63"/><path d="M40 36c-10 0-14 6-12 12-6 3-8 8-7 14 2 9 12 13 19 13s17-4 19-13c1-6-1-11-7-14 2-6-2-12-12-12z" fill="#c7b6ea"/><circle cx="40" cy="56" r="5" fill="#5e4482"/></g>`)
  };

  /* ── keepsakes ── */
  A.keepsake = {
    pick: svg('0 0 60 60', `<path d="M30 54C18 44 10 30 10 20a20 20 0 0 1 40 0c0 10-8 24-20 34z" fill="#f3a9c4" stroke="#c9668c" stroke-width="2.5"/>${heart(22, 16, .16, '#fff')}`),
    film: svg('0 0 60 60', `<rect x="8" y="16" width="44" height="28" rx="4" fill="#5e4482"/><g fill="#fffaf3"><rect x="12" y="19" width="4" height="3" rx="1"/><rect x="20" y="19" width="4" height="3" rx="1"/><rect x="28" y="19" width="4" height="3" rx="1"/><rect x="36" y="19" width="4" height="3" rx="1"/><rect x="44" y="19" width="4" height="3" rx="1"/><rect x="12" y="38" width="4" height="3" rx="1"/><rect x="20" y="38" width="4" height="3" rx="1"/><rect x="28" y="38" width="4" height="3" rx="1"/><rect x="36" y="38" width="4" height="3" rx="1"/><rect x="44" y="38" width="4" height="3" rx="1"/></g><rect x="14" y="24" width="14" height="12" rx="1" fill="#f7d3df"/><rect x="32" y="24" width="14" height="12" rx="1" fill="#c7b6ea"/>`),
    pin: svg('0 0 60 60', `<circle cx="30" cy="30" r="22" fill="#f2dca8" stroke="#c99b52" stroke-width="3"/>${heart(19, 18, .22, '#e88fae')}`),
    key: svg('0 0 60 60', `<circle cx="30" cy="16" r="9" fill="none" stroke="#d6aa5b" stroke-width="4"/>${heart(25, 12, .1, '#e88fae')}<path d="M30 25v28M30 44h8M30 51h6" stroke="#d6aa5b" stroke-width="4" stroke-linecap="round"/>`),
    star: svg('0 0 60 60', `<path d="M30 6l7 15 16 2-12 11 3 16-14-8-14 8 3-16L7 23l16-2z" fill="#ffd27f" stroke="#e0a948" stroke-width="2" stroke-linejoin="round"/>`),
    secret: svg('0 0 60 60', `<circle cx="30" cy="30" r="24" fill="#5c1c35"/>${heart(18, 18, .24, '#ffb3c9')}<circle cx="30" cy="30" r="24" fill="none" stroke="#f7cfa0" stroke-width="2" stroke-dasharray="3 3"/>`)
  };

  /* ── Gallery 05 star glyphs + postcards ── */
  A.glyph = {
    place: svg('0 0 24 24', `<path d="M12 1l2.6 7.4L22 12l-7.4 2.6L12 23l-2.6-8.4L2 12l7.4-3.6z" fill="#bff0e8"/>`),
    date: svg('0 0 24 24', `<path d="M12 2l3 6.6 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21.2l1.4-7L2 9.4l7-.8z" fill="#ffe0a3"/>`),
    dream: svg('0 0 24 24', `<path d="M12 21C6 17 2 13.4 2 8.8 2 5.6 4.6 3 7.6 3c1.8 0 3.4.9 4.4 2.3C13 3.9 14.6 3 16.4 3 19.4 3 22 5.6 22 8.8 22 13.4 18 17 12 21z" fill="#ffc4d8"/>`)
  };
  A.postcard = {
    place: svg('0 0 200 160', `<rect width="200" height="160" fill="#cfe6f2"/><circle cx="150" cy="40" r="16" fill="#fff3d6"/>
      <path d="M0 120L50 50l30 40 28-30 50 60H0z" fill="#9db6d6"/><path d="M50 50l14 18-8 4-6-6-8 8-6-4zM108 60l12 14-6 2-6-4-6 6-4-4z" fill="#fff"/>
      <path d="M0 160V118c40-10 80 6 120-2s60-4 80 0v44z" fill="#fffaf3"/><g fill="#fff"><circle cx="30" cy="30" r="2"/><circle cx="70" cy="20" r="2.5"/><circle cx="100" cy="36" r="2"/><circle cx="180" cy="80" r="2"/></g>
      <g transform="translate(78 112)"><circle cx="0" cy="0" r="6" fill="#e88fae"/><rect x="-5" y="5" width="10" height="16" rx="4" fill="#e88fae"/><circle cx="18" cy="0" r="6" fill="#8d77c4"/><rect x="13" y="5" width="10" height="16" rx="4" fill="#8d77c4"/></g>`),
    date: svg('0 0 200 160', `<defs><linearGradient id="pcs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7b9c9"/><stop offset=".6" stop-color="#ffd9b0"/><stop offset="1" stop-color="#fff0d6"/></linearGradient></defs>
      <rect width="200" height="160" fill="url(#pcs)"/><circle cx="100" cy="92" r="30" fill="#fff3c4"/><path d="M0 100c40-10 160-10 200 0v60H0z" fill="#a9c6a6"/>
      <path d="M44 118l112 0 12 30H32z" fill="#f7d3df"/><path d="M60 118l-8 30M84 118l-4 30M108 118v30M132 118l4 30M150 118l8 30" stroke="#fff" stroke-width="3"/>
      <rect x="86" y="100" width="34" height="22" rx="4" fill="#c4977c"/><path d="M90 100c0-12 26-12 26 0" stroke="#8c604c" stroke-width="3" fill="none"/>${heart(96, 104, .14, '#e88fae')}`),
    dream: svg('0 0 200 160', `<rect width="200" height="160" fill="#2b2450"/><g fill="#fff3c4"><circle cx="20" cy="20" r="1.5"/><circle cx="60" cy="40" r="2"/><circle cx="170" cy="24" r="1.5"/><circle cx="150" cy="70" r="2"/><circle cx="30" cy="90" r="1.5"/></g>
      <path d="M130 22a22 22 0 1 0 16 36 18 18 0 0 1-16-36z" fill="#ffe8c6"/>
      <rect x="70" y="70" width="60" height="70" rx="14" fill="rgba(255,255,255,.18)" stroke="#e6dcff" stroke-width="3"/><rect x="76" y="62" width="48" height="12" rx="4" fill="#c7b6ea"/>
      <g fill="#ffd27f"><path d="M90 104l3 6 7 1-5 4 1 7-6-3-6 3 1-7-5-4 7-1z"/><path d="M110 118l2 4 5 1-4 3 1 5-4-2-4 2 1-5-4-3 5-1z"/></g>${heart(94, 86, .12, '#ffaecb')}`)
  };

  /* ── Gallery 05 horizon: a hill with two tiny people looking up ── */
  A.horizon = svg('0 0 1200 220', `<path d="M0 220V150c150-40 300-50 460-40 120 8 180-50 300-60 170-14 300 40 440 70v100z" fill="#1b1638"/>
    <path d="M0 220v-40c200-30 400-10 600-20s400-30 600 0v60z" fill="#120f26"/>
    <g transform="translate(742 50)"><circle cx="0" cy="0" r="7" fill="#120f26"/><path d="M-8 30c0-18 3-24 8-24s8 6 8 24z" fill="#120f26"/>
    <circle cx="20" cy="2" r="7" fill="#120f26"/><path d="M12 30c0-18 3-24 8-24s8 6 8 24z" fill="#120f26"/>${heart(4, -24, .12, '#ffaecb')}</g>`);


  /* ── Grand Hall: the rotunda behind everything (dome, windows, staircase, columns) ── */
  A.hall = (() => {
    const ribs = []; for (let a = 200; a <= 340; a += 10) { const r = a * Math.PI / 180; ribs.push(`<path d="M800 -40 L${(800 + 820 * Math.cos(r)).toFixed(0)} ${(-40 - 380 * Math.sin(r)).toFixed(0)}"/>`); }
    const stars = []; for (let i = 0; i < 26; i++) { const x = 18 + (i * 37) % 164, y = 20 + (i * 53) % 230; stars.push(`<circle cx="${x}" cy="${y}" r="${i % 5 ? 1.4 : 2.2}" class="tw" style="animation-delay:${(-i * .37).toFixed(2)}s"/>`); }
    const win = (x) => `<g transform="translate(${x} 372)"><rect x="-14" y="-14" width="228" height="430" rx="114" fill="#fffaf6"/><rect x="-14" y="-14" width="228" height="430" rx="114" fill="none" stroke="url(#hGold)" stroke-width="4"/>
      <rect width="200" height="402" rx="100" fill="url(#hSky)"/><g fill="#fff">${stars.join('')}</g><path d="M30 60a28 28 0 1 0 22 46a22 22 0 0 1-22-46z" fill="#ffe9d2" opacity=".9" transform="translate(${x > 800 ? 96 : 0} 0)"/>
      <path d="M100 0V402M0 170H200M0 290H200" stroke="#fffaf6" stroke-width="7"/><rect width="200" height="402" rx="100" fill="url(#hGlass)"/></g>`;
    const steps = []; for (let i = 0; i < 6; i++) { const w = 330 + i * 46, y = 850 + i * 22; steps.push(`<rect x="${800 - w / 2}" y="${y}" width="${w}" height="24" rx="12" fill="${i % 2 ? '#f6dcdc' : '#fbeaea'}" stroke="#e8c4c4" stroke-width="1.5"/>`); }
    const panels = []; for (const x of [440, 560, 940, 1060]) panels.push(`<rect x="${x}" y="420" width="100" height="170" rx="6" fill="#fdf1ee" stroke="url(#hGold)" stroke-width="2" opacity=".85"/>`);
    return svg('0 0 1600 1000', `<defs>
      <linearGradient id="hWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8dcdc"/><stop offset=".55" stop-color="#fbe9e4"/><stop offset="1" stop-color="#f3d4d4"/></linearGradient>
      <radialGradient id="hDome" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#fff6ee"/><stop offset=".6" stop-color="#f8dede"/><stop offset="1" stop-color="#efc8cf"/></radialGradient>
      <linearGradient id="hGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c99a76"/><stop offset=".5" stop-color="#f6dcc0"/><stop offset="1" stop-color="#c08d6c"/></linearGradient>
      <linearGradient id="hSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2452"/><stop offset=".6" stop-color="#4a3c7c"/><stop offset="1" stop-color="#9c78ad"/></linearGradient>
      <linearGradient id="hGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <linearGradient id="hCol" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9b9c4"/><stop offset=".45" stop-color="#fbe4e8"/><stop offset="1" stop-color="#e2adbb"/></linearGradient>
      <linearGradient id="hStair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdf0ec"/><stop offset="1" stop-color="#f1d2d2"/></linearGradient>
      <linearGradient id="hFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1d3d3"/><stop offset="1" stop-color="#e5bcc2"/></linearGradient>
      <radialGradient id="hLight" cx=".5" cy=".3" r=".6"><stop offset="0" stop-color="#fff4dc" stop-opacity=".9"/><stop offset="1" stop-color="#fff4dc" stop-opacity="0"/></radialGradient></defs>
      <rect width="1600" height="1000" fill="url(#hWall)"/>
      <ellipse cx="800" cy="-40" rx="820" ry="380" fill="url(#hDome)"/>
      <g stroke="url(#hGold)" stroke-width="2.5" fill="none" opacity=".55">${ribs.join('')}</g>
      <ellipse cx="800" cy="-40" rx="820" ry="380" fill="none" stroke="url(#hGold)" stroke-width="6"/>
      <ellipse cx="800" cy="-40" rx="250" ry="120" fill="#fffaf2" opacity=".75"/>
      <rect x="0" y="336" width="1600" height="16" fill="#fdf1ee"/><rect x="0" y="350" width="1600" height="4" fill="url(#hGold)"/>
      ${panels.join('')}
      ${win(190)}${win(1210)}
      <ellipse cx="800" cy="560" rx="420" ry="300" fill="url(#hLight)"/>
      <g opacity=".92">
        <path d="M640 520h320v40H640z" fill="#fdf1ee" stroke="url(#hGold)" stroke-width="2"/>
        <path d="M700 520V430a100 100 0 0 1 200 0v90z" fill="#efd7e6" stroke="url(#hGold)" stroke-width="3"/>
        <path d="M720 520V436a80 80 0 0 1 160 0v84z" fill="#f6dfe8"/><path d="M720 520V436a80 80 0 0 1 160 0v84z" fill="url(#hLight)"/>
        <path d="M800 356v164M720 456h160" stroke="#fdf1ee" stroke-width="5"/>
        <path d="M600 600h400l-30 30H630z" fill="#fdf1ee" stroke="#e8c4c4" stroke-width="2"/>
        <path d="M600 600 Q430 640 400 860 H520 Q540 700 640 630Z" fill="url(#hStair)" stroke="#e8c4c4" stroke-width="2"/>
        <path d="M1000 600 Q1170 640 1200 860 H1080 Q1060 700 960 630Z" fill="url(#hStair)" stroke="#e8c4c4" stroke-width="2"/>
        <path d="M600 590 Q420 630 392 852 M1000 590 Q1180 630 1208 852" stroke="url(#hGold)" stroke-width="4" fill="none"/>
        <g stroke="#ebcaca" stroke-width="1.5" opacity=".9"><path d="M590 612l-34 0M560 625l-38 2M530 642l-40 4M505 664l-40 5M486 690l-42 6M470 720l-44 7M458 752l-46 7M450 786l-48 8M446 820l-50 8M1010 612l34 0M1040 625l38 2M1070 642l40 4M1095 664l40 5M1114 690l42 6M1130 720l44 7M1142 752l46 7M1150 786l48 8M1154 820l50 8"/></g>
        <rect x="660" y="630" width="26" height="230" rx="12" fill="url(#hCol)"/><rect x="914" y="630" width="26" height="230" rx="12" fill="url(#hCol)"/>
      </g>
      <rect x="0" y="860" width="1600" height="140" fill="url(#hFloor)"/>
      <ellipse cx="800" cy="900" rx="560" ry="40" fill="#fff" opacity=".35"/>
      ${steps.join('')}
      <g><rect x="0" y="0" width="120" height="1000" fill="url(#hCol)"/><rect x="-10" y="330" width="140" height="22" rx="6" fill="url(#hGold)"/><rect x="-10" y="930" width="140" height="70" fill="#f1cfd6"/>
         <rect x="1480" y="0" width="120" height="1000" fill="url(#hCol)"/><rect x="1470" y="330" width="140" height="22" rx="6" fill="url(#hGold)"/><rect x="1470" y="930" width="140" height="70" fill="#f1cfd6"/></g>`);
  })();

  /* ── Grand Hall: a small crystal chandelier (it sways and its crystals twinkle) ── */
  A.chandelier = (() => {
    const drops = []; const xs = [28, 52, 76, 100, 124, 148, 172, 196, 220];
    xs.forEach((x, i) => { const y = 128 + Math.abs(i - 4) * -4 + 16; drops.push(`<path class="cr" style="animation-delay:${(-i * .45).toFixed(2)}s" d="M${x} ${y}c-4 6-5 10 0 16c5-6 4-10 0-16z" fill="#fff" stroke="#f3d6c4" stroke-width="1"/><path d="M${x} ${y - 14}v14" stroke="#e9c7b0" stroke-width="1"/>`); });
    const flame = (x, y) => `<g><rect x="${x - 3}" y="${y}" width="6" height="16" rx="2" fill="#fffaf2"/><ellipse class="fl" cx="${x}" cy="${y - 5}" rx="4" ry="7" fill="#ffd98f"/><circle cx="${x}" cy="${y - 6}" r="14" fill="url(#chGlow)"/></g>`;
    return svg('0 0 248 210', `<defs><radialGradient id="chGlow"><stop offset="0" stop-color="#fff1c8" stop-opacity=".9"/><stop offset="1" stop-color="#fff1c8" stop-opacity="0"/></radialGradient>
      <linearGradient id="chGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c59472"/><stop offset=".5" stop-color="#f8e0c6"/><stop offset="1" stop-color="#bd8a68"/></linearGradient></defs>
      <path d="M124 0v52" stroke="url(#chGold)" stroke-width="3"/><circle cx="124" cy="58" r="7" fill="url(#chGold)"/>
      <path d="M124 64c-10 10-10 30 0 44c10-14 10-34 0-44z" fill="url(#chGold)"/>
      <path d="M124 100 Q60 96 34 82 M124 100 Q188 96 214 82 M124 108 Q80 120 66 104 M124 108 Q168 120 182 104" stroke="url(#chGold)" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M40 120 Q124 152 208 120" stroke="#fff" stroke-width="1.5" fill="none" stroke-dasharray="2 5" opacity=".9"/>
      <path d="M60 106 Q124 132 188 106" stroke="#fff" stroke-width="1.5" fill="none" stroke-dasharray="2 5" opacity=".9"/>
      ${flame(34, 74)}${flame(214, 74)}${flame(66, 96)}${flame(182, 96)}${flame(124, 50)}
      <g>${drops.join('')}</g>
      <path class="cr" d="M124 112c-8 12-9 22 0 32c9-10 8-20 0-32z" fill="#fff" stroke="#f3d6c4" stroke-width="1.2"/>`);
  })();

  /* ── the little curator (a tiny bunny in a bow tie and round glasses) ── */
  A.guide = svg('0 0 96 104', `<ellipse cx="48" cy="100" rx="26" ry="4" fill="rgba(120,70,90,.18)"/>
    <g class="g-ears"><path d="M30 34C22 12 26 2 33 4s8 18 5 31z" fill="#fffaf5" stroke="#efd9de" stroke-width="2"/><path d="M31 30c-4-12-2-19 2-19s4 10 3 19z" fill="#f7c5d4"/>
    <path d="M66 34C74 12 70 2 63 4s-8 18-5 31z" fill="#fffaf5" stroke="#efd9de" stroke-width="2"/><path d="M65 30c4-12 2-19-2-19s-4 10-3 19z" fill="#f7c5d4"/></g>
    <path d="M14 70c0-24 15-40 34-40s34 16 34 40c0 18-14 28-34 28S14 88 14 70z" fill="#fffaf5" stroke="#efd9de" stroke-width="2"/>
    <g class="g-eyes" fill="#4a3358"><ellipse cx="38" cy="62" rx="3.2" ry="4"/><ellipse cx="58" cy="62" rx="3.2" ry="4"/></g>
    <g fill="none" stroke="#c99a76" stroke-width="2"><circle cx="38" cy="62" r="8"/><circle cx="58" cy="62" r="8"/><path d="M46 61q2-2 4 0"/></g>
    <ellipse cx="29" cy="72" rx="5" ry="3" fill="#f7b9cb" opacity=".8"/><ellipse cx="67" cy="72" rx="5" ry="3" fill="#f7b9cb" opacity=".8"/>
    <path d="M44 72q4 4 8 0" stroke="#c9668c" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M38 84l10 5 10-5v10l-10-5-10 5z" fill="#b9a3e6"/><circle cx="48" cy="89" r="3" fill="#8d77c4"/>`);

  A.heartPath = H;
  A.heartIcon = svg('0 0 100 100', `<path d="${H}"/>`);
  window.ART = A;
})();
