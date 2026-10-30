# Billy Bubs · Bubble Craps

Unlisted test build. Practice chips only. No real money. 18+.

Bubble Craps is `index.html`. Table Craps is `table/index.html` (same site, at `/table/`). Rules live in `docs/two-games-spec.md`. Brand files are in `assets/`. `reference/billy-bubs-practice/` is reference only and is not the app.

GitHub Pages: https://wjenson27-cpu.github.io/bb-bc-yrkv/

`robots.txt` disallows the whole site. Every HTML page sends `noindex, nofollow`.

## Run

ES modules need a static server.

```bash
python3 -m http.server 8765
```

Open http://127.0.0.1:8765/

## Test

```bash
npm test
```

That runs `node --test tests/*.test.mjs`. The suite covers Bubble Craps, Table Craps, the chip rail, the 31 badges, and the rejection-sampled RNG. `npm run build` writes a production bundle with the test hook removed. The swipe test drives system Chrome through Playwright when both are installed; otherwise that one case skips.

## Spec coverage

### Implemented

- Regular and Crapless bubble craps, one bankroll, practice chips labeled on every balance.
- Chips $1, $5, $25, $100, $500. Table $5–$1,000. Starting bankroll $1,000. No negative bankroll. No $10 chip. No Fire Bet.
- Field: 2 and 12 pay 2:1; 3, 4, 9, 10, 11 pay 1:1.
- Pass odds 3-4-5x in Regular. Crapless odds 3x on 2/3/4/10/11/12, 4x on 5/9, 5x on 6/8. True odds 6:1, 3:1, 2:1, 3:2, 6:5.
- Lay odds on Don't Pass and Don't Come, Regular only, up to 6x, paid at 3x/4x/5x. No number lays.
- Buy on every point number, 5% commission on wins only, floored to the cent.
- Hard Way All Day 165 for 1, stays up, lamps reset on a hit, only a 7 loses it. Easy ways do not count. Once any lamp is lit the stake is locked. Any takedown clears the lamps.
- ATS Low / High / Roll 'Em All at 31 / 31 / 156 for 1, Regular only, hidden in Crapless, stay up and re-arm. Any 7 loses. Same lamp lock and takedown rule as Hard Way All Day.
- Repeaters on all ten numbers, both modes, the spec FOR-1 table, $1–$25, any 7 loses, stay up and re-arm. A takedown clears the tally.
- 21 hops: 6 hard at 30 to 1, 15 easy at 15 to 1. Horn singles are the same bets as the board. Horn 4-way is separate, in $4 units.
- Any 7 at 4 to 1, Any Craps at 7 to 1. C&E is a split bet: 3 to 1 on 2, 3, or 12 and 7 to 1 on 11, on the whole stake, posted in $2 units. One-roll bets stay up on a win.
- Place and Buy off on the come-out unless the setting is on. Hardways work on the come-out (that switch is in the locked Premium list). Come odds are off on the come-out. The flat Come still works. Bets Off parks Place and Buy only.
- Pass cannot be taken down after a point. Come-point flats cannot be taken down. Don't Pass and Don't Come can, with a Tutor warning. Regular and Crapless can switch only before a hand's first roll. Reset bankroll is the way out of a hand in progress, and that hand is not posted.
- PRESS adds one original-bet unit. POWER PRESS follows Bill's ladder (6/8, 4/10, 5/9, and Crapless Buy 2/12 and 3/11), with an off-ladder jump and a round-down fallback. Undo restores the amount and the bet type. Both keys show their grey-out reason and stay off while the dice are tumbling. "Capped at $1,000" only appears when the bet actually lands on the table max.
- Auto-press (B-28) is a free Settings control: Off, PRESS, or POWER PRESS, max 1–5 per number. It presses the Billy's Way spot that won and does not change that bet's original amount. Off still lets the B5 coach press up to 3 times.
- Billy's Way: Regular Buy 4/5/9/10 and Place 6/8; Crapless also buys 2/3/11/12. A $5 chip is $32 Regular and $52 Crapless. Take down Billy's Way clears those spots.
- Strategies B1–B14 with All / Regular / Crapless / Lessons. B9 is a lesson. Auto-bet maintains the set. B5 reopens after a seven-out and pauses after three lost opening spreads. B5 presses add to the bet. B8 can post a new outside set after it takes the first one down. B11 rolls 100 times, then pauses. B13 Continuous Come is uncapped by default, with an optional cap of 1–5 and odds of max, 2x, 1x, or flat. B14 Hit and Split starts Place 6 or 8 at $12, spends the win on the next step, and suspends auto-press. Its crapless extension is off by default.
- Tutor: Dealer Billy, beginner and experienced tracks, seven-step tour, edge colors, Bubbles Billie on big wins and seven-out. Mute this tip mutes that tip only.
- Fair Dice: totals versus expected, chi-square in plain words, per-die chi-square, hard 4/6/8/10 against 1/36, streaks, the most repeated number in a hand, last 20, above and below expected. Secure RNG with rejection sampling. If the secure generator is missing, the roll is refused.
- Blazing meter is cosmetic and can be turned off in Settings. The HUD reads the hand length. The first time Warm, Hot, or Blazing appears, Dealer Billy says the dice have no memory. A seven-out from a longer hand says the hand cooled off.
- Auto-roll is optional and off by default. Intervals are 10, 15, 20, or 30 seconds, 15 the first time it is turned on. ROLL always works. It pauses when the felt is empty for three rolls, the next re-bet cannot be covered, a session limit is reached, the app is backgrounded, or the mode or bankroll is reset. It waits while a sheet or the initials card is open.
- Session loss limit and win goal, both off by default. A reached limit pauses ROLL after the result is on screen. End session or Keep playing. Raising a loss limit, or changing the win goal, voids that session for the discipline badges.
- Longest-roll board, on this device, separate from the bankroll. A hand posts only when a bet was working on the seven-out. Initials are 1–3 letters A–Z, or a blank "—". The prompt is offered once, sits between the HUD and the dock, and does not cover ROLL. "New record!" is only for rank 1 this week or all time. Later hands use the saved initials. Bubble copy does not say "shooter".
- 30 badges, with the handoff art, a gallery on the Rolls screen, a detail sheet, and an unlock toast above the dock. Storage key `bb-bubble-badges-v1`. Reset badges and records is the only wipe. Reset bankroll keeps the boards and badges.
- Three-screen swipe, including a sideways drag that starts on a bet button. The dots follow the page. Pinned HUD and dock. Mini roll toast off the dice screen.
- WebAudio after a gesture, haptics where the device allows, reduced motion. Cinzel, Cinzel Decorative, Archivo, Fredoka, Orbitron, and VT323 are self-hosted.
- Premium is a locked preview: Regular and Crapless, presets (Standard, Strip Classic, Strip Deluxe, Custom, Downtown 10x), B-1 through B-30, and an Edge Preview. Nothing on that screen changes the live table. No payments.

### Simplified

- Wide screens (900px and up) center the phone column. They do not switch to a side-by-side board and dice, or a three-column layout.
- The roll log keeps 8,000 compact records, not 100,000. A larger log would blow `localStorage`.
- Fair Dice CSV is locked, as specified. There is no feedback form for a very rare chi-square.
- Premium shows every B-setting, the presets, and an Edge Preview, and all of them stay locked. It does not edit live payouts.
- Phones in landscape (500px tall or less) keep Chips and On table in the top bar, keep the legal line fully visible, and put the dock in a right column.
- A $500 chip on Place 6 or 8 posts $600. A second $500 chip that would pass $1,000 is skipped.
- The dome dice are CSS cubes (tumble, then settle on the rolled faces). They are drawn outside the sliding pager so the 3D is not flattened. Home and the HUD still use the small die art.
- The full A1.8 tutor state table is not wired. The tour, come-out and point tips, press and power tips, a first hop, Place 2/3/11/12, the first swipe to side bets, the Blazing lesson, and the first time auto-press is turned on are.
- Horn is $4 units. C&E is $2 units. A $5 chip posts $4 of either and leaves $1 in practice chips. A $25 Horn posts $24. $100 and $500 divide evenly.
- Any Craps, C&E, and Horn 4-way sit on the felt next to the Horn box. The left screen is Repeaters and hops.
- Felt cells are shorter than 44px so the Pass Line fits on a 390×844 screen. Dock, chips, tabs, and bet-panel steppers are at least 44px, and those steppers cover the same bets.

### Not in this build

- Real-money payments, accounts, analytics, and external fonts or CDNs. Table Craps Premium is a local test flag, not a store purchase.
- Shooter-skill simulation.

## Known bugs

- The felt is dense. Pass Line is the last row. Number faces are about 30px on a 390-wide phone. Bets Off, Billy's Way, and Reset stay in the dock. The bet sheet opens above the dock.
- A small win is a roll toast. A seven-out is a toast with Dealer Billy ("Seven out.") and never says +$0. A big win uses Bubbles Billie only. The initials card waits until that toast has finished.
- A Place 6 or 8 tap posts the chip in $6 units ($5 becomes $6, $25 becomes $30, $100 becomes $120, $500 becomes $600).
- The layout matches the mockup structure, the mascots, and the brand colors. It is not a pixel-identical recreation of `docs/mockups/`. Wide screens stay one phone column.

## QA

`docs/qa/QA-REPORT.md` records the before/after pass. Screenshots are in `docs/qa/before/` and `docs/qa/after/`.
