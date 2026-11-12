#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "trainer", "index.html"), "utf8");
const engineMatch = html.match(/<script id="bones-engine">([\s\S]*?)<\/script>/);
const uiMatch = html.match(/<script id="bones-ui">([\s\S]*?)<\/script>/);
assert.ok(engineMatch, "bones-engine script missing");
assert.ok(uiMatch, "bones-ui script missing");
new vm.Script(uiMatch[1], { filename: "bones-ui.js" });

const sandbox = { console: console, globalThis: {} };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(engineMatch[1], sandbox, { filename: "bones-engine.js" });
const B = sandbox.BONES;
assert.ok(B, "BONES export missing");

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log("ok  " + name);
}
function same(actual, expected, message) {
  assert.strictEqual(JSON.stringify(actual), JSON.stringify(expected), message || "");
}

check("page makes no network calls", function () {
  assert.ok(!/fetch\s*\(/.test(html), "fetch(");
  assert.ok(!/XMLHttpRequest/.test(html));
  assert.ok(!/WebSocket/.test(html));
  assert.ok(!/<script[^>]+src=/.test(html));
  assert.ok(!/<link[^>]+href=/.test(html));
  assert.ok(!/googleapis|google-analytics|googletagmanager/.test(html));
});

check("strategy chart has every cell", function () {
  const ups = B.STRATEGY_6D_S17_DAS.upcards;
  same(ups, ["2", "3", "4", "5", "6", "7", "8", "9", "T", "A"]);
  const hard = [];
  for (let t = 5; t <= 20; t++) hard.push(String(t));
  const soft = [];
  for (let t = 2; t <= 9; t++) soft.push("A" + t);
  const pairs = ["22", "33", "44", "55", "66", "77", "88", "99", "TT", "AA"];
  same(Object.keys(B.STRATEGY_6D_S17_DAS.hard), hard);
  same(Object.keys(B.STRATEGY_6D_S17_DAS.soft), soft);
  same(Object.keys(B.STRATEGY_6D_S17_DAS.pairs), pairs);
  let n = 0;
  ["hard", "soft", "pairs"].forEach(function (cat) {
    Object.keys(B.STRATEGY_6D_S17_DAS[cat]).forEach(function (hand) {
      ups.forEach(function (up) {
        const code = B.strategyCell(cat, hand, up);
        assert.ok(["H", "S", "Dh", "Ds", "P"].indexOf(code) !== -1, cat + hand + up);
        const reason = B.explain(cat, hand, up, code);
        assert.ok(reason && reason.indexOf("\n") === -1);
        n += 1;
      });
    });
  });
  assert.strictEqual(n, 16 * 10 + 8 * 10 + 10 * 10);
});

check("canonical six-deck S17 DAS cells", function () {
  const cells = [
    ["hard", "16", "T", "H"],
    ["hard", "11", "A", "H"],
    ["hard", "11", "T", "Dh"],
    ["hard", "12", "2", "H"],
    ["hard", "12", "3", "H"],
    ["hard", "12", "4", "S"],
    ["hard", "9", "2", "H"],
    ["hard", "9", "3", "Dh"],
    ["soft", "A7", "A", "H"],
    ["soft", "A7", "9", "H"],
    ["soft", "A7", "2", "S"],
    ["soft", "A7", "3", "Ds"],
    ["soft", "A8", "6", "S"],
    ["soft", "A2", "4", "H"],
    ["soft", "A2", "5", "Dh"],
    ["pairs", "88", "A", "P"],
    ["pairs", "88", "T", "P"],
    ["pairs", "99", "7", "S"],
    ["pairs", "99", "T", "S"],
    ["pairs", "99", "A", "S"],
    ["pairs", "99", "8", "P"],
    ["pairs", "55", "6", "Dh"],
    ["pairs", "55", "T", "H"],
    ["pairs", "AA", "T", "P"],
    ["pairs", "TT", "6", "S"],
    ["pairs", "44", "5", "P"],
    ["pairs", "44", "4", "H"],
    ["pairs", "66", "2", "P"],
    ["pairs", "66", "7", "H"],
    ["pairs", "22", "7", "P"],
    ["pairs", "22", "8", "H"],
  ];
  cells.forEach(function (c) {
    assert.strictEqual(B.strategyCell(c[0], c[1], c[2]), c[3], c.join(" "));
  });
});

check("double fallbacks", function () {
  assert.strictEqual(B.resolveAction("Dh", true), "D");
  assert.strictEqual(B.resolveAction("Dh", false), "H");
  assert.strictEqual(B.resolveAction("Ds", true), "D");
  assert.strictEqual(B.resolveAction("Ds", false), "S");
  assert.strictEqual(B.resolveAction("P", true), "P");
  assert.strictEqual(B.actionLabel("Dh"), "Double (else Hit)");
  assert.strictEqual(B.actionLabel("Ds"), "Double (else Stand)");
  const grid = B.strategyGrid();
  grid.hard.forEach(function (row) {
    row.actions.forEach(function (code) { assert.notStrictEqual(code, "Ds"); assert.notStrictEqual(code, "P"); });
  });
  grid.soft.forEach(function (row) {
    row.actions.forEach(function (code, i) {
      assert.notStrictEqual(code, "P");
      if (code === "Ds") assert.ok(row.hand === "A7" && i >= 1 && i <= 4);
    });
  });
});

check("video poker pay table categories", function () {
  assert.strictEqual(B.payoff(["AH", "KH", "QH", "JH", "TH"]), 800);
  assert.strictEqual(B.payoff(["9H", "8H", "7H", "6H", "5H"]), 50);
  assert.strictEqual(B.payoff(["AH", "2H", "3H", "4H", "5H"]), 50);
  assert.strictEqual(B.payoff(["AS", "AH", "AD", "AC", "KH"]), 25);
  assert.strictEqual(B.payoff(["AS", "AH", "AD", "KC", "KH"]), 9);
  assert.strictEqual(B.payoff(["AH", "KH", "QH", "JH", "9H"]), 6);
  assert.strictEqual(B.payoff(["AH", "KH", "QH", "JH", "TD"]), 4);
  assert.strictEqual(B.payoff(["AH", "2C", "3D", "4S", "5H"]), 4);
  assert.strictEqual(B.payoff(["AS", "AH", "AD", "KC", "QH"]), 3);
  assert.strictEqual(B.payoff(["AS", "AH", "KD", "KC", "QH"]), 2);
  assert.strictEqual(B.payoff(["JS", "JH", "9D", "8C", "2H"]), 1);
  assert.strictEqual(B.payoff(["TS", "TH", "9D", "8C", "2H"]), 0);
  assert.strictEqual(B.payoff(["AS", "KD", "QC", "JH", "9S"]), 0);
});

check("dealt royal hold-all is 800 per coin", function () {
  const t0 = Date.now();
  const scored = B.scoreVideoPoker(["AH", "KH", "QH", "JH", "TH"]);
  const ms = Date.now() - t0;
  assert.ok(ms < 1000, "score took " + ms + "ms");
  assert.strictEqual(4000 / 5, 800);
  assert.strictEqual(scored.best.ev, 800);
  assert.strictEqual(scored.best.sum, 800);
  assert.strictEqual(scored.best.ways, 1);
  assert.strictEqual(scored.best.mask, 31);
  assert.ok(scored.holds[15].ev < 800);
});

check("four to a royal, neutral junk, about 18.66", function () {
  const scored = B.scoreVideoPoker(["AH", "KH", "QH", "JH", "9C"]);
  const hold = scored.holds.filter(function (h) { return h.heldIndices.join(",") === "0,1,2,3"; })[0];
  assert.strictEqual(hold.sum, 872);
  assert.strictEqual(hold.ways, 47);
  assert.ok(Math.abs(hold.ev - 872 / 47) < 1e-9);
  assert.ok(Math.abs(hold.ev - 18.66) < 0.15, "ev " + hold.ev);
  same(scored.best.heldIndices, [0, 1, 2, 3]);
  assert.ok(scored.holds[31].ev === 0);
  assert.ok(scored.best.ev - scored.holds[31].ev > 18);
});

check("garbage hand is a low-value discard", function () {
  const scored = B.scoreVideoPoker(["2C", "4D", "6S", "8H", "TC"]);
  assert.strictEqual(scored.best.mask, 0);
  assert.ok(scored.best.ev < 0.5);
  assert.ok(scored.best.ev > 0.3);
  assert.strictEqual(scored.holds[31].ev, 0);
  assert.ok(scored.best.ev > scored.holds[31].ev);
});

check("jacks are held over junk", function () {
  const cards = ["JH", "JD", "9C", "4S", "2H"];
  const scored = B.scoreVideoPoker(cards);
  assert.ok(scored.best.heldIndices.indexOf(0) !== -1);
  assert.ok(scored.best.heldIndices.indexOf(1) !== -1);
  assert.ok(scored.best.heldIndices.indexOf(2) === -1);
  assert.ok(scored.best.ev > 1);
  assert.strictEqual(B.payoff(cards), 1);
});

check("house edges match the published list", function () {
  const expect = [
    ["Craps", "Pass / Come", 1.41, false],
    ["Craps", "Don't Pass / Don't Come", 1.36, false],
    ["Craps", "Odds", 0, false],
    ["Craps", "Place 6 or 8", 1.52, false],
    ["Craps", "Place 5 or 9", 4, false],
    ["Craps", "Place 4 or 10", 6.67, false],
    ["Craps", "Field (2 pays 2:1, 12 pays 3:1)", 2.78, false],
    ["Craps", "Any 7", 16.67, false],
    ["Craps", "Hard 6 or 8", 9.09, false],
    ["Craps", "Hard 4 or 10", 11.11, false],
    ["Blackjack", "Basic strategy, 6 decks, S17, DAS, no surrender, 3:2", 0.5, true],
    ["Baccarat", "Banker", 1.06, false],
    ["Baccarat", "Player", 1.24, false],
    ["Baccarat", "Tie", 14.36, false],
    ["Roulette", "Single-zero (European), standard bets", 2.7, false],
    ["Roulette", "Double-zero (American), standard bets", 5.26, false],
    ["Roulette", "5-number basket (0, 00, 1, 2, 3)", 7.89, false],
    ["Video poker", "9/6 Jacks or Better, optimal play", 0.46, false],
    ["Pai Gow Poker", "Player, 5% commission", 2.7, true],
    ["Baccarat", "Player Pair", 10.36, false],
    ["Baccarat", "Banker Pair", 10.36, false],
    ["Baccarat", "Dragon Bonus (Player)", 2.65, false],
    ["Baccarat", "Dragon Bonus (Banker)", 9.37, false],
    ["Baccarat", "EZ Banker", 1.02, false],
    ["Baccarat", "Dragon 7", 7.61, false],
    ["Baccarat", "Panda 8", 10.19, false],
    ["Baccarat", "Perfect Pair", 13.03, false],
    ["Baccarat", "Either Pair", 13.71, false],
  ];
  assert.strictEqual(B.HOUSE_EDGES.length, expect.length);
  expect.forEach(function (row, i) {
    const got = B.HOUSE_EDGES[i];
    assert.strictEqual(got.game, row[0]);
    assert.strictEqual(got.bet, row[1]);
    assert.strictEqual(got.edge.toFixed(2), row[2].toFixed(2));
    assert.strictEqual(!!got.approx, row[3]);
  });
  assert.strictEqual(B.formatEdge(B.HOUSE_EDGES[2]), "0%");
  assert.strictEqual(B.formatEdge(B.findEdge("Blackjack", "Basic strategy")), "~0.5%");
  assert.strictEqual(B.formatEdge(B.findEdge("Baccarat", "Banker")), "1.06%");
  assert.strictEqual(B.formatEdge(B.findEdge("Roulette", "Single-zero")), "2.70%");
  assert.strictEqual(B.formatEdge(B.findEdge("Roulette", "5-number")), "7.89%");
  assert.strictEqual(B.formatEdge(B.findEdge("Video poker", "9/6")), "0.46%");
  assert.strictEqual(B.formatEdge(B.findEdge("Pai Gow Poker", "Player")), "~2.7%");
});

function specPlayer(pt, bt) {
  if (pt >= 8 || bt >= 8) return false;
  return pt <= 5;
}
function specBanker(bt, third) {
  if (bt <= 2) return true;
  if (bt === 3) return third !== 8;
  if (bt === 4) return third >= 2 && third <= 7;
  if (bt === 5) return third >= 4 && third <= 7;
  if (bt === 6) return third === 6 || third === 7;
  return false;
}

check("baccarat drawing tables, every total and third card", function () {
  for (let pt = 0; pt <= 9; pt++) {
    for (let bt = 0; bt <= 9; bt++) {
      assert.strictEqual(B.playerDraws(pt, bt), specPlayer(pt, bt), "player " + pt + " " + bt);
      if (pt >= 8 || bt >= 8) {
        assert.strictEqual(B.bankerDraws(bt, pt, null), false);
        for (let third = 0; third <= 9; third++) {
          assert.strictEqual(B.bankerDraws(bt, pt, third), false, "natural " + bt + " " + pt + " " + third);
        }
      } else if (!specPlayer(pt, bt)) {
        assert.strictEqual(B.bankerDraws(bt, pt, null), bt <= 5);
      } else {
        for (let third = 0; third <= 9; third++) {
          assert.strictEqual(B.bankerDraws(bt, pt, third), specBanker(bt, third), "b " + bt + " third " + third);
        }
      }
    }
  }
});

check("baccarat outcome probabilities", function () {
  const r = B.enumerateBaccarat();
  assert.ok(Math.abs(r.banker + r.player + r.tie - 1) < 1e-12);
  assert.ok(Math.abs(r.banker * 100 - 45.86) < 0.01, r.banker);
  assert.ok(Math.abs(r.player * 100 - 44.62) < 0.01, r.player);
  assert.ok(Math.abs(r.tie * 100 - 9.52) < 0.01, r.tie);
  const playerEdge = (r.player - r.banker) * 100;
  const bankerEdge = (r.banker * 0.95 - r.player) * 100;
  const tieEdge = (9 * r.tie - 1) * 100;
  assert.ok(Math.abs(-playerEdge - 1.24) < 0.02);
  assert.ok(Math.abs(-bankerEdge - 1.06) < 0.02);
  assert.ok(Math.abs(-tieEdge - 14.36) < 0.02);
});

check("baccarat settlement and dealt hands follow the rules", function () {
  assert.strictEqual(B.settleBaccarat("banker", "banker", 100), 95);
  assert.strictEqual(B.settleBaccarat("banker", "tie", 100), 0);
  assert.strictEqual(B.settleBaccarat("player", "tie", 50), 0);
  assert.strictEqual(B.settleBaccarat("player", "player", 25), 25);
  assert.strictEqual(B.settleBaccarat("player", "banker", 25), -25);
  assert.strictEqual(B.settleBaccarat("tie", "tie", 10), 80);
  assert.strictEqual(B.settleBaccarat("tie", "player", 10), -10);
  assert.strictEqual(B.settleBaccarat("banker", "player", 20), -20);
  let seed = 0x12345678;
  function next() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) >>> 0;
  }
  for (let n = 0; n < 200; n++) {
    const hand = B.playBaccarat(next);
    assert.strictEqual(hand.playerDrew, B.playerDraws(hand.playerInitial, hand.bankerInitial));
    assert.strictEqual(hand.bankerDrew, B.bankerDraws(hand.bankerInitial, hand.playerInitial, hand.playerThird));
    assert.strictEqual(hand.player.length, hand.playerDrew ? 3 : 2);
    assert.strictEqual(hand.banker.length, hand.bankerDrew ? 3 : 2);
    assert.strictEqual(hand.playerFinal, B.baccaratTotal(hand.player));
    assert.strictEqual(hand.bankerFinal, B.baccaratTotal(hand.banker));
    assert.strictEqual(hand.outcome, B.baccaratOutcome(hand.playerFinal, hand.bankerFinal));
    if (hand.playerThird !== null) assert.strictEqual(hand.playerThird, B.baccaratValueChar(hand.player[2][0]));
  }
});

function colorOf(wheel, i) {
  const p = wheel[i];
  return B.pocketColor(p);
}

check("baccarat side-bet payouts and exact edges", function () {
  function odds(name, player, banker) {
    return B.sideBetOdds(name, { player: player, banker: banker });
  }
  assert.strictEqual(odds("playerPair", ["AS", "AH"], ["2C", "3D"]), 11);
  assert.strictEqual(odds("bankerPair", ["2C", "3D"], ["KH", "KD"]), 11);
  assert.strictEqual(odds("playerPair", ["AS", "2H"], ["KH", "KD"]), -1);
  assert.strictEqual(odds("eitherPair", ["AS", "AH"], ["2C", "3D"]), 5);
  assert.strictEqual(odds("eitherPair", ["AS", "2H"], ["3C", "4D"]), -1);
  assert.strictEqual(odds("perfectPair", ["AS", "AS"], ["2C", "3D"]), 25);
  assert.strictEqual(odds("perfectPair", ["AS", "AH"], ["2C", "3D"]), -1);
  assert.strictEqual(odds("perfectPair", ["AS", "2H"], ["KD", "KD"]), 25);
  assert.strictEqual(odds("dragonPlayer", ["AS", "8S"], ["2C", "5D"]), 1);
  assert.strictEqual(odds("dragonPlayer", ["2C", "3D", "4H"], ["TS", "KC"]), 30);
  assert.strictEqual(odds("dragonPlayer", ["AS", "8S"], ["KH", "9D"]), 0);
  assert.strictEqual(odds("dragonBanker", ["2C", "3D"], ["KH", "9D"]), 1);
  assert.strictEqual(odds("dragon7", ["AS", "2D"], ["2C", "3D", "2H"]), 40);
  assert.strictEqual(odds("dragon7", ["9S", "9D"], ["2C", "3D", "2H"]), -1);
  assert.strictEqual(odds("panda8", ["2C", "2D", "4H"], ["AS", "2H"]), 25);
  assert.strictEqual(odds("ezBanker", ["AS", "2D"], ["2C", "3D", "2H"]), 0);
  assert.strictEqual(odds("ezBanker", ["2C", "3D"], ["KH", "9D"]), 1);
  assert.strictEqual(odds("ezBanker", ["AS", "8S"], ["2C", "5D"]), -1);
  const edges = B.enumerateSideEdges();
  const expect = {
    playerPair: 10.36,
    bankerPair: 10.36,
    dragonPlayer: 2.65,
    dragonBanker: 9.37,
    ezBanker: 1.02,
    dragon7: 7.61,
    panda8: 10.19,
    perfectPair: 13.03,
    eitherPair: 13.71,
  };
  Object.keys(expect).forEach(function (key) {
    assert.ok(Math.abs(edges[key] - expect[key]) < 0.02, key + " " + edges[key]);
    const row = B.HOUSE_EDGES.filter(function (r) {
      return r.game === "Baccarat" && Math.abs(r.edge - expect[key]) < 0.02 &&
        ((key === "playerPair" && r.bet === "Player Pair") ||
         (key === "bankerPair" && r.bet === "Banker Pair") ||
         (key === "dragonPlayer" && r.bet.indexOf("Dragon Bonus (Player)") === 0) ||
         (key === "dragonBanker" && r.bet.indexOf("Dragon Bonus (Banker)") === 0) ||
         (key === "ezBanker" && r.bet === "EZ Banker") ||
         (key === "dragon7" && r.bet === "Dragon 7") ||
         (key === "panda8" && r.bet === "Panda 8") ||
         (key === "perfectPair" && r.bet === "Perfect Pair") ||
         (key === "eitherPair" && r.bet === "Either Pair"));
    })[0];
    assert.ok(row, "sheet row " + key);
    assert.ok(Math.abs(row.edge - edges[key]) < 0.02, key + " sheet");
  });
});

check("visual wheel pocket order matches the standard wheels", function () {
  const euro = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  const american = [0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, "00", 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2];
  same(B.EURO_WHEEL, euro);
  same(B.AMERICAN_WHEEL, american);
  same(B.wheelFor("eu"), euro);
  same(B.wheelFor("us"), american);
  assert.ok(uiMatch[1].indexOf("function wheelSvg") !== -1);
  assert.ok(uiMatch[1].indexOf("B.wheelFor(variant)") !== -1);
  const fn = uiMatch[1].slice(uiMatch[1].indexOf("function wheelSvg"), uiMatch[1].indexOf("function renderRoulette"));
  assert.ok(fn.indexOf("for (let i = 0; i < n; i++)") !== -1);
  assert.ok(fn.indexOf("pockets[i]") !== -1);
  assert.ok(fn.indexOf("data-pocket") !== -1);
});

check("roulette wheels cover every pocket once", function () {
  assert.strictEqual(B.EURO_WHEEL.length, 37);
  same(B.EURO_WHEEL.slice().sort(function (a, b) { return a - b; }), [...Array(37).keys()]);
  const american = B.AMERICAN_WHEEL.slice();
  assert.strictEqual(american.length, 38);
  assert.ok(american.indexOf("00") !== -1);
  const nums = american.filter(function (p) { return p !== "00"; }).sort(function (a, b) { return a - b; });
  same(nums, [...Array(37).keys()]);
  [B.EURO_WHEEL, B.AMERICAN_WHEEL].forEach(function (wheel) {
    for (let i = 0; i < wheel.length; i++) {
      const a = colorOf(wheel, i);
      const b = colorOf(wheel, (i + 1) % wheel.length);
      if (a !== "green" && b !== "green") assert.notStrictEqual(a, b, wheel[i] + " beside " + wheel[(i + 1) % wheel.length]);
    }
    const seen = Object.create(null);
    for (let i = 0; i < wheel.length; i++) {
      const pocket = wheel[B.uniformIndex(wheel.length, function () { return i; })];
      assert.strictEqual(pocket, wheel[i]);
      seen[String(pocket)] = true;
    }
    assert.strictEqual(Object.keys(seen).length, wheel.length);
  });
  const n = 37;
  const limit = 4294967296 - (4294967296 % n);
  assert.strictEqual(limit % n, 0);
  assert.strictEqual(B.uniformIndex(n, function () { return limit - 1; }), n - 1);
  let calls = 0;
  assert.strictEqual(B.uniformIndex(n, function () {
    calls += 1;
    return calls === 1 ? limit : 5;
  }), 5);
  assert.strictEqual(calls, 2);
  assert.strictEqual(B.pocketColor(0), "green");
  assert.strictEqual(B.pocketColor("00"), "green");
  assert.strictEqual(B.pocketColor(1), "red");
  assert.strictEqual(B.pocketColor(2), "black");
});

check("every roulette payout", function () {
  const odds = {
    straight: 35, split: 17, street: 11, corner: 8, six: 5,
    dozen: 2, column: 2, red: 1, black: 1, odd: 1, even: 1, low: 1, high: 1, basket: 6,
  };
  same(B.ROULETTE_ODDS, odds);
  assert.strictEqual(B.quizProfit("corner", 5), 40);
  assert.strictEqual(B.quizProfit("straight", 5), 175);
  assert.strictEqual(B.quizProfit("split", 5), 85);
  assert.strictEqual(B.quizProfit("street", 5), 55);
  assert.strictEqual(B.quizProfit("six", 10), 50);
  assert.strictEqual(B.quizProfit("dozen", 25), 50);
  assert.strictEqual(B.quizProfit("red", 5), 5);
  assert.strictEqual(B.quizProfit("basket", 5), 30);
  ["eu", "us"].forEach(function (variant) {
    const bets = B.legalRouletteBets(variant);
    const pockets = variant === "eu" ? B.EURO_WHEEL : B.AMERICAN_WHEEL;
    const types = Object.create(null);
    bets.forEach(function (bet) {
      types[bet.type] = true;
      assert.strictEqual(bet.odds, odds[bet.type]);
      assert.strictEqual(B.rouletteEdge(variant, bet.type), bet.type === "basket" ? 7.89 : variant === "us" ? 5.26 : 2.7);
      let wins = 0;
      pockets.forEach(function (pocket) {
        const profit = B.rouletteProfit({ type: bet.type, numbers: bet.numbers, stake: 5 }, pocket);
        const covered = bet.numbers.indexOf(pocket) !== -1;
        if (covered) {
          wins += 1;
          assert.strictEqual(profit, odds[bet.type] * 5, bet.label + " " + pocket);
        } else {
          assert.strictEqual(profit, -5, bet.label + " lose " + pocket);
        }
      });
      assert.strictEqual(wins, bet.numbers.length, bet.label);
    });
    assert.strictEqual(!!types.basket, variant === "us");
    ["straight", "split", "street", "corner", "six", "dozen", "column", "red", "black", "odd", "even", "low", "high"].forEach(function (type) {
      assert.ok(types[type], variant + " " + type);
    });
    const zeroLose = ["red", "black", "odd", "even", "low", "high", "dozen", "column"];
    zeroLose.forEach(function (type) {
      const sample = bets.filter(function (b) { return b.type === type; })[0];
      assert.strictEqual(B.rouletteProfit({ type: type, numbers: sample.numbers, stake: 1 }, 0), -1);
      if (variant === "us") assert.strictEqual(B.rouletteProfit({ type: type, numbers: sample.numbers, stake: 1 }, "00"), -1);
    });
  });
  const eu = B.legalRouletteBets("eu");
  assert.ok(eu.some(function (b) { return b.type === "corner" && b.numbers.join(",") === "0,1,2,3"; }));
  const us = B.legalRouletteBets("us");
  const basket = us.filter(function (b) { return b.type === "basket"; })[0];
  same(basket.numbers, [0, "00", 1, 2, 3]);
  assert.strictEqual(B.rouletteProfit({ type: "basket", numbers: basket.numbers, stake: 5 }, "00"), 30);
  assert.strictEqual(B.rouletteProfit({ type: "basket", numbers: basket.numbers, stake: 5 }, 4), -5);
  assert.strictEqual(B.classifySelection([8, 11], "eu").type, "split");
  assert.strictEqual(B.classifySelection([1, 2, 3], "eu").type, "street");
  assert.strictEqual(B.classifySelection([1, 2, 4, 5], "eu").odds, 8);
  assert.strictEqual(B.classifySelection([0, "00", 1, 2, 3], "us").type, "basket");
  assert.strictEqual(B.classifySelection([0, "00", 1, 2, 3], "eu"), null);
});

check("EZ rail settles Tie 8:1, Dragon 7 40:1, and Panda 8 25:1", function () {
  function hand(player, banker) { return { player: player, banker: banker }; }
  function odds(name, player, banker) { return B.sideBetOdds(name, hand(player, banker)); }
  const tieCards = [["AS", "8S"], ["KH", "9D"]];
  const dragonCards = [["AS", "2D"], ["2C", "3D", "2H"]];
  const pandaCards = [["2C", "2D", "4H"], ["AS", "2H"]];
  const naturalBanker = [["2C", "3D"], ["KH", "9D"]];
  const twoCardSeven = [["AS", "2D"], ["2C", "5D"]];
  const twoCardEight = [["3C", "5D"], ["AS", "2H"]];
  const pandaLoses = [["2C", "2D", "4H"], ["4C", "5D"]];

  assert.strictEqual(odds("tie", tieCards[0], tieCards[1]), 8);
  assert.strictEqual(odds("tie", dragonCards[0], dragonCards[1]), -1);
  assert.strictEqual(odds("tie", pandaCards[0], pandaCards[1]), -1);
  assert.strictEqual(B.settleBaccarat("tie", "tie", 25), 200);
  assert.strictEqual(B.settleBaccarat("tie", "banker", 25), -25);
  assert.strictEqual(B.settleBaccarat("tie", "player", 25), -25);
  assert.strictEqual(odds("tie", tieCards[0], tieCards[1]) * 25, 200);

  assert.strictEqual(odds("dragon7", dragonCards[0], dragonCards[1]), 40);
  assert.strictEqual(odds("dragon7", twoCardSeven[0], twoCardSeven[1]), -1);
  assert.strictEqual(odds("dragon7", pandaCards[0], pandaCards[1]), -1);
  assert.strictEqual(odds("dragon7", tieCards[0], tieCards[1]), -1);
  assert.strictEqual(odds("dragon7", dragonCards[0], dragonCards[1]) * 10, 400);

  assert.strictEqual(odds("panda8", pandaCards[0], pandaCards[1]), 25);
  assert.strictEqual(odds("panda8", twoCardEight[0], twoCardEight[1]), -1);
  assert.strictEqual(odds("panda8", dragonCards[0], dragonCards[1]), -1);
  assert.strictEqual(odds("panda8", pandaLoses[0], pandaLoses[1]), -1);
  assert.strictEqual(odds("panda8", pandaCards[0], pandaCards[1]) * 10, 250);

  assert.strictEqual(odds("ezBanker", dragonCards[0], dragonCards[1]), 0);
  assert.strictEqual(odds("ezBanker", naturalBanker[0], naturalBanker[1]), 1);
  assert.strictEqual(odds("ezBanker", twoCardSeven[0], twoCardSeven[1]), 1);
  assert.strictEqual(odds("ezBanker", pandaCards[0], pandaCards[1]), -1);
  assert.strictEqual(odds("ezBanker", tieCards[0], tieCards[1]), 0);

  const stake = 10;
  let dragonProfit = B.sideBetOdds("ezBanker", hand(dragonCards[0], dragonCards[1])) * stake;
  ["tie", "dragon7", "panda8"].forEach(function (name) {
    dragonProfit += B.sideBetOdds(name, hand(dragonCards[0], dragonCards[1])) * stake;
  });
  assert.strictEqual(dragonProfit, 380);

  let pandaProfit = B.settleBaccarat("player", "player", stake);
  ["tie", "dragon7", "panda8"].forEach(function (name) {
    pandaProfit += B.sideBetOdds(name, hand(pandaCards[0], pandaCards[1])) * stake;
  });
  assert.strictEqual(pandaProfit, 240);

  let tieProfit = B.settleBaccarat("player", "tie", stake);
  ["tie", "dragon7", "panda8"].forEach(function (name) {
    tieProfit += B.sideBetOdds(name, hand(tieCards[0], tieCards[1])) * stake;
  });
  assert.strictEqual(tieProfit, 60);

  const counted = B.enumerateBaccarat();
  const tieEdge = -((9 * counted.tie - 1) * 100);
  const sideEdges = B.enumerateSideEdges();
  console.log("exact 8-deck Tie house edge " + tieEdge.toFixed(6) + "%");
  console.log("exact 8-deck Dragon 7 house edge " + sideEdges.dragon7.toFixed(6) + "%");
  console.log("exact 8-deck Panda 8 house edge " + sideEdges.panda8.toFixed(6) + "%");
  assert.ok(Math.abs(tieEdge - 14.36) < 0.02, String(tieEdge));
  assert.ok(Math.abs(sideEdges.dragon7 - 7.61) < 0.02, String(sideEdges.dragon7));
  assert.ok(Math.abs(sideEdges.panda8 - 10.19) < 0.02, String(sideEdges.panda8));
  ["Tie", "Dragon 7", "Panda 8"].forEach(function (bet) {
    const row = B.HOUSE_EDGES.filter(function (r) { return r.game === "Baccarat" && r.bet === bet; })[0];
    assert.ok(row, bet);
  });
  assert.strictEqual(B.HOUSE_EDGES.filter(function (r) { return r.game === "Baccarat" && r.bet === "Tie"; })[0].edge, 14.36);
  assert.strictEqual(B.HOUSE_EDGES.filter(function (r) { return r.game === "Baccarat" && r.bet === "Dragon 7"; })[0].edge, 7.61);
  assert.strictEqual(B.HOUSE_EDGES.filter(function (r) { return r.game === "Baccarat" && r.bet === "Panda 8"; })[0].edge, 10.19);
  assert.ok(html.indexOf("EZ Baccarat (no commission)") !== -1);
  assert.ok(html.indexOf("Tie 8:1") !== -1);
  assert.ok(html.indexOf("Dragon 7 40:1") !== -1);
  assert.ok(html.indexOf("Panda 8 25:1") !== -1);
  assert.ok(html.indexOf("bc-all-sides") === -1);
  assert.ok(html.indexOf('id="bc-side-tie"') === -1);
  assert.ok(html.indexOf("bb-trainer") !== -1);
  assert.ok(html.indexOf('data-trainer') !== -1);
});

check("pair explanations match the graded play", function () {
  const line = B.explain("pairs", "66", "4", "P");
  assert.ok(line.indexOf("Split") === 0, line);
  assert.ok(line.indexOf("Stand on hard") === -1, line);
  ["hard", "soft", "pairs"].forEach(function (cat) {
    Object.keys(B.STRATEGY_6D_S17_DAS[cat]).forEach(function (hand) {
      B.STRATEGY_6D_S17_DAS.upcards.forEach(function (up) {
        const code = B.strategyCell(cat, hand, up);
        const reason = B.explain(cat, hand, up, code);
        if (code === "P") assert.ok(/^(Always s|S)plit/.test(reason), cat + " " + hand + " " + up + " " + reason);
        if (code === "S") assert.ok(/^Stand/.test(reason), reason);
        if (code === "H") assert.ok(/Hit|hit/.test(reason) && !/^Stand/.test(reason) && !/^Split/.test(reason), reason);
        if (code === "Dh") assert.ok(/Double/.test(reason) && /Hit|hit/.test(reason), reason);
        if (code === "Ds") assert.ok(/Double/.test(reason) && /Stand|stand/.test(reason), reason);
      });
    });
  });
});

check("dealer plays to 17 and blackjack settles", function () {
  assert.strictEqual(B.bjTotal(["AS", "6D"]).total, 17);
  assert.strictEqual(B.bjTotal(["AS", "6D"]).soft, true);
  assert.strictEqual(B.bjTotal(["KH", "7D"]).total, 17);
  assert.strictEqual(B.bjTotal(["KH", "7D"]).soft, false);
  assert.strictEqual(B.bjTotal(["AH", "5D", "AH"]).total, 17);
  assert.strictEqual(B.bjTotal(["AH", "5D", "AH"]).soft, true);
  assert.strictEqual(B.bjTotal(["AS", "6D", "TC"]).total, 17);
  assert.strictEqual(B.bjTotal(["AS", "6D", "TC"]).soft, false);
  assert.strictEqual(B.dealerDraws(["AS", "6D"], false), false);
  assert.strictEqual(B.dealerDraws(["AS", "6D"], true), true);
  assert.strictEqual(B.dealerDraws(["KH", "7D"], true), false);
  assert.strictEqual(B.dealerDraws(["KH", "7D"], false), false);
  assert.strictEqual(B.dealerDraws(["KH", "6D"], false), true);
  assert.strictEqual(B.dealerDraws(["AS", "7D"], true), false);
  function boom() { throw new Error("drew"); }
  same(B.playDealer(["AS", "6D"], boom, false), ["AS", "6D"]);
  same(B.playDealer(["KH", "7D"], boom, true), ["KH", "7D"]);
  const softHit = B.playDealer(["AS", "6D"], function () { return "TC"; }, true);
  same(softHit, ["AS", "6D", "TC"]);
  assert.strictEqual(B.dealerDraws(softHit, true), false);
  const queue = ["5C", "3D", "KH"];
  const played = B.playDealer(["2C", "3D"], function () { return queue.shift(); }, false);
  same(played, ["2C", "3D", "5C", "3D", "KH"]);
  assert.strictEqual(B.bjTotal(played).total, 23);
  assert.strictEqual(queue.length, 0);
  const stiff = B.playDealer(["KH", "6D"], function () { return "5C"; }, false);
  same(stiff, ["KH", "6D", "5C"]);
  assert.strictEqual(B.blackjackProfit(["AS", "KH"], ["9C", "7D"], 10, false), 15);
  assert.strictEqual(B.blackjackProfit(["AS", "KH"], ["AD", "QH"], 10, false), 0);
  assert.strictEqual(B.blackjackProfit(["KH", "QD"], ["JC", "TD"], 10, false), 0);
  assert.strictEqual(B.blackjackProfit(["KH", "QD"], ["JC", "9D"], 10, false), 10);
  assert.strictEqual(B.blackjackProfit(["KH", "9D"], ["JC", "TD"], 10, false), -10);
  assert.strictEqual(B.blackjackProfit(["KH", "6D", "9C"], ["2C", "3D"], 10, false), -10);
  assert.strictEqual(B.blackjackProfit(["KH", "8D"], ["9C", "8D", "5S"], 10, false), 10);
  assert.strictEqual(B.blackjackProfit(["AS", "KH"], ["9C", "7D"], 10, true), 10);
  assert.strictEqual(B.blackjackProfit(["AS", "KH"], ["AD", "QH"], 10, true), -10);
  assert.strictEqual(B.blackjackProfit(["AS", "KH"], ["9C", "8D"], 2, false), 3);
  assert.strictEqual(B.blackjackProfit(["AS", "9H"], ["KH", "7D", "5C"], 2, false), 2);
});

check("baccarat play deals every card face down until it is peeled", function () {
  const ui = uiMatch[1];
  const play = ui.slice(ui.indexOf("function renderBcPlay"), ui.indexOf("function commitBcHand"));
  const deal = ui.slice(ui.indexOf("function dealBcPlay"), ui.indexOf("function renderDrawTable"));
  assert.ok(play.indexOf('squeezeHTML(c, "lp"') !== -1, "player squeeze");
  assert.ok(play.indexOf('squeezeHTML(c, "lb"') !== -1, "banker squeeze");
  assert.ok(play.indexOf("revealed ?") !== -1);
  assert.ok(play.indexOf("Every card is face down") !== -1);
  assert.ok(deal.indexOf("revealed: false") !== -1);
  assert.ok(deal.indexOf("paid: false") !== -1);
  assert.ok(deal.indexOf("state.bc.chips +=") === -1, "deal must not settle chips");
  assert.ok(deal.indexOf("state.bc.beads.push") === -1, "deal must not publish the outcome");
  assert.ok(ui.indexOf("function commitBcHand") !== -1);
  const commit = ui.slice(ui.indexOf("function commitBcHand"), ui.indexOf("function dealBcPlay"));
  assert.ok(commit.indexOf("state.bc.chips +=") !== -1);
  assert.ok(commit.indexOf("last.revealed = true") !== -1);
  assert.ok(html.indexOf(".bacc-felt .sq-back, #bc-last .sq-back { opacity: 1; background: #0A1A33;") !== -1);
  assert.ok(/\.sq, \.sq-back, #bc-last \.sq, #bc-quiz \.sq \{ touch-action: none; \}/.test(html));
  assert.ok(ui.indexOf("function peelClip") !== -1);
  assert.ok(ui.indexOf("function markPeeled") !== -1);
  assert.ok(ui.indexOf('data-act="bc-reveal"') !== -1 || html.indexOf('data-act="bc-reveal"') !== -1);
});

check("curriculum store stars, unlocks, days, streaks, and weak spots", function () {
  const blank = B.readCurriculum(null);
  assert.strictEqual(blank.version, 1);
  assert.strictEqual(blank.games.blackjack.unlocked, "beginner");
  assert.strictEqual(blank.games.blackjack.levels.beginner.stars, 0);
  assert.strictEqual(B.readCurriculum("{").version, 1);
  assert.strictEqual(B.readCurriculum('{"version":2,"games":{}}').games.baccarat.levels.sharp.stars, 0);
  assert.strictEqual(B.readCurriculum('{"version":1,"dayStreak":"nope","games":{"blackjack":{"unlocked":"nope"}}}').games.blackjack.unlocked, "beginner");

  const store = B.curriculumBlank();
  let last = null;
  for (let i = 0; i < 19; i++) last = B.curriculumRecord(store, "blackjack", "beginner", true, "hard:12:2", "2026-11-12");
  last = B.curriculumRecord(store, "blackjack", "beginner", false, "hard:12:2", "2026-11-12");
  assert.strictEqual(last.passed, true);
  assert.strictEqual(store.games.blackjack.levels.beginner.stars, 1);
  assert.strictEqual(store.games.blackjack.unlocked, "intermediate");
  assert.strictEqual(store.games.blackjack.weak["hard:12:2"].rightRow, 0);
  for (let i = 0; i < 19; i++) B.curriculumRecord(store, "blackjack", "beginner", true, "hard:12:2", "2026-11-13");
  last = B.curriculumRecord(store, "blackjack", "beginner", false, "hard:16:T", "2026-11-13");
  assert.strictEqual(last.passed, true);
  assert.strictEqual(store.games.blackjack.levels.beginner.stars, 2);
  assert.strictEqual(store.dayStreak, 2);

  const sharp = B.curriculumBlank();
  sharp.games.blackjack.unlocked = "sharp";
  for (let i = 0; i < 20; i++) last = B.curriculumRecord(sharp, "blackjack", "sharp", true, null, "2026-11-01");
  assert.strictEqual(sharp.games.blackjack.levels.sharp.stars, 3);
  assert.strictEqual(sharp.games.blackjack.levels.sharp.streak, 20);

  const weak = B.curriculumBlank();
  B.curriculumQuietSpot(weak, "blackjack", "hard:16:T", false);
  assert.strictEqual(B.curriculumDealBias(["hard:16:T"], 0.1).weak, true);
  assert.strictEqual(B.curriculumDealBias(["hard:16:T"], 0.9).weak, false);
  assert.strictEqual(B.curriculumDealBias([], 0.1).weak, false);
  B.curriculumQuietSpot(weak, "blackjack", "hard:16:T", true);
  B.curriculumQuietSpot(weak, "blackjack", "hard:16:T", true);
  assert.ok(weak.games.blackjack.weak["hard:16:T"]);
  B.curriculumQuietSpot(weak, "blackjack", "hard:16:T", true);
  assert.strictEqual(weak.games.blackjack.weak["hard:16:T"], undefined);
  assert.strictEqual(B.curriculumStarCount(store) >= 2, true);
});

check("blackjack and baccarat drills grade the live rules", function () {
  const hit = B.gradeBlackjackMove("hard", "12", "2", "H", true);
  assert.strictEqual(hit.ok, true);
  assert.strictEqual(hit.line, "Hit 12 vs 2");
  assert.strictEqual(B.gradeBlackjackMove("hard", "12", "2", "S", true).ok, false);
  assert.strictEqual(B.gradeBlackjackMove("hard", "16", "T", "H", true).line, "Hit 16 vs 10");
  assert.strictEqual(B.gradeBlackjackMove("pairs", "88", "T", "P", true).ok, true);
  assert.strictEqual(B.gradeBlackjackMove("pairs", "AA", "6", "P", true).line, "Split aces vs 6");
  assert.strictEqual(B.gradeBlackjackPayout("blackjack", 10).profit, 15);
  assert.strictEqual(B.gradeBlackjackPayout("push", 10).profit, 0);

  assert.strictEqual(B.gradeBaccaratPlayerDraw(5, 7, true).ok, true);
  assert.strictEqual(B.gradeBaccaratPlayerDraw(6, 5, false).ok, true);
  assert.strictEqual(B.gradeBaccaratPlayerDraw(6, 5, true).ok, false);
  assert.strictEqual(B.gradeBaccaratPlayerDraw(9, 7, false).line, "Player stands on 9 vs 7");
  assert.strictEqual(B.gradeBaccaratBankerDraw(3, 4, 8, false).ok, true);
  assert.strictEqual(B.gradeBaccaratBankerDraw(5, 4, 4, true).ok, true);
  assert.strictEqual(B.gradeBaccaratValue("K", 0).ok, true);
  assert.strictEqual(B.gradeBaccaratValue("A", 1).ok, true);
  assert.strictEqual(B.gradeBaccaratNatural(8, true).ok, true);
  assert.strictEqual(B.gradeBaccaratNatural(7, false).ok, true);

  const dragon = [["AS", "2D"], ["2C", "3D", "2H"]];
  const panda = [["2C", "2D", "4H"], ["AS", "2H"]];
  assert.strictEqual(B.gradeSideBetCall("dragon7", dragon[0], dragon[1], 40).ok, true);
  assert.strictEqual(B.gradeSideBetCall("dragon7", dragon[0], dragon[1], 40).line, "Dragon 7 pays 40 to 1");
  assert.strictEqual(B.gradeSideBetCall("ezBanker", dragon[0], dragon[1], 0).ok, true);
  assert.strictEqual(B.gradeSideBetCall("ezBanker", dragon[0], dragon[1], 0).line, "EZ Banker pushes");
  assert.strictEqual(B.gradeSideBetCall("panda8", panda[0], panda[1], 25).ok, true);
  assert.strictEqual(B.gradeSideBetCall("tie", ["AS", "8S"], ["KH", "9D"], 8).ok, true);
  assert.strictEqual(B.bjChartCell(["KH", "6D"]).hand, "16");
  assert.strictEqual(B.bjChartCell(["AS", "7H"]).cat, "soft");
});

console.log("\nSTRATEGY_6D_S17_DAS");
console.log("upcards " + B.STRATEGY_6D_S17_DAS.upcards.join(" "));
["hard", "soft", "pairs"].forEach(function (cat) {
  console.log(cat);
  Object.keys(B.STRATEGY_6D_S17_DAS[cat]).forEach(function (hand) {
    console.log("  " + hand + "  " + B.strategyActions(cat, hand).join(" "));
  });
});

console.log("\n" + passed + " checks passed");
