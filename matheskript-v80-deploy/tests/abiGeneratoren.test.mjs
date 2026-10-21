/* Abi-Generatoren (Teil A): BE-Summen, Regel A5 und die Mathematik hinter jeder Aufgabe */
import test from "node:test";
import assert from "node:assert/strict";
import { AUFGABEN_TYPEN, aufgabeErzeugen, teilAProbe, aufgabeAlsText, summe, bruch } from "../src/abiGeneratoren.js";
import { WERKZEUGE } from "../src/werkzeuge.js";

const SEEDS = Array.from({ length: 250 }, (_, i) => i + 1);
const alleTexte = (a) => [a.einleitung, ...a.teile.map((t) => t.text), ...a.erwartung.map((e) => e.text), ...a.kurz];

test("Katalog: zehn Typen, je Sachgebiet passend für Teil A, Trainer existieren", () => {
  assert.equal(AUFGABEN_TYPEN.length, 10);
  const n = (g) => AUFGABEN_TYPEN.filter((t) => t.sachgebiet === g).length;
  assert.equal(n("analysis"), 4); assert.equal(n("geometrie"), 3); assert.equal(n("stochastik"), 3);
  for (const t of AUFGABEN_TYPEN) assert.ok(WERKZEUGE[t.trainer], `Trainer ${t.trainer} fehlt in werkzeuge.js`);
});

test("Jede Aufgabe: 5 BE, Erwartungshorizont deckt jede Teilaufgabe genau ab, gleicher Seed = gleiche Aufgabe", () => {
  for (const t of AUFGABEN_TYPEN) for (const s of SEEDS) {
    const a = aufgabeErzeugen(t.id, s);
    assert.equal(a.be, 5, `${t.id}:${s}`);
    for (const teil of a.teile) {
      const summeTeil = a.erwartung.filter((e) => e.teil === teil.b).reduce((x, e) => x + e.be, 0);
      assert.equal(summeTeil, teil.be, `${t.id}:${s} Teil ${teil.b}`);
    }
    assert.deepEqual(aufgabeErzeugen(t.id, s), a);
  }
});

test("Regel A5 und saubere Texte (kein 1x, x^1, + 0, · 1, + −, − −, NaN)", () => {
  const verboten = [/(^|[^0-9,])1x/, /x\^1(?![0-9])/, /\+ 0(?![0-9,])/, /\\cdot 1(?![0-9,])/, /\+ −/, /− −/, /NaN|undefined|Infinity/, /(?<!\\int_0)\^\{1\}/, /−0(?![,0-9])/];
  for (const t of AUFGABEN_TYPEN) for (const s of SEEDS) {
    for (const text of alleTexte(aufgabeErzeugen(t.id, s))) {
      for (const r of verboten) assert.ok(!r.test(text), `${t.id}:${s} „${text}“ verstößt gegen ${r}`);
      assert.equal((text.match(/\$/g) || []).length % 2, 0, `${t.id}:${s} ungerade $ in „${text}“`);
    }
  }
});

test("Mathematik: Ableitung, Tangente, Integral, Gleichung, Extremstellen", () => {
  const nah = (x, y, tol = 1e-6) => Math.abs(x - y) < tol;
  for (const s of SEEDS) {
    { const { a, b, k, m1, m0 } = aufgabeErzeugen("ana-tangente", s).kontrolle;
      const f = (x) => (a * x + b) * Math.exp(k * x), fs = (x) => (m1 * x + m0) * Math.exp(k * x);
      for (const x of [-1.3, 0, 0.7, 2]) assert.ok(nah((f(x + 1e-5) - f(x - 1e-5)) / 2e-5, fs(x), 1e-4));
      assert.equal(f(0), b); assert.notEqual(m0, 0, "Tangente nie waagrecht"); }
    { const { p, q, r, m, V } = aufgabeErzeugen("ana-integral", s).kontrolle;
      const f = (x) => 3 * p * x * x + 2 * q * x + r; let I = 0; const N = 2000;
      for (let i = 0; i < N; i++) { const x0 = (m * i) / N, x1 = (m * (i + 1)) / N; I += ((f(x0) + 4 * f((x0 + x1) / 2) + f(x1)) * (x1 - x0)) / 6; }
      assert.ok(nah(I, V, 1e-6)); assert.notEqual(V, 0); }
    { const { p, q, B, C, zwei } = aufgabeErzeugen("ana-egleichung", s).kontrolle;
      const g = (x) => Math.exp(2 * x) + B * Math.exp(x) + C;
      assert.ok(nah(g(Math.log(p)), 0, 1e-9));
      if (zwei) assert.ok(q > 0 && nah(g(Math.log(q)), 0, 1e-9)); else assert.ok(q < 0); }
    { const { s: sg, a } = aufgabeErzeugen("ana-extrem", s).kontrolle;
      const fs = (x) => 3 * sg * x * x - 3 * sg * a * a;
      assert.equal(fs(a), 0); assert.equal(fs(-a), 0); }
  }
});

test("Mathematik: Gerade und Ebene, Abstand, rechter Winkel", () => {
  const sk = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  for (const s of SEEDS) {
    { const { fall, n, u, P, d, S, t0 } = aufgabeErzeugen("geo-lage", s).kontrolle;
      if (fall === "schneidet") {
        assert.notEqual(sk(n, u), 0);
        assert.deepEqual([0, 1, 2].map((i) => P[i] + t0 * u[i]), S);
        assert.equal(sk(n, S), d);
      } else {
        assert.equal(sk(n, u), 0);
        assert.equal(sk(n, P) === d, fall === "liegt");
      } }
    { const { n, L, Q, d, k } = aufgabeErzeugen("geo-abstand", s).kontrolle;
      assert.equal(sk(n, n), L * L);
      assert.equal(Math.abs(sk(n, Q) - d) / L, k); }
    { const { v, w, Lv, Lw, flaeche } = aufgabeErzeugen("geo-dreieck", s).kontrolle;
      assert.equal(sk(v, w), 0); assert.equal(sk(v, v), Lv * Lv); assert.equal(sk(w, w), Lw * Lw); assert.equal(flaeche, (Lv * Lw) / 2); }
  }
});

test("Mathematik: Binomialverteilung, bedingte Wahrscheinlichkeit, faires Spiel", () => {
  const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
  for (const s of SEEDS) {
    { const { a, b, n, k, zaehler, nenner } = aufgabeErzeugen("sto-binom", s).kontrolle;
      const p = a / b; assert.ok(Math.abs(zaehler / nenner - C(n, k) * p ** k * (1 - p) ** (n - k)) < 1e-12); }
    { const { pA, pBA, pBnA, pB, ab } = aufgabeErzeugen("sto-vierfeld", s).kontrolle;
      assert.equal(pB, pA * pBA + (100 - pA) * pBnA); assert.equal(ab, pA * pBA); }
    { const { N, q, x2, x3, e, E, x3fair } = aufgabeErzeugen("sto-erwartung", s).kontrolle;
      assert.ok(Math.abs(E - (q[1] * x2 + q[2] * x3) / N) < 1e-12);
      assert.notEqual(E, e);
      assert.ok(Math.abs((q[1] * x2 + q[2] * x3fair) / N - e) < 1e-12); }
  }
});

test("Teil-A-Probe: P1–P4 (2 Ana, Geo, Sto), W1–W6 je zwei, alle zehn Typen genau einmal", () => {
  for (const s of [1, 2, 3, 99, 12345]) {
    const p = teilAProbe(s);
    assert.deepEqual(p.pflicht.map((a) => a.sachgebiet), ["analysis", "analysis", "geometrie", "stochastik"]);
    assert.deepEqual(p.wahl.map((a) => a.nr), ["W1", "W2", "W3", "W4", "W5", "W6"]);
    const typen = [...p.pflicht, ...p.wahl].map((a) => a.typ);
    assert.equal(new Set(typen).size, 10);
    assert.equal([...p.pflicht, ...p.wahl].reduce((x, a) => x + a.be, 0), 50);
  }
});

test("Hilfen: summe, bruch, Klartext für Mia", () => {
  assert.equal(summe([{ c: 1, v: "x^2" }, { c: -1, v: "x" }, { c: 0, v: "" }]), "x^2 − x");
  assert.equal(summe([{ c: -3, v: "x" }, { c: 2, v: "" }]), "−3x + 2");
  assert.equal(bruch(24, 81), "\\frac{8}{27}");
  assert.equal(bruch(6, 3), "2");
  const t = aufgabeAlsText(aufgabeErzeugen("ana-tangente", 5), { mitErwartung: true });
  assert.ok(!t.includes("$") && t.includes("Erwartungshorizont") && t.includes("BE"));
});
