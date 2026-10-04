import { sprache } from "./i18n.js";
import React, { useState, useRef } from "react";
import { API_URL, C } from "./base1.jsx";
import { EINHEITEN, TAG_MS, WOCHENTAGE, tagSchluessel, wochentagIdx } from "./base3.jsx";
import { FR } from "./funcRegistry.jsx";

export const mittel = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN);

export const streuung = (a) => { if (a.length < 2) return NaN; const m = mittel(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };

/* Regularisierte unvollständige Betafunktion — Grundlage der t-Verteilung. */

export const pZweiseitig = (t, df) => FR.betaReg(df / 2, 0.5, df / (df + t * t));

/* t-Quantil für das 95-%-Intervall, per Bisektion aus der Verteilung. */

export const pz = (x) => (x === null || !isFinite(x) ? "—" : `${Math.round(x * 100)} %`);

/* ---------- Mein Messbericht ---------- */


export const TERMIN_ARTEN = ["Klassenarbeit", "Klausur", "Test"];

export const MIN_WIEDERHOLEN = 5;

export const minutenFuer = (id) => (EINHEITEN[id] ? 35 : 20);

export const traegtSchon = (L, id) => ["sicher", "vermutet"].includes(L.stand[id]?.status);

export const datumAus = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

export const tageBis = (s) => Math.round((datumAus(s) - datumAus(tagSchluessel())) / TAG_MS);

export const datumKurz = (d) => `${WOCHENTAGE[wochentagIdx(d)]} ${d.getDate()}.${d.getMonth() + 1}.`;

export const tageText = (n) => (n === 0 ? "heute" : n === 1 ? "morgen" : `in ${n} Tagen`);


export const ART_TEXT = { luecke: "Lücke schließen", neu: "Neu lernen", wiederholen: "Wiederholen", probe: "Probeklausur", nachbereiten: "Nachbereiten" };

export const ART_FARBE = { luecke: C.signal, neu: C.gruenDunkel, wiederholen: C.see, probe: C.seeTief, nachbereiten: C.gruenDunkel };


export const EINWILLIGUNG_SCHLUESSEL = "matheskript-einwilligung-v1";

/* Antwort der KI sicher lesen: Kommt kein JSON zurück (z. B. eine HTML-Fehlerseite),
   gibt es eine verständliche Meldung statt „The string did not match the expected pattern“. */
export async function kiAntwort(res) {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch {
    throw new Error(res.status === 404
      ? "Mathilda ist auf diesem Server noch nicht eingerichtet (die KI-Schnittstelle fehlt)."
      : `Mathilda hat gerade keine lesbare Antwort geliefert (Fehler ${res.status}). Bitte gleich noch einmal versuchen.`);
  }
}

export const kiKopf = () => (API_URL === "/api/claude"
  ? { "Content-Type": "application/json", "X-Geraet": FR.geraetKennung(), "X-Sprache": sprache() }
  : { "Content-Type": "application/json" });


/* ======================================================================
   SCHULKLASSEN
   Dieselben Inhalte wie die Lernlandkarte, aber nach Klassenstufe 8 bis 13
   sortiert statt nach Linie. Die Zuordnung kommt aus dem Buchverweis jeder
   Kompetenz: A1–A3 sind die älteren Bände (Klasse 5–7), LS8/LS9/LS10 die
   Klassenbände, KS die Kursstufe — dort hängt das Jahr von der Schule ab,
   deshalb erscheint der Stoff der Kursstufe in Klasse 11, 12 und 13 gleich.
   ====================================================================== */


export const SCHULKLASSEN = [8, 9, 10, 11, 12, 13];


export const komptrifftKlasse = (k, klasse) => {
  const j = FR.klasseVonBuch(k.buch);
  return j === klasse || (j === "KS" && klasse >= 11);
};

export const kursTrifftKlasse = (kurs, klasse) => {
  const m = kurs.stufe.match(/(\d+)\s*–\s*(\d+)/);
  return m ? klasse >= Number(m[1]) && klasse <= Number(m[2]) : false;
};


/* Menü entlang des Lernwegs: erst der eigene Stand, dann verstehen → üben → prüfen,
   danach Kamera, Werkzeuge und Berichte. Jeder Eintrag steht genau einmal im Menü. */
export const NAV = [
  { id: "weg", name: "Mein Weg", kurz: "Plan, Wiederholung, Fortschritt", eintraege: [
    { name: "Lernlandkarte", kurz: "Der ganze Lehrplan als Liniennetz", ansicht: "karte" },
    { name: "Mein Plan", kurz: "Tage, Minuten, Serie und Erinnerung", ansicht: "plan" },
    { name: "Wiederholen", kurz: "Was heute fällig ist, damit es bleibt", ansicht: "wiederholen" },
    { name: "Fortschritt", kurz: "Trefferquote, Fehlerarten und Tempo", ansicht: "profil" },
    { name: "Einstufung", kurz: "Herausfinden, wo die Lücken wirklich liegen", ansicht: "einstufung" },
    { name: "Profil", kurz: "Klasse, Ziel und Lernstand", ansicht: "profil2" },
  ] },
  { id: "lernen", name: "Lernen", kurz: "Verstehen, herleiten, nachschlagen", eintraege: [
    { name: "Arbeitsheft", kurz: "Acht Bausteine mit Herleitung und Aufgaben", ansicht: "training", ziel: "module" },
    { name: "Schulkurse", kurz: "Analysis 1–5, Vektoren, Stochastik, Pen & Paper – mit Videokurs", ansicht: "kurse" },
    { name: "Differenzenquotient", kurz: "Vom Tangentenproblem zur Ableitung", ansicht: "diffq" },
    { name: "Potenzregel", kurz: "Beweis mit Produktregel und vollständiger Induktion", ansicht: "potenzregel" },
    { name: "Formelsammlung", kurz: "Alle Regeln zum Nachschlagen", ansicht: "formeln" },
    { name: "Operatoren", kurz: "Was „bestimmen“, „zeigen“, „begründen“ verlangen", ansicht: "operatoren" },
  ] },
  { id: "klassen", name: "Nach Klasse", kurz: "Der Stoff von Klasse 8 bis 13", eintraege:
    SCHULKLASSEN.map((k) => ({ name: `Klasse ${k}`, kurz: k >= 11 ? "Kursstufe" : "Nach dem Lambacher Schweizer", ansicht: "klasse", klasse: k })) },
  { id: "ueben", name: "Üben", kurz: "Aufgaben und ganze Rechenwege", eintraege: [
    { name: "Gleichungslöser", kurz: "Äquivalenzumformungen eintippen – linear bis Logarithmus", ansicht: "gleichungen" },
    { name: "Terme und Potenzgesetze", kurz: "Vereinfachen, Ausklammern, Binomische Formeln, Potenzen, Brüche", ansicht: "terme" },
    { name: "Mathe Abi Masterclass", kurz: "Das 6-Monats-Programm fürs Mathe-Abi", ansicht: "masterclass" },
    { name: "Gleichungssysteme", kurz: "LGS mit drei Unbekannten – Gauß-Verfahren und direkter Weg", ansicht: "lgs" },
    { name: "Ableitungstrainer", kurz: "f′, f″ und f‴ eingeben und sofort prüfen lassen", ansicht: "ableitungstrainer" },
    { name: "Aufgabengenerator", kurz: "Geraden, Ableitungen, Kurvendiskussion", ansicht: "ki", ziel: null },
    { name: "Rechenweg schreiben", kurz: "Ganze Wege eintippen und prüfen lassen", ansicht: "training", ziel: "weg" },
    { name: "Kurvendiskussion", kurz: "Das Protokoll in zwölf Schritten", ansicht: "training", ziel: "kd" },
    { name: "Graph-Zuordnung", kurz: "Welcher Graph ist f′?", ansicht: "training", ziel: "gz" },
    { name: "Kopfrechnen", kurz: "Primfaktoren, Quadratzahlen, Brüche, Einmaleins", ansicht: "kopf" },
  ] },
  { id: "pruefung", name: "Prüfung", kurz: "Klassenarbeit und Abitur", eintraege: [
    { name: "Klausur vorbereiten", kurz: "Termin eintragen, Plan bekommen", ansicht: "vorbereiten" },
    { name: "Klausurgenerator", kurz: "Drei Aufgaben mit Uhr", ansicht: "training", ziel: "klausur" },
    { name: "Probeabitur", kurz: "Teil A und B mit Uhr und Notenpunkten", ansicht: "abitur" },
    { name: "Begründen und Beweisen", kurz: "Freie Antworten am Bewertungsraster", ansicht: "begruenden" },
    { name: "Modellieren", kurz: "Sachaufgaben in vier Schritten", ansicht: "modellieren" },
  ] },
  { id: "mathilda", name: "Mathilda AI", kurz: "Alles mit der Kamera", eintraege: [
    { name: "Blatt prüfen", kurz: "Rechenweg und Schriftbild vom Foto", ansicht: "analyse", foto: "blatt" },
    { name: "Weg prüfen", kurz: "Handschrift in Zeilen übertragen", ansicht: "analyse", foto: "weg" },
    { name: "Aufgabe scannen", kurz: "Ähnliche Aufgaben dazu erzeugen", ansicht: "analyse", foto: "aufgabe" },
  ] },
  { id: "werkzeuge", name: "Werkzeuge", kurz: "Plotter, Ebenen, Bernoulli, Vier-Felder-Tafel", eintraege: [
    { name: "Analysis", kurz: "Alle Analysis-Werkzeuge im Überblick", ansicht: "analysis" },
    { name: "Polynomplotter", kurz: "Koeffizienten einstellen, f, f′ und f″ sehen", ansicht: "plotter" },
    { name: "Advanced Plotter", kurz: "Beliebige Funktionen mit Tastenfeld und Kurvendiskussion", ansicht: "advplotter" },
    { name: "Sinusfunktion", kurz: "a, b, c, d finden, bis der Graph passt", ansicht: "sinus" },
    { name: "Steckbriefaufgaben", kurz: "Aus Eigenschaften die Funktion bestimmen", ansicht: "steckbrief" },
    { name: "Integrale", kurz: "Stammfunktionen und bestimmte Integrale", ansicht: "integrale" },
    { name: "Optimierungswerkstatt", kurz: "Schachtel, Fläche und Umfang, eigener Ansatz", ansicht: "optimierung" },
    { name: "Vektoren", kurz: "Alle Vektor-Werkzeuge im Überblick", ansicht: "vektoren" },
    { name: "Ebenen-Visualizer", kurz: "Ebenen in Koordinatenform live im Raum", ansicht: "ebenen" },
    { name: "Ebene vs. Ebene", kurz: "Schnittgerade und Schnittwinkel zweier Ebenen", ansicht: "ebenevsebene" },
    { name: "Kreuzprodukt", kurz: "Rechner mit Formel und eingesetzten Werten", ansicht: "kreuzprodukt" },
    { name: "Rechnen mit Vektoren", kurz: "A ± B, k · A, k · A + j · B – mit Rechenweg", ansicht: "vektorgenerator" },
    { name: "Zwei Punkte – eine Gerade", kurz: "Geradengleichung auf zwei Wegen", ansicht: "zweipunkte" },
    { name: "Drei Punkte – eine Ebene", kurz: "Drei Wege, mit Koordinatenform", ansicht: "dreipunkte" },
    { name: "Abstände", kurz: "Punkt, Gerade, Ebene – jede Kombination", ansicht: "abstaende" },
    { name: "Geraden im Raum", kurz: "Punktprobe und Lage von Geraden und Ebenen", ansicht: "geraden" },
    { name: "Winkel und Skalarprodukt", kurz: "Skalarprodukt, Vektorwinkel, Gerade-Ebene-Winkel", ansicht: "winkel" },
    { name: "Stochastik", kurz: "Alle Stochastik-Werkzeuge im Überblick", ansicht: "stochastik" },
    { name: "Bernoulli-Kette", kurz: "Binomialverteilung live mit Formel und Experiment", ansicht: "bernoulli" },
    { name: "Vier-Felder-Tafel", kurz: "Absolut oder in Prozent, mit Baumdiagramm", ansicht: "vierfelder" },
    { name: "Erwartungswert und faire Spiele", kurz: "Gewinnverteilung, fairer Einsatz, Simulation", ansicht: "erwartungswert" },
    { name: "Urnen und Kombinatorik", kurz: "Ziehen, Zählmethoden, Baumdiagramme", ansicht: "kombinatorik" },
    { name: "Hypothesentests", kurz: "Test aufbauen, Ablehnungsbereich, Fehler 1. und 2. Art", ansicht: "hypothesentest" },
    { name: "Arbeitsblatt drucken", kurz: "Aufgabenblatt mit Lösungsteil", ansicht: "ki", ziel: "blatt" },
  ] },
  { id: "berichte", name: "Berichte", kurz: "Für Eltern und Lehrkräfte", eintraege: [
    { name: "Wochenbericht", kurz: "Was diese Woche passiert ist", ansicht: "bericht" },
    { name: "Messbericht", kurz: "Vorher, nachher, nach Wochen", ansicht: "messung" },
    { name: "Auswertung", kurz: "Wirksamkeit über viele Schüler", ansicht: "auswertung" },
  ] },
];

/* ---------- UI ---------- */


