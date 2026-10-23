/* GFS · Folgen und Grenzwerte (gfsFolgen.js)
   Mathematik der Herleitung nachgerechnet (Gauß, geometrische Summe und Reihe, ε-Schlauch, harmonische Reihe,
   Achilles, Ball, Zinseszins), ε-Index exakt gegen Brute Force, Labor gegen Aufzählung, Generatoren über viele
   Startwerte: Lösung besteht, typische Fehler fallen mit eigener Rückmeldung durch, Rechenweg endet beim Ergebnis,
   Zahlen unabhängig nachgerechnet, A5 in allen Lösungstexten. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  zufallszahlen, wuerfelAus, ggT, B, wert, plus, minus, mal, durch, gleich, hoch, dk, euro, zTex, bTex, lies, endlich,
  abIndex, abstand, glied, imSchlauch, nNull, centRund, sparplan,
  LABOR_FOLGEN, EPS_LISTE, EPS_START, LABOR_START, laborGlied, laborSumme, laborEigenschaften, laborN0, ueberSchranke,
  ARTEN, aufgabe, felder, auftrag, pruefe, rechenweg, tipp, alsEingabe,
  gauss, geoSumme, geoReihe, achilles, ballStrecke, kapital, halbSumme, harmonisch, buendel,
  GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "../src/gfsFolgen.js";
import { THEMEN } from "../src/gfsKurs.js";
import { pfadAufloesen } from "../src/pfade.js";

/* Dieselben Muster wie tests/a5.test.mjs – nichts bleibt unvereinfacht stehen */
const N = String.raw`\d+(?:[.,]\d+)?`;
const A5 = [
  new RegExp(String.raw`(?:^|=)\s*${N}\s*[+−\-]\s*${N}\s*$`), new RegExp(String.raw`(?:^|=)\s*${N}\s*(?:·|\\cdot|\*)\s*${N}\s*$`),
  /(^|[^\d.,\w])1\s*(?:·|\\cdot)?\s*x(?![\w])/, /\+\s*[−-]\s*\d/, /[−-]\s*[−-]\s*\d/, /(?:·|\\cdot)\s*1(?![\d,.\/^])/, /[+−-]\s*0(?![\d,.])\s*$/,
  /(?<!_\{[^}]*\}|_-?\d)\^\{?1\}?(?![\d])/,
];
const a5ok = (z) => A5.every((m) => !m.test(z));
/* Endergebnis einer Zeile („= \frac{4}{6}“ am Ende) muss gekürzt sein */
const endeGekuerzt = (z) => { const m = /\\frac\{(\d+)\}\{(\d+)\}\s*(?:\\text\{[^}]*\})?\s*$/.exec(z); return !m || ggT(+m[1], +m[2]) === 1; };

/* exakte Brüche ohne die Bibliothek: BigInt-Paare */
const Q = (z, n = 1n) => { z = BigInt(z); n = BigInt(n); if (n < 0n) { z = -z; n = -n; } const g = (a, b) => (b === 0n ? (a < 0n ? -a : a) : g(b, a % b)); const t = g(z, n) || 1n; return [z / t, n / t]; };
const Qp = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const Qm = (a, b) => Q(a[0] * b[0], a[1] * b[1]);
const Qgleich = (a, b) => a[0] * b[1] === b[0] * a[1];
const ausB = (b) => Q(b.z, b.n);

test("Brüche, Eingaben, Schreibweise", () => {
  assert.deepEqual(B(4, -6), { z: -2, n: 3 });
  assert.ok(gleich(plus(B(1, 3), B(1, 6)), B(1, 2)) && gleich(minus(B(1), B(1, 4)), B(3, 4)));
  assert.ok(gleich(mal(B(2, 3), B(9, 4)), B(3, 2)) && gleich(durch(B(1, 2), B(1, 4)), B(2)) && gleich(hoch(B(-1, 2), 3), B(-1, 8)));
  assert.deepEqual(lies("3/4").b, B(3, 4)); assert.deepEqual(lies("−3/4").b, B(-3, 4)); assert.deepEqual(lies("3/-4").b, B(-3, 4));
  assert.deepEqual(lies("0,25").b, B(1, 4)); assert.equal(lies("0,25").art, "dezimal"); assert.equal(lies(" 12 ").art, "ganz");
  assert.equal(lies(",5").b.z, 1); assert.equal(lies("1/0"), null); assert.equal(lies("drei"), null); assert.equal(lies(""), null);
  assert.equal(lies("6/8").zr, 6, "Bruch merkt sich Zähler und Nenner wie getippt (Kürzen prüfen)");
  assert.equal(dk(0.9375, 4), "0,9375"); assert.equal(dk(-2.5), "−2,5"); assert.equal(euro(2734.2), "2734,20");
  assert.deepEqual([dk(10, 0), dk(0, 0), dk(1180, 0), dk(20, 2), dk(0.5, 2)], ["10", "0", "1180", "20", "0,5"], "Nullen vor dem Komma bleiben stehen");
  assert.equal(zTex(B(3, 4)), "0,75"); assert.equal(zTex(B(1, 3)), "\\frac{1}{3}"); assert.equal(bTex(B(-5, 2)), "−\\frac{5}{2}");
  assert.ok(endlich(40) && !endlich(30));
});

test("Herleitung: Gauß, geometrische Summe und Reihe, 0,999… = 1, Achilles, Ball, Zinseszins", () => {
  assert.equal(gauss(100), 5050); assert.equal(gauss(8), 36); assert.equal(8 * 9, 2 * gauss(8));
  for (let n = 1; n <= 60; n++) { let s = 0; for (let k = 1; k <= n; k++) s += k; assert.equal(gauss(n), s); }
  /* geometrische Summe = Summe der Glieder, für viele a₁ und q */
  for (const q of [B(2), B(-3), B(1, 2), B(-2, 3), B(3, 4)]) for (const a1 of [B(1), B(5), B(-2, 7)]) for (let n = 1; n <= 9; n++) {
    let s = B(0); for (let k = 0; k < n; k++) s = plus(s, mal(a1, hoch(q, k)));
    assert.ok(gleich(geoSumme(a1, q, n), s), `${bTex(a1)} ${bTex(q)} ${n}`);
  }
  assert.ok(gleich(geoSumme(B(1), B(2), 10), B(1023)), "1 + 2 + … + 512 = 1023");
  assert.ok(gleich(geoReihe(B(1, 2), B(1, 2)), B(1)), "1/2 + 1/4 + … = 1");
  assert.ok(gleich(geoReihe(B(9, 10), B(1, 10)), B(1)), "0,999… = 1");
  assert.ok(gleich(geoReihe(B(3, 10), B(1, 10)), B(1, 3)), "0,333… = 1/3");
  for (let n = 1; n <= 20; n++) assert.ok(gleich(halbSumme(n), minus(B(1), B(1, 2 ** n))), "Lücke 1/2ⁿ");
  /* Partialsummen nähern sich a₁/(1 − q) */
  assert.ok(Math.abs(wert(geoSumme(B(5), B(-3, 4), 80)) - wert(geoReihe(B(5), B(-3, 4)))) < 1e-9);
  const a = achilles(100, 10, 1);
  assert.ok(gleich(a.T, B(100, 9)) && gleich(a.x, B(1000, 9)));
  assert.deepEqual(a.etappen.map(wert), [10, 1, 0.1, 0.01].map((x) => x));
  assert.ok(gleich(geoReihe(a.etappen[0], B(1, 10)), a.T), "Etappenzeiten summieren sich zu T");
  assert.ok(gleich(mal(B(10), a.T), plus(B(100), a.T)), "Achilles und Schildkröte sind bei T am selben Ort");
  assert.ok(gleich(ballStrecke(B(2), B(3, 5)), B(8)), "Ball aus 2 m mit 60 %: 8 m");
  assert.ok(gleich(kapital(1000, 2, 1), B(1020)) && gleich(kapital(1000, 2, 2), B(52020, 50)) && wert(kapital(1000, 2, 3)) === 1061.208);
  /* Sparplan: Jahr für Jahr in exakten Brüchen gerechnet, erst am Ende auf Cent gerundet */
  for (const [R, P, n] of [[1000, 2, 10], [500, 4, 10], [500, 3, 5], [200, 1, 7], [1200, 3, 3]]) {
    let k = B(0); for (let j = 0; j < n; j++) k = mal(plus(k, B(R)), B(100 + P, 100));
    const cent = Math.round(wert(k) * 100);
    assert.ok(gleich(sparplan(R, P, n), B(cent, 100)), `${R} € ${P} % ${n} Jahre: ${wert(sparplan(R, P, n))} statt ${cent / 100}`);
  }
  assert.ok(gleich(centRund(5n, 2n), B(3, 100)) && gleich(centRund(7n, 3n), B(2, 100)), "kaufmännisch runden");
});

test("ε-Schlauch: n₀ der Herleitung und der Animation, exakt an der Grenze", () => {
  const kehr = { form: "kehr", k: 1, c: 0 }, plusEins = { form: "kehr", k: 1, c: 1 };
  assert.equal(nNull(kehr, B(1, 100)), 101, "1/n < 0,01 ab n = 101");
  assert.equal(imSchlauch(kehr, 100, B(1, 100)), false, "bei n = 100 ist der Abstand genau 0,01");
  /* Animation „schlauch“: (n + 1)/n mit ε = 0,2 / 0,1 / 0,05 */
  assert.deepEqual([B(1, 5), B(1, 10), B(1, 20)].map((e) => nNull(plusEins, e)), [6, 11, 21]);
  /* 0,5ⁿ < 0,001 ab n = 10 (0,5¹⁰ = 0,0009765625) */
  assert.equal(nNull({ form: "potenz", q: B(1, 2), b: 1, c: 0 }, B(1, 1000)), 10);
  /* Brute Force mit exakten Brüchen für viele Folgen: n₀ ist der kleinste Index, ab dem alles im Schlauch bleibt */
  const folgen = [
    { form: "kehr", k: 3, c: 2 }, { form: "linear", a: 4, b: -7 }, { form: "bruch", a: 5, b: -4, c: 2, d: 4 }, { form: "bruch", a: 1, b: 4, c: 4, d: 1 },
    { form: "potenz", q: B(-2, 3), b: 3, c: -1 }, { form: "potenz", q: B(9, 10), b: 1, c: 0 }, { form: "quadrat", a: 5, b: -9, c: 4 }, { form: "quadrat", a: 4, b: -5, c: 5 },
  ];
  const exaktGlied = (f, n) => {
    if (f.form === "kehr") return Qp(Q(f.c), Q(f.k, n));
    if (f.form === "linear") return Q(f.a * n + f.b, n);
    if (f.form === "bruch") return Q(f.a * n + f.b, f.c * n + f.d);
    if (f.form === "potenz") return Qp(Q(f.c), Qm(Q(f.b), Q(BigInt(f.q.z) ** BigInt(n), BigInt(f.q.n) ** BigInt(n))));
    return Q(f.a * n * n + f.b, f.c * n * n);
  };
  const grenzwert = (f) => (f.form === "kehr" ? Q(f.c) : f.form === "linear" ? Q(f.a) : f.form === "bruch" ? Q(f.a, f.c) : f.form === "potenz" ? Q(f.c) : Q(f.a, f.c));
  for (const f of folgen) for (const eps of [B(1, 10), B(1, 100), B(1, 1000)]) {
    const g = grenzwert(f), e = Q(eps.z, eps.n);
    const drin = (n) => { const d = Qp(exaktGlied(f, n), [-g[0], g[1]]); const ab = [d[0] < 0n ? -d[0] : d[0], d[1]]; return ab[0] * e[1] < e[0] * ab[1]; };
    const n0 = nNull(f, eps);
    assert.ok(drin(n0), `${f.form} ε = ${bTex(eps)}: n₀ = ${n0} nicht im Schlauch`);
    if (n0 > 1) assert.ok(!drin(n0 - 1), `${f.form} ε = ${bTex(eps)}: n₀ − 1 = ${n0 - 1} schon im Schlauch`);
    for (let n = n0; n < n0 + 200; n++) assert.ok(drin(n), `${f.form}: Glied ${n} fällt wieder heraus`);
    /* abstand passt zum Glied */
    for (const n of [1, 7, 30]) assert.ok(Math.abs(Math.abs(glied(f, n) - Number(g[0]) / Number(g[1])) - Number(abstand(f, n).z) / Number(abstand(f, n).n)) < 1e-9);
  }
  assert.equal(abIndex((n) => n * n > 2250), 48);
  assert.equal(abIndex((n) => n > 5), 6);
});

test("Harmonische Reihe: Bündel ≥ 1/2, H₂ₖ ≥ 1 + k/2, über 10 erst ab n = 12 367", () => {
  for (let k = 1; k <= 14; k++) {
    const b = buendel(k);
    assert.equal(b.anzahl, b.bis - b.von + 1);
    assert.ok(b.summe >= 0.5 - 1e-12 && b.summe < 1, `Bündel ${k}: ${b.summe}`);
    assert.ok(harmonisch(2 ** k) >= 1 + k / 2 - 1e-12);
  }
  assert.equal(ueberSchranke(10), 12367);
  assert.ok(harmonisch(12367) > 10 && harmonisch(12366) <= 10);
  for (let S = 1; S <= 6; S++) { const n = ueberSchranke(S); assert.ok(harmonisch(n) > S && harmonisch(n - 1) <= S, `S = ${S}`); }
  assert.deepEqual([1, 2, 3, 4].map(ueberSchranke), [2, 4, 11, 31]);
});

test("Labor: Eigenschaften und n₀ stimmen mit den Gliedern überein", () => {
  assert.deepEqual(LABOR_FOLGEN.map((f) => f.id), ["arith", "geo", "kehr", "harm"]);
  assert.ok(EPS_LISTE.every((e, i) => i === 0 || wert(e) < wert(EPS_LISTE[i - 1])), "ε wird kleiner");
  assert.equal(wert(EPS_LISTE[EPS_START]), 0.1);
  const faelle = [];
  for (let a1 = -5; a1 <= 5; a1++) for (let d2 = -4; d2 <= 4; d2++) faelle.push(["arith", { a1, d2 }]);
  for (let k = -24; k <= 24; k++) faelle.push(["geo", { k }]);
  faelle.push(["kehr", {}], ["harm", { S: 3 }]);
  for (const [art, p] of faelle) {
    const e = laborEigenschaften(art, p);
    const g = Array.from({ length: 200 }, (_, i) => laborGlied(art, p, i + 1));
    const wo = `${art} ${JSON.stringify(p)}`;
    /* Monotonie */
    const steigt = g.every((v, i) => i === 0 || v >= g[i - 1] - 1e-12), faellt = g.every((v, i) => i === 0 || v <= g[i - 1] + 1e-12);
    const erwartet = steigt && faellt ? "konstant" : steigt ? "steigend" : faellt ? "fallend" : "keine";
    assert.equal(e.monoton, erwartet, wo);
    /* Beschränktheit: unbeschränkte Folgen überschreiten nach 200 Gliedern jede kleine Schranke */
    const maxBetrag = Math.max(...g.map(Math.abs));
    assert.equal(e.beschraenkt, maxBetrag < (art === "harm" ? 5 : 20), `${wo}: beschränkt ${maxBetrag}`);
    /* Grenzwert und n₀ */
    if (e.g) {
      for (const eps of EPS_LISTE) {
        const n0 = laborN0(art, p, eps), ew = wert(eps);
        assert.ok(Number.isInteger(n0) && n0 >= 1, wo);
        for (let n = n0; n <= n0 + 50; n++) assert.ok(Math.abs(laborGlied(art, p, n) - wert(e.g)) < ew, `${wo}: Glied ${n} außerhalb`);
        if (n0 > 1) assert.ok(Math.abs(laborGlied(art, p, n0 - 1) - wert(e.g)) >= ew - 1e-12, `${wo}: n₀ nicht minimal`);
      }
    } else assert.equal(laborN0(art, p, B(1, 10)), null);
    /* Reihe */
    if (e.reihe) assert.ok(Math.abs(laborSumme(art, p, 400) - wert(e.reihe)) < 1e-6, `${wo}: Reihe`);
    else if (art !== "harm") assert.ok(Math.abs(laborSumme(art, p, 400) - laborSumme(art, p, 399)) > 1e-9 || Math.abs(laborSumme(art, p, 400)) > 1e3 || Math.abs(laborSumme(art, p, 399) - laborSumme(art, p, 398)) > 1e-9, `${wo}: Reihe soll divergieren`);
  }
  assert.equal(laborSumme("harm", LABOR_START.harm, 5), null);
  assert.equal(laborN0("geo", { k: 16 }, B(1, 10)), 12, "0,8ⁿ⁻¹ < 0,1 ab n = 12");
});

/* ---------- Generatoren ---------- */
/* Ergebnis eines Feldes so, wie es im Rechenweg steht */
const ergebnisTexte = (f) => {
  const w = wert(f.soll);
  return [bTex(f.soll), zTex(f.soll), dk(w, 1), dk(w, 2), euro(w)];
};
/* Eingabe für einen Wert in einem Feld (gerundete Felder gerundet) */
const eingabeFuer = (f, b) => (f.typ === "gerundet" ? (f.einheit === "€" ? euro(wert(b)) : dk(wert(b), f.stellen ?? 2)) : alsEingabe(b));

/* Soll unabhängig nachrechnen (eigener Weg, nicht die Formel des Generators) */
function nachgerechnet(a) {
  const soll = Object.fromEntries(a.felder.map((f) => [f.k, ausB(f.soll)]));
  if (a.art === "rekursiv" && a.stufe <= 3) {
    /* Glieder rekursiv erzeugen */
    let x = soll.a1;
    const d = soll.d || soll.q;
    for (let i = 1; i < a.k; i++) x = a.typ === "arith" ? Qp(x, d) : Qm(x, d);
    assert.ok(Qgleich(x, soll.ak), `rekursiv: a_${a.k}`);
    const m = /a_\{n\+1\} = a_n (\+|−) (.+)$/.exec(a.text.match(/\$(a_\{n\+1\}[^$]*)\$/)[1]);
    if (a.typ === "arith") assert.ok(m && Number((m[1] === "−" ? "-" : "") + m[2]) === Number(soll.d[0]), "d steht in der Angabe");
    return;
  }
  if (a.art === "rekursiv") {
    /* Stufe 4/5: Glieder aus a₁ und d bzw. q erzeugen und mit der Angabe vergleichen */
    const g = (n) => (a.typ === "arith" ? Qp(soll.a1, Qm(Q(n - 1), soll.d)) : Qm(soll.a1, Q(soll.q[0] ** BigInt(n - 1))));
    const zahlen = [...a.text.matchAll(/\$a_\{(\d+)\} = (−?\d+)\$/g)].map((m) => [+m[1], BigInt(m[2].replace("−", "-"))]);
    assert.equal(zahlen.length, 2);
    for (const [n, v] of zahlen) assert.ok(Qgleich(g(n), Q(v)), `Glied ${n}`);
    const v = BigInt(/den Wert \$(−?\d+)\$/.exec(a.text)[1].replace("−", "-"));
    assert.ok(Qgleich(g(Number(soll.n[0])), Q(v)), "das gesuchte Glied hat den Wert");
    return;
  }
  if (a.art === "summe") {
    if (a.kontext === "sparplan") { assert.ok(gleich(a.felder[0].soll, sparplan(a.R, a.P, a.n))); return; }
    if (a.kontext === "theater" || a.kontext === "geruecht") return;   // Texte werden unten in den Sachaufgaben geprüft
    if (a.stufe === 1) { let s = 0n; for (let k = 1n; k <= BigInt(a.n); k++) s += k; assert.ok(Qgleich(Q(s), soll.s)); return; }
    /* erste drei Glieder und letztes aus der Angabe lesen, Folge fortsetzen bis zum letzten Glied */
    const term = a.text.match(/\$([^$]+)\$/)[1].replace(/\\ldots/, "…");
    const zahl = (s) => { s = s.trim().replace(/−\s*/, "-"); const f = /^(-?)\\frac\{(\d+)\}\{(\d+)\}$/.exec(s); return f ? Q(BigInt(f[1] + f[2]), BigInt(f[3])) : Q(BigInt(s.replace(",", ""))); };
    const teile = term.split("…");
    const vorn = teile[0].trim().replace(/\s*([+−])\s*$/, "").split(/\s(?=[+−]\s)/).map((t) => zahl(t.replace(/^\+\s*/, "")));
    const letztes = zahl(teile[1].trim().replace(/^\+\s*/, ""));
    let s = Q(0), x = vorn[0], n = 0;
    const geo = !Qgleich(Qp(vorn[1], [-vorn[0][0], vorn[0][1]]), Qp(vorn[2], [-vorn[1][0], vorn[1][1]]));
    const schritt = geo ? Q(vorn[1][0] * vorn[0][1], vorn[1][1] * vorn[0][0]) : Qp(vorn[1], [-vorn[0][0], vorn[0][1]]);
    while (n < 200) { s = Qp(s, x); n++; if (Qgleich(x, letztes)) break; x = geo ? Qm(x, schritt) : Qp(x, schritt); }
    assert.ok(Qgleich(Q(n), soll.n), `Anzahl ${n} statt ${soll.n}`);
    assert.ok(Qgleich(s, soll.s), "Summe");
    return;
  }
  if (a.art === "grenzwert") {
    const f = a.folge;
    const fern = glied(f, 1e6);
    assert.ok(Math.abs(fern - wert(a.felder[0].soll)) < 1e-4, "g passt zu großem n");
    assert.ok(imSchlauch(f, a.n0, a.eps) && (a.n0 === 1 || !imSchlauch(f, a.n0 - 1, a.eps)));
    return;
  }
  /* reihe */
  if (a.kontext === "achilles") {
    /* Etappen einzeln aufsummieren: nach 60 Etappen ist die Summe auf 1e-9 genau */
    let t = a.L / a.vA, T = 0;
    for (let i = 0; i < 60; i++) { T += t; t *= a.vS / a.vA; }
    assert.ok(Math.abs(T - wert(a.felder[0].soll)) < 1e-9 && Math.abs(a.vA * T - wert(a.felder[1].soll)) < 1e-8);
    return;
  }
  if (a.kontext === "ball") {
    let s = a.h, h = a.h * wert(a.q);
    for (let i = 0; i < 400; i++) { s += 2 * h; h *= wert(a.q); }
    assert.ok(Math.abs(s - wert(soll.s[0] === undefined ? a.felder[0].soll : a.felder[0].soll)) < 1e-9);
    return;
  }
  if (a.art === "reihe" && a.stufe >= 3) {
    /* schriftlich dividieren: die Ziffern des Bruchs müssen I,V und dann die Periode zeigen */
    const b = a.felder[0].soll;
    let r = b.z % b.n, ziffern = "";
    for (let i = 0; i < 24; i++) { r *= 10; ziffern += Math.floor(r / b.n); r %= b.n; }
    assert.equal(Math.floor(b.z / b.n), a.I);
    const soll = (a.V + String(a.P).padStart(a.L, "0").repeat(24)).slice(0, 24);
    assert.equal(ziffern, soll, `${a.x}: ${b.z}/${b.n}`);
    return;
  }
  /* Stufe 1/2: Glieder aus der Angabe, Partialsummen gegen den Wert */
  const q = wert(a.q), a1 = wert(a.felder.at(-1).soll) * (1 - q);
  let s = 0, x = a1;
  for (let i = 0; i < 400; i++) { s += x; x *= q; }
  assert.ok(Math.abs(s - wert(a.felder.at(-1).soll)) < 1e-9);
}

test("Generatoren: über viele Startwerte gültig, lösbar, Rückmeldung zu typischen Fehlern, Rechenweg bis zum Ergebnis, A5", () => {
  assert.deepEqual(ARTEN.map((x) => x.id), ["rekursiv", "summe", "grenzwert", "reihe"]);
  const kontexte = new Set();
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) for (let seed = 1; seed <= 250; seed++) {
    const zufall = wuerfelAus(zufallszahlen(seed * 131 + s * 7));
    const a = aufgabe(id, s, zufall);
    const wo = `${id} Stufe ${s} Startwert ${seed}`;
    if (a.kontext) kontexte.add(a.kontext);
    assert.equal(a.art, id, wo); assert.equal(a.stufe, s, wo);
    assert.ok(auftrag(a).length > 40 && /(?:[.?)]|\\ldots\$)$/.test(auftrag(a).trim()), `${wo}: ${auftrag(a)}`);
    assert.ok(tipp(a).length > 20, wo);
    const fs = felder(a);
    assert.ok(fs.length >= 1 && fs.length <= 3, wo);
    for (const f of fs) {
      assert.ok(["ganz", "ganzvz", "zahl", "bruch"].includes(f.modus), `${wo}: Modus ${f.modus}`);
      if (f.typ === "ganz") assert.ok(f.soll.n === 1 && f.modus === (f.soll.z < 0 ? "ganzvz" : "ganz"), wo);
      if (f.typ === "gerundet") assert.equal(f.modus, "zahl");
      assert.ok(f.label && a.loesung[f.k] !== undefined, wo);
    }
    /* Lösung besteht, auch als exakte Dezimalzahl, wo sie abbricht */
    assert.equal(pruefe(a, a.loesung).ok, true, `${wo}: ${JSON.stringify(a.loesung)}`);
    const dezimal = Object.fromEntries(fs.map((f) => [f.k, f.typ === "exakt" && endlich(f.soll.n) ? zTex(f.soll) : a.loesung[f.k]]));
    assert.equal(pruefe(a, dezimal).ok, true, `${wo}: dezimal ${JSON.stringify(dezimal)}`);
    /* leer und Unsinn */
    const leer = pruefe(a, {});
    assert.ok(!leer.ok && leer.grund.startsWith("Fülle"), wo);
    assert.ok(!pruefe(a, Object.fromEntries(fs.map((f) => [f.k, "x"]))).ok, wo);
    /* typische Fehler: jede Falle fällt durch und bekommt genau ihre Rückmeldung */
    for (const falle of a.fallen) {
      const f = fs.find((x) => x.k === falle.k);
      const ein = { ...a.loesung, [f.k]: eingabeFuer(f, falle.wert) };
      const e = pruefe(a, ein);
      assert.equal(e.ok, false, `${wo}: Falle ${f.k} = ${bTex(falle.wert)} wird angenommen`);
      assert.equal(e.grund, falle.text, `${wo}: Falle ${f.k} = ${bTex(falle.wert)}`);
      assert.ok(falle.text.length > 25, wo);
    }
    /* falscher Wert ohne Falle: Hilfe zum Feld */
    for (const f of fs) {
      const falsch = plus(f.soll, B(f.typ === "gerundet" ? 7 : 1));
      if (a.fallen.some((x) => x.k === f.k && gleich(x.wert, falsch))) continue;
      const e = pruefe(a, { ...a.loesung, [f.k]: eingabeFuer(f, falsch) });
      assert.equal(e.ok, false, wo); assert.ok(e.grund.length > 15, `${wo}: ${f.k}`);
    }
    /* gekürzt: ungekürzter Bruch und Dezimalzahl werden erkannt */
    for (const f of fs.filter((x) => x.typ === "gekuerzt")) {
      const e = pruefe(a, { [f.k]: `${f.soll.z * 3}/${f.soll.n * 3}` });
      assert.ok(!e.ok && /gekürzt/.test(e.grund), wo);
    }
    /* Rechenweg: A5, Endergebnis gekürzt, letzte Zeile nennt das Ergebnis des letzten Feldes */
    const weg = rechenweg(a);
    assert.ok(weg.length >= 2, wo);
    for (const z of weg) { assert.ok(a5ok(z), `${wo}: ${z}`); assert.ok(endeGekuerzt(z), `${wo}: ungekürzt ${z}`); assert.ok(!/NaN|undefined|Infinity/.test(z), `${wo}: ${z}`); }
    const letzte = weg.at(-1), lf = fs.at(-1);
    assert.ok(ergebnisTexte(lf).some((t) => letzte.includes(t)), `${wo}: Rechenweg endet nicht bei ${a.loesung[lf.k]}: ${letzte}`);
    for (const t of [auftrag(a), ...a.fallen.map((x) => x.text), ...Object.values(a.hilfe || {})]) assert.ok(a5ok(t.replace(/\$/g, "")), `${wo}: ${t}`);
    /* Zahlen unabhängig nachgerechnet */
    nachgerechnet(a);
  }
  for (const k of ["theater", "geruecht", "sparplan", "ball", "achilles"]) assert.ok(kontexte.has(k), `Kontext ${k} kommt nie vor`);
});

test("Generatoren: Sachaufgaben Theater und Gerücht nachgezählt", () => {
  for (let seed = 1; seed <= 400; seed++) {
    const a = aufgabe("summe", 5, wuerfelAus(zufallszahlen(seed)));
    if (a.kontext === "theater") {
      const [a1, d] = [...a.text.matchAll(/(\d+) Plätze/g)].map((m) => +m[1]);
      let s = 0; for (let r = 0; r < a.n; r++) s += a1 + r * d;
      assert.equal(wert(a.felder[0].soll), s);
    }
    if (a.kontext === "geruecht") {
      let s = 0, neu = 1; for (let tag = 1; tag <= a.n; tag++) { neu *= a.q; s += neu; }
      assert.equal(wert(a.felder[0].soll), s);
    }
  }
});

test("Gliederung, Tipps, Kolloquium", () => {
  assert.equal(GLIEDERUNG.length, 5);
  const min = GLIEDERUNG.reduce((s, g) => s + g.min, 0);
  assert.ok(min >= 15 && min <= 18, String(min));
  assert.equal(TIPPS.length, 3);
  assert.ok(KOLLOQUIUM.length >= 10 && KOLLOQUIUM.length <= 12);
  assert.ok(KOLLOQUIUM.every((q) => q.frage.endsWith("?") && q.antwort.length > 80 && ["Basis", "Vertiefung", "Profi"].includes(q.stufe)));
  const stufen = KOLLOQUIUM.map((q) => ["Basis", "Vertiefung", "Profi"].indexOf(q.stufe));
  assert.ok(stufen.every((s, i) => i === 0 || s >= stufen[i - 1]), "Basis → Profi");
  for (const st of ["Basis", "Vertiefung", "Profi"]) assert.ok(KOLLOQUIUM.some((q) => q.stufe === st), st);
  for (const t of [...GLIEDERUNG.map((g) => g.text), ...TIPPS, ...KOLLOQUIUM.map((q) => q.antwort)]) assert.ok(a5ok(t), t);
  /* Zahlen in den Antworten stimmen */
  assert.ok(KOLLOQUIUM.some((q) => q.antwort.includes("ab n = 101")) && nNull({ form: "kehr", k: 1, c: 0 }, B(1, 100)) === 101);
  assert.ok(KOLLOQUIUM.some((q) => q.antwort.includes("5050")) && gauss(100) === 5050);
  assert.ok(KOLLOQUIUM.some((q) => q.antwort.includes("100/9 s")) && gleich(achilles(100, 10, 1).T, B(100, 9)));
  assert.ok(Math.abs(Math.sqrt(0.6) - 0.77) < 0.005, "Wurzel aus 0,6 ≈ 0,77");
});

test("Seite: Exporte, fünf Animationen, Labor, MatheFeld statt input, TeX in Attributen nur als {\"…\"}", () => {
  const q = readFileSync(new URL("../src/funcGfsFolgen.jsx", import.meta.url), "utf8");
  assert.match(q, /export function GfsFolgenSeite\(\{ gehe \}\)/);
  assert.match(q, /export function FolgenBild\(/);
  assert.match(q, /viewBox="0 0 160 120"/);
  const anims = [...q.matchAll(/<FolgenAnimation art="([a-z]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(anims).size, 5, `Animationen: ${anims}`);
  for (const a of anims) assert.match(q, new RegExp(`\\n  ${a}: \\{ titel:`), `Szene ${a} fehlt`);
  assert.doesNotMatch(q, /\s[a-zA-Z]+="[^"{}]*\\\\[a-zA-Z{]/);
  assert.doesNotMatch(q, /<input(?![^>]*type="range")/, "Eingaben nur über MatheFeld");
  assert.match(q, /<MatheFeld modus=\{f\.modus\}/);
  assert.match(q, /window\.__gfoAufgabe/);
  for (const b of ["Formeln", "Schritt", "Kasten", "Chip", "RoterFaden", "Kolloquium", "AnimKarte"]) assert.match(q, new RegExp(`\\b${b}\\b`));
  /* Lesezeit: kurze Schritttexte (höchstens zwei Sätze, ≤ 130 Zeichen) */
  for (const m of q.matchAll(/\{ von: [\d.]+, text: "([^"]+)" \}/g)) {
    assert.ok(m[1].length <= 130, `Schritttext zu lang: ${m[1]}`);
    assert.ok((m[1].match(/[.!?](\s|$)/g) || []).length <= 2, `mehr als zwei Sätze: ${m[1]}`);
  }
  /* Kurs-Eintrag, Pfad und Kopf passen zusammen */
  const t = THEMEN.find((x) => x.id === "folgen");
  assert.ok(t && t.ansicht === "gfs-folgen" && t.stufe === "k1" && t.kapitel === "I" && t.seite === undefined);
  assert.equal(t.animationen, new Set(anims).size);
  assert.ok(t.frage.endsWith("?"));
  const i = THEMEN.indexOf(t);
  assert.equal(THEMEN[i - 1].id, "stetigkeit", "direkt nach Stetigkeit");
  assert.equal(pfadAufloesen("/gfs-trainer/folgen").ansicht, "gfs-folgen");
  for (const a of ["gfs/folgen", "zahlenfolgen", "geometrische-reihe", "gfs-folgen"]) assert.equal(pfadAufloesen(`/${a}`).ansicht, "gfs-folgen", a);
  const f10 = readFileSync(new URL("../src/func10.jsx", import.meta.url), "utf8");
  assert.match(f10, /lazyLaden\(\(\) => import\("\.\/funcGfsFolgen\.jsx"\)\.then\(\(m\) => \(\{ default: m\.GfsFolgenSeite \}\)\)\)/);
  assert.match(f10, /lazyLaden\(\(\) => import\("\.\/funcGfsFolgen\.jsx"\)\.then\(\(m\) => \(\{ default: m\.FolgenBild \}\)\)\)/);
  assert.match(f10, new RegExp(`chips=\\{\\["Kursstufe 1", "Kap\\. I", "${t.animationen} Animationen"\\]\\} Bild=\\{FolgenBild\\}`));
});
