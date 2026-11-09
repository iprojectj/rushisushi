import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { minify as minifyHtml } from "html-minifier-terser";
import { minify as minifyJs } from "terser";
import type { Plugin } from "vite";

// A usability-conscious deterrent, not an authentication/security boundary.
export const shortcutGuard = `<script>(function(){if(window.__rushiShortcuts)return;window.__rushiShortcuts=true;document.addEventListener('keydown',function(e){if(e.target instanceof Element&&e.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;var k=e.key.toLowerCase();if(k==='f12'||((e.ctrlKey||e.metaKey)&&((!e.shiftKey&&(k==='u'||k==='s'))||(e.shiftKey&&['i','j','c'].includes(k)))))e.preventDefault();},true);})();</script>`;

const obsoleteCopies = new Set([
  "v99-core-secure-app.js", "payment-blindado.js", "obrigado-blindado.js",
]);

export function isPrivateCopy(path: string): boolean {
  const name = basename(path);
  return /\.bak\.html$/i.test(name) || /\.map$/i.test(name) || obsoleteCopies.has(name);
}

export function addShortcutGuard(html: string): string {
  return html.replace(/<head\b[^>]*>/i, (head) => `${head}${shortcutGuard}`);
}

export async function compactHtml(html: string): Promise<string> {
  return minifyHtml(html, {
    removeComments: true,
    // Preserve inter-element spaces, quoted attributes, IDs and global functions.
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyCSS: true,
    minifyJS: { compress: false, mangle: { toplevel: false }, format: { comments: false } },
  });
}

export function publicProtectionPlugin(): Plugin {
  let publicDir = "";
  let production = false;
  return {
    name: "rushi-public-protection",
    enforce: "pre",
    configResolved(config) {
      publicDir = resolve(config.publicDir);
      production = config.command === "build";
    },
    async load(id) {
      const [file, query] = id.split("?");
      if (!file || query !== "raw" || !file.endsWith(".html") || !file.startsWith(`${publicDir}/`)) return;
      const guarded = addShortcutGuard(await readFile(file, "utf8"));
      return `export default ${JSON.stringify(production ? await compactHtml(guarded) : guarded)};`;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? "").split("?")[0] ?? "";
        if (!isPrivateCopy(path)) return next();
        res.statusCode = 404;
        res.end("Not found");
      });
    },
  };
}

// Build-time only: never import these Node dependencies into application routes.
export async function protectPublishedAssets(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await protectPublishedAssets(path);
    } else if (isPrivateCopy(path)) {
      await rm(path);
    } else if (entry.name.endsWith(".html")) {
      const source = await readFile(path, "utf8");
      const guarded = source.includes("__rushiShortcuts") ? source : addShortcutGuard(source);
      await writeFile(path, await compactHtml(guarded));
    } else if (entry.name.endsWith(".js")) {
      const result = await minifyJs(await readFile(path, "utf8"), {
        compress: false, mangle: { toplevel: false }, format: { comments: false },
      });
      if (result.code === undefined) throw new Error(`Failed to compact ${entry.name}`);
      await writeFile(path, result.code);
    }
  }
}