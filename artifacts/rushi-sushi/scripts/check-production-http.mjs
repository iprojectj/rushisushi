import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, ".output/public");

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? htmlFiles(join(dir, entry.name))
    : entry.name.endsWith(".html") ? [join(dir, entry.name)] : []));
  return files.flat();
}

const portProbe = createServer();
await new Promise((resolve, reject) => {
  portProbe.once("error", reject);
  portProbe.listen(0, "127.0.0.1", resolve);
});
const port = portProbe.address().port;
await new Promise((resolve) => portProbe.close(resolve));

const server = spawn(process.execPath, [".output/server/index.mjs"], {
  cwd: root,
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(port),
    NITRO_PORT: String(port),
    HOST: "127.0.0.1",
    NITRO_HOST: "127.0.0.1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
server.stdout.on("data", (data) => { output = (output + data).slice(-4000); });
server.stderr.on("data", (data) => { output = (output + data).slice(-4000); });
let spawnError;
server.on("error", (error) => { spawnError = error; });
const origin = `http://127.0.0.1:${port}`;

try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (spawnError) throw spawnError;
    if (server.exitCode !== null) throw new Error(`Production server stopped: ${output}`);
    try {
      const response = await fetch(`${origin}/auth`, { signal: AbortSignal.timeout(2000) });
      await response.arrayBuffer();
      if (response.status === 200) { ready = true; break; }
    } catch { /* wait for the production server to listen */ }
    await delay(100);
  }
  assert.ok(ready, `Production server did not become ready: ${output}`);
  assert.match(await readFile(join(publicDir, "index.html"), "utf8"), /__rushiShortcuts/);
  const paths = new Set(["/", "/mx/", "/auth"]);
  for (const file of await htmlFiles(publicDir)) {
    paths.add(`/${relative(publicDir, file).split(sep).map(encodeURIComponent).join("/")}`);
  }
  for (const path of paths) {
    const response = await fetch(`${origin}${path}`, {
      headers: { "accept-encoding": "identity" },
      signal: AbortSignal.timeout(5000),
    });
    assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
    const bytes = (await response.arrayBuffer()).byteLength;
    const declaredLength = response.headers.get("content-length");
    if (declaredLength !== null) {
      assert.equal(bytes, Number(declaredLength), `${path}: response length differs from Content-Length`);
    }
    assert.ok(bytes > 0, `${path}: empty response`);
  }
  console.log(`Production HTTP smoke passed: ${paths.size} pages, complete bodies and consistent Content-Length.`);
} finally {
  server.kill("SIGTERM");
  setTimeout(() => { if (server.exitCode === null) server.kill("SIGKILL"); }, 3000).unref();
}
