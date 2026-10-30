/**
 * Settled cube: the face the player sees on top is the engine value.
 * Composes the cube rest matrix with each face matrix. Skips only when
 * Playwright or system Chrome is missing.
 */
import test from "node:test";
import { ensureStaticServer } from "./listen.mjs";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as E from "../js/engine.mjs";

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

test("every settled cube shows the engine face on top", async (t) => {
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
    const page = await browser.newPage({ viewport: { width: 1100, height: 1280 } });
    await page.goto("http://127.0.0.1:" + port + "/index.html", { waitUntil: "networkidle" });
    const report = await page.evaluate(() => {
      const host = document.createElement("div");
      host.id = "sweep";
      host.style.cssText = "position:fixed;inset:0;z-index:80;background:#140F08;display:grid;grid-template-columns:repeat(6,1fr);gap:10px;padding:12px;align-content:start;";
      document.body.appendChild(host);
      const style = document.createElement("style");
      style.textContent = "#sweep .cube3d{--s:64px}#sweep .cube{transition:none !important}";
      document.head.appendChild(style);
      for (let d1 = 1; d1 <= 6; d1++) {
        for (let d2 = 1; d2 <= 6; d2++) {
          const cell = document.createElement("div");
          cell.style.cssText = "display:flex;gap:6px;align-items:center;justify-content:center;color:#FFD36A;font:12px sans-serif;";
          cell.dataset.d1 = String(d1);
          cell.dataset.d2 = String(d2);
          const faces = [1, 2, 3, 4, 5, 6].map((n) => "<i class='f f" + n + "'></i>").join("");
          cell.innerHTML = "<b style='width:28px'>" + (d1 + d2) + "</b>" +
            "<div class='cube3d'><div class='cube' data-face='" + d1 + "'>" + faces + "</div></div>" +
            "<div class='cube3d b'><div class='cube' data-face='" + d2 + "'>" + faces + "</div></div>";
          host.appendChild(cell);
        }
      }
      const det3 = (m) => {
        const ax = m.m11, ay = m.m12, az = m.m13;
        const bx = m.m21, by = m.m22, bz = m.m23;
        const cx = m.m31, cy = m.m32, cz = m.m33;
        return ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx);
      };
      const read = (cube) => {
        const cubeM = new DOMMatrix(getComputedStyle(cube).transform);
        const facing = [];
        const visible = [];
        cube.querySelectorAll(".f").forEach((face) => {
          const hit = String(face.className).match(/f(\d)/);
          if (!hit) return;
          const world = cubeM.multiply(new DOMMatrix(getComputedStyle(face).transform));
          const y = world.m32;
          const z = world.m33;
          const n = Number(hit[1]);
          if (z > 0.15) visible.push(n);
          if (!(y < -0.5 && z > 0.5)) return;
          facing.push({
            n,
            y,
            z,
            upY: -world.m22,
            upZ: -world.m23,
            det: det3(world),
          });
        });
        return { facing, det: det3(cubeM), visible };
      };
      const rows = [];
      host.querySelectorAll("[data-d1]").forEach((cell) => {
        const cubes = cell.querySelectorAll(".cube");
        rows.push({
          d1: Number(cell.dataset.d1),
          d2: Number(cell.dataset.d2),
          a: read(cubes[0]),
          b: read(cubes[1]),
        });
      });
      return rows;
    });
    assert.equal(report.length, 36);
    report.forEach((row) => {
      const cap = E.rollCaption(row.d1, row.d2);
      assert.equal(row.a.facing.length, 1, "one camera-up face on die 1 for " + row.d1 + "+" + row.d2);
      assert.equal(row.b.facing.length, 1, "one camera-up face on die 2 for " + row.d1 + "+" + row.d2);
      const a = row.a.facing[0];
      const b = row.b.facing[0];
      assert.equal(a.n, cap.d1, "die 1 top face for " + row.d1 + "+" + row.d2);
      assert.equal(b.n, cap.d2, "die 2 top face for " + row.d1 + "+" + row.d2);
      assert.ok(a.upY < 0 && b.upY < 0, "pips are upright");
      assert.ok(a.upZ < 0 && b.upZ < 0, "pips tip toward the camera");
      assert.ok(row.a.det > 0.9 && row.b.det > 0.9, "rest pose is a true rotation");
      assert.ok(a.det > 0.9 && b.det > 0.9, "top face is not mirrored");
      [row.a.visible, row.b.visible].forEach((faces) => {
        for (let i = 0; i < faces.length; i++) {
          for (let j = i + 1; j < faces.length; j++) {
            assert.notEqual(faces[i] + faces[j], 7, "visible faces are not opposites");
          }
        }
      });
      assert.equal(cap.total, row.d1 + row.d2);
      assert.equal(cap.hard, row.d1 === row.d2);
    });
    const layout = await page.evaluate(() => {
      const det3 = (m) => {
        const ax = m.m11, ay = m.m12, az = m.m13;
        const bx = m.m21, by = m.m22, bz = m.m23;
        const cx = m.m31, cy = m.m32, cz = m.m33;
        return ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx);
      };
      const host = document.createElement("div");
      host.className = "cube3d";
      host.style.setProperty("--s", "64px");
      const cube = document.createElement("div");
      cube.className = "cube";
      cube.style.transform = "none";
      for (let n = 1; n <= 6; n++) {
        const face = document.createElement("i");
        face.className = "f f" + n;
        cube.appendChild(face);
      }
      host.appendChild(cube);
      document.body.appendChild(host);
      const normals = {};
      cube.querySelectorAll(".f").forEach((face) => {
        const n = Number(String(face.className).match(/f(\d)/)[1]);
        const m = new DOMMatrix(getComputedStyle(face).transform);
        normals[n] = { x: m.m31, y: m.m32, z: m.m33, det: det3(m) };
      });
      host.remove();
      return normals;
    });
    const dot = (p, q) => p.x * q.x + p.y * q.y + p.z * q.z;
    const cross = (p, q) => ({
      x: p.y * q.z - p.z * q.y,
      y: p.z * q.x - p.x * q.z,
      z: p.x * q.y - p.y * q.x,
    });
    assert.ok(dot(layout[1], layout[6]) < -0.9, "1 is opposite 6");
    assert.ok(dot(layout[2], layout[5]) < -0.9, "2 is opposite 5");
    assert.ok(dot(layout[3], layout[4]) < -0.9, "3 is opposite 4");
    assert.ok(layout[3].x < -0.9, "at identity, 3 is on the left");
    assert.ok(layout[4].x > 0.9, "at identity, 4 is on the right");
    for (let n = 1; n <= 6; n++) assert.ok(layout[n].det > 0.9, "face " + n + " transform is a rotation");
    const hand = await page.evaluate(() => {
      const cross = (p, q) => ({
        x: p.y * q.z - p.z * q.y,
        y: p.z * q.x - p.x * q.z,
        z: p.x * q.y - p.y * q.x,
      });
      const dot = (p, q) => p.x * q.x + p.y * q.y + p.z * q.z;
      const host = document.createElement("div");
      host.className = "cube3d";
      host.style.setProperty("--s", "80px");
      const cube = document.createElement("div");
      cube.className = "cube";
      cube.style.transition = "none";
      for (let n = 1; n <= 6; n++) {
        const face = document.createElement("i");
        face.className = "f f" + n;
        cube.appendChild(face);
      }
      host.appendChild(cube);
      document.body.appendChild(host);
      const normalOf = (n) => {
        const face = cube.querySelector(".f" + n);
        const m = new DOMMatrix(getComputedStyle(face).transform);
        return { x: m.m31, y: m.m32, z: m.m33 };
      };
      cube.style.transform = "none";
      const id = {};
      for (let n = 1; n <= 6; n++) id[n] = normalOf(n);
      const n1 = id[1];
      const n2 = id[2];
      const n1xn2 = cross(n1, n2);
      const up = { x: 0, y: -1, z: 0 };
      const front = { x: 0, y: 0, z: 1 };
      const cols = (a, b, c) => new DOMMatrix([
        a.x, a.y, a.z, 0,
        b.x, b.y, b.z, 0,
        c.x, c.y, c.z, 0,
        0, 0, 0, 1,
      ]);
      const R = cols(up, front, cross(up, front)).multiply(cols(n1, n2, n1xn2).inverse());
      cube.style.transform = R.toString();
      const world = {};
      const cubeM = new DOMMatrix(getComputedStyle(cube).transform);
      for (let n = 1; n <= 6; n++) {
        const face = cube.querySelector(".f" + n);
        const m = cubeM.multiply(new DOMMatrix(getComputedStyle(face).transform));
        world[n] = { x: m.m31, y: m.m32, z: m.m33 };
      }
      const triples = [];
      for (let face = 1; face <= 6; face++) {
        cube.dataset.face = String(face);
        cube.style.transform = "";
        const settled = new DOMMatrix(getComputedStyle(cube).transform);
        const normals = {};
        cube.querySelectorAll(".f").forEach((el) => {
          const num = Number(String(el.className).match(/f(\d)/)[1]);
          const w = settled.multiply(new DOMMatrix(getComputedStyle(el).transform));
          normals[num] = { x: w.m31, y: w.m32, z: w.m33 };
        });
        triples.push(dot(normals[1], cross(normals[2], normals[3])));
      }
      host.remove();
      return { world, triples, chirality: dot(world[1], cross(world[2], world[3])) };
    });
    assert.ok(hand.world[1].y < -0.8, "with the corner pose, 1 is on top");
    assert.ok(hand.world[2].z > 0.8, "with the corner pose, 2 is in front");
    assert.ok(hand.world[3].x > 0.8, "1 on top and 2 in front puts 3 on the right");
    assert.ok(hand.world[4].x < -0.8, "4 is on the left of that corner");
    hand.triples.forEach((t, i) => {
      assert.ok(Math.sign(t) === Math.sign(hand.chirality) && Math.abs(t) > 0.9, "rest pose " + (i + 1) + " keeps the right-hand corner");
    });
    if (process.env.BB_SHOTS === "1") {
      mkdirSync(root + "docs/qa/compare", { recursive: true });
      await page.locator("#sweep").screenshot({
        path: root + "docs/qa/compare/run9-dice-36.jpg",
        type: "jpeg",
        quality: 82,
      });
      assert.ok(existsSync(root + "docs/qa/compare/run9-dice-36.jpg"));
    }
  } finally {
    await browser.close();
    server.kill();
  }
});
