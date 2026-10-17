/* FORMELSAMMLUNG · Ergänzungen 7: Beispiele, Fallen, Werkzeuge, Suchwörter, Verknüpfungen
   für den Bestand der Bereiche Stochastik, Geometrie, Terme, Kopfrechnen, Logik.
   Achtung: Schlüssel können mit ERG_1–5 übereinstimmen – fsErgaenzungen.js muss je id
   zusammenführen (her, nutzt, bsp anhängen), nicht überschreiben. */

export const ERG_7 = {
  /* ======================= Stochastik ======================= */
  laplace: {
    syn: "wahrscheinlichkeit günstig möglich würfel münze",
    nutzt: [["bruch-def", "günstige von allen Ergebnissen ist ein Bruchteil"]],
  },
  relhaeuf: {
    bsp: [
      "Ein Würfel wird 60-mal geworfen, 12-mal fällt eine Sechs:",
      "$$h_{60}(\\text{Sechs}) = \\frac{12}{60} = \\frac{1}{5} = 0{,}2 = 20\\,%",
      "Bei sehr vielen Würfen pendelt sich der Wert bei $\\frac{1}{6} \\approx 16{,}7\\,%$ ein.",
    ],
    falle: "Die relative Häufigkeit ist kein fester Wert: Nach 10 Würfen kann $h$ ganz anders aussehen als nach 1000. Erst bei vielen Versuchen ist sie eine gute Schätzung für $P$.",
    syn: "häufigkeit anteil strichliste trefferquote",
    nutzt: [["bruch-def", "Treffer von n Versuchen ist ein Bruchteil"]],
  },
  gegenereignis: {
    falle: "Das Gegenereignis zu »mindestens 2« ist »höchstens 1«, nicht »höchstens 2«. $A$ und $\\overline{A}$ müssen zusammen alle Ergebnisse umfassen – jedes genau einmal.",
    syn: "gegenteil gegenwahrscheinlichkeit nicht komplement",
  },
  additionssatz: {
    falle: "$P(A \\cup B) = P(A) + P(B)$ gilt nur, wenn sich $A$ und $B$ nicht überschneiden. Beim Würfel überschneiden sich »gerade« und »größer als 3« in 4 und 6: $\\frac{3}{6} + \\frac{3}{6} = 1$ wäre falsch, richtig ist $\\frac{4}{6}$.",
    syn: "oder vereinigung summe",
  },
  mindestens: { syn: "mindestens einmal wenigstens einer" },
  pfadregeln: {
    falle: "Ohne Zurücklegen ändern sich die Wahrscheinlichkeiten auf der zweiten Stufe. Bei 3 roten und 2 blauen Kugeln ist $P(\\text{rot, rot}) = \\frac{3}{5} \\cdot \\frac{2}{4} = \\frac{3}{10}$, nicht $\\frac{3}{5} \\cdot \\frac{3}{5}$.",
    syn: "baumdiagramm pfad produktregel summenregel",
  },
  bedingt: { syn: "unter der bedingung wenn schon" },
  vierfelder: {
    bsp: [
      "In einer Klasse mit 30 Personen tragen 12 eine Brille ($B$). Von den 16 Mädchen ($M$) tragen 8 eine Brille.",
      "$$P(M \\cap B) = \\frac{8}{30}, \\quad P(M \\cap \\overline{B}) = \\frac{16 - 8}{30} = \\frac{8}{30} || Zeile der Mädchen",
      "$$P(\\overline{M} \\cap B) = \\frac{12 - 8}{30} = \\frac{4}{30}, \\quad P(\\overline{M} \\cap \\overline{B}) = \\frac{14 - 4}{30} = \\frac{10}{30} || Rest über die Summen",
      "Probe: $8 + 8 + 4 + 10 = 30$ – alle vier Felder zusammen ergeben 1.",
    ],
    falle: "In den inneren Feldern stehen Wahrscheinlichkeiten von Schnittmengen, keine bedingten. $P_M(B)$ steht nicht in der Tafel, sondern ist $\\frac{P(M \\cap B)}{P(M)} = \\frac{8}{16}$.",
    syn: "tabelle vierfeldertafel kreuztabelle",
  },
  totale: {
    bsp: [
      "2 % der Bevölkerung haben eine Krankheit ($K$). Ein Test ist bei Kranken zu 95 % positiv ($T$), bei Gesunden zu 10 %.",
      "$$P(T) = 0{,}02 \\cdot 0{,}95 + 0{,}98 \\cdot 0{,}1 || beide Pfade, die zu T führen",
      "$$P(T) = 0{,}019 + 0{,}098 = 0{,}117",
      "Etwa 11,7 % aller Getesteten bekommen ein positives Ergebnis.",
    ],
    falle: "Nicht nur den »offensichtlichen« Pfad nehmen: $P(T) = 0{,}95$ ist falsch – auch die Gesunden mit falsch positivem Test gehören dazu.",
  },
  unabh: {
    bsp: [
      "Würfel: $A$ = »gerade«, $B$ = »höchstens 4«.",
      "$$P(A) = \\frac{1}{2}, \\quad P(B) = \\frac{2}{3}, \\quad P(A \\cap B) = P(\\{2; 4\\}) = \\frac{1}{3}",
      "$$P(A) \\cdot P(B) = \\frac{1}{2} \\cdot \\frac{2}{3} = \\frac{1}{3} = P(A \\cap B) || also unabhängig",
    ],
  },
  fakultaet: {
    falle: "$0! = 1$, nicht 0: Es gibt genau eine Möglichkeit, nichts anzuordnen. Und $(2n)!$ ist nicht $2 \\cdot n!$ – schon $4! = 24$, aber $2 \\cdot 2! = 4$.",
    syn: "fakultät ausrufezeichen anordnungen reihenfolgen",
  },
  "komb-mm": {
    falle: "Basis und Exponent nicht vertauschen: Ein Zahlenschloss mit 3 Stellen aus je 10 Ziffern hat $10^3 = 1000$ Einstellungen, nicht $3^{10}$.",
    syn: "zahlenschloss pin mit zurücklegen",
  },
  "komb-mo": {
    falle: "Ohne Zurücklegen wird jeder Faktor um 1 kleiner: Bei 8 Läufern gibt es für das Podest $8 \\cdot 7 \\cdot 6 = 336$ Möglichkeiten, nicht $8^3 = 512$.",
    syn: "podest siegerehrung ohne zurücklegen",
  },
  binomkoeff: { syn: "n über k lotto auswahl kombination" },
  "komb-om": {
    falle: "Nicht mit $\\binom{n}{k}$ verwechseln: 3 gleiche Kugeln auf 2 Sorten verteilen geht auf $\\binom{4}{3} = 4$ Arten (3|0, 2|1, 1|2, 0|3) – $\\binom{2}{3}$ wäre 0.",
  },
  hypergeom: {
    falle: "Die hypergeometrische Verteilung gilt nur ohne Zurücklegen. Wird zurückgelegt, bleibt die Trefferwahrscheinlichkeit gleich – dann gilt die Bernoulli-Formel.",
  },
  erwartungswert: {
    falle: "Der Erwartungswert muss kein mögliches Ergebnis sein: Beim Würfel ist $E(X) = 3{,}5$ – diese Augenzahl fällt nie.",
    syn: "mittelwert durchschnitt gewinn auf lange sicht",
    nutzt: [["arith-mittel", "langfristiger Durchschnitt vieler Versuche"]],
  },
  fair: { syn: "faires spiel einsatz gewinn" },
  varianz: {
    bsp: [
      "Glücksrad: $X = 0$ mit $p = 0{,}5$ und $X = 2$ mit $p = 0{,}5$, also $\\mu = 1$.",
      "$$V(X) = (0 - 1)^2 \\cdot 0{,}5 + (2 - 1)^2 \\cdot 0{,}5 = 0{,}5 + 0{,}5 = 1",
      "Die mittlere quadratische Abweichung vom Erwartungswert beträgt 1.",
    ],
    falle: "Erst $\\mu$ abziehen, dann quadrieren, dann mit $p_i$ gewichten. Ohne Quadrat ergibt $\\sum (x_i - \\mu) \\cdot p_i$ immer 0.",
    syn: "streuung abweichung",
  },
  sigma: {
    bsp: [
      "Mit $V(X) = 2{,}25$ ist $\\sigma = \\sqrt{2{,}25} = 1{,}5$.",
      "Misst $X$ einen Betrag in Euro, so hat $V(X)$ die Einheit Euro², $\\sigma$ aber wieder Euro.",
      "Typische Werte liegen also etwa 1,50 € vom Erwartungswert entfernt.",
    ],
    falle: "$\\sigma$ ist die Wurzel aus der Varianz, nicht die Varianz selbst: Bei $V(X) = 4$ ist $\\sigma = 2$.",
    syn: "standardabweichung streuung",
  },
  "ew-linear": {
    bsp: [
      "Ein Spiel zahlt $X$ Euro mit $E(X) = 3$ und $V(X) = 2$. Der Einsatz beträgt 4 €, der Gewinn ist $G = X - 4$.",
      "$$E(G) = 3 - 4 = -1, \\quad V(G) = 1^2 \\cdot 2 = 2 || Verschieben ändert die Streuung nicht",
      "Verdoppelt man alle Auszahlungen: $E(2X) = 6$ und $V(2X) = 2^2 \\cdot 2 = 8$.",
    ],
    wz: "erwartungswert",
  },
  "binom-ew": {
    falle: "$\\sigma^2 = n p (1-p)$ gilt nur für binomialverteilte $X$. Beim Ziehen ohne Zurücklegen stimmt $\\mu = n \\cdot \\frac{M}{N}$ zwar noch, die Varianz ist aber kleiner.",
  },
  kumuliert: {
    bsp: [
      "$X$ ist binomialverteilt mit $n = 10$ und $p = 0{,}5$. Gesucht ist $P(X \\geq 8)$.",
      "$$P(X \\geq 8) = 1 - P(X \\leq 7) || Gegenereignis",
      "$$P(X \\geq 8) = \\frac{\\binom{10}{8} + \\binom{10}{9} + \\binom{10}{10}}{2^{10}} = \\frac{45 + 10 + 1}{1024} \\approx 0{,}0547",
    ],
  },
  sigmaregeln: {
    falle: "Die Sigma-Regeln sind Näherungen und erst ab $\\sigma > 3$ brauchbar. Bei $n = 10$, $p = 0{,}5$ ist $\\sigma \\approx 1{,}58$ – dann besser exakt rechnen.",
  },
  "mindestens-n": { wz: "bernoulli" },
  fehlerarten: {
    bsp: [
      "$H_0$: Die Münze ist fair ($p = 0{,}5$). Bei 100 Würfen wird $H_0$ verworfen, wenn mehr als 60 oder weniger als 40-mal Kopf fällt.",
      "Fehler 1. Art: Die Münze ist fair, zufällig fällt aber 62-mal Kopf – $H_0$ wird zu Unrecht verworfen.",
      "Fehler 2. Art: In Wahrheit ist $p = 0{,}55$, es fällt 54-mal Kopf – $H_0$ wird zu Unrecht beibehalten.",
    ],
    falle: "$\\alpha$ und $\\beta$ ergänzen sich nicht zu 1 – sie werden unter verschiedenen Hypothesen berechnet. Macht man $\\alpha$ kleiner, wird $\\beta$ meist größer.",
  },

  /* ======================= Geometrie ======================= */
  rechteck: {
    bsp: [
      "Ein Zimmer ist 5 m lang und 4 m breit:",
      "$$A = 5\\,\\text{m} \\cdot 4\\,\\text{m} = 20\\,\\text{m}^2",
      "Ein Quadrat mit $a = 7\\,\\text{cm}$: $A = 7^2 = 49\\,\\text{cm}^2$.",
    ],
    falle: "Beide Seiten brauchen dieselbe Einheit: $3\\,\\text{m} \\cdot 50\\,\\text{cm}$ ist nicht 150, sondern $3\\,\\text{m} \\cdot 0{,}5\\,\\text{m} = 1{,}5\\,\\text{m}^2$.",
    syn: "fläche flächeninhalt länge mal breite kästchen quadrat",
    nutzt: [["flaechen-einheiten", "Fläche wird in Einheitsquadraten gemessen"]],
  },
  "dreieck-flaeche": {
    bsp: [
      "Grundseite $g = 8\\,\\text{cm}$, zugehörige Höhe $h = 5\\,\\text{cm}$:",
      "$$A = \\frac{1}{2} \\cdot 8\\,\\text{cm} \\cdot 5\\,\\text{cm} = 20\\,\\text{cm}^2",
      "Die Höhe steht senkrecht auf $g$ – bei einem stumpfwinkligen Dreieck kann sie außerhalb liegen.",
    ],
    syn: "dreieck fläche grundseite höhe halbe",
    nutzt: [["hoehe-dreieck", "die Höhe steht senkrecht auf der Grundseite"]],
  },
  "parallelogramm-ebene": {
    bsp: [
      "$g = 6\\,\\text{cm}$, $h = 4\\,\\text{cm}$, schräge Seite $5\\,\\text{cm}$:",
      "$$A = 6\\,\\text{cm} \\cdot 4\\,\\text{cm} = 24\\,\\text{cm}^2",
      "Die schräge Seite spielt für die Fläche keine Rolle.",
    ],
    falle: "Nicht die schräge Seite statt der Höhe nehmen: $6 \\cdot 5 = 30$ ist zu groß, weil die schräge Seite länger ist als die Höhe.",
    syn: "parallelogramm fläche",
  },
  trapez: {
    bsp: [
      "Parallele Seiten $a = 10\\,\\text{cm}$ und $c = 6\\,\\text{cm}$, Höhe $h = 4\\,\\text{cm}$:",
      "$$A = \\frac{10 + 6}{2} \\cdot 4 = 8 \\cdot 4 = 32\\,\\text{cm}^2",
    ],
    falle: "$a$ und $c$ sind die beiden parallelen Seiten, nicht die Schenkel. Und das Halbieren nicht vergessen: $(10 + 6) \\cdot 4 = 64$ wäre doppelt so viel.",
    syn: "trapez fläche mittellinie",
  },
  kreisumfang: {
    bsp: [
      "Ein Fahrradreifen hat den Durchmesser $d = 70\\,\\text{cm}$:",
      "$$U = \\pi \\cdot 70\\,\\text{cm} \\approx 219{,}9\\,\\text{cm}",
      "Nach 10 Umdrehungen ist das Rad also knapp 22 m weit gerollt.",
    ],
    falle: "Radius und Durchmesser nicht verwechseln: Mit $r = 5$ ist $U = 2\\pi \\cdot 5 = 10\\pi$, nicht $5\\pi$.",
    syn: "umfang kreis pi durchmesser radius",
    nutzt: [["kreis-begriffe", "d = 2r"]],
  },
  kreisflaeche: {
    syn: "fläche kreis pi radius",
    nutzt: [["kreis-begriffe", "Radius und Durchmesser"]],
  },
  kreissektor: {
    bsp: [
      "$r = 6\\,\\text{cm}$, $\\alpha = 60°$ – das ist $\\frac{60°}{360°} = \\frac{1}{6}$ des Kreises:",
      "$$A = \\frac{1}{6} \\cdot \\pi \\cdot 6^2 = 6\\pi \\approx 18{,}85\\,\\text{cm}^2",
      "$$b = \\frac{1}{6} \\cdot 2\\pi \\cdot 6 = 2\\pi \\approx 6{,}28\\,\\text{cm}",
    ],
    falle: "Beim Bogen steht $2\\pi r$, bei der Fläche $\\pi r^2$ – nur der Anteil $\\frac{\\alpha}{360°}$ ist bei beiden gleich.",
    syn: "kreisausschnitt tortenstück bogen bogenlänge",
    nutzt: [["kreis-begriffe", "Radius und Mittelpunktswinkel"]],
  },
  quader: {
    bsp: [
      "Ein Aquarium: $a = 60\\,\\text{cm}$, $b = 30\\,\\text{cm}$, $c = 40\\,\\text{cm}$.",
      "$$V = 60 \\cdot 30 \\cdot 40 = 72\\,000\\,\\text{cm}^3 = 72\\,\\text{l}",
      "$$O = 2 \\cdot (1800 + 2400 + 1200) = 2 \\cdot 5400 = 10\\,800\\,\\text{cm}^2",
    ],
    falle: "Volumen und Oberfläche haben verschiedene Einheiten: $\\text{cm}^3$ beim Volumen, $\\text{cm}^2$ bei der Oberfläche.",
    syn: "volumen rauminhalt würfel kiste oberfläche",
  },
  zylinder: {
    bsp: [
      "Eine Dose mit $r = 4\\,\\text{cm}$ und $h = 10\\,\\text{cm}$:",
      "$$V = \\pi \\cdot 4^2 \\cdot 10 = 160\\pi \\approx 502{,}7\\,\\text{cm}^3",
      "Das ist etwa ein halber Liter.",
    ],
    falle: "In $\\pi r^2 h$ wird nur $r$ quadriert. Wer den Durchmesser statt des Radius einsetzt, erhält das Vierfache.",
    syn: "zylinder dose prisma volumen",
  },
  pyramide: {
    bsp: [
      "Quadratische Grundfläche mit $a = 6\\,\\text{m}$, Körperhöhe $h = 5\\,\\text{m}$:",
      "$$V = \\frac{1}{3} \\cdot 6^2 \\cdot 5 = \\frac{1}{3} \\cdot 180 = 60\\,\\text{m}^3",
    ],
    falle: "$h$ ist die Körperhöhe (von der Spitze senkrecht zur Grundfläche), nicht die Höhe der dreieckigen Seitenflächen.",
    syn: "pyramide volumen drittel",
  },
  kegel: {
    bsp: [
      "$r = 3\\,\\text{cm}$, $h = 4\\,\\text{cm}$, also Mantellinie $s = \\sqrt{9 + 16} = 5\\,\\text{cm}$:",
      "$$V = \\frac{1}{3}\\pi \\cdot 3^2 \\cdot 4 = 12\\pi \\approx 37{,}7\\,\\text{cm}^3",
      "$$M = \\pi \\cdot 3 \\cdot 5 = 15\\pi \\approx 47{,}1\\,\\text{cm}^2",
    ],
    falle: "Für den Mantel braucht man die Mantellinie $s$, nicht die Höhe $h$. Sie folgt aus $s^2 = r^2 + h^2$.",
    syn: "kegel tüte volumen mantel",
  },
  kugel: {
    bsp: [
      "Ein Ball mit $r = 11\\,\\text{cm}$:",
      "$$V = \\frac{4}{3}\\pi \\cdot 11^3 \\approx 5575\\,\\text{cm}^3",
      "$$O = 4\\pi \\cdot 11^2 \\approx 1521\\,\\text{cm}^2",
    ],
    falle: "Beim Volumen $r^3$, bei der Oberfläche $r^2$: Doppelter Radius heißt 8-faches Volumen, aber nur 4-fache Oberfläche.",
    syn: "kugel ball volumen oberfläche",
  },
  winkelsumme: {
    bsp: [
      "Zwei Winkel sind bekannt: $\\alpha = 50°$, $\\beta = 70°$.",
      "$$\\gamma = 180° - 50° - 70° = 60°",
      "Im rechtwinkligen Dreieck ergeben die beiden anderen Winkel zusammen immer $90°$.",
    ],
    syn: "dreieck winkel 180 grad innenwinkel",
    nutzt: [["stufenwinkel", "Beweis mit Wechselwinkeln an einer Parallelen"]],
  },
  aehnlich: {
    falle: "Flächen wachsen mit $k^2$, nicht mit $k$: Ein Foto mit doppelter Länge und Breite braucht viermal so viel Papier.",
    syn: "ähnlich vergrößern verkleinern maßstab",
    nutzt: [["massstab", "ein Maßstab ist ein Ähnlichkeitsfaktor"]],
  },
  thales: {
    bsp: [
      "$AB$ ist Durchmesser eines Kreises mit $r = 5$, $C$ liegt auf dem Kreis und $AC = 6$.",
      "$$\\gamma = 90° \\;\\Rightarrow\\; BC = \\sqrt{10^2 - 6^2} = \\sqrt{64} = 8 || Pythagoras",
      "Erst der Satz des Thales sagt uns, dass hier ein rechtwinkliges Dreieck vorliegt.",
    ],
    falle: "Der rechte Winkel liegt bei $C$ auf dem Kreis, nicht bei $A$ oder $B$. Und $AB$ muss ein Durchmesser sein, nicht irgendeine Sehne.",
    syn: "thales halbkreis rechter winkel",
    nutzt: [["gleichschenklig", "die beiden Teildreiecke mit dem Mittelpunkt sind gleichschenklig"]],
  },
  pythagoras: {
    syn: "hypotenuse kathete rechtwinklig a quadrat plus b quadrat",
    nutzt: [["quadratzahlen", "Quadrate über den Seiten"]],
  },
  "abstand-punkte": {
    falle: "Erst die Differenzen quadrieren, dann addieren, dann die Wurzel ziehen: Für die Differenzen 3 und 4 ist $d = \\sqrt{9 + 16} = 5$, nicht $3 + 4 = 7$.",
    syn: "abstand länge strecke koordinaten",
    nutzt: [["koordinaten", "Punkte im Koordinatensystem"]],
  },
  hoehensatz: {
    bsp: [
      "Die Höhe teilt die Hypotenuse in $p = 4$ und $q = 9$, also $c = 13$:",
      "$$h^2 = 4 \\cdot 9 = 36 \\;\\Rightarrow\\; h = 6",
      "$$a^2 = 13 \\cdot 4 = 52, \\quad b^2 = 13 \\cdot 9 = 117",
      "Probe mit Pythagoras: $52 + 117 = 169 = 13^2$.",
    ],
    falle: "$p$ ist der Abschnitt an der Kathete $a$, $q$ der an $b$: $a^2 = c \\cdot p$. Wer $p$ und $q$ vertauscht, berechnet die andere Kathete.",
    syn: "höhensatz kathetensatz rechtwinklig",
  },
  sinus: {
    falle: "Sinus, Kosinus und Tangens gelten in dieser Form nur im rechtwinkligen Dreieck. Welche Kathete Gegen- und welche Ankathete ist, hängt vom gewählten Winkel ab.",
    syn: "sin gegenkathete hypotenuse trigonometrie",
  },
  kosinus: {
    bsp: [
      "Eine 5 m lange Leiter steht im Winkel $\\alpha = 70°$ zum Boden:",
      "$$\\cos 70° = \\frac{x}{5} \\;\\Rightarrow\\; x = 5 \\cdot \\cos 70° \\approx 1{,}71\\,\\text{m}",
      "So weit steht der Fuß der Leiter von der Wand entfernt.",
    ],
    falle: "Taschenrechner auf DEG stellen: Im Bogenmaß ist $\\cos 60 \\approx -0{,}95$, nicht $0{,}5$.",
    syn: "cos ankathete hypotenuse trigonometrie",
  },
  tangens: {
    bsp: [
      "Eine Straße steigt auf 100 m waagerechter Strecke um 8 m:",
      "$$\\tan \\alpha = \\frac{8}{100} = 0{,}08 \\;\\Rightarrow\\; \\alpha \\approx 4{,}6°",
      "8 % Steigung sind also nicht 8°.",
    ],
    falle: "Steigung in Prozent ist nicht der Winkel in Grad: 100 % Steigung entsprechen $45°$. Und $\\tan 90°$ gibt es nicht – die Ankathete wäre 0.",
    syn: "tan steigung gegenkathete ankathete",
  },
  sinussatz: {
    bsp: [
      "$a = 7$, $\\alpha = 40°$, $\\beta = 60°$. Gesucht ist $b$:",
      "$$b = \\frac{a \\cdot \\sin \\beta}{\\sin \\alpha} = \\frac{7 \\cdot \\sin 60°}{\\sin 40°} \\approx \\frac{6{,}062}{0{,}643} \\approx 9{,}43",
    ],
  },
  "dreieck-trig": {
    bsp: [
      "$a = 5$, $b = 8$ und der eingeschlossene Winkel $\\gamma = 30°$:",
      "$$A = \\frac{1}{2} \\cdot 5 \\cdot 8 \\cdot \\sin 30° = 20 \\cdot \\frac{1}{2} = 10",
    ],
    falle: "Der Winkel muss zwischen den beiden Seiten liegen: Zu $a$ und $b$ gehört $\\gamma$, nicht $\\alpha$.",
  },
  einheitskreis: {
    bsp: [
      "Für $\\alpha = 150°$ liegt der Punkt im zweiten Quadranten:",
      "$$P(\\cos 150° \\,|\\, \\sin 150°) = P\\left(-\\frac{\\sqrt{3}}{2} \\,|\\, \\frac{1}{2}\\right)",
      "Der Kosinus ist negativ, weil der Punkt links der y-Achse liegt.",
    ],
    falle: "Am Einheitskreis ist die x-Koordinate der Kosinus und die y-Koordinate der Sinus – nicht umgekehrt.",
    wz: "sinus",
  },
  "trig-pythagoras": {
    falle: "$\\sin^2 \\alpha$ bedeutet $(\\sin \\alpha)^2$, nicht $\\sin(\\alpha^2)$.",
  },
  bogenmass: {
    falle: "In der Analysis den Taschenrechner auf RAD stellen: $\\sin \\pi = 0$ im Bogenmaß, im Gradmaß wäre $\\sin 3{,}14° \\approx 0{,}055$.",
    syn: "bogenmaß radiant rad grad umrechnen",
  },
  symmetrien: {
    bsp: [
      "$$\\sin(-30°) = -\\sin 30° = -\\frac{1}{2}",
      "$$\\cos(-60°) = \\cos 60° = \\frac{1}{2}",
      "Am Einheitskreis gehört zu $-\\alpha$ der an der x-Achse gespiegelte Punkt.",
    ],
    falle: "Beim Sinus kommt das Minus heraus, beim Kosinus verschwindet es: $\\cos(-x) = \\cos x$, nicht $-\\cos x$.",
    wz: "sinus",
  },
  komplement: {
    bsp: [
      "$$\\sin 30° = \\cos 60° = \\frac{1}{2}",
      "Im rechtwinkligen Dreieck mit $\\alpha = 35°$ ist $\\beta = 55°$, also $\\sin 35° = \\cos 55° \\approx 0{,}574$.",
    ],
    falle: "Es heißt $90° - \\alpha$, nicht $180° - \\alpha$: $\\sin(180° - \\alpha) = \\sin \\alpha$ ist eine andere Regel.",
  },
  verschiebung: {
    bsp: [
      "$$\\sin\\left(0 + \\frac{\\pi}{2}\\right) = \\sin \\frac{\\pi}{2} = 1 = \\cos 0",
      "$$\\sin\\left(\\frac{\\pi}{2} + \\frac{\\pi}{2}\\right) = \\sin \\pi = 0 = \\cos \\frac{\\pi}{2}",
      "Der Kosinusgraph ist der Sinusgraph, um $\\frac{\\pi}{2}$ nach links verschoben.",
    ],
    falle: "$+\\frac{\\pi}{2}$ im Argument verschiebt den Graphen nach links, nicht nach rechts.",
    wz: "sinus",
  },
  periode: {
    bsp: [
      "$$f(x) = \\sin(3x) \\;\\Rightarrow\\; p = \\frac{2\\pi}{3}",
      "Bei $x = \\frac{2\\pi}{3}$ ist $3x = 2\\pi$ – genau eine volle Umdrehung.",
    ],
    falle: "Bei $\\sin(bx)$ ist die Periode $\\frac{2\\pi}{b}$, nicht $2\\pi b$: Größeres $b$ macht die Schwingung schneller, die Periode also kürzer.",
    wz: "sinus",
  },
  additionstheorem: {
    bsp: [
      "$$\\sin 75° = \\sin(45° + 30°) = \\frac{\\sqrt{2}}{2} \\cdot \\frac{\\sqrt{3}}{2} + \\frac{\\sqrt{2}}{2} \\cdot \\frac{1}{2}",
      "$$\\sin 75° = \\frac{\\sqrt{6} + \\sqrt{2}}{4} \\approx 0{,}966",
    ],
    falle: "$\\sin(\\alpha + \\beta) \\neq \\sin \\alpha + \\sin \\beta$: $\\sin 90° = 1$, aber $\\sin 45° + \\sin 45° \\approx 1{,}41$.",
  },
  standardwerte: {
    bsp: [
      "Ein gleichseitiges Dreieck mit Seite 2 wird halbiert: Gegenüber von $30°$ liegt die Kathete 1, die Hypotenuse ist 2.",
      "$$\\sin 30° = \\frac{1}{2} = \\frac{\\sqrt{1}}{2}",
    ],
    falle: "Die Werte gelten im Gradmaß. Im Bogenmaß heißt es $\\sin \\frac{\\pi}{6} = \\frac{1}{2}$ – $\\sin 30$ ohne Gradzeichen ist etwas ganz anderes.",
  },
  kosinuswerte: {
    bsp: [
      "$$\\cos 60° = \\frac{1}{2}, \\quad \\cos 30° = \\frac{\\sqrt{3}}{2} \\approx 0{,}866",
      "Die Kosinuswerte sind die Sinuswerte rückwärts, weil $\\cos \\alpha = \\sin(90° - \\alpha)$.",
    ],
    falle: "$\\cos 0° = 1$, nicht 0 – der Punkt am Einheitskreis liegt bei $(1 \\,|\\, 0)$.",
  },
  kugelgleichung: {
    falle: "Rechts steht $r^2$: Bei $(x_1 - 1)^2 + x_2^2 + x_3^2 = 9$ ist der Radius 3, nicht 9. Und der Mittelpunkt ist $M(1 \\,|\\, 0 \\,|\\, 0)$ – das Vorzeichen in der Klammer dreht sich um.",
  },

  /* ======================= Terme und Gleichungen ======================= */
  binom1: {
    syn: "binomische formel plus quadrat klammer hoch zwei",
    nutzt: [["klammer-mal-klammer", "(a + b)(a + b) ausmultipliziert"]],
  },
  binom2: {
    syn: "binomische formel minus quadrat",
    nutzt: [["klammer-mal-klammer", "(a − b)(a − b) ausmultipliziert"]],
  },
  binom3: {
    syn: "binomische formel plus mal minus differenz zweier quadrate",
    nutzt: [["klammer-mal-klammer", "(a + b)(a − b) ausmultipliziert"]],
  },
  quadergaenzung: {
    falle: "Was man addiert, muss man wieder abziehen: $x^2 + 6x = (x + 3)^2 - 9$. Ohne das $-9$ ändert sich der Term.",
    syn: "quadratische ergänzung scheitelform",
  },
  potenzgesetze: {
    syn: "potenz hoch exponent basis gleiche basis",
    nutzt: [["potenz-def", "eine Potenz ist ein Produkt gleicher Faktoren"]],
  },
  "potenz-pot": {
    syn: "potenz hoch klammer",
    nutzt: [["potenz-def", "Faktoren abzählen"]],
  },
  potenzneg: {
    syn: "negativer exponent hoch minus hoch null",
    nutzt: [["kehrwert", "a hoch −n ist der Kehrwert von a hoch n"]],
  },
  wurzelpot: { syn: "wurzel bruch exponent" },
  logdef: { syn: "log logarithmus exponent gesucht" },
  loggesetze: { syn: "logarithmus regeln produkt quotient" },
  logpot: { syn: "log exponent runterholen" },
  lineargl: {
    syn: "gleichung lösen x umformen",
    nutzt: [["aequivalenzumformung", "auf beiden Seiten dasselbe tun"]],
  },
  mitternacht: {
    syn: "abc formel quadratische gleichung lösungsformel",
    nutzt: [["wurzel-def", "die Wurzel aus der Diskriminante"]],
  },
  pq: {
    syn: "pq formel quadratische gleichung",
    nutzt: [["wurzel-def", "Wurzel nur aus Zahlen ≥ 0"]],
  },
  diskriminante: {
    falle: "Die Diskriminante ist der Term unter der Wurzel – ohne die Wurzel. Bei $D < 0$ gibt es keine reelle Lösung, nicht etwa eine negative.",
    syn: "anzahl lösungen unter der wurzel",
  },
  vieta: { syn: "lösungen summe produkt probe" },
  nullprodukt: {
    syn: "produkt null ausklammern faktor",
    nutzt: [["ausklammern", "erst ausklammern, dann jeden Faktor null setzen"]],
  },
  expgl: { syn: "exponent gleichung logarithmieren" },
  ungleichung: { syn: "kleiner größer zeichen umdrehen" },
  polydiv: {
    falle: "Fehlende Potenzen mit 0 auffüllen: $x^3 - 1$ wird als $x^3 + 0x^2 + 0x - 1$ geteilt, sonst verrutschen die Spalten.",
  },
  "betrag-ungl": {
    syn: "betrag abstand fallunterscheidung",
    wz: "gleichungen",
    nutzt: [["gegenzahl", "|x| ist der Abstand zur 0"]],
  },
  gauss: { syn: "gleichungssystem lgs stufenform eliminieren" },
  "lgs-loesbar": {
    falle: "Eine Zeile $0 = 0$ heißt nicht »keine Lösung«: Diese Gleichung schränkt nichts ein – es bleiben unendlich viele Lösungen.",
    syn: "gleichungssystem keine unendlich viele lösungen",
  },

  /* ======================= Kopfrechnen ======================= */
  kommutativ: {
    bsp: [
      "$$4 \\cdot 17 \\cdot 25 = 4 \\cdot 25 \\cdot 17 = 100 \\cdot 17 = 1700",
      "$$19 + 46 + 1 = 19 + 1 + 46 = 66",
      "Erst die Partner suchen, die zusammen eine runde Zahl ergeben.",
    ],
    syn: "vertauschen reihenfolge tauschen",
  },
  assoziativ: { syn: "klammern verschieben zusammenfassen" },
  distributiv: {
    falle: "Jeder Summand in der Klammer wird multipliziert: $3 \\cdot (x + 4) = 3x + 12$, nicht $3x + 4$.",
    syn: "ausmultiplizieren klammer verteilen",
  },
  mal11: {
    syn: "mal elf 11er",
    nutzt: [["stellenwert", "Einer, Zehner und Hunderter getrennt"]],
  },
  mal5: {
    falle: "Erst mal 10, dann halbieren – dann gibt es keine Kommazahl: $47 \\cdot 5 = 470 : 2 = 235$. Wer zuerst halbiert, muss mit $23{,}5 \\cdot 10$ weiterrechnen.",
    syn: "mal fünf",
  },
  mal25: {
    falle: "Durch 4 heißt zweimal halbieren: $36 \\cdot 25 = 3600 : 4 = 900$. Nur einmal halbieren wäre mal 50.",
    syn: "mal fünfundzwanzig viertel",
  },
  quadrat5: {
    falle: "Die Zehnerziffer wird mit ihrem Nachfolger multipliziert, nicht mit sich selbst: $35^2$ → $3 \\cdot 4 = 12$, also $1225$.",
    syn: "quadrat fünf hoch zwei",
    nutzt: [["quadratzahlen", "Quadratzahlen schnell im Kopf"]],
  },
  mitte: {
    falle: "Beide Zahlen müssen gleich weit von der Mitte entfernt sein: $48 \\cdot 52 = 50^2 - 2^2 = 2496$. Für $48 \\cdot 53$ klappt der Trick so nicht.",
    syn: "mal um die mitte binomisch",
  },
  nahe100: { syn: "mal hundert nahe" },
  mal9: {
    falle: "Bei mal 99 zieht man die Zahl selbst ab, nicht 99: $23 \\cdot 99 = 2300 - 23 = 2277$.",
    syn: "mal neun neunundneunzig",
  },
  teil2510: {
    bsp: [
      "$$7350: \\text{ Endziffer } 0 \\;\\Rightarrow\\; \\text{durch 2, 5 und 10 teilbar}",
      "$$845: \\text{ Endziffer } 5 \\;\\Rightarrow\\; \\text{durch 5, nicht durch 2 und 10}",
      "$$1236: \\text{ Endziffer } 6 \\;\\Rightarrow\\; \\text{nur durch 2}",
    ],
    syn: "teilbar endziffer gerade ungerade",
    nutzt: [["stellenwert", "nur die Einer entscheiden – jeder Zehner ist durch 10 teilbar"]],
  },
  teil39: {
    syn: "teilbar quersumme drei neun",
    nutzt: [["stellenwert", "Zahl in Stellenwerte zerlegen"]],
  },
  teil48: {
    bsp: [
      "$$5124: \\; 24 \\text{ ist durch 4 teilbar} \\;\\Rightarrow\\; 5124 \\text{ durch 4 teilbar}",
      "$$9136: \\; 136 = 8 \\cdot 17 \\;\\Rightarrow\\; 9136 \\text{ durch 8 teilbar}",
    ],
    falle: "Bei 4 zählen die letzten zwei, bei 8 die letzten drei Ziffern: Bei $316$ ist 16 durch 8 teilbar, aber $316 : 8 = 39{,}5$.",
    syn: "teilbar vier acht endstellen",
  },
  teil6: {
    bsp: [
      "$$1452: \\text{ gerade, Quersumme } 12 \\;\\Rightarrow\\; \\text{durch 6 teilbar}",
      "$$1454: \\text{ gerade, Quersumme } 14 \\;\\Rightarrow\\; \\text{nicht durch 6 teilbar}",
    ],
    falle: "Beide Bedingungen müssen gelten: 21 ist durch 3, aber nicht durch 2 teilbar – also nicht durch 6. Der Trick klappt nur, weil 2 und 3 keinen gemeinsamen Teiler außer 1 haben: Aus »durch 2 und durch 4« folgt nicht »durch 8« (Beispiel 4).",
    syn: "teilbar sechs",
  },
  teil11: {
    syn: "teilbar elf alternierende quersumme",
    nutzt: [["stellenwert", "Zehnerpotenzen abwechselnd 1 mehr und 1 weniger als ein Vielfaches von 11"]],
  },
  teiler: {
    bsp: [
      "$$84 = 2 \\cdot 42 = 2 \\cdot 2 \\cdot 21 = 2^2 \\cdot 3 \\cdot 7",
      "Immer mit der kleinsten Primzahl anfangen, bis nur noch Primzahlen übrig sind.",
    ],
    falle: "1 ist keine Primzahl und gehört nicht in die Zerlegung. Auch 9 ist keine Primzahl: $36 = 4 \\cdot 9$ ist noch nicht fertig, richtig ist $2^2 \\cdot 3^2$.",
    syn: "primfaktoren zerlegen primzahl",
    nutzt: [["primzahl", "die Bausteine der Zerlegung"]],
  },
  "bruch-kuerzen": {
    bsp: [
      "$$\\frac{18}{24} = \\frac{18 : 6}{24 : 6} = \\frac{3}{4} || mit dem ggT 6 kürzen",
      "$$\\frac{2}{3} = \\frac{2 \\cdot 5}{3 \\cdot 5} = \\frac{10}{15} || mit 5 erweitern",
      "Der Wert bleibt gleich – nur die Stücke werden größer oder kleiner.",
    ],
    syn: "kürzen erweitern bruch",
    nutzt: [["ggt", "mit dem ggT ist in einem Schritt fertig gekürzt"], ["bruch-def", "gleicher Anteil, andere Stückelung"]],
  },
  "bruch-add": {
    syn: "plus addieren subtrahieren minus gleichnamig hauptnenner",
    nutzt: [["kgv", "das kgV der Nenner ist der Hauptnenner"], ["bruch-erweitern", "auf den Hauptnenner erweitern"]],
  },
  "bruch-mul": {
    bsp: [
      "$$\\frac{2}{3} \\cdot \\frac{9}{10} = \\frac{2 \\cdot 9}{3 \\cdot 10} = \\frac{18}{30} = \\frac{3}{5}",
      "Schneller: vorher kürzen – 2 gegen 10 und 9 gegen 3: $\\frac{1 \\cdot 3}{1 \\cdot 5} = \\frac{3}{5}$.",
    ],
    falle: "Beim Multiplizieren braucht man keinen gemeinsamen Nenner: Zähler mal Zähler, Nenner mal Nenner. Nur beim Addieren müssen die Nenner gleich sein.",
    syn: "mal multiplizieren bruch",
    nutzt: [["anteil-von", "»von« heißt mal"]],
  },
  "bruch-div": {
    falle: "Nur der zweite Bruch wird umgedreht: $\\frac{3}{4} : \\frac{1}{2} = \\frac{3}{4} \\cdot \\frac{2}{1} = \\frac{3}{2}$.",
    syn: "geteilt dividieren kehrwert bruch",
    nutzt: [["kehrwert", "mit dem Kehrwert multiplizieren"]],
  },
  prozent: { syn: "prozentrechnung hundertstel" },

  /* ======================= Mengenlehre und Logik ======================= */
  element: {
    bsp: [
      "Für $A = \\{2; 4; 6; 8\\}$ gilt:",
      "$$4 \\in A, \\quad 5 \\notin A",
      "Bei den Zahlbereichen: $-3 \\notin \\mathbb{N}$, aber $-3 \\in \\mathbb{Z}$.",
    ],
    syn: "element enthalten gehört dazu",
  },
  teilmenge: {
    bsp: [
      "$$\\{2; 4\\} \\subseteq \\{1; 2; 3; 4\\}",
      "$\\{2; 5\\}$ ist keine Teilmenge davon, weil $5 \\notin \\{1; 2; 3; 4\\}$.",
      "$$\\mathbb{N} \\subseteq \\mathbb{Z}, \\quad \\emptyset \\subseteq A \\text{ für jede Menge } A",
    ],
    falle: "Element und Teilmenge nicht verwechseln: $2 \\in \\{1; 2\\}$, aber $\\{2\\} \\subseteq \\{1; 2\\}$. Eine Zahl ist keine Menge.",
    syn: "teilmenge enthalten",
  },
  vereinigung: {
    bsp: [
      "$A = \\{1; 2; 3\\}$ und $B = \\{3; 4\\}$:",
      "$$A \\cup B = \\{1; 2; 3; 4\\}",
      "Die 3 steht nur einmal in der Menge.",
    ],
    falle: "»Oder« schließt »beides« ein: Elemente, die in $A$ und in $B$ liegen, gehören auch zu $A \\cup B$.",
    syn: "vereinigung oder zusammen",
  },
  schnittmenge: {
    bsp: [
      "$A = \\{1; 2; 3\\}$ und $B = \\{3; 4\\}$:",
      "$$A \\cap B = \\{3\\}",
      "Gerade Zahlen geschnitten mit den Vielfachen von 3 ergeben die Vielfachen von 6.",
    ],
    falle: "Ist der Schnitt leer, schreibt man $A \\cap B = \\emptyset$, nicht $\\{0\\}$ – die Menge $\\{0\\}$ enthält ein Element.",
    syn: "schnitt gemeinsam und",
  },
  differenzmenge: {
    bsp: [
      "$$\\{1; 2; 3; 4\\} \\setminus \\{3; 4; 5\\} = \\{1; 2\\}",
      "Die 5 spielt keine Rolle – sie war gar nicht in der ersten Menge.",
    ],
    falle: "Die Reihenfolge zählt: Im Beispiel ist $B \\setminus A = \\{5\\}$, also etwas ganz anderes als $A \\setminus B$.",
    syn: "ohne differenz",
  },
  leeremenge: {
    bsp: [
      "Die Gleichung $x^2 = -1$ hat in $\\mathbb{R}$ keine Lösung: $L = \\emptyset$.",
      "$$\\{2; 4\\} \\cap \\{1; 3\\} = \\emptyset",
    ],
    syn: "leer keine lösung",
  },
  zahlbereiche: {
    bsp: [
      "$$-5 \\in \\mathbb{Z}, \\quad \\frac{2}{3} \\in \\mathbb{Q}, \\quad \\sqrt{2} \\in \\mathbb{R} \\setminus \\mathbb{Q}",
      "Jede natürliche Zahl ist auch ganz, rational und reell.",
    ],
    falle: "$\\sqrt{4} = 2$ ist natürlich, obwohl eine Wurzel dasteht. Und $0{,}\\overline{3} = \\frac{1}{3}$ ist rational – periodische Dezimalzahlen sind Brüche.",
    syn: "natürliche ganze rationale reelle zahlen",
    nutzt: [["bruch-def", "die rationalen Zahlen sind die Brüche"]],
  },
  intervalle: {
    bsp: [
      "$$[2; 5[ \\; = \\{ x \\in \\mathbb{R} \\mid 2 \\leq x < 5 \\}",
      "2 gehört dazu, 5 nicht.",
      "$$]-\\infty; 3] = \\{ x \\in \\mathbb{R} \\mid x \\leq 3 \\} || bei Unendlich ist die Klammer immer offen",
    ],
    syn: "intervall von bis klammer",
  },
  "demorgan-m": {
    bsp: [
      "Grundmenge $\\{1; 2; \\ldots; 6\\}$, $A = \\{1; 2\\}$, $B = \\{2; 3\\}$:",
      "$$\\overline{A \\cup B} = \\overline{\\{1; 2; 3\\}} = \\{4; 5; 6\\}",
      "$$\\overline{A} \\cap \\overline{B} = \\{3; 4; 5; 6\\} \\cap \\{1; 4; 5; 6\\} = \\{4; 5; 6\\}",
    ],
    falle: "Beim Verneinen dreht sich das Zeichen um: $\\overline{A \\cup B}$ ist nicht $\\overline{A} \\cup \\overline{B}$.",
  },
  undoder: {
    bsp: [
      "$A$: »Die Zahl ist gerade«, $B$: »Die Zahl ist größer als 5«. Für die Zahl 4:",
      "$$A \\land B \\text{ ist falsch}, \\quad A \\lor B \\text{ ist wahr}, \\quad \\neg B \\text{ ist wahr}",
    ],
    falle: "»Oder« heißt in der Mathematik nicht »entweder – oder«: $A \\lor B$ ist auch wahr, wenn beide wahr sind.",
    syn: "und oder nicht",
  },
  implikation: {
    bsp: [
      "»Wenn eine Zahl durch 4 teilbar ist, dann ist sie gerade.« – wahr.",
      "Die Umkehrung »Wenn gerade, dann durch 4 teilbar« ist falsch. Gegenbeispiel: 6.",
    ],
    falle: "$A \\Rightarrow B$ heißt nicht $B \\Rightarrow A$. Und ist $A$ falsch, ist die Implikation immer wahr.",
    syn: "wenn dann folgt",
    wz: "entdecken",
  },
  aequivalenz: {
    bsp: [
      "»Eine Zahl ist durch 6 teilbar $\\Leftrightarrow$ sie ist durch 2 und durch 3 teilbar.« – beide Richtungen gelten.",
      "»$x = 2 \\Leftrightarrow x^2 = 4$« ist falsch: Aus $x^2 = 4$ folgt auch $x = -2$.",
    ],
    falle: "Quadrieren ist keine Äquivalenzumformung: Aus $x = 3$ folgt $x^2 = 9$, aber nicht umgekehrt.",
    syn: "genau dann wenn äquivalent",
  },
  kontraposition: {
    bsp: [
      "»Wenn es regnet, ist die Straße nass.«",
      "Kontraposition: »Wenn die Straße nicht nass ist, regnet es nicht.« – gleichwertig.",
      "Nicht gleichwertig: »Wenn die Straße nass ist, regnet es.« – sie kann auch gespritzt worden sein.",
    ],
    syn: "umkehrung verneinung",
    wz: "entdecken",
  },
  "demorgan-l": {
    bsp: [
      "»Nicht (groß und blond)« heißt »nicht groß oder nicht blond«.",
      "Die Verneinung von »$x > 0$ und $x < 5$« ist »$x \\leq 0$ oder $x \\geq 5$«.",
    ],
    falle: "Beim Verneinen wird aus »und« ein »oder«: $x \\leq 0 \\land x \\geq 5$ wäre nie erfüllt.",
    syn: "verneinung und oder",
  },
  quantoren: {
    bsp: [
      "$$\\forall x \\in \\mathbb{R}: x^2 \\geq 0 || wahr",
      "$$\\exists x \\in \\mathbb{N}: x + 3 = 1 || falsch",
      "Die Verneinung von »Alle Schwäne sind weiß« ist »Es gibt einen Schwan, der nicht weiß ist«.",
    ],
    syn: "für alle es gibt",
  },
  direkt: {
    bsp: [
      "Behauptung: Die Summe zweier gerader Zahlen ist gerade.",
      "$$a = 2m, \\; b = 2n \\;\\Rightarrow\\; a + b = 2m + 2n = 2(m + n) || Distributivgesetz",
      "$m + n$ ist ganzzahlig, also ist $a + b$ gerade.",
    ],
    falle: "Ein Beispiel ist kein Beweis: $2 + 4 = 6$ zeigt nur einen Fall. Der Beweis muss für alle geraden Zahlen gelten – deshalb mit Variablen.",
    syn: "beweis schlussfolgern",
    wz: "entdecken",
  },
  widerspruch: {
    bsp: [
      "Behauptung: Es gibt keine größte natürliche Zahl.",
      "Annahme: $n$ ist die größte. Dann ist $n + 1$ auch natürlich und größer als $n$.",
      "Widerspruch – also war die Annahme falsch.",
    ],
    falle: "Man nimmt das Gegenteil der Behauptung an, nicht die Behauptung selbst. Wer das Gewünschte annimmt, beweist nichts.",
    syn: "beweis annahme gegenteil",
    wz: "entdecken",
  },
  induktion: {
    bsp: [
      "Behauptung: $2^n > n$ für alle $n \\geq 1$.",
      "Anfang: $2^1 = 2 > 1$.",
      "Schritt: Aus $2^n > n$ folgt $2^{n+1} = 2 \\cdot 2^n > 2n \\geq n + 1$.",
    ],
    falle: "Der Induktionsanfang ist Pflicht: Ohne ihn ließe sich »$n = n + 1$« scheinbar beweisen, denn aus $n = n + 1$ folgt $n + 1 = n + 2$.",
    syn: "beweis induktionsanfang induktionsschritt",
  },
  "gauss-summe": {
    falle: "Die Formel startet bei 1. Für $5 + 6 + \\ldots + 10$ rechnet man $\\frac{10 \\cdot 11}{2} - \\frac{4 \\cdot 5}{2} = 55 - 10 = 45$.",
    syn: "summe 1 bis n gauß",
  },
};
