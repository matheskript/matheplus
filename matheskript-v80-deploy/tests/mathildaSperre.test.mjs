/* Mathilda AI ist per Klick nur mit Passwort „skript“ erreichbar (Direktlinks bleiben offen). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { istMathildaZiel, PW_HASH } from "../src/seitenKonstanten.js";

const SRC = new URL("../src/", import.meta.url).pathname;

test("Das Passwort „skript“ passt zum gespeicherten Hash (klein geschrieben)", () => {
  assert.equal(createHash("sha256").update("skript").digest("hex"), PW_HASH);
});

test("Alle Mathilda-Ziele sind gesperrt, andere Seiten nicht", () => {
  for (const foto of ["blatt", "weg", "aufgabe", "chat"]) assert.ok(istMathildaZiel({ ansicht: "analyse", foto }), foto);
  assert.ok(istMathildaZiel({ ansicht: "klausurbriefkasten" }));
  assert.ok(istMathildaZiel({ ansicht: "textaufgaben", seite: "mathilda" }));
  assert.ok(!istMathildaZiel({ ansicht: "textaufgaben", seite: "training" }));
  assert.ok(!istMathildaZiel({ ansicht: "textaufgaben" }));
  assert.ok(!istMathildaZiel({ ansicht: "start" }));
  assert.ok(!istMathildaZiel({ ansicht: "kurvendiskussion" }));
  assert.ok(!istMathildaZiel(null));
});

test("gehe() prüft die Sperre; Adresse und Zurück-Taste sind ausgenommen", () => {
  const s = readFileSync(SRC + "func10.jsx", "utf8");
  assert.match(s, /!eintrag\.ausAdresse && istMathildaZiel\(eintrag\) && !istFrei\(\)/);
  assert.match(s, /ausAdresse: true/);
  assert.match(s, /gehe\(\{ \.\.\.pz, ausAdresse: true \}\)/);   // Direktlink beim Start
  assert.match(s, /<SperreDialog/);
});
