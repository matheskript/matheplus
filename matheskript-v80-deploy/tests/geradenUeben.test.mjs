/* Geradentrainer, Modus „Üben“ (src/geradenUeben.js): je Schritt der richtige Wert (m bzw. c als exakter
   Bruch) und bis zu drei falsche – der richtige besteht die Prüfung von Lernen (bewerte), jeder falsche fällt
   durch, Schlüssel verschieden, Hinweise nicht leer; Zwei Punkte = 2 Schritte, Punkt und Steigung = 1,
   senkrecht = 0. */
import test from "node:test";
import assert from "node:assert/strict";
import { achsenabschnitt, bGleich, bewerte, bruch, geradePQ, zufallPQ, zufallPm } from "../src/geradenLogik.js";
import { pruefeWert, uebenWeg, wertText } from "../src/geradenUeben.js";
import { sichtbareOptionen } from "../src/uebenKern.js";

const istBruch = (b) => b && Number.isInteger(b.n) && Number.isInteger(b.d) && b.d > 0;

function pruefeSchritt(s, soll, name) {
  assert.ok(istBruch(s.richtig) && bGleich(s.richtig, soll), `${name}/${s.label}: richtiger Wert ${JSON.stringify(s.richtig)}`);
  assert.ok(s.optionen.length >= 1 && s.optionen.length <= 4, `${name}/${s.label}: ${s.optionen.length} Optionen`);
  assert.ok(s.optionen[0].richtig && s.optionen.slice(1).every((o) => !o.richtig), `${name}/${s.label}: optionen[0] muss die richtige sein`);
  assert.deepEqual(s.optionen[0].wert, s.richtig);
  // Dieselbe Prüfung wie in Lernen: die richtige besteht, jede falsche fällt durch
  assert.equal(bewerte(wertText(s.richtig), soll).art, "richtig", `${name}/${s.label}: richtige Karte fällt durch`);
  assert.equal(new Set(s.optionen.map((o) => o.key)).size, s.optionen.length, `${name}/${s.label}: doppelte Optionen`);
  for (const o of s.optionen.slice(1)) {
    assert.ok(istBruch(o.wert), `${name}/${s.label}: kein Bruch ${JSON.stringify(o.wert)}`);
    const r = bewerte(wertText(o.wert), soll);
    assert.ok(r.art === "falsch", `${name}/${s.label}: falsche Karte ${wertText(o.wert)} ist ${r.art}`);
    assert.ok(!pruefeWert(o.wert, soll).ok);
    assert.ok(o.hinweis && o.hinweis.length > 15, `${name}/${s.label}: Hinweis fehlt (${o.art})`);
    assert.ok(!/ -[0-9]/.test(o.hinweis), `${name}/${s.label}: Bindestrich statt Minus im Hinweis „${o.hinweis}“`);
    assert.ok(o.art && o.art !== "fehler", `${name}/${s.label}: Fehlerart fehlt`);
  }
  for (const k of [2, 3, 4]) assert.equal(sichtbareOptionen(s, k).filter((o) => o.richtig).length, 1);
  assert.ok(s.frage && s.frage.length > 8, `${name}/${s.label}: Frage fehlt`);
  assert.ok(typeof s.weg === "string" && s.weg.startsWith(`${s.label} = `), `${name}/${s.label}: Rechenweg fehlt (${s.weg})`);
}

function pruefePQ(P, Q, zufall, name = `P(${P}) Q(${Q})`) {
  const weg = uebenWeg({ P, Q, art: "pq" }, zufall);
  const g = geradePQ(P, Q);
  if (g.senkrecht) { assert.equal(weg.length, 0, `${name}: senkrecht ohne Schritte`); return weg; }
  assert.deepEqual(weg.map((s) => s.art), ["m", "c"], name);
  pruefeSchritt(weg[0], g.m, name);
  pruefeSchritt(weg[1], g.c, name);
  return weg;
}
function pruefePm(P, m, zufall, name = `P(${P}) m=${wertText(m)}`) {
  const weg = uebenWeg({ P, m, art: "pm" }, zufall);
  assert.deepEqual(weg.map((s) => s.art), ["c"], name);
  pruefeSchritt(weg[0], achsenabschnitt(P, m), name);
  return weg;
}

test("Beispiel beim Öffnen: P(1 | 3), Q(3 | 7) → m = 2, c = 1 mit typischen Fehlern", () => {
  const weg = pruefePQ([1, 3], [3, 7], () => 0);
  assert.deepEqual(weg[0].richtig, { n: 2, d: 1 });
  assert.deepEqual(weg[1].richtig, { n: 1, d: 1 });
  assert.equal(weg[0].optionen.length, 4, "m: drei falsche Karten");
  assert.equal(weg[1].optionen.length, 4, "c: drei falsche Karten");
  assert.ok(weg[0].weg.endsWith("= 2") && weg[1].weg.endsWith("= 1"));
  // Die falschen Werte kommen aus den Katalogen: −2 (Vorzeichen), 1/2 (Kehrwert), 4 (nur Δy), 2 … (nur Δx fällt als Dublette weg)
  const alleM = new Set();
  const alleC = new Set();
  for (let i = 0; i < 60; i++) {
    const w = uebenWeg({ P: [1, 3], Q: [3, 7] });
    w[0].optionen.slice(1).forEach((o) => alleM.add(`${o.art}:${wertText(o.wert)}`));
    w[1].optionen.slice(1).forEach((o) => alleC.add(`${o.art}:${wertText(o.wert)}`));
  }
  for (const e of ["vorzeichen:-2", "kehrwert:1/2", "nurDy:4", "ursprung:7/3"]) assert.ok(alleM.has(e), `m: ${e} fehlt in ${[...alleM]}`);
  for (const e of ["ohneM:3", "plus:5", "umgekehrt:-1", "vertauscht:-5"]) assert.ok(alleC.has(e), `c: ${e} fehlt in ${[...alleC]}`);
  assert.ok(!alleM.has("nurDx:2") && !alleM.has("gemischt:-2"), "Dubletten (nur Δx = m, gemischt = Vorzeichen) fallen heraus");
  assert.ok(![...alleC].some((e) => e.startsWith("ausQ")), "c aus Q ist gleichwertig und fällt heraus");
});

test("Punkt und Steigung: P(2 | 3), m = 2 → c = −1; Bruch-Steigung", () => {
  const weg = pruefePm([2, 3], bruch(2), () => 0.5);
  assert.deepEqual(weg[0].richtig, { n: -1, d: 1 });
  assert.equal(weg[0].optionen.length, 4);
  const w2 = pruefePm([3, -2], bruch(-2, 3), () => 0.99);
  assert.deepEqual(w2[0].richtig, { n: 0, d: 1 });   // −2 − (−2/3 · 3) = 0
  assert.ok(w2[0].optionen.length >= 3, "auch bei c = 0 mindestens zwei falsche Karten");
});

test("Feste Fälle: negative und Bruch-Steigungen, waagerecht, durch den Ursprung, senkrecht", () => {
  const faelle = [
    [[0, 0], [2, 4]], [[-3, 5], [1, -3]], [[2, 1], [6, 4]], [[-4, -2], [2, 1]], [[1, 2], [4, 0]], [[0, 3], [5, 3]],
    [[-6, 6], [6, -6]], [[3, 7], [1, 3]], [[0, -4], [8, -2]], [[5, 5], [8, 7]], [[-2, 0], [0, 5]], [[7, -8], [-8, 7]],
  ];
  for (const [P, Q] of faelle) for (const z of [() => 0, () => 0.5, () => 0.99, Math.random]) pruefePQ(P, Q, z);
  // waagerecht: m = 0 – Vorzeichen und Δy fallen weg, es bleiben Δx (und y_Q/x_Q)
  const waag = pruefePQ([1, 3], [4, 3], () => 0);
  assert.ok(waag[0].optionen.length >= 3, `m = 0: ${waag[0].optionen.length} Optionen`);
  // senkrecht: keine Schritte
  assert.equal(uebenWeg({ P: [2, 1], Q: [2, 5], art: "pq" }).length, 0);
  assert.equal(uebenWeg({ P: [2, 1], Q: [2, 1], art: "pq" }).length, 0);
  // art fehlt → aus den Angaben
  assert.equal(uebenWeg({ P: [1, 3], Q: [3, 7] }).length, 2);
  assert.equal(uebenWeg({ P: [1, 3], m: bruch(1, 2) }).length, 1);
  for (const [P, m] of [[[0, 0], bruch(3)], [[4, 1], bruch(-3, 4)], [[-5, 2], bruch(1, 5)], [[6, -6], bruch(-1)], [[0, 4], bruch(2, 3)], [[3, 0], bruch(0)]]) {
    for (const z of [() => 0, () => 0.99, Math.random]) pruefePm(P, m, z);
  }
});

test("200 Zufallsaufgaben je Art: Werte exakt, falsche Karten wirklich falsch, meist drei davon", () => {
  let drei = 0, n = 0;
  for (let i = 0; i < 200; i++) {
    const { P, Q } = zufallPQ();
    const w = pruefePQ(P, Q, Math.random);
    for (const s of w) { n++; if (s.optionen.length === 4) drei++; }
  }
  for (let i = 0; i < 200; i++) {
    const { P, m } = zufallPm();
    const w = pruefePm(P, m, Math.random);
    n++; if (w[0].optionen.length === 4) drei++;
  }
  assert.ok(drei / n > 0.85, `nur ${drei} von ${n} Schritten mit drei falschen Karten`);
});

test("Position der richtigen Karte ist zufällig, aber je Schritt fest", () => {
  const pos = new Set();
  for (let i = 0; i < 40; i++) for (const s of uebenWeg({ P: [1, 3], Q: [3, 7] })) {
    const sicht = sichtbareOptionen(s, 4);
    pos.add(sicht.findIndex((o) => o.richtig));
    assert.deepEqual(sichtbareOptionen(s, 4).map((o) => o.key), sicht.map((o) => o.key));
  }
  assert.ok(pos.size >= 3, `richtige Karte nur an Position ${[...pos]}`);
});

test("wertText und pruefeWert passen zu bewerte", () => {
  assert.equal(wertText(bruch(-3, 2)), "-3/2");
  assert.equal(wertText(bruch(4, 2)), "2");
  assert.ok(pruefeWert(bruch(3, 2), bruch(6, 4)).ok);
  assert.ok(!pruefeWert(bruch(-3, 2), bruch(3, 2)).ok);
  assert.ok(!pruefeWert(bruch(0), bruch(1)).ok);
});
