import { test } from "node:test";
import assert from "node:assert/strict";
import { aufgabeAusText, ergebnisAlsEingabe, formelnAus, modusMoeglich, modusPrompt, musterLesen, musterPrompt, rueckmeldungLesen, wertText } from "../src/mathildaModus.js";
import { GENERATOREN, neueAufgabe, lies } from "../src/trainingDaten.js";

test("Modus nur für Rechenaufgaben, nicht für Auswahl", () => {
  assert.equal(modusMoeglich({ typ: "zahl", text: "Löse $3x = 6$.", loesung: ["$x = 2$"] }), true);
  assert.equal(modusMoeglich({ typ: "wahl", text: "Welche …", loesung: ["…"] }), false);
  assert.equal(modusMoeglich({ typ: "zahl", text: "x", loesung: [] }), false);
  assert.equal(modusMoeglich(null), false);
});

test("Jeder Rechen-Generator liefert eine Aufgabe für den Modus und eine ähnliche Aufgabe", () => {
  let n = 0;
  for (const g of GENERATOREN) {
    const a = neueAufgabe(g.id);
    if (a.typ === "wahl") continue;
    n++;
    assert.ok(modusMoeglich(a), `${g.id}: Modus fehlt`);
    const b = neueAufgabe(a.variante);
    assert.equal(b.variante, a.variante, `${g.id}: ähnliche Aufgabe vom selben Typ`);
    assert.ok(Array.isArray(b.loesung) && b.loesung.length > 0, `${g.id}: Musterlösung fehlt`);
    const p = modusPrompt(a);
    assert.ok(p.includes("AUFGABE (so steht sie in der App):") && p.includes("geheim"), `${g.id}: Prompt`);
    assert.ok(!p.includes("$"), `${g.id}: Prompt ohne TeX-Dollar`);
  }
  assert.ok(n > 30, `nur ${n} Rechen-Generatoren gefunden`);
});

test("Formeln aus dem Aufgabentext", () => {
  assert.deepEqual(formelnAus("Löse die Gleichung $3(x - 4) + 5 = -4$."), ["3(x - 4) + 5 = -4"]);
  assert.deepEqual(formelnAus("Hier ist $p$ gegeben."), []);
});

test("Richtiger Wert in deutscher Schreibweise", () => {
  assert.equal(wertText({ wert: -2.5 }), "−2,5");
  assert.equal(wertText({ wert: 1 / 3 }), "0,333333");
  assert.equal(wertText({ wert: 12, einheit: "cm" }), "12 cm");
});

test("Rückmeldung wird abgesichert", () => {
  const r = rueckmeldungLesen({ zeilen: [{ t: "3x − 12 + 5 = −4", s: "ok" }, { t: "3x = 3", s: "fehler" }, "x = 1"], ergebnis: "x = 1", stimmt: false,
    fehler: { zeile: 2, was: "Beim Rückwärtsrechnen fehlt ein Vorzeichen." }, hebel: [{ titel: "A6", text: "a" }, "b", "c"], papier: "kariert" });
  assert.equal(r.lesbar, true);
  assert.equal(r.zeilen.length, 3);
  assert.equal(r.zeilen[2].s, "ok");
  assert.equal(r.hebel.length, 2);
  assert.equal(r.fehler.zeile, 2);
  assert.equal(r.papier, "unklar");
  assert.equal(r.stimmt, false);
  assert.equal(rueckmeldungLesen(null).neuesFoto, true);
  assert.equal(rueckmeldungLesen({ neuesFoto: true, grund: "zu dunkel" }).grund, "zu dunkel");
  assert.equal(rueckmeldungLesen({ zeilen: [] }).neuesFoto, true);
  assert.equal(rueckmeldungLesen({ zeilen: ["x = 1"], fehler: { zeile: 9, was: "w" } }).fehler.zeile, null);
});

test("Ergebnis vom Blatt ins Antwortfeld", () => {
  assert.equal(ergebnisAlsEingabe("x = 4"), "4");
  assert.equal(ergebnisAlsEingabe("x = −2,5"), "−2,5");
  assert.equal(ergebnisAlsEingabe("L = {7}"), "7");
  assert.equal(ergebnisAlsEingabe("x = 3/4"), "3/4");
  assert.equal(ergebnisAlsEingabe("12 cm"), "12");
  assert.equal(ergebnisAlsEingabe("x₁ = 2, x₂ = −5"), null);
  assert.equal(ergebnisAlsEingabe(""), null);
  for (const t of ["4", "−2,5", "3/4"]) assert.notEqual(lies(t), null, `${t} wird vom Antwortfeld gelesen`);
});

test("Trainer ohne Generator: Aufgabe aus der Karte, Lösung prüft Mathilda selbst", () => {
  const a = aufgabeAusText("  Berechne\n den Umfang   eines Kreises mit r = 3 cm.  ");
  assert.equal(a.text, "Berechne den Umfang eines Kreises mit r = 3 cm.");
  const p = modusPrompt(a);
  assert.ok(p.includes("Umfang eines Kreises"));
  assert.ok(p.includes("nicht hinterlegt") && p.includes("Verrate deine Lösung nicht"));
  assert.ok(modusPrompt(aufgabeAusText("")).includes("oben auf dem Blatt"));
  assert.ok(musterPrompt(a).includes("nicht lösen"));
});

test("Musterlösung von Mathilda wird abgesichert", () => {
  const m = musterLesen({ aufgabe: "Löse $2x + 3 = 11$.", zeilen: ["$2x + 3 = 11$", "$2x = 8$"], ergebnis: "$x = 4$" });
  assert.deepEqual(m.loesung, ["$2x + 3 = 11$", "$2x = 8$", "$x = 4$"]);
  assert.equal(musterLesen({ aufgabe: "x", zeilen: ["$2x = 8"] }).loesung[0], "2x = 8");   // abgeschnittene Formel ohne $
  assert.equal(musterLesen({ zeilen: ["a"] }), null);
  assert.equal(musterLesen(null), null);
  assert.equal(musterLesen({ aufgabe: "a", zeilen: [] }), null);
});
