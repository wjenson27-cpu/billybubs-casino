# Billy Bubs: Two-App Spec

**Apps:** **App 1: Billy Bubs Bubble Craps** (Regular / Crapless) and **App 2: Billy Bubs Table Craps** (formerly "Live Table": shooter, dice setting, multiplayer)
**Status:** Spec only. No code or repo changes.
**Owner:** Bill Jenson
**Audience:** Design Desk (mockups in `/workspace/bb-mockups/app1-bubble` and `/workspace/bb-mockups/app2-table`), whoever builds it later
**Current web build:** https://wjenson27-cpu.github.io/billy-bubs-practice/ (one repo today: `index.html` = bubble machine, `table.html` = full table)
**Spec date:** Oct 13, 2026 · **rev 16** (rev 15d + the round-5 batch: session history, Your Dice, table rules and limit tiers, roll speed, quick bets, payout drills; see the Rev 16 entry at the end). *(This line read rev 15a through rev 15d; the 15b–15d entries are at the end.)*

**Rev history:**
- **rev 5:** split into two separate apps; Fair Dice tab; Repeater bets; Heater meter; shared-code plan; mockup review.
- **rev 5 (Bones check, Oct 10):** Design Desk's Section G draft (Repeaters + Heater) checked and merged into S1.7 and S6. Repeater pays corrected to FOR 1; Repeaters now work every roll (any 7 loses), can be bet any time, and are on in Crapless (Bill); Heater uses Design Desk's score; Hard Way All Day source note (Paris 165 TO 1).
- **rev 15a (Oct 12, 10:27 AM): two additions from Bill (via Chief).** Bubble and Table rules are otherwise unchanged from rev 15.
  - **A) Table Craps chip rail** (new **A2.2b**): stacks by $500 / $100 / $25 / $5 / $1 (no $10), a greedy breakdown with a change reserve (5 × $1, 4 × $5), a 10-chip display cap with count badges, automatic change-making with a short "Change" animation, color-up (Offer by default; always when the player leaves the table), a 0–99¢ change cup for odd amounts, and the **invariant: rail total = bankroll − bets on the table after every action**. Fit at 320 px and accessibility included; reuse from Bubble's chip plumbing is marked.
  - **B) Point-made celebration, both apps** (new **S4.3**, must-have): fires only on a Pass-line point win (full with a Pass bet, quiet without), never on a come-out natural or Come / Place wins. Tiers Base / Big / Huge (3rd+ point or Blazing), plus a Fire Bet stinger at 4 / 5 / 6 unique points (Table only). Dealer Billy calls it, Bubbles Billie reacts. ≤ 2.5 s, tap to skip, never blocks the next roll, clears on roll start (R10-2). Reduce-motion and sound settings; no "bet more" copy.
  - **New:** the **Bubble leftover / run-16 list** (End matter) holds the Bubble build items for B. Table build items are in `table-craps-build-checklist.md` §3a, §16, §17 and §18, with required tests RT-24 to RT-32.
  - **Wording fix:** Bill's "cash-out" color-up is written as **"Leave table"**, because "cash out" is banned in both apps.
  - **C) Set dice / T-24 DECIDED (Bill, Oct 12, 10:31 AM):** Premium T-24 "shooter skill (simulation)" is **removed completely** from the spec, the Premium list and the checklist. Set dice are a **cosmetic practice ritual only**. Open question 4 is closed.
  - **D) RULE 0: REAL DICE, REAL ODDS** (new top-level rule, both apps; Bill: "Need real dice. Real odds."): independent uniform 1–6 per die from `crypto.getRandomValues` with rejection sampling; 36 equally likely outcomes; nothing can influence a roll; no `Math.random()` fallback and no test hook in production; real-math payouts and edges; required χ² (≥ 1M rolls), independence, set-dice and render-vs-engine tests; a player-facing "Real dice, real odds" line on Fair Dice. **Bubble's RNG was checked at `51c229b`:** the draw passes; the fallback and the hostname-only hook gate don't (run-16 list BL16-12, BL16-13).
  - **E) Craps etiquette guide** (both apps, taught by Dealer Billy): new file `etiquette-guide.md`, summary in S2. 15 tips with a Why each; live-only tips tagged in Bubble Craps; hooks: tip cards, a rotating Billy's Table Tip, contextual nudges, a Bronze "Table Manners" badge.
  - **For Bill:** Open questions 5–6 (color-up default; Big Win on the same roll).
- **rev 15 (Oct 12, 10:16 AM): Bill APPROVED rev 14 for Table Craps (via Chief).** Everything rev 14 proposed is now **DECIDED**:
  - all **24 strategies** (T1–T24) and the Free / Premium split;
  - the recommended option on all **14 rev 14 decisions** (P14-1 to P14-14), each written as a rule in Decisions and in `table-strategies-appendix.md` §5. That includes **odds and lay odds being exempt from the $500 table max**.
  - **Conflict fixes applied (A2.4):** T5 Place 6/8 **$12**, T6 **$44 Inside**, T7 **$44 Iron Cross**. **Every Table Craps card now uses a 40% stop-loss and a +30% win goal**, with bankrolls set by the 8× rule (T11 / T12 unchanged).
  - **New Standard rules in A2.2 / A2.3:**
    - Lay bets and Don't Come lay odds work on the come-out (new **T-30**, default On);
    - the $500 max applies per bet, with odds exempt;
    - a $1 prop minimum for hardways and Any Craps;
    - a voice rule (Dealer Billy instructs; Bubbles Billie only cheers).
  - **S2 fix logged:** the Repeater win chance range in "Edge warnings" is **1 in 49 to 1 in 113**, not 1 in 31 to 1 in 81. Exact: Repeater 2/12 (1/7)² = 1 in 49; Repeater 6/8 (5/11)⁶ ≈ 1 in 113.
  - **Bubble Craps rules are otherwise unchanged** since rev 13d.
  - **Set dice question (Open question 4):** closed in rev 15a. Set dice are a cosmetic practice ritual only.
  - The builder checklist is in `table-craps-build-checklist.md`, with REUSE / NEW marks against `bb-bc-yrkv` @ `51c229b`.
- **rev 14 (Oct 11, 9:13 PM): Table Craps (App 2) strategy library and a Premium Strategy Comparison.** Proposed in rev 14; **all approved in rev 15.**
  - **The bulk is in a new file:** `table-strategies-appendix.md` (same folder). This spec only gets this summary, the A2.4 cross-reference and split, the A2.3 Premium line, Open questions P14-1 to P14-14 and the code-changes item.
  - **Ranked shortlist of 24** (T1–T12 keep their IDs; **12 new: T13–T24**), each with sourced rules at $10 units, edges (my calculations labeled), max on a 7 at 3-4-5x / 5x / 10x, bankroll with a **40% stop-loss / +30% win goal**, $500-max notes, a tutorial with Beginner / Experienced prompts, common mistakes and an edge/risk card.
  - **Split (decided rev 15):** Free = T1–T13, T17 and the warning cards T20 / T21. Premium = T14, T15, T16, T18, T19, T22, T23, T24, plus **Strategy Comparison** (replays one roll sequence or a seeded simulation under several strategies, side by side, using the live engine).
  - **Found:** today's T5 ($6 units), T6 ($22 Inside) and T7 ($22 Iron Cross) can't be bet at the $10 Standard minimum. $10-table amounts (decided rev 15): $12 / $44 / $44.
  - **Voice rule for Table Craps (decided rev 15):** Dealer Billy speaks instructions, numbers and warnings. Bubbles Billie only cheers.
  - No Billy's Way, no PRESS / POWER PRESS buttons (T22 is a coach step list). Repeaters and the Fire Bet stay as they are (A2.2 / A2.2a); no strategy uses them.
- **rev 13d (Oct 11, 1:17 PM):** small clarifications from run 13 QA.
  - The **Field is the same in Crapless** as in Regular (A1.3.3).
  - **Field felt label** wording: "2 AND 12 PAY DOUBLE" (not "PAYS"), with circled 2 and 12. It follows the Premium 3:1 options.
  - A **screen-reader label** for the Field (S1.4).
  - **Tutor edge warnings defined** (S2): "long shot" means a prop that wins less than about 1 in 6. "High house edge" means 9% or more. The Field gets neither, and has its own line instead.
- **rev 13c (Oct 11, 9:01 AM):** **T11 Continuous Come (Table Craps) stop-loss is 40%** (was 30%), win goal +30%, matching B13, so both apps teach the same discipline numbers (Chief). At $10 units with max odds, that's $1,000 of a $2,500 bankroll.
- **rev 13b (Oct 11, 8:44 AM):** **B13 Continuous Come stop-loss is 40%** (was 30%), with a win goal of +30% (Chief).
  - This matches the build and the "Play this" offer (Session limits at loss 40% / win goal 30%), and it keeps the 250 / 400-unit bankroll guide (A1.6 B13).
  - Changed in A1.6 B13 and the rev 11 history note. T11 (App 2) followed in rev 13c.
- **rev 13a (Oct 11, 7:32 AM):** **Pip dice readouts** (Bill: "instead of showing 6+4 = 10, show the dice pips").
  - Every roll readout in both apps shows two small die faces with real pips, then a total badge (plus a Hard tag on doubles). New section S4.2.
  - Text formats like "6+4 = 10", "5·3" and "3–4 = 7" are removed.
  - The pips must come from the same engine values as the 3D dice (the run 8 fix). The CSV keeps numeric `die1` / `die2`.
- **rev 13 (Oct 11, 6:16 AM):**
  - **Billy's Way** restated by Bill and re-checked against the build `bb-bc-yrkv` @ `9367283`. It's the same definition as rev 3+, and the code matches (A1.4).
    - Added the Regular vs Crapless behavior, the commission at each chip size, totals per press, the PRESS / POWER PRESS ladders on its Buy bets, and edges.
  - **ATS is now in Crapless too** (Bill). This reverses the rev 3/5 no-ATS-in-Crapless rule.
    - The bets work on the dice total, and any 7 loses them, including the Crapless come-out 7 that wins Pass.
    - Same pays and edges in both modes. Per-hand odds are a little lower in Crapless because its hands are shorter (S1.6).
    - The build hides ATS in Crapless, so showing it there is a code change. Badges v4: the ATS badges now count in both modes.
- **rev 12a (Oct 10, 10:21 PM):** Bill's decisions on the rev 12 questions; no POWER PRESS questions remain open.
  - **Bubble Craps Standard table max is now $1,000** (was $500), so his whole ladder, including 4/10 $900, is Standard.
  - **5/9 POWER PRESS converts to Buy at the $36 step** and stays Buy from then on.
  - **Crapless 2/3/11/12 POWER PRESS ladders are Buy:** 2/12 5 → 35 → 250, 3/11 5 → 20 → 80 → 320.
  - **Table Craps is unchanged** (T-13 stays $500).
- **rev 12 (Oct 10, 10:14 PM):** **POWER PRESS now follows Bill's "POWER PRESSES 2024" ladder** (A1.4a). This replaces the round-down rule.
  - One tap moves the bet to the next ladder step: the whole win goes back up, plus a small **Give** from chips or a small **Get** back to chips.
  - The chart was verified; one typo was fixed (5/9 first row).
  - Off-ladder rule; table-max cap; Crapless 2/12 and 3/11 ladders; a Premium ladder setting B-31.
- **rev 11 (Oct 10, 9:13 PM):** two new preloaded strategies.
  - **Continuous Come:** App 1 **B13** (Both modes), App 2 **T11**. **Uncapped by default** (Bill's correction, 9:20 PM): a Come bet every point roll, off-and-on on covered numbers, with an optional cap that's off.
  - **Hit and Split:** App 1 **B14** (Both; optional Crapless Buy extension), App 2 **T12**.
  - Libraries are now 14 (B1–B14) and 12 (T1–T12), with Tutor rows in both apps.
- **rev 10 (Oct 10, 9:02 PM):** Bill's answers on badges, applied.
  - **Auto-roll is optional** (Off by default, free; it pauses on 3 empty-felt rolls), A1.5a.
  - New free **Session limits** (loss limit / win goal), A1.5b.
  - Mode switch blocked until after a seven-out (confirmed).
  - Leaderboard **initials** (optional, device-only).
  - The Blazing **flame glyph is allowed**; only the word "Fire" is banned.
  - `badges-bubble.md` v3 (9:07 PM): **30 badges**, 7 Bronze · 9 Silver · 9 Gold · 5 Legendary. It adds Legendary **Spin the Block** (`spin_the_block`): the same Low Rolls or High Rolls bet paid twice with no 7 between, via the S1.6 re-arm, about 1 in 523 hands. It cuts `lessons_all` and `daily_practice_7`.
- **rev 9 (Oct 10):** one **hand / Longest Roll definition** for both the Blazing meter and the new Bubble Craps Longest Roll leaderboard (S4.1, S6). Bubble Craps badges are specced in the companion file `badges-bubble.md`. Build conflicts were checked against `bb-bc-yrkv` @ `ee86885`.
- **rev 8 (Oct 10):** **three-screen Play layout** in both apps (left: Repeaters + Hops [+ Fire Bet in Table Craps]; middle: board, default; right: hood / shooter), S4.1. All **21 hop bets** defined (S1.4a, B-29/T-29). PRESS / POWER PRESS move to the dock beside ROLL.
- **rev 7 (Oct 10):** the meter is the **Blazing meter**, with exactly 4 tiers (Cold · Warm · Hot · Blazing) and re-mapped thresholds. Fire Bet is bet only before the shooter's first come-out. App 2 $10-chip removal added to the build list with file/line refs. Section H resolved.
- **rev 6 (Oct 10):** Bill's answers to the 8 open questions applied (lay vig on win, Don't Pass takedown, Hard Way All Day 165 to 1 option, LAY tab Regular-only, "Blazing", chips $1/$5/$25/$100/$500, Premium per app). PRESS redefined (original-bet unit, stacking, UNDO/CLEAR) and new **POWER PRESS**. New **Fire Bet** in Table Craps only (A2.2a).
- **rev 5 (PRESS + name, Oct 10):** App 2 renamed **Billy Bubs Table Craps**; new App 1 **PRESS** key (A1.4a), with B-27/B-28, B5/B12 hooks, Tutor rows, and mockup conflicts 14–16.
- **rev 4:** ATS stays up after a hit.
- **rev 3:** Billy's Way buys 5/9 and is Bubble-only; Hard Way All Day stays up after a win; Premium Hard Way All Day payouts.
- **rev 2:** Standard and Premium rules, multiplayer, defined bets.

> **Education only. Play money only. No real gambling, no deposits, no cash-out, no prizes.** In both apps, label every bankroll "Practice chips". Put this disclaimer in the onboarding, the first Tutor screen, the multiplayer lobby (App 2) and the store listings.

---

## RULE 0: REAL DICE, REAL ODDS (both apps; top-level rule; Bill, Oct 12, rev 15a: "Need real dice. Real odds.")

This rule sits above every other section. If anything else in this spec, the appendix or a checklist seems to conflict with it, this rule wins.

1. **Each die is an independent, uniform 1–6** from a cryptographically sound RNG: `crypto.getRandomValues` on a `Uint32`, with **rejection sampling** (redraw any value ≥ 2³² − (2³² mod 6)), so there's **no modulo bias**. Two separate draws per roll, die 1 then die 2.
2. **All 36 outcomes are equally likely,** so every total has true dice odds: 2 and 12 = 1/36, 3 and 11 = 2/36, 4 and 10 = 3/36, 5 and 9 = 4/36, 6 and 8 = 5/36, **7 = 6/36**.
3. **Nothing can influence a roll.** No streak or heater adjustment, no "pity" logic, no difficulty or engagement tuning, no near-miss shaping. Bets, bankroll, strategies, auto-bets, the dice set, the grip, the throw meter, a no-roll, the Blazing meter, the Fire Bet, badges, leaderboards, celebrations, limits, Premium and Custom Rules all **read** results; none of them is ever passed into, or able to change, the roll. *(Rev 15a: the Premium "shooter skill (simulation)" is removed, so this has no exceptions.)*
4. **No secure RNG, no roll.** Production builds have **no `Math.random()` fallback**. If `crypto.getRandomValues` is missing, the app shows "Can't roll: this device's secure random generator isn't available" and doesn't roll. (Animation-only randomness, like tumbling frames, may use anything; it never decides a face.)
5. **No-rolls (Table Craps)** are decided before and apart from the result; a no-roll's dice are discarded and a fresh roll is drawn, never re-drawn toward or away from any total.
6. **Payouts and stated edges use the real math:** true odds on odds bets, the exact pay tables and the edges in S1 / S2 / A2.2a, computed from the 36 equally likely outcomes. No display rounds an edge toward the player.
7. **The test RNG hook is for local tests only.** `window.__bbRng` (and any forced-roll hook) exists only in a **test build** on localhost, and is **stripped from production bundles** at build time (a hostname check alone isn't enough: a packaged iOS / Android web view can report `localhost`).
8. **Seeded generators** (the Strategy Comparison's seeded simulation, tests) are labeled as simulations, never mixed into live play, Fair Dice, badges or leaderboards, and use the same rejection-sampled 1–6 mapping.
9. **Your Dice mode (rev 16, S9) isn't an app roll.** When the player enters rolls from their own dice, the app draws nothing. Entered rolls are labeled on screen and in every record (`dice_source: entered`), use their own bankroll and table state, and are kept out of the RNG path, Fair Dice, RNG statistics and tests, the Longest Roll board, badges, the Strategy Comparison and the RNG session history (S9 exclusions X1–X8). Clauses 1–8 apply unchanged to every roll the app makes.

**Required tests** (both apps; Table: checklist §17 RD-xx / RT-29–RT-32; Bubble: run-16 list BL16-10 to BL16-17):
- **χ² on ≥ 1,000,000 seeded rolls,** faces (each die, df 5) and totals (df 10). Pass at p ≥ 0.001. Also one unseeded 1M-roll run through `crypto.getRandomValues` in CI, with the same threshold (expected false-fail rate 0.1%; a fail is rerun once and both results are logged).
- **Independence:** lag-1 serial correlation of die 1, die 2 and the total, each |r| < 4 / √n; the 36-cell die1 × die2 pairing χ² (df 35) at p ≥ 0.001; P(7 | previous roll was 7) within ±0.5 points of 6/36.
- **Set dice / throw don't matter (Table):** 1M rolls under each of 4 dice sets (3-V, Hardway, 2-V, All-Sevens) and random throw-meter inputs give the same distribution (χ² per set and a two-sample test vs no set, p ≥ 0.001), and a static check shows set / grip / meter values never reach `rollDice`.
- **The existing 36-outcome render-vs-engine check** (top face = engine face = pip readout = history = Fair Dice) stays required in both apps.
- **No fallback, no hook in production:** the production bundle has no `Math.random` path inside `rollDie` and no `__bbRng`.

**Player-facing line (Fair Dice tab, both apps; also in onboarding and the tutorial):**
> **Real dice, real odds.** Every roll is two fair, independent dice from your device's secure random generator, so a 7 comes up 6 times in 36, every roll. Nothing (your bets, your streak, your dice set, badges or Premium) can change a roll.

---

## 0. Two apps, one family

**Decision (Bill, Oct 10):** two separate apps, not one app with a game picker. Each app has its own Standard rules, Premium Custom Rules, strategy library and Tutor. They share the rules math, the Edge Preview pattern, the look and feel, Fair Dice, and the code listed in S7.

| | **App 1: Billy Bubs Bubble Craps** | **App 2: Billy Bubs Table Craps** |
|---|---|---|
| Who rolls | The machine (dice in a dome). You tap **ROLL**, or turn on the optional **auto-roll** (A1.5a, Off by default). No shooter. | The player is the shooter (pick dice, set, throw). |
| Rules | **Regular / Crapless** toggle (separate rule sets) | **Regular only** |
| Players | Single player | Single player (Standard); multiplayer pass-and-play (MVP), online later |
| Signature features | Billy's Way, PRESS / POWER PRESS, Crapless mode, bubble dome | Dice setting and shooter practice, multiplayer, **Fire Bet** |
| Bottom tabs (mockups) | **Play · Fair Dice · Learn · Premium · Settings** | **Play · Fair Dice · Learn · Premium · Settings** |
| Play sub-controls (mockups) | Felt, Bet Panel, Regular/Crapless switch, Repeat / Bets Off / **Press / Power Press** / Billy's Way / Take Down, auto-roll timer | Shooter view, then **Bets · Strategies · Tutor · Stats** keys |
| Learn tab | Strategy Library (All / Regular / Crapless / Lessons), Tutor tour | Strategy Library (All / Baseline / Don't / Shooter), Tutor tour, shooter practice |
| Tutor name in UI | "Billy Tips" toggle (Dealer Billy mascot) | Same |
| This spec | **App 1 section** | **App 2 section** |

**Renames:**
- "Live Table" (and the interim "Craps Table") becomes **"Billy Bubs Table Craps"** (short form: "Table Craps"). Name confirmed by Bill, Oct 10.
- "Bubble Craps game" becomes **"Billy Bubs Bubble Craps"**.
- "Game" becomes "App" throughout.
- Strategy card IDs are **B1–B14** (App 1) and **T1–T12** (App 2; formerly L1–L10). Rev 11 added B13/T11 Continuous Come and B14/T12 Hit and Split.
- Settings IDs are **B-xx** (App 1) and **T-xx** (App 2), replacing the old combined #1–#24 (mapping in S3).

**Document map:**
- **Shared (S):** S1 Rules math and shared bets · S2 Tutor framework · S3 Edge Preview pattern and settings ID map · S4 Look and feel (S4.1 three-screen layout; S4.5 Craps Lingo, rev 15d) · S5 Fair Dice tab · S6 Blazing meter · S7 Shared code · **rev 16:** S8 Session history and bankroll chart · S9 Your Dice mode · S10 Table rule settings and limit tiers · S11 Roll speed · S12 Quick bets · S13 Payout drills
- **App 1 (A1):** A1.1 Screens · A1.2 Standard rules · A1.3 Crapless rules · A1.4 Billy's Way · A1.4a PRESS and POWER PRESS · A1.5 Bubble machine specifics · A1.6 Premium Custom Rules · A1.7 Strategy library · A1.8 Tutor
- **App 2 (A2):** A2.1 Screens · A2.2 Standard rules · A2.2a Fire Bet · A2.3 Premium Custom Rules · A2.4 Strategy library · A2.5 Shooter practice · A2.6 Tutor · A2.7 Multiplayer
- **End matter:** Mockup review and rule conflicts · Decisions · Open questions · Code changes implied

---

# SHARED (both apps)

## S1. Rules math and shared bets

### S1.1 Conventions: payout wording, edge measures, dice

#### Payout wording ("to" vs "for")
Show payouts as **"X to 1"** (winnings on top of the returned bet). Some spots use "for" wording: Big Red is "5 for 1" = 4 to 1, and Hard Way All Day is "165 FOR 1" = 164 to 1. Add a "?" tooltip explaining the difference.

#### House edge measures (Tutor)
Per Wizard of Odds ([basics](https://wizardofodds.com/games/craps/basics/), [appendix 2](https://wizardofodds.com/games/craps/appendix/2/)):
- **Per bet resolved:** the usual quote.
- **Per bet made:** counts pushes. It differs only for Don't Pass and Don't Come.
- **Per roll:** expected loss per roll the bet is up. Use it to compare long-lived bets.

The UI shows per bet by default, with a per-roll toggle.

#### Dice probabilities (Tutor tooltips)
| Total | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Ways (of 36) | 1 | 2 | 3 | 4 | 5 | 6 | 5 | 4 | 3 | 2 | 1 |
| Before a 7 | 1:6 | 2:6 | 3:6 | 4:6 | 5:6 | n/a | 5:6 | 4:6 | 3:6 | 2:6 | 1:6 |

### S1.2 Strategy cards and odds tables (both apps)

#### How to read each card
- **Name** and **Mode tag** (`Regular`, `Crapless` or `Both` in App 1; every App 2 card is Regular).
- **How to play.**
- **House edge** under **Standard rules** unless the card says otherwise. Per bet resolved, with per roll where useful.
- **Risk / volatility:** Low, Medium, High or Very High.
- **Bankroll** in **units** (1 unit = table minimum), with a stop-loss and a win goal.

Bankroll figures are practice guidelines for discipline, not math guarantees.

**Odds change the effective edge.** The Odds bet has 0% edge, so more odds lowers the combined edge (expected loss ÷ total money bet). The expected loss in chips stays the same because it's tied to the flat bet. Swings get bigger. Tutor always states both halves of this.

**Regular: Pass Line combined edge by odds** ([Wizard](https://wizardofodds.com/games/craps/basics/), re-calculated). **Standard = 3-4-5x.**
| Odds | Flat | 1x | 2x | **3-4-5x** | 5x | 10x | 100x |
|---|---|---|---|---|---|---|---|
| Edge | 1.41% | 0.85% | 0.61% | **0.37%** | 0.33% | 0.18% | 0.02% |

**Crapless: Pass Line combined edge by odds** ([Wizard crapless](https://wizardofodds.com/games/crapless-craps/) for 1x/2x/3x/5x; others from [US Casino Advantage](https://uscasinoadvantage.com/table-games/how-to-play-crapless-craps/), re-calculated). **Standard = 3-3-3-4-5x.**
| Odds (2&12 / 3&11 / 4&10 / 5&9 / 6&8) | Edge |
|---|---|
| Flat | 5.38% |
| 1x all | 2.94% |
| 1-2-3-4-5x | 1.33% |
| 2-2-3-4-5x | 1.31% |
| **3-3-3-4-5x (Standard "3-4-5x")** | **1.26%** |
| 2x all | 2.02% |
| 3x all | 1.54% |
| 5x all | 1.04% |
| 10x all | 0.58% |
| 20x all | 0.30% |
| 100x all | 0.06% |

### S1.3 Place and Buy (Crapless numbers are App 1 only; Buy is offered in both apps)
| Number | Place pays | Place edge (bet / roll) | Buy pays | **Buy edge, Standard (vig on win)** (bet / roll) | Buy edge, vig always (Premium) |
|---|---|---|---|---|---|
| 2, 12 | 11 to 2 | 7.14% / 1.39% | 6 to 1 less 5% | **0.71% / 0.14%** | 4.76% |
| 3, 11 | 11 to 4 | 6.25% / 1.39% | 3 to 1 less 5% | **1.25% / 0.28%** | 4.76% |
| 4, 10 | 9 to 5 | 6.67% / 1.67% | 2 to 1 less 5% | **1.67% / 0.42%** | 4.76% |
| 5, 9 | 7 to 5 | 4.00% / 1.11% | 3 to 2 less 5% | **2.00% / 0.56%** | 4.76% |
| 6, 8 | 7 to 6 | **1.52% / 0.46%** | 6 to 5 less 5% | 2.27% / 0.69% | 4.76% |

**Math box:**
- **Place 2:** (1/7)(5.5) − (6/7) = −7.14%.
- **Place 3:** (1/4)(2.75) − (3/4) = −6.25%.
- **Buy 2, vig on win:** a $20 win pays $120 − $1 = $119. EV = (119 − 120)/7 per $20 = −0.71%.
- **Buy 3:** (1/4)(59) − (3/4)(20) = −0.25 per $20 = −1.25%.
- **Vig always:** 1/21 = 4.76% on every number.

**Standard vig math:** exactly 5% of the buy stake, taken from the win. Example: $20 Buy 4 wins $40 − $1 = **$39**, and the $20 stays up. The code works the same way: Bubble floors the vig to whole cents (`js/engine.js:246-249`). Real casinos often round to $1 per $20 (sometimes $1 per $25). That rounding is a Premium option.

**Sources disagree on commission:** Wizard lists both versions (a reader reported win-only in Mississippi), and Vegas Advantage says some casinos charge up front on 2/3/11/12. **Decision:** Standard = on win. Premium can switch it to "always."

Place and Buy bets are OFF on the come-out by default and can be taken down any time.

### S1.4 Side bets (both apps; same in Regular and Crapless unless noted; Standard payouts)
| Bet | Type | Pays | Edge | Notes |
|---|---|---|---|---|
| Field (2, 3, 4, 9, 10, 11, 12) | One roll | 1:1; **2 = 2:1, 12 = 2:1** | **5.56%** | 3:1 on 12 is a Premium option (2.78%) |
| Any 7 / Big Red | One roll | 4 to 1 | 16.67% | |
| Any Craps (2, 3, 12) | One roll | 7 to 1 | 11.11% | Still pays on a come-out 2/3/12 |
| Horn (4-way) | One roll | 2/12 30:1, 3/11 15:1 | 12.5% | Posted in $4 units (code agrees) |
| Horn single 2 or 12 / 3 or 11 | One roll | 30:1 / 15:1 | 13.89% / 11.11% | |
| C&E | One roll | C 7:1, E 15:1 | 11.11% | An 11 pays C&E even though it's a point for the line |
| Hard 4/10 / Hard 6/8 | Multi-roll | 7:1 / 9:1 | 11.11% / 9.09% (2.78% per roll) | |
| Hop easy / hard (all 21 hops) | One roll | 15 to 1 / 30 to 1 | 11.11% / 13.89% | Left screen. S1.4a |
| Low Rolls / High Rolls / Roll 'Em All (ATS) | Multi-roll | 31 / 31 / 156 FOR 1 | 18.30% / 18.30% / 17.98% | **Regular and Crapless** (rev 13). Any 7 loses, a come-out 7 included. Stays up after a hit. S1.6 |
| **Hard Way All Day** | Multi-roll | **165 FOR 1** (Standard) | **21.43%** | Stays up after a win. S1.5 |
| **Fire Bet** (Table Craps only) | Per shooter | 4 / 5 / 6 different points: 24 / 249 / 999 **to 1** | **20.76%** | Never in Bubble Craps or Crapless. A2.2a |
| **Repeaters** 2–12 | Multi-roll | 40 / 50 / 65 / 80 / 90 **FOR 1** (2&12 / 3&11 / 4&10 / 5&9 / 6&8) | **18.37% / 21.88% / 19.75% / 18.08% / 20.62%** | Both apps, Regular and Crapless (Bill). Works every roll; any 7 loses. Stays up after a hit. S1.7 |

**Field felt label and screen-reader label (both apps; rev 13d):**
- **Felt:** "FIELD" over the numbers **2 3 4 9 10 11 12**, with the **2 and 12 circled**, and the line **"2 AND 12 PAY DOUBLE"**. The verb is plural "PAY", not "PAYS".
- **Premium B-1 / B-2 (App 2: T-1 / T-2) change the label and the circles to match the active pays:**

| Field pays (2 / 12) | Circles | Felt line | Screen-reader label |
|---|---|---|---|
| 2:1 / 2:1 (Standard) | 2 and 12, same style | **2 AND 12 PAY DOUBLE** | "Field: 2, 3, 4, 9, 10, 11, 12; 2 and 12 pay 2 to 1" |
| 2:1 / 3:1 | 2 single circle, 12 double circle | **2 PAYS DOUBLE · 12 PAYS TRIPLE** | "Field: 2, 3, 4, 9, 10, 11, 12; 2 pays 2 to 1, 12 pays 3 to 1" |
| 3:1 / 2:1 | 2 double circle, 12 single circle | **2 PAYS TRIPLE · 12 PAYS DOUBLE** | "Field: 2, 3, 4, 9, 10, 11, 12; 2 pays 3 to 1, 12 pays 2 to 1" |
| 3:1 / 3:1 | 2 and 12 double circle | **2 AND 12 PAY TRIPLE** | "Field: 2, 3, 4, 9, 10, 11, 12; 2 and 12 pay 3 to 1" |

  - Each label is singular per number ("PAYS") and plural for the pair ("PAY").
  - When a stake is on the Field, the screen-reader label adds it: "…; 2 and 12 pay 2 to 1. Your bet: $5."

### S1.4a Hop bets (both apps): DEFINED (rev 8)
A **hop** is a one-roll bet on one exact dice pair. Checked against Wizard of Odds ([craps basics](https://wizardofodds.com/games/craps/basics/), [appendix 2](https://wizardofodds.com/games/craps/appendix/2/)): Standard US pays are **hard hop 30 to 1** and **easy hop 15 to 1**.

| Hop type | The 21 hops | Ways (of 36) | Fair pay | **Standard pay** | **House edge** (per bet = per roll) |
|---|---|---|---|---|---|
| **Hard hop** (a pair) | 1-1, 2-2, 3-3, 4-4, 5-5, 6-6 (6 hops) | 1 | 35 to 1 | **30 to 1** | **13.89%** (5/36) |
| **Easy hop** (two different faces, either order) | 1-2, 1-3, 1-4, 1-5, 1-6, 2-3, 2-4, 2-5, 2-6, 3-4, 3-5, 3-6, 4-5, 4-6, 5-6 (15 hops) | 2 | 17 to 1 | **15 to 1** | **11.11%** (4/36) |

- **Premium pays (B-29 / T-29):**
  - 16 / 31 to 1 (easy / hard) = 5.56% / 11.11%;
  - 16 / 33 to 1 = 5.56% / 5.56% (the best pays Wizard lists).
  - The stingy 14 / 29 to 1 (16.67% / 16.67%) is **not offered**.
- **The Horn singles are hops.** Aces (1-1), Ace-deuce (1-2), Yo (5-6) and Midnight (6-6) are the four hops the code already has (`hop` 2/3/11/12: `js/engine.js:48, 852-866`, `js/table-engine.js:50, 348, 719-725`, felt `index.html:206-240`).
  - They stay in the locked Horn 2x2 and show mirrored on the left screen.
  - Their pays follow **B-15 / T-15** (Horn payouts), so one bet never has two pay settings. B-29 / T-29 covers the other 17 hops.
- **Rules (Standard):**
  - Hops work on **every roll**, including the come-out, and BETS OFF doesn't affect them.
  - A winning hop is paid and **stays up** ("same bet"), as at a real table and in the Bubble code (`js/engine.js:857-860`). Take it down any time before the roll.
  - Table Craps' code clears a hop after every roll (`js/table-engine.js:725`), so that needs a code change.
  - Min $1, max $100 per hop.
- **Where:** the **left (Side bets) screen**, in a 21-cell grid (S4.1).
- **Code status:** only the 4 Horn-number hops exist in either engine. The other 17 are new (code change).

**Come bet in Crapless (App 1):** placed only while the puck is ON. On its first roll, a 7 wins it and any other total, **including 2, 3, 11 and 12**, moves it to that number. After that it needs that number before a 7. Odds up to the Standard max, OFF on the come-out by default. Edge 5.38%, the same as Pass. The UI shows a "C" badge on the number box.

### S1.5 Hard Way All Day (both apps): DEFINED
**Rule (Bill, Sep 15; stay-up rule added Oct 10):** a separate single side bet. It wins only if **Hard 4 (2-2), Hard 6 (3-3), Hard 8 (4-4) and Hard 10 (5-5) ALL roll before a 7.** Easy 4/6/8/10 and all other totals don't count and don't lose it. **Only a 7 loses it.** It pays **165 FOR 1 = 164 to 1** (a $1 bet returns $165). It has progress lamps for each hardway hit. Dealer Envy is off. It's separate from the individual Hard 4/6/8/10 bets, which stay up on their own rules. **After a win it stays up:** the payout is credited, the stake stays on the felt, all four lamps reset, and it starts collecting again. It only comes down on a 7 or when the player takes it down.

**How the code implements it:**
- **One bet, one stake** (`bets.hardAllDay`) with a progress map (`progress.hardAllDay`): `js/engine.js:52, 57`.
- **Set is Hard 4/6/8/10:** `HARDWAYS = [4, 6, 8, 10]` (`js/engine.js:18`), used through `makeEmSet` (`js/engine.js:60-65`).
- **Pays 165 for 1:** `MAKE_EM_FOR.hardAllDay = 165` (`js/engine.js:23`). Profit = stake × 164, and the stake is returned.
- **Settlement:** `settleBonusBets` (`js/engine.js:747-811`, Hard Way All Day block at `778-809`), called on every roll from `settle` (`js/engine.js:898`). Table Craps reuses the same function (`js/table-engine.js:854`).
  - **7:** loses. The stake and progress are cleared.
  - **Matching dice on 4/6/8/10:** lights that lamp. Easy numbers do nothing.
  - **All four lit:** pays, then **the code takes the bet down** (`state.bets.hardAllDay = 0` in the win branch, `js/engine.js:795-797`; the test asserts the same at `tests/table-engine.test.js:494`) and progress resets.
  - **NEEDED CODE CHANGE (not made, spec only):** per Bill's Oct 10 rule, the win branch should credit only the profit (stake × (pay − 1)) to the bankroll, leave `bets.hardAllDay` at the stake so it stays on the felt instead of being returned, and reset `progress.hardAllDay = {}`. Update the test at `tests/table-engine.test.js:492-495` to expect the bet still up after the win, and update the help text (`index.html:574-583`, `README.md:72-79`) to say "stays up after a win."
- **When you can bet it:** any time, including the come-out. There's no phase restriction (`js/engine.js:506-516`). It's **working every roll, including the come-out**, and **not affected by Bets Off** (`index.html:631`).
- **Taking it down:** allowed at any time (`canRemove`, `js/engine.js:349-355`; `js/table-engine.js:292-296`). **Taking it down or placing it fresh resets the lamps** (`js/engine.js:591-593, 615-619`), so progress can't be "banked."
- **Table Craps:** a new bet is subject to the table minimum (`js/table-engine.js:311-334`).
- **Spot and copy:** `index.html:275-279` ("165 FOR 1 · Hard 4+6+8+10 before 7 · easy don't count", lamps), help text `index.html:574-583`, README `README.md:72-79`, test `tests/table-engine.test.js:485-501`.

**Math (re-calculated, matches the code's own `bonusEdge`, `js/table-engine.js:606-623`):**
- Each hardway is 1/36 per roll and a 7 is 6/36. Ignoring other rolls, the chance that all four hard numbers appear before the first 7 is, by inclusion-exclusion: 1 − 4·(6/7) + 6·(6/8) − 4·(6/9) + (6/10) = **1/210 ≈ 0.476%** (1 in 210).
- **Fair payout** would be 209 to 1 (210 for 1). The app pays 164 to 1.
- **House edge = 1 − 165/210 = 45/210 = 21.43% per bet.**
- Average life about **5.97 rolls**, so the per-roll edge is about **3.6%**.
- **Staying up doesn't change the edge per decision.** Each cycle (from fresh lamps to a win or a 7) is a new 1-in-210 bet at the same edge. Staying up only means the player keeps paying that edge until a 7 or a takedown.

**Payout options (Standard default 165 for 1; Premium picks 150 / 175 / 200 for 1 or 165 to 1; win chance 1/210 for all; fair = 210 for 1):**
| Pays (for 1) | Pays (to 1) | Return per $1 bet | House edge per bet | Per roll (≈ ÷ 5.97) | Tier |
|---|---|---|---|---|---|
| 150 for 1 | 149 to 1 | $0.714 | **28.57%** (60/210) | ≈ 4.8% | Premium |
| **165 for 1** | **164 to 1** | $0.786 | **21.43%** (45/210) | ≈ 3.6% | **Standard default** |
| 175 for 1 | 174 to 1 | $0.833 | **16.67%** (35/210) | ≈ 2.8% | Premium |
| 200 for 1 | 199 to 1 | $0.952 | **4.76%** (10/210) | ≈ 0.8% | Premium |
| 166 for 1 | **165 to 1** (Paris, per Wizard) | $0.790 | **20.95%** (44/210) | ≈ 3.5% | Premium (Bill, Oct 10) |
| *(210 for 1)* | *(209 to 1)* | *$1.000* | *0% (fair, reference only)* | — | not offered |

**UI:** four lamps (H4, H6, H8, H10) light as each hits. On a win: "Hard Way All Day! +$164 per $1. Bet stays up, lamps reset." (The amount follows the active pay setting.) The chips stay on the spot, and all lamps clear with a short "re-armed" pulse. On a loss: "7 – Hard Way All Day down (2 of 4 lit)". Tutor warns: "Highest edge on the board, 21.4%."

**Differences between code and spec:** (a) **Stay-up after a win:** the spec says it stays up, but the code takes it down. **Code change needed** (see above). (b) **Takedown any time wipes the lamps:** the code does this, and it's kept as part of the definition. (c) **Payout options:** the code hard-codes 165 (`MAKE_EM_FOR`, `js/engine.js:23`). The Premium 150/175/200 options need a setting, plus `bonusEdge` (`js/table-engine.js:606-623`) reading the active pay. Code change needed later. The help text's "$165 returned per $1, includes stake → $164 profit" will need rewording once the stake stays on the felt: "$164 paid per $1; your $1 stays up."

### S1.6 ATS: Low Rolls / High Rolls / Roll 'Em All (App 1 Regular **and Crapless**, and App 2): DEFINED

**Names:** the casino names are All Small, All Tall and Make 'Em All. The app labels them **Low Rolls**, **High Rolls** and **Roll 'Em All** (`js/engine.js:397-402`; `js/table-app.js:30-31`).
**Where:** App 1 **Regular and Crapless** (Bill, rev 13; this reverses the rev 3/5 "no ATS in Crapless" rule) and App 2 (Regular only, since App 2 has no Crapless).

**ATS in Crapless (rev 13): DEFINED**
- **It's a dice-outcome bet.** It doesn't depend on the line, the point or the puck. Only the **dice total** of each roll counts:
  - **Low Rolls** (All Small): **2, 3, 4, 5, 6**;
  - **High Rolls** (All Tall): **8, 9, 10, 11, 12**;
  - **Roll 'Em All** (Make 'Em All): **all ten**.
  - In Crapless, a 2, 3, 11 or 12 lights its lamp whether it's a come-out roll that sets a point, a point being made, or a roll during the point.
- **Any 7 loses every ATS bet that's up, the come-out 7 included.** In Crapless, a come-out 7 is the only come-out Pass winner (there's no 11 winner and no craps), but **it still loses ATS**: Pass wins and ATS loses on the same roll. Regular works the same way on a come-out 7.
  - The lamps clear, and a fresh bet starts empty.
  - Tutor note: see A1.8 "Come-out 7 with ATS up".
- **Payouts are the same:** 31 / 31 / 156 FOR 1 (Premium B-21: 35 / 35 / 176). **Edges are the same:** 18.30% / 18.30% / 17.98%.
  - Dice probabilities don't change with the rule set: P(win per cycle) = 2.635% / 2.635% / 0.526% in both modes, so EV = 31 × 0.02635 − 1 = −18.30% and 156 × 0.00526 − 1 = −17.98%.
  - The ≈ 3% per-roll figure is the same too.
- **Re-arm, take down, B-20 "comes down after a hit", and Spin the Block** work identically in both modes.
- **Per-hand odds** (bet up all hand and placed again after any come-out 7; exact Markov calculation; hand = first roll after a seven-out through the next seven-out):

| Outcome | Regular per hand | Crapless per hand |
|---|---|---|
| Low Rolls paid at least once (High Rolls: same) | 3.727% (1 in 27) | **3.460% (1 in 29)** |
| Roll 'Em All paid (= the ATS Sweep with all three up) | 0.746% (1 in 134) | **0.692% (1 in 145)** |
| Spin the Block, Low + High both up | 0.191% (1 in 523) | **0.177% (1 in 565)** |
| Spin the Block, one bet up | 0.0987% (1 in 1,013) | **0.0914% (1 in 1,094)** |
| Average hand length | 8.53 rolls | 7.90 rolls |

  - **Why Crapless is a little lower:** per roll and per cycle nothing changes. But a Crapless hand is shorter (7.90 vs 8.53 rolls): every come-out total except 7 sets a point, so there are no come-out 2/3/11/12 "free" rolls, and fewer rolls happen before the seven-out. Fewer rolls means fewer chances per hand.
  - The edge per bet is unchanged. The expected loss per hand is a little lower only because the bet is exposed for fewer rolls.

**Rule (Standard, Bill, Oct 10):**
| Bet | Wins when these all roll before a 7 (any order, any dice) | Pays | Loses |
|---|---|---|---|
| **Low Rolls** (All Small) | 2, 3, 4, 5, 6 | **31 FOR 1 = 30 to 1** | A 7 before the set is complete |
| **High Rolls** (All Tall) | 8, 9, 10, 11, 12 | **31 FOR 1 = 30 to 1** | Same |
| **Roll 'Em All** (Make 'Em All) | 2, 3, 4, 5, 6, 8, 9, 10, 11, 12 | **156 FOR 1 = 155 to 1** | Same |

- **Lamps:** one lamp per number, lit the first time that total rolls. Repeats do nothing.
- **Stays up after a hit (Standard):** when the set is complete, the profit is paid, **the stake stays on the felt, the lamps reset, and the bet starts collecting again.** The player can **"spin the block"** (complete it again) and win again **within the same shooter cycle**. Each bet re-arms on its own. For example, Low Rolls can re-arm while Roll 'Em All is still collecting.
- **Comes down only** on a 7, which loses whatever is up, or when the player **takes it down**. Takedown is allowed any time and clears that bet's lamps.
- **Premium toggle B-20 / T-20 "ATS comes down after a hit"** (default Off): when On, a hit pays and returns the stake, and the bet comes down (the current code's behavior).
- **Premium ATS pay table (B-21 / T-21):** 35 / 35 / 176 for 1 = **7.76% / 7.76% / 7.46%** (Wizard lists 34 to 1 for All Small/All Tall; the 176 for 1 figure for Roll 'Em All is my calculation). See S1.8.
- **When to bet:** any time in the app (the code has no come-out restriction). Real casinos usually take ATS only before the come-out, after a seven-out. This app keeps it open as a practice simplification. Posting a fresh bet starts with empty lamps.

**Edges (re-calculated; they match the code's `bonusEdge`, `js/table-engine.js:562-623`):**
| Bet | Win chance per cycle | Fair pay (for 1) | App pay | **House edge per cycle** | Avg rolls per cycle | ≈ Per roll |
|---|---|---|---|---|---|---|
| Low Rolls | 2.635% (1 in 37.9) | 37.9 for 1 | 31 for 1 | **18.30%** | 5.84 | ≈ 3.1% |
| High Rolls | 2.635% (1 in 37.9) | 37.9 for 1 | 31 for 1 | **18.30%** | 5.84 | ≈ 3.1% |
| Roll 'Em All | 0.526% (1 in 190.2) | 190.2 for 1 | 156 for 1 | **17.98%** | 5.97 | ≈ 3.0% |

**Does staying up change the edge? No, not per cycle.** The dice have no memory. After a re-arm, the next cycle starts with empty lamps, exactly like a fresh bet, so it has the same win chance and the same edge. Staying up changes only **exposure**: the stake stays at risk for more cycles (until a 7 or a takedown), so **the total expected loss per shooter hand goes up** with every extra cycle played. It also skips the step of re-betting by hand. Tutor says: "Same edge, more time exposed."

**What the code does today (no re-arm):**
- Read-only GitHub copy at `/tmp/bbp`, commit `6a13aff` (same as remote HEAD).
- On a win, `settleBonusBets` pays the stake + profit and **takes the bet down**: `js/engine.js:769-775` (line 772 `bankroll += stake + profit`, line 773 `state.bets[kind] = 0`, line 774 progress reset).
- On a 7 it loses and clears the lamps (`js/engine.js:762-766`).
- Table Craps uses the same function (`js/table-engine.js:854`), so it behaves the same.
- Tests expect a credit of stake + profit on a win (`tests/table-engine.test.js:465-482`).
- Placing fresh or taking down resets the lamps (`js/engine.js:591-593, 615-619`).
- Help text: `index.html:564-570`, `README.md:60-70`, `table.html:236`.
- So **the code does not re-arm ATS today**. The Standard behavior needs a code change, and the current behavior becomes the Premium "comes down" option.

**UI:**
- On a hit: toast "Low Rolls! +$30 per $1. Bet stays up, lamps reset." The lamps flash and then clear with a "re-armed" pulse.
- A small "×2" badge counts hits this hand.
- The **take-down** control shows on long-press or in the bet drawer. *(Rev 15d: the long-press opens the spot sheet, S4.5 H2, whose "Your bet" row holds this Take down, under the lingo card.)*

### S1.7 Repeater bets (both apps): DEFINED

**What it is:** pick a number. It must roll a set number of times **before a seven-out**. Those rolls don't have to be in a row. The count needed is the number itself for 2–6, and its mirror for 8–12 (14 minus the number):

| Number | 2 | 3 | 4 | 5 | 6 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|
| Rolls needed | 2 | 3 | 4 | 5 | 6 | 6 | 5 | 4 | 3 | 2 |

Design Desk's draft count is **correct**.

**Sources:**
- [Wizard of Odds, Craps Side Bets: Repeater](https://wizardofodds.com/games/craps/appendix/5/) (seen at the Suncoast, Las Vegas, 2015).
- Repeater Bets LLC patent application ([freepatentsonline](https://www.freepatentsonline.com/y2016/0158636.html), [2024 filing](https://www.patents-review.com/a/20240416216-craps-game-repeated-number-based-wagering-area.html)).
- Same pay table, printed as **"40 for 1 … 90 for 1"**, in Nevada's [Repeater Bets Plus for Roulette rules of play](https://www.gaming.nv.gov/siteassets/content/divisions/enforcement/rules-of-play/Repeater_Bets_Plus_for_Roulette.pdf) (re-read Oct 10). That's the roulette version of the same product. Its rules: any seven ends the round and loses every open bet, and new bets can be placed before any spin if the number hasn't been marked yet. The craps version in this spec follows the same idea.
- *The two patent pages block automated fetches (HTTP 403 on Oct 10), so the patent details below weren't re-read in this pass.*
- Las Vegas Advisor [craps survey](https://www.lasvegasadvisor.com/forums/gambling/craps-offerings-at-various-hotels/), which lists Repeater at many Las Vegas tables.

**Corrections to the draft:**
1. **The payouts are "FOR 1", not "to 1".** Every source lists 40 / 50 / 65 / 80 / 90 **for 1** (the stake is included). So 2/12 pays **39 to 1** net, not 40 to 1. The draft's "40:1" style must change to "40 FOR 1" on the felt and in the Bet Panel. If the app paid "40 to 1" by mistake, every edge would be about 1–2 points lower than the real table.
   - **Design Desk's draft edges (16.33% · 20.31% · 18.52% · 17.06% · 19.74%) are exactly the "to 1" reading.** The draft formula `edge = 1 − (pay + 1)·q^N` treats 40 as a net profit.
   - With the real "for 1" table the formula is `edge = 1 − pay·q^N`, which gives **18.37% · 21.88% · 19.75% · 18.08% · 20.62%**.
   - Design Desk's q = p/(p + 1/6) and the hit counts are right. Only the "+1" is wrong.
2. The draft pay table (40/50/65/80/90) **is the standard real table.** Only the wording was wrong.
3. **The patent's own table is approximate and slightly off on 5/9.** It lists 5/9 "true odds ~100:1" and "~20.8%" edge. The exact numbers are 96.66 to 1 and **18.08%**. This spec uses Wizard's exact figures, which I re-checked by calculation.

**Exact math.** P(win) = (ways ÷ (ways + 6))^N, where N is the rolls needed.

| Bet | Needs | P(win) exact | ≈ 1 in | Fair pay | **Standard pay** | **Standard edge** | ≈ Per roll |
|---|---|---|---|---|---|---|---|
| 2 or 12 | 2× | (1/7)² = 1/49 | 49.0 | 49 for 1 | **40 for 1** (39 to 1) | **18.37%** | 3.12% |
| 3 or 11 | 3× | (1/4)³ = 1/64 | 64.0 | 64 for 1 | **50 for 1** (49 to 1) | **21.88%** | 3.70% |
| 4 or 10 | 4× | (1/3)⁴ = 1/81 | 81.0 | 81 for 1 | **65 for 1** (64 to 1) | **19.75%** | 3.33% |
| 5 or 9 | 5× | (2/5)⁵ = 32/3125 | 97.7 | 97.66 for 1 | **80 for 1** (79 to 1) | **18.08%** | 3.04% |
| 6 or 8 | 6× | (5/11)⁶ = 15625/1771561 | 113.4 | 113.38 for 1 | **90 for 1** (89 to 1) | **20.62%** | 3.47% |

Expected life is about 5.9 rolls per cycle for every number (5.88 for 2/12, 5.95 for 6/8). The per-roll figure is the edge ÷ that average.

**Pay table presets:**

| Preset | 2/12 | 3/11 | 4/10 | 5/9 | 6/8 | Edges (2/12 · 3/11 · 4/10 · 5/9 · 6/8) | Tier |
|---|---|---|---|---|---|---|---|
| **Standard** (Suncoast / Nevada / Repeater Bets LLC table) | 40 for 1 | 50 for 1 | 65 for 1 | 80 for 1 | 90 for 1 | 18.37% · 21.88% · 19.75% · 18.08% · 20.62% | **Standard (free)** |
| **Generous** (app-made, not a real casino table) | 45 for 1 | 58 for 1 | 75 for 1 | 90 for 1 | 105 for 1 | 8.16% · 9.38% · 7.41% · 7.84% · 7.39% | Premium |
| **Near-fair** (app-made, for learning what a fair price looks like) | 47 for 1 | 62 for 1 | 79 for 1 | 95 for 1 | 110 for 1 | 4.08% · 3.13% · 2.47% · 2.72% · 2.98% | Premium |
| *Fair (reference only, not offered)* | *49 for 1* | *64 for 1* | *81 for 1* | *97.66 for 1* | *113.38 for 1* | *0%* | — |

Label the Generous and Near-fair presets "App practice preset, not a casino pay table" in Custom Rules.

**Real-world variant (reference only, not offered):** Caesars Palace adds a "Dealer Envy" payout to the same table. That's excluded here, matching Hard Way All Day.

**Rules decided in this spec:**

| Rule | Standard | Why |
|---|---|---|
| **What ends it** | **Any 7** loses every Repeater that's up, **including a come-out 7** (Bill, via Design Desk). | Same as ATS and Hard Way All Day in this app, which also lose to any 7 (`settleBonusBets`, `js/engine.js:762-766`). Matches the Nevada rules of play ("when a seven is spun, all wagers ... are lost"). |
| **Which rolls count** | **Every roll counts**, come-out rolls included, starting from the roll after the bet is placed. | This is a plain "number N times before a 7" race, so Wizard's probabilities apply exactly. |
| **Premium: "Repeaters off on the come-out"** (patent style) | Off by default. When On, come-out rolls don't count **and** a come-out 7 doesn't lose. | The edge is **unchanged**: skipping the come-out removes both the counts and the 7s, so the rolls that do count are still a plain race. **Never** offer the mixed version (come-out numbers count but a come-out 7 doesn't lose). That changes the odds and isn't a real table rule. |
| **When it can be bet** | **Any time** (puck OFF or ON), with a fresh tally from that roll. You can add to a Repeater only while its tally is 0; once it has progress, the stake is locked until it wins, loses or is taken down. | Because the dice have no memory, the timing doesn't change the edge. Locking a bet with progress stops "buying in" at a better price. |
| **Premium: "Repeaters on the come-out only"** | Off by default. When On, Repeaters can be posted only while the puck is OFF (the patent's "bet tracking" rule). | Edge unchanged. Tutor still says the timing doesn't make the bet better. |
| **After a hit** | **Stays up and re-arms**: the profit is paid, the stake stays, the tally resets to 0, and it can win again in the same hand. This matches ATS and Hard Way All Day. | Consistency with the other multi-roll bets. The per-cycle edge doesn't change (memoryless). |
| **Premium: "Repeaters come down after a hit"** | Off by default. | Same edge; the only difference is exposure. |
| **Take down** | Allowed any time while the puck is OFF or ON. Taking it down clears the tally. | Same as ATS and Hard Way All Day. |
| **Payout wording** | Always **"FOR 1"** on the felt, Bet Panel, plates and Tutor ("40 for 1" = 39 to 1 profit). | Design Desk's draft used "40:1", which reads as "to 1". |
| **Bets Off** | Not affected (like ATS and Hard Way All Day). | — |
| **Limits** | Table min $1 per Repeater; max $25 per number (Standard). The patent mentions $1–$5 / $1–$10 / $1–$20 house limits. | Long-shot exposure. |

**Crapless (App 1). Decision (Bill, via Design Desk, Oct 10): Repeaters are offered in Crapless, with the same pay table and the same edges.**
- A Repeater ignores the point and the line. It counts its number on every roll and loses on any 7, so Crapless's different come-out rules don't matter.
- In Crapless, 2/3/11/12 can become points. That has no effect: a rolled 2 is still a "2" for the Repeater, whatever the puck says.
- So the formula and the edges are identical in Regular and Crapless (18.37%–21.88% at the Standard pays).
- *(Rev 13: the no-ATS part of Bill's Crapless rule is reversed, so ATS is in Crapless too. The Fire Bet is still Table Craps only, A2.2a.)*
- B-24 stays as a Premium switch (default On) in case a Crapless rule set should hide them.

**Felt and UI (the locked layout stays unchanged):**
- Repeaters don't get printed spots on the locked felt.
- They live on the **left Side-bets screen** (S4.1), with all ten tiles, lamps and counters. The Bet Panel's "Repeaters" tab is a shortcut there. *(Rev 8: the rail above the number boxes is gone, so the board stays uncluttered.)*
- Each tile shows the number, the "needs N×" label, "40 FOR 1", tally pips (for example `6: ●●●○○○`), the stake, and an edge badge.
- On a hit: toast "Repeater 6! Six 6s before a 7. +$89 per $1. Bet stays up, tally reset."
- On any 7: "Seven. Repeaters down (6 had 3 of 6)." On a come-out 7, say "Winner 7 on the line, Repeaters down."
- Felt and plates use **"FOR 1"** (for example "REPEATER SIX · 90 FOR 1"). MOTION-SOUND-SPEC M20's plate "90 TO 1" must change (mockup conflict 11).

**Code status:** Repeaters are **not in the code.** They should plug into the shared bonus-bet settlement, `settleBonusBets` (`js/engine.js:747-811`), which both apps already call (`js/table-engine.js:854`). The edge should come from `bonusEdge` (`js/table-engine.js:562-623`), Standard needs no phase flag: count every roll and lose on any 7, the same path ATS uses today. Only the Premium "off on the come-out" option needs a phase check. See Code changes.

### S1.8 Where sources disagree (summary)
- **Crapless Place 2/12 and 3/11:**
  - Wizard of Odds and the Las Vegas surveys: **11 to 2** and **11 to 4** (7.14% / 6.25%).
  - Nevada's [Crapless Craps rules of play](https://www.gaming.nv.gov/siteassets/content/divisions/enforcement/rules-of-play/Crapless_Craps.pdf): **25 to 5** (= 5 to 1, a **14.29%** edge) and **13 to 5** (= 2.6 to 1, a **10.00%** edge).
  - The spec keeps 11:2 and 11:4 as Standard (the most widely reported Las Vegas pays, and they match the code). The Nevada pays are a Premium preset option on B-25.
- **Lay bets in Crapless:** Wizard calls it an "unconfirmed report". Nevada's crapless rules say "Operator may or may not offer the Lay bet ... 5% vig". App 1 doesn't offer number lays in either mode (see the mockup conflicts).
- **Buy commission:** charged on wins only vs always. Both happen in real casinos; the Standard here is on wins only.
- **Don't Pass edge:** 1.36% (pushes counted) vs 1.40% (pushes not counted). Both are correct; it depends on whether ties are counted.
- **ATS:** two known pay tables. 35 for 1 on Small/Tall (7.76%), or 31 for 1 (18.30%), per [Wizard via LVA](https://www.lasvegasadvisor.com/forums/gambling/craps-offerings-at-various-hotels/). The app uses the 31-for-1 table, the less generous one. Premium option **35 / 35 / 176 for 1**: 7.76% / 7.76% / 7.46% (the Roll 'Em All figure is my calculation, not from a source).
- **Repeater 5/9:** the patent says "~20.8%"; the exact figure is 18.08% (Wizard).
- **Repeater "to 1" vs "for 1":** Design Desk's draft and MOTION-SOUND-SPEC M20 say "to 1"; Wizard and Nevada say **for 1**. The spec uses for 1.
- **Hard Way All Day pay:** Wizard's [Hard All Day page](https://wizardofodds.com/article/hard-all-day/) (updated Aug 2026) reports the Paris Las Vegas (July 2025) paying **165 TO 1**, a **20.95%** edge. Nevada's official [Hard All Day rules of play](https://www.gaming.nv.gov/siteassets/content/divisions/enforcement/rules-of-play/Hard_All_Day.pdf) say **"pays 165 for 1"**, which matches the app and Bill's rule (164 to 1, a **21.43%** edge). The regulator's text is the stronger source. Both edges re-calculated from P(win) = 1/210 (S1.5): 1 − 165/210 and 1 − 166/210. The spec keeps 165 for 1 as Standard. "165 to 1" (20.95%) is a Premium option on B-19 / T-19 (Bill, Oct 10).
- **Dice setting:** Wizard says "most casinos happily allow" setting, but back-wall and timing rules are common.

## S2. Tutor framework (both apps)

Each app has its own Tutor content (A1.8, A2.6) on this shared framework (S7).

### Shared Tutor behavior
- Track picker: **Beginner** or **Experienced**. Can be switched at any time.
- A coach bubble anchors to a spot, with **Got it / Why? / Mute this tip**. **Why?** opens the math box.
- **Nudge** = green glow. **Warn** = amber outline plus a one-line edge note.
- **Edge badges** on spots: green ≤ 2%, yellow 2 to 5%, red > 5%. Badges always reflect the **active ruleset** (Standard, or the Premium Custom Rules).
- **Session panel:** bankroll, stop-loss line, win-goal line, rolls.
- Never say a bet "wins". Say "lowest edge" or "less costly."

### Edge warnings: when Tutor says "long shot" or "high house edge" (rev 13d)
- **"Long shot"** applies only to a **prop**: a one-roll or multi-roll side bet (Any 7, Any Craps, Yo, C&E, Horn, hops, hardways, ATS, Hard Way All Day, Repeaters, Fire Bet). It must also win on **fewer than about 1 in 6** of its decisions:
  - **one-roll props:** per roll. Yo is 2/36 and a hop 1–2/36, so they're long shots. Any 7 is exactly 6/36 and C&E and Horn are 6/36, so they aren't.
  - **multi-roll props:** per decision, try or hand. Hard 6/8 is 1 in 11, Hard 4/10 1 in 9, ATS about 1 in 38, Hard Way All Day 1 in 210, Repeaters 1 in 49 to 1 in 113, and the Fire Bet about 1 in 94 hands; all are long shots.
  - Line bets, odds, Come, and Place / Buy bets are never "long shots".
- **"High house edge"** is a separate warning, for any bet with an edge of **9% or more** under the active rules: hardways 9.09–11.11%, Any Craps / C&E / Yo 11.11%, Horn 12.5%, hops, Big Red 16.67%, ATS, Repeaters, Hard Way All Day, the Fire Bet, and App 2's Big 6/8 at 9.09%.
  - A Premium pay table that drops the edge under 9% removes it, e.g. ATS at 35 / 35 / 176.
- **Copy:**
  - both apply: "Long shot with a high house edge.";
  - long shot only: "Long shot.";
  - high edge only: "High house edge." Big Red, for example, wins 1 in 6, so it isn't a long shot.
  - The Experienced line always adds the numbers: edge, the chance to win, and the pay.
- **The Field gets neither.** It wins on 16 of 36 rolls, and its 5.56% is under 9%. It has its own line (A1.8, A2.6): "**Field: wins on 16 of 36 rolls, but the 5–8 numbers lose. 5.56% edge.**"
- The same goes for **Place 4/10 (6.67%) and Place 2/3/11/12 (7.14% / 6.25%)**: no long-shot or high-edge wording. They keep their existing "buy it instead" lines.

### Good vs bad bets (Standard rules)
- **Nudge toward:**
  - Pass or Come + Odds.
  - Don't Pass or Don't Come + Lay (Regular).
  - Place 6/8.
  - **Buy 4/5/9/10** (vig on win only).
  - **Buy 2/3/11/12** (Crapless).
- **Explain the cost:** Billy's Way, Bubble only (1.71% Regular / 1.43% Crapless blended, mostly Buy bets), Place 5/9 (4.00%; "buy it instead").
- **Warn against:**
  - Place 4/10 (6.67%; buy it instead).
  - Place 2/12 (7.14%) and Place 3/11 (6.25%).
  - Field (5.56%; it has its own Tutor line, not a long-shot or high-edge warning; see "Edge warnings" below).
  - Hardways (9 to 11%).
  - Any Craps, C&E, Hop, Horn (11 to 14%).
  - Big Red (16.67%).
  - Low/High/Roll 'Em All (18.30% / 18.30% / 17.98%; both modes since rev 13; they stay up after a hit, so they keep costing you until a 7 or a takedown).
  - **Repeaters** (18.08% to 21.88% at the Standard pays; they stay up after a hit). Repeater 3/11 is the worst at 21.88%.
  - **Hard Way All Day (21.43% at the Standard 165 for 1, the highest edge on the board; it stays up after a win, so it keeps costing you until you take it down).**
- **Dice-have-no-memory rule:** in every app and track, Tutor never uses "due", "overdue", "hot dice" or "cold dice" (S6 banned-words list), and never suggests a bet because of a streak, the Blazing meter, or Fair Dice results.

### Etiquette guide (both apps; rev 15a; full text in `etiquette-guide.md`)
- **15 table-manners tips taught by Dealer Billy** (1–2 sentences each + a one-line Why): buying in between rolls (cash on the felt, never hand to hand), hands clear when the dice are out, a one-hand throw to the back wall, don't say "seven", tipping and toking (incl. a bet for the dealers; optional, from your budget), hands off bets mid-roll and let the dealer move Place / Buy / Come, call bets before "dice out", color up when leaving, dark-side manners, phones and drinks off the rail, chips in the rail, "same dice", no leaning, check the table sign, ask the dealer.
- **Bubble Craps** shows the live-only tips under "At a live table", tagged **[Live table]** (all but 4, 9 and 14).
- **Hooks:** tip cards on the tutorial screen (both), a rotating "Billy's Table Tip" once per session (both), contextual nudges (Table: 10 triggers; Bubble: the 2 [Both] ones), and a Bronze learning badge **"Table Manners"** (both; Bubble #31, like #24). **No in-app toke bet.**
- Copy is courtesy only: never about winning or betting more, and superstition tips say they don't change the dice (Rule 0).

### Craps Lingo (both apps; rev 15d; UI in S4.5, terms in `craps-lingo.md`, data in `lingo.json`)
- **A searchable glossary of 79 real craps terms taught by Dealer Billy:** dice calls (aces, ace-deuce, Little Joe, fever / no field five, Jimmy Hicks, Big Red, Nina, center field nine, yo-leven, boxcars / midnight…), bets (Horn, Horn high, C&E, hops, World, Field, Big 6/8, Place / Buy / Lay, hardways, ATS, Fire Bet [Table only], Repeaters, Hard Way All Day…), actions (press it, same bet, regress, take it down, off / on, working, color up, change only, check change, Iron Cross, Inside, Across) and table talk (dark side / right way, puck, come-out, point, seven out, PSO, stickman, boxman, hand, comp, toke…).
- Each term has a plain meaning, an example call, a tag for the app(s) and mode(s), and a link to its spot when the board has one. **Show me** highlights the spot and opens its **Tutor line** (the same line this framework shows in the coach bubble).
- **Hooks:** the Lingo screen (Learn + menu) with fuzzy search and category filters, long-press a bet for its card, tappable roll calls that never block a roll, and a Silver "Talk the Talk" badge (25 distinct terms).
- **The Tutor rules apply to Lingo copy:** the banned words (S6), "lowest edge" / "less costly" rather than calling any bet good (outcome facts like "the Field wins on a 9" are fine, as in the Field line), no streak talk, and no bet pitches. "Press it" is defined with its risk. No in-app tip or toke bet.

## S3. Edge Preview pattern and settings ID map (both apps)
Every Premium Custom Rules screen (A1.6, A2.3) uses the same Edge Preview component (shared code, S7).

- When any setting changes, the **Edge Preview** panel animates the old value to the new one for every affected bet. Example: "Field 5.56% → 2.78%", "Pass+Odds 0.37% → 0.18%".
- The changed rows are highlighted, and spot badges on the felt preview update.
- Tutor (Experienced) shows a one-line note, for example: "10x odds lowers the combined edge, but swings grow. Your expected loss in chips stays the same as the flat bet's." Beginners get a shorter version: "This makes the Field cheaper."
- Bad combinations show a warning, for example "Commission: Always" adds "Buy 4/10 now 4.76%. Placing 6/8 is still 1.52%."
- An **active rules chip** on the felt ("Custom: Strat 10x") opens a summary, so the player always knows they're off Standard.

**Example rows:**
| Change | Preview text |
|---|---|
| Hop pays (B-29 / T-29) | "Easy hop 11.11% → 5.56% (16 to 1). Hard hop 13.89% → 11.11% (31 to 1)." One-roll bets, so the per-bet and per-roll edges are the same. |
| Fire Bet pay table (T-27) | "Fire Bet 20.76% → 8.16% (Generous). Win chance 1 in 94 (4+ points)." |
| PRESS / POWER PRESS (App 1, A1.4a) | "Edge unchanged: Place 8 1.52% before and after. At risk on a 7: $32 → $38." POWER PRESS shows the ladder step: "Place 8 $6 → $18 · add $5 from chips · at risk on a 7 +$12 · expected loss per decision $0.09 → $0.27 · edge 1.52% unchanged." Shown while the key is held. |
| Hard Way All Day pay (B-19 / T-19) | "Hard Way All Day 21.43% → 4.76% (200 for 1)" or "→ 20.95% (165 to 1)". Fair is 210 for 1. The row also shows the win chance (1 in 210) and the per-roll edge. |
| ATS comes down after a hit (B-20 / T-20) | "Low/High 18.30% → 18.30%, All 17.98% → 17.98% (per cycle, unchanged). Bet behavior: stays up → comes down after a win." Note: "Edge per cycle doesn't change. Staying up only changes how long your money stays exposed." |
| ATS pay table (B-21 / T-21) | "Low/High 18.30% → 7.76%, All 17.98% → 7.46% (35/35/176 for 1)." |
| Repeater pay table (B-22 / T-22) | "Repeater 6 or 8: 20.62% → 2.98% (110 for 1). Fair would be 113.38 for 1." One row per number pair, with the win chance (for example "1 in 81" for 4/10). |
| Repeater toggles (B-23 / T-23) | "Edge unchanged. Comes down after a hit / off on the come-out / come-out-only betting only change exposure and timing." |
| Crapless Place pays (B-25) | "Place 2/12 7.14% → 14.29%, Place 3/11 6.25% → 10.00% (Nevada 5:1 / 13:5). Buy 2/12 is still 0.71%." |

**Settings ID map (rev 4 → rev 5).** Rev 4 used one list numbered #1–#24 for both games. Rev 5 splits it into per-app lists: **B-xx** = App 1 (Bubble Craps), **T-xx** = App 2 (Table Craps).
| Rev 4 # | Setting | App 1 | App 2 |
|---|---|---|---|
| 1 | Field 2 pays | B-1 | T-1 |
| 2 | Field 12 pays | B-2 | T-2 |
| 3 | Odds, Regular | B-3 | T-3 |
| 4 | Odds, Crapless | B-4 | — |
| 5 | Lay odds limit | B-5 | T-4 |
| 6 | Buy commission timing | B-6 | T-5 |
| 7 | Commission rounding | B-7 | T-6 |
| 8 | Lay commission timing | — (App 1 has no lay bets) | T-7 |
| 9 | Buy available on | B-8 | T-8 |
| 10 | Place/Buy on come-out | B-9 | T-9 |
| 11 | Hardways on come-out | B-10 | T-10 |
| 12 | Don't Pass bar | B-11 | T-11 |
| 13 | Table minimum | B-12 | T-12 |
| 14 | Table maximum | B-13 | T-13 |
| 15 | Starting bankroll | B-14 | T-14 |
| 16 | Horn payouts | B-15 | T-15 |
| 17 | Any 7 payout | B-16 | T-16 |
| 18 | Hardway payouts | B-17 | T-17 |
| 19 | Side-bet toggles | B-18 | T-18 |
| 20 | Hard Way All Day pay | B-19 | T-19 |
| 21 | Auto-roll interval (App 1, free, Off by default; A1.5a) / betting timer | B-26 | T-26 (multiplayer betting timer) |
| 22 | Dice source | — (RNG always; Rule 0. Rev 16: Your Dice, S9, is a separate mode, not a dice-source setting) | — (same) |
| 23 | Seven-out dice behavior | — (no shooter) | T-25 |
| 24 | ATS comes down after a hit | B-20 | T-20 |
| new | ATS pay table | B-21 | T-21 |
| new | Repeater pay table | B-22 | T-22 |
| new | Repeater toggles | B-23 | T-23 |
| new | Repeaters in Crapless | B-24 | — |
| new | *(PRESS size: dropped)* | B-27 | — |
| new | Auto-press after each hit (Billy's Way / B5) | B-28 | — |
| new | Fire Bet pay table / limits | — | T-27 / T-28 |
| new | Hop pays | B-29 | T-29 |
| new | Show the dice on each roll | B-30 | — |
| new | Power Press ladder (rev 12) | B-31 | — |
| new | Crapless Place 2/12, 3/11 pays | B-25 | — |
| new (rev 16) | Limit tier (PROPOSED tiers, S10) | B-32 | T-31 |
| new (rev 16) | Roll speed: Normal · Fast · Instant (free, S11) | B-33 | T-32 |
| new (rev 16) | Quick bets: include my point (free, default Off, S12) | B-34 | T-33 |

## S4. Look and feel (both apps)

The source of truth is `/workspace/bb-mockups/DESIGN-SYSTEM.md`, with `MOTION-SOUND-SPEC.md` and `QA-CHECKLIST.md` alongside it. The summary below is just enough to keep spec and mockups aligned.

- **Family:** same mascot (**Dealer Billy**), chips, type and color tokens in both apps. App 1 uses the emerald "Billy Bubs" felt and a "Bubble neon" machine theme. App 2 uses a blue "Pacific"-style table in the mockups, and all felt themes are available.
- **Bottom tabs in both apps:** **Play · Fair Dice · Learn · Premium · Settings**.
- **HUD strip on Play:** Practice chips, On table, Point puck, last dice, and a **FAIR** shortcut that opens Fair Dice.
- **Tutor** appears as "Billy Tips" (an on/off pill in the header), with the coach card: step dots, Beginner/Experienced switch, edge badges, Got it / Why? / Mute this tip.
- **Edge badge colors:** green ≤ 2%, amber 2–5%, red > 5%.
- **Practice disclaimer footer** on home and Play screens: "18+ · Education only · Play money only · No real gambling." (See mockup conflict 10.)

**Locked felt layout (both apps; App 2 uses the same felt in Bets view and in pass-and-play):**
- **Horn** 2x2 on the left: 2, 3, 11, 12.
- **Middle:** **Big Red (Any 7)** above **Hard Way All Day**.
- **Hard Ways** 2x2 on the right: Hard 4, 6, 8, 10.
- **Bottom row:** Pass / Odds / Don't Pass / Lay Odds. In Crapless the Don't Pass and Lay Odds spots are hidden or disabled (App 1).
- **Number boxes:** **Buy** above and **Place** below each number. Regular has 4, 5, 6, 8, 9, 10. Crapless has 2, 3, 4, 5, 6, 8, 9, 10, 11, 12.
- The mockups put the ATS lamp strip (Low Rolls / Roll 'Em All / High Rolls) above the number boxes in Regular and remove it in Crapless. **Rev 13: the strip shows in Crapless too, above the ten number boxes in the same place** (mockup conflict 19). Come and Don't Come run full width under the numbers, with the Field under them; in Crapless, Don't Come stays hidden.
- **New elements without a locked spot** (Repeaters, Hops, Fire Bet, Blazing meter) must not move locked spots. Repeaters and Hops (and the Fire Bet in Table Craps) live on the **left Side-bets screen**. The Blazing meter sits on the right Dice screen and in the HUD. See S4.1.

**Chips (Bill, Oct 10), both apps:** **$1 · $5 · $25 · $100 · $500**, with **$500 in purple** (#5A2A88 with gold, per DESIGN-SYSTEM). **There's no $10 chip.** The code has $1 / $5 / $25 / $100 in App 1 (`js/engine.js:15`) and $1 / $5 / $10 / $25 / $100 in App 2 (`js/table-app.js:28`), so both need a code change. A $10 bet (for example App 2's $10 minimum) is two $5 chips.

### S4.1 Three-screen Play layout (both apps; Bill, Oct 10, rev 8)

Bill: *"I want to have 3 screens to swipe through: far right dice/hood, middle betting board, left should be repeater and hop bets so the middle board's not over crowded."*

| | **LEFT: Side bets** | **MIDDLE: Board (default landing)** | **RIGHT: Dice** |
|---|---|---|---|
| **Bubble Craps** | Repeaters + Hops | Locked felt + Bet Panel + machine keys | **Bubble hood / dome** |
| **Table Craps** | Repeaters + Hops + **Fire Bet** tile | Locked felt + Bets sheet | **Shooter / throw screen** (pick, set, throw) |

**Middle (Board), the default landing screen in every orientation:**
- **The locked layout is unchanged:**
  - Horn 2x2 on the left (2, 3, 11, 12);
  - Big Red (Any 7) above Hard Way All Day in the middle;
  - Hard Ways 2x2 on the right;
  - Pass / Odds / Don't Pass / Lay Odds on the bottom row (Don't spots hidden in Crapless);
  - Buy above and Place below each number.
- The ATS lamp strip (both modes, rev 13), Come / Don't Come and the Field stay where they are.
- **Moved off the board:** the Repeater rail (S1.7) and every hop except the four Horn singles.
  - The Horn 2x2 *is* four hops (Aces 1-1, Ace-deuce 1-2, Yo 5-6, Midnight 6-6; code `data-kind="hop"`, `index.html:206-240`).
  - Those four stay in the Horn box and are **mirrored** on the left screen as the same bet (one stake, shown in both places).
- App 1 keeps the Bet Panel (Place · Buy · Lay odds [Regular] · Odds) and the machine keys **BETS OFF · BILLY'S WAY · RESET**. Its Repeaters tab becomes a shortcut to the left screen.

**Left (Side bets):**
- **Bets on this screen:** all 10 Repeaters (2, 3, 4, 5, 6, 8, 9, 10, 11, 12) + all 21 hops (6 hard + 15 easy) (+ the Fire Bet in Table Craps).
- **Repeaters:** all ten numbers (2–12, no 7) as tiles with lamps and a progress counter ("6: ●●●○○○ 3/6"), the "FOR 1" pay, an edge badge, the stake, and Add a chip / Take down (S1.7). Crapless shows all ten in App 1 as well.
- **Hops (all 21):** a dice-pair grid, 6 hard hops (1-1 … 6-6) and 15 easy hops (1-2 … 5-6). Each cell shows the pair, its total, the pay ("30 to 1" / "15 to 1"), the edge badge and the stake.
  - Hops on a 7 (1-6, 2-5, 3-4) are normal easy hops.
  - Tutor tells a **hard hop** (one roll) apart from a **hardway** (multi-roll).
- **Table Craps only:** the **Fire Bet** tile (bet, pay table, "open until this shooter's first roll"). The six-marker Fire rail also shows on the right screen, as in mockup `10-fire-bet-points-lit`.
- **Later candidates** (not now; the core board stays as is):
  - hop combos ("Hop the 7s", "Hop the hard ways");
  - Big 6/8 in Table Craps (now a toggle on the board);
  - a bet history and "Same bet" list;
  - a per-roll exposure summary ("At risk on a 7: $38");
  - a Fair Dice mini-card.

**Right (Dice):**
- **Bubble Craps:** dome / hood with the roll animation, the result line (pip dice + total badge + "EASY EIGHT", S4.2), the point puck, the last-20-rolls strip, the **Blazing meter** with dice heat, and the auto-roll ring (only when auto-roll is on).
  - When a Place/Buy bet just won, it shows the win ("Place 8 +$7") next to the PRESS / POWER PRESS labels (A1.4a).
- **Table Craps:** the shooter screen (pick 2 of 5 dice, dice set, grip, throw meter, back wall), the result line, the Blazing meter (seat rail), the Fire rail and RSR.
  - Non-shooters in multiplayer see "Ana is shooting" with a live view of the throw.

**Hand counter and Longest Roll (rev 9):**
- The right screen's Blazing meter reads "Hand: 9 rolls · 1 point · HOT" using the hand definition below (the same text as S6).
- The **Longest Roll** board lives on the Badges screen (Bubble Craps; `badges-bubble.md`). A "New longest roll this week: 21 rolls" toast follows the same rule as the mini roll-result toast: it waits until the roll result has shown and never covers it.

**Hand and Longest Roll definition (rev 9; one rule for the Blazing meter, Fair Dice, the leaderboard and the badges):**
1. **Start:** the first roll after a seven-out (always a come-out), or the first roll on the device / after Reset bankroll.
2. **End:** the **seven-out roll** only. A **come-out 7 doesn't end the hand**, and neither does a point made, a reload or closing the app.
3. **Length = every roll from start to seven-out, inclusive:** come-out naturals, come-out craps (Regular; **Crapless has no come-out craps**), point-set, point-made and no-decision rolls. The shortest possible hand is 2 rolls.
4. **Bubble Craps has no shooter.** The hand is the machine's dice sequence (manual ROLL or auto-roll), and there are no no-rolls. *(Table Craps: the hand is one shooter's turn, and practice no-rolls don't count.)*
5. **No-bet rolls count** (Bill confirmed, rev 10). The hand is the dice, not the bettor, and the meter must match the board. A hand is **posted** to the Longest Roll board only if you had ≥ 1 bet working on its seven-out roll (anti-idle).
6. **BETS OFF rolls count** (BETS OFF only parks Place/Buy).
7. **Mode switching is blocked until the hand is over** (Bill confirmed, rev 10).
   - Regular ⇄ Crapless works only on a fresh come-out with no rolls in the hand yet (`hand.rolls === 0`: after a seven-out, at first launch, or after Reset bankroll).
   - **Reset bankroll stays as the other way out.**
   - Copy: "Finish this hand first. A hand ends on a seven-out. (Or Reset bankroll to start fresh.)"
8. **Reload / exit mid-hand:** the hand resumes from saved state (there's no timeout). **Reset bankroll** ends it unposted. **Reset Fair Dice history** doesn't touch it.
9. **Meter vs board:** meter rolls = `hand.rolls` (rolls so far; the seven-out resets it to 0). Posted length = `hand.rolls + 1` at the seven-out = `hand.lastLength` (`bb-bc-yrkv` `js/engine.mjs:1375`).
10. **Board:** Bubble Craps, device-local, Regular and Crapless boards, This week + All time, top 10 each.
    - The week resets **Monday 12:00 AM device local time**; a hand belongs to the week its seven-out landed in.
    - **Ties:** longer hand → more points made → earlier finish.
    - **Optional initials** (rev 10, Design Desk): 1–3 letters A–Z, device-only. Asked once, when your first hand makes a top 10, then remembered as the default. SKIP = blank, shown "—". Editable in Settings, with a basic profanity blocklist.
    - Full spec and entry data model: `badges-bubble.md` §6.2.

**Pinned on ALL THREE screens (never scrolls away, never hidden by a swipe):**
- **Bubble Craps:** **ROLL**, **PRESS**, **POWER PRESS**, the **chip rack ($1 / $5 / $25 / $100 / $500)**, and the **bankroll bar** (Practice chips · On table).
- **Table Craps:** **SHOOT**, the **chip rack ($1 / $5 / $25 / $100 / $500)**, and the **bankroll bar** (Practice chips · On table).
- On the right Dice screen the chip rack can shrink to a compact row, but it stays visible and tappable.

**Navigation:**
- **Swipe** left/right between the three screens (snap, no free scroll).
- **3 dot indicators** (Side bets · Board · Dice) sit just above the bottom dock. **Tap a dot** to jump.
- **Always visible on every screen:** the top HUD with **Practice chips (bankroll)** and **On table (active bet total)**, the point puck, the Billy Tips pill, and the FAIR shortcut. Also the bottom **dock**.
- **The dock (every screen):**
  - **Bubble Craps:** **ROLL** (with the auto-roll countdown ring, and a RESUME chip when it's paused, only if auto-roll is on; A1.5a), with **PRESS** and **POWER PRESS** beside it, matching mockup round 7. The keys are greyed out with the reason when they don't apply (A1.4a).
  - **Table Craps:** **SHOOT**. On the left or middle screen it slides to the right screen and starts the pick/set/throw flow, because the shooter has to throw there. In multiplayer it's only active for the current shooter; other players see "Waiting for Ana".
- **Mini roll-result toast** when you're not on the right screen. It sits under the HUD for 2.5 s and shows the pip dice, the total badge and your net (`[pips][pips] 8 · Hard 8 · +$27`, S4.2). Tap it to jump to the Dice screen.
  - The roll itself never forces a jump. Exception: Table Craps jumps to the right screen when it's your throw.
- **Settings → "Show the dice on each roll"** (default Off): Bubble Craps then auto-jumps to the hood for every roll and back to where you were after it settles.
- **Reduced motion:** page changes cross-fade instead of sliding.

**Orientation (replaces the old defaults):**
- **This replaces** App 1's current two-pane **Felt | Bubble** pager, where phone portrait defaulted to the bubble and phone landscape to the felt.
- **Portrait (phones):** three full-width pages, landing on **Board**.
- **Landscape phones** (short height, ≤ 500 px):
  - three full-width pages, landing on **Board**;
  - the board can use the existing pan/zoom view (Fit toggle), and the right-edge swipe strip still changes page in zoom view;
  - **rotating keeps you on the current screen** (no snap to an orientation default).
- **Wide landscape** (tablets, desktop, ≥ 900 px wide):
  - **Board and Dice side by side** (about 62 / 38), with the side bets as a slide-over panel from the left edge (left dot, or swipe right from the edge);
  - at ≥ 1,400 px all three show as columns, and the dots hide.
- **Table Craps** has no pager today. Its tabs Dice / Strategy / Simulator / Session / Table (`table.html:78-82`) and the short-landscape side sheet (`js/table-app.js:1014-1030`) become:
  - the three screens;
  - plus the keys **Bets · Strategies · Tutor · Stats**, which open sheets over the current screen (mockup 02).
- **Code change** (none made): see Code changes, "Three-screen pager".

**Multiplayer (Table Craps, pass-and-play turn):**
- **Left:** the active player's own Repeaters, Hops and Fire Bet, in their seat color. Small "others" chips show totals only (e.g. "Ben: Fire $1").
- **Middle:** the full felt, with every player's chips in seat colors. Only the active player's chips can be edited. There's an "Ana's turn to bet · Done" banner and a timer ring.
- **Right:** the shooter's screen.
  - On the shooter's throw turn, the device opens here automatically ("Pass to Ana: your throw"), with the Fire rail and Blazing meter for this shooter.
  - Between turns it shows the last roll and per-player settlement toasts.
- **The HUD shows the active player's** bankroll and On-table total. The dots and swipe work the same.

### S4.2 Dice readouts: pip faces, not "6+4 = 10" (both apps; Bill, rev 13a)
**Rule:** every place that reports a roll shows **two small die faces with real pip layouts**, die 1 then die 2 in the order rolled, followed by the **total as a number badge**. Example: `[⚃][⚂] 7`.
- **Tags** go after the badge:
  - **Hard N** on a double 4/6/8/10 (gold tag);
  - **Easy N** is optional on a non-double 4/6/8/10 (dealer call text only);
  - a **7** badge is red, and a seven-out adds the "SEVEN OUT" tag.
- The dealer call words (EASY EIGHT, YO, MIDNIGHT…) can still follow, e.g. pips + `8` + "EASY EIGHT, MARK IT". But **no "n+m = total", "n·m", "n–m" or "n-m (total)" text format** is used anywhere for a roll.
- Bet names and labels aren't roll readouts and keep their text: the hop names "1-1 … 6-6" (their tiles already show mini dice), "Horn 2·3·11·12", and "4·5·6 PTS".

**Where, and at what size** (CSS px, square die; "badge" = the total badge height):

| Context | App | Die size | Badge | Notes |
|---|---|---|---|---|
| Dice screen result line (under the 3D dice in the dome / hood; Table Craps shooter screen) | Both | **32** | 28 | Then the call, e.g. "HARD EIGHT". Replaces "5·3 · EASY EIGHT". |
| Mini roll-result toast / roll banner (S4.1, off the Dice screen; Table Craps roll banner) | Both | **24** | 22 | `[pips][pips] 8 · Hard 8 · +$27`. Replaces "4·4 HARD 8 · +$27". |
| HUD last roll (and the Bet Panel LED "last roll") | Both | **16** | 16 | Replaces the LED's `d1·d2` text. |
| **Last 20** strip (Fair Dice) and the dome's recent-roll strip | Both | **14** (minimum) | 11 px text under the pair | See "Tight space". |
| Fair Dice **roll history list** (scrolling list: roll #, time, dice, total, result) | Both | **20** | 18 | New row type in S5.2. |
| Leaderboard / record card: the **seven-out roll** | App 1 (and App 2 later) | **20** | 18, red | "Ended on [⚂][⚃] 7 · seven out". Needs `sevenOutDice` on the entry (`badges-bubble.md` §6.2). |
| Tutor callouts and coach bubbles that cite a roll | Both | **18** inline (cap height of the text line) | 16 | e.g. "That [⚃][⚃] 8 is a **Hard 8**: Hard 8 pays 9 to 1." |
| Multiplayer **turn log** (Table Craps) | App 2 | **16** | 16 | One line per roll: shooter initials + pips + badge + narrative. |
| Hop tiles (already mini dice) | Both | 14 | — | Unchanged; same component. |

**Tight space (Last 20):**
- **Minimum pip-die size is 14 px** (pip ≈ 2.7 px, never under 2.5 px).
- One entry = a 30 × 30 tile: two 14 px dice with a 2 px gap, and the total (11 px, bold) under them.
- **Fair Dice Last 20** wraps to **2 rows of 10** (10 × 36 px = 360 px, which fits a 390 px phone with 15 px margins).
- The **dome strip** shows the last **10** in one row.
- Styling: a 7 gets a red tile ring with a white total; the latest roll gets a gold outline.
- **Fallback** when the strip's width is under 340 px, or text zoom is ≥ 130%, or in short landscape:
  - total-only chips as today (7s red), with a small gold dot on doubles;
  - tapping the strip opens a **Last 20 sheet** with the full 20 px pip dice;
  - accessibility labels are the same in both forms.

**Pip layout per face** (3 × 3 grid at 25 / 50 / 75% of the face, the same as the 3D faces `assets/dice/faces/face-1…6.svg`: x 27 / 50 / 73, y 25 / 50 / 75 on a 100 grid):
- **1:** center.
- **2:** top-left, bottom-right.
- **3:** top-left, center, bottom-right.
- **4:** four corners.
- **5:** four corners + center.
- **6:** two vertical columns of three (left and right; middle row = 27/50 and 73/50).
- The orientation is fixed and upright, the same as the face art the 3D rest pose shows "pips upright" (`css/dice-cube.css:23-29`). No random rotation.

**Style** (matches the 3D dice):
- **Face:** ivory radial gradient #FFFFFF → #FAF7F0 → #E6DFD0, corner radius 16%, 1 px rgba(0,0,0,.08) inner stroke, and a soft drop shadow at ≥ 20 px only.
- **Pips:** dark radial #3A3D44 → #0B0C0F, diameter 19% of the face.
- **Build:** use the six face SVGs as one inline **SVG sprite** (`<use href="#face-N">`) so every size matches exactly.
  - This also fixes a build mismatch: `css/app.css:500` paints red pips (#ff6a58 → #a10e0e), later overridden to flat #15171c (`css/app.css:1249`).
- **Hard tag:** gold #FFD36A text on #3A2A00, "Hard 8". The 7 badge is red (#c21f2e, the existing `.rchip.seven`).

**Accessibility:**
- The pair + badge is one element with `role="img"` and `aria-label` "**six and four, ten**" (die 1 first, as rolled). The die SVGs are `aria-hidden`.
- Label variants:
  - doubles: "four and four, hard eight";
  - 2 / 12: "one and one, two" / "six and six, twelve";
  - seven-out: "three and four, seven, seven out";
  - when the call is shown, "five and three, easy eight".
- The roll toast and banner announce the label through a polite live region. Strip items are list items labelled "Roll 14: six and four, ten".
- Pips are never the only signal: the number badge is always present (except in the fallback, where the total chip is present).
- Contrast: dark pips on ivory are well above 7:1.

**Same values as the engine and the 3D dice (ties to the run 8 render-vs-engine fix):**
- There's **one source per roll**: the settled roll `{ d1, d2, total, hard }` from the engine (`rollCaption`, `js/engine.mjs:344-364`; the history entry `js/engine.mjs:1562`).
- The 3D dice rest pose (`data-face`, run 8 commit `4cee298` "Match settled dice to the top faces") and every pip readout render from that object through one helper, `diceReadout(d1, d2, size, opts)`.
- Nothing re-derives faces from the total (a 10 is never drawn as "5+5" by default), sorts the dice, or uses a second random draw. Die 1 is always the left 3D die and die 2 the right.
- **Test:** for all 36 (d1, d2) pairs, the 3D top face, toast, HUD, strip, history row and CSV `die1` / `die2` agree.
- **The CSV stays numeric** (`die1`, `die2`, `total`, `is_double`; S5.4). Exports never contain glyphs or images.

### S4.3 Point-made celebration (both apps; must-have; Bill via Chief, Oct 12, rev 15a)

**When it fires (only this):** the shooter **makes the point**, i.e. a **Pass-line point win** (the point number rolls before a 7). In Bubble Craps the player is the shooter; in Table Craps it's the current shooter, in single player or multiplayer. Crapless (Bubble): a made point on 2, 3, 11 or 12 counts too.

| Roll | Celebration? |
|---|---|
| Point made | **Yes**, the tier below |
| Come-out natural 7 / 11 | **No** (normal payout pulse) |
| Come or Place / Buy win, a hardway, a prop, a Repeater, ATS, HWAD | **No.** They keep the normal payout pulse, so the moment stays special |
| Seven-out, come-out craps, point set, no decision | **No** |

**Full or quiet:**
- **Full** when the player had a **Pass-line bet working** on that point (multiplayer: see the Multiplayer note below).
- **Quiet** when the player had **no Pass bet** (no bet, Don't Pass only, or only other bets). Quiet = Dealer Billy's call in a small banner, a soft chime, **no confetti, no haptics**, ≤ 1.2 s. It still counts toward the tier.

**Tiers** (counted from `hand.points` after the roll, which already exists in the engine):

| Tier | Trigger | Dealer Billy calls | Bubbles Billie reacts | Look | Length (max) |
|---|---|---|---|---|---|
| **Base** | 1st point made in this hand | "Six! The point is made. Pass line wins." | "Yesss!" | Gold stamp "POINT MADE", one confetti burst | 1.6 s |
| **Big** | 2nd point made in the same hand | "Nine! Two points this hand." | "Two for two!" | Bigger stamp, two bursts, a short chime run | 2.0 s |
| **Huge** | 3rd or later point in the same hand, **or** the Blazing meter is at **Blazing** after this roll (S6; only when the meter is on) | "Ten! Three points this hand. What a roll." | "What a hand!" | Full stamp, sunburst, three bursts | 2.5 s |
| **+ Fire Bet stinger** (Table Craps only) | This point is the **4th, 5th or 6th unique** point on the Fire rail (A2.2a) | 4: "Fire Bet: 4 points! Pays 24 to 1 at the seven-out." 5: "Fire Bet: 5 points! Pays 249 to 1 at the seven-out." 6: "Fire Bet: all six! +$999 per $1. Paid now." (amounts follow the active Fire pay table) | — | The Fire rail markers flash in their own Fire colors (never the Blazing meter's colors or motion, A2.2a) | Inside the same 2.5 s |

- The number word follows the dice readout (S4.2), e.g. "Hard eight! The point is made."
- A 4th unique Fire point means 4+ points this hand, so the stinger always rides on a **Huge**. It **replaces** the separate Fire Bet toast for points 4–6 (no double message). If the player has no Fire Bet, the stinger uses the line "Fire rail: 4 points." with no pay copy.
- The win amount (if the player had a Pass bet) shows on the stamp as "+$30" with "PRACTICE CHIPS". The quiet version shows no amount.

**Voices (both apps):** Dealer Billy calls the point; Bubbles Billie reacts with a cheer only (A2.4 voice rule). Neither ever gives bet advice here.

**Sound and haptics:**
- Sound: Base = the existing `audio.win()`, Big = `win()` + a second run, Huge = a longer fanfare (≤ 2.0 s). Quiet = one soft chime. All obey Settings › Sound (`A.setMuted`).
- Haptics (Settings › Haptics, existing): Base `[15]`, Big `[15, 40, 15]`, Huge `[20, 40, 20, 40, 30]`. Quiet: none.

**Timing (never in the way; the R10-2 lesson):**
- **Total length ≤ 2.5 s,** stinger included. It ends on its own.
- **Tap anywhere to skip.** The tap also does what it would normally do (the overlay is non-modal, `pointer-events: none` except the stamp, which skips on tap).
- **It never blocks or delays the next roll.** ROLL, the dock and the bet spots stay live the whole time. Auto-roll timing is unchanged (no extra wait).
- **It clears the moment a roll starts** (the same `clearWin()` call at the top of `doRoll`), including a swipe roll, a keyboard roll and an auto-roll. Nothing from the last point stays on screen.
- **One at a time:** a new point celebration replaces any that's still showing.
- **Big Win on the same roll:** the point-made celebration takes over and shows the BIG WIN amount on its stamp; the separate BIG WIN overlay doesn't also fire (Bubble's `isBigWin`). Big Wins on other rolls are unchanged.
- **Badge toasts** queue behind it (Bubble's `badgeQueue`), as today.

**Settings:**
- **Reduce motion** (Settings, plus the OS setting; `motionOff()`): no confetti, sunburst or stack bounce; the stamp fades in and out (≤ 1.2 s), and the words, sound and haptics stay.
- **Sound:** off = silent, everything else unchanged.
- *(Bill listed these two; there's no separate "celebrations off" switch. Haptics keep their existing setting.)*

**Responsible-gaming copy (both apps):**
- Celebrate the moment, **never the next bet**. Banned in every celebration string: "bet more", "press", "let it ride", "keep it going", "you're due", "hot dice", "can't lose", "on fire" (the Blazing meter / Fire Bet split, A2.2a).
- The Tutor never follows a celebration with a bigger-bet suggestion. Strategy auto-presses (A1.7 / A2.4) still happen only because the strategy says so, never because of a celebration.
- **Accessibility:** one polite announcement ("Point made, six. Pass line wins 30 dollars in practice chips."), never repeated; the stamp text meets contrast; nothing flashes more than 3 times a second.

**Multiplayer (Table Craps, A2.7):** one celebration for the table. **Full** if any seated player had a Pass bet on that point, otherwise quiet. Each seat's win shows as its own payout pulse on its chips; the stamp shows no single amount.

**Build note:** Bubble Craps has the plumbing (`showBigWin`, `clearWin`, `celeTimer`, `burstChips`, `haptic`, `audio.win`, Billie winner art). The point-made trigger, tiers, quiet version and stinger are new. Bubble items are on the **Bubble leftover / run-16 list** (End matter); Table items are in `table-craps-build-checklist.md` §16.

### S4.5 Craps Lingo (both apps; Bill, Oct 12, rev 15d; term list in `craps-lingo.md`, data in `lingo.json`)
*(S4.4, the PSO animation, is in the rev 15c entry at the end of this spec.)*

**What it is:** a searchable glossary of real craps table slang and dealer calls, taught by **Dealer Billy** (Bubbles Billie doesn't appear). **79 terms** in four categories: Dice calls 21 · Bets 26 · Actions 14 · Table talk 18. **Table Craps lists all 79; Bubble Craps lists 78**, because the Fire Bet is Table only and the word "Fire" is banned in Bubble copy (S6 caution 5). Content lives in one shared data file, `lingo.json`. Lingo is **free** in both apps (not Premium).

**The term card** (one component, both apps):
- Term and aliases, the **tag chip** (Both apps · Both apps, not in Crapless · Table Craps · Live table; `craps-lingo.md` §1), and the plain meaning.
- The **example call** in Billy's voice, with a **"Say it"** hint where the term isn't obvious ("yoh-LEV-en").
- Dice terms show their pairs with the S4.2 pip component (18 px), never "5+6" text.
- The **app note** for the current app and mode (e.g. Bubble Crapless: "Not in Crapless: there's no Don't side"; Bubble `lay`: "Bubble's LAY tab is lay odds on a Don't bet, not a Lay bet").
- **Show me on the board** when the term links to a spot that exists in this app and mode (H4), Related terms as chips, and the etiquette tip it ties to (opens that tip card, `etiquette-guide.md` H1).
- Footer: "Every casino says it a little differently. When in doubt, ask the dealer."

**Hooks:**

| Hook | What it does | Both apps? |
|---|---|---|
| **H1. Lingo screen** | A **"Craps Lingo"** row on the **Learn** tab and a **Lingo** item in the main menu (beside Badges). Search field on top, one chip row **All · Dice · Bets · Actions · Table** with counts, then the list (Dice calls by total 2 → 12, the others A–Z). A **Recent calls** strip (the last 5 roll calls this session) sits above the list when there are any. | Yes |
| **H2. Long-press a bet** | Opens that spot's **spot sheet**, with its lingo card on top (gesture rules below). | Yes |
| **H3. Tappable roll calls** | Billy's call words on the result line ("YO-LEVEN", "EASY EIGHT", "SEVEN OUT, LINE AWAY") open their term. **Never blocks a roll or delays the dice** (rules below). | Yes |
| **H4. Show me on the board** | From a card: go to Play, page to the spot's screen (Board or Side bets), highlight the spot and open its **Tutor line** (coach bubble). | Yes |
| **H5. Badge "Talk the Talk"** | **Silver**, for opening **25 distinct terms**. Bubble **#32** `talk_the_talk`; Table: on its badge list after Table Manners. | Yes |

**Search (H1):** fuzzy, local and instant. Normalize case, accents, punctuation and "&"; digits = number words ("9" = "nine"). Match order: exact term or alias → prefix → word match → **same dice total** as an exact hit (so **"nina" finds Nina from Pasadena and Center field nine**) → typo fallback ("whril" finds World / Whirl) shown under "Did you mean". Fixtures and the full rules: `craps-lingo.md` §5. Results update as you type, with no network. Empty state: "No match. Try 'field', 'hardways' or a number like '8'."

**H2 gesture rules (checked against the spec and Bubble `bb-bc-yrkv` @ `51c229b`):**

What already exists:
- **Tap a spot** places a chip (Bubble `onClick` → `addBet`; on the Side-bets screen a tap focuses the tile, then Add a chip / Take down).
- **Swipe / drag** changes pages from 12 px of horizontal movement (`resolveSwipe`; a moved swipe sets `swallowClick`). The zoom view also pans.
- **Long-press** already has these meanings in the spec. None is in the Bubble code yet: there's no long-press handler at `51c229b`.
  - ATS spots: the take-down control "shows on long-press or in the bet drawer" (S1.6 UI).
  - Multiplayer: long-press a spot to see whose chips are on it, e.g. "Ana $10 · Ben $5" (A2.7.6).
  - The BILLY'S WAY key: a preview sheet (A1.4 UI).
  - The Table chip rail: the "Your chips" sheet (A2.2b.3).
  - The Strategy Comparison chart: a roll tooltip (appendix §3.2).
- The Tutor coach bubble has **Got it / Why? / Mute this tip**. There's no on-demand Tutor gesture on a spot today.

**Conflict:** a lingo card on long-press would collide with the ATS take-down and the multiplayer owners view on the same spots.

**Resolution: one long-press, one spot sheet.** Long-pressing any bet spot opens a single **spot sheet** with these sections in order:
1. **Lingo card** for that spot (H2's job).
2. **Tutor line:** the same line the coach bubble would show for this spot on the current track (Beginner if Billy Tips is off), with **Why?**.
3. **Your bet:** your stake and **Take down** when that bet allows it. This is where S1.6's long-press take-down now lives, for ATS and every other spot that can come down. The bet drawer keeps its own Take down.
4. **On this spot (multiplayer):** "Ana $10 · Ben $5" (A2.7.6). Only the active player's own chips show a Take down.

Nothing that long-press did before is lost, and there's still only one long-press meaning on a bet.

**Other long-press targets don't change:**
- **BILLY'S WAY key:** keeps its preview sheet. It's a key, not a bet, so it gets no card, but the sheet footer adds a link to the **Across** term.
- **Chip rail:** keeps "Your chips"; the footer links **Color up** and **Check change**.
- **Comparison chart:** keeps its tooltip.
- **No long-press at all** on ROLL, SHOOT, PRESS, POWER PRESS or anything else in the dock, so those keys never wait on a hold timer.

**Timing and input:**
- The hold is **500 ms** with **< 10 px** of movement. That's under the 12 px swipe threshold, so any swipe or pan cancels the hold first.
- **Taps aren't delayed:** a tap still places its chip on release, as today. The hold is detected by a timer while the finger is down.
- When the sheet opens, a tick haptic plays (it follows Settings › Haptics) and `swallowClick` is set, so the release **doesn't place a chip**.
- Stop the browser's own long-press on spots: `contextmenu` `preventDefault`, `-webkit-touch-callout: none`, `user-select: none`.
- **Long-press works any time,** including while the dice roll. The sheet is read-only except Take down, which follows the bet's normal rules (bets are locked while the dice are out).

**H3 tappable roll calls (never blocks a roll or delays the dice):**
- **Where:** the call words on the **Dice-screen result line** (both apps; the Table shooter screen) and the Recent calls strip. **Not** inside these, which keep their single tap meaning:
  - the mini roll-result toast (tap = jump to the Dice screen, S4.1);
  - the point-made celebration and the PSO overlay (tap = skip, S4.3 / S4.4);
  - the multiplayer turn log (later).
  Once an overlay clears, the result line under it still carries the tappable call (e.g. the "SEVEN OUT" tag opens `seven_out`).
- **Which term:** resolved from the settled roll object `{ d1, d2, total, hard, phaseBefore, result }` through `callMap` in `lingo.json` (`craps-lingo.md` §4), never by parsing the text. Design Desk's `call_*` IDs map the same way.
- **No cost to the roll:**
  - the link renders in the same frame as the result line, from a map lookup that's already in memory (no fetch, no `await`, no added animation);
  - if a call can't be resolved, it shows as plain text;
  - while the dice tumble, the previous call is already cleared, so there's nothing to tap.
- **Tap target:**
  - the call words, with a dotted underline and a ≥ 44 pt hit area;
  - **never overlapping ROLL / SHOOT or the dock** (≥ 8 px gap);
  - taps on the dome or the dice open nothing.
- **It opens a peek card:** the same card, compact and non-modal.
  - It sits above the dock, at ≤ 45% of the viewport height at 320 × 568; in short landscape it's a side panel that leaves the dice and the dock clear.
  - **ROLL / SHOOT stay live**, and the peek **doesn't hold auto-roll** (an exception to A1.5a's "any sheet or overlay" hold, so a curious tap never stalls the dice).
  - It doesn't pause the multiplayer betting timer (T-26).
  - **The peek closes when the next roll starts** (the same `clearWin()` path at the top of `doRoll` / the throw start), and the term stays in Recent calls.
  - "Open full card" moves it to the Lingo screen, which is a normal sheet and holds auto-roll like the Tutor card.
- **Setting:** Settings › "Lingo links on roll calls", default **On**. When it's off, the calls are plain text.

**H4 Show me on the board:**
- **The highlight:** two gold pulses over 1.2 s, then a static outline until the next tap. With reduce motion, a static outline for 1.5 s.
- **The coach bubble** opens with the spot's Tutor line for the current track. If Billy Tips is off, it uses Beginner and doesn't turn Tutor on. Asking for it overrides "Mute this tip" for that one view.
- **It never places a bet** or changes the selected chip. In Table Craps it waits until the dice settle if a throw is in progress.
- **Spots that don't exist in this app or mode:** the button is disabled and gives the reason, e.g. "Not on the board in Crapless" (Don't spots, the LAY tab) or "Big 6/8 is off. Turn it on with the board toggle." (Table).
- **Controls, not bets:** `ui:*` targets highlight a control: the puck, the PRESS key, BETS OFF, the LAY tab, the chip rail.
- **Auto-roll:** a sheet holds it as in A1.5a; arriving on Play with the coach bubble open counts as a Tutor card.

**H5 badge:** opening a term counts when its full card was on screen for ≥ 2 s, or the screen reader reached its end. Any entry counts: Lingo screen, long-press, roll call. Search rows don't.
- Each term counts once, ever, and Reset bankroll keeps the count.
- It's never from a bet or roll. Progress (x/25) is shown only on the Badges screen; Lingo rows show a quiet "seen" tick, with no counter and no "almost there" copy.
- **Why Silver:** `badges-bubble.md` tiers give Bronze to first-time actions (Table Manners, one deck viewed once) and Silver to short collections. 25 of 78–79 terms is a short collection.
- **The quiz option wasn't picked.** It needs new quiz content and scoring, and it can be failed.
- Bubble counts after the build: **32 badges**, 8 Bronze · 10 Silver · 9 Gold · 5 Legendary.

**Copy rules:**
- The S6, RT-22 and S4.3 banned-word lists apply to every Lingo string, plus the word "Fire" in Bubble.
- Billy's calls describe; they never pitch a bet. "Press it" is defined with its risk ("More is at risk on a 7; the edge per bet doesn't change").
- **No tip bet exists in either app:** `toke` is live-table slang and says so. `comp` says the apps have no comps, rewards or prizes. "Cash out" is never used.
- App facts stay true:
  - no $10 chip;
  - Billy's Way is Bubble only;
  - Lay bets and their commission are Table only;
  - Buy commission (5% on wins) is in both apps (A1.2, A2.2);
  - Bubble's LAY tab means lay odds;
  - hardways work on the come-out by default in both apps, and the card says many casinos have them off.

**Accessibility:**
- Every list row and card has a screen-reader label from `srLabel` ("C and E: craps and eleven", "P S O: point, seven out").
- Abbreviations are expanded, the "Say it" hint is read as words, and dice pairs read as in S4.2 ("five and six, eleven").
- **Long-press alternatives:**
  - VoiceOver / TalkBack double-tap-and-hold passes through as the long-press;
  - every bet spot also has a custom action, **"Lingo"**;
  - the keyboard opens it with the context-menu key, Shift+F10 or **L** on a focused spot;
  - the spot's hint reads "Long-press for lingo."
- **Roll calls:** a tappable call is a button ("Yo-leven. Open in Lingo.") after the roll's existing polite announcement. It never takes focus by itself.
- Search announces "3 results" politely. Focus goes to the card's heading on open and returns to its origin on close.
- Tap targets are ≥ 44 pt, contrast is AA, and reduce motion applies.

**Fit at 320 px (320 × 568 through 430 × 932, landscape, and 130% text):**
- **Rows:** ≥ 56 px tall. Term on line 1; meaning clamped to one line with the tag chip right-aligned.
- **Chips:** the row fits All · Dice · Bets · Actions · Table at 320 px, and scrolls sideways at 130% text.
- **Search field:** full width, 44 px.
- **The full card:** ≤ 85% height, scrolls inside, and never clips.
- **The peek:** within its 45%, never covering the dice result or the dock.

**Works offline:**
- `lingo.json` ships in the app package and the service-worker precache. It's parsed once at startup and searched in memory.
- Cards, search, links, highlights, the badge and the call map make no network requests (tested in airplane mode).
- Content updates ship with app updates (`version` field).

**Shared data (S7):** one `lingo.json` for both apps, part of shared package 5 (Tutor framework).
- Each app filters by `apps`, then reads `link[app]`, `notes`, `tag` and (Bubble) `callBubble`.
- The Bubble bundle is built **without** `apps: ["table"]` terms.
- Link values use the engine's `describeSpot` kinds (`hop:5-6`, `hardway:8`, `place:6`, `any7`, …). Table adds `lay:N`, `big:N`, `fire` and `ui:rail`.

**Build items:** Table: `table-craps-build-checklist.md` §19 (LG-01 to LG-18) and RT-33 to RT-37. Bubble: End matter, Bubble leftover / run-16 list (BL16-30 to BL16-42).

## S5. Fair Dice tab (both apps)

**Purpose:** show, in plain words, that the dice are fair and random, and teach that **dice have no memory**. Same tab in both apps (mockups: App 1 `06-fair-dice`, App 2 `06-fair-dice`). App 2 adds rolls per seven (RSR) and dice-set context.

*(Rev 16: Fair Dice shows **only the app's rolls**. Rolls entered in Your Dice mode (S9) never reach the Fair Dice log, any card, any scope or the CSV (exclusion X2). The tab gets a link: "Roll your own dice instead" → Your Dice.)*

### S5.1 How the dice work (checked against the code)
- **Results:**
  - Each die is an independent fair 1–6 drawn from the browser's **secure random generator** (`crypto.getRandomValues`), one 32-bit value per die.
  - Values at or above the largest multiple of 6 are thrown away and redrawn ("rejection sampling"), so all six faces are exactly equally likely (no modulo bias).
  - Code: `rollDie` / `rollDice`, `js/engine.js:1193-1234`.
  - App 2 uses the same function (`rollFair` calls `Bubble.rollDie`, `js/table-engine.js:1125-1146`).
- **Fallback:** if secure random isn't available, the code falls back to `Math.random()` (`js/engine.js:1227`). Fair Dice must show an **"RNG: secure"** status, and switch to **"RNG: basic (fallback)"** with a note if the fallback is ever used. This needs a code change to report it.
- **Animation is not the result.**
  - The tumbling frames use `Math.random()` for looks only (`js/dice.js:71-72`). The final faces always come from the roll result (`js/dice.js:76-77`).
  - In App 2, the throw animation picks a die orientation that shows the already-decided top face (`js/table-app.js:531-541`). **The throw meter and the dice set never change the result** in Standard.
- **No skill simulation (rev 15a, Bill):** App 2 has no setting that changes a roll. The old repo's `influence` / `srr` modes (`js/table-engine.js:1162-1208`) are not carried into the build (Rule 0).
- **Plain-words card:**
  - "Every roll uses your device's secure random generator. Each die is a fair 1 to 6, and the two dice are independent. Nothing on this screen, not your bets, your streak, the Blazing meter, or your dice set, can change the next roll."
  - App 2 adds: "...and that includes your dice set, your grip and your throw."
  - **Rev 15a:** lead the card with the Rule 0 line: "**Real dice, real odds.** Every roll is two fair, independent dice from your device's secure random generator, so a 7 comes up 6 times in 36, every roll. Nothing (your bets, your streak, your dice set, badges or Premium) can change a roll."

### S5.2 What it shows
| Card | Content | Notes |
|---|---|---|
| **Header badge** | "Within normal range" / "A bit unusual" / "Rare result" (from S5.3) | Neutral wording only; never "the dice are due". |
| **Scope tabs** | This session · Last 100 · All time | Same as the mockups. All time = every roll stored on this device for this app. |
| **Roll totals: actual vs expected** | Bars for 2–12 with counts, an expected-count dot line, and labels 1/36…6/36 | Expected % per total: 2.78, 5.56, 8.33, 11.11, 13.89, **16.67 (7)**, 13.89, 11.11, 8.33, 5.56, 2.78. |
| **Sevens rolled** | Actual % vs **16.67% (1 in 6)**, with a "normal range" band | Band = expected ± 2 standard deviations = 16.67% ± 2·√(0.1667·0.8333 ÷ n). For 1,000 rolls that's **14.3%–19.0%** (the mockup's 14.4–19.0 is fine). |
| **Fairness test** | χ² value, df, p-value, and the plain readout (S5.3) | Needs ≥ 180 rolls; before that, show "Roll 180 times for a fair test (now 63)". |
| **Each die** (expand) | Face counts 1–6 for die 1 and die 2 vs 16.67% each, with a χ² (5 df) per die | Catches a "stuck" die that totals alone can hide. |
| **Hard vs easy** | Doubles rate vs **16.67%** (6/36), and hard 4/6/8/10 vs 1/36 each | Useful for Hard Way All Day players. |
| **Streaks** | Longest run without a 7, longest hand (rolls to seven-out), most times one number repeated in a hand, current run | Caption: "Streaks like this are normal with random dice." |
| **Last 20 rolls** | Pip-dice tiles (two 14 px dice + total), 2 rows of 10; 7s in red (S4.2) | Fallback: total chips + a doubles dot, tap for the full sheet |
| **Roll history list** (rev 13a) | Scrolling list per scope: roll #, local time, 20 px pip dice, total badge, Hard tag, line result | Virtualized; the same data as the CSV |
| **Above / below expected** | Biggest positive and negative difference (for example "5: +7 vs expected · 11: −9") | **Rename the mockup's "Hot / Cold"** (mockup conflict 5). |
| **App 2 only** | **RSR (rolls per seven)** vs random 6.0, and RSR by dice set (3V, 2V, and so on) | Caption: "Your RSR is what random dice give. Setting is practice only." |
| **Export CSV** | Premium lock on Standard | S5.4 |
| **Billy tip** | "Each die is a fair 1–6 from a secure random generator. No 'due' numbers." | Same as the mockup. |

### S5.3 Fairness readout in plain words
- **Test:** Pearson χ² on the 11 totals. Expected count = n × (ways ÷ 36). df = 10.
- Show χ² and p, and **lead with the words**:
  - **p ≥ 0.05:** "**Looks fair.** These results are well within what random dice produce."
  - **0.01 ≤ p < 0.05:** "**A bit unusual, still normal.** Random dice land here about 1 session in 20. Keep rolling."
  - **p < 0.01:** "**Rare, but it happens.** Random dice land here about 1 time in 100. Over many more rolls, the percentages usually settle toward expected. The dice don't 'catch up'; the early swing just gets diluted."
  - **p < 0.001 on All time with ≥ 5,000 rolls:** add "If this keeps happening, tell us." That opens a feedback form with a summary only.
- **Never** show "rigged", "hot dice", "cold dice" or "due".
- **Why?** link: "χ² compares what you rolled to what fair dice should roll. A small number means close. With 10 categories, values up to about 18 are normal 95% of the time."
- Critical values for reference: 18.31 (p = 0.05), 23.21 (p = 0.01), 10 df.

### S5.4 CSV export (PREMIUM)
- **Standard:** "Export CSV" shows a Premium lock, and the history can only be viewed in the app.
- **Premium:** the export sheet offers scope (This session / Last 100 / All time / date range), and file names like `billy-bubs-bubble-craps_rolls_2026-10-10.csv` / `billy-bubs-table-craps_rolls_2026-10-10.csv`.
- Format: UTF-8, comma-separated, with a header row and ISO 8601 times.

| Column | Example | Notes |
|---|---|---|
| `app` | `bubble-craps` / `table-craps` | — |
| `app_version` | `1.0.0` | — |
| `session_id` | `s-20261010-1634-7f3a` | Local, random |
| `roll_id` | `1042` | All-time sequence number on this device |
| `session_roll_no` | `17` | Roll # within the session |
| `timestamp_local` | `2026-10-10T16:34:05-07:00` | With offset |
| `timestamp_utc` | `2026-10-10T23:34:05Z` | — |
| `die1`, `die2` | `4`, `4` | 1–6 |
| `total` | `8` | 2–12 |
| `is_double` | `true` | die1 = die2 |
| `hard_easy` | `hard` / `easy` / `n/a` | Hard/easy only for 4, 6, 8, 10; `n/a` otherwise |
| `mode` | `regular` / `crapless` | App 2 is always `regular` |
| `rule_preset` | `standard` / `strip-classic` / `custom:Strat 10x` | Active rules |
| `phase_before` | `come-out` / `point` | Game state before the roll |
| `point_before` | `6` or blank | — |
| `roll_result` | `natural` / `craps` / `point-set` / `point-made` / `seven-out` / `no-decision` | Line outcome. Crapless has no `craps` |
| `point_after` | `6` or blank | — |
| `hand_no` | `5` | Hands end at a seven-out |
| `roll_in_hand` | `9` | — |
| `shooter` | `machine` (App 1) / player name (App 2) | — |
| `seat_no` | blank / `1`–`6` | App 2 multiplayer |
| `dice_source` | `rng-secure` | Production has no fallback and no simulation (Rule 0, rev 15a) |
| `dice_set` | `3V` / `2V` / `straight-hardway` / `all-sevens` / `none` | App 2 only |
| `throw_power` | `0.52` | App 2 only, 0–1 |
| `no_roll` | `false` | App 2 practice no-roll (dice didn't reach the back wall). No-rolls aren't counted as rolls |
| `heater_tier` | `cold` / `warm` / `hot` / `blazing` | Blazing meter tier (cosmetic, S6). Column name kept for stable exports |
| `fire_points` | `4,6,9` or blank | App 2 only: different points made this shooter (Fire Bet) |
| `heater_score` | `17` | Rolls since the last seven-out + 3 × points made (S6) |
| `player_bets_total` | `52.00` | The exporting player's chips on the felt before the roll (practice chips) |
| `player_net` | `+7.00` | That player's net for the roll (practice chips) |

- **Privacy:** the export is local only. Player names come from local seats. No account data, nothing uploaded.
- **Storage:** today the code keeps only **16** recent rolls in App 1 (`js/engine.js:833-834`) and **40** in App 2 (`js/table-engine.js:654-655`). Fair Dice needs a separate full roll log per app, capped at 100,000 rolls, with "Reset Fair Dice history" in Settings (code change).

## S6. Blazing meter (both apps; cosmetic only; formerly "Heater meter")

**What it is:** a fun "hot hand" meter in the HUD that shows how long the current hand has lasted. **It's cosmetic.** It never changes odds, payouts, bets, strategy suggestions, the auto-roll, or Tutor recommendations.

**What drives it** (current hand only). This is Design Desk's score (Section G2 / MOTION-SOUND-SPEC M21), checked here:
- **Score = rolls since the last seven-out + 3 per point made** in this hand. App 2 practice no-rolls don't count.
- A **seven-out resets it to Cold**. A come-out 7 is a line winner and **doesn't** reset it.
- It only reads the roll log. It never reads bets, bankroll or strategy state.
- **What "rolls since the last seven-out" means** is defined once, in S4.1 "Hand and Longest Roll definition (rev 9)": every roll counts, bet or no bet, Bets Off or not. The meter shows `hand.rolls` (so far). The Longest Roll board posts `hand.rolls + 1` at the seven-out. They never disagree.
- Mode switching is blocked mid-hand (`hand.rolls > 0`), so a meter reading is always for one mode. A reload resumes the meter where it was. Reset bankroll sets it to Cold.

| Tier | Score | or points made | Share of hands that reach it: Regular | Crapless |
|---|---|---|---|---|
| **Cold** | 0–3 (a fresh or short hand; also right after a seven-out) | — | 100% (every hand starts here) | 100% |
| **Warm** | ≥ 4 | — | **67.6%** (about 2 in 3) | 64.1% |
| **Hot** | ≥ 12 | — | **29.8%** (about 3 in 10) | 26.3% |
| **Blazing** | ≥ 24 | **or 4 points** | **8.6%** (about 1 in 12) | 6.7% (about 1 in 15) |

- The shares are my exact Markov calculation with random dice (Bones check, Oct 10). They're the chance that a hand reaches the tier before its seven-out.
- The average hand lasts about **8.5 rolls** in Regular ([Wizard: number of rolls](https://wizardofodds.com/games/craps/number-of-rolls/)) and about 7.9 in Crapless (my calculation).
- Crapless hands are a bit shorter, so the tiers are a bit rarer. The thresholds stay the same in both modes; it's cosmetic, so exact parity isn't needed.
- *(Rev 7, Bill: exactly four tiers. "Heater" and "On Fire" are no longer tier names. Hot moved from ≥ 9 to ≥ 12 so the three steps above Cold are spread out: about 2 in 3, 3 in 10, and 1 in 12 hands. This replaces the rev 5–6 tiers 4 / 9 / 15 / 24.)*

**Where:** a small gauge in the HUD strip ("Hand: 9 rolls · 1 point · HOT"). App 2 also shows it on the seat rail for the shooter. It's on by default and can be turned off in Settings (Settings, not Premium).

**Cautions (must follow):**
1. **No prediction.** It never says or implies a hot hand will continue or that a 7 is coming ("gambler's fallacy"). Every roll is independent, so a 7 is always 1 in 6.
2. **No influence.** It can't change odds, payouts, bet suggestions, Billy's Way, the **PRESS key** (no glow or prompt by tier), auto-press, auto-bets, strategy coach actions or Tutor nudges. Tutor never says "press because you're hot" or "back off because you're due".
3. **Tutor teaches "dice have no memory"** the first time each tier appears (Beginner and Experienced copy below).
4. **Banned words** in any Blazing meter, Fair Dice, badge or Tutor copy: "due", "overdue", "about to", "streak will", "can't lose", "lucky dice", "hot dice/cold dice", "the table is turning", and in Bubble Craps the word "Fire" / "On Fire" (a flame **glyph** is fine; see 5). Use "this hand has lasted…", "so far", "random".
5. **Naming vs the Fire Bet (decided: the meter is the "Blazing meter", and its top tier is "Blazing"; Bill, Oct 10):**
   - The tiers are exactly **Cold · Warm · Hot · Blazing** (Bill, rev 7). "Heater" and "On Fire" aren't tier names anywhere.
   - **A real Fire Bet now exists, in Table Craps only** (A2.2a). It's never in Bubble Craps (Regular or Crapless). That makes the separation matter more:
     - the Blazing meter is a meter, the Fire Bet is a bet;
     - the Blazing meter never shows point markers, the word "Fire", or Fire-rail art;
     - the Fire rail never uses the Blazing meter's gauge colors or motion.
   - The Blazing meter's "+3 per point / or 4 points" counts **all** points made, repeats included. The Fire Bet counts only **different** points. Tutor copy for the Blazing meter talks about **hand length**, never "points toward" anything.
   - **Flames and embers** (M21 icon, M22 dice heat) are fine as Blazing meter decoration, since the dice faces stay white. But never put "FIRE" text near the felt, and keep the heat effects off the bet spots and the Fire rail.
   - **Rev 10 (Bill): only the word is banned, not the flame.** The Blazing meter and the **Blazing badge** (`badges-bubble.md` #4) keep their **flame glyph**.
     - Banned in all Bubble Craps copy (meter, badges, toasts, Tutor): the **word** "Fire" and "On Fire".
     - Also banned: Fire Bet visuals (point markers, Fire-rail art).
   - Code: no Fire Bet in either app today (`/tmp/bbp`, checked Oct 10). App 2 will add one.

**Safe wording:**
| Moment | Copy |
|---|---|
| Tier up (Warm) | "Warm: this hand has lasted 4 rolls so far." |
| Tier up (Hot) | "Hot hand: {n} rolls so far. About 3 hands in 10 get this far. The next roll is still random: a 7 is 1 in 6." (Design Desk's first-Hot Tutor line, "The Blazing meter's just for show. Dice have no memory: a seven is always 1 in 6.", is also approved.) |
| Tier up (Blazing) | "Blazing: {n} rolls this hand. About 1 hand in 12 gets here. Fun to watch; it doesn't change the odds." |
| Cool-off (M21 "COOLED OFF") | "Cooled off. New hand, same odds." (Never "the table turned".) |
| Seven-out after Hot or Blazing | "That was a 14-roll hand. Long hands happen; so do quick ones. Dice have no memory." |
| Tutor Beginner (first tier) | "The Blazing meter just shows how long this hand has lasted. It can't predict the next roll. Dice have no memory." |
| Tutor Experienced | "The Blazing meter = hand length so far, not a signal. Your edge per roll is the same at roll 1 and roll 20. Size bets by your bankroll plan, not the meter." |
| Tooltip | "Cosmetic meter. It never changes odds or advice." |

## S7. Shared code (what both apps should share)

**Current repo** (read-only copy at `/tmp/bbp`, commit `6a13aff`, Oct 8, 2026, 8:39 PM PT, the same as GitHub HEAD). It's one web build today: `index.html` (bubble machine) and `table.html` (full table), with a lot already shared.

| Module today | What it does | Used by | Plan for two apps |
|---|---|---|---|
| `js/engine.js` (`CrapsEngine`) | Pure rules and state, no DOM, works in browser and Node (`js/engine.js:1-11`). Bet validation, settlement, Crapless, Buy/Place math, **`settleBonusBets`** (ATS + Hard Way All Day, `747-811`), **secure RNG** `rollDie`/`rollDice` (`1193-1234`), Billy's Way (`1290-1365`), snapshot/repeat wagers (`1236+`) | App 1 directly; App 2 through `table-engine.js` | **Shared rules core.** Split out `rng`, `bonus-bets` (ATS, Hard Way All Day, **Repeaters**), `payouts`. Billy's Way stays here, behind an App 1 flag. |
| `js/table-engine.js` (`TableEngine`) | Full table: lay bets, vig styles (`77-79`), odds presets (`144-152`), field modes (`185-190`), **edge math** (`bonusEdge` `562-623`, `placeEdge`, `fieldEdge` `625-637`), skill-sim roll control (`1173-1220`), reuses bubble bonus settlement (`854`) | App 2, simulator | **Shared rules core (table profile).** Merge with `engine.js` into one rules package with a `machine` vs `table` profile, so both apps settle bets with the same code. |
| `js/strategies.js` (`CrapsStrategies`) | Strategy library, coach/auto actions, session **simulator** (`runSim`) on `TableEngine` | App 2 today | **Shared strategy package.** Cards are tagged `app1` / `app2` / `both` and `regular` / `crapless`. The simulator runs either profile. |
| `js/sim-worker.js` | Web worker running the simulator | App 2 | Shared |
| `js/dice.js` (`CrapsDice`) | 3D die faces and roll animation, no rules | App 1 | Shared UI kit |
| `js/die-geom.js` (`DieGeom`) | Real die geometry and orientations (opposite faces sum to 7) | App 2 (dice setting) | Shared. App 1 can use it for dome dice. |
| `js/felt-pan.js` | Landscape felt pan/zoom, UI only | App 1 | Shared UI kit |
| `js/ui.js` (`CrapsUI`) | App 1 DOM and interaction; storage key `craps-practice-v5` (`js/ui.js:8, 45-69`) | App 1 | App 1 only (shell) |
| `js/table-app.js` | App 2 UI: felt, dice, themes, odds, coach, simulator; storage key `billy-bubs-table` (`11, 120, 146`) | App 2 | App 2 only (shell) |
| `css/styles.css`, `css/polish.css`, `css/polish-generated.css`, `css/table.css` | Styles and felt themes | Both | Move tokens into the shared design system (mockups `src/bb.css`) |
| `tests/table-engine.test.js` | Rules tests, including bonus bets (`465-501`) | — | Shared test suite run against both profiles |
| Mockups `src/bb.js`, `src/ui.js`, `src/felt.js`, `src/felt2.js`, `src/dome.js`, `src/live.js` | Chips, dice, mascot, LED, HUD, felt layouts, dome, shooter tray (vector/CSS) | — | Shared UI kit (`dome.js` App 1 only, `live.js` App 2 only) |

**Shared packages to build (recommended):**
1. **Rules core:** one bet catalog and settlement engine (profiles: `bubble-regular`, `bubble-crapless`, `table-regular`). It includes the bonus bets (ATS, Hard Way All Day, Repeaters) with stay-up/come-down options.
2. **Fair Dice:** `rng` (secure roll, fallback reporting), the **roll log** (per app, cap 100,000), the **stats** (counts, χ², per-die, streaks, RSR), the **CSV writer** (S5.4), and the tab UI.
3. **Edges:** house-edge calculators (per bet, per roll, blended, combined line+odds) and the **Edge Preview** component (S3). Today the edge math is split between `table-engine.js` and the strategy cards.
4. **Settings store:** one rules schema with **per-app setting lists** (A1.6, A2.3), the Standard defaults, presets (Strip Classic, Strip Deluxe, Strat 10x, Downtown 10x), Premium gating, and a migration from the two current storage keys (`craps-practice-v5`, `billy-bubs-table`).
5. **Tutor framework:** game-state machine, prompt tables by app/track/state, edge badges, the mute list, the banned-words lint (S6), and the multiplayer per-seat routing (App 2).
6. **Strategy library and simulator:** from `strategies.js`.
7. **UI kit and design system:** chips, dice, felt components, HUD, tab bar, Billy mascot, coach card.
8. **Blazing meter:** a cosmetic state plus copy; no write access to the rules core.
9. **Press helpers:** `pressLastWin(state)` and `powerPressLastWin(state)` in the rules core (A1.4a): original-bet tracking, rounding units, caps, UNDO/CLEAR, grey-out reasons, label text. App 1 uses it for the PRESS key and auto-press; Table Craps can adopt it later.
10. **Entitlements:** Standard vs Premium flags, **sold per app** (Bill, Oct 10). Keep the entitlement code shared so a **bundle can be added later**.

**App-only code:**
- **App 1:** dome machine, ROLL with optional auto-roll (A1.5a), Session limits (A1.5b), Regular/Crapless switch, Billy's Way, Bubble Bet Panel.
- **App 2:** shooter flow (pick, set, throw, no-roll), dice-set practice (cosmetic), multiplayer (seats, rotation, pass-and-play; online later).

## S8. Session history and bankroll chart (both apps; rev 16, round-5 batch, Bill approved)

**What it is:** a list of past sessions and a **bankroll-over-time chart**, per session and all-time. It's how strategy testers check what a plan did, and it's the top "must-have" gap in `market-check-oct2026.md` §2. It reads settled results only (Rule 0.3); it never feeds anything back into a roll, a bet or a Tutor suggestion.

**Session (one definition, both apps):** the A1.5b session, reused as-is (`js/session.mjs`).
- Starts with the first roll after first launch, an ended session, or Reset bankroll.
- Ends on **End session**, **Reset bankroll**, **Leave table** (Table Craps, A2.2b.6), or 30 minutes with no roll and no bet change.
- Multiplayer (Table Craps pass-and-play): one session per seat, stored under the seat name on this device.
- **Not sessions:** Strategy Comparison runs and any seeded simulation (Rule 0.8); Your Dice sessions are stored apart (S9) and never mix into the RNG history.

**Session record** (device-local; `bb-bubble-history-v1` / `bb-table-history-v1`, separate from the game, badge and Fair Dice keys):

| Field | Example | Notes |
|---|---|---|
| `session_id` | `s-20261013-1204-9c2e` | Same id as the Fair Dice CSV `session_id` (S5.4) |
| `start_local`, `end_local` | `2026-10-13T12:04:10-07:00` | With offset; shown in the user's time zone |
| `app`, `mode` | `bubble-craps`, `regular` | Table is always `regular` |
| `rule_preset`, `limit_tier` | `standard`, `standard` | The active-rules chip text if Custom (S3) |
| `start_total`, `end_total` | `1000.00`, `1140.00` | **Practice chips total** = bankroll + on table (A1.5b) |
| `net` | `+140.00` | `end_total − start_total` |
| `peak`, `low`, `max_drawdown` | `1210.00`, `860.00`, `350.00` (28.9%) | Drawdown = the largest drop from a running peak |
| `rolls`, `hands`, `points_made`, `seven_outs`, `longest_hand` | `74`, `9`, `11`, `9`, `17` | Same counting as S4.1 / `badges-bubble.md` §6.1 |
| `total_action` | `2310.00` | Sum of stakes settled |
| `strategy` | `T5` / blank | The "Play this" card, if one ran |
| `limits` | `loss 40% kept · goal +30% hit` | A1.5b |
| `ended_by` | `end` / `reset` / `leave` / `idle` | — |
| `series` | one point per settled roll | `roll_no`, `total`, `on_table`, markers: `seven_out`, `point_made`, `limit` |

**Chart, one session** (shared chart component with the Comparison chart, CMP-08):
- X = roll number in the session; Y = Practice chips total after each settle. A dashed start line; the loss-limit and win-goal lines when set; seven-out ticks on the X axis; a dot where a limit was reached.
- Tap or scrub: a tooltip with the roll number, the **pip dice** for that roll (S4.2, 20 px), the roll result word and the session net so far.
- Summary row under the chart: start → end, net, peak, low, max drawdown, rolls, hands, longest hand.
- "Replay this session under strategies" (Table Craps, Premium Strategy Comparison) uses that session's rolls, which are real RNG rolls from the Fair Dice log.

**Chart, all-time:**
- X = session (oldest → newest, dated); Y = **cumulative practice result** = the running sum of session nets. A **Reset bankroll never counts as a gain:** it ends a session, and the next session starts from the reset total, so the refill isn't in any net.
- Optional bars under the line: each session's net (neutral gray / blue, never red-vs-gold "loss vs win" styling).
- All-time totals: sessions, rolls, hands, net, highest and lowest session net (labeled "Highest session" / "Lowest session", not "best" / "worst"), longest hand.
- Filters: mode (Bubble Regular / Crapless), rule preset, limit tier, strategy.

**Where:**
- **Bubble Craps:** a **Sessions** item in the main menu (beside Badges and Lingo), and a "See chart" link on the End-session summary (A1.5b).
- **Table Craps:** the **Stats** key gets a **Sessions** tab, plus the same summary link after Leave table.

**Storage and caps:**
- Full per-roll series for the **latest 200 sessions**; older sessions keep their summary and a 200-point series downsampled with **min / max per bucket**, so the peak and the low survive.
- A single session's series is capped at 5,000 points the same way (the summary numbers stay exact).
- Reset bankroll keeps history. Settings › "Clear session history" (confirm sheet) wipes only this store.

**Copy (S2 / S6 / RT-22 banned lists apply):**
- Footer on every chart: "Practice chips. Past sessions don't predict future rolls."
- Never celebrate an up session, never "you're up 3 in a row", never suggest playing on to "win it back". A down session gets the same plain styling as an up one.

**Accessibility and fit:**
- The chart is `role="img"` with a text summary ("Session of Oct 13: started $1,000, ended $1,140; low $860 at roll 31; high $1,210 at roll 58"), plus a "Show as table" toggle with the same data.
- Lines use color **and** a dash pattern; reduce motion = no draw-in animation; fits 320–430 px, landscape and 130% text.

**Suggested split (Bill's call):** **Free** = the per-session chart, the last 20 sessions and the all-time totals. **Premium** = the full history list, the all-time chart and filters, and a sessions CSV (`billy-bubs-<app>_sessions_YYYY-MM-DD.csv`, one row per session, the fields above minus `series`).

**Build items:** Table `table-craps-build-checklist.md` §20 (SH-01 to SH-12), RT-38. Bubble: run-16 list, round-5 block (BL16-50 to BL16-57).

## S9. Your Dice mode: enter your own dice (both apps; rev 16, round-5 batch, Bill approved)

**What it is:** a **separate, clearly labeled mode** where the player types in rolls from real dice (at home, or replaying a casino sequence) and the app settles the bets on those rolls with the same rules engine. It's also our fairness answer: "Don't trust our dice? Roll your own. The payouts are the same math."

**How it fits Rule 0:** in Your Dice mode **the app doesn't roll**. Rule 0 is about every roll the app makes, and it's unchanged: no app roll is ever entered, shaped or replaced. Entered rolls are a different kind of record, labeled everywhere, and kept out of everything that reports on, ranks or rewards the app's dice (the exclusion list below). Rule 0 gets a rev 16 clause 9 that says this.

**Naming:** the mode is **"Your Dice"**; the button is "Enter your own dice". Its records use `dice_source: "entered"`. *(Don't call it "manual roll": A1.5a and `badges-bubble.md` §1 rule 10 already use "manual" to mean tapping ROLL instead of auto-roll, and those rolls count as normal.)*

**Entering and leaving:**
- From Play's menu (both apps) and the Fair Dice tab ("Roll your own dice instead").
- Only **between hands**: when no hand is live (`hand.rolls === 0`: right after a seven-out, a Reset bankroll or a fresh start). Mid-hand the button says "Finish this hand first", the same rule as the Bubble mode switch.
- **Its own table state:** Your Dice has its own practice bankroll (starts at the app's starting bankroll, own Reset), its own felt and its own hand. The RNG game is saved exactly as it was and comes back unchanged when you leave. Nothing moves between the two bankrolls.
- Bubble: works in Regular and Crapless (the mode's own switch, same mid-hand block). Table Craps: **solo table only** for MVP (pass-and-play later).

**The label (always on screen in this mode):**
- A banner on the felt and the HUD: **"YOUR DICE · you enter the rolls"**, in its own color token (not the Blazing meter or Fire rail colors).
- Every pip readout of an entered roll carries a small **"YOURS"** tag after the total badge (S4.2), and the screen-reader label adds "entered" ("six and four, ten, entered").
- The dome (Bubble) and the shooter tray (Table) show the entered faces at rest with no tumble and no throw.

**Entering a roll:**
- **Quick pad:** the 21-pair grid (the hop-tile component, S1.4a): one tap enters the pair. Die 1 is the smaller face (the order doesn't change any settlement).
- **Die pad:** two rows of faces 1–6, die 1 then die 2, for players who want the exact order.
- Then **Settle** (or Settle on tap, a setting). Bets settle exactly as for an app roll (same `settle`), with the normal payouts, toasts, point-made celebration and PSO (S4.3 / S4.4).
- **Undo last roll** (one step, before the next roll is entered) restores the full state from a snapshot. It exists for typos; it's allowed because nothing in this mode counts anywhere.
- No auto-roll (there's nothing to roll), no throw meter, no set dice, no no-roll (Table: a bad throw just isn't entered).
- **Paste a sequence** (optional): paste or import a list of rolls ("6-4, 3-3, 5-2" or the Fair Dice CSV `die1`/`die2` columns) and step through it roll by roll with **Next roll**. It's still entered dice: excluded the same way.

**Exactly what it excludes.** An entered roll, and any bet settled on it, is **never**:

| # | Excluded from | What that means |
|---|---|---|
| X1 | **The RNG and the roll path** | It's never drawn by, passed to or compared with `rollDie` / `rollDice`. No RNG state, counter or test reads it |
| X2 | **Fair Dice (all of S5)** | Not in the Fair Dice roll log, so not in any scope (This session · Last 100 · All time), the totals chart, the sevens band, the χ² test, each die, hard vs easy, streaks, Last 20, the roll history list, above / below, Table RSR or RSR by set, the "If this keeps happening, tell us" prompt, or the Fair Dice CSV |
| X3 | **RNG statistics and tests** | Not in the Rule 0 χ² / independence checks, the render-vs-engine check's data, `getRngSource`, or any telemetry about the dice |
| X4 | **The Longest Roll leaderboard** | No entry on any board (Regular / Crapless / Table; This week / All time), no "new longest roll" toast, and the PSO long-hand variant never shows the Longest Roll banner (S4.4); the "Hand over" tag can still show |
| X5 | **Badges** | No badge progress, unlock or "Earned N times" count from an entered roll or a bet settled on it, including the hand, points, ATS, HWAD, Repeater, Billy's Way / PRESS, bankroll-milestone (#23 steady run) and discipline (#28–#31) badges. Your Dice sessions never qualify a session badge. *(Learning badges like Table Manners and Talk the Talk come from reading cards, not rolls; reading a card while in this mode still counts, as it would anywhere.)* |
| X6 | **The Strategy Comparison** | A Your Dice session isn't offered as a source; a CSV row with `dice_source = entered` is refused (counted under "skipped rows"); the many-seed and seeded modes never see entered rolls |
| X7 | **The RNG session history and all-time chart** | Your Dice sessions are stored in their own list ("Your Dice" tab in Sessions, S8), never in the RNG all-time totals or chart |
| X8 | **The Blazing meter's record shares and Fire Bet "about 1 in 94" stats** | The meter can show this hand's length (it's cosmetic and labeled), but entered hands never feed any rate the app quotes |

What still works in the mode: every bet, the Bet Panel, Billy's Way / PRESS / POWER PRESS (Bubble), the Fire Bet (Table; it settles but counts nowhere), Tutor, Lingo, strategies' coach and auto-bets (they place bets; they can't enter rolls), session limits, celebrations and PSO.

**Copy:**
- Onboarding line: "Your Dice: roll real dice and enter them. The app pays them exactly like its own rolls. These rolls don't go into Fair Dice, badges or the Longest Roll board."
- Never compare entered dice to the app's dice ("your dice are luckier"), never call either one hot, cold or due (S6 list).

**Suggested split (Bill's call):** **Free**, including paste a sequence. It's the fairness answer, so it shouldn't sit behind Premium.

**Build items:** Table §21 (YD-01 to YD-14), RT-39, RT-40. Bubble BL16-60 to BL16-68.

## S10. Table rule settings and limit tiers (both apps; rev 16, round-5 batch, Bill approved; tiers PROPOSED)

**What it is:** one **Table rules** sheet that puts the four settings players ask for in one place: **Field 12 pays**, **odds multiple**, **starting bankroll** and **table limits**. It opens from the active-rules chip on the felt (S3), Settings › Table rules, and Premium. It uses the Edge Preview (S3) on every change. The full Custom Rules lists (A1.6, A2.3) stay as they are; this sheet is a front door to four of their rows plus the new limit tier.

**Exposure check (the market check asked for this):**
- **Bubble @ `51c229b`:** `premiumHTML` (`js/ui.mjs:2815+`) lists B-1 to B-31 read-only ("Locked on this build"). Odds are hard-coded 3-4-5x (`oddsMultiple`, `js/engine.mjs:268`; checklist F5). `fieldProfit` hard-codes 2× on the 12 (`js/engine.mjs:242-246`), while the felt label reads `settings.field12` (`js/ui.mjs:2396-2400`). If the label setting were ever turned on without the payout, the felt would say TRIPLE and pay double. **None of the four is exposed today.**
- **Table branch `cursor/table-craps-6ff7` @ `34f012d`:** the shared engine supports every T-3 multiple (`oddsMultipleFor`, `js/table-rules.mjs:59-70`: 1x, 2x, 3-4-5x, 5x, 10x, 20x, 100x), `field12: 3` (`fieldWin`, `:95-100`) and per-rules `tableMin` / `tableMax`, but `js/table-ui.mjs` has no screen that sets `oddsPreset`, `field12`, the limits or a starting bankroll. **None is exposed in the UI yet.**

**1. Field 12 pays (B-2 / T-2, unchanged options).** The 2 stays at its own setting (B-1 / T-1).

| Field pays (2 / 12) | House edge | Felt line (S1.4) |
|---|---|---|
| 2:1 / **2:1** (Standard) | **5.56%** (2/36) | 2 AND 12 PAY DOUBLE |
| 2:1 / **3:1** | **2.78%** (1/36) | 2 PAYS DOUBLE · 12 PAYS TRIPLE |
| 3:1 / 3:1 (B-1 / T-1 also 3:1) | 0.00% | 2 AND 12 PAY TRIPLE |

"3x" on the 12 means **3 to 1** (the bet back plus 3×), as in S1.4. The payout and the felt label must read the same setting (BL16-71 fixes the Bubble gap above).

**2. Odds multiple (B-3 / B-4 / T-3, unchanged options).** T-3 already has **1x, 2x, 3-4-5x (Standard), 5x, 10x, 20x, 100x**; B-3 is the same for Bubble Regular and B-4 has the Crapless set (1-2-3-4-5x, 2-2-3-4-5x, 3-3-3-4-5x, 5x, 10x, 20x, 100x). Lay odds follow B-5 / T-4 ("match pass odds"). Nothing new is added; the sheet exposes them.

| Odds | 1x | 2x | **3-4-5x** | 5x | 10x | 20x | 100x |
|---|---|---|---|---|---|---|---|
| Pass + max odds, combined edge | 0.85% | 0.61% | **0.37%** | 0.33% | 0.18% | **0.10%** (my calc: 1.414% ÷ (1 + ⅔ × 20)) | 0.02% |

- **Odds and lay odds stay exempt from the table max** in every tier and both apps (P14-8; already true in code: Bubble `spotMax` returns `Infinity` for odds kinds, `js/engine.mjs:431-436`; Table `tableMaxFor`, `js/table-rules.mjs:224-233`). The bankroll is the only cap on odds.
- Tutor line on any change: "More odds lowers the combined edge, but swings grow. Your expected loss in chips stays the same as the flat bet's." (S1.2.)

**3. Starting bankroll (B-14 / T-14, unchanged range).** Options $500 · $1,000 (default) · $2,500 · $5,000 · $10,000 · tier default · custom ($100–$100,000; per seat in multiplayer).
- **It applies only through Reset bankroll** (which ends the session, A1.5b). It never tops up a live bankroll, so it can't pad a session net, a steady run (#23) or a history chart.

**4. Table limits: limit tiers (new B-32 / T-31). PROPOSED: the numbers are Bill's call.**

| Tier | **Table Craps** min / max per bet | **Bubble Craps** min / max per bet | Suggested starting bankroll (Table / Bubble) |
|---|---|---|---|
| **Standard** (today) | **$10 / $500** | **$5 / $1,000** | $1,000 / $1,000 |
| **High limit** (PROPOSED) | $25 / $2,000 | $25 / $2,500 | $2,500 / $5,000 |
| **High roller** (PROPOSED) | $100 / $5,000 | $100 / $5,000 | $10,000 / $20,000 |
| **Salon** (PROPOSED, optional) | $500 / $25,000 | — | $50,000 / — |

- Starting bankroll suggestion = 100 × min (Table) and 200 × min (Bubble), which reproduces both Standard defaults.
- Every tier keeps max ≥ 20 × min (the B-13 / T-13 rule).
- **Salon needs the T-13 range raised** past $5,000 (today $100–$5,000). That's a limits change; it's listed only so Bill can say no.
- **Unchanged in every tier (recommended; Bill's call):** odds exempt; prop minimum $1 for hardways and Any Craps (P14-14); Repeaters $1–$25 per number; hops $1–$100; Fire Bet $1–$10 (T-28); Horn $4 and C&E $2 units.
- **Legal-amount caps per tier:** Place 6/8 tops out at the largest $6 step ≤ max: $498 · $1,998 · $4,998 · $24,996. Messages follow TL-04 ("Max $1,998 here").
- **POWER PRESS (Bubble):** the ladder already caps at B-13 (A1.4a). With B-31 on Auto (min ÷ $5), the High limit tier scales the ladder ×5 and High roller ×20.
- **Strategy cards (A2.4, A1.7)** state amounts at the Standard table; at a higher tier the card shows "× (tier min ÷ $10)" amounts, rounded to legal steps (TL-05 helper).
- **When a tier changes:** at the next come-out, like every rule (A1.6 / A2.3). Bets already on the felt stay until they resolve or come down; new chips follow the new limits. Changing the tier doesn't change the bankroll (the sheet offers "Also reset bankroll to $X").
- **Custom min / max** (B-12 / B-13, T-12 / T-13) stays available; picking a custom value shows the tier as "Custom".

**Suggested split (Bill's call):** **Free** = the limit tiers and the starting-bankroll presets (limits change no edge, and "tight table limits" is a top complaint in the market check). **Premium (as today)** = Field 12 3:1, odds other than 3-4-5x, custom min / max / bankroll, presets. *This moves B-14 / T-14 presets and a new tier picker into Free: an entitlement change.*

**Badge note (flag):** #23 Slow Double is "+$1,000 in one steady run". With a $20,000 starting bankroll the 10% in-action rule allows $2,000 a roll, so +$1,000 is much easier. **Recommended:** the target becomes "+$1,000 or +100% of the run's start, whichever is larger" (a `badges-bubble.md` change, not made here).

**Build items:** Table §22 (RS-01 to RS-12), RT-41. Bubble BL16-70 to BL16-78.

## S11. Roll speed: fast roll and skip animation (both apps; rev 16, round-5 batch, Bill approved)

**What it is:** Settings › **Roll speed: Normal · Fast · Instant** (new B-33 / T-32; free; default **Normal**), plus **tap the dice to skip** on any roll. Slow animations are the top complaint about the big 3D apps (market check §2).

**Rule 0:** speed only changes what's drawn. The draw happens at the same moment, through the same `rollDice`; the result is final before any frame is shown, and the final pose always shows the engine's faces (the render-vs-engine test runs at all three speeds). Speed never reaches the roll.

**Timing table** (every number is a maximum; every overlay stays skippable by tap, never blocks the next roll and clears on roll start, as in S4.3 / S4.4):

| Element | **Normal** (today) | **Fast** | **Instant** |
|---|---|---|---|
| Dice tumble (Bubble dome) / throw flight + tumble (Table) | 1.4 s (`animateDice`, `js/ui.mjs:1518-1551`; 1.6 s fallback) | 0.5 s | none: a ≤ 150 ms fade to the settled faces (like reduce motion's 180 ms) |
| Point made: Base / Big / Huge (S4.3, rev 15c) | 1.2 / 2.0 / 2.5 s | 0.8 / 1.2 / 1.5 s | 0.8 s stamp for every tier; no confetti or sunburst; one chime |
| Point made, quiet | ≤ 1.2 s | 0.8 s | 0.6 s banner |
| Fire Bet stinger (Table) | inside the Huge | inside the 1.5 s | inside the 0.8 s, text only |
| Big Win (rev 15b) | ≤ 2.5 s | ≤ 1.5 s | 0.8 s banner with the amount |
| PSO light / dark (S4.4) | 1.2 s | 0.8 s | static puck flip + the toast text (the reduce-motion version), 0.6 s |
| PSO long hand ("Hand over" tag or Longest Roll banner) | ≤ 2.0 s | ≤ 1.2 s | 0.8 s tag or banner |
| Rail "Change" / color-up (A2.2b) | 350 / 500 ms | 200 / 300 ms | 150 ms crossfade |
| Payout pulse (`burstChips`) | as today | half length | none (amounts still shown) |

- **The 2.5 s caps stay the hard ceiling.** Fast and Instant only shorten; nothing gets longer, and no overlay gains a button.
- **Same-roll merges don't change:** a point-made roll with a Big Win is one overlay (rev 15b); a PSO with a Big Win or Fire pay shows it inside the PSO (rev 15c). The merged overlay takes the shorter cap of the active speed.
- **Words, amounts, sounds and haptics stay** at every speed (sounds are trimmed to fit the cap; Instant uses the Base haptic for any point made). The polite screen-reader announcement is unchanged.
- **Reduce motion still wins:** whichever of reduce motion and the speed setting gives less motion applies.
- **Tap to skip a roll:** a tap on the dice or the dome during the tumble jumps to the settled pose at once. It's the same draw, already decided; the tap never changes a face.

**Auto-roll (Bubble, A1.5a):**
- The countdown still starts **after the roll has fully settled** (dice landed, result shown, chips paid), so Fast and Instant just reach that point sooner.
- The interval options stay **10 / 15 / 20 / 30 s**. Speed never shortens the interval. *(A 5 s interval with Fast or Instant is Open question 13; it isn't added.)*
- Pauses 1–5 and the holds are unchanged. The limit prompt (pause 3) opens **after the celebration or PSO clears at the active speed**. The build's fixed delays (2.2 s, or 3.0 s after a seven-out, `js/ui.mjs:1324`) become "when the overlay ends", so the prompt never appears early under Fast or late under Normal.
- Celebrations, Big Win, the PSO and toasts still never hold or delay auto-roll.

**Table Craps:** the speed applies after the throw is released. Dice set, grip and throw meter are unchanged and stay optional; the no-roll check is still decided before the draw (Rule 0.5). **Shooter practice** caps the speed at Fast (no Instant), because the throw is what's being practiced. The multiplayer betting timer (T-26) is unaffected. Pass-and-play uses one setting for the device.

**Counts the same:** every roll at every speed counts for the hand, Fair Dice, badges, the leaderboard and session history (unlike Your Dice, S9). The roll log adds `rollSpeed` for QA only (not shown; not in any stat).

**Suggested split:** **Free** (a comfort setting, like B-30).

**Build items:** Table §23 (FR-01 to FR-10), RT-42. Bubble BL16-80 to BL16-86.

## S12. Quick bets: one-tap Across, Inside and Outside (both apps; rev 16, round-5 batch, Bill approved)

**What it is:** one tap posts a whole spread, so nobody drags chips one at a time to build "$64 across" (market check §2).
- **Table Craps:** three keys, **ACROSS · INSIDE · OUTSIDE**, in a "Quick bets" strip at the top of the Bets sheet. T14's $64 spread is called **"Across"** (P14-11); **there's no Billy's Way key in Table Craps** (A1.4).
- **Bubble Craps:** **BILLY'S WAY is the across key** and stays as it is (A1.4; Crapless adds Buy 2/3/11/12). There's no separate ACROSS key in Bubble. **INSIDE** and **OUTSIDE** are added as a Quick bets strip on the Bet Panel's Place and Buy tabs. The machine-key row (BETS OFF · BILLY'S WAY · RESET) and the locked felt don't change.

**What each covers:**

| Key | Numbers | 4 / 10 | 5 / 9 | 6 / 8 |
|---|---|---|---|---|
| **Across** (Table) | 4, 5, 6, 8, 9, 10 | Buy | Buy | Place |
| **Inside** (both) | 5, 6, 8, 9 | — | Buy | Place |
| **Outside** (both) | 4, 5, 9, 10 | Buy | Buy | — |

- **Outside** means 4, 5, 9 and 10 in both modes (`craps-lingo.md` term 60). In Bubble Crapless, the 2/3/11/12 boxes are covered by Billy's Way only.

**Buy or Place, per number (one rule):** each spot uses **whichever of Buy and Place has the lower house edge at that amount under the active rules** (computed with `edgeFor` at the actual stake, so commission timing and rounding are included). On a tie, Place.
- **Standard rules:** Buy 4/10 (1.67% vs Place 6.67%) and Buy 5/9 (2.00% vs 4.00%); Place 6/8 (1.52% vs Buy 2.27%). This matches T6 / T14 and Billy's Way.
- **B-6 / T-5 commission "Always":** 4/10 stay Buy (4.76% vs 6.67%); **5/9 switch to Place** (4.00% vs 4.76%). The key's sub-label shows the switch.
- **T-6 / B-7 "$1 per $20" at $10:** Buy 4 pays $19 vs Place $18, so Buy; Buy 5 pays $14 = Place $14, so it's a tie and Place.
- **B-8 / T-8 "Buy available on":** where Buy is off, the spot is Place.

**Amounts at the $10 Table Craps table** (one unit; vig 5% of the Buy stake on win):

| Selected chip | Buy 4/10 each | Buy 5/9 each | Place 6/8 each | **Across** | **Inside** | **Outside** |
|---|---|---|---|---|---|---|
| $1 or $5 (below the $10 min) | $10 (wins $19.50) | $10 (wins $14.50) | **$12** (wins $14) | **$64** | **$44** | **$40** |
| $25 | $25 ($48.75) | $25 ($36.25) | $30 ($35) | $160 | $110 | $100 |
| $100 | $100 ($195) | $100 ($145) | $120 ($140) | $640 | $440 | $400 |
| $500 | $500 ($975) | $500 ($725) | **$498** (capped at the $6 step under the $500 max; wins $581) | $2,996 | $1,996 | $2,000 |

- **Scaling rule:** base B = the larger of the selected chip and the table minimum, as a $5 step. 4/5/9/10 get **B**; 6/8 get **B × 6/5** ($6 units: $12 per $10), capped at the largest $6 step ≤ the max. Each further tap adds one more unit (it stacks, like Billy's Way).
- **Bubble ($5 table):** a $1 or $5 chip gives Inside **$22** (Buy 5/9 $5, Place 6/8 $6) and Outside **$20**; then $110 / $100 at $25, and so on. Billy's Way stays $32 at $5 (A1.4).
- **Higher tiers (S10):** B starts at the tier minimum: High limit $25 → Across $160; High roller $100 → $640.
- **Edges (Standard, blended = expected loss ÷ total; my calc):** Across **1.71%** (0.48% per roll; = T14); Inside **1.74%** (0.50%); Outside **1.83%** (0.49%). For contrast, placing them all: Across 3.90%, Inside 2.64%, Outside 5.33%.

**One bet per number (Place / Buy / Lay; the Chief's ruling, QA table v1 row 13, and the build's `numberConflict`, `js/table-rules.mjs:235-254`):** a number holds at most one of Place, Buy or Lay. Quick bets never create a second one and never convert silently.
- **Empty number:** post the chosen type.
- **Same type already there:** add one unit to it.
- **The other right-side type already there** (e.g. Place 4 when Across wants Buy 4): **keep the player's bet type** and add one unit in that type's legal step (Buy and Place 4/5/9/10 in $5 steps; Place 6/8 in $6 steps; a Buy 6/8 in $5 steps). The toast names it: "4: added $10 to your Place 4".
- **A Lay on that number** (Table): skip it ("10 skipped: you have a Lay on 10"). A single convert still goes through the existing convert prompt on that spot.
- **The point number:** if the player has a **Pass or Come bet on that number**, the quick bet **skips it by default** ("6 skipped: it's your point"). Settings › Quick bets › "Include my point" (new B-34 / T-33, default Off).

**Posting rules:**
- **All or nothing on the bankroll:** if the practice chips can't cover every spot that will post, nothing posts ("Across needs $64; you have $40").
- **Per-spot limits:** a spot already at the max is skipped with the reason; a spot that would pass the max is capped at its largest legal amount (TL-05). Never a partial or illegal chip.
- **Working:** spots follow the normal come-out rule (off unless B-9 / T-9 is on) and Bets Off.
- **Undo:** one tap is one undo step. "Take down Across / Inside / Outside" removes only the units that key posted (the Billy's Way pattern, A1.4).
- **Table rail:** the whole spread is paid through `railPay` as one amount (A2.2b.4), with one "Change" label if chips break; the invariant holds.
- **Preview:** the key's sub-label shows the live total ("ACROSS $64"); long-press opens the key's own preview sheet (each spot, stake, Buy/Place reason, edge, total, at risk on a 7). Dock keys still get no long-press (S4.5).
- **Tutor:** Beginner "Across covers every box number in one tap. It buys 4, 5, 9 and 10 and places 6 and 8. A 7 takes them all." Experienced adds the blended edge and "at risk on a 7: $64".

**Tap increments on 6/8 (found while checking the $1 chip):** the Table build posts Place 6/8 by rounding the selected chip: under $12 → $12, else down to a $6 step (`placeSpot`, `js/table-ui.mjs:597-604`). So every tap adds at least $12, and **$18, $30 or $42 can't be built by tapping**. **Recommended:** once a 6/8 Place is up, a $1 or $5 chip adds **$6**; a $25 chip adds $24 (as today). The first tap still posts the $12 minimum.

**Suggested split:** **Free** (core bet entry; "paywalls on core bets" is a top complaint).

**Build items:** Table §24 (QB-01 to QB-14), RT-43. Bubble BL16-90 to BL16-97.

## S13. Billy's Payout Drills: a dealer payout trainer (both apps; rev 16, round-5 batch, Bill approved)

**What it is:** short drills where **Dealer Billy** shows a bet and a roll and you work out the payout, the way a dealer does. None of the big apps has it (market check §2, nice-to-have that sets us apart). It lives on **Learn › Payout Drills** in both apps. **It never touches practice chips:** no bankroll, no bets, no rolls of the dice. Every question is a built scene.

**Answers come from the engine:** each question's correct answer is computed by the same payout functions the table uses (`placeProfit`, `buyProfit`, `passOddsProfit`, `layOddsProfit`, `fieldProfit`, `hardwayProfit`, `hopPayTo1`, Table lay and Fire functions), to the cent, under the drill's rules. So a drill can't teach a payout the table doesn't pay (Rule 0.6).

**Drill types:**

| # | Drill | Example | Apps |
|---|---|---|---|
| D1 | **Place pays** | "Place 8, $18. The 8 rolls. Pay?" → $21 | Both; Crapless adds 2/12 (11:2) and 3/11 (11:4) |
| D2 | **Odds and lay odds** | "$10 Pass, $50 odds on 6. Point made. Pay the odds." → $60 | Both; lay odds Regular only; Crapless 2/12 6:1, 3/11 3:1 |
| D3 | **Buy with commission** | "Buy 10, $25. It hits. Net pay?" → $48.75 | Both (5% of the stake, on win) |
| D4 | **Lay bets** | "Lay 4, $40. Seven. Net pay?" → $19 | Table only |
| D5 | **Props and "for" vs "to"** | Field (with the active 2/12 pays), hardways, Any 7, Any Craps, C&E, Horn and Horn high in $4 / $5 units, hops; Hard Way All Day 165 **for** 1, Repeaters, ATS | Both; the Fire Bet in Table only (the word is banned in Bubble) |
| D6 | **Make it pay right** (units) | "A player wants about $50 on the 6. What pays clean?" → $48; "Max 3-4-5x odds on a $15 flat, point 5?" → $60 | Both: Place 6/8 in $6, odds on 5/9 even, odds on 6/8 in $5, lay $2 / $3 / $6 steps |
| D7 | **Pay the roll** (mixed board) | A felt snapshot with 2–8 bets and one roll: total paid, and which bets lose | Both |
| D8 | **Pay in chips** | Make a $14 Place 6 payout from the rail: fewest chips, no $10 chip → $5 + $5 + 4 × $1 | Table only (A2.2b) |

**Levels:**

| Level | Questions | Answer entry | Timer |
|---|---|---|---|
| **Rookie** | One bet, Standard rules, table-unit amounts ($10 / $12 Table, $5 / $6 Bubble) | 4 choices | None |
| **Dealer** | Odd-but-legal amounts up to $500, cents from vig, D7 boards of 2–3 bets | Keypad to the cent | Optional 15 s (Off by default) |
| **Boxman** | D7 boards of 4–8 bets with odds, vig and props; labeled rule variants (Field 3:1, 10x odds, commission Always, $1 per $20); "Spot the mistake" (Billy paid one bet wrong: find it) | Keypad / tap the wrong bet | Optional 10 s (Off by default) |

**Scoring:**
- A round is 10 questions. **10 points** per correct answer at Rookie, **20** at Dealer, **30** at Boxman. Accuracy % and average time are shown beside the score. When a timer is on, an answer after the timer counts as a miss.
- No lives, no multipliers, no currency, no streak bonus: it's a skills trainer, not a game of chance.
- A wrong answer shows the correct amount and opens the **Why?** math box (S2), e.g. "Place 6 pays 7 to 6: $18 ÷ 6 = 3 units × $7 = $21."
- Personal best per drill × level, stored on the device (`bb-<app>-drills-v1`); "Reset drill scores" in Settings.

**Badge (maybe; PROPOSED, Bill's call):** **"Dealer's Apprentice"** (Silver, learning): a perfect 10 / 10 round of **D7 Pay the roll** at **Dealer** level or higher. It follows the global badge rules (never from a bet or a roll; can't be bought). Bubble **#33** (after #32 Talk the Talk; Bubble would have 33 badges, Silver 10 → 11); Table: on its list after Talk the Talk.

**Copy:** Dealer Billy only (Bubbles Billie doesn't cheer scores). The drills teach **what a bet pays**, never which bet to make; edge facts use the S2 wording ("lowest edge", "less costly"). Banned lists apply. Footer: "Casinos round some payouts. The app pays to the cent; real tables may pay $1 less on odd amounts."

**Accessibility and fit:** keypad with 44 pt keys; every board scene has a text version ("Place 6, $18; Hard 8, $1; the roll is four and four, hard eight"); timers off by default; 320–430 px, landscape and 130% text.

**Suggested split (Bill's call):** **Free** = D1–D8 at Rookie and Dealer, and the badge. **Premium** = Boxman, "Use my table rules" (drills under the player's Custom Rules) and drill history.

**Build items:** Table §25 (PD-01 to PD-12), RT-44. Bubble BL16-100 to BL16-107.

# APP 1: BILLY BUBS BUBBLE CRAPS

## A1.1 Screens and tabs (match the mockups in `app1-bubble/`)
| # | Mockup screen | Spec section |
|---|---|---|
| 01 | Home / onboarding (dome, Regular vs Crapless cards, "Play Regular · 15-second bet timer · auto roll", Tutor tour, "What's Billy's Way?") — **rev 10:** the copy becomes "Play Regular · tap ROLL · auto-roll optional in Settings" | A1.2, A1.5a, A1.8 |
| 02 | Dome roll | A1.5 |
| 03 | Table: Regular felt | A1.2, S4 |
| 04 | Table: Crapless felt (**ATS lamp strip as in Regular, rev 13**; no Don't spots; ten number boxes) | A1.3 |
| 05 | Tutor overlay (Billy Tips, step x of 7) | A1.8 |
| 06 | Fair Dice | S5 |
| 07 | Win celebration | S4 (motion spec) |
| 08 | Bet Panel (LED point/last roll/balance; tabs **Place · Buy · Lay · Odds**; add **Repeaters**). **LAY tab: Regular only, hidden in Crapless** (lay odds on Don't Pass / Don't Come) | A1.2, S1.7 (mockup conflict 1) |
| 03/04 | Machine keys under the felt: **BETS OFF · BILLY'S WAY · RESET**. **PRESS / POWER PRESS** sit in the dock beside ROLL (mockup round 7) | A1.4a, S4.1 |
| 12 | Repeater bets → the **left Side-bets screen** (+ the 21-hop grid) | S1.7, S1.4a, S4.1 |
| 13 | Bet Panel, Crapless (no LAY tab) | A1.2 |
| 02 | Dome roll → the **right Dice screen** | S4.1 |
| 09 | Strategy library (Learn: All / Regular / Crapless / Lessons, Per bet ▾) | A1.7 |
| 10 | Premium Custom Rules (Regular rule set / Crapless rule set) | A1.6 |
| 11 | Premium locked (Standard) | A1.6 |

## A1.2 Standard (free) rules: App 1
Separate **Regular** and **Crapless** rule sets. Everything not marked applies to both.

| Rule | Standard | Edge effect |
|---|---|---|
| Field | 2 pays **2:1**, 12 pays **2:1**; 3/4/9/10/11 pay 1:1 | **5.56%** |
| Odds, Regular | **3-4-5x** | Pass/Come + max odds **0.37%** |
| Odds, Crapless | **3-3-3-4-5x** ("3-4-5x" MGM-style): **3x on 2, 3, 11, 12** and 4/10; 4x on 5/9; 5x on 6/8 | **1.26%** |
| Lay odds (Don't Pass / Don't Come, Regular only) | Up to **6x the flat bet** (wins 3x / 4x / 5x) | **0.27%** |
| Lay bets on numbers | **Not offered** in App 1 (matches the code: the Bubble engine has no lay bets) | — |
| Bet Panel LAY tab | **Regular only; hidden in Crapless** (Bill, Oct 10). It holds lay odds for Don't Pass / Don't Come, and is active only with a Don't bet and a point | — |
| Buy bets | **All point numbers** (Regular 4–10; Crapless adds 2, 3, 11, 12) | S1.3 |
| Buy commission | **5% of the stake, on wins only** | Buy 4/10 1.67%, 5/9 2.00%, 6/8 2.27%, 2/12 0.71%, 3/11 1.25% |
| Place/Buy on come-out | OFF (toggle "Working on come-out") | — |
| Hardways on come-out | Working | — |
| Don't Pass bar | 12 (Regular) | — |
| Don't Pass / Don't Come takedown | Regular only. **Allowed** once a point is on (take down or reduce; Bill, Oct 10). Tutor warns first | Taking it down gives up a bet that's now the favorite: worth +33.3% of the flat on 4/10, +20.0% on 5/9, +9.1% on 6/8 |
| Hard Way All Day | **165 FOR 1**, stays up after a win | 21.43% (S1.5) |
| ATS (Low / High / Roll 'Em All) | **Regular and Crapless** (rev 13). 31 / 31 / 156 FOR 1. **Stays up** after a hit; any 7 loses, a come-out 7 included | 18.30% / 18.30% / 17.98% (S1.6) |
| **Repeaters** | **Both modes** (Bill). 40/50/65/80/90 **FOR 1**. Works every roll; any 7 (including a come-out 7) loses; bet any time; stays up after a hit | 18.08%–21.88% (S1.7) |
| Billy's Way | Regular: Buy 4/5/9/10 + Place 6/8 ($6 units). Crapless: + Buy 2/3/11/12 | 1.71% / 1.43% (A1.4) |
| **PRESS / POWER PRESS keys** | Both modes. PRESS: + the original bet per tap (stacks; UNDO/CLEAR). POWER PRESS: the bet moves to the next step of Bill's ladder (the whole win, plus a small Give or minus a small Get; rev 12). Bankroll funds it; Buy vig on win only | Unchanged per bet (A1.4a) |
| Fire Bet | **Never in Bubble Craps** (Regular or Crapless). Table Craps only (A2.2a) | — |
| Table min / max | $5 / **$1,000** (rev 12a, Bill: fits the whole POWER PRESS ladder; Repeaters: $1 min, $25 max per number). *Rev 16: higher limit tiers are PROPOSED in S10 (B-32); Standard is unchanged* | — |
| Starting practice bankroll | $1,000 (`js/engine.js:14`) | — |
| Rolling | **Manual ROLL** (Standard). Optional free auto-roll every 10 / 15 / 20 / 30 s, **Off by default** (A1.5a) | — |
| Players | Single player; no shooter | — |
| Dice | Secure RNG (S5.1) | — |
| Blazing meter | On (cosmetic, S6) | — |

**What follows for Tutor (both modes):**
- Buy beats Place on 4/10 and 5/9.
- Place beats Buy on 6/8.
- In Crapless, always Buy 2/3/11/12, never Place them.

## A1.3 Crapless rules and payouts (App 1 only)

Primary source: Wizard of Odds, [Crapless Craps](https://wizardofodds.com/games/crapless-craps/). Supporting: [Wizard appendix 1](https://wizardofodds.com/games/craps/appendix/1/), [appendix 2](https://wizardofodds.com/games/craps/appendix/2/), [US Casino Advantage](https://uscasinoadvantage.com/table-games/how-to-play-crapless-craps/), [Vegas Advantage](https://vegasadvantage.com/las-vegas-table-game-survey/crapless-craps/), [Bet-NV](https://bet-nv.com/las-vegas-table-game-survey/crapless-craps/). All numbers below were re-calculated.

### A1.3.1 Line rules
| Roll | Regular Pass | Crapless Pass |
|---|---|---|
| Come-out 7 | Win 1:1 | **Win 1:1** (the only immediate win) |
| Come-out 11 | Win 1:1 | **Becomes the point** |
| Come-out 2, 3, 12 | Lose | **Becomes the point** |
| Come-out 4, 5, 6, 8, 9, 10 | Point | Point |
| Points | 4, 5, 6, 8, 9, 10 | **2, 3, 4, 5, 6, 8, 9, 10, 11, 12** |
| Point repeats / 7 | Win / Lose | Win / Lose |
| Edge | 1.41% | **5.38%** (373/6930) |
| Avg rolls | 3.38 | 4.16 |
| Per roll | 0.42% | ~1.29% |

On the come-out, 2, 3, 11 or 12 comes up 1 time in 6, the same chance as a 7.

### A1.3.2 Odds (true odds, 0% edge)
| Point | Pays | Chance to win | **Standard max** |
|---|---|---|---|
| 2, 12 | **6 to 1** | 14.29% | **3x** |
| 3, 11 | **3 to 1** | 25.00% | **3x** |
| 4, 10 | 2 to 1 | 33.33% | 3x |
| 5, 9 | 3 to 2 | 40.00% | 4x |
| 6, 8 | 6 to 5 | 45.45% | 5x |

**How Standard "3-4-5x" maps onto Crapless:** the "3" covers every outside point, so 2, 3, 4, 10, 11 and 12 all take 3x. It's 4x on 5/9 and 5x on 6/8. This is MGM's structure and it matches the current code (`js/engine.js:287-294`, "2, 3, 11, 12 in crapless" → 3x). Other casino structures (1-2-3-4-5x Caesars, 2-2-3-4-5x Wynn, 5x, 10x Strat/Palms/GVR/Ohio, per the sources above) are **Premium** options (A1.6, A2.3). Bubble machines set their own limits.

On a 2 or 12 point, a full 3x odds win pays 18x the flat bet plus the line's 1x, so 19x the flat in total. On 3/11, 3x odds pays 9x plus 1x = 10x.

### A1.3.3 Place, Buy and side bets in Crapless
See S1.3 (Place/Buy for all ten numbers) and S1.4 (side bets). Nevada Place pays are a Premium option (B-25, S1.8).
- **The Field is the same in Crapless as in Regular (rev 13d):** 2, 3, 4, 9, 10, 11 and 12 win. 2 and 12 pay 2:1, and the rest pay even money. The edge is 5.56%, and the bet stays up after a win. Crapless point rules don't change it: a 2, 3, 11 or 12 still wins the Field even when it sets a point.

### A1.3.4 Not in Crapless mode
- **No Don't Pass, Don't Come, Lay bets or Lay Odds.** Hide or disable those spots. (Wizard notes an unconfirmed report of crapless lay bets; this app doesn't offer them.)
- **No Fire Bet.** The Fire Bet is never in Bubble Craps at all; it's Table Craps only (A2.2a).
- *(Superseded, rev 13: "no ATS in Crapless". **ATS is offered in Crapless** with the same pays and edges, and any 7 loses it, the come-out 7 included. See S1.6.)*
  - **Code (rev 13):** the build `bb-bc-yrkv` @ `9367283` **hides ATS in Crapless**: validation `js/engine.mjs:535-536` ("ATS is not offered in Crapless."), felt strip `js/ui.mjs:2089`, mode toast `js/ui.mjs:571`, mode card `js/ui.mjs:2408`, B-20/B-21 rows `js/ui.mjs:2458-2459`. Showing it is a code change (see Code changes). *(The rev 5 note said the old code showed ATS in both modes. That was the old repo; the new build hides it.)*

## A1.4 Billy's Way: DEFINED (App 1 preset, matches the current code)

**Decision (Bill, Oct 10; restated Oct 11, rev 13):** Billy's Way **buys 2, 3, 4, 5, 9, 10, 11, 12 and places 6 and 8**, with 6/8 at **$6 per $5 unit**.
- **1 unit = $5 Buy on each outside number + $6 Place on 6 and on 8.** Scale by units (chip × 1 on Buy, chip × 6/5 on Place).
- **Regular** has no 2/3/11/12 box numbers (they're come-out craps/naturals and one-roll bets there), so **Regular = Buy 4, 5, 9, 10 + Place 6, 8** (6 spots).
- **Crapless = the same + Buy 2, 3, 11, 12** (10 spots).
- It's **Bubble Craps only**, not in Table Craps.
- **Rev 13 check:** this is the same definition as rev 3+, and the build matches it, so no code change is needed. *(Bill's original wording, "Place 4-10 across", was replaced in rev 3.)*

**How the build implements it** (`bb-bc-yrkv` @ `9367283`, read-only):
- Constants `BILLY_BUY = [2, 3, 4, 5, 9, 10, 11, 12]` and `BILLY_PLACE = [6, 8]` (`js/engine.mjs:46-47`).
- `billysBuyNumbers` filters `BILLY_BUY` through `numbersFor(state)`, so Regular gets 4/5/9/10 and Crapless all eight (`js/engine.mjs:779-782`).
- `billysWayAmounts`: Buy = chip, Place = floor(chip × 6/5) (`js/engine.mjs:784-788`).
- **Separate bets, not one bet.** `placeBillysWay` posts each spot with `placeBet` and skips (with a reason) any it can't post (`js/engine.mjs:790-818`).
  - Each spot follows the normal Buy/Place rules: it stays up after a hit, loses on a 7, is off on the come-out unless set to work, and is parked by Bets Off.
  - Spots are marked in `billyMark` for B-28 auto-press and take-down (`js/engine.mjs:821+`).
- Each tap stacks one more unit (`js/ui.mjs:676-692`).
- Help text (`js/ui.mjs:1854-1855`), the B12 card (`js/strategies.mjs:131-139`) and the README (`README.md:48`) all say the same thing.
- **Buy commission:** `buyVig` = **5% of the Buy amount, floored to the cent, taken only from a win** (`js/engine.mjs:233-240`).
- **No conflicts found** between the spec text, the build and Bill's restatement, except one wording point:
  - **"5% of the win" vs "5% of the bet":** Bill's note says "5% of the win". The spec (S1.3), the build and casino practice all charge **5% of the Buy amount, collected only when it wins**. Example: $5 Buy 4 wins $10 − $0.25 = $9.75.
  - Charging 5% of the *win* would cost more and raise the edges: Buy 4/10 3.33%, 5/9 3.00%, 2/12 4.29%, 3/11 3.75%.
  - **The spec keeps 5% of the Buy amount on win.** If Bill really means 5% of the win, it would be a new Premium preset; it isn't added.

**Commission and payouts at each chip** (Standard, on win only, to the cent; Premium B-6 "Always" charges it up front, and the B-7 presets round it differently):

| Chip (1 tap) | Vig per Buy spot | Buy 4/10 wins | Buy 5/9 wins | Place 6/8 (bet → win) | Crapless Buy 2/12 wins | Crapless Buy 3/11 wins |
|---|---|---|---|---|---|---|
| $1 | $0.05 | $1.95 | $1.45 | $1.20 → $1.40 | $5.95 | $2.95 |
| $5 | $0.25 | $9.75 | $7.25 | $6 → $7 | $29.75 | $14.75 |
| $25 | $1.25 | $48.75 | $36.25 | $30 → $35 | $148.75 | $73.75 |
| $100 | $5 | $195 | $145 | $120 → $140 | $595 | $295 |
| $500 | $25 | $975 | $725 | **$600** → $700 | $2,975 | $1,475 |

- **Rounding:** 5% of any whole-dollar Buy is a whole number of cents, so the floor never changes anything at these chip sizes or at any multi-tap stack. The 6/8 Place amounts (chip × 1.2) always pay exactly at 7:6.
- **$500 chip:** 6/8 = **$600 each, within the $1,000 Standard max** (rev 12a). A second $500 tap would make Buy $1,000 (allowed, equal to the max) but Place $1,200, so 6 and 8 are skipped with "at table max".

**Unit scaling (one tap, per chip; chips $1/$5/$25/$100/$500, no $10):**
| Chip | Buy each (4/5/9/10; + 2/3/11/12 Crapless) | Place 6 and 8 each | Regular total (6 spots) | Crapless total (10 spots) |
|---|---|---|---|---|
| $1 | $1 | $1.20 | $6.40 | $10.40 |
| $5 | $5 | $6 | $32 | $52 |
| $25 | $25 | $30 | $160 | $260 |
| $100 | $100 | $120 | $640 | $1,040 |
| $500 | $500 | $600 | $3,200 | $5,200 |

- **$500 chip:** the $600 Place 6/8 spots fit under the $1,000 Standard max (rev 12a). Under the old $500 max they would have been refused. A second $500 tap (Buy $1,000 / Place $1,200) skips the spots that would pass the max, with a toast: "6 and 8 skipped: at table max".

Payout examples ($5 chip): Buy 4/10 hit +$9.75, Buy 5/9 hit +$7.25, Place 6/8 hit +$7, Buy 2/12 hit +$29.75, Buy 3/11 hit +$14.75.

**Edges (Standard rules; blended = expected loss ÷ total on the layout):**
| Version | Spots | Units | Blended edge per bet | Per roll |
|---|---|---|---|---|
| **Billy's Way, Regular** | B4 B5 P6 P8 B9 B10 | 6.4 | **1.71%** | **0.48%** |
| **Billy's Way, Crapless** | B2 B3 B4 B5 P6 P8 B9 B10 B11 B12 | 10.4 | **1.43%** | **0.37%** |
| *Reference: all Place 4-10 (Bill's original wording)* | P4 P5 P6 P8 P9 P10 | 6.4 | 3.90% | 1.04% |
| *Reference: Crapless with 2/3/11/12 Placed* | Placed 4/5/9/10 and 2/3/11/12 + P6 P8 | 10.4 | 4.98% | 1.18% |

Per-spot edges are from S1.3. Seven-out exposure per press: 6.4 units (Regular), 10.4 units (Crapless), i.e. the totals in the unit table ($32 / $52 at $5).
- **Expected loss per decision, per $5 unit:** Regular $0.55 (Buy 4/10 $0.083 each, Buy 5/9 $0.10 each, Place 6/8 $0.091 each); Crapless $0.74 (adds Buy 2/12 $0.036 each, Buy 3/11 $0.063 each).

**PRESS and POWER PRESS on Billy's Way spots** (A1.4a; manual or B-28 auto-press):
- **PRESS** adds the spot's original bet per tap: +$5 on a $5 Buy, +$6 on a $6 Place 6/8. The bet type stays the same.
- **POWER PRESS** uses Bill's ladder by number group. Billy's Way 4/5/9/10 spots are **already Buy**, so:
  - **4/10:** the ladder is Buy from the bottom: 5 → 15 → 40 → 100 → 300 → 900. Give/Get: +$0.25 · −$4.25 · −$18 · +$5 · +$15; at the top, $900 wins $1,755 (collect).
  - **5/9:** the $5 / $15 steps are just **amounts**. A Buy stays a Buy; it never converts to Place (build `ladderKind` keeps the current type below $36). From $36 up it's Buy anyway (rev 12a).
    - Steps 5 → 15 → 36 → 86 → 200 → 500. Give/Get: +$2.75 · −$0.75 · −$2.20 · −$10.70 · +$10; at the top, $500 wins $725.
  - **6/8:** Place 6 → 18 → 42 → 90 → 210 → 450. Give/Get: +$5 · +$3 · −$1 · +$15 · −$5.
  - **Crapless Buy 2/12:** 5 → 35 → 250 (+$0.25 · +$6.75). **Buy 3/11:** 5 → 20 → 80 → 320 (+$0.25 · +$1 · +$4).
- **At other chip sizes** the spots start off the ladder and join it by the off-ladder rule (A1.4a: the highest step ≤ bet + win + 1 unit):

| Chip | Buy 4/10 | Buy 5/9 | Place 6/8 | Buy 2/12 | Buy 3/11 |
|---|---|---|---|---|---|
| $1 | → $5 (add $2.05) | → $5 (add $2.55) | $1.20 → $6 (add $3.40) | → $5 (get $1.95) | → $5 (add $1.05) |
| $5 | → $15 (add $0.25) | → $15 (add $2.75) | $6 → $18 (add $5) | → $35 (add $0.25) | → $20 (add $0.25) |
| $25 | → $40 (get $33.75) | → $36 (get $25.25) | $30 → $42 (get $23) | → $35 (get $138.75) | → $80 (get $18.75) |
| $100 | → $300 (add $5) *(on the ladder)* | → $200 (get $45) | $120 → $210 (get $50) | → $250 (get $445) | → $320 (get $75) |
| $500 | → $900 (get $575) | top step: collect $725 | $600 is above the top ($450): round-down, capped at max → $996 ($304 to chips) | above the top: → $1,000 max ($2,475 to chips) | above the top: → $1,000 max ($975 to chips) |

  - Bets **above** a group's top step have no step in range, so they use the round-down fallback (A1.4a rule 2), capped at the table max. This matches the build (`powerPlan`, `js/engine.mjs:950-1030`).

**Tutor copy:**
- Beginner: "Billy's Way covers every number in one tap. It buys the outside numbers (cheaper than placing them) and places 6 and 8. A 7 takes them all."
- Experienced: "1.71% blended (Regular), 1.43% (Crapless). Each spot is the cheaper way to bet that number under Standard rules. Placing 4-10 instead would cost 3.90%."
- If Premium sets commission to "Always": "Billy's Way buys now cost 4.76% each, so the blend rises." Show the live value in the Edge Preview.

**UI:**
- Button: **BILLY'S WAY**, sub-label "Buy $5 · 6/8 $6" (as today).
- Long-press preview sheet: each spot, stake, edge, total and seven-out exposure. *(New, not in the code yet.)* *(Rev 15d: it stays the key's long-press; its footer links the **Across** lingo term. The key isn't a bet spot, so it doesn't get a spot sheet, S4.5 H2.)*
- "Take down Billy's Way" removes only the units it posted. *(New, not in the code yet. Today each spot comes down individually.)*
- **Hidden in Table Craps**, and in Table Craps multiplayer.

## A1.4a PRESS and POWER PRESS: DEFINED (App 1 only, Regular and Crapless; Bill, Oct 10, rev 6)

Two keys act on **the Place or Buy bet that just won**. *(Rev 8, matching mockup round 7)* they sit in the **bottom dock beside ROLL**, so they're reachable from all three screens (S4.1). The machine-key row under the felt is **BETS OFF · BILLY'S WAY · RESET**. Neither is on the felt, so the locked layout doesn't change.

**Does the code have it today? No.**
- I checked the read-only clone at `/tmp/bbp` with full history.
- Machine keys today are **BETS OFF · BILLY'S WAY · RESET** (`index.html:437-451`; handlers `js/ui.js:1113-1114`, `1180`).
- Bill's Sep 16 reference panel matches commit `b085271` (Sep 15, 9:04 PM PT), which added **BETS OFF / ACROSS / RESET**. ACROSS became **BILLY'S WAY** in `de64b37`.
- No commit has ever added a PRESS key (`git log -S PRESS` finds nothing).
- The only "press" logic is the Table Craps simulator strategy "Press and collect" (`js/strategies.js:301-320`).

### Which bet the keys act on
- The last roll's total must be a Place/Buy number in this mode: 4–10, plus 2/3/11/12 in Crapless.
- A **working** Place or Buy bet on that number must have **won on that roll** (the settle step records it, `js/engine.js:920-941`).
- If both a Place and a Buy are up on that number, act on the cheaper one: **Buy** on 2, 3, 4, 5, 9, 10, 11, 12 and **Place** on 6/8.
- Nothing else is touched (line, odds, props, bonus bets).

### "Original bet" (defined)
**The amount on that number right after you last set it by hand.** That means placing or dragging chips, taking some down, Billy's Way, or Same Bet/Repeat. **PRESS and POWER PRESS taps never change it.**
- *Why this choice and not "before any presses this hand":*
  - Place/Buy bets stay up across hands (a made point leads to a new come-out with the bets still up), so "this hand" is fuzzy.
  - Players also add chips by hand in the middle of a hand. "Last set by hand" always matches what the player chose.
  - It keeps the PRESS step fixed, so it doesn't snowball (a $6 bet pressed to $24 still presses by $6).
  - It shows on the bet tile ("orig $6").
- It resets when the bet comes down: a 7, a full takedown, or RESET.

### PRESS (+ the original bet, taps stack)
- **Each tap adds one original-bet unit** from the bankroll. Example: $6 on 8, tapped 3 times = **$24**.
- **Label shows the running total and updates on every tap:** "PRESS 8 +$6 → $12", then "PRESS 8 +$6 → $18", and so on.
- **Money:** practice chips come **from the bankroll, not the payout**. The code already credits a win's profit to the bankroll and leaves the stake up (`js/engine.js:921-925` Place, `927-934` Buy). Each tap is a normal bet debit (`placeBet`, `js/engine.js:585-596`).
- **Cap:** a tap that would go over the table max (Standard **$1,000** per bet in Bubble Craps, B-13; rev 12a) or over the bankroll is refused, and the label greys out with the reason. Partial units are never added.

### POWER PRESS: Bill's "POWER PRESSES 2024" ladder (rev 12; replaces the rev 6 round-down)
**What one tap does:**
- It takes **the whole win** back up and moves the bet that just won to the **next step of Bill's ladder** for that number.
- If the win doesn't quite reach the step, the player **Gives** a little from chips. If it overshoots, the player **Gets** the small remainder back.
- **Money:**
  - The win was already credited to the bankroll (`js/engine.mjs` settle). POWER PRESS debits **(next step − current bet)** from the bankroll; that amount = win + Give, or win − Get.
  - **A Give always comes from the bankroll.**
- **Label:** it shows the move and the Give/Get before the tap:
  - "**POWER PRESS 6 → $18 (add $5)**"
  - "POWER PRESS 4 → $40 (get $2)"
  - "POWER PRESS 5 → $36 (even)"
- **One POWER PRESS per win.** After use, it reads "POWER PRESS · used" until the next win. PRESS can still be tapped on top; PRESS doesn't follow the ladder.

**Bill's chart, verified** (columns 4/10 · 5/9 · 6/8; the chart is in whole dollars, as a casino table pays):

| Step | 4 / 10 | 5 / 9 | 6 / 8 |
|---|---|---|---|
| **Start** | Place **$5**, wins $9 → **Give $1** → $15 | Place **$5**, wins **$7** → **Give $3** → $15 ⚠ *(chart typo: it says "Win $9, Give $1"; $5 placed on 5/9 pays 7:5 = $7)* | Place **$6**, wins $7 → **Give $5** → $18 |
| 2 | Place **$15**, wins $27 → **Get $2** → $40 | Place **$15**, wins $21 → **Give $0** → $36 | Place **$18**, wins $21 → **Give $3** → $42 |
| 3 | **Buy $40**, wins $80 − $2 vig = **$78** → **Get $18** → $100 | Place **$36**, wins **$50** → **$0** → $86 | Place **$42**, wins $49 → **Get $1** → $90 |
| 4 | Buy **$100**, wins $200 − $5 = **$195** → **Give $5** → $300 | Place **$86**, wins **$120** → **Get $6** → $200 | Place **$90**, wins $105 → **Give $15** → $210 |
| 5 | Buy **$300**, wins $600 − $15 = **$585** → **Give $15** → $900 | Place **$200**, wins $280 → **Give $20** → $500 | Place **$210**, wins $245 → **Get $5** → $450 |
| Top | Buy **$900**, wins **$1,755** (collect) | Place **$500**, wins $700 (collect) | Place **$450**, wins $525 (collect) |
| **Steps** | **5 → 15 → 40 → 100 → 300 → 900** | **5 → 15 → 36 → 86 → 200 → 500** | **6 → 18 → 42 → 90 → 210 → 450** |

- **Checks:**
  - **4/10:** Place 9:5 at $5/$15, then **Buy 2:1 less 5% on the win** from $40. All correct.
  - **5/9:** Place 7:5 with dollar breakage. All correct after the row-1 fix.
  - **6/8:** Place 7:6. Every step is a $6 multiple, and all are correct.
- **Breakage on $36 / $86 (5/9):** they aren't $5 multiples. At a casino the extra $1 pays $1 (not $1.40), so each loses **$0.40** per win: $36 pays $50 (not $50.40), and $86 pays $120 (not $120.40). That raises the Place edge from 4.00% to **4.44%** at $36 and **4.19%** at $86.
- **In Bubble Craps there's no dollar breakage.** The engine pays to the cent (`placeProfit` floors cents only, `js/engine.mjs:210-231`), so $36 pays $50.40 and $86 pays $120.40, and the edge stays 4.00%. The Give/Get then shows cents ("get $0.40", "get $6.40").
- **5/9 converts to Buy at $36 (Bill, rev 12a):** a POWER PRESS that lands a 5/9 bet on **$36 or more converts it to Buy**, the same way 4/10 converts at $40. Every 5/9 step from then on is Buy.
  - Buy is **2.00% vs 4.00%** Place under Standard (commission on win, to the cent). $36 Buy pays $52.20; $86 Buy pays $124.70.
  - The ladder **amounts** stay Bill's. Give/Get are always worked out from the **actual** win.
  - The $5 / $15 steps stay whatever the player has: Place by hand, Buy for Billy's Way.

**The ladder in Bubble Craps** (Standard, $5 table; Give/Get from the engine's to-the-cent payout):

| Number (bet type) | Steps | Give (+) / Get (−) at each move |
|---|---|---|
| **6 / 8** (Place) | 6 → 18 → 42 → 90 → 210 → 450 | +$5 · +$3 · −$1 · +$15 · −$5 *(the same as the chart)* |
| **4 / 10** (Bill: Place $5/$15, **Buy from $40**) | 5 → 15 → 40 → 100 → 300 → 900 | +$1 · −$2 · −$18 · +$5 · +$15 |
| **4 / 10** (Buy at every step, e.g. Billy's Way $5 Buy) | same | +$0.25 · −$4.25 · −$18 · +$5 · +$15 |
| **5 / 9** (default: Place $5/$15, **Buy from $36**) | 5 → 15 → 36 → 86 → 200 → 500 | +$3 · $0 · −$2.20 · −$10.70 · +$10 *(Buy wins from $36: $52.20 / $124.70 / $290; top $500 Buy wins $725)* |
| **5 / 9** (Buy, e.g. Billy's Way) | same | +$2.75 · −$0.75 · −$2.20 · −$10.70 · +$10 |

*Bill's chart lists 5/9 as Place all the way up, which in the app gives +$3 · $0 · −$0.40 · −$6.40 · +$20. Under the rev 12a default, $36 and up is Buy.* Every step fits the **$1,000** Standard max (rev 12a).

- **Place → Buy on 4/10 (Bill's chart):** a POWER PRESS that lands a 4/10 Place bet on **$40 or more converts it to Buy**. The Place is removed and a Buy for the new amount is posted, with the label "→ Buy $40".
  - Under Standard that lowers the edge from 6.67% to **1.67%**.
  - In the app, Buy is already cheaper at $5/$15 too (1.67% vs 6.67%). Billy's Way bets are Buy from the start; Tutor suggests Buy for a hand-placed 4/10.
- **Premium "commission Always" (B-6):** the 5% on the added Buy amount is charged at the press, and it's part of the Give (or comes out of the Get).
  - **Rounding presets (B-7)** change the Buy win, so the Give/Get changes. The step amounts don't.

**Off the ladder** (the current bet isn't a step for its number, e.g. $25 on 6, a 2-unit Billy's Way $10 Buy, or Hit and Split's $12 on 6):
1. **Jump to the highest step** S where **current < S ≤ current + win + 1 unit** (unit: $6 on 6/8; $5 on 4/5/9/10 and on Buy 2/3/11/12; $5 for a Crapless Place 2/3/11/12, since it converts to Buy and the range uses the Buy unit. Rev 13 fix: the earlier text said $2 / $4, which contradicted the rev 12a example Place 3 $4 → Buy $20; the build uses $5, `rangeUnitFor`, `js/engine.mjs:927-930`).
   - So the top-up is never more than one unit, and the bet joins the ladder. From then on, taps follow the ladder.
   - Examples:
     - $25 on 6 wins $29.16 → steps ≤ $60.16 → **$42 (get $12.16)**;
     - $12 on 6 wins $14 → ≤ $32 → **$18 (get $8)**;
     - Billy's Way 2-unit Buy 4 $10 wins $19.50 → ≤ $34.50 → **$15 (get $14.50)**.
2. **No step in that range** (e.g. the win is small next to a big off-ladder bet, or the bet sits between the top two steps): **fall back to the rev 6 round-down**. Add the win rounded down to whole units, with the rest to chips (the old table below). The label says "POWER PRESS 6 +$48 (round-down)".
3. **At the top step** (4/10 $900, 5/9 $500, 6/8 $450, or a Crapless top): the key greys out with "**top of the ladder · collect**". Bill's chart ends by collecting the win.

**Table max** (**Standard $1,000 per bet in Bubble Craps, Bill rev 12a**, B-13; the build's `TABLE_MAX = 50_000` cents, `js/engine.mjs:9`, becomes `100_000`):
- **Bill's whole chart fits in Standard.** The highest step is 4/10 $900. The tops (6/8 $450, 5/9 $500, 4/10 $900, Crapless Buy $250 / $320) are all ≤ $1,000.
- **Cap rule** (when Premium B-13 is set lower than a step): land on the **largest whole-unit amount ≤ max**, and the remainder is a Get.
  - Example (max $500): Buy 4 $300 wins $585 → "**POWER PRESS 4 → $500 (max) · get $385**". Then it's greyed with "at table max".
- Top-of-ladder still means collect, even with room under the max. Bill's chart ends there.

**Grey-outs** (in addition to the shared table below):
- "not enough chips": the bankroll can't cover the Give;
- "at table max";
- "top of the ladder · collect";
- "used".
- A Get never greys out. There's never a partial Give: it's the full step or nothing.

**Scaling** (B-31, Premium "Power Press ladder"):
- **Standard = Bill's fixed-dollar table** above, as he wrote it. A bigger bet that's off the ladder joins it by the off-ladder rule.
- **Premium options:**
  - **Scaled ×k:** every step × k, where k = 2, 3, 5 or 10, or **Auto = table min ÷ $5** when B-12 is $10 / $15 / $25. Give/Get scale with it. Every step stays a correct-pay multiple: 6/8 steps are 6·k multiples, the others 5·k.
  - **Custom:** edit the steps per number group. Validation: strictly increasing, each a correct-pay multiple for that bet, ≤ table max, at most 8 steps.
  - **Standard ladder** stays the default.
- With B-12 below $5 ($1 / $3 tables), the Standard ladder is used as is; smaller bets are off-ladder.

**Crapless 2/12 and 3/11 ladders (Bill, rev 12a: Buy; same Give/Get logic; Bubble Crapless only):**

| Bet | Pays | Steps | Give / Get (to the cent) | Edge |
|---|---|---|---|---|
| **Buy 2 / 12** | 6:1 less 5% on win | **5 → 35 → 250** (top) | $5 wins $29.75 → **+$0.25** → $35; $35 wins $208.25 → **+$6.75** → $250; $250 wins $1,487.50 (collect) | **0.71%** |
| **Buy 3 / 11** | 3:1 less 5% on win | **5 → 20 → 80 → 320** (top) | $5 wins $14.75 → **+$0.25**; $20 wins $59 → **+$1**; $80 wins $236 → **+$4**; $320 wins $944 (collect) | **1.25%** |

- Each step takes the whole win back up with a Give under 1 unit, the same shape as Bill's chart. The tops are set so the next step would pass the $1,000 Standard max ($250 + $1,487.50; $320 + $944).
- **Place 2/3/11/12 converts to Buy on POWER PRESS.** The Place (7.14% / 6.25%) is removed and a Buy goes on the Buy ladder by the off-ladder rule. Examples:
  - Place 2 $2 wins $11 → **Buy 2 $5 (get $8)**;
  - Place 3 $4 wins $11 → **Buy 3 $20 (add $5)**;
  - Place 12 $5 wins $27.50 → **Buy 12 $35 (add $2.50)**.
  - UNDO restores the Place.
- *(The rev 12 Place ladders 2 → 14 → 90 and 4 → 16 → 60 → 224 are dropped.)*

**The old round-down** is kept only as the off-ladder fallback (rule 2). It works like this: the win is rounded down to a correct-pay multiple, and the rest goes to chips. *(Since rev 12a, Crapless Place 2/3/11/12 converts to Buy on POWER PRESS, so its Place rows here only apply if the convert step is refused, e.g. at table max.)*

| Bet | Pays | Rounding unit | Example ($ bet → win → adds / back to bankroll) |
|---|---|---|---|
| Place 6 / 8 | 7 to 6 | **$6** | $6 → $7 → +$6 / $1 |
| Place 5 / 9 | 7 to 5 | **$5** | $5 → $7 → +$5 / $2 |
| Place 4 / 10 | 9 to 5 | **$5** | $5 → $9 → +$5 / $4 |
| Crapless Place 2 / 12 | 11 to 2 | **$2** | $5 → $27.50 → +$26 / $1.50 |
| Crapless Place 3 / 11 | 11 to 4 | **$4** | $5 → $13.75 → +$12 / $1.75 |
| Buy 4 / 10 | 2 to 1, less 5% vig on win | **$5** | $5 → $9.75 → +$5 / $4.75 |
| Buy 5 / 9 | 3 to 2, less vig | **$5** | $5 → $7.25 → +$5 / $2.25 |
| Buy 6 / 8 (rare; Place is cheaper) | 6 to 5, less vig | **$5** | $5 → $5.75 → +$5 / $0.75 |
| Crapless Buy 2 / 12 | 6 to 1, less vig | **$5** | $5 → $29.75 → +$25 / $4.75 |
| Crapless Buy 3 / 11 | 3 to 1, less vig | **$5** | $5 → $14.75 → +$10 / $4.75 |

**Risk per step** (Tutor and Edge Preview): each step raises what's at risk on a 7. **The edge per bet stays the same.** Expected loss per decision = bet × edge:

| Steps | Expected loss per decision |
|---|---|
| 6/8 Place (1.52%) | $6 → $0.09 · $18 → $0.27 · $42 → $0.64 · $90 → $1.36 · $210 → $3.18 · $450 → $6.82 |
| 4/10 Buy (1.67%) | $40 → $0.67 · $100 → $1.67 · $300 → $5.00 · $900 → $15.00 (Place $5/$15 at 6.67%: $0.33 / $1.00) |
| 5/9 (Place 4.00% at $5/$15, then Buy 2.00%) | $5 → $0.20 · $15 → $0.60 · $36 → $0.72 · $86 → $1.72 · $200 → $4.00 · $500 → $10.00 |
| Crapless Buy 2/12 (0.71%) · 3/11 (1.25%) | $5 → $0.04 · $35 → $0.25 · $250 → $1.79 · $5 → $0.06 · $20 → $0.25 · $80 → $1.00 · $320 → $4.00 |

### UNDO / CLEAR (before the next roll)
- While taps are pending, a small **UNDO · CLEAR** pill shows under the keys. **UNDO** removes the last PRESS or POWER PRESS tap. **CLEAR** removes every press tap since the last roll.
- Chips go back to the bankroll, and a POWER PRESS undo re-enables POWER PRESS. Undoing a ladder step restores the old amount and bet type (a 4/10 converted to Buy goes back to Place), returns the Give, and takes back nothing else (the win stays credited).
- **Locked once the dice roll** (if auto-roll is on, its countdown still runs).
- These never touch chips placed by hand.

### Greyed out (the kicker gives the reason; applies to both keys)

| Case | Kicker |
|---|---|
| No roll yet, or the dice are rolling | "after a hit" |
| Last roll was a 7: a seven-out (every Place/Buy just lost) or a come-out 7 | "seven" |
| Last roll isn't a Place/Buy number (2, 3, 11, 12 in Regular) | "11 isn't a number bet" |
| No Place/Buy bet on the last number | "no bet on 9" |
| The bet didn't win because it was off (come-out with "Working on come-out" off, or BETS OFF) | "bets off" |
| At the table max | "at table max" *(the code has no Place/Buy max today, `js/engine.js:478-491`; code change)* |
| Not enough chips for one unit (PRESS) | "not enough chips" |
| POWER PRESS only: can't cover the Give, at the top of the ladder, or already used for this win (off-ladder fallback: the rounded amount is $0) | "not enough chips" / "top of the ladder · collect" / "used" / "win under $5" |

After the point is made, the next roll is a come-out, and number bets are off by default. The keys stay grey until a working bet wins again. With "Working on come-out" (B-9) on, a come-out win enables them as normal.

### Hooks
- **Billy's Way (A1.4, B12):** "Auto-press after each hit" (B-28: **Off / PRESS / POWER PRESS**, max 1–5 per number; default Off).
  - When a Billy's Way spot wins, the app does the chosen press on **that spot only** and shows a toast, e.g. "Auto POWER PRESS 8 → $18 (added $5 from chips)".
  - **POWER PRESS mode follows the ladder (rev 12):**
    - Each automatic step counts as one press toward the per-number max (1–5).
    - A **Give is taken from the bankroll automatically**. The first time, a one-time Tutor card says so.
    - If the Give can't be covered, it **collects instead** (no partial; toast "Collected: not enough chips for the next step").
    - It stops at the top of the ladder and at the table max.
  - Billy's Way spots start **on** the ladder: $5 Buy 4/10 → $15 (add $0.25), $5 Buy 5/9 → $15 (add $2.75), $6 Place 6/8 → $18 (add $5). Multi-tap units ($10 / $12) use the off-ladder rule.
  - It follows every grey-out rule.
  - Each Billy's Way tap is a "set by hand" placement, so it resets that spot's original bet.
- **B5 "Place 6/8 Regression & Press"** and **Progressions:** the coach's press steps use PRESS ("press 1 unit") or POWER PRESS ("next ladder step"). After B5's regression to $6, POWER PRESS climbs Bill's ladder: $6 → $18 (add $5) → $42 (add $3) → $90 (get $1). The same B-28 setting applies.
- **B14 Hit and Split** keeps its own logic (B-28 suspended). A manual POWER PRESS on its $12 starter uses the off-ladder rule ($12 → $18, get $8) and counts as the player's override for that number.
- **Wording fix:** Billy's Way copy says "each press stacks one unit" (`index.html:644`, `js/engine.js:1316`, `README.md:42`). Change it to "**each tap**".
- **The Blazing meter never touches PRESS or POWER PRESS.** No glow, pulse or "press it!" prompt by tier (S6 caution 2; mockup conflict 14).

### Edge and risk (Tutor)
- **PRESS:** the house edge on each bet stays the same (Place 6/8 1.52%, Buy 4/10 1.67%, ...). It puts more chips on the same edge, so **what's at risk and the swings go up.**
- **POWER PRESS:** it takes the whole win up to the next ladder step, sometimes with a Give from your chips. **Each step raises what's at risk on a 7 (about 2–3x per step). The edge per bet stays the same**, so the expected loss per decision grows with the bet (table above), and the swings go up.
  - **It isn't "playing with house money": once a win is paid, it's your money.** Re-betting it costs exactly what betting any other chips would.
- **Edge Preview (S3):** "Edge unchanged · Place 8 1.52% · At risk on a 7: $32 → $44 · POWER PRESS 8 → $18 (add $5)." For a conversion: "Place 4 6.67% → Buy 4 1.67%" (4/10 at $40+), "Place 5 4.00% → Buy 5 2.00%" (5/9 at $36+), "Place 2 7.14% → Buy 2 0.71%" (Crapless).

### Table Craps: keep it Bubble only (recommendation, matching Bill's default)
- On a real table you call "press it" or move chips, and Table Craps already teaches that by hand (T9 Regression, T10 Press Progressions).
- In multiplayer, "the bet that just won" is per player.
- The logic (`pressLastWin` / `powerPressLastWin` in the shared rules core, S7) can be added to Table Craps later if T10 players ask.
- App 2's Repeater screen has a "Press it" button (`src/repeater.html:28`). That's a Repeater add (tally 0 only, S1.7), not these keys (mockup conflict 15).

## A1.5 Bubble machine specifics
- A betting timer runs, then the dice roll automatically (some machines use a designated player's button). Sensors read the dice and settle all bets ([CrapsPit](https://www.crapspit.org/bubble-craps-machine/), [Chipy](https://chipy.com/academy/craps/how-to-play-bubble-craps)).
- Makers: Aruze "Shoot to Win" and Interblock "Organic Craps". Interblock later bought Aruze's table-game assets ([Gaming America](https://gamingamerica.com/news/10839/product-review-interblocks-shoot-to-win-craps-machine)).
- Real machines mostly use physical dice. Some electronic craps games use a software RNG ([WSGC Roll to Win approval](https://wsgc.wa.gov/sites/default/files/2025-04/3196%20Approval%20Letter%20-%20Craps%20Roll%20to%20Win%20ETG%20signed.pdf)). The app uses an RNG; say so in a footnote.
- Minimums are commonly $3 to $5 ($1 has been reported). Maximums and odds limits vary; no typical figure was found.
- Unconfirmed: which real machines offer crapless or buy bets. **Decision:** the app offers Buy on Bubble regardless (Standard rule). Present it as a teaching feature, not a copy of any specific machine.
- **App defaults:** starting practice bankroll $1,000 and chips **$1 / $5 / $25 / $100 / $500** (Bill, Oct 10; the code has no $500 yet, `js/engine.js:15`); table min $5, max **$1,000** (rev 12a; Table Craps stays $10 / $500).

## A1.5a Auto-roll: OPTIONAL (App 1; Bill, rev 10)

**Default: Off.** You roll with **ROLL**. Auto-roll is a **free** Settings option ("Auto-roll"), not Premium. This replaces the old "15 s bet timer, then auto roll" default.

**Interval** (Settings, shown once Auto-roll is on): **10 / 15 / 20 / 30 s**; **15 s** the first time it's turned on, remembered after that.
- The countdown **starts when the previous roll has fully settled**: dice landed, the result line shown, chips paid.
- Placing, changing or removing any bet **restarts** the countdown, so you're never rushed mid-bet.
- **ROLL always works.** It rolls now and restarts the countdown afterwards.
- The countdown is a ring on ROLL. The dice animation speed doesn't change.
- Screen readers hear "Auto-roll in 5 seconds" once per roll, plus the pause reason.

**Holds** (the countdown freezes, then continues by itself when the hold ends):
- any sheet or overlay open: Tutor card, Settings, Strategies, Fair Dice, Badges, the initials prompt, the session summary. *(The current build already does this for overlays.)*
- *(Rev 15d exception: the Craps Lingo **peek card** opened from a roll call doesn't hold the countdown, and it closes when the roll starts (S4.5 H3). The long-press spot sheet and the Lingo screen do hold it, like the Tutor card.)*

**Pauses** (auto-roll stays On but stops; the dock shows a chip with the reason and **RESUME**; the countdown starts fresh after RESUME):
| # | Stop condition | Notice | Notes |
|---|---|---|---|
| 1 | **Empty felt:** 3 rolls in a row (manual or auto) with **On table = $0** at roll time | "Auto-roll paused · nothing on the felt" | Chips parked by BETS OFF count as on the felt. Any roll with chips resets the counter. |
| 2 | **Can't cover the working bets:** before an auto-roll, a re-bet the app would make (strategy auto-bet, Billy's Way repeat, auto-press, Come/odds re-place) needs more practice chips than you have, or the bankroll is $0 with nothing on the felt | "Auto-roll paused · not enough practice chips for your bets" | It never rolls a partial strategy silently. It links to Bets and to Reset bankroll. |
| 3 | **Loss limit or win goal reached** (A1.5b) | Dealer Billy's limit prompt | "Keep playing" does **not** restart auto-roll. Only RESUME does. |
| 4 | **App backgrounded:** tab hidden, app switched, screen locked, `pagehide` | "Auto-roll paused while you were away" | It **never rolls on return**. You tap RESUME. |
| 5 | **Mode switch, Reset bankroll, End session** | (none) | It comes back paused. |

**Never stops or delays auto-roll:**
- badge toasts and marquee toasts;
- the mini roll-result toast;
- Blazing tier toasts;
- the "new longest roll" toast.
- They queue around the roll (`badges-bubble.md` §4.2).
- The Blazing meter, badges and the leaderboard never speed it up or slow it down.

**Counting:** auto and manual rolls count the same for the hand, the Blazing meter, the leaderboard and badges. The roll log records `rollSource` (manual or auto).
- *(Rev 16: "manual" here means a ROLL tap. Rolls typed in from real dice are a different thing, **Your Dice** (S9, `dice_source: entered`). They count nowhere, and the mode has no auto-roll.)*
- *(Rev 16, Roll speed S11: Fast and Instant shorten the dice and the overlays, so a roll settles sooner. The countdown still starts at the full settle, the 10 / 15 / 20 / 30 s intervals don't change, and the limit prompt (pause 3) opens when the celebration or PSO overlay ends at the active speed. "The dice animation speed doesn't change" above refers to the countdown itself.)*

## A1.5b Session limits: loss limit / win goal (App 1; FREE; Bill, rev 10)

**Purpose:** responsible-gaming practice. You decide where you'll stop before you start. Both limits are **Off by default**. Tutor (Beginner) suggests them once, in onboarding.

**Session:**
- **Starts** with the first roll after:
  - first launch;
  - an ended session;
  - Reset bankroll.
- **Starting session bankroll** = Practice chips total (bankroll + on table) just before that first roll.
- **Ends** when:
  - you tap **End session** (on the limit prompt, the Session sheet, or Settings);
  - you **Reset bankroll**;
  - 30 minutes pass with no roll and no bet change. On the next launch, the old session is closed at its last activity time.
- **Practice chips carry over** between sessions. Bets on the felt stay.
- **Session net** = Practice chips total now − starting session bankroll. It's checked after each roll settles.

**Settings → Session limits** (free; it applies to every session until changed):
| Setting | Options | Default |
|---|---|---|
| **Loss limit** | Off · **amount** ($25 steps, $25–$5,000) · **% of the starting session bankroll** (10 / 20 / 25 / 50%) | Off |
| **Win goal** | Off · **amount** ($25 steps, $25–$5,000) · **%** (10 / 25 / 50 / 100%) | Off |
- A % is turned into practice chips at session start and rounded down to $5. Display: "Loss limit 25% · $250 this session".
- **Changes mid-session** take effect from the next roll. For the discipline badges, only the limits set **before the first roll** count, and loosening them voids the session (`badges-bubble.md` §2.10).

**When a limit is reached** (net ≤ −loss limit, or net ≥ win goal):
1. **Rolling pauses.** ROLL is held and auto-roll pauses. This happens after the roll's result and toasts have shown; the prompt never covers the roll result.
2. **A gentle Dealer Billy prompt** (a sheet, with a soft chime only if sound is on):
   - **Loss limit:** "You've reached the loss limit you set: −$250 practice chips this session. This is a good spot to stop." Buttons: **End session** (primary) · **Keep playing**.
   - **Win goal:** "You hit your win goal: +$200 practice chips. Want to lock it in?" Buttons: **End session** (primary) · **Keep playing**.
3. **The player can always override.**
   - **Keep playing** closes the sheet and ROLL works again. Auto-roll needs RESUME.
   - **No nagging:** each limit prompts **once per session**. After that there's only a quiet HUD chip ("Past your loss limit" / "Win goal reached"); tapping it opens End session.
   - No countdowns ("$20 to your limit"), no shame copy, no sounds after the first.
4. **End session** shows a **session summary**:
   - rolls and hands;
   - start → end practice chips and net;
   - longest hand;
   - limits set, and whether they were kept;
   - any badges earned this session.
   - Copy: "Practice chips carry over. A new session starts with your next roll."

**Discipline badges:** #28–#31 in `badges-bubble.md` §2.10. The anti-farm rules there are: ≥ 20 bet-rolls, limits set before the first roll and not loosened, no Reset bankroll, and one award per session.

## A1.6 Premium Custom Rules: App 1 (Regular rule set / Crapless rule set)
Mockups 10 and 11: Standard users can see every setting, locked; Premium users can change them. Presets: Standard, Strip Classic, Strip Deluxe, Custom (saved), Downtown 10x. Every setting is stored **per rule set** (Regular and Crapless are separate) unless marked. Changes apply at the next come-out.

| ID | Setting | Options | Standard default | Premium range / notes |
|---|---|---|---|---|
| B-1 | Field 2 pays | 2:1, 3:1 | 2:1 | Both. Edge: 2/2 5.56%, 2/3 or 3/2 2.78%, 3/3 0% |
| B-2 | Field 12 pays | 2:1, 3:1 | 2:1 | Both |
| B-3 | Odds limit, **Regular** | 1x, 2x, **3-4-5x**, 5x, 10x, 20x, 100x | 3-4-5x | Any (S1.2 table) |
| B-4 | Odds limit, **Crapless** | 1-2-3-4-5x, 2-2-3-4-5x, **3-3-3-4-5x**, 5x, 10x, 20x, 100x | 3-3-3-4-5x | Any (S1.2 table) |
| B-5 | Lay odds limit (Regular) | Match pass odds (lay ≤ 6x flat), or flat cap 6x / 10x / 20x | Win 3/4/5x (lay ≤ 6x flat) | Any |
| B-6 | Buy commission timing | **On win only**, Always | On win | Both |
| B-7 | Buy commission rounding | Exact 5%, $1 per $20, $1 per $25 | Exact 5% | Any |
| B-8 | Buy available on | All numbers, Only 4/10 (+2/3/11/12 Crapless), Off | All | Any |
| B-9 | Place/Buy working on come-out | Off, On | Off | Both |
| B-10 | Hardways working on come-out | On, Off | On | Both |
| B-11 | Don't Pass bar (Regular) | Bar 12, Bar 2 | Bar 12 | Both |
| B-12 | Table minimum | $1, $3, $5, $10, $15, $25 | $5 | $1 to $25 |
| B-13 | Table maximum | $100 to $5,000 | **$1,000** (rev 12a; was $500) | Must be ≥ 20x the minimum. Premium can lower it (the POWER PRESS ladder then caps at the max, with the rest as a Get) or raise it to $5,000 |
| B-14 | Starting practice bankroll | $200, $500, $1,000, $5,000, custom | $1,000 | $100–$100,000 practice chips (not per rule set) |
| B-15 | Horn payouts | 30:1 / 15:1, 31:1 / 16:1 | 30:1 / 15:1 | Both |
| B-16 | Any 7 / Big Red payout | 4:1, 4.5:1 | 4:1 | Both (4.5:1 → 8.33%) |
| B-17 | Hardway payouts | US 7:1 / 9:1, AU 7.5:1 / 9.5:1 | US | Both |
| B-18 | Side-bet toggles | Field, Hardways, Big Red / Any 7, Any Craps, Yo, C&E, Horn, Horn singles, Hop bets, Hard Way All Day, ATS (both modes, rev 13), **Repeaters** | All on | Any. **No Fire Bet in App 1** (Table Craps only) |
| B-19 | Hard Way All Day pay | 150 / **165** / 175 / 200 for 1, 165 **to** 1 | 165 for 1 | 28.57% / 21.43% / 16.67% / 4.76% (165 to 1: 20.95%) (S1.5) |
| B-20 | ATS comes down after a hit | Off (stays up, re-arms), On | Off | Both modes (rev 13) |
| B-21 | ATS pay table | 31 / 31 / 156 for 1, 35 / 35 / 176 for 1 | 31 / 31 / 156 | 18.30 / 18.30 / 17.98% vs 7.76 / 7.76 / 7.46% (both modes, the same edges; rev 13) |
| B-22 | Repeater pay table | **Standard 40/50/65/80/90**, Generous, Near-fair (for 1) | Standard | S1.7 |
| B-23 | Repeaters come down after a hit · off on the come-out (patent style) · come-out-only betting | Three toggles | All off | Edges unchanged (S1.7) |
| B-24 | Repeaters in Crapless | On, Off | On (Bill) | Crapless rule set only |
| B-25 | Crapless Place 2/12 · 3/11 pays | 11:2 · 11:4 (LV), 5:1 · 13:5 (Nevada rules of play) | 11:2 · 11:4 | 7.14% / 6.25% vs 14.29% / 10.00% (Crapless only) |
| B-26 | Auto-roll interval | **Moved to free Settings (rev 10, A1.5a):** Off (default) · 10 / 15 / 20 / 30 s (15 s when first turned on) | Off | Not Premium, not per rule set |
| B-27 | *(dropped in rev 6)* | — | — | Half/Full press is replaced by **POWER PRESS** (Standard). PRESS is always one original-bet unit per tap |
| B-28 | Auto-press after each hit (Billy's Way, B5 coach) | Off, PRESS, POWER PRESS (max 1–5 per number) | Off | **Standard (free) setting**, listed here for completeness. Follows every grey-out rule. POWER PRESS mode climbs the ladder (rev 12) and takes Gives from chips automatically. |
| B-29 | Hop pays (the 17 non-Horn hops) | **15 / 30 to 1**, 16 / 31, 16 / 33 (easy / hard) | 15 / 30 | 11.11% / 13.89% → 5.56% / 11.11% → 5.56% / 5.56%. The Horn singles follow B-15 |
| B-30 | Show the dice on each roll | Off, On | Off | Not a rule. Auto-jump to the hood (S4.1); in Settings, not Premium |
| B-31 | Power Press ladder (rev 12) | **Standard (Bill's 2024 chart)** · Scaled ×2/×3/×5/×10 or Auto (table min ÷ $5) · Custom steps | Standard | The edge per bet is unchanged; it changes exposure only. Custom steps must be correct-pay multiples ≤ the table max (B-13). |
| B-32 | **Limit tier (rev 16, PROPOSED, S10)** | Standard $5 / $1,000 · High limit $25 / $2,500 · High roller $100 / $5,000 · Custom (B-12 / B-13) | Standard | Odds exempt. Suggested Free (Bill's call); custom stays Premium |
| B-33 | Roll speed (rev 16, S11) | Normal · Fast · Instant | Normal | Not a rule; free Settings, not per rule set |
| B-34 | Quick bets: include my point (rev 16, S12) | Off · On | Off | Not a rule; free Settings |

**Not in App 1:** lay bets on numbers, lay commission, seven-out dice passing (there's no shooter).
**Premium features (not rules):** Fair Dice CSV export (S5.4) and saved presets.
**Premium upsell list (mockup 11):** "Your casino's odds & payouts · Live house-edge preview · Presets · Fair Dice CSV export · Hard Way All Day 150–200 for 1 · Repeater pay tables". **Remove "Shooter skill simulation"** (mockup conflict 2; the feature is removed from both apps in rev 15a).

## A1.7 Strategy library: App 1 (14 strategies, B1–B14)

#### B1. Pass Line + Max Odds (Both)
- **How to play:** Pass on the come-out (puck OFF). Take max odds (3-4-5x) once a point is set.
- **House edge:** Regular 1.41% flat, 0.37% with max odds (Pass alone is 0.42% per roll). Crapless 5.38% flat, 1.26% with max odds (about 1.29% per roll flat, because a crapless line bet lasts about 4.16 rolls vs 3.38).
- **Risk:** Low to Medium.
- **Bankroll:** 30 units flat. With max odds, budget 10 to 15 full bets (about 60 to 90 units). Stop-loss: 50%. Win goal: +30 to 50%.

#### B2. Don't Pass + Lay Odds (Regular)
- **How to play:** Don't Pass on the come-out. Lay up to 6x the flat bet after the point. 2 and 3 win on the come-out, 7 and 11 lose, 12 pushes. **Not available in Crapless.**
- **House edge:** 1.36% per bet made, 1.40% per bet resolved, 0.40% per roll. **0.27%** with 6x lay odds.
- **Risk:** Low.
- **Bankroll:** 60 to 80 units (a full lay is 6x flat). Stop-loss: 50%.

#### B3. 3-Point Molly (Both)
- **How to play:** Pass + odds, plus two Come bets with odds, so three numbers are working. Replace come bets as they win.
- **House edge:** 0.37% each (Regular), 1.26% each (Crapless).
- **Risk:** Medium. A seven-out takes all three.
- **Bankroll:** 100+ units. Stop-loss: 40 to 50%.

#### B4. Place 6 and 8 (Both)
- **How to play:** After the point, Place 6 and 8 in $6 units (pays 7 to 6). Off on the come-out by default.
- **House edge:** 1.52% (0.46% per roll). This is Place, not Buy: under Standard, Buy 6/8 is worse at 2.27%.
- **Risk:** Low to Medium.
- **Bankroll:** 25 to 30 pairs. Stop-loss: 50%.

#### B5. Place 6/8 Regression & Press (Both)
- **How to play:** Open at $18 each. After the first hit, regress to $6 each. Then come down, or keep going on profit only.
  - **Press option (A1.4a):** after the regression, each later hit on 6 or 8 uses PRESS (+ the original $6) or POWER PRESS (Bill's ladder: $6 → $18, add $5), up to 3 per number. "Auto-press after each hit" (B-28) can do it automatically.
- **House edge:** 1.52%, unchanged.
- **Risk:** Medium, then Low.
- **Bankroll:** 20 to 25x the opening spread. Stop after 3 opening spreads lost.

#### B6. Crapless Line + Odds: "Make the line pay" (Crapless)
- **How to play:** Pass at the minimum, then always take max odds. On 2/3/11/12 points the max is 3x, paying 6 to 1 (2/12) and 3 to 1 (3/11).
- **House edge:** 5.38% flat, 1.26% with Standard max odds.
- **Risk:** Medium to High. A point of 2 or 12 wins only 1 time in 7.
- **Bankroll:** 80 to 100 units. Stop-loss: 50%.

#### B7. Crapless 6/8 Only, Avoid 2/3/11/12 (Crapless)
- **How to play:** Pass + odds and Place 6/8. No action on 2, 3, 11, 12 beyond the line.
- **House edge:** 1.52% on 6/8. Compare Place 2/12 at 7.14%, Place 3/11 at 6.25%, Buy 2/12 at 0.71% and Buy 3/11 at 1.25%.
- **Risk:** Low to Medium.
- **Bankroll:** 30 to 40 units. Stop-loss: 50%.

#### B8. Crapless Conservative Outside (Crapless)
- **How to play:** After the point, **Buy** 4, 5, 9, 10 (Standard: commission on win only). Leave 2, 3, 11, 12 alone. Minimum bets. Take everything down after 3 hits or one trip around.
- **House edge:** Buy 4/10 1.67% (0.42% per roll), Buy 5/9 2.00% (0.56% per roll). The Place versions are 6.67% and 4.00%; Tutor shows the comparison.
- **Risk:** Medium.
- **Bankroll:** 40 units. Stop-loss: 40%.

#### B9. Why You Skip Place 2/12 and 3/11 (Crapless, teaching card)
- **How to play:** An "avoid" lesson. Place 2/12 pays 11 to 2 against true odds of 6 to 1. Place 3/11 pays 11 to 4 against 3 to 1. Under Standard rules, **Buy** pays true odds less 5% of the stake, charged only on a win.
- **House edge:** Place 2/12 7.14%, Place 3/11 6.25% (both about 1.39% per roll). **Buy 2/12 0.71%** (0.14% per roll), **Buy 3/11 1.25%** (0.28% per roll). These buys are the lowest-edge number bets in Crapless.
- **Risk:** Very High on Place 2/12. The bet wins about 1 time in 7.
- **Bankroll:** n/a. Tutor shows this card when the player places 2/12 or 3/11.

#### B10. Crapless Come-Bet Ladder (Crapless)
- **How to play:** Pass + odds, then one Come bet per roll until three numbers are working. Take max odds on each.
- **House edge:** 5.38% per come bet flat, about 1.26% with odds.
- **Risk:** High.
- **Bankroll:** 120+ units. Stop-loss: 40%.

#### B11. Bubble Budget Grind (Both)
- **How to play:** Pass flat at the minimum, odds only if the budget allows, no props, 100-roll time limit.
- **House edge:** Regular 1.41%, Crapless 5.38%. Tutor steers the player toward Regular.
- **Risk:** Low.
- **Bankroll:** 30 units. Stop-loss: 15 units.

#### B12. Billy's Way (Both modes, Bubble Craps only): app preset
The full definition is in **A1.4**. Summary:
- **How to play:** One button posts one unit "across".
  - **Regular:** **Buy 4, 5, 9, 10** at the chip value and **Place 6 and 8** in $6-per-$5 units (chip × 6/5).
  - **Crapless:** the same, **plus Buy 2, 3, 11, 12**.
  - Each tap adds one more unit to every spot. It's usually tapped after the point is set, because Place/Buy are off on the come-out by default.
- **House edge (Standard):** **Regular 1.71% per bet blended (0.48% per roll). Crapless 1.43% (0.37% per roll).** Full table in A1.4.
- **Risk:** Medium to High. A 7 takes down 6.4 units (Regular) or 10.4 units (Crapless) per press.
- **Bankroll:** 15 to 20 presses' worth (about 100 to 130 units Regular, 160 to 210 Crapless). Stop-loss: 3 presses lost. Take everything down after 3 to 4 hits, or after collecting one full press of profit.
- **Not in Table Craps** (Bill's decision, Oct 10).
- **Press option:** "Auto-press after each hit" (B-28: PRESS or POWER PRESS) acts only on the Billy's Way spot that won (A1.4a).

#### B13. Continuous Come (Both; also Table Craps T11; rev 11, corrected by Bill at 9:20 PM)
- **What it is:** Pass + odds, then a **new Come bet with odds on every roll while the point is ON. It never stops making Come bets** (Bill). That includes Come bets that land on numbers already covered by Pass or another Come bet.
  - Every Come bet is its own "Pass Line" on its own number.
  - B3 (3-Point Molly) and B10 (Crapless ladder) are the capped cousins.
- **Setup (card options):**
  - **Unit** = the table minimum ($5 Standard).
  - **Odds level:** **Max** (the default: Regular 3-4-5x; Crapless 3x on 2/3/11/12 and 4/10, 4x on 5/9, 5x on 6/8), 2x, 1x or Flat.
  - **Come odds on the come-out:** **OFF** (the default, Standard) or Working.
  - **Optional cap:** **Off by default (uncapped)**. Turned on, it's 1–5 Come bets on numbers; no new Come bet is placed while (Come bets on numbers + the one in the Come box) ≥ the cap.
  - **"Play this"** checks the bankroll against the needs below.
    - If you're short at Max odds, it suggests the odds level that fits (2x or 1x) and shows the worst case. The player chooses; it never lowers odds silently.
    - It offers Session limits (A1.5b) at loss limit 40% / win goal 30% if they're Off.
- **Auto-bet logic** (runs before each roll, in this order):
  1. **Puck OFF (come-out):**
     - Put Pass at 1 unit if it's empty. There's no Come bet on the come-out (the Come box only opens with the point ON).
     - Established Come bets stay; their odds are **off** this roll (the default).
  2. **Puck ON:**
     - Top up the Pass odds to the odds level.
     - Top up the odds on each established Come bet that doesn't have them yet (including one that just arrived), using the even-payout amounts (5/9 even dollars, 6/8 multiples of $5; `fillComeOdds`).
  3. **New Come bet, every point-phase roll:**
     - The Come box is always empty again after each roll, because last roll's Come bet moved, won or lost. So place **1 unit in the Come box before every roll while the puck is ON**.
     - With the optional cap on, skip it while at the cap.
  4. **After each roll:**
     - **A number rolls (4–10, plus 2/3/11/12 in Crapless) and it already has a Come bet: "off and on", the real-table way.**
       - The established Come bet on that number **wins**: flat + odds paid to chips (its odds were working, or are returned if off).
       - The new Come bet from the box **moves onto that same number** as a fresh bet with no odds yet. Rule 2 adds its odds before the next roll.
       - A real dealer does this as "off and on": they pay the old bet and leave the chips in place for the new one rather than physically swapping them.
       - **There's never a stacked second bet**, because the roll that moves a Come bet to a number is the same roll that wins the Come bet already there. The build already settles it this way: `settleComeContracts` pays and clears `comeBets[n]` (`js/engine.mjs:1216-1223`) before `settleNewCome` moves the new bet in (`1248-1250`; call order `1378-1379`).
     - **A Come bet moves to the Pass point number:** that roll is the point made, so Pass wins at the same moment and the Come bet takes the number. There's never a Pass and a Come bet on the same number in a way that adds risk.
     - **New Come bet, first roll:**
       - Regular: 7/11 wins, 2/3/12 loses; 4–10 moves.
       - Crapless: only 7 wins, and **everything else moves, including 2/3/11/12**. Nothing loses on the first roll.
       - Either way a new one goes in the box before the next roll.
     - **Point made:** Pass pays. Rule 1 re-posts Pass. Come bets keep working (odds off on the come-out).
     - **Come-out 7:** Pass wins. Come flats lose, and their odds come back (odds off).
     - **Seven-out:** Pass, every established Come bet and their odds lose. **The Come bet in the box wins** even money. It starts again on the next come-out.
- **Press / regress:** **no presses.** The flat stays at 1 unit (B-28 auto-press acts on Place/Buy only). There's no lock-in by default (Bill: it doesn't stop). Optional stops are the cap above and the Session limits.
- **When to take down:**
  - Flat Come bets **can't** come down once they move (contract bets).
  - **Odds can come down any time** with "Odds off". The strategy offers it when it stops.
  - It stops placing bets only when:
    - a Session limit is hit (A1.5b);
    - the bankroll can't cover the next Come + odds (it never places partial odds; auto-roll pauses, A1.5a);
    - the player taps **Stop strategy**.
- **House edge (Standard)** is the same as the Pass Line (S1.2):

| | Flat Come (per bet) | Come + odds (combined, per total bet) | Per roll (flat) |
|---|---|---|---|
| **Regular** | 1.41% | **0.37%** (3-4-5x) · 0.61% (2x) · 0.85% (1x) | 0.42% |
| **Crapless** | 5.38% | **1.26%** (3-3-3-4-5x) · 2.02% (2x all) · 2.94% (1x) | about 1.29% |

  - **Uncapped means about one new flat bet per roll.** A hand averages 6.0 point-phase rolls (one Come bet each) plus about 2.5 Pass bets in Regular (1.9 in Crapless). That's ≈ 8.5 / 7.9 flat bets per hand, the same as the average hand length.
  - So the expected loss is about **$0.07 per roll** in Regular and **$0.27 per roll** in Crapless at $5 flats: about **$0.60** / **$2.12 per hand**. Odds don't add to this. They lower the *combined* edge and raise the swings.
  - Come odds off on the come-out doesn't change the edge; it only lowers come-out exposure.
- **Risk:** High (Regular), Very High (Crapless). It's lower with a cap or with 2x/1x odds.
- **Max exposure on one seven-out** ($5 unit; every number covered, which is the uncapped ceiling; the Come in the box wins $5 back):

| Odds level | Regular (6 numbers: Pass + 5 Come) | Crapless (10 numbers) |
|---|---|---|
| **Max** (default) | **$150** (30 units) | **$230** (46 units) |
| 2x | $90 (18 units) | $150 (30 units) |
| 1x | $60 (12 units) | $100 (20 units) |
| Optional cap 3 (max odds) | $110 (22 units) | $110 (22 units; the worst four numbers are still 5/6/8/9) |

- **Bankroll** (about 8x the worst-case seven-out):
  - Regular max odds **250 units** ($1,250 at $5); 2x 150 units; 1x 100 units.
  - Crapless max odds **400 units** ($2,000); 2x 250 units; 1x 170 units.
  - With the $1,000 starting chips, "Play this" suggests **2x in Regular** and **1x in Crapless**.
  - **Stop-loss:** **40%** of the session bankroll (Session loss limit 40%; rev 13b, was 30%). **Win goal:** +30%. This is the same 40% / 30% that "Play this" offers.
    - It fits the bankroll guide above. At $5, max odds: 40% of 250 units ($1,250) is $500, about 3 worst-case seven-outs ($150 each) in Regular. In Crapless, 40% of 400 units ($2,000) is $800, about 3.5 worst-case seven-outs ($230 each).
- **Tutor:** A1.8 rows "Continuous Come…" / "Come bet off and on". The line to always show: "Each Come bet is a new Pass Line. A new one every roll means about one flat bet per roll: same edge, more action, more at risk on a 7."

#### B14. Hit and Split (Both; Crapless option; also Table Craps T12; rev 11)
- **What it is** (the common definition): start with one Place bet on 6 or 8. Each time a number hits, **split the win into new Place/Buy bets** on the next uncovered numbers until you're **across** (4, 5, 6, 8, 9, 10). After that, collect.
  - Bill's example: **$12 on 6 wins $14 → add $6 on 8, keep $8.**
- **Uses its own logic, not PRESS.** PRESS adds the original bet to the *same* number from your chips. POWER PRESS puts the win back on the *same* number. Hit and Split moves the win to *other* numbers.
  - While B14 is active, **B-28 auto-press is suspended** (a Tutor line says so), so they can't fight.
  - The PRESS / POWER PRESS keys still work by hand. A manual press is treated as the player's override for that number (B14 won't regress it).
- **Setup (card options):**
  - **Start on:** 6 (default) or 8, at **2 units** ($12 at a $5 table, 6/8 units are $6 per $5).
  - **Number bets:** Place 6/8, and **Buy 4/5/9/10** (Standard: the cheaper of Place/Buy under the active rules, the same advisor as A1.8; under Standard, Buy wins on 4/5/9/10).
  - **Crapless extension:** **Off** (default), or "Extend with Buy 3/11 then 2/12".
  - **After across:** regress + collect (default), or collect only.
- **The ladder** (Bubble, $5 table; starting on 6, mirrored for 8). After each hit, **keep the number that hit at its current amount**, use the **win** for the next step, and send the rest to chips:

| Step | Trigger | Add (from the win) | On the felt after | At risk on a 7 |
|---|---|---|---|---|
| 0 | Point set | Place **6 $12** (from chips) | 6:$12 | $12 |
| 1 | 1st hit (6 pays $14) | **Place 8 $6**; $8 to chips | 6:$12 · 8:$6 | $18 |
| 2 | Next hit (6 pays $14 or 8 pays $7) | **Buy 5 $5 + Buy 9 $5** ($10). If the win is under $10 (an 8 hit, $7), add Buy 5 only and finish this step on the next hit | + 5:$5 · 9:$5 | $28 |
| 3 | Next hit (6 $14 · 8 $7 · 5/9 $7.25) | **Buy 4 $5 + Buy 10 $5** (same partial rule) | + 4:$5 · 10:$5 = **across** | **$38** |
| 4 *(Crapless option)* | Next hit (4/10 pays $9.75) | **Buy 3 $5 + Buy 11 $5** | + 3, 11 | $48 |
| 5 *(Crapless option)* | Next hit | **Buy 2 $5 + Buy 12 $5** | + 2, 12 | **$58** |

  - Payouts are the engine's: Place 6/8 7:6, Buy 4/10 $5 → $9.75, Buy 5/9 $5 → $7.25 (vig 5% on win only, `placeProfit` / `buyProfit`, `js/engine.mjs:210-240`). Any remainder goes to chips.
  - **The win isn't "house money"** (Tutor): once it's paid it's yours, and every split puts more of your chips at risk. After step 1, a 7 leaves the hand at −$4 (+$14 won, −$18 on the felt).
- **Regress / take down (default "regress + collect"):**
  1. **Once across:** the next hit on the **starting number** regresses it from $12 to **$6**. Its win and the $6 go to chips, leaving $32 on the felt ($52 with the Crapless option). Hits on other numbers are collected.
  2. **Lock-in:** after **2 collected hits once across**, **take everything down**. The ladder restarts at step 0 on the next point.
  3. Place/Buy stay **off on the come-out** (Standard), so a come-out 7 doesn't touch them. A point made just turns them off for the come-out; the ladder carries on.
  4. **Seven-out:** the ladder resets. That's one "start" lost (−$12 at step 0, less once wins were banked).
- **Crapless: does it extend to 2/3/11/12? Optional, Buy only, never Place.**
  - Buy 3/11 is 1.25% and Buy 2/12 is 0.71%, cheap per bet. But they hit only 2/36 and 1/36 of rolls, so they mostly add exposure on a 7 ($38 → $58).
  - Placing them is 6.25% / 7.14% (B9).
  - So it's default Off, and Tutor explains the trade.
- **House edge (Standard):**
  - Start: Place 6 **1.52%** (0.46% per roll).
  - Across ($12 on 6, $6 on 8, $5 Buy 4/5/9/10): **1.69% blended per bet** (0.47% per roll).
  - Crapless extended: **1.44%** per bet.
  - Splitting never changes any bet's edge; it changes how much is at risk.
  - The $12 on 6 wins before a 7 **5 times in 11** (45%).
- **Risk:** Medium, rising to Medium-High once across ($38 on a 7; $58 extended).
- **Bankroll:** **20 starts** ($240 = 48 units at $5). **Stop-loss:** 6 starts lost in a session, or the Session loss limit (40% suggested), whichever comes first. **Win goal:** +30%.
- **Tutor:** A1.8 rows "Hit and Split…". The line to always show: "Splitting re-bets your win on new numbers. Same odds per bet, more at risk on a 7."

## A1.8 Tutor: App 1

#### Beginner track
1. **Lobby:** "Play money. The machine rolls. Regular has the lower edge; Crapless is a variant."
2. **Puck OFF:** "Come-out roll. Bet the Pass Line."
3. Teach the come-out outcomes for the chosen mode.
4. **Point ON:** "Add Odds (no house edge, up to 3x/4x/5x)."
5. Suggest Place 6/8. On other numbers, "use Buy: it's cheaper here."
6. **Point hit / seven-out:** explain what happened. The puck resets.
7. After 10 rounds, show the good-vs-bad card and offer B1 or B4.

#### Experienced track
- Odds optimization (the best odds amount: even amounts on 5/9, multiples of 5 on 6/8), plus the combined-edge table for the current rules.
- Buy vs Place advisor (driven by the active commission rule).
- Regular vs Crapless side-by-side for the player's current bets.
- Billy's Way breakdown (A1.4): each spot's edge (Buy 4/10 1.67%, Buy 5/9 2.00%, Place 6/8 1.52%, plus Buy 2/12 0.71% and Buy 3/11 1.25% in Crapless), the blended edge (1.71% / 1.43%) and the seven-out exposure (6.4 / 10.4 units per press).
- Bankroll lines, regression and press coaching.
- **B13 Continuous Come:** uncapped by default (optional cap), odds level, cost per roll, worst-case seven-out exposure, off-and-on. **B14 Hit and Split:** ladder step, exposure on a 7, hand net, the Crapless extension trade (rev 11).

#### App 1 state table
| Game state | Beginner prompt | Experienced prompt |
|---|---|---|
| **Lobby / mode pick** | "Start with Regular. Crapless sounds friendlier but costs about 4x more on the Pass Line." | "Standard rules: Regular Pass + 3-4-5x = 0.37%; Crapless Pass + 3-4-5x = 1.26%." |
| **Betting timer** | "Bet before the timer ends. The machine rolls automatically." | "Exposure $X, blended edge Y%." |
| **Puck OFF, Regular** | "Come-out! Bet Pass: 7/11 win, 2/3/12 lose, anything else is the point." | "Place/Buy are OFF on the come-out. Pass is the best entry." |
| **Puck OFF, Crapless** | "Come-out! Only a 7 wins right away. Nothing loses on this roll." | "1 in 6 chance of a 2/3/11/12 point. Max odds there is 3x." |
| **Come-out craps (Regular)** | "Craps: Pass loses this time. Bet again." | "7/11 (8 ways) pay for craps (4 ways)." |
| **Come-out 2/3/11/12 (Crapless)** | "That's your point! It's a tough one, so add Odds: they pay 6 to 1 on 2/12." | "Take 3x odds. Want more action on 12? Buy 12 (0.71%), never Place (7.14%)." |
| **Point set** | "Point is 8. Add Odds. Want more? Place 6 and 8, or tap Billy's Way to cover every number at once." | "Max 5x on 8. Billy's Way = Buy 4/5/9/10 + Place 6/8: 1.71% blended (1.43% in Crapless), with 6.4 units at risk on a 7 (10.4 in Crapless)." |
| **Billy's Way tapped** | "Billy's Way posted: Buy $5 on 4, 5, 9, 10 and Place $6 on 6 and 8. A 7 takes them all down." | "Press 2: 12.8 units at risk. Blended edge stays 1.71% (1.43% Crapless). Plan: take it down after 3 to 4 hits." |
| **PRESS tapped** | "Pressed 8 to $12. That $6 came from your chips. Bigger bet, same odds: the house edge on Place 8 is still 1.52%." | "Press 8 +$6 (orig $6): at risk on a 7 is now $38 (was $32). Edge per bet unchanged; swings and exposure go up." |
| **POWER PRESS tapped** (rev 12 ladder) | "Power Press: your $7 win plus $5 from your chips takes the 8 to $18. Each step raises your risk; the odds stay the same." | "Ladder step $6 → $18 (add $5): at risk on a 7 +$12, expected loss per decision $0.09 → $0.27, edge 1.52% unchanged. It isn't 'house money': once a win is paid, it's your money." |
| **POWER PRESS with a Get** | "Power Press 4 → $40: the win covers it, and $2 comes back to your chips." | "Buy 4 $40 (converted from Place: 6.67% → 1.67%). At risk on a 7: +$25." |
| **POWER PRESS off the ladder** | "Your $25 on 6 joins Billy's ladder at $42, and $12.16 goes to your chips." | "Off-ladder: highest step within the win + $6 → $42. Next taps follow the ladder." |
| **Top of the ladder / table max** | "That's the top of Bill's ladder. Time to collect." / "Capped at your $X table max. The rest goes to your chips." | "The Standard max is $1,000, so the whole ladder fits. A cap only happens if you lowered the max (Premium B-13)." |
| **5/9 or 2/3/11/12 converted to Buy** | "Power Press 5 → Buy $36: Buy is the cheaper bet here. Same number, lower edge." | "Place 5 4.00% → Buy 5 2.00% (a casino's dollar breakage on a $36 Place would make it 4.44%). Crapless: Place 2 7.14% → Buy 2 0.71%." |
| **PRESS greyed out** | "Press and Power Press work right after a number bet wins." (+ the kicker reason) | Same, plus the reason: "seven", "bets off", "at table max", "not enough chips". |
| **Auto-press on** (first time) | "Auto-press will press (or Power Press) each Billy's Way spot that wins. More at risk, same odds." | "Auto-press: exposure grows on every hit; expected loss grows with the total bet. Cap it (B-28)." |
| **Roll, no line decision** | "Place/Buy bets on that number got paid." | "Hit on Buy 4: $39 on $20 after the $1 vig. Regress, press, or collect?" |
| **Point hit** | "Winner! The puck is OFF again." | "Net +$X, Y% of your win goal." |
| **Seven-out** | "Seven-out. Line, Place and Buy bets lose. That's normal." | "−$X. Session −Y%. Stop-loss at −Z%." |
| **High-edge bet tapped** (trigger: S2 "Edge warnings", rev 13d) | "Long shot with a high house edge." (or "Long shot." / "High house edge." when only one applies) | "Hard Way All Day: 21.4% edge at 165 for 1, 1 in 210 to win." |
| **Field bet placed** (rev 13d; never a long-shot or high-edge line) | "Field: wins on 16 of 36 rolls, but the 5–8 numbers lose. 5.56% edge." | "Field: 16 of 36 wins (2 and 12 pay 2 to 1); 5, 6, 7 and 8 lose. 5.56% edge per roll (2.78% with 12 at 3:1)."  |
| **ATS hit, re-armed** (both modes) | "Low Rolls complete! 2-3-4-5-6 all hit before a 7, so you won 30 to 1. The bet stays up and the lamps start over. Spin the block again, or tap to take it down." | "+$30 per $1 (Roll 'Em All +$155). Re-armed: the next cycle has the same 18.3% edge (18.0% for All). It's still up for this shooter until a 7. Take it down to lock in." |
| **Come-out 7 with ATS up** (both modes; key in Crapless) | "Seven on the come-out: your Pass Line wins, but a 7 ends Low Rolls, High Rolls and Roll 'Em All. ATS only cares about the dice total, not the point." | "Crapless come-out 7: Pass +1 unit, every ATS bet up loses. ATS edges are the same in both modes (18.30% / 17.98%). Crapless hands are shorter, so the per-hand hit chance is a bit lower: Low Rolls 1 in 29 vs 1 in 27." |
| **ATS lamp from a Crapless point roll** (Beginner, first time) | "That 2 set your point, and it also lit Low Rolls' 2 lamp. ATS counts every roll's total." | — |
| **Hard Way All Day wins** | "All four hardways hit! You won 164 to 1. The bet stays up and the lamps start over." | "+$164 per $1. Bet re-armed: same 21.4% edge on the next cycle. Take it down to lock in the win." |
| **Place 2/12 or 3/11 (Crapless)** | "Placing pays less here. Tap Buy instead." | "Place 2 7.14% vs Buy 2 0.71% (vig on win)." |
| **Hop bet placed** | "Hop 2-4: wins only if the very next roll is 2 and 4. Pays 15 to 1." | "Easy hop 11.11% (fair is 17 to 1). Hard hop 13.89% (fair 35 to 1). One roll, then it's decided." |
| **Hard hop vs hardway** | "Hop 4-4 is a one-roll bet. Hard 8 stays up until an 8 or a 7." | "Hard hop 4-4: 13.89% for one roll. Hard 8: 9.09% per bet (2.78% per roll)." |
| **Swiped to Side bets** (first time) | "Repeaters and Hops live here, so the board stays clean. Swipe back to the board." | "Side bets: Repeaters 18–22%, Hops 11–14%. High edges; small units." |
| **Repeater bet placed** | "Repeater 4: you win if 4 rolls 4 times before a 7. It pays 65 for 1, but it's a long shot (about 1 in 81)." | "Repeater 4: 19.75% edge (3.33% per roll). Fair would be 81 for 1. It works every roll, and any 7 takes it down, even on the come-out." |
| **Repeater hit, re-armed** | "Repeater 6 hit! You won 89 to 1. The bet stays up and the count starts over." | "+$89 per $1. Re-armed: the next cycle has the same 20.62% edge. Take it down to lock in." |
| **Blazing meter tier up** | "Hot hand: {n} rolls so far. Fun to watch. The next roll is still random, and a 7 is still 1 in 6." | "The Blazing meter = hand length so far, not a signal. Your edge per roll doesn't change. Size bets by your plan, not the meter." |
| **Long hand ends** | "That was a 14-roll hand. Long hands happen; so do quick ones. Dice have no memory." | "Hand length 14 vs about 8.5 on average. About 1 hand in 6 lasts 14+ rolls." |
| **Don't Pass takedown tapped** (Regular) | "Taking down your Don't Pass gives up its edge. With the point on 4, it now wins 2 times in 3." | "Don't Pass after the point is worth +33.3% of the flat on 4/10, +20.0% on 5/9, +9.1% on 6/8. Taking it down throws that away. Confirm?" |
| **Fair Dice unusual result** | "Your numbers look a bit uneven. That's normal over short sessions. Dice don't catch up; more rolls just even out the percentages." | "χ² p = 0.03. Random dice land here about 1 session in 20. No prediction value." |
| **Continuous Come started** (B13) | "Continuous Come: Pass first, then a new Come bet on every roll while the point is on. Each Come bet is like its own Pass Line." | "Come + 3-4-5x: 0.37% Regular, 1.26% Crapless. Uncapped = about one $5 flat per roll ($0.07 a roll Regular, $0.27 Crapless). Up to $150 at risk on a 7 ($230 Crapless). The Come bet in the box wins on that 7." |
| **Come bet travels** (B13) | "Your Come bet moved to the 9. The strategy adds odds: they have no house edge." | "Come 9 + 4x odds ($20). Odds are OFF on the come-out (default); the flat stays working." |
| **Come bet travels to 2/3/11/12** (B13, Crapless) | "In Crapless, a Come bet on 12 becomes a point, just like the line. It wins about 1 time in 7." | "Come 12: 3x odds pay 6 to 1. 5.38% flat, 1.26% with odds. 12 before 7 is 1 in 7." |
| **Come bet off and on** (B13) | "Your Come 6 won, and the new Come bet took its spot on the 6. The dealer calls that 'off and on'." | "Come 6 paid flat + odds. The new Come 6 is a fresh bet; odds go on before the next roll. Never stacked: $X now at risk on a 7." |
| **Every number covered** (B13) | "Every number has a bet now. A new Come bet still goes in each roll; when its number rolls, the old one there gets paid." | "Max exposure: $X on a 7 (all numbers + odds). Optional cap in the card if you want less." |
| **Seven-out with Come bets** (B13) | "Seven-out takes the Pass and every Come bet. A Come bet still in the Come box wins." | "−$X this hand. Flat cost stays 1.41% (5.38% Crapless) per Come bet. Loss limit: $Y left." |
| **Hit and Split started** (B14) | "Hit and Split: $12 on the 6. When it hits, the win goes onto more numbers." | "Place 6: 1.52%. It wins before a 7 about 5 times in 11. Auto-press is paused while this runs." |
| **Hit and Split: split** (B14) | "6 hit for $14! $6 went on the 8 and $8 went to your chips." | "That $6 was your win, and now it's at risk: $18 on a 7. Same 1.52% per bet. A 7 now would leave this hand at −$4." |
| **Hit and Split: across** (B14) | "You're across: 4, 5, 6, 8, 9 and 10. From here, wins go to your chips." | "Across: $38 on the felt, 1.69% blended (0.47% per roll). Plan: regress the 6 to $6, collect 2 hits, then take it all down." |
| **Hit and Split: Crapless extension** (B14) | "Extending adds Buy 3, 11, 2 and 12. They're cheap bets but rarely hit, so mostly they add to what a 7 takes." | "Buy 3/11 1.25%, Buy 2/12 0.71% (never Place: 6.25% / 7.14%). Exposure $38 → $58; blended 1.44%." |
| **Hit and Split: lock-in** (B14) | "Plan done: everything comes down. A new ladder starts on the next point." | "Hand net +$X, banked. The next hand has the same odds." |
| **Limit hit** | "You reached your limit. Nice discipline!" | Session summary: edge paid, odds used, best and worst bet. |
| **Fair Dice tab opened** | "Every roll uses a secure random generator. Here's how your rolls compare to fair dice." | "χ² over 11 totals; needs 180+ rolls. Per-die test under Each die." |

# APP 2: BILLY BUBS TABLE CRAPS
*(Formerly "Live Table." Regular craps only, with you as the shooter, dice-setting practice and multiplayer.)*

## A2.1 Screens and tabs (match the mockups in `app2-table/`)
| # | Mockup screen | Spec section |
|---|---|---|
| 01 | Home / onboarding ("How do you want to play?": **Solo table** · **Pass & play, 2–6 players** · **Shooter practice**; "Take the dice") | A2.2, A2.5, A2.7 |
| 02 | Table: shooter view (felt + dice tray, throw meter; keys **Bets · Strategies · Tutor · Stats**) | A2.2, A2.5, S4 |
| 03 | Multiplayer: pass-and-play (seat rail, "Pass the dice") | A2.7 |
| 04 | Shooter tutor (set / grip / throw steps) | A2.5, A2.6 |
| 05 | Strategy library (All / Baseline / Don't / Shooter) | A2.4 (header should read "TABLE CRAPS · STRATEGIES", mockup conflict 4) |
| 06 | Fair Dice (+ RSR, dice-set context) | S5 |
| 07 | Premium Custom Rules | A2.3 |
| 08 | Premium locked (Standard) | A2.3 |
| 09 | Repeater bets → the **left Side-bets screen** (+ Hops + Fire Bet tile) | S1.7, S1.4a, S4.1 |
| 10 | Fire Bet points lit (shooter screen) → the **right Dice screen** | A2.2a, S4.1 |

## A2.2 Standard (free) rules: App 2
| Rule | Standard | Edge effect |
|---|---|---|
| Game | **Regular only** (no Crapless) | — |
| Field | 2 pays **2:1**, 12 pays **2:1** | **5.56%** |
| Odds | **3-4-5x** | Pass/Come + max odds **0.37%** |
| Lay odds | Up to **6x the flat bet** | Don't + max lay **0.27%** |
| Lay bets on numbers | Offered; 5% commission on the win, **charged on wins only** (Bill, Oct 10) | Lay 4/10 **1.67%**, 5/9 **2.00%**, 6/8 **2.27%** (vig on win). Premium "up front" (T-7): 2.44% / 3.23% / 4.00% |
| Buy bets | **All** numbers (4–10), **5% commission on wins only** | Buy 4/10 1.67%, 5/9 2.00%, 6/8 2.27% |
| Place/Buy on come-out | OFF | — |
| Hardways on come-out | Working (`hardwaysOffComeOut: false`, `js/table-engine.js:80`) | — |
| Don't Pass bar | 12 | — |
| Don't Pass / Don't Come takedown | **Allowed** once a point is on (take down or reduce; Bill, Oct 10). Tutor warns first | Taking it down gives up a bet that's now the favorite: worth +33.3% of the flat on 4/10, +20.0% on 5/9, +9.1% on 6/8 |
| Big 6/8 | Off by default (toggle) | 9.09% |
| Hard Way All Day | **165 FOR 1**, stays up after a win | 21.43% (S1.5) |
| ATS (Low / High / Roll 'Em All) | 31 / 31 / 156 FOR 1, **stays up** after a hit | 18.30% / 18.30% / 17.98% (S1.6) |
| **Repeaters** | 40/50/65/80/90 **FOR 1**. Works every roll; any 7 (including a come-out 7) loses; bet any time; stays up after a hit | 18.08%–21.88% (S1.7) |
| Billy's Way | **Not in App 2** | — |
| **Fire Bet** | **Offered** (Table Craps only). Bet only before the new shooter's first come-out roll; pays on different points made: 4 / 5 / 6 points at **24 / 249 / 999 to 1**; under 4 pays nothing; 6 pays at once | **20.76%** (≈ 2.4% per roll) (A2.2a) |
| Table min / max | **$10** / $500 (the minimum matches the code minimum `1000` cents, `js/table-engine.js:72`); Repeaters $1–$25 per number. **The $500 max applies per bet** to flats, Place, Buy, Lay and props. **Odds and lay odds are exempt:** they follow T-3 / T-4 only (rev 15, P14-8). **Prop minimum $1** for hardways and Any Craps (P14-14). *Rev 16: higher limit tiers are PROPOSED in S10 (T-31); Standard is unchanged* | — |
| **Lay bets / Don't Come lay odds on the come-out** (rev 15, P14-7) | **Working** (T-30) | — |
| Starting practice bankroll | $1,000 | — |
| Players | **Single player** by default; the **shooter keeps the dice** after a seven-out | — |
| Multiplayer | Pass-and-play (MVP); dice pass to the left after a seven-out (A2.7) | — |
| Dice | Secure RNG. Dice set and throw meter are practice only and don't change results (S5.1) | — |
| Blazing meter | On (cosmetic, S6) | — |

## A2.2a Fire Bet: DEFINED (Table Craps only; from Bill, Oct 10)

**Where it's offered:**
- **Billy Bubs Table Craps only** (Regular rules; App 2 has no Crapless).
- **Never** in Bubble Craps, in either Regular or Crapless.
- **Code check:** there's no Fire Bet anywhere in the code today. A case-insensitive search for "fire" in `/tmp/bbp` (HEAD `6a13aff`) finds nothing, so this is new.

**Rules** (checked against Wizard of Odds, [Fire Bet](https://wizardofodds.com/games/craps/side-bets/fire-bet/), updated Aug 2026; Maryland's [Craps Standard Rules v1.5](https://www.mdgaming.com/wp-content/uploads/2024/06/Craps-Standard-Rules-Version-1.5.pdf), ch. 11; Washington's [Fire Bet training sheet](https://wsgc.wa.gov/sites/default/files/2023-11/57_fire-bet.pdf); the [LNW Gaming](https://gaming.lnw.com/Games/Table-Games/Table-Games/Craps-Side-Bets/Fire-Bet-7861) product page):

| Rule | Spec | Source note |
|---|---|---|
| **When it can be bet** | **Only before the new shooter's first come-out roll** (Bill, rev 7). Once that first come-out roll is thrown, no new Fire Bets until the next shooter, even if the come-out was a 7, 11 or craps. | Matches Maryland: "accepted only prior to a shooter's initial come out roll". (Washington takes bets until the first point; not used.) |
| **What counts** | Each **different** point (4, 5, 6, 8, 9, 10) the shooter **makes** on the Pass line. Making the same point again doesn't count again. Order doesn't matter. Come-bet numbers don't count. | All sources. |
| **Come-out wins/losses** | Don't affect a Fire Bet that's already up (it was placed before the first roll). | Washington, Seven Feathers. |
| **When it ends** | At the **seven-out**, or **as soon as the 6th different point is made**. In that case it's paid right away and the bet ends. | Washington: "only the seven-out or making all 6 individual points terminates the bet". |
| **What pays** | **Only the highest level reached**, paid once. **Under 4 points pays nothing** (the bet loses), except the Premium "Fire 3" preset. | All sources. |
| **Takedown** | **Can't be taken down** once the shooter's first come-out roll is thrown. Before that it can come down. | Washington, Seven Feathers. |
| **Bets Off** | Not affected. | — |
| **Limits** | Standard $1 min, $10 max per player per shooter. | Small units (Tutor). |

**Single player:** the shooter keeps the dice. Each new hand after a seven-out counts as a **new shooter** for Fire, so the window reopens before that hand's first come-out roll.

**Multiplayer (A2.7):**
- Each player has their own Fire Bet on the **current shooter's hand**, whether or not they're the shooter and whether or not they bet Pass.
- Everyone's bet tracks the same set of points, because the dice are shared.
- The window opens for everyone when a new shooter takes the dice and **closes when that shooter throws their first come-out roll**.
- At the seven-out, each player's Fire Bet settles before the dice pass.

**Exact math.** Exact Markov over the 64 "points already made" states. Each point decision makes point *n* with probability (ways/24)·(ways/(ways+6)) and sevens out with 98/165.

| Different points made | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| Probability | 59.394% | 26.075% | 10.128% | 3.343% | 0.8798% | 0.1640% | 0.01624% (1 in 6,156) |

- Any Standard win (4+ points): **1.060%**, about 1 in 94.
- My numbers match Wizard's table to every digit shown.

**Pay tables (all "TO 1"):**

| Preset | 3 points | 4 points | 5 points | 6 points | **House edge** | Tier |
|---|---|---|---|---|---|---|
| **Standard** (Wizard "Pay Table A", the most common; LNW's 25/250/1000 **for** 1 is the same) | — | **24 to 1** | **249 to 1** | **999 to 1** | **20.76%** (exact 20.763%) | **Standard** |
| **Long Six** (real: Wizard "Pay Table B") | — | 10 to 1 | 200 to 1 | 2,000 to 1 | **24.86%** | Premium |
| **Fire 3** (real: Wizard "Pay Table C"; pays from 3 points) | 6 to 1 | 29 to 1 | 149 to 1 | 299 to 1 | **20.73%** | Premium |
| **Generous** (app-made, labeled "practice preset, not a casino table") | — | 29 to 1 | 299 to 1 | 999 to 1 | **8.16%** | Premium |

- **Edge per roll:** about **2.4%** (20.76% ÷ about 8.5 rolls per hand).
- **Not offered: the example in the brief.** 9 / 99 / 999 to 1 for 4 / 5 / 6 points works out to a **58.56%** edge, nearly three times worse than any real table. Use Long Six or Fire 3 instead.

**Felt and UI (the locked layout stays unchanged):**
- No printed spot on the locked felt. The bet lives on the **left Side-bets screen** (Fire Bet tile; S4.1). The Fire rail also shows on the right shooter screen (mockup `10-fire-bet-points-lit`).
- It also has a **Fire rail**: six small point markers (4 5 6 8 9 10), lit when that point is made, with a count badge ("3 of 6").
- Toasts:
  - "Fire Bet: 4 points! Pays 24 to 1 at the seven-out."
  - At 6 points: "Fire Bet: all six! +$999 per $1. Paid now."
  - At a seven-out with 0–3 points: "Fire Bet down (2 points)."
- **The Fire Bet is a bet; the Blazing meter is a meter.** Keep them visually separate:
  - The Blazing meter (Cold / Warm / Hot / **Blazing**) never shows point markers or the word "Fire".
  - The Fire rail never uses the Blazing meter gauge's colors or motion.
  - Tutor says so the first time both are on screen (A2.6).

**Edge Preview (T-27):** "Fire Bet 20.76% → 8.16% (Generous). Win chance 1 in 94 (4+ points)."

## A2.2b Chip rail: DEFINED (Table Craps only; Bill via Chief, Oct 12, rev 15a)

**What it is:** the rail along the bottom of the Board screen shows the player's **practice chips that are not on the felt**, as stacks by denomination: **$500 · $100 · $25 · $5 · $1** (left to right). **There's no $10 chip** (S4 Chips). The rail is also the chip selector: tap a stack to pick the betting chip. It replaces the plain chip rack in App 2; Bubble Craps keeps its rack.

**The one rule that can't break (INVARIANT):**
> **Rail total = bankroll − bets on the table**, to the cent, after every action (bet, take-down, settle, change, color-up, reset, reload, seat switch).
- In engine terms: `railTotal(rail) === state.bankroll === netWorth(state) − tableTotal(state)`. The engine bankroll is the only source of truth; the rail never moves money by itself, it only re-shapes it.
- Chip counts are whole numbers ≥ 0. The **change cup** (below) is 0–99¢.
- Required test **RT-24** (checklist) checks this after every bet and every roll.

### A2.2b.1 Rail state
- `rail = { 50000: n, 10000: n, 2500: n, 500: n, 100: n, cup: 0..99 }` (cents, like the engine).
- **Persisted with the bankroll** (same save). Multiplayer: **one rail per seat**; only the active seat's rail is on screen (A2.7.6).
- **On load,** if the saved rail doesn't total the saved bankroll (old save, corruption), rebuild it with the breakdown below and log `rail-rebuilt` (never shown to the player). In tests this must never happen.

### A2.2b.2 Bankroll-to-stacks breakdown (used at start, after Reset bankroll, after color-up, and on rebuild)
Greedy, with a **change reserve** so the player can always make small bets:
1. **Cup** = bankroll mod $1 (cents). Whole dollars D go to chips.
2. **Reserve $1s:** 5 × $1 (or all of D if D < $5).
3. **Reserve $5s:** 4 × $5 ($20) from what's left (as many as fit).
4. **Greedy** for the rest: $500, then $100, $25, $5, $1.
- Example, $1,000 start: 1 × $500, 4 × $100, 3 × $25, 4 × $5, 5 × $1. $300: 2 × $100, 3 × $25, 4 × $5, 5 × $1. $12.50: 7 × $1, 1 × $5 + 50¢ in the cup (5 × $1 reserve, 1 × $5, then 2 × $1).
- The breakdown is a pure function: `railBreakdown(cents) → rail`; the same input always gives the same rail.

### A2.2b.3 Display limits and overflow (fit at 320 px)
- **One stack per denomination,** always in the same place; an empty stack shows a faint outline (still tappable to select that chip).
- **A stack draws at most 10 chips** (3 px offset each). Over 1 chip, a **count badge** shows the exact number ("×23"); over 10 the art stops growing and the badge carries the count. Over 999: "×999+" on the badge, exact count in the accessible label and long-press sheet.
- **Long-press (or the ⓘ in the HUD)** opens "Your chips": each denomination × count, the cup, and the total. *(Rev 15d: unchanged; the sheet footer links the **Color up** and **Check change** lingo terms, S4.5.)*
- **The rail total is not printed on the rail.** The HUD "Practice chips" value is the rail total, so there's one number.
- The change cup shows as a small coin icon with the amount ("50¢") at the right end only when it isn't 0.

### A2.2b.4 Betting from the rail and change-making
- A bet is paid **by amount**, not by chip type. The selected chip sets the increment (as today); the rail pays the amount with the **fewest chips**, largest first, from what it holds.
- **If the rail can't make the exact amount** (e.g. a $10 bet with only $25 chips), the dealer **breaks the smallest chip that covers it**, one step down: $500 → 5 × $100, $100 → 4 × $25, $25 → 5 × $5, $5 → 5 × $1. Repeat until it can pay.
  - **Animation "Change":** the chip lifts, splits into its smaller chips with a short fan (≈ 350 ms), label "Change: $25 → 5 × $5". Dealer Billy's line (first time per session only): "Here's your change."
  - The money state is already final when the animation starts; **Roll is never delayed** by it (pressing Roll finishes it instantly).
  - Reduce motion: no fan; a 150 ms crossfade and the same label.
- **Amounts with cents** (Buy vig "Always" T-5 up front, Lay vig up front T-7): the cents come from the cup; if the cup is short, break a $1 into the cup (label "Change: $1 → 100¢").
- **Bankroll too low:** unchanged engine rules (the bet is refused with the existing message). The rail never goes negative.
- Strategies and auto-bets (A2.4, autoBet) pay through the same function, so they obey the invariant too.

### A2.2b.5 Money coming back to the rail
- **Every credit** (a win's profit, a returned stake, a push, a take-down, a Fire Bet pay, a strategy collect) arrives as the **greedy breakdown of that amount** (largest chips first, no reserve), with the existing payout pulse (chips slide from the felt to the rail).
- **Losses never touch the rail;** those chips were already on the felt.
- **Odd amounts:** the engine pays to the cent with its current rounding (floor to the cent, e.g. Place 6/8 $10 → $11.66; Buy $10 on 4 → $19.50; lay odds $25 on 4 → $12.50). Whole dollars go to chips; **cents go to the cup**. When the cup reaches 100¢ it becomes a $1 chip automatically (no prompt).
- **Commissions:** on-win vig is already netted out of the profit, so the rail gets the net (A2.2, decided). Up-front vig: see A2.2b.4.
- **Odds payouts:** same as any credit. Example: $15 odds on 5 pays $22.50 → $22 in chips ($5 × 4 + $1 × 2) + 50¢ cup; the stake's $15 comes back as $5 × 3 if the bet comes down, or stays on the felt if it works.

### A2.2b.6 Color-up
- **When it's offered:** after a settle, if **$1 chips > 20** or **$5 chips > 20** (beyond the reserve), a small **"Color up"** pill appears on the rail. One tap: the small chips slide together and come back as larger ones (≈ 500 ms, label "Color up: 25 × $1 → $25").
- **What it does:** keeps the change reserve (5 × $1, 4 × $5) and re-runs the greedy breakdown on the rest of the $1s and $5s, plus any 4+ $25s into $100s and 5+ $100s into $500s. Total unchanged.
- **Setting (Settings › Table, "Color up"):** **Offer** (default) · Auto · Off.
  - **Auto** does it right after a settle, never during a roll or a bet, and never moves chips on the felt.
  - **Off** never prompts.
- **When the player leaves the table** (ends the session / "Leave table"): the rail **always colors up** for the session summary, which shows the final stacks and "Practice chips: $1,245.50". *(Bill said "on cash-out"; that word is banned in both apps (the play-money disclaimer and checklist RT-22), so the UI says "Leave table".)*
- Reduce motion: crossfade, no slide.

### A2.2b.7 Accessibility
- The rail is one group, label "Your chips: $1,245.50. 2 five-hundreds, 3 hundreds, 1 twenty-five, 4 fives, 5 ones, 50 cents."
- Each stack is a button ("$25 chip, 1 chip, selected"). The selection shows a ring **and** a raised stack, not color alone. Targets ≥ 44 × 44 px.
- Change and color-up are announced once (`aria-live="polite"`): "Change: one $25 for five $5s." Badge text ≥ 11 px and readable at 130% text.

### A2.2b.8 Fit
- **320 px:** 5 stacks × 56 px + 4 × 6 px gaps = 304 px inside 8 px side padding. Rail height ≤ 64 px (10-chip cap). The cup sits in the last stack's corner at 320–359 px.
- 360–430 px and landscape: same row, wider gaps. Landscape (S4.1): the rail stays under the board, never over the dice.
- No overlap with ROLL, the dock, Tutor or toasts at any size, with 130% text.

### A2.2b.9 What's reused from Bubble Craps (`bb-bc-yrkv` @ `51c229b`)
- **REUSE:** chip art and loaders (`chipSrc`, `chipPng`, `chipHTML`), `CHIPS`, `formatMoney`, the payout chip burst (`burstChips`), `haptic`, `motionOff`, `audio.chip()`.
- **REUSE+ADAPT:** `breakChips` (add the change reserve and an uncapped count mode), `chipStack` (count badge, 10-chip cap), `addBet` / `takeBet` and `settle` callers (route debits and credits through the rail), the HUD "Practice chips" value.
- **NEW:** the rail state and its functions (`railBreakdown`, `railPay`, `railCredit`, `railColorUp`, `railTotal`, `railRebuild` in a new `js/rail.mjs`), the change and color-up animations, the Color-up setting, the per-seat rail, and the invariant test.

## A2.3 Premium Custom Rules: App 2
Mockups 07 and 08. Presets: Standard, Strip Classic, Strip Deluxe, Strat 10x, Downtown 10x, Custom. Changes apply at the next come-out.

| ID | Setting | Options | Standard default | Premium range / notes |
|---|---|---|---|---|
| T-1 | Field 2 pays | 2:1, 3:1 | 2:1 | Code modes `double`, `twelveTriple`, `triple` (`js/table-engine.js:185-190`) |
| T-2 | Field 12 pays | 2:1, 3:1 | 2:1 | Edges 5.56% / 2.78% / 0% |
| T-3 | Odds limit | 1x, 2x, **3-4-5x**, 5x, 10x, 20x, 100x | 3-4-5x | Code supports 3-4-5x, 5x, 10x; 20x/100x new |
| T-4 | Lay odds limit | Match pass odds (lay ≤ 6x flat), or flat cap 6x / 10x / 20x | Win 3/4/5x (lay ≤ 6x flat) | Any |
| T-5 | Buy commission timing | **On win only**, Always | On win | Code `vigBuy: "win"` (`js/table-engine.js:78`) |
| T-6 | Commission rounding | Exact 5%, $1 per $20, $1 per $25 | Exact 5% | Any |
| T-7 | Lay commission timing | **On win only**, Up front | On win (Bill) | Up front: Lay 4/10 2.44%, 5/9 3.23%, 6/8 4.00%. Code default is `vigLay: "upfront"` (`js/table-engine.js:79`) → code change |
| T-8 | Buy available on | All numbers, Only 4/10, Off | All | Any |
| T-9 | Place/Buy working on come-out | Off, On | Off | — |
| T-10 | Hardways working on come-out | On, Off | On | Code `hardwaysOffComeOut` (`:80, 736`) |
| T-11 | Don't Pass bar | Bar 12, Bar 2 | Bar 12 | — |
| T-12 | Table minimum | $1, $3, $5, $10, $15, $25 | **$10** | $1 to $25 |
| T-13 | Table maximum | $100 to $5,000 | $500 | Must be ≥ 20x the minimum |
| T-14 | Starting practice bankroll | $200, $500, $1,000, $5,000, custom | $1,000 | $100–$100,000 practice chips; per seat in multiplayer |
| T-15 | Horn payouts | 30:1 / 15:1, 31:1 / 16:1 | 30:1 / 15:1 | — |
| T-16 | Any 7 payout | 4:1, 4.5:1 | 4:1 | 4.5:1 → 8.33% |
| T-17 | Hardway payouts | US, AU | US | — |
| T-18 | Side-bet toggles | Horn, Horn singles, Hop bets, Hardways, Any 7, Any Craps, Yo, C&E, Field, Hard Way All Day, ATS, **Repeaters**, **Fire Bet**, Big 6/8 | All on except Big 6/8 off | Any |
| T-19 | Hard Way All Day pay | 150 / **165** / 175 / 200 for 1, 165 **to** 1 | 165 for 1 | S1.5 |
| T-20 | ATS comes down after a hit | Off, On | Off | Per-cycle edge unchanged |
| T-21 | ATS pay table | 31/31/156, 35/35/176 for 1 | 31/31/156 | S1.6, S1.8 |
| T-22 | Repeater pay table | Standard, Generous, Near-fair | Standard | S1.7 |
| T-23 | Repeaters come down after a hit · off on the come-out (patent style) · come-out-only betting | Three toggles | All off | Edges unchanged |
| T-25 | Seven-out dice behavior | Keep (single player), Pass (multiplayer) | Keep | Locked by mode, shown read-only |
| T-26 | Multiplayer betting timer | Off, 30 s per player (online later: 10–45 s window) | Off (pass-and-play) | A2.7 |
| T-27 | Fire Bet pay table | **Standard 24/249/999 to 1**, Long Six 10/200/2,000, Fire 3 (6/29/149/299 from 3 points), Generous 29/299/999 | Standard | 20.76% / 24.86% / 20.73% / 8.16% (A2.2a) |
| T-28 | Fire Bet limits | Min $1–$5, max $5–$25 | $1 / $10 | Small units only |
| T-29 | Hop pays (the 17 non-Horn hops) | **15 / 30 to 1**, 16 / 31, 16 / 33 | 15 / 30 | Same edges as B-29. The Horn singles follow T-15 |
| T-30 | Lay bets and Don't Come lay odds working on the come-out (rev 15) | On, Off | **On** | Edge unchanged; only exposure changes |
| T-31 | **Limit tier (rev 16, PROPOSED, S10)** | Standard $10 / $500 · High limit $25 / $2,000 · High roller $100 / $5,000 · Salon $500 / $25,000 (only if T-13's range is raised) · Custom (T-12 / T-13) | Standard | Odds exempt. Suggested Free (Bill's call); custom stays Premium |
| T-32 | Roll speed (rev 16, S11) | Normal · Fast · Instant (Shooter practice caps at Fast) | Normal | Not a rule; free Settings |
| T-33 | Quick bets: include my point (rev 16, S12) | Off · On | Off | Not a rule; free Settings |

**Premium features (not rules):** Fair Dice CSV export, saved presets. **Rev 15 (DECIDED): Strategy Comparison** (`table-strategies-appendix.md` Part 3) and the Premium strategies listed in A2.4.

## A2.4 Strategy library: App 2 (Regular, 24 strategies, T1–T24; DECIDED rev 15)

> **Rev 15 (DECIDED, Bill via Chief, Oct 12):** the full strategy cards (T1–T24), tutorials and the Strategy Comparison feature are in **`table-strategies-appendix.md`**, which is the source of truth for the rules of each card. The short cards below are summaries; T1–T10 now carry the rev 15 amounts and limits.
> - **Ranked shortlist (24):** T1, T5, **T13**, T4, T2, T6, T7, T3, T9, **T15**, T10, **T17**, **T14**, T12, T11, **T16**, **T22**, **T24**, **T23**, **T19**, **T18**, T8, **T21**, **T20** (new ones in bold).
> - **New cards:** T13 Pass + Place 6/8 · T14 $64 Across + Regression · T15 3-Point Dolly · T16 Lay the Outside · T17 Hit and Run · T18 5-Count · T19 Doey-Don't · T20 Martingale on the Don't (warning) · T21 Come-out Hedge (warning) · T22 Power Press Ladder (coach steps, no button) · T23 Don't Pass + Place 6/8 Hedge · T24 Inside + Lay the Outside ("Wise Guy").
> - **Free / Premium split (decided):**
>   - **Free:** T1–T13, T17, and the warning cards T20 and T21 (warnings are never paywalled; nothing free today moves to Premium).
>   - **Premium:** T14, T15, T16, T18, T19, T22, T23, T24, plus the **Strategy Comparison** (appendix Part 3).
> - **Unit conflict found:** T5 ($6 units), T6 ($22 Inside: $5 / $6) and T7 ($22 Iron Cross) can't be bet at the $10 Standard minimum (T-12). **Fixed in rev 15:** $12 on 6/8, a $44 Inside and a $44 Iron Cross. The $5 amounts apply only when T-12 = $5 (P14-3).
> - **Stop-loss:** **40% / +30% on every card** (rev 15, P14-4; was 50% or 40–50% on T1–T10).
> - **Overlaps:** T13 = T1 + T5 plus the point rule. T14 is the same $64 spread as Bubble's Billy's Way, set by hand and named "Across". T22 overlaps T10 and A1.4a, as coach steps only. T23 is the old app's `hedge` without the lay. T20 replaces the old Pass-side `martingale`. T12 gets an optional "option B" from a Color Up video.

#### T1. Pass Line + Max Odds
- **How to play:** Pass on the come-out, then 3-4-5x odds.
- **House edge:** 1.41% flat (0.42% per roll), **0.37%** with Standard odds.
- **Risk:** Low to Medium.
- **Bankroll:** $500 (50 units) at 3-4-5x or 5x; $900 at 10x. **Stop-loss 40%, win goal +30%** (rev 15).

#### T2. Don't Pass + Lay Odds
- **How to play:** Don't Pass, then lay up to **6x the flat bet** once a point is set (for example $10 flat lays $60, which wins $30 on 4/10, $40 on 5/9, $50 on 6/8).
- **House edge:** 1.36% per bet made, 1.40% per bet resolved, **0.27%** with max lay.
- **Risk:** Low.
- **Bankroll:** $600 (60 units) at 3-4-5x; $900 at 5x; $1,700 at 10x. **Stop-loss 40%, win goal +30%** (rev 15).

#### T3. Come / Don't Come with Odds
- **How to play:** Same as the line bets, made after a point is on. **Come odds are OFF on the come-out by default.**
- **House edge:** 0.37% (Come + odds), 0.27% (Don't Come + lay).
- **Risk:** Medium.
- **Bankroll:** $1,000 (100 units); $1,800 at 10x. **Stop-loss 40%, win goal +30%** (rev 15).

#### T4. 3-Point Molly
- **How to play:** Pass + 2 Come bets, all with max odds.
- **House edge:** 0.37% each.
- **Risk:** Medium.
- **Bankroll:** $1,500 (150 units); $2,700 at 10x ("Play this" suggests 2x on $1,000). **Stop-loss 40%, win goal +30%** (rev 15).

#### T5. Place 6 and 8
- **How to play:** **$12 each** on 6 and 8 after the point (rev 15; was "$6 units", which is under the $10 minimum).
- **House edge:** 1.52% (0.46% per roll).
- **Risk:** Low to Medium.
- **Bankroll:** $200 (20 units). **Stop-loss 40%, win goal +30%** (rev 15).

#### T6. Inside Numbers ($44 Inside)
- **How to play:** 5, 6, 8, 9 with **$10 on 5/9 and $12 on 6/8 = $44** (rev 15; was $22, under the $10 minimum). **Standard tip:** Buy 5/9 instead of placing them (commission on win only); Buy $10 on 5 pays $14.50.
- **House edge:** Classic all-Place: about 2.6% per bet, 0.76% per roll. **Buy 5/9 + Place 6/8 (Standard): about 1.7% per bet, 0.51% per roll.**
- **Risk:** Medium.
- **Bankroll:** $400 (40 units). **Stop-loss 40%, win goal +30%** (rev 15).

#### T7. Iron Cross
- **How to play:** Field + 5, 6, 8 (**$10 Field, $10 on 5 (Buy recommended), $12 on 6 and 8 = $44**; rev 15, was $22). Every total except 7 wins something. A 7 loses all four.
- **House edge:** The Standard Field (2:1 / 2:1) is 5.56% on every roll. Blended, Iron Cross costs about **1.8% per roll** with Place 5, or about 1.6% with Buy 5. That's worse than Place 6/8 alone (0.46% per roll).
- **Risk:** Medium.
- **Bankroll:** $400 (40 units). **Stop-loss 40%, win goal +30%** (rev 15).

#### T8. Hardways Hedge
- **How to play:** $1 on Hard 6 and Hard 8 alongside Place 6/8 $12 each ($26). Hard 6/8 pays 9 to 1, Hard 4/10 pays 7 to 1. Hardways use the $1 prop minimum (rev 15).
- **House edge:** Hard 6/8 9.09%, Hard 4/10 11.11% (both 2.78% per roll).
- **Risk:** High.
- **Bankroll:** $300 (30 units). **Stop-loss 40%, win goal +30%** (rev 15). Keep hardways under 10% of the total wager. Tutor calls this "a fun bet, not a hedge."

#### T9. Regression
- **How to play:** Open big, cut back after the first hit: **$88 Inside (Buy 5/9 $20, Place 6/8 $24) → $44** after the first hit (rev 15; appendix T9).
- **House edge:** The same as the underlying bets.
- **Risk:** Medium, then Low.
- **Bankroll:** $800 (80 units). **Stop-loss 40%, win goal +30%** (rev 15).

#### T10. Press Progressions
- **How to play:** Half-press or full-press using winnings only. Cap at 2 presses per number, or 5x the opening bet.
- **House edge:** Unchanged ([Wizard on betting systems](https://wizardofodds.com/gambling/betting-systems/)).
- **Risk:** High.
- **Bankroll:** $400 (40 units) on a $44 Inside base. **Stop-loss 40%, win goal +30%** (rev 15). Once up 50%, set aside the original buy-in.

#### T11. Continuous Come (= App 1 B13; corrected by Bill at 9:20 PM)
- **How to play:**
  - Pass + max odds.
  - Then, while the point is ON, a **new Come bet with odds before every roll. It never stops** (uncapped by default), including on numbers already covered.
  - **Come odds OFF on the come-out** (the default, as T3).
  - The optional cap (1–5) is **off by default**.
  - A Come bet that moves to a number that already has one is handled **off and on**: the old bet wins and is paid, and the new bet takes the number. It never stacks.
  - It's the same per-roll logic and take-down rules as **B13** (Regular only here). Flats can't come down after they move; odds can come down any time.
- **Table Craps specifics:**
  - The unit is the **$10** table minimum.
  - **Multiplayer:** each seat runs its own copy on its own bankroll. The coach speaks only to that seat (A2.7). It doesn't matter who's shooting.
- **House edge:**
  - 1.41% flat, **0.37%** with 3-4-5x (per total bet; 0.42% per roll flat).
  - About one $10 flat bet per roll ≈ **$0.14 per roll**, about $1.20 per hand.
- **Risk:** High.
- **Max exposure on a seven-out** ($10): **$300** at max odds (all six numbers), $180 at 2x, $120 at 1x. The optional cap 3 is $220.
- **Bankroll:** 250 units at max odds ($2,500 at $10); 150 units at 2x; 100 units at 1x. **Stop-loss:** **40%** ($1,000 at max odds; rev 13c, was 30%, matches B13). **Win goal:** +30%.

#### T12. Hit and Split (= App 1 B14)
- **How to play:** the same ladder as **B14** at the **$10** table:
  - start **Place 6 $24** (or 8);
  - 1st hit pays $28 → **add Place 8 $12**, $16 to chips;
  - then **Buy 5 + 9 $10 each**, then **Buy 4 + 10 $10 each** = across (**$76** on the felt).
  - Once across, regress the starting number to $12, collect 2 hits, then take everything down.
  - **No Crapless extension** (Table Craps is Regular only).
- **Table Craps specifics:**
  - Buy 4/5/9/10 at commission on wins only (Standard). Buy $10 on 4 pays $19.50, on 5 pays $14.50.
  - There's **no PRESS / POWER PRESS / B-28** in Table Craps (A1.4a), so the splits are the coach's step list (the T10 planner).
- **House edge:** Place 6 1.52% at the start. Across about **1.69%** blended (0.47% per roll).
- **Risk:** Medium to Medium-High ($76 on a 7 when across).
- **Bankroll:** 20 starts ($480 = 48 units). **Stop-loss:** 6 starts lost or 40%. **Win goal:** +30%.

*(Billy's Way is **not** offered in Table Craps. It's a Bubble Craps preset only, per Bill's decision on Oct 10. Table Craps players build the same spread by hand: Buy 4/5/9/10 + Place 6/8 = T6 Inside plus 4/10.)*

#### T13–T24 (DECIDED rev 15; full rules in `table-strategies-appendix.md`)
| ID | Name | Setup at $10 | Edge | Bankroll (40% / +30%) | Tier |
|---|---|---|---|---|---|
| T13 | Pass + Place 6/8 | T1, plus Place 6 and 8 $12 each (never the point) | 0.37% + 1.52% | $600 | Free |
| T14 | $64 Across + Regression | Buy 4/5/9/10 $10, Place 6/8 $12 → $44 → $24 | 1.71% | $600 | Premium |
| T15 | 3-Point Dolly | Don't Pass + 2 Don't Come, all with lay | 0.27% | $1,700 | Premium |
| T16 | Lay the Outside | Don't Pass + lay, Lay 4 and 10 $40 each | 1.67% (lays) | $1,200 | Premium |
| T17 | Hit and Run | Place 6/8 $12, down after one hit (or 3 rolls) | 1.52% | $200 | Free |
| T18 | 5-Count | Scoblete's count, then $44 Inside | same as the bets | $400 | Premium |
| T19 | Doey-Don't | Pass + Don't $10, odds on the Pass | 1.39% of the pair | $400 | Premium |
| T20 | Martingale on the Don't (warning) | Double after a loss, 10 → 320 | 1.40% | $700 | Free |
| T21 | Come-out Hedge (warning) | Pass + $1 Any Craps | +79% cost | $500 | Free |
| T22 | Power Press Ladder (coach) | Buy 5/9 $15, Place 6/8 $18 on Bill's ladder | 1.74% | $600 | Premium |
| T23 | Don't Pass + Place 6/8 Hedge | Don't $10 + Place 6/8 $12 | 1.47% | $300 | Premium |
| T24 | Inside + Lay the Outside ("Wise Guy") | $44 Inside + Lay 4/10 $40 each | 1.69% | $1,000 | Premium |

- **Strategy Comparison (Premium):** appendix Part 3.

## A2.5 Shooter practice (dice setting and a controlled throw)

> **Honest note (on screen):** Controlled shooting has **not been proven** to beat the house. Wizard of Odds is "still skeptical" ([appendix 4](https://wizardofodds.com/games/craps/appendix/4/), [appendix 3](https://wizardofodds.com/games/craps/appendix/3/)). Casino rules vary: many require both dice to hit the back wall and limit how long you can take to set them. **This mode is practice only.** The app's dice are random, using `crypto.getRandomValues` per the README, so the throw cannot change the odds (except the labeled Premium skill simulation, T-24, which is excluded from Fair Dice stats).

> **Sources disagree on casino tolerance:** Wizard says "most casinos happily allow" setting, but back-wall and timing rules are common. Use the wording "casino rules vary."

| Set | Look | On-axis faces | Use | Source |
|---|---|---|---|---|
| **3V** (some call it a "hardway set") | 3s in a V on top | Hard 6 top, 6 (5-1), 8 (6-2), Hard 8 bottom. No 7s. | After the point, for 6/8 | [Craps Coach 3V](https://thecrapscoach.com/3-v-dice-set.htm), [ControlledCraps](https://www.controlledcraps.com/dice-setting/) |
| **2V** | 2s in a V on top | Hard 4 top, 10 (4-6), 4 (3-1), Hard 10 bottom. No 7s. | 4/10 | [Craps Coach 2V](https://thecrapscoach.com/2-v-dice-set.htm) |
| **Straight Hardway** (1-6 axis) | 1 and 6 on the side axis | 2-2, 3-3, 4-4, 5-5 | Avoiding 7s | [Jerry Stickman](https://www.casinocitytimes.com/jerry-stickman/article/why-is-the-hardway-set-better-than-the-2v-set-for-avoiding-the-7-53635) |
| **All-Sevens** | 7s on all four sides | 7 on every face | Come-out | [ControlledCraps](https://www.controlledcraps.com/dice-setting/) |

**Terminology conflict:** "Hardway set" means the 3V in some sources and the 1-6-axis set in others. The UI shows both names.

**Practice routine:** pick a set → set the dice (target under 5 seconds) → grip preset → throw meter (both dice must reach the back wall) → result → stats (rolls, sevens, **RSR = rolls per seven, random about 6.0**, on-axis %). The on-axis visual is cosmetic and labeled "for practice." Any future "skill model" must be labeled a simulation and be OFF by default.

**Rev 15a (Bill, DECIDED):** dice setting, the grip and the throw meter are a **cosmetic practice ritual only**. They never change a roll; outcomes are always fair and random (Rule 0). There's no skill-simulation mode.

## A2.6 Tutor: App 2

#### Beginner track
1. **Lobby:** "You're the shooter. Regular rules. Play money."
2. Table tour with the good and bad bet highlights.
3. **Puck OFF:** "Bet Pass (or Don't Pass) to shoot."
4. **Shooter turn:** pick 2 of 5 dice and throw so both hit the back wall.
5. **Point:** suggest Odds, Place 6/8 and Buy 5/9.
6. Introduce Come bets after a few rounds.
7. **Seven-out:** "You keep the dice (single player). New come-out." In multiplayer, the dice pass (A2.7).
8. Etiquette: don't say "seven", keep hands clear, one-hand throw.

#### Experienced track
- Edges and odds, including the Don't side (lay up to 6x, 12 pushes, Don't odds can come down).
- Molly, Inside (Buy 5/9 variant), Iron Cross per-roll edge.
- Press and regress planner.
- **T11 Continuous Come** and **T12 Hit and Split** coaching, the same as B13/B14 at $10 units (rev 11).
- **All 24 strategy tutorials** (rev 15): Beginner and Experienced prompts, mistakes and edge/risk cards in `table-strategies-appendix.md` Part 2. **Voice rule:** Dealer Billy speaks every instruction, number and warning; Bubbles Billie only cheers (never on warning cards or Comparison results).
- Shooter-practice coaching flow below.

#### Shooter-practice coaching flow (Experienced)
1. **Goal:** come-out (All-Sevens set) or point phase (3V or Straight Hardway).
2. **Set:** show the target faces, timer goal under 5 seconds.
3. **Grip** preset and tip.
4. **Throw meter:** both dice must hit the back wall, otherwise "No Roll (practice)".
5. **Result:** on-axis indicator (cosmetic).
6. **Stats:** RSR (random about 6.0) and streaks.
7. **Reminder every 100 throws:** "RSR 6.1 is about random. Controlled shooting isn't proven to work."

#### App 2 state table
| Game state | Beginner prompt | Experienced prompt |
|---|---|---|
| **Lobby** | "You're the shooter. Bet Pass to start." | "Rules: Standard (3-4-5x, Field 2:1/2:1, Buy vig on win)." |
| **Puck OFF** | "Come-out! 7/11 win, 2/3/12 lose." | "Pass 1.41%, Don't 1.36%. Come odds OFF on the come-out." |
| **Pick and set dice** | "Pick 2 dice, set them how you like, throw to the back wall." | "Come-out: All-Sevens. Point: 3V or Straight Hardway. Set in under 5 seconds." |
| **Throw** | "Both dice must hit the back wall." | "Soft back-wall hit. Axis tracking is cosmetic." |
| **No roll** | "Try again. No bets affected." | "Logged as a no-roll." |
| **Point set** | "Point is 5. Add Odds (no house edge)." | "4x max on 5 (even amounts). Buy 9 at 2.00% beats Place 9 at 4.00%." |
| **Roll, no decision** | "Keep shooting. Number bets got paid." | "Half-press plan: 2 presses max." |
| **Point hit** | "You made it! Keep the dice." | "RSR this hand X. Session +Y%." |
| **Seven-out (single)** | "Seven-out. Bets lose, but you keep the dice for the next come-out." | "Hand length N (average about 8.5). Stop-loss check." |
| **High-edge bet** (trigger: S2 "Edge warnings", rev 13d) | "Long shot." (or "High house edge." / both, per S2) | "Hard 8: 9.09%. Not a hedge, it adds cost." |
| **Field bet placed** (rev 13d) | "Field: wins on 16 of 36 rolls, but the 5–8 numbers lose. 5.56% edge." | "Field: 16 of 36 wins (2 and 12 pay 2 to 1); 5, 6, 7 and 8 lose. 5.56% edge per roll (T-1 / T-2 can lower it)." |
| **Iron Cross placed** | "Wins on most rolls, but a 7 takes it all." | "About 1.8% per roll vs 0.46% for Place 6/8." |
| **Every 100 throws** | "Nice practice session!" | "RSR about 6.0 = random. Influence isn't proven." |
| **Hop bet placed** | "Hop 2-4: wins only if the very next roll is 2 and 4. Pays 15 to 1." | "Easy hop 11.11% (fair is 17 to 1). Hard hop 13.89% (fair 35 to 1). One roll, then it's decided." |
| **Hard hop vs hardway** | "Hop 4-4 is a one-roll bet. Hard 8 stays up until an 8 or a 7." | "Hard hop 4-4: 13.89% for one roll. Hard 8: 9.09% per bet (2.78% per roll)." |
| **Swiped to Side bets** (first time) | "Repeaters and Hops live here, so the board stays clean. Swipe back to the board." | "Side bets: Repeaters 18–22%, Hops 11–14%. High edges; small units." |
| **Repeater bet placed** | "Repeater 4: you win if 4 rolls 4 times before a 7. It pays 65 for 1, but it's a long shot (about 1 in 81)." | "Repeater 4: 19.75% edge (3.33% per roll). Fair would be 81 for 1. It works every roll, and any 7 takes it down, even on the come-out." |
| **Repeater hit, re-armed** | "Repeater 6 hit! You won 89 to 1. The bet stays up and the count starts over." | "+$89 per $1. Re-armed: the next cycle has the same 20.62% edge. Take it down to lock in." |
| **Blazing meter tier up** | "Hot hand: {n} rolls so far. Fun to watch. The next roll is still random, and a 7 is still 1 in 6." | "The Blazing meter = hand length so far, not a signal. Your edge per roll doesn't change. Size bets by your plan, not the meter." |
| **Long hand ends** | "That was a 14-roll hand. Long hands happen; so do quick ones. Dice have no memory." | "Hand length 14 vs about 8.5 on average. About 1 hand in 6 lasts 14+ rolls." |
| **Fair Dice unusual result** | "Your numbers look a bit uneven. That's normal over short sessions. Dice don't catch up; more rolls just even out the percentages." | "χ² p = 0.03. Random dice land here about 1 session in 20. No prediction value." |
| **Fire Bet window** (new shooter, before the first roll) | "Fire Bet is open until the first roll of this shooter." | "Fire Bet closes at the first come-out roll. 20.76% edge, small units." |
| **Fire Bet placed** | "Fire Bet: a fun long shot. You need 4 different points before a seven-out; that happens about 1 hand in 94." | "Fire Bet: 20.76% edge (about 2.4% per roll). Small units only. It's not a strategy, and it's not the Blazing meter." |
| **Fire Bet point made** | "New point for the Fire Bet: 3 of 6." | "3 different points. Needs 1 more for 24 to 1. The next roll is still random." |
| **Don't Pass takedown tapped** | "Taking down your Don't Pass gives up its edge. With the point on 4, it now wins 2 times in 3." | "Don't Pass after the point is worth +33.3% of the flat on 4/10, +20.0% on 5/9, +9.1% on 6/8. Taking it down throws that away. Confirm?" |
| **Continuous Come started** (T11) | "Continuous Come: Pass first, then a new Come bet on every roll while the point is on." | "Come + 3-4-5x: 0.37%. About one $10 flat a roll ($0.14 a roll). Up to $300 at risk on a 7. The Come bet in the box wins on that 7." |
| **Come bet off and on** (T11) | "Your Come 8 won, and the new Come bet took the 8. 'Off and on.'" | "Old Come 8 paid flat + odds; the new Come 8 gets odds before the next roll. Never stacked." |
| **Come bet travels** (T11) | "Your Come bet moved to the 6. Odds added: no house edge." | "Come 6 + 5x ($50). Come odds OFF on the come-out." |
| **Seven-out with Come bets** (T11) | "Seven-out takes the Pass and every Come bet. A Come bet still in the box wins." | "−$X this hand; 1.41% per flat Come bet. Stop-loss check." |
| **Hit and Split: split** (T12) | "6 hit for $28! $12 went on the 8, $16 to your chips." | "That $12 was your win, and now it's at risk: $36 on a 7. Same 1.52% per bet." |
| **Hit and Split: across** (T12) | "You're across. From here, wins go to your chips." | "Across: $76, 1.69% blended. Regress the 6 to $12, collect 2 hits, then take it down." |

## A2.7 Multiplayer (App 2)

> Play money only. Every player has a separate practice bankroll. No transfers, wagers between players, prizes or cash-out of any kind.

### A2.7.1 Modes
- **Pass-and-play (local):** one device, 2 to 6 players taking turns.
- **Online with friends:** private rooms (Later).
- **Single player** (Standard): the shooter keeps the dice after a seven-out. **The dice only pass in multiplayer.**

### A2.7.2 Shooter rotation
- Seat order is set in the lobby (drag to reorder) and goes clockwise. Seat 1 shoots first.
- **The dice pass only on a seven-out.** After a point is made or a come-out decision, the same shooter continues.
- A shooter must have a Pass or Don't Pass bet at the table minimum to shoot. If they can't (or skip), the dice pass to the next seat ("Shooter passes").
- A player can choose **"Skip my turn to shoot"** and stay in the game as a bettor.
- A "Shooter" badge sits on the seat, with an animation of the dice moving to the next seat after a seven-out.

### A2.7.3 Betting rules per player
| Bet type | Who / when |
|---|---|
| Pass / Don't Pass | Any player, **on the come-out only**. Players can bet the line on any shooter's roll; they don't have to be shooting. |
| Odds / Lay odds | Players with a line or come bet, once the point (or come number) is set |
| Come / Don't Come | Any player while the puck is ON |
| Place / Buy / Hardways / props / Hard Way All Day | Any player, any betting window |
| **Fire Bet** | Any player, **only before the new shooter's first come-out roll**. Each player's bet is their own, but all track the same shooter's points. Settles at the seven-out (or at 6 points) before the dice pass. |
| ATS / Repeaters | Any player. ATS and Repeaters any time (a Repeater starts a fresh count when posted; Premium T-23 can limit Repeaters to the come-out). The roll count is the same for everyone because the dice are shared; each player's bet is their own. |
| **Contract bets** | Pass and Come, once a point is set, **can't be removed or reduced** (the code agrees: `canRemove`, `js/table-engine.js:292-296`). **Don't Pass and Don't Come can be taken down or reduced** (Bill, Oct 10), with the Tutor warning (A2.6). The Fire Bet can't come down once the shooter's first come-out roll is thrown (A2.2a). *(Code change: `canRemove` blocks `dontPass`/`dontComePoint` today.)* |
| **Working while someone else shoots** | All of a player's bets stay up and settle on every roll, no matter who is shooting. Each player can set their own "Place/Buy Off on come-out" and "Bets Off." A seven-out settles everyone's bets, then the dice pass. |

### A2.7.4 Turn order and timers
- **Pass-and-play:** a **betting round** before each roll. Each player in seat order gets a turn: "Seat 3 (Ana): place your bets", with a **Done** button. A "Pass device to …" screen hides the previous player's controls between turns. Bubble-style **Quick bet** option: "Repeat my last bets" for each player.
  - **Timer:** optional (Off by default locally). If on, 30 seconds per player. When it runs out, the player's current bets stand and nothing new is added.
  - **Roll:** after the last player taps Done, the shooter gets the throw screen (dice pick, set and throw).
- **Online (Later):** a simultaneous betting window (default 20 seconds, host setting 10 to 45 seconds) for all players at once, then the shooter's throw (20 seconds). If the shooter's timer runs out, the server auto-throws.

### A2.7.5 Per-player bankroll (play money)
- Each seat starts with the room's starting bankroll (Standard $1,000 practice chips).
- Balances are **separate and private to each seat**. Others see only the chip totals sitting on the felt.
- **Reset rules:** a player at $0 (or below the table minimum) can tap **Rebuy practice chips**, which resets to the starting amount. The session tracker counts rebuys ("Rebuys: 2") so the stats stay honest. The host can turn rebuys off for a "last player standing" practice mode. Ending a session clears every balance. No carryover to other modes.
- No transfers or gifting between players.

### A2.7.6 What's on screen
- **Seat rail** around the table (2 to 6 seats): name, color, bankroll, a shooter badge, "Done" check marks, and a timer ring.
- **Chips are colored by player** on the felt. Long-press a spot to see "Ana $10 · Ben $5". *(Rev 15d: this is the "On this spot" row of the spot sheet, under the lingo card, S4.5 H2. Only the active player's own chips show a Take down.)*
- **Active player banner:** "Ben's turn to bet" or "Ana is shooting".
- **Three screens per turn** (S4.1): Left shows the active player's Repeaters, Hops and Fire Bet. Middle shows the felt (everyone's chips, only the active player's editable). Right is the shooter screen, which opens automatically on the shooter's throw.
- **Roll result** for everyone, then **per-player settlement toasts** ("Ana +$39 Buy 4 · Ben −$5 Field").
- **Hand summary after a seven-out:** shooter name, rolls in the hand, points made, and each player's net for the hand.
- Online (Later): presence dots, reconnect status, chat drawer.

### A2.7.7 Tutor in multiplayer
- Each player picks their own Tutor track (Off, Beginner, Experienced). Tips show **only during that player's betting turn** (pass-and-play) or in their own view (online).
- Tips are about **that player's bets only**, with no comments on other players' bets. Optional group tip at a seven-out: "A seven-out ends the hand for everyone, then the dice pass."
- Shooter coaching (set and throw tips) appears only for the current shooter.
- "Table talk" lessons for beginners: who the shooter is, why the dice pass, that betting with or against the shooter is allowed, and the etiquette for the Don't side.

### A2.7.8 MVP vs Later
| MVP | Later |
|---|---|
| Pass-and-play on one device, 2 to 6 players | Online private rooms (host creates a room, others join with a code or link) |
| Seat order, shooter rotation, dice pass on seven-out | Invites (link or share sheet), friends list |
| Per-player bankrolls, rebuy, session summary | Server-authoritative dice and settlement, real-time sync, reconnect and resume |
| Sequential betting turns, optional timers | Simultaneous betting windows, host settings (timers, rules preset, rebuys) |
| Per-player Tutor tracks | Chat (preset quick phrases first, with moderation), emoji reactions |
| Standard rules only, or the host's Premium rules if the device owner is Premium | Spectator seats, per-player stats history |

Online always uses play money. No real-money, prize or cash-out wording.

# END MATTER

## Mockup review and rule conflicts
Reviewed `/workspace/bb-mockups/app1-bubble` (screens 01–11) and `/workspace/bb-mockups/app2-table` (screens 01–08), plus `README.md`, `DESIGN-SYSTEM.md`, `MOTION-SOUND-SPEC.md` (M20–M22), `CRAPS-LINGO.md`, `QA-CHECKLIST.md` and the `src/` screen sources. Section names and tabs in this spec now match: Play · Fair Dice · Learn · Premium · Settings; App 1 Learn tabs All / Regular / Crapless / Lessons; App 2 tabs All / Baseline / Don't / Shooter; App 2 keys Bets · Strategies · Tutor · Stats; "Billy Tips".

| # | Mockup | Conflict | Recommendation |
|---|---|---|---|
| 1 | App 1 `10-premium-custom-rules` and `08-bet-panel` | The Custom Rules screen has a **"Lay commission"** row, but App 1 has **no lay bets on numbers** (the Bubble engine has only Don't Pass/Don't Come lay odds, `js/engine.js:31-55`). | Remove the Lay commission row from App 1. **Decided (Bill, Oct 10): the LAY tab stays, Regular only, hidden in Crapless**, and holds lay odds. |
| 2 | App 1 `11-premium-locked` | The upsell lists **"Shooter skill simulation"**, but App 1 has no shooter. | Remove it from both apps (rev 15a) and list Fair Dice CSV export + Repeater pay tables instead. |
| 3 | Both Custom Rules screens | Cards show the **old combined numbers** (#3 #1 #2 #20, #6 #7 #8, #19 #24, #12 #22 #23). | Use the B-xx / T-xx IDs (S3 map) or no numbers. |
| 4 | App 2 `05-strategy-picker` | Header reads **"LIVE TABLE · STRATEGIES"**. | "TABLE CRAPS · STRATEGIES". |
| 5 | Both `06-fair-dice` | **"Hot: 5 · Cold: 11"** labels invite the gambler's fallacy. | "Above expected / Below expected" (S5.2). |
| 6 | DESIGN-SYSTEM chips (line 58) and chip racks | Mockups use **$1/$5/$10/$25/$100/$500**. | **Decided: $1/$5/$25/$100/$500, no $10** (Bill, Oct 10). Remove the blue $10 chip from the racks and the design system. Keep $500 purple. |
| 7 | App 1 `09-strategy-picker` | Shows **Hard Way All Day** as a "side play" strategy card; it's a bet, not one of B1–B14. | Move it to the Lessons tab as "Side bets explained" (keep the 21.43% badge). |
| 8 | All screens | Repeaters and the Blazing meter are now drawn (rounds 6–7). The **left Side-bets screen with the 21-hop grid isn't** drawn yet. | Draw the left screen (Repeaters + Hops; + the Fire Bet tile in App 2) and the 3 dots. Remove any Repeater rack from the board/Bet Panel (S4.1). |
| 9 | App 2 `07-premium-custom-rules` | ATS is labeled **"Regular only"**, which is redundant (App 2 is Regular only). | Drop the label in App 2. |
| 10 | Both home screens (footer) | Footer reads "Education only. Play money only. No real gambling, deposits, cash-out or prizes." It says the right thing, but it names cash-out. | Optional: shorten it to "18+ · Education only · Play money only · No real gambling." |
| 11 | MOTION-SOUND-SPEC M20 | Repeater payout plate reads **"REPEATER SIX · 90 TO 1"**. The real table is **90 FOR 1** (89 to 1). | Change the plate to "90 FOR 1" (or "+89 TO 1" as the profit). |
| 12 | MOTION-SOUND-SPEC M21–M22, CRAPS-LINGO §6, Design Desk G2 | Five levels with **"Heater"** and **"On Fire"** as tier names (labels, haptics, callouts like "He's on a heater!" and "On fire! Same bet?"). | **Decided (Bill, rev 7):** the **Blazing meter** has exactly **Cold · Warm · Hot · Blazing**. Use 4 segments, 4 haptic levels (Warm `tick`, Hot `press`, Blazing `success`) and 4 callouts: Warm "Dice are warming up." · Hot "Dice are hot! Same odds, just fun." · Blazing "Blazing hand!" · Cool-off "Cooled off." Flames are for Blazing only, and decoration only. M22 "Heater" dice heat folds into Hot; "On Fire" folds into Blazing. Keep it separate from the App 2 Fire Bet rail. |
| 13 | Design Desk G1 | Pays written **"40:1"** (to 1); edges computed on that basis. | Use "40 FOR 1" everywhere; edges in S1.7. |
| 14 | CRAPS-LINGO §6, `src/m2.html:15`, QA-CHECKLIST line 90, `src/story.html:53` | Blazing meter callouts **"Dice are hot, press it!"** / **"Dice are on fire! Press it!"** / "Shooter's hot, press it!" tie pressing to the Blazing meter. That breaks S6 caution 2, and with a real PRESS key it becomes a betting nudge. | Replace with neutral calls: Hot "Dice are hot! Same odds, just fun." · Blazing "Bubble's blazing!" / "Blazing hand!" No "press it" in any Blazing meter line. |
| 15 | App 1 win overlay `src/m4.html:36` (QA line 94) and App 2 Repeater screen `src/repeater.html:28` | **"Press It"** buttons on a bonus-bet win (Roll 'Em All) and on the Repeater screen. The PRESS key is Place/Buy only. The Repeater screen also has **"Off on come-out"**, which is now a Premium toggle (Standard works every roll). | Rename the overlay button **"Add a chip"** (adds one chip to the bet that just won; fine since lamps reset). On the Repeater screen, use "Add a chip" (tally 0 only) and drop "Off on come-out" unless Premium B-23/T-23 is on. |
| 16 | App 1 table screens 03/04 | Mockup round 7 puts **PRESS + POWER PRESS beside ROLL**; spec rev 6–7 had them in the machine-key row. | **Decided (rev 8): the mockup is right.** They go in the dock beside ROLL, reachable on all three screens. Labels "PRESS 8 +$6 → $12", "POWER PRESS 8 +$6 · $1 to chips". |
| 17 | App 2 `10-fire-bet-points-lit` | The Fire Bet panel reads **"Paytable pending (Bones)"**. | Use the Standard **24 / 249 / 999 to 1** (20.76%, A2.2a). Put the Fire Bet tile on the left screen; the Fire rail stays on the shooter screen. |
| 18 | Both apps, all Play screens | Mockups show a **2-pane** Felt / Dome (App 1) or a single shooter screen with sheets (App 2), not **3 screens with 3 dots**. App 1 `02` dome and `03/04` felt are separate panes today. | Re-flow to Side bets · Board · Dice with 3 dots above the dock; land on Board; keep the HUD and dock on every screen (S4.1). |
| 19 | App 1 `04` Crapless felt and `13` Crapless Bet Panel (rev 13) | The Crapless felt has **no ATS lamp strip**. | **Rev 13: add the strip** (Low Rolls / Roll 'Em All / High Rolls) above the ten number boxes, the same as Regular. The locked layout (Horn left, Big Red over Hard Way All Day, Hard Ways right, the bottom row, Buy over / Place under each number) is unchanged. Don't spots and the LAY tab stay hidden in Crapless. |
| 20 | Roll readouts (rev 13a): `DESIGN-SYSTEM.md:115, 121`, `MOTION-SOUND-SPEC.md:211`, `src/m1.html:10, 14, 18`, `src/m15.html:16`, `src/swipe.html:22`, `QA-CHECKLIST.md:12, 21, 56, 91, 180` | Rolls are written as text: "4·4 · HARD EIGHT", "LAST ROLL 5·3 · EASY EIGHT, MARK IT", "4 + 4 = 8", "4·5 = 9". | Replace them with pip dice + a total badge (S4.2), e.g. `[pips][pips] 8 · EASY EIGHT, MARK IT`. QA checks become "pips match the 3D dice and the engine". |

No conflicts found with the **locked felt layout**: both felts keep Horn 2x2 left, Big Red above Hard Way All Day, Hard Ways 2x2 right, Pass / Odds / Don't Pass / Lay Odds bottom, Buy above / Place below.

## Decisions
- **Rev 15a (Bill via Chief, Oct 12, 10:27 AM and 10:31 AM):**
  - **Set dice: cosmetic practice ritual only.** T-24 "shooter skill (simulation)" is removed; no setting, Premium or otherwise, can change a roll.
  - **Rule 0, Real dice, real odds,** governs both apps (top of this spec).
  - **Etiquette guide** (`etiquette-guide.md`) in both apps, taught by Dealer Billy; Bubble tags the live-only tips. No in-app toke bet.
  - **Table Craps chip rail (A2.2b):** the rail shows chips off the felt as $500 / $100 / $25 / $5 / $1 stacks (no $10). Greedy breakdown with a 5 × $1 + 4 × $5 change reserve; 10-chip display cap + count badge; a bet that can't be made exactly breaks the smallest covering chip one step down, with a "Change" animation; cents live in a 0–99¢ cup; color-up is offered (default) when $1s or $5s pass 20 and always happens on "Leave table". **Rail total = bankroll − bets on the table, after every action.**
  - **Point-made celebration (S4.3, both apps):** only on a Pass-line point win; quiet without a Pass bet; never on naturals or Come / Place / other wins. Base / Big / Huge tiers (Huge = 3rd+ point or Blazing), Fire stinger at 4 / 5 / 6 unique points (Table). ≤ 2.5 s, tap to skip, never blocks a roll, clears on roll start. Reduce motion and Sound apply. Celebrate the moment, never the next bet.
- **Field** 2:1 on 2 and 12 (Standard). 3:1 is Premium.
- **Odds** 3-4-5x. Crapless takes 3x on 2/3/11/12.
- **Commission:** on wins only (Standard). "Always" is Premium.
- **Buy on Bubble:** yes, on all numbers in both apps.
- **Seven-out:** single player keeps the dice. Rotation only in multiplayer.
- **Hard Way All Day:** defined (S1.5). It **stays up after a win**: the payout is credited, the stake stays, the lamps reset (Bill, Oct 10). **Needs a code change**; the code takes it down today.
- **Hard Way All Day Premium payouts:** 150 / **165 (Standard)** / 175 / 200 for 1 = 28.57% / 21.43% / 16.67% / 4.76% (Bill, Oct 10). Shown in Custom Rules B-19 / T-19 and the Edge Preview. **Needs a code change** (the pay is hard-coded at 165).
- **Billy's Way 5/9:** **Buy**, not place. Regular = Buy 4/5/9/10 + Place 6/8 ($6 units), Crapless + Buy 2/3/11/12. Matches the current code (Bill, Oct 10).
- **Billy's Way in Table Craps:** **No.** Bubble only (Bill, Oct 10).
- **ATS hidden in Crapless:** confirmed (Bill, Oct 10). Regular only. *(Superseded in rev 13: ATS is in both modes.)*
- **ATS stays up after a hit** (Standard): it re-arms, the lamps reset, it can win again in the same shooter cycle, and it can be taken down any time. The Premium toggle "ATS comes down after a hit" defaults to Off (Bill, Oct 10). Per-cycle edge is unchanged (S1.6).
- **Lay odds:** up to 6x flat (this also fixes the rev 1 note "lay 12x on 4/10", which was wrong). Edge 0.27%, matching Wizard and the code (`js/engine.js:296-300`; `js/table-engine.js:144-152`).
- **Rev 5 (Oct 10), from Bill's brief:**
  - **Two separate apps:** **Billy Bubs Bubble Craps** (Regular/Crapless machine) and **Billy Bubs Table Craps** (formerly "Live Table", briefly "Craps Table": shooter, dice setting, multiplayer). Each app has its own Standard rules, Premium Custom Rules, strategy library and Tutor, and they share code (S7).
  - **Fair Dice** is its own tab in both apps (S5). CSV export is **Premium**.
  - **Repeaters** are offered in both apps (S1.7). Standard pays are 40/50/65/80/90 **FOR 1** (corrected from the draft's "40:1"). Like ATS and Hard Way All Day, they stay up after a hit, and Premium has a "comes down" toggle.
  - **Repeaters work every roll** and **any 7 loses them, including a come-out 7**. They can be **bet any time**, and the count starts from placement (Bill, via Design Desk). Patent-style "off on the come-out" and "come-out only betting" are Premium toggles; the edges are the same.
  - **Repeaters in Crapless: yes** (Bill, via Design Desk). Same pays and edges.
  - **Blazing meter score:** rolls since the last seven-out + 3 per point made (Design Desk / MOTION-SOUND-SPEC M21). Tiers updated in rev 7 (below).
  - **Blazing meter** in both apps, cosmetic only (S6).
- **PRESS (Bill, Oct 10, rev 6):** App 1 only, Regular and Crapless.
  - Each tap adds the bet's **original amount** (as last set by hand) to the Place/Buy bet that just won. Taps stack: $6 on 8 tapped 3 times = $24.
  - The label shows the running total. UNDO/CLEAR work until the next roll.
  - Chips come from the bankroll, and Buy vig stays on win only.
  - Capped at the table max and the bankroll.
- **POWER PRESS (Bill, Oct 10)** *(superseded in rev 12 by Bill's ladder; kept only as the off-ladder fallback)*: puts the net win back on the number, rounded down to a correct-pay unit ($6 on 6/8, $5 on 4/5/9/10, $2 on Crapless Place 2/12, $4 on Crapless Place 3/11, $5 on every Buy). The remainder and any over-max overflow stay in the bankroll. Greyed out if the rounded amount is $0.
- **Neither key is in Table Craps** (recommendation, matching Bill's default). A1.4a.
- **App 2 name:** **Billy Bubs Table Craps** (Bill, Oct 10).
- **Rev 6 (Oct 10), Bill's answers to the open questions:**
  1. **Lay commission (Table Craps): on wins only** (Standard). "Up front" stays a Premium option (T-7). Lay 4/10 1.67%, 5/9 2.00%, 6/8 2.27%.
  2. **Don't Pass takedown: allowed** in both apps (Don't Come too), with a Tutor warning that it gives away your edge (after the come-out, the point favors the Don't).
  3. **Hard Way All Day:** Standard **165 FOR 1** (21.43%). Premium adds **165 TO 1** (20.95%) next to 150 / 175 / 200 for 1.
  4. **App 1 LAY tab:** Regular only, hidden in Crapless (lay odds).
  5. **Top tier: "Blazing"** (cosmetic). *Superseded by rev 7: four tiers, Cold · Warm · Hot · Blazing.*
  6. **Chips (both apps):** $1, $5, $25, $100 and a purple $500. **No $10 chip.**
  7. **PRESS unit:** now the **original bet** on that number, superseding the $5/$6 chip-scaling version. A $5 bet presses +$5, a $6 on 6/8 presses +$6. Plus **POWER PRESS** (A1.4a).
  8. **Premium is sold per app**, with a bundle possible later.
- **Rev 7 (Oct 10), Bill:**
  1. **Blazing meter tiers: exactly Cold · Warm · Hot · Blazing.** Score = rolls since the last seven-out + 3 per point made. Cold 0–3, Warm ≥ 4, Hot ≥ 12, Blazing ≥ 24 or 4 points. Share of hands reaching each tier: Regular 67.6% / 29.8% / 8.6%, Crapless 64.1% / 26.3% / 6.7%. Cosmetic only, and every S6 caution stays. The meter's name is "Blazing meter" (mockups).
  2. **Fire Bet: only before the shooter's first come-out roll.** It closes at that roll, whatever the result.
  3. **Remove the $10 chip from Table Craps code** (see Code changes, Chips).
- **Rev 8 (Oct 10), Bill: three-screen Play layout in both apps** (S4.1).
  - **Left:** Repeaters + all 21 Hops (+ the Fire Bet tile in Table Craps).
  - **Middle:** the locked board (default landing).
  - **Right:** the bubble hood (Bubble Craps) or the shooter / throw screen (Table Craps).
  - Swipe plus 3 tap-able dots. HUD (bankroll, On table) and dock (ROLL / SHOOT, PRESS / POWER PRESS) on every screen. Mini roll toast off the Dice screen.
  - This replaces portrait = hood / landscape = felt and the 2-pane Felt | Bubble swipe.
  - **Hops:** Standard 15 to 1 easy / 30 to 1 hard (11.11% / 13.89%, Wizard). Premium 16/31 and 16/33. A win stays up.
- **Fire Bet (Bill, Oct 10): Table Craps only**, never Bubble Craps or Crapless. Standard 24 / 249 / 999 to 1 for 4 / 5 / 6 different points (20.76%). Premium presets on T-27. A2.2a.
- **App 2 table minimum:** $10, to match the code (`js/table-engine.js:72`). App 1 stays at $5.

- **Rev 9 (Oct 10), from Bill's badges brief:**
  - **One hand definition** for the Blazing meter, Fair Dice "longest hand", the new Longest Roll board and the badges (S4.1, S6). No-bet and Bets Off rolls count; a come-out 7 doesn't end a hand; a hand posts only with a bet working on its seven-out.
  - **Mode switch blocked mid-hand** (`hand.rolls > 0`), which is stricter than the current build.
  - **Longest Roll board:** Bubble Craps only, device-local, weekly (Monday 12:00 AM local) + all-time, Regular/Crapless boards, ties → points made → earlier finish.
  - **Badges:** 29 in Bubble Craps (6 Bronze · 11 Silver · 8 Gold · 4 Legendary), including the marquee ATS ×3, the ATS Sweep (Legendary, one hand) and Hard Way All Day. They never change odds or payouts, and Reset bankroll keeps them. `badges-bubble.md`.

- **Rev 10 (Oct 10, 9:02 PM), Bill's answers to the rev 9 questions:**
  1. **ATS Sweep** = all three ATS bets paid in **one hand** (as written).
  2. **Count every roll.** Post to the board only if a bet was working on the seven-out.
  3. **Auto-roll is optional:** Off by default, free in Settings. It pauses after 3 empty-felt rolls, with a notice and RESUME. The interval and stop conditions are in A1.5a. B-26 moves from Premium to free Settings.
  4. **Free Session limits** (loss limit / win goal, session-based), A1.5b, plus 4 discipline badges. Badges total **31**: 7 Bronze · 11 Silver · 9 Gold · 4 Legendary. *(Superseded at 9:07 PM by badges v3: **30**, 7 / 9 / 9 / 5, with Spin the Block added.)*
  5. **Regular/Crapless switching is blocked until after a seven-out.** Reset bankroll is the other way out (S4.1).
  6. **Leaderboard initials:** optional, device-only, SKIP, a profanity blocklist (Design Desk). The entry model is in `badges-bubble.md` §6.2.
  7. **The Blazing flame glyph stays;** only the word "Fire" is banned in Bubble Craps (S6 cautions 4–5).

- **Rev 11 (Oct 10, 9:13 PM), two new preloaded strategies:**
  - **Continuous Come:** **B13** (App 1, Both modes) / **T11** (App 2).
    - Pass + odds, then a Come bet with odds **every point roll, never stopping**. **Default UNCAPPED** (Bill's correction, 9:20 PM). An optional cap of 1–5 is **off** by default.
    - A Come bet that moves to a number already covered is handled **off and on**, like a real dealer: the old bet is paid and the new bet takes the number. It never stacks, because the same roll resolves both. This already matches the engine's settle order.
    - Max seven-out exposure at $5 / max odds: $150 Regular, $230 Crapless. Bankroll 250 / 400 units. Stop-loss 40% for B13 and T11 (revs 13b/13c; was 30%), win goal +30%.
    - Come odds OFF on the come-out by default. Crapless Come bets travel to 2/3/11/12.
    - Edge: 0.37% Regular / 1.26% Crapless with Standard odds.
  - **Hit and Split:** **B14** (App 1, Both modes) / **T12** (App 2).
    - Place 6 (or 8) at 2 units, then split each win into the next numbers (8 → 5/9 → 4/10, Buy on 4/5/9/10) until across.
    - Then regress the starter, collect 2 hits, take down.
    - Bubble uses its own logic: B-28 auto-press is suspended while it runs.
    - Crapless extension (Buy 3/11 then 2/12) is optional and default Off.
  - Libraries: App 1 **14** (B1–B14), App 2 **12** (T1–T12).

- **Rev 12 (Oct 10, 10:14 PM), Bill's "POWER PRESSES 2024" chart:**
  - **POWER PRESS = next ladder step** (whole win + Give, or − Get). It replaces the rev 6 round-down (now only the off-ladder fallback).
  - **Standard steps:** 4/10 5 → 15 → 40 → 100 → 300 → 900 (Buy from $40) · 5/9 5 → 15 → 36 → 86 → 200 → 500 · 6/8 6 → 18 → 42 → 90 → 210 → 450.
  - **Chart fix:** 5/9 start, $5 wins $7 (not $9), so Give $3 (not $1).
  - **Off-ladder:** jump to the highest step within win + 1 unit, else round-down. At the top: collect.
  - **Table max:** *(superseded by rev 12a: Standard $1,000)* the cap rule stays for a lowered Premium max.
  - **B-31 Premium ladder:** Standard / Scaled / Custom.
  - **Crapless ladders:** Buy 2/12 5 → 35 → 250, Buy 3/11 5 → 20 → 80 → 320 *(the Place versions were dropped in rev 12a)*.
  - **B-28 auto POWER PRESS** climbs the ladder and takes Gives from chips automatically, within its 1–5 cap.
- **Rev 12a (Oct 10, 10:21 PM), Bill closes open questions 4–6:**
  - **(Q5) Table max:** the Bubble Craps Standard max is **$1,000**, so the whole ladder, including 4/10 $900, is Standard. B-13 keeps its $100–$5,000 range, now defaulting to $1,000.
  - **(Q4) 5/9:** POWER PRESS converts 5/9 to **Buy at the $36 step**, and it stays Buy at $86 / $200 / $500 (2.00% vs 4.00%, and no breakage question).
  - **(Q6) Crapless:** the 2/3/11/12 POWER PRESS ladders are **Buy**: 2/12 5 → 35 → 250, 3/11 5 → 20 → 80 → 320. A Place 2/3/11/12 converts to Buy on POWER PRESS.
  - **Table Craps is unchanged:** $10 / $500, T-13 default $500.
    - The spec doesn't tie the two apps' limits together: they have separate IDs (B-13 / T-13) and separate Standard tables.
    - Table Craps has no PRESS / POWER PRESS (A1.4a), so the ladder reason doesn't apply.
  - No POWER PRESS questions remain open.
- **Rev 13 (Oct 11, 6:16 AM):**
  - **Billy's Way** (Bill restated it): Buy 2/3/4/5/9/10/11/12 where the mode has that box, plus Place 6/8. 1 unit = $5 Buy on each outside number and $6 Place on each of 6/8, scaled by units.
    - Regular = Buy 4/5/9/10 + Place 6/8; Crapless adds Buy 2/3/11/12. Confirmed against the build; no code change.
    - **Commission stays 5% of the Buy amount, charged only on a win.** Bill's note said "5% of the win", but that isn't what the spec (S1.3), the build or casinos do; see A1.4.
  - **ATS in Crapless** (supersedes the rev 3/5 rule): offered with the same 31 / 31 / 156 FOR 1. It works on the dice total; any 7 loses, the Crapless come-out 7 included.
    - Per-hand odds: Low/High 1 in 29, Roll 'Em All 1 in 145, Spin the Block 1 in 565 / 1,094 (Regular 1 in 27 / 134 / 523 / 1,013).
    - The five ATS badges now count in both modes (badges v4).
- **Rev 13a (Oct 11, 7:32 AM), pip dice (Bill):**
  - Every roll readout in both apps shows two pip die faces (die 1, die 2, as rolled) plus a total badge, with a Hard tag on doubles 4/6/8/10.
  - Sizes run from 32 px (Dice screen) down to a 14 px minimum (Last 20). Below that, the fallback is total chips with a tap-to-expand sheet.
  - The pips and colors match the 3D face art. The accessibility label reads "six and four, ten".
  - "n+m = total" and similar text formats are removed.
  - The pips render from the engine's settled `d1` / `d2`, the same values as the 3D dice (run 8). The CSV stays numeric.

- **Rev 15 (Oct 12, 10:16 AM), Table Craps strategies (Bill via Chief; all 14 rev 14 decisions use the recommended option):**
  - **P14-1 Shortlist:** all **24** strategies, T1–T24, ship.
  - **P14-2 Split:**
    - **Free:** T1–T13, T17, and the warning cards T20 / T21.
    - **Premium:** T14, T15, T16, T18, T19, T22, T23, T24, plus Strategy Comparison.
  - **P14-3 Units:** at the $10 table, T5 = Place 6/8 **$12**, T6 = **$44 Inside**, T7 = **$44 Iron Cross**. The $5-table amounts show only when T-12 = $5.
  - **P14-4 Limits:** every Table Craps card uses a **40% stop-loss** and a **+30% win goal**.
  - **P14-5 Bankroll rule:** about **8 × the max on a 7**, rounded up to the next $100. T11 ($2,500) and T12 ($480) keep their Bill-set figures.
  - **P14-6 Voices:**
    - **Dealer Billy** speaks every instruction, number, warning, limit prompt and session end.
    - **Bubbles Billie** speaks only cheers: point made, a lock-in, the win goal, badges. She never gives bet advice and never appears on warning cards or Comparison results.
  - **P14-7 Come-out:** Lay bets and Don't Come lay odds **work on the come-out** (T-30, default On).
  - **P14-8 Table max:** **$500 per bet** on flats, Place, Buy, Lay and props. **Odds and lay odds are exempt** and follow T-3 / T-4 only.
  - **P14-9 Warning strategies (T20, T21):** they're playable in their tutorial and in the Comparison, with a red banner. "Play this" never offers them.
  - **P14-10 T12 option B:** Color Up's "Hit and Split" version ($88 Inside → split 5/9 to 4/10 → $64 across) is an option on T12. Bill's ladder stays the default.
  - **P14-11 Naming:** T14's $64 spread is called **"Across"**, never Billy's Way, in Table Craps.
  - **P14-12 Comparison limits:**
    - up to **6 strategies** at once;
    - a many-seed mode (100 default, 1,000 max);
    - Bubble **Regular** CSVs are accepted with a banner; Crapless CSVs are refused.
  - **P14-13 Odds on cards:** strategy cards show only **3-4-5x / 5x / 10x**. T-3 still offers 1x / 2x / 20x / 100x as rules.
  - **P14-14 Prop minimum:** **$1** for hardways and Any Craps, even though the table minimum is $10.
  - **Repeater chance range (S2):** **1 in 49 to 1 in 113** (Repeater 2/12 to 6/8). Bubble rules are otherwise unchanged since rev 13d.

## Open questions for Bill
*(The rev 9 badge questions were closed in rev 10; see Decisions. Questions 1–3 below are still open from rev 8.)*
1. **Wide-landscape layout:** the spec shows Board + Dice side by side, with Side bets as a slide-over (and all 3 columns at ≥ 1,400 px). OK, or should wide screens keep the plain 3-page swipe?
2. **"Show the dice on each roll"** (B-30): the default is **Off** (you stay on the board and get a mini toast). Bubble Craps' fun is the dome, so should it default **On**?
3. **Hop limits:** $1–$100 per hop (Standard). OK?
*(Questions 4–6 from rev 12, on POWER PRESS, were closed by Bill in rev 12a; see Decisions.)*

*(The rev 14 questions P14-1 to P14-14 were closed by Bill in rev 15; see Decisions.)*
*(Question 4, set dice / shooter skill, was closed by Bill on Oct 12 at 10:31 AM: DECIDED in rev 15a; see Decisions.)*

*(Rev 15a questions; each has a recommended default the build uses until Bill answers.)*
5. **Color-up default (A2.2b.6):** **Offer** (a "Color up" pill when $1s or $5s pass 20), or **Auto**? **Recommended: Offer**, with Auto in Settings, because chips that move without a tap can look like money changing. Either way the rail always colors up on "Leave table".
6. **Big Win on a point-made roll (S4.3):** Bubble's BIG WIN overlay lasts 3.5 s and has Collect / Add a chip buttons, which breaks the new 2.5 s, never-blocking rule on those rolls. **Recommended:** on a point-made roll the point-made celebration takes over and shows the Big Win amount; on other rolls BIG WIN stays as it is (run-16 item BL16-6 asks whether to shorten it to 2.5 s everywhere).

*(Rev 15d questions; each has a recommended default the build uses until Bill answers.)*
7. **"Talk the Talk" unlock (S4.5 H5):** open **25 distinct terms (Silver)**, or finish a short Billy quiz? **Recommended: 25 terms.** It can't be failed, needs no new quiz content, and fits the "short collection = Silver" tier rule. Bubble #32; Table after Table Manners.
8. **Roll-call peek vs auto-roll (S4.5 H3):** **Recommended: the peek doesn't hold the auto-roll countdown**, and it closes on the next roll, so a tap on "YO-LEVEN" can never stall the dice. The full card (Lingo screen) still holds auto-roll like the Tutor card. OK?
9. **Long-press merge (S4.5 H2):** **Recommended: one spot sheet** (lingo card + Tutor line + Take down + multiplayer owners). It replaces the separate long-press meanings in S1.6 and A2.7.6. OK?

*(Rev 16 questions; each has a recommended default the build uses until Bill answers.)*
10. **Limit tiers (S10, B-32 / T-31; PROPOSED):** Table $10/$500 · $25/$2,000 · $100/$5,000, plus an optional Salon $500/$25,000, which needs T-13's $5,000 ceiling raised. Bubble $5/$1,000 · $25/$2,500 · $100/$5,000. Starting bankrolls 100 × min (Table) / 200 × min (Bubble). Side limits are unchanged in every tier (prop min $1, Repeaters $1–$25, hops $1–$100, Fire $1–$10). **Which tiers, which numbers, and is Salon in?**
11. **Free / Premium moves:**
    - **(a)** Tier picker and starting-bankroll presets become **Free**; custom limits stay Premium.
    - **(b)** Session history: Free = session chart + last 20 + totals; Premium = full list, all-time chart, filters, CSV.
    - **(c)** Drills: Boxman level and "Use my table rules" are Premium.
    - **(d)** Your Dice, roll speed and quick bets are Free.
    - **Recommended: all four as written.**
12. **Rule 0 clause 9 (Your Dice):** OK to add it to the top-level rule? **Recommended: yes.** It keeps Rule 0 about the app's rolls and makes the exclusions part of the rule.
13. **5 s auto-roll interval with Fast / Instant (S11)?** **Recommended: no** (keep 10 / 15 / 20 / 30 s; the extra speed is in the animation, not the pace).
14. **Quick bets and the point (S12):** skip the Pass / Come point number by default (B-34 / T-33 "Include my point" Off)? **Recommended: skip.**
15. **"Dealer's Apprentice" badge (S13):** add it (Silver; Bubble #33)? **Recommended: yes**, earned by a perfect Dealer-level "Pay the roll" round.
16. **#23 Slow Double with big bankrolls (S10):** change the target to "+$1,000 or +100% of the run's start, whichever is larger"? **Recommended: yes** (a `badges-bubble.md` change).
17. **Your Dice scope (S9):** its own bankroll, entered only between hands, Table solo only for MVP? **Recommended: yes.**

## Code changes implied by this spec (for later; none made)
- **Rev 16 (details in `table-craps-build-checklist.md` §20–§25 and RT-38 to RT-44; Bubble BL16-50 to BL16-107):**
  - **Both apps:**
    - a session-history store + series writer on the settle path (reads `netWorth`), and a shared chart component (with the Comparison chart);
    - a Your Dice mode: a separate game state, an entry pad, a `dice_source` field gating Fair Dice / leaderboard / badges / history / Comparison, and no call path to `rollDice`;
    - a Table rules sheet on the Custom Rules store, plus a limit-tier table feeding `spotMin` / `spotMax` (Bubble) and `tableMinFor` / `tableMaxFor` (Table);
    - a roll-speed setting read by `animateDice`, the throw path, `celeTimer` / `showBigWin` / PSO durations and the rail animations, and the limit prompt keyed to the overlay end (not `js/ui.mjs:1324`'s fixed delays);
    - a quick-bet chooser (lower edge via `edgeFor`) with the one-bet-per-number rule and an atomic post;
    - a drills module generating scenes and checking answers through the engine's payout functions.
  - **Bubble:** `fieldProfit` must read B-1 / B-2 (today 2× fixed, `js/engine.mjs:242-246`); odds presets for B-3 / B-4 (F5).
  - **Table:** expose T-2 / T-3 / T-14 / T-31 in `js/table-ui.mjs`; the Place 6/8 minimum follows T-12 (`js/table-rules.mjs:214`, `js/table-ui.mjs:601-604`); $6 tap increments on 6/8.
- **Rev 15d (details in `table-craps-build-checklist.md` §19 and RT-33 to RT-37; Bubble BL16-30 to BL16-42):**
  - **Both apps:**
    - a shared `lingo.json` plus a small `lingo` module: load, filter by app, search, `callMap` lookup from the settled roll, and `seen` storage per app;
    - a long-press handler on bet spots beside the swipe code, reusing `swallowClick`, and a spot sheet that hosts `takeBet`;
    - call-word buttons in the result line and a peek card closed by `clearWin()`;
    - "Show me" via `openTutor` / `currentTip` plus a highlight class;
    - the `talk_the_talk` badge via the `noteAction` pattern;
    - a Settings row;
    - the lint extended to Lingo strings (Bubble: "Fire").
- **Rev 15a (details and REUSE / NEW marks in `table-craps-build-checklist.md` §3a, §16–§18 and RT-24 to RT-32; Bubble items on the run-16 list (BL16-1 to BL16-25)):**
  - **Table Craps:** a new `js/rail.mjs` (`railBreakdown`, `railPay`, `railCredit`, `railColorUp`, `railTotal`, `railRebuild`); route every bankroll debit / credit (`addBet`, `takeBet`, `settle`, `autoBet`, reset, Fire pay) through it; `breakChips` gets the change reserve and an uncapped mode; `chipStack` gets the count badge; a "Color up" setting; a rail per seat.
  - **Both apps, Rule 0:** remove the `Math.random()` fallback from production `rollDie` (`js/engine.mjs:405-406`) and refuse to roll without crypto; strip `__bbRng` and every `__bb*` hook from production bundles at build time instead of relying on `testRngAllowed()` (`js/ui.mjs:931-934`); add the χ² / independence / set-dice tests; the "Real dice, real odds" line.
  - **Both apps, etiquette:** one shared `etiquette` string table, a tip-card deck on the tutorial screen, the rotating tip, nudges via `maybeTutor`, and the "Table Manners" badge (Bubble #31).
  - **Both apps:** a `pointMade(settled, before)` check (result `point-made` + `hand.points`) feeding a new `showPointMade(tier, quiet, stinger)` beside `showBigWin`; it shares `clearWin()` / `celeTimer`, so `doRoll` clears it on roll start; Table adds the Fire stinger from the Fire rail count.
- **Rev 14 / 15 (DECIDED rev 15; details in `table-strategies-appendix.md` §6 and `table-craps-build-checklist.md`, which marks each item REUSE / REUSE+ADAPT / NEW against `bb-bc-yrkv` @ `51c229b`):**
  - strategy defs T13–T24 and the $10 amounts for T5 / T6 / T7;
  - `replay(config, dice[])` beside `runSim` (`js/strategies.js:557`), with a seeded, versioned PRNG into `rollDie(rng)` (`js/table-engine.js:1125`);
  - a per-strategy ledger and summary using the existing per-decision `expectedLoss` (`js/table-engine.js:663-846`);
  - a table max per bet with odds exempt (the engine has none today);
  - a lay-bets-working-on-come-out toggle;
  - the Compare screens C1–C4 with a screen-reader table;
  - Tutor rows and voice routing;
  - golden-seed tests.
  - rev 15 additions:
    - **T-30** (lay bets / Don't Come lay odds working on the come-out);
    - a per-profile table min / max ($10 / $500 for Table Craps), with odds kept exempt (Bubble already returns `Infinity` for odds in `spotMax`, `js/engine.mjs:431-436`);
    - a $1 prop minimum for hardways / Any Craps;
    - voice routing per the P14-6 rule.
- **Split into two apps** sharing packages (S7): one rules core (merge `js/engine.js` + `js/table-engine.js` profiles), one settings store with B-xx / T-xx lists, and a migration from `craps-practice-v5` (`js/ui.js:8`) and `billy-bubs-table` (`js/table-app.js:11`).
- Hard Way All Day: stay up after a win and reset the lamps (`js/engine.js:795-797`, test `tests/table-engine.test.js:492-495`, help text and README).
- Hard Way All Day pay as a Premium setting (`js/engine.js:23`, `js/table-engine.js:606-623`).
- **ATS in Crapless (rev 13; reverses the old "Hide ATS in Crapless" item).** The build `bb-bc-yrkv` @ `9367283` hides it today. Changes:
  - remove the guard at `js/engine.mjs:535-536`;
  - render the `.ats` strip in both modes (`js/ui.mjs:2089`);
  - fix the mode toast (`js/ui.mjs:571`: "Don't bets are off." only) and the mode card (`js/ui.mjs:2408`: drop "No ATS.");
  - show B-20 / B-21 in both modes (`js/ui.mjs:2458-2459`).
  - Settlement already uses the total sets `SMALL` / `TALL` (`js/engine.mjs:41-42`, `1280-1289`), and any 7 loses, so no settlement change is needed.
  - **Badges:** set the five ATS defs to `mode: "both"` (`js/badges.mjs:17-21`), remove the `c.mode !== "crapless"` gate around the ATS unlocks (`js/badges.mjs:153`), and update the Crapless odds strings.
  - **Tests:**
    - a Crapless come-out 7 pays Pass and loses ATS;
    - a Crapless come-out 2 sets a point and lights the Low Rolls 2 lamp;
    - an ATS win in Crapless unlocks `ats_low_rolls`.
  - README "Crapless… No ATS" lines.
- ATS stays up after a hit: in the win branch (`js/engine.js:769-775`), credit only the profit, keep `state.bets[kind]` at the stake, and reset `state.progress[kind]`. Add an "ATS comes down after a hit" option for Premium that keeps today's behavior. Update the tests (`tests/table-engine.test.js:465-482`) and the help text (`index.html:564-570`, `README.md:60-70`, `table.html:236`). Add the ATS pay table option (B-21 / T-21).
- **Repeaters (new):**
  - Add bets `rep2`…`rep12` to `emptyBets`, plus per-number counters to progress.
  - Settle them in `settleBonusBets` (`js/engine.js:747-811`): count **every** roll from placement; **any 7 loses** (the same branch ATS uses, `js/engine.js:762-766`); on a hit, pay the profit, keep the stake, reset the count. With the Premium "off on the come-out" toggle, skip come-out rolls entirely (no counts, no loss).
  - Pay tables and toggles (B-22–B-24 / T-22–T-23).
  - Edge math alongside `bonusEdge` (`js/table-engine.js:562-623`).
  - Bet Panel tab and rail.
  - Tests.
- **Fair Dice (new):**
  - A full per-app roll log (today history is capped at 16 in `js/engine.js:833-834` and 40 in `js/table-engine.js:654-655`).
  - The stats module (counts, χ², per-die, streaks, RSR).
  - "RNG secure / fallback" reporting from `rollDie` (`js/engine.js:1212-1228`).
  - Don't port the skill-sim code (`influence`, `srr`, `rollNonSeven`, `js/table-engine.js:1162-1220`) or its control (rev 15a).
  - Premium CSV writer (S5.4).
  - "Reset Fair Dice history" in Settings.
- **Blazing meter (new):** a cosmetic state derived from the roll log (score = rolls since the last seven-out + 3 × points made). It must have no access to bet or strategy logic. A copy lint for banned words (S6).
- **Chips (build list):**
  - **App 1 (Bubble Craps):** add $500. `CHIP_VALUES` at `js/engine.js:15` becomes `[100, 500, 2500, 10000, 50000]` (cents). Add purple $500 chip art.
  - **App 2 (Table Craps): remove the $10 chip and add $500:**
    - `js/table-app.js:28` `var CHIPS = [1, 5, 10, 25, 100];` becomes `[1, 5, 25, 100, 500]`.
    - `js/table-app.js:101` `var chip = saved.chip || 1000;` defaults to the **$10** chip today. Change it to `500` ($5), and migrate a saved `chip: 1000` to 500.
    - `js/table-app.js:750` stack denominations `[100, 25, 10, 5, 1]` become `[500, 100, 25, 5, 1]`.
    - `css/table.css:554` `.chip.is-10, .mini.is-10` style: remove it, and add `.is-500` (purple #5A2A88 with gold).
    - The chip buttons are built from `CHIPS` in `buildChips` (`js/table-app.js:1075-1094`), so no other markup changes.
- **PRESS + POWER PRESS (new, App 1):**
  - Add PRESS / POWER PRESS to the **dock beside ROLL** (`#roll-btn`, `index.html:462`; mockup round 7), plus the UNDO · CLEAR pill. The machine-key row (`index.html:437-451`) stays BETS OFF · BILLY'S WAY · RESET.
  - Wire them in `js/ui.js` beside `doBillysWay` (`1113`).
  - Track `origBet` per Place/Buy spot. Set it on hand placement (`placeBet`, `js/engine.js:585-596`) and on takedown (`removeBet`). PRESS taps don't set it.
  - Record the last winning Place/Buy and its net win from the settle decisions (`js/engine.js:920-941`).
  - Add `pressLastWin` / `powerPressLastWin` (rounding units per A1.4a) and a pending-press stack for UNDO/CLEAR, cleared at the roll.
  - Add a Place/Buy table-max check (none today in `validatePlace`, `js/engine.js:478-491`).
  - Settings B-28 (B-27 dropped). Tests.
  - Change Billy's Way "each press" copy to "each tap" (`index.html:644`, `js/engine.js:1316`, `README.md:42`).
- **Three-screen pager (both apps; replaces today's 2-pane pager):**
  - **App 1 markup:** `index.html:73-74` (`#board-pager`, `pane-felt`) and `349` (`pane-bubble`). Add a `pane-side` before the felt.
  - **App 1 dots:** `index.html:500-510` (`#pane-switch`, two `.pane-dot`s). Make it three, placed above the dock.
  - **App 1 orientation defaults:** `js/ui.js:684-707` (`LANDSCAPE_BOARD` / `PORTRAIT_BOARD`, and `defaultPaneName()` returning `"bubble"` in portrait). Always land on `"board"`.
  - **App 1 snap-on-rotate:** remove `snapOrientationDefault` (`js/ui.js:794-801`) and its calls in `syncBoardMode` / `scrollend` (`813-871`); keep the current pane on rotate. `setPane` / `activePaneName` / `updatePaneDots` (`729-777`) generalize to 3 panes.
  - **App 1 CSS:** `css/styles.css:2700-2745` (`.board-pager` scroll-snap, `.pane-felt` / `.pane-bubble` order) and the landscape block at `2652`. Add a wide-landscape side-by-side layout (≥ 900 px) and 3 columns at ≥ 1,400 px.
  - **App 1 zoom view:** keep `felt-pan.js` (`js/felt-pan.js:7, 12, 58` swipe-edge strip) for page swipes, and `css/polish.css:1785`.
  - **App 1 Roll buttons:** the dock `#roll-btn` (`index.html:462`) becomes the ROLL on every screen, with PRESS / POWER PRESS beside it. The pane Roll (`index.html:410`) and the landscape side Roll buttons (`394-400`) fold into it.
  - **App 1 roll toast:** add the mini roll-result toast.
  - **App 2:** add the same 3-screen pager to `table.html` (today: tabs `table.html:78-82`, panels `85-212`, short-landscape sheet `js/table-app.js:1014-1030`). Bets / Strategies / Tutor / Stats become sheets. SHOOT jumps to the shooter screen.
- **Hops (both apps):**
  - Extend `hop` from `{2, 3, 11, 12}` to 21 dice-pair keys (`js/engine.js:48, 89-91, 166-167, 391-397, 496, 534, 562, 852-866`; `js/table-engine.js:50, 211, 248, 284, 348, 456, 719-725, 1258`). The 4 Horn singles keep their keys and B-15 / T-15 pays.
  - Add the B-29 / T-29 pay options.
  - Table Craps keeps a winning hop up (today it's cleared at `js/table-engine.js:725`).
  - Build the left-screen grid.
- **Lay vig default (App 2):** `vigLay` defaults to `"win"` (`js/table-engine.js:79`); keep "upfront" as the Premium T-7 option.
- **Don't Pass / Don't Come takedown (both apps):** allow `dontPass` and `dontComePoint` in `canRemove` (`js/engine.js:349-355`, `js/table-engine.js:292-296`), with a Tutor confirm. Update the tests.
- **Hard Way All Day 165 to 1:** add it to the B-19 / T-19 pay options (`js/engine.js:23`, `js/table-engine.js:606-623`).
- **Fire Bet (new, App 2 only):**
  - Add a `fire` bet plus `progress.firePoints` (a set of different points made) to the Table Craps profile only.
  - Accept bets only before the new shooter's first come-out roll; block new bets and takedowns after that roll.
  - On each Pass point made, add the point. At 6 points, pay at once and clear. At a seven-out, pay by tier and clear.
  - Multiplayer: per seat, tracking the current shooter.
  - Pay table T-27 and the edge in `bonusEdge` (`js/table-engine.js:562-623`).
  - Bets sheet tile, Fire rail, tests.
  - Block it in Bubble/Crapless profiles.
- **Blazing meter:** tiers `cold` / `warm` / `hot` / `blazing` (S6, CSV).
- **Hand / Longest Roll / badges (rev 9; new build `bb-bc-yrkv` @ `ee86885`; details in `badges-bubble.md` §9):**
  - `switchMode` (`js/engine.mjs:756-771`): also block when `hand.rolls > 0`. Today a come-out mid-hand switch zeroes the hand (line 768).
  - Fair Dice `streakStats` (`js/fair.mjs:141-163`) uses the scoped, 8,000-capped roll log, so "This hand" can disagree with `game.hand.rolls` after a reset or mode switch. Read the engine's hand and the board's best instead.
  - Roll records (`js/ui.mjs:640-650`): add `ts`, `handId`, `rollIndex`, `hadAction`.
  - Decisions (`js/engine.mjs:991-994`): add a stable `kind` / `number`.
  - New badge store `bb-bubble-badges-v1`, kept out of Reset bankroll (`js/engine.mjs:740-746`, `js/ui.mjs:381`).
  - Persist tour completion and lessons read (today `tutorStep` is in memory only, `js/ui.mjs:49`).
- **Rev 13d Field label and Tutor edge warnings (`bb-bc-yrkv` @ `907f68c`):**
  - **Felt label:** `fieldSpot` (`js/ui.mjs:2352-2360`) prints "2 AND 12 PAYS DOUBLE". Change it to **"2 AND 12 PAY DOUBLE"**, and drive the line and the circle style (`.fn.dbl`) from B-1 / B-2 per the S1.4 table.
  - **Screen-reader label:** the Field button's `aria-label` is just "Field" (+ stake) (`js/ui.mjs:2357-2358`). Make it "Field: 2, 3, 4, 9, 10, 11, 12; 2 and 12 pay 2 to 1" (B-1 / B-2 variants; the stake appended).
  - **Tutor trigger:** `placeTap` toasts "Long shot with a high house edge." for any edge > 5% (`js/ui.mjs:700-702`). That fires on the Field (5.56%), Place 4/10 (6.67%) and Crapless Place 2/3/11/12.
    - Replace it with the S2 rule: `isProp(kind)` && P(win per decision) < 1/6 → "long shot"; edge ≥ 9% → "high house edge".
    - Add a `fieldTip` with the Field line and its own mute key (`edge-field`).
    - Add the P(win) per kind next to `edgeFor` (`js/engine.mjs:1610-1680`).
  - **Crapless Field:** no rule change. Settlement already pays and keeps the stake up (`fieldProfit` `js/engine.mjs:242-246`, `payStay` `js/engine.mjs:1260-1263`). Add a test that a Crapless come-out 2 / 3 / 12 sets the point and also pays the Field.
  - **App 2 (old repo):** the same label, aria and Tutor trigger in `table.html` / `js/table-app.js`.
  - **Tests:** the label for all 4 B-1 / B-2 combinations; the Field never shows "Long shot"; Hard 8 shows both warnings; Big Red shows only "High house edge"; Yo shows both.
- **Rev 13a pip dice readouts (`bb-bc-yrkv` @ `eadae8c`; App 2 in the old repo `/tmp/bbp`):**
  - **One component:** `diceReadout(d1, d2, size, { tag, call, sevenOut })` that builds an inline SVG sprite from `assets/dice/faces/face-1…6.svg`. It replaces `miniDie` / `pipGrid` (`js/ui.mjs:162-181`) and the red / flat pip CSS (`css/app.css:494-500, 1245-1249`).
  - **App 1:**
    - `rollCaption().line` (`js/engine.mjs:364`) drops "d1·d2 · " (call words only). Add `aria` (the "six and four, ten" label) to the caption object.
    - Toast (`js/ui.mjs:2083-2084`): already shows mini faces; add the total badge and tag, and drop the text dice.
    - Dome result line (`js/ui.mjs:2476`).
    - LED `d1 + "·" + d2` (`js/ui.mjs:2313`) → 16 px pips.
    - HUD `lastdice` (`js/ui.mjs:2170`, 16 px).
    - `historyChips` (`js/ui.mjs:2459-2466`) and Fair Dice Last 20 (`js/ui.mjs:2775`) → 14 px tiles with the fallback.
    - New Fair Dice history list.
    - Record card (`js/ui.mjs:1656-1669`): the seven-out pips. Store `sevenOutDice: { d1, d2 }` on leaderboard entries (`js/leaderboard.mjs`).
    - Tutor / coach copy: a `{dice}` token that renders inline pips.
  - **App 2 (old repo):**
    - `js/table-app.js:846` (`d1 + "–" + d2 + " = " + total`) and `:895` (history `d1–d2`) → pips + badge.
    - `js/ui.js:301` aria "Last roll X and Y equals Z" → the new label; `js/ui.js:319`.
    - `js/table-engine.js:1094` `pushLog` "d1-d2 (total)" → structured log entries `{ d1, d2, total, text }`, rendered with 16 px pips in the multiplayer turn log.
  - **Render-vs-engine guard:** the 3D `data-face` and every readout come from the same settled object (keep the run 8 `4cee298` rest-pose mapping). Add a test over all 36 pairs (3D face = toast = strip = history = CSV).
  - CSV unchanged (numeric `die1`, `die2`).
  - Lint: fail the build on roll text patterns like `/\d\s*[+·–-]\s*\d\s*=\s*\d/` in UI copy.
- **Rev 12 POWER PRESS ladder (`bb-bc-yrkv` @ `b2c56bc`):**
  - Replace the round-down in `pressStatus` (`js/engine.mjs:924-938`: `add = floor(profit / unit) * unit`) with a ladder lookup:
    - `POWER_LADDER = { "4": [5,15,40,100,300,900], "5": [5,15,36,86,200,500], "6": [6,18,42,90,210,450], "buy2": [5,35,250], "buy3": [5,20,80,320] }`, in dollars, mirrored for 8/9/10/11/12;
    - `target`, `give` / `get` and the new label;
    - the off-ladder rule;
    - the round-down fallback (keep today's code as that branch);
    - the top-of-ladder grey;
    - a cap at the table max with the remainder as a Get. Raise `TABLE_MAX` (`js/engine.mjs:9`) from `50_000` to **`100_000`** cents ($1,000 Standard, rev 12a), reading B-13 when Premium sets it.
  - `powerPress` (`js/engine.mjs:959-975`): debit **target − stake** (not the rounded add). Convert Place to Buy on 4/10 with target ≥ $40, **5/9 with target ≥ $36**, and **any Crapless 2/3/11/12 Place** (rev 12a): remove the Place and post a Buy, and record it in `pressStack` so UNDO can restore the type.
  - `applyAutoPress` (`js/strategies.mjs:389-416`): use the ladder in POWER PRESS mode, with automatic Gives, collect-if-can't-cover, and counting each step toward the 1–5 max.
  - B-31 setting (Standard / Scaled / Custom) and its validation. The Edge Preview line now shows the step, the Give/Get and the expected-loss change.
  - **Tests:**
    - every cell of the verified table: chart dollars plus the app's cents ($36 → $50.40, get $0.40);
    - the 5/9 typo row (Give $3);
    - the 4/10 conversion at $40;
    - the off-ladder examples ($25 on 6 → $42 get $12.16; $12 → $18 get $8; Buy 4 $10 → $15 get $14.50);
    - the full 4/10 ladder to $900 under the $1,000 default;
    - the cap example with Premium max $500 (Buy 4 $300 → $500, get $385);
    - the 5/9 conversion at $36 (Place $15 wins $21 → Buy $36, even);
    - Crapless Place → Buy (Place 3 $4 → Buy $20, add $5);
    - the Billy's Way $500 chip ($600 on 6/8 accepted; a second tap is skipped);
    - the top-of-ladder grey;
    - UNDO restoring the type;
    - the Crapless ladders.
- **Rev 11 strategies (`bb-bc-yrkv` @ `9338f64`; App 2 code still in `/tmp/bbp`):**
  - **App 1 `js/strategies.mjs`:** add `B13` / `B14` entries to `STRATEGIES` (today B1–B12, lines 18-140).
    - **B13** in `autoBet` (`js/strategies.mjs:221-388`): a branch that puts 1 unit in the Come box before **every** point-phase roll (default uncapped), with an optional cap that reuses the B3/B10 count (lines 256-262, `comePointCount` 206-208) and an odds level via `fillComeOdds` (193-204). No engine change is needed for off-and-on (`js/engine.mjs:1216-1223, 1248-1250`). Test: a Come bet moving to a covered number pays the old bet and leaves exactly one bet there.
    - **B14:** a new branch that reads the last roll's Place/Buy win decisions (it needs the stable `kind` / `number` on decisions, `js/engine.mjs:991-994`) and applies the ladder step. Keep `game.splitLadder = { start, step, acrossHits }`.
    - Suspend `applyAutoPress` (389-416) while B14 is active.
  - **Card options UI:** cap, odds level, start number, the Crapless extension, after-across mode.
  - **App 2 `js/strategies.js` (`CrapsStrategies`):** add T11 / T12 coach steps and `runSim` support.
  - **Tests:**
    - the Come cap counts;
    - Crapless travel to 2/3/11/12;
    - a Come bet in the box wins on the seven-out;
    - the ladder amounts ($12 → +$6 on 8 → $5 Buy 5/9 → $5 Buy 4/10);
    - the partial-step rule;
    - the regress to $6;
    - the lock-in after 2 collected hits.
- **Rev 10 (`bb-bc-yrkv` @ `ee86885`):**
  - **Mode switch (confirmed):** `switchMode` (`js/engine.mjs:756-771`) must also return `ok: false` when `state.hand.rolls > 0`, with the new copy. Reset bankroll (`js/engine.mjs:740-746`) remains the way out.
  - **Auto-roll optional (A1.5a):**
    - default `autoRoll: false` (today `true`, `js/ui.mjs:22`);
    - an interval setting (today hard-coded `/ 15000`, `js/ui.mjs:970`);
    - restart the countdown on any bet change;
    - an **empty-felt counter**: pause after 3 rolls with On table = $0. **The current build auto-rolls with an empty felt** (`js/ui.mjs:965-975`);
    - a **can't-cover** pause: today `doRoll` rolls even when `S.autoBet` returns a message (`js/ui.mjs:596-600`);
    - a **visibility pause** on `visibilitychange` / `pagehide`, with no roll on return. Today there's no handler, and because the timer uses `performance.now()`, it can roll at once on return;
    - a paused-state chip with RESUME;
    - a `rollSource` field on roll records (`js/ui.mjs:640-650`);
    - update the Settings row copy "15 seconds, then the machine rolls" and the B-26 Premium preview row (`js/ui.mjs:1435`).
  - **Session limits (A1.5b), new:**
    - a persisted session store (start time, start bankroll, limits at start, `limitsLoosened`, bet-rolls, end reason), replacing the in-memory `sessionRolls` boundary (`js/ui.mjs:47, 381`);
    - Settings rows;
    - the post-settle check;
    - the Dealer Billy prompt with a one-prompt-per-limit flag;
    - the HUD chip;
    - the session summary;
    - the 30-minute idle close.
  - **Leaderboard entries + initials:**
    - the entry model in `badges-bubble.md` §6.2;
    - the initials prompt (once), the Settings row, `INITIALS_BLOCKLIST`;
    - storage in `bb-bubble-badges-v1`.
  - **Wording lint:** allow the flame glyph, and ban the word "Fire" / "On Fire" in Bubble Craps strings (meter, badges, toasts, Tutor).
- **Premium entitlements:** one per app (bundle later).
- **App 1 Bet Panel:** LAY tab (lay odds) in Regular only; hide it in Crapless along with the Don't spots.

---

## Bubble leftover / run-16 list (Bubble Craps build items after QA run 15)
*(Rev 15a. The build for these is Bubble's next run; QA run 16 checks them. Carried P2s from `qa-bubble-run15.md` stay on that report's list and are re-checked in run 16 against the build after `51c229b`.)*

**Point-made celebration (S4.3), Bubble Craps:**

| ID | Item | Acceptance criterion | Mark (vs `51c229b`) |
|---|---|---|---|
| BL16-1 | Trigger: fires only on `result === "point-made"` (Regular and Crapless) | Forced rolls: point made → fires; come-out 7 / 11, come-out craps, point set, seven-out, Place / Buy / Come / hardway / Repeater / ATS / HWAD wins → don't fire (normal payout pulse) | NEW (`celebrate` in `js/ui.mjs` only handles seven-out + `isBigWin`) |
| BL16-2 | Full vs quiet | With a working Pass bet → full; no Pass bet (none, Don't Pass only, other bets) → quiet: no confetti, no haptics, ≤ 1.2 s | NEW |
| BL16-3 | Tiers from `hand.points` | 1st = Base, 2nd = Big, 3rd+ = Huge; meter at Blazing after the roll (meter on) = Huge; meter off → points only; a new hand starts at Base | NEW (uses existing `hand.points`, `blazeMoment`) |
| BL16-4 | Voices and copy | Dealer Billy calls, Bubbles Billie cheers (existing winner art); 0 banned words (S4.3 list) | REUSE art + NEW strings |
| BL16-5 | Never blocks; clears on roll start (R10-2) | ROLL works during it; tapping ROLL / swipe / auto-roll removes it within 1 frame (`clearWin()` at the top of `doRoll`); auto-roll gap unchanged ± 50 ms; total ≤ 2.5 s; tap skips | REUSE `clearWin`, `celeTimer` + NEW overlay |
| BL16-6 | Same-roll Big Win | Point made + `isBigWin` → one celebration carrying the Big Win amount, no second overlay. (Open question 6: shorten BIG WIN to 2.5 s / no buttons everywhere?) | REUSE+ADAPT `showBigWin` |
| BL16-7 | Reduce motion and sound | `motionOff()` → no confetti / sunburst, fade only; Sound off → silent; haptics follow the existing setting | REUSE |
| BL16-8 | A11y and fit | One polite announcement; no clipping or overlap with the dome, readout or dock at 320–430 px and landscape; ≤ 3 flashes / s | REUSE `shot-run14.mjs` harness |
| BL16-9 | **Tests:** fires on point made only (36-outcome forced sweep at come-out and on each point); tier logic (scripted hands: 1, 2, 3, 5 points; Blazing by roll count with 1 point); doesn't block the roll (Playwright: ROLL at 100 ms into a Huge starts a roll and the overlay is gone) | All pass in `tests/` and the run-16 harness | NEW |

**Real dice, real odds (Rule 0), Bubble Craps: verified against `bb-bc-yrkv` @ `51c229b`:**

| ID | Item | Status at `51c229b` | Acceptance criterion |
|---|---|---|---|
| BL16-10 | Secure, uniform, unbiased die | **PASS.** `rollDie` (`js/engine.mjs:388-407`) uses `crypto.getRandomValues` on a `Uint32Array(1)` with `limit = 2³² − (2³² mod 6)` and redraws `n ≥ limit`; `rollDice` makes two separate draws (`:409-415`) | Keep; covered by BL16-14 |
| BL16-11 | No influence | **PASS (code read).** No streak, pity, weighting or difficulty code in `engine.mjs`; nothing but the optional test `rng` reaches `rollDie` | Static test: `rollDice` is only called with no argument or the test hook |
| BL16-12 | **No `Math.random()` fallback in production** | **FAIL vs Rule 0.** `rollDie` falls back to `Math.random()` when crypto is missing (`:405-406`) | Production: no fallback; show "Can't roll…" and don't roll. Fair Dice "RNG: basic" state removed from production |
| BL16-13 | **Test hook stripped from production** | **Risk.** `window.__bbRng` (`js/ui.mjs:971-973`) and the `__bbShowMarquee` / `__bbQueueMarquee` hooks (`:3002-3012`) are gated only by `testRngAllowed()` (`:931-934`), which allows `localhost`, `127.0.0.1`, `::1` **and an empty hostname**. A packaged app (Capacitor serves from `localhost`; `file://` has an empty host) would pass it | Build-time strip; production bundle grep finds no `__bb` |
| BL16-14 | χ² ≥ 1M seeded rolls (faces df 5, totals df 10) + one unseeded crypto run | **Missing** (no such test in `tests/`) | p ≥ 0.001 |
| BL16-15 | Independence: lag-1 correlation (\|r\| < 4/√n), 36-cell pairing χ² (df 35), P(7 after 7) ≈ 6/36 ± 0.5 pt | **Missing** | All pass |
| BL16-16 | 36-outcome render vs engine | **PASS** (`tests/dice-faces.test.mjs`, `tests/engine.test.mjs` l. 527) | Stays in CI |
| BL16-17 | Player-facing "Real dice, real odds" line on Fair Dice, onboarding, tutorial | **Missing** (the current plain-words card is close) | Exact Rule 0 text shown |

**Etiquette guide (`etiquette-guide.md`), Bubble Craps:**

| ID | Item | Acceptance criterion | Mark |
|---|---|---|---|
| BL16-20 | Tip cards on the tutorial screen: [Both] tips 4, 9, 14 first, then "At a live table" with the other 12 tagged [Live table] | Deck shows 15 cards in that order; exactly 12 carry the tag | NEW (REUSE Tutor card UI `openTutor` / `advanceTutor`) |
| BL16-21 | Rotating "Billy's Table Tip," once per session | Never during a roll, seven-out toast, celebration or limit prompt; no repeat until all have shown | NEW |
| BL16-22 | Contextual nudges: first Don't Pass bet of a session → tip 9; first session start → tip 14 | Once per session each; off with Tutor tips off | REUSE+ADAPT `maybeTutor` |
| BL16-23 | Badge #31 "Table Manners" (Bronze, learning) | Unlocks after every card is viewed and the last "Got it" tapped; never from a bet; badge count 30 → 31, Bronze 7 → 8 in `badges-bubble.md` | REUSE `noteAction` pattern of #24 |
| BL16-24 | Copy | 0 banned words; tips 4 and 12 say they don't change the dice | NEW strings test |
| BL16-25 | Fit and a11y | Cards at 320–430 px + 130% text: no clipping; each card read as one block by VoiceOver | REUSE harness |

**Craps Lingo (S4.5, `craps-lingo.md`, `lingo.json`), Bubble Craps (rev 15d):**

| ID | Item | Acceptance criterion | Mark (vs `51c229b`) |
|---|---|---|---|
| BL16-30 | Bundle `lingo.json`; build-time filter drops `apps: ["table"]` terms | Bubble bundle has **78** terms (no `fire_bet`); a bundle grep finds no "Fire" in Lingo strings; schema test (RT-33 rules) passes | NEW |
| BL16-31 | Lingo screen: Learn row + menu item beside Badges; search; chips All · Dice · Bets · Actions · Table with counts (21 / 25 / 14 / 18 in Bubble); Recent calls strip | Search fixtures in `craps-lingo.md` §5 pass (e.g. "nina" → Nina + Center field nine; "fire" never returns the Fire Bet); Dice sorted 2 → 12, others A–Z | NEW (REUSE Tutor card UI for the card) |
| BL16-32 | Card shows the Bubble note for the current mode | Crapless: `dont_pass`, `dont_come`, `lay_odds`, `dark_side` say "Not in Crapless"; `lay` says the LAY tab is lay odds; `across` / `buy` mention Billy's Way (Bubble only); `color_up`, `rail`, `check_change` say live table only | NEW |
| BL16-33 | **Long-press spot sheet** on every felt spot and Side-bets tile: 500 ms, < 10 px | Sheet order: Lingo card, Tutor line + Why?, Your bet (Take down where allowed, incl. ATS per S1.6), and the release doesn't place a chip (`swallowClick`); a tap < 500 ms places a chip with no added delay; a 12 px swipe cancels the hold and changes page; `contextmenu` suppressed, no iOS callout | NEW handler beside the swipe code in `js/ui.mjs` (`pointerdown` / `pointerup`, `swallowClick`); REUSE `takeBet` |
| BL16-34 | Other long-press targets | BILLY'S WAY key: preview sheet (A1.4, still new) with an Across link; no long-press on ROLL, PRESS, POWER PRESS or any dock key | NEW |
| BL16-35 | Tappable roll calls on the dome result line | 36 forced outcomes × come-out / point, Regular and Crapless: each opens the `callMap` term (e.g. come-out 7 → `natural`, point-on 7 → `seven_out`, 4-4 → `hard_eight`, 5-6 → `yo`); the mini toast tap still jumps to the Dice screen; celebration / PSO taps still skip | NEW (reads the settled roll used by `rollCaption` / `diceReadout`) |
| BL16-36 | **Never blocks or delays the dice** | ROLL, Space and auto-roll with a peek open: the roll starts that frame and the peek closes (`clearWin()` path); the auto-roll interval is unchanged ± 50 ms with a peek open (no hold); the result line renders in the same frame with or without links (no `await`) | NEW; REUSE `clearWin` |
| BL16-37 | Badge **#32 `talk_the_talk`** (Silver, learning collection, Both modes) | Unlocks at 25 distinct terms, each with its card shown ≥ 2 s or read to the end; never from a bet or roll; search rows don't count; x/25 only on the Badges screen; `badges-bubble.md` v5: 32 badges, Silver 9 → 10 | REUSE `noteAction` pattern (#24 / #31) |
| BL16-38 | Show me on the board | Highlights and opens the coach bubble with the spot's Tutor line (Beginner if Tutor is off, without turning it on); Crapless-hidden spots are disabled with the reason; `ui:pressKey`, `ui:betsOff` and `ui:layTab` highlight those controls; no bet placed | REUSE `openTutor`, `currentTip` + NEW highlight |
| BL16-39 | Copy | 0 banned words (S6 + RT-22 + S4.3 lists + "Fire"); `toke` says there's no in-app tip; no "cash out" | NEW strings test |
| BL16-40 | A11y | Labels from `srLabel`; "Say it" read as words; the "Lingo" custom action and the L / Shift+F10 key on spots; VoiceOver hold pass-through; the call button after the roll announcement, never stealing focus | REUSE harness + NEW |
| BL16-41 | Fit and offline | 320–430 px + landscape + 130% text: no clipping; the peek never covers the dice result or the dock; airplane mode: search, cards, links and the badge all work, with 0 network requests | REUSE `shot-run14.mjs` harness |
| BL16-42 | **Tests:** call-map sweep (BL16-35), gesture test (tap vs hold vs swipe, BL16-33), never-blocks Playwright check (BL16-36), search fixtures, schema / lint | All pass in `tests/` and the run-16 harness | NEW |

### Round-5 batch (rev 16, Oct 13; Bill approved six additions): Bubble Craps items
*(Same marks as above: vs `bb-bc-yrkv` @ `51c229b`; where the shared engine on `cursor/table-craps-6ff7` @ `34f012d` already has it, that's noted. Table items: `table-craps-build-checklist.md` §20–§25 and RT-38 to RT-44.)*

**Session history and bankroll chart (S8):**

| ID | Item | Acceptance criterion | Mark |
|---|---|---|---|
| BL16-50 | Session record + store `bb-bubble-history-v1` (S8 fields; `mode` Regular / Crapless) | Schema test; Reset bankroll keeps history; "Clear session history" wipes only this store | NEW (REUSE `js/session.mjs` boundaries) |
| BL16-51 | Per-roll `series` (`total` = bankroll + on table) with seven-out / point-made / limit markers | 100-roll fixture: one point per settled roll; `total` = `netWorth` | NEW |
| BL16-52 | Session chart + summary row + pip tooltip | Snapshots at 320–430 + landscape; tooltip pips match the Fair Dice history row | NEW chart (shared with Table CMP-08); REUSE `diceReadout` |
| BL16-53 | All-time chart = running sum of session nets; Reset never adds | SH-06 fixture passes in Bubble | NEW |
| BL16-54 | Entry points: a **Sessions** menu item beside Badges / Lingo; "See chart" on the End-session summary | Both open the right session | REUSE+ADAPT session summary (`finishSession`) |
| BL16-55 | Filters incl. Regular / Crapless; caps (200 full series, min/max downsample, 5,000 points) | SH-10 fixture passes | NEW |
| BL16-56 | Never recorded: seeded runs, Your Dice sessions | 0 RNG history records from either | NEW |
| BL16-57 | Copy + a11y + gating (if Bill agrees: Free last 20 + session chart + totals; Premium the rest + sessions CSV) | Footer exact; no "best / worst"; axe 0 serious; locks as specced | REUSE `lockedExport` pattern |

**Your Dice mode (S9):**

| ID | Item | Acceptance criterion | Mark |
|---|---|---|---|
| BL16-60 | Enter / leave only when `hand.rolls === 0`; own bankroll, felt, hand; the RNG game restored exactly | YD-01 / YD-02 fixtures in Regular and Crapless | NEW (REUSE the mode-switch guard, `switchMode`) |
| BL16-61 | Label: banner + HUD "YOUR DICE · you enter the rolls"; "YOURS" tag on every pip readout; dome shows the faces at rest, no tumble | Every S4.2 readout context carries the tag; aria adds "entered" | REUSE+ADAPT `diceReadout`, `placeDice` |
| BL16-62 | Quick pad (21 pairs, hop tiles) + die pad; Settle; Undo last roll | YD-05 in both modes | REUSE hop grid (`sideHTML`) + NEW pad |
| BL16-63 | Settles exactly like an app roll (incl. Billy's Way, PRESS / POWER PRESS, ATS re-arm, Crapless points) | RT-40 sweep in Regular and Crapless | REUSE `settle` / `rollAndSettle` without the draw |
| BL16-64 | **X1–X3:** no `rollDie` call; Fair Dice log, cards, CSV unchanged | YD-07 / YD-08 | NEW |
| BL16-65 | **X4:** no Longest Roll entry, toast or PSO banner | YD-09 | REUSE+ADAPT `js/leaderboard.mjs` `completedRoll` / `commitRoll` guard |
| BL16-66 | **X5:** no badge progress, unlock or count (all 32 badges, incl. #23 and #28–#31); card-reading badges still work | YD-10 with Bubble's `BADGES` | REUSE+ADAPT `js/badges.mjs` `evaluateRoll`, `evaluateSession` (gate on `dice_source`) |
| BL16-67 | No auto-roll in the mode (the Settings row is disabled with "Not in Your Dice") | Auto-roll On + enter Your Dice → no countdown ring | REUSE+ADAPT auto-roll timer |
| BL16-68 | Paste a sequence; copy; offline; 0 "Fire" | YD-13 / YD-14 in Bubble | NEW |

**Table rule settings and limit tiers (S10):**

| ID | Item | Acceptance criterion | Mark |
|---|---|---|---|
| BL16-70 | Table rules sheet (Field 12, odds, bankroll, tier) with the Edge Preview; opens from the rules chip, Settings and Premium | RS-01 in Bubble | REUSE+ADAPT `premiumHTML` (`js/ui.mjs:2815+`, today read-only "Locked on this build") |
| BL16-71 | **Field 12 3:1 pays what the felt says** | `fieldProfit` (`js/engine.mjs:242-246`, hard-codes 2×) reads B-1 / B-2 like the label (`activeFieldPays`, `js/ui.mjs:2396-2400`); 4 combos: label === payout; edges 5.56 / 2.78 / 2.78 / 0% | REUSE+ADAPT (the shared engine's `fieldWin` on `34f012d` already reads rules, but only for the table profile) |
| BL16-72 | **Odds B-3 / B-4** selectable (Regular 1x … 100x; Crapless 1-2-3-4-5x … 100x); lay odds follow B-5 | Max odds per point per preset, both modes; Edge Preview values per S1.2 / S10 | REUSE+ADAPT `oddsMultiple` / `maxPassOdds` (hard-coded 3-4-5x, F5) |
| BL16-73 | Odds exempt from the max in every tier | High roller, $5,000 Pass + 100x odds accepted when covered | REUSE `spotMax` (`Infinity`, `js/engine.mjs:431-436`) |
| BL16-74 | **Starting bankroll B-14** presets; applies only via Reset bankroll (ends the session) | RS-05 in Bubble | REUSE `resetBankroll` + NEW setting |
| BL16-75 | **Limit tier B-32 (PROPOSED):** Standard $5 / $1,000; High limit $25 / $2,500; High roller $100 / $5,000 | Each tier sets min / max; $24 Pass refused at High limit; max ≥ 20 × min | REUSE+ADAPT `TABLE_MIN` / `TABLE_MAX` (`js/engine.mjs:8-9`) → per-tier, read by `spotMin` / `spotMax` |
| BL16-76 | Per-tier Place 6/8 cap ($6 steps); side limits unchanged (Repeaters, hops, ATS / HWAD $1 min) | RS-07 / RS-08 in Bubble | REUSE `validate` |
| BL16-77 | POWER PRESS at higher tiers: ladder capped at B-13; B-31 Auto = min ÷ $5 | High limit, Auto → 5 × Bill's ladder; top step capped at the max with the rest as a Get | REUSE `powerPlan` (`js/engine.mjs:950-1030`) |
| BL16-78 | Billy's Way at the tier minimum | At $5, a $1 chip tap posts nothing below the $5 min (A1.4's $1 row is below the minimum; the build skips those spots with a reason). Spec flag: A1.4's $1-chip row only applies at a B-12 $1 table | REUSE `placeBillysWay` (`js/engine.mjs:790-818`) |

**Roll speed (S11):**

| ID | Item | Acceptance criterion | Mark |
|---|---|---|---|
| BL16-80 | Settings › Roll speed Normal · Fast · Instant (B-33, free, default Normal) | Persists; fresh install = Normal | NEW |
| BL16-81 | Dome tumble 1.4 s / ≤ 0.5 s / ≤ 150 ms fade; tap the dome to skip | Timing fixtures; skip → settled pose that frame | REUSE+ADAPT `animateDice` (`js/ui.mjs:1518-1551`) |
| BL16-82 | Same draw; render-vs-engine at 3 speeds | `tests/dice-faces.test.mjs` × 3 speeds | REUSE |
| BL16-83 | Celebration, Big Win, PSO caps per the S11 table; merges unchanged; never blocks; clears on roll start | FR-05 / FR-06 in Bubble | REUSE `celeTimer`, `clearWin`, `showBigWin` |
| BL16-84 | Auto-roll: countdown from settle; intervals unchanged; the limit prompt opens when the overlay ends (not the fixed 2.2 / 3.0 s) | Fixture at each speed: prompt opens within 1 frame of the overlay ending; auto-roll interval ± 50 ms | REUSE+ADAPT the delay at `js/ui.mjs:1324` |
| BL16-85 | Reduce motion wins; sounds trimmed; haptics; one announcement | FR-07 / FR-08 in Bubble | REUSE `motionOff`, `audio.mjs`, `haptic` |
| BL16-86 | Counts the same at every speed (Fair Dice, badges, leaderboard, history) | FR-10 in Bubble | NEW |

**Quick bets (S12):**

| ID | Item | Acceptance criterion | Mark |
|---|---|---|---|
| BL16-90 | INSIDE · OUTSIDE strip on the Bet Panel's Place and Buy tabs; BILLY'S WAY stays the across key; no ACROSS key; machine-key row and felt unchanged | DOM check; FIT-02-style geometry snapshot unchanged | NEW (REUSE Bet Panel tabs) |
| BL16-91 | Inside = Buy 5/9 + Place 6/8; Outside = Buy 4/5/9/10 (Crapless too; 2/3/11/12 not included) | Both modes post exactly those spots | NEW |
| BL16-92 | Buy vs Place by lower edge under the active rules (B-6 Always → 5/9 Place; B-8) | QB-03 fixtures with B-xx | REUSE `edgeFor` |
| BL16-93 | Amounts at $5: $1 / $5 chip → Inside $22, Outside $20; $25 → $110 / $100; $100 → $440 / $400; $500 → $2,200 / $2,000 (6/8 $600, under the $1,000 max) | Ledger fixtures; payouts to the cent | REUSE `buyProfit`, `placeProfit` (Billy's Way amount rule, `billysWayAmounts`) |
| BL16-94 | One bet per number (Place or Buy): keep the player's type and add in its step; never two bets; point skipped unless B-34 | QB-06 / QB-07 in Bubble | NEW (Bubble has no number lays) |
| BL16-95 | All or nothing on bankroll; per-spot max cap / skip | QB-08 in Bubble | REUSE `validate` |
| BL16-96 | Undo / Take down Inside / Outside removes only its units; works with PRESS / POWER PRESS on those spots afterwards | QB-10 in Bubble; a PRESS after Inside presses the hit spot by its original bet | REUSE `billyMark` pattern, A1.4a |
| BL16-97 | Tutor lines; a11y labels; fit at 320 px with 130% text | Strings exact; axe 0 serious; 0 clipped | REUSE harness |

**Payout drills (S13):**

| ID | Item | Acceptance criterion | Mark |
|---|---|---|---|
| BL16-100 | Learn › Payout Drills; never touches bankroll, bets, dice, Fair Dice or history | PD-01 in Bubble | NEW |
| BL16-101 | Answers from the engine functions (incl. Crapless Place 2/12 11:2, 3/11 11:4; Crapless odds 6:1 / 3:1) | PD-02 sweep in both modes | REUSE `js/engine.mjs` payout functions |
| BL16-102 | Bubble drill set: D1, D2 (lay odds Regular only), D3, D5 (no Fire Bet), D6, D7; no D4 Lay bets, no D8 rail | Generator never emits a Lay bet, a rail scene or the word "Fire" | NEW |
| BL16-103 | Levels and timers (Off by default) | PD-06 in Bubble | NEW |
| BL16-104 | Scoring and personal bests (`bb-bubble-drills-v1`) | PD-07 / PD-09 in Bubble | NEW |
| BL16-105 | Wrong answer → Why? math box | PD-08 in Bubble | REUSE Tutor math box |
| BL16-106 | Badge #33 "Dealer's Apprentice" (Silver; PROPOSED): 10 / 10 D7 at Dealer+ | Unlock fixture; badge count 32 → 33, Silver 10 → 11 in `badges-bubble.md` v6 (not edited in rev 16) | REUSE `noteAction` pattern (#24 / #31 / #32) |
| BL16-107 | Copy (Dealer Billy only; banned lists + "Fire"); a11y; fit | PD-11 / PD-12 in Bubble | REUSE harness |

---

## G. Design Desk draft (Repeaters + Heater/Blazing meter, Oct 10): Bones check DONE
The draft that was appended here has been checked and merged. Nothing in it is still pending.
- **G1 Repeaters → S1.7.**
  - The hit counts are correct.
  - The pays are **FOR 1**, not "40:1" (Wizard, Nevada).
  - The draft's edges (16.33 / 20.31 / 18.52 / 17.06 / 19.74%) are the "to 1" reading. The correct edges are **18.37 / 21.88 / 19.75 / 18.08 / 20.62%**.
  - Answers to the draft's questions: stays up after a hit, **yes** (Premium toggle to come down). Working on the come-out, **yes** (any 7 loses). Crapless, **yes** (Bill).
- **G2 Heater (now the Blazing meter) → S6.**
  - The score and thresholds are adopted.
  - Shares of hands reaching each tier were added. Rev 7 (4 tiers): Warm / Hot / Blazing = Regular 67.6 / 29.8 / 8.6%, Crapless 64.1 / 26.3 / 6.7%.
  - The top tier is now **"Blazing"** (Bill, rev 6). The flames are decoration only (S6 caution 5, mockup conflicts 11–13).

## H. Design Desk note (Bill decisions, Oct 10, 5:11 PM PT): merged in rev 6
Design Desk appended Bill's decisions here. They're now in the body and in Decisions (rev 6):
- **Chips** $1 / $5 / $25 / $100 / $500 (purple), no $10: S4, A1.4, A1.5, mockup conflict 6.
  - Correction: App 2's code does have a $10 chip (`js/table-app.js:28`, `CHIPS = [1, 5, 10, 25, 100]`). So App 2 needs to drop $10 as well as add $500, not just add $500.
- **LAY tab:** Regular only, hidden in Crapless; tabs "Place · Buy · Lay odds · Odds · Repeaters" (Regular) and "Place · Buy · Odds · Repeaters" (Crapless). This matches A1.1 / A1.2.
- **Premium per app**, no bundle shown now: S7, Decisions. A bundle can come later.
- **Meter naming: RESOLVED (Bill, rev 7).**
  - The meter is the **"Blazing meter"** (Design Desk's mockup name), with exactly four tiers: **Cold · Warm · Hot · Blazing**.
  - Only these four tier names exist (Cold is the resting/lowest tier). Earlier draft names are retired so nothing on the meter is fire-named next to the App 2 Fire Bet.
  - Thresholds: Warm ≥ 4, Hot ≥ 12, Blazing ≥ 24 or 4 points (S6).
- **Design Desk mockup status (Bill, Oct 10, 5:26 PM PT):**
  - Mockups now show only **Cold · Warm · Hot · Blazing** with the S6 rev 7 thresholds. Old tier-3 screens (16 rolls) now read HOT; the 24-roll / 4-point screens read BLAZING.
  - **Fire Bet window:** bet only before the new shooter's first come-out roll (A2.2a). After that roll the Fire spot shows **LOCKED · NEW SHOOTER ONLY** (lock glyph, greyed chip that can't be dropped on), while the six point medallions stay live. Shown on App 2 store 02 (mid-hand, 6 made) and screen/store 10 (4 · 6 · 8 · 9 made). The rule is in the tutor line on screen 10.
  - The Fire Bet paytable label now uses A2.2a Standard (24 / 249 / 999 TO 1, 20.76%).
  - Open for Bones/Bill: A2.2a says "no printed spot on the locked felt" (Bets sheet tile + Fire rail). Per Bill's earlier ask, the mockup draws the spot and rail on the perspective table view, not on the flat locked felt.

## Rev 15b (Oct 12 2026, Bill decided Open questions 5 and 6)
- Q5 DECIDED: Color-up is OFFERED by default (prompt), with "Auto color-up" as a setting.
- Q6 DECIDED: On a point-made roll, the point-made celebration takes over and shows the Big Win amount. Big Win is capped at 2.5 s everywhere, can be skipped, never blocks a roll, and clears when a roll starts (both apps). Bubble run 16: shorten Big Win from 3.5 s and remove its blocking buttons.

## Rev 15c (Oct 12 2026): celebration timing + PSO animation (both apps)
### S4.3 timing (Chief decision, supersedes 1.6/2.0/2.5)
Base 1.2 s · Big 2.0 s · Huge 2.5 s with sunburst. All skippable, never block a roll, clear on roll start.

### S4.4 PSO (point-seven-out) animation, both apps
- **Trigger:** a 7 rolled while a point is ON. Never on a come-out 7 (that's a Pass win), never on any other roll. Exactly once per seven-out.
- **Versions (picked by the player's net result on that roll, all bets combined, after Fire/Repeater/HWAD payouts):**
  - **Light-side PSO (net loss or zero):** dice dim, puck flips OFF, chips swept off the felt, Billy: "Seven out, line away." Short 1.2 s. Quiet, never mocking; no sad trombone.
  - **Dark-side PSO (net win, e.g. Don't Pass/Don't Come/Lay):** same puck/sweep, but chips slide TO the player; Billy: "Seven out! Pay the don'ts." Restrained (1.2 s, no confetti or sunburst) per craps etiquette; Billie does not cheer.
  - **No bets on the table:** puck flip + call only.
- **Long hand variant:** if the hand had 3+ points made OR 20+ rolls, add a 0.8 s "Hand over" tag showing hand length (rolls, points made) before the sweep; Billy: "What a roll, give the shooter a hand." Total cap 2.0 s. If it set a new Longest Roll record, the Longest Roll banner replaces the tag (same 2.0 s cap) and the leaderboard entry opens only on tap after.
- **Big loss:** no different, bigger or longer animation for big losses (no dramatizing losses). Loss amount shows in the normal result box only. Stop-loss prompt (if hit) appears after the PSO clears.
- **Fire Bet (Table Craps):** if Fire pays on the seven-out (4 or 5 unique points), the Fire payout overlay plays INSIDE the PSO as a Big tier win (2.0 s cap) and the dark/light choice uses net result including it. 6-point Fire is paid at the 6th point, not here. Fire rail resets with the sweep.
- **Big Win on a PSO roll** (e.g. big dark-side win or Fire): PSO shows the Big Win amount; no separate Big Win animation (same as rev 15b point-made rule).
- **Seven-out toast:** merged. The PSO replaces the existing seven-out toast; its text line ("Seven out. Net −$X" / "+$X") is the toast. No second toast. Screen-reader label: "Seven out. Point was N. Net result plus/minus X dollars."
- **Global:** skippable by tap, never blocks the next roll, clears on roll start, reduce-motion = static puck flip + text, sound toggle respected. Pip dice readout still shows the 7 with faces.
- **Tests:** PSO fires on point-on 7 only (all 6 point values, both modes incl. Crapless where come-out 7 is not a natural-win but still no PSO); never on come-out 7; dark vs light picked by net; long-hand thresholds; Longest Roll replace; Fire combo; one toast only.

## Rev 15d (Oct 12 2026): Craps Lingo, both apps (Bill)
- **New S4.5 Craps Lingo** (UI, gestures, hooks), **new S2 summary**, **new file `craps-lingo.md`** (the term list) and **new data file `lingo.json`** (shared by both apps).
- **79 terms:** Dice calls 21 · Bets 26 · Actions 14 · Table talk 18. Table Craps lists 79; Bubble lists 78 (no Fire Bet). Each term has a plain meaning, an example call, a "Say it" hint where needed, a tag for app(s) and mode(s), and a board link where the board has the bet. Uncommon slang was checked against at least one source (`craps-lingo.md` §8); terms that couldn't be verified, or don't fit the voice, were left out (§7).
- **Hooks:**
  - the Lingo screen (Learn + menu), with fuzzy search ("nina" finds nine) and category filters;
  - **long-press a bet** for its spot sheet;
  - **tappable roll calls**, which never block a roll or delay the dice;
  - **Show me on the board** (highlight + Tutor line);
  - the **"Talk the Talk"** badge.
- **Gesture conflict found and resolved:** the spec already used long-press on bet spots for the ATS take-down (S1.6) and the multiplayer owners view (A2.7.6). Long-press now opens **one spot sheet** that holds the lingo card, the Tutor line, Take down and the owners row. Tap and swipe are unchanged. BILLY'S WAY, the chip rail and the Comparison chart keep their own long-press sheets. Nothing in the dock takes a long-press. S1.6, A1.4, A1.5a, A2.2b.3 and A2.7.6 carry rev 15d notes.
- **Decisions made in rev 15d (recommended defaults the build uses until Bill decides; Open questions 7–9):**
  - **Badge:** Silver, earned by opening 25 distinct terms (not the quiz). Bubble **#32**, Table after Table Manners (Bronze).
  - **The roll-call peek doesn't hold auto-roll** (a new exception to A1.5a), and it closes when the next roll starts.
  - **Show me** opens the Tutor line even with Billy Tips off, without turning Tips on.
  - **Lingo is free** in both apps. New Setting "Lingo links on roll calls" (default On).
  - **Fire Bet** is Table only and is kept out of Bubble's bundle (the S6 word ban).
- **No rule, pay, edge or Premium change.** No new bet; no tip or toke bet. "Cash out" isn't used.
- **Build items:** Table `table-craps-build-checklist.md` §19 **LG-01 to LG-18**, required tests **RT-33 to RT-37**. Bubble **BL16-30 to BL16-42** (run-16 list above).
- **Not edited:** `badges-bubble.md` (it still reads v4 / 30 badges; the v5 update to 32 badges lands with BL16-23 and BL16-37); `bb-mockups/CRAPS-LINGO.md`. Two lines in that Design Desk call sheet are out of date: "ATS, Regular only" (ATS is in both modes since rev 13), and the POWER PRESS "Let it ride!" call ("let it ride" is a banned celebration phrase, S4.3).

## Rev 16 (Oct 13 2026, 12:00 PM PT): round-5 batch, six additions (Bill approved), both apps
- **Source:** `market-check-oct2026.md` (Oct 13). Bill approved six additions; each now has its own section. **Spec only:** no code or build changed.
- **New sections:**
  1. **S8 Session history and bankroll chart:** per-session chart (Practice chips total per settled roll, limit lines, seven-out ticks, pip tooltips) and an all-time chart of cumulative session nets, where a **Reset bankroll never counts as a gain**. Device-local, 200 full sessions, then min/max downsampling.
  2. **S9 Your Dice mode (enter your own dice):** a separate, labeled mode with its own bankroll and felt, entered only between hands. It settles with the same engine. **Exclusion list X1–X8:** never the RNG path, Fair Dice (every card, scope and the CSV), RNG stats / tests, the Longest Roll board, badges, the Comparison, the RNG history, or any quoted rate. It's named "Your Dice" / `dice_source: entered`, because "manual" already means a ROLL tap (A1.5a).
  3. **S10 Table rule settings and limit tiers:** one Table rules sheet for Field 12 (2:1 = 5.56%, 3:1 = 2.78%), odds (T-3 / B-3 already have 1x, 2x, 3-4-5x, 5x, 10x, 20x, 100x; 20x = 0.10% combined, my calc), starting bankroll (only through Reset) and a new **limit tier** (B-32 / T-31). **Tiers are PROPOSED** (Bill's call): Table $10/$500 · $25/$2,000 · $100/$5,000 · optional $500/$25,000; Bubble $5/$1,000 · $25/$2,500 · $100/$5,000. **Odds stay exempt from the max** in every tier. Exposure check: none of the four is reachable in either build's UI yet; Bubble's Field 12 label and payout read different things.
  4. **S11 Roll speed (Normal · Fast · Instant, B-33 / T-32) and tap-to-skip:** a timing table for the dice, point-made tiers, quiet, Big Win, the PSO and its long-hand tag, the Fire stinger and the rail animations. The 2.5 s caps stay the ceiling, and nothing gets longer. Merges are unchanged. Auto-roll intervals and pauses are unchanged; the limit prompt waits for the overlay to end. Same draw at every speed (Rule 0); every speed counts the same.
  5. **S12 Quick bets:** Table ACROSS · INSIDE · OUTSIDE; Bubble keeps BILLY'S WAY as its across key and adds INSIDE · OUTSIDE. Buy vs Place by the lower edge at that amount under the active rules (Standard: Buy 4/5/9/10, Place 6/8). $10 table: **$64 / $44 / $40**, 6/8 in $6 units ($12 per $10), scaled by the larger of the chip and the minimum, capped at legal steps. **One bet per number** (keep the player's type, skip Lays, never convert silently). The point is skipped by default (B-34 / T-33). Blended edges 1.71 / 1.74 / 1.83%.
  6. **S13 Billy's Payout Drills:** 8 drill types (D1–D8), Rookie / Dealer / Boxman, 10 / 20 / 30 points per correct answer in rounds of 10, answers computed by the engine's own payout functions, never touching practice chips. A **PROPOSED** Silver badge, "Dealer's Apprentice" (Bubble #33).
- **Rule text touched:**
  - **Rule 0 clause 9 (new):** Your Dice rolls aren't app rolls, are labeled, and are excluded per S9.
  - **S3 settings map:** new rows B-32–B-34 / T-31–T-33; row 22 (dice source) notes Your Dice is a mode, not a dice-source setting.
  - **A1.5a:** Roll speed and Your Dice notes.
  - **A1.6 / A2.3:** new setting rows.
  - **A1.2 / A2.2:** limit-row pointer to S10.
- **Not changed:** every pay, edge and Standard default; the chip set ($1 / $5 / $25 / $100 / $500, **no $10 chip**); Billy's Way (Bubble only); the Free / Premium split as decided (rev 15 / 15d). Suggested changes to the split are only suggestions. "Cash out" isn't used.
- **Suggested Free / Premium (Bill's call):**
  - **S8:** Free = session chart, last 20 sessions, totals; Premium = full list, all-time chart, filters, sessions CSV.
  - **S9:** Free, including paste a sequence.
  - **S10:** Free = tier picker and bankroll presets (new to Free); Premium = Field 3:1, odds other than 3-4-5x, custom limits / bankroll (as today).
  - **S11:** Free.
  - **S12:** Free.
  - **S13:** Free = all drills at Rookie / Dealer and the badge; Premium = Boxman, "Use my table rules", drill history.
- **$1 chips for $6 / $12 Place 6/8 at the $10 Table Craps table:**
  - **The rail supports $1s** (spec S4 Chips; A2.2b intro, A2.2b.2 reserve 5 × $1, A2.2b.4 $5 → 5 × $1 change; build `js/rail.mjs:7, 29-49, 10` on `cursor/table-craps-6ff7` @ `34f012d`).
  - **$12 works:** from a fresh $1,000 rail it pays with 2 × $5 + 2 × $1, and the $14 win comes back as 2 × $5 + 4 × $1 (run on the branch code).
  - **$6 can't be bet at the Standard table,** by design: it's under the $10 minimum. The build's Place 6/8 minimum is $12 (`js/table-rules.mjs:214`; rev 15 T5 $12).
  - **Two gaps:**
    - the build hard-codes that $12 even at a T-12 = $5 table, where P14-3 says the $6 amounts apply (RS-09);
    - taps add at least $12 on 6/8, so $18 / $30 can't be built (QB-13 proposes +$6 per $1 / $5 tap once a bet is up).
- **Found while checking (flags):**
  - **Rail breakdown drift:** the build reserves 4 × $25 as well, so $1,000 = 1 / 3 / 7 / 4 / 5 (`js/rail.mjs:40-42`, `tests/table.test.mjs:172-175`), but A2.2b.2 and CR-02 say 1 / 4 / 3 / 4 / 5. The spec or the build should change; not decided here.
  - **CR-12 fixture:** "Place 6 $10 → +$11.66" can't happen at Table Craps, because the build refuses non-$6-step Place 6/8 amounts (`stepOf`, `js/table-rules.mjs:173-176`; "Place 6 and 8 are in $6 steps.").
  - **A1.4:** Billy's Way's $1-chip rows ($1 Buy, $1.20 Place) are under the $5 Bubble minimum, so they only apply at a B-12 $1 table (BL16-78).
  - **Checklist PM-10** still says Base 1.6 s; rev 15c set it to 1.2 s.
  - **Spec header** said rev 15a; it now says rev 16.
  - **`badges-bubble.md` #23 Slow Double** gets easy with big bankrolls (S10 badge note).
- **Open questions for Bill:** 10–17 (Open questions).
- **Build items:**
  - **Table:** `table-craps-build-checklist.md` §20 SH-01–SH-12, §21 YD-01–YD-14, §22 RS-01–RS-12, §23 FR-01–FR-10, §24 QB-01–QB-14, §25 PD-01–PD-12; required tests RT-38–RT-44; flags F11–F16.
  - **Bubble:** run-16 list, round-5 block: BL16-50–57, BL16-60–68, BL16-70–78, BL16-80–86, BL16-90–97, BL16-100–107.
- **Not edited:** `badges-bubble.md` (Dealer's Apprentice #33 and the #23 note would land with BL16-106), `craps-lingo.md` / `lingo.json` (term 59 "Inside" says Place 5/9; the Quick bet buys 5/9, as T6 already does; a wording tweak for Bill), `table-strategies-appendix.md`, `market-check-oct2026.md`.

## Rev 16 LOCKED (Oct 13 2026, Bill + Chief)
- **Limit tiers (approved):** Table $10–$500 Standard, $25–$2,000 High, $100–$5,000 High roller, Salon $500–$25,000. Bubble $5–$1,000, $25–$2,500, $100–$5,000. Side-bet limits identical in every tier. Odds exempt from max in all tiers.
- **Free:** tier picker + starting-bankroll presets. **Premium:** Field 12 3x, odds other than 3-4-5x, custom limits/bankroll.
- Rule 0 clause 9 (Your Dice) APPROVED. Fast/Instant shorter celebrations APPROVED. Badge #23 Slow Double scales with starting bankroll.
- **Design Desk round-5 answers (bb-review/handoff-assets/round5/OPEN-QUESTIONS.md):**
  1. Your Dice is a separate mode with its own bankroll (S9), not tagged rolls mixed into a normal session; excluded per X1–X8; free; single-player only (off in TC multiplayer).
  2. TC: entry on the shooter page, SHOOT commits. Not from the board.
  3. Session = table entry until Leave table, Reset bankroll, or 30 min idle. Free keeps last 20 sessions + per-session chart; all-time chart, full list, filters, CSV Premium. Stop-loss/win-goal use the limits set at session start.
  4. Superseded by the approved tiers above. Bankroll presets must cover Salon: OPEN for Bill (proposed presets up to $100,000).
  5. Field 12 at 3x stays Premium (Bill).
  6. Fast/Instant per S11 (DD's timings OK; toasts ≥2.0 s OK). Instant is wanted. Default stays Normal for everyone.
  7. Quick bets use the lower-edge choice per number (S12): Buy 4/10 (and 5/9 at Standard), Place 6/8 — overrides the "4/10 Placed" assumption. Top up to unit, never double; unit = max(chip, table min); strip may show only after the point is set.
  8. Drills per S13: 8 types, Rookie/Dealer/Boxman, 10/20/30 pts per correct answer; Rookie+Dealer free, Boxman Premium; badge "Dealer's Apprentice" Silver (Bubble #33; the badge list is no longer fixed at 30). TC Lay/vig questions are free (Lay is core TC rules).
  9. iPad: three columns at ≥1,366 px OK; portrait mock OK; the k scale-up is required so taps are ≥44 pt.
  10. The rotate card covers play screens AND sheets below 400 px tall in landscape (it's the fix for v1d P1-1).
  11. Bet-unit advisor goes to round 6.
