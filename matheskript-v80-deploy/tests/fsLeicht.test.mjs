import test from "node:test";
import assert from "node:assert/strict";
import { FS_ALLE, FS_BEREICHE } from "../src/fsIndex.js";
import { FS_LEICHT, FS_BEREICHE_LEICHT } from "../src/fsLeicht.js";
import { readFileSync } from "node:fs";

test("Leichter Formel-Index ist aktuell (node scripts/fs-leicht.mjs)", () => {
  const soll = FS_ALLE.map((f) => ({ id: f.id, n: f.n, k: f.k || "", g: f.g || "", bereich: f.bereich }));
  assert.deepEqual(FS_LEICHT, soll, "src/fsLeicht.js veraltet: node scripts/fs-leicht.mjs");
  assert.deepEqual(FS_BEREICHE_LEICHT, FS_BEREICHE.map((b) => ({ id: b.id, name: b.name, kurz: b.kurz || "" })));
  const q = readFileSync(new URL("../src/suche.js", import.meta.url), "utf8");
  assert.ok(!q.includes('from "./fsIndex.js"'), "suche.js darf die ganze Formelsammlung nicht importieren (Startbündel)");
});
