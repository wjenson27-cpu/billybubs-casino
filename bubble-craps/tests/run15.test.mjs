/**
 * Run 15: board layout, experienced tutor copy, combined warnings,
 * the dome speech gap, the seven-out toast, and the HUD avatar.
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
const FIELD_EXP = "Field: 16 of 36 wins (2 and 12 pay 2 to 1); 5, 6, 7 and 8 lose. 5.56% edge per roll (2.78% with 12 at 3:1).";
const HOP_LESSON = "A hop is one exact pair on the next roll. A hardway stays up for the pair or a 7.";

test("page stays noindex and the run 15 board styles are linked", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(html, /css\/board-fix\.css/);
  assert.match(html, /css\/run15\.css/);
  assert.ok(html.indexOf("board-fix.css") < html.indexOf("run15.css"));
  assert.equal(existsSync(new URL("../assets/mascots/dealer-billy/hud/hud-billy-A-36@1x.png", import.meta.url)), true);
  assert.equal(existsSync(new URL("../assets/mascots/dealer-billy/hud/hud-billy-A-36@2x.png", import.meta.url)), true);
  assert.equal(existsSync(new URL("../assets/mascots/dealer-billy/hud/hud-billy-A-36@3x.png", import.meta.url)), true);
  assert.equal(existsSync(new URL("../assets/mascots/dealer-billy/small/billy-A-avatar-round.svg", import.meta.url)), true);
});

test("experienced tutor names Field, each hop, and each repeater", () => {
  assert.equal(E.tutorEdgeNote({ kind: "field" }, "regular", true), FIELD_EXP);
  assert.equal(E.tutorEdgeNote({ kind: "field" }, "crapless", false), "Field: wins on 16 of 36 rolls, but the 5–8 numbers lose. 5.56% edge.");
  assert.doesNotMatch(E.tutorEdgeNote({ kind: "field" }, "regular", false), /2\.78%/);

  const hard = E.tutorEdgeNote({ kind: "hop", pair: "4-4" }, "regular", true);
  assert.match(hard, /13\.89% edge/);
  assert.match(hard, /1 of 36/);
  assert.match(hard, /30 to 1/);
  assert.doesNotMatch(hard, /15 to 1/);
  const easy = E.tutorEdgeNote({ kind: "hop", pair: "2-4" }, "regular", true);
  assert.match(easy, /11\.11% edge/);
  assert.match(easy, /2 of 36/);
  assert.match(easy, /15 to 1/);
  assert.doesNotMatch(easy, /30 to 1/);
  const beginnerHop = E.tutorEdgeNote({ kind: "hop", pair: "4-4" }, "regular", false);
  assert.equal(beginnerHop, "Long shot with a high house edge.");

  const expect = {
    2: ["18.37%", "1 in 49", "40 for 1"],
    3: ["21.88%", "1 in 64", "50 for 1"],
    4: ["19.75%", "1 in 81", "65 for 1"],
    5: ["18.08%", "1 in 97.7", "80 for 1"],
    6: ["20.62%", "1 in 113.4", "90 for 1"],
  };
  Object.entries(expect).forEach(([n, bits]) => {
    [Number(n), n === "6" ? 8 : n === "5" ? 9 : n === "4" ? 10 : n === "3" ? 11 : 12].forEach((number) => {
      const line = E.tutorEdgeNote({ kind: "repeater", number }, "crapless", true);
      bits.forEach((bit) => assert.match(line, new RegExp(bit.replace(/[.]/g, "\\.")), number + " " + line));
    });
    const beginner = E.tutorEdgeNote({ kind: "repeater", number: Number(n) }, "regular", false);
    assert.equal(beginner, "Long shot with a high house edge.");
  });
});

test("a unit note and the first hop lesson share the toast with the warning", () => {
  const ce = E.tutorToastLine({ kind: "ce" }, "regular", false, "C&E uses $2 units. $1 stayed in practice chips.", true);
  assert.match(ce, /C&E uses \$2 units/);
  assert.match(ce, /High house edge/);
  const horn = E.tutorToastLine({ kind: "horn" }, "regular", true, "Horn uses $4 units. $1 stayed in practice chips.", true);
  assert.match(horn, /Horn uses \$4 units/);
  assert.match(horn, /High house edge/);
  assert.match(horn, /12\.5% edge/);
  const hop = E.tutorToastLine({ kind: "hop", pair: "1-2" }, "regular", false, HOP_LESSON, true);
  assert.match(hop, /one exact pair/);
  assert.match(hop, /Long shot with a high house edge/);
  assert.equal(E.tutorToastLine({ kind: "ce" }, "regular", false, "C&E uses $2 units. $1 stayed in practice chips.", false), "C&E uses $2 units. $1 stayed in practice chips.");
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function heavy(mode) {
  const g = E.createGame({ mode, bankroll: 5_000_000 });
  g.phase = "point";
  g.point = 6;
  g.hand = { rolls: 3, points: 1, lastLength: 0 };
  const nums = mode === "crapless" ? E.NUMBERS : E.REGULAR_NUMBERS;
  nums.forEach((n) => {
    g.bets.place[n] = 100_000;
    g.bets.buy[n] = 100_000;
    if (mode !== "crapless") g.bets.dontComeBets[n] = { amount: 100_000, odds: 0 };
  });
  g.bets.pass = 100_000;
  g.bets.field = 100_000;
  g.bets.any7 = 100_000;
  g.bets.ce = 100_000;
  g.bets.horn = 100_000;
  g.bets.hardways = { 4: 100_000, 6: 100_000, 8: 100_000, 10: 100_000 };
  g.bets.hardAllDay = 100_000;
  g.bets.small = 100_000;
  g.bets.tall = 100_000;
  g.bets.all = 100_000;
  g.bets.comeBets[8] = { amount: 50_000, odds: 0 };
  if (mode !== "crapless") {
    g.bets.dontPass = 100_000;
    g.bets.dontCome = 100_000;
  }
  return g;
}
function pointGame(mode) {
  const g = E.createGame({ mode, bankroll: 100_000 });
  g.phase = "point";
  g.point = 6;
  g.hand = { rolls: 2, points: 1, lastLength: 0 };
  g.bets.pass = 500;
  g.lastDice = { d1: 3, d2: 3, total: 6, hard: true, aria: "three and three", word: "HARD SIX" };
  g.history = [{ d1: 3, d2: 3, total: 6, hard: true, result: "point" }];
  return g;
}

test("board, warnings, speech, seven-out toast, and the HUD avatar", async (t) => {
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
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.on("pageerror", (err) => errors.push(String(err)));
    const base = "http://127.0.0.1:" + port + "/index.html";
    async function boot(w, h, game, mode) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(base, { waitUntil: "domcontentloaded" });
      await page.evaluate((saved) => {
        localStorage.clear();
        localStorage.setItem("bb-numbet", "place");
        localStorage.setItem("bb-bubble-craps-v1", JSON.stringify({
          settings: {
            sound: false, autoRoll: false, tutorOn: true, reduced: true, badgeToasts: false,
            seenBlaze: { warm: true, hot: true, blazing: true }, chip: 500, blazing: false,
          },
          game: saved, allRolls: [],
        }));
      }, game);
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("button[data-act='play'][data-mode='" + (mode || game.mode) + "']").first().click();
      await page.waitForSelector(".felt.bfx.scaled");
      await page.waitForFunction(() => {
        const felt = document.querySelector(".felt.bfx");
        return felt && /lay-(tall|short|land)/.test(felt.className);
      });
    }

    const sizes = [[320, 568], [360, 640], [375, 667], [390, 844], [430, 932], [844, 390], [932, 430]];
    for (const mode of ["regular", "crapless"]) {
      for (const [w, h] of sizes) {
        await boot(w, h, heavy(mode), mode);
        const tag = mode + " " + w + "x" + h;
        if (w > h && h < 400) {
          const gate = await page.evaluate(() => {
            const g = document.querySelector(".rotate-gate");
            const spot = document.querySelector(".felt button.spot");
            const r = spot.getBoundingClientRect();
            const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            const legal = document.querySelector(".legal");
            const lr = legal.getBoundingClientRect();
            const legalHit = document.elementFromPoint(lr.left + lr.width / 2, lr.top + lr.height / 2);
            return {
              shown: getComputedStyle(g).display !== "none",
              text: g.innerText,
              covered: !!(top && top.closest(".rotate-gate")),
              footer: !!(legalHit && (legal === legalHit || legal.contains(legalHit))),
            };
          });
          assert.equal(gate.shown, true, tag);
          assert.match(gate.text, /Rotate to portrait/);
          assert.equal(gate.covered, true, tag + " felt stays under the rotate card");
          assert.equal(gate.footer, true, tag + " 18+ stays tappable");
          continue;
        }
        const layout = await page.evaluate(() => {
          function box(el) {
            const r = el.getBoundingClientRect();
            return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
          }
          function shown(el) {
            const cs = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.2 && r.width > 1 && r.height > 1;
          }
          function textBox(el) {
            const node = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
            if (!node) return null;
            const range = document.createRange();
            range.selectNodeContents(node);
            const r = range.getBoundingClientRect();
            return r.width > 0 && r.height > 0 ? r : null;
          }
          function tight(r) {
            return { left: r.left + 1, right: r.right - 1, top: r.top + 2.5, bottom: r.bottom - 2.5 };
          }
          function area(a, b) {
            const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
            const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
            return w > 1 && h > 1 ? w * h : 0;
          }
          const problems = [];
          const felt = document.querySelector(".felt.bfx");
          const fr = felt.getBoundingClientRect();
          if (fr.left < -1 || fr.right > innerWidth + 1 || fr.top < -1 || fr.bottom > innerHeight + 1) {
            problems.push("felt " + Math.round(fr.left) + "-" + Math.round(fr.right) + " x " + Math.round(fr.top) + "-" + Math.round(fr.bottom) + " of " + innerWidth + "x" + innerHeight);
          }
          if (felt.scrollWidth > felt.clientWidth + 8 || felt.scrollHeight > felt.clientHeight + 8) {
            problems.push("felt scroll " + felt.scrollWidth + "x" + felt.scrollHeight + " client " + felt.clientWidth + "x" + felt.clientHeight);
          }
          const pills = [...felt.querySelectorAll(".betamt, .amt")].filter(shown);
          if (!pills.length) problems.push("no amount pills");
          pills.forEach((el) => {
            const r = box(el);
            if (r.top < -1 || r.left < -1 || r.bottom > innerHeight + 1 || r.right > innerWidth + 1) {
              problems.push("pill offscreen " + el.textContent.trim() + " " + Math.round(r.left) + "," + Math.round(r.top));
            }
            const host = el.closest(".numbox, .spot");
            if (!host) problems.push("pill without a box");
            else {
              const h = box(host);
              if (r.left < h.left - 2 || r.right > h.right + 2 || r.top < h.top - 2 || r.bottom > h.bottom + 2) {
                problems.push("pill outside " + el.textContent.trim() + " host " + (host.className || "").toString().slice(0, 40));
              }
            }
          });
          const texts = [];
          felt.querySelectorAll(".betamt, .amt, .cmark, .face, .spot > b, .half > span, .spot > small").forEach((el) => {
            if (!shown(el)) return;
            const r = textBox(el);
            if (!r) return;
            texts.push({ el, r, t: el.textContent.trim().slice(0, 24) });
          });
          for (let i = 0; i < texts.length; i++) {
            for (let j = i + 1; j < texts.length; j++) {
              const a = texts[i];
              const b = texts[j];
              if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
              const ar = tight(a.r);
              const br = tight(b.r);
              if (ar.bottom <= ar.top || br.bottom <= br.top) continue;
              if (area(ar, br) > 0) problems.push("overlap " + a.t + " / " + b.t);
            }
          }
          function hit(el) {
            const r = el.getBoundingClientRect();
            const x = r.left + r.width / 2;
            const y = r.top + r.height / 2;
            const top = document.elementFromPoint(x, y);
            return { top, x, y };
          }
          felt.querySelectorAll("button.spot").forEach((el) => {
            if (!shown(el)) return;
            const got = hit(el);
            if (!got.top || !el.contains(got.top)) {
              problems.push("spot " + (el.getAttribute("data-kind") || "") + " " + (el.getAttribute("data-number") || el.getAttribute("data-pair") || "") + " hit " + (got.top ? got.top.className : "none"));
            }
          });
          const active = felt.getAttribute("data-numbet") || "place";
          felt.querySelectorAll(".numbox").forEach((boxEl) => {
            const half = boxEl.querySelector(".half." + active);
            if (!half || half.disabled) return;
            const r = boxEl.getBoundingClientRect();
            const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            const kind = half.getAttribute("data-kind");
            const number = half.getAttribute("data-number");
            if (!top || top.getAttribute("data-kind") !== kind || top.getAttribute("data-number") !== number) {
              problems.push("number " + number + " " + active + " hit " + (top ? top.getAttribute("data-kind") + " " + top.getAttribute("data-number") : "none"));
            }
          });
          return { problems: problems.slice(0, 8), pills: pills.length, active };
        });
        assert.deepEqual(layout.problems, [], tag + " " + layout.problems.join(" | "));

        for (const which of mode === "crapless" ? ["place", "buy"] : ["place", "buy", "lay"]) {
          await page.locator(".numbet button[data-mode='" + which + "']").click();
          await page.waitForSelector(".felt.bfx[data-numbet='" + which + "']");
          const hits = await page.evaluate((modeName) => {
            const bad = [];
            document.querySelectorAll(".felt.bfx .numbox").forEach((boxEl) => {
              const half = boxEl.querySelector(".half." + modeName);
              if (!half) return;
              const r = boxEl.getBoundingClientRect();
              const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
              if (!top || top.getAttribute("data-kind") !== half.getAttribute("data-kind") || top.getAttribute("data-number") !== half.getAttribute("data-number")) {
                bad.push(half.getAttribute("data-number"));
              }
            });
            return bad;
          }, which);
          assert.deepEqual(hits, [], tag + " " + which + " misses " + hits.join(","));
        }
      }

      await boot(390, 844, pointGame(mode), mode);
      await page.locator(".numbox .half.place[data-number='5']").click();
      await page.waitForFunction(() => {
        const el = document.querySelector(".half.place[data-number='5']");
        return el && /\$5/.test(el.getAttribute("aria-label") || "");
      });
      const bets = await page.evaluate(() => {
        return [...document.querySelectorAll("[data-act='bet']")]
          .map((el) => el.getAttribute("aria-label") || "")
          .filter((label) => /\$\d/.test(label));
      });
      assert.deepEqual(bets.filter((label) => /Place 5/.test(label)).length, 1, mode + " place 5");
      assert.equal(bets.filter((label) => !/Place 5|Pass Line/.test(label)).length, 0, mode + " extra bets " + bets.join(" · "));
    }

    await boot(390, 844, pointGame("regular"), "regular");
    await page.locator("button[data-kind='ce']").click();
    await page.waitForFunction(() => /C&E uses \$2 units/.test(document.querySelector("#toast").textContent || ""));
    const ceText = await page.locator("#toast").innerText();
    assert.match(ceText, /C&E uses \$2 units/);
    assert.match(ceText, /High house edge/);
    await page.locator("button[data-kind='horn']").click();
    await page.waitForFunction(() => /Horn uses \$4 units/.test(document.querySelector("#toast").textContent || ""));
    const hornText = await page.locator("#toast").innerText();
    assert.match(hornText, /Horn uses \$4 units/);
    assert.match(hornText, /High house edge/);
    await page.locator(".prop button[data-kind='hop'][data-pair='1-2']").click();
    await page.waitForFunction(() => /one exact pair/.test(document.querySelector("#toast").textContent || ""));
    const hopText = await page.locator("#toast").innerText();
    assert.match(hopText, /one exact pair/);
    assert.match(hopText, /Long shot with a high house edge/);

    for (const [w, h] of [[375, 812], [390, 844], [430, 932]]) {
      await boot(w, h, pointGame("regular"), "regular");
      await page.locator("button.dot[aria-label='Dice']").click();
      await page.waitForSelector(".dome-cast .speech");
      const gap = await page.evaluate(() => {
        const speech = document.querySelector(".dome-cast .speech").getBoundingClientRect();
        const result = document.querySelector(".dome-screen .result-line").getBoundingClientRect();
        const overlap = Math.min(speech.bottom, result.bottom) - Math.max(speech.top, result.top);
        const crossed = speech.right > result.left && speech.left < result.right && overlap > 0.5;
        return { crossed, speechBottom: speech.bottom, resultTop: result.top };
      });
      assert.equal(gap.crossed, false, w + "x" + h + " speech " + gap.speechBottom.toFixed(1) + " result " + gap.resultTop.toFixed(1));
    }

    for (const [w, h] of [[320, 568], [360, 640], [375, 667], [390, 844], [430, 932]]) {
      await boot(w, h, pointGame("regular"), "regular");
      await page.locator("button.dot[aria-label='Dice']").click();
      await page.waitForSelector("#dice-row .cube");
      await page.evaluate(() => {
        const seq = [3, 4];
        let i = 0;
        window.__bbRng = () => (seq[i++] - 0.5) / 6;
      });
      await page.locator("button[data-act='roll']").click();
      await page.waitForSelector(".pso-plate .readcall", { timeout: 5000 });
      await page.waitForFunction(() => {
        const toast = document.querySelector(".pso-plate");
        if (!toast) return false;
        const op = Number(getComputedStyle(toast).opacity);
        return op > 0.4 && toast.getBoundingClientRect().top >= -1;
      });
      const toastFit = await page.evaluate(() => {
        const toast = document.querySelector(".pso-plate");
        const call = toast.querySelector(".readcall");
        const glass = document.querySelector(".dome-screen .machine");
        function rect(el) { const r = el.getBoundingClientRect(); return r; }
        function clipped(el) {
          const r = rect(el);
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden") return "hidden";
          if (r.width < 2 || r.height < 2) return "empty";
          if (r.top < -1 || r.left < -1 || r.bottom > innerHeight + 1 || r.right > innerWidth + 1) return "viewport";
          if (el.scrollWidth > el.clientWidth + 1) return "scroll " + el.scrollWidth + ">" + el.clientWidth;
          let p = el.parentElement;
          while (p && p !== document.body) {
            const pcs = getComputedStyle(p);
            if (/(auto|scroll|hidden)/.test(pcs.overflow + pcs.overflowX + pcs.overflowY)) {
              const pr = p.getBoundingClientRect();
              if (r.left < pr.left - 1 || r.right > pr.right + 1 || r.top < pr.top - 1 || r.bottom > pr.bottom + 1) return "clipped by " + (p.id || p.className);
            }
            p = p.parentElement;
          }
          return "";
        }
        const tr = rect(toast);
        const gr = rect(glass);
        const overlap = tr.left < gr.right && tr.right > gr.left && tr.top < gr.bottom && tr.bottom > gr.top;
        return {
          text: call.textContent,
          clip: clipped(call),
          overlap,
          toastTop: tr.top,
          toast: Math.round(tr.top) + "-" + Math.round(tr.bottom),
          glass: Math.round(gr.top) + "-" + Math.round(gr.bottom),
        };
      });
      assert.ok(String(toastFit.text || "").indexOf("SEVEN OUT") === 0, w + "x" + h + " " + toastFit.text);
      assert.equal(toastFit.clip, "", w + "x" + h + " " + toastFit.clip);
      assert.ok(toastFit.toastTop >= -1, w + "x" + h + " toast starts at " + toastFit.toast);
      assert.equal(toastFit.overlap, false, w + "x" + h + " toast " + toastFit.toast + " glass " + toastFit.glass);
    }

    await boot(390, 844, pointGame("regular"), "regular");
    const avatar = await page.evaluate(() => {
      const btn = document.querySelector(".homebtn");
      const img = btn.querySelector("img.home-avatar");
      const cs = getComputedStyle(btn);
      return {
        src: img.getAttribute("src"),
        srcset: img.getAttribute("srcset"),
        shadow: cs.boxShadow,
        border: cs.borderTopWidth + " " + cs.borderTopStyle,
        margin: cs.marginLeft,
      };
    });
    assert.match(avatar.src, /hud-billy-A-36@1x\.png$/);
    assert.match(avatar.srcset, /hud-billy-A-36@1x\.png 1x/);
    assert.match(avatar.srcset, /hud-billy-A-36@2x\.png 2x/);
    assert.match(avatar.srcset, /hud-billy-A-36@3x\.png 3x/);
    assert.equal(avatar.shadow, "none");
    assert.equal(avatar.border, "0px none");
    assert.equal(avatar.margin, "-3px");
    assert.deepEqual(errors, []);
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
