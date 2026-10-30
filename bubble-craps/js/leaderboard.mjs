/**
 * Longest-roll board for one device.
 *
 * A hand is every dice throw from the come-out through the seven-out.
 * A made point continues it. A 7 on the come-out does not end it.
 * Bubble has no shooter. A hand posts only when a bet was working
 * on the seven-out, and only with 1–3 letter initials (or a blank "—").
 *
 * Storage is a getItem/setItem pair. The key is separate from the
 * bankroll so Reset bankroll cannot wipe the boards.
 */

export const STORE_KEY = "bb-bubble-badges-v1";
export const TOP_N = 10;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Offensive 2–3 letter combos. Checked after uppercasing. */
export const INITIALS_BLOCKLIST = [
  "ASS", "AZZ", "FAG", "FGT", "FUK", "FUC", "FUQ", "FCK", "SEX", "XXX",
  "KKK", "NIG", "NGR", "KIL", "SUK", "TIT", "DIC", "DIK", "COK",
  "COC", "CUM", "JIZ", "CNT", "SHT", "ANL", "RPE", "WOP",
  "KYK", "NAZ", "FAP", "PIS", "SUX", "HOE", "SLT", "VAG", "WTF", "FML", "KYS",
];

export function browserStore() {
  const ls = typeof localStorage !== "undefined" ? localStorage : null;
  return {
    getItem(key) {
      try { return ls ? ls.getItem(key) : null; }
      catch { return null; }
    },
    setItem(key, value) {
      if (!ls) return;
      ls.setItem(key, String(value));
    },
  };
}

export function memoryStore(seed) {
  const bag = Object.assign({}, seed);
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(bag, key) ? bag[key] : null;
    },
    setItem(key, value) {
      bag[key] = String(value);
    },
  };
}

export function emptyData() {
  return {
    v: 1,
    name: "",
    highlightId: "",
    entries: [],
    initials: { default: "", asked: false },
    pending: null,
    nextHandId: 1,
    badges: {},
    progress: {},
    daily: { lastDay: "", streak: 0, best: 0 },
    sessions: { withinLimits: 0, awarded: [] },
    session: null,
  };
}

/** Monday 00:00:00.000 in the local timezone of `now`. */
export function weekStart(now) {
  const d = new Date(now);
  const day = d.getDay();
  const back = day === 0 ? 6 : day - 1;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - back, 0, 0, 0, 0).getTime();
}

export function weekKey(now) {
  const d = new Date(weekStart(now));
  const p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}

export function formatWhen(at) {
  const d = new Date(at);
  return DAYS[d.getDay()] + " " + MONTHS[d.getMonth()] + " " + d.getDate();
}

export function formatClock(at) {
  const d = new Date(at);
  let h = d.getHours();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return h + ":" + String(d.getMinutes()).padStart(2, "0") + " " + ap;
}

export function localISO(at) {
  const d = new Date(at);
  const p = (n) => String(n).padStart(2, "0");
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const abs = Math.abs(off);
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate())
    + "T" + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds())
    + sign + p(Math.floor(abs / 60)) + ":" + p(abs % 60);
}

/**
 * 1–3 letters A–Z, or blank.
 * Longer strings and leftover junk are rejected (not truncated).
 */
export function normalizeInitials(raw) {
  const letters = String(raw == null ? "" : raw).toUpperCase().replace(/[^A-Z]/g, "");
  if (!letters) return { ok: true, value: "", blocked: false, empty: true };
  if (letters.length > 3) return { ok: false, value: "", blocked: false, empty: false };
  if (INITIALS_BLOCKLIST.indexOf(letters) >= 0) return { ok: false, value: "", blocked: true, empty: false };
  return { ok: true, value: letters, blocked: false, empty: false };
}

/** @deprecated use normalizeInitials. Returns the letters, or "" when invalid or blank. */
export function normalizeName(raw) {
  const n = normalizeInitials(raw);
  return n.ok && !n.empty ? n.value : "";
}

/**
 * The finished hand, or null when the throw did not seven-out.
 * `handBefore` is the hand counter before this throw was added.
 */
export function completedRoll(handBefore, result) {
  if (result !== "seven-out" || !handBefore) return null;
  const throws = Math.floor(handBefore.rolls || 0) + 1;
  const points = Math.floor(handBefore.points || 0);
  if (!(throws >= 2) || points < 0) return null;
  return { throws, points, rolls: throws, pointsMade: points };
}

function rollsOf(e) {
  return Math.floor(Number(e.rolls != null ? e.rolls : e.throws));
}
function pointsOf(e) {
  return Math.floor(Number(e.pointsMade != null ? e.pointsMade : e.points) || 0);
}
function atOf(e) {
  return Number(e.sevenOutAt != null ? e.sevenOutAt : e.at);
}

function byRank(a, b) {
  if (rollsOf(b) !== rollsOf(a)) return rollsOf(b) - rollsOf(a);
  if (pointsOf(b) !== pointsOf(a)) return pointsOf(b) - pointsOf(a);
  return atOf(a) - atOf(b);
}

function modeOf(mode) {
  return mode === "crapless" ? "crapless" : "regular";
}

export function ranked(entries, opts) {
  const mode = modeOf(opts.mode);
  const start = opts.scope === "week" ? weekStart(opts.now) : -Infinity;
  return (entries || [])
    .filter((e) => e.mode === mode && atOf(e) >= start)
    .slice()
    .sort(byRank)
    .slice(0, TOP_N);
}

export function placeOf(entries, candidate, opts) {
  const others = (entries || []).filter((e) => e.id !== candidate.id);
  const top = ranked(others.concat([candidate]), {
    mode: candidate.mode,
    scope: opts.scope,
    now: opts.now,
  });
  const idx = top.findIndex((e) => e.id === candidate.id);
  return idx >= 0 ? idx + 1 : 0;
}

export function isPersonalBest(entries, candidate) {
  const mine = (entries || []).filter((e) => e.mode === candidate.mode);
  if (!mine.length) return rollsOf(candidate) >= 2;
  const best = mine.slice().sort(byRank)[0];
  if (rollsOf(candidate) > rollsOf(best)) return true;
  if (rollsOf(candidate) === rollsOf(best) && pointsOf(candidate) > pointsOf(best)) return true;
  return false;
}

export function bestEntry(entries, mode) {
  const mine = (entries || []).filter((e) => e.mode === modeOf(mode));
  if (!mine.length) return null;
  return mine.slice().sort(byRank)[0];
}

export function lastWeekBest(entries, mode, now) {
  const start = weekStart(now);
  const prev = weekStart(start - 1);
  const rows = (entries || [])
    .filter((e) => e.mode === modeOf(mode) && atOf(e) >= prev && atOf(e) < start)
    .sort(byRank);
  return rows[0] || null;
}

function sevenDice(raw) {
  if (!raw || typeof raw !== "object") return null;
  const d1 = Math.floor(Number(raw.d1));
  const d2 = Math.floor(Number(raw.d2));
  if (d1 < 1 || d1 > 6 || d2 < 1 || d2 > 6 || d1 + d2 !== 7) return null;
  return { d1, d2 };
}

function asEntry(raw) {
  const throws = rollsOf(raw || {});
  const points = pointsOf(raw || {});
  const at = atOf(raw || {});
  const mode = raw && raw.mode === "crapless" ? "crapless" : raw && raw.mode === "regular" ? "regular" : "";
  if (!mode || !(throws >= 2) || points < 0 || !Number.isFinite(at)) return null;
  return { throws, points, rolls: throws, pointsMade: points, mode, at, sevenOutAt: at };
}

export function previewRoll(data, candidate) {
  const entry = asEntry(candidate);
  if (!entry) {
    return { madeWeek: false, madeAll: false, rankWeek: 0, rankAll: 0, personalBest: false, record: false, throws: 0, points: 0, mode: "regular", at: 0 };
  }
  entry.id = "__preview__";
  const entries = (data && data.entries) || [];
  const rankWeek = placeOf(entries, entry, { scope: "week", now: entry.at });
  const rankAll = placeOf(entries, entry, { scope: "all", now: entry.at });
  return {
    madeWeek: rankWeek > 0,
    madeAll: rankAll > 0,
    rankWeek,
    rankAll,
    personalBest: isPersonalBest(entries, entry),
    record: rankWeek === 1 || rankAll === 1,
    throws: entry.throws,
    points: entry.points,
    mode: entry.mode,
    at: entry.at,
    sevenOutDice: sevenDice(candidate && candidate.sevenOutDice),
  };
}

function prune(entries, now) {
  const start = weekStart(now);
  const keep = new Set();
  ["regular", "crapless"].forEach((mode) => {
    ranked(entries, { mode, scope: "all", now }).forEach((e) => keep.add(e.id));
    entries
      .filter((e) => e.mode === mode && atOf(e) >= start)
      .sort(byRank)
      .slice(0, 80)
      .forEach((e) => keep.add(e.id));
  });
  return entries.filter((e) => keep.has(e.id));
}

function displayName(initials) {
  return initials || "—";
}

export function commitRoll(data, candidate) {
  const base = data && Array.isArray(data.entries) ? data : emptyData();
  const raw = candidate && candidate.initials != null ? candidate.initials : (candidate && candidate.name) || "";
  const norm = normalizeInitials(raw);
  if (norm.blocked) return { ok: false, error: "Try different letters.", data: base };
  if (!norm.ok) return { ok: false, error: "Use 1 to 3 letters, A to Z.", data: base };
  if (candidate && candidate.hadBetOnSevenOut === false) {
    return { ok: false, error: "No bet was working on the seven-out.", data: base };
  }
  if (candidate && candidate.rngSource === "test") {
    return { ok: false, error: "A test roll is not posted.", data: base };
  }
  const draft = asEntry(candidate || {});
  if (!draft) return { ok: false, error: "That hand cannot be posted.", data: base };
  const preview = previewRoll(base, draft);
  if (!preview.madeWeek && !preview.madeAll) {
    return { ok: false, error: "That hand missed the board.", data: base };
  }
  const handId = Math.floor(Number(candidate.handId) || base.nextHandId || base.entries.length + 1);
  const id = "h_" + handId;
  const personalBest = preview.personalBest;
  const initials = norm.value;
  const entry = {
    id,
    handId,
    throws: draft.throws,
    points: draft.points,
    rolls: draft.rolls,
    pointsMade: draft.pointsMade,
    differentPoints: Math.max(0, Math.floor(Number(candidate.differentPoints) || 0)),
    mode: draft.mode,
    at: draft.at,
    sevenOutAt: draft.at,
    startedAt: Number(candidate.startedAt) || draft.at,
    sevenOutLocal: candidate.sevenOutLocal || localISO(draft.at),
    weekKey: candidate.weekKey || weekKey(draft.at),
    initials,
    name: displayName(initials),
    hadBetOnSevenOut: true,
    betRolls: Math.max(0, Math.floor(Number(candidate.betRolls) || 0)),
    topBlazingTier: candidate.topBlazingTier || "cold",
    ruleSet: candidate.ruleSet === "custom" ? "custom" : "standard",
    rollSource: candidate.rollSource || "manual",
    rngSource: candidate.rngSource === "fallback" ? "fallback" : "secure",
    sessionId: Math.floor(Number(candidate.sessionId) || 0),
    appVersion: candidate.appVersion || "run6",
    personalBest,
    sevenOutDice: sevenDice(candidate.sevenOutDice),
  };
  let entries = base.entries.map((e) => (
    personalBest && e.mode === entry.mode ? Object.assign({}, e, { personalBest: false }) : e
  ));
  entries = prune(entries.concat([entry]), entry.at);
  const initialsState = {
    default: initials,
    asked: true,
  };
  return {
    ok: true,
    data: Object.assign({}, base, {
      name: initials,
      highlightId: id,
      entries,
      initials: initialsState,
      pending: null,
      nextHandId: Math.max(handId + 1, (base.nextHandId || 1)),
    }),
    entry,
    madeWeek: preview.madeWeek,
    madeAll: preview.madeAll,
    personalBest,
    record: preview.record,
    rankWeek: placeOf(entries, entry, { scope: "week", now: entry.at }),
    rankAll: placeOf(entries, entry, { scope: "all", now: entry.at }),
  };
}

export function setInitials(data, raw, applyExisting) {
  const base = data && Array.isArray(data.entries) ? data : emptyData();
  const norm = normalizeInitials(raw);
  if (norm.blocked) return { ok: false, error: "Try different letters.", data: base };
  if (!norm.ok) return { ok: false, error: "Use 1 to 3 letters, A to Z.", data: base };
  const initials = norm.value;
  const entries = applyExisting
    ? base.entries.map((e) => Object.assign({}, e, { initials, name: displayName(initials) }))
    : base.entries.slice();
  return {
    ok: true,
    data: Object.assign({}, base, {
      name: initials,
      entries,
      initials: { default: initials, asked: true },
    }),
  };
}

function copyEntry(e) {
  return {
    id: e.id,
    handId: e.handId || 0,
    throws: e.throws,
    points: e.points,
    rolls: e.rolls,
    pointsMade: e.pointsMade,
    differentPoints: e.differentPoints || 0,
    mode: e.mode,
    at: e.at,
    sevenOutAt: e.sevenOutAt,
    startedAt: e.startedAt || e.at,
    sevenOutLocal: e.sevenOutLocal || "",
    weekKey: e.weekKey || "",
    initials: e.initials || "",
    name: e.name,
    hadBetOnSevenOut: e.hadBetOnSevenOut !== false,
    betRolls: e.betRolls || 0,
    topBlazingTier: e.topBlazingTier || "cold",
    ruleSet: e.ruleSet || "standard",
    rollSource: e.rollSource || "manual",
    rngSource: e.rngSource || "secure",
    sessionId: e.sessionId || 0,
    appVersion: e.appVersion || "",
    personalBest: !!e.personalBest,
    sevenOutDice: sevenDice(e.sevenOutDice),
  };
}

function sanitize(data) {
  const entries = [];
  const list = Array.isArray(data.entries) ? data.entries : [];
  list.forEach((e) => {
    if (!e || typeof e !== "object") return;
    const norm = normalizeInitials(e.initials != null ? e.initials : e.name);
    if (!norm.ok) return;
    const parsed = asEntry(e);
    if (!parsed || !e.id) return;
    entries.push(copyEntry(Object.assign({}, e, parsed, {
      id: String(e.id),
      initials: norm.value,
      name: displayName(norm.value),
    })));
  });
  const saved = data.initials && typeof data.initials === "object" ? data.initials : {};
  const nameNorm = normalizeInitials(saved.default != null ? saved.default : data.name);
  return {
    v: 1,
    name: nameNorm.ok ? nameNorm.value : "",
    highlightId: data.highlightId ? String(data.highlightId) : "",
    entries,
    initials: { default: nameNorm.ok ? nameNorm.value : "", asked: !!saved.asked },
    pending: data.pending && typeof data.pending === "object" ? data.pending : null,
    nextHandId: Math.max(1, Math.floor(Number(data.nextHandId) || entries.length + 1)),
    badges: data.badges && typeof data.badges === "object" ? data.badges : {},
    progress: data.progress && typeof data.progress === "object" ? data.progress : {},
    daily: data.daily && typeof data.daily === "object" ? data.daily : { lastDay: "", streak: 0, best: 0 },
    sessions: data.sessions && typeof data.sessions === "object" ? data.sessions : { withinLimits: 0, awarded: [] },
    session: data.session && typeof data.session === "object" ? data.session : null,
  };
}

export function readStore(storage, key = STORE_KEY) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return emptyData();
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return emptyData();
    return sanitize(data);
  } catch {
    return emptyData();
  }
}

export function writeStore(storage, data, key = STORE_KEY) {
  const clean = sanitize(data || emptyData());
  storage.setItem(key, JSON.stringify(clean));
}
