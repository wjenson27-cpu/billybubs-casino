/**
 * Session history and bankroll chart (rev 16 S8). Practice chips only.
 * A Reset bankroll ends the session and never counts as a gain.
 */

export const KEYS = { bubble: "bb-bubble-history-v1", table: "bb-table-history-v1" };
export const FREE_LIST = 20;
export const SERIES_CAP = 200;
export const SESSION_CAP = 5000;
export const FOOTER = "Practice chips. Past sessions don't predict future rolls.";
export const IDLE_MS = 30 * 60 * 1000;

export function emptyBook() {
  return { sessions: [], yourDice: [], live: null, yourLive: null };
}

export function loadBook(storage, app) {
  try {
    const raw = storage.getItem(KEYS[app] || KEYS.bubble);
    const data = raw ? JSON.parse(raw) : null;
    if (!data || !Array.isArray(data.sessions)) return emptyBook();
    data.yourDice = Array.isArray(data.yourDice) ? data.yourDice : [];
    return data;
  } catch {
    return emptyBook();
  }
}

export function saveBook(storage, app, book) {
  storage.setItem(KEYS[app] || KEYS.bubble, JSON.stringify(book));
  return book;
}

function pointCap(points) {
  const pts = points.slice();
  if (pts.length <= SESSION_CAP) return pts;
  return pts.slice(pts.length - SESSION_CAP);
}

export function openLive(book, info) {
  const next = book || emptyBook();
  const bucket = info && info.yourDice ? "yourLive" : "live";
  if (next[bucket] && !next[bucket].ended) return next;
  const start = Math.round(info.startChips || 0);
  next[bucket] = {
    id: Date.now(),
    startedAt: info.startedAt || Date.now(),
    label: info.label || "",
    mode: info.mode || "regular",
    tier: info.tier || "standard",
    strategy: info.strategy || "",
    yourDice: !!(info && info.yourDice),
    startChips: start,
    points: [start],
    rolls: 0,
    hands: 0,
    sevens: [],
    longest: 0,
    ended: false,
    endReason: "",
    counts: true,
    touchedAt: info.startedAt || Date.now(),
  };
  return next;
}

export function noteRoll(book, total, meta) {
  const next = book || emptyBook();
  const yours = meta && meta.yourDice;
  const live = yours ? next.yourLive : next.live;
  if (!live || live.ended) return next;
  live.points = pointCap(live.points.concat([Math.round(total)]));
  live.rolls += 1;
  live.touchedAt = Date.now();
  if (meta && meta.sevenOut) {
    live.sevens = (live.sevens || []).concat([live.rolls]);
    live.hands += 1;
    if (!yours && meta.length && meta.length > (live.longest || 0)) live.longest = meta.length;
  }
  return next;
}

export function closeLive(book, reason, yourDice) {
  const next = book || emptyBook();
  const key = yourDice ? "yourLive" : "live";
  const list = yourDice ? "yourDice" : "sessions";
  const live = next[key];
  if (!live || live.ended || live.rolls <= 0) {
    next[key] = null;
    return next;
  }
  const end = live.points[live.points.length - 1];
  live.ended = true;
  live.endReason = reason || "end";
  live.endChips = end;
  live.net = end - live.startChips;
  live.counts = true;
  live.netCounts = true;
  if (reason === "reset") live.refillExcluded = true;
  const stats = summarize(live.points, live.startChips);
  Object.assign(live, stats);
  next[list] = [live].concat(next[list] || []);
  next[key] = null;
  return next;
}

export function summarize(points, start) {
  const pts = points && points.length ? points : [start || 0];
  let hi = pts[0];
  let lo = pts[0];
  let hiAt = 0;
  let loAt = 0;
  let peak = pts[0];
  let dd = 0;
  pts.forEach((v, i) => {
    if (v > hi) { hi = v; hiAt = i; }
    if (v < lo) { lo = v; loAt = i; }
    if (v > peak) peak = v;
    dd = Math.max(dd, peak - v);
  });
  const end = pts[pts.length - 1];
  return {
    end,
    net: end - (start != null ? start : pts[0]),
    hi,
    lo,
    hiAt,
    loAt,
    drawdown: dd,
    drawdownPct: peak ? Math.round((dd / peak) * 1000) / 10 : 0,
  };
}

/** A reset stays in the totals. The net is the play result; the refill is not a point. */
export function countable(sessions) {
  return (sessions || []).filter((s) => s && s.counts !== false);
}

export function touch(book, now) {
  const next = book || emptyBook();
  const stamp = now || Date.now();
  ["live", "yourLive"].forEach((key) => {
    if (next[key] && !next[key].ended) next[key].touchedAt = stamp;
  });
  return next;
}

/** Close a live session that has been quiet for 30 minutes. */
export function closeIdle(book, now) {
  let next = book || emptyBook();
  const stamp = now || Date.now();
  ["live", "yourLive"].forEach((key) => {
    const live = next[key];
    if (!live || live.ended) return;
    const at = live.touchedAt || live.startedAt || 0;
    if (at && stamp - at >= IDLE_MS) next = closeLive(next, "idle", key === "yourLive");
  });
  return next;
}

export function totals(sessions) {
  const rows = countable(sessions);
  const nets = rows.map((s) => s.net || 0);
  const hi = nets.length ? Math.max.apply(null, nets) : 0;
  const lo = nets.length ? Math.min.apply(null, nets) : 0;
  return {
    sessions: (sessions || []).length,
    rolls: (sessions || []).reduce((a, s) => a + (s.rolls || 0), 0),
    highest: hi,
    lowest: lo,
    net: nets.reduce((a, n) => a + n, 0),
  };
}

/** Full series keeps the latest 200 sessions. Older sessions become one min and one max point. */
export function allTimeSeries(sessions) {
  const rows = countable(sessions).slice().reverse();
  const cum = [0];
  const nets = [];
  rows.forEach((s) => {
    const net = s.net || 0;
    nets.push(net);
    cum.push(cum[cum.length - 1] + net);
  });
  if (rows.length <= SERIES_CAP) return { cum, nets, downsampled: false };
  const head = rows.length - SERIES_CAP;
  const older = nets.slice(0, head);
  const lo = Math.min.apply(null, older);
  const hi = Math.max.apply(null, older);
  return { cum: cum.slice(cum.length - SERIES_CAP - 1), nets: [lo, hi].concat(nets.slice(head)), downsampled: true };
}

export function visibleSessions(sessions, premium) {
  const list = sessions || [];
  return premium ? list : list.slice(0, FREE_LIST);
}

export function sessionsCsv(sessions) {
  const lines = ["started,mode,tier,rolls,start,end,net,reason"];
  (sessions || []).forEach((s) => {
    lines.push([s.startedAt, s.mode, s.tier, s.rolls, s.startChips, s.endChips, s.counts === false ? 0 : s.net, s.endReason].join(","));
  });
  return lines.join("\n");
}
