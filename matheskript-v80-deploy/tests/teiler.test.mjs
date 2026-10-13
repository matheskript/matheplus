import test from "node:test";
import assert from "node:assert/strict";
import {
  ENDZIFFERN, FALLEN, STUFEN, TEILER_ANZAHL, TEILER_REIHE, TEILER_SCHRITTE, auswerten, endzerlegung, erklaerung, hilfsFaktor,
  naechsterTeiler, neunerZerlegung, quersumme, rundeErzeugen, siebenerKette,
} from "../src/teiler.js";

/* kleiner, wiederholbarer Zufallsgenerator (mulberry32) */
const zufallVon = (seed) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

test("Reihenfolge und Schrittzahlen passen zusammen", () => {
  assert.deepEqual(TEILER_REIHE, [2, 5, 3, 4, 6, 7, 8, 9]);
  assert.equal(TEILER_ANZAHL, 8);
  assert.equal(TEILER_SCHRITTE.length, TEILER_ANZAHL);
});

test("Endziffern: n = vorne·10^k + ende, der vordere Teil ist immer durch t teilbar", () => {
  for (const t of [2, 4, 5, 8]) {
    const k = ENDZIFFERN[t];
    assert.equal(hilfsFaktor(t) * t, 10 ** k);
    assert.ok(Number.isInteger(hilfsFaktor(t)));
    for (let n = 0; n <= 30000; n++) {
      const { vorne, ende, p } = endzerlegung(n, k);
      assert.equal(vorne * p + ende, n);
      assert.equal((vorne * p) % t, 0);
      assert.equal(n % t === 0, ende % t === 0);          // genau die Regel
    }
  }
  // Die letzte Ziffer allein reicht bei 4 und 8 nicht (Gegenbeispiele aus dem Lernmodul)
  assert.equal(12 % 4, 0); assert.notEqual(22 % 4, 0);
  assert.equal(112 % 8, 0); assert.notEqual(212 % 8, 0); assert.equal(312 % 8, 0);
});

test("Quersumme: n = Neunerblock + Quersumme, Neunerblock durch 9, Regel stimmt für 3 und 9", () => {
  for (let n = 1; n <= 100000; n++) {
    const z = neunerZerlegung(n);
    assert.equal(z.neunerSumme + z.quersumme, n);
    assert.equal(z.neunerSumme % 9, 0);
    assert.equal(z.quersumme, quersumme(n));
    assert.equal(n % 3 === 0, z.quersumme % 3 === 0);
    assert.equal(n % 9 === 0, z.quersumme % 9 === 0);
  }
  // die Beispiele aus dem Lernmodul
  assert.equal(neunerZerlegung(12).neunerSumme, 9);
  assert.equal(neunerZerlegung(84).neunerSumme, 72);
  assert.equal(neunerZerlegung(213).neunerSumme, 207);
  assert.equal(neunerZerlegung(27).neunerSumme, 18);
  assert.equal(neunerZerlegung(162).neunerSumme, 153);
  assert.equal(neunerZerlegung(387).neunerSumme, 369);
  assert.equal(quersumme(4827), 21);
});

test("Siebener-Verfahren: Schrittidentität und Ergebnis stimmen für alle Zahlen bis 200000", () => {
  for (let n = 1; n <= 200000; n++) {
    const k = siebenerKette(n);
    for (const s of k.schritte) {
      assert.equal(s.A * 10 + s.e, s.n);
      assert.equal(s.abgezogen % 7, 0);                    // 21·e ist ein Vielfaches von 7
      assert.equal(s.rest, 10 * s.ergebnis);               // n − 21e = 10·(A − 2e)
    }
    assert.equal(k.ok, n % 7 === 0, `n=${n}`);
  }
  // die neun Abziehzahlen aus dem Lernmodul
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9].map((e) => 21 * e), [21, 42, 63, 84, 105, 126, 147, 168, 189]);
  // Beispiele
  assert.deepEqual(siebenerKette(203).schritte.map((s) => s.ergebnis), [14]);
  assert.deepEqual(siebenerKette(1316).schritte.map((s) => s.ergebnis), [119, -7]);
  assert.deepEqual(siebenerKette(1235).schritte.map((s) => s.ergebnis), [113, 5]);
  assert.equal(siebenerKette(1235).ok, false);
});

test("Erklärung: Urteil stimmt mit n % t überein (alle t, Zahlen 1 bis 20000)", () => {
  for (const t of TEILER_REIHE) {
    for (let n = 1; n <= 20000; n++) {
      const e = erklaerung(n, t);
      assert.equal(e.ok, n % t === 0, `t=${t} n=${n}`);
      assert.ok(e.text.length > 5);
      assert.ok(!/NaN|undefined/.test(e.text), `t=${t} n=${n}: ${e.text}`);
    }
  }
  assert.match(erklaerung(2718, 2).text, /gerade/);
  assert.match(erklaerung(2918, 4).text, /Rest 2/);
  assert.match(erklaerung(1204, 8).text, /Rest 4/);
  assert.match(erklaerung(4827, 9).text, /nur durch 3/);
  assert.match(erklaerung(135, 6).text, /Die 2 fehlt/);
});

test("Runden: neun verschiedene Zahlen im Bereich, 2–5 Treffer, richtige Markierung, Fallen vorhanden", () => {
  for (const t of TEILER_REIHE) {
    for (const st of STUFEN) {
      const zufall = zufallVon(t * 100 + st.id);
      for (let i = 0; i < 400; i++) {
        const r = rundeErzeugen(t, st.id, zufall);
        assert.equal(r.zahlen.length, 9);
        assert.equal(new Set(r.zahlen.map((z) => z.n)).size, 9);
        const ja = r.zahlen.filter((z) => z.ja).length;
        assert.ok(ja >= 2 && ja <= 5, `Treffer ${ja}`);
        for (const z of r.zahlen) {
          assert.ok(z.n >= st.lo && z.n <= st.hi, `${z.n} außerhalb ${st.name}`);
          assert.equal(z.ja, z.n % t === 0);
        }
        if (FALLEN[t]) {
          // mindestens eine Falle: durch einen Teilfaktor teilbar, aber nicht durch t
          const fallen = r.zahlen.filter((z) => !z.ja && FALLEN[t].some((d) => z.n % d === 0));
          assert.ok(fallen.length >= 1, `keine Falle bei t=${t}, ${st.name}`);
        }
      }
    }
  }
});

test("Teiler-Beutel: bei mehreren Teilern kommt jeder dran, kein sofortiger Wiederholer, bei einem immer derselbe", () => {
  const zufall = zufallVon(7);
  let beutel = [], letzter = null;
  const auswahl = [7, 4, 9];
  const gezogen = [];
  for (let i = 0; i < 30; i++) {
    const r = naechsterTeiler(auswahl, beutel, letzter, zufall);
    gezogen.push(r.t); beutel = r.beutel; letzter = r.t;
  }
  for (let i = 0; i < 30; i += 3) assert.deepEqual(gezogen.slice(i, i + 3).sort(), [4, 7, 9]);   // jede Dreierrunde enthält alle
  for (let i = 1; i < 30; i++) assert.notEqual(gezogen[i], gezogen[i - 1]);
  assert.equal(naechsterTeiler([5], [], 5, zufall).t, 5);
  // Auswahl ändert sich: Altlasten im Beutel werden verworfen
  assert.ok([2, 3].includes(naechsterTeiler([2, 3], [9, 8], null, zufall).t));
});

test("Auswertung: richtig, übersehen, falsch", () => {
  const runde = { teiler: 5, stufe: 1, zahlen: [{ n: 10, ja: true }, { n: 15, ja: true }, { n: 12, ja: false }, { n: 13, ja: false }] };
  const a = auswerten(runde, new Set([10, 12]));
  assert.deepEqual(a.zellen.map((z) => z.status), ["richtig", "uebersehen", "falsch", "frei"]);
  assert.equal(a.fehler, 2);
  assert.equal(a.perfekt, false);
  assert.equal(auswerten(runde, new Set([10, 15])).perfekt, true);
});
