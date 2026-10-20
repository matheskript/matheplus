/* Startseite A/B (src/startVariante.js): Pfade /start-a, /start-b (und Aliasse) wählen die Fassung;
   ohne Wahl gilt A. Fassung B (funcStartseiteB.jsx) trägt dieselben Ziele wie A (func2.jsx). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { START_VARIANTEN, startVariante, varianteAusPfad } from "../src/startVariante.js";

const quelle = (f) => readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8");

test("Pfade /start-a und /start-b (auch startseite-, frontpage-) wählen die Fassung", () => {
  assert.equal(varianteAusPfad("/start-b"), "b");
  assert.equal(varianteAusPfad("/start-a/"), "a");
  assert.equal(varianteAusPfad("/Startseite-B?x=1"), "b");
  assert.equal(varianteAusPfad("/frontpage-a#oben"), "a");
  assert.equal(varianteAusPfad("/"), null);
  assert.equal(varianteAusPfad("/start-c"), null);
  assert.equal(varianteAusPfad("/elternabend"), null);
  assert.deepEqual(START_VARIANTEN, ["a", "b"]);
});

test("Ohne Browser-Speicher gilt Fassung A", () => {
  assert.equal(startVariante(), "a");
});

test("Fassung B führt zu denselben Zielen wie Fassung A", () => {
  /* Nur das, was A wirklich rendert: ab dem Banner im return der Startseite (die Demo-Blöcke davor sind nicht eingebunden) */
  const q = quelle("func2.jsx");
  const von = q.indexOf("{/* Banner ganz oben");
  const a = q.slice(von, q.indexOf("/* ---------- Polynomplotter ----------", von));
  const b = quelle("funcStartseiteB.jsx");
  const ziele = [...a.matchAll(/gehe\(\{ ansicht: "([a-z0-9]+)"/g)].map((m) => m[1]);
  assert.ok(ziele.length > 10);
  for (const z of new Set(ziele)) assert.ok(b.includes(`ansicht: "${z}"`), `Fassung B kennt das Ziel „${z}“ nicht`);
});

test("Fassung A bleibt unverändert: Startseite in func2.jsx ohne Bezug auf die Fassung B", () => {
  const a = quelle("func2.jsx");
  assert.ok(!a.includes("StartseiteB"));
  assert.ok(!a.includes("startVariante"));
});
