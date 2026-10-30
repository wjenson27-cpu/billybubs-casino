import { chromium } from "playwright-core";
import fs from "node:fs";

const port = 8811;
const base = "http://127.0.0.1:" + port + "/index.html";
const out = "docs/qa/compare";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome-stable",
  args: ["--no-sandbox", "--disable-gpu"],
});
const notes = [];
function note(name, data) {
  notes.push({ name, ...data });
  console.log(name, JSON.stringify(data));
}

async function shot(page, name) {
  await page.screenshot({ path: out + "/" + name, type: "jpeg", quality: 80 });
}

async function boot(page, w, h) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("bb-bubble-craps-v1", JSON.stringify({
      settings: {
        sound: false, autoRoll: false, tutorOn: true, reduced: true, badgeToasts: true,
        seenBlaze: { warm: true, hot: true, blazing: true }, chip: 500,
      },
      game: null,
      allRolls: [],
    }));
    localStorage.setItem("bb-bubble-badges-v1", JSON.stringify({
      v: 1, name: "QA", highlightId: "", entries: [],
      initials: { default: "QA", asked: true }, pending: null, nextHandId: 1,
      badges: {}, progress: {}, daily: { lastDay: "", streak: 0, best: 0 },
      sessions: { withinLimits: 0, awarded: [] }, session: null,
    }));
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("button[data-act='play'][data-mode='regular']").first().click();
  await page.waitForSelector(".felt");
}

async function forceRoll(page, d1, d2) {
  await page.evaluate(({ a, b }) => {
    const seq = [a, b];
    let i = 0;
    window.__bbRng = () => (seq[i++] - 0.5) / 6;
  }, { a: d1, b: d2 });
  await page.locator("button[data-act='roll']").click();
  await page.waitForFunction(({ a, b }) => {
    const imgs = [...document.querySelectorAll(".lastdice .dieface")].map((img) => img.getAttribute("src") || "");
    return imgs.length >= 2 && imgs[0].includes("face-" + a) && imgs[1].includes("face-" + b);
  }, { a: d1, b: d2 });
}

async function mascots(page) {
  return page.evaluate(() => {
    const shown = (el) => {
      const s = getComputedStyle(el);
      if (s.visibility === "hidden" || s.display === "none" || Number(s.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) return false;
      if (r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) return false;
      return true;
    };
    return [...document.querySelectorAll("img")].filter((img) => {
      const src = img.getAttribute("src") || "";
      if (!/mascots\/(dealer-billy|billie)\//.test(src)) return false;
      if (/\/small\//.test(src)) return false;
      if (img.closest(".homebtn, .billytip")) return false;
      return shown(img);
    }).map((img) => img.getAttribute("alt") || img.className);
  });
}

const page = await browser.newPage();
const robots = await (async () => {
  await page.goto(base, { waitUntil: "domcontentloaded" });
  return page.locator("meta[name='robots']").getAttribute("content");
})();
note("robots", { robots });

await boot(page, 390, 844);
await page.locator("button[aria-label='Pass Line']").click();
await forceRoll(page, 2, 4);
await page.locator("button[aria-label='Place 8']").click();
await forceRoll(page, 4, 4);
await page.locator("button[data-act='press']").click();
await page.waitForSelector(".coach");
const before = await page.locator(".hud-roll strong").innerText();
await shot(page, "run10-coach-open.jpg");
await forceRoll(page, 1, 1);
const after = await page.locator(".hud-roll strong").innerText();
note("coach-roll", { before, after, mascots: await mascots(page), coach: await page.locator(".coach").count() });
await shot(page, "run10-coach-roll.jpg");

await boot(page, 390, 844);
await page.locator("button.homebtn").click();
await page.locator("button[data-act='tour']").click();
await page.locator(".coach button[data-act='close']").click();
await page.locator("button[aria-label='Pass Line']").click();
await forceRoll(page, 4, 2);
if (await page.locator(".coach").count()) await page.locator(".coach button[data-act='close']").click();
await page.locator("button[aria-label='Place 6']").click();
await forceRoll(page, 3, 3);
await page.waitForSelector(".coach");
note("coach-place", { mascots: await mascots(page) });
await shot(page, "run10-coach-place.jpg");

await boot(page, 390, 844);
await page.evaluate(() => { document.body.classList.remove("has-coach"); });
await page.locator("button[aria-label='Pass Line']").click();
await forceRoll(page, 2, 4);
await page.locator("button.dot[aria-label='Dice']").click();
await forceRoll(page, 3, 4);
await page.waitForSelector(".toast-billy");
note("seven-out", { mascots: await mascots(page), dome: await page.evaluate(() => getComputedStyle(document.querySelector(".dome-cast")).visibility) });
await shot(page, "run10-sevenout-dome.jpg");

await boot(page, 390, 844);
await page.evaluate(() => document.querySelector("button[data-act='bet'][data-kind='hop'][data-pair='1-1']").click());
await forceRoll(page, 1, 1);
await page.waitForSelector(".win-billie");
await page.evaluate(() => window.__bbShowMarquee("spin_the_block"));
await page.waitForSelector(".badgetoast.marquee");
note("bigwin-badge", { mascots: await mascots(page) });
await shot(page, "run10-bigwin-badge.jpg");

await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
  raw.game.phase = "point";
  raw.game.point = 9;
  raw.game.hand = { rolls: 11, points: 0, comeOuts: 1, lastLength: 0 };
  raw.game.bets.pass = 500;
  raw.settings.seenBlaze = { warm: true, hot: true };
  raw.settings.tutorOn = false;
  localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
});
await page.reload({ waitUntil: "domcontentloaded" });
await page.locator("button[data-act='play'][data-mode='regular']").first().click();
await page.locator("button.dot[aria-label='Dice']").click();
await forceRoll(page, 1, 1);
await page.waitForSelector(".toast-billie.heat");
note("hot", { mascots: await mascots(page), text: await page.locator(".toast").innerText() });
await shot(page, "run10-hot.jpg");

const history = [];
for (let i = 0; i < 20; i++) {
  const d1 = (i % 6) + 1;
  const d2 = ((i * 3) % 6) + 1;
  history.push({ d1, d2, total: d1 + d2, hard: d1 === d2, result: "no-decision" });
}
await page.evaluate((rows) => {
  const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
  raw.game.history = rows;
  raw.game.phase = "point";
  raw.game.point = 8;
  raw.allRolls = rows.map((r) => Object.assign({ at: Date.now(), mode: "regular", net: 0, source: "test", phaseBefore: "point" }, r));
  localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
}, history);

for (const width of [375, 390, 430]) {
  await page.setViewportSize({ width, height: 844 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("button[data-act='play'][data-mode='regular']").first().click();
  await page.locator("button.dot[aria-label='Dice']").click();
  await page.waitForSelector(".dome-screen .rollstrip");
  await page.waitForTimeout(250);
  const dome = await page.evaluate(() => {
    const el = document.querySelector(".dome-screen .rollstrip");
    const box = el.getBoundingClientRect();
    return { h: Math.round(box.height), w: el.clientWidth, totals: el.classList.contains("totals") };
  });
  note("strip-" + width, dome);
  await shot(page, "run10-rollstrip-" + width + ".jpg");
}

for (const width of [375, 390]) {
  await page.setViewportSize({ width, height: 844 });
  await page.locator("button[data-act='view'][data-view='fair']").first().click();
  await page.locator("button[data-act='fair-scope'][data-scope='all']").click();
  await page.locator(".fairstrip").scrollIntoViewIfNeeded();
  const fair = await page.evaluate(() => {
    const el = document.querySelector(".fairstrip");
    const tops = [...el.querySelectorAll(".rolltile")].map((t) => Math.round(t.getBoundingClientRect().top));
    return { n: tops.length, rows: new Set(tops).size, w: el.clientWidth, totals: el.classList.contains("totals") };
  });
  note("last20-" + width, fair);
  await page.locator(".fairstrip").screenshot({ path: out + "/run10-last20-" + width + ".jpg", type: "jpeg", quality: 82 });
}

await page.setViewportSize({ width: 1280, height: 480 });
await page.goto(base, { waitUntil: "domcontentloaded" });
const hand = await page.evaluate(() => {
  const host = document.createElement("div");
  host.id = "handproof";
  host.style.cssText = "position:fixed;inset:0;z-index:90;background:#0c3b22;display:flex;gap:18px;padding:28px 16px;align-items:flex-start;justify-content:center;";
  document.body.appendChild(host);
  const style = document.createElement("style");
  style.textContent = "#handproof .cube3d{--s:96px}#handproof .cube{transition:none !important}#handproof figcaption{color:#fff;font:12px/1.35 sans-serif;text-align:center;margin-top:8px}";
  document.head.appendChild(style);
  const cross = (p, q) => ({ x: p.y * q.z - p.z * q.y, y: p.z * q.x - p.x * q.z, z: p.x * q.y - p.y * q.x });
  const rows = [];
  for (let face = 1; face <= 6; face++) {
    const fig = document.createElement("figure");
    fig.style.margin = "0";
    const faces = [1, 2, 3, 4, 5, 6].map((n) => "<i class='f f" + n + "'></i>").join("");
    fig.innerHTML = "<div class='cube3d'><div class='cube' data-face='" + face + "'>" + faces + "</div></div><figcaption></figcaption>";
    host.appendChild(fig);
    const cube = fig.querySelector(".cube");
    const cubeM = new DOMMatrix(getComputedStyle(cube).transform);
    const normals = {};
    cube.querySelectorAll(".f").forEach((el) => {
      const n = Number(String(el.className).match(/f(\d)/)[1]);
      const w = cubeM.multiply(new DOMMatrix(getComputedStyle(el).transform));
      normals[n] = { x: w.m31, y: w.m32, z: w.m33 };
    });
    let top = face, front = 1, left = 1, right = 1;
    let topScore = -99, frontZ = -99, leftX = 99, rightX = -99;
    for (let n = 1; n <= 6; n++) {
      const p = normals[n];
      if (p.z > 0.4 && -p.y > topScore) { topScore = -p.y; top = n; }
    }
    for (let n = 1; n <= 6; n++) {
      if (n === top) continue;
      const p = normals[n];
      if (p.z > frontZ) { frontZ = p.z; front = n; }
      if (p.z > 0.05 && p.x < leftX) { leftX = p.x; left = n; }
      if (p.z > 0.05 && p.x > rightX) { rightX = p.x; right = n; }
    }
    const cap = fig.querySelector("figcaption");
    cap.textContent = "top " + top;
    rows.push({ face, top, front, left, right });
  }
  const corner = document.createElement("figure");
  corner.style.margin = "0";
  corner.innerHTML = "<div class='cube3d'><div class='cube' id='corner'>" + [1, 2, 3, 4, 5, 6].map((n) => "<i class='f f" + n + "'></i>").join("") + "</div></div><figcaption>1 top · 2 front · 3 right</figcaption>";
  host.appendChild(corner);
  const cube = corner.querySelector(".cube");
  cube.style.transition = "none";
  const normalOf = (n) => {
    const face = cube.querySelector(".f" + n);
    const m = new DOMMatrix(getComputedStyle(face).transform);
    return { x: m.m31, y: m.m32, z: m.m33 };
  };
  cube.style.transform = "none";
  const n1 = normalOf(1);
  const n2 = normalOf(2);
  const up = { x: 0, y: -1, z: 0 };
  const frontV = { x: 0, y: 0, z: 1 };
  const cols = (a, b, c) => new DOMMatrix([a.x, a.y, a.z, 0, b.x, b.y, b.z, 0, c.x, c.y, c.z, 0, 0, 0, 0, 1]);
  const R = cols(up, frontV, cross(up, frontV)).multiply(cols(n1, n2, cross(n1, n2)).inverse());
  cube.style.transform = R.toString();
  const world = {};
  const cubeM = new DOMMatrix(getComputedStyle(cube).transform);
  for (let n = 1; n <= 6; n++) {
    const face = cube.querySelector(".f" + n);
    const m = cubeM.multiply(new DOMMatrix(getComputedStyle(face).transform));
    world[n] = { x: +m.m31.toFixed(3), y: +m.m32.toFixed(3), z: +m.m33.toFixed(3) };
  }
  rows.push({ corner: world });
  return rows;
});
note("handedness", { poses: hand });
await page.locator("#handproof").screenshot({ path: out + "/run10-handedness.jpg", type: "jpeg", quality: 82 });

fs.writeFileSync(out + "/run10-notes.json", JSON.stringify(notes, null, 2));
await browser.close();
console.log("shots done");
