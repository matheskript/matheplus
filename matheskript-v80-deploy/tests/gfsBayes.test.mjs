/* GFS · Der Satz von Bayes (gfsBayes.js) */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dk, pz, lies, liesProzent, bayes, nachTests, chance, ausChance, haeufigkeiten, mitSeed,
  LABOR_START, VOREINSTELLUNGEN, pAusRegler, reglerAusP, P_MIN, P_MAX,
  KONTEXTE, ARTEN, aufgabe, auftrag, felder, pruefe, rechenweg, tipp, tafelZeilen,
  BEGRUENDUNGEN, gemischt, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "../src/gfsBayes.js";

/* Dieselben Muster wie tests/a5.test.mjs – nichts bleibt unvereinfacht stehen */
const N = String.raw`\d+(?:[.,]\d+)?`;
const A5 = [
  new RegExp(String.raw`(?:^|=)\s*${N}\s*[+−\-]\s*${N}\s*$`), new RegExp(String.raw`(?:^|=)\s*${N}\s*(?:·|\\cdot|\*)\s*${N}\s*$`),
  /(^|[^\d.,\w])1\s*(?:·|\\cdot)?\s*x(?![\w])/, /\+\s*[−-]\s*\d/, /[−-]\s*[−-]\s*\d/, /(?:·|\\cdot)\s*1(?![\d,.\/^])/, /[+−-]\s*0(?![\d,.])\s*$/,
  /(?<!_\{[^}]*\}|_-?\d)\^\{?1\}?(?![\d])/,
];
const a5ok = (z) => A5.every((m) => !m.test(z));
const nahe = (a, b, eps = 1e-12) => Math.abs(a - b) <= eps;

test("Bayes: Grundbeispiel 2 % · 90 % · 95 % ergibt 18/67, zweiter Test 324/373", () => {
  const r = bayes(0.02, 0.9, 0.95);
  assert.ok(nahe(r.kp, 0.018) && nahe(r.gp, 0.049) && nahe(r.pPos, 0.067));
  assert.ok(nahe(r.ppv, 18 / 67));
  assert.equal(pz(100 * r.ppv), "26,9 %");
  assert.ok(nahe(r.kp + r.kn + r.gp + r.gn, 1));
  assert.ok(nahe(r.pPos + r.pNeg, 1));
  assert.ok(nahe(r.npv + r.rest, 1));
  assert.ok(nahe(nachTests(0.02, 0.9, 0.95, 2), 324 / 373));
  assert.equal(pz(100 * nachTests(0.02, 0.9, 0.95, 2)), "86,9 %");
  assert.equal(nachTests(0.02, 0.9, 0.95, 0), 0.02);
  // Chancen-Form: Chance danach = Chance davor · Likelihood-Quotient
  assert.ok(nahe(r.lr, 18, 1e-9));
  assert.ok(nahe(ausChance(chance(0.02) * r.lr), r.ppv, 1e-12));
  assert.ok(nahe(ausChance(chance(0.02) * r.lr ** 2), nachTests(0.02, 0.9, 0.95, 2), 1e-12));
});

test("Bayes: numerisch gegen Definition und Monte-Carlo-Abzählung", () => {
  const z = mitSeed(42);
  for (let i = 0; i < 400; i++) {
    const p = z(1, 999) / 1000, se = z(500, 999) / 1000, sp = z(500, 999) / 1000;
    const r = bayes(p, se, sp);
    // Definition: P_+(K) = P(K ∩ +) / P(+), Satz von der totalen Wahrscheinlichkeit im Nenner
    assert.ok(nahe(r.ppv, (p * se) / (p * se + (1 - p) * (1 - sp)), 1e-12));
    assert.ok(nahe(r.ppv * r.pPos, p * se, 1e-12), "Schnittmenge auf zwei Arten");
    assert.ok(nahe(r.rest, (p * (1 - se)) / (p * (1 - se) + (1 - p) * sp), 1e-12));
    // Monotonie: mehr Basisrate → größeres P_+(K)
    if (p < 0.99) assert.ok(bayes(p + 0.005, se, sp).ppv > r.ppv);
    // zwei Tests = ein Test mit dem ersten Ergebnis als Prior
    assert.ok(nahe(nachTests(p, se, sp, 2), bayes(r.ppv, se, sp).ppv, 1e-12));
    assert.ok(nahe(ausChance(chance(p) * r.lr ** 3), nachTests(p, se, sp, 3), 1e-9));
  }
  // Abzählen mit Zufallspersonen: 200 000 Personen, Toleranz drei Standardfehler
  const zz = mitSeed(7), p = 0.05, se = 0.9, sp = 0.9;
  let pos = 0, kp = 0;
  for (let i = 0; i < 200000; i++) {
    const krank = zz(0, 999999) < p * 1e6;
    const positiv = krank ? zz(0, 999999) < se * 1e6 : zz(0, 999999) < (1 - sp) * 1e6;
    if (positiv) { pos++; if (krank) kp++; }
  }
  const soll = bayes(p, se, sp).ppv;
  assert.ok(Math.abs(kp / pos - soll) < 3 * Math.sqrt((soll * (1 - soll)) / pos), `${kp / pos} statt ${soll}`);
});

test("Häufigkeiten: ganze Personen, Summen stimmen; Labor-Start 18 / 67", () => {
  const h = haeufigkeiten(1000, LABOR_START.p / 100, LABOR_START.se / 100, LABOR_START.sp / 100);
  assert.deepEqual([h.krank, h.kp, h.kn, h.gesund, h.gp, h.gn, h.pos], [20, 18, 2, 980, 49, 931, 67]);
  const z = mitSeed(3);
  for (let i = 0; i < 300; i++) {
    const g = haeufigkeiten(1000, z(1, 500) / 1000, z(500, 999) / 1000, z(500, 999) / 1000);
    assert.equal(g.kp + g.kn, g.krank); assert.equal(g.gp + g.gn, g.gesund);
    assert.equal(g.pos + g.neg, 1000); assert.equal(g.krank + g.gesund, 1000);
    for (const k of ["kp", "kn", "gp", "gn"]) assert.ok(Number.isInteger(g[k]) && g[k] >= 0);
  }
  for (const v of VOREINSTELLUNGEN) assert.ok(v.p >= P_MIN && v.p <= P_MAX && v.se <= 99.9 && v.sp <= 99.9, v.id);
});

test("Prävalenz-Regler: logarithmisch, Ränder und Rückweg", () => {
  assert.equal(pAusRegler(0), P_MIN); assert.equal(pAusRegler(100), P_MAX);
  for (const p of [0.1, 0.5, 2, 5, 20, 50]) assert.ok(Math.abs(pAusRegler(reglerAusP(p)) - p) < 1e-9, `${p}`);
  let alt = 0;
  for (let v = 0; v <= 100; v += 0.1) { const p = pAusRegler(v); assert.ok(p >= alt); alt = p; }
});

test("Eingaben: Komma, Prozentzeichen, Bruch", () => {
  assert.equal(lies("26,9"), 26.9); assert.equal(lies("26.9 %"), 26.9); assert.equal(lies("−2"), -2); assert.equal(lies("abc"), null);
  assert.ok(Math.abs(liesProzent("18/67") - (100 * 18) / 67) < 1e-12);
  assert.equal(liesProzent("26,9%"), 26.9); assert.equal(liesProzent(""), null);
});

/* richtige Eingabe so, wie ein Schüler sie tippt (gerundet wie verlangt) */
const richtig = (a) => Object.fromEntries(felder(a).map(([k, , e]) => [k, e === "%" ? dk(a[k], k === "rest" ? a.stellen : 1) : String(a[k])]));

test("Generatoren: über viele Seeds stabil, lösbar, Rechenweg A5-sauber", () => {
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) for (let seed = 1; seed <= 300; seed++) {
    const a = aufgabe(id, s, mitSeed(seed * 31 + s));
    const was = `${id} Stufe ${s} Seed ${seed} ${JSON.stringify(a)}`;
    assert.equal(a.art, id, was);
    for (const [k] of felder(a)) assert.ok(Number.isFinite(a[k]) && a[k] >= 0, `${was}: ${k}`);
    assert.equal(pruefe(a, richtig(a)).ok, true, was);
    assert.equal(pruefe(a, {}).ok, false);
    const text = auftrag(a);
    assert.ok(text.length > 60 && !/undefined|NaN|null/.test(text), was);
    assert.ok(tipp(a).length > 20);
    const weg = rechenweg(a);
    assert.ok(weg.length >= 2, was);
    for (const z of weg) { assert.ok(a5ok(z), `${was}: ${z}`); assert.ok(!/NaN|undefined|Infinity/.test(z), z); }
    // Werte sinnvoll: Wahrscheinlichkeiten in (0; 100), nach dem Test größer bzw. kleiner als vorher
    if (id === "ppv") assert.ok(a.ppv > a.p && a.ppv < 100, was);
    if (id === "zweiter") assert.ok(a.ppv2 > a.ppv1 && a.ppv1 > a.p, was);
    if (id === "negativ") assert.ok(a.rest < a.p && a.rest > 0 && dk(a.rest, a.stellen) !== "0", was);
    if (id === "haeufigkeit" || id === "tafel") {
      const h = a.h;
      for (const k of ["krank", "kp", "kn", "gesund", "gp", "gn"]) assert.ok(Number.isInteger(h[k]), `${was}: ${k}`);
      assert.ok(h.kp >= 1 && h.gp >= 1);
      // Die Zahlen der Aufgabe passen exakt zu den Prozentangaben
      if (id === "haeufigkeit") { assert.equal(h.krank, (a.N * a.p) / 100); assert.ok(nahe(h.kp, (h.krank * a.se) / 100, 1e-9)); }
    }
    if (id === "tafel") {
      const t = tafelZeilen(a);
      assert.equal(t.zeilen[2][3], a.N);
      assert.equal(t.zeilen[0][1] + t.zeilen[1][1], t.zeilen[2][1]);
    }
  }
});

test("Generatoren: alle Kontexte kommen vor, Stufen ändern die Zahlen", () => {
  const ids = new Set(), ps = { 1: new Set(), 5: new Set() };
  for (let seed = 1; seed <= 200; seed++) {
    const a = aufgabe("ppv", 1, mitSeed(seed)), b = aufgabe("ppv", 5, mitSeed(seed));
    ids.add(a.k); ps[1].add(a.p); ps[5].add(b.p);
  }
  assert.equal(ids.size, KONTEXTE.length);
  assert.ok(Math.min(...ps[1]) > Math.max(...ps[5]), "Stufe 5 hat seltenere Merkmale");
});

test("Rückmeldung: typische Fehler werden erkannt", () => {
  const fall = (id, s, seed) => aufgabe(id, s, mitSeed(seed));
  // Verwechslung P_K(+) statt P_+(K)
  const a = fall("ppv", 3, 11);
  const r1 = pruefe(a, { ppv: dk(a.se, 1) });
  assert.equal(r1.ok, false); assert.match(r1.grund, /Trefferquote/);
  // nur P(K ∩ +), nicht durch P(+) geteilt
  const r2 = pruefe(a, { ppv: dk(a.p * a.se / 100, 3) });
  assert.equal(r2.ok, false); assert.match(r2.grund, /Teile noch durch/);
  // Spezifität statt Falsch-positiv-Quote im Nenner (eigener Fall, damit sich die Fehlerwerte unterscheiden)
  const e = { art: "ppv", k: "virus", p: 30, se: 90, sp: 80, ppv: 100 * bayes(0.3, 0.9, 0.8).ppv };
  const r3 = pruefe(e, { ppv: dk((100 * 0.27) / (0.27 + 0.7 * 0.8), 1) });
  assert.equal(r3.ok, false); assert.match(r3.grund, /falsche Ast/);
  assert.match(pruefe(e, { ppv: "30" }).grund, /Ausgangslage/);
  assert.match(pruefe(e, { ppv: dk(100 * bayes(0.3, 0.9, 0.8).pPos, 1) }).grund, /in den Nenner/);
  // Dezimalzahl statt Prozent
  const r4 = pruefe(a, { ppv: dk(a.ppv / 100, 3) });
  assert.equal(r4.ok, false); assert.match(r4.grund, /Prozent/);
  // Bruch als Eingabe ist richtig
  const h = fall("haeufigkeit", 1, 5);
  assert.equal(pruefe(h, { kp: String(h.h.kp), gp: String(h.h.gp), ppv: `${h.h.kp}/${h.h.pos}` }).ok, true);
  // Häufigkeiten: falsche Alarme aus allen statt nur aus den Gesunden
  const hf = pruefe(h, { kp: String(h.h.kp), gp: String(Math.round(h.N * (1 - h.sp / 100))), ppv: "1" });
  assert.equal(hf.felder.kp, true); assert.equal(hf.felder.gp, false); assert.match(hf.grund, /nur aus der Gruppe/);
  // Tafel: Zeile und Spalte vertauscht
  const t = fall("tafel", 2, 9);
  const rt = pruefe(t, { sens: dk(t.ppv, 1), ppv: dk(t.sens, 1) });
  assert.equal(rt.ok, false); assert.match(rt.grund, /Vertauscht/);
  // zweiter Test: Wert des ersten Tests noch einmal eingegeben
  const z = fall("zweiter", 2, 4);
  const rz = pruefe(z, { ppv1: dk(z.ppv1, 1), ppv2: dk(z.ppv1, 1) });
  assert.equal(rz.felder.ppv1, true); assert.equal(rz.felder.ppv2, false); assert.match(rz.grund, /ersten Test/);
  // negativ: P_K(−) statt P_−(K)
  const n = { art: "negativ", k: "virus", p: 20, se: 90, sp: 95, rest: 100 * bayes(0.2, 0.9, 0.95).rest, stellen: 2 };
  assert.equal(pruefe(n, { rest: dk(n.rest, 2) }).ok, true);
  const rn = pruefe(n, { rest: dk(100 - n.se, 2) });
  assert.equal(rn.ok, false); assert.match(rn.grund, /Übersehenen/);
});

test("Begründungen, Gliederung, Kolloquium", () => {
  assert.ok(BEGRUENDUNGEN.length >= 3);
  for (const b of BEGRUENDUNGEN) for (const [i, st] of b.schritte.entries()) {
    assert.ok(st.optionen.length >= 2 && st.richtig >= 0 && st.richtig < st.optionen.length);
    assert.deepEqual([...gemischt(st.optionen, i)].sort(), st.optionen.map((_, j) => j));
  }
  // Zahlen im Lückenbeweis „Basisrate“ stimmen: 0,00099 / (0,00099 + 0,00999) ≈ 9 %
  assert.equal(Math.round((100 * 0.00099) / (0.00099 + 0.00999)), 9);
  assert.ok(nahe(bayes(0.001, 0.99, 0.99).ppv, 0.00099 / (0.00099 + 0.00999), 1e-12));
  // Lückenbeweis „Zweiter Test“: 18² = 324
  assert.equal(Math.round((0.9 / 0.05) ** 2), 324);
  assert.equal(GLIEDERUNG.length, 5);
  assert.ok(GLIEDERUNG.reduce((s, g) => s + g.min, 0) >= 15 && TIPPS.length === 3);
  assert.ok(KOLLOQUIUM.length >= 6 && KOLLOQUIUM.every((q) => q.frage.endsWith("?") && q.antwort.length > 80 && ["Basis", "Vertiefung", "Profi"].includes(q.stufe)));
  // Die Zahlen in Kolloquium und Gliederung passen zur Rechnung
  const text = [...KOLLOQUIUM.map((q) => q.antwort), ...GLIEDERUNG.map((g) => g.text)].join(" ");
  assert.match(text, /26,9 %/); assert.match(text, /86,9 %/); assert.match(text, /18 \/ 67/);
  // generisches Maskulinum, keine Gendersprache
  assert.doesNotMatch(text + TIPPS.join(" "), /\*innen|:innen|Innen\b|_innen/);
});
