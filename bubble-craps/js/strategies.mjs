/**
 * App 1 strategy cards B1–B14 and auto-bet maintenance.
 */
import {
  TABLE_MIN,
  formatMoney,
  maxPassOdds,
  maxLayOdds,
  numbersFor,
  placeBet,
  placeBillysWay,
  removeBet,
  press,
  powerPress,
  billysWayAmounts,
} from "./engine.mjs";

export const STRATEGIES = [
  {
    id: "B1",
    name: "Pass Line + Max Odds",
    mode: "both",
    filter: ["all", "regular", "crapless"],
    edge: "0.37% Regular · 1.26% Crapless with max odds",
    risk: "Low to Medium",
    bankroll: "30 units flat. With max odds, 60 to 90 units.",
    how: "Pass on the come-out. Take 3-4-5x odds once a point is set. Odds have no house edge, so the combined edge drops to 0.37% in Regular and 1.26% in Crapless.",
  },
  {
    id: "B2",
    name: "Don't Pass + Lay Odds",
    mode: "regular",
    filter: ["all", "regular"],
    edge: "1.40% per bet resolved · 0.27% with 6x lay",
    risk: "Low",
    bankroll: "60 to 80 units. Stop-loss 50%.",
    how: "Don't Pass on the come-out. Lay up to 6x after the point. 2 and 3 win, 7 and 11 lose, 12 pushes. Not available in Crapless.",
  },
  {
    id: "B3",
    name: "3-Point Molly",
    mode: "both",
    filter: ["all", "regular", "crapless"],
    edge: "0.37% each Regular · 1.26% each Crapless",
    risk: "Medium",
    bankroll: "100+ units. A seven-out takes all three numbers.",
    how: "Pass plus odds, then two Come bets with odds, so three numbers are working. Replace Come bets as they win.",
  },
  {
    id: "B4",
    name: "Place 6 and 8",
    mode: "both",
    filter: ["all", "regular", "crapless"],
    edge: "1.52% · 0.46% per roll",
    risk: "Low to Medium",
    bankroll: "25 to 30 pairs. Stop-loss 50%.",
    how: "Place 6 and 8 in $6 units (7 to 6). Off on the come-out unless you turn working on. Buy 6/8 is worse under Standard rules (2.27%).",
  },
  {
    id: "B5",
    name: "Place 6/8 Regression & Press",
    mode: "both",
    filter: ["all", "regular", "crapless", "lessons"],
    edge: "1.52%, unchanged by pressing",
    risk: "Medium, then Low",
    bankroll: "20 to 25 times the opening spread.",
    how: "Open at $18 each. After the first hit, regress to $6 each. Later hits press one $6 unit, up to 3 times per number. Same edge, more at risk when you press.",
  },
  {
    id: "B6",
    name: "Crapless Line + Odds: \"Make the line pay\"",
    mode: "crapless",
    filter: ["all", "crapless"],
    edge: "5.38% flat · 1.26% with max odds",
    risk: "Medium to High",
    bankroll: "80 to 100 units. Stop-loss 50%.",
    how: "Pass at the minimum, then always take max odds. On 2/12, 3x odds pay 6 to 1. On 3/11 they pay 3 to 1. A 2 or 12 point wins 1 time in 7.",
  },
  {
    id: "B7",
    name: "Crapless 6/8 Only, Avoid 2/3/11/12",
    mode: "crapless",
    filter: ["all", "crapless"],
    edge: "1.52% on 6/8. Pass 5.38% flat.",
    risk: "Low to Medium",
    bankroll: "30 to 40 units.",
    how: "Pass plus odds and Place 6/8. No Place or Buy on 2, 3, 11, or 12. Those Place bets cost 6.25% to 7.14%.",
  },
  {
    id: "B8",
    name: "Crapless Conservative Outside",
    mode: "crapless",
    filter: ["all", "crapless"],
    edge: "Buy 4/10 1.67% · Buy 5/9 2.00%",
    risk: "Medium",
    bankroll: "40 units. Stop-loss 40%.",
    how: "After the point, Buy 4, 5, 9, and 10. Leave 2, 3, 11, and 12 alone. Take them down after 3 hits.",
  },
  {
    id: "B9",
    name: "Why You Skip Place 2/12 and 3/11",
    mode: "crapless",
    filter: ["all", "crapless", "lessons"],
    edge: "Place 2/12 7.14% vs Buy 0.71%. Place 3/11 6.25% vs Buy 1.25%.",
    risk: "Very High on Place 2/12",
    bankroll: "Lesson card. No auto-bet.",
    how: "Place 2/12 pays 11 to 2 against true odds of 6 to 1. Place 3/11 pays 11 to 4 against 3 to 1. Buy pays true odds less 5% of the stake, and only on a win. This card does not place a bet.",
    lesson: true,
  },
  {
    id: "B10",
    name: "Crapless Come-Bet Ladder",
    mode: "crapless",
    filter: ["all", "crapless"],
    edge: "5.38% flat · about 1.26% with odds",
    risk: "High",
    bankroll: "120+ units. Stop-loss 40%.",
    how: "Pass plus odds, then one Come bet per roll until three numbers are working. Take max odds on each.",
  },
  {
    id: "B11",
    name: "Bubble Budget Grind",
    mode: "both",
    filter: ["all", "regular", "crapless", "lessons"],
    edge: "1.41% Regular · 5.38% Crapless",
    risk: "Low",
    bankroll: "30 units. Stop-loss 15 units. 100-roll limit.",
    how: "Pass flat at the table minimum. Take odds only when the bankroll can spare them. No prop bets. Stops after 100 rolls. Regular is the cheaper line.",
  },
  {
    id: "B12",
    name: "Billy's Way",
    mode: "both",
    filter: ["all", "regular", "crapless"],
    edge: "1.71% blended Regular · 1.43% Crapless",
    risk: "Medium to High",
    bankroll: "About 100 to 130 units Regular, 160 to 210 Crapless.",
    how: "One unit across. Regular buys 4, 5, 9, 10 and places 6 and 8. Crapless also buys 2, 3, 11, 12. Each spot is its own bet. A 7 takes them all.",
  },
  {
    id: "B13",
    name: "Continuous Come",
    mode: "both",
    filter: ["all", "regular", "crapless"],
    edge: "0.37% Regular with max odds · 1.26% Crapless",
    risk: "High in Regular · Very High in Crapless",
    bankroll: "About 250 units Regular at max odds, 400 units Crapless. Stop-loss 40%. Win goal +30%.",
    how: "Pass plus odds, then a new Come bet with odds on every point roll. Uncapped unless you set a cap. Each Come bet is a new Pass Line. A new one every roll means about one flat bet per roll.",
  },
  {
    id: "B14",
    name: "Hit and Split",
    mode: "both",
    filter: ["all", "regular", "crapless"],
    edge: "1.52% at the start · 1.69% once across",
    risk: "Medium, then Medium-High",
    bankroll: "20 starts ($240). Stop-loss 6 starts or 40%.",
    how: "Start Place 6 or 8 at $12. Each hit splits the win onto the next numbers until you are across, then collect. Splitting re-bets the win on new numbers. Same odds per bet, more at risk on a 7. Auto-press stays off while this is running.",
  },
];

export function strategyById(id) {
  return STRATEGIES.find((s) => s.id === id) || null;
}

function unitFromChip(chip) {
  return Math.max(TABLE_MIN, chip || TABLE_MIN);
}

function tryPlace(state, spot, amount, out) {
  if (amount <= 0 || amount > state.bankroll) {
    out.skipped.push({ ...spot, reason: "Not enough practice chips." });
    if (amount > state.bankroll) out.short = true;
    return state;
  }
  const res = placeBet(state, spot, amount);
  if (!res.ok) {
    out.skipped.push({ ...spot, reason: res.error });
    return state;
  }
  out.placed.push({ ...spot, amount });
  return res.state;
}

function topUp(state, spot, target, out) {
  const cur = spot.kind === "pass" ? state.bets.pass
    : spot.kind === "dontPass" ? state.bets.dontPass
      : spot.kind === "come" ? state.bets.come
        : spot.kind === "place" ? state.bets.place[spot.number] || 0
          : spot.kind === "buy" ? state.bets.buy[spot.number] || 0
            : 0;
  if (cur >= target) return state;
  return tryPlace(state, spot, target - cur, out);
}

function fillPassOdds(state, out) {
  if (state.phase !== "point" || !state.bets.pass) return state;
  const cap = maxPassOdds(state.bets.pass, state.point);
  const need = cap - state.bets.passOdds;
  if (need <= 0) return state;
  const add = Math.min(need, state.bankroll);
  if (add <= 0) return state;
  return tryPlace(state, { kind: "passOdds" }, add, out);
}

function fillLay(state, out) {
  if (state.phase !== "point" || !state.bets.dontPass) return state;
  const cap = maxLayOdds(state.bets.dontPass);
  const need = cap - state.bets.dontPassOdds;
  if (need <= 0) return state;
  return tryPlace(state, { kind: "dontPassOdds" }, Math.min(need, state.bankroll), out);
}

function fillComeOdds(state, out) {
  let next = state;
  Object.keys(next.bets.comeBets).forEach((key) => {
    const n = Number(key);
    const slot = next.bets.comeBets[n];
    if (!slot || !slot.amount) return;
    const cap = maxPassOdds(slot.amount, n);
    const need = cap - (slot.odds || 0);
    if (need > 0) next = tryPlace(next, { kind: "comeOdds", number: n }, Math.min(need, next.bankroll), out);
  });
  return next;
}

function comePointCount(state) {
  return Object.values(state.bets.comeBets).filter((s) => s && s.amount).length;
}

function oddsCap(line, point, level) {
  if (!line || !point || level === "flat") return 0;
  if (level === "1" || level === "1x") return line;
  if (level === "2" || level === "2x") return line * 2;
  return maxPassOdds(line, point);
}

function fillExact(state, spot, need, out) {
  if (need <= 0) return state;
  if (need > state.bankroll) {
    out.short = true;
    out.skipped.push({ ...spot, reason: "Not enough practice chips." });
    return state;
  }
  return tryPlace(state, spot, need, out);
}

function fillPassOddsLevel(state, out, level) {
  if (state.phase !== "point" || !state.bets.pass) return state;
  const cap = oddsCap(state.bets.pass, state.point, level);
  return fillExact(state, { kind: "passOdds" }, cap - state.bets.passOdds, out);
}

function fillComeOddsLevel(state, out, level) {
  let next = state;
  Object.keys(next.bets.comeBets).forEach((key) => {
    const n = Number(key);
    const slot = next.bets.comeBets[n];
    if (!slot || !slot.amount) return;
    const cap = oddsCap(slot.amount, n, level);
    const need = cap - (slot.odds || 0);
    next = fillExact(next, { kind: "comeOdds", number: n }, need, out);
  });
  return next;
}

function b14HasBets(state) {
  return [2, 3, 4, 5, 6, 8, 9, 10, 11, 12].some((n) => (state.bets.place[n] || 0) > 0 || (state.bets.buy[n] || 0) > 0);
}

function b14Reset(data) {
  data.step = 0;
  data.partial = "";
  data.across = false;
  data.collected = 0;
  data.regressDone = false;
}

function b14TakeAll(state) {
  let next = state;
  [2, 3, 4, 5, 6, 8, 9, 10, 11, 12].forEach((n) => {
    ["place", "buy"].forEach((kind) => {
      if (next.bets[kind][n]) {
        const res = removeBet(next, { kind, number: n });
        if (res.ok) next = res.state;
      }
    });
  });
  return next;
}

function b14OnHits(state, data, wins, out) {
  const profit = wins.reduce((sum, d) => sum + (d.profit || 0), 0);
  const start = data.start;
  const numOf = (d) => {
    const m = /^(Place|Buy) (\d+)$/.exec(d.bet || "");
    return m ? Number(m[2]) : 0;
  };
  if (data.across) {
    const startHit = wins.some((d) => numOf(d) === start);
    const handPressed = data.override && data.override[start];
    if (startHit && !data.regressDone && !handPressed && (state.bets.place[start] || 0) >= 1200) {
      const res = removeBet(state, { kind: "place", number: start }, 600);
      if (res.ok) state = res.state;
      data.regressDone = true;
      data.collected = (data.collected || 0) + 1;
      out.message = "Regressed " + start + " to $6. The win stays in chips.";
    }
    wins.forEach((d) => {
      const n = numOf(d);
      if (!n || n === start) return;
      const kind = String(d.bet).indexOf("Buy") === 0 ? "buy" : "place";
      if ((state.bets[kind][n] || 0) > 0) {
        data.collected = (data.collected || 0) + 1;
        out.message = "Collected " + n + ". The bet stays up.";
      }
    });
    if ((data.collected || 0) >= 2) {
      state = b14TakeAll(state);
      b14Reset(data);
      data.armed = false;
      data.down = true;
      data.sawComeOut = false;
      out.message = "Two collected hits. The ladder comes down and starts again on the next point.";
    }
    return state;
  }
  const other = start === 6 ? 8 : 6;
  const step = data.step || 0;
  if (step === 0) {
    state = fillExact(state, { kind: "place", number: other }, 600, out);
    data.step = 1;
    out.message = "Split the win: Place " + other + " $6. The rest stays in chips.";
    return state;
  }
  const pairs = [[5, 9], [4, 10]];
  if (data.extend) pairs.push([3, 11], [2, 12]);
  const pair = pairs[step - 1];
  if (!pair) {
    data.across = true;
    return state;
  }
  const [a, b] = pair;
  if (data.partial) {
    const left = data.partial === "a" ? b : a;
    state = fillExact(state, { kind: "buy", number: left }, 500, out);
    data.partial = "";
    data.step = step + 1;
  } else if (profit < 1000) {
    state = fillExact(state, { kind: "buy", number: a }, 500, out);
    data.partial = "a";
    out.message = "Win under $10. Buy " + a + " $5 now. The pair finishes on the next hit.";
  } else {
    state = fillExact(state, { kind: "buy", number: a }, 500, out);
    state = fillExact(state, { kind: "buy", number: b }, 500, out);
    data.step = step + 1;
  }
  const done = data.extend ? 5 : 3;
  if (!data.partial && (data.step || 0) >= done) data.across = true;
  return state;
}

function maintainB14(state, strat, out) {
  const data = strat.data;
  data.start = data.start === 8 ? 8 : 6;
  const rollId = (state.stats && state.stats.rolls) || 0;
  if (data.armed && state.lastDice && state.lastDice.total === 7 && !b14HasBets(state) && data.lossRoll !== rollId) {
    data.lossRoll = rollId;
    data.armed = false;
    data.startsLost = (data.startsLost || 0) + 1;
    b14Reset(data);
    data.down = false;
    if (data.startsLost >= 6) {
      out.stop = true;
      out.message = "Hit and Split stopped. 6 starts lost.";
      return state;
    }
    out.message = "Start lost (" + data.startsLost + " of 6). The ladder resets.";
  }
  const sig = String((state.lastDice && state.lastDice.total) || "") + ":" + rollId;
  if (data.down) {
    if (state.phase === "come-out") data.sawComeOut = true;
    if (data.sawComeOut && state.phase === "point") {
      data.down = false;
      data.sawComeOut = false;
    } else return state;
  }
  if (!b14HasBets(state) && (data.step || 0) > 0) b14Reset(data);
  if (data.seenSig !== sig) {
    data.seenSig = sig;
    const wins = (state.lastDecisions || []).filter((d) => d.result === "win" && /^(Place|Buy) \d+$/.test(d.bet || ""));
    if (wins.length) state = b14OnHits(state, data, wins, out);
  }
  if (data.down) return state;
  if (state.phase === "point" && (data.step || 0) === 0 && !data.across && !data.partial && !(state.bets.place[data.start] > 0)) {
    state = fillExact(state, { kind: "place", number: data.start }, 1200, out);
    if (state.bets.place[data.start] > 0) data.armed = true;
  }
  return state;
}

function ensureData(state, id) {
  if (!state.strategy || state.strategy.id !== id) {
    state.strategy = { id, rolls: 0, data: {} };
  }
  return state.strategy;
}

/**
 * Place or repair the strategy's bets. Call before a roll.
 * Does not stack a fresh unit every roll; it maintains the recipe.
 */
export function autoBet(state, id, chipCents, opts = {}) {
  const card = strategyById(id);
  const out = { placed: [], skipped: [], message: "" };
  if (!card) return { ok: false, state, ...out, message: "Unknown strategy." };
  if (card.lesson) {
    return {
      ok: true,
      state,
      ...out,
      message: "Place 2/12 is 7.14%. Buy 2/12 is 0.71%. Place 3/11 is 6.25%. Buy 3/11 is 1.25%. This lesson does not bet.",
    };
  }
  if (card.mode !== "both" && card.mode !== state.mode) {
    return { ok: false, state, ...out, message: card.name + " is a " + card.mode + " strategy." };
  }
  const chip = chipCents || TABLE_MIN;
  const bet = unitFromChip(chip);
  let next = structuredClone(state);
  const strat = ensureData(next, id);
  if (opts.count !== false) strat.rolls = (strat.rolls || 0) + 1;
  if (id === "B11" && strat.rolls > 100) {
    next.strategy = strat;
    return { ok: true, state: next, ...out, paused: true, message: "100-roll limit. Budget grind is paused." };
  }

  if (id === "B1" || id === "B6" || id === "B7" || id === "B11") {
    if (next.phase === "come-out") next = topUp(next, { kind: "pass" }, id === "B11" ? TABLE_MIN : bet, out);
    const oddsOk = id !== "B11" || next.bankroll >= TABLE_MIN * 20;
    if (oddsOk) next = fillPassOdds(next, out);
  }
  if (id === "B2") {
    if (next.phase === "come-out") next = topUp(next, { kind: "dontPass" }, bet, out);
    next = fillLay(next, out);
  }
  if (id === "B3") {
    if (next.phase === "come-out") next = topUp(next, { kind: "pass" }, bet, out);
    next = fillPassOdds(next, out);
    const working = (next.phase === "point" ? 1 : 0) + comePointCount(next) + (next.bets.come ? 1 : 0);
    if (next.phase === "point" && working < 3 && !next.bets.come) {
      next = tryPlace(next, { kind: "come" }, bet, out);
    }
    next = fillComeOdds(next, out);
  }
  if (id === "B4") {
    const stake = Math.floor((bet * 6) / 5);
    [6, 8].forEach((n) => {
      if ((next.bets.place[n] || 0) < stake) next = tryPlace(next, { kind: "place", number: n }, stake - (next.bets.place[n] || 0), out);
    });
  }
  if (id === "B5") {
    const data = strat.data;
    const mode = (next.autoPress && next.autoPress.mode) || "off";
    const cap = mode === "off" ? 3 : Math.min(5, Math.max(1, Number(next.autoPress.max) || 3));
    if (data.stopped) {
      out.paused = true;
      out.message = "Three opening spreads lost. Place 6/8 regression is paused.";
    } else {
      const p6 = next.bets.place[6] || 0;
      const p8 = next.bets.place[8] || 0;
      if (data.opened && p6 === 0 && p8 === 0) {
        data.losses = (data.losses || 0) + 1;
        data.opened = false;
        data.regressed = false;
        data.presses = { 6: 0, 8: 0 };
        if (data.losses >= 3) {
          data.stopped = true;
          out.paused = true;
          out.message = "Three opening spreads lost. Place 6/8 regression is paused.";
        }
      }
      const hit = (next.lastDecisions || []).some((d) => d.result === "win" && (d.bet === "Place 6" || d.bet === "Place 8"));
      if (!data.stopped && !data.opened) {
        [6, 8].forEach((n) => {
          if ((next.bets.place[n] || 0) < 1800) next = tryPlace(next, { kind: "place", number: n }, 1800 - (next.bets.place[n] || 0), out);
        });
        if ((next.bets.place[6] || 0) >= 1800 && (next.bets.place[8] || 0) >= 1800) data.opened = true;
      } else if (!data.stopped && !data.regressed && hit) {
        [6, 8].forEach((n) => {
          const have = next.bets.place[n] || 0;
          if (have > 600) {
            const res = removeBet(next, { kind: "place", number: n }, have - 600);
            if (res.ok) next = res.state;
          }
        });
        data.regressed = true;
        data.presses = { 6: 0, 8: 0 };
        out.message = "Regressed 6 and 8 to $6.";
      } else if (!data.stopped && data.regressed && hit) {
        data.presses = data.presses || { 6: 0, 8: 0 };
        const n = (next.lastDecisions || []).reduce((found, d) => {
          if (d.result !== "win") return found;
          if (d.bet === "Place 6") return 6;
          if (d.bet === "Place 8") return 8;
          return found;
        }, 0);
        if (n && (data.presses[n] || 0) < cap) {
          const res = mode === "power" ? powerPress(next) : press(next);
          if (res.ok) {
            next = res.state;
            data.presses[n] += 1;
            const stake = next.bets.place[n];
            if (mode === "power") {
              const extra = res.give > 0 ? " (added " + formatMoney(res.give) + " from chips)" : (res.back > 0 ? " (get " + formatMoney(res.back) + ")" : " (even)");
              out.message = "Auto POWER PRESS " + n + " → " + formatMoney(stake) + extra;
            } else {
              const prefix = mode === "off" ? "PRESS" : "Auto PRESS";
              out.message = prefix + " " + n + " +" + formatMoney(res.added) + " → " + formatMoney(stake);
            }
          }
        }
      }
    }
  }
  if (id === "B7") {
    const stake = Math.floor((bet * 6) / 5);
    [6, 8].forEach((n) => {
      if ((next.bets.place[n] || 0) < stake) next = tryPlace(next, { kind: "place", number: n }, stake - (next.bets.place[n] || 0), out);
    });
  }
  if (id === "B8") {
    const data = strat.data;
    if (!data.seen) data.seen = true;
    else if (!data.resting) {
      const buyHit = (next.lastDecisions || []).filter((d) => d.result === "win" && /^Buy (4|5|9|10)$/.test(d.bet)).length;
      data.hits = (data.hits || 0) + buyHit;
    }
    if (data.resting) {
      if (next.phase === "come-out") data.resting = false;
    } else if ((data.hits || 0) >= 3) {
      [4, 5, 9, 10].forEach((n) => {
        if (next.bets.buy[n]) {
          const res = removeBet(next, { kind: "buy", number: n });
          if (res.ok) next = res.state;
        }
      });
      data.hits = 0;
      data.resting = true;
      out.message = "Three outside hits. Buys taken down.";
    } else if (next.phase === "point") {
      [4, 5, 9, 10].forEach((n) => {
        if (!next.bets.buy[n]) next = tryPlace(next, { kind: "buy", number: n }, TABLE_MIN, out);
      });
    }
  }
  if (id === "B10") {
    if (next.phase === "come-out") next = topUp(next, { kind: "pass" }, bet, out);
    next = fillPassOdds(next, out);
    const workingNums = (next.phase === "point" ? 1 : 0) + comePointCount(next);
    if (next.phase === "point" && workingNums < 3 && !next.bets.come) {
      next = tryPlace(next, { kind: "come" }, bet, out);
    }
    next = fillComeOdds(next, out);
  }
  if (id === "B13") {
    const data = strat.data;
    const level = data.odds || "max";
    const cap = Math.max(0, Math.floor(Number(data.cap) || 0));
    if (next.phase === "come-out") next = topUp(next, { kind: "pass" }, TABLE_MIN, out);
    else {
      next = fillPassOddsLevel(next, out, level);
      next = fillComeOddsLevel(next, out, level);
      const working = comePointCount(next) + (next.bets.come ? 1 : 0);
      if (!(cap > 0 && working >= cap) && !next.bets.come) next = tryPlace(next, { kind: "come" }, TABLE_MIN, out);
    }
  }
  if (id === "B14") {
    next = maintainB14(next, strat, out);
    if (out.stop) {
      next.strategy = null;
      return { ok: true, state: next, ...out };
    }
  }
  if (id === "B12") {
    const want = billysWayAmounts(chip);
    const buys = (state.mode === "crapless" ? [2, 3, 4, 5, 9, 10, 11, 12] : [4, 5, 9, 10]).filter((n) => numbersFor(next).includes(n));
    const missing = buys.some((n) => (next.bets.buy[n] || 0) < want.buy) || [6, 8].some((n) => (next.bets.place[n] || 0) < want.place);
    if (missing && next.phase === "point") {
      const res = placeBillysWay(next, chip);
      next = res.state;
      out.placed.push(...res.placed);
      out.skipped.push(...res.skipped);
    }
  }
  next.strategy = strat;
  return { ok: true, state: next, ...out };
}

/**
 * Press the Billy's Way spot that just won. B5 applies the same setting itself.
 * Does not change the bet's original amount.
 */
export function applyAutoPress(state) {
  const cfg = state.autoPress || { mode: "off", max: 3, counts: {} };
  if (!cfg.mode || cfg.mode === "off") return { ok: false, state, skipped: true };
  if (state.strategy && (state.strategy.id === "B5" || state.strategy.id === "B14")) return { ok: false, state, skipped: true };
  const lw = state.lastWin;
  if (!lw) return { ok: false, state, error: "after a hit" };
  const marked = state.billyMark && state.billyMark[lw.kind] && state.billyMark[lw.kind][lw.number];
  if (!marked) return { ok: false, state, error: "not a Billy's Way spot" };
  const counts = { ...(cfg.counts || {}) };
  const key = lw.kind + ":" + lw.number;
  const cap = Math.min(5, Math.max(1, Number(cfg.max) || 3));
  if ((counts[key] || 0) >= cap) return { ok: false, state, error: "auto-press cap" };
  const res = cfg.mode === "power" ? powerPress(state) : press(state);
  if (!res.ok) {
    if (cfg.mode === "power" && res.error === "not enough chips") {
      return { ok: false, state, error: res.error, message: "Collected: not enough chips for the next step" };
    }
    return { ok: false, state, error: res.error };
  }
  counts[key] = (counts[key] || 0) + 1;
  res.state.autoPress = { mode: cfg.mode, max: cap, counts };
  const kind = res.toKind || lw.kind;
  const stake = res.state.bets[kind][lw.number];
  let message;
  if (cfg.mode === "power") {
    const extra = res.give > 0 ? " (added " + formatMoney(res.give) + " from chips)" : (res.back > 0 ? " (get " + formatMoney(res.back) + ")" : " (even)");
    message = "Auto POWER PRESS " + lw.number + " → " + formatMoney(stake) + extra;
  } else {
    message = "Auto PRESS " + lw.number + " +" + formatMoney(res.added) + " → " + formatMoney(stake);
  }
  return {
    ok: true,
    state: res.state,
    added: res.added,
    back: res.back,
    give: res.give,
    atMax: !!res.atMax,
    message,
  };
}

export function clearStrategy(state) {
  const next = structuredClone(state);
  next.strategy = null;
  return next;
}

export function lessonText(id) {
  const card = strategyById(id);
  return card ? card.how : "";
}

export { formatMoney };
