/* FORMELSAMMLUNG · ERGÄNZUNGEN 5: Rechengesetze, Brüche, Mengen, Logik, Gauß */
export const ERG_5 = {
  kommutativ: {
    her: [{ t: "Zahlenstrahl und Rechteck", s: [
      "Addition: $3 + 5$ heißt, auf dem Zahlenstrahl erst 3, dann 5 Schritte zu gehen. $5 + 3$ geht erst 5, dann 3 – man landet bei derselben Zahl.",
      "Multiplikation: Ein Rechteck aus $a$ Reihen zu $b$ Kästchen ist, um 90° gedreht, $b$ Reihen zu $a$ Kästchen.",
      "Für die Subtraktion funktioniert das nicht: $3 - 5$ ist $-2$, $5 - 3$ ist $2$.",
    ] }],
    nutzt: [["assoziativ", "Partner-Gesetz"]],
  },
  distributiv: {
    her: [{ t: "Mit Zahlen und Ausklammern", s: [
      "$$7 \\cdot 49 = 7 \\cdot (50 - 1) = 350 - 7 = 343",
      "Rückwärts ist das Ausklammern: Steht in jedem Summanden derselbe Faktor, kann man ihn vor die Klammer ziehen: $6x + 9 = 3(2x + 3)$.",
      "Das Distributivgesetz verknüpft Plus und Mal – es ist die Grundlage für die binomischen Formeln und für fast jede Termumformung.",
    ] }],
    nutzt: [["binom1", "Grundlage der binomischen Formeln"], ["nullprodukt", "Ausklammern für das Nullprodukt"]],
  },
  quadrat5: {
    her: [{ t: "Mit der Nachbarzahl", s: [
      "$65^2 = (60 + 5)^2 = 3600 + 2 \\cdot 60 \\cdot 5 + 25 = 3600 + 600 + 25 = 4225$.",
      "Das gemischte Glied $2 \\cdot 10a \\cdot 5 = 100a$ liefert zusammen mit $100a^2$ den Wert $100a(a + 1)$ – deshalb »Zehnerziffer mal ihr Nachfolger«.",
      "Dahinter steht immer 25, weil $5^2 = 25$.",
    ] }],
    nutzt: [["mitte", "ähnlicher Kopfrechentrick"]],
  },
  mitte: {
    her: [{ t: "Als Flächenbild", s: [
      "Ein Quadrat der Seite $m$ hat die Fläche $m^2$. Nimmt man links einen Streifen der Breite $d$ weg und legt ihn oben an, entsteht ein Rechteck $(m - d)(m + d)$ – bis auf ein kleines Eckquadrat $d^2$, das fehlt.",
      "$$38 \\cdot 42 = 40^2 - 2^2 = 1600 - 4 = 1596",
    ] }],
    nutzt: [["quadrat5", "ähnlicher Trick"], ["nahe100", "Abstände nutzen"]],
  },
  "bruch-kuerzen": {
    her: [{ t: "Mit dem Rechteckbild und Rechnung", s: [
      "$\\frac{a}{b} = a : b$. Multipliziert man Dividend und Divisor mit derselben Zahl $k$, ändert sich der Quotient nicht: $(ak) : (bk) = a : b$.",
      "Das ist wie beim Verdoppeln beider Seiten einer Waage – das Verhältnis bleibt.",
      "Beispiel: $\\frac{6}{8} = \\frac{3}{4}$ (gekürzt mit 2), $\\frac{3}{4} = \\frac{9}{12}$ (erweitert mit 3).",
    ] }],
    nutzt: [["teiler", "gemeinsame Teiler von Zähler und Nenner"], ["lineargl", "Äquivalenzumformung"]],
    falle: "Nur Faktoren kürzen – bei Summen muss man erst ausklammern.",
  },
  "bruch-add": {
    her: [{ t: "Mit dem Hauptnenner", s: [
      "Der kleinste gemeinsame Nenner ist das kgV der Nenner. Er hält die Zahlen klein.",
      "$$\\frac{5}{12} + \\frac{3}{8} = \\frac{10}{24} + \\frac{9}{24} = \\frac{19}{24} || kgV(12; 8) = 24",
      "Dieselbe Idee beim Subtrahieren: gleiche Stücke abziehen.",
    ] }],
    nutzt: [["teiler", "kgV aus der Primfaktorzerlegung"]],
  },
  "bruch-mul": {
    her: [{ t: "Mit dem Dreisatz", s: [
      "$\\frac{a}{b}$ von einer Größe $G$: erst durch $b$ teilen, dann mal $a$. Dann ist $\\frac{c}{d}$ von $\\frac{a}{b}$:",
      "$$\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{a}{b} \\cdot c : d = \\frac{a \\cdot c}{b \\cdot d}",
      "Beim Kürzen vor dem Multiplizieren darf man über Kreuz kürzen: $\\frac{4}{9} \\cdot \\frac{3}{8} = \\frac{1}{3} \\cdot \\frac{1}{2} = \\frac{1}{6}$.",
    ] }],
    nutzt: [["bruch-kuerzen", "über Kreuz kürzen"], ["prozent", "Anteil von einem Anteil"]],
  },
  prozent: {
    her: [{ t: "Mit dem Dreisatz", s: [
      "100 % entsprechen dem Grundwert $G$. Dann entspricht 1 % dem Wert $\\frac{G}{100}$ und $p$ % dem Wert $p \\cdot \\frac{G}{100}$.",
      "$$W = \\frac{G}{100} \\cdot p = G \\cdot \\frac{p}{100}",
      "Prozentuale Änderung: $G \\to G(1 + \\frac{p}{100})$. Mehrere Änderungen hintereinander multiplizieren sich.",
    ] }],
    nutzt: [["zins", "wiederholte Prozentrechnung"]],
  },
  teilmenge: {
    her: [{ t: "Zeichnen und prüfen", s: [
      "Im Venn-Diagramm liegt die Menge $A$ ganz innerhalb von $B$. Jedes Element von $A$ ist dann automatisch in $B$.",
      "Gleichheit zweier Mengen beweist man in zwei Schritten: $A \\subseteq B$ und $B \\subseteq A$.",
    ] }],
    nutzt: [["element", "x ∈ A, dann x ∈ B"], ["aequivalenz", "gegenseitige Teilmengen"]],
  },
  vereinigung: {
    her: [{ t: "Zahlenbeispiel", s: [
      "$A = \\{1; 2; 3\\}$ und $B = \\{3; 4\\}$. Die Vereinigung enthält alles, was in mindestens einer Menge liegt: $\\{1; 2; 3; 4\\}$.",
      "Die 3 steht nur einmal da – Mengen zählen Elemente nicht doppelt. Deshalb gilt $|A \\cup B| = |A| + |B| - |A \\cap B|$.",
    ] }],
    nutzt: [["additionssatz", "Anzahlformel mit Abzug des Schnitts"]],
  },
  schnittmenge: {
    her: [{ t: "Zahlenbeispiel", s: [
      "$A = \\{1; 2; 3\\}$ und $B = \\{3; 4\\}$: Nur die 3 liegt in beiden, also $A \\cap B = \\{3\\}$.",
      "Haben $A$ und $B$ kein gemeinsames Element, ist der Schnitt leer: $A \\cap B = \\emptyset$ – die Mengen sind disjunkt.",
    ] }],
    nutzt: [["leeremenge", "disjunkte Mengen"]],
  },
  differenzmenge: {
    her: [{ t: "Zahlenbeispiel", s: [
      "$A = \\{1; 2; 3\\}$, $B = \\{3; 4\\}$: $A \\setminus B = \\{1; 2\\}$ – die 3 gehört zu $B$ und fällt weg.",
      "Anders als Vereinigung und Schnitt ist die Differenz nicht symmetrisch: $B \\setminus A = \\{4\\}$.",
    ] }],
    nutzt: [["demorgan-m", "Komplement als Differenz zur Grundmenge"]],
  },
  "demorgan-m": {
    her: [{ t: "Mit dem Venn-Diagramm", s: [
      "Färbe in einem Venn-Diagramm das Komplement von $A \\cup B$: Es bleibt nur der Bereich außerhalb beider Kreise.",
      "Färbe dann $\\overline{A}$ und $\\overline{B}$ und bilde den Schnitt: Es ist genau derselbe Bereich außerhalb beider Kreise.",
    ] }],
    nutzt: [["vereinigung", "Vereinigung"], ["schnittmenge", "Schnitt"]],
  },
  undoder: {
    her: [{ t: "Alltag und Mathematik", s: [
      "»Ich nehme Tee oder Kaffee« meint im Alltag oft: eins von beiden. In der Mathematik ist $A \\lor B$ auch wahr, wenn beide wahr sind.",
      "Das ausschließende »entweder … oder« ist wahr, wenn genau eine der beiden Aussagen wahr ist.",
      "Und/Oder sind wie Schnitt/Vereinigung bei Mengen – die Wahrheitstafeln entsprechen den Venn-Diagrammen.",
    ] }],
    nutzt: [["vereinigung", "Oder entspricht ∪"], ["schnittmenge", "Und entspricht ∩"]],
  },
  implikation: {
    her: [{ t: "Als Mengen-Aussage", s: [
      "$A \\Rightarrow B$ bedeutet: Wo $A$ gilt, gilt auch $B$. Als Mengen: Die Fälle, in denen $A$ gilt, liegen alle in der Menge der Fälle, in denen $B$ gilt.",
      "Das ist die Teilmengenbeziehung – deshalb ist $x \\in A \\Rightarrow x \\in B$ die Definition von $A \\subseteq B$.",
    ] }],
    nutzt: [["teilmenge", "A ⊆ B bedeutet A ⇒ B"]],
  },
  kontraposition: {
    her: [{ t: "Über die Teilmengen", s: [
      "$A \\Rightarrow B$ bedeutet: Die Menge der $A$-Fälle liegt in der Menge der $B$-Fälle.",
      "Dann liegt auch alles außerhalb von $B$ außerhalb von $A$ – das ist $\\neg B \\Rightarrow \\neg A$.",
      "Im Beweis nutzt man das, wenn »nicht $B$« leichter zu greifen ist: $n^2$ ungerade ⇒ $n$ ungerade ist leichter als umgekehrt.",
    ] }],
    nutzt: [["teilmenge", "Komplemente drehen die Teilmengenbeziehung um"], ["demorgan-m", "Komplementbildung"]],
  },
  "demorgan-l": {
    her: [{ t: "Mit dem Alltag", s: [
      "»Es ist nicht wahr, dass es regnet und kalt ist« heißt: Es regnet nicht oder es ist nicht kalt.",
      "Ebenso: $\\neg(A \\lor B) \\Leftrightarrow \\neg A \\land \\neg B$ – »weder … noch« heißt »nicht … und nicht …«.",
      "Als Mengen ist das die De-Morgan-Regel des Komplements.",
    ] }],
    nutzt: [["demorgan-m", "dieselbe Regel für Mengen"]],
  },
  gauss: {
    her: [{ t: "Warum die Umformungen die Lösung nicht ändern", s: [
      "Jede Zeile ist eine Gleichung. Zwei Gleichungen zu addieren (oder eine mit einer Zahl ≠ 0 zu multiplizieren) erzeugt eine Gleichung, die jede gemeinsame Lösung ebenfalls erfüllt.",
      "Weil man jede Umformung umkehren kann (subtrahieren, durch die Zahl teilen), gewinnt man keine neuen Lösungen hinzu – die Lösungsmenge bleibt dieselbe.",
      "Deshalb ist die Stufenform gleichwertig zum Ausgangssystem.",
    ] }],
    nutzt: [["aequivalenz", "Äquivalenzumformungen"], ["lgs-loesbar", "Lösbarkeit in der Stufenform"]],
  },
  teiler: {
    her: [{ t: "Eindeutigkeit der Zerlegung", s: [
      "Man kann zeigen: Jede natürliche Zahl größer 1 hat genau eine Zerlegung in Primfaktoren (bis auf die Reihenfolge). Das ist der Hauptsatz der Arithmetik.",
      "Beispiel: $360 = 2 \\cdot 2 \\cdot 2 \\cdot 3 \\cdot 3 \\cdot 5$ – egal, womit man anfängt zu teilen, am Ende stehen dieselben Primzahlen.",
      "Aus der Eindeutigkeit folgt etwa: $\\sqrt{2}$ ist irrational – in $p^2 = 2q^2$ stünde links eine gerade und rechts eine ungerade Anzahl von Faktoren 2.",
    ] }],
    nutzt: [["potenzgesetze", "Primfaktoren zählen"]],
  },
};
