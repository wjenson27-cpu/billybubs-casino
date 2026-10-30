/**
 * Many-seed comparison off the main thread. Cancel between seeds.
 */
import { replay } from "./replay.mjs";
import { diceFromSeed } from "./rng.mjs";
import { summarizeNets } from "./replay.mjs";

let aborted = false;

self.onmessage = async (e) => {
  const msg = e.data || {};
  if (msg.type === "cancel") {
    aborted = true;
    return;
  }
  if (msg.type !== "start") return;
  aborted = false;
  const ids = (msg.ids || []).slice(0, 6);
  const k = Math.min(1000, Math.max(1, msg.seeds || 100));
  const rolls = Math.max(1, Number(msg.rolls) || 200);
  const base = Number(msg.seed) || 1;
  const params = Object.assign({ atLimit: "stop", lean: true }, msg.params || {});
  const nets = {};
  const extras = {};
  ids.forEach((id) => {
    nets[id] = [];
    extras[id] = { expected: 0, stops: 0, goals: 0, ahead: 0 };
  });
  for (let s = 0; s < k; s++) {
    if (aborted) {
      self.postMessage({ type: "done", result: { ok: false, cancelled: true, done: s, k, summary: summarizeNets(nets, extras) } });
      return;
    }
    const dice = diceFromSeed(base + s, rolls);
    ids.forEach((id) => {
      const run = replay(dice, id, params);
      nets[id].push(run.net);
      extras[id].expected += run.expectedLoss || 0;
      if (run.stopKind === "loss") extras[id].stops += 1;
      if (run.stopKind === "goal") extras[id].goals += 1;
      if (run.net > 0) extras[id].ahead += 1;
    });
    if (s % 4 === 3 || s === k - 1) {
      self.postMessage({ type: "progress", done: s + 1, k });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  self.postMessage({ type: "done", result: { ok: true, k, rolls, summary: summarizeNets(nets, extras), cancelled: false } });
};
