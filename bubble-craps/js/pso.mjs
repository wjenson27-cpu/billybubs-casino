// PSO (point-seven-out) moment. Spec rev 15c S4.4. NEW. Shared by Bubble Craps and Table Craps.
// It REPLACES the seven-out toast (its text line is the toast) and shares one "moment" slot with the
// point-hit celebration (./point-celebration.mjs, REUSE), so the two can never be on screen together.
import { cancelCelebration } from "./point-celebration.mjs";

let live = null;
const AB = (n) => "$" + Math.abs(Math.round(n / 100)).toLocaleString("en-US") + (Math.abs(n) % 100 ? "." + String(Math.abs(n) % 100).padStart(2, "0") : "");
const signed = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + AB(n);

/** True only for an element painted on the CURRENT pager page (v1b lesson: never target off-screen DOM). */
export function onScreen(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height || r.right <= 0 || r.bottom <= 0 || r.left >= innerWidth || r.top >= innerHeight) return false;
  const x = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
  const hitEl = document.elementFromPoint(x, y);
  if (!hitEl) return false;
  if (el === hitEl || el.contains(hitEl) || hitEl.contains(el) || hitEl.closest(".pso-layer,.pc-layer")) return true;
  const g = el.parentElement?.parentElement;              // pointer-events:none bet chips overhang their spot: same table block is enough
  return !!g && g.contains(hitEl);
}
const firstOnScreen = (list) => (list || []).flat().filter(Boolean).find(onScreen) || null;

/** Pick the version (S4.4). net is the whole-roll result in cents, after Fire/Repeater/HWAD. */
export function psoVariant({ hadBets, net, hand, record, fire, speed }) {
  const long = !!record || (hand && ((hand.points || 0) >= 3 || (hand.rolls || 0) >= 20));
  const side = !hadBets ? "nobets" : net > 0 ? "dark" : "light";
  const big = !!(fire && fire.pay > 0);                       // Fire 4/5 payout plays inside the PSO at the Big tier
  let dur = big || long ? 2000 : 1200;                        // Base 1.2 s · Big 2.0 s (PM-10); PSO never uses Huge
  if (speed === "fast") dur = big || long ? 1200 : 800;
  if (speed === "instant") dur = big || long ? 800 : 600;
  return { side, long, record: !!record, big, dur };
}

export const COPY = {
  bc: { light: "Seven out, line away. New hand’s coming.", dark: "Seven out! Pay the don’ts.", nobets: "Seven out. New hand’s coming.",
        long: "What a roll! Give those dice a hand.", record: "New Longest Roll! What a hand." },
  tc: { light: "Seven out, line away. Next shooter!", dark: "Seven out! Pay the don’ts.", nobets: "Seven out. Next shooter!",
        long: "What a roll, give the shooter a hand.", record: "New Longest Roll! Give the shooter a hand." },
};

export function cancelPSO() {
  if (!live) return;
  const { layer, timers, off } = live; live = null;
  timers.forEach(clearTimeout); off();
  layer.classList.add("out");
  document.querySelectorAll(".pso-clear").forEach((el) => el.classList.remove("pso-clear"));
  setTimeout(() => { layer.remove(); if (!live) document.body.classList.remove("pso-on"); }, 130);
}
/** Call at the start of every roll (and on any bet): clears PSO and point-hit alike. */
export function cancelMoments() { cancelPSO(); cancelCelebration(); }

/**
 * showPSO({ app:"bc"|"tc", point, d1, d2, net, hadBets, hand:{rolls,points}, record, fire:{points,pay},
 *   puck:[els], dice:[els], sweepFrom:[els], railTo:el, avoid:[els], billie:{light, long}, faces:"assets/dice/faces/",
 *   puckOn:"assets/icons/puck-on.svg", chip:"assets/chips/chip-25-value.svg", reduced, hold, sfx, haptic })
 */
function clearActionKey(layer) {
  const key = document.querySelector(".tc-shoot, .roll-btn");
  const dip = layer.querySelector(".pso-dip");
  if (!key || !dip) return;
  const r = key.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return;
  const x = Math.max(0, Math.round(r.left - 6));
  const y = Math.max(0, Math.round(r.top - 6));
  const rw = Math.round(r.width + 12);
  const rh = Math.round(r.height + 12);
  dip.style.clipPath = "path(evenodd, 'M0 0 H" + innerWidth + " V" + innerHeight + " H0 Z M" + x + " " + y + " h" + rw + " v" + rh + " h-" + rw + " Z')";
  key.classList.add("pso-clear");
}

export function showPSO(o) {
  cancelMoments();
  const v = psoVariant(o);
  const reduced = o.reduced ?? matchMedia("(prefers-reduced-motion: reduce)").matches;
  const app = o.app === "tc" ? "tc" : "bc";
  const L = document.createElement("div");
  L.className = "pso-layer " + v.side + (v.long ? " long" : "") + (v.big ? " big" : "") + (reduced ? " reduce" : "");
  L.style.setProperty("--pso-dur", v.dur + "ms");
  L.setAttribute("aria-hidden", "true");
  const R = (el) => el.getBoundingClientRect();
  const puck = firstOnScreen(o.puck), dice = firstOnScreen(o.dice);
  let h = v.side === "nobets" ? "" : "<div class='pso-dip'></div>";
  if (puck) { const r = R(puck);
    h += `<div class="pso-puck" style="left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;background-image:url(${o.puckOn})"></div>` +
         `<div class="pso-settle" style="left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px"></div>`; }
  if (dice && v.side !== "nobets") { const r = R(dice);
    h += `<div class="pso-cool" style="left:${r.left - 2}px;top:${r.top - 2}px;width:${r.width + 4}px;height:${r.height + 4}px"></div>` +
         `<div class="pso-steam" style="left:${r.left + r.width / 2}px;top:${r.top}px">` + [-16, -8, 0, 8, 16].map((x, i) => `<i style="--x:${x};--d:${i}"></i>`).join("") + "</div>"; }
  if (v.side !== "nobets") {
    const from = (o.sweepFrom || []).filter(onScreen).slice(0, 6);
    const rail = o.railTo && onScreen(o.railTo) ? R(o.railTo) : null;
    const delay = v.long ? 800 : 200;
    const avoidR = (o.avoid || []).filter((a) => onScreen(a) && a !== o.railTo).map(R); // chips may land on the rail, never cross ROLL/SHOOT
    const segClear = (x0, y0, x1, y1) => avoidR.every((a) => { for (let k = 0; k <= 20; k++) { const x = x0 + (x1 - x0) * k / 20, y = y0 + (y1 - y0) * k / 20;
      if (x > a.left - 12 && x < a.right + 12 && y > a.top - 12 && y < a.bottom + 12) return false; } return true; });
    from.forEach((el, i) => { const r = R(el), x = r.left + r.width / 2, y = r.top + r.height / 2;
      // dark: slide to the player's rail; light: up and away to the dealer edge. L-shaped path picked so no chip ever crosses ROLL/SHOOT.
      const ex = v.side === "dark" && rail ? rail.left + Math.min(40, rail.width / 4) + i * 6 : x, ey = v.side === "dark" && rail ? rail.top + rail.height / 2 : -30;
      const paths = [[ex, y], [x, ey], [(x + ex) / 2, (y + ey) / 2]];
      const via = paths.find(([mx, my]) => segClear(x, y, mx, my) && segClear(mx, my, ex, ey));
      if (!via) return;                                     // no clear route: that chip just fades in place with the dip
      h += `<i class="pso-chip" style="left:${x}px;top:${y}px;--mx:${via[0] - x}px;--my:${via[1] - y}px;--tx:${ex - x}px;--ty:${ey - y}px;--sd:${delay + i * 40}ms;background-image:url(${o.chip})"></i>`; });
  }
  // plate: the merged seven-out toast. Billy's call is TEXT only; Billie (one mascot) consoles on a light-side loss.
  const C = COPY[app];
  const call = v.record ? C.record : v.long ? C.long : C[v.side];
  const pose = v.side === "light" ? (v.long ? o.billie?.long : o.billie?.light) : v.long ? o.billie?.long : null; // dark: Billie doesn't cheer
  const tag = v.record ? `<span class="tag rec">LONGEST ROLL · ${o.hand.rolls} ROLLS</span>`
    : v.long ? `<span class="tag">HAND OVER · ${o.hand.rolls} ROLLS · ${o.hand.points || 0} PTS</span>` : "";
  const fire = v.big ? `<span class="tag fire">FIRE ${o.fire.points} +${AB(o.fire.pay)}</span>` : "";
  const net = o.hadBets ? `<span class="net${o.net > 0 ? " up" : ""}">Net ${signed(o.net)}</span>` : "";
  const faces = o.faces || "assets/dice/faces/";
  const label = `Seven out. Point was ${o.point}. ` + (o.hadBets ? `Net result ${o.net >= 0 ? "plus" : "minus"} ${Math.abs(o.net / 100)} dollars.` : "No bets.");
  h += `<div class="pso-plate" data-mascot="${pose ? "billie" : "none"}" role="status" aria-live="polite" aria-label="${label}">` +
    (pose ? `<img class="billie" src="${pose}" alt="">` : "") +
    `<span class="rd"><img src="${faces}face-${o.d1}.svg" alt=""><img src="${faces}face-${o.d2}.svg" alt=""><b>7</b></span>` +
    `<span class="tx">${tag || fire ? `<span class="tagrow">${tag}${fire}</span>` : ""}<span class="readcall">SEVEN OUT · POINT WAS ${o.point}</span><span class="call">${call}</span>${net}</span></div>`;
  L.innerHTML = h;
  document.body.appendChild(L);
  clearActionKey(L);
  document.body.classList.add("pso-on");
  L.setAttribute("aria-hidden", "false");
  // place the plate under the HUD on the current page; never over ROLL/SHOOT/dock
  const P = L.querySelector(".pso-plate"), pw = P.offsetWidth, ph = P.offsetHeight, W = innerWidth, H = innerHeight;
  const avoid = (o.avoid || []).filter((el) => {
    if (!el) return false;
    const r = R(el);
    return r.width > 2 && r.height > 2 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  }).map(R);
  const top0 = puck ? R(puck).bottom + 8 : 56;
  const cx = puck ? R(puck).left + R(puck).width / 2 : W / 2;
  const box = ([x, y]) => ({ left: x, top: y, right: x + pw, bottom: y + ph + 20 });
  const clear = (b) => avoid.every((a) => b.right <= a.left || b.left >= a.right || b.bottom <= a.top || b.top >= a.bottom);
  const fits = (b) => b.left >= 4 && b.right <= W - 4 && b.top >= 4 && b.bottom <= H - 4;
  const xs = [W / 2 - pw / 2, cx - pw / 2, 8, W - pw - 8].map((x) => Math.max(8, Math.min(W - pw - 8, x)));
  const ys = [top0, 8];
  for (let y = 8; y <= H - ph - 8; y += 16) ys.push(y);
  let pos = null;
  for (const y of ys) {
    for (const x of xs) {
      if (fits(box([x, y])) && clear(box([x, y]))) { pos = [x, y]; break; }
    }
    if (pos) break;
  }
  pos = pos || [8, 8];
  P.style.left = pos[0] + "px"; P.style.top = pos[1] + "px";
  // sound/haptic (REUSE MOTION-SOUND-SPEC M4 names): no buzzer, no trombone
  const sfx = o.sfx || ((n) => dispatchEvent(new CustomEvent("bb:sfx", { detail: { name: n } })));
  const hap = o.haptic || ((n) => dispatchEvent(new CustomEvent("bb:haptic", { detail: { name: n } })));
  sfx("pso_" + v.side);                                   // maps to M4 `seven_out` (+ `chip_sweep`); dark adds `chip_slide`; nobets = `puck_clack` only
  if (v.big) sfx("fire_payout");
  hap(v.side === "dark" ? "success" : "tick");
  const timers = [];
  const skip = () => cancelPSO();
  addEventListener("pointerdown", skip, { capture: true, passive: true });
  addEventListener("keydown", skip, { capture: true, passive: true });
  const off = () => { removeEventListener("pointerdown", skip, { capture: true }); removeEventListener("keydown", skip, { capture: true }); };
  if (!o.hold) timers.push(setTimeout(cancelPSO, v.dur));   // always auto-hides
  live = { layer: L, timers, off };
  return { variant: v, plate: pos, puck: !!puck, dice: !!dice };
}
