/* GFS · Wachstum und Differenzialgleichungen (gfsWachstum.js)
   Mathematik der Herleitung nachgerechnet (Lösungen erfüllen die DGL, Eindeutigkeitsargument,
   Abstand beim beschränkten Wachstum, Kehrwert-Trick beim logistischen Wachstum, Wendepunkt,
   Euler-Verfahren mit Fehlerverhalten, Messreihen), Zahlen der Animationen und der Herleitung,
   Generatoren über alle Arten × Stufen × viele Startwerte: Lösung gerundet und exakt richtig,
   typische Fehler fallen mit eigener Begründung durch, Folgefehler beim Euler-Verfahren erlaubt,
   Rechenweg endet beim Ergebnis, A5 in allen Zeilen. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  zufallszahlen, wuerfelAus, rund, dk, sig, dkSig, zT, zP, verhaeltnis,
  MODELLE, rate, loesung, eulerSchritt, euler, verdopplungszeit, wendezeit, maxRate,
  BSP_EXP, BAKTERIEN, TEE, INFUSION, GERUECHT, EULER_BSP, EULER_TABELLE, DATEN, ANIM, differenzen, quotienten,
  liesWert, trifft, TOLERANZ, RUNDUNG, MODELL_OPTIONEN,
  ARTEN, aufgabe, felder, auftrag, pruefe, rechenweg, tipp, gemischt, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "../src/gfsWachstum.js";

/* Dieselben Muster wie tests/a5.test.mjs – nichts bleibt unvereinfacht stehen */
const N = String.raw`\d+(?:[.,]\d+)?`;
const A5 = [
  new RegExp(String.raw`(?:^|=)\s*${N}\s*[+−\-]\s*${N}\s*$`), new RegExp(String.raw`(?:^|=)\s*${N}\s*(?:·|\\cdot|\*)\s*${N}\s*$`),
  /(^|[^\d.,\w])1\s*(?:·|\\cdot)?\s*x(?![\w])/, /\+\s*[−-]\s*\d/, /[−-]\s*[−-]\s*\d/, /(?:·|\\cdot)\s*1(?![\d,.\/^])/, /[+−-]\s*0(?![\d,.])\s*$/,
  /(?<!_\{[^}]*\}|_-?\d)\^\{?1\}?(?![\d,.])/,
];
const a5ok = (z) => A5.every((m) => !m.test(z));
/* zusätzlich: kein „1e“, kein „e^{0}“, kein „· 1 ·“, kein doppeltes „= =“, kein Bindestrich als Minus vor Zahlen, kein „+ (−…)“ ohne Grund */
const schreibweiseOk = (z) => !/(^|[^\d,])1e\^|e\^\{−?0\}|= =|(^|[\s(=])-\d|\{-|\\cdot\s*1\s*\\cdot/.test(z);
/* Zahl am Ende einer Rechenzeile (Dezimalkomma, Tausender mit \,) */
const endZahl = (z) => { const m = /(−?\d+(?:\\,\d{3})*(?:,\d+)?)\s*$/.exec(z); return m ? Number(m[1].replace(/\\,/g, "").replace("−", "-").replace(",", ".")) : null; };
const nah = (x, y, e = 1e-9) => Math.abs(x - y) <= e;
const relNah = (x, y, e = 1e-9) => Math.abs(x - y) <= e * Math.max(1, Math.abs(y));
/* Zahl so, wie ein Schüler sie eintippt */
const tippe = (w) => w.toFixed(10).replace(/0+$/, "").replace(/\.$/, "").replace(".", ",");
/* Ableitung numerisch (zentraler Differenzenquotient) */
const ableitung = (f, t, h = 1e-5) => (f(t + h) - f(t - h)) / (2 * h);

test("Zahlen und Eingaben: Komma, Minus, Gruppierung, exakte Terme", () => {
  assert.equal(dk(45.7515), "45,752"); assert.equal(dk(-0.0866, 4), "−0,0866"); assert.equal(dk(2, 3), "2");
  assert.equal(sig(0.0866434, 3), 0.0866); assert.equal(dkSig(-Math.LN2 / 8, 3), "−0,0866");
  assert.equal(zT(10000), "10\\,000"); assert.equal(zT(2500), "2500"); assert.equal(zT(-0.3), "−0,3"); assert.equal(zP(6250000), "6 250 000");
  assert.deepEqual([verhaeltnis(20, 70).tex, verhaeltnis(70, 20).tex, verhaeltnis(42, 70).tex, verhaeltnis(43.8, 73).tex], ["\\frac{2}{7}", "3,5", "0,6", "0,6"]);
  assert.ok(nah(liesWert("45,75"), 45.75)); assert.ok(nah(liesWert("20 + 70e^(−1)"), 20 + 70 * Math.exp(-1)));
  assert.ok(nah(liesWert("ln(3,5)/0,1"), 10 * Math.log(3.5))); assert.ok(nah(liesWert("-ln(2)/8"), -Math.LN2 / 8)); assert.ok(nah(liesWert("ln2/3"), Math.LN2 / 3));
  assert.ok(nah(liesWert("1000/(1+99e^(-2,5))"), 1000 / (1 + 99 * Math.exp(-2.5)))); assert.ok(nah(liesWert("10 000"), 10000));
  assert.ok(nah(liesWert("20-(-70)e^(-1)"), 20 + 70 * Math.exp(-1)));
  for (const falsch of ["", "t", "k+1", "e^(", "1,2,3", "ln(0)", "abc", "S"]) assert.equal(liesWert(falsch), null, falsch);
  assert.ok(trifft(45.75, 20 + 70 * Math.exp(-1)) && !trifft(45.7, 20 + 70 * Math.exp(-1)) && !trifft(null, 1));
  assert.ok(trifft(0.231, Math.LN2 / 3, "rate") && !trifft(0.22, Math.LN2 / 3, "rate"));
  assert.ok(trifft(110, 109.57, "anzahl") && !trifft(111, 109.57, "anzahl"));
  for (const t of ["wert", "zeit", "rate", "anzahl"]) assert.ok(/gerundet/.test(RUNDUNG[t]) && /exakt/.test(RUNDUNG[t]), t);
  assert.ok(/zwei Nachkommastellen/.test(RUNDUNG.euler));
});

test("Die drei Modelle: Lösungsformel erfüllt DGL und Anfangswert", () => {
  assert.deepEqual(MODELLE.map((m) => m.id), ["exp", "beschraenkt", "logistisch"]);
  const faelle = [
    ["exp", { k: 0.3, f0: 5 }], ["exp", { k: -0.2, f0: 400 }],
    ["beschraenkt", { k: 0.1, S: 20, f0: 90 }], ["beschraenkt", { k: 0.4, S: 50, f0: 0 }], ["beschraenkt", { k: 1.2, S: 8, f0: 3 }],
    ["logistisch", { k: 0.0005, S: 1000, f0: 10 }], ["logistisch", { k: 0.1, S: 10, f0: 7 }], ["logistisch", { k: 0.02, S: 6, f0: 9 }],
  ];
  for (const [m, p] of faelle) {
    assert.ok(nah(loesung(m, p, 0), p.f0, 1e-12), `${m} f(0)`);
    for (const t of [0.3, 1, 2.5, 6, 11]) {
      const f = (x) => loesung(m, p, x);
      assert.ok(relNah(ableitung(f, t), rate(m, p, f(t)), 1e-6), `${m} ${JSON.stringify(p)} t = ${t}: ${ableitung(f, t)} ≠ ${rate(m, p, f(t))}`);
    }
  }
  // Schritt 2: Eindeutigkeit – h(t) = f(t) · e^(−kt) ist für jede Lösung konstant
  for (const t of [0, 1, 4]) assert.ok(nah(loesung("exp", { k: 0.4, f0: 3 }, t) * Math.exp(-0.4 * t), 3, 1e-12));
  // Schritt 3: der Abstand zur Schranke nimmt exponentiell ab, d(t) = d(0) · e^(−kt)
  for (const t of [0, 3, 7]) assert.ok(nah(TEE.S - loesung("beschraenkt", TEE, t), (TEE.S - TEE.f0) * Math.exp(-TEE.k * t), 1e-12));
  // Schritt 4: Kehrwert-Trick – g = 1/f erfüllt g′ = kS · (1/S − g)
  const L = { k: 0.0005, S: 1000, f0: 10 };
  for (const t of [1, 5, 9.19, 15]) {
    const g = (x) => 1 / loesung("logistisch", L, x);
    assert.ok(relNah(ableitung(g, t), L.k * L.S * (1 / L.S - g(t)), 1e-6), `g′ bei t = ${t}`);
    assert.ok(nah(g(t), loesung("beschraenkt", { k: L.k * L.S, S: 1 / L.S, f0: 1 / L.f0 }, t), 1e-12));
  }
  // Wendepunkt: f(t_W) = S/2, dort die größte Rate kS²/4, f″ wechselt das Vorzeichen
  for (const p of [L, ANIM.logistisch, { k: 0.002, S: 500, f0: 20 }]) {
    const tw = wendezeit(p), f = (x) => loesung("logistisch", p, x);
    assert.ok(nah(f(tw), p.S / 2, 1e-9));
    assert.ok(relNah(rate("logistisch", p, f(tw)), maxRate(p), 1e-12));
    const f2 = (x) => ableitung((y) => ableitung(f, y), x, 1e-3);
    assert.ok(f2(tw - 0.5) > 0 && f2(tw + 0.5) < 0, "Linkskurve vor, Rechtskurve nach t_W");
    let max = 0; for (let x = 0; x <= 3 * tw; x += tw / 400) max = Math.max(max, ableitung(f, x));
    assert.ok(max <= maxRate(p) * (1 + 1e-6) && max > maxRate(p) * 0.999);
  }
  assert.ok(nah(verdopplungszeit(Math.LN2 / 3), 3, 1e-12)); assert.ok(nah(verdopplungszeit(-0.2), Math.LN2 / 0.2, 1e-12));
});

test("Euler: Schritt, geschlossene Formeln, über- bzw. unterschätzt, Fehler etwa proportional zu Δt", () => {
  assert.equal(eulerSchritt("exp", { k: 0.1 }, 100, 1), 110);
  // beschränkt: f_n = S − (S − f0)(1 − kΔt)^n, exponentiell: f_n = f0 (1 + kΔt)^n
  const B = { k: 0.5, S: 10, f0: 2 };
  euler("beschraenkt", B, 0.5, 6).forEach((w, n) => assert.ok(nah(w, 10 - 8 * 0.75 ** n, 1e-12)));
  euler("exp", { k: 0.25, f0: 200 }, 1, 4).forEach((w, n) => assert.ok(nah(w, 200 * 1.25 ** n, 1e-9)));
  // 1 − x ≤ e^(−x): beschränkt von unten → Euler zu groß; 1 + x ≤ e^x: exponentielles Wachstum → Euler zu klein
  for (const dt of [1, 0.5, 0.1]) {
    const n = Math.round(4 / dt);
    assert.ok(euler("beschraenkt", B, dt, n)[n] > loesung("beschraenkt", B, 4));
    assert.ok(euler("exp", { k: 0.3, f0: 2 }, dt, n)[n] < loesung("exp", { k: 0.3, f0: 2 }, 4));
  }
  // Konvergenz für alle Modelle: (1 + kt/n)^n → e^(kt) usw.
  for (const [m, p] of [["exp", { k: 0.3, f0: 2 }], ["beschraenkt", B], ["logistisch", { k: 0.1, S: 10, f0: 0.5 }]]) {
    const fehler = [0.1, 0.01, 0.001].map((dt) => { const n = Math.round(2 / dt); return Math.abs(euler(m, p, dt, n)[n] - loesung(m, p, 2)); });
    assert.ok(fehler[2] < fehler[1] && fehler[1] < fehler[0] && fehler[2] < 0.005, `${m}: ${fehler}`);
    assert.ok(fehler[1] / fehler[0] > 0.07 && fehler[1] / fehler[0] < 0.13, `${m}: Fehler ~ Δt (${fehler[1] / fehler[0]})`);
  }
});

test("Zahlen der Herleitung (Schritte 1–6)", () => {
  // Schritt 1: 3e^(0,5t) löst f′ = 0,5 · f, t² + 3 nicht
  const f = (t) => BSP_EXP.f0 * Math.exp(BSP_EXP.k * t);
  for (const t of [0, 1, 3]) assert.ok(relNah(ableitung(f, t), 1.5 * Math.exp(0.5 * t), 1e-7));
  assert.ok(Math.abs(2 * 0 - 0.5 * (0 ** 2 + 3)) > 1, "t² + 3: bei t = 0 ist 0 ≠ 1,5");
  // Schritt 2: Verdopplung alle 3 h → k = ln 2/3 ≈ 0,231
  assert.equal(dk(Math.LN2 / BAKTERIEN.verdopplung, 3), "0,231");
  // Schritt 3: Tee nach 10 min 45,75 °C, 40 °C nach 12,53 min, Abstand halbiert sich alle 6,93 min; Infusion S = 30, f(5) ≈ 18,96
  assert.equal(dk(loesung("beschraenkt", TEE, TEE.t), 2), "45,75");
  const t40 = Math.log((TEE.S - TEE.f0) / (TEE.S - TEE.ziel)) / TEE.k;
  assert.ok(nah(loesung("beschraenkt", TEE, t40), 40, 1e-9)); assert.equal(dk(t40, 2), "12,53"); assert.ok(nah(t40, 10 * Math.log(3.5), 1e-12));
  assert.equal(dk(10 * Math.LN2, 2), "6,93");
  const S = INFUSION.zufuhr / INFUSION.abbau;
  assert.ok(nah(S, 30, 1e-12));
  assert.equal(dk(loesung("beschraenkt", { k: INFUSION.abbau, S, f0: INFUSION.f0 }, INFUSION.t), 2), "18,96");
  // Schritt 4: Gerücht – kS = 0,5, t_W = 2 ln 99 ≈ 9,19 Tage, größte Rate 125 pro Tag
  assert.ok(nah(GERUECHT.k * GERUECHT.S, 0.5, 1e-12));
  assert.equal(dk(wendezeit(GERUECHT), 2), "9,19"); assert.ok(nah(wendezeit(GERUECHT), 2 * Math.log(99), 1e-12));
  assert.ok(nah(maxRate(GERUECHT), 125, 1e-9));
  // Schritt 5: Euler mit Δt = 0,5 – 4; 5,5; 6,625; 7,46875 – Tabelle bis Δt = 0,01, exakt 7,06
  assert.deepEqual(euler("beschraenkt", EULER_BSP, 0.5, 4).map((x) => rund(x, 6)), [2, 4, 5.5, 6.625, 7.46875]);
  assert.equal(dk(loesung("beschraenkt", EULER_BSP, 2), 2), "7,06");
  assert.deepEqual(EULER_TABELLE.map((z) => dk(z.wert, 2)), ["8", "7,47", "7,25", "7,13", "7,06"]);
  assert.deepEqual(EULER_TABELLE.map((z) => dk(z.fehler, 3)), ["0,943", "0,412", "0,194", "0,075", "0,007"]);
  assert.ok(EULER_TABELLE.every((z, i) => z.fehler > 0 && (i === 0 || z.fehler < EULER_TABELLE[i - 1].fehler)));
  // Schritt 6: Messreihen
  const [lin, ex, be, lo] = DATEN;
  assert.ok(new Set(differenzen(lin.f)).size === 1);
  assert.ok(quotienten(ex.f).every((q) => nah(q, 1.5, 1e-12)));
  assert.deepEqual(differenzen(be.f), [40, 20, 10, 5]);
  be.f.forEach((v, t) => assert.ok(nah(v, 100 - 80 * 0.5 ** t, 1e-12)));
  lo.f.forEach((v, t) => assert.ok(nah(v, 100 / (1 + 9 * 3 ** -t), 1e-9)));
  assert.deepEqual(differenzen(lo.f), [15, 25, 25, 15]);
  // logistische Messreihe ist eine Lösung: 3^(−t) = e^(−kSt) mit kS = ln 3
  lo.f.forEach((v, t) => assert.ok(nah(v, loesung("logistisch", { k: Math.log(3) / 100, S: 100, f0: 10 }, t), 1e-9)));
});

test("Zahlen der Animationen", () => {
  // feld: f′ = 0,5 · (8 − f) – Steigung 3 bei y = 2, 0 bei y = 8, alle Startwerte nähern sich 8
  assert.equal(rate("beschraenkt", ANIM.feld, 2), 3); assert.equal(rate("beschraenkt", ANIM.feld, 8), 0); assert.equal(rate("beschraenkt", ANIM.feld, 11), -1.5);
  for (const f0 of ANIM.feld.starts) assert.ok(Math.abs(loesung("beschraenkt", { ...ANIM.feld, f0 }, 12) - 8) < 0.03);
  // exp: Verdopplungszeit 2, Steigungen 0,35; 0,69; 1,39 bei f = 1, 2, 4
  assert.ok(nah(verdopplungszeit(ANIM.exp.k), 2, 1e-12));
  assert.deepEqual([1, 2, 4].map((f) => dk(ANIM.exp.k * f, 2)), ["0,35", "0,69", "1,39"]);
  assert.ok(nah(loesung("exp", ANIM.exp, 6), 8, 1e-9));
  // tee: Abstände 70; 35; 17,5; 8,75 nach je 6,93 min; Steigung −7 am Anfang, −1,75 nach 13,9 min
  const th = 10 * Math.LN2;
  assert.deepEqual([0, 1, 2, 3].map((i) => rund(loesung("beschraenkt", ANIM.tee, i * th) - 20, 6)), [70, 35, 17.5, 8.75]);
  assert.equal(rate("beschraenkt", ANIM.tee, 90), -7); assert.ok(nah(rate("beschraenkt", ANIM.tee, loesung("beschraenkt", ANIM.tee, 2 * th)), -1.75, 1e-9));
  assert.equal(dk(2 * th, 1), "13,9");
  // logistisch: kS = 1, t_W = ln 99 ≈ 4,6, größte Rate 2,5 bei f = 5
  assert.ok(nah(ANIM.logistisch.k * ANIM.logistisch.S, 1, 1e-12));
  assert.equal(dk(wendezeit(ANIM.logistisch), 1), "4,6"); assert.ok(nah(maxRate(ANIM.logistisch), 2.5, 1e-12));
  // euler: Steigung 4 am Start, f(1) ≈ 6, f(2) ≈ 8; bei t = 2: 8; 7,47; 7,25 – exakt 7,06
  assert.equal(rate("beschraenkt", ANIM.euler, 2), 4);
  assert.deepEqual(euler("beschraenkt", ANIM.euler, 1, 2), [2, 6, 8]);
  assert.deepEqual(ANIM.euler.dts.map((dt) => { const n = Math.round(2 / dt); return dk(euler("beschraenkt", ANIM.euler, dt, n)[n], 2); }), ["8", "7,47", "7,25"]);
});

/* Antworten, die ein Schüler typischerweise falsch gibt */
function typischFalsch(a) {
  const aus = [];
  for (const [k, , typ] of a.felder) for (const [w] of a.fallen[k] || []) if (Number.isFinite(w)) aus.push({ k, typ, wert: w, ein: { ...a.exakt, [k]: tippe(w) } });
  return aus;
}

test("Generatoren: alle Arten × Stufen × Startwerte – lösbar, exakt, Fallen, Rechenweg, A5", () => {
  const gesehen = new Set();
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) for (let seed = 1; seed <= 250; seed++) {
    const a = aufgabe(id, s, wuerfelAus(zufallszahlen(seed * 31 + s)));
    const wo = `${id} Stufe ${s} Startwert ${seed} (${a.kontext})`;
    gesehen.add(`${id}/${s}/${a.kontext}`);
    assert.equal(a.art, id, wo); assert.equal(a.stufe, s, wo);
    assert.ok(auftrag(a).length > 40 && !/NaN|undefined|Infinity/.test(auftrag(a)), `${wo}: ${auftrag(a)}`);
    assert.ok(!/ 1 (Stunden|Tagen|Minuten|Jahren|Wochen|Monaten)\b/.test(auftrag(a)), `${wo}: Einzahl`);
    assert.equal((auftrag(a).match(/\$/g) || []).length % 2, 0, `${wo}: $ paarweise`);
    assert.ok(tipp(a).length > 30, wo);
    if (a.mc) {
      assert.equal(pruefe(a, a.richtig).ok, true, wo);
      assert.deepEqual([...a.reihenfolge].sort(), a.optionen.map((_, i) => i));
      assert.equal(new Set(a.optionen).size, a.optionen.length, `${wo}: Optionen verschieden`);
      a.optionen.forEach((_, i) => {
        if (i === a.richtig) return;
        const e = pruefe(a, i);
        assert.equal(e.ok, false); assert.ok(e.grund.length > 30 && !/NaN|undefined/.test(e.grund), `${wo}: Option ${i}`);
      });
      for (const z of a.weg) assert.ok(a5ok(z.replace(/\$/g, "")) && !/NaN|undefined/.test(z), `${wo}: ${z}`);
      if (a.kontext === "modell") {
        assert.equal(a.tabelle.f.length, 5);
        const d = differenzen(a.tabelle.f), q = quotienten(a.tabelle.f);
        const gleich = (xs) => xs.every((x) => Math.abs(x - xs[0]) < 1e-9);
        if (a.modell === "linear") assert.ok(gleich(d), wo);
        if (a.modell === "exp") assert.ok(gleich(q) && !gleich(d), wo);
        if (a.modell === "beschraenkt") assert.ok(gleich(d.slice(1).map((x, i) => x / d[i])) && !gleich(q) && !gleich(d), wo);
        if (a.modell === "logistisch") assert.ok(d[1] > d[0] && d[3] < d[2] && !gleich(q), wo);
      }
      continue;
    }
    assert.ok(felder(a).length >= 1 && felder(a).length <= 4, wo);
    for (const [k, label, typ] of felder(a)) {
      const soll = a.soll[k];
      assert.ok(Number.isFinite(soll), `${wo}: ${k} = ${soll}`);
      assert.ok(TOLERANZ[typ] && label, wo);
      assert.ok(relNah(liesWert(a.exakt[k]), soll, 1e-8), `${wo}: exakt ${a.exakt[k]} = ${liesWert(a.exakt[k])} statt ${soll}`);
      if (typ === "zeit") assert.ok(soll > 0, `${wo}: Zeit ${soll}`);
    }
    assert.equal(pruefe(a, a.loesung).ok, true, `${wo}: gerundet ${JSON.stringify(a.loesung)}`);
    assert.equal(pruefe(a, a.exakt).ok, true, `${wo}: exakt ${JSON.stringify(a.exakt)}`);
    const leer = pruefe(a, {});
    assert.equal(leer.ok, false); assert.ok(leer.grund.length > 10);
    // typische Fehler: eigene Begründung (nicht nur der Tipp), wenn die Falle nicht zufällig richtig ist
    for (const f of typischFalsch(a)) {
      if (trifft(f.wert, a.soll[f.k], f.typ)) continue;
      const e = pruefe(a, f.ein);
      assert.equal(e.ok, false, `${wo}: ${JSON.stringify(f.ein)}`);
      const erwartet = a.fallen[f.k].find(([w]) => Number.isFinite(w) && Math.abs(liesWert(tippe(f.wert)) - w) <= TOLERANZ[f.typ](w))[1];
      assert.equal(e.grund, erwartet, `${wo}: Falle ${f.k} = ${f.wert}`);
      assert.ok(e.grund.length > 25 && !/NaN|undefined|Infinity/.test(e.grund), wo);
    }
    // Rechenweg: A5, Schreibweise, endet beim letzten Feld, enthält jedes Ergebnis
    const weg = rechenweg(a);
    assert.ok(weg.length >= 2, wo);
    for (const z of weg) {
      assert.ok(a5ok(z), `${wo}: A5 „${z}“`);
      assert.ok(schreibweiseOk(z), `${wo}: Schreibweise „${z}“`);
      assert.ok(!/NaN|undefined|Infinity/.test(z), `${wo}: ${z}`);
    }
    const letztes = felder(a).at(-1)[0];
    assert.equal(endZahl(weg.at(-1)), Number(a.loesung[letztes].replace("−", "-").replace(",", ".")), `${wo}: Rechenweg endet bei „${weg.at(-1)}“ statt ${a.loesung[letztes]}`);
    const alles = weg.join(" ").replace(/\\,/g, "");
    for (const [k] of felder(a)) assert.ok(new RegExp(`(^|[^\\d,])${a.loesung[k].replace("−", "−?")}(?![\\d])`).test(alles.replace(/−/g, "−")), `${wo}: ${k} = ${a.loesung[k]} fehlt im Rechenweg`);
    // gerundete Eingabe eine Stelle zu grob fällt durch und bekommt einen Hinweis
    const [k0, , typ0] = felder(a)[0];
    if (typ0 === "wert" || typ0 === "zeit") {
      const grob = rund(a.soll[k0], 0);
      if (!trifft(grob, a.soll[k0], typ0)) { const e = pruefe(a, { ...a.exakt, [k0]: tippe(grob) }); assert.equal(e.ok, false); assert.ok(e.grund.length > 20); }
    }
    // Euler: mit dem auf zwei Stellen gerundeten Vorwert weiterrechnen ist erlaubt (Folgefehler)
    if (id === "euler") {
      const { m, p, dt } = a.schritt;
      const ein = {}; let vor = p.f0;
      for (const [k, , typ] of felder(a)) {
        if (typ !== "euler") { ein[k] = a.exakt[k]; continue; }
        const v = rund(eulerSchritt(m, p, vor, dt), 2); ein[k] = tippe(v); vor = v;
      }
      assert.equal(pruefe(a, ein).ok, true, `${wo}: Folgefehler ${JSON.stringify(ein)}`);
      // ein falscher erster Wert macht den zweiten nicht richtig
      const falsch = { ...a.exakt, f1: tippe(a.soll.f1 + 3) };
      const e = pruefe(a, falsch);
      assert.equal(e.ok, false); assert.equal(e.felder.f1, false);
      assert.ok(a.soll.f1 > 0 && a.felder.filter(([, , t]) => t === "euler").length >= 2, wo);
    }
  }
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) assert.ok([...gesehen].some((g) => g.startsWith(`${id}/${s}/`)), `${id}/${s}`);
  assert.ok(new Set([...gesehen].map((g) => g.split("/")[2])).size >= 15, `Kontexte: ${new Set([...gesehen].map((g) => g.split("/")[2])).size}`);
  // Auswahl: Stufe 1 und 3 der Art „DGL und Lösung“, alle vier Modelle kommen als Messreihe vor
  const modelle = new Set();
  for (let seed = 1; seed <= 200; seed++) {
    const a = aufgabe("dgl", 3, wuerfelAus(zufallszahlen(seed)));
    modelle.add(a.modell);
    assert.equal(a.optionen[a.richtig], MODELL_OPTIONEN.find(([x]) => x === a.modell)[1]);
  }
  assert.equal(modelle.size, 4);
});

test("Generatoren: Lösungen stimmen mit den Modellformeln überein", () => {
  for (let seed = 1; seed <= 150; seed++) {
    const z = () => wuerfelAus(zufallszahlen(seed * 7 + 3));
    const b1 = aufgabe("bestand", 1, z());
    assert.ok(relNah(b1.soll.f, loesung("exp", { k: b1.k, f0: b1.f0 }, b1.t), 1e-12));
    const b2 = aufgabe("bestand", 2, z());
    assert.ok(relNah(loesung("exp", { k: b2.k, f0: b2.f0 }, b2.soll.t), b2.B, 1e-9));
    const b3 = aufgabe("bestand", 3, z());
    assert.ok(relNah(b3.soll.f, loesung("beschraenkt", b3, b3.t1), 1e-12) && relNah(loesung("beschraenkt", b3, b3.soll.t), b3.B, 1e-9));
    const b4 = aufgabe("bestand", 4, z());
    assert.ok(relNah(b4.soll.f, loesung("logistisch", b4, b4.t), 1e-12) && relNah(loesung("logistisch", b4, b4.soll.tw), b4.S / 2, 1e-9));
    const b5 = aufgabe("bestand", 5, z());
    if (b5.anteil) assert.ok(relNah(loesung("logistisch", b5, b5.soll.t), b5.anteil * b5.S, 1e-9) && relNah(b5.soll.r, maxRate(b5), 1e-12));
    else assert.ok(relNah(rate("beschraenkt", b5, loesung("beschraenkt", b5, b5.soll.t)), -b5.r, 1e-9) && relNah(loesung("beschraenkt", b5, b5.soll.t), b5.soll.T, 1e-9));
    const p3 = aufgabe("parameter", 3, z());
    assert.ok(relNah(loesung("beschraenkt", { k: p3.soll.k, S: p3.soll.S, f0: p3.f0 }, p3.t1), p3.f1, 1e-9));
    const p5 = aufgabe("parameter", 5, z());
    if (p5.a1 !== undefined) assert.ok(relNah(rate("beschraenkt", p5.soll, p5.a1), p5.r1, 1e-9) && relNah(rate("beschraenkt", p5.soll, p5.a2), p5.r2, 1e-9));
    else assert.ok(relNah(maxRate(p5.soll), p5.r, 1e-9) && nah(p5.soll.S / 2, p5.W, 1e-9));
    const d2 = aufgabe("dgl", 2, z());
    const fd = (t) => d2.soll.S - (d2.unten ? 1 : -1) * d2.c * Math.exp(-d2.soll.k * t);
    for (const t of [0.5, 2]) assert.ok(relNah(ableitung(fd, t), rate("beschraenkt", d2.soll, fd(t)), 1e-6));
    const d4 = aufgabe("dgl", 4, z());
    const fl = (t) => d4.soll.S / (1 + d4.b * Math.exp(-d4.c * t));
    for (const t of [0.5, 3]) assert.ok(relNah(ableitung(fl, t), rate("logistisch", d4.soll, fl(t)), 1e-6));
    const d5 = aufgabe("dgl", 5, z());
    assert.ok(nah(d5.p - d5.q * 7, rate("beschraenkt", { k: d5.soll.k, S: d5.soll.S }, 7), 1e-9) && nah(d5.soll.S - d5.soll.a, d5.f0, 1e-9));
    const e5 = aufgabe("euler", 5, z());
    assert.ok(relNah(e5.soll.ex, loesung("logistisch", e5.p, 3 * e5.dt), 1e-12));
  }
});

test("Mischen, Gliederung, Tipps, Kolloquium", () => {
  for (let salz = 0; salz < 12; salz++) assert.deepEqual([...gemischt([1, 2, 3, 4], salz)].sort(), [0, 1, 2, 3]);
  assert.equal(GLIEDERUNG.length, 5);
  const summe = GLIEDERUNG.reduce((s, g) => s + g.min, 0);
  assert.ok(summe >= 15 && summe <= 18, `Summe ${summe}`);
  assert.equal(TIPPS.length, 3);
  assert.ok(KOLLOQUIUM.length >= 10 && KOLLOQUIUM.length <= 12);
  assert.ok(KOLLOQUIUM.every((q) => q.frage.endsWith("?") && q.antwort.length > 120 && ["Basis", "Vertiefung", "Profi"].includes(q.stufe)));
  const stufen = KOLLOQUIUM.map((q) => ["Basis", "Vertiefung", "Profi"].indexOf(q.stufe));
  assert.ok(stufen.every((s, i) => i === 0 || s >= stufen[i - 1]), "Basis → Profi");
  for (const st of ["Basis", "Vertiefung", "Profi"]) assert.ok(KOLLOQUIUM.some((q) => q.stufe === st), st);
  for (const t of [...GLIEDERUNG.map((g) => g.text), ...TIPPS, ...KOLLOQUIUM.map((q) => q.antwort)]) {
    assert.ok(a5ok(t), t);
    assert.ok(!/Abi-relevant|\*innen|SchülerInnen|:innen/.test(t), t);
  }
  // Zahlen im Kolloquium: 15e^(−0,3t) = 0,3 · 50e^(−0,3t); ln 2 : 3 ≈ 0,231; Euler 8 und 7,25, exakt 7,06
  assert.equal(0.3 * 50, 15);
  assert.equal(dk(Math.LN2 / 3, 3), "0,231");
});

test("Seite: Exporte, Animationen, Labor, MatheFeld statt input, TeX in Attributen nur als {\"…\"}", () => {
  const q = readFileSync(new URL("../src/funcGfsWachstum.jsx", import.meta.url), "utf8");
  assert.match(q, /export function GfsWachstumSeite\(\{ gehe \}\)/);
  assert.match(q, /export function WachstumBild\(/);
  assert.match(q, /viewBox="0 0 160 120"/);
  const anims = [...q.matchAll(/<WachstumAnimation art="([a-z-]+)"/g)].map((m) => m[1]);
  assert.ok(new Set(anims).size >= 3 && new Set(anims).size <= 5, `Animationen: ${anims}`);
  for (const a of anims) assert.match(q, new RegExp(`\\n  "?${a}"?: \\{ titel:`), `Szene ${a} fehlt`);
  assert.doesNotMatch(q, /\s[a-zA-Z]+="[^"{}]*\\\\[a-zA-Z{]/);
  assert.doesNotMatch(q, /<input(?![^>]*type="range")/, "Eingaben nur über MatheFeld");
  assert.match(q, /<MatheFeld /);
  for (const b of ["Formeln", "Schritt", "Kasten", "Chip", "RoterFaden", "Kolloquium", "Inline"]) assert.match(q, new RegExp(`\\b${b}\\b`));
  assert.match(q, /from "\.\/funcGfsBausteine\.jsx"/);
  assert.match(q, /AnimKarte/);
  assert.match(q, /window\.__gwAufgabe/);
  assert.match(q, /data-wachstum-labor/);
  // Schritttexte der Animationen: kurz (ein bis zwei Sätze)
  const texte = [...q.matchAll(/\{ von: [\d.]+, text: "([^"]+)" \}/g)].map((m) => m[1]);
  assert.ok(texte.length >= 12);
  for (const t of texte) assert.ok(t.length <= 190 && (t.match(/[.!?](\s|$)/g) || []).length <= 2, `Schritttext (${t.length}): ${t}`);
  // Anzahl der Animationen im Kurs-Eintrag und im Themenkopf
  const kurs = readFileSync(new URL("../src/gfsKurs.js", import.meta.url), "utf8");
  const n = new Set(anims).size;
  assert.match(kurs, new RegExp(`ansicht: "gfs-wachstum", videos: 0, animationen: ${n} \\}`));
  const f10 = readFileSync(new URL("../src/func10.jsx", import.meta.url), "utf8");
  assert.match(f10, new RegExp(`"${n} Animationen"\\]\\} Bild=\\{WachstumBild\\}`));
  assert.match(f10, /lazyLaden\(\(\) => import\("\.\/funcGfsWachstum\.jsx"\)/);
  assert.doesNotMatch(f10, /import \{[^}]*GfsWachstumSeite[^}]*\} from/);
});
