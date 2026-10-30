/**
 * Live swipe check. Uses Playwright's core against the system Chrome when both exist.
 * Skips in environments that have neither, so `npm test` still passes on a bare Node runner.
 */
import test from "node:test";
import { ensureStaticServer } from "./listen.mjs";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

const CHROME = ["/usr/local/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium"].find((p) => existsSync(p));

async function loadPlaywright() {
  try {
    return await import("playwright-core");
  } catch {
    return null;
  }
}


function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test("a horizontal swipe that starts on a felt button changes the screen and the dot", async (t) => {
  const pw = await loadPlaywright();
  if (!pw || !CHROME) {
    t.skip("playwright-core or system Chrome is not available");
    return;
  }
  const server = await ensureStaticServer(root);
  const port = server.port;
  const browser = await pw.chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    await page.addInitScript(() => {
      localStorage.setItem("bb-bubble-craps-v1", JSON.stringify({
        settings: { autoRoll: false, sound: false, tutorOn: false, blazing: true, autoPress: "off", autoPressMax: 3, seenBlaze: {} },
      }));
    });
    await page.goto("http://127.0.0.1:" + port + "/index.html", { waitUntil: "networkidle" });
    await page.click("button[data-mode='regular']");
    await page.waitForSelector("#stage[data-page='1']");

    const field = page.locator("button[data-kind='field']");
    const box = await field.boundingBox();
    assert.ok(box, "Field is on the board");
    const y = box.y + box.height / 2;
    const x = box.x + box.width * 0.72;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 140, y + 2, { steps: 12 });
    await page.mouse.up();
    await page.waitForFunction(() => {
      const stage = document.getElementById("stage");
      const dice = document.getElementById("dice-row");
      if (!stage || !dice || stage.dataset.page !== "2") return false;
      const rect = dice.getBoundingClientRect();
      return rect.x > 8 && rect.right < 400;
    });
    const diceDot = await page.locator(".dot[aria-label='Dice']").getAttribute("class");
    assert.match(diceDot, /\bon\b/);
    const boardDot = await page.locator(".dot[aria-label='Board']").getAttribute("class");
    assert.doesNotMatch(boardDot, /\bon\b/);
    const fieldClass = await field.getAttribute("class");
    assert.doesNotMatch(fieldClass || "", /\bhas\b/, "the swipe must not place the Field bet");

    const dice = page.locator("#dice-row");
    const diceBox = await dice.boundingBox();
    assert.ok(diceBox);
    const dy = diceBox.y + 20;
    const dx = diceBox.x + 40;
    await page.mouse.move(dx, dy);
    await page.mouse.down();
    await page.mouse.move(dx + 200, dy + 4, { steps: 12 });
    await page.mouse.up();
    await page.waitForFunction(() => {
      const stage = document.getElementById("stage");
      const field = document.querySelector("button[data-kind='field']");
      if (!stage || !field || stage.dataset.page !== "1") return false;
      const rect = field.getBoundingClientRect();
      return rect.x > 8 && rect.right < 390;
    });
    const back = await page.locator(".dot[aria-label='Board']").getAttribute("class");
    assert.match(back, /\bon\b/);

    const fieldAgain = page.locator("button[data-kind='field']");
    const fieldBox = await fieldAgain.boundingBox();
    assert.ok(fieldBox && fieldBox.x > 0, "Field is on screen");
    const fy = fieldBox.y + fieldBox.height / 2;
    const fx = fieldBox.x + 36;
    await page.mouse.move(fx, fy);
    await page.mouse.down();
    await page.mouse.move(fx + 150, fy, { steps: 12 });
    await page.mouse.up();
    await page.waitForFunction(() => document.getElementById("stage").dataset.page === "0");
    const side = await page.locator(".dot[aria-label='Side bets']").getAttribute("class");
    assert.match(side, /\bon\b/);
    assert.ok(await page.locator("text=C 3:1").count());
    assert.equal(errors.length, 0, errors.join("\n"));
  } finally {
    await browser.close();
    server.kill();
  }
});

test("a mouse click posts a felt bet and a hit lights PRESS", async (t) => {
  const pw = await loadPlaywright();
  if (!pw || !CHROME) {
    t.skip("playwright-core or system Chrome is not available");
    return;
  }
  const server = await ensureStaticServer(root);
  const port = server.port;
  const browser = await pw.chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    await page.addInitScript(() => {
      localStorage.setItem("bb-bubble-craps-v1", JSON.stringify({
        settings: {
          autoRoll: false,
          sound: false,
          tutorOn: false,
          blazing: false,
          reduced: true,
          chip: 500,
          autoPress: "off",
          autoPressMax: 3,
          seenBlaze: {},
          showDice: false,
        },
      }));
    });
    await page.goto("http://127.0.0.1:" + port + "/index.html", { waitUntil: "networkidle" });
    await page.click("button[data-mode='regular']");
    await page.waitForSelector("#stage[data-page='1']");
    const pass = page.locator("button[aria-label^='Pass Line']");
    const box = await pass.boundingBox();
    assert.ok(box && box.width > 10, "Pass Line is on screen");
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForFunction(() => {
      const bank = document.querySelector(".hud-bank strong");
      return bank && bank.textContent && !bank.textContent.includes("1,000");
    });
    await page.evaluate(() => {
      let i = 0;
      const faces = [1, 5];
      window.__bbRng = () => (faces[i++] - 1) / 6;
    });
    await page.click("button[aria-label='Roll the dice']");
    await page.waitForFunction(() => /POINT\s+SIX/.test(document.body.innerText), null, { timeout: 8000 });
    const place = page.locator("button[aria-label^='Place 6']");
    const pbox = await place.boundingBox();
    assert.ok(pbox, "Place 6 is on screen");
    await page.mouse.click(pbox.x + pbox.width / 2, pbox.y + pbox.height / 2);
    await page.waitForFunction(() => /\$6/.test(document.querySelector("button[aria-label^='Place 6']")?.getAttribute("aria-label") || ""));
    await page.evaluate(() => {
      let i = 0;
      const faces = [3, 3];
      window.__bbRng = () => (faces[i++] - 1) / 6;
    });
    await page.click("button[aria-label='Roll the dice']");
    await page.waitForFunction(() => {
      const btn = document.querySelector("[data-act='press']");
      return btn && !btn.disabled && /PRESS\s+6/.test(btn.textContent || "");
    }, null, { timeout: 8000 });
    const body = await page.locator("body").innerText();
    assert.equal(body.includes("+$0"), false);
    assert.equal(body.includes("BIG WIN! -$"), false);
    assert.equal(body.includes("Just for show"), false);
    assert.equal(errors.length, 0, errors.join("\n"));
  } finally {
    await browser.close();
    server.kill();
  }
});
