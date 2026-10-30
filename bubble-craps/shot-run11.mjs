import { chromium } from "playwright-core";
import fs from "node:fs";
import * as E from "./js/engine.mjs";

const port = 8822;
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

async function boot(page, w, h, extra, game) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.evaluate(({ patch, game }) => {
    localStorage.clear();
    const settings = {
      sound: false, autoRoll: false, tutorOn: true, reduced: true, badgeToasts: true,
      seenBlaze: { warm: true, hot: true, blazing: true }, chip: 500,
    };
    Object.assign(settings, patch || {});
    localStorage.setItem("bb-bubble-craps-v1", JSON.stringify({ settings, game: game || null, allRolls: [] }));
    localStorage.setItem("bb-bubble-badges-v1", JSON.stringify({
      v: 1, name: "QA", highlightId: "", entries: [],
      initials: { default: "QA", asked: true }, pending: null, nextHandId: 1,
      badges: {}, progress: {}, daily: { lastDay: "", streak: 0, best: 0 },
      sessions: { withinLimits: 0, awarded: [] }, session: null,
    }));
  }, { patch: extra || {}, game: game || null });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("button[data-act='play'][data-mode='regular']").first().click();
  await page.waitForSelector(".felt, #hud .fairchip");
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

function stripGame() {
  const g = E.createGame();
  const history = [];
  for (let i = 0; i < 20; i++) {
    const d1 = (i % 6) + 1;
    const d2 = ((i * 5) % 6) + 1;
    history.push({ d1, d2, total: d1 + d2, hard: d1 === d2, result: "no-decision" });
  }
  g.history = history;
  g.allRolls = history;
  return g;
}

const page = await browser.newPage();
const robots = await page.goto(base).then(() => page.locator("meta[name='robots']").getAttribute("content"));
note("robots", { robots });

for (const width of [320, 375, 390, 430]) {
  const g = stripGame();
  await boot(page, width, 844, { tutorOn: false }, g);
  await page.locator("button.dot[aria-label='Dice']").click();
  await page.waitForSelector(".dome-screen .rollstrip");
  await page.waitForTimeout(200);
  const dome = await page.evaluate(() => {
    const el = document.querySelector(".dome-screen .rollstrip");
    const tile = el.querySelector(".rolltile");
    const faces = tile ? [...tile.querySelectorAll(".dieface")].map((f) => {
      const r = f.getBoundingClientRect();
      const s = getComputedStyle(f);
      return { d: s.display, w: Math.round(r.width), t: Math.round(r.top) };
    }) : [];
    return { w: el.clientWidth, h: Math.round(el.getBoundingClientRect().height), totals: el.classList.contains("totals"), n: el.querySelectorAll(".rolltile").length, faces };
  });
  note("dome-" + width, dome);
  await shot(page, "run11-tiles-" + width + ".jpg");
}

await boot(page, 390, 844, { tutorOn: false }, stripGame());
await page.locator("button[data-act='view'][data-view='fair']").first().click();
await page.locator("button[data-act='fair-scope'][data-scope='all']").click();
await page.waitForTimeout(200);
await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
  raw.allRolls = (raw.game.history || []).map((r) => Object.assign({ at: Date.now(), mode: "regular", net: 0, source: "test", phaseBefore: "come-out" }, r));
  localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
});
await page.reload({ waitUntil: "domcontentloaded" });
await page.locator("button.tab[data-view='fair'], button[data-act='view'][data-view='fair']").first().click();
await page.locator("button[data-act='fair-scope'][data-scope='all']").click();
await page.waitForTimeout(250);
const fair = await page.evaluate(() => {
  const el = document.querySelector(".fairstrip");
  const tiles = [...el.querySelectorAll(".rolltile")];
  const tops = [...new Set(tiles.map((t) => Math.round(t.getBoundingClientRect().top)))];
  return { n: tiles.length, rows: tops.length, totals: el.classList.contains("totals"), w: el.clientWidth };
});
note("fair-390", fair);
await shot(page, "run11-fair-390.jpg");

for (const size of [{ w: 844, h: 390, name: "844" }, { w: 932, h: 430, name: "932" }]) {
  await boot(page, size.w, size.h);
  await page.locator("button[data-act='billy']").click();
  await page.waitForSelector(".coach");
  const before = await page.locator(".hud-roll strong").innerText();
  const hit = await page.evaluate(() => {
    const roll = document.querySelector("button[data-act='roll']");
    const box = roll.getBoundingClientRect();
    const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return { hit: top ? top.className : "", roll: beforeRoll() };
    function beforeRoll() { return document.querySelector(".hud-roll strong").textContent; }
  });
  await shot(page, "run11-coach-" + size.name + ".jpg");
  await page.locator("button[data-act='roll']").click();
  await page.waitForFunction((n) => document.querySelector(".hud-roll strong").textContent !== n, before);
  const after = await page.locator(".hud-roll strong").innerText();
  note("coach-" + size.name, { before, after, hit: hit.hit });
  await shot(page, "run11-coach-roll-" + size.name + ".jpg");
}

const heat = E.createGame();
heat.phase = "point";
heat.point = 9;
heat.hand = { rolls: 8, points: 1, lastLength: 0 };
await boot(page, 390, 844, { seenBlaze: { warm: true }, tutorOn: false }, heat);
await page.locator("button.dot[aria-label='Dice']").click();
await forceRoll(page, 1, 1);
await page.waitForSelector("#overlay .sheet img");
const mascots = await page.evaluate(() => {
  const shown = (el) => {
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none" || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width >= 8 && r.height >= 8 && r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight;
  };
  const names = [...document.querySelectorAll("img")].filter((img) => {
    const src = img.getAttribute("src") || "";
    if (!/mascots\/(dealer-billy|billie)\//.test(src) || /\/small\//.test(src)) return false;
    return shown(img);
  }).map((img) => img.getAttribute("alt") || "");
  return { names, dome: getComputedStyle(document.querySelector(".dome-cast")).visibility };
});
note("heat", mascots);
await shot(page, "run11-heat-sheet.jpg");

function hudGame() {
  const g = E.createGame();
  g.phase = "point";
  g.point = 10;
  g.hand = { rolls: 21, points: 1, lastLength: 0 };
  g.lastDice = { d1: 6, d2: 6, total: 12, hard: true, aria: "six and six, hard twelve", word: "HARD TWELVE" };
  return g;
}
for (const width of [375, 390, 430]) {
  await boot(page, width, 844, { tutorOn: false }, hudGame());
  await page.waitForTimeout(150);
  const hud = await page.evaluate(() => {
    const fair = document.querySelector("#hud .fairchip").getBoundingClientRect();
    const segs = [...document.querySelectorAll("#hud .heater.compact .segs i")];
    return {
      fairRight: Math.round(fair.right),
      vw: innerWidth,
      segs: segs.length,
      on: segs.filter((el) => el.classList.contains("on") && getComputedStyle(el).display !== "none").length,
    };
  });
  note("hud-" + width, hud);
  await shot(page, "run11-hud-" + width + ".jpg");
}

await browser.close();
fs.writeFileSync("/tmp/run11-notes.json", JSON.stringify(notes, null, 2));
console.log("wrote", notes.length, "notes");
