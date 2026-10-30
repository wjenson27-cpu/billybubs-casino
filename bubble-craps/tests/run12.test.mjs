/**
 * Run 12: marquee titles wrap, FAIR stays in the top bar, dome pips show
 * from roll 1, and the 320px play column scales onto the screen.
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

test("page stays noindex and run 12 styles are linked", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(html, /css\/run12\.css/);
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

function historyGame(n) {
  const g = E.createGame();
  g.phase = "point";
  g.point = 10;
  g.hand = { rolls: Math.max(n, 21), points: 1, lastLength: 0 };
  const history = [];
  for (let i = 0; i < n; i++) {
    const d1 = (i % 6) + 1;
    const d2 = ((i + 3) % 6) + 1;
    history.unshift({ d1, d2, total: d1 + d2, hard: d1 === d2, result: "no-decision" });
  }
  g.history = history;
  const last = history[0] || { d1: 6, d2: 6, total: 12, hard: true };
  g.lastDice = { d1: last.d1, d2: last.d2, total: last.total, hard: last.hard, aria: "dice", word: "POINT" };
  return g;
}

function count(text, re) {
  return (String(text).match(re) || []).length;
}

test("store polish: marquees, FAIR, dome pips, and the 320 play column", async (t) => {
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

    async function boot(extra, game) {
      await page.goto(base, { waitUntil: "domcontentloaded" });
      await page.evaluate(({ patch, game }) => {
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
        localStorage.setItem("bb-bubble-craps-v1", JSON.stringify({ settings, game: game || null, allRolls: [] }));
        localStorage.setItem("bb-bubble-badges-v1", JSON.stringify({
          v: 1, name: "QA", highlightId: "", entries: [],
          initials: { default: "QA", asked: true }, pending: null, nextHandId: 1,
          badges: {}, progress: {}, daily: { lastDay: "", streak: 0, best: 0 },
          sessions: { withinLimits: 0, awarded: [] }, session: null,
        }));
      }, { patch: extra || {}, game: game || null });
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("button[data-act='play'][data-mode='regular']").first().click();
      await page.waitForSelector(".felt, #hud .fairchip");
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

    async function showMarquee(id) {
      await page.evaluate((badge) => window.__bbShowMarquee(badge), id);
      await page.waitForSelector(".badgetoast.marquee[data-id='" + id + "'] .facts");
    }

    const titles = [
      ["spin_the_block", "Spin the Block"],
      ["hwad_win", "Hard Way All Day"],
      ["ats_low_rolls", "Low Rolls Lit"],
    ];
    for (const width of [375, 390]) {
      await page.setViewportSize({ width, height: 812 });
      await boot({ tutorOn: false }, historyGame(6));
      for (const [id, name] of titles) {
        await showMarquee(id);
        const box = await page.evaluate(() => {
          const b = document.querySelector(".badgetoast.marquee b");
          const view = document.querySelector(".badgetoast .view");
          const card = document.querySelector(".badgetoast").getBoundingClientRect();
          const cs = getComputedStyle(b);
          const lh = parseFloat(cs.lineHeight) || 0;
          const h = b.getBoundingClientRect().height;
          return {
            text: b.textContent,
            lines: lh ? Math.round(h / lh) : 0,
            hidden: b.scrollHeight > b.clientHeight + 2,
            white: cs.whiteSpace,
            nameRight: b.getBoundingClientRect().right,
            viewLeft: view.getBoundingClientRect().left,
            cardLeft: card.left,
            cardRight: card.right,
          };
        });
        assert.equal(box.text, name, width + " " + id);
        assert.ok(box.lines >= 1 && box.lines <= 2, width + " " + name + " lines " + box.lines);
        assert.equal(box.hidden, false, width + " " + name + " is fully visible");
        assert.equal(box.white, "normal");
        assert.ok(box.nameRight <= box.viewLeft + 1, width + " title " + box.nameRight + " view " + box.viewLeft);
        assert.ok(box.cardLeft >= -1 && box.cardRight <= width + 1, width + " marquee stays on screen");
      }
    }

    await showMarquee("spin_the_block");
    const spinFacts = await page.locator(".badgetoast.marquee .facts").innerText();
    assert.match(spinFacts, /1 in 523 hands Regular/);
    assert.match(spinFacts, /1 in 565 Crapless/);
    assert.equal(count(spinFacts, /31 for 1/g), 1, spinFacts);
    assert.equal(count(spinFacts, /18\.30%/g), 1, spinFacts);
    await page.locator(".badgetoast .view").click();
    await page.waitForSelector(".badgedetail");
    const detail = await page.locator(".badgedetail .factrow").innerText();
    assert.match(detail, /1 in 523/);
    assert.match(detail, /1 in 565/);
    await page.locator("button[data-act='close']").click();

    await showMarquee("hwad_win");
    const hwadFacts = await page.locator(".badgetoast.marquee .facts").innerText();
    assert.equal(count(hwadFacts, /1 try in 210/g), 1, hwadFacts);
    assert.equal(count(hwadFacts, /165 for 1/g), 1, hwadFacts);
    assert.equal(count(hwadFacts, /21\.43%/g), 1, hwadFacts);

    await page.setViewportSize({ width: 375, height: 812 });
    await boot({ tutorOn: false }, historyGame(6));
    const fair375 = await page.evaluate(() => {
      const fair = document.querySelector("#hud .fairchip").getBoundingClientRect();
      const row = document.querySelector("#hud .hud-row2").getBoundingClientRect();
      return { fairRight: fair.right, rowRight: row.right, vw: innerWidth };
    });
    assert.ok(fair375.fairRight <= fair375.rowRight + 0.5, "375 FAIR " + fair375.fairRight + " row " + fair375.rowRight);
    assert.ok(fair375.fairRight <= fair375.vw + 0.5, "375 FAIR stays in the viewport");

    for (const size of [{ width: 844, height: 390 }, { width: 1440, height: 900 }]) {
      await page.setViewportSize(size);
      await boot({ tutorOn: false }, historyGame(12));
      await wait(120);
      const bar = await page.evaluate(() => {
        const fair = document.querySelector("#hud .fairchip").getBoundingClientRect();
        const row = document.querySelector("#hud .hud-row2").getBoundingClientRect();
        const app = document.querySelector(".app").getBoundingClientRect();
        const dock = document.querySelector("#dock").getBoundingClientRect();
        const word = document.querySelector("#hud .heater b");
        const segs = [...document.querySelectorAll("#hud .heater .segs i")].filter((el) => getComputedStyle(el).display !== "none");
        return {
          fairLeft: fair.left,
          fairRight: fair.right,
          rowRight: row.right,
          appLeft: app.left,
          appRight: app.right,
          dockLeft: dock.left,
          word: word ? getComputedStyle(word).display : "missing",
          segs: segs.length,
          vw: innerWidth,
        };
      });
      assert.equal(bar.word, "none", size.width + " heat word hidden");
      assert.equal(bar.segs, 4, size.width + " keeps four heat segments");
      assert.ok(bar.fairRight <= bar.vw + 0.5, size.width + " FAIR in the viewport " + bar.fairRight);
      if (size.width === 844) {
        assert.ok(bar.fairRight <= bar.dockLeft + 0.5, "844 FAIR " + bar.fairRight + " dock " + bar.dockLeft);
      } else {
        assert.ok(bar.fairLeft >= bar.appLeft - 1 && bar.fairRight <= bar.appRight + 1, "1440 FAIR " + bar.fairLeft + "-" + bar.fairRight + " column " + bar.appLeft + "-" + bar.appRight);
      }
    }

    for (const n of [1, 5, 10]) {
      for (const width of [375, 390]) {
        await page.setViewportSize({ width, height: 844 });
        await boot({ tutorOn: false }, historyGame(n));
        await page.locator("button.dot[aria-label='Dice']").click();
        await page.waitForSelector(".dome-screen .rollstrip .rolltile");
        await wait(180);
        const strip = await page.evaluate(() => {
          const el = document.querySelector(".dome-screen .rollstrip");
          const tile = el.querySelector(".rolltile");
          const faces = [...tile.querySelectorAll(".dieface")];
          const tb = tile.getBoundingClientRect();
          const rects = faces.map((face) => face.getBoundingClientRect());
          const shown = faces.length === 2 && faces.every((face) => getComputedStyle(face).display !== "none");
          const inside = rects.every((r) => r.width >= 12 && r.left >= tb.left - 0.5 && r.right <= tb.right + 0.5 && r.top >= tb.top - 0.5 && r.bottom <= tb.bottom + 0.5);
          const side = rects.length === 2 && Math.abs(rects[0].top - rects[1].top) < 2 && rects[0].right <= rects[1].left + 1.5;
          return {
            totals: el.classList.contains("totals"),
            tiles: el.querySelectorAll(".rolltile").length,
            parent: el.closest(".dome-screen").clientWidth,
            shown,
            inside,
            side,
          };
        });
        assert.equal(strip.tiles, n, width + " strip has " + n + " rolls");
        assert.equal(strip.totals, false, width + " roll " + n + " shows pips (parent " + strip.parent + ")");
        assert.equal(strip.shown, true);
        assert.equal(strip.inside, true, width + " faces stay inside the first tile");
        assert.equal(strip.side, true);
      }
    }

    await page.setViewportSize({ width: 320, height: 568 });
    await boot({ tutorOn: false }, historyGame(1));
    await page.locator("button.dot[aria-label='Dice']").click();
    await page.waitForSelector(".dome-screen .rollstrip");
    await wait(150);
    const narrow = await page.evaluate(() => {
      const el = document.querySelector(".dome-screen .rollstrip");
      const tile = el.querySelector(".rolltile");
      const faces = [...tile.querySelectorAll(".dieface")];
      const tb = tile.getBoundingClientRect();
      const rects = faces.map((face) => face.getBoundingClientRect());
      const strip = el.getBoundingClientRect();
      const inside = rects.every((r) => r.width >= 10 && r.left >= tb.left - 1 && r.right <= tb.right + 1);
      const onStrip = tb.left >= strip.left - 1 && tb.right <= strip.right + 1;
      return {
        totals: el.classList.contains("totals"),
        parent: el.closest(".dome-screen").clientWidth,
        shown: faces.every((face) => getComputedStyle(face).display !== "none"),
        inside,
        onStrip,
      };
    });
    assert.equal(narrow.totals, true, "320 dome uses totals (" + narrow.parent + "px)");
    assert.equal(narrow.shown, false, "320 dome does not draw sub-14px pips");

    await page.locator("button.dot[aria-label='Board']").click();
    await page.waitForSelector(".felt");
    await wait(80);
    const play320 = await page.evaluate(() => {
      const app = document.querySelector(".app.play").getBoundingClientRect();
      const roll = document.querySelector(".roll-btn").getBoundingClientRect();
      const felt = document.querySelector(".felt").getBoundingClientRect();
      const chip = document.querySelector(".chip-btn").getBoundingClientRect();
      const press = document.querySelector(".press-btn").getBoundingClientRect();
      const home = document.querySelector(".homebtn").getBoundingClientRect();
      const zoom = getComputedStyle(document.querySelector(".app.play")).zoom;
      return {
        zoom,
        appRight: app.right,
        rollLeft: roll.left,
        rollRight: roll.right,
        rollBottom: roll.bottom,
        rollW: roll.width,
        feltLeft: felt.left,
        feltRight: felt.right,
        feltBottom: felt.bottom,
        chipW: chip.width,
        chipH: chip.height,
        pressH: press.height,
        homeW: home.width,
        vw: innerWidth,
        vh: innerHeight,
      };
    });
    assert.ok(Number(play320.zoom) > 0 && Number(play320.zoom) < 1, "320 play column is scaled (" + play320.zoom + ")");
    assert.ok(play320.rollLeft >= -0.5 && play320.rollRight <= play320.vw + 0.5, "320 ROLL " + play320.rollLeft + "-" + play320.rollRight);
    assert.ok(play320.rollBottom <= play320.vh + 0.5, "320 ROLL bottom " + play320.rollBottom);
    assert.ok(play320.rollW >= 40, "320 ROLL hit " + play320.rollW);
    assert.ok(play320.feltLeft >= -1 && play320.feltRight <= play320.vw + 1, "320 felt " + play320.feltLeft + "-" + play320.feltRight);
    assert.ok(play320.feltBottom <= play320.vh + 1, "320 felt bottom " + play320.feltBottom);
    assert.ok(play320.chipW >= 40 && play320.chipH >= 40, "320 chip " + play320.chipW + "x" + play320.chipH);
    assert.ok(play320.pressH >= 40, "320 press " + play320.pressH);
    assert.ok(play320.homeW >= 32, "320 home " + play320.homeW);

    await page.setViewportSize({ width: 360, height: 740 });
    await wait(150);
    const play360 = await page.evaluate(() => {
      const roll = document.querySelector(".roll-btn").getBoundingClientRect();
      const chip = document.querySelector(".chip-btn").getBoundingClientRect();
      const zoom = getComputedStyle(document.querySelector(".app.play")).zoom;
      return { zoom, rollRight: roll.right, rollW: roll.width, chipW: chip.width, vw: innerWidth };
    });
    assert.ok(play360.zoom === "1" || play360.zoom === "normal" || Number(play360.zoom) === 1, "360 zoom stays 1 (" + play360.zoom + ")");
    assert.ok(play360.rollRight <= play360.vw + 0.5, "360 ROLL " + play360.rollRight);
    assert.ok(play360.rollW >= 90, "360 ROLL keeps its size (" + play360.rollW + ")");
    assert.ok(play360.chipW >= 43, "360 chips stay 44px (" + play360.chipW + ")");

    await page.setViewportSize({ width: 390, height: 844 });
    await boot({ tutorOn: false });
    await page.locator("button.dot[aria-label='Side bets']").click();
    await page.locator("button[aria-label^='Hop 2-2']").click();
    await forceRoll(2, 2);
    await page.waitForSelector(".winlayer");
    await page.evaluate(() => window.__bbShowMarquee("spin_the_block"));
    await page.waitForSelector(".badgetoast.marquee");
    assert.equal(await page.locator(".winlayer").count(), 1, "direct marquee still shows over BIG WIN");
    await page.evaluate(() => {
      const host = document.getElementById("badge-toast");
      if (host) host.innerHTML = "";
      document.body.classList.remove("mascot-toast");
    });
    await page.evaluate(() => window.__bbQueueMarquee("spin_the_block"));
    await wait(500);
    assert.equal(await page.locator(".badgetoast.marquee").count(), 0, "queued marquee waits for the scrim");
    await page.evaluate(() => document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
    await page.waitForSelector(".badgetoast.marquee");
    assert.equal(await page.locator(".winlayer").count(), 0);
    assert.match(await page.locator(".badgetoast.marquee b").innerText(), /Spin the Block/);

    const bonus = await page.evaluate(() => {
      const stamp = document.createElement("div");
      stamp.className = "winstamp";
      stamp.innerHTML = "<em>Hard Way All Day! +$164 per $1. Bet stays up, lamps reset.</em>";
      document.body.appendChild(stamp);
      const em = stamp.querySelector("em");
      const cs = getComputedStyle(em);
      const box = em.getBoundingClientRect();
      const out = {
        display: cs.display,
        max: cs.maxWidth,
        radius: cs.borderRadius,
        bg: cs.backgroundColor,
        width: box.width,
        align: cs.textAlign,
      };
      stamp.remove();
      return out;
    });
    assert.equal(bonus.display, "block");
    assert.equal(bonus.max, "300px");
    assert.equal(bonus.radius, "10px");
    assert.equal(bonus.align, "center");
    assert.ok(bonus.width > 40 && bonus.width <= 300, "bonus chip width " + bonus.width);
    assert.notEqual(bonus.bg, "rgba(0, 0, 0, 0)");
  } finally {
    await browser.close();
    server.kill();
  }
});
