/**
 * Billy Bubs Table Craps. Reuses the shared engine, rail, dice, celebration
 * and strategies. Does not import the Bubble UI.
 */
import * as E from "./engine.mjs";
import * as TR from "./table-rules.mjs";
import * as Rail from "./rail.mjs";
import * as TS from "./table-strategies.mjs";
import * as R from "./replay.mjs";
import * as Et from "./etiquette.mjs";
import * as PC from "./point-celebration.mjs";
import * as PT from "./point-tier.mjs";
import { cancelMoments, showPSO } from "./pso.mjs";
import { SETS, orient, cssMatrix, turn, rotateDie, matchSetKey, axisTotals } from "./tc-dice.mjs";
import { resolveSwipe } from "./swipe.mjs";
import * as Badges from "./badges.mjs";
import * as IAP from "./iap.mjs";
import { TEST_BUILD } from "./build-flags.mjs";
import * as Lg from "bb-lingo";
import * as LC from "./lingo-ctrl.mjs";
import { callButton, learnRowHTML } from "./lingo-view.mjs";
import { rotateGateHTML } from "./rotate.mjs";
import * as R5 from "./r5-ui.mjs";
import * as RS from "./roll-speed.mjs";
import { pageForLink, ipadLayout, shootAct } from "./board-page.mjs";
import * as Tiers from "./tiers.mjs";

const A = "../assets/";
const STORE = "bb-table-craps-v1";
const PREM = "bb-table-premium";
const app = document.getElementById("app");
const reducedMQ = matchMedia("(prefers-reduced-motion: reduce)");

const settings = {
  chip: 500,
  theme: "billy",
  colorUp: "offer",
  sound: true,
  haptics: true,
  tutor: true,
  numbet: "place",
  premium: false,
  set: "3V",
  lingoLinks: true,
  rollSpeed: "normal",
  tier: "standard",
  includePoint: false,
  field12: 2,
  field2: 2,
};

let game = E.createGame({ profile: "table" });
let rail = Rail.railBreakdown(game.bankroll);
let rebuilt = 0;
let page = 1;
let screen = "play";
let rolling = false;
let offer = null;
let convert = null;
let tutorId = "T1";
let tutorStep = 0;
let changeNote = "";
let toastText = "";
let strategyId = "";
let compareRun = null;
let filter = "all";
let menu = false;
let diceFaces = [orient(3, 5), orient(3, 1)];
let lastFaces = null;
let throwPower = 56;
let sessionBase = 0;
let sessionHold = false;
let sessionPrompt = null;
let comparePick = ["T1", "T2", "T5", "T6", "T7", "T23"];
let compareSeed = "482113907";
let compareLen = 300;
let compareMany = null;
let compareSeeds = 100;
let etiquetteAt = 0;
let etiquetteSeen = [];
let toastTimer = 0;
let toastKey = "";
let queuedTip = "";
let payNote = "";
let setFaces = [orient(3, 5), orient(3, 1)];
let showingRoll = false;
const BOWL_DICE = [orient(5, 1), orient(3, 2), orient(2, 6), orient(6, 4), orient(4, 5)];
let bowlPicked = [];
let bowlSwept = false;
let bowlSweeping = false;
let sweepTimer = 0;
let holdFelt = false;
let holdFeltTimer = 0;
let lastRotDir = ["", ""];
let lingo = LC.freshLingo();
let swallowLingo = false;
let lingoOrigin = null;
function betSpot(node) {
  const hold = node && node.closest ? node.closest("[data-act='num'], [data-act='spot']") : null;
  if (!hold || hold.closest(".tc-shoot, .tc-keys, [data-act='throw']")) return null;
  return hold;
}
function psoHaptic(name) {
  if (settings.haptics === false || !navigator.vibrate) return;
  navigator.vibrate(name === "success" ? [12, 40, 12] : 10);
}
function throwHaptic(name) {
  if (name !== "light" || settings.haptics === false || !navigator.vibrate) return;
  navigator.vibrate(10);
}
function openLingoFrom(el) {
  lingoOrigin = LC.originSelector(el);
  lingo.sheet = LC.spotFromEl(el, settings.numbet);
  lingo.confirm = false;
  lingo.why = false;
  lingo.peekId = null;
  swallowLingo = true;
  const term = Lg.termForSpot(lingo.sheet, "table");
  render();
  if (term) watchLingo(term.id);
  LC.focusSheet();
}
let lastRoll = null;
let compareWorker = null;
let compareJob = 0;
let compareProgress = "";
const nudged = Object.create(null);

function money(c) { return E.formatMoney(c); }
function premiumOn() {
  return settings.premium === true || localStorage.getItem("bb-table-entitlement") === "1";
}
function save() {
  localStorage.setItem(STORE, JSON.stringify({ game, rail, settings, rebuilt }));
}
function load() {
  settings.premium = localStorage.getItem("bb-table-entitlement") === "1";
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || "null");
    if (!raw || !raw.game) return;
    game = raw.game;
    E.tableTotal(game);
    if (raw.settings) Object.assign(settings, raw.settings);
    applySet(settings.set);
    if (raw.rail && Rail.railMatches(raw.rail, game.bankroll)) rail = raw.rail;
    else {
      rail = Rail.railBreakdown(game.bankroll);
      rebuilt += 1;
    }
  } catch {
    rail = Rail.railBreakdown(game.bankroll);
  }
}

function sync(note) {
  const moved = Rail.syncRail(rail, game.bankroll);
  rail = moved.rail;
  if (moved.breaks && moved.breaks.length) {
    changeNote = moved.breaks.map((b) => b.label).join(" · ");
    const src = moved.breaks[0].from || 100;
    const el = document.querySelector(".stack[data-chip='" + src + "']");
    const rect = el && el.getBoundingClientRect();
    if (rect) requestAnimationFrame(() => fanFrom(rect, src >= 100 ? src : 100));
    if (!localStorage.getItem("bb-table-change-seen")) {
      toastText = "Here's your change.";
      localStorage.setItem("bb-table-change-seen", "1");
    }
  } else if (!note) {
    changeNote = "";
  }
  if (note) changeNote = note;
  save();
  return moved;
}

function chipImg(cents) {
  const file = { 100: "1", 500: "5", 2500: "25", 10000: "100", 50000: "500" }[cents] || "5";
  return A + "chips/chip-" + file + "-value.svg";
}

function betHTML(amt, tag) {
  if (!amt) return "";
  return "<span class='bet'>" + "<img src='" + chipImg(amt >= 50000 ? 50000 : amt >= 10000 ? 10000 : amt >= 2500 ? 2500 : amt >= 500 ? 500 : 100) + "' alt=''>" +
    "<span class='amt'>" + (tag ? "<i>" + tag + "</i>" : "") + money(amt) + "</span></span>";
}

function feltHTML() {
  const b = game.bets;
  const pres = E.fieldPresentation((game.rules && game.rules.field2) || 2, (game.rules && game.rules.field12) || 2);
  const num = (n) => {
    const pt = game.point === n;
    const lay = (b.lay && b.lay[n]) || 0;
    const buy = b.buy[n] || 0;
    const place = b.place[n] || 0;
    const come = (b.comeBets[n] && b.comeBets[n].amount) || 0;
    const pay = n === 6 || n === 8 ? "7:6" : n === 5 || n === 9 ? "7:5" : "9:5";
    return "<button class='spot numbox" + (pt ? " point" : "") + "' data-act='num' data-n='" + n + "' aria-label='" + n + "'>" +
      "<span class='half lay'>" + (lay ? "<span class='amt'><i>L</i>" + money(lay) + "</span>" : "LAY") + "</span>" +
      "<span class='half buy'>" + (buy ? "<span class='amt'><i>B</i>" + money(buy) + "</span>" : "BUY") + "</span>" +
      "<span class='face'><span class='d'>" + n + "</span>" + (come ? "<span class='amt'><i>C</i>" + money(come) + "</span>" : "") +
      (pt ? "<img class='puck' data-puck src='" + A + "icons/puck-on.svg' alt=''>" : "") + "</span>" +
      "<span class='half place'>" + (place ? "<span class='amt'><i>P</i>" + money(place) + "</span>" : pay) + "</span></button>";
  };
  const hop = (a, b, id, pay, amt) => "<button class='spot' data-act='spot' data-kind='" + id + "'><span class='pd'><img src='" + A + "dice/faces/face-" + a + ".svg' alt=''><img src='" + A + "dice/faces/face-" + b + ".svg' alt=''></span><span class='sub'>" + pay + "</span>" + betHTML(amt) + "</button>";
  const lamps = (ns, on) => "<span class='lamps'>" + ns.map((n) => "<i class='" + (on[n] ? "on" : "") + "'></i>").join("") + "</span>";
  const feltDice = lastFaces ? "<div class='tc-felt-dice' aria-hidden='true' data-d1='" + lastFaces.d1 + "' data-d2='" + lastFaces.d2 + "'>" + cubeHTML(orient(lastFaces.d1, legalFront(lastFaces.d1)), "sm") + cubeHTML(orient(lastFaces.d2, legalFront(lastFaces.d2)), "sm b") + "</div>" : "";
  return "<div class='tc-felt' id='felt'><div class='tc-felt-wall' aria-hidden='true'></div>" + feltDice + R5.quickHTML() +
    "<div class='ats'>" +
    "<button class='spot' data-act='spot' data-kind='small'><span class='lb'>SMALL</span>" + betHTML(b.small) + lamps([2, 3, 4, 5, 6], game.progress.small || {}) + "<span class='sub'>31 FOR 1</span></button>" +
    "<button class='spot' data-act='spot' data-kind='all'><span class='lb'>ALL</span>" + betHTML(b.all) + lamps([2, 3, 4, 5, 6, 8, 9, 10, 11, 12], game.progress.all || {}) + "<span class='sub'>156 FOR 1</span></button>" +
    "<button class='spot' data-act='spot' data-kind='tall'><span class='lb'>TALL</span>" + betHTML(b.tall) + lamps([8, 9, 10, 11, 12], game.progress.tall || {}) + "<span class='sub'>31 FOR 1</span></button></div>" +
    "<div class='nums'>" + [4, 5, 6, 8, 9, 10].map(num).join("") + "</div>" +
    "<div class='comerow'><button class='spot come' data-act='spot' data-kind='come'><span class='lb'>COME</span>" + betHTML(b.come) + "</button>" +
    "<div class='numbet' role='radiogroup' aria-label='Number bet'>" +
    ["place", "buy", "lay"].map((k) => "<button data-act='numbet' data-k='" + k + "' class='" + (settings.numbet === k ? "on" : "") + "' role='radio' aria-checked='" + (settings.numbet === k) + "'>" + k.toUpperCase() + "</button>").join("") +
    "</div><button class='spot dc' data-act='spot' data-kind='dontCome'><span class='lb'>DON'T COME</span><span class='sub'>BAR " + ((game.rules && game.rules.bar) || 12) + "</span>" + betHTML(b.dontCome) + "</button></div>" +
    "<button class='spot field' data-act='spot' data-kind='field' aria-label='" + pres.aria + "'>" +
    "<span class='fn ring'>2</span><span class='fn'>3</span><span class='fn'>4</span><span class='fn'>9</span><span class='fn'>10</span><span class='fn'>11</span><span class='fn ring'>12</span>" +
    "<span class='fl'>" + pres.felt + "</span>" + betHTML(b.field) + "</button>" +
    "<div class='props'><div class='horn'>" +
    hop(1, 1, "hop:1-1", "30:1", b.hops["1-1"]) + hop(1, 2, "hop:1-2", "15:1", b.hops["1-2"]) +
    hop(5, 6, "hop:5-6", "15:1", b.hops["5-6"]) + hop(6, 6, "hop:6-6", "30:1", b.hops["6-6"]) +
    "</div><button class='spot bigred' data-act='spot' data-kind='any7'><span class='lb'>BIG RED</span><span class='sub'>ANY 7 · 4 TO 1</span>" + betHTML(b.any7) + "</button>" +
    "<button class='spot hwad' data-act='spot' data-kind='hardAllDay'><span class='lb'>HARD WAY ALL DAY</span><span class='sub'>165 FOR 1</span>" + betHTML(b.hardAllDay) + "</button>" +
    "<div class='hard'>" + hop(2, 2, "hardway:4", "7:1", b.hardways[4]) + hop(3, 3, "hardway:6", "9:1", b.hardways[6]) + hop(4, 4, "hardway:8", "9:1", b.hardways[8]) + hop(5, 5, "hardway:10", "7:1", b.hardways[10]) + "</div></div>" +
    "<div class='line'>" +
    "<button class='spot pass' data-act='spot' data-kind='pass'><span class='lb'>PASS LINE</span>" + betHTML(b.pass) + "</button>" +
    "<button class='spot' data-act='spot' data-kind='passOdds'><span class='lb'>ODDS</span><span class='sub'>3-4-5X</span>" + betHTML(b.passOdds) + "</button>" +
    "<button class='spot' data-act='spot' data-kind='dontPass'><span class='lb'>DON'T PASS</span><span class='sub'>BAR 12</span>" + betHTML(b.dontPass) + "</button>" +
    "<button class='spot' data-act='spot' data-kind='dontPassOdds'><span class='lb'>LAY ODDS</span><span class='sub'>UP TO 6X</span>" + betHTML(b.dontPassOdds) + "</button></div></div>";
}

function railHTML() {
  const order = [50000, 10000, 2500, 500, 100];
  const stacks = order.map((d) => {
    const n = rail[d] || 0;
    const vis = Math.min(n, Rail.DISPLAY_CAP);
    const chips = Array.from({ length: vis }, (_, i) => "<i class='ch" + (i === vis - 1 ? " top" : "") + "' style='bottom:" + (12 + i * 3) + "px;background-image:url(" + chipImg(d) + ")'></i>").join("");
    const badge = Rail.badgeText(n);
    return "<button class='stack" + (n ? "" : " empty") + (settings.chip === d ? " sel" : "") + "' data-act='chip' data-chip='" + d + "' aria-pressed='" + (settings.chip === d) + "'>" +
      chips + (badge ? "<span class='cnt'>" + badge + "</span>" : "") + "<span class='den'>$" + (d / 100) + "</span></button>";
  }).join("");
  return "<div class='tc-rail tc-stack-host' role='group' aria-label='" + Rail.railGroupLabel(rail) + "'><div class='rtot'>PRACTICE CHIPS <b>" + money(Rail.railTotal(rail)) + "</b></div><div class='trough'>" + stacks + "</div></div>";
}

function fireRail(size) {
  const lit = game.firePoints || [];
  const locked = !game.fireOpen;
  return "<div class='tc-fire " + size + (locked ? " locked" : "") + "'><span class='fl'>FIRE<br>BET</span>" +
    [4, 5, 6, 8, 9, 10].map((n) => "<span class='med" + (lit.indexOf(n) >= 0 ? " lit" : "") + "'>" + n + "</span>").join("") +
    "<span class='cnt'>" + lit.length + " of 6</span></div>";
}

function fireStake() {
  const room = Math.max(0, 1000 - (game.bets.fire || 0));
  return Math.min(room, 100);
}
function sideHTML() {
  const open = !!game.fireOpen;
  const add = fireStake();
  const reps = [[2, 40], [3, 50], [4, 65], [5, 80], [6, 90], [8, 90], [9, 80], [10, 65], [11, 50], [12, 40]];
  const hops = [];
  for (let a = 1; a <= 6; a++) hops.push([a, a]);
  for (let a = 1; a <= 6; a++) for (let b = a + 1; b <= 6; b++) hops.push([a, b]);
  return "<div class='tc-side'>" +
    "<button type='button' class='hopcue' data-act='hops'>Hops · scroll to one-roll bets</button>" +
    "<section class='tc-firetile" + (open ? " open" : " locked") + "'><header><b>FIRE BET</b><span class='chip'>" + (open ? "OPEN · UNTIL THE FIRST ROLL" : "LOCKED · NEW SHOOTER") + "</span></header>" +
    fireRail("l") +
    "<div class='pay'><span><b>4 pts</b> 24 to 1</span><span><b>5 pts</b> 249 to 1</span><span><b>6 pts</b> 999 to 1</span></div>" +
    "<div class='row'><span class='edge r'>20.76%</span><span class='lim'>$1–$10</span>" +
    "<button class='betbtn' data-act='fire' " + (open && add ? "" : "disabled") + ">" + (open ? "ADD " + money(add || 100) : "LOCKED") + "</button></div>" +
    "<p class='note'>" + (open ? "Bet now: it closes at this shooter's first come-out roll." : "Your Fire Bet rides until the seven-out. It can't come down now.") + "</p></section>" +
    "<section class='tc-reps'><header><b>REPEATERS</b><span class='edge r'>18–22%</span></header><div class='reps'>" +
    reps.map(([n, pay]) => "<button class='rep' data-act='spot' data-kind='repeater:" + n + "'><b>" + n + "</b><small>" + pay + " FOR 1</small></button>").join("") +
    "</div></section>" +
    "<section class='tc-hops' id='hops'><header><b>HOPS · ONE ROLL</b><span class='edge r'>11–14%</span></header><p class='scrollhint'>Scroll for every hop</p><div class='hg'>" +
    hops.map(([a, b]) => "<button class='hop" + (a === b ? " hard" : "") + "' data-act='spot' data-kind='hop:" + a + "-" + b + "'><span><img src='" + A + "dice/faces/face-" + a + ".svg' alt=''><img src='" + A + "dice/faces/face-" + b + ".svg' alt=''></span><small>" + (a === b ? "30" : "15") + " TO 1</small></button>").join("") +
    "</div></section></div>";
}
function cubeHTML(o, cls, dir) {
  const full = orient(o.top, o.front) || o;
  const faces = [1, 2, 3, 4, 5, 6].map((f) => "<i class='f f" + f + "' style='background-image:url(" + A + "dice/faces/face-" + f + ".svg)'></i>").join("");
  return "<div class='tc-cube " + (cls || "") + "' data-top='" + full.top + "' data-front='" + full.front + "' data-right='" + (full.right || "") + "' data-left='" + (full.left || "") + "' data-back='" + (full.back || "") + "' data-bottom='" + (full.bottom || "") + "'" + (dir ? " data-dir='" + dir + "'" : "") + "><div class='c' style='transform:var(--view) " + cssMatrix(full.top, full.front) + "'>" + faces + "</div></div>";
}
function pips(d1, d2, sz) {
  const tot = d1 + d2;
  return "<span class='pipro' role='img' aria-label='" + d1 + " and " + d2 + ", " + tot + "'><img src='" + A + "dice/faces/face-" + d1 + ".svg' width='" + sz + "' height='" + sz + "' alt=''><img src='" + A + "dice/faces/face-" + d2 + ".svg' width='" + sz + "' height='" + sz + "' alt=''><b class='tot" + (tot === 7 ? " seven" : "") + "'>" + tot + "</b></span>";
}

function stickHookSVG() {
  return "<div class='tc-stick-hook" + (bowlSwept ? " active" : "") + (bowlSweeping ? " sweeping" : "") + "' aria-hidden='true'>" +
    "<svg viewBox='0 0 220 52' fill='none' xmlns='http://www.w3.org/2000/svg'>" +
    "<path d='M218 16 L46 16 C18 16 8 22 8 34 C8 44 20 48 38 46 L62 42' stroke='#8B5A2B' stroke-width='6.5' stroke-linecap='round'/>" +
    "<path d='M218 16 L46 16 C18 16 8 22 8 34 C8 44 20 48 38 46 L62 42' stroke='#E2BC62' stroke-width='2.2' stroke-linecap='round' stroke-dasharray='10 6'/>" +
    "<rect x='62' y='11.5' width='11' height='9' rx='2' fill='#FFE7A0' stroke='#6E5420' stroke-width='1.2'/>" +
    "<circle cx='62' cy='42' r='3.5' fill='#FFE7A0'/>" +
    "</svg></div>";
}

function setReadoutInnerHTML() {
  const key = matchSetKey(setFaces);
  const label = SETS[key] ? SETS[key].name : "Custom Set";
  const axes = axisTotals({ dice: setFaces }).map((row) => row[1]).join(" · ");
  return "<small>YOUR SET · " + label + "</small>" +
    "<b>Top " + pips(setFaces[0].top, setFaces[1].top, 18) + " <span class='front-faces'>· Front " + setFaces[0].front + "–" + setFaces[1].front + "</span></b>" +
    "<span>On axis: " + axes + "</span>";
}

function dieSlotHTML(i) {
  return "<div class='die-slot' data-die='" + i + "'>" +
    "<span class='d-dir up' data-dir='front' aria-hidden='true' title='Rotate front (up)'>▲</span>" +
    "<span class='d-dir left' data-dir='left' aria-hidden='true' title='Rotate left'>◀</span>" +
    cubeHTML(diceFaces[i], i ? "lg b" : "lg", lastRotDir[i]) +
    "<span class='d-dir right' data-dir='right' aria-hidden='true' title='Rotate right'>▶</span>" +
    "<span class='d-dir down' data-dir='back' aria-hidden='true' title='Rotate back (down)'>▼</span>" +
    "</div>";
}

function shooterHTML() {
  const last = lastFaces ? "<div class='result'><small>LAST ROLL</small>" + pips(lastFaces.d1, lastFaces.d2, 32) + rollCallHTML() + "</div>" : "<div class='result'><small>LAST ROLL</small><span>No roll yet</span></div>";
  const bowlBtns = BOWL_DICE.map((o, i) => {
    const isPicked = bowlPicked.indexOf(i) >= 0;
    const isSwept = bowlSwept && !isPicked;
    const cls = "pick" + (isPicked ? " on" : "") + (bowlSwept && isPicked ? " kept" : "") + (isSwept ? " swept" : "");
    return "<button type='button' class='" + cls + "' data-act='pick' data-i='" + i + "' data-kept='" + (bowlSwept && isPicked ? "1" : "0") + "' data-swept='" + (isSwept ? "1" : "0") + "' aria-pressed='" + isPicked + "'" + (isSwept ? " disabled aria-hidden='true' tabindex='-1'" : "") + ">" + cubeHTML(o, "sm") + "</button>";
  }).join("");
  const callBtn = bowlSwept ? "<button type='button' class='call-dice' data-act='call-dice' aria-label='Call 5 dice'>5 DICE</button>" : "";
  const miniDice = lastFaces ? "<div class='tc-table-dice' aria-hidden='true'>" + cubeHTML(orient(lastFaces.d1, legalFront(lastFaces.d1)), "sm") + cubeHTML(orient(lastFaces.d2, legalFront(lastFaces.d2)), "sm b") + "</div>" : "";
  return "<div class='tc-shooter'>" +
    "<div class='table'><div class='wall'></div><div class='mini-felt' aria-hidden='true'><span class='mf-nums'><i></i><i></i><i></i><i></i><i></i><i></i></span><span class='mf-band'></span><span class='mf-pass'></span></div>" + miniDice + "<div class='tlabel'>BOTH DICE MUST HIT THE BACK WALL</div>" + fireRail("s") +
    "<div class='lockcap'>" + (game.fireOpen ? "OPEN · BEFORE THE FIRST ROLL" : "LOCKED · " + (game.firePoints || []).length + " OF 6") + "</div></div>" +
    "<div class='bowl" + (bowlSwept ? " swept" : "") + (bowlSweeping ? " sweeping" : "") + "' data-swept='" + (bowlSwept ? "1" : "0") + "' data-picked='" + bowlPicked.join(",") + "' aria-label='Pick 2 of 5'>" + bowlBtns + stickHookSVG() + callBtn + "</div>" +
    "<div class='sets' role='radiogroup'>" + Object.keys(SETS).map((k) => {
      const s = SETS[k];
      return "<button data-act='set' data-set='" + k + "' class='" + (settings.set === k ? "on" : "") + "'><b>" + s.name + "</b><small>" + (s.aka || "for practice") + "</small></button>";
    }).join("") + "</div>" +
    "<div class='setview'><div class='pair'>" + dieSlotHTML(0) + dieSlotHTML(1) + "</div>" +
    "<div class='gest'><span>↕ drag front / back</span><span>↔ drag left / right</span><span>tap = 90° turn</span></div>" +
    "<div class='readout'>" + setReadoutInnerHTML() + "</div></div>" +
    last +
    "<div class='meter'><small>THROW POWER</small><div class='bar'><i style='left:" + throwPower + "%'></i></div><small class='r'>" + (throwPower < 18 ? "SOFT · NO ROLL" : throwPower < 45 ? "EASY" : throwPower < 75 ? "MEDIUM" : "HARD") + "</small></div>" +
    "<p class='note'>Set dice are practice only. The throw does not change the roll. A soft toss is a no-roll and draws nothing.</p>" +
    R5.yourDicePanel() + "</div>";
}

function pickerHTML() {
  const rows = TS.TABLE_STRATEGIES.filter((c) => {
    if (filter === "all") return true;
    if (filter === "free") return c.tier === "free";
    if (filter === "premium") return c.tier === "premium";
    return c.filters.indexOf(filter) >= 0 || c.risk === filter;
  });
  return "<div class='tc-sheet tc-picker'><header class='sh'><small>TABLE CRAPS · STRATEGIES</small><h1>Pick a strategy</h1>" +
    learnRowHTML("table") +
    "<div class='filters'>" + ["all", "light", "dark", "hedge", "press", "warn", "free", "premium"].map((f) => "<button data-act='filter' data-f='" + f + "' class='" + (filter === f ? "on" : "") + "'>" + f + "</button>").join("") + "</div>" +
    "<div class='sum'><span><b>16</b> Free</span><span><b>8</b> Premium</span><button class='cmp' data-act='screen' data-screen='compare'>COMPARE</button></div></header>" +
    "<div class='list'>" + rows.map((c) => "<button class='strow" + (c.warning ? " warn" : "") + "' data-act='strat' data-id='" + c.id + "'><span class='rk'>" + c.n + "</span><span class='nm'><b>" + c.name + "</b><small>" + c.id + "</small></span><span class='edge'>" + c.edge + "</span><span class='tier " + (c.warning ? "warn" : c.tier === "premium" ? "prem" : "free") + "'>" + (c.warning ? "FREE · WARNING" : c.tier === "premium" ? "PREMIUM" : "FREE") + "</span></button>").join("") + "</div>" +
    "<p>No system beats the edge. Practice chips only.</p><a href='../'>Bubble Craps</a></div>";
}

function tutorialHTML() {
  const steps = TS.tutorial(tutorId);
  const step = steps[Math.min(tutorStep, steps.length - 1)];
  const card = TS.strategyById(tutorId);
  return feltHTML() + "<div class='tc-coach' data-mascot='billy'><img src='" + A + "mascots/dealer-billy/billy-A-tip.svg' alt='Dealer Billy'><div><div class='kick'>TUTORIAL · " + (card ? card.name : "") + "</div></div><div class='body'>" + (step ? step.text : "") + "</div><div class='acts'><button data-act='tutor-back'>BACK</button><button class='go' data-act='tutor-next'>NEXT</button><button data-act='screen' data-screen='play'>EXIT</button></div></div>";
}

function chartHTML(runs) {
  const W = 600, H = 220, pad = { l: 46, r: 8, t: 12, b: 22 };
  const ys = runs.flatMap((r) => r.line);
  const ymin = Math.min(0, ...ys);
  const ymax = Math.max(...ys, 1);
  const n = Math.max(1, runs[0].line.length - 1);
  const X = (i) => pad.l + (i / n) * (W - pad.l - pad.r);
  const Y = (v) => pad.t + (1 - (v - ymin) / (ymax - ymin || 1)) * (H - pad.t - pad.b);
  const dash = ["", "8 4", "2 3", "10 3 2 3", "5 2", "1 4"];
  const paths = runs.map((r, j) => {
    const d = r.line.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(v).toFixed(1)).join("");
    return "<path d='" + d + "' fill='none' stroke='var(--cmp-" + (j + 1) + ")' stroke-width='2.2' stroke-dasharray='" + dash[j] + "'/>";
  }).join("");
  const rows = runs.slice().sort((a, b) => b.net - a.net).map((r, i) => "<tr" + (i ? "" : " class='top'") + "><td>" + r.id + (i ? "" : " <small>top on this replay</small>") + "</td><td>" + money(r.net) + "</td><td>" + money(r.maxDrawdown) + "</td><td>" + money(r.low != null ? r.low : Math.min.apply(null, r.line)) + "</td></tr>").join("");
  const legend = runs.map((r, j) => "<li data-leg><svg width='26' height='10' aria-hidden='true'><line x1='1' x2='25' y1='5' y2='5' stroke='var(--cmp-" + (j + 1) + ")' stroke-width='3' stroke-dasharray='" + dash[j] + "'/></svg><b>" + r.id + "</b><span>" + (TS.strategyById(r.id) ? TS.strategyById(r.id).name : r.id) + "</span><em class='" + (r.net < 0 ? "neg" : "") + "'>" + money(r.net) + "</em></li>").join("");
  return "<div class='cmpbody'><figure class='chart'><svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Bankroll by roll'>" + paths + "</svg><figcaption>Same dice. Past rolls don't predict future rolls.</figcaption></figure><div class='cmpside'><ol class='legend'>" + legend + "</ol><table class='mt'><caption>Top on this replay</caption><thead><tr><th>Plan</th><th>Net</th><th>Max drop</th><th>Low</th></tr></thead><tbody>" + rows + "</tbody></table></div></div>";
}

function demoCompare() {
  if (compareRun && compareRun.runs && compareRun.runs.length) return compareRun;
  const seq = R.rollSequenceFromSeed(482113907, 80);
  compareRun = R.compare(seq.dice, ["T1", "T5", "T6"], { rules: game.rules });
  return compareRun;
}
function segButtons(act, value, options) {
  return "<div class='seg' role='group'>" + options.map((n) => "<button type='button' data-act='" + act + "' data-value='" + n + "' class='" + (Number(value) === n ? "on" : "") + "'>" + n + "</button>").join("") + "</div>";
}
function pct(n) { return Math.round((Number(n) || 0) * 100) + "%"; }
function compareHTML() {
  const picks = TS.TABLE_STRATEGIES.map((c) => {
    const on = comparePick.indexOf(c.id) >= 0;
    return "<button type='button' class='chip" + (on ? " on" : "") + "' data-act='cmpick' data-id='" + c.id + "' aria-pressed='" + on + "'>" + c.id + "</button>";
  }).join("");
  const controls = "<div class='cmpcontrols'><label class='seedlab'>Seed <input data-act='seed' value='" + compareSeed + "' inputmode='numeric'></label>" +
    "<div class='segwrap'><span>ROLLS</span>" + segButtons("length", compareLen, [100, 500, 1000, 5000]) + "</div>" +
    "<button type='button' data-act='run-compare'>Replay</button>" +
    "<div class='segwrap'><span>SEEDS</span>" + segButtons("seed-count", compareSeeds, [100, 1000]) + "</div>" +
    "<button type='button' data-act='many-seeds'>Many seeds</button>" +
    (compareWorker ? "<button type='button' data-act='many-cancel'>Cancel</button>" : "") +
    "<button type='button' data-act='csv-compare'>Fair Dice history</button>" +
    "<button type='button' data-act='csv-pick'>Import CSV</button>" +
    "<input class='csvhidden' type='file' data-act='csv-file' accept='.csv,text/csv' tabindex='-1'></div>" +
    (compareProgress ? "<p class='cmpprogress'>" + compareProgress + "</p>" : "") +
    "<p class='pickhint'>Pick up to 6</p><div class='cmpicks'>" + picks + "</div>";
  if (!premiumOn()) {
    const demo = demoCompare();
    return "<div class='tc-sheet tc-compare'><h1>Strategy Comparison</h1><p class='warnline'><b>Past rolls don't predict future rolls.</b> Standard play shows one locked demo. Changing it opens Premium.</p>" +
      chartHTML(demo.runs) +
      "<button class='go' data-act='screen' data-screen='paywall'>Unlock comparison</button></div>";
  }
  const many = compareMany && compareMany.summary ? "<table class='mt spread'><caption>Many seeds · spread</caption><thead><tr><th>Plan</th><th>Min</th><th>Q1</th><th>Median</th><th>Q3</th><th>Max</th><th>Ahead</th><th>E[loss]</th><th>Stop</th></tr></thead><tbody>" +
    Object.keys(compareMany.summary).map((id) => {
      const s = compareMany.summary[id];
      return "<tr><td>" + id + "</td><td>" + money(s.min) + "</td><td>" + money(s.q1) + "</td><td>" + money(s.median) + "</td><td>" + money(s.q3) + "</td><td>" + money(s.max) + "</td><td>" + pct(s.aheadPct) + "</td><td>" + money(s.expectedLoss) + "</td><td>" + pct(s.stopPct) + "</td></tr>";
    }).join("") + "</tbody></table>" : "";
  return "<div class='tc-sheet tc-compare'><header class='sh'><small>STRATEGY COMPARISON · PREMIUM</small><h1>Same dice, different plans.</h1><p class='warnline'><b>Past rolls don't predict future rolls.</b> Every strategy here has a house edge.</p></header>" +
    controls +
    (compareRun ? chartHTML(compareRun.runs) : "<p>Run a replay to chart it.</p>") +
    many +
    "<p class='seed'>Seed " + compareSeed + " · " + compareLen + " rolls · " + R.SEEDED_RNG_NAME + ". 40% stop-loss and +30% win goal apply. Top on this replay.</p></div>";
}

function paywallHTML() {
  return "<div class='tc-sheet tc-pay'><button class='x' data-act='screen' data-screen='play' aria-label='Close'>✕</button>" +
    "<img class='mascot' src='" + A + "mascots/dealer-billy/billy-A-tip.svg' alt='Dealer Billy'>" +
    "<small>ONE-TIME UNLOCK</small><h1>Table Craps Premium</h1><ul>" +
    ["Custom house rules: 10x odds, Field 3:1, presets", "8 Premium strategies + tutorials", "Strategy Comparison: replay up to 6 plans", "Fair Dice CSV export · saved presets"].map((t) => "<li>" + t + "</li>").join("") +
    "</ul><p class='honest'>Premium doesn't change the dice or the odds. Practice chips only. Sold per app: applies to Table Craps only.</p>" +
    "<button class='buy' data-act='unlock'>Unlock for $4.99</button><p class='paystatus' role='status'>" + (payNote || "") + "</p><div class='sub'><button data-act='restore'>Restore purchases</button><button data-act='screen' data-screen='play'>Not now</button></div>" +
    "<p class='fine'>One-time purchase · no subscription · 18+ · practice only</p></div>";
}

function etiquetteCard() {
  const deck = Et.deckFor("table").all;
  const tip = deck[Math.min(etiquetteAt, deck.length - 1)];
  const seen = etiquetteSeen.length;
  return "<article class='card etiquette-card'><h3>" + tip.n + " of 15 · " + tip.topic + "</h3><p>" + tip.billy + "</p><p>" + tip.why + "</p>" +
    "<p class='muted'>" + seen + " of 15 viewed this session.</p></article>";
}
function menuHTML() {
  const deck = Et.deckFor("table").all;
  const tip = deck[Math.min(etiquetteAt, deck.length - 1)];
  const last = etiquetteAt >= deck.length - 1;
  return "<div class='tc-sheet tc-menu'><h1>Table</h1><button class='r5-row' data-act='leave'>Leave table</button>" +
    "<a class='r5-row' href='../'>Bubble Craps</a>" +
    "<button class='r5-row' data-act='lingo'>Craps Lingo</button>" + R5.menuButtons() +
    "<label class='tc-toggle'>Lingo links on roll calls <button data-act='lingo-links'>" + (settings.lingoLinks !== false ? "On" : "Off") + "</button></label>" +
    "<label>Color up <select data-act='color-setting'><option value='offer'" + (settings.colorUp === "offer" ? " selected" : "") + ">Offer</option><option value='auto'" + (settings.colorUp === "auto" ? " selected" : "") + ">Auto</option><option value='off'" + (settings.colorUp === "off" ? " selected" : "") + ">Off</option></select></label>" +
    "<label>Theme <select data-act='theme'><option value='billy'>Billy navy</option><option value='midnight'" + (settings.theme === "midnight" ? " selected" : "") + ">Midnight</option><option value='classic'" + (settings.theme === "classic" ? " selected" : "") + ">Classic</option><option value='highlimit'" + (settings.theme === "highlimit" ? " selected" : "") + ">High limit</option></select></label>" +
    "<p>" + TR.RULE0_LINE + "</p><h2>Dealer Billy</h2><p class='muted'>Billy's Table Tip</p>" +
    etiquetteCard() +
    "<div class='acts' style='display:flex;gap:8px'>" +
    (etiquetteAt > 0 ? "<button data-act='etiq-prev' style='height:44px;min-width:44px;padding:0 12px'>Back</button>" : "") +
    (last ? "<button data-act='etiquette-done' style='height:44px;min-width:44px;padding:0 12px'>Got it</button>" : "<button data-act='etiq-next' style='height:44px;min-width:44px;padding:0 12px'>Next</button>") +
    "</div><p>" + Et.ETIQUETTE_FOOTER + "</p></div>";
}
function fairHTML() {
  const hist = (game.history || []).slice(0, 20);
  const rows = hist.map((r) => "<li>" + pips(r.d1, r.d2, 16) + " <span>" + (r.result || "") + "</span></li>").join("");
  return "<div class='tc-sheet'><h1>Fair Dice</h1><p>" + TR.RULE0_LINE + "</p><p>RNG: " + (E.getRngSource() === "unavailable" ? "unavailable" : "secure") + ".</p>" +
    "<h2>Last 20</h2><ol class='fairhist'>" + (rows || "<li>No rolls yet.</li>") + "</ol>" +
    "<button data-act='screen' data-screen='play' style='height:44px'>Back to the table</button></div>";
}

function hintSpots(html) {
  return html.replace(/data-act='(spot|num)'/g, "data-act='$1' title='Long-press for lingo.'");
}
function rollCallHTML() {
  if (!lastRoll || settings.lingoLinks === false) return "";
  const term = Lg.callTerm(lastRoll, "table");
  if (!term) return "";
  const text = lastRoll.result === "no-roll" ? "No roll" : (lastRoll.word || "");
  if (!text) return "";
  return callButton(text, term, term.srLabel);
}
function stageHTML() {
  if (screen === "lingo") return LC.screenHTML("table", lingo, A, "regular");
  if (screen === "picker") return pickerHTML();
  if (screen === "tutorial") return tutorialHTML();
  if (screen === "compare") return compareHTML();
  if (screen === "paywall") return paywallHTML();
  if (screen === "fair") return fairHTML();
  if (menu) return menuHTML();
  if (page === 0) {
    const back = ipadLayout(innerWidth, innerHeight)
      ? "<button class='tc-edge' data-act='page' data-page='1'>BOARD</button>"
      : "";
    return back + hintSpots(sideHTML());
  }
  if (page === 2 && !ipadLayout(innerWidth, innerHeight)) return hintSpots(feltHTML()) + shooterHTML();
  const edge = ipadLayout(innerWidth, innerHeight)
    ? "<button class='tc-edge' data-act='page' data-page='0'>SIDE BETS</button>"
    : "";
  return edge + hintSpots(feltHTML());
}
function kindName(kind) {
  if (kind === "place") return "Place";
  if (kind === "buy") return "Buy";
  if (kind === "lay") return "Lay";
  return kind;
}
function convertCopy(c) {
  const from = kindName(c.from) + " " + money(c.amount);
  const to = kindName(c.to) + " " + money(c.amount);
  let why = "Buy pays true odds; the 5% commission is taken only when it wins.";
  if (c.to === "lay") why = "Lay wins if a 7 comes first; the 5% commission is taken only when it wins.";
  if (c.to === "place") why = "Place pays the place odds. No commission.";
  return "You have <b>" + from + "</b> on the " + c.number + ". Switch it to <b>" + to + "</b>? " + why;
}

function render() {
  app.dataset.theme = settings.theme || "billy";
  const point = game.point;
  const offerHTML = offer ? "<div class='tc-offer' role='status'><div class='t'><b>" + offer + "</b></div><button class='go' data-act='color-up'>COLOR UP</button><button class='x' data-act='color-dismiss' aria-label='Not now'>×</button></div>" : "";
  const conv = convert ? "<div class='tc-coach convert' data-mascot='billy'><img src='" + A + "mascots/dealer-billy/billy-A-tip.svg' alt='Dealer Billy'><div class='kick'>One bet per number · " + convert.number + "</div><div class='body'>" + convertCopy(convert) + "</div><div class='acts'><button class='go' data-act='convert'>CONVERT TO " + kindName(convert.to).toUpperCase() + "</button><button data-act='keep'>KEEP " + kindName(convert.from).toUpperCase() + "</button></div></div>" : "";
  const tutorCard = tutorLine ? "<div class='tc-coach convert' data-mascot='billy' id='tutor-line'><img src='" + A + "mascots/dealer-billy/billy-A-tip.svg' alt='Dealer Billy'><div class='kick'>TUTOR · " + tutorLine.title + "</div><div class='body'>" + tutorLine.body + "</div><div class='acts'><button class='go' data-act='tutor-dismiss'>Got it</button></div></div>" : "";
  const sessionCard = sessionPrompt ? "<div class='tc-coach convert' data-mascot='billy'><img src='" + A + "mascots/dealer-billy/billy-A-tip.svg' alt='Dealer Billy'><div class='kick'>" + sessionPrompt + "</div><div class='body'>40% stop-loss and +30% win goal, measured from the bankroll you started with.</div><div class='acts'><button data-act='sess-stop'>STOP HERE</button><button class='go' data-act='sess-keep'>KEEP PLAYING</button><button data-act='sess-new'>NEW SESSION</button></div></div>" : "";
  const names = ["SIDE BETS", "BOARD", "SHOOTER"];
  const left = page > 0 ? "<button class='pill' data-act='page' data-page='" + (page - 1) + "'><span class='cap'>‹ " + names[page - 1] + "</span></button>" : "<span class='pill' hidden></span>";
  const right = page < 2 ? "<button class='pill' data-act='page' data-page='" + (page + 1) + "'><span class='cap'>" + names[page + 1] + " ›</span></button>" : "<span class='pill' hidden></span>";
  const ipad = ipadLayout(innerWidth, innerHeight);
  app.classList.toggle("ipad-land", ipad && innerWidth > innerHeight);
  app.classList.toggle("ipad-port", ipad && innerHeight >= innerWidth);
  app.classList.toggle("shooter-page", page === 2 && !ipad && screen === "play" && !menu);
  app.classList.toggle("rolling-felt", (rolling || holdFelt) && page === 2 && !ipad && screen === "play" && !menu);
  app.dataset.ipad = ipad ? "1" : "";
  const actShoot = shootAct({ yourDice: R5.active(), screen, menu, page, ipad });
  const shoot = actShoot === "throw"
    ? "<button class='tc-shoot" + (R5.active() ? " yd" : "") + "' data-act='throw'><small>" + (R5.active() ? "YOUR DICE" : "YOUR THROW") + "</small><b>" + (R5.active() ? "SETTLE" : "SHOOT") + "</b></button>"
    : "<button class='tc-shoot' data-act='go-shooter'><small>GO TO</small><b>SHOOTER</b></button>";
  const aside = ipad && screen === "play" && !menu ? "<aside class='tc-ipad-shooter'>" + shooterHTML() + "</aside>" : "";
  const hudPips = lastFaces ? pips(lastFaces.d1, lastFaces.d2, 16) : "";
  app.innerHTML = "<header class='tc-hud'><button class='avbtn' data-act='menu' aria-label='Dealer Billy, menu'><img class='av' alt='' src='" + A + "mascots/dealer-billy/hud/hud-billy-A-36@2x.png'></button>" +
    "<div class='money'><div><small>Practice chips</small><b>" + money(game.bankroll) + "</b></div><div><small>On table</small><b>" + money(E.tableTotal(game)) + "</b></div></div>" +
    hudPips +
    "<img class='puck' data-puck alt='" + (point ? "Point " + point : "Puck off") + "' src='" + A + "icons/puck-" + (point ? "on" : "off") + ".svg'>" +
    "<button class='fair' data-act='fair'>FAIR</button></header>" +
    "<main class='tc-stage' id='stage'>" + stageHTML() + conv + tutorCard + sessionCard +
    (toastText && screen === "play" && !menu ? "<div class='tc-toast' role='status'><b>" + toastText + "</b>" + (changeNote ? "<small>" + changeNote + "</small>" : "") + "</div>" : "") +
    (screen === "play" && !menu ? LC.peekBlock("table", lingo, A, "regular") + LC.sheetBlock("table", lingo, game, { asset: A, rolling, money, tutorOn: settings.tutor, mode: "regular" }) : "") +
    "</main>" + aside +
    "<div class='tc-dots'>" + left +
    "<span class='dots'>" + [0, 1, 2].map((i) => "<button data-act='page' data-page='" + i + "' aria-label='" + ["Side bets", "Board", "Dice"][i] + "'><i class='" + (page === i ? "on" : "") + "'></i></button>").join("") + "</span>" +
    right + "</div>" +
    "<footer class='tc-dock'>" + offerHTML + railHTML() + shoot + "</footer>" +
    "<nav class='tc-keys'><button data-act='screen' data-screen='play'" + (screen === "play" && !menu ? " class='on'" : "") + ">BETS</button><button data-act='screen' data-screen='picker'>STRATEGIES</button><button data-act='tutor'>TUTOR</button><button data-act='menu'>STATS</button></nav>" +
    R5.markup({ dice: false }) +
    "<div class='tc-notice'><span>18+</span> PRACTICE ONLY · NO REAL MONEY</div>" +
    rotateGateHTML();
  LC.markSpots(app);
  fitTable();
  if (lingoHl && tutorLine && screen === "play" && !menu) {
    const hlEl = document.querySelector(lingoHl);
    if (hlEl) hlEl.classList.add("lingo-hl");
  }
  armToastHide();
}

function armToastHide() {
  if (toastText === toastKey) return;
  toastKey = toastText;
  clearTimeout(toastTimer);
  if (!toastText) return;
  const key = toastText;
  toastTimer = setTimeout(() => {
    if (toastText !== key) return;
    changeNote = "";
    toastText = queuedTip;
    queuedTip = "";
    toastKey = "";
    render();
  }, 3000);
}

function fitTable() {
  const w = innerWidth, h = innerHeight, land = w > h && h <= 500;
  app.classList.toggle("land", land);
  app.classList.toggle("short", !land && h < 700);
  app.classList.toggle("narrow", w < 360);
  app.classList.toggle("tight", land && h <= 360);
  const f = document.getElementById("felt");
  const stage = document.getElementById("stage");
  if (!f || !stage) return;
  const feltLand = land;
  const tight = land && h <= 360;
  const offerUp = !!offer;
  f.classList.toggle("land", feltLand);
  const st = stage.getBoundingClientRect();
  const ring = land && h <= 360 ? 3 : land ? 5 : h < 700 ? 4.5 : 8.5 * Math.min(1, w / 390);
  f.style.setProperty("--ring", Math.max(2, ring - 1.5).toFixed(1) + "px");
  const aw = Math.max(120, st.width - 2 * ring);
  const ah = Math.max(80, st.height - 8);
  const MIN = 44;
  let k, rows, gap;
  if (!feltLand) {
    k = Math.min(1.12, aw / 354);
    gap = Math.max(2, 3 * k);
    const pad = 2 * (h < 700 ? (w < 360 ? 1.5 : 3) : Math.max(3, 6 * k)) + (w < 360 ? 1 : 3.2);
    const sm = {
      ats: Math.max(MIN, 46 * k),
      come: Math.max(MIN, 48 * k),
      field: Math.max(MIN, 50 * k),
      p1: Math.max(MIN, 50 * k),
      p2: Math.max(MIN, 50 * k),
      line: Math.max(MIN, 50 * k),
    };
    const fixed = sm.ats + sm.come + sm.field + sm.p1 + sm.p2 + sm.line + 5 * gap + pad;
    let nums = Math.max(72, ah - fixed);
    const spare = ah - fixed - nums;
    if (spare > 1) {
      const g = Math.min(spare / 6, 10 * k);
      Object.keys(sm).forEach((n) => { sm[n] += g; });
      nums = Math.max(72, ah - (sm.ats + sm.come + sm.field + sm.p1 + sm.p2 + sm.line + 5 * gap + pad));
    }
    f.style.setProperty("--g", gap.toFixed(1) + "px");
    f.style.setProperty("--fp", ((pad - 3.2) / 2).toFixed(1) + "px");
    rows = [sm.ats, nums, sm.come, sm.field, sm.p1 + sm.p2 + gap, sm.line];
  } else {
    k = Math.min(1.1, Math.max(0.72, aw / 420));
    gap = 3;
    const floor = tight ? 18 : MIN;
    const come = floor;
    const ats = floor, field = floor, line = floor;
    const pad = 8;
    const nums = Math.max(tight ? 36 : 72, ah - (ats + come + field + line) - 4 * gap - pad);
    rows = [ats, nums, come, field, line];
    f.style.setProperty("--g", gap + "px");
    f.style.setProperty("--fp", "4px");
  }
  const squeeze = feltLand ? tight : offerUp;
  let total = rows.reduce((a, b) => a + b, 0);
  if (squeeze && total > ah) {
    const scale = ah / total;
    const floor = feltLand ? 16 : 20;
    rows = rows.map((r) => Math.max(floor, r * scale));
    total = rows.reduce((a, b) => a + b, 0);
    if (total > ah) {
      const again = ah / total;
      rows = rows.map((r) => r * again);
    }
  }
  if (!squeeze && total > ah + 4) {
    f.style.height = Math.ceil(total + 12) + "px";
    f.style.alignSelf = "start";
    stage.style.overflowY = "auto";
  } else {
    f.style.height = "100%";
    f.style.alignSelf = "";
    stage.style.overflowY = tight ? "hidden" : "";
  }
  f.style.gridTemplateRows = rows.map((r) => r.toFixed(1) + "px").join(" ");
  f.style.setProperty("--k", k.toFixed(4));
  const strip = feltLand ? 16 : (h < 700 ? 12 : Math.max(16, 18 * k));
  const lay = feltLand ? 16 : (h < 700 ? 12 : Math.max(16, 16 * k));
  const numsH = rows[1] - 3.2;
  const faceH = Math.max(8, numsH - strip * 2 - lay);
  const floor = feltLand ? 16 : (w < 360 ? 22 : 28);
  let digit = Math.min((feltLand ? 30 : 34) * k, Math.max(floor, (faceH - (feltLand ? 17 : 15)) / 0.86));
  if (!feltLand && w >= 360 && w <= 430) {
    const want = w < 370 ? 33.7 : w < 385 ? 35.2 : w <= 400 ? 35.8 : w <= 420 ? 36.1 : 38.1;
    if (digit < want && (faceH - 15) / 0.86 >= want) digit = want;
  }
  f.style.setProperty("--digit", digit.toFixed(1) + "px");
  f.style.setProperty("--strip", strip.toFixed(1) + "px");
  f.style.setProperty("--strip-lay", lay.toFixed(1) + "px");
}

function flyChip(from, to, cents, ms) {
  if (!from || !to || reducedMQ.matches) return;
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const ghost = document.createElement("i");
  ghost.className = "tc-fly";
  ghost.style.cssText = "position:fixed;z-index:80;pointer-events:none;width:30px;height:14px;border-radius:50%;left:" + a.left + "px;top:" + a.top + "px;background:url(" + chipImg(cents) + ") center/cover;transition:transform " + ms + "ms ease-out";
  document.body.appendChild(ghost);
  requestAnimationFrame(() => { ghost.style.transform = "translate(" + (b.left - a.left) + "px," + (b.top - a.top) + "px)"; });
  setTimeout(() => ghost.remove(), ms + 40);
}

function fanFrom(rect, cents) {
  if (!rect || reducedMQ.matches) return;
  for (let i = 0; i < 6; i++) {
    const ghost = document.createElement("i");
    ghost.className = "tc-fly";
    const dx = (i - 2.5) * 16;
    const dy = -26 - (i % 3) * 8;
    ghost.style.cssText = "position:fixed;z-index:80;pointer-events:none;width:28px;height:14px;border-radius:50%;left:" + rect.left + "px;top:" + rect.top + "px;background:url(" + chipImg(cents >= 500 ? cents : 500) + ") center/cover;transition:transform 280ms ease-out,opacity 280ms";
    document.body.appendChild(ghost);
    requestAnimationFrame(() => { ghost.style.transform = "translate(" + dx + "px," + dy + "px)"; ghost.style.opacity = "0.15"; });
    setTimeout(() => ghost.remove(), 320);
  }
}

function placeSpot(kind, number) {
  cancelMoments();
  if (rolling) { maybeNudge("bet_while_rolling"); return; }
  let amount = settings.chip;
  const spot = { kind, number };
  if (kind === "place" && (number === 6 || number === 8)) {
    const raw = amount;
    const rules = game.rules || {};
    amount = Tiers.place68Add(game.bets.place[number] || 0, raw, rules.tableMin || 1000, rules.tableMax || 50000);
    if (!amount) { toastText = "6 and 8 are at the table max."; render(); return; }
    if (amount !== raw) toastText = "Place " + number + " posted at " + money(amount) + " ($6 steps).";
  } else if (kind === "hop") {
    amount = Math.min(10000, Math.max(100, amount));
  } else if (kind === "repeater") {
    amount = Math.min(2500, Math.max(100, amount));
  } else if (kind === "pass" || kind === "dontPass" || kind === "come" || kind === "dontCome" || kind === "any7" || kind === "place" || kind === "buy" || kind === "lay") {
    const min = (game.rules && game.rules.tableMin) || 1000;
    if (amount < min) amount = min;
  }
  const from = document.querySelector(".stack.sel") || document.querySelector(".stack");
  const res = E.placeBet(game, spot, amount);
  if (!res.ok && res.convert) { convert = res.convert; render(); return; }
  if (!res.ok) { toastText = res.error; render(); return; }
  game = res.state;
  const moved = sync();
  if (kind === "dontPass" || kind === "dontCome") maybeNudge("first_dont");
  if (kind === "place" || kind === "buy" || kind === "come") maybeNudge("first_place");
  render();
  const spotEl = number ? document.querySelector("[data-n='" + number + "']") : document.querySelector("[data-kind='" + kind + "']");
  flyChip(from, spotEl, amount >= 500 ? amount : 500, moved && moved.breaks && moved.breaks.length ? 240 : 260);
}

function maybeNudge(trigger) {
  if (!settings.tutor || nudged[trigger]) return;
  const tip = Et.nudgeFor(trigger, "table");
  if (!tip) return;
  nudged[trigger] = true;
  if (screen === "compare" || screen === "tutorial" || screen === "picker") return;
  if (trigger === "new_shooter") { queuedTip = tip.billy; return; }
  toastText = tip.billy;
}

function checkSession() {
  if (!strategyId || sessionHold || !sessionBase) return;
  const worth = E.netWorth(game);
  const lim = TS.sessionLimits(sessionBase);
  if (worth <= lim.stopAt) sessionPrompt = "Stop-loss. You are down 40% from " + money(sessionBase) + ".";
  else if (worth >= lim.goalAt) sessionPrompt = "Win goal. You are up 30% from " + money(sessionBase) + ".";
}

function legalFront(top) {
  return top === 1 || top === 6 ? 2 : 1;
}
function sweepUnpickedDice(pairIndices) {
  if (pairIndices && pairIndices.length === 2) bowlPicked = pairIndices.slice();
  else if (bowlPicked.length < 2) bowlPicked = [0, 1];
  bowlSwept = true;
  bowlSweeping = true;
  clearTimeout(sweepTimer);
  sweepTimer = setTimeout(() => { bowlSweeping = false; }, 650);
}
function pickBowlDie(i) {
  if (i < 0 || i >= BOWL_DICE.length) return;
  if (bowlSwept) {
    bowlSwept = false;
    bowlSweeping = false;
    bowlPicked = [i];
    render();
    return;
  }
  const at = bowlPicked.indexOf(i);
  if (at >= 0) {
    bowlPicked.splice(at, 1);
    render();
    return;
  }
  bowlPicked.push(i);
  if (bowlPicked.length >= 2) {
    const [a, b] = bowlPicked.slice(0, 2);
    setFaces = [orient(BOWL_DICE[a].top, BOWL_DICE[a].front), orient(BOWL_DICE[b].top, BOWL_DICE[b].front)];
    diceFaces = setFaces.map((d) => Object.assign({}, d));
    showingRoll = false;
    settings.set = matchSetKey(setFaces);
    sweepUnpickedDice([a, b]);
  }
  render();
}
function syncShooterSetDOM() {
  const cubes = [...document.querySelectorAll(".setview .pair .tc-cube")];
  if (cubes.length !== 2) return false;
  cubes.forEach((cube, i) => {
    const full = orient(diceFaces[i].top, diceFaces[i].front) || diceFaces[i];
    cube.dataset.top = String(full.top);
    cube.dataset.front = String(full.front);
    cube.dataset.right = String(full.right || "");
    cube.dataset.left = String(full.left || "");
    cube.dataset.back = String(full.back || "");
    cube.dataset.bottom = String(full.bottom || "");
    if (lastRotDir[i]) cube.dataset.dir = lastRotDir[i];
    const c = cube.querySelector(".c");
    if (c) c.style.transform = "var(--view) " + cssMatrix(full.top, full.front);
  });
  const ro = document.querySelector(".tc-shooter .readout");
  if (ro) ro.innerHTML = setReadoutInnerHTML();
  document.querySelectorAll(".tc-shooter .sets button[data-set]").forEach((btn) => {
    btn.classList.toggle("on", btn.dataset.set === settings.set);
  });
  return true;
}
function rotateShooterDie(index, dir, inPlace) {
  if (index !== 0 && index !== 1) return;
  if (showingRoll) {
    diceFaces = setFaces.map((d) => Object.assign({}, d));
    showingRoll = false;
  }
  const next = rotateDie(diceFaces[index], dir);
  if (!next) return;
  diceFaces[index] = next;
  setFaces[index] = Object.assign({}, next);
  lastRotDir[index] = dir;
  settings.set = matchSetKey(setFaces);
  const sweptBefore = bowlSwept;
  if (!bowlSwept) sweepUnpickedDice(bowlPicked.length === 2 ? bowlPicked : [0, 1]);
  if (inPlace && sweptBefore && syncShooterSetDOM()) return;
  render();
}
function applySet(name) {
  const set = SETS[name] || SETS["3V"];
  setFaces = set.dice.map((d) => orient(d.top, d.front));
  diceFaces = setFaces.map((d) => Object.assign({}, d));
  showingRoll = false;
}
function showRolled(d1, d2) {
  lastFaces = { d1, d2 };
  diceFaces = [orient(d1, legalFront(d1)), orient(d2, legalFront(d2))];
  showingRoll = true;
}
function noteLingo(id) {
  let store = { badges: {}, progress: {} };
  try { store = JSON.parse(localStorage.getItem("bb-table-badges-v1") || "") || store; } catch { /* fresh */ }
  store = Badges.noteAction(store, { type: "lingo", id }).store;
  localStorage.setItem("bb-table-badges-v1", JSON.stringify(store));
}
function watchLingo(id) {
  LC.armDwell(lingo, id, noteLingo);
}

function doRoll() {
  if (rolling) { maybeNudge("bet_while_rolling"); return; }
  lingo.peekId = null;
  if (throwPower < 18 && page === 2) {
    toastText = "No roll. Both dice have to reach the back wall. Nothing was drawn.";
    lastRoll = { result: "no-roll", d1: 0, d2: 0, total: 0, hard: false, phaseBefore: game.phase };
    const term = Lg.callTerm(lastRoll, "table");
    if (term) LC.rememberCall(lingo, term.id);
    maybeNudge("no_roll");
    render();
    const practiceSpeed = RS.capSpeed(settings.rollSpeed || "normal", true);
    const set = SETS[settings.set];
    import("./throw.mjs").then((T) => T.throwDice({
      noRoll: true,
      set: set && set.dice,
      speed: practiceSpeed,
      reduced: reducedMQ.matches,
      haptic: throwHaptic,
    }));
    return;
  }
  rolling = true;
  if (game.phase === "come-out") R5.applyPending(game);
  cancelMoments();
  offer = null;
  changeNote = "";
  if (strategyId && !sessionPrompt) {
    game = TS.autoBet(game, strategyId, { unit: 1000 }).state;
    sync();
  }
  const passBefore = game.bets.pass;
  const pointBefore = game.point;
  const phaseBefore = game.phase;
  const handBefore = { rolls: game.hand.rolls || 0, points: game.hand.points || 0 };
  const betsBefore = E.tableTotal(game);
  const fireBefore = (game.firePoints || []).length;
  const fireBetBefore = game.bets.fire || 0;
  let dice = null;
  if (R5.active()) {
    const pair = R5.pending();
    if (!pair) {
      rolling = false;
      toastText = "Enter both dice, then tap SETTLE.";
      render();
      return;
    }
    R5.noteEntered(structuredClone(game));
    R5.consume();
    dice = pair;
  } else {
    let custom = null;
    /*TEST_HOOK_START*/
    if (TEST_BUILD && typeof window.__tcRng === "function") custom = window.__tcRng;
    delete window.__tcRng;
    /*TEST_HOOK_END*/
    dice = custom ? E.rollDice(custom) : E.rollDice();
  }
  if (!dice || !dice.d1) {
    rolling = false;
    toastText = (dice && dice.error) || TR.NO_ROLL;
    render();
    return;
  }
  const entered = dice.source === "entered";
  const applyRoll = () => {
  showRolled(dice.d1, dice.d2);
  const settled = E.settle(game, dice.d1, dice.d2, entered ? { diceSource: "entered" } : undefined);
  game = settled.state;
  if (game.phase === "come-out") R5.applyPending(game);
  if (strategyId && !sessionPrompt) game = TS.afterRoll(game, strategyId, settled, { unit: 1000 });
  sync();
  rolling = false;
  const cap = E.rollCaption(dice.d1, dice.d2);
  lastRoll = { d1: dice.d1, d2: dice.d2, total: dice.d1 + dice.d2, hard: !!(settled.dice && settled.dice.hard), phaseBefore, result: settled.result, word: cap.word };
  const callTerm = Lg.callTerm(lastRoll, "table");
  if (callTerm) LC.rememberCall(lingo, callTerm.id);
  const gained = Rail.colorUpOffer(rail);
  if (gained && settings.colorUp === "auto") {
    rail = Rail.railColorUp(rail).rail;
    save();
  } else if (gained && settings.colorUp === "offer") {
    offer = (rail[100] > 20 ? rail[100] + " × $1" : rail[500] + " × $5") + " on the rail. Color up?";
  }
  const sevenOut = settled.result === "seven-out" && phaseBefore === "point";
  if (sevenOut) { maybeNudge("new_shooter"); bowlSwept = false; bowlSweeping = false; bowlPicked = []; }
  if (!sevenOut) checkSession();
  toastText = sevenOut ? "" : settled.narrative;
  const feltFrom = document.querySelector(".numbox.point, .spot.pass");
  render();
  if (!sevenOut && settled.net > 0) flyChip(feltFrom, document.querySelector(".stack.sel") || document.querySelector(".tc-rail"), 2500, 320);
  if (sevenOut) {
    const length = handBefore.rolls + 1;
    let record = false;
    if (!entered) {
      const prev = Number(localStorage.getItem("bb-table-longest") || 0);
      record = prev > 0 && length > prev;
      localStorage.setItem("bb-table-longest", String(Math.max(prev, length)));
    }
    const fireDec = (settled.decisions || []).find((d) => d.bet === "Fire Bet" && d.result === "win" && (d.level === 4 || d.level === 5));
    const shown = showPSO({
      app: "tc",
      point: pointBefore,
      d1: dice.d1,
      d2: dice.d2,
      net: settled.net,
      hadBets: betsBefore > 0,
      hand: { rolls: length, points: handBefore.points },
      record,
      fire: fireDec ? { points: fireDec.level, pay: fireDec.profit } : null,
      puck: [document.querySelector(".tc-hud .puck")],
      dice: [document.querySelector(".tc-shooter .setview .pair"), document.querySelector(".tc-hud .puck")],
      sweepFrom: [...document.querySelectorAll("#felt .bet")],
      railTo: document.querySelector(".tc-rail"),
      avoid: [document.querySelector(".tc-shoot"), document.querySelector(".tc-rail")],
      billie: { light: A + "mascots/billie/billie-C-sevenout.svg", long: A + "mascots/billie/billie-C-hello.svg" },
      faces: A + "dice/faces/",
      puckOn: A + "icons/puck-on.svg",
      chip: A + "chips/chip-25-value.svg",
      reduced: reducedMQ.matches,
      speed: settings.rollSpeed,
      sfx: () => {},
      haptic: psoHaptic,
    });
    const dur = shown && shown.variant ? shown.variant.dur : 1200;
    setTimeout(() => { checkSession(); if (sessionPrompt) render(); }, dur);
    R5.afterRoll({
      total: E.netWorth(game),
      start: sessionBase || game.startingBankroll || E.STARTING_BANKROLL,
      yourDice: entered,
      sevenOut: true,
      length: handBefore.rolls + 1,
      mode: "regular",
    });
    return;
  }
  if (settled.result === "point-made") {
    const points = game.hand.points;
    const tier = PT.celebrationTier(points, { meterOn: true, blazing: settled.tier === "blazing" });
    const quiet = !(passBefore > 0);
    const big = !quiet && settled.net >= 25 * Math.max(passBefore, 1);
    const fireCount = (game.firePoints || []).length;
    const stinger = fireCount > fireBefore ? PT.fireStinger(fireCount, fireBetBefore > 0) : "";
    const copy = PT.celebrationCopy({ tier, quiet, big, point: pointBefore, points, hard: dice.hard, net: settled.net, stinger });
    const targets = [document.querySelector(".numbox.point") || document.querySelector("[data-n='" + pointBefore + "']"), document.querySelector(".tc-hud .puck")].filter(Boolean);
    PC.celebratePoint({
      targets: targets.length ? targets : [document.querySelector(".tc-hud")],
      avoid: [".tc-shoot", ".tc-rail", ".tc-hud", ".tc-keys", ".tc-dots", ".tc-notice"].map((s) => document.querySelector(s)),
      point: pointBefore,
      net: quiet ? 0 : settled.net,
      big,
      tier,
      duration: RS.celebrateMs(tier, settings.rollSpeed, reducedMQ.matches),
      line: copy.call,
      cheer: copy.cheer,
      stinger: copy.stinger,
      quiet,
      billie: A + "mascots/billie/billie-C-winner.svg",
      chip: A + "chips/chip-25-value.svg",
      reduced: reducedMQ.matches,
    });
  }
  R5.afterRoll({
    total: E.netWorth(game),
    start: sessionBase || game.startingBankroll || E.STARTING_BANKROLL,
    yourDice: entered,
    sevenOut,
    length: handBefore.rolls + 1,
    mode: "regular",
  });
  };
  if (entered || page === 0) { applyRoll(); return; }
  const speed = (TEST_BUILD && window.__tcRollSpeed) || settings.rollSpeed || "normal";
  const effSpeed = RS.capSpeed(speed, page === 2);
  const showTableFlight = page === 2 && !ipadLayout(innerWidth, innerHeight) && effSpeed !== "instant" && !reducedMQ.matches;
  if (showTableFlight) {
    render();
  }
  import("./throw.mjs").then((T) => T.throwDice({
    d1: dice.d1,
    d2: dice.d2,
    set: setFaces,
    speed: effSpeed,
    reduced: reducedMQ.matches,
    haptic: throwHaptic,
    onSettle: () => {
      if (showTableFlight) {
        holdFelt = true;
        clearTimeout(holdFeltTimer);
        holdFeltTimer = setTimeout(() => { holdFelt = false; render(); }, 520);
      }
      applyRoll();
    },
  })).catch(() => { holdFelt = false; applyRoll(); });
}

function leave() {
  R5.closeSession("leave");
  rail = Rail.leaveTable(rail).rail;
  const total = Rail.railTotal(rail);
  maybeNudge("leave_table");
  toastText = "Practice chips: " + money(total) + ". Colored up.";
  menu = false;
  screen = "play";
  save();
  render();
}
function markEtiquette(id) {
  if (etiquetteSeen.indexOf(id) < 0) etiquetteSeen.push(id);
}
function finishEtiquette() {
  const deck = Et.deckFor("table").all;
  const tip = deck[Math.min(etiquetteAt, deck.length - 1)];
  markEtiquette(tip.id);
  if (etiquetteSeen.length < 15) {
    toastText = etiquetteSeen.length + " of 15 cards viewed.";
    menu = true;
    render();
    return;
  }
  let store = { badges: {}, progress: {} };
  try { store = JSON.parse(localStorage.getItem("bb-table-badges-v1") || "") || store; } catch { /* fresh */ }
  deck.forEach((card, i) => {
    store = Badges.noteAction(store, { type: "etiquette", id: card.id, complete: i === deck.length - 1 }).store;
  });
  localStorage.setItem("bb-table-badges-v1", JSON.stringify(store));
  toastText = store.badges.table_manners ? "Table Manners unlocked." : "Table Manners noted.";
  menu = false;
  render();
}

let tutorLine = null;
let lingoHl = "";
function showOnBoard(id) {
  const term = Lg.termById(id, "table");
  const target = LC.boardTarget(term, "table", "regular");
  lingo.sheet = null;
  lingo.peekId = null;
  lingo.confirm = false;
  screen = "play";
  menu = false;
  if (!target.ok) { lingoHl = ""; toastText = target.reason; render(); return; }
  const sel = LC.spotSelector(target.link, "table");
  const dest = pageForLink(target.link, "table");
  if (dest != null) page = dest;
  tutorLine = term ? { title: term.term, body: term.meaning } : null;
  lingoHl = sel || "";
  toastText = "";
  clearTimeout(toastTimer);
  render();
  const again = lingoHl ? document.querySelector(lingoHl) : null;
  if (again) {
    const scroller = again.closest(".tc-side");
    if (scroller) {
      const sr = scroller.getBoundingClientRect();
      const er = again.getBoundingClientRect();
      if (er.top < sr.top + 8 || er.bottom > sr.bottom - 140) {
        scroller.scrollTop = Math.max(0, scroller.scrollTop + (er.top - sr.top) - 16);
      }
    }
    again.classList.add("lingo-hl");
    if (reducedMQ.matches) setTimeout(() => { lingoHl = ""; again.classList.remove("lingo-hl"); }, 1500);
  } else {
    lingoHl = "";
    toastText = target.reason || "That spot isn't on this board.";
    render();
  }
}
function onClick(e) {
  if (swallowLingo) {
    swallowLingo = false;
    const held = e.target.closest("[data-act='spot'], [data-act='num']");
    if (held) return;
  }
  if (swallowDragClick) { swallowDragClick = false; return; }
  if (holdFelt) { holdFelt = false; clearTimeout(holdFeltTimer); }
  const dirSpan = e.target.closest(".die-slot [data-dir]");
  if (dirSpan) {
    const slot = dirSpan.closest(".die-slot");
    if (slot) { rotateShooterDie(Number(slot.dataset.die), dirSpan.dataset.dir, true); return; }
  }
  const t = e.target.closest("[data-act]");
  if (!t) return;
  const act = t.dataset.act;
  if (act === "r5-your-dice") { menu = false; screen = "play"; page = 2; }
  if (R5.handle(act, t)) return;
  if (act === "tutor-dismiss") { tutorLine = null; lingoHl = ""; render(); return; }
  if ((act === "seed" || act === "color-setting" || act === "theme" || act === "csv-file" || act === "lingo-q") && e.type === "click") return;
  if (act === "hops") {
    const hops = document.getElementById("hops");
    if (hops) hops.scrollIntoView({ block: "start" });
    return;
  }
  if (act === "lingo" || act === "lingo-open" || act === "lingo-row") {
    if (t.dataset.id) lingo.cardId = t.dataset.id;
    lingo.peekId = null;
    lingo.sheet = null;
    screen = "lingo";
    menu = false;
    render();
    if (lingo.cardId) watchLingo(lingo.cardId);
    return;
  }
  if (act === "lingo-close") { screen = "play"; lingo.cardId = null; watchLingo(""); render(); return; }
  if (act === "lingo-cat") { lingo.category = t.dataset.cat || "all"; render(); return; }
  if (act === "lingo-peek") {
    lingo.peekId = t.dataset.id;
    LC.rememberCall(lingo, t.dataset.id);
    render();
    watchLingo(t.dataset.id);
    return;
  }
  if (act === "peek-close") { lingo.peekId = null; watchLingo(""); render(); return; }
  if (act === "sheet-close") {
    if (e.target.closest(".lingo-sheet") && !e.target.closest(".lingo-grab, .lingo-x")) return;
    const back = lingoOrigin;
    lingo.sheet = null;
    lingo.confirm = false;
    lingoOrigin = null;
    watchLingo("");
    render();
    LC.focusOrigin(back);
    return;
  }
  if (act === "lingo-why") { lingo.why = !lingo.why; render(); return; }
  if (act === "lingo-show") { showOnBoard(t.dataset.id); return; }
  if (act === "lingo-take") {
    if (!lingo.sheet) return;
    const probe = E.removeBet(game, lingo.sheet);
    if (probe.needsConfirm && !t.dataset.confirm) { lingo.confirm = true; render(); return; }
    const res = E.removeBet(game, lingo.sheet, null, { confirm: true });
    if (res.ok) { game = res.state; sync(); lingo.sheet = null; lingo.confirm = false; }
    else toastText = res.error || "";
    render();
    return;
  }
  if (act === "lingo-links") { settings.lingoLinks = settings.lingoLinks === false; save(); render(); return; }
  if (act === "chip") { settings.chip = Number(t.dataset.chip); changeNote = ""; render(); return; }
  if (act === "roll" || act === "throw") { doRoll(); return; }
  if (act === "go-shooter") { page = 2; screen = "play"; menu = false; maybeNudge("set_dice"); render(); return; }
  if (act === "fair") { screen = "fair"; menu = false; render(); return; }
  if (act === "page") {
    page = Number(t.dataset.page);
    screen = "play";
    menu = false;
    if (page === 2) maybeNudge("set_dice");
    render();
    return;
  }
  if (act === "screen") { screen = t.dataset.screen; menu = false; render(); return; }
  if (act === "menu") { menu = !menu; screen = "play"; render(); return; }
  if (act === "numbet") { settings.numbet = t.dataset.k; render(); return; }
  if (act === "num") { placeSpot(settings.numbet, Number(t.dataset.n)); return; }
  if (act === "spot") {
    const kind = t.dataset.kind;
    if (kind.indexOf(":") > 0) {
      const [k, rest] = kind.split(":");
      if (k === "hop") {
        const res = E.placeBet(game, { kind: "hop", pair: rest }, Math.min(10000, Math.max(100, settings.chip)));
        if (res.ok) { game = res.state; sync(); }
        else toastText = res.error;
        render();
        return;
      }
      placeSpot(k, Number(rest));
      return;
    }
    placeSpot(kind);
    return;
  }
  if (act === "fire") {
    const add = fireStake();
    const res = E.placeBet(game, { kind: "fire" }, add || 100);
    if (!res.ok) toastText = res.error;
    else { game = res.state; sync(); }
    render();
    return;
  }
  if (act === "color-up") {
    const from = document.querySelector(".stack[data-chip='100']") || document.querySelector(".stack");
    const rect = from ? from.getBoundingClientRect() : null;
    rail = Rail.railColorUp(rail).rail;
    offer = null;
    save();
    render();
    fanFrom(rect, 100);
    return;
  }
  if (act === "color-dismiss") { offer = null; render(); return; }
  if (act === "convert" && convert) {
    const res = E.placeBet(game, { kind: convert.to, number: convert.number }, convert.amount, { convert: true });
    convert = null;
    if (res.ok) { game = res.state; sync(); } else toastText = res.error;
    render();
    return;
  }
  if (act === "keep") { convert = null; render(); return; }
  if (act === "filter") { filter = t.dataset.f; render(); return; }
  if (act === "strat") {
    const id = t.dataset.id;
    const card = TS.strategyById(id);
    if (!card) return;
    if (card.tier === "premium" && !premiumOn()) { screen = "paywall"; render(); return; }
    strategyId = id;
    tutorId = id;
    sessionBase = E.netWorth(game);
    sessionHold = false;
    sessionPrompt = null;
    const bet = TS.autoBet(game, id, { unit: 1000 });
    game = bet.state;
    sync();
    screen = "play";
    toastText = (card.warning ? card.name + " is a warning. The edge does not change. " : card.name + " is placing bets. ") + "Guide bankroll " + card.bankroll + ". " + TS.TUTOR_END;
    render();
    return;
  }
  if (act === "tutor") { screen = "tutorial"; tutorStep = 0; render(); return; }
  if (act === "tutor-next") { tutorStep += 1; render(); return; }
  if (act === "tutor-back") { tutorStep = Math.max(0, tutorStep - 1); render(); return; }
  if (act === "unlock") {
    IAP.purchasePremium().then((res) => {
      if (res.ok && localStorage.getItem("bb-table-entitlement") === "1") {
        settings.premium = true;
        localStorage.setItem(PREM, "1");
        payNote = "";
        toastText = "Premium unlocked on this device. Practice chips only.";
        screen = "compare";
      } else {
        settings.premium = localStorage.getItem("bb-table-entitlement") === "1";
        payNote = (res && res.error) || "Purchases are not available in this build.";
        screen = "paywall";
      }
      render();
    });
    return;
  }
  if (act === "restore") {
    IAP.restorePremium().then((res) => {
      if (res.ok && res.entitlement === "1") {
        settings.premium = true;
        localStorage.setItem(PREM, "1");
        payNote = "";
        toastText = "Purchases restored. Practice chips only.";
        screen = "compare";
      } else {
        settings.premium = false;
        localStorage.removeItem(PREM);
        payNote = (res && res.error) || "No purchases to restore.";
        screen = "paywall";
      }
      render();
    });
    return;
  }
  if (act === "cmpick") {
    const id = t.dataset.id;
    const on = comparePick.indexOf(id);
    if (on >= 0) comparePick.splice(on, 1);
    else if (comparePick.length < 6) comparePick.push(id);
    render();
    return;
  }
  if (act === "seed") { compareSeed = t.value || "1"; return; }
  if (act === "length") { compareLen = Number(t.dataset.value) || 300; render(); return; }
  if (act === "seed-count") { compareSeeds = Number(t.dataset.value) === 1000 ? 1000 : 100; render(); return; }
  if (act === "run-compare") {
    if (!premiumOn()) { screen = "paywall"; render(); return; }
    const ids = comparePick.slice(0, 6);
    const seq = R.rollSequenceFromSeed(Number(compareSeed) || 1, Number(compareLen) || 300);
    compareRun = R.compare(seq.dice, ids.length ? ids : ["T1"], { rules: game.rules, atLimit: "stop" });
    compareMany = null;
    render();
    return;
  }
  if (act === "many-cancel") {
    compareJob += 1;
    if (compareWorker) { compareWorker.postMessage({ type: "cancel" }); compareWorker.terminate(); compareWorker = null; }
    compareProgress = "Cancelled.";
    render();
    return;
  }
  if (act === "many-seeds") {
    if (!premiumOn()) { screen = "paywall"; render(); return; }
    if (compareWorker) compareWorker.terminate();
    compareJob += 1;
    const job = compareJob;
    const rolls = Number(compareLen) || 100;
    compareMany = null;
    compareProgress = "0 / " + compareSeeds + " seeds";
    const worker = new Worker(new URL("./replay-worker.mjs", import.meta.url), { type: "module" });
    compareWorker = worker;
    worker.onmessage = (ev) => {
      if (job !== compareJob) return;
      if (ev.data.type === "progress") {
        compareProgress = ev.data.done + " / " + ev.data.k + " seeds · " + rolls + " rolls";
        const el = document.querySelector(".cmpprogress");
        if (el) el.textContent = compareProgress;
        return;
      }
      if (ev.data.type === "done") {
        compareMany = ev.data.result;
        compareProgress = ev.data.result && ev.data.result.cancelled ? "Cancelled." : "";
        worker.terminate();
        if (compareWorker === worker) compareWorker = null;
        render();
      }
    };
    worker.postMessage({
      type: "start",
      ids: comparePick.slice(0, 6),
      seeds: compareSeeds,
      rolls,
      seed: Number(compareSeed) || 1,
      params: { rules: JSON.parse(JSON.stringify(game.rules || {})), atLimit: "stop" },
    });
    render();
    return;
  }
  if (act === "csv-pick") {
    const input = document.querySelector("input[data-act='csv-file']");
    if (input) input.click();
    return;
  }
  if (act === "csv-compare") {
    if (!premiumOn()) { screen = "paywall"; render(); return; }
    const dice = (game.history || []).map((r) => [r.d1, r.d2]).reverse();
    if (dice.length < 2) { toastText = "No Fair Dice session yet. Roll first."; render(); return; }
    compareRun = R.compare(dice, comparePick.slice(0, 6), { rules: game.rules });
    render();
    return;
  }
  if (act === "csv-file") {
    if (!premiumOn()) { screen = "paywall"; render(); return; }
    const file = t.files && t.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dice = [];
      String(reader.result || "").split(/\r?\n/).forEach((line) => {
        const nums = line.match(/\d+/g);
        if (!nums || nums.length < 2) return;
        const a = Number(nums[0]);
        const b = Number(nums[1]);
        if (a >= 1 && a <= 6 && b >= 1 && b <= 6) dice.push([a, b]);
      });
      if (dice.length < 2) { toastText = "That CSV has no die pairs."; render(); return; }
      compareRun = R.compare(dice, comparePick.slice(0, 6), { rules: game.rules });
      toastText = "Imported " + dice.length + " rolls.";
      render();
    };
    reader.readAsText(file);
    return;
  }
  if (act === "sess-stop") { strategyId = ""; sessionPrompt = null; sessionHold = true; toastText = "Strategy stopped."; render(); return; }
  if (act === "sess-keep") { sessionPrompt = null; sessionHold = true; render(); return; }
  if (act === "sess-new") { sessionBase = E.netWorth(game); sessionPrompt = null; sessionHold = false; toastText = "New session from " + money(sessionBase) + "."; render(); return; }
  if (act === "leave") { leave(); return; }
  if (act === "pick") {
    pickBowlDie(Number(t.dataset.i));
    return;
  }
  if (act === "call-dice") {
    bowlSwept = false;
    bowlSweeping = false;
    bowlPicked = [];
    render();
    return;
  }
  if (act === "set") {
    settings.set = t.dataset.set;
    applySet(settings.set);
    if (!bowlSwept) sweepUnpickedDice(bowlPicked.length === 2 ? bowlPicked : [0, 1]);
    render();
    return;
  }
  if (act === "color-setting") { settings.colorUp = t.value; save(); return; }
  if (act === "theme") { settings.theme = t.value; save(); render(); return; }
  if (act === "etiq-next") {
    const deck = Et.deckFor("table").all;
    markEtiquette(deck[etiquetteAt].id);
    etiquetteAt = Math.min(deck.length - 1, etiquetteAt + 1);
    render();
    return;
  }
  if (act === "etiq-prev") { etiquetteAt = Math.max(0, etiquetteAt - 1); render(); return; }
  if (act === "etiquette-done") { finishEtiquette(); }
}

let touchX = 0;
let touchY = 0;
let touchDice = false;
let dragDie = null;
let swallowDragClick = false;
app.addEventListener("pointerdown", (e) => {
  touchX = e.clientX;
  touchY = e.clientY;
  const pair = e.target.closest(".setview .pair");
  const slot = e.target.closest(".setview .die-slot");
  const cube = e.target.closest(".setview .tc-cube");
  dragDie = null;
  if (pair && (slot || cube)) {
    const idx = slot ? Number(slot.dataset.die) : Array.prototype.indexOf.call(pair.querySelectorAll(".tc-cube"), cube);
    if (idx === 0 || idx === 1) {
      dragDie = {
        index: idx,
        x0: e.clientX,
        y0: e.clientY,
        lx: e.clientX,
        ly: e.clientY,
        steps: 0,
        dirEl: e.target.closest("[data-dir]"),
      };
      try { (slot || cube || pair).setPointerCapture(e.pointerId); } catch { /* the pointer already ended */ }
    }
  }
  touchDice = !!dragDie || !!e.target.closest(".setview, .bowl, .meter");
  const hold = e.target.closest("[data-act='num'], [data-act='spot']");
  if (hold && !e.target.closest(".tc-shoot, .tc-keys, [data-act='throw']")) {
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
});
app.addEventListener("contextmenu", (e) => {
  const hold = betSpot(e.target);
  if (!hold) return;
  e.preventDefault();
  openLingoFrom(hold);
});
app.addEventListener("input", (e) => {
  if (e.target && e.target.dataset && e.target.dataset.act === "lingo-q") {
    lingo.query = e.target.value;
    const pos = e.target.selectionStart;
    render();
    const again = document.querySelector("[data-act='lingo-q']");
    if (again) { again.focus(); if (pos != null) again.setSelectionRange(pos, pos); }
  }
});
addEventListener("keydown", (e) => {
  if (LC.lingoKey(e) && !(e.target && e.target.closest && e.target.closest("input, textarea, select"))) {
    const hold = betSpot(document.activeElement);
    if (hold) { e.preventDefault(); openLingoFrom(hold); return; }
  }
  if (e.key !== "Escape") return;
  if (!lingo.sheet && !lingo.peekId && screen !== "lingo") return;
  const back = lingoOrigin;
  lingo.sheet = null;
  lingo.peekId = null;
  lingo.confirm = false;
  lingoOrigin = null;
  if (screen === "lingo") screen = "play";
  watchLingo("");
  render();
  LC.focusOrigin(back);
});
app.addEventListener("pointermove", (e) => {
  if (dragDie) {
    const dx = e.clientX - dragDie.lx;
    const dy = e.clientY - dragDie.ly;
    const STEP = 22;
    if (Math.abs(dx) >= STEP || Math.abs(dy) >= STEP) {
      const dir = Math.abs(dy) >= Math.abs(dx) ? (dy < 0 ? "front" : "back") : (dx < 0 ? "left" : "right");
      dragDie.lx = e.clientX;
      dragDie.ly = e.clientY;
      dragDie.steps += 1;
      rotateShooterDie(dragDie.index, dir, true);
    } else {
      const cubes = document.querySelectorAll(".setview .pair .tc-cube");
      const cube = cubes[dragDie.index];
      const c = cube && cube.querySelector(".c");
      if (c) {
        const face = diceFaces[dragDie.index];
        const rx = Math.max(-22, Math.min(22, -dy * 0.9));
        const ry = Math.max(-22, Math.min(22, dx * 0.9));
        c.style.transform = "var(--view) rotateX(" + rx.toFixed(1) + "deg) rotateY(" + ry.toFixed(1) + "deg) " + cssMatrix(face.top, face.front);
      }
    }
    return;
  }
  const bar = e.target.closest && e.target.closest(".meter .bar");
  if (!bar || !touchDice) return;
  const r = bar.getBoundingClientRect();
  throwPower = Math.max(4, Math.min(96, Math.round(((e.clientX - r.left) / r.width) * 100)));
  const knob = bar.querySelector("i");
  if (knob) knob.style.left = throwPower + "%";
});
app.addEventListener("pointerup", (e) => {
  const dx = e.clientX - touchX;
  const dy = e.clientY - touchY;
  if (dragDie) {
    const d = dragDie;
    dragDie = null;
    if (d.steps === 0) {
      if (Math.abs(dx) >= 18 || Math.abs(dy) >= 18) {
        const dir = Math.abs(dy) >= Math.abs(dx) ? (dy < 0 ? "front" : "back") : (dx < 0 ? "left" : "right");
        rotateShooterDie(d.index, dir, true);
        swallowDragClick = true;
        setTimeout(() => { swallowDragClick = false; }, 120);
      } else if (d.dirEl && d.dirEl.dataset.dir) {
        rotateShooterDie(d.index, d.dirEl.dataset.dir, true);
        swallowDragClick = true;
        setTimeout(() => { swallowDragClick = false; }, 120);
      } else {
        rotateShooterDie(d.index, "front", true);
        swallowDragClick = true;
        setTimeout(() => { swallowDragClick = false; }, 120);
      }
    } else {
      syncShooterSetDOM();
      swallowDragClick = true;
      setTimeout(() => { swallowDragClick = false; }, 120);
    }
    return;
  }
  if (touchDice || Math.abs(dx) < 48 || screen !== "play" || menu) return;
  if (dx < 0) page = Math.min(2, page + 1);
  else page = Math.max(0, page - 1);
  if (page === 2) maybeNudge("set_dice");
  render();
});
app.addEventListener("click", onClick);
app.addEventListener("change", onClick);
addEventListener("resize", () => {
  const next = ipadLayout(innerWidth, innerHeight) ? "1" : "";
  if (app.dataset.ipad !== next) render();
  else fitTable();
});

load();
const q = new URLSearchParams(location.search);
if (q.get("theme")) settings.theme = q.get("theme");
const shot = q.get("shot");
if (!shot) {
  maybeNudge("buy_in");
  maybeNudge("session_start");
}
if (shot === "paywall") { settings.premium = false; screen = "paywall"; }
if (shot === "picker") screen = "picker";
if (shot === "tutorial") { screen = "tutorial"; tutorId = "T1"; }
if (shot === "colorup") {
  rail = Rail.emptyRail();
  rail[100] = 26;
  game.bankroll = 2600;
  game.bets = E.createGame({ profile: "table" }).bets;
  offer = "26 × $1 on the rail. Color up?";
}
if (shot === "compare") {
  settings.premium = true;
  screen = "compare";
  const seq = R.rollSequenceFromSeed(482113907, 80);
  compareRun = R.compare(seq.dice, ["T1", "T5", "T6"], {});
}
R5.attach({
  app: "table",
  premium: premiumOn,
  money,
  getGame: () => game,
  setGame: (g) => { game = g; },
  getRail: () => rail,
  setRail: (r) => { rail = r || Rail.railBreakdown(game.bankroll); },
  toast: (s) => { toastText = s; },
  repaint: () => render(),
  settings,
  save,
  sync: () => { sync(); },
  noteBadge: (action) => {
    let store = { badges: {}, progress: {} };
    try { store = JSON.parse(localStorage.getItem("bb-table-badges-v1") || "") || store; } catch { /* fresh */ }
    store = Badges.noteAction(store, action).store;
    localStorage.setItem("bb-table-badges-v1", JSON.stringify(store));
  },
  onEnter: () => { menu = false; screen = "play"; page = 2; },
  resetTo: (cents) => {
    R5.beforeReset(E.netWorth(game));
    game = E.createGame({ profile: "table", bankroll: cents, rules: game.rules });
    rail = Rail.railBreakdown(cents);
    toastText = "Practice chips reset to " + money(cents) + ".";
    save();
    render();
  },
});
render();
if (shot === "celebrate" || shot === "base" || shot === "big" || shot === "huge" || shot === "fire") {
  const tier = shot === "celebrate" ? "base" : shot;
  const bigShot = shot === "big";
  const copy = PT.celebrationCopy({ tier: tier === "fire" ? "huge" : tier, big: bigShot, point: 6, points: tier === "huge" || tier === "fire" ? 3 : tier === "big" ? 2 : 1, net: 7000, stinger: tier === "fire" ? PT.fireStinger(4, true) : "" });
  requestAnimationFrame(() => PC.celebratePoint({
    targets: [document.querySelector("[data-n='6']") || document.querySelector(".numbox.point"), document.querySelector(".tc-hud .puck")].filter(Boolean),
    avoid: [".tc-shoot", ".tc-rail", ".tc-hud", ".tc-keys", ".tc-dots", ".tc-notice"].map((s) => document.querySelector(s)),
    point: 6, net: 7000, tier: copy.tier, big: bigShot, duration: copy.duration,
    line: copy.call, cheer: copy.cheer, stinger: copy.stinger, hold: true,
    billie: A + "mascots/billie/billie-C-winner.svg",
    chip: A + "chips/chip-25-value.svg",
  }));
}
window.__tcReady = true;
