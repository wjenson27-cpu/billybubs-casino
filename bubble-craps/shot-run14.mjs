import { chromium } from "playwright-core";
import fs from "node:fs";
import * as E from "./js/engine.mjs";

const base = process.argv[2] || "http://127.0.0.1:8851/index.html";
const out = "docs/qa/compare";
const art = "/opt/cursor/artifacts/screenshots";
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(art, { recursive: true });

for (const name of ["375", "390", "844"]) {
  const src = "/tmp/r14-before/top-" + name + ".png";
  if (fs.existsSync(src)) fs.copyFileSync(src, out + "/run14-top-before-" + name + ".png");
}

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome-stable",
  args: ["--no-sandbox", "--disable-gpu"],
});

function pointGame() {
  const g = E.createGame();
  g.phase = "point";
  g.point = 6;
  g.hand = { rolls: 4, points: 1, lastLength: 0 };
  g.lastDice = { d1: 5, d2: 5, total: 10, hard: true, aria: "five and five", word: "HARD TEN" };
  g.history = [
    { d1: 5, d2: 5, total: 10, hard: true, result: "point" },
    { d1: 3, d2: 3, total: 6, hard: true, result: "point" },
  ];
  return g;
}

async function boot(page, w, h) {
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
  }, pointGame());
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("button[data-act='play'][data-mode='regular']").first().click();
  await page.waitForSelector(".spot.field");
}

const notes = {};
const sizes = [[320, 568], [360, 640], [375, 667], [390, 844], [430, 932], [844, 390], [932, 430]];
const page = await browser.newPage();

for (const [w, h] of sizes) {
  await boot(page, w, h);
  const tag = w + "x" + h;
  if ([375, 390, 430, 844].includes(w) && h !== 430) {
    const field = page.locator(".spot.field");
    await field.scrollIntoViewIfNeeded();
    await field.screenshot({ path: out + "/run14-field-" + tag + ".png" });
  }
  await page.locator("button.dot[aria-label='Dice']").click();
  await page.waitForSelector("#dice-row .cube");
  await page.waitForTimeout(300);
  await page.screenshot({ path: out + "/run14-dome-" + tag + ".jpg", type: "jpeg", quality: 80 });
  notes[tag] = await page.evaluate(() => {
    const dice = [...document.querySelectorAll("#dice-row .cube3d")].map((el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), top: Math.round(r.top), bottom: Math.round(r.bottom) };
    });
    const result = document.querySelector(".dome-screen .result-line").getBoundingClientRect();
    const strip = document.querySelector(".dome-screen .rollstrip").getBoundingClientRect();
    return {
      dice,
      result: Math.round(result.top) + "-" + Math.round(result.bottom),
      strip: Math.round(strip.top) + "-" + Math.round(strip.bottom),
      vh: innerHeight,
      stripDisplay: getComputedStyle(document.querySelector(".dome-screen .rollstrip")).display,
    };
  });
}

await boot(page, 360, 640);
const row2 = await page.locator("#hud .hud-row2").boundingBox();
await page.screenshot({
  path: out + "/run14-fair-360.jpg",
  type: "jpeg",
  quality: 82,
  clip: { x: 0, y: Math.max(0, row2.y - 4), width: 360, height: row2.height + 10 },
});
notes.fair360 = await page.evaluate(() => {
  const fair = document.querySelector("#hud .fairchip").getBoundingClientRect();
  const row = document.querySelector("#hud .hud-row2").getBoundingClientRect();
  return { fair: Math.round(fair.left) + "-" + Math.round(fair.right), rowRight: Math.round(row.right) };
});

for (const [w, h, name] of [[375, 667, "375"], [390, 844, "390"], [844, 390, "844"]]) {
  const hi = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await boot(hi, w, h);
  const row = await hi.locator(".hud-row1").boundingBox();
  await hi.screenshot({
    path: out + "/run14-top-after-" + name + ".png",
    clip: { x: 0, y: Math.max(0, row.y - 2), width: Math.min(w, row.width + row.x + 8), height: row.height + 8 },
  });
  notes["top-" + name] = await hi.evaluate(() => {
    const home = document.querySelector(".homebtn");
    const img = [...home.querySelectorAll("img")].find((el) => getComputedStyle(el).display !== "none");
    const lock = document.querySelector(".hud-row1 .lockup");
    const seg = document.querySelector(".hud-row1 .modeseg");
    return {
      home: img.getAttribute("src").split("/").pop(),
      homeBox: Math.round(home.getBoundingClientRect().width),
      lock: getComputedStyle(lock).display === "none" ? "hidden" : Math.round(lock.getBoundingClientRect().left) + "-" + Math.round(lock.getBoundingClientRect().right),
      seg: Math.round(seg.getBoundingClientRect().right),
      shadow: getComputedStyle(home).boxShadow,
    };
  });
  await hi.close();
}

await browser.close();
console.log(JSON.stringify(notes, null, 2));

for (const file of fs.readdirSync(out)) {
  if (file.startsWith("run14-")) fs.copyFileSync(out + "/" + file, art + "/" + file);
}
