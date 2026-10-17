import test from "node:test";
import assert from "node:assert/strict";
import { BRUCH_ARTEN, TERM_ARTEN, bruchAufgabe, termAufgabe, termWert, istGekuerzt, kgV } from "../src/bruchGen.js";
import { ggT, q, qAdd, qSub, qMul, qDiv, qNum } from "../src/rechnen2.js";

const gekuerzt = (b) => b.n > 0 && ggT(Math.abs(b.z), b.n) === 1;
const nah = (a, b) => Math.abs(a - b) < 1e-9;

test("istGekuerzt erkennt gekürzte und ungekürzte Eingaben", () => {
  for (const [e, w] of [["3/4", true], ["6/8", false], ["8/4", false], ["2", true], ["−3/4", true], ["-6/9", false], ["0,75", true], ["7/1", false], [" 5 / 12 ", true]]) assert.equal(istGekuerzt(e), w, e);
});

test("kgV", () => { assert.equal(kgV(4, 6), 12); assert.equal(kgV(3, 5), 15); assert.equal(kgV(8, 12), 24); });

test("Brüche rechnen: alle Typen exakt nachgerechnet (je 2000 Läufe)", () => {
  for (const art of BRUCH_ARTEN) for (let i = 0; i < 2000; i++) {
    const au = bruchAufgabe(art);
    assert.equal(au.art, art);
    if (art === "kuerzen") {
      assert.equal(ggT(au.start.z, au.start.n), au.ggt);
      assert.ok(au.ggt > 1 && gekuerzt(au.ergebnis));
      assert.ok(nah(au.start.z / au.start.n, qNum(au.ergebnis)));
    }
    if (art === "erweitern") { assert.equal(au.ziel, au.start.n * au.faktor); assert.equal(au.zaehler, au.start.z * au.faktor); }
    if (art === "addieren" || art === "subtrahieren") {
      assert.equal(au.hn, kgV(au.a.n, au.b.n));
      assert.ok(nah(au.za / au.hn, qNum(au.a)) && nah(au.zb / au.hn, qNum(au.b)));
      const soll = art === "addieren" ? qAdd(au.a, au.b) : qSub(au.a, au.b);
      assert.deepEqual(au.ergebnis, soll);
      assert.ok(gekuerzt(au.ergebnis) && qNum(au.ergebnis) > 0);
      assert.ok(!nah(au.falsch, qNum(au.ergebnis)), "Denkfehler-Wert darf nicht zufällig richtig sein");
    }
    if (art === "multiplizieren") {
      assert.deepEqual(au.ergebnis, qMul(au.a, au.b));
      assert.ok(ggT(au.ungekuerzt.z, au.ungekuerzt.n) > 1, "über Kreuz kürzbar");
      assert.ok(gekuerzt(au.ergebnis));
    }
    if (art === "dividieren" || art === "doppel") {
      assert.deepEqual(au.ergebnis, qDiv(au.a, au.b));
      assert.ok(gekuerzt(au.ergebnis));
    }
    if (art === "gemischt") {
      assert.ok(nah(qNum(au.u1), au.g1 + qNum(au.r1)) && nah(qNum(au.u2), au.g2 + qNum(au.r2)));
      assert.deepEqual(au.ergebnis, qAdd(au.u1, au.u2));
    }
    if (art === "anteil") { assert.ok(Number.isInteger(au.teil)); assert.equal(au.ergebnis, (au.ganzes * au.b.z) / au.b.n); }
    if (art === "vergleichen") { assert.equal(au.groesser, qNum(au.a) > qNum(au.b) ? "a" : "b"); assert.notEqual(au.za, au.zb); }
    for (const k of ["a", "b", "start", "ergebnis"]) if (au[k] && au[k].n !== undefined && k !== "start") assert.ok(au[k].n > 0);
  }
});

test("Bruchterme: Definitionsmenge, Kürzen, Addieren, Gleichungen (je 1500 Läufe)", () => {
  for (const art of TERM_ARTEN) for (let i = 0; i < 1500; i++) {
    const au = termAufgabe(art);
    if (art === "definition") {
      assert.equal(termWert(au, au.p), null);
      assert.notEqual(au.a * au.p + au.b, 0, "Zähler darf an der Lücke nicht 0 sein (sonst hebbar)");
      for (const x of [-7, -3, 0, 2, 9]) if (x !== au.p) assert.ok(isFinite(termWert(au, x)));
    }
    if (art === "definition2") { assert.equal(termWert(au, au.p), null); assert.equal(termWert(au, -au.p), null); }
    if (art === "kuerzen") {
      const { p, k } = au;
      for (const x of [-4.5, -1, 0.5, 3.25, 7]) {
        if (au.variante === "binom" && x !== p) assert.ok(nah((x * x - p * p) / (x - p), x + p));
        if (au.variante === "faktor" && x !== -p) assert.ok(nah((k * x + k * p) / (x + p), k));
        if (au.variante === "ausklammern" && x !== 0) assert.ok(nah((x * x + p * x) / (k * x), (x + p) / k));
      }
    }
    if (art === "addieren") {
      for (const x of [-7.5, -0.5, 1, 2.5, 6]) {
        if (x === 0 || x === -au.p) continue;
        assert.ok(nah(termWert(au, x), (au.zx * x + au.z0) / (x * (x + au.p))));
      }
    }
    if (art === "gleichung") {
      assert.notEqual(au.x, au.p);
      assert.ok(Number.isInteger(au.x));
      assert.ok(nah(au.a / (au.x - au.p), au.b));
    }
    if (art === "falle") {
      /* Zählergleichung x + c = p + c hat die einzige Lösung x = p – genau die ausgeschlossene Zahl */
      assert.equal(au.kandidat, au.p);
      assert.ok(au.p > 0);
    }
  }
});
