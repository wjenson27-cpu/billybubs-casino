# Casino Trainer

This folder is the practice trainer inside BillyBubs Casino. The lobby is the parent `index.html`.

A private, practice-only trainer for five casino decisions. It is one page, `index.html`, with the stylesheet and scripts inline. Nothing on the page calls a server, loads a tracker, or moves real money. Practice chips are a score, not a balance anyone can cash.

Open `trainer/index.html` from the lobby, or serve the repo root:

```bash
python3 -m http.server 8731
```

Run the tests from the repo root (Node only, no packages):

```bash
node tests/trainer.test.js
```

The layout is built for a 390px-wide phone and still reads on a desktop window.

## Blackjack basic strategy

Rules the chart is built for:

- 6 decks
- Dealer stands on soft 17
- Double on any first two cards, double after split allowed
- No surrender
- Resplit up to four hands, except aces
- No drawing to, and no resplit of, aces
- Blackjack pays 3 to 2
- Dealer peeks. The chart is the decision when the dealer does not have blackjack

The drill deals one chart cell at a time, hard 5–20, soft ace-2 through ace-9, and pairs 2s through aces, against an upcard of 2 through ace. Each of the 340 cells is equally likely. Hit, Stand, Double, and Split are the buttons. On a hand of three or more cards, double is closed, so a chart cell of **Double (else Hit)** is played as Hit and **Double (else Stand)** is played as Stand. After each answer the page shows Correct or Wrong, the chart play, and a one-line reason. The session tracks score and streak. Missed cells can be replayed from Weak spots. The full chart is on the same tab.

`STRATEGY_6D_S17_DAS` in `index.html` is that chart. Columns are the dealer upcards `2 3 4 5 6 7 8 9 T A`. Codes are `H` hit, `S` stand, `Dh` double (else hit), `Ds` double (else stand), `P` split.

It is the total-dependent basic strategy taken from the two-card expected values in Wizard of Odds, Blackjack Appendix 9, for exactly these rules (6 decks, dealer stands on soft 17, resplit to four hands except aces, no drawing to split aces), using the double-after-split column for pairs. Where compositions inside one total disagree, the cell is the probability-weighted play. Two cells that published cards sometimes swap between S17 and H17, and that this table plays the S17 way:

- Hard 11 vs ace is Hit. Doubling is worse for every two-card 11 in that appendix.
- Soft 18 (ace,7) vs ace is Hit. Two-card ace-seven gains about half a percent by hitting. Soft 19 vs 6 is Stand. Both of those doubles belong to games where the dealer hits soft 17.

Wizard of Odds puts the house edge for this rule set, with double after split, at about 0.40%. The cheat sheet lists the commonly quoted **~0.5%**.

## Video poker

9/6 Jacks or Better. Returned coins per coin bet, with the five-coin royal:

| Hand | Per coin |
| --- | --- |
| Royal flush | 800 (4,000 coins on a 5-coin bet) |
| Straight flush | 50 |
| Four of a kind | 25 |
| Full house | 9 |
| Flush | 6 |
| Straight | 4 |
| Three of a kind | 3 |
| Two pair | 2 |
| Jacks or better | 1 |

Deal five cards, tap the holds, and score. The trainer enumerates all 32 hold masks. For each mask it totals the payoff of every draw from the other 47 cards. A precomputed ranking of all 2,598,960 five-card hands keeps a decision well under a second. The result is your hold's expected value, the best hold's expected value, and the EV lost.

A dealt royal, held in full, is exactly 800. Four to a royal in one suit, with a neutral offsuit discard (not a heart, a ten, or a card that pairs the royal), is exactly 872/47 = **18.5532** per coin: one royal (800), eight flushes (6), three broadway straights (4), and twelve jacks-or-better (1). Strategy sheets often round that draw to about 18.6, and some say 18.66. If the fifth card is the same suit, one flush out is gone and the hold is 866/47 = 18.4255, which is still the correct break of a made flush (the flush itself pays 6).

Optimal 9/6 Jacks or Better returns 99.54%, a 0.46% house edge, which is the figure on the cheat sheet.

## House edge sheet

Sortable published edges. Sources are the standard figures used by Wizard of Odds and the usual casino-math references: craps line, place, field, hardway, and one-roll bets; baccarat banker/player/tie with a 5% banker commission and an 8 to 1 tie; roulette 1/37, 2/38, and 3/38 on the five-number basket; 9/6 Jacks or Better; Pai Gow Poker at about 2.7% with a 5% commission. Tildes mark the approximate rows.

## Baccarat

Eight-deck punto banco. Tens and faces count 0, aces 1, everything else its number, and the total is the sum modulo 10.

- A natural 8 or 9 stops the hand. Neither side draws.
- Otherwise Player draws on 0–5 and stands on 6–7.
- If Player stands, Banker draws on 0–5 and stands on 6–7.
- If Player takes a third card, Banker draws by the standard table: 0–2 always, 3 unless the third card is 8, 4 on 2–7, 5 on 4–7, 6 on 6 or 7, 7 never.

The rules quiz asks both drawing questions, then shows the rule and the result. Quick play uses practice chips. Banker pays 0.95 to 1 (house edge 1.06%). Player pays 1 to 1 (1.24%) and pushes on a tie, as does Banker. Tie pays 8 to 1 (14.36%). A bead road records the session. Cards are dealt face down. Drag a corner to peel a card; Reveal all opens the hand. The result is fixed when the cards are dealt. Reduced motion uses a simple flip instead of the peel.

Side bets, settled with practice chips and enumerated exactly on an 8-deck shoe:

| Bet | Pays | Exact house edge |
| --- | --- | --- |
| Player Pair | 11 to 1 | 10.361% |
| Banker Pair | 11 to 1 | 10.361% |
| Dragon Bonus, Player | natural win 1 to 1, natural tie pushes, non-natural win by 9/8/7/6/5/4 pays 30/10/6/4/2/1 | 2.652% |
| Dragon Bonus, Banker | same table | 9.373% |
| EZ Banker | 1 to 1, three-card 7 win pushes, no commission | 1.018% |
| Dragon 7 | 40 to 1 | 7.611% |
| Panda 8 | 25 to 1 | 10.188% |
| Perfect Pair | 25 to 1 | 13.029% |
| Either Pair | 5 to 1 | 13.710% |

Perfect Pair pays once, at 25 to 1, if the Player's first two cards, the Banker's, or both, are the same rank and the same suit. Either Pair pays once, at 5 to 1, if either hand's first two cards share a rank of any suits. A pair on both hands does not pay twice. EZ Baccarat is a toggle: the main Banker bet drops the 5% commission and pushes when Banker wins with a three-card 7.

Exact enumeration of the 8-deck shoe (dealing order Player, Banker, Player, Banker, then third cards) gives Banker 45.8597%, Player 44.6247%, Tie 9.5156%, which round to the usual 45.86% / 44.62% / 9.52%. Those probabilities reproduce the three house edges above.

## Roulette

Switch between a single-zero wheel (37 pockets, house edge 2.70% on every standard bet) and a double-zero wheel (38 pockets, 5.26%). The five-number basket, 0, 00, 1, 2, and 3, exists only on the double-zero wheel, pays 6 to 1, and has a 7.89% edge.

The layout takes straights, splits, streets (including the zero trios), corners (including the European first four, 0-1-2-3, at 8 to 1), six lines, dozens, columns, and the even-money bets. Zero and double zero lose all of those outside bets. Stakes are practice chips. The spin is a rejection-sampled uniform index into the wheel, so every pocket has the same chance. The payout quiz asks what profit a winning bet pays. The stake is returned on top of that profit.

| Bet | Pays |
| --- | --- |
| Straight | 35 to 1 |
| Split | 17 to 1 |
| Street | 11 to 1 |
| Corner | 8 to 1 |
| Six line | 5 to 1 |
| Dozen or column | 2 to 1 |
| Red, black, odd, even, 1–18, 19–36 | 1 to 1 |
| 5-number basket | 6 to 1 |

## Look

The page is one file and stays offline. The header uses the Billy Bubs medallion. Card backs and chips are the v2 drawings. The tables sit on a downscaled felt tile inside a leather rail. Cinzel and Inter are embedded as Latin WOFF2, so the type does not depend on a network. The single-zero wheel is the v3 drawing: the rotor and the ball turn in opposite directions, and the ball drops onto the pocket that was drawn. The double-zero wheel uses the same motion with all 38 pockets.

## Tests

`tests/trainer.test.js` loads the engine out of `index.html` and checks:

- the strategy table is complete (hard 5–20, soft A2–A9, ten pair rows, ten upcards) and the S17 cells above
- video-poker payoffs, a dealt royal at 800, four to a royal at 872/47 (within 0.15 of 18.66), and a garbage hand
- the house-edge rows
- Banker and Player drawing rules for every total and every third-card value
- exact 8-deck Banker/Player/Tie probabilities
- every roulette payout, and that each wheel lists every pocket once and the index draw is uniform

## Privacy

Session score, weak spots, and practice-chip totals stay in `sessionStorage` for this tab. Clearing the site data, or the reset buttons, drops them. There is no account and no remote request.
