# BillyBubs Casino

Practice-only casino trainer. No cash, no accounts, no casino brands. The lobby is `index.html`. Each game is a static page with relative links, so the folder can be served as-is (GitHub Pages or any static host). Nothing here is deployed.

```bash
python3 -m http.server 8941
```

Open http://127.0.0.1:8941/

| Tile | Page |
| --- | --- |
| Bubble Craps | `bubble-craps/index.html` |
| Table Craps | `table-craps/index.html` |
| Blackjack, Baccarat, Roulette, Video Poker, Edges | `trainer/index.html` with a hash |

Every game has a Lobby link back to the root page.

## Tests

From the repo root:

```bash
node tests/trainer.test.js
cd bubble-craps && npm test
```

The trainer check is 17 cases and reads `trainer/index.html`. `npm test` is Bubble Craps' own suite, including Table Craps (the table lives in that import). It includes a 1,000,000-roll chi-square on dice totals. Browser cases inside that suite skip unless Playwright and Chrome are installed. They do not change the payouts.

## Layout

- `trainer/` is the five-game trainer (blackjack, 9/6 video poker, edges, baccarat, roulette). Its math notes are in `trainer/README.md`.
- `bubble-craps/` is [bb-bc-yrkv](https://github.com/wjenson27-cpu/bb-bc-yrkv) `main`, imported with history. Game logic, odds, and RNG are that import. The only local edits are a Lobby link on Bubble and on Table.
- `table-craps/index.html` is the Table Craps address. It loads the table from `bubble-craps/` so there is one copy of the engine. `bb-tc-369w` is gone; this import is the surviving Table Craps.

Dice use `crypto.getRandomValues` with rejection sampling. A dice set, grip, or throw does not change the roll. Idle dice art is not a face-up 7. Practice chips have no cash value.
