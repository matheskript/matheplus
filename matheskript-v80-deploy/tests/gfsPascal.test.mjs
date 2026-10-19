import { test } from "node:test";
import assert from "node:assert/strict";
import { binom, fakultaet, zeile, darstellungen, aufgabe, pruefe, rechenweg, ARTEN, KOLLOQUIUM, GLIEDERUNG } from "../src/gfsPascal.js";

test("Binomialkoeffizienten stimmen mit der Formel überein", () => {
  for (let n = 0; n <= 15; n++) for (let k = 0; k <= n; k++) {
    assert.equal(binom(n, k), fakultaet(n) / (fakultaet(k) * fakultaet(n - k)), `${n} über ${k}`);
  }
  assert.equal(binom(14, 7), 3432);
  assert.deepEqual(zeile(5), [1, 5, 10, 10, 5, 1]);
});

test("Pascal-Regel, Symmetrie und Zeilensumme", () => {
  for (let n = 1; n <= 15; n++) {
    for (let k = 1; k <= n - 1; k++) assert.equal(binom(n, k), binom(n - 1, k - 1) + binom(n - 1, k));
    for (let k = 0; k <= n; k++) assert.equal(binom(n, k), binom(n, n - k));
    assert.equal(zeile(n).reduce((a, b) => a + b, 0), 2 ** n);
  }
});

test("Darstellungen: 10 = (5 über 2) = (5 über 3), 3432 = (14 über 7)", () => {
  assert.deepEqual(darstellungen(10), [[5, 2], [5, 3]]);
  assert.deepEqual(darstellungen(3432), [[14, 7]]);
  assert.deepEqual(darstellungen(120), [[10, 3], [10, 7], [16, 2], [16, 14]]);
});

test("Erzeugte Aufgaben sind lösbar und werden richtig geprüft", () => {
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) for (let i = 0; i < 200; i++) {
    const a = aufgabe(id, s);
    if (id === "rueckwaerts") {
      assert.ok(a.loesungen.length > 0);
      for (const [n, k] of a.loesungen) assert.equal(pruefe(a, { n: String(n), k: String(k) }), "ok");
      assert.equal(pruefe(a, { n: String(a.x), k: "1" }), "rand");
    } else {
      assert.equal(pruefe(a, String(a.soll)), "ok");
      assert.equal(pruefe(a, String(a.soll + 1)), "nein");
      assert.equal(pruefe(a, "abc"), "unlesbar");
    }
    const weg = rechenweg(a);
    assert.ok(weg.length > 0 && weg.every((z) => typeof z === "string" && z.length));
    assert.ok(weg.every((z) => !/\^\{1\}|\^\{0\}/.test(z)), "keine Hochzahl 0 oder 1: " + weg.join(" | "));
  }
});

test("Rechenweg endet mit dem richtigen Wert", () => {
  const a = { art: "berechnen", n: 10, k: 7, soll: 120 };
  const weg = rechenweg(a);
  assert.match(weg[0], /Symmetrie/);
  assert.ok(weg.some((z) => z.endsWith("= 120")));
  const b = { art: "binomisch", n: 5, k: 2, c: 2, soll: 40 };
  assert.ok(rechenweg(b).at(-1).endsWith("= 40"));
});

test("GFS-Daten vollständig", () => {
  assert.ok(KOLLOQUIUM.length >= 8 && KOLLOQUIUM.every((q) => q.frage.endsWith("?") && q.antwort.length > 40));
  assert.equal(GLIEDERUNG.length, 5);
});
