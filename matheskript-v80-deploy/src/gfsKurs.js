/* ============================================================
   KURS GFS – Daten und Logik (keine Importe)
   Zwei Teile: der allgemeine Leitfaden (LEITFADEN) und die GFS-Themen
   je Stufe aus dem Lambacher Schweizer BW (THEMEN).
   Die Themenliste folgt den GFS-Seiten der Bücher (Stoffverteilungspläne
   von Klett: LS 8/9 BW ab 2014, LS 10 BW ab 2016, Kursstufe Leistungsfach
   BW 2021). Nur Themen mit `ansicht` haben schon eine Themenseite; die
   anderen stehen als „Seite folgt“ in der Liste.
   Getestet in tests/gfsKurs.test.mjs.
   ============================================================ */

export const KLASSEN = [8, 9, 10, 11, 12, 13];
export const klasseName = (k) => (k >= 11 ? `Klasse ${k} · Kursstufe` : `Klasse ${k}`);
/* Ein Thema gehört zu einer oder mehreren Klassen (Kursstufe: G8 Klasse 11 = G9 Klasse 12).
   stufenText(t) sagt es in Worten, z. B. „Klasse 10“ oder „G8 Klasse 11 · G9 Klasse 12“. */
export const stufenText = (t) => (t.schulart ? Object.entries(t.schulart).map(([s, k]) => `${s} Klasse ${k}`).join(" · ") : klasseName(t.klasse));

/* ---------- Stufen für die Auswahl „Klasse wählen“ ----------
   Klassen 8–10 einzeln; die Kursstufe in zwei Jahren (Reihenfolge der Kapitel wie im
   Klett-Jahresplan: 1. Jahr Analysis, LGS, Geraden/Ebenen – 2. Jahr Graphen, Abstände, Stochastik). */
export const STUFEN = [
  { id: "8", name: "Klasse 8", klassen: [8] },
  { id: "9", name: "Klasse 9", klassen: [9] },
  { id: "10", name: "Klasse 10", klassen: [10] },
  { id: "k1", name: "Kursstufe 1", zusatz: "G8 Klasse 11 · G9 Klasse 12", kurzZusatz: "G8 Kl. 11 · G9 Kl. 12", klassen: [11, 12], schulart: { G8: 11, G9: 12 } },
  { id: "k2", name: "Kursstufe 2", zusatz: "G8 Klasse 12 · G9 Klasse 13", kurzZusatz: "G8 Kl. 12 · G9 Kl. 13", klassen: [12, 13], schulart: { G8: 12, G9: 13 } },
];
export const stufeVon = (id) => STUFEN.find((s) => s.id === String(id)) || null;
/* alter Speicherstand (Klasse als Zahl) → Stufe */
export const stufeAusKlasse = (k) => (k == null ? null : k <= 10 ? String(k) : k === 13 ? "k2" : "k1");

/* ---------- Themen ----------
   stufe = Eintrag in STUFEN; kapitel/kapitelName wie im Buch; zeile = ein Satz, worum es geht.
   Gebaute Themenseiten haben zusätzlich ansicht, seite (Buchseite), frage, videos/animationen. */
const T = (stufe, kapitel, kapitelName, titel, zeile, mehr = {}) => {
  const s = stufeVon(stufe);
  const klassen = mehr.klassen || s.klassen;
  return { id: mehr.id || titel, stufe, kapitel, kapitelName, titel, kurz: mehr.kurz || titel, zeile, klasse: klassen[0], klassen,
    ...(s.schulart ? { schulart: s.schulart } : {}), ...mehr };
};
export const THEMEN = [
  /* Klasse 8 – Lambacher Schweizer 8 BW */
  T("8", "I", "Terme mit mehreren Variablen", "Differenzen mit Quadraten", "Zahlenmuster mit Quadratzahlen entdecken und mit Termen beweisen.", { id: "quadratdifferenzen" }),
  T("8", "II", "Zufall und Wahrscheinlichkeit", "Efron-Würfel", "Vier Würfel, und jeder wird von einem anderen geschlagen – wie geht das?", { id: "efron" }),
  T("8", "III", "Reelle Zahlen", "Bruch- und Dezimalschreibweise", "Wann bricht eine Dezimalzahl ab, wann wird sie periodisch?", { id: "dezimal" }),
  T("8", "IV", "Quadratische Funktionen", "Ketten, Brücken und Parabeln", "Hängt eine Kette wie eine Parabel? Bögen und Seile vergleichen.", { id: "ketten" }),
  T("8", "V", "Strahlensätze", "Perspektivisches Zeichnen", "Fluchtpunkte und Strahlensätze: So wirkt ein Bild räumlich.", { id: "perspektive" }),
  T("8", "VI", "Quadratische Gleichungen", "Der Satz von Vieta", "Summe und Produkt der Lösungen direkt aus der Gleichung ablesen.", { id: "vieta" }),
  T("8", "VII", "Lineare Gleichungssysteme", "Mischungen", "Mischungsaufgaben mit Gleichungssystemen lösen.", { id: "mischungen" }),

  /* Klasse 9 – Lambacher Schweizer 9 BW */
  T("9", "I", "Potenzen", "Besondere Zahlensummen", "Summen wie 1 + 2 + … + n geschickt berechnen und begründen.", { id: "zahlensummen" }),
  T("9", "III", "Potenzfunktionen und Exponentialfunktionen", "Altersbestimmung mit der C14-Methode", "Wie alt ist ein Fund? Zerfall mit einer Halbwertszeit von rund 5730 Jahren.", { id: "c14", kurz: "C14-Methode" }),
  T("9", "IV", "Berechnungen in rechtwinkligen Dreiecken", "Weitere Beweise für den Satz des Pythagoras", "Zerlegen, ergänzen, ähnliche Dreiecke – verschiedene Wege zu a² + b² = c².", { id: "pythagoras-beweise", kurz: "Pythagoras-Beweise" }),
  T("9", "IV", "Berechnungen in rechtwinkligen Dreiecken", "Der Sinus- und der Kosinussatz", "Seiten und Winkel in beliebigen Dreiecken berechnen.", { id: "sinussatz", kurz: "Sinus- und Kosinussatz" }),
  T("9", "V", "Kreise", "Das Reuleaux’sche Dreieck – Gleichdicks", "Nicht rund und trotzdem in jeder Richtung gleich breit.", { id: "reuleaux", kurz: "Reuleaux-Dreieck" }),
  T("9", "VI", "Wahrscheinlichkeit", "Das Ziegenproblem", "Bleiben oder wechseln? Warum Wechseln mit 2/3 gewinnt.", { id: "ziegenproblem", kurz: "Das Ziegenproblem", frage: "Bleiben oder wechseln – warum gewinnt Wechseln mit 2/3?", ansicht: "gfs-ziegen", videos: 0, animationen: 5 }),
  T("9", "VI", "Wahrscheinlichkeit", "Dunkelfeldforschung", "Wie schätzt man, was niemand offen zugibt? Befragungen mit Zufall.", { id: "dunkelfeld" }),
  T("9", "VII", "Körper", "Platonische Körper", "Warum es genau fünf regelmäßige Körper gibt.", { id: "platonisch", kurz: "Platonische Körper", frage: "Warum gibt es genau fünf regelmäßige Körper?", ansicht: "gfs-platonisch", videos: 0, animationen: 5 }),

  /* Klasse 10 – Lambacher Schweizer 10 BW */
  T("10", "I", "Funktionen und ihre Graphen", "Polynomdivision", "Ganzrationale Funktionen in Faktoren zerlegen.", { id: "polynomdivision" }),
  T("10", "II", "Schlüsselkonzept: Ableitung", "Der Brennpunkt einer Parabel", "Warum Satellitenschüsseln parabelförmig sind.", { id: "brennpunkt" }),
  T("10", "III", "Schlüsselkonzept: Vektoren", "Kugelgeometrie", "Großkreise, kürzeste Wege und Dreiecke auf der Kugel.", { id: "kugelgeometrie" }),
  T("10", "IV", "Extremstellen und Wendestellen", "Trassierungen", "Straßen und Gleise ohne Knick und ohne Ruck verbinden.", { id: "trassierung" }),
  T("10", "V", "Schlüsselkonzept: Binomialverteilung", "Pascal’sches Dreieck und Binomialkoeffizienten", "Warum im Zahlendreieck genau die Binomialkoeffizienten stehen.",
    { id: "pascal", kurz: "Pascal’sches Dreieck", seite: 154, frage: "Warum stehen im Zahlendreieck genau die Binomialkoeffizienten?", ansicht: "gfs-pascal", videos: 1, animationen: 0 }),
  T("10", "VI", "Trigonometrische Funktionen", "Parametrisierte Kurven", "Kreise, Ellipsen und Lissajous-Figuren aus Sinus und Kosinus.", { id: "kurven" }),

  /* Kursstufe 1 – Lambacher Schweizer Kursstufe BW (Analysis, LGS, Geraden und Ebenen) */
  T("k1", "I", "Grundlagen der Differenzialrechnung", "Die optimale Dose – Extremwertprobleme mit Nebenbedingungen", "Welche Dose braucht bei festem Inhalt am wenigsten Blech?",
    { id: "dose", kurz: "Die optimale Dose", seite: 34, frage: "Wie muss eine Dose aussehen, damit sie bei festem Inhalt am wenigsten Blech braucht?", ansicht: "gfs-dose", videos: 0, animationen: 6 }),
  T("k1", "I", "Grundlagen der Differenzialrechnung", "Stetigkeit", "Ohne Absetzen zeichnen – und warum Sprünge Ableitungen verhindern.", { id: "stetigkeit" }),
  T("k1", "II", "Exponential- und Logarithmusfunktionen", "Beschränktes Wachstum", "Wachstum mit Obergrenze: Abkühlen, Sättigen, Annähern.", { id: "beschraenkt" }),
  T("k1", "II", "Exponential- und Logarithmusfunktionen", "Ausbreitung eines Virus modellieren", "Infektionszahlen mit Wachstumsmodellen beschreiben.", { id: "virus", kurz: "Virus-Ausbreitung" }),
  T("k1", "III", "Integralrechnung", "Partielle Integration", "Die Produktregel rückwärts: Integrale von Produkten berechnen.", { id: "partiell" }),
  T("k1", "V", "Lineare Gleichungssysteme", "Kubische Splines", "Kurven aus Polynomstücken glatt zusammensetzen.", { id: "splines" }),
  T("k1", "VI", "Geraden und Ebenen", "Kugeln", "Kugelgleichung, Tangentialebenen und Schnitte mit Geraden.", { id: "kugeln" }),

  /* Kursstufe 2 – Lambacher Schweizer Kursstufe BW (Graphen, Abstände und Winkel, Stochastik) */
  T("k2", "IV", "Funktionen und ihre Graphen", "Symmetrie von Graphen", "Symmetrie zu beliebigen Achsen und Punkten nachweisen.", { id: "symmetrie" }),
  T("k2", "VII", "Abstände und Winkel", "Orthogonale Projektion – Skalarprodukt", "Was das Skalarprodukt geometrisch misst: den Schatten eines Vektors.", { id: "projektion", kurz: "Orthogonale Projektion" }),
  T("k2", "VII", "Abstände und Winkel", "Skalar- und Vektorprodukt in der Physik", "Arbeit, Drehmoment und Lorentzkraft mit Vektoren.", { id: "physik", kurz: "Vektoren in der Physik" }),
  T("k2", "VIII", "Grundlagen der Wahrscheinlichkeitsrechnung", "Die geometrische Verteilung", "Wie lange dauert es bis zum ersten Treffer?", { id: "geometrisch" }),
  T("k2", "VIII", "Grundlagen der Wahrscheinlichkeitsrechnung", "Der Satz von Bayes", "Positiv getestet – wie wahrscheinlich ist man wirklich krank?", { id: "bayes", kurz: "Der Satz von Bayes", frage: "Positiv getestet – wie wahrscheinlich ist man wirklich krank?", ansicht: "gfs-bayes", videos: 0, animationen: 4 }),
  T("k2", "IX", "Testen mit der Binomialverteilung", "Der Chi-Quadrat-Test", "Ist ein Würfel fair? Viele Häufigkeiten auf einmal testen.", { id: "chiquadrat" }),
  T("k2", "X", "Normalverteilung", "Die Exponentialverteilung", "Wartezeiten ohne Gedächtnis: Zerfall, Lebensdauer, Warteschlangen.",
    { id: "exponential", kurz: "Exponentialverteilung", frage: "Warum ist ein Bauteil, das schon 1000 Stunden hält, wieder so gut wie neu?", ansicht: "gfs-exponential", videos: 0, animationen: 5 }),
  T("k2", "X", "Normalverteilung", "Der Satz von de Moivre-Laplace", "Warum die Binomialverteilung für große n zur Glockenkurve wird.", { id: "moivre", kurz: "de Moivre-Laplace" }),
];
/* Themen einer Stufe ("8" … "k2"); eine Zahl (alte Aufrufe) gilt als Klasse */
export const themenFuer = (stufe) => (typeof stufe === "number"
  ? THEMEN.filter((t) => t.klassen.includes(stufe))
  : THEMEN.filter((t) => t.stufe === String(stufe)));
export const fertigeThemen = () => THEMEN.filter((t) => t.ansicht);
export const themenZahl = () => fertigeThemen().length;

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
