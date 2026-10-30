/**
 * Round 5b: tiers, history, Your Dice, quick bets, drills, throw timing, Bones gaps.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import * as E from "../js/engine.mjs";
import * as TR from "../js/table-rules.mjs";
import * as Tiers from "../js/tiers.mjs";
import * as H from "../js/history.mjs";
import * as YD from "../js/your-dice.mjs";
import * as QB from "../js/quick-bets.mjs";
import * as Dr from "../js/drills.mjs";
import * as RS from "../js/roll-speed.mjs";
import * as PT from "../js/point-tier.mjs";
import { pageForLink, ipadLayout, shootAct, spotSelector } from "../js/board-page.mjs";
import { orient, rotateDie, matchSetKey, SETS } from "../js/tc-dice.mjs";
import { dieSize, TIMING } from "../js/throw.mjs";
import { termById } from "../js/lingo.mjs";
import * as R5 from "../js/r5-ui.mjs";

test("Place 6/8 minimum follows the table minimum", () => {
  const five = TR.defaultRules({ tableMin: 500, tableMax: 100000 });
  const ten = TR.defaultRules({ tableMin: 1000, tableMax: 50000 });
  assert.equal(TR.tableMinFor("place", { number: 6 }, five), 600);
  assert.equal(TR.tableMinFor("place", { number: 8 }, ten), 1200);
  let g = E.createGame({ profile: "table", rules: five, bankroll: 100000 });
  assert.equal(E.placeBet(g, { kind: "place", number: 6 }, 600).ok, true);
  g = E.createGame({ profile: "table", rules: ten, bankroll: 100000 });
  assert.match(E.placeBet(g, { kind: "place", number: 6 }, 600).error, /Minimum is \$12/);
});

test("each Place 6/8 tap adds $6 once the bet is up", () => {
  assert.equal(Tiers.place68Add(0, 500, 1000, 50000), 1200);
  assert.equal(Tiers.place68Add(1200, 500, 1000, 50000), 600);
  assert.equal(Tiers.place68Add(1800, 100, 1000, 50000), 600);
  assert.equal(Tiers.place68Add(1200, 2500, 1000, 50000), 2400);
  assert.equal(Tiers.place68Add(0, 500, 500, 100000), 600);
});

test("limit tiers and Place 6/8 caps", () => {
  assert.deepEqual(Tiers.TABLE_TIERS.map((t) => [t.min, t.max]), [[1000, 50000], [2500, 200000], [10000, 500000], [50000, 2500000]]);
  assert.deepEqual(Tiers.BUBBLE_TIERS.map((t) => [t.min, t.max]), [[500, 100000], [2500, 250000], [10000, 500000]]);
  assert.equal(Tiers.place68Cap(50000), 49800);
  assert.equal(Tiers.place68Cap(200000), 199800);
  assert.equal(Tiers.place68Cap(500000), 499800);
  assert.equal(Tiers.place68Cap(2500000), 2499600);
  assert.equal(Tiers.place68Cap(100000), 99600);
  assert.equal(Tiers.place68Cap(250000), 249600);
  assert.equal(Tiers.SIDE_LIMITS.hopMax, 10000);
  assert.equal(Tiers.SIDE_LIMITS.fireMax, 1000);
  assert.equal(Tiers.premiumOnly({ odds: "10x" }), true);
  assert.equal(Tiers.premiumOnly({ odds: "345" }), false);
  assert.equal(Tiers.clampBankroll(10000000), 10000000);
  assert.equal(Tiers.clampBankroll(50), 10000);
  const queued = Tiers.queueTier({ tableMin: 1000 }, Tiers.tierById("table", "salon"), "point");
  assert.equal(queued.pending.tableMin, 50000);
  assert.equal(queued.rules.tableMin, 1000);
  const waiting = { phase: "point", rules: { tableMin: 1000 }, pendingRules: queued.pending, pendingBubble: { min: 2500, max: 250000 } };
  R5.applyPending(waiting);
  assert.equal(waiting.rules.tableMin, 1000);
  assert.equal(waiting.bubbleMin, undefined);
  waiting.phase = "come-out";
  R5.applyPending(waiting);
  assert.equal(waiting.rules.tableMin, 50000);
  assert.equal(waiting.pendingRules, null);
  assert.equal(waiting.bubbleMin, 2500);
  assert.equal(waiting.bubbleMax, 250000);
});

test("Bubble Field 12 payout follows the setting", () => {
  assert.equal(E.fieldProfit(1000, 12, { field12: 2 }), 2000);
  assert.equal(E.fieldProfit(1000, 12, { field12: 3 }), 3000);
  let g = E.createGame({ bankroll: 100000 });
  g.fieldPays = { field12: 3, field2: 2 };
  g = E.placeBet(g, { kind: "field" }, 1000).state;
  const settled = E.settle(g, 6, 6);
  const field = settled.decisions.find((d) => d.bet === "Field");
  assert.equal(field.profit, 3000);
});

test("premium presets use Strip Classic and Strip Deluxe", () => {
  const ui = readFileSync("js/ui.mjs", "utf8");
  assert.match(ui, /const presets = \["Standard", "Strip Classic", "Strip Deluxe", "Custom", "Downtown 10x"\]/);
  assert.match(ui, /"Strip Classic": "Field 5\.56% · Odds 3-4-5x · Pass\+Odds 0\.37%"/);
  assert.match(ui, /"Strip Deluxe": "Field 5\.56% → 2\.78% · Crapless odds 1-2-3-4-5x"/);
  assert.doesNotMatch(ui, /"MGM"|"Caesars"/);
  const pso = readFileSync("js/pso.mjs", "utf8");
  assert.match(pso, /clipPath/);
  assert.match(pso, /pso-clear/);
  const lingo = readFileSync("js/lingo-view.mjs", "utf8");
  assert.match(lingo, /const title = linked \? linked\.term/);
  assert.match(ui, /const hero = rows\.length \? .*billie-C-cheer/);
  assert.match(ui, /boardempty.*billie-C-hello/);
});

function engineRollPay(app, scene, d1, d2, field12) {
  const table = app === "table";
  let g = E.createGame({
    profile: table ? "table" : "bubble",
    bankroll: 5000000,
    rules: TR.defaultRules({ field2: 2, field12 }),
  });
  g.fieldPays = { field2: 2, field12 };
  const bets = scene.bets || [];
  const pass = bets.find((b) => b.kind === "pass");
  const odds = bets.find((b) => b.kind === "passOdds");
  const rest = bets.filter((b) => b.kind !== "pass" && b.kind !== "passOdds");
  if (pass) {
    g.phase = "come-out";
    g.point = null;
    const posted = E.placeBet(g, { kind: "pass" }, pass.amount, { bypassMin: true });
    assert.equal(posted.ok, true, posted.error);
    g = posted.state;
  }
  if (scene.phase === "point") {
    g.phase = "point";
    g.point = scene.point;
  }
  rest.forEach((bet) => {
    const posted = E.placeBet(g, { kind: bet.kind, number: bet.number, pair: bet.pair }, bet.amount, { bypassMin: true });
    assert.equal(posted.ok, true, (posted.error || "bet") + " " + bet.kind);
    g = posted.state;
  });
  if (odds) {
    const posted = E.placeBet(g, { kind: "passOdds" }, odds.amount, { bypassMin: true });
    assert.equal(posted.ok, true, posted.error);
    g = posted.state;
  }
  const settled = E.settle(g, d1, d2);
  return settled.decisions.filter((d) => d.result === "win").reduce((sum, d) => sum + d.profit, 0);
}

test("Pay the roll matches the engine on every roll and both Field 12 pays", () => {
  for (const app of ["bubble", "table"]) {
    const items = Dr.payTheRoll(app);
    assert.equal(items.length, 10);
    items.forEach((item) => {
      const scene = item.scene;
      assert.equal(item.answer, Dr.payFor(scene, scene.d1, scene.d2, scene.field12));
      for (const field12 of [2, 3]) {
        for (let d1 = 1; d1 <= 6; d1 += 1) {
          for (let d2 = 1; d2 <= 6; d2 += 1) {
            assert.equal(
              Dr.payFor(scene, d1, d2, field12),
              engineRollPay(app, scene, d1, d2, field12),
              app + " " + d1 + "-" + d2 + " field " + field12 + " " + item.prompt,
            );
          }
        }
      }
    });
    const twelve = items.find((item) => item.scene.d1 === 6 && item.scene.d2 === 6 && item.scene.field12 === 2);
    const triple = items.find((item) => item.scene.d1 === 6 && item.scene.d2 === 6 && item.scene.field12 === 3);
    assert.equal(twelve.answer, E.fieldProfit(500, 12, TR.defaultRules({ field12: 2 })));
    assert.equal(triple.answer, E.fieldProfit(500, 12, TR.defaultRules({ field12: 3 })));
    assert.equal(twelve.answer, 1000);
    assert.equal(triple.answer, 1500);
  }
  const taught = Dr.catalog("bubble").find((item) => item.drill === "D7");
  assert.equal(taught.answer, E.fieldProfit(500, 12, TR.defaultRules({ field12: 2 })));
});

test("Inside lingo is Buy 5/9 and Place 6/8", () => {
  const term = termById("inside", "bubble");
  assert.match(term.meaning, /Buy 5 and 9/);
  assert.match(term.meaning, /Place 6 and 8/);
  assert.equal(termById("across", "bubble").term, "Across");
});

test("session history chart, reset, and caps", () => {
  let book = H.emptyBook();
  book = H.openLive(book, { startChips: 100000, mode: "regular" });
  book = H.noteRoll(book, 98000, {});
  book = H.noteRoll(book, 110000, { sevenOut: true, length: 4 });
  book = H.closeLive(book, "end");
  assert.equal(book.sessions[0].net, 10000);
  assert.equal(book.sessions[0].hi, 110000);
  book = H.openLive(book, { startChips: 110000 });
  book = H.noteRoll(book, 90000, {});
  book = H.closeLive(book, "reset");
  assert.equal(book.sessions[0].counts, true);
  assert.equal(book.sessions[0].refillExcluded, true);
  assert.equal(book.sessions[0].rolls, 1);
  assert.equal(book.sessions[0].net, -20000);
  const tot = H.totals(book.sessions);
  assert.equal(tot.net, -10000);
  assert.equal(tot.highest, 10000);
  assert.equal(tot.sessions, 2);
  let idle = H.openLive(H.emptyBook(), { startChips: 50000, startedAt: 1 });
  idle = H.noteRoll(idle, 48000, {});
  idle.live.touchedAt = 1;
  idle = H.closeIdle(idle, H.IDLE_MS + 5);
  assert.equal(idle.live, null);
  assert.equal(idle.sessions[0].endReason, "idle");
  assert.equal(idle.sessions[0].rolls, 1);
  assert.match(H.FOOTER, /Past sessions don't predict future rolls/);
  const many = [];
  for (let i = 0; i < 220; i++) many.push({ net: i, counts: true, rolls: 1, endReason: "end" });
  const series = H.allTimeSeries(many);
  assert.equal(series.downsampled, true);
  assert.ok(series.nets.length <= 202);
  assert.equal(H.visibleSessions(book.sessions, false).length <= 20, true);
  let yours = H.emptyBook();
  yours = H.openLive(yours, { yourDice: true, startChips: 100000, label: "Your Dice" });
  yours = H.noteRoll(yours, 101000, { yourDice: true, sevenOut: true, length: 12 });
  assert.equal(yours.yourLive.longest, 0);
  yours = H.closeLive(yours, "end", true);
  assert.equal(yours.yourDice.length, 1);
  assert.equal(yours.sessions.length, 0);
  assert.equal(yours.yourDice[0].net, 1000);
});

test("Your Dice never uses the RNG path", () => {
  assert.equal(YD.canEnter(0), true);
  assert.equal(YD.blockReason(3), "Finish this hand first");
  assert.deepEqual(YD.parseSequence("6-4, 3-3\n5-2"), [{ d1: 6, d2: 4 }, { d1: 3, d2: 3 }, { d1: 5, d2: 2 }]);
  assert.equal(YD.PAIR_PAD.length, 21);
  assert.equal(YD.countsFor("fair"), false);
  assert.equal(YD.countsFor("badges"), false);
  assert.match(YD.ONBOARD, /don't go into Fair Dice/);
  let g = E.createGame({ bankroll: 100000 });
  const before = g.stats.rolls;
  g = E.placeBet(g, { kind: "pass" }, 500).state;
  const settled = E.settle(g, 3, 4, { diceSource: "entered" });
  assert.equal(settled.dice.source, "entered");
  assert.equal(settled.state.stats.rolls, before);
  assert.equal(settled.state.history.length, 0);
});

test("quick bets match the $10 and $5 fixtures", () => {
  const across = QB.plan("across", { chip: 500, tableMin: 1000, point: null, have: {} });
  assert.equal(across.total, 6400);
  const skipped = QB.plan("across", { chip: 500, tableMin: 1000, point: 6, includePoint: false, have: {} });
  assert.equal(skipped.total, 5200);
  assert.equal(skipped.live.find((s) => s.n === 6), undefined);
  const inside = QB.plan("inside", { chip: 500, tableMin: 1000, point: null, have: {} });
  assert.equal(inside.total, 4400);
  assert.deepEqual(inside.live.map((s) => s.kind), ["buy", "place", "place", "buy"]);
  const outside = QB.plan("outside", { chip: 1000, tableMin: 1000, point: null, have: {} });
  assert.equal(outside.total, 4000);
  const bubble = QB.plan("inside", { chip: 500, tableMin: 500, point: null, have: {} });
  assert.equal(bubble.total, 2200);
  const bubbleOut = QB.plan("outside", { chip: 500, tableMin: 500, point: null, have: {} });
  assert.equal(bubbleOut.total, 2000);
  let g = E.createGame({ profile: "table", bankroll: 100000 });
  const posted = QB.post(g, "inside", { chip: 1000, tableMin: 1000, point: null, have: {} });
  assert.equal(posted.ok, true);
  assert.equal(posted.state.bets.place[6], 1200);
  assert.equal(posted.state.bets.buy[5], 1000);
  const again = QB.post(posted.state, "inside", {
    chip: 500,
    tableMin: 1000,
    point: null,
    have: { 5: "buy", 6: "place", 8: "place", 9: "buy" },
    amounts: { 5: 1000, 6: 1200, 8: 1200, 9: 1000 },
  });
  assert.equal(again.ok, true);
  assert.equal(again.topped, true);
  assert.equal(again.state.bets.place[6], 1200);
  assert.equal(again.state.bets.buy[5], 1000);
  const high = QB.plan("inside", { chip: 500, tableMin: 2500, point: null, have: {} });
  assert.equal(high.total, 11000);
  assert.equal(Tiers.BANKROLL_PRESETS.includes(10000000), true);
  assert.equal(Tiers.BANKROLL_PRESETS.includes(2500000), true);
  const short = E.createGame({ profile: "table", bankroll: 100 });
  assert.equal(QB.post(short, "across", { chip: 1000, tableMin: 1000, have: {} }).ok, false);
});

test("payout drills agree with the engine", () => {
  const sweep = Dr.sweep(200);
  assert.equal(sweep.mismatches, 0);
  const round = Dr.roundOf("bubble", "rookie", 3);
  assert.equal(round.length, 10);
  round.forEach((item) => {
    assert.equal(item.choices.length, 4);
    assert.ok(item.choices.includes(item.answer));
  });
  assert.equal(Dr.scoreAnswer("rookie", true), 10);
  assert.equal(Dr.scoreAnswer("dealer", true), 20);
  assert.equal(Dr.scoreAnswer("boxman", true), 30);
  assert.equal(Dr.grade("dealer", 10).perfect, true);
  const place = Dr.catalog("bubble").find((item) => /Place 8, \$18/.test(item.prompt));
  assert.equal(place.answer, 2100);
  assert.match(Dr.FOOTER, /pays to the cent/);
});

test("roll speed and PM-10 durations", () => {
  assert.equal(RS.diceMs("normal"), 1180);
  assert.equal(RS.diceMs("fast"), 420);
  assert.equal(RS.diceMs("instant"), 150);
  assert.equal(RS.diceMs("normal", true), 180);
  assert.equal(RS.capSpeed("instant", true), "fast");
  assert.equal(PT.tierDuration("base"), 1200);
  assert.equal(PT.tierDuration("big"), 2000);
  assert.equal(PT.tierDuration("huge"), 2500);
  assert.equal(RS.celebrateMs("base", "normal"), 1200);
  assert.equal(RS.psoMs(false, "instant"), 600);
  assert.equal(TIMING.normal.dur, 1180);
  assert.equal(TIMING.fast.dur, 420);
  assert.equal(ipadLayout(844, 390), false);
  assert.equal(ipadLayout(932, 430), false);
  assert.equal(ipadLayout(1180, 820), true);
  assert.equal(ipadLayout(820, 1180), true);
  assert.equal(ipadLayout(1366, 1024), true);
  assert.equal(shootAct({ page: 1, screen: "play", ipad: false }), "go-shooter");
  assert.equal(shootAct({ page: 1, screen: "play", ipad: true }), "throw");
  assert.equal(shootAct({ page: 0, screen: "play", ipad: true }), "go-shooter");
  assert.equal(shootAct({ page: 2, screen: "play", ipad: false }), "throw");
  const pay = Dr.payTheRoll("bubble");
  assert.equal(pay.length, 10);
  assert.equal(pay.every((item) => item.drill === "D7"), true);
  assert.equal(new Set(pay.map((item) => item.prompt)).size, 10);
  assert.equal(new Set(pay.map((item) => item.answer)).size, 10);
  assert.equal(shootAct({ page: 1, screen: "play", ipad: false, yourDice: true }), "go-shooter");
  assert.equal(shootAct({ page: 2, screen: "play", ipad: false, yourDice: true }), "throw");
  assert.equal(dieSize({ width: 400, height: 700 }, "felt") >= 26, true);
  assert.equal(pageForLink("hop:1-1", "bubble"), 0);
  assert.equal(pageForLink("hop:2-3", "table"), 0);
  assert.equal(pageForLink("repeater:6", "bubble"), 0);
  assert.equal(pageForLink("fire", "table"), 0);
  assert.equal(pageForLink("hardway:8", "bubble"), 1);
  assert.equal(pageForLink("hardway:8", "table"), 1);
  assert.equal(pageForLink("any7", "bubble"), 1);
  assert.equal(pageForLink("any7", "table"), 1);
  assert.equal(pageForLink("small", "bubble"), 1);
  assert.equal(pageForLink("hardAllDay", "table"), 1);
  assert.equal(pageForLink("horn", "bubble"), 1);
  assert.equal(pageForLink("ce", "bubble"), 1);
  assert.equal(pageForLink("anyCraps", "bubble"), 1);
  assert.equal(pageForLink("place:6", "table"), 1);
  assert.equal(spotSelector("fire", "table"), ".tc-firetile");
  assert.equal(spotSelector("ui:puck", "bubble"), ".hud-puck");
  assert.equal(spotSelector("ui:puck", "table"), "[data-puck]");
  assert.equal(spotSelector("ui:pressKey", "bubble"), "[data-act='press']");
  assert.equal(spotSelector("ui:betsOff", "bubble"), "[data-act='betsoff']");
  assert.equal(spotSelector("ui:layTab", "bubble"), "[data-kind='dontPassOdds']");
});

test("badge art exists for Table Manners and Talk the Talk", () => {
  ["table_manners", "talk_the_talk", "dealers_apprentice"].forEach((id) => {
    ["", "-locked", "-locked-small", "-small"].forEach((suf) => {
      assert.equal(existsSync("assets/badges/" + id + suf + ".svg"), true, id + suf);
    });
  });
  const ui = readFileSync("js/ui.mjs", "utf8");
  const table = readFileSync("js/table-ui.mjs", "utf8");
  assert.match(ui, />= 10\)/);
  assert.match(table, />= 10\)/);
  assert.doesNotMatch(readFileSync("js/ui.mjs", "utf8"), /finish\(\); \}, 1600\)/);
  assert.doesNotMatch(readFileSync("js/ui.mjs", "utf8"), /wait\(reduce \? 180 : 1400\)/);
  assert.match(table, /if \(!entered\)/);
  assert.match(table, /closeSession\("leave"\)/);
  const r5 = readFileSync("js/r5-ui.mjs", "utf8");
  assert.match(r5, /Show as table/);
  assert.match(r5, /r5-preview/);
  assert.match(r5, /bubbleMin/);
  assert.match(r5, /stroke-dasharray/);
  assert.doesNotMatch(r5, /noteRoll\(book, worth/);
  const css = readFileSync("css/round5b.css", "utf8");
  assert.match(css, /\.app\.play \.pager/);
  assert.doesNotMatch(css, /\.app\.play \.felt \{\s*display: grid/);
  assert.match(css, /62% 38%/);
  assert.match(css, /ipadshoot/);
  assert.match(readFileSync("css/rotate.css", "utf8"), /z-index: 66/);
});

test("rotateDie turns 4 ways (left, right, front, back) with opposite faces summing to 7", () => {
  const start = orient(3, 5);
  assert.equal(start.top + start.bottom, 7);
  assert.equal(start.front + start.back, 7);
  assert.equal(start.right + start.left, 7);

  const left = rotateDie(start, "left");
  assert.equal(left.top, start.top);
  assert.equal(left.front, start.right);
  assert.equal(left.top + left.bottom, 7);
  assert.equal(left.front + left.back, 7);

  const right = rotateDie(left, "right");
  assert.deepEqual(right, start);

  const front = rotateDie(start, "front");
  assert.equal(front.top, start.front);
  assert.equal(front.front, start.bottom);
  assert.equal(front.top + front.bottom, 7);

  const back = rotateDie(front, "back");
  assert.deepEqual(back, start);

  assert.equal(matchSetKey(SETS["3V"].dice), "3V");
  assert.equal(matchSetKey(SETS["2V"].dice), "2V");
  assert.equal(matchSetKey(SETS.STRAIGHT.dice), "STRAIGHT");
  assert.equal(matchSetKey(SETS.SEVENS.dice), "SEVENS");
  assert.equal(matchSetKey([orient(5, 1), orient(6, 4)]), "CUSTOM");
});
