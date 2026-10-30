/**
 * 33 practice badges. Reads a settled roll and never changes odds,
 * payouts, the timer, or the dice. Storage lives in the leaderboard
 * store under `badges` and `progress` (key bb-bubble-badges-v1).
 */

export const BADGES = [
  { id: "hand_10_rolls", n: 1, name: "Ten-Roll Ride", desc: "A hand that went 10 rolls.", tier: "bronze", hidden: false, mode: "both", section: "Hands", rule: "The hand reaches 10 rolls with a bet working on that roll.", odds: "About 1 in 3 hands." },
  { id: "hand_20_rolls", n: 2, name: "Twenty and Still Rolling", desc: "A hand that went 20 rolls.", tier: "silver", hidden: false, mode: "both", section: "Hands", rule: "The hand reaches 20 rolls with a bet working on that roll.", odds: "About 1 in 14 hands." },
  { id: "hand_40_rolls", n: 3, name: "Forty-Roll Marathon", desc: "A 40-roll hand. Rare, random, fun to watch.", tier: "legendary", hidden: false, mode: "both", section: "Hands", rule: "The hand reaches 40 rolls with a bet working on that roll.", odds: "About 1 in 265 hands." },
  { id: "blazing_reached", n: 4, name: "Blazing!", desc: "The Blazing meter hit its top tier.", tier: "silver", hidden: false, mode: "both", section: "Hands", rule: "The meter reaches Blazing with a bet working on that roll.", odds: "About 1 in 12 hands. The meter is only for show." },
  { id: "points_all_six_lifetime", n: 5, name: "Point Collector", desc: "Make every Regular point: 4, 5, 6, 8, 9, 10.", tier: "silver", hidden: false, mode: "regular", section: "Points", rule: "Pass is paid on each Regular point, across any number of hands.", odds: "" },
  { id: "points_six_one_hand", n: 6, name: "Six for Six", desc: "All six points in a single hand.", tier: "legendary", hidden: false, mode: "regular", section: "Points", rule: "In one Regular hand, Pass is paid on 4, 5, 6, 8, 9, and 10.", odds: "About 1 in 6,156 hands." },
  { id: "crapless_points_all_ten_lifetime", n: 7, name: "All Ten, No Craps", desc: "Make all ten Crapless points, 2 through 12.", tier: "gold", hidden: false, mode: "crapless", section: "Points", rule: "Pass is paid on every Crapless point at least once.", odds: "" },
  { id: "crapless_six_points_one_hand", n: 8, name: "Crapless Six-Pack", desc: "Six different Crapless points in one hand.", tier: "legendary", hidden: false, mode: "crapless", section: "Points", rule: "In one Crapless hand, Pass is paid on 6 different points.", odds: "About 1 in 3,295 hands." },
  { id: "crapless_corner_point", n: 9, name: "No Craps Here", desc: "Make a 2, 3, 11, or 12 as your point.", tier: "silver", hidden: true, mode: "crapless", section: "Points", rule: "In Crapless, Pass is paid on 2, 3, 11, or 12.", odds: "About 1 in 16 hands." },
  { id: "ats_low_rolls", n: 10, name: "Low Rolls Lit", desc: "Low Rolls paid: 2, 3, 4, 5, 6 before a 7.", tier: "gold", hidden: false, mode: "both", section: "ATS", marquee: true, rule: "Any paid Low Rolls win, in either mode. A re-arm counts. Any 7 loses it, including a Crapless come-out 7.", odds: "About 1 try in 38. Per hand about 1 in 27 Regular, 1 in 29 Crapless", pay: "31 for 1", edge: "18.30%" },
  { id: "ats_high_rolls", n: 11, name: "High Rolls Lit", desc: "High Rolls paid: 8, 9, 10, 11, 12 before a 7.", tier: "gold", hidden: false, mode: "both", section: "ATS", marquee: true, rule: "Any paid High Rolls win, in either mode. A re-arm counts. Any 7 loses it.", odds: "About 1 try in 38. Per hand about 1 in 27 Regular, 1 in 29 Crapless", pay: "31 for 1", edge: "18.30%" },
  { id: "ats_roll_em_all", n: 12, name: "Roll 'Em All", desc: "Every number 2 to 12 (no 7) before a 7.", tier: "gold", hidden: false, mode: "both", section: "ATS", marquee: true, rule: "Any paid Roll 'Em All win, in either mode.", odds: "About 1 try in 190. Per hand about 1 in 134 Regular, 1 in 145 Crapless", pay: "156 for 1", edge: "17.98%" },
  { id: "ats_sweep_one_hand", n: 13, name: "The ATS Sweep", desc: "Low Rolls, High Rolls, and Roll 'Em All, all paid in one hand.", tier: "legendary", hidden: false, mode: "both", section: "ATS", marquee: true, rule: "In one hand, each of the three ATS bets is paid at least once. Either mode.", odds: "About 1 in 134 hands Regular, 1 in 145 Crapless, with all three up.", pay: "31 / 31 / 156 for 1", edge: "about 18%" },
  { id: "spin_the_block", n: 14, name: "Spin the Block", desc: "Low Rolls or High Rolls paid twice in a row on the same bet.", tier: "legendary", hidden: false, mode: "both", section: "ATS", marquee: true, rule: "The same ATS bet, Low or High, is paid twice with no 7 between. Either mode. About 1 in 565 hands in Crapless, with both bets up.", odds: "About 1 in 523 hands Regular, 1 in 565 Crapless", pay: "31 for 1", edge: "18.30%" },
  { id: "hwad_win", n: 15, name: "Hard Way All Day", desc: "Hard 4, 6, 8, and 10 all before a 7. 165 for 1.", tier: "gold", hidden: false, mode: "both", section: "Hardways", marquee: true, rule: "Any paid Hard Way All Day win. A re-arm counts.", odds: "About 1 try in 210.", pay: "165 for 1", edge: "21.43%" },
  { id: "hard_hat_trick", n: 16, name: "Hard Hat Trick", desc: "Three hardway wins in a row, no hardway loss between.", tier: "gold", hidden: false, mode: "both", section: "Hardways", rule: "Three of your hardway bets are paid in a row. A hardway loss resets the run.", odds: "About 1 in 40 hands with all four up." },
  { id: "repeaters_all_ten", n: 17, name: "Full Repeater Rail", desc: "Every Repeater paid at least once: 2 through 12.", tier: "gold", hidden: false, mode: "both", section: "Repeaters", rule: "Each Repeater number, 2 through 12, is paid at least once.", odds: "A long-shot collection. House edge about 18% to 22%." },
  { id: "billys_way_first_hit", n: 18, name: "Billy's Way", desc: "Set up Billy's Way and get paid.", tier: "bronze", hidden: false, mode: "both", section: "Press", rule: "A Billy's Way spot is paid before the next seven-out.", odds: "" },
  { id: "billys_way_full_circle", n: 19, name: "Full Circle", desc: "Every Billy's Way number paid in one hand.", tier: "silver", hidden: false, mode: "regular", section: "Press", rule: "In one Regular hand, Buy 4, 5, 9, 10 and Place 6, 8 are each paid.", odds: "About 1 in 16 hands." },
  { id: "press_undo", n: 20, name: "Second Thoughts", desc: "Pressed, then changed your mind. That's control.", tier: "bronze", hidden: true, mode: "both", section: "Press", rule: "Tap PRESS or POWER PRESS, then UNDO or CLEAR before the next roll.", odds: "" },
  { id: "press_then_collect", n: 21, name: "Press Once, Then Collect", desc: "Press a winner once, then take the next win as chips.", tier: "silver", hidden: false, mode: "both", section: "Press", rule: "After a manual press, the next win on that number is collected, not pressed.", odds: "" },
  { id: "low_edge_three_hands", n: 22, name: "Under 2% Club", desc: "Three hands in a row on bets with a house edge of 2% or less.", tier: "silver", hidden: false, mode: "both", section: "Skill", rule: "Three finished hands in a row where every working bet is 2% or less, with a bet working on each seven-out.", odds: "" },
  { id: "steady_up_1000", n: 23, name: "Slow Double", desc: "Up $1,000, or double the run's start, whichever is larger. 10% or less in action every roll.", tier: "gold", hidden: false, mode: "both", section: "Skill", rule: "One steady run gains $1,000 or 100% of the run's start, whichever is larger. A roll with more than 10% of the stack in action breaks it.", odds: "" },
  { id: "tutor_tour_complete", n: 24, name: "Dealer Billy's Tour", desc: "Finished the Billy Tips tour.", tier: "bronze", hidden: false, mode: "both", section: "Practice", rule: "Finish the last step of the guided tour.", odds: "" },
  { id: "fair_dice_explorer", n: 25, name: "Fair Dice Detective", desc: "Checked the dice three ways.", tier: "bronze", hidden: false, mode: "both", section: "Practice", rule: "Open This session, Last 100, and All time, and reach the fairness card.", odds: "" },
  { id: "daily_practice_3", n: 26, name: "Three-Day Practice", desc: "Practiced three days running.", tier: "bronze", hidden: false, mode: "both", section: "Practice", rule: "Three local days in a row with a finished hand or a finished lesson.", odds: "" },
  { id: "limits_set_session", n: 27, name: "Set Your Limits", desc: "Played a session with a loss limit set before the first roll.", tier: "bronze", hidden: false, mode: "both", section: "Limits", rule: "A qualifying session ends with a loss limit that was set before the first roll.", odds: "" },
  { id: "win_goal_banked", n: 28, name: "Banked the Goal", desc: "Hit your win goal and ended the session there.", tier: "silver", hidden: false, mode: "both", section: "Limits", rule: "A win goal is set before the first roll. The win-goal prompt fires after 20 bet-rolls, and the session ends there or before the next roll. A loss limit is not required. Keep playing past the goal does not count, even if you end later. If both limits were hit, Kept My Limit counts instead.", odds: "" },
  { id: "loss_limit_kept", n: 29, name: "Kept My Limit", desc: "Reached your loss limit and stopped, just like you planned.", tier: "silver", hidden: false, mode: "both", section: "Limits", rule: "The loss-limit prompt fires after 20 bet-rolls, and the session ends there, including End session before the next roll. If both limits were hit, this one counts.", odds: "" },
  { id: "five_sessions_within_limits", n: 30, name: "Five Within Limits", desc: "Five sessions that stayed inside your limits.", tier: "gold", hidden: false, mode: "both", section: "Limits", rule: "Five qualifying sessions with a loss limit and no roll after that limit.", odds: "" },
  { id: "table_manners", n: 31, name: "Table Manners", desc: "Read every Dealer Billy manners card.", tier: "bronze", hidden: false, mode: "both", section: "Practice", rule: "View every etiquette card and tap Got it on the last one. A bet never unlocks it.", odds: "" },
  { id: "talk_the_talk", n: 32, name: "Talk the Talk", desc: "Learned 25 craps terms from Dealer Billy.", tier: "silver", hidden: false, mode: "both", section: "Practice", rule: "Knowing the lingo makes a real table friendlier. It doesn't change the dice.", odds: "" },
  { id: "dealers_apprentice", n: 33, name: "Dealer's Apprentice", desc: "A perfect Pay the roll round at Dealer level.", tier: "silver", hidden: false, mode: "both", section: "Practice", rule: "10 of 10 on D7 Pay the roll, at Dealer or Boxman. A bet or a roll never unlocks it.", odds: "" },
];

const BY_ID = Object.create(null);
BADGES.forEach((b) => { BY_ID[b.id] = b; });

const REG_POINTS = [4, 5, 6, 8, 9, 10];
const CRAP_POINTS = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
const REPEATER_NUMS = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
const BILLY_NUMS = [4, 5, 6, 8, 9, 10];
const TIER_RANK = { bronze: 0, silver: 1, gold: 2, legendary: 3 };

export function badgeById(id) {
  return BY_ID[id] || null;
}

export function emptyProgress() {
  return {
    points6: [],
    points10: [],
    handPoints: [],
    crapHandPoints: [],
    repeaters: [],
    fairScopes: [],
    hardStreak: 0,
    lowEdgeHands: 0,
    steady: { start: 0, broken: false, gain: 0 },
    sweep: { small: false, tall: false, all: false },
    spin: { small: 0, tall: 0 },
    bestHand: 0,
    billyPaid: [],
    armedCollect: {},
    pressedSinceRoll: false,
    collectPending: 0,
    handDirty: false,
  };
}

function prog(store) {
  const p = Object.assign(emptyProgress(), store.progress || {});
  p.steady = Object.assign({ start: 0, broken: false, gain: 0 }, (store.progress && store.progress.steady) || {});
  p.sweep = Object.assign({ small: false, tall: false, all: false }, (store.progress && store.progress.sweep) || {});
  p.spin = Object.assign({ small: 0, tall: 0 }, (store.progress && store.progress.spin) || {});
  p.armedCollect = Object.assign({}, (store.progress && store.progress.armedCollect) || {});
  return p;
}

function unlock(store, p, id, ctx) {
  const def = BY_ID[id];
  if (!def) return;
  if (def.mode === "regular" && ctx.mode === "crapless") return;
  if (def.mode === "crapless" && ctx.mode !== "crapless") return;
  const prev = store.badges[id];
  store.badges[id] = {
    at: prev ? prev.at : (ctx.now || 0),
    mode: prev ? prev.mode : (ctx.mode || "regular"),
    count: (prev ? prev.count : 0) + 1,
    handId: ctx.handId || (prev && prev.handId) || 0,
  };
  if (!prev) ctx._fresh.push(id);
}

function paid(decisions, name) {
  return (decisions || []).some((d) => d && d.result === "win" && d.bet === name && (d.profit || 0) > 0);
}

/** Point badges count only a Pass Line win that paid on that point. */
export function paidPassPoint(decisions, point) {
  if (!point) return 0;
  return paid(decisions, "Pass Line") ? point : 0;
}

function addSet(list, value) {
  const next = (list || []).slice();
  if (next.indexOf(value) < 0) next.push(value);
  return next;
}

export function evaluateRoll(store, ctx) {
  const base = store || { badges: {}, progress: {} };
  const next = {
    badges: Object.assign({}, base.badges),
    progress: prog(base),
  };
  const p = next.progress;
  const c = Object.assign({ decisions: [], mode: "regular", _fresh: [] }, ctx || {});
  const decisions = c.decisions || [];
  const fresh = c._fresh;

  if (c.total === 7) {
    p.spin.small = 0;
    p.spin.tall = 0;
  }

  if (c.hadBet && c.handRolls >= 1) {
    if (c.handRolls > (p.bestHand || 0)) p.bestHand = c.handRolls;
    if (c.handRolls >= 10) unlock(next, p, "hand_10_rolls", c);
    if (c.handRolls >= 20) unlock(next, p, "hand_20_rolls", c);
    if (c.handRolls >= 40) unlock(next, p, "hand_40_rolls", c);
  }
  if (c.hadBet && c.tier === "blazing") unlock(next, p, "blazing_reached", c);

  if (c.passPoint && c.mode !== "crapless") {
    p.points6 = addSet(p.points6, c.passPoint);
    p.handPoints = addSet(p.handPoints, c.passPoint);
    if (p.points6.length >= 6) unlock(next, p, "points_all_six_lifetime", c);
    if (REG_POINTS.every((n) => p.handPoints.indexOf(n) >= 0)) unlock(next, p, "points_six_one_hand", c);
  }
  if (c.passPoint && c.mode === "crapless") {
    p.points10 = addSet(p.points10, c.passPoint);
    p.crapHandPoints = addSet(p.crapHandPoints, c.passPoint);
    if (p.points10.length >= 10) unlock(next, p, "crapless_points_all_ten_lifetime", c);
    if (p.crapHandPoints.length >= 6) unlock(next, p, "crapless_six_points_one_hand", c);
    if ([2, 3, 11, 12].indexOf(c.passPoint) >= 0) unlock(next, p, "crapless_corner_point", c);
  }

  if (paid(decisions, "Low Rolls")) {
    p.sweep.small = true;
    p.spin.small += 1;
    unlock(next, p, "ats_low_rolls", c);
    if (p.spin.small >= 2) unlock(next, p, "spin_the_block", c);
  }
  if (paid(decisions, "High Rolls")) {
    p.sweep.tall = true;
    p.spin.tall += 1;
    unlock(next, p, "ats_high_rolls", c);
    if (p.spin.tall >= 2) unlock(next, p, "spin_the_block", c);
  }
  if (paid(decisions, "Roll 'Em All")) {
    p.sweep.all = true;
    unlock(next, p, "ats_roll_em_all", c);
  }
  if (p.sweep.small && p.sweep.tall && p.sweep.all) unlock(next, p, "ats_sweep_one_hand", c);

  if (paid(decisions, "Hard Way All Day")) unlock(next, p, "hwad_win", c);

  let hardWin = false;
  let hardLoss = false;
  decisions.forEach((d) => {
    if (!d || !/^Hard \d+$/.test(d.bet || "")) return;
    if (d.result === "win") hardWin = true;
    if (d.result === "lose") hardLoss = true;
  });
  if (hardLoss) p.hardStreak = 0;
  else if (hardWin) {
    p.hardStreak += 1;
    if (p.hardStreak >= 3) unlock(next, p, "hard_hat_trick", c);
  }

  decisions.forEach((d) => {
    const m = d && d.result === "win" && /^Repeater (\d+)$/.exec(d.bet || "");
    if (!m) return;
    const n = Number(m[1]);
    if (REPEATER_NUMS.indexOf(n) >= 0) p.repeaters = addSet(p.repeaters, n);
  });
  if (p.repeaters.length >= 10) unlock(next, p, "repeaters_all_ten", c);

  if (c.billyHit) unlock(next, p, "billys_way_first_hit", c);
  (c.billyNumbers || []).forEach((n) => { p.billyPaid = addSet(p.billyPaid, n); });
  if (c.mode !== "crapless" && BILLY_NUMS.every((n) => p.billyPaid.indexOf(n) >= 0)) {
    unlock(next, p, "billys_way_full_circle", c);
  }

  if (c.collectNumber && p.armedCollect[c.collectNumber] && !c.autoPressed) {
    p.collectPending = c.collectNumber;
    delete p.armedCollect[c.collectNumber];
  }

  if (!c.sevenOut && c.edgeBroken) p.handDirty = true;

  if (c.sevenOut) {
    const dirty = !!p.handDirty || !!c.edgeBroken || (c.maxEdge != null && c.maxEdge > 2);
    if (c.hadBet && c.maxEdge != null && !dirty) p.lowEdgeHands += 1;
    else if (dirty) p.lowEdgeHands = 0;
    if (p.lowEdgeHands >= 3) unlock(next, p, "low_edge_three_hands", c);
    p.handDirty = false;
    p.handPoints = [];
    p.crapHandPoints = [];
    p.sweep = { small: false, tall: false, all: false };
    p.spin = { small: 0, tall: 0 };
    p.hardStreak = 0;
    p.billyPaid = [];
    p.armedCollect = {};
    p.collectPending = 0;
  }

  if (c.totalBefore > 0) {
    if (!p.steady.start || p.steady.broken) {
      p.steady = { start: c.totalBefore, broken: false, gain: 0 };
    }
    if (c.inAction > c.totalBefore * 0.1) {
      p.steady = { start: c.totalAfter || c.totalBefore, broken: false, gain: 0 };
    } else {
      const gain = (c.totalAfter || c.totalBefore) - p.steady.start;
      p.steady.gain = gain;
      p.steady.broken = false;
      const need = Math.max(100000, p.steady.start || 0);
      if (gain >= need) unlock(next, p, "steady_up_1000", c);
    }
  }

  fresh.sort((a, b) => {
    const da = BY_ID[a];
    const db = BY_ID[b];
    const tr = TIER_RANK[db.tier] - TIER_RANK[da.tier];
    return tr || da.n - db.n;
  });
  return { store: { badges: next.badges, progress: p }, unlocked: fresh.slice() };
}

export function noteAction(store, action) {
  const base = store || { badges: {}, progress: {} };
  const next = { badges: Object.assign({}, base.badges), progress: prog(base) };
  const p = next.progress;
  const c = { mode: action.mode || "regular", now: action.now || 0, handId: action.handId || 0, _fresh: [] };
  const type = action.type;
  if (type === "press") {
    p.pressedSinceRoll = true;
    if (action.number) {
      p.armedCollect[action.number] = true;
      if (p.collectPending === action.number) p.collectPending = 0;
    }
  } else if (type === "undo" && p.pressedSinceRoll) {
    unlock(next, p, "press_undo", c);
    p.pressedSinceRoll = false;
  } else if (type === "roll-started") {
    if (p.collectPending && !p.pressedSinceRoll) unlock(next, p, "press_then_collect", c);
    p.collectPending = 0;
    p.pressedSinceRoll = false;
  } else if (type === "tour") {
    unlock(next, p, "tutor_tour_complete", c);
  } else if (type === "etiquette") {
    p.etiquetteSeen = addSet(p.etiquetteSeen, action.id);
    const need = action.total || 15;
    if (action.complete && (p.etiquetteSeen || []).length >= need) unlock(next, p, "table_manners", c);
  } else if (type === "fair-scope") {
    p.fairScopes = addSet(p.fairScopes, action.scope);
    if (["session", "last", "all"].every((s) => p.fairScopes.indexOf(s) >= 0) && action.sawTest) {
      unlock(next, p, "fair_dice_explorer", c);
    }
  } else if (type === "practice-day") {
    const day = action.day || "";
    const daily = Object.assign({ lastDay: "", streak: 0, best: 0 }, base.daily);
    if (day && day !== daily.lastDay) {
      const prev = daily.lastDay ? new Date(daily.lastDay + "T12:00:00") : null;
      const cur = new Date(day + "T12:00:00");
      const gap = prev ? Math.round((cur - prev) / 86400000) : 0;
      daily.streak = gap === 1 ? (daily.streak || 0) + 1 : 1;
      daily.lastDay = day;
      daily.best = Math.max(daily.best || 0, daily.streak);
      if (daily.streak >= 3) unlock(next, p, "daily_practice_3", c);
    }
    return { store: { badges: next.badges, progress: p, daily }, unlocked: c._fresh.slice() };
  } else if (type === "lingo") {
    if (action.id) p.lingoSeen = addSet(p.lingoSeen, action.id);
    if ((p.lingoSeen || []).length >= 25) unlock(next, p, "talk_the_talk", c);
  } else if (type === "drill") {
    const level = action.level;
    const dealerPlus = level === "dealer" || level === "boxman";
    if (dealerPlus && action.perfect && action.drill === "D7" && action.correct === 10) {
      unlock(next, p, "dealers_apprentice", c);
    }
  } else if (type === "reset-bankroll") {
    p.steady = { start: action.total || 0, broken: false, gain: 0 };
    p.lowEdgeHands = 0;
  }
  return { store: { badges: next.badges, progress: p }, unlocked: c._fresh.slice() };
}

/**
 * Discipline badges. `report` is the finished session plus the
 * anti-farm flags. Each session awards at most one of 28/29 and
 * at most +1 toward 30.
 */
export function evaluateSession(store, report) {
  const base = store || { badges: {}, progress: {}, sessions: { withinLimits: 0, awarded: [] } };
  const sessions = {
    withinLimits: (base.sessions && base.sessions.withinLimits) || 0,
    awarded: ((base.sessions && base.sessions.awarded) || []).slice(),
  };
  const next = { badges: Object.assign({}, base.badges), progress: prog(base), sessions };
  const c = { mode: report.mode || "regular", now: report.now || 0, _fresh: [] };
  const id = report.sessionId;
  if (id != null && sessions.awarded.indexOf(id) >= 0) {
    return { store: next, unlocked: [] };
  }
  const baseGate = report.betRolls >= 20 && !report.loosened && report.endReason !== "reset";
  const lossQualified = report.qualifies === true || (baseGate && report.lossCents > 0);
  const stoppedAtWin = !report.rollAfterWin && (report.endedAtWin || (report.endedBeforeNextRoll && report.winHit));
  const winQualified = baseGate && report.endReason !== "idle" && report.winCents > 0
    && report.winPromptAfter20 && stoppedAtWin;
  if (!lossQualified && !winQualified) return { store: next, unlocked: [] };
  if (lossQualified) unlock(next, next.progress, "limits_set_session", c);
  let awardedOne = false;
  const kept = lossQualified && report.lossPromptAfter20
    && (report.endedAtLoss || (report.endedBeforeNextRoll && report.lossHit));
  if (kept) {
    unlock(next, next.progress, "loss_limit_kept", c);
    awardedOne = true;
  } else if (winQualified) {
    unlock(next, next.progress, "win_goal_banked", c);
    awardedOne = true;
  }
  if (lossQualified && !report.rollAfterLoss) {
    sessions.withinLimits += 1;
    if (sessions.withinLimits >= 5) unlock(next, next.progress, "five_sessions_within_limits", c);
  }
  if (id != null) sessions.awarded.push(id);
  void awardedOne;
  return { store: { badges: next.badges, progress: next.progress, sessions }, unlocked: c._fresh.slice() };
}

export function artFile(id, state) {
  if (state === "hidden") return "assets/badges/" + id + "-hidden.svg";
  if (state === "locked") return "assets/badges/" + id + "-locked.svg";
  return "assets/badges/" + id + ".svg";
}

export function progressOf(progress, id) {
  const p = progress || {};
  if (id === "hand_10_rolls") return { have: Math.min(10, p.bestHand || 0), need: 10, text: "Best: " + (p.bestHand || 0) + " / 10" };
  if (id === "hand_20_rolls") return { have: Math.min(20, p.bestHand || 0), need: 20, text: "Best: " + (p.bestHand || 0) + " / 20" };
  if (id === "hand_40_rolls") return { have: Math.min(40, p.bestHand || 0), need: 40, text: "Best: " + (p.bestHand || 0) + " / 40" };
  if (id === "points_all_six_lifetime") return { have: (p.points6 || []).length, need: 6, text: (p.points6 || []).length + " / 6" };
  if (id === "crapless_points_all_ten_lifetime") return { have: (p.points10 || []).length, need: 10, text: (p.points10 || []).length + " / 10" };
  if (id === "repeaters_all_ten") return { have: (p.repeaters || []).length, need: 10, text: (p.repeaters || []).length + " / 10" };
  if (id === "low_edge_three_hands") return { have: p.lowEdgeHands || 0, need: 3, text: (p.lowEdgeHands || 0) + " / 3" };
  if (id === "steady_up_1000") {
    const gain = Math.max(0, (p.steady && p.steady.gain) || 0);
    const start = (p.steady && p.steady.start) || 0;
    const need = Math.max(100000, start);
    return { have: Math.min(need, gain), need, text: "$" + Math.floor(gain / 100) + " / $" + Math.floor(need / 100).toLocaleString("en-US") };
  }
  if (id === "fair_dice_explorer") return { have: (p.fairScopes || []).length, need: 3, text: (p.fairScopes || []).length + " / 3" };
  if (id === "five_sessions_within_limits") return { have: 0, need: 5, text: "" };
  if (id === "talk_the_talk") {
    const have = (p.lingoSeen || []).length;
    return { have: Math.min(25, have), need: 25, text: have + " / 25" };
  }
  return null;
}
