/* ============================================================
   KURS GFS – Daten und Logik (keine Importe)
   Zwei Teile: der allgemeine Leitfaden (LEITFADEN) und die GFS-Themen
   je Klassenstufe aus dem Lambacher Schweizer BW (THEMEN).
   Ein Thema wird erst gelistet, wenn seine Themenseite gebaut ist
   (ansicht gesetzt) – nichts wird erfunden.
   Getestet in tests/gfsKurs.test.mjs.
   ============================================================ */

export const KLASSEN = [8, 9, 10, 11, 12, 13];
export const klasseName = (k) => (k >= 11 ? `Klasse ${k} · Kursstufe` : `Klasse ${k}`);
/* Ein Thema gehört zu einer oder mehreren Klassen (Kursstufe: G8 Klasse 11 = G9 Klasse 12).
   stufenText(t) sagt es in Worten, z. B. „Klasse 10“ oder „G8 Klasse 11 · G9 Klasse 12“. */
export const stufenText = (t) => (t.schulart ? Object.entries(t.schulart).map(([s, k]) => `${s} Klasse ${k}`).join(" · ") : klasseName(t.klasse));

/* ---------- Themen ---------- */
export const THEMEN = [
  { id: "pascal", klasse: 10, klassen: [10], kapitel: "V", kapitelName: "Schlüsselkonzept: Binomialverteilung", seite: 154,
    titel: "Pascal’sches Dreieck und Binomialkoeffizienten", kurz: "Pascal’sches Dreieck",
    frage: "Warum stehen im Zahlendreieck genau die Binomialkoeffizienten?", ansicht: "gfs-pascal", videos: 1, animationen: 0 },
  { id: "dose", klasse: 11, klassen: [11, 12], schulart: { G8: 11, G9: 12 }, kapitel: "I", kapitelName: "Grundlagen der Differenzialrechnung", seite: 34,
    titel: "Die optimale Dose – Extremwertprobleme mit Nebenbedingungen", kurz: "Die optimale Dose",
    frage: "Wie muss eine Dose aussehen, damit sie bei festem Inhalt am wenigsten Blech braucht?", ansicht: "gfs-dose", videos: 0, animationen: 6 },
];
export const themenFuer = (klasse) => THEMEN.filter((t) => (t.klassen || [t.klasse]).includes(klasse));
export const themenZahl = () => THEMEN.filter((t) => t.ansicht).length;

/* ---------- Leitfaden: So gehst du eine GFS an ---------- */
export const LEITFADEN = [
  { id: "thema", nr: 1, titel: "Thema und Rahmen klären", zeile: "Die erste Woche entscheidet mehr als die letzte",
    frage: "Welche GFS passt zu dir – und was erwartet deine Lehrkraft genau?",
    absaetze: [
      "Wähle ein Thema, bei dem du den Kern in einem Satz sagen kannst. Die GFS-Seiten im Lambacher Schweizer sind dafür gemacht: Jede hat ein Problem, eine Erarbeitung und ein Ergebnis – das ist schon der Kern deines Vortrags.",
      "Kläre vor dem ersten Arbeiten drei Dinge mit deiner Lehrkraft: die Dauer des Vortrags (meist 15 bis 20 Minuten), ob ein Handout gewünscht ist und welche Bewertungskriterien gelten. Jede Schule hat dafür ein eigenes Blatt – frag danach.",
      "Rechne vom Termin aus rückwärts. Vier Wochen reichen gut, wenn du jede Woche einen festen Schritt schaffst. Den Plan dazu erstellt dir der Zeitplaner unten auf dieser Seite.",
    ],
    check: ["Thema mit der Lehrkraft abgesprochen", "Dauer, Handout und Kriterien geklärt", "Termin eingetragen und Zeitplan erstellt"] },
  { id: "verstehen", nr: 2, titel: "Verstehen, bevor du erklärst", zeile: "Du kannst nur gut erklären, was du selbst gerechnet hast",
    frage: "Wie wird aus einer Buchseite ein Thema, das du wirklich beherrschst?",
    absaetze: [
      "Lies die GFS-Seite im Buch dreimal: einmal ganz, einmal mit Stift und Papier (jede Rechnung selbst nachrechnen), einmal so, als müsstest du sie jemandem erklären, der sie nicht kennt. Wo du stockst, liegt deine Lücke.",
      "Die Themenseiten hier im Kurs liefern genau das, was im Buch fehlt: die ausführliche Herleitung, ein Bild zum Ausprobieren und Aufgaben mit vollständigem Rechenweg. Arbeite sie durch, bis die Übungen auf Stufe 4 sitzen.",
      "Sammle unterwegs die Fragen, die dir selbst kommen. Genau diese Fragen stellt später das Kolloquium.",
    ],
    check: ["GFS-Seite im Buch dreimal durchgearbeitet", "Themenseite inklusive Übungen geschafft", "Eigene Fragen notiert"] },
  { id: "faden", nr: 3, titel: "Der rote Faden", zeile: "Problem, Idee, Beweis, Anwendung, Fazit",
    frage: "Wie baust du den Vortrag so, dass jeder mitkommt?",
    absaetze: [
      "Ein Mathe-Vortrag folgt fast immer derselben Dramaturgie: ein konkretes Problem oder eine überraschende Beobachtung als Einstieg, dann die Idee dahinter, dann die saubere Rechnung oder der Beweis, dann Anwendungen und Muster, zuletzt ein Fazit in einem Satz.",
      "Plane je Abschnitt Minuten ein und halte die Summe zwei Minuten unter der erlaubten Zeit – Vorträge werden live immer länger, nicht kürzer. Jede Themenseite im Kurs hat einen fertigen roten Faden mit Minutenangaben als Vorlage.",
      "Zeige den Kern an der Tafel, nicht auf der Folie. Eine Rechnung, die vor den Augen der Klasse entsteht, beweist, dass du sie beherrschst. Folien sind für Bilder, Definitionen und Zusammenfassungen da.",
    ],
    check: ["Gliederung mit fünf Abschnitten steht", "Minuten je Abschnitt verteilt", "Entschieden, was an die Tafel kommt"] },
  { id: "medien", nr: 4, titel: "Folien und Handout", zeile: "Wenig Text, große Formeln, ein Gedanke pro Folie",
    frage: "Woran erkennt man gute Folien und ein gutes Handout?",
    absaetze: [
      "Eine Folie trägt einen Gedanken. Formeln groß und übereinander geschrieben, keine Fließtexte, keine Animationen, die ablenken. Lies deine Folien einmal aus drei Metern Entfernung – was du nicht lesen kannst, kann die letzte Reihe auch nicht lesen.",
      "Das Handout ist ein bis zwei Seiten lang und für danach gedacht: die Definition, die zentrale Formel, der Beweis in Kurzform, zwei Übungsaufgaben mit Lösung und deine Quellen. Es ersetzt den Vortrag nicht, es erinnert daran.",
      "Quellen gehören auf die letzte Folie und aufs Handout – das Schulbuch mit Seitenzahl, dazu höchstens zwei weitere Quellen, die du wirklich benutzt hast.",
    ],
    check: ["Folien aus drei Metern lesbar", "Handout mit Formel, Beweis, Aufgaben und Quellen", "Quellen vollständig"] },
  { id: "ueben", nr: 5, titel: "Vortragen üben", zeile: "Dreimal laut, einmal mit Uhr, einmal vor Publikum",
    frage: "Wie wird aus dem fertigen Material ein sicherer Auftritt?",
    absaetze: [
      "Halte den Vortrag mindestens dreimal komplett laut – nicht im Kopf. Beim ersten Mal merkst du, wo die Übergänge hakeln, beim zweiten Mal stoppst du die Zeit, beim dritten Mal sprichst du vor einem Zuhörer, der Fragen stellen darf.",
      "Übe den Tafelanschrieb getrennt: Welche Zeile steht wo, wie groß schreibst du, wann wischst du. Wer das vorher geübt hat, dreht der Klasse beim Vortrag nicht minutenlang den Rücken zu.",
      "Lerne den ersten und den letzten Satz auswendig. Alles dazwischen sprichst du frei anhand deiner Gliederung – Stichwortkarten sind erlaubt, abgelesene Sätze nicht.",
    ],
    check: ["Dreimal laut gehalten", "Zeit gestoppt und eingehalten", "Tafelanschrieb geübt"] },
  { id: "kolloquium", nr: 6, titel: "Das Kolloquium", zeile: "Die Fragen nach dem Vortrag entscheiden oft über die Note",
    frage: "Welche Fragen kommen – und wie antwortest du, wenn du es nicht weißt?",
    absaetze: [
      "Es gibt drei Fragetypen: Verständnisfragen (Warum gilt das?), Transferfragen (Was passiert, wenn …?) und Grenzfragen (Wo funktioniert das nicht mehr?). Zu jedem Thema findest du im Kurs ein Kolloquium-Training mit genau diesen Fragen – von Basis bis Profi.",
      "Antworte in zwei, drei Sätzen und mit einem Beispiel. Wer eine Frage mit einer konkreten Zahl beantwortet, wirkt sicherer als jemand, der allgemein bleibt.",
      "Wenn du etwas nicht weißt: sag es, und sag dann, was du weißt. „Das habe ich nicht untersucht – aber ich würde so ansetzen: …“ ist eine gute Antwort. Raten und Schweigen sind schlechte.",
    ],
    check: ["Kolloquium-Training zum Thema durchgearbeitet", "Zu jeder Frage ein Beispiel parat", "Antwortformel für Unbekanntes geübt"] },
  { id: "bewertung", nr: 7, titel: "Die Bewertung verstehen", zeile: "Wer die Kriterien kennt, kann sie erfüllen",
    frage: "Worauf achtet die Lehrkraft – und was zählt am meisten?",
    absaetze: [
      "Die GFS in Baden-Württemberg zählt wie eine Klassenarbeit. Bewertet werden fast überall dieselben Bereiche: fachliche Richtigkeit und Tiefe, Aufbau und roter Faden, Medien und Handout, Vortragsweise und das Kolloquium. Die genaue Gewichtung legt deine Schule fest – darum das Kriterienblatt erfragen.",
      "Die fachliche Tiefe wiegt in Mathe am schwersten: Ein sauber geführter Beweis an der Tafel und sichere Antworten im Kolloquium bringen mehr als die schönsten Folien.",
      "Geh am Ende die Checkliste jedes Schritts hier durch. Wenn alle Haken gesetzt sind, hast du alles getan, was in deiner Hand liegt.",
    ],
    check: ["Kriterienblatt der Schule gelesen", "Beweis an der Tafel sicher", "Alle Checklisten abgehakt"] },
];

/* ---------- Zeitplan: vom Termin aus rückwärts ---------- */
const TAG = 24 * 60 * 60 * 1000;
export const MEILENSTEINE = [
  { tage: 28, titel: "Thema und Rahmen geklärt", schritt: "thema" },
  { tage: 21, titel: "Thema verstanden, Übungen sitzen", schritt: "verstehen" },
  { tage: 17, titel: "Gliederung mit Minuten steht", schritt: "faden" },
  { tage: 12, titel: "Folien und Handout im Entwurf", schritt: "medien" },
  { tage: 7, titel: "Erster Probevortrag mit Uhr", schritt: "ueben" },
  { tage: 4, titel: "Kolloquium-Training geschafft", schritt: "kolloquium" },
  { tage: 2, titel: "Handout abgegeben, Generalprobe", schritt: "bewertung" },
  { tage: 0, titel: "Deine GFS", schritt: null },
];

/* ISO-Datum "JJJJ-MM-TT" als UTC-Mitternacht (zeitzonenfrei vergleichbar) */
export const datumLesen = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null;
};
export const datumSchreiben = (ms) => new Date(ms).toISOString().slice(0, 10);
const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
export const datumZeigen = (ms) => { const d = new Date(ms); return `${WOCHENTAGE[d.getUTCDay()]}, ${d.getUTCDate()}.${d.getUTCMonth() + 1}.`; };

/* Liefert die Meilensteine mit Datum; ist der Termin näher als 28 Tage, werden die
   Abstände proportional gestaucht, damit der Plan trotzdem heute beginnt. */
export function zeitplan(terminIso, heuteIso) {
  const termin = datumLesen(terminIso), heute = datumLesen(heuteIso);
  if (termin === null || heute === null) return null;
  const rest = Math.round((termin - heute) / TAG);
  if (rest < 0) return { rest, vorbei: true, schritte: [] };
  const faktor = rest >= 28 ? 1 : rest / 28;
  const schritte = MEILENSTEINE.map((m) => {
    const tage = Math.round(m.tage * faktor);
    const datum = termin - tage * TAG;
    return { ...m, tage, datum, iso: datumSchreiben(datum), anzeige: datumZeigen(datum), vorbei: datum < heute, heute: datum === heute };
  });
  return { rest, vorbei: false, gestaucht: faktor < 1, schritte };
}
