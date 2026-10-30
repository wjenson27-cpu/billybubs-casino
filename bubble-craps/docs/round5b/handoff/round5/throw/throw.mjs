// On-table dice throw for Table Craps (round 5, NEW; design prototype, not a build).
// REUSE: js/tc-dice.mjs cssMatrix/orient (right-handed, opposite faces sum to 7) and the .tc-cube markup of js/table-ui.mjs cubeHTML().
// The result is decided BEFORE this runs (Rule 0); the animation only lands on it. A no-roll is decided before the draw (Rule 0.5).
import { cssMatrix, orient } from "/app/js/tc-dice.mjs";
const A = "/app/assets/";
if (!document.querySelector("link[data-tt]")) { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = new URL("./throw.css", import.meta.url).href; l.dataset.tt = "1"; document.head.appendChild(l); }
const VIEW = "rotateX(-56deg) rotateY(-18deg)";                 // camera: fixed, slight top-down; no camera move
export const TIMING = { normal: { dur: 1400, hold: 450, tuck: 260 }, fast: { dur: 500, hold: 250, tuck: 200 }, instant: { dur: 150, hold: 200, tuck: 160 }, reduced: { dur: 180, hold: 300, tuck: 120 } };
const K = [0, .18, .40, .55, .62, .70, .86, 1];                 // keyframe offsets: release · apex · BACK WALL · bounce 1 · hop · bounce 2 · roll-out · settle
let live = null;

export function onScreen(el) {
  if (!el) return false; const r = el.getBoundingClientRect();
  if (!r.width || r.right <= 0 || r.bottom <= 0 || r.left >= innerWidth || r.top >= innerHeight) return false;
  const h = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2)));
  return !!h && (el.contains(h) || h.contains(el));
}
const R = (e) => e.getBoundingClientRect();
const hit = (a, b, m = 0) => !(a.right + m <= b.left || a.left - m >= b.right || a.bottom + m <= b.top || a.top - m >= b.bottom);
const box = (x, y, w, h) => ({ left: x, top: y, right: x + w, bottom: y + h });

/** Surface on the CURRENT pager page: the board felt, else the shooter page's table strip. */
export function surface() {
  const felt = document.querySelector("#felt"), tray = document.querySelector(".tc-shooter .table");
  if (onScreen(felt)) return { el: felt, kind: "felt" };
  if (onScreen(tray)) return { el: tray, kind: "tray" };
  return null;
}
/** Every bet amount on the surface (chip stacks + their $ labels): the landing lane must miss all of them. */
export function amountRects(el) {
  return [...el.querySelectorAll(".bet, .amt, [class*='amt'], [class*='stake']")].concat([...el.querySelectorAll("*")].filter((n) => !n.children.length && /\$\s?\d/.test(n.textContent)))
    .map(R).filter((r) => r.width > 0);
}
function avoidRects() { return [".tc-shoot", ".tc-rail", ".tc-dock", ".tc-hud", ".tc-keys"].map((s) => document.querySelector(s)).filter(onScreen).map(R); }

/** Landing zone: each die needs a clear felt spot (no bet chip or $ amount, not ROLL/SHOOT, rail, dock, HUD).
 *  Die A takes the clear spot nearest the back-wall third / middle; die B the clear spot nearest die A.
 *  If no clear spot exists for a die, it LIFTS (hovers s*.6 with a ground shadow) over the spot hiding the fewest amounts, then tucks. */
export function landing(S, s, fy) {
  const r = R(S.el), bets = amountRects(S.el), av = avoidRects(), q = s * 1.8, st = 4;
  const ty = r.top + r.height * (fy ?? (S.kind === "tray" ? .6 : .34)), tx = r.left + r.width / 2;
  const spots = [];
  for (let y = r.top + s * .5; y + q + s * .35 <= r.bottom - s * .1; y += st) for (let x = r.left + s * .3; x + q <= r.right - s * .3; x += st) {
    const b = box(x, y, q, q + s * .35); if (av.some((o) => hit(b, o, 6))) continue;
    spots.push({ x: x + q / 2, y: y + q / 2, b, n: bets.filter((o) => hit(b, o, 6)).length });
  }
  const pick = (score, not) => { let best = null; for (const p of spots) { if (not && hit(p.b, not.b, 2)) continue; const sc = score(p) + p.n * 1e5; if (!best || sc < best.sc) best = { ...p, sc }; } return best; };
  const A = pick((p) => Math.abs(p.y - ty) + Math.abs(p.x - tx) * .5);
  const B = pick((p) => Math.hypot(p.x - (A.x + s * 1.2), p.y - (A.y + s * .15)), A);
  const pt = (p) => ({ x: p.x, y: p.y, lift: p.n ? s * .6 : 0 });
  return { dice: [pt(A), pt(B)], lift: !!(A.n || B.n), lane: [A.b, B.b] };
}
function legalFront(top, k) { return [2, 3, 1, 5, 4, 6].filter((f) => f !== top && f + top !== 7)[k % 4]; }
const cube = (top, front, s) => `<div class="tc-cube" style="--s:${s}px" data-top="${top}" data-front="${front}"><div class="c" style="transform:${VIEW} ${cssMatrix(top, front)}">${[1, 2, 3, 4, 5, 6].map((f) => `<i class="f f${f}" style="background-image:url(${A}dice/faces/face-${f}.svg)"></i>`).join("")}</div></div>`;

export function cancelThrow() { if (!live) return; live.anims.forEach((a) => a.finish()); }

/**
 * throwDice({ d1, d2, speed:'normal'|'fast'|'instant', reduced, noRoll, set:[{top,front},{top,front}], hold, sfx, haptic, onSettle, onDone, lane })
 * Resolves after the tuck. onSettle(d1,d2) fires the moment the dice come to rest: the app settles bets and starts the
 * point-made celebration / PSO there (their own S4.3 / S4.4 / S11 tiers), in parallel with the tuck.
 */
export function throwDice(o) {
  const reduced = o.reduced ?? matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mode = reduced ? "reduced" : (o.speed || "normal"), T = TIMING[mode];
  const sfx = o.sfx || ((n) => dispatchEvent(new CustomEvent("bb:sfx", { detail: { name: n } }))), hap = o.haptic || ((n) => dispatchEvent(new CustomEvent("bb:haptic", { detail: { name: n } })));
  const S = surface();
  if (!S) { o.onSettle?.(o.d1, o.d2); o.onDone?.(); return Promise.resolve({ page: "none" }); }    // not on this page: readout only
  const r = R(S.el), s = Math.round(Math.max(26, Math.min(44, (S.kind === "tray" ? r.height * .34 : Math.min(r.width * .07, r.height * .085)))));
  const L = landing(S, s, o.noRoll ? .72 : null); window.__ttLast = { L, s, kind: S.kind };   // QA hook
  const layer = document.createElement("div"); layer.className = "tt-layer"; layer.setAttribute("aria-hidden", "true");
  const tops = o.noRoll ? (o.set || [{ top: 3, front: 5 }, { top: 3, front: 1 }]) : [{ top: o.d1, front: legalFront(o.d1, 0) }, { top: o.d2, front: legalFront(o.d2, 1) }];
  layer.innerHTML = tops.map((t, i) => `<div class="tt-shadow" data-i="${i}" style="--s:${s}px"></div><div class="tt-die" data-i="${i}" style="--s:${s}px;width:${s}px;height:${s}px;right:auto">${cube(t.top, t.front, s)}</div>`).join("") +
    (o.lane ? L.lane.map((b) => `<div class="tt-lane" style="left:${b.left}px;top:${b.top}px;width:${b.right - b.left}px;height:${b.bottom - b.top}px"></div>`).join("") : "");
  document.body.appendChild(layer);
  const anims = []; live = { layer, anims };
  const wallY = r.top + s * .55, startY = r.bottom - s * .5;
  [0, 1].forEach((i) => {
    const die = layer.querySelector(`.tt-die[data-i="${i}"]`), sh = layer.querySelector(`.tt-shadow[data-i="${i}"]`), c = die.querySelector(".c");
    const lx = L.dice[i].x, ly = L.dice[i].y;
    const sx = r.left + r.width * (i ? .56 : .48), wx = Math.min(r.right - s, Math.max(r.left + s, lx + (i ? -s * .4 : s * .5)));
    const lerp = (a, b, t) => a + (b - a) * t;
    let pts;
    if (o.noRoll) { pts = [[sx, startY, s * .3], [lerp(sx, lx, .3), lerp(startY, ly, .3), s * .8], [lerp(sx, lx, .55), lerp(startY, ly, .55), s * .1], [lerp(sx, lx, .7), lerp(startY, ly, .7), 0], [lerp(sx, lx, .8), lerp(startY, ly, .8), s * .15], [lerp(sx, lx, .9), lerp(startY, ly, .9), 0], [lerp(sx, lx, .97), lerp(startY, ly, .97), 0], [lx, ly, 0]]; }   // soft toss: dies short of the wall, in a clear spot on the shooter's half
    else pts = [[sx, startY, s * .4], [lerp(sx, wx, .55), lerp(startY, wallY, .6), s * 1.6], [wx, wallY, s * .3], [lerp(wx, lx, .6), lerp(wallY, ly, .6), 0], [lerp(wx, lx, .75), lerp(wallY, ly, .75), s * .35], [lerp(wx, lx, .88), lerp(wallY, ly, .88), 0], [lx + s * .05, ly, s * .04], [lx, ly, 0]];
    pts[pts.length - 1][2] = o.noRoll ? 0 : L.dice[i].lift;
    const k = (y, hh) => (0.9 + 0.1 * (y - r.top) / r.height) * (1 + hh / (6 * s));
    const tf = ([x, y, hh]) => `translate(${x - s / 2}px,${y - s / 2 - hh}px) scale(${k(y, hh).toFixed(3)})`;
    const stf = ([x, y, hh]) => `translate(${x}px,${y + s * .38}px) scale(${Math.max(.45, 1 - hh / (3 * s)).toFixed(3)})`;
    const fin = `${VIEW} ${cssMatrix(tops[i].top, tops[i].front)}`;
    const spin = [[40, 20, 8], [250, 150, 36], [470, 250, -16], [620, 300, 10], [700, 340, -6], [740, 355, 4]].map(([a, b, z]) => `${VIEW} rotateX(${i ? -a : a}deg) rotateY(${i ? b + 90 : b}deg) rotateZ(${z}deg)`);
    const nrSpin = [`${VIEW} rotateX(${i ? -30 : 30}deg) rotateY(20deg)`, `${VIEW} rotateX(${i ? -120 : 120}deg) rotateY(60deg)`, `${VIEW} rotateX(${i ? -180 : 180}deg) rotateY(90deg)`];
    const delay = i ? Math.round(T.dur * .035) : 0;
    let frames, cframes, offs = K;
    if (mode === "instant" || mode === "reduced") {
      const end = pts[pts.length - 1];
      anims.push(die.animate([{ transform: tf(end), opacity: 0 }, { transform: tf(end), opacity: 1 }], { duration: T.dur, fill: "forwards" }));
      anims.push(sh.animate([{ transform: stf(end), opacity: 0 }, { transform: stf(end), opacity: .5 }], { duration: T.dur, fill: "forwards" }));
      c.style.transform = fin; return;
    }
    if (mode === "fast" && !o.noRoll) { pts = pts.slice(2); offs = K.slice(2).map((v) => (v - .4) / .6); }     // Fast: starts at the wall rebound
    frames = pts.map((p, j) => ({ offset: offs[j], transform: tf(p), opacity: 1 }));
    anims.push(die.animate(frames, { duration: T.dur, delay, easing: "linear", fill: "both" }));
    anims.push(sh.animate(pts.map((p, j) => ({ offset: offs[j], transform: stf(p), opacity: Math.max(.15, .55 - p[2] / (4 * s)) })), { duration: T.dur, delay, fill: "both" }));
    if (o.noRoll) cframes = [{ offset: 0, transform: nrSpin[0] }, { offset: .5, transform: nrSpin[1] }, { offset: .9, transform: fin }, { offset: 1, transform: fin }];
    else { const sp = mode === "fast" ? spin.slice(2) : spin; cframes = sp.map((t, j) => ({ offset: offs[j], transform: t })).concat([{ offset: offs[offs.length - 2], transform: `${fin} rotateZ(${i ? -6 : 6}deg)` }, { offset: 1, transform: fin }]);
      cframes.sort((a, b) => a.offset - b.offset); cframes = cframes.filter((f, j, a) => j === 0 || f.offset > a[j - 1].offset); cframes[cframes.length - 1] = { offset: 1, transform: fin }; }
    anims.push(c.animate(cframes, { duration: T.dur, delay, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" }));
  });
  // events: back-wall tick (sound + haptic), felt bounce, settle → hand-off
  const timers = [];
  if (!o.noRoll && (mode === "normal" || mode === "fast")) { const tw = mode === "fast" ? 0 : T.dur * K[2]; timers.push(setTimeout(() => { sfx("dice_wall"); hap("light"); }, tw)); timers.push(setTimeout(() => sfx("dice_felt"), T.dur * (mode === "fast" ? .25 : K[3]))); }
  const skip = (e) => { const p = e.touches ? e.touches[0] : e; const rr = R(S.el); if (p.clientX >= rr.left && p.clientX <= rr.right && p.clientY >= rr.top && p.clientY <= rr.bottom) cancelThrow(); };
  addEventListener("pointerdown", skip, { capture: true, passive: true });
  const settled = Promise.all(anims.map((a) => a.finished.catch(() => {}))).then(() => {
    timers.forEach(clearTimeout); removeEventListener("pointerdown", skip, { capture: true });
    if (o.noRoll) {
      sfx("no_roll"); const pl = document.createElement("div"); pl.className = "tt-plate"; pl.setAttribute("role", "status");
      pl.innerHTML = "<b>NO ROLL · PRACTICE</b>The dice must hit the back wall. Throw again; this one doesn't count."; layer.appendChild(pl);
      pl.style.left = Math.max(8, Math.min(innerWidth - pl.offsetWidth - 8, r.left + r.width / 2 - pl.offsetWidth / 2)) + "px"; pl.style.top = Math.max(8, r.top + 8) + "px";
    } else { sfx("dice_settle"); o.onSettle?.(o.d1, o.d2); }
    return { lane: L, s, kind: S.kind, mode };
  });
  if (o.hold) return settled;
  return settled.then(async (info) => {
    await new Promise((res) => setTimeout(res, o.noRoll ? 1400 : T.hold));
    const tgt = [".tc-shooter .readout", ".tc-hud .puck"].map((q) => document.querySelector(q)).find(onScreen);
    const tr = tgt ? R(tgt) : null;
    await Promise.all([...layer.querySelectorAll(".tt-die,.tt-shadow,.tt-plate")].map((el) => {
      const cur = getComputedStyle(el).transform;
      const to = (!o.noRoll && tr && mode !== "reduced" && el.classList.contains("tt-die")) ? `translate(${tr.left + tr.width / 2 - s / 2}px,${tr.top + tr.height / 2 - s / 2}px) scale(.45)` : cur;
      return el.animate([{ transform: cur, opacity: getComputedStyle(el).opacity }, { transform: to, opacity: 0 }], { duration: o.noRoll ? 300 : T.tuck, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" }).finished;
    }));
    layer.remove(); live = null; o.onDone?.(); return info;
  });
}
