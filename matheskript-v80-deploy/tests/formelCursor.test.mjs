import test from "node:test";
import assert from "node:assert/strict";
import { stelleRechts, stelleLinks, hinterKlammer, naechsterPlatz, stelleAusKlick } from "../src/formelCursor.js";
import { liveTexPos, liveTex, parse, alsTex } from "../src/formelEngine.js";

test("Pfeile springen über zusammengehörige Zeichen", () => {
  assert.equal(stelleRechts("sin(x)", 0), 4);
  assert.equal(stelleLinks("sin(x)", 4), 0);
  assert.equal(stelleRechts("2^(3)", 1), 3);
  assert.equal(stelleRechts("ab", 5), 2);
  assert.equal(stelleLinks("ab", 0), 0);
});
test("hinter die Klammer", () => {
  assert.equal(hinterKlammer("(x+1)*2", 3), 5);
  assert.equal(hinterKlammer("x+1", 1), -1);
  assert.equal(hinterKlammer("(x+1", 2), 4);
});
test("▯ → : nächster Platz, dann aus der Klammer", () => {
  assert.equal(naechsterPlatz("(▯+▯)", 1), 3);
  assert.equal(naechsterPlatz("(x+1)", 2), 5);
  assert.equal(naechsterPlatz("x+1", 1), 3);
});
test("Klick: Hälfte entscheidet, rechts neben Gruppe → hinter die Klammer", () => {
  const bl = [{ s: 0, e: 1, l: 0, r: 10, t: 0, b: 10, gruppen: [] }, { s: 1, e: 2, l: 10, r: 20, t: 0, b: 10, gruppen: [{ ge: 3, r: 20 }] }];
  assert.equal(stelleAusKlick(2, 5, bl), 0);
  assert.equal(stelleAusKlick(8, 5, bl), 1);
  assert.equal(stelleAusKlick(30, 5, bl), 3);
  assert.equal(stelleAusKlick(1, 1, [], 7), 7);
});
test("Positionsmodus verändert die Anzeige ohne Marke nicht", () => {
  const t = liveTexPos("(x^2+2x-▯)", 8);
  assert.match(t, /boxA/);
  assert.match(liveTexPos("(x^2+2x-▯)", 10), /cursor/);
  assert.equal(JSON.stringify(parse("x^2+1")), JSON.stringify(parse("x^2+1")));
  assert.equal(liveTex("x^2"), alsTex(parse("x^2")));
});

import { loescheZurueck, loescheVor, schliesser, oeffner } from "../src/formelCursor.js";

test("Klammerpaare finden", () => {
  assert.equal(schliesser("(x+h)^(▯)", 6), 8);
  assert.equal(schliesser("(x+(1)", 0), -1);
  assert.equal(oeffner("sin(2x)+1", 6), 3);
  assert.equal(oeffner("x)", 1), -1);
});

test("⌫ hinter dem Öffner: leere Gruppe ganz weg (nie „(x+h)▯)“)", () => {
  assert.deepEqual(loescheZurueck("(x+h)^(▯)", 7), { text: "(x+h)", pos: 5 });
  assert.deepEqual(loescheZurueck("sqrt(▯)", 5), { text: "", pos: 0 });
  assert.deepEqual(loescheZurueck("2sin()", 5), { text: "2", pos: 1 });
  assert.deepEqual(loescheZurueck("x+e^(▯)", 5), { text: "x+", pos: 2 });
  assert.deepEqual(loescheZurueck("1/(▯)", 3), { text: "", pos: 0 });
});

test("⌫ hinter dem Öffner: Gruppe mit Inhalt wird ausgepackt, Exponent verschwindet", () => {
  assert.deepEqual(loescheZurueck("sin(2x)+1", 4), { text: "2x+1", pos: 0 });
  assert.deepEqual(loescheZurueck("3(x+1)", 2), { text: "3x+1", pos: 1 });
  assert.deepEqual(loescheZurueck("x^(2x)+1", 3), { text: "x+1", pos: 1 });
  assert.deepEqual(loescheZurueck("e^(2x)", 3), { text: "2x", pos: 0 });
  assert.deepEqual(loescheZurueck("1/(x+1)", 3), { text: "x+1", pos: 0 });
  assert.deepEqual(loescheZurueck("sin(x", 4), { text: "x", pos: 0 });   // noch offen: nur sin( weg
});

test("⌫ beim Bruch: leere Hälften verschwinden zusammen", () => {
  assert.deepEqual(loescheZurueck("(▯)/(▯)", 1), { text: "", pos: 0 });
  assert.deepEqual(loescheZurueck("x+(▯)/(▯)", 7), { text: "x+", pos: 2 });
  assert.deepEqual(loescheZurueck("(2)/(▯)", 5), { text: "(2)/", pos: 4 });
});

test("⌫ bei log: Basis und Argument gehören zusammen", () => {
  assert.deepEqual(loescheZurueck("log[▯](▯)", 4), { text: "", pos: 0 });
  assert.deepEqual(loescheZurueck("log[2](▯)", 7), { text: "", pos: 0 });
  assert.deepEqual(loescheZurueck("log[2](x)+1", 7), { text: "x+1", pos: 0 });
  assert.deepEqual(loescheZurueck("log[2](x)", 4), { text: "x", pos: 0 });
});

test("⌫ hinter der schließenden Klammer: leer → weg, sonst hinein", () => {
  assert.deepEqual(loescheZurueck("x^(▯)", 5), { text: "x", pos: 1 });
  assert.deepEqual(loescheZurueck("(x+1)*2", 5), { text: "(x+1)*2", pos: 4 });
  assert.deepEqual(loescheZurueck("sin(x)", 6), { text: "sin(x)", pos: 5 });
});

test("⌫ sonst: ein Zeichen, pi als Einheit", () => {
  assert.deepEqual(loescheZurueck("2pi", 3), { text: "2", pos: 1 });
  assert.deepEqual(loescheZurueck("x+1", 3), { text: "x+", pos: 2 });
  assert.deepEqual(loescheZurueck("x", 0), { text: "x", pos: 0 });
  assert.deepEqual(loescheZurueck("x^2", 3), { text: "x^", pos: 2 });
});

test("Entf löscht nach rechts mit denselben Regeln", () => {
  assert.deepEqual(loescheVor("x^(2)", 1), { text: "x", pos: 1 });
  assert.deepEqual(loescheVor("▯+1", 0), { text: "+1", pos: 0 });
  assert.deepEqual(loescheVor("x", 1), { text: "x", pos: 1 });
});
