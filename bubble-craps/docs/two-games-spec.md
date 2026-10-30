# Billy Bubs: Two-App Spec

**Apps:** **App 1: Billy Bubs Bubble Craps** (Regular / Crapless) and **App 2: Billy Bubs Table Craps** (formerly "Live Table": shooter, dice setting, multiplayer)
**Status:** Spec only. No code or repo changes.
**Owner:** Bill Jenson
**Audience:** Design Desk (mockups in `/workspace/bb-mockups/app1-bubble` and `/workspace/bb-mockups/app2-table`), whoever builds it later
**Current web build:** https://wjenson27-cpu.github.io/billy-bubs-practice/ (one repo today: `index.html` = bubble machine, `table.html` = full table)
**Spec date:** Oct 10, 2026 · **rev 8**

**Rev history:**
- **rev 5:** split into two separate apps; Fair Dice tab; Repeater bets; Heater meter; shared-code plan; mockup review.
- **rev 5 (Bones check, Oct 10):** Design Desk's Section G draft (Repeaters + Heater) checked and merged into S1.7 and S6. Repeater pays corrected to FOR 1; Repeaters now work every roll (any 7 loses), can be bet any time, and are on in Crapless (Bill); Heater uses Design Desk's score; Hard Way All Day source note (Paris 165 TO 1).
- **rev 8 (Oct 10):** **three-screen Play layout** in both apps (left: Repeaters + Hops [+ Fire Bet in Table Craps]; middle: board, default; right: hood / shooter), S4.1. All **21 hop bets** defined (S1.4a, B-29/T-29). PRESS / POWER PRESS move to the dock beside ROLL.
- **rev 7 (Oct 10):** the meter is the **Blazing meter**, with exactly 4 tiers (Cold · Warm · Hot · Blazing) and re-mapped thresholds. Fire Bet is bet only before the shooter's first come-out. App 2 $10-chip removal added to the build list with file/line refs. Section H resolved.
- **rev 6 (Oct 10):** Bill's answers to the 8 open questions applied (lay vig on win, Don't Pass takedown, Hard Way All Day 165 to 1 option, LAY tab Regular-only, "Blazing", chips $1/$5/$25/$100/$500, Premium per app). PRESS redefined (original-bet unit, stacking, UNDO/CLEAR) and new **POWER PRESS**. New **Fire Bet** in Table Craps only (A2.2a).
- **rev 5 (PRESS + name, Oct 10):** App 2 renamed **Billy Bubs Table Craps**; new App 1 **PRESS** key (A1.4a), with B-27/B-28, B5/B12 hooks, Tutor rows, and mockup conflicts 14–16.
- **rev 4:** ATS stays up after a hit.
- **rev 3:** Billy's Way buys 5/9 and is Bubble-only; Hard Way All Day stays up after a win; Premium Hard Way All Day payouts.
- **rev 2:** Standard and Premium rules, multiplayer, defined bets.

> **Education only. Play money only. No real gambling, no deposits, no payouts, no prizes.** In both apps, label every bankroll "Practice chips". Put this disclaimer in the onboarding, the first Tutor screen, the multiplayer lobby (App 2) and the store listings.

---

## 0. Two apps, one family

**Decision (Bill, Oct 10):** two separate apps, not one app with a game picker. Each app has its own Standard rules, Premium Custom Rules, strategy library and Tutor. They share the rules math, the Edge Preview pattern, the look and feel, Fair Dice, and the code listed in S7.

| | **App 1: Billy Bubs Bubble Craps** | **App 2: Billy Bubs Table Craps** |
|---|---|---|
| Who rolls | The machine (dice in a dome), on a bet timer. No shooter. | The player is the shooter (pick dice, set, throw). |
| Rules | **Regular / Crapless** toggle (separate rule sets) | **Regular only** |
| Players | Single player | Single player (Standard); multiplayer pass-and-play (MVP), online later |
| Signature features | Billy's Way, PRESS / POWER PRESS, Crapless mode, bubble dome | Dice setting and shooter practice, multiplayer, **Fire Bet**, skill simulation (Premium, labeled as a simulation) |
| Bottom tabs (mockups) | **Play · Fair Dice · Learn · Premium · Settings** | **Play · Fair Dice · Learn · Premium · Settings** |
| Play sub-controls (mockups) | Felt, Bet Panel, Regular/Crapless switch, Repeat / Bets Off / **Press / Power Press** / Billy's Way / Take Down, auto-roll timer | Shooter view, then **Bets · Strategies · Tutor · Stats** keys |
| Learn tab | Strategy Library (All / Regular / Crapless / Lessons), Tutor tour | Strategy Library (All / Baseline / Don't / Shooter), Tutor tour, shooter practice |
| Tutor name in UI | "Billy Tips" toggle (Dealer Billy mascot) | Same |
| This spec | **App 1 section** | **App 2 section** |

**Renames:**
- "Live Table" (and the interim "Craps Table") becomes **"Billy Bubs Table Craps"** (short form: "Table Craps"). Name confirmed by Bill, Oct 10.
- "Bubble Craps game" becomes **"Billy Bubs Bubble Craps"**.
- "Game" becomes "App" throughout.
- Strategy card IDs are **B1–B12** (App 1) and **T1–T10** (App 2; formerly L1–L10).
- Settings IDs are **B-xx** (App 1) and **T-xx** (App 2), replacing the old combined #1–#24 (mapping in S3).

**Document map:**
- **Shared (S):** S1 Rules math and shared bets · S2 Tutor framework · S3 Edge Preview pattern and settings ID map · S4 Look and feel (S4.1 three-screen layout) · S5 Fair Dice tab · S6 Blazing meter · S7 Shared code
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
| Low Rolls / High Rolls / Roll 'Em All (ATS) | Multi-roll | 31 / 31 / 156 FOR 1 | 18.30% / 18.30% / 17.98% | **Regular and Crapless** (rev 13). Any 7 loses, including a come-out 7. Stays up after a hit. S1.6 |
| **Hard Way All Day** | Multi-roll | **165 FOR 1** (Standard) | **21.43%** | Stays up after a win. S1.5 |
| **Fire Bet** (Table Craps only) | Per shooter | 4 / 5 / 6 different points: 24 / 249 / 999 **to 1** | **20.76%** | Never in Bubble Craps or Crapless. A2.2a |
| **Repeaters** 2–12 | Multi-roll | 40 / 50 / 65 / 80 / 90 **FOR 1** (2&12 / 3&11 / 4&10 / 5&9 / 6&8) | **18.37% / 21.88% / 19.75% / 18.08% / 20.62%** | Both apps, Regular and Crapless (Bill). Works every roll; any 7 loses. Stays up after a hit. S1.7 |

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

### S1.6 ATS: Low Rolls / High Rolls / Roll 'Em All (App 1 Regular and App 2): DEFINED

**Names:** the casino names are All Small, All Tall and Make 'Em All. The app labels them **Low Rolls**, **High Rolls** and **Roll 'Em All** (`js/engine.js:397-402`; `js/table-app.js:30-31`).
**Where:** **Regular only**: App 1 Regular rule set and App 2. **Hidden in Crapless** (Bill's no-ATS rule).

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
- The **take-down** control shows on long-press or in the bet drawer.

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
- This doesn't clash with Bill's no-ATS / no-Fire rule for Crapless. That rule covers those two bets only. (The Fire Bet is in Table Craps only, A2.2a.)
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
  - Field (5.56%).
  - Hardways (9 to 11%).
  - Any Craps, C&E, Hop, Horn (11 to 14%).
  - Big Red (16.67%).
  - Low/High/Roll 'Em All (18.30% / 18.30% / 17.98%; Regular only; they stay up after a hit, so they keep costing you until a 7 or a takedown).
  - **Repeaters** (18.08% to 21.88% at the Standard pays; they stay up after a hit). Repeater 3/11 is the worst at 21.88%.
  - **Hard Way All Day (21.43% at the Standard 165 for 1, the highest edge on the board; it stays up after a win, so it keeps costing you until you take it down).**
- **Dice-have-no-memory rule:** in every app and track, Tutor never uses "due", "overdue", "hot dice" or "cold dice" (S6 banned-words list), and never suggests a bet because of a streak, the Blazing meter, or Fair Dice results.

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
| PRESS / POWER PRESS (App 1, A1.4a) | "Edge unchanged: Place 8 1.52% before and after. At risk on a 7: $32 → $38." POWER PRESS adds "$1 back to your chips". Shown while the key is held. |
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
| 21 | Bet timer | B-26 | T-26 (multiplayer betting timer) |
| 22 | Dice source / skill model | — (RNG always) | T-24 |
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
| new | Crapless Place 2/12, 3/11 pays | B-25 | — |

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
- The mockups put the ATS lamp strip (Low Rolls / Roll 'Em All / High Rolls) above the number boxes in Regular and remove it in Crapless. Come and Don't Come run full width under the numbers, with the Field under them. That's consistent with this spec.
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
- The ATS lamp strip (Regular), Come / Don't Come and the Field stay where they are.
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
- **Bubble Craps:** dome / hood with the roll animation, the result line ("5·3 · EASY EIGHT"), the point puck, the last-20-rolls strip, the **Blazing meter** with dice heat, and the bet timer.
  - When a Place/Buy bet just won, it shows the win ("Place 8 +$7") next to the PRESS / POWER PRESS labels (A1.4a).
- **Table Craps:** the shooter screen (pick 2 of 5 dice, dice set, grip, throw meter, back wall), the result line, the Blazing meter (seat rail), the Fire rail and RSR.
  - Non-shooters in multiplayer see "Ana is shooting" with a live view of the throw.

**Pinned on ALL THREE screens (never scrolls away, never hidden by a swipe):**
- **Bubble Craps:** **ROLL**, **PRESS**, **POWER PRESS**, the **chip rack ($1 / $5 / $25 / $100 / $500)**, and the **bankroll bar** (Practice chips · On table).
- **Table Craps:** **SHOOT**, the **chip rack ($1 / $5 / $25 / $100 / $500)**, and the **bankroll bar** (Practice chips · On table).
- On the right Dice screen the chip rack can shrink to a compact row, but it stays visible and tappable.

**Navigation:**
- **Swipe** left/right between the three screens (snap, no free scroll).
- **3 dot indicators** (Side bets · Board · Dice) sit just above the bottom dock. **Tap a dot** to jump.
- **Always visible on every screen:** the top HUD with **Practice chips (bankroll)** and **On table (active bet total)**, the point puck, the Billy Tips pill, and the FAIR shortcut. Also the bottom **dock**.
- **The dock (every screen):**
  - **Bubble Craps:** **ROLL** (or the auto-roll timer ring), with **PRESS** and **POWER PRESS** beside it, matching mockup round 7. The keys are greyed out with the reason when they don't apply (A1.4a).
  - **Table Craps:** **SHOOT**. On the left or middle screen it slides to the right screen and starts the pick/set/throw flow, because the shooter has to throw there. In multiplayer it's only active for the current shooter; other players see "Waiting for Ana".
- **Mini roll-result toast** when you're not on the right screen. It sits under the HUD for 2.5 s and shows the dice faces, the total and your net ("4·4 HARD 8 · +$27"). Tap it to jump to the Dice screen.
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

## S5. Fair Dice tab (both apps)

**Purpose:** show, in plain words, that the dice are fair and random, and teach that **dice have no memory**. Same tab in both apps (mockups: App 1 `06-fair-dice`, App 2 `06-fair-dice`). App 2 adds rolls per seven (RSR) and dice-set context.

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
- **App 2 Premium skill simulation:**
  - When "Controlled-shooter skill (simulation)" is on, the table engine deliberately **changes outcomes**: the `influence` mode returns the set faces with probability *p*, and the `srr` mode changes how often 7s show (`js/table-engine.js:1173-1208`; the control is off by default at `js/table-engine.js:86-87`).
  - Those rolls are **not fair by design**. Fair Dice must tag them "simulated skill", leave them **out of the fairness test and charts** by default (toggle: "include simulated rolls"), and say so in a banner.
  - Minor: in `srr` mode, `rollNonSeven` gives up after 20 redraws and returns 1-1 (`js/table-engine.js:1162-1171`). That's a negligible bias, and only inside the simulation.
- **Plain-words card:**
  - "Every roll uses your device's secure random generator. Each die is a fair 1 to 6, and the two dice are independent. Nothing on this screen, not your bets, your streak, the Blazing meter, or your dice set, can change the next roll."
  - App 2 adds: "...unless you turn on the Premium skill simulation, which is labeled and kept out of these stats."

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
| **Last 20 rolls** | Chips with totals; 7s in red | — |
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
- **Premium:** the export sheet offers scope (This session / Last 100 / All time / date range), a "include simulated-skill rolls" toggle (App 2), and file names like `billy-bubs-bubble-craps_rolls_2026-10-10.csv` / `billy-bubs-table-craps_rolls_2026-10-10.csv`.
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
| `dice_source` | `rng-secure` / `rng-fallback` / `skill-sim` | `skill-sim` = App 2 Premium simulation |
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
4. **Banned words** in any Blazing meter, Fair Dice or Tutor copy: "due", "overdue", "about to", "streak will", "can't lose", "lucky dice", "hot dice/cold dice", "the table is turning". Use "this hand has lasted…", "so far", "random".
5. **Naming vs the Fire Bet (decided: the meter is the "Blazing meter", and its top tier is "Blazing"; Bill, Oct 10):**
   - The tiers are exactly **Cold · Warm · Hot · Blazing** (Bill, rev 7). "Heater" and "On Fire" aren't tier names anywhere.
   - **A real Fire Bet now exists, in Table Craps only** (A2.2a). It's never in Bubble Craps (Regular or Crapless). That makes the separation matter more:
     - the Blazing meter is a meter, the Fire Bet is a bet;
     - the Blazing meter never shows point markers, the word "Fire", or Fire-rail art;
     - the Fire rail never uses the Blazing meter's gauge colors or motion.
   - The Blazing meter's "+3 per point / or 4 points" counts **all** points made, repeats included. The Fire Bet counts only **different** points. Tutor copy for the Blazing meter talks about **hand length**, never "points toward" anything.
   - **Flames and embers** (M21 icon, M22 dice heat) are fine as Blazing meter decoration, since the dice faces stay white. But never put "FIRE" text near the felt, and keep the heat effects off the bet spots and the Fire rail.
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
- **App 1:** dome machine and bet timer, auto-roll, Regular/Crapless switch, Billy's Way, Bubble Bet Panel.
- **App 2:** shooter flow (pick, set, throw, no-roll), dice-set practice, skill simulation (Premium), multiplayer (seats, rotation, pass-and-play; online later).

# APP 1: BILLY BUBS BUBBLE CRAPS

## A1.1 Screens and tabs (match the mockups in `app1-bubble/`)
| # | Mockup screen | Spec section |
|---|---|---|
| 01 | Home / onboarding (dome, Regular vs Crapless cards, "Play Regular · 15-second bet timer · auto roll", Tutor tour, "What's Billy's Way?") | A1.2, A1.8 |
| 02 | Dome roll | A1.5 |
| 03 | Table: Regular felt | A1.2, S4 |
| 04 | Table: Crapless felt (no ATS, no Don't spots, ten number boxes) | A1.3 |
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
| ATS (Low / High / Roll 'Em All) | **Regular only**, hidden in Crapless. 31 / 31 / 156 FOR 1. **Stays up** after a hit | 18.30% / 18.30% / 17.98% (S1.6) |
| **Repeaters** | **Both modes** (Bill). 40/50/65/80/90 **FOR 1**. Works every roll; any 7 (including a come-out 7) loses; bet any time; stays up after a hit | 18.08%–21.88% (S1.7) |
| Billy's Way | Regular: Buy 4/5/9/10 + Place 6/8 ($6 units). Crapless: + Buy 2/3/11/12 | 1.71% / 1.43% (A1.4) |
| **PRESS / POWER PRESS keys** | Both modes. PRESS: + the original bet per tap (stacks; UNDO/CLEAR). POWER PRESS: the net win back on the number, rounded down to a clean unit. Bankroll funds it; Buy vig on win only | Unchanged per bet (A1.4a) |
| Fire Bet | **Never in Bubble Craps** (Regular or Crapless). Table Craps only (A2.2a) | — |
| Table min / max | $5 / $500 (Repeaters: $1 min, $25 max per number) | — |
| Starting practice bankroll | $1,000 (`js/engine.js:14`) | — |
| Bet timer | 15 s, then auto roll | — |
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

### A1.3.4 Not in Crapless mode
- **No Don't Pass, Don't Come, Lay bets or Lay Odds.** Hide or disable those spots. (Wizard notes an unconfirmed report of crapless lay bets; this app doesn't offer them.)
- **No Fire Bet** in Crapless. The Fire Bet is never in Bubble Craps at all; it's Table Craps only (A2.2a).
- **ATS is in Crapless** (rev 13). Low Rolls, High Rolls, and Roll 'Em All use the dice total. Any 7 loses them, including a come-out 7. Pays and edges match Regular. The Oct 10 "ATS stays hidden" rule is superseded.
- **Roll readouts show pip dice** (rev 13a, S4.2). The result line, roll toast, HUD, bet-panel LED, Last strips, Fair Dice history, and the leaderboard seven-out use the same die faces as the roll. CSV export stays numeric (`die1`, `die2`). The Table Craps turn log is later.
- **B13 bankroll** (rev 13c). Continuous Come stop-loss is 40% with a +30% win goal (the library card used to say 30%). Crapless guides 400 units. Table Craps T11 uses the same 40% stop-loss.

## A1.4 Billy's Way: DEFINED (App 1 preset, matches the current code)

**Decision (Bill, Oct 10):** Billy's Way **buys 5 and 9** (no placing). **Regular = Buy 4, 5, 9, 10 + Place 6/8 in $6 units. Crapless = the same + Buy 2, 3, 11, 12.** It is **Bubble Craps only**, not in Table Craps. That is exactly what the code does today, so no code change is needed. *(Note: Bill's original wording described it as "Place 4-10 across." The decision replaces that wording.)*

**How the code implements it** (Bubble only; no Billy's Way in `table.html` or `js/table-engine.js`):
- Constants: `BILLYS_WAY_BUY = [2, 3, 4, 5, 9, 10, 11, 12]` and `BILLYS_WAY_PLACE = [6, 8]` (`js/engine.js:1290-1292`).
- **Buy** the selected chip on whichever of those numbers the mode offers (`billysWayBuyNumbers` filters through `buyNumbers` → `placeNumbers`: `js/engine.js:1307-1313`, `237-239`, `195-197`). That's 4/5/9/10 in Regular, plus 2/3/11/12 in Crapless.
- **Place 6 and 8** at chip × 6/5 (`js/engine.js:1295-1304`).
- **Several separate bets, not one bet.** `placeBillysWay` calls `placeBet` per spot (`js/engine.js:1318-1365`). Each spot then follows the normal Buy/Place rules: it stays up after a hit, loses on a 7, is off on the come-out unless set to work, and is parked by Bets Off. Each one can be taken down on its own.
- **Each press stacks one unit.** It skips spots the bankroll can't cover and shows a toast (`js/ui.js:516-550`). Sub-label: "Buy $5 · 6/8 $6" (`js/ui.js:481-486`). Button at `index.html:443-445` (id `across-btn`), handler at `js/ui.js:1113`, help text at `index.html:636-646`, README at `README.md:42, 129`.
- Buy vig is 5% of the buy stake, taken on wins only (`js/engine.js:246-249`). Example: a $5 Buy 4 wins $10 − $0.25 = $9.75.

**Unit scaling (one tap, per chip; chips $1/$5/$25/$100/$500, no $10):**
| Chip | Buy each (4/5/9/10; + 2/3/11/12 Crapless) | Place 6 and 8 each | Regular total (6 spots) | Crapless total (10 spots) |
|---|---|---|---|---|
| $1 | $1 | $1.20 | $6.40 | $10.40 |
| $5 | $5 | $6 | $32 | $52 |
| $25 | $25 | $30 | $160 | $260 |
| $100 | $100 | $120 | $640 | $1,040 |
| $500 | $500 | $600 | $3,200 | $5,200 |

Payout examples ($5 chip): Buy 4/10 hit +$9.75, Buy 5/9 hit +$7.25, Place 6/8 hit +$7, Buy 2/12 hit +$29.75, Buy 3/11 hit +$14.75.

**Edges (Standard rules; blended = expected loss ÷ total on the layout):**
| Version | Spots | Units | Blended edge per bet | Per roll |
|---|---|---|---|---|
| **Billy's Way, Regular** | B4 B5 P6 P8 B9 B10 | 6.4 | **1.71%** | **0.48%** |
| **Billy's Way, Crapless** | B2 B3 B4 B5 P6 P8 B9 B10 B11 B12 | 10.4 | **1.43%** | **0.37%** |
| *Reference: all Place 4-10 (Bill's original wording)* | P4 P5 P6 P8 P9 P10 | 6.4 | 3.90% | 1.04% |
| *Reference: Crapless with 2/3/11/12 Placed* | Placed 4/5/9/10 and 2/3/11/12 + P6 P8 | 10.4 | 4.98% | 1.18% |

Per-spot edges are from S1.3. Seven-out exposure per press: 6.4 units (Regular), 10.4 units (Crapless).

**Tutor copy:**
- Beginner: "Billy's Way covers every number in one tap. It buys the outside numbers (cheaper than placing them) and places 6 and 8. A 7 takes them all."
- Experienced: "1.71% blended (Regular), 1.43% (Crapless). Each spot is the cheaper way to bet that number under Standard rules. Placing 4-10 instead would cost 3.90%."
- If Premium sets commission to "Always": "Billy's Way buys now cost 4.76% each, so the blend rises." Show the live value in the Edge Preview.

**UI:**
- Button: **BILLY'S WAY**, sub-label "Buy $5 · 6/8 $6" (as today).
- Long-press preview sheet: each spot, stake, edge, total and seven-out exposure. *(New, not in the code yet.)*
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
- **Cap:** a tap that would go over the table max (Standard $500 per bet, B-13) or over the bankroll is refused, and the label greys out with the reason. Partial units are never added.

### POWER PRESS (let the win ride, rounded down)
- **One tap puts the amount just won on that bet back onto the number**, rounded **down** to a multiple that pays correctly. The rest stays in the bankroll.
  - Example: $6 on 8 wins $7. POWER PRESS adds **$6** (the bet becomes $12), and **$1** stays in the bankroll.
- **"Amount just won"** is the bet's net profit on that roll. For a Buy, that's after the 5% vig (vig on win only).
- **One POWER PRESS per win.** After use, the key reads "POWER PRESS · used" until the next win. PRESS can still be tapped on top.

**Rounding units (correct-pay multiples):**

| Bet | Pays | Rounding unit | Example ($ bet → win → POWER PRESS adds / back to bankroll) |
|---|---|---|---|
| Place 6 / 8 | 7 to 6 | **$6** | $6 → $7 → +$6 / $1 |
| Place 5 / 9 | 7 to 5 | **$5** | $5 → $7 → +$5 / $2 |
| Place 4 / 10 | 9 to 5 | **$5** | $5 → $9 → +$5 / $4 |
| Crapless Place 2 / 12 | 11 to 2 | **$2** (pays $11 per $2) | $5 → $27.50 → +$26 / $1.50 |
| Crapless Place 3 / 11 | 11 to 4 | **$4** (pays $11 per $4) | $5 → $13.75 → +$12 / $1.75 |
| Buy 4 / 10 | 2 to 1, less 5% vig on win | **$5** | $5 → $9.75 → +$5 / $4.75 |
| Buy 5 / 9 | 3 to 2, less vig | **$5** | $5 → $7.25 → +$5 / $2.25 |
| Buy 6 / 8 (rare; Place is cheaper) | 6 to 5, less vig | **$5** | $5 → $5.75 → +$5 / $0.75 |
| Crapless Buy 2 / 12 | 6 to 1, less vig | **$5** | $5 → $29.75 → +$25 / $4.75 |
| Crapless Buy 3 / 11 | 3 to 1, less vig | **$5** | $5 → $14.75 → +$10 / $4.75 |

**Buy unit, and why $5:**
- With commission on wins only, nothing is charged when you press. The next win takes 5% of the **whole new stake** (`buyVig`, `js/engine.js:247-249`, to the cent), so any amount pays correctly to the cent.
- $5 matches the table unit and Billy's Way's $5 Buy (25¢ vig per $5).
- **With a Premium rounding preset (B-7),** the Buy unit becomes **$20** ($1 per $20) or **$25** ($1 per $25), so the vig stays a whole dollar.
- **With Premium "commission Always" (B-6),** the 5% on the pressed amount is charged at the press. The rounded amount is cut so that press + vig fit inside the win, and the label shows it ("+$5 (+$0.25 vig)").

**Edge cases:**
- **Rounded amount is $0** (the win is smaller than one unit, e.g. $1 on Place 4 wins $1.80): POWER PRESS greys out with "win under $5". The win is already in the bankroll.
- **Table max:** the add is cut to the largest whole unit that fits under the max. **Any overflow stays in the bankroll** (it was already credited). Toast: "Capped at $500. $7 stays in your chips."

### UNDO / CLEAR (before the next roll)
- While taps are pending, a small **UNDO · CLEAR** pill shows under the keys. **UNDO** removes the last PRESS or POWER PRESS tap. **CLEAR** removes every press tap since the last roll.
- Chips go back to the bankroll, and a POWER PRESS undo re-enables POWER PRESS.
- **Locked once the dice roll** (the 15 s bet timer still runs).
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
| POWER PRESS only: rounded amount is $0, or it was already used for this win | "win under $5" / "used" |

After the point is made, the next roll is a come-out, and number bets are off by default. The keys stay grey until a working bet wins again. With "Working on come-out" (B-9) on, a come-out win enables them as normal.

### Hooks
- **Billy's Way (A1.4, B12):** "Auto-press after each hit" (B-28: **Off / PRESS / POWER PRESS**, max 1–5 per number; default Off).
  - When a Billy's Way spot wins, the app does the chosen press on **that spot only** and shows a toast ("Auto POWER PRESS 8 +$6 → $12, $1 to chips").
  - It follows every grey-out rule.
  - Each Billy's Way tap is a "set by hand" placement, so it resets that spot's original bet.
- **B5 "Place 6/8 Regression & Press"** and **Progressions:** the coach's press steps use PRESS ("press 1 unit") or POWER PRESS ("let it ride"). The same B-28 setting applies.
- **Wording fix:** Billy's Way copy says "each press stacks one unit" (`index.html:644`, `js/engine.js:1316`, `README.md:42`). Change it to "**each tap**".
- **The Blazing meter never touches PRESS or POWER PRESS.** No glow, pulse or "press it!" prompt by tier (S6 caution 2; mockup conflict 14).

### Edge and risk (Tutor)
- **PRESS:** the house edge on each bet stays the same (Place 6/8 1.52%, Buy 4/10 1.67%, ...). It puts more chips on the same edge, so **what's at risk and the swings go up.**
- **POWER PRESS:** it lets the win ride. The edge per bet is the same, and the swings go up.
  - **It isn't "playing with house money": once a win is paid, it's your money.** Re-betting it costs exactly what betting any other chips would.
- **Edge Preview (S3):** "Edge unchanged · Place 8 1.52% · At risk on a 7: $32 → $38."

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
- **App defaults:** starting practice bankroll $1,000 and chips **$1 / $5 / $25 / $100 / $500** (Bill, Oct 10; the code has no $500 yet, `js/engine.js:15`); table min $5, max $500.

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
| B-13 | Table maximum | $100 to $5,000 | $500 | Must be ≥ 20x the minimum |
| B-14 | Starting practice bankroll | $200, $500, $1,000, $5,000, custom | $1,000 | $100–$100,000 practice chips (not per rule set) |
| B-15 | Horn payouts | 30:1 / 15:1, 31:1 / 16:1 | 30:1 / 15:1 | Both |
| B-16 | Any 7 / Big Red payout | 4:1, 4.5:1 | 4:1 | Both (4.5:1 → 8.33%) |
| B-17 | Hardway payouts | US 7:1 / 9:1, AU 7.5:1 / 9.5:1 | US | Both |
| B-18 | Side-bet toggles | Field, Hardways, Big Red / Any 7, Any Craps, Yo, C&E, Horn, Horn singles, Hop bets, Hard Way All Day, ATS (Regular rule set only), **Repeaters** | All on | Any. **ATS locked off in Crapless. No Fire Bet in App 1** (Table Craps only) |
| B-19 | Hard Way All Day pay | 150 / **165** / 175 / 200 for 1, 165 **to** 1 | 165 for 1 | 28.57% / 21.43% / 16.67% / 4.76% (165 to 1: 20.95%) (S1.5) |
| B-20 | ATS comes down after a hit | Off (stays up, re-arms), On | Off | Regular rule set only; greyed out in Crapless |
| B-21 | ATS pay table | 31 / 31 / 156 for 1, 35 / 35 / 176 for 1 | 31 / 31 / 156 | 18.30 / 18.30 / 17.98% vs 7.76 / 7.76 / 7.46% (Regular only) |
| B-22 | Repeater pay table | **Standard 40/50/65/80/90**, Generous, Near-fair (for 1) | Standard | S1.7 |
| B-23 | Repeaters come down after a hit · off on the come-out (patent style) · come-out-only betting | Three toggles | All off | Edges unchanged (S1.7) |
| B-24 | Repeaters in Crapless | On, Off | On (Bill) | Crapless rule set only |
| B-25 | Crapless Place 2/12 · 3/11 pays | 11:2 · 11:4 (LV), 5:1 · 13:5 (Nevada rules of play) | 11:2 · 11:4 | 7.14% / 6.25% vs 14.29% / 10.00% (Crapless only) |
| B-26 | Bet timer | 10, 15, 20, 30 s, Off (manual roll) | 15 s | Not per rule set |
| B-27 | *(dropped in rev 6)* | — | — | Half/Full press is replaced by **POWER PRESS** (Standard). PRESS is always one original-bet unit per tap |
| B-28 | Auto-press after each hit (Billy's Way, B5 coach) | Off, PRESS, POWER PRESS (max 1–5 per number) | Off | **Standard (free) setting**, listed here for completeness. Follows every grey-out rule |
| B-29 | Hop pays (the 17 non-Horn hops) | **15 / 30 to 1**, 16 / 31, 16 / 33 (easy / hard) | 15 / 30 | 11.11% / 13.89% → 5.56% / 11.11% → 5.56% / 5.56%. The Horn singles follow B-15 |
| B-30 | Show the dice on each roll | Off, On | Off | Not a rule. Auto-jump to the hood (S4.1); in Settings, not Premium |

**Not in App 1:** lay bets on numbers, lay commission, skill simulation, seven-out dice passing (there's no shooter).
**Premium features (not rules):** Fair Dice CSV export (S5.4) and saved presets.
**Premium upsell list (mockup 11):** "Your casino's odds & payouts · Live house-edge preview · Presets · Fair Dice CSV export · Hard Way All Day 150–200 for 1 · Repeater pay tables". **Remove "Shooter skill simulation"** (App 2 only; mockup conflict 2).

## A1.7 Strategy library: App 1 (12 strategies, B1–B12)

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
  - **Press option (A1.4a):** after the regression, each later hit on 6 or 8 uses PRESS (+ the original $6) or POWER PRESS (let the $7 ride as $6, $1 to chips), up to 3 per number. "Auto-press after each hit" (B-28) can do it automatically.
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
| **POWER PRESS tapped** | "Let it ride: your $7 win put $6 more on the 8 (now $12), and $1 went to your chips. Same odds, bigger swings." | "Power Press: same 1.52% edge, more at risk. It isn't 'house money': once a win is paid, it's your money, and re-betting it costs the same as any chips." |
| **PRESS greyed out** | "Press and Power Press work right after a number bet wins." (+ the kicker reason) | Same, plus the reason: "seven", "bets off", "at table max", "not enough chips". |
| **Auto-press on** (first time) | "Auto-press will press (or Power Press) each Billy's Way spot that wins. More at risk, same odds." | "Auto-press: exposure grows on every hit; expected loss grows with the total bet. Cap it (B-28)." |
| **Roll, no line decision** | "Place/Buy bets on that number got paid." | "Hit on Buy 4: $39 on $20 after the $1 vig. Regress, press, or collect?" |
| **Point hit** | "Winner! The puck is OFF again." | "Net +$X, Y% of your win goal." |
| **Seven-out** | "Seven-out. Line, Place and Buy bets lose. That's normal." | "−$X. Session −Y%. Stop-loss at −Z%." |
| **High-edge bet tapped** | "Long shot with a high house edge." | "Hard Way All Day: 21.4% edge at 165 for 1, 1 in 210 to win." |
| **ATS hit, re-armed** (Regular) | "Low Rolls complete! 2-3-4-5-6 all hit before a 7, so you won 30 to 1. The bet stays up and the lamps start over. Spin the block again, or tap to take it down." | "+$30 per $1 (Roll 'Em All +$155). Re-armed: the next cycle has the same 18.3% edge (18.0% for All). It's still up for this shooter until a 7. Take it down to lock in." |
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
| Table min / max | **$10** / $500 (the minimum matches the code minimum `1000` cents, `js/table-engine.js:72`); Repeaters $1–$25 per number | — |
| Starting practice bankroll | $1,000 | — |
| Players | **Single player** by default; the **shooter keeps the dice** after a seven-out | — |
| Multiplayer | Pass-and-play (MVP); dice pass to the left after a seven-out (A2.7) | — |
| Dice | Secure RNG. Dice set and throw meter are practice only and don't change results (S5.1) | — |
| Skill simulation | Off (Premium, labeled simulation) | — |
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
| T-24 | Shooter skill (simulation) | Off, Influence *p*, SRR target | Off | Labeled "simulation"; changes outcomes; excluded from Fair Dice stats (S5.1) |
| T-25 | Seven-out dice behavior | Keep (single player), Pass (multiplayer) | Keep | Locked by mode, shown read-only |
| T-26 | Multiplayer betting timer | Off, 30 s per player (online later: 10–45 s window) | Off (pass-and-play) | A2.7 |
| T-27 | Fire Bet pay table | **Standard 24/249/999 to 1**, Long Six 10/200/2,000, Fire 3 (6/29/149/299 from 3 points), Generous 29/299/999 | Standard | 20.76% / 24.86% / 20.73% / 8.16% (A2.2a) |
| T-28 | Fire Bet limits | Min $1–$5, max $5–$25 | $1 / $10 | Small units only |
| T-29 | Hop pays (the 17 non-Horn hops) | **15 / 30 to 1**, 16 / 31, 16 / 33 | 15 / 30 | Same edges as B-29. The Horn singles follow T-15 |

**Premium features (not rules):** Fair Dice CSV export, saved presets and skill simulation.

## A2.4 Strategy library: App 2 (Regular, 10 strategies, T1–T10)

#### T1. Pass Line + Max Odds
- **How to play:** Pass on the come-out, then 3-4-5x odds.
- **House edge:** 1.41% flat (0.42% per roll), **0.37%** with Standard odds.
- **Risk:** Low to Medium.
- **Bankroll:** 30 units flat, 60 to 90 with odds. Stop-loss: 50%.

#### T2. Don't Pass + Lay Odds
- **How to play:** Don't Pass, then lay up to **6x the flat bet** once a point is set (for example $10 flat lays $60, which wins $30 on 4/10, $40 on 5/9, $50 on 6/8).
- **House edge:** 1.36% per bet made, 1.40% per bet resolved, **0.27%** with max lay.
- **Risk:** Low.
- **Bankroll:** 60 to 80 units. Stop-loss: 50%.

#### T3. Come / Don't Come with Odds
- **How to play:** Same as the line bets, made after a point is on. **Come odds are OFF on the come-out by default.**
- **House edge:** 0.37% (Come + odds), 0.27% (Don't Come + lay).
- **Risk:** Medium.
- **Bankroll:** 60 to 100 units. Stop-loss: 50%.

#### T4. 3-Point Molly
- **How to play:** Pass + 2 Come bets, all with max odds.
- **House edge:** 0.37% each.
- **Risk:** Medium.
- **Bankroll:** 100+ units. Stop-loss: 40 to 50%.

#### T5. Place 6 and 8
- **How to play:** $6 units after the point.
- **House edge:** 1.52% (0.46% per roll).
- **Risk:** Low to Medium.
- **Bankroll:** 25 to 30 pairs. Stop-loss: 50%.

#### T6. Inside Numbers ($22 Inside)
- **How to play:** 5, 6, 8, 9 with $5 on 5/9 and $6 on 6/8. **Standard tip:** Buy 5/9 instead of placing them (commission on win only).
- **House edge:** Classic all-Place: about 2.6% per bet, 0.76% per roll. **Buy 5/9 + Place 6/8 (Standard): about 1.7% per bet, 0.51% per roll.**
- **Risk:** Medium.
- **Bankroll:** 20 to 25 spreads ($22 each). Stop-loss: 50%.

#### T7. Iron Cross
- **How to play:** Field + 5, 6, 8 ($5 Field, $5 on 5, $6 on 6 and 8 = $22). Every total except 7 wins something. A 7 loses all four.
- **House edge:** The Standard Field (2:1 / 2:1) is 5.56% on every roll. Blended, Iron Cross costs about **1.8% per roll** with Place 5, or about 1.6% with Buy 5. That's worse than Place 6/8 alone (0.46% per roll).
- **Risk:** Medium.
- **Bankroll:** 20 spreads. Stop-loss: 40%.

#### T8. Hardways Hedge
- **How to play:** $1 on Hard 6 and Hard 8 alongside Place 6/8. Hard 6/8 pays 9 to 1, Hard 4/10 pays 7 to 1.
- **House edge:** Hard 6/8 9.09%, Hard 4/10 11.11% (both 2.78% per roll).
- **Risk:** High.
- **Bankroll:** Keep hardways under 10% of the total wager. Tutor calls this "a fun bet, not a hedge."

#### T9. Regression
- **How to play:** Open big, cut back after the first hit.
- **House edge:** The same as the underlying bets.
- **Risk:** Medium, then Low.
- **Bankroll:** 15 to 20x the opening spread.

#### T10. Press Progressions
- **How to play:** Half-press or full-press using winnings only. Cap at 2 presses per number, or 5x the opening bet.
- **House edge:** Unchanged ([Wizard on betting systems](https://wizardofodds.com/gambling/betting-systems/)).
- **Risk:** High.
- **Bankroll:** 30 units. Stop-loss: 50%. Once up 50%, set aside the original buy-in.

*(Billy's Way is **not** offered in Table Craps. It's a Bubble Craps preset only, per Bill's decision on Oct 10. Table Craps players build the same spread by hand: Buy 4/5/9/10 + Place 6/8 = T6 Inside plus 4/10.)*

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
| **High-edge bet** | "Long shot." | "Hard 8: 9.09%. Not a hedge, it adds cost." |
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
| **Skill simulation on** | "Practice simulation is on. These rolls are not random and don't count in Fair Dice." | "Simulated influence p = X. Real-world evidence for dice control is lacking (A2.5)." |

## A2.7 Multiplayer (App 2)

> Play money only. Every player has a separate practice bankroll. No transfers, wagers between players, prizes or withdrawals of any kind.

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
- **Chips are colored by player** on the felt. Long-press a spot to see "Ana $10 · Ben $5".
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

Online always uses play money. No real-money, prize or withdrawal wording.

# END MATTER

## Mockup review and rule conflicts
Reviewed `/workspace/bb-mockups/app1-bubble` (screens 01–11) and `/workspace/bb-mockups/app2-table` (screens 01–08), plus `README.md`, `DESIGN-SYSTEM.md`, `MOTION-SOUND-SPEC.md` (M20–M22), `CRAPS-LINGO.md`, `QA-CHECKLIST.md` and the `src/` screen sources. Section names and tabs in this spec now match: Play · Fair Dice · Learn · Premium · Settings; App 1 Learn tabs All / Regular / Crapless / Lessons; App 2 tabs All / Baseline / Don't / Shooter; App 2 keys Bets · Strategies · Tutor · Stats; "Billy Tips".

| # | Mockup | Conflict | Recommendation |
|---|---|---|---|
| 1 | App 1 `10-premium-custom-rules` and `08-bet-panel` | The Custom Rules screen has a **"Lay commission"** row, but App 1 has **no lay bets on numbers** (the Bubble engine has only Don't Pass/Don't Come lay odds, `js/engine.js:31-55`). | Remove the Lay commission row from App 1. **Decided (Bill, Oct 10): the LAY tab stays, Regular only, hidden in Crapless**, and holds lay odds. |
| 2 | App 1 `11-premium-locked` | The upsell lists **"Shooter skill simulation"**, but App 1 has no shooter. | Remove it from App 1 and list Fair Dice CSV export + Repeater pay tables instead. |
| 3 | Both Custom Rules screens | Cards show the **old combined numbers** (#3 #1 #2 #20, #6 #7 #8, #19 #24, #12 #22 #23). | Use the B-xx / T-xx IDs (S3 map) or no numbers. |
| 4 | App 2 `05-strategy-picker` | Header reads **"LIVE TABLE · STRATEGIES"**. | "TABLE CRAPS · STRATEGIES". |
| 5 | Both `06-fair-dice` | **"Hot: 5 · Cold: 11"** labels invite the gambler's fallacy. | "Above expected / Below expected" (S5.2). |
| 6 | DESIGN-SYSTEM chips (line 58) and chip racks | Mockups use **$1/$5/$10/$25/$100/$500**. | **Decided: $1/$5/$25/$100/$500, no $10** (Bill, Oct 10). Remove the blue $10 chip from the racks and the design system. Keep $500 purple. |
| 7 | App 1 `09-strategy-picker` | Shows **Hard Way All Day** as a "side play" strategy card; it's a bet, not one of B1–B12. | Move it to the Lessons tab as "Side bets explained" (keep the 21.43% badge). |
| 8 | All screens | Repeaters and the Blazing meter are now drawn (rounds 6–7). The **left Side-bets screen with the 21-hop grid isn't** drawn yet. | Draw the left screen (Repeaters + Hops; + the Fire Bet tile in App 2) and the 3 dots. Remove any Repeater rack from the board/Bet Panel (S4.1). |
| 9 | App 2 `07-premium-custom-rules` | ATS is labeled **"Regular only"**, which is redundant (App 2 is Regular only). | Drop the label in App 2. |
| 10 | Both home screens (footer) | Footer reads "Education only. Play money only. No real gambling, deposits, payouts or prizes." It says the right thing. | Optional: shorten it to "18+ · Education only · Play money only · No real gambling." |
| 11 | MOTION-SOUND-SPEC M20 | Repeater payout plate reads **"REPEATER SIX · 90 TO 1"**. The real table is **90 FOR 1** (89 to 1). | Change the plate to "90 FOR 1" (or "+89 TO 1" as the profit). |
| 12 | MOTION-SOUND-SPEC M21–M22, CRAPS-LINGO §6, Design Desk G2 | Five levels with **"Heater"** and **"On Fire"** as tier names (labels, haptics, callouts like "He's on a heater!" and "On fire! Same bet?"). | **Decided (Bill, rev 7):** the **Blazing meter** has exactly **Cold · Warm · Hot · Blazing**. Use 4 segments, 4 haptic levels (Warm `tick`, Hot `press`, Blazing `success`) and 4 callouts: Warm "Dice are warming up." · Hot "Dice are hot! Same odds, just fun." · Blazing "Blazing hand!" · Cool-off "Cooled off." Flames are for Blazing only, and decoration only. M22 "Heater" dice heat folds into Hot; "On Fire" folds into Blazing. Keep it separate from the App 2 Fire Bet rail. |
| 13 | Design Desk G1 | Pays written **"40:1"** (to 1); edges computed on that basis. | Use "40 FOR 1" everywhere; edges in S1.7. |
| 14 | CRAPS-LINGO §6, `src/m2.html:15`, QA-CHECKLIST line 90, `src/story.html:53` | Blazing meter callouts **"Dice are hot, press it!"** / **"Dice are on fire! Press it!"** / "Shooter's hot, press it!" tie pressing to the Blazing meter. That breaks S6 caution 2, and with a real PRESS key it becomes a betting nudge. | Replace with neutral calls: Hot "Dice are hot! Same odds, just fun." · Blazing "Bubble's blazing!" / "Blazing hand!" No "press it" in any Blazing meter line. |
| 15 | App 1 win overlay `src/m4.html:36` (QA line 94) and App 2 Repeater screen `src/repeater.html:28` | **"Press It"** buttons on a bonus-bet win (Roll 'Em All) and on the Repeater screen. The PRESS key is Place/Buy only. The Repeater screen also has **"Off on come-out"**, which is now a Premium toggle (Standard works every roll). | Rename the overlay button **"Add a chip"** (adds one chip to the bet that just won; fine since lamps reset). On the Repeater screen, use "Add a chip" (tally 0 only) and drop "Off on come-out" unless Premium B-23/T-23 is on. |
| 16 | App 1 table screens 03/04 | Mockup round 7 puts **PRESS + POWER PRESS beside ROLL**; spec rev 6–7 had them in the machine-key row. | **Decided (rev 8): the mockup is right.** They go in the dock beside ROLL, reachable on all three screens. Labels "PRESS 8 +$6 → $12", "POWER PRESS 8 +$6 · $1 to chips". |
| 17 | App 2 `10-fire-bet-points-lit` | The Fire Bet panel reads **"Paytable pending (Bones)"**. | Use the Standard **24 / 249 / 999 to 1** (20.76%, A2.2a). Put the Fire Bet tile on the left screen; the Fire rail stays on the shooter screen. |
| 18 | Both apps, all Play screens | Mockups show a **2-pane** Felt / Dome (App 1) or a single shooter screen with sheets (App 2), not **3 screens with 3 dots**. App 1 `02` dome and `03/04` felt are separate panes today. | Re-flow to Side bets · Board · Dice with 3 dots above the dock; land on Board; keep the HUD and dock on every screen (S4.1). |

No conflicts found with the **locked felt layout**: both felts keep Horn 2x2 left, Big Red above Hard Way All Day, Hard Ways 2x2 right, Pass / Odds / Don't Pass / Lay Odds bottom, Buy above / Place below.

## Decisions
- **Field** 2:1 on 2 and 12 (Standard). 3:1 is Premium.
- **Odds** 3-4-5x. Crapless takes 3x on 2/3/11/12.
- **Commission:** on wins only (Standard). "Always" is Premium.
- **Buy on Bubble:** yes, on all numbers in both apps.
- **Seven-out:** single player keeps the dice. Rotation only in multiplayer.
- **Hard Way All Day:** defined (S1.5). It **stays up after a win**: the payout is credited, the stake stays, the lamps reset (Bill, Oct 10). **Needs a code change**; the code takes it down today.
- **Hard Way All Day Premium payouts:** 150 / **165 (Standard)** / 175 / 200 for 1 = 28.57% / 21.43% / 16.67% / 4.76% (Bill, Oct 10). Shown in Custom Rules B-19 / T-19 and the Edge Preview. **Needs a code change** (the pay is hard-coded at 165).
- **Billy's Way 5/9:** **Buy**, not place. Regular = Buy 4/5/9/10 + Place 6/8 ($6 units), Crapless + Buy 2/3/11/12. Matches the current code (Bill, Oct 10).
- **Billy's Way in Table Craps:** **No.** Bubble only (Bill, Oct 10).
- **ATS hidden in Crapless:** confirmed (Bill, Oct 10). Regular only.
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
- **POWER PRESS (Bill, Oct 10):** puts the net win back on the number, rounded down to a correct-pay unit ($6 on 6/8, $5 on 4/5/9/10, $2 on Crapless Place 2/12, $4 on Crapless Place 3/11, $5 on every Buy). The remainder and any over-max overflow stay in the bankroll. Greyed out if the rounded amount is $0.
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

## Open questions for Bill
1. **Wide-landscape layout:** the spec shows Board + Dice side by side, with Side bets as a slide-over (and all 3 columns at ≥ 1,400 px). OK, or should wide screens keep the plain 3-page swipe?
2. **"Show the dice on each roll"** (B-30): the default is **Off** (you stay on the board and get a mini toast). Bubble Craps' fun is the dome, so should it default **On**?
3. **Hop limits:** $1–$100 per hop (Standard). OK?

## Code changes implied by this spec (for later; none made)
- **Split into two apps** sharing packages (S7): one rules core (merge `js/engine.js` + `js/table-engine.js` profiles), one settings store with B-xx / T-xx lists, and a migration from `craps-practice-v5` (`js/ui.js:8`) and `billy-bubs-table` (`js/table-app.js:11`).
- Hard Way All Day: stay up after a win and reset the lamps (`js/engine.js:795-797`, test `tests/table-engine.test.js:492-495`, help text and README).
- Hard Way All Day pay as a Premium setting (`js/engine.js:23`, `js/table-engine.js:606-623`).
- Hide ATS in Crapless (Bubble UI `index.html:114, 128, 138`; validation `js/engine.js:506-516`).
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
  - Tag skill-sim rolls (`js/table-engine.js:1173-1220`).
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
- **Premium entitlements:** one per app (bundle later).
- **App 1 Bet Panel:** LAY tab (lay odds) in Regular only; hide it in Crapless along with the Don't spots.

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
