/* Differenzenquotient (src/diffqKern.js): Variablen in der Formel-Engine, Musterwege aller Funktionsarten
   stimmen numerisch Zeile für Zeile, die Prüfung nimmt richtige Zeilen an und erklärt typische Fehler. */
import test from "node:test";
import assert from "node:assert/strict";
import { parse, kompiliere, alsTex, hatVar, ableitung } from "../src/formelEngine.js";
import {
  ARTEN, aufgabeAus, fxhWeg, musterweg, neueAufgabe, pruefeEinsetzen, pruefeFxh, pruefeZeile, naechsterText, stelleZu, stelleOk, polyText, gliederText, bruchText, alsEingabe,
} from "../src/diffqKern.js";

test("Formel-Engine: h ist eine Variable – lesen, setzen, auswerten, ableiten", () => {
  const b = parse("x^2+2xh+h^2");
  assert.ok(b && hatVar(b, "h"));
  assert.equal(kompiliere(b)(1.5, { h: 0.5 }), 4);
  assert.equal(alsTex(b), "x^{2} + 2xh + h^{2}");
  assert.equal(alsTex(parse("2x*cos(x)")), "2x \\cos(x)");          // Funktion dahinter behält den Abstand
  assert.equal(alsTex(ableitung(parse("x^2+2xh"))), "2x + 2h");    // h gilt beim Ableiten nach x als Konstante
  assert.ok(Number.isNaN(kompiliere(parse("h"))(1)));               // ohne Wert: NaN, kein Absturz
  assert.equal(parse("q"), null);                                   // nicht freigegebene Buchstaben bleiben unlesbar
});

test("Texte: Polynome mit Basis, Glieder, Brüche, Eingabetext aus Bäumen", () => {
  assert.equal(polyText([-4, 1, -3, 2]), "2x^3-3x^2+x-4");
  assert.equal(polyText([-4, 1, -3, 2], "(x+h)"), "2(x+h)^3-3(x+h)^2+(x+h)-4");
  assert.equal(polyText([0.5, 0, 1]), "x^2+0,5");
  assert.equal(gliederText([{ c: 1, i: 0, j: 2 }, { c: 2, i: 1, j: 1 }, { c: -1, i: 0, j: 0 }]), "-1+2xh+h^2");
  assert.equal(bruchText(-2, 4), "-1/2");
  assert.equal(bruchText(6, 3), "2");
  assert.equal(alsEingabe(parse("2x*sin(x)+1/(x+2)")), "2x*sin(x)+1/(x+2)");
});

test("Aufgaben aller Arten und Stufen lassen sich erzeugen, Stelle liegt im Definitionsbereich", () => {
  for (const a of ARTEN) for (const st of [1, 2, 3]) for (let i = 0; i < 20; i++) {
    const auf = neueAufgabe(a.id, st);
    assert.ok(auf && auf.fn && auf.tex, `${a.id}/${st}`);
    assert.ok(["poly", "bruch", "wurzel"].includes(auf.familie), `${a.id}: ${auf.familie}`);
    const x0 = stelleZu(auf);
    assert.ok(stelleOk(auf, x0), `${a.id}: Stelle ${x0} bei ${auf.f}`);
  }
  assert.equal(aufgabeAus("x^2*sin(x)").familie, "frei");
  assert.equal(aufgabeAus("x^2+h"), null);   // h ist keine Funktionsvariable
});

test("Musterweg: jede Zeile ist zur Aufgabe gleichwertig – allgemein und an einer Stelle", () => {
  const faelle = ["x^2-1", "2x^3-3x^2+x-4", "x^4", "-x^5+2x^2+2x", "3x+2", "0,5x^2-4", "1/x", "2/(x-3)", "-1/(x+2)", "sqrt(x)", "sqrt(x+2)", "2sqrt(x)", "-sqrt(x+5)", "x^2*sin(x)", "e^x"];
  for (const f of faelle) {
    const auf = aufgabeAus(f);
    for (const x0 of [null, stelleZu(auf), stelleZu(auf)]) {
      const mw = musterweg(auf, x0);
      assert.equal(mw[0].art, "einsetzen", f);
      assert.equal(mw[mw.length - 1].art, "limes", f);
      const e = pruefeEinsetzen(auf, x0, mw[0].a, mw[0].b);
      assert.ok(e.a.ok && e.b.ok, `${f} (x0=${x0}): Einsetzen ${e.a.hinweis} ${e.b.hinweis}`);
      for (const z of mw.slice(1)) {
        const r = pruefeZeile(auf, x0, z.art, z.text);
        assert.ok(r.ok, `${f} (x0=${x0}): ${z.art} „${z.text}“ – ${r.hinweis}`);
      }
      // Reihenfolge der Zeilenarten: bruch* → frei → limes (oder direkt limes bei freien Funktionen)
      const arten = mw.slice(1).map((z) => z.art).join(" ");
      assert.ok(/^(bruch )*(frei )?limes$/.test(arten), `${f}: ${arten}`);
    }
  }
  // Konkrete Wege wie von Hand
  const mw = musterweg(aufgabeAus("x^2-1"), null).map((z) => (z.art === "einsetzen" ? `${z.a} | ${z.b}` : z.text));
  assert.deepEqual(mw, ["(x+h)^2-1 | x^2-1", "x^2+2xh+h^2-1-(x^2-1)", "2xh+h^2", "h(2x+h)", "2x+h", "2x"]);
  const st = musterweg(aufgabeAus("x^2-1"), 3).map((z) => (z.art === "einsetzen" ? `${z.a} | ${z.b}` : z.text));
  assert.deepEqual(st, ["(3+h)^2-1 | 8", "8+6h+h^2-8", "6h+h^2", "h(6+h)", "6+h", "6"]);
  assert.deepEqual(musterweg(aufgabeAus("1/(x+2)"), 1).map((z) => z.text || z.b), ["1/3", "(3-(3+h))/(3(3+h))", "-h/(3(3+h))", "-1/(3(3+h))", "-1/9"]);
  assert.equal(musterweg(aufgabeAus("sqrt(x+2)"), 2).pop().text, "1/4");
});

test("Prüfung: gleichwertige Schreibweisen zählen, typische Fehler bekommen ihren Hinweis", () => {
  const auf = aufgabeAus("x^2-1");
  // Einsetzen
  assert.ok(pruefeEinsetzen(auf, null, "x^2+2xh+h^2-1", "x^2-1").a.ok);                 // schon ausmultipliziert
  assert.match(pruefeEinsetzen(auf, null, "x^2+h^2-1", "x^2-1").a.hinweis, /gemischte Glied/);
  assert.match(pruefeEinsetzen(auf, null, "x^2-1", "x^2-1").a.hinweis, /Das ist f\(x\)/);
  assert.match(pruefeEinsetzen(auf, null, "x^2-1+h", "x^2-1").a.hinweis, /in die Klammer/);
  assert.match(pruefeEinsetzen(auf, null, "(x+h)^2-1", "(x+h)^2-1").b.hinweis, /ohne h/);
  assert.match(pruefeEinsetzen(auf, null, "(x+h)^2-1", "").b.hinweis, /leer/);
  assert.match(pruefeEinsetzen(auf, null, "(x+h)^2-", "x^2-1").a.hinweis, /vollständig/);
  // Bruch-Zeilen
  assert.ok(pruefeZeile(auf, null, "bruch", "(x+h)^2-1-(x^2-1)").ok);
  assert.ok(pruefeZeile(auf, null, "bruch", "h(2x+h)").ok);
  assert.match(pruefeZeile(auf, null, "bruch", "x^2-1-(x+h)^2+1").hinweis, /Vorzeichen/);
  assert.match(pruefeZeile(auf, null, "bruch", "(2xh+h^2)/h").hinweis, /schon durch h geteilt/);
  assert.match(pruefeZeile(auf, null, "bruch", "(x+h)^2-1").hinweis, /fehlt das − f\(x\)/);
  assert.match(pruefeZeile(auf, null, "bruch", "2xh").hinweis, /liefert deine Zeile/);
  // Frei
  assert.ok(pruefeZeile(auf, null, "frei", "2x+h").ok);
  assert.match(pruefeZeile(auf, null, "frei", "(2xh+h^2)/h").hinweis, /noch im Nenner/);
  assert.match(pruefeZeile(auf, null, "frei", "2xh+h^2").hinweis, /Nenner h vergessen/);
  assert.match(pruefeZeile(auf, null, "frei", "2x").hinweis, /schon das Ergebnis/);
  // Grenzwert
  assert.ok(pruefeZeile(auf, null, "limes", "2x").ok);
  assert.ok(pruefeZeile(auf, null, "limes", "x+x").ok);
  assert.match(pruefeZeile(auf, null, "limes", "2x+h").hinweis, /kein h mehr/);
  assert.match(pruefeZeile(auf, null, "limes", "x^2-1").hinweis, /f\(x\) selbst/);
  assert.match(pruefeZeile(auf, null, "limes", "-2x").hinweis, /Vorzeichen/);
  // An der Stelle 3: kein x, Ergebnis eine Zahl, gerundet erlaubt
  assert.match(pruefeZeile(auf, 3, "bruch", "2xh+h^2").hinweis, /kein x mehr/);
  assert.ok(pruefeZeile(auf, 3, "bruch", "6h+h^2").ok);
  assert.ok(pruefeZeile(auf, 3, "limes", "6").ok);
  assert.ok(pruefeZeile(auf, 3, "limes", "12/2").ok);
  assert.match(pruefeZeile(auf, 3, "limes", "8").hinweis, /Funktionswert/);
  assert.match(pruefeEinsetzen(auf, 3, "(3+h)^2-1", "8+h").b.hinweis, /kein h/);
  // Wurzel: Definitionsbereich stört die Prüfung nicht
  const w = aufgabeAus("sqrt(x-3)");
  assert.ok(pruefeZeile(w, null, "frei", "1/(sqrt(x-3+h)+sqrt(x-3))").ok);
  assert.ok(pruefeZeile(w, null, "limes", "1/(2sqrt(x-3))").ok);
});

test("Nächste Zeile übernimmt die Zeile darüber", () => {
  assert.equal(naechsterText({ art: "einsetzen", a: "(x+h)^2-1", b: "x^2-1" }), "(x+h)^2-1-(x^2-1)");
  assert.equal(naechsterText({ art: "einsetzen", a: "(3+h)^2", b: "9" }), "(3+h)^2-9");
  assert.equal(naechsterText({ art: "einsetzen", a: "3(-2+h)+2", b: "-4" }), "3(-2+h)+2-(-4)");
  assert.equal(naechsterText({ art: "bruch", text: "2xh+h^2" }), "2xh+h^2");
});

test("Vorbereitung f(x+h): Musterweg und Prüfung", () => {
  assert.deepEqual(fxhWeg(aufgabeAus("x")), ["(x+h)", "x+h"]);
  assert.deepEqual(fxhWeg(aufgabeAus("x^2")), ["(x+h)^2", "x^2+2xh+h^2"]);
  assert.deepEqual(fxhWeg(aufgabeAus("x^2-1"), 3), ["(3+h)^2-1", "8+6h+h^2"]);
  assert.deepEqual(fxhWeg(aufgabeAus("1/(x+2)")), ["1/(x+h+2)"]);
  assert.deepEqual(fxhWeg(aufgabeAus("sqrt(x)"), 2), ["sqrt(2+h)"]);
  for (const f of ["x", "x^2", "2x^3-x", "1/(x+2)", "sqrt(x+1)", "x*sin(x)"]) {
    const auf = aufgabeAus(f);
    for (const x0 of [null, stelleZu(auf)]) for (const t of fxhWeg(auf, x0)) assert.ok(pruefeFxh(auf, x0, t).ok, `${f} (x0=${x0}): ${t}`);
  }
  const a = aufgabeAus("x^2");
  assert.ok(pruefeFxh(a, null, "x^2+2xh+h^2").ok && pruefeFxh(a, null, "(x+h)(x+h)").ok);
  assert.match(pruefeFxh(a, null, "x^2").hinweis, /f\(x\) selbst/);
  assert.match(pruefeFxh(a, null, "x^2+h^2").hinweis, /gemischte Glied/);
  assert.match(pruefeFxh(a, null, "x^2+h").hinweis, /in die Klammer/);
  assert.match(pruefeFxh(a, 2, "(x+h)^2").hinweis, /kein x mehr/);
  assert.match(pruefeFxh(a, null, "").hinweis, /leer/);
});
