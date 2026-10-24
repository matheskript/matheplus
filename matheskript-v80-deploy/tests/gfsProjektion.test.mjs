/* GFS · Projektionen mit Matrizen (gfsProjektion.js)
   Mathematik der Herleitung exakt mit Brüchen nachgerechnet (Schatten als Gerade ∩ Ebene, Linearität,
   Spalten = Bilder der Einheitsvektoren, Matrix mal Vektor auf beiden Wegen, Verkettung = Matrixprodukt,
   A · A = A, A · v = 0, orthogonale Projektion mit Probe, Schrägbild = Schatten auf die Rückwand,
   Zentralprojektion nicht linear), Generatoren über viele Startwerte (gültig, Lösung besteht die eigene
   Prüfung, typische Fehler fallen durch und bekommen eine Begründung, Rechenweg endet beim Ergebnis,
   Brüche gekürzt), dazu die Hausregeln in den Quelltexten. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  zufallszahlen, wuerfelAus, Q, qAdd, qSub, qMul, qDiv, qWert, qGleich, qNull, qGanz, qTex, qText, liesQ, ggT,
  V, vAdd, vSub, vMal, skalar, vGleich, vTex, einheitsvektor, MAT, spalte, ausSpalten, transponiert, matVek, spaltenSumme, matMal, mGleich,
  EINHEIT, matrixAus, matrixGanz, schatten, schattenT, schattenMatrix, ortho, orthoLambda, orthoMatrix, SCHRAEG, schraeg, schraegZahl,
  SCHRAEG_LICHT, zentral, LICHT, BEISPIEL_F, BEISPIEL_P, NORMALE, BEISPIEL_Q, HAUS, laborMatrix, laborErlaubt, linTerm, GEOMETRISCH,
  ARTEN, STUFEN_NAMEN, aufgabe, felder, auftrag, pruefe, rechenweg, tipp, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "../src/gfsProjektion.js";

const zufallsP = (z, lo = -4, hi = 5) => V(z(lo, hi), z(lo, hi), z(lo, hi));
const gekuerzt = (zeile) => [...zeile.matchAll(/\\frac\{(\d+)\}\{(\d+)\}/g)].every(([, a, b]) => ggT(+a, +b) === 1);
/* Eingaben aus einem Vektor/einer Matrix */
const alsEingabe = (a, werte) => {
  const { keys } = felder(a);
  if (a.art === "aufstellen") return Object.fromEntries(keys.map((k) => [k, qText(werte[Number(k[1]) - 1][Number(k[2]) - 1])]));
  return Object.fromEntries(keys.map((k, i) => [k, qText(werte[i])]));
};

test("Brüche, Vektoren, Matrizen, Eingaben", () => {
  assert.deepEqual(Q(4, -6), { z: -2, n: 3 }); assert.deepEqual(Q(0, -5), { z: 0, n: 1 });
  assert.ok(qGleich(qAdd(Q(1, 3), Q(1, 6)), Q(1, 2)) && qGleich(qMul(Q(2, 3), 3), 2) && qGleich(qDiv(1, Q(1, 4)), 4) && qGleich(qSub(1, Q(1, 3)), Q(2, 3)));
  assert.equal(qTex(Q(-7, 3)), "−\\frac{7}{3}"); assert.equal(qText(Q(-7, 3)), "−7/3"); assert.equal(qTex(Q(5)), "5");
  assert.ok(qGleich(liesQ("−3/4"), Q(-3, 4)) && qGleich(liesQ("-3/4"), Q(-3, 4)) && qGleich(liesQ("1,5"), Q(3, 2)) && qGleich(liesQ("-0,25"), Q(-1, 4)));
  assert.ok(qGleich(liesQ("3/-4"), Q(-3, 4)) && qGleich(liesQ(" 2 "), 2) && qGleich(liesQ("1,5/2"), Q(3, 4)) && qGleich(liesQ("0.5"), Q(1, 2)));
  for (const s of ["", "abc", "3/0", "1/2/3", "-", ","]) assert.equal(liesQ(s), null, s);
  assert.equal(vTex(V(1, Q(-1, 2), 0)), "\\spalte{1}{−\\frac{1}{2}}{0}");
  assert.equal(linTerm([2, 0, -1]), "2p_1 − p_3"); assert.equal(linTerm([0, -1, 0]), "−p_2"); assert.equal(linTerm([0, 0, 0]), "0");
  assert.equal(linTerm([-1, 3, 3], "x"), "−x_1 + 3x_2 + 3x_3");
  const A = MAT([[1, 2, 0], [0, -1, 3], [2, 0, 1]]);
  assert.ok(mGleich(transponiert(transponiert(A)), A) && vGleich(spalte(A, 1), V(2, -1, 0)) && mGleich(ausSpalten([0, 1, 2].map((j) => spalte(A, j))), A));
  assert.deepEqual(matrixGanz(orthoMatrix(NORMALE)), { d: 9, M: [[8, 2, 2], [2, 5, -4], [2, -4, 5]] });
});

test("Herleitung Schritt 1–3: Schatten als Gerade ∩ Boden, linear, Spalten = Bilder der Einheitsvektoren", () => {
  // Hausecke F(2 | 2 | 2) bei Licht (1 | 2 | −2): t = 1, Schatten (3 | 4 | 0)
  assert.ok(qGleich(schattenT(BEISPIEL_F, LICHT), 1) && vGleich(schatten(BEISPIEL_F, LICHT), V(3, 4, 0)));
  // Rechenvorschrift P′ = (p₁ + ½p₃ | p₂ + p₃ | 0) und Matrix
  const A = schattenMatrix(LICHT);
  assert.ok(mGleich(A, MAT([[1, 0, Q(1, 2)], [0, 1, 1], [0, 0, 0]])));
  const z = wuerfelAus(zufallszahlen(3));
  for (let i = 0; i < 300; i++) {
    const P = zufallsP(z), R = zufallsP(z), r = Q(z(-5, 5), z(1, 4)), s = Q(z(-5, 5), z(1, 4));
    const S = schatten(P, LICHT);
    assert.ok(vGleich(S, V(qAdd(P[0], qMul(Q(1, 2), P[2])), qAdd(P[1], P[2]), 0)), "Rechenvorschrift");
    assert.ok(vGleich(matVek(A, P), S), "Matrix mal Vektor = Schatten");
    assert.ok(vGleich(spaltenSumme(A, P), matVek(A, P)), "Spalten gewichtet addieren = Zeile mal Vektor");
    const kombi = vAdd(vMal(r, P), vMal(s, R));
    assert.ok(vGleich(schatten(kombi, LICHT), vAdd(vMal(r, schatten(P, LICHT)), vMal(s, schatten(R, LICHT)))), "linear");
    // allgemein für jede Lichtrichtung und jede Koordinatenebene
    const k = z(0, 2), v = zufallsP(z, -3, 3); if (qNull(v[k])) v[k] = Q(-2);
    assert.ok(vGleich(matVek(schattenMatrix(v, k), P), schatten(P, v, k)) && qNull(schatten(P, v, k)[k]));
  }
  for (let j = 0; j < 3; j++) assert.ok(vGleich(matVek(A, einheitsvektor(j)), spalte(A, j)), "A · e_j = Spalte j");
  // Beispiel der Animation „Spalten“: P(1 | 2 | 2) ↦ (2 | 4 | 0) = Spalte 1 + 2 · Spalte 2 + 2 · Spalte 3
  assert.ok(vGleich(BEISPIEL_P, V(1, 2, 2)) && vGleich(matVek(A, BEISPIEL_P), V(2, 4, 0)) && vGleich(schatten(BEISPIEL_P, LICHT), V(2, 4, 0)));
  assert.ok(vGleich(vAdd(vAdd(spalte(A, 0), vMal(2, spalte(A, 1))), vMal(2, spalte(A, 2))), V(2, 4, 0)));
  // im Schrägbild fällt P nicht auf einen anderen gezeichneten Punkt (e₃, Ursprung, Bildpunkt)
  for (const X of [V(0, 0, 1), V(0, 0, 0), V(2, 4, 0), V(1, 2, 0)]) assert.ok(!vGleich(schraeg(BEISPIEL_P), schraeg(X)));
  // Lichtrichtung wird zu 0, Boden bleibt
  assert.ok(vGleich(matVek(A, LICHT), V(0, 0, 0)));
  assert.ok(vGleich(matVek(A, V(5, -3, 0)), V(5, -3, 0)));
  // Dach-First S(2 | 1 | 3) und T(0 | 1 | 3)
  assert.ok(vGleich(schatten(V(2, 1, 3), LICHT), V(Q(7, 2), 4, 0)) && vGleich(schatten(V(0, 1, 3), LICHT), V(Q(3, 2), 4, 0)));
});

test("Herleitung Schritt 4–5: Lot auf eine Ebene durch 0, Probe, Matrix, A · A = A, Verkettung = Matrixprodukt", () => {
  // Beispiel Q(1 | 2 | 3), n = (−1 | 2 | 2): λ = 1, Q′ = (2 | 0 | 1)
  assert.ok(qGleich(orthoLambda(BEISPIEL_Q, NORMALE), 1) && vGleich(ortho(BEISPIEL_Q, NORMALE), V(2, 0, 1)));
  assert.ok(qNull(skalar(ortho(BEISPIEL_Q, NORMALE), NORMALE)) && vGleich(vSub(BEISPIEL_Q, ortho(BEISPIEL_Q, NORMALE)), NORMALE));
  const A = orthoMatrix(NORMALE);
  assert.ok(mGleich(A, MAT([[Q(8, 9), Q(2, 9), Q(2, 9)], [Q(2, 9), Q(5, 9), Q(-4, 9)], [Q(2, 9), Q(-4, 9), Q(5, 9)]])));
  assert.ok(vGleich(matVek(A, BEISPIEL_Q), V(2, 0, 1)));
  assert.equal(qWert(skalar(V(8, 2, 2), BEISPIEL_Q)), 18);   // Probe im Text: 1/9 · (8 · 1 + 2 · 2 + 2 · 3) = 2
  assert.ok(mGleich(matMal(A, A), A), "A · A = A");
  assert.ok(vGleich(matVek(A, spalte(A, 0)), spalte(A, 0)), "Schritt 5: erste Spalte bleibt");
  assert.ok(mGleich(transponiert(A), A), "symmetrisch");
  const z = wuerfelAus(zufallszahlen(11));
  for (let i = 0; i < 200; i++) {
    let n = zufallsP(z, -3, 3); if (n.every(qNull)) n = V(1, 0, 0);
    const P = zufallsP(z), M = orthoMatrix(n), v = zufallsP(z, -3, 3), k = z(0, 2); if (qNull(v[k])) v[k] = Q(-1);
    const S = schattenMatrix(v, k), B = MAT([[z(-2, 2), z(-2, 2), z(-2, 2)], [z(-2, 2), z(-2, 2), z(-2, 2)], [z(-2, 2), z(-2, 2), z(-2, 2)]]);
    assert.ok(qNull(skalar(ortho(P, n), n)), "Bild liegt in der Ebene");
    assert.ok(vGleich(matVek(M, P), ortho(P, n)) && vGleich(matVek(M, n), V(0, 0, 0)));
    assert.ok(mGleich(matMal(M, M), M) && mGleich(matMal(S, S), S), "Projektionen: A · A = A");
    assert.ok(vGleich(matVek(S, v), V(0, 0, 0)), "Lichtrichtung ↦ 0");
    assert.ok(vGleich(matVek(matMal(M, B), P), matVek(M, matVek(B, P))), "Verkettung = Matrixprodukt");
    // Lotfußpunkt ist der nächste Punkt der Ebene: Abstand zu einem anderen Ebenenpunkt größer
    const X = ortho(zufallsP(z), n), d = (u) => qWert(skalar(vSub(P, u), vSub(P, u)));
    assert.ok(d(ortho(P, n)) <= d(X) + 1e-12);
  }
  assert.ok(!mGleich(matMal(schattenMatrix(LICHT), orthoMatrix(NORMALE)), matMal(orthoMatrix(NORMALE), schattenMatrix(LICHT))), "Reihenfolge zählt");
});

test("Schritt 6: Schrägbild = Schatten auf die Rückwand, Zentralprojektion nicht linear", () => {
  assert.ok(vGleich(spalte(SCHRAEG, 0), V(Q(-1, 2), Q(-1, 2))) && vGleich(spalte(SCHRAEG, 1), V(1, 0)) && vGleich(spalte(SCHRAEG, 2), V(0, 1)));
  // Länge des Bildes von e₁: eine halbe Kästchendiagonale-Einheit … ½√2 ≈ 0,707 cm, unter 45°
  const [u, w] = schraegZahl([1, 0, 0]);
  assert.ok(Math.abs(Math.hypot(u, w) - Math.SQRT2 / 2) < 1e-12 && Math.abs(Math.atan2(w, u) * 180 / Math.PI + 135) < 1e-9);
  const z = wuerfelAus(zufallszahlen(5));
  for (let i = 0; i < 200; i++) {
    const P = zufallsP(z);
    const wand = schatten(P, SCHRAEG_LICHT, 0);
    assert.ok(qNull(wand[0]) && vGleich(schraeg(P), V(wand[1], wand[2])), "Schrägbild = Schatten auf x₁ = 0");
    assert.deepEqual(schraegZahl(P.map(qWert)).map((x) => Math.round(x * 1e9)), schraeg(P).map((x) => Math.round(qWert(x) * 1e9)));
  }
  // Zentralprojektion: Verdoppeln ändert das Bild nicht – also nicht linear
  const P = V(2, 1, 3), P2 = vMal(2, P);
  assert.ok(vGleich(zentral(P), zentral(P2)) && !vGleich(zentral(P2), vMal(2, zentral(P))));
  assert.ok(vGleich(zentral(V(1, 1, 1)), V(1, 1)) && vGleich(zentral(V(2, 1, 1)), V(Q(1, 2), Q(1, 2))), "doppelt so weit weg, halb so groß");
});

test("Haus und Labor", () => {
  assert.equal(HAUS.ecken.length, 10); assert.equal(HAUS.namen.length, 10); assert.equal(HAUS.kanten.length, 17);
  const kanten = new Set(HAUS.kanten.map(([a, b]) => [a, b].sort().join("-")));
  assert.equal(kanten.size, 17);
  assert.deepEqual(HAUS.ecken[HAUS.namen.indexOf("F")], [2, 2, 2]);
  // Labor: nur die dritte Spalte hängt vom Licht ab; Ebene: A · A = A
  for (let v1 = -2; v1 <= 2; v1++) for (let v2 = -2; v2 <= 2; v2++) {
    const A = laborMatrix("schatten", { v1, v2 });
    assert.ok(laborErlaubt("schatten", { v1, v2 }));
    assert.ok(vGleich(spalte(A, 0), V(1, 0, 0)) && vGleich(spalte(A, 1), V(0, 1, 0)) && vGleich(spalte(A, 2), V(Q(v1, 2), Q(v2, 2), 0)));
    assert.ok(mGleich(matMal(A, A), A));
  }
  for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) for (let c = -3; c <= 3; c++) {
    const w = { n1: a, n2: b, n3: c };
    if (!a && !b && !c) { assert.ok(!laborErlaubt("ortho", w)); continue; }
    const A = laborMatrix("ortho", w);
    assert.ok(mGleich(matMal(A, A), A) && vGleich(matVek(A, V(a, b, c)), V(0, 0, 0)));
  }
  assert.ok(!laborErlaubt("schatten", { v1: 3, v2: 0 }));
});

test("Geometrische Abbildungen (Matrix aufstellen, Stufe 4) stimmen", () => {
  const spiegel = (n) => matrixAus((e) => vSub(vMal(2, ortho(e, n)), e));
  const soll = {
    spx3: spiegel(V(0, 0, 1)), spx1: spiegel(V(1, 0, 0)), spx2: spiegel(V(0, 1, 0)), punkt: matrixAus((e) => vMal(-1, e)),
    boden: orthoMatrix(V(0, 0, 1)), achse: matrixAus((e) => vSub(e, ortho(e, V(0, 0, 1)))), tausch: spiegel(V(1, -1, 0)),
    streck2: matrixAus((e) => vMal(2, e)), streckH: matrixAus((e) => vMal(Q(1, 2), e)), schatten: schattenMatrix(V(2, -1, -1)),
  };
  for (const g of GEOMETRISCH) {
    const A = MAT(g.A);
    if (soll[g.id]) assert.ok(mGleich(A, soll[g.id]), g.id);
    else {
      // Drehungen: Spalten senkrecht, Länge 1, Achse fest, angegebene Achse auf die nächste
      assert.ok(mGleich(matMal(transponiert(A), A), EINHEIT), g.id);
      if (g.id === "dreh3") assert.ok(vGleich(matVek(A, V(1, 0, 0)), V(0, 1, 0)) && vGleich(matVek(A, V(0, 0, 1)), V(0, 0, 1)));
      if (g.id === "dreh1") assert.ok(vGleich(matVek(A, V(0, 1, 0)), V(0, 0, 1)) && vGleich(matVek(A, V(1, 0, 0)), V(1, 0, 0)));
    }
    assert.ok(/\$/.test(g.text) || g.id === "punkt" || g.id === "streck2", g.id);
  }
});

test("Generatoren: alle Arten × Stufen × viele Startwerte – gültig, prüfbar, Rechenweg sauber", () => {
  assert.equal(ARTEN.length, 4);
  for (const art of ARTEN) {
    assert.equal(STUFEN_NAMEN[art.id].length, 5);
    for (let s = 1; s <= 5; s++) {
      const gesehen = new Set();
      for (let seed = 1; seed <= 80; seed++) {
        const z = wuerfelAus(zufallszahlen(seed * 31 + s));
        const a = aufgabe(art.id, s, z);
        assert.equal(a.art, art.id); assert.equal(a.stufe, s);
        gesehen.add(JSON.stringify(a.loesung));
        const { keys } = felder(a);
        assert.deepEqual(Object.keys(a.loesung).sort(), [...keys].sort());
        // die eigene Lösung besteht, auch mit ASCII-Minus und Dezimalzahl, wo exakt
        assert.ok(pruefe(a, a.loesung).ok, `${art.id} ${s}: Lösung besteht nicht`);
        assert.ok(pruefe(a, Object.fromEntries(Object.entries(a.loesung).map(([k, v]) => [k, v.replace("−", "-")]))).ok);
        // leer oder Unsinn fällt durch, mit Begründung
        const leer = pruefe(a, {}); assert.ok(!leer.ok && leer.grund.length > 20);
        // Auftrag, Tipp
        const text = auftrag(a);
        assert.ok(text.length > 15 && (text.match(/\$/g) || []).length % 2 === 0, text);
        assert.ok(tipp(a).length > 30);
        // Rechenweg
        const weg = rechenweg(a);
        assert.ok(weg.length >= (a.art === "matvek" ? 1 : 2));
        for (const zeile of weg) {
          assert.ok(gekuerzt(zeile.replace(/\\lambda = −?\\frac\{\d+\}\{\d+\} = /, "")), `${art.id} ${s}: ungekürzt: ${zeile}`);
          assert.ok(!/\b0 \\cdot \\spalte|(^|[=+−] )1 \\cdot \\spalte|\+ [−-]\d|[−-] [−-]\d|\^\{?1\}?(?!\d)/.test(zeile), `${art.id} ${s}: unsauber: ${zeile}`);
          assert.ok(!zeile.includes("NaN") && !zeile.includes("undefined"), zeile);
        }
        if (a.art === "matvek") {
          assert.ok(weg[weg.length - 1].endsWith(vTex(a.soll)), `${art.id} ${s}: ${weg[weg.length - 1]}`);
          const soll = a.B ? matVek(a.A, matVek(a.B, a.x)) : matVek(a.A, a.x);
          assert.ok(vGleich(soll, a.soll));
          if (s === 1) assert.ok(a.A.flat().every((q) => qGanz(q) && q.z >= 0 && q.z <= 2));
          if (s === 3) assert.ok(a.A.flat().some((q) => !qGanz(q)));
          if (s === 5) assert.ok(a.B && !vGleich(matVek(a.B, matVek(a.A, a.x)), a.soll));
          // typische Fehler: transponiert (wenn verschieden), Reihenfolge
          const M = a.A, x = a.B ? matVek(a.B, a.x) : a.x, tr = matVek(transponiert(M), x);
          if (!vGleich(tr, a.soll)) { const e = pruefe(a, alsEingabe(a, tr)); assert.ok(!e.ok && /Spalten|Reihenfolge|eine der beiden/.test(e.grund), e.grund); }
          if (a.B) { const e = pruefe(a, alsEingabe(a, matVek(a.B, matVek(a.A, a.x)))); assert.ok(!e.ok && /Reihenfolge/.test(e.grund), e.grund); }
        }
        if (a.art === "aufstellen") {
          const z2 = weg.join(" ");
          for (let j = 0; j < 3; j++) assert.ok(z2.includes(vTex(spalte(a.soll, j))), `${art.id} ${s}: Spalte ${j} fehlt im Rechenweg`);
          if (!mGleich(transponiert(a.soll), a.soll)) { const e = pruefe(a, alsEingabe(a, transponiert(a.soll))); assert.ok(!e.ok && /Spalten|Zeilen/.test(e.grund), e.grund); }
          if (s === 1) assert.ok(a.bilder.every((b, j) => vGleich(b, spalte(a.soll, j))));
          if (s === 3) { const sv = a.summe.reduce((acc, j) => vAdd(acc, spalte(a.soll, j)), V(0, 0, 0)); assert.ok(vGleich(sv, a.summenBild)); }
          if (s === 5) a.basis.forEach((b, i) => assert.ok(vGleich(matVek(a.soll, b), a.w[i]), "Basisbilder stimmen"));
          if (s === 2) a.regel.forEach((r, i) => assert.equal(r, linTerm(a.soll[i])));
        }
        if (a.art === "schatten") {
          assert.ok(qNull(a.soll[a.k]) && vGleich(a.soll, schatten(a.P, a.v, a.k)) && vGleich(a.soll, matVek(schattenMatrix(a.v, a.k), a.P)));
          assert.ok(a.v[a.k].z < 0 && a.P[a.k].z > 0, "Licht fällt auf die Ebene zu");
          assert.ok(s <= 3 ? a.k === 2 : s === 4 ? a.k !== 2 : true);
          assert.ok(s === 3 || s === 5 ? !qGanz(a.t) : qGanz(a.t));
          assert.ok(weg[weg.length - 1].includes(vTex(a.soll)));
          const e = pruefe(a, alsEingabe(a, vAdd(a.P, vMal(qMul(-1, a.t), a.v)))); assert.ok(!e.ok && /Vorzeichen/.test(e.grund), e.grund);
          const senk = a.P.map((x, i) => (i === a.k ? Q(0) : x));
          const e2 = pruefe(a, alsEingabe(a, senk)); assert.ok(!e2.ok && e2.grund.length > 20);
        }
        if (a.art === "ortho") {
          assert.ok(qNull(skalar(a.soll, a.n)) && vGleich(a.soll, ortho(a.P, a.n)) && !qNull(a.lambda));
          assert.ok(s <= 2 ? qGanz(a.lambda) : !qGanz(a.lambda));
          if (s === 1) assert.equal(qWert(skalar(a.n, a.n)), 2);
          if (s === 2) assert.equal(qWert(skalar(a.n, a.n)), 9);
          assert.ok(weg[weg.length - 2] === `= ${vTex(a.soll)}` && weg[weg.length - 1].endsWith("= 0"));
          const ohne = vSub(a.P, vMal(skalar(a.P, a.n), a.n));
          if (!vGleich(ohne, a.soll)) { const e = pruefe(a, alsEingabe(a, ohne)); assert.ok(!e.ok && /teilen/.test(e.grund), e.grund); }
          const plus = vAdd(a.P, vMal(a.lambda, a.n));
          const e = pruefe(a, alsEingabe(a, plus)); assert.ok(!e.ok && /Minus statt Plus|teilen/.test(e.grund), e.grund);
          if (s >= 3 && a.soll.some((q) => 100 % q.n !== 0)) { const r = pruefe(a, alsEingabe(a, a.soll.map((q) => Q(Math.round(qWert(q) * 100), 100)))); assert.ok(!r.ok); }
        }
      }
      assert.ok(gesehen.size >= (art.id === "aufstellen" && s === 4 ? 8 : 20), `${art.id} ${s}: zu wenig Abwechslung (${gesehen.size})`);
    }
  }
});

test("Gezielte Rückmeldung: Dezimalnäherung, Ebenenkoordinate, Probe", () => {
  let a, seed = 1;
  do a = aufgabe("ortho", 3, wuerfelAus(zufallszahlen(seed++))); while (!a.soll.some((q) => q.n % 3 === 0));
  const fast = a.soll.map((q) => String(Math.round(qWert(q) * 1000) / 1000).replace(".", ","));
  const e = pruefe(a, { x1: fast[0], x2: fast[1], x3: fast[2] });
  assert.ok(!e.ok && /exakt als Bruch/.test(e.grund), e.grund);
  const sch = aufgabe("schatten", 1, wuerfelAus(zufallszahlen(4)));
  const falsch = vAdd(sch.soll, V(0, 0, 0)); falsch[sch.k] = Q(1);
  assert.match(pruefe(sch, alsEingabe(sch, falsch)).grund, /muss 0 sein/);
  const o = aufgabe("ortho", 2, wuerfelAus(zufallszahlen(9)));
  const daneben = vAdd(o.soll, V(1, 0, 0));
  assert.match(pruefe(o, alsEingabe(o, daneben)).grund, /Probe/);
  const auf = aufgabe("aufstellen", 3, wuerfelAus(zufallszahlen(6)));
  const mitSumme = ausSpalten([spalte(auf.soll, 0), spalte(auf.soll, 1), auf.summenBild]);
  assert.match(pruefe(auf, alsEingabe(auf, mitSumme)).grund, /Summenbild|Spalte/);
});

test("Gliederung, Tipps, Kolloquium", () => {
  assert.equal(GLIEDERUNG.length, 5);
  const summe = GLIEDERUNG.reduce((s, g) => s + g.min, 0);
  assert.ok(summe >= 15 && summe <= 18, String(summe));
  assert.equal(TIPPS.length, 3);
  assert.ok(KOLLOQUIUM.length >= 10 && KOLLOQUIUM.length <= 12);
  assert.ok(KOLLOQUIUM.every((q) => q.frage.endsWith("?") && q.antwort.length > 120 && ["Basis", "Vertiefung", "Profi"].includes(q.stufe)));
  for (const st of ["Basis", "Vertiefung", "Profi"]) assert.ok(KOLLOQUIUM.filter((q) => q.stufe === st).length >= 3, st);
  const rang = { Basis: 0, Vertiefung: 1, Profi: 2 };
  KOLLOQUIUM.forEach((q, i) => { if (i) assert.ok(rang[q.stufe] >= rang[KOLLOQUIUM[i - 1].stufe]); });
  // Zahlen in den Antworten stimmen
  const alle = KOLLOQUIUM.map((q) => q.antwort).join(" ");
  assert.match(alle, /\(3 \| 4 \| 0\)/); assert.ok(vGleich(schatten(BEISPIEL_F, LICHT), V(3, 4, 0)));
  assert.match(alle, /Q′ = \(2 \| 0 \| 1\)/); assert.match(alle, /\(−2 \| −1 \| −1\)/);
  assert.match(alle, /\(p₂\/p₁ \| p₃\/p₁\)/);
});

/* ---------- Hausregeln in den Quelltexten ---------- */
test("Quelltexte: Exporte, Animationen, Eingaben, keine TeX-Attribute, keine Gendersprache, kein Selbst-Scrollen", () => {
  const jsx = readFileSync(new URL("../src/funcGfsProjektion.jsx", import.meta.url), "utf8");
  const js = readFileSync(new URL("../src/gfsProjektion.js", import.meta.url), "utf8");
  assert.match(jsx, /export function GfsProjektionSeite\(\{ gehe \}\)/);
  assert.match(jsx, /export function ProjektionBild\(\)/);
  assert.match(jsx, /className="gtk-bild" viewBox="0 0 160 120"/);
  assert.match(jsx, /from "\.\/funcGfsBausteine\.jsx"/);
  assert.match(jsx, /from "\.\/funcAnimKarte\.jsx"/);
  const anims = [...jsx.matchAll(/<ProjektionAnimation art="([a-z0-9]+)"/g)].map((m) => m[1]);
  assert.ok(new Set(anims).size >= 3 && new Set(anims).size <= 5, `Animationen: ${anims}`);
  for (const a of anims) assert.match(jsx, new RegExp(`\\n  ${a}: \\{ titel:`), `Szene ${a} fehlt`);
  for (const m of jsx.matchAll(/\{ von: [\d.]+, text: "([^"]+)" \}/g)) assert.ok(m[1].length <= 140, `zu langer Schritttext: ${m[1]}`);
  assert.match(jsx, /<MatheFeld modus="bruch"/);
  assert.ok(!/<input\b/.test(jsx), "kein <input> – MatheFeld benutzen");
  assert.match(jsx, /window\.__projAufgabe/);
  for (const [name, q] of [["jsx", jsx], ["js", js]]) {
    q.split("\n").forEach((z, i) => {
      assert.ok(!/\s[a-zA-Z]+="[^"{}]*\\\\[a-zA-Z{]/.test(z), `${name}:${i + 1}: TeX im JSX-Attribut`);
      assert.ok(!/[*:_]innen\b|[a-zäöü]Innen\b/.test(z), `${name}:${i + 1}: Gendersprache`);
      assert.ok(!/\.(scrollTo|scrollIntoView|scrollBy)\s*\(/.test(z), `${name}:${i + 1}: Scrollen nur über springe()`);
      assert.ok(!z.includes("√"), `${name}:${i + 1}: Wurzeln nur über \\sqrt`);
    });
    assert.ok(!/Lambacher|Schweizer|Klett|Abi-relevant/.test(q.replace(/\/\*[\s\S]*?\*\//g, "")), `${name}: keine Buchverweise, keine Abi-Werbung`);
  }
  const ohneKopf = jsx.slice(0, jsx.indexOf("export function ProjektionBild")) + jsx.slice(jsx.indexOf("Erkläranimationen (Szenen"));
  const fremd = [...ohneKopf.matchAll(/"#[0-9A-Fa-f]{3,6}"/g)].map((m) => m[0]).filter((f) => !["\"#FFF3C4\"", "\"#FFF6D6\"", "\"#E6ECF8\"", "\"#FBEFE9\""].includes(f));
  assert.deepEqual(fremd, [], "Farben aus C verwenden");
});
