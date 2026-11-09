/**
 * Publish-time deterrence for the legacy storefront HTML.
 * Lives outside `build/` because that folder name is treated as build output and gets wiped.
 * NOTE: this only discourages casual copying; it is never an authorization mechanism.
 */
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Plugin } from "vite";

/** Blocks view-source/devtools/save shortcuts outside editable fields. */
export const shortcutGuard = `<script>(function(){if(window.__rushiShortcuts)return;window.__rushiShortcuts=1;document.addEventListener("keydown",function(e){var t=e.target;if(t&&t instanceof Element&&t.closest("input,textarea,select,[contenteditable]"))return;var k=String(e.key||"").toLowerCase(),c=e.ctrlKey||e.metaKey;if(k==="f12"||(c&&(k==="u"||k==="s"))||(c&&e.shiftKey&&(k==="i"||k==="j"||k==="c"))){e.preventDefault();}},true);})();</script>`;

export function addShortcutGuard(html: string): string {
  if (html.includes("__rushiShortcuts")) return html;
  return /<\/head>/i.test(html) ? html.replace(/<\/head>/i, `${shortcutGuard}</head>`) : shortcutGuard + html;
}

/** Conservative compaction: leaves script/style/pre/textarea bodies untouched. */
export async function compactHtml(html: string): Promise<string> {
  const parts = html.split(/(<(script|style|pre|textarea)\b[\s\S]*?<\/\2>)/gi);
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i] ?? "";
    if (i % 3 === 2) continue; // captured tag name
    if (i % 3 === 1) { out += part; continue; }
    out += part
      .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/\n{2,}/g, "\n");
  }
  return out;
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else files.push(p);
  }
  return files;
}

/** Removes backups/maps and guards+compacts HTML in the published output only. */
export async function protectPublishedAssets(publicDir: string): Promise<void> {
  let files: string[];
  try { files = await walk(publicDir); } catch { return; }
  for (const file of files) {
    if (/\.bak\.html$|\.map$/i.test(file)) { await rm(file, { force: true }); continue; }
    if (/\.html$/i.test(file)) {
      const html = await readFile(file, "utf8");
      await writeFile(file, await compactHtml(addShortcutGuard(html)));
    }
  }
}

/** Vite plugin placeholder kept for config symmetry; serves nothing extra in dev. */
export function publicProtectionPlugin(): Plugin {
  return { name: "rushi-public-protection", apply: "build" };
}
