/**
 * Pass-and-play seats on the shared engine. One roll, every seat settles.
 * The dice pass only on a seven-out. A solo player never passes them.
 */

import * as E from "./engine.mjs";
import * as TR from "./table-rules.mjs";

export function createTable(opts) {
  const n = Math.max(2, Math.min(6, (opts && opts.seats) || 2));
  const names = (opts && opts.names) || [];
  const seats = [];
  for (let i = 0; i < n; i++) {
    seats.push({
      name: names[i] || ("Seat " + (i + 1)),
      skipShoot: false,
      rebuys: 0,
      state: E.createGame({ profile: "table", rules: opts && opts.rules, bankroll: (opts && opts.bankroll) || E.STARTING_BANKROLL }),
    });
  }
  return {
    seats,
    shooter: 0,
    order: seats.map((_, i) => i),
    rebuysAllowed: !(opts && opts.rebuys === false),
    handRolls: 0,
    handPoints: 0,
  };
}

export function reorder(table, order) {
  const next = order.filter((i) => i >= 0 && i < table.seats.length);
  if (next.length !== table.seats.length) return table;
  table.order = next;
  return table;
}

function shooterSeat(table) {
  return table.seats[table.order[table.shooter]];
}

export function shooterName(table) {
  const s = shooterSeat(table);
  return s ? s.name : "";
}

/** A shooter needs Pass or Don't at the table minimum. */
export function shooterReady(table) {
  const s = shooterSeat(table);
  if (!s || s.skipShoot) return false;
  const min = (s.state.rules && s.state.rules.tableMin) || TR.TABLE_MIN_CENTS;
  return s.state.bets.pass >= min || s.state.bets.dontPass >= min;
}

export function passReason(table) {
  const s = shooterSeat(table);
  if (s && s.skipShoot) return s.name + " skipped the dice.";
  return "Shooter passes";
}

function advance(table) {
  const n = table.order.length;
  if (n <= 1) return;
  for (let step = 1; step <= n; step++) {
    const idx = (table.shooter + step) % n;
    const seat = table.seats[table.order[idx]];
    if (!seat.skipShoot) {
      table.shooter = idx;
      return;
    }
  }
}

/** Settle one shared roll on every seat. Fire pays before the dice pass. */
export function playRoll(table, d1, d2) {
  const before = table.shooter;
  const lines = [];
  let result = "no-decision";
  table.seats.forEach((seat) => {
    const settled = E.settle(seat.state, d1, d2);
    seat.state = settled.state;
    result = settled.result;
    const net = settled.net || 0;
    if (net || (settled.decisions && settled.decisions.length)) {
      const sign = net < 0 ? "−" : "+";
      lines.push(seat.name + " " + sign + E.formatMoney(Math.abs(net)).replace("-", ""));
    }
  });
  if (result === "point-made") table.handPoints += 1;
  if (result === "seven-out") {
    table.handRolls += 1;
    const summary = {
      shooter: table.seats[table.order[before]].name,
      rolls: table.handRolls,
      points: table.handPoints,
      seats: table.seats.map((s) => ({ name: s.name, bankroll: s.state.bankroll })),
    };
    table.handRolls = 0;
    table.handPoints = 0;
    if (table.seats.length > 1) advance(table);
    return { result, lines, summary, passed: table.shooter !== before };
  }
  table.handRolls += 1;
  return { result, lines, passed: false };
}

export function rebuy(table, seatIndex, amount) {
  if (!table.rebuysAllowed) return { ok: false, error: "Rebuys are off." };
  const seat = table.seats[seatIndex];
  if (!seat) return { ok: false, error: "No seat." };
  seat.state.bankroll += amount;
  seat.rebuys += 1;
  return { ok: true, seat };
}
