/* FORMELSAMMLUNG · Ergänzungen 6: Beispiele, Fallen, Werkzeuge, Suchwörter, Verknüpfungen für den Bestand
   Bereiche: Analysis, Funktionen, Vektoren. Aufbau: siehe fsErgaenzungen.js */

export const ERG_6 = {
  /* ======================= ANALYSIS ======================= */
  ableitung: { syn: "steigung tangentensteigung differenzieren ableiten" },
  hmethode: {
    bsp: [
      "$f(x) = x^2 + 3x$:",
      "$$\\frac{(x+h)^2 + 3(x+h) - x^2 - 3x}{h} = \\frac{2xh + h^2 + 3h}{h} || ausmultiplizieren, x² und 3x fallen weg",
      "$$= 2x + h + 3 \\;\\to\\; 2x + 3 || h kürzen, dann h → 0",
      "Also $f′(x) = 2x + 3$, zum Beispiel $f′(1) = 5$.",
    ],
  },
  "abl-id": { falle: "$x$ abgeleitet ergibt 1, nicht 0 – die 0 gehört zur Konstanten. So ist $(5x)′ = 5$, aber $(5)′ = 0$." },
  "abl-kehrwert": {
    bsp: [
      "$f(x) = \\frac{3}{x} = 3 \\cdot x^{-1}$:",
      "$$f′(x) = 3 \\cdot \\left(-\\frac{1}{x^2}\\right) = -\\frac{3}{x^2} || Faktorregel",
      "$f′(2) = -\\frac{3}{4}$: Der Graph fällt an der Stelle 2 mit Steigung $-0{,}75$.",
    ],
  },
  "abl-sin": {
    bsp: [
      "$f(x) = 2\\sin x$:",
      "$$f′(x) = 2\\cos x || Faktorregel",
      "$f′(0) = 2\\cos 0 = 2$: Im Ursprung steigt der Graph mit Steigung 2.",
    ],
  },
  "abl-cos": {
    bsp: [
      "$f(x) = \\cos x + x$:",
      "$$f′(x) = -\\sin x + 1 || Summenregel",
      "$f′\\left(\\frac{\\pi}{2}\\right) = -1 + 1 = 0$: waagerechte Tangente bei $x = \\frac{\\pi}{2}$.",
    ],
    falle: "Das Minus gehört zum Kosinus: $(\\cos x)′ = -\\sin x$, aber $(\\sin x)′ = +\\cos x$ – nicht verwechseln.",
  },
  "abl-ax": { falle: "Die Potenzregel gilt hier nicht: $(2^x)′$ ist nicht $x \\cdot 2^{x-1}$, denn die Variable steht im Exponenten. Richtig: $(2^x)′ = 2^x \\ln 2$." },
  "wurzel-pot": {
    falle: "$\\sqrt{x}$ ist $x^{\\frac{1}{2}}$ – nicht $x^{2}$ und nicht $x^{-2}$. Steht die Wurzel im Nenner, kommt ein Minus dazu: $\\frac{1}{\\sqrt{x}} = x^{-\\frac{1}{2}}$.",
    nutzt: [["wurzel-def", "die Quadratwurzel aus der Mittelstufe, jetzt als Potenz geschrieben"]],
  },
  nullstellen: {
    bsp: [
      "$f(x) = x^3 - 4x$:",
      "$$x^3 - 4x = x(x^2 - 4) = x(x - 2)(x + 2) = 0 || x ausklammern, dritte binomische Formel",
      "Satz vom Nullprodukt: $x_1 = 0$, $x_2 = 2$, $x_3 = -2$.",
    ],
    syn: "nullstelle x-achse schnittpunkt achsenschnittpunkt",
    nutzt: [["aequivalenzumformung", "f(x) = 0 wird mit Äquivalenzumformungen gelöst"]],
  },
  monotonie: {
    bsp: [
      "$f(x) = x^3 - 3x$, $f′(x) = 3x^2 - 3$:",
      "$$3x^2 - 3 = 0 \\;\\Rightarrow\\; x = -1 \\text{ oder } x = 1 || Stellen, an denen f′ das Vorzeichen wechseln kann",
      "Testwerte: $f′(-2) = 9 > 0$, $f′(0) = -3 < 0$, $f′(2) = 9 > 0$.",
      "Also steigend auf $]-\\infty ; -1]$, fallend auf $[-1 ; 1]$, steigend auf $[1 ; \\infty[$.",
    ],
    syn: "steigend fallend wachsend",
  },
  kruemmung: {
    bsp: [
      "$f(x) = x^3 - 3x^2$, $f″(x) = 6x - 6$:",
      "$f″(x) < 0$ für $x < 1$: rechtsgekrümmt (Kurve wie ein Hügel).",
      "$f″(x) > 0$ für $x > 1$: linksgekrümmt (Kurve wie eine Schale). Bei $x = 1$ wechselt die Krümmung – dort liegt der Wendepunkt.",
    ],
    syn: "linkskurve rechtskurve konvex konkav",
  },
  sattel: {
    bsp: [
      "$f(x) = x^3 - 3x^2 + 3x = (x - 1)^3 + 1$:",
      "$$f′(x) = 3(x - 1)^2, \\quad f″(x) = 6(x - 1), \\quad f‴(x) = 6",
      "$f′(1) = 0$, $f″(1) = 0$, $f‴(1) = 6 \\neq 0$: Sattelpunkt $S(1 | 1)$.",
    ],
    falle: "$f′(x_0) = 0$ und $f″(x_0) = 0$ reichen nicht: $f(x) = x^4$ erfüllt beides bei 0, hat dort aber einen Tiefpunkt. Erst $f‴(x_0) \\neq 0$ (oder kein Vorzeichenwechsel von $f′$) sichert den Sattelpunkt.",
    syn: "terrassenpunkt",
  },
  grenzverhalten: { falle: "Es zählt der Summand mit der höchsten Potenz, nicht der mit dem größten Koeffizienten: Bei $f(x) = -x^3 + 100x^2$ gilt $f(x) \\to -\\infty$ für $x \\to \\infty$." },
  asymptote: { falle: "Ein Graph darf seine waagerechte Asymptote schneiden – sie beschreibt nur das Verhalten für $x \\to \\pm\\infty$. $f(x) = \\frac{\\sin x}{x}$ schneidet $y = 0$ sogar unendlich oft." },
  extrem: { syn: "hochpunkt tiefpunkt extrempunkt maximum minimum" },
  wende: { syn: "wendepunkt wendestelle" },
  steckbrief: {
    bsp: [
      "Gesucht: Parabel $f(x) = ax^2 + bx + c$ mit Hochpunkt $H(2 | 3)$, die durch $P(0 | -1)$ geht.",
      "$$f(0) = -1:\\; c = -1, \\quad f(2) = 3:\\; 4a + 2b + c = 3, \\quad f′(2) = 0:\\; 4a + b = 0 || drei Bedingungen",
      "$$4a + 2b = 4, \\;\\; 4a + b = 0 \\;\\Rightarrow\\; b = 4, \\; a = -1 || zweite von erster Gleichung abziehen",
      "$f(x) = -x^2 + 4x - 1$. Probe: $f(2) = -4 + 8 - 1 = 3$.",
    ],
    syn: "rekonstruktion funktion bestimmen bedingungen",
  },
  ortskurve: {
    bsp: [
      "Schar $f_a(x) = x^2 - 2ax$: Tiefpunkt $T_a(a | -a^2)$.",
      "$$x = a, \\quad y = -a^2 || Koordinaten des Tiefpunkts",
      "$$a = x \\;\\Rightarrow\\; y = -x^2 || nach a auflösen und einsetzen",
      "Alle Tiefpunkte liegen auf der Ortskurve $y = -x^2$.",
    ],
    falle: "Erst nach dem Parameter auflösen, dann einsetzen. Steht in der Ortskurve noch ein $a$, ist der Schritt nicht fertig – sie darf nur von $x$ abhängen.",
  },
  schnittwinkel: { falle: "Bei $m_1 \\cdot m_2 = -1$ wird der Nenner 0 – die Formel versagt. Der Winkel ist dann genau 90°." },
  kettenregel: { syn: "verkettung innere äußere ableitung nachdifferenzieren" },
  produktregel: { syn: "produkt ableiten" },
  stammfkt: {
    falle: "Die Konstante gehört dazu: $F(x) = x^2$ und $F(x) = x^2 + 5$ sind beide Stammfunktionen von $f(x) = 2x$. Wer eine bestimmte sucht, braucht eine Zusatzbedingung.",
    syn: "aufleiten integrieren",
  },
  riemann: { falle: "Ober- und Untersumme mit wenigen Streifen sind nur Näherungen – erst der Grenzwert für $n \\to \\infty$ ist das Integral." },
  hauptsatz: { syn: "integral berechnen bestimmtes integral" },
  "flaeche-betrag": {
    bsp: [
      "$f(x) = x^2 - 1$ auf $[0 ; 2]$, Nullstelle bei $x = 1$:",
      "$$\\int_0^1 (x^2 - 1) \\, dx = \\frac{1}{3} - 1 = -\\frac{2}{3}, \\quad \\int_1^2 (x^2 - 1) \\, dx = \\frac{2}{3} - \\left(-\\frac{2}{3}\\right) = \\frac{4}{3}",
      "$$A = \\frac{2}{3} + \\frac{4}{3} = 2 || Beträge addieren",
      "Ohne Aufteilen käme $\\int_0^2 (x^2 - 1) \\, dx = \\frac{2}{3}$ heraus – falsch.",
    ],
  },
  "flaeche-zwischen": { falle: "Schneiden sich die Graphen innerhalb von $[a ; b]$, muss man an den Schnittstellen aufteilen – sonst heben sich Flächenstücke gegenseitig weg." },
  bestand: { falle: "Das Integral liefert nur die Änderung des Bestands. Der Anfangsbestand $B(0)$ muss noch addiert werden." },
  mittelwert: {
    falle: "Der Mittelwert der Funktionswerte ist nicht der Mittelwert der Randwerte: Für $f(x) = x^2$ auf $[0 ; 3]$ ist $\\overline{m} = 3$, nicht $\\frac{0 + 9}{2} = 4{,}5$.",
    nutzt: [["arith-mittel", "dieselbe Idee wie der Durchschnitt – Summe durch Anzahl wird Integral durch Intervalllänge"]],
  },
  rotation: {
    bsp: [
      "$f(x) = \\sqrt{x}$ dreht sich auf $[0 ; 4]$ um die x-Achse:",
      "$$V = \\pi \\int_0^4 (\\sqrt{x})^2 \\, dx = \\pi \\int_0^4 x \\, dx = \\pi \\cdot \\frac{16}{2} = 8\\pi",
      "$V \\approx 25{,}13$ Volumeneinheiten.",
    ],
  },
  uneigentlich: {
    bsp: [
      "$$\\int_1^b \\frac{1}{x^2} \\, dx = \\left[-\\frac{1}{x}\\right]_1^b = 1 - \\frac{1}{b}",
      "$$\\lim_{b \\to \\infty} \\left(1 - \\frac{1}{b}\\right) = 1",
      "Die unendlich lange Fläche unter $\\frac{1}{x^2}$ ab $x = 1$ hat den Inhalt 1.",
    ],
    falle: "Nicht jede gegen 0 fallende Funktion hat eine endliche Fläche: $\\int_1^{\\infty} \\frac{1}{x} \\, dx$ wächst über alle Grenzen.",
  },

  /* ======================= FUNKTIONEN ======================= */
  geradengl: {
    syn: "gerade lineare funktion achsenabschnitt",
    nutzt: [["proportional", "für b = 0 ist die Gerade eine proportionale Zuordnung"]],
  },
  steigung: {
    syn: "steigungsdreieck anstieg",
    nutzt: [["koordinaten", "die beiden Punkte werden im Koordinatensystem abgelesen"]],
  },
  punktsteigung: {
    falle: "Das Vorzeichen in der Klammer kippt: Durch $P(-2 | 1)$ heißt es $y = m(x + 2) + 1$, nicht $y = m(x - 2) + 1$.",
    syn: "punktsteigungsform gerade durch punkt",
  },
  steigungswinkel: {
    falle: "Bei negativer Steigung liefert der Taschenrechner einen negativen Winkel: $m = -1$ ergibt $\\alpha = -45°$ – die Gerade fällt unter 45°.",
    syn: "anstiegswinkel tangens winkel",
  },
  orthogeraden: {
    bsp: [
      "$g: y = 2x + 1$. Gesucht: die Senkrechte $h$ durch $P(4 | 0)$.",
      "$$m_h = -\\frac{1}{2} || denn 2 · (−½) = −1",
      "$$h: y = -\\frac{1}{2}(x - 4) = -\\frac{1}{2}x + 2",
    ],
    falle: "Kehrwert UND Vorzeichen wechseln: Zu $m = 2$ gehört $-\\frac{1}{2}$ – nicht $-2$ und nicht $\\frac{1}{2}$.",
    syn: "senkrecht rechtwinklig orthogonal lot",
    nutzt: [["geraden-lage", "senkrecht stehen kennt man aus der Unterstufe"]],
  },
  schnittpunkt: {
    falle: "Die Lösung von $f(x) = g(x)$ ist nur die x-Koordinate. Den y-Wert bekommt man erst durch Einsetzen in $f$ oder $g$.",
    syn: "gleichsetzen schneiden",
    nutzt: [["aequivalenzumformung", "die Gleichung f(x) = g(x) wird umgeformt"]],
  },
  "parabel-normal": {
    bsp: [
      "$f(x) = 2x^2 - 8x + 6$:",
      "$a = 2 > 0$: nach oben geöffnet, schmaler als die Normalparabel. $c = 6$: schneidet die y-Achse bei $(0 | 6)$.",
      "$$2x^2 - 8x + 6 = 0 \\;\\Leftrightarrow\\; x^2 - 4x + 3 = 0 \\;\\Rightarrow\\; x = 1 \\text{ oder } x = 3 || Nullstellen",
    ],
    falle: "$c$ ist der y-Achsenabschnitt, nicht die Höhe des Scheitels – nur bei $b = 0$ liegt der Scheitel auf der y-Achse.",
    syn: "quadratische funktion parabel",
  },
  scheitelform: {
    bsp: [
      "$f(x) = 2(x - 3)^2 - 4$: Scheitel $S(3 | -4)$, nach oben geöffnet, mit Faktor 2 gestreckt.",
      "$$f(x) = 2(x^2 - 6x + 9) - 4 = 2x^2 - 12x + 14 || ausmultipliziert zur Normalform",
    ],
    syn: "scheitelpunkt scheitel",
    nutzt: [["achsensymmetrie", "jede Parabel ist achsensymmetrisch zur senkrechten Geraden durch den Scheitel"]],
  },
  "scheitel-xs": {
    bsp: [
      "$f(x) = 2x^2 - 8x + 6$:",
      "$$x_S = -\\frac{-8}{2 \\cdot 2} = 2, \\quad f(2) = 8 - 16 + 6 = -2",
      "Scheitel $S(2 | -2)$.",
    ],
    falle: "Durch $2a$ teilen, nicht durch $a$, und das Minus nicht vergessen: Bei $x^2 + 6x$ ist $x_S = -3$, nicht $3$ oder $-6$.",
    syn: "scheitelpunkt scheitelstelle",
  },
  linearfaktor: {
    bsp: [
      "Nullstellen $-1$ und $3$, Graph durch $(0 | -6)$:",
      "$$f(x) = a(x + 1)(x - 3), \\quad f(0) = -3a = -6 \\;\\Rightarrow\\; a = 2",
      "$$f(x) = 2(x + 1)(x - 3) = 2x^2 - 4x - 6",
    ],
    syn: "faktorisierte form linearfaktoren nullstellenform",
    nutzt: [["ausklammern", "die Nullstellenform entsteht durch Ausklammern"]],
  },
  brennpunkt: { falle: "Bei $f(x) = x^2$ liegt der Brennpunkt bei $(0 | \\frac{1}{4})$, nicht bei $(0 | 1)$. Je stärker gestreckt, desto näher rückt er an den Scheitel.", syn: "fokus leitgerade parabolspiegel" },
  potenzfkt: {
    bsp: [
      "$f(x) = x^3$ (ungerade): punktsymmetrisch, durch $(-1 | -1)$, $(0 | 0)$, $(1 | 1)$; $f(2) = 8$.",
      "$g(x) = x^4$ (gerade): achsensymmetrisch, durch $(-1 | 1)$, $(0 | 0)$, $(1 | 1)$; $g(2) = 16$.",
    ],
    falle: "Bei negativem Exponenten ist $x = 0$ verboten: $f(x) = x^{-2} = \\frac{1}{x^2}$ hat bei 0 eine Polstelle.",
    syn: "hyperbel potenz",
    nutzt: [["antiproportional", "x hoch −1 ist die antiproportionale Zuordnung y = 1/x"]],
  },
  symmetrie: {
    syn: "achsensymmetrisch punktsymmetrisch gerade ungerade",
    nutzt: [["achsensymmetrie", "Spiegelung an der y-Achse"], ["punktsymmetrie", "Punktspiegelung am Ursprung"]],
  },
  transform: { syn: "verschieben strecken stauchen spiegeln" },
  umkehrfkt: {
    falle: "$f^{-1}(x)$ ist nicht $\\frac{1}{f(x)}$: Die Umkehrfunktion von $f(x) = 2x$ ist $\\frac{x}{2}$, nicht $\\frac{1}{2x}$.",
    nutzt: [["achsensymmetrie", "der Graph der Umkehrfunktion ist das Spiegelbild an y = x"]],
  },
  expfkt: {
    bsp: [
      "$f(x) = 3 \\cdot 2^x$: Startwert $f(0) = 3$, Wachstumsfaktor 2.",
      "$$f(4) = 3 \\cdot 2^4 = 48",
      "Pro Schritt nach rechts verdoppelt sich der Funktionswert.",
    ],
    falle: "Nicht mit der Potenzfunktion verwechseln: In $2^x$ steht die Variable im Exponenten, in $x^2$ in der Basis. Für $x = 10$: $2^{10} = 1024$, aber $10^2 = 100$.",
    syn: "exponentiell wachstumsfaktor",
    nutzt: [["wachstumsfaktor", "der Faktor a ist der Wachstumsfaktor 1 + p/100 aus der Prozentrechnung"]],
  },
  zins: {
    syn: "zinseszins sparen kapital",
    nutzt: [["wachstumsfaktor", "jedes Jahr mit q = 1 + p/100 multiplizieren"]],
  },
  "wachstum-exp": {
    bsp: [
      "500 Bakterien, $k = 0{,}2$ pro Stunde: $N(t) = 500 \\cdot e^{0{,}2t}$.",
      "$$N(5) = 500 \\cdot e^{1} \\approx 1359",
      "$$T_2 = \\frac{\\ln 2}{0{,}2} \\approx 3{,}47 \\text{ Stunden} || Verdopplungszeit",
    ],
    falle: "$k$ ist nicht der Prozentsatz: $k = 0{,}2$ bedeutet pro Zeiteinheit den Faktor $e^{0{,}2} \\approx 1{,}221$, also rund 22,1 % Zunahme – nicht 20 %.",
  },
  verdopplung: { falle: "Die Verdopplungszeit hängt nicht vom Anfangswert ab: Ob 10 oder 10 000 Bakterien – nach $T_2$ sind es doppelt so viele." },
  "wachstum-lin": {
    bsp: [
      "Eine 20 cm lange Kerze brennt pro Stunde 1,5 cm ab: $N(t) = 20 - 1{,}5t$.",
      "$$20 - 1{,}5t = 0 \\;\\Rightarrow\\; t = \\frac{20}{1{,}5} \\approx 13{,}3",
      "Nach gut 13 Stunden ist die Kerze heruntergebrannt.",
    ],
    falle: "Linear heißt gleicher Zuwachs, nicht gleicher Prozentsatz: $+5$ pro Jahr ist linear, $+5\\,%$ pro Jahr ist exponentiell.",
    syn: "linear zunahme abnahme",
    nutzt: [["proportional", "die Zunahme ist proportional zur vergangenen Zeit"]],
  },
  "wachstum-begrenzt": { falle: "$S - N_0$ ist der anfängliche Abstand zur Schranke, nicht die Schranke selbst: Bei $S = 100$ und $N_0 = 20$ steht $80 \\cdot e^{-kt}$ in der Formel." },
  logfkt: {
    bsp: [
      "$f(x) = \\ln x$: $f(1) = 0$, $f(e) = 1$.",
      "$$\\ln x = 2 \\;\\Rightarrow\\; x = e^2 \\approx 7{,}39 || e hoch beide Seiten",
    ],
    falle: "$\\ln$ gibt es nur für positive Zahlen: $\\ln 0$ und $\\ln(-1)$ sind nicht definiert, und $\\ln(x - 3)$ verlangt $x > 3$.",
  },
  sinusfkt: { syn: "sinuskurve schwingung amplitude periode" },

  /* ======================= VEKTOREN ======================= */
  betrag: {
    syn: "länge vektorlänge",
    nutzt: [["raumdiagonale", "die Länge eines Vektors ist die Raumdiagonale des Quaders aus seinen Koordinaten"]],
  },
  vektoraddition: {
    bsp: [
      "$\\vec{a} = (1 | 2 | -1)$, $\\vec{b} = (3 | 0 | 4)$:",
      "$$\\vec{a} + \\vec{b} = (4 | 2 | 3), \\quad 2 \\cdot \\vec{a} = (2 | 4 | -2) || komponentenweise",
    ],
    falle: "Vektor plus Zahl gibt es nicht: $\\vec{a} + 2$ ist nicht definiert. Erlaubt sind $\\vec{a} + \\vec{b}$ und $2 \\cdot \\vec{a}$.",
  },
  mittelpunkt: {
    bsp: [
      "$A(2 | -1 | 4)$, $B(6 | 3 | 0)$:",
      "$$\\vec{m} = \\frac{1}{2}\\left((2 | -1 | 4) + (6 | 3 | 0)\\right) = (4 | 1 | 2)",
      "Mittelpunkt $M(4 | 1 | 2)$.",
    ],
    falle: "Addieren und halbieren, nicht subtrahieren: $\\frac{1}{2}(\\vec{b} - \\vec{a})$ ist der halbe Verbindungsvektor, nicht der Ortsvektor des Mittelpunkts.",
    nutzt: [["mittelpunkt-2d", "dieselbe Formel in der Ebene – im Raum kommt nur eine Koordinate dazu"]],
  },
  einheitsvektor: {
    bsp: [
      "$\\vec{a} = (2 | -1 | 2)$, $|\\vec{a}| = \\sqrt{4 + 1 + 4} = 3$:",
      "$$\\vec{a}_0 = \\frac{1}{3} \\cdot (2 | -1 | 2) = \\left(\\frac{2}{3} \\,|\\, -\\frac{1}{3} \\,|\\, \\frac{2}{3}\\right)",
    ],
    falle: "Durch die Länge teilen, nicht durch die Summe der Koordinaten: Bei $(3 | 4 | 0)$ ist $|\\vec{a}| = 5$, nicht $7$.",
  },
  kollinear: { falle: "Bei drei Vektoren reicht es nicht, dass keine zwei kollinear sind: $(1 | 0 | 0)$, $(0 | 1 | 0)$ und $(1 | 1 | 0)$ sind paarweise nicht kollinear, aber linear abhängig." },
  linearkombination: {
    falle: "Mit zwei kollinearen Vektoren erreicht man nur eine Gerade: $(1 | 2)$ und $(2 | 4)$ erzeugen nur Vielfache von $(1 | 2)$, nicht die ganze Ebene.",
    wz: "vektorgenerator",
  },
  skalarprodukt: { syn: "punktprodukt" },
  orthogonal: { falle: "Das Skalarprodukt ist eine Zahl, kein Vektor: komponentenweise multiplizieren, dann addieren. $(1 | 2 | 3) \\cdot (3 | 0 | -1) = 3 + 0 - 3 = 0$.", syn: "senkrecht rechtwinklig" },
  vektorwinkel: { falle: "Taschenrechner auf Grad (DEG) stellen. Ein negatives Skalarprodukt bedeutet einen stumpfen Winkel – beim Winkel zweier Vektoren ist das richtig, erst beim Schnittwinkel von Geraden kommt ein Betrag dazu." },
  kreuzprodukt: { syn: "vektorprodukt normalenvektor" },
  punktprobe: {
    bsp: [
      "$g: \\vec{x} = (1 | 2 | 0) + t \\cdot (2 | -1 | 3)$, liegt $Q(5 | 0 | 6)$ auf $g$?",
      "$$1 + 2t = 5, \\quad 2 - t = 0, \\quad 3t = 6 || zeilenweise",
      "Alle drei Zeilen liefern $t = 2$: $Q$ liegt auf $g$.",
    ],
    falle: "Alle drei Zeilen müssen dasselbe $t$ liefern. Passt es in zwei Zeilen und in der dritten nicht, liegt der Punkt nicht auf der Geraden.",
  },
  "lage-geraden": {
    bsp: [
      "$g: \\vec{x} = (1 | 0 | 0) + r \\cdot (1 | 1 | 0)$, $h: \\vec{x} = (0 | 1 | 0) + s \\cdot (0 | 0 | 1)$.",
      "Richtungen nicht kollinear – also schneidend oder windschief.",
      "$$x_1: 1 + r = 0 \\Rightarrow r = -1, \\quad x_2: r = 1 || Widerspruch",
      "Kein Schnittpunkt: $g$ und $h$ sind windschief.",
    ],
  },
  "ebene-param": { falle: "Die beiden Spannvektoren dürfen nicht kollinear sein – sonst beschreibt die Gleichung nur eine Gerade." },
  "ebene-normal": {
    bsp: [
      "$P(1 | 2 | 3)$, $\\vec{n} = (2 | -1 | 1)$:",
      "$$\\left(\\vec{x} - (1 | 2 | 3)\\right) \\cdot (2 | -1 | 1) = 0",
      "$$2x_1 - x_2 + x_3 = 2 - 2 + 3 = 3 || ausmultipliziert: Koordinatenform",
    ],
    falle: "Der Normalenvektor steht senkrecht auf der Ebene, er liegt nicht in ihr – ein Spannvektor ist kein Normalenvektor.",
  },
  koordform: { falle: "Die Koeffizienten bilden den Normalenvektor, keinen Punkt: Aus $2x_1 - x_2 + 3x_3 = 4$ liest man $\\vec{n} = (2 | -1 | 3)$ ab. Fehlt eine Variable, ist ihr Koeffizient 0." },
  "param-koord": { falle: "Nach dem Kreuzprodukt $d$ mit dem Stützpunkt ausrechnen – und zur Probe $\\vec{n} \\cdot \\vec{u} = 0$ und $\\vec{n} \\cdot \\vec{v} = 0$ prüfen. Ein Vorzeichenfehler im Kreuzprodukt fällt so sofort auf." },
  spurpunkte: { falle: "Ist ein Koeffizient 0, gibt es auf dieser Achse keinen Spurpunkt – nicht durch 0 teilen. $x_1 + x_2 = 4$ verläuft parallel zur $x_3$-Achse." },
  "schnitt-ge": {
    bsp: [
      "$g: \\vec{x} = (1 | 0 | 2) + t \\cdot (1 | 1 | -1)$, $E: 2x_1 + x_2 + x_3 = 8$:",
      "$$2(1 + t) + t + (2 - t) = 8 \\;\\Rightarrow\\; 4 + 2t = 8 \\;\\Rightarrow\\; t = 2",
      "$t = 2$ in $g$ einsetzen: Schnittpunkt $S(3 | 2 | 0)$.",
    ],
    falle: "$t$ ist noch nicht die Antwort – erst in die Geradengleichung einsetzen. Ergibt sich ein Widerspruch wie $0 = 5$, ist die Gerade parallel zur Ebene.",
  },
  schnittgerade: {
    bsp: [
      "$E_1: x_1 + x_2 + x_3 = 6$, $E_2: x_1 - x_2 = 0$:",
      "$$\\vec{u} = (1 | 1 | 1) \\times (1 | -1 | 0) = (1 | 1 | -2)",
      "Stützpunkt mit $x_3 = 0$: $x_1 + x_2 = 6$, $x_1 = x_2$, also $(3 | 3 | 0)$.",
      "$$g: \\vec{x} = (3 | 3 | 0) + t \\cdot (1 | 1 | -2)",
    ],
    falle: "Das Kreuzprodukt liefert nur die Richtung. Den Stützpunkt muss man noch aus beiden Ebenengleichungen bestimmen, zum Beispiel mit $x_3 = 0$.",
  },
  hnf: {
    bsp: [
      "$E: 2x_1 - x_2 + 2x_3 = 6$, $|\\vec{n}| = \\sqrt{4 + 1 + 4} = 3$:",
      "$$\\frac{2x_1 - x_2 + 2x_3 - 6}{3} = 0 || Hessesche Normalform",
      "Abstand von $P(4 | 1 | 2)$: $d = \\frac{|8 - 1 + 4 - 6|}{3} = \\frac{5}{3}$.",
    ],
    falle: "Durch $|\\vec{n}|$ teilen, nicht durch $d$ – und den Betrag nicht vergessen. Das Vorzeichen sagt nur, auf welcher Seite der Ebene der Punkt liegt.",
  },
  "abstand-pg": {
    bsp: [
      "$g: \\vec{x} = t \\cdot (1 | 2 | 2)$, $Q(9 | 0 | 0)$. Lotfußpunkt $F(t | 2t | 2t)$:",
      "$$(\\vec{f} - \\vec{q}) \\cdot \\vec{u} = (t - 9) + 4t + 4t = 9t - 9 = 0 \\;\\Rightarrow\\; t = 1",
      "$F(1 | 2 | 2)$, $\\vec{QF} = (-8 | 2 | 2)$, $d = \\sqrt{64 + 4 + 4} = \\sqrt{72} = 6\\sqrt{2} \\approx 8{,}49$.",
    ],
    falle: "Der Abstand ist nicht die Länge zum Stützpunkt – der kürzeste Weg führt senkrecht zur Geraden, also zum Lotfußpunkt $F$.",
  },
  "abstand-ws": {
    bsp: [
      "$g: \\vec{x} = r \\cdot (1 | 0 | 0)$, $h: \\vec{x} = (0 | 1 | 3) + s \\cdot (0 | 1 | 0)$:",
      "$$\\vec{n} = (1 | 0 | 0) \\times (0 | 1 | 0) = (0 | 0 | 1)",
      "$$d = \\frac{|(0 | 1 | 3) \\cdot (0 | 0 | 1)|}{1} = 3",
    ],
    falle: "$\\vec{n}$ muss auf beiden Richtungen senkrecht stehen, also $\\vec{u} \\times \\vec{v}$. Bei parallelen Geraden ist $\\vec{u} \\times \\vec{v} = \\vec{0}$ – dann rechnet man Abstand Punkt–Gerade.",
  },
  spiegelung: {
    bsp: [
      "$Q(3 | 3 | 3)$ an $E: x_1 + x_2 + x_3 = 3$ spiegeln. Lotgerade: $\\vec{x} = (3 | 3 | 3) + t \\cdot (1 | 1 | 1)$.",
      "$$9 + 3t = 3 \\;\\Rightarrow\\; t = -2 \\;\\Rightarrow\\; F(1 | 1 | 1)",
      "$$\\vec{q}′ = (3 | 3 | 3) + 2 \\cdot (-2 | -2 | -2) = (-1 | -1 | -1)",
    ],
    falle: "Nur bis zum Lotfußpunkt zu gehen liefert $F$, nicht den Spiegelpunkt – der Weg $\\vec{QF}$ muss doppelt gegangen werden.",
  },
  "winkel-gg": {
    bsp: [
      "$\\vec{u} = (1 | 0 | 0)$, $\\vec{v} = (1 | 1 | 0)$:",
      "$$\\cos \\alpha = \\frac{|1|}{1 \\cdot \\sqrt{2}} = \\frac{1}{\\sqrt{2}} \\;\\Rightarrow\\; \\alpha = 45°",
    ],
    falle: "Ohne Betrag im Zähler kann ein stumpfer Winkel herauskommen. Der Schnittwinkel zweier Geraden liegt aber immer zwischen 0° und 90°.",
  },
  "winkel-ge": {
    bsp: [
      "$\\vec{u} = (0 | 1 | 1)$, $E: x_3 = 0$ mit $\\vec{n} = (0 | 0 | 1)$:",
      "$$\\sin \\alpha = \\frac{|1|}{\\sqrt{2} \\cdot 1} = \\frac{1}{\\sqrt{2}} \\;\\Rightarrow\\; \\alpha = 45°",
    ],
  },
  "winkel-ee": {
    bsp: [
      "$\\vec{n}_1 = (1 | 2 | 2)$, $\\vec{n}_2 = (2 | -1 | 2)$, beide mit Länge 3:",
      "$$\\cos \\alpha = \\frac{|2 - 2 + 4|}{3 \\cdot 3} = \\frac{4}{9} \\;\\Rightarrow\\; \\alpha \\approx 63{,}6°",
    ],
    falle: "Gerechnet wird mit den Normalenvektoren, aber mit Betrag im Zähler – sonst kann der Winkel größer als 90° werden.",
  },
  parallelogramm: {
    bsp: [
      "$\\vec{a} = (2 | 0 | 0)$, $\\vec{b} = (1 | 3 | 0)$:",
      "$$\\vec{a} \\times \\vec{b} = (0 | 0 | 6), \\quad A = |(0 | 0 | 6)| = 6",
    ],
    falle: "Das Kreuzprodukt ist ein Vektor – die Fläche ist erst sein Betrag. Ebene Vektoren ergänzt man mit $x_3 = 0$.",
  },
  "dreieck-vek": {
    bsp: [
      "$A(1 | 0 | 0)$, $B(3 | 0 | 0)$, $C(1 | 4 | 0)$: $\\vec{AB} = (2 | 0 | 0)$, $\\vec{AC} = (0 | 4 | 0)$.",
      "$$A = \\frac{1}{2} |(0 | 0 | 8)| = 4",
      "Probe: rechtwinkliges Dreieck mit Katheten 2 und 4, $\\frac{2 \\cdot 4}{2} = 4$.",
    ],
    falle: "Das Dreieck ist das halbe Parallelogramm – der Faktor $\\frac{1}{2}$ fehlt oft. Beide Vektoren müssen vom selben Eckpunkt ausgehen.",
  },
  spat: {
    bsp: [
      "$\\vec{a} = (1 | 0 | 0)$, $\\vec{b} = (1 | 2 | 0)$, $\\vec{c} = (0 | 1 | 3)$:",
      "$$\\vec{a} \\times \\vec{b} = (0 | 0 | 2), \\quad (0 | 0 | 2) \\cdot (0 | 1 | 3) = 6",
      "Spatvolumen $V = 6$.",
    ],
    falle: "Das Spatprodukt kann negativ sein, ein Volumen nicht – Betrag nehmen. Eine dreiseitige Pyramide aus denselben Vektoren hat nur $\\frac{1}{6}$ davon.",
  },
};
