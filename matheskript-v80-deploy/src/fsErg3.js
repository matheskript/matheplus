/* FORMELSAMMLUNG · ERGÄNZUNGEN 3: Stochastik */
export const ERG_3 = {
  laplace: {
    her: [{ t: "Aus der Gleichwahrscheinlichkeit", s: [
      "Bei einem Laplace-Experiment haben alle $|\\Omega|$ Ergebnisse dieselbe Wahrscheinlichkeit $p$.",
      "Die Wahrscheinlichkeiten aller Ergebnisse addieren sich zu 1: $|\\Omega| \\cdot p = 1$, also $p = \\frac{1}{|\\Omega|}$.",
      "Ein Ereignis $A$ besteht aus $|A|$ Ergebnissen, jedes mit Wahrscheinlichkeit $\\frac{1}{|\\Omega|}$: $P(A) = |A| \\cdot \\frac{1}{|\\Omega|} = \\frac{|A|}{|\\Omega|}$.",
    ] }],
    nutzt: [["additionssatz", "Wahrscheinlichkeiten disjunkter Ergebnisse addieren"]],
    falle: "Nur anwenden, wenn wirklich alle Ergebnisse gleich wahrscheinlich sind – bei zwei Würfeln ist »Summe 7« nicht so wahrscheinlich wie »Summe 12«.",
  },
  relhaeuf: {
    her: [{ t: "Gesetz der großen Zahlen als Bild", s: [
      "Bei $n$ Versuchen mit Trefferwahrscheinlichkeit $p$ ist die Trefferzahl binomialverteilt mit Erwartungswert $np$ und Standardabweichung $\\sqrt{np(1-p)}$.",
      "Die relative Häufigkeit ist die Trefferzahl geteilt durch $n$: Erwartungswert $p$, Standardabweichung $\\frac{\\sqrt{p(1-p)}}{\\sqrt{n}}$.",
      "Die Streuung schrumpft mit $\\frac{1}{\\sqrt{n}}$ – für 100-mal so viele Versuche wird sie 10-mal kleiner. Das erklärt, warum sich $h_n$ bei großem $n$ kaum noch von $p$ unterscheidet.",
    ] }],
    nutzt: [["binom-ew", "Erwartungswert und Streuung der Trefferzahl"], ["sigma", "Streuung"]],
  },
  gegenereignis: {
    her: [{ t: "Über Laplace", s: [
      "Bei einem Laplace-Experiment gilt $|A| + |\\overline{A}| = |\\Omega|$, denn jedes Ergebnis liegt in genau einem von beiden.",
      "$$P(A) + P(\\overline{A}) = \\frac{|A|}{|\\Omega|} + \\frac{|\\overline{A}|}{|\\Omega|} = \\frac{|\\Omega|}{|\\Omega|} = 1",
    ] }],
    nutzt: [["laplace", "Ergebnisse zählen"]],
    bsp: ["Mindestens eine Sechs bei 3 Würfen: $1 - \\left(\\frac{5}{6}\\right)^3 \\approx 0{,}42$."],
  },
  additionssatz: {
    her: [{ t: "Mit der Vier-Felder-Tafel", s: [
      "Zerlege $A \\cup B$ in drei disjunkte Teile: nur $A$, nur $B$, beides: $P(A \\cap \\overline{B})$, $P(\\overline{A} \\cap B)$, $P(A \\cap B)$.",
      "$$P(A) = P(A \\cap \\overline{B}) + P(A \\cap B), \\quad P(B) = P(\\overline{A} \\cap B) + P(A \\cap B)",
      "Addiert man $P(A) + P(B)$, steckt $P(A \\cap B)$ doppelt drin – einmal abziehen:",
      "$$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)",
    ] }],
    nutzt: [["vierfelder", "A in zwei disjunkte Teile zerlegt"], ["schnittmenge", "Doppelt Gezähltes"]],
  },
  pfadregeln: {
    her: [{ t: "Mit der bedingten Wahrscheinlichkeit", s: [
      "Die zweite Stufe gibt die bedingte Wahrscheinlichkeit an: $P_A(B) = \\frac{P(A \\cap B)}{P(A)}$.",
      "Umgestellt ist das die Produktregel entlang eines Pfades: $P(A \\cap B) = P(A) \\cdot P_A(B)$.",
      "Die Summenregel kommt daher, dass verschiedene Pfade verschiedene Ergebnisse sind – sie schließen einander aus, ihre Wahrscheinlichkeiten addieren sich.",
    ] }],
    nutzt: [["bedingt", "zweite Stufe ist bedingt"], ["additionssatz", "disjunkte Pfade addieren"]],
  },
  vierfelder: {
    her: [{ t: "Mit absoluten Zahlen", s: [
      "Stelle dir 1000 Personen vor und trage die Anzahlen statt der Wahrscheinlichkeiten ein. Die Summe jeder Zeile und Spalte stimmt – das ist leichter zu überblicken.",
      "Eine bedingte Wahrscheinlichkeit liest man als Anteil ab: $P_B(A)$ ist die Zahl im Feld »$A$ und $B$« geteilt durch die Spaltensumme von $B$.",
      "Die Tafel ist damit ein Baumdiagramm in anderer Form – man kann in beide Richtungen umrechnen (Satz von Bayes).",
    ] }],
    nutzt: [["bedingt", "Anteil in der Spalte"]],
  },
  totale: {
    her: [{ t: "Über die Vier-Felder-Tafel", s: [
      "$B$ zerfällt in zwei disjunkte Teile: $B \\cap A$ und $B \\cap \\overline{A}$.",
      "$$P(B) = P(B \\cap A) + P(B \\cap \\overline{A})",
      "Jeder Teil ist ein Pfad: $P(B \\cap A) = P(A) \\cdot P_A(B)$ und $P(B \\cap \\overline{A}) = P(\\overline{A}) \\cdot P_{\\overline{A}}(B)$. Einsetzen liefert die Formel.",
    ] }],
    nutzt: [["vierfelder", "B in zwei Teile zerlegt"], ["pfadregeln", "Produkt entlang des Pfads"]],
  },
  bayes: {
    her: [{ t: "Mit absoluten Zahlen (Natürliche Häufigkeiten)", s: [
      "Krankheit mit 1 % Häufigkeit, Test erkennt 90 % der Kranken, 5 % falscher Alarm. Bei 10 000 Personen: 100 sind krank, 90 davon testen positiv; 9 900 sind gesund, 495 davon testen positiv.",
      "Positive insgesamt: $90 + 495 = 585$. Davon wirklich krank: $\\frac{90}{585} \\approx 15{,}4\\,\\%$.",
      "Das ist der Satz von Bayes in Zahlen: Zähler = Pfad »krank und positiv«, Nenner = alle Wege zu »positiv«.",
    ] }],
    nutzt: [["totale", "Nenner ist die totale Wahrscheinlichkeit"], ["vierfelder", "natürliche Häufigkeiten in der Tafel"]],
    falle: "$P_A(B)$ und $P_B(A)$ nicht verwechseln: Die Wahrscheinlichkeit für ein positives Ergebnis bei Kranken ist nicht die Wahrscheinlichkeit, bei positivem Test krank zu sein.",
  },
  unabh: { nutzt: [["pfadregeln", "Pfadregel ohne Einfluss der ersten Stufe"], ["laplace", "Beispiel: zwei Münzwürfe"]] },
  fakultaet: {
    her: [{ t: "Mit vollständiger Induktion", s: [
      "Behauptung: $n$ verschiedene Dinge lassen sich auf $n!$ Weisen anordnen. Anfang: Ein Ding hat $1! = 1$ Anordnung.",
      "Schritt: Sind für $n$ Dinge $n!$ Anordnungen bekannt, kann man das $(n+1)$-te Ding an $n + 1$ Stellen einfügen.",
      "$$(n + 1) \\cdot n! = (n + 1)!",
    ] }],
    nutzt: [["induktion", "Anordnungen von n + 1 Dingen"]],
    bsp: ["Vier Personen in einer Reihe: $4! = 24$ Möglichkeiten."],
  },
  "komb-mm": {
    her: [{ t: "Mit dem Baumdiagramm", s: [
      "Zeichne einen Baum: Auf der ersten Stufe gibt es $n$ Äste, an jedem hängen wieder $n$ Äste, usw. bis zur $k$-ten Stufe.",
      "Die Anzahl der Pfade ist das Produkt der Astzahlen aller Stufen: $n \\cdot n \\cdots n = n^k$.",
      "Beispiel: Ein vierstelliger PIN hat $10^4 = 10\\,000$ Möglichkeiten.",
    ] }],
    nutzt: [["pfadregeln", "Pfade im Baum zählen"]],
  },
  "komb-mo": {
    her: [{ t: "Aus den Permutationen", s: [
      "Alle $n!$ Anordnungen von $n$ Dingen. Betrachtet man nur die ersten $k$ Plätze, zählt jede Auswahl mehrfach – nämlich für alle $(n-k)!$ Anordnungen der restlichen Dinge.",
      "$$\\frac{n!}{(n-k)!} = n \\cdot (n-1) \\cdots (n-k+1)",
      "Die Produktdarstellung erklärt sich so: Für den ersten Platz $n$ Möglichkeiten, für den zweiten noch $n - 1$, …, für den $k$-ten noch $n - k + 1$.",
    ] }],
    nutzt: [["fakultaet", "Anordnungen des Rests kürzen sich weg"]],
  },
  "komb-om": { nutzt: [["binomkoeff", "Sterne und Striche zählen mit n über k"], ["komb-mm", "Gegenstück mit Reihenfolge"]] },
  hypergeom: {
    her: [{ t: "Über die Pfadregel", s: [
      "Ziehe nacheinander ohne Zurücklegen. Für eine feste Reihenfolge (erst alle $k$ Treffer, dann die Nieten) ist die Wahrscheinlichkeit ein Produkt von Brüchen mit kleiner werdendem Zähler und Nenner.",
      "Die $k$ Treffer können an $\\binom{n}{k}$ Stellen der Ziehung stehen. Alle Reihenfolgen haben dieselbe Wahrscheinlichkeit.",
      "Ausgeschrieben ergibt sich dasselbe wie $\\frac{\\binom{M}{k}\\binom{N-M}{n-k}}{\\binom{N}{n}}$.",
    ] }],
    nutzt: [["pfadregeln", "Ziehen als Pfad"], ["bernoulli", "Vergleich mit Zurücklegen"]],
  },
  erwartungswert: {
    her: [{ t: "Mit relativen Häufigkeiten", s: [
      "Spielt man $n$-mal, tritt der Wert $x_i$ etwa $n \\cdot p_i$-mal auf. Der Durchschnitt über alle Spiele ist:",
      "$$\\frac{x_1 \\cdot np_1 + x_2 \\cdot np_2 + \\ldots}{n} = x_1 p_1 + x_2 p_2 + \\ldots",
      "Für großes $n$ nähert sich dieser Durchschnitt dem Erwartungswert – das Gesetz der großen Zahlen.",
    ] }],
    nutzt: [["relhaeuf", "Häufigkeiten werden zu Wahrscheinlichkeiten"]],
  },
  fair: {
    her: [{ t: "Ein Rechenbeispiel", s: [
      "Einsatz 2 €. Bei einer Sechs gibt es 9 €, sonst nichts. Gewinn: $+7$ € mit $\\frac{1}{6}$, $-2$ € mit $\\frac{5}{6}$.",
      "$$E = 7 \\cdot \\frac{1}{6} - 2 \\cdot \\frac{5}{6} = \\frac{7 - 10}{6} = -0{,}5",
      "Im Schnitt verliert man 0,50 € pro Spiel – das Spiel ist nicht fair. Für Fairness müsste der Auszahlungsbetrag auf 12 € steigen: $10 \\cdot \\frac{1}{6} - 2 \\cdot \\frac{5}{6} = 0$.",
    ] }],
    nutzt: [["erwartungswert", "Gewinn gewichtet mit Wahrscheinlichkeit"], ["gegenereignis", "Gewinn und Verlust"]],
  },
  sigma: {
    her: [{ t: "Zahlenbeispiel", s: [
      "Münzwurf mit Einsatz 1 €: Gewinn $+1$ oder $-1$, jeweils mit $\\frac{1}{2}$. $\\mu = 0$.",
      "$$V = (1 - 0)^2 \\cdot \\frac{1}{2} + (-1 - 0)^2 \\cdot \\frac{1}{2} = 1, \\quad \\sigma = \\sqrt{1} = 1",
      "Die Standardabweichung ist wieder in Euro: Ein typischer Gewinn weicht etwa 1 € vom Erwartungswert ab.",
    ] }],
    nutzt: [["varianz", "σ ist die Wurzel der Varianz"], ["erwartungswert", "μ im Beispiel"]],
  },
  bernoulli: {
    her: [{ t: "Aus der Hypergeometrischen Verteilung", s: [
      "Zieht man mit Zurücklegen, bleibt die Trefferwahrscheinlichkeit bei jedem Zug $p$. Jeder Pfad mit $k$ Treffern hat die Wahrscheinlichkeit $p^k(1-p)^{n-k}$.",
      "Die Anzahl der Pfade mit genau $k$ Treffern ist $\\binom{n}{k}$ – die Zahl der Möglichkeiten, $k$ Plätze für die Treffer auszuwählen.",
      "Weil alle diese Pfade einander ausschließen, addieren sich ihre Wahrscheinlichkeiten: $\\binom{n}{k}p^k(1-p)^{n-k}$.",
    ] }],
    nutzt: [["binomkoeff", "Zahl der Pfade"], ["pfadregeln", "Wahrscheinlichkeit eines Pfades"]],
  },
  kumuliert: {
    her: [{ t: "Mit der Summe aller Wahrscheinlichkeiten", s: [
      "Die Wahrscheinlichkeiten aller Werte $0, 1, \\ldots, n$ addieren sich zu 1.",
      "$$P(X \\leq k-1) + P(X \\geq k) = 1 \\;\\Rightarrow\\; P(X \\geq k) = 1 - P(X \\leq k-1)",
      "Der Taschenrechner liefert meist nur $P(X \\leq k)$. Deshalb formt man »mindestens«, »mehr als«, »zwischen« so um, dass nur noch dieser Wert vorkommt.",
    ] }],
    nutzt: [["gegenereignis", "P(Ā) = 1 − P(A)"]],
  },
  sigmaregeln: {
    her: [{ t: "Vergleich mit der Normalverteilung", s: [
      "Für große $n$ nähert sich die Binomialverteilung einer Glockenkurve mit Mittelwert $\\mu$ und Standardabweichung $\\sigma$ (Satz von de Moivre-Laplace).",
      "Bei der Normalverteilung liegen etwa 68,3 % der Werte innerhalb von $\\sigma$, 95,4 % innerhalb von $2\\sigma$ und 99,7 % innerhalb von $3\\sigma$.",
      "Daran erkennt man, wann ein Ergebnis »auffällig« ist: Weicht es mehr als $2\\sigma$ vom Erwartungswert ab, ist das nur in etwa 5 % der Fälle zu erwarten.",
    ] }],
    nutzt: [["binom-ew", "μ und σ der Binomialverteilung"], ["hypotest", "Grundlage für Ablehnungsbereiche"]],
  },
  fehlerarten: {
    her: [{ t: "Mit einem Beispiel", s: [
      "Ein Test prüft, ob eine Münze fair ist ($H_0$: $p = 0{,}5$). Fehler 1. Art: Man hält die Münze für gezinkt, obwohl sie fair ist.",
      "Fehler 2. Art: Man hält sie für fair, obwohl sie gezinkt ist.",
      "Verkleinert man den Ablehnungsbereich, wird $\\alpha$ kleiner – aber $\\beta$ größer. Beide Fehler gleichzeitig kann man nur mit mehr Versuchen klein halten.",
    ] }],
    nutzt: [["hypotest", "Ablehnungsbereich bestimmt α und β"], ["bernoulli", "α und β mit der Binomialverteilung"]],
  },
};
