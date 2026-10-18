import test from "node:test";
import assert from "node:assert/strict";
import * as Z from "../src/zahlraum.js";
import { q, qNum } from "../src/rechnen2.js";

const L = 1500;
const istGanz = (v) => Math.abs(v - Math.round(v)) < 1e-9;

/* Unabhängige Einordnung über den Zahlenwert (nur für rationale Zahlen sinnvoll) */
const raumAusWert = (v) => (istGanz(v) ? (Math.round(v) >= 1 ? "N" : "Z") : "Q");

test("Kleinster Zahlenraum und Teilmengenkette", () => {
  assert.equal(Z.kleinsterRaum({ art: "q", q: q(5) }), "N");
  assert.equal(Z.kleinsterRaum({ art: "q", q: q(-5) }), "Z");
  assert.equal(Z.kleinsterRaum({ art: "q", q: q(2, 5) }), "Q");
  assert.equal(Z.kleinsterRaum({ art: "q", q: q(10, 5) }), "N", "10/5 wird zu 2 gekürzt");
  assert.equal(Z.kleinsterRaum(Z.wurzelVon(2)), "R");
  assert.equal(Z.kleinsterRaum(Z.wurzelVon(49)), "N");
  assert.equal(Z.kleinsterRaum({ art: "pi" }), "R");
  /* ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ */
  const x = { art: "q", q: q(3) };
  for (const r of Z.RAEUME) assert.ok(Z.liegtIn(x, r));
  assert.ok(!Z.liegtIn({ art: "q", q: q(1, 3) }, "Z"));
  assert.ok(Z.liegtIn(Z.wurzelVon(2), "R") && !Z.liegtIn(Z.wurzelVon(2), "Q"));
});

test("Wurzeln: Zerlegung und Quadratzahlen", () => {
  for (let n = 1; n <= 400; n++) {
    const [a, r] = Z.wurzelZerlegen(n);
    assert.equal(a * a * r, n);
    for (let d = 2; d * d <= r; d++) assert.ok(r % (d * d) !== 0, `${n}: ${r} nicht quadratfrei`);
    assert.equal(Z.istQuadrat(n), r === 1);
    assert.ok(Math.abs(Z.zahlWert(Z.wurzelVon(n)) - Math.sqrt(n)) < 1e-9);
  }
});

test("Einordnen: Darstellung, Wert und Zahlenraum passen zusammen", () => {
  for (const raum of Z.RAEUME) for (let i = 0; i < L; i++) {
    const e = Z.zahlZumEinordnen(raum);
    assert.equal(e.raum, raum, JSON.stringify(e));
    assert.ok(Number.isFinite(e.wert));
    assert.ok(Math.abs(e.wert) > 1e-9, "nie 0");
    if (raum !== "R") assert.equal(raumAusWert(e.wert), raum, `${e.tex} → ${e.wert}`);
    else assert.ok(!istGanz(e.wert * 9) && !istGanz(e.wert * 99) && !istGanz(e.wert * 8 * 9 * 25 * 7));
  }
});

test("Abgeschlossenheit: Ergebnis exakt, Zuordnung stimmt mit der Tabelle", () => {
  for (let i = 0; i < L * 2; i++) {
    const a = Z.zrAufgabe("abgeschlossen");
    const v = qNum(a.r), va = qNum(a.a), vb = qNum(a.b);
    const soll = { plus: va + vb, minus: va - vb, mal: va * vb, geteilt: va / vb }[a.op];
    assert.ok(Math.abs(v - soll) < 1e-9);
    assert.ok(Z.liegtIn({ art: "q", q: a.a }, a.raum) && Z.liegtIn({ art: "q", q: a.b }, a.raum), "a, b aus dem Raum");
    assert.notEqual(a.r.z, 0, "Ergebnis nie 0");
    assert.equal(a.drin, Z.stufe(raumAusWert(v)) <= Z.stufe(a.raum));
    if (Z.ABGESCHLOSSEN[a.raum][a.op]) assert.ok(a.drin, `${a.raum} ist bzgl. ${a.op} abgeschlossen`);
  }
  /* Jede nicht abgeschlossene Kombination kommt auch mit „raus“ vor */
  const raus = new Set();
  for (let i = 0; i < L * 6; i++) { const a = Z.zrAufgabe("abgeschlossen"); if (!a.drin) raus.add(a.raum + a.op); }
  for (const r of ["N", "Z", "Q"]) for (const op of Object.keys(Z.OPS)) if (!Z.ABGESCHLOSSEN[r][op]) assert.ok(raus.has(r + op), r + op);
});

test("Rauswerfer: genau eine Rechnung verlässt den Zahlenraum", () => {
  const rechneTex = (t) => Function(`return (${t.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, "($1/$2)").replace(/\\sqrt\{(\d+)\}/g, "Math.sqrt($1)").replace(/\\cdot/g, "*").replace(/:/g, "/").replace(/−/g, "-")});`)();
  for (let i = 0; i < L; i++) {
    const a = Z.zrAufgabe("rauswerfer");
    assert.equal(a.optionen.filter((o) => o.raus).length, 1);
    for (const o of a.optionen) {
      const v = rechneTex(o.tex);
      /* ℚ: rational, solange keine Wurzel aus einer Nicht-Quadratzahl vorkommt (die einzige Quelle für Irrationales hier) */
      const irr = [...o.tex.matchAll(/\\sqrt\{(\d+)\}/g)].some((m) => !Z.istQuadrat(Number(m[1])));
      const innen = a.raum === "N" ? istGanz(v) && v >= 1 : a.raum === "Z" ? istGanz(v) : !irr;
      assert.equal(!innen, o.raus, `${a.raum}: ${o.tex} = ${v}`);
    }
  }
});

test("Gleichungen: Lösung erfüllt die Gleichung, Zahlenraum stimmt", () => {
  for (let i = 0; i < L; i++) {
    const a = Z.zrAufgabe("gleichung");
    const x = Z.zahlWert(a.x);
    if (a.typ === "plus") { assert.ok(Math.abs(x + a.a - a.b) < 1e-9); assert.equal(a.raum, "Z"); }
    if (a.typ === "mal") assert.ok(Math.abs(a.a * x - a.b) < 1e-9);
    if (a.typ === "quadrat") assert.ok(Math.abs(x * x - a.n) < 1e-9);
    assert.equal(a.raum, Z.kleinsterRaum(a.x));
  }
});

test("Dezimalzahlen als Brüche", () => {
  const lies = (t) => Number(t.replace("{,}", ".").replace(/\\overline\{\d+\}/, ""));
  for (let i = 0; i < L; i++) {
    const a = Z.zrAufgabe("dezimal");
    if (a.typ === "abbrechend") assert.ok(Math.abs(lies(a.tex) - a.zaehler / a.nenner) < 1e-12, a.tex);
    else {
      const ziff = /\\overline\{(\d+)\}/.exec(a.tex)[1];
      const p = Z.periodeAlsBruch(ziff);
      assert.ok(Math.abs(qNum(p) - a.zaehler / a.nenner) < 1e-12);
      /* Nachweis über die Zehnerpotenz: 10^k · x − x = Periode */
      const x = a.zaehler / a.nenner, k = ziff.length;
      assert.ok(Math.abs(10 ** k * x - x - Number(ziff)) < 1e-9);
    }
  }
});

test("Wurzel: rational genau bei Quadratzahlen, Einschachtelung stimmt", () => {
  for (let i = 0; i < L; i++) {
    const a = Z.zrAufgabe("wurzel");
    assert.equal(a.rational, Z.istQuadrat(a.n));
    assert.ok(a.k * a.k <= a.n && (a.k + 1) ** 2 > a.n);
  }
});

test("Aussagen: Gegenbeispiele und Begründungen", () => {
  assert.ok(Z.AUSSAGEN.length >= 12);
  const ids = new Set(Z.AUSSAGEN.map((s) => s.id));
  assert.equal(ids.size, Z.AUSSAGEN.length);
  for (const s of Z.AUSSAGEN) { assert.ok(s.de && s.en && s.gde && s.gen); assert.equal(typeof s.wahr, "boolean"); }
  assert.ok(Z.AUSSAGEN.some((s) => s.wahr) && Z.AUSSAGEN.some((s) => !s.wahr));
});

test("Näherungsbrüche für √2 treffen nie genau", () => {
  const l = Z.naeherungenWurzel2(10);
  for (const [p, qq] of l) {
    assert.notEqual(p * p, 2 * qq * qq);
    assert.equal(Math.abs(p * p - 2 * qq * qq), 1, "Pell: p² − 2q² = ±1");
  }
  assert.deepEqual(l.slice(0, 4), [[1, 1], [3, 2], [7, 5], [17, 12]]);
});

test("Keine Aufgabe bringt ein eigenes Feld id mit (es gehört der Übungskarte)", () => {
  for (const art of Z.ZR_ARTEN) for (let i = 0; i < 300; i++) assert.ok(!("id" in Z.zrAufgabe(art)), art);
});

test("Alle Aufgabentypen werden erzeugt", () => {
  for (const art of Z.ZR_ARTEN) for (let i = 0; i < 200; i++) assert.equal(Z.zrAufgabe(art).art, art);
  for (let i = 0; i < 200; i++) assert.ok(Z.ZR_ARTEN.includes(Z.zrAufgabe(null).art));
});
