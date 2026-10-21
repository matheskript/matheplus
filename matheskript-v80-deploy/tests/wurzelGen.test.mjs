import test from "node:test";
import assert from "node:assert/strict";
import { WURZEL_ARTEN, wurzelAufgabe, wurzelWert, wurzelErgebnis, istQuadratfrei, istQuadrat } from "../src/wurzelGen.js";

const nah = (a, b) => Math.abs(a - b) < 1e-9;

test("jede Wurzel-Art: 300 Aufgaben, Ergebnis stimmt und ist vereinfacht (A5)", () => {
  for (const art of WURZEL_ARTEN) {
    for (let i = 0; i < 300; i++) {
      const au = wurzelAufgabe(art);
      assert.equal(au.art, art);
      const e = wurzelErgebnis(au);
      const w = wurzelWert(au);
      if ("zahl" in e) { assert.ok(Number.isInteger(e.zahl) && e.zahl > 0, `${art}: ganze Zahl`); assert.ok(nah(w, e.zahl), `${art}: ${w} ≠ ${e.zahl}`); }
      if ("faktor" in e) {
        assert.ok(e.faktor >= 2, `${art}: Faktor 1 wäre unvereinfacht`);
        assert.ok(istQuadratfrei(e.radikand), `${art}: Radikand ${e.radikand} nicht quadratfrei`);
        assert.ok(nah(w, e.faktor * Math.sqrt(e.radikand)), art);
      }
      if ("zaehler" in e) { assert.ok(e.zaehler < e.nenner); assert.ok(nah(w, e.zaehler / e.nenner)); }
    }
  }
});

test("Fallen sind echte Fallen", () => {
  for (let i = 0; i < 100; i++) {
    const s = wurzelAufgabe("summe");
    assert.notEqual(s.a + s.b, s.c, "√(a² + b²) darf nicht a + b sein");
    const p = wurzelAufgabe("produkt");
    assert.notEqual(p.a, p.b);
    assert.ok(istQuadrat(p.a * p.b));
    assert.ok(!istQuadrat(p.a) || !istQuadrat(p.b), "mindestens ein Faktor ist keine Quadratzahl");
    const t = wurzelAufgabe("teilweise");
    assert.ok(!istQuadrat(t.r));
  }
});
