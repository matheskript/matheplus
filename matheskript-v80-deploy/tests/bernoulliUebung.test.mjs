/* Übung im Bernoulli-Werkzeug: Textaufgabe → Kette einstellen (src/bernoulliUebung.js) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { neueAufgabe, pruefen, ereignisTex, KONTEXTE, ARTEN } from "../src/bernoulliUebung.js";

// deterministischer Zufall
function lcg(seed) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }

test("ereignisTex schreibt Intervalle in Schulschreibweise", () => {
  assert.equal(ereignisTex([3, 3], 10), "X = 3");
  assert.equal(ereignisTex([0, 4], 10), "X ≤ 4");
  assert.equal(ereignisTex([4, 10], 10), "X ≥ 4");
  assert.equal(ereignisTex([2, 5], 10), "2 ≤ X ≤ 5");
});

test("jede Ereignisart liefert ein gültiges Intervall", () => {
  const n = 10;
  assert.deepEqual(ARTEN.find((a) => a.id === "mehr").menge(3, n), [4, n]);
  assert.deepEqual(ARTEN.find((a) => a.id === "weniger").menge(3, n), [0, 2]);
  assert.deepEqual(ARTEN.find((a) => a.id === "keine").menge(3, n), [0, 0]);
  assert.deepEqual(ARTEN.find((a) => a.id === "mindestensEine").menge(3, n), [1, n]);
  assert.deepEqual(ARTEN.find((a) => a.id === "zwischen").menge(5, n, 2), [2, 5]);
});

test("500 erzeugte Aufgaben sind in sich stimmig", () => {
  const zufall = lcg(7);
  const arten = new Set();
  for (let i = 0; i < 500; i++) {
    const a = neueAufgabe(zufall);
    assert.ok(a, "Aufgabe erzeugt");
    arten.add(a.art);
    assert.ok(a.n >= 5 && a.n <= 50);
    assert.ok(a.p > 0 && a.p < 1);
    const [v, b] = a.menge;
    assert.ok(0 <= v && v <= b && b <= a.n, `Intervall ${v}..${b} bei n = ${a.n}`);
    assert.ok(a.text.includes(String(a.n)), "n steht im Text");
    assert.ok(!a.text.includes("{n}"), "Platzhalter ersetzt");
    assert.ok(a.text.endsWith("?"));
    // die eigene Lösung besteht die Prüfung
    assert.equal(pruefen(a, { n: a.n, p: a.p, menge: a.menge }).richtig, true);
    // Bruchkontexte liefern den Bruch, Dezimalkontexte nicht
    const k = KONTEXTE.find((x) => x.satz === a.kontext);
    assert.equal(!!a.bruch, !k.dezimal);
  }
  for (const art of ARTEN) assert.ok(arten.has(art.id), `Art ${art.id} kommt vor`);
});

test("Prüfen meldet n, p und die Grenze um eins daneben", () => {
  const a = { n: 10, p: 1 / 6, bruch: { z: 1, nn: 6 }, menge: [4, 10], frage: "mehr als 3 Sechsen", tex: "X ≥ 4" };
  const falschN = pruefen(a, { n: 12, p: 1 / 6, menge: [4, 12] });
  assert.equal(falschN.richtig, false);
  assert.equal(falschN.fehler[0].typ, "n");
  const falschP = pruefen(a, { n: 10, p: 0.2, menge: [4, 10] });
  assert.equal(falschP.fehler.map((f) => f.typ).join(), "p");
  const grenze = pruefen(a, { n: 10, p: 1 / 6, menge: [3, 10] });
  assert.equal(grenze.fehler[0].typ, "ereignisgrenze");
  assert.match(grenze.fehler[0].text, /X ≥ 4/);
  assert.match(grenze.fehler[0].text, /X ≥ 3/);
  const andereArt = pruefen(a, { n: 10, p: 1 / 6, menge: [0, 3] });
  assert.equal(andereArt.fehler[0].typ, "ereignis");
  assert.equal(pruefen(a, { n: 10, p: 1 / 6, menge: [4, 10] }).richtig, true);
});
