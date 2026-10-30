/**
 * Table shooter cubes show the rolled faces. YOUR SET stays on the set.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ensureStaticServer } from "./listen.mjs";

const CHROME = ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/local/bin/google-chrome", "/usr/bin/chromium"].find((p) => existsSync(p));
const root = fileURLToPath(new URL("..", import.meta.url));

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

test("table cubes match all 36 rolls and the set readout stays put", async (t) => {
  if (!CHROME) {
    t.skip("system Chrome is not available");
    return;
  }
  let pw;
  try { pw = await import("playwright-core"); } catch { t.skip("playwright-core is not available"); return; }
  const server = await ensureStaticServer(root);
  const browser = await pw.chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-gpu"] });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    await page.goto("http://127.0.0.1:" + server.port + "/table/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__tcReady);
    await page.evaluate(() => { window.__tcRollSpeed = "instant"; });
    await page.locator("[data-act='go-shooter']").click();
    await page.waitForSelector(".setview .pair .tc-cube");
    for (let a = 1; a <= 6; a++) {
      for (let b = 1; b <= 6; b++) {
        await page.evaluate((faces) => {
          const seq = faces.slice();
          window.__tcRng = () => (seq.shift() - 0.5) / 6;
        }, [a, b]);
        await page.locator("[data-act='throw']").click();
        await page.waitForFunction((faces) => {
          const cubes = [...document.querySelectorAll(".setview .pair .tc-cube")];
          return cubes.length === 2 && cubes[0].dataset.top === String(faces[0]) && cubes[1].dataset.top === String(faces[1]);
        }, [a, b]);
      }
    }
    const readout = await page.evaluate(() => {
      const faces = [...document.querySelectorAll(".tc-shooter .readout .pipro img")].map((img) => (img.getAttribute("src").match(/face-(\d)/) || [])[1]);
      return { text: document.querySelector(".tc-shooter .readout").innerText, faces };
    });
    assert.match(readout.text, /YOUR SET/);
    assert.deepEqual(readout.faces, ["3", "3"], readout.text);
    await page.evaluate(() => { delete window.__tcRng; });
    await page.locator("[data-act='throw']").click();
    const live = await page.evaluate(() => {
      const cubes = [...document.querySelectorAll(".setview .pair .tc-cube")].map((c) => c.dataset.top);
      const pips = [...document.querySelectorAll(".tc-shooter .result .pipro img")].map((img) => (img.getAttribute("src").match(/face-(\d)/) || [])[1]);
      return { cubes, pips };
    });
    assert.deepEqual(live.cubes, live.pips);
    assert.equal(errors.length, 0, errors.join("\n"));
  } finally {
    await browser.close();
    server.kill();
  }
});

test("ROLL and SHOOT white text clears 4.5:1", async (t) => {
  if (!CHROME) { t.skip("system Chrome is not available"); return; }
  let pw;
  try { pw = await import("playwright-core"); } catch { t.skip("playwright-core is not available"); return; }
  const server = await ensureStaticServer(root);
  const browser = await pw.chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-gpu"] });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto("http://127.0.0.1:" + server.port + "/index.html", { waitUntil: "domcontentloaded" });
    await page.locator("button[data-act='play'][data-mode='regular']").first().click();
    await page.waitForSelector(".roll-btn");
    const roll = await page.evaluate(() => {
      const btn = document.querySelector(".roll-btn");
      const label = btn.querySelector("b") || btn;
      const parse = (s) => {
        const m = String(s).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
      };
      const img = getComputedStyle(btn).backgroundImage;
      const hex = (img.match(/#([0-9a-f]{6})/i) || [])[1];
      const bg = hex ? [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)] : parse(getComputedStyle(btn).backgroundColor);
      return { fg: parse(getComputedStyle(label).color), bg, text: label.textContent };
    });
    assert.ok(roll.fg && roll.bg, "roll colors");
    assert.ok(contrastRatio(roll.fg, roll.bg) >= 4.5, "ROLL " + contrastRatio(roll.fg, roll.bg).toFixed(2));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://127.0.0.1:" + server.port + "/table/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".tc-shoot b");
    const shoot = await page.evaluate(() => {
      const btn = document.querySelector(".tc-shoot");
      const label = btn.querySelector("b");
      const small = btn.querySelector("small");
      const parse = (s) => {
        const m = String(s).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
      };
      const img = getComputedStyle(btn).backgroundImage;
      const hex = (img.match(/#([0-9a-f]{6})/i) || [])[1];
      const bg = hex ? [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)] : parse(getComputedStyle(btn).backgroundColor);
      return {
        fg: parse(getComputedStyle(label).color),
        small: parse(getComputedStyle(small).color),
        bg,
      };
    });
    assert.ok(contrastRatio(shoot.fg, shoot.bg) >= 4.5, "SHOOT " + contrastRatio(shoot.fg, shoot.bg).toFixed(2));
    assert.ok(contrastRatio(shoot.small, shoot.bg) >= 4.5, "YOUR THROW " + contrastRatio(shoot.small, shoot.bg).toFixed(2));
  } finally {
    await browser.close();
    server.kill();
  }
});

test("stickman hook sweeps 3 unpicked dice, 4-way drag rotates dice, and throw rolls over felt", async (t) => {
  if (!CHROME) { t.skip("system Chrome is not available"); return; }
  let pw;
  try { pw = await import("playwright-core"); } catch { t.skip("playwright-core is not available"); return; }
  const server = await ensureStaticServer(root);
  const browser = await pw.chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-gpu"] });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto("http://127.0.0.1:" + server.port + "/table/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__tcReady);
    await page.locator("#felt [data-kind='pass']").click();
    await page.locator("[data-act='go-shooter']").click();
    await page.waitForSelector(".bowl .pick");

    // 1. Pick 2 of 5 dice -> stickman hook sweeps the other 3 away
    await page.locator(".bowl .pick[data-i='1']").click();
    await page.locator(".bowl .pick[data-i='3']").click();
    const bowl = await page.evaluate(() => ({
      swept: document.querySelector(".bowl").dataset.swept,
      picked: document.querySelector(".bowl").dataset.picked,
      kept: document.querySelectorAll(".bowl .pick.kept").length,
      sweptDice: document.querySelectorAll(".bowl .pick.swept").length,
      hook: !!document.querySelector(".bowl .tc-stick-hook.active"),
      callBtn: !!document.querySelector(".bowl [data-act='call-dice']"),
    }));
    assert.equal(bowl.swept, "1");
    assert.equal(bowl.picked, "1,3");
    assert.equal(bowl.kept, 2);
    assert.equal(bowl.sweptDice, 3);
    assert.equal(bowl.hook, true);
    assert.equal(bowl.callBtn, true);

    // Call 5 dice restores the 5 dice pool, then pick 0 and 2
    await page.locator("[data-act='call-dice']").click();
    assert.equal(await page.evaluate(() => document.querySelector(".bowl").dataset.swept), "0");
    await page.locator(".bowl .pick[data-i='0']").click();
    await page.locator(".bowl .pick[data-i='2']").click();
    assert.equal(await page.evaluate(() => document.querySelector(".bowl").dataset.swept), "1");

    // 2. Drag Die 0 in all 4 directions: left, right, front (up), back (down)
    const box = await page.locator(".setview .die-slot[data-die='0'] .tc-cube").boundingBox();
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const readDie0 = () => page.evaluate(() => {
      const c = document.querySelectorAll(".setview .pair .tc-cube")[0];
      return {
        top: Number(c.dataset.top),
        front: Number(c.dataset.front),
        right: Number(c.dataset.right),
        left: Number(c.dataset.left),
        back: Number(c.dataset.back),
        bottom: Number(c.dataset.bottom),
        dir: c.dataset.dir || "",
      };
    });
    const d0 = await readDie0();
    assert.equal(d0.top + d0.bottom, 7);
    assert.equal(d0.front + d0.back, 7);
    assert.equal(d0.right + d0.left, 7);

    // Drag Left
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 34, cy, { steps: 3 });
    await page.mouse.up();
    const dLeft = await readDie0();
    assert.equal(dLeft.dir, "left");
    assert.equal(dLeft.front, d0.right);

    // Drag Right (returns to d0)
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 34, cy, { steps: 3 });
    await page.mouse.up();
    const dRight = await readDie0();
    assert.equal(dRight.dir, "right");
    assert.equal(dRight.front, d0.front);

    // Drag Front (Up) — must rotate forward and NOT trigger a throw
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx, cy - 34, { steps: 3 });
    await page.mouse.up();
    const dFront = await readDie0();
    assert.equal(dFront.dir, "front");
    assert.equal(dFront.top, d0.front);
    assert.equal(dFront.front, d0.bottom);

    // Drag Back (Down) — returns to d0
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx, cy + 34, { steps: 3 });
    await page.mouse.up();
    const dBack = await readDie0();
    assert.equal(dBack.dir, "back");
    assert.equal(dBack.top, d0.top);
    assert.equal(dBack.front, d0.front);

    // 3. Throw rolls the 2 dice over the #felt table layout and lands with engine faces
    await page.evaluate(() => {
      const seq = [4, 2];
      window.__tcRng = () => (seq.shift() - 0.5) / 6;
      window.__tcRollSpeed = "fast";
    });
    await page.locator("[data-act='throw']").click();
    await page.waitForFunction(() => window.__ttLast && window.__ttLast.kind === "felt");
    await page.waitForFunction(() => {
      const fd = document.querySelector("#felt .tc-felt-dice");
      return fd && fd.dataset.d1 === "4" && fd.dataset.d2 === "2";
    });
    const feltRoll = await page.evaluate(() => ({
      kind: window.__ttLast.kind,
      d1: Number(document.querySelector("#felt .tc-felt-dice").dataset.d1),
      d2: Number(document.querySelector("#felt .tc-felt-dice").dataset.d2),
    }));
    assert.equal(feltRoll.kind, "felt");
    assert.deepEqual([feltRoll.d1, feltRoll.d2], [4, 2]);
  } finally {
    await browser.close();
    server.kill();
  }
});
