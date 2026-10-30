/**
 * Run 10: coach card does not block the table, one mascot at a time,
 * phone roll strips keep their pip tiles.
 */
import test from "node:test";
import { ensureStaticServer } from "./listen.mjs";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CHROME = ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/local/bin/google-chrome", "/usr/bin/chromium"].find((p) => existsSync(p));
const root = fileURLToPath(new URL("..", import.meta.url));

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

test("coach clicks, one mascot, and phone pip strips", async (t) => {
  const pw = await loadPlaywright();
  if (!pw || !CHROME) {
    t.skip("playwright-core or system Chrome is not available");
    return;
  }
  const server = await ensureStaticServer(root);
  const port = server.port;
  const browser = await pw.chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const base = "http://127.0.0.1:" + port + "/index.html";

    async function boot(extra) {
      await page.goto(base, { waitUntil: "domcontentloaded" });
      await page.evaluate((patch) => {
        localStorage.clear();
        const settings = {
          sound: false,
          autoRoll: false,
          tutorOn: true,
          reduced: true,
          badgeToasts: true,
          seenBlaze: { warm: true, hot: true, blazing: true },
          chip: 500,
        };
        Object.assign(settings, patch || {});
        localStorage.setItem("bb-bubble-craps-v1", JSON.stringify({ settings, game: null, allRolls: [] }));
        localStorage.setItem("bb-bubble-badges-v1", JSON.stringify({
          v: 1, name: "QA", highlightId: "", entries: [],
          initials: { default: "QA", asked: true }, pending: null, nextHandId: 1,
          badges: {}, progress: {}, daily: { lastDay: "", streak: 0, best: 0 },
          sessions: { withinLimits: 0, awarded: [] }, session: null,
        }));
      }, extra || {});
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("button[data-act='play'][data-mode='regular']").first().click();
      await page.waitForSelector(".felt");
    }

    async function forceRoll(d1, d2) {
      await page.evaluate(({ a, b }) => {
        const seq = [a, b];
        let i = 0;
        window.__bbRng = () => (seq[i++] - 0.5) / 6;
      }, { a: d1, b: d2 });
      await page.locator("button[data-act='roll']").click();
      await page.waitForFunction(({ a, b }) => {
        const imgs = [...document.querySelectorAll(".lastdice .dieface")].map((img) => img.getAttribute("src") || "");
        return imgs.length >= 2 && imgs[0].includes("face-" + a) && imgs[1].includes("face-" + b);
      }, { a: d1, b: d2 }, { timeout: 8000 });
    }

    async function mascotCount() {
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
        }).length;
      });
    }

    await boot();
    await page.locator("button[aria-label^='Pass Line']").click();
    await forceRoll(2, 4);
    await page.locator("button[aria-label^='Place 8']").click();
    await forceRoll(4, 4);
    await page.locator("button[data-act='press']").click();
    await page.waitForSelector(".coach");
    assert.equal(await mascotCount(), 1, "press coach is one mascot");
    const puck = await page.evaluate(() => {
      const img = document.querySelector(".feltpuck");
      const face = img.closest(".face").getBoundingClientRect();
      const box = img.getBoundingClientRect();
      const cx = (face.left + face.right) / 2;
      const cy = (face.top + face.bottom) / 2;
      return box.left <= cx && cx <= box.right && box.top <= cy && cy <= box.bottom;
    });
    assert.equal(puck, false, "ON puck does not cover the point numeral");

    const before = await page.locator(".hud-roll strong").innerText();
    await page.locator("button.chip-btn[data-cents='100']").click();
    await page.waitForSelector("button.chip-btn[data-cents='100'].on");
    await page.locator("button[data-act='undo']").click();
    await page.waitForSelector("button[data-act='undo']", { state: "detached" });
    assert.ok(await page.locator(".coach").count(), "coach stays open after undo");
    await forceRoll(1, 1);
    const after = await page.locator(".hud-roll strong").innerText();
    assert.notEqual(after, before, "ROLL works with the coach card open");
    assert.ok(await page.locator(".coach").count(), "coach stays open after ROLL");

    await boot({ tutorOn: true });
    await page.locator("button.homebtn").click();
    await page.locator("button[data-act='tour']").click();
    await page.locator(".coach button[data-act='close']").click();
    await page.locator("button[aria-label^='Pass Line']").click();
    await forceRoll(4, 2);
    if (await page.locator(".coach").count()) {
      await page.locator(".coach button[data-act='close']").click();
    }
    await page.locator("button[aria-label^='Place 6']").click();
    await forceRoll(3, 3);
    await page.waitForSelector(".coach");
    await page.waitForSelector(".toast-billie.board-cheer", { state: "attached" });
    assert.equal(await mascotCount(), 1, "coach card plus place win is one mascot");
    const cheerHidden = await page.evaluate(() => getComputedStyle(document.querySelector(".toast-billie.board-cheer")).visibility);
    assert.equal(cheerHidden, "hidden");

    await boot({ tutorOn: false });
    await page.locator("button[aria-label^='Pass Line']").click();
    await forceRoll(3, 4);
    const natural = await page.evaluate(() => {
      const tiles = [...document.querySelectorAll(".rolltile")];
      return tiles.map((el) => el.getAttribute("aria-label"));
    });
    assert.ok(natural.some((label) => label === "three and four, seven"), "come-out 7 is a winner: " + natural.join(" | "));
    await forceRoll(2, 4);
    await page.locator("button.dot[aria-label='Dice']").click();
    await page.waitForSelector(".dome-billy");
    await forceRoll(3, 4);
    await page.waitForSelector(".pso-plate .billie");
    assert.equal(await mascotCount(), 1, "seven-out on the dome is one mascot");
    const domeHidden = await page.evaluate(() => getComputedStyle(document.querySelector(".dome-billy")).visibility);
    assert.equal(domeHidden, "hidden");
    const sevenCopy = await page.locator(".pso-plate").innerText();
    assert.match(sevenCopy, /SEVEN OUT/);
    assert.ok(await page.locator(".pso-plate .rd img").count() >= 2, "seven-out plate shows pips");
    const labels = await page.evaluate(() => [...document.querySelectorAll(".rolltile")].map((el) => el.getAttribute("aria-label")));
    assert.ok(labels.some((label) => /, seven out$/.test(label)), "seven-out tile says seven out");
    assert.ok(labels.some((label) => label === "three and four, seven"), "come-out 7 tile does not say seven out");

    await boot({ tutorOn: false });
    await page.evaluate(() => document.querySelector("button[data-act='bet'][data-kind='hop'][data-pair='1-1']").click());
    await forceRoll(1, 1);
    await page.waitForSelector(".win-billie");
    await page.evaluate(() => window.__bbShowMarquee("spin_the_block"));
    await page.waitForSelector(".badgetoast.marquee .billie");
    assert.equal(await mascotCount(), 1, "big win plus badge marquee is one mascot");
    const viewBox = await page.evaluate(() => {
      const card = document.querySelector(".badgetoast.marquee").getBoundingClientRect();
      const view = document.querySelector(".badgetoast.marquee .view").getBoundingClientRect();
      return { cardRight: card.right, viewRight: view.right };
    });
    assert.ok(viewBox.viewRight <= viewBox.cardRight + 1, "VIEW stays inside the marquee");
    const winPips = await page.locator(".winstamp .dieface").count();
    assert.ok(winPips >= 2, "BIG WIN banner shows pips");

    await boot({ tutorOn: false });
    await page.evaluate(() => {
      const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
      raw.game.phase = "point";
      raw.game.point = 9;
      raw.game.hand = { rolls: 11, points: 0, comeOuts: 1, lastLength: 0 };
      raw.game.bets.pass = 500;
      raw.settings.seenBlaze = { warm: true, hot: true };
      localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("button[data-act='play'][data-mode='regular']").first().click();
    await page.locator("button.dot[aria-label='Dice']").click();
    await page.waitForSelector(".dome-billy");
    await forceRoll(1, 1);
    await page.waitForSelector(".toast-billie.heat", { timeout: 4000 });
    assert.equal(await mascotCount(), 1, "Hot cheer is one mascot");

    await page.evaluate(() => {
      const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
      raw.game.hand.rolls = 23;
      raw.settings.seenBlaze = { warm: true, hot: true, blazing: true };
      localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("button[data-act='play'][data-mode='regular']").first().click();
    await page.locator("button.dot[aria-label='Dice']").click();
    await forceRoll(1, 2);
    await page.waitForSelector(".toast-billie.heat", { timeout: 4000 });
    const heatText = await page.locator(".toast").innerText();
    assert.match(heatText, /Blazing/);
    assert.equal(await mascotCount(), 1, "Blazing cheer is one mascot");

    const history = [];
    for (let i = 0; i < 20; i++) {
      const d1 = (i % 6) + 1;
      const d2 = ((i * 3) % 6) + 1;
      history.push({ d1, d2, total: d1 + d2, hard: d1 === d2, result: d1 + d2 === 7 ? "natural" : "no-decision" });
    }
    await page.evaluate((rows) => {
      const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
      raw.game.history = rows;
      raw.allRolls = rows.map((r) => Object.assign({ at: Date.now(), mode: "regular", net: 0, source: "test", phaseBefore: "come-out" }, r));
      localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
    }, history);

    for (const width of [375, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("button[data-act='play'][data-mode='regular']").first().click();
      await page.locator("button.dot[aria-label='Dice']").click();
      await page.waitForSelector(".dome-screen .rollstrip");
      await wait(200);
      const dome = await page.evaluate(() => {
        const el = document.querySelector(".dome-screen .rollstrip");
        const box = el.getBoundingClientRect();
        const face = el.querySelector(".dieface");
        const shown = face ? getComputedStyle(face).display !== "none" : false;
        return { h: box.height, totals: el.classList.contains("totals"), shown, w: el.clientWidth };
      });
      assert.ok(dome.h >= 30, width + " dome strip height " + dome.h);
      assert.equal(dome.totals, false, width + " dome strip shows pips (" + dome.w + "px)");
      assert.equal(dome.shown, true, width + " dome die faces are displayed");
    }

    for (const width of [375, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.locator("button.tab[data-view='fair'], button[data-act='view'][data-view='fair']").first().click();
      await page.locator("button[data-act='fair-scope'][data-scope='all']").click();
      await wait(150);
      const fair = await page.evaluate(() => {
        const el = document.querySelector(".fairstrip");
        const tiles = [...el.querySelectorAll(".rolltile")];
        const tops = tiles.map((tile) => Math.round(tile.getBoundingClientRect().top));
        const rows = [...new Set(tops)];
        const face = el.querySelector(".dieface");
        return {
          n: tiles.length,
          totals: el.classList.contains("totals"),
          shown: face ? getComputedStyle(face).display !== "none" : false,
          rows: rows.length,
          w: el.clientWidth,
        };
      });
      assert.equal(fair.n, 20, width + " fair strip has 20 tiles");
      assert.equal(fair.totals, false, width + " fair strip is pip mode (" + fair.w + "px)");
      assert.equal(fair.shown, true, width + " fair faces are displayed");
      assert.equal(fair.rows, 2, width + " fair strip is 2 rows");
    }
  } finally {
    await browser.close();
    server.kill();
  }
});
