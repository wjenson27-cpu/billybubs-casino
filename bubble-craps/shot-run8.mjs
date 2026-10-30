import { chromium } from "playwright-core";
import fs from "node:fs";

const port = 8794;
const base = "http://127.0.0.1:" + port + "/index.html";
const out = "docs/qa/compare";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome-stable",
  args: ["--no-sandbox", "--disable-gpu"],
});
const log = [];
function note(name, data) {
  log.push({ name, ...data });
  console.log(name, JSON.stringify(data));
}

async function boot(page, w, h) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
}

const page = await browser.newPage();
await boot(page, 390, 844);
await page.locator("button[data-act='play'][data-mode='regular']").first().click();
await page.waitForSelector(".felt");

await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
  raw.settings.autoRoll = false;
  raw.settings.tutorOn = false;
  raw.settings.sound = false;
  raw.game.phase = "point";
  raw.game.point = 6;
  raw.game.hand = { rolls: 8, points: 1, comeOuts: 1, lastLength: 0 };
  raw.game.history = Array.from({ length: 12 }, (_, i) => ({ d1: 1, d2: ((i % 6) + 1), total: 1 + ((i % 6) + 1), hard: false }));
  raw.game.lastDice = { d1: 4, d2: 4, total: 8, hard: true, line: "4·4 · HARD EIGHT", word: "HARD EIGHT" };
  raw.game.lastWin = { kind: "place", number: 8, profit: 700 };
  raw.game.bets.place[8] = 600;
  raw.game.originals.place[8] = 600;
  raw.game.pressBlock = null;
  localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
});
await page.reload({ waitUntil: "domcontentloaded" });
await page.locator("button[data-act='play'][data-mode='regular']").first().click();
await page.waitForSelector(".feltpuck");
const puck = await page.evaluate(() => {
  const img = document.querySelector(".feltpuck");
  const box = img.getBoundingClientRect();
  const face = img.parentElement.getBoundingClientRect();
  return {
    alt: img.alt,
    w: Math.round(box.width),
    top: Math.round(box.top - face.top),
    right: Math.round(face.right - box.right),
    inside: box.right <= face.right + 1 && box.top >= face.top - 1,
  };
});
note("felt-puck", puck);
await page.screenshot({ path: out + "/run8-puck-390.png" });

const six = await page.evaluate(() => {
  const name = document.querySelector(".hud-point .pointname");
  const box = name.getBoundingClientRect();
  return {
    text: name.textContent.trim(),
    scroll: name.scrollWidth,
    client: name.clientWidth,
    right: Math.round(box.right),
    diceLeft: Math.round((document.querySelector(".lastdice") || { getBoundingClientRect: () => ({ left: 999 }) }).getBoundingClientRect().left),
    vw: window.innerWidth,
  };
});
note("hud-six", six);
await page.screenshot({ path: out + "/run8-hud-six-390.png" });

await page.locator("button.dot[aria-label='Dice']").click();
await page.waitForSelector(".dome-screen .rollstrip");
const hist = await page.evaluate(() => ({
  chips: document.querySelectorAll(".dome-screen .rchip").length,
  last20: !!document.querySelector(".last20"),
  wrap: getComputedStyle(document.querySelector(".dome-screen .rollstrip")).flexWrap,
  overflow: getComputedStyle(document.querySelector(".dome-screen .rollstrip")).overflow,
}));
note("dome-history", hist);
await page.screenshot({ path: out + "/run8-dome-history.png" });

const press = await page.evaluate(() => {
  const btns = [...document.querySelectorAll(".press-btn")];
  return btns.map((b) => b.innerText.replace(/\n/g, " | "));
});
note("press-lines", { press });
await page.screenshot({ path: out + "/run8-press.png" });

await page.setViewportSize({ width: 430, height: 900 });
await page.waitForTimeout(200);
const felt = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--felt-k").trim());
note("felt-430", { k: felt });
await page.locator("button.dot[aria-label='Board']").click();
await page.waitForTimeout(200);
await page.screenshot({ path: out + "/run8-felt-430.png" });

await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
  raw.game.phase = "come-out";
  raw.game.point = null;
  raw.game.hand = { rolls: 0, points: 0, comeOuts: 0, lastLength: 0 };
  raw.game.bets.pass = 0;
  raw.game.bets.come = 0;
  localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
});
await page.reload({ waitUntil: "domcontentloaded" });
await page.locator("button[data-act='play'][data-mode='crapless']").first().click();
await page.waitForSelector(".ats");
const ats = await page.evaluate(() => ({
  spots: document.querySelectorAll(".ats .spot").length,
  names: [...document.querySelectorAll(".ats .spot b")].map((n) => n.textContent),
}));
note("crapless-ats", ats);
await page.screenshot({ path: out + "/run8-crapless-ats.png" });

await page.locator("button.homebtn").click();
await page.locator("button.tab[data-view='settings']").click();
await page.waitForSelector(".initactions");
const inits = await page.evaluate(() => {
  const go = document.querySelector(".initactions .go");
  const s = getComputedStyle(go);
  return { text: go.textContent, radius: s.borderRadius, bg: s.backgroundImage.slice(0, 40) };
});
note("initials", inits);
await page.screenshot({ path: out + "/run8-settings-initials.png" });

await page.locator("button.tab[data-view='leaderboard']").click();
await page.waitForSelector(".boardpage");
await page.evaluate(() => {
  const key = "bb-bubble-badges-v1";
  const data = JSON.parse(localStorage.getItem(key) || "null") || { entries: [], badges: {}, progress: {}, sessions: { withinLimits: 0, awarded: [] }, initials: { asked: true, default: "BJ" }, nextHandId: 2 };
  data.entries = [{
    id: "h1", handId: 1, name: "BJ", initials: "BJ", throws: 18, rolls: 18, points: 3, pointsMade: 3,
    at: Date.now(), sevenOutAt: Date.now(), mode: "regular", topBlazingTier: "hot", hadBetOnSevenOut: true,
  }];
  localStorage.setItem(key, JSON.stringify(data));
});
await page.reload({ waitUntil: "domcontentloaded" });
await page.locator("button.tab[data-view='leaderboard']").click();
await page.waitForSelector(".rollcount");
const led = await page.evaluate(() => {
  const el = document.querySelector(".rollcount");
  const s = getComputedStyle(el);
  return { text: el.textContent, size: s.fontSize, color: s.color, align: s.textAlign, family: s.fontFamily };
});
note("rollcount", led);
await page.screenshot({ path: out + "/run8-leader.png" });

await page.locator("button.badgetile").first().click();
await page.waitForSelector(".rulecard");
const rule = await page.evaluate(() => ({
  h: document.querySelector(".rulecard h3").textContent,
  pills: [...document.querySelectorAll(".badgedetail .pills span")].map((n) => n.textContent),
}));
note("badge-detail", rule);
await page.screenshot({ path: out + "/run8-badge-detail.png" });

const touch = await page.evaluate(() => ({
  stage: getComputedStyle(document.getElementById("stage")).touchAction,
  overscroll: getComputedStyle(document.documentElement).overscrollBehaviorX,
}));
note("touch", touch);

fs.writeFileSync(out + "/run8-notes.json", JSON.stringify(log, null, 2));
await browser.close();
