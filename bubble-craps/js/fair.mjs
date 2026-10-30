/**
 * Fair Dice math: chi-square on totals and faces. No DOM.
 */

const WAYS = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };

export function ways(total) {
  return WAYS[total] || 0;
}

export function expectedRate(total) {
  return ways(total) / 36;
}

function logGamma(z) {
  const p = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  let x = p[0];
  for (let i = 1; i < 9; i++) x += p[i] / (z + i);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/** Upper regularized gamma Q(a, x). Chi-square survival is Q(df/2, x/2). */
function gammaQ(a, x) {
  if (x <= 0) return 1;
  const gln = logGamma(a);
  if (x < a + 1) {
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let n = 0; n < 200; n++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-12) break;
    }
    const lower = sum * Math.exp(-x + a * Math.log(x) - gln);
    return Math.max(0, Math.min(1, 1 - lower));
  }
  let b = x + 1 - a;
  let c = 1 / 1e-30;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= 200; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-12) break;
  }
  return Math.max(0, Math.min(1, Math.exp(-x + a * Math.log(x) - gln) * h));
}

export function chiSquareP(chi2, df) {
  if (!(chi2 >= 0) || !(df > 0)) return 1;
  return gammaQ(df / 2, chi2 / 2);
}

export function chiSquare(observed, expected) {
  let x = 0;
  for (let i = 0; i < observed.length; i++) {
    const e = expected[i];
    if (e <= 0) continue;
    const d = observed[i] - e;
    x += (d * d) / e;
  }
  return x;
}

export function totalsTest(rolls) {
  const n = rolls.length;
  const counts = {};
  for (let t = 2; t <= 12; t++) counts[t] = 0;
  rolls.forEach((r) => {
    const total = r.total != null ? r.total : r.d1 + r.d2;
    if (counts[total] != null) counts[total] += 1;
  });
  const observed = [];
  const expected = [];
  for (let t = 2; t <= 12; t++) {
    observed.push(counts[t]);
    expected.push(n * expectedRate(t));
  }
  const chi2 = n ? chiSquare(observed, expected) : 0;
  const p = n ? chiSquareP(chi2, 10) : 1;
  return { n, counts, observed, expected, chi2, df: 10, p, readout: fairnessReadout(p, n) };
}

export function facesTest(rolls, which) {
  const counts = [0, 0, 0, 0, 0, 0];
  rolls.forEach((r) => {
    const face = which === 2 ? r.d2 : r.d1;
    if (face >= 1 && face <= 6) counts[face - 1] += 1;
  });
  const n = counts.reduce((s, c) => s + c, 0);
  const expected = counts.map(() => n / 6);
  const chi2 = n ? chiSquare(counts, expected) : 0;
  const p = n ? chiSquareP(chi2, 5) : 1;
  return { n, counts, expected, chi2, df: 5, p };
}

export function fairnessReadout(p, n) {
  if (n < 180) {
    return {
      badge: "Need more rolls",
      words: "Roll 180 times for a fair test (now " + n + ").",
    };
  }
  if (p >= 0.05) {
    return { badge: "Within normal range", words: "Looks fair. These results are well within what random dice produce." };
  }
  if (p >= 0.01) {
    return {
      badge: "A bit unusual",
      words: "A bit unusual, still normal. Random dice land here about 1 session in 20. Keep rolling.",
    };
  }
  return {
    badge: "Rare result",
    words: "Rare, but it happens. Random dice land here about 1 time in 100. Over many more rolls, the percentages usually settle toward expected. The dice don't catch up; the early swing just gets diluted.",
  };
}

export function sevenBand(n) {
  const p = 1 / 6;
  const sd = Math.sqrt((p * (1 - p)) / Math.max(n, 1));
  return { low: p - 2 * sd, high: p + 2 * sd, expected: p };
}

export function streakStats(rolls) {
  let longestDry = 0;
  let dry = 0;
  let longestHand = 0;
  let hand = 0;
  rolls.forEach((r) => {
    const total = r.total != null ? r.total : r.d1 + r.d2;
    const sevenOut = r.result === "seven-out" || (r.phaseBefore === "point" && total === 7);
    hand += 1;
    if (total === 7 && (r.result === "seven-out" || r.phaseBefore === "point")) {
      longestHand = Math.max(longestHand, hand);
      hand = 0;
    }
    if (total === 7) dry = 0;
    else {
      dry += 1;
      longestDry = Math.max(longestDry, dry);
    }
    if (sevenOut) {
      /* hand already closed */
    }
  });
  return { longestDry, longestHand, currentDry: dry, currentHand: hand, ...mostRepeatedInHand(rolls) };
}

/** Highest count of one total inside a single hand (between seven-outs). */
export function mostRepeatedInHand(rolls) {
  let best = 0;
  let total = null;
  let counts = {};
  const flush = () => {
    Object.keys(counts).forEach((key) => {
      if (counts[key] > best) {
        best = counts[key];
        total = Number(key);
      }
    });
    counts = {};
  };
  rolls.forEach((r) => {
    const t = r.total != null ? r.total : r.d1 + r.d2;
    counts[t] = (counts[t] || 0) + 1;
    const sevenOut = r.result === "seven-out" || (r.phaseBefore === "point" && t === 7);
    if (sevenOut) flush();
  });
  flush();
  return { mostRepeats: best, mostRepeatTotal: total };
}
