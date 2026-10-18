import test from "node:test";
import assert from "node:assert/strict";
import {
  trigAuswerten, istTerm, piBruch, piTex, faktorTex, quadrant, sinG, cosG, tanG, atanG, gradZuBogen,
  EK_ARTEN, ekAufgabe, BM_ARTEN, bmAufgabe, verhaeltnisAufgabe, SACHEN, sachAufgabe, TAN_ARTEN, tanAufgabe, TRIPEL,
} from "../src/trigMittel.js";

const nah = (a, b, e = 1e-9) => Math.abs(a - b) <= e;
const w = (s, m = "deg") => trigAuswerten(s, m).wert;

test("Rechner: Grundrechenarten, Komma, Klammern, unsichtbares Mal", () => {
  assert.equal(w("3+4"), 7);
  assert.equal(w("2,5 · 4"), 10);
  assert.equal(w("12÷4−1"), 2);
  assert.equal(w("−3²"), -9);
  assert.equal(w("2(3+4)"), 14);
  assert.ok(nah(w("2π"), 2 * Math.PI));
  assert.ok(nah(w("2π/3"), 2 * Math.PI / 3));
  assert.equal(w("2^3"), 8);
  assert.equal(w("√16"), 4);
  assert.equal(w("sqrt(9)+1"), 4);
  assert.equal(w("(1+2"), 3, "fehlende Klammer am Ende ist erlaubt");
});

test("Rechner: Winkelfunktionen im Gradmaß", () => {
  assert.ok(nah(w("sin(30)"), 0.5));
  assert.ok(nah(w("cos(60)"), 0.5));
  assert.ok(nah(w("tan(45)"), 1));
  assert.ok(nah(w("sin30"), 0.5));
  assert.ok(nah(w("5·sin(35)"), 5 * Math.sin(35 * Math.PI / 180)));
  assert.ok(nah(w("5sin(35)"), 5 * Math.sin(35 * Math.PI / 180)));
  assert.ok(nah(w("sin(30)²+cos(30)²"), 1), "sin(30)² ist (sin 30)²");
  assert.ok(nah(w("8/tan(40)"), 8 / Math.tan(40 * Math.PI / 180)));
  assert.ok(nah(w("sin⁻¹(0,5)"), 30));
  assert.ok(nah(w("cos⁻¹(0.5)"), 60));
  assert.ok(nah(w("tan⁻¹(1)"), 45));
  assert.ok(nah(w("asin(1)"), 90));
  assert.ok(nah(w("arccos(0)"), 90));
  assert.ok(nah(w("sin^-1(0,5)"), 30));
  assert.ok(nah(w("sin(30°)"), 0.5));
});

test("Rechner: Bogenmaß-Modus rechnet wie ein Taschenrechner auf RAD", () => {
  assert.ok(nah(w("sin(30)", "rad"), Math.sin(30)));
  assert.ok(nah(w("sin(π/6)", "rad"), 0.5));
  assert.ok(nah(w("sin(30°)", "rad"), 0.5), "° erzwingt Grad");
  assert.ok(nah(w("sin⁻¹(1)", "rad"), Math.PI / 2));
});

test("Rechner: Fehler werden erkannt", () => {
  assert.equal(trigAuswerten("").fehler, "leer");
  assert.equal(trigAuswerten("sin⁻¹(2)").fehler, "bereich");
  assert.equal(trigAuswerten("√(−4)").fehler, "bereich");
  assert.equal(trigAuswerten("tan(90)").fehler, "undefiniert");
  assert.equal(trigAuswerten("5/0").fehler, "undefiniert");
  assert.equal(trigAuswerten("3+").fehler, "syntax");
  assert.equal(trigAuswerten("sin(30)x").fehler, "syntax");
  assert.equal(trigAuswerten("3))").wert, 3);
  assert.ok(istTerm("5·sin(35)") && istTerm("2π") && !istTerm("−3,5") && !istTerm("3/4"));
});

test("Bogenmaß: π-Brüche sind vollständig gekürzt und als TeX ohne Einsen (A5)", () => {
  assert.deepEqual(piBruch(135), [3, 4]);
  assert.deepEqual(piBruch(360), [2, 1]);
  assert.deepEqual(piBruch(30), [1, 6]);
  assert.equal(piTex([1, 1]), "π");
  assert.equal(piTex([2, 1]), "2π");
  assert.equal(piTex([1, 6]), "\\frac{π}{6}");
  assert.equal(piTex([3, 4]), "\\frac{3π}{4}");
  assert.equal(faktorTex([2, 1]), "2");
  for (let g = 1; g <= 360; g++) {
    const t = piTex(piBruch(g));
    assert.ok(!/\b1π|\{1\}|\\frac\{π\}\{1\}/.test(t), `${g}: ${t}`);
  }
  assert.equal(quadrant(45), 1); assert.equal(quadrant(135), 2); assert.equal(quadrant(200), 3); assert.equal(quadrant(300), 4); assert.equal(quadrant(90), 0); assert.equal(quadrant(-30), 4);
});

test("Einheitskreis: alle Aufgabentypen sind stimmig (je 2000 Läufe)", () => {
  for (const art of EK_ARTEN) for (let i = 0; i < 2000; i++) {
    const a = ekAufgabe(art);
    assert.equal(a.art, art);
    const f = a.fn === "sin" ? sinG : cosG;
    if (art === "vorzeichen") { assert.equal(quadrant(a.al), a.q); assert.equal(a.richtig, f(a.al) > 0 ? "+" : "-"); }
    if (art === "bezug") { const s = a.richtig[0] === "+" ? 1 : -1; assert.ok(nah(f(a.al), s * f(a.be), 1e-12)); }
    if (art === "gleich") {
      assert.ok(a.partner >= 0 && a.partner < 360 && a.partner !== a.al);
      assert.ok(nah(f(a.partner), f(a.al), 1e-12), `${a.fn} ${a.al} ${a.partner}`);
    }
    if (art === "punkt") { assert.ok(nah(a.x ** 2 + a.y ** 2, 1, 1e-12)); assert.ok(nah(cosG(a.al), a.x, 1e-12) && nah(sinG(a.al), a.y, 1e-12)); }
    if (art === "winkel") { assert.equal(quadrant(a.ziel), a.q); assert.ok(nah(f(a.ziel), a.v, 1e-12)); }
  }
});

test("Grad- und Bogenmaß: Aufgaben stimmig", () => {
  for (const art of BM_ARTEN) for (let i = 0; i < 1000; i++) {
    const a = bmAufgabe(art);
    if (art === "zuBogen") { assert.ok(nah(a.k * Math.PI, gradZuBogen(a.g))); assert.equal(piBruch(a.g)[0], a.z); }
    if (art === "zuGrad") assert.ok(nah(gradZuBogen(a.g), a.x, 1e-12));
    if (art === "bogen") assert.ok(nah(a.b, a.r * a.g * Math.PI / 180));
    if (art === "falle") assert.ok(Math.abs(a.deg - a.rad) > 0.05, "Falle muss sichtbar sein");
  }
});

test("Rechtwinklig: Verhältnisse aus zwei Seiten und Sachaufgaben", () => {
  for (const [a, b, c] of TRIPEL) assert.equal(a * a + b * b, c * c);
  for (let i = 0; i < 2000; i++) {
    const v = verhaeltnisAufgabe();
    assert.equal(v.a ** 2 + v.b ** 2, v.c ** 2);
    assert.ok(nah(v.bruch[0] / v.bruch[1], v.wert));
    assert.ok(nah({ sin: sinG, cos: cosG, tan: tanG }[v.fn](v.al), v.wert, 1e-12));
  }
  for (const was of SACHEN) for (let i = 0; i < 500; i++) {
    const s = sachAufgabe(was);
    assert.ok(s.wert > 0 && Math.abs(s.wert - s.rad) > 0.03, `${was}: Bogenmaß-Falle nicht unterscheidbar`);
    /* Rampe: sin⁻¹ und tan⁻¹ liegen bei flachen Rampen fast gleich – dort wird beides als richtig erkannt, eine Falle braucht es nicht */
    if (was !== "rampe") assert.ok(Math.abs(s.wert - s.falsch) > 0.05, `${was}: falsche Funktion nicht unterscheidbar`);
  }
});

test("Tangens: Aufgaben stimmig, Fehler unterscheidbar", () => {
  for (const art of TAN_ARTEN) for (let i = 0; i < 1000; i++) {
    const a = tanAufgabe(art);
    if (art === "einheit") assert.ok(nah(a.wert, a.sin / a.cos));
    if (art === "steigung") { assert.ok(nah(tanG(a.wert), a.m, 1e-12)); assert.ok(Math.abs(a.wert - a.rad) > 0.1); }
    if (art === "prozent" && a.richtung === "winkel") assert.ok(nah(tanG(a.wert), a.p / 100, 1e-12));
    if (art === "prozent" && a.richtung === "prozent") assert.ok(nah(a.wert, 100 * tanG(a.al)));
    if (art === "hoehe") { assert.ok(nah(a.wert, a.d * tanG(a.al) + a.auge)); assert.ok(Math.abs(a.wert - a.falsch) > 0.05); }
    if (art === "schatten") assert.ok(nah(atanG(a.h / a.s), a.wert));
  }
});
