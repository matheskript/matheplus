import React, { useState, useRef } from "react";
import { C, ganz, ohneNull, zuf } from "./base1.jsx";
import { W, WEG_TYPEN } from "./base2.jsx";
import { ABL_TYPEN } from "./base2.jsx";
import { FR } from "./funcRegistry.jsx";

/* Wer baut auf wem auf — die umgekehrte Richtung des Graphen. */

export function alleVoraussetzungen(id, seen = new Set()) {
  (KOMP[id]?.voraus || []).forEach((v) => {
    if (!seen.has(v)) { seen.add(v); alleVoraussetzungen(v, seen); }
  });
  return seen;
}


export function alleNachfolger(id, seen = new Set()) {
  (NACHFOLGER[id] || []).forEach((v) => {
    if (!seen.has(v)) { seen.add(v); alleNachfolger(v, seen); }
  });
  return seen;
}


/* Einheitliche Aufgabenform: frage, loesung, art (zahl oder term),
   optional praefix, zeig (gesetzte Lösung) und weg (Schritte für die Beispiele). */

export function ausAbleitungstyp(typId, stufen) {
  return () => {
    const typ = ABL_TYPEN.find((t) => t.id === typId);
    const a = typ.mach(zuf(stufen));
    return { frage: `Leite ab: $f(x) = ${a.tex}$`, praefix: "f′(x) =", loesung: a.loesung, zeig: a.zeig,
      art: "term", weg: a.weg || [], fallen: a.fallen, f: a.f };
  };
}


export const LINIEN = [
  { id: "A1", bereich: "A", name: "Zahlen und Zahlbereiche", kurz: "A1", farbe: "#1C1C1C",
    satz: "Jeder neue Zahlbereich entsteht, weil eine Rechnung rückwärts nicht aufging." },
  { id: "A2", bereich: "A", name: "Terme als Werkzeug", kurz: "A2", farbe: "#B8860B",
    satz: "Das Handwerk, das jede Gleichung braucht: umformen, ausklammern, faktorisieren." },
  { id: "A3", bereich: "A", name: "Die Leiter der Umkehrungen", kurz: "A3", farbe: "#B30000",
    satz: "Jede Sprosse bringt eine Rechenart, ihre Umkehrung und die Gleichung, die sie löst." },
  { id: "A4", bereich: "A", name: "Mehrere Unbekannte", kurz: "A4", farbe: "#4A4A4A",
    satz: "Mehr Unbekannte, mehr Gleichungen — und ein System, das sie auflöst." },
  { id: "B1", bereich: "B", name: "Funktionen verstehen", kurz: "B1", farbe: "#6B6B6B",
    satz: "Situation, Tabelle, Graph und Term sind vier Ansichten derselben Sache." },
  { id: "B2", bereich: "B", name: "Funktionsfamilien", kurz: "B2", farbe: "#1C1C1C",
    satz: "Jede Familie hat ihren Charakter — wer ihn kennt, erkennt den Graphen am Term." },
  { id: "B3", bereich: "B", name: "Funktionen verwandeln", kurz: "B3", farbe: "#DD0000",
    satz: "Verschieben, strecken, spiegeln: eine Idee, die fünf Jahre lang wiederkommt." },
  { id: "B4", bereich: "B", name: "Änderung und Steigung", kurz: "B4", farbe: "#B30000",
    satz: "Vom Steigungsdreieck der Geraden bis zur Ableitung jeder Kurve." },
  { id: "B5", bereich: "B", name: "Graphen untersuchen", kurz: "B5", farbe: "#4A4A4A",
    satz: "Nullstellen, Extrema, Wendepunkte — alles Gleichungen aus der Algebra." },
  { id: "B6", bereich: "B", name: "Ansammeln", kurz: "B6", farbe: "#D4A017",
    satz: "Integrieren ist Ableiten rückwärts." },
  { id: "B7", bereich: "B", name: "Modellieren mit Funktionen", kurz: "B7", farbe: "#8C2330",
    satz: "Wirklichkeit in Funktionen übersetzen — und das Ergebnis zurück." },
];

/* Die früheren Leitideen bleiben für Geometrie und Stochastik erhalten,
   bis diese Bereiche nach demselben Muster umgebaut sind. */

export const LEITIDEEN_ALT = [
  { id: "zahl", name: "Zahl · Variable · Operation", kurz: "Zahl", farbe: "#1C1C1C", versteckt: true },
  { id: "mess", name: "Messen", kurz: "Messen", farbe: "#D4A017", versteckt: true },
  { id: "raum", name: "Raum und Form", kurz: "Raum", farbe: "#4A4A4A", versteckt: true },
  { id: "funk", name: "Funktionaler Zusammenhang", kurz: "Funktion", farbe: "#B30000", versteckt: true },
  { id: "daten", name: "Daten und Zufall", kurz: "Daten", farbe: "#6B6B6B", versteckt: true },
];

export const LEITIDEEN = [...LINIEN, ...LEITIDEEN_ALT];


export const STUFEN = [
  { id: "N1", name: "Fundament", klassen: "etwa Klasse 5 bis 7" },
  { id: "N2", name: "Aufbau", klassen: "etwa Klasse 8 und 9" },
  { id: "N3", name: "Vertiefung", klassen: "etwa Klasse 10" },
  { id: "N4", name: "Abitur", klassen: "Kursstufe" },
];

/* Jede Station: linie, Niveau, Voraussetzungen — und rueck: die Stationen,
   an die sie anknüpft, mit dem Satz, der die Verbindung ausspricht.
   Aus rueck ergibt sich rückwärts gelesen auch der Vorausblick. */

export const KOMPETENZEN = [
  // ─── A1 · Zahlen und Zahlbereiche ───
  { id: "z-nat", idee: "A1", stufe: "N1", titel: "Natürliche Zahlen und Rechengesetze", kann: "Ich rechne sicher mit natürlichen Zahlen und nutze die Rechengesetze.", voraus: [], buch: "A1 I.1–3 · A1 III" },
  { id: "z-teil", idee: "A1", stufe: "N1", titel: "Teilbarkeit und Primfaktoren", kann: "Ich erkenne Teiler und Primzahlen und zerlege Zahlen in Primfaktoren.", voraus: ["z-nat"], ziel: { ansicht: "kopf" }, buch: "A1 I.7",
    rueck: [{ id: "z-nat", satz: "Jede Multiplikation lässt sich rückwärts lesen: Aus welchen Faktoren ist diese Zahl gemacht?" }] },
  { id: "z-neg", idee: "A1", stufe: "N1", titel: "Ganze Zahlen", kann: "Ich ordne ganze Zahlen und rechne mit ihnen, auch mit Vorzeichenregeln.", voraus: ["z-nat"], buch: "A1 VI",
    rueck: [{ id: "z-nat", satz: "x + 5 = 3 hat bei den natürlichen Zahlen keine Lösung. Wer rückwärts rechnen will, braucht Zahlen unter null." }] },
  { id: "z-bruch", idee: "A1", stufe: "N1", titel: "Brüche verstehen, kürzen, erweitern", kann: "Ich stelle Anteile als Brüche dar, kürze, erweitere und vergleiche sie.", voraus: ["z-teil"], buch: "A2 I.1–4",
    rueck: [{ id: "z-nat", satz: "3 · x = 2 geht mit ganzen Zahlen nicht auf. Die Division rückwärts erzwingt Brüche." },
            { id: "z-teil", satz: "Kürzen heißt gemeinsame Primfaktoren streichen." }] },
  { id: "z-dez", idee: "A1", stufe: "N1", titel: "Dezimalzahlen", kann: "Ich rechne mit Dezimalzahlen, runde sinnvoll und wandle zwischen Bruch und Dezimalzahl.", voraus: ["z-bruch"], buch: "A2 I.5–7 · A2 II.2–4",
    rueck: [{ id: "z-bruch", satz: "Eine Dezimalzahl ist ein Bruch mit Zehnernenner in anderer Schreibweise." }] },
  { id: "z-bruchrech", idee: "A1", stufe: "N1", titel: "Mit Brüchen rechnen", kann: "Ich addiere, subtrahiere, multipliziere und dividiere Brüche.", voraus: ["z-bruch"], buch: "A2 II.1 · A2 IV.1–3",
    rueck: [{ id: "z-bruch", satz: "Addieren geht erst nach dem Erweitern auf einen gemeinsamen Nenner." }] },
  { id: "z-prozent", idee: "A1", stufe: "N1", titel: "Prozent- und Zinsrechnung", kann: "Ich berechne Prozentwert, Grundwert und Prozentsatz, auch Zinsen und Zinseszinsen.", voraus: ["z-dez"], buch: "A3 I",
    rueck: [{ id: "z-dez", satz: "0,15 und 15 % sind dieselbe Zahl in zwei Schreibweisen." }, { id: "z-bruch", satz: "Prozent ist ein Bruch mit Nenner 100 — dieselbe Idee in anderer Schreibweise." },
            { id: "z-lgl", satz: "Grundwert gesucht? Dann rechnest du die Prozentformel rückwärts." }] },
  { id: "z-wurzel", idee: "A1", stufe: "N2", titel: "Quadratwurzeln und reelle Zahlen", kann: "Ich rechne mit Quadratwurzeln, ziehe teilweise die Wurzel und kenne irrationale Zahlen.", voraus: ["z-term"], buch: "LS8 III",
    rueck: [{ id: "z-bruchrech", satz: "x² = 2 hat keine Bruchlösung. Das Quadrieren rückwärts führt zu den irrationalen Zahlen." }] },

  // ─── A2 · Terme als Werkzeug ───
  { id: "z-term", idee: "A2", stufe: "N1", titel: "Terme aufstellen und vereinfachen", kann: "Ich stelle Terme auf, fasse gleichartige Glieder zusammen und multipliziere Klammern aus.", voraus: ["z-bruchrech", "z-neg"], buch: "A3 IV.1–3 · LS8 I.1–3",
    rueck: [{ id: "z-nat", satz: "Das Distributivgesetz kennst du vom Kopfrechnen: 7 · 13 = 7 · 10 + 7 · 3. Mit Variablen ist es dasselbe." }] },
  { id: "t-aus", idee: "A2", stufe: "N2", titel: "Ausklammern und Faktorisieren", kann: "Ich klammere gemeinsame Faktoren aus und zerlege Terme in Produkte.", voraus: ["z-term"], buch: "A3 IV.3 · LS10 I.7",
    rueck: [{ id: "z-term", satz: "Ausklammern ist Ausmultiplizieren rückwärts." }, { id: "z-teil", satz: "Faktorisieren ist Primfaktorzerlegung für Terme." }] },
  { id: "z-binom", idee: "A2", stufe: "N2", titel: "Binomische Formeln", kann: "Ich wende die binomischen Formeln in beide Richtungen an.", voraus: ["z-term"], buch: "LS8 I.3–4",
    rueck: [{ id: "z-term", satz: "Eine binomische Formel ist eine ausmultiplizierte Klammer, die man sich einmal merkt." }] },
  { id: "t-bruchterm", idee: "A2", stufe: "N2", titel: "Bruchterme", kann: "Ich vereinfache Bruchterme und bestimme, für welche Werte sie nicht definiert sind.", voraus: ["z-bruchrech", "t-aus"], buch: "LS8 V.2 · LS8 VI.6",
    rueck: [{ id: "z-bruchrech", satz: "Mit Variablen im Nenner gelten dieselben Bruchregeln — plus eine Warnung: Der Nenner darf nie null werden." }] },
  { id: "z-pot", idee: "A2", stufe: "N2", titel: "Potenzen und Potenzgesetze", kann: "Ich wende die Potenzgesetze an, auch bei ganzen und rationalen Hochzahlen.", voraus: ["z-term", "z-wurzel"], buch: "LS9 I.1–5",
    rueck: [{ id: "z-wurzel", satz: "Eine Wurzel ist eine Potenz mit gebrochener Hochzahl: √x = x^(1/2)." }] },
  { id: "t-subst", idee: "A2", stufe: "N3", titel: "Substitution", kann: "Ich ersetze einen Teilterm durch eine neue Variable, um einen Term oder eine Gleichung zu vereinfachen.", voraus: ["z-binom", "z-pot"], buch: "KS IV.1",
    rueck: [{ id: "z-pot", satz: "x⁴ ist (x²)². Wer das sieht, kann x² als eine einzige Unbekannte behandeln." }] },

  // ─── A3 · Die Leiter der Umkehrungen ───
  { id: "z-lgl", idee: "A3", stufe: "N1", titel: "Sprosse 1 · Lineare Gleichungen", kann: "Ich löse lineare Gleichungen und Ungleichungen, indem ich jede Rechenart durch ihre Umkehrung aufhebe.", voraus: ["z-term"], buch: "A3 IV.4–7 · LS8 I.5",
    rueck: [{ id: "z-term", satz: "Eine Gleichung lösen heißt, den Term rückwärts zu rechnen: Plus wird Minus, Mal wird Geteilt — in umgekehrter Reihenfolge." }] },
  { id: "g-bruchgl", idee: "A3", stufe: "N2", titel: "Bruchgleichungen", kann: "Ich löse Gleichungen mit der Variablen im Nenner und prüfe die Definitionsmenge.", voraus: ["z-lgl", "t-bruchterm"], buch: "LS8 V.2 · LS8 VI.6",
    rueck: [{ id: "z-lgl", satz: "Mit dem Hauptnenner multipliziert wird daraus eine Gleichung, die du schon kannst." }, { id: "t-bruchterm", satz: "Werte, für die der Nenner null wird, scheiden als Lösung aus." }] },
  { id: "z-qgl", idee: "A3", stufe: "N2", titel: "Sprosse 2 · Quadratische Gleichungen", kann: "Ich löse quadratische Gleichungen mit der passenden Methode — Wurzelziehen, Ausklammern, Lösungsformel.", voraus: ["z-binom", "z-wurzel", "t-aus"], ziel: { ansicht: "training", ziel: "weg" }, buch: "LS8 VI",
    rueck: [{ id: "z-wurzel", satz: "Wurzelziehen ist Quadrieren rückwärts — mit zwei Lösungen, plus und minus." },
            { id: "t-aus", satz: "Ist ein Produkt null, dann ist ein Faktor null. Deshalb lohnt Ausklammern." }] },
  { id: "g-potgl", idee: "A3", stufe: "N2", titel: "Sprosse 3 · Potenz- und Wurzelgleichungen", kann: "Ich löse Gleichungen wie x⁵ = 32 oder √(x + 1) = 3 und mache die Probe.", voraus: ["z-pot", "z-qgl"], buch: "LS9 I.6–7",
    rueck: [{ id: "z-qgl", satz: "Wie bei x² = 9, nur mit höherer Hochzahl: Die n-te Wurzel hebt das Potenzieren auf." }] },
  { id: "z-log", idee: "A3", stufe: "N2", titel: "Sprosse 4 · Exponentialgleichungen und Logarithmus", kann: "Ich löse Gleichungen, bei denen die Unbekannte in der Hochzahl steht.", voraus: ["f-exp", "z-pot"], buch: "LS9 III.4",
    rueck: [{ id: "z-pot", satz: "Bei 2^x = 8 steht die Unbekannte oben. Der Logarithmus ist das Potenzieren rückwärts — er fragt nach der Hochzahl." }] },
  { id: "g-hoeher", idee: "A3", stufe: "N3", titel: "Gleichungen höheren Grades", kann: "Ich löse Gleichungen dritten und vierten Grades durch Ausklammern und Substitution.", voraus: ["z-qgl", "t-aus", "t-subst"], buch: "LS10 I.6–7 · KS IV.1",
    rueck: [{ id: "g-potgl", satz: "x³ = 8 löst die dritte Wurzel. Bei x³ − 4x = 0 hilft sie nicht mehr — dann kommt Ausklammern." }, { id: "t-subst", satz: "x⁴ − 5x² + 4 = 0 wird mit u = x² zu einer quadratischen Gleichung, die du schon lösen kannst." },
            { id: "t-aus", satz: "x³ − 4x = 0: erst x ausklammern, dann bleibt eine quadratische Gleichung." }] },
  { id: "g-trig", idee: "A3", stufe: "N3", titel: "Sprosse 5 · Trigonometrische Gleichungen", kann: "Ich löse Gleichungen wie sin(x) = 0,5 und finde alle Lösungen im Intervall.", voraus: ["f-trig"], buch: "LS10 VI.2–4",
    rueck: [{ id: "f-trig", satz: "sin(x) = 0,5 rückwärts: Welcher Winkel hat diesen Sinuswert — und warum sind es wegen der Periode unendlich viele?" }] },
  { id: "a-newton", idee: "A3", stufe: "N4", titel: "Sprosse 6 · Näherungsverfahren", kann: "Ich bestimme Lösungen schrittweise, wenn sich eine Gleichung nicht mehr rückwärts rechnen lässt.", voraus: ["a-regeln", "a-null"], buch: "KS IV.7",
    rueck: [{ id: "a-anw", satz: "Das Verfahren folgt der Tangente bis zur x-Achse — und wiederholt das, bis es genau genug ist." }, { id: "g-hoeher", satz: "Für manche Gleichungen gibt es keine Umkehrung mehr. Dann nähert man sich der Lösung — mit der Tangente aus B4." }] },

  // ─── A4 · Mehrere Unbekannte ───
  { id: "z-lgs", idee: "A4", stufe: "N2", titel: "Lineare Gleichungssysteme", kann: "Ich löse Systeme aus zwei Gleichungen mit zwei Variablen und deute ihre Lösungsvielfalt.", voraus: ["z-lgl"], buch: "LS8 VII",
    rueck: [{ id: "z-lgl", satz: "Eine Unbekannte eliminieren — dann bleibt eine lineare Gleichung, die du schon kannst." },
            { id: "f-lin", satz: "Jede Gleichung ist eine Gerade. Die Lösung ist ihr Schnittpunkt." }] },
  { id: "g-gauss", idee: "A4", stufe: "N4", titel: "Gauß-Verfahren", kann: "Ich löse Systeme mit drei Unbekannten systematisch und beschreibe ihre Lösungsmengen.", voraus: ["z-lgs"], buch: "KS V.1–2",
    rueck: [{ id: "z-lgs", satz: "Dasselbe Additionsverfahren — nur systematisch, Zeile für Zeile." }] },

  // ─── B1 · Funktionen verstehen ───
  { id: "r-koord", idee: "B1", stufe: "N1", titel: "Koordinatensystem", kann: "Ich trage Punkte in ein Koordinatensystem ein und lese sie ab, auch mit negativen Koordinaten.", voraus: ["z-neg"], buch: "A1 II.4",
    rueck: [{ id: "z-neg", satz: "Die negativen Zahlen öffnen die anderen drei Viertel des Koordinatensystems." }] },
  { id: "f-prop", idee: "B1", stufe: "N1", titel: "Zuordnungen und Dreisatz", kann: "Ich erkenne proportionale und antiproportionale Zuordnungen und rechne mit dem Dreisatz.", voraus: ["z-prozent", "r-koord"], buch: "A3 III.1–4",
    rueck: [{ id: "z-bruchrech", satz: "Der Dreisatz ist erst Teilen, dann Malnehmen — Bruchrechnung in Handlung." }] },
  { id: "f-darst", idee: "B1", stufe: "N1", titel: "Vier Darstellungen einer Funktion", kann: "Ich wechsle zwischen Situation, Tabelle, Graph und Term.", voraus: ["f-prop"], buch: "A3 III.1–3",
    rueck: [{ id: "r-koord", satz: "Im Koordinatensystem wird aus der Wertetabelle ein Graph." }, { id: "f-prop", satz: "Die Wertetabelle einer Zuordnung ist schon ein Graph — nur noch nicht gezeichnet." }] },
  { id: "f-begriff", idee: "B1", stufe: "N2", titel: "Funktionsbegriff und f(x)", kann: "Ich verwende die Schreibweise f(x), bestimme Funktionswerte und Definitionsmengen.", voraus: ["f-darst", "z-term"], buch: "LS9 III.1 · LS10 I.1",
    rueck: [{ id: "f-darst", satz: "f(x) ist der Term, der Graph ist sein Bild. Ein Funktionswert ist vorwärts gerechnet, eine Nullstelle rückwärts." }] },

  // ─── B2 · Funktionsfamilien ───
  { id: "f-lin", idee: "B2", stufe: "N1", titel: "Lineare Funktionen", kann: "Ich bestimme Steigung und y-Achsenabschnitt und stelle Geradengleichungen auf.", voraus: ["f-prop", "z-lgl"], ziel: { ansicht: "training", ziel: "modul:b01" }, buch: "A3 III.5",
    rueck: [{ id: "f-prop", satz: "Eine proportionale Zuordnung ist eine Gerade durch den Ursprung. Der Faktor wird zur Steigung." }] },
  { id: "f-potenz", idee: "B2", stufe: "N2", titel: "Potenzfunktionen", kann: "Ich beschreibe Potenzfunktionen mit natürlichen Hochzahlen und ihre Symmetrie.", voraus: ["z-pot", "f-quad", "f-begriff"], buch: "LS9 III.2",
    rueck: [{ id: "f-quad", satz: "Die Normalparabel ist die Potenzfunktion mit Hochzahl 2. Gerade Hochzahlen sehen ähnlich aus, ungerade anders." }] },
  { id: "f-poly", idee: "B2", stufe: "N3", titel: "Ganzrationale Funktionen", kann: "Ich beschreibe das Verhalten ganzrationaler Funktionen im Unendlichen aus Grad und Leitkoeffizient.", voraus: ["f-quad", "f-potenz"], ziel: { ansicht: "plotter" }, buch: "LS10 I.3–4",
    rueck: [{ id: "f-potenz", satz: "Ganzrationale Funktionen sind Summen von Potenzfunktionen. Für große x bestimmt der höchste Summand den Verlauf." }] },
  { id: "a-efkt", idee: "B2", stufe: "N4", titel: "e-Funktion und Logarithmusfunktion", kann: "Ich untersuche Funktionen mit e und ln, auch mit Parameter.", voraus: ["a-kette", "z-log"], buch: "KS II",
    rueck: [{ id: "a-kette", satz: "e hoch 2x ableiten ist die Kettenregel mit e als äußerer Funktion." }, { id: "a-produkt", satz: "x mal e hoch x braucht die Produktregel." }, { id: "z-log", satz: "ln ist der Logarithmus zur Basis e — dieselbe Umkehrung wie auf Sprosse 4." },
            { id: "f-exp", satz: "e ist die Basis, bei der die Exponentialfunktion ihre eigene Ableitung ist." }] },

  // ─── B3 · Funktionen verwandeln ───
  { id: "f-quad", idee: "B3", stufe: "N2", titel: "Parabeln und Scheitelform", kann: "Ich verschiebe und strecke Parabeln und lese den Scheitel aus der Scheitelform ab.", voraus: ["f-lin", "z-binom"], ziel: { ansicht: "training", ziel: "weg" }, buch: "LS8 IV",
    rueck: [{ id: "z-binom", satz: "Scheitelform und Normalform ineinander umrechnen ist nichts anderes als die binomische Formel." }] },
  { id: "f-trafo", idee: "B3", stufe: "N3", titel: "Graphen verschieben, strecken, spiegeln", kann: "Ich erkenne und erzeuge Verschiebungen, Streckungen und Spiegelungen beliebiger Graphen.", voraus: ["f-quad", "f-begriff"], buch: "LS10 I.2",
    rueck: [{ id: "f-begriff", satz: "Mit der Schreibweise f(x) wird jede Verwandlung zur Formel: f(x − c) verschiebt um c nach rechts." }, { id: "f-quad", satz: "Was du bei der Parabel mit a(x − c)² + d gemacht hast, geht mit jedem Graphen: a·f(x − c) + d." }] },
  { id: "f-sym", idee: "B3", stufe: "N3", titel: "Symmetrie von Graphen", kann: "Ich weise Achsen- und Punktsymmetrie rechnerisch nach.", voraus: ["f-trafo", "f-potenz"], buch: "LS10 I.5",
    rueck: [{ id: "f-trafo", satz: "Spiegeln an der y-Achse heißt x durch −x ersetzen. Bleibt der Term gleich, ist der Graph achsensymmetrisch." }] },
  { id: "f-trig", idee: "B3", stufe: "N3", titel: "Sinus- und Kosinusfunktion", kann: "Ich beschreibe periodische Vorgänge mit f(x) = a·sin(b(x − c)) + d im Bogenmaß.", voraus: ["f-trafo"], buch: "LS10 VI.1–4",
    rueck: [{ id: "f-trafo", satz: "a·sin(b(x − c)) + d ist dieselbe Verwandlung wie bei der Parabel — mit einem Parameter mehr für die Periode." }] },
  { id: "a-schar", idee: "B3", stufe: "N4", titel: "Funktionenscharen", kann: "Ich untersuche Funktionen mit Parameter und bestimme Ortskurven.", voraus: ["a-kd", "f-trafo"], buch: "KS IV.4 · KS IV.6",
    rueck: [{ id: "a-kd", satz: "Jedes Mitglied der Schar untersuchst du wie eine einzelne Funktion — nur mit dem Parameter im Gepäck." }, { id: "f-trafo", satz: "Ein Parameter im Term ist eine ganze Familie von Graphen — jeder Wert ein Mitglied." }] },

  // ─── B4 · Änderung und Steigung ───
  { id: "a-aend", idee: "B4", stufe: "N3", titel: "Änderungsrate und Ableitung", kann: "Ich unterscheide mittlere und momentane Änderungsrate und deute die Ableitung im Sachzusammenhang.", voraus: ["f-lin", "f-quad"], ziel: { ansicht: "training", ziel: "modul:b02" }, buch: "LS10 II.1–4 · KS I.1",
    rueck: [{ id: "f-lin", satz: "Das Steigungsdreieck der Geraden — jetzt zwischen zwei Punkten einer Kurve. Wird es beliebig klein, entsteht die Ableitung." }] },
  { id: "a-regeln", idee: "B4", stufe: "N3", titel: "Potenz-, Faktor- und Summenregel", kann: "Ich leite ganzrationale Funktionen mit Potenz-, Faktor- und Summenregel ab.", voraus: ["a-aend", "z-pot"], ziel: { ansicht: "training", ziel: "modul:ableitung" }, buch: "LS10 II.5–6 · KS I.2",
    rueck: [{ id: "a-aend", satz: "Statt jedes Mal den Grenzwert zu bilden, gilt ein Muster: Die Hochzahl wandert nach vorn und sinkt um eins." }] },
  { id: "a-anw", idee: "B4", stufe: "N3", titel: "Tangenten", kann: "Ich stelle Tangentengleichungen auf und löse Berührprobleme.", voraus: ["a-regeln"], ziel: { ansicht: "training", ziel: "modul:b08" }, buch: "LS10 II.7",
    rueck: [{ id: "f-lin", satz: "Die Tangente ist eine Gerade: ein Punkt und eine Steigung. Neu ist nur, dass f′ die Steigung liefert." }] },
  { id: "a-trig", idee: "B4", stufe: "N3", titel: "Ableitung von Sinus und Kosinus", kann: "Ich leite Sinus- und Kosinusfunktionen ab und modelliere periodische Vorgänge.", voraus: ["f-trig", "a-regeln"], buch: "LS10 VI.5–6 · KS IV.5",
    rueck: [{ id: "f-trig", satz: "Wo der Sinus am steilsten steigt, hat der Kosinus seinen Hochpunkt — die Ableitung ist die verschobene Welle." }] },
  { id: "a-produkt", idee: "B4", stufe: "N4", titel: "Produktregel", kann: "Ich leite Produkte von Funktionen mit der Produktregel ab.", voraus: ["a-regeln"], ziel: { ansicht: "ki", ziel: "ableiten" }, buch: "KS I.5",
    rueck: [{ id: "a-regeln", satz: "Die Summenregel gilt, die Produktregel ist anders: Ein Produkt wird nicht gliedweise abgeleitet." }] },
  { id: "a-kette", idee: "B4", stufe: "N4", titel: "Verkettung und Kettenregel", kann: "Ich verkette Funktionen und leite sie mit der Kettenregel ab.", voraus: ["a-regeln", "f-exp"], ziel: { ansicht: "ki", ziel: "ableiten" }, buch: "KS I.3–4",
    rueck: [{ id: "f-trafo", satz: "Die innere Funktion ist eine Verwandlung aus B3: Wer x durch 2x ersetzt, staucht den Graphen — und die Steigung verdoppelt sich." }] },

  // ─── B5 · Graphen untersuchen ───
  { id: "a-null", idee: "B5", stufe: "N3", titel: "Nullstellen und Linearfaktoren", kann: "Ich bestimme Nullstellen, auch mehrfache, und schreibe Funktionen in Linearfaktoren.", voraus: ["f-poly", "z-qgl", "t-aus"], ziel: { ansicht: "training", ziel: "modul:b04" }, buch: "LS10 I.6–7 · KS IV.1",
    rueck: [{ id: "f-poly", satz: "Der Grad verrät, wie viele Nullstellen höchstens möglich sind." }, { id: "z-qgl", satz: "Eine Nullstelle bestimmen heißt die Gleichung f(x) = 0 lösen — die Leiter aus A3." },
            { id: "t-aus", satz: "Linearfaktoren sind ausgeklammerte Nullstellen: (x − 2)(x + 3) verrät beide sofort." }] },
  { id: "a-extrem", idee: "B5", stufe: "N3", titel: "Monotonie und Extremstellen", kann: "Ich bestimme Extremstellen und weise sie mit Vorzeichenwechsel oder zweiter Ableitung nach.", voraus: ["a-regeln", "a-null"], ziel: { ansicht: "training", ziel: "modul:b05" }, buch: "LS10 IV.1–3 · KS I.6–7",
    rueck: [{ id: "f-quad", satz: "Der Scheitel der Parabel ist ein Extrempunkt. Jetzt findest du ihn bei jeder Kurve: dort, wo f′ null wird." },
            { id: "a-null", satz: "f′(x) = 0 ist wieder eine Gleichung aus A3 — nur für die Ableitung." }] },
  { id: "a-wende", idee: "B5", stufe: "N3", titel: "Krümmung und Wendestellen", kann: "Ich deute die zweite Ableitung als Krümmung und bestimme Wendestellen.", voraus: ["a-extrem"], ziel: { ansicht: "training", ziel: "modul:b06" }, buch: "LS10 IV.4 · KS I.6–7",
    rueck: [{ id: "a-extrem", satz: "Dieselbe Idee eine Ableitung höher: Wo f″ das Vorzeichen wechselt, ändert sich die Krümmung." }] },
  { id: "a-kd", idee: "B5", stufe: "N3", titel: "Vom Funktionsterm zum Graphen", kann: "Ich untersuche eine Funktion vollständig und löse Aufgaben in Sachzusammenhängen.", voraus: ["a-wende", "f-sym"], ziel: { ansicht: "training", ziel: "kd" }, buch: "LS10 IV.5–6",
    rueck: [{ id: "a-wende", satz: "Extrem- und Wendestellen sind die Bausteine. Hier setzt du sie zu einem vollständigen Bild zusammen." }, { id: "f-sym", satz: "Symmetrie spart die Hälfte der Arbeit: Was links gilt, gilt gespiegelt rechts." }] },
  { id: "a-asymp", idee: "B5", stufe: "N4", titel: "Definitionslücken und Asymptoten", kann: "Ich bestimme senkrechte und waagerechte Asymptoten und das Verhalten für x → ±∞.", voraus: ["a-null", "t-bruchterm"], buch: "KS IV.2–3",
    rueck: [{ id: "g-bruchgl", satz: "Wo der Nenner null wird, hat die Bruchgleichung keine Lösung — und der Graph eine Lücke." }, { id: "t-bruchterm", satz: "Wo der Nenner null wird, ist der Bruchterm nicht definiert — genau dort liegt die Polstelle." }] },

  // ─── B6 · Ansammeln ───
  { id: "a-int", idee: "B6", stufe: "N4", titel: "Integral und Hauptsatz", kann: "Ich rekonstruiere Größen, deute das Integral als orientierten Flächeninhalt und bilde Stammfunktionen.", voraus: ["a-regeln"], buch: "KS III.1–5",
    rueck: [{ id: "a-regeln", satz: "Integrieren ist Ableiten rückwärts: Welche Funktion hat diese Ableitung? Dasselbe Prinzip wie beim Gleichungslösen." }] },
  { id: "a-flaeche", idee: "B6", stufe: "N4", titel: "Flächen und Mittelwerte", kann: "Ich berechne Flächen zwischen Graphen und Mittelwerte von Funktionen.", voraus: ["a-int", "a-null"], buch: "KS III.6–7",
    rueck: [{ id: "a-int", satz: "Das bestimmte Integral kennst du schon — zur Fläche wird es, wenn man auf die Vorzeichen achtet." }, { id: "a-null", satz: "Die Grenzen einer Fläche sind Schnittstellen — also wieder Gleichungen aus A3." }] },
  { id: "a-rot", idee: "B6", stufe: "N4", titel: "Rotationskörper und uneigentliche Integrale", kann: "Ich berechne Volumen von Rotationskörpern und unbegrenzte Flächen.", voraus: ["a-flaeche"], buch: "KS III.8–9",
    rueck: [{ id: "a-flaeche", satz: "Statt Streifen werden Scheiben aufsummiert — die Idee des Ansammelns bleibt dieselbe." }] },

  // ─── B7 · Modellieren mit Funktionen ───
  { id: "f-exp", idee: "B7", stufe: "N2", titel: "Exponentielles Wachstum", kann: "Ich beschreibe Wachstum und Zerfall mit Exponentialfunktionen, auch mit Halbwerts- und Verdopplungszeit.", voraus: ["z-pot", "f-lin"], buch: "LS9 III.3 · LS9 III.5–6",
    rueck: [{ id: "z-prozent", satz: "Zinseszins ist exponentielles Wachstum: jedes Jahr derselbe Faktor." },
            { id: "f-lin", satz: "Linear heißt gleicher Zuwachs, exponentiell heißt gleicher Faktor." }] },
  { id: "a-optim", idee: "B7", stufe: "N4", titel: "Extremwertprobleme mit Nebenbedingung", kann: "Ich stelle Zielfunktionen mit Nebenbedingung auf und optimiere sie.", voraus: ["a-extrem"], buch: "KS I.8",
    rueck: [{ id: "a-extrem", satz: "Die Zielfunktion ist neu, der Weg zum Maximum ist derselbe: ableiten, null setzen, prüfen." }] },
  { id: "a-steck", idee: "B7", stufe: "N4", titel: "Funktionen aus Bedingungen bestimmen", kann: "Ich bestimme ganzrationale Funktionen aus vorgegebenen Eigenschaften.", voraus: ["g-gauss", "a-extrem"], buch: "KS V.3",
    rueck: [{ id: "g-gauss", satz: "Aus Eigenschaften werden Gleichungen, aus Gleichungen ein System — gelöst mit dem Gauß-Verfahren." }] },

  // ─── Geometrie und Stochastik: noch nicht umgebaut, ausgeblendet ───
  { id: "m-groessen", idee: "mess", stufe: "N1", titel: "Größen und Einheiten", kann: "Ich rechne mit Größen und wandle Einheiten um.", voraus: ["z-nat"], versteckt: true },
  { id: "m-flaeche", idee: "mess", stufe: "N1", titel: "Flächeninhalt und Umfang", kann: "Ich berechne Flächeninhalt und Umfang von Rechteck und Quadrat.", voraus: ["m-groessen"], versteckt: true },
  { id: "m-dreieck", idee: "mess", stufe: "N1", titel: "Parallelogramm und Dreieck", kann: "Ich berechne Flächeninhalte von Parallelogrammen und Dreiecken.", voraus: ["m-flaeche"], versteckt: true },
  { id: "m-quader", idee: "mess", stufe: "N1", titel: "Quader", kann: "Ich berechne Oberfläche und Volumen von Quadern.", voraus: ["m-flaeche"], versteckt: true },
  { id: "r-geo", idee: "raum", stufe: "N1", titel: "Symmetrie und Grundbegriffe", kann: "Ich erkenne symmetrische Figuren.", voraus: [], versteckt: true },
  { id: "r-winkel", idee: "raum", stufe: "N1", titel: "Winkel", kann: "Ich messe und zeichne Winkel.", voraus: ["r-geo"], versteckt: true },
  { id: "r-dreieck", idee: "raum", stufe: "N1", titel: "Winkelsummen und Thales", kann: "Ich nutze Winkelsummen und den Satz des Thales.", voraus: ["r-winkel"], versteckt: true },
  { id: "d-daten", idee: "daten", stufe: "N1", titel: "Diagramme und Mittelwerte", kann: "Ich lese Diagramme und berechne Mittelwerte.", voraus: ["z-nat"], versteckt: true },
  { id: "d-laplace", idee: "daten", stufe: "N2", titel: "Laplace-Wahrscheinlichkeit", kann: "Ich berechne Laplace-Wahrscheinlichkeiten.", voraus: ["d-daten", "z-bruchrech"], versteckt: true },
  { id: "d-mehrstufig", idee: "daten", stufe: "N2", titel: "Mehrstufige Zufallsexperimente", kann: "Ich rechne mit Baumdiagrammen.", voraus: ["d-laplace"], versteckt: true },
  { id: "r-aehnl", idee: "raum", stufe: "N2", titel: "Strahlensätze", kann: "Ich nutze die Strahlensätze.", voraus: ["r-dreieck", "z-lgl"], versteckt: true },
  { id: "r-kongruenz", idee: "raum", stufe: "N2", titel: "Kongruenz und Ähnlichkeit", kann: "Ich begründe mit Kongruenzsätzen.", voraus: ["r-dreieck"], versteckt: true },
  { id: "r-pyth", idee: "raum", stufe: "N2", titel: "Satz des Pythagoras", kann: "Ich berechne Längen in rechtwinkligen Dreiecken.", voraus: ["z-wurzel", "m-dreieck"], versteckt: true },
  { id: "r-trig", idee: "raum", stufe: "N2", titel: "Trigonometrie im Dreieck", kann: "Ich rechne mit Sinus, Kosinus und Tangens im Dreieck.", voraus: ["r-pyth", "r-aehnl"], versteckt: true },
  { id: "m-kreis", idee: "mess", stufe: "N2", titel: "Kreis", kann: "Ich berechne Umfang und Fläche von Kreisen.", voraus: ["m-dreieck"], versteckt: true },
  { id: "m-koerper", idee: "mess", stufe: "N2", titel: "Körper", kann: "Ich berechne Oberfläche und Volumen von Körpern.", voraus: ["m-kreis", "r-pyth", "m-quader"], versteckt: true },
  { id: "s-zufall", idee: "daten", stufe: "N2", titel: "Zufallsgrößen und Erwartungswert", kann: "Ich berechne Erwartungswerte.", voraus: ["d-mehrstufig"], versteckt: true },
  { id: "d-bedingt", idee: "daten", stufe: "N2", titel: "Bedingte Wahrscheinlichkeit", kann: "Ich arbeite mit Vierfeldertafeln.", voraus: ["d-mehrstufig"], versteckt: true },
  { id: "g-vek", idee: "raum", stufe: "N3", titel: "Vektoren im Raum", kann: "Ich rechne mit Vektoren.", voraus: ["r-koord", "r-pyth"], versteckt: true },
  { id: "g-gerade", idee: "raum", stufe: "N3", titel: "Geraden im Raum", kann: "Ich stelle Geraden im Raum auf.", voraus: ["g-vek", "z-lgs"], versteckt: true },
  { id: "s-binom", idee: "daten", stufe: "N3", titel: "Binomialverteilung", kann: "Ich rechne mit der Binomialverteilung.", voraus: ["s-zufall"], versteckt: true },
  { id: "g-ebene", idee: "raum", stufe: "N4", titel: "Ebenen", kann: "Ich beschreibe Ebenen.", voraus: ["g-gerade"], versteckt: true },
  { id: "g-skalar", idee: "raum", stufe: "N4", titel: "Skalarprodukt und Winkel", kann: "Ich berechne Winkel mit dem Skalarprodukt.", voraus: ["g-vek", "r-trig"], versteckt: true },
  { id: "g-normal", idee: "raum", stufe: "N4", titel: "Normalen- und Koordinatenform", kann: "Ich wandle Ebenengleichungen um.", voraus: ["g-ebene", "g-skalar"], versteckt: true },
  { id: "g-abstand", idee: "raum", stufe: "N4", titel: "Abstände im Raum", kann: "Ich berechne Abstände im Raum.", voraus: ["g-normal"], versteckt: true },
  { id: "s-test", idee: "daten", stufe: "N4", titel: "Hypothesentests", kann: "Ich führe Hypothesentests durch.", voraus: ["s-binom"], versteckt: true },
  { id: "s-normal", idee: "daten", stufe: "N4", titel: "Normalverteilung", kann: "Ich arbeite mit der Normalverteilung.", voraus: ["s-binom", "a-int"], versteckt: true },
];


export const aktiv = (id) => !!KOMP[id] && !KOMP[id].versteckt;

export const AKTIVE = KOMPETENZEN.filter((k) => !k.versteckt);


export const KOMP = Object.fromEntries(KOMPETENZEN.map((k) => [k.id, k]));

/* „LS10 II.5–6 · KS I.2" → lesbarer Verweis ins Schulbuch. */

export const NACHFOLGER = (() => {
  const n = Object.fromEntries(KOMPETENZEN.map((k) => [k.id, []]));
  KOMPETENZEN.forEach((k) => k.voraus.forEach((v) => n[v] && n[v].push(k.id)));
  return n;
})();


export const STUFE_INDEX = { N1: 0, N2: 1, N3: 2, N4: 3 };

export const stufeVonKlasse = (k) => (k <= 7 ? "N1" : k <= 9 ? "N2" : k === 10 ? "N3" : "N4");

/* ---------- Diagnoseaufgaben ---------- */

/* Für die tragenden Kompetenzen gibt es Aufgabenerzeuger. Jede Aufgabe ist
   maschinell prüfbar — als Zahl oder als Term. */

export const DIAG = {
  "z-teil": () => { const p = zuf([7, 11, 13]), n = zuf([4, 6, 12]) * p;
    return { frage: `Wie lautet der größte Primfaktor von $${n}$?`, loesung: String(p), art: "zahl" }; },
  "z-bruchrech": () => { const b = zuf([3, 4, 6]), d = zuf([4, 5, 8]);
    return { frage: `Berechne $\\frac{1}{${b}} + \\frac{1}{${d}}$.`, loesung: `1/${b}+1/${d}`, art: "zahl", hinweis: "Bruch als a/b eingeben" }; },
  "z-dez": () => { const a = zuf([0.4, 0.25, 1.5]), b = zuf([1.2, 0.8, 2.5]);
    return { frage: `Berechne $${String(a).replace(".", "{,}")} \\cdot ${String(b).replace(".", "{,}")}$.`, loesung: String(a * b), art: "zahl" }; },
  "z-neg": () => { const a = ganz(-9, -2), b = ganz(-6, -2), c = ganz(2, 4);
    return { frage: `Berechne $${a} - (${b}) \\cdot ${c}$.`, loesung: String(a - b * c), art: "zahl" }; },
  "z-term": () => { const a = ganz(2, 5), b = ganz(1, 4), c = ganz(2, 4), d = ganz(1, 5);
    return { frage: `Vereinfache $${a}(x + ${b}) - ${c}(x - ${d})$.`, loesung: `${a}*(x+${b})-${c}*(x-${d})`, art: "term" }; },
  "z-binom": () => { const a = ganz(2, 7);
    return { frage: `Multipliziere aus: $(x + ${a})^2$.`, loesung: `(x+${a})^2`, art: "term" }; },
  "z-lgl": () => { const x = ganz(-5, 9), a = ganz(3, 6), c = ganz(1, a - 1), b = ganz(-8, 8);
    return { frage: `Löse $${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${c}x ${a * x + b - c * x < 0 ? "-" : "+"} ${Math.abs(a * x + b - c * x)}$.`, loesung: String(x), art: "zahl" }; },
  "z-lgs": () => { const x = ganz(-3, 5), y = ganz(-3, 5);
    return { frage: `$x + y = ${x + y}$ und $x - y = ${x - y}$. Wie groß ist $x$?`, loesung: String(x), art: "zahl" }; },
  "z-prozent": () => { const p = zuf([15, 20, 25, 40]), g = zuf([40, 60, 80, 120]);
    return { frage: `Wie viel sind $${p}\\,\\%$ von $${g}$?`, loesung: String((p * g) / 100), art: "zahl" }; },
  "f-lin": () => { const m = ohneNull(-3, 4), x1 = ganz(-2, 2), y1 = ganz(-3, 3), x2 = x1 + ganz(1, 3);
    return { frage: `Welche Steigung hat die Gerade durch $P(${x1} \\, | \\, ${y1})$ und $Q(${x2} \\, | \\, ${y1 + m * (x2 - x1)})$?`, loesung: String(m), art: "zahl" }; },
  "m-kreis": () => { const r = ganz(2, 7);
    return { frage: `Ein Kreis hat den Radius $${r}$. Wie groß ist sein Flächeninhalt? Gib ihn mit $\\pi$ an.`, loesung: `${r * r}*pi`, art: "zahl", hinweis: "π als pi eintippen, z. B. 9pi" }; },
  "d-laplace": () => { const k = ganz(2, 5);
    return { frage: `Ein fairer Würfel wird geworfen. Wie groß ist die Wahrscheinlichkeit für eine Augenzahl größer als $${k}$?`, loesung: `${6 - k}/6`, art: "zahl", hinweis: "als Bruch, z. B. 1/3" }; },
  "z-pot": () => { const a = ganz(2, 6), b = ganz(2, 6);
    return { frage: `$2^{${a}} \\cdot 2^{${b}} = 2^{?}$ — welcher Exponent gehört an die Stelle des Fragezeichens?`, loesung: String(a + b), art: "zahl" }; },
  "z-wurzel": () => { const a = zuf([4, 9, 16, 25]), b = zuf([4, 9, 36]);
    return { frage: `Berechne $\\sqrt{${a} \\cdot ${b}}$.`, loesung: String(Math.sqrt(a * b)), art: "zahl" }; },
  "z-qgl": () => { const r1 = ganz(-4, 1), r2 = r1 + ganz(1, 5);
    return { frage: `Löse $x^2 ${-(r1 + r2) < 0 ? "-" : "+"} ${Math.abs(r1 + r2)}x ${r1 * r2 < 0 ? "-" : "+"} ${Math.abs(r1 * r2)} = 0$. Gib die größere Lösung an.`, loesung: String(r2), art: "zahl" }; },
  "f-quad": () => { const xs = ganz(-4, 4), ys = ganz(-5, 5);
    return { frage: `Gegeben ist $f(x) = (x ${xs < 0 ? "+" : "-"} ${Math.abs(xs)})^2 ${ys < 0 ? "-" : "+"} ${Math.abs(ys)}$. Welche x-Koordinate hat der Scheitelpunkt?`, loesung: String(xs), art: "zahl" }; },
  "f-exp": () => { const t = zuf([2, 3, 5]), n = zuf([2, 3, 4]);
    return { frage: `Eine Bakterienkultur verdoppelt sich alle $${t}$ Stunden. Um welchen Faktor ist sie nach $${t * n}$ Stunden gewachsen?`, loesung: String(2 ** n), art: "zahl" }; },
  "z-log": () => { const n = ganz(3, 7);
    return { frage: `Berechne $\\log_2(${2 ** n})$.`, loesung: String(n), art: "zahl" }; },
  "r-pyth": () => { const [a, b, c] = zuf([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
    return { frage: `Ein rechtwinkliges Dreieck hat die Katheten $${a}$ und $${b}$. Wie lang ist die Hypotenuse?`, loesung: String(c), art: "zahl" }; },
  "r-trig": () => { const [w, v] = zuf([[30, "0.5"], [90, "1"], [0, "0"]]);
    return { frage: `Wie groß ist $\\sin(${w}°)$?`, loesung: v, art: "zahl" }; },
  "d-mehrstufig": () => { const r = ganz(2, 4), b = ganz(2, 4);
    return { frage: `In einer Urne liegen $${r}$ rote und $${b}$ blaue Kugeln. Es wird zweimal mit Zurücklegen gezogen. Wie groß ist die Wahrscheinlichkeit für zweimal Rot?`, loesung: `(${r}/${r + b})^2`, art: "zahl", hinweis: "als Bruch, z. B. 4/9" }; },
  "a-regeln": () => { const a = ganz(2, 5), n = ganz(3, 5), b = ohneNull(-6, 6);
    return { frage: `Bilde die Ableitung von $f(x) = ${a}x^{${n}} ${b < 0 ? "-" : "+"} ${Math.abs(b)}x$.`, loesung: `${a * n}x^${n - 1}+${b}`, art: "term" }; },
  "a-produkt": () => ({ frage: `Bilde die Ableitung von $f(x) = x \\cdot e^x$.`, loesung: `e^x*(1+x)`, art: "term" }),
  "a-kette": () => { const a = ganz(2, 4), n = ganz(2, 4);
    return { frage: `Bilde die Ableitung von $f(x) = (${a}x + 1)^{${n}}$.`, loesung: `${a * n}*(${a}x+1)^${n - 1}`, art: "term" }; },
  "a-extrem": () => { const k = ganz(1, 3);
    return { frage: `An welcher Stelle hat $f(x) = x^3 - ${3 * k * k}x$ ihren Hochpunkt?`, loesung: String(-k), art: "zahl" }; },
  "a-int": () => { const a = ganz(2, 5), n = ganz(1, 3);
    return { frage: `Gib die Stammfunktion $F$ von $f(x) = ${a * (n + 1)}x^{${n}}$ mit $F(0) = 0$ an.`, loesung: `${a}x^${n + 1}`, art: "term" }; },
  "g-vek": () => { const [x, y, z, l] = zuf([[3, 4, 12, 13], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11]]);
    return { frage: `Wie lang ist der Vektor $\\vec{v} = (${x} \\, | \\, ${y} \\, | \\, ${z})$?`, loesung: String(l), art: "zahl" }; },
  "s-binom": () => ({ frage: `Eine faire Münze wird dreimal geworfen. Wie groß ist die Wahrscheinlichkeit für genau zweimal Kopf?`, loesung: "3/8", art: "zahl", hinweis: "als Bruch oder Dezimalzahl" }),
};


export const ANKER = Object.keys(DIAG).filter((id) => aktiv(id));

/* Wie viele Kompetenzen hängen an dieser? Wichtige Knoten werden zuerst geprüft. */

export const GEWICHT = Object.fromEntries(KOMPETENZEN.map((k) => [k.id, alleNachfolger(k.id).size]));


export const LERN_SCHLUESSEL = "matheskript-lernstand-v1";

export const RAM_SPEICHER = {};

/* ---------- Lernstand ---------- */

/* Status je Kompetenz:
   sicher   — in einer Prüfung bestätigt
   vermutet — aus einer bestandenen Nachfolgerkompetenz geschlossen
   luecke   — in einer Prüfung nicht gekonnt
   arbeit   — gerade im Üben                                              */

export const LERN = { profil: null, stand: {}, einstufung: null, aktivitaet: {}, plan: null, verlauf: [], testFehl: {}, letzteAktivitaet: 0, messungen: {}, experimente: {}, noten: [], pseudonym: null, termine: [], geladen: false, hoerer: new Set() };


export const GRUPPE_ZU_KOMPETENZ = {
  "Polynome": "a-regeln", "Produkte": "a-produkt", "Quotienten": "a-produkt",
  "Verkettungen": "a-kette", "Spezielle Funktionen": "a-efkt",
  "Scheitelpunkt einer Parabel": "f-quad", "Nullstellen einer Parabel": "z-qgl",
  "Tangente an eine Parabel": "a-anw", "Extrempunkte einer kubischen Funktion": "a-extrem",
  "Graph-Zuordnung": "a-regeln",
};


export const STATUS_STIL = {
  sicher: { name: "gesichert", fuell: C.see, rand: C.see, text: C.weiss },
  vermutet: { name: "vermutlich sicher", fuell: "#FFEFB0", rand: C.see, text: C.see },
  arbeit: { name: "in Arbeit", fuell: C.weiss, rand: C.gruenDunkel, text: C.gruenDunkel },
  luecke: { name: "Lücke", fuell: "#F6E3DA", rand: C.signal, text: C.signal },
  offen: { name: "offen", fuell: C.weiss, rand: C.linie, text: C.grau },
};

export const statusVon = (stand, id) => stand[id]?.status || "offen";

/* ---------- Profil ---------- */


export const EINSTUFUNG_MAX = 16;


export const TIEFE = Object.fromEntries(KOMPETENZEN.map((k) => [k.id, alleVoraussetzungen(k.id).size]));


export const VORAUSBLICK = (() => {
  const v = {};
  KOMPETENZEN.forEach((k) => (k.rueck || []).forEach((r) => { (v[r.id] = v[r.id] || []).push({ id: k.id, satz: r.satz }); }));
  return v;
})();


export const SR_ABSTAENDE = [1, 3, 7, 21, 60];

export const TAG_MS = 86400000;

export const faelligIn = (tage) => Date.now() + tage * TAG_MS;


export const EINHEITEN = {
  "a-aend": {
    einstieg: {
      text: "Ein Auto legt in $t$ Sekunden $s(t) = t^2$ Meter zurück. Wie schnell ist es genau nach drei Sekunden? Der Tacho zeigt eine Zahl — aber Geschwindigkeit ist doch Strecke durch Zeit. Welche Strecke, welche Zeit?",
      aufloesung: "Strecke durch Zeit liefert immer einen Durchschnitt über ein Intervall. Die Geschwindigkeit in einem Augenblick entsteht, wenn man dieses Intervall immer kürzer macht, bis es verschwindet. Genau das ist die Ableitung.",
    },
    verstehen: [
      { t: "text", s: "Zwischen zwei Punkten eines Graphen lässt sich die Steigung wie bei einer Geraden berechnen. Die Verbindungsgerade heißt Sekante, ihre Steigung ist der Differenzenquotient." },
      { t: "formel", titel: "Differenzenquotient", zeilen: ["\\frac{f(x_0+h) - f(x_0)}{h}"] },
      { t: "text", s: "Schiebe unten den Regler für $h$ nach links. Der zweite Punkt rückt an den ersten heran, die Sekante dreht sich — und nähert sich einer festen Geraden, der Tangente." },
      { t: "formel", titel: "Ableitung", zeilen: ["f′(x_0) = \\lim_{h \\to 0} \\frac{f(x_0+h) - f(x_0)}{h}"] },
      { t: "merk", s: "Erst ausmultiplizieren, dann $h$ ausklammern und kürzen, und erst ganz am Ende $h \\to 0$. Setzt man $h$ zu früh null, steht $\\frac{0}{0}$ da." },
    ],
    visual: "sekante",
    erzeuger: () => {
      const a = zuf([1, 2, 3]), x0 = ganz(1, 4), ak = a === 1 ? "" : String(a);
      return {
        frage: `Bestimme mit der h-Methode $f′(${x0})$ für $f(x) = ${ak}x^2$.`, praefix: `f′(${x0}) =`,
        loesung: String(2 * a * x0), art: "zahl",
        weg: [
          W("Stelle den Differenzenquotienten an der Stelle auf.", `\\frac{f(${x0}+h) - f(${x0})}{h}`),
          W("Setze ein und multipliziere aus. Die Konstanten heben sich weg.", `\\frac{${ak}(${x0}+h)^2 - ${a * x0 * x0}}{h} = \\frac{${2 * a * x0}h + ${ak}h^2}{h}`),
          W("Klammere h aus und kürze.", `= ${2 * a * x0} + ${ak}h`),
          W("Erst jetzt h gegen null gehen lassen.", `f′(${x0}) = ${2 * a * x0}`),
        ],
      };
    },
  },
  "a-regeln": {
    einstieg: {
      text: "Die h-Methode funktioniert immer — aber für $x^7$ müsstest du $(x+h)^7$ ausmultiplizieren. Acht Summanden. Gibt es ein Muster, das dir die Arbeit abnimmt?",
      aufloesung: "Ja. Für $x^2$ kam $2x$ heraus, für $x^3$ kam $3x^2$. Der Exponent wandert nach vorn und sinkt um eins — das ist die Potenzregel, und sie gilt immer.",
    },
    verstehen: [
      { t: "formel", titel: "Potenzregel", zeilen: ["(x^n)′ = n \\cdot x^{n-1}"] },
      { t: "formel", titel: "Faktor- und Summenregel", zeilen: ["(c \\cdot f)′ = c \\cdot f′", "(u + v)′ = u′ + v′"] },
      { t: "text", s: "Unten siehst du den Graphen von $x^n$ mit seiner Tangente. Verschiebe die Stelle und vergleiche die angezeigte Steigung mit dem, was die Potenzregel vorhersagt." },
      { t: "merk", s: "Die Ableitung einer Konstanten ist null. Das absolute Glied fällt beim Ableiten weg — eine Verschiebung nach oben ändert keine Steigung." },
    ],
    visual: "tangente",
    erzeuger: ausAbleitungstyp("polynom", [2, 3, 3]),
  },
  "a-produkt": {
    einstieg: {
      text: "$f(x) = x^2 \\cdot x^3$. Jemand leitet beide Faktoren einzeln ab und multipliziert: $2x \\cdot 3x^2 = 6x^3$. Fasst man zuerst zusammen, ist $f(x) = x^5$ und $f′(x) = 5x^4$. Beides kann nicht stimmen.",
      aufloesung: "Richtig ist $5x^4$. Ein Produkt wird nicht gliedweise abgeleitet — wenn beide Faktoren sich ändern, entstehen zwei Beiträge. Genau das beschreibt die Produktregel.",
    },
    verstehen: [
      { t: "formel", titel: "Produktregel", zeilen: ["(u \\cdot v)′ = u′v + uv′"] },
      { t: "text", s: "Stell dir ein Rechteck mit den Seiten $u$ und $v$ vor. Wächst $u$ ein wenig, kommt ein Streifen $u′ \\cdot v$ dazu. Wächst $v$, ein Streifen $u \\cdot v′$. Die Ableitung ist die Summe beider Streifen." },
      { t: "formel", titel: "Quotientenregel", zeilen: ["\\left( \\frac{u}{v} \\right)′ = \\frac{u′v - uv′}{v^2}"] },
      { t: "merk", s: "Schreib $u$, $u′$, $v$ und $v′$ zuerst getrennt auf, bevor du einsetzt. Genau an dieser Stelle entstehen sonst die Fehler." },
    ],
    visual: null,
    erzeuger: ausAbleitungstyp("produkt", [1, 2, 3]),
  },
  "a-kette": {
    einstieg: {
      text: "$f(x) = (2x + 1)^3$. Die Potenzregel liefert $3(2x+1)^2$. Multipliziert man vorher aus und leitet dann ab, kommt $6(2x+1)^2$ heraus. Woher kommt der Faktor 2?",
      aufloesung: "Aus der inneren Funktion $2x + 1$. Sie ändert sich doppelt so schnell wie $x$ — und diese Geschwindigkeit überträgt sich auf das Ganze. Äußere Ableitung mal innere Ableitung.",
    },
    verstehen: [
      { t: "formel", titel: "Kettenregel", zeilen: ["f(x) = u(v(x)) \\quad\\Rightarrow\\quad f′(x) = u′(v(x)) \\cdot v′(x)"] },
      { t: "text", s: "Zerlege jede verkettete Funktion zuerst in eine äußere und eine innere. Bei $\\sin(3x)$ ist die äußere der Sinus, die innere $3x$." },
      { t: "merk", s: "Die innere Ableitung ist der Faktor, der am häufigsten vergessen wird. Prüfe am Ende immer: Steht sie als Faktor vorn?" },
    ],
    visual: null,
    erzeuger: ausAbleitungstyp("kette", [2, 3, 4]),
  },
  "f-quad": {
    einstieg: {
      text: "Ein Ball fliegt auf der Bahn $h(x) = -x^2 + 6x$. Wie hoch kommt er? Du könntest viele Werte einsetzen und den größten suchen — aber woher weißt du, dass du den höchsten Punkt getroffen hast?",
      aufloesung: "Am höchsten Punkt steigt die Bahn nicht mehr und fällt noch nicht — die Tangente ist waagerecht. Diese Bedingung liefert die Stelle exakt, ohne Probieren.",
    },
    verstehen: [
      { t: "text", s: "Jede Parabel hat genau einen Scheitelpunkt. In der Scheitelpunktform kann man ihn direkt ablesen." },
      { t: "formel", titel: "Scheitelpunktform", zeilen: ["f(x) = a(x - x_s)^2 + y_s \\quad\\Rightarrow\\quad S(x_s \\, | \\, y_s)"] },
      { t: "text", s: "Aus der allgemeinen Form bekommst du ihn über die Ableitung: $f′(x) = 0$ setzen, nach $x$ lösen, in $f$ einsetzen. Mit den Reglern unten siehst du, wie $a$, $x_s$ und $y_s$ die Parabel bewegen." },
      { t: "merk", s: "Ist $a$ positiv, öffnet die Parabel nach oben und der Scheitel ist ein Tiefpunkt. Ist $a$ negativ, ein Hochpunkt." },
    ],
    visual: "parabel",
    erzeuger: () => {
      const auf = FR.parabelErzeugen();
      const typ = WEG_TYPEN[0];
      return {
        frage: `Bestimme den Scheitelpunkt von $f(x) = ${auf.tex}$. Gib seine y-Koordinate ein.`, praefix: "y =",
        loesung: String(auf.ys), art: "zahl",
        weg: typ.schritte.map((s) => W(s.tipp, s.muster(auf).replace(/\+\s*-/g, "- ").replace(/\s*\+\s*0(?![\d.,])/g, ""))),
      };
    },
  },
  "a-int": {
    einstieg: {
      text: "Die Ableitung von $x^3$ ist $3x^2$. Jetzt andersherum: Welche Funktion hat die Ableitung $3x^2$? Und gibt es nur eine?",
      aufloesung: "$x^3$ — aber auch $x^3 + 5$ und $x^3 - 2$, denn Konstanten verschwinden beim Ableiten. Es gibt unendlich viele Stammfunktionen, die sich nur um eine Konstante unterscheiden.",
    },
    verstehen: [
      { t: "formel", titel: "Potenzregel rückwärts", zeilen: ["f(x) = x^n \\quad\\Rightarrow\\quad F(x) = \\frac{1}{n+1} x^{n+1} + C"] },
      { t: "text", s: "Das bestimmte Integral misst die Fläche unter dem Graphen. Unten wird sie durch Rechtecke angenähert — je mehr, desto genauer. Im Grenzwert ergibt sich genau der Wert der Stammfunktion." },
      { t: "formel", titel: "Hauptsatz", zeilen: ["\\int_a^b f(x) \\, dx = F(b) - F(a)"] },
      { t: "merk", s: "Prüfe jede Stammfunktion durch Ableiten. Kommt $f$ heraus, stimmt sie." },
    ],
    visual: "integral",
    erzeuger: () => {
      const k = ganz(1, 4), n = ganz(1, 3), c = k * (n + 1);
      return {
        frage: `Gib die Stammfunktion $F$ von $f(x) = ${c}x^{${n}}$ mit $F(0) = 0$ an.`, praefix: "F(x) =",
        loesung: `${k}x^${n + 1}`, zeig: `${k}x^{${n + 1}}`, art: "term",
        weg: [
          W("Potenzregel rückwärts: Der Exponent steigt um eins.", `x^{${n}} \\;\\to\\; x^{${n + 1}}`),
          W("Damit die Ableitung wieder stimmt, durch den neuen Exponenten teilen.", `\\frac{${c}}{${n + 1}} \\, x^{${n + 1}}`),
          W("Kürzen. Die Konstante ist null, weil F(0) = 0 gelten soll.", `F(x) = ${k}x^{${n + 1}}`),
          W("Probe durch Ableiten.", `F′(x) = ${c}x^{${n}} = f(x)`),
        ],
      };
    },
  },
};

/* Kompetenzen ohne ausgearbeitete Einheit bekommen eine Kurzform aus ihren
   Diagnoseaufgaben: Verstehen, Üben, Test. */

export const hatEinheit = (id) => aktiv(id) && !!(EINHEITEN[id] || DIAG[id]);


export const komma = (v, n = 2) => (Math.round(v * 10 ** n) / 10 ** n).toString().replace(".", ",");


export const VISUALISIERUNGEN = { sekante: (...a) => FR.VisSekante(...a), tangente: (...a) => FR.VisTangente(...a), parabel: (...a) => FR.VisParabel(...a), integral: (...a) => FR.VisIntegral(...a) };

/* ---------- Mathilda als Tutorin ---------- */

/* Sokratisch: stellt Fragen, gibt Hinweise, verrät nie das Ergebnis.
   Zur Sicherheit wird jede Antwort zusätzlich auf die Lösung geprüft. */

export const PHASEN_NAME = { vortest: "Vortest", bruecke: "Anknüpfen", einstieg: "Einstieg", verstehen: "Verstehen", beispiele: "Beispiele", ueben: "Üben", test: "Test" };

export const UEBEN_ANZAHL = 5, TEST_ANZAHL = 5, TEST_GRENZE = 4;


export const mischen = (n) => {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/* Üblicher Umrechnungsschlüssel von Prozent auf Notenpunkte im Abitur. */

export const NOTENSCHLUESSEL = [[95, 15], [90, 14], [85, 13], [80, 12], [75, 11], [70, 10], [65, 9], [60, 8],
  [55, 7], [50, 6], [45, 5], [40, 4], [33, 3], [27, 2], [20, 1], [0, 0]];

export const notenpunkte = (prozent) => NOTENSCHLUESSEL.find(([g]) => prozent >= g)[1];

export const notenText = (np) => (np >= 13 ? "sehr gut" : np >= 10 ? "gut" : np >= 7 ? "befriedigend" : np >= 4 ? "ausreichend" : np >= 1 ? "mangelhaft" : "ungenügend");

/* Mit Hilfsmitteln wird gerundet — auf drei Nachkommastellen genau genügt. */

export const AFB_FARBE = { I: C.see, II: C.gruenDunkel, III: C.seeTief };


export const OPERATOREN = [
  { op: "angeben", afb: "I", verlangt: "Ein Ergebnis ohne Rechnung und ohne Begründung hinschreiben.",
    reichtNicht: "—", beispiel: "Geben Sie die Nullstellen von $f(x) = (x-1)(x+3)$ an.", falle: "Wer hier seitenlang rechnet, verliert keine Punkte, aber Zeit." },
  { op: "berechnen", afb: "I", verlangt: "Ein Ergebnis aus einem Ansatz mit Rechenschritten gewinnen.",
    reichtNicht: "Nur das Ergebnis — der Weg gehört dazu.", beispiel: "Berechnen Sie $f′(2)$.", falle: "Ergebnis vom Taschenrechner ohne Ansatz: Punktabzug." },
  { op: "bestimmen", afb: "II", verlangt: "Einen Lösungsweg darstellen und das Ergebnis formulieren. Das Verfahren ist frei wählbar.",
    reichtNicht: "Ein Ergebnis ohne erkennbaren Weg.", beispiel: "Bestimmen Sie die Extrempunkte von $f$.", falle: "Die hinreichende Bedingung oder die y-Koordinate vergessen." },
  { op: "skizzieren", afb: "I", verlangt: "Die wesentlichen Eigenschaften grafisch darstellen: markante Punkte, Verlauf, Achsenbeschriftung.",
    reichtNicht: "Eine Kurve ohne erkennbare Extrem- und Nullstellen.", beispiel: "Skizzieren Sie den Graphen von $f$.", falle: "Maßstab fehlt oder markante Punkte liegen erkennbar falsch." },
  { op: "zeigen", afb: "II", verlangt: "Eine vorgegebene Aussage mit gültigen Schlussregeln und Rechnungen bestätigen.",
    reichtNicht: "Das Ergebnis mit dem GTR ablesen oder nur einsetzen, ohne Schluss.", beispiel: "Zeigen Sie, dass $f$ bei $x = 2$ einen Hochpunkt hat.", falle: "Das Ziel ist bekannt — die Punkte gibt es nur für den Weg dorthin." },
  { op: "begründen", afb: "III", verlangt: "Einen Sachverhalt auf Regeln, Sätze oder Zusammenhänge zurückführen.",
    reichtNicht: "Eine Behauptung ohne Bezug auf eine Regel.", beispiel: "Begründen Sie, dass $f$ keine Nullstelle hat.", falle: "Ein Beispiel ist keine Begründung für eine allgemeine Aussage." },
  { op: "untersuchen", afb: "II", verlangt: "Sachverhalte nach bestimmten Kriterien prüfen und das Ergebnis angeben.",
    reichtNicht: "Rechnen ohne Schlussfolgerung.", beispiel: "Untersuchen Sie $f$ auf Symmetrie.", falle: "Am Ende fehlt der Antwortsatz." },
  { op: "interpretieren", afb: "III", verlangt: "Ein mathematisches Ergebnis im Sachzusammenhang deuten — mit Einheit.",
    reichtNicht: "Das Ergebnis nur wiederholen.", beispiel: "Interpretieren Sie $f′(3) = -2$ im Sachzusammenhang.", falle: "Die Einheit fehlt, oder es wird Durchschnitt mit Momentanwert verwechselt." },
  { op: "beurteilen", afb: "III", verlangt: "Zu einem Sachverhalt ein selbstständiges, begründetes Urteil abgeben.",
    reichtNicht: "Eine Meinung ohne mathematisches Argument.", beispiel: "Beurteilen Sie, ob das Modell für große t sinnvoll ist.", falle: "Urteil ohne Kriterium — das zählt nicht als Beurteilung." },
  { op: "herleiten", afb: "III", verlangt: "Einen Zusammenhang aus bekannten Sätzen schrittweise entwickeln.",
    reichtNicht: "Die fertige Formel hinschreiben.", beispiel: "Leiten Sie die Ableitung von $x^2$ mit der h-Methode her.", falle: "Das Ergebnis vorwegnehmen und rückwärts argumentieren." },
];


export const OPERATOR_FAELLE = [
  { op: "zeigen", afb: "II", aufgabe: "Zeigen Sie, dass $f$ an der Stelle $x = 2$ einen Hochpunkt hat.",
    antworten: [
      { t: "$f′(2) = 0$, also liegt bei $x = 2$ ein Hochpunkt.", ok: false, warum: "Nur die notwendige Bedingung. Auch ein Tiefpunkt oder Sattelpunkt hätte $f′(2) = 0$." },
      { t: "$f′(2) = 0$ und $f″(2) = -3 < 0$, also Hochpunkt bei $x = 2$.", ok: true, warum: "Notwendige und hinreichende Bedingung, dazu der Schluss. Volle Punktzahl." },
      { t: "Der GTR zeigt bei $x = 2$ einen Hochpunkt.", ok: false, warum: "Bei „zeigen“ zählt der Nachweis. Ein Ablesen ist kein Nachweis." },
    ] },
  { op: "bestimmen", afb: "II", aufgabe: "Bestimmen Sie die Extrempunkte von $f(x) = x^3 - 3x$.",
    antworten: [
      { t: "$x_1 = -1$, $x_2 = 1$", ok: false, warum: "Das sind Extremstellen, keine Punkte — die y-Koordinaten fehlen, ebenso die Art." },
      { t: "$f′(x) = 3x^2 - 3 = 0 \\Rightarrow x = \\pm 1$. $f″(-1) = -6 < 0$: $H(-1 \\,|\\, 2)$. $f″(1) = 6 > 0$: $T(1 \\,|\\, -2)$.", ok: true, warum: "Ansatz, beide Stellen, Art mit Begründung, vollständige Punkte." },
      { t: "$H(-1 \\,|\\, 2)$ und $T(1 \\,|\\, -2)$", ok: false, warum: "Richtiges Ergebnis, aber „bestimmen“ verlangt einen erkennbaren Weg. Deutlicher Punktabzug." },
    ] },
  { op: "angeben", afb: "I", aufgabe: "Geben Sie die Nullstellen von $f(x) = (x - 2)(x + 5)$ an.",
    antworten: [
      { t: "$x_1 = 2$, $x_2 = -5$", ok: true, warum: "Genau das ist verlangt: das Ergebnis, ohne Rechnung." },
      { t: "Ausmultiplizieren, pq-Formel, $x_1 = 2$, $x_2 = -5$", ok: true, warum: "Auch volle Punktzahl — aber du hast Zeit verschenkt. Bei „angeben“ reicht das Ergebnis." },
      { t: "$x = 2$", ok: false, warum: "Unvollständig — die zweite Nullstelle fehlt." },
    ] },
  { op: "begründen", afb: "III", aufgabe: "Begründen Sie, dass der Graph von $f(x) = x^4 + x^2$ achsensymmetrisch zur y-Achse ist.",
    antworten: [
      { t: "Setzt man $x = 1$ und $x = -1$ ein, kommt beide Male 2 heraus.", ok: false, warum: "Ein Beispiel beweist keine allgemeine Aussage. Es müsste für alle x gelten." },
      { t: "$f(-x) = (-x)^4 + (-x)^2 = x^4 + x^2 = f(x)$ für alle $x$, also achsensymmetrisch.", ok: true, warum: "Allgemeiner Nachweis über $f(-x) = f(x)$ mit Schluss." },
      { t: "Weil nur gerade Exponenten vorkommen.", ok: true, warum: "Als Begründung anerkannt, wenn die Regel bekannt ist. Sicherer ist der Nachweis über $f(-x)$." },
    ] },
  { op: "interpretieren", afb: "III", aufgabe: "$W(t)$ ist der Wasserstand eines Sees in cm, $t$ in Tagen. Interpretieren Sie $W′(10) = -3$.",
    antworten: [
      { t: "Der Wasserstand beträgt am zehnten Tag −3 cm.", ok: false, warum: "Verwechselt Funktionswert und Änderungsrate. $W′$ ist eine Geschwindigkeit, kein Stand." },
      { t: "Am zehnten Tag sinkt der Wasserstand momentan um 3 cm pro Tag.", ok: true, warum: "Momentane Änderung, Richtung, Einheit — alles da." },
      { t: "In den ersten zehn Tagen ist der Wasserstand um 3 cm gesunken.", ok: false, warum: "Das wäre eine Gesamtänderung über ein Intervall, nicht die momentane Rate." },
    ] },
  { op: "berechnen", afb: "I", aufgabe: "Berechnen Sie $f′(2)$ für $f(x) = 3x^2 - 4x$.",
    antworten: [
      { t: "$f′(2) = 4$", ok: false, warum: "Ergebnis richtig, aber „berechnen“ verlangt den Ansatz. Mindestens $f′(x)$ muss dastehen." },
      { t: "$f′(x) = 6x - 4$, $f′(2) = 12 - 4 = 8$", ok: true, warum: "Ansatz und Rechnung. Und das Ergebnis stimmt — 8, nicht 4." },
      { t: "$f′(x) = 6x - 4$, $f′(2) = 8$", ok: true, warum: "Ansatz und Ergebnis genügen hier." },
    ] },
  { op: "untersuchen", afb: "II", aufgabe: "Untersuchen Sie, ob $f(x) = x^3 - x$ punktsymmetrisch zum Ursprung ist.",
    antworten: [
      { t: "$f(-x) = -x^3 + x = -(x^3 - x) = -f(x)$", ok: false, warum: "Rechnung richtig, aber der Antwortsatz fehlt. Untersuchen heißt: Ergebnis angeben." },
      { t: "$f(-x) = -x^3 + x = -f(x)$, also ist $f$ punktsymmetrisch zum Ursprung.", ok: true, warum: "Prüfung und Schluss." },
      { t: "Ja, weil der Graph so aussieht.", ok: false, warum: "Ein Eindruck ist keine Untersuchung." },
    ] },
];


export const BEGRUENDEN = [
  { op: "begründen", afb: "III", thema: "a-null",
    aufgabe: "Begründen Sie, dass jede ganzrationale Funktion dritten Grades mindestens eine Nullstelle hat.",
    raster: ["Grenzverhalten: Für $x \\to +\\infty$ und $x \\to -\\infty$ gehen die Funktionswerte in entgegengesetzte Richtungen.",
      "Der Graph ist durchgehend, ohne Sprünge (stetig).", "Schluss: Also muss er die x-Achse mindestens einmal schneiden."],
    muster: "Für $f(x) = ax^3 + \\dots$ mit $a \\neq 0$ bestimmt der Term $ax^3$ das Verhalten im Unendlichen: Die Funktionswerte laufen für $x \\to \\infty$ und $x \\to -\\infty$ in entgegengesetzte Richtungen. Da der Graph keine Sprünge hat, muss er dazwischen die x-Achse schneiden." },
  { op: "zeigen", afb: "II", thema: "a-extrem",
    aufgabe: "Zeigen Sie, dass die Bedingung $f′(x_0) = 0$ allein nicht ausreicht, um auf einen Extrempunkt zu schließen.",
    raster: ["Ein konkretes Gegenbeispiel wird angegeben, etwa $f(x) = x^3$ an der Stelle 0.", "Nachweis, dass dort $f′ = 0$ gilt.",
      "Nachweis, dass trotzdem kein Extrempunkt vorliegt (kein Vorzeichenwechsel von $f′$, Sattelpunkt)."],
    muster: "Gegenbeispiel $f(x) = x^3$: Es ist $f′(x) = 3x^2$, also $f′(0) = 0$. Aber $f′(x) > 0$ für alle $x \\neq 0$, die Funktion steigt links und rechts von 0 — kein Vorzeichenwechsel, also kein Extrempunkt, sondern ein Sattelpunkt." },
  { op: "beweisen", afb: "III", thema: "z-term",
    aufgabe: "Beweisen Sie: Die Summe zweier ungerader Zahlen ist immer gerade.",
    raster: ["Allgemeiner Ansatz: zwei ungerade Zahlen als $2m + 1$ und $2n + 1$ mit ganzen Zahlen $m, n$.",
      "Umformung der Summe zu $2(m + n + 1)$.", "Schluss: Ein Vielfaches von 2 ist gerade."],
    muster: "Seien $2m + 1$ und $2n + 1$ zwei ungerade Zahlen mit ganzen Zahlen $m, n$. Ihre Summe ist $2m + 2n + 2 = 2(m + n + 1)$. Da $m + n + 1$ ganzzahlig ist, ist die Summe ein Vielfaches von 2, also gerade." },
  { op: "begründen", afb: "II", thema: "f-poly",
    aufgabe: "Begründen Sie, dass der Graph von $f(x) = x^4 - 2x^2 + 3$ achsensymmetrisch zur y-Achse ist.",
    raster: ["$f(-x)$ wird allgemein berechnet.", "Es wird gezeigt, dass $f(-x) = f(x)$ für alle $x$ gilt.", "Schluss auf die Achsensymmetrie."],
    muster: "$f(-x) = (-x)^4 - 2(-x)^2 + 3 = x^4 - 2x^2 + 3 = f(x)$ für alle $x$. Also ist der Graph achsensymmetrisch zur y-Achse." },
  { op: "interpretieren", afb: "III", thema: "a-aend",
    aufgabe: "$V(t)$ beschreibt das Wasservolumen in einem Becken in Litern, $t$ in Minuten. Interpretieren Sie $V′(5) = 12$ im Sachzusammenhang.",
    raster: ["Es wird die momentane Änderung beschrieben, nicht das Volumen selbst.", "Die Einheit Liter pro Minute wird genannt.",
      "Die Richtung (zunehmend) und der Zeitpunkt $t = 5$ werden genannt."],
    muster: "Genau fünf Minuten nach Beobachtungsbeginn nimmt das Wasservolumen momentan um 12 Liter pro Minute zu." },
  { op: "beweisen", afb: "III", thema: "z-wurzel",
    aufgabe: "Beweisen Sie, dass $\\sqrt{2}$ keine rationale Zahl ist.",
    raster: ["Annahme des Gegenteils: $\\sqrt{2} = \\frac{p}{q}$ mit vollständig gekürztem Bruch.",
      "Folgerung $p^2 = 2q^2$, also ist $p$ gerade.", "Daraus folgt, dass auch $q$ gerade ist.", "Widerspruch zur Kürzung — also ist die Annahme falsch."],
    muster: "Angenommen, $\\sqrt{2} = \\frac{p}{q}$ mit teilerfremden $p, q$. Dann ist $p^2 = 2q^2$, also $p^2$ gerade und damit $p$ gerade: $p = 2k$. Einsetzen liefert $4k^2 = 2q^2$, also $q^2 = 2k^2$ — auch $q$ ist gerade. Dann wären $p$ und $q$ nicht teilerfremd. Widerspruch." },
  { op: "begründen", afb: "II", thema: "a-regeln",
    aufgabe: "Begründen Sie, warum die Ableitung einer konstanten Funktion überall null ist.",
    raster: ["Der Differenzenquotient wird für $f(x) = c$ aufgestellt.", "Er ergibt $\\frac{c - c}{h} = 0$ für jedes $h$.",
      "Schluss: Der Grenzwert ist 0 — oder geometrisch: Der Graph ist waagerecht."],
    muster: "Für $f(x) = c$ ist $\\frac{f(x+h) - f(x)}{h} = \\frac{c - c}{h} = 0$ für jedes $h \\neq 0$. Also ist auch der Grenzwert für $h \\to 0$ gleich null. Anschaulich: Der Graph ist eine waagerechte Gerade, seine Steigung ist überall null." },
];


export const ABI_ZEIT = { A: 30 * 60, B: 90 * 60 };


export const MODELLE = [
  () => {
    const ga = zuf([5, 8, 10]), pa = zuf([2, 3]), gb = ga + zuf([10, 12, 15]), pb = pa - 1;
    const x = (gb - ga) / (pa - pb);
    return {
      thema: "f-lin", titel: "Handytarif",
      text: `Tarif A kostet ${ga} € Grundgebühr und ${pa} € pro Gigabyte. Tarif B kostet ${gb} € Grundgebühr und ${pb} € pro Gigabyte. Ab welchem Datenvolumen ist Tarif B günstiger?`,
      groessen: { frage: "Welche Größe ist hier die Variable x?", optionen: ["Das Datenvolumen in GB", "Die Kosten in Euro", "Die Grundgebühr"], richtig: 0 },
      modell: { frage: "Stelle die Kostenfunktion für Tarif A auf.", praefix: "K_A(x) =", loesung: `${pa}x+${ga}`, art: "term" },
      rechnen: { frage: "Bei welchem x kosten beide Tarife gleich viel?", praefix: "x =", loesung: String(x), art: "zahl" },
      deuten: { frage: "Was bedeutet das Ergebnis?", optionen: [`Ab mehr als ${komma(x)} GB ist Tarif B günstiger.`, `Bis ${komma(x)} GB ist Tarif B günstiger.`, `Tarif B ist immer um ${komma(x)} € günstiger.`], richtig: 0,
        warum: "Tarif B hat die höhere Grundgebühr, aber den niedrigeren Preis pro GB — er holt erst bei großem Volumen auf." },
    };
  },
  () => {
    const n0 = zuf([200, 500, 1000]), q = zuf([1.5, 2, 3]), t = zuf([3, 4, 5]);
    return {
      thema: "f-exp", titel: "Bakterienkultur",
      text: `Eine Bakterienkultur umfasst zu Beginn ${n0} Bakterien und wächst pro Stunde um den Faktor ${komma(q)}. Wie viele Bakterien sind es nach ${t} Stunden?`,
      groessen: { frage: "Welche Art von Wachstum liegt vor?", optionen: ["Exponentiell — gleicher Faktor pro Zeitschritt", "Linear — gleicher Zuwachs pro Zeitschritt", "Quadratisch"], richtig: 0 },
      modell: { frage: "Stelle die Funktion auf. Benutze x für die Zeit in Stunden.", praefix: "N(x) =", loesung: `${n0}*${q}^x`, art: "term" },
      rechnen: { frage: `Berechne N(${t}).`, praefix: `N(${t}) =`, loesung: String(n0 * q ** t), art: "zahl" },
      deuten: { frage: "Ist das Modell für sehr lange Zeiten realistisch?", optionen: ["Nein — Nährstoffe und Platz begrenzen das Wachstum irgendwann.", "Ja, exponentielles Wachstum geht beliebig lange weiter.", "Nein, weil die Anzahl sinkt."], richtig: 0,
        warum: "Jedes Modell hat einen Gültigkeitsbereich. Beurteilen heißt: diese Grenze benennen." },
    };
  },
  () => {
    const u = zuf([20, 24, 32, 40]);
    return {
      thema: "a-anw", titel: "Gehege mit Zaun",
      text: `Mit ${u} Metern Zaun soll ein rechteckiges Gehege mit möglichst großer Fläche eingezäunt werden. Wie lang muss eine Seite sein?`,
      groessen: { frage: "Was soll maximal werden?", optionen: ["Die Fläche", "Der Umfang", "Die Seitenlänge"], richtig: 0 },
      modell: { frage: `Ist x eine Seitenlänge, dann ist die andere ${u / 2} − x. Stelle die Flächenfunktion auf.`, praefix: "A(x) =", loesung: `x*(${u / 2}-x)`, art: "term" },
      rechnen: { frage: "Für welches x wird die Fläche maximal?", praefix: "x =", loesung: String(u / 4), art: "zahl" },
      deuten: { frage: "Was heißt das für die Form des Geheges?", optionen: ["Es ist ein Quadrat.", "Es ist doppelt so lang wie breit.", "Die Form ist egal."], richtig: 0,
        warum: `Beide Seiten sind ${u / 4} m lang. Bei festem Umfang hat das Quadrat die größte Fläche.` },
    };
  },
  () => {
    const h = zuf([2, 3]), w = zuf([8, 10, 12]);
    const a = -(4 * h) / (w * w);
    return {
      thema: "f-quad", titel: "Brückenbogen",
      text: `Ein Brückenbogen ist ${w} m breit und in der Mitte ${h} m hoch. Er soll durch eine Parabel beschrieben werden, deren Scheitel auf der y-Achse liegt.`,
      groessen: { frage: "Welche Punkte liegen sicher auf der Parabel?", optionen: [`S(0|${h}) und die Fußpunkte (±${w / 2}|0)`, `Nur der Punkt (0|0)`, `(${w}|${h})`], richtig: 0 },
      modell: { frage: "Stelle die Funktionsgleichung auf.", praefix: "f(x) =", loesung: `${a}*x^2+${h}`, art: "term" },
      rechnen: { frage: "Wie hoch ist der Bogen 2 m neben der Mitte?", praefix: "f(2) =", loesung: String(a * 4 + h), art: "zahl" },
      deuten: { frage: "Passt ein 1,8 m hoher Mensch 2 m neben der Mitte aufrecht darunter?", optionen: a * 4 + h >= 1.8 ? ["Ja", "Nein"] : ["Nein", "Ja"], richtig: 0,
        warum: `Der Bogen ist dort ${komma(a * 4 + h)} m hoch.` },
    };
  },
];


export const COACHING = { mail: "", termin: "" };

/* ---------- Aktivität ---------- */


export const tagSchluessel = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const wochentagIdx = (d = new Date()) => (d.getDay() + 6) % 7; // Montag = 0

export const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export const ICS_TAGE = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];


export const istLerntag = (t) => !!t && (t.sekunden >= 600 || t.aufgaben >= 5);

/* Serie: aufeinanderfolgende Lerntage. Tage, die nicht im Plan stehen,
   unterbrechen sie nicht — wer sonntags frei hat, verliert nichts. */

export const dauerText = (sek) => {
  const m = Math.round(sek / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`;
};

/* ---------- Eskalation ---------- */

/* Wann die App ehrlich sagt, dass jetzt ein Mensch besser hilft als sie. */

export const messungVor = (id, ok, n) => FR.messungSetzen(id, (m) => (m.vor ? m : { ...m, vor: { ok, n, zeit: Date.now() } }));

export const messungNach = (id, ok, n) => FR.messungSetzen(id, (m) => ({ ...m, nach: m.nach || { ok, n, zeit: Date.now() }, nachLetzt: { ok, n, zeit: Date.now() } }));

export const messungHalten = (id, ok) => FR.messungSetzen(id, (m) => {
  const basis = m.nach?.zeit || Date.now();
  return { ...m, halten: [...(m.halten || []), { ok, zeit: Date.now(), abstand: Math.round((Date.now() - basis) / TAG_MS) }].slice(-30) };
});

/* Experiment: Bei Einheiten mit Einstiegsproblem wird zufällig zugeteilt,
   ob das Problem vor (A) oder nach (B) der Erklärung kommt. Die Zuteilung
   bleibt pro Schüler und Kompetenz fest. */

export const VARIANTEN = { A: "Problem vor der Erklärung", B: "Erklärung vor dem Problem" };


export const pseudonymVon = (L) => L.pseudonym || "MS-NEU";

/* Anonymer Export: kein Name, nur Pseudonym, Klasse und Messwerte. */

