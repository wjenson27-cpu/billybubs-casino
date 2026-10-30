# Billy Bubs Table Craps (App 2): Builder Checklist

**Spec:** `two-games-spec.md` **rev 15a** + `table-strategies-appendix.md` (rev 15a, DECIDED) + `etiquette-guide.md`. **Date:** Oct 12, 2026. **Rev 15a adds** §3a Chip rail, §16 Point-made celebration, §17 Rule 0 real dice, §18 Etiquette, RT-24 to RT-32, and removes the T-24 skill simulation (Bill, 10:31 AM). **Rev 15d adds** §19 Craps Lingo (`craps-lingo.md`, `lingo.json`), RT-33 to RT-37 and flag F10. **Rev 16 (Oct 13) adds** the round-5 batch: §20 Session history (SH-01–SH-12), §21 Your Dice (YD-01–YD-14), §22 Table rule settings and limit tiers (RS-01–RS-12; tiers PROPOSED), §23 Roll speed (FR-01–FR-10), §24 Quick bets (QB-01–QB-14), §25 Payout drills (PD-01–PD-12), RT-38 to RT-44 and flags F11–F16. Rev 16 rows were checked against branch `cursor/table-craps-6ff7` @ `34f012d` where it says so.
**Bar:** App Store quality, the same bar as Bubble Craps (QA runs 3–15). Every line is testable. **Spec references** use the spec's own section IDs (S1–S7, A2.x, T-xx); **App** = the appendix.
**Reuse source:** repo `wjenson27-cpu/bb-bc-yrkv`, **main @ `51c229b`** ("Fix seven-out contrast, Billy overlap, and count plurals", #16). I read it from a read-only clone at `/tmp/bbbc51`. Every module and function name below comes from that commit. Line numbers are from that commit too.
**Practice / play money only.** No real-money, prize or cash-out wording anywhere (A2.7, S5).

## Legend
- **REUSE**: use the Bubble module as-is. The path and function are given.
- **REUSE+ADAPT**: use the Bubble module, with the stated change. Keep one shared copy, made configurable by an app profile (S7); never fork it.
- **NEW**: Table Craps only, with nothing to reuse in `bb-bc-yrkv`. Where the older App 2 repo (`billy-bubs-practice`, `js/table-engine.js` / `js/table-app.js` / `js/strategies.js`) has prior art, it's named as reference only.
- **Done means:** the acceptance criterion passes in an automated test (unit, or Playwright like the `shot-run*.mjs` harnesses), unless it says "manual".

## Reuse map (summary)
| Area | Bubble source @ 51c229b | Mark |
|---|---|---|
| Dice RNG | `js/engine.mjs` `rollDie`, `rollDice`, `getRngSource`, `rollCaption`, `rollPairKey` | REUSE |
| 36-outcome tests | `tests/engine.test.mjs` "all 36 pairs share one face total…" (l. 527); `tests/dice-faces.test.mjs` "every settled cube shows the engine face on top" | REUSE+ADAPT (Table bets) |
| Chips and bet plumbing | `js/engine.mjs` `CHIPS`, `chipDollars`, `formatMoney`, `placeBet`, `removeBet`, `describeSpot`, `tableTotal`, `netWorth`, `setBetsOff`, `resetBankroll`; `js/ui.mjs` `chipHTML`, `breakChips`, `chipStack`, `addBet`, `takeBet` | REUSE / REUSE+ADAPT |
| Payouts and commission | `js/engine.mjs` `passOddsProfit`, `layOddsProfit`, `placeProfit`, `buyVig`, `buyProfit`, `fieldProfit`, `hardwayProfit`, `hopPayTo1`, `settle` | REUSE / REUSE+ADAPT |
| Tutor engine and warnings | `js/engine.mjs` `edgeFor`, `edgeClass`, `EDGES`, `isLongShot`, `tutorEdgeNote`, `tutorToastLine`, `fieldPresentation`; `js/ui.mjs` `maybeTutor`, `currentTip`, `tutorSteps`, `openTutor`, `advanceTutor`, `teachKey` | REUSE+ADAPT |
| Badges and leaderboard | `js/badges.mjs` (`BADGES`, `evaluateRoll`, `noteAction`, `evaluateSession`, `paidPassPoint`); `js/leaderboard.mjs` (`completedRoll`, `previewRoll`, `commitRoll`, `ranked`, `STORE_KEY`) | REUSE+ADAPT |
| Pip readouts | `js/ui.mjs` `pipGrid`, `dieImg`, `paintDie`, `miniDie`, `diceReadout`, `rollTiles`, `last20Sheet` | REUSE |
| Fair Dice | `js/fair.mjs` (`totalsTest`, `facesTest`, `fairnessReadout`, `sevenBand`, `streakStats`, `mostRepeatedInHand`); `js/ui.mjs` `fairHTML`, `fairHistoryList`, `lockedExport` | REUSE+ADAPT (RSR, dice-set context) |
| 3D dice | `js/ui.mjs` `cubeMarkup`, `animateDice`, `syncDice`, `placeDice`; `css/dice-cube.css` | REUSE+ADAPT (throw path) |
| Limits / session | `js/session.mjs` (`startSession`, `applyLiveLimits`, `limitStatus`, `endSession`, `sessionQualifies`); `js/ui.mjs` `openLimitPrompt`, `applyOfferedLimits`, `playThisSheet` | REUSE |
| Strategy plumbing | `js/strategies.mjs` (`STRATEGIES`, `strategyById`, `autoBet`, `applyAutoPress`, `clearStrategy`, `lessonText`) | REUSE+ADAPT |
| Fit / a11y harnesses | `shot-run7…14.mjs` (Playwright), `tests/readout.test.mjs`, `tests/swipe.test.mjs`, `js/swipe.mjs` `resolveSwipe`, `js/ui.mjs` `fitFelt`, `measureChrome` | REUSE+ADAPT |
| Audio / haptics | `js/audio.mjs`; `js/ui.mjs` `haptic`, `motionOff` | REUSE |
| Chip rail (A2.2b) | Chip art, `CHIPS`, `formatMoney`, `burstChips` (REUSE); `breakChips`, `chipStack`, `addBet` / `takeBet` / `settle` callers (REUSE+ADAPT); rail state, change, color-up (NEW `js/rail.mjs`) | REUSE+ADAPT / NEW |
| Point-made celebration (S4.3) | `clearWin`, `celeTimer`, `showBigWin`, `isBigWin`, `burstChips`, `haptic`, `audio.win`, Billie art, `hand.points` | REUSE+ADAPT; trigger + tiers NEW |
| Rule 0 dice | `rollDie` / `rollDice` draw (REUSE, verified); fallback and hostname-gated hooks (ADAPT) | REUSE+ADAPT |
| Etiquette guide | Tutor card UI, `maybeTutor`, `noteAction` | REUSE+ADAPT; content NEW |
| Craps Lingo (S4.5, rev 15d) | Tutor card UI (`openTutor`, `currentTip`), `swallowClick` + swipe pointer code, `takeBet`, `clearWin`, `diceReadout` / `rollCaption` settled roll, `noteAction` | REUSE+ADAPT; `lingo.json`, search, spot sheet, peek, call links NEW |
| **Table Craps only** | Set dice + shooter, Fire Bet, Lay bets on numbers, Big 6/8, $10–$500 profile with odds exempt, 5x / 10x odds, T13–T24, Strategy Comparison, multiplayer | **NEW** |

## Flags resolved or raised while writing this
- **F2, Table Craps badges:** `badges-bubble.md` defines Bubble badges only. **No Table Craps badge list is specced.** The engine is REUSE+ADAPT; the badge definitions need a spec (item BL-03).
- **F3, the Yo bet:** T-18 lists "Yo", but `bb-bc-yrkv` has no Yo kind (the side bets are Any 7 "Big Red", Any Craps, C&E, Horn, hops). Yo is NEW, or it's served by hop 5-6 (item RE-24). It's flagged, not decided.
- **F4, expected loss:** the appendix's Comparison uses per-decision `expectedLoss`. That field exists in the old App 2 engine, but **not** in Bubble's `pushDecision` (`js/engine.mjs:1183-1186`). REUSE+ADAPT: add it from `edgeFor` (item CMP-14).
- **F5, odds settings:** Bubble's `maxPassOdds` / `oddsMultiple` / `maxLayOdds` are hard-coded 3-4-5x / 6x. T-3 / T-4 need 5x and 10x with matching lay (item RE-06).
- **F7 (rev 15a), "cash-out":** Bill asked for color-up "on cash-out". That word is banned (RT-22), so the UI says **"Leave table"** (CR-17).
- **F8 (rev 15a), Big Win vs point-made:** Bubble's BIG WIN lasts 3.5 s with buttons; on a point-made roll the celebration takes over (PM-13). Spec Open question 6.
- **F9 (rev 15a), Rule 0 vs Bubble @ `51c229b`:** the draw passes, but the `Math.random()` fallback and the hostname-only hook gate don't (RD-02, RD-07).
- **F10 (rev 15d), long-press conflict:** the spec already gave long-press on a bet spot two jobs (S1.6 ATS take-down; A2.7.6 "Ana $10 · Ben $5"). Lingo would be a third. Resolved in S4.5 H2: **one spot sheet** (lingo card, Tutor line, Your bet + Take down, On this spot). The rail's "Your chips" sheet and the Comparison chart tooltip keep their own long-press; dock keys get none (LG-06 to LG-08). Spec Open question 9.
- **F11 (rev 16), rail breakdown drift:** the build adds a 4 × $25 reserve (`js/rail.mjs:40-42` @ `34f012d`), so $1,000 → 1 / 3 / 7 / 4 / 5 and `tests/table.test.mjs:172-175` asserts that; CR-02 and A2.2b.2 say 1 / 4 / 3 / 4 / 5. Spec or build must change (not decided).
- **F12 (rev 16), Place 6/8 minimum:** the build hard-codes $12 (`js/table-rules.mjs:214`; `placeSpot`, `js/table-ui.mjs:601-604`) regardless of T-12, so a $5 table can't take the $6 amounts P14-3 allows (RS-09).
- **F13 (rev 16), 6/8 tap increments:** each tap adds ≥ $12, so $18 / $30 can't be built (QB-13).
- **F14 (rev 16), CR-12 fixture:** "Place 6 $10 → +$11.66" is refused by the build's $6-step rule (`stepOf`, `js/table-rules.mjs:172-176`). Use $12 → +$14 or a Buy for the odd-cents case.
- **F15 (rev 16), PM-10 timing:** PM-10 still says Base 1.6 s; spec rev 15c set Base 1.2 / Big 2.0 / Huge 2.5 s. Use the rev 15c values.
- **F16 (rev 16), rules not in the UI:** the engine supports T-2 3:1, every T-3 multiple and per-rules min / max, but `js/table-ui.mjs` exposes none of them, or a starting bankroll (RS-01 to RS-06).
- **F6, ATS in App 2: yes** (S1.6 heading, A2.2, 31 / 31 / 156 FOR 1). **Crapless in App 2: no** (A2.2 "Regular only").

---

## 1. Rules engine (S1, A2.2, A2.3)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| RE-01 | App profile `table`: Regular only, no Crapless | A2.2 | `createGame({profile:"table"})` → `mode === "regular"`; `switchMode` to crapless is refused with "Table Craps is Regular only" | REUSE+ADAPT `js/engine.mjs` `createGame`, `switchMode` (add profile; block crapless) |
| RE-02 | Pass Line: come-out 7/11 win 1:1; 2/3/12 lose; a point is set on 4/5/6/8/9/10 | S1.1, A2.2 | Forced rolls over all 36 pairs give the expected net per pair (RT-03) | REUSE `js/engine.mjs` `settle` → `settleLine` |
| RE-03 | Don't Pass: 2/3 win, **bar 12** push (T-11 bar 2 option), 7/11 lose; wins on a seven-out | A2.2, T-11 | 36-pair table for both bar settings | REUSE+ADAPT `settleLine` (add a `bar` option; Bubble is bar 12 only) |
| RE-04 | Pass / Come contract: can't be removed or reduced once a point is on | A2.7.3 | `removeBet` on Pass with a point on → error "Pass Line stays up…"; Come point → error; UI shows no take-down affordance | REUSE `removeBet` (`js/engine.mjs:657+`) |
| RE-05 | Don't Pass / Don't Come takedown is allowed with the Tutor warning (+33.3% / +20.0% / +9.1%) | A2.2, A2.6 | `removeBet` without confirm returns the warning text; with confirm, it refunds the flat | REUSE `removeBet` + `dontEdgeNote` |
| RE-06 | **Odds at T-3: 3-4-5x (Standard), 5x, 10x** (plus 1x / 2x / 20x / 100x as rules); true-odds pay | A2.2, T-3, App §0.1 | For each preset × point: max odds = 3/4/5x, 5x or 10x the flat; pays 2:1 / 3:2 / 6:5; $10 flat at 3-4-5x pays $60 on every point | REUSE+ADAPT `maxPassOdds`, `oddsMultiple` (add a `preset` arg); REUSE `passOddsProfit` |
| RE-07 | **Lay odds at T-4:** win the same multiple as the Pass odds (3-4-5x → lay ≤ 6x flat: $60; 5x → $100 / $75 / $60; 10x → $200 / $150 / $120) | T-4, App §0.1 | `maxLayOdds(line, point, preset)` matches the table above for every point; `layOddsProfit` pays 1:2 / 2:3 / 5:6 | REUSE+ADAPT `maxLayOdds` (now `line*6` only; add point + preset); REUSE `layOddsProfit` |
| RE-08 | Come / Don't Come: box rules, travel to a number, odds / lay odds added after travel | S1.1, App T3 | Sequence tests: a Come travels on 4–10; 7/11 in the box wins; 2/3/12 loses; Don't Come mirrored (12 push) | REUSE `settleNewCome`, `settleComeContracts`, `ensureCome` |
| RE-09 | **Come odds off on the come-out** (default); **Don't Come lay odds working on the come-out** (P14-7) | T3, A2.2 row (rev 15) | Come-out 7 with a Come 6 + odds → flat loses, odds returned; DC 6 + lay → both win | REUSE `comeOddsWorking` (`js/engine.mjs:1231`); ADAPT so DC lay odds read T-30 |
| RE-10 | Come bet "off and on" when a Come lands on a number it already has (T11) | A2.4 T11 | A Come on a covered 8 → the old one pays, the new one takes the number, never stacks | REUSE (Bubble B13 path in `settleComeContracts`) |
| RE-11 | Place 4–10 (9:5, 7:5, 7:6), **off on the come-out** (T-9) | S1.3, T-9 | Each number pays exactly at $10 / $12 / $25 / $100 / $500; a come-out 7 → Place untouched | REUSE `placeProfit`, `placeWorking`, `settlePlaceBuy` |
| RE-12 | **Buy 4–10, 5% of the stake, taken from the win only** (T-5 Always option; T-6 rounding) | S1.3, A2.2, T-5, T-6 | Buy $10 on 4 pays $19.50; on 5, $14.50; on 6, $11.50; a loss costs only the stake; T-6 "$1 per $20" rounds as specced | REUSE `buyVig`, `buyProfit`; ADAPT for T-5 Always and T-6 rounding |
| RE-13 | **Lay bets on numbers 4–10 (NEW in App 2):** pays 1:2 / 2:3 / 5:6, **5% of the win as commission, on wins only**; T-7 up-front option | A2.2 row, T-7 | Lay $40 on 4 wins $20 − $1 = $19; Lay $30 on 5 wins $20 − $1; Lay $30 on 6 wins $25 − $1.25; a loss costs the stake only; edges 1.67 / 2.00 / 2.27% | **NEW** (Bubble has no number lays: QA run 15 row 2*); add a `lay` kind to `placeBet` / `settle` |
| RE-14 | **T-30 Lay bets working on the come-out** (default On) | A2.3 T-30, P14-7 | Come-out 7 with Lay 4 $40 → +$19; with T-30 Off → untouched | **NEW** flag beside `placeWorkingOnComeOut` |
| RE-15 | Field: 2, 3, 4, 9, 10, 11, 12; **2 and 12 pay 2:1**; T-1 / T-2 3:1 options | S1.4, A2.2, T-1/T-2 | 36-pair table; edges 5.56% / 2.78% / 0% by setting | REUSE+ADAPT `fieldProfit` (hard-codes 2×; read T-1 / T-2 like `fieldPayTo`) |
| RE-16 | Field felt label "2 AND 12 PAY DOUBLE" and the screen-reader label | S1.4 (rev 13d) | Label text and aria exact; it changes with the T-1 / T-2 3:1 settings | REUSE `fieldPresentation`, `js/ui.mjs` `fieldSpot` |
| RE-17 | Hardways 4/6/8/10 (7:1, 9:1), working on the come-out (T-10), US/AU (T-17) | S1.4, T-10, T-17 | Hard pays; easy or 7 loses; T-10 Off parks them on the come-out | REUSE `hardwayProfit`, `settleHardways`, `hardwaysWorking`; ADAPT for T-17 AU |
| RE-18 | One-roll props: Any 7 (4:1; T-16 4.5:1), Any Craps 7:1, C&E, Horn (30/15; T-15 31/16), hops (15 / 30; T-29) | S1.4, S1.4a, T-15/16/29 | Each pays per spec on all 36 pairs; unit rules (Horn $4, C&E $2) | REUSE `settleOneRoll`, `hopPayTo1`, `hopEdge`; ADAPT for the T-15 / T-16 / T-29 options |
| RE-19 | **Prop minimum $1** (hardways, Any Craps) at a $10 table | P14-14 | `$1` Hard 6 accepted at T-12 = $10; Place 6 $6 refused | REUSE+ADAPT `spotMin` (`js/engine.mjs:421`) per profile |
| RE-20 | ATS Low / High / Roll 'Em All 31 / 31 / 156 FOR 1, stays up after a hit; T-20 / T-21 | S1.6, A2.2 | Lamp sequences pay and re-arm; any 7 loses; chips can't be added once a lamp is lit | REUSE `settleBonus`, `bonusSet`, `lampsLit` |
| RE-21 | Hard Way All Day 165 FOR 1, stays up; T-19 | S1.5, T-19 | Lamp sequence → pays 165 for 1, stake stays, lamps reset | REUSE `settleBonus` (hardAllDay) |
| RE-22 | Repeaters 2–12 (40/50/65/80/90 FOR 1), any 7 loses, $1–$25, T-22 / T-23 | S1.7, A2.2 | All 10 pays; counts; a takedown clears the tally; **win chance 1 in 49 to 1 in 113** in the Tutor | REUSE `settleRepeaters`, `REPEATER_*` constants |
| RE-23 | Big 6 / Big 8 (1:1, 9.09%), **Off by default** (T-18) | A2.2, T-18 | Hidden by default; when on, 6 pays even money; 7 loses | **NEW** (not in Bubble; older App 2 `js/table-engine.js` has it) |
| RE-24 | Yo (F3) | T-18 | Bill / Design decide; if built, 11 pays 15:1 (11.11%) | **NEW** or alias hop 5-6 (flag) |
| RE-25 | Billy's Way and PRESS / POWER PRESS are **absent** in App 2 | A2.2, A1.4a | No key, no tile, no setting; `placeBillysWay` unreachable under the table profile | REUSE+ADAPT (gate `placeBillysWay`, `press`, `powerPress` off by profile) |
| RE-26 | Bets Off (per player) parks Place / Buy / Lay / hardways; contract bets keep working | A2.7.3 | Bets Off + roll 6 → Place 6 not paid; Pass still settles | REUSE `setBetsOff`; ADAPT (lays included) |
| RE-27 | Decision records feed every toast, ledger and Comparison | S1.1, App §3.3 | Every settle returns `{bet, result, stake, profit, net}` (+ `expectedLoss`, CMP-14) | REUSE `pushDecision` |

## 2. Table limits ($10–$500, odds exempt)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| TL-01 | Standard min **$10**, max **$500** per bet (T-12 / T-13 ranges $1–$25 / $100–$5,000, max ≥ 20× min) | A2.2, T-12, T-13 | A $9 Pass is refused; a $500 Place 8 is refused (it isn't a $6 multiple, so the largest is $498); $498 accepted | REUSE+ADAPT `TABLE_MIN` / `TABLE_MAX` constants (`js/engine.mjs:8-9`, $5 / $1,000) → per-profile values read by `spotMin` / `spotMax` |
| TL-02 | **Odds and lay odds are exempt from the max** | P14-8 | Pass $500 + 10x odds $5,000 accepted; a lay of $1,200 on a $100 Don't (6/8, 10x) accepted | REUSE `spotMax` (already `Infinity` for odds kinds, `js/engine.mjs:431-436`) |
| TL-03 | Repeaters $1–$25, Fire Bet $1–$10 (T-28), hops per S1.4a | A2.2, T-28 | Out-of-range amounts refused with the reason | REUSE `REPEATER_MIN/MAX`; NEW Fire limits |
| TL-04 | The cap message names the limit; partial chips are never posted | S1.3, A1.4a pattern | Dropping $600 on Place 6 → "Max $498 here" and nothing posted | REUSE `validate` (`js/engine.mjs:536`) messages; ADAPT text |
| TL-05 | Coach / auto-play rounds **down** to the largest legal amount ≤ max | App §0.2, §3.5 | T22 4 at $300 wins → "→ $500 (max), get $385" | NEW legal-amount helper (shared with CMP) |

## 3. Chips
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| CH-01 | Chips **$1 / $5 / $25 / $100 / $500**, no $10; $500 purple (#5A2A88 + gold) | S4 (Chips) | The rack renders exactly 5 chips; no $10 chip anywhere (grep and screenshot) | REUSE `CHIPS` (`js/engine.mjs:14`), `chipHTML`, `chipSrc`, `chipPng` |
| CH-02 | A $10 table minimum is built from 2 × $5 (or $5 + 5 × $1) | S4, A2.2 | One-tap Pass at $10 with the $5 chip selected → two chips stacked, $10 posted | REUSE+ADAPT `addBet` (unit-to-min top-up), `breakChips` |
| CH-03 | Chip stacks break correctly on the felt ($44 Inside shows $25 + $5 + 4×$1 etc.) | S4 | `breakChips(4400)` returns the minimum-chip breakdown | REUSE `breakChips`, `chipStack` |
| CH-04 | Bankroll bar "Practice chips · On table" | S4.1 | Both values update after every settle | REUSE `hudHTML` / `netWorth` |

## 3a. Chip rail (A2.2b; rev 15a)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| CR-01 | Rail state `{50000,10000,2500,500,100: counts, cup: 0–99}` in a new `js/rail.mjs`, saved with the bankroll | A2.2b.1 | Reload restores identical counts; counts are integers ≥ 0, cup 0–99 | **NEW** |
| CR-02 | `railBreakdown(cents)`: cup = cents mod 100; reserve 5 × $1, then 4 × $5; greedy $500 → $1 | A2.2b.2 | $1,000 → 1/4/3/4/5 (500/100/25/5/1); $300 → 0/2/3/4/5; $12.50 → 0/0/0/1/7 + 50¢; $3 → 3 × $1; same input = same output | REUSE+ADAPT `breakChips` (`js/ui.mjs:146`; add reserve + uncapped mode) |
| CR-03 | Stacks in fixed order $500 · $100 · $25 · $5 · $1; empty stack = outline, still selectable; **no $10** | A2.2b.3, S4 | Screenshot at 320 / 390 / 430 px; DOM has exactly 5 stacks | REUSE chip art `chipSrc` / `chipPng`; NEW layout |
| CR-04 | Display cap 10 chips per stack; count badge "×N" when N > 1; "×999+" over 999; exact count in label and long-press sheet | A2.2b.3 | 37 × $1 → 10 drawn + "×37"; 1,200 × $500 → "×999+", sheet says 1,200 | REUSE+ADAPT `chipStack` (badge + cap) |
| CR-05 | The rail is the chip selector; selection = ring + raised stack | A2.2b.3, A2.2b.7 | Tap $25 stack → `settings.chip === 2500`; grayscale screenshot still shows selection | REUSE+ADAPT `data-act="chip"` handler |
| CR-06 | Bets paid by amount with fewest chips, largest first | A2.2b.4 | $44 from a fresh $1,000 rail removes 1 × $25, 3 × $5, 4 × $1; invariant holds | **NEW** `railPay` |
| CR-07 | **Change-making:** break the smallest covering chip one step down ($500 → 5 × $100, $100 → 4 × $25, $25 → 5 × $5, $5 → 5 × $1), repeat | A2.2b.4 | Rail of 1 × $25, bet $10 → change $25 → 5 × $5, pay 2 × $5, rail 3 × $5; rail of 1 × $500, bet $1 → $500 → $100s → $25s → $5s → $1s, one label per step | **NEW** |
| CR-08 | "Change" animation ≈ 350 ms + label; first-time Dealer Billy line; reduce motion = 150 ms crossfade | A2.2b.4 | Animation ≤ 400 ms; label text exact; `motionOff()` → no transform animation | NEW anim; REUSE `motionOff` |
| CR-09 | Change never delays a roll | A2.2b.4 | ROLL tapped mid-animation: roll starts in the same frame; money state already final | NEW (Playwright) |
| CR-10 | Cents: up-front vig (T-5 Always, T-7) taken from the cup; cup short → break $1 into 100¢ | A2.2b.4 | Buy $10 with T-5 Always on an empty cup: $1 broken, cup 50¢ after; invariant holds | **NEW** |
| CR-11 | Credits arrive as the greedy breakdown of the amount (no reserve); cents to the cup; cup ≥ 100 → $1 chip | A2.2b.5 | Buy $10 on 4 wins → +$19 as 3 × $5 + 4 × $1, + 50¢ to the cup; two such wins → cup 0, +1 × $1 | **NEW** `railCredit` |
| CR-12 | Odd payouts follow the engine to the cent | A2.2b.5 | Place 6 $10 → +$11.66; $15 odds on 5 → +$22.50; lay odds $25 on 4 → +$12.50; each lands as chips + cup | REUSE `placeProfit`, `passOddsProfit`, `layOddsProfit`, `buyProfit` |
| CR-13 | Losses don't touch the rail; take-downs, pushes, Fire pays, strategy collects all credit through `railCredit` | A2.2b.5 | Code check: every bankroll mutation goes through rail functions (grep: no direct `bankroll +=` outside the engine + rail sync) | REUSE+ADAPT `addBet`, `takeBet`, `settle` callers |
| CR-14 | Payout pulse chips slide felt → rail | A2.2b.5 | Pulse visible; reduce motion → none | REUSE `burstChips` |
| CR-15 | Color-up **offer** pill when $1s > 20 or $5s > 20 after a settle | A2.2b.6 | 26 × $1 → pill; tap → 5 × $1 kept, $21 recolored; total unchanged | **NEW** `railColorUp` |
| CR-16 | Color-up setting Offer (default) · Auto · Off; Auto only after a settle, never mid-roll or on felt chips | A2.2b.6 | Auto: color-up runs after settle, never during `rolling === true`; Off: no pill | NEW setting |
| CR-17 | "Leave table" always colors up and shows final stacks + "Practice chips: $X" | A2.2b.6 | Summary shows the colored-up breakdown; 0 occurrences of "cash out" (RT-22) | REUSE+ADAPT session summary (`endSession`) |
| CR-18 | Per-seat rails in multiplayer; only the active seat's rail shows | A2.2b.1, A2.7.6 | Switch seat → rail and HUD swap; each seat's invariant holds | **NEW** |
| CR-19 | Rebuild on mismatch (old save) with a `rail-rebuilt` log | A2.2b.1 | A tampered save → rebuilt rail = `railBreakdown(bankroll)`; in RT-24 the log count is 0 | NEW |
| CR-20 | A11y: group label lists counts + cup + total; stacks are buttons ≥ 44 × 44; change / color-up announced once (polite) | A2.2b.7 | axe 0 serious; VoiceOver string exact; one live-region message per change | REUSE label patterns; NEW strings |
| CR-21 | Fit at 320 px: 5 × 56 px + gaps = 304 px; height ≤ 64 px; no overlap with ROLL / dock / toasts at 320–430 + landscape + 130% text | A2.2b.8 | `shot-run14`-style harness: 0 overlaps, 0 clipped badges | REUSE+ADAPT `shot-run14.mjs`, `fitFelt` |

## 4. Fire Bet (A2.2a) — NEW
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| FB-01 | Bet window: **only before the new shooter's first come-out roll** | A2.2a | After roll 1 of a hand, `placeBet(fire)` → "Fire Bet: new shooter only"; the spot shows LOCKED | NEW (Bubble only rejects it: `js/engine.mjs:544`) |
| FB-02 | Single player: every new hand after a seven-out is a new shooter | A2.2a | The window reopens after each seven-out | NEW |
| FB-03 | Counts **different** Pass-line points **made**; repeats and Come numbers don't count | A2.2a | Make 6, 6, 8 → 2 points; a Come 5 hit → no count | NEW |
| FB-04 | Ends at the seven-out, or **immediately at the 6th point** (paid at once) | A2.2a | 6 points → paid on that roll, bet gone; 4 points + seven-out → pays at the seven-out | NEW |
| FB-05 | Pays the **highest level only**, once; under 4 points loses (Fire 3 preset pays 3) | A2.2a | 5 points → 249 to 1 only, not 24 + 249 | NEW |
| FB-06 | Pay tables T-27: Standard 24/249/999 TO 1 (20.76%), Long Six 10/200/2,000 (24.86%), Fire 3 6/29/149/299 (20.73%), Generous 29/299/999 (8.16%) | A2.2a, T-27 | Unit tests for every level × preset; the Edge Preview shows the exact edge | NEW; edge to `EDGES` (REUSE `edgeFor`) |
| FB-07 | Can't be taken down after the first come-out roll; Bets Off doesn't affect it | A2.2a | `removeBet(fire)` after roll 1 → refused | NEW |
| FB-08 | Fire rail: 6 markers + "3 of 6" badge; toasts exact (A2.2a) | A2.2a | Markers light on make; the three toast strings match word for word | NEW |
| FB-09 | Separate from the Blazing meter: no "Fire" word or point markers on the meter; the rail never uses the meter colors or motion | A2.2a, S6 | A DOM / CSS check: the meter has no "fire" text; distinct color tokens | REUSE `blazingTier` / `blazingScore` (meter); NEW rail |
| FB-10 | Multiplayer: each seat has its own bet on the current shooter; settles before the dice pass | A2.2a, A2.7.3 | 3 seats, 4 points, seven-out → 3 payouts, then the dice pass | NEW |
| FB-11 | Exact math table (59.394 … 0.01624%) is used for the Tutor chance "about 1 in 94" | A2.2a | Markov test reproduces the table to 3 decimals | NEW (test) |

## 5. Set dice, shooter practice and fairness (A2.5, S5.1, Rule 0; set dice cosmetic only, rev 15a)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| SD-01 | **The result is drawn by the shared RNG, independent of the set, grip and throw** | S5.1, A2.5 | Code review + test: `rollDice` is called with no arguments from the throw handler; the set / grip / meter state isn't passed into it | REUSE `rollDie` / `rollDice` (`js/engine.mjs:388-415`) |
| SD-02 | Draw timing: the RNG is drawn **after a valid throw**; a "No Roll (practice)" draws nothing and settles nothing | A2.5, A2.6 | A no-roll leaves `history.length` and bankroll unchanged; the next valid throw draws once | NEW (flagged: the spec doesn't say when the draw happens; this fixes it) |
| SD-03 | Statistical independence from the set | S5.1 | Simulate 60,000 throws per set (3V, 2V, Straight Hardway, All-Sevens): χ² on totals p > 0.001 for each, and the 7-rate per set within the S5.2 band | NEW test using REUSE `js/fair.mjs` `totalsTest`, `sevenBand` |
| SD-04 | Set picker: 3V, 2V, Straight Hardway (also "1-6 axis"), All-Sevens, with both names shown for "Hardway set" | A2.5 table | All 4 sets selectable; the terminology note shows | NEW |
| SD-05 | Set timer (goal < 5 s), grip preset, throw meter (both dice must reach the back wall) | A2.5 | Meter below threshold → "No Roll (practice)" | NEW |
| SD-06 | **The 3D throw shows the engine's result:** the animation picks an orientation that lands the already-decided top face | S5.1 (App 2 note) | Render-vs-engine on all 36 pairs and 40 random throws: top face = `lastDice` (RT-11) | REUSE+ADAPT `js/ui.mjs` `cubeMarkup`, `animateDice`, `syncDice`, `placeDice`, `css/dice-cube.css` (add the throw-to-back-wall path; prior art: old App 2 `table-app.js:531-541`) |
| SD-07 | The on-axis indicator and RSR are labeled cosmetic / practice | A2.5, S5.2 | Copy present: "for practice", "RSR about 6.0 = random" | NEW |
| SD-08 | Fair Dice App 2 card: RSR vs 6.0, and RSR by set, captioned "Setting is practice only" | S5.2 | The card renders; the caption is exact | REUSE+ADAPT `js/fair.mjs` `streakStats` (add RSR); `fairHTML` |
| SD-09 | Every-100-throws reminder: "RSR 6.1 is about random. Controlled shooting isn't proven to work." | A2.5, A2.6 | Fires at 100, 200, … | REUSE+ADAPT `maybeTutor` |
| SD-10 | Shooter-practice honest note on screen (Wizard "still skeptical"; "casino rules vary") | A2.5 | Text present on the practice screen | NEW |
| SD-11 | **Set dice, grip and throw are a cosmetic practice ritual only;** no build has a mode where they change a roll | A2.5, Rule 0 | No skill / influence control in any build or settings list (see RD-04) | NEW |
| SD-12 | Shooter-practice stats (RSR, on-axis %) are read-only views of fair rolls | A2.5, S5.2 | Stats recompute from history only; no write path back into the roll | REUSE+ADAPT `js/fair.mjs` |

## 6. Multiplayer pass-and-play and shooter rotation (A2.7) — NEW
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| MP-01 | 2–6 seats, drag to reorder, clockwise, Seat 1 shoots first | A2.7.1-2 | Lobby order = shooting order | NEW |
| MP-02 | **The dice pass only on a seven-out**; single player keeps the dice (T-25 read-only) | A2.7.2, A2.2 | A point made → same shooter; seven-out → next seat; solo never passes | NEW |
| MP-03 | A shooter needs a Pass or Don't Pass at the minimum; otherwise "Shooter passes" | A2.7.2 | A seat with no line bet → skipped with the toast | NEW |
| MP-04 | "Skip my turn to shoot" keeps the seat as a bettor | A2.7.2 | The seat stays in the betting rounds and is skipped as shooter | NEW |
| MP-05 | Per-seat private bankroll, rebuy counter, host can disable rebuys; no transfers | A2.7.5 | Seat A's bets never touch seat B's balance; "Rebuys: 2" shown | NEW (per-seat `createGame` state, REUSE) |
| MP-06 | Betting rounds in seat order, "Pass device to …" privacy screen, optional 30 s timer (Off), "Repeat my last bets" | A2.7.4 | The timer expiring keeps current bets; the privacy screen hides the previous seat's controls | NEW |
| MP-07 | Betting windows per bet type (A2.7.3 table), including the Fire window for all seats | A2.7.3 | A Pass after the come-out is refused for every seat | NEW, on REUSE `validate` |
| MP-08 | All seats' bets settle every roll regardless of shooter; per-player toasts "Ana +$39 Buy 4 · Ben −$5 Field" | A2.7.3, A2.7.6 | One roll settles N states; toast lines per seat | REUSE `settle` per seat state; NEW toast aggregation |
| MP-09 | Hand summary after a seven-out (shooter, rolls, points, per-seat net) | A2.7.6 | Values match the per-seat ledgers | NEW |
| MP-10 | Per-seat Tutor track; tips only on that seat's turn; no comments on others' bets | A2.7.7 | Seat B's Experienced tip never shows on seat A's turn | REUSE+ADAPT Tutor (seat scope) |
| MP-11 | Each seat can run a strategy coach for itself only | A2.4 T11 | The coach acts on its seat's state only | REUSE+ADAPT `autoBet` (seat state) |
| MP-12 | Shooter-practice coaching only for the current shooter | A2.7.7 | Set tips show only on the shooter screen | NEW |

## 7. Strategies T1–T24 (A2.4 + App Part 1)
**Common items (apply to every strategy):**
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| ST-01 | Strategy registry has T1–T24 with id, name, aliases, sources, tier, risk, filters (All / Baseline / Don't / Shooter) | A2.4, A2.1 #05 | 24 entries; the header reads "TABLE CRAPS · STRATEGIES" | REUSE+ADAPT `js/strategies.mjs` `STRATEGIES`, `strategyById` (app-tagged list) |
| ST-02 | **Free / Premium gating:** Free T1–T13, T17, T20, T21; Premium T14, T15, T16, T18, T19, T22, T23, T24 | P14-2 | A Standard user sees a lock on exactly 8 cards and can open the card summary, but not Play this / Tutorial; Premium unlocks all | NEW gate on REUSE entitlement flag (S7 item 10) |
| ST-03 | Every card shows: rules at $10, edge per bet and per roll (labeled "my calc" where the appendix says so), max on a 7 at 3-4-5x / 5x / 10x, bankroll, **40% stop-loss / +30% win goal** | App Part 1, P14-4/5/13 | Snapshot test per card against the appendix values | REUSE+ADAPT `lessonText` |
| ST-04 | "Play this" checks the bankroll vs the guide; offers 2x odds / fewer bets when short; offers the 40% / +30% limits | App §0.5, A1.7 B13 pattern | $1,000 chips + T4 → offers 2x; accepting sets `applyLiveLimits` immediately | REUSE `playThisSheet`, `applyOfferedLimits`, `js/session.mjs` `applyLiveLimits` |
| ST-05 | Auto-play: `autoBet` places that strategy's pre-roll bets at legal amounts; post-settle collects / presses / takes down per card | App Part 1 | The per-strategy golden sequences (RT-08) match the expected states roll by roll | REUSE+ADAPT `autoBet`, `applyAutoPress`, `clearStrategy`, helpers `tryPlace`, `topUp`, `fillPassOdds`, `fillLay`, `fillComeOdds`, `fillExact`, `oddsCap` |
| ST-06 | Coach mode: a ghost chip on the right spot of the locked board; one step at a time | App §2.0 | Ghost chip on Buy (above) / Place (below) the number; the board layout is unchanged (screenshot diff) | REUSE+ADAPT `markSpotlight`, `refreshCoachKicker` |
| ST-07 | Warning cards T20 / T21: red banner on the card, tutorial and Comparison line; never offered by "Play this"; no Billie | P14-9, P14-6 | Play this hidden for T20 / T21; the banner is present in all 3 places | NEW |
| ST-08 | Bet sizes never break a rule: $10 min, $500 max (odds exempt), $6 steps on 6/8 Place, even odds on 5/9, lay $2 / $3 / $6 steps | App §0.2 | A fuzz test over 10,000 seeded rolls per strategy: 0 refused actions, 0 illegal amounts | NEW legal-amount helper (TL-05) |

**Per-strategy items** (auto-play + coach steps exactly as App Part 1 / Part 2; RT-08 has an expected-state sequence for each):
| ID | Strategy | Key testable behavior | Source |
|---|---|---|---|
| ST-T1 | Pass + max odds | Odds $30 / $40 / $50 at 3-4-5x, $50 at 5x, $100 at 10x; every point pays $60 at 3-4-5x | REUSE+ADAPT `fillPassOdds` (preset) |
| ST-T2 | Don't Pass + lay | Lay $60 at 3-4-5x; $100 / $75 / $60 at 5x; $200 / $150 / $120 at 10x | REUSE+ADAPT `fillLay` |
| ST-T3 | Come / Don't Come, 2 numbers | Keeps exactly 2 numbers working; Come odds off on the come-out; DC lay odds on | REUSE+ADAPT `fillComeOdds`, `comePointCount` |
| ST-T4 | 3-Point Molly | Stops at 3; one re-Come after a hit; max on a 7 = $170 / $180 | REUSE+ADAPT (Bubble B-Molly path) |
| ST-T5 | Place 6/8 **$12** | $12 each after the point; pays $14 | REUSE `tryPlace` |
| ST-T6 | **$44 Inside** | Buy 5/9 $10 (pays $14.50), Place 6/8 $12 | REUSE+ADAPT (Buy default) |
| ST-T7 | **$44 Iron Cross** | Field $10 re-bet after each losing roll; Buy 5 $10; Place 6/8 $12; nets +$4.50 / +$4 / +$10 / +$20 / −$44 | NEW (Field re-bet loop) |
| ST-T8 | Hardways Hedge | $12 6/8 + $1 Hard 6/8; re-bet $1 after an easy roll | REUSE+ADAPT |
| ST-T9 | Regression $88 → $44 | Regress after the 1st hit; collect after | NEW |
| ST-T10 | Press progressions | Half / full press; cap 2 presses or 5× the opening | REUSE+ADAPT `applyAutoPress` (Bubble auto-press counts; reset on seven-out) |
| ST-T11 | Continuous Come | = B13 logic at $10; uncapped; off and on; $2,500 / 40% / +30% | REUSE `js/strategies.mjs` B13 path |
| ST-T12 | Hit and Split (+ option B, P14-10) | = B14 ladder at $10 (`b14OnHits`, `maintainB14`, `b14Reset`, `b14TakeAll`); option B: $88 Inside → split to 4/10 → $64 across | REUSE B14 (`js/strategies.mjs:267-401`); NEW option B |
| ST-T13 | Pass + Place 6/8 | Never places the point number | NEW (rule on REUSE `tryPlace`) |
| ST-T14 | $64 Across + Regression | Down 4/10 after hit 1, down 5/9 after hit 2; named "Across" | NEW |
| ST-T15 | 3-Point Dolly | 3 Don't positions; replaces after a repeat | NEW (mirror of T4) |
| ST-T16 | Lay the Outside | Lay 4 and 10 $40 (the other only if the point is 4/10); re-lay once per shooter | NEW (needs RE-13) |
| ST-T17 | Hit and Run | Down after 1 hit or 3 rolls (toggle On); sits out the rest of the hand | NEW |
| ST-T18 | 5-Count | Count badge; 1-count only on a come-out point number; 5th must be a point number ("4-count and holding"); then $44 Inside | NEW |
| ST-T19 | Doey-Don't | Pass + Don't $10; odds on the Pass only; the come-out 12 costs $10 | NEW |
| ST-T20 | Martingale on the Don't (warning) | 10 → 320; stop-loss after 5 losses on $700; the $640 bet is refused at the max → reset | NEW |
| ST-T21 | Come-out Hedge (warning) | $1 Any Craps every come-out only | NEW |
| ST-T22 | Power Press Ladder (coach, **no button**) | Steps 18→42→90→210→450 (6/8); 15→36→86→200→500 (5/9 Buy); 15→40→100→300→cap 500 (4/10 Buy); Give / Get exact (App T22) | REUSE+ADAPT `POWER_LADDERS`, `powerPlan` (compute only; no `powerPress` key; $500 cap) |
| ST-T23 | Don't + Place 6/8 hedge | −$14 net on a 7 | NEW |
| ST-T24 | Inside + Lay 4/10 ("Wise Guy") | −$6 net on a 7; come-out 7 = +$38 (T-30 On); "always working" option | NEW (needs RE-13 / RE-14) |

## 8. Tutorials and voices (App Part 2, P14-6)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| TU-01 | 24 interactive tutorials, step-through on the live table with practice chips; Beginner / Experienced columns exactly as App Part 2 | App Part 2 | Each prompt string is a fixture; the test walks every tutorial with forced rolls and asserts the prompt shown at each step | REUSE+ADAPT `tutorSteps`, `openTutor`, `advanceTutor`, `teachKey` (Table step lists) |
| TU-02 | Forced-roll scripts per tutorial drive each outcome row (e.g. T1: come-out 7, 2, point 6, 6, seven-out) | App Part 2 | Every outcome row in each tutorial is reached at least once | NEW scripts on the REUSE test rng hook (localhost only) |
| TU-03 | **Voice routing:** Dealer Billy (DB) on instructions, numbers, warnings, limits and session end; Bubbles Billie (BB) only on cheers; BB first, then DB, when both | App §0.4 | Each prompt row is tagged DB / BB in the fixture; a test fails if a BB line contains a $ amount for a bet size, "press", "hot", "due" or "can't lose" | REUSE+ADAPT `syncMascot`, `billyUp`; Billie art (`docs/BILLIE-NOTES.md`, the QA run 13 placement) |
| TU-04 | No Billie on T20 / T21 or on Comparison results | P14-6 | DOM check: `.win-billie` absent on those screens | REUSE+ADAPT |
| TU-05 | Common-mistakes list (3–5) and the edge / risk card end every tutorial, ending in "No system beats the edge. Practice chips only." | App Part 2 | The string is present on all 24 | NEW content |
| TU-06 | Session end: limit prompt with **Stop here · Keep playing · New session**; "Keep playing" doesn't restart auto-roll | App §2.0, A1.5b | Hitting −40% shows the sheet on that roll; auto-roll stays stopped | REUSE `openLimitPrompt`, `finishSession`, `js/session.mjs` `limitStatus` |
| TU-07 | Billie misplacement regression: speech bubble and body never overlap the result or the amount | QA runs 13/15 | 0 px overlap at the 6 phone sizes (FIT-03) | REUSE harness (`shot-run14.mjs` pattern) |

## 9. Strategy Comparison (Premium; App Part 3) — NEW on the REUSE engine
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| CMP-01 | Entry points: Learn → Compare; Fair Dice session → "Replay under strategies"; session summary link | App §3.1 | All 3 open C1 with the right source preselected | NEW |
| CMP-02 | Standard sees a fixed demo seed result with a lock | App §3.1 | Demo renders; any edit → lock sheet | NEW + REUSE `lockedExport` pattern |
| CMP-03 | C1 sources: this session / a Fair Dice session / CSV / Simulate (seed shown and editable, "Copy seed", length by shooters or rolls, rule set) | App §3.2 | Each source produces a `RollSequence` | NEW |
| CMP-04 | **Seeded PRNG, named and versioned (xoshiro128\*\*)**; dice list generated **before** any strategy runs | App §3.4 | The same seed yields the same 5,000 dice on 3 devices / browsers | REUSE `rollDie(rng)` test-rng parameter (`js/engine.mjs:388`); ADAPT `lastRngSource` to report `"seeded"` (now `"test"`) |
| CMP-05 | **Deterministic replay on the live engine:** each strategy gets a fresh state and the identical dice list through `settle` | App §3.4 | `replay(seq, T1)` ledger === the ledger of live auto-play forced with the same dice (byte-identical JSON) | REUSE `js/engine.mjs` `settle`; REUSE+ADAPT `autoBet` |
| CMP-06 | Up to 6 strategies; filters (Light / Dark / Hedge / Press-Regress / Warning / Free-Premium / Risk) | P14-12, App §3.2 | A 7th pick is refused; filters narrow the list correctly | NEW |
| CMP-07 | Per-pick options: unit, odds (only within the rule set), stop-loss / win goal, At a limit: Stop / Continue, strategy toggles; shared $1,000 or guide bankrolls | App §3.2 | Options persist in `StrategyRun.params` | NEW |
| CMP-08 | **Chart:** bankroll lines per roll; colors **plus** dash patterns; seven-out ticks; limit markers; busted end caps; tap to highlight; long-press tooltip with pip dice; pinch zoom; legend chips | App §3.2 | Visual snapshot at 320 / 390 / 430 and landscape; the tooltip shows pip dice that match the ledger | NEW chart; REUSE `miniDie` / `diceReadout` for the tooltip pips |
| CMP-09 | Metrics: net (settled), max drawdown $ and %, peak, **most at risk on one roll**, hands, seven-outs, rolls in action, expected loss, luck (actual − expected), total action, limit roll, open at end | App §3.2 | Unit tests on a hand-built 20-roll sequence with known answers for every metric | NEW |
| CMP-10 | Sorting labels the top row "Top on this replay": no trophy, no confetti, no Billie | App §3.2, P14-6 | DOM check | NEW |
| CMP-11 | C4 ledger per roll + CSV export (Premium) | App §3.2 | Ledger rows = rolls; the CSV columns match `RollEntry` | NEW; REUSE the S5.4 CSV writer |
| CMP-12 | Mobile layout (portrait chart 40% height + swipe cards; landscape side by side) and a screen-reader summary table | App §3.2 | FIT-01 sizes pass; VoiceOver reads the summary table | NEW |
| CMP-13 | Many-seed mode: K = 100 default, 1,000 max; median, the 10–90% band, % ahead, average expected loss, % stop-loss; cancellable progress in a worker | P14-12, App §3.2 | 1,000 seeds × 6 strategies completes; cancelling stops within 250 ms | NEW (worker) |
| CMP-14 | Expected loss per settled decision (from `edgeFor` / `EDGES`); one-roll bets every roll; open bets excluded | App §3.4, F4 | The sum over a 100,000-roll T5 run ≈ 1.52% of the settled Place action (±0.05%) | REUSE+ADAPT `pushDecision` (add `expectedLoss`), `edgeFor` |
| CMP-15 | Edge: Come / Don't Come in transit at the end → "Open at end" with stake and fair value ($10 Come on 4 = $6.67; DC on 4 = $13.33) | App §3.5 | Fixture sequence ending with an open Come 4 shows both values | NEW |
| CMP-16 | Edge: odds rounding per preset (even on 5/9, $5 on 6/8; lay $2 / $3 / $6) logged as a flag | App §3.5 | Ledger shows a "rounded" flag; amounts are legal | NEW (TL-05) |
| CMP-17 | Edge: $500 max → capped amount + remainder to chips, "capped" flag; T20's $640 → series ends at the max and resets | App §3.5 | T20 fixture of 6 losses → 7th bet $10, flag "max hit" | NEW |
| CMP-18 | Edge: out of bankroll → reduce to affordable legal amounts; below the minimum → "Busted at roll N", flat line, felt bets still settle | App §3.5 | Fixture with a $200 bankroll on T4 shows a bust roll | NEW |
| CMP-19 | Edge: limits Stop (no new bets; take down what can come down; flats ride) vs Continue (marker); ghost-line toggle | App §3.5 | Both modes produce the expected ledgers on a fixture | REUSE `limitStatus` logic; NEW replay handling |
| CMP-20 | Edge: come-out conventions from the snapshot (T-9, Come odds off, T-30 lays and DC odds on, T-10) | App §3.5 | Flipping T-30 in the snapshot changes only the lay settlements | REUSE engine flags |
| CMP-21 | Edge: Fire Bet overlay $1 / $5 per new shooter, same for all strategies, in its own column; no other side-bet overlays | App §3.5 | Strategy net excludes Fire net; the Fire column matches FB-0x logic | NEW |
| CMP-22 | Edge: a Crapless CSV is refused; a Bubble Regular CSV is accepted with a banner; >20,000 rows refused; bad rows skipped and counted | App §3.3, §3.5, P14-12 | Four fixture files produce the four outcomes | NEW |
| CMP-23 | Edge: recorded vs current rules (banner lists the differences) | App §3.5 | Fixture recorded with Field 3:1 shows the banner; a sim roll is excluded | NEW |
| CMP-24 | Edge: strategy version change → "Strategy updated since this run" | App §3.5 | Bumping the T5 version flags old runs | NEW |
| CMP-25 | Responsible-gaming copy on results, the luck tooltip and many-seed (App §3.6), and the banned words list | App §3.6 | Exact strings present; a grep test for "best strategy", "beat the house", "guaranteed", "hot", "due" in Comparison strings = 0 | NEW |
| CMP-26 | Performance: 6 strategies × 5,000 rolls < 1 s on a mid phone (worker) | App §3.4 | Benchmark on the CI device profile | NEW |

## 10. Tutor (S2, A2.6)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| TT-01 | Tracks Off / Beginner / Experienced; "Billy Tips" toggle | S2, A2.6 | Switching tracks changes the prompts on the next state | REUSE `currentTip`, `maybeTutor` |
| TT-02 | App 2 state table rows (A2.6) exactly as written, including the rev 15 strategy rows | A2.6 | A fixture per row; forced states show the exact string | REUSE+ADAPT (Table rows) |
| TT-03 | **"Long shot"** only on props with a win chance < about 1 in 6 per decision | S2 (rev 13d) | Hard 8 (1 in 11) → long shot; Place 6 → never | REUSE `isLongShot` (`js/engine.mjs:1701`) |
| TT-04 | **"High house edge"** at ≥ 9% | S2 (rev 13d) | Hard 6 9.09% → yes; Field 5.56% → no; Big 6 9.09% → yes | REUSE `tutorEdgeNote`, `edgeFor`; add Big 6/8, Lay, Fire to `EDGES` |
| TT-05 | Field gets neither label, only its own line ("Field: wins on 16 of 36 rolls, but the 5–8 numbers lose. 5.56% edge.") | S2, A2.6 | The Field toast is exact; it never contains "Long shot" | REUSE `tutorToastLine` |
| TT-06 | Repeater win chances per number; range **1 in 49 to 1 in 113** | S2, S1.7 | Repeater 4 → "about 1 in 81"; 2 → 1 in 49; 6 → 1 in 113 | REUSE (QA run 15 1a passes these strings) |
| TT-07 | Don't takedown warning, Fire window and Fire placed, Blazing tier, long hand, Fair Dice unusual rows | A2.6 | Each row is triggered by a forced state | REUSE+ADAPT |
| TT-08 | Experienced Edge numbers reflect the active rules (Premium) | S3 | Setting T-1 = 3:1 changes the Field line to 2.78% | REUSE `edgeFor` (rules-aware) |

## 11. Fair Dice, pip readouts, Premium Custom Rules, responsible-gaming copy
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| FD-01 | Fair Dice cards (badge, scopes, totals vs expected, sevens band, χ² ≥ 180 rolls, each die, hard vs easy, streaks, Last 20, history, above / below) | S5.2 | Each card renders from fixtures; the χ² critical values match S5.3 | REUSE `js/fair.mjs` all exports; `fairHTML`, `fairHistoryList` |
| FD-02 | RNG status "secure"; **no fallback in production** (Rule 0) | S5.1, Rule 0.4 | Production: crypto removed → "Can't roll…", no roll (RD-02) | REUSE+ADAPT `getRngSource` |
| FD-03 | Plain-words card incl. the App 2 line; never "rigged / hot / cold / due" | S5.1, S5.3 | Strings exact; banned-words grep = 0 | REUSE+ADAPT |
| FD-04 | CSV export Premium; numeric `die1` / `die2`; file name `billy-bubs-table-craps_rolls_YYYY-MM-DD.csv` | S5.4 | The export opens in a spreadsheet; the columns match S5.4 | REUSE `lockedExport` + Bubble CSV writer; ADAPT the name / columns |
| PIP-01 | Every roll readout = two pip dice + total badge + Hard tag; no "6+4 = 10" text | S4.2 | A grep for `/\d\s*\+\s*\d\s*=/` in rendered strings = 0 | REUSE `diceReadout`, `pipGrid`, `dieImg`, `paintDie` |
| PIP-02 | Sizes 32 px → 14 px minimum; fallback below that; label "six and four, ten" | S4.2 | aria-label exact on all 36 pairs | REUSE `rollTiles`, `miniDie`, `last20Sheet` |
| PR-01 | Premium Custom Rules T-1 … T-30 with presets (Standard, Strip Classic, Strip Deluxe, Strat 10x, Downtown 10x, Custom); changes apply at the next come-out | A2.3 | Each setting changes the engine on the next come-out, not mid-hand | REUSE+ADAPT `premiumHTML`, settings store (`load` / `save`), Edge Preview |
| PR-02 | Edge Preview live for every setting (S3), incl. Fire T-27 and Lay T-7 | S3, A2.3 | Changing T-7 to up front shows 2.44 / 3.23 / 4.00% | REUSE `edgeFor`, `edgeClass` |
| PR-03 | Premium locked view (mockup 08) with the upsell list; no "Shooter skill simulation" in the upsell | A2.3, mockup conflict 2 | The list text matches | REUSE+ADAPT `premiumHTML` |
| RG-01 | "Practice / play money" framing everywhere; no real-money or cash-out language in any string | A2.7, S5 | A grep over all user strings for "cash out", "withdraw", "real money", "prize" = 0 | NEW test (REUSE the string-scan approach from the QA runs) |
| RG-02 | "No system beats the edge" on every strategy card and tutorial end | App §2.0 | Present on 24 cards | NEW content |
| RG-03 | "Past rolls don't predict future rolls" on Comparison results and the Blazing meter tips | App §3, A2.6 | Strings present | REUSE+ADAPT |

## 12. Badges, leaderboard, limits and session (reuse)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| BL-01 | Session limits: loss / win goal, prompt once per limit, held roll | A1.5b pattern, App §2.0 | Prompt on the crossing roll; the roll button is held | REUSE `js/session.mjs` `startSession`, `limitStatus`, `endSession`; `js/ui.mjs` `openLimitPrompt` |
| BL-02 | **Limits apply immediately** when set or changed mid-session (QA run 6 P1-R6-B) | QA run 6 | Roll once, set a $25 loss limit, lose $60 → the prompt appears at −$25 | REUSE `applyLiveLimits` (`js/session.mjs:122`) |
| BL-03 | Badge engine reused with a Table Craps badge set (**F2: list not specced**) | — | Blocked until a Table badge list is specced; the engine runs with an empty set without errors | REUSE+ADAPT `js/badges.mjs` (`BADGES` per app; `evaluateRoll`, `noteAction`, `evaluateSession`) |
| BL-04 | **Badges / unlocks require a real paid bet** (QA run 6 P1-R6-A) | badges v4 rule | 40 rolls with no bet → 0 unlocks; a rule test on every badge def | REUSE `paidPassPoint`, `hadWorkingBet` gating |
| BL-05 | Leaderboard storage key per app (no collision with `bb-bubble-badges-v1`) | S7 | Table writes `bb-table-…`; the Bubble store is untouched | REUSE+ADAPT `js/leaderboard.mjs` `STORE_KEY`, `completedRoll`, `commitRoll` |
| BL-06 | Test / forced rolls never post to the leaderboard or unlock badges (QA R6-14) | QA run 6 | A forced roll on localhost → 0 leaderboard writes, 0 unlocks | REUSE+ADAPT (extend the R6-14 guard to badges) |
| BL-07 | Blazing meter cosmetic, Cold / Warm / Hot / Blazing | S6 | Tiers per S6 thresholds; no effect on dice | REUSE `blazingTier`, `blazingScore`, `blazeMoment`, `countPhrase` |

## 13. Accessibility and fit (320–430 + landscape)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| FIT-01 | All screens fit at 320×568, 360×640, 375×667, 390×844, 414×896, 430×932 and landscape 844×390 / 932×430 | S4.1 | Playwright: every interactive element is fully visible (0 px clipped) on every screen, in both tracks | REUSE+ADAPT `shot-run14.mjs` harness, `fitFelt`, `measureChrome` |
| FIT-02 | Locked board layout unchanged: Horn 2x2 left; Big Red above Hard Way All Day middle; Hard Ways 2x2 right; bottom row Pass / Odds / Don't Pass / Lay Odds; Buy above and Place below each number | S4.1 | Geometry snapshot = the reference at all sizes | REUSE `boardHTML`, `css/board-fix.css` |
| FIT-03 | No overlap: Billy / Billie, toasts, result box, Fire rail, seat rail | QA runs 13/15 | 0 px overlap on all 36 dice results × 6 sizes | REUSE harness |
| FIT-04 | Three-screen swipe (Side bets · Board · Dice) | S4.1 | Swipe threshold 48 px; buttons also work | REUSE `js/swipe.mjs` `resolveSwipe` |
| A11Y-01 | Every spot, chip, die and chart has a label; pip dice aria "six and four, ten"; Field aria per S1.4 | S1.4, S4.2 | axe-core: 0 serious / critical issues | REUSE labels; NEW for Table-only spots |
| A11Y-02 | Tap targets ≥ 44 pt; text scales to 130% without clipping (QA run 10 fallback) | S4.2 | 130% text run of FIT-01 passes | REUSE |
| A11Y-03 | Reduced motion: dice tumble and chart animations respect it | S4 | `prefers-reduced-motion` → no tumble; the result shows at once | REUSE `motionOff` |
| A11Y-04 | Color is never the only signal (edge badges, chart lines, Fire rail) | S2, App §3.2 | A grayscale screenshot is still readable (manual + pattern check) | REUSE `edgeChip` tones + NEW patterns |

## 14. QA lessons from the Bubble Craps runs (explicit checks)
| ID | Lesson | From | Acceptance criterion | Source |
|---|---|---|---|---|
| QL-01 | **The dice top face matches the engine** (the visible face, not `data-face`) | QA runs 8, 10, 11 | All 36 forced + 40 random: the computed visible top face (normal z > 0, most −y) = `lastDice` = readout = history | REUSE `tests/dice-faces.test.mjs` |
| QL-02 | **No clipping in the pip tiles** (Last 20, history, Comparison tooltip) | QA run 10 P1 R10-1 | Geometry: 0 dice outside their tile or clipped by any scrolling ancestor at all FIT-01 sizes | REUSE the run 11 geometry harness |
| QL-03 | **No mirrored dice:** the cube is right-handed (det > 0); the face art isn't reflected; no shrink or flip mid-tumble | QA run 8 R8-1/R8-2 | det ≈ +1.0000 across the tumble frames; scale ≥ 0.98; opposite faces sum to 7 | REUSE `tests/dice-faces.test.mjs` + run 12 tumble check |
| QL-04 | **Contract bets can't be refunded mid-hand** (Pass, Come point; Fire after roll 1; ATS / HWAD can't take added chips once lit) | A2.7.3, engine tests | UI and engine both refuse; no take-down affordance; the test list in RT-07 | REUSE `removeBet`, `tests/engine.test.mjs` l. 138, 865 |
| QL-05 | **The rng hook is local-test only and stripped from production at build time** (`__bbRng` and every `__bb*` hook; a hostname check alone isn't enough, see RD-07) | QA runs 6, 10, 12, Rule 0.7 | Production bundle: `typeof window.__bbRng === "undefined"` even when served from `localhost`; grep finds no `__bb` | REUSE+ADAPT `testRngAllowed` → build flag |
| QL-06 | **Badges / unlocks require a real paid bet** | QA run 6 P1-R6-A | = BL-04 | REUSE |
| QL-07 | **Limits apply immediately** | QA run 6 P1-R6-B | = BL-02 | REUSE |
| QL-08 | Auto-strategy take-down guards don't re-post the same point (B14 bug) | QA run 6 | T12 / T14 / T17 fixtures: after a take-down, no re-post until the next point | REUSE+ADAPT `maintainB14` guard pattern |
| QL-09 | Seven-out contrast and count plurals (the 51c229b fixes) | #16 | Contrast ≥ 4.5:1 on the seven-out toast; "1 roll / 2 rolls" | REUSE |

---

## 15. REQUIRED TESTS (must all pass before the release build)
| ID | Test | Acceptance criterion | Source |
|---|---|---|---|
| RT-01 | **Unit test for every payout:** Pass, Don't, Come, Don't Come, odds at 3-4-5x / 5x / 10x, lay odds, Place (all numbers), Buy, Lay, Field (3 settings), hardways, Big 6/8, every one-roll prop and hop, ATS, HWAD, Repeaters, Fire (4 presets × levels) | Exact to the cent at $10, $12, $25, $100, $500 (and $498 on 6/8) | REUSE+ADAPT `tests/engine.test.mjs` (l. 144, 169, 304, 393, 557) + NEW for Lay / Big 6/8 / Fire / odds presets |
| RT-02 | **Unit test for every edge** in `EDGES` vs the spec tables (per bet and per roll), incl. combined line + odds 0.374 / 0.326 / 0.184% and 0.273 / 0.227 / 0.124% | Match to 0.01 points | REUSE+ADAPT |
| RT-03 | **Forced-roll test across all 36 outcomes** for: come-out, point on each number, a full board of every bet kind | 36 × states; settlement table = expected fixture; caption / hardway / hop / horn totals agree | REUSE `tests/engine.test.mjs` l. 527 pattern + NEW Table fixtures |
| RT-04 | **Commission math:** Buy (5% of the stake, on win; T-5 Always; T-6 rounding) and Lay (5% of the win, on win; T-7 up front) | Buy $10 on 4 = $19.50; Lay $40 on 4 = $19; up-front edges 2.44 / 3.23 / 4.00% | REUSE `buyVig` tests + NEW lay |
| RT-05 | **Table max + odds exemption** | $500 caps flats / Place / Buy / Lay / props; odds and lay odds accepted above $500; $498 is the 6/8 cap | REUSE+ADAPT `tests/engine.test.mjs` l. 70 ("table max is $1,000" → per profile) |
| RT-06 | Table min / prop min | $10 min; $1 hardways / Any Craps; refused below | NEW |
| RT-07 | Contract / takedown rules | Pass / Come refused; Don't confirm; Fire after roll 1 refused; ATS / HWAD lamp rule | REUSE l. 127, 138, 865 |
| RT-08 | **Strategy simulations with expected states:** per T1–T24, a fixed dice script (≥ 30 rolls covering every outcome row) → expected felt, bankroll and coach prompt after each roll | 24 golden files pass; any diff fails CI | REUSE+ADAPT the `strategies.mjs` tests (`run1x.test.mjs` pattern) |
| RT-09 | Strategy legality fuzz | 10,000 seeded rolls per strategy × 3 odds presets: 0 illegal or refused actions | NEW |
| RT-10 | **Replay determinism** | The same seed + rules + versions → byte-identical ledgers across 3 runs and 2 browsers; live auto-play forced with the same dice = replay ledger | NEW |
| RT-11 | **Dice render vs engine** | All 36 forced + 40 random throws (incl. after a dice set and a no-roll): visible top face = `lastDice` = pip readout = history = Fair Dice | REUSE `tests/dice-faces.test.mjs`, `tests/readout.test.mjs` |
| RT-12 | **Set-dice fairness** | SD-03 χ² per set; the set / grip / meter values aren't passed into `rollDice` (static check) | NEW |
| RT-13 | RNG | Rejection sampling: 6 × 10⁶ draws, each face 1/6 ± 0.1%; no fallback path in production (RD-02) | REUSE `rollDie` tests |
| RT-14 | Fire Bet math | Markov table matches A2.2a; pays and window tests (FB-01…07) | NEW |
| RT-15 | Multiplayer rotation | 4 seats, scripted: dice pass only on seven-outs; skip; shooter-passes; Fire per seat | NEW |
| RT-16 | Comparison edge cases CMP-15…24 | Each fixture yields the expected ledger / banner | NEW |
| RT-17 | Tutor thresholds | Long shot < ~1 in 6 (props only); high edge ≥ 9%; Field line; Repeater 1 in 49 – 1 in 113 | REUSE `run15.test.mjs` pattern |
| RT-18 | Voice routing | 0 Billie lines with bet advice or banned words; DB / BB tags match App Part 2 | NEW |
| RT-19 | **Fit check** | FIT-01 sizes + landscape + 130% text: 0 clipped interactive elements, 0 clipped dice, 0 overlaps | REUSE `shot-run14.mjs` harness |
| RT-20 | Localhost-only hooks | Production build: all `__bb*` hooks undefined | REUSE (QA run 10 check) |
| RT-21 | Badges / limits | No-bet rolls unlock nothing; a limit set mid-session fires immediately; forced rolls never post | REUSE `tests/badges.test.mjs`, `tests/leaderboard.test.mjs` + session tests |
| RT-22 | Strings | Banned words (cash out, real money, rigged, hot dice, due, guaranteed, beat the house) = 0 across all user strings | NEW |
| RT-23 | Gating | Standard: 8 Premium strategies locked, Comparison demo-only, CSV locked, T-xx locked; Premium: all open | NEW |
| RT-24 | **Rail invariant (A2.2b):** after **every** bet, take-down, settle, change, color-up, reset, reload and seat switch: `railTotal(rail) === state.bankroll === netWorth − tableTotal`, counts integer ≥ 0, cup 0–99 | 0 violations over: a 100,000-roll seeded sim **× all 24 strategies × 3 odds presets (3-4-5x / 5x / 10x)**, with T-5 Always and T-7 up-front vig on and off; plus 10,000 random manual bet / take-down fuzz actions; plus a reload every 1,000 rolls; `rail-rebuilt` count = 0 | NEW |
| RT-25 | Change-making and color-up are value-preserving | Property test: 100,000 random rails × random bet amounts → after `railPay`, `railCredit`, `railColorUp`, total changes by exactly the amount paid / credited / 0 | NEW |
| RT-26 | **Point-made fires on point made only** (both apps) | 36 forced outcomes × come-out + each point: fires iff result = point-made | NEW |
| RT-27 | **Celebration tier logic** (both apps) | Scripted hands 1 / 2 / 3 / 5 points → Base / Big / Huge / Huge; Blazing-by-rolls → Huge; Table Fire 4th–6th unique → stinger | NEW |
| RT-28 | **Celebration doesn't block the roll** (both apps) | Playwright: ROLL at 100 ms into a Huge starts the roll in that frame and clears the overlay; auto-roll interval unchanged ± 50 ms; total ≤ 2.5 s | REUSE R10-2 check pattern (`qa-bubble-run11.md` item 4) |
| RT-29 | **Real dice χ²** | ≥ 1,000,000 seeded rolls: each die faces χ² (df 5) and totals χ² (df 10), p ≥ 0.001; plus one unseeded 1M crypto run in CI (rerun once on a fail, both logged) | NEW (uses REUSE `js/fair.mjs` `totalsTest`, `facesTest`) |
| RT-30 | **Independence** | 1M rolls: lag-1 correlation of die 1, die 2, total each \|r\| < 4/√n; 36-cell die1 × die2 χ² (df 35) p ≥ 0.001; P(7 \| 7 before) = 6/36 ± 0.5 pt | NEW |
| RT-31 | **Set dice and throw don't change the distribution** | 1M rolls per set (3-V, Hardway, 2-V, All-Sevens) with random meter inputs: χ² per set p ≥ 0.001 and two-sample χ² vs no-set p ≥ 0.001; static check RD-03 | NEW (extends SD-03 to 1M) |
| RT-32 | **Production has no fallback and no hooks** | Production bundle: no `Math.random` in `rollDie`, no `__bb*`, no skill-sim identifiers; still holds when served from `localhost` | NEW |
| RT-33 | **`lingo.json` schema and lint** (both apps) | 79 terms (Table) / 78 (Bubble build, no `fire_bet`); unique ids; every `related` / `etiquette` id resolves; every `link` kind exists on that app's board; meaning ≤ 240 chars, call ≤ 80; 0 banned words (RT-22 + S6 + S4.3 lists; Bubble adds "Fire") | NEW |
| RT-34 | **Call-map sweep** (both apps) | 36 forced outcomes × come-out and each point (+ a no-roll, Table): every result-line call opens the `callMap` term; point-on 7 → `seven_out`, come-out 7 → `natural`; no call resolves from text | NEW |
| RT-35 | **Roll calls never block the dice** (both apps) | Playwright: with a peek open, SHOOT / ROLL starts the throw in that frame and the peek closes; result-line render time with links within 1 frame of without; T-26 timer and auto-roll intervals unchanged ± 50 ms; 0 network requests | NEW (REUSE R10-2 pattern) |
| RT-36 | **Gestures** (both apps) | Tap < 500 ms → chip placed, no added delay; hold ≥ 500 ms with < 10 px → spot sheet, no chip; 12 px drag → swipe, no sheet; `contextmenu` suppressed; dock keys never open a sheet | NEW |
| RT-37 | **Lingo offline and search** (both apps) | Airplane mode: Lingo screen, search, cards, Show me, badge all work; the `craps-lingo.md` §5 search fixtures pass | NEW |
| RT-38 | **Session history math** | SH-04 and SH-06 fixtures pass; a 10,000-roll seeded sim's session `net` = Σ `player_net` in its rolls to the cent; Reset never adds to all-time | NEW |
| RT-39 | **Your Dice exclusions X1–X8** | After 1,000 entered rolls (incl. a 40-roll hand, every point made, ATS / HWAD hits): `rollDie` calls 0; Fair Dice log, every Fair Dice card, RSR, leaderboard, badge progress and RNG history byte-identical to before; Comparison refuses the session | NEW |
| RT-40 | **Your Dice settles like the engine** | 36 ordered pairs × come-out + 6 points × a full board: entered ledger === forced-RNG ledger | REUSE `settle` |
| RT-41 | **Limit tiers and table rules** | Per tier: min / max refusals, $6-step caps, odds exempt, unchanged side limits; Field label = payout in 4 combos; odds presets' max per point | NEW |
| RT-42 | **Roll speed** | 36 pairs × 3 speeds render-vs-engine; caps per S11 table; never-blocks at 3 speeds; identical stats across speeds for one forced script | REUSE RT-11 / RT-28 patterns |
| RT-43 | **Quick bets** | QB-03 / QB-04 / QB-06 / QB-08 fixtures; 10,000 random taps across states: 0 second bets on a number, 0 illegal amounts, RT-24 invariant 0 violations | NEW |
| RT-44 | **Drill answers = engine** | PD-02 sweep (10,000 questions per level) | NEW |

## 16. Point-made celebration (S4.3; rev 15a; both apps, Table items here, Bubble items on the spec's run-16 list)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| PM-01 | Trigger only on `result === "point-made"` | S4.3 | 36-outcome forced sweep at come-out and on each point: fires only on the point number; not on come-out 7 / 11, craps, point set, seven-out, no decision | **NEW** `pointMade(settled, before)` |
| PM-02 | Come, Place, Buy, Lay, hardway, prop, Repeater, ATS, Fire-pay rolls that aren't a point made → normal payout pulse only | S4.3 | A Come 6 win while the point is 8 → pulse, no celebration | REUSE `burstChips` pulse |
| PM-03 | Full with a working Pass bet; quiet without (none, Don't only, other bets): no confetti, no haptic, ≤ 1.2 s | S4.3 | Two fixtures differ exactly as specced; `navigator.vibrate` not called in quiet | NEW |
| PM-04 | Tiers from `hand.points`: 1 = Base, 2 = Big, ≥ 3 = Huge; Blazing meter at Blazing after the roll (meter on) = Huge | S4.3, S6 | Scripted hands with 1, 2, 3, 5 points; a 1-point hand at score ≥ 24 → Huge; meter off → Base | REUSE `hand.points`, `blazeMoment`; NEW tier fn |
| PM-05 | Fire stinger on the 4th, 5th, 6th unique Fire point; replaces the Fire toast for 4–6; no pay copy without a Fire Bet; amounts follow the active pay table | S4.3, A2.2a | Script making 4, 5, 6, 8, 9, 10 → stingers at the 4th–6th only; repeat points add none; Generous preset shows 29 / 299 / 999 | NEW (on the FB-xx tracker) |
| PM-06 | Fire stinger uses Fire-rail colors, never the Blazing meter's | S4.3, A2.2a | Style check: stinger has no Blazing token classes | NEW |
| PM-07 | Dealer Billy call (number word from the readout) + Bubbles Billie cheer; strings per tier exactly | S4.3, A2.4 voice rule | String fixtures; Billie lines contain no bet advice | REUSE Billie / Billy art |
| PM-08 | Sound per tier via `audio.win()` + runs; Settings › Sound off → silent | S4.3 | Audio calls counted per tier; muted → 0 nodes started | REUSE `js/audio.mjs` `win` |
| PM-09 | Haptics per tier; follow Settings › Haptics | S4.3 | `vibrate` patterns exact; haptics off → not called | REUSE `haptic` |
| PM-10 | **≤ 2.5 s total** (Base 1.2, Big 2.0, Huge 2.5, stinger inside), self-clears | S4.3 | Timer fixtures; overlay gone by 2.5 s + 1 frame | REUSE `celeTimer` |
| PM-11 | **Tap to skip;** non-modal overlay, taps pass through to the board | S4.3 | Tap stamp → gone; tap a spot under the overlay → bet placed | NEW |
| PM-12 | **Never blocks or delays the next roll; clears on roll start (R10-2)** | S4.3, QA run 10/11 | ROLL / swipe / keyboard / auto-roll at 100 ms into a Huge: roll starts that frame, overlay removed (`clearWin()` at the top of `doRoll`); auto-roll interval unchanged ± 50 ms | REUSE `clearWin` |
| PM-13 | Same-roll Big Win merged (one overlay with the Big Win amount) | S4.3, Open question 6 | Point made + `isBigWin` → 1 overlay; `.winlayer` count = 1 | REUSE+ADAPT `showBigWin`, `isBigWin` |
| PM-14 | Badge toasts queue behind it | S4.3 | Unlock on a point-made roll → badge shows after the celebration clears | REUSE `badgeQueue` |
| PM-15 | Reduce motion: no confetti / sunburst / bounce; fade ≤ 1.2 s; words, sound, haptics stay | S4.3 | `motionOff()` fixture | REUSE `motionOff` |
| PM-16 | RG copy: 0 of "bet more", "press", "let it ride", "keep it going", "due", "hot dice", "can't lose", "on fire"; no Tutor upsize after it | S4.3 | String scan + a Tutor trace after 20 celebrations shows no bet-size prompt | NEW |
| PM-17 | A11y: one polite announcement; ≤ 3 flashes / s; contrast AA | S4.3 | Live region fires once; flash-rate check on the animation | NEW |
| PM-18 | Multiplayer: one table celebration; full if any seat had Pass; per-seat pulses | S4.3, A2.7 | 3-seat fixture: only seat 2 on Pass → full, no single amount on the stamp | NEW |
| PM-19 | Fit: stamp, Billy, Billie and stinger never clip or cover ROLL / dock at 320–430 + landscape + 130% text | S4.3, FIT-01 | Harness: 0 overlaps with `#roll`, 0 clipped | REUSE `shot-run14.mjs` |

## 17. Rule 0: real dice, real odds (both apps; rev 15a)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| RD-01 | Each die = `crypto.getRandomValues` Uint32 with rejection sampling (`limit = 2³² − 2³² mod 6`), two draws per roll | Rule 0.1 | Code check + unit test with a stubbed crypto returning values ≥ limit → redrawn | **REUSE** `rollDie` / `rollDice` (`js/engine.mjs:388-415`, verified at `51c229b`) |
| RD-02 | **No `Math.random()` fallback in production;** no crypto → "Can't roll…" and no roll | Rule 0.4 | Stub `crypto` away in a production build → no roll, message shown; bundle grep: no `Math.random` in `rollDie` | REUSE+ADAPT `rollDie` (remove `:405-406`) |
| RD-03 | Nothing reaches the roll: set, grip, meter, no-roll, strategies, auto-bets, Blazing, Fire, badges, limits, Premium / Custom Rules | Rule 0.3, A2.5 | Static call-graph check: `rollDice` is called only from `doRoll` / the throw handler with no argument (test builds: the hook) | REUSE + NEW static test |
| RD-04 | **No skill-simulation mode or `dice_source: skill-sim`** anywhere | Rule 0.3, rev 15a | Bundle grep for `influence`, `srr`, `rollNonSeven`, `skill-sim`: 0 | NEW (don't port) |
| RD-05 | No-roll decided apart from the result; its dice discarded; fresh draw | Rule 0.5, SD-02 | Fixture: 1,000 forced no-rolls → the following rolls' distribution unchanged (χ² p ≥ 0.001) | NEW |
| RD-06 | Payouts and edges use the real math | Rule 0.6, S1 | RT-01 / RT-02 pass | REUSE |
| RD-07 | Test hook stripped from production at build time (not just a hostname check) | Rule 0.7 | Production bundle: `__bbRng` and every `__bb*` absent even when served from `localhost` / `capacitor://localhost` / `file://` | REUSE+ADAPT `testRngAllowed` (`js/ui.mjs:931-934`) → build flag |
| RD-08 | Seeded generators labeled and kept out of live play, Fair Dice, badges, leaderboard | Rule 0.8, App §3 | A Comparison seed run writes 0 Fair Dice / badge / leaderboard records | NEW |
| RD-09 | Player-facing "Real dice, real odds" line on Fair Dice, onboarding, tutorial | Rule 0, S5.1 | Exact string present in all three places | REUSE+ADAPT `fairHTML` |

## 18. Etiquette guide (`etiquette-guide.md`; rev 15a; Table Craps hooks)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| ET-01 | Shared `etiquette` string table: 15 tips, each with ID, Billy text, Why, tag (`liveOnly`), apps | Guide | Schema test: 15 entries, all fields present; Billy text ≤ 220 chars | NEW |
| ET-02 | Tip cards on the tutorial screen: all 15 untagged, swipeable, "Got it" to advance | Guide H1 | Deck order = guide order; 320 px + 130% text: no clipping | NEW; REUSE Tutor card UI (`openTutor`, `advanceTutor`) |
| ET-03 | Rotating "Billy's Table Tip," once per session; no repeats until all shown | Guide H2 | 15 sessions → 15 different tips; never during a roll, seven-out, celebration (PM-12) or limit prompt | NEW |
| ET-04 | Contextual nudges (10 triggers): buy-in / reload → 1; set-dice first open → 3; no-roll → 12; bet change while dice animate → 6; late bet after timer → 7; first Place / Buy / Come → 6; Leave table → 8; first Don't Pass → 9; first session → 14; new shooter (pass-and-play) → 2 | Guide H3 | Each fixture fires the right tip once per session; ≤ 1 per 10 rolls; off with Tutor tips off | REUSE+ADAPT `maybeTutor` |
| ET-05 | Badge "Table Manners" (Bronze, learning): all cards viewed + last "Got it" | Guide H4, badges global rules | Unlock fixture; no bet or roll can unlock it; added to the Table badge list (BL-03) | REUSE `noteAction` pattern (`tutor_tour_complete`) |
| ET-06 | No in-app toke bet | Guide | No "bet for the dealers" spot or control exists | — |
| ET-07 | Copy rules: 0 banned words; tips 4 and 12 say they don't change the dice; tip 5 says it's optional and from your budget | Guide, Rule 0 | String scan + exact-phrase checks | NEW |
| ET-08 | Voice: every tip is Dealer Billy; Bubbles Billie never appears in the deck | Guide, A2.4 | Deck art check | REUSE art |

## 19. Craps Lingo (S4.5; `craps-lingo.md`, `lingo.json`; rev 15d; Table Craps hooks, Bubble items on the spec's run-16 list BL16-30 to BL16-42)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| LG-01 | Shared `lingo.json` loaded at startup; Table lists all **79** terms (Dice 21 · Bets 26 · Actions 14 · Table 18) | S4.5, Lingo §2 | Schema test (RT-33) passes; the counts render on the chips | NEW `lingo` module (shared, S7 package 5) |
| LG-02 | Lingo screen: a "Craps Lingo" row on Learn + a Lingo item in the menu; free (no Premium lock) | S4.5 H1 | Both entries open the same screen in Standard and Premium | NEW; REUSE Tutor card UI for the card |
| LG-03 | Fuzzy search per Lingo §5 | S4.5 H1, Lingo §5 | Every §5 fixture passes ("nina" → Nina + Center field nine; "c&e" → C&E; "whril" → World / Whirl; "fire" → Fire Bet; "cash out" → empty state); results update per keystroke with no network | NEW |
| LG-04 | Category chips All · Dice · Bets · Actions · Table (single select, counts); Dice sorted 2 → 12, others A–Z; Recent calls strip (last 5 this session) | S4.5 H1 | Chip fixtures show the right counts and order; the strip lists the last 5 calls, newest first | NEW |
| LG-05 | Term card for Table: tag chip, meaning, example call, "Say it", Table note, Related, etiquette link (opens that ET tip card), footer | S4.5, Lingo §1 | Fixture per tag type: `lay` (Table Craps, `lay:4`), `toke` (Live table, "no tip or toke bet in the app"), `fire_bet` (Table only, window rule), `horn_high` / `whirl` ("Build it"), `color_up` (rail + Leave table) | NEW |
| LG-06 | **Long-press a bet spot → spot sheet** (Bets sheet felt, Side-bets tiles incl. the Fire tile): 500 ms, < 10 px | S4.5 H2 | Sheet order: Lingo card, Tutor line + Why?, Your bet (Take down when allowed, incl. ATS / HWAD / Repeaters / hops per S1.6–S1.7), On this spot (multiplayer); the release places no chip | NEW handler; REUSE `swallowClick` pattern, `takeBet` |
| LG-07 | Tap / swipe unchanged | S4.5 H2, S4.1 | Tap < 500 ms places a chip with no added latency; a ≥ 12 px drag swipes and cancels the hold; `contextmenu` suppressed; no iOS callout or text selection on the felt | REUSE `resolveSwipe` |
| LG-08 | Other long-press targets keep theirs: rail "Your chips" (A2.2b.3, footer links Color up / Check change), Comparison chart tooltip (CMP-08); **no** long-press on SHOOT or any dock key | S4.5 H2 | Each target opens only its own sheet; SHOOT held 2 s does nothing extra | REUSE CR-04 sheet, CMP-08 |
| LG-09 | Tappable roll calls on the shooter-screen result line, from `callMap` on the settled roll | S4.5 H3, Lingo §4 | RT-34 sweep passes; the roll banner / mini toast tap still jumps to the Dice screen; celebration / PSO / Fire overlays still skip on tap | NEW; REUSE `diceReadout` settled object |
| LG-10 | **Roll calls never block or delay the dice** | S4.5 H3 | RT-35 passes: SHOOT works with a peek open, the peek closes at throw start; the T-26 timer isn't paused; no `await` / fetch on the result path | NEW; REUSE `clearWin` |
| LG-11 | Show me on the board: page switch + highlight + coach bubble with the spot's Tutor line | S4.5 H4 | `big_6_8` with the toggle off → disabled with the reason; `ui:rail` highlights the rail; mid-throw → waits for settle; Tutor Off → Beginner line, Tutor stays Off; no bet placed, chip unchanged | REUSE `openTutor`, `currentTip` + NEW highlight |
| LG-12 | Badge **"Talk the Talk"** (Silver, learning collection): 25 distinct terms, each card ≥ 2 s or read to the end | S4.5 H5, Lingo §6 | Unlock fixture at 25; 24 + search-row views → locked; no bet or roll can unlock it; x/25 only on the Badges screen; added to the Table badge list after Table Manners (BL-03) | REUSE `noteAction` pattern (`tutor_tour_complete`) |
| LG-13 | Copy rules | S4.5, Lingo copy rules | RT-33 lint = 0; `toke` and `comp` say the app has none; no tip / toke spot or control (ET-06); no "cash out"; "press it" carries its risk line | NEW strings test |
| LG-14 | Accessibility | S4.5 | Labels from `srLabel`; "Say it" hints read as words; the custom action "Lingo" on every spot; L / Shift+F10 / context-menu key on a focused spot; VoiceOver double-tap-and-hold opens the sheet; the call is a button after the roll announcement and never takes focus by itself; axe-core 0 serious | REUSE labels (A11Y-01) + NEW |
| LG-15 | Fit at 320–430 + landscape + 130% text | S4.5, FIT-01 | List rows ≥ 56 px, no clipping; the full card ≤ 85% height and scrolls; the peek ≤ 45% height (side panel in short landscape) and never covers the result line or the dock | REUSE `shot-run14.mjs` harness |
| LG-16 | Works offline | S4.5 | Airplane mode (RT-37): everything works; `lingo.json` is in the precache list | NEW |
| LG-17 | Setting "Lingo links on roll calls" (default On) | S4.5 H3 | Off → calls are plain text and not focusable; On → links return on the next roll | NEW |
| LG-18 | Multiplayer (pass-and-play) | S4.5, A2.7 | Any seat can open Lingo, the spot sheet or a peek; only the active player can Take down, and only their own chips; the turn timer isn't paused | REUSE+ADAPT seat routing |

## 20. Session history and bankroll chart (S8; rev 16)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| SH-01 | Session boundaries = A1.5b: start on the first roll after launch / end / Reset; end on End session, Reset bankroll, **Leave table**, 30 min idle | S8, A1.5b | Fixtures for each start and end cause; `ended_by` = `end` / `reset` / `leave` / `idle` | REUSE `js/session.mjs` `startSession`, `endSession` |
| SH-02 | Session record has every S8 field; store `bb-table-history-v1`, separate from game, badge, Fair Dice keys | S8 | Schema test; clearing history leaves the other stores byte-identical | NEW |
| SH-03 | `series`: one point per settled roll with `total` = bankroll + on table, `on_table`, markers seven-out / point-made / limit | S8 | 100-roll fixture: point count = rolls; each `total` = `netWorth` after that settle; markers on the right rolls | NEW (reads REUSE `netWorth`, `tableTotal`) |
| SH-04 | Peak, low, max drawdown ($ and %), net, rolls, hands, points, seven-outs, longest hand, total action | S8 | Hand-built 20-roll fixture with known answers for every field | NEW (share CMP-09 metric code) |
| SH-05 | Session chart: start line, limit lines, seven-out ticks, limit dot, tooltip with 20 px pip dice + result + net so far | S8, S4.2 | Visual snapshot at 320 / 390 / 430 + landscape; tooltip pips = the Fair Dice history row for that roll | REUSE+ADAPT the CMP-08 chart; REUSE `diceReadout` |
| SH-06 | All-time chart = running sum of session nets; **a Reset bankroll never adds to it** | S8 | Fixture: lose to $0, Reset to $1,000, win $100 → all-time = −$1,000 + $100 = −$900, not +$100 | NEW |
| SH-07 | Totals and filters (rule preset, limit tier, strategy); "Highest / Lowest session" wording | S8 | Filter fixtures; string check: no "best" / "worst" | NEW |
| SH-08 | Multiplayer: one session per seat, under the seat name | S8, A2.7 | 3-seat fixture → 3 records; seat A's chart never contains seat B's totals | NEW |
| SH-09 | Never recorded: Comparison runs, seeded sims, Your Dice sessions (own list) | S8, S9 X7, Rule 0.8 | A 1,000-seed Comparison run and a Your Dice session add 0 RNG history records | NEW |
| SH-10 | Caps: full series for the latest 200 sessions; older → 200-point min/max downsample; one session ≤ 5,000 points; summaries exact | S8 | 250-session fixture: sessions 1–50 have 200 points each and keep their exact peak and low | NEW |
| SH-11 | Copy and a11y: chart footer exact; `role="img"` summary; "Show as table"; color + dash; reduce motion; 130% text | S8 | String fixtures; axe 0 serious; grayscale screenshot readable | REUSE label patterns + NEW |
| SH-12 | Split (if Bill agrees): Free = session chart + last 20 + totals; Premium = full list, all-time chart, filters, sessions CSV | S8 | Standard: session 21 and the all-time chart show the lock; Premium: open; CSV columns = S8 fields minus `series` | REUSE entitlement flag, `lockedExport` |

## 21. Your Dice mode: entered dice (S9; rev 16)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| YD-01 | Enter / leave only between hands (`hand.rolls === 0`); mid-hand → "Finish this hand first" | S9 | Fixture mid-hand → refused with the text; after a seven-out → allowed | NEW (REUSE the mode-switch guard pattern) |
| YD-02 | Separate state: own bankroll, felt, hand and rail; the RNG game is restored exactly on leave | S9 | Snapshot of the RNG state before entering === after leaving (deep equal); no transfer between bankrolls | NEW (per-mode `createGame` state) |
| YD-03 | Solo table only (MVP); hidden in pass-and-play | S9 | Pass-and-play menu has no Your Dice entry | NEW |
| YD-04 | Label: "YOUR DICE · you enter the rolls" banner + HUD; "YOURS" tag on every pip readout; label adds "entered" | S9, S4.2 | All readout sizes in S4.2 carry the tag; aria "six and four, ten, entered" | REUSE+ADAPT `diceReadout` (tag option) |
| YD-05 | Entry: 21-pair quick pad and die pad (die 1 then die 2); Settle; Undo last roll (one step) | S9 | All 21 pairs and all 36 ordered pairs enter correctly; Undo restores the full pre-roll state; a second Undo is disabled | REUSE hop-tile grid; NEW pad |
| YD-06 | Settlement identical to an app roll | S9, Rule 0.6 | 36 pairs × come-out + each point: `settle(entered)` ledger === `settle(forced RNG test roll)` ledger for the same faces | REUSE `settle` |
| YD-07 | **X1: no RNG path.** Entering a roll never calls `rollDie` / `rollDice` | S9 X1, Rule 0 | Spy on `rollDie`: 0 calls over 500 entered rolls; static check: the entry handler can't reach `rollDice` | NEW static + spy test |
| YD-08 | **X2 / X3: no Fair Dice or RNG stats.** Fair Dice log, every card and scope, RSR, the CSV and RNG telemetry are unchanged | S9 X2–X3 | Fair Dice log length and every card's numbers identical before and after 500 entered rolls; Fair Dice CSV has 0 `entered` rows | NEW |
| YD-09 | **X4: no Longest Roll.** No board entry, no toast, no Longest Roll banner in the PSO (the "Hand over" tag may show) | S9 X4, S4.4 | A 40-roll entered hand → 0 leaderboard writes; PSO shows the tag, not the banner | REUSE+ADAPT `completedRoll` / `commitRoll` guard (the R6-14 forced-roll guard) |
| YD-10 | **X5: no badges.** No progress, unlock or count from entered rolls or their bets; Your Dice sessions never qualify | S9 X5 | Scripted entered sequences that would unlock 10 roll badges → 0 unlocks, 0 progress change; Table Manners card reading still unlocks it | REUSE+ADAPT `evaluateRoll` / `evaluateSession` gate on `dice_source` |
| YD-11 | **X6: no Comparison.** Not a source; CSV `entered` rows refused and counted as skipped | S9 X6 | C1 source list omits Your Dice sessions; a 100-row CSV with 10 `entered` rows → 90 used, "10 skipped" | NEW (extends CMP-22) |
| YD-12 | **X7 / X8:** own history list; never in RNG totals or quoted rates | S9 X7–X8 | RNG all-time chart unchanged after a Your Dice session; it shows under the "Your Dice" tab | NEW |
| YD-13 | Paste a sequence: "6-4, 3-3" text or Fair Dice CSV `die1` / `die2`; Next roll steps through; bad tokens reported | S9 | 3 fixtures (text, CSV, a bad token) give the expected sequences and messages | NEW |
| YD-14 | Copy: onboarding line exact; no luck / hot / cold / due comparisons; works offline | S9, S6 | String fixtures; banned-words scan = 0; airplane mode: the mode works | NEW strings test |

## 22. Table rule settings and limit tiers (S10; rev 16; tiers PROPOSED)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| RS-01 | Table rules sheet (Field 12, odds, starting bankroll, limit tier) from the rules chip, Settings and Premium; Edge Preview on every change | S10, S3 | Each entry opens the sheet; each change animates the affected edges | REUSE+ADAPT `premiumHTML`, Edge Preview |
| RS-02 | **Field 12 (T-2):** 2:1 → 5.56%, 3:1 → 2.78%; with T-1 3:1 too → 0%; payout and felt label read the same setting | S10, S1.4 | 36-pair table per setting; label text per S1.4; label and `fieldWin` agree in all 4 combos | REUSE `fieldWin` (`js/table-rules.mjs:95-100`), `fieldPresentation` |
| RS-03 | **Odds (T-3):** 1x, 2x, 3-4-5x, 5x, 10x, 20x, 100x selectable; lay odds follow T-4 | S10, A2.3 | Max odds per point per preset; the Edge Preview shows 0.85 / 0.61 / 0.37 / 0.33 / 0.18 / 0.10 / 0.02% | REUSE `oddsMultipleFor`, `maxPassFor`, `maxLayFor` |
| RS-04 | Odds and lay odds exempt from the max in **every** tier | S10, P14-8 | High roller tier, $5,000 Pass + 100x odds $500,000 accepted when the bankroll covers it | REUSE `tableMaxFor` (`Infinity` for odds) |
| RS-05 | **Starting bankroll (T-14)** presets; applies only through Reset bankroll, which ends the session | S10 | Changing it mid-session leaves `bankroll` unchanged until Reset; Reset then starts at the new amount and a new session | REUSE `resetBankroll` + NEW setting |
| RS-06 | **Limit tier (T-31, PROPOSED values):** Standard $10 / $500; High limit $25 / $2,000; High roller $100 / $5,000; Salon $500 / $25,000 (only if Bill raises T-13) | S10 | Each tier sets `tableMin` / `tableMax`; a $24 Pass at High limit refused; max ≥ 20 × min for every tier | REUSE `tableMinFor` / `tableMaxFor` + NEW tier table |
| RS-07 | Place 6/8 cap = largest $6 step ≤ max: $498 / $1,998 / $4,998 / $24,996; message names it | S10, TL-04 | Each tier: one dollar over the cap refused with "Max $X here" | REUSE+ADAPT `PLACE68_MAX` → computed from the tier |
| RS-08 | Unchanged per tier: prop min $1, Repeaters $1–$25, hops $1–$100, Fire $1–$10, Horn $4 / C&E $2 | S10 | Tier sweep: those limits identical in all tiers | REUSE |
| RS-09 | **Place 6/8 minimum follows T-12** ($12 at $10, **$6 at a $5 table**, P14-3); today the build hard-codes $12 | S10, P14-3 | T-12 = $5 → Place 6 $6 accepted; T-12 = $10 → $6 refused, $12 accepted | REUSE+ADAPT `tableMinFor` (`js/table-rules.mjs:214`, fixed `1200`) and `placeSpot` (`js/table-ui.mjs:601-604`, fixed `1200` / `1000`) |
| RS-10 | Tier change applies at the next come-out; felt bets stay; "Also reset bankroll to $X" offer | S10, A2.3 | Change mid-hand → the old limits until the come-out; an existing $500 Place 8 stays after dropping to a lower max | REUSE PR-01 "next come-out" path |
| RS-11 | Strategy cards and the coach scale amounts by tier min ÷ $10, rounded to legal steps | S10, TL-05 | T5 at High limit → $30 each on 6/8; ST-08 fuzz passes in every tier | REUSE+ADAPT TL-05 helper |
| RS-12 | Gating (if Bill agrees): tiers + bankroll presets Free; Field 3:1, odds ≠ 3-4-5x, custom min / max / bankroll Premium | S10 | Standard user can pick a tier and preset bankroll; T-2 / T-3 rows show the lock | REUSE entitlement flag |

## 23. Roll speed: fast roll and skip (S11; rev 16)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| FR-01 | Settings › Roll speed Normal (default) · Fast · Instant (T-32); free | S11 | Setting persists; default Normal on a fresh install | NEW |
| FR-02 | Throw flight + tumble: Normal as today, Fast ≤ 0.5 s, Instant ≤ 150 ms fade | S11 | Timing fixtures per speed (± 1 frame) | REUSE+ADAPT `animateDice` / throw path |
| FR-03 | **Same draw at every speed;** final pose = engine faces | S11, Rule 0 | RT-11 render-vs-engine on 36 pairs × 3 speeds passes; `rollDice` call count per throw = 1 at every speed | REUSE `tests/dice-faces.test.mjs` |
| FR-04 | Tap the dice to skip → settled pose at once, faces unchanged | S11 | Tap at 100 ms → pose = `lastDice` in that frame | NEW |
| FR-05 | Celebration / Big Win / PSO / stinger caps per the S11 table; never longer than Normal; still skippable, non-blocking, cleared on throw start | S11, S4.3, S4.4 | Timer fixtures for every row × speed; RT-28 never-blocks check at all 3 speeds | REUSE `celeTimer`, `clearWin` |
| FR-06 | Same-roll merges unchanged (point made + Big Win; PSO + Big Win / Fire) and use the speed's cap | S11, rev 15b / 15c | `.winlayer` count = 1 in each merge at each speed | REUSE PM-13 path |
| FR-07 | Words, amounts, sounds (trimmed), haptics and the one announcement stay at every speed | S11 | Live-region fires once per roll at each speed; sound nodes end by the cap | REUSE `audio.mjs`, `haptic` |
| FR-08 | Reduce motion wins when it gives less motion | S11 | `motionOff()` + Normal → reduce-motion visuals | REUSE `motionOff` |
| FR-09 | Shooter practice caps at Fast; set / grip / meter / no-roll unchanged; T-26 timer unaffected | S11, A2.5 | Instant selected → practice screen uses Fast; no-roll fixtures identical across speeds | NEW |
| FR-10 | Every roll counts the same at every speed (Fair Dice, badges, leaderboard, history); `rollSpeed` logged for QA only | S11 | Same 200-roll forced script at 3 speeds → identical Fair Dice, badge and history results | NEW |

## 24. Quick bets: Across, Inside, Outside (S12; rev 16)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| QB-01 | ACROSS · INSIDE · OUTSIDE keys in the Bets sheet's Quick bets strip; live totals on the sub-labels; no Billy's Way anywhere | S12, P14-11, RE-25 | Keys render with "$64" / "$44" / "$40" at Standard; no "Billy" string in Table UI | NEW |
| QB-02 | Coverage: Across 4–10; Inside 5/6/8/9; Outside 4/5/9/10 | S12 | Each key posts exactly its numbers | NEW |
| QB-03 | Buy vs Place = lower edge at that amount under the active rules; tie → Place | S12 | Standard → Buy 4/5/9/10, Place 6/8; T-5 Always → 5/9 Place; T-6 $1/$20 at $10 → Buy 4, Place 5; T-8 Off → all Place | REUSE `edgeFor`; NEW chooser |
| QB-04 | $10-table amounts: $1 / $5 chip → $64 / $44 / $40; $25 → $160 / $110 / $100; $100 → $640 / $440 / $400; $500 → $2,996 / $1,996 / $2,000 (6/8 capped $498) | S12 | Ledger fixture per chip; payouts $19.50 / $14.50 / $14 at base | REUSE `buyProfit`, `placeProfit` |
| QB-05 | Each tap stacks one unit; tiers start the base at the tier min | S12, S10 | Two taps at $5 → $128 across; High limit tier, one tap → $160 | NEW |
| QB-06 | **One bet per number:** same type → add; other right-side type → keep it, add in its legal step; Lay → skip; never two bets on one number | S12, `numberConflict` | Place 4 $10 up, ACROSS → Place 4 $20 (not Buy 4); Lay 10 up → 10 skipped; `numberConflict` never fires a convert from a quick bet | REUSE `numberConflict` (`js/table-rules.mjs:235-254`) |
| QB-07 | Point number skipped when the player has a Pass / Come on it; T-33 "Include my point" (default Off) | S12 | Point 6 + Pass → ACROSS posts 5 spots, toast exact; T-33 On → 6 spots | NEW |
| QB-08 | All-or-nothing on bankroll; per-spot cap or skip at the max with the reason | S12, TL-04, TL-05 | $40 bankroll, ACROSS → nothing posted + message; Place 8 at $498, ACROSS at $500 chip → 8 skipped "at table max" | REUSE `validate` |
| QB-09 | Come-out working rule and Bets Off apply | S12, T-9 | Come-out ACROSS → spots OFF; Bets Off → parked | REUSE `placeWorking`, `setBetsOff` |
| QB-10 | One undo step per tap; "Take down Across / Inside / Outside" removes only its units | S12 | Fixture: manual Place 6 $12 + ACROSS, then Take down Across → Place 6 $12 remains | NEW (Billy's Way take-down pattern) |
| QB-11 | Rail: one `railPay` per tap, one Change label; RT-24 invariant holds | S12, A2.2b | 1,000 random quick-bet taps in the RT-24 fuzz: 0 violations | REUSE `railPay` |
| QB-12 | Key long-press preview sheet (spots, stakes, Buy/Place reason, edge, total, at risk on a 7); dock keys still none | S12, S4.5 | Sheet content fixture; SHOOT held 2 s does nothing (LG-08) | NEW |
| QB-13 | **6/8 tap increments:** once a Place 6/8 is up, a $1 / $5 chip adds $6 (first tap still posts $12) | S12 | Taps $5, $5, $5 on Place 6 → $12, $18, $24; $25 chip → +$24 | REUSE+ADAPT `placeSpot` (`js/table-ui.mjs:601-604`) |
| QB-14 | Tutor lines exact (Beginner / Experienced, blended edges 1.71 / 1.74 / 1.83%) | S12 | String fixtures | REUSE `maybeTutor` |

## 25. Billy's Payout Drills (S13; rev 16)
| ID | Item | Spec | Acceptance criterion | Source |
|---|---|---|---|---|
| PD-01 | Learn › Payout Drills; never touches bankroll, bets or the dice | S13 | 100 rounds → bankroll, Fair Dice log, history and `rollDice` calls unchanged | NEW |
| PD-02 | **Answers from the engine payout functions,** to the cent, under the drill's rules | S13, Rule 0.6 | 10,000 generated questions: each answer === the engine function's result | REUSE `placeProfit`, `buyProfit`, `passOddsProfit`, `layOddsProfit`, `fieldWin`, `hardwayProfit`, `hopPayTo1`, lay / Fire functions |
| PD-03 | D1–D8 drill types, Table set (incl. D4 Lay, D8 Pay in chips, Fire props) | S13 | Each type generates valid scenes; the 8 examples in S13 reproduce exactly | NEW |
| PD-04 | D6 "Make it pay right" uses the legal steps ($6 on 6/8, even odds on 5/9, $5 odds on 6/8, lay $2 / $3 / $6) | S13, App §0 | Every D6 answer passes `stepOf` | REUSE `stepOf` |
| PD-05 | D8 Pay in chips: fewest chips, no $10 chip | S13, A2.2b | Answer = greedy breakdown of the payout; a $10 chip never appears | REUSE `railCredit` breakdown |
| PD-06 | Levels Rookie / Dealer / Boxman per the S13 table; timers optional and Off by default | S13 | Level fixtures; a fresh install has no timer | NEW |
| PD-07 | Scoring: 10 / 20 / 30 per correct, round of 10, accuracy and average time; no lives, multipliers, currency or streak bonus | S13 | Score fixtures; string scan finds no "streak", "bonus", "coins" | NEW |
| PD-08 | Wrong answer → correct amount + Why? math box | S13, S2 | Each type's math text fixture | REUSE Tutor math box |
| PD-09 | Personal bests per drill × level in `bb-table-drills-v1`; "Reset drill scores" | S13 | Reload keeps bests; reset clears only this store | NEW |
| PD-10 | Badge "Dealer's Apprentice" (Silver; PROPOSED): 10 / 10 on D7 at Dealer+ | S13 | Unlock fixture; 9 / 10 → locked; no bet or roll can unlock it | REUSE `noteAction` pattern |
| PD-11 | Copy: Dealer Billy only; teaches pays, never which bet; banned lists; footer exact | S13, S2 | String scan; no Billie art on drill screens | NEW strings test |
| PD-12 | A11y and fit: 44 pt keypad, text version of each scene, 320–430 + landscape + 130% | S13 | axe 0 serious; harness 0 clipped | REUSE `shot-run14.mjs` |

