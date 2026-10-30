/**
 * Seeded generator for Strategy Comparison and tests.
 * xoshiro128** , version "xoshiro128ss-v1". Not used for live rolls.
 */

export const SEEDED_RNG_NAME = "xoshiro128ss-v1";

function splitmix32(seed) {
  let x = seed >>> 0;
  return function next() {
    x = (x + 0x9e3779b9) >>> 0;
    let z = x;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return (z ^ (z >>> 16)) >>> 0;
  };
}

/** Returns a function that yields Uint32 values. */
export function xoshiro128ss(seed) {
  const mix = splitmix32(typeof seed === "number" ? seed : hashSeed(String(seed)));
  let a = mix();
  let b = mix();
  let c = mix();
  let d = mix();
  if ((a | b | c | d) === 0) a = 1;
  return function next() {
    const t = b << 9;
    let r = Math.imul(b, 5);
    r = ((r << 7) | (r >>> 25)) >>> 0;
    r = Math.imul(r, 9) >>> 0;
    c ^= a;
    d ^= b;
    b ^= c;
    a ^= d;
    c ^= t;
    d = ((d << 11) | (d >>> 21)) >>> 0;
    return r >>> 0;
  };
}

export function hashSeed(text) {
  let h = 2166136261;
  const s = String(text);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const LIMIT = 4294967296 - (4294967296 % 6);

/** Rejection-sampled face from a uint32 source. Null means "redraw". */
export function faceFromUint(n) {
  if (n >= LIMIT) return null;
  return (n % 6) + 1;
}

export function faceFromSource(nextUint) {
  let face = null;
  do {
    face = faceFromUint(nextUint());
  } while (face == null);
  return face;
}

/** Dice list is generated before any strategy runs. Same seed, same dice. */
export function diceFromSeed(seed, count) {
  const next = xoshiro128ss(seed);
  const out = [];
  const n = count || 0;
  for (let i = 0; i < n; i++) {
    out.push([faceFromSource(next), faceFromSource(next)]);
  }
  return out;
}
