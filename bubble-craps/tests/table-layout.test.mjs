/**
 * Tight landscape stays on one screen, the color-up offer leaves the Pass
 * Line visible, and the long-press sheet follows the take-down rules.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ensureStaticServer } from "./listen.mjs";

const CHROME = ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/local/bin/google-chrome", "/usr/bin/chromium"].find((p) => existsSync(p));
const root = fileURLToPath(new URL("..", import.meta.url));

test("568 landscape, 320 color-up, and the lingo take-down sheet", async (t) => {
  if (!CHROME) { t.skip("system Chrome is not available"); return; }
  let pw;
  try { pw = await import("playwright-core"); } catch { t.skip("playwright-core is not available"); return; }
  const server = await ensureStaticServer(root);
  const browser = await pw.chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-gpu"] });
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 568, height: 320 });
    await page.goto("http://127.0.0.1:" + server.port + "/table/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__tcReady);
    const land = await page.evaluate(() => {
      const felt = document.getElementById("felt");
      const pass = document.querySelector(".spot.pass");
      const notice = document.querySelector(".tc-notice");
      const dots = document.querySelector(".tc-dots");
      const pr = pass.getBoundingClientRect();
      const nr = notice.getBoundingClientRect();
      return {
        land: felt.classList.contains("land"),
        passTop: pr.top,
        passBottom: pr.bottom,
        notice: notice.textContent,
        noticeTop: nr.top,
        dots: getComputedStyle(dots).display,
        vh: innerHeight,
      };
    });
    assert.equal(land.land, true);
    assert.ok(land.passBottom <= land.vh + 1, "pass bottom " + land.passBottom);
    assert.ok(land.passTop >= 0, "pass top " + land.passTop);
    assert.match(land.notice, /18\+/);
    assert.ok(land.noticeTop < land.vh, "notice " + land.noticeTop);
    assert.notEqual(land.dots, "none");

    const gate = await page.evaluate(() => {
      const g = document.querySelector(".rotate-gate");
      const come = document.querySelector("[data-kind='come']");
      const cr = come.getBoundingClientRect();
      const hit = document.elementFromPoint(cr.left + cr.width / 2, cr.top + cr.height / 2);
      const notice = document.querySelector(".tc-notice");
      const nr = notice.getBoundingClientRect();
      const nh = document.elementFromPoint(nr.left + Math.min(24, nr.width / 2), nr.top + nr.height / 2);
      const hud = document.querySelector(".tc-hud");
      const hr = hud.getBoundingClientRect();
      const hh = document.elementFromPoint(hr.left + 12, hr.top + hr.height / 2);
      return {
        shown: getComputedStyle(g).display !== "none",
        text: g.innerText,
        covered: !!(hit && hit.closest(".rotate-gate")),
        notice: !!(nh && (notice === nh || notice.contains(nh))),
        hud: !!(hh && (hud === hh || hud.contains(hh))),
      };
    });
    assert.equal(gate.shown, true);
    assert.match(gate.text, /Rotate to portrait/);
    assert.equal(gate.covered, true, "come tap hits the rotate card");
    assert.equal(gate.notice, true, "18+ stays above the card");
    assert.equal(gate.hud, true, "HUD stays above the card");

    await page.locator("[data-act='go-shooter']").evaluate((el) => el.click());
    const peek = await page.evaluate(() => {
      const fire = document.querySelector(".tc-fire");
      if (!fire) return { ok: true };
      const r = fire.getBoundingClientRect();
      return { ok: r.left >= -1 && r.right <= innerWidth + 1, left: r.left, right: r.right };
    });
    assert.equal(peek.ok, true, "fire peek " + peek.left + ".." + peek.right);

    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(() => {
      const rail = document.querySelector(".tc-rail");
      rail.dataset.ready = "1";
    });
    await page.goto("http://127.0.0.1:" + server.port + "/table/index.html?shot=colorup", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__tcReady);
    await page.waitForSelector(".tc-offer");
    const offer = await page.evaluate(() => {
      const pass = document.querySelector(".spot.pass");
      const pr = pass.getBoundingClientRect();
      const offerEl = document.querySelector(".tc-offer");
      const or = offerEl.getBoundingClientRect();
      const overlap = !(pr.bottom <= or.top || pr.top >= or.bottom || pr.right <= or.left || pr.left >= or.right);
      return { top: pr.top, bottom: pr.bottom, vh: innerHeight, overlap, offerTop: or.top };
    });
    assert.equal(offer.overlap, false, "offer covers pass");
    assert.ok(offer.bottom <= offer.vh + 1 && offer.top >= 0, "pass " + offer.top + ".." + offer.bottom);

    await page.goto("http://127.0.0.1:" + server.port + "/table/index.html", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__tcReady);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      const pass = document.querySelector("[data-kind='pass']");
      const down = new PointerEvent("pointerdown", { bubbles: true, clientX: 20, clientY: 20 });
      pass.dispatchEvent(down);
    });
    await page.waitForSelector(".lingo-sheet");
    const sheet = await page.evaluate(() => {
      const btn = [...document.querySelectorAll(".lingo-bet .lingo-btn")].find((b) => /take down/i.test(b.textContent));
      return { disabled: !!(btn && btn.disabled), text: document.querySelector(".lingo-sheet").innerText };
    });
    assert.match(sheet.text, /Tap the spot to bet|Take down/);
    await page.locator(".lingo-x").click();

    await page.locator("[data-kind='pass']").click();
    await page.evaluate(() => {
      const seq = [4, 2];
      window.__tcRng = () => (seq.shift() - 0.5) / 6;
    });
    await page.locator("[data-act='go-shooter']").click();
    await page.locator("[data-act='throw']").click();
    await page.waitForFunction(() => /puck-on/.test((document.querySelector(".tc-hud .puck") || {}).getAttribute("src") || ""));
    await page.locator("[data-act='page'][data-page='1']").first().click();
    await page.evaluate(() => {
      const pass = document.querySelector("[data-kind='pass']");
      pass.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 30, clientY: 40 }));
    });
    await page.waitForSelector(".lingo-sheet");
    const locked = await page.evaluate(() => document.querySelector(".lingo-sheet").innerText);
    assert.match(locked, /can't come down/);
    const take = page.locator(".lingo-bet .lingo-btn", { hasText: "Take down" });
    assert.equal(await take.isDisabled(), true);
  } finally {
    await browser.close();
    server.kill();
  }
});
