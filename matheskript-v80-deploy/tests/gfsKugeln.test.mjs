/* GFS · Kugeln (gfsKugeln.js)
   Die Mathematik der Herleitung wird nachgerechnet (Beispielkugel, drei Geraden, Ebenen, Tangentialebene,
   Ortung), allgemeine Sätze an Zufallsfällen geprüft (D = 4u²(r² − d²), Sehne, Schnittkreis, Pythagoras
   in der Tangentialebene), die Laborwerte für alle Einstellungen, die Generatoren über viele Startwerte
   (gültig, lösbar, typische Fehler mit Rückmeldung, Rechenweg endet beim Ergebnis, A5). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { q, qNum, qGleich } from "../src/rechnen2.js";
import { wNum, wWurzel, wTex, wText } from "../src/wzahl.js";
import {
  zufallszahlen, wuerfelAus, vAdd, vSub, skalar, quadrat, kreuz, gitterVektoren, kTex, kText, wurzelQ, radiusTex,
  kugelTex, kugelAllgTex, linTex, quadTex, punktTex,
  kugelAusAllgemein, kugelAllgemein, punktLage, geradeKugel, ebeneKugel, tangentialebene, ortung, BEISPIEL, animGerade,
  LABOR, laborGerade, laborEbene, liesQ, liesW, trifftW,
  ARTEN, STUFEN_NAMEN, stufenZahl, aufgabe, pruefe, rechenweg, ergebnisTex, tipp,
  GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "../src/gfsKugeln.js";

/* Dieselben Muster wie tests/a5.test.mjs – nichts bleibt unvereinfacht stehen */
const N = String.raw`\d+(?:[.,]\d+)?`;
const A5 = [
  new RegExp(String.raw`(?:^|=)\s*${N}\s*[+−\-]\s*${N}\s*$`), new RegExp(String.raw`(?:^|=)\s*${N}\s*(?:·|\\cdot|\*)\s*${N}\s*$`),
  /(^|[^\d.,\w])1\s*(?:·|\\cdot)?\s*x(?![\w])/, /\+\s*[−-]\s*\d/, /[−-]\s*[−-]\s*\d/, /(?:·|\\cdot)\s*1(?![\d,.\/^])/, /[+−-]\s*0(?![\d,.])\s*$/,
  /(?<!_\{[^}]*\}|_-?\d)\^\{?1\}?(?![\d])/,
];
const a5ok = (z) => A5.every((m) => !m.test(z));
const nah = (x, y, e = 1e-9) => Math.abs(x - y) < e;
const qv = (v) => v.map((x) => q(x));
const gleichQV = (a, b) => a.every((x, i) => qGleich(x, b[i]));
const rnd = (s) => wuerfelAus(zufallszahlen(s));

test("Zahlen, Wurzeln und Eingaben", () => {
  assert.equal(kTex(-3), "−3"); assert.equal(kTex(q(-3, 2)), "−\\frac{3}{2}"); assert.equal(kText(q(7, 2)), "7/2");
  assert.equal(wTex(wurzelQ(q(9, 2))), "\\frac{3\\sqrt{2}}{2}");
  assert.equal(wTex(wurzelQ(20)), "2\\sqrt{5}"); assert.equal(wTex(wurzelQ(25)), "5");
  assert.equal(radiusTex(q(16)), "r = \\sqrt{16} = 4"); assert.equal(radiusTex(q(7)), "r = \\sqrt{7}");
  assert.ok(qGleich(liesQ("−3/2"), q(-3, 2)) && qGleich(liesQ("2,5"), q(5, 2)) && liesQ("2√3") === null);
  const s = wWurzel(24);                                   // 2√6 ≈ 4,899
  for (const t of ["2√6", "√24", "2*√6", "4,9", "4,90", " 4.9 "]) assert.ok(trifftW(liesW(t), s), t);
  for (const t of ["4,89", "4,8", "24", "2√5", "5"]) assert.ok(!trifftW(liesW(t), s), t);
  assert.ok(trifftW(liesW("3√2/2"), wurzelQ(q(9, 2))) && trifftW(liesW("2,12"), wurzelQ(q(9, 2))));
  assert.equal(liesW(""), null);
  assert.equal(kugelTex([2, -1, 0], 25), "(x_1 − 2)^2 + (x_2 + 1)^2 + x_3^2 = 25");
  assert.equal(kugelAllgTex(1, [-4, 2, -6], -11), "x_1^2 + x_2^2 + x_3^2 − 4x_1 + 2x_2 − 6x_3 − 11 = 0");
  assert.equal(linTex([2, 1, -2]), "2x_1 + x_2 − 2x_3"); assert.equal(linTex([0, -1, 0]), "−x_2");
  assert.equal(quadTex(2, -12, 10), "2t^2 − 12t + 10"); assert.equal(quadTex(1, 0, -1), "t^2 − 1");
  assert.equal(punktTex("M", [2, -1, 3]), "M(2 \\mid −1 \\mid 3)");
  for (const n2 of [9, 25, 36, 49]) for (const v of gitterVektoren(n2)) assert.equal(quadrat(v), n2);
  assert.equal(gitterVektoren(9).length, 30);   // 24 × (1|2|2) und 6 × (3|0|0)
});

test("Herleitung: Kugelgleichung, Punktprobe, quadratische Ergänzung, keine Kugel", () => {
  const { m, r } = BEISPIEL;
  const al = kugelAllgemein(m, r * r);
  assert.deepEqual(al.lin.map(qNum), BEISPIEL.allgemein.lin);
  assert.equal(qNum(al.e), BEISPIEL.allgemein.e);
  const z = kugelAusAllgemein(...BEISPIEL.allgemein.lin, BEISPIEL.allgemein.e);
  assert.ok(gleichQV(z.m, qv(m)) && qGleich(z.r2, q(25)) && z.art === "kugel");
  const leer = kugelAusAllgemein(...BEISPIEL.leer.lin, BEISPIEL.leer.e);
  assert.ok(gleichQV(leer.m, qv([1, 0, -2])) && qGleich(leer.r2, q(-1)) && leer.art === "leer");
  assert.equal(kugelAusAllgemein(-2, 0, 0, 1).art, "punkt");
  // Vorfaktor: 2(x² …) − 8x₁ … ist dieselbe Kugel wie nach dem Teilen
  const f = kugelAusAllgemein(-8, 4, -12, -22, 2);
  assert.ok(gleichQV(f.m, qv(m)) && qGleich(f.r2, q(25)));
  assert.deepEqual(punktLage(m, r, BEISPIEL.punkte.P), { w: 25, lage: "auf" });
  assert.deepEqual(punktLage(m, r, BEISPIEL.punkte.Q), { w: 9, lage: "innen" });
  assert.deepEqual(punktLage(m, r, BEISPIEL.punkte.R), { w: 41, lage: "aussen" });
  // allgemein: M(−a/2 | −b/2 | −c/2), r² = (a² + b² + c²)/4 − e
  const R = rnd(5);
  for (let i = 0; i < 200; i++) {
    const a = R(-9, 9), b = R(-9, 9), c = R(-9, 9), e = R(-30, 30);
    const k = kugelAusAllgemein(a, b, c, e);
    assert.ok(nah(qNum(k.r2), (a * a + b * b + c * c) / 4 - e));
    const zurueck = kugelAllgemein(k.m, k.r2);
    assert.deepEqual(zurueck.lin.map(qNum), [a, b, c]); assert.equal(qNum(zurueck.e), e);
  }
});

test("Herleitung: Gerade und Kugel – Sekante, Tangente, Passante", () => {
  const { m, r } = BEISPIEL;
  const g = geradeKugel(m, 25, BEISPIEL.g.p, BEISPIEL.g.u);
  assert.deepEqual([g.a, g.b, g.c, g.D, g.lage], [2, -12, 10, 64, "sekante"]);
  assert.deepEqual(g.tn, [1, 5]);
  assert.deepEqual(g.punkte, [[-2, -1, 6], [2, 3, 6]]);
  assert.equal(quadrat(vSub(g.punkte[1], g.punkte[0])), 32);          // Sehne √32 = 4√2
  assert.equal(wTex(wWurzel(32)), "4\\sqrt{2}");
  assert.ok(qGleich(g.d2, q(17)));                                     // 2√(25 − 17) = 4√2
  const h = geradeKugel(m, 25, BEISPIEL.h.p, BEISPIEL.h.u);
  assert.deepEqual([h.a, h.b, h.c, h.D, h.lage, h.tn[0]], [2, 4, 2, 0, "tangente", -1]);
  assert.deepEqual(h.punkte[0], [2, -1, 8]);
  const k = geradeKugel(m, 25, BEISPIEL.k.p, BEISPIEL.k.u);
  assert.deepEqual([k.a, k.b, k.c, k.D, k.lage], [2, 4, 13, -88, "passante"]);
  // Animation: g_c hat den Abstand c, die Gleichung ist 25t² − 50t + c² = 0
  for (const c of [0, 1, 2, 3, 4, 5, 6, 7]) {
    const { p, u } = animGerade(c), e = geradeKugel(m, r * r, p, u);
    assert.deepEqual([e.a, e.b, e.c, e.D], [25, -50, c * c, 100 * (25 - c * c)]);
    assert.ok(qGleich(e.d2, q(c * c)));
  }
  const c3 = geradeKugel(m, 25, animGerade(3).p, animGerade(3).u);
  assert.deepEqual(c3.tn, [0.2, 1.8]);
  assert.deepEqual(geradeKugel(m, 25, animGerade(5).p, animGerade(5).u).punkte[0], [2, -1, 8]);   // derselbe Berührpunkt wie h
  // allgemein: D = 4u²(r² − d²), Sehne² = 4(r² − d²), Schnittpunkte auf g und K
  const R = rnd(11);
  for (let i = 0; i < 500; i++) {
    const mm = [R(-5, 5), R(-5, 5), R(-5, 5)], rr = R(1, 8), p = [R(-9, 9), R(-9, 9), R(-9, 9)];
    let u; do { u = [R(-4, 4), R(-4, 4), R(-4, 4)]; } while (quadrat(u) === 0);
    const e = geradeKugel(mm, rr * rr, p, u);
    const d2 = qNum(e.d2);
    assert.ok(nah(e.D, 4 * quadrat(u) * (rr * rr - d2), 1e-6), "D = 4u²(r² − d²)");
    assert.equal(e.lage, d2 < rr * rr - 1e-9 ? "sekante" : nah(d2, rr * rr) ? "tangente" : "passante");
    for (const P of e.punkte) assert.ok(nah(quadrat(vSub(P, mm)), rr * rr, 1e-6));
    if (e.lage === "sekante") assert.ok(nah(quadrat(vSub(e.punkte[1], e.punkte[0])), 4 * (rr * rr - d2), 1e-6));
  }
});

test("Herleitung: Ebene und Kugel – Schnittkreis, Berührpunkt, kein Punkt", () => {
  const { m, r } = BEISPIEL;
  const E = ebeneKugel(m, r, BEISPIEL.E.n, BEISPIEL.E.k);
  assert.deepEqual([E.n2, E.nm, wNum(E.d), E.lage, wNum(E.rho)], [9, -3, 3, "kreis", 4]);
  assert.ok(qGleich(E.lambda, q(1)) && gleichQV(E.F, qv([4, 0, 1])));
  const B = ebeneKugel(m, r, BEISPIEL.Eb.n, BEISPIEL.Eb.k);
  assert.ok(B.lage === "beruehrt" && wNum(B.d) === 5 && gleichQV(B.F, [q(16, 3), q(2, 3), q(-1, 3)]));
  assert.ok(nah(B.F.reduce((s, x, i) => s + (qNum(x) - m[i]) ** 2, 0), 25));
  assert.equal(ebeneKugel(m, r, BEISPIEL.Eb2.n, BEISPIEL.Eb2.k).lage, "beruehrt");
  const K = ebeneKugel(m, r, BEISPIEL.Ek.n, BEISPIEL.Ek.k);
  assert.ok(K.lage === "keine" && wNum(K.d) === 6);
  // allgemein: F in E, MF ∥ n, ρ² + d² = r², Kreispunkte auf K und E
  const R = rnd(17);
  for (let i = 0; i < 300; i++) {
    const mm = [R(-5, 5), R(-5, 5), R(-5, 5)], rr = R(1, 8);
    let n; do { n = [R(-4, 4), R(-4, 4), R(-4, 4)]; } while (quadrat(n) === 0);
    const k = R(-30, 30), e = ebeneKugel(mm, rr, n, k);
    const F = e.F.map(qNum);
    assert.ok(nah(skalar(n, F), k, 1e-9));
    assert.ok(nah(quadrat(kreuz(vSub(F, mm), n)), 0, 1e-9));
    assert.ok(nah(wNum(e.d) ** 2, qNum(e.d2), 1e-9) && nah(qNum(e.d2), quadrat(vSub(F, mm)), 1e-9));
    if (e.lage === "kreis") {
      assert.ok(nah(wNum(e.rho) ** 2 + qNum(e.d2), rr * rr, 1e-9));
      const hilf = Math.abs(n[0]) < Math.abs(n[1]) ? [1, 0, 0] : [0, 1, 0];
      const e1 = kreuz(n, hilf), l1 = Math.sqrt(quadrat(e1));
      const X = F.map((f, j) => f + (wNum(e.rho) * e1[j]) / l1);
      assert.ok(nah(quadrat(vSub(X, mm)), rr * rr, 1e-6) && nah(skalar(n, X), k, 1e-6));
    }
  }
});

test("Herleitung: Tangentialebene und Ortung mit drei Kugeln", () => {
  const { m, r, B } = BEISPIEL;
  assert.equal(quadrat(vSub(B, m)), 25);
  const T = tangentialebene(m, B);
  assert.deepEqual(T, { n: [4, -3, 0], k: 36, r2: 25 });
  assert.equal(skalar(T.n, m) + T.r2, T.k, "zweite Form (x − m)·(b − m) = r²");
  const E = ebeneKugel(m, r, T.n, T.k);
  assert.ok(E.lage === "beruehrt" && gleichQV(E.F, qv(B)));
  // Pythagoras: Jeder andere Punkt der Tangentialebene liegt außerhalb
  const R = rnd(23);
  for (let i = 0; i < 200; i++) {
    const s = R(-6, 6), t = R(-6, 6);
    const X = vAdd(B, vAdd([0, 0, s], [3 * t, 4 * t, 0]));          // (0|0|1) und (3|4|0) liegen in T
    assert.equal(skalar(T.n, X), T.k);
    assert.equal(quadrat(vSub(X, m)), 25 + quadrat(vSub(X, B)));
    if (s || t) assert.ok(quadrat(vSub(X, m)) > 25);
  }
  const o = BEISPIEL.ortung, l = ortung(o.r1, o.a, o.r2, o.b, o.r3);
  assert.ok(qGleich(l.x1, q(2)) && qGleich(l.x2, q(3)) && qGleich(l.x3q, q(36)) && wNum(l.x3) === 6);
  for (const P of [[2, 3, 6], [2, 3, -6]]) {
    assert.equal(quadrat(P), o.r1 ** 2);
    assert.equal(quadrat(vSub(P, [o.a, 0, 0])), o.r2 ** 2);
    assert.equal(quadrat(vSub(P, [0, o.b, 0])), o.r3 ** 2);
  }
  assert.equal(wTex(wWurzel(49 - 4)), "3\\sqrt{5}");   // Schnittkreis von K₁ und K₂: Radius √45
});

test("Labor: alle Einstellungen – Lage, Gleichung, Punkte, Schnittkreis", () => {
  for (let m1 = LABOR.m[0]; m1 <= LABOR.m[1]; m1 += 3) for (let m3 = LABOR.m[0]; m3 <= LABOR.m[1]; m3 += 2) {
    const m = [m1, -1, m3];
    for (let r = LABOR.r[0]; r <= LABOR.r[1]; r++) for (let s = -(r + LABOR.extra); s <= r + LABOR.extra; s++) {
      const g = laborGerade(m, r, s);
      assert.deepEqual([g.a, g.b, g.c], [25, -50, s * s + 25 - r * r]);
      assert.equal(g.D, 100 * (r * r - s * s));
      assert.equal(g.lage, Math.abs(s) < r ? "sekante" : Math.abs(s) === r ? "tangente" : "passante");
      for (const P of g.punkte) assert.ok(nah(quadrat(vSub(P, m)), r * r, 1e-9));
      if (g.punkteExakt) for (const P of g.punkteExakt) assert.ok(nah(P.reduce((x, c, i) => x + (qNum(c) - m[i]) ** 2, 0), r * r));
      if (g.lage === "sekante") assert.ok(nah(wNum(g.sehne) ** 2, quadrat(vSub(g.punkte[1], g.punkte[0])), 1e-9));
      if (g.lage === "tangente") assert.deepEqual(g.punkte[0], g.fuss);
      const e = laborEbene(m, r, s);
      assert.ok(Number.isInteger(e.k) && wNum(e.d) === Math.abs(s));
      assert.equal(e.lage, Math.abs(s) < r ? "kreis" : Math.abs(s) === r ? "beruehrt" : "keine");
      if (e.lage === "kreis") assert.ok(nah(wNum(e.rho) ** 2, r * r - s * s));
    }
  }
});

/* typische falsche Antworten – jede muss erkannt werden und eine Begründung bekommen */
function typischFalsch(a) {
  const l = a.loesung, f = [];
  const neg = (t) => (t.startsWith("−") ? t.slice(1) : `−${t}`);
  if (a.art === "gleichung") {
    for (const k of ["m1", "m2", "m3"]) if (k in l && l[k] !== "0") f.push({ ...l, [k]: neg(l[k]) });
    if ("r" in l && a.r2 && qNum(a.r2) !== 1) f.push({ ...l, r: kText(a.r2) });
    if (a.variante === "punkt") f.push({ ...l, r2: String(a.v.reduce((s, x) => s + Math.abs(x), 0)) });
    if (a.variante === "durchmesser") f.push({ ...l, r: wText(wWurzel(4 * quadrat(a.v))) });
    if (a.lin) for (let i = 0; i < 3; i++) if (qNum(a.m[i]) !== 0) f.push({ ...l, [`m${i + 1}`]: kText(q(-qNum(a.lin[i]))) });
  }
  if (a.art === "gerade") {
    if (a.stufe === 1) {
      f.push({ ...l, w: String(a.v.reduce((s, x) => s + Math.abs(x), 0)) });
      f.push({ ...l, lage: a.soll.lage === "innen" ? "aussen" : "innen" });
    } else if (a.stufe === 2) {
      if (a.e.b) f.push({ ...l, b: String(a.e.b / 2) });
      f.push({ ...l, c: String(quadrat(a.e.w)) });
      f.push({ ...l, lage: a.soll.lage === "sekante" ? "passante" : "sekante" });
    } else if (a.stufe === 3) {
      f.push({ ...l, s1: String(a.p[0]), s2: String(a.p[1]), s3: String(a.p[2]) });
      f.push({ ...l, t1: l.s1, t2: l.s2, t3: l.s3 });
    } else if (a.stufe === 4) f.push({ b1: String(a.p[0]), b2: String(a.p[1]), b3: String(a.p[2]) });
    else {
      f.push({ s: wText(wWurzel(a.e.D)) });
      f.push({ s: String(Math.round(wNum(a.sehne) * 50) / 100).replace(".", ",") });
    }
  }
  if (a.art === "ebene") {
    if (a.stufe <= 2) f.push({ ...l, d: String(Math.abs(a.e.diff)) });
    if (a.stufe === 1) f.push({ ...l, lage: a.soll.lage === "kreis" ? "keine" : "kreis" });
    if (a.stufe === 2) f.push({ ...l, rho: String(a.r - qNum(a.soll.d)) });
    if (a.stufe === 3) {
      f.push({ ...l, f1: String(a.m[0]), f2: String(a.m[1]), f3: String(a.m[2]) });
      f.push({ ...l, f1: String(a.m[0] - a.lambda * a.n[0]), f2: String(a.m[1] - a.lambda * a.n[1]), f3: String(a.m[2] - a.lambda * a.n[2]) });
      f.push({ ...l, rho: String(a.r * a.r - 9) });
    }
    if (a.stufe === 4) {
      f.push({ k1: l.k1, k2: l.k1 });
      f.push({ k1: String(a.nm - a.d), k2: String(a.nm + a.d) });
    }
  }
  if (a.art === "tangential") {
    if (a.stufe === 1) f.push({ n1: String(-a.v[0]), n2: String(-a.v[1]), n3: String(-a.v[2]) });
    else if (a.stufe <= 3) {
      f.push({ ...l, k: String(skalar(a.v, a.m)) });
      f.push({ a: String(a.B[0]), b: String(a.B[1]), c: String(a.B[2]), k: l.k });
    } else {
      f.push({ m1: String(a.B[0] - a.versatz[0]), m2: String(a.B[1] - a.versatz[1]), m3: String(a.B[2] - a.versatz[2]) });
      f.push({ m1: String(a.B[0]), m2: String(a.B[1]), m3: String(a.B[2]) });
    }
  }
  return f;
}

/* Die Lösung erfüllt die Geometrie der Aufgabe (unabhängig vom Generator nachgerechnet) */
function geometrie(a, wo) {
  if (a.art === "gleichung") {
    if (a.lin) {
      const f = a.f || 1, lin = (a.linF || a.lin).map(qNum), e = qNum(a.eF || a.e);
      const k = kugelAusAllgemein(...lin, e, a.variante === "faktor" ? f : 1);
      assert.ok(k.art === "kugel" && gleichQV(k.m, a.m.map((x) => (typeof x === "number" ? q(x) : x))) && qGleich(k.r2, a.r2), wo);
      assert.ok(a.text.includes(kugelAllgTex(a.variante === "faktor" ? f : 1, a.linF || a.lin, a.eF || a.e)), wo);
    }
    if (a.variante === "durchmesser") assert.deepEqual(vAdd(a.A, a.B), a.m.map((x) => 2 * x), wo);
    if (a.variante === "punkt") assert.equal(quadrat(vSub(a.P, a.m)), qNum(a.r2), wo);
    assert.ok(qNum(a.r2) > 0, wo);
  }
  if (a.art === "gerade") {
    const r2 = a.r * a.r;
    if (a.stufe === 1) { assert.equal(quadrat(vSub(a.P, a.m)), qNum(a.soll.w)); assert.equal(punktLage(a.m, a.r, a.P).lage, a.soll.lage); return; }
    // Koeffizienten = numerisches Einsetzen
    for (const t of [-2, 0.5, 3]) {
      const X = a.p.map((p, i) => p + t * a.u[i]);
      assert.ok(nah(a.e.a * t * t + a.e.b * t + a.e.c, quadrat(vSub(X, a.m)) - r2, 1e-9), wo);
    }
    if (a.stufe === 3) for (const S of a.S) { assert.equal(quadrat(vSub(S, a.m)), r2, wo); assert.equal(quadrat(kreuz(vSub(S, a.p), a.u)), 0, wo); }
    if (a.stufe === 3) assert.ok(!a.S[0].every((x, i) => x === a.S[1][i]), wo);
    if (a.stufe === 4) { assert.equal(a.e.D, 0, wo); assert.equal(quadrat(vSub(a.B, a.m)), r2); assert.equal(quadrat(kreuz(vSub(a.B, a.p), a.u)), 0); }
    if (a.stufe === 5) { assert.equal(a.e.lage, "sekante", wo); assert.ok(nah(wNum(a.sehne) ** 2, quadrat(vSub(a.e.punkte[1], a.e.punkte[0])), 1e-6), wo); }
    assert.ok(quadrat(vSub(a.p, a.m)) !== r2, `${wo}: Stützpunkt liegt nicht auf K`);
  }
  if (a.art === "ebene") {
    if (a.stufe <= 3) {
      const nl = Math.sqrt(quadrat(a.n));
      assert.ok(nah(Math.abs(skalar(a.n, a.m) - a.k) / nl, a.stufe === 3 ? 3 : qNum(a.soll.d)), wo);
    }
    if (a.stufe >= 2 && a.stufe <= 3) assert.ok(nah(wNum(a.soll.rho) ** 2 + qNum(a.e.d2), a.r * a.r), wo);
    if (a.stufe === 3) {
      const F = ["f1", "f2", "f3"].map((k) => qNum(a.soll[k]));
      assert.equal(skalar(a.n, F), a.k); assert.equal(quadrat(kreuz(vSub(F, a.m), a.n)), 0);
    }
    if (a.stufe === 4) for (const k of a.k) {
      const e = ebeneKugel(a.m, a.r, a.n, k);
      assert.equal(e.lage, a.variante === "beruehren" ? "beruehrt" : "kreis", wo);
      if (a.rho) assert.ok(nah(wNum(e.rho), a.rho), wo);
    }
  }
  if (a.art === "tangential") {
    if (a.stufe <= 3) {
      assert.equal(quadrat(vSub(a.B, a.m)), a.r * a.r, wo);
      const T = tangentialebene(a.m, a.B);
      assert.equal(ebeneKugel(a.m, a.r, T.n, T.k).lage, "beruehrt", wo);
      if (a.stufe === 3) { const k = kugelAusAllgemein(...a.lin.map(qNum), qNum(a.e)); assert.ok(gleichQV(k.m, qv(a.m)) && qGleich(k.r2, q(a.r * a.r)), wo); }
    } else {
      const M = ["m1", "m2", "m3"].map((k) => qNum(a.soll[k]));
      assert.equal(skalar(a.n, a.B), a.k, wo);
      assert.equal(quadrat(vSub(M, a.B)), a.r * a.r, wo);
      assert.equal(quadrat(kreuz(vSub(M, a.B), a.n)), 0, wo);
      assert.ok(M[2] > a.B[2], `${wo}: Mittelpunkt oberhalb`);
      assert.ok(nah(Math.abs(skalar(a.n, M) - a.k) / Math.sqrt(quadrat(a.n)), a.r), wo);
    }
  }
}

test("Generatoren: alle Arten und Stufen über viele Startwerte – lösbar, Fehler erkannt, Rechenweg sauber", () => {
  for (const { id } of ARTEN) {
    assert.equal(stufenZahl(id), STUFEN_NAMEN[id].length);
    assert.ok(stufenZahl(id) >= 3 && stufenZahl(id) <= 5);
    for (let s = 1; s <= stufenZahl(id); s++) for (let seed = 1; seed <= 250; seed++) {
      const a = aufgabe(id, s, rnd(seed * 31 + s * 7));
      const wo = `${id} Stufe ${s} Startwert ${seed}`;
      assert.equal(a.art, id, wo); assert.equal(a.stufe, s, wo);
      assert.ok(a.text.length > 40 && tipp(a).length > 20, wo);
      assert.ok(a.keys.length >= 1 && a.keys.every((k) => k in a.soll && k in a.loesung), wo);
      assert.equal(pruefe(a, a.loesung).ok, true, `${wo}: ${JSON.stringify(a.loesung)}`);
      assert.equal(pruefe(a, {}).ok, false, wo);
      assert.ok(pruefe(a, {}).grund.length > 20, wo);
      geometrie(a, wo);
      // Wurzel-Antworten auch gerundet; Gruppen auch vervielfacht bzw. vertauscht
      const gerundet = { ...a.loesung };
      for (const k of a.keys) if (a.typen[k] === "w") gerundet[k] = String(Math.round(wNum(a.soll[k]) * 100) / 100).replace(".", ",");
      assert.equal(pruefe(a, gerundet).ok, true, `${wo}: gerundet ${JSON.stringify(gerundet)}`);
      for (const g of a.gruppen || []) {
        const x = { ...a.loesung };
        if (g.art === "proportional") for (const k of g.ks) x[k] = kText(q(-2 * qNum(a.soll[k])));
        else { const [A, B] = g.ks; A.forEach((k, i) => { x[k] = a.loesung[B[i]]; x[B[i]] = a.loesung[k]; }); }
        assert.equal(pruefe(a, x).ok, true, `${wo}: Gruppe ${g.art}`);
      }
      for (const f of typischFalsch(a)) {
        const e = pruefe(a, f);
        if (e.ok) continue;
        assert.ok(e.grund.length > 20, `${wo}: keine Rückmeldung für ${JSON.stringify(f)}`);
        assert.doesNotMatch(e.grund, /undefined|NaN|null/, `${wo}: ${e.grund}`);
      }
      const rw = rechenweg(a);
      assert.ok(rw.length >= 2, wo);
      for (const z of rw) {
        assert.ok(a5ok(z), `${wo}: A5 ${z}`);
        assert.doesNotMatch(z, /undefined|NaN|null|\+ −|− −/, `${wo}: ${z}`);
      }
      assert.equal(ergebnisTex(a), rw[rw.length - 1]);
      // die Ergebniszeile enthält die Lösung
      for (const k of a.keys) {
        const typ = a.typen[k];
        if (typ === "wahl") continue;
        const t = typ === "w" ? wTex(a.soll[k]) : kTex(a.soll[k]);
        if (a.gruppen?.some((g) => g.art === "proportional" && g.ks.includes(k))) continue;
        assert.ok(rw[rw.length - 1].includes(t), `${wo}: Ergebnis ${t} fehlt in ${rw[rw.length - 1]}`);
      }
      for (const t of [a.text, tipp(a)]) assert.doesNotMatch(t, /undefined|NaN|\+ −|− −/, `${wo}: ${t}`);
    }
  }
});

test("Generatoren: Lagen kommen in allen Fällen vor", () => {
  const zaehle = (art, s) => { const c = {}; for (let seed = 1; seed <= 200; seed++) { const a = aufgabe(art, s, rnd(seed)); c[a.soll.lage] = (c[a.soll.lage] || 0) + 1; } return c; };
  assert.deepEqual(Object.keys(zaehle("gerade", 1)).sort(), ["auf", "aussen", "innen"]);
  assert.deepEqual(Object.keys(zaehle("gerade", 2)).sort(), ["passante", "sekante", "tangente"]);
  assert.deepEqual(Object.keys(zaehle("ebene", 1)).sort(), ["beruehrt", "keine", "kreis"]);
});

test("Gliederung, Tipps, Kolloquium", () => {
  assert.equal(GLIEDERUNG.length, 5);
  const summe = GLIEDERUNG.reduce((s, g) => s + g.min, 0);
  assert.ok(summe >= 15 && summe <= 18, String(summe));
  assert.equal(TIPPS.length, 3);
  assert.ok(KOLLOQUIUM.length >= 10 && KOLLOQUIUM.length <= 12);
  assert.ok(KOLLOQUIUM.every((k) => k.frage.endsWith("?") && k.antwort.length > 80 && ["Basis", "Vertiefung", "Profi"].includes(k.stufe)));
  for (const st of ["Basis", "Vertiefung", "Profi"]) assert.ok(KOLLOQUIUM.some((k) => k.stufe === st), st);
  // reiner Text (ohne Formelsatz): keine Wurzelzeichen, nichts unvereinfacht
  for (const t of [...GLIEDERUNG.map((g) => g.text), ...TIPPS, ...KOLLOQUIUM.flatMap((k) => [k.frage, k.antwort])]) {
    assert.ok(a5ok(t), t);
    assert.ok(!t.includes("√"), `Wurzel im Klartext: ${t}`);
  }
});

test("Seite: Exporte, Animationen, Eingaben über MatheFeld, TeX in Attributen nur als {\"…\"}", () => {
  const s = readFileSync(new URL("../src/funcGfsKugeln.jsx", import.meta.url), "utf8");
  assert.match(s, /export function GfsKugelnSeite\(\{ gehe \}\)/);
  assert.match(s, /export function KugelnBild\(/);
  assert.match(s, /viewBox="0 0 160 120"/);
  const anims = [...s.matchAll(/<KugelnAnimation art="([a-z]+)"/g)].map((m) => m[1]);
  assert.ok(new Set(anims).size >= 3 && new Set(anims).size <= 5, `Animationen: ${anims}`);
  for (const a of anims) assert.match(s, new RegExp(`\\n  ${a}: \\{ titel:`), `Szene ${a} fehlt`);
  assert.doesNotMatch(s, /\s[a-zA-Z]+="[^"{}]*\\\\[a-zA-Z{]/);
  assert.match(s, /MatheFeld/);
  for (const m of s.matchAll(/<input\b[^>]*>/g)) assert.match(m[0], /type="range"/, `nur Regler als <input>: ${m[0]}`);
  for (const b of ["Formeln", "Schritt", "Kasten", "Chip", "RoterFaden", "Kolloquium", "AnimKarte"]) assert.match(s, new RegExp(`\\b${b}\\b`));
  assert.match(s, /from "\.\/funcGfsBausteine\.jsx"/);
  assert.match(s, /window\.__kugelAufgabe/);
  // Schritttexte der Animationen kurz (Lesezeit) und ohne Wurzelzeichen (der Player setzt Klartext)
  for (const m of s.matchAll(/\{ von: [\d.]+, text: "([^"]+)" \}/g)) {
    assert.ok(m[1].length <= 160, `Schritttext zu lang (${m[1].length}): ${m[1]}`);
    assert.ok(!m[1].includes("√"), m[1]);
  }
});
