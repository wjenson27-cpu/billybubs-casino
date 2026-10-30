/**
 * Round 5b screens shared by Bubble and Table: sessions, Your Dice,
 * table rules, roll speed, quick bets, and payout drills.
 */
import * as E from "./engine.mjs";
import * as H from "./history.mjs";
import * as YD from "./your-dice.mjs";
import * as Tiers from "./tiers.mjs";
import * as QB from "./quick-bets.mjs";
import * as Dr from "./drills.mjs";
import * as RS from "./roll-speed.mjs";

let api = {
  app: "bubble",
  premium: () => false,
  money: (c) => "$" + Math.round((c || 0) / 100),
  getGame: () => null,
  setGame: () => {},
  getRail: () => null,
  setRail: () => {},
  toast: () => {},
  repaint: () => {},
  settings: {},
  save: () => {},
};

let sheet = "";
let book = H.emptyBook();
let yd = null;
let rngSnap = null;
let drill = null;
let histTab = "session";
let chartTable = false;
let activityBound = false;

function betUnit(g) {
  if (!g) return api.app === "table" ? 1000 : 500;
  if (api.app === "bubble") {
    if (g.bubbleMin) return g.bubbleMin;
    return Tiers.tierById("bubble", api.settings.tier || "standard").min;
  }
  return (g.rules && g.rules.tableMin) || 1000;
}

function markActivity(save) {
  const had = !!(book.live || book.yourLive);
  book = H.closeIdle(book, Date.now());
  book = H.touch(book, Date.now());
  const has = !!(book.live || book.yourLive);
  if (save || (had && !has)) persist();
}

function bindActivity() {
  if (activityBound || typeof addEventListener !== "function") return;
  activityBound = true;
  addEventListener("pointerdown", () => markActivity(false), { passive: true });
  document.addEventListener("visibilitychange", () => markActivity(true));
}

export function attach(next) {
  api = Object.assign(api, next || {});
  book = H.loadBook(localStorage, api.app);
  book = H.closeIdle(book, Date.now());
  bindActivity();
  if (!api.settings.rollSpeed) api.settings.rollSpeed = "normal";
  if (!api.settings.tier) api.settings.tier = "standard";
  if (api.settings.includePoint == null) api.settings.includePoint = false;
  if (api.settings.field12 == null) api.settings.field12 = 2;
  if (api.settings.field2 == null) api.settings.field2 = 2;
}

export function active() {
  return !!(yd && yd.on);
}

export function pending() {
  return yd && yd.pending;
}

export function consume() {
  if (!yd) return null;
  const pair = yd.pending;
  yd.pending = null;
  return pair;
}

export function rollSpeed() {
  return RS.normalizeSpeed(api.settings.rollSpeed);
}

export function banner() {
  return active() ? YD.BANNER : "";
}

export function quickHTML() {
  const g = api.getGame();
  if (!g) return "";
  const names = QB.keysFor(api.app);
  const chip = api.settings.chip || (api.app === "table" ? 1000 : 500);
  const min = betUnit(g);
  const stake = stakeMap(g);
  const buttons = names.map((name) => {
    const p = QB.plan(name, { chip, tableMin: min, point: g.point, includePoint: !!api.settings.includePoint, have: stake.have, amounts: stake.amounts });
    const label = name.toUpperCase();
    const show = p.spots.reduce((a, s) => a + (s.target || (s.skip ? 0 : s.amount)), 0);
    return "<button type='button' data-act='r5-quick' data-quick='" + name + "' aria-label='" + label + " " + api.money(show) + "'><b>" + label + "</b><span>" + api.money(show) + "</span></button>";
  }).join("");
  const preview = names.map((name) => {
    const p = QB.plan(name, { chip, tableMin: min, point: g.point, includePoint: !!api.settings.includePoint, have: stake.have, amounts: stake.amounts });
    const bits = p.spots.map((s) => (s.skip && s.reason !== "full") ? (s.n + " skip") : (s.n + " " + api.money(s.target || s.amount)));
    return "<p class='r5-preview'><b>" + name.toUpperCase() + "</b> " + bits.join(" · ") + "</p>";
  }).join("");
  return "<div class='r5-qstrip'>" + buttons + "</div><div class='r5-previews'>" + preview + "</div>";
}

function stakeMap(g) {
  const have = {};
  const amounts = {};
  [4, 5, 6, 8, 9, 10].forEach((n) => {
    if (g.bets.lay && g.bets.lay[n]) { have[n] = "lay"; amounts[n] = g.bets.lay[n]; }
    else if (g.bets.place && g.bets.place[n]) { have[n] = "place"; amounts[n] = g.bets.place[n]; }
    else if (g.bets.buy && g.bets.buy[n]) { have[n] = "buy"; amounts[n] = g.bets.buy[n]; }
  });
  return { have, amounts };
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function chartSVG(series, label) {
  const all = series.reduce((acc, s) => acc.concat(s.pts && s.pts.length ? s.pts : [0]), []);
  const lo = Math.min.apply(null, all);
  const hi = Math.max.apply(null, all);
  const span = Math.max(1, hi - lo);
  const W = 600;
  const H = 180;
  const Y = (v) => 16 + (1 - (v - lo) / span) * (H - 36);
  const lines = series.map((s) => {
    const pts = s.pts && s.pts.length ? s.pts : [0];
    const X = (i) => 36 + (pts.length === 1 ? 0 : (i / (pts.length - 1)) * (W - 48));
    const poly = pts.map((v, i) => X(i).toFixed(1) + "," + Y(v).toFixed(1)).join(" ");
    const dash = s.dashed ? " stroke-dasharray='8 5'" : "";
    return "<polyline fill='none' stroke='" + s.color + "' stroke-width='2.4'" + dash + " points='" + poly + "'/>";
  }).join("");
  return "<figure class='r5-chart'><svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='" + esc(label) + "'>" + lines + "</svg></figure>";
}

function chartBlock(series, label, points) {
  const legend = "<ul class='r5-legend'><li><i class='solid'></i><span>This session</span></li><li><i class='dash'></i><span>All sessions</span></li></ul>";
  const toggle = "<button type='button' class='r5-btn' data-act='r5-chart-table'>" + (chartTable ? "Show as chart" : "Show as table") + "</button>";
  if (chartTable) {
    const rows = (points || [0]).map((v, i) => "<tr><th scope='row'>" + i + "</th><td>" + api.money(v) + "</td></tr>").join("");
    return toggle + "<table class='r5-table'><caption>" + esc(label) + "</caption><thead><tr><th>Roll</th><th>Chips</th></tr></thead><tbody>" + rows + "</tbody></table>" + legend;
  }
  return toggle + chartSVG(series, label) + legend;
}

export function markup(opts) {
  const parts = [];
  if (active() && !(opts && opts.dice === false)) parts.push(dicePanel());
  if (sheet) parts.push(sheetHTML());
  return "<div class='r5-host'>" + parts.join("") + "</div>";
}

export function yourDicePanel() {
  return active() ? dicePanel() : "";
}

function faceRow(which, label) {
  const on = (yd.draft && yd.draft[which]) || 0;
  const faces = [1, 2, 3, 4, 5, 6].map((n) => "<button type='button' class='yd-face" + (on === n ? " on" : "") + "' data-act='r5-face' data-die='" + which + "' data-n='" + n + "' aria-label='" + label + " " + n + "'>" + n + "</button>").join("");
  return "<p class='r5-note'>" + label + "</p><div class='r5-faces'>" + faces + "</div>";
}

function dicePanel() {
  const p = yd.pending || { d1: 0, d2: 0 };
  const pairs = YD.PAIR_PAD.map(([a, b]) => "<button type='button' class='yd-face' data-act='r5-pair' data-d1='" + a + "' data-d2='" + b + "' aria-label='" + a + " and " + b + "'>" + a + "·" + b + "</button>").join("");
  return "<section class='r5-yd' aria-label='Your Dice: enter a roll'><div class='r5-banner' role='note'>" + YD.BANNER + "</div><p class='r5-note'>" + YD.ONBOARD + "</p>" +
    "<div class='r5-pairs' role='radiogroup' aria-label='Pick the pair'>" + pairs + "</div>" +
    "<div class='r5-diepad'>" + faceRow("d1", "Die 1") + faceRow("d2", "Die 2") + "</div>" +
    "<p class='r5-note'>Selected " + (p.d1 ? p.d1 + " and " + p.d2 : "none") + (p.d1 ? " <span class='r5-yours'>YOURS</span>" : "") + "</p>" +
    "<div class='r5-seg'><button type='button' data-act='r5-undo'>Undo last roll</button><button type='button' data-act='r5-paste'>Paste</button><button type='button' data-act='r5-leave'>Leave Your Dice</button></div></section>";
}

function sheetHTML() {
  const body = sheet === "history" ? historyHTML()
    : sheet === "rules" ? rulesHTML()
      : sheet === "speed" ? speedHTML()
        : sheet === "drills" ? drillsHTML()
          : sheet === "seats" ? seatsHTML()
            : "";
  return "<div class='r5-scrim'><div class='r5-sheet' role='dialog' aria-label='" + esc(sheet) + "'><button class='r5-x' data-act='r5-close' aria-label='Close'>×</button>" + body + "</div></div>";
}

function historyHTML() {
  const premium = api.premium();
  const yours = histTab === "yours";
  const list = yours ? book.yourDice : book.sessions;
  const live = yours ? book.yourLive : book.live;
  const shown = H.visibleSessions(list, premium || histTab === "session");
  const cur = live && live.points ? live : (list[0] || null);
  const pts = cur ? cur.points : [0];
  const sum = cur ? H.summarize(pts, cur.startChips) : null;
  const all = H.totals(list);
  const label = sum
    ? "Session started " + api.money(cur.startChips) + ", ended " + api.money(sum.end) + "; low " + api.money(sum.lo) + "; high " + api.money(sum.hi)
    : "No session yet";
  const tabs = "<div class='r5-seg' role='tablist'><button type='button' data-act='r5-htab' data-tab='session' class='" + (histTab === "session" ? "on" : "") + "'>This session</button><button type='button' data-act='r5-htab' data-tab='all' class='" + (histTab === "all" ? "on" : "") + "'>All sessions" + (premium ? "" : " 🔒") + "</button><button type='button' data-act='r5-htab' data-tab='yours' class='" + (histTab === "yours" ? "on" : "") + "'>Your Dice</button></div>";
  const sessionSeries = { pts, color: "#7EB6FF", dashed: false, name: "This session" };
  const allSeries = { pts: H.allTimeSeries(list).cum, color: "#E2BC62", dashed: true, name: "All sessions" };
  const drawn = histTab === "all" && premium ? [sessionSeries, allSeries] : [sessionSeries];
  const chartView = (!premium && histTab === "all")
    ? "<p class='r5-note'><b>PREMIUM</b> The all-time chart, the full list and filters are Premium. Free keeps this session's chart, your last 20 sessions and the totals.</p>"
    : chartBlock(drawn, label, histTab === "all" && premium ? allSeries.pts : pts);
  const stats = "<div class='r5-sum'><div><small>SESSIONS</small><b>" + all.sessions + "</b></div><div><small>ROLLS</small><b>" + all.rolls + "</b></div><div><small>HIGHEST SESSION</small><b>" + api.money(all.highest) + "</b></div><div><small>LOWEST SESSION</small><b>" + api.money(all.lowest) + "</b></div></div>";
  const rows = shown.map((s) => "<button type='button' class='r5-row' data-act='r5-session' data-id='" + s.id + "'><span>" + esc(s.mode) + " · " + s.rolls + " rolls</span><b>" + api.money(s.net || 0) + "</b></button>").join("");
  const csv = premium ? "<button type='button' class='r5-btn' data-act='r5-csv'>Sessions CSV</button>" : "<button type='button' class='r5-btn r5-lock' disabled>Sessions CSV PREMIUM</button>";
  return "<div class='r5-head'><small>MENU · SESSIONS</small><h1>Sessions</h1></div>" + tabs + chartView + stats +
    "<p class='r5-note'>A Reset bankroll ends a session and never counts as a gain.</p>" +
    "<div class='r5-k'>SESSIONS · LAST 20 FREE</div>" + rows + csv +
    "<p class='r5-note r5-chartfoot'>" + H.FOOTER + "</p>";
}

function rulesHTML() {
  const tiers = Tiers.tiersFor(api.app);
  const premium = api.premium();
  const on = api.settings.tier || "standard";
  const tierBtns = tiers.map((t) => "<button type='button' data-act='r5-tier' data-tier='" + t.id + "' class='" + (on === t.id ? "on" : "") + "'>" + t.name + "<small> $" + (t.min / 100) + " / $" + (t.max / 100).toLocaleString("en-US") + "</small></button>").join("");
  const banks = Tiers.BANKROLL_PRESETS.map((c) => "<button type='button' data-act='r5-bank' data-cents='" + c + "'>$" + (c / 100).toLocaleString("en-US") + "</button>").join("");
  const custom = premium ? "<button type='button' data-act='r5-bank-custom'>Custom</button>" : "<button type='button' class='r5-lock' disabled>Custom 🔒</button>";
  const odds = Tiers.ODDS_ALL.map((id) => {
    const locked = id !== "345" && !premium;
    return "<button type='button' data-act='r5-odds' data-odds='" + id + "'" + (locked ? " disabled class='r5-lock'" : "") + ">" + (id === "345" ? "3-4-5x" : id) + (locked ? " 🔒" : "") + "</button>";
  }).join("");
  const field = "<button type='button' data-act='r5-field' data-pay='2' class='" + (api.settings.field12 !== 3 ? "on" : "") + "'>2:1</button><button type='button' data-act='r5-field' data-pay='3'" + (premium ? "" : " disabled class='r5-lock'") + ">3:1" + (premium ? "" : " 🔒") + "</button>";
  const tier = Tiers.tierById(api.app, on);
  return "<div class='r5-head'><small>SETTINGS · TABLE RULES</small><h1>Table rules</h1></div>" +
    "<p class='r5-note'>Changes apply at the next come-out. Odds are exempt from the max. Place 6/8 caps at the largest $6 step: " + api.money(Tiers.place68Cap(tier.max)) + ".</p>" +
    "<div class='r5-seg'>" + tierBtns + "</div>" +
    "<p class='r5-note'>Starting bankroll. Applies only through Reset bankroll.</p><div class='r5-seg'>" + banks + custom + "</div>" +
    "<button type='button' class='r5-btn' data-act='r5-also-reset'>Also reset bankroll to " + api.money(tier.bankroll) + "</button>" +
    "<p class='r5-note'>Field 12 pays</p><div class='r5-seg'>" + field + "</div>" +
    "<p class='r5-note'>Odds multiple</p><div class='r5-seg'>" + odds + "</div>" +
    "<p class='r5-note'>PREMIUM keeps Field 12 3:1, odds other than 3-4-5x, custom limits and custom bankroll. Side-bet limits stay the same in every tier.</p>" +
    "<label class='r5-check'><input type='checkbox' data-act='r5-point' " + (api.settings.includePoint ? "checked" : "") + "> <span>Include my point</span></label>";
}

function speedHTML() {
  const on = rollSpeed();
  const btns = RS.SPEEDS.map((s) => "<button type='button' data-act='r5-speed' data-speed='" + s + "' class='" + (on === s ? "on" : "") + "'>" + s[0].toUpperCase() + s.slice(1) + "</button>").join("");
  return "<div class='r5-head'><small>SETTINGS · ROLL SPEED</small><h1>Roll speed</h1></div><div class='r5-seg'>" + btns + "</div>" +
    "<p class='r5-note'>Default Normal. Fast shortens the throw and the celebration. Instant fades in 150 ms. Tap the dice to skip. Every roll counts the same. Auto-roll stays at 10 / 15 / 20 / 30 seconds.</p>";
}

function drillsHTML() {
  if (!drill) {
    const level = api.premium() ? "dealer" : "rookie";
    return "<div class='r5-head'><small>LEARN · PAYOUT DRILLS</small><h1>Billy's Payout Drills</h1></div>" +
      "<p class='r5-note'>Dealer Billy asks what a bet pays. This never touches your chips.</p>" +
      "<div class='r5-seg'><button type='button' data-act='r5-drill-go' data-level='rookie'>Rookie</button><button type='button' data-act='r5-drill-go' data-level='dealer'>Dealer</button><button type='button' data-act='r5-drill-go' data-level='dealer' data-drill='D7'>Pay the roll</button>" +
      (api.premium() ? "<button type='button' data-act='r5-drill-go' data-level='boxman'>Boxman</button>" : "<button type='button' class='r5-lock' disabled>Boxman 🔒</button>") +
      "</div><p class='r5-note'>" + Dr.FOOTER + "</p>";
  }
  const item = drill.items[drill.i];
  if (!item) {
    const g = Dr.grade(drill.level, drill.correct);
    return "<div class='r5-head'><h1>Round complete</h1></div><p>Score " + g.score + " · Accuracy " + g.accuracy + "%</p><p class='r5-note'>" + Dr.FOOTER + "</p><button type='button' class='r5-btn' data-act='r5-drill-end'>Done</button>";
  }
  const choices = item.choices ? item.choices.map((c) => "<button type='button' data-act='r5-answer' data-cents='" + c + "'>" + Dr.formatAnswer(c) + "</button>").join("") : "";
  const why = drill.why ? "<div class='r5-why'><b>Why?</b> " + esc(drill.why) + "</div>" : "";
  return "<div class='r5-head'><small>D" + esc(item.drill) + " · " + (drill.i + 1) + " OF 10</small><h1>Billy's Payout Drills</h1></div>" +
    "<p>" + esc(item.prompt) + "</p><p class='r5-note'>" + esc(item.text) + "</p>" +
    "<div class='r5-seg'>" + choices + "</div>" +
    (item.choices ? "" : "<div class='r5-keypad'>" + ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((k) => "<button type='button' data-act='r5-key' data-key='" + k + "'>" + k + "</button>").join("") + "</div><p>Your pay <b>" + esc(drill.typed || "$") + "</b></p><button type='button' class='r5-btn go' data-act='r5-pay'>PAY</button>") +
    why + "<p class='r5-note'>" + Dr.FOOTER + "</p>";
}

let seats = null;
function seatsHTML() {
  if (!seats) return "<div class='r5-head'><h1>Pass and play</h1></div><p class='r5-note'>Two to six seats share one roll. Your Dice stays off this table.</p><button type='button' class='r5-btn go' data-act='r5-seats-start'>Start two seats</button>";
  return "<div class='r5-head'><h1>Pass and play</h1></div><p>Shooter: " + esc(seats.names[seats.shooter] || "") + "</p>" +
    seats.lines.map((l) => "<p>" + esc(l) + "</p>").join("") +
    "<button type='button' class='r5-btn go' data-act='r5-seats-roll'>Deal one roll</button>";
}

function persist() {
  H.saveBook(localStorage, api.app, book);
}

export function afterRoll(info) {
  book = H.closeIdle(book, Date.now());
  const yours = !!(info && info.yourDice);
  const total = info.total;
  if (!(yours ? book.yourLive : book.live)) {
    book = H.openLive(book, {
      yourDice: yours,
      startChips: info.start,
      mode: info.mode,
      tier: api.settings.tier,
      strategy: info.strategy || "",
      label: yours ? "Your Dice" : "Session",
    });
  }
  book = H.noteRoll(book, total, { yourDice: yours, sevenOut: info.sevenOut, length: info.length });
  persist();
}

/** A queued tier takes effect on the come-out, before the next bet. */
export function applyPending(game) {
  if (!game) return game;
  const comeOut = game.phase === "come-out" || !game.phase;
  if (!comeOut) return game;
  if (game.pendingRules) {
    game.rules = game.pendingRules;
    game.pendingRules = null;
  }
  if (game.pendingBubble) {
    game.bubbleMin = game.pendingBubble.min;
    game.bubbleMax = game.pendingBubble.max;
    game.pendingBubble = null;
  }
  return game;
}

export function beforeReset() {
  const yours = active();
  book = H.closeLive(book, "reset", yours);
  persist();
}

export function closeSession(reason) {
  if (book.live) book = H.closeLive(book, reason || "leave", false);
  if (book.yourLive) book = H.closeLive(book, reason || "leave", true);
  persist();
}

export function handle(act, el) {
  if (!act || act.indexOf("r5-") !== 0) return false;
  const g = api.getGame();
  if (act === "r5-close") { sheet = ""; api.repaint(); return true; }
  if (act === "r5-history") { sheet = "history"; api.repaint(); return true; }
  if (act === "r5-rules") { sheet = "rules"; api.repaint(); return true; }
  if (act === "r5-speed") {
    if (el.dataset.speed) {
      api.settings.rollSpeed = RS.normalizeSpeed(el.dataset.speed);
      api.save();
    }
    sheet = "speed";
    api.repaint();
    return true;
  }
  if (act === "r5-drills") { sheet = "drills"; api.repaint(); return true; }
  if (act === "r5-seats") { sheet = "seats"; api.repaint(); return true; }
  if (act === "r5-chart-table") { chartTable = !chartTable; api.repaint(); return true; }
  if (act === "r5-htab") {
    histTab = el.dataset.tab || "session";
    if (histTab === "all" && !api.premium()) histTab = "all";
    api.repaint();
    return true;
  }
  if (act === "r5-csv") {
    if (api.premium()) api.toast(H.sessionsCsv(book.sessions).split("\n").length + " rows");
    return true;
  }
  if (act === "r5-tier") {
    const tier = Tiers.tierById(api.app, el.dataset.tier);
    const queued = Tiers.queueTier(g.rules || {}, tier, g.phase);
    api.settings.tier = tier.id;
    if (api.app === "table") {
      g.rules = queued.rules;
      g.pendingRules = queued.pending;
    } else if (g.phase === "come-out" || !g.phase) {
      g.bubbleMin = tier.min;
      g.bubbleMax = tier.max;
      g.pendingBubble = null;
    } else {
      g.pendingBubble = tier;
    }
    api.toast(queued.pending ? "Tier changes at the next come-out." : tier.name + " is on.");
    api.save();
    api.repaint();
    return true;
  }
  if (act === "r5-bank") {
    api.settings.bankPreset = Number(el.dataset.cents);
    api.toast("Reset bankroll uses " + api.money(api.settings.bankPreset) + ".");
    api.save();
    return true;
  }
  if (act === "r5-bank-custom") {
    if (!api.premium()) return true;
    const raw = Number(window.prompt("Bankroll in dollars, 100 to 100000", "1000"));
    if (!raw) return true;
    api.settings.bankPreset = Tiers.clampBankroll(raw * 100);
    api.settings.customBankroll = true;
    api.save();
    return true;
  }
  if (act === "r5-also-reset") {
    const tier = Tiers.tierById(api.app, api.settings.tier);
    const cents = api.settings.bankPreset || tier.bankroll;
    beforeReset(E.netWorth(g));
    api.resetTo(cents);
    return true;
  }
  if (act === "r5-field") {
    const pay = Number(el.dataset.pay);
    if (pay === 3 && !api.premium()) { api.toast("Field 12 at 3 to 1 is Premium."); return true; }
    api.settings.field12 = pay === 3 ? 3 : 2;
    if (g.rules) g.rules.field12 = api.settings.field12;
    g.fieldPays = { field2: api.settings.field2 === 3 ? 3 : 2, field12: api.settings.field12 };
    api.save();
    api.repaint();
    return true;
  }
  if (act === "r5-odds") {
    const odds = el.dataset.odds;
    if (odds !== "345" && !api.premium()) return true;
    if (g.rules) g.rules.oddsPreset = odds;
    api.settings.odds = odds;
    api.save();
    api.repaint();
    return true;
  }
  if (act === "r5-point") {
    api.settings.includePoint = !!el.checked;
    api.save();
    api.repaint();
    return true;
  }
  if (act === "r5-face") {
    if (!yd) return true;
    if (!yd.draft) yd.draft = { d1: 0, d2: 0 };
    const which = el.dataset.die === "d2" ? "d2" : "d1";
    yd.draft[which] = Number(el.dataset.n);
    if (yd.draft.d1 && yd.draft.d2) yd.pending = YD.pairFromFaces(yd.draft.d1, yd.draft.d2);
    api.repaint();
    return true;
  }
  if (act === "r5-your-dice") {
    if (g.hand && g.hand.rolls) { api.toast(YD.blockReason(g.hand.rolls)); return true; }
    if (api.seatsOn && api.seatsOn()) { api.toast("Your Dice is solo only."); return true; }
    rngSnap = { game: structuredClone(g), rail: api.getRail() ? structuredClone(api.getRail()) : null };
    const fresh = E.createGame({
      profile: api.app === "table" ? "table" : "bubble",
      mode: g.mode,
      bankroll: E.STARTING_BANKROLL,
      rules: g.rules || undefined,
    });
    fresh.fieldPays = g.fieldPays || null;
    api.setGame(fresh);
    if (api.setRail) api.setRail(null);
    yd = YD.freshMode(E.STARTING_BANKROLL);
    sheet = "";
    if (api.onEnter) api.onEnter();
    api.repaint();
    return true;
  }
  if (act === "r5-leave") {
    if (book.yourLive) book = H.closeLive(book, "end", true);
    if (rngSnap) {
      api.setGame(rngSnap.game);
      if (rngSnap.rail && api.setRail) api.setRail(rngSnap.rail);
    }
    rngSnap = null;
    yd = null;
    persist();
    api.repaint();
    return true;
  }
  if (act === "r5-pair") {
    if (!yd) return true;
    yd.pending = YD.pairFromFaces(el.dataset.d1, el.dataset.d2);
    api.repaint();
    return true;
  }
  if (act === "r5-undo") {
    if (yd && yd.undo) {
      api.setGame(yd.undo);
      yd.undo = null;
      api.toast("Last entered roll undone.");
      api.repaint();
    }
    return true;
  }
  if (act === "r5-paste") {
    const text = window.prompt("Paste rolls, like 6-4, 3-3, 5-2", "");
    if (text && yd) yd.queue = YD.parseSequence(text);
    if (yd && yd.queue.length) {
      yd.pending = yd.queue.shift();
      api.toast(yd.queue.length + " rolls waiting.");
    }
    api.repaint();
    return true;
  }
  if (act === "r5-quick") {
    const name = el.dataset.quick;
    const chip = api.settings.chip || (api.app === "table" ? 1000 : 500);
    const min = betUnit(g);
    const stake = stakeMap(g);
    const res = QB.post(g, name, { chip, tableMin: min, point: g.point, includePoint: !!api.settings.includePoint, have: stake.have, amounts: stake.amounts });
    if (!res.ok) api.toast(res.error);
    else {
      api.setGame(res.state);
      if (api.sync) api.sync();
      api.toast(name.toUpperCase() + " " + api.money(res.plan.total));
    }
    api.repaint();
    return true;
  }
  if (act === "r5-drill-go") {
    const level = el.dataset.level || "rookie";
    if (level === "boxman" && !api.premium()) return true;
    const items = el.dataset.drill === "D7" ? Dr.payTheRoll(api.app) : Dr.roundOf(api.app, level, 7);
    drill = { level, items, i: 0, correct: 0, typed: "", why: "", drill: el.dataset.drill || "" };
    api.repaint();
    return true;
  }
  if (act === "r5-answer" || act === "r5-pay") {
    if (!drill) return true;
    const item = drill.items[drill.i];
    const cents = act === "r5-pay" ? Math.round(Number(String(drill.typed).replace(/[^0-9.]/g, "")) * 100) : Number(el.dataset.cents);
    const right = cents === item.answer;
    if (right) drill.correct += 1;
    drill.why = right ? "" : item.why + " It's " + Dr.formatAnswer(item.answer) + ".";
    drill.i += 1;
    drill.typed = "";
    if (drill.i >= 10) {
      const key = Dr.KEY(api.app);
      let store = {};
      try { store = JSON.parse(localStorage.getItem(key) || "{}"); } catch { store = {}; }
      const gscore = Dr.grade(drill.level, drill.correct);
      store.best = Math.max(store.best || 0, gscore.score);
      localStorage.setItem(key, JSON.stringify(store));
      const onlyD7 = drill.items.every((item) => item.drill === "D7");
      if (gscore.perfect && onlyD7 && api.noteBadge) {
        api.noteBadge({ type: "drill", drill: "D7", perfect: true, level: drill.level, correct: drill.correct });
      }
    }
    api.repaint();
    return true;
  }
  if (act === "r5-key") {
    if (!drill) return true;
    if (el.dataset.key === "⌫") drill.typed = (drill.typed || "").slice(0, -1);
    else drill.typed = (drill.typed || "") + el.dataset.key;
    api.repaint();
    return true;
  }
  if (act === "r5-drill-end") { drill = null; api.repaint(); return true; }
  if (act === "r5-seats-start") {
    seats = { names: ["Seat 1", "Seat 2"], shooter: 0, lines: [], table: null };
    import("./table-mp.mjs").then((MP) => {
      seats.table = MP.createTable({ seats: 2, names: seats.names });
      seats.shooterName = MP.shooterName(seats.table);
      api.repaint();
    });
    api.repaint();
    return true;
  }
  if (act === "r5-seats-roll") {
    if (!seats || !seats.table) return true;
    import("./table-mp.mjs").then((MP) => {
      const dice = E.rollDice();
      const played = MP.playRoll(seats.table, dice.d1, dice.d2);
      seats.lines = played.lines.concat([played.result]);
      seats.shooterName = MP.shooterName(seats.table);
      api.repaint();
    });
    return true;
  }
  return true;
}

export function noteEntered(state) {
  if (!yd) return;
  yd.undo = state;
  yd.recent = [{ d1: state.lastDice && state.lastDice.d1, d2: state.lastDice && state.lastDice.d2 }].concat(yd.recent).slice(0, 8);
}

export function menuButtons() {
  const row = (act, label) => "<button type='button' class='r5-row' data-act='" + act + "'>" + label + "</button>";
  return row("r5-history", "Sessions") +
    row("r5-rules", "Table rules") +
    row("r5-speed", "Roll speed") +
    row("r5-drills", "Payout drills") +
    row("r5-your-dice", "Enter your own dice") +
    (api.app === "table" ? row("r5-seats", "Pass and play") : "");
}
