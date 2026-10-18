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
  ableitungstrainer: { de: "Ableitungen trainieren", en: "practise derivatives" },
  kurvendiskussion: { de: "Kurvendiskussionen durchrechnen – mit Graph und PDF", en: "work through curve sketching – with graph and PDF" },
  scharen: { de: "Funktionsscharen erkunden", en: "explore families of functions" },
  steckbrief: { de: "Steckbriefaufgaben lösen", en: "solve “find the function” problems" },
  optimierung: { de: "Extremwertaufgaben lösen", en: "solve optimisation problems" },
  stammintegral: { de: "Stammfunktionen und Integrale üben", en: "practise antiderivatives and integrals" },
  integrale: { de: "Integrale und Flächen berechnen", en: "calculate integrals and areas" },
  vektorgenerator: { de: "mit Vektoren rechnen", en: "calculate with vectors" },
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
  bruchterme: { de: "Bruchterme und Bruchgleichungen lösen", en: "work with fraction terms and equations" },
  strahlensaetze: { de: "Strahlensätze anwenden", en: "apply the intercept theorems" },
  trigonometrie: { de: "Trigonometrie vom Einheitskreis bis zum Kosinussatz verstehen", en: "understand trigonometry from the unit circle to the law of cosines" },
  terme: { de: "Terme vereinfachen und umformen", en: "simplify and rearrange terms" },
  gleichungen: { de: "Gleichungen lösen und verstehen", en: "solve and understand equations" },
  lgs: { de: "Gleichungssysteme lösen", en: "solve systems of equations" },
};

/* Trainings- und Lernseiten, die kein Eintrag in werkzeuge.js sind (Schlüssel = Ansicht) */
export const SEITEN_SAETZE = {
  warmup: { de: "fünf Minuten Mathe am Tag trainieren", en: "train maths for five minutes a day" },
  headnumbers: { de: "Kopfrechnen trainieren", en: "train mental arithmetic" },
  kopf: { de: "Kopfrechnen trainieren", en: "train mental arithmetic" },
  meintraining: { de: "jeden Tag gezielt Mathe trainieren", en: "train maths a little every day" },
  fehlertraining: { de: "aus den eigenen Fehlern lernen", en: "learn from your own mistakes" },
  ebbinghaus: { de: "Mathe so wiederholen, dass es hängen bleibt", en: "review maths so that it sticks" },
  abiketten: { de: "Abi-Aufgaben Schritt für Schritt üben", en: "practise Abitur problems step by step" },
  abisaetze: { de: "komplette Abi-Sätze üben", en: "practise complete Abitur papers" },
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
  diffq: { de: "den Differenzenquotienten verstehen", en: "understand the difference quotient" },
  potenzregel: { de: "die Potenzregel verstehen und beweisen", en: "understand and prove the power rule" },
};

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
