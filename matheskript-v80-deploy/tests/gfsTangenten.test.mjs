/* GFS · Tangentenprobleme (gfsTangenten.js)
   Mathematik der Herleitung nachgerechnet (Normalparabel, x³ + px, gemeinsame Tangenten, Hügel),
   Anzahl der Tangenten gegen eine unabhängige numerische Zählung, Generatoren über viele Startwerte:
   gültig, Lösung besteht die eigene Prüfung, typische Fehler fallen mit Begründung durch,
   Rechenweg endet beim Ergebnis, Zahlen exakt, A5-sauber. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  zufallszahlen, wuerfelAus, Q, plus, minus, mal, durch, neg, wert, gleich, qTex, qEin, dk, polyTex, geradeTex, psfTex,
  poly, hyp, fWert, fSteigung, fTex, anzahlParabel, parabelStellen, anzahlKubisch, kubikStellen, KURVEN, anzahlTangenten,
  beruehrstellen, tangenteIn, geradeText, laborKoeffizienten, polyDez, HUEGEL, huegelTangente, sichtHindernis, GEMEINSAM,
  ARTEN, aufgabe, auftrag, pruefe, rechenweg, tipp, liesZahl, trifft, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "../src/gfsTangenten.js";

/* Dieselben Muster wie tests/a5.test.mjs – nichts bleibt unvereinfacht stehen */
const N = String.raw`\d+(?:[.,]\d+)?`;
const A5 = [
  new RegExp(String.raw`(?:^|=)\s*${N}\s*[+−\-]\s*${N}\s*$`), new RegExp(String.raw`(?:^|=)\s*${N}\s*(?:·|\\cdot|\*)\s*${N}\s*$`),
  /(^|[^\d.,\w])1\s*(?:·|\\cdot)?\s*x(?![\w])/, /\+\s*[−-]\s*\d/, /[−-]\s*[−-]\s*\d/, /(?:·|\\cdot)\s*1(?![\d,.\/^])/, /[+−-]\s*0(?![\d,.])\s*$/,
  /(?<!_\{[^}]*\}|_-?\d)\^\{?1\}?(?![\d])/,
];
const a5ok = (z) => A5.every((m) => !m.test(z));
const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const gekuerzt = (z) => [...z.matchAll(/\\frac\{(\d+)\}\{(\d+)\}/g)].every(([, a, b]) => ggT(+a, +b) === 1 && +b > 1);
const nah = (x, y, e = 1e-9) => Math.abs(x - y) < e;

/* Unabhängige Zählung: Tangente in u an f geht durch P ⇔ h(u) = f′(u)(a − u) + f(u) − b = 0.
   Nullstellen über Vorzeichenwechsel und Berührungen (lokales Minimum von |h| nahe 0) gezählt. */
function zaehle(f, f1, a, b, von = -30, bis = 30, schritt = 0.0007) {
  const h = (u) => f1(u) * (a - u) + f(u) - b;
  const loes = [];
  let alt = h(von);
  for (let u = von + schritt; u <= bis; u += schritt) {
    const v = h(u);
    if ((v > 0) !== (alt > 0) || v === 0) loes.push(u);
    alt = v;
  }
  return loes;
}

test("Brüche, Lesen, Schreibweise", () => {
  assert.deepEqual(Q(4, -6), { z: -2, n: 3 });
  assert.ok(gleich(plus(Q(1, 2), Q(1, 3)), Q(5, 6)));
  assert.ok(gleich(durch(Q(3, 4), Q(-3, 2)), Q(-1, 2)));
  assert.equal(qTex(Q(-3, 2)), "−\\frac{3}{2}"); assert.equal(qTex(Q(4)), "4"); assert.equal(qEin(Q(-3, 2)), "-3/2");
  assert.equal(polyTex([Q(0), Q(-1), Q(1)]), "x^2 − x");
  assert.equal(polyTex([Q(-5), Q(0), Q(1, 2), Q(-1)]), "−x^3 + \\frac{1}{2}x^2 − 5");
  assert.equal(geradeTex(Q(1), Q(0)), "x"); assert.equal(geradeTex(Q(-1), Q(5)), "−x + 5"); assert.equal(geradeTex(Q(0), Q(-3)), "−3");
  assert.equal(psfTex(Q(2), Q(1), Q(1)), "2(x − 1) + 1");
  assert.equal(psfTex(Q(-1), Q(-2), Q(4)), "−(x + 2) + 4");
  assert.equal(psfTex(Q(3), Q(0), Q(-2)), "3x − 2");
  assert.equal(liesZahl("−3/2").wert, -1.5); assert.ok(gleich(liesZahl("6/-4") ? Q(0) : Q(0), Q(0)));
  assert.equal(liesZahl("1,5").dezimal, true); assert.equal(liesZahl("abc"), null); assert.equal(liesZahl(""), null); assert.equal(liesZahl("2/0"), null);
  assert.ok(trifft(liesZahl("-0,33"), Q(-1, 3)) && !trifft(liesZahl("-0,3"), Q(-1, 3)) && trifft(liesZahl("-2/6"), Q(-1, 3)));
  assert.ok(!trifft(liesZahl("1/3"), Q(-1, 3)));
  assert.equal(dk(-0.5), "−0,5"); assert.equal(dk(-0.0001, 2), "0");
  assert.equal(geradeText(-2, -1).text, "y = −2x − 1"); assert.equal(geradeText(1 / 3, 0.5).text, "y ≈ 0,33x + 0,5");
  assert.equal(polyDez([0.5, 0, -3, 2]), "2u^3 − 3u^2 + 0,5");
});

test("Polynome und Hyperbel: Werte und Ableitungen exakt", () => {
  const f = poly(1, -2, Q(1, 2), 1);           // x³ + ½x² − 2x + 1
  for (const x of [-3, -1, 0, Q(1, 2), 2]) {
    const xv = wert(Q(typeof x === "number" ? x : 0)) || wert(x);
    const v = xv ** 3 + 0.5 * xv * xv - 2 * xv + 1, d = 3 * xv * xv + xv - 2;
    assert.ok(nah(wert(fWert(f, x)), v)); assert.ok(nah(wert(fSteigung(f, x)), d));
  }
  const g = hyp(-6);
  assert.ok(gleich(fWert(g, 2), Q(-3))); assert.ok(gleich(fSteigung(g, 2), Q(3, 2)));
  assert.equal(fTex(g), "−\\frac{6}{x}");
});

test("Herleitung Schritt 1–2: Tangente, Normale, P(1 | −3) an x²", () => {
  // t(x) = 2x − 1 in B(1 | 1), Normale −½x + 3/2, senkrecht
  const f = poly(0, 0, 1), m = fSteigung(f, 1);
  assert.ok(gleich(m, Q(2)) && gleich(minus(fWert(f, 1), m), Q(-1)));
  const mn = neg(durch(1, m));
  assert.ok(gleich(mn, Q(-1, 2)) && gleich(mal(m, mn), Q(-1)));
  assert.ok(gleich(plus(fWert(f, 1), mal(mn, -1)), Q(3, 2)));
  // P(1 | −3): u = −1 und u = 3, Tangenten −2x − 1 und 6x − 9, beide durch P
  assert.deepEqual(parabelStellen(1, -3), [-1, 3]);
  for (const [u, mm, c] of [[-1, -2, -1], [3, 6, -9]]) {
    const t = tangenteIn("parabel", u);
    assert.ok(nah(t.m, mm) && nah(t.c, c) && nah(mm * 1 + c, -3));
  }
});

test("Herleitung Schritt 3: Normalparabel – Diskriminante = unabhängige Zählung, Tangenten unter der Parabel", () => {
  const f = (x) => x * x, f1 = (x) => 2 * x;
  for (let a = -3; a <= 3; a += 0.5) for (let b = -4; b <= 9; b += 0.5) {
    const n = anzahlParabel(a, b);
    const soll = b < a * a ? 2 : b === a * a ? 1 : 0;
    assert.equal(n, soll, `P(${a} | ${b})`);
    if (b !== a * a) assert.equal(zaehle(f, f1, a, b).length, soll, `numerisch P(${a} | ${b})`);
    for (const u of parabelStellen(a, b)) assert.ok(nah(2 * u * a - u * u, b, 1e-9), "P liegt auf jeder Tangente");
  }
  // f − t_u = (x − u)² ≥ 0
  for (const u of [-2, -0.5, 1, 3]) for (let x = -5; x <= 5; x += 0.25) assert.ok(f(x) - (2 * u * x - u * u) >= -1e-12);
});

test("Herleitung Schritt 4: x³ − 3x – Gebiete 1/2/3 gegen numerische Zählung, Wendetangente als Grenzfall", () => {
  const K = KURVEN.kubisch;
  let drei = 0;
  for (let a = -3; a <= 3; a += 0.25) for (let b = -6; b <= 6; b += 0.25) {
    const n = anzahlKubisch(-3, a, b);
    const st = kubikStellen(-3, a, b);
    assert.equal(st.length, n, `Stellen P(${a} | ${b})`);
    for (const u of st) assert.ok(nah(K.f1(u) * (a - u) + K.f(u), b, 1e-7), `P(${a} | ${b}) auf Tangente in ${u}`);
    assert.equal(new Set(st.map((u) => tangenteIn("kubisch", u)).map((g) => `${g.m.toFixed(6)}|${g.c.toFixed(6)}`)).size, n, "verschiedene Geraden");
    const aufGrenze = Math.abs(b - K.f(a)) < 1e-9 || Math.abs(b + 3 * a) < 1e-9;
    if (!aufGrenze) assert.equal(zaehle(K.f, K.f1, a, b).length, n, `numerisch P(${a} | ${b})`);
    const zwischen = (b - K.f(a)) * (b + 3 * a) < 0;
    if (a !== 0 && !aufGrenze) assert.equal(n, zwischen ? 3 : 1, `Gebiet P(${a} | ${b})`);
    if (aufGrenze && Math.abs(a) > 1e-9) assert.equal(n, 2, `Grenze P(${a} | ${b})`);
    if (n === 3) drei++;
  }
  assert.ok(drei > 20);
  assert.equal(anzahlKubisch(-3, 0, 2), 1); assert.equal(anzahlKubisch(-3, 0, 0), 1);
  // Beispiel P(1 | −2,5): u = ½ und (1 ± √3)/2
  const st = kubikStellen(-3, 1, -2.5);
  assert.ok(nah(st[0], (1 - Math.sqrt(3)) / 2, 1e-9) && nah(st[1], 0.5, 1e-9) && nah(st[2], (1 + Math.sqrt(3)) / 2, 1e-9));
  // g(u) = (u − ½)(2u² − 2u − 1) = 2u³ − 3u² + ½
  for (const u of [-2, 0, 0.7, 3]) assert.ok(nah((u - 0.5) * (2 * u * u - 2 * u - 1), 2 * u ** 3 - 3 * u * u + 0.5));
  // auf der Wendetangente: u = 0 (Wendetangente) und u = 1,5a
  assert.deepEqual(kubikStellen(-3, 2, -6), [0, 3]);
  const w = tangenteIn("kubisch", 0); assert.ok(nah(w.m, -3) && nah(w.c, 0));
  // auf der Kurve: u = a und u = −a/2
  assert.deepEqual(kubikStellen(-3, 2, 2), [-1, 2]);
  // allgemeines x³ + px stimmt mit numerischer Zählung
  for (const p of [-2, 0, 1]) for (let a = -2; a <= 2; a += 0.5) for (let b = -5; b <= 5; b += 0.75) {
    const f = (x) => x ** 3 + p * x, f1 = (x) => 3 * x * x + p;
    const c = b - p * a;
    if (Math.abs(c) < 1e-9 || Math.abs(c - a ** 3) < 1e-9) continue;
    assert.equal(zaehle(f, f1, a, b).length, anzahlKubisch(p, a, b), `p = ${p}, P(${a} | ${b})`);
  }
  assert.deepEqual(laborKoeffizienten("kubisch", 1, -2.5), [0.5, 0, -3, 2]);
  assert.deepEqual(laborKoeffizienten("parabel", 1, -3), [-3, -2, 1]);
  for (const id of ["parabel", "kubisch"]) assert.equal(anzahlTangenten(id, ...KURVEN[id].start), id === "parabel" ? 2 : 3);
  assert.equal(beruehrstellen("parabel", 0, 1).length, 0);
});

test("Herleitung Schritt 5–6: gemeinsame Tangenten und Hügel", () => {
  const { f, g, t } = GEMEINSAM;
  for (const [m, c] of t) {
    // y = mx + c berührt beide: Schnittgleichung hat Diskriminante 0
    assert.ok(nah(m * m + 4 * c, 0), "berührt f");
    assert.ok(nah((m - 2) ** 2 - 4 * (c + 5), 0), "berührt g");
  }
  for (const [u, v] of [[-1, 2], [2, -1]]) {
    const m = 2 * u;
    assert.ok(nah(-2 * v + 2, m) && nah(f(u) - m * u, g(v) - m * v));
  }
  // Hügel: u² − 10u + 16 = 0 → u = 2, 8; Tangente −x + 5, t(−4) = 9
  const tB = (u) => HUEGEL.f1(u) * (5 - u) + HUEGEL.f(u);
  assert.ok(nah(tB(2), 0) && nah(tB(8), 0));
  assert.ok(8 > HUEGEL.rand && 2 <= HUEGEL.rand);
  assert.ok(nah(huegelTangente(2), HUEGEL.f(2)) && nah(HUEGEL.f1(2), -1) && nah(huegelTangente(-4), HUEGEL.grenze));
  assert.ok(sichtHindernis(8.9) !== null && sichtHindernis(9) === null && sichtHindernis(9.5) === null && sichtHindernis(2) !== null);
  const [x, y] = sichtHindernis(5);
  assert.ok(nah(y, HUEGEL.f(x), 1e-9) && nah(y, 5 + ((0 - 5) * (x + 4)) / 9, 1e-9), "Treffer liegt auf Hügel und Sichtlinie");
});

/* Antworten, die ein Schüler typischerweise falsch gibt */
function typischFalsch(a) {
  const L = a.loesung;
  if (a.art === "tangente") return [{ ...L, m: qEin(a.fu) }, { ...L, c: qEin(a.fu) }, { ...L, c: qEin(plus(a.fu, mal(a.soll.m, a.u))) }];
  if (a.art === "normale" && a.dreieck) return [{ ...L, A: qEin(mal(a.soll.A, 2)) }, { ...L, xt: qEin(plus(a.u, durch(a.fu, a.ft))) }];
  if (a.art === "normale") return [{ ...L, m: qEin(a.ft) }, { ...L, m: qEin(durch(1, a.ft)) }, { ...L, c: qEin(a.fu) }];
  if (a.art === "aussen") return [{ ...L, u1: qEin(a.P.a) }, { ...L, u1: qEin(neg(a.soll.u1)), u2: qEin(neg(a.soll.u2)) }];
  if (a.optionen) return a.optionen.map((_, i) => i).filter((i) => i !== a.richtig);
  /* gemeinsam: Tangente an f in u1 mit falschem Achsenabschnitt; vertauschte Steigungen */
  return [{ ...L, c1: qEin(plus(a.soll.c1, 1)) }, { ...L, m1: L.m2, m2: L.m1 }];
}

test("Generatoren: alle Arten × Stufen × viele Startwerte – gültig, lösbar, Rückmeldung, Rechenweg, A5", () => {
  const stats = {};
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) for (let seed = 1; seed <= 250; seed++) {
    const zufall = wuerfelAus(zufallszahlen(seed * 37 + s));
    const a = aufgabe(id, s, zufall);
    const wo = `${id} Stufe ${s} Startwert ${seed}`;
    assert.equal(a.art, id, wo); assert.equal(a.stufe, s, wo);
    assert.ok(auftrag(a).length > 40 && tipp(a).length > 20, wo);
    assert.ok(a5ok(auftrag(a).replace(/\$/g, "")), `${wo}: ${auftrag(a)}`);
    const weg = rechenweg(a);
    assert.ok(weg.length >= 3, wo);
    for (const z of weg) { assert.ok(a5ok(z), `${wo}: ${z}`); assert.ok(gekuerzt(z), `${wo}: ungekürzt ${z}`); assert.ok(!/NaN|undefined|Infinity|\\\\;|\s;\\/.test(z), `${wo}: ${z}`); }
    const k = `${id}-${s}`; stats[k] = (stats[k] || 0) + 1;

    if (a.optionen) {
      assert.equal(pruefe(a, a.richtig).ok, true, wo);
      for (const i of typischFalsch(a)) { const e = pruefe(a, i); assert.equal(e.ok, false, wo); assert.ok(e.grund.length > 30, `${wo}: Option ${i}`); }
      assert.ok(new RegExp(`${a.richtig} \\\\text\\{ ?(Tangente|Tangenten)| ${a.richtig} Tangente|: ${a.richtig} Tangente`).test(weg.join(" ")) || weg.at(-1).includes(String(a.richtig)), `${wo}: Ergebnis im Rechenweg`);
      // Anzahl gegen unabhängige Zählung
      const { a: pa, b } = a.P;
      if (a.kurve === "parabel") {
        const k2 = wert(a.f.k[2]), k1 = wert(a.f.k[1]), k0 = wert(a.f.k[0]);
        const f = (x) => k2 * x * x + k1 * x + k0, f1 = (x) => 2 * k2 * x + k1;
        const soll = wert(b) === f(wert(pa)) ? 1 : zaehle(f, f1, wert(pa), wert(b)).length;
        assert.equal(a.richtig, soll, `${wo}: Anzahl`);
      } else {
        const f = (x) => x ** 3 + a.p * x, f1 = (x) => 3 * x * x + a.p;
        assert.equal(a.richtig, anzahlKubisch(a.p, wert(pa), wert(b)), wo);
        if (a.richtig !== 2) assert.equal(zaehle(f, f1, wert(pa), wert(b)).length, a.richtig, `${wo}: numerisch`);
      }
      continue;
    }

    /* Lösung: exakt und als Dezimalzahl (zwei Stellen) */
    assert.equal(pruefe(a, a.loesung).ok, true, `${wo}: ${JSON.stringify(a.loesung)}`);
    const dez = Object.fromEntries(Object.entries(a.soll).map(([kk, v]) => [kk, dk(wert(v), 2)]));
    assert.equal(pruefe(a, dez).ok, true, `${wo}: dezimal ${JSON.stringify(dez)}`);
    assert.equal(pruefe(a, {}).ok, false);
    for (const f of typischFalsch(a)) {
      const e = pruefe(a, f);
      if (e.ok) continue;                     // kann zufällig stimmen (z. B. f(u) = c)
      assert.ok(e.grund.length > 30, `${wo}: ${JSON.stringify(f)} → ${e.grund}`);
    }
    /* Felder passen zu den Lösungen */
    const felder = a.zeilen.flat().map((x) => x.k);
    assert.deepEqual([...felder].sort(), Object.keys(a.soll).sort(), wo);
    for (const x of a.zeilen.flat()) assert.ok(["ganzvz", "bruch"].includes(x.modus), wo);

    /* Mathematik der Lösung */
    if (a.art === "tangente" || (a.art === "normale" && !a.dreieck)) {
      const m = a.art === "tangente" ? fSteigung(a.f, a.u) : neg(durch(1, fSteigung(a.f, a.u)));
      assert.ok(gleich(a.soll.m, m), wo);
      assert.ok(gleich(plus(mal(a.soll.m, a.u), a.soll.c), fWert(a.f, a.u)), `${wo}: Gerade durch B`);
      assert.ok(weg.at(-1).endsWith(geradeTex(a.soll.m, a.soll.c)), `${wo}: Rechenweg endet beim Ergebnis`);
      if (a.f.typ === "hyp") assert.equal(s, 5);
    }
    if (a.art === "normale" && a.dreieck) {
      const ft = fSteigung(a.f, a.u), fu = fWert(a.f, a.u);
      assert.ok(gleich(plus(mal(ft, minus(a.soll.xt, a.u)), fu), Q(0)), `${wo}: x_T`);
      assert.ok(gleich(plus(mal(neg(durch(1, ft)), minus(a.soll.xn, a.u)), fu), Q(0)), `${wo}: x_N`);
      const A = Math.abs(wert(a.soll.xn) - wert(a.soll.xt)) * Math.abs(wert(fu)) / 2;
      assert.ok(nah(wert(a.soll.A), A) && A > 0, wo);
      assert.ok(weg.at(-1).endsWith(qTex(a.soll.A)), wo);
    }
    if (a.art === "aussen") {
      assert.ok(wert(a.soll.u1) < wert(a.soll.u2) && Number.isInteger(wert(a.soll.u1)) && Number.isInteger(wert(a.soll.u2)), wo);
      for (const u of [a.soll.u1, a.soll.u2]) {
        const t = plus(mal(fSteigung(a.f, u), minus(a.P.a, u)), fWert(a.f, u));
        assert.ok(gleich(t, a.P.b), `${wo}: P auf der Tangente in ${qTex(u)}`);
      }
      assert.ok(!gleich(fWert(a.f, a.P.a), a.P.b), `${wo}: P liegt nicht auf der Kurve`);
      if (s >= 2) for (const i of [1, 2]) {
        assert.ok(gleich(a.soll[`m${i}`], fSteigung(a.f, a.soll[`u${i}`])), wo);
        assert.ok(gleich(plus(mal(a.soll[`m${i}`], a.P.a), a.soll[`c${i}`]), a.P.b), wo);
      }
      assert.ok(weg.some((z) => z.startsWith(`u_1 = ${qTex(a.soll.u1)}`)), wo);
      if (s >= 2) assert.ok(weg.at(-1).endsWith(geradeTex(a.soll.m2, a.soll.c2)), wo);
      if (s === 1) assert.ok(gleich(a.P.a, 0) && a.f.k.length === 3 && gleich(a.f.k[2], 1), wo);
      // Reihenfolge der Berührstellen und Tangenten ist egal
      const tausch = { ...a.loesung, u1: a.loesung.u2, u2: a.loesung.u1, ...(s >= 2 ? { m1: a.loesung.m2, c1: a.loesung.c2, m2: a.loesung.m1, c2: a.loesung.c1 } : {}) };
      assert.equal(pruefe(a, tausch).ok, true, `${wo}: vertauscht`);
    }
    if (a.kurve === "gemeinsam") {
      for (const i of [1, 2]) {
        const m = wert(a.soll[`m${i}`]), c = wert(a.soll[`c${i}`]);
        const [k0, k1] = a.f.k.map(wert), [g0, g1] = a.g.k.map(wert);
        assert.ok(nah((k1 - m) ** 2 - 4 * (k0 - c), 0), `${wo}: berührt f`);
        assert.ok(nah((g1 - m) ** 2 + 4 * (g0 - c), 0), `${wo}: berührt g`);   // −x² + g1x + g0 = mx + c doppelt
      }
      assert.ok(!gleich(a.soll.m1, a.soll.m2), wo);
      const tausch = { m1: a.loesung.m2, c1: a.loesung.c2, m2: a.loesung.m1, c2: a.loesung.c1 };
      assert.equal(pruefe(a, tausch).ok, true, `${wo}: vertauscht`);
      assert.ok(weg.at(-1).includes(geradeTex(a.soll.m1, a.soll.c1)) && weg.at(-1).endsWith(geradeTex(a.soll.m2, a.soll.c2)), wo);
    }
    for (const v of Object.values(a.soll)) assert.ok(Math.abs(wert(v)) <= 60 && v.n <= 12, `${wo}: Zahl ${qTex(v)}`);
  }
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) assert.equal(stats[`${id}-${s}`], 250);
});

test("Generatoren: Anzahl-Aufgaben treffen alle Fälle", () => {
  const gesehen = new Set();
  for (let seed = 1; seed <= 300; seed++) for (const s of [1, 2, 3]) {
    const a = aufgabe("anzahl", s, wuerfelAus(zufallszahlen(seed)));
    gesehen.add(`${a.kurve}-${a.richtig}`);
  }
  for (const k of ["parabel-0", "parabel-1", "parabel-2", "kubisch-1", "kubisch-2", "kubisch-3"]) assert.ok(gesehen.has(k), k);
});

test("Gliederung, Tipps, Kolloquium", () => {
  assert.equal(GLIEDERUNG.length, 5);
  const min = GLIEDERUNG.reduce((s, g) => s + g.min, 0);
  assert.ok(min >= 15 && min <= 18, String(min));
  assert.equal(TIPPS.length, 3);
  assert.ok(KOLLOQUIUM.length >= 10 && KOLLOQUIUM.length <= 12);
  assert.ok(KOLLOQUIUM.every((q) => q.frage.endsWith("?") && q.antwort.length > 120 && ["Basis", "Vertiefung", "Profi"].includes(q.stufe)));
  for (const st of ["Basis", "Vertiefung", "Profi"]) assert.ok(KOLLOQUIUM.filter((q) => q.stufe === st).length >= 2, st);
  for (const t of [...GLIEDERUNG.map((g) => g.text), ...TIPPS, ...KOLLOQUIUM.map((q) => q.antwort)]) assert.ok(a5ok(t), t);
  // Zahlen aus den Antworten nachgerechnet
  assert.ok(gleich(fSteigung(poly(0, 0, Q(1, 2)), 2), Q(2)) && gleich(fWert(poly(0, 0, Q(1, 2)), 2), Q(2)));   // ½x², u = 2: t = 2x − 2
  // Grad n: Leitkoeffizient (1 − n)k
  for (const n of [2, 3, 4, 5]) {
    const f = (x) => x ** n, f1 = (x) => n * x ** (n - 1);
    const h = (u) => f1(u) * (0 - u) + f(u);   // a = 0, b = 0
    assert.ok(nah(h(2) / 2 ** n, 1 - n));
  }
});

test("Seite: Exporte, Animationen, Einbindung, TeX in Attributen nur als {\"…\"}", () => {
  const q = readFileSync(new URL("../src/funcGfsTangenten.jsx", import.meta.url), "utf8");
  assert.match(q, /export function GfsTangentenSeite\(\{ gehe \}\)/);
  assert.match(q, /export function TangentenBild\(/);
  assert.match(q, /viewBox="0 0 160 120"/);
  const anims = [...q.matchAll(/<TangentenAnimation art="([a-z-]+)"/g)].map((m) => m[1]);
  assert.ok(new Set(anims).size >= 3 && new Set(anims).size <= 5, `Animationen: ${anims}`);
  for (const a of anims) assert.match(q, new RegExp(`\\n  ${a}: \\{ titel:`), `Szene ${a} fehlt`);
  assert.doesNotMatch(q, /\s[a-zA-Z]+="[^"{}]*\\\\[a-zA-Z{]/);
  assert.doesNotMatch(q, /<input(?![^>]*type="range")/, "Eingaben nur über MatheFeld");
  for (const b of ["Formeln", "Schritt", "Kasten", "Chip", "RoterFaden", "Kolloquium", "MatheFeld", "AnimKarte"]) assert.match(q, new RegExp(`\\b${b}\\b`));
  assert.match(q, /window\.__gtanAufgabe/);
  /* Schritttexte kurz (Lesezeit-Regel) */
  for (const m of q.matchAll(/\{ von: [\d.]+, text: "([^"]+)" \}/g)) assert.ok(m[1].length <= 160, `zu lang: ${m[1]}`);
  /* Einbindung */
  const f10 = readFileSync(new URL("../src/func10.jsx", import.meta.url), "utf8");
  assert.match(f10, /const GfsTangentenSeite = lazyLaden\(/);
  assert.match(f10, /const TangentenBild = lazyLaden\(/);
  assert.match(f10, /chips=\{\["Kursstufe 1", "Kap\. I", "5 Animationen"\]\}/);
  assert.equal(new Set(anims).size, 5);
});
