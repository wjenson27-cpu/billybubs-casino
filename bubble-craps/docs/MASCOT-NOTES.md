# Billy the Die: mascot redesign (options for Bill to pick)

Draft and exploration only. This is **not** folded into the logo concepts or round 2. Nothing outside `/workspace/bb-logos/mascot-die/` was touched; `bb-mockups` was used only as a visual reference.

## Files
- `mascot-sheet.png` (2400×2000): 3 options × 5 expressions (Hello, Winner, Seven-out, Tip, Live Table), labelled. Each row has a 24/32/48 px test.
- `mascot-dome-scene.png` (1200×1340): the recommended option (B) beside an air-jet glass dome with a "Come on, nine!" speech bubble. This is my own composite in the dome style of the mockups. The SVG is `svg/mascot-dome-scene.svg`.
- `mascot-app-icon.png`: icon presentation (1024 master, home-screen sizes, 5× pixel check). The master is `mascot-app-icon-1024.png`. `app-icon/` holds the SVG master, a rounded preview SVG, and PNGs at 180/120/87/60/40/24.
- `svg/<option>/<pose>.svg`: hello, winner, sevenout, tip, live and a portrait (no arms, for icons/avatars) for `A-dealer`, `B-chunky` and `C-gentleman`. All are hand-built vector; the only text is outlined type on the sheets.
- `previews/*.jpg` (≤1000 px, 60–120 KB).
- `_source/`: the generator. `dieorient.py` is the die model and view solver, `diechar.py` the character, `build_mascot.py` the sheets. It runs with `/workspace/bb-logos-venv`.

## The options
- **A · Dealer Billy:** a classic rounded casino die (15% corner radius), faintly translucent with a cool rim tint and an acrylic gloss streak. Red bowler with a gold band, red bow tie, white gloves, rubber-hose legs. The friendly dealer.
- **B · Chunky Billy (recommended):** extra-rounded (25%) and squat, with less depth so the face dominates. Big eyes with double catchlights, rosy cheeks, no legs (he sits), thicker 10u outline and arms. The most app-icon friendly.
- **C · Gentleman Billy:** crisper 9% corners, a gold pin-line around the silhouette, a black bowler with a gold band, half-lidded eyes and a handlebar mustache (the mustache option), with slim legs and spats. Seen from his left, so his side face is the 2.

All three share the same palette (gold #C9A961, cream #F4EEDF, casino red #B0202B, ink #141414, felt #0F4A31), the same bowler and bow tie, and the same five expressions.

**Bubble nod:**
- a glossy acrylic highlight on the front face and a specular dot
- two small floating bubbles beside the hat
- on the icon, bubbles in the felt-green field
- in the scene, the dome glass with its arc reflection and rising bubbles

## Face decision
**The face sits on the 1-face, and the single pip becomes Billy's red nose.** The front face's "hidden value" is therefore 1: the face replaces the pip layout, but the 1-pip survives as the nose, in casino red. That keeps the die honest (the front is a real 1), gives the character a clear focal point, and fixes the side faces: none of them can be 6, because 6 is opposite 1.

## Pip orientation model
- **Standard right-handed (Western) die.** Canonical faces: 1 +z, 2 −y, 3 +x (with 6, 5, 4 opposite).
  - 1, 2 and 3 run counter-clockwise around their shared corner: (n1 × n2) · n3 = +1, asserted in code.
  - So with 1 up and 2 facing you, 3 is on the right.
- **How poses are solved.** Each view is solved over the 24 cube rotations, picking the one that puts the requested face front and the requested face on top.
- **How pips are placed.** Pip positions are defined in 3D and carried through the same rotation, so each face's layout is placed by the model, not drawn freehand.
- **Diagonal convention.** The diagonals of the 2 and 3 run toward the 1-2-3 corner, and the 6's rows run parallel to the 1–6 axis.
  - Manufacturers differ on the diagonals of the 2/3/6, so treat this as our house convention.
  - Adjacency and handedness are not a convention. They are fixed for any standard die.
- **Projection.** Oblique (cabinet) projection: every face is an affine map of a unit square, so pips are exact ellipses with no hand-faked perspective.

## Pip-orientation QA (generated from the model, not typed by hand)
| Option | Pose | Visible: front / top / side | Hidden: back / bottom / other side | Adjacent? | Opposites sum 7 | Right-handed |
|---|---|---|---|---|---|---|
| A Dealer Billy | Hello | 1 (face, nose = 1-pip) / 4 / right 5 | 6 / 3 / left 2 | yes | yes | yes |
| A Dealer Billy | Winner | 1 (face, nose = 1-pip) / 4 / right 5 | 6 / 3 / left 2 | yes | yes | yes |
| A Dealer Billy | Seven-out | 1 (face, nose = 1-pip) / 4 / right 5 | 6 / 3 / left 2 | yes | yes | yes |
| A Dealer Billy | Tip | 1 (face, nose = 1-pip) / 4 / right 5 | 6 / 3 / left 2 | yes | yes | yes |
| A Dealer Billy | Live Table | 1 (face, nose = 1-pip) / 4 / right 5 | 6 / 3 / left 2 | yes | yes | yes |
| B Chunky Billy | Hello | 1 (face, nose = 1-pip) / 4 / right 5 | 6 / 3 / left 2 | yes | yes | yes |
| B Chunky Billy | Winner | 1 (face, nose = 1-pip) / 4 / right 5 | 6 / 3 / left 2 | yes | yes | yes |
| B Chunky Billy | Seven-out | 1 (face, nose = 1-pip) / 4 / right 5 | 6 / 3 / left 2 | yes | yes | yes |
| B Chunky Billy | Tip | 1 (face, nose = 1-pip) / 4 / right 5 | 6 / 3 / left 2 | yes | yes | yes |
| B Chunky Billy | Live Table | 1 (face, nose = 1-pip) / 4 / right 5 | 6 / 3 / left 2 | yes | yes | yes |
| C Gentleman Billy | Hello | 1 (face, nose = 1-pip) / 4 / left 2 | 6 / 3 / right 5 | yes | yes | yes |
| C Gentleman Billy | Winner | 1 (face, nose = 1-pip) / 4 / left 2 | 6 / 3 / right 5 | yes | yes | yes |
| C Gentleman Billy | Seven-out | 1 (face, nose = 1-pip) / 4 / left 2 | 6 / 3 / right 5 | yes | yes | yes |
| C Gentleman Billy | Tip | 1 (face, nose = 1-pip) / 4 / left 2 | 6 / 3 / right 5 | yes | yes | yes |
| C Gentleman Billy | Live Table | 1 (face, nose = 1-pip) / 4 / left 2 | 6 / 3 / right 5 | yes | yes | yes |
| scene | Dome die 1 | 5 / 6 / right 3 | 2 / 1 / left 4 | yes | yes | yes |
| scene | Dome die 2 | 4 / 2 / right 6 | 3 / 5 / left 1 | yes | yes | yes |

How to read the table:
- **Adjacent?** means none of the visible faces are opposites (no visible pair sums to 7) and none repeat.
- **Right-handed** checks (front × top) · right against the viewer's frame, using the canonical die.
- The same physical die is used in every pose of an option. Poses rotate the drawing slightly (Live Table leans 6°), but never re-orient the die.

Notes per pose:
- **Hello, Winner, Seven-out, Live Table:** the bowler sits on the top face (the 4), so only the corner pips around the brim show. Every visible pip belongs to the 4. In Winner the hat pops up and more of the 4 shows.
- **Tip:** the hat is lifted, so the whole 4 on top is visible.
- **Live Table:** the small die in Billy's glove is drawn face-on showing a single face (6), which is legal on its own.
- **Dome scene:** die 1 is front 5 / top 6 / right 3, and die 2 is front 4 / top 2 / right 6. Both were solved by the same model, and their front faces sum to nine, matching the call.
- All 15 character poses and both dome dice pass all three checks. Count of failures: 0.

## Recommendation: Option B, Chunky Billy
- It reads best small. At 24 px, the red bowler, the eyes and the red nose on a white cube are still distinct, and at 40–60 px the side-face pips and the bow tie read clearly (see the icon pixel check).
- It has the simplest silhouette (a soft cube with a hat, no legs). That sits cleanly in UI corners like the dome-scene placement and works as a chat or onboarding avatar.
- It is the warmest of the three for a practice app. It feels like a friendly coach, not a gambler's mascot.
- A is a close second if Bill wants more "dealer" theatre. C is the pick if the brand goes high-limit and premium; the mustache can also be added to B as an accessory.

## Self-QA checklist
- Built from hand-written SVG geometry (rounded silhouette, affine faces, Bézier features). No AI imagery and no live text.
- Line weights are consistent within each option: A 8u, B 10u, C 7u outlines; arms 12/17/10u.
- Same palette across all options; red is used only for the hat, bow tie and nose (plus the grin's tongue).
- Expressions read at sheet size: wave, arms-up grin, worried brows with a sweat drop, wink with a tipped hat, and a focused wind-up with motion arcs.
- Checked against competitors: none of them uses a die character with a hat. This is a visual check only, not a trademark search.
- Caveats:
  - The die faces are in oblique projection, not true perspective. This is a deliberate stylisation for clean vectors.
  - The dome scene is a composite, not a render of the live app.

## Update: Bill picked Option A (Dealer Billy, no mustache)
- A is now the companion character in the final logo system (`/workspace/bb-logos/final/`).
- **Small-size cut (24–48 px) and round-safe avatar:** `svg/A-dealer/small/`.
  - The small cut drops legs, gloves, arms, translucency and side pips.
  - It has a bold 4.6u outline, bigger eyes and nose, and a solid hat silhouette.
  - Expressions: smile, win, sevenout. Avatar: felt disc and transparent.
  - Test sheet: `svg/A-dealer/small/small-cut-test.png`.
- Size rules and Billy's craps callouts are in `final/BRAND-GUIDE.md` §9.
