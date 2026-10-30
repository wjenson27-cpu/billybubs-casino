# Top-left header lockup (Bubble Craps play screen)
Built from the brand system (`/workspace/bb-logos/final/07-bb-mark/` and BRAND-GUIDE §5/§11). All text is outlined, so no font loading is needed. Regenerate with `python3 build_lockup.py && python3 render.py`.

## Files
| File | Size (CSS px) | Use |
|---|---|---|
| `topleft-lockup.svg` (+ `@1x/@2x/@3x.png`) | 118.5 × 36 | Portrait header: Bb icon mark (34 px tall, with the die), a gold hairline, and BUBBLE / CRAPS |
| `topleft-mark-ring-32.svg` (+ PNGs) | 32 × 32 | Landscape Home button (replaces the avatar there); also any spot ≤ 32 px |
| `topleft-mark-ring-36.svg` (+ PNGs) | 36 × 36 | Optional portrait Home button if you'd rather not show Billy in the header |
| `topleft-before-after-{390,844,375}.jpg` | | Live build vs. this spec, rendered in the live DOM at 3x |

## Lockup construction (portrait, 36 px row)
- **Mark:** `bb-icon-mark-color-dark`, 34 px tall (47.4 px wide), 1 px top/bottom inset. Gold `#C9A961`; the die keeps its brand colors. No shadow or glow (brand don't).
- **Hairline:** 1 × 26 px, `#C9A961` at 70 %, 6 px from the mark.
- **Descriptor:** BUBBLE / CRAPS in Cinzel 700, 11 px, tracking +0.22 em (≈ +220), cream `#F4EEDF`, leading 13 px, 6 px after the hairline. The two-line block is centered on the 36 px row.
  - Caps measure about 7.7 px. That's up from about 6.5 px in the live compact lockup at 30 px tall, so it now meets the 8 px-class micro-label floor at 2x/3x.
- **Clear space:** the die height (≈ 8 px) on all sides. Nothing may enter it, including the mode switch.

## Header layout spec
```css
/* Portrait */
.app.play .hud-row1{justify-content:flex-start;width:100%;max-width:none;padding:0 12px;box-sizing:border-box;gap:8px}
.app.play .hud-row1 .modeseg{margin-left:auto}             /* switch right-aligned to the HUD card edge */
.app.play .homebtn{width:36px;height:36px;flex:0 0 36px;box-shadow:none;background:none;border-radius:50%}
.app.play .homebtn img{width:36px;height:36px}             /* billy-A-avatar-round.svg already carries its gold ring: no second box-shadow ring */
.app.play .hud-row1 .lockup{display:block;height:36px;width:auto;flex:0 0 auto}  /* src: assets/logos/topleft-lockup.svg */
/* Landscape */
@media (max-height:500px) and (orientation:landscape){
  .app.play .hud-row1{width:auto;padding:0 0 0 6px;gap:6px}
  .app.play .hud-row1 .modeseg{margin-left:0}
  .app.play .homebtn,.app.play .homebtn img{width:32px;height:32px;flex-basis:32px}   /* img src: topleft-mark-ring-32.svg */
  .app.play .hud-row1 .lockup{display:none}                 /* no room: FAIR has 6 px of slack at 844 */
}
/* < 360 px (zoomed column): keep the lockup but at 30 px tall */
@media (max-width:359px){ .app.play .hud-row1 .lockup{height:30px} }
```
- The row's left edge aligns with the HUD card's inner edge (12 px), and the mode switch's right edge with the HUD card's right edge, so the cluster is no longer floating in the center.
- Measured fit: at 390 the home button sits at 20–56, the lockup at 64–182 and the switch at 203–370 (21 px gap). At 375: 20–56 / 64–182 / 190–358 (8 px gap).
- **Safe area:** the row sits under `env(safe-area-inset-top)`, as today. In landscape add `padding-left:max(6px, env(safe-area-inset-left))` for the notch side.

## Ring spec (`topleft-mark-ring-*`)
Circle diameter D; fill `#0F4A31`; outer ring 1.5 px `#C9A961` (centered on r = D/2 − 0.75); inner hairline 0.75 px `#C9A961` at 35 % at r = D/2 − 3. Inside sits the Bb chip mark (no die, heavier swash; the brand rule for ≤ 32 px) at 50 % of D, nudged 2 % right and down for optical centering.

## Which logo did Bill mean?
Most likely the **wordmark lockup**. "The Billy Bubs logo" is the Bb / BUBBLE CRAPS lockup; the round die face is Dealer Billy, the mascot.
- In the live header the lockup is the part that's below the store bar: it's 30 px tall, the descriptor is about 6.5 px caps, it floats in the center, and it vanishes in landscape.
- The run 13 avatar change (40 px, gold ring) is fine, but it doesn't address that.
- This spec fixes both: the avatar stays as Home, and the lockup gets bigger and anchored.
