import test from "node:test";
import assert from "node:assert/strict";
import { einfuegen, loeschen, zahlenTasten, zeigeAutomatisch, FORMEL_HAUPT, FORMEL_FUNKTION, ERLAUBT, MODI, istModus } from "../src/matheTastaturLogik.js";

test("einfügen an der Schreibmarke und Ersetzen einer Auswahl", () => {
  assert.deepEqual(einfuegen("12", 1, 1, "5"), { wert: "152", pos: 2 });
  assert.deepEqual(einfuegen("12345", 1, 4, "x"), { wert: "1x5", pos: 2 });
  assert.deepEqual(einfuegen("", undefined, undefined, "7"), { wert: "7", pos: 1 });
  assert.deepEqual(einfuegen("ab", 99, 99, "c"), { wert: "abc", pos: 3 });
});
test("Funktionstasten setzen die Schreibmarke in die Klammer", () => {
  assert.deepEqual(einfuegen("", 0, 0, "sin()", 1), { wert: "sin()", pos: 4 });
  assert.deepEqual(einfuegen("sin(x)", 4, 4, "cos()", 1), { wert: "sin(cos()x)", pos: 8 });
  assert.deepEqual(einfuegen("2", 1, 1, "^()", 1), { wert: "2^()", pos: 2 + 1 });
});
test("schließende Klammer überspringt eine vorhandene", () => {
  assert.deepEqual(einfuegen("(1+2)", 4, 4, ")"), { wert: "(1+2)", pos: 5 });
  assert.deepEqual(einfuegen("(1+2", 4, 4, ")"), { wert: "(1+2)", pos: 5 });
});
test("löschen: Zeichen, Auswahl, leere Funktionsklammer, Anfang", () => {
  assert.deepEqual(loeschen("123", 3, 3), { wert: "12", pos: 2 });
  assert.deepEqual(loeschen("12345", 1, 3), { wert: "145", pos: 1 });
  assert.deepEqual(loeschen("sin()", 4, 4), { wert: "", pos: 0 });
  assert.deepEqual(loeschen("2+sqrt()", 7, 7), { wert: "2+", pos: 2 });
  assert.deepEqual(loeschen("abc", 0, 0), { wert: "abc", pos: 0 });
  assert.deepEqual(loeschen("a😀", 3, 3), { wert: "a", pos: 1 });
});
test("Zahlenblock je Modus", () => {
  assert.equal(zahlenTasten("ganz").minus, null);
  assert.equal(zahlenTasten("ganz").dez, null);
  assert.ok(zahlenTasten("ganzvz").minus);
  assert.equal(zahlenTasten("ganzvz").dez, null);
  assert.equal(zahlenTasten("zahl").dez.text, ",");
  assert.equal(zahlenTasten("zahl", ".").dez.text, ".");
  assert.equal(zahlenTasten("zahl").bruch, null);
  assert.equal(zahlenTasten("bruch").bruch.text, "/");
  assert.equal(zahlenTasten("datum").dez.text, ".");
});
test("Anzeige: Handy alle Modi, Maus nur Formeln", () => {
  for (const m of MODI) assert.equal(zeigeAutomatisch(m, true), true);
  for (const m of MODI) assert.equal(zeigeAutomatisch(m, false), m === "formel");
  assert.equal(zeigeAutomatisch("text", true), false);
  assert.ok(istModus("formel") && !istModus("irgendwas"));
});
test("alle Zahlentasten passen zum erlaubten Zeichensatz des Modus", () => {
  for (const m of ["ganz", "ganzvz", "zahl", "bruch", "datum"]) {
    const t = zahlenTasten(m);
    for (const k of Object.values(t)) if (k) assert.match(k.text, ERLAUBT[m], `${m}: ${k.id}`);
  }
});
test("Formeltasten fügen nur Wörter ein, die der Term-Parser kennt; Tasten-IDs eindeutig je Ebene", () => {
  const gueltig = /^(?:[0-9]|[x+\-*/^(),=e.]|pi|sin\(\)|cos\(\)|tan\(\)|ln\(\)|log\(\)|sqrt\(\)|e\^\(\)|\^[23]|\^\(\)|1\/\(\)|[fg]\(x\)|f'\(x\))$/;
  for (const ebene of [FORMEL_HAUPT, FORMEL_FUNKTION]) {
    const ids = ebene.map((k) => k.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const k of ebene) { if (k.aktion) continue; assert.match(k.text, gueltig, k.id); if (k.zurueck) assert.ok(k.text.endsWith(")".repeat(k.zurueck))); }
    assert.ok(ebene.some((k) => k.aktion === "ok"));
    assert.ok(ebene.some((k) => k.aktion === "weg"));
  }
  const alle = [...FORMEL_HAUPT, ...FORMEL_FUNKTION].map((k) => k.text);
  for (const w of ["sin()", "f(x)", "^2", "^()", "sqrt()", "pi"]) assert.ok(alle.includes(w), w);
});
