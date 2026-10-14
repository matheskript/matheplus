/* FORMELSAMMLUNG · TERME UND GLEICHUNGEN (Aufbau eines Eintrags: siehe fsAnalysis.js) */

export const FS_TERME = [
  /* ---------------- Binomische Formeln ---------------- */
  {
    id: "binom1", g: "Binomische Formeln", n: "Erste binomische Formel", st: "mittel",
    f: "(a + b)^2 = a^2 + 2ab + b^2",
    k: "das gemischte Glied 2ab nie vergessen",
    bild: ["binomQuadrat", { modus: "plus" }],
    her: [
      { t: "Ausmultiplizieren", s: [
        "Quadrieren heißt: mit sich selbst multiplizieren. Dann multipliziert man jeden Summanden der ersten Klammer mit jedem der zweiten (Distributivgesetz):",
        "$$(a + b)^2 = (a + b)(a + b) = a \\cdot a + a \\cdot b + b \\cdot a + b \\cdot b",
        "Wegen $a \\cdot b = b \\cdot a$ sind die beiden mittleren Produkte gleich und werden zusammengefasst:",
        "$$= a^2 + 2ab + b^2",
      ] },
      { t: "Als Fläche", s: [
        "Ein Quadrat der Seite $a + b$ hat die Fläche $(a + b)^2$.",
        "Teilt man jede Seite in die Stücke $a$ und $b$, zerfällt das Quadrat in vier Teile: ein Quadrat $a^2$, ein Quadrat $b^2$ und zwei gleiche Rechtecke $a \\cdot b$.",
        "$$(a + b)^2 = a^2 + ab + ab + b^2 = a^2 + 2ab + b^2",
      ] },
      { t: "Zahlenprobe", s: [
        "Setze $a = 3$ und $b = 4$: Links $(3 + 4)^2 = 49$. Rechts $9 + 24 + 16 = 49$. ✓",
        "Und der häufige Fehler $a^2 + b^2 = 25$ passt nicht – es fehlt das gemischte Glied $2ab = 24$.",
      ] },
    ],
    bsp: ["$$(x + 3)^2 = x^2 + 6x + 9, \\quad 21^2 = (20 + 1)^2 = 400 + 40 + 1 = 441"],
    falle: "$(a + b)^2 \\neq a^2 + b^2$. Probe mit $a = b = 1$: links 4, rechts 2.",
    nutzt: [["distributiv", "jeder mit jedem multiplizieren"], ["kommutativ", "ab = ba, deshalb 2ab"], ["rechteck", "Flächeninhalt der Teilstücke"]],
    wz: "terme",
  },
  {
    id: "binom2", g: "Binomische Formeln", n: "Zweite binomische Formel", st: "mittel",
    f: "(a - b)^2 = a^2 - 2ab + b^2",
    k: "Minus nur beim gemischten Glied",
    bild: ["binomQuadrat", { modus: "minus" }],
    her: [
      { t: "Erste Formel mit −b", s: [
        "Eine Differenz ist eine Summe mit negativem zweiten Summanden: $a - b = a + (-b)$. Dann gilt die erste binomische Formel:",
        "$$(a - b)^2 = a^2 + 2a(-b) + (-b)^2 = a^2 - 2ab + b^2",
        "Das Quadrat $(-b)^2 = b^2$ ist positiv – deshalb steht vor $b^2$ immer ein Plus.",
      ] },
      { t: "Als Fläche", s: [
        "Starte mit dem großen Quadrat $a^2$. Das Quadrat der Seite $a - b$ bleibt übrig, wenn man zwei Streifen $a \\cdot b$ abschneidet.",
        "Dabei wurde das Eckquadrat $b^2$ zweimal weggenommen – einmal muss es zurück:",
        "$$(a - b)^2 = a^2 - ab - ab + b^2",
      ] },
      { t: "Ausmultiplizieren", s: [
        "$$(a - b)(a - b) = a^2 - ab - ba + b^2 = a^2 - 2ab + b^2",
      ] },
    ],
    bsp: ["$$(x - 5)^2 = x^2 - 10x + 25, \\quad 99^2 = (100 - 1)^2 = 9801"],
    falle: "Das Vorzeichen vor $b^2$ ist plus: $(x - 5)^2 = x^2 - 10x + 25$, nicht $x^2 - 10x - 25$.",
    nutzt: [["binom1", "mit −b statt b"], ["distributiv", "ausmultipliziert"]],
    wz: "terme",
  },
  {
    id: "binom3", g: "Binomische Formeln", n: "Dritte binomische Formel", st: "mittel",
    f: "(a + b)(a - b) = a^2 - b^2",
    k: "rückwärts gelesen: Faktorisieren einer Differenz",
    bild: ["binomQuadrat", { modus: "drei" }],
    her: [
      { t: "Gemischte Glieder heben sich auf", s: [
        "Jeder Summand der ersten Klammer wird mit jedem der zweiten multipliziert:",
        "$$(a + b)(a - b) = a^2 - ab + ba - b^2",
        "Die mittleren Glieder $-ab$ und $+ba$ sind gleich groß mit entgegengesetztem Vorzeichen – sie heben sich auf:",
        "$$= a^2 - b^2",
      ] },
      { t: "Als Fläche umlegen", s: [
        "Vom Quadrat $a^2$ nehme das Eckquadrat $b^2$ weg. Es bleibt ein L-förmiges Stück mit der Fläche $a^2 - b^2$.",
        "Schneide den unteren Streifen (Breite $b$, Länge $a - b$) ab und lege ihn rechts an den senkrechten Streifen.",
        "Es entsteht ein Rechteck mit den Seiten $a + b$ und $a - b$. Gleiche Teile, gleiche Fläche:",
        "$$a^2 - b^2 = (a + b)(a - b)",
      ] },
      { t: "Zahlenprobe und Nutzen", s: [
        "$a = 7$, $b = 3$: $(7 + 3)(7 - 3) = 40$ und $49 - 9 = 40$. ✓",
        "Rückwärts gelesen zerlegt die Formel jede Differenz zweier Quadrate: $x^2 - 16 = (x + 4)(x - 4)$.",
      ] },
    ],
    bsp: ["$$x^2 - 9 = (x + 3)(x - 3), \\quad 49 \\cdot 51 = 50^2 - 1 = 2499"],
    falle: "Es gibt keine entsprechende Formel für eine Summe: $a^2 + b^2$ lässt sich im Reellen nicht zerlegen.",
    nutzt: [["distributiv", "ausmultipliziert"], ["rechteck", "Flächen umlegen"]],
    wz: "terme",
  },
  {
    id: "quadergaenzung", g: "Binomische Formeln", n: "Quadratische Ergänzung", st: "mittel",
    f: "x^2 + px = \\left(x + \\frac{p}{2}\\right)^2 - \\left(\\frac{p}{2}\\right)^2",
    k: "halber Koeffizient vor x, quadriert, addieren und wieder abziehen",
    bild: ["binomQuadrat", { modus: "ergaenzung" }],
    her: [
      { t: "Das fehlende Eckquadrat", s: [
        "$x^2 + px$ als Fläche: ein Quadrat $x^2$ und ein Rechteck $p \\cdot x$.",
        "Teilt man das Rechteck in zwei Streifen der Breite $\\frac{p}{2}$ und legt sie an zwei Seiten des Quadrats an, entsteht ein Quadrat, dem nur die Ecke fehlt.",
        "Die Ecke ist ein Quadrat der Seite $\\frac{p}{2}$ und hat die Fläche $\\left(\\frac{p}{2}\\right)^2$. Mit ihr ist das große Quadrat vollständig:",
        "$$x^2 + px + \\left(\\frac{p}{2}\\right)^2 = \\left(x + \\frac{p}{2}\\right)^2 || erste binomische Formel",
        "Was man ergänzt, muss man wieder abziehen, damit sich der Wert nicht ändert.",
      ] },
      { t: "Rückwärts mit der ersten binomischen Formel", s: [
        "Die erste binomische Formel für $a = x$ und $b = \\frac{p}{2}$ lautet:",
        "$$\\left(x + \\frac{p}{2}\\right)^2 = x^2 + 2 \\cdot x \\cdot \\frac{p}{2} + \\left(\\frac{p}{2}\\right)^2 = x^2 + px + \\left(\\frac{p}{2}\\right)^2",
        "Stelle nach $x^2 + px$ um: Das Quadrat ist schon da, nur das Eckquadrat muss wieder weg.",
      ] },
    ],
    bsp: ["$$x^2 + 6x + 2 = (x + 3)^2 - 9 + 2 = (x + 3)^2 - 7", "Der Scheitel dieser Parabel liegt bei $S(-3 | -7)$."],
    nutzt: [["binom1", "rückwärts gelesen"]],
    wz: "parabeln",
  },

  /* ---------------- Potenzen und Wurzeln ---------------- */
  {
    id: "potenzgesetze", g: "Potenzen und Wurzeln", n: "Potenzgesetze", st: "mittel",
    f: "a^m \\cdot a^n = a^{m+n}, \\quad \\frac{a^m}{a^n} = a^{m-n}",
    k: "gleiche Basis: Exponenten addieren bzw. subtrahieren",
    bild: ["potenzKetten", {}],
    her: [
      { t: "Faktoren zählen", s: [
        "$a^m$ heißt: $m$ Faktoren $a$. Multipliziert man mit $a^n$, kommen $n$ weitere Faktoren dazu:",
        "$$a^3 \\cdot a^2 = (a \\cdot a \\cdot a) \\cdot (a \\cdot a) = a^5",
        "Allgemein: $m$ Faktoren plus $n$ Faktoren sind $m + n$ Faktoren.",
        "Beim Teilen kürzen sich $n$ Faktoren weg:",
        "$$\\frac{a^5}{a^2} = \\frac{a \\cdot a \\cdot a \\cdot a \\cdot a}{a \\cdot a} = a^3",
      ] },
      { t: "Mit Zahlen prüfen", s: [
        "$$2^3 \\cdot 2^4 = 8 \\cdot 16 = 128 = 2^7 || 3 + 4 = 7",
        "$$\\frac{3^5}{3^2} = \\frac{243}{9} = 27 = 3^3 || 5 − 2 = 3",
      ] },
    ],
    bsp: ["$$x^4 \\cdot x^3 = x^7, \\quad \\frac{x^6}{x^2} = x^4"],
    falle: "Nur bei gleicher Basis: $2^3 \\cdot 3^2$ lässt sich nicht zusammenfassen. Und $a^m + a^n \\neq a^{m+n}$.",
    nutzt: [],
    wz: "terme",
  },
  {
    id: "potenz-pot", g: "Potenzen und Wurzeln", n: "Potenz einer Potenz", st: "mittel",
    f: "(a^m)^n = a^{m \\cdot n}, \\quad a^n \\cdot b^n = (ab)^n",
    k: "gleicher Exponent: Basen multiplizieren",
    bild: ["potenzGruppen", {}],
    her: [
      { t: "Potenz einer Potenz: Gruppen zählen", s: [
        "$(a^m)^n$ ist $n$-mal der Faktor $a^m$. In jedem davon stecken $m$ Faktoren $a$.",
        "$$(a^2)^3 = a^2 \\cdot a^2 \\cdot a^2 = a^{2+2+2} = a^6",
        "Allgemein: $n$ Gruppen mit je $m$ Faktoren sind $m \\cdot n$ Faktoren.",
      ] },
      { t: "Gleicher Exponent: Basen umsortieren", s: [
        "$$a^3 \\cdot b^3 = (a \\cdot a \\cdot a)(b \\cdot b \\cdot b)",
        "Bei einem Produkt darf man die Faktoren beliebig umsortieren (Kommutativ- und Assoziativgesetz):",
        "$$= (ab)(ab)(ab) = (ab)^3",
      ] },
      { t: "Zahlenprobe", s: [
        "$(2^3)^2 = 8^2 = 64 = 2^6$ ✓ und $2^3 \\cdot 5^3 = 8 \\cdot 125 = 1000 = 10^3$ ✓",
      ] },
    ],
    bsp: ["$$(x^3)^4 = x^{12}, \\quad 4^5 \\cdot 25^5 = 100^5"],
    falle: "$(a^2)^3 = a^6$, aber $a^{2^3} = a^8$ – die Klammer entscheidet.",
    nutzt: [["potenzgesetze", "mehrfach angewandt"], ["kommutativ", "Faktoren umsortieren"], ["assoziativ", "Faktoren neu klammern"]],
    wz: "terme",
  },
  {
    id: "potenzneg", g: "Potenzen und Wurzeln", n: "Negative Exponenten", st: "mittel",
    f: "a^{-n} = \\frac{1}{a^n}, \\quad a^0 = 1",
    k: "gilt für a ≠ 0",
    bild: ["potenzKetten", { negativ: true }],
    her: [
      { t: "Das Muster fortsetzen", s: [
        "$$2^3 = 8, \; 2^2 = 4, \; 2^1 = 2 || jeder Schritt nach rechts: mal 2, nach links: durch 2",
        "Konsequent weiter nach links: $2^0 = 1$, $2^{-1} = \\frac{1}{2}$, $2^{-2} = \\frac{1}{4}$.",
        "So bleibt das Muster ohne Bruch erhalten: Bei jedem Schritt wird durch 2 geteilt.",
      ] },
      { t: "Die Quotientenregel erzwingt es", s: [
        "Die Regel $\\frac{a^m}{a^n} = a^{m-n}$ soll auch für $m = n$ gelten:",
        "$$1 = \\frac{a^n}{a^n} = a^{n-n} = a^0",
        "Und für $m = 0$:",
        "$$\\frac{1}{a^n} = \\frac{a^0}{a^n} = a^{0-n} = a^{-n}",
      ] },
    ],
    bsp: ["$$5^{-2} = \\frac{1}{25}, \\quad \\left(\\frac{2}{3}\\right)^{-2} = \\left(\\frac{3}{2}\\right)^2 = \\frac{9}{4}"],
    falle: "Ein negativer Exponent macht die Zahl nicht negativ: $2^{-3} = \\frac{1}{8}$, nicht $-8$.",
    nutzt: [["potenzgesetze", "Quotientenregel erzwingt die Definition"], ["bruch-div", "Kehrwert eines Bruchs"]],
    wz: "terme",
  },
  {
    id: "wurzelpot", g: "Potenzen und Wurzeln", n: "Wurzel als Potenz", st: "mittel",
    f: "\\sqrt[n]{a^m} = a^{\\frac{m}{n}}",
    k: "Wurzelgesetze sind Potenzgesetze",
    bild: ["wurzelPotenz", {}],
    her: [
      { t: "Was soll ein Bruch im Exponenten sein?", s: [
        "Das Gesetz $(a^r)^n = a^{rn}$ soll weiter gelten, auch wenn $r$ ein Bruch ist. Dann ist:",
        "$$\\left(a^{\\frac{1}{n}}\\right)^n = a^{\\frac{1}{n} \\cdot n} = a^1 = a",
        "$a^{\\frac{1}{n}}$ ist also die Zahl, deren $n$-te Potenz $a$ ergibt – das ist genau die $n$-te Wurzel.",
        "$$a^{\\frac{m}{n}} = \\left(a^m\\right)^{\\frac{1}{n}} = \\sqrt[n]{a^m}",
      ] },
      { t: "Konkret mit Zahlen", s: [
        "$$9^{\\frac{1}{2}} = \\sqrt{9} = 3, \\quad \\text{denn } 3^2 = 9",
        "$$27^{\\frac{2}{3}} = \\left(\\sqrt[3]{27}\\right)^2 = 3^2 = 9",
      ] },
      { t: "Die Wurzelgesetze folgen aus den Potenzgesetzen", s: [
        "$$\\sqrt{a} \\cdot \\sqrt{b} = a^{\\frac{1}{2}} \\cdot b^{\\frac{1}{2}} = (ab)^{\\frac{1}{2}} = \\sqrt{ab}",
        "$$\\sqrt{\\sqrt{a}} = \\left(a^{\\frac{1}{2}}\\right)^{\\frac{1}{2}} = a^{\\frac{1}{4}}",
      ] },
    ],
    bsp: ["$$8^{\\frac{2}{3}} = \\sqrt[3]{8^2} = \\sqrt[3]{64} = 4"],
    falle: "$a^{\\frac{1}{2}}$ ist nicht $\\frac{a}{2}$, sondern $\\sqrt{a}$.",
    nutzt: [["potenz-pot", "(a^r)^n = a^{rn}"], ["potenzneg", "dieselbe Idee wie bei negativen Exponenten"]],
    wz: "terme",
  },

  /* ---------------- Logarithmen ---------------- */
  {
    id: "logdef", g: "Logarithmen", n: "Definition", st: "beide",
    f: "a^x = b \\quad\\Leftrightarrow\\quad x = \\log_a b",
    k: "Logarithmus ist der gesuchte Exponent",
    bild: ["logleiter", {}],
    her: [
      { t: "Die Umkehrung des Potenzierens", s: [
        "Potenzieren: Basis und Exponent gegeben, Ergebnis gesucht. Logarithmieren: Basis und Ergebnis gegeben, Exponent gesucht.",
        "$\\log_2 8 = 3$, weil $2^3 = 8$. $\\ln$ ist der Logarithmus zur Basis $e$, $\\lg$ der zur Basis 10.",
        "Weil $x = \\log_a b$ genau dann gilt, wenn $a^x = b$, kann man beide Seiten ineinander einsetzen:",
        "$$a^{\\log_a b} = b, \\quad \\log_a(a^x) = x",
      ] },
      { t: "Folgerungen", s: [
        "$$\\log_a 1 = 0 \\text{, denn } a^0 = 1",
        "$$\\log_a a = 1 \\text{, denn } a^1 = a",
        "Für $b \\leq 0$ gibt es keinen Exponenten, der $a^x = b$ erfüllt (eine positive Basis liefert nur positive Werte). Deshalb ist der Logarithmus nur für $b > 0$ definiert.",
      ] },
    ],
    bsp: ["$\\log_3 81 = 4$, $\\log_{10} 0{,}001 = -3$, $\\log_2 \\frac{1}{8} = -3$."],
    falle: "Nur für $b > 0$ definiert – keine Potenz einer positiven Basis ist null oder negativ.",
    nutzt: [["potenzgesetze", "Umkehrung des Potenzierens"], ["potenzneg", "negative Logarithmen für Zahlen unter 1"]],
    wz: "wachstum",
  },
  {
    id: "loggesetze", g: "Logarithmen", n: "Logarithmengesetze", st: "beide",
    f: "\\log(u \\cdot v) = \\log u + \\log v, \\quad \\log \\frac{u}{v} = \\log u - \\log v",
    k: "aus Produkten werden Summen",
    bild: ["logleiter", { modus: "produkt" }],
    her: [
      { t: "Potenzgesetze in Logarithmen übersetzt", s: [
        "Schreibe $u = a^r$ und $v = a^s$, also $r = \\log_a u$ und $s = \\log_a v$.",
        "$$u \\cdot v = a^r \\cdot a^s = a^{r+s} \;\\Rightarrow\; \\log_a(uv) = r + s = \\log_a u + \\log_a v",
        "Genauso beim Quotienten:",
        "$$\\frac{u}{v} = \\frac{a^r}{a^s} = a^{r-s} \;\\Rightarrow\; \\log_a \\frac{u}{v} = r - s = \\log_a u - \\log_a v",
      ] },
      { t: "Zahlenprobe", s: [
        "$\\log_2 (4 \\cdot 8) = \\log_2 32 = 5 = 2 + 3 = \\log_2 4 + \\log_2 8$ ✓",
        "Auf diesem Prinzip beruhte der Rechenschieber: Längen addieren statt Zahlen multiplizieren.",
      ] },
    ],
    bsp: ["$$\\ln 6 = \\ln 2 + \\ln 3, \\quad \\log_{10} 5 = \\log_{10} 10 - \\log_{10} 2"],
    falle: "$\\log(u + v)$ lässt sich nicht vereinfachen – und $\\log u + \\log v$ ist nicht $\\log(u + v)$.",
    nutzt: [["potenzgesetze", "a^r · a^s = a^{r+s}"], ["logdef", "Exponenten als Logarithmen"]],
    wz: "wachstum",
  },
  {
    id: "logpot", g: "Logarithmen", n: "Potenz im Logarithmus", st: "beide",
    f: "\\log(u^r) = r \\cdot \\log u",
    k: "der wichtigste Schritt beim Lösen von Exponentialgleichungen",
    bild: ["logPotenz", {}],
    her: [
      { t: "Produktregel r-mal", s: [
        "Für natürliche $r$ ist $u^r$ ein Produkt aus $r$ gleichen Faktoren. Das Logarithmengesetz für Produkte macht daraus eine Summe:",
        "$$\\log(u^r) = \\log(u \\cdot u \\cdots u) = \\log u + \\ldots + \\log u = r \\log u || r Summanden",
      ] },
      { t: "Über die Definition (für alle r)", s: [
        "Schreibe $u = a^s$, also $s = \\log_a u$. Dann ist nach dem Potenzgesetz $u^r = (a^s)^r = a^{rs}$.",
        "$$\\log_a(u^r) = \\log_a(a^{rs}) = rs = r \\log_a u",
        "Das gilt auch für negative und gebrochene $r$ – daraus folgt etwa $\\log \\sqrt{u} = \\frac{1}{2} \\log u$.",
      ] },
    ],
    bsp: ["$$\\log_2 (8^2) = \\log_2 64 = 6 = 2 \\cdot 3 = 2 \\cdot \\log_2 8", "$$\\ln (e^5) = 5 \\ln e = 5"],
    falle: "Der Exponent gehört nur dann vor den Logarithmus, wenn er zur ganzen Basis des Arguments gehört: $\\log(u^2 v) = 2\\log u + \\log v$.",
    nutzt: [["loggesetze", "Produktregel wiederholt"], ["potenz-pot", "(a^s)^r = a^{rs}"]],
    wz: "wachstum",
  },
  {
    id: "basiswechsel", g: "Logarithmen", n: "Basiswechsel", st: "ober",
    f: "\\log_a b = \\frac{\\ln b}{\\ln a}",
    k: "jeder Logarithmus lässt sich mit ln berechnen",
    bild: ["basiswechsel", {}],
    her: [
      { t: "Gleichung logarithmieren", s: [
        "Setze $x = \\log_a b$. Nach der Definition heißt das $a^x = b$.",
        "Beide Seiten werden mit $\\ln$ logarithmiert, danach kommt der Exponent nach vorn:",
        "$$\\ln(a^x) = \\ln b \;\\Rightarrow\; x \\ln a = \\ln b \;\\Rightarrow\; x = \\frac{\\ln b}{\\ln a}",
      ] },
      { t: "Allgemein für jede neue Basis c", s: [
        "Dieselbe Rechnung funktioniert mit jedem Logarithmus $\\log_c$:",
        "$$\\log_a b = \\frac{\\log_c b}{\\log_c a}",
        "Warum das sinnvoll ist: $\\log_c b$ misst die Strecke von $b$ in Einheiten von $c$, $\\log_c a$ die von $a$. Der Quotient sagt, wie oft die $a$-Strecke in die $b$-Strecke passt.",
      ] },
    ],
    bsp: ["$$\\log_2 10 = \\frac{\\ln 10}{\\ln 2} \\approx 3{,}32"],
    falle: "Im Taschenrechner steht oft nur $\\ln$ und $\\log$ (Basis 10). Für andere Basen immer den Basiswechsel verwenden.",
    nutzt: [["logpot", "Exponent vor den Logarithmus"], ["logdef", "Definition"]],
    wz: "wachstum",
  },

  /* ---------------- Gleichungen ---------------- */
  {
    id: "lineargl", g: "Gleichungen", n: "Lineare Gleichung", st: "mittel",
    f: "ax + b = 0 \\quad\\Rightarrow\\quad x = -\\frac{b}{a}",
    k: "Äquivalenzumformungen auf beiden Seiten",
    bild: ["waage", {}],
    her: [
      { t: "Die Waage im Gleichgewicht", s: [
        "Eine Gleichung ist eine Waage im Gleichgewicht. Was man auf einer Seite tut, muss man auf der anderen genauso tun.",
        "$$ax + b = 0 \\quad | -b \\quad\\Rightarrow\; ax = -b",
        "$$ax = -b \\quad | : a \\quad\\Rightarrow\; x = -\\frac{b}{a} || für a ≠ 0",
        "Erlaubt: auf beiden Seiten dasselbe addieren, subtrahieren, mit derselben Zahl ≠ 0 multiplizieren oder dividieren.",
      ] },
      { t: "Die Probe bestätigt die Lösung", s: [
        "$$a \\cdot \\left(-\\frac{b}{a}\\right) + b = -b + b = 0 \;✓",
        "Die Probe lohnt sich immer: Sie fängt Vorzeichenfehler.",
      ] },
      { t: "Die drei Fälle", s: [
        "Ist $a \\neq 0$, gibt es genau eine Lösung. Ist $a = 0$ und $b \\neq 0$, steht $b = 0$ da – ein Widerspruch, keine Lösung. Sind $a = 0$ und $b = 0$, steht $0 = 0$ da – jede Zahl ist Lösung.",
      ] },
    ],
    bsp: ["$$3x + 6 = 0 \;\\Rightarrow\; 3x = -6 \;\\Rightarrow\; x = -2"],
    falle: "Nicht durch 0 teilen – und nicht durch einen Term, der 0 sein könnte (dabei gehen Lösungen verloren).",
    nutzt: [["bruch-div", "Division durch a"]],
    wz: "gleichungen",
  },
  {
    id: "mitternacht", g: "Gleichungen", n: "Mitternachtsformel", st: "mittel",
    f: "x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    k: "für ax² + bx + c = 0 · Diskriminante entscheidet über die Anzahl",
    bild: ["parabel", { form: "normal", nullstellen: true }],
    her: [
      { t: "Quadratische Ergänzung allgemein", s: [
        "$$ax^2 + bx + c = 0 \;\\Leftrightarrow\; x^2 + \\frac{b}{a}x = -\\frac{c}{a} || durch a teilen",
        "$$x^2 + \\frac{b}{a}x + \\frac{b^2}{4a^2} = \\frac{b^2}{4a^2} - \\frac{c}{a} || \\left(\\frac{b}{2a}\\right)^2 auf beiden Seiten addieren",
        "$$\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2} || links: erste binomische Formel, rechts: gleicher Nenner",
        "$$x + \\frac{b}{2a} = \\pm\\frac{\\sqrt{b^2 - 4ac}}{2a} || Wurzel ziehen, beide Vorzeichen",
        "$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      ] },
      { t: "Über die Scheitelform", s: [
        "Jede Parabel lässt sich als $a(x - d)^2 + e$ schreiben, mit $d = -\\frac{b}{2a}$ und $e = c - \\frac{b^2}{4a}$.",
        "Nullsetzen: $(x - d)^2 = -\\frac{e}{a}$. Die Nullstellen liegen symmetrisch zur Scheitelstelle $d$, im Abstand $\\sqrt{-\\frac{e}{a}} = \\frac{\\sqrt{b^2 - 4ac}}{2|a|}$.",
        "Das ergibt dieselbe Formel: $x = d \\pm$ dieser Abstand.",
      ] },
      { t: "Probe an einem Beispiel", s: [
        "$2x^2 - 3x - 2 = 0$ mit $a = 2$, $b = -3$, $c = -2$ liefert $x_1 = 2$ und $x_2 = -\\frac{1}{2}$.",
        "Einsetzen: $2 \\cdot 4 - 6 - 2 = 0$ ✓ und $2 \\cdot \\frac{1}{4} + \\frac{3}{2} - 2 = 0$ ✓",
      ] },
    ],
    bsp: ["$$2x^2 - 3x - 2 = 0: \\quad x = \\frac{3 \\pm \\sqrt{9 + 16}}{4} = \\frac{3 \\pm 5}{4} \;\\Rightarrow\; x_1 = 2, \; x_2 = -\\frac{1}{2}"],
    falle: "$-b$ ist bei negativem $b$ positiv. Und der Bruchstrich gilt für $-b$ und die Wurzel gemeinsam.",
    nutzt: [["quadergaenzung", "allgemein durchgeführt"], ["binom1", "beim Ergänzen"], ["scheitelform", "alternative Herleitung"]],
    wz: "gleichungen",
  },
  {
    id: "pq", g: "Gleichungen", n: "pq-Formel", st: "mittel",
    f: "x_{1,2} = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}",
    k: "für x² + px + q = 0 · vorher durch a teilen",
    bild: ["parabel", { form: "normal", nullstellen: true }],
    her: [
      { t: "Quadratische Ergänzung", s: [
        "$$x^2 + px + q = 0 \;\\Leftrightarrow\; x^2 + px = -q",
        "$$x^2 + px + \\left(\\frac{p}{2}\\right)^2 = \\left(\\frac{p}{2}\\right)^2 - q || ergänzen",
        "$$\\left(x + \\frac{p}{2}\\right)^2 = \\left(\\frac{p}{2}\\right)^2 - q || erste binomische Formel",
        "$$x = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}",
      ] },
      { t: "Aus der Mitternachtsformel", s: [
        "Setze $a = 1$, $b = p$, $c = q$ in die Mitternachtsformel ein:",
        "$$x = \\frac{-p \\pm \\sqrt{p^2 - 4q}}{2} = -\\frac{p}{2} \\pm \\sqrt{\\frac{p^2 - 4q}{4}} = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}",
      ] },
      { t: "Über Vieta-Probe", s: [
        "Die beiden Ergebnisse haben die Summe $-p$ und das Produkt $\\left(\\frac{p}{2}\\right)^2 - \\left(\\left(\\frac{p}{2}\\right)^2 - q\\right) = q$ – genau wie nach Vieta verlangt.",
      ] },
    ],
    bsp: ["$$x^2 - 6x + 5 = 0: \\quad x = 3 \\pm \\sqrt{9 - 5} = 3 \\pm 2"],
    falle: "Nur anwenden, wenn vor $x^2$ eine 1 steht. Bei $-p/2$ das Vorzeichen von $p$ mitnehmen.",
    nutzt: [["mitternacht", "Spezialfall a = 1"], ["quadergaenzung", "direkt hergeleitet"], ["vieta", "Probe mit Summe und Produkt"]],
    wz: "gleichungen",
  },
  {
    id: "diskriminante", g: "Gleichungen", n: "Diskriminante", st: "mittel",
    f: "D = b^2 - 4ac",
    k: "D > 0: zwei Lösungen · D = 0: eine · D < 0: keine",
    bild: ["parabel", { form: "diskriminante" }],
    her: [
      { t: "Was unter der Wurzel steht", s: [
        "In der Mitternachtsformel steht $\\sqrt{D}$. Ist $D > 0$, liefern $+$ und $-$ zwei verschiedene Lösungen.",
        "Ist $D = 0$, ist $\\pm 0$ dasselbe – beide Lösungen fallen zusammen, $x = -\\frac{b}{2a}$. Der Scheitel liegt auf der x-Achse.",
        "Ist $D < 0$, gibt es keine reelle Wurzel – die Parabel schwebt über (oder unter) der x-Achse.",
      ] },
      { t: "Mit der Scheitelform", s: [
        "Der Scheitelwert ist $e = c - \\frac{b^2}{4a} = -\\frac{D}{4a}$.",
        "Für $a > 0$ liegt die Parabel oberhalb von $e$. Sie schneidet die x-Achse genau dann, wenn $e \\leq 0$, also $D \\geq 0$.",
        "$D > 0$ bedeutet Scheitel unter der Achse (zwei Schnittpunkte), $D = 0$ Scheitel auf der Achse (Berührpunkt), $D < 0$ Scheitel darüber (kein Schnitt).",
      ] },
    ],
    bsp: ["$x^2 + 2x + 5$: $D = 4 - 20 = -16 < 0$, keine Nullstelle."],
    nutzt: [["mitternacht", "Ausdruck unter der Wurzel"], ["scheitelform", "Scheitelwert e = −D/(4a)"]],
    wz: "parabeln",
  },
  {
    id: "vieta", g: "Gleichungen", n: "Satz von Vieta", st: "mittel",
    f: "x_1 + x_2 = -p, \\quad x_1 \\cdot x_2 = q",
    k: "schnelle Probe für die pq-Formel",
    bild: ["vietaBild", {}],
    her: [
      { t: "Nullstellenform ausmultiplizieren", s: [
        "Hat $x^2 + px + q$ die Nullstellen $x_1$ und $x_2$, lässt es sich als Produkt der Linearfaktoren schreiben:",
        "$$x^2 + px + q = (x - x_1)(x - x_2)",
        "Rechts ausmultiplizieren:",
        "$$(x - x_1)(x - x_2) = x^2 - (x_1 + x_2)x + x_1 x_2",
        "Koeffizientenvergleich mit $x^2 + px + q$: $p = -(x_1 + x_2)$ und $q = x_1 x_2$.",
      ] },
      { t: "Aus der pq-Formel", s: [
        "Setze die beiden Lösungen $x_{1,2} = -\\frac{p}{2} \\pm w$ mit $w = \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}$ ein.",
        "$$x_1 + x_2 = \\left(-\\frac{p}{2} + w\\right) + \\left(-\\frac{p}{2} - w\\right) = -p",
        "$$x_1 \\cdot x_2 = \\left(-\\frac{p}{2}\\right)^2 - w^2 = \\left(\\frac{p}{2}\\right)^2 - \\left(\\frac{p}{2}\\right)^2 + q = q || dritte binomische Formel",
      ] },
    ],
    bsp: ["$x^2 - 5x + 6 = 0$: Zwei Zahlen mit Summe 5 und Produkt 6 – das sind 2 und 3."],
    falle: "Die Summe ist $-p$, nicht $+p$. Und der Satz gilt nur, wenn vor $x^2$ eine 1 steht.",
    nutzt: [["linearfaktor", "ausmultipliziert"], ["pq", "alternative Herleitung"], ["binom3", "beim Produkt der Lösungen"]],
    wz: "gleichungen",
  },
  {
    id: "nullprodukt", g: "Gleichungen", n: "Satz vom Nullprodukt", st: "mittel",
    f: "a \\cdot b = 0 \\quad\\Leftrightarrow\\quad a = 0 \; \\lor \; b = 0",
    k: "erst ausklammern, dann jeden Faktor null setzen",
    bild: ["nullProdukt", {}],
    her: [
      { t: "Warum gerade null?", s: [
        "Ist $a \\neq 0$, darf man durch $a$ teilen: aus $ab = 0$ folgt $b = 0$. Also muss mindestens ein Faktor null sein.",
        "Umgekehrt: Ist $a = 0$ oder $b = 0$, ist das Produkt $0 \\cdot b = 0$ bzw. $a \\cdot 0 = 0$.",
      ] },
      { t: "Nur für die Null", s: [
        "Aus $ab = 6$ folgt gar nichts über $a$ oder $b$ einzeln: $2 \\cdot 3$, $1 \\cdot 6$, $0{,}5 \\cdot 12$ … alles passt.",
        "Deshalb muss jede Gleichung zuerst auf die Form »Produkt $= 0$« gebracht werden.",
      ] },
      { t: "Im Graphen", s: [
        "Das Produkt zweier Funktionen $f(x) \\cdot g(x)$ ist null, wo $f$ oder $g$ null ist. Im Bild: Die Parabel geht genau durch die Nullstellen der beiden Geraden.",
      ] },
    ],
    bsp: ["$$x^3 - 4x = x(x - 2)(x + 2) = 0 \;\\Rightarrow\; x \\in \\{-2; 0; 2\\}"],
    falle: "$(x - 1)(x + 2) = 6$ ist kein Nullprodukt – erst ausmultiplizieren und auf $= 0$ bringen.",
    nutzt: [["distributiv", "Ausklammern ist Distributivgesetz rückwärts"]],
    wz: "gleichungen",
  },
  {
    id: "substitution", g: "Gleichungen", n: "Substitution", st: "ober",
    f: "ax^4 + bx^2 + c = 0 \;\\Rightarrow\; az^2 + bz + c = 0 \\quad (z = x^2)",
    k: "biquadratisch · am Ende zurücksubstituieren",
    bild: ["substBild", {}],
    her: [
      { t: "Eine versteckte quadratische Gleichung", s: [
        "Mit $z = x^2$ ist $x^4 = (x^2)^2 = z^2$. Die Gleichung wird quadratisch in $z$:",
        "$$ax^4 + bx^2 + c = 0 \;\\Rightarrow\; az^2 + bz + c = 0",
        "Sie lässt sich mit der pq- oder Mitternachtsformel lösen.",
        "Rücksubstitution: Aus jedem $z > 0$ entstehen $x = \\pm\\sqrt{z}$, aus $z = 0$ wird $x = 0$, aus $z < 0$ keine Lösung (ein Quadrat ist nie negativ).",
      ] },
      { t: "Ein Beispiel komplett", s: [
        "$$x^4 - 5x^2 + 4 = 0 \;\\Rightarrow\; z^2 - 5z + 4 = 0 \;\\Rightarrow\; z = \\frac{5 \\pm 3}{2} \;\\Rightarrow\; z_1 = 4, \; z_2 = 1",
        "$$x^2 = 4 \\Rightarrow x = \\pm 2, \\quad x^2 = 1 \\Rightarrow x = \\pm 1",
      ] },
      { t: "Dieselbe Idee bei Exponentialgleichungen", s: [
        "Bei $e^{2x} - 3e^x + 2 = 0$ ist $e^{2x} = (e^x)^2$. Mit $z = e^x$ entsteht $z^2 - 3z + 2 = 0$, also $z = 1$ oder $z = 2$.",
        "Rücksubstitution: $e^x = 1 \\Rightarrow x = 0$ und $e^x = 2 \\Rightarrow x = \\ln 2$.",
      ] },
    ],
    bsp: ["$x^4 - 5x^2 + 4 = 0$ hat die vier Lösungen $x \\in \\{-2; -1; 1; 2\\}$."],
    falle: "Nach dem Lösen für $z$ nicht aufhören: Man sucht $x$, nicht $z$.",
    nutzt: [["pq", "quadratische Gleichung in z"], ["potenz-pot", "x⁴ = (x²)²"], ["expgl", "gleiche Idee mit z = eˣ"]],
    wz: "gleichungen",
  },
  {
    id: "expgl", g: "Gleichungen", n: "Exponentialgleichung", st: "beide",
    f: "a^x = b \\quad\\Rightarrow\\quad x = \\frac{\\ln b}{\\ln a}",
    k: "beide Seiten logarithmieren",
    bild: ["expGleichung", {}],
    her: [
      { t: "Exponent herunterholen", s: [
        "Wende auf beide Seiten den Logarithmus an – eine Äquivalenzumformung, solange $b > 0$:",
        "$$a^x = b \;\\Rightarrow\; \\ln(a^x) = \\ln b",
        "Nach dem Logarithmengesetz kommt der Exponent nach vorn:",
        "$$x \\ln a = \\ln b \;\\Rightarrow\; x = \\frac{\\ln b}{\\ln a}",
      ] },
      { t: "Über die Definition", s: [
        "Die Gleichung $a^x = b$ besagt: $x$ ist der Exponent, mit dem man $a$ potenzieren muss, um $b$ zu erhalten. Das ist die Definition des Logarithmus:",
        "$$x = \\log_a b = \\frac{\\ln b}{\\ln a} || Basiswechsel für den Taschenrechner",
      ] },
      { t: "Im Graphen", s: [
        "Der Graph von $a^x$ steigt an. Die waagerechte Gerade $y = b$ schneidet ihn bei genau einer Stelle (für $b > 0$) – das ist die Lösung.",
      ] },
    ],
    bsp: ["$$3 \\cdot 2^x = 24 \;\\Rightarrow\; 2^x = 8 \;\\Rightarrow\; x = 3", "$$e^{2x} = 5 \;\\Rightarrow\; 2x = \\ln 5 \;\\Rightarrow\; x = \\frac{\\ln 5}{2}"],
    falle: "Erst den Faktor vor der Potenz wegteilen, dann logarithmieren. Und $a^x = -3$ hat keine Lösung.",
    nutzt: [["logpot", "Exponent vor den Logarithmus"], ["basiswechsel", "dieselbe Rechnung"], ["logdef", "x = log_a b"]],
    wz: "gleichungen",
  },
  {
    id: "ungleichung", g: "Gleichungen", n: "Ungleichungen", st: "mittel",
    f: "a < b \;\\Rightarrow\; -a > -b",
    k: "Mal oder geteilt durch eine negative Zahl: Zeichen umdrehen",
    bild: ["ungleichungBild", {}],
    her: [
      { t: "Spiegeln am Nullpunkt", s: [
        "Auf dem Zahlenstrahl liegt $a$ links von $b$. Multipliziert man mit $-1$, wird alles am Nullpunkt gespiegelt – jetzt liegt $-a$ rechts von $-b$.",
        "Addieren und Subtrahieren ändern die Richtung nie, Multiplizieren mit positiven Zahlen auch nicht.",
      ] },
      { t: "Rechnerisch", s: [
        "$a < b$ heißt: $b - a > 0$. Mit $-1$ multipliziert:",
        "$$(-a) - (-b) = b - a > 0 \;\\Rightarrow\; -a > -b",
        "Allgemein für $c < 0$: aus $a < b$ folgt $ac > bc$, weil $bc - ac = (b - a) c$ negativ ist.",
      ] },
      { t: "Ein Beispiel Schritt für Schritt", s: [
        "$$-2x < 6 \\quad | : (-2) \;\\Rightarrow\; x > -3 || Zeichen dreht sich",
        "Probe: $x = 0$ ist größer als $-3$ und $-2 \\cdot 0 = 0 < 6$ ✓. Dagegen $x = -5$: $-2 \\cdot (-5) = 10 > 6$ ✗.",
      ] },
    ],
    bsp: ["$$-2x < 6 \;\\Rightarrow\; x > -3"],
    falle: "Auch beim Logarithmieren mit $\\ln q$ für $0 < q < 1$ ist $\\ln q < 0$ – dann dreht sich das Zeichen.",
    nutzt: [["lineargl", "dieselben Umformungen mit einer Ausnahme"], ["intervalle", "Lösungsmenge als Intervall"]],
    wz: "gleichungen",
  },
  {
    id: "polydiv", g: "Gleichungen", n: "Polynomdivision", st: "ober",
    f: "f(x) = (x - x_0) \\cdot g(x) \\quad \\text{wenn } f(x_0) = 0",
    k: "eine Nullstelle raten, dann den Grad um 1 senken",
    bild: ["polyDivBild", {}],
    her: [
      { t: "Linearfaktor abspalten", s: [
        "Teile $f(x)$ durch $(x - x_0)$ mit Rest: $f(x) = (x - x_0) \\cdot g(x) + R$. Der Rest ist eine Zahl, weil der Teiler den Grad 1 hat.",
        "Setzt man $x = x_0$ ein, verschwindet der erste Summand:",
        "$$f(x_0) = 0 \\cdot g(x_0) + R = R",
        "Ist $x_0$ also eine Nullstelle, ist der Rest 0 – die Division geht auf, und $g(x)$ hat einen Grad weniger.",
      ] },
      { t: "Nullstellen raten", s: [
        "Hat ein Polynom mit ganzzahligen Koeffizienten und Leitkoeffizient 1 eine ganzzahlige Nullstelle, ist sie ein Teiler des Absolutglieds.",
        "Bei $x^3 - 6x^2 + 11x - 6$ also nur $\\pm 1, \\pm 2, \\pm 3, \\pm 6$ probieren.",
      ] },
      { t: "Schriftlich rechnen", s: [
        "$$(x^3 - 6x^2 + 11x - 6) : (x - 1) = x^2 - 5x + 6",
        "Erst $x^3 : x = x^2$, zurückmultiplizieren $x^3 - x^2$, abziehen: $-5x^2 + 11x$. Dann $-5x^2 : x = -5x$, zurückmultiplizieren $-5x^2 + 5x$, abziehen: $6x - 6$. Zuletzt $6x - 6 = 6(x - 1)$, Rest 0.",
      ] },
      { t: "Das Horner-Schema als Abkürzung", s: [
        "Die Koeffizienten des Quotienten entstehen durch wiederholtes »Multiplizieren mit $x_0$ und Addieren«. Das Schema im Bild rechnet gleichzeitig $f(x_0)$ aus.",
      ] },
    ],
    bsp: ["$x^3 - 6x^2 + 11x - 6$: $x = 1$ passt.", "$$(x^3 - 6x^2 + 11x - 6) : (x - 1) = x^2 - 5x + 6 = (x - 2)(x - 3)"],
    nutzt: [["nullprodukt", "danach Faktoren einzeln lösen"], ["teiler", "Kandidaten für die Nullstelle"], ["linearfaktor", "Nullstellenform"]],
    wz: "gleichungen",
  },

  /* ---------------- Gleichungssysteme ---------------- */
  {
    id: "gauss", g: "Gleichungssysteme", n: "Gauß-Verfahren", st: "beide",
    f: "\\text{LGS} \\;\\to\\; \\text{Stufenform} \\;\\to\\; \\text{rückwärts einsetzen}",
    k: "Variablen schrittweise eliminieren, dann von unten nach oben einsetzen",
    bild: ["gaussStufen", {}],
    her: { t: "Treppe bauen", s: [
      "Erlaubt sind drei Umformungen, die die Lösungsmenge nicht ändern: Gleichungen vertauschen, eine Gleichung mit einer Zahl ≠ 0 multiplizieren, ein Vielfaches einer Gleichung zu einer anderen addieren.",
      "Damit eliminiert man $x_1$ aus Gleichung II und III, dann $x_2$ aus III. Es entsteht eine Treppe (Stufenform).",
      "Die letzte Zeile enthält nur noch $x_3$. Einsetzen von unten nach oben liefert $x_2$ und $x_1$.",
    ] },
    bsp: ["$$\\text{I: } x + y + z = 6, \\;\\text{II: } 2x - y + z = 3, \\;\\text{III: } x + 2y - z = 2", "II − 2·I: $-3y - z = -9$. III − I: $y - 2z = -4$. Dann $z = 3$, $y = 2$, $x = 1$."],
    falle: "Immer mit der ganzen Gleichung rechnen – auch die rechte Seite.",
    nutzt: [["lineargl", "Äquivalenzumformungen"]],
    wz: "lgs",
  },
  {
    id: "lgs-loesbar", g: "Gleichungssysteme", n: "Lösbarkeit eines LGS", st: "beide",
    f: "0 = c \\neq 0 \\Rightarrow \\text{keine}, \\quad 0 = 0 \\Rightarrow \\text{unendlich viele}",
    k: "die letzte Zeile der Stufenform entscheidet",
    bild: ["lgsLage", {}],
    her: [
      { t: "Was in der letzten Zeile steht", s: [
        "Eindeutig lösbar: In jeder Stufe bleibt eine Variable mit Koeffizient ≠ 0.",
        "Widerspruch wie $0 = 5$: keine Lösung – eine Gleichung, die für kein $x$ stimmt, macht das ganze System unlösbar.",
        "Nullzeile $0 = 0$: Sie stimmt immer. Eine Variable ist frei wählbar – unendlich viele Lösungen.",
      ] },
      { t: "Geometrisch bei zwei Gleichungen", s: [
        "Jede Gleichung $ax + by = c$ ist eine Gerade. Die Lösungen des Systems sind die gemeinsamen Punkte.",
        "Verschiedene Steigung: genau ein Schnittpunkt. Gleiche Steigung, verschiedene Höhe: parallel, kein gemeinsamer Punkt. Gleiche Gerade: alle Punkte gemeinsam.",
      ] },
      { t: "Im Raum bei drei Gleichungen", s: [
        "Drei Ebenen schneiden sich in einem Punkt, nie gemeinsam (z. B. zwei parallele Ebenen), oder in einer Geraden (z. B. drei Ebenen eines Büschels).",
      ] },
    ],
    bsp: ["$x + y = 2$ und $x + y = 5$: Subtrahieren gibt $0 = 3$ – keine Lösung.", "$x + y = 2$ und $2x + 2y = 4$: Die zweite Gleichung ist doppelt so groß – unendlich viele Lösungen."],
    nutzt: [["gauss", "Stufenform"], ["schnittpunkt", "zwei Geraden schneiden sich"], ["lage-geraden", "Lage im Raum"]],
    wz: "lgs",
  },
];
