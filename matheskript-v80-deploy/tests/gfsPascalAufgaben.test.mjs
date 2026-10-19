/* Übungen zu den Aufgaben der GFS-Seite Pascal’sches Dreieck (gfsPascalAufgaben.js) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { binom, zeile } from "../src/gfsPascal.js";
import { ADAPTION, BEGRUENDUNGEN, BUCH_ARTEN, ausmultiSumme, buchAufgabe, buchPruefe, buchRechenweg, buchTipp, buchAuftrag, gemischt } from "../src/gfsPascalAufgaben.js";

const richtigeEingabe = (a) => {
  if (a.art === "zeile") return a.felder.map((k) => String(a.ziel[k]));
  if (a.art === "ausmulti") return a.soll.map(String);
  if (a.art === "doppelt") return { a: String(a.k), b: String(a.n - a.k) };
  return { wert: String(a.wert), n: String(a.m + 1), k: "2" };
};

test("jede erzeugte Übung ist lösbar und wird richtig geprüft", () => {
  for (const { id } of BUCH_ARTEN) {
    if (id === "begruenden") continue;
    for (let s = 1; s <= 5; s++) for (let i = 0; i < 200; i++) {
      const a = buchAufgabe(id, s);
      assert.equal(buchPruefe(a, richtigeEingabe(a)).ok, true, `${id} ${s}`);
      assert.ok(buchAuftrag(a).length > 10 && buchTipp(a).length > 10);
      assert.ok(buchRechenweg(a).every((z) => typeof z === "string" && z.length));
    }
  }
});

test("falsche und halbe Eingaben werden erkannt", () => {
  const z = buchAufgabe("zeile", 3);
  const e = z.felder.map((k) => String(z.ziel[k])); e[0] = String(Number(e[0]) + 1);
  const r = buchPruefe(z, e);
  assert.equal(r.ok, false); assert.equal(r.felder[0], false);
  const d = buchAufgabe("doppelt", 3);
  assert.equal(buchPruefe(d, { a: String(d.k), b: String(d.k) }).gleich, true);
  assert.equal(buchPruefe(d, { a: String(d.k), b: String(d.k) }).ok, false);
  const m = buchAufgabe("ausmulti", 3);   // (a − b)^n: Vorzeichen zählen
  assert.equal(buchPruefe(m, m.soll.map((w) => String(Math.abs(w)))).ok, false);
  assert.equal(buchPruefe(m, m.soll.map((w) => String(w).replace("-", "−"))).ok, true);
  const t = buchAufgabe("dreieckszahl", 2);
  assert.equal(buchPruefe(t, { wert: String(t.wert), n: String(t.m), k: "2" }).ok, binom(t.m, 2) === t.wert);
});

test("Stufe 1 wiederholt nie das Einzelbeispiel der Buchseite (Zeile 5, Zahl 5)", () => {
  for (let i = 0; i < 300; i++) assert.notEqual(buchAufgabe("doppelt", 1).n, 5);
});

test("Ausmultiplizieren in Standardschreibweise", () => {
  assert.equal(ausmultiSumme({ n: 3, variante: "plus", c: 1, soll: zeile(3) }), "a^{3} + 3a^{2}b + 3ab^{2} + b^{3}");
  assert.equal(ausmultiSumme({ n: 2, variante: "minus", c: 1, soll: [1, -2, 1] }), "a^{2} - 2ab + b^{2}");
  assert.equal(ausmultiSumme({ n: 2, variante: "faktor", c: 3, soll: [1, 6, 9] }), "x^{2} + 6x + 9");
});

test("Begründungen: jede Lücke hat genau eine richtige Antwort, Mischung ist eine Permutation", () => {
  for (const b of BEGRUENDUNGEN) for (const [i, st] of b.schritte.entries()) {
    assert.ok(st.optionen.length >= 2 && st.richtig >= 0 && st.richtig < st.optionen.length);
    const g = gemischt(st.optionen, i);
    assert.deepEqual([...g].sort(), st.optionen.map((_, j) => j));
  }
  assert.ok(ADAPTION.length >= 7);
});
