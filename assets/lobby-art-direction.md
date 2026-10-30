# BillyBubs Lobby + Craps Art Direction (phone-first, 360–430px)
Private, offline, practice-only trainer. Matches approved logo C (ruby ring, sapphire center, ivory BB, thin gold trim, 6+5 dice).

## Palette and rules
- Main colors: ruby `#C8102E` (hi `#E8284A`, deep `#6E0A1A`) and sapphire `#1F4FB8` (hi `#3D74E6`, deep `#0A1F5C`), night `#060F2A`, ivory `#F6EFDF`.
- Gold `#D9B66A` is **trim only**: 1–2px rings, hairlines, borders. Never a fill or a large text color.
- Dice art only ever shows a **6 and a 5** face up, viewed straight on (no side faces). No casino names or trademarks.

## Layout (lobby)
- Header 128px on the ruby leather band: logo C 84px + "BILLYBUBS" (Georgia, 26px, .14em tracking) + one-line subtitle.
- Grid of 2 columns, 12px gap, 16px side padding. Tile order: 1 Bubble Craps, 2 Table Craps, 3 Blackjack, 4 Baccarat, 5 Roulette, 6 Video Poker, 7 Edges & Strategy (full-width row tile).
- Footer pill: "Practice only · play chips, offline, no real money".
- At 370px or narrower, crest images shrink to 72px and the title to 22px.

## Typography
Display: Georgia / Times New Roman (serif, web-safe). UI: system-ui stack. No bundled font files are needed.

## Motion
- Hover (pointer devices only): lift 2px, full gold border, ruby glow ring. Press: scale .97 plus an inset ruby ring. 180ms, cubic-bezier(.2,.8,.2,1).
- Focus-visible: 2px sapphire outline. `prefers-reduced-motion` turns transitions off.
- Optional: a 1.2s idle shimmer on the crest highlight. Do not animate dice faces in the lobby.

## Craps
- `craps/craps-felt-layout.svg`: portrait 390x720 CSS px, also exported as `-390.png` and `-780@2x.png`. It shows the leather rail (v3 tile), a sapphire felt with a gold hairline, logo C printed at 55% opacity, then from top to bottom: Place row (4, 5, SIX, 8, NINE, 10), COME, FIELD (2·3·4·9·10·11·12; 2 pays double, 12 pays triple), DON'T PASS BAR, PASS LINE ODDS (dashed gold), PASS LINE. The SVG references `felt-v3-tile-512.png` and `leather-rail-tile-512.png` in the same folder, so keep them together. Bet hit-areas match the rects in the SVG, so the builder can overlay absolutely positioned buttons using the same coordinates (multiply by the scale).
- Dice: `craps/dice/die-face-1..6.svg/.png/@2x.png` (100px, ivory with ruby pips) are for game logic. Marketing and static art uses only `dice-pair-6-5.*`.
- Bubble Craps: `craps/bubble-craps-machine.svg/.png/@2x.png` (390x420, transparent): a ruby base with a sapphire nameplate and a glass dome over a sapphire bowl, with the static dice showing 6+5. In the app, hide the static dice and position the live die-face images inside the dome (bowl center about x195, y235).

## Files
- `tiles/tile-{bubble-craps,table-craps,blackjack,baccarat,roulette,video-poker,edges-strategy}.svg|.png(160)|@2x.png(320)`
- `lobby-bg.png` (430x932), `lobby-bg@2x.png` (860x1864)
- `lobby-tokens.css`, `logo-c.png` (a copy of v2-c-medallion-transparent, 1024px)
- `mockups/lobby-mockup-390x844.png`, `-360x780.png` (full page, 822 tall), `-430x932.png`
- `craps/` as listed above
- `src/` holds the generators (gen_tiles.py, gen_craps.py, shoot.py, shoot2.py) and the reference HTML `src/lobby-mockup.html`

## How the builder drops it in
Copy `art/` into the app's assets. Link `lobby-tokens.css` (the bg and logo paths are relative to it). Use the markup in `src/lobby-mockup.html`: `body.bb-lobby > header.bb-header + main.bb-grid > a.bb-tile` (wide tile: `.bb-tile--wide`) + `p.bb-footer`. All copy says "phone".
