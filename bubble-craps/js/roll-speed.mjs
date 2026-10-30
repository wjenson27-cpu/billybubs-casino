/**
 * Roll speed (rev 16 S11). Free. Normal is the default.
 * Every speed settles the same roll. Reduce motion wins when it is shorter.
 */

export const SPEEDS = ["normal", "fast", "instant"];

export function normalizeSpeed(speed) {
  return SPEEDS.indexOf(speed) >= 0 ? speed : "normal";
}

/** Shooter practice never goes past Fast. */
export function capSpeed(speed, practice) {
  const s = normalizeSpeed(speed);
  if (practice && s === "instant") return "fast";
  return s;
}

function pick(speed, reduced, table) {
  const s = normalizeSpeed(speed);
  const chosen = table[s];
  if (reduced && chosen > table.instant) return Math.min(chosen, table.reduced != null ? table.reduced : table.instant);
  if (reduced) return Math.min(chosen, table.instant);
  return chosen;
}

/** Dice tumble / throw. Normal is the 1,180 ms tumble (CSS pair is 1,100 / 1,180). Fast is about 420. */
export function diceMs(speed, reduced) {
  return pick(speed, reduced, { normal: 1180, fast: 420, instant: 150, reduced: 180 });
}

/** Point-made Base / Big / Huge. PM-10 is Base 1.2 / Big 2.0 / Huge 2.5 (rev 15c). */
export function celebrateMs(tier, speed, reduced) {
  const s = normalizeSpeed(speed);
  const quiet = reduced && s === "normal";
  if (s === "instant") return tier === "base" && !reduced ? 800 : 800;
  if (s === "fast") {
    if (tier === "huge") return 1500;
    if (tier === "big") return 1200;
    return 800;
  }
  if (quiet || reduced) return 1200;
  if (tier === "huge") return 2500;
  if (tier === "big") return 2000;
  return 1200;
}

/** PSO light/base and long/big. */
export function psoMs(long, speed) {
  const s = normalizeSpeed(speed);
  if (s === "instant") return long ? 800 : 600;
  if (s === "fast") return long ? 1200 : 800;
  return long ? 2000 : 1200;
}

export const AUTO_INTERVALS = [10, 15, 20, 30];
