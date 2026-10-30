/** Shared chip art and stack breakdown. Both apps import this. No $10 chip. */

export const CHIP_FILE = { 100: "1", 500: "5", 2500: "25", 10000: "100", 50000: "500" };
export const CHIP_CENTS = [100, 500, 2500, 10000, 50000];

export function chipSrc(cents, mark, base) {
  const root = base || "assets/chips/";
  return root + "chip-" + (CHIP_FILE[cents] || "5") + (mark ? "-value-mark" : "-value") + ".svg";
}

export function chipPng(cents, base) {
  const root = base || "assets/chips/";
  return root + "chip-" + (CHIP_FILE[cents] || "5") + "-value-mark@64.png";
}

/** Greedy chips, largest first, capped. Same breakdown Bubble has always used. */
export function breakChips(cents, cap) {
  const limit = cap == null ? 6 : cap;
  const denoms = [50000, 10000, 2500, 500, 100];
  const chips = [];
  let left = Math.max(0, cents || 0);
  for (const d of denoms) {
    const n = Math.min(limit, Math.floor(left / d));
    for (let i = 0; i < n && chips.length < limit; i++) chips.push(d);
    left -= Math.floor(left / d) * d;
    if (chips.length >= limit) break;
  }
  return chips;
}
