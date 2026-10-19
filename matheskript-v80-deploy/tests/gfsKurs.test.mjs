import { test } from "node:test";
import assert from "node:assert/strict";
import { KLASSEN, THEMEN, themenFuer, LEITFADEN, MEILENSTEINE, zeitplan } from "../src/gfsKurs.js";
import { SEITEN } from "../src/pfade.js";

test("Jedes gelistete Thema hat Klasse, Buchstelle und eine Seite mit Pfad", () => {
  const ansichten = new Set(SEITEN.map((s) => s.ansicht));
  for (const t of THEMEN) {
    assert.ok(KLASSEN.includes(t.klasse), t.id);
    assert.ok(t.kapitel && t.seite > 0 && t.titel && t.kurz && t.frage, t.id);
    assert.ok(ansichten.has(t.ansicht), `kein Pfad für ${t.ansicht}`);
  }
  assert.equal(themenFuer(10)[0].id, "pascal");
  assert.deepEqual(themenFuer(8), []);
});

test("Leitfaden: sieben Schritte, jeder mit Frage, drei Absätzen und Checkliste", () => {
  assert.equal(LEITFADEN.length, 7);
  LEITFADEN.forEach((s, i) => {
    assert.equal(s.nr, i + 1);
    assert.ok(s.frage.endsWith("?") && s.absaetze.length === 3 && s.check.length === 3, s.id);
  });
  assert.deepEqual(MEILENSTEINE.filter((m) => m.schritt).map((m) => m.schritt), LEITFADEN.map((s) => s.id));
});

test("Zeitplan: vier Wochen rückwärts, enger Termin wird gestaucht, Vergangenheit erkannt", () => {
  const p = zeitplan("2026-11-20", "2026-10-19");
  assert.equal(p.rest, 32);
  assert.equal(p.gestaucht, false);
  assert.equal(p.schritte[0].iso, "2026-10-23");
  assert.equal(p.schritte.at(-1).iso, "2026-11-20");
  assert.equal(p.schritte.at(-1).anzeige, "Fr, 20.11.");
  assert.ok(p.schritte.every((m, i, a) => i === 0 || m.datum >= a[i - 1].datum), "aufsteigend");
  const eng = zeitplan("2026-10-29", "2026-10-19");
  assert.equal(eng.rest, 10);
  assert.ok(eng.gestaucht);
  assert.equal(eng.schritte[0].iso, "2026-10-19");
  assert.ok(eng.schritte[0].heute);
  assert.ok(zeitplan("2026-10-01", "2026-10-19").vorbei);
  assert.equal(zeitplan("quatsch", "2026-10-19"), null);
});
