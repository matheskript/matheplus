/* Normalform der Ableitungen (src/termNormal.js, Regel A5): höhere Ableitungen bleiben kurz,
   sind ausmultipliziert und gekürzt und stimmen numerisch mit der direkten Ableitung überein. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, ohnePar, ableitung, alsTex, kompiliere } from "../src/formelEngine.js";
import { normalBaum } from "../src/termNormal.js";

const F = ["(x+4)*(x^2-1)", "(2x-1)*(x^3+x)", "x^2*sin(x)", "e^(2x)*(x-1)", "(x^2+1)/(x-1)", "sin(x^2)", "sqrt(x)*(x+1)",
  "3x^5-2x", "1/x", "1/(x^2+1)", "x/(x+1)^2", "(2x+1)^5", "x^2*(2x+1)^5", "ln(x)", "x*ln(x)", "ln(x^2+1)", "e^(-x^2)",
  "sin(x)*cos(x)", "tan(x)", "2^x", "sqrt(x^2+1)", "x*e^x", "e^x/x", "cos(3x+1)", "1/sqrt(x)", "(x^2-1)/(x^2+1)",
  "x^3*e^(-x)", "(3x-2)^4*x", "sqrt(2x+1)", "x/(x^2+4)", "e^(3x)*sin(x)", "ln(2x)/x", "(x-2)^3*(x+1)^2"];

const ERWARTET = {
  "(x+4)*(x^2-1)": ["3 x^{2} + 8 x − 1", "6 x + 8", "6"],
  "e^(2x)*(x-1)": ["(2 x − 1) e^{2 x}", "4 x e^{2 x}", "(8 x + 4) e^{2 x}"],
  "(x^2+1)/(x-1)": ["\\frac{x^{2} − 2 x − 1}{(x − 1)^{2}}", "\\frac{4}{(x − 1)^{3}}", "−\\frac{12}{(x − 1)^{4}}"],
  "(2x+1)^5": ["10 (2 x + 1)^{4}", "80 (2 x + 1)^{3}", "480 (2 x + 1)^{2}"],
  "x*e^x": ["(x + 1) e^{x}", "(x + 2) e^{x}", "(x + 3) e^{x}"],
};

const STELLEN = [-2.3, -1.4, -0.6, 0.45, 0.9, 1.7, 2.6, 3.4];
const MUSTER = [/\+\s*−/, /−\s*−/, /(^|[^\d\w])1\s*x/, /\^\{1\}/, /·\s*1(?![\d,.])/, /[+−]\s*0(?![\d,.])/];

test("Ableitungen 1–3 in Normalform: kurz, A5-sauber, numerisch gleich", () => {
  for (const f of F) {
    let b = ohnePar(parse(f));
    for (let i = 1; i <= 3; i++) {
      const a = ableitung(b);
      const tex = alsTex(a);
      assert.ok(tex.length < 140, `${f}, ${i}. Ableitung zu lang: ${tex}`);
      for (const m of MUSTER) assert.ok(!m.test(tex), `${f}, ${i}. Ableitung: ${m} in ${tex}`);
      // Normalform ist ein Fixpunkt (nochmals normalisieren ändert den Wert nicht)
      const n = normalBaum(a);
      assert.ok(n, `${f}: keine Normalform für ${tex}`);
      const g = kompiliere(a), h = kompiliere(n);
      for (const x of STELLEN) if (Number.isFinite(g(x))) assert.ok(Math.abs(g(x) - h(x)) < 1e-6 * (1 + Math.abs(g(x))), `${f} bei ${x}`);
      if (ERWARTET[f]) assert.equal(tex, ERWARTET[f][i - 1], `${f}, ${i}. Ableitung`);
      b = a;
    }
  }
});
