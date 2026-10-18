/* ======================================================================
   sprung.js – Sprung-Schalter: EINE Liste für alle Stellen, an denen die
   Seite von selbst scrollt („springt“), z. B. nach einem Klick ein Menü,
   eine Karte oder den Seitenanfang nach oben holt.

   Jede Stelle hat einen Schlüssel. an: true = die Seite springt dort,
   an: false = die Seite bleibt, wo sie ist. Umschalten = hier eine Zeile
   ändern, sonst nichts.

   Arten:
     auswahl – Klick auf Reiter, Chips, Menüs, Aufklapper, Pop-ups, Themen
               innerhalb einer Seite (das störende „Hochspringen“)
     seite   – ein neuer Bildschirm ersetzt den alten (Seitenwechsel,
               „Weiter“, Neustart, Ergebnis) – sonst stünde man mitten im
               neuen Inhalt
     anker   – Knöpfe, deren Zweck das Hinspringen ist (Inhaltsverzeichnis,
               „Platz sichern“, Sprungmarken)
     halten  – hält etwas im Blick, während man tippt (Feld über der
               Bildschirmtastatur, Chat folgt der neuesten Nachricht)

   Aufklapp-Menüs (aria-expanded, <details>) laufen über EINE gemeinsame
   Regel in aufklappen.jsx. Ihr Schlüssel ist
     · der Wert von data-sprung am Menü oder einem umgebenden Element, sonst
     · "aufklappen@<ansicht>" – also je Werkzeug/Seite einzeln schaltbar.
   Nicht eingetragene "aufklappen@…"-Schlüssel folgen "aufklappen@*".

   Wächter: tests/sprung.test.mjs schlägt an, wenn irgendwo in src/ ein
   scrollTo/scrollIntoView/scrollBy ohne springe(…) steht (Ausnahme: Zeile
   trägt den Kommentar „sprung-frei: Grund“).
   Diese Datei ist rein (kein React) – base*.jsx und func*.jsx dürfen sie
   importieren.
   ====================================================================== */

export const SPRUENGE = {
  /* ---------------- Aufklapp-Menüs (gemeinsame Regel, aufklappen.jsx) ---------------- */
  "start-schulmathe":        { an: true,  art: "auswahl", wo: "Startseite → Schulmathematik (Mathe-Training): Schulmathematik, Analysis/Vektoren/Stochastik/Geometrie/Gleichungen, Stationen, Formelsammlung, „Bereich zu“-Leiste" },
  "aufklappen@*":            { an: false, art: "auswahl", wo: "Alle übrigen Aufklapp-Menüs (+/−, Pfeil, <details>) in jedem Werkzeug und auf jeder Seite – Standard für aufklappen@<ansicht>" },
  "aufklappen@start":        { an: false, art: "auswahl", wo: "Startseite außerhalb von Schulmathematik: Mathe entdecken, Kopfrechnen, Mein Training, Mythen, Quickfinder-Listen" },
  "menue-alle-bereiche":     { an: false, art: "auswahl", wo: "Pop-up-Menü „Menü mit allen Bereichen“ (☰ in der Werkzeug-Kopfleiste): Untermenüs scrollen im Fenster nach oben" },

  /* ---------------- Auswahl innerhalb von Werkzeugen ---------------- */
  "lernweg-kapitel":         { an: false, art: "auswahl", wo: "Ungleichungen und Beträge · Mengen und Logik · Funktionen: Grundlagen – Kapitel-Leiste oben (Video vom 18.10.)" },
  "trigo-kapitel":           { an: false, art: "auswahl", wo: "Trigonometrie im Dreieck – Kapitel-Leiste oben" },
  "teiler-reiter":           { an: false, art: "auswahl", wo: "Mathe entdecken → Teilbarkeitsregeln: Reiter 2, 5, 3 … und Quiz" },
  "parabel-thema":           { an: false, art: "auswahl", wo: "Parabeltrainer: Thema im Auswahlfeld wechseln" },
  "parabel-geloest":         { an: false, art: "auswahl", wo: "Parabeltrainer: nach dem Lösen nach oben zum aufgedeckten Graphen" },
  "parabel-fokus":           { an: false, art: "auswahl", wo: "Parabeltrainer (Maus/Trackpad): erstes Eingabefeld bekommt den Cursor und wird dabei ins Bild geholt" },
  "ableitung-regel":         { an: false, art: "auswahl", wo: "Ableitungstrainer: Regel/Bereich in der Auswahl wechseln" },
  "bruch-beispiele":         { an: false, art: "auswahl", wo: "Bruchrechnen: Auswahl unter „Weitere Beispiele“ holt die Rechenkarte nach oben" },
  "gleichkurs-reiter":       { an: false, art: "auswahl", wo: "Gleichungen lernen: Reiter Verstehen/Rechnen/Training" },
  "gleichkurs-fertig":       { an: false, art: "auswahl", wo: "Gleichungen lernen: nach dem Lösen zur Fertig-Meldung" },
  "gleichungen-foto":        { an: false, art: "auswahl", wo: "Gleichungslöser: Aufgabe aus dem Foto gewählt → Heft in die Mitte" },
  "kurvendiskussion-ergebnis": { an: false, art: "auswahl", wo: "Polynomplotter: Kurvendiskussion aufklappen → zum Ergebnis" },
  "kurvendiskussion-feld":   { an: false, art: "auswahl", wo: "Polynomplotter: Pop-up zum Bearbeiten eines Werts (Cursor ins Feld)" },
  "regelwerk-popup":         { an: false, art: "auswahl", wo: "Regelwerk/Formel-Werkzeuge: Eingabe-Pop-up unter dem angetippten Feld" },
  "regelwerk-feld":          { an: false, art: "auswahl", wo: "Regelwerk: Feld antippen → Eingabe-Pop-up ins Bild" },
  "geraden-pad":             { an: false, art: "auswahl", wo: "Geradengleichung: Zahlenfeld-Pop-up ins Bild" },
  "kompetenz-detail":        { an: false, art: "auswahl", wo: "Kompetenzen/Lernstand: Kompetenz wählen → Detailkarte nach oben" },
  "steckbrief-schritt":      { an: false, art: "auswahl", wo: "Steckbriefaufgaben: neuer Schritt erscheint → nach oben zum Schritt" },
  "kapitelformeln-klausur":  { an: false, art: "auswahl", wo: "Kapitel-Formeln: Testklausur erstellt → nach oben zur Klausur" },
  "headnumbers-modus":       { an: false, art: "auswahl", wo: "Head & Numbers: Modus-Leiste Entdecken/Rechnen/Training" },
  "textaufgaben-thema":      { an: false, art: "auswahl", wo: "Textaufgaben: Thema wählen → zur Aufgabe" },
  "textmathilda-ergebnis":   { an: false, art: "auswahl", wo: "Textaufgaben → Mathilda: Übersetzung fertig → nach oben" },
  "penpaper-kurs":           { an: false, art: "auswahl", wo: "Pen & Paper: Kurs A/B/C wählen → zur Kurskarte" },
  "abisaetze-reiter":        { an: false, art: "auswahl", wo: "Abi-Sätze: Reiter Teil A / Teil B" },
  "quickfinder-menue":       { an: false, art: "auswahl", wo: "Startseite → „Dein Training startet hier.“: Plan öffnen/zurück holt das Menü nach oben" },
  "suche-ergebnis":          { an: false, art: "auswahl", wo: "Suche „Was möchtest du lernen?“: Antwort ins Bild" },
  "mathilda-foto":           { an: false, art: "auswahl", wo: "Mathilda AI: „Scan dein Blatt“ bzw. Foto aufgenommen → zum Foto-Bereich" },

  /* ---------------- Seitenwechsel: neuer Bildschirm beginnt oben ---------------- */
  "seitenwechsel":           { an: true,  art: "seite", wo: "Jeder Wechsel auf eine andere Seite/ein anderes Werkzeug (Menü, Kacheln, Logo, Konto, Klasse, Recht, Wettbewerbe)" },
  "lernweg-weiter":          { an: true,  art: "seite", wo: "Lernweg-Werkzeuge und Trigonometrie: großer Knopf „Weiter mit Kapitel n“ unten" },
  "teiler-weiter":           { an: true,  art: "seite", wo: "Teilbarkeitsregeln: Weiter/Zurück/Übersicht, neue Quizrunde, Neustart" },
  "abisaetze-weiter":        { an: true,  art: "seite", wo: "Abi-Sätze: Knopf „Weiter zu Teil B“" },
  "gleichkurs-runde":        { an: true,  art: "seite", wo: "Gleichungen lernen: Runde starten/beenden" },
  "videokurs-lektion":       { an: true,  art: "seite", wo: "Videokurse: andere Lektion" },
  "diffkurs-modul":          { an: true,  art: "seite", wo: "Kurs Differentialrechnung: Modul öffnen, „Nächstes Modul“, zurück zur Modulübersicht" },
  "diffkurs-werkzeug":       { an: false, art: "auswahl", wo: "Kurs Differentialrechnung: Trainingswerkzeug im Modul öffnen → zum geöffneten Werkzeug" },
  "kopfmodi-thema":          { an: true,  art: "seite", wo: "Kopfrechnen → Entdecken: Thema aus der Liste öffnen, „Weiter: …“" },
  "headnumbers-ansicht":     { an: true,  art: "seite", wo: "Head & Numbers: Bereich/Trainer öffnen und zurück" },
  "steckbrief-neu":          { an: true,  art: "seite", wo: "Steckbriefaufgaben: neue Aufgabe" },
  "kapitelformeln-ansicht":  { an: true,  art: "seite", wo: "Kapitel-Formeln: Formelauswahl ↔ Testklausur, Klausur starten" },
  "textaufgaben-wechsel":    { an: true,  art: "seite", wo: "Textaufgaben: Knöpfe „Zu Mathilda/Zum Training“ im Inhalt (die Reiterleiste springt nicht)" },
  "training-lauf":           { an: true,  art: "seite", wo: "Mein Training: nächste Aufgabe, Runde/Prüfung starten, Auswertung, Klausur speichern/bearbeiten" },
  "kapiteltraining":         { an: true,  art: "seite", wo: "Kapiteltraining/Trainingsplan: Runde starten, Auswertung, neue Runde" },
  "lernpfad":                { an: true,  art: "seite", wo: "Lernpfad: Einrichtung → Check → Plan → Einheit" },
  "abiketten":               { an: true,  art: "seite", wo: "Abi-Ketten: Kette öffnen" },
  "probeabitur":             { an: true,  art: "seite", wo: "Probeabitur: Start, Teil B, Ende" },
  "klausurtermin":           { an: true,  art: "seite", wo: "Klausurtermine: Generalprobe starten/auswerten" },
  "klausurbriefkasten":      { an: true,  art: "seite", wo: "Klausur-Briefkasten: Vorschau/fertig/neu" },
  "entdecken-phasen":        { an: true,  art: "seite", wo: "Mathe entdecken (Potenz, Axiome, Pythagoras, Module, Zahlenräume, Normalverteilung): Phase weiter/zurück, Neustart" },
  "kurse":                   { an: true,  art: "seite", wo: "Kurse/Videokurse/Elternkurs/Nachhilfekurs/Kopfrechen-Kacheln: Kapitel öffnen und zurück" },
  "formelsammlung-detail":   { an: true,  art: "seite", wo: "Formelsammlung: Formel/Roten Faden öffnen und zurück" },
  "erklaerung-schritte":     { an: true,  art: "seite", wo: "Erklär-Ansichten mit Phasen (func7): nächste Phase" },
  "ansicht-schalter":        { an: true,  art: "seite", wo: "Startseite unten: Testknopf „Ansicht: Erstbesuch/Wiederkehrer“; Entwürfe nach Passwort" },

  /* ---------------- Sprungmarken ---------------- */
  "anker":                   { an: true,  art: "anker", wo: "Inhaltsverzeichnisse und Sprungknöpfe: Landingpage, Elternabend „Platz sichern“, Ebbinghaus-Navi, Pen & Paper, Formelsammlung-Gruppen, Entwürfe, Startseite-Archiv, Text-Mathilda-Stellen, Kapiteltraining „nächste Einheit“" },

  /* ---------------- Im Blick halten ---------------- */
  "tastatur":                { an: true,  art: "halten", wo: "Mathe-Tastatur: aktives Feld bleibt über der Bildschirmtastatur" },
  "formel-cursor":           { an: true,  art: "halten", wo: "Formelfelder: Cursor bleibt in langen Formeln sichtbar" },
  "chat":                    { an: true,  art: "halten", wo: "Mathilda-Chat und Tutor: folgt der neuesten Nachricht" },
};

/* Laufzeit-Abweichungen (nur zum Ausprobieren im Browser, z. B. window.__mmSprung.setze("lernweg-kapitel", true)) */
const AUSNAHMEN = {};

function eintrag(id) {
  if (Object.prototype.hasOwnProperty.call(SPRUENGE, id)) return SPRUENGE[id];
  if (typeof id === "string" && id.startsWith("aufklappen@")) return SPRUENGE["aufklappen@*"];
  return null;
}

/* Springt die Seite an dieser Stelle? Unbekannte Schlüssel springen nie. */
export function sprungAn(id) {
  if (Object.prototype.hasOwnProperty.call(AUSNAHMEN, id)) return AUSNAHMEN[id];
  const e = eintrag(id);
  return !!(e && e.an);
}

/* fn ausführen, wenn der Sprung an dieser Stelle eingeschaltet ist */
export function springe(id, fn) {
  if (!sprungAn(id)) return false;
  try { fn(); } catch (e) { /* ältere Browser */ }
  return true;
}

/* Fokus setzen; bei ausgeschaltetem Sprung ohne Scrollen */
export function fokus(el, id) {
  if (!el || !el.focus) return;
  try { if (sprungAn(id)) el.focus(); else el.focus({ preventScroll: true }); } catch (e) { /* egal */ }
}

/* Übersicht für Tests, Konsole und Doku */
export function sprungListe() {
  return Object.entries(SPRUENGE).map(([id, e]) => ({ id, ...e, an: sprungAn(id) }));
}

if (typeof window !== "undefined") {
  window.__mmSprung = {
    liste: sprungListe,
    an: sprungAn,
    setze: (id, wert) => { AUSNAHMEN[id] = !!wert; return sprungAn(id); },
    zuruecksetzen: () => { for (const k of Object.keys(AUSNAHMEN)) delete AUSNAHMEN[k]; },
  };
}
