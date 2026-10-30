# Cloud agent build prompt — Billy Bubs · Bubble Craps (App 1), phone-first web test build

You are working ONLY in the repo `wjenson27-cpu/bb-bc-yrkv`. Do not read from, push to, open PRs on, or otherwise touch any other repository (in particular NOT `billy-bubs-practice`, the WU HQ repo, or the War Room repo). Everything you need is already copied into this repo.

## Goal
Build a playable, phone-first, static web app of **Billy Bubs · Bubble Craps** (App 1 only: the electronic bubble-dome craps machine) with **Regular** and **Crapless** modes. It is a private, unlisted test build served by GitHub Pages from `main` at the repo root (`https://wjenson27-cpu.github.io/bb-bc-yrkv/`). Practice chips only, no real money, 18+. Not a public launch.

## Inputs in this repo
- `docs/two-games-spec.md` (rev 8+, by Bones) — **source of truth** for rules, payouts, Standard defaults, strategies, Tutor, PRESS/POWER PRESS, Repeaters, Hops, Blazing meter, Fair Dice, and the three-screen layout (S4.1). Build **App 1 only**: read sections 0, S1–S7, and A1.1–A1.8. Ignore App 2 (A2.*) except where S-sections say "both apps".
- `docs/mockups/*.jpg` — iPhone mockups (01 home/onboarding … 16 swipe-right dome, plus `swipe-layout-overview.jpg`). Match them closely: colors, felt, gold rail, LED panel, dome, typography feel, dock, HUD.
- `docs/BRAND-GUIDE.md`, `docs/MASCOT-NOTES.md`, `docs/BILLIE-NOTES.md` — brand rules.
- `assets/logos/` (wordmarks, Bubble Craps sub-brand lockups, Bb marks), `assets/chips/` ($1/$5/$25/$100/$500 SVG + @64 PNG), `assets/icons/` (app icon), `assets/mascots/dealer-billy/` (Dealer Billy = **the Tutor**; poses hello/tip/winner/sevenout/live/portrait + `small/`), `assets/mascots/billie/` (Bubbles Billie option C = **the cheerleader**; cheer/winner/hello/tip/sevenout/table/portrait + `small/`), `assets/mascots/mascot-dome-scene.svg`.
- `reference/billy-bubs-practice/` — the old practice-table code. **Reference only.** Reuse its fair RNG (`crypto.getRandomValues` with rejection sampling, `js/dice.js`), dice rendering, and bet-engine logic (`js/engine.js`, `js/strategies.js`) where useful, but fix anything that conflicts with the spec (e.g. ATS must be hidden in Crapless; no $10 chip; no Fire Bet). Do not serve the reference app as the main app.

## Locked decisions (override anything else)
- Chips: **$1 / $5 / $25 / $100 / $500** only. **No $10 chip.**
- Field: 2 pays **2:1**, 12 pays **2:1**, 3/4/9/10/11 pay 1:1.
- Odds: **3-4-5x** (Regular). Crapless: 3x on 2/3/4/10/11/12, 4x on 5/9, 5x on 6/8. True-odds payouts (2/12 6:1, 3/11 3:1, 4/10 2:1, 5/9 3:2, 6/8 6:5).
- Lay odds on Don't Pass/Don't Come (Regular only): up to 6x flat (wins 3x/4x/5x). No lay bets on numbers.
- **Buy bets on all point numbers** (Regular 4–10; Crapless adds 2, 3, 11, 12). **5% commission on wins only.**
- **Hard Way All Day pays 165 FOR 1**, stays up after a win (see S1.5).
- ATS (Low/High/Roll 'Em All) 31/31/156 FOR 1, **Regular only**, stays up after a hit.
- Repeaters: both modes, pays per S1.7 (FOR 1), work every roll, any 7 loses, bet any time, $1 min / $25 max per number.
- **LAY tab in the Bet Panel: Regular only** (hidden in Crapless).
- Crapless: no Don't Pass/Don't Come/Lay/ATS; 2/3/11/12 become points; only come-out 7 wins.
- **No Fire Bet anywhere in this app.**
- Table min/max $5/$500; starting practice bankroll $1,000; 15 s bet timer then auto roll (with a toggle to turn auto-roll off — default ON per spec, but make sure manual ROLL always works).
- Place/Buy OFF on come-out (toggle "Working on come-out"); hardways working on come-out; Don't Pass bar 12.
- **Premium Custom Rules**: show as a locked/preview screen only (mockups 10/11). **No payments, no purchase flow.**
- Every bankroll label says "Practice chips". Footer on every screen: **"18+ · Practice only · No real money"**. Onboarding and first Tutor screen carry the education/play-money disclaimer from the top of the spec.

## What to build (static HTML/CSS/JS, no build step — or commit the built output to `main`)
1. **Mobile-first portrait** (design for ~390×844, safe-area insets, `viewport-fit=cover`, no horizontal page scroll, touch targets ≥ 44 px). Landscape/desktop should be usable (spec S4.1 orientation rules are nice-to-have; portrait is the priority).
2. **Home / onboarding** (mockup 01): Regular vs Crapless cards, "Play Regular · 15-second bet timer · auto roll", Tutor tour entry, "What's Billy's Way?".
3. **Three-screen swipe Play layout (S4.1)**: LEFT = Repeaters (all 10, lamps + progress counters like "6: ●●●○○○ 3/6", FOR-1 pay, edge badge, stake, add/take down) + all **21 hops** grid (6 hard 30:1, 15 easy 15:1 per S1.4a; the 4 Horn singles are mirrored with the board's Horn box — one stake shown in both places). MIDDLE (default landing) = locked felt board exactly per S4.1 (Horn 2x2 left; Big Red above Hard Way All Day middle; Hard Ways 2x2 right; Pass/Odds/Don't Pass/Lay Odds bottom row with Don't spots hidden in Crapless; Buy above and Place below each number; ATS lamp strip in Regular; Come/Don't Come; Field) + Bet Panel (LED point/last roll/balance; tabs Place · Buy · Lay [Regular only] · Odds) + machine keys **BETS OFF · BILLY'S WAY · RESET**. RIGHT = **dome/dice** screen with the dome roll animation (bubble dome, dice tumbling with air-pop feel, settle), result line ("5·3 · EASY EIGHT"), point puck, last-20-rolls strip, Blazing meter, bet timer ring, and the last Place/Buy win next to PRESS labels.
   - Snap swipe between screens (touch + mouse/keyboard), 3 tappable dot indicators above the dock.
   - **Pinned on all three screens**: top HUD (Practice chips bankroll, On table total, point puck, Billy Tips pill, FAIR shortcut) and bottom dock: **ROLL** (with timer ring), **PRESS**, **POWER PRESS**, chip rack ($1/$5/$25/$100/$500), bankroll bar.
   - Mini roll-result toast (2.5 s, dice faces, total, net) when not on the dice screen; tap → dice screen. Settings toggle "Show the dice on each roll" (default Off).
   - Reduced motion: cross-fade instead of slide; honor `prefers-reduced-motion`.
4. **Full Standard rules engine** for Regular and Crapless per A1.2/A1.3 and S1.*: Pass/Don't Pass, Come/Don't Come (with traveling come bets and odds), Odds/Lay Odds, Place, Buy (vig on win only), Field, Hardways, Horn singles, Any 7 (Big Red), Any Craps and any other S1.4 side bets the spec lists for App 1, Hard Way All Day, ATS (Regular only), Repeaters, all 21 Hops. Use exactly the payouts and table limits in the spec; where the spec says FOR vs TO, implement it correctly (S1.1).
   - Don't Pass/Don't Come takedown allowed once a point is on (Regular), with a Tutor warning.
   - Bets Off parks Place/Buy/etc. per the spec. RESET per spec.
5. **PRESS and POWER PRESS (A1.4a)**: implement exactly as specified — which bet they act on, "original bet" definition, PRESS adds the original bet per tap (taps stack), POWER PRESS lets the net win ride rounded down to a clean unit, UNDO / CLEAR before the next roll, greyed-out state with the reason shown, bankroll funds it, Buy vig on win only.
6. **Billy's Way preset (A1.4)**: Regular = Buy 4/5/9/10 + Place 6/8 ($6 units); Crapless adds Buy 2/3/11/12. Separate bets, each normal.
7. **Strategy picker (A1.7, mockup 09)** with Learn filters (All / Regular / Crapless / Lessons) and **auto-bet** for B1–B12 (including B5 regression & press, B10 come-bet ladder, B12 Billy's Way). B9 is a teaching card (no auto-bet needed beyond explanation). Auto-bet should place/maintain the strategy's bets each roll within the bankroll and be cancellable.
8. **Tutor (S2, A1.8, mockup 05)**: Dealer Billy is the Tutor (Billy Tips pill, overlay "step x of 7", beginner and experienced tracks, the A1.8 state table messages: good vs bad bets, house-edge badges, Buy vs Place advice, hard hop vs hardway, Don't takedown warning, PRESS/POWER PRESS explanations). **Bubbles Billie cheers on wins** (win celebration, mockup 07; small cut on minor wins, bigger pose on big wins; seven-out pose on seven-out).
9. **Fair Dice tab (S5, mockup 06)**: counts/frequency of totals and faces vs expected, chi-square style plain-words fairness readout, last N rolls, explanation of crypto RNG. CSV export is PREMIUM → show locked.
10. **Blazing meter (S6)**: exactly 4 tiers Cold · Warm · Hot · Blazing using the spec's score and thresholds. Cosmetic only (never changes odds); say so in the Tutor.
11. **Practice bankroll in localStorage** (persist bankroll, mode, settings, stats, active bets if practical); "Reset bankroll to $1,000" in settings; never allow negative bankroll; a bet that exceeds the bankroll is refused with a message.
12. **Settings**: sound on/off (WebAudio-synthesized SFX, no big audio files), haptics on/off (`navigator.vibrate` where supported), auto-roll timer on/off, working-on-come-out, show-dice-each-roll, Tutor track, reduced motion.
13. **Premium Custom Rules**: locked/preview screens per mockups 10/11 and A1.6. No payments.
14. **SEO/privacy**: keep `robots.txt` (`Disallow: /`), `.nojekyll`, and `<meta name="robots" content="noindex, nofollow">` in the `<head>` of **every** HTML page you create. No analytics, no external trackers, no external CDNs required at runtime (fonts may be system fonts or self-hosted). Do not add links to this site from anywhere.
15. Keep the repo lean (< ~25 MB total). Prefer SVG assets; don't add large binaries.

## Quality bar (Bill: PROFESSIONAL, POLISHED, App Store quality, clearly better than competitors)
- **Match the mockups pixel-close**: felt texture, gold rails, typography, chips, LED panel, dome, mascots, HUD, dock. Compare your screenshots side by side with `docs/mockups/*.jpg` at 390x844 and iterate until they match.
- **Smooth 60 fps animations** (transform/opacity only, `requestAnimationFrame`, no layout thrash): the dome bubble + dice tumble with a physics feel (air-pop, bounce, settle), chip placement (chip flies from rack to spot), win payouts sliding from the house to the bet and back to the bankroll, losing chips swept away, the Bubbles Billie cheer, swipe page transitions.
- **Crisp vector assets** from `assets/` (SVG). **No placeholders, no emoji, no lorem ipsum, no default browser-looking controls.**
- **Responsive safe areas**: `env(safe-area-inset-*)` for the iPhone notch/Dynamic Island and home bar; no content under the home indicator; works from 360 to 430 px wide.
- **Polished sound design** (WebAudio-synthesized or tiny compressed files: dome air pop, dice rattle, chip click, win chime, seven-out, press) with a **mute toggle**; **vibration haptics** where supported, with a toggle. Audio must start only after a user gesture.
- **Zero console errors or warnings** on load and during play.
- **Fast load**: initial transfer under ~2 MB; lazy-load secondary screens/assets (Tutor poses, strategy library, Fair Dice charts, premium screens).
- **Accessibility**: tap targets at least 44x44 px, readable contrast (WCAG AA for text), `aria-label`s on icon buttons, focus-visible styles, reduced-motion support.

## QA pass before you report (required)
After the build works, do a **separate critical design + rules review** (act as a demanding App Store design reviewer and a craps rules auditor):
1. Take Playwright screenshots at 390x844 of every screen (home, middle board Regular, middle board Crapless, left Repeaters/Hops, right dome mid-roll and settled, Bet Panel each tab, Tutor overlay, win celebration, strategy picker, Fair Dice, Settings, Premium locked) and save them as **before** shots in `docs/qa/before/`.
2. Compare each against the matching mockup and the spec; write `docs/qa/QA-REPORT.md` listing every defect (visual mismatch, jank, rule/payout error, missing feature, a11y, console error, load size) with severity.
3. Fix the defects, re-run all tests, re-take the same screenshots as **after** shots in `docs/qa/after/`, and update the report with what was fixed and what remains. Keep screenshots compressed (JPG/WebP, small) so the repo stays lean.
4. Do not call it done until it would pass a demanding design review.

## Tests (required)
- Put the rules engine in plain ES modules (or UMD) that run in Node without a browser.
- Write automated tests (Node's built-in `node:test`, no heavy deps; a `package.json` with `npm test` is fine) covering **every bet type** against the spec tables: line bets in Regular and Crapless (including Crapless points 2/3/11/12), come/don't come, odds and lay odds at max multiples for every point (Regular and Crapless), place and buy for every number (buy vig on wins only, rounding per spec), Field 2/12 at 2:1, hardways, horn singles, Any 7, Any Craps and other side bets, Hard Way All Day 165 for 1, ATS 31/31/156 for 1 (and hidden/rejected in Crapless), all 10 Repeater pays, all 21 hops, PRESS (stacking, undo/clear) and POWER PRESS (rounding), Billy's Way placement in both modes, table limits, chip set (no $10), Don't Pass bar-12, Blazing meter tier thresholds, and RNG distribution sanity (dice uniform, uses crypto.getRandomValues).
- Also add a quick headless smoke test if feasible (e.g. Playwright at 390×844: load, roll, place a bet, no console errors) — optional but appreciated.
- Run the tests, **fix every failure**, and make sure they all pass. Add a GitHub Actions workflow that runs `npm test` on push (optional).

## Delivery
- Commit to a branch, then merge to `main` (or open a PR and merge it yourself). GitHub Pages serves `main` at the repo root, so the app must be at `/index.html` (replace the placeholder). Relative asset paths only (site is under `/bb-bc-yrkv/`).
- Update `README.md` with: how to run locally, how to run tests, and a section "**Spec coverage**" listing what is implemented vs simplified vs missing relative to the spec, plus known bugs.
- Final message: summarize QA findings (before/after shot paths in docs/qa/),  implemented vs missing/simplified, test results (counts passed/failed), known bugs, and the commit SHA on main.
