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
  "hauptmenue":              { an: false, art: "auswahl", wo: "Hauptmenü oben (Mathilda, Meine Kurse, Klasse, Mein Training, Mathematik, Suche, Konto): Fenster und Kapitel aufklappen" },
  "menue-alle-bereiche":     { an: false, art: "auswahl", wo: "Pop-up-Menü „Menü mit allen Bereichen“ (☰ in der Werkzeug-Kopfleiste): Untermenüs scrollen im Fenster nach oben" },

  /* ---------------- Auswahl innerhalb von Werkzeugen ---------------- */
  "lernweg-kapitel":         { an: false, art: "auswahl", wo: "Ungleichungen und Beträge · Mengen und Logik · Funktionen: Grundlagen – Kapitel-Leiste oben (Video vom 18.10.)" },
  "trigo-kapitel":           { an: false, art: "auswahl", wo: "Trigonometrie im Dreieck – Kapitel-Leiste oben" },
  "teiler-reiter":           { an: false, art: "auswahl", wo: "Mathe entdecken → Teilbarkeitsregeln: Reiter 2, 5, 3 … und Quiz" },
  "parabel-thema":           { an: false, art: "auswahl", wo: "Parabeltrainer: Thema im Auswahlfeld wechseln" },
  "parabel-geloest":         { an: false, art: "auswahl", wo: "Parabeltrainer: nach dem Lösen nach oben zum aufgedeckten Graphen" },
  "parabel-fokus":           { an: false, art: "auswahl", wo: "Parabeltrainer (Maus/Trackpad): erstes Eingabefeld bekommt den Cursor und wird dabei ins Bild geholt" },
  "ableitung-regel":         { an: false, art: "auswahl", wo: "Ableitungstrainer: (seit 22.10. ungenutzt, die Regelwerkstatt ist der Trainer)" },
  "bruch-beispiele":         { an: false, art: "auswahl", wo: "Bruchrechnen: Auswahl unter „Weitere Beispiele“ holt die Rechenkarte nach oben" },
  "gleichkurs-reiter":       { an: false, art: "auswahl", wo: "Gleichungen lernen: Reiter Verstehen/Rechnen/Training" },
  "gleichkurs-fertig":       { an: false, art: "auswahl", wo: "Gleichungen lernen: nach dem Lösen zur Fertig-Meldung" },
  "gleichungen-foto":        { an: false, art: "auswahl", wo: "Gleichungslöser: Aufgabe aus dem Foto gewählt → Heft in die Mitte" },
  "kurvendiskussion-ergebnis": { an: false, art: "auswahl", wo: "Polynomplotter: Kurvendiskussion aufklappen → zum Ergebnis" },
  "kurvendiskussion-feld":   { an: false, art: "auswahl", wo: "Polynomplotter: Pop-up zum Bearbeiten eines Werts (Cursor ins Feld)" },
  "integral-bild":           { an: true,  art: "anker",   wo: "Integraltrainer (Handy): „Im Bild ansehen“ unter einem gelösten Schritt holt das Schaubild nach oben" },
  "regelwerk-popup":         { an: false, art: "auswahl", wo: "Regelwerk/Formel-Werkzeuge: Eingabe-Pop-up unter dem angetippten Feld" },
  "regelwerk-feld":          { an: false, art: "auswahl", wo: "Regelwerk: Feld antippen → Eingabe-Pop-up ins Bild" },
  "geraden-pad":             { an: false, art: "auswahl", wo: "Geradengleichung: Zahlenfeld-Pop-up ins Bild" },
  "kompetenz-detail":        { an: false, art: "auswahl", wo: "Kompetenzen/Lernstand: Kompetenz wählen → Detailkarte nach oben" },
  "steckbrief-schritt":      { an: false, art: "auswahl", wo: "Steckbriefaufgaben: neuer Schritt erscheint → nach oben zum Schritt" },
  "kapitelformeln-klausur":  { an: false, art: "auswahl", wo: "Kapitel-Formeln: Testklausur erstellt → nach oben zur Klausur" },
  "headnumbers-modus":       { an: false, art: "auswahl", wo: "Head & Numbers: Modus-Leiste Entdecken/Rechnen/Training" },
  "textaufgaben-thema":      { an: false, art: "auswahl", wo: "Textaufgaben: Thema wählen → zur Aufgabe" },
  "textmathilda-ergebnis":   { an: false, art: "auswahl", wo: "Textaufgaben → Mathilda: Übersetzung fertig → nach oben" },
  "penpaper-lektion":        { an: false, art: "auswahl", wo: "Pen & Paper: Lektion öffnen („Weiter mit Lektion n“, „Nächste Lektion“) → zur Lektionskarte" },
  "abisaetze-reiter":        { an: false, art: "auswahl", wo: "Abi-Sätze: Reiter Teil A / Teil B" },
  "hesse-teil":              { an: false, art: "auswahl", wo: "Hesse-Normalenform: Schritt wechseln (Reiter oder „Weiter“ unten) → zu den Reitern hochholen" },
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
  "unterstufe-seite":        { an: true,  art: "seite", wo: "Modul Unterstufe: Lerneinheit öffnen, „Nächste Lerneinheit“, zurück zur Übersicht, Klasse wechseln" },
  "masterclass-modul":       { an: true,  art: "seite", wo: "Masterclass-Kursbereich: Lektion öffnen, „Nächste Lektion“, zurück zur Übersicht, Code eingelöst" },
  "claudekurs-lektion":      { an: true,  art: "seite", wo: "Kurse Mathe lernen mit Claude / mit Gemini: Lektion öffnen, „Nächste Lektion“, zurück zur Übersicht" },
  "vekkurs-modul":           { an: true,  art: "seite", wo: "Kurs Vektoren, Geraden und Ebenen: Modul öffnen, „Nächstes Modul“, zurück zur Modulübersicht" },
  "geokurs-modul":           { an: true,  art: "seite", wo: "Kurs Dreiecksgeometrie: Modul öffnen, „Nächstes Modul“, zurück zur Modulübersicht" },
  "kopfmodi-thema":          { an: true,  art: "seite", wo: "Kopfrechnen → Entdecken: Thema aus der Liste öffnen, „Weiter: …“" },
  "headnumbers-ansicht":     { an: true,  art: "seite", wo: "Head & Numbers: Bereich/Trainer öffnen und zurück" },
  "kopf-vollbild":           { an: true,  art: "seite", wo: "Kopfrechnen: Runde im Vollbild startet – Seite nach oben, damit die Kopfleiste über dem Trainer steht" },
  "steckbrief-neu":          { an: true,  art: "seite", wo: "Steckbriefaufgaben: neue Aufgabe" },
  "kapitelformeln-ansicht":  { an: true,  art: "seite", wo: "Kapitel-Formeln: Formelauswahl ↔ Testklausur, Klausur starten" },
  "textaufgaben-wechsel":    { an: true,  art: "seite", wo: "Textaufgaben: Knöpfe „Zu Mathilda/Zum Training“ im Inhalt (die Reiterleiste springt nicht)" },
  "training-lauf":           { an: true,  art: "seite", wo: "Mein Training: nächste Aufgabe, Runde/Prüfung starten, Auswertung, Klausur speichern/bearbeiten" },
  "kapiteltraining":         { an: true,  art: "seite", wo: "Kapiteltraining/Trainingsplan: Runde starten, Auswertung, neue Runde" },
  "meintraining":            { an: true,  art: "seite", wo: "Mein Mathe-Training: Eintrag starten, Auswertung, nach „Thema hinzufügen“ zurück zum Tagesplan" },
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
  "abi-aufgabe":             { an: true,  art: "seite", wo: "Abi-Zentrum → Abi-Aufgaben: „Nächste Aufgabe“ / „Andere Aufgabe“ beginnt oben (Reiter und Chips springen nicht)" },
  "abi-probe":               { an: true,  art: "seite", wo: "Abi-Zentrum → Teil-A-Probe: Start, Abgabe, Auswertung, neue Probe" },
  "mia-schritt":             { an: true,  art: "seite", wo: "Mia, die Abi-Trainerin: Modus wechseln, nächster Abschnitt der mündlichen Prüfung, Korrektur fertig" },

  /* ---------------- Sprungmarken ---------------- */
  "diffkurs-aufgabentool":   { an: true,  art: "anker", wo: "Kurs Differentialrechnung → Aufgaben: „Neue Aufgaben dieses Typs üben“ an einer Buchaufgabe führt zum Aufgabentool darunter" },
  "anker":                   { an: true,  art: "anker", wo: "Inhaltsverzeichnisse und Sprungknöpfe: Landingpage, Elternabend „Platz sichern“, Ebbinghaus-Navi, Pen & Paper, Formelsammlung-Gruppen, Entwürfe, Startseite-Archiv, Text-Mathilda-Stellen, Kapiteltraining „nächste Einheit“" },

  "konto-abschnitt":        { an: true,  art: "anker", wo: "Hauptmenü → Konto: „Meine Kinder“, „Meine Klassen“, „Meine Schüler“, „Mein Plan“ springen zum Abschnitt auf der Kontoseite" },
  "kopfmenue-anker":        { an: true,  art: "anker", wo: "Besuchermenü in der Kopfleiste (nicht angemeldet): „Mathe lernen“ springt zum Abschnitt auf der Startseite (id lernen); ebenso „Alle Werkzeuge ansehen“ auf der Vision-Seite" },
  "start-anker":            { an: true,  art: "anker", wo: "Startseite: Band unter der Kopfleiste (Heute · Lernen · Mathilda · Kurse · Entdecken) springt zum Abschnitt; „Zur Vision“ und „Alle Kurse“ sind Seitenwechsel" },
  "start-gast":             { an: true,  art: "anker", wo: "Story-Startseite für Besucher ohne Konto (funcStartGast.jsx): „Kostenlos starten“ springt zur Start-Karte, „Wie es funktioniert“ zum Problem-Abschnitt, feste Handy-Leiste ebenso" },
  "vision-kapitel":         { an: true,  art: "anker", wo: "Vision-Seite (/vision): Kapitelübersicht unter der Bühne, Kapitel-Leiste links (ab 1360 px), „Die Vision lesen“ und die drei Schritt-Karten springen zum Abschnitt" },
  "feedback-kapitel":       { an: true,  art: "anker", wo: "Feedback-Seite (/feedback): Kapitelübersicht unter der Bühne, „Feedback geben“ (Bühne, Schluss, Handy-Leiste), die vier Fragen-Karten und „Als Elternteil“ springen zum Formular" },

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

/* Zu einem Abschnitt springen, der erst nach dem Seitenwechsel (und dem Laden der Daten) da ist:
   wartet bis zu maxMs auf das Element mit dieser Id, dann springe(id, …). Gibt es sie nie, passiert nichts. */
export function springeZuId(schluessel, elementId, maxMs = 3000) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const start = Date.now();
  const versuch = () => {
    const el = document.getElementById(elementId);
    if (el) {
      springe(schluessel, () => {
        el.scrollIntoView({ block: "start", behavior: "smooth" });
        // Die klebende Kopfleiste (funcKopfleiste.jsx, .kl[data-klebrig]) wird beim Scrollen flacher – der Inhalt rückt
        // danach nach oben, und das Ziel landete unter bzw. über der Leiste (Konto-Abschnitte am Desktop: y = −21).
        // Nach dem Scrollen einmal nachjustieren: Ziel 12 px unter der Leiste. Gehört zum selben Sprung (gleicher Schlüssel).
        setTimeout(() => {
          const kopf = document.querySelector(".kl[data-klebrig]");
          const band = document.querySelector("[data-start-band]");   // Band der Startseite klebt unter der Kopfleiste und zählt dazu
          const h = Math.max(kopf ? kopf.getBoundingClientRect().bottom : 0, band ? band.getBoundingClientRect().bottom : 0);
          const oben = el.getBoundingClientRect().top;
          if (oben < h || oben > h + 40) window.scrollBy({ top: oben - h - 12, behavior: "auto" });
        }, 700);
      });
      return;
    }
    if (Date.now() - start < maxMs) setTimeout(versuch, 120);
  };
  setTimeout(versuch, 150);
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
