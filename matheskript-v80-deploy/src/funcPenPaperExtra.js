/* ======================================================================
   PEN-&-PAPER-KURS: Zusatzinhalte pro Einheit
   Jede der 18 Einheiten bekommt (Kursplan, Abschnitt 5):
     fehler   – ein typisches Fehlerbeispiel mit richtiger Rechnung und Begründung
     transfer – eine leicht veränderte Aufgabe, deren Lösung man aufklappen kann
   Zeilenformat wie in funcPenPaperKurs.jsx: { l, o, r, k } | { t } | { tx }.
   Alle Rechnungen sind nachgerechnet; L(de, en) liefert die Sprache.
   ====================================================================== */

const R = String.raw;

export function baueExtra(L) {
  const probe = L("Probe", "Check");

  const A = [
    /* 1 · Wertetabelle */
    { fehler: {
        falsch: [{ t: R`f(−2) = 2 \cdot (−2) + 1 = −4 + 1 = −5` }],
        richtig: [{ t: R`f(−2) = 2 \cdot (−2) + 1 = −4 + 1 = −3` }],
        warum: L("Vorzeichenfehler verstecken sich in zusammengedrängten Rechnungen. Rechne −4 + 1 bewusst: Von −4 geht es eine Einheit nach rechts, also −3.",
          "Sign errors hide in cramped calculations. Do −4 + 1 deliberately: from −4 you move one step to the right, so −3.") },
      transfer: {
        aufgabe: L("Erstelle die Wertetabelle zu $g(x) = 3x − 2$ für $x = −2$ bis $2$.", "Make the table of values for $g(x) = 3x − 2$ for $x = −2$ to $2$."),
        loesung: [{ t: R`x:\quad −2, \; −1, \; 0, \; 1, \; 2` }, { t: R`g(x):\quad −8, \; −5, \; −2, \; 1, \; 4` }] } },

    /* 2 · Geradengleichung als Termhaus */
    { fehler: {
        falsch: [{ t: R`y = 2x + 1 \;⇒\; m = 1, \; b = 2` }],
        richtig: [{ t: R`y = 2x + 1 \;⇒\; m = 2, \; b = 1` }],
        warum: L("m ist der Faktor vor dem x, b das alleinstehende Termhaus. Wer die Häuser getrennt hinschreibt (2x | 1), sieht sofort, wer wer ist.",
          "m is the factor in front of x, b is the term house standing on its own. If you write the houses apart (2x | 1), you see at once which is which.") },
      transfer: {
        aufgabe: L("Lies Steigung und y-Achsenabschnitt ab und zerlege in Termhäuser: $y = −x + 4$.", "Read off slope and y-intercept and split into term houses: $y = −x + 4$."),
        loesung: [{ t: R`m = −1, \quad b = 4` }, { tx: L("Zwei Termhäuser: −x und 4, dazwischen ein Final Operator (+).", "Two term houses: −x and 4, with one final operator (+) between them.") }] } },

    /* 3 · Umformen, Einsetzen, Kontrollieren */
    { fehler: {
        falsch: [{ t: R`2 \cdot 3 = 6 + 1 = 7` }],
        richtig: [{ l: "f(3)", r: R`2 \cdot 3 + 1` }, { r: R`6 + 1` }, { r: "7" }],
        warum: L("Ein Gleichheitszeichen verbindet nur Gleiches. 6 ist nicht 6 + 1 – die Kette ist falsch, obwohl am Ende 7 herauskommt. Eine Umformung pro Zeile verhindert das.",
          "An equals sign only connects things that are equal. 6 is not 6 + 1 – the chain is wrong even though 7 comes out at the end. One step per line prevents this.") },
      transfer: {
        aufgabe: L("Bestimme die Gerade durch $P(2\\,|\\,1)$ und $Q(4\\,|\\,9)$ und prüfe durch Einsetzen.", "Find the line through $P(2\\,|\\,1)$ and $Q(4\\,|\\,9)$ and check by substituting."),
        loesung: [{ l: "m", r: R`\frac{9 − 1}{4 − 2}` }, { r: R`\frac{8}{2}` }, { r: "4" }, { l: "b", r: R`1 − 4 \cdot 2` }, { r: "−7" },
          { t: "y = 4x − 7" }, { l: "f(4)", r: R`4 \cdot 4 − 7`, k: probe }, { r: R`9 \quad ✓` }] } },

    /* 4 · Parabeln: Potenzen und Termstruktur */
    { fehler: {
        falsch: [{ t: R`(−2)^2 = −4` }],
        richtig: [{ t: R`(−2)^2 = (−2) \cdot (−2) = 4` }],
        warum: L("Die Klammer zeigt: Die Basis ist −2, nicht 2. Minus mal Minus ist Plus. Ohne Klammer gilt dagegen −2² = −4 – deshalb setzt du die Klammer immer.",
          "The bracket shows that the base is −2, not 2. Minus times minus is plus. Without a bracket, −2² = −4 – which is why you always write the bracket.") },
      transfer: {
        aufgabe: L("Berechne $f(−3)$ für $f(x) = x^2 + 2x − 1$.", "Calculate $f(−3)$ for $f(x) = x^2 + 2x − 1$."),
        loesung: [{ l: "f(−3)", r: R`(−3)^2 + 2 \cdot (−3) − 1` }, { r: "9 − 6 − 1" }, { r: "2" }] } },

    /* 5 · Scheitelpunkt und besondere Punkte */
    { fehler: {
        falsch: [{ t: R`(x − 2)^2 − 1 \;⇒\; S(−2\,|\,−1)` }],
        richtig: [{ t: R`(x − 2)^2 − 1 \;⇒\; S(2\,|\,−1)` }],
        warum: L("Der Scheitel liegt dort, wo die Klammer null wird: x − 2 = 0 ergibt x = 2. Das Vorzeichen in der Klammer ist das Gegenteil des x-Wertes.",
          "The vertex is where the bracket becomes zero: x − 2 = 0 gives x = 2. The sign in the bracket is the opposite of the x-value.") },
      transfer: {
        aufgabe: L("Bestimme Scheitelpunkt und Nullstellen von $f(x) = x^2 − 2x − 3$.", "Find the vertex and the zeros of $f(x) = x^2 − 2x − 3$."),
        loesung: [{ l: "f(x)", r: "(x − 1)^2 − 4" }, { t: R`S(1\,|\,−4)` }, { l: R`f(x) = 0`, o: "⇒", r: R`(x − 3)(x + 1) = 0` }, { t: R`x_1 = 3, \quad x_2 = −1` }] } },

    /* 6 · Von der Steigung zur Ableitung */
    { fehler: {
        falsch: [{ t: R`(x + h)^2 = x^2 + h^2` }],
        richtig: [{ t: R`(x + h)^2 = x^2 + 2xh + h^2` }],
        warum: L("(x + h)² heißt (x + h) · (x + h) – das Kreuzglied 2xh gehört dazu. Mit Zahlen siehst du es: (1 + 2)² = 9, aber 1² + 2² = 5.",
          "(x + h)² means (x + h) · (x + h) – the cross term 2xh belongs to it. With numbers you can see it: (1 + 2)² = 9, but 1² + 2² = 5.") },
      transfer: {
        aufgabe: L("Berechne die mittlere Steigung von $f(x) = x^2$ zwischen $x = 1$ und $x = 3$.", "Calculate the average slope of $f(x) = x^2$ between $x = 1$ and $x = 3$."),
        loesung: [{ l: "m", r: R`\frac{f(3) − f(1)}{3 − 1}` }, { r: R`\frac{9 − 1}{2}` }, { r: "4" }] } },

    /* 7 · Ableiten und Final Operators */
    { fehler: {
        falsch: [{ t: R`(3x^2 − 2x + 5)′ = 6x − 2x + 5` }],
        richtig: [{ t: R`(3x^2 − 2x + 5)′ = 6x − 2 + 0 = 6x − 2` }],
        warum: L("Jedes Termhaus wird einzeln abgeleitet – auch (2x)′ = 2 und (5)′ = 0. Wer ein Haus überspringt, behält ein Stück der alten Funktion.",
          "Every term house is differentiated on its own – including (2x)′ = 2 and (5)′ = 0. If you skip a house, a piece of the old function stays behind.") },
      transfer: {
        aufgabe: L("Leite ab: $f(x) = 4x^3 − x^2 + 7x − 2$.", "Differentiate: $f(x) = 4x^3 − x^2 + 7x − 2$."),
        loesung: [{ t: R`(4x^3)′ = 12x^2, \quad (x^2)′ = 2x, \quad (7x)′ = 7, \quad (−2)′ = 0` }, { l: "f′(x)", r: R`12x^2 − 2x + 7` }] } },

    /* 8 · Die Ableitung mit dem Graphen verbinden */
    { fehler: {
        falsch: [{ t: R`f′(2) = 0 \;⇒\; f(2) = 0` }],
        richtig: [{ t: R`f′(2) = 0 \;⇒\; \text{` + L("waagerechte Tangente", "horizontal tangent") + R`}` }, { l: "f(2)", r: R`2^2 − 4 \cdot 2 + 3 = −1` }],
        warum: L("f′(2) = 0 sagt etwas über die Steigung, nicht über die Höhe. Ob der Graph dort die x-Achse trifft, zeigt erst f(2) – hier −1, also der Scheitelpunkt S(2 | −1).",
          "f′(2) = 0 says something about the slope, not about the height. Only f(2) shows whether the graph meets the x-axis there – here −1, i.e. the vertex S(2 | −1).") },
      transfer: {
        aufgabe: L("Wo hat $f(x) = x^2 + 6x + 5$ eine waagerechte Tangente? Gib den Punkt an.", "Where does $f(x) = x^2 + 6x + 5$ have a horizontal tangent? Give the point."),
        loesung: [{ l: "f′(x)", r: "2x + 6" }, { l: R`f′(x) = 0`, o: "⇒", r: "x = −3" }, { l: "f(−3)", r: "9 − 18 + 5 = −4" }, { t: R`(−3\,|\,−4)` }] } },

    /* 9 · Abschluss: Funktion selbstständig untersuchen */
    { fehler: {
        falsch: [{ t: R`x^2 − 6x + 5 = (x − 6)^2 − 31` }],
        richtig: [{ t: R`x^2 − 6x + 5 = (x − 3)^2 − 9 + 5 = (x − 3)^2 − 4` }, { t: R`S(3\,|\,−4)` }],
        warum: L("Beim Ergänzen wird der mittlere Koeffizient halbiert: −6 : 2 = −3. Die Probe durch Ausmultiplizieren entlarvt den Fehler sofort: (x − 6)² − 31 = x² − 12x + 5.",
          "When completing the square you halve the middle coefficient: −6 : 2 = −3. Checking by expanding exposes the mistake at once: (x − 6)² − 31 = x² − 12x + 5.") },
      transfer: {
        aufgabe: L("Untersuche $f(x) = x^2 − 4x − 5$: Scheitelpunkt, Nullstellen und Ableitung.", "Investigate $f(x) = x^2 − 4x − 5$: vertex, zeros and derivative."),
        loesung: [{ l: "f(x)", r: "(x − 2)^2 − 9" }, { t: R`S(2\,|\,−9)` }, { t: R`(x − 5)(x + 1) = 0 \;⇒\; x_1 = 5, \; x_2 = −1` }, { l: "f′(x)", r: "2x − 4" }] } },
  ];

  const B = [
    /* 1 · Ableitungen: Rechenroutine */
    { fehler: {
        falsch: [{ t: R`g′(x) = 6x^2 − 10x + 4 − 1` }],
        richtig: [{ t: R`g′(x) = 6x^2 − 10x + 4 + 0 = 6x^2 − 10x + 4` }],
        warum: L("Eine Konstante hat die Ableitung 0 – das letzte Termhaus verschwindet. Die −1 darf nicht stehen bleiben.",
          "A constant has the derivative 0 – the last term house disappears. The −1 must not stay.") },
      transfer: {
        aufgabe: L("Leite ab: $h(x) = x^4 − 2x^3 + 5x − 7$.", "Differentiate: $h(x) = x^4 − 2x^3 + 5x − 7$."),
        loesung: [{ l: "h′(x)", r: R`4x^3 − 6x^2 + 5` }] } },

    /* 2 · Höhere Ableitungen */
    { fehler: {
        falsch: [{ t: R`f′(x) = 3x^2 − 6x = 6x − 6` }],
        richtig: [{ l: "f′(x)", r: "3x^2 − 6x" }, { l: "f″(x)", r: "6x − 6" }],
        warum: L("Ein Gleichheitszeichen verbindet nur Gleiches: f′ und f″ sind verschiedene Funktionen. Jede Ableitung bekommt ihre eigene Zeile, untereinander ausgerichtet.",
          "An equals sign only connects things that are equal: f′ and f″ are different functions. Every derivative gets its own line, lined up one below the other.") },
      transfer: {
        aufgabe: L("Bilde f′, f″ und f‴ zu $f(x) = x^4 − 2x^2$.", "Find f′, f″ and f‴ for $f(x) = x^4 − 2x^2$."),
        loesung: [{ l: "f′(x)", r: "4x^3 − 4x" }, { l: "f″(x)", r: "12x^2 − 4" }, { l: "f‴(x)", r: "24x" }] } },

    /* 3 · Definitionsbereich, Symmetrie, Nullstellen */
    { fehler: {
        falsch: [{ t: R`x^3 = 3x^2 \;\; | : x^2 \;⇒\; x = 3` }],
        richtig: [{ t: R`x^2(x − 3) = 0` }, { t: R`x_1 = 0 \; (\text{` + L("doppelt", "double") + R`}), \quad x_2 = 3` }],
        warum: L("Beim Teilen durch x² geht die Lösung x = 0 verloren. Ausklammern statt Teilen: Ein Produkt ist null, wenn ein Faktor null ist.",
          "Dividing by x² loses the solution x = 0. Factor out instead of dividing: a product is zero when one factor is zero.") },
      transfer: {
        aufgabe: L("Bestimme die Nullstellen von $f(x) = x^3 − 4x$ und prüfe die Symmetrie.", "Find the zeros of $f(x) = x^3 − 4x$ and check the symmetry."),
        loesung: [{ l: "f(x)", r: "x(x − 2)(x + 2)" }, { t: R`x_1 = 0, \quad x_2 = 2, \quad x_3 = −2` },
          { l: "f(−x)", r: "−x^3 + 4x = −f(x)" }, { tx: L("Also punktsymmetrisch zum Ursprung.", "So it is point-symmetric about the origin.") }] } },

    /* 4 · Extrempunkte: von f′ zu den Punkten */
    { fehler: {
        falsch: [{ t: R`T(2\,|\,f′(2)) = T(2\,|\,0)` }],
        richtig: [{ t: R`T(2\,|\,f(2)) = T(2\,|\,−4)` }],
        warum: L("f′ liefert nur die Kandidaten (die x-Werte). Die Höhe des Punktes kommt immer aus f. f′(2) = 0 ist ja gerade die Bedingung – sie sagt nichts über die y-Koordinate.",
          "f′ only gives the candidates (the x-values). The height of the point always comes from f. f′(2) = 0 is exactly the condition – it says nothing about the y-coordinate.") },
      transfer: {
        aufgabe: L("Bestimme die Extrempunkt-Kandidaten von $f(x) = x^3 − 3x$.", "Find the candidates for extreme points of $f(x) = x^3 − 3x$."),
        loesung: [{ l: "f′(x)", r: "3x^2 − 3" }, { l: R`f′(x) = 0`, o: "⇒", r: R`x = \pm 1` }, { l: "f(1)", r: "−2" }, { l: "f(−1)", r: "2" }, { t: R`(1\,|\,−2), \; (−1\,|\,2)` }] } },

    /* 5 · Klassifizieren und Monotonie */
    { fehler: {
        falsch: [{ t: R`f″(0) = −6 < 0 \;⇒\; \text{` + L("Tiefpunkt", "minimum") + R`}` }],
        richtig: [{ t: R`f″(0) = −6 < 0 \;⇒\; \text{` + L("Hochpunkt", "maximum") + R`}` }],
        warum: L("f″ < 0 heißt: Der Graph ist nach unten gebogen wie ein Hügel – oben sitzt der Gipfel, also ein Hochpunkt.",
          "f″ < 0 means the graph curves downwards like a hill – the peak is at the top, so it is a maximum.") },
      transfer: {
        aufgabe: L("Klassifiziere die Kandidaten von $f(x) = x^3 − 3x$ und gib die Monotonie an.", "Classify the candidates of $f(x) = x^3 − 3x$ and state the monotonicity."),
        loesung: [{ l: "f″(x)", r: "6x" }, { l: "f″(−1)", r: "−6", k: L("Hochpunkt", "maximum") }, { l: "f″(1)", r: "6", k: L("Tiefpunkt", "minimum") },
          { tx: L("Steigend für x < −1 und x > 1, fallend dazwischen.", "Increasing for x < −1 and x > 1, decreasing in between.") }] } },

    /* 6 · Wendepunkte und Krümmung */
    { fehler: {
        falsch: [{ t: R`f(x) = x^4: \quad f″(0) = 0 \;⇒\; \text{` + L("Wendepunkt", "inflection point") + R`}` }],
        richtig: [{ t: R`f″(x) = 12x^2 \ge 0` }, { tx: L("Kein Vorzeichenwechsel von f″ ⇒ kein Wendepunkt.", "No sign change of f″ ⇒ no inflection point.") }],
        warum: L("f″(x) = 0 liefert nur einen Kandidaten. Erst ein Vorzeichenwechsel von f″ (oder f‴ ≠ 0) macht daraus eine Wendestelle.",
          "f″(x) = 0 only gives a candidate. Only a sign change of f″ (or f‴ ≠ 0) turns it into an inflection point.") },
      transfer: {
        aufgabe: L("Bestimme den Wendepunkt von $f(x) = x^3 − 6x^2$.", "Find the inflection point of $f(x) = x^3 − 6x^2$."),
        loesung: [{ l: "f″(x)", r: "6x − 12" }, { l: R`f″(x) = 0`, o: "⇒", r: "x = 2" }, { l: "f‴(2)", r: R`6 \neq 0` }, { l: "f(2)", r: "8 − 24 = −16" }, { t: R`W(2\,|\,−16)` }] } },

    /* 7 · Verhalten im Unendlichen */
    { fehler: {
        falsch: [{ t: R`x \to −\infty \;⇒\; x^3 \to +\infty` }],
        richtig: [{ t: R`x \to −\infty \;⇒\; x^3 \to −\infty` }],
        warum: L("Bei ungeraden Hochzahlen bleibt das Vorzeichen: (−1000)³ = −1 000 000 000. Bei geraden Hochzahlen wird das Ergebnis positiv.",
          "With odd exponents the sign stays: (−1000)³ = −1 000 000 000. With even exponents the result becomes positive.") },
      transfer: {
        aufgabe: L("Wie verhält sich $f(x) = −2x^4 + x^3$ für $x \\to \\pm\\infty$?", "How does $f(x) = −2x^4 + x^3$ behave for $x \\to \\pm\\infty$?"),
        loesung: [{ tx: L("Dominierender Term: −2x⁴ (gerade Hochzahl, negativer Vorfaktor).", "Dominant term: −2x⁴ (even exponent, negative coefficient).") },
          { l: R`x \to \infty`, o: "⇒", r: R`f(x) \to −\infty` }, { l: R`x \to −\infty`, o: "⇒", r: R`f(x) \to −\infty` }] } },

    /* 8 · Vollständige Kurvendiskussion */
    { fehler: {
        falsch: [{ t: R`x − 3 = 0 \;⇒\; x_2 = −3` }],
        richtig: [{ t: R`x − 3 = 0 \;⇒\; x_2 = 3` }, { l: "f(3)", r: R`27 − 27 = 0 \quad ✓`, k: probe }],
        warum: L("Mit der Probe fällt der Vorzeichenfehler sofort auf: f(−3) = −27 − 27 = −54 ≠ 0. Eine Probe kostet zehn Sekunden und rettet Punkte.",
          "With the check the sign error shows up at once: f(−3) = −27 − 27 = −54 ≠ 0. A check takes ten seconds and saves marks.") },
      transfer: {
        aufgabe: L("Untersuche $f(x) = x^3 − 3x$ vollständig – alle Punkte des Protokolls.", "Investigate $f(x) = x^3 − 3x$ completely – every item of the report."),
        loesung: [{ tx: L("D = ℝ; punktsymmetrisch zum Ursprung, denn f(−x) = −f(x).", "D = ℝ; point-symmetric about the origin, since f(−x) = −f(x).") },
          { t: R`x(x^2 − 3) = 0 \;⇒\; x_1 = 0, \; x_{2,3} = \pm\sqrt{3}` },
          { t: R`H(−1\,|\,2), \quad T(1\,|\,−2)` }, { t: R`W(0\,|\,0)` },
          { t: R`x \to \infty \;⇒\; f(x) \to \infty, \quad x \to −\infty \;⇒\; f(x) \to −\infty` }] } },

    /* 9 · Abiturmodus */
    { fehler: {
        falsch: [{ t: R`f′(x) = 0 \;⇒\; x^2 − 4x + 3 = 0 \;⇒\; x_1 = 1, \; x_2 = 4` }],
        richtig: [{ t: R`x^2 − 4x + 3 = (x − 1)(x − 3) = 0 \;⇒\; x_1 = 1, \; x_2 = 3` }, { l: "f′(3)", r: R`27 − 36 + 9 = 0 \quad ✓`, k: probe }],
        warum: L("Unter Zeitdruck passieren Rechenfehler. Setze jeden Kandidaten sofort in f′ ein: f′(4) = 48 − 48 + 9 = 9 ≠ 0 – also kann x = 4 nicht stimmen.",
          "Under time pressure, slips happen. Put every candidate straight into f′: f′(4) = 48 − 48 + 9 = 9 ≠ 0 – so x = 4 cannot be right.") },
      transfer: {
        aufgabe: L("Bestimme für $f(x) = x^3 − 6x^2 + 9x$ die Tangente im Wendepunkt.", "For $f(x) = x^3 − 6x^2 + 9x$, find the tangent at the inflection point."),
        loesung: [{ l: "f″(x)", r: "6x − 12" }, { l: R`f″(x) = 0`, o: "⇒", r: "x = 2" }, { l: "f(2)", r: "8 − 24 + 18 = 2" }, { l: "f′(2)", r: "12 − 24 + 9 = −3" },
          { t: R`y = −3(x − 2) + 2 = −3x + 8` }] } },
  ];

  return { A, B };
}
