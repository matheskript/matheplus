/* Gemeinsamer Kern des Modus „Üben“ (src/uebenKern.js): falsche Optionen filtern und mischen,
   feste Ränge, sichtbare Auswahl, Layout-Regel 2 × 2 / drei untereinander, alte Modus-Namen. */
import test from "node:test";
import assert from "node:assert/strict";
import { falscheOptionen, uebenSchritt, sichtbareOptionen, uebenLayout, modusNeu, aufAnhieb, UEBEN_MODI } from "../src/uebenKern.js";

test("Modi und alte Namen", () => {
  assert.deepEqual(UEBEN_MODI.map((m) => m.name), ["Auto", "Üben", "Lernen"]);
  assert.equal(modusNeu("training"), "lernen");
  assert.equal(modusNeu("rechnen"), "auto");
  assert.equal(modusNeu("auto"), "auto");
  assert.equal(modusNeu("ueben"), "ueben");
  assert.equal(modusNeu(undefined), "lernen");
  assert.equal(modusNeu(undefined, "auto"), "auto");
});

test("falsche Optionen: nur verschiedene, lesbare, wirklich falsche – höchstens drei", () => {
  const richtig = { z: 4 };
  const kand = [{ wert: { z: 4 } }, { wert: { z: 5 }, hinweis: "eins zu viel" }, { wert: { z: 5 } }, { wert: { z: 8 }, hinweis: "verdoppelt" },
    { wert: { z: NaN } }, { wert: { z: 3 } }, { wert: { z: 2 } }, { wert: { z: 4.0000001 } }];
  const f = falscheOptionen(richtig, kand, { pruefe: (w) => ({ ok: Math.abs(w.z - 4) < 1e-3, hinweis: `nicht ${w.z}` }), lesbar: (w) => Number.isFinite(w.z), zufall: () => 0.3 });
  assert.equal(f.length, 3);
  const z = f.map((o) => o.wert.z);
  assert.ok(z.every((v) => [5, 8, 3, 2].includes(v)));
  assert.equal(new Set(z).size, 3);
  assert.ok(f.every((o) => o.hinweis));   // Hinweis aus Kandidat oder aus der Prüfung
});

test("Ränge: richtige Zeile immer dabei, Reihenfolge stabil für jede Anzeigegröße", () => {
  let i = 0; const zufall = () => [0.7, 0.2, 0.9, 0.4][i++ % 4];
  const s = uebenSchritt({ richtig: { t: "r" }, falsche: [{ wert: { t: "a" }, hinweis: "a" }, { wert: { t: "b" }, hinweis: "b" }, { wert: { t: "c" }, hinweis: "c" }], zufall });
  assert.equal(s.optionen[0].richtig, true);
  for (const k of [2, 3, 4]) {
    const sicht = sichtbareOptionen(s, k);
    assert.equal(sicht.length, k);
    assert.equal(sicht.filter((o) => o.richtig).length, 1);
    for (let j = 1; j < sicht.length; j++) assert.ok(sicht[j - 1].rang <= sicht[j].rang);
  }
  // Nur zwei vorhanden → zwei, auch wenn vier Platz hätten
  const s2 = uebenSchritt({ richtig: { t: "r" }, falsche: [{ wert: { t: "a" }, hinweis: "a" }] });
  assert.equal(sichtbareOptionen(s2, 4).length, 2);
});

test("Layout: kurz → 2 × 2, lang → drei untereinander und flacher", () => {
  assert.deepEqual(uebenLayout({ breite: 328, breiten: [60, 70, 80, 50] }), { anzahl: 4, spalten: 2, kompakt: false });
  assert.deepEqual(uebenLayout({ breite: 328, breiten: [60, 70, 140, 50] }), { anzahl: 3, spalten: 1, kompakt: true });
  assert.deepEqual(uebenLayout({ breite: 900, breiten: [60, 70, 140, 50] }), { anzahl: 4, spalten: 2, kompakt: false });
  assert.deepEqual(uebenLayout({ breite: 328, breiten: [30, 30, 30] }), { anzahl: 3, spalten: 3, kompakt: false });
  assert.deepEqual(uebenLayout({ breite: 328, breiten: [80, 90, 70] }), { anzahl: 3, spalten: 1, kompakt: true });
  assert.deepEqual(uebenLayout({ breite: 328, breiten: [80, 90] }), { anzahl: 2, spalten: 2, kompakt: false });
  assert.deepEqual(uebenLayout({ breite: 328, breiten: [180, 90] }), { anzahl: 2, spalten: 1, kompakt: false });
});

test("Bilanz auf Anhieb", () => {
  assert.equal(aufAnhieb({ 1: ["x"], 3: [] }, 4), 3);
  assert.equal(aufAnhieb({}, 0), 0);
});
