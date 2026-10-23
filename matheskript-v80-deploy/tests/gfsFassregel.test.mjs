/* GFS · Die Keplersche Fassregel (gfsFassregel.js)
   Mathematik der Herleitung exakt mit Brüchen nachgerechnet (Parabel durch drei Punkte, Exaktheit bis Grad 3,
   Fehler bei x⁴, Volumen von Zylinder, Kegel, Kugel, Kegelstumpf, Parabelfass), numerisch gegen eine feine
   summierte Regel geprüft, Generatoren über viele Startwerte (gültig, Lösung besteht die eigene Prüfung,
   typische Fehler fallen durch und bekommen eine Begründung, Rechenweg endet beim Ergebnis, A5-sauber),
   dazu die Hausregeln in den Quelltexten. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  zufallszahlen, wuerfelAus, Q, zuQ, qAdd, qSub, qMul, qDiv, qWert, qGleich, qTex, qText, ggT, dk, liesZahl,
  poly, polyGrad, polyWert, polyZahl, polyStamm, polyIntegral, polyMal, polyTex,
  fass, rechteck, trapez, summiert, fassQ, fassQSummiert, parabel3, parabelFlaeche, parabelDurch,
  kreis, fassVolumen, fassProfil, parabelFass, fassAbweichung, fassErlaubt, KOERPER, kegelstumpf,
  NICHT_POLY, exaktTex, LABOR_FUNKTIONEN, grenzeSetzen, laborWerte, FASS_VORLAGEN, POTENZ_TEST, BEISPIEL_EXP, BEISPIEL_KEHR,
  ARTEN, ENTSCHEIDUNG, STUFEN_NAMEN, aufgabe, felder, auftrag, pruefe, rechenweg, tipp, termTex,
  GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "../src/gfsFassregel.js";

/* Dieselben Muster wie tests/a5.test.mjs – nichts bleibt unvereinfacht stehen */
const N = String.raw`\d+(?:[.,]\d+)?`;
const A5 = [
  new RegExp(String.raw`(?:^|=)\s*${N}\s*[+−\-]\s*${N}\s*$`), new RegExp(String.raw`(?:^|=)\s*${N}\s*(?:·|\\cdot|\*)\s*${N}\s*$`),
  /(^|[^\d.,\w])1\s*(?:·|\\cdot)?\s*x(?![\w])/, /\+\s*[−-]\s*\d/, /[−-]\s*[−-]\s*\d/, /(?:·|\\cdot)\s*1(?![\d,.\/^])/, /[+−-]\s*0(?![\d,.])\s*$/,
  /(?<!_\{[^}]*\}|_-?\d)\^\{?1\}?(?![\d])/,
];
const a5ok = (z) => A5.every((m) => !m.test(z));
/* Brüche in TeX sind gekürzt – außer dem Vorfaktor (b − a)/6 im Zwischenschritt „\frac{2}{6} = \frac{1}{3}“ */
const gekuerzt = (z) => [...z.replace(/\\frac\{\d+\}\{6\} = /g, "").matchAll(/\\frac\{(\d+)\}\{(\d+)\}/g)].every(([, a, b]) => ggT(+a, +b) === 1);
/* Ergebnis einer Rechenzeile: was hinter dem letzten „=“ bzw. „≈“ steht (ohne Einheit) */
const endwert = (z) => z.split(/=|\\approx/).pop().replace(/\\text\{[^}]*\}/g, "").replace(/\\,/g, "").trim();
const texZahl = (s) => {
  const t = s.replace(/−/g, "-").replace(/\s/g, "");
  const m = /^(-?)\\frac\{(\d+)\}\{(\d+)\}$/.exec(t);
  if (m) return (m[1] ? -1 : 1) * (Number(m[2]) / Number(m[3]));
  return /^-?\d+(,\d+)?$/.test(t) ? Number(t.replace(",", ".")) : NaN;
};
const nah = (x, y, e = 1e-9) => Math.abs(x - y) <= e * Math.max(1, Math.abs(y));
/* sehr genaue Vergleichsrechnung: summierte Fassregel mit vielen Stücken */
const genau = (f, a, b) => summiert(fass, f, a, b, 4000);

test("Brüche, Polynome, Eingaben", () => {
  assert.deepEqual(Q(4, -6), { z: -2, n: 3 });
  assert.deepEqual(zuQ(1.5), { z: 3, n: 2 });
  assert.ok(qGleich(qAdd(Q(1, 3), Q(1, 6)), Q(1, 2)) && qGleich(qMul(Q(2, 3), 3), 2) && qGleich(qDiv(1, Q(1, 4)), 4) && qGleich(qSub(1, Q(1, 3)), Q(2, 3)));
  assert.equal(qTex(Q(-7, 3)), "−\\frac{7}{3}"); assert.equal(qText(Q(-7, 3)), "−7/3"); assert.equal(qTex(Q(5)), "5");
  const p = poly(2, -3, 0, 1);                      // x³ − 3x + 2
  assert.equal(polyTex(p), "x^3 − 3x + 2"); assert.equal(polyTex(poly(0, -1, Q(1, 2))), "\\frac{1}{2}x^2 − x"); assert.equal(polyTex(poly(0)), "0");
  assert.equal(polyGrad(p), 3); assert.ok(qGleich(polyWert(p, 2), 4)); assert.equal(polyZahl(p, 2), 4);
  assert.ok(qGleich(polyIntegral(p, 0, 2), 2));     // [x⁴/4 − 3x²/2 + 2x] von 0 bis 2 = 4 − 6 + 4
  assert.equal(polyTex(polyStamm(p)), "\\frac{1}{4}x^4 − \\frac{3}{2}x^2 + 2x");
  assert.equal(polyTex(polyMal(poly(-1, 1), poly(1, 1))), "x^2 − 1");
  assert.equal(liesZahl("7/3"), 7 / 3); assert.equal(liesZahl("−7/3"), -7 / 3); assert.equal(liesZahl("2,5"), 2.5); assert.equal(liesZahl("-0,25"), -0.25);
  assert.equal(liesZahl("3/0"), null); assert.equal(liesZahl("drei"), null); assert.equal(liesZahl(""), null); assert.equal(liesZahl("1,5/2"), 0.75);
  assert.equal(dk(6.42073, 3), "6,421"); assert.equal(dk(-0.0317, 4), "−0,0317"); assert.equal(dk(2, 3), "2");
});

test("Herleitung: Parabel durch drei Punkte, Fläche = h/3 · (y0 + 4y1 + y2), βx fällt weg", () => {
  for (let h = 1; h <= 4; h++) for (let y0 = -3; y0 <= 3; y0++) for (let y1 = -3; y1 <= 3; y1++) for (let y2 = -3; y2 <= 3; y2++) {
    const par = parabel3(h, y0, y1, y2), p = [par.gamma, par.beta, par.alpha];
    assert.ok(qGleich(polyWert(p, -h), y0) && qGleich(polyWert(p, 0), y1) && qGleich(polyWert(p, h), y2), "Parabel geht durch die Punkte");
    const A = parabelFlaeche(h, par);
    assert.ok(qGleich(A, polyIntegral(p, -h, h)), "Flächenformel = Integral");
    assert.ok(qGleich(A, qMul(Q(h, 3), y0 + 4 * y1 + y2)), "h/3 · (y0 + 4y1 + y2)");
    assert.ok(qGleich(polyIntegral([Q(0), par.beta], -h, h), 0), "βx liefert 0");
  }
  // dieselbe Parabel als Zahlfunktion auf beliebigem [a; b]
  const f = Math.exp, p = parabelDurch(f, 0.3, 1.9);
  for (const x of [0.3, 1.1, 1.9]) assert.ok(nah(p(x), f(x)));
  // Animation „parabel“: y = 0,5 · 3 · 2,5 → α = −1,5, β = 1, γ = 3, Fläche 5
  const an = parabel3(1, Q(1, 2), 3, Q(5, 2));
  assert.ok(qGleich(an.alpha, Q(-3, 2)) && qGleich(an.beta, 1) && qGleich(an.gamma, 3) && qGleich(parabelFlaeche(1, an), 5));
  // Rechteck und Trapez gemischt im Verhältnis 2 : 1 ergeben die Fassregel
  for (const fn of LABOR_FUNKTIONEN) {
    const [a, b] = fn.start;
    assert.ok(nah((2 * rechteck(fn.f, a, b) + trapez(fn.f, a, b)) / 3, fass(fn.f, a, b)), fn.id);
  }
});

test("Satz: exakt für alle Polynome bis Grad 3, Fehler bei x⁴ ist (b − a)⁵/120", () => {
  assert.deepEqual(POTENZ_TEST.map((p) => p.ok), [true, true, true, true, false]);
  assert.ok(qGleich(POTENZ_TEST[4].regel, Q(2, 3)) && qGleich(POTENZ_TEST[4].exakt, Q(2, 5)));
  const rnd = wuerfelAus(zufallszahlen(11));
  for (let i = 0; i < 400; i++) {
    const p = Array.from({ length: 4 }, () => Q(rnd(-9, 9), rnd(1, 6)));
    const a = Q(rnd(-12, 12), rnd(1, 4)), b = qAdd(a, Q(rnd(1, 20), rnd(1, 4)));
    assert.ok(qGleich(fassQ(p, a, b), polyIntegral(p, a, b)), `Grad 3: ${polyTex(p)} auf [${qText(a)}; ${qText(b)}]`);
    assert.ok(qGleich(fassQSummiert(p, a, b, rnd(2, 5)), polyIntegral(p, a, b)));
    // Grad 4: Fehler = c4 · (b − a)^5 / 120, unabhängig vom Rest
    const c4 = Q(rnd(-5, 5) || 1, rnd(1, 3)), p4 = [...p, c4], w = qSub(b, a);
    const fehler = qSub(fassQ(p4, a, b), polyIntegral(p4, a, b));
    assert.ok(qGleich(fehler, qMul(c4, qDiv(qMul(qMul(w, w), qMul(qMul(w, w), w)), 120))), "Fehler bei Grad 4");
    // summiert mit n Stücken: (b − a)^5 / (120 n^4)
    const n = rnd(2, 4);
    assert.ok(qGleich(qSub(fassQSummiert(p4, a, b, n), polyIntegral(p4, a, b)), qDiv(fehler, n ** 4)));
  }
  // Rechenbeispiel der Seite: x⁴ auf [0; 2]: 20/3 − 32/5 = 4/15 = 2⁵/120
  assert.ok(qGleich(fassQ(poly(0, 0, 0, 0, 1), 0, 2), Q(20, 3)) && qGleich(polyIntegral(poly(0, 0, 0, 0, 1), 0, 2), Q(32, 5)));
  assert.ok(qGleich(qSub(Q(20, 3), Q(32, 5)), Q(4, 15)) && qGleich(Q(4, 15), Q(32, 120)));
  // Animation „grad3“: f − p = ±0,375 bzw. zweimal −0,2
  const g3 = (x) => 1.5 * x ** 3 - 0.5 * x * x + 2.5, p3 = (x) => -0.5 * x * x + 1.5 * x + 2.5;
  for (const x of [-1, 0, 1]) assert.ok(nah(g3(x), p3(x)));
  assert.ok(nah(genau((x) => g3(x) - p3(x), -1, 0), 0.375) && nah(genau((x) => g3(x) - p3(x), 0, 1), -0.375));
  const g4 = (x) => 1.5 * x ** 4 + 0.5 * x + 1, p4 = (x) => 1.5 * x * x + 0.5 * x + 1;
  for (const x of [-1, 0, 1]) assert.ok(nah(g4(x), p4(x)));
  assert.ok(nah(genau((x) => g4(x) - p4(x), -1, 0), -0.2, 1e-8) && nah(fass(g4, -1, 1) - genau(g4, -1, 1), 0.4, 1e-8));
});

test("Zahlen der Herleitung: eˣ auf [0; 2], 1/x auf [1; 3], summierte Regel", () => {
  const I = Math.E ** 2 - 1;
  assert.equal(dk(BEISPIEL_EXP.fass, 3), "6,421"); assert.equal(dk(BEISPIEL_EXP.rechteck, 3), "5,437"); assert.equal(dk(BEISPIEL_EXP.trapez, 3), "8,389");
  assert.ok(nah(BEISPIEL_EXP.trapez - I, 2), "Trapez genau 2 zu viel");
  assert.equal(dk(BEISPIEL_EXP.rechteck - I, 3), "−0,952"); assert.equal(dk(BEISPIEL_EXP.fass - I, 4), "0,0317");
  assert.ok(nah(BEISPIEL_EXP.fass, (1 + 4 * Math.E + Math.E ** 2) / 3));
  assert.equal(dk(BEISPIEL_EXP.zwei - I, 4), "0,0022"); assert.equal(dk(BEISPIEL_EXP.vier - I, 5), "0,00014");
  const q1 = (BEISPIEL_EXP.fass - I) / (BEISPIEL_EXP.zwei - I), q2 = (BEISPIEL_EXP.zwei - I) / (BEISPIEL_EXP.vier - I);
  assert.ok(q1 > 14 && q1 < 16 && q2 > 15 && q2 < 16.5, `Quotienten ${q1} ${q2}`);
  assert.ok(nah(BEISPIEL_KEHR.I, Math.log(3)) && BEISPIEL_KEHR.fass > BEISPIEL_KEHR.I && BEISPIEL_KEHR.rechteck < BEISPIEL_KEHR.I && BEISPIEL_KEHR.trapez > BEISPIEL_KEHR.I);
  // Fehlerformel (b − a)^5 / 2880 · f⁗(ξ): für eˣ auf [0; 2] liegt der Fehler zwischen f⁗(0) und f⁗(2) mal 32/2880
  const e = BEISPIEL_EXP.fass - I;
  assert.ok(e > 32 / 2880 && e < (32 / 2880) * Math.E ** 2);
});

test("Fassvolumen: Zylinder, Kegel, Kugel, Kegelstumpf exakt; Parabelfass π h (r_u − 2r_m + r_o)²/30 zu viel", () => {
  for (const r of [3, 10, 25]) for (const h of [5, 40, 80]) {
    for (const [id, K] of Object.entries(KOERPER)) {
      const hh = K.hoehe(r, h);
      assert.ok(nah(fassVolumen(...K.radien(r), hh), K.exakt(r, hh), 1e-12), `${id} r = ${r}`);
      assert.ok(nah(genau((z) => kreis(fassProfil(...K.radien(r), hh)(z)), 0, hh), id === "kugel" ? K.exakt(r, hh) : K.exakt(r, hh), 1e-9) || id === "kugel", id);
    }
    const ro = r + 7;
    assert.ok(nah(fassVolumen(r, (r + ro) / 2, ro, h), kegelstumpf(r, ro, h), 1e-12), "Kegelstumpf");
  }
  // Kugel: Querschnitt π(R² − (z − R)²) – die Fassregel ist exakt
  const R = 7;
  assert.ok(nah(genau((z) => Math.PI * (R * R - (z - R) ** 2), 0, 2 * R), (4 / 3) * Math.PI * R ** 3, 1e-9));
  for (const [ru, rm, ro, h] of [[25, 30, 25, 80], [20, 26, 22, 60], [12, 15, 18, 30], [30, 15, 0, 60], [18, 30, 10, 100]]) {
    const exakt = genau((z) => kreis(fassProfil(ru, rm, ro, h)(z)), 0, h);
    assert.ok(nah(parabelFass(ru, rm, ro, h), exakt, 1e-9), "Parabelfass exakt");
    assert.ok(nah(fassVolumen(ru, rm, ro, h) - parabelFass(ru, rm, ro, h), fassAbweichung(ru, rm, ro, h), 1e-8), "Abweichung");
    assert.ok(fassAbweichung(ru, rm, ro, h) >= 0);
  }
  // Zahlen der Seite: 203 156 cm³, 838 cm³ zu viel, 202,3 l, gut 0,4 %
  assert.equal(Math.round(fassVolumen(25, 30, 25, 80)), 203156);
  assert.ok(nah(fassVolumen(25, 30, 25, 80), (40 / 3) * 4850 * Math.PI));
  assert.equal(Math.round(fassAbweichung(25, 30, 25, 80)), 838); assert.ok(nah(fassAbweichung(25, 30, 25, 80), (800 / 3) * Math.PI));
  assert.equal(dk(parabelFass(25, 30, 25, 80) / 1000, 1), "202,3");
  const proz = (100 * fassAbweichung(25, 30, 25, 80)) / parabelFass(25, 30, 25, 80);
  assert.ok(proz > 0.4 && proz < 0.45, String(proz));
  // Wand bleibt im Labor nie negativ
  assert.ok(fassErlaubt(25, 30, 25, 80) && fassErlaubt(30, 15, 0, 60) && fassErlaubt(20, 2, 20, 80) && !fassErlaubt(20, 1, 0, 80) && !fassErlaubt(-1, 5, 5));
  for (const v of FASS_VORLAGEN) assert.ok(fassErlaubt(v.ru, v.rm, v.ro, v.h), v.id);
});

test("Labor: Funktionen, Grenzen im Raster, exakt genau bei Grad ≤ 3", () => {
  assert.ok(LABOR_FUNKTIONEN.some((f) => f.grad === 3) && LABOR_FUNKTIONEN.some((f) => f.id === "exp"));
  for (const fn of LABOR_FUNKTIONEN) {
    // Stammfunktion passt zu f
    for (const [a, b] of [fn.start, [fn.x[0], fn.x[1]]]) assert.ok(nah(fn.F(b) - fn.F(a), genau(fn.f, a, b), 1e-8), fn.id);
    let [a, b] = fn.start;
    for (let i = 0; i < 40; i++) {
      [a, b] = grenzeSetzen(fn, a, b, i % 3 ? "b" : "a", i % 5 < 2 ? 1 : -1);
      assert.ok(a >= fn.x[0] && b <= fn.x[1] && b - a >= 0.5 - 1e-12 && Number.isInteger(a * 2) && Number.isInteger(b * 2), `${fn.id} ${a} ${b}`);
      if (fn.ab) assert.ok(a >= fn.ab);
      for (const n of [1, 2, 4]) {
        const w = laborWerte(fn, a, b, n);
        if (fn.grad !== null && fn.grad <= 3) assert.equal(w.fassFehler, 0, `${fn.id} [${a}; ${b}] n = ${n}`);
        else assert.notEqual(w.fassFehler, 0, `${fn.id} [${a}; ${b}] n = ${n}`);
        if (fn.id === "quartisch") assert.ok(nah(w.fassFehler, (b - a) ** 5 / (8 * 120 * n ** 4), 1e-6));
        assert.ok(Math.abs(w.fassFehler) <= Math.abs(w.trapezFehler) + 1e-12);
      }
    }
  }
});

/* typische falsche Eingaben je Aufgabe (sie dürfen nicht als richtig durchgehen und brauchen eine Begründung) */
function typischFalsch(a) {
  const l = a.loesung, aus = [];
  const zahlText = (x) => dk(x, 5);
  if (a.art === "anwenden") {
    const t = a.typ === "mess" ? { a: 0, b: a.T, fa: a.y[0], fm: a.y[1], fb: a.y[2] }
      : a.typ === "np" ? a.teile : { a: qWert(a.a), b: qWert(a.b), fa: qWert(a.teile.fa), fm: qWert(a.teile.fm), fb: qWert(a.teile.fb) };
    const w = t.b - t.a;
    const nicht = (v) => ({ ...l, N: zahlText(v) });
    aus.push(nicht((w / 6) * (t.fa + t.fm + t.fb)), nicht((w / 2) * (t.fa + t.fb)), nicht(w * (t.fa + 4 * t.fm + t.fb)));
    if (a.typ === "np") aus.push(nicht(a.I));
    if (a.typ !== "mess" && qWert(a.a) !== 0) aus.push({ ...l, m: zahlText((qWert(a.b) - qWert(a.a)) / 2) });
  } else if (a.art === "exakt") {
    aus.push({ ...l, ex: l.ex === "ja" ? "nein" : "ja" });
    if (l.ex === "nein") aus.push({ ...l, E: zahlText(-qWert(a.soll.E)) }, { ...l, E: "0" });
  } else if (a.art === "fass") {
    if (a.stufe === 5) aus.push({ rm: dk(Math.sqrt((6 * a.Vziel * 1000) / (Math.PI * a.h) - 2 * a.radien[0] ** 2), 2) });
    else {
      const [ru, rm, ro] = a.radien, h = a.h;
      aus.push({ ...l, V: dk((h / 6) * Math.PI * (4 * ru * ru + 16 * rm * rm + 4 * ro * ro) / 1000, 2) }, { ...l, V: dk((h / 6) * Math.PI * (ru * ru + rm * rm + ro * ro) / 1000, 2) });
      if (a.stufe === 4) aus.push({ ...l, rm: dk(2 * rm, 1) });
    }
  } else if (a.typ === "parabel") {
    const [y0, y1, y2] = a.y;
    aus.push({ ...l, alpha: dk((y0 - 2 * y1 + y2) / 2 + 1e-9 + (a.h === 1 ? 7 : 0), 4) });
    if (a.stufe === 3) aus.push({ ...l, A: dk((a.h / 6) * (y0 + 4 * y1 + y2), 4) });
    else aus.push({ ...l, beta: dk((y0 - y2) / (2 * a.h), 4) });
  } else aus.push({ g0: "1", g1: "4", g2: "1" }, { g0: l.g1, g1: l.g0, g2: l.g2 });
  return aus;
}

test("Generatoren: alle Arten × Stufen × viele Startwerte – gültig, prüfbar, Rechenweg sauber", () => {
  assert.deepEqual(ARTEN.map((x) => x.id), ["anwenden", "exakt", "fass", "gewichte"]);
  for (const { id } of ARTEN) {
    assert.equal(STUFEN_NAMEN[id].length, 5);
    for (let s = 1; s <= 5; s++) {
      const gesehen = new Set();
      for (let seed = 1; seed <= 250; seed++) {
        const a = aufgabe(id, s, wuerfelAus(zufallszahlen(seed * 37 + s)));
        const wo = `${id} Stufe ${s} Startwert ${seed}`;
        gesehen.add(auftrag(a));
        assert.equal(a.art, id, wo); assert.equal(a.stufe, s, wo);
        const txt = auftrag(a);
        assert.ok(txt.length > 50 && tipp(a).length > 20, wo);
        assert.ok(!/NaN|undefined|Infinity|\+ −|− −/.test(txt), `${wo}: ${txt}`);
        // Lösung besteht die eigene Prüfung, leere Eingabe nicht
        assert.equal(pruefe(a, a.loesung).ok, true, `${wo}: ${JSON.stringify(a.loesung)}`);
        assert.equal(pruefe(a, {}).ok, false, wo);
        for (const [k, , , modus, tol] of felder(a)) {
          if (modus === "wahl") { assert.ok(ENTSCHEIDUNG.some((o) => o.id === a.soll[k])); continue; }
          assert.ok(["bruch", "zahl"].includes(modus), wo);
          assert.ok(tol > 0 && Number.isFinite(qWert(a.soll[k])), `${wo}: ${k}`);
          // Brüche in der Lösung nur, wo das Feld Brüche annimmt
          if (/\//.test(a.loesung[k])) assert.equal(modus, "bruch", `${wo}: ${k}`);
          // exakte Lösung (Bruch) auch als gerundete Dezimalzahl richtig
          if (modus === "bruch" && /\//.test(a.loesung[k])) assert.equal(pruefe(a, { ...a.loesung, [k]: dk(qWert(a.soll[k]), 3) }).ok, true, `${wo}: ${k} als Dezimalzahl`);
        }
        // typische Fehler
        for (const f of typischFalsch(a)) {
          const e = pruefe(a, f);
          if (e.ok) continue;
          assert.ok(e.grund.length > 25 && !/NaN|undefined/.test(e.grund), `${wo}: ${JSON.stringify(f)} → ${e.grund}`);
        }
        // Rechenweg: A5, gekürzt, kein NaN, endet beim Ergebnis
        const weg = rechenweg(a);
        assert.ok(weg.length >= 2, wo);
        for (const z of weg) {
          assert.ok(!/NaN|undefined|Infinity/.test(z), `${wo}: ${z}`);
          assert.ok(a5ok(z), `${wo}: A5 ${z}`);
          assert.ok(gekuerzt(z), `${wo}: ungekürzt ${z}`);
          assert.ok(!/\+ −|− −|\+ \(\+/.test(z), `${wo}: Vorzeichen ${z}`);
          assert.ok(!/(^|[^\d])1(x|\\alpha|\\beta|g_)/.test(z.replace(/\\frac\{1\}/g, "")), `${wo}: Faktor 1 ${z}`);
        }
        const schluss = weg.join("\n");
        /* jede Zeile in Teile zerlegen (\quad, ⇒, Klammerzusatz) – ein Teil muss auf dem Ergebnis enden */
        const teile = weg.flatMap((z) => z.replace(/\\quad \(.*$/, "").split(/\\quad|\\;\\Rightarrow\\;/)).map((x) => endwert(x.replace(/,\s*$/, "")));
        for (const [k, , , modus, tol] of felder(a)) {
          if (modus === "wahl") continue;
          const soll = qWert(a.soll[k]);
          const kommtVor = teile.some((x) => { const w = texZahl(x); return Number.isFinite(w) && Math.abs(w - soll) <= Math.max(1e-9, tol); });
          assert.ok(kommtVor, `${wo}: Rechenweg endet nicht bei ${k} = ${a.loesung[k]}\n${schluss}`);
        }
        /* die letzte Zeile endet auf dem Endergebnis (letztes Feld) */
        const letzt = felder(a).filter(([, , , m]) => m !== "wahl").pop();
        const wl = texZahl(endwert(weg[weg.length - 1].replace(/\\quad \(.*$/, "").split(/\\;\\Rightarrow\\;/).filter((x) => /\d/.test(x)).pop() || ""));
        if (id === "fass" || (id === "anwenden" && a.typ !== "poly") || (id === "gewichte" && s === 3)) {          // dort ist die letzte Zeile das Endergebnis
          assert.ok(Number.isFinite(wl) && Math.abs(wl - qWert(a.soll[letzt[0]])) <= Math.max(1e-9, letzt[4]), `${wo}: letzte Zeile ≠ ${letzt[0]}\n${schluss}`);
        }
        if (id === "exakt") {
          if (a.typ === "poly") {
            assert.ok(qGleich(a.soll.E, qSub(a.N, a.I)) && (a.grad <= 3) === qGleich(a.soll.E, 0), wo);
            assert.ok(qGleich(polyIntegral(a.p, a.a, a.b), a.I));
          } else assert.ok(Math.abs(a.soll.E) >= 0.0002 && a.soll.ex === "nein", wo);
          if (s === 3) assert.ok(/\(/.test(a.tex) && polyTex(a.p) !== a.tex, wo);
          if (s === 5) assert.equal(a.n, 2);
        }
        if (id === "anwenden") {
          if (a.typ === "poly") { assert.ok(polyGrad(a.p) <= 3 && qGleich(a.soll.N, polyIntegral(a.p, a.a, a.b)), wo); if (s === 3) assert.ok(qWert(a.soll.m) % 1 !== 0, wo); }
          if (a.typ === "np") assert.ok(nah(a.soll.N, fass(NICHT_POLY[a.fn].f, a.a, a.b)) && Math.abs(a.soll.N - a.I) > 2 * felder(a)[1][4], `${wo}: exakter Wert ginge als Näherung durch`);
          if (a.typ === "mess") assert.ok(qGleich(a.soll.N, Q(a.T * (a.y[0] + 4 * a.y[1] + a.y[2]), 6)) && a.T % 6 === 0, wo);
        }
        if (id === "fass") {
          const [ru, rm, ro] = a.radien;
          if (s === 5) assert.ok(nah(fassVolumen(ru, a.soll.rm, ro, a.h), a.Vziel * 1000, 1e-9) && a.soll.rm > ru + 2, wo);
          else assert.ok(nah(a.soll.V * 1000, fassVolumen(ru, rm, ro, a.h)), wo);
          if (s === 1) assert.ok(nah(a.soll.V * 1000, KOERPER[a.koerper].exakt(a.r, a.h), 1e-12), `${wo}: Grundkörper exakt`);
          if (s === 4) assert.ok(nah(a.soll.V * 1000, kegelstumpf(ru, ro, a.h), 1e-12) && rm === (ru + ro) / 2, wo);
        }
        if (id === "gewichte") {
          if (a.typ === "parabel") {
            const p = [a.par.gamma, a.par.beta, a.par.alpha];
            assert.ok(a.y.every((y, i) => qGleich(polyWert(p, (i - 1) * a.h), y)), wo);
            if (s === 3) assert.ok(qGleich(a.soll.A, polyIntegral(p, -a.h, a.h)), wo);
          } else {
            const [g0, g1, g2] = [a.soll.g0, a.soll.g1, a.soll.g2], [u, v] = a.typ === "symm" ? [-a.h, a.h] : [0, a.w];
            const st = [u, (u + v) / 2, v];
            for (const k of [0, 1, 2, 3]) {
              const p = Array.from({ length: k + 1 }, (_, i) => Q(i === k ? 1 : 0));
              const regel = qAdd(qAdd(qMul(g0, polyWert(p, st[0])), qMul(g1, polyWert(p, zuQ(st[1])))), qMul(g2, polyWert(p, st[2])));
              assert.ok(qGleich(regel, polyIntegral(p, u, v)), `${wo}: x^${k}`);
            }
            assert.ok(qGleich(g1, qMul(4, g0)) && qGleich(g0, g2), wo);
          }
        }
      }
      assert.ok(gesehen.size >= (id === "gewichte" && s >= 4 ? 4 : 6), `${id} Stufe ${s}: nur ${gesehen.size} verschiedene Aufgaben`);
    }
  }
});

test("Gezielte Rückmeldung zu typischen Fehlern", () => {
  const z = (seed) => wuerfelAus(zufallszahlen(seed));
  let a = aufgabe("anwenden", 2, z(5));
  const t = a.teile, w = qWert(qSub(a.b, a.a));
  assert.match(pruefe(a, { ...a.loesung, N: dk((w / 6) * (qWert(t.fa) + qWert(t.fm) + qWert(t.fb)), 5) }).grund, /vierfach/);
  assert.match(pruefe(a, { ...a.loesung, N: dk((w / 2) * (qWert(t.fa) + qWert(t.fb)), 5) }).grund, /Trapezregel/);
  assert.match(pruefe(a, { ...a.loesung, N: dk(w * qWert(t.summe), 5) }).grund, /Vorfaktor/);
  a = aufgabe("anwenden", 5, z(9));
  assert.match(pruefe(a, { ...a.loesung, N: dk(a.I, 4) }).grund, /exakte Wert/);
  a = aufgabe("exakt", 1, z(3));
  const falsch = a.soll.ex === "ja" ? "nein" : "ja";
  assert.match(pruefe(a, { ...a.loesung, ex: falsch }).grund, /Grad/);
  for (let s = 1; s <= 200; s++) {
    const b = aufgabe("exakt", 2, z(s));
    if (b.soll.ex !== "nein") continue;
    assert.match(pruefe(b, { ...b.loesung, E: qText(qSub(b.I, b.N)) }).grund, /Vorzeichen/);
    break;
  }
  a = aufgabe("fass", 3, z(4));
  const [ru, rm, ro] = a.radien;
  assert.match(pruefe(a, { V: dk((a.h / 6) * Math.PI * (4 * ru * ru + 16 * rm * rm + 4 * ro * ro) / 1000, 2) }).grund, /Durchmesser/);
  assert.match(pruefe(a, { V: dk(a.soll.V * 1000, 0) }).grund, /cm³/);
  a = aufgabe("fass", 5, z(6));
  assert.match(pruefe(a, { rm: dk(4 * a.soll.rm ** 2 / 4, 1) }).grund, /Wurzel/);
  for (let s = 1; s <= 50; s++) {
    a = aufgabe("gewichte", 4, z(s));
    if (a.h === 3) continue;                                   // bei h = 3 sind 1, 4, 1 die richtigen Gewichte
    assert.match(pruefe(a, { g0: "1", g1: "4", g2: "1" }).grund, /Verhältnis/);
    assert.match(pruefe(a, { g0: "1", g1: "1", g2: "1" }).grund, /f\(x\) = 1/);
    break;
  }
  a = aufgabe("gewichte", 2, z(8));
  assert.match(pruefe(a, { ...a.loesung, gamma: String(a.y[1] + 1) }).grund, /x = 0/);
  assert.match(pruefe(a, { ...a.loesung, alpha: "abc" }).grund, /Zahl ein/);
});

test("Exakte Werte und Funktionswerte der Nicht-Polynome", () => {
  for (const [id, F] of Object.entries(NICHT_POLY)) {
    for (const [a, b] of [[0, 1], [0, 2], [1, 2], [1, 3], [1, 5], [0, 4], [1, 9], [4, 16]]) {
      if (id === "kehr" && a === 0) continue;
      if (id === "wurzel" && ![[0, 4], [1, 9], [4, 16], [0, 1]].some(([u, v]) => u === a && v === b)) continue;
      assert.ok(nah(F.F(b) - F.F(a), genau(F.f, a, b), id === "wurzel" && a === 0 ? 1e-5 : 1e-7), `${id} [${a}; ${b}]`);
      const ex = exaktTex(id, a, b);
      assert.ok(!/NaN|undefined/.test(ex) && a5ok(ex), ex);
    }
  }
  assert.equal(exaktTex("exp", 0, 2), "e^{2} − 1"); assert.equal(exaktTex("kehr", 1, 3), "\\ln 3");
  assert.equal(exaktTex("wurzel", 0, 4), "\\frac{2}{3} \\cdot 4^{\\frac{3}{2}} = \\frac{16}{3}");
  assert.equal(NICHT_POLY.kehr.wTex(3), "\\frac{1}{3}"); assert.equal(NICHT_POLY.wurzel.wTex(9), "3"); assert.equal(NICHT_POLY.exp.wTex(1), "e");
  assert.equal(termTex({ typ: "np", fn: "kehr" }), "\\frac{1}{x}");
});

test("Gliederung, Tipps, Kolloquium", () => {
  assert.equal(GLIEDERUNG.length, 5);
  const summe = GLIEDERUNG.reduce((s, g) => s + g.min, 0);
  assert.ok(summe >= 15 && summe <= 18, String(summe));
  assert.equal(TIPPS.length, 3);
  assert.ok(KOLLOQUIUM.length >= 10 && KOLLOQUIUM.length <= 12);
  assert.ok(KOLLOQUIUM.every((q) => q.frage.endsWith("?") && q.antwort.length > 120 && ["Basis", "Vertiefung", "Profi"].includes(q.stufe)));
  for (const st of ["Basis", "Vertiefung", "Profi"]) assert.ok(KOLLOQUIUM.filter((q) => q.stufe === st).length >= 3, st);
  // Reihenfolge Basis → Vertiefung → Profi
  const rang = { Basis: 0, Vertiefung: 1, Profi: 2 };
  KOLLOQUIUM.forEach((q, i) => { if (i) assert.ok(rang[q.stufe] >= rang[KOLLOQUIUM[i - 1].stufe]); });
  for (const t of [...GLIEDERUNG.map((g) => g.text), ...TIPPS, ...KOLLOQUIUM.map((q) => q.antwort)]) assert.ok(a5ok(t), t);
  // Zahlen in den Antworten stimmen
  const alle = KOLLOQUIUM.map((q) => q.antwort).join(" ");
  assert.match(alle, /6,4207/); assert.match(alle, /6,3891/); assert.match(alle, /0,0317/); assert.match(alle, /0,952/); assert.match(alle, /0,84 Liter/);
  assert.ok(nah((1 + 4 * Math.E + Math.E ** 2) / 3, 6.4207, 1e-5) && nah(Math.E ** 2 - 1, 6.3891, 1e-5));
  assert.equal(dk(fassAbweichung(25, 30, 25, 80) / 1000, 2), "0,84");
  // Gauß-Quadratur mit drei Stellen ist bis Grad 5 exakt (Profi-Frage)
  const g = Math.sqrt(3 / 5);
  for (let k = 0; k <= 5; k++) assert.ok(nah((5 / 9) * (-g) ** k + (8 / 9) * 0 ** k + (5 / 9) * g ** k, k % 2 ? 0 : 2 / (k + 1)), `Gauß x^${k}`);
  assert.equal(dk(g, 3), "0,775");
});

/* ---------- Hausregeln in den Quelltexten ---------- */
test("Quelltexte: Exporte, Animationen, Eingaben, keine TeX-Attribute, keine Gendersprache, kein Selbst-Scrollen", () => {
  const jsx = readFileSync(new URL("../src/funcGfsFassregel.jsx", import.meta.url), "utf8");
  const js = readFileSync(new URL("../src/gfsFassregel.js", import.meta.url), "utf8");
  assert.match(jsx, /export function GfsFassregelSeite\(\{ gehe \}\)/);
  assert.match(jsx, /export function FassBild\(\)/);
  assert.match(jsx, /className="gtk-bild" viewBox="0 0 160 120"/);
  assert.match(jsx, /from "\.\/funcGfsBausteine\.jsx"/);
  assert.match(jsx, /from "\.\/funcAnimKarte\.jsx"/);
  const anims = [...jsx.matchAll(/<FassAnimation art="([a-z0-9]+)"/g)].map((m) => m[1]);
  assert.ok(new Set(anims).size >= 3 && new Set(anims).size <= 5, `Animationen: ${anims}`);
  for (const a of anims) assert.match(jsx, new RegExp(`\\n  ${a}: \\{ titel:`), `Szene ${a} fehlt`);
  // Schritttexte kurz (Lesezeit-Regel): höchstens 140 Zeichen
  for (const m of jsx.matchAll(/\{ von: [\d.]+, text: "([^"]+)" \}/g)) assert.ok(m[1].length <= 140, `zu langer Schritttext: ${m[1]}`);
  // Eingaben nur über MatheFeld
  assert.match(jsx, /<MatheFeld modus=\{modus\}/);
  assert.ok(!/<input\b/.test(jsx), "kein <input> – MatheFeld benutzen");
  assert.match(jsx, /window\.__fassAufgabe/);
  for (const [name, q] of [["jsx", jsx], ["js", js]]) {
    q.split("\n").forEach((z, i) => {
      assert.ok(!/\s[a-zA-Z]+="[^"{}]*\\\\[a-zA-Z{]/.test(z), `${name}:${i + 1}: TeX im JSX-Attribut`);
      assert.ok(!/[*:_]innen\b|[a-zäöü]Innen\b/.test(z), `${name}:${i + 1}: Gendersprache`);
      assert.ok(!/\.(scrollTo|scrollIntoView|scrollBy)\s*\(/.test(z), `${name}:${i + 1}: Scrollen nur über springe()`);
      assert.ok(!z.includes("√"), `${name}:${i + 1}: Wurzeln nur über \\sqrt`);
    });
    assert.ok(!/Lambacher|Schweizer|Klett|Abi-relevant/.test(q.replace(/\/\*[\s\S]*?\*\//g, "")), `${name}: keine Buchverweise, keine Abi-Werbung`);
  }
  // Farben nur aus C (keine Hex-Farben außerhalb des Kopfbilds)
  const ohneKopf = jsx.slice(0, jsx.indexOf("export function FassBild")) + jsx.slice(jsx.indexOf("Erkläranimationen (Szenen"));
  const fremd = [...ohneKopf.matchAll(/"#[0-9A-Fa-f]{3,6}"/g)].map((m) => m[0]).filter((f) => !["\"#FFF3C4\"", "\"#FFF6D6\"", "\"#E6ECF8\"", "\"#DCE6F5\"", "\"#FBEFE9\""].includes(f));
  assert.deepEqual(fremd, [], "Farben aus C verwenden");
});
