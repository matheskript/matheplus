/* Klausurbriefkasten: Prompt, Datenschutz-Filter, Normalisierung, Meldung, Profil (src/klausurBriefkasten.js) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ANALYSE_REGELN, BUNDESLAENDER, FREIGABE, SCHULARTEN_BK, analyseLesen, analysePrompt, angabenFehler, freigabeKomplett,
  kapitelZurKlasse, klassenFuer, meldungBauen, meldungGroesse, ohnePersonen, ohneZahlenwerte, profilAus, schuleSaeubern,
} from "../src/klausurBriefkasten.js";

const ANTWORT = {
  lesbar: true, art: "klassenarbeit", kapitel: "quad", thema: "Quadratische Funktionen bei Frau Müller", schwerpunkte: ["Scheitelform", "f(x) = 2x^2 - 4"],
  dauer_min: 45, gesamtpunkte: 40, hilfsmittel: ["WTR", "Taschenrechner", "keine"],
  aufgaben: [
    { nr: "1a", typ: "Scheitelpunkt bestimmen", operator: "Bestimme", inhalt: "Bestimme den Scheitel von f(x) = x^2 - 6x + 5 per Ergänzung", kontext: "innermathematisch", punkte: 4, anforderung: "i", darstellung: ["term", "foto"], ohne_hilfsmittel: true },
    { nr: "2", typ: "Wurfparabel deuten", operator: "Berechne", inhalt: "Maximale Höhe eines Balls bei x = 3,5 berechnen", kontext: "Wurf", punkte: "6", anforderung: "II", darstellung: ["graph"] },
    { nr: "3", typ: "", inhalt: "" },
  ],
  niveau: 3.4, besonderheiten: ["Beweis am Ende"], personenbezug: ["name", "note", "irgendwas"],
};

test("Prompt verlangt Struktur statt Abschrift und nennt die Kapitel der Klasse", () => {
  assert.match(ANALYSE_REGELN, /KEINE Abschrift/);
  assert.match(ANALYSE_REGELN, /KEINE Namen/);
  const p = analysePrompt({ seiten: 2, bundesland: "bw", schulart: "g9", klasse: 9, kapitel: "quad" });
  assert.match(p, /Baden-Württemberg/);
  assert.match(p, /quad: Quadratische Funktionen/);
  assert.match(p, /2 Fotos/);
  assert.match(p, /"personenbezug"/);
});

test("Auswahllisten: 16 Länder, Klassen je Schulart, Kapitel je Klasse", () => {
  assert.equal(BUNDESLAENDER.length, 16);
  assert.deepEqual(klassenFuer("realschule"), [5, 6, 7, 8, 9, 10]);
  assert.equal(klassenFuer("g8").at(-1), 12);
  assert.deepEqual(klassenFuer("berufl"), [11, 12, 13]);
  assert.ok(SCHULARTEN_BK.length >= 6);
  assert.ok(kapitelZurKlasse("g9", 9).some((k) => k.id === "quad"));
  assert.ok(kapitelZurKlasse("g9", 5).length > 5);
  assert.ok(kapitelZurKlasse("realschule", 8).length > 0);   // fällt auf G9 zurück
});

test("Personenbezug wird aus Freitext entfernt", () => {
  assert.equal(ohnePersonen("Klassenarbeit bei Herr Schmidt"), "Klassenarbeit");
  assert.equal(ohnePersonen("Herr Schmidt korrigiert streng"), "Lehrkraft korrigiert streng");
  assert.equal(ohnePersonen("Frau Dr. Meier-Lang"), "Lehrkraft");
  assert.doesNotMatch(ohnePersonen("Name: Max Mustermann, Thema Parabeln"), /Mustermann/);
  assert.doesNotMatch(ohnePersonen("Note 2- gut gemacht"), /2-/);
  assert.doesNotMatch(ohnePersonen("Mail an a.b@schule.de"), /@/);
  assert.equal(ohnePersonen("Ellenrieder-Gymnasium Konstanz"), "Schule Konstanz");
  assert.equal(ohnePersonen("Gymnasium am Seerhein"), "Schule");
  assert.equal(ohnePersonen("Nullstellen durch Ausklammern bestimmen"), "Nullstellen durch Ausklammern bestimmen");
});

test("Zahlenwerte und Terme verschwinden aus Beschreibungen", () => {
  assert.equal(ohneZahlenwerte("Bestimme den Scheitel von f(x) = x^2 - 6x + 5 per Ergänzung"), "Bestimme den Scheitel per Ergänzung");
  assert.equal(ohneZahlenwerte("Höhe bei x = 3,5 berechnen"), "Höhe berechnen");
  assert.equal(ohneZahlenwerte("Gerade durch (2|3) und (4|-1)"), "Gerade");
  assert.equal(ohneZahlenwerte("Maximale Höhe und Wurfweite bei x = 3,5 deuten"), "Maximale Höhe und Wurfweite deuten");
  assert.equal(ohneZahlenwerte("Funktion 3. Grades"), "Funktion 3. Grades");
});

test("Antwort wird auf erlaubte, bereinigte Felder reduziert", () => {
  const a = analyseLesen(ANTWORT, { kapitelErlaubt: ["quad", "lgs2"] });
  assert.equal(a.lesbar, true);
  assert.equal(a.kapitel, "quad");
  assert.doesNotMatch(a.thema, /Müller|Lehrkraft/);
  assert.deepEqual(a.hilfsmittel, ["wtr", "keine"]);
  assert.equal(a.aufgaben.length, 2);                       // leere Aufgabe fällt weg
  assert.equal(a.aufgaben[0].anforderung, "I");
  assert.deepEqual(a.aufgaben[0].darstellung, ["term"]);
  assert.equal(a.aufgaben[0].ohneHilfsmittel, true);
  assert.doesNotMatch(a.aufgaben[0].inhalt, /\d/);
  assert.doesNotMatch(a.aufgaben[1].inhalt, /3,5/);
  assert.equal(a.aufgaben[1].punkte, 6);
  assert.equal(a.niveau, 3);
  assert.deepEqual(a.personenbezug, ["name", "note"]);
  assert.ok(!a.schwerpunkte.some((s) => /2x/.test(s)));
  assert.equal(analyseLesen(ANTWORT, { kapitelErlaubt: ["lgs2"] }).kapitel, null);
});

test("Unlesbar oder leer → Rückfrage", () => {
  const a = analyseLesen({ lesbar: false, rueckfrage: "Bitte schärfer fotografieren." });
  assert.equal(a.lesbar, false);
  assert.match(a.rueckfrage, /schärfer/);
  assert.equal(analyseLesen(null).lesbar, false);
  assert.equal(analyseLesen({ lesbar: true, aufgaben: [] }).lesbar, false);
});

test("Freigabe: alle drei Häkchen nötig", () => {
  assert.equal(FREIGABE.length, 3);
  assert.equal(freigabeKomplett({ zurueck: true, alle: true }), false);
  assert.equal(freigabeKomplett({ zurueck: true, alle: true, nurAufgaben: true }), true);
});

test("Angaben prüfen", () => {
  const heute = new Date(2026, 9, 18);
  assert.deepEqual(angabenFehler({ bundesland: "bw", schulart: "g9", klasse: 9 }, heute), []);
  assert.deepEqual(angabenFehler({ bundesland: "xx", schulart: "g9", klasse: 9 }, heute), ["bundesland"]);
  assert.deepEqual(angabenFehler({ bundesland: "bw", schulart: "realschule", klasse: 12 }, heute), ["klasse"]);
  assert.deepEqual(angabenFehler({ bundesland: "bw", schulart: "g9", klasse: 9, monat: "2026-11" }, heute), ["monat"]);
  assert.deepEqual(angabenFehler({ bundesland: "bw", schulart: "g9", klasse: 9, monat: "2026-10" }, heute), []);
});

test("Gespeicherte Meldung enthält nur Struktur – kein Foto, keine Abschrift, kein Personenbezug", () => {
  const a = analyseLesen(ANTWORT);
  const m = meldungBauen({ angaben: { bundesland: "bw", schulart: "g9", klasse: "9", schule: "Ellenrieder-Gymnasium Konstanz www.x.de", monat: "2026-10" }, analyse: a });
  assert.equal(m.klasse, 9);
  assert.equal(m.kapitel, "quad");
  assert.doesNotMatch(m.schule, /www/);
  const json = JSON.stringify(m);
  assert.doesNotMatch(json, /base64|b64|abschrift|personenbezug|Müller/i);
  assert.ok(meldungGroesse(m) < 24000);
  assert.equal(schuleSaeubern("  a@b.de Gymnasium  X "), "Gymnasium X");
});

test("Profil aus vielen Meldungen", () => {
  const a = analyseLesen(ANTWORT);
  const m1 = meldungBauen({ angaben: { bundesland: "bw", schulart: "g9", klasse: 9, schule: "A" }, analyse: a });
  const m2 = meldungBauen({ angaben: { bundesland: "bw", schulart: "g9", klasse: 9, schule: "B" }, analyse: { ...a, dauerMin: 90 } });
  const m3 = meldungBauen({ angaben: { bundesland: "by", schulart: "g9", klasse: 9 }, analyse: a });
  const p = profilAus([m1, m2, m3], { bundesland: "bw", klasse: 9 });
  assert.equal(p.anzahl, 2);
  assert.equal(p.schulen, 2);
  assert.equal(p.dauerMin, 67.5);
  assert.equal(p.anforderung.I + p.anforderung.II + p.anforderung.III, 100);
  assert.equal(p.anteilSachkontext, 50);
  assert.equal(p.kontexte[0].wert, "Wurf");
  assert.equal(profilAus([], {}).anzahl, 0);
});

test("Die Logik bleibt rein (kein React, kein Speicher)", () => {
  const src = readFileSync(new URL("../src/klausurBriefkasten.js", import.meta.url), "utf8");
  assert.doesNotMatch(src, /from "react"|localStorage|fetch\(/);
});
