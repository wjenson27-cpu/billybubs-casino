/**
 * Run 13: 3D dice stay visible on short screens, the Field lists every
 * paying number, and the HUD avatar is a square Dealer Billy crop.
 */
import test from "node:test";
import { ensureStaticServer } from "./listen.mjs";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as E from "../js/engine.mjs";
import * as B from "../js/badges.mjs";

const CHROME = ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/local/bin/google-chrome", "/usr/bin/chromium"].find((p) => existsSync(p));
const root = fileURLToPath(new URL("..", import.meta.url));

test("page stays noindex and the marquee odds have no stray period", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(html, /css\/run13\.css/);
  for (const id of ["ats_low_rolls", "ats_high_rolls", "ats_roll_em_all"]) {
    const odds = B.badgeById(id).odds;
    assert.doesNotMatch(odds, /Crapless\./, id);
    assert.match(odds, /Crapless$/, id);
  }
});

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

function diceGame(mode) {
  const g = E.createGame();
  g.mode = mode === "crapless" ? "crapless" : "regular";
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

test("short screens keep the dice, the Field, and the avatar", async (t) => {
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

    async function boot(w, h, game) {
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

    async function readField() {
      return page.evaluate(() => {
        const btn = document.querySelector(".spot.field");
        const br = btn.getBoundingClientRect();
        const nums = [...btn.querySelectorAll(".fieldnums .fn")].map((n) => {
          const r = n.getBoundingClientRect();
          return {
            t: n.textContent,
            dbl: n.classList.contains("dbl"),
            w: r.width,
            h: r.height,
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
          };
        });
        return {
          label: btn.getAttribute("aria-label"),
          pay: btn.querySelector("small").textContent,
          btn: { left: br.left, right: br.right, top: br.top, bottom: br.bottom, w: br.width },
          nums,
          vw: innerWidth,
          vh: innerHeight,
        };
      });
    }

    function assertField(field, label) {
      assert.deepEqual(field.nums.map((n) => n.t), ["2", "3", "4", "9", "10", "11", "12"], label);
      assert.equal(field.nums.filter((n) => n.dbl).map((n) => n.t).join(","), "2,12", label + " doubles");
      assert.match(field.pay, /PAY DOUBLE/, label);
      assert.match(field.label, /^Field/, label);
      field.nums.forEach((n) => {
        assert.ok(n.h >= 10 && n.w >= 8, label + " " + n.t + " " + n.w.toFixed(1) + "x" + n.h.toFixed(1));
        assert.ok(n.left >= field.btn.left - 1 && n.right <= field.btn.right + 1, label + " " + n.t + " stays in the Field");
        assert.ok(n.top >= -1 && n.bottom <= field.vh + 1, label + " " + n.t + " is on screen");
      });
    }

    async function readDice() {
      return page.evaluate(() => {
        const det3 = (m) => {
          const ax = m.m11, ay = m.m12, az = m.m13;
          const bx = m.m21, by = m.m22, bz = m.m23;
          const cx = m.m31, cy = m.m32, cz = m.m33;
          return ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx);
        };
        const read = (cube) => {
          const cubeM = new DOMMatrix(getComputedStyle(cube).transform);
          const facing = [];
          cube.querySelectorAll(".f").forEach((face) => {
            const hit = String(face.className).match(/f(\d)/);
            if (!hit) return;
            const world = cubeM.multiply(new DOMMatrix(getComputedStyle(face).transform));
            if (!(world.m32 < -0.5 && world.m33 > 0.5)) return;
            facing.push(Number(hit[1]));
          });
          return { facing, det: det3(cubeM) };
        };
        const host = document.getElementById("dice-row");
        const bowl = document.querySelector("#pager .machine").getBoundingClientRect();
        const boxes = [...host.querySelectorAll(".cube3d")].map((el) => {
          const r = el.getBoundingClientRect();
          return { w: r.width, h: r.height, left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        });
        const cubes = [...host.querySelectorAll(".cube")];
        return {
          hidden: host.hidden,
          vis: getComputedStyle(host).visibility,
          s: parseFloat(host.style.getPropertyValue("--s")),
          boxes,
          facing: cubes.map(read),
          faces: cubes.map((c) => Number(c.dataset.face)),
          bowl: { left: bowl.left, right: bowl.right, top: bowl.top, bottom: bowl.bottom, h: bowl.height },
          vh: innerHeight,
          vw: innerWidth,
        };
      });
    }

    const sizes = [[320, 568], [360, 640], [375, 667], [390, 844], [430, 932], [844, 390]];
    for (const [w, h] of sizes) {
      await boot(w, h, diceGame("regular"));
      const tag = w + "x" + h;
      if (w === 375 || w === 390 || w === 430 || (w === 844 && h === 390)) {
        const field = await readField();
        assertField(field, tag);
      }
      if (w === 390 || (w === 844 && h === 390)) {
        const avatar = await page.evaluate(() => {
          const btn = document.querySelector(".homebtn");
          const img = [...btn.querySelectorAll("img")].find((el) => getComputedStyle(el).display !== "none");
          const row = document.querySelector(".hud-row1").getBoundingClientRect();
          const br = btn.getBoundingClientRect();
          const ir = img.getBoundingClientRect();
          return {
            src: img.getAttribute("src"),
            bw: br.width,
            bh: br.height,
            iw: ir.width,
            ih: ir.height,
            fit: getComputedStyle(img).objectFit,
            shadow: getComputedStyle(btn).boxShadow,
            rowH: row.height,
            rowTop: row.top,
            rowBottom: row.bottom,
            top: br.top,
            bottom: br.bottom,
          };
        });
        if (w === 844) assert.match(avatar.src, /topleft-mark-ring-32\.svg$/, tag);
        else assert.match(avatar.src, /hud-billy-A-36@1x\.png$/, tag);
        assert.ok(Math.abs(avatar.bw - avatar.bh) < 0.6, tag + " avatar box " + avatar.bw + "x" + avatar.bh);
        assert.ok(Math.abs(avatar.iw - avatar.ih) < 0.6, tag + " avatar image " + avatar.iw + "x" + avatar.ih);
        assert.ok(Math.abs(avatar.iw - avatar.bw) < 1 && Math.abs(avatar.ih - avatar.bh) < 1, tag + " image fills the circle");
        assert.equal(avatar.fit, "contain", tag);
        assert.equal(avatar.shadow, "none", tag);
        assert.ok(avatar.bh <= avatar.rowH + 0.6, tag + " avatar " + avatar.bh + " row " + avatar.rowH);
        assert.ok(avatar.bh >= avatar.rowH - 8, tag + " avatar sits with the HUD");
        assert.ok(avatar.top >= avatar.rowTop - 1 && avatar.bottom <= avatar.rowBottom + 1, tag + " avatar stays in the row");
      }
      const diceDot = page.locator("button.dot[aria-label='Dice']");
      if (w > h && h < 400) await diceDot.evaluate((el) => el.click());
      else await diceDot.click();
      await page.waitForSelector("#dice-row .cube");
      await page.waitForTimeout(200);
      const dice = await readDice();
      assert.equal(dice.hidden, false, tag + " dice host");
      assert.equal(dice.vis, "visible", tag);
      assert.ok(dice.s >= 40, tag + " --s " + dice.s);
      assert.equal(dice.boxes.length, 2, tag);
      dice.boxes.forEach((b, i) => {
        assert.ok(b.w >= 39.5 && b.h >= 39.5, tag + " die " + i + " " + b.w.toFixed(1));
        assert.ok(b.left >= dice.bowl.left - 4 && b.right <= dice.bowl.right + 4, tag + " die " + i + " in the glass");
        assert.ok(b.top >= -1 && b.bottom <= dice.vh + 1 && b.left >= -1 && b.right <= dice.vw + 1, tag + " die " + i + " on screen");
      });
      assert.ok(dice.bowl.h >= 160, tag + " glass " + dice.bowl.h);
      dice.facing.forEach((face, i) => {
        assert.equal(face.facing.length, 1, tag + " one top face");
        assert.equal(face.facing[0], dice.faces[i], tag + " top face " + face.facing[0]);
        assert.ok(face.det > 0.9, tag + " rotation");
      });
      assert.deepEqual(dice.faces, [5, 2], tag);
    }

    await boot(390, 844, E.createGame());
    await page.locator("button[data-act='mode'][data-mode='crapless']").click();
    await page.waitForSelector(".nums.crap");
    assertField(await readField(), "crapless 390");

    await boot(320, 568, diceGame("regular"));
    const reach = await page.evaluate(() => {
      const line = document.querySelector("button[aria-label^='Pass Line']");
      const stage = line.closest(".page");
      line.scrollIntoView({ block: "nearest" });
      const lr = line.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      const roll = document.querySelector(".roll-btn").getBoundingClientRect();
      const legal = document.querySelector(".legal").getBoundingClientRect();
      const app = document.querySelector(".app.play").getBoundingClientRect();
      return {
        passTop: lr.top, passBottom: lr.bottom, stageTop: sr.top, stageBottom: sr.bottom,
        rollTop: roll.top, rollBottom: roll.bottom, rollLeft: roll.left, rollRight: roll.right, rollW: roll.width,
        legalBottom: legal.bottom, appBottom: app.bottom, vh: innerHeight, vw: innerWidth,
      };
    });
    assert.ok(reach.passTop >= reach.stageTop - 2 && reach.passBottom <= reach.stageBottom + 2, "320 Pass Line " + reach.passTop + "-" + reach.passBottom);
    assert.ok(reach.rollTop >= -1 && reach.rollBottom <= reach.vh + 1, "320 ROLL vertical");
    assert.ok(reach.rollLeft >= -1 && reach.rollRight <= reach.vw + 1 && reach.rollW >= 40, "320 ROLL " + reach.rollW);
    assert.ok(Math.abs(reach.appBottom - reach.vh) <= 2, "320 app fills the screen " + reach.appBottom);
    assert.ok(reach.vh - reach.legalBottom <= 16, "320 band under the footer " + (reach.vh - reach.legalBottom));

    await boot(390, 844, atsGame());
    await page.evaluate(() => {
      window.__bbRng = () => {
        const seq = [1, 5];
        window.__bbI = window.__bbI || 0;
        return (seq[window.__bbI++] - 0.5) / 6;
      };
    });
    await page.locator("button[data-act='roll']").click();
    await page.waitForSelector(".win-billie", { timeout: 8000 });
    const win = await page.evaluate(() => {
      const billie = document.querySelector(".win-billie");
      const chip = document.querySelector(".winstamp em");
      const cr = chip.getBoundingClientRect();
      return {
        billie: getComputedStyle(billie).visibility,
        text: chip.textContent,
        left: cr.left,
        right: cr.right,
        vw: innerWidth,
      };
    });
    assert.equal(win.billie, "visible");
    assert.match(win.text, /Low Rolls/);
    assert.ok(win.left >= 12 && win.right <= win.vw - 12, "bonus chip " + win.left + "-" + win.right + " of " + win.vw);
    await page.evaluate(() => window.__bbShowMarquee("ats_low_rolls"));
    await page.waitForSelector(".badgetoast.marquee");
    const shared = await page.evaluate(() => {
      const billie = document.querySelector(".win-billie");
      const toast = document.querySelector(".badgetoast.marquee .billie");
      return {
        win: getComputedStyle(billie).visibility,
        toast: getComputedStyle(toast).visibility,
      };
    });
    assert.equal(shared.win, "hidden", "Billie steps aside for the marquee");
    assert.equal(shared.toast, "visible");
  } finally {
    await browser.close();
    server.kill();
  }
});
