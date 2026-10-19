/* FORMELSAMMLUNG · Neue Oberstufen-Einträge (jeweils mit Feld bereich)
   Normalverteilung, Hypothesentest, Kurvendiskussion, Wachstum, Vektoren.
   Aufbau der Einträge: siehe fsAnalysis.js */

export const FS_OBER_NEU = [
  /* ---------------- Stochastik · Normalverteilung ---------------- */
  {
    bereich: "stochastik", id: "normalverteilung", g: "Normalverteilung", n: "Dichte der Normalverteilung", st: "ober", kl: 12,
    f: "\\varphi(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\cdot e^{-\\frac{1}{2}\\left(\\frac{x - \\mu}{\\sigma}\\right)^2}",
    k: "Gaußsche Glockenkurve · Wahrscheinlichkeiten sind Flächen unter dem Graphen",
    bild: ["normalKurve", { modus: "dichte" }],
    foto: {
      titel: "Die Glocke auf dem Zehn-Mark-Schein",
      src: "/gauss/zehn-mark-schein.webp", breite: 600, hoehe: 308,
      alt: "Zehn-Mark-Schein der Deutschen Bundesbank mit dem Porträt von Carl Friedrich Gauß und einer Glockenkurve mit Formel",
      unter: "Zehn-Mark-Schein der Deutschen Bundesbank (Datum 1. Oktober 1993) mit Carl Friedrich Gauß, 1777–1855. Links neben ihm steht die Glockenkurve, nach ihm Gaußsche Glockenkurve genannt. Mehr zu Gauß unter Mathe entdecken.",
    },
    her: [
      { t: "Woher kommt die Glocke?", s: [
        "Für großes $n$ werden die Histogramme der Binomialverteilung immer glatter und glockenförmig. Ihr Umriss ist eine stetige Funktion – die Dichtefunktion.",
        "Die Grundform $\\varphi(z) = \\frac{1}{\\sqrt{2\\pi}} \\, e^{-\\frac{1}{2} z^2}$ ist symmetrisch zu 0, hat dort ihr Maximum und fällt nach beiden Seiten schnell ab. Der Vorfaktor sorgt dafür, dass die Gesamtfläche genau 1 ist.",
        "Mit $z = \\frac{x - \\mu}{\\sigma}$ wird die Glocke um $\\mu$ verschoben und um den Faktor $\\sigma$ in die Breite gezogen. Damit die Fläche 1 bleibt, muss die Höhe durch $\\sigma$ geteilt werden:",
        "$$\\varphi(x) = \\frac{1}{\\sigma} \\cdot \\frac{1}{\\sqrt{2\\pi}} \\, e^{-\\frac{1}{2}\\left(\\frac{x - \\mu}{\\sigma}\\right)^2} || Breite mal σ, Höhe durch σ",
        "Wahrscheinlichkeiten sind Flächen: $P(a \\leq X \\leq b) = \\int_a^b \\varphi(x) \\, dx$. Ein einzelner Wert hat deshalb die Wahrscheinlichkeit 0.",
      ] },
      { t: "Hochpunkt und Wendestellen", s: [
        "Mit der Kettenregel gilt $\\varphi′(x) = -\\frac{x - \\mu}{\\sigma^2} \\cdot \\varphi(x)$. Da $\\varphi(x) > 0$, ist $\\varphi′(x) = 0$ nur für $x = \\mu$ – dort liegt der Hochpunkt.",
        "$$\\varphi″(x) = \\left(\\frac{(x - \\mu)^2}{\\sigma^4} - \\frac{1}{\\sigma^2}\\right) \\cdot \\varphi(x) || Produktregel",
        "$\\varphi″(x) = 0$ genau für $(x - \\mu)^2 = \\sigma^2$, also $x = \\mu \\pm \\sigma$. Die Wendestellen liegen eine Standardabweichung links und rechts vom Erwartungswert.",
      ] },
    ],
    bsp: [
      "IQ-Werte: $\\mu = 100$, $\\sigma = 15$.",
      "Höhe der Glocke: $\\varphi(100) = \\frac{1}{15\\sqrt{2\\pi}} \\approx 0{,}0266$.",
      "Wendestellen bei 85 und 115; dazwischen liegen etwa 68,3 % aller Werte.",
    ],
    falle: "$\\varphi(x)$ ist keine Wahrscheinlichkeit, sondern eine Dichte – Wahrscheinlichkeiten sind Flächen. Es gilt $P(X = 100) = 0$, obwohl $\\varphi(100) > 0$ ist.",
    nutzt: [["sigma", "σ bestimmt die Breite der Glocke"], ["abl-exp", "Kurvendiskussion einer e-Funktion"], ["hauptsatz", "Wahrscheinlichkeit als Integral"]],
    syn: "gauß gaußsche glockenkurve glocke dichte dichtefunktion stetige zufallsgröße",
  },
  {
    bereich: "stochastik", id: "normal-standard", g: "Normalverteilung", n: "Standardisieren", st: "ober", kl: 12,
    f: "z = \\frac{x - \\mu}{\\sigma}, \\quad P(X \\leq x) = \\Phi(z)",
    k: "jede Normalverteilung auf μ = 0 und σ = 1 zurückführen · Φ aus Tabelle oder Rechner",
    bild: ["normalKurve", { modus: "standard" }],
    her: [
      { t: "Verschieben und Stauchen", s: [
        "Zieht man von jedem Wert $\\mu$ ab, liegt die Mitte der Glocke bei 0. Teilt man danach durch $\\sigma$, hat die Glocke die Breite 1.",
        "$$Z = \\frac{X - \\mu}{\\sigma} || neue Zufallsgröße",
        "Mit den Regeln für $aX + b$: $E(Z) = \\frac{E(X) - \\mu}{\\sigma} = 0$ und $V(Z) = \\frac{V(X)}{\\sigma^2} = 1$.",
        "Die Fläche bis $x$ unter der alten Glocke ist dieselbe wie die Fläche bis $z$ unter der Standardglocke. Diese Fläche heißt $\\Phi(z)$.",
      ] },
      { t: "Symmetrie ausnutzen", s: [
        "Die Standardglocke ist symmetrisch zu 0. Die Fläche links von $-z$ ist so groß wie die Fläche rechts von $z$:",
        "$$\\Phi(-z) = 1 - \\Phi(z)",
        "Darum reichen Tabellen mit positiven $z$-Werten.",
      ] },
    ],
    bsp: [
      "Körpergröße: $\\mu = 170\\,\\text{cm}$, $\\sigma = 8\\,\\text{cm}$.",
      "$P(X \\leq 186)$: $z = \\frac{186 - 170}{8} = 2$, also $\\Phi(2) \\approx 0{,}977$.",
      "$P(X > 162)$: $z = -1$, also $1 - \\Phi(-1) = \\Phi(1) \\approx 0{,}841$.",
    ],
    falle: "Durch $\\sigma$ teilen, nicht durch die Varianz: Bei $\\sigma^2 = 64$ ist $z = \\frac{x - \\mu}{8}$, nicht $\\frac{x - \\mu}{64}$.",
    nutzt: [["normalverteilung", "Glocke mit μ und σ"], ["ew-linear", "E und V von aX + b"], ["transform", "Verschieben und Strecken eines Graphen"]],
    syn: "z-wert standardnormalverteilung phi tabelle standardisierung",
  },
  {
    bereich: "stochastik", id: "normal-sigma", g: "Normalverteilung", n: "Sigma-Umgebungen der Normalverteilung", st: "ober", kl: 12,
    f: "P(\\mu - \\sigma \\leq X \\leq \\mu + \\sigma) \\approx 68{,}3\\,\\%",
    k: "1σ ≈ 68,3 % · 2σ ≈ 95,4 % · 3σ ≈ 99,7 % · 1,96σ = 95 %",
    bild: ["normalKurve", { modus: "sigma" }],
    her: { t: "Aus der Standardglocke ablesen", s: [
      "Standardisieren macht aus $\\mu \\pm \\sigma$ das Intervall $[-1; 1]$, aus $\\mu \\pm 2\\sigma$ das Intervall $[-2; 2]$.",
      "$$P(-1 \\leq Z \\leq 1) = \\Phi(1) - \\Phi(-1) = 2\\Phi(1) - 1 || Symmetrie",
      "$$2 \\cdot 0{,}8413 - 1 \\approx 0{,}683 || 1σ",
      "$$2 \\cdot 0{,}9772 - 1 \\approx 0{,}954, \\quad 2 \\cdot 0{,}99865 - 1 \\approx 0{,}997 || 2σ und 3σ",
      "Umgekehrt gefragt: Für 95 % braucht man $2\\Phi(c) - 1 = 0{,}95$, also $\\Phi(c) = 0{,}975$ und $c \\approx 1{,}96$.",
    ] },
    bsp: [
      "Abfüllmaschine: $\\mu = 500\\,\\text{g}$, $\\sigma = 4\\,\\text{g}$.",
      "Mit etwa 95,4 % wiegt eine Packung zwischen 492 g und 508 g.",
      "Weniger als 488 g (unter $\\mu - 3\\sigma$) kommt nur in etwa 0,13 % der Fälle vor.",
    ],
    falle: "Die Prozente gelten für das ganze Intervall um $\\mu$, nicht für eine Seite: Über $\\mu + \\sigma$ liegen nur etwa $\\frac{1 - 0{,}683}{2} \\approx 15{,}9\\,\\%$.",
    nutzt: [["normal-standard", "Standardisieren"], ["sigmaregeln", "dieselben Anteile bei der Binomialverteilung"]],
    syn: "sigmaumgebung sigma regeln 68 95 99 prozent normalverteilung",
  },
  {
    bereich: "stochastik", id: "binomial-normal", g: "Normalverteilung", n: "Binomialverteilung durch Normalverteilung nähern", st: "ober", kl: 12,
    f: "P(X \\leq k) \\approx \\Phi\\left(\\frac{k + 0{,}5 - \\mu}{\\sigma}\\right), \\quad \\mu = np, \\; \\sigma = \\sqrt{np(1-p)}",
    k: "gilt gut für σ > 3 (Laplace-Bedingung) · + 0,5 ist die Stetigkeitskorrektur",
    bild: ["normalKurve", { modus: "naeherung" }],
    her: { t: "Säulen durch Fläche ersetzen", s: [
      "Im Histogramm der Binomialverteilung hat die Säule zu $k$ die Breite 1 und reicht von $k - 0{,}5$ bis $k + 0{,}5$. Ihre Fläche ist $P(X = k)$.",
      "Für $\\sigma > 3$ liegt die Glockenkurve mit gleichem $\\mu = np$ und $\\sigma = \\sqrt{np(1-p)}$ sehr gut auf den Säulen.",
      "$P(X \\leq k)$ ist die Fläche aller Säulen bis einschließlich $k$ – sie endet also bei $k + 0{,}5$, nicht bei $k$.",
      "$$P(X \\leq k) \\approx \\Phi\\left(\\frac{k + 0{,}5 - \\mu}{\\sigma}\\right) || standardisieren",
    ] },
    bsp: [
      "$n = 100$, $p = 0{,}5$: $\\mu = 50$, $\\sigma = 5 > 3$.",
      "$$P(X \\leq 55) \\approx \\Phi\\left(\\frac{55{,}5 - 50}{5}\\right) = \\Phi(1{,}1) \\approx 0{,}864",
      "Der exakte Binomialwert ist $0{,}8644$ – die Näherung trifft fast genau.",
    ],
    falle: "Ohne Stetigkeitskorrektur fehlt die halbe Säule: $\\Phi(1) \\approx 0{,}841$ statt richtig etwa $0{,}864$.",
    nutzt: [["bernoulli", "die genäherte Verteilung"], ["binom-ew", "μ = np und σ = √(np(1 − p))"], ["normal-standard", "Standardisieren"]],
    wz: "bernoulli",
    syn: "näherung moivre laplace stetigkeitskorrektur approximation",
  },

  /* ---------------- Stochastik · Hypothesentest ---------------- */
  {
    bereich: "stochastik", id: "hypotest-seiten", g: "Hypothesentest", n: "Einseitiger und zweiseitiger Test", st: "ober", kl: 12,
    f: "\\text{rechts: } P(X \\geq k) \\leq \\alpha, \\quad \\text{links: } P(X \\leq k) \\leq \\alpha, \\quad \\text{zweiseitig: je } \\frac{\\alpha}{2}",
    k: "die Gegenhypothese entscheidet, wo der Ablehnungsbereich liegt",
    bild: ["hypothese", {}],
    her: { t: "Wohin zeigt der Verdacht?", s: [
      "Vermutet man, dass $p$ größer ist als $p_0$ ($H_1: p > p_0$), sprechen große Trefferzahlen gegen $H_0$. Der Ablehnungsbereich liegt rechts: $\\{k; \\ldots; n\\}$.",
      "Vermutet man $p < p_0$, sprechen kleine Trefferzahlen gegen $H_0$. Der Ablehnungsbereich liegt links: $\\{0; \\ldots; k\\}$.",
      "Ist nur die Frage, ob $p$ von $p_0$ abweicht ($H_1: p \\neq p_0$), sprechen beide Ränder gegen $H_0$. Das Niveau $\\alpha$ wird auf beide Seiten verteilt.",
      "$$P(X \\leq k_1) \\leq \\frac{\\alpha}{2}, \\quad P(X \\geq k_2) \\leq \\frac{\\alpha}{2} || zweiseitig",
    ] },
    bsp: [
      "$H_0: p = 0{,}5$, $n = 100$, $\\alpha = 5\\,\\%$, zweiseitig.",
      "Links: $P(X \\leq 39) \\approx 0{,}018 \\leq 0{,}025$, aber $P(X \\leq 40) \\approx 0{,}028 > 0{,}025$.",
      "Rechts aus Symmetrie: $P(X \\geq 61) \\approx 0{,}018$.",
      "Ablehnungsbereich: $\\{0; \\ldots; 39\\} \\cup \\{61; \\ldots; 100\\}$.",
    ],
    falle: "Beim zweiseitigen Test bekommt jede Seite nur $\\frac{\\alpha}{2}$. Wer jeder Seite $\\alpha$ gibt, testet insgesamt auf dem Niveau $2\\alpha$.",
    nutzt: [["hypotest", "Ablehnungsbereich bestimmen"], ["fehlerarten", "α ist die Wahrscheinlichkeit für den Fehler 1. Art"]],
    wz: "hypothesentest",
    syn: "einseitig zweiseitig linksseitig rechtsseitig gegenhypothese test",
  },

  /* ---------------- Analysis ---------------- */
  {
    bereich: "analysis", id: "differenzierbar", g: "Änderungsraten", n: "Differenzierbarkeit", st: "ober", kl: 11,
    f: "f \\text{ differenzierbar in } x_0 \\Leftrightarrow \\lim_{h \\to 0} \\frac{f(x_0+h) - f(x_0)}{h} \\text{ existiert}",
    k: "links und rechts derselbe Grenzwert · anschaulich: der Graph hat keinen Knick",
    bild: ["sekante", { start: 1.6, grenz: true }],
    her: [
      { t: "Der Knick der Betragsfunktion", s: [
        "Für $f(x) = |x|$ an der Stelle $x_0 = 0$ ist der Differenzenquotient $\\frac{|h| - 0}{h} = \\frac{|h|}{h}$.",
        "$$h > 0: \\; \\frac{|h|}{h} = 1, \\qquad h < 0: \\; \\frac{|h|}{h} = -1 || von rechts und von links",
        "Von rechts nähern sich die Sekantensteigungen 1, von links $-1$. Es gibt keinen gemeinsamen Grenzwert – $|x|$ ist bei 0 nicht differenzierbar.",
        "Am Graphen sieht man das als Knick: Es gibt keine eindeutige Tangente.",
      ] },
      { t: "Zusammengesetzte Funktionen", s: [
        "Bei einer stückweise definierten Funktion prüft man an der Nahtstelle zweierlei:",
        "Stetig: Beide Teile haben dort denselben Funktionswert (keine Lücke, kein Sprung).",
        "Differenzierbar: Zusätzlich haben beide Teile dort dieselbe Ableitung (kein Knick).",
        "Aus differenzierbar folgt stetig – umgekehrt nicht.",
      ] },
    ],
    bsp: [
      "$f(x) = x^2$ für $x \\leq 1$ und $f(x) = 2x - 1$ für $x > 1$.",
      "Funktionswerte bei 1: $1^2 = 1$ und $2 \\cdot 1 - 1 = 1$ – stetig.",
      "Ableitungen bei 1: $2x = 2$ und $2$ – gleich, also differenzierbar. Der Übergang ist knickfrei.",
    ],
    falle: "Stetig heißt nicht differenzierbar: $f(x) = |x|$ hat bei 0 keine Lücke, aber einen Knick.",
    nutzt: [["ableitung", "Grenzwert des Differenzenquotienten"], ["diffquot", "Sekantensteigung von links und rechts"], ["betrag-ungl", "Betrag als Abstand"]],
    syn: "differenzierbarkeit knick stetig stetigkeit glatt knickfrei",
  },
  {
    bereich: "analysis", id: "wendetangente", g: "Kurvendiskussion", n: "Wendetangente", st: "ober", kl: 11,
    f: "t_W(x) = f′(x_W) \\cdot (x - x_W) + f(x_W)",
    k: "Tangente im Wendepunkt · sie durchsetzt den Graphen",
    bild: ["kurvenTrio", { fokus: "wende" }],
    her: [
      { t: "Schritt für Schritt", s: [
        "Wendestelle $x_W$ bestimmen: $f″(x_W) = 0$ und $f‴(x_W) \\neq 0$.",
        "Den Punkt berechnen: $W(x_W \\,|\\, f(x_W))$.",
        "Die Steigung im Wendepunkt: $m = f′(x_W)$.",
        "In die Tangentengleichung einsetzen:",
        "$$t_W(x) = f′(x_W) \\cdot (x - x_W) + f(x_W) || Punkt-Steigungs-Form",
      ] },
      { t: "Was ist besonders?", s: [
        "Im Wendepunkt ändert sich die Krümmung. Links liegt der Graph auf der einen, rechts auf der anderen Seite der Tangente – die Wendetangente durchsetzt den Graphen.",
        "Wegen $f″(x_W) = 0$ ist $x_W$ eine Extremstelle von $f′$: Die Wendetangente ist die steilste (oder flachste) Tangente in der Umgebung.",
      ] },
    ],
    bsp: [
      "$f(x) = x^3 - 3x^2$: $f′(x) = 3x^2 - 6x$, $f″(x) = 6x - 6$.",
      "$f″(x) = 0 \\Rightarrow x_W = 1$, $f‴(1) = 6 \\neq 0$. $f(1) = -2$, $f′(1) = -3$.",
      "$$t_W(x) = -3(x - 1) - 2 = -3x + 1",
    ],
    falle: "In die Tangentengleichung gehört $f′(x_W)$, nicht $f″(x_W)$ – die zweite Ableitung ist im Wendepunkt ja null.",
    nutzt: [["wende", "Wendepunkt bestimmen"], ["tangente", "Tangentengleichung"]],
    wz: "kurvendiskussion",
    syn: "wendetangente tangente im wendepunkt steilste tangente",
  },
  {
    bereich: "analysis", id: "funktionenschar", g: "Kurvendiskussion", n: "Funktionenschar", st: "ober", kl: 12,
    f: "f_k(x) = x^3 - kx, \\quad k \\in \\mathbb{R}",
    k: "für jeden Parameterwert eine Funktion · k behandelt man wie eine feste Zahl",
    bild: ["ortskurve", {}],
    her: { t: "Rechnen mit einem Parameter", s: [
      "Beim Ableiten ist $k$ eine Konstante: $f_k′(x) = 3x^2 - k$, $f_k″(x) = 6x$.",
      "$f_k′(x) = 0 \\Leftrightarrow x^2 = \\frac{k}{3}$. Jetzt muss man nach $k$ unterscheiden:",
      "$k > 0$: zwei Extremstellen $x = \\pm\\sqrt{\\frac{k}{3}}$; wegen $f_k″ = 6x$ ist links der Hochpunkt, rechts der Tiefpunkt.",
      "$k = 0$: nur $x = 0$ mit $f_0″(0) = 0$ – ein Sattelpunkt. $k < 0$: keine Extremstellen.",
      "Setzt man $k = 3x^2$ in $f_k(x)$ ein, erhält man die Kurve, auf der alle Extrempunkte liegen:",
      "$$y = x^3 - 3x^2 \\cdot x = -2x^3 || Ortskurve",
    ] },
    bsp: [
      "$k = 3$: $x = \\pm 1$.",
      "$f_3(1) = 1 - 3 = -2$ ⇒ $T(1 \\,|\\, -2)$, $f_3(-1) = -1 + 3 = 2$ ⇒ $H(-1 \\,|\\, 2)$.",
      "Probe mit der Ortskurve: $-2 \\cdot 1^3 = -2$ ✓.",
    ],
    falle: "Beim Ableiten nach $x$ bleibt $k$ stehen: $(kx)′ = k$, nicht $(kx)′ = x$. Und Fallunterscheidungen für $k$ nicht vergessen.",
    nutzt: [["extrem", "Extremstellen in Abhängigkeit von k"], ["ortskurve", "Bahn der Extrempunkte"]],
    wz: "scharen",
    syn: "schar parameter kurvenschar funktionsschar fallunterscheidung",
  },

  /* ---------------- Funktionen ---------------- */
  {
    bereich: "funktionen", id: "logistisch", g: "Exponentialfunktionen und Wachstum", n: "Logistisches Wachstum", st: "ober", kl: 12,
    f: "f(t) = \\frac{S}{1 + c \\cdot e^{-kSt}}, \\quad c = \\frac{S - f(0)}{f(0)}",
    k: "anfangs fast exponentiell, dann gebremst bis zur Grenze S · am schnellsten bei S/2",
    bild: ["wachstum", { modus: "begrenzt" }],
    her: [
      { t: "Zwei Bremsen in einer Gleichung", s: [
        "Die Zunahme ist proportional zum Bestand (viele vermehren sich schnell) und zum freien Platz $S - f$ (wenig Platz bremst):",
        "$$f′(t) = k \\cdot f(t) \\cdot (S - f(t)) || Differenzialgleichung",
        "Ist $f$ klein, ist $S - f \\approx S$ und $f′ \\approx kS \\cdot f$ – fast exponentielles Wachstum.",
        "Ist $f$ fast $S$, ist $S - f$ klein – das Wachstum kommt zum Stillstand.",
        "Man prüft durch Ableiten, dass $f(t) = \\frac{S}{1 + c \\, e^{-kSt}}$ diese Gleichung erfüllt; $c$ folgt aus $f(0) = \\frac{S}{1 + c}$.",
      ] },
      { t: "Wo wächst es am schnellsten?", s: [
        "$f′ = k \\cdot f \\cdot (S - f)$ ist – als Funktion von $f$ – eine nach unten geöffnete Parabel mit Nullstellen $0$ und $S$.",
        "Ihr Scheitel liegt in der Mitte bei $f = \\frac{S}{2}$. Dort ist die Wachstumsgeschwindigkeit am größten – das ist der Wendepunkt.",
      ] },
    ],
    bsp: [
      "$S = 1000$, $f(0) = 10$, $k = 0{,}0005$: $c = \\frac{990}{10} = 99$, $kS = 0{,}5$.",
      "$$f(t) = \\frac{1000}{1 + 99 \\, e^{-0{,}5t}}",
      "Wendepunkt bei $f = 500$: $99 \\, e^{-0{,}5t} = 1 \\Rightarrow t = 2\\ln(99) \\approx 9{,}2$.",
    ],
    falle: "Im Exponenten steht $k \\cdot S$, nicht nur $k$ – sonst passt die Lösung nicht zu $f′ = k \\cdot f \\cdot (S - f)$.",
    nutzt: [["wachstum-begrenzt", "Grenze S"], ["wachstum-exp", "Anfangsphase fast exponentiell"], ["abl-exp", "Ableitung der e-Funktion"]],
    wz: "wachstum",
    syn: "logistisch sättigung sigmoid s-kurve kapazität",
  },

  /* ---------------- Vektoren ---------------- */
  {
    bereich: "vektoren", id: "komplanar", g: "Grundlagen", n: "Komplanare Vektoren", st: "ober", kl: 12,
    f: "\\vec{c} = r \\cdot \\vec{a} + s \\cdot \\vec{b} \\;\\Leftrightarrow\\; \\vec{a}, \\vec{b}, \\vec{c} \\text{ liegen in einer Ebene}",
    k: "drei Vektoren sind komplanar, wenn einer aus den anderen kombiniert werden kann · Test: Spatprodukt 0",
    bild: ["raum", { modus: "ebeneParam" }],
    her: [
      { t: "Mit einem Gleichungssystem", s: [
        "Zwei nicht parallele Vektoren $\\vec{a}$, $\\vec{b}$ spannen eine Ebene auf. Jeder Vektor $r\\vec{a} + s\\vec{b}$ liegt in ihr.",
        "Also: $\\vec{c}$ liegt genau dann in dieser Ebene, wenn das LGS $r\\vec{a} + s\\vec{b} = \\vec{c}$ eine Lösung hat.",
        "Drei Gleichungen, zwei Unbekannte: Man löst mit zwei Zeilen und prüft die dritte.",
      ] },
      { t: "Mit dem Spatprodukt", s: [
        "$\\vec{a} \\times \\vec{b}$ steht senkrecht auf der Ebene von $\\vec{a}$ und $\\vec{b}$.",
        "$\\vec{c}$ liegt in dieser Ebene genau dann, wenn $\\vec{c}$ senkrecht zu $\\vec{a} \\times \\vec{b}$ ist:",
        "$$(\\vec{a} \\times \\vec{b}) \\cdot \\vec{c} = 0 || Spatvolumen null",
      ] },
    ],
    bsp: [
      "$\\vec{a} = (1 \\,|\\, 0 \\,|\\, 1)$, $\\vec{b} = (0 \\,|\\, 1 \\,|\\, 1)$, $\\vec{c} = (2 \\,|\\, 3 \\,|\\, 5)$.",
      "$2\\vec{a} + 3\\vec{b} = (2 \\,|\\, 3 \\,|\\, 5) = \\vec{c}$ – komplanar.",
      "Probe: $\\vec{a} \\times \\vec{b} = (-1 \\,|\\, -1 \\,|\\, 1)$, $(-1) \\cdot 2 + (-1) \\cdot 3 + 1 \\cdot 5 = 0$ ✓.",
    ],
    falle: "Drei Vektoren können komplanar sein, obwohl keine zwei davon parallel sind – paarweise auf Parallelität prüfen reicht nicht.",
    nutzt: [["linearkombination", "c als Kombination von a und b"], ["kollinear", "lineare Abhängigkeit"], ["spat", "Spatprodukt gleich null"]],
    wz: "vektorgenerator",
    syn: "komplanar linear abhängig in einer ebene spatprodukt",
  },
  {
    bereich: "vektoren", id: "schwerpunkt", g: "Grundlagen", n: "Schwerpunkt eines Dreiecks", st: "ober", kl: 11,
    f: "\\vec{OS} = \\frac{1}{3}\\left(\\vec{OA} + \\vec{OB} + \\vec{OC}\\right)",
    k: "Schnittpunkt der Seitenhalbierenden · Mittelwert der drei Ecken",
    bild: ["vek2d", { modus: "mittelpunkt" }],
    her: { t: "Zwei Drittel der Seitenhalbierenden", s: [
      "Die Seitenhalbierende von $A$ geht zur Mitte $M_a$ der Gegenseite: $\\vec{OM_a} = \\frac{1}{2}(\\vec{OB} + \\vec{OC})$.",
      "Der Schwerpunkt teilt jede Seitenhalbierende im Verhältnis $2 : 1$, liegt also bei zwei Dritteln des Weges von $A$ nach $M_a$:",
      "$$\\vec{OS} = \\vec{OA} + \\frac{2}{3}\\left(\\vec{OM_a} - \\vec{OA}\\right) || zwei Drittel des Weges",
      "$$= \\frac{1}{3}\\vec{OA} + \\frac{2}{3} \\cdot \\frac{1}{2}(\\vec{OB} + \\vec{OC}) = \\frac{1}{3}(\\vec{OA} + \\vec{OB} + \\vec{OC}) || ausmultiplizieren",
      "Das Ergebnis ist in $A$, $B$, $C$ symmetrisch. Mit $B$ oder $C$ als Start kommt derselbe Punkt heraus – alle drei Seitenhalbierenden schneiden sich in $S$.",
    ] },
    bsp: [
      "$A(0 \\,|\\, 0 \\,|\\, 0)$, $B(6 \\,|\\, 0 \\,|\\, 0)$, $C(0 \\,|\\, 3 \\,|\\, 9)$.",
      "$$\\vec{OS} = \\frac{1}{3}(6 \\,|\\, 3 \\,|\\, 9) = (2 \\,|\\, 1 \\,|\\, 3)",
      "Also $S(2 \\,|\\, 1 \\,|\\, 3)$.",
    ],
    falle: "Der Schwerpunkt ist weder eine Seitenmitte noch im Allgemeinen der Umkreismittelpunkt: Man mittelt alle drei Ecken, nicht nur zwei.",
    nutzt: [["mittelpunkt", "Seitenmitten"], ["vektoraddition", "Ortsvektoren addieren"]],
    wz: "vektorgenerator",
    syn: "schwerpunkt seitenhalbierende mittelwert der ecken",
  },
];
