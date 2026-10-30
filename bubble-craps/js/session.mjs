/**
 * Session loss-limit and win-goal (spec A1.5b). Practice chips only.
 * A session starts on the first roll and ends on End session, Reset
 * bankroll, or 30 minutes with no roll and no bet change.
 */

export const IDLE_MS = 30 * 60 * 1000;
export const LIMIT_STEP = 2500;
export const LIMIT_MIN = 2500;
export const LIMIT_MAX = 500000;

export function clampAmount(cents) {
  const n = Math.round(Number(cents) / LIMIT_STEP) * LIMIT_STEP;
  return Math.min(LIMIT_MAX, Math.max(LIMIT_MIN, n || LIMIT_MIN));
}

/** A percent becomes practice chips at session start, floored to $5. */
export function percentToCents(startTotal, pct) {
  const raw = Math.floor((Number(startTotal) || 0) * (Number(pct) || 0) / 100);
  return Math.floor(raw / 500) * 500;
}

export function resolveLimit(spec, startTotal) {
  if (!spec || spec.kind === "off" || !spec.kind) return 0;
  if (spec.kind === "pct") return percentToCents(startTotal, spec.pct);
  return clampAmount(spec.amount);
}

export function startSession(prev, total, limits, now) {
  const id = ((prev && prev.id) || 0) + 1;
  const lossCents = resolveLimit(limits.loss, total);
  const winCents = resolveLimit(limits.win, total);
  return {
    id,
    startedAt: now,
    lastActivity: now,
    startChips: total,
    lossCents,
    winCents,
    badgeLossCents: lossCents,
    badgeWinCents: winCents,
    lossKind: limits.loss && limits.loss.kind || "off",
    winKind: limits.win && limits.win.kind || "off",
    lossPct: limits.loss && limits.loss.pct || 0,
    winPct: limits.win && limits.win.pct || 0,
    loosened: false,
    betRolls: 0,
    rolls: 0,
    hands: 0,
    ended: false,
    endReason: "",
    lossHit: false,
    winHit: false,
    rollAfterLoss: false,
    rollAfterWin: false,
    promptedLoss: false,
    promptedWin: false,
    endedAtLoss: false,
    endedAtWin: false,
    badges: [],
  };
}

export function closeIfIdle(session, now) {
  if (!session || session.ended) return session;
  if (now - (session.lastActivity || session.startedAt || now) < IDLE_MS) return session;
  return Object.assign({}, session, { ended: true, endReason: "idle", lastActivity: session.lastActivity });
}

export function noteActivity(session, now) {
  if (!session || session.ended) return session;
  return Object.assign({}, session, { lastActivity: now });
}

export function noteRoll(session, hadBet) {
  if (!session || session.ended) return session;
  const next = Object.assign({}, session, {
    rolls: (session.rolls || 0) + 1,
    betRolls: (session.betRolls || 0) + (hadBet ? 1 : 0),
  });
  if (session.lossHit) next.rollAfterLoss = true;
  if (session.winHit) next.rollAfterWin = true;
  return next;
}

export function noteHand(session) {
  if (!session || session.ended) return session;
  return Object.assign({}, session, { hands: (session.hands || 0) + 1 });
}

export function limitStatus(session, totalNow) {
  if (!session || session.ended) return { loss: false, win: false, net: 0 };
  const net = totalNow - session.startChips;
  return {
    net,
    loss: session.lossCents > 0 && net <= -session.lossCents,
    win: session.winCents > 0 && net >= session.winCents,
  };
}

/**
 * Raising or turning off the loss limit, or any win-goal change, voids
 * the session for discipline badges. Tightening the loss limit is fine.
 */
export function limitsLoosened(before, after, session) {
  if (!session || session.ended || session.rolls <= 0) return false;
  const lossBefore = session.lossCents || 0;
  const winBefore = session.winCents || 0;
  const lossAfter = resolveLimit(after.loss, session.startChips);
  const winAfter = resolveLimit(after.win, session.startChips);
  if (lossBefore > 0 && (lossAfter === 0 || lossAfter > lossBefore)) return true;
  if (winBefore !== winAfter) return true;
  return false;
}

export function markLoosened(session) {
  if (!session) return session;
  return Object.assign({}, session, { loosened: true });
}

/** Live limits follow Settings. Badge snapshots stay at the first roll. */
export function applyLiveLimits(session, limits) {
  if (!session || session.ended) return session;
  const lossCents = resolveLimit(limits.loss, session.startChips);
  const winCents = resolveLimit(limits.win, session.startChips);
  return Object.assign({}, session, {
    lossCents,
    winCents,
    lossKind: limits.loss && limits.loss.kind || "off",
    winKind: limits.win && limits.win.kind || "off",
    lossPct: limits.loss && limits.loss.pct || 0,
    winPct: limits.win && limits.win.pct || 0,
  });
}

export function endSession(session, reason, now) {
  if (!session) return null;
  return Object.assign({}, session, {
    ended: true,
    endReason: reason || "end",
    lastActivity: now || session.lastActivity,
    endedAtLoss: reason === "loss",
    endedAtWin: reason === "win",
  });
}

/** Anti-farm gate shared by badges 27–30. */
export function sessionQualifies(session) {
  if (!session || !session.ended) return false;
  if ((session.betRolls || 0) < 20) return false;
  if (session.loosened) return false;
  if (session.endReason === "reset") return false;
  if (!(session.lossCents > 0)) return false;
  return true;
}
