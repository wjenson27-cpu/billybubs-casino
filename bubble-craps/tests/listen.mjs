import net from "node:net";
import http from "node:http";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const STATIC_PORT = 8765;
const PORTS = [8765, 8766, 8767, 8768, 8769, 8770];
const MARKER = "js/table-ui.mjs";

function portOpen(port) {
  return new Promise((resolve) => {
    const sock = net.connect({ port, host: "127.0.0.1" }, () => {
      sock.end();
      resolve(true);
    });
    sock.on("error", () => resolve(false));
  });
}

function fetchBody(port, path) {
  return new Promise((resolve) => {
    const req = http.get({ host: "127.0.0.1", port, path, timeout: 1500 }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(res.statusCode === 200 ? Buffer.concat(chunks).toString("utf8") : ""));
    });
    req.on("error", () => resolve(""));
    req.on("timeout", () => { req.destroy(); resolve(""); });
  });
}

function markerHash(root) {
  return createHash("sha256").update(readFileSync(join(root, MARKER))).digest("hex");
}

/** True when `port` is serving this checkout, not a stale server from another tree. */
export async function servesRoot(port, root) {
  const remote = await fetchBody(port, "/" + MARKER);
  if (!remote) return false;
  const hash = createHash("sha256").update(remote).digest("hex");
  return hash === markerHash(root);
}

/**
 * One static server for every browser test. Reuses a server only when it
 * serves this checkout. A foreign listener on 8765 is left alone and the
 * suite binds the next free port. kill() is a no-op: the suite wrapper owns
 * the process it started.
 */
export async function ensureStaticServer(root) {
  for (const port of PORTS) {
    if (await portOpen(port)) {
      if (await servesRoot(port, root)) return { port, kill() {} };
      continue;
    }
    const child = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
      cwd: root,
      stdio: "ignore",
      detached: true,
    });
    child.unref();
    await waitForPort(port);
    return { port, kill() {} };
  }
  throw new Error("no free static port");
}

/** Wait until a local static server accepts connections. Avoids reload flakes. */
export function waitForPort(port, ms = 8000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const once = () => {
      const sock = net.connect({ port, host: "127.0.0.1" }, () => {
        sock.end();
        resolve();
      });
      sock.on("error", () => {
        sock.destroy();
        if (Date.now() - start > ms) reject(new Error("server did not listen on " + port));
        else setTimeout(once, 40);
      });
    };
    once();
  });
}
