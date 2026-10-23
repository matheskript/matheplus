import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { VIDEO_LEKTIONEN } from "../src/videoLeicht.js";
import { videoLektionen } from "../scripts/video-leicht.mjs";

test("Leichte Kopie der Videokurse ist aktuell (node scripts/video-leicht.mjs)", async () => {
  assert.deepEqual(VIDEO_LEKTIONEN, await videoLektionen(), "src/videoLeicht.js veraltet: node scripts/video-leicht.mjs");
});

test("Kurskarten (func1) holen Videoanzahl und nächste Lektion aus dem leichten Modul, nicht aus func15/base5", () => {
  const q = readFileSync(new URL("../src/func1.jsx", import.meta.url), "utf8");
  assert.ok(!q.includes('from "./func15.jsx"'), "func1.jsx darf func15.jsx nicht statisch importieren (Startbündel)");
  const v = readFileSync(new URL("../src/videoStand.js", import.meta.url), "utf8");
  assert.ok(!/from "\.\/(func15|base5)/.test(v));
});
