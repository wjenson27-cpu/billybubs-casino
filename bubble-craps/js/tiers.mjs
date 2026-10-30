/**
 * Limit tiers and bankroll presets (rev 16 S10). Cents.
 * Side-bet limits do not change with the tier.
 */

export const BANKROLL_MIN = 10000;
export const BANKROLL_MAX = 10000000;
export const BANKROLL_PRESETS = [50000, 100000, 250000, 500000, 1000000, 2500000, 10000000];

export const TABLE_TIERS = [
  { id: "standard", name: "Standard", min: 1000, max: 50000, bankroll: 100000 },
  { id: "high", name: "High limit", min: 2500, max: 200000, bankroll: 200000 },
  { id: "roller", name: "High roller", min: 10000, max: 500000, bankroll: 500000 },
  { id: "salon", name: "Salon", min: 50000, max: 2500000, bankroll: 2500000 },
];

export const BUBBLE_TIERS = [
  { id: "standard", name: "Standard", min: 500, max: 100000, bankroll: 100000 },
  { id: "high", name: "High limit", min: 2500, max: 250000, bankroll: 250000 },
  { id: "roller", name: "High roller", min: 10000, max: 500000, bankroll: 500000 },
];

export const ODDS_FREE = "345";
export const ODDS_ALL = ["1x", "2x", "345", "5x", "10x", "20x", "100x"];

export const SIDE_LIMITS = {
  prop: 100,
  repeaterMin: 100,
  repeaterMax: 2500,
  hopMin: 100,
  hopMax: 10000,
  fireMin: 100,
  fireMax: 1000,
  horn: 400,
  ce: 200,
};

export function tiersFor(app) {
  return app === "table" ? TABLE_TIERS : BUBBLE_TIERS;
}

export function tierById(app, id) {
  return tiersFor(app).find((t) => t.id === id) || tiersFor(app)[0];
}

/** Largest $6 step that is still at or under the table max. */
export function place68Cap(maxCents) {
  const max = Math.max(0, Math.round(Number(maxCents) || 0));
  return Math.floor(max / 600) * 600;
}

/** Smallest $6 step that meets the table minimum. $5 → $6, $10 → $12. */
export function place68Min(tableMin) {
  const min = Math.max(0, Math.round(Number(tableMin) || 0));
  return Math.ceil(min / 600) * 600;
}

/**
 * Amount added by one Place 6/8 tap.
 * First tap posts the minimum ($12 at a $10 table, $6 at a $5 table).
 * Once a Place 6/8 is up, a $1 or $5 chip adds $6. A $25 chip adds $24.
 */
export function place68Add(have, chip, tableMin, tableMax) {
  const up = Math.max(0, Math.round(have || 0));
  const cap = place68Cap(tableMax);
  const room = Math.max(0, cap - up);
  const c = Math.round(chip || 0);
  let add;
  if (up > 0 && (c === 100 || c === 500)) add = 600;
  else if (up > 0) add = Math.max(600, Math.floor(c / 600) * 600);
  else add = Math.max(place68Min(tableMin), Math.floor(c / 600) * 600 || place68Min(tableMin));
  add = Math.floor(add / 600) * 600;
  if (add > room) add = Math.floor(room / 600) * 600;
  return add;
}

export function clampBankroll(cents) {
  const n = Math.round(Number(cents) || 0);
  return Math.min(BANKROLL_MAX, Math.max(BANKROLL_MIN, n));
}

/** Premium keeps Field 3:1, odds other than 3-4-5x, and custom limits or bankroll. */
export function premiumOnly(change) {
  const c = change || {};
  if (c.field12 === 3 || c.field2 === 3) return true;
  if (c.odds && c.odds !== ODDS_FREE) return true;
  if (c.customLimits || c.customBankroll) return true;
  return false;
}

export function applyTier(rules, tier) {
  const next = Object.assign({}, rules || {});
  next.tier = tier.id;
  next.tableMin = tier.min;
  next.tableMax = tier.max;
  return next;
}

/** A tier change waits for the next come-out. Come-out applies it now. */
export function queueTier(rules, tier, phase) {
  const next = applyTier(rules, tier);
  if (phase === "come-out" || !phase) return { rules: next, pending: null };
  return { rules, pending: next };
}
