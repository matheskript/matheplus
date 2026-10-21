import test from "node:test";
import assert from "node:assert/strict";
import { UNTERSTUFE_SEITEN as VOLL } from "../src/unterstufeDaten.js";
import { UNTERSTUFE_SEITEN as LEICHT, istUnterstufeSeite } from "../src/unterstufeSeiten.js";

test("unterstufeSeiten.js ist aktuell (sonst: node scripts/unterstufe-seiten.mjs)", () => {
  assert.deepEqual(LEICHT, VOLL);
  assert.ok(istUnterstufeSeite("klasse-5"));
  assert.ok(!istUnterstufeSeite("klasse-7"));
});
