import * as E from "./engine.mjs";
import * as S from "./strategies.mjs";
import * as F from "./fair.mjs";
import * as A from "./audio.mjs";
import * as L from "./leaderboard.mjs";
import * as B from "./badges.mjs";
import * as Sess from "./session.mjs";
import { resolveSwipe } from "./swipe.mjs";
import { chipSrc as sharedChipSrc, chipPng as sharedChipPng, breakChips as sharedBreak } from "./chips.mjs";
import { TEST_BUILD } from "./build-flags.mjs";
import { celebratePoint, cancelCelebration } from "./point-celebration.mjs";
import { cancelMoments, showPSO } from "./pso.mjs";
import { celebrationCopy, celebrationTier } from "./point-tier.mjs";
import * as Lg from "bb-lingo";
import * as LC from "./lingo-ctrl.mjs";
import { callButton, learnRowHTML } from "./lingo-view.mjs";
import { rotateGateHTML } from "./rotate.mjs";
import * as R5 from "./r5-ui.mjs";
import * as RS from "./roll-speed.mjs";
import { pageForLink } from "./board-page.mjs";
import { RULE0_LINE, NO_ROLL } from "./table-rules.mjs";
import { deckFor, nudgeFor, nextSessionTip, ETIQUETTE, ETIQUETTE_FOOTER } from "./etiquette.mjs";

const STORE = "bb-bubble-craps-v1";
const FACE_ROT = {
  1: "rotateX(0deg) rotateY(0deg)",
  2: "rotateX(0deg) rotateY(-90deg)",
  3: "rotateX(-90deg) rotateY(0deg)",
  4: "rotateX(90deg) rotateY(0deg)",
  5: "rotateX(0deg) rotateY(90deg)",
  6: "rotateX(0deg) rotateY(180deg)",
};
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

const settings = {
  sound: true,
  haptics: true,
  autoRoll: false,
  autoInterval: 15,
  badgeToasts: true,
  lossLimit: { kind: "off", amount: 2500, pct: 25 },
  winGoal: { kind: "off", amount: 2500, pct: 25 },
  workingComeOut: false,
  hardwaysComeOut: true,
  comeOddsOff: true,
  showDice: false,
  tutorTrack: "beginner",
  tutorOn: true,
  reduced: false,
  chip: 500,
  blazing: true,
  autoPress: "off",
  autoPressMax: 3,
  seenBlaze: {},
  lingoLinks: true,
  rollSpeed: "normal",
  tier: "standard",
  includePoint: false,
  field12: 2,
  field2: 2,
};
let game = E.createGame();
let view = "home";
let lingo = LC.freshLingo();
let lastRoll = null;
let swallowLingo = false;
let lingoOrigin = null;
function betSpot(node) {
  const hold = node && node.closest ? node.closest("[data-act='bet']") : null;
  if (!hold || hold.closest("[data-act='roll'], [data-act='press'], [data-act='power']")) return null;
  return hold;
}
function openLingoFrom(el) {
  lingoOrigin = LC.originSelector(el);
  lingo.sheet = LC.spotFromEl(el);
  lingo.confirm = false;
  lingo.why = false;
  lingo.peekId = null;
  swallowLingo = true;
  paint();
  const term = Lg.termForSpot(lingo.sheet, "bubble");
  if (term) watchLingo(term.id);
  LC.focusSheet();
}
let page = 1;
let betTab = "place";
let learnFilter = "all";
let fairScope = "session";
let rolling = false;
let timerRAF = 0;
let timerStart = 0;
let toastTimer = 0;
let returnPage = 1;
let sessionRolls = [];
let allRolls = [];
let tutorStep = 0;
let tour = false;
let mutedTips = {};
let seenTips = {};
let lastNet = 0;
let swallowClick = false;
let premiumSet = "regular";
let premiumPreset = "Standard";
let betsOpen = false;
let sideFocus = null;
let coachOn = false;
let celeTimer = 0;
const boardStore = L.browserStore();
let boardData = L.emptyData();
let boardMode = "regular";
let boardScope = "week";
let pendingRecord = null;
let autoPause = "";
let emptyFelt = 0;
let limitHold = false;
let badgeFilter = "all";
let handMeta = { id: 0, startedAt: 0, betRolls: 0, topTier: "cold", points: [], sources: {} };
let badgeQueue = [];
let badgeTimer = 0;
let recordTimer = 0;

const app = document.getElementById("app");
const reducedMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

function load() {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.settings) Object.assign(settings, data.settings);
    if (Array.isArray(data.allRolls)) allRolls = data.allRolls.slice(-8000);
    if (data.game && data.game.bets && data.game.bets.hops) {
      game = data.game;
      game.placeWorkingOnComeOut = !!settings.workingComeOut;
      game.hardwaysWorkingOnComeOut = true;
      game.comeOddsOffOnComeOut = true;
      if (!game.billyMark) game.billyMark = { place: {}, buy: {} };
      if (!game.autoPress) game.autoPress = { mode: "off", max: 3, counts: {} };
    }
  } catch {
    /* keep defaults */
  }
}

function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify({
      settings,
      game,
      allRolls: allRolls.slice(-8000),
    }));
  } catch {
    /* quota */
  }
}
function saveBoard() {
  try { L.writeStore(boardStore, boardData); }
  catch { /* quota */ }
}
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function money(c) { return E.formatMoney(c); }
function haptic(pattern) {
  if (!settings.haptics || !navigator.vibrate) return;
  navigator.vibrate(pattern);
}
function motionOff() { return settings.reduced || reducedMQ.matches; }

function chipSrc(cents, mark) {
  return sharedChipSrc(cents, mark, "assets/chips/");
}
function chipPng(cents) {
  return sharedChipPng(cents, "assets/chips/");
}
function chipHTML(cents) {
  return '<img alt="" width="36" height="36" src="' + chipPng(cents) + '">';
}
function breakChips(cents, cap) {
  return sharedBreak(cents, cap);
}
function chipStack(cents) {
  if (!cents) return "";
  const chips = breakChips(cents, 3);
  if (!chips.length) return "";
  return "<span class='stack' aria-hidden='true'>" + chips.map((c, i) =>
    "<img alt='' src='" + chipPng(c) + "' style='--i:" + i + "'>").join("") + "</span>";
}
const ADJ = { 1: [2, 3], 2: [6, 3], 3: [1, 2], 4: [1, 5], 5: [1, 3], 6: [2, 4] };
function pipGrid(face) {
  const on = PIPS[face] || [];
  let html = "";
  for (let i = 0; i < 9; i++) html += "<i class='pip" + (on.includes(i) ? " on" : "") + "'></i>";
  return html;
}
function dieImg(face, id) {
  const f = face || 1;
  const idAttr = id ? " id='" + id + "'" : "";
  return "<img class='die3d' " + idAttr + " data-face='" + f + "' alt='Die showing " + f + "' width='74' height='74' src='assets/dice/die3d-top" + f + "@2x.webp'>";
}
function paintDie(el, face) {
  const f = face || 1;
  el.src = "assets/dice/die3d-top" + f + "@2x.webp";
  el.dataset.face = String(f);
  el.alt = "Die showing " + f;
}
function miniDie(face) {
  return '<div class="mini-die" aria-hidden="true">' + pipGrid(face) + "</div>";
}
function dieFace(n, px) {
  const f = n >= 1 && n <= 6 ? n : 1;
  return "<img class='dieface' width='" + px + "' height='" + px + "' src='assets/dice/faces/face-" + f + ".svg' alt=''>";
}
function diceReadout(d1, d2, size, opts) {
  opts = opts || {};
  const px = size || 16;
  const total = d1 + d2;
  const hard = d1 === d2;
  let label = (opts.aria) || (game.lastDice && game.lastDice.d1 === d1 && game.lastDice.d2 === d2 && game.lastDice.aria) || "";
  if (!label) {
    const cap = E.rollCaption(d1, d2);
    label = cap.aria;
  }
  if (opts.sevenOut) label += ", seven out";
  let extra = "";
  if (opts.tag !== false) extra += "<b class='readbadge" + (total === 7 ? " seven" : "") + "'>" + total + "</b>";
  const showHard = opts.hardTag && hard && (total === 4 || total === 6 || total === 8 || total === 10);
  if (showHard) extra += "<b class='hardtag'>Hard " + total + "</b>";
  else if (opts.call) {
    const term = opts.roll && settings.lingoLinks !== false ? Lg.callTerm(opts.roll, "bubble") : null;
    extra += term ? callButton(opts.call, term, term.srLabel) : "<span class='readcall'>" + esc(opts.call) + "</span>";
  }
  return "<span class='readout s" + px + "' style='--die:" + px + "px' role='img' aria-label='" + esc(label) + "'>" +
    dieFace(d1, px) + dieFace(d2, px) + extra + "</span>";
}
function rollTiles(list, opts) {
  opts = opts || {};
  const limit = opts.limit || 20;
  const src = list || [];
  const arr = opts.newestFirst ? src.slice(0, limit).reverse() : src.slice(-limit);
  return arr.map((h, i) => {
    const total = h && h.total != null ? h.total : h;
    const last = opts.markLatest && i === arr.length - 1;
    const d1 = h && h.d1;
    const d2 = h && h.d2;
    if (d1 == null || d2 == null) {
      return "<span class='rchip" + (total === 7 ? " seven" : "") + (last ? " latest" : "") + "'>" + total + "</span>";
    }
    const cap = E.rollCaption(d1, d2);
    const label = cap.aria + (h.result === "seven-out" ? ", seven out" : "");
    const cls = "rolltile" + (total === 7 ? " seven" : "") + (last ? " latest" : "") + (d1 === d2 ? " dbl" : "");
    return "<button type='button' class='" + cls + "' data-act='last20' aria-label='" + esc(label) + "'>" +
      dieFace(d1, 14) + dieFace(d2, 14) + "<b>" + total + "</b></button>";
  }).join("");
}
function last20Sheet() {
  const rows = (game.history || []).slice(0, 20);
  const tiles = rows.map((h) => diceReadout(h.d1, h.d2, 20, { sevenOut: h.result === "seven-out", aria: E.rollCaption(h.d1, h.d2).aria })).join("");
  openSheet("<h2>Last 20</h2><div class='last20'>" + (tiles || "<p>No rolls yet.</p>") + "</div><div class='actions'><button class='go' data-act='close'>Close</button></div>");
}
let numBet = (() => { try { return localStorage.getItem("bb-numbet") || "place"; } catch { return "place"; } })();   // board fix: what a tap on a number does
function faceWord(n) {
  return String(n);   // R15-10: digits 6/9 on both boards (the words cannot reach 20px at 375 in a Crapless box)
}
function edgeTone(n) {
  if (n <= 2) return "good";
  if (n <= 5) return "mid";
  return "bad";
}
function edgeChip(n) {
  const num = typeof n === "number" ? n : Number(String(n).replace("%", ""));
  if (!Number.isFinite(num)) return "";
  return "<span class='edgechip " + edgeTone(num) + "'>" + num + "%</span>";
}
function stakeOf(spot) {
  const b = game.bets;
  if (spot.kind === "repeater") return b.repeaters[spot.number] || 0;
  if (spot.kind === "hop") return b.hops[spot.pair] || 0;
  return 0;
}
function focusBet(same) {
  if (!sideFocus) { toast("Tap a repeater or a hop first."); return; }
  const stake = stakeOf(sideFocus);
  const ds = Object.assign({}, sideFocus);
  if (same && stake) ds.amount = stake;
  addBet(ds);
}
function focusTake() {
  if (!sideFocus) { toast("Tap a repeater or a hop first."); return; }
  takeBet(sideFocus);
}
function liveSideCount() {
  const reps = Object.keys(game.bets.repeaters).filter((n) => game.bets.repeaters[n] > 0).length;
  const hops = Object.keys(game.bets.hops).filter((k) => game.bets.hops[k] > 0).length;
  return reps + hops;
}
function heaterHTML(wide) {
  if (settings.blazing === false) return "";
  const tier = E.blazingTier(E.blazingScore(game.hand), game.hand.points);
  const filled = tier === "cold" ? 1 : tier === "warm" ? 2 : tier === "hot" ? 3 : 4;
  const note = E.countPhrase(game.hand.rolls, "roll") + " · " + E.countPhrase(game.hand.points, "pt", "pts");
  return "<div class='heater " + tier + (wide ? " wide" : " compact") + "' title='Cosmetic meter. Dice have no memory.'>" +
    "<img src='assets/icons/blazing-flame.svg' alt='' width='15' height='15'><b>" + tier.toUpperCase() + "</b>" +
    (wide ? "<small>" + note + "</small>" : "") + "<span class='segs'>" +
    [0, 1, 2, 3].map((i) => "<i" + (i < filled ? " class='on'" : "") + "></i>").join("") +
    "</span></div>";
}
function stakeLabel(cents) {
  return cents ? chipStack(cents) + '<span class="amt">' + money(cents) + "</span>" : "";
}

function mount() {
  app.innerHTML = `
    <h1 class="sr">Billy Bubs Bubble Craps</h1>
    <header class="hud" id="hud"></header>
    <div class="toast" id="toast" role="status"></div>
    <div class="stage" id="stage"><div class="pager" id="pager"></div><div id="betsheet"></div></div>
    <div class="dots" id="dots"></div>
    <div class="dock" id="dock"></div>
    <main class="panel hidden" id="panel"></main>
    <nav class="tabs" id="tabs" aria-label="Sections"></nav>
    <p class="legal">18+ · Practice only · No real money</p>
    ${rotateGateHTML()}
    <div id="overlay"></div>
  `;
  app.addEventListener("click", onClick);
  app.addEventListener("contextmenu", (e) => {
    const hold = betSpot(e.target);
    if (!hold) return;
    e.preventDefault();
    openLingoFrom(hold);
  });
  app.addEventListener("input", (e) => {
    if (!e.target || !e.target.dataset || e.target.dataset.act !== "lingo-q") return;
    lingo.query = e.target.value;
    const pos = e.target.selectionStart;
    paint();
    const again = document.querySelector("[data-act='lingo-q']");
    if (again) { again.focus(); if (pos != null) again.setSelectionRange(pos, pos); }
  });
  addEventListener("keydown", (e) => {
    if (LC.lingoKey(e) && !e.target.closest("input, textarea")) {
      const hold = betSpot(document.activeElement);
      if (hold) { e.preventDefault(); openLingoFrom(hold); return; }
    }
    if (e.key !== "Escape") return;
    if (!lingo.sheet && !lingo.peekId && view !== "lingo") return;
    const back = lingoOrigin;
    lingo.sheet = null;
    lingo.peekId = null;
    lingoOrigin = null;
    if (view === "lingo") view = "learn";
    watchLingo("");
    paint();
    LC.focusOrigin(back);
  });
  const diceHost = document.createElement("div");
  diceHost.id = "dice-row";
  diceHost.className = "dice-live";
  diceHost.hidden = true;
  document.body.appendChild(diceHost);
  window.addEventListener("resize", () => { placeDice(); fitFelt(); measureChrome(); });
  document.body.addEventListener("click", (e) => {
    if (e.target.closest("#record")) onClick(e);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && settings.autoRoll) {
      autoPause = "away";
      stopTimer();
      paint();
    }
  });
  window.addEventListener("pagehide", () => {
    if (settings.autoRoll) { autoPause = "away"; stopTimer(); }
  });
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => { fitFelt(); measureChrome(); placeDice(); });
    const stageEl = document.getElementById("stage");
    const dockEl = document.getElementById("dock");
    if (stageEl) ro.observe(stageEl);
    if (dockEl) ro.observe(dockEl);
  }
  const stageEl = document.getElementById("stage");
  if (stageEl) stageEl.addEventListener("scroll", () => placeDice(), true);
  const stage = document.getElementById("stage");
  stage.addEventListener("transitionend", (e) => {
    if (e.target && e.target.id === "pager") placeDice();
  });
  let sx = 0;
  let sy = 0;
  let dx = 0;
  let dy = 0;
  let tracking = false;
  let fromButton = false;
  let captured = false;
  stage.addEventListener("pointerdown", (e) => {
    swallowClick = false;
    if (e.button != null && e.button !== 0) return;
    const hold = e.target.closest("[data-act='bet']");
    if (hold && !e.target.closest("[data-act='roll'], [data-act='press'], [data-act='power']")) {
      const x0 = e.clientX;
      const y0 = e.clientY;
      let moved = false;
      const timer = setTimeout(() => {
        if (moved) return;
        openLingoFrom(hold);
      }, 500);
      const move = (ev) => {
        if (Math.hypot(ev.clientX - x0, ev.clientY - y0) >= 10) { moved = true; clearTimeout(timer); }
      };
      const stop = () => { clearTimeout(timer); hold.removeEventListener("pointermove", move); };
      hold.addEventListener("pointermove", move);
      hold.addEventListener("pointerup", stop, { once: true });
      hold.addEventListener("pointercancel", stop, { once: true });
    }
    tracking = true;
    captured = false;
    fromButton = !!e.target.closest("button, a, input, [data-act]");
    sx = e.clientX;
    sy = e.clientY;
    dx = 0;
    dy = 0;
  });
  stage.addEventListener("pointermove", (e) => {
    if (!tracking) return;
    dx = e.clientX - sx;
    dy = e.clientY - sy;
    if (!captured && Math.abs(dx) >= 12 && Math.abs(dx) > Math.abs(dy)) {
      try { stage.setPointerCapture(e.pointerId); } catch { /* already gone */ }
      captured = true;
    }
    if (motionOff()) return;
    if (Math.abs(dx) < 12 || Math.abs(dx) <= Math.abs(dy)) return;
    const pager = document.getElementById("pager");
    if (!pager) return;
    pager.style.transition = "none";
    pager.style.transform = "translateX(calc(" + (-page * 100 / 3) + "% + " + dx + "px))";
  });
  stage.addEventListener("pointerup", (e) => {
    if (!tracking) return;
    tracking = false;
    captured = false;
    try { stage.releasePointerCapture(e.pointerId); } catch { /* not captured */ }
    const next = resolveSwipe(page, dx, dy);
    const moved = next !== page;
    if (moved && fromButton) {
      swallowClick = true;
      setTimeout(() => { swallowClick = false; }, 400);
    }
    page = next;
    dx = 0;
    dy = 0;
    snap();
    if (moved) {
      paint();
      if (page === 0 && settings.tutorOn && !seenTips.side && !mutedTips.side) {
        seenTips.side = true;
        toast("Side bets are one swipe left: Repeaters, hops, Horn, Any Craps, and C&E.");
      }
    }
  });
  stage.addEventListener("pointercancel", () => { tracking = false; captured = false; snap(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" && !e.target.closest("input")) { page = Math.min(2, page + 1); snap(); paint(); }
    if (e.key === "ArrowLeft" && !e.target.closest("input")) { page = Math.max(0, page - 1); snap(); paint(); }
    if (e.key === " " && view === "play" && !rolling && !e.target.closest("input")) { e.preventDefault(); doRoll(); }
    if (e.key === "Backspace" && e.target.classList && e.target.classList.contains("init") && !e.target.value) {
      const prev = e.target.previousElementSibling;
      if (prev && prev.classList.contains("init")) { prev.focus(); prev.value = ""; e.preventDefault(); }
    }
    if (e.key === "Enter" && pendingRecord && e.target.closest(".recordcard")) { e.preventDefault(); savePending(false); }
  });
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (!el.classList || !el.classList.contains("init")) return;
    el.value = el.value.replace(/[^A-Za-z]/g, "").slice(-1).toUpperCase();
    if (el.value && el.nextElementSibling && el.nextElementSibling.classList.contains("init")) el.nextElementSibling.focus();
  });
  paint();
}

function snap() {
  const pager = document.getElementById("pager");
  const stage = document.getElementById("stage");
  if (stage) stage.dataset.page = String(page);
  if (!pager) return;
  const target = "translateX(" + (-page * 100 / 3) + "%)";
  if (motionOff()) {
    pager.style.transition = "none";
    pager.style.transform = target;
    return;
  }
  // The pager starts at translateX(0). Animating the first jump to the board
  // leaves the felt half off-screen for the whole 0.28s ease, so a swipe that
  // starts on the Field misses. Place that first frame instantly; later snaps
  // (a finished swipe, a dot tap) still ease.
  if (!pager.style.transform) {
    pager.style.transition = "none";
    pager.style.transform = target;
    void pager.offsetWidth;
    pager.style.transition = "";
    return;
  }
  pager.style.transition = "";
  pager.style.transform = target;
}

function noteLingo(id) {
  const noted = B.noteAction(boardData, { type: "lingo", id, mode: game.mode, now: Date.now() });
  boardData.badges = noted.store.badges;
  boardData.progress = noted.store.progress;
  if (noted.store.daily) boardData.daily = noted.store.daily;
  saveBoard();
}
function watchLingo(id) {
  LC.armDwell(lingo, id, noteLingo);
}
let lingoHl = "";
function showOnBoard(id) {
  const term = Lg.termById(id, "bubble");
  const target = LC.boardTarget(term, "bubble", game.mode);
  lingo.sheet = null;
  lingo.peekId = null;
  view = "play";
  if (!target.ok) { lingoHl = ""; toast(target.reason); paint(); return; }
  const sel = LC.spotSelector(target.link, "bubble");
  const dest = pageForLink(target.link, "bubble");
  if (dest != null) page = dest;
  else if (target.link !== "ui:rail") page = 1;
  lingoTutor = term;
  lingoHl = sel || "";
  const pagerEl = document.getElementById("pager");
  if (pagerEl) pagerEl.style.transform = "";
  paint();
  snap();
  const nodes = [...document.querySelectorAll(sel)];
  const el = nodes.find((n) => n.getBoundingClientRect().width > 0) || nodes[0] || null;
  if (el) {
    const scroller = el.closest(".page.side");
    if (scroller) {
      const sr = scroller.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      if (er.top < sr.top + 8 || er.bottom > sr.bottom - 140) {
        scroller.scrollTop = Math.max(0, scroller.scrollTop + (er.top - sr.top) - 16);
      }
    }
    el.classList.add("lingo-hl");
    if (motionOff()) setTimeout(() => { lingoHl = ""; el.classList.remove("lingo-hl"); }, 1500);
  } else {
    lingoHl = "";
    toast(target.reason || "That spot isn't on this board.");
  }
  openTutor(0, "show");
}
function mountLingo() {
  if (view !== "play") return;
  const stage = document.getElementById("stage");
  if (!stage) return;
  let host = document.getElementById("lingo-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "lingo-host";
    stage.appendChild(host);
  }
  host.innerHTML = LC.peekBlock("bubble", lingo, "assets/", game.mode) + LC.sheetBlock("bubble", lingo, game, { asset: "assets/", rolling, money, tutorOn: settings.tutorOn, mode: game.mode });
}
function onClick(e) {
  if (swallowLingo) {
    swallowLingo = false;
    if (e.target.closest("[data-act='bet']")) return;
  }
  if (swallowClick) { swallowClick = false; return; }
  if (betsOpen && e.target.closest(".felt") && !e.target.closest(".betpanel")) {
    betsOpen = false;
    paint();
    return;
  }
  const t = e.target.closest("[data-act]");
  if (!t || t.disabled) return;
  A.unlock();
  A.setMuted(!settings.sound);
  const act = t.dataset.act;
  if (R5.handle(act, t)) return;
  if (act === "hops") return;
  if (act === "lingo" || act === "lingo-open" || act === "lingo-row") {
    if (t.dataset.id) lingo.cardId = t.dataset.id;
    lingo.peekId = null;
    lingo.sheet = null;
    setView("lingo");
    if (lingo.cardId) watchLingo(lingo.cardId);
    return;
  }
  if (act === "lingo-close") { lingo.cardId = null; watchLingo(""); setView("learn"); return; }
  if (act === "lingo-cat") { lingo.category = t.dataset.cat || "all"; paint(); return; }
  if (act === "lingo-peek") {
    lingo.peekId = t.dataset.id;
    LC.rememberCall(lingo, t.dataset.id);
    paint();
    watchLingo(t.dataset.id);
    return;
  }
  if (act === "peek-close") { lingo.peekId = null; watchLingo(""); paint(); return; }
  if (act === "sheet-close") {
    if (e.target.closest(".lingo-sheet") && !e.target.closest(".lingo-grab, .lingo-x")) return;
    const back = lingoOrigin;
    lingo.sheet = null;
    lingo.confirm = false;
    lingoOrigin = null;
    watchLingo("");
    paint();
    LC.focusOrigin(back);
    return;
  }
  if (act === "lingo-why") { lingo.why = !lingo.why; paint(); return; }
  if (act === "lingo-show") { showOnBoard(t.dataset.id); return; }
  if (act === "lingo-take") {
    if (!lingo.sheet) return;
    const probe = E.removeBet(game, lingo.sheet);
    if (probe.needsConfirm && !t.dataset.confirm) { lingo.confirm = true; paint(); return; }
    const res = E.removeBet(game, lingo.sheet, null, { confirm: true });
    if (res.ok) { game = res.state; lingo.sheet = null; lingo.confirm = false; A.chip(); }
    else toast(res.error || "");
    save();
    paint();
    return;
  }
  if (act === "view") {
    if (t.dataset.view === "play" && view === "fair") page = 2;
    setView(t.dataset.view);
    return;
  }
  if (act === "page") { page = Number(t.dataset.page); snap(); paint(); return; }
  if (act === "play") { startMode(t.dataset.mode || "regular"); return; }
  if (act === "mode") { switchMode(t.dataset.mode); return; }
  if (act === "chip") { settings.chip = Number(t.dataset.cents); haptic(8); A.chip(); save(); paint(); return; }
  if (act === "numbet") { if (t.disabled) return; numBet = t.dataset.mode; localStorage.setItem("bb-numbet", numBet); haptic(8); paint(); return; }
  if (act === "bet") { addBet(t.dataset); return; }
  if (act === "take") { takeBet(t.dataset); return; }
  if (act === "roll") { doRoll(); return; }
  if (act === "press") { doPress(); return; }
  if (act === "power") { doPower(); return; }
  if (act === "undo") {
    if (rolling) return;
    const r = E.undoPress(game);
    if (r.ok) {
      game = r.state;
      const noted = B.noteAction(boardData, { type: "undo", mode: game.mode, now: Date.now() });
      boardData.badges = noted.store.badges;
      boardData.progress = noted.store.progress;
      if (noted.unlocked.length) queueUnlocks(noted.unlocked);
      A.chip();
    }
    save();
    paint();
    return;
  }
  if (act === "clear") {
    if (rolling) return;
    const r = E.clearPress(game);
    if (r.ok) {
      game = r.state;
      const noted = B.noteAction(boardData, { type: "undo", mode: game.mode, now: Date.now() });
      boardData.badges = noted.store.badges;
      boardData.progress = noted.store.progress;
      if (noted.unlocked.length) queueUnlocks(noted.unlocked);
    }
    save();
    paint();
    return;
  }
  if (act === "betsoff") { game = E.setBetsOff(game, !game.betsOff); toast(game.betsOff ? "Bets Off. Place and Buy sit out." : "Bets on. Place and Buy are working."); save(); paint(); return; }
  if (act === "billy") { doBilly(); return; }
  if (act === "billy-down") { doBillyDown(); return; }
  if (act === "reset") { game = E.resetLayout(game); toast("Bets returned to your practice chips."); save(); paint(); return; }
  if (act === "tab") {
    if (t.dataset.tab === "repeaters") { page = 0; snap(); paint(); return; }
    betTab = t.dataset.tab;
    paint();
    return;
  }
  if (act === "toast-go") { page = 2; hideToast(); snap(); paint(); return; }
  if (act === "last20") { last20Sheet(); return; }
  if (act === "tutor") { openTutor(t.dataset.step ? Number(t.dataset.step) : tutorStep); return; }
  if (act === "tips") {
    settings.tutorOn = !settings.tutorOn;
    save();
    paint();
    toast(settings.tutorOn ? "Billy Tips on" : "Billy Tips off");
    return;
  }
  if (act === "bets") { betsOpen = !betsOpen; paint(); return; }
  if (act === "same" || act === "addchip") { focusBet(act === "same"); return; }
  if (act === "takedown") { focusTake(); return; }
  if (act === "autoswipe") { settings.showDice = !settings.showDice; save(); paint(); return; }
  if (act === "tour") { tour = true; tutorStep = 0; startMode(game.mode || "regular"); openTutor(0); return; }
  if (act === "billy-help") { openSheet(billyHelp()); return; }
  if (act === "close") { closeOverlay(); return; }
  if (act === "gotit") { advanceTutor(); return; }
  if (act === "why") { openSheet(whySheet()); return; }
  if (act === "mute-tip") { mutedTips[currentTip().id] = true; save(); closeOverlay(); return; }
  if (act === "auto-press") {
    const was = settings.autoPress;
    settings.autoPress = t.dataset.mode;
    syncAutoPress();
    save();
    paint();
    if (was === "off" && settings.autoPress !== "off" && !seenTips.autopress) {
      seenTips.autopress = true;
      openSheet("<h2>Auto-press</h2><p>After a Billy's Way hit it adds to that number, up to your max. Same odds, more at risk. A seven-out starts the count over. The B5 coach uses this same control and stops after three lost opening spreads. Edge stays 1.52%.</p><div class='actions'><button class='go' data-act='close'>Got it</button></div>");
    }
    return;
  }
  if (act === "auto-max") {
    settings.autoPressMax = Math.min(5, Math.max(1, (settings.autoPressMax || 3) + Number(t.dataset.dir)));
    syncAutoPress();
    save();
    paint();
    return;
  }
  if (act === "preset") {
    premiumPreset = t.dataset.preset;
    toast("Premium · locked. The live table stays on Standard rules.");
    paint();
    return;
  }
  if (act === "ruleset") { premiumSet = t.dataset.set; paint(); return; }
  if (act === "filter") { learnFilter = t.dataset.filter; paint(); return; }
  if (act === "strategy") { runStrategy(t.dataset.id); return; }
  if (act === "strategy-level") {
    if (t.disabled) return;
    const sheet = t.closest(".sheet");
    if (!sheet) return;
    sheet.querySelectorAll("[data-act='strategy-level']").forEach((b) => b.classList.toggle("on", b === t));
    const go = sheet.querySelector("[data-act='strategy-go']");
    if (go) go.dataset.odds = t.dataset.level;
    return;
  }
  if (act === "strategy-limits") {
    const on = t.dataset.on !== "1";
    t.dataset.on = on ? "1" : "0";
    t.classList.toggle("on", on);
    return;
  }
  if (act === "strategy-go") {
    const lim = document.querySelector("[data-act='strategy-limits']");
    if (lim && lim.dataset.on === "1") applyOfferedLimits();
    const id = t.dataset.id;
    const odds = t.dataset.odds || "max";
    closeOverlay();
    beginStrategy(id, odds);
    return;
  }
  if (act === "stop-strategy") { game.strategy = null; toast("Auto-bet stopped."); save(); paint(); return; }
  if (act === "strat-odds" && game.strategy && game.strategy.id === "B13") {
    game.strategy.data.odds = t.dataset.level || "max";
    toast("Come odds: " + (game.strategy.data.odds === "max" ? "max" : game.strategy.data.odds === "flat" ? "flat" : game.strategy.data.odds + "x") + ".");
    save(); paint(); return;
  }
  if (act === "strat-cap" && game.strategy && game.strategy.id === "B13") {
    game.strategy.data.cap = Math.max(0, Math.min(5, Number(t.dataset.cap) || 0));
    toast(game.strategy.data.cap ? "Come cap: " + game.strategy.data.cap + "." : "Come bets are uncapped.");
    save(); paint(); return;
  }
  if (act === "strat-start" && game.strategy && game.strategy.id === "B14") {
    const data = game.strategy.data;
    if ((data.step || 0) > 0 || data.partial || data.across) { toast("The ladder already started. It begins again on the next point."); return; }
    data.start = t.dataset.start === "8" ? 8 : 6;
    toast("Hit and Split starts on " + data.start + ".");
    save(); paint(); return;
  }
  if (act === "strat-extend" && game.strategy && game.strategy.id === "B14") {
    game.strategy.data.extend = t.dataset.on === "1";
    toast(game.strategy.data.extend ? "Crapless extension is on." : "Crapless extension is off.");
    save(); paint(); return;
  }
  if (act === "fair-scope") { fairScope = t.dataset.scope; paint(); return; }
  if (act === "setting") { toggleSetting(t.dataset.key); return; }
  if (act === "track") {
    settings.tutorTrack = t.dataset.track;
    save();
    paint();
    if (coachOn) openTutor();
    return;
  }
  if (act === "bank-reset") { resetTable(); return; }
  if (act === "fair-reset") { allRolls = []; sessionRolls = []; toast("Fair Dice history cleared on this device."); save(); paint(); return; }
  if (act === "export") { openSheet(lockedExport()); return; }
  if (act === "for") { openSheet(forSheet()); return; }
  if (act === "confirm-take") { confirmTake(); return; }
  if (act === "premium") { setView("premium"); return; }
  if (act === "board-mode") { boardMode = t.dataset.mode === "crapless" ? "crapless" : "regular"; paint(); return; }
  if (act === "board-scope") { boardScope = t.dataset.scope === "all" ? "all" : "week"; paint(); return; }
  if (act === "save-record") { savePending(t.dataset.goto === "board"); return; }
  if (act === "skip-record") { skipPending(); return; }
  if (act === "resume") { autoPause = ""; limitHold = false; toast("Auto-roll is on."); save(); paint(); startTimer(); return; }
  if (act === "keep-playing") { limitHold = false; closeOverlay(); paint(); return; }
  if (act === "end-session") { finishSession(t.dataset.reason || "end"); return; }
  if (act === "interval") { settings.autoInterval = Number(t.dataset.sec) || 15; save(); paint(); startTimer(); return; }
  if (act === "limit-kind") { setLimitKind(t.dataset.which, t.dataset.kind); return; }
  if (act === "limit-step") { stepLimit(t.dataset.which, t.dataset.field, Number(t.dataset.dir)); return; }
  if (act === "initials-save") { saveInitials(false); return; }
  if (act === "initials-apply") { saveInitials(true); return; }
  if (act === "badge-filter") { badgeFilter = t.dataset.filter || "all"; paint(); return; }
  if (act === "badge") { openBadge(t.dataset.id); return; }
  if (act === "reset-records") { confirmResetRecords(); return; }
  if (act === "reset-records-yes") { wipeRecords(); return; }
  if (act === "etiq-next" || act === "etiq-prev" || act === "etiquette-done") {
    const deck = deckFor("bubble").all;
    const tip = deck[Math.min(etiquetteAt, deck.length - 1)];
    const noted = B.noteAction(boardData, { type: "etiquette", id: tip.id, complete: false });
    boardData.badges = noted.store.badges;
    boardData.progress = noted.store.progress;
    if (act === "etiq-prev") etiquetteAt = Math.max(0, etiquetteAt - 1);
    else if (act === "etiq-next") etiquetteAt = Math.min(deck.length - 1, etiquetteAt + 1);
    else {
      const seen = (boardData.progress && boardData.progress.etiquetteSeen) || [];
      if (seen.length < deck.length) {
        toast(seen.length + " of " + deck.length + " cards viewed.");
        paint();
        return;
      }
      const done = B.noteAction(boardData, { type: "etiquette", id: tip.id, complete: true, total: deck.length });
      boardData.badges = done.store.badges;
      boardData.progress = done.store.progress;
      if (done.unlocked.length) queueUnlocks(done.unlocked);
      toast("Table Manners" + (boardData.badges.table_manners ? " unlocked." : " noted."));
      saveBoard();
      setView("settings");
      return;
    }
    saveBoard();
    paint();
    return;
  }
}

function setView(next) {
  view = next;
  hideToast();
  if (next !== "play") stopTimer();
  else startTimer();
  paint();
}

function startMode(mode) {
  const want = mode === "crapless" ? "crapless" : "regular";
  if (game.mode !== want) {
    const res = E.switchMode(game, want);
    if (!res.ok) toast(res.error);
    else game = res.state;
  }
  view = "play";
  page = 1;
  save();
  paint();
  snap();
  startTimer();
}

function limitChip() {
  const s = boardData.session;
  if (!s || s.ended) return "";
  if (s.lossHit) return "<button class='limitchip' data-act='end-session' data-reason='end'>Past your loss limit</button>";
  if (s.winHit) return "<button class='limitchip' data-act='end-session' data-reason='end'>Win goal reached</button>";
  return "";
}
function switchMode(mode) {
  if (game.mode === mode) return;
  const res = E.switchMode(game, mode);
  if (!res.ok) { toast(res.error); return; }
  game = res.state;
  autoPause = settings.autoRoll ? "end" : "";
  emptyFelt = 0;
  if (mode === "crapless" && betTab === "lay") betTab = "place";
  toast(mode === "crapless" ? "Crapless rules. Don't bets are off. ATS stays up, and any 7 loses it." : "Regular rules.");
  save();
  paint();
}

function addBet(ds) {
  cancelMoments();
  if (rolling) return;
  const spot = spotFrom(ds);
  if (spot.kind === "dontComePoint") {
    toast("That Don't Come is already on a number. Use minus to take it down.");
    return;
  }
  let amount = ds.amount ? Number(ds.amount) : settings.chip;
  let note = "";
  if (spot.kind === "horn") {
    const posted = Math.floor(amount / 400) * 400;
    if (!posted) {
      toast("Horn is posted in $4 units. A $1 chip is short.");
      return;
    }
    if (posted !== amount) note = "Horn uses $4 units. " + money(amount - posted) + " stayed in practice chips.";
    amount = posted;
  }
  if (spot.kind === "ce") {
    const posted = Math.floor(amount / 200) * 200;
    if (!posted) {
      toast("C&E is posted in $2 units. A $1 chip is short.");
      return;
    }
    if (posted !== amount) note = "C&E uses $2 units. " + money(amount - posted) + " stayed in practice chips.";
    amount = posted;
  }
  if (spot.kind === "place" && (spot.number === 6 || spot.number === 8)) {
    const unit = 600;
    let posted = Math.floor((amount * 6) / 5 / unit) * unit;
    if (!posted) posted = unit;
    if (posted > E.TABLE_MAX) {
      posted = Math.floor(E.TABLE_MAX / unit) * unit;
      note = "Place 6 and 8 stop at " + money(posted) + ", the largest $6 unit under the $1,000 table max.";
    } else if (posted !== amount) note = "Place 6 and 8 use $6 units. Posted " + money(posted) + ".";
    const have = game.bets.place[spot.number] || 0;
    if (have + posted > E.TABLE_MAX) {
      toast("6 and 8 skipped: at table max");
      return;
    }
    amount = posted;
  }
  if (spot.kind === "repeater" || spot.kind === "hop") sideFocus = spot;
  const res = E.placeBet(game, spot, amount);
  if (!res.ok) { toast(res.error); return; }
  game = res.state;
  A.chip();
  haptic(10);
  let lesson = "";
  if (settings.tutorOn && (spot.kind === "dontPass" || spot.kind === "dontCome") && !seenTips.firstDont) {
    seenTips.firstDont = true;
    const tip = nudgeFor("first_dont", "bubble");
    if (tip) lesson = tip.billy;
  }
  if (settings.tutorOn && spot.kind === "hop" && !seenTips.hop && !mutedTips.hop) {
    seenTips.hop = true;
    lesson = "A hop is one exact pair on the next roll. A hardway stays up for the pair or a 7.";
  }
  const lead = [note, lesson].filter(Boolean).join(" ");
  const warningOn = settings.tutorOn && !mutedTips["edge-" + spot.kind];
  const line = E.tutorToastLine(spot, game.mode, settings.tutorTrack === "experienced", lead, warningOn);
  if (line) toast(line);
  if (settings.tutorOn && spot.kind === "place" && (spot.number === 2 || spot.number === 12 || spot.number === 3 || spot.number === 11) && !seenTips.b9 && !mutedTips.b9) {
    seenTips.b9 = true;
    toast("Place " + spot.number + " costs more than Buy. Open B9 in Learn for the comparison.");
  }
  save();
  paint();
  startTimer();
}

function spotFrom(ds) {
  const spot = { kind: ds.kind };
  if (ds.number) spot.number = Number(ds.number);
  if (ds.pair) spot.pair = ds.pair;
  return spot;
}

async function takeBet(ds) {
  if (rolling) return;
  const spot = spotFrom(ds);
  let res = E.removeBet(game, spot, settings.chip);
  if (res.needsConfirm) {
    window.__take = { kind: ds.kind, number: ds.number, pair: ds.pair };
    openSheet(dontWarn(res.warning));
    return;
  }
  if (!res.ok && /No bet/.test(res.error || "")) res = E.removeBet(game, spot);
  if (!res.ok) { toast(res.error); return; }
  game = res.state;
  A.chip();
  save();
  paint();
}

function confirmTake() {
  const ds = window.__take;
  closeOverlay();
  if (!ds) return;
  const res = E.removeBet(game, spotFrom(ds), null, { confirm: true });
  if (res.ok) game = res.state;
  save();
  paint();
}

function doBilly() {
  const res = E.placeBillysWay(game, settings.chip);
  game = res.state;
  if (!res.placed.length) { toast(res.skipped[0] ? res.skipped[0].reason : "Can't post Billy's Way."); return; }
  A.chip();
  haptic([10, 30, 10]);
  const skipped = res.skipped.length ? " Skipped " + res.skipped.length + "." : "";
  toast("Billy's Way posted " + res.placed.length + " bets." + skipped);
  if (settings.tutorOn) openTutor(0, "billy");
  save();
  paint();
}

function doBillyDown() {
  game = E.takeDownBillysWay(game);
  A.chip();
  toast("Billy's Way taken down.");
  save();
  paint();
}

function syncAutoPress() {
  game.autoPress = {
    mode: settings.autoPress || "off",
    max: settings.autoPressMax || 3,
    counts: (game.autoPress && game.autoPress.counts) || {},
  };
}

function doPress() {
  if (rolling) { toast("Press is available after a hit."); return; }
  const st = E.pressStatus(game);
  const res = E.press(game);
  if (!res.ok) { toast("Press: " + res.error); return; }
  const noted = B.noteAction(boardData, { type: "press", number: st.number, mode: game.mode, now: Date.now() });
  boardData.badges = noted.store.badges;
  boardData.progress = noted.store.progress;
  game = res.state;
  markB14Override(st.number);
  A.press();
  haptic(12);
  toast(res.label);
  if (settings.tutorOn) openTutor(0, "press");
  save();
  paint();
}

function doPower() {
  if (rolling) { toast("Power Press is available after a hit."); return; }
  const st = E.pressStatus(game);
  const res = E.powerPress(game);
  if (!res.ok) { toast("Power Press: " + res.error); return; }
  const noted = B.noteAction(boardData, { type: "press", number: st.number, mode: game.mode, now: Date.now() });
  boardData.badges = noted.store.badges;
  boardData.progress = noted.store.progress;
  game = res.state;
  markB14Override(st.number);
  A.press();
  haptic(16);
  const cap = res.atMax ? "Capped at $1,000. " : "";
  toast(cap + (res.label || ("Power Press +" + money(res.added) + ".")));
  if (settings.tutorOn) openTutor(0, "power");
  save();
  paint();
}

function markB14Override(number) {
  if (!number || !game.strategy || game.strategy.id !== "B14") return;
  const data = game.strategy.data || (game.strategy.data = {});
  data.override = data.override || {};
  data.override[number] = true;
}

function b13BankNeeds(mode) {
  if (mode === "crapless") return { max: 200000, "2": 125000, "1": 85000, flat: 20000 };
  return { max: 125000, "2": 75000, "1": 50000, flat: 12500 };
}
function playThisSheet(id) {
  const bank = E.netWorth(game);
  const limitsOff = !settings.lossLimit || settings.lossLimit.kind === "off" || !settings.winGoal || settings.winGoal.kind === "off";
  const limitBtn = limitsOff
    ? "<button class='on' data-act='strategy-limits' data-on='1'>Set a 40% loss limit and a 30% win goal</button>"
    : "<p>Your session limits stay as you set them.</p>";
  if (id === "B14") {
    const need = 24000;
    const short = bank < need;
    return "<h2>Play Hit and Split</h2><p>Twenty starts need " + money(need) + " ($12 a start). You have " + money(bank) + ".</p>" +
      (short ? "<p>Short of 20 starts. It still places the $12 when the chips are there.</p>" : "<p>That fits. A number you press by hand stays at your amount.</p>") +
      "<p>It stops after 6 starts lost, or at your session loss limit, whichever comes first.</p>" +
      limitBtn +
      "<div class='actions'><button data-act='close'>Not now</button><button class='go' data-act='strategy-go' data-id='B14'>Play this</button></div>";
  }
  const needs = b13BankNeeds(game.mode);
  const worst = game.mode === "crapless"
    ? { max: 23000, "2": 15000, "1": 10000, flat: 5000 }
    : { max: 15000, "2": 9000, "1": 6000, flat: 3000 };
  const prefer = game.mode === "crapless" ? "1" : "2";
  const order = ["max", "2", "1", "flat"];
  const fitting = order.filter((level) => bank >= needs[level]);
  const suggest = fitting.indexOf(prefer) >= 0 ? prefer : (fitting[0] || "flat");
  const labels = { max: "Max odds", "2": "2x", "1": "1x", flat: "Flat" };
  const buttons = order.map((level) => {
    const fit = bank >= needs[level];
    return "<button class='" + (level === suggest && fit ? "on" : "") + "'" + (fit ? "" : " disabled") +
      " data-act='strategy-level' data-level='" + level + "'>" + labels[level] +
      " · " + money(needs[level]) + " · worst " + money(worst[level]) + "</button>";
  }).join("");
  const named = suggest === "max" ? "Max odds" : suggest === "flat" ? "Flat" : suggest + "x";
  return "<h2>Play Continuous Come</h2><p>You have " + money(bank) + ". Pick an odds level that fits. The app will not lower it for you.</p>" +
    "<div class='actions'>" + buttons + "</div><p>Suggested: " + named + ".</p>" +
    "<p>Each Come bet is a new Pass Line. A new one every roll means about one flat bet per roll.</p>" +
    limitBtn +
    "<div class='actions'><button data-act='close'>Not now</button><button class='go' data-act='strategy-go' data-id='B13' data-odds='" + suggest + "'>Play this</button></div>";
}
function applyOfferedLimits() {
  const before = {
    loss: Object.assign({}, settings.lossLimit),
    win: Object.assign({}, settings.winGoal),
  };
  if (!settings.lossLimit || settings.lossLimit.kind === "off") {
    settings.lossLimit = { kind: "pct", amount: (settings.lossLimit && settings.lossLimit.amount) || 2500, pct: 40 };
  }
  if (!settings.winGoal || settings.winGoal.kind === "off") {
    settings.winGoal = { kind: "pct", amount: (settings.winGoal && settings.winGoal.amount) || 2500, pct: 30 };
  }
  const after = { loss: settings.lossLimit, win: settings.winGoal };
  if (boardData.session && !boardData.session.ended) {
    if (Sess.limitsLoosened(before, after, boardData.session)) {
      boardData.session = Sess.markLoosened(boardData.session);
    }
    boardData.session = Sess.applyLiveLimits(boardData.session, after);
  }
}
function beginStrategy(id, odds) {
  const card = S.strategyById(id);
  const data = {};
  if (id === "B13") data.odds = odds || "max";
  game.strategy = { id, rolls: 0, data };
  view = "play";
  page = 1;
  syncAutoPress();
  const res = S.autoBet(game, id, settings.chip, { count: false });
  game = res.state;
  toast(res.message || (card ? card.name : id) + " is placing bets for you. Cancel any time.");
  save();
  paint();
  startTimer();
}
function runStrategy(id) {
  const card = S.strategyById(id);
  if (!card) return;
  if (card.lesson) { openSheet("<h2>" + card.name + "</h2><p>" + card.how + "</p><div class='actions'><button class='go' data-act='close'>Got it</button></div>"); return; }
  if (card.mode !== "both" && card.mode !== game.mode) {
    toast(card.name + " is for " + card.mode + ".");
    return;
  }
  if (id === "B13" || id === "B14") {
    openSheet(playThisSheet(id));
    return;
  }
  beginStrategy(id);
}

function testRngAllowed() {
  return TEST_BUILD;
}
function autoShort() {
  if (game.bankroll <= 0 && E.tableTotal(game) === 0) return true;
  if (!(game.strategy && game.strategy.id)) return false;
  const preview = S.autoBet(structuredClone(game), game.strategy.id, settings.chip, { count: false });
  return !!preview.short;
}
async function doRoll(source) {
  if (rolling || view !== "play" || limitHold) return;
  if (source === "auto" && autoPause) return;
  if (source === "auto" && autoShort()) {
    autoPause = "short";
    toast("Auto-roll paused · not enough practice chips for your bets");
    paint();
    return;
  }
  rolling = true;
  lingo.peekId = null;
  cancelMoments();
  clearWin();
  stopTimer();
  const pointBefore = game.point;
  A.setMuted(!settings.sound);
  syncAutoPress();
  if (!R5.active()) {
    const acted = B.noteAction(boardData, { type: "roll-started" });
    boardData.badges = acted.store.badges;
    boardData.progress = acted.store.progress;
  }
  if (game.strategy && game.strategy.id) {
    const maintained = S.autoBet(game, game.strategy.id, settings.chip);
    game = maintained.state;
    if (maintained.message) toast(maintained.message);
  }
  const hadBetNow = E.hadWorkingBet(game);
  const onTable = E.tableTotal(game);
  const totalBefore = E.netWorth(game);
  ensureSession(Date.now(), totalBefore);
  const edgeCap = maxWorkingEdge(game);
  const handBefore = { rolls: game.hand.rolls, points: game.hand.points };
  const passBefore = game.bets.pass;
  const phaseBefore = game.phase;
  ensureHand(handBefore.rolls);
  R5.applyPending(game);
  game.fieldPays = { field2: settings.field2 === 3 ? 3 : 2, field12: settings.field12 === 3 ? 3 : 2 };
  let dice = null;
  const entered = R5.active();
  if (entered) {
    const pair = R5.pending();
    if (!pair) {
      rolling = false;
      toast("Enter both dice, then tap SETTLE.");
      paint();
      return;
    }
    R5.noteEntered(structuredClone(game));
    R5.consume();
    dice = pair;
  } else {
    let custom = null;
    /*TEST_HOOK_START*/
    if (TEST_BUILD && typeof window.__bbRng === "function") custom = window.__bbRng;
    delete window.__bbRng;
    /*TEST_HOOK_END*/
    dice = custom ? E.rollDice(custom) : E.rollDice();
  }
  if (!dice || !dice.d1) {
    rolling = false;
    toast((dice && dice.error) || NO_ROLL);
    paint();
    return;
  }
  const from = page;
  if (settings.showDice) { returnPage = from; page = 2; }
  paint();
  snap();
  A.pop();
  A.rattle();
  haptic(18);
  if (entered) await wait(RS.diceMs("instant", motionOff()));
  else await animateDice(dice);
  const settled = E.settle(game, dice.d1, dice.d2, entered ? { diceSource: "entered" } : undefined);
  game = settled.state;
  if (game.phase === "come-out") R5.applyPending(game);
  lastNet = settled.net;
  syncAutoPress();
  let pressNote = "";
  let autoPressed = false;
  if (!(game.strategy && game.strategy.id === "B5")) {
    const pressed = S.applyAutoPress(game);
    if (pressed.message) pressNote = pressed.message;
    if (pressed.ok) {
      game = pressed.state;
      autoPressed = true;
    }
  }
  if (!entered) rememberRoll(settled, source === "auto" ? "auto" : "manual", phaseBefore);
  const cap = settled.dice || {};
  lastRoll = { d1: cap.d1, d2: cap.d2, total: cap.total, hard: !!cap.hard, phaseBefore, result: settled.result };
  const callId = Lg.callTermId(lastRoll);
  if (callId) LC.rememberCall(lingo, callId);
  if (onTable === 0) emptyFelt += 1;
  else emptyFelt = 0;
  const sevenOut = settled.result === "seven-out" && phaseBefore === "point";
  if (settled.result === "point-made" || sevenOut) { /* celebration or PSO owns this sound */ }
  else if (settled.net > 0) { A.win(); haptic([12, 40, 16]); }
  else A.chip();
  if (settings.showDice) page = returnPage;
  rolling = false;
  paint();
  snap();
  const big = isBigWin(settled);
  const quiet = page === 2 || sevenOut || big;
  if (!quiet && !sevenOut) showRollToast(settled, pressNote);
  else if (pressNote && !sevenOut) queueToast(pressNote, "", 1200);
  noteBlaze(handBefore, settled);
  maybeTutor(settled);
  if (!entered) noteHandRoll(handBefore, settled, dice, hadBetNow, pointBefore, source === "auto" ? "auto" : "manual", totalBefore, edgeCap, onTable, autoPressed);
  R5.afterRoll({
    total: E.netWorth(game),
    start: totalBefore,
    yourDice: entered,
    sevenOut: settled.result === "seven-out" && phaseBefore === "point",
    length: handBefore.rolls + 1,
    mode: game.mode,
    strategy: game.strategy && game.strategy.id,
  });
  if (sevenOut) {
    const record = entered ? false : !!maybeRecord(handBefore, settled, dice, hadBetNow, true);
    const fireDec = (settled.decisions || []).find((d) => d.bet === "Fire Bet" && d.result === "win" && (d.level === 4 || d.level === 5));
    const length = handBefore.rolls + 1;
    showPSO({
      app: "bc",
      point: pointBefore,
      d1: dice.d1,
      d2: dice.d2,
      net: settled.net,
      hadBets: onTable > 0,
      hand: { rolls: length, points: handBefore.points },
      record,
      fire: fireDec ? { points: fireDec.level, pay: fireDec.profit } : null,
      puck: [document.querySelector(".hud-puck")],
      dice: [document.querySelector(".dome-screen .result-line"), document.querySelector(".hud-puck")],
      sweepFrom: [...document.querySelectorAll(".has .stack")],
      railTo: document.querySelector(".dock .chip-btn.on"),
      avoid: [document.querySelector("[data-act='roll']"), document.querySelector(".dome-screen .machine")],
      billie: { light: "assets/mascots/billie/billie-C-sevenout.svg", long: "assets/mascots/billie/billie-C-hello.svg" },
      faces: "assets/dice/faces/",
      puckOn: "assets/icons/puck-on.svg",
      chip: "assets/chips/chip-25-value.svg",
      reduced: motionOff(),
      sfx: (name) => {
        if (!settings.sound) return;
        if (name === "pso_light" || name === "pso_dark") { A.seven(); A.chip(); }
        else if (name === "pso_nobets") A.pop();
        else if (name === "fire_payout") A.win();
      },
      haptic: (name) => { if (settings.haptics) haptic(name === "success" ? [12, 40, 12] : 10); },
    });
  } else {
    celebrate(settled, handBefore, { point: pointBefore, pass: passBefore });
    if (!entered) maybeRecord(handBefore, settled, dice, hadBetNow, false);
  }
  if (!entered && settled.result === "seven-out" && boardData.session && !boardData.session.ended) {
    const length = handBefore.rolls + 1;
    if (!boardData.session.longest || length > boardData.session.longest) boardData.session.longest = length;
  }
  if (sevenOut) setTimeout(() => noteSession(hadBetNow, settled), 1200);
  else noteSession(hadBetNow, settled);
  maybeAtsNote(settled);
  if (emptyFelt >= 3 && settings.autoRoll && !autoPause) {
    autoPause = "empty";
    toast("Auto-roll paused · nothing on the felt");
    paint();
  }
  save();
  saveBoard();
  startTimer();
}

function rememberRoll(settled, source, phaseBefore) {
  const rec = {
    d1: settled.dice.d1,
    d2: settled.dice.d2,
    total: settled.dice.total,
    result: settled.result,
    phaseBefore: phaseBefore || (settled.result === "natural" || settled.result === "craps" || settled.result === "point-set" ? "come-out" : "point"),
    mode: game.mode,
    net: settled.net,
    hard: !!settled.dice.hard,
    at: Date.now(),
    source: settled.dice.source || E.getRngSource(),
  };
  sessionRolls.push(rec);
  allRolls.push(rec);
  if (allRolls.length > 8000) allRolls.splice(0, allRolls.length - 8000);
}

function freshMeta() {
  return { id: 0, startedAt: 0, betRolls: 0, topTier: "cold", points: [], sources: {} };
}
function ensureHand(rollsSoFar) {
  if (rollsSoFar > 0 && handMeta.id) return;
  handMeta = freshMeta();
  handMeta.id = boardData.nextHandId || 1;
  handMeta.startedAt = Date.now();
  boardData.nextHandId = handMeta.id + 1;
}
function tierRank(name) {
  return { cold: 0, warm: 1, hot: 2, blazing: 3 }[name] || 0;
}
function raiseTier(name) {
  if (tierRank(name) > tierRank(handMeta.topTier)) handMeta.topTier = name;
}
function maxWorkingEdge(state) {
  let max = null;
  const consider = (spot, amount) => {
    if (!amount) return;
    const edge = E.edgeFor(spot, state.mode);
    if (typeof edge === "number" && (max == null || edge > max)) max = edge;
  };
  const b = state.bets || {};
  consider({ kind: "pass" }, b.pass);
  consider({ kind: "dontPass" }, b.dontPass);
  consider({ kind: "come" }, b.come);
  consider({ kind: "dontCome" }, b.dontCome);
  consider({ kind: "field" }, b.field);
  consider({ kind: "any7" }, b.any7);
  consider({ kind: "anyCraps" }, b.anyCraps);
  consider({ kind: "ce" }, b.ce);
  consider({ kind: "horn" }, b.horn);
  consider({ kind: "small" }, b.small);
  consider({ kind: "tall" }, b.tall);
  consider({ kind: "all" }, b.all);
  consider({ kind: "hardAllDay" }, b.hardAllDay);
  Object.keys(b.place || {}).forEach((n) => consider({ kind: "place", number: Number(n) }, b.place[n]));
  Object.keys(b.buy || {}).forEach((n) => consider({ kind: "buy", number: Number(n) }, b.buy[n]));
  Object.keys(b.hardways || {}).forEach((n) => consider({ kind: "hardway", number: Number(n) }, b.hardways[n]));
  Object.keys(b.repeaters || {}).forEach((n) => consider({ kind: "repeater", number: Number(n) }, b.repeaters[n]));
  return max;
}
function noteHandRoll(before, settled, dice, hadBet, pointBefore, source, totalBefore, edgeCap, onTable, autoPressed) {
  ensureHand(before.rolls);
  if (hadBet) handMeta.betRolls += 1;
  handMeta.sources[source] = true;
  const length = before.rolls + 1;
  const points = before.points + (settled.result === "point-made" ? 1 : 0);
  const tier = E.blazingTier(E.blazingScore({ rolls: length, points }), points);
  raiseTier(tier);
  if (settled.result === "point-made" && pointBefore) {
    if (handMeta.points.indexOf(pointBefore) < 0) handMeta.points.push(pointBefore);
  }
  const maxEdge = hadBet ? edgeCap : null;
  const billyNumbers = [];
  (settled.decisions || []).forEach((d) => {
    if (d.result !== "win") return;
    const m = /^(Place|Buy) (\d+)$/.exec(d.bet || "");
    if (!m) return;
    const n = Number(m[2]);
    const kind = m[1] === "Buy" ? "buy" : "place";
    if (game.billyMark && game.billyMark[kind] && game.billyMark[kind][n]) billyNumbers.push(n);
  });
  const armed = (boardData.progress && boardData.progress.armedCollect) || {};
  let collectNumber = 0;
  if (!autoPressed) {
    (settled.decisions || []).forEach((d) => {
      if (d.result !== "win") return;
      const hit = /^(Place|Buy) (\d+)$/.exec(d.bet || "");
      if (hit && armed[Number(hit[2])]) collectNumber = Number(hit[2]);
    });
  }
  if (dice && dice.source === "test") return;
  const ev = B.evaluateRoll({ badges: boardData.badges, progress: boardData.progress }, {
    mode: game.mode,
    handRolls: length,
    hadBet,
    result: settled.result,
    sevenOut: settled.result === "seven-out",
    tier,
    total: settled.dice.total,
    decisions: settled.decisions || [],
    passPoint: B.paidPassPoint(settled.decisions || [], settled.result === "point-made" ? pointBefore : 0),
    billyHit: billyNumbers.length > 0,
    billyNumbers,
    collectNumber,
    autoPressed: !!autoPressed,
    maxEdge,
    edgeBroken: maxEdge != null && maxEdge > 2,
    totalBefore,
    totalAfter: E.netWorth(game),
    inAction: onTable || 0,
    now: Date.now(),
    handId: handMeta.id,
  });
  boardData.badges = ev.store.badges;
  boardData.progress = ev.store.progress;
  if (ev.unlocked.length) queueUnlocks(ev.unlocked);
  if (hadBet && settled.result === "seven-out") {
    const day = new Date();
    const key = day.getFullYear() + "-" + String(day.getMonth() + 1).padStart(2, "0") + "-" + String(day.getDate()).padStart(2, "0");
    const daily = B.noteAction(boardData, { type: "practice-day", day: key, mode: game.mode, now: Date.now() });
    boardData.badges = daily.store.badges;
    boardData.progress = daily.store.progress;
    if (daily.store.daily) boardData.daily = daily.store.daily;
    if (daily.unlocked.length) queueUnlocks(daily.unlocked);
  }
}
function queueUnlocks(ids) {
  ids.forEach((id) => { if (badgeQueue.indexOf(id) < 0) badgeQueue.push(id); });
  if (boardData.session && !boardData.session.ended && ids.length) {
    const have = boardData.session.badges || [];
    ids.forEach((id) => { if (have.indexOf(id) < 0) have.push(id); });
    boardData.session.badges = have;
  }
  if (!badgeTimer) pumpBadges();
}
function badgeBlocked() {
  if (rolling || document.querySelector(".recordcard")) return true;
  if (document.body.classList.contains("bigwin") || document.body.classList.contains("pc-on") || document.querySelector(".winlayer")) return true;
  const next = badgeQueue[0];
  if (next && (next === "hand_10_rolls" || next === "hand_20_rolls" || next === "hand_40_rolls" || next === "blazing_reached") && document.querySelector(".toast.show")) return true;
  return false;
}
function badgeHost() {
  let host = document.getElementById("badge-toast");
  if (!host) {
    host = document.createElement("div");
    host.id = "badge-toast";
    document.body.appendChild(host);
  }
  return host;
}
function dismissBadgeToast() {
  const host = badgeHost();
  clearTimeout(badgeTimer);
  badgeTimer = 0;
  document.body.classList.remove("mascot-toast");
  if (!host.innerHTML) {
    if (badgeQueue.length) badgeTimer = setTimeout(pumpBadges, 240);
    return;
  }
  host.classList.add("out");
  setTimeout(() => { host.innerHTML = ""; host.classList.remove("out"); }, 220);
  if (badgeQueue.length) badgeTimer = setTimeout(() => { badgeTimer = 0; pumpBadges(); }, 260);
}
function pumpBadges() {
  const host = document.getElementById("badge-toast");
  if (!badgeQueue.length) {
    if (host && host.innerHTML && !host.classList.contains("out")) {
      host.classList.add("out");
      document.body.classList.remove("mascot-toast");
      setTimeout(() => { host.innerHTML = ""; host.classList.remove("out"); }, 220);
    }
    badgeTimer = 0;
    return;
  }
  if (!settings.badgeToasts || badgeBlocked()) {
    badgeTimer = setTimeout(pumpBadges, 400);
    return;
  }
  const id = badgeQueue.shift();
  const def = B.badgeById(id);
  if (!def) { pumpBadges(); return; }
  showBadgeToast(def);
  const ms = def.marquee ? 4500 : 3000;
  badgeTimer = setTimeout(() => { badgeTimer = 0; pumpBadges(); }, ms);
}
function showBadgeToast(def) {
  const host = badgeHost();
  host.classList.remove("out");
  const marquee = !!def.marquee;
  document.body.classList.toggle("mascot-toast", marquee);
  const lines = {
    spin_the_block: "Spin it to win it!",
    ats_sweep_one_hand: "Low, high, and all of them.",
    hand_40_rolls: "Forty rolls. The dice have no memory.",
    points_six_one_hand: "All six points, one hand.",
    crapless_six_points_one_hand: "Six Crapless points, one hand.",
  };
  const line = lines[def.id] || (def.tier === "legendary" ? "A rare one. Still random." : "That's a keeper.");
  const oddsLine = def.odds;
  const facts = marquee
    ? [oddsLine, def.pay ? def.pay + ", paid in practice chips" : "", def.edge ? "House edge " + def.edge : ""].filter(Boolean).join(" · ")
    : [def.pay, def.edge].filter(Boolean).join(" · ");
  if (marquee) {
    host.innerHTML = "<div class='badgetoast marquee " + def.tier + "' data-id='" + def.id + "'>" +
      "<i class='burst' aria-hidden='true'></i>" +
      "<img class='art' src='" + B.artFile(def.id, "open") + "' alt=''>" +
      "<img class='billie' src='assets/mascots/billie/billie-C-" + (def.tier === "legendary" ? "winner" : "cheer") + ".svg' alt='Bubbles Billie'>" +
      "<div><em class='tierpill'>" + def.tier + "</em><b>" + esc(def.name) + "</b>" +
      (facts ? "<span class='facts'>" + esc(facts) + "</span>" : "") +
      "<p class='billieline'>" + line + "</p></div>" +
      "<button type='button' class='view' data-act='badge-view' data-id='" + def.id + "'>VIEW</button></div>";
  } else {
    host.innerHTML = "<div class='badgetoast' data-id='" + def.id + "'>" +
      "<img class='art' src='" + B.artFile(def.id, "open") + "' alt=''>" +
      "<div><b>Badge: " + esc(def.name) + "</b><div>" + esc(def.desc) + "</div>" +
      (facts ? "<small>" + esc(facts) + "</small>" : (def.odds ? "<small>" + esc(def.odds) + "</small>" : "")) + "</div></div>";
  }
  const card = host.querySelector(".badgetoast");
  if (!card) return;
  let y0 = 0;
  card.addEventListener("pointerdown", (e) => { y0 = e.clientY; });
  card.addEventListener("pointerup", (e) => {
    if (e.target.closest("[data-act='badge-view']")) {
      openBadge(def.id);
      dismissBadgeToast();
      return;
    }
    dismissBadgeToast();
  });
  card.addEventListener("click", (e) => e.stopPropagation());
}
function awardSession(session, reason) {
  if (!session) return;
  const now = Date.now();
  const ev = B.evaluateSession(boardData, {
    sessionId: session.id,
    betRolls: session.betRolls,
    loosened: session.loosened,
    endReason: reason || session.endReason,
    lossCents: session.badgeLossCents != null ? session.badgeLossCents : session.lossCents,
    winCents: session.badgeWinCents != null ? session.badgeWinCents : session.winCents,
    winPromptAfter20: !!session.promptedWin && session.betRolls >= 20,
    lossPromptAfter20: !!session.promptedLoss && session.betRolls >= 20,
    endedAtWin: reason === "win" || ((reason === "end") && session.winHit && !session.lossHit && !session.rollAfterWin),
    endedAtLoss: reason === "loss" || ((reason === "loss" || reason === "end") && session.lossHit && !session.rollAfterLoss),
    endedBeforeNextRoll: (reason === "win" || reason === "loss" || reason === "end") && (session.lossHit || session.winHit) && !session.rollAfterLoss && !session.rollAfterWin,
    winHit: !!session.winHit,
    lossHit: !!session.lossHit,
    rollAfterLoss: !!session.rollAfterLoss,
    rollAfterWin: !!session.rollAfterWin,
    now,
    mode: game.mode,
  });
  boardData.badges = ev.store.badges;
  boardData.progress = ev.store.progress;
  boardData.sessions = ev.store.sessions;
  if (ev.unlocked.length) queueUnlocks(ev.unlocked);
}
function absorbIdle(session, now) {
  if (!session || session.ended) return session;
  const closed = Sess.closeIfIdle(session, now);
  if (closed && closed.ended && !session.ended) awardSession(closed, "idle");
  return closed;
}
function ensureSession(now, total) {
  boardData.session = absorbIdle(boardData.session, now);
  if (!boardData.session || boardData.session.ended) {
    boardData.session = Sess.startSession(boardData.session, total, {
      loss: settings.lossLimit,
      win: settings.winGoal,
    }, now);
  }
}
function noteSession(hadBet, settled) {
  const now = Date.now();
  if (!boardData.session || boardData.session.ended) ensureSession(now, E.netWorth(game));
  let s = Sess.noteRoll(boardData.session, hadBet);
  if (settled.result === "seven-out") s = Sess.noteHand(s);
  s = Sess.noteActivity(s, now);
  const status = Sess.limitStatus(s, E.netWorth(game));
  if (status.loss) s.lossHit = true;
  if (status.win) s.winHit = true;
  boardData.session = s;
  const showLoss = status.loss && !s.promptedLoss;
  const showWin = status.win && !s.promptedWin && !showLoss;
  if (showLoss || showWin) {
    if (showLoss) s.promptedLoss = true;
    if (showWin) s.promptedWin = true;
    boardData.session = s;
    autoPause = "limit";
    limitHold = true;
    stopTimer();
    const kind = showLoss ? "loss" : "win";
    const net = status.net;
    setTimeout(() => { if (limitHold) openLimitPrompt(kind, net); }, settled.result === "seven-out" ? 3000 : 2200);
  }
}
function openLimitPrompt(kind, net) {
  const abs = money(Math.abs(net));
  const loss = kind === "loss";
  const copy = loss
    ? "You've reached the loss limit you set: −" + abs + " practice chips this session. This is a good spot to stop."
    : "You hit your win goal: +" + abs + " practice chips. Want to lock it in?";
  openSheet("<header><img src='assets/mascots/dealer-billy/billy-A-tip.svg' alt='Dealer Billy'><div><h2>" + (loss ? "Loss limit" : "Win goal") + "</h2></div></header><p>" + copy + "</p><div class='actions'><button class='go' data-act='end-session' data-reason='" + kind + "'>End session</button><button data-act='keep-playing'>Keep playing</button></div>");
}
function finishSession(reason) {
  const now = Date.now();
  limitHold = false;
  autoPause = "end";
  if (boardData.session && !boardData.session.ended) {
    boardData.session = Sess.endSession(boardData.session, reason, now);
    awardSession(boardData.session, reason);
  }
  saveBoard();
  const s = boardData.session;
  const net = s ? E.netWorth(game) - s.startChips : 0;
  const longest = s && s.longest ? E.countPhrase(s.longest, "roll") : "none yet";
  const lossKept = !s || !s.lossCents ? "Loss limit off" : s.lossHit ? (s.rollAfterLoss ? "Loss limit hit, then play continued" : "Loss limit kept") : "Loss limit not reached";
  const winKept = !s || !s.winCents ? "Win goal off" : s.winHit ? (s.rollAfterWin ? "Win goal hit, then play continued" : "Win goal banked") : "Win goal not reached";
  const names = (s && s.badges || []).map((id) => { const b = B.badgeById(id); return b ? b.name : id; });
  const badgeLine = names.length ? names.join(", ") : "None this session";
  openSheet("<h2>Session summary</h2><p>" + E.countPhrase(s ? s.rolls : 0, "roll") + " · " + E.countPhrase(s ? s.hands : 0, "hand") + "</p><p>" + money(s ? s.startChips : 0) + " → " + money(E.netWorth(game)) + " · " + (net >= 0 ? "+" : "−") + money(Math.abs(net)) + "</p><p>Longest hand this session: " + longest + ".</p><p>" + lossKept + ". " + winKept + ".</p><p>Badges this session: " + esc(badgeLine) + ".</p><p>Practice chips carry over. A new session starts with your next roll.</p><div class='actions'><button class='go' data-act='close'>Close</button></div>");
  paint();
}
function resetTable() {
  R5.beforeReset(E.netWorth(game));
  const ev = B.noteAction(boardData, { type: "reset-bankroll", total: settings.bankPreset || E.STARTING_BANKROLL });
  boardData.badges = ev.store.badges;
  boardData.progress = ev.store.progress;
  if (boardData.session && !boardData.session.ended) {
    boardData.session = Sess.endSession(boardData.session, "reset", Date.now());
  }
  game = E.resetBankroll(game);
  if (settings.bankPreset) {
    game.bankroll = settings.bankPreset;
    game.startingBankroll = settings.bankPreset;
  }
  sessionRolls = [];
  autoPause = "end";
  emptyFelt = 0;
  limitHold = false;
  handMeta = freshMeta();
  toast("Practice chips reset to " + money(game.bankroll) + ".");
  save();
  saveBoard();
  paint();
}
function setLimitKind(which, kind) {
  const spec = which === "win" ? settings.winGoal : settings.lossLimit;
  const before = { loss: settings.lossLimit, win: settings.winGoal };
  spec.kind = kind === "amount" || kind === "pct" ? kind : "off";
  const after = { loss: settings.lossLimit, win: settings.winGoal };
  if (boardData.session && !boardData.session.ended) {
    if (Sess.limitsLoosened(before, after, boardData.session)) {
      boardData.session = Sess.markLoosened(boardData.session);
    }
    boardData.session = Sess.applyLiveLimits(boardData.session, after);
    saveBoard();
  }
  save();
  paint();
}
function stepLimit(which, field, dir) {
  const spec = which === "win" ? settings.winGoal : settings.lossLimit;
  const before = { loss: Object.assign({}, settings.lossLimit), win: Object.assign({}, settings.winGoal) };
  if (field === "pct") {
    const choices = which === "win" ? [10, 25, 30, 50, 100] : [10, 20, 25, 40, 50];
    let i = choices.indexOf(spec.pct);
    if (i < 0) i = 0;
    spec.pct = choices[Math.max(0, Math.min(choices.length - 1, i + dir))];
  } else {
    spec.amount = Sess.clampAmount((spec.amount || 2500) + dir * Sess.LIMIT_STEP);
  }
  const after = { loss: settings.lossLimit, win: settings.winGoal };
  if (boardData.session && !boardData.session.ended) {
    if (Sess.limitsLoosened(before, after, boardData.session)) {
      boardData.session = Sess.markLoosened(boardData.session);
    }
    boardData.session = Sess.applyLiveLimits(boardData.session, after);
    saveBoard();
  }
  save();
  paint();
}
function initialsFromSettings() {
  const boxes = [...document.querySelectorAll(".setinits .init")];
  if (boxes.length) return boxes.map((el) => el.value).join("");
  return (document.getElementById("settings-initials") || {}).value || "";
}
function saveInitials(applyExisting) {
  const raw = initialsFromSettings();
  const res = L.setInitials(boardData, raw, applyExisting);
  const err = document.querySelector(".initerr");
  if (!res.ok) {
    if (err) err.textContent = res.error;
    return;
  }
  boardData = res.data;
  saveBoard();
  toast(applyExisting ? "Initials updated on your rows." : "Initials saved for the next hand.");
  paint();
}
function confirmResetRecords() {
  openSheet("<h2>Reset badges and records</h2><p>This clears all badges and Longest Roll boards on this device.</p><div class='actions'><button data-act='close'>Cancel</button><button class='go' data-act='reset-records-yes'>Clear them</button></div>");
}
function wipeRecords() {
  const session = boardData.session;
  boardData = L.emptyData();
  boardData.session = session;
  handMeta = freshMeta();
  saveBoard();
  closeOverlay();
  toast("Badges and boards cleared on this device.");
  paint();
}
function measureChrome() {
  const hud = document.getElementById("hud");
  const dock = document.getElementById("dock");
  if (hud && hud.offsetHeight) document.documentElement.style.setProperty("--hud-h", hud.offsetHeight + "px");
  if (dock && dock.offsetHeight) {
    document.documentElement.style.setProperty("--dock-h", dock.offsetHeight + "px");
    document.documentElement.style.setProperty("--dock-top", dock.getBoundingClientRect().top + "px");
  }
  const dots = document.getElementById("dots");
  if (dots && dots.offsetHeight) {
    document.documentElement.style.setProperty("--dots-top", dots.getBoundingClientRect().top + "px");
  }
  if (hud && hud.offsetHeight) {
    document.documentElement.style.setProperty("--hud-bottom", hud.getBoundingClientRect().bottom + "px");
  }
  const short = window.matchMedia("(max-height: 500px) and (orientation: landscape)").matches;
  const fs = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const zoomed = fs >= 16 * 1.3;
  const play = document.querySelector(".app.play");
  const playZoom = play ? parseFloat(getComputedStyle(play).zoom) : 1;
  const columnZoom = playZoom > 0 ? playZoom : 1;
  document.querySelectorAll(".rollstrip").forEach((el) => {
    const dome = el.closest(".dome-screen");
    const available = dome ? dome.clientWidth : el.clientWidth;
    const pipsTooSmall = !!(dome && 14 * columnZoom < 13.5);
    el.classList.toggle("totals", short || zoomed || available < 309 || pipsTooSmall);
  });
}
function noteFair() {
  const scope = fairScope === "last" ? "last" : fairScope === "all" ? "all" : "session";
  const card = document.getElementById("fairness-card");
  const panel = document.getElementById("panel");
  let saw = false;
  if (card && panel) {
    const c = card.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    saw = c.top < p.bottom - 8 && c.bottom > p.top + 8;
  }
  const ev = B.noteAction(boardData, { type: "fair-scope", scope, sawTest: saw, mode: game.mode, now: Date.now() });
  boardData.badges = ev.store.badges;
  boardData.progress = ev.store.progress;
  if (ev.unlocked.length) queueUnlocks(ev.unlocked);
}
function fitFelt() {
  // fitFelt v2 (board fix, run 15): pick a felt layout for the space, then scale it.
  //   tall  : portrait with room (390x844, 430x932): the classic 354 x 471 felt
  //   short : short portrait (320/360/375): felt as wide as the rail, height from the numeral floor
  //   land  : landscape: two columns, 704 felt px wide
  // k never drops below the numeral floor (numbers >= 26px at 375+, 25px at 360, 22.2px at 320).
  const stage = document.getElementById("stage");
  if (!stage || view !== "play") return;
  stage.querySelectorAll(".felt").forEach((f) => {
    f.classList.add("scaled");
    if (!f.classList.contains("bfx")) return;
    const page = f.closest(".page"); if (!page) return;
    const cs = getComputedStyle(page);
    const aw = page.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 20;   // 20 = rail padding
    const ah = page.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 20;
    if (!(aw > 0 && ah > 0)) return;
    const z = window.innerWidth < 360 ? 0.9091 : 1;            // the run12 320 column zoom
    const crap = f.classList.contains("mode-crapless");
    const portrait = window.innerHeight > window.innerWidth;
    const floor = window.innerWidth < 360 ? 22.3 / (34 * z) : (window.innerWidth < 375 && portrait) ? 25 / 34 : 26 / 34;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    let kind, k, fw, fh;
    if (aw / ah > 1.7) {
      kind = "land"; const fixed = crap ? 228 : 170;
      k = clamp(Math.min(aw / 704, (ah - 44 / z) / fixed), floor, 1.12); fw = aw / k; fh = Math.max(ah / k, fixed + 44 / (k * z));
    } else if (ah / aw >= 1.25) {
      kind = "tall"; k = clamp(Math.min(aw / 354, ah / 471), floor, 1.12); fw = 354; fh = 471;
    } else {
      kind = "short"; const fixed = crap ? 317 : 298, fmin = crap ? 309 : 282;   // props row: 84 target, 76 (Crapless) / 68 (Regular) min
      k = clamp((ah - 44 / z) / fixed, floor, Math.min(1.12, aw / 354)); const extra = crap ? Math.max(0, 88 / (k * z) + 6 - 132) : 0;   // Crapless boxes stay >= 44px tall
      fw = aw / k; fh = Math.max(ah / k, fmin + extra + 44 / (k * z));
    }
    ["lay-tall", "lay-short", "lay-land"].forEach((c) => f.classList.toggle(c, c === "lay-" + kind));
    f.style.setProperty("--fw", fw.toFixed(2) + "px");
    f.style.setProperty("--fh", fh.toFixed(2) + "px");
    document.documentElement.style.setProperty("--felt-k", k.toFixed(4));
  });
  measureChrome();
}
function cubeMarkup(which) {
  const faces = [1, 2, 3, 4, 5, 6].map((n) => "<i class='f f" + n + "'></i>").join("");
  return "<div class='cube3d" + (which === "b" ? " b" : "") + "'><div class='cube' data-face='1'>" + faces + "</div></div>";
}
function animateDice(dice) {
  const reduce = motionOff();
  const cubes = [...document.querySelectorAll("#dice-row .cube")];
  if (!cubes.length) return wait(RS.diceMs(settings.rollSpeed, reduce));
  const faces = [dice.d1, dice.d2];
  cubes.forEach((c, i) => {
    c.dataset.face = String(faces[i]);
    c.classList.remove("tumbling");
  });
  if (reduce) return wait(180);
  return new Promise((resolve) => {
    let left = cubes.length;
    let settled = false;
    const finish = () => {
      if (settled) return;
      if (left > 0) return;
      settled = true;
      cubes.forEach((c) => c.classList.remove("tumbling"));
      resolve();
    };
    cubes.forEach((c) => {
      const onEnd = (ev) => {
        if (ev.target !== c) return;
        const name = ev.animationName || "";
        if (name.indexOf("bb-tumble") !== 0) return;
        c.removeEventListener("animationend", onEnd);
        left -= 1;
        finish();
      };
      c.addEventListener("animationend", onEnd);
    });
    requestAnimationFrame(() => cubes.forEach((c) => c.classList.add("tumbling")));
    setTimeout(() => { left = 0; finish(); }, RS.diceMs(settings.rollSpeed, false));
  });
}
function syncDice() {
  const host = document.getElementById("dice-row");
  if (!host) return;
  const show = view === "play" && page === 2;
  host.hidden = !show;
  if (!show) return;
  const tier = E.blazingTier(E.blazingScore(game.hand), game.hand.points);
  const heat = tier === "warm" ? " warm" : tier === "hot" ? " hot" : tier === "blazing" ? " blazing" : "";
  host.className = "dice-live" + heat;
  if (host.querySelectorAll(".cube").length !== 2) {
    host.innerHTML = cubeMarkup("a") + cubeMarkup("b");
    const cubes = host.querySelectorAll(".cube");
    const d1 = game.lastDice ? game.lastDice.d1 : 5;
    const d2 = game.lastDice ? game.lastDice.d2 : 2;
    cubes[0].dataset.face = String(d1);
    cubes[1].dataset.face = String(d2);
  }
  requestAnimationFrame(placeDice);
}
function placeDice() {
  const host = document.getElementById("dice-row");
  const bowl = document.querySelector("#pager .machine");
  const stage = document.getElementById("stage");
  const pager = document.getElementById("pager");
  if (!host || !bowl || !stage || !pager || host.hidden || page !== 2) return;
  const s = stage.getBoundingClientRect();
  const p = pager.getBoundingClientRect();
  const r = bowl.getBoundingClientRect();
  if (r.width < 20 || r.height < 20 || s.width < 20) return;
  const settledPagerLeft = s.left - page * s.width;
  const shift = settledPagerLeft - p.left;
  const k = Math.min(r.width / 860, r.height / 1120);
  const iw = 860 * k;
  const ih = 1120 * k;
  const ix = r.left + shift + (r.width - iw) / 2;
  const iy = r.bottom - ih;
  let die = Math.round(iw * 0.19);
  if (die < 40 && iw >= 96) die = 40;
  host.style.position = "fixed";
  host.style.marginLeft = "0";
  host.style.visibility = "visible";
  const gap = Math.max(6, Math.round(die * 0.12));
  host.style.gap = gap + "px";
  const width = die * 2 + gap;
  host.style.left = Math.round(ix + (iw - width) / 2) + "px";
  host.style.top = Math.round(iy + ih * 0.66 - die) + "px";
  host.style.width = Math.round(width) + "px";
  host.style.height = Math.round(die * 1.05) + "px";
  host.style.setProperty("--s", die + "px");
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

function burstChips(cents) {
  const chips = breakChips(Math.abs(cents), 6);
  if (!chips.length) chips.push(500);
  return "<div class='burst' aria-hidden='true'>" + chips.map((c, i) => {
    const x = Math.round((i - (chips.length - 1) / 2) * 34);
    return "<img alt='' src='" + chipSrc(c, true) + "' style='--i:" + i + ";--x:" + x + "px'>";
  }).join("") + "</div>";
}
function perDollar(decision) {
  if (!decision.stake) return money(decision.profit);
  return money(Math.round(decision.profit / (decision.stake / 100)));
}
function bonusCopy(decision) {
  const each = perDollar(decision);
  if (decision.bet === "Hard Way All Day") return "Hard Way All Day! +" + each + " per $1. Bet stays up, lamps reset.";
  if (decision.bet === "Low Rolls" || decision.bet === "High Rolls" || decision.bet === "Roll 'Em All") {
    return decision.bet + "! +" + each + " per $1. Bet stays up, lamps reset.";
  }
  if (decision.bet.indexOf("Repeater") === 0) return decision.bet + "! +" + each + " per $1. Bet stays up, tally reset.";
  return decision.bet + " stays up.";
}
function winningStake(settled) {
  const wins = (settled.decisions || []).filter((d) => d.result === "win" && d.stake > 0);
  if (!wins.length) return 0;
  return Math.max.apply(null, wins.map((d) => d.stake));
}
function isBigWin(settled) {
  if (!settled.net || settled.net <= 0) return false;
  const bonus = (settled.decisions || []).some((d) => d.rearmed && d.result === "win");
  if (bonus) return true;
  const stake = winningStake(settled);
  return stake > 0 && settled.net >= stake * 25;
}
let winSkip = null;
function clearWin() {
  clearTimeout(celeTimer);
  cancelCelebration();
  if (winSkip) {
    removeEventListener("pointerdown", winSkip, { capture: true });
    removeEventListener("keydown", winSkip, { capture: true });
    winSkip = null;
  }
  document.body.classList.remove("bigwin");
  const el = document.getElementById("overlay");
  if (el && el.querySelector(".winlayer")) el.innerHTML = "";
  if (badgeQueue.length && !badgeTimer) pumpBadges();
}
function showBigWin(settled) {
  const el = document.getElementById("overlay");
  if (!el || !(settled.net > 0)) return;
  const amount = "+" + money(settled.net);
  const reduce = motionOff();
  document.body.classList.add("bigwin");
  const lines = (settled.decisions || []).filter((d) => d.rearmed && d.result === "win").map(bonusCopy);
  el.innerHTML = "<div class='winlayer" + (reduce ? " reduce" : "") + "'>" +
    "<div class='sunburst' aria-hidden='true'></div>" +
    "<div class='spark' aria-hidden='true'>" + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => "<i style='--a:" + i + "'></i>").join("") + "</div>" +
    "<div class='winrow'><div class='winstamp'><b>BIG WIN!</b><strong>" + amount + "</strong>" +
    (settled.dice && settled.dice.d1 ? diceReadout(settled.dice.d1, settled.dice.d2, 24, {
      aria: settled.dice.aria,
      sevenOut: settled.result === "seven-out",
      hardTag: settled.result !== "seven-out",
      call: settled.result === "seven-out" ? "SEVEN OUT" : settled.dice.word,
    }) : "") +
    "<p>PRACTICE CHIPS</p>" +
    (lines.length ? "<em>" + lines.join("<br>") + "</em>" : "") + "</div>" +
    "<img class='win-billie' src='assets/mascots/billie/billie-C-winner.svg' alt='Bubbles Billie'></div>" +
    burstChips(settled.net) + "</div>";
  clearTimeout(celeTimer);
  celeTimer = setTimeout(clearWin, 2500);
  winSkip = () => clearWin();
  addEventListener("pointerdown", winSkip, { capture: true, passive: true });
  addEventListener("keydown", winSkip, { capture: true, passive: true });
}
function sevenToast(settled, extra) {
  const net = settled.net || 0;
  const line = net === 0 ? "Seven out." : "Seven out. " + money(net).replace("-", "−");
  const el = document.getElementById("toast");
  if (!el) return;
  const dice = settled.dice || {};
  const pips = dice.d1 ? diceReadout(dice.d1, dice.d2, 24, { sevenOut: true, aria: dice.aria, call: "SEVEN OUT" }) : "";
  el.className = "toast show seven";
  el.innerHTML = "<img class='toast-billy' src='assets/mascots/dealer-billy/billy-A-sevenout.svg' alt='Dealer Billy'>" +
    "<div class='speech'><b>" + line + "</b>" + pips + (extra ? "<small>" + extra + "</small>" : "") + "</div>" +
    "<span class='steams' aria-hidden='true'><i class='steam'></i><i class='steam'></i><i class='steam'></i></span>";
  syncMascot();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 2800);
}
function celebrate(settled, before, extra) {
  if (settled.result === "seven-out") {
    let note = "";
    if (settings.blazing !== false && before) {
      const moment = E.blazeMoment(before, settled.state.hand, settled.result);
      note = [moment.text, moment.handNote].filter(Boolean).join(" ");
    }
    sevenToast(settled, note);
    return;
  }
  if (settled.result === "point-made") {
    const points = settled.state.hand.points || 1;
    const tier = celebrationTier(points, { meterOn: settings.blazing !== false, blazing: settled.tier === "blazing" });
    const quiet = !(extra && extra.pass > 0);
    const bigWin = !quiet && isBigWin(settled);
    const copy = celebrationCopy({
      tier, quiet, big: bigWin, point: extra && extra.point, points, hard: settled.dice && settled.dice.hard, net: settled.net,
    });
    const onDome = page === 2;
    const pointBox = extra && extra.point ? document.querySelector(".numbox [data-number='" + extra.point + "']") : null;
    const targets = onDome
      ? [document.querySelector(".dome-screen .result-line")].filter(Boolean)
      : [pointBox ? pointBox.closest(".numbox") : document.querySelector(".feltpuck, .puckimg")].filter(Boolean);
    celebratePoint({
      targets: targets.length ? targets : [document.getElementById("app") || document.body],
      avoid: ["[data-act='roll']", ".dock", ".hud-row1", ".tabbar"].map((s) => document.querySelector(s)),
      point: extra && extra.point,
      net: quiet ? 0 : settled.net,
      big: bigWin,
      tier,
      quiet,
      duration: copy.duration,
      line: copy.call,
      cheer: copy.cheer,
      billie: "assets/mascots/billie/billie-C-winner.svg",
      chip: "assets/chips/chip-25-value.svg",
      reduced: motionOff(),
      sfx: (name) => { if (settings.sound && name) A.win(); },
    });
    return;
  }
  if (isBigWin(settled)) showBigWin(settled);
}
function rollHud() {
  const n = game.hand.rolls || 0;
  return "<div class='hud-roll' aria-label='This hand, " + E.countPhrase(n, "roll") + "'><small>Roll</small><strong>" + n + "</strong></div>";
}
function recordHost() {
  let el = document.getElementById("record");
  if (!el) {
    el = document.createElement("div");
    el.id = "record";
    document.body.appendChild(el);
  }
  return el;
}
function closeRecord() {
  const el = document.getElementById("record");
  if (el) el.innerHTML = "";
  pendingRecord = null;
  if (boardData.pending) {
    boardData.pending = null;
    saveBoard();
  }
}
function initialsFromCard() {
  return [...document.querySelectorAll(".recordcard .init")].map((el) => el.value.trim()).join("");
}
function postPending(initials, goBoard) {
  if (!pendingRecord) return false;
  const res = L.commitRoll(boardData, Object.assign({ initials }, pendingRecord));
  const err = document.querySelector(".recorderr");
  if (!res.ok) {
    if (err) { err.hidden = false; err.textContent = res.error; }
    return false;
  }
  boardData = res.data;
  saveBoard();
  pendingRecord = null;
  closeRecord();
  const label = (res.record ? "New longest roll this week: " : "Made the board. ") + E.countPhrase(res.entry.rolls, "roll") + ".";
  if (goBoard) {
    boardMode = res.entry.mode;
    boardScope = res.madeWeek ? "week" : "all";
    setView("leaderboard");
  }
  toast(label);
  return true;
}
function savePending(goBoard) {
  const norm = L.normalizeInitials(initialsFromCard());
  const err = document.querySelector(".recorderr");
  if (norm.blocked) {
    if (err) { err.hidden = false; err.textContent = "Try different letters."; }
    return;
  }
  if (!norm.ok) {
    if (err) { err.hidden = false; err.textContent = "Use 1 to 3 letters, A to Z."; }
    return;
  }
  postPending(norm.value, goBoard);
}
function skipPending() {
  postPending("", false);
}
function showRecordCard(preview) {
  const el = recordHost();
  stopTimer();
  hideToast();
  const where = [
    preview.madeWeek ? "This week #" + preview.rankWeek : "",
    preview.madeAll ? "All time #" + preview.rankAll : "",
  ].filter(Boolean).join(" · ");
  const title = preview.record ? "New record!" : "Made the board";
  const rolls = E.countPhrase(preview.throws, "roll");
  const points = E.countPhrase(preview.points, "point");
  const mode = preview.mode === "crapless" ? "Crapless" : "Regular";
    const ended = preview.sevenOutDice
    ? "<p class='endedon'><span>Ended on</span> " + diceReadout(preview.sevenOutDice.d1, preview.sevenOutDice.d2, 20, { sevenOut: true }) + " <span class='outtag'>· seven out</span></p>"
    : "";
  el.innerHTML = "<div class='recordlayer' role='dialog' aria-labelledby='record-title'>" +
    "<div class='recordcard'>" +
    "<div class='recordtop'><img class='record-billie' src='assets/mascots/billie/billie-C-winner.svg' alt='Bubbles Billie'>" +
    "<p class='record-speech' id='record-title'>" + title + "</p></div>" +
    "<b class='recordcount'>" + preview.throws + "</b>" +
    "<p class='recordmeta'>" + rolls + " · " + points + " · " + mode + "</p>" +
    ended +
    "<p class='recordwhere'>" + esc(where) + "</p>" +
    "<p class='ask'>Top 10! Add your initials? (Stays on this device.)</p>" +
    "<div class='inits'>" + [0, 1, 2].map((i) =>
      "<input class='init' maxlength='1' aria-label='Initial " + (i + 1) + "' autocomplete='off' autocapitalize='characters'>").join("") +
    "</div>" +
    "<p class='recorderr' hidden></p>" +
    "<div class='actions'><button class='go' data-act='save-record'>SAVE</button>" +
    "<button class='ghost' data-act='skip-record'>SKIP</button></div></div></div>";
}
function maybeRecord(before, settled, dice, hadBet, silent) {
  if (settled.result !== "seven-out") return;
  if (!hadBet) return;
  if (dice && dice.source === "test") return;
  const done = L.completedRoll(before, settled.result);
  if (!done) return;
  const at = Date.now();
  const sources = Object.keys(handMeta.sources || {});
  const rollSource = sources.indexOf("auto") >= 0 && sources.indexOf("manual") >= 0 ? "mixed" : (sources[0] || "manual");
  const candidate = {
    throws: done.throws,
    points: done.points,
    mode: game.mode,
    at,
    handId: handMeta.id,
    startedAt: handMeta.startedAt || at,
    differentPoints: (handMeta.points || []).length,
    betRolls: handMeta.betRolls || 0,
    topBlazingTier: handMeta.topTier || "cold",
    rollSource,
    rngSource: dice && dice.source === "fallback" ? "fallback" : "secure",
    sessionId: boardData.session ? boardData.session.id : 0,
    hadBetOnSevenOut: true,
    sevenOutDice: dice && dice.d1 ? { d1: dice.d1, d2: dice.d2 } : null,
  };
  const preview = L.previewRoll(boardData, candidate);
  if (!preview.madeWeek && !preview.madeAll) {
    handMeta = freshMeta();
    return;
  }
  if (boardData.initials && boardData.initials.asked) {
    const res = L.commitRoll(boardData, Object.assign({ initials: boardData.initials.default || "" }, candidate));
    if (res.ok) {
      boardData = res.data;
      saveBoard();
      const line = (res.record ? "New longest roll this week: " : "Made the board. ") + E.countPhrase(res.entry.rolls, "roll") + ".";
      if (!silent) queueToast(line, "", settled.result === "seven-out" ? 3000 : 800);
    }
    handMeta = freshMeta();
    return !!(preview && preview.record);
  }
  pendingRecord = candidate;
  boardData.pending = candidate;
  saveBoard();
  clearTimeout(recordTimer);
  if (!silent) {
    recordTimer = setTimeout(() => {
      hideToast();
      showRecordCard(preview);
    }, motionOff() ? 400 : 2900);
  }
  handMeta = freshMeta();
  return !!(preview && preview.record);
}
function leaderHTML() {
  const mode = boardMode === "crapless" ? "crapless" : "regular";
  const scope = boardScope === "all" ? "all" : "week";
  const now = Date.now();
  const rows = L.ranked(boardData.entries, { mode, scope, now });
  const you = (boardData.initials && boardData.initials.default) || "";
  const medals = ["g", "s", "b"];
  const emptyCopy = scope === "week"
    ? "No finished hands yet this week. Every hand ends on a seven-out."
    : "No finished hands yet. Every hand ends on a seven-out.";
  const hero = rows.length ? "<img src='assets/mascots/billie/billie-C-cheer.svg' alt='Bubbles Billie'>" : "";
  const list = rows.length ? "<ol class='boardlist'>" + rows.map((e, i) => {
    const mine = (e.initials || "") === you;
    const pts = E.countPhrase(e.points, "pt", "pts");
    const tier = e.topBlazingTier || "cold";
    return "<li class='boardrow" + (mine ? " you" : "") + "'>" +
      "<span class='rank medal " + (medals[i] || "") + "'>" + (i + 1) + "</span>" +
      "<div class='boardmain'><b>" + esc(e.name) + "</b>" +
      (mine ? "<i class='youtag'>YOU</i>" : "") +
      "<small>" + pts + " · " + esc(L.formatWhen(e.at)) + " · " + esc(L.formatClock(e.at)) + "</small>" +
      (e.sevenOutDice ? "<span class='endedon'><span>Ended on</span> " + diceReadout(e.sevenOutDice.d1, e.sevenOutDice.d2, 20, { sevenOut: true }) + " <span class='outtag'>· seven out</span></span>" : "") +
      "</div>" +
      "<span class='rollcount'>" + e.throws + "</span>" +
      "<span class='tierchip " + tier + "'>" + tier + "</span></li>";
  }).join("") + "</ol>" : "<article class='card boardempty'><img src='assets/mascots/billie/billie-C-hello.svg' alt='Bubbles Billie'><div><h3>No finished hands yet</h3><p>" + emptyCopy + "</p></div></article>";
  const live = game.hand && game.hand.rolls > 0
    ? "<p class='liverow'>THIS HAND · LIVE · " + E.countPhrase(game.hand.rolls, "roll") + " so far · " + E.countPhrase(game.hand.points, "pt", "pts") + "</p>"
    : "";
  const prev = scope === "week" ? L.lastWeekBest(boardData.entries, mode, now) : null;
  const prevLine = prev ? "<p class='weeknote'>Last week's best: " + E.countPhrase(prev.throws, "roll") + ".</p>" : "";
  const weekNote = scope === "week" ? "<p class='weeknote'>Resets Monday at 12:00 AM, on this device.</p>" : "";
  return "<section class='boardpage'><header class='boardhead'>" +
    hero +
    "<div><p class='kicker'>ON THIS DEVICE</p><h2 class='led'>HIGH HAND · " + (scope === "week" ? "THIS WEEK" : "ALL TIME") + "</h2>" +
    "<p class='muted'>Rolls in one hand, come-out to seven-out.</p></div></header>" +
    "<div class='seg boardseg'>" +
    "<button class='" + (mode === "regular" ? "on" : "") + "' data-act='board-mode' data-mode='regular'>Regular</button>" +
    "<button class='" + (mode === "crapless" ? "on" : "") + "' data-act='board-mode' data-mode='crapless'>Crapless</button></div>" +
    "<div class='filters'>" +
    "<button class='" + (scope === "week" ? "on" : "") + "' data-act='board-scope' data-scope='week'>This week</button>" +
    "<button class='" + (scope === "all" ? "on" : "") + "' data-act='board-scope' data-scope='all'>All time</button></div>" +
    weekNote + prevLine + list + live +
    "<p class='boardfoot'>Long hands are random. They don't predict the next roll.</p>" +
    badgeGallery() +
    "<button class='cta' data-act='view' data-view='play'>BACK TO THE TABLE</button></section>";
}
function badgeTile(b) {
  const on = boardData.badges && boardData.badges[b.id];
  const hidden = b.hidden && !on;
  const state = hidden ? "hidden" : on ? "open" : "locked";
  let prog = B.progressOf(boardData.progress, b.id);
  if (b.id === "five_sessions_within_limits") {
    const have = (boardData.sessions && boardData.sessions.withinLimits) || 0;
    prog = { have, need: 5, text: have + " / 5" };
  }
  if (b.id === "daily_practice_3") {
    const have = (boardData.daily && boardData.daily.streak) || 0;
    prog = { have: Math.min(3, have), need: 3, text: have + " / 3" };
  }
  const bar = !on && !hidden && prog ? "<span class='badgebar'><i style='width:" + Math.round(100 * prog.have / prog.need) + "%'></i></span><small>" + esc(prog.text) + "</small>" : "";
  const label = hidden ? "Hidden badge" : b.name;
  return "<button class='badgetile' data-act='badge' data-id='" + b.id + "' aria-label='" + esc(label) + ", " + b.tier + ", " + (on ? "unlocked" : "locked") + "'>" +
    "<img src='" + B.artFile(b.id, state) + "' alt=''><small>" + esc(label) + "</small>" + bar + "</button>";
}
function badgeGallery() {
  const filters = ["all", "regular", "crapless", "unlocked", "locked"];
  const chips = "<div class='filters'>" + filters.map((f) => "<button class='" + (badgeFilter === f ? "on" : "") + "' data-act='badge-filter' data-filter='" + f + "'>" + f[0].toUpperCase() + f.slice(1) + "</button>").join("") + "</div>";
  const unlocked = Object.keys(boardData.badges || {}).length;
  const keep = (b) => {
    const on = !!(boardData.badges && boardData.badges[b.id]);
    if (badgeFilter === "regular") return b.mode !== "crapless";
    if (badgeFilter === "crapless") return b.mode !== "regular";
    if (badgeFilter === "unlocked") return on;
    if (badgeFilter === "locked") return !on;
    return true;
  };
  const tiers = ["bronze", "silver", "gold", "legendary"];
  const tierCounts = {};
  tiers.forEach((tier) => { tierCounts[tier] = B.BADGES.filter((b) => b.tier === tier).length; });
  const bars = "<div class='tierbars'>" + tiers.map((tier) => {
    const have = B.BADGES.filter((b) => b.tier === tier && boardData.badges && boardData.badges[b.id]).length;
    const need = tierCounts[tier];
    return "<div class='tierbar " + tier + "'><b>" + have + " / " + need + "</b><span class='badgebar'><i style='width:" + Math.round(100 * have / need) + "%'></i></span><small>" + tier + "</small></div>";
  }).join("") + "</div>";
  const sections = [
    ["Hand length & Blazing", ["hand_10_rolls", "hand_20_rolls", "hand_40_rolls", "blazing_reached"]],
    ["Points", ["points_all_six_lifetime", "points_six_one_hand"]],
    ["ATS", ["ats_low_rolls", "ats_high_rolls", "ats_roll_em_all", "ats_sweep_one_hand", "spin_the_block"]],
    ["Press & bets", ["billys_way_first_hit", "billys_way_full_circle", "press_undo", "press_then_collect", "hard_hat_trick", "hwad_win", "repeaters_all_ten"]],
    ["Discipline", ["low_edge_three_hands", "steady_up_1000", "limits_set_session", "win_goal_banked", "loss_limit_kept", "five_sessions_within_limits"]],
    ["Crapless", ["crapless_points_all_ten_lifetime", "crapless_six_points_one_hand", "crapless_corner_point"]],
    ["Practice", ["tutor_tour_complete", "fair_dice_explorer", "daily_practice_3", "table_manners", "talk_the_talk"]],
  ];
  const body = sections.map(([title, ids]) => {
    const tiles = ids.map((id) => B.badgeById(id)).filter((b) => b && keep(b)).map(badgeTile).join("");
    if (!tiles) return "";
    return "<h3 class='badgesec'>" + title + "</h3><div class='badgegrid'>" + tiles + "</div>";
  }).join("");
  return "<h2>Badges " + unlocked + " / " + B.BADGES.length + " earned</h2>" + bars + chips + body;
}
function openBadge(id) {
  const b = B.badgeById(id);
  if (!b) return;
  const got = boardData.badges && boardData.badges[id];
  if (b.hidden && !got) {
    openSheet("<h2>Hidden badge</h2><p>" + b.tier + " · locked</p><p>Badges never change the odds or payouts.</p><div class='actions'><button class='go' data-act='close'>Close</button></div>");
    return;
  }
  const tierName = b.tier.charAt(0).toUpperCase() + b.tier.slice(1);
  const modeName = b.mode === "both" ? "Both" : b.mode === "crapless" ? "Crapless" : "Regular";
  const when = got ? "First earned " + L.formatWhen(got.at) + " " + L.formatClock(got.at) : "Not earned yet";
  const times = got ? (got.count + " time" + (got.count === 1 ? "" : "s")) : "0 times";
  openSheet("<div class='badgedetail'><img src='" + B.artFile(b.id, got ? "open" : "locked") + "' alt='' width='96'>" +
    "<h2>" + esc(b.name) + "</h2>" +
    "<div class='pills'><span class='tierpill'>" + tierName + "</span><span class='modepill'>" + modeName + "</span></div>" +
    "<p>" + esc(b.desc) + "</p>" +
    "<article class='rulecard'><h3>THE RULE</h3><p>" + esc(b.rule) + "</p></article>" +
    "<div class='factrow'><div><small>Odds</small><b>" + esc(b.odds || "—") + "</b></div>" +
    "<div><small>Pays</small><b>" + esc(b.pay || "—") + "</b></div>" +
    "<div><small>Edge</small><b>" + esc(b.edge || "—") + "</b></div></div>" +
    "<p>" + when + " · " + times + "</p>" +
    "<p>Badges never change the odds or payouts. Every roll is random.</p><div class='actions'><button class='go' data-act='close'>Close</button></div></div>");
}

function blazeLesson(tier) {
  if (settings.tutorTrack === "experienced") {
    return "The Blazing meter = hand length so far, not a signal. Your edge per roll is the same at roll 1 and roll 20. Size bets by your bankroll plan, not the meter. Dice have no memory.";
  }
  return "The Blazing meter just shows how long this hand has lasted. It can't predict the next roll. Dice have no memory.";
}
function noteBlaze(before, settled) {
  if (settings.blazing === false) return;
  const moment = E.blazeMoment(before, settled.state.hand, settled.result);
  settings.seenBlaze = settings.seenBlaze || {};
  const first = moment.lessonTier && !settings.seenBlaze[moment.lessonTier];
  const parts = [moment.text, moment.handNote].filter(Boolean);
  if (settled.result === "seven-out") return;
  if (first && !document.querySelector(".overlay")) {
    settings.seenBlaze[moment.lessonTier] = true;
    save();
    openSheet(
      "<header><img src='assets/mascots/dealer-billy/billy-A-tip.svg' alt='Dealer Billy'><div><p class='tag'>BLAZING METER</p><h2>" + moment.lessonTier + "</h2></div></header><p>" + (moment.text ? moment.text + " " : "") + blazeLesson(moment.lessonTier) + "</p><div class='actions'><button class='go' data-act='close'>Got it</button></div>"
    );
    return;
  }
  if (first) {
    settings.seenBlaze[moment.lessonTier] = true;
    parts.push("Dice have no memory.");
    save();
  }
  if (parts.length) {
    const delay = isBigWin(settled) ? 2600 : 1400;
    const hot = moment.tier === "hot" || moment.tier === "blazing";
    const mascot = hot ? "assets/mascots/billie/billie-C-cheer.svg" : "";
    queueToast(parts.join(" "), mascot, delay, hot ? "heat" : "");
  }
}

function maybeTutor(settled) {
  if (!settings.tutorOn || !tour) return;
  if (settled.result === "point-set") openTutor(3);
  else if (settled.result === "seven-out" || settled.result === "point-made") openTutor(5);
}
function maybeAtsNote(settled) {
  if (!settings.tutorOn || !settled) return;
  const decisions = settled.decisions || [];
  const atsLost = decisions.some((d) => d.result === "lose" && /^(Low Rolls|High Rolls|Roll 'Em All)$/.test(d.bet || ""));
  if (settled.result === "natural" && settled.dice && settled.dice.total === 7 && atsLost && !settings.seenAtsComeout) {
    settings.seenAtsComeout = true;
    save();
    const sevenPips = settled.dice && settled.dice.d1
      ? diceReadout(settled.dice.d1, settled.dice.d2, 18, { aria: settled.dice.aria, sevenOut: false })
      : "";
    if (document.querySelector(".overlay, .coach")) {
      queueToast((sevenPips ? sevenPips + " " : "") + "Seven on the come-out: Pass wins, and a 7 ends Low Rolls, High Rolls, and Roll 'Em All.", "", 1600);
    } else openTutor(0, "ats7");
  }
  if (game.mode === "crapless" && settled.result === "point-set" && [2, 3, 11, 12].indexOf(game.point) >= 0 && !settings.seenAtsLamp) {
    if (game.bets.small || game.bets.tall || game.bets.all) {
      settings.seenAtsLamp = true;
      save();
      const n = game.point;
      const name = n <= 6 ? "Low Rolls" : "High Rolls";
      const lampPips = settled.dice && settled.dice.d1
        ? diceReadout(settled.dice.d1, settled.dice.d2, 18, { aria: settled.dice.aria, tag: true })
        : String(n);
      queueToast("That " + lampPips + " set your point, and it also lit " + name + "'s " + n + " lamp. ATS counts every roll's total.", "", 900);
    }
  }
}

function currentTip() {
  const experienced = settings.tutorTrack === "experienced";
  const point = game.point;
  if (tour) {
    const steps = tutorSteps();
    return steps[Math.min(tutorStep, steps.length - 1)];
  }
  if (game.phase === "come-out" && game.mode === "crapless") {
    return {
      id: "off-c",
      title: "Come-out",
      body: experienced
        ? "1 in 6 chance of a 2/3/11/12 point. Max odds there is 3x."
        : "Come-out! Only a 7 wins Pass right away. A 7 also loses Low Rolls, High Rolls, and Roll 'Em All.",
    };
  }
  if (game.phase === "come-out") {
    return {
      id: "off-r",
      title: "Come-out",
      body: experienced
        ? "Place and Buy are off on the come-out. Pass is the best entry. Regular Pass + 3-4-5x is 0.37%."
        : "Come-out! Bet Pass: 7 or 11 wins, 2, 3, or 12 loses, anything else is the point.",
    };
  }
  return {
    id: "point",
    title: "Point " + point,
    body: experienced
      ? "Max " + E.oddsMultiple(point) + "x odds. Billy's Way is 1.71% blended in Regular and 1.43% in Crapless."
      : "Point is " + point + ". Add Odds. They have no house edge. Want more? Place 6 and 8, or tap Billy's Way.",
  };
}

function tutorSteps() {
  const crapless = game.mode === "crapless";
  return [
    { id: "s1", title: "Practice chips", body: "Education only. Play money only. No real gambling, no deposits, no payouts, no prizes. The machine rolls. Regular has the lower edge. Crapless is a variant. " + RULE0_LINE },
    { id: "s2", title: "Puck OFF", body: "Come-out roll. Bet the Pass Line. Your bankroll says Practice chips." },
    { id: "s3", title: "Come-out results", body: crapless ? "Only a 7 wins Pass right away. 2, 3, 11, and 12 become the point. Come-out 7 with ATS up: Pass wins, and any 7 loses Low Rolls, High Rolls, and Roll 'Em All." : "7 and 11 win. 2, 3, and 12 lose. 4, 5, 6, 8, 9, and 10 become the point. A 7 also loses ATS." },
    { id: "s4", title: "Odds", body: "When the puck is ON, add Odds. There is no house edge on odds, up to 3x, 4x, or 5x. The expected loss in chips stays tied to the flat bet. Swings get bigger." },
    { id: "s5", title: "Numbers", body: "Place 6 and 8 (1.52%). On 4, 5, 9, and 10, Buy is cheaper than Place when the 5% commission is taken only on a win." },
    { id: "s6", title: "The cycle", body: "A point hit turns the puck OFF. A seven-out takes the line, Place, and Buy. That is normal. Dice have no memory." },
    { id: "s7", title: "Good and costly", body: "Lower edge: Pass or Come with odds, Place 6/8, Buy 4/5/9/10. Higher edge: Field, hardways, hops, Big Red, ATS, Repeaters, and Hard Way All Day at 21.4%." },
  ];
}

function teachKey(tip) {
  if (!tip) return "";
  if (tip.id === "s2" || tip.id === "off-r" || tip.id === "off-c" || tip.id === "s1") return "pass";
  if (tip.id === "s4" || tip.id === "point") return "passOdds";
  if (tip.id === "s5" || tip.id === "billy") return "place-6";
  if (tip.id === "press" || tip.id === "power") return "place-6";
  return "";
}
function markSpotlight() {
  document.querySelectorAll(".teach").forEach((el) => el.classList.remove("teach"));
  if (!coachOn) return;
  const key = teachKey(currentCoachTip);
  if (!key) return;
  const el = document.querySelector("[data-teach='" + key + "']");
  if (el) el.classList.add("teach");
}
let currentCoachTip = null;
function refreshCoachKicker() {
  const kick = document.querySelector("#overlay .coach .kicker");
  if (!kick) return;
  kick.textContent = "TUTOR · " + (game.phase === "point" ? "POINT IS ON" : "COME-OUT");
}
let lingoTutor = null;
function openTutor(step, force) {
  if (typeof step === "number") tutorStep = step;
  const tip = force === "show" && lingoTutor
    ? { id: "show", title: lingoTutor.term, body: lingoTutor.meaning, edge: null }
    : force === "billy"
    ? { id: "billy", title: "Billy's Way", body: settings.tutorTrack === "experienced" ? "1.71% blended in Regular, 1.43% in Crapless. Each spot is the cheaper way to bet that number. A 7 takes them all. Seven-out exposure is 6.4 units in Regular and 10.4 in Crapless per press." : "Billy's Way buys the outside numbers and places 6 and 8. A 7 takes them all down.", edge: 1.71 }
    : force === "press"
      ? { id: "press", title: "Press", body: "That extra unit came from your chips. Bigger bet, same odds. The house edge does not change. What is at risk, and the swings, go up.", edge: 1.52 }
        : force === "power"
        ? { id: "power", title: "Power Press", body: "The win was already yours. Putting it back on the number is not house money. Same odds, bigger swings.", edge: 1.52 }
        : force === "ats7"
          ? {
            id: "ats-comeout",
            title: "Come-out 7 with ATS up",
            body: (game.lastDice && game.lastDice.d1
              ? diceReadout(game.lastDice.d1, game.lastDice.d2, 18, { aria: game.lastDice.aria, sevenOut: false }) + " "
              : "") + (settings.tutorTrack === "experienced"
              ? "Come-out 7: Pass wins, and every ATS bet up loses. ATS edges are the same in both modes (18.30% / 17.98%). Crapless hands are shorter, so Low Rolls hits about 1 hand in 29 instead of 1 in 27."
              : "Seven on the come-out: your Pass Line wins, but a 7 ends Low Rolls, High Rolls and Roll 'Em All. ATS only cares about the dice total, not the point."),
            edge: 18.3,
          }
          : currentTip();
  currentCoachTip = tip;
  coachOn = true;
  document.body.classList.add("has-coach");
  const steps = tour ? tutorSteps() : [];
  const n = steps.length;
  const dots = n ? "<div class='steps'>" + steps.map((_, i) => "<i class='" + (i === tutorStep ? "on" : "") + "'></i>").join("") + "<span>STEP " + (tutorStep + 1) + " OF " + n + "</span></div>" : "";
  const edge = tip.edge != null ? edgeChip(tip.edge) : "";
  const el = document.getElementById("overlay");
  if (!el) return;
  const actions = n
    ? "<button data-act='why'>Why?</button><button data-act='mute-tip'>Mute this tip</button>"
    : "<button class='go' data-act='gotit'>Got it</button><button data-act='why'>Why?</button><button data-act='mute-tip'>Mute this tip</button>";
  el.innerHTML = "<div class='coach' role='dialog'>" +
    "<img class='coach-billie' src='assets/mascots/billie/billie-C-cheer.svg' alt='Bubbles Billie'>" +
    "<div class='coach-top'><img src='assets/mascots/dealer-billy/billy-A-tip.svg' alt='Dealer Billy, the tutor'><div><p class='kicker'>TUTOR · " + (game.phase === "point" ? "POINT IS ON" : "COME-OUT") + "</p><h2>" + tip.title + "</h2></div>" +
    "<div class='seg trackseg'><button class='" + (settings.tutorTrack === "beginner" ? "on" : "") + "' data-act='track' data-track='beginner'>Beginner</button><button class='" + (settings.tutorTrack === "experienced" ? "on" : "") + "' data-act='track' data-track='experienced'>Experienced</button></div></div>" +
    dots + "<p>" + tip.body + "</p>" + edge +
    "<div class='actions'>" + actions + "</div>" +
    (n ? "<div class='tourbar'><button data-act='close'>Skip tour</button><button class='go' data-act='gotit'>Next ›</button></div>" : "") +
    "</div>";
  markSpotlight();
}

function advanceTutor() {
  if (!tour) { closeOverlay(); return; }
  tutorStep += 1;
  if (tutorStep >= tutorSteps().length) {
    tour = false;
    const noted = B.noteAction(boardData, { type: "tour", mode: game.mode, now: Date.now() });
    boardData.badges = noted.store.badges;
    boardData.progress = noted.store.progress;
    if (noted.unlocked.length) queueUnlocks(noted.unlocked);
    const day = new Date();
    const key = day.getFullYear() + "-" + String(day.getMonth() + 1).padStart(2, "0") + "-" + String(day.getDate()).padStart(2, "0");
    const daily = B.noteAction(boardData, { type: "practice-day", day: key, mode: game.mode, now: Date.now() });
    boardData.badges = daily.store.badges;
    boardData.progress = daily.store.progress;
    if (daily.store.daily) boardData.daily = daily.store.daily;
    if (daily.unlocked.length) queueUnlocks(daily.unlocked);
    saveBoard();
    closeOverlay();
    return;
  }
  openTutor(tutorStep);
}

function whySheet() {
  return "<h2>Why the edge is the edge</h2><p>X to 1 means winnings on top of your bet. X for 1 includes the stake in the number, so 165 for 1 pays $164 profit.</p><p>Pass Line in Regular is 1.41% per bet, and 0.37% combined with 3-4-5x odds. The odds themselves are 0%. Crapless Pass is 5.38%, and 1.26% with max odds.</p><p>Place 6/8 is 1.52%. Buy 4/10 is 1.67% with commission on wins only. Hard Way All Day is 21.43%, about 1 win in 210.</p><p>The Blazing meter only shows how long this hand has lasted. It never changes odds or advice. Dice have no memory.</p><div class='actions'><button class='go' data-act='close'>Back</button></div>";
}

function billyHelp() {
  return "<h2>What's Billy's Way?</h2><p>One tap posts a separate bet on every number. Regular buys 4, 5, 9, and 10 at the chip you selected, and places 6 and 8 at chip × 6/5. Crapless also buys 2, 3, 11, and 12.</p><p>A $5 chip is Buy $5 and Place $6. The blend is 1.71% in Regular and 1.43% in Crapless. A 7 takes every spot.</p><div class='actions'><button class='go' data-act='play' data-mode='regular'>Play Regular</button><button data-act='close'>Close</button></div>";
}

function forSheet() {
  return "<h2>To 1 and for 1</h2><p><b>To 1</b> is profit on top of your bet. A $1 hop at 15 to 1 pays $15 profit and the $1 stays up.</p><p><b>For 1</b> includes the stake. Hard Way All Day at 165 for 1 pays $164 profit. Low Rolls at 31 for 1 pays $30 profit. The stake stays up and the lamps start over.</p><div class='actions'><button class='go' data-act='close'>Got it</button></div>";
}

function dontWarn(warning) {
  return "<header><img src='assets/mascots/dealer-billy/billy-A-tip.svg' alt='Dealer Billy'><div><h2>Take down Don't?</h2></div></header><p>" + warning + " Confirm only if you mean to give that up.</p><div class='actions'><button data-act='close'>Leave it up</button><button class='go' data-act='confirm-take'>Take it down</button></div>";
}

function lockedExport() {
  return "<h2>Export CSV</h2><p class='lock'>Premium · locked</p><p>Standard keeps your roll history on this device. CSV export is a Premium preview. There is no purchase on this test build.</p><div class='actions'><button class='go' data-act='close'>Close</button></div>";
}

function openSheet(html) {
  coachOn = false;
  document.body.classList.remove("has-coach");
  stopTimer();
  document.getElementById("overlay").innerHTML = "<div class='overlay'><div class='sheet' role='dialog'>" + html + "</div></div>";
}
function closeOverlay() {
  const el = document.getElementById("overlay");
  coachOn = false;
  currentCoachTip = null;
  lingoHl = "";
  document.querySelectorAll(".lingo-hl").forEach((n) => n.classList.remove("lingo-hl"));
  document.body.classList.remove("bigwin", "has-coach");
  if (el) el.innerHTML = "";
  window.__take = null;
  if (view === "play") startTimer();
}

function syncMascot() {
  const toastEl = document.getElementById("toast");
  const show = !!(toastEl && toastEl.classList.contains("show"));
  document.body.classList.toggle("has-billy-toast", !!(show && toastEl.querySelector(".toast-billy")));
  document.body.classList.toggle("has-heat", !!(show && toastEl.querySelector(".toast-billie.heat")));
}
function toast(text, mascot, kind) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.className = "toast show info";
  const img = mascot ? "<img class='toast-billie" + (kind === "heat" ? " heat" : "") + "' src='" + mascot + "' alt='Bubbles Billie'>" : "";
  el.innerHTML = img + "<div>" + text + "</div>";
  syncMascot();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 2500);
}
function queueToast(text, mascot, delay, kind) {
  if (!text) return;
  setTimeout(() => { if (view === "play") toast(text, mascot, kind); }, delay == null ? 1200 : delay);
}
function hideToast() {
  const el = document.getElementById("toast");
  if (el) el.className = "toast";
  syncMascot();
}
function showRollToast(settled, extra) {
  const el = document.getElementById("toast");
  if (!el) return;
  const net = settled.net || 0;
  const netHtml = net === 0 ? "" : "<b class='netpill " + (net > 0 ? "up" : "down") + "'>" + money(net) + "</b>";
  const billie = net > 0 && !isBigWin(settled)
    ? "<img class='toast-billie board-cheer' src='assets/mascots/billie/billie-C-winner.svg' alt='Bubbles Billie'>"
    : "";
  const note = extra ? "<span class='extranote'>" + extra + "</span>" : "";
  el.className = "toast show roll";
  const cap = settled.dice;
  const spoken = (cap.aria || "") + (net ? ", " + money(net) : "");
  el.innerHTML = billie + "<button data-act='toast-go' aria-label='Open the dice. " + esc(spoken) + "'>" +
    diceReadout(cap.d1, cap.d2, 24, { call: cap.word, hardTag: true, aria: cap.aria }) +
    netHtml + "<span class='tap'>TAP FOR DOME ›</span></button>" +
    note +
    "<button class='autoswipe" + (settings.showDice ? " on" : "") + "' data-act='autoswipe' aria-pressed='" + settings.showDice + "'>AUTO-SWIPE</button>";
  syncMascot();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, extra ? 3200 : 2500);
}

function intervalMs() {
  const n = [10, 15, 20, 30].indexOf(settings.autoInterval) >= 0 ? settings.autoInterval : 15;
  return n * 1000;
}
function startTimer() {
  stopTimer();
  if (!settings.autoRoll || autoPause || limitHold || view !== "play" || rolling) return;
  if (document.hidden) return;
  if (document.querySelector(".overlay, .recordcard, .coach")) return;
  timerStart = performance.now();
  const ms = intervalMs();
  const loop = (now) => {
    if (autoPause || document.hidden) return;
    const p = Math.min(1, (now - timerStart) / ms);
    document.querySelectorAll(".ring").forEach((ring) => { ring.style.setProperty("--p", (p * 100).toFixed(2) + "%"); });
    if (p >= 1) { doRoll("auto"); return; }
    timerRAF = requestAnimationFrame(loop);
  };
  timerRAF = requestAnimationFrame(loop);
}
function stopTimer() {
  if (timerRAF) cancelAnimationFrame(timerRAF);
  timerRAF = 0;
}

function toggleSetting(key) {
  if (key === "tutorTrack") return;
  settings[key] = !settings[key];
  if (key === "workingComeOut") game.placeWorkingOnComeOut = settings.workingComeOut;
  if (key === "autoRoll" && settings.autoRoll) {
    if ([10, 15, 20, 30].indexOf(settings.autoInterval) < 0) settings.autoInterval = 15;
    autoPause = "";
    emptyFelt = 0;
  }
  if (key === "autoRoll" && !settings.autoRoll) autoPause = "";
  if (key === "sound") A.setMuted(!settings.sound);
  if (key === "reduced") document.documentElement.classList.toggle("reduce", settings.reduced);
  save();
  paint();
  if (view === "play") startTimer();
}

function paint() {
  const scrolls = [...document.querySelectorAll(".page")].map((p) => p.scrollTop);
  const play = view === "play";
  app.classList.toggle("play", play);
  document.getElementById("hud").classList.toggle("hidden", !play);
  document.getElementById("stage").classList.toggle("hidden", !play);
  document.getElementById("dots").classList.toggle("hidden", !play);
  document.getElementById("dock").classList.toggle("hidden", !play);
  document.getElementById("panel").classList.toggle("hidden", play);
  document.getElementById("tabs").classList.toggle("hidden", play);
  document.getElementById("hud").innerHTML = play ? hudHTML() : "";
  document.getElementById("tabs").innerHTML = tabsHTML();
  const sheet = document.getElementById("betsheet");
  if (sheet) sheet.innerHTML = play && betsOpen ? betPanelHTML() : "";
    if (play) {
    document.getElementById("pager").innerHTML = pageHTML(0) + pageHTML(1) + pageHTML(2);
    mountLingo();
    fitFelt();   // board fix: lay out the new felt before the first frame (no flash of the default grid)
    syncDice();
    document.getElementById("dots").innerHTML = dotsHTML();
    document.getElementById("dock").innerHTML = dockHTML();
    snap();
    document.querySelectorAll(".page").forEach((p, i) => { if (scrolls[i]) p.scrollTop = scrolls[i]; });
    if (lingoHl) {
      const nodes = [...document.querySelectorAll(lingoHl)];
      const hlEl = nodes.find((n) => n.getBoundingClientRect().width > 0) || nodes[0];
      if (hlEl) hlEl.classList.add("lingo-hl");
    }
    if (coachOn) {
      markSpotlight();
      refreshCoachKicker();
    }
    requestAnimationFrame(() => { placeDice(); fitFelt(); measureChrome(); });
  } else {
    if (view === "fair") {
      noteFair();
      const panel = document.getElementById("panel");
      if (panel && !panel.dataset.fairscroll) {
        panel.dataset.fairscroll = "1";
        panel.addEventListener("scroll", () => { if (view === "fair") noteFair(); }, { passive: true });
      }
    }
    const diceHost = document.getElementById("dice-row");
    if (diceHost) { diceHost.hidden = true; }
    document.getElementById("panel").innerHTML = panelHTML();
    requestAnimationFrame(() => measureChrome());
  }
  let r5 = document.getElementById("r5-root");
  if (!r5) {
    r5 = document.createElement("div");
    r5.id = "r5-root";
    app.appendChild(r5);
  }
  r5.innerHTML = R5.markup();
  LC.markSpots(app);
}

function hudHTML() {
  const on = E.tableTotal(game);
  const pointName = game.point === 6 ? "SIX" : game.point === 9 ? "NINE" : (game.point || "");
  const puck = game.phase === "point"
    ? "<img class='puckimg' src='assets/icons/puck-on.svg' alt=''><span class='pointname'><span class='pointword'>POINT </span>" + pointName + "</span>"
    : "<img class='puckimg' src='assets/icons/puck-off.svg' alt='Puck off'>";
  const dice = game.lastDice ? "<span class='lastdice'>" + diceReadout(game.lastDice.d1, game.lastDice.d2, 16, { aria: game.lastDice.aria, tag: true }) + "</span>" : "";
  const mode = "<div class='seg modeseg'>" +
    "<button class='" + (game.mode === "regular" ? "on" : "") + "' data-act='mode' data-mode='regular'>Regular</button>" +
    "<button class='" + (game.mode === "crapless" ? "on" : "") + "' data-act='mode' data-mode='crapless'>Crapless</button></div>";
  return "<div class='hud-row1'><button class='homebtn' data-act='view' data-view='home' aria-label='Home'>" +
    "<img class='home-avatar' alt='' width='36' height='36' src='assets/mascots/dealer-billy/hud/hud-billy-A-36@1x.png' srcset='assets/mascots/dealer-billy/hud/hud-billy-A-36@1x.png 1x, assets/mascots/dealer-billy/hud/hud-billy-A-36@2x.png 2x, assets/mascots/dealer-billy/hud/hud-billy-A-36@3x.png 3x'>" +
    "<img class='home-mark' src='assets/logos/topleft-mark-ring-32.svg' alt=''></button>" +
    "<img class='lockup' src='assets/logos/topleft-lockup.svg' alt='Billy Bubs Bubble Craps'>" +
    mode + "</div>" +
    "<div class='hud-row2'><div class='hud-money'><div class='hud-bank'><small>Chips</small><strong>" + money(game.bankroll) + "</strong></div>" +
    "<div class='hud-bank'><small>On table</small><strong>" + money(on) + "</strong></div></div>" +
    rollHud() +
    "<div class='hud-puck hud-point'>" + puck + "</div>" + dice + heaterHTML(false) +
    limitChip() +
    "<button class='fairchip' data-act='view' data-view='fair' aria-label='Fair Dice'>FAIR</button></div>";
}

function tabsHTML() {
  const items = [
    ["play", "Play"],
    ["fair", "Fair Dice"],
    ["learn", "Learn"],
    ["premium", "Premium"],
    ["leaderboard", "Rolls"],
    ["settings", "Settings"],
  ];
  return items.map(([id, label]) => {
    const active = (id === "play" && (view === "play" || view === "home")) || view === id;
    const dest = id === "play" ? (view === "home" ? "home" : "play") : id;
    return "<button class='tab" + (active ? " on" : "") + "' data-act='view' data-view='" + dest + "'>" + icon(id) + label + "</button>";
  }).join("");
}

function icon(name) {
  const paths = {
    play: "M8 5v14l11-7z",
    fair: "M4 19V5M10 19V9M16 19V7M22 19H2",
    learn: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
    premium: "M12 3l2.2 6.6H21l-5.4 4 2.1 6.4L12 16.8 6.3 20l2.1-6.4L3 9.6h6.8z",
    leaderboard: "M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3M8 21h8M12 17v4",
    settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  };
  return "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' aria-hidden='true'><path d='" + (paths[name] || "") + "'/></svg>";
}

function dotsHTML() {
  const live = liveSideCount();
  const leftLabel = page === 0 ? "BOARD" : "‹ REPEATERS & HOPS";
  const rightLabel = page === 2 ? "BOARD" : "DOME ›";
  const leftPage = page === 0 ? 1 : 0;
  const rightPage = page === 2 ? 1 : 2;
  const badge = live ? "<i class='livebadge'>" + live + "</i>" : "";
  const dots = [0, 1, 2].map((i) => "<button class='dot" + (page === i ? " on" : "") + "' data-act='page' data-page='" + i + "' aria-label='" + ["Side bets", "Board", "Dice"][i] + "'></button>").join("");
  return "<button class='edgepill' data-act='page' data-page='" + leftPage + "'>" + leftLabel + badge + "</button>" +
    "<div class='dotrow'>" + dots + "</div>" +
    "<button class='edgepill' data-act='page' data-page='" + rightPage + "'>" + rightLabel + "</button>";
}

function pageHTML(i) {
  if (i === 0) return "<section class='page side'>" + sideHTML() + "</section>";
  if (i === 1) return "<section class='page'>" + boardHTML() + "</section>";
  return "<section class='page'>" + domeHTML() + "</section>";
}

function activeFieldPays() {
  return {
    two: settings.field2 === 3 ? 3 : 2,
    twelve: settings.field12 === 3 ? 3 : 2,
  };
}

function fieldSpot(stake) {
  const pays = activeFieldPays();
  const pres = E.fieldPresentation(pays.two, pays.twelve);
  const nums = [2, 3, 4, 9, 10, 11, 12].map((n) => {
    const ring = n === 2 ? pres.ring2 : n === 12 ? pres.ring12 : "";
    const cls = ring ? " dbl" + (ring === "triple" ? " triple" : "") : "";
    return "<i class='fn" + cls + "'>" + n + "</i>";
  }).join("");
  const aria = pres.aria + (stake ? ". Your bet: " + money(stake) : "");
  return "<button class='spot field" + (stake ? " has" : "") + "' data-act='bet' data-kind='field' aria-label='" + aria + "'>" +
    "<span class='fieldnums' aria-hidden='true'>" + nums + "</span>" +
    "<b>FIELD</b><small>" + pres.felt + "</small>" + stakeLabel(stake) + "</button>";
}

function spotButton(opts) {
  const stake = opts.stake || 0;
  const teach = opts.teach ? " data-teach='" + opts.teach + "'" : "";
  return "<button class='spot" + (opts.cls ? " " + opts.cls : "") + (stake ? " has" : "") + "' data-act='bet' data-kind='" + opts.kind + "'" +
    (opts.number != null ? " data-number='" + opts.number + "'" : "") +
    (opts.pair ? " data-pair='" + opts.pair + "'" : "") + teach +
    " aria-label='" + opts.label + (stake ? ", " + money(stake) : "") + "'" +
    " title='Long-press for lingo.'>" +
    "<small>" + opts.pay + "</small><b>" + opts.name + "</b>" + stakeLabel(stake) + (opts.extra || "") + "</button>";
}

function boardHTML() {
  const b = game.bets;
  const crapless = game.mode === "crapless";
  const horns = [
    [2, "1-1", "ACES", "30 TO 1"],
    [3, "1-2", "ACE DEUCE", "15 TO 1"],
    [11, "5-6", "YO", "15 TO 1"],
    [12, "6-6", "MIDNIGHT", "30 TO 1"],
  ];
  const horn = horns.map(([n, pair, name, pay]) => spotButton({
    kind: "hop", pair, number: n, name, pay, stake: b.hops[pair], label: name + " hop",
  })).join("");
  const hards = [[4, "7 TO 1"], [6, "9 TO 1"], [8, "9 TO 1"], [10, "7 TO 1"]].map(([n, pay]) => spotButton({
    kind: "hardway", number: n, name: "HARD " + n, pay, stake: b.hardways[n], label: "Hard " + n,
  })).join("");
  const lamps = [4, 6, 8, 10].map((n) => "<i class='lamp" + (game.progress.hardAllDay[n] ? " on" : "") + "'>" + n + "</i>").join("");
  const ats = "<div class='ats'>" + [
    ["small", "LOW ROLLS", "31 FOR 1"],
    ["all", "ROLL 'EM ALL", "156 FOR 1"],
    ["tall", "HIGH ROLLS", "31 FOR 1"],
  ].map(([kind, name, pay]) => spotButton({ kind, name, pay, stake: b[kind], label: name, extra: bonusLamps(kind) })).join("") + "</div>";
  const nums = E.numbersFor(game);
  const numHTML = nums.map((n) => {
    const come = game.bets.comeBets[n];
    const word = faceWord(n);
    const spelled = "";
    const amt = (c) => c ? "<b class='betamt'>" + money(c) + "</b>" : "";
    const dc = !crapless && game.bets.dontComeBets[n];
    const layTot = dc && dc.amount ? dc.amount + (dc.odds || 0) : 0;
    const layHalf = crapless ? "" : "<button class='half lay" + (layTot ? " has" : "") + "' data-act='bet' data-kind='dontComeOdds' data-number='" + n + "' aria-label='Lay " + n +
      (layTot ? ", Don’t Come " + money(dc.amount) + (dc.odds ? " plus lay odds " + money(dc.odds) : "") : ", needs a Don’t Come on " + n) + "'><span>LAY</span>" + chipStack(layTot) + amt(layTot) + "</button>";
    const onPuck = game.phase === "point" && game.point === n
      ? "<img class='feltpuck' src='assets/icons/puck-on.svg' alt='Point on'>"
      : "";
    return "<div class='numbox" + (!crapless && !layTot ? " nolay" : "") + "'>" + layHalf + "<button class='half buy" + (b.buy[n] ? " has" : "") + "' data-act='bet' data-kind='buy' data-number='" + n + "' aria-label='Buy " + n + (b.buy[n] ? ", " + money(b.buy[n]) : "") + "'><span>BUY</span>" +
      chipStack(b.buy[n]) + amt(b.buy[n]) + "</button><div class='face" + spelled + "'>" + word + onPuck +
      (come && come.amount ? "<div class='cmark'>C " + money(come.amount) + "</div>" : "") +
      "</div><button class='half place" + (b.place[n] ? " has" : "") + "' data-act='bet' data-kind='place' data-number='" + n + "' data-teach='place-" + n + "' aria-label='Place " + n + (b.place[n] ? ", " + money(b.place[n]) : "") + "'><span>PLACE</span>" +
      chipStack(b.place[n]) + amt(b.place[n]) + "</button></div>";
  }).join("");
  const dont = crapless ? "" : spotButton({ kind: "dontPass", name: "DON'T PASS", pay: "BAR 12", stake: b.dontPass, label: "Don't Pass" }) +
    spotButton({ kind: "dontPassOdds", name: "LAY", pay: "6x", stake: b.dontPassOdds, label: "Lay odds" });
  const dcPts = !crapless && Object.values(game.bets.dontComeBets).some((s) => s && s.amount);
  const nb = (numBet === "lay" && (crapless || !dcPts)) ? "place" : numBet;
  const seg = (m, label, off) => "<button type='button' class='" + m + (nb === m ? " on" : "") + "' data-act='numbet' data-mode='" + m + "' role='radio' aria-checked='" + (nb === m) + "'" +
    (off ? " disabled title='Lay odds need a Don’t Come on a number'" : "") + ">" + label + "</button>";
  const numToggle = "<div class='numbet' role='radiogroup' aria-label='Tap a number to'><small>NUMBERS</small>" +
    seg("place", "Place") + seg("buy", "Buy") + (crapless ? "" : seg("lay", "Lay", !dcPts)) + "</div>";
  const hornFoot = "<div class='hornfoot'>" +
    spotButton({ kind: "anyCraps", name: "ANY CRAPS", pay: "7 TO 1", stake: b.anyCraps, label: "Any Craps" }) +
    spotButton({ kind: "ce", name: "C & E", pay: "C 3:1 · E 7:1", stake: b.ce, label: "C and E" }) +
    spotButton({ kind: "horn", name: "HORN", pay: "4-WAY", stake: b.horn, label: "Horn four way" }) +
    "</div>";
  return "<div class='rail'><div class='felt felt-tex bfx mode-" + (crapless ? "crapless" : "regular") + "' data-numbet='" + nb + "'>" +
    "<div class='feltprint'><img src='assets/logos/billybubs-wordmark-small-felt-print-2ink.svg' alt='Billy Bubs'><span>★ PRACTICE · PLAY MONEY ★</span></div>" +
    ats +
    "<div class='nums " + (crapless ? "crap" : "reg") + "'>" + numHTML + "</div>" +
    "<div class='band comeband" + (crapless ? "" : " two") + "'>" +
    spotButton({ kind: "come", cls: "come", name: "COME", pay: crapless ? "7 WINS" : "7 · 11", stake: b.come, label: "Come" }) +
    (crapless ? "" : spotButton({ kind: "dontCome", name: "DON'T COME", pay: "BAR 12", stake: b.dontCome, label: "Don't Come" })) +
    numToggle + "</div>" +
    "<div class='band fieldband'>" + fieldSpot(b.field) + "</div>" +
    "<div class='prop'><div class='horncol'><div class='box2'>" + horn + "</div>" + hornFoot + "</div><div class='midcol'>" +
    spotButton({ kind: "any7", cls: "bigred", name: "BIG RED", pay: "4 TO 1", stake: b.any7, label: "Big Red any seven" }) +
    spotButton({ kind: "hardAllDay", cls: "hwad", name: "ALL DAY", pay: "165 FOR 1", stake: b.hardAllDay, label: "Hard Way All Day", extra: "<span class='lamps'>" + lamps + "</span>" }) +
    "</div><div class='box2'>" + hards + "</div></div>" +
    "<div class='band passline " + (crapless ? "two" : "four") + "'>" +
    spotButton({ kind: "pass", name: "PASS LINE", pay: "1 TO 1", stake: b.pass, label: "Pass Line", teach: "pass" }) +
    spotButton({ kind: "passOdds", name: "ODDS", pay: "3-4-5x", stake: b.passOdds, label: "Pass odds", teach: "passOdds" }) +
    dont + "</div></div></div>";
}

function bonusLamps(kind) {
  const set = kind === "small" ? [2, 3, 4, 5, 6] : kind === "tall" ? [8, 9, 10, 11, 12] : [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
  return "<span class='lamps'>" + set.map((n) => "<i class='lamp" + (game.progress[kind][n] ? " on" : "") + "'>" + n + "</i>").join("") + "</span>";
}

function betPanelHTML() {
  const crapless = game.mode === "crapless";
  const tabs = ["place", "buy", ...(crapless ? [] : ["lay"]), "odds", "repeaters"];
  if (!tabs.includes(betTab)) betTab = "place";
  const ledLast = game.lastDice ? diceReadout(game.lastDice.d1, game.lastDice.d2, 16, { aria: game.lastDice.aria }) : "<b>—</b>";
  let rows = "";
  if (betTab === "place" || betTab === "buy") {
    const kind = betTab;
    rows = E.numbersFor(game).map((n) => {
      const stake = game.bets[kind][n] || 0;
      const pay = kind === "place" ? placePayLabel(n) : buyPayLabel(n);
      const edge = E.edgeFor({ kind, number: n }, game.mode);
      const orig = (game.originals && game.originals[kind] && game.originals[kind][n]) || 0;
      const origLabel = orig ? " · orig " + money(orig) : "";
      return rowHTML(kind, n, n, pay + " · " + edge + "%" + origLabel, stake);
    }).join("");
  } else if (betTab === "odds") {
    rows = oddsRows();
  } else {
    rows = layRows();
  }
  const tabLabel = (id) => id === "repeaters" ? "REPEATERS ›" : id === "lay" ? "LAY" : id.toUpperCase();
  return "<div class='betscrim' data-act='bets'></div><section class='betpanel'>" +
    "<div class='sheetbar'><i class='sheethandle' data-act='bets'></i><button class='sheetx' data-act='bets' aria-label='Close bets'>×</button></div>" +
    "<div class='led ledglass'><div><span>POINT</span><b>" + (game.point || "OFF") + "</b></div><div><span>LAST ROLL</span>" + ledLast + "</div><div><span>BALANCE</span><b>" + money(game.bankroll) + "</b></div></div>" +
    "<div class='btabs'>" + tabs.map((id) => "<button class='btab" + (betTab === id ? " on" : "") + "' data-act='tab' data-tab='" + id + "'>" + tabLabel(id) + "</button>").join("") + "</div>" +
    (betTab === "place" || betTab === "buy" ? R5.quickHTML() : "") +
    "<div class='betlist'>" + rows + layoutExtras() + "</div></section>";
}

function layoutExtras() {
  const b = game.bets;
  const rows = [];
  const add = (kind, number, title, sub, stake) => {
    if (!stake) return;
    rows.push(rowHTML(kind, number, title, sub, stake));
  };
  if (game.phase === "come-out" && b.pass) add("pass", null, "Pass Line", "take down before a point", b.pass);
  if (b.come) add("come", null, "Come", "still in the Come box", b.come);
  if (game.mode !== "crapless" && b.dontCome) add("dontCome", null, "Don't Come", "before it moves to a number", b.dontCome);
  add("field", null, "Field", "2 and 12 pay 2 to 1", b.field);
  add("any7", null, "Big Red", "4 to 1", b.any7);
  add("anyCraps", null, "Any Craps", "7 to 1", b.anyCraps);
  add("ce", null, "C & E", "stays up when it wins", b.ce);
  add("horn", null, "Horn", "comes down in $4 units", b.horn);
  [4, 6, 8, 10].forEach((n) => add("hardway", n, "Hard " + n, "stays up until a 7 or the easy way", b.hardways[n]));
  add("small", null, "Low Rolls", "31 for 1", b.small);
  add("tall", null, "High Rolls", "31 for 1", b.tall);
  add("all", null, "Roll 'Em All", "156 for 1", b.all);
  add("hardAllDay", null, "Hard Way All Day", "165 for 1 · minus clears the lamps", b.hardAllDay);
  const billy = billyUp()
    ? "<button class='ghost' data-act='billy-down'>Take down Billy's Way</button>"
    : "";
  if (!rows.length && !billy) return "";
  return (rows.length ? "<p class='also'>Also on the layout</p>" + rows.join("") : "") + billy;
}

function billyUp() {
  const mark = game.billyMark;
  if (!mark) return false;
  const live = (kind) => Object.keys(mark[kind] || {}).some((n) => mark[kind][n] && (game.bets[kind][n] || 0) > 0);
  return live("place") || live("buy");
}

function rowHTML(kind, number, title, sub, stake, pair) {
  return "<div class='betrow'><button class='step' data-act='take' data-kind='" + kind + "'" +
    (number != null ? " data-number='" + number + "'" : "") + (pair ? " data-pair='" + pair + "'" : "") +
    " aria-label='Take down " + title + "'>−</button><div class='meta'><div><b>" + title + "</b><small> " + sub + "</small></div><b>" +
    (stake ? money(stake) : "—") + "</b></div><button class='step' data-act='bet' data-kind='" + kind + "'" +
    (number != null ? " data-number='" + number + "'" : "") + (pair ? " data-pair='" + pair + "'" : "") +
    " aria-label='Add chip to " + title + "'>+</button></div>";
}

function placePayLabel(n) {
  if (n === 6 || n === 8) return "7 to 6";
  if (n === 5 || n === 9) return "7 to 5";
  if (n === 4 || n === 10) return "9 to 5";
  if (n === 2 || n === 12) return "11 to 2";
  return "11 to 4";
}
function buyPayLabel(n) {
  if (n === 6 || n === 8) return "6 to 5, vig on win";
  if (n === 5 || n === 9) return "3 to 2, vig on win";
  if (n === 4 || n === 10) return "2 to 1, vig on win";
  if (n === 2 || n === 12) return "6 to 1, vig on win";
  return "3 to 1, vig on win";
}
function oddsRows() {
  const bits = [];
  const max = game.point && game.bets.pass ? E.maxPassOdds(game.bets.pass, game.point) : 0;
  bits.push(rowHTML("passOdds", null, "Pass odds", max ? "max " + money(max) : "after a point", game.bets.passOdds));
  Object.keys(game.bets.comeBets).forEach((n) => {
    const slot = game.bets.comeBets[n];
    if (!slot || !slot.amount) return;
    bits.push(rowHTML("comeOdds", Number(n), "Come " + n + " odds", "max " + money(E.maxPassOdds(slot.amount, Number(n))), slot.odds || 0));
  });
  if (bits.length === 1 && !game.bets.pass) bits[0] = "<p class='muted'>Bet the Pass Line on the come-out, then take odds.</p>";
  return bits.join("");
}
function layRows() {
  if (game.mode === "crapless") return "";
  const max = game.bets.dontPass ? E.maxLayOdds(game.bets.dontPass) : 0;
  let html = rowHTML("dontPass", null, "Don't Pass", "bar 12 · take down warns once a point is on", game.bets.dontPass);
  html += rowHTML("dontPassOdds", null, "Lay odds", max ? "max " + money(max) + " · wins 3x/4x/5x" : "need Don't Pass", game.bets.dontPassOdds);
  Object.keys(game.bets.dontComeBets).forEach((n) => {
    const slot = game.bets.dontComeBets[n];
    if (!slot || !slot.amount) return;
    html += rowHTML("dontComePoint", Number(n), "Don't Come " + n, "flat · take down gives up the edge", slot.amount);
    html += rowHTML("dontComeOdds", Number(n), "Lay " + n, "max " + money(E.maxLayOdds(slot.amount)), slot.odds || 0);
  });
  return html;
}

function sideHTML() {
  const reps = E.NUMBERS.map((n) => {
    const need = E.REPEATER_NEEDS[n];
    const have = game.repeaterCount[n] || 0;
    const stake = game.bets.repeaters[n] || 0;
    const lamps = Array.from({ length: Math.min(need, 8) }, (_, i) => "<i class='" + (i < have ? "on" : "") + "'></i>").join("");
    const on = sideFocus && sideFocus.kind === "repeater" && sideFocus.number === n ? " on" : "";
    return "<button class='rep" + (stake ? " has" : "") + on + "' data-act='bet' data-kind='repeater' data-number='" + n + "' aria-label='Repeater " + n + "'>" +
      edgeChip(E.REPEATER_EDGE[n]) + "<b>" + n + "</b><small>" + E.REPEATER_FOR[n] + " FOR 1</small>" +
      "<span class='rlamps'>" + lamps + "</span><em>" + have + "/" + need + "</em><small class='needlab'>needs " + need + "×</small>" +
      (stake ? chipStack(stake) : "") + "</button>";
  }).join("");
  const hornKeys = { "1-1": 1, "1-2": 1, "5-6": 1, "6-6": 1 };
  const hops = E.ALL_HOPS.map((key) => {
    const hard = E.HARD_HOPS.includes(key);
    const pair = key.split("-").map(Number);
    const stake = game.bets.hops[key] || 0;
    const tag = hornKeys[key] ? "<i class='horntag'>HORN</i>" : "";
    return "<button class='hop" + (hard ? " hard" : "") + (stake ? " has" : "") + "' data-act='bet' data-kind='hop' data-pair='" + key + "' aria-label='Hop " + key + "'>" +
      "<span class='hopdice'>" + miniDie(pair[0]) + miniDie(pair[1]) + "</span>" +
      "<b>" + (hard ? "HARD" : "EASY") + " " + (pair[0] + pair[1]) + "</b><small>" + (hard ? "30 TO 1" : "15 TO 1") + "</small>" +
      tag + (stake ? "<em>" + money(stake) + "</em>" : "") + "</button>";
  }).join("");
  const live = liveSideCount();
  return "<header class='sidehead'><b>REPEATERS · BEFORE ANY 7</b><span>STANDARD PAYS (FOR 1)</span><button data-act='for'>What's FOR 1?</button></header>" +
    "<p class='sub'>Hard hops 13.89% · easy hops 11.11%. Any 7 loses a repeater. Add only while the tally is 0.</p>" +
    "<div class='reps'>" + reps + "</div>" +
    "<header class='sidehead'><b>HOPS · ONE ROLL</b></header><div class='hops'>" + hops + "</div>" +
    "<article class='card livecard'><b>LIVE ON THIS SCREEN</b><p>" + (live ? live + " bet" + (live === 1 ? "" : "s") + " working." : "Nothing working yet.") + "</p></article>" +
    "<p class='billytip'><img src='assets/mascots/dealer-billy/small/billy-A-avatar-round.svg' alt=''><span>A hard hop is one roll. A hardway waits for a 7.</span></p>";
}

function domeCall() {
  if (rolling) return "Dice are out!";
  if (game.point === 6 || game.point === 9) return "Come on, " + (game.point === 6 ? "six" : "nine") + "!";
  if (game.point) return "Come on, " + game.point + "!";
  return "Coming out!";
}
function fairHistoryList(rolls) {
  if (!rolls || !rolls.length) return "";
  const cap = 80;
  const shown = rolls.slice(-cap);
  const start = rolls.length - shown.length;
  const rows = shown.slice().reverse().map((r, i) => {
    const n = start + shown.length - i;
    const time = r.at ? new Date(r.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—";
    const hard = r.d1 === r.d2 && (r.total === 4 || r.total === 6 || r.total === 8 || r.total === 10);
    const capRoll = E.rollCaption(r.d1, r.d2);
    return "<li><span class='hn'>" + n + "</span><time>" + esc(time) + "</time>" +
      diceReadout(r.d1, r.d2, 20, { aria: capRoll.aria, sevenOut: r.result === "seven-out" }) +
      (hard ? "<b class='hardtag'>Hard " + r.total + "</b>" : "") +
      "<span class='hline'>" + esc(String(r.result || "").replace(/-/g, " ")) + "</span></li>";
  }).join("");
  const note = rolls.length > cap
    ? "<p class='muted'>Showing the latest " + cap + " of " + rolls.length + ". CSV export stays numeric.</p>"
    : "<p class='muted'>Same rolls as a CSV export. Die 1 and die 2 stay numbers there.</p>";
  const pin = "<li class='pinhand'><span class='hn'>Now</span><span class='hline'>This hand · " + E.countPhrase(game.hand.rolls || 0, "roll") + (game.point ? " · point " + game.point : " · come-out") + "</span></li>";
  return "<article class='card'><h3>Roll history</h3>" + note + "<ol class='fairhist'>" + pin + rows + "</ol></article>";
}
function domeHTML() {
  const tier = E.blazingTier(E.blazingScore(game.hand), game.hand.points);
  const hood = tier === "hot" ? "hot" : tier === "blazing" ? "blazing" : "cold-warm";
  const heat = tier === "warm" ? " warm" : tier === "hot" ? " hot" : tier === "blazing" ? " blazing" : "";
  const jets = [18, 38, 62, 82].map((left, i) => "<i class='jet' style='left:" + left + "%;animation-delay:" + (i * 0.15) + "s'></i>").join("");
  const bubbles = [12, 24, 40, 55, 70, 82, 33].map((left, i) =>
    "<i class='bubble' style='left:" + left + "%;width:" + (8 + (i % 4) * 5) + "px;height:" + (8 + (i % 4) * 5) + "px;animation-delay:" + (i * 0.35) + "s'></i>").join("");
  const line = rolling
    ? "<div class='ledglass'>AIR ON · DICE OUT</div>"
    : "<div class='result-line'>" + (game.lastDice ? diceReadout(game.lastDice.d1, game.lastDice.d2, 32, { call: lastRoll && lastRoll.result === "seven-out" ? "SEVEN OUT" : game.lastDice.word, aria: game.lastDice.aria, roll: lastRoll }) : "READY") + "</div>";
  const win = !rolling && game.lastWin
    ? "<p class='hitline'>WIN · " + (game.lastWin.kind === "buy" ? "Buy " : "Place ") + game.lastWin.number + " +" + money(game.lastWin.profit) + "</p>"
    : "";
  const billyPose = rolling ? "billy-A-live.svg" : (game.phase === "point" ? "billy-A-live.svg" : "billy-A-hello.svg");
  return "<div class='dome-screen'><div class='machine hood-" + hood + heat + "'>" +
    "<img class='hood' src='assets/dome/dome-hood-" + hood + "@2x.webp' alt='Bubble craps dome'>" +
    "<div class='jets' aria-hidden='true'>" + jets + bubbles + "</div>" +
    "<div class='shine' aria-hidden='true'></div></div>" +
    "<div class='dome-cast'>" +
    "<img class='dome-billy' src='assets/mascots/dealer-billy/" + billyPose + "' alt='Dealer Billy'>" +
    "<p class='speech'>" + domeCall() + "</p></div>" +
    line + win + heaterHTML(true) +
    "<div class='rollstrip' aria-label='Last rolls'>" + rollTiles(game.history, { newestFirst: true, limit: 10, markLatest: true }) + "</div></div>";
}

function dockHTML() {
  const st = E.pressStatus(game);
  const chips = E.CHIPS.map((c) => "<button class='chip-btn" + (settings.chip === c ? " on" : "") + "' data-act='chip' data-cents='" + c + "' aria-label='$" + (c / 100) + " chip'>" + chipHTML(c) + "</button>").join("");
  const taps = game.pressStack.length;
  const pressLine = rolling ? "PRESS" : (st.pressOk ? "PRESS " + st.number + " +" + money(st.original) : "PRESS");
  const pressSub = rolling ? "after a hit" : (st.pressOk ? "→ " + money((st.stake || 0) + (st.original || 0)) : (st.pressReason || "after a hit"));
  let powerLine = "POWER PRESS";
  let powerSub = rolling ? "after a hit" : (st.powerReason || "after a hit");
  if (!rolling && st.powerOk) {
    const round = st.powerMode === "round" || st.powerMode === "round-capped";
    if (round) {
      powerLine = "POWER PRESS " + st.number + " +" + money(st.powerAdd || 0);
      powerSub = "round-down";
    } else {
      const buy = st.powerKind === "buy" ? "Buy " : "";
      powerLine = "POWER PRESS " + st.number + " → " + buy + money(st.powerTo || 0);
      powerSub = st.powerGive > 0 ? "add " + money(st.powerGive) : (st.powerBack > 0 ? "get " + money(st.powerBack) : "even");
    }
  }
  const undo = taps ? "<button class='undodisc' data-act='undo'" + (rolling ? " disabled" : "") + " aria-label='Undo press'>↺</button>" : "";
  const clear = taps ? "<button class='clearchip' data-act='clear'" + (rolling ? " disabled" : "") + " aria-label='Clear presses'>×</button>" : "";
  const secs = !settings.autoRoll ? "" : autoPause ? "PAUSED" : "AUTO " + (settings.autoInterval || 15) + "s";
  let context = "";
  if (page === 0) {
    context = "<div class='context leftkeys'><button class='key' data-act='same'>SAME BET</button><button class='key' data-act='addchip'>ADD A CHIP</button><button class='key' data-act='takedown'>TAKE DOWN</button></div>";
  } else if (page === 2) {
    context = "";
  } else {
    const way = E.billysWayAmounts(settings.chip);
    context = "<div class='context midkeys'><button class='key" + (game.betsOff ? " on" : "") + "' data-act='betsoff'>BETS OFF</button>" +
      "<button class='key primary' data-act='billy'>BILLY'S WAY<small>Buy " + money(settings.chip) + " · 6/8 " + money(way.place) + "</small></button>" +
      "<button class='key' data-act='reset'>RESET</button>" +
      "<button class='key betskey' data-act='bets'>BETS ▴</button></div>";
  }
  const stop = game.strategy && game.strategy.id !== "B13" && game.strategy.id !== "B14"
    ? stratOpts() + "<button class='key stopkey' data-act='stop-strategy'>Stop " + game.strategy.id + "</button>"
    : stratOpts();
  const pauseNote = autoPause === "empty" ? "Auto-roll paused · nothing on the felt"
    : autoPause === "short" ? "Auto-roll paused · not enough practice chips for your bets"
      : autoPause === "away" ? "Auto-roll paused while you were away"
        : autoPause === "limit" ? "Auto-roll paused"
          : autoPause ? "Auto-roll paused" : "";
  const resume = pauseNote ? "<button class='key resumekey' data-act='resume'>RESUME<small>" + pauseNote + "</small></button>" : "";
  return "<div class='dockgrid'><div class='dockleft'><div class='rack'><div class='trough'>" + chips + "</div></div>" +
    "<div class='presspair'><div class='presswrap'><button class='press-btn" + (st.pressOk && !rolling ? " live" : "") + "' data-act='press'" + (rolling || !st.pressOk ? " disabled" : "") + "><span class='pl1'>" + pressLine + "</span><small>" + pressSub + "</small></button>" + undo + clear + "</div>" +
    "<button class='press-btn power" + (st.powerOk && !rolling ? " live" : "") + "' data-act='power'" + (rolling || !st.powerOk ? " disabled" : "") + "><span class='pl1'>" + powerLine + "</span><small>" + powerSub + "</small></button></div></div>" +
    "<button class='roll-btn" + (R5.active() ? " yd" : "") + "' data-act='roll' aria-label='" + (R5.active() ? "Settle the entered roll" : "Roll the dice") + "'><span class='kicker'>" + (R5.active() ? "YOUR DICE" : secs) + "</span><span class='roll-face'>" + (R5.active() ? "SETTLE" : "ROLL") + "</span><span class='ring'></span></button></div>" +
    context + stop + resume;
}

function stratOpts() {
  const s = game.strategy;
  if (!s) return "";
  const data = s.data || (s.data = {});
  if (s.id === "B13") {
    const odds = data.odds || "max";
    const cap = Math.max(0, Math.floor(Number(data.cap) || 0));
    const oddsBtns = [["max", "Max odds"], ["2", "2x"], ["1", "1x"], ["flat", "Flat"]].map(([id, label]) =>
      "<button class='" + (odds === id ? "on" : "") + "' data-act='strat-odds' data-level='" + id + "'>" + label + "</button>").join("");
    const capBtns = [0, 1, 2, 3, 4, 5].map((n) =>
      "<button class='" + (cap === n ? "on" : "") + "' data-act='strat-cap' data-cap='" + n + "'>" + (n ? "Cap " + n : "Uncapped") + "</button>").join("");
    return "<div class='stropts'>" + oddsBtns + capBtns + "<button data-act='stop-strategy'>STOP B13</button></div>";
  }
  if (s.id === "B14") {
    const start = data.start === 8 ? 8 : 6;
    const ext = !!data.extend;
    const extBtn = game.mode === "crapless"
      ? "<button class='" + (ext ? "on" : "") + "' data-act='strat-extend' data-on='" + (ext ? "0" : "1") + "'>" + (ext ? "Extension on" : "Extension off") + "</button>"
      : "";
    return "<div class='stropts'>" +
      "<button class='" + (start === 6 ? "on" : "") + "' data-act='strat-start' data-start='6'>Start 6</button>" +
      "<button class='" + (start === 8 ? "on" : "") + "' data-act='strat-start' data-start='8'>Start 8</button>" +
      extBtn + "<button data-act='stop-strategy'>STOP B14</button></div>";
  }
  return "";
}
function panelHTML() {
  if (view === "home") return homeHTML();
  if (view === "fair") return fairHTML();
  if (view === "learn") return learnHTML();
  if (view === "lingo") return LC.screenHTML("bubble", lingo, "assets/", game.mode);
  if (view === "premium") return premiumHTML();
  if (view === "leaderboard") return leaderHTML();
  if (view === "settings") return settingsHTML();
  if (view === "etiquette") return etiquetteHTML();
  return homeHTML();
}

function homeHTML() {
  return "<section class='home'><div class='hometop'><span class='chippill'><img src='assets/chips/chip-brand-Bb.svg' alt=''>$1,000</span>" +
    "<button class='pill" + (settings.tutorOn ? " on" : "") + "' data-act='tips' aria-pressed='" + settings.tutorOn + "'>BILLY TIPS " + (settings.tutorOn ? "ON" : "OFF") + "</button></div>" +
    "<img class='logo' src='assets/logos/billybubs-bubble-craps-color-dark.svg' alt='Billy Bubs Bubble Craps'>" +
    "<div class='home-hero'><img class='hood' src='assets/dome/dome-hood-cold-warm@2x.webp' alt=''>" +
    dieImg(5, "home-d1") + dieImg(2, "home-d2") +
    "<img class='hello billy' src='assets/mascots/dealer-billy/billy-A-hello.svg' alt='Dealer Billy'>" +
    "<img class='hello billie' src='assets/mascots/billie/billie-C-hello.svg' alt='Bubbles Billie'>" +
    "<p class='speech'>Bets down! Air's coming on.</p></div>" +
    "<p class='choose'>CHOOSE YOUR RULES</p>" +
    "<div class='modes'><button class='mode-card on' data-act='play' data-mode='regular'><i class='starttag'>START HERE</i><b>Regular</b><span>Pass, Don't, odds 3-4-5x.</span>" + edgeChip(0.37) + "<small>Pass + odds</small></button>" +
    "<button class='mode-card' data-act='play' data-mode='crapless'><b>Crapless</b><span>Only a come-out 7 wins. No Don't. ATS counts the dice total.</span>" + edgeChip(1.26) + "<small>Pass + odds</small></button></div>" +
    "<button class='cta' data-act='play' data-mode='regular'><b>PLAY REGULAR</b><small>TAP ROLL · AUTO-ROLL OPTIONAL IN SETTINGS</small></button>" +
    "<div class='ghostrow'><button class='ghost' data-act='tour'>TAKE THE TUTOR TOUR</button><button class='ghost' data-act='billy-help'>WHAT'S BILLY'S WAY?</button></div>" +
    "<button class='ghost boardlink' data-act='view' data-view='leaderboard'>BADGES AND LONGEST ROLLS</button>" +
    "<button class='ghost boardlink' data-act='lingo'>CRAPS LINGO</button>" +
    "<a class='ghost boardlink' href='table/'>PLAY TABLE CRAPS</a>" +
    "<p class='billytip'>" + nextSessionTip(settings.tipCursor || 0, "bubble").tip.billy + "</p>" +
    "<div class='disclaimer'><b>Education only. Play money only.</b> No real gambling, no deposits, no payouts, no prizes. Every bankroll on this table is practice chips. 18+. " + RULE0_LINE + "</div></section>";
}

function learnHTML() {
  const filters = ["all", "regular", "crapless", "lessons"];
  const cards = S.STRATEGIES.filter((c) => learnFilter === "all" || c.filter.includes(learnFilter)).map((c) => {
    const pct = (String(c.edge).match(/(\d+(?:\.\d+)?)%/) || [0, "0"])[1];
    const fun = Number(pct) > 5 ? "<i class='funtag'>FUN, NOT SMART</i>" : "";
    const tags = c.filter.filter((f) => f !== "all").map((f) => "<i class='tagpill'>" + f.toUpperCase() + "</i>").join("");
    return "<article class='card learncard'>" + edgeChip(Number(pct)) + "<p class='tag'>" + c.id + "</p><div class='tagrow'>" + tags + fun + "</div><h3>" + c.name + "</h3><p class='clamp'>" + c.how + "</p><p class='muted'>" + c.bankroll + "</p>" +
      "<button class='run' data-act='strategy' data-id='" + c.id + "'>" + (c.lesson ? "Read ›" : "Run ›") + "</button></article>";
  }).join("");
  return "<h2>Strategy library</h2>" + learnRowHTML("bubble") + "<div class='filters'>" + filters.map((f) => "<button class='" + (learnFilter === f ? "on" : "") + "' data-act='filter' data-filter='" + f + "'>" + f[0].toUpperCase() + f.slice(1) + "</button>").join("") + "</div>" + cards;
}

function premiumHTML() {
  const presets = ["Standard", "Strip Classic", "Strip Deluxe", "Custom", "Downtown 10x"];
  const preview = {
    Standard: "Field 5.56% · Pass + max odds 0.37% Regular · 1.26% Crapless",
    "Strip Classic": "Field 5.56% · Odds 3-4-5x · Pass+Odds 0.37%",
    "Strip Deluxe": "Field 5.56% → 2.78% · Crapless odds 1-2-3-4-5x",
    Custom: "Saved table. Locked on this build. Field 5.56% → 2.78%",
    "Downtown 10x": "Pass+Odds 0.37% → 0.18% · Odds 10x",
  };
  const regular = premiumSet === "regular";
  const rows = [
    ["B-1", "Field 2 pays", "2:1"],
    ["B-2", "Field 12 pays", "2:1"],
    ["B-3", "Odds limit, Regular", "3-4-5x"],
    ["B-4", "Odds limit, Crapless", "3-3-3-4-5x"],
    ["B-5", "Lay odds limit", regular ? "Win 3/4/5x (lay ≤ 6x)" : "Not in Crapless"],
    ["B-6", "Buy commission timing", "On win only"],
    ["B-7", "Buy commission rounding", "Exact 5%, floored to the cent"],
    ["B-8", "Buy available on", "All numbers"],
    ["B-9", "Place/Buy working on come-out", "Off · free in Settings"],
    ["B-10", "Hardways working on come-out", "On"],
    ["B-11", "Don't Pass bar", regular ? "Bar 12" : "Not in Crapless"],
    ["B-12", "Table minimum", "$5"],
    ["B-13", "Table maximum", "$1,000"],
    ["B-31", "Power Press ladder", "Standard"],
    ["B-14", "Starting practice bankroll", "$1,000"],
    ["B-15", "Horn payouts", "30:1 / 15:1"],
    ["B-16", "Any 7 / Big Red", "4:1"],
    ["B-17", "Hardway payouts", "US 7:1 / 9:1"],
    ["B-18", "Side-bet toggles", "All on, including ATS"],
    ["B-19", "Hard Way All Day pay", "165 for 1 · 21.43%"],
    ["B-20", "ATS comes down after a hit", "Off (stays up)"],
    ["B-21", "ATS pay table", "31 / 31 / 156 for 1"],
    ["B-22", "Repeater pay table", "Standard 40/50/65/80/90"],
    ["B-23", "Repeater stay-up options", "All off"],
    ["B-24", "Repeaters in Crapless", regular ? "On" : "On"],
    ["B-25", "Crapless Place 2/12 · 3/11", regular ? "Regular only" : "11:2 · 11:4"],
    ["B-26", "Auto-roll", "Off by default · free in Settings"],
    ["B-28", "Auto-press after each hit", "Off · free in Settings"],
    ["B-29", "Hop pays", "15 / 30 to 1"],
    ["B-30", "Show the dice on each roll", "Off · free in Settings"],
  ];
  return "<h2>Bubble Craps Premium <span class='prembadge'>PREMIUM</span></h2><p class='lock'>Locked preview · no purchase on this test build</p><p>Every setting is visible. None of them change the live table. Standard rules stay on.</p><p class='footnote'>Sold per app · applies to Bubble Craps only</p>" +
    "<div class='seg'>" +
    "<button class='" + (regular ? "on" : "") + "' data-act='ruleset' data-set='regular'>Regular</button>" +
    "<button class='" + (!regular ? "on" : "") + "' data-act='ruleset' data-set='crapless'>Crapless</button></div>" +
    "<div class='filters'>" + presets.map((name) => "<button class='" + (premiumPreset === name ? "on" : "") + "' data-act='preset' data-preset='" + name + "'>" + name + "</button>").join("") + "</div>" +
    "<article class='card'><h3>Edge Preview</h3><p class='lock'>Locked</p><p>" + preview[premiumPreset] + "</p><p class='muted'>A Premium unlock would animate the old edge to the new one. Example: Field 5.56% → 2.78%.</p></article>" +
    rows.map(([id, label, value]) => "<div class='setting'><div><b>" + id + " " + label + "</b><div class='muted'>" + (regular ? "Regular" : "Crapless") + " · Standard</div></div><span class='lock'>" + value + "</span></div>").join("") +
    "<article class='card'><h3>Power Press ladder</h3><p class='lock'>Standard is live. Scaled and Custom stay locked.</p>" +
    "<p>6/8 Place: 6 → 18 → 42 → 90 → 210 → 450</p>" +
    "<p>4/10: 5 → 15 → 40 → 100 → 300 → 900 · Buy from $40</p>" +
    "<p>5/9: 5 → 15 → 36 → 86 → 200 → 500 · Buy from $36</p>" +
    "<p>Crapless Buy 2/12: 5 → 35 → 250 · 3/11: 5 → 20 → 80 → 320</p>" +
    "<p class='muted'>B-31 Scaled ×2, ×3, ×5, ×10, or Auto, and a custom ladder, do not change this table. B-13 range is $100–$5,000. Standard here is $1,000.</p></article>" +
    "<article class='card'><h3>With Premium you could preview</h3><p>Your casino's odds and payouts. Live house-edge preview. Presets. Fair Dice CSV export. Hard Way All Day 150–200 for 1. Repeater pay tables. A scaled or custom Power Press ladder.</p><p class='muted'>Table-style dice setting is not in Bubble Craps.</p></article>";
}

function limitSetting(which, label) {
  const spec = which === "win" ? settings.winGoal : settings.lossLimit;
  const kinds = [["off", "Off"], ["amount", "Amount"], ["pct", "%"]];
  const pcts = which === "win" ? [10, 25, 30, 50, 100] : [10, 20, 25, 40, 50];
  if (spec.kind === "pct" && pcts.indexOf(spec.pct) < 0) spec.pct = pcts[0];
  const detail = spec.kind === "amount" ? money(spec.amount || 2500) : spec.kind === "pct" ? spec.pct + "%" : "Off";
  return "<div class='setting stackpress'><div><b>" + label + "</b><div class='muted'>" + detail + ". Checked after each roll.</div></div><div class='seg'>" +
    kinds.map(([id, name]) => "<button class='" + (spec.kind === id ? "on" : "") + "' data-act='limit-kind' data-which='" + which + "' data-kind='" + id + "'>" + name + "</button>").join("") +
    "</div>" + (spec.kind === "off" ? "" : "<div class='stepper'><button class='step' data-act='limit-step' data-which='" + which + "' data-field='" + (spec.kind === "pct" ? "pct" : "amount") + "' data-dir='-1' aria-label='Lower " + label + "'>−</button><b>" + detail + "</b><button class='step' data-act='limit-step' data-which='" + which + "' data-field='" + (spec.kind === "pct" ? "pct" : "amount") + "' data-dir='1' aria-label='Raise " + label + "'>+</button></div>") +
    "</div>";
}
function longestPosted() {
  const a = L.bestEntry(boardData.entries, "regular");
  const b = L.bestEntry(boardData.entries, "crapless");
  return Math.max(a ? a.rolls : 0, b ? b.rolls : 0);
}
function settingsHTML() {
  const row = (key, label, detail) => "<div class='setting'><div><b>" + label + "</b><div class='muted'>" + detail + "</div></div><button class='switch" + (settings[key] ? " on" : "") + "' data-act='setting' data-key='" + key + "' role='switch' aria-checked='" + settings[key] + "' aria-label='" + label + "'><i></i></button></div>";
  return "<h2>Settings</h2>" +
    row("lingoLinks", "Lingo links on roll calls", "Roll calls open in Craps Lingo. On by default.") +
    row("sound", "Sound", "Dome pop, dice, chips, wins") +
    row("haptics", "Haptics", "Vibration where the phone allows it") +
    row("autoRoll", "Auto-roll", "Off until you turn it on. ROLL always works.") +
    "<div class='setting stackpress'><div><b>Auto-roll interval</b><div class='muted'>10, 15, 20, or 30 seconds. 15 the first time you turn it on.</div></div><div class='seg'>" +
    [10, 15, 20, 30].map((sec) => "<button class='" + (settings.autoInterval === sec ? "on" : "") + "' data-act='interval' data-sec='" + sec + "'>" + sec + "s</button>").join("") +
    "</div></div>" +
    limitSetting("loss", "Loss limit") +
    limitSetting("win", "Win goal") +
    "<div class='setting stackpress'><div><b>Leaderboard initials</b><div class='muted'>1 to 3 letters, A to Z. Stays on this device.</div></div>" +
    "<div class='inits setinits'>" + [0, 1, 2].map((i) => {
      const ch = ((boardData.initials && boardData.initials.default) || "")[i] || "";
      return "<input class='init' maxlength='1' value='" + esc(ch) + "' aria-label='Initial " + (i + 1) + "' autocomplete='off' autocapitalize='characters'>";
    }).join("") + "</div></div>" +
    "<p class='initerr'></p><div class='actions initactions'><button class='go' data-act='initials-save'>Save initials</button><button data-act='initials-apply'>Apply to my existing entries</button></div>" +
    row("workingComeOut", "Place and Buy working on come-out", "Off is Standard") +
    row("blazing", "Blazing meter", "Cosmetic only. Dice have no memory. It never changes odds or bets.") +
    row("showDice", "Show the dice on each roll", "Jumps to the dome, then back") +
    "<div class='setting stackpress'><div><b>Auto-press after each hit</b><div class='muted'>Billy's Way and the B5 coach. Off, PRESS, or POWER PRESS. Same odds, more at risk.</div></div><div class='seg'>" +
    ["off", "press", "power"].map((mode) => "<button class='" + (settings.autoPress === mode ? "on" : "") + "' data-act='auto-press' data-mode='" + mode + "'>" + (mode === "off" ? "Off" : mode === "press" ? "PRESS" : "POWER") + "</button>").join("") +
    "</div></div>" +
    "<div class='setting stackpress'><div><b>Auto-press max per number</b><div class='muted'>1 to 5. Default follows the coach at 3 when auto-press is Off.</div></div><div class='stepper'><button class='step' data-act='auto-max' data-dir='-1' aria-label='Lower auto-press max'>−</button><b>" + (settings.autoPressMax || 3) + "</b><button class='step' data-act='auto-max' data-dir='1' aria-label='Raise auto-press max'>+</button></div></div>" +
    row("reduced", "Reduced motion", "Cross-fade instead of sliding and tumbling") +
    "<div class='setting stacked'><div><b>Tutor track</b><div class='muted'>Beginner or experienced</div></div></div><div class='seg trackseg'><button class='" + (settings.tutorTrack === "beginner" ? "on" : "") + "' data-act='track' data-track='beginner'>Beginner</button><button class='" + (settings.tutorTrack === "experienced" ? "on" : "") + "' data-act='track' data-track='experienced'>Experienced</button></div>" +
    "<button class='cta' data-act='bank-reset'>Reset bankroll to $1,000</button>" +
    "<button class='ghost' data-act='fair-reset'>Reset Fair Dice history</button>" +
    "<button class='ghost' data-act='end-session' data-reason='end'>End session</button>" +
    "<button class='ghost' data-act='reset-records'>Reset badges and records</button>" +
    "<button class='ghost' data-act='view' data-view='etiquette'>Dealer Billy's table tips</button>" +
    R5.menuButtons() +
    "<p class='muted'>RNG: " + (E.getRngSource() === "unavailable" ? "unavailable" : "secure") + ". Dice use your device's secure random generator, with rejection sampling so every face is equal.</p>";
}

let etiquetteAt = 0;
function etiquetteHTML() {
  const deck = deckFor("bubble").all;
  const tip = deck[Math.min(etiquetteAt, deck.length - 1)];
  const seen = (boardData.progress && boardData.progress.etiquetteSeen) || [];
  const tag = tip.liveOnly ? "Live table" : "Both";
  const last = etiquetteAt >= deck.length - 1;
  return "<h2>Dealer Billy</h2><p class='muted'>Billy's Table Tip</p>" +
    "<article class='card'><h3>" + (Math.min(etiquetteAt, deck.length - 1) + 1) + " of " + deck.length + " · " + tip.topic + " · " + tag + "</h3><p>" + tip.billy + "</p><p>" + tip.why + "</p><p class='muted'>" + seen.length + " of " + deck.length + " viewed.</p></article>" +
    "<p>" + ETIQUETTE_FOOTER + "</p>" +
    "<div class='actions'>" +
    (etiquetteAt > 0 ? "<button data-act='etiq-prev'>Back</button>" : "") +
    (last ? "<button class='cta' data-act='etiquette-done'>Got it</button>" : "<button class='cta' data-act='etiq-next'>Next</button>") +
    "</div>" +
    "<button class='ghost' data-act='view' data-view='settings'>Back</button>";
}

function fairHTML() {
  const rolls = fairScope === "session" ? sessionRolls : fairScope === "last" ? allRolls.slice(-100) : allRolls;
  const test = F.totalsTest(rolls);
  const band = F.sevenBand(Math.max(rolls.length, 1));
  const sevens = rolls.filter((r) => r.total === 7).length;
  const sevenPct = rolls.length ? sevens / rolls.length : 0;
  const faces = F.facesTest(rolls, 1);
  const faces2 = F.facesTest(rolls, 2);
  const doubles = rolls.filter((r) => r.d1 === r.d2).length;
  let hi = { t: 2, d: -Infinity };
  let lo = { t: 2, d: Infinity };
  for (let t = 2; t <= 12; t++) {
    const d = (test.counts[t] || 0) - (test.expected[t - 2] || 0);
    if (d > hi.d) hi = { t, d };
    if (d < lo.d) lo = { t, d };
  }
  let peak = 1;
  for (let t = 2; t <= 12; t++) peak = Math.max(peak, test.counts[t] || 0, rolls.length * F.expectedRate(t));
  const cols = [];
  for (let t = 2; t <= 12; t++) {
    const got = test.counts[t] || 0;
    const h = Math.round((got / peak) * 100);
    const eh = Math.round((rolls.length * F.expectedRate(t) / peak) * 100);
    const ways = [0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1][t];
    cols.push("<div class='vcol'><span>" + got + "</span><div class='vtrack'><i class='" + (t === 7 ? "seven" : "") + "' style='height:" + h + "%'></i><em style='bottom:" + eh + "%'></em></div><b>" + t + "</b><small>" + ways + "/36</small></div>");
  }
  const readout = test.readout;
  const verdicts = {
    "Within normal range": "LOOKS FAIR",
    "A bit unusual": "A BIT UNUSUAL",
    "Rare result": "RARE RESULT",
    "Need more rolls": "NEED MORE ROLLS",
  };
  const verdict = verdicts[readout.badge] || readout.badge.toUpperCase();
  const hardCounts = { 4: 0, 6: 0, 8: 0, 10: 0 };
  rolls.forEach((r) => {
    if (r.d1 === r.d2 && hardCounts[r.total] != null) hardCounts[r.total] += 1;
  });
  const hardLine = [4, 6, 8, 10].map((n) => n + ": " + hardCounts[n] + " (fair " + (rolls.length / 36).toFixed(1) + ")").join(" · ");
  const repeat = rolls.length && F.streakStats(rolls).mostRepeats
    ? "Most times one number repeated in a hand: " + F.streakStats(rolls).mostRepeatTotal + " × " + F.streakStats(rolls).mostRepeats + "."
    : "Roll a hand to see how often one number repeats.";
  const fairLine = rolls.length < 180
    ? ""
    : "χ² " + test.chi2.toFixed(2) + " · 10 df · p = " + test.p.toFixed(2);
  const lastFair = rolls.slice(-20);
  return "<section class='fair'><h2 class='fairtitle'>FAIR DICE</h2><p class='shield'>" + verdict + "</p><p>" + readout.words + "</p>" +
    "<div class='filters'>" + [["session", "This session"], ["last", "Last 100"], ["all", "All time"]].map(([id, label]) => "<button class='" + (fairScope === id ? "on" : "") + "' data-act='fair-scope' data-scope='" + id + "'>" + label + "</button>").join("") + "</div>" +
    "<article class='card'><h3>Totals vs expected</h3><div class='vchart'>" + cols.join("") + "</div><p class='muted'>Dashed marks are the fair share. 7 is 6/36.</p></article>" +
    "<article class='card seven-card'><h3>Sevens</h3><p class='bigpct'>" + (rolls.length ? (sevenPct * 100).toFixed(1) : "0.0") + "%</p><p>vs 16.67% (1 in 6). Normal band " + (band.low * 100).toFixed(1) + "%–" + (band.high * 100).toFixed(1) + "%.</p></article>" +
    "<article class='card' id='fairness-card'><h3>Fairness test</h3>" + (fairLine ? "<p>" + fairLine + "</p>" : "") + "<p class='verdict'>" + verdict + "</p></article>" +
    "<article class='card'><h3>Each die</h3><p>Die 1 faces: " + faces.counts.join(" · ") + "</p><p>Die 1 χ² " + faces.chi2.toFixed(2) + " · df 5 · p " + faces.p.toFixed(3) + "</p><p>Die 2 faces: " + faces2.counts.join(" · ") + "</p><p>Die 2 χ² " + faces2.chi2.toFixed(2) + " · df 5 · p " + faces2.p.toFixed(3) + "</p><p class='muted'>Each face should be near 16.67%.</p></article>" +
    "<article class='card'><h3>Hard vs easy</h3><p>Doubles " + doubles + " of " + rolls.length + " (fair 16.67%).</p><p>Hard 4/6/8/10 vs 1/36 each. " + hardLine + "</p></article>" +
    "<article class='card'><h3>Above and below expected</h3><p>" + (rolls.length ? hi.t + ": " + (hi.d >= 0 ? "+" : "") + hi.d.toFixed(1) + " vs expected · " + lo.t + ": " + lo.d.toFixed(1) : "Roll to fill this in.") + "</p></article>" +
    (function () {
      const st = F.streakStats(rolls);
      return "<article class='card'><h3>Streaks</h3><p>Longest run without a 7: " + st.longestDry + ". Current run without a 7: " + st.currentDry + ".</p><p>In these rolls, longest hand: " + E.countPhrase(st.longestHand, "roll") + ". This hand: " + (game.hand.rolls || 0) + ". Longest hand all time: " + longestPosted() + ".</p><p>" + repeat + "</p><p class='muted'>A long gap is not a sign the next roll is different. A 7 is still 1 in 6.</p></article>";
    })() +
    "<p>" + RULE0_LINE + "</p>" +
    "<p class='muted'>RNG: secure.</p>" +
    "<article class='card'><h3>Last 20</h3><div class='rollstrip fairstrip'>" + rollTiles(lastFair, { newestFirst: false, markLatest: true }) + "</div></article>" +
    fairHistoryList(rolls) +
    "<p class='billytip'><img src='assets/mascots/dealer-billy/small/billy-A-avatar-round.svg' alt='Dealer Billy'><span>Every roll is random, from a secure generator. A seven is always 1 in 6.</span></p>" +
    "<button class='ghost' data-act='export'>Export CSV <span class='prembadge'>PREMIUM</span></button>" +
    "<button class='cta' data-act='view' data-view='play'>BACK TO DOME</button></section>";
}

load();
settings.tipCursor = ((settings.tipCursor || 0) + 1) % ETIQUETTE.length;
boardData = L.readStore(boardStore);
if (!settings.lossLimit) settings.lossLimit = { kind: "off", amount: 2500, pct: 25 };
if (!settings.winGoal) settings.winGoal = { kind: "off", amount: 2500, pct: 25 };
if (boardData.session) boardData.session = absorbIdle(boardData.session, Date.now());
game.placeWorkingOnComeOut = !!settings.workingComeOut;
A.setMuted(!settings.sound);
R5.attach({
  app: "bubble",
  premium: () => !!(boardData && boardData.premium) || localStorage.getItem("bb-bubble-entitlement") === "1",
  money,
  getGame: () => game,
  setGame: (g) => { game = g; },
  getRail: () => null,
  setRail: () => {},
  toast: (s) => toast(s),
  repaint: () => paint(),
  settings,
  save,
  noteBadge: (action) => {
    const ev = B.noteAction(boardData, action);
    boardData.badges = ev.store.badges;
    boardData.progress = ev.store.progress;
    saveBoard();
  },
  resetTo: (cents) => {
    settings.bankPreset = cents;
    resetTable();
  },
  onEnter: () => { view = "play"; page = 1; },
});
mount();
if (!localStorage.getItem("bb-bubble-session-tip")) {
  localStorage.setItem("bb-bubble-session-tip", "1");
  const tip = nudgeFor("session_start", "bubble");
  if (tip) toast(tip.billy);
}
if (boardData.pending && !(boardData.initials && boardData.initials.asked)) {
  pendingRecord = boardData.pending;
  const preview = L.previewRoll(boardData, pendingRecord);
  if (preview.madeWeek || preview.madeAll) showRecordCard(preview);
}
if (view === "play") startTimer();
/*TEST_HOOK_START*/
if (TEST_BUILD) {
  window.__bbShowMarquee = (id) => {
    clearTimeout(badgeTimer);
    badgeTimer = 0;
    const def = B.badgeById(id || "spin_the_block");
    if (def) showBadgeToast(def);
  };
  window.__bbQueueMarquee = (id) => {
    const def = B.badgeById(id || "spin_the_block");
    if (!def) return;
    if (badgeQueue.indexOf(def.id) < 0) badgeQueue.push(def.id);
    if (!badgeTimer) pumpBadges();
  };
}
/*TEST_HOOK_END*/
