/* FORMELSAMMLUNG · ERGÄNZUNGEN 1: Analysis-Reste und Funktionen */
export const ERG_1 = {
  sattel: {
    her: [{ t: "Warum das Vorzeichen von f′ nicht wechselt", s: [
      "Bei einem Sattelpunkt ist $f′(x_0) = 0$, aber $f′$ wechselt das Vorzeichen nicht: Die Funktion steigt (oder fällt) vor und nach $x_0$.",
      "Das Beispiel $f(x) = x^3$ zeigt es: $f′(x) = 3x^2 \\geq 0$ – null nur bei $x = 0$, sonst immer positiv. Der Graph wird bei 0 flach, steigt aber weiter.",
      "Weil $f′$ bei $x_0$ ein Minimum (oder Maximum) hat, ist dort $f″ = 0$ und $f‴ \\neq 0$ – der Sattelpunkt ist eine Wendestelle mit waagerechter Tangente.",
    ] }],
    nutzt: [["monotonie", "f′ wechselt das Vorzeichen nicht"]],
  },
  asymptote: {
    her: [{ t: "Rechnerisch bei gebrochen-rationalen Funktionen", s: [
      "Eine senkrechte Asymptote liegt bei einer Nullstelle des Nenners, die keine Nullstelle des Zählers ist: Der Funktionswert wächst über alle Grenzen, weil durch eine Zahl nahe 0 geteilt wird.",
      "$$\\lim_{x \\to 2} \\frac{1}{x - 2} = \\pm\\infty \\quad \\text{(je nach Seite)}",
      "Eine waagerechte Asymptote folgt aus dem Verhalten für $x \\to \\pm\\infty$: Man teilt Zähler und Nenner durch die höchste Potenz von $x$.",
      "$$\\frac{3x^2 + 1}{x^2 - 4} = \\frac{3 + \\frac{1}{x^2}}{1 - \\frac{4}{x^2}} \\;\\to\\; 3",
    ] }],
    nutzt: [["nullstellen", "Nullstellen des Nenners"]],
  },
  ortskurve: { nutzt: [["extrem", "Extrempunkte als Punktschar"], ["steckbrief", "Parameter bestimmen"]] },
  bestand: { nutzt: [["integralfkt", "Bestand als Integralfunktion"], ["hauptsatz", "Änderungsrate ist die Ableitung"]] },
  mittelwert: {
    her: [{ t: "Mit dem Mittelwertsatz der Integralrechnung", s: [
      "Die stetige Funktion $f$ nimmt auf $[a; b]$ einen kleinsten Wert $m$ und einen größten Wert $M$ an. Damit liegt das Integral zwischen zwei Rechtecken:",
      "$$m(b - a) \\leq \\int_a^b f(x)\\,dx \\leq M(b - a)",
      "Teilt man durch $b - a$, liegt der Mittelwert $\\overline{f}$ zwischen $m$ und $M$. Nach dem Zwischenwertsatz wird er an einer Stelle $\\xi$ tatsächlich angenommen: $f(\\xi) = \\overline{f}$.",
    ] }],
    nutzt: [["mws", "es gibt eine Stelle, an der f den Mittelwert annimmt"]],
  },
  steigung: {
    her: [{ t: "Aus der Geradengleichung", s: [
      "Zwei Punkte $P_1$ und $P_2$ liegen auf $y = mx + b$. Dann gilt $y_1 = mx_1 + b$ und $y_2 = mx_2 + b$.",
      "$$y_2 - y_1 = m(x_2 - x_1) || b fällt beim Subtrahieren heraus",
      "$$m = \\frac{y_2 - y_1}{x_2 - x_1} || für x₂ ≠ x₁",
    ] }],
    nutzt: [["geradengl", "m kommt in der Geradengleichung vor"]],
    falle: "Senkrechte Geraden ($x_1 = x_2$) haben keine Steigung – der Nenner wäre 0.",
  },
  punktsteigung: {
    her: [{ t: "Über die Geradengleichung", s: [
      "Die Gerade hat die Form $y = mx + b$ und geht durch $(x_1 | y_1)$, also $y_1 = mx_1 + b$.",
      "Umgestellt: $b = y_1 - mx_1$. Eingesetzt:",
      "$$y = mx + y_1 - mx_1 = m(x - x_1) + y_1",
    ] }],
    nutzt: [["geradengl", "y = mx + b"]],
  },
  steigungswinkel: {
    her: [{ t: "Steigung als Quotient der Katheten", s: [
      "Läuft man eine Strecke $\\Delta x$ nach rechts und $\\Delta y$ nach oben, entsteht ein rechtwinkliges Dreieck mit dem Winkel $\\alpha$ an der x-Achse.",
      "$$\\tan \\alpha = \\frac{\\Delta y}{\\Delta x} = m",
      "Umkehrung: $\\alpha = \\tan^{-1}(m)$. Bei negativer Steigung ist $\\alpha$ negativ (Gerade fällt); der Schnittwinkel mit der x-Achse ist $|\\alpha|$.",
    ] }],
    bsp: ["$m = 0{,}5$: $\\alpha = \\tan^{-1}(0{,}5) \\approx 26{,}6°$."],
  },
  orthogeraden: {
    her: [{ t: "Mit dem Satz des Pythagoras", s: [
      "Zwei Geraden durch den Ursprung mit Richtungen $(1 | m_1)$ und $(1 | m_2)$ stehen senkrecht, wenn das Dreieck mit den Endpunkten $P_1(1 | m_1)$, $P_2(1 | m_2)$ bei $O$ einen rechten Winkel hat.",
      "$$|OP_1|^2 + |OP_2|^2 = |P_1P_2|^2 \\;\\Rightarrow\\; (1 + m_1^2) + (1 + m_2^2) = (m_1 - m_2)^2",
      "$$2 + m_1^2 + m_2^2 = m_1^2 - 2m_1 m_2 + m_2^2 \\;\\Rightarrow\\; 2 = -2m_1 m_2 \\;\\Rightarrow\\; m_1 m_2 = -1",
    ] }],
    nutzt: [["pythagoras", "rechter Winkel im Dreieck"], ["binom2", "beim Ausmultiplizieren"]],
  },
  schnittpunkt: {
    her: [{ t: "Mit der Differenzfunktion", s: [
      "Die Differenz $d(x) = f(x) - g(x)$ gibt an, wie weit die Graphen senkrecht auseinanderliegen. Ein Schnittpunkt ist ein Punkt, an dem dieser Abstand 0 ist.",
      "Also sind die Schnittstellen genau die Nullstellen von $d$: $d(x) = 0$.",
      "Das erklärt, warum man bei $f(x) = g(x)$ auf eine Gleichung der Form »Term $= 0$« kommt – bei Parabeln mit der pq-Formel, bei Geraden mit einer linearen Gleichung.",
    ] }],
    nutzt: [["nullstellen", "Nullstellen der Differenz"], ["pq", "bei quadratischen Termen"]],
  },
  "parabel-normal": {
    her: [{ t: "Aus der Scheitelform", s: [
      "Multipliziert man $a(x - d)^2 + e$ aus, entsteht:",
      "$$a(x - d)^2 + e = ax^2 - 2adx + (ad^2 + e)",
      "Koeffizientenvergleich mit $ax^2 + bx + c$: $b = -2ad$ und $c = ad^2 + e$. Daraus folgt $d = -\\frac{b}{2a}$ – die Scheitelstelle.",
    ] }],
    nutzt: [["scheitelform", "ausmultipliziert"], ["binom2", "beim Ausmultiplizieren"]],
  },
  linearfaktor: {
    her: [{ t: "Aus der Normalform mit Polynomdivision", s: [
      "Ist $x_1$ Nullstelle von $ax^2 + bx + c$, lässt sich der Linearfaktor $(x - x_1)$ abspalten (Polynomdivision).",
      "$$ax^2 + bx + c = (x - x_1)(ax + r)",
      "Der übrig bleibende lineare Faktor hat ebenfalls eine Nullstelle $x_2$, also $ax + r = a(x - x_2)$ und damit $a(x - x_1)(x - x_2)$.",
    ] }],
    nutzt: [["polydiv", "Linearfaktor abspalten"]],
  },
  potenzfkt: {
    her: [{ t: "Wachstum im Vergleich", s: [
      "Für $x > 1$ wächst $x^n$ mit größerem $n$ schneller: $x^{n+1} = x \\cdot x^n > x^n$, weil $x > 1$.",
      "Für $0 < x < 1$ ist es umgekehrt: Man multipliziert immer wieder mit einer Zahl kleiner 1, der Wert schrumpft.",
      "Alle Graphen schneiden sich in $(0 | 0)$ und $(1 | 1)$, weil $0^n = 0$ und $1^n = 1$ für jedes $n$ gilt.",
    ] }],
    nutzt: [["potenzgesetze", "x^{n+1} = x · xⁿ"]],
  },
  symmetrie: {
    her: [{ t: "Über das Integral und die Ableitung", s: [
      "Ist $f$ achsensymmetrisch ($f(-x) = f(x)$), dann ist $f′$ punktsymmetrisch: Mit der Kettenregel folgt $-f′(-x) = f′(x)$, also $f′(-x) = -f′(x)$.",
      "Umgekehrt ist die Ableitung einer punktsymmetrischen Funktion achsensymmetrisch.",
      "Beim Integrieren hebt sich bei einer punktsymmetrischen Funktion die Fläche links und rechts von 0 auf: $\\int_{-a}^{a} f(x)\\,dx = 0$.",
    ] }],
    nutzt: [["kettenregel", "f(−x) ableiten"], ["integral-sym", "Folgerung für das Integral"]],
  },
  transform: {
    her: [{ t: "Punkte verfolgen", s: [
      "Der Punkt $(u | f(u))$ liegt auf dem Graphen von $f$. Wohin wandert er bei $g(x) = a \\cdot f(b(x - c)) + d$?",
      "Damit der Eingang von $f$ wieder $u$ ist, muss $b(x - c) = u$ gelten, also $x = \\frac{u}{b} + c$.",
      "$$\\left(u | f(u)\\right) \\;\\mapsto\\; \\left(\\frac{u}{b} + c | a \\cdot f(u) + d\\right)",
      "Die x-Koordinate wird durch $b$ geteilt und um $c$ verschoben, die y-Koordinate mit $a$ multipliziert und um $d$ verschoben – so ergibt sich die Reihenfolge der Schritte.",
    ] }],
  },
  umkehrfkt: {
    her: [{ t: "Spiegelung rechnerisch", s: [
      "Die Spiegelung an der Geraden $y = x$ vertauscht die Koordinaten: $(x | y) \\mapsto (y | x)$.",
      "Liegt $(x | y)$ auf dem Graphen von $f$, also $y = f(x)$, dann liegt $(y | x)$ auf dem Spiegelbild. Dieses ist der Graph von $f^{-1}$ mit $f^{-1}(y) = x$.",
      "Die Ableitungen stehen im Kehrwertverhältnis: Wo $f$ die Steigung $m$ hat, hat $f^{-1}$ an der gespiegelten Stelle die Steigung $\\frac{1}{m}$.",
    ] }],
  },
  expfkt: {
    her: [{ t: "Aus dem Bild: Vervielfachen", s: [
      "$f(x+1) = a \\cdot f(x)$ heißt: Die Punkte $(0 | c)$, $(1 | ca)$, $(2 | ca^2)$, … bilden eine geometrische Folge.",
      "Gleiche Schritte in $x$ bringen gleiche Faktoren in $y$ – das Bild zeigt eine Kurve, die immer steiler wird (für $a > 1$).",
      "Umgekehrt für $0 < a < 1$: Der Faktor ist kleiner 1, der Graph fällt und nähert sich der x-Achse, ohne sie zu berühren.",
    ] }],
    nutzt: [["zins", "Zinseszins ist dieselbe Folge"]],
  },
  "wachstum-exp": {
    her: [{ t: "Über die Differentialgleichung", s: [
      "Wächst ein Bestand proportional zu sich selbst, gilt $N′(t) = k \\cdot N(t)$.",
      "Die Funktion $N(t) = N_0 e^{kt}$ erfüllt das: $N′(t) = N_0 k e^{kt} = kN(t)$ und $N(0) = N_0$.",
      "Es gibt keine andere Lösung mit diesem Anfangswert: Für $Q(t) = N(t) e^{-kt}$ folgt $Q′ = N′e^{-kt} - kNe^{-kt} = 0$, also ist $Q$ konstant gleich $N_0$.",
    ] }],
    nutzt: [["produktregel", "Q = N e^{−kt} ableiten"]],
  },
  logfkt: {
    her: [{ t: "Ableitung über die Umkehrregel", s: [
      "$\\ln$ ist die Umkehrfunktion von $e^x$. Mit $y = \\ln x$ gilt $e^y = x$.",
      "Ableiten beider Seiten nach $x$ (Kettenregel): $e^y \\cdot y′ = 1$.",
      "$$y′ = \\frac{1}{e^y} = \\frac{1}{x}",
    ] }],
    nutzt: [["umkehrregel", "Ableitung der Umkehrfunktion"], ["abl-ln", "Ableitung von ln"]],
  },
};
