import test from "node:test";
import assert from "node:assert/strict";
import { ableitAufgabe, asymptoteAufgabe, tangentenAufgabe, linear, eGlied, summe } from "../src/efunktionGen.js";

const num = (f, x) => { const h = 1e-5; return (f(x + h) - f(x - h)) / (2 * h); };
const STELLEN = [-1.3, -0.4, 0.2, 0.9, 1.6];
const nah = (a, b) => Math.abs(a - b) < 1e-4 * (1 + Math.abs(b));

/* Regel A5: nichts unvereinfacht */
function schreibweiseOk(tex) {
  return !/(^|[^0-9.])1x|\^\{1\}|\+ -|- -|\+ \+|\+0\b|\b1e\^|-1e\^|\(\)|e\^\{0x|e\^\{1\}/.test(tex);
}

test("Hilfsfunktionen schreiben Standardform", () => {
  assert.equal(linear(1, 0), "x");
  assert.equal(linear(-1, 3), "-x + 3");
  assert.equal(linear(2, -1), "2x - 1");
  assert.equal(eGlied(1), "e^{x}");
  assert.equal(eGlied(-1, -1, 2), "-e^{-x + 2}");
  assert.equal(eGlied(3, 2, 0), "3e^{2x}");
  assert.equal(summe(["2e^{x}", "-3x", "0", "5"]), "2e^{x} - 3x + 5");
});

test("Ableiten: Lösung stimmt numerisch, alle Stufen", () => {
  for (let stufe = 1; stufe <= 5; stufe++) {
    for (let i = 0; i < 300; i++) {
      const a = ableitAufgabe(stufe);
      for (const x of STELLEN) assert.ok(nah(a.abl(x), num(a.f, x)), `Stufe ${stufe}: ${a.tex}`);
      for (const z of [a.tex, a.ablTex, ...a.weg]) assert.ok(schreibweiseOk(z), `Schreibweise: ${z}`);
    }
  }
});

test("Asymptote, Wertemenge und Monotonie passen zur Funktion", () => {
  for (let stufe = 1; stufe <= 5; stufe++) {
    for (let i = 0; i < 300; i++) {
      const a = asymptoteAufgabe(stufe);
      const fern = a.richtig.richtung === 0 ? -60 : 60;
      assert.ok(Math.abs(a.f(fern) - a.richtig.y) < 1e-9, a.tex);
      const steigt = a.f(0.1) > a.f(0);
      assert.equal(a.richtig.mono === 0, steigt, a.tex);
      assert.equal(a.richtig.wert === 0, a.f(0) > a.richtig.y, a.tex);
      for (const z of [a.tex, ...a.weg]) assert.ok(schreibweiseOk(z), `Schreibweise: ${z}`);
    }
  }
});

test("Tangente im y-Achsenschnittpunkt", () => {
  for (let stufe = 1; stufe <= 5; stufe++) {
    for (let i = 0; i < 300; i++) {
      const a = tangentenAufgabe(stufe);
      assert.ok(nah(a.tangente(0), a.f(0)), a.tex);
      assert.ok(nah(a.m, num(a.f, 0)), a.tex);
      for (const z of [a.tex, ...a.weg]) assert.ok(schreibweiseOk(z), `Schreibweise: ${z}`);
    }
  }
});
