/* FORMELSAMMLUNG · Neue Mittelstufen-Einträge (jeweils mit Feld bereich)
   Teil 1: Geometrie · Teil 2 (fsMittelNeu2.js): Funktionen, Terme, Gleichungen, Daten
   Aufbau der Einträge: siehe fsAnalysis.js */
import { MITTEL_2 } from "./fsMittelNeu2.js";

const MITTEL_1 = [
  /* ---------------- Ähnlichkeit und Winkel ---------------- */
  {
    bereich: "geometrie", id: "strahlensatz1", g: "Ähnlichkeit und Winkel", n: "1. Strahlensatz", st: "mittel", kl: 9,
    f: "\\frac{\\overline{ZA}}{\\overline{ZA′}} = \\frac{\\overline{ZB}}{\\overline{ZB′}}",
    k: "Abschnitte auf den Strahlen stehen im gleichen Verhältnis, wenn AB ∥ A′B′",
    syn: "strahlensatz strahlen parallelen verhältnis zentrum vierstreckensatz",
    bild: ["strahlensatz", {}],
    her: [
      { t: "Warum gleiche Verhältnisse? – Flächen", s: [
        "Zwei Strahlen gehen von $Z$ aus. Die Parallelen $AB$ und $A′B′$ schneiden sie in $A, A′$ und $B, B′$.",
        "Die Dreiecke $ABA′$ und $ABB′$ haben dieselbe Grundseite $AB$ und – weil $A′B′ \\parallel AB$ – dieselbe Höhe. Also sind ihre Flächen gleich.",
        "Addiert man jeweils das Dreieck $ZAB$, sind auch $ZAB′$ und $ZA′B$ flächengleich.",
        "$$\\frac{A_{ZAB}}{A_{ZA′B}} = \\frac{\\overline{ZA}}{\\overline{ZA′}} || gleiche Höhe von B aus, Grundseiten auf dem ersten Strahl",
        "$$\\frac{A_{ZAB}}{A_{ZAB′}} = \\frac{\\overline{ZB}}{\\overline{ZB′}} || gleiche Höhe von A aus, Grundseiten auf dem zweiten Strahl",
        "Die Nenner sind gleich groß, also sind auch die beiden Verhältnisse gleich – das ist der 1. Strahlensatz.",
      ] },
      { t: "Kurz: ähnliche Dreiecke", s: [
        "Wegen $AB \\parallel A′B′$ sind die Stufenwinkel bei $A$ und $A′$ gleich, ebenso bei $B$ und $B′$. Der Winkel bei $Z$ ist gemeinsam.",
        "Also sind $ZAB$ und $ZA′B′$ ähnlich: Alle Seiten wachsen mit demselben Faktor $k = \\frac{\\overline{ZA′}}{\\overline{ZA}} = \\frac{\\overline{ZB′}}{\\overline{ZB}}$.",
      ] },
    ],
    bsp: [
      "$\\overline{ZA} = 3\\,\\text{cm}$, $\\overline{ZA′} = 7{,}5\\,\\text{cm}$, $\\overline{ZB} = 4\\,\\text{cm}$. Gesucht $\\overline{ZB′}$:",
      "$$\\frac{3}{7{,}5} = \\frac{4}{x} \;\\Rightarrow\; x = \\frac{4 \\cdot 7{,}5}{3} = 10",
      "Also $\\overline{ZB′} = 10\\,\\text{cm}$.",
    ],
    falle: "Der Satz gilt nur, wenn die beiden Geraden wirklich parallel sind – und alle Strecken müssen vom Zentrum $Z$ aus gemessen werden, nicht von $A$ nach $A′$ (dafür braucht man eine eigene Umformung).",
    nutzt: [["aehnlich", "die Dreiecke ZAB und ZA′B′ sind ähnlich"], ["dreieck-flaeche", "Flächenbeweis: gleiche Grundseite und Höhe"]],
  },
  {
    bereich: "geometrie", id: "strahlensatz2", g: "Ähnlichkeit und Winkel", n: "2. Strahlensatz", st: "mittel", kl: 9,
    f: "\\frac{\\overline{AB}}{\\overline{A′B′}} = \\frac{\\overline{ZA}}{\\overline{ZA′}}",
    k: "die Parallelenabschnitte stehen im Verhältnis der Strahlenabschnitte ab Z",
    syn: "strahlensatz parallelen verhältnis zentrum höhe messen schatten",
    bild: ["strahlensatz", {}],
    her: { t: "Eine Hilfsparallele", s: [
      "Zeichne durch $B$ eine Parallele zum ersten Strahl. Sie schneidet $A′B′$ in einem Punkt $D$.",
      "$ABDA′$ ist ein Parallelogramm, also ist $\\overline{A′D} = \\overline{AB}$.",
      "Von $B′$ aus laufen zwei Strahlen: durch $B$ nach $Z$ und durch $D$ nach $A′$. Die Strecken $BD$ und $ZA′$ sind parallel. Der 1. Strahlensatz mit Zentrum $B′$:",
      "$$\\frac{\\overline{B′D}}{\\overline{B′A′}} = \\frac{\\overline{B′B}}{\\overline{B′Z}} || 1. Strahlensatz, Zentrum B′",
      "$$\\frac{\\overline{A′B′} - \\overline{A′D}}{\\overline{A′B′}} = \\frac{\\overline{ZB′} - \\overline{ZB}}{\\overline{ZB′}} \;\\Rightarrow\; \\frac{\\overline{A′D}}{\\overline{A′B′}} = \\frac{\\overline{ZB}}{\\overline{ZB′}} || beide Seiten von 1 abziehen",
      "$$\\frac{\\overline{AB}}{\\overline{A′B′}} = \\frac{\\overline{ZB}}{\\overline{ZB′}} = \\frac{\\overline{ZA}}{\\overline{ZA′}} || A′D = AB, dann 1. Strahlensatz",
    ] },
    bsp: [
      "Ein 1,8 m großer Mensch wirft einen 2,4 m langen Schatten, ein Baum einen 16 m langen Schatten. Die Sonnenstrahlen sind parallel:",
      "$$\\frac{h}{1{,}8} = \\frac{16}{2{,}4} \;\\Rightarrow\; h = 1{,}8 \\cdot \\frac{16}{2{,}4} = 12",
      "Der Baum ist 12 m hoch.",
    ],
    falle: "Beim 2. Strahlensatz müssen die Strahlenabschnitte ab dem Zentrum gemessen werden: $\\frac{\\overline{AB}}{\\overline{A′B′}} = \\frac{\\overline{ZA}}{\\overline{AA′}}$ ist falsch.",
    nutzt: [["strahlensatz1", "Beweis mit einer Hilfsparallelen"], ["parallelogramm-ebene", "gegenüberliegende Seiten sind gleich lang"], ["aehnlich", "Faktor k für alle Seiten"]],
  },
  {
    bereich: "geometrie", id: "zentrische-streckung", g: "Ähnlichkeit und Winkel", n: "Zentrische Streckung", st: "mittel", kl: 9,
    f: "\\overline{ZP′} = |k| \\cdot \\overline{ZP}, \\quad \\text{Längen} \\cdot |k|, \\quad \\text{Flächen} \\cdot k^2",
    k: "vom Zentrum Z aus alles mit Faktor k strecken · Winkel bleiben gleich",
    syn: "streckung vergrößern verkleinern streckfaktor zentrum ähnlich",
    bild: ["streckung", {}],
    her: [
      { t: "Was passiert mit Strecken?", s: [
        "Jeder Punkt $P$ wird auf dem Strahl $ZP$ so verschoben, dass $\\overline{ZP′} = k \\cdot \\overline{ZP}$ ist (für $k > 0$).",
        "Für zwei Punkte $P, Q$ gilt $\\frac{\\overline{ZP′}}{\\overline{ZP}} = \\frac{\\overline{ZQ′}}{\\overline{ZQ}} = k$. Nach der Umkehrung des 1. Strahlensatzes ist $P′Q′ \\parallel PQ$.",
        "Der 2. Strahlensatz liefert dann $\\overline{P′Q′} = k \\cdot \\overline{PQ}$: jede Strecke wird mit $k$ multipliziert.",
        "Parallele Seiten bedeuten gleiche Winkel – die Bildfigur ist ähnlich zur Originalfigur.",
      ] },
      { t: "Warum k² bei Flächen?", s: [
        "Ein Rechteck $a \\times b$ wird zum Rechteck $ka \\times kb$:",
        "$$ka \\cdot kb = k^2 \\cdot ab",
        "Jede Fläche lässt sich in kleine Rechtecke zerlegen – also wächst jede Fläche mit $k^2$, jedes Volumen entsprechend mit $k^3$.",
      ] },
    ],
    bsp: [
      "Ein Dreieck mit Umfang 12 cm und Fläche 6 cm² wird mit $k = 2{,}5$ gestreckt:",
      "$$U′ = 2{,}5 \\cdot 12 = 30\\,\\text{cm}, \\quad A′ = 2{,}5^2 \\cdot 6 = 37{,}5\\,\\text{cm}^2",
    ],
    falle: "Die Fläche wächst nicht mit $k$, sondern mit $k^2$: Doppelt so lange Seiten ergeben die vierfache Fläche, nicht die doppelte.",
    nutzt: [["strahlensatz2", "Bildstrecken sind k-mal so lang"], ["aehnlich", "Bild und Original sind ähnlich"], ["rechteck", "Fläche ka · kb = k² · ab"]],
  },
  /* ---------------- Rechtwinkliges Dreieck ---------------- */
  {
    bereich: "geometrie", id: "kathetensatz", g: "Rechtwinkliges Dreieck", n: "Kathetensatz des Euklid", st: "mittel", kl: 9,
    f: "a^2 = c \\cdot p, \\quad b^2 = c \\cdot q",
    k: "Kathetenquadrat = Rechteck aus Hypotenuse und anliegendem Abschnitt",
    syn: "kathetensatz euklid hypotenusenabschnitt rechtwinklig quadrat rechteck",
    bild: ["kathetensatz", {}],
    her: [
      { t: "Ähnliche Dreiecke", s: [
        "Die Höhe $h$ auf $c$ teilt die Hypotenuse in $p$ (an $a$) und $q$ (an $b$).",
        "Das große Dreieck $ABC$ und das Teildreieck an der Kathete $a$ haben beide einen rechten Winkel und den Winkel $\\beta$ gemeinsam – sie sind ähnlich.",
        "Im großen Dreieck: Hypotenuse $c$, an $\\beta$ anliegende Kathete $a$. Im Teildreieck: Hypotenuse $a$, an $\\beta$ anliegende Kathete $p$.",
        "$$\\frac{a}{c} = \\frac{p}{a} || gleiches Seitenverhältnis",
        "$$a^2 = c \\cdot p || mal a · c",
      ] },
      { t: "Daraus folgt Pythagoras", s: [
        "Beide Kathetensätze addiert:",
        "$$a^2 + b^2 = c \\cdot p + c \\cdot q = c \\cdot (p + q) || ausklammern",
        "$$a^2 + b^2 = c^2 || p + q = c",
      ] },
    ],
    bsp: [
      "Hypotenuse $c = 10$, Abschnitt $p = 3{,}6$. Gesucht Kathete $a$:",
      "$$a^2 = 10 \\cdot 3{,}6 = 36 \;\\Rightarrow\; a = 6",
      "Mit $q = 6{,}4$ ergibt sich ebenso $b^2 = 64$, also $b = 8$ – und tatsächlich $6^2 + 8^2 = 10^2$.",
    ],
    falle: "$p$ gehört zur Kathete $a$, an der er anliegt, nicht zur gegenüberliegenden: $a^2 = c \\cdot q$ ist falsch.",
    nutzt: [["aehnlich", "das Teildreieck ist ähnlich zum ganzen Dreieck"], ["hoehensatz", "dieselbe Figur, dazu der Höhensatz"], ["pythagoras", "beide Kathetensätze addiert ergeben Pythagoras"]],
  },
  {
    bereich: "geometrie", id: "pythagoras-umkehr", g: "Rechtwinkliges Dreieck", n: "Umkehrung des Satzes von Pythagoras", st: "mittel", kl: 9,
    f: "a^2 + b^2 = c^2 \;\\Rightarrow\; \\gamma = 90°",
    k: "mit drei Längen prüfen, ob ein Dreieck rechtwinklig ist",
    syn: "umkehrung pythagoras rechter winkel prüfen pythagoreisches tripel seil",
    bild: ["pythagoras", {}],
    her: { t: "Ein Vergleichsdreieck und SSS", s: [
      "Gegeben ist ein Dreieck mit Seiten $a, b, c$ und $a^2 + b^2 = c^2$. Wir wissen noch nicht, ob $\\gamma = 90°$ ist.",
      "Konstruiere ein zweites Dreieck mit Katheten $a$ und $b$ und einem rechten Winkel dazwischen. Seine Hypotenuse heiße $d$.",
      "$$d^2 = a^2 + b^2 = c^2 || Pythagoras im Vergleichsdreieck",
      "Also ist $d = c$. Beide Dreiecke stimmen in allen drei Seiten überein – nach dem Kongruenzsatz SSS sind sie deckungsgleich.",
      "Deckungsgleiche Dreiecke haben gleiche Winkel: Auch im ersten Dreieck ist $\\gamma = 90°$.",
    ] },
    bsp: [
      "Ist das Dreieck mit den Seiten 20, 21 und 29 rechtwinklig?",
      "$$20^2 + 21^2 = 400 + 441 = 841 = 29^2",
      "Ja – der rechte Winkel liegt gegenüber der längsten Seite 29.",
    ],
    falle: "Man muss die längste Seite als $c$ nehmen: Bei 5, 12, 13 prüft man $5^2 + 12^2 = 13^2$, nicht $5^2 + 13^2 = 12^2$.",
    nutzt: [["pythagoras", "im Vergleichsdreieck angewandt"], ["kongruenz", "SSS: gleiche Seiten ⇒ gleiche Winkel"]],
  },
  /* ---------------- Körper ---------------- */
  {
    bereich: "geometrie", id: "raumdiagonale", g: "Körper", n: "Raumdiagonale im Quader", st: "mittel", kl: 9,
    f: "d = \\sqrt{a^2 + b^2 + c^2}, \\quad d_{\\text{Würfel}} = a\\sqrt{3}",
    k: "zweimal Pythagoras: erst über den Boden, dann nach oben",
    syn: "raumdiagonale quader würfel diagonale raum kiste",
    bild: ["raumdiagonale", {}],
    her: { t: "Zweimal Pythagoras", s: [
      "Die Bodendiagonale $e$ des Rechtecks $a \\times b$:",
      "$$e^2 = a^2 + b^2 || Pythagoras in der Grundfläche",
      "Die Raumdiagonale $d$ ist die Hypotenuse des Dreiecks aus $e$ und der senkrechten Kante $c$ – dort ist ein rechter Winkel, weil $c$ senkrecht auf dem Boden steht.",
      "$$d^2 = e^2 + c^2 = a^2 + b^2 + c^2 || Pythagoras im senkrechten Schnitt",
      "Beim Würfel ist $a = b = c$: $d = \\sqrt{3a^2} = a\\sqrt{3}$.",
    ] },
    bsp: [
      "Passt ein 1,10 m langer Stab in eine Kiste mit $80\\,\\text{cm} \\times 50\\,\\text{cm} \\times 60\\,\\text{cm}$?",
      "$$d = \\sqrt{80^2 + 50^2 + 60^2} = \\sqrt{10\\,500} \\approx 102{,}5\\,\\text{cm}",
      "Nein – auch schräg passen nur gut 1,02 m hinein.",
    ],
    falle: "Die Raumdiagonale ist nicht $\\sqrt{a^2 + b^2} + c$: Man muss die Quadrate addieren und erst am Ende die Wurzel ziehen.",
    nutzt: [["pythagoras", "zweimal angewandt"], ["quader", "Kanten a, b, c"], ["betrag", "dieselbe Rechnung: Länge eines Vektors"]],
  },
  {
    bereich: "geometrie", id: "prisma", g: "Körper", n: "Oberfläche des Prismas", st: "mittel", kl: 8,
    f: "O = 2G + M, \\quad M = u \\cdot h",
    k: "zwei Grundflächen plus Mantel · der Mantel ist ein Rechteck aus Umfang mal Höhe",
    syn: "prisma oberfläche mantel netz grundfläche dreiecksprisma",
    bild: ["koerper", { art: "zylinder" }],
    her: { t: "Das Netz aufklappen", s: [
      "Ein gerades Prisma hat oben und unten dieselbe Grundfläche $G$. Die Seitenflächen sind Rechtecke mit der Höhe $h$.",
      "Klappt man die Seitenflächen nebeneinander auf, liegen ihre Breiten hintereinander – zusammen genau der Umfang $u$ der Grundfläche.",
      "$$M = s_1 h + s_2 h + \\ldots = (s_1 + s_2 + \\ldots) \\cdot h = u \\cdot h || ausklammern",
      "$$O = 2G + u \\cdot h || zwei Deckel und der Mantel",
      "Beim Zylinder ist $u = 2\\pi r$ – deshalb $O = 2\\pi r^2 + 2\\pi r h$.",
    ] },
    bsp: [
      "Dreiecksprisma: Grundfläche rechtwinklig mit Seiten 3, 4, 5 cm, Höhe 10 cm.",
      "$$G = \\frac{3 \\cdot 4}{2} = 6, \\quad u = 3 + 4 + 5 = 12",
      "$$O = 2 \\cdot 6 + 12 \\cdot 10 = 132\\,\\text{cm}^2",
    ],
    falle: "Die Grundfläche zählt doppelt – Deckel und Boden. $O = G + u \\cdot h$ ist zu wenig.",
    nutzt: [["zylinder", "Volumen G · h und der Zylinder als Sonderfall"], ["distributiv", "Mantel ausklammern: u · h"], ["dreieck-flaeche", "Grundfläche bei Dreiecksprismen"]],
  },
  {
    bereich: "geometrie", id: "zusammengesetzte-koerper", g: "Körper", n: "Zusammengesetzte Körper", st: "mittel", kl: 10,
    f: "V = V_1 + V_2 \\quad \\text{oder} \\quad V = V_{\\text{groß}} - V_{\\text{Loch}}",
    k: "in bekannte Körper zerlegen oder zu einem bekannten Körper ergänzen",
    syn: "zusammengesetzt körper zerlegen ergänzen silo haus loch rohr",
    bild: ["koerper", { art: "kegel" }],
    her: { t: "Volumen ist additiv", s: [
      "Das Volumen zählt, wie viele Einheitswürfel hineinpassen. Zerlegt man einen Körper in Teile, die sich nicht überlappen, füllt jeder Würfel genau ein Teil.",
      "$$V = V_1 + V_2 + \\ldots || Zerlegen",
      "Fehlt ein Stück (Bohrung, Aussparung), rechnet man den vollen Körper und zieht das Fehlende ab:",
      "$$V = V_{\\text{groß}} - V_{\\text{Loch}} || Ergänzen",
      "Bei der Oberfläche Vorsicht: Klebeflächen zwischen den Teilen liegen innen und zählen nicht mit.",
    ] },
    bsp: [
      "Silo: Zylinder ($r = 2\\,\\text{m}$, $h = 6\\,\\text{m}$) mit Kegeldach ($h_K = 1{,}5\\,\\text{m}$).",
      "$$V = \\pi \\cdot 2^2 \\cdot 6 + \\frac{1}{3} \\pi \\cdot 2^2 \\cdot 1{,}5 = 24\\pi + 2\\pi = 26\\pi \\approx 81{,}7\\,\\text{m}^3",
    ],
    falle: "Bei der Oberfläche darf man die Teiloberflächen nicht einfach addieren: Die Grundfläche des Kegels liegt im Inneren des Silos und gehört nicht zur Oberfläche.",
    nutzt: [["zylinder", "häufiges Teilstück"], ["kegel", "Dach oder Spitze"], ["zusammengesetzt", "dieselbe Idee wie bei Flächen"]],
  },
  /* ---------------- Flächen ---------------- */
  {
    bereich: "geometrie", id: "kreisring", g: "Flächen", n: "Kreisring", st: "mittel", kl: 9,
    f: "A = \\pi (R^2 - r^2) = \\pi (R + r)(R - r)",
    k: "großer Kreis minus kleiner Kreis",
    syn: "kreisring ring rohr querschnitt scheibe loch",
    bild: ["kreis", { modus: "flaeche" }],
    her: { t: "Groß minus klein", s: [
      "Ein Kreisring ist ein Kreis mit Radius $R$, aus dem ein Kreis mit Radius $r$ (gleicher Mittelpunkt) herausgeschnitten ist.",
      "$$A = \\pi R^2 - \\pi r^2 || Fläche minus Loch",
      "$$A = \\pi (R^2 - r^2) || π ausklammern",
      "$$A = \\pi (R + r)(R - r) || dritte binomische Formel",
      "Schön zu sehen: $R - r$ ist die Ringbreite, $\\pi (R + r)$ der Umfang des Kreises genau in der Mitte des Rings. Fläche = Mittellinie mal Breite.",
    ] },
    bsp: [
      "Rohr mit Außendurchmesser 10 cm und Wandstärke 1 cm: $R = 5$, $r = 4$.",
      "$$A = \\pi (5 + 4)(5 - 4) = 9\\pi \\approx 28{,}3\\,\\text{cm}^2",
    ],
    falle: "Nicht die Radien abziehen und dann quadrieren: $\\pi (R - r)^2$ ist die Fläche eines kleinen Kreises, nicht des Rings.",
    nutzt: [["kreisflaeche", "zweimal πr²"], ["binom3", "R² − r² = (R + r)(R − r)"]],
  },
  {
    bereich: "geometrie", id: "vierecke", g: "Flächen", n: "Haus der Vierecke", st: "mittel", kl: 8,
    f: "\\text{Quadrat} \\subset \\text{Rechteck} \\subset \\text{Parallelogramm} \\subset \\text{Trapez}",
    k: "jedes Viereck erbt die Eigenschaften der Vierecke über ihm · Quadrat ist auch Raute, Raute auch Drachen",
    syn: "vierecke haus der vierecke quadrat rechteck raute drachen trapez parallelogramm",
    bild: ["vierecke", {}],
    her: { t: "Eigenschaften werden vererbt", s: [
      "Trapez: ein Paar paralleler Seiten. Parallelogramm: zwei Paare – also ist jedes Parallelogramm ein Trapez.",
      "Rechteck: Parallelogramm mit rechtem Winkel. Raute: Parallelogramm mit vier gleich langen Seiten.",
      "Drachen: zwei Paare gleich langer Nachbarseiten, Diagonalen senkrecht. Jede Raute ist ein Drachen.",
      "Quadrat: sowohl Rechteck als auch Raute – es hat alle Eigenschaften: gleiche Seiten, rechte Winkel, gleich lange und senkrechte Diagonalen.",
      "Wer eine Formel für ein Viereck oben im Haus kennt, darf sie für alle darunter benutzen: $A = g \\cdot h$ gilt also auch für Rechteck, Raute und Quadrat.",
    ] },
    bsp: [
      "Ist ein Rechteck ein Trapez? Ja – es hat sogar zwei Paare paralleler Seiten.",
      "Ist jede Raute ein Quadrat? Nein – eine Raute muss keine rechten Winkel haben.",
    ],
    falle: "Die Richtung zählt: Jedes Quadrat ist ein Rechteck, aber nicht jedes Rechteck ist ein Quadrat.",
    nutzt: [["parallelogramm-ebene", "Flächenformel für alle Parallelogramme"], ["trapez", "das allgemeinste Viereck mit Parallelen"], ["teilmenge", "das Haus ist eine Kette von Teilmengen"], ["winkelsumme-viereck", "in jedem Viereck des Hauses ergeben die Innenwinkel 360°"]],
  },
  {
    bereich: "geometrie", id: "drachen-raute", g: "Flächen", n: "Drachen und Raute", st: "mittel", kl: 8,
    f: "A = \\frac{e \\cdot f}{2}",
    k: "halbes Produkt der Diagonalen · gilt für jedes Viereck mit senkrechten Diagonalen",
    syn: "drachen drachenviereck raute rhombus diagonalen fläche",
    bild: ["vierecke", {}],
    her: [
      { t: "Ein halbes Rechteck", s: [
        "Die Diagonalen $e$ und $f$ stehen beim Drachen (und bei der Raute) senkrecht aufeinander.",
        "Zeichne um das Viereck das Rechteck mit den Seiten $e$ und $f$, dessen Seiten parallel zu den Diagonalen sind.",
        "Die Diagonalen zerlegen das Rechteck in vier kleine Rechtecke. Jede Seite des Vierecks halbiert eines davon.",
        "$$A = \\frac{1}{2} \\cdot e \\cdot f || das Viereck ist genau die Hälfte",
      ] },
      { t: "Zwei Dreiecke", s: [
        "Die Diagonale $e$ teilt den Drachen in zwei Dreiecke mit Grundseite $e$. Ihre Höhen $h_1$ und $h_2$ liegen auf $f$ und ergeben zusammen $f$.",
        "$$A = \\frac{e \\cdot h_1}{2} + \\frac{e \\cdot h_2}{2} = \\frac{e \\cdot (h_1 + h_2)}{2} = \\frac{e \\cdot f}{2}",
      ] },
    ],
    bsp: [
      "Ein Drachen mit Diagonalen 60 cm und 40 cm:",
      "$$A = \\frac{60 \\cdot 40}{2} = 1200\\,\\text{cm}^2",
    ],
    falle: "Die Formel braucht senkrechte Diagonalen. Bei einem Parallelogramm, das keine Raute ist, gilt $A = \\frac{e \\cdot f}{2}$ nicht.",
    nutzt: [["rechteck", "halbes umschreibendes Rechteck"], ["dreieck-flaeche", "zwei Dreiecke über einer Diagonalen"], ["vierecke", "Raute und Drachen im Haus der Vierecke"]],
  },
];

export const FS_MITTEL_NEU = [...MITTEL_1, ...MITTEL_2];
