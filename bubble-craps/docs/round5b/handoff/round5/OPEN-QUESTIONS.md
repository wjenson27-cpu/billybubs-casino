# Round 5: open questions for Bones (reconciled to rev 16, Tue Oct 13 2026, ~1:15 PM PT)

## Still open (rev 16 doesn't answer)
1. **iPad layouts.** Rev 16 has no iPad section. The mock uses 3 columns at ≥1,366 px (the spec's wide-landscape rule says ≥1,400), BC as 2 columns in portrait, and TC as Board over Shooter in portrait. OK? And should BC pages scale up (the board-fix k factor) so the board taps reach 44 px on iPad (CHECKLIST D1)?
2. **Rotate-to-portrait card.** Not in rev 16. ASSUMED: it covers modal sheets only (Sessions, Table rules, Roll speed, Bet sheets, Drills) under 400 px tall in landscape, and the Your Dice pad works in landscape. Should the play screens also force portrait under 400?
3. **Your Dice: where Settle lives.** S9 says "Then Settle" but not where. The mock turns the ROLL / SHOOT key into SETTLE (same thumb spot), and in Table Craps the pad sits on the shooter page. OK?
4. **Your Dice color token.** S9 asks for its own color, not the Blazing or Fire colors. The mock uses teal #6FE3D0 on #062320. OK?
5. **Bet-unit advisor** (market must-have 4). S12 and S13 D6 cover the legal steps for quick bets and drills, but there's no standalone advisor on manual bets. Is it a round-6 item?
6. **BC Normal tumble time.** S11 says 1.4 s, but the CSS animation is 1,100 / 1,180 ms. Which is the Normal baseline?

## Answered by rev 16 (removed from the list)
- Manual dice and stats → **S9** (Your Dice mode; exclusions X1–X8; Free; Table solo only for MVP; "manual" naming banned).
- Your Dice entry in Table Craps → **S9** (Play menu and Fair Dice tab; only between hands).
- Session definition, retention and the Free / Premium split → **S8** (A1.5b session; 200 full series; Free = chart + last 20 + totals).
- Table limits → **S10** (limit tiers B-32 / T-31; values **APPROVED** by Bill 10/13, incl. Salon; locked in rev 16).
- Field 12 3:1 free or Premium → **S10** (stays Premium).
- Fast roll options, default and cost → **S11** (Normal / Fast / Instant, default Normal, Free; the S11 timing table).
- Quick bets → **S12** (lower-edge Buy-or-Place; keep the player's bet type; point skipped by default; BC keeps BILLY'S WAY; the strip lives in the Bets sheet / Bet Panel).
- Payout drill scoring, levels and cost → **S13** (10/20/30 points; Rookie / Dealer / Boxman; Free except Boxman; badge PROPOSED, spec Open question 15).
