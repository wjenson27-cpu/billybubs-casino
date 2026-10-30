/**
 * Run 15b: seven-out contrast, dome Billy clear of the result line, count plurals.
 */
import test from "node:test";
import { ensureStaticServer } from "./listen.mjs";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as E from "../js/engine.mjs";

const CHROME = ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/local/bin/google-chrome", "/usr/bin/chromium"].find((p) => existsSync(p));
const root = fileURLToPath(new URL("..", import.meta.url));

test("counts are singular only for 1", () => {
  assert.equal(E.countPhrase(1, "roll") + " · " + E.countPhrase(0, "pt", "pts"), "1 roll · 0 pts");
  assert.equal(E.countPhrase(1, "hand"), "1 hand");
  assert.equal(E.countPhrase(1, "roll") + " so far", "1 roll so far");
  assert.equal(E.countPhrase(0, "roll"), "0 rolls");
  assert.equal(E.countPhrase(2, "roll"), "2 rolls");
  assert.equal(E.countPhrase(2, "hand"), "2 hands");
  assert.equal(E.countPhrase(2, "pt", "pts"), "2 pts");
  assert.equal(E.countPhrase(1, "point"), "1 point");
  const warm = E.blazeMoment({ rolls: 3, points: 0 }, { rolls: 4, points: 0 }, "roll");
  assert.match(warm.text, /lasted 4 rolls so far/);
  const hot = E.blazeMoment({ rolls: 11, points: 0 }, { rolls: 12, points: 0 }, "roll");
  assert.match(hot.text, /Hot hand: 12 rolls so far/);
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function pointGame() {
  const g = E.createGame({ mode: "regular", bankroll: 100_000 });
  g.phase = "point";
  g.point = 6;
  g.hand = { rolls: 2, points: 1, lastLength: 0 };
  g.bets.pass = 500;
  g.lastDice = { d1: 1, d2: 1, total: 2, hard: true, aria: "one and one, two", word: "SNAKE EYES" };
  g.history = [{ d1: 1, d2: 1, total: 2, hard: true, result: "point" }];
  return g;
}

function contrastRatio(a, b) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const lum = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
  const hi = Math.max(lum(a), lum(b));
  const lo = Math.min(lum(a), lum(b));
  return (hi + 0.05) / (lo + 0.05);
}

test("seven-out contrast and Billy clear of the longest call", async (t) => {
  if (!CHROME) {
    t.skip("system Chrome is not available");
    return;
  }
  let pw;
  try {
    pw = await import("playwright-core");
  } catch {
    t.skip("playwright-core is not available");
    return;
  }
  const server = await ensureStaticServer(root);
  const port = server.port;
  const browser = await pw.chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-gpu"] });
  try {
    const page = await browser.newPage();
    const base = "http://127.0.0.1:" + port + "/index.html";
    async function boot(w, h) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(base, { waitUntil: "domcontentloaded" });
      await page.evaluate((saved) => {
        localStorage.clear();
        localStorage.setItem("bb-bubble-craps-v1", JSON.stringify({
          settings: { sound: false, autoRoll: false, tutorOn: false, reduced: true, blazing: false, chip: 500, seenBlaze: {} },
          game: saved, allRolls: [],
        }));
      }, pointGame());
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("button[data-act='play'][data-mode='regular']").first().click();
      await page.waitForSelector(".felt.bfx.scaled");
    }

    for (const [w, h] of [[320, 568], [360, 640], [375, 667], [390, 844], [430, 932]]) {
      await boot(w, h);
      await page.locator("button.dot[aria-label='Dice']").click();
      await page.waitForSelector("#dice-row .cube");
      await page.evaluate(() => {
        const seq = [3, 4];
        let i = 0;
        window.__bbRng = () => (seq[i++] - 0.5) / 6;
      });
      await page.locator("button[data-act='roll']").click();
      await page.waitForSelector(".pso-plate .readcall");
      const sample = await page.evaluate(() => {
        const call = document.querySelector(".pso-plate .readcall");
        const pill = call.closest(".pso-plate");
        const parse = (s) => {
          const m = String(s).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
        };
        return {
          text: call.textContent,
          fg: parse(getComputedStyle(call).color),
          bg: parse(getComputedStyle(pill).backgroundColor),
        };
      });
      assert.ok(String(sample.text || "").indexOf("SEVEN OUT") === 0, w + "x" + h + " " + sample.text);
      assert.deepEqual(sample.fg, [255, 211, 106], w + "x" + h + " readcall");
      assert.ok(sample.bg, w + "x" + h + " pill");
      const ratio = contrastRatio(sample.fg, sample.bg);
      assert.ok(ratio >= 4.5, w + "x" + h + " contrast " + ratio.toFixed(2));
    }

    const calls = ["SNAKE EYES", "HARD FOUR", "HARD EIGHT", "EASY EIGHT", "ACE DEUCE"];
    for (const [w, h] of [[360, 640], [375, 812], [390, 844], [393, 852], [414, 896]]) {
      await boot(w, h);
      await page.locator("button.dot[aria-label='Dice']").click();
      await page.waitForSelector(".dome-billy");
      await page.waitForSelector(".result-line .readcall");
      const fit = await page.evaluate((words) => {
        const billy = document.querySelector(".dome-billy");
        const line = document.querySelector(".result-line");
        const call = line.querySelector(".readcall");
        const speech = document.querySelector(".dome-cast .speech");
        function hit(a, b) {
          const iw = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const ih = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          return iw > 0.5 && ih > 0.5 ? iw : 0;
        }
        const rows = words.map((word) => {
          call.textContent = word;
          const br = billy.getBoundingClientRect();
          const lr = line.getBoundingClientRect();
          const sr = speech.getBoundingClientRect();
          return { word, overlap: hit(br, lr), speech: hit(sr, lr), lineLeft: lr.left, billyRight: br.right };
        });
        rows.sort((a, b) => b.lineLeft - a.lineLeft);
        const longest = rows.reduce((best, row) => (row.lineLeft < best.lineLeft ? row : best));
        return { longest, rows };
      }, calls);
      assert.equal(fit.longest.overlap, 0, w + "x" + h + " " + fit.longest.word + " overlap " + fit.longest.overlap.toFixed(1));
      fit.rows.forEach((row) => {
        assert.equal(row.overlap, 0, w + "x" + h + " " + row.word + " overlap " + row.overlap.toFixed(1));
        assert.equal(row.speech, 0, w + "x" + h + " " + row.word + " speech");
      });
    }
    await boot(393, 852);
    await page.locator("button.dot[aria-label='Dice']").click();
    await page.waitForSelector(".dome-billy");
    await page.evaluate(() => {
      const seq = [4, 4];
      let i = 0;
      window.__bbRng = () => (seq[i++] - 0.5) / 6;
    });
    await page.locator("button[data-act='roll']").click();
    await page.waitForFunction(() => {
      const call = document.querySelector(".result-line .readcall");
      return call && /HARD EIGHT|EIGHT/.test(call.textContent || "");
    });
    const live = await page.evaluate(() => {
      const billy = document.querySelector(".dome-billy");
      const line = document.querySelector(".result-line");
      const br = billy.getBoundingClientRect();
      const lr = line.getBoundingClientRect();
      const iw = Math.min(br.right, lr.right) - Math.max(br.left, lr.left);
      const ih = Math.min(br.bottom, lr.bottom) - Math.max(br.top, lr.top);
      return { overlap: iw > 0.5 && ih > 0.5 ? iw : 0, text: document.querySelector(".result-line .readcall").textContent };
    });
    assert.equal(live.overlap, 0, "393 live hard eight overlap " + live.overlap + " " + live.text);
  } finally {
    await browser.close();
    server.kill();
  }
});
