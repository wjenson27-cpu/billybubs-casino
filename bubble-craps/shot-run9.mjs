import { chromium } from "playwright-core";
import fs from "node:fs";

const port = 8801;
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

async function boot(page, w, h) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
}

const page = await browser.newPage();
await boot(page, 390, 844);
const robots = await page.locator("meta[name='robots']").getAttribute("content");
note("robots", { robots });
await page.locator("button[data-act='play'][data-mode='regular']").first().click();
await page.waitForSelector(".felt");
await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
  raw.settings.autoRoll = false;
  raw.settings.tutorOn = false;
  raw.settings.sound = false;
  raw.settings.reduced = true;
  raw.game.phase = "point";
  raw.game.point = 6;
  raw.game.hand = { rolls: 0, points: 1, comeOuts: 1, lastLength: 0 };
  raw.game.history = [
    { d1: 2, d2: 2, total: 4, hard: true },
    { d1: 3, d2: 3, total: 6, hard: true },
    { d1: 5, d2: 3, total: 8, hard: false },
    { d1: 4, d2: 4, total: 8, hard: true },
  ];
  raw.game.lastDice = { d1: 4, d2: 4, total: 8, hard: true, line: "HARD EIGHT", word: "HARD EIGHT", aria: "four and four, hard eight" };
  raw.game.bets.place[6] = 600;
  localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
});
await page.reload({ waitUntil: "domcontentloaded" });
await page.locator("button[data-act='play'][data-mode='regular']").first().click();
await page.waitForSelector(".feltpuck");
const hud = await page.evaluate(() => {
  const puck = document.querySelector(".feltpuck");
  const face = puck.parentElement.getBoundingClientRect();
  const box = puck.getBoundingClientRect();
  const banks = [...document.querySelectorAll(".hud-money .hud-bank")];
  const gap = banks.length === 2 ? Math.round(banks[1].getBoundingClientRect().left - banks[0].getBoundingClientRect().right) : null;
  const zero = document.querySelector(".hud-roll strong");
  const zcs = getComputedStyle(zero);
  return {
    puck: { w: Math.round(box.width), top: Math.round(box.top - face.top), right: Math.round(face.right - box.right) },
    gap,
    zero: zero.textContent,
    zeroFont: zcs.fontFamily,
    result: (document.querySelector(".result-line") || {}).textContent || "",
  };
});
note("hud", hud);
await page.screenshot({ path: out + "/run9-hud-390.jpg", type: "jpeg", quality: 80 });

await page.locator("button.dot[aria-label='Side bets']").click();
await page.waitForSelector(".hop");
await page.screenshot({ path: out + "/run9-hops.jpg", type: "jpeg", quality: 80 });
const hard4 = await page.evaluate(() => {
  const btn = [...document.querySelectorAll(".hop")].find((b) => b.dataset.pair === "2-2");
  const on = [...btn.querySelectorAll(".mini-die")].map((die) => [...die.querySelectorAll(".pip.on")].length);
  return { label: btn.querySelector("b").textContent.trim(), pips: on };
});
note("hard4", hard4);

await page.locator("button.dot[aria-label='Dice']").click();
await page.waitForSelector(".dome-screen .rolltile");
await page.screenshot({ path: out + "/run9-dome-390.jpg", type: "jpeg", quality: 80 });

await page.setViewportSize({ width: 430, height: 932 });
await page.evaluate(() => window.dispatchEvent(new Event("resize")));
await new Promise((r) => setTimeout(r, 200));
const strip = await page.evaluate(() => {
  const tile = document.querySelector(".dome-screen .rollstrip");
  const dots = document.getElementById("dots");
  const t = tile.getBoundingClientRect();
  const d = dots.getBoundingClientRect();
  return { stripBottom: Math.round(t.bottom), dotsTop: Math.round(d.top), clear: t.bottom <= d.top + 1 };
});
note("strip-430", strip);
await page.screenshot({ path: out + "/run9-dome-430.jpg", type: "jpeg", quality: 80 });

const sizes = [[375, 812, "375"], [390, 844, "390"], [430, 932, "430"], [844, 390, "landscape"]];
for (const [w, h, name] of sizes) {
  await page.setViewportSize({ width: w, height: h });
  await page.evaluate(() => window.dispatchEvent(new Event("resize")));
  await new Promise((r) => setTimeout(r, 80));
  const box = await page.evaluate(() => {
    let host = document.getElementById("badge-toast");
    if (!host) {
      host = document.createElement("div");
      host.id = "badge-toast";
      document.body.appendChild(host);
    }
    host.innerHTML = "<div class='badgetoast marquee legendary'>" +
      "<i class='burst'></i><div><em class='tierpill'>legendary</em><b>Spin the Block</b>" +
      "<span class='facts'>About 1 in 523 hands · 31 for 1, paid in practice chips · House edge 18.30%</span>" +
      "<p class='billieline'>Spin it to win it!</p></div><button type='button'>VIEW</button></div>";
    const r = host.querySelector(".badgetoast").getBoundingClientRect();
    const pill = [...document.querySelectorAll(".edgepill")].map((el) => el.textContent.trim());
    const wrap = [...document.querySelectorAll(".edgepill")].some((el) => el.scrollHeight > el.clientHeight + 2);
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), vh: innerHeight, vw: innerWidth, pill, wrap };
  });
  note("marquee-" + name, box);
  await page.screenshot({ path: out + "/run9-marquee-" + name + ".jpg", type: "jpeg", quality: 80 });
}

await page.setViewportSize({ width: 844, height: 390 });
await page.evaluate(() => {
  const host = document.getElementById("badge-toast");
  if (host) host.innerHTML = "";
  const board = document.querySelector("button.dot[aria-label='Board']");
  if (board) board.click();
});
await new Promise((r) => setTimeout(r, 100));
const domePill = await page.evaluate(() => {
  const pills = [...document.querySelectorAll(".edgepill")];
  return pills.map((el) => ({
    text: el.textContent.trim(),
    wrap: el.scrollHeight > el.clientHeight + 2,
    nowrap: getComputedStyle(el).whiteSpace,
  }));
});
note("dome-pill", domePill);
await page.screenshot({ path: out + "/run9-landscape-board.jpg", type: "jpeg", quality: 80 });

await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => {
  document.querySelector(".tab[data-view='leaderboard']").click();
});
await page.waitForSelector(".boardpage");
await page.evaluate(() => {
  const key = "bb-bubble-badges-v1";
  const data = JSON.parse(localStorage.getItem(key) || "{}");
  data.entries = [{
    id: "h_1", handId: 1, throws: 18, points: 4, rolls: 18, pointsMade: 4,
    mode: "regular", at: Date.now(), sevenOutAt: Date.now(), initials: "BJ", name: "BJ",
    hadBetOnSevenOut: true, sevenOutDice: { d1: 3, d2: 4 }, personalBest: true, topBlazingTier: "hot",
  }];
  data.initials = { default: "BJ", asked: true };
  localStorage.setItem(key, JSON.stringify(data));
});
await page.reload({ waitUntil: "domcontentloaded" });
await page.locator(".tab[data-view='leaderboard']").click();
await page.waitForSelector(".endedon");
await page.locator("button[data-id='spin_the_block']").click();
await page.waitForSelector(".badgedetail");
const odds = await page.locator(".factrow b").first().innerText();
note("spin-odds", { odds });
await page.screenshot({ path: out + "/run9-spin-odds.jpg", type: "jpeg", quality: 80 });
await page.locator("[data-act='close']").click();
await page.screenshot({ path: out + "/run9-leader.jpg", type: "jpeg", quality: 80 });

await browser.close();
fs.writeFileSync(out + "/run9-notes.json", JSON.stringify(notes, null, 2));
