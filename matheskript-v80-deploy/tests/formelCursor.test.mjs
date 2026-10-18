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
