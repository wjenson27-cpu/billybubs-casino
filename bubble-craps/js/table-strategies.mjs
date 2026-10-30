/**
 * Table Craps strategies T1–T24. Auto-play uses the shared engine.
 * Free: T1–T13, T17, T20, T21. Premium: the other eight. T20 and T21 are warnings.
 */

import * as E from "./engine.mjs";
import * as TR from "./table-rules.mjs";

const FREE = new Set(["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12", "T13", "T17", "T20", "T21"]);
const WARN = new Set(["T20", "T21"]);
const END = "No system beats the edge. Practice chips only.";

function card(partial) {
  return Object.assign({
    tier: FREE.has(partial.id) ? "free" : "premium",
    warning: WARN.has(partial.id),
    end: END,
    bankroll: "$1,000",
    stop: "40% stop-loss / +30% win goal",
    bankCents: 100000,
    stopCents: 40000,
    goalCents: 30000,
  }, partial);
}

export const TABLE_STRATEGIES = [
  card({ id: "T1", name: "Pass Line + Max Odds", aliases: ["pass max"], edge: "0.37%", risk: "light", filters: ["all", "light", "baseline"], how: "Pass $10 with the full odds for the table. The Pass stays up after a win.", max7: { "345": 60, "5x": 60, "10x": 110 }, bankroll: "$500", bankCents: 50000, stopCents: 20000, goalCents: 15000, stop: "Stop −$200 · goal +$150" }),
  card({ id: "T2", name: "Don't Pass + Lay Odds", aliases: ["don't max"], edge: "0.27%", risk: "dark", filters: ["all", "dark", "baseline"], how: "Don't Pass $10 and lay the matching odds. Lay wins the same multiple as Pass odds.", max7: { "345": 70, "5x": 110, "10x": 210 } }),
  card({ id: "T3", name: "Come / Don't Come, 2 numbers", aliases: ["two come"], edge: "0.37% / 0.27%", risk: "light", filters: ["all", "light"], how: "Keep exactly two Come numbers working, with odds. Come odds are off on the come-out. Don't Come lay odds stay on.", max7: { "345": 110, "5x": 120, "10x": 220 } }),
  card({ id: "T4", name: "3-Point Molly", aliases: ["molly"], edge: "0.37%", risk: "light", filters: ["all", "light"], how: "Pass plus two Come bets, all with odds. Stop at three numbers. One re-Come after a hit.", max7: { "345": 170, "5x": 180, "10x": 330 } }),
  card({ id: "T5", name: "Place 6 and 8", aliases: ["place 6/8"], edge: "1.52%", risk: "light", filters: ["all", "light"], how: "After the point, Place the 6 and the 8 for $12. Each hit pays $14.", max7: { "345": 24, "5x": 24, "10x": 24 } }),
  card({ id: "T6", name: "$44 Inside", aliases: ["inside"], edge: "1.74%", risk: "light", filters: ["all", "light"], how: "Buy 5 and 9 for $10 (pays $14.50) and Place 6 and 8 for $12.", max7: { "345": 44, "5x": 44, "10x": 44 } }),
  card({ id: "T7", name: "$44 Iron Cross", aliases: ["iron cross"], edge: "1.77%/roll", risk: "light", filters: ["all", "light"], how: "Field $10, Buy the 5 for $10, Place 6 and 8 for $12. The Field is bet again after it loses.", max7: { "345": 44, "5x": 44, "10x": 44 } }),
  card({ id: "T8", name: "Hardways Hedge", aliases: ["hard hedge"], edge: "2.10%", risk: "hedge", filters: ["all", "hedge"], how: "Place 6 and 8 for $12 and $1 on Hard 6 and Hard 8. The $1 goes back up after an easy 6 or 8.", max7: { "345": 26, "5x": 26, "10x": 26 } }),
  card({ id: "T9", name: "Regression $88 to $44", aliases: ["regress"], edge: "1.74%", risk: "press", filters: ["all", "press"], how: "Start Buy 5/9 at $20 and Place 6/8 at $24. After the first hit, cut them to $10 and $12.", max7: { "345": 88, "5x": 88, "10x": 88 } }),
  card({ id: "T10", name: "Press Progressions", aliases: ["press"], edge: "same as the bets", risk: "press", filters: ["all", "press"], how: "Place 6 and 8, then press a winner up to twice or to 5× the opening bet. There is no PRESS button. The coach does it.", max7: { "345": 24, "5x": 24, "10x": 24 } }),
  card({ id: "T11", name: "Continuous Come", aliases: ["come all"], edge: "0.37%", risk: "light", filters: ["all", "light"], how: "A $10 Come on every point roll, with odds. A Come that lands on a number you already have pays the old one and moves.", max7: { "345": 0, "5x": 0, "10x": 0 } }),
  card({ id: "T12", name: "Hit and Split", aliases: ["split"], edge: "1.69%", risk: "press", filters: ["all", "press"], how: "Place $12 on 6 or 8. A hit splits toward the other number. Option B starts at $88 Inside.", max7: { "345": 24, "5x": 24, "10x": 24 } }),
  card({ id: "T13", name: "Pass + Place 6/8", aliases: ["pass place"], edge: "0.37% + 1.52%", risk: "light", filters: ["all", "light"], how: "Pass $10 with odds, plus Place 6 and 8 for $12. Never Place the point number.", max7: { "345": 34, "5x": 84, "10x": 134 } }),
  card({ id: "T14", name: "$64 Across + Regression", aliases: ["across"], edge: "1.71%", risk: "press", filters: ["all", "press"], how: "Place across for $64. Take 4 and 10 down after the first hit, then 5 and 9 after the second.", max7: { "345": 64, "5x": 64, "10x": 64 } }),
  card({ id: "T15", name: "3-Point Dolly", aliases: ["dolly"], edge: "0.27%", risk: "dark", filters: ["all", "dark"], how: "Don't Pass plus two Don't Come bets, all with lay odds. Replace a number after it loses.", max7: { "345": 0, "5x": 0, "10x": 0 } }),
  card({ id: "T16", name: "Lay the Outside", aliases: ["lay outside"], edge: "1.67%", risk: "dark", filters: ["all", "dark"], how: "Don't Pass $10 and Lay 4 and 10 for $40. If the point is 4 or 10, lay only the other one. Re-lay once per shooter.", max7: { "345": 90, "5x": 90, "10x": 90 } }),
  card({ id: "T17", name: "Hit and Run", aliases: ["hit run"], edge: "1.52%", risk: "light", filters: ["all", "light"], how: "Place 6 and 8. Take them down after one hit or three rolls, then sit out the rest of the hand.", max7: { "345": 24, "5x": 24, "10x": 24 } }),
  card({ id: "T18", name: "5-Count", aliases: ["five count"], edge: "same as the bets", risk: "light", filters: ["all", "light"], how: "The 1-count is only a come-out point. The 5th count must be a point number. Then bet $44 Inside.", max7: { "345": 44, "5x": 44, "10x": 44 } }),
  card({ id: "T19", name: "Doey-Don't", aliases: ["doey"], edge: "1.39%", risk: "hedge", filters: ["all", "hedge"], how: "Pass and Don't Pass, $10 each. Odds on the Pass only. A come-out 12 costs $10.", max7: { "345": 60, "5x": 60, "10x": 110 } }),
  card({ id: "T20", name: "Martingale on the Don't", aliases: ["martingale"], edge: "1.40% · −$630", risk: "warn", filters: ["all", "dark", "warn"], how: "Don't Pass doubles after a loss: 10, 20, 40, 80, 160, 320. The next $640 is over the $500 max, so it resets to $10.", max7: { "345": 320, "5x": 320, "10x": 320 } }),
  card({ id: "T21", name: "Come-out Hedge", aliases: ["hedge craps"], edge: "+79% cost", risk: "warn", filters: ["all", "warn"], how: "$1 Any Craps on the come-out only, next to a Pass bet. It is a warning card. The hedge costs more than it saves.", max7: { "345": 11, "5x": 11, "10x": 11 } }),
  card({ id: "T22", name: "Power Press Ladder", aliases: ["power ladder"], edge: "1.74%", risk: "press", filters: ["all", "press"], how: "A coach ladder. Place 6/8 goes 18, 42, 90, 210, 450. There is no POWER PRESS button.", max7: { "345": 36, "5x": 36, "10x": 36 } }),
  card({ id: "T23", name: "Don't + Place 6/8", aliases: ["don't hedge"], edge: "1.47%", risk: "hedge", filters: ["all", "hedge", "dark"], how: "Don't Pass $10 and Place 6 and 8 for $12. A seven-out nets −$14.", max7: { "345": 14, "5x": 14, "10x": 14 } }),
  card({ id: "T24", name: "Inside + Lay the Outside", aliases: ["wise guy"], edge: "1.69%", risk: "hedge", filters: ["all", "hedge"], how: "$44 Inside plus Lay 4 and 10 for $40. A seven-out nets −$6. A come-out 7, with lays working, is +$38.", max7: { "345": 6, "5x": 6, "10x": 6 } }),
].map((c, i) => Object.assign(c, { n: i + 1 }));

const GUIDE = {
  T2: [60000, 24000, 18000, "$600"],
  T3: [100000, 40000, 30000, "$1,000"],
  T4: [150000, 60000, 45000, "$1,500"],
  T5: [20000, 8000, 6000, "$200"],
  T6: [40000, 16000, 12000, "$400"],
  T7: [40000, 16000, 12000, "$400"],
  T8: [30000, 12000, 9000, "$300"],
  T9: [80000, 32000, 24000, "$800"],
  T10: [40000, 16000, 12000, "$400"],
  T11: [250000, 100000, 75000, "$2,500"],
  T12: [48000, 19200, 14400, "$480"],
  T13: [60000, 24000, 18000, "$600"],
  T14: [60000, 24000, 18000, "$600"],
  T15: [170000, 68000, 51000, "$1,700"],
  T16: [120000, 48000, 36000, "$1,200"],
  T17: [20000, 8000, 6000, "$200"],
  T18: [40000, 16000, 12000, "$400"],
  T19: [40000, 16000, 12000, "$400"],
  T20: [70000, 28000, 21000, "$700"],
  T21: [50000, 20000, 15000, "$500"],
  T22: [60000, 24000, 18000, "$600"],
  T23: [30000, 12000, 9000, "$300"],
  T24: [100000, 40000, 30000, "$1,000"],
};
TABLE_STRATEGIES.forEach((c) => {
  const g = GUIDE[c.id];
  if (!g) return;
  c.bankCents = g[0];
  c.stopCents = g[1];
  c.goalCents = g[2];
  c.bankroll = g[3];
  c.stop = "Guide " + g[3] + " · 40% stop-loss / +30% win goal";
});

const BY_ID = Object.create(null);
TABLE_STRATEGIES.forEach((c) => { BY_ID[c.id] = c; });

export function strategyById(id) {
  return BY_ID[id] || null;
}

/** 40% stop and +30% goal against the real session bankroll, not the printed guide. */
export function sessionLimits(startCents) {
  const base = Math.max(0, Math.round(Number(startCents) || 0));
  return { base, stopAt: Math.round(base * 0.6), goalAt: Math.round(base * 1.3) };
}

export function isPremium(id) {
  const c = strategyById(id);
  return !!(c && c.tier === "premium");
}

export function isFree(id) {
  return !isPremium(id) && !!strategyById(id);
}

export const STRATEGY_VERSION = 1;

const LADDER68 = [1800, 4200, 9000, 21000, 45000];
const LADDER59 = [1500, 3600, 8600, 20000, 50000];
const LADDER410 = [1500, 4000, 10000, 30000, 50000];

function mem(state) {
  state.strategy = state.strategy || { id: "", data: {} };
  state.strategy.data = state.strategy.data || {};
  return state.strategy.data;
}

function have(state, spot) {
  const b = state.bets;
  if (spot.kind === "pass") return b.pass;
  if (spot.kind === "dontPass") return b.dontPass;
  if (spot.kind === "passOdds") return b.passOdds;
  if (spot.kind === "dontPassOdds") return b.dontPassOdds;
  if (spot.kind === "come") return b.come;
  if (spot.kind === "dontCome") return b.dontCome;
  if (spot.kind === "field") return b.field;
  if (spot.kind === "anyCraps") return b.anyCraps;
  if (spot.kind === "place") return b.place[spot.number] || 0;
  if (spot.kind === "buy") return b.buy[spot.number] || 0;
  if (spot.kind === "lay") return (b.lay && b.lay[spot.number]) || 0;
  if (spot.kind === "hardway") return b.hardways[spot.number] || 0;
  if (spot.kind === "comeOdds") return (b.comeBets[spot.number] && b.comeBets[spot.number].odds) || 0;
  if (spot.kind === "dontComeOdds") return (b.dontComeBets[spot.number] && b.dontComeBets[spot.number].odds) || 0;
  return 0;
}

function put(state, spot, want) {
  const add = TR.legalAdd(state, spot, want, have);
  if (!add) return { state, placed: 0, refused: 0 };
  const res = E.placeBet(state, spot, add);
  if (!res.ok) return { state, placed: 0, refused: 1, error: res.error };
  return { state: res.state, placed: add, refused: 0 };
}

function take(state, spot) {
  if (!have(state, spot)) return state;
  const res = E.removeBet(state, spot, null, { confirm: true });
  return res.ok ? res.state : state;
}

function unitOf(params) {
  return (params && params.unit) || 1000;
}

function preset(state) {
  return TR.presetOf(state);
}

function fillPassOdds(state) {
  if (state.phase !== "point" || !state.point || !state.bets.pass) return { state, refused: 0 };
  const cap = E.maxPassOdds(state.bets.pass, state.point, preset(state));
  const spot = { kind: "passOdds", number: state.point };
  return put(state, spot, Math.max(0, cap - state.bets.passOdds));
}

function fillLayOdds(state, target) {
  if (state.phase !== "point" || !state.point || !state.bets.dontPass) return { state, refused: 0 };
  const cap = E.maxLayOdds(state.bets.dontPass, state.point, preset(state));
  const want = Math.min(target == null ? cap : target, cap) - state.bets.dontPassOdds;
  return put(state, { kind: "dontPassOdds", number: state.point }, Math.max(0, want));
}

function comeCount(state) {
  return Object.keys(state.bets.comeBets).filter((k) => state.bets.comeBets[k] && state.bets.comeBets[k].amount).length;
}

function dcCount(state) {
  return Object.keys(state.bets.dontComeBets).filter((k) => state.bets.dontComeBets[k] && state.bets.dontComeBets[k].amount).length;
}

function oddsOnComes(state) {
  let refused = 0;
  Object.keys(state.bets.comeBets).forEach((key) => {
    const slot = state.bets.comeBets[key];
    if (!slot || !slot.amount) return;
    const n = Number(key);
    const cap = E.maxPassOdds(slot.amount, n, preset(state));
    const res = put(state, { kind: "comeOdds", number: n }, Math.max(0, cap - (slot.odds || 0)));
    state = res.state;
    refused += res.refused;
  });
  return { state, refused };
}

function layOnDc(state) {
  let refused = 0;
  Object.keys(state.bets.dontComeBets).forEach((key) => {
    const slot = state.bets.dontComeBets[key];
    if (!slot || !slot.amount) return;
    const n = Number(key);
    const cap = E.maxLayOdds(slot.amount, n, preset(state));
    const res = put(state, { kind: "dontComeOdds", number: n }, Math.max(0, cap - (slot.odds || 0)));
    state = res.state;
    refused += res.refused;
  });
  return { state, refused };
}

function placeInside(state, buy5, buy9, p6, p8) {
  let refused = 0;
  const jobs = [
    [{ kind: "buy", number: 5 }, buy5],
    [{ kind: "buy", number: 9 }, buy9],
    [{ kind: "place", number: 6 }, p6],
    [{ kind: "place", number: 8 }, p8],
  ];
  jobs.forEach(([spot, amt]) => {
    if (!amt) return;
    const res = put(state, spot, Math.max(0, amt - have(state, spot)));
    state = res.state;
    refused += res.refused;
  });
  return { state, refused };
}

function place68(state, each) {
  return placeInside(state, 0, 0, each, each);
}

function across64(state) {
  let refused = 0;
  [[4, 1000], [5, 1000], [6, 1200], [8, 1200], [9, 1000], [10, 1000]].forEach(([n, amt]) => {
    const res = put(state, { kind: "place", number: n }, Math.max(0, amt - (state.bets.place[n] || 0)));
    state = res.state;
    refused += res.refused;
  });
  return { state, refused };
}

/** Place the bets a strategy wants before the roll. */
export function autoBet(state, id, params) {
  const card = strategyById(id);
  if (!card) return { state, refused: 0, message: "" };
  state.strategy = state.strategy && state.strategy.id === id ? state.strategy : { id, data: (params && params.data) || {} };
  const d = mem(state);
  const u = unitOf(params);
  let refused = 0;
  const go = (spot, amt) => {
    const res = put(state, spot, amt);
    state = res.state;
    refused += res.refused;
  };
  const point = state.phase === "point";
  if (d.out) return { state, refused: 0 };

  if (id === "T1") {
    if (!point && !state.bets.pass) go({ kind: "pass" }, u);
    const o = fillPassOdds(state); state = o.state; refused += o.refused;
  } else if (id === "T2") {
    if (!point && !state.bets.dontPass) go({ kind: "dontPass" }, u);
    const o = fillLayOdds(state); state = o.state; refused += o.refused;
  } else if (id === "T3") {
    if (point && comeCount(state) + (state.bets.come ? 1 : 0) < 2 && !state.bets.come) go({ kind: "come" }, u);
    const o = oddsOnComes(state); state = o.state; refused += o.refused;
  } else if (id === "T4") {
    if (!point && !state.bets.pass) go({ kind: "pass" }, u);
    const o = fillPassOdds(state); state = o.state; refused += o.refused;
    const working = comeCount(state) + (state.bets.pass && point ? 1 : 0);
    if (point && working < 3 && !d.holdCome && !state.bets.come) go({ kind: "come" }, u);
    const c = oddsOnComes(state); state = c.state; refused += c.refused;
  } else if (id === "T5") {
    if (point) { const r = place68(state, 1200); state = r.state; refused += r.refused; }
  } else if (id === "T6" || id === "T24") {
    if (point || id === "T24") {
      const r = placeInside(state, 1000, 1000, 1200, 1200); state = r.state; refused += r.refused;
    }
    if (id === "T24") {
      [4, 10].forEach((n) => { if (state.point === n) return; go({ kind: "lay", number: n }, Math.max(0, 4000 - have(state, { kind: "lay", number: n }))); });
    }
  } else if (id === "T7") {
    if (!state.bets.field) go({ kind: "field" }, u);
    if (point || true) {
      const r = placeInside(state, 1000, 0, 1200, 1200); state = r.state; refused += r.refused;
    }
  } else if (id === "T8") {
    if (point) { const r = place68(state, 1200); state = r.state; refused += r.refused; }
    [6, 8].forEach((n) => go({ kind: "hardway", number: n }, Math.max(0, 100 - have(state, { kind: "hardway", number: n }))));
  } else if (id === "T9") {
    if (!d.regressed && point) {
      const r = placeInside(state, 2000, 2000, 2400, 2400); state = r.state; refused += r.refused;
    }
  } else if (id === "T10" || id === "T17" || id === "T23") {
    if (point && !d.out) { const r = place68(state, 1200); state = r.state; refused += r.refused; }
    if (id === "T23" && !point && !state.bets.dontPass) go({ kind: "dontPass" }, u);
    if (id === "T23" && point && !state.bets.dontPass) { /* flat stays until seven-out or point */ }
  } else if (id === "T11") {
    if (point && !state.bets.come) go({ kind: "come" }, u);
    const c = oddsOnComes(state); state = c.state; refused += c.refused;
  } else if (id === "T12") {
    const start = (params && params.optionB) ? 0 : (d.start || 6);
    if (params && params.optionB && !d.bSplit) {
      const r = placeInside(state, 2000, 2000, 2400, 2400); state = r.state; refused += r.refused;
    } else if (point && !d.out) {
      go({ kind: "place", number: start }, Math.max(0, 1200 - have(state, { kind: "place", number: start })));
    }
  } else if (id === "T13") {
    if (!point && !state.bets.pass) go({ kind: "pass" }, u);
    const o = fillPassOdds(state); state = o.state; refused += o.refused;
    if (point) {
      [6, 8].forEach((n) => {
        if (n === state.point) return;
        go({ kind: "place", number: n }, Math.max(0, 1200 - have(state, { kind: "place", number: n })));
      });
    }
  } else if (id === "T14") {
    if (point && !d.reg1) { const r = across64(state); state = r.state; refused += r.refused; }
  } else if (id === "T15") {
    if (!point && !state.bets.dontPass) go({ kind: "dontPass" }, u);
    const o = fillLayOdds(state); state = o.state; refused += o.refused;
    if (point && dcCount(state) + (state.bets.dontPass && point ? 1 : 0) < 3 && !state.bets.dontCome) go({ kind: "dontCome" }, u);
    const c = layOnDc(state); state = c.state; refused += c.refused;
  } else if (id === "T16") {
    if (!point && !state.bets.dontPass) go({ kind: "dontPass" }, u);
    [4, 10].forEach((n) => {
      if (state.point === n) return;
      if (d.relay && d.relay[n]) return;
      go({ kind: "lay", number: n }, Math.max(0, 4000 - have(state, { kind: "lay", number: n })));
    });
  } else if (id === "T18") {
    if (d.count >= 5 && d.holding && point) {
      const r = placeInside(state, 1000, 1000, 1200, 1200); state = r.state; refused += r.refused;
    }
  } else if (id === "T19") {
    if (!point && !state.bets.pass) go({ kind: "pass" }, u);
    if (!point && !state.bets.dontPass && !state.bets.pass) { /* both on come-out */ }
    if (!point && state.bets.pass && !state.bets.dontPass && state.phase === "come-out") go({ kind: "dontPass" }, u);
    const o = fillPassOdds(state); state = o.state; refused += o.refused;
  } else if (id === "T20") {
    if (d.stopped) return { state, refused };
    if (!point) {
      const amt = d.next || u;
      if (!state.bets.dontPass) go({ kind: "dontPass" }, amt);
    }
  } else if (id === "T21") {
    if (!point && !state.bets.pass) go({ kind: "pass" }, u);
    if (!point) go({ kind: "anyCraps" }, Math.max(0, 100 - state.bets.anyCraps));
  } else if (id === "T22") {
    if (point && !d.out) {
      [6, 8].forEach((n) => go({ kind: "place", number: n }, Math.max(0, (d.step68 || 1800) - have(state, { kind: "place", number: n }))));
    }
  }
  if (id === "T23" && !point && !state.bets.dontPass) go({ kind: "dontPass" }, u);
  return { state, refused };
}

function pressToward(state, kind, number, opening, presses) {
  const cur = have(state, { kind, number });
  if (!cur) return state;
  if (presses >= 2 || cur >= opening * 5) return state;
  const add = TR.legalAdd(state, { kind, number }, Math.floor(cur / 2), have);
  if (!add) return state;
  const res = E.placeBet(state, { kind, number }, add);
  return res.ok ? res.state : state;
}

/** Collects, presses and take-downs after a settle. */
export function afterRoll(state, id, settled, params) {
  const d = mem(state);
  d.id = id;
  const decisions = (settled && settled.decisions) || [];
  const won = (name) => decisions.some((x) => x.bet === name && x.result === "win");
  const lost = (name) => decisions.some((x) => x.bet === name && x.result === "lose");
  if (settled && settled.result === "seven-out") {
    d.rolls = 0;
    d.hits = 0;
    d.out = false;
    d.holdCome = false;
    d.regressed = false;
    d.reg1 = false;
    d.reg2 = false;
    d.count = 0;
    d.holding = false;
    d.relay = {};
    if (id === "T20") {
      /* series continues across shooters until a win or the max */
    }
  } else if (settled) {
    d.rolls = (d.rolls || 0) + 1;
  }
  if (id === "T4" && decisions.some((x) => x.bet.indexOf("Come ") === 0 && x.result === "win")) d.holdCome = false;
  if (id === "T4" && comeCount(state) + (state.phase === "point" && state.bets.pass ? 1 : 0) >= 3) d.holdCome = true;
  if (id === "T8") {
    [6, 8].forEach((n) => {
      if (decisions.some((x) => x.bet === "Hard " + n && x.result === "lose")) {
        const res = put(state, { kind: "hardway", number: n }, 100);
        state = res.state;
      }
    });
  }
  if (id === "T9" && !d.regressed && decisions.some((x) => x.result === "win" && /^(Place|Buy) /.test(x.bet))) {
    [5, 9].forEach((n) => { state = take(state, { kind: "buy", number: n }); });
    [6, 8].forEach((n) => { state = take(state, { kind: "place", number: n }); });
    let r = placeInside(state, 1000, 1000, 1200, 1200);
    state = r.state;
    d.regressed = true;
  }
  if (id === "T10") {
    d.presses = d.presses || {};
    [6, 8].forEach((n) => {
      if (won("Place " + n)) {
        state = pressToward(state, "place", n, 1200, d.presses[n] || 0);
        d.presses[n] = (d.presses[n] || 0) + 1;
      }
    });
  }
  if (id === "T12" && (params && params.optionB) && !d.bSplit && decisions.some((x) => x.result === "win")) {
    [5, 9].forEach((n) => { state = take(state, { kind: "buy", number: n }); });
    const r = put(state, { kind: "place", number: 4 }, 1000);
    state = r.state;
    const r2 = put(state, { kind: "place", number: 10 }, 1000);
    state = r2.state;
    d.bSplit = true;
  }
  if (id === "T14") {
    if (!d.reg1 && [4, 5, 6, 8, 9, 10].some((n) => won("Place " + n))) {
      state = take(state, { kind: "place", number: 4 });
      state = take(state, { kind: "place", number: 10 });
      d.reg1 = true;
    } else if (d.reg1 && !d.reg2 && [5, 6, 8, 9].some((n) => won("Place " + n))) {
      state = take(state, { kind: "place", number: 5 });
      state = take(state, { kind: "place", number: 9 });
      d.reg2 = true;
    }
  }
  if (id === "T16" && settled && settled.result === "seven-out") d.relay = { 4: true, 10: true };
  if (id === "T17") {
    const hit = won("Place 6") || won("Place 8");
    if (hit || (d.rolls || 0) >= 3) {
      state = take(state, { kind: "place", number: 6 });
      state = take(state, { kind: "place", number: 8 });
      d.out = state.phase === "point";
    }
  }
  if (id === "T18" && settled) {
    const total = settled.dice && settled.dice.total;
    const pointNum = [4, 5, 6, 8, 9, 10].indexOf(total) >= 0;
    if ((d.count || 0) === 0) {
      if (settled.result === "point-set") d.count = 1;
    } else if (pointNum && settled.result !== "come-out") {
      d.count += 1;
      if (d.count === 4 && settled.result !== "point-set" && settled.result !== "point-made") d.holding = false;
      if (d.count >= 5 && pointNum) d.holding = true;
    }
    if (d.count === 4) d.holding = false;
    if (d.count >= 5 && pointNum) d.holding = true;
  }
  if (id === "T20" && settled) {
    const dp = decisions.find((x) => x.bet === "Don't Pass");
    if (dp && dp.result === "lose") {
      const cur = d.next || unitOf(params);
      const nxt = cur * 2;
      d.losses = (d.losses || 0) + 1;
      if (nxt > (TR.rulesOf(state).tableMax || 50000)) {
        d.next = unitOf(params);
        d.maxHit = true;
      } else d.next = nxt;
    } else if (dp && dp.result === "win") {
      d.next = unitOf(params);
      d.losses = 0;
      d.maxHit = false;
    }
  }
  if (id === "T22") {
    const hit = [6, 8].some((n) => won("Place " + n));
    if (hit) {
      const i = LADDER68.indexOf(d.step68 || 1800);
      const next = LADDER68[Math.min(LADDER68.length - 1, i + 1)] || 45000;
      [6, 8].forEach((n) => { state = take(state, { kind: "place", number: n }); });
      d.step68 = next;
      [6, 8].forEach((n) => {
        const res = put(state, { kind: "place", number: n }, next);
        state = res.state;
      });
    }
  }
  if (lost("Field") && id === "T7") {
    /* rebet happens on the next autoBet because the field is down */
  }
  state.strategy.data = d;
  return state;
}

export function tutorial(id) {
  const c = strategyById(id);
  const name = c ? c.name : id;
  return [
    { who: "billy", text: name + ". " + (c ? c.how : "") },
    { who: "billy", text: "Watch one decision, then the next. The dice do not remember." },
    { who: "billie", text: c && c.warning ? "" : "Nice and steady." },
    { who: "billy", text: END },
  ].filter((s) => s.text);
}

export function coachPrompt(id, state) {
  const c = strategyById(id);
  if (!c) return "";
  if (c.warning) return c.name + " is a warning card. " + END;
  return c.how + " " + END;
}

export { LADDER68, LADDER59, LADDER410, END as TUTOR_END };
