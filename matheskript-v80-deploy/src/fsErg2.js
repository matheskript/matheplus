/* FORMELSAMMLUNG · ERGÄNZUNGEN 2: Vektoren */
export const ERG_2 = {
  verbindungsvektor: {
    her: [{ t: "Mit Koordinaten", s: [
      "Der Vektor von $A(a_1 | a_2 | a_3)$ nach $B(b_1 | b_2 | b_3)$ sagt, wie weit man in jeder Richtung gehen muss: in $x_1$-Richtung $b_1 - a_1$, in $x_2$-Richtung $b_2 - a_2$, in $x_3$-Richtung $b_3 - a_3$.",
      "Das ist genau die Differenz der Ortsvektoren: Spitze minus Fuß.",
      "Probe: $A + \\vec{AB} = B$, denn $\\vec{a} + (\\vec{b} - \\vec{a}) = \\vec{b}$.",
    ] }],
    nutzt: [["vektoraddition", "Probe durch Addieren"]],
    falle: "Immer »Spitze minus Fuß«: $\\vec{BA} = -\\vec{AB}$.",
  },
  vektoraddition: {
    her: [{ t: "Mit dem Parallelogramm", s: [
      "Zeichnet man $\\vec{a}$ und $\\vec{b}$ vom selben Punkt aus, spannen sie ein Parallelogramm auf. Die Diagonale vom gemeinsamen Anfang aus ist $\\vec{a} + \\vec{b}$.",
      "Es ist gleichgültig, ob man erst $\\vec{a}$ und dann $\\vec{b}$ geht oder umgekehrt – beide Wege enden in derselben Ecke. Deshalb gilt $\\vec{a} + \\vec{b} = \\vec{b} + \\vec{a}$.",
      "Ein Vielfaches $r \\cdot \\vec{a}$ ist der Vektor $r$-mal so lang (bei negativem $r$ in Gegenrichtung).",
    ] }],
    nutzt: [["kommutativ", "Reihenfolge egal"], ["kollinear", "Vielfache sind kollinear"]],
  },
  betrag: {
    her: [{ t: "Als Wurzel des Skalarprodukts", s: [
      "Das Skalarprodukt eines Vektors mit sich selbst liefert das Quadrat seiner Länge:",
      "$$\\vec{a} \\cdot \\vec{a} = a_1^2 + a_2^2 + a_3^2 = |\\vec{a}|^2",
      "Das passt zu $\\cos 0° = 1$ in der Winkelform: $\\vec{a} \\cdot \\vec{a} = |\\vec{a}| \\cdot |\\vec{a}| \\cdot 1$.",
    ] }],
    nutzt: [["skalarprodukt", "a · a = |a|²"]],
  },
  mittelpunkt: {
    her: [{ t: "Mit dem Verbindungsvektor", s: [
      "Der Mittelpunkt liegt auf halbem Weg von $A$ nach $B$: Man geht vom Ortsvektor $\\vec{a}$ den halben Verbindungsvektor.",
      "$$\\vec{m} = \\vec{a} + \\frac{1}{2}\\vec{AB} = \\vec{a} + \\frac{1}{2}(\\vec{b} - \\vec{a}) = \\frac{1}{2}\\vec{a} + \\frac{1}{2}\\vec{b}",
      "Koordinatenweise ist es der Mittelwert der jeweiligen Koordinaten.",
    ] }],
    nutzt: [["verbindungsvektor", "halber Verbindungsvektor"]],
  },
  einheitsvektor: {
    her: [{ t: "Länge nachrechnen", s: [
      "Der Vektor $\\vec{a}_0 = \\frac{1}{|\\vec{a}|}\\vec{a}$ hat dieselbe Richtung wie $\\vec{a}$, weil man nur mit einer positiven Zahl multipliziert.",
      "Seine Länge ist $|\\vec{a}_0| = \\frac{1}{|\\vec{a}|} \\cdot |\\vec{a}| = 1$, denn der Betrag eines Vielfachen ist der Betrag des Faktors mal die Länge.",
      "Beispiel: $\\vec{a} = (3 | 4)$ hat $|\\vec{a}| = 5$, also $\\vec{a}_0 = (0{,}6 | 0{,}8)$ mit Länge $\\sqrt{0{,}36 + 0{,}64} = 1$.",
    ] }],
    nutzt: [["betrag", "Länge des Vektors"]],
  },
  kollinear: {
    her: [{ t: "Mit einem Gleichungssystem", s: [
      "Zwei Vektoren $\\vec{a}$ und $\\vec{b}$ sind kollinear, wenn $\\vec{b} = r \\cdot \\vec{a}$ für ein $r$ gilt – jede Koordinate muss mit demselben $r$ gestreckt sein.",
      "Praktisch: Man berechnet $r$ aus einer Koordinate (mit $a_i \\neq 0$) und prüft die anderen: $r = \\frac{b_1}{a_1} = \\frac{b_2}{a_2} = \\frac{b_3}{a_3}$.",
      "Liefert eine Koordinate ein anderes $r$, sind die Vektoren nicht kollinear.",
    ] }],
    bsp: ["$(2 | -4 | 6)$ und $(-1 | 2 | -3)$: $r = -\\frac{1}{2}$ in allen drei Koordinaten – kollinear."],
    nutzt: [["lineargl", "r aus einer Koordinate"]],
  },
  orthogonal: {
    her: [{ t: "Mit dem Satz des Pythagoras", s: [
      "Stehen $\\vec{a}$ und $\\vec{b}$ senkrecht, bilden sie mit $\\vec{a} - \\vec{b}$ ein rechtwinkliges Dreieck: $|\\vec{a}|^2 + |\\vec{b}|^2 = |\\vec{a} - \\vec{b}|^2$.",
      "$$a_1^2 + a_2^2 + b_1^2 + b_2^2 = (a_1 - b_1)^2 + (a_2 - b_2)^2 = a_1^2 - 2a_1b_1 + b_1^2 + a_2^2 - 2a_2b_2 + b_2^2",
      "Kürzen ergibt $0 = -2(a_1b_1 + a_2b_2)$, also $\\vec{a} \\cdot \\vec{b} = 0$.",
    ] }],
    nutzt: [["pythagoras", "rechtwinkliges Dreieck"], ["binom2", "beim Ausmultiplizieren"]],
  },
  vektorwinkel: {
    her: [{ t: "Mit dem Kosinussatz", s: [
      "Im Dreieck mit den Seiten $|\\vec{a}|$, $|\\vec{b}|$ und $|\\vec{a} - \\vec{b}|$ gilt der Kosinussatz mit dem Winkel $\\varphi$ zwischen $\\vec{a}$ und $\\vec{b}$:",
      "$$|\\vec{a} - \\vec{b}|^2 = |\\vec{a}|^2 + |\\vec{b}|^2 - 2|\\vec{a}||\\vec{b}| \\cos\\varphi",
      "Links ausmultipliziert: $|\\vec{a}|^2 - 2\\,\\vec{a} \\cdot \\vec{b} + |\\vec{b}|^2$. Vergleich beider Seiten:",
      "$$\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\varphi \\;\\Rightarrow\\; \\cos\\varphi = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}||\\vec{b}|}",
    ] }],
    nutzt: [["kosinussatz", "Seiten des Dreiecks"]],
  },
  "gerade-raum": {
    her: [{ t: "Als Weg im Raum", s: [
      "Man steht im Punkt $P$ (Stützvektor $\\vec{p}$) und geht in Richtung $\\vec{u}$. Nach $t$ Schritten steht man bei $\\vec{p} + t\\vec{u}$.",
      "Für $t = 0$ ist man bei $P$, für $t = 1$ bei $P + \\vec{u}$, für negative $t$ geht man rückwärts. Alle diese Punkte zusammen bilden die Gerade.",
      "Die Darstellung ist nicht eindeutig: Jeder andere Punkt der Geraden als Stützpunkt und jedes Vielfache von $\\vec{u}$ als Richtung beschreibt dieselbe Gerade.",
    ] }],
    nutzt: [["vektoraddition", "Stützvektor plus Vielfaches"], ["geradengl", "Verallgemeinerung von y = mx + b"]],
  },
  punktprobe: {
    her: [{ t: "Mit einem Beispiel", s: [
      "$g: \\vec{x} = (1 | 2 | 0) + t(2 | 1 | -1)$, Punkt $Q(5 | 4 | -2)$. Gleichungen: $5 = 1 + 2t$, $4 = 2 + t$, $-2 = -t$.",
      "Aus der ersten folgt $t = 2$. Die zweite ergibt ebenfalls $t = 2$. Die dritte ebenfalls $t = 2$. Alle drei Gleichungen stimmen – $Q$ liegt auf $g$.",
      "Würde nur eine Gleichung ein anderes $t$ liefern, wäre $Q$ nicht auf der Geraden.",
    ] }],
  },
  "ebene-param": {
    her: [{ t: "Zwei Richtungen spannen eine Fläche auf", s: [
      "Von einem Stützpunkt $P$ aus kann man in Richtung $\\vec{u}$ gehen, in Richtung $\\vec{v}$ – und beliebig gemischt: $r$ Schritte in $\\vec{u}$-Richtung und $s$ Schritte in $\\vec{v}$-Richtung.",
      "Alle erreichbaren Punkte $\\vec{p} + r\\vec{u} + s\\vec{v}$ liegen in einer Ebene, wenn $\\vec{u}$ und $\\vec{v}$ nicht kollinear sind. Sonst wäre es nur eine Gerade.",
      "Drei Punkte $A, B, C$ (nicht auf einer Geraden) legen die Ebene fest: Stützpunkt $A$, Richtungen $\\vec{AB}$ und $\\vec{AC}$.",
    ] }],
    nutzt: [["gerade-raum", "zwei Richtungen statt einer"], ["kollinear", "Richtungen dürfen nicht kollinear sein"], ["verbindungsvektor", "Richtungen aus drei Punkten"]],
  },
  "ebene-normal": {
    her: [{ t: "Aus der Parameterform", s: [
      "Jeder Punkt der Ebene hat die Form $\\vec{x} = \\vec{p} + r\\vec{u} + s\\vec{v}$. Der Vektor $\\vec{x} - \\vec{p} = r\\vec{u} + s\\vec{v}$ liegt in der Ebene.",
      "Der Normalenvektor $\\vec{n}$ steht senkrecht auf $\\vec{u}$ und $\\vec{v}$, also auch auf jeder Kombination davon:",
      "$$(\\vec{x} - \\vec{p}) \\cdot \\vec{n} = r(\\vec{u} \\cdot \\vec{n}) + s(\\vec{v} \\cdot \\vec{n}) = 0 + 0 = 0",
    ] }],
    nutzt: [["ebene-param", "Parameterform"], ["kreuzprodukt", "n steht senkrecht auf u und v"], ["orthogonal", "Skalarprodukt 0"]],
  },
  koordform: {
    her: [{ t: "Aus dem Bild: Abstand zum Ursprung", s: [
      "Die Normalenform lautet $\\vec{x} \\cdot \\vec{n} = \\vec{p} \\cdot \\vec{n} = d$. Der Wert $d$ ist für alle Punkte der Ebene gleich – er misst, wie weit die Ebene in Richtung $\\vec{n}$ vom Ursprung entfernt ist (in Einheiten von $|\\vec{n}|$).",
      "Verschiebt man die Ebene senkrecht, ändert sich nur $d$. Alle Ebenen mit demselben $\\vec{n}$ sind zueinander parallel.",
      "Die Koordinatenform erkennt man an den Koeffizienten: Sie sind die Koordinaten des Normalenvektors.",
    ] }],
    nutzt: [["spurpunkte", "Schnitt mit den Achsen"]],
  },
  "param-koord": {
    her: [{ t: "Mit einem Gleichungssystem", s: [
      "Schreibe $x_1 = p_1 + ru_1 + sv_1$, $x_2 = p_2 + ru_2 + sv_2$, $x_3 = p_3 + ru_3 + sv_3$.",
      "Eliminiere $r$ und $s$ mit dem Gauß-Verfahren aus diesen drei Gleichungen. Übrig bleibt eine einzige Gleichung in $x_1, x_2, x_3$ – die Koordinatenform.",
      "Das Kreuzprodukt macht dieselbe Rechnung allgemein: Seine Koordinaten sind genau die Koeffizienten, die nach der Elimination übrig bleiben.",
    ] }],
    nutzt: [["gauss", "r und s eliminieren"], ["kreuzprodukt", "Normalenvektor"]],
  },
  spurpunkte: {
    her: [{ t: "Mit der Achsengleichung", s: [
      "Auf der $x_1$-Achse gilt $x_2 = x_3 = 0$. Die Koordinatenform wird zu $n_1 x_1 = d$, also $x_1 = \\frac{d}{n_1}$.",
      "Ebenso für $S_2$ und $S_3$. Ist ein $n_i = 0$, gibt es keinen Spurpunkt auf dieser Achse – die Ebene verläuft parallel dazu.",
      "Mit den drei Spurpunkten lässt sich die Ebene als Dreieck im Koordinatensystem zeichnen.",
    ] }],
    nutzt: [["koordform", "Achsen einsetzen"], ["lineargl", "n₁x₁ = d lösen"]],
  },
  "schnitt-ge": {
    her: [{ t: "Mit der Normalenform", s: [
      "Setze die Gerade $\\vec{x} = \\vec{p} + t\\vec{u}$ in die Normalenform $(\\vec{x} - \\vec{q}) \\cdot \\vec{n} = 0$ ein:",
      "$$(\\vec{p} - \\vec{q} + t\\vec{u}) \\cdot \\vec{n} = 0 \\;\\Rightarrow\\; t = \\frac{(\\vec{q} - \\vec{p}) \\cdot \\vec{n}}{\\vec{u} \\cdot \\vec{n}}",
      "Ist $\\vec{u} \\cdot \\vec{n} = 0$, steht die Richtung senkrecht auf $\\vec{n}$ – die Gerade ist parallel zur Ebene (oder liegt in ihr).",
    ] }],
    nutzt: [["ebene-normal", "Normalenform"], ["orthogonal", "u · n = 0 bedeutet parallel"]],
  },
  schnittgerade: {
    her: [{ t: "Mit dem Gauß-Verfahren", s: [
      "Die beiden Koordinatenformen bilden ein LGS mit zwei Gleichungen und drei Unbekannten. Es hat (bei nicht parallelen Ebenen) unendlich viele Lösungen.",
      "Setze eine Variable gleich $t$ und löse nach den anderen. Das Ergebnis ist eine Gerade in Parameterform.",
      "Der Richtungsvektor dieser Geraden ist $\\vec{n}_1 \\times \\vec{n}_2$ – ein Kontrollrechnung.",
    ] }],
    nutzt: [["gauss", "LGS mit freier Variable"], ["lgs-loesbar", "unendlich viele Lösungen"]],
  },
  hnf: {
    her: [{ t: "Warum man durch |n| teilt", s: [
      "Die Koordinatenform $\\vec{n} \\cdot \\vec{x} = d$ gilt auch für $2\\vec{n}$ und $2d$ – die Zahl links hängt von der Länge von $\\vec{n}$ ab.",
      "Teilt man durch $|\\vec{n}|$, wird der Normalenvektor ein Einheitsvektor $\\vec{n}_0$. Dann ist $\\vec{n}_0 \\cdot \\vec{x} - d_0$ die Länge der Projektion von $\\vec{x}$ auf $\\vec{n}_0$ minus Abstand der Ebene.",
      "Genau das ist der vorzeichenbehaftete Abstand des Punkts von der Ebene.",
    ] }],
    nutzt: [["einheitsvektor", "n durch seine Länge teilen"], ["betrag", "|n|"]],
  },
  "abstand-ws": {
    her: [{ t: "Als Projektion der Verbindung", s: [
      "Der kürzeste Abstand liegt in Richtung $\\vec{n} = \\vec{u} \\times \\vec{v}$, die senkrecht auf beiden Geraden steht.",
      "Verbindet man beliebige Punkte $P \\in g$ und $Q \\in h$, ist der Abstand die Länge der Projektion von $\\vec{PQ}$ auf $\\vec{n}$:",
      "$$d = \\frac{|\\vec{PQ} \\cdot \\vec{n}|}{|\\vec{n}|}",
      "Denn alle anderen Anteile von $\\vec{PQ}$ liegen in Richtung der Geraden und verändern den Abstand nicht.",
    ] }],
    nutzt: [["skalarprodukt", "Projektion auf n"]],
  },
  spiegelung: {
    her: [{ t: "Mit der Hesseschen Normalform", s: [
      "Der vorzeichenbehaftete Abstand von $Q$ zur Ebene ist $\\delta = \\vec{n}_0 \\cdot \\vec{q} - d_0$.",
      "Der Spiegelpunkt liegt auf der anderen Seite im gleichen Abstand, also zwei Abstände in Richtung $-\\vec{n}_0$ entfernt:",
      "$$\\vec{q}′ = \\vec{q} - 2\\delta \\cdot \\vec{n}_0",
    ] }],
    nutzt: [["hnf", "Abstand mit Vorzeichen"]],
  },
  "winkel-gg": {
    her: [{ t: "Warum der Betrag im Zähler", s: [
      "Zwei Geraden bilden zwei Winkel: $\\varphi$ und $180° - \\varphi$. Gemeint ist der spitze Winkel.",
      "Der Richtungsvektor einer Geraden ist nur bis aufs Vorzeichen festgelegt: $\\vec{u}$ und $-\\vec{u}$ beschreiben dieselbe Gerade. Das Skalarprodukt wechselt dabei das Vorzeichen.",
      "Mit dem Betrag $|\\vec{u} \\cdot \\vec{v}|$ wird der Kosinus nie negativ – man erhält automatisch den spitzen Winkel.",
    ] }],
    nutzt: [["vektorwinkel", "Winkel aus dem Skalarprodukt"], ["lage-geraden", "Geraden müssen sich schneiden"]],
  },
  "winkel-ge": {
    her: [{ t: "Mit dem Normalenvektor", s: [
      "Der Normalenvektor $\\vec{n}$ steht senkrecht auf der Ebene. Der Winkel $\\varphi$ zwischen $\\vec{u}$ und $\\vec{n}$ ergänzt den gesuchten Winkel $\\alpha$ zu 90°.",
      "$$\\alpha = 90° - \\varphi \\;\\Rightarrow\\; \\sin\\alpha = \\cos\\varphi = \\frac{|\\vec{u} \\cdot \\vec{n}|}{|\\vec{u}||\\vec{n}|}",
      "Deshalb steht hier der Sinus – nicht wie bei zwei Geraden der Kosinus.",
    ] }],
    nutzt: [["komplement", "sin(90° − φ) = cos φ"], ["vektorwinkel", "Winkel zwischen u und n"]],
  },
  "winkel-ee": {
    her: [{ t: "Winkel der Normalen", s: [
      "Dreht man eine Ebene um den Winkel $\\alpha$, dreht sich ihr Normalenvektor um denselben Winkel mit. Der Schnittwinkel der Ebenen ist also der Winkel zwischen den Normalenvektoren.",
      "Weil die Normalen nur bis aufs Vorzeichen festliegen, nimmt man den Betrag im Zähler und erhält den spitzen Winkel.",
      "$$\\cos\\alpha = \\frac{|\\vec{n}_1 \\cdot \\vec{n}_2|}{|\\vec{n}_1| \\cdot |\\vec{n}_2|}",
    ] }],
    nutzt: [["vektorwinkel", "Winkel aus dem Skalarprodukt"], ["schnittgerade", "die Ebenen schneiden sich in einer Geraden"]],
  },
  parallelogramm: {
    her: [{ t: "Mit dem Sinus", s: [
      "Die Fläche eines Parallelogramms mit den Seiten $|\\vec{a}|$ und $|\\vec{b}|$ und dem Zwischenwinkel $\\varphi$ ist Grundseite mal Höhe: $|\\vec{a}| \\cdot |\\vec{b}|\\sin\\varphi$.",
      "Die Länge des Kreuzprodukts ist genau dieser Ausdruck: $|\\vec{a} \\times \\vec{b}| = |\\vec{a}||\\vec{b}|\\sin\\varphi$.",
      "Nachrechnen mit der Lagrange-Identität: $|\\vec{a} \\times \\vec{b}|^2 = |\\vec{a}|^2|\\vec{b}|^2 - (\\vec{a} \\cdot \\vec{b})^2 = |\\vec{a}|^2|\\vec{b}|^2(1 - \\cos^2\\varphi)$.",
    ] }],
    nutzt: [["trig-pythagoras", "1 − cos² = sin²"], ["parallelogramm-ebene", "Grundseite mal Höhe"]],
  },
  "dreieck-vek": {
    her: [{ t: "Mit dem Sinus", s: [
      "Die Dreiecksfläche ist $\\frac{1}{2} \\cdot |\\vec{AB}||\\vec{AC}|\\sin\\alpha$ (zwei Seiten und der eingeschlossene Winkel).",
      "$$|\\vec{AB} \\times \\vec{AC}| = |\\vec{AB}||\\vec{AC}|\\sin\\alpha \\;\\Rightarrow\\; A = \\frac{1}{2}|\\vec{AB} \\times \\vec{AC}|",
    ] }],
    nutzt: [["dreieck-trig", "Fläche mit dem Sinus"]],
  },
  spat: {
    her: [{ t: "Mit dem Determinantenbild", s: [
      "Das Skalarprodukt $(\\vec{a} \\times \\vec{b}) \\cdot \\vec{c}$ misst, wie weit $\\vec{c}$ in Richtung der Normalen der Grundfläche zeigt – multipliziert mit der Länge der Normalen, also der Grundfläche.",
      "Wenn $\\vec{c}$ in der Ebene von $\\vec{a}$ und $\\vec{b}$ liegt, steht $\\vec{c}$ senkrecht auf dem Kreuzprodukt: Das Volumen ist 0 – die drei Vektoren sind linear abhängig.",
      "Daraus folgt ein Test: $(\\vec{a} \\times \\vec{b}) \\cdot \\vec{c} = 0$ genau dann, wenn $\\vec{a}$, $\\vec{b}$, $\\vec{c}$ in einer Ebene liegen.",
    ] }],
    nutzt: [["kollinear", "lineare Abhängigkeit"], ["orthogonal", "c senkrecht zum Kreuzprodukt"]],
  },
};
