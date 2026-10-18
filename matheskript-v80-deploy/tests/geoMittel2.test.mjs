import test from "node:test";
import assert from "node:assert/strict";
import {
  LAGEN, lagenWert, beziehung, BEZ_GLEICH, WINKEL_ARTEN, winkelAufgabe,
  satzgruppe, KATH_ARTEN, kathAufgabe, KREIS_ARTEN, kreisAufgabe, KOERPER_ARTEN, koerperAufgabe, koerper,
  schwerpunkt, umkreismitte, inkreismitte, hoehenschnitt, KONSTR_ARTEN, konstrAufgabe,
} from "../src/geoMittel2.js";

const nah = (a, b, e = 1e-9) => Math.abs(a - b) <= e;
const ab = (P, Q) => Math.hypot(P[0] - Q[0], P[1] - Q[1]);

/* Geometrisch nachrechnen: Winkel an zwei echten Schnittpunkten bestimmen */
function echterWinkel(s, lage, phi) {
  const t = [Math.cos(phi * Math.PI / 180), Math.sin(phi * Math.PI / 180)];
  const strahl = { or: [[1, 0], t], ol: [[-1, 0], t], ur: [[1, 0], [-t[0], -t[1]]], ul: [[-1, 0], [-t[0], -t[1]]] }[lage];
  const [u, v] = strahl;
  return Math.acos(u[0] * v[0] + u[1] * v[1]) * 180 / Math.PI;
}

test("Parallelen: Lagenwerte stimmen geometrisch, benannte Beziehungen sind korrekt", () => {
  for (const phi of [20, 35, 57, 74, 89]) for (const l of LAGEN) assert.ok(nah(lagenWert(l, phi), echterWinkel(1, l, phi), 1e-9), `${l} ${phi}`);
  for (const s1 of [1, 2]) for (const l1 of LAGEN) for (const s2 of [1, 2]) for (const l2 of LAGEN) {
    const b = beziehung(s1, l1, s2, l2);
    if (b in BEZ_GLEICH) {
      const w1 = lagenWert(l1, 50), w2 = lagenWert(l2, 50);
      assert.equal(BEZ_GLEICH[b] ? nah(w1, w2) : nah(w1 + w2, 180), true, `${s1}${l1}-${s2}${l2} ${b}`);
    }
  }
  assert.equal(beziehung(1, "ul", 2, "or"), "wechsel");
  assert.equal(beziehung(1, "ur", 2, "or"), "nachbar");
  assert.equal(beziehung(1, "or", 2, "or"), "stufen");
});

test("Winkelsätze: alle Aufgaben stimmig (je 1500 Läufe)", () => {
  for (const art of WINKEL_ARTEN) for (let i = 0; i < 1500; i++) {
    const au = winkelAufgabe(art);
    if (art === "parallel") { assert.ok(au.bez in BEZ_GLEICH); assert.equal(au.gesucht, BEZ_GLEICH[au.bez] ? au.gegeben : 180 - au.gegeben); }
    if (art === "dreieck") { assert.equal(au.a + au.b + au.c, 180); assert.ok(au.c > 0); }
    if (art === "gleichschenklig") { assert.equal(au.spitze + 2 * au.basis, 180); assert.ok(au.spitze > 0); }
    if (art === "aussen") { assert.equal(au.aussen + au.innen, 180); assert.equal(au.aussen, au.a + au.b); }
    if (art === "neck") assert.equal(au.summe, (au.n - 2) * 180);
    if (art === "regelmaessig") { assert.ok(nah(au.innen + au.aussen, 180)); assert.ok(nah(au.innen * au.n, au.summe)); }
  }
});

test("Kathetensatz und Höhensatz: Satzgruppe stimmt, Aufgaben stimmig", () => {
  for (const [a, b] of [[3, 4], [5, 12], [7, 24], [1.5, 2]]) {
    const s = satzgruppe(a, b);
    assert.ok(nah(s.p + s.q, s.c)); assert.ok(nah(a * a, s.c * s.p)); assert.ok(nah(b * b, s.c * s.q)); assert.ok(nah(s.h * s.h, s.p * s.q));
    assert.ok(nah(a * b, s.c * s.h));
  }
  for (const art of KATH_ARTEN) for (let i = 0; i < 1000; i++) {
    const au = kathAufgabe(art);
    if (art === "hoehe" || art === "rueck") { assert.ok(Number.isInteger(au.h)); assert.equal(au.h * au.h, au.p * au.q); }
    else { assert.ok(nah(au.a * au.a, au.c * au.p)); assert.ok(Number.isInteger(au.c)); }
  }
});

test("Kreis: Formeln und Rückrechnung (je 1000 Läufe)", () => {
  for (const art of KREIS_ARTEN) for (let i = 0; i < 1000; i++) {
    const au = kreisAufgabe(art);
    if (art === "radiusU") assert.ok(nah(au.wert, au.r, 0.01));
    if (art === "radiusA") assert.ok(nah(au.wert, au.r, 0.01));
    if (art === "bogen") assert.ok(nah(au.wert, au.umfang * au.alpha / 360));
    if (art === "sektor") assert.ok(nah(au.wert, au.flaeche * au.alpha / 360));
    if (art === "ring") assert.ok(au.R > au.r && au.wert > 0);
    if (art === "durchmesser") assert.equal(au.r * 2, au.d);
    assert.ok(au.wert > 0);
  }
});

test("Körper: Formeln gegen unabhängige Rechnung, Aufgaben stimmig", () => {
  const z = koerper.zylinder({ r: 2, h: 5 }); assert.ok(nah(z.V, 20 * Math.PI)); assert.ok(nah(z.O, 8 * Math.PI + 20 * Math.PI));
  const p = koerper.pyramide({ a: 6, h: 4 }); assert.ok(nah(p.hs, 5)); assert.ok(nah(p.V, 48)); assert.ok(nah(p.O, 36 + 60));
  const k = koerper.kegel({ r: 3, h: 4 }); assert.ok(nah(k.s, 5)); assert.ok(nah(k.V, 12 * Math.PI)); assert.ok(nah(k.O, 9 * Math.PI + 15 * Math.PI));
  const u = koerper.kugel({ r: 3 }); assert.ok(nah(u.V, 36 * Math.PI)); assert.ok(nah(u.O, 36 * Math.PI));
  const r = koerper.prisma({ a: 3, b: 4, h: 10 }); assert.ok(nah(r.V, 60)); assert.ok(nah(r.O, 12 + 120));
  for (const art of KOERPER_ARTEN) for (let i = 0; i < 800; i++) {
    const au = koerperAufgabe(art);
    if (art === "hoehe") assert.ok(nah(au.hWert, au.m.h, 0.01));
    if (art === "pyrO") assert.ok(Number.isInteger(au.hs) || nah(au.hs, Math.hypot(au.m.h, au.m.a / 2)));
    if (art === "kegO") assert.ok(Number.isInteger(au.s));
  }
});

test("Besondere Punkte: Definitionen geometrisch erfüllt (500 zufällige Dreiecke)", () => {
  for (let i = 0; i < 500; i++) {
    const A = [Math.random() * 10, Math.random() * 10], B = [Math.random() * 10, Math.random() * 10], C = [Math.random() * 10, Math.random() * 10];
    const fl = Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) / 2;
    if (fl < 1) continue;
    const U = umkreismitte(A, B, C);
    assert.ok(nah(ab(U, A), ab(U, B), 1e-6) && nah(ab(U, A), ab(U, C), 1e-6));
    const { M, r } = inkreismitte(A, B, C);
    const dist = (P, Q, X) => Math.abs((Q[0] - P[0]) * (P[1] - X[1]) - (P[0] - X[0]) * (Q[1] - P[1])) / ab(P, Q);
    for (const [P, Q] of [[A, B], [B, C], [C, A]]) assert.ok(nah(dist(P, Q, M), r, 1e-6));
    const H = hoehenschnitt(A, B, C);
    /* AH ⟂ BC */
    assert.ok(Math.abs((H[0] - A[0]) * (C[0] - B[0]) + (H[1] - A[1]) * (C[1] - B[1])) < 1e-6);
    const S = schwerpunkt(A, B, C), Ma = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
    assert.ok(nah(ab(A, S), 2 * ab(S, Ma), 1e-6));
  }
});

test("Konstruktionen: Aufgaben stimmig (je 800 Läufe)", () => {
  for (const art of KONSTR_ARTEN) for (let i = 0; i < 800; i++) {
    const au = konstrAufgabe(art);
    if (art === "lage") { assert.equal(au.winkel.reduce((s, x) => s + x, 0), 180); assert.ok(au.winkel.every((w) => w > 0)); }
    if (art === "schwerpunkt") assert.deepEqual(au.S, schwerpunkt(au.A, au.B, au.C));
    if (art === "umkreis") { const U = umkreismitte(au.A, au.B, au.C); assert.ok(nah(U[0], au.M[0], 1e-9) && nah(U[1], au.M[1], 1e-9)); }
    if (art === "inkreis") { assert.ok(Number.isInteger(au.r)); assert.equal(au.r, (au.a + au.b - au.c) / 2); }
    if (art === "teilung") assert.ok(nah(au.ecke, 2 * au.seite));
  }
});
