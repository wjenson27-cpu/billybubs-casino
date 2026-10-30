# Round 1 checklist coverage

Table Craps is the app already in the Bubble Craps import (`bubble-craps/table/`, engine `bubble-craps/js/engine.mjs` and `bubble-craps/js/table-rules.mjs`), opened at `table-craps/index.html`. It was not rewritten. `bb-tc-369w` is gone; this public tree is the surviving game. Odds, RNG, and the imported tests were not edited. The Lobby link is the only Table and Bubble UI change.

Limits in that engine, which the imported tests lock:

- Table minimum $10, maximum $500. Odds and lay odds are exempt.
- Place 6 and 8: $6 steps, $12 minimum, $498 maximum.
- Any 7 minimum $10, maximum the $500 table max. It is not capped at $10.
- Field minimum $10, maximum $500. It is not a $10-only bet.
- ATS and Hard Way All Day minimum $1, maximum the table max. They are not $1-only.
- Hops $1–$100. Repeaters $1–$25. Fire Bet $1–$10.
- Chips $1 / $5 / $25 / $100 / $500. No $10 chip.

| Area | Status | What the import and its tests cover |
| --- | --- | --- |
| RE-01–RE-27 rules | Covered for standard play | Regular only. Pass, Don't (bar 12 and bar 2), Come, Don't Come, 3-4-5x / 5x / 10x odds, lay odds, Place, Buy, Lay, Field 2:1 and 3:1, hardways, props, hops, ATS, Hard Way All Day, Repeaters, Big 6/8, Fire. Come odds off on the come-out. Don't Come lay odds and number lays work on the come-out. |
| TL-01–TL-05 limits | Covered, with the caps above | $9 Pass refused. Place 6 over $498 refused. $5,000 odds on a $500 Pass at 10x accepted. Coach rounding is in the strategy helpers, not a separate fuzz of 10,000 rolls. |
| CH-01–CH-04 chips | Covered | Five denominations. $10 is two $5 chips. HUD reads Practice chips and On table. |
| CR-01–CR-21 rail | Core covered | Breakdown, change, color-up Offer / Auto / Off, cup, Leave table colors up. Invariant tests cover bets, wins, and color-up. They are not the full 100,000-roll × 24 strategies × 3 presets run. Multiplayer rails and the 320px screenshot harness are not re-shot here. |
| FB-01–FB-11 Fire | Core covered | Window, unique Pass points, pay at 6, standard 24/249/999. The test file asserts the window and standard pays. Markov 1-in-94 and the other three presets are in the rules module; this round did not re-derive the Markov table. |
| SD-01–SD-12 set dice | Core covered | `rollDice()` takes no set. 3V, 2V, Hardway, All-Sevens. Throw can no-roll without drawing. 1,000,000-roll chi-square is on the RNG, not once per set. |
| MP-01–MP-12 | Partial | Dice pass only on a seven-out is tested. The pass-and-play screens are not all wired in the UI (older QA: no multiplayer entry). |
| ST-01–ST-24 | Partial | All 24 cards, Free 16 / Premium 8. Autoplay sequences in the suite are T1, T5, T7, T19, T20, T23, T24, not a golden file for every card, and not the 10,000-roll legality fuzz. |
| TU-01–TU-07 tutorials | Partial | Tutor lines and the etiquette deck exist. Not every one of the 24 tutorials is walked with a forced-roll script in this round. |
| CMP-01–CMP-26 | Partial | Seeded replay, open Come value, many-seed lean run. Not the full chart, CSV, and 1,000-seed worker matrix. |
| TT-01–TT-08 tutor | Partial | Field line and the long-shot gate are tested. Not every A2.6 row. |
| FD, PIP, PR, RG | Partial | Fair Dice, pip dice, locked Premium rules, practice-only copy. Custom rules do not all edit the live table (Premium stays a preview on Bubble; Table has a rules sheet). |
| BL badges and session | Partial | Bubble badges and limits are in the Bubble suite. Table badge list is still the spec's open item (BL-03). |
| FIT, A11Y | Partial | Rotate-to-portrait under 400px tall is in the layout test when Chrome is present. This round did not re-run the six-phone fit harness. |
| PM point-made | Covered in unit tests | Fires only when the Pass point is made. Tiers and copy are tested. The 2.5s skip timing is the animation, not re-timed here. |
| RD Rule 0 | Covered | Crypto rejection sampling. No `Math.random` fallback. A missing crypto refuses the roll. Set dice are not an argument. |
| ET etiquette | Partial | Deck, nudges, Table Manners are tested. |
| LG lingo | Partial | Table loads 79 terms. Search, spot sheet, and Show me exist. The full RT-33–RT-37 browser sweep was not re-run here. |
| SH, YD, RS, FR, QB, PD | Partial | Session history, Your Dice, limit tiers, roll speed, quick bets, and payout drills are in the import (`js/history.mjs`, `js/your-dice.mjs`, `js/tiers.mjs`, `js/roll-speed.mjs`, `js/quick-bets.mjs`, `js/drills.mjs`). This round did not add new cases beyond the imported suite. |
| RT-29 / RT-30 | Covered by `tests/table.test.mjs` | 1,000,000 seeded rolls (faces, totals, 36-cell, lag-1) and 1,000,000 crypto rolls (one die's faces and the totals). |
| PSO, stickman, 4-way set | In the table UI | Seven-out overlay, hook sweep, and 4-way dice rotation are `js/pso.mjs`, `js/throw.mjs`, and `js/tc-dice.mjs`. `tests/table-dice.test.mjs` checks them when Chrome is installed. |
| Big Win 2.5s, color-up Auto | In the table UI | Point-made Huge is 2.5s. Color-up setting includes Auto. |

## Explicitly not redone this round

- No second Table Craps engine. Rebuilding one would fork the tested math.
- Any 7 is not given a $10 maximum, Field is not capped at $10, and ATS / Hard Way All Day are not locked at $1. Those would contradict the imported tests and A2.2's $500 table max.
- RT-08 golden files for all 24 strategies, RT-09 legality fuzz, RT-19 six-phone fit, RT-24's full strategy simulation, and RT-31's 1,000,000 rolls per dice set are not new tests. The imported suite is what ran.
