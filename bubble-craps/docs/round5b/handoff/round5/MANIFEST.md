# Round 5 (week of Oct 19): MANIFEST. Design handoff only: no build, nothing pushed.
Base: wjenson27-cpu/bb-bc-yrkv, PR #17 branch at /tmp/pr17c (34f012d), read only. Spec: two-games-spec.md **rev 16** (S8–S13) and table-craps-build-checklist.md §20–§25. Reconciled Tue Oct 13 2026, ~1:15 PM PT; the original pass was built against rev 15d.
Market input: market-check-oct2026.md §2 must-haves 1, 2, 3, 5, 6, 7 and nice-to-have 1.

## How to run
`tools/mkcopy.sh` copies /tmp/pr17c to /tmp/r5site/app and injects `proto/r5.css` + `proto/r5.mjs`. Then:
- `cd /tmp/r5site && python3 -m http.server 8881`
- open `/round5/proto/index.html`
- each screen opens at `app/index.html?r5=<screen>` or `app/table/index.html?r5=<screen>`; the iPad layout is `proto/ipad.html?app=bc|tc`.

`tools/shoot.py bc|tc` takes every PNG and runs the checks (shots/verify-{bc,tc}-delta.json, verify-{bc,tc}-ipad.json).

## Files
| File | Status | Source |
|---|---|---|
| proto/r5.css | NEW | Token values REUSE `css/tc-tokens.css` (--panel, --panel-line, --accent, --cmp-1…6, --win/--loss/--amber) and `css/app.css` :root (BC --gold, --line, --dock) |
| proto/r5.mjs | NEW | Injected into a copy of each app; renders 9 screens (rev 16 added `quickpv`) |
| proto/ipad.html | NEW | iPad composition: each column is the shipping pager page |
| proto/index.html | NEW | Launcher |
| tools/mkcopy.sh, tools/shoot.py | NEW | |
| shots/{bc,tc}/<screen>/<screen>-WxH.png | NEW | 9 screens × 11 sizes × 2 apps = 198 PNGs (rev 16 delta re-shot; iPad layouts unchanged), plus 8 iPad layouts and the KEY-*.png contact sheets |

## Pieces, REUSE vs NEW
| Piece | Status | Source file |
|---|---|---|
| Sheet shell (kicker, Cinzel h1, 44px close, footer actions, gold `.go` button) | REUSE | `css/tc-screens.css` .tc-sheet / .sh small / h1; `css/app.css` .sheet .actions .go |
| Segmented controls, gold "on" state | REUSE | `css/tc-screens.css` .tc-compare .seg button.on |
| Premium / free / warning tags | REUSE | `css/tc-screens.css` .tc-picker .tier.prem/.free/.warn |
| List rows (52px, selected = gold) | REUSE | `css/tc-screens.css` .tc-picker .strow |
| Pip readout, total badge, #FFD36A readcall | REUSE | `css/tc-screens.css` .pipro; `css/run15.css` .toast.seven .readcall; `bc-pso/css/pso.css` .pso-plate |
| Text plate (#141A22, gold hairline) | REUSE | `bc-pso/css/pso.css` .pso-plate |
| Chips, dice faces | REUSE | `assets/chips/chip-*-value.svg`, `assets/dice/faces/face-N.svg` |
| Dealer Billy (drill) | REUSE | `assets/mascots/dealer-billy/billy-A-tip.svg` |
| **1 Sessions** (S8, §20) | NEW screen; chart/legend REUSE | Chart and legend styles from `css/tc-screens.css` .tc-compare (CMP-08). Text wraps; no ellipsis. Contents: **rev 16:** tabs This session / All sessions / Your Dice; Practice-chips-total line with start, loss-limit and win-goal lines, seven-out ticks and a pip tooltip; the S8 summary (start → end, net, peak, low, max drawdown, rolls, hands, longest hand); Show as table; the exact footer; neutral net styling (no red/green); all-time = cumulative nets + neutral bars, "Highest / Lowest session", filters. Free: last 20 + totals. Premium: all-time, full list, filters, CSV. Entry points: BC menu › Sessions, TC Stats › Sessions. |
| **2 Your Dice mode** (S9, §21) | NEW | **Rev 16:** a separate labeled mode, not a "manual" toggle. Banner "YOUR DICE · you enter the rolls" in its own token (--yd #6FE3D0); a YOURS tag after every total; a 21-pair quick pad (REUSE hop-tile grid) plus a die-1/die-2 pad; ROLL/SHOOT becomes SETTLE; Undo last roll; Paste a sequence; the S9 onboarding exclusion line. Short phones drop the recent strip and use the die pad. |
| **3 Table rules** (S10, §22) | NEW | **Rev 16:** the four-setting front door: limit tier (Free; values APPROVED and locked in rev 16, incl. TC Salon $500/$25,000), starting bankroll (Free presets, applies through Reset only, "Also reset bankroll"), Field 12 (Premium 3:1, edges, felt line), odds multiple (Premium except 3-4-5x, combined edges, Tutor line). Link to the full Custom Rules list (Premium). |
| **4 Roll speed** (S11, §23) | NEW | **Rev 16:** Normal (default) / Fast / Instant, B-33 / T-32, Free. Timing table copied from S11, including the Fire stinger (TC) and the Rail Change row (TC). Tap the dice to skip; reduce motion wins; auto-roll unchanged (BC); shooter practice capped at Fast (TC). The HUD FAST pill was dropped. |
| **5 Quick bets** (S12, §24) | NEW | **Rev 16:** TC has ACROSS · INSIDE · OUTSIDE at the top of the Bets sheet. BC has INSIDE · OUTSIDE on the Bet Panel's Place tab, and BILLY'S WAY stays its across key. Lower-edge Buy-or-Place per spot (Standard: Buy 4/5/9/10, Place 6/8). The point is skipped by default. One bet per number. Undo / Take down. The `quickpv` long-press preview shows stakes, type, wins, edge, blended edge, at risk on a 7 and rail chips. |
| **6 Billy's Payout Drills** (S13, §25) | NEW | **Rev 16:** Learn › Payout Drills; Dealer level; keypad to the cent; the timer is off; scoring 10/20/30, accuracy and average time, no streak; the S13 D1 example (Place 8, $18 → $21); the Why? math box; the exact footer; Dealer Billy only. |
| **7 iPad layouts** | NEW | BC: 2 columns (Board / Dice), or 3 columns at 1366 (Side bets / Board / Dice), in both orientations. TC: landscape columns 62/38 (3 columns at 1366); portrait has Board over Shooter. Below 1366 the side bets are an edge slide-over tab. |
| Rotate-to-portrait card | NEW | Modal sheets in landscape under 400px tall (844×390); not covered by rev 16 (OPEN) |

## On-table dice throw (Table Craps, round 5, Bill 10/13)
| Item | Status | Source / notes |
|---|---|---|
| 3D die cube + right-handed orientation | **REUSE** | TC: css/tc-dice.css (`.tc-cube/.c/.f1–f6`, lighting), js/tc-dice.mjs (`cssMatrix`, `orient`, `SETS`), js/table-ui.mjs `cubeHTML()` L258. Model: BC bb-bc-yrkv css/dice-cube.css (`.cube3d`, bb-tumble) + js/ui.mjs `animateDice` ~L1750 |
| Shooter set-dice start pose, throw action | **REUSE** | js/table-ui.mjs `data-act='throw'` → doRoll (L933); SETS 3V/2V/STRAIGHT/SEVENS |
| Face art | **REUSE** | assets/dice/faces/face-1..6.svg |
| Throw path, camera, lane finder, tuck, no-roll plate, speed/reduce handling, sfx/haptic hooks | **NEW** | round5/throw/throw.mjs, round5/throw/throw.css; spec in table-craps/MOTION-GESTURE.md "On-table dice throw" |
| Sounds `dice_wall`, `dice_felt`, `dice_settle`, `no_roll` | **NEW** (hooks only) | Map them to js/audio.mjs; no audio assets were made |
| QA harness | NEW (QA only) | round5/tools/throw_shoot.py → shots/throw/verify-throw.json, strip-*.png |
