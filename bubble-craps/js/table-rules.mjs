/**
 * Table Craps rules that sit on the shared engine.
 * Bubble callers never pass a table profile, so these helpers stay idle.
 * Pure. Integer cents. No DOM.
 */

export const TABLE_MIN_CENTS = 1_000;
export const TABLE_MAX_CENTS = 50_000;
export const PLACE68_MAX = 49_800;

export const FIRE_PAY = {
  standard: { min: 4, pay: { 4: 24, 5: 249, 6: 999 }, edge: 20.76 },
  longsix: { min: 4, pay: { 4: 10, 5: 200, 6: 2000 }, edge: 24.86 },
  fire3: { min: 3, pay: { 3: 6, 4: 29, 5: 149, 6: 299 }, edge: 20.73 },
  generous: { min: 4, pay: { 4: 29, 5: 299, 6: 999 }, edge: 8.16 },
};

const NUMS = [4, 5, 6, 8, 9, 10];
const WAYS = { 4: 3, 5: 4, 6: 5, 8: 5, 9: 4, 10: 3 };

export function defaultRules(over) {
  return Object.assign({
    oddsPreset: "345",
    fireMin: 100,
    fireMax: 1000,
    fireTable: "standard",
    big68: false,
    yo: false,
    bar: 12,
    field2: 2,
    field12: 2,
    hardwayAU: false,
    hornPay: "3015",
    any7Pay: 4,
    hopPay: "1530",
    atsDown: false,
    buyVig: "onwin",
    layVig: "onwin",
    vigRound: "exact",
    tableMin: TABLE_MIN_CENTS,
    tableMax: TABLE_MAX_CENTS,
  }, over || {});
}

export function isTable(state) {
  return !!(state && state.profile === "table");
}

export function rulesOf(state) {
  if (!isTable(state)) return null;
  return state.rules || defaultRules();
}

export function presetOf(state) {
  const r = rulesOf(state);
  return (r && r.oddsPreset) || "345";
}

export function oddsMultipleFor(point, preset) {
  const p = preset == null ? "345" : preset;
  if (p === "1x" || p === 1) return 1;
  if (p === "2x" || p === 2) return 2;
  if (p === "5x" || p === 5) return 5;
  if (p === "10x" || p === 10) return 10;
  if (p === "20x" || p === 20) return 20;
  if (p === "100x" || p === 100) return 100;
  if (point === 5 || point === 9) return 4;
  if (point === 6 || point === 8) return 5;
  return 3;
}

export function maxPassFor(line, point, preset) {
  if (!line || !point) return 0;
  return line * oddsMultipleFor(point, preset);
}

/** Omitted point or preset keeps the Bubble contract: 6× the flat. 3-4-5x is also 6×. */
export function maxLayFor(line, point, preset) {
  if (!line) return 0;
  if (point == null || preset == null || preset === "345") return line * 6;
  const winM = oddsMultipleFor(point, preset);
  if (point === 4 || point === 10) return winM * line * 2;
  if (point === 5 || point === 9) return Math.floor((winM * line * 3) / 2);
  if (point === 6 || point === 8) return Math.floor((winM * line * 6) / 5);
  return line * 6;
}

export function vigOf(cents, round) {
  const n = Math.max(0, Math.round(cents || 0));
  if (round === "per20") return Math.ceil(n / 2000) * 100;
  if (round === "per25") return Math.ceil(n / 2500) * 100;
  return Math.floor((n * 5) / 100);
}

export function fieldWin(cents, total, rules) {
  const p2 = rules && rules.field2 === 3 ? 3 : 2;
  const p12 = rules && rules.field12 === 3 ? 3 : 2;
  if (total === 2) return cents * p2;
  if (total === 12) return cents * p12;
  if (total === 3 || total === 4 || total === 9 || total === 10 || total === 11) return cents;
  return 0;
}

export function fieldEdge(rules) {
  const p2 = rules && rules.field2 === 3 ? 3 : 2;
  const p12 = rules && rules.field12 === 3 ? 3 : 2;
  if (p2 === 3 && p12 === 3) return 0;
  if (p2 === 3 || p12 === 3) return 2.78;
  return 5.56;
}

export function hardwayWin(cents, number, au) {
  if (au) {
    if (number === 4 || number === 10) return Math.floor((cents * 15) / 2);
    if (number === 6 || number === 8) return Math.floor((cents * 19) / 2);
    return 0;
  }
  if (number === 4 || number === 10) return cents * 7;
  if (number === 6 || number === 8) return cents * 9;
  return 0;
}

const HARD_HOPS = ["1-1", "2-2", "3-3", "4-4", "5-5", "6-6"];

export function hopMultiple(key, rules) {
  const hard = HARD_HOPS.indexOf(key) >= 0;
  const table = rules && rules.hopPay;
  if (table === "1633") return hard ? 33 : 16;
  if (table === "1631") return hard ? 31 : 16;
  return hard ? 30 : 15;
}

export function hornMultiples(rules) {
  if (rules && rules.hornPay === "3116") return { hi: 31, lo: 16 };
  return { hi: 30, lo: 15 };
}

export function any7Profit(stake, rules) {
  if (rules && rules.any7Pay === 4.5) return Math.floor((stake * 9) / 2);
  return stake * 4;
}

export function layGross(cents, point) {
  if (point === 4 || point === 10) return Math.floor(cents / 2);
  if (point === 5 || point === 9) return Math.floor((cents * 2) / 3);
  if (point === 6 || point === 8) return Math.floor((cents * 5) / 6);
  return 0;
}

export function layNet(cents, point, rules) {
  const gross = layGross(cents, point);
  if (rules && rules.layVig === "upfront") return gross;
  return gross - vigOf(gross, rules && rules.vigRound);
}

export function buyNet(gross, stake, rules) {
  if (rules && rules.buyVig === "upfront") return gross;
  return gross - vigOf(stake, rules && rules.vigRound);
}

export function upfrontCommission(kind, amount, number, rules) {
  if (!rules || amount <= 0) return 0;
  if (kind === "buy" && rules.buyVig === "upfront") return vigOf(amount, rules.vigRound);
  if (kind === "lay" && rules.layVig === "upfront") return vigOf(layGross(amount, number), rules.vigRound);
  return 0;
}

export function vigKey(kind, number) {
  return kind + ":" + number;
}

export function stepOf(kind, spot) {
  const n = spot && spot.number;
  if (kind === "place") {
    if (n === 6 || n === 8) return 600;
    return 500;
  }
  if (kind === "buy") return 500;
  if (kind === "lay") {
    if (n === 6 || n === 8) return 600;
    if (n === 5 || n === 9) return 300;
    return 200;
  }
  if (kind === "passOdds" || kind === "comeOdds") {
    if (n === 6 || n === 8) return 500;
    if (n === 5 || n === 9) return 200;
    return 100;
  }
  if (kind === "dontPassOdds" || kind === "dontComeOdds") {
    if (n === 6 || n === 8) return 600;
    if (n === 5 || n === 9) return 300;
    return 200;
  }
  if (kind === "big6" || kind === "big8") return 100;
  return 0;
}

export function stepMessage(kind, spot) {
  const step = stepOf(kind, spot);
  const dollars = step / 100;
  if (kind === "place" && (spot.number === 6 || spot.number === 8)) return "Place 6 and 8 are in $6 steps.";
  if (kind === "lay") return "Lay bets here are in $" + dollars + " steps.";
  if (kind === "passOdds" || kind === "comeOdds" || kind === "dontPassOdds" || kind === "dontComeOdds") {
    return "Odds here are in $" + dollars + " steps.";
  }
  return "That bet is in $" + dollars + " steps.";
}

export function tableMinFor(kind, spot, rules) {
  const r = rules || defaultRules();
  const n = spot && spot.number;
  if (kind === "passOdds" || kind === "dontPassOdds" || kind === "comeOdds" || kind === "dontComeOdds") return 1;
  if (kind === "fire") return r.fireMin || 100;
  if (kind === "place" && (n === 6 || n === 8)) {
    const min = r.tableMin || TABLE_MIN_CENTS;
    return Math.ceil(min / 600) * 600;
  }
  if (kind === "horn") return 400;
  if (kind === "ce") return 200;
  if (kind === "field" || kind === "any7" || kind === "pass" || kind === "dontPass" || kind === "come" || kind === "dontCome" || kind === "place" || kind === "buy" || kind === "lay") {
    return r.tableMin || TABLE_MIN_CENTS;
  }
  if (kind === "hardway" || kind === "anyCraps" || kind === "hop" || kind === "yo" || kind === "repeater" || kind === "small" || kind === "tall" || kind === "all" || kind === "hardAllDay" || kind === "big6" || kind === "big8") return 100;
  return 100;
}

export function tableMaxFor(kind, spot, rules) {
  const r = rules || defaultRules();
  const n = spot && spot.number;
  if (kind === "passOdds" || kind === "dontPassOdds" || kind === "comeOdds" || kind === "dontComeOdds") return Infinity;
  if (kind === "repeater") return 2500;
  if (kind === "hop") return 10000;
  if (kind === "fire") return r.fireMax || 1000;
  if (kind === "place" && (n === 6 || n === 8)) return Math.floor((r.tableMax || TABLE_MAX_CENTS) / 600) * 600;
  return r.tableMax || TABLE_MAX_CENTS;
}

export function numberConflict(state, spot) {
  if (!isTable(state)) return null;
  const kind = spot.kind;
  if (kind !== "place" && kind !== "buy" && kind !== "lay") return null;
  const n = spot.number;
  const b = state.bets;
  const have = {
    place: (b.place && b.place[n]) || 0,
    buy: (b.buy && b.buy[n]) || 0,
    lay: (b.lay && b.lay[n]) || 0,
  };
  const order = ["place", "buy", "lay"];
  for (const from of order) {
    if (from === kind) continue;
    if (have[from] > 0) {
      return { from, to: kind, number: n, amount: have[from] };
    }
  }
  return null;
}

export function fireTable(rules) {
  const id = (rules && rules.fireTable) || "standard";
  return FIRE_PAY[id] || FIRE_PAY.standard;
}

export function fireMultiple(count, rules) {
  const table = fireTable(rules);
  if (count < table.min) return 0;
  return table.pay[count] || 0;
}

/** Probability of 0..6 distinct Pass-line points, to more than 3 decimals. */
export function fireDistribution() {
  const pPoint = {};
  NUMS.forEach((n) => { pPoint[n] = WAYS[n] / 24; });
  let mass = new Map([[0, 1]]);
  const end = [0, 0, 0, 0, 0, 0, 0];
  for (let iter = 0; iter < 64; iter++) {
    const next = new Map();
    let moved = 0;
    mass.forEach((p, mask) => {
      if (p < 1e-16) return;
      moved += p;
      NUMS.forEach((n, i) => {
        const bit = 1 << i;
        const make = WAYS[n] / (WAYS[n] + 6);
        const seven = 6 / (WAYS[n] + 6);
        const base = p * pPoint[n];
        end[pop(mask)] += base * seven;
        const pm = base * make;
        if (mask & bit) {
          next.set(mask, (next.get(mask) || 0) + pm);
        } else {
          const nm = mask | bit;
          if (pop(nm) === 6) end[6] += pm;
          else next.set(nm, (next.get(nm) || 0) + pm);
        }
      });
    });
    mass = next;
    if (moved < 1e-14) break;
  }
  return end;
}

function pop(mask) {
  let n = 0;
  while (mask) {
    n += mask & 1;
    mask >>= 1;
  }
  return n;
}

export function fireEdgeFrom(dist, rules) {
  const table = fireTable(rules);
  let ev = 0;
  let lose = 0;
  for (let k = 0; k <= 6; k++) {
    const pay = k >= table.min ? (table.pay[k] || 0) : 0;
    if (pay) ev += dist[k] * pay;
    else lose += dist[k];
  }
  return (lose - ev) * 100;
}

export const LAY_EDGE = { onwin: { 4: 1.67, 5: 2, 6: 2.27 }, upfront: { 4: 2.44, 5: 3.23, 6: 4 } };

export function layEdge(number, rules) {
  const key = number === 10 ? 4 : number === 9 ? 5 : number === 8 ? 6 : number;
  const mode = rules && rules.layVig === "upfront" ? "upfront" : "onwin";
  return LAY_EDGE[mode][key] != null ? LAY_EDGE[mode][key] : LAY_EDGE.onwin[4];
}

export const COMBINED = {
  pass345: 0.374,
  pass5: 0.326,
  pass10: 0.184,
  dont345: 0.273,
  dont5: 0.227,
  dont10: 0.124,
};

/**
 * Lays, Big 6/8, Yo and the Fire Bet. Mutates `state`.
 * `api.payStay` / `api.loseDown` / `api.push` match the engine helpers.
 */
export function settleTableSide(state, ctx, api) {
  const rules = rulesOf(state);
  if (!rules) return;
  const total = ctx.total;
  const betsOff = !!state.betsOff;
  const comeOut = !!ctx.comeOut;
  settleLays(state, total, comeOut, betsOff, rules, api);
  settleBig(state, total, betsOff, rules, api);
  settleYo(state, total, rules, api);
  settleFire(state, ctx, rules, api);
}

function settleLays(state, total, comeOut, betsOff, rules, api) {
  const working = !betsOff && !(comeOut && state.layWorkingOnComeOut === false);
  const b = state.bets;
  if (!b.lay) return;
  if (!working) return;
  if (total === 7) {
    NUMS.forEach((n) => {
      const stake = b.lay[n];
      if (!stake) return;
      const profit = layNet(stake, n, rules);
      const vig = rules.layVig === "upfront" ? 0 : vigOf(layGross(stake, n), rules.vigRound);
      state.bankroll += stake + profit;
      b.lay[n] = 0;
      clearVig(state, "lay", n);
      api.push("Lay " + n, "win", stake, profit, { vig, edge: layEdge(n, rules) });
    });
    return;
  }
  if (b.lay[total]) {
    const stake = b.lay[total];
    b.lay[total] = 0;
    clearVig(state, "lay", total);
    api.push("Lay " + total, "lose", stake, 0, { edge: layEdge(total, rules) });
  }
}

function settleBig(state, total, betsOff, rules, api) {
  if (!rules.big68 || betsOff) return;
  const b = state.bets;
  ["big6", "big8"].forEach((key) => {
    const stake = b[key] || 0;
    if (!stake) return;
    const n = key === "big6" ? 6 : 8;
    if (total === 7) {
      b[key] = 0;
      api.push("Big " + n, "lose", stake, 0, { edge: 9.09 });
    } else if (total === n) {
      api.payStay("Big " + n, stake, stake, { edge: 9.09 });
    }
  });
}

function settleYo(state, total, rules, api) {
  if (!rules.yo || !state.bets.yo) return;
  const stake = state.bets.yo;
  if (total === 11) api.payStay("Yo", stake, stake * 15, { edge: 11.11 });
  else {
    state.bets.yo = 0;
    api.push("Yo", "lose", stake, 0, { edge: 11.11 });
  }
}

function clearVig(state, kind, number) {
  if (!state.vigHeld) return;
  delete state.vigHeld[vigKey(kind, number)];
}

export function refundVig(state, kind, number, take, before) {
  if (!state.vigHeld) return 0;
  const key = vigKey(kind, number);
  const held = state.vigHeld[key] || 0;
  if (!held || !before) return 0;
  const back = take >= before ? held : Math.floor((held * take) / before);
  state.vigHeld[key] = held - back;
  if (!state.vigHeld[key]) delete state.vigHeld[key];
  return back;
}

function settleFire(state, ctx, rules, api) {
  const b = state.bets;
  if (!state.firePoints) state.firePoints = [];
  if (ctx.lineResult === "point-made" && ctx.point && state.firePoints.indexOf(ctx.point) < 0) {
    state.firePoints.push(ctx.point);
  }
  const count = state.firePoints.length;
  const table = fireTable(rules);
  if (b.fire && count === 6) {
    const mult = table.pay[6] || 0;
    const stake = b.fire;
    const profit = stake * mult;
    state.bankroll += stake + profit;
    b.fire = 0;
    api.push("Fire Bet", "win", stake, profit, { level: 6, edge: table.edge, immediate: true });
    state.fireNote = "paid6";
  }
  if (ctx.lineResult === "seven-out") {
    if (b.fire) {
      const stake = b.fire;
      const mult = count >= table.min ? (table.pay[count] || 0) : 0;
      if (mult) {
        const profit = stake * mult;
        state.bankroll += stake + profit;
        api.push("Fire Bet", "win", stake, profit, { level: count, edge: table.edge });
      } else {
        api.push("Fire Bet", "lose", stake, 0, { level: count, edge: table.edge });
      }
      b.fire = 0;
    }
    state.firePoints = [];
    state.fireOpen = true;
    state.fireNote = state.fireNote || (count ? "end" : "");
  } else if (ctx.comeOut) {
    state.fireOpen = false;
  }
  state.fireCount = state.firePoints.length;
}

/** Largest legal add ≤ want. 0 means don't bet. */
export function legalAdd(state, spot, want, amountOf) {
  const rules = rulesOf(state) || defaultRules();
  const kind = spot.kind;
  const have = amountOf(state, spot);
  const min = tableMinFor(kind, spot, rules);
  const max = tableMaxFor(kind, spot, rules);
  const step = stepOf(kind, spot) || 1;
  let room = state.bankroll;
  const commission = upfrontCommission(kind, step, spot.number, rules);
  if (max !== Infinity) room = Math.min(room, Math.max(0, max - have));
  let n = Math.min(Math.max(0, Math.round(want || 0)), room);
  if (step > 1) n = Math.floor(n / step) * step;
  if (kind === "buy" && rules.buyVig === "upfront") {
    while (n > 0 && n + upfrontCommission(kind, n, spot.number, rules) > state.bankroll) n -= step;
  }
  if (kind === "lay" && rules.layVig === "upfront") {
    while (n > 0 && n + upfrontCommission(kind, n, spot.number, rules) > state.bankroll) n -= step;
  }
  if (n < 0) n = 0;
  if (have === 0 && n < min) return 0;
  if (commission && n === 0) return 0;
  return n;
}

export const RULE0_LINE = "Real dice, real odds. Every roll is two fair, independent dice from your device's secure random generator, so a 7 comes up 6 times in 36, every roll. Nothing (your bets, your streak, your dice set, badges or Premium) can change a roll.";

export const NO_ROLL = "Can't roll: this device's secure random generator isn't available";
