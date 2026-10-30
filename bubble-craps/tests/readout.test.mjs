/**
 * Mini-die pip fit, hop icons, marquee on screen, and pip readouts
 * that match the engine dice. Skips only when Playwright or Chrome is missing.
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
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

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

test("mini dice, hop icons, marquee, and pip readouts", async (t) => {
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
    await page.goto("http://127.0.0.1:" + port + "/index.html", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("button[data-act='play'][data-mode='regular']").first().click();
    await page.waitForSelector(".felt");
    await page.evaluate(() => {
      const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
      raw.settings.tutorOn = false;
      raw.settings.sound = false;
      raw.settings.autoRoll = false;
      raw.settings.reduced = true;
      raw.settings.badgeToasts = false;
      localStorage.setItem("bb-bubble-craps-v1", JSON.stringify(raw));
      localStorage.setItem("bb-bubble-badges-v1", JSON.stringify({
        v: 1, name: "QA", highlightId: "", entries: [],
        initials: { default: "QA", asked: true }, pending: null, nextHandId: 1,
        badges: {}, progress: {}, daily: { lastDay: "", streak: 0, best: 0 },
        sessions: { withinLimits: 0, awarded: [] }, session: null,
      }));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("button[data-act='play'][data-mode='regular']").first().click();
    await page.waitForSelector(".hop");

    const pips = await page.evaluate((expect) => {
      const box = document.createElement("div");
      box.id = "pipfix";
      box.innerHTML = "<div class='hopdice'></div><div class='lastdice'></div>";
      document.body.appendChild(box);
      const pipHTML = (face) => {
        const on = expect[face];
        let html = "";
        for (let i = 0; i < 9; i++) html += "<i class='pip" + (on.indexOf(i) >= 0 ? " on" : "") + "'></i>";
        return "<div class='mini-die' data-face='" + face + "'>" + html + "</div>";
      };
      ["hopdice", "lastdice"].forEach((cls) => {
        const host = box.querySelector("." + cls);
        for (let n = 1; n <= 6; n++) host.insertAdjacentHTML("beforeend", pipHTML(n));
      });
      const spills = [];
      box.querySelectorAll(".mini-die").forEach((die) => {
        const dieBox = die.getBoundingClientRect();
        die.querySelectorAll(".pip.on").forEach((pip) => {
          const r = pip.getBoundingClientRect();
          const inside = r.width > 0 && r.height > 0
            && r.left >= dieBox.left - 0.6
            && r.top >= dieBox.top - 0.6
            && r.right <= dieBox.right + 0.6
            && r.bottom <= dieBox.bottom + 0.6;
          if (!inside) spills.push({ face: die.dataset.face, w: dieBox.width, pip: { l: r.left, t: r.top, r: r.right, b: r.bottom } });
        });
      });
      const hops = [...document.querySelectorAll(".hop")].map((btn) => {
        const pair = (btn.dataset.pair || "").split("-").map(Number);
        const dice = [...btn.querySelectorAll(".mini-die")].map((die) => (
          [...die.querySelectorAll(".pip")].map((pip, i) => (pip.classList.contains("on") ? i : -1)).filter((i) => i >= 0)
        ));
        return { pair, label: btn.querySelector("b").textContent.trim(), dice };
      });
      box.remove();
      return { spills, hops };
    }, PIPS);
    assert.equal(pips.spills.length, 0, "pip outside die: " + JSON.stringify(pips.spills.slice(0, 3)));
    assert.equal(pips.hops.length, 21);
    pips.hops.forEach((hop) => {
      assert.deepEqual(hop.dice[0], PIPS[hop.pair[0]], hop.label + " die 1");
      assert.deepEqual(hop.dice[1], PIPS[hop.pair[1]], hop.label + " die 2");
      const hard = hop.pair[0] === hop.pair[1];
      assert.equal(hop.label, (hard ? "HARD" : "EASY") + " " + (hop.pair[0] + hop.pair[1]));
    });

    const sizes = [
      { w: 375, h: 812, name: "375" },
      { w: 390, h: 844, name: "390" },
      { w: 430, h: 932, name: "430" },
      { w: 844, h: 390, name: "landscape" },
    ];
    for (const size of sizes) {
      await page.setViewportSize({ width: size.w, height: size.h });
      await page.evaluate(() => window.dispatchEvent(new Event("resize")));
      await wait(80);
      const box = await page.evaluate(() => {
        let host = document.getElementById("badge-toast");
        if (!host) {
          host = document.createElement("div");
          host.id = "badge-toast";
          document.body.appendChild(host);
        }
        host.innerHTML = "<div class='badgetoast marquee legendary' data-id='spin_the_block'>" +
          "<i class='burst' aria-hidden='true'></i>" +
          "<div><em class='tierpill'>legendary</em><b>Spin the Block</b>" +
          "<span class='facts'>About 1 in 523 hands · 31 for 1, paid in practice chips · House edge 18.30%</span>" +
          "<p class='billieline'>Spin it to win it!</p></div>" +
          "<button type='button'>VIEW</button></div>";
        const card = host.querySelector(".badgetoast");
        const r = card.getBoundingClientRect();
        const pos = getComputedStyle(card).position;
        return {
          pos,
          top: r.top,
          left: r.left,
          right: r.right,
          bottom: r.bottom,
          width: r.width,
          height: r.height,
          vw: window.innerWidth,
          vh: window.innerHeight,
          facts: card.querySelector(".facts").textContent,
        };
      });
      assert.equal(box.pos, "fixed", size.name);
      assert.ok(box.width > 40 && box.height > 20, size.name + " has size");
      assert.ok(box.top >= -1 && box.left >= -1, size.name + " origin " + box.top + "," + box.left);
      assert.ok(box.right <= box.vw + 1 && box.bottom <= box.vh + 1, size.name + " inside viewport");
      assert.match(box.facts, /House edge/);
      assert.match(box.facts, /About 1 in 523 hands/);
    }
    await page.evaluate(() => { const host = document.getElementById("badge-toast"); if (host) host.innerHTML = ""; });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      const host = document.getElementById("badge-toast");
      if (host) host.innerHTML = "";
      const overlay = document.getElementById("overlay");
      if (overlay) overlay.innerHTML = "";
      document.body.classList.remove("has-coach");
      const board = document.querySelector("button.dot[aria-label='Board']");
      if (board) board.click();
    });
    for (let d1 = 1; d1 <= 6; d1++) {
      for (let d2 = 1; d2 <= 6; d2++) {
        await page.evaluate(({ a, b }) => {
          const seq = [a, b];
          let i = 0;
          window.__bbRng = () => (seq[i++] - 0.5) / 6;
        }, { a: d1, b: d2 });
        await page.evaluate(() => {
          const overlay = document.getElementById("overlay");
          if (overlay) overlay.innerHTML = "";
          document.querySelector("button[data-act='roll']").click();
        });
        await page.waitForFunction(({ a, b }) => {
          const imgs = [...document.querySelectorAll(".lastdice .dieface")].map((img) => img.getAttribute("src") || "");
          return imgs.length >= 2 && imgs[0].includes("face-" + a) && imgs[1].includes("face-" + b);
        }, { a: d1, b: d2 }, { timeout: 5000 });
        const agree = await page.evaluate(({ a, b }) => {
          const raw = JSON.parse(localStorage.getItem("bb-bubble-craps-v1"));
          const last = raw.allRolls[raw.allRolls.length - 1];
          const hud = [...document.querySelectorAll(".lastdice .dieface")].map((img) => img.getAttribute("src"));
          const tile = document.querySelector(".dome-screen .rolltile.latest");
          const tileFaces = tile ? [...tile.querySelectorAll(".dieface")].map((img) => img.getAttribute("src")) : [];
          return { last, hud, tileFaces, label: document.querySelector(".lastdice .readout").getAttribute("aria-label") };
        }, { a: d1, b: d2 });
        assert.equal(agree.last.d1, d1);
        assert.equal(agree.last.d2, d2);
        assert.equal(typeof agree.last.d1, "number");
        assert.ok(agree.hud[0].includes("face-" + d1) && agree.hud[1].includes("face-" + d2));
        const cap = E.rollCaption(d1, d2);
        assert.equal(agree.label, cap.aria);
        assert.equal(agree.tileFaces.length, 2, "dome strip for " + d1 + "+" + d2);
        assert.ok(agree.tileFaces[0].includes("face-" + d1));
        assert.ok(agree.tileFaces[1].includes("face-" + d2));
      }
    }
  } finally {
    await browser.close();
    server.kill();
  }
});
