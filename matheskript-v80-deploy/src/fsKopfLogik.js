/* FORMELSAMMLUNG · KOPFRECHNEN sowie MENGENLEHRE UND LOGIK (Aufbau: siehe fsAnalysis.js) */

export const FS_KOPF = [
  /* ---------------- Rechengesetze ---------------- */
  {
    id: "kommutativ", g: "Rechengesetze", n: "Kommutativgesetz", st: "unter-mittel", kl: 5,
    f: "a + b = b + a, \\quad a \\cdot b = b \\cdot a",
    k: "Reihenfolge so wählen, dass es leichter wird",
    bild: ["flaechen", { art: "drehen" }],
    her: { t: "Gedrehtes Rechteck", s: [
      "Ein Rechteck aus $a$ Reihen zu $b$ Kästchen hat, um 90° gedreht, $b$ Reihen zu $a$ Kästchen – es sind dieselben Kästchen.",
      "Bei der Addition: $a$ Steine und $b$ Steine in eine Reihe gelegt, von links oder von rechts gezählt.",
    ] },
    falle: "Nicht für Minus und Geteilt: $5 - 3 \\neq 3 - 5$.",
    nutzt: [["rechteck", "a · b Kästchen"]],
    wz: "kopf",
  },
  {
    id: "assoziativ", g: "Rechengesetze", n: "Assoziativgesetz", st: "unter-mittel", kl: 5,
    f: "(a + b) + c = a + (b + c)",
    k: "z. B. 37 + 48 + 52 = 37 + 100",
    bild: ["assoziativBild", {}],
    her: [
      { t: "Haufen zusammenschieben", s: [
        "Beim Zusammenzählen ist es egal, welche zwei Haufen man zuerst zusammenschiebt – am Ende liegen alle zusammen.",
        "$$(a + b) + c = a + (b + c) || beide Wege führen zur Gesamtzahl der Steine",
      ] },
      { t: "Bei der Multiplikation: der Quader", s: [
        "Ein Quader aus $a \\cdot b \\cdot c$ Würfeln: Zählt man erst eine Schicht ($a \\cdot b$) und nimmt diese $c$-mal, erhält man $(a \\cdot b) \\cdot c$.",
        "Zählt man erst eine Säule ($b \\cdot c$) und nimmt diese $a$-mal, erhält man $a \\cdot (b \\cdot c)$. Es sind dieselben Würfel.",
        "$$(a \\cdot b) \\cdot c = a \\cdot (b \\cdot c)",
      ] },
      { t: "Mit Zahlen", s: [
        "$$37 + 48 + 52 = 37 + (48 + 52) = 37 + 100 = 137",
        "$$4 \\cdot 17 \\cdot 25 = 17 \\cdot (4 \\cdot 25) = 1700",
      ] },
    ],
    bsp: ["$$4 \\cdot 17 \\cdot 25 = 17 \\cdot (4 \\cdot 25) = 1700"],
    falle: "Gilt nur für Plus und Mal. Bei Minus und Geteilt ändert die Klammer das Ergebnis: $(8 - 4) - 2 = 2$, aber $8 - (4 - 2) = 6$.",
    nutzt: [["kommutativ", "zusammen mit dem Vertauschen"]],
    wz: "kopf",
  },
  {
    id: "distributiv", g: "Rechengesetze", n: "Distributivgesetz", st: "unter-mittel", kl: 5,
    f: "a \\cdot (b + c) = a \\cdot b + a \\cdot c",
    k: "z. B. 7 · 49 = 7 · 50 − 7 = 343",
    bild: ["flaechen", { art: "distributiv" }],
    her: { t: "Rechteck teilen", s: [
      "Ein Rechteck der Höhe $a$ und Breite $b + c$ lässt sich in zwei Rechtecke $a \\cdot b$ und $a \\cdot c$ zerschneiden.",
      "Rückwärts gelesen ist das Ausklammern: $ab + ac = a(b + c)$.",
    ] },
    bsp: ["$$7 \\cdot 49 = 7 \\cdot (50 - 1) = 350 - 7 = 343"],
    nutzt: [["rechteck", "Rechteck in zwei Teile geschnitten"]],
    wz: "kopf",
  },

  /* ---------------- Rechentricks ---------------- */
  {
    id: "mal11", g: "Rechentricks", n: "Mal 11", st: "unter-mittel", kl: 5,
    f: "43 \\cdot 11 = 4 \\, (4+3) \\, 3 = 473",
    k: "Ziffernsumme in die Mitte · bei Übertrag vorne +1",
    bild: ["mal11Bild", {}],
    her: [
      { t: "Warum es funktioniert", s: [
        "Eine zweistellige Zahl ist $10a + b$. Mal 11 heißt mal 10 plus einmal:",
        "$$(10a + b) \\cdot 11 = (10a + b) \\cdot 10 + (10a + b) = 100a + 10b + 10a + b",
        "$$= 100a + 10(a + b) + b",
        "Hunderter $a$, Zehner $a + b$, Einer $b$. Ist $a + b \\geq 10$, wandert die 1 zu den Hundertern.",
      ] },
      { t: "Schriftlich untereinander", s: [
        "Die Zahl und die Zahl um eine Stelle verschoben addieren:",
        "$$43 \\cdot 11 = 430 + 43 = 473 || Zahl mal 10 plus die Zahl",
        "Spalte für Spalte: Einer 3, Zehner $4 + 3 = 7$, Hunderter 4.",
        "Genau das ist der Trick: außen die Ziffern, in der Mitte ihre Summe.",
      ] },
    ],
    bsp: ["$$78 \\cdot 11: \\; 7 + 8 = 15 \\;\\Rightarrow\\; 7 + 1 = 8, \\; 5, \\; 8 \\;\\Rightarrow\\; 858"],
    falle: "Bei Ziffernsumme ab 10 den Übertrag nicht vergessen.",
    nutzt: [["distributiv", "mal 10 plus mal 1"], ["teil11", "gleiche Zahl 11 – andere Regel"]],
    wz: "kopf",
  },
  {
    id: "mal5", g: "Rechentricks", n: "Mal 5", st: "unter-mittel", kl: 5,
    f: "a \\cdot 5 = \\frac{a \\cdot 10}{2}",
    k: "z. B. 68 · 5 = 680 : 2 = 340",
    bild: ["malZehnHalb", { f: 5 }],
    her: [
      { t: "5 ist die Hälfte von 10", s: [
        "$$a \\cdot 5 = a \\cdot \\frac{10}{2} = \\frac{a \\cdot 10}{2}",
        "Mal 10 ist leicht (eine Null anhängen), halbieren auch.",
      ] },
      { t: "Mit dem Assoziativgesetz", s: [
        "$$a \\cdot 5 = a \\cdot (10 : 2) = (a \\cdot 10) : 2 || Klammern anders gesetzt",
        "Alternativ erst halbieren, dann mal 10: $68 \\cdot 5 = 34 \\cdot 10 = 340$ – bei geraden Zahlen praktisch.",
      ] },
    ],
    bsp: ["$$68 \\cdot 5 = 680 : 2 = 340"],
    nutzt: [["assoziativ", "Faktoren umgruppiert"], ["bruch-mul", "5 = 10/2"]],
    wz: "kopf",
  },
  {
    id: "mal25", g: "Rechentricks", n: "Mal 25", st: "unter-mittel", kl: 5,
    f: "a \\cdot 25 = \\frac{a \\cdot 100}{4}",
    k: "z. B. 36 · 25 = 3600 : 4 = 900",
    bild: ["malZehnHalb", { f: 25 }],
    her: [
      { t: "25 ist ein Viertel von 100", s: [
        "$$a \\cdot 25 = a \\cdot \\frac{100}{4} = \\frac{a \\cdot 100}{4}",
        "Zwei Nullen anhängen, dann zweimal halbieren.",
      ] },
      { t: "Aus der Regel für 5", s: [
        "$25 = 5 \\cdot 5$, also zweimal mal 5. Oder $25 \\cdot 4 = 100$: Vier 25er sind ein Hunderter – deshalb ist $4 \\cdot 17 \\cdot 25 = 1700$.",
      ] },
    ],
    bsp: ["$$36 \\cdot 25 = 3600 : 4 = 900"],
    nutzt: [["mal5", "dieselbe Idee"], ["assoziativ", "Faktoren umgruppiert"]],
    wz: "kopf",
  },
  {
    id: "quadrat5", g: "Rechentricks", n: "Quadrat mit Endziffer 5", st: "unter-mittel", kl: 5,
    f: "(10a + 5)^2 = a(a+1) \\cdot 100 + 25",
    k: "z. B. 65² : 6 · 7 = 42, dahinter 25 → 4225",
    bild: ["binomQuadrat", { modus: "fuenf" }],
    her: { t: "Erste binomische Formel", s: [
      "$$(10a + 5)^2 = 100a^2 + 2 \\cdot 10a \\cdot 5 + 25 = 100a^2 + 100a + 25",
      "$$= 100 \\cdot a(a + 1) + 25 || 100 ausgeklammert",
    ] },
    bsp: ["$$85^2: \\; 8 \\cdot 9 = 72 \\;\\Rightarrow\\; 7225"],
    nutzt: [["binom1", "(10a + 5)² ausmultipliziert"], ["distributiv", "100 ausgeklammert"]],
    wz: "kopf",
  },
  {
    id: "mitte", g: "Rechentricks", n: "Um die Mitte herum", st: "unter-mittel", kl: 5,
    f: "49 \\cdot 51 = 50^2 - 1^2 = 2499",
    k: "dritte binomische Formel im Kopf",
    bild: ["binomQuadrat", { modus: "drei" }],
    her: { t: "Zwei Zahlen gleich weit von der Mitte", s: [
      "Liegen zwei Zahlen symmetrisch um eine runde Zahl $m$, sind sie $m - d$ und $m + d$.",
      "$$(m - d)(m + d) = m^2 - d^2",
    ] },
    bsp: ["$$38 \\cdot 42 = 40^2 - 2^2 = 1596"],
    nutzt: [["binom3", "direkt angewandt"]],
    wz: "kopf",
  },
  {
    id: "nahe100", g: "Rechentricks", n: "Nahe an 100", st: "unter-mittel", kl: 5,
    f: "98 \\cdot 97 = (98 - 3) \\cdot 100 + 2 \\cdot 3 = 9506",
    k: "Abstände zu 100 multiplizieren und anhängen",
    bild: ["nahe100Bild", {}],
    her: [
      { t: "Ausmultiplizieren mit Abständen", s: [
        "Schreibe die Zahlen als $100 - a$ und $100 - b$:",
        "$$(100 - a)(100 - b) = 10\\,000 - 100a - 100b + ab",
        "Die ersten Glieder passen zu $100 \\cdot (100 - a - b)$:",
        "$$= (100 - a - b) \\cdot 100 + ab",
        "$100 - a - b$ ist die erste Zahl minus den Abstand der zweiten. Dahinter das Produkt der Abstände (zweistellig).",
      ] },
      { t: "Als Flächenbild", s: [
        "Ein Quadrat $100 \\times 100$. Die gesuchte Fläche $(100 - a)(100 - b)$ ist das Quadrat ohne zwei Randstreifen. Dabei wurde das Eck $a \\cdot b$ zweimal abgezogen – es kommt einmal zurück.",
      ] },
    ],
    bsp: ["$$96 \\cdot 93: \\; 96 - 7 = 89, \\; 4 \\cdot 7 = 28 \\;\\Rightarrow\\; 8928"],
    falle: "Ist das Produkt der Abstände einstellig, vorne eine Null ergänzen: $98 \\cdot 99$: $97$ und $02$ ⇒ 9702.",
    nutzt: [["distributiv", "Klammern ausmultipliziert"], ["binom2", "ähnliche Struktur"]],
    wz: "kopf",
  },

  /* ---------------- Teilbarkeit ---------------- */
  {
    id: "teil2510", g: "Teilbarkeit", n: "Durch 2, 5, 10", st: "unter-mittel", kl: 5,
    f: "\\text{Endziffer prüfen}",
    k: "2: gerade · 5: 0 oder 5 · 10: 0",
    bild: ["teilCheck", { regel: "2510" }],
    her: [
      { t: "Der Rest steckt in der letzten Ziffer", s: [
        "Jede Zahl ist $10 \\cdot q + e$ mit der Endziffer $e$.",
        "$10q = 2 \\cdot 5q$ ist durch 2, durch 5 und durch 10 teilbar. Es kommt nur auf $e$ an.",
        "Also ist die Zahl genau dann durch 2, 5 oder 10 teilbar, wenn die Endziffer $e$ es ist.",
      ] },
      { t: "Probe an einem Beispiel", s: [
        "$$3\\,475 = 347 \\cdot 10 + 5 \\;\\Rightarrow\\; \\text{durch 5 teilbar, nicht durch 2}",
      ] },
    ],
    falle: "Für 4 reicht die Endziffer nicht: 14 ist gerade, aber nicht durch 4 teilbar.",
    nutzt: [["distributiv", "10q ausgeklammert"], ["teiler", "10 = 2 · 5"]],
    wz: "kopf",
  },
  {
    id: "teil39", g: "Teilbarkeit", n: "Durch 3 und 9", st: "unter-mittel", kl: 5,
    f: "\\text{Quersumme durch 3 bzw. 9 teilbar}",
    k: "z. B. 4572: Quersumme 18 → durch 3 und 9 teilbar",
    bild: ["teilCheck", { regel: "39" }],
    her: [
      { t: "10 lässt bei 9 den Rest 1", s: [
        "$10 = 9 + 1$, $100 = 99 + 1$, $1000 = 999 + 1$ – jede Zehnerpotenz ist ein Vielfaches von 9 plus 1.",
        "$$4572 = 4 \\cdot 1000 + 5 \\cdot 100 + 7 \\cdot 10 + 2 = 4 \\cdot 999 + 5 \\cdot 99 + 7 \\cdot 9 + (4 + 5 + 7 + 2)",
        "Der erste Teil ist durch 9 (und 3) teilbar. Also hat die Zahl beim Teilen durch 9 denselben Rest wie ihre Quersumme 18.",
      ] },
      { t: "Allgemein", s: [
        "Eine Zahl mit den Ziffern $z_n \\ldots z_1 z_0$ ist $\\sum z_i \\cdot 10^i$. Weil $10^i - 1 = 99\\ldots9$ durch 9 teilbar ist, gilt:",
        "$$\\sum z_i \\cdot 10^i = \\sum z_i \\cdot (10^i - 1) + \\sum z_i",
        "Der erste Summand ist durch 9 und 3 teilbar. Die Zahl ist also durch 3 bzw. 9 teilbar, genau wenn die Quersumme es ist.",
      ] },
    ],
    bsp: ["$4\\,572$: Quersumme 18 – durch 9, also auch durch 3 teilbar."],
    falle: "Gilt nur für 3 und 9, nicht für 6: Quersumme 12 heißt noch nicht durch 6 teilbar (z. B. 39).",
    nutzt: [["distributiv", "Zehnerpotenzen zerlegt"], ["teiler", "9 = 3 · 3"]],
    wz: "kopf",
  },
  {
    id: "teil48", g: "Teilbarkeit", n: "Durch 4 und 8", st: "unter-mittel", kl: 6,
    f: "\\text{letzte 2 bzw. 3 Ziffern}",
    k: "z. B. 7316: 16 ist durch 4 teilbar",
    bild: ["teilCheck", { regel: "48" }],
    her: [
      { t: "100 ist durch 4 teilbar", s: [
        "$100 = 4 \\cdot 25$, also ist jedes Vielfache von 100 durch 4 teilbar. Es zählt nur der Rest: die letzten zwei Ziffern.",
        "$$7316 = 73 \\cdot 100 + 16 \\;\\Rightarrow\\; \\text{durch 4 teilbar, wenn 16 es ist}",
      ] },
      { t: "1000 ist durch 8 teilbar", s: [
        "$1000 = 8 \\cdot 125$ – für 8 entscheiden die letzten drei Ziffern: Zahl $= 1000q + r$ mit $r$ dreistellig.",
        "Dasselbe Prinzip gilt für 2, 4, 8, 16 … : Man braucht die letzten 1, 2, 3, 4 … Ziffern, weil $10^k$ durch $2^k$ teilbar ist.",
      ] },
    ],
    nutzt: [["teil2510", "dieselbe Idee eine Stelle weiter"], ["distributiv", "100 ausgeklammert"]],
    wz: "kopf",
  },
  {
    id: "teil6", g: "Teilbarkeit", n: "Durch 6", st: "unter-mittel", kl: 5,
    f: "\\text{durch 2 und durch 3}",
    k: "beide Regeln müssen gelten",
    bild: ["teilCheck", { regel: "6" }],
    her: [
      { t: "Teilerfremde Faktoren", s: [
        "$6 = 2 \\cdot 3$, und 2 und 3 haben keinen gemeinsamen Teiler. Ist eine Zahl durch beide teilbar, enthält ihre Primfaktorzerlegung 2 und 3 – also auch 6.",
        "Umgekehrt ist jede durch 6 teilbare Zahl durch 2 und 3 teilbar, weil 2 und 3 Teiler von 6 sind.",
      ] },
      { t: "Warnung: nicht-teilerfremde Faktoren", s: [
        "Durch 4 und 6 teilbar heißt nicht durch 24 teilbar: 12 ist ein Gegenbeispiel, weil 4 und 6 den Teiler 2 gemeinsam haben.",
        "Allgemein: Für teilerfremde $a, b$ gilt »durch $a$ und $b$ ⇒ durch $ab$«.",
      ] },
    ],
    nutzt: [["teil2510", "Teil 1"], ["teil39", "Teil 2"], ["teiler", "Primfaktoren"]],
    wz: "kopf",
  },
  {
    id: "teil11", g: "Teilbarkeit", n: "Durch 11", st: "unter-mittel", kl: 6,
    f: "\\text{alternierende Quersumme durch 11 teilbar}",
    k: "Ziffern abwechselnd addieren und subtrahieren, von rechts",
    bild: ["teilCheck", { regel: "11" }],
    her: [
      { t: "10 lässt bei 11 den Rest −1", s: [
        "$10 = 11 - 1$, $100 = 99 + 1$, $1000 = 1001 - 1$. Die Zehnerpotenzen sind abwechselnd »Vielfaches von 11 minus 1« und »plus 1«.",
        "Deshalb hat eine Zahl beim Teilen durch 11 denselben Rest wie ihre alternierende Quersumme.",
      ] },
      { t: "Mit einer dreistelligen Zahl", s: [
        "$$100a + 10b + c = (99a + 11b) + (a - b + c)",
        "$99a + 11b = 11(9a + b)$ ist durch 11 teilbar. Übrig bleibt $a - b + c$ – die alternierende Quersumme.",
      ] },
    ],
    bsp: ["$918\\,082$: $2 - 8 + 0 - 8 + 1 - 9 = -22$ – durch 11 teilbar."],
    falle: "Es zählt nicht die gewöhnliche Quersumme: 29 hat Quersumme 11, ist aber nicht durch 11 teilbar.",
    nutzt: [["teil39", "dieselbe Idee mit Rest −1"], ["mal11", "Mal 11 und Teilbarkeit durch 11"]],
    wz: "kopf",
  },
  {
    id: "teiler", g: "Teilbarkeit", n: "Primfaktorzerlegung", st: "unter-mittel", kl: 5,
    f: "360 = 2^3 \\cdot 3^2 \\cdot 5",
    k: "jede natürliche Zahl > 1 ist eindeutig ein Produkt von Primzahlen",
    bild: ["primbaum", {}],
    her: { t: "Teilen, bis nur Primzahlen übrig sind", s: [
      "Eine Zahl, die keine Primzahl ist, hat einen kleineren Teiler und lässt sich zerlegen. Das geht so lange, bis nur Primzahlen übrig sind.",
      "Aus der Zerlegung liest man alle Teiler ab: Jeder Teiler von $2^3 \\cdot 3^2 \\cdot 5$ ist $2^i 3^j 5^k$ mit $i \\leq 3$, $j \\leq 2$, $k \\leq 1$. Anzahl: $4 \\cdot 3 \\cdot 2 = 24$.",
      "ggT: kleinste gemeinsame Exponenten. kgV: größte Exponenten.",
    ] },
    nutzt: [["komb-mm", "Anzahl der Teiler über die Produktregel"]],
    wz: "kopf",
  },

  /* ---------------- Bruchrechnen ---------------- */
  {
    id: "bruch-kuerzen", g: "Bruchrechnen", n: "Kürzen und Erweitern", st: "unter-mittel", kl: 6,
    f: "\\frac{a}{b} = \\frac{a \\cdot k}{b \\cdot k}",
    k: "Zähler und Nenner mit derselben Zahl ≠ 0 multiplizieren oder teilen",
    bild: ["bruchStreifen", { modus: "kuerzen" }],
    her: { t: "Feiner schneiden", s: [
      "Teilt man jedes Stück einer Torte noch einmal in $k$ Teile, hat man $k$-mal so viele Stücke ($b \\cdot k$) und davon $k$-mal so viele ($a \\cdot k$) – die Menge Torte bleibt gleich.",
    ] },
    falle: "Nur Faktoren kürzen, keine Summanden: $\\frac{x + 2}{2} \\neq x$.",
    nutzt: [],
    wz: "kopf",
  },
  {
    id: "bruch-add", g: "Bruchrechnen", n: "Addieren", st: "unter-mittel", kl: 6,
    f: "\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}",
    k: "erst auf einen gemeinsamen Nenner bringen",
    bild: ["bruchStreifen", { modus: "addieren" }],
    her: { t: "Gleich große Stücke", s: [
      "Man kann nur gleich große Stücke zusammenzählen. Erweitern auf den gemeinsamen Nenner $bd$:",
      "$$\\frac{a}{b} + \\frac{c}{d} = \\frac{ad}{bd} + \\frac{bc}{bd} = \\frac{ad + bc}{bd}",
      "Mit dem kleinsten gemeinsamen Vielfachen der Nenner bleiben die Zahlen kleiner.",
    ] },
    bsp: ["$$\\frac{1}{4} + \\frac{1}{6} = \\frac{3}{12} + \\frac{2}{12} = \\frac{5}{12}"],
    falle: "$\\frac{1}{2} + \\frac{1}{3} \\neq \\frac{2}{5}$.",
    nutzt: [["bruch-kuerzen", "beide Brüche erweitern"]],
    wz: "kopf",
  },
  {
    id: "bruch-mul", g: "Bruchrechnen", n: "Multiplizieren", st: "unter-mittel", kl: 6,
    f: "\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d}",
    k: "vorher kürzen spart Arbeit",
    bild: ["bruchStreifen", { modus: "mal" }],
    her: { t: "Ein Teil von einem Teil", s: [
      "$\\frac{2}{3}$ von $\\frac{4}{5}$: Ein Rechteck wird waagerecht in 5 und senkrecht in 3 Streifen geteilt. Von den $3 \\cdot 5 = 15$ Feldern liegen $2 \\cdot 4 = 8$ in beiden Anteilen.",
    ] },
    nutzt: [["rechteck", "Felder im Rechteck zählen"]],
    wz: "kopf",
  },
  {
    id: "bruch-div", g: "Bruchrechnen", n: "Dividieren", st: "unter-mittel", kl: 6,
    f: "\\frac{a}{b} : \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c}",
    k: "mit dem Kehrwert multiplizieren",
    bild: ["bruchDiv", {}],
    her: [
      { t: "Probe durch Multiplizieren", s: [
        "Teilen ist die Umkehrung des Multiplizierens. Gesucht ist die Zahl $x$, die mal $\\frac{c}{d}$ wieder $\\frac{a}{b}$ ergibt.",
        "$$\\frac{a}{b} \\cdot \\frac{d}{c} \\cdot \\frac{c}{d} = \\frac{a}{b} \\cdot 1 = \\frac{a}{b} || Probe",
        "Also ist $x = \\frac{a}{b} \\cdot \\frac{d}{c}$ die gesuchte Zahl.",
      ] },
      { t: "Anschaulich: Wie oft passt es hinein?", s: [
        "Wie oft passt $\\frac{1}{4}$ in 3? Ein Ganzes enthält vier Viertel, drei Ganze zwölf: $3 : \\frac{1}{4} = 3 \\cdot 4 = 12$.",
        "Der Kehrwert von $\\frac{1}{4}$ ist 4 – genau die Anzahl der Stücke pro Ganzes.",
      ] },
      { t: "Mit gemeinsamem Nenner", s: [
        "$$\\frac{a}{b} : \\frac{c}{d} = \\frac{ad}{bd} : \\frac{bc}{bd} = \\frac{ad}{bc} || gleiche Stücke: nur die Zähler teilen",
      ] },
    ],
    bsp: ["$$\\frac{3}{4} : \\frac{9}{8} = \\frac{3}{4} \\cdot \\frac{8}{9} = \\frac{2}{3}"],
    nutzt: [["bruch-mul", "Probe"], ["bruch-kuerzen", "auf gemeinsamen Nenner erweitern"]],
    wz: "kopf",
  },
  {
    id: "prozent", g: "Bruchrechnen", n: "Prozent", st: "unter-mittel", kl: 6,
    f: "W = G \\cdot \\frac{p}{100}",
    k: "Prozentwert = Grundwert mal Prozentsatz",
    bild: ["bruchStreifen", { modus: "prozent" }],
    her: { t: "Pro hundert", s: [
      "»Prozent« heißt »von hundert«: $p\\,\\%$ ist der Bruch $\\frac{p}{100}$. Ein Anteil von $G$ wird durch Multiplizieren berechnet.",
      "Umgestellt: $G = \\frac{W \\cdot 100}{p}$ und $p = \\frac{W}{G} \\cdot 100$.",
    ] },
    bsp: ["19 % von 250 €: $250 \\cdot 0{,}19 = 47{,}50$ €."],
    falle: "+20 % und dann −20 % ergibt nicht den Ausgangswert: $1{,}2 \\cdot 0{,}8 = 0{,}96$.",
    nutzt: [["bruch-mul", "Anteil von G"]],
    wz: "kopf",
  },
];

export const FS_LOGIK = [
  /* ---------------- Mengen ---------------- */
  {
    id: "element", g: "Mengen", n: "Element", st: "beide",
    f: "x \\in A, \\quad y \\notin A",
    k: "x gehört zur Menge A, y nicht",
    bild: ["venn", { modus: "element" }],
    her: [
      { t: "Die Grundbeziehung", s: [
        "Eine Menge ist durch ihre Elemente vollständig bestimmt. Für jedes Objekt ist klar: Es gehört dazu oder nicht.",
        "Reihenfolge und Wiederholung spielen keine Rolle: $\\{1; 2; 2\\} = \\{2; 1\\}$.",
      ] },
      { t: "Beschreibende Schreibweise", s: [
        "$\\{x \\mid \\ldots\\}$ liest man »Menge aller $x$, für die gilt …«. Die Bedingung nach dem Strich entscheidet über die Zugehörigkeit.",
        "$$A = \\{ x \\in \\mathbb{N} \\mid x \\text{ gerade}, \\; x < 7 \\} = \\{2; 4; 6\\}",
      ] },
    ],
    falle: "$2 \\in \\{2\\}$, aber $2 \\neq \\{2\\}$: Die Zahl ist nicht dasselbe wie die Menge, die sie enthält.",
    nutzt: [["intervalle", "Intervalle sind Mengen reeller Zahlen"], ["zahlbereiche", "N, Z, Q, R als Mengen"]],
  },
  {
    id: "teilmenge", g: "Mengen", n: "Teilmenge", st: "beide",
    f: "A \\subseteq B \\quad\\Leftrightarrow\\quad (x \\in A \\Rightarrow x \\in B)",
    k: "jedes Element von A liegt auch in B",
    bild: ["venn", { modus: "teilmenge" }],
    her: { t: "Eine Implikation", s: [
      "Die Teilmengenbeziehung ist eine Implikation über alle Elemente: Wer in $A$ ist, ist auch in $B$.",
      "Zwei Mengen sind gleich, wenn $A \\subseteq B$ und $B \\subseteq A$ – genau wie bei der Äquivalenz.",
    ] },
    nutzt: [["implikation", "x ∈ A ⇒ x ∈ B"]],
  },
  {
    id: "vereinigung", g: "Mengen", n: "Vereinigung", st: "beide",
    f: "A \\cup B = \\{ x \\mid x \\in A \\lor x \\in B \\}",
    k: "alles, was in A oder in B liegt",
    bild: ["venn", { modus: "vereinigung" }],
    her: { t: "Mengen und Logik", s: ["Das Zeichen $\\cup$ zur Menge passt zum Zeichen $\\lor$ der Logik: »oder« im einschließenden Sinn."] },
    nutzt: [["undoder", "»oder«"]],
  },
  {
    id: "schnittmenge", g: "Mengen", n: "Schnittmenge", st: "beide",
    f: "A \\cap B = \\{ x \\mid x \\in A \\land x \\in B \\}",
    k: "nur, was in beiden liegt",
    bild: ["venn", { modus: "schnitt" }],
    her: { t: "Mengen und Logik", s: ["$\\cap$ entspricht $\\land$: Ein Element muss beide Bedingungen erfüllen."] },
    nutzt: [["undoder", "»und«"]],
  },
  {
    id: "differenzmenge", g: "Mengen", n: "Differenzmenge", st: "beide",
    f: "A \\setminus B = \\{ x \\mid x \\in A \\land x \\notin B \\}",
    k: "A ohne die Elemente von B",
    bild: ["venn", { modus: "differenz" }],
    her: { t: "Und nicht", s: ["$A \\setminus B = A \\cap \\overline{B}$ – in $A$ und nicht in $B$."] },
    nutzt: [["schnittmenge", "mit dem Komplement von B"]],
  },
  {
    id: "leeremenge", g: "Mengen", n: "Leere Menge", st: "beide",
    f: "\\emptyset = \\{ \\}",
    k: "Teilmenge jeder Menge",
    bild: ["leereMenge", {}],
    her: [
      { t: "Warum Teilmenge von allem?", s: [
        "$\\emptyset \\subseteq A$ heißt: Jedes Element von $\\emptyset$ liegt in $A$. Da es keine Elemente gibt, ist nichts zu prüfen – die Aussage ist wahr.",
        "Logisch: Eine Implikation mit falscher Voraussetzung ist immer wahr.",
      ] },
      { t: "Indirekt gedacht", s: [
        "Angenommen, $\\emptyset \\subseteq A$ wäre falsch. Dann gäbe es ein Element $x \\in \\emptyset$ mit $x \\notin A$.",
        "Aber die leere Menge hat kein Element. Die Annahme führt zum Widerspruch – also gilt $\\emptyset \\subseteq A$.",
      ] },
      { t: "Wo sie vorkommt", s: [
        "$A \\cap B = \\emptyset$ bedeutet: A und B haben nichts gemeinsam (disjunkte Mengen).",
        "Lösungsmenge einer unlösbaren Gleichung: $x^2 = -1$ hat in $\\mathbb{R}$ die Lösungsmenge $\\emptyset$.",
      ] },
    ],
    falle: "$\\emptyset$ und $\\{\\emptyset\\}$ sind verschieden: die erste hat kein, die zweite genau ein Element.",
    nutzt: [["implikation", "falsche Voraussetzung"], ["widerspruch", "indirekter Nachweis"], ["schnittmenge", "disjunkte Mengen"]],
  },
  {
    id: "zahlbereiche", g: "Mengen", n: "Zahlbereiche", st: "beide",
    f: "\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R} \\subset \\mathbb{C}",
    k: "natürliche, ganze, rationale, reelle, komplexe Zahlen",
    bild: ["zahlbereiche", {}],
    her: { t: "Jede Erweiterung löst ein Problem", s: [
      "$\\mathbb{N}$: Zählen. $3 - 5$ geht nicht ⇒ $\\mathbb{Z}$.",
      "$3 : 5$ geht in $\\mathbb{Z}$ nicht ⇒ $\\mathbb{Q}$.",
      "$\\sqrt{2}$ ist kein Bruch ⇒ $\\mathbb{R}$ füllt die Lücken der Zahlengeraden.",
      "$x^2 = -1$ hat in $\\mathbb{R}$ keine Lösung ⇒ $\\mathbb{C}$ mit $i^2 = -1$.",
    ] },
    nutzt: [["widerspruch", "√2 ist irrational"]],
  },
  {
    id: "intervalle", g: "Mengen", n: "Intervalle", st: "beide",
    f: "[a ; b] = \\{ x \\in \\mathbb{R} \\mid a \\leq x \\leq b \\}",
    k: "eckige Klammer nach außen: Grenze gehört nicht dazu",
    bild: ["zahlbereiche", { modus: "intervall" }],
    her: [
      { t: "Schreibweisen", s: [
        "$[a; b]$ abgeschlossen, $]a; b[$ offen, $[a; b[$ halboffen. Die Klammer zeigt zur Zahl hin, wenn sie dazugehört.",
        "Unendlich gehört nie dazu: $[0; \\infty[$.",
      ] },
      { t: "Intervalle als Mengen", s: [
        "Ein Intervall ist die Menge aller reellen Zahlen zwischen zwei Grenzen. Schnitt und Vereinigung funktionieren wie bei allen Mengen:",
        "$$[1; 5] \\cap [3; 8] = [3; 5], \\quad [1; 2] \\cup\\; ]2; 4] = [1; 4]",
      ] },
      { t: "Wo sie gebraucht werden", s: [
        "Definitionsbereiche ($\\ln x$: $]0; \\infty[$), Lösungen von Ungleichungen ($x > -3$: $]-3; \\infty[$) und die Grenzen beim Integral $[a; b]$.",
      ] },
    ],
    falle: "Bei $\\infty$ immer die offene Klammer: $[0; \\infty]$ ist falsch, richtig ist $[0; \\infty[$.",
    nutzt: [["element", "Zugehörigkeit einer Zahl"], ["ungleichung", "Lösungsmenge als Intervall"]],
  },
  {
    id: "demorgan-m", g: "Mengen", n: "De Morgan (Mengen)", st: "beide",
    f: "\\overline{A \\cup B} = \\overline{A} \\cap \\overline{B}",
    k: "Komplement dreht ∪ und ∩ um",
    bild: ["venn", { modus: "demorgan" }],
    her: { t: "Weder noch", s: [
      "Nicht in $A \\cup B$ heißt: weder in $A$ noch in $B$ – also nicht in $A$ und nicht in $B$.",
      "Ebenso $\\overline{A \\cap B} = \\overline{A} \\cup \\overline{B}$: Nicht in beiden heißt, in mindestens einer fehlt es.",
    ] },
    nutzt: [["demorgan-l", "dieselbe Regel in der Logik"]],
  },

  /* ---------------- Aussagenlogik ---------------- */
  {
    id: "undoder", g: "Aussagenlogik", n: "Und, Oder, Nicht", st: "beide",
    f: "A \\land B, \\quad A \\lor B, \\quad \\neg A",
    k: "»oder« ist immer einschließend gemeint",
    bild: ["wahrheit", { op: "und" }],
    her: { t: "Wahrheitstafeln", s: [
      "$A \\land B$ ist nur wahr, wenn beide wahr sind. $A \\lor B$ ist wahr, sobald mindestens eine wahr ist. $\\neg A$ kehrt um.",
      "Das ausschließende »entweder … oder« ist etwas anderes – in der Mathematik muss man es ausdrücklich sagen.",
    ] },
    nutzt: [],
  },
  {
    id: "implikation", g: "Aussagenlogik", n: "Implikation", st: "beide",
    f: "A \\Rightarrow B",
    k: "nur falsch, wenn A wahr und B falsch ist",
    bild: ["wahrheit", { op: "impl" }],
    her: { t: "Ein Versprechen", s: [
      "»Wenn es regnet, nehme ich den Schirm mit.« Gebrochen ist das Versprechen nur, wenn es regnet und ich keinen Schirm habe.",
      "Regnet es nicht, ist das Versprechen nicht gebrochen – egal was ich tue. Deshalb ist $A \\Rightarrow B$ bei falschem $A$ immer wahr.",
      "$$A \\Rightarrow B \\;\\Leftrightarrow\\; \\neg A \\lor B",
    ] },
    nutzt: [["undoder", "als ¬A ∨ B geschrieben"]],
  },
  {
    id: "aequivalenz", g: "Aussagenlogik", n: "Äquivalenz", st: "beide",
    f: "A \\Leftrightarrow B \\quad\\Leftrightarrow\\quad (A \\Rightarrow B) \\land (B \\Rightarrow A)",
    k: "»genau dann, wenn« · beide Richtungen zeigen",
    bild: ["aequivalenzTafel", {}],
    her: [
      { t: "Zwei Implikationen", s: [
        "Eine Äquivalenz ist bewiesen, wenn beide Richtungen bewiesen sind. Deshalb haben viele Beweise zwei Teile: »⇒« und »⇐«.",
        "Die Wahrheitstafel zeigt es: $A \\Leftrightarrow B$ ist wahr genau in den Zeilen, in denen $A$ und $B$ denselben Wert haben.",
      ] },
      { t: "Äquivalenzumformung bei Gleichungen", s: [
        "Beim Umformen von Gleichungen sind nur Äquivalenzumformungen erlaubt – sonst kommen falsche Lösungen hinzu (Quadrieren!) oder gehen verloren (durch $x$ teilen).",
        "$$x = 3 \\;\\Rightarrow\\; x^2 = 9",
        "Die Rückrichtung stimmt nicht: Aus $x^2 = 9$ folgt auch $x = -3$. Quadrieren ist nur eine Richtung (⇒), keine Äquivalenz – deshalb Probe machen.",
      ] },
    ],
    nutzt: [["implikation", "in beide Richtungen"], ["lineargl", "Äquivalenzumformungen"]],
  },
  {
    id: "kontraposition", g: "Aussagenlogik", n: "Kontraposition", st: "beide",
    f: "(A \\Rightarrow B) \\quad\\Leftrightarrow\\quad (\\neg B \\Rightarrow \\neg A)",
    k: "Vorsicht: B ⇒ A folgt daraus nicht",
    bild: ["wahrheit", { op: "kontra" }],
    her: { t: "Gleiche Wahrheitstafel", s: [
      "$A \\Rightarrow B$ ist nur im Fall »$A$ wahr, $B$ falsch« falsch. $\\neg B \\Rightarrow \\neg A$ ist nur falsch, wenn $\\neg B$ wahr und $\\neg A$ falsch ist – das ist derselbe Fall.",
      "Beispiel: »Wenn $n^2$ gerade ist, ist $n$ gerade« zeigt man leichter als »Wenn $n$ ungerade ist, ist $n^2$ ungerade«: $(2k + 1)^2 = 4k^2 + 4k + 1$.",
    ] },
    falle: "Die Umkehrung $B \\Rightarrow A$ ist etwas anderes: »Wer in Paris ist, ist in Frankreich« – aber nicht umgekehrt.",
    nutzt: [["implikation", "gleiche Wahrheitstafel"]],
  },
  {
    id: "demorgan-l", g: "Aussagenlogik", n: "De Morgan (Logik)", st: "beide",
    f: "\\neg(A \\land B) \\quad\\Leftrightarrow\\quad \\neg A \\lor \\neg B",
    k: "Verneinung dreht ∧ und ∨ um",
    bild: ["wahrheit", { op: "demorgan" }],
    her: { t: "Wahrheitstafel", s: [
      "$A \\land B$ ist nur wahr, wenn beide wahr sind. Verneint ist es also wahr, sobald mindestens eine falsch ist: $\\neg A \\lor \\neg B$.",
    ] },
    nutzt: [["undoder", "Wahrheitstafeln"]],
  },
  {
    id: "quantoren", g: "Aussagenlogik", n: "Quantoren", st: "beide",
    f: "\\forall x : A(x), \\quad \\exists x : A(x)",
    k: "»für alle« und »es gibt« · Verneinung tauscht die beiden",
    bild: ["quantorenBild", {}],
    her: [
      { t: "Verneinen", s: [
        "»Nicht alle Schwäne sind weiß« heißt: »Es gibt einen Schwan, der nicht weiß ist.«",
        "$$\\neg(\\forall x : A(x)) \\;\\Leftrightarrow\\; \\exists x : \\neg A(x)",
        "Deshalb widerlegt ein einziges Gegenbeispiel eine Allaussage.",
      ] },
      { t: "Als verallgemeinerte De Morgan-Regel", s: [
        "$\\forall x : A(x)$ ist wie eine lange Und-Verknüpfung $A(x_1) \\land A(x_2) \\land \\ldots$. Verneint wird daraus nach De Morgan eine Oder-Verknüpfung der Verneinungen: $\\neg A(x_1) \\lor \\neg A(x_2) \\lor \\ldots$",
        "Das ist genau $\\exists x : \\neg A(x)$. Umgekehrt: $\\neg(\\exists x : A(x)) \\Leftrightarrow \\forall x : \\neg A(x)$.",
      ] },
      { t: "Reihenfolge ist wichtig", s: [
        "$\\forall x\\, \\exists y : y > x$ (zu jeder Zahl gibt es eine größere) ist wahr. $\\exists y\\, \\forall x : y > x$ (eine Zahl größer als alle) ist falsch.",
      ] },
    ],
    falle: "Auch bei »es gibt« genügt ein einziges Beispiel als Beweis, aber niemals ein Beispiel als Beweis einer Allaussage.",
    nutzt: [["demorgan-l", "verallgemeinert auf viele Aussagen"], ["widerspruch", "ein Gegenbeispiel genügt"]],
  },

  /* ---------------- Beweisverfahren ---------------- */
  {
    id: "direkt", g: "Beweisverfahren", n: "Direkter Beweis", st: "beide",
    f: "A \\Rightarrow C_1 \\Rightarrow C_2 \\Rightarrow B",
    k: "Kette gültiger Schlüsse von der Voraussetzung zur Behauptung",
    bild: ["beweisKette", { art: "direkt" }],
    her: [
      { t: "Beispiel: Summe zweier gerader Zahlen", s: [
        "Voraussetzung: $a$ und $b$ sind gerade, also $a = 2k$, $b = 2m$ mit ganzen $k, m$.",
        "$$a + b = 2k + 2m = 2(k + m) || 2 ausgeklammert",
        "$k + m$ ist ganz, also ist $a + b$ gerade.",
      ] },
      { t: "Beispiel: Quadrat einer ungeraden Zahl", s: [
        "Ist $n$ ungerade, ist $n = 2k + 1$. Dann:",
        "$$n^2 = (2k + 1)^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1 || erste binomische Formel",
        "Also ist $n^2$ ungerade. Jeder Schritt folgt aus dem vorigen – das ist ein direkter Beweis.",
      ] },
      { t: "Der Aufbau", s: [
        "Voraussetzung hinschreiben, Behauptung hinschreiben, dann die Kette: Jeder Schritt muss aus einer Definition, einem Satz oder dem vorigen Schritt folgen.",
      ] },
    ],
    nutzt: [["implikation", "Kette von Implikationen"], ["distributiv", "2 ausklammern"], ["binom1", "beim Quadrat"]],
  },
  {
    id: "widerspruch", g: "Beweisverfahren", n: "Widerspruchsbeweis", st: "beide",
    f: "\\neg B \\Rightarrow \\text{Widerspruch}",
    k: "z. B. √2 ist irrational",
    bild: ["beweisKette", { art: "widerspruch" }],
    her: [
      { t: "√2 ist kein Bruch", s: [
        "Angenommen, $\\sqrt{2} = \\frac{p}{q}$ mit vollständig gekürztem Bruch.",
        "$$2 = \\frac{p^2}{q^2} \\;\\Rightarrow\\; p^2 = 2q^2",
        "Also ist $p^2$ gerade und damit $p$ gerade (Kontraposition), $p = 2k$:",
        "$$4k^2 = 2q^2 \\;\\Rightarrow\\; q^2 = 2k^2",
        "Also ist auch $q$ gerade. Dann ließe sich der Bruch durch 2 kürzen – Widerspruch zu »vollständig gekürzt«.",
        "Die Annahme war falsch: $\\sqrt{2}$ ist irrational.",
      ] },
      { t: "Primzahlen sind unendlich viele (Euklid)", s: [
        "Angenommen, es gäbe nur endlich viele Primzahlen $p_1, \\ldots, p_n$. Bilde $N = p_1 \\cdot p_2 \\cdots p_n + 1$.",
        "$N$ lässt bei Division durch jedes $p_i$ den Rest 1, ist also durch keine der Primzahlen teilbar. Dann ist $N$ selbst prim oder hat einen neuen Primfaktor.",
        "Beides widerspricht der Annahme, alle Primzahlen zu kennen. Also gibt es unendlich viele.",
      ] },
      { t: "Der Aufbau", s: [
        "Nimm das Gegenteil der Behauptung an, folgere daraus etwas Falsches. Dann kann die Annahme nicht stimmen – die Behauptung gilt.",
      ] },
    ],
    nutzt: [["kontraposition", "p² gerade ⇒ p gerade"], ["bruch-kuerzen", "gekürzter Bruch"], ["teiler", "Primfaktoren"]],
  },
  {
    id: "induktion", g: "Beweisverfahren", n: "Vollständige Induktion", st: "beide",
    f: "A(1) \\land (A(n) \\Rightarrow A(n+1))",
    k: "Induktionsanfang und Induktionsschritt · dann gilt A(n) für alle n",
    bild: ["domino", {}],
    her: { t: "Dominosteine", s: [
      "Der erste Stein fällt (Induktionsanfang). Jeder fallende Stein stößt den nächsten um (Induktionsschritt). Dann fallen alle.",
      "Beispiel: $1 + 2 + \\ldots + n = \\frac{n(n+1)}{2}$.",
      "Anfang: $n = 1$: $1 = \\frac{1 \\cdot 2}{2}$ ✓.",
      "$$1 + \\ldots + n + (n+1) = \\frac{n(n+1)}{2} + (n + 1) = \\frac{(n+1)(n+2)}{2} || Schritt: Annahme benutzt, (n+1) ausgeklammert",
    ] },
    nutzt: [["implikation", "A(n) ⇒ A(n + 1)"], ["gauss-summe", "klassisches Beispiel"]],
  },
  {
    id: "gauss-summe", g: "Beweisverfahren", n: "Gaußsche Summenformel", st: "beide",
    f: "1 + 2 + \\ldots + n = \\frac{n(n+1)}{2}",
    k: "die Summe aller Zahlen von 1 bis n",
    bild: ["treppe", {}],
    her: { t: "Der kleine Gauß", s: [
      "Schreibe die Summe zweimal, einmal vorwärts, einmal rückwärts, und addiere spaltenweise:",
      "$$S = 1 + 2 + \\ldots + (n-1) + n",
      "$$S = n + (n-1) + \\ldots + 2 + 1",
      "Jede Spalte ergibt $n + 1$, und es gibt $n$ Spalten. Das ist die doppelte Summe:",
      "$$2S = n(n + 1) \\;\\Rightarrow\\; S = \\frac{n(n+1)}{2}",
      "Als Bild: Zwei gleiche Treppen aus Kästchen ergeben zusammen ein Rechteck $n \\times (n+1)$.",
    ] },
    bsp: ["$$1 + 2 + \\ldots + 100 = \\frac{100 \\cdot 101}{2} = 5050"],
    nutzt: [["rechteck", "zwei Treppen ergeben ein Rechteck"]],
  },
];
