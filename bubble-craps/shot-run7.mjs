import { chromium } from "playwright-core";
import fs from "node:fs";

const port = 8768;
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
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
}

async function playRegular(page) {
  await page.locator("button[data-act='play'][data-mode='regular']").first().click();
  await page.waitForSelector(".felt");
  await page.waitForTimeout(300);
}

const page = await browser.newPage();
await boot(page, 390, 844);
await playRegular(page);

await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
  raw.game.hand = { rolls: 14, points: 1, comeOuts: 1 };
  raw.game.phase = "point";
  raw.game.point = 6;
  raw.settings.seenBlaze = { warm: true, hot: true, blazing: true };
  localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
});
await page.reload({ waitUntil: "networkidle" });
await playRegular(page);
await page.locator("button.dot[data-act='page'][data-page='2']").click();
await page.waitForSelector(".dome-billy");
await page.waitForTimeout(200);
const hot = await page.evaluate(() => ({
  billy: document.querySelectorAll(".dome-billy").length,
  billie: document.querySelectorAll(".dome-billie").length,
  speech: (document.querySelector(".dome-cast .speech") || {}).textContent || "",
}));
note("hot-mascots", hot);
await page.screenshot({ path: out + "/run7-hot-one-mascot.png" });

await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
  raw.game.hand = { rolls: 24, points: 2, comeOuts: 1 };
  localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
});
await page.reload({ waitUntil: "networkidle" });
await playRegular(page);
await page.locator("button.dot[data-act='page'][data-page='2']").click();
await page.waitForSelector(".dome-billy");
const blaze = await page.evaluate(() => ({
  billy: document.querySelectorAll(".dome-billy").length,
  billie: document.querySelectorAll(".dome-billie").length,
}));
note("blazing-mascots", blaze);
await page.screenshot({ path: out + "/run7-blazing-one-mascot.png" });

await page.evaluate(() => document.body.classList.add("bigwin"));
const hidden = await page.evaluate(() => getComputedStyle(document.querySelector(".dome-billy")).visibility);
note("bigwin-hides-billy", { visibility: hidden });
await page.evaluate(() => document.body.classList.remove("bigwin"));

await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
  raw.game.hand = { rolls: 9, points: 0, comeOuts: 1 };
  raw.game.phase = "come-out";
  raw.game.point = null;
  raw.game.bets.pass = 500;
  raw.game.bankroll = raw.game.bankroll - 0;
  raw.settings.seenBlaze = { warm: true, hot: true, blazing: true };
  localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
});
await page.reload({ waitUntil: "networkidle" });
await playRegular(page);
await page.waitForSelector("button[data-act='roll']");
await page.evaluate(() => {
  const faces = [3, 4];
  let i = 0;
  window.__bbRng = () => (faces[i++] - 1) / 6 + 0.001;
});
await page.locator("button[data-act='roll']").click();
await page.waitForSelector(".badgetoast", { timeout: 8000 });
await page.waitForTimeout(250);
const toast = await page.evaluate(() => {
  const t = document.querySelector(".badgetoast").getBoundingClientRect();
  const dock = document.getElementById("dock").getBoundingClientRect();
  const chip = document.querySelector(".chip-btn").getBoundingClientRect();
  const dot = document.querySelector(".dots").getBoundingClientRect();
  const overlaps = (a, b) => a.bottom > b.top && a.top < b.bottom && a.right > b.left && a.left < b.right;
  return {
    toast: { x: t.x, y: t.y, r: t.right, b: t.bottom, w: t.width },
    dockTop: dock.top,
    overlapsChip: overlaps(t, chip),
    overlapsDot: overlaps(t, dot),
    text: document.querySelector(".badgetoast").innerText.slice(0, 80),
    col: t.left >= 8 && t.right <= 382,
  };
});
note("toast-live", toast);
await page.screenshot({ path: out + "/run7-toast-up.png" });
await page.waitForTimeout(3400);
const gone = await page.evaluate(() => document.getElementById("badge-toast").innerHTML.length);
note("toast-dismissed", { htmlLength: gone });
await page.screenshot({ path: out + "/run7-toast-gone.png" });

await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
  raw.game.hand = { rolls: 0, points: 0, comeOuts: 0 };
  raw.game.phase = "point";
  raw.game.point = 9;
  raw.game.strategy = null;
  localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
});
await page.reload({ waitUntil: "networkidle" });
await playRegular(page);
await page.locator("button[data-act='view'][data-view='home']").click();
await page.locator("button[data-act='view'][data-view='learn']").click();
await page.locator("button[data-act='strategy'][data-id='B13']").click();
await page.waitForSelector(".stropts");
await page.waitForTimeout(400);
const felt = await page.evaluate(() => {
  const f = document.querySelector(".felt");
  const k = getComputedStyle(document.documentElement).getPropertyValue("--felt-k").trim();
  const place = document.querySelector(".half.place").getBoundingClientRect();
  const before = getComputedStyle(document.querySelector(".half.place"), "::before");
  const boxes = [...document.querySelectorAll(".felt .numbox, .felt .band, .felt .prop, .felt .ats")].map((el) => {
    const r = el.getBoundingClientRect();
    return { cls: el.className, top: Math.round(r.top), bottom: Math.round(r.bottom) };
  });
  let overlap = false;
  for (let i = 1; i < boxes.length; i++) {
    if (boxes[i].top < boxes[i - 1].bottom - 1) overlap = true;
  }
  return {
    scaled: f.classList.contains("scaled"),
    k,
    placeH: Math.round(place.height),
    beforeH: before.height,
    stroptsH: Math.round(document.querySelector(".stropts").getBoundingClientRect().height),
    overlap,
    boxes,
  };
});
note("felt-b13-390", felt);
await page.screenshot({ path: out + "/run7-felt-b13-390.png" });

await page.setViewportSize({ width: 844, height: 390 });
await page.waitForTimeout(400);
const land = await page.evaluate(() => {
  const banks = [...document.querySelectorAll(".hud-bank")].map((el) => el.getBoundingClientRect());
  const crap = document.querySelector("button[data-mode='crapless']").getBoundingClientRect();
  const hit = (a, b) => a.right > b.left + 2 && a.left < b.right - 2 && a.bottom > b.top + 2 && a.top < b.bottom - 2;
  const dock = document.getElementById("dock").getBoundingClientRect();
  const undo = document.querySelector(".undodisc");
  const chip = document.querySelector(".chip-btn").getBoundingClientRect();
  return {
    banks: banks.map((b) => ({ l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top) })),
    crap: { l: Math.round(crap.left), r: Math.round(crap.right), t: Math.round(crap.top) },
    collide: banks.some((b) => hit(b, crap)),
    dockW: Math.round(dock.width),
    chipW: Math.round(chip.width),
    undo: !!undo,
    pressRight: Math.round((document.querySelector(".presswrap") || dock).getBoundingClientRect().right),
    dockRight: Math.round(dock.right),
    crapW: Math.round(crap.width),
    crapH: Math.round(crap.height),
  };
});
note("landscape", land);
await page.screenshot({ path: out + "/run7-landscape.png" });
await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
  raw.game.pressStack = [{ number: 6, stake: 600, added: 600 }];
  localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
});
await page.reload({ waitUntil: "networkidle" });
await page.setViewportSize({ width: 844, height: 390 });
await playRegular(page);
await page.waitForTimeout(300);
const undoBox = await page.evaluate(() => {
  const undo = document.querySelector(".undodisc");
  const dock = document.getElementById("dock").getBoundingClientRect();
  if (!undo) return { present: false };
  const r = undo.getBoundingClientRect();
  const inside = r.left >= dock.left - 1 && r.right <= dock.right + 1 && r.top >= dock.top - 1 && r.bottom <= dock.bottom + 1 && r.width >= 20;
  return { present: true, inside, w: Math.round(r.width), l: Math.round(r.left), r: Math.round(r.right), dockL: Math.round(dock.left), dockR: Math.round(dock.right) };
});
note("landscape-undo", undoBox);

await page.setViewportSize({ width: 390, height: 844 });
await page.locator("button[data-act='view'][data-view='home']").click();
await page.locator("button.tab[data-act='view'][data-view='leaderboard']").click();
await page.waitForSelector(".badgebar");
const gallery = await page.evaluate(() => {
  const bar = getComputedStyle(document.querySelector(".badgebar"));
  const i = getComputedStyle(document.querySelector(".badgebar i"));
  const secs = [...document.querySelectorAll(".badgesec")].map((el) => el.textContent);
  const tiers = [...document.querySelectorAll(".tierbar b")].map((el) => el.textContent);
  const earned = [...document.querySelectorAll("h2")].map((el) => el.textContent).find((t) => /earned/i.test(t)) || "";
  return { display: bar.display, h: bar.height, iH: i.height, secs, tiers, earned };
});
note("gallery", gallery);
await page.screenshot({ path: out + "/run7-gallery.png", fullPage: true });

await page.locator("button.tab[data-act='view'][data-view='settings']").click();
await page.waitForSelector(".setinits .init");
const initials = await page.evaluate(() => {
  const el = document.querySelector(".setinits .init");
  const s = getComputedStyle(el);
  return { n: document.querySelectorAll(".setinits .init").length, font: s.fontFamily, size: s.fontSize, bg: s.backgroundColor, border: s.borderColor };
});
note("settings-initials", initials);
await page.locator(".setinits .init").first().fill("B");
await page.waitForTimeout(100);
const focused = await page.evaluate(() => {
  const boxes = [...document.querySelectorAll(".setinits .init")];
  return { values: boxes.map((b) => b.value), focus: boxes.indexOf(document.activeElement) };
});
note("initials-advance", focused);
await page.locator(".setinits").scrollIntoViewIfNeeded();
await page.screenshot({ path: out + "/run7-settings-initials.png" });
await page.locator(".setinits").screenshot({ path: out + "/run7-settings-initials-row.png" });

await page.locator("button[data-act='view'][data-view='play']").click();
await page.waitForSelector(".felt");
await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
  raw.game.strategy = null;
  raw.game.phase = "point";
  raw.game.point = 9;
  raw.game.hand = { rolls: 2, points: 0, comeOuts: 1 };
  raw.game.bets.place = raw.game.bets.place || {};
  raw.game.bets.place[6] = 0;
  localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
});
await page.reload({ waitUntil: "networkidle" });
await playRegular(page);
await page.locator("button[data-act='bet'][data-kind='place'][data-number='6']").click();
await page.waitForTimeout(200);
await page.evaluate(() => {
  const faces = [1, 5];
  let i = 0;
  window.__bbRng = () => (faces[i++] - 1) / 6 + 0.001;
});
await page.locator("button[data-act='roll']").click();
await page.waitForFunction(() => {
  const btn = document.querySelector("button[data-act='power']");
  return btn && !btn.disabled;
}, { timeout: 8000 });
const power = await page.evaluate(() => {
  const btn = document.querySelector("button[data-act='power']");
  return { text: btn ? btn.innerText : "", disabled: btn ? btn.disabled : true };
});
note("power-label", power);
await page.locator("button[data-act='power']").scrollIntoViewIfNeeded();
await page.screenshot({ path: out + "/run7-power-label.png" });
await page.locator(".presspair").screenshot({ path: out + "/run7-power-label-dock.png" });

fs.writeFileSync("/tmp/run7-metrics.json", JSON.stringify(log, null, 2));
await browser.close();
