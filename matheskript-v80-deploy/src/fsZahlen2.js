/* FORMELSAMMLUNG · ZAHLEN UND GRÖSSEN Teil 2 (Unterstufe, Klasse 5–7)
   Rationale Zahlen · Prozent und Zins · Größen und Einheiten
   Aufbau der Einträge: siehe fsAnalysis.js */

export const ZAHLEN_2 = [
  /* ---------------- Rationale Zahlen (Klasse 7) ---------------- */
  {
    id: "negative-zahlen", g: "Rationale Zahlen", n: "Negative Zahlen am Zahlenstrahl", st: "unter", kl: 7,
    f: "-3 < -1 < 0 < 2",
    k: "Links von der Null liegen die negativen Zahlen – je weiter links, desto kleiner",
    syn: "minuszahlen minus negativ zahlenstrahl ordnen vergleichen kleiner größer temperatur",
    bild: ["zahlenstrahl", { modus: "negativ" }],
    her: [
      { t: "Wo liegen Zahlen unter null?", s: [
        "Ein Thermometer zeigt es: Unter $0\\,°\\text{C}$ geht die Skala weiter – $-1\\,°\\text{C}$, $-2\\,°\\text{C}$, … Genauso verlängert man den Zahlenstrahl über die Null hinaus nach links.",
        "Jede positive Zahl bekommt ein Spiegelbild links der Null: Zu $3$ gehört $-3$. Beide sind gleich weit von der Null entfernt.",
        "Auf dem Zahlenstrahl gilt immer: Die Zahl, die weiter links liegt, ist die kleinere.",
        "$$-5 < -2 || −5 liegt weiter links als −2",
        "Deshalb ist jede negative Zahl kleiner als null und kleiner als jede positive Zahl.",
      ] },
      { t: "Warum ist −5 kleiner als −2?", s: [
        "Denk an Schulden: Wer $5$ € Schulden hat ($-5$), hat weniger als jemand mit $2$ € Schulden ($-2$).",
        "Je größer die Schulden, desto kleiner der Kontostand. Bei negativen Zahlen ist also die Zahl mit dem größeren Betrag die kleinere.",
      ] },
    ],
    bsp: [
      "Ordne der Größe nach: $3; -4; 0; -1{,}5; 2$.",
      "$$-4 < -1{,}5 < 0 < 2 < 3",
      "Auf dem Zahlenstrahl von links nach rechts gelesen.",
    ],
    falle: "Bei negativen Zahlen ist die »größere Ziffer« die kleinere Zahl: $-7 < -3$, obwohl $7 > 3$.",
    nutzt: [["zahlbereiche", "die ganzen Zahlen ℤ erweitern die natürlichen Zahlen ℕ um die negativen Zahlen"]],
  },
  {
    id: "gegenzahl", g: "Rationale Zahlen", n: "Gegenzahl und Betrag", st: "unter-mittel", kl: 7,
    f: "-(-a) = a, \\quad |-5| = |5| = 5",
    k: "Gegenzahl: an der Null gespiegelt · Betrag: Abstand zur Null",
    syn: "gegenzahl betrag abstand null spiegeln vorzeichen",
    bild: ["zahlenstrahl", { modus: "betrag" }],
    her: [
      { t: "Spiegeln an der Null", s: [
        "Die Gegenzahl von $a$ ist die Zahl, die auf der anderen Seite der Null gleich weit entfernt liegt. Man schreibt sie $-a$.",
        "$$-(3) = -3, \\quad -(-3) = 3 || einmal spiegeln, zweimal spiegeln",
        "Spiegelt man zweimal, ist man wieder am Anfang. Deshalb gilt $-(-a) = a$ für jede Zahl $a$.",
        "Zahl und Gegenzahl ergeben zusammen null: $a + (-a) = 0$. Auf dem Zahlenstrahl: Man geht $a$ Schritte hin und $a$ Schritte zurück.",
      ] },
      { t: "Der Betrag ist ein Abstand", s: [
        "Der Betrag $|a|$ gibt an, wie weit $a$ von der Null entfernt ist – egal in welche Richtung.",
        "Abstände sind nie negativ. Deshalb ist $|a| \\ge 0$ und $|a| = |-a|$.",
        "$$|a| = a \\text{ für } a \\ge 0, \\quad |a| = -a \\text{ für } a < 0 || bei negativem a ist −a positiv",
      ] },
    ],
    bsp: [
      "Gegenzahl von $-2{,}5$: $\\; -(-2{,}5) = 2{,}5$.",
      "$$|-2{,}5| = 2{,}5, \\quad |0| = 0, \\quad |7| = 7",
      "$-8$ und $8$ haben denselben Betrag $8$.",
    ],
    falle: "$-a$ ist nicht automatisch negativ: Für $a = -4$ ist $-a = 4$.",
    nutzt: [["negative-zahlen", "Zahl und Gegenzahl liegen spiegelbildlich zur Null"]],
  },
  {
    id: "vorzeichen-add", g: "Rationale Zahlen", n: "Addieren und Subtrahieren negativer Zahlen", st: "unter-mittel", kl: 7,
    f: "a - (-b) = a + b, \\quad a + (-b) = a - b",
    k: "Eine negative Zahl abziehen heißt ihre Gegenzahl addieren",
    syn: "plus minus addieren subtrahieren negative zahlen minus minus vorzeichen rechenzeichen",
    bild: ["zahlenstrahl", { modus: "addieren" }],
    her: [
      { t: "Schritte auf dem Zahlenstrahl", s: [
        "Plus heißt: nach rechts gehen. Minus heißt: umdrehen und in die andere Richtung gehen.",
        "Eine negative Zahl addieren: $3 + (-5)$ heißt, 5 Schritte nach links. Man landet bei $-2$ – also wie $3 - 5$.",
        "Eine negative Zahl subtrahieren: Minus dreht die Richtung um, das negative Vorzeichen dreht sie noch einmal. Zweimal umdrehen ist wie gar nicht umdrehen:",
        "$$3 - (-5) = 3 + 5 = 8",
      ] },
      { t: "Mit dem Muster weiterzählen", s: [
        "Zieh von $3$ immer kleinere Zahlen ab: $3 - 2 = 1$, $\\; 3 - 1 = 2$, $\\; 3 - 0 = 3$.",
        "Wird die abgezogene Zahl um 1 kleiner, wird das Ergebnis um 1 größer. Das Muster geht weiter:",
        "$$3 - (-1) = 4, \\quad 3 - (-2) = 5 || also 3 − (−2) = 3 + 2",
      ] },
      { t: "Mit der Gegenzahl begründet", s: [
        "Subtrahieren ist die Umkehrung des Addierens: $a - c$ ist die Zahl, die man zu $c$ addieren muss, um $a$ zu erhalten.",
        "Mit $c = -b$: Gesucht ist $x$ mit $-b + x = a$. Das erfüllt $x = a + b$, denn $-b + a + b = a$.",
        "$$a - (-b) = a + b",
      ] },
    ],
    bsp: [
      "$$-4 + 9 = 5",
      "$$-4 - 9 = -13",
      "$$-4 - (-9) = -4 + 9 = 5",
      "$$7 + (-10) = 7 - 10 = -3",
    ],
    falle: "»Minus und Minus gibt Plus« gilt nur für zwei direkt aufeinanderfolgende Zeichen: $-4 - 9 = -13$, nicht $+13$.",
    nutzt: [["gegenzahl", "eine Zahl abziehen heißt ihre Gegenzahl addieren"], ["negative-zahlen", "Rechnen als Schritte auf dem Zahlenstrahl"]],
  },
  {
    id: "vorzeichen-mult", g: "Rationale Zahlen", n: "Vorzeichenregeln beim Multiplizieren", st: "unter-mittel", kl: 7,
    f: "(-a) \\cdot (-b) = a \\cdot b, \\quad (-a) \\cdot b = -(a \\cdot b)",
    k: "Gleiche Vorzeichen: Ergebnis positiv · verschiedene Vorzeichen: Ergebnis negativ",
    syn: "minus mal minus plus mal minus vorzeichen multiplizieren dividieren geteilt mal",
    bild: ["vorzeichenTafel", {}],
    her: [
      { t: "Mit dem Muster weiterzählen", s: [
        "Plus mal Minus ist wiederholtes Addieren: $3 \\cdot (-2) = (-2) + (-2) + (-2) = -6$.",
        "Jetzt die Reihe $(-2) \\cdot 3, \\; (-2) \\cdot 2, \\; \\ldots$ – der zweite Faktor wird jeweils um 1 kleiner:",
        "$$(-2) \\cdot 2 = -4, \\quad (-2) \\cdot 1 = -2, \\quad (-2) \\cdot 0 = 0 || das Ergebnis wächst jedes Mal um 2",
        "Das Muster muss weitergehen, sonst würden die Rechengesetze nicht mehr gelten:",
        "$$(-2) \\cdot (-1) = 2, \\quad (-2) \\cdot (-2) = 4",
      ] },
      { t: "Mit dem Distributivgesetz bewiesen", s: [
        "Wir wissen schon: $(-a) \\cdot b = -(a \\cdot b)$, weil $(-a) \\cdot b + a \\cdot b = (-a + a) \\cdot b = 0 \\cdot b = 0$.",
        "Jetzt betrachten wir $(-a) \\cdot (-b) + (-a) \\cdot b$ und klammern $(-a)$ aus:",
        "$$(-a) \\cdot (-b) + (-a) \\cdot b = (-a) \\cdot (-b + b) || Distributivgesetz",
        "$$= (-a) \\cdot 0 = 0",
        "Also ist $(-a) \\cdot (-b)$ die Gegenzahl von $(-a) \\cdot b = -ab$. Die Gegenzahl von $-ab$ ist $ab$:",
        "$$(-a) \\cdot (-b) = a \\cdot b",
      ] },
    ],
    bsp: [
      "$$(-6) \\cdot (-7) = 42",
      "$$(-6) \\cdot 7 = -42",
      "$$(-48) : (-6) = 8, \\quad 48 : (-6) = -8",
      "Bei mehreren Faktoren zählt man die Minuszeichen: $(-1) \\cdot (-2) \\cdot (-3) = -6$ (drei Minus, ungerade Anzahl → negativ).",
    ],
    falle: "Die Regel gilt fürs Multiplizieren und Dividieren, nicht fürs Addieren: $(-3) + (-4) = -7$, nicht $+7$.",
    nutzt: [["distributiv", "der Beweis für Minus mal Minus beruht auf dem Distributivgesetz"], ["vorzeichen-add", "Gegenzahlen: a + (−a) = 0"]],
  },
  {
    id: "minusklammer", g: "Rationale Zahlen", n: "Minusklammer auflösen", st: "unter-mittel", kl: 7,
    f: "a - (b - c) = a - b + c, \\quad a - (b + c) = a - b - c",
    k: "Steht ein Minus vor der Klammer, drehen sich beim Weglassen alle Vorzeichen in der Klammer um",
    syn: "klammer auflösen minus vor der klammer vorzeichen umdrehen plusklammer",
    bild: ["waage", {}],
    her: [
      { t: "Minus vor der Klammer ist mal (−1)", s: [
        "Ein Minus vor der Klammer bedeutet: die Gegenzahl des ganzen Klammerinhalts. Das ist dasselbe wie mal $(-1)$:",
        "$$-(b - c) = (-1) \\cdot (b - c) || Gegenzahl = mal (−1)",
        "$$= (-1) \\cdot b + (-1) \\cdot (-c) = -b + c || Distributivgesetz und Vorzeichenregeln",
        "Also: $a - (b - c) = a - b + c$. Jedes Zeichen in der Klammer kehrt sich um.",
      ] },
      { t: "Mit Geld gedacht", s: [
        "Du hast $a$ €. Du musst einen Betrag bezahlen, der um $c$ € kleiner ist als $b$ €, also $b - c$.",
        "Zahlst du erst die vollen $b$ €, hast du $c$ € zu viel bezahlt und bekommst sie zurück: $a - b + c$.",
      ] },
    ],
    bsp: [
      "$$20 - (8 - 3) = 20 - 8 + 3 = 15 || Probe: 20 − 5 = 15 ✓",
      "$$5x - (2x - 4) = 5x - 2x + 4 = 3x + 4",
      "$$12 - (-3 + y) = 12 + 3 - y = 15 - y",
    ],
    falle: "Alle Vorzeichen in der Klammer drehen sich um, nicht nur das erste: $a - (b - c) \\neq a - b - c$.",
    nutzt: [["distributiv", "−(b − c) = (−1) · (b − c) wird ausmultipliziert"], ["vorzeichen-mult", "(−1) · (−c) = c"]],
    wz: "terme",
  },

  /* ---------------- Prozent und Zins (Klasse 7) ---------------- */
  {
    id: "prozent-grundgleichung", g: "Prozent und Zins", n: "Prozentwert, Grundwert, Prozentsatz", st: "unter-mittel", kl: 7,
    f: "W = G \\cdot \\frac{p}{100}",
    k: "Grundwert G ist das Ganze (100 %), Prozentwert W der Anteil davon, p % der Prozentsatz",
    syn: "prozentrechnung prozentwert grundwert prozentsatz prozente anteil hundertstel",
    bild: ["prozentStreifen", { modus: "grund" }],
    her: [
      { t: "Was bedeutet »Prozent«?", s: [
        "»Prozent« kommt aus dem Lateinischen und heißt »von hundert«. $1\\,\\%$ ist ein Hundertstel:",
        "$$1\\,\\% = \\frac{1}{100} = 0{,}01, \\qquad p\\,\\% = \\frac{p}{100}",
        "Einen Bruchteil einer Größe berechnet man, indem man die Größe mit dem Bruch multipliziert – genauso bei Prozent.",
        "$$W = G \\cdot \\frac{p}{100} || p % von G",
      ] },
      { t: "Mit dem Dreisatz", s: [
        "Das Ganze $G$ entspricht $100\\,\\%$. Teile durch 100, um zu wissen, wie viel $1\\,\\%$ ist:",
        "$$100\\,\\% \\to G, \\quad 1\\,\\% \\to \\frac{G}{100}, \\quad p\\,\\% \\to \\frac{G}{100} \\cdot p",
        "Das ist genau $W = G \\cdot \\frac{p}{100}$.",
      ] },
    ],
    bsp: [
      "Ein Fahrrad kostet $480$ €. Im Sale gibt es $15\\,\\%$ Rabatt. Wie viel spart man?",
      "$$W = 480 \\cdot \\frac{15}{100} = 480 \\cdot 0{,}15 = 72",
      "Man spart $72$ €.",
    ],
    falle: "Der Grundwert ist immer das Ganze, auf das sich die Prozente beziehen – nicht einfach die größere Zahl im Text. »20 % mehr als 50« hat den Grundwert 50.",
    nutzt: [["prozent", "Prozent als Bruch mit Nenner 100"], ["anteil-von", "p % von G ist ein Bruchteil von G"]],
  },
  {
    id: "prozent-drei", g: "Prozent und Zins", n: "Die drei Grundaufgaben der Prozentrechnung", st: "unter-mittel", kl: 7,
    f: "W = G \\cdot \\frac{p}{100}, \\quad G = \\frac{W \\cdot 100}{p}, \\quad p = \\frac{W \\cdot 100}{G}",
    k: "Zwei der drei Größen sind bekannt – die dritte ergibt sich durch Umstellen",
    syn: "grundaufgaben grundwert berechnen prozentsatz berechnen prozentwert berechnen umstellen",
    bild: ["prozentStreifen", { modus: "grund" }],
    her: [
      { t: "Eine Gleichung, drei Fragen", s: [
        "Alles steckt in $W = G \\cdot \\frac{p}{100}$. Je nachdem, was fehlt, stellt man die Gleichung um.",
        "Grundwert gesucht: beide Seiten durch $\\frac{p}{100}$ teilen, also mit $\\frac{100}{p}$ malnehmen:",
        "$$G = W \\cdot \\frac{100}{p} = \\frac{W \\cdot 100}{p}",
        "Prozentsatz gesucht: beide Seiten durch $G$ teilen und mal $100$:",
        "$$\\frac{W}{G} = \\frac{p}{100} \\quad \\Rightarrow \\quad p = \\frac{W \\cdot 100}{G}",
      ] },
      { t: "Ohne Formel: Dreisatz", s: [
        "Grundwert gesucht, z. B. $30\\,\\% \\to 12$ kg:",
        "$$30\\,\\% \\to 12, \\quad 1\\,\\% \\to 0{,}4, \\quad 100\\,\\% \\to 40 || erst durch 30, dann mal 100",
        "Prozentsatz gesucht: Der Anteil $\\frac{W}{G}$ als Dezimalzahl, dann das Komma zwei Stellen nach rechts.",
      ] },
    ],
    bsp: [
      "Grundwert: $35\\,\\%$ der Klasse sind $7$ Kinder. $\\; G = \\frac{7 \\cdot 100}{35} = 20$ Kinder.",
      "Prozentsatz: $18$ von $24$ Aufgaben richtig. $\\; p = \\frac{18 \\cdot 100}{24} = 75$, also $75\\,\\%$.",
      "Prozentwert: $8\\,\\%$ von $250$ €. $\\; W = 250 \\cdot 0{,}08 = 20$ €.",
    ],
    falle: "Beim Grundwert wird durch den Prozentsatz geteilt, nicht mit ihm multipliziert: $30\\,\\% \\to 12$ ergibt $G = 40$, nicht $12 \\cdot 0{,}3 = 3{,}6$.",
    nutzt: [["prozent-grundgleichung", "alle drei Formeln sind Umstellungen der Grundgleichung"], ["dreisatz", "jede Grundaufgabe lässt sich auch mit dem Dreisatz lösen"]],
  },
  {
    id: "wachstumsfaktor", g: "Prozent und Zins", n: "Vermehrter und verminderter Grundwert", st: "unter-mittel", kl: 7,
    f: "G_{neu} = G \\cdot \\left(1 + \\frac{p}{100}\\right), \\quad G_{neu} = G \\cdot \\left(1 - \\frac{p}{100}\\right)",
    k: "Prozentuale Zu- oder Abnahme in einem Schritt: mit dem Faktor 1 + p % bzw. 1 − p % malnehmen",
    syn: "erhöhung senkung rabatt aufschlag mehrwertsteuer preiserhöhung faktor prozentfaktor",
    bild: ["prozentStreifen", { modus: "faktor" }],
    her: [
      { t: "Das Ganze plus der Anteil", s: [
        "Wird $G$ um $p\\,\\%$ erhöht, kommt der Prozentwert dazu:",
        "$$G_{neu} = G + G \\cdot \\frac{p}{100} || alter Wert plus Zuwachs",
        "$$= G \\cdot \\left(1 + \\frac{p}{100}\\right) || G ausklammern",
        "Beispiel: $+19\\,\\%$ heißt mal $1{,}19$, denn $100\\,\\% + 19\\,\\% = 119\\,\\%$.",
        "Bei einer Senkung um $p\\,\\%$ bleiben $100\\,\\% - p\\,\\%$ übrig: $-30\\,\\%$ heißt mal $0{,}7$.",
      ] },
      { t: "Rückwärts: den alten Preis finden", s: [
        "Kennt man den neuen Wert, teilt man durch denselben Faktor:",
        "$$G = G_{neu} : \\left(1 + \\frac{p}{100}\\right)",
        "Ein Preis mit $19\\,\\%$ Mehrwertsteuer von $119$ € war ohne Steuer $119 : 1{,}19 = 100$ €.",
      ] },
    ],
    bsp: [
      "Eine Jacke kostet $80$ €, wird um $25\\,\\%$ reduziert:",
      "$$80 \\cdot (1 - 0{,}25) = 80 \\cdot 0{,}75 = 60",
      "Danach wird sie wieder um $25\\,\\%$ teurer: $60 \\cdot 1{,}25 = 75$ € – nicht wieder $80$ €!",
    ],
    falle: "Prozente beziehen sich immer auf den aktuellen Grundwert: $-25\\,\\%$ und danach $+25\\,\\%$ ergibt $0{,}75 \\cdot 1{,}25 = 0{,}9375$, also insgesamt $-6{,}25\\,\\%$.",
    nutzt: [["prozent-grundgleichung", "der Zuwachs ist der Prozentwert W = G · p/100"], ["ausklammern", "G + G · p/100 = G · (1 + p/100)"]],
  },
  {
    id: "prozentpunkte", g: "Prozent und Zins", n: "Prozent und Prozentpunkte", st: "unter-mittel", kl: 7,
    f: "30\\,\\% \\to 36\\,\\%: \\quad +6 \\text{ Prozentpunkte} = +20\\,\\%",
    k: "Prozentpunkte: Differenz zweier Prozentsätze · Prozent: Änderung im Verhältnis zum alten Wert",
    syn: "prozentpunkte prozentpunkt umfrage wahl unterschied differenz",
    bild: ["prozentStreifen", { modus: "punkte" }],
    her: [
      { t: "Zwei verschiedene Fragen", s: [
        "Eine Partei steigt bei einer Wahl von $30\\,\\%$ auf $36\\,\\%$. Wie stark ist sie gewachsen?",
        "Frage 1 – Wie groß ist der Abstand? Man zieht die Prozentsätze voneinander ab:",
        "$$36\\,\\% - 30\\,\\% = 6 \\text{ Prozentpunkte}",
        "Frage 2 – Um wie viel Prozent ist der Anteil gewachsen? Grundwert ist der alte Wert $30$:",
        "$$\\frac{6}{30} = 0{,}2 = 20\\,\\%",
        "Beide Antworten stimmen – sie beantworten verschiedene Fragen. Wer »6 %« sagt, meint meistens Prozentpunkte und ist ungenau.",
      ] },
    ],
    bsp: [
      "Der Zinssatz steigt von $2\\,\\%$ auf $3\\,\\%$.",
      "$$3\\,\\% - 2\\,\\% = 1 \\text{ Prozentpunkt}",
      "$$\\frac{1}{2} = 50\\,\\% || der Zinssatz ist um 50 % gestiegen",
    ],
    falle: "Von $2\\,\\%$ auf $3\\,\\%$ ist kein Anstieg um $1\\,\\%$, sondern um $1$ Prozentpunkt bzw. um $50\\,\\%$.",
    nutzt: [["prozent-grundgleichung", "die relative Änderung ist ein Prozentsatz mit dem alten Wert als Grundwert"], ["prozent-drei", "p = W · 100 / G"]],
  },
  {
    id: "promille", g: "Prozent und Zins", n: "Promille", st: "unter", kl: 7,
    f: "1\\,‰ = \\frac{1}{1000} = 0{,}1\\,\\%",
    k: "Promille heißt »von tausend« – für sehr kleine Anteile",
    syn: "promille tausendstel von tausend",
    bild: ["prozentStreifen", { modus: "promille" }],
    her: [
      { t: "Von tausend statt von hundert", s: [
        "Wie »Prozent« »von hundert« heißt, heißt »Promille« »von tausend«:",
        "$$1\\,‰ = \\frac{1}{1000} = 0{,}001",
        "Weil $\\frac{1}{1000}$ ein Zehntel von $\\frac{1}{100}$ ist, gilt $1\\,‰ = 0{,}1\\,\\%$ und $10\\,‰ = 1\\,\\%$.",
        "Gerechnet wird genau wie bei Prozent, nur mit $1000$ statt $100$:",
        "$$W = G \\cdot \\frac{p}{1000}",
      ] },
    ],
    bsp: [
      "Ein Grundstück kostet $250\\,000$ €. Der Makler bekommt $3\\,‰$ als Gebühr.",
      "$$W = 250\\,000 \\cdot \\frac{3}{1000} = 750",
      "Die Gebühr beträgt $750$ €. Zum Vergleich: $3\\,‰ = 0{,}3\\,\\%$.",
    ],
    falle: "$5\\,‰$ sind nicht $5\\,\\%$, sondern $0{,}5\\,\\%$ – zehnmal weniger.",
    nutzt: [["prozent", "gleiches Prinzip, nur mit Nenner 1000"], ["prozent-grundgleichung", "W = G · p/1000"]],
  },
  {
    id: "zins-einfach", g: "Prozent und Zins", n: "Jahreszins, Monats- und Tageszins", st: "unter-mittel", kl: 7,
    f: "Z = K \\cdot \\frac{p}{100} \\cdot \\frac{t}{360}",
    k: "Zinsen sind ein Prozentwert des Kapitals – für einen Teil des Jahres nur der entsprechende Teil",
    syn: "zinsen zinsrechnung kapital zinssatz tageszins monatszins jahreszins sparen kredit",
    bild: ["zinsLeiste", {}],
    her: [
      { t: "Zinsrechnung ist Prozentrechnung", s: [
        "Die Bank zahlt pro Jahr $p\\,\\%$ des Kapitals $K$ als Zinsen. Das ist ein Prozentwert:",
        "$$Z_{\\text{Jahr}} = K \\cdot \\frac{p}{100} || Grundwert K, Prozentsatz p %",
        "Liegt das Geld nur $m$ Monate auf dem Konto, gibt es nur $\\frac{m}{12}$ der Jahreszinsen:",
        "$$Z = K \\cdot \\frac{p}{100} \\cdot \\frac{m}{12}",
        "Bei Tagen rechnet man in der Schule mit $30$ Tagen pro Monat, also $360$ Tagen pro Jahr (deutsche Zinsmethode):",
        "$$Z = K \\cdot \\frac{p}{100} \\cdot \\frac{t}{360}",
      ] },
    ],
    bsp: [
      "$1200$ € liegen $5$ Monate zu $3\\,\\%$ auf dem Konto.",
      "$$Z = 1200 \\cdot \\frac{3}{100} \\cdot \\frac{5}{12} = 36 \\cdot \\frac{5}{12} = 15",
      "Es gibt $15$ € Zinsen.",
    ],
    falle: "Der Zinssatz gilt pro Jahr: $3\\,\\%$ für $5$ Monate sind nicht $3\\,\\%$ des Kapitals, sondern nur $\\frac{5}{12}$ davon.",
    nutzt: [["prozent-grundgleichung", "der Jahreszins ist der Prozentwert des Kapitals"], ["zins", "über mehrere Jahre mit Zinseszins wird daraus K₀ · (1 + p/100)ⁿ"]],
  },

  /* ---------------- Größen und Einheiten (Klasse 5/6) ---------------- */
  {
    id: "laengen", g: "Größen und Einheiten", n: "Längeneinheiten", st: "unter", kl: 5,
    f: "1\\,\\text{km} = 1000\\,\\text{m}, \\quad 1\\,\\text{m} = 10\\,\\text{dm} = 100\\,\\text{cm} = 1000\\,\\text{mm}",
    k: "Zwischen mm, cm, dm und m ist die Umrechnungszahl 10 – von m zu km ist sie 1000",
    syn: "länge längen einheiten umrechnen meter kilometer zentimeter millimeter dezimeter",
    bild: ["einheitenTreppe", { art: "laenge" }],
    her: [
      { t: "Die Vorsilben verraten den Faktor", s: [
        "»Kilo« heißt tausend, »Dezi« ein Zehntel, »Zenti« ein Hundertstel, »Milli« ein Tausendstel:",
        "$$1\\,\\text{km} = 1000\\,\\text{m}, \\quad 1\\,\\text{dm} = \\frac{1}{10}\\,\\text{m}, \\quad 1\\,\\text{cm} = \\frac{1}{100}\\,\\text{m}, \\quad 1\\,\\text{mm} = \\frac{1}{1000}\\,\\text{m}",
        "Deshalb ist von einer Einheit zur nächstkleineren (m → dm → cm → mm) der Faktor jeweils $10$.",
        "In die kleinere Einheit umrechnen heißt: mehr Stücke, also malnehmen. In die größere: weniger Stücke, also teilen.",
      ] },
      { t: "Mit der Stellenwerttafel", s: [
        "Man schreibt die Länge so in eine Tafel, dass jede Spalte eine Einheit ist (m | dm | cm | mm).",
        "$3{,}25\\,\\text{m}$: die $3$ steht bei m, die $2$ bei dm, die $5$ bei cm – also $325\\,\\text{cm}$.",
        "Umrechnen heißt nur, das Komma hinter eine andere Spalte zu setzen.",
      ] },
    ],
    bsp: [
      "$$4{,}7\\,\\text{km} = 4700\\,\\text{m}",
      "$$85\\,\\text{cm} = 0{,}85\\,\\text{m} = 850\\,\\text{mm}",
      "$$3\\,\\text{m}\\;6\\,\\text{cm} = 3{,}06\\,\\text{m} || 6 cm sind 6 Hundertstel Meter",
    ],
    falle: "Zwischen m und km liegen nicht zwei Zehnerschritte, sondern drei: $1\\,\\text{km} = 1000\\,\\text{m}$. Und $3\\,\\text{m}\\;6\\,\\text{cm}$ sind $3{,}06\\,\\text{m}$, nicht $3{,}6\\,\\text{m}$.",
    nutzt: [["komma-verschieben", "Umrechnen mit 10, 100, 1000 verschiebt das Komma"], ["stellenwert", "Einheitentafel wie Stellenwerttafel"]],
  },
  {
    id: "flaechen-einheiten", g: "Größen und Einheiten", n: "Flächeneinheiten", st: "unter-mittel", kl: 5,
    f: "1\\,\\text{m}^2 = 100\\,\\text{dm}^2 = 10\\,000\\,\\text{cm}^2, \\quad 1\\,\\text{ha} = 10\\,000\\,\\text{m}^2",
    k: "Bei Flächen ist die Umrechnungszahl 100 – weil Länge und Breite je mit 10 umgerechnet werden",
    syn: "fläche flächeneinheiten quadratmeter quadratzentimeter hektar ar quadratkilometer umrechnen",
    bild: ["einheitenTreppe", { art: "flaeche" }],
    her: [
      { t: "Warum 100 und nicht 10?", s: [
        "$1\\,\\text{dm}^2$ ist ein Quadrat mit $1\\,\\text{dm} = 10\\,\\text{cm}$ Seitenlänge.",
        "Lege es mit Zentimeterquadraten aus: $10$ Reihen zu je $10$ Kästchen.",
        "$$1\\,\\text{dm}^2 = 10\\,\\text{cm} \\cdot 10\\,\\text{cm} = 100\\,\\text{cm}^2",
        "Genauso: $1\\,\\text{m}^2 = 100\\,\\text{cm} \\cdot 100\\,\\text{cm} = 10\\,000\\,\\text{cm}^2$. Zwei Schritte auf der Treppe (m² → dm² → cm²) sind also $100 \\cdot 100$.",
      ] },
      { t: "Ar, Hektar, Quadratkilometer", s: [
        "Für Felder und Grundstücke gibt es eigene Namen: $1\\,\\text{a}$ (Ar) ist ein Quadrat mit $10\\,\\text{m}$ Seite, $1\\,\\text{ha}$ (Hektar) eines mit $100\\,\\text{m}$ Seite.",
        "$$1\\,\\text{a} = 100\\,\\text{m}^2, \\quad 1\\,\\text{ha} = 100\\,\\text{a} = 10\\,000\\,\\text{m}^2, \\quad 1\\,\\text{km}^2 = 100\\,\\text{ha}",
        "Die ganze Treppe: $\\text{mm}^2 \\;\\to\\; \\text{cm}^2 \\;\\to\\; \\text{dm}^2 \\;\\to\\; \\text{m}^2 \\;\\to\\; \\text{a} \\;\\to\\; \\text{ha} \\;\\to\\; \\text{km}^2$, immer Faktor $100$.",
      ] },
    ],
    bsp: [
      "$$3{,}5\\,\\text{m}^2 = 350\\,\\text{dm}^2 = 35\\,000\\,\\text{cm}^2",
      "$$4500\\,\\text{m}^2 = 45\\,\\text{a} = 0{,}45\\,\\text{ha}",
      "Ein Fußballfeld ($105\\,\\text{m} \\times 68\\,\\text{m}$) hat $7140\\,\\text{m}^2 \\approx 0{,}71\\,\\text{ha}$.",
    ],
    falle: "$1\\,\\text{m}^2$ sind nicht $100\\,\\text{cm}^2$, sondern $10\\,000\\,\\text{cm}^2$ – bei Flächen ist jeder Schritt Faktor 100.",
    nutzt: [["laengen", "jede Seite des Quadrats wird mit 10 umgerechnet, die Fläche also mit 10 · 10"], ["rechteck", "Fläche = Länge mal Breite"]],
  },
  {
    id: "volumen-einheiten", g: "Größen und Einheiten", n: "Volumeneinheiten", st: "unter-mittel", kl: 6,
    f: "1\\,\\text{m}^3 = 1000\\,\\text{dm}^3, \\quad 1\\,\\text{l} = 1\\,\\text{dm}^3, \\quad 1\\,\\text{ml} = 1\\,\\text{cm}^3",
    k: "Bei Volumen ist die Umrechnungszahl 1000 – Länge, Breite und Höhe werden je mit 10 umgerechnet",
    syn: "volumen rauminhalt kubikmeter kubikzentimeter liter milliliter hektoliter umrechnen",
    bild: ["einheitenTreppe", { art: "volumen" }],
    her: [
      { t: "Ein Würfel aus kleinen Würfeln", s: [
        "$1\\,\\text{dm}^3$ ist ein Würfel mit $10\\,\\text{cm}$ Kantenlänge.",
        "Fülle ihn mit Zentimeterwürfeln: Eine Schicht hat $10 \\cdot 10 = 100$ Würfel, und es gibt $10$ Schichten.",
        "$$1\\,\\text{dm}^3 = 10 \\cdot 10 \\cdot 10\\,\\text{cm}^3 = 1000\\,\\text{cm}^3",
        "Ebenso $1\\,\\text{m}^3 = 1000\\,\\text{dm}^3$ und $1\\,\\text{cm}^3 = 1000\\,\\text{mm}^3$.",
      ] },
      { t: "Liter und Milliliter", s: [
        "Für Flüssigkeiten nimmt man Liter: Ein Liter passt genau in einen Würfel mit $1\\,\\text{dm}$ Kante.",
        "$$1\\,\\text{l} = 1\\,\\text{dm}^3 = 1000\\,\\text{cm}^3 = 1000\\,\\text{ml} \\quad\\Rightarrow\\quad 1\\,\\text{ml} = 1\\,\\text{cm}^3",
        "Außerdem: $1\\,\\text{hl} = 100\\,\\text{l}$ (Hektoliter) und $1\\,\\text{m}^3 = 1000\\,\\text{l}$.",
      ] },
    ],
    bsp: [
      "Ein Aquarium ist $60\\,\\text{cm}$ lang, $30\\,\\text{cm}$ breit und $40\\,\\text{cm}$ hoch.",
      "$$V = 60 \\cdot 30 \\cdot 40\\,\\text{cm}^3 = 72\\,000\\,\\text{cm}^3 = 72\\,\\text{dm}^3 = 72\\,\\text{l}",
      "$$2{,}5\\,\\text{m}^3 = 2500\\,\\text{dm}^3 = 2500\\,\\text{l}",
    ],
    falle: "$1\\,\\text{m}^3$ sind nicht $100\\,\\text{dm}^3$, sondern $1000\\,\\text{dm}^3$ – bei Volumen ist jeder Schritt Faktor 1000.",
    nutzt: [["flaechen-einheiten", "eine Dimension mehr: aus Faktor 100 wird Faktor 1000"], ["quader", "Volumen = Länge · Breite · Höhe"]],
  },
  {
    id: "masse", g: "Größen und Einheiten", n: "Masseneinheiten", st: "unter", kl: 5,
    f: "1\\,\\text{t} = 1000\\,\\text{kg}, \\quad 1\\,\\text{kg} = 1000\\,\\text{g}, \\quad 1\\,\\text{g} = 1000\\,\\text{mg}",
    k: "Bei Gewichten ist die Umrechnungszahl immer 1000",
    syn: "gewicht masse gramm kilogramm tonne milligramm umrechnen",
    bild: ["einheitenTreppe", { art: "masse" }],
    her: [
      { t: "Wieder die Vorsilben", s: [
        "»Kilo« heißt tausend: $1\\,\\text{kg} = 1000\\,\\text{g}$. »Milli« heißt ein Tausendstel: $1\\,\\text{mg} = \\frac{1}{1000}\\,\\text{g}$.",
        "Die Tonne ist $1000\\,\\text{kg}$. So hat man eine Treppe mit gleich großen Stufen:",
        "$$\\text{mg} \\to \\text{g} \\to \\text{kg} \\to \\text{t}",
        "Jede Stufe ist Faktor $1000$. Mit der Stellenwerttafel braucht man pro Einheit drei Spalten.",
      ] },
    ],
    bsp: [
      "$$2{,}35\\,\\text{kg} = 2350\\,\\text{g}",
      "$$750\\,\\text{g} = 0{,}75\\,\\text{kg}",
      "$$1{,}2\\,\\text{t} = 1200\\,\\text{kg}",
    ],
    falle: "$2\\,\\text{kg}\\;50\\,\\text{g}$ sind $2{,}050\\,\\text{kg}$, nicht $2{,}5\\,\\text{kg}$ – nach dem Komma braucht man drei Stellen.",
    nutzt: [["komma-verschieben", "mal oder geteilt durch 1000 verschiebt das Komma um drei Stellen"], ["laengen", "dieselben Vorsilben kilo und milli"]],
  },
  {
    id: "zeit", g: "Größen und Einheiten", n: "Zeiteinheiten", st: "unter", kl: 5,
    f: "1\\,\\text{h} = 60\\,\\text{min} = 3600\\,\\text{s}, \\quad 1\\,\\text{d} = 24\\,\\text{h}",
    k: "Zeit wird nicht im Zehnersystem umgerechnet: 60, 60, 24",
    syn: "zeit uhrzeit stunden minuten sekunden tage zeitspanne umrechnen",
    bild: ["einheitenTreppe", { art: "zeit" }],
    her: [
      { t: "Warum 60?", s: [
        "Die Einteilung in $60$ stammt von den Babyloniern, die mit der Grundzahl $60$ rechneten. $60$ hat viele Teiler: $2, 3, 4, 5, 6, 10, 12, 15, 20, 30$.",
        "Deshalb ist eine halbe, eine drittel und eine viertel Stunde eine ganze Zahl von Minuten: $30$, $20$ und $15$ min.",
        "$$1\\,\\text{h} = 60\\,\\text{min}, \\quad 1\\,\\text{min} = 60\\,\\text{s} \\quad\\Rightarrow\\quad 1\\,\\text{h} = 60 \\cdot 60\\,\\text{s} = 3600\\,\\text{s}",
        "Weiter oben: $1\\,\\text{d} = 24\\,\\text{h}$, $1$ Woche $= 7\\,\\text{d}$, $1$ Jahr $= 365$ (Schaltjahr $366$) Tage.",
      ] },
    ],
    bsp: [
      "$$2{,}5\\,\\text{h} = 2\\,\\text{h}\\;30\\,\\text{min} = 150\\,\\text{min}",
      "$$1\\,\\text{h}\\;45\\,\\text{min} = 1{,}75\\,\\text{h} || 45 min = 45/60 h = 0,75 h",
      "Zeitspanne von 8:40 Uhr bis 11:15 Uhr: $20\\,\\text{min}$ bis 9:00, dann $2\\,\\text{h}$ bis 11:00, dann $15\\,\\text{min}$ – zusammen $2\\,\\text{h}\\;35\\,\\text{min}$.",
    ],
    falle: "$1{,}5\\,\\text{h}$ sind $1\\,\\text{h}\\;30\\,\\text{min}$, nicht $1\\,\\text{h}\\;50\\,\\text{min}$ – Zeit hat keine Zehnerstufen.",
    nutzt: [["bruch-def", "0,5 h ist die halbe Stunde, 1/4 h sind 15 min"], ["laengen", "anders als bei Längen ist der Faktor nicht 10"]],
  },
  {
    id: "massstab", g: "Größen und Einheiten", n: "Maßstab", st: "unter", kl: 6,
    f: "1 : 25\\,000: \\quad 1\\,\\text{cm} \\text{ auf der Karte} \\;\\text{entspricht}\\; 25\\,000\\,\\text{cm} = 250\\,\\text{m}",
    k: "Der Maßstab sagt, wie oft die Wirklichkeit größer ist als das Bild",
    syn: "maßstab massstab karte landkarte verkleinerung vergrößerung modell",
    bild: ["massstab", {}],
    her: [
      { t: "Was 1 : 25 000 bedeutet", s: [
        "Auf einer Karte im Maßstab $1 : 25\\,000$ ist alles $25\\,000$-mal kleiner als in Wirklichkeit.",
        "Jede Länge auf der Karte mal $25\\,000$ ergibt die wirkliche Länge – in derselben Einheit:",
        "$$1\\,\\text{cm} \\cdot 25\\,000 = 25\\,000\\,\\text{cm} = 250\\,\\text{m}",
        "Umgekehrt: Wirkliche Länge durch $25\\,000$ ergibt die Länge auf der Karte.",
        "Bei Vergrößerungen (z. B. ein Insekt im Biologiebuch) steht die größere Zahl vorn: $10 : 1$ heißt zehnfach vergrößert.",
      ] },
    ],
    bsp: [
      "Zwei Orte sind auf einer Karte $1 : 50\\,000$ genau $7\\,\\text{cm}$ voneinander entfernt.",
      "$$7\\,\\text{cm} \\cdot 50\\,000 = 350\\,000\\,\\text{cm} = 3{,}5\\,\\text{km}",
      "Ein $12\\,\\text{km}$ langer Weg ist auf derselben Karte $1\\,200\\,000\\,\\text{cm} : 50\\,000 = 24\\,\\text{cm}$ lang.",
    ],
    falle: "Erst in derselben Einheit rechnen, dann umwandeln: $4\\,\\text{cm} \\cdot 25\\,000 = 100\\,000\\,\\text{cm} = 1\\,\\text{km}$, nicht $100\\,000\\,\\text{m}$.",
    nutzt: [["laengen", "das Ergebnis wird in m oder km umgerechnet"]],
  },
];
