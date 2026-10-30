/**
 * Point-made celebration. Shared by Bubble Craps and Table Craps.
 * Pointer-events none. Skippable. Never blocks a roll. Caps at 2.5s.
 */
import { formatMoney } from "./engine.mjs";

let live = null;
const hit = (a, b, pad = 6) => !(a.right + pad <= b.left || a.left >= b.right + pad || a.bottom + pad <= b.top || a.top >= b.bottom + pad);

function amountText(net) {
  if (!net) return "";
  const text = formatMoney(net);
  return (net > 0 ? "+" : "") + text.replace(/^\+/, "");
}

export function cancelCelebration() {
  if (!live) return;
  const { layer, timers, off } = live;
  live = null;
  timers.forEach(clearTimeout);
  off();
  layer.remove();
  document.body.classList.remove("pc-on");
}

export function celebratePoint(o) {
  cancelCelebration();
  const reduced = o.reduced != null ? o.reduced : (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const quiet = !!o.quiet;
  const big = !quiet && !!o.big;
  const tier = o.tier || "base";
  const sunburst = !quiet && (tier === "huge" || big);
  const cap = quiet ? 1200 : tier === "huge" ? 2500 : tier === "big" ? 2000 : 1200;
  const dur = Math.min(o.duration || cap, cap);
  const layer = document.createElement("div");
  layer.className = "pc-layer" + (sunburst ? " rays" : "") + (big ? " bigwin" : "") + (quiet ? " quiet" : "") + (reduced ? " reduce" : "");
  layer.style.setProperty("--pc-dur", Math.min(dur, reduced ? 1200 : dur) + "ms");
  layer.setAttribute("aria-hidden", "true");
  const targets = (o.targets || []).filter(Boolean);
  const tg = targets.map((el) => [el, el.getBoundingClientRect()]);
  const main = (tg[tg.length - 1] && tg[tg.length - 1][1]) || (tg[0] && tg[0][1]) || { left: innerWidth / 2 - 20, top: 80, width: 40, height: 40 };
  const cx = main.left + main.width / 2;
  const cy = main.top + main.height / 2;
  layer.style.setProperty("--cx", cx + "px");
  layer.style.setProperty("--cy", cy + "px");
  let html = "";
  if (!quiet && !reduced && sunburst) html += "<div class='pc-rays'></div>";
  tg.forEach(([el, r]) => {
    const puck = el.matches && el.matches(".puck,.puckimg,.feltpuck,[data-puck]");
    html += "<div class='pc-glow" + (puck ? " puck" : "") + "' style='left:" + (r.left - 3) + "px;top:" + (r.top - 3) + "px;width:" + (r.width + 6) + "px;height:" + (r.height + 6) + "px'></div>";
  });
  if (!quiet && !reduced) {
    const rad = Math.max(34, Math.min(64, main.width * 0.9));
    html += "<div class='pc-burst' style='left:" + cx + "px;top:" + cy + "px;--r:" + rad + "px'>" +
      Array.from({ length: 12 }, (_, i) => "<i style='--a:" + i + "'></i>").join("") +
      (o.chip ? [0, 1, 2, 3].map((i) => "<img src='" + o.chip + "' alt='' style='--a:" + i + "'>").join("") : "") +
      "</div>";
  }
  const line = o.line || ("Winner! Point is made: " + o.point + ".");
  const cheer = !quiet && o.cheer ? "<span class='cheer'>" + o.cheer + "</span>" : "";
  const sting = o.stinger ? "<span class='sting'>" + o.stinger + "</span>" : "";
  const amt = !quiet && o.net > 0 ? "<span class='amt'>" + amountText(o.net) + "</span>" : "";
  html += "<div class='pc-plate' data-mascot='billie' role='status'><img src='" + (o.billie || "") + "' alt=''>" +
    "<div><span class='who'>Dealer Billy calls it</span><b>" + line + "</b>" + cheer + amt + sting +
    (big ? "<span class='bigtag'>BIG WIN</span>" : "") + "</div></div>";
  layer.innerHTML = html;
  document.body.appendChild(layer);
  document.body.classList.add("pc-on");
  const plate = layer.querySelector(".pc-plate");
  const pw = plate.offsetWidth;
  const ph = plate.offsetHeight;
  const W = innerWidth;
  const H = innerHeight;
  const avoid = (o.avoid || []).filter(Boolean).map((el) => el.getBoundingClientRect());
  const clampX = (x) => Math.max(8, Math.min(W - pw - 8, x));
  const box = (c) => ({ left: c[0], top: c[1], right: c[0] + pw, bottom: c[1] + ph });
  const clearOf = (c) => !avoid.some((a) => hit(box(c), a));
  const raw = [
    [cx - pw / 2, main.bottom + 10],
    [cx - pw / 2, main.top - ph - 10],
    [8, H - ph - 12],
    [8, 8],
  ];
  const clamp = (c) => [clampX(c[0]), Math.max(4, Math.min(H - ph - 4, c[1]))];
  let pos = null;
  for (let i = 0; i < raw.length; i++) {
    if (!clearOf(raw[i])) continue;
    const next = clamp(raw[i]);
    if (clearOf(next)) { pos = next; break; }
  }
  if (!pos) pos = raw.map(clamp).find(clearOf) || [8, Math.max(56, H - ph - 8)];
  plate.style.left = pos[0] + "px";
  plate.style.top = pos[1] + "px";
  const timers = [];
  if (!quiet && o.sfx) o.sfx(sunburst ? "fanfare" : tier === "big" ? "run" : "win");
  if (!quiet && !reduced && o.haptic) {
    const pattern = o.tier === "huge" ? [20, 40, 20, 40, 30] : o.tier === "big" ? [15, 40, 15] : [15];
    o.haptic(pattern);
  }
  const skip = () => cancelCelebration();
  addEventListener("pointerdown", skip, { capture: true, passive: true });
  addEventListener("keydown", skip, { capture: true, passive: true });
  const off = () => {
    removeEventListener("pointerdown", skip, { capture: true });
    removeEventListener("keydown", skip, { capture: true });
  };
  if (!o.hold) timers.push(setTimeout(cancelCelebration, reduced ? Math.min(dur, 1200) : dur));
  live = { layer, timers, off };
  return { layer, dur };
}
