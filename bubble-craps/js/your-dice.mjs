/**
 * Your Dice mode (rev 16 S9). Entered rolls never call rollDie or rollDice.
 * dice_source is "entered". They stay out of Fair Dice, badges, and the leaderboard.
 */

export const BANNER = "YOUR DICE · you enter the rolls";
export const ONBOARD = "Your Dice: roll real dice and enter them. The app pays them exactly like its own rolls. These rolls don't go into Fair Dice, badges or the Longest Roll board.";
export const TAG = "YOURS";

export const EXCLUSIONS = ["fair", "rng", "leaderboard", "badges", "comparison", "history", "rates"];

const PAIRS = [];
for (let a = 1; a <= 6; a++) {
  for (let b = a; b <= 6; b++) PAIRS.push([a, b]);
}
export const PAIR_PAD = PAIRS;

export function canEnter(handRolls) {
  return (handRolls || 0) === 0;
}

export function blockReason(handRolls) {
  return canEnter(handRolls) ? "" : "Finish this hand first";
}

/** Parse "6-4, 3-3, 5-2" or CSV die1,die2 rows. Order is kept. */
export function parseSequence(text) {
  const raw = String(text || "");
  const out = [];
  const lines = raw.split(/\n/);
  lines.forEach((line) => {
    if (/die1/i.test(line) && /die2/i.test(line)) return;
    const bits = line.split(/[,;]+/);
    bits.forEach((bit) => {
      const m = String(bit).match(/([1-6])\s*[-./]\s*([1-6])/);
      if (m) out.push({ d1: Number(m[1]), d2: Number(m[2]) });
    });
  });
  return out;
}

export function pairFromFaces(d1, d2) {
  const a = Math.round(Number(d1));
  const b = Math.round(Number(d2));
  if (a < 1 || a > 6 || b < 1 || b > 6) return null;
  return { d1: a, d2: b, source: "entered" };
}

/** Entered rolls are a different record. They are not an RNG draw. */
export function countsFor(kind) {
  return EXCLUSIONS.indexOf(kind) < 0;
}

export function freshMode(startChips) {
  return {
    on: true,
    pending: null,
    queue: [],
    undo: null,
    recent: [],
    startChips: startChips || 0,
  };
}
