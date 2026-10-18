import test from "node:test";
import assert from "node:assert/strict";
import { wegPlusMinus, wegMultiplizieren, wegPrimzahl, wegPrimfaktoren, wegQuadrat, wegKubik, wegWurzel, wegDivision, wegBruch, potenzForm, ggT, kgV, RECHNEN_THEMEN } from "../src/kopfWeg.js";

const zuf = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const istPrim = (n) => { if (n < 2) return false; for (let t = 2; t * t <= n; t++) if (n % t === 0) return false; return true; };

/* Regel A5: Ergebnisse stehen vereinfacht da. Geprüft werden das Ergebnis und die rechte Seite der letzten Rechnungszeile;
   im Fließtext nur die Vorzeichen-Doppelungen (Ziffern wie „7 + 0“ in einer Spaltenrechnung sind erlaubt). */
const ENDE = [/\^1\b/, /(^|[^\d])1 ?x/, /· ?1\s*$/, /\+ ?0\s*$/, /[²³⁴⁵⁶⁷⁸⁹]¹/, /\{(\d+)\|1\}/];
const rechts = (z) => String(z).split("=").pop().trim();
const a5 = (r, was) => {
  const zeilen = r.schritte.map((s) => s.rechnung).filter(Boolean);
  const seiten = [r.ergebnis, ...zeilen.slice(-1)].map(rechts);   // Zwischenzeilen dürfen den Ausgangsausdruck zeigen
  for (const t of seiten) for (const re of ENDE) assert.ok(!re.test(t), `A5 verletzt (${re}) bei ${was}: "${t}"`);
  const text = r.schritte.map((s) => s.text).join("\n");
  for (const re of [/\+ ?−/, /− ?−/]) assert.ok(!re.test(text), `Vorzeichen-Doppelung bei ${was}`);
};

test("Plus: Beispiel 478 + 256 mit Übertrag", () => {
  const r = wegPlusMinus(478, 256, "+");
  assert.equal(r.ergebnis, "734");
  assert.match(r.schritte[1].text, /8 \+ 6 = 14.*Übertrag/);
  assert.match(r.schritte[2].text, /7 \+ 5 \+ 1 = 13/);
});
test("Plus und Minus: 300 zufällige Aufgaben stimmen und halten A5", () => {
  for (let i = 0; i < 300; i++) {
    let a = zuf(0, 99999), b = zuf(0, 99999);
    const r = wegPlusMinus(a, b, "+");
    assert.equal(Number(r.ergebnis), a + b); a5(r, `${a}+${b}`);
    if (a < b) [a, b] = [b, a];
    const m = wegPlusMinus(a, b, "−");
    assert.equal(Number(m.ergebnis), a - b); a5(m, `${a}−${b}`);
  }
});
test("Minus: zu große zweite Zahl wird abgelehnt", () => {
  assert.equal(wegPlusMinus(5, 9, "−").ok, false);
  assert.equal(wegPlusMinus(-1, 2, "+").ok, false);
  assert.equal(wegPlusMinus(1.5, 2, "+").ok, false);
});

test("Multiplizieren: alle Produkte bis 10 · 10 und 500 größere stimmen", () => {
  for (let a = 0; a <= 10; a++) for (let b = 0; b <= 10; b++) { const r = wegMultiplizieren(a, b); assert.equal(Number(r.ergebnis), a * b); a5(r, `${a}·${b}`); }
  for (let i = 0; i < 500; i++) {
    const a = zuf(11, 9999), b = zuf(1, 9999);
    const r = wegMultiplizieren(a, b);
    assert.equal(Number(r.ergebnis), a * b, `${a}·${b}`); a5(r, `${a}·${b}`);
  }
});
test("Multiplizieren: 9er-Trick und Zerlegen nach Stellen", () => {
  assert.match(wegMultiplizieren(7, 9).schritte[0].text, /mal 10 minus die Zahl: 70 − 7 = 63/);
  const r = wegMultiplizieren(23, 14);
  assert.equal(r.ergebnis, "322");
  assert.match(r.schritte[0].text, /14 = 10 \+ 4/);
});

test("Primzahlen: Urteil stimmt für alle Zahlen bis 2000", () => {
  for (let n = 0; n <= 2000; n++) { const r = wegPrimzahl(n); assert.equal(r.prim, istPrim(n), String(n)); a5(r, String(n)); }
  assert.equal(wegPrimzahl(10000).ok, true);
  assert.equal(wegPrimzahl(10001).ok, false);
});
test("Primzahlen: 97 wird nur bis 9 getestet", () => {
  const r = wegPrimzahl(97);
  assert.equal(r.prim, true);
  assert.match(r.schritte[0].text, /bis 9 testen/);
  assert.equal(r.schritte.filter((s) => /^Test/.test(s.text)).length, 4);
});

test("Primfaktoren: Produkt, nur Primzahlen, Potenzform", () => {
  for (let n = 2; n <= 3000; n++) {
    const r = wegPrimfaktoren(n);
    const f = r.faktoren;
    assert.equal(f.reduce((p, x) => p * x, 1), n, String(n));
    assert.ok(f.every(istPrim), String(n));
    assert.deepEqual(f, [...f].sort((a, b) => a - b));
    assert.equal(r.prim, istPrim(n));
    a5(r, String(n));
  }
  const r = wegPrimfaktoren(84);
  assert.equal(r.ergebnis, "84 = 2 · 2 · 3 · 7 = 2² · 3 · 7");
  assert.equal(wegPrimfaktoren(30).ergebnis, "30 = 2 · 3 · 5");
  assert.equal(wegPrimfaktoren(13).ergebnis, "13 ist eine Primzahl");
  assert.equal(wegPrimfaktoren(1).ok, false);
  assert.equal(wegPrimfaktoren(999999).faktoren.reduce((p, x) => p * x, 1), 999999);
  assert.equal(potenzForm([2, 2, 2, 5]), "2³ · 5");
});

test("Quadrate bis 99 stimmen und halten A5", () => {
  for (let n = 1; n <= 99; n++) { const r = wegQuadrat(n); assert.equal(r.wert, n * n, String(n)); a5(r, `${n}²`); }
  assert.match(wegQuadrat(35).schritte[0].text, /3 · 4 = 12 und hänge 25 an/);
  assert.equal(wegQuadrat(23).schritte[1].rechnung, "23² = 400 + 120 + 9 = 529");
  assert.equal(wegQuadrat(27).schritte[1].rechnung, "27² = 900 − 180 + 9 = 729");
});
test("Kuben bis 20 stimmen", () => {
  for (let n = 1; n <= 20; n++) { const r = wegKubik(n); assert.equal(r.wert, n ** 3, String(n)); a5(r, `${n}³`); }
});
test("Wurzeln: alle Quadratzahlen bis 10 000 über den Drei-Schritt-Weg", () => {
  for (let n = 1; n <= 100; n++) { const r = wegWurzel(n * n); assert.equal(r.wert, n, String(n * n)); assert.equal(r.quadrat, true); a5(r, `√${n * n}`); }
  assert.match(wegWurzel(5329).schritte.map((s) => s.text).join(" "), /Mitte 75/);
  const k = wegWurzel(550);
  assert.equal(k.quadrat, false);
  assert.match(k.ergebnis, /≈ 23,5/);
});

test("Schriftlich Teilen: Quotient, Rest und Probe für 600 Aufgaben", () => {
  for (let i = 0; i < 600; i++) {
    const a = zuf(0, 999999), b = zuf(1, i % 3 === 0 ? 999 : 30);
    const r = wegDivision(a, b);
    assert.equal(r.quotient, Math.floor(a / b), `${a}:${b}`);
    assert.equal(r.rest, a % b);
    a5(r, `${a}:${b}`);
  }
  assert.equal(wegDivision(756, 4).ergebnis, "756 : 4 = 189");
  assert.equal(wegDivision(25, 4).ergebnis, "25 : 4 = 6 Rest 1");
  assert.equal(wegDivision(408, 4).ergebnis, "408 : 4 = 102");
  assert.equal(wegDivision(3, 7).ergebnis, "3 : 7 = 0 Rest 3");
  assert.equal(wegDivision(5, 0).ok, false);
});

test("Brüche: Ergebnis stimmt, ist vollständig gekürzt und hält A5", () => {
  const gleich = (r, zn, nn) => { assert.equal(r.z * nn, zn * r.n); assert.equal(ggT(r.z, r.n) || 1, 1, "nicht gekürzt"); };
  for (let i = 0; i < 400; i++) {
    const z1 = zuf(0, 40), n1 = zuf(1, 40), z2 = zuf(1, 40), n2 = zuf(1, 40);
    const k = wegBruch("kuerzen", z1, n1); gleich(k, z1, n1); a5(k, `kürzen ${z1}/${n1}`);
    const p = wegBruch("plus", z1, n1, z2, n2); gleich(p, z1 * n2 + z2 * n1, n1 * n2); a5(p, "plus");
    const m = wegBruch("mal", z1, n1, z2, n2); gleich(m, z1 * z2, n1 * n2); a5(m, "mal");
    const d = wegBruch("geteilt", z1, n1, z2, n2); gleich(d, z1 * n2, n1 * z2); a5(d, "geteilt");
    if (z1 * n2 >= z2 * n1) { const mi = wegBruch("minus", z1, n1, z2, n2); gleich(mi, z1 * n2 - z2 * n1, n1 * n2); a5(mi, "minus"); }
    else assert.equal(wegBruch("minus", z1, n1, z2, n2).ok, false);
  }
  const r = wegBruch("plus", 1, 2, 1, 3);
  assert.equal(r.ergebnis, "{5|6}");
  assert.match(r.schritte[0].text, /Hauptnenner.*6/);
  assert.equal(wegBruch("kuerzen", 6, 8).ergebnis, "{3|4}");
  assert.equal(wegBruch("kuerzen", 8, 4).ergebnis, "2");
  assert.equal(wegBruch("plus", 3, 4, 3, 4).gemischt, "1 {1|2}");
  assert.equal(wegBruch("geteilt", 1, 2, 0, 3).ok, false);
  assert.equal(wegBruch("plus", 1, 0, 1, 2).ok, false);
});

test("Eingabemasken: Startwerte und Zufallsaufgaben liefern gültige Wege", () => {
  for (const [id, th] of Object.entries(RECHNEN_THEMEN)) {
    const werte = {};
    th.felder.forEach((f) => { werte[f.id] = f.start; });
    assert.equal(th.rechne(werte).ok, true, `${id} Startwerte`);
    const optionen = th.felder.find((f) => f.art === "wahl");
    const wahlen = optionen ? optionen.optionen.map((o) => o[0]) : [null];
    for (const w of wahlen) {
      for (let i = 0; i < 60; i++) {
        const v = { ...werte }; if (optionen) v[optionen.id] = w;
        Object.assign(v, th.zufall(v));
        const r = th.rechne(v);
        assert.equal(r.ok, true, `${id} ${JSON.stringify(v)}: ${r.hinweis}`);
      }
    }
  }
});

test("ggT und kgV", () => { assert.equal(ggT(12, 18), 6); assert.equal(kgV(4, 6), 12); });
