/* GFS · Die optimale Dose (gfsDose.js) */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PI, dk, lies, optimaleDose, oberflaeche, hoeheAus, mehrverbrauch,
  ARTEN, aufgabe, aufgabeTex, pruefe, rechenweg, tipp,
  BUCH_ARTEN, buchAufgabe, buchAuftrag, buchFelder, buchPruefe, buchRechenweg, buchTipp, buchHinweis,
  BEGRUENDUNGEN, gemischt, ADAPTION, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "../src/gfsDose.js";

/* Dieselben Muster wie tests/a5.test.mjs – nichts bleibt unvereinfacht stehen */
const N = String.raw`\d+(?:[.,]\d+)?`;
const A5 = [
  new RegExp(String.raw`(?:^|=)\s*${N}\s*[+−\-]\s*${N}\s*$`), new RegExp(String.raw`(?:^|=)\s*${N}\s*(?:·|\\cdot|\*)\s*${N}\s*$`),
  /(^|[^\d.,\w])1\s*(?:·|\\cdot)?\s*x(?![\w])/, /\+\s*[−-]\s*\d/, /[−-]\s*[−-]\s*\d/, /(?:·|\\cdot)\s*1(?![\d,.\/^])/, /[+−-]\s*0(?![\d,.])\s*$/,
  /(?<!_\{[^}]*\}|_-?\d)\^\{?1\}?(?![\d])/,
];
const a5ok = (z) => A5.every((m) => !m.test(z));

test("Dose: Buchwerte werden reproduziert, h = 2r, Mehrverbrauch > 0", () => {
  const d = optimaleDose(330);
  assert.equal(dk(d.r), "3,74"); assert.equal(dk(d.h), "7,49"); assert.equal(dk(d.O), "264,36");
  assert.ok(Math.abs(d.h - 2 * d.r) < 1e-12);
  assert.ok(Math.abs(oberflaeche(d.r, 330) - d.O) < 1e-9);
  assert.ok(Math.abs(hoeheAus(3.3, 330) - 330 / (PI * 3.3 * 3.3)) < 1e-12);
  assert.ok(mehrverbrauch(3.3, 330) > 0 && mehrverbrauch(3.3, 330) < 2);
  assert.ok(Math.abs(mehrverbrauch(d.r, 330)) < 1e-9);
  // Varianten: offen h = r, dick h = 4r
  const o = optimaleDose(500, 1), k = optimaleDose(500, 4);
  assert.ok(Math.abs(o.h - o.r) < 1e-12 && Math.abs(k.h - 4 * k.r) < 1e-12);
  assert.equal(lies("3,74"), 3.74); assert.equal(lies("−2"), -2); assert.equal(lies("abc"), null);
});

const richtig = (a) => {
  if (a.art === "zielfunktion") return 0;
  if (a.art === "dose") return { r: dk(a.r), h: dk(a.h), O: dk(a.O) };
  if (a.art === "rueckwaerts") return { V: dk(a.V), h: dk(a.h) };
  return { h: dk(a.h), O: dk(a.O), prozent: dk(a.prozent, 1) };
};

test("Grundtypen: lösbar, richtig geprüft, Rechenweg A5-sauber", () => {
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) for (let i = 0; i < 150; i++) {
    const a = aufgabe(id, s);
    assert.equal(pruefe(a, richtig(a)).ok, true, `${id} ${s} ${JSON.stringify(a)}`);
    assert.ok(aufgabeTex(a).length > 3 && tipp(a).length > 10);
    for (const z of rechenweg(a)) assert.ok(a5ok(z), z);
    if (s <= 2) assert.ok(a.V === undefined || (a.V !== 330 && a.V !== 150), "Buchvolumen nur ab Stufe 3");
  }
  const z = aufgabe("zielfunktion", 2);
  assert.equal(pruefe(z, 1).ok, false); assert.ok(pruefe(z, 1).grund.length > 10);
  assert.deepEqual([...z.reihenfolge].sort(), [0, 1, 2, 3]);
  const d = aufgabe("dose", 3);
  const falsch = pruefe(d, { r: dk(d.r), h: dk(d.r), O: dk(d.O) });
  assert.equal(falsch.ok, false); assert.equal(falsch.felder.h, false); assert.equal(falsch.felder.r, true);
});

const buchRichtig = (a) => Object.fromEntries(buchFelder(a).map(([k]) => [k, dk(a[k])]));

test("Buchübungen: jede Variante lösbar, Stufe 1–2 ohne Buchzahlen, Rechenweg A5-sauber", () => {
  for (const { id } of BUCH_ARTEN) {
    if (id === "begruenden") continue;
    for (let s = 1; s <= 5; s++) for (let i = 0; i < 150; i++) {
      const a = buchAufgabe(id, s);
      assert.equal(buchPruefe(a, buchRichtig(a)).ok, true, `${id} ${s} ${JSON.stringify(a)}`);
      assert.ok(buchAuftrag(a).length > 30 && buchTipp(a).length > 10 && buchHinweis(a).length > 3, id);
      assert.ok(buchRechenweg(a).length >= 2);
      for (const z of buchRechenweg(a)) assert.ok(a5ok(z), z);
      if (s <= 2) {
        if (id === "flugzeug") assert.notEqual(a.V, 150);
        if (id === "zaun") assert.notEqual(a.L, 50);
        if (id === "beet") assert.notEqual(a.A, 400);
        if (id === "quader") assert.notEqual(a.V, 1000);
        if (id === "zelt") assert.notEqual(a.st, 3);
        assert.ok(["geschlossen", "frei", "pyramide", "dreieck"].includes(a.variante), "Stufe 1–2 nur Grundvariante");
      }
    }
  }
});

test("Buchübungen: Mathematik stimmt (Ableitung null, Varianten-Verhältnisse)", () => {
  const num = (f, x) => (f(x + 1e-6) - f(x - 1e-6)) / 2e-6;
  const z = buchAufgabe("zaun", 3);                                  // Wand: a = 2b
  assert.ok(Math.abs(z.a - 2 * z.b) < 1e-9 && Math.abs(num((b) => (z.L - 2 * b) * b, z.b)) < 1e-6);
  const b = buchAufgabe("beet", 3);
  assert.ok(Math.abs(b.a - 2 * b.b) < 1e-9 && Math.abs(num((x) => b.A / x + 2 * x, b.b)) < 1e-5);
  const q = buchAufgabe("quader", 3);                                // offen: h = a/2
  assert.ok(Math.abs(q.h - q.a / 2) < 1e-9 && Math.abs(num((x) => x * x + 4 * q.V / x, q.a)) < 1e-5);
  const p = buchAufgabe("zelt", 1);
  assert.ok(Math.abs(num((h) => (2 / 3) * (p.st * p.st - h * h) * h, p.h)) < 1e-6);
  const k = buchAufgabe("zelt", 3);
  assert.ok(Math.abs(num((h) => (PI / 3) * (k.st * k.st - h * h) * h, k.h)) < 1e-6);
  const d = buchAufgabe("dreieck", 1);
  assert.ok(Math.abs(d.A - (d.c * d.H) / 8) < 1e-12);
  const r = buchAufgabe("dreieck", 3);
  assert.ok(Math.abs(r.A - (r.c * r.H) / 4) < 1e-12);
  const f = buchAufgabe("flugzeug", 5);                              // dick: h = 4r
  assert.ok(Math.abs(f.h - 4 * f.r) < 1e-9);
  const t = buchAufgabe("zaun", 3);
  assert.equal(buchPruefe(t, { a: dk(t.b), b: dk(t.a), A: dk(t.A) }).vertauscht, true);
});

test("Begründungen und Gegenüberstellung", () => {
  for (const b of BEGRUENDUNGEN) for (const [i, st] of b.schritte.entries()) {
    assert.ok(st.optionen.length >= 2 && st.richtig >= 0 && st.richtig < st.optionen.length);
    assert.deepEqual([...gemischt(st.optionen, i)].sort(), st.optionen.map((_, j) => j));
  }
  assert.ok(ADAPTION.length >= 8);
  const apps = new Set([...ARTEN, ...BUCH_ARTEN].map((a) => a.id));
  for (const z of ADAPTION) assert.ok(apps.has(z.app), z.app);
  assert.ok(GLIEDERUNG.reduce((s, g) => s + g.min, 0) >= 15 && TIPPS.length === 3);
  assert.ok(KOLLOQUIUM.length >= 10 && KOLLOQUIUM.every((q) => q.frage.endsWith("?") && ["Basis", "Vertiefung", "Profi"].includes(q.stufe)));
});
