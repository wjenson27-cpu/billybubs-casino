# Table Craps — Motion & Gesture Spec (rail = NEW)
All timings are at 1×. With prefers-reduced-motion: no arcs, flips, or shakes. Chips cross-fade in 120 ms, dice snap to their pose, and counts update in place.

## Table rail (NEW)
| Event | Motion | Timing | Rules |
|---|---|---|---|
| Select | the tapped stack lifts 3 px, gets a gold ring (#C9A961) and glow, den label turns #FFE7A0 | 120 ms ease-out | The rail IS the chip selector. Exactly one stack is selected. The hit area is the whole stack column (≥44×44). Sets aria-pressed. |
| Bet out | top chip lifts, arcs to the spot (parabola, peak 24 px), lands with a 2 px settle | 260 ms ease-out | Stack count −1 on lift. Bankroll total ticks on land. |
| Win in | payout chips slide from the felt to their stacks, then the stake follows | 320 ms ease-in-out, 40 ms stagger, max 6 animated chips | Count +n on land. Extra chips only bump the badge. |
| Colour-up (rev 15b) | OFFERED, never forced. When the $1s or $5s pass 20, a non-blocking offer toast shows above the rail: "22 × $1 on the rail. Colour up to 4 × $5?" [COLOUR UP] [×]. On accept: n chips slide together, flip once, and drop onto the next stack | 220 ms | Only the buttons take taps (≥44). It auto-hides after 5 s or on the next bet/roll. Setting "Auto colour-up" (off by default) does the swap with no prompt. **Leave table ALWAYS colours up** to the fewest chips (`leaveTable()`). $1×5 = $5, $5×5 = $25, $25×4 = $100, $100×5 = $500. |
| Break a chip | when the needed denomination is empty: the smallest higher chip held fans out into change chips | 240 ms fan-out | Cascades (e.g. $100→4×$25). Silent and automatic. One toast: "Broke a $100". |
| Can't cover | the selected stack shakes 2×4 px; Billy tip: "You have $X in practice chips." | 180 ms | No bet is placed. Haptic: light. |
| Draw cap | up to 12 chips are drawn per stack; the badge always shows the real count | — | An empty denomination shows a dashed ghost slot (still tappable, so break-a-chip applies). |
Chip art comes from bb-bc-yrkv `assets/chips/chip-{1,5,25,100,500}-value.svg` (copied to assets/chips/). Logic: js/tc-rail.mjs.

## Set dice (shooter page)
- The model is a right-handed die (opposite faces sum to 7). Canonical normals: 1:+y, 6:−y, 2:+z, 5:−z, 3:+x, 4:−x. right = top × front. See js/tc-dice.mjs, verified 24/24 poses from pixels.
- Gestures (per die, pointer captured):
  - drag up/down ≥24 px → flipUp/flipDown (rotate about X 90°);
  - drag left/right → spinLeft/spinRight (rotate about Y);
  - tap → quarter-turn flipUp.
  - Settle is 260 ms cubic-bezier(.2,.8,.2,1). Each die is a 96×96 hit target.
- Presets: 3V, 2V, Straight Hardway, All-Sevens. Each shows "Top ⚀⚀ = N" and "On axis: …" (on-axis totals).
- Throw: drag + flick on the SHOOT key or the felt; the power meter is cosmetic (labelled). Dice must hit the back wall. RNG is unchanged (Fair Dice).

## Place / Buy / Lay convert prompt (rev 15b, NEW, REUSES the BC coach card)
Tapping BUY or LAY on a number that already has another number bet opens the coach card. Billy teaches; it is the only mascot.
- Copy: "You have Place $30 on the 6. Switch it to Buy $30? Buy pays true odds; the 5% commission is taken only when it wins."
- Buttons: [CONVERT TO BUY] [KEEP PLACE], 44 px.
- The card scales in 220 ms. The chips slide strip-to-strip 260 ms. Reduced motion: no animation.

## Point-hit celebration (NEW) — shared with Bubble Craps
- Files: css/point-celebration.css, js/point-celebration.mjs.
- Timeline, 1.2 s total:
  - 0 ms: gold glow ring on the HUD puck + the point number box (flash ×2);
  - 120 ms: 12 gold sparkles + 4 $25 chips burst out of the number box (600–700 ms);
  - 0–260 ms: the call plate slides up 12 px. Billie cheer + "DEALER BILLY CALLS IT · Winner! Point is made: 6." + "+$3,500";
  - 980–1200 ms: fade out.
- The layer is pointer-events:none. SHOOT, a bet or a new roll cancels it (120 ms fade).
- **Big Win inside it (rev 15b):** the plate adds the amount + BIG WIN tag + soft rays, masked away from the dock. Capped at 2.5 s. Tap anywhere skips (the tap still lands). No buttons. This 2.5 s cap applies to every Big Win in both apps.
- Sound: event `point_hit` → MOTION-SOUND-SPEC.md M3 `win_chime`. Big: M7 `bigwin_stinger` @450 ms. Haptic `success` @120 ms.
- Reduced motion: glow-only fade + plate fade. No sparks, chips, rays or slide.

## On-table dice throw (round 5, NEW, from Bill, 10/13)
Prototype: `round5/throw/throw.mjs` + `throw.css`. Demo: `/app/table/index.html?throw=4-3&speed=normal|fast|instant&reduce=1&noroll=1&lane=1` (double-click to replay). Strips: `round5/shots/throw/strip-*.png`. Verify: `round5/shots/throw/verify-throw.json`.
- **The die (REUSE).** Use the TC cube: `.tc-cube/.c/.f1–.f6` (css/tc-dice.css), `cubeHTML()` (js/table-ui.mjs L258) and `cssMatrix(top, front)` (js/tc-dice.mjs). It is right-handed and opposite faces sum to 7. The model is the BC 3D die in bb-bc-yrkv: css/dice-cube.css (`.cube3d`, the bb-tumble keyframes) and js/ui.mjs `animateDice` (~L1750). The engine result is decided first (Rule 0). The final keyframe is exactly `VIEW · cssMatrix(result, front)`, so the top face *is* the result. Cosmetic fronts: die A takes the first legal front from [2,3,1,5,4,6], die B the second. The shooter's set (SETS) is the start pose.
- **Camera.** Fixed, slight top-down: `VIEW = rotateX(-56deg) rotateY(-18deg)` on the cube. The cube's own perspective is s×8. There is **no camera move**. Depth comes only from scale: 0.9× at the back wall, 1.0× at the shooter edge, plus up to +17% at the apex of a hop.
- **Scale vs felt.** s = clamp(26, felt width × 7%, felt height × 8.5%, 44) px. Measured: 26 at 320/390, 29 at 430/932×430, 44 on iPad. On the shooter page's table strip, s = strip height × 34% (33 at 390).
- **Path and keyframes (Normal 1.4 s, S11).** Each die is a linear-path transform plus a cube spin `cubic-bezier(.2,.7,.3,1)`. Die B is offset and starts +3.5% (~50 ms) later.
  | t | 0 | .18 | **.40** | .55 | .62 | .70 | .86 | 1.0 |
  |---|---|---|---|---|---|---|---|---|
  | beat | release at the shooter edge (felt bottom) | apex (h 1.6s) | **back wall** (felt top + .55s) | bounce 1 | hop (h .35s) | bounce 2 | roll-out | settle in the lane |
  - Spin: about 740° X / 355° Y in total, slowing down. At .86 it is the final pose + 6° Z, and it ends exactly on the final pose.
  - Shadow: an ellipse under each die. It shrinks and fades with height.
- **Landing zone.**
  - Scan the felt (4 px step) for a 1.8s × (1.8s + shadow) spot per die. The spot must not touch any bet chip or $ amount (`.bet`, `.amt`, any $-text leaf; +6 px margin). It must also stay clear of `.tc-shoot`, `.tc-rail`, `.tc-dock`, `.tc-hud` and `.tc-keys` (+6 px).
  - Die A takes the clear spot nearest the back-wall third (34% down) and the middle. Die B takes the clear spot nearest die A.
  - **Fallback lift:** if a die has no clear spot, it lands over the spot hiding the fewest amounts, hovers .6s with its shadow, and the tuck follows. It did not trigger at any tested size with the worst-case bet load.
- **After settle.** Hold the faces (Normal 450 ms, Fast 250, Instant 200). Then **tuck**: 260 ms, scale .45 + fade, toward the on-screen readout (`.tc-shooter .readout`, else the HUD puck), else fade in place. The layer is removed. The dice never stay on the felt.
- **Never covers ROLL/SHOOT or the rail.** The path is clamped to the felt rect, and the lane excludes those rects. All 21 sampled frames of every run were checked.
- **Current pager page only.** On the Board, the dice use the felt. On the Shooter page, they use the `.table` strip (with its back wall). On Side bets, or with no felt on screen, there is no throw: the result goes straight to the readout and settle.
- **Roll speed (S11).**
  - Normal = full throw, 1.4 s.
  - Fast = 0.5 s, starting at the wall rebound (keyframes .40→1 rescaled). The wall tick fires at 0.
  - Instant = no flight: a 150 ms fade-in at the settled pose.
  - Shooter practice caps at Fast. Tapping the felt during the throw skips to settle.
- **Reduced motion wins:** a 180 ms fade-in at the settled pose, then a plain 120 ms fade-out (no tuck travel), no tumble, no wall tick.
- **Sound/haptic hooks.**
  - `dice_wall` + haptic `light` at the wall (t .40; Fast at 0).
  - `dice_felt` at bounce 1.
  - `dice_settle` at rest.
  - `no_roll` on a soft toss.
  - These go out as `bb:sfx` / `bb:haptic` events; the app maps them to audio.mjs and its haptic call. Instant and reduced motion fire only `dice_settle`.
- **Soft toss = no-roll path (Rule 0.5, the throw meter).**
  - The dice arc low and die in a clear spot on the shooter half (72% down). They never reach the wall: no wall tick, no settle, no onSettle.
  - A plate reads "NO ROLL · PRACTICE / The dice must hit the back wall. Throw again; this one doesn't count." After 1.4 s the plate and dice fade over 300 ms.
  - The dice end in the shooter's set pose. A fresh roll is drawn on the next throw.
- **Hand-off.** `onSettle(d1, d2)` fires the moment the dice rest. The app settles bets and starts the point-hit celebration / PSO there, with their own tiers and caps unchanged (S4.3 / S4.4: Base 1.2 s, Big 2.0 s, Huge 2.5 s; S11 speed rules). The tuck runs alongside, and the celebration plates sit above the throw layer (throw z 58).
