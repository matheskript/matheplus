/* FORMELSAMMLUNG · TERME UND GLEICHUNGEN (Unterstufe, Klasse 7) – Bereich terme
   Aufbau der Einträge: siehe fsAnalysis.js */

export const FS_UNTER_TERME = [
  /* ---------------- Terme (Unterstufe) ---------------- */
  {
    id: "variable", g: "Terme (Unterstufe)", n: "Term mit Variable", st: "unter-mittel", kl: 7,
    f: "T(x) = 3x + 5, \\quad T(4) = 3 \\cdot 4 + 5 = 17",
    k: "Ein Platzhalter für eine Zahl · Einsetzen liefert den Wert des Terms",
    syn: "variable platzhalter term einsetzen termwert buchstabe",
    bild: ["waage", {}],
    her: [
      { t: "Warum Buchstaben statt Zahlen?", s: [
        "Ein Kinoticket kostet 5 € Eintritt pro Person plus 3 € für Popcorn. Für 2, 3, 4 Personen rechnet man immer gleich.",
        "Statt jedes Mal neu zu rechnen, schreibt man einen Platzhalter $x$ für die Anzahl der Personen:",
        "$$T(x) = 5x + 3 || 5x heißt 5 · x",
        "Setzt man für $x$ eine Zahl ein, erhält man den Wert des Terms: $T(4) = 5 \\cdot 4 + 3 = 23$.",
      ] },
      { t: "Schreibweise", s: [
        "Zwischen Zahl und Variable lässt man den Malpunkt weg: $3x = 3 \\cdot x$.",
        "Zwischen zwei Zahlen nie: $3 \\cdot 4$ ist nicht $34$.",
        "Beim Einsetzen setzt man negative Zahlen in Klammern: $T(-2) = 3 \\cdot (-2) + 5 = -1$.",
      ] },
    ],
    bsp: [
      "$T(x) = 2x^2 - x$ für $x = 3$:",
      "$$T(3) = 2 \\cdot 3^2 - 3 = 2 \\cdot 9 - 3 = 15",
    ],
    falle: "Beim Einsetzen Punkt vor Strich und Potenz vor Punkt beachten: $2 \\cdot 3^2 = 18$, nicht $6^2 = 36$.",
    nutzt: [["rechenreihenfolge", "beim Einsetzen gilt Punkt vor Strich"]],
    wz: "terme",
  },
  {
    id: "zusammenfassen", g: "Terme (Unterstufe)", n: "Gleichartige Terme zusammenfassen", st: "unter-mittel", kl: 7,
    f: "3x + 5x - 2x = 6x",
    k: "Nur Glieder mit gleicher Variable (und gleichem Exponenten) lassen sich addieren",
    syn: "zusammenfassen vereinfachen gleichartig terme addieren",
    bild: ["flaechenModell", { modus: "zusammenfassen" }],
    her: [
      { t: "Warum darf man das?", s: [
        "$3x$ bedeutet drei Stück $x$, $5x$ fünf Stück $x$. Zusammen sind es acht Stück $x$ – wie 3 Äpfel und 5 Äpfel.",
        "Mit dem Distributivgesetz rückwärts:",
        "$$3x + 5x - 2x = (3 + 5 - 2) \\cdot x || x ausklammern",
        "$$= 6x",
      ] },
      { t: "Was sich nicht zusammenfassen lässt", s: [
        "$3x + 2y$: Äpfel und Birnen – verschiedene Variablen bleiben getrennt.",
        "$x^2 + x$: Ein Quadrat der Seite $x$ und eine Strecke $x$ sind verschiedene Dinge.",
        "Man sortiert deshalb erst nach Sorten und fasst dann jede Sorte für sich zusammen.",
      ] },
    ],
    bsp: [
      "$4a + 3b - a + 5 + 2b - 1$",
      "$$= (4a - a) + (3b + 2b) + (5 - 1) || nach Sorten ordnen",
      "$$= 3a + 5b + 4",
    ],
    falle: "$3x + 2y$ ist nicht $5xy$, und $x + x$ ist $2x$, nicht $x^2$.",
    nutzt: [["distributiv", "gemeinsamen Faktor x ausklammern"], ["variable", "gleiche Variable, gleiche Sorte"]],
    wz: "terme",
  },
  {
    id: "ausmultiplizieren", g: "Terme (Unterstufe)", n: "Ausmultiplizieren", st: "unter-mittel", kl: 7,
    f: "a \\cdot (b + c) = ab + ac",
    k: "Der Faktor vor der Klammer wird mit jedem Glied in der Klammer multipliziert",
    syn: "ausmultiplizieren klammer auflösen distributivgesetz",
    bild: ["flaechenModell", { modus: "ausmultiplizieren" }],
    her: [
      { t: "Ein Rechteck, zwei Teile", s: [
        "Ein Rechteck hat die Höhe $a$ und die Breite $b + c$. Seine Fläche ist $a \\cdot (b + c)$.",
        "Ein senkrechter Strich teilt es in zwei Rechtecke: eines mit Fläche $a \\cdot b$, eines mit Fläche $a \\cdot c$.",
        "Die Gesamtfläche ändert sich durch das Teilen nicht:",
        "$$a \\cdot (b + c) = ab + ac",
      ] },
      { t: "Mit Minus", s: [
        "Steht ein Minus in der Klammer, gilt dasselbe: $a \\cdot (b - c) = ab - ac$.",
        "Steht ein negativer Faktor davor, kehren sich alle Vorzeichen um: $-2 \\cdot (x - 3) = -2x + 6$.",
        "Grund: $(-2) \\cdot (-3) = +6$ nach den Vorzeichenregeln.",
      ] },
    ],
    bsp: [
      "$$3 \\cdot (2x + 5) = 6x + 15",
      "$$-4 \\cdot (a - 2b) = -4a + 8b",
    ],
    falle: "Jedes Glied in der Klammer bekommt den Faktor: $3 \\cdot (x + 2) = 3x + 6$, nicht $3x + 2$.",
    nutzt: [["distributiv", "ist das Distributivgesetz mit Variablen"], ["vorzeichen-mult", "negativer Faktor kehrt die Vorzeichen um"]],
    wz: "terme",
  },
  {
    id: "ausklammern", g: "Terme (Unterstufe)", n: "Ausklammern", st: "unter-mittel", kl: 7,
    f: "ab + ac = a \\cdot (b + c)",
    k: "Gemeinsamen Faktor aller Glieder vor die Klammer ziehen · Umkehrung des Ausmultiplizierens",
    syn: "ausklammern faktorisieren gemeinsamer faktor herausziehen",
    bild: ["flaechenModell", { modus: "ausklammern" }],
    her: [
      { t: "Ausmultiplizieren rückwärts", s: [
        "Das Distributivgesetz gilt in beide Richtungen: $a \\cdot (b + c) = ab + ac$.",
        "Liest man es von rechts nach links, verwandelt man eine Summe in ein Produkt.",
        "Vorgehen: In jedem Glied den gemeinsamen Faktor suchen, ihn vor die Klammer schreiben und in der Klammer stehen lassen, was übrig bleibt.",
        "Probe: Wieder ausmultiplizieren – es muss der Ausgangsterm herauskommen.",
      ] },
      { t: "Wozu ist das gut?", s: [
        "Ein Produkt lässt sich leichter untersuchen als eine Summe.",
        "Später: $x^2 - 3x = x \\cdot (x - 3) = 0$ ist mit dem Satz vom Nullprodukt sofort lösbar: $x = 0$ oder $x = 3$.",
        "Auch Kopfrechnen: $17 \\cdot 23 + 17 \\cdot 77 = 17 \\cdot 100 = 1700$.",
      ] },
    ],
    bsp: [
      "$$6x + 9 = 3 \\cdot (2x + 3)",
      "$$4a^2 - 10a = 2a \\cdot (2a - 5)",
      "Probe: $2a \\cdot 2a - 2a \\cdot 5 = 4a^2 - 10a$ ✓",
    ],
    falle: "Wird ein ganzes Glied ausgeklammert, bleibt eine 1 stehen: $3x + 3 = 3 \\cdot (x + 1)$, nicht $3 \\cdot x$.",
    nutzt: [["ausmultiplizieren", "Umkehrung"], ["distributiv", "von rechts nach links gelesen"]],
    wz: "terme",
  },
  {
    id: "klammer-mal-klammer", g: "Terme (Unterstufe)", n: "Klammer mal Klammer", st: "unter-mittel", kl: 7,
    f: "(a + b)(c + d) = ac + ad + bc + bd",
    k: "Jedes Glied der ersten Klammer mal jedes Glied der zweiten",
    syn: "klammer mal klammer zwei klammern ausmultiplizieren jeder mit jedem",
    bild: ["flaechenModell", { modus: "klammer" }],
    her: [
      { t: "Ein Rechteck in vier Teilen", s: [
        "Ein Rechteck mit Breite $a + b$ und Höhe $c + d$ hat die Fläche $(a + b)(c + d)$.",
        "Ein senkrechter und ein waagerechter Strich teilen es in vier kleinere Rechtecke: $ac$, $ad$, $bc$ und $bd$.",
        "$$(a + b)(c + d) = ac + ad + bc + bd",
        "Merkregel: jeder mit jedem – $2 \\cdot 2 = 4$ Produkte.",
      ] },
      { t: "Zweimal Distributivgesetz", s: [
        "Man behandelt $(c + d)$ zuerst wie eine einzige Zahl:",
        "$$(a + b)(c + d) = a(c + d) + b(c + d) || Distributivgesetz",
        "$$= ac + ad + bc + bd || noch zweimal ausmultiplizieren",
      ] },
    ],
    bsp: [
      "$$(x + 3)(x - 2) = x^2 - 2x + 3x - 6",
      "$$= x^2 + x - 6 || zusammenfassen",
    ],
    falle: "Nicht nur die »ersten« und »letzten« Glieder multiplizieren: $(x + 3)(x + 2) = x^2 + 5x + 6$, nicht $x^2 + 6$.",
    nutzt: [["ausmultiplizieren", "zweimal angewandt"], ["zusammenfassen", "gleichartige Glieder am Ende zusammenfassen"]],
    wz: "terme",
  },
  /* ---------------- Gleichungen (Unterstufe) ---------------- */
  {
    id: "aequivalenzumformung", g: "Gleichungen (Unterstufe)", n: "Äquivalenzumformung", st: "unter-mittel", kl: 7,
    f: "x + 7 = 12 \\;\\mid\\; -7 \\quad\\Rightarrow\\quad x = 5",
    k: "Auf beiden Seiten dasselbe tun – die Lösung bleibt gleich",
    syn: "äquivalenzumformung umformen gleichung lösen beide seiten waage",
    bild: ["waage", {}],
    her: [
      { t: "Die Waage im Gleichgewicht", s: [
        "Eine Gleichung ist wie eine Waage im Gleichgewicht: links und rechts liegt gleich viel.",
        "Nimmt man auf beiden Seiten 7 weg, bleibt sie im Gleichgewicht. Legt man auf beiden Seiten gleich viel dazu, auch.",
        "Erlaubt sind daher: auf beiden Seiten dieselbe Zahl addieren oder subtrahieren, beide Seiten mit derselben Zahl ($\\neq 0$) multiplizieren oder durch sie dividieren.",
        "Ziel: $x$ allein auf eine Seite bringen.",
      ] },
      { t: "Warum nicht mit 0 multiplizieren?", s: [
        "Aus $x = 5$ würde durch $\\cdot\\, 0$ die Gleichung $0 = 0$. Die ist für jedes $x$ wahr – die Information über $x$ ginge verloren.",
        "Deshalb heißen nur Umformungen, die man auch rückgängig machen kann, Äquivalenzumformungen.",
        "Durch 0 teilen ist ohnehin verboten.",
      ] },
    ],
    bsp: [
      "$$3x - 4 = 11 \\quad \\mid +4",
      "$$3x = 15 \\quad \\mid :3",
      "$$x = 5",
    ],
    falle: "Die Umformung muss für die ganze Seite gelten: Aus $2x + 6 = 10$ wird durch $:2$ die Gleichung $x + 3 = 5$, nicht $x + 6 = 5$.",
    nutzt: [["variable", "die Unbekannte ist eine Variable"], ["kehrwert", "Teilen durch a ist Malnehmen mit 1/a"]],
    wz: "gleichungen",
  },
  {
    id: "probe", g: "Gleichungen (Unterstufe)", n: "Probe", st: "unter-mittel", kl: 7,
    f: "\\text{Lösung einsetzen: linke Seite} = \\text{rechte Seite}",
    k: "Kontrolle, ob die gefundene Zahl die Gleichung wirklich erfüllt",
    syn: "probe kontrolle einsetzen überprüfen richtig",
    bild: ["waage", {}],
    her: [
      { t: "Warum die Probe immer funktioniert", s: [
        "Eine Zahl ist genau dann Lösung, wenn die Gleichung nach dem Einsetzen eine wahre Aussage wird.",
        "Man setzt die gefundene Zahl in die Ausgangsgleichung ein – nicht in eine umgeformte Zeile, denn dort könnte schon ein Fehler stecken.",
        "Man rechnet linke und rechte Seite getrennt aus.",
        "Stimmen beide Werte überein, ist die Lösung richtig. Sonst steckt irgendwo ein Rechenfehler.",
      ] },
    ],
    bsp: [
      "Gleichung $3x - 4 = 11$, gefunden: $x = 5$.",
      "$$\\text{links: } 3 \\cdot 5 - 4 = 11, \\quad \\text{rechts: } 11 \\quad ✓",
    ],
    falle: "Die Probe in der Ausgangsgleichung machen. Wer in eine schon falsch umgeformte Zeile einsetzt, »bestätigt« den Fehler.",
    nutzt: [["aequivalenzumformung", "kontrolliert das Ergebnis der Umformungen"], ["variable", "Lösung in die Variable einsetzen"]],
    wz: "gleichungen",
  },
];
