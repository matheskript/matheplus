import React, { useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Knopf } from "./func1.jsx";
import { MathildaName } from "./mathildaName.jsx";
import { englisch } from "./i18n.js";

/* ======================================================================
   PEN-&-PAPER-KURS
   Seite „penpaperkurs“: das Kurskonzept „Pen & Paper – MythosMathe“ für
   Mittelstufe (Kurs A) und Oberstufe / Abitur (Kurs B), je 9 Einheiten
   über 8 Wochen.

   Aufbau der Seite
     1. Grundidee und Überblick, Kurswahl
     2. Vier Werkzeuge (antippbar) + Termhaus-Labor zum Ausprobieren
     3. Vier Lernstufen als Treppe: READ · WRITE · CREATE · DELIVER
     4. Kurs A / Kurs B: neun Einheiten mit Beispiel
     5. Aufbau jeder Einheit (7 Schritte)
     6. Erfolg messen: Selbstcheck für Arbeitsweise und Mathematik
     7. Rolle von Mathilda
     8. Leitprinzip

   Alle Texte sind zweisprachig (L = Deutsch | Englisch). Die Rechenbeispiele
   sind eigene Beispiele zum Konzept und lassen sich unten in EINHEITEN_A / _B
   leicht austauschen.
   ====================================================================== */

const L = (de, en) => (englisch() ? en : de);

const NAVY = "#0B1E4A";
const GOLD = C.flaggold;
const SILBER = "#8E97A6";
const GOLDFLAECHE = "linear-gradient(150deg, #FFE9A0 0%, #F4CE4A 28%, #EDBB00 55%, #D9A520 78%, #B58612 100%)";
const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };

const Kicker = ({ children }) => <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>{children}</p>;
const H2 = ({ children }) => <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12 }}>{children}</h2>;
const Absatz = ({ children, style }) => <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 16, ...style }}>{children}</p>;
const Trenner = () => <div style={{ height: 1, background: C.linie, margin: "34px 0 28px" }} />;

/* ---------------------------------------------------------------- Inhalte */

function baue() {
  const werkzeuge = [
    { id: "klar", name: L("Klarschrift", "Clear writing"), kurz: L("Eindeutig statt schön", "Unambiguous, not pretty"),
      text: L("Zahlen, Buchstaben, Variablen und Symbole werden eindeutig und gut lesbar geschrieben. Exponenten stehen unmittelbar rechts oben an ihrer Basis. Ziel ist nicht Schönheit, sondern Eindeutigkeit.",
        "Numbers, letters, variables and symbols are written clearly and legibly. Exponents sit directly at the top right of their base. The goal is not beauty but unambiguity.") },
    { id: "haus", name: L("Termhäuser", "Term houses"), kurz: L("Jeder Summand ein Haus", "Every summand is a house"),
      text: L("Jeder Summand wird als eigene strukturelle Einheit behandelt. In 3x² − 2x + 5 sind 3x², 2x und 5 drei getrennte Termhäuser.",
        "Every summand is treated as a structural unit of its own. In 3x² − 2x + 5, the terms 3x², 2x and 5 are three separate term houses.") },
    { id: "op", name: "Final Operators", kurz: L("Die Zeichen zwischen den Häusern", "The signs between the houses"),
      text: L("Die Plus- und Minuszeichen zwischen den Summanden werden bewusst als Verbindungselemente behandelt. Nicht jedes Plus oder Minus innerhalb einer Klammer oder eines Zählers erfüllt dieselbe Funktion.",
        "The plus and minus signs between the summands are treated deliberately as connecting elements. Not every plus or minus inside a bracket or a numerator has the same function.") },
    { id: "abstand", name: L("Klarheitsabstand", "Clarity spacing"), kurz: L("Abstand zeigt Struktur", "Space shows structure"),
      text: L("Bewusst gesetzte Abstände machen sichtbar, wo ein Termhaus endet und der nächste beginnt. Bei mehrzeiligen Rechnungen können Rechenzeichen und Gleichheitszeichen sinnvoll untereinander ausgerichtet werden.",
        "Deliberately placed gaps show where one term house ends and the next begins. In multi-line calculations, operators and equals signs can be lined up neatly one below the other.") },
  ];

  const stufen = [
    { k: "READ", name: L("Lesen", "Read"), text: L("Musterlösungen untersuchen und verstehen, warum jeder Rechenschritt funktioniert.", "Examine worked solutions and understand why every step works.") },
    { k: "WRITE", name: L("Schreiben", "Write"), text: L("Vorgegebene Muster auf vergleichbare Aufgaben übertragen und die Hilfestellungen schrittweise reduzieren.", "Transfer given patterns to similar tasks and reduce the support step by step.") },
    { k: "CREATE", name: L("Entwickeln", "Create"), text: L("Eigene Lösungswege auf blankem Papier aufbauen und mathematische Zusammenhänge selbstständig darstellen.", "Build your own solution paths on blank paper and present mathematical connections independently.") },
    { k: "DELIVER", name: L("Vermitteln", "Deliver"), text: L("Den eigenen Denkweg erklären und prüfen, ob ein anderer Mensch ihn nachvollziehen kann.", "Explain your own line of thought and check whether another person can follow it.") },
  ];

  const aufbau = [
    { t: L("Ziel setzen", "Set the goal"), s: L("Welche mathematische Fähigkeit und welches Pen-&-Paper-Werkzeug werden trainiert?", "Which mathematical skill and which Pen & Paper tool are being trained?") },
    { t: "READ", s: L("Eine gute Musterlösung lesen und ihre Struktur untersuchen.", "Read a good worked solution and examine its structure."), stufe: 0 },
    { t: "WRITE", s: L("Eine vergleichbare Aufgabe mit Hilfestellung bearbeiten.", "Work on a similar task with support."), stufe: 1 },
    { t: "CREATE", s: L("Eine neue Aufgabe möglichst selbstständig lösen.", "Solve a new task as independently as possible."), stufe: 2 },
    { t: "DELIVER", s: L("Den Denkweg einem Partner oder dem Coach erklären.", "Explain your line of thought to a partner or the coach."), stufe: 3 },
    { t: L("Selbstkontrolle", "Self-check"), s: L("Mathematische Richtigkeit und Darstellungsqualität prüfen.", "Check mathematical correctness and quality of presentation.") },
    { t: "Transfer", s: L("Eine leicht veränderte Aufgabe ohne unmittelbare Anleitung lösen.", "Solve a slightly changed task without direct guidance.") },
  ];

  /* Rechenbeispiele: Zeilen { l, o, r, k } = links | Zeichen | rechts | Kommentar,
     { t } = freie Formelzeile, { tx } = Hinweistext. Formelsyntax wie überall in der App. */
  const einheitenA = [
    { w: 1, titel: L("Neustart: Das Blatt wird zum Denkraum", "A fresh start: the page becomes your thinking space"),
      text: L("Du steigst über einfache Wertetabellen ein und lernst, deinen Platz auf dem Papier selbst einzuteilen. Außerdem übst du, strukturierte von unstrukturierten Lösungen zu unterscheiden.",
        "You start with simple tables of values and learn to divide up the space on your page yourself. You also practise telling structured solutions from unstructured ones."),
      fokus: [L("Blatt einteilen", "Dividing the page"), L("Struktur erkennen", "Spotting structure")],
      bsp: { zeilen: [{ t: "f(x) = 2x + 1" }], extra: { typ: "wertetabelle" } } },
    { w: 1, titel: L("Die Geradengleichung als Termhaus", "The straight-line equation as a term house"),
      text: L("Du arbeitest mit y = mx + b und untersuchst Steigung und y-Achsenabschnitt. Termhäuser, Final Operators und Klarheitsabstände werden eingeführt.",
        "You work with y = mx + b and examine slope and y-intercept. Term houses, final operators and clarity spacing are introduced."),
      fokus: [L("Termhäuser", "Term houses"), "Final Operators", L("Klarheitsabstand", "Clarity spacing")],
      bsp: { extra: { typ: "haeuser", prefix: "y =", term: "2x + 1" },
        zeilen: [{ t: "\\text{Steigung}\\quad m = 2" }, { t: "\\text{y-Achsenabschnitt}\\quad b = 1" }].map((z) => englisch()
          ? { t: z.t.replace("Steigung", "Slope").replace("y-Achsenabschnitt", "y-intercept") } : z) } },
    { w: 2, titel: L("Umformen, Einsetzen und Kontrollieren", "Rearranging, substituting and checking"),
      text: L("Du berechnest Funktionswerte, bestimmst Geraden aus gegebenen Punkten und prüfst Ergebnisse durch Einsetzen. Pro Zeile steht eine Umformung, die Gleichheitszeichen bilden eine nachvollziehbare Kette.",
        "You calculate function values, find lines through given points and check results by substituting. One rearrangement per line, and the equals signs form a traceable chain."),
      fokus: [L("Eine Umformung pro Zeile", "One step per line"), L("Selbstkontrolle", "Self-check")],
      bsp: { zeilen: [
        { tx: L("Gerade durch P(1 | 3) und Q(3 | 7)", "Line through P(1 | 3) and Q(3 | 7)") },
        { l: "m", r: "\\frac{7 − 3}{3 − 1}" }, { r: "\\frac{4}{2}" }, { r: "2" },
        { l: "b", r: "3 − 2 \\cdot 1" }, { r: "1" },
        { t: "y = 2x + 1" },
        { l: "f(3)", r: "2 \\cdot 3 + 1", k: L("Probe", "Check") }, { r: "7 \\quad ✓" },
      ] } },
    { w: 3, titel: L("Parabeln: Potenzen und Termstruktur", "Parabolas: powers and term structure"),
      text: L("Du arbeitest mit f(x) = ax² + bx + c. Exponenten schreibst du eindeutig, Summanden trennst du als Termhäuser und Vorzeichen kontrollierst du.",
        "You work with f(x) = ax² + bx + c. You write exponents unambiguously, separate summands as term houses and check the signs."),
      fokus: [L("Klarschrift", "Clear writing"), L("Termhäuser", "Term houses"), L("Vorzeichen prüfen", "Checking signs")],
      bsp: { extra: { typ: "haeuser", prefix: "f(x) =", term: "x^2 − 4x + 3" }, zeilen: [{ t: "a = 1, \\quad b = −4, \\quad c = 3" }] } },
    { w: 4, titel: L("Scheitelpunkt und besondere Punkte", "Vertex and special points"),
      text: L("Scheitelpunkt, Symmetrieachse, Nullstellen und y-Achsenabschnitt – passend zu deinem Vorwissen. Deine Rechenergebnisse gleichst du mit dem Graphen ab.",
        "Vertex, axis of symmetry, zeros and y-intercept – matched to your prior knowledge. You compare your results with the graph."),
      fokus: [L("Abgleich mit dem Graphen", "Comparing with the graph"), L("Selbstkontrolle", "Self-check")],
      bsp: { zeilen: [
        { l: "f(x)", r: "x^2 − 4x + 3" }, { r: "(x − 2)^2 − 1" },
        { t: "S(2\\,|\\,−1)" },
        { t: "x_1 = 1, \\quad x_2 = 3" },
        { l: "f(0)", r: "3", k: L("y-Achsenabschnitt", "y-intercept") },
      ] } },
    { w: 5, titel: L("Von der Steigung zur Ableitung", "From slope to derivative"),
      text: L("Mittlere Steigung, Sekante, Tangente und Differenzenquotient. Brüche, Zähler und Nenner strukturierst du klar; geometrische und algebraische Darstellung werden verbunden.",
        "Average slope, secant, tangent and difference quotient. You structure fractions, numerators and denominators clearly; the geometric and algebraic views are connected."),
      fokus: [L("Zähler und Nenner", "Numerator and denominator"), L("Klarheitsabstand", "Clarity spacing")],
      bsp: { zeilen: [
        { tx: "f(x) = x²" },
        { l: "\\frac{f(x+h) − f(x)}{h}", r: "\\frac{(x+h)^2 − x^2}{h}" },
        { r: "\\frac{2xh + h^2}{h}" }, { r: "2x + h" },
        { l: "h \\to 0", o: "⇒", r: "f′(x) = 2x" },
      ] } },
    { w: 6, titel: L("Ableiten und Final Operators", "Differentiating and final operators"),
      text: L("Einfache Potenz- und Summenregeln. Jeder Summand wird einzeln bearbeitet und kontrolliert.",
        "Simple power and sum rules. Every summand is handled and checked separately."),
      fokus: [L("Termhäuser", "Term houses"), "Final Operators"],
      bsp: { extra: { typ: "haeuser", prefix: "f(x) =", term: "3x^2 − 2x + 5" },
        zeilen: [{ t: "(3x^2)′ = 6x, \\quad (2x)′ = 2, \\quad (5)′ = 0" }, { l: "f′(x)", r: "6x − 2" }] } },
    { w: 7, titel: L("Die Ableitung mit dem Graphen verbinden", "Connecting the derivative with the graph"),
      text: L("Du verknüpfst Funktion, Steigung und Ableitung und untersuchst, was eine Nullstelle der Ableitung über die Tangente aussagt.",
        "You link function, slope and derivative and examine what a zero of the derivative says about the tangent."),
      fokus: [L("Graph und Ableitung verbinden", "Linking graph and derivative")],
      bsp: { zeilen: [
        { l: "f(x)", r: "x^2 − 4x + 3" }, { l: "f′(x)", r: "2x − 4" },
        { l: "f′(x) = 0", o: "⇒", r: "x = 2" },
        { tx: L("Waagerechte Tangente genau im Scheitelpunkt S(2 | −1).", "Horizontal tangent exactly at the vertex S(2 | −1).") },
      ] } },
    { w: 8, titel: L("Abschluss: Eine Funktion selbstständig untersuchen", "Finale: investigate a function on your own"),
      text: L("Du untersuchst selbstständig eine einfache quadratische Funktion mit Graph, Scheitelpunkt, gegebenenfalls Nullstellen und Ableitung. Danach prüfst du deine Lösung und erklärst deinen Denkweg.",
        "You independently investigate a simple quadratic function with graph, vertex, zeros if applicable and derivative. Then you check your solution and explain your line of thought."),
      fokus: [L("Selbstkontrolle", "Self-check"), "DELIVER"],
      bsp: { titel: L("Deine Aufgabe", "Your task"), zeilen: [
        { t: "f(x) = x^2 − 6x + 5" },
        { tx: L("Graph · Scheitelpunkt · Nullstellen · Ableitung – dann deinen Denkweg erklären.", "Graph · vertex · zeros · derivative – then explain your line of thought.") },
      ] } },
  ];

  const einheitenB = [
    { w: 1, titel: L("Ableitungen: Die Rechenroutine aufbauen", "Derivatives: building the routine"),
      text: L("Du trainierst Potenz- und Summenregel an Polynomen. Die Summanden leitest du einzeln ab; Exponenten und Vorzeichen kontrollierst du.",
        "You train the power and sum rules on polynomials. You differentiate the summands one by one and check exponents and signs."),
      fokus: [L("Termhäuser", "Term houses"), L("Klarschrift", "Clear writing")],
      bsp: { extra: { typ: "haeuser", prefix: "g(x) =", term: "2x^3 − 5x^2 + 4x − 1" }, zeilen: [{ l: "g′(x)", r: "6x^2 − 10x + 4" }] } },
    { w: 1, titel: L("Höhere Ableitungen und Selbstkontrolle", "Higher derivatives and self-checking"),
      text: L("f′, f″ und f‴ stellst du systematisch dar. Die Ableitungskette ordnest du übersichtlich an und prüfst sie auf Vorzeichen- und Potenzfehler.",
        "You present f′, f″ and f‴ systematically. You arrange the chain of derivatives clearly and check it for sign and power errors."),
      fokus: [L("Klarheitsabstand", "Clarity spacing"), L("Selbstkontrolle", "Self-check")],
      bsp: { zeilen: [
        { l: "f(x)", r: "x^3 − 3x^2" }, { l: "f′(x)", r: "3x^2 − 6x" }, { l: "f″(x)", r: "6x − 6" }, { l: "f‴(x)", r: "6" },
      ] } },
    { w: 2, titel: L("Definitionsbereich, Symmetrie und Nullstellen", "Domain, symmetry and zeros"),
      text: L("Du untersuchst Definitionsbereich und Symmetrie und berechnest die Nullstellen. Gleichungen, Faktorisierung und Rückprüfung hältst du sauber getrennt.",
        "You examine domain and symmetry and calculate the zeros. You keep equations, factorisation and back-checking neatly apart."),
      fokus: [L("Rechnung und Probe trennen", "Separating work and check"), L("Faktorisieren", "Factorising")],
      bsp: { zeilen: [
        { t: "D = \\mathbb{R}" },
        { l: "f(−x)", r: "−x^3 − 3x^2" },
        { tx: L("Weder f(x) noch −f(x): keine einfache Symmetrie.", "Neither f(x) nor −f(x): no simple symmetry.") },
        { l: "f(x)", r: "x^2(x − 3)" },
        { l: "f(x) = 0", o: "⇒", r: "x_1 = 0 \\; (\\text{" + L("doppelt", "double") + "}), \\; x_2 = 3" },
      ] } },
    { w: 3, titel: L("Extrempunkte: Von f′ zu den Punkten", "Extreme points: from f′ to the points"),
      text: L("Kandidaten bestimmst du über f′(x) = 0, berechnest die Funktionswerte und unterscheidest zwischen Extremstelle und Extrempunkt.",
        "You find candidates via f′(x) = 0, calculate the function values and distinguish between an extreme point's x-value and the extreme point itself."),
      fokus: [L("Stelle ≠ Punkt", "x-value ≠ point"), L("Rückprüfung", "Back-checking")],
      bsp: { zeilen: [
        { l: "f′(x)", r: "3x^2 − 6x" }, { r: "3x(x − 2)" },
        { l: "f′(x) = 0", o: "⇒", r: "x_1 = 0, \\; x_2 = 2" },
        { l: "f(0)", r: "0" }, { l: "f(2)", r: "−4" },
        { t: "\\text{" + L("Kandidaten", "Candidates") + ":} \\quad (0\\,|\\,0), \\; (2\\,|\\,−4)" },
      ] } },
    { w: 4, titel: L("Extrempunkte klassifizieren und Monotonie untersuchen", "Classifying extreme points and examining monotonicity"),
      text: L("Mit der zweiten Ableitung und dem Vorzeichenwechsel von f′ klassifizierst du Extrempunkte. Monotonieintervalle begründest du mit übersichtlichen Vorzeichentabellen.",
        "You classify extreme points using the second derivative and the sign change of f′. You justify monotonicity intervals with clear sign tables."),
      fokus: [L("Vorzeichentabelle", "Sign table"), L("Begründen", "Justifying")],
      bsp: { zeilen: [
        { l: "f″(0)", r: "−6", k: L("Hochpunkt", "maximum") },
        { l: "f″(2)", r: "6", k: L("Tiefpunkt", "minimum") },
      ], extra: { typ: "vorzeichen" } } },
    { w: 5, titel: L("Wendepunkte und Krümmung", "Inflection points and curvature"),
      text: L("Wendestellenkandidaten bestimmst du über f″(x) = 0 und prüfst sie anschließend angemessen, zum Beispiel auf einen Vorzeichenwechsel. Krümmungsverhalten und Wendepunkte dokumentierst du nachvollziehbar.",
        "You find inflection candidates via f″(x) = 0 and then check them appropriately, for example for a sign change. You document curvature and inflection points in a traceable way."),
      fokus: [L("Nachvollziehbar dokumentieren", "Documenting traceably"), L("Prüfen", "Checking")],
      bsp: { zeilen: [
        { l: "f″(x)", r: "6x − 6" },
        { l: "f″(x) = 0", o: "⇒", r: "x = 1" },
        { l: "f‴(1)", r: "6 \\neq 0", k: L("Wendestelle", "inflection") },
        { l: "f(1)", r: "−2" },
        { t: "W(1\\,|\\,−2)" },
        { tx: L("Rechtskurve links von x = 1, Linkskurve rechts davon.", "Right-hand curve left of x = 1, left-hand curve to its right.") },
      ] } },
    { w: 6, titel: L("Verhalten im Unendlichen und Gesamtverlauf", "End behaviour and overall shape"),
      text: L("Du untersuchst das Verhalten für x → ∞ und x → −∞ anhand des dominierenden Terms. Nullstellen, Extrempunkte, Wendepunkte, Monotonie und Krümmung verbindest du zu einem Gesamtbild.",
        "You examine the behaviour for x → ∞ and x → −∞ using the dominant term. You combine zeros, extreme points, inflection points, monotonicity and curvature into one overall picture."),
      fokus: [L("Dominierender Term", "Dominant term"), L("Gesamtbild", "Overall picture")],
      bsp: { zeilen: [
        { tx: L("Dominierender Term: x³", "Dominant term: x³") },
        { l: "x \\to \\infty", o: "⇒", r: "f(x) \\to \\infty" },
        { l: "x \\to −\\infty", o: "⇒", r: "f(x) \\to −\\infty" },
      ] } },
    { w: 7, titel: L("Die vollständige Kurvendiskussion zusammensetzen", "Putting the complete curve sketch together"),
      text: L("Eine vollständige Untersuchung mit Definitionsbereich, Symmetrie, Nullstellen, Extrempunkten, Monotonie, Wendepunkt, Krümmung, Verhalten im Unendlichen und Graphenskizze.",
        "A complete investigation with domain, symmetry, zeros, extreme points, monotonicity, inflection point, curvature, end behaviour and a sketch of the graph."),
      fokus: [L("Reihenfolge", "Order of steps"), L("Alles zusammen", "Everything together")],
      bsp: { titel: L("Protokoll zu f(x) = x³ − 3x²", "Report for f(x) = x³ − 3x²"), extra: { typ: "protokoll" }, zeilen: [] } },
    { w: 8, titel: L("Abiturmodus: Selbstständig untersuchen und liefern", "Abitur mode: investigate independently and deliver"),
      text: L("Eine neue Funktion untersuchst du unter realistischen Zeitbedingungen. Je nach Lernstand kommen Tangenten, Schnittpunkte, Parameter oder weitere abiturrelevante Fragestellungen hinzu. Am Ende steht eine vollständige, verständliche Lösung.",
        "You investigate a new function under realistic time conditions. Depending on your level, tangents, intersection points, parameters or further Abitur-relevant questions are added. In the end you hand in a complete, understandable solution."),
      fokus: ["DELIVER", L("Zeit einteilen", "Managing time")],
      bsp: { titel: L("Deine Aufgabe", "Your task"), zeilen: [
        { t: "f(x) = x^3 − 6x^2 + 9x" },
        { tx: L("Vollständig untersuchen – mit Zeitlimit und Graphenskizze.", "Investigate completely – with a time limit and a sketch of the graph.") },
      ] } },
  ];

  const protokoll = [
    [L("Definitionsbereich", "Domain"), "D = \\mathbb{R}"],
    [L("Symmetrie", "Symmetry"), L("keine einfache Symmetrie", "no simple symmetry")],
    [L("Nullstellen", "Zeros"), "x_1 = 0 \\; (" + L("doppelt", "double") + "), \\; x_2 = 3"],
    [L("Extrempunkte", "Extreme points"), "H(0\\,|\\,0), \\; T(2\\,|\\,−4)"],
    [L("Monotonie", "Monotonicity"), L("steigend für x < 0 und x > 2, fallend dazwischen", "increasing for x < 0 and x > 2, decreasing in between")],
    [L("Wendepunkt", "Inflection point"), "W(1\\,|\\,−2)"],
    [L("Krümmung", "Curvature"), L("rechts für x < 1, links für x > 1", "right for x < 1, left for x > 1")],
    [L("Unendlichkeit", "End behaviour"), "x \\to \\pm\\infty \\; ⇒ \\; f(x) \\to \\pm\\infty"],
    [L("Graphenskizze", "Sketch"), L("mit allen markanten Punkten", "with all key points")],
  ];

  const arbeitsweise = [
    L("Lesbarkeit und eindeutige Notation", "Legibility and unambiguous notation"),
    L("klare Termhäuser, Final Operators und Klarheitsabstände", "clear term houses, final operators and clarity spacing"),
    L("nachvollziehbare Umformungsschritte", "traceable steps of rearrangement"),
    L("erkennbare Selbstkontrolle", "visible self-checking"),
    L("Fähigkeit, den eigenen Denkweg zu erklären", "ability to explain your own line of thought"),
  ];
  const mathematik = [
    L("korrekte Regeln und Rechnungen", "correct rules and calculations"),
    L("vollständige Untersuchung der geforderten Eigenschaften", "complete investigation of the required properties"),
    L("schlüssige Begründungen", "convincing justifications"),
    L("plausible und miteinander konsistente Ergebnisse", "plausible results that are consistent with each other"),
  ];
  const mathildaFelder = [
    L("Mathematische Richtigkeit und Umformungen", "Mathematical correctness and rearrangements"),
    L("Vorzeichen- und Potenzfehler", "Sign and power errors"),
    L("Lesbarkeit und Notation", "Legibility and notation"),
    L("Termstruktur und Abstände", "Term structure and spacing"),
    L("Fehlende Zwischenschritte", "Missing intermediate steps"),
    L("Möglichkeiten zur Selbstkontrolle", "Ways to check yourself"),
  ];

  return { werkzeuge, stufen, aufbau, einheitenA, einheitenB, protokoll, arbeitsweise, mathematik, mathildaFelder };
}

/* ---------------------------------------------------------------- Termhäuser */

/* Zerlegt einen Term auf oberster Ebene an + und − (Klammern bleiben zusammen).
   Ergebnis: [{ op: null | "+" | "−", text }] — op ist das Zeichen VOR dem Haus. */
function zerlege(eingabe) {
  const t = String(eingabe).replace(/\s+/g, "").replace(/-/g, "−").replace(/\*/g, "·");
  const aus = [];
  let tiefe = 0, cur = "", op = null;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (ch === "(") tiefe++;
    if (ch === ")") tiefe = Math.max(0, tiefe - 1);
    if ((ch === "+" || ch === "−") && tiefe === 0) {
      if (cur === "") { cur = ch === "−" ? "−" : ""; continue; }          // Vorzeichen am Anfang
      if (cur.endsWith("^")) { cur += ch; continue; }                      // x^−2
      aus.push({ op, text: cur });
      op = ch; cur = "";
    } else cur += ch;
  }
  if (cur !== "") aus.push({ op, text: cur });
  return aus;
}

/* ^2 → hochgestellt; Klammerinhalt bekommt Luft um + und − */
function Hoch({ s }) {
  const schoen = String(s).replace(/([^\s(^])([+−])/g, "$1 $2 ");
  return String(schoen).split(/(\^−?\d+)/).map((t, i) => (/^\^/.test(t)
    ? <sup key={i} style={{ fontSize: "0.62em", lineHeight: 0, position: "relative", top: "-0.5em", marginLeft: 1 }}>{t.slice(1)}</sup>
    : <React.Fragment key={i}>{t}</React.Fragment>));
}

function Haus({ children }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "stretch" }}>
      <svg viewBox="0 0 40 12" preserveAspectRatio="none" style={{ width: "100%", height: 11, display: "block" }} aria-hidden="true">
        <path d="M0.8 11.2 L20 1.6 L39.2 11.2 Z" fill="rgba(237,187,0,0.2)" stroke={NAVY} strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <span style={{ border: `1.6px solid ${NAVY}`, borderTop: "none", borderRadius: "0 0 9px 9px", padding: "5px 11px 6px", background: "#fff",
        whiteSpace: "nowrap", fontWeight: 600, color: NAVY, textAlign: "center" }}>{children}</span>
    </span>
  );
}

function Verbinder({ z, final }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 999, marginBottom: 4, flexShrink: 0,
      fontWeight: 800, fontSize: 18, lineHeight: 1, background: final ? GOLD : "transparent", color: final ? NAVY : C.grau,
      boxShadow: final ? "0 2px 8px rgba(181,134,18,0.38)" : "none", transition: "background .25s, box-shadow .25s" }}>{z}</span>
  );
}

/* stufe 0: Term als Zeile · 1: Termhäuser · 2: Termhäuser + markierte Final Operators */
function Haeuser({ prefix, teile, stufe = 2, gross }) {
  const fs = gross ? 25 : 21;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "6px 2px", fontSize: fs, color: C.tinte, minHeight: 50 }}>
      {prefix && <span style={{ fontWeight: 600, marginRight: 8, marginBottom: 6, whiteSpace: "nowrap" }}>{prefix}</span>}
      {stufe === 0 ? (
        <span style={{ fontWeight: 600, color: NAVY, marginBottom: 6 }}>
          {teile.map((x, i) => <React.Fragment key={i}>{x.op ? ` ${x.op} ` : ""}<Hoch s={x.text} /></React.Fragment>)}
        </span>
      ) : teile.map((x, i) => (
        <React.Fragment key={i}>
          {x.op && <Verbinder z={x.op} final={stufe === 2} />}
          <Haus><Hoch s={x.text} /></Haus>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Bausteine der Seite */

const Blatt = ({ children, style }) => (
  <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.linie}`, padding: "14px 16px",
    backgroundImage: "linear-gradient(rgba(0,77,152,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,77,152,0.055) 1px, transparent 1px)",
    backgroundSize: "22px 22px", ...style }}>{children}</div>
);

const Marke = ({ ok, children }) => (
  <p style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 8,
    color: ok ? C.gruenDunkel : C.signal }}>
    <span aria-hidden="true" style={{ width: 16, height: 16, borderRadius: 999, background: ok ? GOLD : "transparent", border: ok ? "none" : `1.6px solid ${C.signal}`,
      color: ok ? NAVY : C.signal, fontSize: 10, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{ok ? "✓" : "!"}</span>
    {children}
  </p>
);

function Rechnung({ zeilen }) {
  if (!zeilen.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto auto minmax(0,1fr) auto", columnGap: 10, rowGap: 7, alignItems: "center", fontSize: 17, color: C.tinte, overflowX: "auto", paddingBottom: 2 }}>
      {zeilen.map((z, i) => (z.t !== undefined ? (
        <div key={i} style={{ gridColumn: "1 / -1" }}><M t={z.t} /></div>
      ) : z.tx !== undefined ? (
        <div key={i} style={{ gridColumn: "1 / -1", fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.5 }}>{z.tx}</div>
      ) : (
        <React.Fragment key={i}>
          <div style={{ justifySelf: "end" }}>{z.l ? <M t={z.l} /> : null}</div>
          <div style={{ color: C.grau }}>{z.o === "" ? null : <M t={z.o || "="} />}</div>
          <div><M t={z.r} /></div>
          <div style={{ fontSize: 12.5, color: "#A67C00", fontWeight: 600, whiteSpace: "nowrap" }}>{z.k || ""}</div>
        </React.Fragment>
      )))}
    </div>
  );
}

const zelle = { padding: "7px 6px", textAlign: "center", fontSize: 14.5, borderBottom: `1px solid ${C.linie}`, borderRight: `1px solid ${C.linie}` };

function Wertetabelle() {
  const xs = [-2, -1, 0, 1, 2];
  return (
    <div style={{ overflowX: "auto", marginTop: 12 }}>
      <div style={{ display: "inline-grid", gridTemplateColumns: `auto repeat(${xs.length}, minmax(34px, 1fr))`, border: `1.5px solid ${NAVY}`, borderRadius: 10, overflow: "hidden", background: "#fff" }}>
        <span style={{ ...zelle, background: NAVY, color: GOLD, fontWeight: 700, padding: "7px 12px" }}>x</span>
        {xs.map((x) => <span key={x} style={{ ...zelle, background: "#EEF3FA", fontWeight: 600 }}>{x < 0 ? `−${-x}` : x}</span>)}
        <span style={{ ...zelle, background: NAVY, color: GOLD, fontWeight: 700, padding: "7px 12px", borderBottom: "none" }}>f(x)</span>
        {xs.map((x) => { const y = 2 * x + 1; return <span key={x} style={{ ...zelle, borderBottom: "none", fontWeight: 600, color: NAVY }}>{y < 0 ? `−${-y}` : y}</span>; })}
      </div>
    </div>
  );
}

function Vorzeichentabelle() {
  const kopf = ["x < 0", "0 < x < 2", "x > 2"];
  const vz = ["+", "−", "+"];
  const pf = [L("steigend", "rising"), L("fallend", "falling"), L("steigend", "rising")];
  const pfeil = ["↗", "↘", "↗"];
  return (
    <div style={{ overflowX: "auto", marginTop: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto repeat(3, minmax(0, 1fr))", border: `1.5px solid ${NAVY}`, borderRadius: 10, overflow: "hidden", background: "#fff", minWidth: 300 }}>
        <span style={{ ...zelle, background: NAVY }} />
        {kopf.map((k) => <span key={k} style={{ ...zelle, background: NAVY, color: GOLD, fontWeight: 700 }}>{k}</span>)}
        <span style={{ ...zelle, background: "#EEF3FA", fontWeight: 700, padding: "9px 12px" }}>f′(x)</span>
        {vz.map((v, i) => <span key={i} style={{ ...zelle, fontWeight: 800, fontSize: 19, color: v === "+" ? C.gruenDunkel : C.signal }}>{v}</span>)}
        <span style={{ ...zelle, background: "#EEF3FA", fontWeight: 700, padding: "9px 12px", borderBottom: "none" }}>f(x)</span>
        {pf.map((p, i) => (
          <span key={i} style={{ ...zelle, borderBottom: "none", fontSize: 13, lineHeight: 1.3 }}>
            <span style={{ display: "block", fontSize: 20, fontWeight: 700, color: NAVY }}>{pfeil[i]}</span>{p}
          </span>
        ))}
      </div>
    </div>
  );
}

function Protokoll({ zeilen }) {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${C.linie}`, overflow: "hidden", background: "#fff" }}>
      {zeilen.map(([k, v], i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(98px, 34%) minmax(0, 1fr)", gap: 10, padding: "8px 12px", alignItems: "center",
          background: i % 2 ? "#F7F9FD" : "#fff", borderBottom: i < zeilen.length - 1 ? `1px solid ${C.linie}` : "none" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", color: C.hellgrau, textTransform: "uppercase" }}>{k}</span>
          <span style={{ fontSize: 15, color: C.tinte, lineHeight: 1.45 }}>{/[\\^_=|]/.test(v) ? <M t={v} /> : v}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Vier Werkzeuge */

function WerkzeugBild({ id }) {
  if (id === "klar") return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
      <Blatt>
        <Marke ok>{L("EINDEUTIG", "UNAMBIGUOUS")}</Marke>
        <p style={{ fontSize: 30, fontWeight: 700, color: NAVY, lineHeight: 1.1 }}>x<sup style={{ fontSize: "0.6em", position: "relative", top: "-0.1em", lineHeight: 0 }}>2</sup> + 3x</p>
        <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.5, marginTop: 8 }}>{L("Der Exponent sitzt direkt rechts oben an seiner Basis.", "The exponent sits right at the top right of its base.")}</p>
      </Blatt>
      <Blatt>
        <Marke>{L("MISSVERSTÄNDLICH", "AMBIGUOUS")}</Marke>
        <p style={{ fontSize: 30, fontWeight: 700, color: NAVY, lineHeight: 1.1 }}>x <span style={{ marginLeft: 6 }}>2</span> + 3x</p>
        <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.5, marginTop: 8 }}>{L("x · 2 oder x²? Das Blatt gibt keine Antwort.", "x · 2 or x²? The page gives no answer.")}</p>
      </Blatt>
    </div>
  );
  if (id === "haus") return (
    <Blatt>
      <Haeuser prefix="f(x) =" teile={zerlege("3x^2 − 2x + 5")} stufe={1} />
      <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.55, marginTop: 10 }}>
        {L("Drei Summanden, drei Häuser: 3x², 2x und 5. Jedes Haus wird für sich behandelt und kontrolliert.", "Three summands, three houses: 3x², 2x and 5. Each house is handled and checked on its own.")}
      </p>
    </Blatt>
  );
  if (id === "op") return (
    <Blatt>
      <Haeuser prefix="f(x) =" teile={zerlege("(x − 2)^2 + 4")} stufe={2} />
      <div style={{ display: "grid", gap: 7, marginTop: 10, fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.5 }}>
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span aria-hidden="true" style={{ width: 16, height: 16, borderRadius: 999, background: GOLD, flexShrink: 0 }} />
          <span><b style={{ fontWeight: 700, color: NAVY }}>Final Operator:</b> {L("das + zwischen den beiden Häusern.", "the + between the two houses.")}</span>
        </span>
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span aria-hidden="true" style={{ width: 16, height: 16, borderRadius: 999, border: `1.6px solid ${C.hellgrau}`, flexShrink: 0 }} />
          <span>{L("Das − in der Klammer bleibt im Haus. Es verbindet keine Häuser.", "The − inside the bracket stays within its house. It does not connect houses.")}</span>
        </span>
      </div>
    </Blatt>
  );
  const kette = [["2x + 1", "7", "| − 1"], ["2x", "6", "| : 2"], ["x", "3", ""]];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
      <Blatt>
        <Marke>{L("ZUSAMMENGEQUETSCHT", "SQUEEZED TOGETHER")}</Marke>
        <p style={{ fontSize: 24, fontWeight: 700, color: NAVY, letterSpacing: "-0.05em" }}>3x²−2x+5</p>
        <Marke ok>{L("MIT KLARHEITSABSTAND", "WITH CLARITY SPACING")}</Marke>
        <p style={{ fontSize: 24, fontWeight: 700, color: NAVY, wordSpacing: "0.32em" }}>3x² − 2x + 5</p>
      </Blatt>
      <Blatt>
        <Marke ok>{L("GLEICHHEITSZEICHEN UNTEREINANDER", "EQUALS SIGNS LINED UP")}</Marke>
        <div style={{ display: "grid", gridTemplateColumns: "auto auto auto 1fr", columnGap: 8, rowGap: 5, fontSize: 19, fontWeight: 600, color: NAVY, alignItems: "baseline" }}>
          {kette.map(([l, r, k], i) => (
            <React.Fragment key={i}>
              <span style={{ justifySelf: "end" }}>{l}</span><span style={{ color: C.grau }}>=</span>
              <span style={{ borderBottom: i === kette.length - 1 ? `3px double ${GOLD}` : "none", justifySelf: "start" }}>{r}</span>
              <span style={{ fontSize: 13, color: "#A67C00", fontWeight: 600 }}>{k}</span>
            </React.Fragment>
          ))}
        </div>
      </Blatt>
    </div>
  );
}

function Werkzeuge({ daten }) {
  const [id, setId] = useState("klar");
  const w = daten.werkzeuge.find((x) => x.id === id);
  return (
    <>
      <div role="tablist" aria-label={L("Die vier Werkzeuge", "The four tools")} style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        {daten.werkzeuge.map((x, i) => (
          <button key={x.id} type="button" role="tab" aria-selected={id === x.id} onClick={() => setId(x.id)}
            style={{ textAlign: "left", padding: "12px 13px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
              border: `1.5px solid ${id === x.id ? NAVY : C.linie}`, background: id === x.id ? NAVY : C.weiss, boxShadow: id === x.id ? "0 6px 18px rgba(11,30,74,0.22)" : "none",
              transition: "background .2s, border-color .2s" }}>
            <span style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: id === x.id ? GOLD : C.hellgrau }}>{`0${i + 1}`}</span>
            <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: id === x.id ? "#fff" : NAVY, marginTop: 2, lineHeight: 1.2 }}>{x.name}</span>
            <span style={{ display: "block", fontSize: 11.5, fontWeight: 400, color: id === x.id ? "#C9D6EE" : C.grau, marginTop: 3, lineHeight: 1.35 }}>{x.kurz}</span>
          </button>
        ))}
      </div>
      <div key={id} className="pp-neu" style={{ ...karte, padding: 18, marginTop: 10 }}>
        <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.7, marginBottom: 14 }}>{w.text}</p>
        <WerkzeugBild id={id} />
      </div>
      <div style={{ ...karte, padding: "14px 16px", marginTop: 10, display: "flex", gap: 12, alignItems: "flex-start", borderLeft: `4px solid ${GOLD}` }}>
        <span aria-hidden="true" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 11, background: GOLDFLAECHE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <span>
          <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: NAVY }}>{L("Dazu: systematische Selbstkontrolle", "Plus: systematic self-checking")}</span>
          <span style={{ display: "block", fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: 3 }}>
            {L("Du lernst, Vorzeichenfehler, falsche Umformungen, Potenzfehler und unklare Rechenschritte selbst zu erkennen. Die mathematischen Regeln bleiben unverändert – die Methode macht ihre Anwendung sichtbarer.",
              "You learn to spot sign errors, wrong rearrangements, power errors and unclear steps yourself. The mathematical rules stay exactly the same – the method just makes how you apply them more visible.")}
          </span>
        </span>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- Termhaus-Labor */

function Labor() {
  const beispiele = ["3x^2 − 2x + 5", "x^3 − 3x^2 + 2x", "−x^2 + 4", "(x − 2)^2 + 4", "2x + 1"];
  const [eingabe, setEingabe] = useState(beispiele[0]);
  const [stufe, setStufe] = useState(1);
  const hatGleich = eingabe.includes("=");
  const kopf = hatGleich ? eingabe.slice(0, eingabe.indexOf("=")).trim() : "";
  const rechts = hatGleich ? eingabe.slice(eingabe.indexOf("=") + 1) : eingabe;
  const teile = useMemo(() => zerlege(rechts), [rechts]);
  const klammerHinweis = teile.some((x) => /\([^)]*[+−]/.test(x.text));
  const stufenName = [L("Term", "Term"), L("Termhäuser", "Term houses"), "+ Final Operators"];
  return (
    <div style={{ ...karte, padding: 18 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {beispiele.map((b) => (
          <button key={b} type="button" onClick={() => setEingabe(b)}
            style={{ padding: "6px 11px", borderRadius: 999, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: `1.5px solid ${eingabe === b ? NAVY : C.linie}`, background: eingabe === b ? NAVY : "#fff", color: eingabe === b ? GOLD : NAVY }}>
            <Hoch s={b} />
          </button>
        ))}
      </div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.hellgrau, letterSpacing: "0.04em", marginBottom: 5 }}>{L("ODER EIGENEN TERM EINGEBEN", "OR TYPE YOUR OWN TERM")}</label>
      <input value={eingabe} onChange={(e) => setEingabe(e.target.value)} spellCheck={false} autoComplete="off" inputMode="text"
        placeholder="x^2 − 4x + 3" aria-label={L("Term eingeben", "Enter a term")}
        style={{ width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 11, border: `1.5px solid ${C.linie}`, fontFamily: "inherit", fontSize: 16, color: C.tinte, background: "#FAFBFE", outline: "none" }} />
      <p style={{ fontSize: 11.5, color: C.hellgrau, margin: "5px 0 14px" }}>{L("Potenzen mit ^ schreiben, zum Beispiel x^2.", "Write powers with ^, for example x^2.")}</p>

      <div role="group" aria-label={L("Ansicht", "View")} style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 4, background: "#EEF3FA", borderRadius: 12, padding: 4, marginBottom: 12 }}>
        {stufenName.map((n, i) => (
          <button key={n} type="button" aria-pressed={stufe === i} onClick={() => setStufe(i)}
            style={{ padding: "9px 4px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700,
              background: stufe === i ? NAVY : "transparent", color: stufe === i ? GOLD : C.grau, transition: "background .2s" }}>{n}</button>
        ))}
      </div>

      <Blatt style={{ minHeight: 96, display: "flex", alignItems: "center" }}>
        {teile.length ? (
          <div style={{ width: "100%" }}><Haeuser prefix={kopf || null} teile={teile} stufe={stufe} gross /></div>
        ) : (
          <p style={{ fontSize: 14, color: C.grau }}>{L("Gib oben einen Term ein, zum Beispiel 3x^2 − 2x + 5.", "Type a term above, for example 3x^2 − 2x + 5.")}</p>
        )}
      </Blatt>
      {teile.length > 0 && (
        <p aria-live="polite" style={{ fontSize: 14, color: C.tinte, marginTop: 12, lineHeight: 1.6 }}>
          <b style={{ color: NAVY }}>{teile.length} {teile.length === 1 ? L("Termhaus", "term house") : L("Termhäuser", "term houses")}</b>
          {" · "}
          <b style={{ color: NAVY }}>{teile.length - 1} Final {teile.length - 1 === 1 ? "Operator" : "Operators"}</b>
        </p>
      )}
      {klammerHinweis && (
        <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: 6 }}>
          {L("Plus und Minus innerhalb einer Klammer bleiben im Termhaus. Nur die Zeichen zwischen den Häusern sind Final Operators.", "Plus and minus signs inside a bracket stay within the term house. Only the signs between the houses are final operators.")}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Lernstufen-Treppe */

function Treppe({ daten }) {
  const [i, setI] = useState(0);
  const S = daten.stufen[i];
  const B = 80, G = 6, H0 = 150;
  return (
    <>
      <div style={{ ...karte, padding: "16px 12px 12px" }}>
        <svg viewBox="0 0 346 168" style={{ width: "100%", display: "block" }} role="group" aria-label={L("Vier Lernstufen", "Four learning stages")}>
          <defs>
            <linearGradient id="ppGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFE9A0" /><stop offset="0.45" stopColor="#EDBB00" /><stop offset="1" stopColor="#B58612" />
            </linearGradient>
          </defs>
          <line x1="2" y1={H0 + 6} x2="344" y2={H0 + 6} stroke={C.linie} strokeWidth="2" />
          {daten.stufen.map((s, k) => {
            const h = 38 + k * 32, x = 2 + k * (B + G), y = H0 - h, an = k === i;
            return (
              <g key={s.k} role="button" tabIndex={0} aria-label={`${s.k} – ${s.name}`} aria-pressed={an} style={{ cursor: "pointer", outline: "none" }}
                onClick={() => setI(k)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setI(k); } }}>
                <rect x={x} y={y + 6} width={B} height={h} rx="10" fill={an ? "url(#ppGold)" : NAVY} opacity={an ? 1 : 0.14 + k * 0.17} style={{ transition: "opacity .25s" }} />
                <text x={x + B / 2} y={y + 6 + 24} textAnchor="middle" fontFamily="Montserrat, system-ui, sans-serif" fontSize="12.5" fontWeight="800" letterSpacing="0.04em"
                  fill={an ? NAVY : "#fff"}>{s.k}</text>
                <text x={x + B / 2} y={y + 6 + 40} textAnchor="middle" fontFamily="Montserrat, system-ui, sans-serif" fontSize="9.5" fontWeight="500"
                  fill={an ? NAVY : "#C9D6EE"}>{s.name}</text>
              </g>
            );
          })}
        </svg>
        <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontSize: 11, fontWeight: 600, color: C.hellgrau }}>
          <span>{L("viel Hilfe", "lots of support")}</span>
          <span style={{ flex: 1, height: 2, borderRadius: 2, background: `linear-gradient(90deg, ${C.linie}, ${GOLD})` }} />
          <span>{L("eigene Leistung", "your own work")}</span>
        </div>
      </div>
      <div key={i} className="pp-neu" style={{ ...karte, padding: 18, marginTop: 10, borderTop: `4px solid ${GOLD}` }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: C.hellgrau }}>{L("STUFE", "STAGE")} {i + 1}</p>
        <p style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{S.k} <span style={{ fontWeight: 400, color: C.grau }}>· {S.name}</span></p>
        <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.7 }}>{S.text}</p>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- Kurse */

function Kurse({ daten, kurs, setKurs, einheit, setEinheit, anker }) {
  const liste = kurs === "A" ? daten.einheitenA : daten.einheitenB;
  const E = liste[einheit];
  const phasen = kurs === "A"
    ? [[3, L("Gerade", "Line")], [2, L("Parabel", "Parabola")], [4, L("Ableitung", "Derivative")]]
    : [[2, L("Ableiten", "Differentiating")], [4, L("Eigenschaften", "Properties")], [3, L("Gesamtbild", "Big picture")]];
  const wahl = [
    { id: "A", kicker: L("KURS A", "COURSE A"), name: L("Mittelstufe", "Lower & middle school"), weg: L("Geradengleichungen → Parabeln → Ableitung", "Straight lines → parabolas → derivative") },
    { id: "B", kicker: L("KURS B", "COURSE B"), name: L("Oberstufe / Abitur", "Upper school / Abitur"), weg: L("Ableitung → markante Punkte → vollständige Kurvendiskussion", "Derivative → key points → complete curve sketch") },
  ];
  const ziel = kurs === "A"
    ? L("Du beginnst mit Geradengleichungen, entwickelst ein Gefühl für Termstrukturen und gelangst über Parabeln zur Ableitung. Die Ableitung bildet den Abschluss des Kurses.",
      "You begin with straight-line equations, develop a feel for term structure and reach the derivative via parabolas. The derivative is the finale of the course.")
    : L("Du beginnst mit dem Ableiten und erarbeitest dir daraus die vollständige Kurvendiskussion – von den ersten Ableitungsregeln bis zu den markanten Punkten und dem Gesamtverlauf einer Funktion.",
      "You start with differentiating and build up to the complete curve sketch – from the first rules of differentiation to the key points and the overall shape of a function.");
  const waehle = (k) => { setKurs(k); setEinheit(0); };
  const bsp = E.bsp;
  const ex = bsp.extra;

  return (
    <div ref={anker} style={{ scrollMarginTop: 70 }}>
      <div role="tablist" aria-label={L("Kurs wählen", "Choose a course")} style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        {wahl.map((w) => (
          <button key={w.id} type="button" role="tab" aria-selected={kurs === w.id} onClick={() => waehle(w.id)}
            style={{ textAlign: "left", padding: "14px 13px", borderRadius: 16, cursor: "pointer", fontFamily: "inherit", position: "relative", overflow: "hidden",
              border: `1.5px solid ${kurs === w.id ? NAVY : C.linie}`, background: kurs === w.id ? `linear-gradient(160deg, ${NAVY}, #17306B)` : C.weiss,
              boxShadow: kurs === w.id ? "0 8px 22px rgba(11,30,74,0.26)" : "none", transition: "all .2s" }}>
            <span style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: kurs === w.id ? GOLD : C.hellgrau }}>{w.kicker}</span>
            <span style={{ display: "block", fontSize: 17, fontWeight: 700, color: kurs === w.id ? "#fff" : NAVY, margin: "3px 0 6px", lineHeight: 1.2 }}>{w.name}</span>
            <span style={{ display: "block", fontSize: 11.5, fontWeight: 400, lineHeight: 1.4, color: kurs === w.id ? "#C9D6EE" : C.grau }}>{w.weg}</span>
          </button>
        ))}
      </div>

      <p style={{ fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.75, margin: "16px 0 6px" }}>{ziel}</p>
      {kurs === "A" && <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.5, marginBottom: 6 }}>{L("Woche 1 enthält zwei Einheiten, danach folgt jeweils eine Einheit pro Woche.", "Week 1 has two units; after that there is one unit per week.")}</p>}
      {kurs === "B" && <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.5, marginBottom: 6 }}>{L("Auch hier gibt es in Woche 1 zwei Einheiten, danach eine pro Woche.", "Here too, week 1 has two units; after that there is one per week.")}</p>}

      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "14px 0 10px" }}>{L("Einheit für Einheit – tippe eine Einheit an", "Unit by unit – tap a unit")}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(9, minmax(0, 1fr))", gap: 4 }}>
        {liste.map((x, i) => (
          <button key={i} type="button" aria-pressed={einheit === i} aria-label={`${L("Einheit", "Unit")} ${i + 1}, ${L("Woche", "week")} ${x.w}`} onClick={() => setEinheit(i)}
            style={{ height: 54, borderRadius: 11, cursor: "pointer", fontFamily: "inherit", padding: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
              border: `1.5px solid ${einheit === i ? NAVY : C.linie}`, background: einheit === i ? NAVY : C.weiss, color: einheit === i ? GOLD : C.tinte, transition: "background .2s" }}>
            <span style={{ fontSize: 17, fontWeight: 800, lineHeight: 1 }}>{i + 1}</span>
            <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.7 }}>{L("W", "W")}{x.w}</span>
          </button>
        ))}
      </div>
      <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "repeat(9, minmax(0, 1fr))", gap: 4, marginTop: 6 }}>
        {phasen.map(([n, name], i) => (
          <span key={name} style={{ gridColumn: `span ${n}`, textAlign: "center", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.03em", padding: "5px 2px", borderRadius: 8,
            background: ["#E8EFF9", "#FBF1CC", "#DCE5F5"][i], color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        ))}
      </div>

      <div key={`${kurs}${einheit}`} className="pp-neu" style={{ ...karte, padding: 18, marginTop: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: C.hellgrau }}>{L("WOCHE", "WEEK")} {E.w} · {L("EINHEIT", "UNIT")} {String(einheit + 1).padStart(2, "0")}</p>
        <p style={{ fontSize: 21, fontWeight: 700, color: NAVY, lineHeight: 1.25, margin: "3px 0 10px" }}>{E.titel}</p>
        <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.7 }}>{E.text}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "12px 0 14px" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: C.hellgrau, letterSpacing: "0.04em", alignSelf: "center", marginRight: 2 }}>{L("TRAINIERT", "TRAINS")}</span>
          {E.fokus.map((f) => (
            <span key={f} style={{ fontSize: 12, fontWeight: 600, color: NAVY, background: "#EEF3FA", borderRadius: 999, padding: "4px 10px" }}>{f}</span>
          ))}
        </div>
        <Blatt style={{ padding: "14px 14px 16px" }}>
          <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.1em", color: C.gruenDunkel, marginBottom: 10 }}>{(bsp.titel || L("Beispiel", "Example")).toUpperCase()}</p>
          {ex && ex.typ === "haeuser" && <div style={{ marginBottom: 12 }}><Haeuser prefix={ex.prefix} teile={zerlege(ex.term)} stufe={2} /></div>}
          <Rechnung zeilen={bsp.zeilen} />
          {ex && ex.typ === "wertetabelle" && <Wertetabelle />}
          {ex && ex.typ === "vorzeichen" && <Vorzeichentabelle />}
          {ex && ex.typ === "protokoll" && <Protokoll zeilen={daten.protokoll} />}
        </Blatt>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 14 }}>
          <button type="button" disabled={einheit === 0} onClick={() => setEinheit(einheit - 1)}
            style={{ padding: "9px 14px", borderRadius: 999, border: `1.5px solid ${C.linie}`, background: "#fff", color: einheit === 0 ? C.hellgrau : NAVY, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: einheit === 0 ? "default" : "pointer" }}>
            ← {L("Vorige", "Previous")}
          </button>
          <button type="button" disabled={einheit === liste.length - 1} onClick={() => setEinheit(einheit + 1)}
            style={{ padding: "9px 14px", borderRadius: 999, border: "none", background: einheit === liste.length - 1 ? C.linie : NAVY, color: einheit === liste.length - 1 ? C.hellgrau : GOLD, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: einheit === liste.length - 1 ? "default" : "pointer" }}>
            {L("Nächste", "Next")} →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Einheitenaufbau */

function Aufbau({ daten }) {
  return (
    <div style={{ ...karte, padding: "10px 16px" }}>
      {daten.aufbau.map((a, i) => {
        const stufe = a.stufe !== undefined;
        return (
          <div key={a.t} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < daten.aufbau.length - 1 ? `1px solid ${C.linie}` : "none", alignItems: "flex-start" }}>
            <span aria-hidden="true" style={{ position: "relative", flexShrink: 0, width: 34, height: 34, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, background: stufe ? NAVY : "#EEF3FA", color: stufe ? GOLD : NAVY }}>{i + 1}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: stufe ? "0.03em" : 0 }}>{a.t}</span>
              <span style={{ display: "block", fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: 2 }}>{a.s}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- Erfolg messen */

function Ring({ anteil, gross }) {
  const r = 17, u = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 44 44" width={gross ? 52 : 44} height={gross ? 52 : 44} aria-hidden="true">
      <circle cx="22" cy="22" r={r} fill="none" stroke={C.linie} strokeWidth="5" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={GOLD} strokeWidth="5" strokeLinecap="round" strokeDasharray={u} strokeDashoffset={u * (1 - anteil)}
        transform="rotate(-90 22 22)" style={{ transition: "stroke-dashoffset .35s ease" }} />
    </svg>
  );
}

function Checkliste({ titel, punkte, vorne, an, schalte }) {
  const n = punkte.filter((_, i) => an.has(`${vorne}${i}`)).length;
  return (
    <div style={{ ...karte, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Ring anteil={n / punkte.length} />
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: NAVY }}>{titel}</span>
          <span style={{ display: "block", fontSize: 12.5, color: C.grau }}>{n} {L("von", "of")} {punkte.length}</span>
        </span>
      </div>
      {punkte.map((p, i) => {
        const id = `${vorne}${i}`, on = an.has(id);
        return (
          <button key={id} type="button" role="checkbox" aria-checked={on} onClick={() => schalte(id)}
            style={{ display: "flex", gap: 11, alignItems: "flex-start", width: "100%", textAlign: "left", padding: "9px 0", background: "none", border: "none", borderTop: `1px solid ${C.linie}`, cursor: "pointer", fontFamily: "inherit" }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 7, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center",
              border: `1.8px solid ${on ? GOLD : C.hellgrau}`, background: on ? GOLD : "#fff", transition: "all .15s" }}>
              {on && <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={NAVY} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
            </span>
            <span style={{ fontSize: 14, color: C.tinte, lineHeight: 1.5 }}>{p}</span>
          </button>
        );
      })}
    </div>
  );
}

function Erfolg({ daten }) {
  const [an, setAn] = useState(() => new Set());
  const schalte = (id) => setAn((alt) => { const neu = new Set(alt); if (neu.has(id)) neu.delete(id); else neu.add(id); return neu; });
  const schritte = [
    [L("Kursbeginn", "Start of the course"), L("Eine Vergleichsaufgabe lösen.", "Solve a comparison task.")],
    [L("Kursende", "End of the course"), L("Eine vergleichbare Aufgabe noch einmal lösen.", "Solve a similar task again.")],
    [L("Auswertung", "Evaluation"), L("Mathematik und Arbeitsweise getrennt betrachten.", "Look at maths and way of working separately.")],
  ];
  return (
    <>
      <div style={{ ...karte, padding: "14px 16px", marginBottom: 12 }}>
        {schritte.map(([t, s], i) => (
          <div key={t} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 0", borderBottom: i < schritte.length - 1 ? `1px dashed ${C.linie}` : "none" }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 999, background: i === 2 ? GOLDFLAECHE : NAVY, color: i === 2 ? NAVY : GOLD, fontSize: 12.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <span style={{ fontSize: 14, color: C.tinte, lineHeight: 1.55 }}><b style={{ color: NAVY }}>{t}:</b> {s}</span>
          </div>
        ))}
        <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: 8 }}>
          {L("So zeigt sich, ob sich die fachliche Leistung, die Arbeitsweise oder beides verbessert hat.", "That shows whether your subject performance, your way of working or both have improved.")}
        </p>
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "18px 0 10px" }}>{L("Prüfe dein letztes Blatt – tippe an, was zutrifft", "Check your latest page – tap what applies")}</p>
      <div style={{ display: "grid", gap: 10 }}>
        <Checkliste titel={L("Arbeitsweise", "Way of working")} punkte={daten.arbeitsweise} vorne="a" an={an} schalte={schalte} />
        <Checkliste titel={L("Mathematik", "Mathematics")} punkte={daten.mathematik} vorne="m" an={an} schalte={schalte} />
      </div>
      <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.6, marginTop: 10 }}>
        {L("Beides wird getrennt bewertet: Eine richtige Lösung kann schlecht dokumentiert sein – und ein sauberer Weg kann einen Rechenfehler enthalten.", "The two are rated separately: a correct solution can be poorly documented – and a clean working can still contain a slip in the calculation.")}
      </p>
    </>
  );
}

/* ---------------------------------------------------------------- Hauptseite */

export function PenPaperKursSeite({ gehe }) {
  const daten = useMemo(baue, []);
  const [kurs, setKurs] = useState("A");
  const [einheit, setEinheit] = useState(0);
  const anker = useRef(null);
  const zuKurs = (k) => {
    setKurs(k); setEinheit(0);
    setTimeout(() => { try { anker.current && anker.current.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { /* ignorieren */ } }, 30);
  };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <style>{`.pp-neu{animation:ppNeu .35s cubic-bezier(.2,.7,.3,1) both}@keyframes ppNeu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion:reduce){.pp-neu{animation:none}}`}</style>

      {/* Grundidee */}
      <H2>{L("Dein Denkweg, sichtbar gemacht", "Your thinking, made visible")}</H2>
      <Absatz>
        {L("Pen & Paper ist ein trainierbares System, mit dem du mathematische Gedanken sichtbar, verständlich und kontrollierbar machst. Es geht nicht um Schönschrift, sondern um eine bessere Arbeitsweise, die mathematisches Denken unterstützt.",
          "Pen & Paper is a trainable system that makes your mathematical thinking visible, understandable and controllable. It is not about neat handwriting but about a better way of working that supports mathematical thinking.")}
      </Absatz>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, margin: "4px 0 14px" }}>
        {[[L("2 Kurse", "2 courses"), L("Mittelstufe und Oberstufe", "Middle and upper school"), SILBER],
          [L("9 Einheiten", "9 units"), L("in jedem Kurs", "in each course"), C.see],
          [L("8 Wochen", "8 weeks"), L("Woche 1 mit zwei Einheiten", "Week 1 has two units"), GOLD]].map(([t, s, f]) => (
          <div key={t} style={{ ...karte, padding: "14px 12px", borderTop: `4px solid ${f}` }}>
            <p style={{ fontSize: 15.5, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{t}</p>
            <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.45 }}>{s}</p>
          </div>
        ))}
      </div>
      <Absatz style={{ marginBottom: 10 }}>
        {L("Beide Kurse verbinden die Pen-&-Paper-Methode direkt mit mathematischen Inhalten. Sie unterscheiden sich im fachlichen Weg:", "Both courses link the Pen & Paper method directly with mathematical content. They differ in the subject path:")}
      </Absatz>
      <div style={{ display: "grid", gap: 8 }}>
        {[["A", L("Mittelstufe", "Middle school"), L("von Geradengleichungen über Parabeln bis zur Ableitung", "from straight-line equations via parabolas to the derivative")],
          ["B", L("Oberstufe / Abitur", "Upper school / Abitur"), L("von der Ableitung bis zur vollständigen Kurvendiskussion", "from the derivative to the complete curve sketch")]].map(([k, n, w]) => (
          <button key={k} type="button" onClick={() => zuKurs(k)}
            style={{ ...karte, display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", width: "100%" }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 14, background: k === "A" ? NAVY : GOLDFLAECHE, color: k === "A" ? GOLD : NAVY, fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{k}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: NAVY }}>{n}</span>
              <span style={{ display: "block", fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.45 }}>{w}</span>
            </span>
            <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" style={{ flexShrink: 0 }}><path d="M3 8h9M8.5 4l4 4-4 4" stroke={NAVY} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        ))}
      </div>

      <Trenner />

      {/* Werkzeuge */}
      <Kicker>{L("Das Handwerkszeug", "The toolkit")}</Kicker>
      <H2>{L("Vier Werkzeuge für ein klares Blatt", "Four tools for a clear page")}</H2>
      <Absatz>{L("Alles, was du in den Kursen trainierst, beruht auf vier Werkzeugen. Tippe eines an und sieh dir an, wie es auf dem Blatt aussieht.", "Everything you train in the courses rests on four tools. Tap one and see what it looks like on the page.")}</Absatz>
      <Werkzeuge daten={daten} />

      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "26px 0 10px" }}>{L("Zum Ausprobieren: das Termhaus-Labor", "Try it yourself: the term-house lab")}</p>
      <Labor />

      <Trenner />

      {/* Lernstufen */}
      <Kicker>{L("Der Weg in jeder Einheit", "The path in every unit")}</Kicker>
      <H2>{L("Vier Lernstufen: Vom Lesen zum Vermitteln", "Four stages: from reading to delivering")}</H2>
      <Absatz>{L("Die Hilfestellung nimmt von Stufe zu Stufe ab, dein eigener Anteil wächst. Tippe eine Stufe an.", "The support decreases from stage to stage while your own share grows. Tap a stage.")}</Absatz>
      <Treppe daten={daten} />

      <Trenner />

      {/* Kurse */}
      <Kicker>{L("Die zwei Kurse", "The two courses")}</Kicker>
      <H2>{L("Neun Einheiten in acht Wochen", "Nine units in eight weeks")}</H2>
      <Kurse daten={daten} kurs={kurs} setKurs={setKurs} einheit={einheit} setEinheit={setEinheit} anker={anker} />
      <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.6, marginTop: 12 }}>
        {L("Die Rechenbeispiele zeigen, wie die Aufgaben von Anfang an so gestaltet sind, dass sie zugleich die Arbeitsweise trainieren.", "The worked examples show how the tasks are designed from the start to train your way of working at the same time.")}
      </p>

      <Trenner />

      {/* Aufbau jeder Einheit */}
      <Kicker>{L("Der Ablauf", "The routine")}</Kicker>
      <H2>{L("So ist jede Einheit aufgebaut", "How every unit is structured")}</H2>
      <Absatz>{L("Jede Einheit folgt derselben didaktischen Struktur – so weißt du immer, was als Nächstes kommt.", "Every unit follows the same teaching structure – so you always know what comes next.")}</Absatz>
      <Aufbau daten={daten} />

      <Trenner />

      {/* Erfolg messen */}
      <Kicker>{L("Fortschritt sehen", "Seeing progress")}</Kicker>
      <H2>{L("Erfolg messen – Mathematik und Arbeitsweise getrennt", "Measuring success – maths and working method separately")}</H2>
      <Erfolg daten={daten} />

      <Trenner />

      {/* Mathilda */}
      <Kicker>{L("Dein Feedback-Partner", "Your feedback partner")}</Kicker>
      <H2>{L("Mathilda schaut auf dein Blatt", "Mathilda looks at your page")}</H2>
      <div style={{ borderRadius: 20, padding: "20px 18px 18px", background: `linear-gradient(165deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: "#fff", boxShadow: "0 10px 30px rgba(0,77,152,0.24)" }}>
        <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}><MathildaName dunkel /></p>
        <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.7, color: "#E3EBF8", marginBottom: 14 }}>
          {L("Mach ein Foto von deiner handschriftlichen Lösung. Mathilda gibt dir Rückmeldung zu:", "Take a photo of your handwritten solution. Mathilda gives you feedback on:")}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
          {daten.mathildaFelder.map((f) => (
            <span key={f} style={{ fontSize: 12.5, fontWeight: 500, color: "#fff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 999, padding: "6px 12px" }}>{f}</span>
          ))}
        </div>
        <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: "#E3EBF8", marginBottom: 6 }}>
          {L("Mathilda gibt nicht einfach die Lösung aus. Sie unterstützt dich dabei, deinen eigenen Denkweg zu überprüfen und zu verbessern.", "Mathilda does not just hand you the solution. She helps you check and improve your own line of thought.")}
        </p>
        <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.65, color: "#C9D6EE", marginBottom: 16 }}>
          {L("Wo die automatische Auswertung unsicher ist, sagt sie das offen.", "Where the automatic analysis is uncertain, she tells you so openly.")}
        </p>
        <button type="button" onClick={() => gehe({ ansicht: "analyse", foto: "blatt" })}
          style={{ padding: "12px 20px", borderRadius: 999, border: "none", background: GOLDFLAECHE, color: NAVY, fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(181,134,18,0.4)" }}>
          {L("Foto vom Blatt prüfen lassen", "Have your page checked")} →
        </button>
      </div>

      <Trenner />

      {/* Leitprinzip */}
      <Kicker>{L("Das Leitprinzip", "The guiding principle")}</Kicker>
      <H2>{L("Dieselben Werkzeuge, unterschiedliche Inhalte", "The same tools, different content")}</H2>
      <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
        {[[L("Mittelstufe", "Middle school"), [L("Geradengleichungen", "Straight lines"), L("Parabeln", "Parabolas"), L("Ableitung", "Derivative")], NAVY],
          [L("Oberstufe", "Upper school"), [L("Ableitung", "Derivative"), L("Markante Punkte & Eigenschaften", "Key points & properties"), L("Vollständige Kurvendiskussion", "Complete curve sketch")], SILBER]].map(([n, w, f]) => (
          <div key={n} style={{ ...karte, padding: "12px 14px", borderLeft: `4px solid ${f}` }}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: C.hellgrau, marginBottom: 6 }}>{n.toUpperCase()}</p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 8px", fontSize: 13.5, fontWeight: 600, color: NAVY }}>
              {w.map((x, i) => (<React.Fragment key={x}>{i > 0 && <span aria-hidden="true" style={{ color: GOLD, fontWeight: 800 }}>→</span>}<span>{x}</span></React.Fragment>))}
            </div>
          </div>
        ))}
      </div>
      <Absatz>
        {L("Die Methode wird nicht nachträglich auf gewöhnliche Aufgabenblätter gesetzt. Stattdessen sind die Aufgaben von Anfang an so gestaltet, dass sie zugleich die Arbeitsweise trainieren.",
          "The method is not bolted on to ordinary worksheets afterwards. Instead, the tasks are designed from the start so that they train your way of working at the same time.")}
      </Absatz>
      <div style={{ borderRadius: 20, padding: "26px 20px 22px", textAlign: "center", background: `radial-gradient(120% 120% at 85% 0%, #17306B 0%, ${NAVY} 55%, #08173B 100%)`, boxShadow: "0 10px 30px rgba(11,30,74,0.28)" }}>
        <p style={{ fontSize: "clamp(22px, 6.4vw, 28px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2, color: GOLD, marginBottom: 14 }}>
          „{L("System + Freude = Erfolg.", "System + joy = success.")}“
        </p>
        <span aria-hidden="true" style={{ display: "block", width: 44, height: 3, borderRadius: 2, background: GOLD, margin: "0 auto 14px" }} />
        <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.75, color: "#DCE5F5" }}>
          {L("Schreibe nicht nur, um ein Ergebnis zu erhalten. Schreibe so, dass du deinen Denkweg erkennen, verstehen, kontrollieren und daraus lernen kannst.",
            "Don't write just to get a result. Write in a way that lets you see, understand and check your line of thought – and learn from it.")}
        </p>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 24 }}>
        <Knopf breit onClick={() => gehe({ ansicht: "kurse", kurs: "penpaper" })}>{L("Zum Pen-&-Paper-Videokurs", "To the Pen & Paper video course")}</Knopf>
        <button type="button" onClick={() => gehe({ ansicht: "start" })}
          style={{ padding: "13px 20px", borderRadius: 999, border: `1.5px solid ${C.linie}`, background: "#fff", color: NAVY, fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
          {L("Zurück zur Startseite", "Back to the home page")}
        </button>
      </div>
    </div>
  );
}
