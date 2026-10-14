import test from "node:test";
import assert from "node:assert/strict";
import { q } from "../src/rechnen2.js";
import {
  wLies, wText, wTex, wNum, wZ, wAdd, wMul, wDiv, wSub, wNeg, wWurzel, wIstNull, wIstRational, wGleich, wAnh, wEinTerm, wGanz,
} from "../src/wzahl.js";
import { parabelW, ausScheitelW, normalTexW, scheitelTexW, fW } from "../src/parabelW.js";

const nah = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

test("Eingaben: ganze Zahlen, Brüche, Kommazahlen", () => {
  assert.equal(wText(wLies("3")), "3");
  assert.equal(wText(wLies("-2")), "−2");
  assert.equal(wText(wLies("−2")), "−2");
  assert.equal(wText(wLies("1/2")), "1/2");
  assert.equal(wText(wLies("-6/4")), "−3/2");
  assert.equal(wText(wLies("0,5")), "1/2");
  assert.equal(wText(wLies("0.25")), "1/4");
  assert.equal(wText(wLies("-1,5")), "−3/2");
  assert.equal(wText(wLies("+4")), "4");
  assert.ok(wIstNull(wLies("0")));
});

test("Eingaben: Wurzeln in allen Schreibweisen", () => {
  assert.equal(wText(wLies("√5")), "√5");
  assert.equal(wText(wLies("-√7")), "−√7");
  assert.equal(wText(wLies("−√7")), "−√7");
  assert.equal(wText(wLies("sqrt(5)")), "√5");
  assert.equal(wText(wLies("Wurzel 5")), "√5");
  assert.equal(wText(wLies("√(5)")), "√5");
  assert.equal(wText(wLies("2√3")), "2√3");
  assert.equal(wText(wLies("2*sqrt(3)")), "2√3");
  assert.equal(wText(wLies("√5/2")), "√5/2");
  assert.equal(wText(wLies("3√5/4")), "3√5/4");
  assert.equal(wText(wLies("0,5√2")), "√2/2");
  assert.equal(wText(wLies("√12")), "2√3");           // quadratfrei gemacht
  assert.equal(wText(wLies("√9")), "3");
  assert.equal(wText(wLies("√8")), "2√2");
  assert.ok(wIstNull(wLies("√0")));
  nah(wNum(wLies("-√7")), -Math.sqrt(7));
  nah(wNum(wLies("3√5/4")), (3 * Math.sqrt(5)) / 4);
});

test("Eingaben: Summen und ungültiges", () => {
  assert.equal(wText(wLies("1-√2/2")), "1 − √2/2");
  assert.equal(wText(wLies("√2+1")), "1 + √2");
  assert.equal(wText(wLies("√2-√2")), "0");
  for (const s of ["", " ", "abc", "1/0", "√", "1/", "--1", "2^3", "√(5/2)", "1,2,3", "x", "√99999"]) assert.equal(wLies(s), null, `„${s}“ sollte ungültig sein`);
});

test("Text und Eingabe sind zueinander umkehrbar", () => {
  for (const s of ["3", "−2", "1/2", "−3/2", "√5", "−√7", "2√3", "√5/2", "−3√5/4", "1 − √2/2", "3/2 + √5"]) {
    const z = wLies(s);
    assert.ok(z, s);
    assert.ok(wGleich(wLies(wText(z)), z), s);
  }
});

test("Rechnen: Wurzeln zusammenfassen und vereinfachen", () => {
  const w5 = wWurzel(5), w2 = wWurzel(2);
  assert.equal(wText(wMul(w5, w5)), "5");
  assert.equal(wText(wMul(w2, wWurzel(8))), "4");
  assert.equal(wText(wMul(wWurzel(6), wWurzel(3))), "3√2");
  assert.equal(wText(wAdd(w5, w5)), "2√5");
  assert.equal(wText(wSub(w5, w5)), "0");
  assert.equal(wText(wDiv(wZ(1), w5)), "√5/5");
  assert.equal(wText(wDiv(w5, wWurzel(5))), "1");
  assert.equal(wText(wDiv(wZ(4), wMul(wZ(2), w2))), "√2");
  assert.equal(wDiv(wZ(1), wAdd(w5, w2)), null);          // Nenner mehrteilig: nicht erlaubt
  assert.ok(wIstRational(wMul(w5, w5)) && wGanz(wMul(w5, w5)));
});

test("Ausgabe als TeX", () => {
  assert.equal(wTex(wLies("−√7")), "−\\sqrt{7}");
  assert.equal(wTex(wLies("3√5/4")), "\\frac{3\\sqrt{5}}{4}");
  assert.equal(wTex(wLies("√5/2")), "\\frac{\\sqrt{5}}{2}");
  assert.equal(wTex(wLies("1-√2/2")), "1 − \\frac{\\sqrt{2}}{2}");
  assert.equal(wAnh(wLies("-3+√2")), " − 3 + \\sqrt{2}");
  assert.equal(wAnh([]), "");
  assert.equal(wTex(wLies("−3/2")), "−\\frac{3}{2}");
});

/* Zufällige Gegenprobe gegen Fließkomma: Scheitel, Normalform ↔ Scheitelform, Funktionswert */
test("Parabel mit Wurzeln: Scheitel stimmt mit der Fließkomma-Rechnung überein", () => {
  const wahl = ["1", "-1", "2", "-3", "1/2", "-1/2", "√2", "-√3", "√5/2", "2√3", "3/4"];
  const koef = ["0", "1", "-4", "7", "-10", "1/2", "√5", "-√7", "2√3", "-3/2", "√2/2", "1-√2", "3+√5"];
  let n = 0;
  for (const sa of wahl) for (const sb of koef) for (const sc of koef) {
    const a = wLies(sa), b = wLies(sb), c = wLies(sc);
    if (!wEinTerm(b) && !wIstNull(b)) continue;
    const p = parabelW(a, b, c);
    const A = wNum(a), B = wNum(b), Cc = wNum(c);
    nah(wNum(p.d), -B / (2 * A));
    nah(wNum(p.e), Cc - (B * B) / (4 * A));
    nah(wNum(p.D), B * B - 4 * A * Cc);
    // Der Scheitel liegt auf der Parabel
    nah(fW(p)(wNum(p.d)), wNum(p.e), 1e-8);
    // Rückweg: Scheitelform → Normalform liefert dieselben Koeffizienten
    const r = ausScheitelW(a, p.d, p.e);
    nah(wNum(r.b), B, 1e-8); nah(wNum(r.c), Cc, 1e-8);
    n++;
  }
  assert.ok(n > 500);
});

test("Parabel mit Wurzeln: exakte Beispiele", () => {
  // x² + 2√5·x + 1 → Scheitel (−√5 | −4)
  const p = parabelW(wLies("1"), wLies("2√5"), wLies("1"));
  assert.equal(wText(p.d), "−√5");
  assert.equal(wText(p.e), "−4");
  // √5·x² − 3/2·x + √2
  const p2 = parabelW(wLies("√5"), wLies("-3/2"), wLies("√2"));
  assert.equal(wText(p2.d), "3√5/20");
  nah(wNum(p2.e), Math.sqrt(2) - (9 / 4) / (4 * Math.sqrt(5)));
  // Scheitelform 2(x − √3)² + 1  →  2x² − 4√3·x + 7
  const s = ausScheitelW(wLies("2"), wLies("√3"), wLies("1"));
  assert.equal(wText(s.b), "−4√3");
  assert.equal(wText(s.c), "7");
});

test("Parabel mit Wurzeln: Formeltexte", () => {
  const p = parabelW(wLies("1"), wLies("-4"), wLies("1"));
  assert.equal(normalTexW(p), "x^2 − 4x + 1");
  assert.equal(scheitelTexW(wLies("1"), p.d, p.e), "(x − 2)^2 − 3");
  const m = parabelW(wLies("-1"), wLies("√5"), wLies("-3/2"));
  assert.equal(normalTexW(m), "−x^2 + \\sqrt{5}x − \\frac{3}{2}");
  assert.equal(scheitelTexW(wLies("2"), wLies("0"), wLies("3")), "2x^2 + 3");
  assert.equal(scheitelTexW(wLies("-1"), wLies("-√2"), wLies("0")), "−(x + \\sqrt{2})^2");
});
