import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../js/engine.mjs";

const $ = (n) => Math.round(n * 100);

function game(mode = "regular", bankroll = $(5000)) {
  return E.createGame({ mode, bankroll });
}

function roll(state, total, hard = false) {
  const easy = { 2: [1, 1], 3: [1, 2], 4: [1, 3], 5: [1, 4], 6: [1, 5], 7: [1, 6], 8: [2, 6], 9: [3, 6], 10: [4, 6], 11: [5, 6], 12: [6, 6] };
  const pair = hard ? [total / 2, total / 2] : easy[total];
  return E.settle(state, pair[0], pair[1]);
}

function point(state, n) {
  const res = roll(state, n, n === 2 || n === 12);
  assert.equal(res.result, "point-set");
  return res.state;
}

function hit(mode, kind, number, stake) {
  const anchor = number === 6 ? 8 : 6;
  let g = point(game(mode), anchor);
  g = E.placeBet(g, { kind, number }, stake).state;
  g = roll(g, number, number === 2 || number === 12).state;
  return g;
}

test("every on-ladder step matches Bill's Give and Get", () => {
  const steps = [
    { kind: "place", n: 6, from: 600, to: 1800, toKind: "place", give: 500 },
    { kind: "place", n: 6, from: 1800, to: 4200, toKind: "place", give: 300 },
    { kind: "place", n: 6, from: 4200, to: 9000, toKind: "place", give: -100 },
    { kind: "place", n: 6, from: 9000, to: 21000, toKind: "place", give: 1500 },
    { kind: "place", n: 6, from: 21000, to: 45000, toKind: "place", give: -500 },
    { kind: "place", n: 4, from: 500, to: 1500, toKind: "place", give: 100 },
    { kind: "place", n: 4, from: 1500, to: 4000, toKind: "buy", give: -200 },
    { kind: "buy", n: 4, from: 4000, to: 10000, toKind: "buy", give: -1800 },
    { kind: "buy", n: 4, from: 10000, to: 30000, toKind: "buy", give: 500 },
    { kind: "buy", n: 4, from: 30000, to: 90000, toKind: "buy", give: 1500 },
    { kind: "buy", n: 4, from: 500, to: 1500, toKind: "buy", give: 25 },
    { kind: "buy", n: 4, from: 1500, to: 4000, toKind: "buy", give: -425 },
    { kind: "place", n: 5, from: 500, to: 1500, toKind: "place", give: 300 },
    { kind: "place", n: 5, from: 1500, to: 3600, toKind: "buy", give: 0 },
    { kind: "buy", n: 5, from: 3600, to: 8600, toKind: "buy", give: -220 },
    { kind: "buy", n: 5, from: 8600, to: 20000, toKind: "buy", give: -1070 },
    { kind: "buy", n: 5, from: 20000, to: 50000, toKind: "buy", give: 1000 },
    { kind: "buy", n: 5, from: 500, to: 1500, toKind: "buy", give: 275 },
    { kind: "buy", n: 5, from: 1500, to: 3600, toKind: "buy", give: -75 },
    { kind: "buy", n: 2, from: 500, to: 3500, toKind: "buy", give: 25, mode: "crapless" },
    { kind: "buy", n: 2, from: 3500, to: 25000, toKind: "buy", give: 675, mode: "crapless" },
    { kind: "buy", n: 3, from: 500, to: 2000, toKind: "buy", give: 25, mode: "crapless" },
    { kind: "buy", n: 3, from: 2000, to: 8000, toKind: "buy", give: 100, mode: "crapless" },
    { kind: "buy", n: 3, from: 8000, to: 32000, toKind: "buy", give: 400, mode: "crapless" },
  ];
  for (const s of steps) {
    const g = hit(s.mode || "regular", s.kind, s.n, s.from);
    const res = E.powerPress(g);
    assert.equal(res.ok, true, s.kind + " " + s.n + " " + s.from);
    assert.equal(res.state.bets[s.toKind][s.n], s.to, "land " + s.from);
    if (s.toKind !== s.kind) assert.equal(res.state.bets[s.kind][s.n], 0);
    assert.equal(res.added, s.to - s.from);
    assert.equal(res.give || 0, Math.max(0, s.give), "give " + s.from);
    assert.equal(res.back || 0, Math.max(0, -s.give), "get " + s.from);
    assert.equal(res.state.bankroll, g.bankroll - (s.to - s.from));
    const undone = E.undoPress(res.state).state;
    assert.equal(undone.bets[s.kind][s.n], s.from, "undo " + s.from);
    if (s.toKind !== s.kind) assert.equal(undone.bets[s.toKind][s.n], 0);
    assert.equal(undone.lastWin.kind, s.kind);
  }
});

test("the top of each ladder collects", () => {
  const tops = [
    { kind: "place", n: 6, stake: 45000 },
    { kind: "buy", n: 4, stake: 90000 },
    { kind: "buy", n: 5, stake: 50000 },
    { kind: "buy", n: 2, stake: 25000, mode: "crapless" },
    { kind: "buy", n: 3, stake: 32000, mode: "crapless" },
  ];
  for (const t of tops) {
    const g = hit(t.mode || "regular", t.kind, t.n, t.stake);
    const st = E.pressStatus(g);
    assert.equal(st.powerOk, false, t.n + " " + t.stake);
    assert.equal(st.powerReason, "top of the ladder · collect");
  }
});

test("off-ladder jumps to the highest step inside one unit", () => {
  let g = hit("regular", "place", 6, $(25));
  let res = E.powerPress(g);
  assert.equal(res.state.bets.place[6], $(42));
  assert.equal(res.back, $(12.16));
  assert.match(res.label, /\$42 \(get \$12\.16\)/);

  g = hit("regular", "place", 6, $(12));
  res = E.powerPress(g);
  assert.equal(res.state.bets.place[6], $(18));
  assert.equal(res.back, $(8));

  g = hit("regular", "buy", 4, $(10));
  res = E.powerPress(g);
  assert.equal(res.state.bets.buy[4], $(15));
  assert.equal(res.back, $(14.5));

  g = hit("crapless", "place", 2, $(5));
  g = E.removeBet(g, { kind: "place", number: 2 }, $(3)).state;
  g = roll(g, 2, true).state;
  res = E.powerPress(g);
  assert.equal(res.state.bets.buy[2], $(5));
  assert.equal(res.state.bets.place[2], 0);
  assert.equal(res.back, $(8));
  const undone = E.undoPress(res.state).state;
  assert.equal(undone.bets.place[2], $(2));
  assert.equal(undone.bets.buy[2], 0);

  g = hit("crapless", "place", 3, $(8));
  g = E.removeBet(g, { kind: "place", number: 3 }, $(4)).state;
  g = roll(g, 3).state;
  res = E.powerPress(g);
  assert.equal(res.state.bets.buy[3], $(20));
  assert.equal(res.give, $(5));

  g = hit("crapless", "place", 12, $(5));
  res = E.powerPress(g);
  assert.equal(res.state.bets.buy[12], $(35));
  assert.equal(res.give, $(2.5));
});

test("off-ladder with no step in range falls back to round-down", () => {
  const g = hit("regular", "buy", 6, $(5));
  const res = E.powerPress(g);
  assert.equal(res.ok, true);
  assert.match(res.label, /round-down/);
  assert.equal(res.added, $(5));
  assert.equal(res.state.bets.buy[6], $(10));
});

test("a win under $5 with no ladder step greys out", () => {
  let g = point(game(), 8);
  g = E.placeBet(g, { kind: "buy", number: 6 }, $(5)).state;
  g = E.removeBet(g, { kind: "buy", number: 6 }, $(4)).state;
  g = roll(g, 6).state;
  const st = E.pressStatus(g);
  assert.equal(st.powerOk, false);
  assert.equal(st.powerReason, "win under $5");
});
