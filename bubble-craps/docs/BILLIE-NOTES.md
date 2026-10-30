# Billie Bubs: companion mascot options (draft for Bill to pick)

This is draft design work only. Nothing outside `/workspace/bb-logos/mascot-billie/` was changed. No live site or repo was touched, and `/workspace/bb-mockups/` was only looked at as a reference for the tutor screen. Billy's generator in `mascot-die/_source/` is imported read-only and was not edited.

## Files
- `billie-sheet.png` (2400×2210): 3 options × 5 expressions (Hello, Winner, Seven-out, Tip, Table), each with a craps call-out. Every row also has a 24/32/48 px test on felt and on cream, and a silhouette check against Billy. Approved Dealer Billy is shown top right for reference.
- `duo-shot.png` (2000×1250): Billy (Option A) and Billie (Option A) high-fiving on felt. The line is "Winner! Pay the line." and the dice show a natural 7 on the come-out (5 + 2). The SVG is `svg/duo-shot.svg`.
- `in-app-tutor-moment.png` (1290×2796): a tutor-overlay screen in the Billy Bubs style. Billie is the Tutor, and Billy cheers with pom-poms from the card's top-right corner. This is my own composite modelled on `05-tutor-overlay-iphone-plain.jpg`, not a render of the live app. The SVG is `svg/in-app-tutor-moment.svg`.
- `svg/<option>/{hello,winner,sevenout,tip,table,portrait}.svg` for `A-pillbox`, `B-cloche` and `C-fascinator`.
  - `small/` in each folder holds a portrait avatar SVG (felt and transparent) and PNGs at 24/32/48 px.
- `previews/*.jpg`: the sheet, the duo shot, the app screen, and one pose strip per option. All are ≤1000 px and 30–165 KB.
- `_source/`:
  - `billie.py`: the character, a subclass of Billy's `diechar.Billy`.
  - `build_billie.py`: SVGs and the sheet.
  - `scenes.py`: the duo shot.
  - `app.py`: the tutor screen.
  - `previews_qa.py`: previews and the pip QA table (also written to `pip-qa.md`).
  - Rebuild with `_source/build_all.sh`, which uses `/workspace/bb-logos-venv`.

## How she matches Dealer Billy
- She is literally the same object in code: `Billie` subclasses `diechar.Billy` with Option A's parameters.
  - Same size and proportions: s = 270, 15% corner radius, 84/74 depth.
  - Same outline weights: 8u outline, 12u arms, 24u gloves.
  - Same faint translucency with a cool rim tint, the same acrylic gloss streak and specular dot, and the same floating bubbles.
  - Same `body()`, `silhouette()`, `arm()` and `bubbles()` code, and the same palette (gold #C9A961, cream #F4EEDF, casino red #B0202B, ink, felt #0F4A31).
- The face sits on the 1-face, and the single 1-pip is her red nose (same size and highlight as Billy's).
- What is hers:
  - **Lashes:** three on each open eye, two on happy or wink eyes.
  - **Brows:** thinner and more arched.
  - **Cheeks:** soft blush (Billy A has none).
  - **Shoes:** red Mary-Jane flats with an ink strap. Billy wears black shoes.
  - **Hat and neckwear:** her headwear and neckwear replace the bowler and bow tie (see each option).
- She is seen **from her left**, the mirror of Billy's view, so side by side they turn toward each other. Her visible side is the **3**, while Billy shows his **5**. The mirrored view is part of what keeps the two apart in silhouette.
- Family-friendly: no body shaping at all. The die stays a die. All the femininity comes from lashes, expression and accessories.

## The options
- **A · Pillbox Billie (recommended):** a red pillbox hat with a gold band, worn tilted toward the front. It has a little red bow with ribbon tails and a pearl pin on the side. She wears a single-strand pearl choker (the pearls nod to bubbles). It's the classic, polished counterpart to Billy: same red family, but a different shape.
- **B · Hostess Billie:** a black cloche with a gold band, a turned-down brim and a flipped-up side that carries a gold five-petal flower with a pearl centre. She wears a gold sequin Peter-Pan collar with a pearl button. The classy casino hostess, with the strongest colour contrast to Billy.
- **C · Bubbles Billie:** a red-disc fascinator with a gold rim, a gold feather plume and a cluster of four glass bubbles on gold stems. She wears a double pearl strand with a drop pearl. The most playful look and the most "bubble craps".

## The expressions (same five for every option)
| Pose | What she does | Call-out on the sheet |
|---|---|---|
| Hello | Far arm waves, near arm relaxed, smile | "Coming out!" |
| Winner | Both arms up, happy eyes and an open grin, gold sparkles. The hat bounces but stays pinned on (Billy's bowler pops off; hers doesn't) | "Winner! Pay the line." |
| Seven-out | Worried brows, wobbly mouth, sweat drop, drooping arms, hat knocked askew, a single lonely bubble | "Seven out, line away." |
| Tip | Wink, index finger raised ("here's a tip"), other hand on hip | "Take the odds: they pay true." |
| Table | Holds up the white **ON** puck and presents with an open hand; eyes on the puck | "Mark the six!" |

## Craps copy used
- **Duo shot:** "Winner! Pay the line." The caption reads "natural seven on the come-out", and the dice show 5 + 2.
- **Tutor screen:**
  - Billie's bubble: "Pass Line + Odds: odds pay true, 0% house edge."
  - Card body: "Point is six. Back up your Pass Line with Odds, up to 5x. Odds on the 6 pay 6 to 5: true odds, no house edge on that money."
  - Badges: 0% Odds · 1.41% Pass Line · 0.37% Line + Odds.
  - Note under the badges: "Line + Odds = Pass Line with full 3-4-5x Odds."
  - Billy cheers "Back up that line!"
  - The table layout shows Place 4 / 5 / SIX / 8 / NINE / 10 (puck ON the six), Come, Field (2·3·4·9·10·11·12), Pass Line, Odds (3-4-5x) and Don't Pass Bar 12.
- **Accuracy check:**
  - The Pass Line edge is 1.41%.
  - At 3-4-5x, the most Odds you can take on the 6 or 8 is 5x, and those Odds pay 6:5.
  - The combined edge of the Pass Line with full 3-4-5x Odds is about 0.37%.
  - The Odds bet itself has a 0% edge.

## Pip-orientation QA (generated by `previews_qa.py` from the model, not typed by hand)
- **Model:** the same standard right-handed die as Billy's, from `dieorient.py`. Canonical faces are 1 +z, 2 −y, 3 +x, with 1-2-3 counter-clockwise around their shared corner.
- **Billie's view:** front 1 / top 2 / left 3, so she shows the 1-2-3 corner itself. This orientation was solved over the 24 proper rotations.
- **Pip placement:** each visible face's pips are carried through that same rotation, including the diagonal direction of the 2 and the 3.
- **Right-handed check:** (n_front × n_top) · n_right = −1 in the viewer frame, and the solved rotation has det = +1.

| Character | Pose | Visible: front / top / side | Hidden: back / bottom / other side | Adjacent? | Opposites sum 7 | Right-handed |
|---|---|---|---|---|---|---|
| A Pillbox Billie | Hello | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| A Pillbox Billie | Winner | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| A Pillbox Billie | Seven-out | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| A Pillbox Billie | Tip | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| A Pillbox Billie | Table | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| A Pillbox Billie | Cheer | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| A Pillbox Billie | Portrait | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| B Hostess Billie | Hello | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| B Hostess Billie | Winner | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| B Hostess Billie | Seven-out | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| B Hostess Billie | Tip | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| B Hostess Billie | Table | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| B Hostess Billie | Cheer | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| B Hostess Billie | Portrait | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| C Bubbles Billie | Hello | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| C Bubbles Billie | Winner | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| C Bubbles Billie | Seven-out | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| C Bubbles Billie | Tip | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| C Bubbles Billie | Table | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| C Bubbles Billie | Cheer | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| C Bubbles Billie | Portrait | 1 (face, nose = 1-pip) / 2 / left 3 | 6 / 5 / right 4 | yes | yes | yes |
| Billy A (duo, app v1, app v2) | Winner / Cheer / Tutor-point | 1 (face, nose = 1-pip) / 4 / right 5 | 6 / 3 / left 2 | yes | yes | yes |
| scene | Duo die 1 | 5 / 6 / right 3 | 2 / 1 / left 4 | yes | yes | yes |
| scene | Duo die 2 | 2 / 4 / right 1 | 5 / 3 / left 6 | yes | yes | yes |
| scene | App status die 1 | 4 / 1 / right 2 | 3 / 6 / left 5 | yes | yes | yes |
| scene | App status die 2 | 2 / 3 / right 6 | 5 / 4 / left 1 | yes | yes | yes |

Rows: 26. Failures: 0.

Notes:
- With a hat on, part of the top face (the 2) is covered. Every pip that shows belongs to the 2, and in Option C the fascinator leaves most of the 2 visible.
- One die is used per option. Poses tilt the drawing (Table leans 4°) but never re-orient the die.
- The puck is a puck, not a die, so it has no pips to check.

## Small-size and silhouette check
- **A:** reads at 24 px as "white cube, red hat, red nose". At 48 px the pearls and lashes read. The flat-topped, off-centre pillbox and bow, together with the mirrored view, separate her from Billy's domed bowler, though the silhouettes are closest in this option.
- **B:** the black cloche is the clearest "not Billy" cue at 24 px on cream, but it gets weaker on dark felt. The collar reads as a gold band at 32 px and up.
- **C:** the most distinct silhouette (low disc and tall plume, no hat mass). At 24 px the fascinator shrinks to a red dot plus a gold flick, so it is the weakest small.

## Original recommendation (v1): Option A, Pillbox Billie. Superseded: Bill picked C
- **Pairs with Billy:** she is clearly his partner (same red, gold and die build) while being plainly herself. Pillbox against bowler, pearls against bow tie and red flats against black shoes all differ at a glance, and the mirrored view makes the pair face each other in every duo layout.
- **Reads small:** it is the best of the three at 24–48 px. The pillbox is a compact, solid red shape that survives an avatar circle, and the nose and pearls remain.
- **Brand fit:** the pearls tie her to bubbles, which suits a bubble-craps brand without adding clutter. The look is classy, warm and timeless, and fits a tutor role.
- **Alternatives:** B is the pick if Bill wants maximum contrast with Billy (a black-and-gold hostess). Elements of C (a small bubble cluster) could be added to A's pillbox later as a special-event variant.


## Update (v2): Bill picked Option C, and the roles are reversed
- **Bill's pick:** Option C, **Bubbles Billie**. The original recommendation (A) is kept below for the record, but C is now the working choice.
- **`billie-sheet-v2.png`** (2400×2210): the same sheet with a **6th column, Cheer**, and Option C framed as Bill's pick. `billie-sheet.png` (v1) is unchanged.
- **Cheer pose:** a reusable pose for every option, at `svg/<option>/cheer.svg`.
  - Both arms up with gold, gold-light and red pom-poms (ink-edged strands), happy eyes, open grin and sparkles.
  - The hat bounces but stays pinned on.
  - The call-out is "Back up that line!"
- **`in-app-tutor-moment-v2.png`** (1290×2796), SVG at `svg/in-app-tutor-moment-v2.svg`, preview at `previews/in-app-tutor-moment-v2-preview.jpg`. v1 is kept.
  - **Dealer Billy (Option A) is the Tutor.** He uses a pointing variant of his Tip pose: hat on, wink, index finger raised, other glove on his hip.
    - He stands on the right of the card, facing his speech bubble on the left.
    - Bubble: "Pass Line + Odds: odds pay true, 0% house edge."
    - Signed "Dealer Billy · your craps tutor".
  - **Billie C is the cheerleader.** She uses the Cheer pose with pom-poms, perched on the card's top-left corner and turned toward the card.
    - Her call is "Back up that line!"
    - She is about 150 pt tall (450 px at @3x), so the fascinator, bubbles, pearls and lashes all still read.
  - **Card copy is unchanged and checked:**
    - "Point is six. Back up your Pass Line with Odds, up to 5x. Odds on the 6 pay 6 to 5: true odds, no house edge on that money."
    - Badges: 0% Odds · 1.41% Pass Line · 0.37% Line + Odds, with the note "Pass Line with full 3-4-5x Odds".
- **Duo shot:** `duo-shot.png` still pairs Billy with Billie **A**. I haven't re-cut it with C; that can be done on request.
- **Pip QA:** the table above now covers the Cheer pose for all three options and Billy's tutor-point pose. 26 rows, 0 failures.

## Billie C small-size cut (24–48 px icons, chips, avatars)
Files are in `svg/C-fascinator/small/`:
- `billie-C-small-smile`, `billie-C-small-win` and `billie-C-small-sevenout`.
- `billie-C-avatar-round` (felt disc with a gold ring) and `billie-C-avatar-round-transparent`.
- Each has an `.svg`, a `-512.png` and PNGs `@24`, `@32` and `@48`.
- `small-cut-test.png` compares them at real 48/32/24 px on felt and on cream, with a 4× zoom of the 24 px. Next to each is Dealer Billy's existing small cut (`mascot-die/svg/A-dealer/small/`, read-only).

It is built on the same 100×100 frame as Billy's small cut (same 4.6u outline, flat fills, plain side face), mirrored so she is seen from her left. What was simplified:
- **Bubbles:** four glass bubbles on gold stems become **two big bubbles** with a bold ink edge and one highlight.
- **Feather:** the notched plume becomes **one bold leaf-shaped plume** with a single spine line.
- **Fascinator:** a plain red disc with an ink edge and one pearl. The gold rim ring is gone.
- **Pearls:** the double strand plus drop pearl becomes **a single strand drawn as a thick dotted line** (cream dots inside ink dots).
- **Limbs:** no legs, arms or gloves.
- **Outline:** bolder, at 4.6u on a 100u frame. No translucency, no gloss streak beyond one short highlight, and no side pips.
- **Face:**
  - The eyes are **bigger** (4.9×6.8u) and the **red nose is bigger** (r 5.6u, with an ink edge).
  - Lashes are **2 bold strokes per eye**.
  - Blush stays as two flat ovals.
- **Expressions:** smile (soft smile), win (happy-arc eyes, open grin), seven-out (worried brows, eyes looking down, wobbly mouth, fascinator knocked askew).
- **Pips:** the only pip drawn is the 1, as her nose. A lone 1 is always a legal face, so the small cut has nothing else to check.

**Size rules**
- **96 px and up:** full character (any pose SVG, or `portrait.svg` for a static head).
- **24–48 px:** the small cut (`billie-C-small-*`).
- **Avatars, chat heads, chips:** the round cut (`billie-C-avatar-round*`), which is safe under a circular mask.
- **Below 24 px:** don't use the character. Use the Bb mark.
- **Between 48 and 96 px:** the small cut is preferred. The full character works from about 64 px if it has room around it.

## Self-QA and caveats
- **Vector and type:** everything is hand-built SVG geometry. All lettering is real type (Archivo, Fraunces, Cinzel and Playfair, shaped with HarfBuzz) converted to outlines. There is no AI imagery and no AI text.
- **Projection:** oblique (cabinet) projection, as Billy uses, not true perspective.
- **Stand-ins:** the tutor screen and duo shot are draft composites, not live-app renders. The app's own emoji avatar is replaced here by Billie.
