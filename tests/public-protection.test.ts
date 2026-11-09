import { describe, expect, it } from "bun:test";
import { readFile, mkdtemp, mkdir, access, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Script, runInNewContext } from "node:vm";
import { addShortcutGuard, compactHtml, protectPublishedAssets, shortcutGuard } from "../build/public-protection";

describe("public protection", () => {
  it("blocks source/save shortcuts but preserves form editing and ordinary keys", () => {
    let listener: ((event: object) => void) | undefined;
    class Element { constructor(public editable = false) {} closest() { return this.editable ? this : null; } }
    runInNewContext(shortcutGuard.replace(/^<script>|<\/script>$/g, ""), {
      window: {}, Element,
      document: { addEventListener: (_name: string, fn: (event: object) => void) => { listener = fn; } },
    });
    if (!listener) throw new Error("Shortcut listener was not registered");
    const dispatch = (key: string, ctrlKey = false, shiftKey = false, editable = false) => {
      let blocked = false;
      listener?.({ key, ctrlKey, shiftKey, metaKey: false, target: new Element(editable), preventDefault: () => { blocked = true; } });
      return blocked;
    };
    expect(dispatch("u", true)).toBe(true);
    expect(dispatch("I", true, true)).toBe(true);
    expect(dispatch("F12")).toBe(true);
    expect(dispatch("s", true)).toBe(true);
    expect(dispatch("u", true, false, true)).toBe(false);
    expect(dispatch("c", true)).toBe(false);
    expect(dispatch("Tab")).toBe(false);
  });

  for (const file of ["index", "pedido", "obrigado", "reembolso-solicitado", "mx/index", "mx/pedido", "mx/gracias", "mx/reembolso"]) {
    it(`compacts ${file} while retaining parseable scripts`, async () => {
      const original = await readFile(`public/${file}.html`, "utf8");
      const compact = await compactHtml(addShortcutGuard(original));
      expect(compact.length).toBeLessThan(original.length);
      for (const match of compact.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (/src=|application\/ld\+json/i.test(match[1] ?? "")) continue;
        new Script(match[2] ?? "");
      }
    });
  }

  it("excludes backups/maps from publication without deleting source originals", async () => {
    const dir = await mkdtemp(join(tmpdir(), "rushi-protection-"));
    try {
      await mkdir(join(dir, "js"));
      await writeFile(join(dir, "index.html"), "<html><head></head><body>Menu</body></html>");
      await writeFile(join(dir, "index.bak.html"), "backup");
      await writeFile(join(dir, "js/site.js.map"), "{}");
      await protectPublishedAssets(dir);
      await expect(access(join(dir, "index.bak.html"))).rejects.toThrow();
      await expect(access(join(dir, "js/site.js.map"))).rejects.toThrow();
      expect(await readFile(join(dir, "index.html"), "utf8")).toContain("__rushiShortcuts");
      await access("public/index.bak.html");
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
});