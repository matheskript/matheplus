/* ============================================================
   TEILEN – „Dieses Tool teilen“ (Link kopieren / WhatsApp)
   Reine Daten und Textbausteine, keine React-Importe (Node-testbar).

   Die Nachricht lautet:
     Hey, schau dir mal dieses Tool auf mythosmathe.de an. Hier kannst du super <Satz>:
     <Link>

     (aktuell Passwort: mathe)
   Der <Satz> steht je Werkzeug in TOOL_SAETZE (de/en), für Trainings- und
   Lernseiten ohne Werkzeug-Eintrag in SEITEN_SAETZE.

   Neues Werkzeug in werkzeuge.js → hier einen Eintrag in TOOL_SAETZE ergänzen
   (der Test tests/teilen.test.mjs schlägt sonst an).
   ============================================================ */
import { wo } from "./werkzeuge.js";

/* Was man mit dem Werkzeug kann – Fortsetzung von „hier kannst du super …“ */
export const TOOL_SAETZE = {
  geradengleichung: { de: "Geradengleichungen aufstellen und üben", en: "set up and practise equations of lines" },
  parabeln: { de: "Parabeln verstehen und rechnen", en: "understand and work with parabolas" },
  sinus: { de: "Sinusfunktionen einstellen und verstehen", en: "tune and understand sine functions" },
  wachstum: { de: "Wachstum und Logarithmen rechnen", en: "work with growth and logarithms" },
  diffq: { de: "den Differenzenquotienten Zeile für Zeile aufbauen", en: "build the difference quotient line by line" },
  ableitungstrainer: { de: "Ableitungen trainieren", en: "practise derivatives" },
  kurvendiskussion: { de: "Kurvendiskussionen durchrechnen – mit Graph und PDF", en: "work through curve sketching – with graph and PDF" },
  scharen: { de: "Funktionsscharen erkunden", en: "explore families of functions" },
  steckbrief: { de: "Steckbriefaufgaben lösen", en: "solve “find the function” problems" },
  optimierung: { de: "Extremwertaufgaben lösen", en: "solve optimisation problems" },
  integrale: { de: "Integrale und Flächen berechnen", en: "calculate integrals and areas" },
  vektorgenerator: { de: "mit Vektoren rechnen", en: "calculate with vectors" },
  hesse: { de: "die Hesse-Normalenform verstehen", en: "understand the Hesse normal form" },
  kreuzprodukt: { de: "das Kreuzprodukt rechnen", en: "calculate the cross product" },
  winkel: { de: "Winkel zwischen Vektoren berechnen", en: "calculate angles between vectors" },
  zweipunkte: { de: "Geraden aus zwei Punkten aufstellen", en: "set up a line from two points" },
  dreipunkte: { de: "Ebenen aus drei Punkten aufstellen", en: "set up a plane from three points" },
  ebenen: { de: "Ebenen im Raum anschauen und drehen", en: "view and rotate planes in space" },
  geraden: { de: "die Lage von Geraden im Raum bestimmen", en: "determine the position of lines in space" },
  ebenevsebene: { de: "Schnittgeraden und Schnittwinkel von Ebenen berechnen", en: "calculate the intersection and angle of two planes" },
  abstaende: { de: "Abstände im Raum berechnen", en: "calculate distances in space" },
  kombinatorik: { de: "Kombinatorik und Urnenaufgaben üben", en: "practise combinatorics and urn problems" },
  vierfelder: { de: "mit der Vier-Felder-Tafel rechnen", en: "work with the four-field table" },
  erwartungswert: { de: "Erwartungswert und faire Spiele verstehen", en: "understand expected value and fair games" },
  bernoulli: { de: "die Binomialverteilung ausprobieren", en: "play with the binomial distribution" },
  hypothesentest: { de: "Hypothesentests üben", en: "practise hypothesis tests" },
  normalverteilung: { de: "die Normalverteilung verstehen", en: "understand the normal distribution" },
  prozent: { de: "Prozent- und Zinsrechnung üben", en: "practise percentages and interest" },
  zuordnungen: { de: "Zuordnungen und den Dreisatz üben", en: "practise proportions and the rule of three" },
  flaechen: { de: "Umfang und Flächeninhalt berechnen", en: "calculate perimeter and area" },
  groessen: { de: "Größen sicher umrechnen", en: "convert units confidently" },
  dezimal: { de: "mit Dezimalzahlen rechnen", en: "calculate with decimals" },
  quader: { de: "Quader, Würfel und Würfelnetze verstehen", en: "understand cuboids, cubes and cube nets" },
  ganzezahlen: { de: "mit negativen Zahlen rechnen", en: "calculate with negative numbers" },
  diagramme: { de: "Daten und Diagramme auswerten", en: "analyse data and charts" },
  primzahlen: { de: "Primzahlen, ggT und kgV finden", en: "find primes, gcd and lcm" },
  rechengesetze: { de: "Rechengesetze geschickt nutzen", en: "use the laws of arithmetic cleverly" },
  textaufgaben: { de: "Textaufgaben in Bedingungen übersetzen", en: "translate word problems into conditions" },
  axiome: { de: "die Axiome und Rechenregeln verstehen", en: "understand the axioms and rules of arithmetic" },
  zahlenraeume: { de: "die Zahlenräume von ℕ bis ℝ verstehen", en: "understand the number spaces from ℕ to ℝ" },
  mengenlogik: { de: "Mengen und Logik verstehen", en: "understand sets and logic" },
  ungleichungen: { de: "Ungleichungen und Beträge lösen", en: "solve inequalities and absolute values" },
  funktionen: { de: "Funktionen von Grund auf verstehen", en: "understand functions from the ground up" },
  koordinaten: { de: "Koordinaten und Symmetrie üben", en: "practise coordinates and symmetry" },
  zufall: { de: "Wahrscheinlichkeiten berechnen", en: "calculate probabilities" },
  stellenwert: { de: "große Zahlen lesen und runden", en: "read and round large numbers" },
  kongruenz: { de: "Kongruenzsätze verstehen", en: "understand the congruence theorems" },
  winkelsaetze: { de: "Winkel an Parallelen und Winkelsummen berechnen", en: "calculate angles at parallels and angle sums" },
  konstruktion: { de: "besondere Linien im Dreieck verstehen", en: "understand special lines in triangles" },
  kathetensatz: { de: "mit Kathetensatz und Höhensatz rechnen", en: "calculate with the leg and altitude theorems" },
  kreis: { de: "Kreise und Kreisteile berechnen", en: "calculate circles and their parts" },
  koerper: { de: "Volumen und Oberfläche von Körpern berechnen", en: "calculate volume and surface of solids" },
  thales: { de: "den Satz des Thales anwenden", en: "apply Thales' theorem" },
  pythagoras: { de: "mit dem Satz des Pythagoras rechnen", en: "calculate with Pythagoras' theorem" },
  bruchrechnen: { de: "mit Brüchen rechnen", en: "calculate with fractions" },
  bruchwurzel: { de: "mit Brüchen und Wurzeln rechnen", en: "work with fractions and roots" },
  bruchterme: { de: "Bruchterme und Bruchgleichungen lösen", en: "work with fraction terms and equations" },
  strahlensaetze: { de: "Strahlensätze anwenden", en: "apply the intercept theorems" },
  trigonometrie: { de: "Trigonometrie vom Einheitskreis bis zum Kosinussatz verstehen", en: "understand trigonometry from the unit circle to the law of cosines" },
  terme: { de: "Terme vereinfachen und umformen", en: "simplify and rearrange terms" },
  gleichungen: { de: "Gleichungen lösen und verstehen", en: "solve and understand equations" },
  lgs: { de: "Gleichungssysteme lösen", en: "solve systems of equations" },
};

/* Trainings- und Lernseiten, die kein Eintrag in werkzeuge.js sind (Schlüssel = Ansicht) */
export const SEITEN_SAETZE = {
  kursliste: { de: "alle Mathe-Kurse von Pen & Paper bis zur Abi-Masterclass", en: "all maths courses from Pen & Paper to the Abi masterclass" },
  unterstufe: { de: "den ganzen Stoff von Klasse 5 und 6 lernen und üben", en: "learn and practise everything from grades 5 and 6" },
  warmup: { de: "fünf Minuten Mathe am Tag trainieren", en: "train maths for five minutes a day" },
  headnumbers: { de: "Kopfrechnen trainieren", en: "train mental arithmetic" },
  kopf: { de: "Kopfrechnen trainieren", en: "train mental arithmetic" },
  meintraining: { de: "jeden Tag gezielt Mathe trainieren", en: "train maths a little every day" },
  trainingszentrum: { de: "alle Mathe-Trainings an einem Ort – jedes im Vollbild", en: "all maths trainings in one place – each in full screen" },
  fehlertraining: { de: "aus den eigenen Fehlern lernen", en: "learn from your own mistakes" },
  ebbinghaus: { de: "Mathe so wiederholen, dass es hängen bleibt", en: "review maths so that it sticks" },
  abiketten: { de: "Abi-Aufgaben Schritt für Schritt üben", en: "practise Abitur problems step by step" },
  abisaetze: { de: "komplette Abi-Sätze üben", en: "practise complete Abitur papers" },
  abi: { de: "dich in der Mathe-Abi-Masterclass gezielt aufs Abi vorbereiten – mit Plan, Abi-Aufgaben und Mia als Trainerin", en: "prepare for the maths Abitur in the Mathe-Abi-Masterclass – with a plan, exam problems and Mia as your coach" },
  abiaufgaben: { de: "Abi-Aufgaben im Prüfungsformat trainieren", en: "practise Abitur problems in exam format" },
  abiteila: { de: "eine komplette Teil-A-Probe fürs Mathe-Abi schreiben", en: "sit a full Part A mock for the maths Abitur" },
  mia: { de: "dich von Mia, der Abi-Trainerin, korrigieren und prüfen lassen", en: "get corrected and examined by Mia, the Abitur coach" },
  lernpartner: { de: "Lernpartner fürs Abi in deiner Stadt finden", en: "find Abitur study partners in your town" },
  abitur: { de: "das Probeabitur mit Uhr üben", en: "practise a mock Abitur against the clock" },
  pruefung: { de: "Prüfungsaufgaben ohne Hilfen üben", en: "practise exam problems without hints" },
  begruenden: { de: "Begründen und Beweisen üben", en: "practise justifying and proving" },
  modellieren: { de: "Sachaufgaben in vier Schritten lösen", en: "solve word problems in four steps" },
  entdecken: { de: "Mathe selbst entdecken statt auswendig lernen", en: "discover maths yourself instead of memorising" },
  formeln: { de: "Formeln nachschlagen und verstehen", en: "look up and understand formulas" },
  training: { de: "Mathe-Aufgaben mit Rückmeldung üben", en: "practise maths problems with feedback" },
  ki: { de: "Aufgaben automatisch erzeugen lassen", en: "generate practice problems automatically" },
  lernpfad: { de: "mit einem persönlichen Lernplan lernen", en: "learn with a personal study plan" },
  vorbereiten: { de: "sich auf die nächste Klausur vorbereiten", en: "prepare for the next exam" },
  analyse: { de: "Rechenwege per Foto prüfen lassen", en: "get your working checked from a photo" },
  potenzregel: { de: "die Potenzregel verstehen und beweisen", en: "understand and prove the power rule" },
  efunktion: { de: "die natürliche Exponentialfunktion verstehen", en: "understand the natural exponential function" },

  /* Kurse und Lernbereiche */
  kiwahl: { de: "mit KI Mathe verstehen – je nach Alter mit Mathilda AI, Gemini oder Claude", en: "use AI to understand maths – Mathilda AI, Gemini or Claude depending on your age" },
  claudekurs: { de: "mit Claude Mathe verstehen, statt sich Lösungen geben zu lassen (ab 18)", en: "use Claude to understand maths instead of copying solutions (18+)" },
  geminikurs: { de: "mit Gemini Mathe verstehen, statt sich Lösungen geben zu lassen (ab 16)", en: "use Gemini to understand maths instead of copying solutions (16+)" },
  diffkurs: { de: "die Differentialrechnung Schritt für Schritt lernen", en: "learn differential calculus step by step" },
  vekkurs: { de: "Vektoren, Geraden und Ebenen von Grund auf lernen", en: "learn vectors, lines and planes from the ground up" },
  geokurs: { de: "Dreiecksgeometrie vom Rechteck bis zur Trigonometrie lernen", en: "learn triangle geometry from the rectangle to trigonometry" },
  schulbuch: { de: "das Buch Ableitungen mit Lösungen und Erklärungen durcharbeiten", en: "work through the derivatives book with solutions and explanations" },
  gleichkurs: { de: "Gleichungen verstehen, rechnen und trainieren", en: "understand, solve and train equations" },
  gfs: { de: "eine GFS mit Mathe-Themen vorbereiten", en: "prepare a school presentation on maths topics" },
  "gfs-pascal": { de: "das Pascalsche Dreieck für eine GFS entdecken", en: "discover Pascal's triangle for a school presentation" },
  "gfs-ziegen": { de: "das Ziegenproblem verstehen und für eine GFS aufbereiten", en: "understand the Monty Hall problem and turn it into a school presentation" },
  "gfs-bayes": { de: "den Satz von Bayes verstehen und für eine GFS aufbereiten", en: "understand Bayes’ theorem and turn it into a school presentation" },
  "gfs-platonisch": { de: "herausfinden, warum es genau fünf platonische Körper gibt, und daraus eine GFS machen", en: "find out why there are exactly five Platonic solids and turn it into a school presentation" },
  "gfs-mischungen": { de: "Mischungsaufgaben und das Mischungskreuz verstehen und daraus eine GFS machen", en: "understand mixture problems and the alligation method and turn them into a school presentation" },
  "gfs-dose": { de: "die optimale Dose berechnen und für eine GFS aufbereiten", en: "calculate the optimal can and turn it into a school presentation" },
  "gfs-tangenten": { de: "Tangentenprobleme verstehen und für eine GFS aufbereiten", en: "understand tangent problems and turn them into a school presentation" },
  kurse: { de: "Mathe mit Videokursen lernen", en: "learn maths with video courses" },
  penpaperkurs: { de: "Mathe mit Stift und Papier üben", en: "practise maths with pen and paper" },
  elternkurs: { de: "mit dem richtigen Mindset an Mathe herangehen", en: "approach maths with the right mindset" },
  nachhilfekurs: { de: "Nachhilfe sinnvoll nutzen und Mathe gezielt aufholen", en: "make the most of tutoring and catch up on maths" },
  operatoren: { de: "Operatoren wie „berechne“, „zeige“ und „begründe“ verstehen", en: "understand command words like “calculate”, “show” and “justify”" },
  kapitelformeln: { de: "die Formeln zum Kapitel für die Klausur durchgehen", en: "go through the chapter formulas for the exam" },
  kapitel: { de: "ein Schulbuchkapitel auf einen Blick sehen und gleich trainieren", en: "see a textbook chapter at a glance and practise it right away" },
  trainieren: { de: "ein einzelnes Kapitel gezielt trainieren", en: "train a single chapter in a targeted way" },
  trainingsplan: { de: "sich einen Trainingsplan zusammenstellen", en: "put together a training plan" },
  klausurnach: { de: "eine Klausur gründlich nachbereiten", en: "review an exam thoroughly" },
  klausurbriefkasten: { de: "eine Klausur zur Auswertung einwerfen", en: "drop in an exam for evaluation" },
  mathecheck: { de: "den eigenen Mathe-Stand checken", en: "check where you stand in maths" },
  challenge: { de: "sich mit der Mathe-Challenge herausfordern", en: "challenge yourself with the maths challenge" },
  bwm: { de: "sich auf Mathe-Wettbewerbe vorbereiten", en: "prepare for maths competitions" },
  landeswettbewerbe: { de: "Mathe-Landeswettbewerbe entdecken und üben", en: "discover and practise state maths competitions" },
  landeswettbewerb: { de: "Aufgaben aus Mathe-Landeswettbewerben üben", en: "practise problems from state maths competitions" },
  karte: { de: "mit der Lernlandkarte den Überblick behalten", en: "keep track of everything with the learning map" },
  analysis: { de: "Analysis von den Grundlagen bis zum Abi lernen", en: "learn calculus from the basics to the Abitur" },
  vektoren: { de: "Vektorgeometrie lernen und üben", en: "learn and practise vector geometry" },
  stochastik: { de: "Stochastik lernen und üben", en: "learn and practise probability and statistics" },
};

/* Seiten, die bewusst KEINEN Teilen-Knopf haben: Startseite, Verkauf, Konto, Rechtliches,
   persönliche Auswertungen, Lehrkräfte-Bereich, Mitgliederbereich und Entwürfe.
   Jede Ansicht mit Direct Link steht entweder hier oder oben (Werkzeug / SEITEN_SAETZE) –
   der Test tests/teilen.test.mjs schlägt sonst an, damit kein neuer Kurs ohne Knopf live geht. */
export const KEIN_TEILEN = [
  "start", "landingpage", "spenden", "elternabend", "masterclass", "mckurs", "mczugang",
  "lehrkraefte", "lehrerblatt", "plan", "wiederholen", "profil", "profil2", "einstufung",
  "bericht", "messung", "auswertung", "konto", "impressum", "datenschutz", "einwilligung", "agb", "widerruf",
  "entwurf-start", "entwurf-checken", "entwurf-pakete", "entwurf-werkzeuge", "entwurf-vorher", "entwurf-biro",
  "dokumente", "blog", "vision", "feedback",
  "kanal",   // Kanal-Landingpages (/poster …): Werbeseiten, eigene Eltern-Weiche statt Teilen-Knopf
];

/* Infos zur Ansicht oder null, wenn die Seite kein Tool/Training ist (Startseite, Konto, Recht …) */
export function teilenInfo(ansicht) {
  const w = wo(ansicht);
  if (w && w.werkzeug) {
    const s = TOOL_SAETZE[w.werkzeug.id];
    return s ? { id: w.werkzeug.id, name: w.werkzeug.name, ...s } : null;
  }
  const s = SEITEN_SAETZE[ansicht];
  return s ? { id: ansicht, name: ansicht, ...s } : null;
}

/* Passwort der Seite (SEITEN_PASSWORT in Vercel, Standard „mathe“): steht nur in der WhatsApp-Nachricht, nicht im kopierten Link.
   Wenn das Passwort geändert oder die Seite freigegeben wird (SEITEN_SCHUTZ=aus): hier anpassen bzw. auf "" setzen. */
export const TEILEN_PASSWORT = "mathe";

/* Die Nachricht, die per WhatsApp rausgeht (sprache: "de" | "en"):
     Hey, schau dir mal dieses Tool auf mythosmathe.de an. Hier kannst du super <Satz>:
     <Link>

     (aktuell Passwort: mathe) */
export function teilenText(info, link, sprache = "de") {
  if (!info) return link;
  const en = sprache === "en";
  const kopf = en
    ? `Hey, check out this tool on mythosmathe.de. Here you can easily ${info.en}:`
    : `Hey, schau dir mal dieses Tool auf mythosmathe.de an. Hier kannst du super ${info.de}:`;
  const pw = TEILEN_PASSWORT ? `\n\n${en ? "(current password" : "(aktuell Passwort"}: ${TEILEN_PASSWORT})` : "";
  return `${kopf}\n${link}${pw}`;
}

export const whatsappUrl = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;
