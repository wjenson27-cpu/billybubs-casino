/**
 * Point-made celebration rules (S4.3). Pure. Both apps use this.
 * Tiers: Base / Big / Huge, plus an optional Fire stinger on Table Craps.
 */

const WORDS = {
  2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six",
  8: "Eight", 9: "Nine", 10: "Ten", 11: "Eleven", 12: "Twelve",
};

export const BANNED_CELEBRATION = [
  "bet more", "press", "let it ride", "keep it going", "you're due",
  "hot dice", "can't lose", "on fire", "due",
];

export function pointMade(result) {
  return result === "point-made";
}

/** points is hand.points AFTER the made point is counted. */
export function celebrationTier(points, opts) {
  const o = opts || {};
  const n = points || 1;
  if (o.meterOn && o.blazing) return "huge";
  if (n >= 3) return "huge";
  if (n === 2) return "big";
  return "base";
}

/** Base 1.2s, Big 2.0s, Huge 2.5s. Quiet stays 1.2s. The Big Win tag does not change the length. */
export function tierDuration(tier, quiet) {
  if (quiet) return 1200;
  if (tier === "huge") return 2500;
  if (tier === "big") return 2000;
  return 1200;
}

export function numberWord(point) {
  return WORDS[point] || String(point || "");
}

export function billyCall(point, tier, points, hard) {
  const word = numberWord(point);
  const hardBit = hard ? "Hard " + word.toLowerCase() : word;
  if (tier === "huge") {
    const n = points || 3;
    return hardBit + "! " + n + " points this hand. What a roll.";
  }
  if (tier === "big") return hardBit + "! Two points this hand.";
  return hardBit + "! The point is made. Pass line wins.";
}

export function billieCheer(tier) {
  if (tier === "huge") return "What a hand!";
  if (tier === "big") return "Two for two!";
  return "Yesss!";
}

const FIRE_LINE = {
  4: "Fire Bet: 4 points! Pays 24 to 1 at the seven-out.",
  5: "Fire Bet: 5 points! Pays 249 to 1 at the seven-out.",
  6: "Fire Bet: all six! +$999 per $1. Paid now.",
};

/** pay is {4,5,6} multiples for the active table, or null when the player has no Fire bet. */
export function fireStinger(uniqueCount, hasBet, pay) {
  if (uniqueCount < 4 || uniqueCount > 6) return "";
  if (!hasBet) return "Fire rail: " + uniqueCount + " points.";
  const table = pay || { 4: 24, 5: 249, 6: 999 };
  if (uniqueCount === 6) {
    const m = table[6] != null ? table[6] : 999;
    return "Fire Bet: all six! +$" + m + " per $1. Paid now.";
  }
  const m = table[uniqueCount];
  if (uniqueCount === 4 && m === 24) return FIRE_LINE[4];
  if (uniqueCount === 5 && m === 249) return FIRE_LINE[5];
  return "Fire Bet: " + uniqueCount + " points! Pays " + m + " to 1 at the seven-out.";
}

export function celebrationCopy(opts) {
  const tier = opts.tier || "base";
  const quiet = !!opts.quiet;
  const call = billyCall(opts.point, tier, opts.points, opts.hard);
  const cheer = quiet ? "" : billieCheer(tier);
  const stinger = opts.stinger || "";
  const amount = !quiet && opts.net > 0 ? opts.net : 0;
  const big = !!opts.big;
  return { tier, quiet, big, call, cheer, stinger, amount, duration: tierDuration(tier, quiet) };
}

export function celebrationClean(text) {
  const low = String(text || "").toLowerCase();
  return BANNED_CELEBRATION.every((w) => low.indexOf(w) < 0);
}
