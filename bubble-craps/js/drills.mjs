/**
 * Billy's payout drills (rev 16 S13). Answers come from the engine, to the cent.
 * Drills never touch the bankroll, the bets, or the dice.
 */

import * as E from "./engine.mjs";
import * as TR from "./table-rules.mjs";

export const FOOTER = "Casinos round some payouts. The app pays to the cent; real tables may pay $1 less on odd amounts.";
export const KEY = (app) => "bb-" + (app === "table" ? "table" : "bubble") + "-drills-v1";
export const LEVELS = { rookie: 10, dealer: 20, boxman: 30 };

function money(cents) {
  const n = Math.round(cents);
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const d = Math.floor(abs / 100);
  const c = abs % 100;
  return sign + "$" + d + (c ? "." + String(c).padStart(2, "0") : ".00");
}

function q(partial) {
  return Object.assign({ level: "rookie", drill: "D1", choices: null, why: "" }, partial);
}

export function catalog(app) {
  const rules = TR.defaultRules();
  const list = [];
  list.push(q({
    drill: "D1",
    prompt: "Place 8, $18. The 8 rolls. Pay?",
    answer: E.placeProfit(1800, 8),
    why: "Place 8 pays 7 to 6: $18 ÷ 6 = 3 units × $7 = $21.",
    text: "Place 8, $18; the roll is five and three, easy eight",
  }));
  list.push(q({
    drill: "D1",
    prompt: "Place 6, $12. The 6 rolls. Pay?",
    answer: E.placeProfit(1200, 6),
    why: "Place 6 pays 7 to 6: $12 ÷ 6 = 2 units × $7 = $14.",
    text: "Place 6, $12",
  }));
  list.push(q({
    drill: "D2",
    prompt: "$10 Pass, $50 odds on 6. Point made. Pay the odds.",
    answer: E.passOddsProfit(5000, 6),
    why: "Odds on 6 pay 6 to 5: $50 ÷ 5 = 10 units × $6 = $60.",
    text: "Pass odds $50 on 6",
  }));
  list.push(q({
    drill: "D3",
    prompt: "Buy 10, $25. It hits. Net pay?",
    answer: E.buyProfit(2500, 10, rules),
    why: "Buy 10 pays 2 to 1, then 5% commission on the $25 stake: $50 − $1.25 = $48.75.",
    text: "Buy 10, $25",
  }));
  list.push(q({
    drill: "D5",
    prompt: "Field $10. The roll is 12, and 12 pays double. Pay?",
    answer: E.fieldProfit(1000, 12, rules),
    why: "Field 12 at 2 to 1 pays $20 on a $10 bet.",
    text: "Field $10, roll 12",
  }));
  list.push(q({
    drill: "D5",
    prompt: "Hard 8, $1. Hard eight. Pay?",
    answer: E.hardwayProfit(100, 8),
    why: "Hard 8 pays 9 to 1: $1 × 9 = $9.",
    text: "Hard 8, $1",
  }));
  list.push(q({
    drill: "D6",
    prompt: "A player wants about $50 on the 6. What pays clean?",
    answer: 4800,
    why: "Place 6 and 8 are in $6 steps. $48 is the largest $6 step at or under $50.",
    text: "Place 6 near $50",
  }));
  list.push(q({
    drill: "D6",
    prompt: "Max 3-4-5x odds on a $15 flat, point 5?",
    answer: 6000,
    why: "Point 5 takes 4x odds: $15 × 4 = $60.",
    text: "Odds on 5",
  }));
  if (app === "table") {
    list.push(q({
      drill: "D4",
      prompt: "Lay 4, $40. Seven. Net pay?",
      answer: TR.layNet(4000, 4, rules),
      why: "Lay 4 pays 1 to 2, then 5% commission on the win.",
      text: "Lay 4, $40",
    }));
    list.push(q({
      drill: "D8",
      prompt: "Pay $14 Place 6 with the fewest chips and no $10 chip. How many $1 chips?",
      answer: 400,
      why: "Two $5 chips and four $1 chips. There is no $10 chip on this rail.",
      text: "Place 6 payout $14",
    }));
  }
  const field3 = Object.assign({}, rules, { field12: 3 });
  list.push(sceneQuestion(PAY_SCENES[0]));
  list.push(q({
    drill: "D5",
    level: "dealer",
    prompt: "Field $10 and 12 pays 3 to 1. The roll is 12. Pay?",
    answer: E.fieldProfit(1000, 12, field3),
    why: "Field 12 at 3 to 1 pays $30 on a $10 bet.",
    text: "Field $10, 12 pays 3 to 1",
  }));
  return list;
}

/** What this roll pays, from the engine payout functions. A miss pays nothing. */
export function payFor(scene, d1, d2, field12) {
  const pay12 = field12 === 3 ? 3 : 2;
  const rules = TR.defaultRules({ field2: 2, field12: pay12 });
  const total = d1 + d2;
  const hard = d1 === d2;
  const comeOut = scene.phase !== "point";
  let pay = 0;
  (scene.bets || []).forEach((bet) => {
    if (bet.kind === "place") {
      if (!comeOut && total === bet.number) pay += E.placeProfit(bet.amount, bet.number);
    } else if (bet.kind === "buy") {
      if (!comeOut && total === bet.number) pay += E.buyProfit(bet.amount, bet.number, rules);
    } else if (bet.kind === "field") {
      pay += E.fieldProfit(bet.amount, total, rules);
    } else if (bet.kind === "hardway") {
      if (hard && total === bet.number) pay += E.hardwayProfit(bet.amount, bet.number, false);
    } else if (bet.kind === "pass") {
      if (comeOut && (total === 7 || total === 11)) pay += bet.amount;
      else if (!comeOut && total === scene.point) pay += bet.amount;
    } else if (bet.kind === "passOdds") {
      if (!comeOut && total === scene.point) pay += E.passOddsProfit(bet.amount, scene.point);
    }
  });
  return pay;
}

function dollars(cents) {
  const n = Math.round(cents);
  const d = Math.floor(Math.abs(n) / 100);
  const c = Math.abs(n) % 100;
  return (n < 0 ? "-" : "") + "$" + d + (c ? "." + String(c).padStart(2, "0") : "");
}

function whyLine(scene) {
  const total = scene.d1 + scene.d2;
  const field12 = scene.field12 === 3 ? 3 : 2;
  const bits = (scene.bets || []).map((bet) => {
    const part = payFor(Object.assign({}, scene, { bets: [bet] }), scene.d1, scene.d2, field12);
    if (bet.kind === "place") {
      return part ? "Place " + bet.number + " pays " + dollars(part) + "." : "Place " + bet.number + " does not win on " + total + ".";
    }
    if (bet.kind === "field") {
      return part ? "Field pays " + dollars(part) + " on " + total + "." : "Field loses on " + total + ".";
    }
    if (bet.kind === "hardway") return part ? "Hard " + bet.number + " pays " + dollars(part) + "." : "Hard " + bet.number + " does not win.";
    if (bet.kind === "buy") return part ? "Buy " + bet.number + " pays " + dollars(part) + " after commission." : "Buy " + bet.number + " does not win on " + total + ".";
    if (bet.kind === "pass") return part ? "Pass Line pays " + dollars(part) + "." : "Pass Line does not win on " + total + ".";
    if (bet.kind === "passOdds") return part ? "Odds pay " + dollars(part) + "." : "Odds do not win on " + total + ".";
    return "";
  }).filter(Boolean);
  const totalPay = payFor(scene, scene.d1, scene.d2, field12);
  if ((scene.bets || []).length > 1) bits.push("Total " + dollars(totalPay) + ".");
  return bits.join(" ");
}

function sceneQuestion(scene, extra) {
  const field12 = scene.field12 === 3 ? 3 : 2;
  return q(Object.assign({
    drill: "D7",
    level: "dealer",
    prompt: scene.prompt,
    answer: payFor(scene, scene.d1, scene.d2, field12),
    why: whyLine(scene),
    text: scene.text,
    scene,
  }, extra));
}

const PAY_SCENES = [
  {
    phase: "point", point: 4, field12: 2, d1: 6, d2: 6,
    bets: [{ kind: "place", number: 6, amount: 1800 }, { kind: "field", amount: 500 }],
    prompt: "Place 6 $18 and Field $5 (12 pays 2 to 1). The roll is 6-6. Total pay?",
    text: "Place 6 $18; Field $5; roll six and six",
  },
  {
    phase: "point", point: 4, field12: 3, d1: 6, d2: 6,
    bets: [{ kind: "place", number: 8, amount: 600 }, { kind: "field", amount: 500 }],
    prompt: "Place 8 $6 and Field $5 (12 pays 3 to 1). The roll is 6-6. Total pay?",
    text: "Place 8 $6; Field $5; roll six and six",
  },
  {
    phase: "point", point: 4, field12: 2, d1: 5, d2: 3,
    bets: [{ kind: "place", number: 8, amount: 1200 }],
    prompt: "Place 8, $12. The roll is 5-3. Total pay?",
    text: "Place 8, $12; roll five and three",
  },
  {
    phase: "point", point: 6, field12: 2, d1: 2, d2: 2,
    bets: [{ kind: "place", number: 4, amount: 1000 }],
    prompt: "Place 4, $10. The roll is 2-2. Total pay?",
    text: "Place 4, $10; roll two and two",
  },
  {
    phase: "point", point: 6, field12: 2, d1: 4, d2: 5,
    bets: [{ kind: "place", number: 9, amount: 2000 }],
    prompt: "Place 9, $20. The roll is 4-5. Total pay?",
    text: "Place 9, $20; roll four and five",
  },
  {
    phase: "point", point: 4, field12: 2, d1: 3, d2: 3,
    bets: [{ kind: "hardway", number: 6, amount: 100 }],
    prompt: "Hard 6, $1. The roll is 3-3. Total pay?",
    text: "Hard 6, $1; roll three and three",
  },
  {
    phase: "point", point: 4, field12: 2, d1: 5, d2: 5,
    bets: [{ kind: "hardway", number: 10, amount: 500 }],
    prompt: "Hard 10, $5. The roll is 5-5. Total pay?",
    text: "Hard 10, $5; roll five and five",
  },
  {
    phase: "come-out", point: null, field12: 2, d1: 3, d2: 4,
    bets: [{ kind: "pass", amount: 2000 }],
    prompt: "Pass Line $20. Come-out roll is 3-4. Total pay?",
    text: "Pass Line $20; come-out three and four",
  },
  {
    phase: "point", point: 5, field12: 2, d1: 2, d2: 3,
    bets: [{ kind: "pass", amount: 1500 }, { kind: "passOdds", amount: 3000 }],
    prompt: "Pass $15 and $30 odds, point 5. The roll is 2-3. Total pay?",
    text: "Pass $15; odds $30 on 5; roll two and three",
  },
  {
    phase: "point", point: 6, field12: 2, d1: 4, d2: 6,
    bets: [{ kind: "buy", number: 10, amount: 2500 }],
    prompt: "Buy 10, $25. The roll is 4-6. Total pay?",
    text: "Buy 10, $25; roll four and six",
  },
];

/** Ten distinct D7 Pay the roll questions. A perfect Dealer round earns Dealer's Apprentice. */
export function payTheRoll(app) {
  void app;
  return PAY_SCENES.map((scene, i) => sceneQuestion(scene, { n: i + 1 }));
}

export function roundOf(app, level, seed) {
  const all = catalog(app).filter((item) => {
    if (level === "boxman") return true;
    if (level === "dealer") return item.level !== "boxman";
    return item.level === "rookie";
  });
  const out = [];
  let s = seed || 1;
  for (let i = 0; i < 10; i++) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const item = all[s % all.length];
    const row = Object.assign({}, item, { n: i + 1 });
    if (level === "rookie") row.choices = choicesFor(row.answer, s);
    out.push(row);
  }
  return out;
}

export function choicesFor(answer, salt) {
  const wrong = [answer + 100, Math.max(0, answer - 100), answer + 500];
  const set = [answer].concat(wrong);
  const uniq = [];
  set.forEach((n) => { if (uniq.indexOf(n) < 0) uniq.push(n); });
  while (uniq.length < 4) uniq.push(answer + uniq.length * 100);
  const order = uniq.slice(0, 4);
  const shift = (salt || 0) % 4;
  return order.slice(shift).concat(order.slice(0, shift));
}

export function scoreAnswer(level, right) {
  if (!right) return 0;
  return LEVELS[level] || LEVELS.rookie;
}

export function grade(level, correct) {
  const each = LEVELS[level] || LEVELS.rookie;
  const n = correct || 0;
  return { score: n * each, accuracy: Math.round((n / 10) * 100), perfect: n === 10 };
}

export function whyText(item) {
  return item.why;
}

export function formatAnswer(cents) {
  return money(cents);
}

/** Sweep payout helpers so a drill cannot drift from the table. */
export function sweep(n) {
  const rules = TR.defaultRules();
  const field3 = Object.assign({}, rules, { field12: 3 });
  let mismatches = 0;
  for (let i = 0; i < n; i++) {
    const stake = 100 * ((i % 50) + 1);
    const got = E.placeProfit(stake - (stake % 600 || 0) || 600, 6);
    const expect = Math.floor(((stake - (stake % 600 || 0) || 600) * 7) / 6);
    if (got !== expect) mismatches += 1;
    if (E.fieldProfit(1000, 12, rules) !== 2000) mismatches += 1;
    if (E.fieldProfit(1000, 12, field3) !== 3000) mismatches += 1;
    if (E.buyProfit(2500, 10, rules) !== TR.buyNet(E.passOddsProfit(2500, 10), 2500, rules)) mismatches += 1;
  }
  return { checked: n, mismatches };
}
