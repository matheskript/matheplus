/* Prüflogik für getippte Bedingungen (src/bedingungen.js) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { alsTex, gleichwertig, lies, polyAnsatz, pruefeEingabe, scheitelAnsatz, zerlegen } from "../src/bedingungen.js";

const P3 = polyAnsatz([["a", 3], ["b", 2], ["c", 1], ["d", 0]]);
const ja = (a, b, o) => assert.ok(gleichwertig(a, b, o), `${a}  ≡  ${b}`);
const nein = (a, b, o) => assert.ok(!gleichwertig(a, b, o), `${a}  ≢  ${b}`);

test("Gleichungen: Umstellen und Vielfache zählen, falsche Übersetzungen nicht", () => {
  ja("3x - 4 = 11", "11 = 3x-4");
  ja("6x - 8 = 22", "3x − 4 = 11");
  ja("3·x−4=11", "3x - 4 = 11");
  nein("3(x - 4) = 11", "3x - 4 = 11");
  nein("4 - 3x = 11", "3x - 4 = 11");
  ja("x²=2x+5", "x^2 = 2*x + 5");
  nein("x² + 5 = 2x", "x^2 = 2x + 5");
  ja("10y + x = 10x + y + 27", "9y - 9x = 27");
  ja("x = 3y", "3y = x");
  nein("y = 3x", "x = 3y");
  ja("8x + 12y = 9,6*20", "8x + 12y = 192");
  nein("8x + 12y = 9,6", "8x + 12y = 192");
});

test("Terme: gleicher Wert, keine Vielfachen", () => {
  ja("2(x+3)", "2x+6");
  nein("2x+3", "2(x+3)");
  ja("x + 0,2x", "1,2x");
  nein("2x", "x");
  nein("3x - 4", "3x - 4 = 0");
});

test("f-Schreibweise: Stelle und Wert sind nicht vertauschbar, Striche zählen", () => {
  ja("f'(6)=0", "f′(6) = 0");
  ja("f″(2) = 0", "f''(2)=0");
  ja("4 = f(6)", "f(6) = 4");
  nein("f(4) = 6", "f(6) = 4");
  nein("f'(6) = 0", "f''(6) = 0");
  nein("f(6) = 0", "f'(6) = 0");
  ja("(B(5) - B(1))/4 = 30", "B(5) - B(1) = 120");
  nein("(B(5) - B(1))/5 = 30", "B(5) - B(1) = 120");
  ja("V(6) = V(0)", "V(6) - V(0) = 0");
});

test("Mit Ansatz wird wirklich eingesetzt", () => {
  ja("108a + 12b + c = 0", "f'(6) = 0", { ansatz: P3 });
  ja("216a + 36b + 6c + d = 4", "f(6) = 4", { ansatz: P3 });
  ja("12a + 2b = 0", "f''(2) = 0", { ansatz: P3 });
  nein("108a + 12b + c = 4", "f'(6) = 0", { ansatz: P3 });
  ja("f(3) = 2", "a(3 - d)^2 + e = 2", { ansatz: scheitelAnsatz() });
  nein("f(3) = 2", "a(3 + d)^2 + e = 2", { ansatz: scheitelAnsatz() });
});

test("Stochastik: Ereignisse über ihre Mengen verglichen", () => {
  ja("P(X>2)", "P(X≥3)");
  ja("1-P(X<=2)", "P(X>=3)");
  ja("P(3<=X<=6)", "P(X<=6)-P(X<=2)");
  ja("1 - P(X = 0)", "P(X ≥ 1)");
  nein("P(X≥2)", "P(X≥3)");
  nein("P(X<5)", "P(X ≤ 5)");
  nein("1 - P(X ≤ 3)", "P(X ≥ 3)");
  ja("P(X=0) <= 0,1", "P(X >= 1) >= 0.9");
  nein("P(X=0) >= 0,1", "P(X >= 1) >= 0.9");
  nein("P(X ≥ 1) = 0,9", "P(X ≥ 1) ≥ 0,9");
  ja("n = 20", "20 = n");
  ja("p = 0,3", "p=0.3");
});

test("Zerlegen und Rückmeldung", () => {
  assert.deepEqual(zerlegen("f(2)=0; f'(2)=0"), ["f(2)=0", "f'(2)=0"]);
  assert.deepEqual(zerlegen("f(2) = 0, f'(2) = 0"), ["f(2) = 0", "f'(2) = 0"]);
  assert.deepEqual(zerlegen("f(2)=1,5 und f'(2)=0"), ["f(2)=1,5", "f'(2)=0"]);
  const ziel = [{ c: "f(6) = 4" }, { c: "f'(6) = 0" }];
  assert.equal(pruefeEingabe("f(6)=4; f'(6)=0", ziel).ok, true);
  const r = pruefeEingabe("f(4)=6; f'(6)=0", ziel, { falsch: [{ c: "f(4) = 6", text: "vertauscht" }] });
  assert.equal(r.ok, false);
  assert.deepEqual(r.gefunden, [false, true]);
  assert.equal(r.extra[0].fehler, "vertauscht");
  assert.equal(pruefeEingabe("f(6) = = 4", ziel).unlesbar.length, 1);
  assert.equal(pruefeEingabe("f(6)=4; 4=f(6); f'(6)=0", ziel).ok, true);   // doppelt ist kein Fehler
  /* Mit Symmetrie-Ansatz gilt f'(0) = 0 von selbst: kein Fehler, nur ein Hinweis */
  const P4g = polyAnsatz([["a", 4], ["b", 2], ["c", 0]]);
  const t = pruefeEingabe("f(0)=3; f'(0)=0", [{ c: "f(0) = 3" }], { ansatz: P4g });
  assert.equal(t.ok, true);
  assert.equal(t.extra[0].trivial, true);
  assert.equal(pruefeEingabe("H0: p <= 0,05", [{ c: "p ≤ 0,05" }]).ok, true);
});

test("Anzeige in Mini-TeX", () => {
  assert.equal(alsTex("f''(2) = 0"), "f″(2) = 0");
  assert.equal(alsTex("x/4 + 3"), "\\frac{x}{4} + 3");
  assert.equal(alsTex("(f(5) - f(1))/4 = 3"), "\\frac{f(5) − f(1)}{4} = 3");
  assert.equal(alsTex("P(X >= 3)"), "P(X \\geq 3)");
  assert.ok(lies("2(x+3)"));
  assert.equal(lies("f(6) = = 4"), null);
});
