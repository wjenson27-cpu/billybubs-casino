/**
 * On-table dice throw for Table Craps (rev 16).
 * Reuses tc-dice cssMatrix / orient and the TC cube.
 * The result is decided before this runs. onSettle fires when the dice rest.
 */
import { cssMatrix } from "./tc-dice.mjs";

const A = "../assets/";
const VIEW = "rotateX(-56deg) rotateY(-18deg)";
export const TIMING = {
  normal: { dur: 1180, hold: 450, tuck: 260 },
  fast: { dur: 420, hold: 250, tuck: 200 },
  instant: { dur: 150, hold: 200, tuck: 160 },
  reduced: { dur: 180, hold: 300, tuck: 120 },
};
const K = [0, 0.18, 0.4, 0.55, 0.62, 0.7, 0.86, 1];
let live = null;

export function onScreen(el) {
  if (!el || typeof document === "undefined") return false;
  const r = el.getBoundingClientRect();
  if (!r.width || r.right <= 0 || r.bottom <= 0 || r.left >= innerWidth || r.top >= innerHeight) return false;
  const h = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2)));
  return !!h && (el.contains(h) || h.contains(el));
}
const R = (e) => e.getBoundingClientRect();
const hit = (a, b, m = 0) => !(a.right + m <= b.left || a.left - m >= b.right || a.bottom + m <= b.top || a.top - m >= b.bottom);
const box = (x, y, w, h) => ({ left: x, top: y, right: x + w, bottom: y + h });

export function surface() {
  const felt = document.querySelector("#felt");
  const tray = document.querySelector(".tc-shooter .table");
  if (onScreen(felt)) return { el: felt, kind: "felt" };
  if (onScreen(tray)) return { el: tray, kind: "tray" };
  return null;
}

export function amountRects(el) {
  return [...el.querySelectorAll(".bet, .amt, [class*='amt'], [class*='stake']")].concat([...el.querySelectorAll("*")].filter((n) => !n.children.length && /\$\s?\d/.test(n.textContent)))
    .map(R).filter((r) => r.width > 0);
}
function avoidRects() {
  return [".tc-shoot", ".tc-rail", ".tc-dock", ".tc-hud", ".tc-keys"].map((s) => document.querySelector(s)).filter(onScreen).map(R);
}

export function landing(S, s, fy) {
  const r = R(S.el);
  const bets = amountRects(S.el);
  const av = avoidRects();
  const q = s * 1.8;
  const st = 4;
  const ty = r.top + r.height * (fy ?? (S.kind === "tray" ? 0.6 : 0.34));
  const tx = r.left + r.width / 2;
  const spots = [];
  for (let y = r.top + s * 0.5; y + q + s * 0.35 <= r.bottom - s * 0.1; y += st) {
    for (let x = r.left + s * 0.3; x + q <= r.right - s * 0.3; x += st) {
      const b = box(x, y, q, q + s * 0.35);
      if (av.some((o) => hit(b, o, 6))) continue;
      spots.push({ x: x + q / 2, y: y + q / 2, b, n: bets.filter((o) => hit(b, o, 6)).length });
    }
  }
  if (!spots.length) return null;
  const pick = (score, not) => {
    let best = null;
    for (const p of spots) {
      if (not && hit(p.b, not.b, 2)) continue;
      const sc = score(p) + p.n * 1e5;
      if (!best || sc < best.sc) best = Object.assign({}, p, { sc });
    }
    return best;
  };
  const A = pick((p) => Math.abs(p.y - ty) + Math.abs(p.x - tx) * 0.5);
  const B = pick((p) => Math.hypot(p.x - (A.x + s * 1.2), p.y - (A.y + s * 0.15)), A) || A;
  const pt = (p) => ({ x: p.x, y: p.y, lift: p.n ? s * 0.6 : 0 });
  return { dice: [pt(A), pt(B)], lift: !!(A.n || (B && B.n)), lane: [A.b, B.b] };
}

function legalFront(top, k) {
  return [2, 3, 1, 5, 4, 6].filter((f) => f !== top && f + top !== 7)[k % 4];
}
const cube = (top, front, s) => "<div class=\"tc-cube\" style=\"--s:" + s + "px\" data-top=\"" + top + "\" data-front=\"" + front + "\"><div class=\"c\" style=\"transform:" + VIEW + " " + cssMatrix(top, front) + "\">" + [1, 2, 3, 4, 5, 6].map((f) => "<i class=\"f f" + f + "\" style=\"background-image:url(" + A + "dice/faces/face-" + f + ".svg)\"></i>").join("") + "</div></div>";

export function cancelThrow() {
  if (!live) return;
  live.anims.forEach((a) => { try { a.finish(); } catch { /* already done */ } });
}

export function dieSize(rect, kind) {
  const raw = kind === "tray" ? rect.height * 0.34 : Math.min(rect.width * 0.07, rect.height * 0.085);
  return Math.round(Math.max(26, Math.min(44, raw)));
}

export function throwDice(o) {
  const reduced = o.reduced != null ? o.reduced : (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const mode = reduced ? "reduced" : (o.speed || "normal");
  const T = TIMING[mode] || TIMING.normal;
  const sfx = o.sfx || (() => {});
  const hap = o.haptic || (() => {});
  const done = () => { if (o.onDone) o.onDone(); };
  const settle = () => { if (o.onSettle) o.onSettle(o.d1, o.d2); };
  const S = typeof document === "undefined" ? null : surface();
  if (!S) { if (!o.noRoll) settle(); done(); return Promise.resolve({ page: "none" }); }
  const r = R(S.el);
  const s = dieSize(r, S.kind);
  const L = landing(S, s, o.noRoll ? 0.72 : null);
  if (typeof window !== "undefined") window.__ttLast = { L, s, kind: S.kind };
  if (!L) { if (!o.noRoll) settle(); done(); return Promise.resolve({ page: S.kind, missed: true }); }
  const layer = document.createElement("div");
  layer.className = "tt-layer";
  layer.setAttribute("aria-hidden", "true");
  const tops = o.noRoll
    ? (o.set || [{ top: 3, front: 5 }, { top: 3, front: 1 }])
    : [{ top: o.d1, front: legalFront(o.d1, 0) }, { top: o.d2, front: legalFront(o.d2, 1) }];
  layer.innerHTML = tops.map((t, i) => "<div class=\"tt-shadow\" data-i=\"" + i + "\" style=\"--s:" + s + "px\"></div><div class=\"tt-die\" data-i=\"" + i + "\" style=\"--s:" + s + "px;width:" + s + "px;height:" + s + "px\">" + cube(t.top, t.front, s) + "</div>").join("") +
    (o.lane ? L.lane.map((b) => "<div class=\"tt-lane\" style=\"left:" + b.left + "px;top:" + b.top + "px;width:" + (b.right - b.left) + "px;height:" + (b.bottom - b.top) + "px\"></div>").join("") : "");
  document.body.appendChild(layer);
  const anims = [];
  live = { layer, anims };
  const wallY = r.top + s * 0.55;
  const startY = r.bottom - s * 0.5;
  [0, 1].forEach((i) => {
    const die = layer.querySelector(".tt-die[data-i=\"" + i + "\"]");
    const sh = layer.querySelector(".tt-shadow[data-i=\"" + i + "\"]");
    const c = die.querySelector(".c");
    const lx = L.dice[i].x;
    const ly = L.dice[i].y;
    const sx = r.left + r.width * (i ? 0.56 : 0.48);
    const wx = Math.min(r.right - s, Math.max(r.left + s, lx + (i ? -s * 0.4 : s * 0.5)));
    const lerp = (a, b, t) => a + (b - a) * t;
    let pts;
    if (o.noRoll) {
      pts = [[sx, startY, s * 0.3], [lerp(sx, lx, 0.3), lerp(startY, ly, 0.3), s * 0.8], [lerp(sx, lx, 0.55), lerp(startY, ly, 0.55), s * 0.1], [lerp(sx, lx, 0.7), lerp(startY, ly, 0.7), 0], [lerp(sx, lx, 0.8), lerp(startY, ly, 0.8), s * 0.15], [lerp(sx, lx, 0.9), lerp(startY, ly, 0.9), 0], [lerp(sx, lx, 0.97), lerp(startY, ly, 0.97), 0], [lx, ly, 0]];
    } else {
      pts = [[sx, startY, s * 0.4], [lerp(sx, wx, 0.55), lerp(startY, wallY, 0.6), s * 1.6], [wx, wallY, s * 0.3], [lerp(wx, lx, 0.6), lerp(wallY, ly, 0.6), 0], [lerp(wx, lx, 0.75), lerp(wallY, ly, 0.75), s * 0.35], [lerp(wx, lx, 0.88), lerp(wallY, ly, 0.88), 0], [lx + s * 0.05, ly, s * 0.04], [lx, ly, 0]];
    }
    pts[pts.length - 1][2] = o.noRoll ? 0 : L.dice[i].lift;
    const k = (y, hh) => (0.9 + 0.1 * (y - r.top) / r.height) * (1 + hh / (6 * s));
    const tf = ([x, y, hh]) => "translate(" + (x - s / 2) + "px," + (y - s / 2 - hh) + "px) scale(" + k(y, hh).toFixed(3) + ")";
    const stf = ([x, y, hh]) => "translate(" + x + "px," + (y + s * 0.38) + "px) scale(" + Math.max(0.45, 1 - hh / (3 * s)).toFixed(3) + ")";
    const fin = VIEW + " " + cssMatrix(tops[i].top, tops[i].front);
    const spin = [[40, 20, 8], [250, 150, 36], [470, 250, -16], [620, 300, 10], [700, 340, -6], [740, 355, 4]].map(([a, b, z]) => VIEW + " rotateX(" + (i ? -a : a) + "deg) rotateY(" + (i ? b + 90 : b) + "deg) rotateZ(" + z + "deg)");
    const delay = i ? Math.round(T.dur * 0.035) : 0;
    let offs = K.slice();
    if (mode === "instant" || mode === "reduced") {
      const end = pts[pts.length - 1];
      anims.push(die.animate([{ transform: tf(end), opacity: 0 }, { transform: tf(end), opacity: 1 }], { duration: T.dur, fill: "forwards" }));
      anims.push(sh.animate([{ transform: stf(end), opacity: 0 }, { transform: stf(end), opacity: 0.5 }], { duration: T.dur, fill: "forwards" }));
      c.style.transform = fin;
      return;
    }
    if (mode === "fast" && !o.noRoll) {
      pts = pts.slice(2);
      offs = K.slice(2).map((v) => (v - 0.4) / 0.6);
    }
    anims.push(die.animate(pts.map((p, j) => ({ offset: offs[j], transform: tf(p), opacity: 1 })), { duration: T.dur, delay, easing: "linear", fill: "both" }));
    anims.push(sh.animate(pts.map((p, j) => ({ offset: offs[j], transform: stf(p), opacity: Math.max(0.15, 0.55 - p[2] / (4 * s)) })), { duration: T.dur, delay, fill: "both" }));
    let cframes;
    if (o.noRoll) cframes = [{ offset: 0, transform: VIEW + " rotateX(" + (i ? -30 : 30) + "deg) rotateY(20deg)" }, { offset: 0.5, transform: VIEW + " rotateX(" + (i ? -120 : 120) + "deg) rotateY(60deg)" }, { offset: 0.9, transform: fin }, { offset: 1, transform: fin }];
    else {
      const sp = (mode === "fast" ? spin.slice(2) : spin).slice();
      if (mode !== "fast" && o.set && o.set[i] && o.set[i].top && o.set[i].front) {
        sp[0] = VIEW + " " + cssMatrix(o.set[i].top, o.set[i].front);
      }
      cframes = sp.map((t, j) => ({ offset: offs[j], transform: t })).concat([{ offset: offs[offs.length - 2], transform: fin + " rotateZ(" + (i ? -6 : 6) + "deg)" }, { offset: 1, transform: fin }]);
      cframes.sort((a, b) => a.offset - b.offset);
      cframes = cframes.filter((f, j, a) => j === 0 || f.offset > a[j - 1].offset);
      cframes[cframes.length - 1] = { offset: 1, transform: fin };
    }
    anims.push(c.animate(cframes, { duration: T.dur, delay, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" }));
  });
  const timers = [];
  if (!o.noRoll && (mode === "normal" || mode === "fast")) {
    const tw = mode === "fast" ? 0 : T.dur * K[2];
    timers.push(setTimeout(() => {
      sfx("dice_wall");
      hap("light");
      if (typeof document !== "undefined") {
        document.querySelectorAll(".tc-felt-wall, .tc-shooter .wall").forEach((w) => {
          w.classList.add("hit");
          setTimeout(() => w.classList.remove("hit"), 260);
        });
      }
    }, tw));
    timers.push(setTimeout(() => sfx("dice_felt"), T.dur * (mode === "fast" ? 0.25 : K[3])));
  }
  const skip = (e) => {
    const p = e.touches ? e.touches[0] : e;
    const rr = R(S.el);
    if (p.clientX >= rr.left && p.clientX <= rr.right && p.clientY >= rr.top && p.clientY <= rr.bottom) cancelThrow();
  };
  addEventListener("pointerdown", skip, { capture: true, passive: true });
  const settled = Promise.all(anims.map((a) => a.finished.catch(() => {}))).then(() => {
    timers.forEach(clearTimeout);
    removeEventListener("pointerdown", skip, { capture: true });
    if (o.noRoll) {
      sfx("no_roll");
      const pl = document.createElement("div");
      pl.className = "tt-plate";
      pl.setAttribute("role", "status");
      pl.innerHTML = "<b>NO ROLL · PRACTICE</b>The dice must hit the back wall. Throw again; this one doesn't count.";
      layer.appendChild(pl);
    } else { sfx("dice_settle"); settle(); }
    return { lane: L, s, kind: S.kind, mode, tops };
  });
  if (o.hold) return settled;
  return settled.then(async (info) => {
    await new Promise((res) => setTimeout(res, o.noRoll ? 200 : T.hold));
    const nodes = [...layer.querySelectorAll(".tt-die,.tt-shadow,.tt-plate")];
    await Promise.all(nodes.map((el) => {
      const cur = getComputedStyle(el).transform;
      return el.animate([{ transform: cur, opacity: 1 }, { transform: cur, opacity: 0 }], { duration: T.tuck, fill: "forwards" }).finished.catch(() => {});
    }));
    layer.remove();
    live = null;
    done();
    return info;
  });
}
