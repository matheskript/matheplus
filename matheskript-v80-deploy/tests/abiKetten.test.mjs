import test from "node:test";
import assert from "node:assert/strict";
import { KETTEN, analysisKette, binomialAb, binomialBis, binomialP, ebeneGleich, ebeneText, geometrieKette, leseZahl, polyKlartext, pruefeTeil, rechteGrenze, stochastikKette } from "../src/abiKetten.js";

const zufallVon = (seed) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const nah = (a, b, e = 1e-9) => Math.abs(a - b) < e;

test("Analysis-Kette: Extrema, Wendepunkt, Tangente und Integral stimmen", () => {
  const z = zufallVon(7);
  for (let i = 0; i < 2000; i++) {
    const K = analysisKette(z);
    const { a, b, c, d } = K.f;
    const f = (x) => a * x ** 3 + b * x ** 2 + c * x + d, fs = (x) => 3 * a * x * x + 2 * b * x + c;
    for (const v of [a, b, c, d]) assert.ok(Number.isInteger(v), "ganzzahlige Koeffizienten");
    const [H, T] = K.einleitung.match(/\(([^)]*)\)/g).map((t) => t.slice(1, -1).split(" | ").map((s) => Number(s.replace("−", "-"))));
    assert.ok(nah(f(H[0]), H[1]) && nah(fs(H[0]), 0) && 6 * a * H[0] + 2 * b < 0, "Hochpunkt");
    assert.ok(nah(f(T[0]), T[1]) && nah(fs(T[0]), 0) && 6 * a * T[0] + 2 * b > 0, "Tiefpunkt");
    const [, tb, tc, td] = K.teile;
    const xw = tb.felder[0].wert;
    assert.ok(nah(6 * a * xw + 2 * b, 0) && nah(tb.felder[1].wert, f(xw)));
    assert.ok(nah(tc.felder[0].wert, fs(xw)) && nah(tc.felder[1].wert, f(xw) - fs(xw) * xw));
    const lo = Math.min(H[0], T[0]), hi = Math.max(H[0], T[0]);
    let s = 0; const N = 2000, h = (hi - lo) / N;
    for (let j = 0; j < N; j++) s += f(lo + (j + 0.5) * h) * h;
    assert.ok(nah(td.felder[0].wert, s, 1e-4), "Integral numerisch");
    assert.ok(!/\+ −|1x|· 1\b/.test(K.f.text), `A5: ${K.f.text}`);
  }
});

test("Geometrie-Kette: Ebene enthält A, B, C; Höhe und Volumen passen", () => {
  const z = zufallVon(11);
  for (let i = 0; i < 2000; i++) {
    const K = geometrieKette(z);
    const { A, B, C, S } = K.punkte, k = K.ebene, n = k.slice(0, 3);
    for (const P of [A, B, C]) assert.equal(n[0] * P[0] + n[1] * P[1] + n[2] * P[2], k[3]);
    assert.ok(k.every((x) => Math.abs(x) <= 10));
    const h = Math.abs(n[0] * S[0] + n[1] * S[1] + n[2] * S[2] - k[3]) / Math.hypot(...n);
    assert.ok(nah(K.teile[1].felder[0].wert, h));
    const V = K.teile[3].felder[0].wert, G = K.teile[2].felder[0].wert;
    assert.ok(nah(V, (G * h) / 3, 1e-9), "V = G·h/3");
    assert.ok(ebeneGleich(k, k.map((x) => -2 * x)), "Vielfache zählen");
    assert.ok(!ebeneGleich(k, [k[0], k[1], k[2], k[3] + 1]));
  }
  assert.equal(ebeneText([1, -2, 0, 3]), "x₁ − 2x₂ = 3");
  assert.equal(ebeneText([0, 1, -1, -4]), "x₂ − x₃ = −4");
});

test("Stochastik-Kette: Binomialwerte und Ablehnungsbereich", () => {
  let s = 0; for (let k = 0; k <= 20; k++) s += binomialP(20, 0.3, k);
  assert.ok(nah(s, 1, 1e-12));
  assert.ok(nah(binomialP(10, 0.5, 5), 252 / 1024));
  assert.ok(nah(binomialBis(10, 0.5, 4) + binomialAb(10, 0.5, 5), 1, 1e-12));
  const z = zufallVon(3);
  for (let i = 0; i < 300; i++) {
    const K = stochastikKette(z);
    const g = K.teile[2].felder[0].wert;
    assert.ok(binomialAb(K.n, K.p, g) <= 0.05 && binomialAb(K.n, K.p, g - 1) > 0.05);
    assert.equal(g, rechteGrenze(K.n, K.p, 0.05));
    for (const t of K.teile) for (const f of t.felder) assert.ok(f.wert >= 0 && f.wert <= K.n);
  }
});

test("Prüfen: Komma, Bruch, Toleranz, Teilpunkte", () => {
  assert.equal(leseZahl("−1,5"), -1.5);
  assert.equal(leseZahl("3/4"), 0.75);
  assert.ok(Number.isNaN(leseZahl("")));
  const teil = { punkte: 4, felder: [{ wert: 1, toleranz: 1e-6 }, { wert: -2, toleranz: 1e-6 }, { wert: 0, toleranz: 1e-6 }, { wert: 3, toleranz: 1e-6 }] };
  assert.deepEqual(pruefeTeil(teil, ["1", "-2", "0", "3"]).punkte, 4);
  assert.deepEqual(pruefeTeil(teil, ["1", "2", "0", "3"]).punkte, 3);
  const ein = { punkte: 2, felder: [{ wert: 0.12345, toleranz: 0.00051 }] };
  assert.equal(pruefeTeil(ein, ["0,1235"]).punkte, 2);
  assert.equal(pruefeTeil(ein, ["0,13"]).punkte, 0);
  assert.equal(polyKlartext([[1, 3], [-1, 1], [0, 0]]), "x³ − x");
  assert.equal(KETTEN.length, 3);
});
