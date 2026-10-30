import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../js/engine.mjs";
import * as L from "../js/leaderboard.mjs";

function dice(total, hard = false) {
  if (hard) return [total / 2, total / 2];
  const easy = {
    2: [1, 1], 3: [1, 2], 4: [1, 3], 5: [1, 4], 6: [1, 5], 7: [1, 6],
    8: [2, 6], 9: [3, 6], 10: [4, 6], 11: [5, 6], 12: [6, 6],
  };
  return easy[total];
}

function roll(state, total, hard = false) {
  const [a, b] = dice(total, hard);
  return E.settle(state, a, b);
}

function atLocal(y, m, d, h = 0, min = 0, s = 0, ms = 0) {
  return new Date(y, m - 1, d, h, min, s, ms).getTime();
}

test("a made point continues the roll and a come-out 7 does not end it", () => {
  let state = E.createGame();
  let res = roll(state, 7);
  assert.equal(res.result, "natural");
  assert.equal(res.state.phase, "come-out");
  assert.equal(res.state.hand.rolls, 1);
  assert.equal(res.state.hand.lastLength, 0);
  assert.equal(L.completedRoll({ rolls: 0, points: 0 }, res.result), null);

  for (const n of [2, 3, 12]) {
    res = roll(res.state, n);
    assert.equal(res.result, "craps");
    assert.notEqual(res.state.hand.lastLength, res.state.hand.rolls);
    assert.equal(res.state.phase, "come-out");
  }
  assert.equal(res.state.hand.rolls, 4);

  res = roll(res.state, 6);
  assert.equal(res.result, "point-set");
  assert.equal(res.state.hand.rolls, 5);
  res = roll(res.state, 6);
  assert.equal(res.result, "point-made");
  assert.equal(res.state.phase, "come-out");
  assert.equal(res.state.hand.rolls, 6);
  assert.equal(res.state.hand.points, 1);
  assert.equal(res.state.hand.lastLength, 0);

  res = roll(res.state, 11);
  assert.equal(res.result, "natural");
  assert.equal(res.state.hand.rolls, 7);
  assert.equal(res.state.phase, "come-out");

  res = roll(res.state, 8);
  assert.equal(res.result, "point-set");
  const before = { rolls: res.state.hand.rolls, points: res.state.hand.points };
  res = roll(res.state, 7);
  assert.equal(res.result, "seven-out");
  const done = L.completedRoll(before, res.result);
  assert.equal(done.throws, 9);
  assert.equal(done.points, 1);
  assert.equal(res.state.hand.lastLength, done.throws);
  assert.equal(res.state.hand.rolls, 0);
  assert.equal(res.state.hand.points, 0);
  assert.equal(res.state.phase, "come-out");
});

test("crapless: 2, 3, 11, and 12 set a point, and only a 7 with a point ends the roll", () => {
  for (const n of [2, 3, 11, 12]) {
    const opened = roll(E.createGame({ mode: "crapless" }), n, n === 2 || n === 12);
    assert.equal(opened.result, "point-set", "come-out " + n);
    assert.equal(opened.state.point, n);
    assert.equal(opened.state.hand.rolls, 1);
    assert.equal(L.completedRoll({ rolls: 0, points: 0 }, opened.result), null);
    const before = { rolls: opened.state.hand.rolls, points: opened.state.hand.points };
    const ended = roll(opened.state, 7);
    assert.equal(ended.result, "seven-out");
    assert.equal(L.completedRoll(before, ended.result).throws, 2);
    assert.equal(ended.state.hand.lastLength, 2);
  }

  let res = roll(E.createGame({ mode: "crapless" }), 7);
  assert.equal(res.result, "natural");
  assert.equal(res.state.phase, "come-out");
  assert.equal(res.state.hand.rolls, 1);
  assert.equal(res.state.hand.lastLength, 0);

  res = roll(res.state, 4);
  res = roll(res.state, 4);
  assert.equal(res.result, "point-made");
  assert.equal(res.state.hand.rolls, 3);
  assert.equal(res.state.hand.points, 1);
  assert.equal(res.state.phase, "come-out");

  res = roll(res.state, 11, false);
  assert.equal(res.result, "point-set");
  assert.equal(res.state.point, 11);
  const before = { rolls: res.state.hand.rolls, points: res.state.hand.points };
  res = roll(res.state, 7);
  const done = L.completedRoll(before, res.result);
  assert.equal(done.throws, 5);
  assert.equal(done.points, 1);
  assert.equal(res.state.hand.lastLength, 5);
  assert.equal(res.state.mode, "crapless");
});

test("this week starts Monday at local midnight and the previous week drops off", () => {
  const monday = new Date(2026, 9, 5);
  assert.equal(monday.getDay(), 1);
  const sundayNight = atLocal(2026, 10, 4, 23, 59, 59, 999);
  const mondayMidnight = atLocal(2026, 10, 5, 0, 0, 0, 0);
  const later = atLocal(2026, 10, 11, 15, 30);
  assert.equal(L.weekStart(sundayNight), atLocal(2026, 9, 28));
  assert.equal(L.weekStart(mondayMidnight), mondayMidnight);
  assert.equal(L.weekStart(later), mondayMidnight);
  assert.equal(L.weekStart(atLocal(2026, 10, 11, 0, 0)), mondayMidnight);

  let data = L.emptyData();
  const old = L.commitRoll(data, {
    throws: 20, points: 2, mode: "regular", at: sundayNight, name: "OLD",
  });
  assert.equal(old.ok, true);
  data = old.data;
  const neu = L.commitRoll(data, {
    throws: 8, points: 1, mode: "regular", at: mondayMidnight, name: "NEW",
  });
  assert.equal(neu.ok, true);
  data = neu.data;

  const week = L.ranked(data.entries, { mode: "regular", scope: "week", now: later });
  assert.deepEqual(week.map((e) => e.name), ["NEW"]);
  const all = L.ranked(data.entries, { mode: "regular", scope: "all", now: later });
  assert.deepEqual(all.map((e) => e.name), ["OLD", "NEW"]);

  const store = L.memoryStore();
  L.writeStore(store, data);
  const loaded = L.readStore(store);
  const weekAgain = L.ranked(loaded.entries, { mode: "regular", scope: "week", now: later });
  assert.deepEqual(weekAgain.map((e) => e.name), ["NEW"]);
});

test("top 10 orders by throws, then points, then earlier date, per mode", () => {
  const now = atLocal(2026, 10, 11, 12);
  const rows = [];
  for (let i = 2; i <= 12; i++) {
    rows.push({
      throws: i,
      points: 0,
      mode: "regular",
      at: now + i,
      name: "N" + String.fromCharCode(64 + i),
    });
  }
  rows.push({ throws: 9, points: 4, mode: "regular", at: now + 100, name: "PTS" });
  rows.push({ throws: 9, points: 4, mode: "regular", at: now + 50, name: "EAR" });
  rows.push({ throws: 40, points: 6, mode: "crapless", at: now, name: "CRP" });

  let data = L.emptyData();
  for (const row of rows) {
    const res = L.commitRoll(data, row);
    assert.equal(res.ok, true, row.name + " " + (res.error || ""));
    data = res.data;
  }

  const top = L.ranked(data.entries, { mode: "regular", scope: "all", now });
  assert.equal(top.length, 10);
  assert.equal(top[0].name, "NL");
  assert.equal(top[1].name, "NK");
  assert.equal(top[2].name, "NJ");
  const nine = top.filter((e) => e.throws === 9).map((e) => e.name);
  assert.deepEqual(nine, ["EAR", "PTS", "NI"]);
  assert.ok(!top.some((e) => e.name === "NB" || e.name === "NC" || e.name === "CRP"));

  const missed = L.commitRoll(data, {
    throws: 2, points: 0, mode: "regular", at: now + 200, name: "NOP",
  });
  assert.equal(missed.ok, false);
  assert.equal(missed.data.entries.length, data.entries.length);

  const tied = L.commitRoll(data, {
    throws: top[9].throws, points: top[9].points, mode: "regular", at: now + 300, name: "TIE",
  });
  assert.equal(tied.ok, false);

  const bump = L.commitRoll(data, {
    throws: top[9].throws, points: top[9].points + 1, mode: "regular", at: now + 300, name: "BMP",
  });
  assert.equal(bump.ok, true);
  assert.ok(bump.rankAll > 0 && bump.rankAll <= 10);

  const crap = L.ranked(data.entries, { mode: "crapless", scope: "all", now });
  assert.deepEqual(crap.map((e) => e.name), ["CRP"]);
  assert.equal(L.ranked(data.entries, { mode: "crapless", scope: "week", now }).length, 1);
});

test("a longer roll is a personal best and the latest entry stays highlighted", () => {
  const now = atLocal(2026, 10, 6, 9);
  let data = L.emptyData();
  const first = L.commitRoll(data, { throws: 4, points: 1, mode: "regular", at: now, name: "BIL" });
  assert.equal(first.personalBest, true);
  data = first.data;
  const second = L.commitRoll(data, { throws: 6, points: 1, mode: "regular", at: now + 1000, name: "bil" });
  assert.equal(second.ok, true);
  assert.equal(second.personalBest, true);
  assert.equal(second.entry.name, "BIL");
  data = second.data;
  assert.equal(data.highlightId, second.entry.id);
  assert.equal(data.entries.find((e) => e.id === first.entry.id).personalBest, false);
  const best = L.bestEntry(data.entries, "regular");
  assert.equal(best.id, second.entry.id);

  const shorter = L.previewRoll(data, { throws: 5, points: 3, mode: "regular", at: now + 2000 });
  assert.equal(shorter.personalBest, false);
  assert.equal(shorter.madeAll, true);

  const store = L.memoryStore();
  L.writeStore(store, data);
  const again = L.readStore(store);
  assert.equal(again.highlightId, second.entry.id);
  assert.equal(again.name, "BIL");
  assert.equal(L.readStore(L.memoryStore({ [L.STORE_KEY]: "{" })).entries.length, 0);
});

test("initials are 1 to 3 letters, blank is allowed, and the blocklist refuses a save", () => {
  assert.equal(L.normalizeName(" bil "), "BIL");
  assert.equal(L.normalizeName("bubbles"), "");
  assert.equal(L.normalizeName("  billie  bubs  "), "");
  assert.equal(L.normalizeName(""), "");
  assert.equal(L.normalizeName("!!!"), "");
  assert.equal(L.normalizeInitials("FUK").blocked, true);
  assert.equal(L.normalizeInitials("BJ").ok, true);
  assert.equal(L.normalizeInitials("BJ").value, "BJ");
  assert.equal(L.normalizeInitials("NIG").blocked, true);
  const now = atLocal(2026, 10, 11, 12);
  const skipped = L.commitRoll(L.emptyData(), {
    throws: 12, points: 1, mode: "regular", at: now, initials: "",
  });
  assert.equal(skipped.ok, true);
  assert.equal(skipped.entry.name, "—");
  assert.equal(skipped.entry.initials, "");
  assert.equal(skipped.data.initials.asked, true);
  const blocked = L.commitRoll(L.emptyData(), {
    throws: 12, points: 1, mode: "regular", at: now, initials: "FUK",
  });
  assert.equal(blocked.ok, false);
  assert.match(blocked.error, /Try different letters/);
  const idle = L.commitRoll(L.emptyData(), {
    throws: 12, points: 1, mode: "regular", at: now, initials: "BIL", hadBetOnSevenOut: false,
  });
  assert.equal(idle.ok, false);
  const testRoll = L.commitRoll(L.emptyData(), {
    throws: 12, points: 1, mode: "regular", at: now, initials: "BIL", rngSource: "test",
  });
  assert.equal(testRoll.ok, false);
  const posted = L.commitRoll(L.emptyData(), {
    throws: 12, points: 1, mode: "regular", at: now, initials: "BIL",
    sevenOutDice: { d1: 3, d2: 4 },
  });
  assert.equal(posted.ok, true);
  assert.deepEqual(posted.entry.sevenOutDice, { d1: 3, d2: 4 });
  const store = L.memoryStore();
  L.writeStore(store, posted.data);
  assert.deepEqual(L.readStore(store).entries[0].sevenOutDice, { d1: 3, d2: 4 });
  const bad = L.commitRoll(L.emptyData(), {
    throws: 12, points: 1, mode: "regular", at: now, initials: "BIL",
    sevenOutDice: { d1: 6, d2: 6 },
  });
  assert.equal(bad.entry.sevenOutDice, null);
});

test("a pending record card survives a reload", () => {
  const store = L.memoryStore();
  const pending = { throws: 8, points: 1, rolls: 8, pointsMade: 1, mode: "regular", at: Date.now() };
  const data = Object.assign(L.emptyData(), { pending });
  L.writeStore(store, data);
  const back = L.readStore(store);
  assert.equal(back.pending.throws, 8);
  assert.equal(back.pending.mode, "regular");
  assert.equal(back.initials.asked, false);
});
