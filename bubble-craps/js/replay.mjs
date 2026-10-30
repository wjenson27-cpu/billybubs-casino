/**
 * Strategy Comparison. Every strategy sees the same recorded dice
 * through the live engine. No demo math.
 */

import * as E from "./engine.mjs";
import * as TR from "./table-rules.mjs";
import { diceFromSeed, SEEDED_RNG_NAME } from "./rng.mjs";
import { autoBet, afterRoll, strategyById, STRATEGY_VERSION, isPremium } from "./table-strategies.mjs";

export { SEEDED_RNG_NAME };

const BANNED = ["best strategy", "beat the house", "guaranteed", "hot dice", "you're due"];

export function rollSequenceFromSeed(seed, count, rules) {
  return {
    source: "simulate",
    seed: String(seed),
    rng: SEEDED_RNG_NAME,
    rules: TR.defaultRules(rules),
    dice: diceFromSeed(seed, count),
    version: STRATEGY_VERSION,
  };
}

export function parseCsv(text) {
  const lines = String(text || "").trim().split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { ok: false, error: "Empty file." };
  if (lines.length > 20001) return { ok: false, error: "More than 20,000 rows." };
  const header = lines[0].toLowerCase();
  if (/crapless/.test(header) && /mode/.test(header)) return { ok: false, error: "Crapless rolls can't be replayed on Table Craps." };
  const start = /die/.test(header) ? 1 : 0;
  const dice = [];
  let skipped = 0;
  let bubble = false;
  for (let i = start; i < lines.length; i++) {
    const cols = lines[i].split(",").map((s) => s.trim());
    if (cols.some((c) => /crapless/i.test(c))) return { ok: false, error: "Crapless rolls can't be replayed on Table Craps." };
    if (cols.some((c) => /bubble/i.test(c))) bubble = true;
    const nums = cols.map((c) => Number(c)).filter((n) => n >= 1 && n <= 6);
    if (nums.length >= 2) dice.push([nums[0], nums[1]]);
    else skipped += 1;
  }
  return {
    ok: true,
    dice,
    skipped,
    banner: bubble ? "These rolls came from Bubble Craps (Regular). Table rules still apply on the replay." : "",
  };
}

function fresh(rules, bankroll) {
  return E.createGame({ profile: "table", bankroll: bankroll || E.STARTING_BANKROLL, rules: rules || undefined });
}

function openValue(state) {
  const open = [];
  Object.keys(state.bets.comeBets || {}).forEach((key) => {
    const slot = state.bets.comeBets[key];
    if (!slot || !slot.amount) return;
    const n = Number(key);
    const fair = Math.round((E.passOddsProfit(slot.amount, n) > 0 ? (n === 4 || n === 10 ? slot.amount / 3 : n === 5 || n === 9 ? slot.amount * 2 / 5 : slot.amount * 5 / 11) : 0));
    const ways = { 4: 3, 5: 4, 6: 5, 8: 5, 9: 4, 10: 3 }[n] || 0;
    const p = ways / (ways + 6);
    open.push({ bet: "Come " + n, stake: slot.amount, fair: Math.round(slot.amount * (2 * p)) });
  });
  Object.keys(state.bets.dontComeBets || {}).forEach((key) => {
    const slot = state.bets.dontComeBets[key];
    if (!slot || !slot.amount) return;
    const n = Number(key);
    const ways = { 4: 3, 5: 4, 6: 5, 8: 5, 9: 4, 10: 3 }[n] || 0;
    const p = 6 / (ways + 6);
    open.push({ bet: "Don't Come " + n, stake: slot.amount, fair: Math.round(slot.amount * 2 * p) });
  });
  return open;
}

export function replay(dice, id, params) {
  const rules = (params && params.rules) || TR.defaultRules();
  const bankroll = (params && params.bankroll) || E.STARTING_BANKROLL;
  let state = fresh(rules, bankroll);
  const lean = !!(params && params.lean);
  if (lean) state.__lean = true;
  const atLimit = (params && params.atLimit) || "stop";
  const stopLoss = params && params.stopLoss != null ? params.stopLoss : 0.4;
  const winGoal = params && params.winGoal != null ? params.winGoal : 0.3;
  const line = lean ? null : [bankroll];
  const ledger = lean ? null : [];
  let expected = 0;
  let peak = bankroll;
  let maxDd = 0;
  let mostAtRisk = 0;
  let sevens = 0;
  let hands = 0;
  let inAction = 0;
  let action = 0;
  let limitRoll = 0;
  let stopKind = "";
  let busted = 0;
  const signal = params && params.signal;
  for (let i = 0; i < dice.length; i++) {
    if (signal && signal.aborted) break;
    const held = atLimit === "stop" && limitRoll;
    if (!busted && !held) {
      const bet = autoBet(state, id, params);
      state = bet.state;
    }
    const risk = E.tableTotal(state);
    mostAtRisk = Math.max(mostAtRisk, risk);
    if (risk) { inAction += 1; action += risk; }
    const [d1, d2] = dice[i];
    const settled = E.settle(state, d1, d2, lean ? { inplace: true, fast: true } : undefined);
    if (!busted && !(atLimit === "stop" && limitRoll)) state = afterRoll(settled.state, id, settled, params);
    else state = settled.state;
    (settled.decisions || []).forEach((d) => {
      if (d.expectedLoss) expected += d.expectedLoss;
    });
    const worth = E.netWorth(state);
    if (settled.result === "seven-out") { sevens += 1; hands += 1; }
    peak = Math.max(peak, worth);
    maxDd = Math.max(maxDd, peak - worth);
    if (!busted && state.bankroll < (rules.tableMin || 1000) && E.tableTotal(state) === 0) {
      busted = i + 1;
    }
    const net = worth - bankroll;
    if (!limitRoll && net <= -bankroll * stopLoss) { limitRoll = i + 1; stopKind = "loss"; }
    else if (!limitRoll && net >= bankroll * winGoal) { limitRoll = i + 1; stopKind = "goal"; }
    if (line) line.push(worth);
    if (ledger) ledger.push({
      roll: i + 1,
      d1, d2,
      total: d1 + d2,
      result: settled.result,
      net: settled.net,
      worth,
      expected: Math.round(expected),
    });
  }
  const end = line ? line[line.length - 1] : E.netWorth(state);
  const open = lean ? [] : openValue(state);
  return {
    id,
    name: (strategyById(id) || {}).name || id,
    version: STRATEGY_VERSION,
    premium: isPremium(id),
    line,
    ledger,
    net: end - bankroll,
    peak,
    maxDrawdown: maxDd,
    maxDrawdownPct: peak ? maxDd / peak : 0,
    mostAtRisk,
    hands,
    sevenOuts: sevens,
    rollsInAction: inAction,
    expectedLoss: Math.round(expected),
    luck: (end - bankroll) - Math.round(expected),
    action,
    limitRoll,
    stopKind,
    busted,
    open,
    end,
  };
}

export function compare(dice, ids, params) {
  const picked = (ids || []).slice(0, 6);
  if ((ids || []).length > 6) return { ok: false, error: "Pick up to 6 strategies." };
  const runs = picked.map((id) => replay(dice, id, params));
  const ranked = runs.slice().sort((a, b) => b.net - a.net);
  return {
    ok: true,
    runs,
    ranked,
    topLabel: "Top on this replay",
    note: "Past rolls don't predict future rolls. This is one sequence, not a forecast.",
  };
}

function quantile(arr, p) {
  if (!arr.length) return 0;
  const i = (arr.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return arr[lo];
  return arr[lo] + (arr[hi] - arr[lo]) * (i - lo);
}

export function summarizeNets(nets, extras) {
  const summary = {};
  Object.keys(nets).forEach((id) => {
    const arr = nets[id].slice().sort((a, b) => a - b);
    const extra = (extras && extras[id]) || { expected: 0, stops: 0, goals: 0, ahead: 0 };
    const n = arr.length || 1;
    summary[id] = {
      min: arr[0] || 0,
      q1: quantile(arr, 0.25),
      median: quantile(arr, 0.5),
      q3: quantile(arr, 0.75),
      max: arr.length ? arr[arr.length - 1] : 0,
      p10: quantile(arr, 0.1),
      p90: quantile(arr, 0.9),
      n: arr.length,
      aheadPct: extra.ahead / n,
      expectedLoss: Math.round(extra.expected / n),
      stopPct: extra.stops / n,
      goalPct: extra.goals / n,
    };
  });
  return summary;
}

export function manySeeds(strategyIds, params) {
  const k = Math.min(1000, Math.max(1, (params && params.seeds) || 100));
  const rolls = (params && params.rolls) || 200;
  const base = Number(params && params.seed) || 1;
  const ids = (strategyIds || []).slice(0, 6);
  const signal = params && params.signal;
  const onProgress = params && params.onProgress;
  const runParams = Object.assign({ atLimit: "stop", lean: true }, params || {});
  const nets = {};
  const extras = {};
  ids.forEach((id) => {
    nets[id] = [];
    extras[id] = { expected: 0, stops: 0, goals: 0, ahead: 0 };
  });
  for (let s = 0; s < k; s++) {
    if (signal && signal.aborted) return { ok: false, cancelled: true, done: s, k, summary: summarizeNets(nets, extras) };
    const dice = diceFromSeed(base + s, rolls);
    ids.forEach((id) => {
      if (signal && signal.aborted) return;
      const run = replay(dice, id, runParams);
      nets[id].push(run.net);
      extras[id].expected += run.expectedLoss || 0;
      if (run.stopKind === "loss") extras[id].stops += 1;
      if (run.stopKind === "goal") extras[id].goals += 1;
      if (run.net > 0) extras[id].ahead += 1;
    });
    if (onProgress) onProgress(s + 1, k);
  }
  return { ok: true, k, summary: summarizeNets(nets, extras), cancelled: false };
}

export function comparisonClean(text) {
  const low = String(text || "").toLowerCase();
  return BANNED.every((w) => low.indexOf(w) < 0);
}

export function fairCome(amount, number) {
  const ways = { 4: 3, 5: 4, 6: 5, 8: 5, 9: 4, 10: 3 }[number] || 0;
  return Math.round(amount * (ways / (ways + 6)) * 2);
}

export function fairDontCome(amount, number) {
  const ways = { 4: 3, 5: 4, 6: 5, 8: 5, 9: 4, 10: 3 }[number] || 0;
  const p = 6 / (ways + 6);
  return Math.round(amount * 2 * p);
}
