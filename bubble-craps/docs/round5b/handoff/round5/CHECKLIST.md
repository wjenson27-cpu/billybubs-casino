# Round 5: CHECKLIST (defect style), reconciled to rev 16
Delta re-verified Tue Oct 13 2026, ~1:15 PM PT, on the /tmp/r5site copy.
- **Re-shot (delta only):** all 9 screens, because rev 16 changed every one. That is 99 runs per app at the 7 phone and 4 iPad sizes (shots/verify-{bc,tc}-delta.json).
- **Not re-shot (unchanged):** the iPad layouts (shots/verify-{bc,tc}-ipad.json, ipad/).

## Rev 16 conformance
- [x] S8 / §20: the session chart (SH-05), the all-time chart (SH-06), "Highest / Lowest session" (SH-07), the footer, "Show as table", and color + dash (SH-11) are all in place. Nets use neutral styling. The Free / Premium split follows SH-12.
- [x] S9 / §21:
  - It's "Your Dice". No "manual" string remains.
  - The banner and the YOURS tag are in place (YD-04).
  - Entry uses the pair pad and the die pad, Settle and Undo last roll (YD-05), plus Paste (YD-13).
  - The onboarding exclusion copy is used (YD-14).
- [x] S10 / §22:
  - **Free:** tier (RS-06, values approved/locked rev 16; no PROPOSED tag) and bankroll presets (RS-05, Reset only).
  - **Premium:** Field 12 (RS-02) and odds (RS-03).
  - The odds-exempt note (RS-04) and the 6/8 caps (RS-07) are shown.
- [x] S11 / §23: Normal is the default (FR-01). The S11 timing table, tap to skip (FR-04), reduce motion wins (FR-08) and the shooter-practice Fast cap (FR-09) are all shown.
- [x] S12 / §24:
  - TC has 3 keys; BC has INSIDE · OUTSIDE plus BILLY'S WAY (QB-01).
  - Lower-edge Buy / Place (QB-03), the point skip (QB-07) and the preview (QB-12) are shown.
  - Amounts with the 6 skipped: TC $52 / $32 / $40; BC $16 / $20. Without a point they are $64 / $44 / $40 (QB-04) and $22 / $20.
- [x] S13 / §25: the Dealer-level keypad (PD-06), 10/20/30 scoring with no streak (PD-07), the Why? box (PD-08), the footer and Billy only (PD-11).

## Visual checks (198 delta runs)
- [x] Taps ≥ 44px: 0 failures.
- [x] Contrast ≥ 4.5:1: the minimum is 5.95.
- [x] Truncation: 0.
- [x] Mascots: never more than 1. Billy appears only in the drills.
- [x] Amounts are visible on every quick-bet key and in every preview spot.
- [x] The Your Dice panel never covers ROLL/SHOOT (now SETTLE), and SETTLE stays live and on the current page.
  - **Fixed in this pass:** the panel overlapped SETTLE at BC 320/360 and TC 320. Short phones now drop the recent strip and fall back from the pair grid to the die pad.
- [x] Rotate card shows at 844×390 on the 8 sheet screens.

## Defects / open
- [ ] **D1 (pre-existing):** BC chrome and board taps are under 44px on phones and iPad. Unchanged; see OPEN-QUESTIONS.
- [ ] **D2:** the iPad layouts are a composition of separate app instances; the state is not shared.
- [ ] **D3:** the TC portrait iPad shooter pane is tight.
- [ ] **D4 (spec vs code):** S11 lists the BC Normal tumble as 1.4 s, but `css/dice-cube.css` animates for 1,100 / 1,180 ms (with a 1.6 s fallback in `ui.mjs`).

## On-table throw (TC, NEW; see MOTION-GESTURE "On-table dice throw")
- [ ] Top faces = the engine result for every roll, all doubles included. The final transform is exactly `VIEW·cssMatrix(result, front)`, and there is no CSS transition on `.c` during the throw.
- [ ] After settle, no bet chip or $ amount sits under a die or its shadow. The dice then tuck to the readout; nothing stays on the felt.
- [ ] The dice never cross SHOOT, the rail, the dock or the HUD on any frame. The throw stays on the current page only (Side bets = no throw).
- [ ] Normal 1.4 s full throw · Fast 0.5 s from the rebound · Instant 150 ms fade · reduced motion = fade only. Shooter practice caps at Fast; a tap skips.
- [ ] Wall tick (`dice_wall` + light haptic) fires exactly once per die pair, at wall contact; none on Instant, reduced motion or no-roll.
- [ ] Soft toss: stops short of the wall, shows the "NO ROLL · PRACTICE" plate, nothing settles, and a fresh roll is drawn.
- [ ] `onSettle` starts the settle + celebration/PSO immediately, with tiers unchanged (S4.3/S4.4).
- [ ] Die size 26–44 px (7% of the felt). There is no camera move.
