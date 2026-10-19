/* ======================================================================
   Feste Listen der Startseite, die auch das ☰-Hauptmenü zeigt.
   Reine Daten, keine Importe: dürfen von base-, func- und Logikdateien importiert werden.
   Startseite (func2.jsx) und Hauptmenü (hauptmenue.js / funcHauptmenue.jsx) lesen beide von hier –
   ein neues Lernangebot in „Mathe entdecken“ steht also nur noch hier (und in funcEntdecken.jsx).

   Felder: name, zeile, bild (Motiv MiniBild auf der Startseite), zeichen (Kurzsymbol im Menü), ziel, etikett.
   ====================================================================== */

/* Abi-Vorbereitung: gehört nur zur Oberstufe (und „Alle“) und besteht aus Seiten, nicht aus Werkzeugen des Registers */
export const ABI_MENUE = [
  { name: "Abi-Ketten", zeile: "Eine Abi-Aufgabe durch mehrere Werkzeuge", bild: "abikette", zeichen: "⛓", ziel: { ansicht: "abiketten" }, etikett: "trainieren" },
  { name: "Abi-Sätze", zeile: "Zehn komplette Sätze im Abi-Format", bild: "abisatz", zeichen: "A|B", ziel: { ansicht: "abisaetze" }, etikett: "trainieren" },
  { name: "Probeabitur", zeile: "Teil A und B mit Uhr und Notenpunkten", bild: "probeabi", zeichen: "15P", ziel: { ansicht: "abitur" }, etikett: "trainieren" },
];

/* Mathe entdecken → Lernangebote und Wettbewerbe (aufklappbar wie Schulmathe-Training).
   „seite“ öffnet das Lernangebot direkt (EntdeckenSeite start=…). */
export const ENTDECKEN_MENUE = [
  { kopf: true, name: "entdecken-lernen", nr: 1, titel: "Lernangebote", zeile: "Selbst herleiten, warum Mathematik funktioniert" },
  { name: "Axiome", zeile: "Fundament der Mathematik, erste Beweise", bild: "axiome", zeichen: "a+0", ziel: { ansicht: "entdecken", seite: "axiome" } },
  { name: "Mathematisches Denken", zeile: "Video und Fragen zum Nachdenken", bild: "video", zeichen: "?!", ziel: { ansicht: "entdecken", seite: "einstieg" } },
  { name: "Pascalsches Dreieck", zeile: "Vom Zahlenmuster zur Potenzregel", bild: "pascal", zeichen: "121", ziel: { ansicht: "entdecken", seite: "praxis" } },
  { name: "Satz des Pythagoras", zeile: "Entdecke, warum a² + b² = c² gilt", bild: "pythagoras", zeichen: "a²+b²", ziel: { ansicht: "entdecken", seite: "pythagoras" } },
  { name: "Teilbarkeitsregeln", zeile: "Alle Regeln von 2 bis 9 selbst herleiten", bild: "teiler", zeichen: "3|n", ziel: { ansicht: "entdecken", seite: "teiler" } },
  { name: "Binomische Formeln", zeile: "Drei Formeln aus Flächen gebaut", bild: "terme", zeichen: "(a+b)²", ziel: { ansicht: "entdecken", seite: "binomisch" } },
  { name: "Ableitung als Grenzwert", zeile: "Von der Sekante zur Tangente", bild: "kurve", zeichen: "lim", ziel: { ansicht: "entdecken", seite: "grenzwert" } },
  { name: "Carl Friedrich Gauß", zeile: "Summenformel, Gauß-Verfahren und die Glocke vom Zehn-Mark-Schein", bild: "normal", zeichen: "Σ", ziel: { ansicht: "entdecken", seite: "gauss" } },
  { kopf: true, name: "entdecken-wettbewerbe", nr: 2, titel: "Mathe-Wettbewerbe", zeile: "Für alle, die mehr wollen" },
  { name: "Bundeswettbewerb Mathematik", zeile: "Nächste 1. Runde, Aufgaben vom Vorjahr", bild: "medaille", zeichen: "BWM", ziel: { ansicht: "bwm" } },
  { name: "Landeswettbewerbe", zeile: "Tippe auf dein Bundesland", bild: "landkarte", zeichen: "LW", ziel: { ansicht: "landeswettbewerbe" } },
  { name: "Übersicht und Fortschritt", zeile: "Alle Lernangebote mit deinem Stand", bild: "lupe", zeichen: "✓", ziel: { ansicht: "entdecken" } },
];

/* Formelsammlung → Bereiche (Untermenü wie bei Analysis) */
export const FORMEL_MENUE = [
  { name: "Analysis", zeile: "Ableiten, Integrieren, Kurvendiskussion", bild: "kurve", zeichen: "f′", ziel: { ansicht: "formeln", bereich: "analysis" } },
  { name: "Funktionen", zeile: "Geraden, Parabeln, Wachstum, Sinus", bild: "parabel", zeichen: "f(x)", ziel: { ansicht: "formeln", bereich: "funktionen" } },
  { name: "Vektoren", zeile: "Skalarprodukt, Ebenen, Abstände", bild: "kreuz", zeichen: "×", ziel: { ansicht: "formeln", bereich: "vektoren" } },
  { name: "Stochastik", zeile: "Bayes, Binomialverteilung, Tests", bild: "balken", zeichen: "P(A)", ziel: { ansicht: "formeln", bereich: "stochastik" } },
  { name: "Geometrie und Trigonometrie", zeile: "Pythagoras, Kreis, Körper, Einheitskreis", bild: "trig", zeichen: "sin", ziel: { ansicht: "formeln", bereich: "geometrie" } },
  { name: "Terme und Gleichungen", zeile: "Binomische Formeln, pq-Formel, Logarithmen", bild: "terme", zeichen: "pq", ziel: { ansicht: "formeln", bereich: "terme" } },
  { name: "Kopfrechnen", zeile: "Rechentricks, Teilbarkeit, Brüche", bild: "kopf", zeichen: "7·8", ziel: { ansicht: "formeln", bereich: "kopfrechnen" } },
  { name: "Mengenlehre und Logik", zeile: "Mengen, Junktoren, Beweisverfahren", bild: "menge", zeichen: "A∩B", ziel: { ansicht: "formeln", bereich: "logik" } },
];
