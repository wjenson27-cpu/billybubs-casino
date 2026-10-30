/**
 * Round 5a: rotate card, PSO haptics, peek contrast and size, one mascot,
 * 44px targets, a checkout-matched test server, Show me, and the bet sheet.
 */
import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureStaticServer, servesRoot, waitForPort } from "./listen.mjs";

const CHROME = ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/local/bin/google-chrome", "/usr/bin/chromium"].find((p) => existsSync(p));
const root = fileURLToPath(new URL("..", import.meta.url));

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
  });
}

test("static server skips a foreign checkout", async () => {
  const dir = mkdtempSync(join(tmpdir(), "bb-foreign-"));
  mkdirSync(join(dir, "js"), { recursive: true });
  writeFileSync(join(dir, "js/table-ui.mjs"), "foreign-checkout\n");
  const port = await freePort();
  const child = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
    cwd: dir,
    stdio: "ignore",
  });
  try {
    await waitForPort(port);
    assert.equal(await servesRoot(port, root), false);
    const server = await ensureStaticServer(root);
    assert.notEqual(server.port, port);
    assert.equal(await servesRoot(server.port, root), true);
    const body = await new Promise((resolve, reject) => {
      const req = net.connect({ port: server.port, host: "127.0.0.1" }, () => {
        req.end("GET /js/table-ui.mjs HTTP/1.0\r\nHost: 127.0.0.1\r\n\r\n");
      });
      const chunks = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      req.on("error", reject);
    });
    assert.match(body, /psoHaptic/);
    server.kill();
    assert.equal(await servesRoot(server.port, root), true);
  } finally {
    child.kill();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("table PSO haptics are wired to tick and success", () => {
  const ui = readFileSync(new URL("../js/table-ui.mjs", import.meta.url), "utf8");
  assert.match(ui, /function psoHaptic\(name\)/);
  assert.match(ui, /navigator\.vibrate\(name === "success" \? \[12, 40, 12\] : 10\)/);
  assert.match(ui, /haptic: psoHaptic/);
  assert.equal(/haptic:\s*\(\)\s*=>\s*\{\s*\}/.test(ui), false);
});

test("round 5a bubble and table surfaces", async (t) => {
  if (!CHROME) { t.skip("system Chrome is not available"); return; }
  let pw;
  try { pw = await import("playwright-core"); } catch { t.skip("playwright-core is not available"); return; }
  const server = await ensureStaticServer(root);
  const base = "http://127.0.0.1:" + server.port;
  const browser = await pw.chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-gpu"] });
  try {
    const bubble = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await bubble.goto(base + "/index.html", { waitUntil: "domcontentloaded" });
    await bubble.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("bb-bubble-craps-v1", JSON.stringify({
        settings: {
          sound: false, autoRoll: false, tutorOn: false, reduced: true, badgeToasts: false,
          seenBlaze: { warm: true, hot: true, blazing: true }, chip: 500, haptics: true,
        },
        game: null, allRolls: [],
      }));
    });
    await bubble.reload({ waitUntil: "domcontentloaded" });
    await bubble.locator("button.tab", { hasText: "Learn" }).click();
    await bubble.locator(".lingo-lrow").click();
    await bubble.locator(".lingo-term[data-id='field']").click();
    const show = bubble.locator("#lingo-card [data-act='lingo-show']");
    await show.waitFor();
    assert.equal((await show.innerText()).trim(), "Show me on the board");
    assert.equal(await show.isDisabled(), false);
    await bubble.locator(".lingo-term[data-id='toke']").click();
    const toke = bubble.locator("#lingo-card [data-act='lingo-show']");
    assert.equal(await toke.isDisabled(), true);
    assert.match((await bubble.locator("#lingo-card .lingo-note").allInnerTexts()).join(" "), /no tip|toke/i);
    await bubble.locator(".lingo-term[data-id='dont_pass']").click();
    assert.doesNotMatch(await bubble.locator("#lingo-card").innerText(), /there's no Don't side/);
    await bubble.locator("button.tab", { hasText: "Play" }).click();
    await bubble.waitForSelector("[data-kind='pass']");

    const pass = bubble.locator("[data-act='bet'][data-kind='pass']");
    const spot = await pass.evaluate((el) => ({
      keys: el.getAttribute("aria-keyshortcuts"),
      popup: el.getAttribute("aria-haspopup"),
      label: el.getAttribute("aria-label") || "",
    }));
    assert.equal(spot.keys, "L Shift+F10");
    assert.equal(spot.popup, "dialog");
    assert.match(spot.label, /Long-press for lingo/);
    await pass.focus();
    await bubble.keyboard.press("l");
    await bubble.waitForSelector(".lingo-sheet");
    const headed = await bubble.evaluate(() => {
      const head = document.querySelector(".lingo-sheet h2");
      return document.activeElement === head;
    });
    assert.equal(headed, true);
    await bubble.keyboard.press("Escape");
    await bubble.waitForSelector(".lingo-sheet", { state: "detached" });
    const back = await bubble.evaluate(() => document.activeElement && document.activeElement.getAttribute("data-kind"));
    assert.equal(back, "pass");

    await bubble.locator("button[data-act='roll']").focus();
    await bubble.keyboard.press("l");
    assert.equal(await bubble.locator(".lingo-sheet").count(), 0);

    const menu = await bubble.evaluate(() => {
      const el = document.querySelector("[data-act='bet'][data-kind='field']");
      const ev = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
      el.dispatchEvent(ev);
      const head = document.querySelector(".lingo-sheet h2");
      return { prevented: ev.defaultPrevented, open: !!head, focused: document.activeElement === head };
    });
    assert.equal(menu.prevented, true);
    assert.equal(menu.open, true);
    assert.equal(menu.focused, true);
    await bubble.locator(".lingo-sheet .lingo-x").click();

    await bubble.setViewportSize({ width: 568, height: 320 });
    const bubbleGate = await bubble.evaluate(() => {
      const g = document.querySelector(".rotate-gate");
      const field = document.querySelector("[data-kind='field']");
      const r = field.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      const legal = document.querySelector(".legal");
      const lr = legal.getBoundingClientRect();
      const lh = document.elementFromPoint(lr.left + lr.width / 2, lr.top + lr.height / 2);
      return {
        shown: getComputedStyle(g).display !== "none",
        text: g.innerText,
        covered: !!(hit && hit.closest(".rotate-gate")),
        legal: !!(lh && (legal === lh || legal.contains(lh))),
      };
    });
    assert.equal(bubbleGate.shown, true);
    assert.match(bubbleGate.text, /Rotate to portrait/);
    assert.equal(bubbleGate.covered, true);
    assert.equal(bubbleGate.legal, true);

    await bubble.setViewportSize({ width: 390, height: 844 });
    const portrait = await bubble.evaluate(() => getComputedStyle(document.querySelector(".rotate-gate")).display);
    assert.equal(portrait, "none");

    await bubble.setViewportSize({ width: 320, height: 568 });
    await bubble.locator("[data-act='bet'][data-kind='pass']").focus();
    await bubble.keyboard.press("Shift+F10");
    await bubble.waitForSelector(".lingo-sheet");
    const taps = await bubble.evaluate(() => {
      return [...document.querySelectorAll(".lingo-sheet .lingo-btn, .lingo-sheet .lingo-x")].map((el) => {
        const r = el.getBoundingClientRect();
        return { h: r.height, w: r.width };
      });
    });
    assert.ok(taps.length > 0);
    taps.forEach((box) => {
      assert.ok(box.h >= 44, "button height " + box.h);
      assert.ok(box.w >= 44, "button width " + box.w);
    });
    await bubble.locator("button.dot[aria-label='Dice']").click();
    await bubble.waitForFunction(() => !!document.querySelector(".dome-billy"));
    const mascot = await bubble.evaluate(() => {
      function shown(el) {
        if (!el) return false;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const on = r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
        return on && cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.2 && r.width > 2 && r.height > 2;
      }
      const billy = document.querySelector(".dome-billy");
      const plate = document.querySelector(".lingo-plate img");
      const live = [...document.querySelectorAll("img")].filter((img) => {
        return /mascots\/dealer-billy/.test(img.getAttribute("src") || "") && shown(img) && !img.closest(".homebtn, .hud");
      }).map((img) => img.className + " " + (img.getAttribute("src") || "").split("/").pop());
      return {
        hidden: getComputedStyle(billy).visibility === "hidden",
        plate: shown(plate),
        live,
      };
    });
    assert.equal(mascot.hidden, true);
    assert.equal(mascot.plate, true);
    assert.deepEqual(mascot.live, [" billy-A-avatar-round.svg"]);

    const table = await browser.newPage({ viewport: { width: 568, height: 320 } });
    await table.goto(base + "/table/index.html", { waitUntil: "domcontentloaded" });
    await table.evaluate(() => localStorage.clear());
    await table.reload({ waitUntil: "domcontentloaded" });
    await table.waitForFunction(() => window.__tcReady);
    const tableGate = await table.evaluate(() => {
      const g = document.querySelector(".rotate-gate");
      const come = document.querySelector("[data-kind='come']");
      const r = come.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return {
        shown: getComputedStyle(g).display !== "none",
        covered: !!(hit && hit.closest(".rotate-gate")),
      };
    });
    assert.equal(tableGate.shown, true);
    assert.equal(tableGate.covered, true);

    await table.setViewportSize({ width: 390, height: 844 });
    const tablePass = table.locator("[data-act='spot'][data-kind='pass']");
    const tableAria = await tablePass.evaluate((el) => ({
      keys: el.getAttribute("aria-keyshortcuts"),
      label: el.getAttribute("aria-label") || "",
    }));
    assert.equal(tableAria.keys, "L Shift+F10");
    assert.match(tableAria.label, /Long-press for lingo/);
    await tablePass.focus();
    await table.keyboard.press("l");
    await table.waitForSelector(".lingo-sheet");
    await table.keyboard.press("Escape");
    await table.waitForSelector(".lingo-sheet", { state: "detached" });
    assert.equal(await table.evaluate(() => document.activeElement && document.activeElement.getAttribute("data-kind")), "pass");
    await table.locator(".tc-shoot").focus();
    await table.keyboard.press("l");
    assert.equal(await table.locator(".lingo-sheet").count(), 0);

    await table.locator("[data-kind='pass']").click();
    await table.evaluate(() => {
      const seq = [4, 2];
      window.__tcRng = () => (seq.shift() - 0.5) / 6;
    });
    await table.locator("[data-act='go-shooter']").click();
    await table.locator("[data-act='throw']").click();
    await table.waitForFunction(() => /puck-on/.test((document.querySelector(".tc-hud .puck") || {}).src || document.querySelector(".tc-hud .puck").getAttribute("src") || ""));
    await table.evaluate(() => {
      window.__vib = [];
      Object.defineProperty(navigator, "vibrate", {
        configurable: true,
        writable: true,
        value: (pattern) => { window.__vib.push(pattern); return true; },
      });
      const seq = [3, 4];
      window.__tcRng = () => (seq.shift() - 0.5) / 6;
    });
    await table.locator("[data-act='throw']").click();
    await table.waitForFunction(() => window.__vib && window.__vib.length > 0);
    assert.deepEqual(await table.evaluate(() => window.__vib[0]), 10);

    await table.evaluate(() => localStorage.clear());
    await table.reload({ waitUntil: "domcontentloaded" });
    await table.waitForFunction(() => window.__tcReady);
    await table.locator("[data-kind='dontPass']").click();
    await table.evaluate(() => {
      const seq = [4, 2];
      window.__tcRng = () => (seq.shift() - 0.5) / 6;
    });
    await table.locator("[data-act='go-shooter']").click();
    await table.locator("[data-act='throw']").click();
    await table.waitForFunction(() => /puck-on/.test(document.querySelector(".tc-hud .puck").getAttribute("src") || ""));
    await table.evaluate(() => {
      window.__vib = [];
      Object.defineProperty(navigator, "vibrate", {
        configurable: true,
        writable: true,
        value: (pattern) => { window.__vib.push(pattern); return true; },
      });
      const seq = [3, 4];
      window.__tcRng = () => (seq.shift() - 0.5) / 6;
    });
    await table.locator("[data-act='throw']").click();
    await table.waitForFunction(() => window.__vib && window.__vib.some((v) => Array.isArray(v)));
    assert.deepEqual(await table.evaluate(() => window.__vib.find((v) => Array.isArray(v))), [12, 40, 12]);

    async function openPeek(width, height) {
      await table.setViewportSize({ width, height });
      await table.evaluate(() => localStorage.clear());
      await table.reload({ waitUntil: "domcontentloaded" });
      await table.waitForFunction(() => window.__tcReady);
      await table.evaluate(() => {
        const seq = [5, 6];
        window.__tcRng = () => (seq.shift() - 0.5) / 6;
      });
      await table.locator("[data-act='go-shooter']").click();
      await table.locator("[data-act='throw']").click();
      await table.locator(".lingo-call").click();
      await table.waitForSelector(".lingo-peek");
    }

    await openPeek(320, 568);
    const peek = await table.evaluate(() => {
      function lum(css) {
        const m = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const ch = [m[1], m[2], m[3]].map((n) => {
          const s = Number(n) / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
      }
      function contrast(a, b) {
        const hi = Math.max(lum(a), lum(b));
        const lo = Math.min(lum(a), lum(b));
        return (hi + 0.05) / (lo + 0.05);
      }
      function box(el) {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, height: r.height };
      }
      function overlaps(a, b) {
        return a.bottom > b.top + 1 && a.top < b.bottom - 1 && a.right > b.left + 1 && a.left < b.right - 1;
      }
      const card = document.querySelector(".lingo-peek");
      const aka = card.querySelector(".aka");
      const mean = card.querySelector(".mean");
      const bg = getComputedStyle(card).backgroundColor;
      const pr = box(card);
      const result = box(document.querySelector(".result"));
      return {
        ratio: pr.height / innerHeight,
        overlap: overlaps(pr, result),
        aka: contrast(getComputedStyle(aka).color, bg),
        mean: contrast(getComputedStyle(mean).color, bg),
      };
    });
    assert.ok(peek.ratio <= 0.45, "peek " + peek.ratio);
    assert.equal(peek.overlap, false);
    assert.ok(peek.aka >= 4.5, "aka " + peek.aka);
    assert.ok(peek.mean >= 4.5, "mean " + peek.mean);

    await openPeek(932, 430);
    const side = await table.evaluate(() => {
      function box(el) {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width };
      }
      function overlaps(a, b) {
        return a.bottom > b.top + 1 && a.top < b.bottom - 1 && a.right > b.left + 1 && a.left < b.right - 1;
      }
      const card = box(document.querySelector(".lingo-peek"));
      const result = box(document.querySelector(".result"));
      const dock = box(document.querySelector(".tc-dock"));
      return {
        width: card.width / innerWidth,
        resultOverlap: overlaps(card, result),
        dockOverlap: overlaps(card, dock),
        gate: getComputedStyle(document.querySelector(".rotate-gate")).display,
      };
    });
    assert.equal(side.gate, "none");
    assert.ok(side.width <= 0.4, "side panel " + side.width);
    assert.equal(side.resultOverlap, false);
    assert.equal(side.dockOverlap, false);
  } finally {
    await browser.close();
    server.kill();
  }
});
