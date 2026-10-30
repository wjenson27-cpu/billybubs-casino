# Table Craps v1e (round 5a, delta-only) + Bubble Craps

- **PR #17:** draft, not merged. Branch `cursor/table-craps-6ff7` @ `6fad117`. Read-only: nothing merged, nobody contacted.
- **Delta gate:** `git diff 34f012d..6fad117 --stat` touches 25 files. **`js/engine*`, `js/rail.mjs` and `js/rng.mjs` are untouched**, so per the standing rule I didn't run the 1M-roll test or the rail simulation.
- **`npm test`:** **147 / 147**, one run. `npm run build`: "dist ready".
- **Evidence:** `/workspace/qa/v1e.mjs`, `v1e2.mjs`, `smoke.mjs`, `s2.mjs`, `s3.mjs`; screenshots in `qa-table-v1e/`.

## Verdict: **PASS** (no P0 / P1; 3 × P2)

## Fix checks
| # | Item | Result |
|---|---|---|
| 1 | Rotate-to-portrait gate | **FIXED.** At 568×320 in both apps, the gate covers play and the menu sheet. The HUD and 18+ line stay above it. The middle of COME now hits the gate, and a tap there places no bet, **so the v1d P1-1 Come/Field mis-tap can't happen.** |
| 2 | PSO haptics | **FIXED (code).** Table passes `psoHaptic`: `success` [12,40,12] or `tick` 10, and it respects Settings › Haptics. Bubble is unchanged and already did this. |
| 3 | Lingo contrast | **FIXED (code).** Peek alias and meaning text now use #3a4150 on the cream card. |
| 4 | Crapless note | **FIXED.** `noteFor` no longer falls back to the Crapless note in Regular mode. |
| 5 | One mascot | **FIXED (code).** `.dome-billy` is hidden while a peek or sheet is open. |
| 6 | Lingo buttons ≥ 44 px | **FIXED.** No visible Lingo button under 44 px at 390×844 or 320×568. |
| 7 | Test port | **FIXED.** `listen.mjs` reuses a port only if it serves this checkout (it compares a hash of `js/table-ui.mjs`); otherwise it moves on to 8766–8770. |
| 8 | Fire in Bubble data | **FIXED.** `dist/js/lingo.json` has 0 `fire_bet` and 0 "fire". Table loads `lingo.table.json` (79 terms) through the import map. The build fails if Fire leaks in. |
| 9 | Show me | **Partly fixed (P2-1).** The button is now on the Lingo screen's term cards. It still doesn't open the Tutor line, and in Bubble it still lands on the wrong page. |
| 10 | Peek | **FIXED.** Table at 390: 24% of the height. Table at 320×568: 35%, clear of the result line and SHOOT. Bubble at 320: 32%. At 844×390 it's a 200 px side panel in both apps. |
| 11 | Keyboard / screen reader | **FIXED.** L on a focused spot opens the sheet with focus on its heading, and places no bet. Spots carry `aria-keyshortcuts="L Shift+F10"` and `aria-haspopup`. Context-menu and Shift+F10 use the same path (code). |

## Smoke test (390×844 and 320×568, built `dist`)
- **Table:**
  - Each of these loads and takes its action: board (Pass bet), shooter (roll), side bets, Strategies, Comparison (4 charts), Fair Dice, Stats menu and Settings, Lingo (79 rows), Etiquette card Next, Tutor.
  - No console errors on any Table screen.
- **Bubble:**
  - Regular and Crapless each take a Pass bet and a roll.
  - Fair Dice, Learn, Lingo, Settings and Premium load cleanly.
  - Leaderboard / badges: two 404s (P2-2).
- **Not testable:** Table multiplayer (P2-3). Table has no badge screen (its badge list is still unspecced, BL-03).

## P2
- **P2-1: Show me still doesn't open the Tutor line, and in Bubble it highlights an off-screen spot** (S4.5 H4, LG-11, BL16-38).
  - Table: after Show me, the only coach-style text is the etiquette toast; no Tutor bubble opens.
  - Bubble: the "Aces" roll call → Show me → `hop` highlighted on the hidden Side bets page (`on=false`), at 320×568 and 844×390.
  - `showOnBoard` still forces `page = 1` and never opens the Tutor line.
- **P2-2: Bubble badge art is missing.** The badges view requests `assets/badges/table_manners-locked.svg` and `assets/badges/talk_the_talk-locked.svg`, and both return 404. This is in source and `dist`, at both sizes, so console errors fail the smoke rule.
- **P2-3: Table multiplayer has no entry in the UI.** `table-mp.mjs` exists, but `table-ui.mjs` never imports it, so the multiplayer smoke can't run.

## Carried
- v1d P3s weren't re-checked except where listed.
- 11 older P2s carried, not re-tested.
