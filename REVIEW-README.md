# BillyBubs Casino — review bundle (round 2)

Practice-only site. No install step for the pages. Node 18+ runs the tests.

Serve from the repository root:

```bash
python3 -m http.server 8941
```

Open http://127.0.0.1:8941/

| What | Path |
| --- | --- |
| Lobby | `/` |
| Bubble Craps | `/bubble-craps/` |
| Table Craps | `/table-craps/` |
| Trainer (Blackjack, Video Poker, Edges, Baccarat, Roulette) | `/trainer/index.html` plus `#poker`, `#edges`, `#baccarat`, `#roulette` |

Each game has a Lobby link back to `/`.

## Tests

Trainer (17 checks, no packages):

```bash
node tests/trainer.test.js
```

Bubble Craps and Table Craps (one suite):

```bash
cd bubble-craps
node tests/run-suite.mjs
```

`npm test` in `bubble-craps` is the same command. It includes the 1,000,000-roll chi-square checks. Cases that drive a browser skip unless `playwright-core` is installed and Chrome is on the machine. Those skips do not change payouts or the dice tests.

`bubble-craps/dist` is not part of the repository. From `bubble-craps`, `npm run build` writes that folder, and `.gitignore` keeps it out of git. Edit styles in `bubble-craps/css/`.
