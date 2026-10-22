import { test } from "node:test";
import assert from "node:assert/strict";
import { KLASSEN, STUFEN, THEMEN, themenFuer, stufenText, stufeAusKlasse, themenZahl, LEITFADEN, MEILENSTEINE, zeitplan } from "../src/gfsKurs.js";
import { SEITEN } from "../src/pfade.js";

test("Jedes Thema hat Stufe, Klassen, Kapitel und Kurzbeschreibung; gebaute Themen eine Seite mit Pfad", () => {
  const ansichten = new Set(SEITEN.map((s) => s.ansicht));
  const ids = new Set();
  for (const t of THEMEN) {
    assert.ok(!ids.has(t.id), `doppelte id ${t.id}`); ids.add(t.id);
    assert.ok(STUFEN.some((s) => s.id === t.stufe), `${t.id}: Stufe ${t.stufe}`);
    assert.ok(KLASSEN.includes(t.klasse), t.id);
    assert.ok(t.klassen.every((k) => KLASSEN.includes(k)) && t.klassen[0] === t.klasse, t.id);
    assert.ok(t.kapitel && t.kapitelName && t.titel && t.kurz && t.zeile, t.id);
    assert.ok(t.zeile.length <= 90, `${t.id}: Kurzbeschreibung zu lang`);
    if (t.ansicht) {
      assert.ok(t.frage, t.id);
      assert.ok(t.seite === undefined || t.seite > 0, `${t.id}: Buchseite ungültig`);   // Buchseite nur, wenn bekannt – nie geraten
      assert.ok(ansichten.has(t.ansicht), `kein Pfad für ${t.ansicht}`);
      assert.ok(t.videos > 0 || t.animationen > 0, `${t.id}: weder Video noch Animation`);
    }
  }
  assert.equal(themenZahl(), 6);   // Pascal, Dose, Ziegenproblem, Bayes, Platonische Körper, Mischungen
});

test("Jede Stufe hat 5 bis 8 GFS-Themen", () => {
  for (const s of STUFEN) {
    const n = themenFuer(s.id).length;
    assert.ok(n >= 5 && n <= 8, `${s.name}: ${n} Themen`);
  }
  assert.equal(THEMEN.length, STUFEN.reduce((a, s) => a + themenFuer(s.id).length, 0));
});

test("Gebaute Themen stehen in der richtigen Stufe; Kursstufe gilt für G8 und G9", () => {
  assert.ok(themenFuer("10").some((t) => t.id === "pascal"));
  assert.equal(themenFuer("k1")[0].id, "dose");
  // als Klassenzahl: die Dose gehört zu G8 Klasse 11 und G9 Klasse 12
  assert.ok(themenFuer(11).some((t) => t.id === "dose"));
  assert.ok(themenFuer(12).some((t) => t.id === "dose"));
  assert.ok(!themenFuer(13).some((t) => t.id === "dose"));
  assert.equal(stufenText(THEMEN.find((t) => t.id === "dose")), "G8 Klasse 11 · G9 Klasse 12");
  assert.equal(stufenText(THEMEN.find((t) => t.id === "pascal")), "Klasse 10");
  assert.equal(stufenText(THEMEN.find((t) => t.id === "bayes")), "G8 Klasse 12 · G9 Klasse 13");
});

test("Alter Speicherstand (Klasse als Zahl) wird zur Stufe", () => {
  assert.equal(stufeAusKlasse(8), "8");
  assert.equal(stufeAusKlasse(10), "10");
  assert.equal(stufeAusKlasse(11), "k1");
  assert.equal(stufeAusKlasse(12), "k1");
  assert.equal(stufeAusKlasse(13), "k2");
  assert.equal(stufeAusKlasse(null), null);
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
