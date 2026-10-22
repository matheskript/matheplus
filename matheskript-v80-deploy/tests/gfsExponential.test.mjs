/* GFS · Die Exponentialverteilung (gfsExponential.js)
   Mathematik der Herleitung numerisch nachgerechnet (Grenzwert der geometrischen Verteilung, Fläche 1,
   Erwartungswert über die Stammfunktion, Median, Gedächtnislosigkeit), Simulation gegen die Dichte,
   Generatoren über alle Arten × Stufen × viele Startwerte: Lösung gerundet und exakt richtig,
   typische Fehler fallen mit Begründung durch, Rechenweg endet beim Ergebnis, A5 in allen Zeilen. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  zufallszahlen, wuerfelAus, rund, dk, sig, dkSig,
  dichte, vert, ueber, intervall, erwartung, median, quantil, bedingt, grenzFolge, treppe,
  ziehe, simuliere, histogramm, restzeiten, mittel, TREPPE_L, TREPPE_WERTE, GRENZ_TABELLE, KERNE, uebrigNach,
  liesWert, trifft, TOLERANZ, RUNDUNG,
  ARTEN, aufgabe, felder, auftrag, pruefe, rechenweg, tipp, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "../src/gfsExponential.js";

/* Dieselben Muster wie tests/a5.test.mjs – nichts bleibt unvereinfacht stehen */
const N = String.raw`\d+(?:[.,]\d+)?`;
const A5 = [
  new RegExp(String.raw`(?:^|=)\s*${N}\s*[+−\-]\s*${N}\s*$`), new RegExp(String.raw`(?:^|=)\s*${N}\s*(?:·|\\cdot|\*)\s*${N}\s*$`),
  /(^|[^\d.,\w])1\s*(?:·|\\cdot)?\s*x(?![\w])/, /\+\s*[−-]\s*\d/, /[−-]\s*[−-]\s*\d/, /(?:·|\\cdot)\s*1(?![\d,.\/^])/, /[+−-]\s*0(?![\d,.])\s*$/,
  /(?<!_\{[^}]*\}|_-?\d)\^\{?1\}?(?![\d,.])/,   // Hochzahl 1 – aber nicht 1,5
];
const a5ok = (z) => A5.every((m) => !m.test(z));
/* zusätzlich: kein „1λ“, kein „· 1“ vor λ, kein doppeltes „= =“, kein Bindestrich als Minus in Formeln */
const schreibweiseOk = (z) => !/(^|[^\d,])1λ|\\cdot\s*λ\s*\\cdot|= =|\^\{-|e\^\{−0\}/.test(z);
/* Zahl am Ende einer Rechenzeile (Dezimalkomma) */
const endZahl = (z) => { const m = /(−?\d+(?:,\d+)?)\s*$/.exec(z); return m ? Number(m[1].replace("−", "-").replace(",", ".")) : null; };
const nah = (x, y, e = 1e-9) => Math.abs(x - y) <= e;
/* Zahl so, wie ein Schüler sie eintippt (nie „1e-20“) */
const tipp_ = (w) => w.toFixed(12).replace(/0+$/, "").replace(/\.$/, "").replace(".", ",");

/* Integral mit Simpson-Regel (für die Nachrechnung der Herleitung) */
function simpson(f, a, b, n = 2000) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

test("Zahlen und Eingaben: Komma, Minus, exakte Terme, Prozent", () => {
  assert.equal(dk(0.36787944), "0,368"); assert.equal(dk(-1.5, 2), "−1,5"); assert.equal(dk(2, 3), "2");
  assert.equal(rund(0.0005, 3), 0.001); assert.equal(sig(0.000527046, 3), 0.000527); assert.equal(dkSig(0.0035667, 3), "0,00357");
  assert.ok(nah(liesWert("0,368"), 0.368)); assert.ok(nah(liesWert(" 36,8 % "), 0.368));
  assert.ok(nah(liesWert("e^(−1)"), Math.exp(-1))); assert.ok(nah(liesWert("e^-1"), Math.exp(-1)));
  assert.ok(nah(liesWert("1 − e^(−1,5)"), 1 - Math.exp(-1.5)));
  assert.ok(nah(liesWert("ln(2)/0,25"), 4 * Math.LN2)); assert.ok(nah(liesWert("4·ln(2)"), 4 * Math.LN2)); assert.ok(nah(liesWert("4ln2"), 4 * Math.LN2));
  assert.ok(nah(liesWert("-ln(0,7)/100"), -Math.log(0.7) / 100)); assert.ok(nah(liesWert("2^(-1,5)"), 2 ** -1.5)); assert.ok(nah(liesWert("1/e"), Math.exp(-1)));
  for (const falsch of ["", "x", "t+1", "λ", "e^(", "1,2,3", "ln(0)", "abc"]) assert.equal(liesWert(falsch), null, falsch);
  assert.ok(trifft(0.368, Math.exp(-1)) && trifft(0.3675, Math.exp(-1)) && !trifft(0.37, Math.exp(-1)) && !trifft(null, 0.5));
  assert.ok(trifft(2.77, 4 * Math.LN2, "zeit") && !trifft(2.8, 4 * Math.LN2, "zeit"));
  assert.ok(trifft(1386.3, 1000 * Math.log(4), "zeit") && trifft(1386, 1000 * Math.log(4), "zeit"), "große Zeiten auf 0,1 % genau");
  assert.ok(trifft(0.00357, -Math.log(0.7) / 100, "rate") && !trifft(0.0035, -Math.log(0.7) / 100, "rate") && !trifft(0.004, -Math.log(0.7) / 100, "rate"));
  assert.ok(TOLERANZ.p(0.5) < 0.001);
  for (const t of Object.values(RUNDUNG)) assert.ok(/gerundet/.test(t) && /exakt/.test(t));
});

test("Herleitung Schritt 1: geometrische Verteilung → e^(−λt) (Tabelle, Treppe, Grenzwert)", () => {
  // (1 − λt/n)^n wächst monoton gegen e^(−λt)
  for (const [l, t] of [[0.5, 2], [0.2, 3], [1, 1], [0.01, 150]]) {
    let alt = 0;
    for (const n of [2, 4, 8, 16, 100, 1000, 100000]) {
      const w = grenzFolge(l, t, n);
      assert.ok(w > alt && w < Math.exp(-l * t), `λ = ${l}, t = ${t}, n = ${n}`);
      alt = w;
    }
    assert.ok(nah(grenzFolge(l, t, 1e7), Math.exp(-l * t), 1e-7));
  }
  // Treppe = geometrische Verteilung P(N > k) = (1 − p)^k mit p = λΔt, k = t/Δt
  assert.equal(TREPPE_L, 0.5);
  for (const w of TREPPE_WERTE) {
    assert.ok(nah(w.p, TREPPE_L * w.dt) && w.n === Math.round(2 / w.dt));
    assert.ok(nah(w.wert, (1 - w.p) ** w.n));
    assert.ok(nah(treppe(TREPPE_L, w.dt, 2), w.wert));
  }
  assert.deepEqual(TREPPE_WERTE.map((w) => dk(w.wert, 3)), ["0,25", "0,316", "0,344", "0,363"]);
  assert.deepEqual(GRENZ_TABELLE.map((g) => g.n), [2, 4, 8, 40, 1000]);
  assert.equal(dk(GRENZ_TABELLE.at(-1).wert, 3), "0,368");
  assert.equal(dk(Math.exp(-1), 4), "0,3679");
  // Treppe ist rechtsseitig stetig und fällt nur an den Vielfachen von Δt
  assert.equal(treppe(0.5, 0.5, 0.49), 1); assert.equal(treppe(0.5, 0.5, 0.5), 0.75);
  // Grenzwert über ln: n · ln(1 − x/n) → −x
  for (const x of [0.5, 1, 3]) assert.ok(nah(1e6 * Math.log(1 - x / 1e6), -x, 1e-5));
});

test("Herleitung Schritt 2: F, f = F′, Fläche 1, Wahrscheinlichkeit als Fläche", () => {
  for (const l of [0.25, 0.5, 1, 2, 0.002]) {
    const T = 40 / l;
    assert.ok(nah(simpson((t) => dichte(l, t), 0, T), 1, 1e-6), `Fläche 1 bei λ = ${l}`);
    for (const t of [0.3 / l, 1 / l, 2.5 / l]) {
      const h = 1e-6 / l;
      assert.ok(nah((vert(l, t + h) - vert(l, t - h)) / (2 * h), dichte(l, t), 1e-6 * l), "f = F′");
      assert.ok(nah(vert(l, t) + ueber(l, t), 1));
      assert.ok(nah(simpson((x) => dichte(l, x), 0, t), vert(l, t), 1e-9));
    }
    const a = 0.5 / l, b = 2 / l;
    assert.ok(nah(intervall(l, a, b), vert(l, b) - vert(l, a)));
    assert.ok(nah(intervall(l, a, b), simpson((x) => dichte(l, x), a, b), 1e-9));
  }
  assert.equal(dichte(2, 0), 2, "f kann größer als 1 sein");
  assert.equal(vert(1, -1), 0); assert.equal(dichte(1, -1), 0); assert.equal(ueber(1, -2), 1);
});

test("Herleitung Schritt 3: E(T) = 1/λ über die Stammfunktion G(t) = −(t + 1/λ)e^(−λt)", () => {
  for (const l of [0.2, 0.5, 1, 3, 0.001]) {
    const G = (t) => -(t + 1 / l) * Math.exp(-l * t);
    for (const t of [0, 0.7 / l, 2 / l, 5 / l]) {
      const h = 1e-6 / l;
      assert.ok(nah((G(t + h) - G(t - h)) / (2 * h), t * dichte(l, t), 1e-6), "G′(t) = t · f(t)");
    }
    assert.ok(nah(G(0), -1 / l));
    assert.ok(Math.abs(G(60 / l)) < 1e-20 / l, "G(b) → 0");
    assert.ok(nah(simpson((t) => t * dichte(l, t), 0, 60 / l, 20000), erwartung(l), 1e-6 / l));
    assert.ok(nah(erwartung(l), 1 / l));
    // Median
    assert.ok(nah(vert(l, median(l)), 0.5, 1e-12));
    assert.ok(median(l) < erwartung(l));
    assert.ok(nah(quantil(l, 0.5), median(l)) && nah(vert(l, quantil(l, 0.9)), 0.9));
  }
  assert.equal(dk(Math.LN2, 3), "0,693");
  assert.equal(dk(1 - Math.exp(-1), 3), "0,632", "63 % warten kürzer als im Mittel");
});

test("Herleitung Schritt 4: Gedächtnislosigkeit P_{T>s}(T > s + t) = P(T > t)", () => {
  for (const l of [0.1, 0.5, 2]) for (const s of [0, 0.5, 3, 10]) for (const t of [0.2, 1, 4]) {
    assert.ok(nah(bedingt(l, s, t), ueber(l, t), 1e-12), `λ = ${l}, s = ${s}, t = ${t}`);
    assert.ok(nah(ueber(l, s + t), ueber(l, s) * ueber(l, t), 1e-15), "G(s + t) = G(s) · G(t)");
  }
  // Halbwertszeit = Median: nach k Halbwertszeiten ist der Anteil 2^(−k)
  const h = 8, l = Math.LN2 / h;
  assert.ok(nah(median(l), h));
  for (const k of [1, 2, 2.5, 4]) assert.ok(nah(ueber(l, k * h), 2 ** -k, 1e-12));
  // Leitfrage: 1000 Stunden gelaufen, λ = 0,001 → P(weitere 500 h) = e^(−0,5) wie neu
  assert.ok(nah(bedingt(0.001, 1000, 500), Math.exp(-0.5), 1e-12));
});

test("Simulation: Inversionsmethode, Histogramm passt zur Dichte, Mittelwert ≈ 1/λ, Gedächtnis-Demo", () => {
  const a = simuliere(20, 0.5, zufallszahlen(3)), b = simuliere(20, 0.5, zufallszahlen(3));
  assert.deepEqual(a, b, "gleicher Startwert, gleiche Folge");
  const l = 0.5, N = 200000;
  const w = simuliere(N, l, zufallszahlen(2026));
  assert.ok(w.every((x) => x >= 0 && Number.isFinite(x)));
  assert.ok(Math.abs(mittel(w) - 1 / l) < 0.02, `Mittelwert ${mittel(w)}`);
  const breite = 0.5, { h, drueber } = histogramm(w, breite, 16);
  assert.equal(h.reduce((s, x) => s + x, 0) + drueber, N);
  h.forEach((n, k) => {
    const soll = N * intervall(l, k * breite, (k + 1) * breite);
    assert.ok(Math.abs(n - soll) < 5 * Math.sqrt(soll) + 5, `Klasse ${k}: ${n} statt ${soll}`);
  });
  // Gedächtnis: Restzeiten der Überlebenden sind wieder exponentialverteilt mit demselben λ
  const rest = restzeiten(w, 3);
  assert.ok(Math.abs(rest.length / N - Math.exp(-1.5)) < 0.005);
  assert.ok(Math.abs(mittel(rest) - 1 / l) < 0.05, `Restzeit-Mittel ${mittel(rest)}`);
  assert.ok(Math.abs(rest.filter((x) => x > 1).length / rest.length - Math.exp(-0.5)) < 0.01);
  assert.ok(nah(ziehe(2, () => 0), 0) && nah(ziehe(1, () => 1 - Math.exp(-1)), 1, 1e-12));
  // Zerfall: 100 Kerne, Zahlen der Animation
  assert.equal(KERNE.length, 100);
  assert.deepEqual([0, 1, 2, 3, 4].map(uebrigNach), [100, 49, 24, 14, 6]);
});

/* Antworten, die ein Schüler typischerweise falsch gibt: alle hinterlegten Fallen + Rundungsfehler + Gegenwahrscheinlichkeit */
function typischFalsch(a) {
  const aus = [];
  for (const [k, , typ] of a.felder) {
    for (const [w] of a.fallen[k] || []) aus.push({ k, wert: w, ein: { ...a.loesung, [k]: tipp_(w) } });
    if (typ === "p") aus.push({ k, wert: 1 - a.soll[k], ein: { ...a.loesung, [k]: dk(1 - a.soll[k], 3) } });
  }
  return aus;
}

test("Generatoren: alle Arten × Stufen × 300 Startwerte – lösbar, exakt und gerundet, Fallen erkannt, A5", () => {
  const gesehen = new Set();
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) for (let seed = 1; seed <= 300; seed++) {
    const zufall = wuerfelAus(zufallszahlen(seed * 37 + s));
    const a = aufgabe(id, s, zufall);
    const wo = `${id} Stufe ${s} Startwert ${seed}`;
    gesehen.add(`${id}/${s}/${a.kontext}`);
    assert.equal(a.art, id, wo); assert.equal(a.stufe, s, wo);
    assert.ok(auftrag(a).length > 60 && /[?.]$/.test(auftrag(a)), `${wo}: ${auftrag(a)}`);
    assert.ok(!/ 1 (Minuten|Stunden|Tagen)\b|nächsten 1 /.test(auftrag(a)), `${wo}: Einzahl ${auftrag(a)}`);
    assert.ok(tipp(a).length > 30, wo);
    assert.ok(felder(a).length >= 1 && felder(a).length <= 2, wo);
    for (const [k, , typ] of felder(a)) {
      const soll = a.soll[k];
      assert.ok(Number.isFinite(soll) && soll > 0, `${wo}: ${k} = ${soll}`);
      if (typ === "p") assert.ok(soll > 0.001 && soll < 0.999, `${wo}: P = ${soll}`);
      // exakte Eingabe trifft genau
      assert.ok(nah(liesWert(a.exakt[k]), soll, 1e-9), `${wo}: exakt ${a.exakt[k]} = ${liesWert(a.exakt[k])} statt ${soll}`);
    }
    assert.equal(pruefe(a, a.loesung).ok, true, `${wo}: gerundet ${JSON.stringify(a.loesung)}`);
    assert.equal(pruefe(a, a.exakt).ok, true, `${wo}: exakt ${JSON.stringify(a.exakt)}`);
    const leer = pruefe(a, {});
    assert.equal(leer.ok, false); assert.ok(leer.grund.length > 10);
    // falsch gerundet (eine Stelle zu grob) fällt durch, bekommt aber den Rundungshinweis
    const [k0, , typ0] = a.felder[0];
    const grob = typ0 === "p" ? rund(a.soll[k0], 2) : typ0 === "zeit" ? rund(a.soll[k0], a.soll[k0] > 100 ? -1 : 1) : sig(a.soll[k0], 2);
    if (!trifft(grob, a.soll[k0], typ0)) {
      const e = pruefe(a, { ...a.exakt, [k0]: tipp_(grob) });
      assert.equal(e.ok, false, `${wo}: zu grob ${grob}`);
      assert.ok(e.grund.length > 20, wo);
    }
    // typische Fehler
    for (const f of typischFalsch(a)) {
      if (trifft(f.wert, a.soll[f.k], a.felder.find(([x]) => x === f.k)[2])) continue;   // Falle fällt zufällig mit der Lösung zusammen
      const e = pruefe(a, f.ein);
      assert.equal(e.ok, false, `${wo}: ${JSON.stringify(f.ein)}`);
      assert.ok(e.grund.length > 25, `${wo}: Rückmeldung zu ${JSON.stringify(f.ein)}`);
    }
    // Hinterlegte Fallen haben eine eigene Begründung (nicht nur den Tipp)
    for (const [k, , typ] of a.felder) for (const [w, text] of a.fallen[k] || []) {
      if (trifft(w, a.soll[k], typ) || !Number.isFinite(w)) continue;
      const e = pruefe(a, { ...a.exakt, [k]: tipp_(w) });
      assert.ok(!e.ok, `${wo}: Falle ${w}`);
      if (w > 0 && (typ !== "p" || w <= 1)) assert.equal(e.grund, a.fallen[k].find(([x]) => Math.abs(x - w) <= TOLERANZ[typ](x))[1], `${wo}: Falle ${w} → ${e.grund}`);
      else assert.ok(e.grund.length > 20);
    }
    // Rechenweg: endet beim Ergebnis (letztes Feld), A5, Schreibweise
    const weg = rechenweg(a);
    assert.ok(weg.length >= 1, wo);
    for (const z of weg) {
      assert.ok(a5ok(z), `${wo}: A5 „${z}“`);
      assert.ok(schreibweiseOk(z), `${wo}: Schreibweise „${z}“`);
      assert.ok(!/NaN|undefined|Infinity/.test(z), `${wo}: ${z}`);
    }
    const letztes = a.felder.at(-1)[0];
    assert.equal(endZahl(weg.at(-1)), Number(a.loesung[letztes].replace(",", ".")), `${wo}: Rechenweg endet bei ${weg.at(-1)} statt ${a.loesung[letztes]}`);
    for (const [k] of a.felder) assert.ok(weg.some((z) => endZahl(z) === Number(a.loesung[k].replace(",", "."))), `${wo}: ${k} = ${a.loesung[k]} fehlt im Rechenweg`);
    for (const t of [auftrag(a), tipp(a), ...Object.values(a.fallen).flat().map((x) => x[1])]) assert.ok(!/NaN|undefined/.test(t), `${wo}: ${t}`);
  }
  // jede Art kommt auf jeder Stufe vor, Kontexte wechseln
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) assert.ok([...gesehen].some((g) => g.startsWith(`${id}/${s}/`)), `${id}/${s}`);
  assert.ok(new Set([...gesehen].map((g) => g.split("/")[2])).size >= 4, "mindestens vier Kontexte");
});

test("Generatoren: Stufe 4/5 Wahrscheinlichkeiten nutzen auch die Halbwertszeit, Lösungen stimmen mit den Formeln", () => {
  let halb = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const a = aufgabe("wkt", 4, wuerfelAus(zufallszahlen(seed)));
    if (a.h) {
      halb += 1;
      const l = Math.LN2 / a.h;
      const p = a.frage === "gr" ? ueber(l, a.t) : vert(l, a.t);
      assert.ok(nah(a.soll.p, p, 1e-12));
    }
    const g = aufgabe("gedaechtnis", 1, wuerfelAus(zufallszahlen(seed)));
    assert.ok(nah(g.soll.p, bedingt(g.l, g.s, g.t), 1e-12));
    const k = aufgabe("kenn", 2, wuerfelAus(zufallszahlen(seed)));
    assert.ok(nah(k.soll.E, erwartung(k.l)) && nah(k.soll.m, median(k.l)));
    const q = aufgabe("kenn", 4, wuerfelAus(zufallszahlen(seed)));
    assert.ok(nah(vert(q.l, q.soll.t), q.q, 1e-12));
    const la = aufgabe("lambda", 3, wuerfelAus(zufallszahlen(seed)));
    assert.ok(nah(vert(la.soll.l, la.t), la.anteil, 1e-12));
    const l5 = aufgabe("lambda", 5, wuerfelAus(zufallszahlen(seed)));
    assert.ok(nah(ueber(l5.soll.l, l5.t2), l5.soll.p, 1e-12) && nah(ueber(l5.soll.l, l5.t), l5.anteil, 1e-12));
  }
  assert.equal(halb, 200);
});

test("Gliederung, Tipps, Kolloquium", () => {
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
    assert.ok(!/Abi-relevant|\bSchüler\*innen|SchülerInnen|:innen/.test(t), t);
  }
  // Zahlen im Kolloquium stimmen
  assert.equal(dk(1 - Math.exp(-0.2), 2), "0,18");
  assert.equal(dk(-Math.log(0.7) / 100, 4), "0,0036");
  assert.equal(dk(Math.LN2, 2), "0,69");
});

test("Seite: Exporte, Animationen, Labor, MatheFeld statt input, TeX in Attributen nur als {\"…\"}", () => {
  const q = readFileSync(new URL("../src/funcGfsExponential.jsx", import.meta.url), "utf8");
  assert.match(q, /export function GfsExponentialSeite\(\{ gehe \}\)/);
  assert.match(q, /export function ExponentialBild\(/);
  assert.match(q, /viewBox="0 0 160 120"/);
  const anims = [...q.matchAll(/<ExpAnimation art="([a-z-]+)"/g)].map((m) => m[1]);
  assert.ok(new Set(anims).size >= 3 && new Set(anims).size <= 5, `Animationen: ${anims}`);
  for (const a of anims) assert.match(q, new RegExp(`\\n  "?${a}"?: \\{ titel:`), `Szene ${a} fehlt`);
  assert.doesNotMatch(q, /\s[a-zA-Z]+="[^"{}]*\\\\[a-zA-Z{]/);
  assert.doesNotMatch(q, /<input(?![^>]*type="range")/, "Eingaben nur über MatheFeld");
  assert.match(q, /<MatheFeld /);
  for (const b of ["Formeln", "Schritt", "Kasten", "Chip", "RoterFaden", "Kolloquium", "Inline"]) assert.match(q, new RegExp(`\\b${b}\\b`));
  assert.match(q, /from "\.\/funcGfsBausteine\.jsx"/);
  assert.match(q, /AnimKarte/);
  assert.match(q, /window\.__geAufgabe/);
  // Schritttexte der Animationen: kurz (ein bis zwei Sätze)
  for (const m of q.matchAll(/\{ von: [\d.]+, text: "([^"]+)" \}/g)) assert.ok(m[1].length <= 190, `Schritttext zu lang (${m[1].length}): ${m[1]}`);
  // Anzahl der Animationen im Kurs-Eintrag und im Themenkopf
  const kurs = readFileSync(new URL("../src/gfsKurs.js", import.meta.url), "utf8");
  const n = new Set(anims).size;
  assert.match(kurs, new RegExp(`ansicht: "gfs-exponential", videos: 0, animationen: ${n} \\}`));
  const f10 = readFileSync(new URL("../src/func10.jsx", import.meta.url), "utf8");
  assert.match(f10, new RegExp(`"${n} Animationen"\\]\\} Bild=\\{ExponentialBild\\}`));
  assert.match(f10, /lazyLaden\(\(\) => import\("\.\/funcGfsExponential\.jsx"\)/);
});
