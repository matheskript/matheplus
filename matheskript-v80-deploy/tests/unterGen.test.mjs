import test from "node:test";
import assert from "node:assert/strict";
import * as U from "../src/unterGen.js";
import { ggT, qNum, q } from "../src/rechnen2.js";

const nah = (a, b, e = 1e-9) => Math.abs(a - b) <= e;
const L = 1200;

test("Prozent und Zinsen", () => {
  for (const art of U.PROZENT_ARTEN) for (let i = 0; i < L; i++) {
    const a = U.prozentAufgabe(art);
    if (["prozentwert", "grundwert", "prozentsatz"].includes(art)) { assert.ok(nah(a.W, a.G * a.p / 100)); assert.ok(nah(a.W / a.G * 100, a.p)); }
    if (art === "rabatt") assert.ok(nah(a.neu + a.abzug, a.preis));
    if (art === "mwst" || art === "netto") assert.ok(nah(a.brutto / 1.19, a.netto, 1e-6));
    if (art === "zinseszins") assert.ok(nah(a.Kn, a.K * a.q ** a.n, 1e-6));
  }
});

test("Zuordnungen: Typ stimmt mit Quotienten- bzw. Produktgleichheit", () => {
  for (const art of U.ZUORD_ARTEN) for (let i = 0; i < L; i++) {
    const a = U.zuordAufgabe(art);
    if (art === "erkennen" || art === "graph") {
      const qs = a.xs.map((x, k) => a.ys[k] / x), ps = a.xs.map((x, k) => a.ys[k] * x);
      const prop = qs.every((v) => nah(v, qs[0])), anti = ps.every((v) => nah(v, ps[0]));
      assert.equal(a.typ, prop ? "prop" : anti ? "anti" : "keine", JSON.stringify(a));
    }
    if (art === "prop") assert.ok(nah(a.ergebnis / a.b, a.preisA / a.a, 1e-6));
    if (art === "anti") { assert.equal(a.a * a.tA, a.b * a.tB); assert.ok(Number.isInteger(a.tB)); }
    if (art === "faktor") a.xs.forEach((x, k) => assert.ok(nah(a.ys[k], a.k * x)));
    if (art === "luecke") assert.ok(Number.isInteger(a.wert));
  }
});

test("Flächen und Umfang", () => {
  for (const art of U.FLAECHE_ARTEN) for (let i = 0; i < L; i++) {
    const a = U.flaecheAufgabe(art);
    if (art === "trapez") assert.ok(nah(a.A, (a.a + a.c) * a.h / 2));
    if (art === "zusammen") { assert.ok(a.b < a.B && a.h < a.H); assert.equal(a.A, a.B * a.H - a.b * a.h); }
    if (art === "parallelogramm") assert.ok(a.s > a.h);
  }
});

test("Größen: Umrechnung hin und zurück, Treppenfaktoren", () => {
  assert.equal(U.umrechnen(3.5, "laenge", "km", "m"), 3500);
  assert.equal(U.umrechnen(250, "flaeche", "cm²", "dm²"), 2.5);
  assert.equal(U.umrechnen(2, "hohlmass", "l", "ml"), 2000);
  assert.equal(U.umrechnen(1, "volumen", "dm³", "cm³"), 1000);
  assert.equal(U.umrechnen(90, "zeit", "min", "h"), 1.5);
  for (const art of U.GROESSEN_ARTEN) for (let i = 0; i < L; i++) {
    const a = U.groessenAufgabe(art);
    if (art === "massstab") { assert.ok(a.wirklich > 0); continue; }
    assert.ok(nah(U.umrechnen(a.ergebnis, art, a.nach, a.von), a.wert, 1e-6), JSON.stringify(a));
  }
});

test("Dezimalzahlen", () => {
  for (const art of U.DEZ_ARTEN) for (let i = 0; i < L; i++) {
    const a = U.dezAufgabe(art);
    if (art === "bruchZuDez") { assert.ok(nah(qNum(a.b), a.wert)); assert.ok(a.erweitert); }
    if (art === "dezZuBruch") { assert.ok(nah(qNum(a.b), a.dez)); assert.equal(ggT(a.b.z, a.b.n), 1); }
    if (art === "mal") assert.ok(nah(a.ohne / 10 ** a.stellen, a.wert));
    if (art === "runden") { assert.equal(a.wert >= Math.floor(a.x * 10 ** a.st) / 10 ** a.st, true); assert.equal(a.naechste >= 5, a.wert > Math.floor(a.x * 10 ** a.st + 1e-9) / 10 ** a.st + 1e-12); }
    if (art === "geteilt") { assert.ok(Number.isInteger(a.b2)); assert.ok(nah(a.a2 / a.b2, a.wert)); }
    if (art === "periodisch") assert.equal(a.abbrechend, [8, 16, 20, 25, 40].includes(a.n));
  }
});

/* Alle Hexominos (bis auf Verschiebung) erzeugen; genau 11 freie Würfelnetze */
function normiere(z) { const mx = Math.min(...z.map((c) => c[0])), my = Math.min(...z.map((c) => c[1])); return z.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); }
const sch = (z) => JSON.stringify(normiere(z));
function frei(z) {
  const v = []; let t = z;
  for (let r = 0; r < 4; r++) { t = t.map(([x, y]) => [y, -x]); v.push(sch(t), sch(t.map(([x, y]) => [-x, y]))); }
  return v.sort()[0];
}
test("Würfelnetze: genau 11 der 35 freien Hexominos falten sich zum Würfel", () => {
  let stufe = new Map([[sch([[0, 0]]), [[0, 0]]]]);
  for (let n = 1; n < 6; n++) {
    const neu = new Map();
    for (const z of stufe.values()) for (const [x, y] of z) for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c = [x + d[0], y + d[1]];
      if (z.some((e) => e[0] === c[0] && e[1] === c[1])) continue;
      const w = normiere([...z, c]); neu.set(sch(w), w);
    }
    stufe = neu;
  }
  const freie = new Map(); for (const z of stufe.values()) freie.set(frei(z), z);
  assert.equal(freie.size, 35);
  const gueltig = [...freie.values()].filter((z) => U.netzFalten(z).gueltig);
  assert.equal(gueltig.length, 11);
  /* gegenüberliegende Flächen: kein Netz bekommt zwei gleiche */
  for (const n of U.NETZE) assert.equal(typeof U.netzFalten(n.zellen).gueltig, "boolean");
  assert.ok(U.NETZE.filter((n) => U.netzFalten(n.zellen).gueltig).length >= 5);
  assert.ok(U.NETZE.filter((n) => !U.netzFalten(n.zellen).gueltig).length >= 4);
});

test("Quader und Würfel", () => {
  for (const art of U.QUADER_ARTEN) for (let i = 0; i < 400; i++) {
    const a = U.quaderAufgabe(art);
    if (art === "netz") { assert.equal(a.netze.filter((id) => U.netzFalten(U.NETZE.find((n) => n.id === id).zellen).gueltig).length, 1); assert.ok(a.netze.includes(a.richtig)); }
    if (["volumen", "oberflaeche", "kanten", "hoehe"].includes(art)) { assert.equal(a.V, a.a * a.b * a.c); assert.equal(a.O, 2 * (a.a * a.b + a.a * a.c + a.b * a.c)); }
  }
});

test("Ganze und rationale Zahlen", () => {
  for (const art of U.GANZ_ARTEN) for (let i = 0; i < L; i++) {
    const a = U.ganzAufgabe(art);
    if (art === "geteilt") assert.equal(a.a / a.b, a.wert);
    if (art === "klammer") assert.equal(a.wert, a.a - a.b * a.c);
    if (art === "rational") { const x = qNum(a.a), y = qNum(a.b); assert.ok(nah(qNum(a.e), a.op === "+" ? x + y : a.op === "−" ? x - y : x * y)); }
  }
});

test("Daten: Mittelwert, Median, Spannweite, Kreisdiagramm", () => {
  assert.equal(U.median([3, 1, 2]), 2); assert.equal(U.median([4, 1, 3, 2]), 2.5); assert.equal(U.mittelwert([1, 2, 3, 6]), 3);
  for (const art of U.DATEN_ARTEN) for (let i = 0; i < L; i++) {
    const a = U.datenAufgabe(art);
    if (art === "mittelwert") assert.ok(nah(a.wert * a.l.length, a.l.reduce((s, x) => s + x, 0)));
    if (art === "kreis") assert.ok(nah(a.winkel, a.z / a.n * 360));
    if (art === "relativ") assert.ok(a.teil <= a.gesamt);
  }
});

test("Primzahlen, ggT, kgV", () => {
  assert.deepEqual(U.primfaktoren(360), [2, 2, 2, 3, 3, 5]);
  for (const art of U.PRIM_ARTEN) for (let i = 0; i < L; i++) {
    const a = U.primAufgabe(art);
    if (art === "zerlegung") assert.equal(a.f.reduce((p, x) => p * x, 1), a.n);
    if (art === "istPrim") { if (!a.prim) assert.equal(a.n % a.teiler, 0); }
    if (art === "ggt" || art === "ggtSach") { assert.equal(a.a % a.wert, 0); assert.equal(a.b % a.wert, 0); }
    if (art === "kgv" || art === "kgvSach") { assert.equal(a.wert % a.a, 0); assert.equal(a.wert % a.b, 0); assert.equal(a.wert * ggT(a.a, a.b), a.a * a.b); }
  }
});

test("Rechengesetze", () => {
  for (const art of U.RG_ARTEN) for (let i = 0; i < L; i++) {
    const a = U.rgAufgabe(art);
    if (art === "distributiv") assert.equal(a.wert, a.a * a.rund - a.a * a.d);
    if (art === "vorteil") assert.equal(a.wert, (a.x * a.y) * a.m);
    if (art === "text" && a.v === "differenzQuotient") assert.ok(Number.isInteger(a.wert));
    if (art === "punkt") assert.notEqual(a.wert, a.falsch);
  }
});

test("Koordinaten und Symmetrie", () => {
  for (const art of U.KOORD_ARTEN) for (let i = 0; i < L; i++) {
    const a = U.koordAufgabe(art);
    if (art === "punktZ") { assert.equal((a.P[0] + a.B[0]) / 2, a.Z[0]); assert.equal((a.P[1] + a.B[1]) / 2, a.Z[1]); }
    if (art === "viereck") { assert.equal(a.B[0] - a.A[0], a.C[0] - a.D[0]); assert.equal(a.B[1] - a.A[1], a.C[1] - a.D[1]); }
  }
});

test("Zufall", () => {
  for (const art of U.ZUFALL_ARTEN) for (let i = 0; i < L; i++) {
    const a = U.zufallAufgabe(art);
    if (art === "gegen") assert.ok(nah(qNum(a.p) + qNum(a.gegen), 1));
    if (art === "zweistufig") assert.ok(nah(qNum(a.p), qNum(a.p1) * qNum(a.p2)));
    if (art === "erwartet") assert.ok(Number.isInteger(a.wert));
    if (art === "wuerfel") assert.ok(nah(qNum(a.p), a.guenstig.length / 6));
  }
});

test("Natürliche Zahlen und römische Zahlen", () => {
  assert.equal(U.roemisch(1984), "MCMLXXXIV"); assert.equal(U.roemisch(2026), "MMXXVI"); assert.equal(U.roemisch(49), "XLIX");
  for (const art of U.ZAHL_ARTEN) for (let i = 0; i < L; i++) {
    const a = U.zahlAufgabe(art);
    if (art === "stelle") assert.equal(String(a.n)[String(a.n).length - 1 - a.i], String(a.ziffer));
    if (art === "runden") assert.ok(Math.abs(a.wert - a.n) <= 10 ** a.i / 2);
    if (art === "zehnerpotenz") assert.equal(a.wert, a.ziffern[0] * 1e6 + a.ziffern[1] * 1e4 + a.ziffern[2] * 10);
  }
});
