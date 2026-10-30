import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import * as E from "../js/engine.mjs";
import * as TR from "../js/table-rules.mjs";
import * as Rail from "../js/rail.mjs";
import * as PT from "../js/point-tier.mjs";
import * as Et from "../js/etiquette.mjs";
import * as TS from "../js/table-strategies.mjs";
import * as R from "../js/replay.mjs";
import * as MP from "../js/table-mp.mjs";
import * as Fair from "../js/fair.mjs";
import { diceFromSeed, xoshiro128ss } from "../js/rng.mjs";
import * as B from "../js/badges.mjs";

const $ = (n) => Math.round(n * 100);
function table(rules) {
  return E.createGame({ profile: "table", rules });
}
function roll(state, d1, d2) {
  const b = d2 == null ? d1 - 1 : d2;
  const a = d2 == null ? 1 : d1;
  return E.settle(state, a, b == null ? d1 : b);
}

test("table profile is regular only", () => {
  const g = table();
  assert.equal(g.mode, "regular");
  assert.equal(g.profile, "table");
  const no = E.switchMode(g, "crapless");
  assert.equal(no.ok, false);
  assert.equal(no.error, "Table Craps is Regular only");
  assert.equal(E.placeBillysWay(g, 500).ok, false);
  assert.match(E.press(g).error, /PRESS/);
  assert.match(E.powerPress(g).error, /POWER PRESS/);
});

test("bubble still rejects the Fire Bet and keeps lay odds at 6x", () => {
  const g = E.createGame();
  assert.equal(g.profile, "bubble");
  assert.equal(E.placeBet(g, { kind: "fire" }, 100).error, "Fire Bet is not in Bubble Craps.");
  assert.equal(E.maxLayOdds(1000), 6000);
  assert.equal(E.maxPassOdds(1000, 6), 5000);
});

test("odds presets and lay caps", () => {
  assert.equal(E.maxPassOdds(1000, 4, "345"), 3000);
  assert.equal(E.maxPassOdds(1000, 5, "345"), 4000);
  assert.equal(E.maxPassOdds(1000, 6, "345"), 5000);
  assert.equal(E.maxPassOdds(1000, 6, "5x"), 5000);
  assert.equal(E.maxPassOdds(1000, 4, "10x"), 10000);
  assert.equal(E.maxLayOdds(1000, 4, "345"), 6000);
  assert.equal(E.maxLayOdds(1000, 6, "345"), 6000);
  assert.equal(E.maxLayOdds(1000, 4, "5x"), 10000);
  assert.equal(E.maxLayOdds(1000, 5, "5x"), 7500);
  assert.equal(E.maxLayOdds(1000, 6, "5x"), 6000);
  assert.equal(E.maxLayOdds(1000, 4, "10x"), 20000);
  assert.equal(E.maxLayOdds(1000, 5, "10x"), 15000);
  assert.equal(E.maxLayOdds(1000, 6, "10x"), 12000);
});

test("buy, lay, place and field payouts", () => {
  assert.equal(E.buyProfit(1000, 4), 1950);
  assert.equal(E.buyProfit(1000, 5), 1450);
  assert.equal(E.buyProfit(1000, 6), 1150);
  assert.equal(TR.layNet(4000, 4, { layVig: "onwin" }), 1900);
  assert.equal(TR.layNet(3000, 5, { layVig: "onwin" }), 1900);
  assert.equal(E.placeProfit(1200, 6), 1400);
  assert.equal(E.placeProfit(49800, 6), E.placeProfit(49800, 6));
  assert.equal(TR.fieldEdge({ field2: 2, field12: 2 }), 5.56);
  assert.equal(TR.fieldEdge({ field2: 3, field12: 2 }), 2.78);
  assert.equal(TR.fieldEdge({ field2: 3, field12: 3 }), 0);
  assert.equal(E.EDGES.passCombined345, 0.374);
  assert.equal(E.EDGES.dontCombined10, 0.124);
  assert.equal(TR.LAY_EDGE.upfront[4], 2.44);
  assert.equal(TR.LAY_EDGE.upfront[5], 3.23);
  assert.equal(TR.LAY_EDGE.upfront[6], 4);
});

test("table limits and prop minimum", () => {
  let g = table();
  assert.match(E.placeBet(g, { kind: "pass" }, 900).error, /Minimum is \$10/);
  g = E.settle(E.placeBet(g, { kind: "pass" }, 1000).state, 3, 3).state;
  assert.equal(E.placeBet(g, { kind: "place", number: 6 }, 50000).error, "Max $498 here");
  assert.equal(E.placeBet(g, { kind: "place", number: 8 }, 49800).ok, true);
  assert.equal(E.placeBet(g, { kind: "place", number: 6 }, 600).error, "Minimum is $12.");
  assert.equal(E.placeBet(g, { kind: "hardway", number: 6 }, 100).ok, true);
  assert.equal(E.placeBet(g, { kind: "anyCraps" }, 100).ok, true);
  const odds = E.placeBet(E.placeBet(table(), { kind: "pass" }, 50000).state, { kind: "pass" }, 0);
  let fat = table({ oddsPreset: "10x" });
  fat.bankroll = 2000000;
  fat = E.placeBet(fat, { kind: "pass" }, 50000).state;
  fat = E.settle(fat, 2, 2).state;
  assert.equal(fat.point, 4);
  assert.equal(E.placeBet(fat, { kind: "passOdds" }, 500000).ok, true);
});

test("place, buy and lay are exclusive until converted", () => {
  let g = E.settle(E.placeBet(table(), { kind: "pass" }, 1000).state, 3, 3).state;
  g = E.placeBet(g, { kind: "place", number: 6 }, 3000).state;
  const clash = E.placeBet(g, { kind: "buy", number: 6 }, 3000);
  assert.equal(clash.ok, false);
  assert.equal(clash.convert.from, "place");
  assert.equal(clash.convert.to, "buy");
  const moved = E.placeBet(g, { kind: "buy", number: 6 }, 3000, { convert: true });
  assert.equal(moved.ok, true);
  assert.equal(moved.state.bets.place[6], 0);
  assert.equal(moved.state.bets.buy[6], 3000);
});

test("come odds off and don't-come lay odds on during the come-out", () => {
  let g = table();
  g = E.placeBet(g, { kind: "pass" }, 1000).state;
  g = E.settle(g, 5, 5).state;
  g = E.placeBet(g, { kind: "come" }, 1000).state;
  g = E.settle(g, 3, 3).state;
  g = E.placeBet(g, { kind: "comeOdds", number: 6 }, 5000).state;
  g = E.placeBet(g, { kind: "dontCome" }, 1000).state;
  g = E.settle(g, 1, 3).state;
  g = E.placeBet(g, { kind: "dontComeOdds", number: 4 }, 6000).state;
  g = E.settle(g, 5, 5).state;
  assert.equal(g.phase, "come-out");
  const bank = g.bankroll;
  const out = E.settle(g, 3, 4);
  const come = out.decisions.find((d) => d.bet === "Come 6");
  const dc = out.decisions.find((d) => d.bet === "Don't Come 4");
  assert.equal(come.result, "lose");
  assert.equal(come.stake, 1000);
  assert.equal(dc.result, "win");
  assert.ok(dc.profit > 1000);
  assert.ok(out.state.bankroll > bank);
});

test("a come-out 7 pays a working lay and can park it", () => {
  let g = E.placeBet(table(), { kind: "lay", number: 4 }, 4000).state;
  const hit = E.settle(g, 3, 4);
  assert.equal(hit.decisions.find((d) => d.bet === "Lay 4").profit, 1900);
  g.layWorkingOnComeOut = false;
  const parked = E.settle(g, 3, 4);
  assert.equal(parked.decisions.find((d) => d.bet === "Lay 4"), undefined);
  assert.equal(parked.state.bets.lay[4], 4000);
});

test("don't pass bar 2", () => {
  let g = E.placeBet(table({ bar: 2 }), { kind: "dontPass" }, 1000).state;
  const push = E.settle(g, 1, 1);
  assert.equal(push.decisions.find((d) => d.bet === "Don't Pass").result, "push");
  const win = E.settle(g, 6, 6);
  assert.equal(win.decisions.find((d) => d.bet === "Don't Pass").result, "win");
});

test("fire bet window, unique points and standard pays", () => {
  let g = E.placeBet(table(), { kind: "fire" }, 100).state;
  g = E.settle(g, 3, 3).state;
  assert.equal(E.placeBet(g, { kind: "fire" }, 100).error, "Fire Bet: new shooter only");
  assert.equal(E.removeBet(g, { kind: "fire" }).ok, false);
  const dist = TR.fireDistribution();
  assert.ok(Math.abs(dist[0] * 100 - 59.394) < 0.01);
  assert.ok(Math.abs(dist[4] * 100 - 0.8798) < 0.001);
  assert.ok(Math.abs(dist[6] * 100 - 0.01624) < 0.001);
  assert.ok(Math.abs(TR.fireEdgeFrom(dist, { fireTable: "standard" }) - 20.76) < 0.02);
  assert.equal(TR.fireMultiple(4, { fireTable: "standard" }), 24);
  assert.equal(TR.fireMultiple(3, { fireTable: "standard" }), 0);
  assert.equal(TR.fireMultiple(3, { fireTable: "fire3" }), 6);
  assert.equal(PT.fireStinger(4, true), "Fire Bet: 4 points! Pays 24 to 1 at the seven-out.");
  assert.equal(PT.fireStinger(6, true), "Fire Bet: all six! +$999 per $1. Paid now.");
  assert.equal(PT.fireStinger(4, false), "Fire rail: 4 points.");
});

test("rail breakdown, change and color-up keep the total", () => {
  const a = Rail.railBreakdown(100000);
  assert.deepEqual([a[50000], a[10000], a[2500], a[500], a[100]], [1, 4, 3, 4, 5]);
  const b = Rail.railBreakdown(30000);
  assert.deepEqual([b[50000], b[10000], b[2500], b[500], b[100]], [0, 2, 3, 4, 5]);
  const c = Rail.railBreakdown(1250);
  assert.equal(c[100], 7);
  assert.equal(c[500], 1);
  assert.equal(c.cup, 50);
  assert.deepEqual([Rail.railBreakdown(300)[100], Rail.railBreakdown(300).cup], [3, 0]);
  let rail = Rail.emptyRail();
  rail[2500] = 1;
  const paid = Rail.railPay(rail, 1000);
  assert.equal(paid.ok, true);
  assert.equal(paid.rail[500], 3);
  assert.equal(Rail.railTotal(paid.rail), 1500);
  assert.match(paid.breaks[0].label, /Change: \$25 → 5 × \$5/);
  const up = Rail.railColorUp(Object.assign(Rail.emptyRail(), { 100: 26 }));
  assert.equal(Rail.railTotal(up.rail), 2600);
  assert.ok(up.rail[100] <= 20);
  assert.equal(Rail.badgeText(37), "×37");
  assert.equal(Rail.badgeText(1200), "×999+");
});

test("rail invariant over bets, wins and color-up", () => {
  let g = table();
  let rail = Rail.railBreakdown(g.bankroll);
  let rebuilt = 0;
  const check = () => {
    assert.equal(Rail.railTotal(rail), g.bankroll);
    assert.equal(g.bankroll, E.netWorth(g) - E.tableTotal(g));
    assert.ok(Rail.railMatches(rail, g.bankroll));
  };
  const dice = diceFromSeed(7, 400);
  const ids = TS.TABLE_STRATEGIES.map((c) => c.id);
  for (const preset of ["345", "5x", "10x"]) {
    for (const id of ids) {
      g = table({ oddsPreset: preset });
      rail = Rail.railBreakdown(g.bankroll);
      for (let i = 0; i < 40; i++) {
        g = TS.autoBet(g, id, { unit: 1000 }).state;
        const before = g.bankroll;
        rail = Rail.syncRail(rail, g.bankroll).rail;
        check();
        const settled = E.settle(g, dice[i][0], dice[i][1]);
        g = TS.afterRoll(settled.state, id, settled, { unit: 1000 });
        rail = Rail.syncRail(rail, g.bankroll).rail;
        if (before !== g.bankroll) check();
        else check();
      }
    }
  }
  assert.equal(rebuilt, 0);
  const tampered = Object.assign(Rail.emptyRail(), { 100: 1 });
  if (!Rail.railMatches(tampered, 100000)) {
    rail = Rail.railBreakdown(100000);
    rebuilt += 1;
  }
  assert.equal(rebuilt, 1);
  assert.equal(Rail.railTotal(rail), 100000);
  const cents = Rail.syncRail(Rail.railBreakdown(100000), 95550);
  assert.equal(cents.ok, true);
  assert.equal(Rail.railTotal(cents.rail), 95550);
});

test("the rail can pay any amount up to its total", () => {
  const fresh = Rail.railPay(Rail.railBreakdown(120700), 21000);
  assert.equal(fresh.ok, true);
  assert.equal(Rail.railTotal(fresh.rail), 99700);
  const awkward = Rail.emptyRail();
  awkward[10000] = 2;
  awkward[50000] = 4;
  const odd = Rail.railPay(awkward, 20100);
  assert.equal(odd.ok, true);
  assert.equal(Rail.railTotal(odd.rail), 220000 - 20100);
  let seed = 0x12345678;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const mix = (total) => {
    const rail = Rail.emptyRail();
    let left = total;
    const denoms = [50000, 10000, 2500, 500, 100];
    while (left >= 100) {
      const opts = denoms.filter((d) => d <= left);
      const d = opts[Math.floor(rnd() * opts.length)];
      const k = 1 + Math.floor(rnd() * Math.min(8, Math.floor(left / d)));
      rail[d] += k;
      left -= k * d;
    }
    rail.cup = left;
    return rail;
  };
  let fails = 0;
  for (let i = 0; i < 100000; i++) {
    const dollars = 1 + Math.floor(rnd() * 5000);
    const total = dollars * 100 + Math.floor(rnd() * 100);
    const amount = Math.floor(rnd() * (Math.floor(total / 100) + 1)) * 100;
    if (amount <= 0 || amount > total) continue;
    const start = i % 2 ? Rail.railBreakdown(total) : mix(total);
    const paid = Rail.railPay(start, amount);
    if (!paid.ok || Rail.railTotal(paid.rail) !== Rail.railTotal(start) - amount) fails += 1;
  }
  assert.equal(fails, 0);
});

test("table minimums: hops and repeaters are $1, the line and Any 7 stay $10", () => {
  const g = table();
  assert.equal(E.placeBet(g, { kind: "hop", pair: "1-2" }, 100).ok, true);
  assert.equal(E.placeBet(g, { kind: "repeater", number: 6 }, 100).ok, true);
  assert.match(E.placeBet(g, { kind: "field" }, 100).error, /Minimum is \$10/);
  assert.equal(E.placeBet(g, { kind: "small" }, 100).ok, true);
  assert.equal(E.placeBet(g, { kind: "hardAllDay" }, 100).ok, true);
  assert.equal(E.placeBet(g, { kind: "hardway", number: 6 }, 100).ok, true);
  assert.match(E.placeBet(g, { kind: "any7" }, 500).error, /Minimum is \$10/);
  assert.match(E.placeBet(g, { kind: "pass" }, 500).error, /Minimum is \$10/);
  assert.match(E.placeBet(g, { kind: "place", number: 5 }, 500).error, /Minimum is \$10/);
  assert.match(E.placeBet(g, { kind: "repeater", number: 6 }, 2600).error, /Maximum/);
});

test("many seeds stays lean and reports the spread", () => {
  const started = Date.now();
  const res = R.manySeeds(["T1"], { seeds: 20, rolls: 200, lean: true, seed: 9 });
  assert.equal(res.ok, true);
  assert.ok(Date.now() - started < 8000);
  const row = res.summary.T1;
  assert.equal(typeof row.min, "number");
  assert.equal(typeof row.q1, "number");
  assert.equal(typeof row.median, "number");
  assert.equal(typeof row.max, "number");
  assert.equal(typeof row.expectedLoss, "number");
  assert.ok(row.expectedLoss > 0);
});

test("pass, don't, place and come plans report a real expected loss", () => {
  const dice = R.rollSequenceFromSeed(7, 80).dice;
  ["T1", "T2", "T5", "T23"].forEach((id) => {
    const run = R.replay(dice, id, { atLimit: "stop" });
    assert.ok(run.expectedLoss > 0, id + " expected loss " + run.expectedLoss);
  });
});

test("replays stop at the 40% loss and +30% win goal", () => {
  const dice = R.rollSequenceFromSeed(11, 80).dice;
  const run = R.replay(dice, "T1", { stopLoss: 0.02, winGoal: 0.02 });
  assert.ok(run.limitRoll > 0, "limit roll " + run.limitRoll);
  assert.ok(run.limitRoll < dice.length);
  assert.ok(run.stopKind === "loss" || run.stopKind === "goal");
});

test("celebration tiers and copy", () => {
  assert.equal(PT.celebrationTier(1), "base");
  assert.equal(PT.celebrationTier(2), "big");
  assert.equal(PT.celebrationTier(3), "huge");
  assert.equal(PT.celebrationTier(5), "huge");
  assert.equal(PT.celebrationTier(1, { meterOn: true, blazing: true }), "huge");
  assert.equal(PT.tierDuration("base"), 1200);
  assert.equal(PT.tierDuration("big"), 2000);
  assert.equal(PT.tierDuration("huge"), 2500);
  assert.equal(PT.tierDuration("huge", true), 1200);
  assert.equal(PT.tierDuration("huge", false, true), 2500);
  assert.equal(PT.tierDuration("base", false, true), 1200);
  assert.equal(PT.celebrationCopy({ tier: "big", point: 8, points: 2, net: 2000 }).duration, 2000);
  assert.equal(PT.celebrationCopy({ tier: "huge", point: 8, points: 3, net: 2000, big: false }).big, false);
  assert.equal(PT.celebrationCopy({ tier: "huge", point: 8, points: 3, net: 2000, big: true }).duration, 2500);
  const base = PT.celebrationCopy({ tier: "base", point: 6, points: 1, net: 7000 });
  assert.equal(base.call, "Six! The point is made. Pass line wins.");
  assert.equal(base.cheer, "Yesss!");
  assert.ok(PT.celebrationClean(base.call + base.cheer));
  assert.equal(PT.billyCall(9, "big", 2), "Nine! Two points this hand.");
  assert.equal(PT.billieCheer("huge"), "What a hand!");
});

test("strategies T1 T5 T7 T19 T20 T23 T24", () => {
  assert.equal(TS.strategyById("T1").max7["345"], 60);
  assert.equal(TS.strategyById("T1").bankroll, "$500");
  assert.equal(TS.strategyById("T5").bankroll, "$200");
  assert.equal(TS.strategyById("T12").bankroll, "$480");
  assert.equal(TS.strategyById("T12").bankCents, 48000);
  assert.equal(TS.sessionLimits(100000).stopAt, 60000);
  assert.equal(TS.sessionLimits(100000).goalAt, 130000);
  let g = table();
  g = TS.autoBet(g, "T1", { unit: 1000 }).state;
  g = E.settle(g, 3, 3).state;
  g = TS.autoBet(g, "T1", { unit: 1000 }).state;
  assert.equal(g.bets.passOdds, 5000);
  g = table({ oddsPreset: "345" });
  g = TS.autoBet(g, "T1", { unit: 1000 }).state;
  g = E.settle(g, 2, 2).state;
  g = TS.autoBet(g, "T1", { unit: 1000 }).state;
  assert.equal(g.bets.passOdds, 3000);
  let t5 = E.settle(E.placeBet(table(), { kind: "pass" }, 1000).state, 2, 2).state;
  t5 = TS.autoBet(t5, "T5", {}).state;
  assert.equal(t5.bets.place[6], 1200);
  const hit = E.settle(t5, 3, 3);
  assert.equal(hit.decisions.find((d) => d.bet === "Place 6").profit, 1400);

  let iron = E.settle(table(), 2, 2).state;
  iron = TS.autoBet(iron, "T7", { unit: 1000 }).state;
  const five = E.settle(iron, 2, 3);
  assert.equal(five.net, 450);
  const six = E.settle(iron, 1, 5);
  assert.equal(six.net, 400);
  const three = E.settle(iron, 1, 2);
  assert.equal(three.net, 1000);
  const two = E.settle(iron, 1, 1);
  assert.equal(two.net, 2000);
  const seven = E.settle(iron, 3, 4);
  assert.equal(seven.net, -4400);

  let d19 = TS.autoBet(table(), "T19", { unit: 1000 }).state;
  const twelve = E.settle(d19, 6, 6);
  assert.equal(twelve.net, -1000);

  let m = table();
  let data = {};
  for (let i = 0; i < 6; i++) {
    m.strategy = { id: "T20", data };
    m = TS.autoBet(m, "T20", { unit: 1000 }).state;
    data = m.strategy.data;
    const settled = E.settle(m, 3, 4);
    m = TS.afterRoll(settled.state, "T20", settled, { unit: 1000 });
    data = m.strategy.data;
  }
  assert.equal(data.maxHit, true);
  assert.equal(data.next, 1000);

  let h = TS.autoBet(table(), "T23", { unit: 1000 }).state;
  h = E.settle(h, 2, 2).state;
  h = TS.autoBet(h, "T23", { unit: 1000 }).state;
  const out = E.settle(h, 3, 4);
  assert.equal(out.net, -1400);

  let w = table();
  w = TS.autoBet(w, "T24", { unit: 1000 }).state;
  const co = E.settle(w, 3, 4);
  assert.equal(co.net, 3800);
  w = E.settle(table(), 3, 3).state;
  w = TS.autoBet(w, "T24", {}).state;
  const so = E.settle(w, 3, 4);
  assert.equal(so.net, -600);
});

test("replay is deterministic and values an open come", () => {
  const seq = R.rollSequenceFromSeed("table-seed", 30);
  const a = R.replay(seq.dice, "T1", {});
  const b = R.replay(seq.dice, "T1", {});
  assert.deepEqual(a.ledger, b.ledger);
  assert.equal(R.fairCome(1000, 4), 667);
  assert.equal(R.fairDontCome(1000, 4), 1333);
  const cmp = R.compare(seq.dice, ["T1", "T2", "T5"], {});
  assert.equal(cmp.topLabel, "Top on this replay");
  assert.equal(R.compare(seq.dice, ["T1", "T2", "T3", "T4", "T5", "T6", "T7"]).ok, false);
  const csv = R.parseCsv("mode,die1,die2\nbubble,3,4\n");
  assert.equal(csv.ok, true);
  assert.match(csv.banner, /Bubble/);
  assert.equal(R.parseCsv("mode,die1,die2\ncrapless,1,1\n").ok, false);
  assert.equal(R.comparisonClean("Top on this replay"), true);
  assert.equal(R.comparisonClean("best strategy"), false);
});

test("multiplayer passes the dice only on a seven-out", () => {
  const t = MP.createTable({ seats: 3, names: ["Ana", "Ben", "Cara"] });
  t.seats.forEach((s) => { s.state = E.placeBet(s.state, { kind: "pass" }, 1000).state; });
  const point = MP.playRoll(t, 5, 5);
  assert.equal(point.passed, false);
  assert.equal(point.result, "point-set");
  assert.equal(MP.shooterName(t), "Ana");
  const made = MP.playRoll(t, 5, 5);
  assert.equal(made.result, "point-made");
  assert.equal(made.passed, false);
  assert.equal(MP.shooterName(t), "Ana");
  t.seats.forEach((s) => {
    if (!s.state.bets.pass) s.state = E.placeBet(s.state, { kind: "pass" }, 1000).state;
  });
  const again = MP.playRoll(t, 4, 4);
  assert.equal(again.result, "point-set");
  const out = MP.playRoll(t, 3, 4);
  assert.equal(out.result, "seven-out");
  assert.equal(out.passed, true);
  assert.equal(MP.shooterName(t), "Ben");
  const solo = MP.createTable({ seats: 2 });
  solo.seats.pop();
  solo.order = [0];
  solo.seats[0].state = E.placeBet(solo.seats[0].state, { kind: "pass" }, 1000).state;
  solo.seats[0].state = E.settle(solo.seats[0].state, 3, 3).state;
  const stay = MP.playRoll(solo, 3, 4);
  assert.equal(stay.passed, false);
});

test("etiquette deck, nudges and table manners", () => {
  assert.equal(Et.ETIQUETTE.length, 15);
  assert.equal(Et.etiquetteClean(), true);
  const bubble = Et.deckFor("bubble");
  assert.deepEqual(bubble.both.map((t) => t.n), [4, 9]);
  assert.equal(bubble.live.length, 12);
  assert.equal(bubble.all.length, 14);
  assert.equal(Et.deckFor("table").all.length, 15);
  assert.equal(Et.nudgeFor("buy_in", "bubble"), null);
  assert.equal(Et.nudgeFor("first_dont", "bubble").n, 9);
  assert.equal(Et.nudgeFor("session_start", "table").n, 14);
  assert.equal(Et.nudgeFor("session_start", "bubble"), null);
  assert.equal(Et.deckFor("bubble").all.some((t) => t.id === "check_minimum"), false);
  assert.equal(Et.deckFor("table").all.length, 15);
  assert.ok(Et.ETIQUETTE.find((t) => t.n === 4).billy.includes("doesn't change the dice") || Et.ETIQUETTE.find((t) => t.n === 4).why.includes("doesn't change"));
  let store = { badges: {}, progress: {} };
  Et.ETIQUETTE.forEach((t, i) => {
    store = B.noteAction(store, { type: "etiquette", id: t.id, complete: i === Et.ETIQUETTE.length - 1 }).store;
  });
  assert.ok(store.badges.table_manners);
});

test("rule 0 refuses a roll without crypto and has no Math.random fallback", () => {
  const src = readFileSync(new URL("../js/engine.mjs", import.meta.url), "utf8");
  assert.equal(/Math\.random\(/.test(src), false);
  const desc = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  Object.defineProperty(globalThis, "crypto", { configurable: true, get() { return undefined; } });
  const die = E.rollDie();
  const dice = E.rollDice();
  assert.equal(die, null);
  assert.equal(dice.ok, false);
  assert.equal(dice.error, "Can't roll: this device's secure random generator isn't available");
  assert.equal(E.getRngSource(), "unavailable");
  Object.defineProperty(globalThis, "crypto", desc);
  const restored = E.rollDice();
  assert.equal(restored.ok, true);
  assert.equal(E.getRngSource(), "secure");
  const buf = new Uint32Array(1);
  let draws = 0;
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      getRandomValues(arr) {
        draws += 1;
        arr[0] = draws < 3 ? 4294967295 : 7;
        return arr;
      },
    },
  });
  const redrawn = E.rollDie();
  Object.defineProperty(globalThis, "crypto", desc);
  assert.ok(draws >= 3);
  assert.equal(redrawn, (7 % 6) + 1);
});

test("point-made fires only when the point is made", () => {
  const faces = [];
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) faces.push([a, b]);
  for (const profile of ["bubble", "table"]) {
    faces.forEach(([d1, d2]) => {
      const g = E.placeBet(E.createGame(profile === "table" ? { profile: "table" } : {}), { kind: "pass" }, 1000).state;
      const s = E.settle(g, d1, d2);
      assert.equal(PT.pointMade(s.result), false);
    });
    for (const point of [4, 5, 6, 8, 9, 10]) {
      const a = point <= 6 ? 1 : point - 6;
      const b = point - a;
      faces.forEach(([d1, d2]) => {
        let g = E.placeBet(E.createGame(profile === "table" ? { profile: "table" } : {}), { kind: "pass" }, 1000).state;
        g = E.settle(g, a, b).state;
        const s = E.settle(g, d1, d2);
        assert.equal(PT.pointMade(s.result), d1 + d2 === point);
      });
    }
  }
});

test("change-making and color-up keep value", () => {
  const rng = xoshiro128ss(20261012);
  for (let i = 0; i < 20000; i++) {
    const cents = Math.floor(rng() * 150000);
    let rail = Rail.railBreakdown(cents);
    const bet = 1 + Math.floor(rng() * Math.max(1, Rail.railTotal(rail)));
    const before = Rail.railTotal(rail);
    if (bet <= before) {
      const paid = Rail.railPay(rail, bet);
      assert.equal(paid.ok, true, "pay " + bet + " from " + before);
      assert.equal(Rail.railTotal(paid.rail), before - bet);
      rail = paid.rail;
    }
    const credit = Math.floor(rng() * 8000);
    const credited = Rail.railCredit(rail, credit);
    assert.equal(Rail.railTotal(credited.rail), Rail.railTotal(rail) + credit);
    const up = Rail.railColorUp(credited.rail);
    assert.equal(Rail.railTotal(up.rail), Rail.railTotal(credited.rail));
    assert.ok(Rail.railMatches(up.rail, Rail.railTotal(up.rail)));
  }
});

test("seeded dice pass a chi-square and an independence check", () => {
  const n = 1000000;
  const dice = diceFromSeed(99, n);
  const faces1 = [0, 0, 0, 0, 0, 0];
  const faces2 = [0, 0, 0, 0, 0, 0];
  const totals = [];
  for (let t = 2; t <= 12; t++) totals.push(0);
  const cells = Array.from({ length: 36 }, () => 0);
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
  let prev = dice[0][0] + dice[0][1];
  let sevens = 0, after = 0;
  for (let i = 0; i < n; i++) {
    const d1 = dice[i][0], d2 = dice[i][1], total = d1 + d2;
    faces1[d1 - 1] += 1;
    faces2[d2 - 1] += 1;
    totals[total - 2] += 1;
    cells[(d1 - 1) * 6 + (d2 - 1)] += 1;
    if (i) {
      sx += prev; sy += total; sxx += prev * prev; syy += total * total; sxy += prev * total;
      if (prev === 7) { after += 1; if (total === 7) sevens += 1; }
    }
    prev = total;
  }
  const expF = faces1.map(() => n / 6);
  const expT = totals.map((_, i) => n * Fair.expectedRate(i + 2));
  assert.ok(Fair.chiSquareP(Fair.chiSquare(faces1, expF), 5) >= 0.001);
  assert.ok(Fair.chiSquareP(Fair.chiSquare(faces2, expF), 5) >= 0.001);
  assert.ok(Fair.chiSquareP(Fair.chiSquare(totals, expT), 10) >= 0.001);
  const expC = cells.map(() => n / 36);
  assert.ok(Fair.chiSquareP(Fair.chiSquare(cells, expC), 35) >= 0.001);
  const m = n - 1;
  const num = m * sxy - sx * sy;
  const den = Math.sqrt((m * sxx - sx * sx) * (m * syy - sy * sy));
  assert.ok(Math.abs(num / den) < 4 / Math.sqrt(m));
  assert.ok(Math.abs(sevens / after - 6 / 36) < 0.005);
});

test("crypto rolls pass chi-square", () => {
  const n = 1000000;
  const faces = [0, 0, 0, 0, 0, 0];
  const totals = [];
  for (let t = 0; t < 11; t++) totals.push(0);
  for (let i = 0; i < n; i++) {
    const d = E.rollDice();
    faces[d.d1 - 1] += 1;
    totals[d.d1 + d.d2 - 2] += 1;
  }
  assert.ok(Fair.chiSquareP(Fair.chiSquare(faces, faces.map(() => n / 6)), 5) >= 0.001);
  assert.ok(Fair.chiSquareP(Fair.chiSquare(totals, totals.map((_, i) => n * Fair.expectedRate(i + 2))), 10) >= 0.001);
  assert.equal(E.getRngSource(), "secure");
});

test("set dice are not an argument to the live roll", () => {
  const ui = readFileSync(new URL("../js/table-ui.mjs", import.meta.url), "utf8");
  assert.match(ui, /E\.rollDice\(\)/);
  assert.equal(/rollDice\([^)]*set/.test(ui), false);
  assert.equal(/influence|srr|rollNonSeven|skill-sim/.test(ui), false);
});

test("production bundle strips hooks", () => {
  const built = spawnSync("node", ["scripts/build.mjs"], { encoding: "utf8" });
  assert.equal(built.status, 0, built.stderr);
  const ui = readFileSync(new URL("../dist/js/ui.mjs", import.meta.url), "utf8");
  const flags = readFileSync(new URL("../dist/js/build-flags.mjs", import.meta.url), "utf8");
  const engine = readFileSync(new URL("../dist/js/engine.mjs", import.meta.url), "utf8");
  assert.match(flags, /TEST_BUILD = false/);
  assert.equal(/__bb/.test(ui), false);
  assert.equal(/Math\.random\(/.test(engine), false);
  assert.equal(/cash out|cash-out/i.test(ui + readFileSync(new URL("../dist/js/table-ui.mjs", import.meta.url), "utf8")), false);
  const bubbleLingo = readFileSync(new URL("../dist/js/lingo.json", import.meta.url), "utf8");
  const tableLingo = readFileSync(new URL("../dist/js/lingo.table.json", import.meta.url), "utf8");
  const tableMod = readFileSync(new URL("../dist/js/lingo-table.mjs", import.meta.url), "utf8");
  assert.equal(/\bFire\b/.test(bubbleLingo), false);
  assert.equal(/fire_bet/.test(bubbleLingo), false);
  assert.match(tableLingo, /fire_bet/);
  assert.match(tableLingo, /Fire Bet/);
  assert.match(tableMod, /from "\.\/lingo\.table\.json"/);
});

test("tutor field line and long-shot gate", () => {
  assert.equal(E.tutorEdgeNote({ kind: "field" }, "regular", false), "Field: wins on 16 of 36 rolls, but the 5–8 numbers lose. 5.56% edge.");
  assert.equal(E.isLongShot({ kind: "place", number: 6 }), false);
  assert.equal(E.isLongShot({ kind: "hardway", number: 8 }), true);
  assert.equal(E.isLongShot({ kind: "big6" }), false);
  assert.ok(E.tutorEdgeNote({ kind: "big6" }, "regular", false).includes("High house edge"));
  assert.equal(E.edgeFor({ kind: "big6" }), 9.09);
});

test("free and premium split is 16 and 8", () => {
  assert.equal(TS.TABLE_STRATEGIES.length, 24);
  assert.equal(TS.TABLE_STRATEGIES.filter((c) => c.tier === "free").length, 16);
  assert.equal(TS.TABLE_STRATEGIES.filter((c) => c.tier === "premium").length, 8);
  assert.ok(TS.TABLE_STRATEGIES.every((c) => c.end === "No system beats the edge. Practice chips only."));
  assert.equal(TS.strategyById("T24").name, "Inside + Lay the Outside");
});
