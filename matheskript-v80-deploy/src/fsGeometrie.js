/* FORMELSAMMLUNG · GEOMETRIE UND TRIGONOMETRIE (Aufbau eines Eintrags: siehe fsAnalysis.js) */

export const FS_GEOMETRIE = [
  /* ---------------- Flächen ---------------- */
  {
    id: "rechteck", g: "Flächen", n: "Rechteck und Quadrat", st: "unter-mittel", kl: 5,
    f: "A = a \\cdot b, \\quad A_{\\text{Quadrat}} = a^2",
    k: "Grundlage aller Flächenformeln",
    bild: ["flaechen", { art: "rechteck" }],
    her: { t: "Einheitsquadrate zählen", s: [
      "Ein Rechteck mit den Seiten 3 und 4 lässt sich in 3 Reihen zu je 4 Einheitsquadraten zerlegen: $3 \\cdot 4 = 12$.",
      "Für beliebige Seitenlängen definiert man die Fläche genau so – Länge mal Breite. Alle anderen Flächenformeln führt man darauf zurück.",
    ] },
    nutzt: [],
  },
  {
    id: "dreieck-flaeche", g: "Flächen", n: "Dreieck", st: "mittel",
    f: "A = \\frac{1}{2} \\, g \\cdot h",
    k: "Grundseite mal zugehörige Höhe, halbiert",
    bild: ["flaechen", { art: "dreieck" }],
    her: { t: "Halbes Rechteck", s: [
      "Die Höhe teilt das Dreieck in zwei rechtwinklige Dreiecke. Jedes ist die Hälfte eines Rechtecks.",
      "Die beiden Rechtecke ergeben zusammen das Rechteck $g \\times h$. Das Dreieck ist genau die Hälfte davon.",
      "Bei stumpfen Dreiecken liegt die Höhe außen – dann zieht man ein halbes Rechteck ab statt es zu addieren. Die Formel bleibt dieselbe.",
    ] },
    falle: "Die Höhe muss senkrecht auf der gewählten Grundseite stehen – nicht irgendeine Seite.",
    nutzt: [["rechteck", "zwei halbe Rechtecke"]],
  },
  {
    id: "parallelogramm-ebene", g: "Flächen", n: "Parallelogramm", st: "mittel",
    f: "A = g \\cdot h",
    k: "durch Abschneiden und Ansetzen ein Rechteck",
    bild: ["flaechen", { art: "parallelogramm" }],
    her: { t: "Scheren", s: [
      "Schneidet man links ein rechtwinkliges Dreieck ab und setzt es rechts wieder an, entsteht ein Rechteck mit Breite $g$ und Höhe $h$.",
      "Fläche geht dabei nicht verloren: $A = g \\cdot h$.",
    ] },
    nutzt: [["rechteck", "umgeformt zum Rechteck"]],
  },
  {
    id: "trapez", g: "Flächen", n: "Trapez", st: "mittel",
    f: "A = \\frac{a + c}{2} \\cdot h",
    k: "Mittellinie mal Höhe",
    bild: ["flaechen", { art: "trapez" }],
    her: { t: "Zwei Trapeze sind ein Parallelogramm", s: [
      "Ein zweites, um 180° gedrehtes Trapez passt genau an das erste. Zusammen ergeben sie ein Parallelogramm mit Grundseite $a + c$ und Höhe $h$.",
      "$$2A = (a + c) \\cdot h \\;\\Rightarrow\\; A = \\frac{a + c}{2} \\cdot h",
    ] },
    nutzt: [["parallelogramm-ebene", "verdoppelt zum Parallelogramm"]],
  },
  {
    id: "kreisumfang", g: "Flächen", n: "Kreisumfang", st: "mittel",
    f: "U = 2\\pi r = \\pi d",
    k: "π ist das Verhältnis von Umfang zu Durchmesser",
    bild: ["kreis", { modus: "umfang" }],
    her: { t: "π ist so definiert", s: [
      "Alle Kreise sind ähnlich. Deshalb ist das Verhältnis $\\frac{U}{d}$ bei jedem Kreis gleich – diese Zahl heißt $\\pi \\approx 3{,}14159$.",
      "Archimedes schloss den Kreis zwischen einem inneren und einem äußeren 96-Eck ein und fand $3\\frac{10}{71} < \\pi < 3\\frac{1}{7}$.",
    ] },
    nutzt: [["aehnlich", "alle Kreise sind ähnlich"]],
  },
  {
    id: "kreisflaeche", g: "Flächen", n: "Kreisfläche", st: "mittel",
    f: "A = \\pi r^2",
    k: "in Tortenstücke zerlegt fast ein Rechteck",
    bild: ["kreis", { modus: "flaeche" }],
    her: [
      { t: "Tortenstücke umlegen", s: [
        "Zerlege den Kreis in $n$ gleiche Tortenstücke und lege sie abwechselnd mit der Spitze nach oben und unten nebeneinander.",
        "Es entsteht fast ein Rechteck: Die Höhe ist $r$, die Breite der halbe Umfang $\\pi r$.",
        "Je mehr Stücke, desto gerader werden die Bögen. Im Grenzfall:",
        "$$A = \\pi r \\cdot r = \\pi r^2",
      ] },
      { t: "Mit dem Integral", s: [
        "Der Kreis besteht aus dünnen Ringen. Ein Ring beim Radius $s$ hat ungefähr die Fläche Umfang mal Dicke: $2\\pi s \\cdot \\Delta s$.",
        "$$A = \\int_0^r 2\\pi s \\, ds = \\left[\\pi s^2\\right]_0^r = \\pi r^2",
      ] },
    ],
    bsp: ["$r = 3$ cm: $A = 9\\pi \\approx 28{,}3$ cm²."],
    falle: "Erst quadrieren, dann mit π multiplizieren. Bei gegebenem Durchmesser: $A = \\frac{\\pi d^2}{4}$.",
    nutzt: [["kreisumfang", "Breite = halber Umfang"], ["rechteck", "Grenzfigur ist ein Rechteck"], ["hauptsatz", "Integral über die Ringe"]],
  },
  {
    id: "kreissektor", g: "Flächen", n: "Kreisbogen und Kreissektor", st: "mittel",
    f: "b = \\frac{\\alpha}{360°} \\cdot 2\\pi r, \\quad A = \\frac{\\alpha}{360°} \\cdot \\pi r^2",
    k: "der passende Anteil des ganzen Kreises",
    bild: ["kreis", { modus: "sektor" }],
    her: { t: "Anteil am Vollwinkel", s: [
      "Ein Sektor mit Mittelpunktswinkel $\\alpha$ ist der Anteil $\\frac{\\alpha}{360°}$ des Kreises – an Bogenlänge wie an Fläche.",
      "Im Bogenmaß $x$ wird es besonders einfach: $b = x \\cdot r$ und $A = \\frac{1}{2} x r^2$.",
    ] },
    nutzt: [["kreisumfang", "Anteil des Umfangs"], ["kreisflaeche", "Anteil der Fläche"], ["bogenmass", "einfachere Formel im Bogenmaß"]],
  },

  /* ---------------- Körper ---------------- */
  {
    id: "quader", g: "Körper", n: "Quader und Würfel", st: "unter-mittel", kl: 6,
    f: "V = a \\cdot b \\cdot c, \\quad O = 2(ab + ac + bc)",
    k: "Würfel: V = a³, O = 6a²",
    bild: ["koerper", { art: "quader" }],
    her: { t: "Schichten aus Einheitswürfeln", s: [
      "Die Grundfläche $a \\cdot b$ ist mit $ab$ Einheitswürfeln belegt. $c$ solche Schichten übereinander: $V = abc$.",
      "Die Oberfläche besteht aus drei Paaren gleicher Rechtecke.",
    ] },
    nutzt: [["rechteck", "Grundfläche und Seitenflächen"]],
  },
  {
    id: "zylinder", g: "Körper", n: "Prisma und Zylinder", st: "mittel",
    f: "V = G \\cdot h, \\quad V_{\\text{Zylinder}} = \\pi r^2 h",
    k: "Grundfläche mal Höhe · Mantel des Zylinders: 2πrh",
    bild: ["koerper", { art: "zylinder" }],
    her: { t: "Gleiche Querschnitte übereinander", s: [
      "Ein Prisma besteht aus lauter gleichen Schichten der Fläche $G$. Übereinander gestapelt bis zur Höhe $h$: $V = G \\cdot h$ – wie beim Quader.",
      "Der Zylinder ist ein »Prisma« mit Kreis als Grundfläche: $G = \\pi r^2$.",
      "Den Mantel kann man abrollen: ein Rechteck mit Breite $2\\pi r$ (Umfang) und Höhe $h$.",
      "$$O = 2\\pi r^2 + 2\\pi r h",
    ] },
    nutzt: [["kreisflaeche", "Grundfläche"], ["kreisumfang", "Breite des Mantels"], ["quader", "gleiche Idee: Schichten"]],
  },
  {
    id: "pyramide", g: "Körper", n: "Pyramide", st: "mittel",
    f: "V = \\frac{1}{3} \\, G \\cdot h",
    k: "ein Drittel des Prismas mit gleicher Grundfläche und Höhe",
    bild: ["koerper", { art: "pyramide" }],
    her: [
      { t: "Drei Pyramiden ergeben einen Würfel", s: [
        "Ein Würfel lässt sich in drei kongruente Pyramiden zerlegen, die sich alle eine Ecke teilen. Jede hat eine Würfelseite als Grundfläche und die Kantenlänge als Höhe.",
        "$$V = \\frac{1}{3} a^2 \\cdot a",
      ] },
      { t: "Mit dem Integral", s: [
        "In der Höhe $z$ unter der Spitze ist der Querschnitt eine verkleinerte Grundfläche, im Maßstab $\\frac{z}{h}$. Flächen skalieren mit dem Quadrat:",
        "$$Q(z) = G \\cdot \\frac{z^2}{h^2} \\;\\Rightarrow\\; V = \\int_0^h G \\frac{z^2}{h^2} dz = G \\cdot \\frac{h}{3}",
      ] },
    ],
    nutzt: [["zylinder", "Vergleich mit dem Prisma"], ["aehnlich", "Querschnitte sind ähnlich"], ["potenz-rueck", "Integral von z²"]],
  },
  {
    id: "kegel", g: "Körper", n: "Kegel", st: "mittel",
    f: "V = \\frac{1}{3} \\pi r^2 h, \\quad M = \\pi r s",
    k: "Pyramide mit Kreisgrundfläche · s ist die Mantellinie",
    bild: ["koerper", { art: "kegel" }],
    her: { t: "Pyramide mit runder Grundfläche", s: [
      "Der Kegel ist eine Pyramide mit Kreis als Grundfläche: $V = \\frac{1}{3} G h = \\frac{1}{3}\\pi r^2 h$.",
      "Abgerollt ist der Mantel ein Kreissektor mit Radius $s$ und Bogenlänge $2\\pi r$. Seine Fläche ist $\\frac{1}{2} \\cdot 2\\pi r \\cdot s = \\pi r s$.",
      "Mantellinie mit Pythagoras: $s = \\sqrt{r^2 + h^2}$.",
    ] },
    nutzt: [["pyramide", "Faktor ⅓"], ["kreissektor", "abgerollter Mantel"], ["pythagoras", "Mantellinie s"]],
  },
  {
    id: "kugel", g: "Körper", n: "Kugel", st: "mittel",
    f: "V = \\frac{4}{3} \\pi r^3, \\quad O = 4\\pi r^2",
    k: "Oberfläche = vier Großkreise",
    bild: ["koerper", { art: "kugel" }],
    her: [
      { t: "Archimedes: Zylinder minus Kegel", s: [
        "Halbkugel, Kegel und Zylinder mit gleichem Radius $r$ und Höhe $r$: In jeder Höhe $z$ hat die Halbkugel den Querschnitt $\\pi(r^2 - z^2)$ (Pythagoras).",
        "Der Zylinder hat dort $\\pi r^2$, der auf der Spitze stehende Kegel $\\pi z^2$. Also: Halbkugel = Zylinder − Kegel in jeder Höhe (Prinzip von Cavalieri).",
        "$$V_{\\text{Halbkugel}} = \\pi r^3 - \\frac{1}{3}\\pi r^3 = \\frac{2}{3}\\pi r^3",
      ] },
      { t: "Mit dem Rotationsvolumen", s: [
        "Der Halbkreis $f(x) = \\sqrt{r^2 - x^2}$ dreht sich um die x-Achse:",
        "$$V = \\pi \\int_{-r}^{r} (r^2 - x^2) \\, dx = \\pi \\left(2r^3 - \\frac{2}{3}r^3\\right) = \\frac{4}{3}\\pi r^3",
        "Die Oberfläche ist die Ableitung des Volumens nach dem Radius: Eine dünne Schale hat Volumen ≈ Oberfläche · Dicke. $(\\frac{4}{3}\\pi r^3)′ = 4\\pi r^2$.",
      ] },
    ],
    nutzt: [["rotation", "Halbkreis um die x-Achse"], ["pythagoras", "Querschnitt in der Höhe z"], ["kegel", "Archimedes' Vergleich"]],
  },

  /* ---------------- Ähnlichkeit und Winkel ---------------- */
  {
    id: "winkelsumme", g: "Ähnlichkeit und Winkel", n: "Winkelsumme", st: "unter-mittel", kl: 7,
    f: "\\alpha + \\beta + \\gamma = 180°",
    k: "in jedem ebenen Dreieck",
    bild: ["dreieckAllg", { modus: "winkelsumme" }],
    her: { t: "Parallele durch die Spitze", s: [
      "Zeichne durch die Spitze $C$ eine Parallele zur Grundseite $AB$.",
      "An der Parallelen entstehen links und rechts von $\\gamma$ zwei Winkel, die als Wechselwinkel genau $\\alpha$ und $\\beta$ sind.",
      "Zusammen bilden $\\alpha$, $\\gamma$ und $\\beta$ einen gestreckten Winkel: 180°.",
    ] },
    falle: "Auf der Kugeloberfläche (z. B. Erde) ist die Winkelsumme größer als 180° – der Satz gilt nur in der Ebene.",
    nutzt: [],
  },
  {
    id: "aehnlich", g: "Ähnlichkeit und Winkel", n: "Ähnlichkeit und Strahlensatz", st: "mittel",
    f: "\\frac{a′}{a} = \\frac{b′}{b} = k, \\quad A′ = k^2 A, \\quad V′ = k^3 V",
    k: "gleiche Winkel ⇒ gleiche Seitenverhältnisse · Flächen mit k², Volumen mit k³",
    bild: ["strahlensatz", {}],
    her: { t: "Vergrößern mit Faktor k", s: [
      "Zwei Dreiecke mit gleichen Winkeln sind ähnlich: Eines ist eine maßstäbliche Vergrößerung des anderen. Alle Längen werden mit demselben Faktor $k$ multipliziert.",
      "Strahlensatz: Schneiden zwei Parallelen zwei Strahlen aus einem Punkt, entstehen ähnliche Dreiecke, also gleiche Verhältnisse.",
      "Flächen bestehen aus Länge mal Länge – beide wachsen mit $k$, die Fläche mit $k^2$. Volumen: $k^3$.",
    ] },
    bsp: ["Ein doppelt so großes Modell braucht viermal so viel Farbe und achtmal so viel Material."],
    nutzt: [["winkelsumme", "zwei gleiche Winkel genügen"]],
  },
  {
    id: "thales", g: "Ähnlichkeit und Winkel", n: "Satz des Thales", st: "mittel",
    f: "C \\text{ auf dem Halbkreis über } AB \\;\\Rightarrow\\; \\gamma = 90°",
    k: "jeder Winkel im Halbkreis ist ein rechter",
    bild: ["thales", {}],
    her: { t: "Zwei gleichschenklige Dreiecke", s: [
      "Verbinde $C$ mit dem Mittelpunkt $M$. Alle drei Strecken $MA$, $MB$, $MC$ sind Radien, also gleich lang.",
      "Damit sind $AMC$ und $MBC$ gleichschenklig. Ihre Basiswinkel sind gleich: $\\alpha$ und $\\beta$ tauchen bei $C$ noch einmal auf, also $\\gamma = \\alpha + \\beta$.",
      "$$\\alpha + \\beta + \\gamma = 180° \\;\\Rightarrow\\; 2\\gamma = 180° \\;\\Rightarrow\\; \\gamma = 90°",
    ] },
    nutzt: [["winkelsumme", "im großen Dreieck"]],
  },

  /* ---------------- Rechtwinkliges Dreieck ---------------- */
  {
    id: "pythagoras", g: "Rechtwinkliges Dreieck", n: "Satz des Pythagoras", st: "mittel",
    f: "a^2 + b^2 = c^2",
    k: "c ist die Hypotenuse, gegenüber dem rechten Winkel",
    bild: ["pythagoras", {}],
    her: [
      { t: "Beweis 1 · Dreiecke umlegen", s: [
        "Ein großes Quadrat der Seite $a + b$ enthält vier gleiche rechtwinklige Dreiecke mit Katheten $a$, $b$ und Hypotenuse $c$.",
        "Anordnung 1: Die Dreiecke liegen in den Ecken, in der Mitte bleibt ein schräges Quadrat mit Fläche $c^2$.",
        "Anordnung 2: Die Dreiecke bilden zwei Rechtecke, frei bleiben zwei Quadrate $a^2$ und $b^2$.",
        "Beide Male ist es dasselbe große Quadrat mit denselben vier Dreiecken. Also ist der freie Platz gleich:",
        "$$c^2 = a^2 + b^2",
      ] },
      { t: "Beweis 2 · Mit Algebra", s: [
        "Das große Quadrat der Seite $a + b$ aus Anordnung 1 hat zwei Flächenausdrücke:",
        "$$(a + b)^2 = c^2 + 4 \\cdot \\frac{ab}{2}",
        "$$a^2 + 2ab + b^2 = c^2 + 2ab || erste binomische Formel",
        "$$a^2 + b^2 = c^2 || 2ab auf beiden Seiten weg",
      ] },
      { t: "Beweis 3 · Quadrat in der Mitte", s: [
        "Lege die vier Dreiecke in das Quadrat über $c$, mit den Hypotenusen außen. In der Mitte bleibt ein kleines Quadrat der Seite $b - a$.",
        "$$c^2 = 4 \\cdot \\frac{ab}{2} + (b - a)^2 = 2ab + b^2 - 2ab + a^2 = a^2 + b^2 || zweite binomische Formel",
      ] },
      { t: "Beweis 4 · Ähnliche Dreiecke", s: [
        "Die Höhe $h$ auf $c$ teilt das Dreieck in zwei kleinere, die beide dieselben Winkel haben wie das große – alle drei sind ähnlich.",
        "Die Hypotenuse wird dabei in $p$ (unter $a$) und $q$ (unter $b$) geteilt. Aus der Ähnlichkeit:",
        "$$\\frac{a}{c} = \\frac{p}{a} \\;\\Rightarrow\\; a^2 = c \\cdot p, \\qquad \\frac{b}{c} = \\frac{q}{b} \\;\\Rightarrow\\; b^2 = c \\cdot q || Kathetensatz",
        "$$a^2 + b^2 = c \\cdot p + c \\cdot q = c(p + q) = c^2",
      ] },
      { t: "Umkehrung", s: [
        "Gilt in einem Dreieck $a^2 + b^2 = c^2$, dann ist es rechtwinklig. Das folgt aus dem Kosinussatz: $c^2 = a^2 + b^2 - 2ab\\cos\\gamma$ erzwingt $\\cos\\gamma = 0$.",
        "Die alten Ägypter nutzten das mit einem Seil mit 12 Knoten: Die Seiten 3, 4, 5 ergeben einen rechten Winkel.",
      ] },
    ],
    bsp: ["Katheten 6 und 8: $c = \\sqrt{36 + 64} = \\sqrt{100} = 10$."],
    falle: "$c$ ist immer die längste Seite, gegenüber dem rechten Winkel – nicht einfach »die dritte«.",
    nutzt: [["binom1", "Beweis 2: (a + b)²"], ["binom2", "Beweis 3: (b − a)²"], ["aehnlich", "Beweis 4"], ["dreieck-flaeche", "vier Dreiecke à ab/2"]],
    wz: "entdecken",
  },
  {
    id: "abstand-punkte", g: "Rechtwinkliges Dreieck", n: "Abstand zweier Punkte", st: "mittel",
    f: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}",
    k: "Pythagoras im Koordinatensystem",
    bild: ["gerade", { abstand: true }],
    her: { t: "Steigungsdreieck als rechtwinkliges Dreieck", s: [
      "Die beiden Punkte und der Eckpunkt $(x_2 | y_1)$ bilden ein rechtwinkliges Dreieck mit den Katheten $|x_2 - x_1|$ und $|y_2 - y_1|$.",
      "$$d^2 = (x_2 - x_1)^2 + (y_2 - y_1)^2 || Pythagoras, das Quadrat macht Beträge überflüssig",
    ] },
    bsp: ["$(1 | 2)$ und $(4 | 6)$: $d = \\sqrt{9 + 16} = 5$."],
    nutzt: [["pythagoras", "im Steigungsdreieck"]],
  },
  {
    id: "hoehensatz", g: "Rechtwinkliges Dreieck", n: "Höhen- und Kathetensatz", st: "mittel",
    f: "h^2 = p \\cdot q, \\quad a^2 = c \\cdot p, \\quad b^2 = c \\cdot q",
    k: "die Höhe teilt die Hypotenuse in p und q",
    bild: ["rechtwinklig", {}],
    her: { t: "Drei ähnliche Dreiecke", s: [
      "Die Höhe $h$ auf die Hypotenuse zerlegt das Dreieck in zwei Teildreiecke. Beide haben einen rechten Winkel und je einen Winkel mit dem großen Dreieck gemeinsam – alle drei sind ähnlich.",
      "Aus den Teildreiecken: $\\frac{h}{p} = \\frac{q}{h}$, also $h^2 = pq$.",
      "Aus großem und linkem Dreieck: $\\frac{a}{c} = \\frac{p}{a}$, also $a^2 = cp$. Rechts genauso $b^2 = cq$.",
    ] },
    nutzt: [["aehnlich", "Seitenverhältnisse ähnlicher Dreiecke"], ["pythagoras", "zusammen ergeben sie Pythagoras"]],
  },
  {
    id: "sinus", g: "Rechtwinkliges Dreieck", n: "Sinus", st: "mittel",
    f: "\\sin \\alpha = \\frac{\\text{Gegenkathete}}{\\text{Hypotenuse}}",
    k: "Kathete gegenüber von α",
    bild: ["trigDreieck", { fokus: "sin" }],
    her: { t: "Warum ein Verhältnis reicht", s: [
      "Alle rechtwinkligen Dreiecke mit demselben Winkel $\\alpha$ sind ähnlich. Deshalb ist das Verhältnis Gegenkathete zu Hypotenuse für alle gleich – es hängt nur von $\\alpha$ ab.",
      "Diese Zahl bekommt einen Namen: $\\sin \\alpha$. Mit Hypotenuse 1 ist der Sinus genau die Länge der Gegenkathete – so entsteht der Einheitskreis.",
    ] },
    bsp: ["Leiter 5 m, Neigung 70°: Höhe $= 5 \\cdot \\sin 70° \\approx 4{,}70$ m."],
    nutzt: [["aehnlich", "Verhältnis hängt nur vom Winkel ab"]],
    wz: "sinus",
  },
  {
    id: "kosinus", g: "Rechtwinkliges Dreieck", n: "Kosinus", st: "mittel",
    f: "\\cos \\alpha = \\frac{\\text{Ankathete}}{\\text{Hypotenuse}}",
    k: "Kathete, die an α anliegt",
    bild: ["trigDreieck", { fokus: "cos" }],
    her: { t: "Das Gegenstück zum Sinus", s: [
      "Gleiche Begründung wie beim Sinus: Das Verhältnis hängt nur von $\\alpha$ ab.",
      "Die Ankathete von $\\alpha$ ist die Gegenkathete von $\\beta = 90° - \\alpha$. Deshalb ist $\\cos\\alpha = \\sin(90° - \\alpha)$ – »Ko-Sinus« heißt »Sinus des Komplementwinkels«.",
    ] },
    nutzt: [["sinus", "Sinus des Komplementwinkels"], ["komplement", "cos α = sin(90° − α)"]],
    wz: "sinus",
  },
  {
    id: "tangens", g: "Rechtwinkliges Dreieck", n: "Tangens", st: "mittel",
    f: "\\tan \\alpha = \\frac{\\text{Gegenkathete}}{\\text{Ankathete}} = \\frac{\\sin \\alpha}{\\cos \\alpha}",
    k: "entspricht der Steigung einer Geraden",
    bild: ["trigDreieck", { fokus: "tan" }],
    her: { t: "Quotient aus Sinus und Kosinus", s: [
      "$$\\frac{\\sin\\alpha}{\\cos\\alpha} = \\frac{GK / H}{AK / H} = \\frac{GK}{AK} || Hypotenuse kürzt sich",
      "Im Steigungsdreieck einer Geraden ist das genau Höhe durch Breite – die Steigung.",
    ] },
    nutzt: [["sinus", "Zähler"], ["kosinus", "Nenner"], ["steigungswinkel", "tan α = m"]],
    wz: "sinus",
  },

  /* ---------------- Allgemeines Dreieck ---------------- */
  {
    id: "sinussatz", g: "Allgemeines Dreieck", n: "Sinussatz", st: "mittel",
    f: "\\frac{a}{\\sin \\alpha} = \\frac{b}{\\sin \\beta} = \\frac{c}{\\sin \\gamma}",
    k: "wenn eine Seite und ihr Gegenwinkel bekannt sind",
    bild: ["dreieckAllg", { modus: "sinussatz" }],
    her: { t: "Die Höhe zweimal ausdrücken", s: [
      "Die Höhe $h_c$ von $C$ auf $c$ zerlegt das Dreieck in zwei rechtwinklige Dreiecke.",
      "$$h_c = b \\cdot \\sin\\alpha || im linken Teildreieck",
      "$$h_c = a \\cdot \\sin\\beta || im rechten Teildreieck",
      "$$b \\sin\\alpha = a \\sin\\beta \\;\\Rightarrow\\; \\frac{a}{\\sin\\alpha} = \\frac{b}{\\sin\\beta}",
      "Mit einer anderen Höhe genauso für $c$. Der gemeinsame Wert ist übrigens der Durchmesser des Umkreises.",
    ] },
    falle: "Beim Berechnen eines Winkels kann es zwei Lösungen geben ($\\alpha$ und $180° - \\alpha$ haben denselben Sinus).",
    nutzt: [["sinus", "in den beiden Teildreiecken"]],
  },
  {
    id: "kosinussatz", g: "Allgemeines Dreieck", n: "Kosinussatz", st: "mittel",
    f: "c^2 = a^2 + b^2 - 2ab \\cdot \\cos \\gamma",
    k: "verallgemeinerter Pythagoras · für γ = 90° wieder Pythagoras",
    bild: ["dreieckAllg", { modus: "kosinussatz" }],
    her: [
      { t: "Pythagoras mit Korrektur", s: [
        "Lege $C$ in den Ursprung, $a$ auf die x-Achse: $B(a | 0)$ und $A(b\\cos\\gamma | b\\sin\\gamma)$.",
        "$$c^2 = (a - b\\cos\\gamma)^2 + (b\\sin\\gamma)^2 || Abstand von A und B",
        "$$= a^2 - 2ab\\cos\\gamma + b^2\\cos^2\\gamma + b^2\\sin^2\\gamma",
        "$$= a^2 + b^2 - 2ab\\cos\\gamma || sin² + cos² = 1",
      ] },
      { t: "Mit Vektoren", s: [
        "$$c^2 = |\\vec{a} - \\vec{b}|^2 = |\\vec{a}|^2 - 2\\vec{a} \\cdot \\vec{b} + |\\vec{b}|^2 = a^2 + b^2 - 2ab\\cos\\gamma",
      ] },
    ],
    bsp: ["$a = 5$, $b = 7$, $\\gamma = 60°$: $c^2 = 25 + 49 - 70 \\cdot \\frac{1}{2} = 39$, $c \\approx 6{,}24$."],
    falle: "Der Winkel muss zwischen $a$ und $b$ liegen, also gegenüber von $c$.",
    nutzt: [["pythagoras", "Spezialfall γ = 90°"], ["abstand-punkte", "Abstand A–B in Koordinaten"], ["trig-pythagoras", "sin² + cos² = 1"]],
  },
  {
    id: "dreieck-trig", g: "Allgemeines Dreieck", n: "Flächeninhalt", st: "mittel",
    f: "A = \\frac{1}{2} \\, a b \\cdot \\sin \\gamma",
    k: "zwei Seiten und der eingeschlossene Winkel",
    bild: ["dreieckAllg", { modus: "flaeche" }],
    her: { t: "Höhe über den Sinus", s: [
      "Grundseite $a$, Höhe darauf: Im rechtwinkligen Teildreieck mit Hypotenuse $b$ ist $h = b \\sin\\gamma$.",
      "$$A = \\frac{1}{2} a \\cdot h = \\frac{1}{2} ab\\sin\\gamma",
      "Für $\\gamma = 90°$ ist $\\sin\\gamma = 1$ – das halbe Rechteck.",
    ] },
    nutzt: [["dreieck-flaeche", "½ · g · h"], ["sinus", "h = b · sin γ"]],
  },

  /* ---------------- Einheitskreis ---------------- */
  {
    id: "einheitskreis", g: "Einheitskreis", n: "Sinus und Kosinus am Einheitskreis", st: "beide",
    f: "P(\\cos \\alpha \\,|\\, \\sin \\alpha)",
    k: "der Punkt auf dem Kreis mit Radius 1 · gilt für alle Winkel",
    bild: ["einheitskreis", {}],
    her: { t: "Vom Dreieck zum Kreis", s: [
      "Im rechtwinkligen Dreieck mit Hypotenuse 1 ist die Ankathete $\\cos\\alpha$ und die Gegenkathete $\\sin\\alpha$.",
      "Dreht man die Hypotenuse als Zeiger um den Ursprung, läuft ihre Spitze auf dem Einheitskreis. Ihre Koordinaten sind $(\\cos\\alpha | \\sin\\alpha)$.",
      "Diese Definition funktioniert auch für Winkel über 90° und für negative Winkel – dort werden Sinus und Kosinus negativ.",
    ] },
    nutzt: [["sinus", "Gegenkathete bei Hypotenuse 1"], ["kosinus", "Ankathete bei Hypotenuse 1"]],
    wz: "sinus",
  },
  {
    id: "trig-pythagoras", g: "Einheitskreis", n: "Trigonometrischer Pythagoras", st: "beide",
    f: "\\sin^2 \\alpha + \\cos^2 \\alpha = 1",
    k: "folgt direkt aus dem Einheitskreis",
    bild: ["einheitskreis", { modus: "pythagoras" }],
    her: { t: "Pythagoras im Einheitskreis", s: [
      "Der Punkt $(\\cos\\alpha | \\sin\\alpha)$ hat Abstand 1 vom Ursprung. Katheten $\\cos\\alpha$ und $\\sin\\alpha$, Hypotenuse 1:",
      "$$\\cos^2\\alpha + \\sin^2\\alpha = 1^2 = 1",
    ] },
    bsp: ["$\\sin\\alpha = 0{,}6$ und $\\alpha$ spitz: $\\cos\\alpha = \\sqrt{1 - 0{,}36} = 0{,}8$."],
    nutzt: [["pythagoras", "im Einheitskreis"], ["einheitskreis", "Koordinaten des Punktes"]],
    wz: "sinus",
  },
  {
    id: "bogenmass", g: "Einheitskreis", n: "Bogenmaß", st: "beide",
    f: "x = \\frac{\\alpha}{180°} \\cdot \\pi",
    k: "180° entsprechen π · in der Analysis immer Bogenmaß",
    bild: ["einheitskreis", { modus: "bogen" }],
    her: { t: "Winkel als Weglänge", s: [
      "Im Einheitskreis misst man einen Winkel durch die Länge des Bogens, den er ausschneidet.",
      "Der volle Kreis hat den Umfang $2\\pi$, entspricht also 360°. Ein halber Kreis: $\\pi$ entspricht 180°.",
      "$$\\frac{x}{\\pi} = \\frac{\\alpha}{180°} \\;\\Rightarrow\\; x = \\frac{\\alpha}{180°} \\pi",
    ] },
    bsp: ["$90° = \\frac{\\pi}{2}$, $60° = \\frac{\\pi}{3}$, $1 \\approx 57{,}3°$."],
    nutzt: [["kreisumfang", "Umfang 2π beim Radius 1"]],
    wz: "sinus",
  },
  {
    id: "symmetrien", g: "Einheitskreis", n: "Symmetrien", st: "beide",
    f: "\\sin(-x) = -\\sin x, \\quad \\cos(-x) = \\cos x",
    k: "Sinus punktsymmetrisch, Kosinus achsensymmetrisch",
    bild: ["einheitskreis", { modus: "symmetrie" }],
    her: { t: "Spiegeln an der x-Achse", s: [
      "Der Winkel $-x$ zeigt auf den an der x-Achse gespiegelten Punkt: x-Koordinate gleich, y-Koordinate mit umgekehrtem Vorzeichen.",
      "Außerdem: $\\sin(\\pi - x) = \\sin x$ (Spiegelung an der y-Achse) und $\\cos(\\pi - x) = -\\cos x$.",
    ] },
    nutzt: [["einheitskreis", "Spiegelung des Punktes"], ["symmetrie", "f(−x) = ±f(x)"]],
    wz: "sinus",
  },
  {
    id: "komplement", g: "Einheitskreis", n: "Komplementwinkel", st: "beide",
    f: "\\sin(90° - \\alpha) = \\cos \\alpha, \\quad \\cos(90° - \\alpha) = \\sin \\alpha",
    k: "im rechtwinkligen Dreieck tauschen An- und Gegenkathete die Rollen",
    bild: ["trigDreieck", { fokus: "komplement" }],
    her: { t: "Der andere spitze Winkel", s: [
      "Im rechtwinkligen Dreieck ist der zweite spitze Winkel $90° - \\alpha$. Für ihn ist die Ankathete von $\\alpha$ die Gegenkathete.",
    ] },
    nutzt: [["sinus", "Rollentausch der Katheten"], ["winkelsumme", "β = 90° − α"]],
  },
  {
    id: "verschiebung", g: "Einheitskreis", n: "Verschiebung", st: "beide",
    f: "\\sin\\left(x + \\frac{\\pi}{2}\\right) = \\cos x",
    k: "Kosinus ist der um π/2 verschobene Sinus",
    bild: ["transform", { basis: "sin", cosVergleich: true }],
    her: { t: "Viertelumdrehung", s: [
      "Dreht man den Zeiger um $\\frac{\\pi}{2}$ weiter, wird aus dem Punkt $(\\cos x | \\sin x)$ der Punkt $(-\\sin x | \\cos x)$.",
      "Seine Höhe ist $\\cos x$. Also ist der Graph des Kosinus der um $\\frac{\\pi}{2}$ nach links verschobene Sinus.",
    ] },
    nutzt: [["einheitskreis", "Drehung um 90°"], ["transform", "Verschiebung nach links"]],
    wz: "sinus",
  },
  {
    id: "periode", g: "Einheitskreis", n: "Periode", st: "beide",
    f: "\\sin(x + 2\\pi) = \\sin x",
    k: "f(x) = sin(bx) hat die Periode 2π/b",
    bild: ["einheitskreis", { modus: "periode" }],
    her: { t: "Eine volle Umdrehung", s: [
      "Nach $2\\pi$ ist der Zeiger einmal ganz herum und wieder am selben Punkt. Deshalb wiederholen sich Sinus und Kosinus.",
      "$$\\sin\\left(b\\left(x + \\frac{2\\pi}{b}\\right)\\right) = \\sin(bx + 2\\pi) = \\sin(bx)",
    ] },
    nutzt: [["bogenmass", "voller Kreis = 2π"]],
    wz: "sinus",
  },
  {
    id: "additionstheorem", g: "Einheitskreis", n: "Additionstheoreme", st: "ober",
    f: "\\sin(\\alpha + \\beta) = \\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta",
    k: "cos(α + β) = cos α cos β − sin α sin β · daraus sin 2α = 2 sin α cos α",
    bild: ["additionstheorem", {}],
    her: { t: "Zwei Drehungen nacheinander", s: [
      "Die Länge von $\\vec{a} - \\vec{b}$ zwischen den Zeigern zu $\\alpha$ und $-\\beta$ hängt nur vom Winkel $\\alpha + \\beta$ zwischen ihnen ab.",
      "Mit dem Skalarprodukt der Einheitsvektoren $(\\cos\\alpha | \\sin\\alpha)$ und $(\\cos\\beta | -\\sin\\beta)$:",
      "$$\\cos(\\alpha + \\beta) = \\cos\\alpha\\cos\\beta - \\sin\\alpha\\sin\\beta || Winkel zwischen den Zeigern ist α + β",
      "Ersetzt man $\\alpha$ durch $\\alpha - \\frac{\\pi}{2}$, wird mit der Verschiebung aus der Kosinus- die Sinusformel.",
      "Mit $\\beta = \\alpha$: $\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha$ und $\\cos 2\\alpha = \\cos^2\\alpha - \\sin^2\\alpha$.",
    ] },
    nutzt: [["vektorwinkel", "Skalarprodukt zweier Einheitsvektoren"], ["einheitskreis", "Zeiger zu α und −β"]],
  },
  {
    id: "standardwerte", g: "Einheitskreis", n: "Sinuswerte", st: "beide",
    f: "\\sin 0° = 0, \\; \\sin 30° = \\frac{1}{2}, \\; \\sin 45° = \\frac{\\sqrt{2}}{2}, \\; \\sin 60° = \\frac{\\sqrt{3}}{2}, \\; \\sin 90° = 1",
    k: "Merkhilfe: √0/2, √1/2, √2/2, √3/2, √4/2",
    bild: ["einheitskreis", { modus: "werte" }],
    her: [
      { t: "45° · das halbe Quadrat", s: [
        "Die Diagonale halbiert ein Quadrat der Seite 1 in zwei gleichschenklig-rechtwinklige Dreiecke. Diagonale nach Pythagoras: $\\sqrt{2}$.",
        "$$\\sin 45° = \\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2}",
      ] },
      { t: "30° und 60° · das halbe gleichseitige Dreieck", s: [
        "Ein gleichseitiges Dreieck der Seite 2 hat drei 60°-Winkel. Die Höhe halbiert es in zwei Dreiecke mit 30°, 60°, 90°.",
        "Kurze Kathete 1, Hypotenuse 2, Höhe $\\sqrt{4 - 1} = \\sqrt{3}$.",
        "$$\\sin 30° = \\frac{1}{2}, \\quad \\sin 60° = \\frac{\\sqrt{3}}{2}",
      ] },
    ],
    nutzt: [["pythagoras", "Diagonale und Höhe"], ["sinus", "Gegenkathete durch Hypotenuse"]],
    wz: "sinus",
  },
  {
    id: "kosinuswerte", g: "Einheitskreis", n: "Kosinuswerte", st: "beide",
    f: "\\cos 0° = 1, \\; \\cos 30° = \\frac{\\sqrt{3}}{2}, \\; \\cos 45° = \\frac{\\sqrt{2}}{2}, \\; \\cos 60° = \\frac{1}{2}, \\; \\cos 90° = 0",
    k: "dieselben Werte wie beim Sinus, nur rückwärts",
    bild: ["einheitskreis", { modus: "werte" }],
    her: { t: "Komplementwinkel", s: [
      "$\\cos\\alpha = \\sin(90° - \\alpha)$. Die Reihe der Sinuswerte von 90° rückwärts gelesen ergibt die Kosinuswerte.",
    ] },
    nutzt: [["standardwerte", "rückwärts gelesen"], ["komplement", "cos α = sin(90° − α)"]],
    wz: "sinus",
  },
];
