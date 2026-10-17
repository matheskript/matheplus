/* FORMELSAMMLUNG · ZUORDNUNGEN (Unterstufe, Klasse 7) – Bereich funktionen
   Aufbau der Einträge: siehe fsAnalysis.js */

export const FS_UNTER_ZUORDNUNGEN = [
  {
    id: "zuordnung-tabelle", g: "Zuordnungen", n: "Zuordnung, Tabelle und Graph", st: "unter-mittel", kl: 7,
    f: "x \\mapsto y",
    k: "Jedem Wert x wird ein Wert y zugeordnet – als Tabelle, als Graph oder als Rechenvorschrift",
    syn: "zuordnung wertetabelle tabelle graph schaubild zuordnungsvorschrift",
    bild: ["dreisatzTabelle", { modus: "proportional" }],
    her: [
      { t: "Was ist eine Zuordnung?", s: [
        "Beim Einkaufen gehört zu jeder Menge Äpfel ein Preis. Man schreibt: Menge $\\mapsto$ Preis.",
        "Der Pfeil $\\mapsto$ liest sich »wird zugeordnet«. Links steht die Ausgangsgröße $x$, rechts die zugeordnete Größe $y$.",
        "Eine Tabelle sammelt Paare: in der oberen Zeile die $x$-Werte, in der unteren die zugehörigen $y$-Werte.",
        "Jedes Paar $(x \\,|\\, y)$ ist ein Punkt im Koordinatensystem. Alle Punkte zusammen bilden den Graphen.",
      ] },
      { t: "Drei Darstellungen, eine Zuordnung", s: [
        "Tabelle: gut zum Ablesen einzelner Werte.",
        "Graph: zeigt auf einen Blick, ob $y$ steigt oder fällt.",
        "Rechenvorschrift wie $y = 2{,}5 \\cdot x$: liefert jeden Wert, auch solche, die nicht in der Tabelle stehen.",
      ] },
    ],
    bsp: [
      "1 kg Äpfel kostet 2,50 €. Tabelle für 1, 2, 3, 4 kg:",
      "$$1 \\mapsto 2{,}50\\,€, \\quad 2 \\mapsto 5{,}00\\,€, \\quad 3 \\mapsto 7{,}50\\,€, \\quad 4 \\mapsto 10{,}00\\,€",
      "Die Punkte $(1 \\,|\\, 2{,}5)$, $(2 \\,|\\, 5)$, $(3 \\,|\\, 7{,}5)$ liegen auf einer Geraden durch den Ursprung.",
    ],
    falle: "Die Achsen verwechseln: $x$ (Ausgangsgröße) gehört nach rechts, $y$ (zugeordnete Größe) nach oben. Der Punkt $(2 \\,|\\, 5)$ liegt 2 nach rechts und 5 nach oben – nicht umgekehrt.",
    nutzt: [["koordinaten", "jedes Wertepaar ist ein Punkt im Koordinatensystem"]],
    wz: "geradengleichung",
  },
  {
    id: "proportional", g: "Zuordnungen", n: "Proportionale Zuordnung", st: "unter-mittel", kl: 7,
    f: "y = k \\cdot x, \\quad \\frac{y}{x} = k \\text{ konstant}",
    k: "Doppelt so viel x – doppelt so viel y · Graph: Gerade durch den Ursprung",
    syn: "proportional je mehr desto mehr quotientengleich proportionalitätsfaktor",
    bild: ["funktionsGraph", { art: "proportional" }],
    her: [
      { t: "Warum ist der Quotient immer gleich?", s: [
        "Proportional heißt: Verdoppelt man $x$, verdoppelt sich $y$; verdreifacht man $x$, verdreifacht sich $y$.",
        "Zu $x = 1$ gehört ein fester Wert $k$. Dann gehört zu $x = 2$ der Wert $2k$, zu $x = 3$ der Wert $3k$, allgemein:",
        "$$y = k \\cdot x || das x-Fache von k",
        "Teilt man beide Seiten durch $x$ (für $x \\neq 0$), bleibt in jeder Spalte der Tabelle derselbe Quotient:",
        "$$\\frac{y}{x} = k || Proportionalitätsfaktor",
      ] },
      { t: "Warum eine Gerade durch den Ursprung?", s: [
        "Zu $x = 0$ gehört $y = k \\cdot 0 = 0$ – der Graph geht durch $(0 \\,|\\, 0)$.",
        "Geht man 1 nach rechts, steigt $y$ immer um genau $k$. Gleichmäßiges Steigen ergibt eine Gerade mit Steigung $k$.",
      ] },
    ],
    bsp: [
      "3 Hefte kosten 4,50 €. Quotient:",
      "$$k = \\frac{4{,}50\\,€}{3} = 1{,}50\\,€ \\text{ pro Heft}",
      "Also kosten 7 Hefte $7 \\cdot 1{,}50\\,€ = 10{,}50\\,€$.",
    ],
    falle: "»Je mehr, desto mehr« reicht nicht: Taxi mit Grundgebühr, $y = 2x + 4$, wächst auch – ist aber nicht proportional, denn $\\frac{6}{1} \\neq \\frac{8}{2}$.",
    nutzt: [["zuordnung-tabelle", "Sonderfall einer Zuordnung"], ["kommutativ", "k · x = x · k"]],
    wz: "geradengleichung",
  },
  {
    id: "antiproportional", g: "Zuordnungen", n: "Antiproportionale Zuordnung", st: "unter-mittel", kl: 7,
    f: "x \\cdot y = c \\text{ konstant}, \\quad y = \\frac{c}{x}",
    k: "Doppelt so viel x – halb so viel y · Graph: Hyperbel",
    syn: "antiproportional umgekehrt proportional je mehr desto weniger produktgleich",
    bild: ["hyperbel", {}],
    her: [
      { t: "Warum ist das Produkt immer gleich?", s: [
        "Eine Arbeit dauert mit 1 Person 12 Stunden. Mit 2 Personen halbiert sich die Zeit, mit 3 Personen drittelt sie sich.",
        "Antiproportional heißt: Wird $x$ $n$-mal so groß, wird $y$ $n$-mal so klein.",
        "Dann bleibt das Produkt gleich: $(n \\cdot x) \\cdot \\frac{y}{n} = x \\cdot y$.",
        "$$x \\cdot y = c || Produktgleichheit",
        "$$y = \\frac{c}{x} || nach y aufgelöst, x ≠ 0",
      ] },
      { t: "Rechtecke mit gleicher Fläche", s: [
        "Jedes Wertepaar $(x \\,|\\, y)$ ist ein Rechteck mit den Seiten $x$ und $y$ und der Fläche $x \\cdot y = c$.",
        "Alle diese Rechtecke sind gleich groß. Ihre Ecken liegen auf einer gebogenen Kurve, der Hyperbel – keine Gerade.",
      ] },
    ],
    bsp: [
      "4 Pumpen leeren ein Becken in 6 Stunden. Wie lange brauchen 3 Pumpen?",
      "$$c = 4 \\cdot 6 = 24 \\text{ Pumpenstunden}",
      "$$y = \\frac{24}{3} = 8 \\text{ Stunden}",
    ],
    falle: "»Je mehr, desto weniger« reicht nicht: Bei $y = 10 - x$ wird $y$ auch kleiner, aber $1 \\cdot 9 \\neq 2 \\cdot 8$ – nicht antiproportional.",
    nutzt: [["zuordnung-tabelle", "Sonderfall einer Zuordnung"], ["rechteck", "x · y ist die Fläche eines Rechtecks"]],
    wz: "kopf",
  },
  {
    id: "dreisatz", g: "Zuordnungen", n: "Dreisatz", st: "unter-mittel", kl: 7,
    f: "3\\,\\text{kg} \\to 7{,}50\\,€ \\;\\Rightarrow\\; 1\\,\\text{kg} \\to 2{,}50\\,€ \\;\\Rightarrow\\; 5\\,\\text{kg} \\to 12{,}50\\,€",
    k: "In drei Sätzen über die Einheit zum gesuchten Wert",
    syn: "dreisatz schluss über die einheit verhältnis rechnen",
    bild: ["dreisatzTabelle", { modus: "proportional" }],
    her: [
      { t: "Warum über die Eins?", s: [
        "Satz 1 – was man weiß: 3 kg kosten 7,50 €.",
        "Satz 2 – auf die Einheit: Bei proportionalen Zuordnungen teilt man beide Seiten durch dieselbe Zahl. 1 kg kostet $7{,}50\\,€ : 3 = 2{,}50\\,€$.",
        "Satz 3 – auf das Gesuchte: Man multipliziert beide Seiten mit derselben Zahl. 5 kg kosten $5 \\cdot 2{,}50\\,€ = 12{,}50\\,€$.",
        "Das ist erlaubt, weil der Quotient $\\frac{y}{x}$ bei proportionalen Zuordnungen konstant ist.",
      ] },
      { t: "Antiproportionaler Dreisatz", s: [
        "Bei antiproportionalen Zuordnungen bleibt das Produkt gleich. Deshalb rechnet man in der zweiten Spalte umgekehrt:",
        "4 Pumpen → 6 h. 1 Pumpe → $6 \\cdot 4 = 24$ h (eine Pumpe braucht länger). 3 Pumpen → $24 : 3 = 8$ h.",
        "Merksatz: Was man links teilt, multipliziert man rechts – und umgekehrt.",
      ] },
    ],
    bsp: [
      "5 Liter Saft kosten 6,50 €. Was kosten 8 Liter?",
      "$$1\\,\\text{l} \\to 6{,}50\\,€ : 5 = 1{,}30\\,€",
      "$$8\\,\\text{l} \\to 8 \\cdot 1{,}30\\,€ = 10{,}40\\,€",
    ],
    falle: "Erst prüfen, ob die Zuordnung proportional ist! Wenn 1 Maler 10 Tage braucht, brauchen 2 Maler nicht 20 Tage, sondern 5 Tage – das ist antiproportional.",
    nutzt: [["proportional", "über die Einheit rechnen nutzt den konstanten Quotienten"], ["antiproportional", "umgekehrter Dreisatz nutzt das konstante Produkt"]],
    wz: "kopf",
  },
];
