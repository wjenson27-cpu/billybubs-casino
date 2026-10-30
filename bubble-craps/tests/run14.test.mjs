/**
 * Run 14: the dome result and strip stay on screen, the lockup is the
 * new top-left brand, and Field rings plus tutor warnings follow rev 13d.
 */
import test from "node:test";
import { ensureStaticServer } from "./listen.mjs";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as E from "../js/engine.mjs";

const CHROME = ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/local/bin/google-chrome", "/usr/bin/chromium"].find((p) => existsSync(p));
const root = fileURLToPath(new URL("..", import.meta.url));

test("page stays noindex and run 14 styles are linked", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(html, /css\/run14\.css/);
  assert.equal(existsSync(new URL("../assets/logos/topleft-lockup.svg", import.meta.url)), true);
  assert.equal(existsSync(new URL("../assets/logos/topleft-mark-ring-32.svg", import.meta.url)), true);
});

test("field copy follows Standard and Premium pays", () => {
  const std = E.fieldPresentation(2, 2);
  assert.equal(std.felt, "2 AND 12 PAY DOUBLE");
  assert.equal(std.aria, "Field: 2, 3, 4, 9, 10, 11, 12; 2 and 12 pay 2 to 1");
  assert.equal(std.ring2, "single");
  assert.equal(std.ring12, "single");
  const twelve = E.fieldPresentation(2, 3);
  assert.equal(twelve.felt, "2 PAYS DOUBLE · 12 PAYS TRIPLE");
  assert.equal(twelve.aria, "Field: 2, 3, 4, 9, 10, 11, 12; 2 pays 2 to 1, 12 pays 3 to 1");
  assert.equal(twelve.ring12, "triple");
  assert.equal(E.fieldPresentation(3, 2).felt, "2 PAYS TRIPLE · 12 PAYS DOUBLE");
  assert.equal(E.fieldPresentation(3, 3).felt, "2 AND 12 PAY TRIPLE");
  assert.match(E.fieldPresentation(3, 3).aria, /2 and 12 pay 3 to 1/);
});

test("tutor long shot starts under 1 in 6 and high edge at 9%", () => {
  const field = E.tutorEdgeNote({ kind: "field" }, "regular", false);
  assert.match(field, /wins on 16 of 36/);
  assert.match(field, /5\.56% edge/);
  assert.doesNotMatch(field, /Long shot|High house edge/);
  assert.equal(E.tutorEdgeNote({ kind: "place", number: 4 }, "regular", true), "");
  assert.equal(E.tutorEdgeNote({ kind: "place", number: 10 }, "regular", false), "");
  assert.equal(E.isLongShot({ kind: "place", number: 4 }), false);
  assert.equal(E.tutorEdgeNote({ kind: "any7" }, "regular", false), "High house edge.");
  assert.equal(E.tutorEdgeNote({ kind: "horn" }, "regular", false), "High house edge.");
  assert.match(E.tutorEdgeNote({ kind: "hardway", number: 4 }, "regular", false), /Long shot with a high house edge/);
  assert.match(E.tutorEdgeNote({ kind: "anyCraps" }, "regular", true), /11\.11% edge/);
  assert.match(E.tutorEdgeNote({ kind: "anyCraps" }, "regular", true), /Wins 4 of 36/);
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function diceGame() {
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

test("dome readouts, lockup, Field rings, and FAIR fit", async (t) => {
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
    async function boot(w, h) {
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
      }, diceGame());
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("button[data-act='play'][data-mode='regular']").first().click();
      await page.waitForSelector(".spot.field");
    }
    async function readDome() {
      return page.evaluate(() => {
        function fullyIn(el) {
          if (!el) return { ok: false, why: "missing" };
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden") return { ok: false, why: "hidden" };
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) return { ok: false, why: "empty" };
          if (r.top < -1 || r.left < -1 || r.bottom > innerHeight + 1 || r.right > innerWidth + 1) {
            return { ok: false, why: "viewport " + Math.round(r.top) + "-" + Math.round(r.bottom) + " of " + innerHeight };
          }
          let p = el.parentElement;
          while (p && p !== document.documentElement) {
            const pcs = getComputedStyle(p);
            const clip = /(auto|scroll|hidden)/.test(pcs.overflowY + pcs.overflow);
            if (clip) {
              const pr = p.getBoundingClientRect();
              if (r.top < pr.top - 1 || r.bottom > pr.bottom + 1) {
                return { ok: false, why: "clipped " + Math.round(r.bottom) + " past " + Math.round(pr.bottom) };
              }
            }
            p = p.parentElement;
          }
          return { ok: true, top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) };
        }
        const host = document.getElementById("dice-row");
        const boxes = [...host.querySelectorAll(".cube3d")].map((el) => el.getBoundingClientRect());
        return {
          vis: getComputedStyle(host).visibility,
          hidden: host.hidden,
          dice: boxes.map((b) => ({ w: b.width, h: b.height, top: b.top, bottom: b.bottom, left: b.left, right: b.right })),
          result: fullyIn(document.querySelector(".dome-screen .result-line")),
          strip: fullyIn(document.querySelector(".dome-screen .rollstrip")),
          vh: innerHeight,
          vw: innerWidth,
        };
      });
    }

    const sizes = [[320, 568], [360, 640], [375, 667], [390, 844], [430, 932], [844, 390], [932, 430]];
    for (const [w, h] of sizes) {
      await boot(w, h);
      const tag = w + "x" + h;
      if (w === 375 || w === 390 || w === 430 || (w === 844 && h === 390)) {
        const field = await page.evaluate(() => {
          const btn = document.querySelector(".spot.field");
          const rings = [...btn.querySelectorAll(".fn.dbl")].map((n) => {
            const cs = getComputedStyle(n);
            const rect = n.getBoundingClientRect();
            const font = parseFloat(cs.fontSize);
            const scale = n.offsetHeight ? rect.height / n.offsetHeight : 1;
            return { t: n.textContent, visual: font * scale, h: rect.height };
          });
          const hud = document.querySelector(".hud").getBoundingClientRect();
          const lock = document.querySelector(".lockup");
          const lr = lock.getBoundingClientRect();
          const homeEl = document.querySelector(".homebtn");
          const homeImg = [...homeEl.querySelectorAll("img")].find((el) => getComputedStyle(el).display !== "none");
          const hb = homeEl.getBoundingClientRect();
          const seg = document.querySelector(".modeseg").getBoundingClientRect();
          return {
            pay: btn.querySelector("small").textContent,
            aria: btn.getAttribute("aria-label"),
            rings,
            lock: {
              src: lock.getAttribute("src"),
              display: getComputedStyle(lock).display,
              h: lr.height,
              left: lr.left,
              right: lr.right,
            },
            home: homeImg.getAttribute("src"),
            homeLeft: hb.left,
            hudLeft: hud.left,
            hudRight: hud.right,
            segRight: seg.right,
            vw: innerWidth,
          };
        });
        assert.equal(field.pay, "2 AND 12 PAY DOUBLE", tag);
        assert.equal(field.aria, "Field: 2, 3, 4, 9, 10, 11, 12; 2 and 12 pay 2 to 1. Long-press for lingo.", tag);
        assert.deepEqual(field.rings.map((n) => n.t), ["2", "12"], tag);
        field.rings.forEach((n) => {
          assert.ok(n.visual >= 8, tag + " numeral " + n.t + " " + n.visual.toFixed(1) + "px");
        });
        if (w === 844) {
          assert.equal(field.lock.display, "none", tag);
          assert.match(field.home, /topleft-mark-ring-32\.svg$/, tag);
        } else {
          assert.equal(field.lock.display, "block", tag);
          assert.match(field.lock.src, /topleft-lockup\.svg$/, tag);
          assert.ok(field.homeLeft <= field.hudLeft + 24, tag + " home " + field.homeLeft);
          assert.ok(field.lock.left < field.vw * 0.35, tag + " lockup left " + field.lock.left);
          assert.ok(field.segRight <= field.hudRight + 1, tag + " switch " + field.segRight + " hud " + field.hudRight);
          assert.match(field.home, /hud-billy-A-36@1x\.png$/, tag);
        }
      }
      const diceDot = page.locator("button.dot[aria-label='Dice']");
      if (w > h && h < 400) await diceDot.evaluate((el) => el.click());
      else await diceDot.click();
      await page.waitForSelector("#dice-row .cube");
      await page.waitForTimeout(250);
      const dome = await readDome();
      assert.equal(dome.hidden, false, tag);
      assert.equal(dome.vis, "visible", tag);
      assert.equal(dome.dice.length, 2, tag);
      dome.dice.forEach((b, i) => {
        assert.ok(b.w >= 39.5 && b.h >= 39.5, tag + " die " + i + " " + b.w.toFixed(1));
        assert.ok(b.top >= -1 && b.bottom <= dome.vh + 1 && b.left >= -1 && b.right <= dome.vw + 1, tag + " die on screen");
      });
      assert.equal(dome.result.ok, true, tag + " result " + dome.result.why);
      assert.equal(dome.strip.ok, true, tag + " strip " + dome.strip.why);
    }

    await boot(360, 640);
    const fair = await page.evaluate(() => {
      const r = document.querySelector("#hud .fairchip").getBoundingClientRect();
      const row = document.querySelector("#hud .hud-row2").getBoundingClientRect();
      const border = parseFloat(getComputedStyle(document.querySelector("#hud .hud-row2")).borderRightWidth);
      return { left: r.left, right: r.right, vw: innerWidth, clip: row.right - border };
    });
    assert.ok(fair.left >= -0.5 && fair.right <= fair.clip + 0.5 && fair.right <= fair.vw - 1, "360 FAIR " + fair.left + "-" + fair.right + " clip " + fair.clip + " of " + fair.vw);
  } finally {
    await browser.close();
    server.kill();
  }
});

async function loadPlaywright() {
  try {
    return await import("playwright-core");
  } catch {
    return null;
  }
}
