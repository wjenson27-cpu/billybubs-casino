/**
 * Table Craps chip rail (A2.2b). Pure. Cents. No $10 chip.
 * Invariant: railTotal(rail) === bankroll === netWorth − tableTotal.
 * The rail only reshapes the engine bankroll. It never invents money.
 */

export const DENOMS = [50000, 10000, 2500, 500, 100];
export const DISPLAY_CAP = 10;
export const COLOR_LIMIT = 20;
export const DOWN = { 50000: 10000, 10000: 2500, 2500: 500, 500: 100 };

export function emptyRail() {
  return { 50000: 0, 10000: 0, 2500: 0, 500: 0, 100: 0, cup: 0 };
}

export function railTotal(rail) {
  const r = rail || emptyRail();
  return DENOMS.reduce((s, d) => s + d * (r[d] || 0), 0) + (r.cup || 0);
}

function copyRail(rail) {
  const r = emptyRail();
  DENOMS.forEach((d) => { r[d] = Math.max(0, Math.round(rail && rail[d] || 0)); });
  r.cup = Math.max(0, Math.round(rail && rail.cup || 0));
  return r;
}

/** Reserve 5×$1 then 4×$5, then greedy $500 down to $1. No $25 hold-back. Cup is the leftover cents. */
export function railBreakdown(cents) {
  const rail = emptyRail();
  let n = Math.max(0, Math.round(Number(cents) || 0));
  rail.cup = n % 100;
  let left = n - rail.cup;
  const ones = Math.min(5, Math.floor(left / 100));
  rail[100] = ones;
  left -= ones * 100;
  const fives = Math.min(4, Math.floor(left / 500));
  rail[500] = fives;
  left -= fives * 500;
  for (const d of DENOMS) {
    const k = Math.floor(left / d);
    rail[d] += k;
    left -= k * d;
  }
  return rail;
}

function normalizeCup(rail) {
  if (rail.cup >= 100) {
    rail[100] += Math.floor(rail.cup / 100);
    rail.cup %= 100;
  }
  if (rail.cup < 0) rail.cup = 0;
}

/** Break the smallest chip that can make `need` cents, one step down. A $1 breaks into the cup and stays there until the cents are taken. */
function breakOne(rail, need) {
  if (need < 100 && rail[100] > 0 && rail.cup < need) {
    rail[100] -= 1;
    rail.cup += 100;
    return { from: 100, to: "cup", count: 100, label: "Change: $1 → 100¢" };
  }
  const larger = DENOMS.filter((d) => rail[d] > 0 && DOWN[d] && d > need);
  if (!larger.length) return null;
  return breakDenom(rail, larger[larger.length - 1]);
}

function breakDenom(rail, src) {
  const lower = DOWN[src];
  if (!lower) return null;
  const count = src / lower;
  rail[src] -= 1;
  rail[lower] += count;
  const from = src / 100;
  const to = lower / 100;
  return {
    from: src,
    to: lower,
    count,
    label: "Change: $" + from + " → " + count + " × $" + to,
  };
}

/**
 * Pay `cents` out of the rail. Fewest chips, largest first.
 * Breaks the smallest covering chip one step at a time until the amount fits.
 * The returned rail is final; animation is the caller's job.
 */
function attempt(rail, amount) {
  const used = { 50000: 0, 10000: 0, 2500: 0, 500: 0, 100: 0, cup: 0 };
  const tmp = copyRail(rail);
  let left = amount;
  if (left % 100 !== 0 && tmp.cup >= left % 100) {
    used.cup = left % 100;
    tmp.cup -= used.cup;
    left -= used.cup;
  }
  for (const d of DENOMS) {
    const k = Math.min(tmp[d], Math.floor(left / d));
    if (k) {
      used[d] = k;
      tmp[d] -= k;
      left -= k * d;
    }
  }
  if (left === 0) normalizeCup(tmp);
  return { left, used, rail: tmp };
}

/** Break the smallest chip whose single break lets the amount pay, before burning the one-step guard. */
function breakToward(rail, amount) {
  const denoms = DENOMS.filter((d) => rail[d] > 0 && DOWN[d]);
  for (let i = denoms.length - 1; i >= 0; i--) {
    const trial = copyRail(rail);
    if (!breakDenom(trial, denoms[i])) continue;
    if (attempt(trial, amount).left === 0) return breakDenom(rail, denoms[i]);
  }
  return breakOne(rail, attempt(rail, amount).left);
}

export function railPay(rail, cents) {
  const amount = Math.round(Number(cents) || 0);
  if (amount <= 0) return { ok: false, rail: copyRail(rail), used: {}, breaks: [], error: "Nothing to pay." };
  if (railTotal(rail) < amount) return { ok: false, rail: copyRail(rail), used: {}, breaks: [], error: "Not enough practice chips." };
  const r = copyRail(rail);
  const breaks = [];
  for (let guard = 0; guard < 40; guard++) {
    const took = attempt(r, amount);
    if (took.left === 0) return { ok: true, rail: took.rail, used: took.used, breaks };
    const step = breakToward(r, amount);
    if (!step) return restack(rail, amount, breaks);
    breaks.push(step);
  }
  return restack(rail, amount, breaks);
}

/** The rail is a bankroll total. When the chip mix cannot pay, break it back into stacks of the remainder. */
function restack(rail, amount, breaks) {
  const total = railTotal(rail);
  if (total < amount) return { ok: false, rail: copyRail(rail), used: {}, breaks, error: "Not enough practice chips." };
  return {
    ok: true,
    rail: railBreakdown(total - amount),
    used: {},
    breaks: breaks.concat([{ label: "Change: re-stacked the rail" }]),
  };
}

/** Credit a win, take-down, or push. Greedy, no reserve. Cents go to the cup. */
export function railCredit(rail, cents) {
  const amount = Math.round(Number(cents) || 0);
  const r = copyRail(rail);
  if (amount <= 0) return { rail: r, added: emptyRail() };
  const added = emptyRail();
  let left = amount;
  added.cup = left % 100;
  r.cup += added.cup;
  left -= added.cup;
  for (const d of DENOMS) {
    const k = Math.floor(left / d);
    added[d] = k;
    r[d] += k;
    left -= k * d;
  }
  normalizeCup(r);
  if (r.cup !== (copyRail(rail).cup + added.cup) % 100) {
    /* cup rolled into a $1; added stays the greedy picture of the credit */
  }
  return { rail: r, added };
}

export function colorUpOffer(rail) {
  const r = rail || emptyRail();
  return (r[100] || 0) > COLOR_LIMIT || (r[500] || 0) > COLOR_LIMIT;
}

/** Keep the reserve and re-break the rest. Total does not change. */
export function railColorUp(rail) {
  const before = copyRail(rail);
  const next = railBreakdown(railTotal(before));
  return { rail: next, before, total: railTotal(next) };
}

export function leaveTable(rail) {
  return railColorUp(rail);
}

/** Move the rail to exactly `bankroll` cents. Used after every engine mutation. */
export function syncRail(rail, bankroll) {
  const have = railTotal(rail);
  const want = Math.max(0, Math.round(bankroll || 0));
  if (have === want) return { ok: true, rail: copyRail(rail), breaks: [], delta: 0 };
  if (have > want) {
    const paid = railPay(rail, have - want);
    return { ok: paid.ok, rail: paid.ok ? paid.rail : copyRail(rail), breaks: paid.breaks || [], delta: want - have, error: paid.error };
  }
  const credited = railCredit(rail, want - have);
  return { ok: true, rail: credited.rail, breaks: [], delta: want - have };
}

export function railMatches(rail, bankroll) {
  if (!rail) return false;
  if (railTotal(rail) !== Math.round(bankroll || 0)) return false;
  if (rail.cup < 0 || rail.cup > 99) return false;
  return DENOMS.every((d) => Number.isInteger(rail[d]) && rail[d] >= 0);
}

const NAMES = { 50000: "five-hundred", 10000: "hundred", 2500: "twenty-five", 500: "five", 100: "one" };

export function railGroupLabel(rail) {
  const r = rail || emptyRail();
  const bits = [];
  DENOMS.forEach((d) => {
    const n = r[d] || 0;
    if (!n) return;
    const name = NAMES[d] + (n === 1 ? "" : "s");
    bits.push(n + " " + name);
  });
  if (r.cup) bits.push(r.cup + " cent" + (r.cup === 1 ? "" : "s"));
  const dollars = railTotal(r) / 100;
  const text = Number.isInteger(dollars) ? dollars.toLocaleString("en-US") : dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return "Your chips: $" + text + (bits.length ? ". " + bits.join(", ") : "") + ".";
}

export function badgeText(count) {
  if (count > 999) return "×999+";
  if (count > 1) return "×" + count;
  return "";
}
