/**
 * Production bundle. Rewrites the test-build flag and strips every
 * TEST_HOOK block so localhost cannot reach a roll hook.
 */
import { mkdirSync, readFileSync, writeFileSync, cpSync, rmSync, existsSync } from "node:fs";
import { BADGES } from "../js/badges.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
for (const name of ["index.html", "table", "js", "css", "assets", "robots.txt"]) {
  cpSync(join(root, name), join(dist, name), { recursive: true });
}

function strip(text) {
  return text
    .replace(/\/\*TEST_HOOK_START\*\/[\s\S]*?\/\*TEST_HOOK_END\*\//g, "")
    .replace("export const TEST_BUILD = true;", "export const TEST_BUILD = false;");
}

for (const rel of ["js/build-flags.mjs", "js/ui.mjs", "js/table-ui.mjs", "js/iap.mjs"]) {
  const path = join(dist, rel);
  writeFileSync(path, strip(readFileSync(path, "utf8")));
}

const fullLingo = JSON.parse(readFileSync(join(dist, "js/lingo.json"), "utf8"));
writeFileSync(join(dist, "js/lingo.table.json"), JSON.stringify(fullLingo));
const bubbleLingo = {
  ...fullLingo,
  terms: fullLingo.terms.filter((t) => (t.apps || []).includes("bubble")),
};
writeFileSync(join(dist, "js/lingo.json"), JSON.stringify(bubbleLingo));
const tableMod = readFileSync(join(dist, "js/lingo.mjs"), "utf8")
  .replace('from "./lingo.json"', 'from "./lingo.table.json"');
writeFileSync(join(dist, "js/lingo-table.mjs"), tableMod);
if (/fire_bet/.test(JSON.stringify(bubbleLingo))) throw new Error("Fire left in the Bubble glossary");
if (!/fire_bet/.test(JSON.stringify(fullLingo))) throw new Error("Fire missing from the Table glossary");
if (!/lingo\.table\.json/.test(tableMod)) throw new Error("table lingo module still reads the Bubble file");

const flags = readFileSync(join(dist, "js/build-flags.mjs"), "utf8");
const ui = readFileSync(join(dist, "js/ui.mjs"), "utf8");
const engine = readFileSync(join(dist, "js/engine.mjs"), "utf8");
const iap = readFileSync(join(dist, "js/iap.mjs"), "utf8");
if (!/TEST_BUILD = false/.test(flags)) throw new Error("flag not stripped");
if (/__bb/.test(ui)) throw new Error("hook left in ui");
if (/Math\.random\(/.test(engine)) throw new Error("Math.random left in engine");
if (/setItem\(KEY/.test(iap) || /TEST-ONLY STUB/.test(iap)) throw new Error("iap stub left in dist");
for (const b of BADGES) {
  for (const suf of ["", "-locked", "-hidden", "-small", "-locked-small", "-hidden-small"]) {
    if (!existsSync(join(dist, "assets/badges", b.id + suf + ".svg"))) {
      throw new Error("missing badge SVG in dist: " + b.id + suf + ".svg");
    }
  }
}
console.log("dist ready");
