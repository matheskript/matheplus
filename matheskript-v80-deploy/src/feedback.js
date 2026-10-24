/* ======================================================================
   FEEDBACK-SEITE – reine Daten und Logik (ohne React, Node-testbar).
   Oberfläche: src/funcFeedbackSeite.jsx (Adresse /feedback).

   Die Seite ist eine Baustelle: Während der Testphase sammelt sie das Feedback der
   Schüler und Eltern – möglichst genau, per Text oder Sprachnachricht. Abgelegt wird
   alles in derselben Tabelle wie der Feedback-Knopf unten auf jeder Seite
   (public.feedback, supabase/schema.sql + feedback-text.sql); die Angaben der Seite
   (Rolle, Klasse, Art, Ort) stehen im jsonb-Feld „details“, ein SQL-Skript ist nicht nötig.
   ====================================================================== */

/* Wer gibt Feedback? */
export const ROLLEN = [
  { id: "schueler", name: "Schüler", kurz: "Ich lerne hier Mathe." },
  { id: "eltern", name: "Elternteil", kurz: "Mein Kind lernt hier." },
  { id: "lehrkraft", name: "Lehrkraft", kurz: "Ich unterrichte Mathe." },
];

/* Worum geht es? – die vier Fragen der Testphase, dazu Technik und Sonstiges */
export const ARTEN = [
  { id: "gut", name: "Das ist gut", frage: "Was findest du gut?", zeichen: "★",
    hilfe: "Was hat dir geholfen, was hat Spaß gemacht, wo hast du etwas verstanden, das vorher unklar war?",
    beispiel: "„Beim Integraltrainer sehe ich die Fläche wachsen – da hab ich zum ersten Mal verstanden, was ein Integral ist.“" },
  { id: "unklar", name: "Das verstehe ich nicht", frage: "Was verstehst du nicht?", zeichen: "?",
    hilfe: "Eine Erklärung, ein Schritt, ein Wort, eine Aufgabe – was ist unklar geblieben? Je genauer, desto besser.",
    beispiel: "„Differenzenquotient, Schritt ‚Einsetzen‘: Ich weiß nicht, warum aus x² plötzlich x² + 2xh + h² wird.“" },
  { id: "kompliziert", name: "Das ist zu kompliziert", frage: "Was ist dir zu kompliziert?", zeichen: "≠",
    hilfe: "Zu viele Knöpfe, zu viel Text, zu viele Schritte auf einmal – wo bist du ausgestiegen?",
    beispiel: "„Im Vektoren-Werkzeug sind zu viele Felder auf einmal. Ich wusste nicht, wo ich anfangen soll.“" },
  { id: "wunsch", name: "Das wünsche ich mir", frage: "Welche Übungen fehlen dir?", zeichen: "+",
    hilfe: "Welches Thema, welche Aufgabenart, welche Klassenarbeit? Was würdest du gern üben, findest es hier aber nicht?",
    beispiel: "„Ich hätte gern Übungen zu Textaufgaben mit quadratischen Gleichungen, Klasse 9.“" },
  { id: "fehler", name: "Da ist ein Fehler", frage: "Rechnet etwas falsch oder klemmt etwas?", zeichen: "!",
    hilfe: "Falsches Ergebnis, ein Knopf ohne Wirkung, ein kaputtes Layout – mit Seite, Gerät und dem, was du getan hast.",
    beispiel: "„Ableitungstrainer, Kettenregel, Stufe 2, iPhone: Nach ‚Prüfen‘ passiert nichts.“" },
  { id: "sonst", name: "Etwas anderes", frage: "Alles, was sonst noch wichtig ist", zeichen: "…",
    hilfe: "Lob, Kritik, eine Idee, eine Frage – alles, was in keine der anderen Schubladen passt.",
    beispiel: "„Könnt ihr die Seite auch für Realschüler öffnen?“" },
];

/* Die vier Fragen, die Schüler auf der Seite als Karten sehen (Reihenfolge der Bitte) */
export const SCHUELER_FRAGEN = ["gut", "unklar", "kompliziert", "wunsch"];

/* Was Eltern besonders sagen sollen (gesiezt) */
export const ELTERN_PUNKTE = [
  { titel: "Verständlich?", text: "Konnte Ihr Kind mit einer Seite allein arbeiten – ohne Sie und ohne Lehrkraft? Wo musste es nachfragen?" },
  { titel: "Zu viel oder zu wenig?", text: "Wo wirkte etwas überladen, wo zu knapp erklärt? Welche Stelle hat Ihr Kind abgebrochen?" },
  { titel: "Was fehlt?", text: "Welche Themen aus dem aktuellen Unterricht finden Sie hier nicht? Welche Übung hätte vor der letzten Klassenarbeit geholfen?" },
  { titel: "Was hat gewirkt?", text: "Gab es einen Moment, in dem Ihr Kind etwas verstanden hat? Was genau war anders als im Schulbuch?" },
];

/* Gutes Feedback: so genau wie möglich – mit Beispiel davor und danach */
export const GENAU = [
  { punkt: "Wo?", text: "Seite oder Werkzeug nennen – oder einfach die Adresse oben im Browser kopieren." },
  { punkt: "Was?", text: "Was hast du gemacht, was ist passiert, was hättest du erwartet?" },
  { punkt: "Warum?", text: "Was hast du dabei gedacht oder gefühlt? „Ich war verwirrt, weil …“ hilft mehr als „komisch“." },
];
export const VORHER_NACHHER = {
  vorher: "„Ableitungen sind verwirrend.“",
  nachher: "„Ableitungstrainer → Kettenregel, Stufe 2: Ich verstehe nicht, warum die innere Ableitung mal genommen wird. Ich dachte, man addiert sie.“",
};

/* Was mit dem Feedback passiert – ehrlich, ohne Versprechen, die nicht gehalten werden */
export const DANACH = [
  { titel: "Wir lesen und hören alles", text: "Jede Nachricht landet bei denen, die die Seite bauen – nicht in einem Postfach, das keiner öffnet." },
  { titel: "Jede Woche wird umgebaut", text: "Was oft genannt wird, kommt zuerst dran. Die Seite verändert sich sichtbar von Woche zu Woche." },
  { titel: "Keine Antwortpflicht", text: "Nicht jede Nachricht bekommt eine Antwort. Aber jede fließt ein – auch die unbequemen." },
];

/* Kapitel der Seite (Sprungmarken wie auf der Vision-Seite) */
export const FEEDBACK_KAPITEL = [
  { id: "fb-baustelle", nr: "01", titel: "Die Baustelle" },
  { id: "fb-fragen", nr: "02", titel: "Vier Fragen" },
  { id: "fb-eltern", nr: "03", titel: "Für Eltern" },
  { id: "fb-genau", nr: "04", titel: "So genau wie möglich", hell: true },
  { id: "fb-senden", nr: "05", titel: "Feedback senden" },
  { id: "fb-danach", nr: "06", titel: "Was danach passiert" },
];

/* Grenzen wie beim Feedback-Knopf (Datenbank: nachricht ≤ 2000 Zeichen) */
export const MAX_ZEICHEN = 2000;
export const MIN_ZEICHEN = 3;
export const MAX_ORT = 120;
export const KLASSEN = [5, 6, 7, 8, 9, 10, 11, 12, 13];

export const SEITEN_NAME = "Feedback-Seite";

/* Direct Link der Seite – fest auf die Hauptadresse, damit auch aus Vorschau-Deploys der richtige Link geteilt wird.
   /feedback ist ohne Passwort erreichbar (OEFFENTLICH in middleware.js), deshalb steht in der Nachricht kein Passwort. */
export const FEEDBACK_LINK = "https://mythosmathe.de/feedback";

/* Nachricht für WhatsApp und das Teilen-Menü des Handys */
export function feedbackTeilenText(link = FEEDBACK_LINK) {
  return "Hey, mythosmathe.de baut gerade eine neue Mathe-Lernseite und will wissen, was Schüler, Eltern und Lehrkräfte davon halten. "
    + "Hier kannst du sagen, was gut ist und was nicht – per Text oder Sprachnachricht:\n" + link;
}

/* Prüft eine Eingabe; liefert "" (in Ordnung) oder den Hinweis für den Nutzer. */
export function feedbackPruefen({ rolle, art, text, dauer, zustimmung, weg }) {
  if (!ROLLEN.some((r) => r.id === rolle)) return "Sag uns bitte zuerst, wer du bist: Schüler, Elternteil oder Lehrkraft.";
  if (!ARTEN.some((a) => a.id === art)) return "Wähle bitte, worum es geht – eine der Karten oben.";
  if (weg === "text") {
    if (String(text || "").trim().length < MIN_ZEICHEN) return "Schreib bitte ein paar Worte, dann kannst du senden.";
  } else if (weg === "voice") {
    if (!(dauer >= 2)) return "Die Aufnahme ist sehr kurz. Nimm sie bitte noch einmal auf.";
  } else return "Text oder Sprachnachricht?";
  if (!zustimmung) return "Bitte setze zuerst den Haken bei der Einwilligung.";
  return "";
}

/* Die Zeile für public.feedback. Rolle, Klasse, Art und Ort stehen in „details“. */
export function feedbackZeile({ rolle, klasse, art, ort, text, audioPfad, dauer, ueberschrift }) {
  const details = { quelle: "feedback-seite", rolle, art };
  if (rolle === "schueler" && KLASSEN.includes(Number(klasse))) details.klasse = Number(klasse);
  const o = String(ort || "").trim().slice(0, MAX_ORT);
  if (o) details.ort = o;
  const zeile = {
    seite: SEITEN_NAME,
    ansicht: "feedback",
    ueberschrift: ueberschrift || null,
    details,
  };
  if (audioPfad) { zeile.audio_pfad = audioPfad; zeile.dauer_s = Math.round(dauer || 0); }
  else zeile.nachricht = String(text || "").trim().slice(0, MAX_ZEICHEN);
  return zeile;
}

/* Anrede je Rolle: Schüler und Lehrkräfte du, Eltern Sie */
export const gesiezt = (rolle) => rolle === "eltern";
