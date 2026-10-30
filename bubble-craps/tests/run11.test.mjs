/**
 * Run 11: pip tiles keep both faces inside the tile, landscape coach leaves
 * ROLL clear, a heat sheet hides the dome Billy, and the phone HUD keeps
 * FAIR on screen without dropping the 4th Blazing segment.
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

test("face art has one pip circle per face value", () => {
  for (let n = 1; n <= 6; n++) {
    const svg = readFileSync(new URL("../assets/dice/faces/face-" + n + ".svg", import.meta.url), "utf8");
    const circles = svg.match(/<circle\b/g) || [];
    assert.equal(circles.length, n, "face-" + n + " pip count");
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

function hudGame(rolls, points) {
  const g = E.createGame();
  g.phase = "point";
  g.point = 10;
  g.hand = { rolls, points, lastLength: 0 };
  g.lastDice = { d1: 6, d2: 6, total: 12, hard: true, aria: "six and six, hard twelve", word: "HARD TWELVE" };
  return g;
}

test("strips, landscape coach, heat sheet, and phone HUD", async (t) => {
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

    const robots = await page.goto(base, { waitUntil: "domcontentloaded" }).then(() =>
      page.locator("meta[name='robots']").getAttribute("content"));
    assert.match(robots, /noindex/);
    assert.match(robots, /nofollow/);

    for (const size of [{ w: 844, h: 390 }, { w: 932, h: 430 }]) {
      await page.setViewportSize({ width: size.w, height: size.h });
      await boot();
      if (size.h < 400) {
        const gate = await page.evaluate(() => {
          const g = document.querySelector(".rotate-gate");
          const roll = document.querySelector("button[data-act='roll']");
          const box = roll.getBoundingClientRect();
          const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
          const hud = document.querySelector(".hud");
          const hr = hud.getBoundingClientRect();
          const hudHit = document.elementFromPoint(hr.left + 20, hr.top + hr.height / 2);
          const legal = document.querySelector(".legal");
          const lr = legal.getBoundingClientRect();
          const legalHit = document.elementFromPoint(lr.left + lr.width / 2, lr.top + lr.height / 2);
          return {
            shown: getComputedStyle(g).display !== "none",
            text: g.innerText,
            covered: !!(top && top.closest(".rotate-gate")),
            hud: !!(hudHit && (hud === hudHit || hud.contains(hudHit))),
            legal: !!(legalHit && (legal === legalHit || legal.contains(legalHit))),
          };
        });
        assert.equal(gate.shown, true, size.w + " rotate card");
        assert.match(gate.text, /Rotate to portrait/);
        assert.equal(gate.covered, true, size.w + " ROLL stays under the card");
        assert.equal(gate.hud, true, size.w + " HUD stays up");
        assert.equal(gate.legal, true, size.w + " footer stays up");
        continue;
      }
      await page.locator("button[data-act='billy']").click();
      await page.waitForSelector(".coach");
      const hit = await page.evaluate(() => {
        const roll = document.querySelector("button[data-act='roll']");
        const box = roll.getBoundingClientRect();
        const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
        const coach = document.querySelector(".coach").getBoundingClientRect();
        return {
          tag: top ? top.className : "",
          coachRight: coach.right,
          rollLeft: box.left,
        };
      });
      assert.ok(hit.rollLeft >= hit.coachRight - 1, size.w + " coach ends before ROLL (" + hit.coachRight + " / " + hit.rollLeft + ")");
      assert.ok(!String(hit.tag).includes("coach"), size.w + " ROLL hit is " + hit.tag);
      const before = await page.locator(".hud-roll strong").innerText();
      await page.locator("button[data-act='roll']").click();
      await page.waitForFunction((n) => document.querySelector(".hud-roll strong").textContent !== n, before);
      assert.equal(await page.locator(".coach").count(), 1, size.w + " coach stays open");
    }

    await page.setViewportSize({ width: 390, height: 844 });
    const heatGame = E.createGame();
    heatGame.phase = "point";
    heatGame.point = 9;
    heatGame.hand = { rolls: 8, points: 1, lastLength: 0 };
    await boot({ seenBlaze: { warm: true }, tutorOn: false }, heatGame);
    await page.locator("button.dot[aria-label='Dice']").click();
    await page.waitForSelector(".dome-cast");
    await forceRoll(1, 1);
    await page.waitForSelector("#overlay .sheet img[src*='mascots/']");
    const heat = await page.evaluate(() => {
      const cast = document.querySelector(".dome-cast");
      const sheet = document.querySelector("#overlay .sheet h2");
      return {
        dome: cast ? getComputedStyle(cast).visibility : "missing",
        title: sheet ? sheet.textContent : "",
      };
    });
    assert.equal(heat.dome, "hidden", "heat sheet hides the dome Billy");
    assert.match(heat.title, /hot/i);
    assert.equal(await mascotCount(), 1, "heat sheet is one mascot");

    const tiers = [
      { rolls: 0, points: 1, name: "cold", on: 1 },
      { rolls: 1, points: 1, name: "warm", on: 2 },
      { rolls: 9, points: 1, name: "hot", on: 3 },
      { rolls: 21, points: 1, name: "blazing", on: 4 },
    ];
    for (const width of [375, 390, 430]) {
      for (const tier of tiers) {
        await page.setViewportSize({ width, height: 844 });
        await boot({ tutorOn: false, blazing: true }, hudGame(tier.rolls, tier.points));
        await wait(120);
        const hud = await page.evaluate(() => {
          const fair = document.querySelector("#hud .fairchip").getBoundingClientRect();
          const pill = document.querySelector("#hud .lastdice").getBoundingClientRect();
          const inside = (a, b) => a.left >= b.left - 0.6 && a.right <= b.right + 0.6 && a.top >= b.top - 0.6 && a.bottom <= b.bottom + 0.6;
          const faces = [...document.querySelectorAll("#hud .lastdice .dieface")].map((el) => el.getBoundingClientRect());
          const badge = document.querySelector("#hud .lastdice .readbadge").getBoundingClientRect();
          const row = document.querySelector("#hud .hud-row2").getBoundingClientRect();
          const segs = [...document.querySelectorAll("#hud .heater.compact .segs i")];
          const boxes = segs.map((el) => {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            return {
              display: s.display,
              w: r.width,
              h: r.height,
              on: el.classList.contains("on"),
              inView: r.left >= -0.5 && r.right <= innerWidth + 0.5 && r.top >= row.top - 0.5 && r.bottom <= row.bottom + 0.5 && r.width >= 8 && r.height >= 4,
            };
          });
          return {
            fairIn: fair.left >= -0.5 && fair.right <= innerWidth + 0.5 && fair.width >= 40,
            facesIn: faces.length === 2 && faces.every((r) => inside(r, pill)),
            badgeIn: inside(badge, pill),
            boxes,
            tier: (document.querySelector("#hud .heater") || {}).className || "",
          };
        });
        assert.equal(hud.fairIn, true, width + " " + tier.name + " FAIR is on screen");
        assert.equal(hud.facesIn, true, width + " " + tier.name + " HUD dice sit in the pill");
        assert.equal(hud.badgeIn, true, width + " " + tier.name + " HUD total sits in the pill");
        assert.equal(hud.boxes.length, 4, width + " meter has 4 segments");
        assert.ok(hud.boxes.every((seg) => seg.display !== "none" && seg.inView), width + " " + tier.name + " segments " + JSON.stringify(hud.boxes));
        assert.equal(hud.boxes.filter((seg) => seg.on).length, tier.on, width + " " + tier.name + " fill");
        assert.match(hud.tier, new RegExp("\\b" + tier.name + "\\b"));
      }
    }

    const history = [];
    for (let i = 0; i < 20; i++) {
      const d1 = (i % 6) + 1;
      const d2 = ((i * 3) % 6) + 1;
      history.push({ d1, d2, total: d1 + d2, hard: d1 === d2, result: "no-decision" });
    }
    const stripGame = E.createGame();
    stripGame.history = history;

    async function pairGeometry(selector) {
      return page.evaluate((sel) => {
        const el = document.querySelector(sel);
        const liveTotals = el.classList.contains("totals");
        const liveWidth = el.clientWidth;
        const inside = (a, b) => a.left >= b.left - 0.75 && a.right <= b.right + 0.75 && a.top >= b.top - 0.75 && a.bottom <= b.bottom + 0.75;
        const pairs = [];
        for (let a = 1; a <= 6; a++) {
          for (let b = 1; b <= 6; b++) pairs.push([a, b]);
        }
        const bad = [];
        const gap = 1;
        const fit = Math.max(1, Math.floor((liveWidth + gap) / (30 + gap)));
        for (let i = 0; i < pairs.length; i += fit) {
          const batch = pairs.slice(i, i + fit);
          el.classList.remove("totals");
          el.innerHTML = batch.map(([d1, d2]) => {
            const total = d1 + d2;
            return "<button type='button' class='rolltile" + (total === 7 ? " seven" : "") + (d1 === d2 ? " dbl" : "") + "'>" +
              "<img class='dieface' width='14' height='14' src='assets/dice/faces/face-" + d1 + ".svg' alt=''>" +
              "<img class='dieface' width='14' height='14' src='assets/dice/faces/face-" + d2 + ".svg' alt=''>" +
              "<b>" + total + "</b></button>";
          }).join("");
          const strip = el.getBoundingClientRect();
          [...el.querySelectorAll(".rolltile")].forEach((tile, idx) => {
            const [d1, d2] = batch[idx];
            const tb = tile.getBoundingClientRect();
            const faces = [...tile.querySelectorAll(".dieface")];
            const rects = faces.map((face) => face.getBoundingClientRect());
            const srcs = faces.map((face) => face.getAttribute("src") || "");
            const side = rects.length === 2 && Math.abs(rects[0].top - rects[1].top) < 2 && rects[0].right <= rects[1].left + 1.5;
            const inTile = rects.length === 2 && rects.every((r) => inside(r, tb) && r.width >= 12 && r.height >= 12);
            const onStrip = inside(tb, strip);
            const match = srcs[0].includes("face-" + d1 + ".svg") && srcs[1].includes("face-" + d2 + ".svg");
            if (!side || !inTile || !onStrip || !match) bad.push({ d1, d2, side, inTile, onStrip, match });
          });
        }
        const rows = [];
        el.classList.remove("totals");
        el.innerHTML = pairs.slice(0, 20).map(([d1, d2]) => {
          const total = d1 + d2;
          return "<button type='button' class='rolltile'><img class='dieface' width='14' height='14' src='assets/dice/faces/face-" + d1 + ".svg' alt=''>" +
            "<img class='dieface' width='14' height='14' src='assets/dice/faces/face-" + d2 + ".svg' alt=''><b>" + total + "</b></button>";
        }).join("");
        [...el.querySelectorAll(".rolltile")].forEach((tile) => {
          const box = tile.getBoundingClientRect();
          let row = rows.find((item) => Math.abs(item.top - box.top) < 3);
          if (!row) rows.push(row = { top: box.top, bottom: box.bottom });
          else row.bottom = Math.max(row.bottom, box.bottom);
          [...tile.querySelectorAll(".dieface")].forEach((face) => {
            if (!inside(face.getBoundingClientRect(), box)) bad.push({ rowFace: true });
          });
        });
        rows.sort((a, b) => a.top - b.top);
        for (let i = 1; i < rows.length; i++) {
          if (rows[i].top < rows[i - 1].bottom - 0.5) bad.push({ overlap: true, prev: rows[i - 1], next: rows[i] });
        }
        return { liveTotals, liveWidth, fit, bad: bad.length, sample: bad.slice(0, 2), rows: rows.length };
      }, selector);
    }

    for (const width of [320, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await boot({ tutorOn: false }, stripGame);
      await page.locator("button.dot[aria-label='Dice']").click();
      await page.waitForSelector(".dome-screen .rollstrip");
      await wait(180);
      const live = await page.evaluate(() => {
        const el = document.querySelector(".dome-screen .rollstrip");
        const face = el.querySelector(".dieface");
        return {
          totals: el.classList.contains("totals"),
          w: el.clientWidth,
          shown: face ? getComputedStyle(face).display !== "none" : false,
        };
      });
      if (width === 320) {
        assert.equal(live.totals, true, "320 dome strip uses totals (" + live.w + "px)");
        assert.equal(live.shown, false, "320 dome hides pips that would draw under 14px");
      } else {
        assert.equal(live.totals, false, width + " dome strip shows pips (" + live.w + "px)");
        assert.equal(live.shown, true, width + " dome faces are displayed");
      }
      const geo = await pairGeometry(".dome-screen .rollstrip");
      assert.equal(geo.bad, 0, width + " dome tiles " + JSON.stringify(geo.sample));

      await page.locator("button[data-act='view'][data-view='fair']").first().click();
      await page.locator("button[data-act='fair-scope'][data-scope='all']").click();
      await wait(150);
      const fairLive = await page.evaluate(() => {
        const el = document.querySelector(".fairstrip");
        return { totals: el.classList.contains("totals"), w: el.clientWidth, n: el.querySelectorAll(".rolltile").length };
      });
      if (width === 320) assert.equal(fairLive.totals, true, "320 fair strip uses totals (" + fairLive.w + "px)");
      else assert.equal(fairLive.totals, false, width + " fair strip shows pips (" + fairLive.w + "px)");
      const fairGeo = await pairGeometry(".fairstrip");
      assert.equal(fairGeo.bad, 0, width + " fair tiles " + JSON.stringify(fairGeo.sample));
      if (width !== 320) assert.ok(fairGeo.rows >= 2, width + " fair strip wraps to " + fairGeo.rows + " rows");
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await boot({ tutorOn: false });
    await page.locator("button.dot[aria-label='Side bets']").click();
    await page.locator("button[aria-label^='Hop 2-2']").click();
    await forceRoll(2, 2);
    await page.waitForSelector(".winlayer");
    const hard = await page.evaluate(() => {
      const tag = document.querySelector(".bigwin .readout .hardtag");
      const billie = document.querySelector(".win-billie");
      if (!tag || !billie) return { missing: true };
      const tr = tag.getBoundingClientRect();
      const br = billie.getBoundingClientRect();
      const overlap = !(tr.right <= br.left + 1 || tr.left >= br.right - 1 || tr.bottom <= br.top + 1 || tr.top >= br.bottom - 1);
      return { size: parseFloat(getComputedStyle(tag).fontSize), text: tag.textContent, overlap };
    });
    assert.equal(hard.missing, undefined);
    assert.match(hard.text, /Hard 4/);
    assert.ok(hard.size <= 18, "hard tag font " + hard.size);
    assert.equal(hard.overlap, false, "hard tag stays clear of Billie");
    await page.evaluate(() => {
      const seq = [3, 3];
      let i = 0;
      window.__bbRng = () => (seq[i++] - 0.5) / 6;
    });
    await page.locator("button[data-act='roll']").click();
    const cleared = await page.evaluate(() => !document.querySelector(".winlayer"));
    assert.equal(cleared, true, "BIG WIN banner clears when the next roll starts");
    await page.waitForFunction(() => {
      const imgs = [...document.querySelectorAll(".lastdice .dieface")].map((img) => img.getAttribute("src") || "");
      return imgs.length >= 2 && imgs[0].includes("face-3") && imgs[1].includes("face-3");
    });
    assert.equal(await page.locator(".winlayer").count(), 0);

    await boot();
    await page.locator("button[aria-label^='Pass Line']").click();
    await forceRoll(2, 4);
    await page.locator("button[aria-label^='Place 8']").click();
    await forceRoll(4, 4);
    await page.locator("button[data-act='press']").click();
    await page.waitForSelector(".coach .kicker");
    assert.match(await page.locator(".coach .kicker").innerText(), /POINT IS ON/);
    await forceRoll(3, 4);
    assert.match(await page.locator(".coach .kicker").innerText(), /COME-OUT/);
    assert.equal(await page.locator(".coach").count(), 1);

    await page.setViewportSize({ width: 375, height: 812 });
    await page.evaluate(() => window.__bbShowMarquee("spin_the_block"));
    await page.waitForSelector(".badgetoast.marquee");
    const title = await page.evaluate(() => {
      const name = document.querySelector(".badgetoast.marquee b").getBoundingClientRect();
      const view = document.querySelector(".badgetoast .view").getBoundingClientRect();
      return { nameRight: name.right, viewLeft: view.left, text: document.querySelector(".badgetoast.marquee b").textContent };
    });
    assert.match(title.text, /Spin the Block/);
    assert.ok(title.nameRight <= title.viewLeft + 1, "title " + title.nameRight + " view " + title.viewLeft);

    await page.setViewportSize({ width: 390, height: 844 });
    const ended = await page.evaluate(() => {
      const host = document.getElementById("record") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "record" }));
      host.innerHTML = "<div class='recordlayer'><div class='recordcard'>" +
        "<p class='endedon'><span>Ended on</span> " +
        "<span class='readout s20' style='--die:20px' role='img'>" +
        "<img class='dieface' width='20' height='20' src='assets/dice/faces/face-3.svg' alt=''>" +
        "<img class='dieface' width='20' height='20' src='assets/dice/faces/face-4.svg' alt=''>" +
        "<b class='readbadge seven'>7</b></span> " +
        "<span class='outtag'>· seven out</span></p></div></div>";
      const card = host.querySelector(".recordcard").getBoundingClientRect();
      const line = host.querySelector(".endedon");
      const label = line.querySelector("span");
      const tag = host.querySelector(".outtag").getBoundingClientRect();
      const readout = host.querySelector(".readout").getBoundingClientRect();
      return {
        lines: label.getClientRects().length,
        wrap: getComputedStyle(line).flexWrap,
        tagIn: tag.right <= card.right + 1 && tag.left >= card.left - 1,
        readoutWide: readout.width > card.width * 0.7,
      };
    });
    assert.equal(ended.lines, 1, "Ended on stays on one line");
    assert.equal(ended.wrap, "nowrap");
    assert.equal(ended.tagIn, true, "seven out stays on the card");
    assert.equal(ended.readoutWide, false, "ended-on readout does not stretch");
  } finally {
    await browser.close();
    server.kill();
  }
});
