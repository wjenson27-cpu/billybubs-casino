// Round 5 design prototype (no build). Injected into a COPY of each app: <script type="module" src="/round5/proto/r5.mjs">.
// ?r5=history|historyall|dice|rules|speed|quick|drill|drillfb   ?pg=0|1|2 (pager page)   ?chrome=0 (hide HUD, iPad right column)
// ?throw=4-3&speed=normal|fast|instant&reduce=1&noroll=1&lane=1 (Table only): on-table dice throw demo; double-click replays
const Q = new URLSearchParams(location.search);
const S = Q.get("r5") || "", APP = location.pathname.includes("/table/") ? "tc" : "bc";
const A = APP === "tc" ? "../assets/" : "assets/";
const $ = (s, r = document) => r.querySelector(s);
const money = (c) => (c < 0 ? "−" : "") + "$" + Math.abs(c).toLocaleString("en-US");
const sgn = (c) => (c > 0 ? "+" : "") + money(c);
const face = (n, s = 32) => `<img src="${A}dice/faces/face-${n}.svg" width="${s}" height="${s}" alt="${n}">`;
const chip = (v) => `<img src="${A}chips/chip-${v}-value.svg" alt="$${v} chip">`;
const BC = APP === "bc", WORD = BC ? { roll: "ROLL", hand: "hand" } : { roll: "SHOOT", hand: "shooter" };
const SHEETS = ["history", "historyall", "rules", "speed", "drill", "drillfb"];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms = 8000) { const t = performance.now(); while (performance.now() - t < ms) { const v = fn(); if (v) return v; await wait(60); } return null; }

async function boot() {
  if (BC) {
    const play = await until(() => $("button[data-act='play'][data-mode='regular']") || $("#dock .roll-btn,[data-act='roll']"), 6000);
    if (play && play.matches("[data-act='play']")) play.click();
    await until(() => $("[data-act='roll']"));
  } else await until(() => $(".tc-shoot"));
  await wait(350);
  if (!BC && Q.get("throw")) {   // on-table throw demo: ?throw=4-3&speed=normal|fast|instant&reduce=1&noroll=1&lane=1&pg=N ; tap the page to replay
    if (Q.get("pg")) { $(`[data-page='${Q.get("pg")}']`)?.click(); await wait(450); }
    const T = await import("/round5/throw/throw.mjs"), [d1, d2] = Q.get("throw").split("-").map(Number);
    const go = () => T.throwDice({ d1, d2, speed: Q.get("speed") || "normal", reduced: Q.get("reduce") === "1" ? true : undefined, noRoll: Q.get("noroll") === "1", lane: Q.get("lane") === "1" });
    await wait(300); go(); addEventListener("dblclick", go);
    return;
  }
  const pg = Q.get("pg") ?? (!BC && S === "dice" ? "2" : null);   // TC: manual dice live on the shooter page, SHOOT commits
  if (pg != null) {
    if (BC) { for (let i = 0; i < 3; i++) document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
      for (let i = 0; i < +pg; i++) document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })); }
    else { const d = $(`[data-page="${pg}"]`); if (d) d.click(); else if (pg === "2") $("[data-act='go-shooter']")?.click(); }
    await wait(450);
  }
  if (Q.get("zoom")) document.documentElement.style.zoom = Q.get("zoom");   // iPad: scale a phone page up to its column
  if (Q.get("chrome") === "0") { const h = $(BC ? "#hud" : ".tc-hud"); if (h) h.style.display = "none"; }
  render(); addEventListener("resize", () => render());
}

const rollBtn = () => $(BC ? "[data-act='roll']" : ".tc-shoot");
const dockTop = () => { const d = $(BC ? "#dock" : ".tc-dock"); const r = rollBtn()?.getBoundingClientRect(); return Math.min(d ? d.getBoundingClientRect().top : innerHeight, r ? r.top : innerHeight); };
// Free area for non-modal panels: above the dock in portrait; left of the dock column in landscape (dock = right column).
function freeArea() { const d = $(BC ? "#dock" : ".tc-dock"), r = d && d.getBoundingClientRect();
  if (r && r.height > innerHeight * 0.55) return { left: 6, right: r.left - 6, bottom: innerHeight - 30, side: true };
  return { left: 6, right: innerWidth - 6, bottom: dockTop() - 6, side: false }; }
const shortLand = () => innerWidth > innerHeight && innerHeight < 400;

function sheet(kicker, title, body, foot = "", wide = false) {
  document.body.classList.add("r5-modal");
  if (shortLand()) return `<div class="r5-scrim rot"><div class="r5-sheet" role="dialog" aria-label="${title}"><div class="r5-rotate"><div class="ph" aria-hidden="true"></div>
    <div style="flex:1"><h2>Turn your phone upright</h2><p>${title} needs the full height. Your bets and the table stay exactly as they are.</p></div><button class="r5-x" aria-label="Close">×</button></div></div></div>`;
  return `<div class="r5-scrim"><div class="r5-sheet" role="dialog" aria-label="${title}" ${wide ? "style='max-width:760px'" : ""}>
    <div class="r5-head"><div class="t"><small>${kicker}</small><h1>${title}</h1></div><button class="r5-x" aria-label="Close">×</button></div>
    <div class="r5-body">${body}</div>${foot ? `<div class="r5-foot">${foot}</div>` : ""}</div></div>`;
}

const sw = (c, dash) => `<svg width="30" height="10" aria-hidden="true"><line x1="0" x2="30" y1="5" y2="5" stroke="${c}" stroke-width="2.6" stroke-dasharray="${dash}"/></svg>`;
const yours = `<span class="r5-yours">YOURS</span>`;

/* ---------- 1. Sessions (rev 16 S8; checklist §20 SH-01..12) ---------- */
function walk(seed, n, start, step) { let s = seed, b = start; const out = [b], so = []; for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) % 2147483648; const r = s / 2147483648;
  b += r < .26 ? -step * 2 : r < .5 ? -step : r < .78 ? step : r < .94 ? step * 2 : -step * 3; if (r >= .94) so.push(i + 1); out.push(b); } return { pts: out, so }; }
const SESS = (BC ? [["Today · 11:40 AM", "Regular · Billy's Way", 118, 11], ["Mon Oct 12 · 8:05 PM", "Crapless · Pass + Odds", 74, 23], ["Sun Oct 11 · 3:12 PM", "Regular · Iron Cross", 96, 5], ["Sat Oct 10 · 9:47 PM", "Regular · no strategy", 41, 3]]
  : [["Today · 11:40 AM", "Standard · T4 3-Point Molly", 118, 11], ["Mon Oct 12 · 8:05 PM", "Standard · T6 $44 Inside", 74, 23], ["Sun Oct 11 · 3:12 PM", "High limit · T2 Don't Pass", 96, 5], ["Sat Oct 10 · 9:47 PM", "Standard · no strategy", 41, 3]])
  .map(([d, nm, rolls, seed], i) => { const w = walk(seed, rolls, 1000, BC ? 6 : 12); const pts = w.pts, end = pts[pts.length - 1]; let pk = pts[0], dd = 0; pts.forEach((v) => { pk = Math.max(pk, v); dd = Math.max(dd, pk - v); });
    return { d, nm, rolls, pts, so: w.so, net: end - 1000, end, hi: Math.max(...pts), lo: Math.min(...pts), dd, ddp: Math.round(dd / Math.max(...pts) * 1000) / 10, hands: Math.max(3, w.so.length), long: 9 + i * 3,
      lim: ["loss 40% kept · goal +30% not reached", "no limits set", "loss 40% kept", "no limits set"][i] }; });
function chartSVG({ series, lines = [], ticks = [], dots = [], bars = null, W = 600, H = 220, label }) {
  const all = series.flatMap((s) => s.pts).concat(lines.map((l) => l.y)); const lo = Math.min(...all) - 20, hi = Math.max(...all) + 20, n = Math.max(...series.map((s) => s.pts.length - 1));
  const X = (i) => 44 + (i / n) * (W - 56), Y = (v) => 12 + (1 - (v - lo) / (hi - lo)) * (H - 40);
  const grid = [lo + 20, (lo + hi) / 2, hi - 20].map((v) => `<line x1="44" x2="${W - 12}" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(255,255,255,.08)"/><text x="4" y="${Y(v) + 4}">${v < 0 ? "−" : ""}$${Math.abs(Math.round(v))}</text>`).join("");
  const B = bars ? bars.map((v, i) => `<rect x="${X(i + 1) - 7}" width="14" y="${Math.min(Y(0), Y(v))}" height="${Math.abs(Y(v) - Y(0))}" fill="#56B4E9" opacity=".45"/>`).join("") : "";
  const L = lines.map((l) => `<line x1="44" x2="${W - 12}" y1="${Y(l.y)}" y2="${Y(l.y)}" stroke="${l.c}" stroke-width="1.6" stroke-dasharray="${l.dash}"/>`).join("");
  const P = series.map((s) => `<polyline fill="none" stroke="${s.c}" stroke-width="${s.w || 2.4}" stroke-dasharray="${s.dash || ""}" stroke-linejoin="round" points="${s.pts.map((v, i) => X(i).toFixed(1) + "," + Y(v).toFixed(1)).join(" ")}"/>`).join("");
  const T = ticks.map((i) => `<line x1="${X(i)}" x2="${X(i)}" y1="${H - 28}" y2="${H - 21}" stroke="#FF8D8D" stroke-width="2"/>`).join("");
  const D = dots.map(([i, v]) => `<circle cx="${X(i)}" cy="${Y(v)}" r="5" fill="#CC79A7" stroke="#fff" stroke-width="1.5"/>`).join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${grid}${B}${L}${P}${T}${D}<text x="44" y="${H - 6}">${bars ? "Oldest" : "Roll 1"}</text><text x="${W - 12}" y="${H - 6}" text-anchor="end">${bars ? "Newest" : "Roll " + n}</text></svg>`;
}
const FOOT = `<p class="r5-note r5-chartfoot">Practice chips. Past sessions don't predict future rolls.</p>`;
function history(all) {
  const cur = SESS[0];
  const tabs = `<div class="r5-seg" role="tablist"><button class="${all ? "" : "on"}" role="tab">This session</button><button class="${all ? "on" : ""}" role="tab">All sessions${all ? "" : " 🔒"}</button><button role="tab">Your Dice</button></div>`;
  let body;
  if (!all) {
    const lim = 600, goal = 1300, sum = `Session of Oct 13: started $1,000, ended ${money(cur.end)}; low ${money(cur.lo)} at roll ${cur.pts.indexOf(cur.lo)}; high ${money(cur.hi)} at roll ${cur.pts.indexOf(cur.hi)}`;
    body = tabs + `<figure class="r5-chart" style="margin:8px 0 0">${chartSVG({ series: [{ pts: cur.pts, c: "var(--cmp-1)" }], lines: [{ y: 1000, c: "var(--cmp-6)", dash: "6 5" }, { y: lim, c: "var(--cmp-5)", dash: "2 4" }, { y: goal, c: "var(--cmp-3)", dash: "10 4 2 4" }], ticks: cur.so, label: sum })}</figure>
    <div class="r5-tip" aria-hidden="true">Roll 31 · ${face(2, 20)}${face(5, 20)}<span class="tot">7</span> SEVEN OUT · net so far ${sgn(cur.pts[31] - 1000)}</div>
    <ul class="r5-legend"><li>${sw("var(--cmp-1)", "")}<span>Practice chips total</span><b>${money(cur.end)}</b></li><li>${sw("var(--cmp-6)", "6 5")}<span>Start</span><b>$1,000</b></li>
    <li>${sw("var(--cmp-5)", "2 4")}<span>Loss limit (40%)</span><b>$600</b></li><li>${sw("var(--cmp-3)", "10 4 2 4")}<span>Win goal (+30%)</span><b>$1,300</b></li><li><svg width="30" height="10" aria-hidden="true"><line x1="15" x2="15" y1="1" y2="9" stroke="#FF8D8D" stroke-width="2"/></svg><span>Seven out</span><b>${cur.so.length}</b></li></ul>
    <div class="r5-sum r5-sum8"><div><small>START → END</small><b>$1,000 → ${money(cur.end)}</b></div><div><small>NET</small><b>${sgn(cur.net)}</b></div><div><small>PEAK</small><b>${money(cur.hi)}</b></div><div><small>LOW</small><b>${money(cur.lo)}</b></div>
      <div><small>MAX DRAWDOWN</small><b>${money(cur.dd)} (${cur.ddp}%)</b></div><div><small>ROLLS</small><b>${cur.rolls}</b></div><div><small>HANDS</small><b>${cur.hands}</b></div><div><small>LONGEST HAND</small><b>${cur.long} rolls</b></div></div>
    <button class="r5-btn r5-astable">Show as table</button>${FOOT}`;
  } else {
    let run = 0; const cum = [0], nets = SESS.slice().reverse().map((s) => s.net); nets.forEach((v) => { run += v; cum.push(run); });
    const hiS = Math.max(...nets), loS = Math.min(...nets);
    body = tabs + `<p class="r5-note"><span class="r5-tag prem">PREMIUM</span> The all-time chart, the full list and filters are Premium. Free keeps this session's chart, your last 20 sessions and the totals.</p>
    <figure class="r5-chart" style="margin:6px 0 0">${chartSVG({ series: [{ pts: cum, c: "var(--cmp-2)" }], lines: [{ y: 0, c: "var(--cmp-6)", dash: "6 5" }], bars: nets, label: "Cumulative practice result over 4 sessions: " + sgn(run) })}</figure>
    <ul class="r5-legend"><li>${sw("var(--cmp-2)", "")}<span>Cumulative practice result</span><b>${sgn(run)}</b></li><li><svg width="30" height="10" aria-hidden="true"><rect x="8" y="1" width="14" height="8" fill="#56B4E9" opacity=".45"/></svg><span>Each session's net</span><b>${SESS.length}</b></li></ul>
    <p class="r5-note">A Reset bankroll ends a session and never counts as a gain.</p>
    <div class="r5-presets r5-filters"><button class="on">All modes</button><button>Rule preset ▾</button><button>Limit tier ▾</button><button>Strategy ▾</button></div>
    <div class="r5-sum"><div><small>SESSIONS</small><b>${SESS.length}</b></div><div><small>ROLLS</small><b>${SESS.reduce((a, s) => a + s.rolls, 0)}</b></div><div><small>HIGHEST SESSION</small><b>${sgn(hiS)}</b></div><div><small>LOWEST SESSION</small><b>${sgn(loS)}</b></div></div>${FOOT}`;
  }
  const list = `<div class="r5-k">SESSIONS · LAST 20 FREE</div><div class="r5-list">${SESS.map((s, i) => `<button class="r5-row ${i === 0 ? "on" : ""}"><i></i><span class="nm"><b>${s.d}</b><small>${s.nm} · ${s.rolls} rolls · ${s.lim}</small></span><span class="pl">${sgn(s.net)}<small>${money(s.end)}</small></span></button>`).join("")}</div>`;
  return sheet(BC ? "MENU · SESSIONS" : "STATS · SESSIONS", "Sessions", body + list, `<button class="r5-btn">Fair Dice<small>actual vs expected</small></button><button class="r5-btn">Sessions CSV <span class="r5-tag prem">PREMIUM</span></button>`);
}

/* ---------- 2. Your Dice mode (rev 16 S9; §21 YD-01..14). A separate labeled mode, not a dice-source toggle. ---------- */
function dice() {
  const d1 = 3, d2 = 4, F = freeArea(), tall = (F.bottom - 60) > 360, pad = !tall || Q.get("pad") === "1" || window.__r5pad;
  const pairs = []; for (let a = 1; a <= 6; a++) for (let b = a; b <= 6; b++) pairs.push([a, b]);
  const grid = `<div class="r5-pairs" role="radiogroup" aria-label="Pick the pair">${pairs.map(([a, b]) => `<button role="radio" aria-checked="${a === d1 && b === d2}" class="${a === d1 && b === d2 ? "on" : ""}" aria-label="${a} and ${b}">${face(a, 17)}${face(b, 17)}</button>`).join("")}</div>`;
  const row = (lab, sel) => `<div><div class="lab">${lab}</div><div class="faces" role="radiogroup" aria-label="${lab}">${[1, 2, 3, 4, 5, 6].map((n) => `<button role="radio" aria-checked="${n === sel}" class="${n === sel ? "on" : ""}" aria-label="${lab} ${n}">${face(n)}</button>`).join("")}</div></div>`;
  return `<div class="r5-dice yd ${F.side ? "land" : ""}" role="region" aria-label="Your Dice: enter a roll">
    <div class="r5-ydbanner" role="note">YOUR DICE · you enter the rolls</div>
    <div class="top"><span class="ttl">ENTER YOUR OWN DICE</span><button aria-label="Undo last roll">↶ Undo last roll</button><button aria-label="Paste a sequence">Paste</button></div>
    <div class="r5-seg r5-padtabs" role="tablist"><button role="tab" class="${pad ? "" : "on"}">Pairs</button><button role="tab" class="${pad ? "on" : ""}">Die 1 + die 2</button></div>
    ${pad ? `<div class="grid2">${row("DIE 1", d1)}${row("DIE 2", d2)}</div>` : grid}
    <div class="res"><span class="pipro-r">${face(d1, 22)} ${face(d2, 22)}</span><span class="tot">${d1 + d2}</span>${yours}<span class="call">SEVEN OUT · POINT WAS 6</span>
      <span class="hint">Tap <b style="color:#fff">SETTLE</b> to pay this roll. These rolls don't go into Fair Dice, badges or the Longest Roll board.</span></div>
    <div class="recent">Entered: <span>5·5 10 ${yours}</span><span>2·4 6 ${yours}</span><span>6·6 12 ${yours}</span></div></div>`;
}

/* ---------- 3. Table rules sheet (rev 16 S10; §22 RS-01..12). Tiers APPROVED (rev 16, locked; Bill 10/13). ---------- */
const seg = (opts, on, lock = []) => `<div class="r5-seg">${opts.map((o) => { const [t, sub] = Array.isArray(o) ? o : [o, ""]; return `<button class="${t === on ? "on" : ""}" aria-pressed="${t === on}">${t}${lock.includes(t) ? " 🔒" : ""}${sub ? `<small>${sub}</small>` : ""}</button>`; }).join("")}</div>`;
const rule = (lb, ctl, em = "", note = "") => `<div class="r5-rule"><div class="lb">${lb}${em ? `<em>${em}</em>` : ""}</div>${ctl}${note ? `<div class="r5-note" style="margin:5px 0 0">${note}</div>` : ""}</div>`;
function rules() {
  const tiers = BC ? [["Standard", "$5 / $1,000"], ["High limit", "$25 / $2,500"], ["High roller", "$100 / $5,000"]] : [["Standard", "$10 / $500"], ["High limit", "$25 / $2,000"], ["High roller", "$100 / $5,000"], ["Salon", "$500 / $25,000"]];
  const odds = [["1x", "0.85%"], ["2x", "0.61%"], ["3-4-5x", "0.37%"], ["5x", "0.33%"], ["10x", "0.18%"], ["20x", "0.10%"], ["100x", "0.02%"]];
  const b = `<p class="r5-note">Changes apply at the <b>next come-out</b>. Edge Preview updates on every change.</p>` +
    rule(`Limit tier <span class="r5-tag free">FREE</span>`, seg(tiers, "Standard"), BC ? "B-32" : "T-31",
      `Min / max per bet. Odds are exempt from the max in every tier. Place 6/8 caps at the largest $6 step: ${BC ? "$996 · $2,496 · $4,998" : "$498 · $1,998 · $4,998 · $24,996"}.${BC ? "" : " Salon is the top Table tier."}`) +
    rule(`Starting bankroll <span class="r5-tag free">FREE</span>`, seg(["$500", "$1,000", "$2,500", "$5,000", "$10,000", "Tier default", "Custom"], "$1,000", ["Custom"]), BC ? "B-14" : "T-14",
      `Applies only through <b>Reset bankroll</b>, which ends the session. It never tops up a live bankroll.`) +
    `<button class="r5-btn r5-also">Also reset bankroll to $1,000</button>` +
    rule(`Field 12 pays`, seg([["2:1", "5.56%"], ["3:1", "2.78%"]], "2:1", ["3:1"]), BC ? "B-2" : "T-2", `Felt line: <b>2 AND 12 PAY DOUBLE</b>. "3:1" means 3 to 1. The felt label and the payout read the same setting.`) +
    rule(`Odds multiple${BC ? " (Regular)" : ""}`, `<div class="r5-seg r5-seg4">${odds.map(([t, e]) => `<button class="${t === "3-4-5x" ? "on" : ""}" aria-pressed="${t === "3-4-5x"}">${t}${t === "3-4-5x" ? "" : " 🔒"}<small>${e}</small></button>`).join("")}</div>`, BC ? "B-3 · Crapless B-4" : "T-3",
      `Pass + max odds, combined edge. More odds lowers the combined edge, but swings grow. Your expected loss in chips stays the same as the flat bet's.`) +
    `<p class="r5-note"><span class="r5-tag prem">PREMIUM</span> Field 12 3:1, odds other than 3-4-5x, custom min / max / bankroll and presets. The full Custom Rules list (${BC ? "A1.6 B-1–B-31" : "A2.3 T-1–T-30"}) stays in Premium.</p>`;
  return sheet("SETTINGS · TABLE RULES", "Table rules", b, `<button class="r5-btn">All custom rules <span class="r5-tag prem">PREMIUM</span></button><button class="r5-btn go">Done</button>`);
}

/* ---------- 4. Roll speed (rev 16 S11; §23 FR-01..10) ---------- */
function speed() {
  const rows = [[BC ? "Dice tumble (dome)" : "Throw flight + tumble", "1.4 s", "0.5 s", "≤ 150 ms fade"], ["Point made: Base / Big / Huge", "1.2 / 2.0 / 2.5 s", "0.8 / 1.2 / 1.5 s", "0.8 s stamp, no confetti or sunburst"],
    ["Point made, quiet", "≤ 1.2 s", "0.8 s", "0.6 s banner"], ...(BC ? [] : [["Fire Bet stinger", "inside the Huge", "inside the 1.5 s", "inside the 0.8 s, text only"]]),
    ["Big Win", "≤ 2.5 s", "≤ 1.5 s", "0.8 s banner with the amount"], ["Seven out (PSO)", "1.2 s", "0.8 s", "0.6 s static puck flip + text"], ["PSO long hand", "≤ 2.0 s", "≤ 1.2 s", "0.8 s tag or banner"],
    ...(BC ? [] : [["Rail Change / color-up", "350 / 500 ms", "200 / 300 ms", "150 ms crossfade"]]), ["Payout pulse", "as today", "half length", "none (amounts still shown)"]];
  const b = `<div class="r5-k">ROLL SPEED <span class="r5-tag free">FREE</span> · ${BC ? "B-33" : "T-32"}</div>${seg(["Normal", "Fast", "Instant"], "Normal")}
  <p class="r5-note">Default <b>Normal</b>. Speed only changes what's drawn: the same roll, decided before the first frame. Every roll counts the same at every speed. <b>Tap the dice${BC ? " or the dome" : ""}</b> to skip to the settled pose.</p>
  <table class="r5-tbl"><thead><tr><th>MOMENT</th><th class="on">NORMAL</th><th>FAST</th><th>INSTANT</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r[0]}</td><td class="on">${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")}</tbody></table>
  <p class="r5-note">Every number is a maximum; 2.5 s stays the ceiling. Words, amounts, sounds and haptics stay at every speed. Overlays stay skippable, never block ${WORD.roll} and clear when the next roll starts.</p>
  <div class="r5-k">REDUCE MOTION</div><p class="r5-note">Whichever of reduce motion and the speed gives <b>less</b> motion applies.</p>
  ${BC ? `<p class="r5-note">Auto-roll keeps its 10 / 15 / 20 / 30 s intervals; the countdown starts after the roll fully settles.</p>` : `<p class="r5-note">Shooter practice caps at <b>Fast</b>. Dice set, grip and the throw meter don't change.</p>`}`;
  return sheet("SETTINGS · ROLL SPEED", "Roll speed", b, `<button class="r5-btn go">Done</button>`);
}

/* ---------- 5. Quick bets (rev 16 S12; §24 QB-01..14) ---------- */
// lower-edge rule, Standard (5% of the Buy stake, on win): Buy 4/10 1.67%, Buy 5/9 2.00%, Place 6/8 1.52%. Point 6 + Pass on → 6 skipped (B-34/T-33 default Off).
const EDGE = { 4: 1.667, 5: 2.0, 6: 1.515, 8: 1.515, 9: 2.0, 10: 1.667 };
function spread(nums, B, point) {
  const spots = nums.map((n) => { const six = n === 6 || n === 8, amt = six ? B * 6 / 5 : B, type = six ? "Place" : "Buy";
    const win = six ? amt * 7 / 6 : (n === 4 || n === 10 ? amt * 2 : amt * 1.5) - amt * .05;
    return { n, amt, type, win, skip: n === point }; });
  const live = spots.filter((s) => !s.skip), tot = live.reduce((a, s) => a + s.amt, 0), edge = live.reduce((a, s) => a + s.amt * EDGE[s.n], 0) / tot;
  return { spots, tot, edge };
}
const cents = (v) => "$" + (Math.round(v * 100) % 100 ? v.toFixed(2) : String(Math.round(v)));
function quick(preview) {
  const sel = 5, min = BC ? 5 : 10, B = Math.max(sel, min), point = 6;
  const keys = BC ? [["INSIDE", [5, 6, 8, 9]], ["OUTSIDE", [4, 5, 9, 10]]] : [["ACROSS", [4, 5, 6, 8, 9, 10]], ["INSIDE", [5, 6, 8, 9]], ["OUTSIDE", [4, 5, 9, 10]]];
  const S2 = keys.map(([k, n]) => [k, n, spread(n, B, point)]);
  const strip = `<div class="r5-k">QUICK BETS</div><div class="r5-qstrip" style="grid-template-columns:repeat(${keys.length},minmax(0,1fr))">${S2.map(([k, n, s], i) =>
    `<button class="${i === 0 ? "on" : ""}" aria-label="${k} ${money(s.tot)}"><b>${k}</b><span>${money(s.tot)}</span><small>${n.filter((x) => x !== point).join(" ")}</small></button>`).join("")}</div>`;
  const [k0, , s0] = S2[0];
  if (!preview) {
    const b = strip + `<p class="r5-note">${BC ? "<b>BILLY'S WAY</b> stays your across key (BETS OFF · BILLY'S WAY · RESET don't change)." : "Across buys 4, 5, 9 and 10 and places 6 and 8."} Each spot uses <b>Buy or Place, whichever has the lower edge</b> at that amount under your rules. Each tap adds one unit. Long-press a key for its preview.</p>
      <p class="r5-note"><b>6 skipped: it's your point.</b> (Settings › Quick bets › Include my point: Off)</p>
      <p class="r5-note">Unit $${B}: ${B > sel ? `the table minimum (your chip is $${sel})` : "your selected chip"}; 6 and 8 go up in $6 units ($${B * 6 / 5}).</p>
      <div class="r5-k">${BC ? "BET PANEL · PLACE" : "BETS"}</div><p class="r5-note">${BC ? "Place · Buy · Lay · Odds tabs continue below (unchanged)." : "The rest of the Bets sheet continues below (unchanged)."}</p>`;
    return sheet(BC ? "BET PANEL · PLACE TAB" : "BETS", BC ? "Bet Panel" : "Bets", b, `<button class="r5-btn">↶ Undo last quick bet</button><button class="r5-btn">Take down ${k0[0] + k0.slice(1).toLowerCase()}</button>`);
  }
  const b = `<div class="r5-pv">${s0.spots.map((s) => `<div class="${s.skip ? "off" : ""}"><b>${s.n}</b>${s.skip ? `<span>skipped</span><small>your point</small>` : `<span>${s.type} $${s.amt}</span><small>wins ${cents(s.win)}</small><small>${EDGE[s.n].toFixed(2)}%</small>`}</div>`).join("")}</div>
    <p class="r5-note">Why Buy or Place: Buy ${BC ? "5/9" : "4, 5, 9, 10"} (${BC ? "2.00% vs 4.00%" : "1.67% / 2.00% vs 6.67% / 4.00%"}), Place 6/8 (1.52% vs 2.27%). Commission 5% of the Buy stake, on wins only.</p>
    <div class="r5-sum"><div><small>TOTAL</small><b>${money(s0.tot)}</b></div><div><small>BLENDED EDGE</small><b>${s0.edge.toFixed(2)}%</b></div><div><small>AT RISK ON A 7</small><b>${money(s0.tot)}</b></div><div><small>FROM</small><b>${BC ? "your chips" : "the rail"}</b></div></div>
    <div class="r5-chips">${BC ? `${chip(5)}×2 ${chip(1)}×6` : `${chip(5)}×${s0.spots.filter((s) => !s.skip).length * 2} ${chip(1)}×${s0.spots.filter((s) => !s.skip && (s.n === 6 || s.n === 8)).length * 2}`} <span>${BC ? "" : "one rail payment; breaks a $5 into $1s for the 8"}</span></div>
    <p class="r5-note">One bet per number: a Place already up stays Place and gets one more unit; a Lay is skipped. Nothing is converted silently.</p>`;
  return sheet("QUICK BETS · PREVIEW", `${k0[0] + k0.slice(1).toLowerCase()} ${money(s0.tot)}`, b, `<button class="r5-btn">Cancel</button><button class="r5-btn go">Post ${k0[0] + k0.slice(1).toLowerCase()} ${money(s0.tot)}</button>`);
}

/* ---------- 6. Billy's Payout Drills (rev 16 S13; §25 PD-01..12). Dealer level, keypad to the cent, timer Off. ---------- */
function drill(fb) {
  const plate = fb ? `<div class="r5-plate bad" role="status"><img class="m" src="${A}mascots/dealer-billy/billy-A-tip.svg" alt="Dealer Billy"><div><span class="rc">NOT QUITE · IT'S $21.00</span>
      <p>You paid $20.00.</p><div class="r5-why"><b>Why?</b> Place 8 pays 7 to 6: $18 ÷ 6 = 3 units × $7 = <b>$21</b>.</div></div></div>`
    : `<div class="r5-plate" role="status"><img class="m" src="${A}mascots/dealer-billy/billy-A-tip.svg" alt="Dealer Billy"><div><span class="rc">D1 PLACE PAYS · QUESTION 6 OF 10</span>
      <p>Place 8, $18. The 8 rolls. Pay?</p></div></div>`;
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];
  const b = `<div class="r5-score"><span>Level <b>Dealer</b></span><span>Score <b>${fb ? 100 : 100}</b></span><span>Accuracy <b>${fb ? "83%" : "100%"}</b></span><span>Avg time <b>4.2 s</b></span><span>Best <b>180</b></span></div>
    ${plate}
    <div class="r5-felt" aria-label="Place 8, $18; the roll is five and three, easy eight"><div class="box">8</div><div class="stk">${chip(5)}${chip(5)}${chip(5)}${chip(1)}${chip(1)}${chip(1)}</div><div class="amt">Place 8 · $18<small>Roll: ${face(5, 18)}${face(3, 18)} easy eight</small></div></div>
    <div class="r5-ans"><small>YOUR PAY</small><b>${fb ? "$20.00" : "$21.00"}</b></div>
    ${fb ? "" : `<div class="r5-keypad">${keys.map((k) => `<button aria-label="${k === "⌫" ? "Delete" : k}">${k}</button>`).join("")}</div>`}
    <p class="r5-note">10 points per right answer at Rookie, 20 at Dealer, 30 at Boxman. Rounds of 10. The timer is off.</p>
    <p class="r5-note">Casinos round some payouts. The app pays to the cent; real tables may pay $1 less on odd amounts.</p>`;
  const foot = fb ? `<button class="r5-btn">End round</button><button class="r5-btn go">Next question</button>` : `<button class="r5-btn">Clear</button><button class="r5-btn go">PAY</button>`;
  return sheet("LEARN · PAYOUT DRILLS", "Billy's Payout Drills", b, foot);
}

function render() {
  let host = $(".r5.host"); if (!host) { host = document.createElement("div"); host.className = "r5 host " + APP; document.body.appendChild(host); }
  document.body.classList.remove("r5-modal");
  const R = { history: () => history(false), historyall: () => history(true), dice, rules, speed, quick: () => quick(false), quickpv: () => quick(true), drill: () => drill(false), drillfb: () => drill(true) }[S];
  host.innerHTML = R ? R() : "";
  if (S === "dice") {
    const rb = rollBtn(); if (rb && !rb.dataset.r5) { rb.dataset.r5 = 1; rb.setAttribute("aria-label", "Settle the entered roll"); const lab = rb.querySelector("b") || rb; lab.textContent = "SETTLE"; const sm = rb.querySelector("small"); if (sm) sm.textContent = "YOUR DICE"; }
    const p = $(".r5-dice"), F = freeArea(); if (F.side) { p.style.transform = "none"; p.style.left = F.left + "px"; p.style.width = Math.min(620, F.right - F.left) + "px"; }
    const hudB = ($(BC ? "#hud" : ".tc-hud")?.getBoundingClientRect().bottom || 0) + 4;
    if (p.offsetHeight > F.bottom - hudB) p.classList.add("compact");          // short phones: drop the recent strip and the hint (the label stays)
    if (p.offsetHeight > F.bottom - hudB && !window.__r5pad) { window.__r5pad = true; return render(); }   // still too tall: the 21-pair grid becomes the die pad          // short phones: drop the recent strip and the hint (the label stays)
    p.style.top = Math.max(hudB, F.bottom - p.offsetHeight) + "px";
  }
  window.__r5 = { app: APP, s: S, roll: rollBtn(), ready: true };
}
if (S || Q.get("pg") != null || Q.get("chrome") || Q.get("throw")) boot();
