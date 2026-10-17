/* FORMELSAMMLUNG · DATEN (Unterstufe, Klasse 5–7) – Bereich stochastik
   Aufbau der Einträge: siehe fsAnalysis.js */

export const FS_UNTER_DATEN = [
  {
    id: "arith-mittel", g: "Daten", n: "Arithmetisches Mittel", st: "unter-mittel", kl: 6,
    f: "\\overline{x} = \\frac{x_1 + x_2 + \\ldots + x_n}{n}",
    k: "Durchschnitt: alle Werte addieren, durch ihre Anzahl teilen",
    syn: "mittelwert durchschnitt arithmetisches mittel schnitt",
    bild: ["saeulen", { zeige: "mittel" }],
    her: [
      { t: "Gerecht verteilen", s: [
        "Vier Kinder haben 3, 5, 6 und 10 Bonbons. Sie legen alle zusammen: $3 + 5 + 6 + 10 = 24$.",
        "Dann verteilen sie gerecht: $24 : 4 = 6$. Jedes Kind hat jetzt 6 – das ist der Mittelwert.",
        "Allgemein: Summe aller Werte durch Anzahl der Werte.",
        "$$\\overline{x} = \\frac{x_1 + x_2 + \\ldots + x_n}{n}",
      ] },
      { t: "Ausgleichen im Säulendiagramm", s: [
        "Hohe Säulen geben etwas ab, niedrige bekommen etwas dazu, bis alle gleich hoch sind.",
        "Weil dabei nichts verloren geht, bleibt die Summe gleich: $n \\cdot \\overline{x} = x_1 + \\ldots + x_n$.",
        "Folge: Die Abweichungen nach oben und unten gleichen sich genau aus – ihre Summe ist 0.",
      ] },
    ],
    bsp: [
      "Noten 2, 3, 1, 4, 2:",
      "$$\\overline{x} = \\frac{2 + 3 + 1 + 4 + 2}{5} = \\frac{12}{5} = 2{,}4",
    ],
    falle: "Ein einzelner Ausreißer verschiebt das Mittel stark: Bei 2, 3, 3, 4, 38 ist $\\overline{x} = 10$, obwohl fast alle Werte unter 5 liegen. Dann besser den Median angeben.",
    nutzt: [["bruch-def", "Teilen durch n verteilt gerecht"]],
  },
  {
    id: "median", g: "Daten", n: "Median (Zentralwert)", st: "unter-mittel", kl: 6,
    f: "\\text{Werte ordnen} \\;\\Rightarrow\\; \\text{mittlerer Wert}",
    k: "Der Wert in der Mitte der geordneten Liste · bei gerader Anzahl Mittel der beiden mittleren",
    syn: "median zentralwert mitte mittlerer wert",
    bild: ["saeulen", { zeige: "median" }],
    her: [
      { t: "Die Mitte der Reihe", s: [
        "Man ordnet alle Werte der Größe nach. Der Median steht genau in der Mitte: Höchstens die Hälfte der Werte liegt darunter, höchstens die Hälfte darüber.",
        "Bei ungerader Anzahl $n$ ist das der Wert an der Stelle $\\frac{n + 1}{2}$.",
        "Bei gerader Anzahl gibt es zwei mittlere Werte; man nimmt ihr arithmetisches Mittel.",
      ] },
      { t: "Warum robust gegen Ausreißer?", s: [
        "Macht man den größten Wert noch größer, bleibt die Reihenfolge in der Mitte gleich.",
        "Bei 2, 3, 3, 4, 38 ist der Median 3 – der Ausreißer 38 ändert daran nichts.",
        "Das arithmetische Mittel wäre dagegen 10.",
      ] },
    ],
    bsp: [
      "Werte 7, 2, 9, 4, 5, 8 – geordnet: 2, 4, 5, 7, 8, 9.",
      "Sechs Werte, die mittleren sind 5 und 7:",
      "$$\\text{Median} = \\frac{5 + 7}{2} = 6",
    ],
    falle: "Vorher ordnen! Bei 7, 2, 9 ist der Median 7, nicht der »mittlere« Wert 2 der ungeordneten Liste.",
    nutzt: [["arith-mittel", "bei gerader Anzahl Mittel der beiden mittleren Werte"]],
  },
  {
    id: "modus", g: "Daten", n: "Modus (häufigster Wert)", st: "unter-mittel", kl: 6,
    f: "\\text{Modus} = \\text{Wert mit der größten Häufigkeit}",
    k: "Der Wert, der am häufigsten vorkommt · auch für Kategorien wie Lieblingsfarben",
    syn: "modus modalwert häufigster wert am häufigsten",
    bild: ["saeulen", { zeige: "modus" }],
    her: [
      { t: "Die höchste Säule", s: [
        "Man zählt, wie oft jeder Wert vorkommt (absolute Häufigkeit).",
        "Im Säulendiagramm ist der Modus der Wert unter der höchsten Säule.",
        "Kommen zwei Werte gleich oft am häufigsten vor, gibt es zwei Modalwerte.",
      ] },
      { t: "Wann nur der Modus geht", s: [
        "Bei Lieblingsfarben (rot, blau, grün) kann man weder addieren noch ordnen – Mittelwert und Median gibt es nicht.",
        "Den häufigsten Wert gibt es aber immer.",
        "Deshalb ist der Modus der einzige Kennwert für Merkmale ohne Zahlen.",
      ] },
    ],
    bsp: [
      "Schuhgrößen: 38, 39, 39, 40, 39, 41, 38.",
      "Häufigkeiten: 38 → 2, 39 → 3, 40 → 1, 41 → 1. Modus: 39.",
    ],
    falle: "Der Modus ist der Wert, nicht seine Häufigkeit: Bei den Schuhgrößen oben ist der Modus 39, nicht 3.",
    nutzt: [["relhaeuf", "Häufigkeiten zählen und vergleichen"], ["median", "neben Mittelwert und Median der dritte Lagewert"]],
  },
  {
    id: "spannweite", g: "Daten", n: "Spannweite", st: "unter-mittel", kl: 6,
    f: "R = x_{max} - x_{min}",
    k: "Abstand zwischen größtem und kleinstem Wert · einfaches Maß für die Streuung",
    syn: "spannweite streuung größter kleinster wert unterschied",
    bild: ["saeulen", { zeige: "spannweite" }],
    her: [
      { t: "Wie weit liegen die Werte auseinander?", s: [
        "Zwei Klassen haben beide den Notendurchschnitt 3. In Klasse A liegen alle Noten zwischen 2 und 4, in Klasse B zwischen 1 und 6.",
        "Der Mittelwert allein verrät das nicht. Man braucht ein Maß für die Streuung.",
        "Das einfachste: Man zieht den kleinsten Wert vom größten ab.",
        "$$R = x_{max} - x_{min}",
      ] },
    ],
    bsp: [
      "Temperaturen einer Woche: 12°, 15°, 9°, 18°, 14°, 11°, 16°.",
      "$$R = 18° - 9° = 9°",
    ],
    falle: "Die Spannweite hängt nur von den beiden Extremwerten ab. Ein einziger Ausreißer macht sie groß, auch wenn alle anderen Werte dicht beieinander liegen.",
    nutzt: [["arith-mittel", "ergänzt den Mittelwert um die Streuung"], ["median", "beide brauchen die geordnete Liste"]],
  },
  {
    id: "kreisdiagramm", g: "Daten", n: "Kreisdiagramm", st: "unter-mittel", kl: 6,
    f: "\\text{Mittelpunktswinkel} = \\text{Anteil} \\cdot 360°",
    k: "Jeder Anteil bekommt ein Kreisstück – alle zusammen ergeben den ganzen Kreis",
    syn: "kreisdiagramm tortendiagramm anteile winkel prozent",
    bild: ["kreisDiagramm", {}],
    her: [
      { t: "Warum mal 360°?", s: [
        "Der ganze Kreis steht für alle Befragten, also für den Anteil $1 = 100\\,\\%$. Ein voller Kreis hat $360°$.",
        "Ein Anteil von $\\frac{1}{4}$ bekommt deshalb $\\frac{1}{4}$ des Kreises: $\\frac{1}{4} \\cdot 360° = 90°$.",
        "Allgemein: Winkel = relative Häufigkeit mal $360°$.",
        "$$\\alpha = \\frac{H}{n} \\cdot 360° || H absolute Häufigkeit, n Gesamtzahl",
        "Weil alle Anteile zusammen 1 ergeben, ergeben alle Winkel zusammen genau $360°$.",
      ] },
    ],
    bsp: [
      "30 Kinder: 12 Fußball, 9 Schwimmen, 6 Reiten, 3 Tennis.",
      "$$\\text{Fußball: } \\frac{12}{30} \\cdot 360° = 144°",
      "Schwimmen $108°$, Reiten $72°$, Tennis $36°$. Probe: $144° + 108° + 72° + 36° = 360°$ ✓",
    ],
    falle: "Prozent nicht direkt als Grad nehmen: 25 % sind $90°$, nicht $25°$.",
    nutzt: [["relhaeuf", "Winkel ist relative Häufigkeit mal 360°"], ["prozent", "Anteile in Prozent umrechnen"], ["kreissektor", "jedes Kreisstück ist ein Kreissektor"]],
  },
];
