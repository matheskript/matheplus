/* FORMELSAMMLUNG · ERGÄNZUNGEN 4: Geometrie und Trigonometrie */
export const ERG_4 = {
  rechteck: {
    her: [{ t: "Mit Brüchen und Streifen", s: [
      "Ein Rechteck mit den Seiten $a$ und $b$ lässt sich in $b$ Streifen der Breite 1 schneiden. Jeder Streifen ist $a$ lang und 1 breit, hat also die Fläche $a$.",
      "$$A = a + a + \\ldots + a = a \\cdot b || b Summanden",
      "Das gilt auch für Seitenlängen, die keine ganzen Zahlen sind – man wählt dann kleinere Einheitsquadrate.",
    ] }],
    nutzt: [["kommutativ", "a · b = b · a"]],
  },
  "dreieck-flaeche": {
    her: [{ t: "Mit dem Parallelogramm", s: [
      "Zwei gleiche Dreiecke legen sich – eines um 180° gedreht – zu einem Parallelogramm mit Grundseite $g$ und Höhe $h$ zusammen.",
      "Dessen Fläche ist $g \\cdot h$. Jedes Dreieck hat die Hälfte davon: $A = \\frac{1}{2}gh$.",
    ] }],
    nutzt: [["parallelogramm-ebene", "zwei Dreiecke ergeben ein Parallelogramm"]],
  },
  "parallelogramm-ebene": {
    her: [{ t: "Mit dem Dreieck", s: [
      "Eine Diagonale teilt das Parallelogramm in zwei gleich große Dreiecke mit Grundseite $g$ und Höhe $h$.",
      "$$A = 2 \\cdot \\frac{1}{2} g h = g \\cdot h",
      "Verschiebt man die obere Seite entlang ihrer Linie, ändert sich weder Grundseite noch Höhe – deshalb auch nicht die Fläche (Scherung).",
    ] }],
    nutzt: [["dreieck-flaeche", "zwei Dreiecke"], ["rechteck", "Spezialfall mit rechtem Winkel"]],
  },
  trapez: {
    her: [{ t: "Mit der Mittellinie", s: [
      "Die Mittellinie verbindet die Mitten der beiden Schenkel und ist so lang wie der Mittelwert der parallelen Seiten: $m = \\frac{a + c}{2}$.",
      "Schneidet man das Trapez an der Mittellinie auf und klappt das obere Stück um, entsteht ein Rechteck mit Breite $m$ und Höhe $h$ (bei gleichschenkligem Trapez).",
      "$$A = m \\cdot h = \\frac{a + c}{2} \\cdot h",
    ] }],
    nutzt: [["rechteck", "umgelegt wird es ein Rechteck"], ["dreieck-flaeche", "alternativ: Zerlegung in zwei Dreiecke"]],
  },
  kreisumfang: {
    her: [{ t: "Alle Kreise sind ähnlich", s: [
      "Zwei Kreise lassen sich durch Vergrößern ineinander überführen. Dabei wachsen alle Längen mit demselben Faktor $k$ – Radius, Durchmesser und Umfang.",
      "Deshalb ist das Verhältnis $\\frac{U}{d}$ für alle Kreise gleich. Diese Zahl nennt man $\\pi \\approx 3{,}14159$.",
      "$$U = \\pi d = 2\\pi r",
    ] }],
    nutzt: [["aehnlich", "alle Kreise sind ähnlich"]],
  },
  kreissektor: {
    her: [{ t: "Mit dem Dreisatz", s: [
      "Der volle Kreis mit 360° hat den Umfang $2\\pi r$ und die Fläche $\\pi r^2$.",
      "Ein Sektor mit dem Winkel $\\alpha$ ist der Bruchteil $\\frac{\\alpha}{360°}$ davon:",
      "$$b = \\frac{\\alpha}{360°} \\cdot 2\\pi r, \\quad A = \\frac{\\alpha}{360°} \\cdot \\pi r^2",
      "Im Bogenmaß ($x = \\frac{\\alpha}{180°}\\pi$) wird daraus $b = x \\cdot r$ und $A = \\frac{1}{2}x r^2$.",
    ] }],
    nutzt: [["bogenmass", "Bogenlänge b = x · r"], ["prozent", "Anteil vom Ganzen"]],
  },
  quader: {
    her: [{ t: "Mit der Oberfläche", s: [
      "Die Oberfläche besteht aus drei Paaren gleicher Rechtecke: zweimal $a \\cdot b$ (oben, unten), zweimal $a \\cdot c$ (vorn, hinten), zweimal $b \\cdot c$ (links, rechts).",
      "$$O = 2ab + 2ac + 2bc = 2(ab + ac + bc)",
      "Beim Würfel mit $a = b = c$ wird daraus $V = a^3$ und $O = 6a^2$.",
    ] }],
    nutzt: [["rechteck", "Flächen der Seiten"], ["distributiv", "2 ausgeklammert"]],
  },
  kegel: {
    her: [{ t: "Mit dem Mantel", s: [
      "Der Mantel eines Kegels lässt sich zu einem Kreissektor mit Radius $s$ (Mantellinie) abrollen. Sein Bogen ist der Umfang des Grundkreises: $2\\pi r$.",
      "Der Sektor ist der Bruchteil $\\frac{2\\pi r}{2\\pi s} = \\frac{r}{s}$ des Vollkreises mit Radius $s$:",
      "$$M = \\frac{r}{s} \\cdot \\pi s^2 = \\pi r s",
      "Die Mantellinie berechnet man mit dem Pythagoras: $s = \\sqrt{r^2 + h^2}$.",
    ] }],
    nutzt: [["kreissektor", "Mantel als Sektor"], ["pythagoras", "Mantellinie s"]],
  },
  winkelsumme: {
    her: [{ t: "Mit dem Abreißen der Ecken", s: [
      "Reiße die drei Ecken eines Papierdreiecks ab und lege die Winkel nebeneinander: Sie ergeben eine gerade Linie, also 180°.",
      "Das ist keine Beweisführung, aber sie erklärt die Idee: Auf einer Geraden liegen die Winkel $\\alpha$, $\\beta$, $\\gamma$ nebeneinander.",
      "Streng bewiesen wird es mit Wechselwinkeln an der Parallelen durch die Spitze – daraus folgt auch die Summe 360° im Viereck (zwei Dreiecke).",
    ] }],
    nutzt: [["thales", "Folgerung: Winkel am Durchmesser"]],
  },
  aehnlich: {
    her: [{ t: "Flächen und Volumen skalieren", s: [
      "Vergrößert man alle Längen eines Rechtecks mit dem Faktor $k$, werden beide Seiten $k$-mal so lang: $A′ = ka \\cdot kb = k^2 ab$.",
      "Beim Quader kommt eine dritte Länge dazu: $V′ = ka \\cdot kb \\cdot kc = k^3 abc$.",
      "Jede Fläche und jeder Körper lässt sich in kleine Rechtecke bzw. Quader zerlegen – deshalb gilt es allgemein.",
    ] }],
    nutzt: [["rechteck", "Flächenfaktor k²"], ["quader", "Volumenfaktor k³"]],
  },
  thales: {
    her: [{ t: "Mit der Winkelsumme", s: [
      "Ist $M$ der Mittelpunkt von $AB$ und $C$ auf dem Halbkreis, sind $MA$, $MB$, $MC$ alle Radien. Die Dreiecke $AMC$ und $MBC$ sind gleichschenklig.",
      "Ihre Basiswinkel seien $\\alpha$ und $\\beta$. Die Winkelsumme im Dreieck $ABC$ ergibt $\\alpha + (\\alpha + \\beta) + \\beta = 180°$.",
      "$$2(\\alpha + \\beta) = 180° \\;\\Rightarrow\\; \\gamma = \\alpha + \\beta = 90°",
    ] }],
    nutzt: [["winkelsumme", "Summe im Dreieck"], ["kreisumfang", "Radien sind gleich lang"]],
  },
  "abstand-punkte": {
    her: [{ t: "Im Raum", s: [
      "Im Raum ist der Abstand von $P_1$ und $P_2$ die Raumdiagonale eines Quaders mit den Kanten $|\\Delta x|$, $|\\Delta y|$, $|\\Delta z|$.",
      "Zweimal Pythagoras: Erst die Diagonale der Grundfläche $\\sqrt{\\Delta x^2 + \\Delta y^2}$, dann mit der Höhe $\\Delta z$:",
      "$$d = \\sqrt{\\Delta x^2 + \\Delta y^2 + \\Delta z^2}",
    ] }],
    nutzt: [["betrag", "Länge des Verbindungsvektors"]],
  },
  hoehensatz: {
    her: [{ t: "Mit dem Satz des Pythagoras", s: [
      "Die Höhe $h$ teilt die Hypotenuse $c$ in $p$ und $q$. Zwei kleine rechtwinklige Dreiecke: $a^2 = h^2 + p^2$ und $b^2 = h^2 + q^2$.",
      "Im großen Dreieck: $a^2 + b^2 = c^2 = (p + q)^2$. Setzt man ein:",
      "$$2h^2 + p^2 + q^2 = p^2 + 2pq + q^2 \\;\\Rightarrow\\; h^2 = pq",
    ] }],
    nutzt: [["pythagoras", "dreimal angewandt"], ["binom1", "(p + q)² ausmultipliziert"]],
  },
  sinus: {
    her: [{ t: "Am Einheitskreis", s: [
      "Im Einheitskreis ist die Hypotenuse des Steigungsdreiecks zum Winkel $\\alpha$ der Radius 1. Dann ist der Sinus einfach die Länge der Gegenkathete.",
      "$$\\sin\\alpha = \\frac{\\text{Gegenkathete}}{1} = y\\text{-Koordinate des Punkts auf dem Kreis}",
      "Jedes andere Dreieck mit demselben Winkel ist eine Vergrößerung – das Verhältnis bleibt gleich.",
    ] }],
    nutzt: [["einheitskreis", "Hypotenuse = 1"], ["aehnlich", "gleiches Verhältnis in ähnlichen Dreiecken"]],
  },
  kosinus: {
    her: [{ t: "Am Einheitskreis", s: [
      "Im Einheitskreis ist die Ankathete zum Winkel $\\alpha$ die x-Koordinate des Punkts auf dem Kreis.",
      "$$\\cos\\alpha = \\frac{\\text{Ankathete}}{1} = x\\text{-Koordinate}",
      "Daran sieht man: $\\cos 0° = 1$ (ganz rechts) und $\\cos 90° = 0$ (ganz oben). Und der Kosinus ist der Sinus des Komplementwinkels.",
    ] }],
    nutzt: [["einheitskreis", "x-Koordinate"], ["komplement", "cos α = sin(90° − α)"]],
  },
  tangens: {
    her: [{ t: "Als Steigung", s: [
      "Der Tangens ist die Steigung der Geraden durch den Ursprung unter dem Winkel $\\alpha$: Gegenkathete durch Ankathete.",
      "Am Einheitskreis ist das die Länge des Stücks auf der Tangente bei $(1 | 0)$ – daher der Name »Tangens«.",
      "Bei 90° wird die Ankathete 0, die Steigung ist senkrecht und der Tangens nicht definiert.",
    ] }],
    nutzt: [["steigungswinkel", "Steigung als Tangens"], ["einheitskreis", "Tangensstück am Kreis"]],
  },
  sinussatz: { nutzt: [["thales", "Spezialfall γ = 90° (c ist Durchmesser des Umkreises)"], ["dreieck-trig", "gleiche Höhe, zwei Ausdrücke"]] },
  "dreieck-trig": {
    her: [{ t: "Mit dem Kreuzprodukt", s: [
      "Die Seiten $\\vec{a}$ und $\\vec{b}$ spannen ein Parallelogramm der Fläche $|\\vec{a} \\times \\vec{b}| = ab\\sin\\gamma$ auf.",
      "Das Dreieck ist die Hälfte davon: $A = \\frac{1}{2}ab\\sin\\gamma$.",
      "Für $\\gamma = 90°$ ist $\\sin\\gamma = 1$ und man erhält die bekannte Formel $\\frac{1}{2}ab$.",
    ] }],
    nutzt: [["dreieck-vek", "Kreuzprodukt als Fläche"]],
  },
  einheitskreis: {
    her: [{ t: "Mit dem Pythagoras", s: [
      "Der Punkt $P(x | y)$ liegt auf dem Kreis mit Radius 1 um den Ursprung. Der Abstand zum Ursprung ist 1:",
      "$$x^2 + y^2 = 1",
      "Mit $x = \\cos\\alpha$ und $y = \\sin\\alpha$ ist das der trigonometrische Pythagoras. Der Kreis ist die Lösungsmenge dieser Gleichung.",
    ] }],
    nutzt: [["abstand-punkte", "Abstand zum Ursprung ist 1"], ["trig-pythagoras", "x² + y² = 1"]],
  },
  "trig-pythagoras": {
    her: [{ t: "Aus den Definitionen", s: [
      "Im rechtwinkligen Dreieck mit Hypotenuse $c$ ist $\\sin\\alpha = \\frac{a}{c}$ und $\\cos\\alpha = \\frac{b}{c}$.",
      "$$\\sin^2\\alpha + \\cos^2\\alpha = \\frac{a^2}{c^2} + \\frac{b^2}{c^2} = \\frac{a^2 + b^2}{c^2} = \\frac{c^2}{c^2} = 1",
    ] }],
    nutzt: [["sinus", "a = c · sin α"], ["kosinus", "b = c · cos α"], ["pythagoras", "a² + b² = c²"]],
  },
  bogenmass: {
    her: [{ t: "Als Dreisatz", s: [
      "Der volle Winkel 360° gehört zum Kreisumfang $2\\pi$ (Einheitskreis). Also gehören 180° zu $\\pi$ und 1° zu $\\frac{\\pi}{180}$.",
      "$$x = \\alpha \\cdot \\frac{\\pi}{180°}, \\quad \\alpha = x \\cdot \\frac{180°}{\\pi}",
      "Merke: $90° = \\frac{\\pi}{2}$, $60° = \\frac{\\pi}{3}$, $45° = \\frac{\\pi}{4}$, $30° = \\frac{\\pi}{6}$.",
    ] }],
    nutzt: [["kreisumfang", "Umfang 2π des Einheitskreises"]],
  },
  symmetrien: {
    her: [{ t: "Mit den Koordinaten", s: [
      "Der Punkt zum Winkel $-x$ liegt am Einheitskreis genau unter dem Punkt zum Winkel $x$ – also gespiegelt an der x-Achse.",
      "Die x-Koordinate bleibt, die y-Koordinate wechselt das Vorzeichen: $\\cos(-x) = \\cos x$ und $\\sin(-x) = -\\sin x$.",
      "Daraus folgt: Der Kosinus ist achsensymmetrisch, der Sinus punktsymmetrisch zum Ursprung.",
    ] }],
    nutzt: [["symmetrie", "Achsen- und Punktsymmetrie"], ["einheitskreis", "Koordinaten des Punkts"]],
  },
  komplement: {
    her: [{ t: "Mit den Koordinaten", s: [
      "Die Spiegelung an der Winkelhalbierenden $y = x$ vertauscht die Koordinaten. Der Punkt zum Winkel $90° - \\alpha$ ist der Spiegelpunkt des Punkts zum Winkel $\\alpha$.",
      "Vertauschte Koordinaten bedeuten: $\\cos(90° - \\alpha) = \\sin\\alpha$ und $\\sin(90° - \\alpha) = \\cos\\alpha$.",
    ] }],
    nutzt: [["einheitskreis", "Spiegelung an y = x"], ["umkehrfkt", "Spiegelung an y = x vertauscht x und y"]],
  },
  verschiebung: {
    her: [{ t: "Mit dem Additionstheorem", s: [
      "$$\\sin\\left(x + \\frac{\\pi}{2}\\right) = \\sin x \\cos\\frac{\\pi}{2} + \\cos x \\sin\\frac{\\pi}{2} = \\sin x \\cdot 0 + \\cos x \\cdot 1 = \\cos x",
      "Die Kosinuskurve ist also eine um $\\frac{\\pi}{2}$ nach links verschobene Sinuskurve.",
    ] }],
    nutzt: [["additionstheorem", "Winkelsumme"], ["transform", "Verschiebung nach links"]],
  },
  periode: {
    her: [{ t: "Mit dem Additionstheorem", s: [
      "$$\\sin(x + 2\\pi) = \\sin x \\cos 2\\pi + \\cos x \\sin 2\\pi = \\sin x \\cdot 1 + \\cos x \\cdot 0 = \\sin x",
      "Dasselbe für den Kosinus. Der Tangens hat sogar die kürzere Periode $\\pi$, weil sich Zähler und Nenner beide beim Halbumlauf umdrehen.",
    ] }],
    nutzt: [["additionstheorem", "sin(x + 2π) ausmultipliziert"], ["sinusfkt", "Periode 2π/b"]],
  },
  kosinuswerte: {
    her: [{ t: "Aus den Sinuswerten", s: [
      "Mit $\\cos\\alpha = \\sin(90° - \\alpha)$ folgen die Kosinuswerte aus den Sinuswerten in umgekehrter Reihenfolge: $\\cos 0° = \\sin 90° = 1$, $\\cos 30° = \\sin 60° = \\frac{\\sqrt{3}}{2}$, …",
      "Merkhilfe: Die Zahlen $\\frac{\\sqrt{0}}{2}, \\frac{\\sqrt{1}}{2}, \\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{3}}{2}, \\frac{\\sqrt{4}}{2}$ für 0°, 30°, 45°, 60°, 90° ergeben den Sinus (aufwärts) und den Kosinus (abwärts).",
      "Probe mit dem Pythagoras: $\\left(\\frac{1}{2}\\right)^2 + \\left(\\frac{\\sqrt{3}}{2}\\right)^2 = \\frac{1}{4} + \\frac{3}{4} = 1$.",
    ] }],
    nutzt: [["trig-pythagoras", "Probe"], ["standardwerte", "Sinuswerte umgekehrt"]],
  },
};
