import { chromium } from "playwright-core";
import fs from "node:fs";
import * as E from "./js/engine.mjs";

const port = 8826;
const base = "http://127.0.0.1:" + port + "/index.html";
const out = "docs/qa/compare";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome-stable",
  args: ["--no-sandbox", "--disable-gpu"],
});

function historyGame(n) {
  const g = E.createGame();
  g.phase = "point";
  g.point = 10;
  g.hand = { rolls: Math.max(n, 21), points: 1, lastLength: 0 };
  const history = [];
  for (let i = 0; i < n; i++) {
    const d1 = (i % 6) + 1;
    const d2 = ((i + 3) % 6) + 1;
    history.unshift({ d1, d2, total: d1 + d2, hard: d1 === d2, result: "no-decision" });
  }
  g.history = history;
  g.lastDice = { d1: 6, d2: 6, total: 12, hard: true, aria: "six and six, hard twelve", word: "HARD TWELVE" };
  return g;
}

async function boot(page, w, h, extra, game) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.evaluate(({ patch, game }) => {
    localStorage.clear();
    const settings = {
      sound: false, autoRoll: false, tutorOn: false, reduced: true, badgeToasts: true,
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

const page = await browser.newPage();
const notes = [];
function note(name, data) {
  notes.push({ name, ...data });
  console.log(name, JSON.stringify(data));
}

await boot(page, 375, 812, {}, historyGame(6));
await page.evaluate(() => window.__bbShowMarquee("spin_the_block"));
await page.waitForSelector(".badgetoast.marquee");
await page.screenshot({ path: out + "/run12-marquee-375.jpg", type: "jpeg", quality: 80 });
note("marquee-375", await page.evaluate(() => {
  const b = document.querySelector(".badgetoast.marquee b");
  const cs = getComputedStyle(b);
  return { text: b.textContent, h: b.clientHeight, scroll: b.scrollHeight, white: cs.whiteSpace, facts: document.querySelector(".facts").textContent };
}));

await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.__bbShowMarquee("hwad_win"));
await page.waitForSelector(".badgetoast.marquee[data-id='hwad_win']");
await page.screenshot({ path: out + "/run12-marquee-390.jpg", type: "jpeg", quality: 80 });
note("marquee-390", await page.evaluate(() => {
  const b = document.querySelector(".badgetoast.marquee b");
  return { text: b.textContent, h: b.clientHeight, scroll: b.scrollHeight, facts: document.querySelector(".facts").textContent };
}));

for (const size of [[844, 390, "844"], [1440, 900, "1440"]]) {
  await boot(page, size[0], size[1], {}, historyGame(12));
  await page.screenshot({ path: out + "/run12-hud-" + size[2] + ".jpg", type: "jpeg", quality: 80 });
  note("hud-" + size[2], await page.evaluate(() => {
    const fair = document.querySelector("#hud .fairchip").getBoundingClientRect();
    const app = document.querySelector(".app").getBoundingClientRect();
    const dock = document.querySelector("#dock").getBoundingClientRect();
    const word = document.querySelector("#hud .heater b");
    return {
      fair: [Math.round(fair.left), Math.round(fair.right)],
      app: [Math.round(app.left), Math.round(app.right)],
      dockLeft: Math.round(dock.left),
      word: word ? getComputedStyle(word).display : "missing",
      segs: document.querySelectorAll("#hud .heater .segs i").length,
    };
  }));
}

for (const n of [1, 5, 10]) {
  await boot(page, 390, 844, {}, historyGame(n));
  await page.locator("button.dot[aria-label='Dice']").click();
  await page.waitForSelector(".dome-screen .rollstrip .rolltile");
  await page.waitForTimeout(200);
  const strip = page.locator(".dome-screen .rollstrip");
  await strip.screenshot({ path: out + "/run12-strip-" + n + ".jpg", type: "jpeg", quality: 82 });
  note("strip-" + n, await page.evaluate(() => {
    const el = document.querySelector(".dome-screen .rollstrip");
    const face = el.querySelector(".dieface");
    return {
      totals: el.classList.contains("totals"),
      tiles: el.querySelectorAll(".rolltile").length,
      parent: el.closest(".dome-screen").clientWidth,
      shown: face ? getComputedStyle(face).display : "none",
    };
  }));
}

await boot(page, 320, 568, {}, historyGame(6));
await page.waitForTimeout(150);
await page.screenshot({ path: out + "/run12-play-320.jpg", type: "jpeg", quality: 80 });
note("play-320", await page.evaluate(() => {
  const roll = document.querySelector(".roll-btn").getBoundingClientRect();
  const felt = document.querySelector(".felt").getBoundingClientRect();
  const chip = document.querySelector(".chip-btn").getBoundingClientRect();
  const press = document.querySelector(".press-btn").getBoundingClientRect();
  const fair = document.querySelector("#hud .fairchip").getBoundingClientRect();
  const row = document.querySelector("#hud .hud-row2").getBoundingClientRect();
  return {
    zoom: getComputedStyle(document.querySelector(".app.play")).zoom,
    roll: [Math.round(roll.left), Math.round(roll.right), Math.round(roll.bottom), Math.round(roll.width)],
    felt: [Math.round(felt.left), Math.round(felt.right), Math.round(felt.bottom)],
    chip: Math.round(chip.width),
    press: Math.round(press.height),
    fair: [Math.round(fair.left), Math.round(fair.right)],
    rowRight: Math.round(row.right),
    vw: innerWidth,
    vh: innerHeight,
  };
}));

await page.setViewportSize({ width: 375, height: 812 });
await page.waitForTimeout(100);
note("fair-375", await page.evaluate(() => {
  const fair = document.querySelector("#hud .fairchip").getBoundingClientRect();
  const row = document.querySelector("#hud .hud-row2").getBoundingClientRect();
  return { fair: [Math.round(fair.left), Math.round(fair.right)], rowRight: Math.round(row.right) };
}));

await browser.close();
console.log("shots written");
