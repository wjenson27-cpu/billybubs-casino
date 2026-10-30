import test from "node:test";
import assert from "node:assert/strict";
import * as B from "../js/badges.mjs";
import * as Sess from "../js/session.mjs";

function roll(store, extra) {
  return B.evaluateRoll(store, Object.assign({
    mode: "regular",
    hadBet: true,
    handRolls: 1,
    decisions: [],
    now: 1,
  }, extra));
}

test("the catalog is 33 badges with the marquee ids", () => {
  assert.equal(B.BADGES.length, 33);
  assert.equal(B.BADGES.filter((b) => b.tier === "bronze").length, 8);
  assert.equal(B.BADGES.filter((b) => b.tier === "silver").length, 11);
  assert.equal(B.badgeById("talk_the_talk").n, 32);
  assert.equal(B.badgeById("dealers_apprentice").n, 33);
  assert.equal(B.badgeById("dealers_apprentice").tier, "silver");
  assert.equal(B.badgeById("table_manners").n, 31);
  assert.equal(B.BADGES.filter((b) => b.tier === "gold").length, 9);
  assert.equal(B.BADGES.filter((b) => b.tier === "legendary").length, 5);
  assert.deepEqual(B.BADGES.filter((b) => b.hidden).map((b) => b.id), ["crapless_corner_point", "press_undo"]);
  assert.equal(B.badgeById("spin_the_block").tier, "legendary");
});

test("hand length badges need a working bet on the milestone roll", () => {
  let res = roll({ badges: {}, progress: {} }, { handRolls: 10, hadBet: false });
  assert.equal(res.unlocked.length, 0);
  res = roll(res.store, { handRolls: 10, hadBet: true });
  assert.ok(res.unlocked.includes("hand_10_rolls"));
  res = roll(res.store, { handRolls: 20, hadBet: true });
  assert.ok(res.unlocked.includes("hand_20_rolls"));
  res = roll(res.store, { handRolls: 40, hadBet: true, tier: "blazing" });
  assert.ok(res.unlocked.includes("hand_40_rolls"));
  assert.ok(res.unlocked.includes("blazing_reached"));
});

test("ATS singles, the sweep, and spin the block", () => {
  let store = { badges: {}, progress: {} };
  let res = roll(store, { decisions: [{ bet: "Low Rolls", result: "win", profit: 3000 }], total: 6 });
  assert.ok(res.unlocked.includes("ats_low_rolls"));
  assert.ok(!res.unlocked.includes("spin_the_block"));
  store = res.store;
  res = roll(store, { decisions: [{ bet: "High Rolls", result: "win", profit: 3000 }], total: 8 });
  assert.ok(res.unlocked.includes("ats_high_rolls"));
  assert.ok(!res.unlocked.includes("spin_the_block"));
  assert.ok(!res.unlocked.includes("ats_sweep_one_hand"));
  store = res.store;
  res = roll(store, { decisions: [{ bet: "Roll 'Em All", result: "win", profit: 15500 }], total: 10 });
  assert.ok(res.unlocked.includes("ats_roll_em_all"));
  assert.ok(res.unlocked.includes("ats_sweep_one_hand"));
  store = res.store;
  res = roll(store, { decisions: [{ bet: "Low Rolls", result: "win", profit: 3000 }], total: 4 });
  assert.ok(res.unlocked.includes("spin_the_block"));
  assert.equal(store.badges.ats_low_rolls.count, 1);
  assert.ok(res.store.badges.ats_low_rolls.count >= 2);
});

test("a 7 clears spin the block and a low plus a high is not a spin", () => {
  let res = roll({ badges: {}, progress: {} }, { decisions: [{ bet: "Low Rolls", result: "win", profit: 100 }], total: 5 });
  res = roll(res.store, { total: 7, decisions: [], sevenOut: true });
  res = roll(res.store, { decisions: [{ bet: "Low Rolls", result: "win", profit: 100 }], total: 4 });
  assert.ok(!res.unlocked.includes("spin_the_block"));
  res = roll({ badges: {}, progress: {} }, { decisions: [{ bet: "Low Rolls", result: "win", profit: 100 }], total: 4 });
  res = roll(res.store, { decisions: [{ bet: "High Rolls", result: "win", profit: 100 }], total: 9 });
  assert.ok(!res.unlocked.includes("spin_the_block"));
});

test("hard way all day and a hardway hat trick", () => {
  let res = roll({ badges: {}, progress: {} }, {
    decisions: [{ bet: "Hard Way All Day", result: "win", profit: 16400 }],
  });
  assert.ok(res.unlocked.includes("hwad_win"));
  res = roll({ badges: {}, progress: {} }, { decisions: [{ bet: "Hard 6", result: "win", profit: 900 }] });
  res = roll(res.store, { decisions: [{ bet: "Hard 8", result: "win", profit: 900 }] });
  assert.ok(!res.unlocked.includes("hard_hat_trick"));
  res = roll(res.store, { decisions: [{ bet: "Hard 4", result: "win", profit: 700 }] });
  assert.ok(res.unlocked.includes("hard_hat_trick"));
  res = roll({ badges: {}, progress: {} }, { decisions: [{ bet: "Hard 6", result: "win", profit: 1 }] });
  res = roll(res.store, { decisions: [{ bet: "Hard 8", result: "lose", profit: 0 }] });
  res = roll(res.store, { decisions: [{ bet: "Hard 4", result: "win", profit: 1 }] });
  res = roll(res.store, { decisions: [{ bet: "Hard 10", result: "win", profit: 1 }] });
  assert.ok(!res.unlocked.includes("hard_hat_trick"));
});

test("discipline badges refuse short, loosened, and reset sessions", () => {
  const base = { badges: {}, progress: {}, sessions: { withinLimits: 0, awarded: [] } };
  const good = {
    sessionId: 1,
    betRolls: 20,
    loosened: false,
    endReason: "loss",
    lossCents: 25000,
    winCents: 0,
    lossPromptAfter20: true,
    endedAtLoss: true,
    rollAfterLoss: false,
    now: 5,
  };
  let res = B.evaluateSession(base, Object.assign({}, good, { betRolls: 19 }));
  assert.equal(res.unlocked.length, 0);
  res = B.evaluateSession(base, Object.assign({}, good, { loosened: true }));
  assert.equal(res.unlocked.length, 0);
  res = B.evaluateSession(base, Object.assign({}, good, { endReason: "reset", endedAtLoss: false }));
  assert.equal(res.unlocked.length, 0);
  res = B.evaluateSession(base, Object.assign({}, good, { lossPromptAfter20: false, betRolls: 10 }));
  assert.equal(res.unlocked.length, 0);
  res = B.evaluateSession(base, good);
  assert.ok(res.unlocked.includes("limits_set_session"));
  assert.ok(res.unlocked.includes("loss_limit_kept"));
  assert.equal(res.store.sessions.withinLimits, 1);
  res = B.evaluateSession(res.store, Object.assign({}, good, { sessionId: 1 }));
  assert.equal(res.unlocked.length, 0);
});

test("ATS badges count in Crapless", () => {
  const res = roll({ badges: {}, progress: {} }, {
    mode: "crapless",
    decisions: [{ bet: "Low Rolls", result: "win", profit: 3000 }],
    total: 6,
  });
  assert.ok(res.unlocked.includes("ats_low_rolls"));
  assert.equal(B.BADGES.filter((b) => b.section === "ATS" && b.mode === "both").length, 5);
});

test("ending before the next roll banks the goal or keeps the limit, and idle does not", () => {
  const base = { badges: {}, progress: {}, sessions: { withinLimits: 0, awarded: [] } };
  const banked = B.evaluateSession(base, {
    sessionId: 2,
    betRolls: 22,
    lossCents: 25000,
    winCents: 30000,
    endReason: "end",
    winPromptAfter20: true,
    winHit: true,
    endedBeforeNextRoll: true,
    rollAfterLoss: false,
    now: 2,
  });
  assert.ok(banked.unlocked.includes("win_goal_banked"));
  assert.ok(!banked.unlocked.includes("loss_limit_kept"));

  const both = B.evaluateSession(base, {
    sessionId: 3,
    betRolls: 22,
    lossCents: 25000,
    winCents: 30000,
    endReason: "end",
    winPromptAfter20: true,
    lossPromptAfter20: true,
    winHit: true,
    lossHit: true,
    endedBeforeNextRoll: true,
    rollAfterLoss: false,
    now: 3,
  });
  assert.ok(both.unlocked.includes("loss_limit_kept"));
  assert.ok(!both.unlocked.includes("win_goal_banked"));

  const noLossLimit = B.evaluateSession(base, {
    sessionId: 4,
    betRolls: 22,
    lossCents: 0,
    winCents: 30000,
    endReason: "win",
    winPromptAfter20: true,
    endedAtWin: true,
    winHit: true,
    rollAfterWin: false,
    now: 4,
  });
  assert.ok(noLossLimit.unlocked.includes("win_goal_banked"));
  assert.ok(!noLossLimit.unlocked.includes("limits_set_session"));
  assert.equal(noLossLimit.store.sessions.withinLimits, 0);

  const keptPlaying = B.evaluateSession(base, {
    sessionId: 6,
    betRolls: 22,
    lossCents: 0,
    winCents: 30000,
    endReason: "end",
    winPromptAfter20: true,
    winHit: true,
    endedBeforeNextRoll: true,
    rollAfterWin: true,
    now: 6,
  });
  assert.ok(!keptPlaying.unlocked.includes("win_goal_banked"));
  assert.ok(!keptPlaying.unlocked.includes("limits_set_session"));

  const idle = B.evaluateSession(base, {
    sessionId: 5,
    betRolls: 22,
    lossCents: 25000,
    winCents: 30000,
    endReason: "idle",
    winPromptAfter20: true,
    lossPromptAfter20: true,
    winHit: true,
    lossHit: true,
    now: 5,
  });
  assert.ok(!idle.unlocked.includes("win_goal_banked"));
  assert.ok(!idle.unlocked.includes("loss_limit_kept"));
  assert.equal(idle.store.sessions.withinLimits, 1);
});

test("five within limits ignores a roll after the loss limit and allows play after a win goal", () => {
  let store = { badges: {}, progress: {}, sessions: { withinLimits: 0, awarded: [] } };
  for (let i = 1; i <= 5; i++) {
    const res = B.evaluateSession(store, {
      sessionId: i,
      betRolls: 22,
      lossCents: 25000,
      endReason: "end",
      rollAfterLoss: false,
      now: i,
    });
    store = res.store;
  }
  assert.ok(store.badges.five_sessions_within_limits);
  store = { badges: {}, progress: {}, sessions: { withinLimits: 4, awarded: [] } };
  const after = B.evaluateSession(store, {
    sessionId: 9,
    betRolls: 22,
    lossCents: 25000,
    endReason: "loss",
    lossPromptAfter20: true,
    endedAtLoss: true,
    rollAfterLoss: true,
    now: 9,
  });
  assert.equal(after.store.sessions.withinLimits, 4);
  assert.ok(!after.store.badges.five_sessions_within_limits);
});

test("session limits floor percents to $5 and treat a looser loss limit as void", () => {
  assert.equal(Sess.percentToCents(100000, 25), 25000);
  assert.equal(Sess.percentToCents(100050, 10), 10000);
  const session = Sess.startSession(null, 100000, {
    loss: { kind: "amount", amount: 25000 },
    win: { kind: "off" },
  }, 10);
  session.rolls = 1;
  assert.equal(Sess.limitsLoosened(null, { loss: { kind: "off" }, win: { kind: "off" } }, session), true);
  assert.equal(Sess.limitsLoosened(null, { loss: { kind: "amount", amount: 50000 }, win: { kind: "off" } }, session), true);
  assert.equal(Sess.limitsLoosened(null, { loss: { kind: "amount", amount: 5000 }, win: { kind: "off" } }, session), false);
  const hit = Sess.limitStatus(session, 70000);
  assert.equal(hit.loss, true);
  assert.equal(Sess.sessionQualifies(Object.assign({}, session, { ended: true, betRolls: 20, endReason: "loss" })), true);
  assert.equal(Sess.sessionQualifies(Object.assign({}, session, { ended: true, betRolls: 20, endReason: "reset" })), false);
  const live = Sess.applyLiveLimits(session, { loss: { kind: "amount", amount: 5000 }, win: { kind: "off" } });
  assert.equal(live.lossCents, 5000);
  assert.equal(live.badgeLossCents, 25000);
  assert.equal(Sess.limitStatus(live, 94000).loss, true);
});

test("point badges only count a paid Pass Line", () => {
  assert.equal(B.paidPassPoint([{ bet: "Pass Line", result: "win", profit: 500 }], 6), 6);
  assert.equal(B.paidPassPoint([{ bet: "Place 6", result: "win", profit: 700 }], 6), 0);
  assert.equal(B.paidPassPoint([], 6), 0);
});

test("press once then collect waits until the next roll", () => {
  let store = { badges: {}, progress: {} };
  store = B.noteAction(store, { type: "press", number: 8 }).store;
  let res = roll(store, {
    decisions: [{ bet: "Place 8", result: "win", profit: 700 }],
    collectNumber: 8,
  });
  assert.ok(!res.unlocked.includes("press_then_collect"));
  assert.equal(res.store.progress.collectPending, 8);
  res = B.noteAction(res.store, { type: "press", number: 8 });
  assert.equal(res.store.progress.collectPending, 0);
  res = B.noteAction(res.store, { type: "roll-started" });
  assert.ok(!res.unlocked.includes("press_then_collect"));

  store = B.noteAction({ badges: {}, progress: {} }, { type: "press", number: 6 }).store;
  store = B.noteAction(store, { type: "roll-started" }).store;
  res = roll(store, { collectNumber: 6, decisions: [{ bet: "Place 6", result: "win", profit: 700 }] });
  res = B.noteAction(res.store, { type: "roll-started" });
  assert.ok(res.unlocked.includes("press_then_collect"));
});

test("a Field bet keeps that hand out of the Under 2% Club", () => {
  let store = { badges: {}, progress: {} };
  store = roll(store, { edgeBroken: true, maxEdge: 5.56, hadBet: true }).store;
  let res = roll(store, { sevenOut: true, hadBet: true, maxEdge: 1.41, edgeBroken: false });
  assert.equal(res.store.progress.lowEdgeHands, 0);
  assert.ok(!res.unlocked.includes("low_edge_three_hands"));
  store = res.store;
  store = roll(store, { hadBet: true, maxEdge: 1.41 }).store;
  store = roll(store, { sevenOut: true, hadBet: true, maxEdge: 1.41 }).store;
  store = roll(store, { hadBet: true, maxEdge: 1.41 }).store;
  res = roll(store, { sevenOut: true, hadBet: true, maxEdge: 1.41 });
  assert.equal(res.store.progress.lowEdgeHands, 2);
  store = roll(res.store, { hadBet: true, maxEdge: 0.37 }).store;
  res = roll(store, { sevenOut: true, hadBet: true, maxEdge: 0.37 });
  assert.ok(res.unlocked.includes("low_edge_three_hands"));
});

test("Slow Double scales with the run's starting bankroll", () => {
  const small = roll({ badges: {}, progress: { steady: { start: 100000, broken: false, gain: 0 } } }, {
    totalBefore: 100000,
    totalAfter: 200000,
    inAction: 1000,
  });
  assert.ok(small.unlocked.includes("steady_up_1000"));
  const big = roll({ badges: {}, progress: { steady: { start: 2000000, broken: false, gain: 0 } } }, {
    totalBefore: 2000000,
    totalAfter: 2100000,
    inAction: 1000,
  });
  assert.ok(!big.unlocked.includes("steady_up_1000"));
  const doubled = roll(big.store, {
    totalBefore: 2100000,
    totalAfter: 4000000,
    inAction: 1000,
  });
  assert.ok(doubled.unlocked.includes("steady_up_1000"));
});

test("Dealer's Apprentice is a perfect D7 round, never a bet", () => {
  const missed = B.noteAction({ badges: {}, progress: {} }, { type: "drill", drill: "D7", level: "dealer", perfect: false, correct: 9 });
  assert.ok(!missed.unlocked.includes("dealers_apprentice"));
  const rolled = roll({ badges: {}, progress: {} }, { hadBet: true, handRolls: 10 });
  assert.ok(!rolled.unlocked.includes("dealers_apprentice"));
  const earned = B.noteAction({ badges: {}, progress: {} }, { type: "drill", drill: "D7", level: "dealer", perfect: true, correct: 10 });
  assert.ok(earned.unlocked.includes("dealers_apprentice"));
});
