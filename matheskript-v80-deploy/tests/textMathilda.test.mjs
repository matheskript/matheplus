/* Mathilda übersetzt Textaufgaben: Prompt, Auswertung der Antwort, Markierungen (src/textMathilda.js) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { BEISPIEL_TEXT, UEBERSETZEN_REGELN, chatKontext, funktionsnamen, markierungen, nichtGefunden, uebersetzenPrompt, uebersetzungLesen, werkzeugFuerThema } from "../src/textMathilda.js";
import { pruefeEingabe } from "../src/bedingungen.js";

const ANTWORT = {
  lesbar: true, rueckfrage: null,
  abschrift: "Der Graph einer ganzrationalen Funktion dritten Grades hat im Punkt $H(-2|4)$ einen Hochpunkt und in W(0|2) einen  Wendepunkt. Bestimme die Funktionsgleichung.",
  unsicher: [], weitere: [], thema: "steckbrief", klasse: "11–13", gesucht: "Die Funktionsgleichung von f.",
  ansatz: { tex: "f(x) = ax^3 + bx^2 + cx + d", unbekannte: ["a", "b", "c", "d"], warum: "Grad 3, keine Symmetrie." },
  stellen: [
    { textstelle: "im Punkt H(-2|4) einen Hochpunkt", bedeutung: "Bei x = −2 liegt der höchste Punkt mit y = 4.", bedingungen: [{ tex: "f(-2) = 4", text: "f(-2) = 4" }, { tex: "f'(-2) = 0", text: "f'(-2) = 0" }], warum: "Punkt auf dem Graphen, waagrechte Tangente.", falle: "f(4) = −2 vertauscht." },
    { textstelle: "in W(0|2) einen wendepunkt", bedeutung: "Bei x = 0 wechselt die Krümmung.", bedingungen: [{ tex: "f(0) = 2", text: "f(0) = 2" }, { tex: "f''(0) = 0", text: "f''(0) = 0" }], warum: "Punkt und Krümmungswechsel.", falle: null },
    { textstelle: "", bedingungen: [{ tex: "x" }] },
  ],
  zaehlen: { unbekannte: 4, bedingungen: 4, kommentar: "Passt." },
  kontext: ["Bestimme die Funktionsgleichung."], naechster_schritt: "Bedingungen in den Ansatz einsetzen.", kontrollfrage: "Warum ist f''(−2) < 0 keine Bedingung?",
};

test("Prompt verlangt Übersetzung ohne Lösung und das JSON-Schema", () => {
  const p = uebersetzenPrompt({ foto: true, teilaufgabe: "3b" });
  assert.match(p, /„3b“/);
  assert.match(p, /"stellen"/);
  assert.match(p, /WÖRTLICHES/);
  assert.match(UEBERSETZEN_REGELN, /LÖST die Aufgabe NICHT/);
  const t = uebersetzenPrompt({ text: BEISPIEL_TEXT });
  assert.ok(t.includes(BEISPIEL_TEXT));
});

test("Antwort wird bereinigt: leere Stellen fallen weg, Zählung aus den Bedingungen", () => {
  const e = uebersetzungLesen(ANTWORT);
  assert.equal(e.lesbar, true);
  assert.equal(e.stellen.length, 2);
  assert.equal(e.zaehlen.bedingungen, 4);
  assert.equal(e.zaehlen.unbekannte, 4);
  assert.equal(e.thema, "steckbrief");
  assert.equal(e.naechster, "Bedingungen in den Ansatz einsetzen.");
  const kaputt = uebersetzungLesen({ lesbar: false });
  assert.equal(kaputt.lesbar, false);
  assert.ok(kaputt.rueckfrage.length > 10);
  assert.equal(uebersetzungLesen(null).lesbar, false);
  assert.equal(uebersetzungLesen({ abschrift: "x", thema: "quatsch" }).thema, "sonstiges");
});

test("Textstellen werden trotz $, Leerraum und Großschreibung markiert", () => {
  const e = uebersetzungLesen(ANTWORT);
  const teile = markierungen(e.abschrift, e.stellen);
  assert.equal(teile.map((t) => t.t).join(""), e.abschrift);
  const markiert = teile.filter((t) => t.nr);
  assert.equal(markiert.length, 2);
  assert.match(markiert[0].t, /H\(-2\|4\)\$ einen Hochpunkt/);
  assert.match(markiert[1].t, /W\(0\|2\) einen {2}Wendepunkt/);
  assert.deepEqual(nichtGefunden(e.abschrift, [...e.stellen, { textstelle: "steht nicht da" }]), [3]);
});

test("Getippte Versuche lassen sich mit Mathildas Bedingungen prüfen", () => {
  const e = uebersetzungLesen(ANTWORT);
  const ziele = e.stellen[0].bedingungen.map((b) => ({ c: b.text }));
  assert.equal(pruefeEingabe("4 = f(-2); f′(−2) = 0", ziele, { funktionen: funktionsnamen(e) }).ok, true);
  assert.equal(pruefeEingabe("f(4) = -2; f'(-2) = 0", ziele, { funktionen: funktionsnamen(e) }).ok, false);
});

test("Weiterleitung und Chat-Kontext", () => {
  assert.equal(werkzeugFuerThema("steckbrief").ansicht, "steckbrief");
  assert.equal(werkzeugFuerThema("lgs").ansicht, "lgs");
  assert.equal(werkzeugFuerThema("sonstiges"), null);
  const k = chatKontext(uebersetzungLesen(ANTWORT), { 0: "f(-2)=4" });
  assert.match(k.text, /Textaufgabe übersetzen/);
  assert.equal(k.regeln.length, 2);
  assert.match(k.eingabe, /Stelle 1: f\(-2\)=4/);
});
