import test from "node:test";
import assert from "node:assert/strict";
import { istChunkFehler, neuLadenErlaubt, NEULADEN_ABSTAND_MS } from "../src/chunkFehler.js";

test("erkennt Chunk-Ladefehler der gängigen Browser", () => {
  assert.equal(istChunkFehler(new TypeError("Failed to fetch dynamically imported module: https://x/assets/func14-ab12.js")), true);
  assert.equal(istChunkFehler(new TypeError("error loading dynamically imported module: https://x/a.js")), true);
  assert.equal(istChunkFehler(new TypeError("Importing a module script failed.")), true);
  assert.equal(istChunkFehler(new Error("Unable to preload CSS for /assets/a.css")), true);
  const ce = new Error("Loading chunk 7 failed."); ce.name = "ChunkLoadError";
  assert.equal(istChunkFehler(ce), true);
});

test("andere Fehler sind keine Chunk-Fehler", () => {
  assert.equal(istChunkFehler(new TypeError("Cannot read properties of undefined (reading 'x')")), false);
  assert.equal(istChunkFehler(new ReferenceError("Cannot access 'X' before initialization")), false);
  assert.equal(istChunkFehler(null), false);
  assert.equal(istChunkFehler(undefined), false);
});

test("automatisches Neuladen höchstens einmal je Abstand (keine Endlosschleife)", () => {
  const t = 1_000_000;
  assert.equal(neuLadenErlaubt(t, null), true);
  assert.equal(neuLadenErlaubt(t, "abc"), true);
  assert.equal(neuLadenErlaubt(t, t - 1000), false);
  assert.equal(neuLadenErlaubt(t, t - NEULADEN_ABSTAND_MS), true);
});
