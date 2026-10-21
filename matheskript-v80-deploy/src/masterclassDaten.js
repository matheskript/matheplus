/* ============================================================
   Mathe Abi Masterclass – Kursinhalte (reine Daten, auch für Tests).

   Gleiche Bauweise wie der Kurs Differentialrechnung: ein Modul je Videolektion,
   gegliedert nach den sechs Monaten des Programms (funcMasterclass.jsx → MONATE).

   ACHTUNG: Die zehn Videos sind PLATZHALTER (fiktiv). Sobald ein Video gedreht ist:
   bei der Lektion `video: { youtube: "<ID>" }` oder `video: { bunny: "<Bibliothek>/<ID>" }`
   eintragen – dann spielt der Player das echte Video (erst nach Klick, externeMedien.js),
   und das Schild „Video folgt“ verschwindet.

   werkzeuge: Schlüssel in MC_WERKZEUGE (funcMasterclassKurs.jsx).
   Zeiten in `marken` sind Sekunden ab Videobeginn.
   ============================================================ */

export const MC_MONATE = [
  { id: 1, titel: "Fundament", zeile: "Pen & Paper, Zielbild, Arbeitsweise" },
  { id: 2, titel: "Analysis I", zeile: "Ableitung, Kurvendiskussion, Anwendungen" },
  { id: 3, titel: "Analysis II", zeile: "Integrale und Abi-Aufgaben" },
  { id: 4, titel: "Vektoren", zeile: "Geraden, Ebenen, Abstände" },
  { id: 5, titel: "Stochastik", zeile: "Binomialverteilung und Hypothesentests" },
  { id: 6, titel: "Abi-Finale", zeile: "Strategie, Probeabitur, Prüfungsruhe" },
];

export const MC_VIDEOS = [
  {
    id: "willkommen", monat: 1, titel: "Willkommen in der Masterclass", dauer: 760,
    frage: "Wie laufen die nächsten sechs Monate – und wer willst du am Tag der Prüfung sein?",
    marken: [[0, "Was dich erwartet"], [150, "Die drei Stränge: Können, Klarheit, Haltung"], [380, "Dein Wochenrhythmus"], [560, "Brief an dein Abi-Ich"]],
    lernziele: ["Du kennst den Ablauf der sechs Monate und deinen Wochenrhythmus.", "Du weißt, welche Werkzeuge der App du wofür nutzt.", "Du hast ein klares Zielbild für dein Mathe-Abi."],
    mindset: { titel: "Brief an dein Abi-Ich", text: "Schreib eine halbe Seite: Wie arbeitest du in Mathe am Tag der Prüfung? Was ist dann anders als heute? Du liest den Brief jeden Monat neu." },
    auftrag: ["Video ansehen und den Brief an dein Abi-Ich schreiben", "Standortcheck im Lernpfad „Abi komplett“ machen", "Konto in der App vollständig einrichten (Klasse, Schulart)"],
    werkzeuge: ["lernpfad", "axiome"],
    mathilda: "Ich habe gerade das Willkommensvideo der Masterclass gesehen. Hilf mir, ein realistisches Ziel für mein Mathe-Abi zu formulieren – frag mich erst, wo ich gerade stehe.",
  },
  {
    id: "penpaper", monat: 1, titel: "Pen & Paper: So schreibst du Mathe auf", dauer: 1085,
    frage: "Warum entscheidet die Art, wie du schreibst, über die Hälfte deiner Fehler?",
    marken: [[0, "Super-Operator, Gartenzäune, Häuser"], [270, "Nähe = Priorität"], [520, "Blanko statt Karo"], [760, "Nichts bleibt unvereinfacht stehen"], [940, "Dein 7-Tage-Plan"]],
    lernziele: ["Du erkennst Final Operatoren und gliederst Terme mit Abständen.", "Du schreibst einen Schritt pro Zeile, Gleichheitszeichen untereinander.", "Du vereinfachst jedes Ergebnis vollständig."],
    mindset: { titel: "Fehler sind Daten", text: "Jeder Fehler auf deinem Blatt verrät dir etwas über deine Arbeitsweise. Ab heute markierst du ihn, statt ihn wegzuradieren." },
    auftrag: ["Pen-&-Paper-Lektionen 1–4 in der App abhaken", "Ein Blatt mit Mathilda prüfen lassen und den einen Hebel umsetzen", "Jeden Tag 20 Minuten auf Blanko-Papier rechnen"],
    werkzeuge: ["penpaper", "terme", "gleichverstehen"],
    mathilda: "Ich übe gerade Pen & Paper aus der Masterclass. Erklär mir an einem Beispiel, was ein Final Operator ist – und lass mich dann selbst einen Term gliedern.",
  },
  {
    id: "ableitung", monat: 2, titel: "Ableitung verstehen: vom Zoom zur Tangente", dauer: 1290,
    frage: "Was misst die Ableitung eigentlich – und warum wird jede Kurve beim Hineinzoomen zur Geraden?",
    marken: [[0, "Steigung einer Kurve?"], [240, "Sekante und Differenzenquotient"], [600, "Grenzwert: die Tangente taucht auf"], [900, "Die Regeln im Überblick"], [1140, "Typische Abi-Fallen"]],
    lernziele: ["Du erklärst f′(x₀) als Steigung der Tangente.", "Du berechnest Differenzenquotienten und deutest sie.", "Du wendest Potenz-, Faktor-, Summen-, Produkt- und Kettenregel sicher an."],
    mindset: { titel: "Verstehen vor Rechnen", text: "Bevor du eine Regel anwendest, sag in einem Satz, was die Ableitung an dieser Stelle bedeutet. Dieser Satz ist dein Anker in der Klausur." },
    auftrag: ["Im Kurs Differentialrechnung die Module 4–8 lesen", "Ableitungstrainer: 3 Runden Kettenregel ohne Fehler", "Eine Graph-Zuordnung mit 10 von 10 Treffern"],
    werkzeuge: ["zoomfilm", "diffq", "ableitungstrainer", "graphzuordnung", "diffkurs"],
    mathilda: "Ich arbeite an der Ableitung (Masterclass, Monat 2). Stell mir eine Frage, mit der ich prüfen kann, ob ich f′(x₀) wirklich verstanden habe.",
  },
  {
    id: "kurvendiskussion", monat: 2, titel: "Kurvendiskussion in sieben Schritten", dauer: 1450,
    frage: "Wie untersuchst du jede Funktion mit System – ohne einen Schritt zu vergessen?",
    marken: [[0, "Die sieben Schritte"], [300, "Nullstellen und Symmetrie"], [640, "Extrem- und Wendepunkte"], [1010, "Notwendige und hinreichende Bedingung"], [1260, "Ergebnis sauber aufschreiben"]],
    lernziele: ["Du arbeitest die sieben Schritte in fester Reihenfolge ab.", "Du begründest Extrem- und Wendepunkte mit notwendiger und hinreichender Bedingung.", "Du skizzierst den Graphen aus deinen Ergebnissen."],
    mindset: { titel: "Routinen geben Ruhe", text: "Eine feste Reihenfolge nimmt dir Entscheidungen ab. Je weniger du überlegen musst, was als Nächstes kommt, desto mehr Kraft bleibt für die Mathematik." },
    auftrag: ["Zwei Kurvendiskussionen vollständig auf Papier, danach mit dem Plotter vergleichen", "Kurvendiskussion beliebig: eine e-Funktion untersuchen", "Fehler-Logbuch: jeden Fehler mit Ursache eintragen"],
    werkzeuge: ["plotter", "advplotter", "rechenweg"],
    mathilda: "Ich übe Kurvendiskussion (Masterclass). Gib mir eine ganzrationale Funktion dritten Grades und begleite mich Schritt für Schritt, ohne vorzurechnen.",
  },
  {
    id: "anwendungen", monat: 2, titel: "Steckbrief und Optimierung", dauer: 1185,
    frage: "Wie wird aus einem Text eine Gleichung – und aus der Gleichung die Antwort?",
    marken: [[0, "Textaufgaben sind verschlüsselte Gleichungen"], [280, "Steckbrief: Bedingungen aufstellen"], [610, "Gleichungssystem lösen"], [850, "Optimierung: Haupt- und Nebenbedingung"], [1060, "Ränder prüfen"]],
    lernziele: ["Du übersetzt jede Information im Text in eine Bedingung.", "Du stellst Steckbriefaufgaben auf und löst das LGS.", "Du löst Optimierungsaufgaben inklusive Randwerten."],
    mindset: { titel: "Dranbleiben, wenn es zäh wird", text: "Textaufgaben fühlen sich am Anfang immer schwer an. Gib dir 10 Minuten, bevor du nachschaust – das ist genau das Training, das in der Prüfung zählt." },
    auftrag: ["Textaufgaben übersetzen: Thema „Steckbrief“, Stufe 3", "Zwei Steckbriefaufgaben komplett lösen", "Eine Optimierungsaufgabe aus der Werkstatt mit eigenem Ansatz"],
    werkzeuge: ["textaufgaben", "steckbrief", "optimierung", "lgs"],
    mathilda: "Ich übe Steckbriefaufgaben (Masterclass). Gib mir einen Aufgabentext und lass mich die Bedingungen selbst aufstellen – korrigier mich nur, wenn ich falsch liege.",
  },
  {
    id: "integrale", monat: 3, titel: "Integrale: Fläche, Bestand, Mittelwert", dauer: 1340,
    frage: "Was haben eine Fläche, eine Wassermenge und ein Durchschnitt gemeinsam?",
    marken: [[0, "Vom Rechteck zur Fläche"], [320, "Stammfunktionen"], [610, "Hauptsatz"], [880, "Flächen zwischen Graphen"], [1120, "Bestand und Mittelwert im Sachkontext"]],
    lernziele: ["Du bildest Stammfunktionen und berechnest bestimmte Integrale.", "Du unterscheidest Integralwert und Flächeninhalt.", "Du deutest Integrale im Sachkontext (Bestand, Mittelwert)."],
    mindset: { titel: "Fokus-Routine: 25 Minuten", text: "25 Minuten nur Mathe, Handy in einem anderen Raum, dann 5 Minuten Pause. Zwei solcher Einheiten bringen mehr als ein ganzer Nachmittag mit Ablenkung." },
    auftrag: ["Integrale: alle Modi einmal durcharbeiten", "Drei Flächen zwischen Graphen auf Papier", "Eine Sachaufgabe „Becken“ aus Textaufgaben übersetzen"],
    werkzeuge: ["integrale", "scharen", "advplotter"],
    mathilda: "Ich lerne Integrale (Masterclass, Monat 3). Frag mich, worin sich Integralwert und Flächeninhalt unterscheiden, und gib mir dann ein Beispiel zum Prüfen.",
  },
  {
    id: "raum", monat: 4, titel: "Geraden und Ebenen im Raum sehen", dauer: 1255,
    frage: "Wie wird aus drei Zahlen ein Punkt – und aus Punkten eine Ebene, die du vor dir siehst?",
    marken: [[0, "Koordinaten im Raum"], [260, "Vektoren als Verschiebungen"], [540, "Geraden in Parameterform"], [830, "Ebenen: drei Formen"], [1080, "Lage von Gerade und Ebene"]],
    lernziele: ["Du stellst Geraden- und Ebenengleichungen auf.", "Du wechselst zwischen Parameter-, Normalen- und Koordinatenform.", "Du bestimmst die Lage von Geraden und Ebenen zueinander."],
    mindset: { titel: "Selbstvertrauen sichtbar machen", text: "Schreib jeden Freitag drei Dinge auf, die diese Woche besser geklappt haben als vor einem Monat. Fortschritt, den man sieht, trägt weiter." },
    auftrag: ["Im Kurs Vektoren die Kapitel II und III lesen", "Drei Punkte – eine Ebene: zwei Ebenen in alle Formen bringen", "Ebenen-Visualizer: Lagebeziehungen ausprobieren"],
    werkzeuge: ["vektorgenerator", "geraden", "dreipunkte", "ebenen", "vekkurs"],
    mathilda: "Ich lerne Geraden und Ebenen (Masterclass, Monat 4). Gib mir zwei Geraden im Raum und lass mich ihre Lage bestimmen – mit Rückfragen statt Lösung.",
  },
  {
    id: "abstaende", monat: 4, titel: "Abstände und Winkel: der Abi-Werkzeugkasten", dauer: 1050,
    frage: "Welches Verfahren nimmst du wann – und woran erkennst du es in der Aufgabe?",
    marken: [[0, "Skalarprodukt und Winkel"], [240, "Kreuzprodukt und Normalenvektor"], [480, "Abstand Punkt–Ebene (HNF)"], [730, "Abstand Punkt–Gerade, windschiefe Geraden"], [920, "Spiegelungen"]],
    lernziele: ["Du berechnest Winkel zwischen Vektoren, Geraden und Ebenen.", "Du bestimmst Abstände mit der passenden Methode.", "Du erkennst an der Formulierung, welches Verfahren gefragt ist."],
    mindset: { titel: "Ein Plan für jede Aufgabe", text: "Bevor du rechnest: Skizze, gesucht, Verfahren in einem Satz. 60 Sekunden Plan sparen dir 10 Minuten Umwege." },
    auftrag: ["Abstände: jeden Fall einmal rechnen", "Kreuzprodukt: 5 Aufgaben ohne Fehler", "Abi-Kette Geometrie unter Zeit"],
    werkzeuge: ["winkel", "kreuzprodukt", "abstaende", "ebenevsebene"],
    mathilda: "Ich übe Abstände im Raum (Masterclass). Gib mir eine Aufgabe und frag mich zuerst, welches Verfahren ich wählen würde und warum.",
  },
  {
    id: "stochastik", monat: 5, titel: "Binomialverteilung und Hypothesentests", dauer: 1395,
    frage: "Wann ist ein Ergebnis Zufall – und wann ein Hinweis, dass etwas nicht stimmt?",
    marken: [[0, "Bernoulli-Ketten"], [300, "Binomialverteilung: genau, höchstens, mindestens"], [640, "Erwartungswert und Streuung"], [900, "Hypothesentest Schritt für Schritt"], [1180, "Fehler 1. und 2. Art"]],
    lernziele: ["Du erkennst Bernoulli-Ketten und bestimmst n und p.", "Du übersetzt Signalwörter in Wahrscheinlichkeiten.", "Du führst einen einseitigen Hypothesentest vollständig durch."],
    mindset: { titel: "Ruhig bleiben bei Unsicherheit", text: "Stochastik lebt vom Umgang mit Unsicherheit – genau wie die Prüfung. Übe, eine Entscheidung zu treffen und zu begründen, auch wenn du nicht hundertprozentig sicher bist." },
    auftrag: ["Textaufgaben: Signalwörter Stochastik, alle Stufen", "Bernoulli-Kette: 3 Runden", "Einen Hypothesentest komplett aufschreiben"],
    werkzeuge: ["bernoulli", "hypothesentest", "vierfelder", "normalverteilung"],
    mathilda: "Ich lerne Hypothesentests (Masterclass, Monat 5). Lass mich einen Test selbst aufstellen und frag nach, wenn ich Null- und Gegenhypothese verwechsle.",
  },
  {
    id: "finale", monat: 6, titel: "Abi-Strategie: dein Prüfungstag", dauer: 950,
    frage: "Wie holst du am Prüfungstag alles raus, was du kannst?",
    marken: [[0, "Die letzten vier Wochen"], [210, "Zeitplan in der Prüfung"], [420, "Teil A ohne Hilfsmittel"], [620, "Startritual und Atmung"], [810, "Was tun, wenn du hängst"]],
    lernziele: ["Du hast einen Zeitplan für Teil A und Teil B.", "Du kennst dein Startritual und deine Strategie, wenn du hängst.", "Du schreibst ein Probeabitur unter echten Bedingungen."],
    mindset: { titel: "Prüfungsruhe", text: "3 Minuten vor dem Start: viermal tief atmen, Ziel für die erste Aufgabe, erster Strich aufs Papier. Dieses Ritual übst du ab heute vor jeder Trainingseinheit." },
    auftrag: ["Abi-Sätze: einen vollständigen Satz unter Zeit", "Probeabitur schreiben und auswerten", "Brief an dein Abi-Ich ein letztes Mal lesen"],
    werkzeuge: ["abiketten", "abisaetze", "probeabitur"],
    mathilda: "In ein paar Wochen ist mein Mathe-Abi (Masterclass, Abi-Finale). Hilf mir, einen Wiederholungsplan für die letzten vier Wochen zu machen – frag mich erst nach meinen Schwächen.",
  },
];

/* Was ein Teilnehmer freigeschaltet bekommt (Anzeige auf der Kursseite und der Zugangsseite) */
export const MC_FREISCHALTUNGEN = [
  { id: "mathilda", titel: "MathildaAI ohne Tageslimit", zeile: "Blatt scannen, Tutor-Chat, Rechenwege prüfen", ziel: { ansicht: "analyse", foto: "blatt" } },
  { id: "videos", titel: "Alle Videolektionen", zeile: "10 Lektionen über sechs Monate", ziel: null },
  { id: "kurse", titel: "Kurse Differentialrechnung und Vektoren", zeile: "Schulbuch lesen und direkt trainieren", ziel: { ansicht: "diffkurs" } },
  { id: "penpaper", titel: "Pen & Paper", zeile: "Neun Lektionen für saubere Rechenwege", ziel: { ansicht: "penpaperkurs" } },
  { id: "abi", titel: "Abi-Ketten, Abi-Sätze, Probeabitur", zeile: "Prüfungstraining unter Zeit", ziel: { ansicht: "abisaetze" } },
  { id: "pro", titel: "Alle Werkzeuge und Trainer", zeile: "Pro-Zugang für die ganze App", ziel: { ansicht: "start" } },
];

/* Live-Bausteine. Termine sind PLATZHALTER, bis Basti sie festlegt. */
export const MC_LIVE = [
  { id: "call", titel: "Wöchentlicher Zoom-Call", wann: "montags, 18:30 Uhr", platzhalter: true },
  { id: "session", titel: "Trainingssession", wann: "mittwochs, 17:00 Uhr", platzhalter: true },
  { id: "intensiv", titel: "Intensivtage", wann: "Monat 2, 4 und 6 · samstags 10–16 Uhr", platzhalter: true },
];

export const videoNummer = (id) => MC_VIDEOS.findIndex((v) => v.id === id) + 1;
export const dauerText = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
export const gesamtMinuten = () => Math.round(MC_VIDEOS.reduce((a, v) => a + v.dauer, 0) / 60);
export const istEcht = (v) => !!(v && v.video && (v.video.youtube || v.video.bunny));

/* Fortschritt: ein Modul ist geschafft, wenn das Video gesehen und alle Aufträge abgehakt sind */
export function modulFertig(v, stand) {
  const s = stand || {};
  const gesehen = !!(s.gesehen && s.gesehen[v.id]);
  const auftrag = (s.auftrag && s.auftrag[v.id]) || [];
  return gesehen && v.auftrag.every((_, i) => !!auftrag[i]);
}
export function modulAnteil(v, stand) {
  const s = stand || {};
  const teile = 1 + v.auftrag.length;
  const auftrag = (s.auftrag && s.auftrag[v.id]) || [];
  const n = (s.gesehen && s.gesehen[v.id] ? 1 : 0) + v.auftrag.filter((_, i) => !!auftrag[i]).length;
  return n / teile;
}
export const naechstesModul = (stand) => MC_VIDEOS.find((v) => !modulFertig(v, stand)) || MC_VIDEOS[0];

/* Woher die Werkzeuge der Lektionen kommen:
   diff = Werkzeug aus dem Kurs Differentialrechnung, vek = aus dem Kurs Vektoren,
   seite = Werkzeugseite (WZ_SEITEN) als Pop-up, link = eigene Seite der App (verlässt den Kurs). */
export const MC_WERKZEUG_QUELLEN = {
  lernpfad: { quelle: "link", titel: "Lernpfad „Abi komplett“", zeile: "Standortcheck und Wochenplan", zeichen: "→", ziel: { ansicht: "lernpfad" } },
  penpaper: { quelle: "link", titel: "Pen & Paper", zeile: "Neun Lektionen für saubere Rechenwege", zeichen: "✎", ziel: { ansicht: "penpaperkurs" } },
  diffkurs: { quelle: "link", titel: "Kurs Differentialrechnung", zeile: "Schulbuch lesen und trainieren", zeichen: "f′", ziel: { ansicht: "diffkurs" } },
  vekkurs: { quelle: "link", titel: "Kurs Vektoren, Geraden und Ebenen", zeile: "Schulbuch lesen und trainieren", zeichen: "a+b", ziel: { ansicht: "vekkurs" } },
  abiketten: { quelle: "link", titel: "Abi-Ketten", zeile: "Analysis, Geometrie, Stochastik unter Zeit", zeichen: "⛓", ziel: { ansicht: "abiketten" } },
  abisaetze: { quelle: "link", titel: "Abi-Sätze", zeile: "Teil A und B wie im echten Abi", zeichen: "A·B", ziel: { ansicht: "abisaetze" } },
  probeabitur: { quelle: "link", titel: "Probeabitur", zeile: "Einmal alles unter echten Bedingungen", zeichen: "Abi", ziel: { ansicht: "abitur" } },
  zoomfilm: { quelle: "diff" }, diffq: { quelle: "diff" }, ableitungstrainer: { quelle: "diff" }, graphzuordnung: { quelle: "diff" },
  plotter: { quelle: "diff" }, advplotter: { quelle: "diff" }, rechenweg: { quelle: "diff" },
  lgs: { quelle: "vek" }, vektorgenerator: { quelle: "vek" }, geraden: { quelle: "vek" }, dreipunkte: { quelle: "vek" }, ebenen: { quelle: "vek" },
  winkel: { quelle: "vek" }, kreuzprodukt: { quelle: "vek" }, abstaende: { quelle: "vek" }, ebenevsebene: { quelle: "vek" },
  axiome: { quelle: "seite" }, terme: { quelle: "seite" }, gleichverstehen: { quelle: "seite" }, textaufgaben: { quelle: "seite" },
  steckbrief: { quelle: "seite" }, optimierung: { quelle: "seite" }, integrale: { quelle: "seite" }, scharen: { quelle: "seite" },
  bernoulli: { quelle: "seite" }, hypothesentest: { quelle: "seite" }, vierfelder: { quelle: "seite" }, normalverteilung: { quelle: "seite" },
};
