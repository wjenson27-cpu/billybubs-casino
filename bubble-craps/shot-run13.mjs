import { chromium } from "playwright-core";
import fs from "node:fs";
import * as E from "./js/engine.mjs";

const base = process.argv[2] || "http://127.0.0.1:8846/index.html";
const out = "docs/qa/compare";
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync("/opt/cursor/artifacts/screenshots", { recursive: true });

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome-stable",
  args: ["--no-sandbox", "--disable-gpu"],
});

function diceGame() {
  const g = E.createGame();
  g.phase = "point";
  g.point = 6;
  g.hand = { rolls: 4, points: 1, lastLength: 0 };
  g.lastDice = { d1: 5, d2: 2, total: 7, hard: false, aria: "five and two", word: "SEVEN" };
  g.history = [{ d1: 5, d2: 2, total: 7, hard: false, result: "no-decision" }];
  return g;
}

function atsGame() {
  const g = E.createGame();
  g.phase = "point";
  g.point = 8;
  g.bets.small = 500;
  g.progress.small = { 2: true, 3: true, 4: true, 5: true };
  g.bankroll = E.STARTING_BANKROLL - 500;
  return g;
}

async function boot(page, w, h, game) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.evaluate((saved) => {
    localStorage.clear();
    localStorage.setItem("bb-bubble-craps-v1", JSON.stringify({
      settings: {
        sound: false, autoRoll: false, tutorOn: false, reduced: true, badgeToasts: true,
        seenBlaze: { warm: true, hot: true, blazing: true }, chip: 500,
      },
      game: saved, allRolls: [],
    }));
    localStorage.setItem("bb-bubble-badges-v1", JSON.stringify({
      v: 1, name: "QA", highlightId: "", entries: [],
      initials: { default: "QA", asked: true }, pending: null, nextHandId: 1,
      badges: {}, progress: {}, daily: { lastDay: "", streak: 0, best: 0 },
      sessions: { withinLimits: 0, awarded: [] }, session: null,
    }));
  }, game);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("button[data-act='play'][data-mode='regular']").first().click();
  await page.waitForSelector(".spot.field");
}

function save(page, name) {
  return page.screenshot({ path: out + "/" + name, type: "jpeg", quality: 80 });
}

const notes = {};
const page = await browser.newPage();

const sizes = [[320, 568], [360, 640], [375, 667], [390, 844], [430, 932], [844, 390]];
for (const [w, h] of sizes) {
  await boot(page, w, h, diceGame());
  const tag = w + "x" + h;
  if (w !== 360) {
    const field = page.locator(".spot.field");
    await field.screenshot({ path: out + "/run13-field-" + tag + ".png" });
  }
  if (tag === "320x568") await save(page, "run13-felt-320.jpg");
  await page.locator("button.dot[aria-label='Dice']").click();
  await page.waitForSelector("#dice-row .cube");
  await page.waitForTimeout(250);
  await save(page, "run13-dome-" + tag + ".jpg");
  notes[tag] = await page.evaluate(() => {
    const host = document.getElementById("dice-row");
    const boxes = [...host.querySelectorAll(".cube3d")].map((el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    });
    const bowl = document.querySelector("#pager .machine").getBoundingClientRect();
    const legal = document.querySelector(".legal").getBoundingClientRect();
    return {
      s: host.style.getPropertyValue("--s"),
      vis: getComputedStyle(host).visibility,
      boxes,
      bowl: Math.round(bowl.height),
      band: Math.round(innerHeight - legal.bottom),
    };
  });
}

for (const [w, h, name] of [[390, 844, "390"], [844, 390, "844"]]) {
  const hi = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await boot(hi, w, h, diceGame());
  const box = await hi.locator(".homebtn").boundingBox();
  const pad = 18;
  await hi.screenshot({
    path: out + "/run13-avatar-after-" + name + ".png",
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - 6),
      width: box.width + pad * 2 + 120,
      height: box.height + 16,
    },
  });
  await hi.screenshot({
    path: out + "/run13-avatar-after-" + name + "-tight.png",
    clip: { x: box.x, y: box.y, width: box.width, height: box.height },
  });
  notes["avatar-" + name] = await hi.evaluate(() => {
    const btn = document.querySelector(".homebtn");
    const img = btn.querySelector("img");
    const br = btn.getBoundingClientRect();
    const ir = img.getBoundingClientRect();
    return {
      box: [Math.round(br.width), Math.round(br.height)],
      img: [Math.round(ir.width), Math.round(ir.height)],
      fit: getComputedStyle(img).objectFit,
      row: Math.round(document.querySelector(".hud-row1").getBoundingClientRect().height),
    };
  });
  await hi.close();
}

await boot(page, 390, 844, atsGame());
await page.evaluate(() => {
  window.__bbRng = () => {
    const seq = [1, 5];
    window.__bbI = window.__bbI || 0;
    return (seq[window.__bbI++] - 0.5) / 6;
  };
});
await page.locator("button[data-act='roll']").click();
await page.waitForSelector(".win-billie");
await page.waitForTimeout(200);
await save(page, "run13-bigwin-390.jpg");
notes.bigwin = await page.evaluate(() => {
  const chip = document.querySelector(".winstamp em").getBoundingClientRect();
  const billie = getComputedStyle(document.querySelector(".win-billie")).visibility;
  return { left: Math.round(chip.left), right: Math.round(chip.right), vw: innerWidth, billie };
});

await browser.close();
console.log(JSON.stringify(notes, null, 2));

for (const file of fs.readdirSync(out)) {
  if (file.startsWith("run13-")) {
    fs.copyFileSync(out + "/" + file, "/opt/cursor/artifacts/screenshots/" + file);
  }
}
