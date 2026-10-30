# QA report — Billy Bubs Bubble Craps

Phone viewport 390×844, Chrome headless, local static server. No console errors or warnings on the capture pass. First-load transfer about 266 KB. No horizontal page scroll (`scrollWidth` equals the viewport).

Screenshots:

- Before: `docs/qa/before/`
- After: `docs/qa/after/`

## Before

`docs/qa/before/` is the first capture, before the visual and interaction pass.

| Shot | What was wrong |
| --- | --- |
| `01-home.jpg` | Home sat in the top half. The dome was small and the mode cards did not fill the phone. |
| `02-dome.jpg`, `02-dome-settled.jpg` | Dice were CSS 3D cubes. They did not read as dice inside the dome. |
| `03-board-regular.jpg` | Pass Line sat under the dock. Prop bets (Field, hardways, ATS, Big Red, C&E, Any Craps) could only come down with RESET. Horn 4-way was not on the felt. |
| `08-bet-lay.jpg` | A Don't Come that had already moved to a number offered a plus that the engine rejected as an unknown bet. |
| `06-fair.jpg` | Totals and the chi-square readout were present. Streaks were not. |
| `settings.jpg` | Place/Buy on the come-out was a switch. Hardways-on-come-out and come-odds-off were engine defaults with no switch. |

Severity: the Don't Come plus and the missing Horn bet were functional. The dice and the buried Pass Line were the visual blockers.

## Fixes

- Home is a column: logo, dome with two flat dice (5 and 2), disclaimer, mode cards, and the Regular call to action.
- Dome dice are 2D pip faces. They tumble with transform, then settle on the real faces. Reduced motion skips the tumble.
- Felt spacing was tightened so the Pass Line sits fully above the dock on 390×844. BETS OFF, Billy's Way, RESET, and the bet panel start just under that fold and scroll into view.
- Horn 4-way is on the felt. A $5 or $25 chip posts the largest $4 unit inside that chip and leaves the remainder in practice chips. A $1 chip is refused.
- Bets that are not on the current Place/Buy/Lay/Odds rows show under "Also on the layout" with a 44px minus.
- Don't Come on a number can only be taken down. The plus explains that.
- Settings: hardways working on the come-out (default on), come odds off on the come-out (default on).
- Fair Dice adds streak counts and says a long gap does not change the next roll.
- Footer on every screen is the one line `18+ · Practice only · No real money`.

## After

`docs/qa/after/` was recaptured after those fixes. Console errors: none. Transfer: 266,047 bytes. Document scroll width: 390.

| File | Screen |
| --- | --- |
| `01-home.jpg` | Home, disclaimer, Regular and Crapless, footer |
| `02-dome.jpg` | Dice screen before the tumble settles |
| `02-dome-settled.jpg` | Dome after a roll, puck, meter, last rolls |
| `03-board-regular.jpg` | Regular felt, ATS, Pass / Don't / odds / lay |
| `04-board-crapless.jpg` | Crapless: 2, 3, 11, 12 on the numbers; no Don't, no ATS, no Lay tab |
| `05-tutor.jpg` | Dealer Billy, step 1 of 7, education disclaimer |
| `06-fair.jpg` | Empty Fair Dice state, secure RNG, locked CSV |
| `07-win.jpg` | Bubbles Billie, Pass Line natural, +$100 practice chips |
| `07-after-roll.jpg` | Board after that roll, overlay closed |
| `08-bet-place.jpg` | Place tab, edges, 44px steppers |
| `08-bet-buy.jpg` | Buy tab |
| `08-bet-lay.jpg` | Lay tab, Don't Pass and lay odds |
| `08-bet-odds.jpg` | Odds tab |
| `09-learn.jpg` | Strategy library |
| `11-premium.jpg` | Locked preview, no purchase |
| `13-bet-crapless.jpg` | Crapless Place tab, 2 through 12 except 7 |
| `14-side.jpg` | Repeaters and 21 hops |
| `settings.jpg` | Sound, haptics, timer, come-out switches, tracks |

Checked in the live DOM, not only in the pictures: Crapless text has no Don't and no ATS, the Lay tab is absent, and the ten Crapless numbers are 2, 3, 4, 5, 6, 8, 9, 10, 11, 12. Pass Line bottom was 544px and the stage ended at 553px, so the line is on screen above the dock.

## Design review

The designer review (D1–D22) is applied on top of the rules pass. Brand fonts load from `css/fonts.css` before `css/app.css`: Cinzel on the felt, Archivo on the UI, Fredoka on speech, Orbitron on LED captions, VT323 on the tumble line, Cinzel Decorative on BIG WIN.

The middle board order is ATS, numbers, Come, Field, props, then Pass last. The cloth uses the emerald felt tile, a leather rail, the printed wordmark, and chip stacks. Big Red is `#C21F2E`. Any Craps, C&E (`C 3:1 · E 7:1`), and Horn 4-way sit beside the Horn box.

The Play view hides the tab bar. Home is a button in the HUD. There is no second bankroll bar. PRESS and POWER PRESS show the live amount and the reason they are off. Undo is a ↺ disc on PRESS. Bets Off, Billy's Way, and Reset stay under the dock. ROLL does not overlap those keys.

A seven-out is a toast with Dealer Billy (`Seven out.`). A small win is the roll toast. A big win overlay stops above the dock, dismisses itself, and does not call the auto-roll stop. Place 6 and 8 post in $6 units.

Landscape phones (500px tall or shorter) keep the chip and on-table row in the top bar and keep the legal line on its own 26px row. The dock is a right column. Wide desktop windows still center the phone column, now on a felt backdrop.

Side-by-side shots of this pass against the mockups are in `docs/qa/compare/`.

## Run 4

Both reviewers failed the previous build. This pass fixes the failures they could reproduce in the app.

- PRESS and POWER PRESS paint again after the dice settle, so a hit lights the keys. Before the first tap the line is the amount only. After a tap it adds the tap count.
- A mouse or trackpad click on the felt, a hop, or a repeater places the bet. Pointer capture starts only after a sideways drag passes 12px. Playwright clicks Pass Line and Place 6 with a mouse, then a forced 6, and checks that PRESS 6 is enabled.
- Auto-press counts reset on a seven-out, on Reset, when Billy's Way posts that number again, and when the bet is taken down. A power-press or auto-press message leaves off a $0 return.
- A roll that nets zero or a loss is never a BIG WIN, and the amount line is never +$0. ATS, Hard Way All Day, and Repeater wins use their own copy on a real win.
- The Blazing meter has four segments and no Fire footnote. Hot and Blazing fill different amounts.
- The bet sheet sits inside the stage, above the chip rack and ROLL, with a handle, a close button, and a tap-outside scrim.
- The board grows to fill the stage. At 390px the number faces measure 29.6px, SIX and NINE 18px, and BUY/PLACE 8px. The felt "practice" line is dropped because the footer already says it.
- The dome shows the full hood (glass, base, lights, air-jet floor) with one outline. The dice are CSS cubes from the cube handoff, rendered on `document.body` so the pager transform and the stage overflow do not flatten them. They tumble for about a second and settle on the rolled faces. Reduced motion fades instead.
- Dealer Billy (hello, tip, live, seven-out, winner) and Bubbles Billie (hello, cheer, winner) are the SVG poses. The home line "Bets down! Air's coming on." is a speech bubble on the hero. Billy calls the point on the dome. Billie cheers wins and hot streaks. Idle motion turns off when reduced motion is on.
- Landscape shows Chips and On table, and the legal line is fully on screen.
- Last 20 reads oldest to newest, with the newest chip marked. Fair Dice prints the verdict that matches the test (Need more rolls, Looks fair, A bit unusual, Rare result). The first time auto-press is turned on, a tip explains it. A $500 chip on Place 6 or 8 posts $498, the largest $6 unit under the table max.

## Run 6

Both reviewers failed runs 4 and 5. This pass follows the re-review specs and spec rev 11.

- The initials card is a layer between the HUD and the dock. It does not cover ROLL. SKIP posts the hand as "—". "New record!" is only rank 1. A pending hand survives reload. Player-facing Bubble copy does not say "shooter".
- At 375×667 and 844×390 the felt scales as one 354×471 piece (scale 0.78) and the page scrolls so the Pass Line stays reachable. At 390×844 and 430×932 the felt stays the flex layout. Row gaps stay positive. The bankroll stays on screen with a point on.
- Landscape dice sit inside the contained hood, on the air bed. The grey shine behind the glass is hidden. A tumble sets the rolled faces first, eases through two bounces, and ends on that rest pose. Warm, Hot, and Blazing glow on the die faces.
- BIG WIN uses Billie only. PRESS stays two lines after a press. A click that follows a swipe is swallowed once, then the next press works.
- A hand posts only when a bet was working on the seven-out. Test-forced rolls (`window.__bbRng`, localhost only) are not posted.
- Auto-roll is off by default. Session loss limit and win goal are off by default. Regular and Crapless switch only before the first roll of a hand.
- B13 Continuous Come and B14 Hit and Split are in the library. The dock shows the optional cap, odds level, start number, and crapless extension while that strategy is running.
- The Rolls screen has the LED board (medals, tier, YOU, live hand) and the 30-badge gallery. Badge art is in `assets/badges/`.

69 tests pass. `robots` meta `noindex, nofollow` is still on the page. Compare shots for this pass are `docs/qa/compare/run6-*`.

## Run 7

Both reviewers failed run 6 (`b2c56bc`). This pass follows the re-review specs, the rules notes, and spec rev 12a.

Measured in Chromium at 390×844 and 844×390 (`shot-run7.mjs`). Compare shots are `docs/qa/compare/run7-*`.

- Badge toasts auto-hide (3.0s, 4.5s for gold, legendary, and marquee). A tap or swipe on the card dismisses it. The card stays inside the phone column (left 12, right 378 at 390) and sits above the page dots and the chip rack. It does not cover those hit targets.
- One mascot at a time. Hot and Blazing show Dealer Billy only. A gold or legendary toast, and BIG WIN, hide the dome Billy while Billie is on the card.
- The felt scale follows the stage and the dock (`--felt-k = min(stageW/390, stageH/505)`, floor 0.78). At 390 with Continuous Come option chips up, k is 0.922 and the strategy chips are one 36px scrolling row. Place hit area is 44px.
- Gallery bars are 4px blocks. The gallery reads "Badges N / 30 earned", with tier bars 7 / 9 / 9 / 5 and the category headers.
- Landscape (844×390): Regular and Crapless are 28px pills and do not overlap Chips or On table (Crapless ends at 190px, Chips starts at 200px). The dock column is 156px, chips are 36px, and the undo disc sits inside the dock (808–840 inside 688–844).
- Settings initials are three VT323 24px boxes (`#140F08`, gold border). Typing a letter focuses the next box.
- Point badges count only a paid Pass Line. A limit set or lowered mid-session applies on the next roll; the badge snapshot stays at session start. Session chips are captured before the first roll. B14 collects a side hit and, after two collected hits, waits for the next point before re-placing. The initials blocklist allows BJ. A 30-minute idle end counts toward the session badges. Press Once Then Collect waits for the next roll. A Field bet keeps that hand out of the Under 2% Club. RESUME paints as soon as auto-roll pauses. A pending record card survives reload.
- POWER PRESS uses Bill's rev 12a ladder. Standard table max is $1,000. The key reads `POWER PRESS 6 → $18 (add $5)` and takes the add from chips. Off-ladder jumps to the highest step inside one unit, then falls back to round-down. Premium B-31 shows Standard as live and Scaled and Custom as locked.

79 tests pass. `robots` meta `noindex, nofollow` is still on the page.

Still open after run 7, and closed in run 8 where noted below: blazing ember trail, badge detail "THE RULE" card, dome roll-history overflow, roll-toast spacing, and the right-aligned LED roll count. Still open: one-line limit chip, coach "WARM", the landscape felt rail, long-press bet preview, and the wide three-column layout.

## Run 8

The settled die was showing the result toward the camera while a different face sat on top. Rest poses now put the engine face on top, tipped toward the camera, with the pips upright. A browser test composes each face matrix with the cube rest matrix and checks all 36 pairs. Hardways, hops, and the horn settle from those same two faces. The sweep is `docs/qa/compare/run8-dice-36.jpg`.

ATS (Low Rolls, High Rolls, Roll 'Em All, the sweep, and Spin the Block) is on in Crapless. Pays stay 31 / 31 / 156 for 1. Any 7 loses them, including a Crapless come-out 7, and Pass can win on that same roll. The five ATS badges count in both modes. Billy's Way is unchanged.

Measured in Chromium (`shot-run8.mjs`):

- Dome history shows the 10 newest rolls, nowrap, overflow hidden. The dock LAST 20 strip is gone on the dice page.
- The ON puck is 36px, flush to the top-right of the point box (top 1px, right 0). The HUD puck stays.
- After a Place 8 hit the keys read `PRESS 8 +$6` / `→ $12` and `POWER PRESS 8 → $18` / `add $5`.
- A roll toast sits under the HUD (`top` 105px at 390) with the net in its own pill: `4·4 · HARD EIGHT | $7 | TAP FOR DOME ›`.
- At 430px wide, `--felt-k` is 1.103 (cap 1.12, floor 0.78).
- At 390, the point name ends at 226px and the mini dice start at 230px, so SIX is not clipped.
- The leaderboard roll count is VT323 28px `#FFD36A`, right-aligned.
- Badge detail shows Title Case tier and mode pills, a THE RULE card, and Odds / Pays / Edge.
- Settings "Save initials" and "Apply to my existing entries" are gold pills.
- Blazing dice use a 600ms ember animation. It is off under reduced motion.
- Crapless shows the three ATS spots. Stage `touch-action` is `pan-y`.

Auto Power Press toasts "Collected: not enough chips for the next step" when the give does not fit. A hand press on a Hit and Split number is not regressed. Six lost starts stop B14. A come-out 7 does not count as a lost start. Play this for B13 and B14 shows the bankroll check and can set a 40% loss limit and a 30% win goal. The session summary includes the longest hand, whether the limits were kept, and badges earned. #28 needs a loss limit. Ending before the next roll counts for #28 or #29. If both limits were hit, #29 wins. An idle end counts for #30 only.

86 tests pass. `robots` meta `noindex, nofollow` is still on the page.

## Run 9

Mini dice in the hop icons and the HUD use a 3×3 grid that fits inside the face, so Hard 4 reads 2·2 and Hard 6 reads 3·3. The gold and legendary marquee is `position: fixed` and stays inside the viewport at 375, 390, 430, and landscape. The settled 3D dice are true rotations (determinant +1) with the engine face on top, opposite faces summing to 7, and a right-handed 1-2-3 corner. Compare: `docs/qa/compare/run9-dice-36.jpg`, `run9-hops.jpg`, `run9-marquee-*.jpg`.

Roll readouts use the face art instead of `n·m = total`: the dome result, the roll toast, the HUD, the bet-panel LED, the Last strips (14px, with a total-chip fallback under 340px), Fair Dice history, and the record card. The leaderboard stores `sevenOutDice`. Badge #28 does not need a loss limit, and Keep playing past the win goal does not unlock it. The marquee line includes the badge odds and a House edge label. Spin the Block’s odds cell says “About 1 in 523 hands”. B13 still offers a 40% loss limit and a 30% win goal.

A coach card hides the dome Billy. Sheets sit above the dice. The felt ON puck sits inset so it does not cover the number word. The HUD roll counter uses Cinzel, and the two money labels have a 14px gap. The landscape DOME pill stays on one line.

## Run 10

An open coach card no longer blocks the table. The full-screen overlay ignores pointer events, and only the card itself receives them. With a PRESS card open, ROLL advanced the hand from 2 to 3, UNDO cleared the press, and the $1 chip still selected. Compare: `docs/qa/compare/run10-coach-roll.jpg`.

One mascot shows at a time, in this order: badge marquee, big win, heat cheer, tutor. A seven-out toast hides the dome Billy. A coach card hides the place-win cheer. A marquee hides the BIG WIN Billie. A Hot or Blazing cheer hides the dome Billy. Each of those cases measured one visible mascot.

The cubes are Western right-handed. Face 3 sits on the left at identity and face 4 on the right, and the rest poses for 3 and 4 were swapped with them. With 1 on top and 2 in front, 3 points to the right. All 36 settled top faces still match the engine. Compare: `docs/qa/compare/run10-handedness.jpg`.

The dome roll strip stays open. It measured 34px tall at 375, 390, and 430, with pip tiles rather than the totals fallback. Fair Dice Last 20 is two rows of 10 pip tiles at 375 (321px) and 390 (336px). Totals remain for a short landscape, a root font of 130% or more, and a strip under 300px.

The ON puck sits on the corner of the number box, clear of the numeral. The Blazing meter keeps 8px before FAIR and shows 3 pips under 400px. Two-digit HUD totals have 6px of trailing padding. The marquee VIEW button stays inside the card. "· seven out" stays on the Ended-on line. A come-out 7 is not announced as a seven-out. An easy number is read "five and three, easy eight". The seven-out toast and the BIG WIN banner show the pip dice, with a SEVEN OUT tag on a seven-out. The B13 library card says stop-loss 40% and a +30% win goal. A tutor line that cites a roll uses pip dice.

89 tests pass. `robots` meta `noindex, nofollow` is still on the page.

## Run 11

Both reviewers failed run 10 on the tile clip, the landscape coach, and the heat-sheet mascot. Measured in Chromium. Compare shots are `docs/qa/compare/run11-*`.

Each Last 20 tile is 30px with no border, and each face is a fixed 14px, so the two dice sit on one row. At 375, 390, and 430 the dome strip is 309×34 and shows pips; both faces in a sample tile share the same top. All 36 pairs were checked at 320, 375, 390, and 430: each face rect sits inside its tile and the file is `face-N.svg` (the art has N pip circles). A strip under 309px uses totals, so the 320px dome (304px wide) does not crop the end tiles. Fair Dice Last 20 at 390 is two rows of pip tiles, 336px wide, and a lower row does not cover the one above it. The latest tile’s gold outline is inset.

A short landscape coach is at most 600px wide and stops 200px short of the right edge. At 844×390 and 932×430 the ROLL hit target is the roll face, and the hand count goes from 0 to 1 while the card stays open.

The first Hot lesson on the dome is one mascot. The dome Billy is `visibility: hidden` while any overlay image from `assets/mascots/` is up. Compare: `docs/qa/compare/run11-heat-sheet.jpg`.

The phone HUD keeps all four Blazing segments. Under 440px they stack beside the flame, so Hot (3) and Blazing (4) still differ, and the row does not clip them. After a 6-6 with the point on 10, FAIR’s right edge is 369 at 375, 373 at 390, and 413 at 430. The last-roll pill is wide enough for both dice and the total.

ROLL stays available during BIG WIN. The banner, including its pips, is cleared at the start of the next roll. The Hard 4 tag is 16px and does not run under Billie. The coach kicker changes from POINT IS ON to COME-OUT when a roll changes the phase. “Ended on” stays on one line, and the readout no longer stretches across the record card. At 375, Spin the Block’s title ends before VIEW.

91 tests pass. `robots` meta `noindex, nofollow` is still on the page.

Still open after run 11: R7-6 (B5 coach edge), R6-7 (badge timing #1–#4), R6-10 (#25 fairness scroll), R6-11 (#26 practice days), R6-14 (test rolls unlocking badges on localhost), P2-11 (tutor rows), P2-18 (long-press preview), P2-19 (layout at 1400px and up), P2-21 (cent flooring), P2-N8 (first-time auto-press card), R5-4 (pinned current-hand row), Premium B-31 Scaled and Custom ladders and a variable table max, the Table Craps turn log, and Spin the Block’s marquee facts line still appending the Low/High Rolls pay and edge. The spec header still says rev 13b.

## Run 12

Store-screenshot polish on top of run 11. Measured in Chromium. Compare shots are `docs/qa/compare/run12-*`.

Gold and legendary marquee titles wrap, two lines at most, instead of truncating. At 375, “Spin the Block” is the full string (`white-space: normal`, title box 41px, the text is not clipped). At 390, “Hard Way All Day” is the same. The title stays left of VIEW. Compare: `run12-marquee-375.jpg`, `run12-marquee-390.jpg`.

Spin the Block’s facts line is “About 1 in 523 hands Regular, 1 in 565 Crapless”, then the 31-for-1 pay and the 18.30% edge once. Hard Way All Day’s odds line is “About 1 try in 210.” The toast adds “165 for 1” and “21.43%” once each.

The dome strip measures the dome container. At 390 the container is 374px, so roll 1, roll 5, and roll 10 all show pips, side by side, inside the tile. Compare: `run12-strip-1.jpg`, `run12-strip-5.jpg`, `run12-strip-10.jpg`. The scaled 320px column is 336px in CSS pixels, which is over the 309px cutoff, so that dome shows pips too and the faces stay inside the strip. Fair Dice at 320 still uses totals.

Landscape 844 hides the heat word. FAIR is 635–682 and the dock starts at 688. All four heat segments stay. At 1440 the phone column is 480–960, FAIR is 907–951 inside it, and the word is hidden. Compare: `run12-hud-844.jpg`, `run12-hud-1440.jpg`. At 375, FAIR is 320–364 and the HUD row ends at 367.

The 320×568 play column uses `zoom: 0.909`. ROLL is 241–319 and 78px, the felt is 52–303, and the chip, press, and home controls are 40px. 360 stays at zoom 1, with a 94px ROLL and 44px chips. Compare: `run12-play-320.jpg`.

The BIG WIN bonus line is a centered chip (max 300px, gold border, 10px radius). A legendary marquee queued during that scrim stays hidden until Collect. A direct test show still appears over the scrim, so the one-mascot check is unchanged.

93 tests pass. `robots` meta `noindex, nofollow` is still on the page.

## Run 13

Short phones keep the 3D dice in the glass. `placeDice()` no longer hides the host when the die would be under 28px, and the dice no longer shrink to fit a 16px gap. On a viewport 720px tall or shorter the glass is 280px, so each die is 41px. Taller phones are larger: 54px at 390×844 and 67px at 430×932. The settled top face is the engine face (5 and 2 in the check) and both dice sit inside the bowl. Compare: `run13-dome-320x568.jpg`, `run13-dome-360x640.jpg`, `run13-dome-375x667.jpg`, `run13-dome-390x844.jpg`, `run13-dome-430x932.jpg`, `run13-dome-844x390.jpg`.

At 320 the scaled column would draw strip pips at about 12.7px, so that dome uses totals. The strip stays on the dome. The zoomed play column now fills the 568px height, so the old 52px band under the footer is gone. The footer sits about 10px off the bottom, the same as 390 and 430. The felt can scroll. Pass Line comes fully into the board, and ROLL stays on screen. Compare: `run13-felt-320.jpg`.

The Field lists 2, 3, 4, 9, 10, 11, and 12 in both Regular and Crapless. 2 and 12 are gold circles, and the line under the name reads “2 AND 12 PAYS DOUBLE” (2:1, same as the engine). The seven numbers stay inside the spot at 375, 390, 430, and 844×390. Compare: `run13-field-375x667.png`, `run13-field-390x844.png`, `run13-field-430x932.png`, `run13-field-844x390.png`.

The top-left control is the Dealer Billy round SVG, not a stretched crop. Before, a 1px border and `object-fit: fill` drew it at 38×40 (30×32 in landscape). It is now a square: 40×40 in the 44px HUD row at 390, and 32×32 in the 36px landscape row at 844. `object-fit` is `contain`, the gold ring is the 1.5px `#C9A961` shadow, and the hat stays inside the circle. Compare: `run13-avatar-before-390.png`, `run13-avatar-after-390.png`, `run13-avatar-before-844.png`, `run13-avatar-after-844.png`.

A BIG WIN that pays an ATS bonus shows Billie. The bonus chip at 390 is inset (16px to 272px on a 390px screen). If a marquee is actually on screen, Billie on the scrim hides so only the toast mascot shows. The gold marquee odds no longer end with a period before the pay: “1 in 29 Crapless”, then “31 for 1”. Compare: `run13-bigwin-390.jpg`.

95 tests pass. `robots` meta `noindex, nofollow` is still on the page.

Still open after run 13: R7-6 (B5 coach edge), R6-7 (badge timing #1–#4), R6-10 (#25 fairness scroll), R6-11 (#26 practice days), R6-14 (test rolls unlocking badges on localhost), P2-11 (tutor rows), P2-18 (long-press preview), P2-19 (the wide layout at 1400px and up; FAIR now fits the phone column, the three-column layout does not), P2-21 (cent flooring), P2-N8 (first-time auto-press card), R5-4 (pinned current-hand row), Premium B-31 Scaled and Custom ladders and a variable table max, and the Table Craps turn log.

## Run 14

The short-screen glass no longer pins `.machine` at 280px on every viewport under 720px tall. Portrait still caps the bowl at 280px and lets it flex, so the result line and the roll strip stay on the page. Landscape drops that cap. The strip is shown again at 844 and 932. At 320×568, 360×640, 375×667, 390×844, 430×932, 844×390, and 932×430 the dice are at least 40px, and the full HARD TEN line and the roll strip sit inside the viewport. Compare: `run14-dome-320x568.jpg`, `run14-dome-360x640.jpg`, `run14-dome-375x667.jpg`, `run14-dome-390x844.jpg`, `run14-dome-430x932.jpg`, `run14-dome-844x390.jpg`, `run14-dome-932x430.jpg`.

The portrait header keeps the square Dealer Billy avatar (`object-fit: contain`, no second gold ring) at 36px and replaces the floating compact wordmark with `topleft-lockup.svg` (118.5×36), aligned to the HUD’s left edge. At 390 the home button is 20–56, the lockup 64–182, and the mode switch ends at 370. At 375 the lockup is the same 64–182 and the switch ends at 357. Under 360px the lockup is 30px tall. Landscape hides the lockup and uses `topleft-mark-ring-32.svg` as Home, with left padding `max(6px, env(safe-area-inset-left))`. Compare: `run14-top-before-375.png`, `run14-top-after-375.png`, `run14-top-before-390.png`, `run14-top-after-390.png`, `run14-top-before-844.png`, `run14-top-after-844.png`.

Field 2 and 12 are 15px numerals in 26px gold rings. The felt line is “2 AND 12 PAY DOUBLE”. Premium 3:1 copy stays locked to the setting (`2 PAYS DOUBLE · 12 PAYS TRIPLE`, `2 PAYS TRIPLE · 12 PAYS DOUBLE`, `2 AND 12 PAY TRIPLE`) and does not change the live 2:1 payout. The screen-reader label is “Field: 2, 3, 4, 9, 10, 11, 12; 2 and 12 pay 2 to 1”, plus the stake when one is posted. The rings stay at least 8px at 375 and at 844. Compare: `run14-field-375x667.png`, `run14-field-390x844.png`, `run14-field-430x932.png`, `run14-field-844x390.png`.

Tutor “Long shot” is only a prop that wins on fewer than about 1 in 6. Any 7, C&E, and Horn are exactly 6/36, so they are not long shots. “High house edge” starts at 9%, so Big Red is “High house edge.” and a hardway is “Long shot with a high house edge.” Place 4/10 (6.67%) gets neither line. The Field has its own line: “Field: wins on 16 of 36 rolls, but the 5–8 numbers lose. 5.56% edge.”

At 360×640, with a point and the last dice up, FAIR ends at 348 inside a pill that ends at 352. Compare: `run14-fair-360.jpg`.

99 tests pass. `robots` meta `noindex, nofollow` is still on the page.

Still open: the run 13 list above. R13-1 (dome result and strip), R13-2 (tutor long-shot wording), and R13-3 (Field screen-reader label) are closed in this pass.

## Run 15

The board uses the Design Desk felt (`.felt.bfx`) for Regular and Crapless. At 320×568, 390×844, and 844×390 the felt stays inside the phone, amount pills stay inside their boxes, and a tap on a number hits the active Place, Buy, or Lay half. Compare: `run15-board-regular-320x568.png`, `run15-board-regular-390x844.png`, `run15-board-regular-844x390.png`, `run15-board-crapless-320x568.png`, `run15-board-crapless-390x844.png`, `run15-board-crapless-844x390.png`.

The seven-out toast is a compact row over the header on portrait screens up to 960px tall, so 390×844 and 430×932 no longer cover the glass. SEVEN OUT stays on one line. Compare: `run15-seven-320x568.png`, `run15-seven-390x844.png`, `run15-seven-430x932.png`.

Portrait Home is the 36px Option A avatar (`hud-billy-A-36`) with no CSS ring, nudged 3px left. Landscape keeps the 32px mark filling the circle. The first pager frame is placed without the slide-in, so a swipe that starts on the Field changes the screen. Experienced Tutor names the Field A1.8 line and the edge, chance, and pay for each hop and repeater. A C&E or Horn unit note, and the first hop lesson, share the toast with the house-edge warning. The dome “Come on, N!” bubble sits 2px above the result line.

103 tests pass. `robots` meta `noindex, nofollow` is still on the page.

## Still short of the mockups

The felt is the right material and order. It is still denser than mockup 15, and felt cells are under 44px so the Pass Line fits. Dock, chips, and bet-panel steppers are at least 44px.

Wide windows stay a centered phone column with a felt backdrop. They do not become a three-column layout. There is no long-press bet preview. The grey-out line for a Place 6 or 8 win under one unit still says the $6 unit.

## Rules pass

The rules review found a C&E overpay and a progress-banking hole, plus several missing Standard behaviors. Those are fixed in the engine and covered by tests.

- C&E pays 3 to 1 on 2, 3, and 12 and 7 to 1 on 11, on the whole stake. A $10 C&E wins $30 on craps and $70 on 11. The spot says `C 3:1 · E 7:1`. The bet is posted in $2 units. The old test that expected $75 and $35 on a $5 C&E was asserting the bug.
- Hard Way All Day and ATS reject more chips once any lamp is lit. Any takedown, including a partial one, clears the lamps. A Repeater takedown clears its tally the same way.
- Regular/Crapless and Home → Play do not refund a working Pass, Don't, or Come bet, and they do not clear a point that is on.
- Settings has auto-press (Off / PRESS / POWER PRESS, max 1–5). It adds to the Billy's Way spot that won and leaves the original bet alone. B5 uses the same control, reopens after a seven-out, and stops after three lost opening spreads.
- Premium lists B-1 through B-30, Regular and Crapless, the presets, and an Edge Preview. Every control on that screen is locked.
- A sideways drag changes screens even when it starts on a felt button, and the dot follows. Playwright drives that gesture when system Chrome is available.
- The Blazing meter can be switched off. The first time each tier appears, the copy says the dice have no memory. A seven-out from a longer hand says the hand cooled off.
- B8 can post a new Buy 4/5/9/10 set after it takes the first one down. B11 pauses after 100 rolls, not 99.
- PRESS and POWER PRESS show why they are grey, including while the dice are tumbling. The $500 cap toast only shows when the bet lands on the table max.

69 tests pass, including the browser swipe, the mouse-click PRESS check, B13, B14, the longest-roll rules, and the badge conditions. `robots` meta `noindex, nofollow` is still on the page.
