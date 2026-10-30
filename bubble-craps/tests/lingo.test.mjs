import test from "node:test";
import assert from "node:assert/strict";
import * as Lg from "../js/lingo.mjs";
import * as B from "../js/badges.mjs";

test("lingo schema, counts, and bubble never ships Fire", () => {
  assert.deepEqual(Lg.lintTerms(), []);
  assert.equal(Lg.termsFor("bubble").length, 78);
  assert.equal(Lg.termsFor("table").length, 79);
  assert.equal(Lg.termById("fire_bet", "bubble"), null);
  assert.ok(Lg.termById("fire_bet", "table"));
});

test("crapless notes stay in crapless", () => {
  const dont = Lg.termById("dont_pass", "bubble");
  assert.equal(Lg.noteFor(dont, "bubble", "regular"), "");
  assert.equal(Lg.noteFor(dont, "table", "regular"), "");
  assert.match(Lg.noteFor(dont, "bubble", "crapless"), /Don't side/);
  assert.match(Lg.noteFor(dont, "table", "crapless"), /Don't side/);
  const field = Lg.termById("field", "bubble");
  assert.doesNotMatch(Lg.noteFor(field, "bubble", "regular"), /Not in Crapless/);
  assert.doesNotMatch(Lg.noteFor(field, "table", "regular"), /Not in Crapless/);
});

test("lingo search fixtures", () => {
  const nina = Lg.search("nina", "bubble").hits.map((t) => t.id);
  assert.equal(nina[0], "nina");
  assert.ok(nina.indexOf("center_field_nine") > 0);
  const nine = Lg.search("nine", "bubble").hits.map((t) => t.id);
  assert.equal(nine[0], "nina");
  assert.ok(nine.indexOf("center_field_nine") > 0);
  assert.equal(Lg.search("yo", "bubble").hits[0].id, "yo");
  assert.equal(Lg.search("yoleven", "bubble").hits[0].id, "yo");
  assert.equal(Lg.search("eleven", "bubble").hits[0].id, "yo");
  assert.equal(Lg.search("c and e", "bubble").hits[0].id, "ce");
  assert.equal(Lg.search("c&e", "bubble").hits[0].id, "ce");
  assert.equal(Lg.search("ce", "bubble").hits[0].id, "ce");
  const seven = Lg.search("seven", "bubble").hits.map((t) => t.id);
  assert.equal(seven[0], "big_red");
  assert.ok(seven.indexOf("seven_out") > 0);
  const jimmy = Lg.search("jimmy hix", "bubble");
  assert.equal((jimmy.hits[0] || jimmy.didYouMean[0]).id, "jimmy_hicks");
  assert.equal(Lg.search("boxcar", "bubble").hits[0].id, "boxcars");
  const whirl = Lg.search("whril", "bubble");
  assert.equal((whirl.hits[0] || whirl.didYouMean[0]).id, "whirl");
  assert.equal(Lg.search("hardway", "table").hits[0].id, "hardways");
  assert.equal(Lg.search("fire", "table").hits[0].id, "fire_bet");
  assert.equal(Lg.search("fire", "bubble").hits.length, 0);
  assert.ok(Lg.search("fire", "bubble").didYouMean.length);
  assert.equal(Lg.search("cash out", "bubble").hits.length, 0);
  assert.equal(Lg.search("cash out", "bubble").didYouMean.length, 0);
  assert.equal(Lg.search("tip", "bubble").hits[0].id, "toke");
  assert.match(Lg.EMPTY, /field/);
});

test("roll calls come from the roll object", () => {
  assert.equal(Lg.callTermId({ result: "seven-out", total: 7, phaseBefore: "point" }), "seven_out");
  assert.equal(Lg.callTermId({ result: "no-roll" }), "no_roll");
  assert.equal(Lg.callTermId({ total: 7, phaseBefore: "come-out", d1: 3, d2: 4 }), "natural");
  assert.equal(Lg.callTermId({ total: 11, d1: 5, d2: 6, phaseBefore: "point" }), "yo");
  assert.equal(Lg.callTermId({ total: 8, hard: true, d1: 4, d2: 4, phaseBefore: "point" }), "hard_eight");
  assert.equal(Lg.callTermId({ total: 8, hard: false, d1: 3, d2: 5, phaseBefore: "point" }), "easy_eight");
  assert.equal(Lg.callTermId({ total: 9, d1: 4, d2: 5, phaseBefore: "point" }), "center_field_nine");
  assert.equal(Lg.callTerm( { total: 11, d1: 5, d2: 6, phaseBefore: "come-out" }, "bubble").id, "yo");
});

test("Talk the Talk counts cards, not bets, and survives a bankroll reset", () => {
  let store = { badges: {}, progress: {} };
  store = B.noteAction(store, { type: "roll-started" }).store;
  assert.equal(store.badges.talk_the_talk, undefined);
  for (let i = 0; i < 24; i++) store = B.noteAction(store, { type: "lingo", id: "t" + i }).store;
  assert.equal(store.badges.talk_the_talk, undefined);
  store = B.noteAction(store, { type: "lingo", id: "t24" }).store;
  assert.ok(store.badges.talk_the_talk);
  const seen = store.progress.lingoSeen.length;
  store = B.noteAction(store, { type: "reset-bankroll", total: 100000 }).store;
  assert.equal(store.progress.lingoSeen.length, seen);
});
