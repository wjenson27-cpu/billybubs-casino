# Billy Bubs brand guide: final logo system v1.0 (draft for Bill)

This is mockup and draft work only. No live site, repo or `/workspace/bb-mockups/` file was touched. The brand guidelines sheet is `logo-system.png` (3000 × 8590), and section previews are in `previews/` (all ≤1000 px).

**Master brand:** the Concept 1 wordmark plus the **Bb** mark.

**Two apps share it:**
- **App 1 · Billy Bubs · Bubble Craps:** the dome, Regular / Crapless.
- **App 2 · Billy Bubs · Table Craps:** Live Table, with dice setting, shooter and multiplayer.

**Mascots:** **Dealer Billy (option A)**, the tutor, with no mustache, and **Bubbles Billie (Billie option C)**, the cheerleader. Both are Bill's picks. Billy options B and C are kept only as swappable alternates. See §9 (Billy sizes) and §9b (both mascots, pairing rules).

## 1. Proposed app names
| App | Store name | Lockup descriptor | Why |
|---|---|---|---|
| 1 | **Billy Bubs · Bubble Craps** | BUBBLE CRAPS | "Bubble craps" is the name players use for the air-dome machine. |
| 2 | **Billy Bubs · Table Craps** (**confirmed by Bill**) | TABLE CRAPS | It mirrors App 1 ("___ CRAPS"), it says *real table game* in plain craps language, and it doesn't imply a live dealer or real money. |

**Alternatives for App 2** (no longer needed; kept for the record):
- **Craps Table** reads well, but breaks the parallel with App 1.
- **Live Craps / Live Table** works as an in-app mode name. Avoid it as the store name: in the casino world "live" means a real-money live dealer, which is wrong for a practice app.

**Store-name caution (App 1):** "Bubble Craps" is also the title of an existing app (Tappy). It is used here as a descriptive name for the game type, always behind our "Billy Bubs" mark. Check this before App Store submission. **If the name clashes, App 1's fallback is "Billy Bubs · Dome Craps"**, descriptor **DOME CRAPS**. It keeps the "___ CRAPS" pattern, and the lockup is a one-word swap of the descriptor (`descriptor('DOME CRAPS', ...)` in `build.py`).

## 2. Folder map (every asset has a flattened SVG and a PNG)
| Folder | Contents |
|---|---|
| `01-wordmark-primary/` | `billybubs-wordmark-*` and `billybubs-wordmark-tagline-*` (with "PRACTICE CRAPS") |
| `02-wordmark-small-cut/` | `billybubs-wordmark-small-*`, plus **rail-foil-2hit** (gold + pearl foil) and **rail-foil-1hit** (gold) |
| `03-stacked/` | `billybubs-stacked-*` |
| `04-mascot-lockup/` | `billybubs-mascot-lockup-A-dealer-color-dark/-color-light`; **duo lockup** `billybubs-duo-lockup-billie-C-billy-A-color-dark/-color-light` (Billie + wordmark + Billy). `alt/` holds the Billy B and C versions. |
| `05-subbrand-bubble-craps/` | full lockup plus `-compact` (Bb, rule, two-line descriptor) for app headers and nav |
| `06-subbrand-table-craps/` | same pair for App 2 |
| `07-bb-mark/` | `bb-icon-mark-*` (with die) and `bb-chip-mark-*` (no die, heavier swash, for ≤32 px) |
| `08-chip-set/` | brand chip plus $1/$5/$25/$100/$500 (no $10 chip), in `-value` (numeral only) and `-value-mark` (Bb + numeral). SVG plus PNG at 1024, @64, @32, @24. |
| `09-app-icon-guidance/` | `icon-app1-bubble-craps-1024.svg` (green) and `icon-app2-table-craps-1024.svg` (midnight blue), plus PNGs at 1024, 180, 120, 60 |
| `10-mascot/<option>/` | flat SVG/PNG of every pose (hello, winner, sevenout, tip, live, portrait) for A, B and C. `A-dealer/small/` is a copy of the small cut (§9). |
| `10-mascot/billie-C-fascinator/` | Bubbles Billie, flattened print-ready: `billie-C-{hello,cheer,winner,sevenout,tip,table,portrait}.svg/.png`; `small/` holds the small cut (smile, win, seven-out), round avatars and portrait, each SVG + PNG @48/@32/@24. |
| `_source/` | the generators (see §12) |

**Ink suffixes** (lockups and marks):

| Suffix | Use |
|---|---|
| `color-dark` | Screen, on dark felts and UI: gold word, cream die, red pips. |
| `color-light` | Cream or white grounds: felt-green word, red die with knocked-out pips. |
| `felt-print-2ink` | Screen print on felt: gold and cream inks, pips knock out to the cloth. |
| `classic-green-lightgold` | Classic Green felt only: light-gold word, cream die. |
| `one-color-black` | Single black ink. |
| `reverse-white` | Single white ink. |

**"Flattened" means:**
- Every SVG went through picosvg and was then machine-checked.
- There are no `<mask>`, `<clipPath>`, `<filter>`, `<image>`, `<text>`, `<use>`, strokes, transforms or opacity.
- Everything is filled paths with curves preserved. Die pips are real holes (even-odd), so one-ink versions knock out correctly.
- **Result: 0 violations across 115 SVGs.** The only gradients are the two app-icon backgrounds, which are screen-only guidance art.

## 3. The primary wordmark: what was refined
**Letterforms:** Playfair Display Italic, wght 900, outlined. It is never typed live. The i is dotless and replaced by the die.

**Kerning** (per-mille em) against the font's defaults:

| Pair | Change | Why |
|---|---|---|
| B·ı | +6 | |
| y·space | −35 | closes the hole the y's tail makes |
| space·B | −30 | |
| u·b | +12 | the u's exit serif was touching the b |
| b·s | +6 | |

**Die tittle, optically balanced:**
- Size and angle: 0.228 em, rotated 14° to match the font's italic angle.
- Placement: centred on the *extended stem axis* of the ı (measured from the outline), not on the glyph box. Gap to the stem is 0.074 em.
- The die face shows a **3**, its diagonal rising with the italic.
- **QA clearance to any letter is 36 units.** The nearest letter is the l serif, not the i.

**Swash:**
- It now grows out of the y's ball terminal as a teardrop (no seam or neck), sits clear of the baseline serifs, and tapers to a 0.012 em hairline at the s.
- It is built as a sampled width profile, then smoothed to a closed cubic Bézier.

**Small-size cut** (`02-`), for 100–240 px wide or 25–60 mm:
- Tracking +22, and an extra +45 on ı·l.
- Die 0.262 em with bigger pips (pip 0.125).
- Heavier swash (0.018 em tip).
- **Clearance is 84 units**, so the die never fills in at small sizes.
- Rail foil uses this cut, because foil can't hold the regular hairline.

## 4. Secondary lockups
- **Stacked** (`03-`): "Billy" over "Bubs", with Bubs indented 0.52 em and the swash under Bubs. Use it in square spaces such as social avatars, merch and felt corners.
- **Horizontal with Dealer Billy** (`04-`):
  - Billy (hello pose) stands left of the wordmark at 1.18× its height, with a 0.17 em gap.
  - The mascot artwork is the flat version: no gradients, ground shadow pre-removed, cheeks and shines pre-blended.
  - On light grounds his floating bubbles switch to deep gold.
  - **To swap the mascot:** run `python build.py --mascot B` (or `C`). The default is `A`.
- **Bb mark** (`07-`):
  - `bb-icon-mark` is the Bb ligature (kern −60) with the swash and the die at top right (clearance 104 units). Use it for app icons, favicons and avatars.
  - `bb-chip-mark` drops the die and thickens the swash, for chips and anything ≤32 px.

## 5. Sub-brand lockups (descriptor style)
**One style for both apps:**
- Cinzel 700 caps, tracking +300.
- Cap height ≈ 0.14 × the wordmark height, centred under the swash.
- Flanked by gold diamonds and 360-unit rules.

**Compact version:** Bb mark, then a gold hairline, then the descriptor set on two lines (BUBBLE / CRAPS, TABLE / CRAPS). Use it in app headers and nav bars.

**Keep the master wordmark identical in both apps.** The descriptor, icon colour and motif carry the difference.

## 6. Chip mark and chip set inlay spec (`08-`)
**Construction** (1000-unit chip, all flat):
- body r500
- 6 edge spots, 26° wide, r372–500
- gold ring r340–362
- inlay r328

**Inlay content:**
- `value` = numeral only. Use it at 24–40 px.
- `value-mark` = small Bb chip mark above the numeral. Use it at ≥64 px.
- Numerals are Cinzel 800 **without "$"**. The $ glyph cost legibility at 24 px, and casino chips commonly show the bare value. Denominations are still referred to as $1…$500 in copy.

| Chip | Body | Edge spots | Inlay | Numeral / mark | Ring |
|---|---|---|---|---|---|
| Brand (Bb) | #0F4A31 | #F4EEDF | #141414 | #E4CC8F | #C9A961 |
| $1 | #F4EEDF | #2C5A9E | #FBF8F0 | #1F3F73 | #C9A961 |
| $5 | #B0202B | #F4EEDF | #F4EEDF | #8E1520 | #C9A961 |
| $25 | #1D6B44 | #F4EEDF | #F4EEDF | #0F4A31 | #C9A961 |
| $100 | #141414 | #C9A961 | #141414 | #E4CC8F | #C9A961 |
| $500 (purple) | #5B2A86 | #E4CC8F | #F4EEDF | #4A2070 | #C9A961 |

$100 is the high-limit exception: black inlay with light-gold numerals. $500 is purple. The set is $1, $5, $25, $100, $500 only; there is no $10 chip anywhere in the apps or marketing (Bill, Oct 10).

**Pixel tests:**

| Size | Result |
|---|---|
| 64 px | Everything reads, including the Bb on value-mark. |
| 32 px | Every value reads. |
| 24 px | 1, 5 and 25 are clear. 100 and 500 are legible but tight. The UI should show 100/500 chips at ≥28 px, or use a value tooltip. |

The brand-chip Bb reads at 24 px.

## 7. App-icon guidance (marks for bb-mockups)
I own the marks; the bb-mockups worker owns the final icons. Masters are in `07-bb-mark/` and `09-app-icon-guidance/`. The icons are 1024 full-bleed squares; the OS applies the corner mask.

| | App 1 · Bubble Craps | App 2 · Table Craps |
|---|---|---|
| Ground | emerald felt (radial #1F7A50 → #062419) | **midnight-blue felt #123794** (radial #1E4BB0 → #123794 → #0B215C), shown as a felt corner on a wood rail (#6E3B20 → #2A150C) |
| Motif | gold bell-jar dome (#C9A961) around the mark, 3 cream bubble rings | cream felt edge, two gold inset lines following the corner, a table die and a white ON puck |
| Mark | `bb-icon-mark` color-dark, ≈48% of the canvas width, inside the dome | `bb-icon-mark` color-dark, ≈46% of the canvas width, lower-left of centre, with the ON puck to its right |

**Rules for both icons:**
- No text in icons.
- Keep the mark in the central 80%.
- Don't put Billy and the Bb mark in the same icon.
- If a mascot icon is wanted (e.g. for marketing tests), use Dealer Billy's portrait or the avatar head (§9) on the same app ground.

**App 2 is aligned with the bb-mockups icon** (`/workspace/bb-mockups/app2-table/icon/app-icon-1024.png`): same layout, a Bb on a midnight-blue felt corner with a wood rail, gold lines, the die and the ON puck. This version is the flat-vector master from the logo system. bb-mockups' rendered icon stays the final store art.

**The App 2 table die is solved by the die model:** front 5, top 3, right 1. These are adjacent faces, right-handed, and the pips are placed by the model.

Checked at 60 px: the two apps are distinguishable by colour and motif alone (green dome vs blue table corner).

## 8. Felt and rail versions
| Surface | Version | Contrast |
|---|---|---|
| Billy Bubs felt (#0F4A31) | felt-print-2ink, gold + cream | gold 4.6:1 |
| Vegas Red felt | felt-print-2ink | 4.1:1 |
| Blue felt (also App 2's midnight #123794) | felt-print-2ink | 4.0:1 (gold on #123794: 4.7:1) |
| Black & Gold felt | felt-print-2ink | 7.7:1 |
| **Classic Green** (#1D7A4A) | **classic-green-lightgold** | light gold 3.4:1 (standard gold is only 2.4:1) |
| Leather rail | **rail-foil-2hit**: gold foil + pearl foil, small cut | gold 7.3:1 |
| Leather rail, budget | **rail-foil-1hit**: one gold foil, die pips knocked out | |

Minimum rail size: 50 mm wide. At 70 mm the hairlines stay ≥0.25 mm.

## 9. Dealer Billy (option A) and which cut to use at which size
Full character: `10-mascot/A-dealer/billy-A-<pose>.svg`. It is flat and print-ready, with poses hello, winner, sevenout, tip, live and portrait.

**Small-size cut and avatar head** are in `/workspace/bb-logos/mascot-die/svg/A-dealer/small/` (copied into `final/10-mascot/A-dealer/small/`):
- `billy-A-small-smile.svg`, `billy-A-small-win.svg` and `billy-A-small-sevenout.svg`, each with @48, @32, @24 and 512 PNGs.
- `billy-A-avatar-round.svg` (felt disc with a gold ring) and `billy-A-avatar-round-transparent.svg`.
- `small-cut-test.png`: the full character vs the small cut vs the avatar at 48/32/24 px, on felt and on cream, with a 4× pixel zoom of the 24 px.

**What the small cut changes:**
- It is hand-built on a 100-unit grid.
- It drops the legs, gloves, arms, translucency, fine shines and the side-face pips.
- It has a bold 4.6u outline (1.1 px at 24 px), larger eyes with one catchlight, and a larger red nose. The nose is still the 1-pip, so the die stays legal: the only pip-bearing face shown is the 1.
- The hat is reduced to a solid silhouette with a heavy gold band, and the die depth is reduced so the face dominates.
- The avatar is **round-safe**: every pixel falls within r = 43 of a 100-unit disc. The gold ring is at r = 46–48, so it survives any circular crop.

| Rendered size | Use |
|---|---|
| ≥ 96 px | Full Dealer Billy (any pose) |
| 48–95 px | Full portrait, or the small cut if the background is busy |
| **24–48 px** | **Small cut** (smile / win / sevenout) |
| Circular crops (chat heads, profile, notifications) | **Avatar head**, at any size ≥ 24 px |
| < 24 px | Don't use Billy; use the Bb mark |

**Billy's voice: use real craps calls, never generic "lucky roll" or casino copy.**

| Expression | Calls |
|---|---|
| smile | "Coming out!" (new come-out roll), "Same shooter, coming out.", "Nina from Pasadena!" (point of 9 made) |
| win | "Yo-leven!" (Yo = 11), "Winner, pay the line!" (pass line wins), "Yo! Eleven, pay the field." |
| sevenout | "Seven out, line away." |

- In copy, bet names follow the felt: Pass Line, Don't Pass Bar, Come, Don't Come, Field, Place 6 & 8, Big 6 / Big 8, Hardways (Hard 4/6/8/10), Any Seven, Any Craps, Horn, Yo (11), Aces, Ace-Deuce, Twelve.
- Bubble Craps adds Regular vs Crapless.


## 9b. Mascots: Dealer Billy (tutor) + Bubbles Billie (cheer)
Sheet section 07 in `logo-system.png` shows all of this.

**Roles**
- **Dealer Billy = the tutor.** He explains bets, odds and house edge, and he owns tips, tutorials and rules screens. He makes the stickman calls.
- **Bubbles Billie = the cheerleader.** She celebrates wins, calls the action and softens the seven-out. She never teaches the math; that is Billy's job.
- One speaks at a time: a single speech bubble per scene.

**Files**
- Billie poses (flattened: gradients to flat tokens, translucency pre-blended, ground shadow dropped, picosvg-flattened; 0 masks, filters, strokes, transforms or opacity): `10-mascot/billie-C-fascinator/`. Source art (read-only): `/workspace/bb-logos/mascot-billie/svg/C-fascinator/`.
- Duo lockup: `04-mascot-lockup/billybubs-duo-lockup-billie-C-billy-A-color-dark|color-light.svg/.png`.

**Size rules (both mascots)**
| Display size | Use |
|---|---|
| ≥ 96 px | Full character, any pose |
| 48–95 px | Small cut preferred; the full character works from about 64 px with room around it |
| 24–48 px | Small cut only (`billy-A-small-*`, `billie-C-small-*`) |
| Round crops (chat heads, profiles) | `*-avatar-round*` (round-safe) |
| < 24 px | No mascot; use the Bb mark |
| App icons, chip inlays | Never; these carry the Bb mark only |

**Pairing do's and don'ts**
- **Do:** Billie on the LEFT, Billy on the RIGHT. She is drawn from her left and he from his right, so they turn toward each other and toward the wordmark.
- **Do:** same scale (both are built on one 600×680 character frame, so scale them together), a shared baseline, and a gap of at least 0.17 em of the wordmark.
- **Don't** swap sides (they end up back to back), mismatch their scale, mirror-flip either one (it breaks their die pips), or recolour her fascinator or his bowler.
- **Don't** put either mascot inside an app icon or a chip inlay, or let one sit on the wordmark.

**Billie's callouts (real stickman and table calls only)**
| Pose | Call |
|---|---|
| hello | "Coming out! New shooter!" |
| cheer | "Back up that line!" (take odds behind the Pass Line) |
| winner | "Winner! Pay the line." |
| sevenout | "Seven out, line away." |
| tip | "Take the odds: they pay true." |
| table | "Mark the six!" (the point is six) |
| portrait / extra | "Yo-leven! Front line winner!", "Nina from Pasadena: point made!", "Hard eight, pay the hardway!", "Same shooter, coming out!" |

**Product copy rules (Bill, Oct 10):** the hot-streak meter is **Blazing** (never "Heater"). Chips are $1, $5, $25, $100 and purple $500, with no $10. **Premium is sold per app.**

**Social handle:** `@billybubscraps` on every platform (the social kit lives in `/workspace/bb-logos/social/`).

## 10. Color tokens (CMYK values are coated-stock approximations; proof on press)
| Token | Hex | RGB | CMYK ≈ | Use |
|---|---|---|---|---|
| Brand Gold | #C9A961 | 201, 169, 97 | C20 M30 Y70 K5 | wordmark on dark felts; metallic gold foil |
| Light Gold | #E4CC8F | 228, 204, 143 | C10 M18 Y50 K0 | Classic Green felt; numerals on black chips |
| Deep Gold | #9C7F3F | 156, 127, 63 | C30 M40 Y85 K20 | rules and accents on light grounds |
| Cream | #F4EEDF | 244, 238, 223 | C3 M4 Y12 K0 | die, descriptors, pearl foil |
| Casino Red | #B0202B | 176, 32, 43 | C15 M100 Y90 K10 | pips, die on light, hat and bow tie |
| Ink | #141414 | 20, 20, 20 | C60 M50 Y50 K100 rich / K100 text | one-color, outlines |
| Felt Green | #0F4A31 | 15, 74, 49 | C90 M35 Y85 K45 | Billy Bubs felt; word on light |
| Classic Green | #1D7A4A | 29, 122, 74 | C85 M20 Y85 K10 | classic felt theme |

Pantone matches are not specified. Have the printer match to these hexes, or to a drawdown.

## 11. Type system, clear space, minimum sizes, don'ts
**Type system:**

| Role | Font |
|---|---|
| Logo | Playfair Display Italic 900, outlined artwork only |
| Descriptors and chip numerals | Cinzel 700/800, caps, tracked +300 for descriptors |
| UI | Archivo 400–800 (Archivo Condensed widths for dense tables and bet labels) |
| Billy's voice (speech bubbles) | Fraunces 800, SOFT 100 |

All four are Google Fonts (OFL).

**Clear space:** X = the height of the die tittle (0.228 em), on all sides. For the Bb mark, X = its die height.

**Minimum sizes:**

| Asset | Minimum |
|---|---|
| Wordmark, regular | 240 px wide / 60 mm |
| Small cut | 100 px / 25 mm |
| Stacked | 90 px / 22 mm |
| Sub-brand lockup | 300 px / 75 mm (below that, use the compact version) |
| Bb icon mark | 24 px / 8 mm |
| Bb chip mark | a 16 px inlay (24 px chip) |
| Rail foil | 50 mm |

**Don'ts** (illustrated on the sheet):
- Don't stretch or squash.
- Don't use standard gold on Classic Green.
- Don't recolor outside the tokens.
- Don't drop the die or the swash, or replace the die with a dot.
- Don't rotate the mark or set it on a curve.
- Don't add shadows, glows or bevels.
- Don't re-type it in live text.
- Don't put the wordmark on busy photos without a felt or ink panel.

## 12. Self-QA
- **Geometry:**
  - Every mark is generated from code (`_source/geo.py`): outlined Playfair glyphs, hand-built die (circular-arc corners with rotation baked in), and swash Béziers.
  - There are no raster traces and no AI imagery.
  - Die-to-letter clearance is machine-checked by raster dilation (`qa_clear.py`): 36 units (regular), 84 (small cut), 104 (Bb mark). No touching anywhere.
- **Flatness:** 120 SVGs (incl. 50 new Billie files), 0 violations (no masks, clips, filters, strokes, transforms, opacity or text). The two app-icon guidance comps keep linear-gradient fills (screen-only comps for bb-mockups, not print files).
- **Small sizes:**
  - The wordmark was checked at 240 px (regular) and 120 px (small cut).
  - The Bb was checked at 24 px.
  - Chips were checked at 64/32/24.
  - Icons were checked at 60 px.
  - Dealer Billy's and Bubbles Billie's small cuts and avatars were checked at 48/32/24.
- **Bug found and fixed:** a path-transform bug offset vertical (V) segments. It showed as stray strokes on the chip numerals; it was fixed and the chips and icons were rebuilt.
- **Dice:**
  - The die tittle shows a single legal face (3).
  - The small-cut Billy shows only the 1 (the nose). Its side faces carry no pips, so there is nothing to contradict.
  - The full Dealer Billy poses keep the solver-checked faces from `MASCOT-NOTES.md`; Billie's (front 1 / top 2 / left 3) are checked in `mascot-billie/BILLIE-NOTES.md`.
- **Contrast:** gold ≥4.0:1 on every felt except Classic Green, which uses light gold at 3.4:1 (fine for large logo use, though below the 4.5:1 text threshold).
- **Language:** all callouts and specimen copy use real craps terms ("Coming out!", "Yo-leven!", "Winner, pay the line!", "Seven out, line away.", Pass Line, Place 6 & 8).
- **Trademarks and competitors:** no casino marks are used, and nothing resembles Tappy's, Simple Craps', Bluff Craps' or Crapsee's marks (visual check only, not a legal search). The "Bubble Craps" name overlap is flagged in §1.
- **Known limits:**
  - The felt and foil renders on the sheet are simulations, not press proofs.
  - CMYK values are approximations.
  - App icons are guidance comps for bb-mockups to finalise.

**Rebuild:** run the following with `/workspace/bb-logos-venv`:
```
cd final/_source && python build.py [--mascot A|B|C] && python export_small.py && python mascots.py && python sheet.py
```
