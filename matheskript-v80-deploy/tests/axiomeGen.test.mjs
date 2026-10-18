import test from "node:test";
import assert from "node:assert/strict";
import * as A from "../src/axiomeGen.js";
import { qNum } from "../src/rechnen2.js";

const L = 1500;
const nah = (a, b) => Math.abs(a - b) < 1e-9;

test("Beispiele mit Zahlen: beide Seiten sind gleich", () => {
  for (let i = 0; i < L; i++) {
    const a = A.axAufgabe("gesetz");
    assert.ok(nah(a.l, a.r), `${a.kz}: ${a.tex}`);
    assert.equal(new Set(a.wahl).size, 4);
    assert.ok(a.wahl.every((k) => A.KZ.includes(k)));
  }
});

test("Beispiele mit Variablen: Umformung stimmt für viele Belegungen", () => {
  for (let i = 0; i < L; i++) {
    const a = A.axAufgabe("term");
    for (const [x, y] of [[0.3, 1.7], [-2.5, 4], [7, -3], [1.25, 0.5]]) {
      const [l, r] = a.f(x, y);
      assert.ok(nah(l, r), `${a.kz}: ${a.tex}`);
    }
  }
});

test("Jedes Gesetz kommt als Aufgabe vor", () => {
  const ges = new Set(), term = new Set();
  for (let i = 0; i < L; i++) { ges.add(A.axAufgabe("gesetz").kz); term.add(A.axAufgabe("term").kz); }
  for (const kz of A.KZ) { assert.ok(ges.has(kz), kz); assert.ok(term.has(kz), kz); assert.ok(A.KZ_NAME[kz] && A.KZ_FORMEL[kz]); }
});

/* Ketten: jede Zeile numerisch gleich der vorigen (für mehrere Belegungen von a, b, c) */
function wert(tex, a, b, c) {
  let t = tex.replace(/^=\s*/, "").split("=").pop();
  t = t.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "(($1)/($2))").replace(/\\cdot/g, "*").replace(/−/g, "-")
    .replace(/([a-z])(?=[a-z])/g, "$1*").replace(/(\d)([a-z(])/g, "$1*$2").replace(/\^2/g, "**2").replace(/\)\s*\(/g, ")*(");
  return Function("a", "b", "c", "x", `return (${t});`)(a, b, c, 4);
}
test("Ketten: jede Zeile ist eine gültige Umformung", () => {
  for (const k of A.KETTEN) {
    for (const [a, b, c] of [[2, 3, 5], [-1.5, 0.25, 7], [10, -4, 0.5]]) {
      if (k.id.startsWith("gl")) {
        /* Gleichungen: jede Zeile hat die Lösung x = 4 */
        for (const z of k.zeilen) {
          const [l, r] = z.tex.split("=").map((s) => s.replace(/\\quad.*$/, ""));
          const f = (s) => Function("x", `return (${s.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "(($1)/($2))").replace(/\\cdot/g, "*").replace(/−/g, "-")});`)(4);
          assert.ok(nah(f(l), f(r)), `${k.id}: ${z.tex}`);
        }
        continue;
      }
      const w0 = wert(k.zeilen[0].tex, a, b, c);
      for (const z of k.zeilen) assert.ok(nah(wert(z.tex, a, b, c), w0), `${k.id}: ${z.tex}`);
    }
    for (const z of k.zeilen.slice(1)) assert.ok(z.kz || z.schritt || /^= \d+$/.test(z.tex) || /^= \d+ [+\\]/.test(z.tex), `${k.id}: Schritt ohne Begründung: ${z.tex}`);
  }
  assert.ok(A.KETTEN_SCHRITTE.length >= 20);
});

test("Inverse: x + (−x) = 0 bzw. x · (1/x) = 1", () => {
  for (let i = 0; i < L; i++) {
    const a = A.axAufgabe("invers");
    const x = qNum(a.x), inv = qNum(a.inv);
    assert.notEqual(x, 0);
    assert.ok(a.plus ? nah(x + inv, 0) : nah(x * inv, 1));
    assert.ok(!nah(qNum(a.falsch), inv), "Ablenker ist nicht zufällig die Lösung");
  }
});

test("Umschreiben, Distributiv, Ausklammern", () => {
  for (let i = 0; i < L; i++) {
    const u = A.axAufgabe("umschreiben");
    assert.ok(nah(qNum(u.wert), u.minus ? u.a + -u.b : u.a * (1 / u.b)));
    const d = A.axAufgabe("distributiv");
    assert.equal(d.wert, d.a * d.n);
    assert.equal(d.plus ? d.teil1 + d.teil2 : d.teil1 - d.teil2, d.wert);
    const k = A.axAufgabe("ausklammern");
    for (const x of [0, 1, -2, 3.5]) assert.ok(nah(k.wert(x), k.k * (k.c * x + k.m)));
    const g = (p, r) => (r ? g(r, p % r) : p);
    assert.equal(g(k.k * k.c, k.k * k.m), k.k, "k ist der größte gemeinsame Faktor");
  }
});

test("Verkleidete 1 und 0: genau eine passende Option", () => {
  for (const e of A.VERKLEIDET) for (const x of [0.5, 2, -3]) {
    if (e.art === "eins") assert.ok(nah(e.v(x), 1), e.tex);
    if (e.art === "null") assert.ok(nah(e.v(x), 0), e.tex);
  }
  for (let i = 0; i < L; i++) {
    const a = A.axAufgabe("verkleidet");
    const passend = a.optionen.filter((t) => A.VERKLEIDET.find((e) => e.tex === t).art === a.ziel);
    assert.deepEqual(passend, [a.richtig]);
    assert.equal(new Set(a.optionen).size, 3);
  }
});

test("Keine Aufgabe bringt ein eigenes Feld id mit (es gehört der Übungskarte)", () => {
  for (const art of A.AX_ARTEN) for (let i = 0; i < 300; i++) assert.ok(!("id" in A.axAufgabe(art)), art);
});

test("Alle Aufgabentypen werden erzeugt", () => {
  for (const art of A.AX_ARTEN) for (let i = 0; i < 200; i++) assert.equal(A.axAufgabe(art).art, art);
});
