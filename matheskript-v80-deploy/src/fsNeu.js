/* FORMELSAMMLUNG · NEUE FORMELN (Lücken, die beim Abgleich mit den Werkzeugen der App gefunden wurden) */
export const NEU = [
  {
    bereich: "geometrie", id: "kreisgleichung", g: "Kreis und Kugel", n: "Kreisgleichung", st: "beide",
    f: "(x - m_1)^2 + (y - m_2)^2 = r^2",
    k: "alle Punkte mit Abstand r vom Mittelpunkt M(m₁ | m₂)",
    bild: ["kreisGleichung", {}],
    her: [
      { t: "Mit dem Satz des Pythagoras", s: [
        "Ein Punkt $P(x | y)$ liegt genau dann auf dem Kreis, wenn sein Abstand zum Mittelpunkt $M(m_1 | m_2)$ gleich $r$ ist.",
        "Waagerecht liegt zwischen $P$ und $M$ die Strecke $x - m_1$, senkrecht $y - m_2$. Sie bilden die Katheten eines rechtwinkligen Dreiecks, $r$ ist die Hypotenuse:",
        "$$(x - m_1)^2 + (y - m_2)^2 = r^2",
        "Für $M = O$ und $r = 1$ ergibt sich der Einheitskreis $x^2 + y^2 = 1$.",
      ] },
      { t: "Mit Vektoren", s: [
        "Der Abstand von $P$ zu $M$ ist der Betrag des Verbindungsvektors: $|\\vec{x} - \\vec{m}| = r$.",
        "Quadrieren und den Betrag mit dem Skalarprodukt schreiben: $(\\vec{x} - \\vec{m}) \\cdot (\\vec{x} - \\vec{m}) = r^2$.",
        "In Koordinaten ausgeschrieben ist das genau die Kreisgleichung – dieselbe Rechnung funktioniert im Raum und führt zur Kugelgleichung.",
      ] },
      { t: "Ausmultiplizieren: die allgemeine Form", s: [
        "$$x^2 + y^2 - 2m_1 x - 2m_2 y + (m_1^2 + m_2^2 - r^2) = 0",
        "Aus einer solchen Gleichung gewinnt man Mittelpunkt und Radius mit quadratischer Ergänzung zurück – getrennt für $x$ und für $y$.",
      ] },
    ],
    bsp: ["Kreis um $M(2 | -1)$ mit $r = 3$: $(x - 2)^2 + (y + 1)^2 = 9$.", "$x^2 + y^2 - 4x + 6y - 3 = 0$: $(x - 2)^2 + (y + 3)^2 = 16$, also $M(2 | -3)$ und $r = 4$."],
    falle: "In der Gleichung steht $r^2$, nicht $r$: Bei $(x - 1)^2 + y^2 = 9$ ist der Radius 3.",
    nutzt: [["pythagoras", "Abstand als Hypotenuse"], ["abstand-punkte", "Abstand zum Mittelpunkt"], ["quadergaenzung", "aus der allgemeinen Form Mittelpunkt ablesen"], ["einheitskreis", "Spezialfall M = O, r = 1"]],
  },
  {
    bereich: "geometrie", id: "kugelgleichung", g: "Kreis und Kugel", n: "Kugelgleichung", st: "ober",
    f: "(x_1 - m_1)^2 + (x_2 - m_2)^2 + (x_3 - m_3)^2 = r^2",
    k: "in Vektorform: |x − m| = r",
    bild: ["kugelSchnitt", {}],
    her: [
      { t: "Abstand im Raum", s: [
        "Der Abstand eines Punktes $X(x_1 | x_2 | x_3)$ vom Mittelpunkt $M$ ist $\\sqrt{(x_1 - m_1)^2 + (x_2 - m_2)^2 + (x_3 - m_3)^2}$ (zweimal Pythagoras).",
        "Liegt $X$ auf der Kugel, ist dieser Abstand $r$. Quadrieren liefert die Gleichung.",
      ] },
      { t: "Schnitt mit einer Ebene", s: [
        "Schneidet man die Kugel $x_1^2 + x_2^2 + x_3^2 = r^2$ in der Höhe $x_3 = h$, bleibt $x_1^2 + x_2^2 = r^2 - h^2$ – ein Kreis mit Radius $\\sqrt{r^2 - h^2}$.",
        "Für $h = \\pm r$ schrumpft der Kreis zu einem Punkt: Die Ebene berührt die Kugel (Tangentialebene).",
      ] },
    ],
    bsp: ["Kugel um den Ursprung mit $r = 5$: $x_1^2 + x_2^2 + x_3^2 = 25$. Der Punkt $(3 | 4 | 0)$ liegt darauf."],
    nutzt: [["kreisgleichung", "ein Schnittkreis"], ["betrag", "Abstand im Raum"], ["abstand-punkte", "Abstand im Raum"], ["kugel", "Volumen und Oberfläche"]],
  },
  {
    bereich: "terme", id: "geomsumme", g: "Summen", n: "Geometrische Summe", st: "ober",
    f: "1 + q + q^2 + \\ldots + q^n = \\frac{q^{n+1} - 1}{q - 1}",
    k: "für q ≠ 1 · Sparplan, Rentenbarwert, periodische Dezimalbrüche",
    bild: ["geomSumme", {}],
    her: [
      { t: "Mit q multiplizieren und abziehen", s: [
        "Sei $S = 1 + q + q^2 + \\ldots + q^n$.",
        "Multipliziert man mit $q$, rutscht jeder Summand eine Potenz weiter: $qS = q + q^2 + \\ldots + q^n + q^{n+1}$.",
        "Zieht man beide Gleichungen ab, heben sich fast alle Terme auf:",
        "$$qS - S = q^{n+1} - 1 \;\\Rightarrow\; S(q - 1) = q^{n+1} - 1 \;\\Rightarrow\; S = \\frac{q^{n+1} - 1}{q - 1}",
      ] },
      { t: "Mit der Faktorisierung von qⁿ⁺¹ − 1", s: [
        "Ausmultiplizieren zeigt die Probe: $(q - 1)(1 + q + \\ldots + q^n) = q^{n+1} - 1$.",
        "Für $n = 1$ ist das die dritte binomische Formel: $(q - 1)(q + 1) = q^2 - 1$.",
      ] },
      { t: "Mit vollständiger Induktion", s: [
        "Anfang: $n = 0$: $1 = \\frac{q - 1}{q - 1}$ ✓.",
        "Schritt: Wenn die Formel für $n$ gilt, dann $\\frac{q^{n+1} - 1}{q - 1} + q^{n+1} = \\frac{q^{n+1} - 1 + q^{n+2} - q^{n+1}}{q - 1} = \\frac{q^{n+2} - 1}{q - 1}$ ✓.",
      ] },
    ],
    bsp: ["Sparplan: 100 € jedes Jahr zu 3 % Zins, nach 10 Einzahlungen: $100 \\cdot \\frac{1{,}03^{10} - 1}{0{,}03} \\approx 1146{,}39$ €.", "$1 + 2 + 4 + \\ldots + 2^{9} = 2^{10} - 1 = 1023$."],
    falle: "Für $q = 1$ ist der Nenner 0 – dann sind es einfach $n + 1$ Summanden gleich 1.",
    nutzt: [["potenzgesetze", "qⁿ · q = qⁿ⁺¹"], ["binom3", "Spezialfall n = 1"], ["induktion", "dritter Beweis"], ["zins", "Sparplan: Zinseszins jeder Rate"]],
  },
  {
    bereich: "vektoren", id: "linearkombination", g: "Grundlagen", n: "Linearkombination", st: "ober",
    f: "\\vec{x} = r \\cdot \\vec{a} + s \\cdot \\vec{b}",
    k: "jeder Punkt der Ebene aus zwei Richtungsvektoren",
    bild: ["linKomb", {}],
    her: [
      { t: "Als Weg", s: [
        "Man geht $r$ Schritte in Richtung $\\vec{a}$ und danach $s$ Schritte in Richtung $\\vec{b}$. Die Summe der beiden Teilverschiebungen ist die Linearkombination.",
        "Sind $\\vec{a}$ und $\\vec{b}$ nicht kollinear, erreicht man auf diese Weise jeden Punkt der Ebene – mit genau einem Paar $(r | s)$.",
      ] },
      { t: "Als Gleichungssystem", s: [
        "Soll $\\vec{x} = r\\vec{a} + s\\vec{b}$ gelten, ergibt jede Koordinate eine Gleichung: $x_1 = ra_1 + sb_1$, $x_2 = ra_2 + sb_2$.",
        "Das ist ein LGS für $r$ und $s$. Es hat genau eine Lösung, wenn $\\vec{a}$ und $\\vec{b}$ linear unabhängig sind – sonst keine oder unendlich viele.",
      ] },
    ],
    bsp: ["$\\vec{x} = (5 | 4)$, $\\vec{a} = (2 | 1)$, $\\vec{b} = (1 | 2)$: aus $2r + s = 5$ und $r + 2s = 4$ folgt $r = 2$, $s = 1$."],
    nutzt: [["vektoraddition", "Addition und Vielfache"], ["kollinear", "Unabhängigkeit der Richtungen"], ["gauss", "r und s ausrechnen"]],
  },
  {
    bereich: "stochastik", id: "ew-linear", g: "Zufallsgrößen", n: "Erwartungswert und Varianz von aX + b", st: "ober",
    f: "E(aX + b) = a \\cdot E(X) + b, \\quad V(aX + b) = a^2 \\cdot V(X)",
    k: "Umrechnen von Einheiten, Gewinn statt Auszahlung",
    bild: ["ewAb", {}],
    her: [
      { t: "Erwartungswert aus der Definition", s: [
        "Die Zufallsgröße $Y = aX + b$ nimmt den Wert $ax_i + b$ mit der Wahrscheinlichkeit $p_i$ an.",
        "$$E(Y) = \\sum (ax_i + b) p_i = a \\sum x_i p_i + b \\sum p_i = a \\cdot E(X) + b || die Summe aller p_i ist 1",
      ] },
      { t: "Varianz aus der Definition", s: [
        "Mit $E(Y) = a\\mu + b$ ist $ax_i + b - E(Y) = a(x_i - \\mu)$. Das Verschieben um $b$ hebt sich also weg.",
        "$$V(Y) = \\sum a^2 (x_i - \\mu)^2 p_i = a^2 \\sum (x_i - \\mu)^2 p_i = a^2 \\cdot V(X)",
        "Für die Standardabweichung folgt $\\sigma(Y) = |a| \\cdot \\sigma(X)$.",
      ] },
      { t: "Zahlenbeispiel", s: [
        "Ein Würfel mit Augenzahl $X$: $E = 3{,}5$. Gewinn $G = 2X - 5$: $E(G) = 2 \\cdot 3{,}5 - 5 = 2$.",
      ] },
    ],
    falle: "Die Varianz wächst quadratisch mit $a$, die Standardabweichung linear. Und $b$ spielt für die Streuung keine Rolle.",
    nutzt: [["erwartungswert", "Definition von E"], ["varianz", "Definition von V"], ["fair", "Gewinn = Auszahlung − Einsatz"]],
  },
  {
    bereich: "stochastik", id: "mindestens-n", g: "Binomialverteilung", n: "Mindestens n Versuche", st: "ober",
    f: "1 - (1 - p)^n \\geq P \;\\Rightarrow\; n \\geq \\frac{\\ln(1 - P)}{\\ln(1 - p)}",
    k: "wie oft muss man es versuchen, um mit Sicherheit P mindestens einen Treffer zu haben?",
    bild: ["mindestensN", {}],
    her: [
      { t: "Ungleichung mit dem Logarithmus lösen", s: [
        "Gesucht ist das kleinste $n$ mit $1 - (1-p)^n \\geq P$. Umgestellt: $(1-p)^n \\leq 1 - P$.",
        "Beide Seiten logarithmieren. Weil $1 - p < 1$ ist, ist $\\ln(1-p) < 0$ – dabei dreht sich das Zeichen um:",
        "$$n \\cdot \\ln(1-p) \\leq \\ln(1-P) \;\\Rightarrow\; n \\geq \\frac{\\ln(1-P)}{\\ln(1-p)}",
        "Zum Schluss aufrunden: $n$ muss eine ganze Zahl sein.",
      ] },
      { t: "Mit Ausprobieren", s: [
        "Die Wahrscheinlichkeit $1 - (1-p)^n$ steigt mit $n$. Man kann $n$ im Taschenrechner schrittweise erhöhen, bis der Wert erstmals $P$ erreicht oder übersteigt.",
        "Der Logarithmus liefert dasselbe Ergebnis direkt und ist besonders bei großen $n$ schneller.",
      ] },
    ],
    bsp: ["Würfel: Wie oft muss man mindestens werfen, damit mit 90 % mindestens eine Sechs fällt? $n \\geq \\frac{\\ln 0{,}1}{\\ln(5/6)} \\approx 12{,}6$, also 13 Würfe."],
    falle: "Das Zeichen dreht sich beim Teilen durch $\\ln(1-p)$ (negativ). Und das Ergebnis muss aufgerundet werden, nicht gerundet.",
    nutzt: [["mindestens", "P(X ≥ 1) = 1 − (1−p)ⁿ"], ["expgl", "Exponentialgleichung"], ["ungleichung", "Zeichen dreht sich bei negativem Faktor"], ["logpot", "Exponent vor den Logarithmus"]],
  },
  {
    bereich: "analysis", id: "schnittwinkel", g: "Anwendungen", n: "Schnittwinkel von Graphen", st: "ober",
    f: "\\tan\\delta = \\left|\\frac{m_2 - m_1}{1 + m_1 m_2}\\right|",
    k: "Winkel zwischen den Tangenten im Schnittpunkt · m₁m₂ = −1 heißt senkrecht",
    bild: ["schnittwinkel", {}],
    her: [
      { t: "Mit dem Additionstheorem des Tangens", s: [
        "Die Tangenten haben die Steigungswinkel $\\alpha_1$ und $\\alpha_2$ mit $\\tan\\alpha_i = m_i$. Der Schnittwinkel ist die Differenz $\\delta = \\alpha_2 - \\alpha_1$.",
        "$$\\tan(\\alpha_2 - \\alpha_1) = \\frac{\\tan\\alpha_2 - \\tan\\alpha_1}{1 + \\tan\\alpha_1 \\tan\\alpha_2} = \\frac{m_2 - m_1}{1 + m_1 m_2}",
        "Der Betrag liefert den spitzen Winkel. Ist der Nenner 0, ist $\\delta = 90°$.",
      ] },
      { t: "Mit Richtungsvektoren", s: [
        "Die Tangenten haben die Richtungsvektoren $(1 | m_1)$ und $(1 | m_2)$. Der Winkel zwischen den Vektoren folgt aus dem Skalarprodukt:",
        "$$\\cos\\delta = \\frac{1 + m_1 m_2}{\\sqrt{1 + m_1^2} \\cdot \\sqrt{1 + m_2^2}}",
        "Für $m_1 m_2 = -1$ ist der Zähler 0: Die Tangenten stehen senkrecht (wie bei orthogonalen Geraden).",
      ] },
    ],
    bsp: ["$f(x) = x^2$ und $g(x) = x$ schneiden sich bei $x = 1$: $m_1 = 2$, $m_2 = 1$, $\\tan\\delta = \\frac{1}{3}$, $\\delta \\approx 18{,}4°$."],
    nutzt: [["steigungswinkel", "tan α = m"], ["additionstheorem", "Tangens der Differenz"], ["orthogeraden", "Sonderfall 90°"], ["tangente", "Steigung im Schnittpunkt"], ["vektorwinkel", "alternativer Weg"]],
  },
  {
    bereich: "terme", id: "betrag-ungl", g: "Gleichungen", n: "Betrag und Abstand", st: "beide",
    f: "|x - a| < b \;\\Leftrightarrow\; a - b < x < a + b",
    k: "|x − a| ist der Abstand von x zu a · bei Gleichungen zwei Fälle",
    bild: ["betragFall", {}],
    her: [
      { t: "Als Abstand auf dem Zahlenstrahl", s: [
        "$|x - a|$ misst, wie weit $x$ von $a$ entfernt ist. »$< b$« heißt: weniger als $b$ links oder rechts von $a$.",
        "Das ist genau das Intervall $]a - b; a + b[$ um die Mitte $a$.",
      ] },
      { t: "Mit Fallunterscheidung", s: [
        "Nach der Definition ist $|t| = t$ für $t \\geq 0$ und $|t| = -t$ für $t < 0$. Mit $t = x - a$:",
        "Fall 1 ($x \\geq a$): $x - a < b$, also $x < a + b$. Fall 2 ($x < a$): $-(x - a) < b$, also $x > a - b$.",
        "Beide Fälle zusammen ergeben $a - b < x < a + b$.",
      ] },
      { t: "Betragsgleichung", s: [
        "$|x - a| = b$ hat (für $b > 0$) zwei Lösungen: $x = a + b$ und $x = a - b$ – die beiden Punkte im Abstand $b$ von $a$.",
      ] },
    ],
    bsp: ["$|x - 3| < 2 \\Leftrightarrow 1 < x < 5$.", "$|2x + 1| = 5$: $2x + 1 = 5$ oder $2x + 1 = -5$, also $x = 2$ oder $x = -3$."],
    falle: "$|x| = -2$ hat keine Lösung – ein Betrag ist nie negativ.",
    nutzt: [["ungleichung", "Zeichen beim Umformen"], ["intervalle", "Ergebnis ist ein Intervall"], ["abstand-punkte", "Abstand zweier Zahlen"]],
  },
  {
    bereich: "kopfrechnen", id: "mal9", g: "Rechentricks", n: "Mal 9 und Mal 99", st: "mittel",
    f: "a \\cdot 9 = a \\cdot 10 - a, \\quad a \\cdot 99 = a \\cdot 100 - a",
    k: "z. B. 47 · 9 = 470 − 47 = 423",
    bild: ["malNahe", {}],
    her: [
      { t: "Mit dem Distributivgesetz", s: [
        "$9 = 10 - 1$ und $99 = 100 - 1$. Mit dem Distributivgesetz:",
        "$$a \\cdot 9 = a \\cdot (10 - 1) = a \\cdot 10 - a \\cdot 1 = 10a - a",
        "Mal 10 ist leicht (Null anhängen), das Abziehen von $a$ macht man im Kopf.",
      ] },
      { t: "Quersumme als Probe", s: [
        "Das Ergebnis eines Vielfachen von 9 hat immer die Quersumme 9, 18, 27 …: $423 \\to 4 + 2 + 3 = 9$ ✓. Das fängt Rechenfehler ab.",
      ] },
    ],
    bsp: ["$$47 \\cdot 9 = 470 - 47 = 423, \\quad 35 \\cdot 99 = 3500 - 35 = 3465"],
    nutzt: [["distributiv", "mal (10 − 1)"], ["teil39", "Quersumme als Probe"], ["nahe100", "ähnlicher Trick"]],
    wz: "kopf",
  },
];
