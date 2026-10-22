/* Termeingabe Mittelstufe (src/termFeldMittel.js): Tasten → Baum → Text für den Formel-Parser */
import { test } from "node:test";
import assert from "node:assert/strict";
import { neuesModell, taste, alsText, tasteAus, TASTEN_MITTEL, ausKurzschrift, klammerInfo } from "../src/termFeldMittel.js";
import { parse, kompiliere } from "../src/formelEngine.js";

const tippe = (...t) => { const m = neuesModell(); t.flat().forEach((k) => taste(m, k)); return m; };
const zeichen = (s) => [...s];
const wert = (m, x) => kompiliere(parse(alsText(m).text))(x);

test("Klammer und Malpunkt: 3x(x + 2)", () => {
  const m = tippe(zeichen("3x(x+2)"));
  assert.equal(alsText(m).text, "3x(x+2)");
  assert.equal(wert(m, 2), 24);
});

test("x² hängt eine einfache Hochzahl an – ohne Klammer, damit die Formprüfung keine Klammer sieht", () => {
  const m = tippe(zeichen("(x+3)"), "x²");
  assert.equal(alsText(m).text, "(x+3)^2");
  const n = parse(alsText(m).text);
  assert.equal(n.k, "^"); assert.equal(n.b.k, "num"); assert.equal(n.a.k, "par");
});

test("xⁿ: Marke in der Hochzahl, ein Rechenzeichen beendet sie", () => {
  const m = tippe("x", "xⁿ", "9", "+", "1");
  assert.equal(alsText(m).text, "x^9+1");
  assert.equal(wert(m, 2), 513);
});

test("Vorzeichen am Anfang einer leeren Hochzahl bleibt drin", () => {
  const m = tippe("x", "xⁿ", "−", "3");
  assert.equal(alsText(m).text, "x^(-3)");
  assert.equal(wert(m, 2), 0.125);
});

test("Bruch nimmt den Operanden davor in den Zähler – eine ganze Klammer ohne die Klammern", () => {
  const m = tippe(zeichen("(x+2)"), "bruch", "x", "−", "3");
  assert.equal(alsText(m).text, "((x+2)/(x-3))");
  assert.equal(wert(m, 4), 6);
  const m2 = tippe("2", "x", "bruch", "4");
  assert.equal(alsText(m2).text, "((2x)/(4))");
  const m3 = tippe("1", "bruch", "x", "x²");
  assert.equal(alsText(m3).text, "((1)/(x^2))");
});

test("Bruch ohne Operanden davor: Marke im leeren Zähler, → wechselt in den Nenner und hinaus", () => {
  const m = tippe("bruch", "x", "→", "2", "→", "+", "1");
  assert.equal(alsText(m).text, "((x)/(2))+1");
});

test("Leere Felder werden mit Ort gemeldet", () => {
  const m = tippe("x", "bruch");
  const r = alsText(m);
  assert.equal(r.fehler, "nennerLeer");
  assert.equal(r.zeile, m.wurzel[0].nenner);
  assert.equal(alsText(tippe("x", "xⁿ")).fehler, "hochLeer");
  assert.equal(alsText(tippe("xⁿ", "2")).fehler, "basisFehlt");
  assert.equal(alsText(tippe("bruch", "→", "2")).fehler, "zaehlerLeer");
});

test("Löschen nie halb: leeres Klammerpaar ganz weg, Baustein erst betreten, leerer Baustein ganz weg", () => {
  const m = tippe("(", ")", "←", "⌫");
  assert.equal(m.wurzel.length, 0);
  const b = tippe("x", "bruch", "2", "→");            // x/2, Marke dahinter
  taste(b, "⌫");                                      // in den Nenner hinein, nichts gelöscht
  assert.equal(alsText(b).text, "((x)/(2))");
  taste(b, "⌫"); taste(b, "⌫");                       // 2 weg, dann vom Nennerbeginn zum Zählerende
  assert.equal(b.marke.zeile, b.wurzel[0].zaehler);
  taste(b, "⌫"); taste(b, "⌫");                       // x weg, dann leerer Bruch ganz weg
  assert.equal(b.wurzel.length, 0);
});

test("Klammern zählen: fehlende schließende und überzählige werden erkannt", () => {
  assert.deepEqual([...klammerInfo([..."(x+1"]).falsch], []);
  assert.equal(klammerInfo([..."(x+1"]).offen, 1);
  assert.deepEqual([...klammerInfo([..."x+1)"]).falsch], [3]);
});

test("Computertastatur: deutsche Gewohnheiten werden übersetzt", () => {
  assert.equal(tasteAus("-"), "−"); assert.equal(tasteAus("*"), "·"); assert.equal(tasteAus("/"), "bruch");
  assert.equal(tasteAus("."), ","); assert.equal(tasteAus("²"), "x²"); assert.equal(tasteAus("Backspace"), "⌫");
  assert.equal(tasteAus("e"), null); assert.equal(tasteAus("s"), null);
});

test("Nur Mittelstufe: keine Oberstufen-Tasten, einzige Variable ist x", () => {
  const alle = TASTEN_MITTEL.map(([t]) => t);
  for (const t of ["π", "e", "sin", "cos", "ln", "√", "y", "a", "b", "="]) assert.ok(!alle.includes(t), `Taste ${t} gehört nicht in die Mittelstufe`);
  assert.equal(alle.length, 24);
});

test("Kurzschrift baut denselben Baum wie das Tippen", () => {
  assert.equal(alsText(ausKurzschrift("frac{x^{2}-9}{x+3}")).text, "((x^2-9)/(x+3))");
  assert.equal(alsText(ausKurzschrift("4x(x-2)")).text, "4x(x-2)");
});
