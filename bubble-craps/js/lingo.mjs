/**
 * Craps Lingo (S4.5 rev 15d). Search, filters and roll-call map.
 * The glossary ships in lingo.json and is searched in memory.
 */
import data from "./lingo.json" with { type: "json" };

export const LINGO = data;
export const FOOTER = "Every casino says it a little differently. When in doubt, ask the dealer.";
export const EMPTY = "No match. Try 'field', 'hardways' or a number like '8'.";
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const BANNED = ["due", "overdue", "about to", "streak will", "can't lose", "lucky dice", "hot dice", "cold dice", "the table is turning", "cash out", "real money", "rigged", "guaranteed", "beat the house", "bet more", "let it ride", "keep it going", "on fire"];

export function termsFor(app) {
  const key = app === "table" ? "table" : "bubble";
  return data.terms.filter((t) => (t.apps || []).indexOf(key) >= 0);
}

export function termById(id, app) {
  const t = data.terms.find((row) => row.id === id);
  if (!t) return null;
  if (app && (t.apps || []).indexOf(app === "table" ? "table" : "bubble") < 0) return null;
  return t;
}

export function counts(app) {
  const terms = termsFor(app);
  const out = { all: terms.length, dice: 0, bets: 0, actions: 0, table: 0 };
  terms.forEach((t) => { if (out[t.category] != null) out[t.category] += 1; });
  return out;
}

export function normalize(raw) {
  let s = String(raw || "").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  s = s.replace(/&/g, " and ");
  s = s.replace(/['’]/g, "");
  s = s.replace(/[-–—_/]+/g, " ");
  s = s.replace(/[^a-z0-9\s]/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s.split(" ").map((tok) => (/^\d+$/.test(tok) && WORDS[Number(tok)] ? WORDS[Number(tok)] : tok)).join(" ");
}

function squash(s) { return s.replace(/ /g, ""); }

function dl(a, b) {
  const n = a.length;
  const m = b.length;
  if (!n) return m;
  if (!m) return n;
  const d = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) d[i][0] = i;
  for (let j = 0; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }
  return d[n][m];
}

function namesOf(term) {
  return [term.term].concat(term.aliases || []).map(normalize).filter(Boolean);
}

function wordHit(query, name) {
  const qw = query.split(" ").filter(Boolean);
  const nw = name.split(" ").filter(Boolean);
  if (!qw.length || !nw.length) return false;
  let i = 0;
  for (const q of qw) {
    let found = false;
    while (i < nw.length) {
      if (nw[i].startsWith(q)) { found = true; i += 1; break; }
      i += 1;
    }
    if (!found) return false;
  }
  return true;
}

function boundaryHit(querySquash, name) {
  const words = name.split(" ").filter(Boolean);
  let s = "";
  const starts = new Set();
  words.forEach((w) => { starts.add(s.length); s += w; });
  let at = 0;
  while (at <= s.length) {
    const i = s.indexOf(querySquash, at);
    if (i < 0) return false;
    if (starts.has(i)) return true;
    at = i + 1;
  }
  return false;
}

function sortDice(list) {
  return list.slice().sort((a, b) => ((a.dice && a.dice.total) || 0) - ((b.dice && b.dice.total) || 0) || a.term.localeCompare(b.term));
}
function sortAlpha(list) {
  return list.slice().sort((a, b) => a.term.localeCompare(b.term));
}

export function grouped(app, category) {
  const terms = termsFor(app);
  const cats = category && category !== "all" ? [category] : ["dice", "bets", "actions", "table"];
  return cats.map((cat) => {
    const rows = terms.filter((t) => t.category === cat);
    return { cat, label: (data.categories && data.categories[cat]) || cat, terms: cat === "dice" ? sortDice(rows) : sortAlpha(rows) };
  }).filter((g) => g.terms.length);
}

/**
 * Fuzzy search inside one app's bundle. Match order is exact, prefix,
 * whole-word / boundary, same dice total as an exact hit, then typos.
 */
export function search(query, app) {
  const terms = termsFor(app);
  const q = normalize(query);
  if (!q) return { hits: [], didYouMean: [], query: q };
  const qs = squash(q);
  const exact = [];
  const prefix = [];
  const word = [];
  terms.forEach((term, index) => {
    const names = namesOf(term);
    const squashes = names.map(squash);
    if (names.indexOf(q) >= 0 || squashes.indexOf(qs) >= 0) {
      exact.push({ term, index, rest: 0 });
      return;
    }
    if (q.length >= 3) {
      let best = Infinity;
      names.forEach((name) => {
        if (name.startsWith(q)) best = Math.min(best, name.length - q.length);
        const sq = squash(name);
        if (sq.startsWith(qs)) best = Math.min(best, sq.length - qs.length);
      });
      if (best < Infinity) { prefix.push({ term, index, rest: best }); return; }
    }
    if (names.some((name) => wordHit(q, name) || (qs.length >= 3 && boundaryHit(qs, name)))) {
      word.push({ term, index });
    }
  });
  prefix.sort((a, b) => a.rest - b.rest || a.index - b.index);
  const hits = exact.map((r) => r.term).concat(prefix.map((r) => r.term), word.map((r) => r.term));
  const seen = new Set(hits.map((t) => t.id));
  exact.forEach((row) => {
    const total = row.term.dice && row.term.dice.total;
    if (!total) return;
    terms.forEach((t) => {
      if (seen.has(t.id)) return;
      if (t.dice && t.dice.total === total) { hits.push(t); seen.add(t.id); }
    });
  });
  if (hits.length) return { hits, didYouMean: [], query: q };
  const limit = qs.length >= 7 ? 2 : qs.length >= 4 ? 1 : 0;
  if (!limit) return { hits: [], didYouMean: [], query: q };
  const typos = [];
  terms.forEach((term) => {
    let best = Infinity;
    namesOf(term).forEach((name) => {
      best = Math.min(best, dl(qs, squash(name)));
    });
    if (best <= limit) typos.push({ term, best });
  });
  typos.sort((a, b) => a.best - b.best || a.term.term.localeCompare(b.term.term));
  return { hits: [], didYouMean: typos.slice(0, 5).map((r) => r.term), query: q };
}

const BY_TOTAL = { 2: "aces", 3: "ace_deuce", 5: "no_field_five", 9: "center_field_nine", 11: "yo", 12: "boxcars" };
const HARD = { 4: "hard_four", 6: "hard_six", 8: "hard_eight", 10: "hard_ten" };
const EASY = { 4: "easy_four", 6: "easy_six", 8: "easy_eight", 10: "easy_ten" };

/** Term id from the settled roll object. Never from the call text. */
export function callTermId(roll) {
  if (!roll) return null;
  if (roll.result === "seven-out") return "seven_out";
  if (roll.result === "no-roll") return "no_roll";
  const total = roll.total != null ? roll.total : (Number(roll.d1) + Number(roll.d2));
  const comeOut = roll.phaseBefore === "come-out" || roll.phase === "come-out";
  if (comeOut && total === 7) return "natural";
  if (total === 2 || total === 3 || total === 12 || total === 11) return BY_TOTAL[total];
  if (roll.hard && HARD[total]) return HARD[total];
  if (!roll.hard && EASY[total]) return EASY[total];
  if (total === 5 || total === 9) return BY_TOTAL[total];
  return null;
}

export function callTerm(roll, app) {
  const id = callTermId(roll);
  return id ? termById(id, app) : null;
}

export function noteFor(term, app, mode) {
  if (!term || !term.notes) return "";
  if (mode === "crapless" && term.notes.crapless) return term.notes.crapless;
  const key = app === "table" ? "table" : "bubble";
  return term.notes[key] || "";
}

export function tagClass(tag) {
  const s = String(tag || "");
  if (/live/i.test(s)) return "live";
  if (/not in crapless/i.test(s)) return "nocl";
  if (/table/i.test(s)) return "tc";
  return "";
}

const SPOT_TERM = {
  pass: "pass_line",
  dontPass: "dont_pass",
  come: "come",
  dontCome: "dont_come",
  field: "field",
  any7: "big_red",
  small: "ats",
  tall: "ats",
  all: "ats",
  hardAllDay: "hard_way_all_day",
  repeater: "repeaters",
  hop: "hop",
  place: "place",
  buy: "buy",
  lay: "lay",
  passOdds: "odds",
  dontPassOdds: "odds",
  comeOdds: "odds",
  dontComeOdds: "odds",
  horn: "horn",
  ce: "ce",
  anyCraps: "any_craps",
  yo: "yo",
  fire: "fire_bet",
  big6: "big_6_8",
  big8: "big_6_8",
};

export function termForSpot(spot, app) {
  if (!spot || !spot.kind) return null;
  let id = SPOT_TERM[spot.kind];
  if (spot.kind === "hardway") id = HARD[spot.number] || "hardways";
  if (spot.kind === "hop" && spot.pair) {
    const parts = String(spot.pair).split("-");
    if (parts[0] && parts[0] === parts[1]) id = "hop_hard_way";
  }
  return termById(id, app);
}

export function parseSpotKind(kind, number) {
  const raw = String(kind || "");
  if (raw.indexOf(":") >= 0) {
    const [k, rest] = raw.split(":");
    if (k === "hop") return { kind: "hop", pair: rest };
    if (k === "hardway") return { kind: "hardway", number: Number(rest) };
    if (k === "repeater") return { kind: "repeater", number: Number(rest) };
    return { kind: k, number: Number(rest) || number || undefined };
  }
  const spot = { kind: raw };
  if (number) spot.number = Number(number);
  return spot;
}

export function lintTerms() {
  const problems = [];
  const ids = new Set();
  data.terms.forEach((t) => {
    ["id", "term", "category", "meaning", "call", "srLabel", "apps", "appliesTo", "tag", "link", "related"].forEach((key) => {
      if (t[key] == null) problems.push(t.id + " missing " + key);
    });
    if (ids.has(t.id)) problems.push("duplicate " + t.id);
    ids.add(t.id);
    if (String(t.meaning || "").length > 240) problems.push(t.id + " meaning length");
    if (String(t.call || "").length > 80) problems.push(t.id + " call length");
    const blob = [t.term, t.meaning, t.call, t.srLabel, JSON.stringify(t.notes || {})].join(" ").toLowerCase();
    BANNED.forEach((w) => { if (blob.indexOf(w) >= 0) problems.push(t.id + " banned " + w); });
    if ((t.apps || []).indexOf("bubble") >= 0 && /\bfire\b/i.test(blob)) problems.push(t.id + " fire in bubble");
  });
  data.terms.forEach((t) => {
    (t.related || []).forEach((id) => {
      if (!ids.has(id)) problems.push(t.id + " related " + id);
      const other = data.terms.find((row) => row.id === id);
      if (other && (t.apps || []).indexOf("bubble") >= 0 && (other.apps || []).indexOf("bubble") < 0) {
        problems.push(t.id + " bubble relates to table-only " + id);
      }
    });
  });
  const bubble = termsFor("bubble");
  if (bubble.some((t) => t.id === "fire_bet")) problems.push("bubble has fire");
  if (termsFor("table").length !== 79) problems.push("table count " + termsFor("table").length);
  if (bubble.length !== 78) problems.push("bubble count " + bubble.length);
  return problems;
}
