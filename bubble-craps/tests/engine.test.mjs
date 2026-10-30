import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../js/engine.mjs";
import { chiSquareP, totalsTest, facesTest } from "../js/fair.mjs";
import { autoBet, applyAutoPress, STRATEGIES } from "../js/strategies.mjs";
import { resolveSwipe } from "../js/swipe.mjs";

const $ = (n) => Math.round(n * 100);

function game(mode = "regular", bankroll = E.STARTING_BANKROLL) {
  return E.createGame({ mode, bankroll });
}

function dice(total, hard = false) {
  if (hard) {
    if (total % 2) throw new Error("odd hard");
    return [total / 2, total / 2];
  }
  const easy = {
    2: [1, 1],
    3: [1, 2],
    4: [1, 3],
    5: [1, 4],
    6: [1, 5],
    7: [1, 6],
    8: [2, 6],
    9: [3, 6],
    10: [4, 6],
    11: [5, 6],
    12: [6, 6],
  };
  return easy[total];
}

function roll(state, total, hard = false) {
  const [a, b] = dice(total, hard);
  return E.settle(state, a, b);
}

function point(state, n) {
  const res = roll(state, n, n === 2 || n === 12);
  assert.equal(res.result, "point-set");
  assert.equal(res.state.point, n);
  return res.state;
}

test("chip set is $1 $5 $25 $100 $500 and has no $10", () => {
  assert.deepEqual(E.chipDollars(), [1, 5, 25, 100, 500]);
  assert.ok(!E.CHIPS.includes(1000));
  assert.ok(!E.CHIPS.includes($(10)));
});

test("starting bankroll is $1,000 and never goes negative", () => {
  const g = game();
  assert.equal(g.bankroll, $(1000));
  const bad = E.placeBet(g, { kind: "pass" }, $(1001));
  assert.equal(bad.ok, false);
  assert.equal(bad.state.bankroll, $(1000));
});

test("table minimum refuses a $1 pass and accepts $5", () => {
  const g = game();
  assert.equal(E.placeBet(g, { kind: "pass" }, $(1)).ok, false);
  const ok = E.placeBet(g, { kind: "pass" }, $(5));
  assert.equal(ok.ok, true);
  assert.equal(ok.state.bets.pass, $(5));
  assert.equal(ok.state.bankroll, $(995));
});

test("table max is $1,000", () => {
  const g = game("regular", $(2000));
  assert.equal(E.TABLE_MAX, $(1000));
  assert.equal(E.placeBet(g, { kind: "pass" }, $(1000)).ok, true);
  assert.match(E.placeBet(g, { kind: "pass" }, $(1001)).error, /Maximum/);
});

test("Regular come-out: 7 and 11 win, 2 3 12 lose, others set the point", () => {
  for (const n of [7, 11]) {
    let g = E.placeBet(game(), { kind: "pass" }, $(10)).state;
    const before = E.netWorth(g);
    const res = roll(g, n);
    assert.equal(res.result, "natural");
    assert.equal(res.state.phase, "come-out");
    assert.equal(res.state.bets.pass, $(10));
    assert.equal(E.netWorth(res.state) - before, $(10));
  }
  for (const n of [2, 3, 12]) {
    let g = E.placeBet(game(), { kind: "pass" }, $(10)).state;
    const before = E.netWorth(g);
    const res = roll(g, n);
    assert.equal(res.result, "craps");
    assert.equal(res.state.bets.pass, 0);
    assert.equal(E.netWorth(res.state) - before, -$(10));
  }
  for (const n of [4, 5, 6, 8, 9, 10]) {
    const res = roll(E.placeBet(game(), { kind: "pass" }, $(5)).state, n);
    assert.equal(res.result, "point-set");
    assert.equal(res.state.point, n);
    assert.equal(res.state.bets.pass, $(5));
  }
});

test("Don't Pass bars 12, wins 2 and 3, loses 7 and 11", () => {
  let g = E.placeBet(game(), { kind: "dontPass" }, $(10)).state;
  let res = roll(g, 12);
  assert.equal(res.decisions.find((d) => d.bet === "Don't Pass").result, "push");
  assert.equal(res.state.bets.dontPass, $(10));
  assert.equal(E.netWorth(res.state), $(1000));

  g = E.placeBet(game(), { kind: "dontPass" }, $(10)).state;
  res = roll(g, 2);
  assert.equal(E.netWorth(res.state), $(1010));
  assert.equal(res.state.bets.dontPass, $(10));

  g = E.placeBet(game(), { kind: "dontPass" }, $(10)).state;
  res = roll(g, 3);
  assert.equal(E.netWorth(res.state), $(1010));

  for (const n of [7, 11]) {
    g = E.placeBet(game(), { kind: "dontPass" }, $(10)).state;
    res = roll(g, n);
    assert.equal(res.state.bets.dontPass, 0);
    assert.equal(E.netWorth(res.state), $(990));
  }
});

test("Don't Pass takedown is allowed once a point is on, with a confirm warning", () => {
  let g = point(E.placeBet(game(), { kind: "dontPass" }, $(10)).state, 4);
  const warn = E.removeBet(g, { kind: "dontPass" });
  assert.equal(warn.needsConfirm, true);
  assert.match(warn.warning, /33\.3%/);
  const ok = E.removeBet(g, { kind: "dontPass" }, null, { confirm: true });
  assert.equal(ok.ok, true);
  assert.equal(ok.state.bets.dontPass, 0);
  assert.equal(ok.state.bankroll, $(1000));
});

test("Pass Line cannot be taken down after the point", () => {
  const g = point(E.placeBet(game(), { kind: "pass" }, $(10)).state, 6);
  const res = E.removeBet(g, { kind: "pass" });
  assert.equal(res.ok, false);
});

test("odds multiples and true-odds payouts at the max, Regular", () => {
  const cases = [
    { point: 4, mult: 3, flat: 10, odds: 30, profit: 10 + 60 },
    { point: 10, mult: 3, flat: 10, odds: 30, profit: 70 },
    { point: 5, mult: 4, flat: 10, odds: 40, profit: 10 + 60 },
    { point: 9, mult: 4, flat: 10, odds: 40, profit: 70 },
    { point: 6, mult: 5, flat: 10, odds: 50, profit: 10 + 60 },
    { point: 8, mult: 5, flat: 10, odds: 50, profit: 70 },
  ];
  for (const c of cases) {
    let g = point(E.placeBet(game(), { kind: "pass" }, $(c.flat)).state, c.point);
    assert.equal(E.maxPassOdds(g.bets.pass, c.point), $(c.odds));
    const over = E.placeBet(g, { kind: "passOdds" }, $(c.odds + 5));
    assert.equal(over.ok, false);
    g = E.placeBet(g, { kind: "passOdds" }, $(c.odds)).state;
    const before = E.netWorth(g);
    const res = roll(g, c.point);
    assert.equal(res.result, "point-made");
    assert.equal(E.netWorth(res.state) - before, $(c.profit));
    assert.equal(res.state.bets.passOdds, 0);
    assert.equal(res.state.bets.pass, $(c.flat));
    assert.equal(res.state.phase, "come-out");
  }
});

test("lay odds up to 6x win 3x 4x 5x", () => {
  const cases = [
    { point: 4, win: 30 },
    { point: 10, win: 30 },
    { point: 5, win: 40 },
    { point: 9, win: 40 },
    { point: 6, win: 50 },
    { point: 8, win: 50 },
  ];
  for (const c of cases) {
    let g = point(E.placeBet(game(), { kind: "dontPass" }, $(10)).state, c.point);
    assert.equal(E.maxLayOdds($(10)), $(60));
    assert.equal(E.placeBet(g, { kind: "dontPassOdds" }, $(65)).ok, false);
    g = E.placeBet(g, { kind: "dontPassOdds" }, $(60)).state;
    const before = E.netWorth(g);
    const res = roll(g, 7);
    assert.equal(res.result, "seven-out");
    assert.equal(E.netWorth(res.state) - before, $(10 + c.win));
    assert.equal(res.state.bets.dontPass, $(10));
    assert.equal(res.state.bets.dontPassOdds, 0);
  }
});

test("seven-out loses the Pass Line and odds", () => {
  let g = point(E.placeBet(game(), { kind: "pass" }, $(10)).state, 6);
  g = E.placeBet(g, { kind: "passOdds" }, $(50)).state;
  const before = E.netWorth(g);
  const res = roll(g, 7);
  assert.equal(res.result, "seven-out");
  assert.equal(res.state.bets.pass, 0);
  assert.equal(res.state.point, null);
  assert.equal(E.netWorth(res.state) - before, -$(60));
});

test("Crapless: only a come-out 7 wins; 2 3 11 12 become points", () => {
  let g = E.placeBet(game("crapless"), { kind: "pass" }, $(10)).state;
  let res = roll(g, 7);
  assert.equal(res.result, "natural");
  assert.equal(E.netWorth(res.state), $(1010));

  for (const n of [2, 3, 11, 12, 4, 5, 6, 8, 9, 10]) {
    g = E.placeBet(game("crapless"), { kind: "pass" }, $(5)).state;
    res = roll(g, n, n === 2 || n === 12);
    assert.equal(res.result, "point-set", "point " + n);
    assert.equal(res.state.point, n);
    assert.equal(res.state.bets.pass, $(5));
  }
  g = E.placeBet(game("crapless"), { kind: "dontPass" }, $(5));
  assert.equal(g.ok, false);
  assert.match(g.error, /Crapless/);
});

test("Crapless odds max and true odds on 2 3 11 12 4 5 6", () => {
  const cases = [
    { point: 2, hard: true, odds: 30, profit: 10 + 180 },
    { point: 12, hard: true, odds: 30, profit: 190 },
    { point: 3, hard: false, odds: 30, profit: 10 + 90 },
    { point: 11, hard: false, odds: 30, profit: 100 },
    { point: 4, hard: false, odds: 30, profit: 70 },
    { point: 5, hard: false, odds: 40, profit: 70 },
    { point: 6, hard: false, odds: 50, profit: 70 },
  ];
  for (const c of cases) {
    let g = E.placeBet(game("crapless"), { kind: "pass" }, $(10)).state;
    g = roll(g, c.point, c.hard).state;
    assert.equal(E.maxPassOdds($(10), c.point), $(c.odds));
    g = E.placeBet(g, { kind: "passOdds" }, $(c.odds)).state;
    const before = E.netWorth(g);
    const res = roll(g, c.point, c.hard);
    assert.equal(res.result, "point-made");
    assert.equal(E.netWorth(res.state) - before, $(c.profit));
  }
});

test("come and don't come travel, win, and lose", () => {
  let g = point(E.placeBet(game(), { kind: "pass" }, $(5)).state, 6);
  g = E.placeBet(g, { kind: "come" }, $(10)).state;
  let res = roll(g, 9);
  assert.equal(res.decisions.find((d) => d.bet === "Come").result, "move");
  assert.equal(res.state.bets.comeBets[9].amount, $(10));

  g = E.placeBet(res.state, { kind: "comeOdds", number: 9 }, $(40)).state;
  const before = E.netWorth(g);
  res = roll(g, 9);
  const come = res.decisions.find((d) => d.bet === "Come 9");
  assert.equal(come.result, "win");
  assert.equal(E.netWorth(res.state) - before, $(10 + 60));

  g = point(game(), 8);
  g = E.placeBet(g, { kind: "dontCome" }, $(10)).state;
  res = roll(g, 5);
  assert.equal(res.state.bets.dontComeBets[5].amount, $(10));
  g = E.placeBet(res.state, { kind: "dontComeOdds", number: 5 }, $(60)).state;
  const worth = E.netWorth(g);
  res = roll(g, 7);
  assert.equal(res.decisions.find((d) => d.bet === "Don't Come 5").result, "win");
  assert.equal(E.netWorth(res.state) - worth, $(10 + 40));

  g = point(game(), 4);
  g = E.placeBet(g, { kind: "come" }, $(10)).state;
  res = roll(g, 4);
  assert.equal(res.state.bets.comeBets[4].amount, $(10));
  res = roll(res.state, 7);
  assert.equal(res.decisions.find((d) => d.bet === "Come 4").result, "lose");
});

test("Crapless come moves to 2, 3, 11, and 12 and wins on 7 only", () => {
  for (const n of [2, 3, 11, 12]) {
    let g = point(E.placeBet(game("crapless"), { kind: "pass" }, $(5)).state, 6);
    g = E.placeBet(g, { kind: "come" }, $(5)).state;
    const res = roll(g, n, n === 2 || n === 12);
    assert.equal(res.decisions.find((d) => d.bet === "Come").result, "move");
    assert.equal(res.state.bets.comeBets[n].amount, $(5));
  }
  let g = point(game("crapless"), 8);
  g = E.placeBet(g, { kind: "come" }, $(5)).state;
  const res = roll(g, 7);
  assert.equal(res.decisions.find((d) => d.bet === "Come").result, "win");
  assert.equal(E.placeBet(game("crapless"), { kind: "dontCome" }, $(5)).ok, false);
});

test("come odds are off on the come-out by default", () => {
  let g = point(game(), 6);
  g = E.placeBet(g, { kind: "come" }, $(10)).state;
  g = roll(g, 8).state;
  g = E.placeBet(g, { kind: "comeOdds", number: 8 }, $(50)).state;
  g = roll(g, 6).state;
  assert.equal(g.phase, "come-out");
  const before = E.netWorth(g);
  const res = roll(g, 8);
  const win = res.decisions.find((d) => d.bet === "Come 8");
  assert.equal(win.result, "win");
  assert.equal(E.netWorth(res.state) - before, $(10));
});

test("place payouts for every number and buy vig on wins only", () => {
  const placePays = {
    4: (c) => Math.floor((c * 9) / 5),
    5: (c) => Math.floor((c * 7) / 5),
    6: (c) => Math.floor((c * 7) / 6),
    8: (c) => Math.floor((c * 7) / 6),
    9: (c) => Math.floor((c * 7) / 5),
    10: (c) => Math.floor((c * 9) / 5),
    2: (c) => Math.floor((c * 11) / 2),
    12: (c) => Math.floor((c * 11) / 2),
    3: (c) => Math.floor((c * 11) / 4),
    11: (c) => Math.floor((c * 11) / 4),
  };
  for (const n of [4, 5, 6, 8, 9, 10]) {
    let g = point(game(), n === 6 ? 8 : 6);
    const stake = n === 6 || n === 8 ? $(6) : $(5);
    g = E.placeBet(g, { kind: "place", number: n }, stake).state;
    const before = E.netWorth(g);
    const res = roll(g, n, false);
    assert.equal(E.netWorth(res.state) - before, placePays[n](stake));
    assert.equal(res.state.bets.place[n], stake);
  }
  for (const n of E.NUMBERS) {
    const mode = [2, 3, 11, 12].includes(n) ? "crapless" : "regular";
    let g = point(game(mode), n === 6 ? 8 : 6);
    if (mode === "crapless" && (n === 2 || n === 12)) {
      /* point helper uses hard for 2/12 only when rolling that total */
    }
    const stake = $(20);
    g = E.placeBet(g, { kind: "buy", number: n }, stake).state;
    const lost = roll(g, 4 === n ? 5 : 4);
    assert.equal(lost.decisions.some((d) => d.bet === "Buy " + n && d.vig), false);
    assert.equal(lost.state.bets.buy[n], stake);
    const before = E.netWorth(lost.state);
    const hard = n === 2 || n === 12;
    const res = roll(lost.state, n, hard && n !== 6 && n !== 8 && n !== 4 && n !== 10 ? true : n === 2 || n === 12);
    const win = res.decisions.find((d) => d.bet === "Buy " + n);
    assert.ok(win, "buy win " + n);
    assert.equal(win.vig, E.buyVig(stake));
    assert.equal(win.profit, E.buyProfit(stake, n));
    assert.equal(E.netWorth(res.state) - before, E.buyProfit(stake, n));
    assert.equal(res.state.bets.buy[n], stake);
    if (n === 4) {
      assert.equal(E.buyVig($(20)), $(1));
      assert.equal(win.profit, $(39));
    }
    if (n === 2) assert.equal(win.profit, $(119));
  }
});

test("$5 buy examples match the spec", () => {
  assert.equal(E.buyProfit($(5), 4), $(9.75));
  assert.equal(E.buyProfit($(5), 5), $(7.25));
  assert.equal(E.buyProfit($(5), 6), $(5.75));
  assert.equal(E.placeProfit($(6), 6), $(7));
  assert.equal(E.buyProfit($(5), 2), $(29.75));
  assert.equal(E.buyProfit($(5), 3), $(14.75));
  assert.equal(E.placeProfit($(5), 2), $(27.5));
  assert.equal(E.placeProfit($(5), 3), $(13.75));
});

test("place and buy are off on the come-out unless working", () => {
  let g = point(game(), 6);
  g = E.placeBet(g, { kind: "place", number: 8 }, $(6)).state;
  g = roll(g, 6).state;
  assert.equal(g.phase, "come-out");
  const before = E.netWorth(g);
  let res = roll(g, 8);
  assert.equal(res.state.bets.place[8], $(6));
  assert.equal(E.netWorth(res.state), before);
  assert.equal(res.state.pressBlock, "bets off");
  g = res.state;
  g.placeWorkingOnComeOut = true;
  res = roll(g, 8);
  assert.equal(E.netWorth(res.state) - before, $(7));
});

test("bets off parks place and buy", () => {
  let g = point(game(), 5);
  g = E.placeBet(g, { kind: "place", number: 6 }, $(6)).state;
  g = E.setBetsOff(g, true);
  const before = E.netWorth(g);
  const res = roll(g, 6);
  assert.equal(E.netWorth(res.state), before);
  assert.equal(res.state.bets.place[6], $(6));
  const seven = roll(res.state, 7);
  assert.equal(seven.state.bets.place[6], $(6));
});

test("Field pays 2:1 on 2 and 12 and 1:1 on 3 4 9 10 11", () => {
  for (const n of [2, 12]) {
    const g = E.placeBet(point(game(), 6), { kind: "field" }, $(5)).state;
    const before = E.netWorth(g);
    const res = roll(g, n, true);
    assert.equal(E.netWorth(res.state) - before, $(10));
    assert.equal(res.state.bets.field, $(5));
  }
  for (const n of [3, 4, 9, 10, 11]) {
    const g = E.placeBet(point(game(), 6), { kind: "field" }, $(5)).state;
    const before = E.netWorth(g);
    const res = roll(g, n);
    assert.equal(E.netWorth(res.state) - before, $(5));
  }
  const g = E.placeBet(point(game(), 6), { kind: "field" }, $(5)).state;
  const res = roll(g, 7);
  assert.equal(res.state.bets.field, 0);
  assert.equal(E.netWorth(res.state), $(995));
});

test("hardways, any 7, any craps, horn, and C&E", () => {
  let g = E.placeBet(game(), { kind: "hardway", number: 4 }, $(5)).state;
  let res = roll(g, 4, true);
  assert.equal(res.decisions.find((d) => d.bet === "Hard 4").profit, $(35));
  assert.equal(res.state.bets.hardways[4], $(5));
  res = roll(res.state, 4, false);
  assert.equal(res.state.bets.hardways[4], 0);

  g = E.placeBet(game(), { kind: "hardway", number: 8 }, $(5)).state;
  res = roll(g, 8, true);
  assert.equal(res.decisions.find((d) => d.bet === "Hard 8").profit, $(45));

  g = E.placeBet(game(), { kind: "any7" }, $(5)).state;
  res = roll(g, 7);
  assert.equal(res.decisions.find((d) => d.bet === "Big Red").profit, $(20));
  assert.equal(res.state.bets.any7, $(5));

  g = E.placeBet(game(), { kind: "anyCraps" }, $(5)).state;
  res = roll(g, 3);
  assert.equal(res.decisions.find((d) => d.bet === "Any Craps").profit, $(35));
  res = roll(E.placeBet(game(), { kind: "anyCraps" }, $(5)).state, 7);
  assert.equal(res.state.bets.anyCraps, 0);

  g = E.placeBet(game(), { kind: "horn" }, $(4)).state;
  res = roll(g, 12, true);
  assert.equal(res.decisions.find((d) => d.bet === "Horn").profit, $(27));
  res = roll(E.placeBet(game(), { kind: "horn" }, $(4)).state, 11);
  assert.equal(res.decisions.find((d) => d.bet === "Horn").profit, $(12));
  assert.equal(E.placeBet(game(), { kind: "horn" }, $(2)).ok, false);

  assert.equal(E.placeBet(game(), { kind: "ce" }, $(5)).ok, false);
  assert.equal(E.placeBet(game(), { kind: "ce" }, $(1)).ok, false);
  g = E.placeBet(game(), { kind: "ce" }, $(10)).state;
  res = roll(g, 11);
  assert.equal(res.decisions.find((d) => d.bet === "C&E").profit, $(70));
  assert.equal(res.state.bets.ce, $(10));
  res = roll(E.placeBet(game(), { kind: "ce" }, $(10)).state, 2, true);
  assert.equal(res.decisions.find((d) => d.bet === "C&E").profit, $(30));
  res = roll(E.placeBet(game(), { kind: "ce" }, $(10)).state, 3);
  assert.equal(res.decisions.find((d) => d.bet === "C&E").profit, $(30));
  res = roll(E.placeBet(game(), { kind: "ce" }, $(10)).state, 12, true);
  assert.equal(res.decisions.find((d) => d.bet === "C&E").profit, $(30));
  res = roll(E.placeBet(game(), { kind: "ce" }, $(4)).state, 7);
  assert.equal(res.state.bets.ce, 0);
});

test("hardways work on the come-out and can be switched off", () => {
  let g = E.placeBet(game(), { kind: "hardway", number: 6 }, $(5)).state;
  let res = roll(g, 7);
  assert.equal(res.state.bets.hardways[6], 0);
  g = E.placeBet(game(), { kind: "hardway", number: 6 }, $(5)).state;
  g.hardwaysWorkingOnComeOut = false;
  res = roll(g, 7);
  assert.equal(res.state.bets.hardways[6], $(5));
});

test("Hard Way All Day pays 165 for 1 and stays up", () => {
  let g = E.placeBet(game(), { kind: "hardAllDay" }, $(1)).state;
  for (const n of [4, 6]) g = roll(g, n, true).state;
  g = roll(g, 8, false).state;
  assert.equal(g.bets.hardAllDay, $(1));
  assert.equal(g.progress.hardAllDay[8], undefined);
  g = roll(g, 8, true).state;
  assert.equal(g.progress.hardAllDay[8], true);
  const before = E.netWorth(g);
  const res = roll(g, 10, true);
  const win = res.decisions.find((d) => d.bet === "Hard Way All Day");
  assert.equal(win.profit, $(164));
  assert.equal(win.rearmed, true);
  assert.equal(res.state.bets.hardAllDay, $(1));
  assert.deepEqual(res.state.progress.hardAllDay, {});
  assert.equal(E.netWorth(res.state) - before, $(164));
  const lost = roll(E.placeBet(game(), { kind: "hardAllDay" }, $(1)).state, 7);
  assert.equal(lost.state.bets.hardAllDay, 0);
});

test("ATS pays 31/31/156 for 1, stays up, and is offered in Crapless", () => {
  let g = E.placeBet(game(), { kind: "small" }, $(1)).state;
  for (const n of [2, 3, 4, 5]) g = roll(g, n, n === 2).state;
  const res = roll(g, 6);
  assert.equal(res.decisions.find((d) => d.bet === "Low Rolls").profit, $(30));
  assert.equal(res.state.bets.small, $(1));
  assert.deepEqual(res.state.progress.small, {});

  g = E.placeBet(game(), { kind: "tall" }, $(1)).state;
  for (const n of [8, 9, 10, 11]) g = roll(g, n).state;
  const tall = roll(g, 12, true);
  assert.equal(tall.decisions.find((d) => d.bet === "High Rolls").profit, $(30));

  g = E.placeBet(game(), { kind: "all" }, $(1)).state;
  for (const n of [2, 3, 4, 5, 6, 8, 9, 10, 11]) g = roll(g, n, n === 2).state;
  const all = roll(g, 12, true);
  assert.equal(all.decisions.find((d) => d.bet === "Roll 'Em All").profit, $(155));
  assert.equal(all.state.bets.all, $(1));

  const seven = roll(E.placeBet(game(), { kind: "small" }, $(1)).state, 7);
  assert.equal(seven.state.bets.small, 0);

  let crap = E.placeBet(game("crapless"), { kind: "small" }, $(1)).state;
  crap = E.placeBet(crap, { kind: "pass" }, $(5)).state;
  const comeOut = roll(crap, 7);
  assert.equal(comeOut.result, "natural");
  assert.equal(comeOut.decisions.find((d) => d.bet === "Pass Line").result, "win");
  assert.equal(comeOut.decisions.find((d) => d.bet === "Low Rolls").result, "lose");
  assert.equal(comeOut.state.bets.small, 0);

  crap = E.placeBet(game("crapless"), { kind: "all" }, $(1)).state;
  for (const n of [2, 3, 4, 5, 6, 8, 9, 10, 11]) crap = roll(crap, n, n === 2).state;
  const paid = roll(crap, 12, true);
  assert.equal(paid.decisions.find((d) => d.bet === "Roll 'Em All").profit, $(155));
  assert.equal(paid.state.bets.all, $(1));
  assert.equal(E.placeBet(game("crapless"), { kind: "tall" }, $(1)).ok, true);
});

test("all 36 pairs share one face total for caption, hardway, hop, and horn", () => {
  for (let d1 = 1; d1 <= 6; d1++) {
    for (let d2 = 1; d2 <= 6; d2++) {
      const cap = E.rollCaption(d1, d2);
      assert.equal(cap.d1, d1);
      assert.equal(cap.d2, d2);
      assert.equal(cap.total, d1 + d2);
      assert.equal(cap.hard, d1 === d2);
      assert.equal(cap.line, cap.word);
      assert.doesNotMatch(cap.line, /\d\s*[·+\-–]\s*\d/);
      assert.match(cap.aria, new RegExp("^" + ["one", "two", "three", "four", "five", "six"][d1 - 1]));
      if (!cap.hard && (cap.total === 4 || cap.total === 6 || cap.total === 8 || cap.total === 10)) {
        assert.match(cap.aria, /, easy /);
        assert.doesNotMatch(cap.aria, /, (four|six|eight|ten), easy /);
      }
      assert.equal(E.rollPairKey(d1, d2), Math.min(d1, d2) + "-" + Math.max(d1, d2));
    }
  }
  let g = E.placeBet(point(game(), 9), { kind: "hardway", number: 8 }, $(5)).state;
  g = E.placeBet(g, { kind: "hop", pair: "4-4" }, $(1)).state;
  const hard = E.settle(g, 4, 4);
  assert.equal(hard.dice.total, 8);
  assert.equal(hard.dice.hard, true);
  assert.equal(hard.decisions.find((d) => d.bet === "Hard 8").result, "win");
  assert.equal(hard.decisions.find((d) => d.bet === "Hop 4-4").result, "win");
  const horn = E.settle(E.placeBet(game(), { kind: "horn" }, $(4)).state, 6, 6);
  assert.equal(horn.dice.total, 12);
  assert.equal(horn.decisions.find((d) => d.bet === "Horn").result, "win");
});

test("all 10 repeater pays, limits, and any 7 loses them", () => {
  const expectFor = { 2: 40, 3: 50, 4: 65, 5: 80, 6: 90, 8: 90, 9: 80, 10: 65, 11: 50, 12: 40 };
  for (const n of E.NUMBERS) {
    assert.equal(E.REPEATER_FOR[n], expectFor[n]);
    let g = E.placeBet(game("crapless"), { kind: "repeater", number: n }, $(1)).state;
    const need = E.REPEATER_NEEDS[n];
    for (let i = 0; i < need - 1; i++) {
      g = roll(g, n, n === 2 || n === 12).state;
      assert.equal(g.repeaterCount[n], i + 1);
      assert.equal(E.placeBet(g, { kind: "repeater", number: n }, $(1)).ok, false);
    }
    const before = E.netWorth(g);
    const res = roll(g, n, n === 2 || n === 12);
    const win = res.decisions.find((d) => d.bet === "Repeater " + n);
    assert.equal(win.profit, $(expectFor[n] - 1));
    assert.equal(res.state.bets.repeaters[n], $(1));
    assert.equal(res.state.repeaterCount[n], 0);
    assert.equal(E.netWorth(res.state) - before, $(expectFor[n] - 1));
  }
  assert.equal(E.placeBet(game(), { kind: "repeater", number: 6 }, $(1)).ok, true);
  assert.match(E.placeBet(game(), { kind: "repeater", number: 6 }, 50).error, /Minimum/);
  assert.match(E.placeBet(game(), { kind: "repeater", number: 6 }, $(26)).error, /Maximum/);
  let g = E.placeBet(game(), { kind: "repeater", number: 6 }, $(5)).state;
  g = roll(g, 6).state;
  const lost = roll(g, 7);
  assert.equal(lost.state.bets.repeaters[6], 0);
  assert.equal(lost.state.repeaterCount[6], 0);
  assert.match(lost.narrative, /Seven-out|Come-out 7/);
});

test("all 21 hops pay 30 to 1 hard and 15 to 1 easy and stay up", () => {
  assert.equal(E.ALL_HOPS.length, 21);
  assert.equal(E.HARD_HOPS.length, 6);
  assert.equal(E.EASY_HOPS.length, 15);
  for (const key of E.HARD_HOPS) {
    const face = Number(key[0]);
    let g = E.placeBet(game(), { kind: "hop", pair: key }, $(1)).state;
    const before = E.netWorth(g);
    const res = E.settle(g, face, face);
    assert.equal(res.decisions.find((d) => d.bet === "Hop " + key).profit, $(30));
    assert.equal(res.state.bets.hops[key], $(1));
    assert.equal(E.netWorth(res.state) - before, $(30));
    const miss = E.settle(res.state, face === 1 ? 2 : 1, face === 6 ? 5 : 6);
    assert.equal(miss.state.bets.hops[key], 0);
  }
  for (const key of E.EASY_HOPS) {
    const [a, b] = key.split("-").map(Number);
    let g = E.placeBet(game(), { kind: "hop", pair: key }, $(1)).state;
    const res = E.settle(g, b, a);
    assert.equal(res.decisions.find((d) => d.bet === "Hop " + key).profit, $(15));
    assert.equal(res.state.bets.hops[key], $(1));
  }
  assert.equal(E.placeBet(game(), { kind: "hop", pair: "1-1" }, $(101)).ok, false);
  const horn = E.placeBet(game(), { kind: "hop", number: 11 }, $(1)).state;
  assert.equal(horn.bets.hops["5-6"], $(1));
  const mirrored = E.settle(horn, 6, 5);
  assert.equal(mirrored.state.bets.hops["5-6"], $(1));
});

test("no Fire Bet", () => {
  const res = E.placeBet(game(), { kind: "fire" }, $(1));
  assert.equal(res.ok, false);
  assert.match(res.error, /Fire Bet/);
});

test("PRESS stacks the original, undo and clear put chips back", () => {
  let g = point(game(), 5);
  g = E.placeBet(g, { kind: "place", number: 8 }, $(6)).state;
  g = roll(g, 8).state;
  assert.equal(g.lastWin.kind, "place");
  assert.equal(g.lastWin.profit, $(7));
  const bank = g.bankroll;
  let res = E.press(g);
  assert.equal(res.ok, true);
  g = res.state;
  assert.equal(g.bets.place[8], $(12));
  assert.equal(g.originals.place[8], $(6));
  assert.equal(g.bankroll, bank - $(6));
  g = E.press(g).state;
  g = E.press(g).state;
  assert.equal(g.bets.place[8], $(24));
  assert.equal(g.originals.place[8], $(6));
  g = E.undoPress(g).state;
  assert.equal(g.bets.place[8], $(18));
  g = E.clearPress(g).state;
  assert.equal(g.bets.place[8], $(6));
  assert.equal(g.bankroll, bank);
  g = roll(g, 9).state;
  assert.equal(g.pressStack.length, 0);
  assert.equal(E.undoPress(g).ok, false);
});

test("POWER PRESS follows the 6/8 ladder and can be used once", () => {
  let g = point(game(), 5);
  g = E.placeBet(g, { kind: "place", number: 8 }, $(6)).state;
  g = roll(g, 8).state;
  const st = E.pressStatus(g);
  assert.equal(st.powerOk, true);
  assert.match(st.powerLabel, /POWER PRESS 8 → \$18 \(add \$5\)/);
  const res = E.powerPress(g);
  assert.equal(res.added, $(12));
  assert.equal(res.give, $(5));
  assert.equal(res.state.bets.place[8], $(18));
  assert.equal(res.state.bankroll, g.bankroll - $(12));
  assert.equal(E.powerPress(res.state).ok, false);
  assert.equal(E.powerPress(res.state).error, "used");
  const undone = E.undoPress(res.state).state;
  assert.equal(undone.bets.place[8], $(6));
  assert.equal(undone.lastWin.powerUsed, false);
  assert.equal(E.powerPress(undone).ok, true);
});

test("PRESS prefers Buy except on 6 and 8 and greys out on a seven", () => {
  let g = point(game(), 5);
  g = E.placeBet(g, { kind: "place", number: 9 }, $(5)).state;
  g = E.placeBet(g, { kind: "buy", number: 9 }, $(5)).state;
  g = roll(g, 9).state;
  assert.equal(g.lastWin.kind, "buy");
  g = point(game(), 5);
  g = E.placeBet(g, { kind: "place", number: 6 }, $(6)).state;
  g = E.placeBet(g, { kind: "buy", number: 6 }, $(5)).state;
  g = roll(g, 6).state;
  assert.equal(g.lastWin.kind, "place");
  g = roll(point(game(), 6), 7).state;
  assert.equal(E.press(g).error, "seven");
  g = roll(point(game(), 6), 11).state;
  assert.match(E.press(g).error, /isn't a number bet/);
});

test("a $1 Place 4 win joins the ladder at $5", () => {
  let g = point(game("regular", $(1000)), 6);
  g = E.placeBet(g, { kind: "place", number: 4 }, $(5)).state;
  g = E.removeBet(g, { kind: "place", number: 4 }, $(4)).state;
  g = roll(g, 4).state;
  const st = E.pressStatus(g);
  assert.equal(st.powerOk, true);
  const res = E.powerPress(g);
  assert.equal(res.state.bets.place[4], $(5));
  assert.equal(res.give, $(2.2));
});

test("Billy's Way places the right spots in both modes", () => {
  let g = point(game(), 6);
  let res = E.placeBillysWay(g, $(5));
  assert.equal(res.ok, true);
  for (const n of [4, 5, 9, 10]) assert.equal(res.state.bets.buy[n], $(5));
  for (const n of [2, 3, 11, 12]) assert.equal(res.state.bets.buy[n], 0);
  assert.equal(res.state.bets.place[6], $(6));
  assert.equal(res.state.bets.place[8], $(6));
  assert.equal(E.tableTotal(res.state), $(32));

  g = point(game("crapless"), 8);
  res = E.placeBillysWay(g, $(5));
  for (const n of [2, 3, 4, 5, 9, 10, 11, 12]) assert.equal(res.state.bets.buy[n], $(5));
  assert.equal(res.state.bets.place[6], $(6));
  assert.equal(res.state.bets.place[8], $(6));
  assert.equal(E.tableTotal(res.state), $(52));

  const dollar = E.placeBillysWay(point(game(), 6), $(1));
  assert.equal(dollar.state.bets.buy[4], $(1));
  assert.equal(dollar.state.bets.place[6], $(1.2));
});

test("Blazing meter tiers", () => {
  assert.equal(E.blazingTier(0, 0), "cold");
  assert.equal(E.blazingTier(3, 0), "cold");
  assert.equal(E.blazingTier(4, 0), "warm");
  assert.equal(E.blazingTier(11, 0), "warm");
  assert.equal(E.blazingTier(12, 0), "hot");
  assert.equal(E.blazingTier(23, 0), "hot");
  assert.equal(E.blazingTier(24, 0), "blazing");
  assert.equal(E.blazingTier(2, 4), "blazing");
  let g = game();
  g = roll(g, 4).state;
  g = roll(g, 5).state;
  g = roll(g, 6).state;
  assert.equal(E.blazingTier(E.blazingScore(g.hand), g.hand.points), "cold");
  g = roll(g, 8).state;
  assert.equal(E.blazingScore(g.hand), 4);
  assert.equal(E.blazingTier(E.blazingScore(g.hand), g.hand.points), "warm");
  const made = roll(g, 4).state;
  assert.equal(made.hand.points, 1);
  assert.equal(made.phase, "come-out");
  const seven = roll(made, 9).state;
  const out = roll(seven, 7).state;
  assert.equal(out.hand.rolls, 0);
  assert.equal(out.hand.points, 0);
  assert.equal(E.blazingTier(0, 0), "cold");
  const winner = roll(game(), 7).state;
  assert.ok(winner.hand.rolls > 0);
});

test("strategies B1–B12 place or explain", () => {
  assert.equal(STRATEGIES.length, 14);
  let g = game();
  let res = autoBet(g, "B1", $(5));
  assert.equal(res.state.bets.pass, $(5));
  g = point(res.state, 6);
  res = autoBet(g, "B1", $(5));
  assert.equal(res.state.bets.passOdds, $(25));

  g = game();
  res = autoBet(g, "B2", $(5));
  assert.equal(res.state.bets.dontPass, $(5));
  g = point(res.state, 4);
  res = autoBet(g, "B2", $(5));
  assert.equal(res.state.bets.dontPassOdds, $(30));
  assert.equal(autoBet(game("crapless"), "B2", $(5)).ok, false);

  g = point(autoBet(game(), "B3", $(5)).state, 8);
  res = autoBet(g, "B3", $(5));
  assert.ok(res.state.bets.passOdds > 0);
  assert.equal(res.state.bets.come, $(5));

  g = point(game(), 5);
  res = autoBet(g, "B4", $(5));
  assert.equal(res.state.bets.place[6], $(6));
  assert.equal(res.state.bets.place[8], $(6));

  g = point(game("regular", $(2000)), 9);
  res = autoBet(g, "B5", $(5));
  assert.equal(res.state.bets.place[6], $(18));
  g = roll(res.state, 6).state;
  res = autoBet(g, "B5", $(5));
  assert.equal(res.state.bets.place[6], $(6));
  assert.equal(res.state.bets.place[8], $(6));

  assert.equal(autoBet(game(), "B6", $(5)).ok, false);
  res = autoBet(game("crapless"), "B6", $(5));
  assert.equal(res.state.bets.pass, $(5));

  g = point(game("crapless"), 8);
  res = autoBet(g, "B7", $(5));
  assert.equal(res.state.bets.place[6], $(6));
  assert.equal(res.state.bets.buy[2], 0);

  res = autoBet(point(game("crapless"), 6), "B8", $(5));
  for (const n of [4, 5, 9, 10]) assert.equal(res.state.bets.buy[n], $(5));
  assert.equal(res.state.bets.buy[2], 0);

  res = autoBet(game("crapless"), "B9", $(5));
  assert.equal(res.ok, true);
  assert.equal(res.state.bets.pass, 0);
  assert.match(res.message, /0\.71%/);

  g = point(autoBet(game("crapless"), "B10", $(5)).state, 6);
  res = autoBet(g, "B10", $(5));
  assert.equal(res.state.bets.come, $(5));

  res = autoBet(game(), "B11", $(25));
  assert.equal(res.state.bets.pass, $(5));

  res = autoBet(point(game(), 9), "B12", $(5));
  assert.equal(res.state.bets.buy[4], $(5));
  assert.equal(res.state.bets.place[8], $(6));
  res = autoBet(point(game("crapless"), 9), "B12", $(5));
  assert.equal(res.state.bets.buy[12], $(5));
  assert.equal(res.state.bets.buy[2], $(5));
});

test("crypto RNG is uniform and uses rejection sampling", () => {
  const counts = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 12000; i++) counts[E.rollDie() - 1] += 1;
  counts.forEach((c) => assert.ok(c > 1700 && c < 2300, "face " + c));
  assert.equal(E.getRngSource(), "secure");

  const orig = globalThis.crypto.getRandomValues;
  let calls = 0;
  globalThis.crypto.getRandomValues = (buf) => {
    calls += 1;
    if (calls === 1) {
      buf[0] = 4294967295;
      return buf;
    }
    buf[0] = 5;
    return buf;
  };
  const face = E.rollDie();
  globalThis.crypto.getRandomValues = orig;
  assert.equal(face, 6);
  assert.ok(calls >= 2);

  const rolls = [];
  for (let i = 0; i < 360; i++) {
    const d = E.rollDice();
    rolls.push(d);
  }
  const totals = totalsTest(rolls);
  assert.equal(totals.df, 10);
  assert.ok(totals.p > 0 && totals.p <= 1);
  const faces = facesTest(rolls, 1);
  assert.equal(faces.df, 5);
  const p05 = chiSquareP(18.307, 10);
  assert.ok(Math.abs(p05 - 0.05) < 0.005, "p≈0.05 got " + p05);
});

test("reset returns bets and bankroll reset restores $1,000", () => {
  let g = E.placeBet(game(), { kind: "pass" }, $(25)).state;
  g = E.resetLayout(g);
  assert.equal(g.bets.pass, 0);
  assert.equal(g.bankroll, $(1000));
  g = E.placeBet(g, { kind: "pass" }, $(100)).state;
  g = roll(g, 7).state;
  g = E.resetBankroll(g);
  assert.equal(g.bankroll, $(1000));
  assert.equal(g.stats.rolls, 0);
});

test("Hard Way All Day and ATS reject added chips once a lamp is lit, and any takedown clears lamps", () => {
  let g = E.placeBet(game(), { kind: "hardAllDay" }, $(5)).state;
  g = roll(g, 4, true).state;
  assert.equal(g.progress.hardAllDay[4], true);
  const add = E.placeBet(g, { kind: "hardAllDay" }, $(100));
  assert.equal(add.ok, false);
  assert.match(add.error, /lamps/);
  const partial = E.removeBet(g, { kind: "hardAllDay" }, $(1));
  assert.equal(partial.ok, true);
  assert.equal(partial.state.bets.hardAllDay, $(4));
  assert.deepEqual(partial.state.progress.hardAllDay, {});
  assert.equal(E.placeBet(partial.state, { kind: "hardAllDay" }, $(1)).ok, true);

  g = E.placeBet(game(), { kind: "small" }, $(2)).state;
  g = roll(g, 6).state;
  assert.equal(g.progress.small[6], true);
  assert.equal(E.placeBet(g, { kind: "small" }, $(1)).ok, false);
  const cut = E.removeBet(g, { kind: "small" }, $(1));
  assert.equal(cut.state.bets.small, $(1));
  assert.deepEqual(cut.state.progress.small, {});

  g = E.placeBet(game(), { kind: "tall" }, $(1)).state;
  g = roll(g, 8).state;
  assert.equal(E.placeBet(g, { kind: "tall" }, $(1)).ok, false);
  g = E.placeBet(game(), { kind: "all" }, $(1)).state;
  g = roll(g, 9).state;
  assert.equal(E.placeBet(g, { kind: "all" }, $(5)).ok, false);
});

test("a Repeater takedown clears the tally", () => {
  let g = E.placeBet(game(), { kind: "repeater", number: 6 }, $(5)).state;
  g = roll(g, 6).state;
  assert.equal(g.repeaterCount[6], 1);
  assert.equal(E.placeBet(g, { kind: "repeater", number: 6 }, $(1)).ok, false);
  const cut = E.removeBet(g, { kind: "repeater", number: 6 }, $(1));
  assert.equal(cut.state.bets.repeaters[6], $(4));
  assert.equal(cut.state.repeaterCount[6], 0);
  assert.equal(E.placeBet(cut.state, { kind: "repeater", number: 6 }, $(1)).ok, true);
});

test("mode switch refuses while a point or Pass or Come bet is working", () => {
  let g = point(E.placeBet(game(), { kind: "pass" }, $(10)).state, 4);
  const bank = g.bankroll;
  const blocked = E.switchMode(g, "crapless");
  assert.equal(blocked.ok, false);
  assert.equal(blocked.state.point, 4);
  assert.equal(blocked.state.bets.pass, $(10));
  assert.equal(blocked.state.bankroll, bank);
  assert.equal(E.contractsWorking(blocked.state), true);

  g = E.placeBet(game(), { kind: "pass" }, $(10)).state;
  assert.equal(E.switchMode(g, "regular").ok, false);

  g = point(E.placeBet(game(), { kind: "pass" }, $(5)).state, 6);
  g = E.placeBet(g, { kind: "come" }, $(5)).state;
  assert.equal(E.switchMode(g, "crapless").ok, false);
  assert.equal(g.bets.come, $(5));

  const open = E.switchMode(game(), "crapless");
  assert.equal(open.ok, true);
  assert.equal(open.state.mode, "crapless");
  assert.equal(open.state.phase, "come-out");
  assert.equal(open.state.bankroll, $(1000));
});

test("auto-press adds to a Billy's Way win and leaves the original bet", () => {
  let g = point(game(), 4);
  g = E.placeBillysWay(g, $(5)).state;
  assert.equal(g.billyMark.place[8], true);
  assert.equal(g.originals.place[8], $(6));
  g.autoPress = { mode: "power", max: 2, counts: {} };
  g = roll(g, 8).state;
  let pressed = applyAutoPress(g);
  assert.equal(pressed.ok, true);
  assert.equal(pressed.state.bets.place[8], $(18));
  assert.equal(pressed.state.originals.place[8], $(6));
  assert.match(pressed.message, /Auto POWER PRESS 8 → \$18 \(added \$5 from chips\)/);
  g = roll(pressed.state, 8).state;
  pressed = applyAutoPress(g);
  assert.equal(pressed.ok, true);
  assert.equal(pressed.state.originals.place[8], $(6));
  g = roll(pressed.state, 8).state;
  pressed = applyAutoPress(g);
  assert.equal(pressed.ok, false);
  assert.match(pressed.error, /cap/);

  g = point(game(), 5);
  g = E.placeBet(g, { kind: "place", number: 6 }, $(6)).state;
  g.autoPress = { mode: "press", max: 3, counts: {} };
  g = roll(g, 6).state;
  assert.equal(applyAutoPress(g).ok, false);
  assert.equal(g.bets.place[6], $(6));
});

test("auto-press counts reset on seven-out, Billy's Way, reset, and takedown", () => {
  let g = point(game(), 4);
  g.autoPress = { mode: "press", max: 3, counts: { "place:8": 2, "buy:4": 1 } };
  g = roll(g, 7).state;
  assert.deepEqual(g.autoPress.counts, {});

  g = point(game(), 5);
  g.autoPress = { mode: "press", max: 1, counts: { "place:8": 1, "place:6": 2 } };
  g = E.placeBillysWay(g, $(5)).state;
  assert.equal(g.autoPress.counts["place:8"], undefined);
  assert.equal(g.autoPress.counts["place:6"], undefined);

  g.autoPress.counts["buy:10"] = 2;
  g = E.resetLayout(g);
  assert.deepEqual(g.autoPress.counts, {});

  g = point(game(), 8);
  g = E.placeBet(g, { kind: "place", number: 8 }, $(6)).state;
  g.autoPress = { mode: "press", max: 3, counts: { "place:8": 2 } };
  const cut = E.removeBet(g, { kind: "place", number: 8 }, $(6));
  assert.equal(cut.state.bets.place[8], 0);
  assert.equal(cut.state.autoPress.counts["place:8"], undefined);
});

test("B5 reopens after a seven-out, pauses after three losses, and presses onto the original", () => {
  let g = point(game("regular", $(5000)), 9);
  let res = autoBet(g, "B5", $(5));
  assert.equal(res.state.bets.place[6], $(18));
  g = roll(res.state, 7).state;
  res = autoBet(g, "B5", $(5));
  assert.equal(res.state.bets.place[6], $(18));
  assert.equal(res.state.bets.place[8], $(18));
  assert.equal(res.paused, undefined);

  g = point(res.state, 9);
  g = roll(g, 7).state;
  res = autoBet(g, "B5", $(5));
  g = point(res.state, 9);
  g = roll(g, 7).state;
  res = autoBet(g, "B5", $(5));
  assert.equal(res.paused, true);
  assert.equal(res.state.bets.place[6], 0);
  res = autoBet(res.state, "B5", $(5));
  assert.equal(res.state.bets.place[6], 0);

  g = point(game("regular", $(5000)), 9);
  res = autoBet(g, "B5", $(5));
  g = roll(res.state, 6).state;
  res = autoBet(g, "B5", $(5));
  assert.equal(res.state.bets.place[6], $(6));
  assert.equal(res.state.originals.place[6], $(6));
  g = roll(res.state, 6).state;
  res = autoBet(g, "B5", $(5));
  assert.equal(res.state.bets.place[6], $(12));
  assert.equal(res.state.originals.place[6], $(6));
  assert.match(res.message, /PRESS 6/);

  g.autoPress = { mode: "power", max: 3, counts: {} };
  g = roll(res.state, 8).state;
  g.autoPress = { mode: "power", max: 3, counts: {} };
  res = autoBet(g, "B5", $(5));
  assert.equal(res.state.bets.place[8], $(18));
  assert.equal(res.state.originals.place[8], $(6));
  assert.match(res.message, /Auto POWER PRESS 8 → \$18/);
});

test("B8 can post a new set after three hits, and ignores a win already on the log", () => {
  let g = point(game("crapless", $(2000)), 6);
  g.lastDecisions = [{ result: "win", bet: "Buy 4", profit: 1000 }];
  let res = autoBet(g, "B8", $(5));
  assert.equal(res.state.strategy.data.hits || 0, 0);
  assert.equal(res.state.bets.buy[4], $(5));
  for (let i = 0; i < 3; i++) {
    g = res.state;
    g.lastDecisions = [{ result: "win", bet: "Buy 4" }];
    res = autoBet(g, "B8", $(5));
  }
  assert.equal(res.state.bets.buy[4], 0);
  assert.match(res.message, /taken down/);
  res = autoBet(res.state, "B8", $(5));
  assert.equal(res.state.bets.buy[4], 0);
  g = res.state;
  g.phase = "come-out";
  g.point = null;
  res = autoBet(g, "B8", $(5));
  g = point(res.state, 8);
  res = autoBet(g, "B8", $(5));
  assert.equal(res.state.bets.buy[4], $(5));
});

test("B11 counts 100 rolls before it pauses", () => {
  let res = autoBet(game(), "B11", $(5), { count: false });
  assert.equal(res.state.strategy.rolls, 0);
  assert.equal(res.state.bets.pass, $(5));
  for (let i = 0; i < 100; i++) {
    res = autoBet(res.state, "B11", $(5));
    assert.notEqual(res.paused, true);
  }
  assert.equal(res.state.strategy.rolls, 100);
  res = autoBet(res.state, "B11", $(5));
  assert.equal(res.paused, true);
  assert.match(res.message, /100-roll/);
});

test("blaze lessons name the tier and say the dice have no memory", () => {
  const warm = E.blazeMoment({ rolls: 3, points: 0 }, { rolls: 4, points: 0 }, "roll");
  assert.equal(warm.lessonTier, "warm");
  assert.match(warm.text, /Warm: this hand has lasted 4 rolls so far/);
  const hot = E.blazeMoment({ rolls: 11, points: 0 }, { rolls: 12, points: 0 }, "roll");
  assert.equal(hot.lessonTier, "hot");
  assert.match(hot.text, /Hot hand: 12 rolls so far/);
  assert.match(hot.text, /1 in 6/);
  const blazing = E.blazeMoment({ rolls: 23, points: 0 }, { rolls: 24, points: 0 }, "roll");
  assert.equal(blazing.lessonTier, "blazing");
  assert.match(blazing.text, /doesn't change the odds/);
  const cool = E.blazeMoment({ rolls: 13, points: 1 }, { rolls: 0, points: 0 }, "seven-out");
  assert.equal(cool.cooled, true);
  assert.match(cool.text, /Cooled off\. New hand, same odds/);
  assert.match(cool.handNote, /Dice have no memory/);
  const natural = E.blazeMoment({ rolls: 2, points: 0 }, { rolls: 3, points: 0 }, "natural");
  assert.equal(natural.text, "");
});

test("power press reports the table cap only when the bet lands on it", () => {
  let g = point(game("regular", $(5000)), 6);
  g = E.placeBet(g, { kind: "buy", number: 4 }, $(300)).state;
  g = roll(g, 4).state;
  const open = E.powerPress(g);
  assert.equal(open.ok, true);
  assert.equal(open.atMax, false);
  assert.equal(open.state.bets.buy[4], $(900));
  const capped = E.powerPress(g, { maxCents: $(500) });
  assert.equal(capped.ok, true);
  assert.equal(capped.atMax, true);
  assert.equal(capped.state.bets.buy[4], $(500));
  assert.match(capped.label, /\$500 \(max\)/);
  assert.equal(capped.back, $(385));
});

test("swipe resolution uses a horizontal threshold", () => {
  assert.equal(resolveSwipe(1, -10, 0), 1);
  assert.equal(resolveSwipe(1, -80, 10), 2);
  assert.equal(resolveSwipe(1, 80, 5), 0);
  assert.equal(resolveSwipe(1, 80, 90), 1);
  assert.equal(resolveSwipe(0, 80, 0), 0);
  assert.equal(resolveSwipe(2, -80, 0), 2);
});

test("a come-out 7 is a natural and a point 7 is a seven-out", () => {
  let g = E.placeBet(game(), { kind: "pass" }, $(5)).state;
  const natural = E.settle(g, 3, 4);
  assert.equal(natural.result, "natural");
  assert.equal(natural.state.history[0].result, "natural");
  assert.equal(E.rollCaption(5, 3).aria, "five and three, easy eight");
  g = E.settle(E.placeBet(game(), { kind: "pass" }, $(5)).state, 4, 2).state;
  const out = E.settle(g, 3, 4);
  assert.equal(out.result, "seven-out");
  assert.equal(out.state.history[0].result, "seven-out");
  assert.equal(out.state.history[1].result, "point-set");
});

test("strategy names keep the spec subtitles", () => {
  assert.match(STRATEGIES.find((s) => s.id === "B6").name, /Make the line pay/);
  assert.match(STRATEGIES.find((s) => s.id === "B7").name, /Avoid 2\/3\/11\/12/);
  assert.match(STRATEGIES.find((s) => s.id === "B13").name, /Continuous Come/);
  assert.match(STRATEGIES.find((s) => s.id === "B13").bankroll, /40%/);
  assert.match(STRATEGIES.find((s) => s.id === "B13").bankroll, /\+30%/);
  assert.match(STRATEGIES.find((s) => s.id === "B14").name, /Hit and Split/);
});

test("a hand with rolls cannot switch mode until a seven-out or a bankroll reset", () => {
  let g = roll(game(), 7).state;
  assert.equal(g.hand.rolls, 1);
  assert.equal(g.phase, "come-out");
  assert.equal(E.contractsWorking(g), false);
  const blocked = E.switchMode(g, "crapless");
  assert.equal(blocked.ok, false);
  assert.match(blocked.error, /seven-out/);
  assert.equal(blocked.state.mode, "regular");
  assert.equal(blocked.state.hand.rolls, 1);
  const reset = E.resetBankroll(blocked.state);
  assert.equal(E.switchMode(reset, "crapless").ok, true);
});

test("a hand posts only when a bet is working, and parked place bets do not count", () => {
  let g = game();
  assert.equal(E.hadWorkingBet(g), false);
  g = E.placeBet(g, { kind: "pass" }, $(5)).state;
  assert.equal(E.hadWorkingBet(g), true);
  g = point(game(), 6);
  g = E.placeBet(g, { kind: "place", number: 8 }, $(6)).state;
  assert.equal(E.hadWorkingBet(g), true);
  g.betsOff = true;
  assert.equal(E.hadWorkingBet(g), false);
  g = E.placeBet(game(), { kind: "field" }, $(5)).state;
  g.phase = "point";
  g.point = 6;
  g.betsOff = true;
  assert.equal(E.hadWorkingBet(g), true);
});

test("continuous come places a new come on every point roll and replaces a come off-and-on", () => {
  let g = point(E.placeBet(game(), { kind: "pass" }, $(5)).state, 6);
  g.strategy = { id: "B13", rolls: 0, data: {} };
  let a = autoBet(g, "B13", $(5), { count: false });
  assert.equal(a.state.bets.come, $(5));
  assert.ok(a.state.bets.passOdds > 0);
  g = roll(a.state, 8).state;
  assert.equal(g.bets.comeBets[8].amount, $(5));
  a = autoBet(g, "B13", $(5), { count: false });
  assert.equal(a.state.bets.come, $(5));
  assert.ok(a.state.bets.comeBets[8].odds > 0);
  g = roll(a.state, 8).state;
  assert.equal(g.bets.come, 0);
  assert.equal(g.bets.comeBets[8].amount, $(5));
  assert.equal(Object.keys(g.bets.comeBets).length, 1);
  g.strategy = { id: "B13", rolls: 0, data: { cap: 1 } };
  a = autoBet(g, "B13", $(5), { count: false });
  assert.equal(a.state.bets.come, 0);
});

test("hit and split ladders the win and suspends auto-press", () => {
  let g = point(game(), 4);
  g.strategy = { id: "B14", rolls: 0, data: { start: 6 } };
  let a = autoBet(g, "B14", $(5), { count: false });
  assert.equal(a.state.bets.place[6], $(12));
  g = roll(a.state, 6).state;
  const bank = g.bankroll;
  a = autoBet(g, "B14", $(5), { count: false });
  assert.equal(a.state.bets.place[6], $(12));
  assert.equal(a.state.bets.place[8], $(6));
  assert.equal(a.state.bankroll, bank - $(6));
  a.state.autoPress = { mode: "press", max: 3, counts: {} };
  const pressed = applyAutoPress(a.state);
  assert.equal(pressed.skipped, true);
  assert.equal(pressed.state.bets.place[6], $(12));
});

test("hit and split collects a side hit and waits for the next point", () => {
  let g = point(game("regular", $(500)), 4);
  g.strategy = { id: "B14", rolls: 0, data: { start: 6, across: true, step: 3, collected: 0 } };
  g = E.placeBet(g, { kind: "place", number: 6 }, $(12)).state;
  g = E.placeBet(g, { kind: "place", number: 8 }, $(6)).state;
  g = E.placeBet(g, { kind: "buy", number: 5 }, $(5)).state;
  g = E.placeBet(g, { kind: "buy", number: 9 }, $(5)).state;
  g = E.placeBet(g, { kind: "buy", number: 4 }, $(5)).state;
  g = E.placeBet(g, { kind: "buy", number: 10 }, $(5)).state;
  g.strategy = { id: "B14", rolls: 1, data: { start: 6, across: true, step: 3, collected: 0, regressDone: false } };
  g = roll(g, 5).state;
  const bank = g.bankroll;
  let a = autoBet(g, "B14", $(5), { count: false });
  assert.equal(a.state.bets.buy[5], $(5));
  assert.ok(a.state.bankroll >= bank);
  assert.equal(a.state.strategy.data.collected, 1);
  assert.notEqual(a.state.strategy.data.down, true);
  g = roll(a.state, 9).state;
  a = autoBet(g, "B14", $(5), { count: false });
  assert.equal(a.state.bets.buy[9], 0);
  assert.equal(a.state.bets.place[6], 0);
  assert.equal(a.state.strategy.data.down, true);
  assert.equal(a.state.phase, "point");
  a = autoBet(a.state, "B14", $(5), { count: false });
  assert.equal(a.state.bets.place[6], 0);
  g = a.state;
  g.phase = "come-out";
  g.point = null;
  a = autoBet(g, "B14", $(5), { count: false });
  assert.equal(a.state.bets.place[6], 0);
  g = point(a.state, 8);
  a = autoBet(g, "B14", $(5), { count: false });
  assert.equal(a.state.bets.place[6], $(12));
});

test("a hand press on the B14 start number is not regressed", () => {
  let g = point(game("regular", $(500)), 4);
  g = E.placeBet(g, { kind: "place", number: 6 }, $(18)).state;
  g = E.placeBet(g, { kind: "place", number: 8 }, $(6)).state;
  g = E.placeBet(g, { kind: "buy", number: 4 }, $(5)).state;
  g = E.placeBet(g, { kind: "buy", number: 10 }, $(5)).state;
  g = E.placeBet(g, { kind: "buy", number: 5 }, $(5)).state;
  g = E.placeBet(g, { kind: "buy", number: 9 }, $(5)).state;
  g.strategy = { id: "B14", rolls: 1, data: { start: 6, across: true, step: 3, override: { 6: true } } };
  g = roll(g, 6).state;
  const a = autoBet(g, "B14", $(5), { count: false });
  assert.equal(a.state.bets.place[6], $(18));
  assert.notEqual(a.state.strategy.data.regressDone, true);
});

test("hit and split stops after six lost starts and ignores a come-out 7", () => {
  let g = point(game(), 4);
  g.strategy = { id: "B14", rolls: 0, data: { start: 6 } };
  let a = autoBet(g, "B14", $(5), { count: false });
  assert.equal(a.state.strategy.data.armed, true);
  g = roll(a.state, 4).state;
  assert.equal(g.phase, "come-out");
  assert.equal(g.bets.place[6], $(12));
  g = roll(g, 7).state;
  assert.equal(g.bets.place[6], $(12));
  a = autoBet(g, "B14", $(5), { count: false });
  assert.equal(a.state.strategy.data.startsLost || 0, 0);
  assert.equal(a.state.strategy.id, "B14");

  g = point(game(), 5);
  g.strategy = { id: "B14", rolls: 0, data: { start: 6 } };
  for (let i = 1; i <= 5; i++) {
    if (g.phase !== "point") g = point(g, 5);
    a = autoBet(g, "B14", $(5), { count: false });
    assert.equal(a.state.bets.place[6], $(12));
    g = roll(a.state, 7).state;
    a = autoBet(g, "B14", $(5), { count: false });
    assert.equal(a.state.strategy.data.startsLost, i);
    g = a.state;
  }
  if (g.phase !== "point") g = point(g, 5);
  a = autoBet(g, "B14", $(5), { count: false });
  g = roll(a.state, 7).state;
  a = autoBet(g, "B14", $(5), { count: false });
  assert.equal(a.state.strategy, null);
  assert.match(a.message, /6 starts lost/);
});

test("auto power press says so when the chips cannot cover the give", () => {
  let g = point(game(), 8);
  g = E.placeBet(g, { kind: "place", number: 6 }, $(6)).state;
  g.billyMark = { place: { 6: true }, buy: {} };
  g = roll(g, 6).state;
  g.bankroll = 0;
  g.autoPress = { mode: "power", max: 3, counts: {} };
  const pressed = applyAutoPress(g);
  assert.equal(pressed.ok, false);
  assert.match(pressed.message || "", /not enough chips/);
});
