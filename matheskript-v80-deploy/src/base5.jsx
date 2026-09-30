/* ============================================================
   Videokurse der Schulkurse (reine Daten).
   Je Kurs: Titel, Einleitung und Lektionen. Jede Lektion hat ein
   YouTube-Video, eine Erklärung, drei Kernpunkte, einen Merksatz,
   einen Kurz-Check (Multiple Choice) und optional einen Link in den
   passenden Trainer der App („Jetzt üben“).

   PLATZHALTER: Die Videos sind vorerst öffentlich verfügbare
   Erklärvideos anderer Kanäle (Test der Struktur). Vor dem Livegang
   durch eigene Mythos-Mathe-Videos ersetzen – dafür nur die Felder
   `youtube` (bzw. später `bunny`) austauschen.
   ============================================================ */

export const VIDEOKURSE = {
  analysis1: {
    titel: "Der Weg zur Kurvendiskussion",
    intro: "Fünf Lektionen, eine Kette: von der Steigung zwischen zwei Punkten bis zur vollständigen Kurvendiskussion. Jede Lektion baut auf der vorherigen auf – schau sie in dieser Reihenfolge.",
    lektionen: [
      {
        id: "a1", kapitel: "Grundlagen", titel: "Vom Differenzenquotienten zur Ableitung", youtube: "7xd_G5uIp7k",
        worum: "Die Ableitung ist keine Formel, sondern eine Steigung: die Steigung der Tangente in einem Punkt. Du siehst, wie aus der Sekantensteigung durch den Grenzübergang h → 0 die momentane Änderungsrate wird.",
        mitnehmen: [
          "Differenzenquotient = Sekantensteigung = mittlere Änderungsrate",
          "Differentialquotient = Tangentensteigung = momentane Änderungsrate",
          "f′(x₀) = lim (h → 0) [f(x₀ + h) − f(x₀)] / h",
        ],
        merksatz: "Erst h kürzen, dann h gegen 0 laufen lassen – nie umgekehrt.",
        check: {
          frage: "Was beschreibt der Differenzenquotient [f(x₀ + h) − f(x₀)] / h für h ≠ 0?",
          optionen: ["Die Steigung der Tangente in x₀", "Die Steigung der Sekante durch zwei Kurvenpunkte", "Den Funktionswert an der Stelle x₀ + h"],
          richtig: 1,
          erklaerung: "Solange h ≠ 0 ist, verbindet man zwei Punkte des Graphen – das ist eine Sekante. Erst im Grenzwert h → 0 wird daraus die Tangente.",
        },
        ueben: { label: "Differenzenquotient-Trainer", ansicht: "diffq" },
      },
      {
        id: "a2", kapitel: "Handwerk", titel: "Die Ableitungsregeln", youtube: "-sr3ccxGAnw",
        worum: "Niemand rechnet jede Ableitung mit der h-Methode. Potenz-, Faktor-, Summen-, Produkt-, Quotienten- und Kettenregel sind das Werkzeug, mit dem du jede Funktion der Oberstufe ableitest.",
        mitnehmen: [
          "Potenzregel: (xⁿ)′ = n · xⁿ⁻¹",
          "Produktregel: (u · v)′ = u′ · v + u · v′",
          "Kettenregel: äußere Ableitung mal innere Ableitung",
        ],
        merksatz: "Erst die Struktur erkennen – Summe, Produkt, Quotient oder Verkettung –, dann die Regel wählen.",
        check: {
          frage: "Was ist die Ableitung von f(x) = (3x + 1)⁴?",
          optionen: ["4 · (3x + 1)³", "12 · (3x + 1)³", "12x · (3x + 1)³"],
          richtig: 1,
          erklaerung: "Kettenregel: äußere Ableitung 4 · (3x + 1)³ mal innere Ableitung 3 ergibt 12 · (3x + 1)³.",
        },
        ueben: { label: "Ableitungstrainer", ansicht: "ableitungstrainer" },
      },
      {
        id: "a3", kapitel: "Funktionsuntersuchung", titel: "Extrempunkte bestimmen", youtube: "3ff653i3sds",
        worum: "Hoch- und Tiefpunkte liegen dort, wo der Graph waagerecht verläuft. Die notwendige Bedingung f′(x) = 0 liefert Kandidaten, die hinreichende Bedingung entscheidet, ob wirklich ein Extremum vorliegt – und welches.",
        mitnehmen: [
          "Notwendig: f′(x₀) = 0",
          "Hinreichend: f′(x₀) = 0 und f″(x₀) ≠ 0",
          "f″(x₀) < 0 → Hochpunkt, f″(x₀) > 0 → Tiefpunkt",
        ],
        merksatz: "Ist f″(x₀) = 0, sagt die zweite Ableitung nichts – dann entscheidet der Vorzeichenwechsel von f′.",
        check: {
          frage: "Es gilt f′(2) = 0 und f″(2) = −3. Was liegt bei x = 2 vor?",
          optionen: ["Ein Tiefpunkt", "Ein Hochpunkt", "Ein Wendepunkt"],
          richtig: 1,
          erklaerung: "Die Steigung ist null und die Krümmung negativ (Rechtskurve) – der Graph liegt an dieser Stelle oben: Hochpunkt.",
        },
        ueben: { label: "Polynomplotter", ansicht: "plotter" },
      },
      {
        id: "a4", kapitel: "Funktionsuntersuchung", titel: "Wendepunkte berechnen", youtube: "wE5BZSTH0mg",
        worum: "Am Wendepunkt wechselt der Graph seine Krümmung – von einer Links- in eine Rechtskurve oder umgekehrt. Genau dort ist die Steigung lokal am größten oder am kleinsten.",
        mitnehmen: [
          "Notwendig: f″(x₀) = 0",
          "Hinreichend: zusätzlich f‴(x₀) ≠ 0 oder ein Vorzeichenwechsel von f″",
          "Den y-Wert immer in f einsetzen – nicht in f′ oder f″",
        ],
        merksatz: "Wendestellen von f sind Extremstellen von f′.",
        check: {
          frage: "Bei welcher Funktion liegt an der Stelle x = 0 ein Wendepunkt vor?",
          optionen: ["f(x) = x²", "f(x) = x³", "f(x) = x⁴"],
          richtig: 1,
          erklaerung: "Bei x³ ist f″(x) = 6x – Vorzeichenwechsel bei 0, also Wendepunkt. Bei x⁴ ist zwar f″(0) = 0, aber f″(x) = 12x² wechselt das Vorzeichen nicht.",
        },
        ueben: { label: "Polynomplotter", ansicht: "plotter" },
      },
      {
        id: "a5", kapitel: "Abschluss", titel: "Die komplette Kurvendiskussion", youtube: "8dAtL1LFduc",
        worum: "Jetzt fügst du alles zusammen: Definitionsbereich, Symmetrie, Verhalten im Unendlichen, Nullstellen, Extrem- und Wendepunkte – in einer festen Reihenfolge, sauber notiert.",
        mitnehmen: [
          "Eine feste Reihenfolge spart Zeit und verhindert Lücken",
          "Symmetrie und Grenzverhalten zuerst – sie liefern die Rohskizze",
          "Am Ende alle Punkte in eine Skizze eintragen und auf Plausibilität prüfen",
        ],
        merksatz: "Passt ein berechneter Punkt nicht zur Skizze, steckt der Fehler in der Rechnung – nicht in der Skizze.",
        check: {
          frage: "f(x) = x³ − 3x. Welche Symmetrie hat der Graph?",
          optionen: ["Achsensymmetrisch zur y-Achse", "Punktsymmetrisch zum Ursprung", "Keine Symmetrie"],
          richtig: 1,
          erklaerung: "Es kommen nur ungerade Exponenten vor (3 und 1). Damit gilt f(−x) = −f(x): punktsymmetrisch zum Ursprung.",
        },
        ueben: { label: "Kurvendiskussion üben", ansicht: "training", ziel: "kd" },
      },
    ],
  },

  vektoren: {
    titel: "Geometrie im Raum",
    intro: "Vom einzelnen Vektor bis zur Ebene: In fünf Lektionen baust du die Werkzeuge der analytischen Geometrie auf – und für jede typische Abiturfrage ein festes Verfahren.",
    lektionen: [
      {
        id: "v1", kapitel: "Grundlagen", titel: "Grundlagen der Vektorrechnung", youtube: "R4nJTT60zU8",
        worum: "Ein Vektor ist eine Verschiebung: Er hat eine Richtung und eine Länge, aber keinen festen Ort. Du lernst Ortsvektoren, Verbindungsvektoren und den Betrag eines Vektors kennen.",
        mitnehmen: [
          "Verbindungsvektor: AB = B − A („Spitze minus Fuß“)",
          "Betrag: |v| = √(v₁² + v₂² + v₃²)",
          "Ortsvektor: der Vektor vom Ursprung zum Punkt",
        ],
        merksatz: "Punkte haben Koordinaten, Vektoren haben Richtung und Länge – beides wird ähnlich notiert, meint aber Verschiedenes.",
        check: {
          frage: "A(1 | 2 | 0) und B(4 | 6 | 0). Wie lang ist der Vektor AB?",
          optionen: ["5", "7", "√13"],
          richtig: 0,
          erklaerung: "AB = (3, 4, 0), also |AB| = √(9 + 16 + 0) = √25 = 5.",
        },
      },
      {
        id: "v2", kapitel: "Grundlagen", titel: "Skalarprodukt und Winkel", youtube: "nHKT38P-APY",
        worum: "Das Skalarprodukt verrechnet zwei Vektoren zu einer Zahl. Diese Zahl verrät den Winkel zwischen ihnen – und vor allem, ob sie senkrecht aufeinander stehen.",
        mitnehmen: [
          "a · b = a₁b₁ + a₂b₂ + a₃b₃",
          "cos α = (a · b) / (|a| · |b|)",
          "a · b = 0 ⇔ a und b sind orthogonal",
        ],
        merksatz: "Skalarprodukt null heißt rechter Winkel – der schnellste Orthogonalitätstest der Oberstufe.",
        check: {
          frage: "Sind a = (2, −1, 3) und b = (1, 5, 1) orthogonal?",
          optionen: ["Ja, denn a · b = 0", "Nein, denn a · b = 4", "Nein, denn a · b = −2"],
          richtig: 0,
          erklaerung: "2 · 1 + (−1) · 5 + 3 · 1 = 2 − 5 + 3 = 0 – die Vektoren stehen senkrecht aufeinander.",
        },
      },
      {
        id: "v3", kapitel: "Geraden", titel: "Geraden in Parameterform", youtube: "T0U9J97rJK0",
        worum: "Eine Gerade im Raum braucht einen Startpunkt (Stützvektor) und eine Richtung (Richtungsvektor). Über den Parameter t erreichst du jeden Punkt der Geraden.",
        mitnehmen: [
          "g: x = p + t · u mit Stützvektor p und Richtungsvektor u",
          "Aus zwei Punkten A und B: Stützvektor A, Richtungsvektor B − A",
          "Punktprobe: Punkt einsetzen und prüfen, ob ein t alle drei Zeilen erfüllt",
        ],
        merksatz: "Ein t für alle drei Koordinaten – liefert eine Zeile ein anderes t, liegt der Punkt nicht auf der Geraden.",
        check: {
          frage: "g: x = (1, 0, 2) + t · (2, 1, −1). Liegt P(5 | 2 | 0) auf g?",
          optionen: ["Ja, mit t = 2", "Nein, die t-Werte widersprechen sich", "Ja, mit t = 4"],
          richtig: 0,
          erklaerung: "1 + 2t = 5 → t = 2;  0 + t = 2 → t = 2;  2 − t = 0 → t = 2. Alle drei Zeilen liefern t = 2, also liegt P auf g.",
        },
      },
      {
        id: "v4", kapitel: "Geraden", titel: "Lagebeziehungen zweier Geraden", youtube: "vFgmge-qiXM",
        worum: "Zwei Geraden im Raum sind identisch, echt parallel, schneidend oder windschief. Ein festes Prüfschema führt immer zur richtigen Antwort.",
        mitnehmen: [
          "Schritt 1: Sind die Richtungsvektoren Vielfache? → parallel oder identisch",
          "Schritt 2: Sonst gleichsetzen: lösbar → Schnittpunkt, unlösbar → windschief",
          "Windschief gibt es nur im Raum, nie in der Ebene",
        ],
        merksatz: "Erst die Richtungsvektoren vergleichen, dann gleichsetzen – diese Reihenfolge spart Arbeit.",
        check: {
          frage: "Die Richtungsvektoren sind keine Vielfachen voneinander, das Gleichungssystem hat keine Lösung. Wie liegen die Geraden?",
          optionen: ["Parallel", "Schneidend", "Windschief"],
          richtig: 2,
          erklaerung: "Nicht parallel und trotzdem kein gemeinsamer Punkt – genau das heißt windschief.",
        },
      },
      {
        id: "v5", kapitel: "Ebenen", titel: "Ebenen in drei Formen", youtube: "RoTFK0Wb6vg",
        worum: "Eine Ebene lässt sich in Parameter-, Normalen- oder Koordinatenform beschreiben. Jede Form hat ihre Stärken – das Abitur verlangt, dass du sicher zwischen ihnen wechselst.",
        mitnehmen: [
          "Parameterform: Stützvektor plus zwei Spannvektoren",
          "Normalenvektor über das Kreuzprodukt der Spannvektoren",
          "Koordinatenform n₁x₁ + n₂x₂ + n₃x₃ = d – ideal für Punktproben und Schnitte",
        ],
        merksatz: "Die Koeffizienten der Koordinatenform bilden direkt einen Normalenvektor.",
        check: {
          frage: "E: 2x₁ − x₂ + 4x₃ = 7. Welcher Vektor ist ein Normalenvektor von E?",
          optionen: ["(2, −1, 4)", "(2, 1, 4)", "(7, 2, −1)"],
          richtig: 0,
          erklaerung: "Die Koeffizienten vor x₁, x₂, x₃ – also 2, −1 und 4 – bilden einen Normalenvektor.",
        },
        ueben: { label: "Ebenen-Visualizer", ansicht: "ebenen" },
      },
    ],
  },

  stochastik: {
    titel: "Zufall mit System",
    intro: "Vom Baumdiagramm bis zum Hypothesentest: Fünf Lektionen, die die Stochastik der Oberstufe auf wenige, klare Regeln zurückführen.",
    lektionen: [
      {
        id: "s1", kapitel: "Wahrscheinlichkeit", titel: "Baumdiagramm und Pfadregeln", youtube: "sOaU62QPVHk",
        worum: "Mehrstufige Zufallsversuche werden mit dem Baumdiagramm übersichtlich. Zwei Pfadregeln genügen, um jede Wahrscheinlichkeit daraus abzulesen.",
        mitnehmen: [
          "1. Pfadregel: Wahrscheinlichkeiten entlang eines Pfades multiplizieren",
          "2. Pfadregel: Wahrscheinlichkeiten passender Pfade addieren",
          "Die Äste an jedem Knoten ergeben zusammen 1",
        ],
        merksatz: "Entlang multiplizieren, nebeneinander addieren.",
        check: {
          frage: "Eine Münze wird zweimal geworfen. Wie groß ist P(genau einmal Kopf)?",
          optionen: ["1/4", "1/2", "3/4"],
          richtig: 1,
          erklaerung: "Zwei passende Pfade (Kopf–Zahl und Zahl–Kopf) mit je 1/2 · 1/2 = 1/4. Zusammen 1/4 + 1/4 = 1/2.",
        },
        ueben: { label: "Bruchrechnen beim Kopfrechnen", ansicht: "kopf" },
      },
      {
        id: "s2", kapitel: "Wahrscheinlichkeit", titel: "Vierfeldertafel und bedingte Wahrscheinlichkeit", youtube: "WULhyNxOIBw",
        worum: "Zwei Merkmale, vier Kombinationen: Die Vierfeldertafel ordnet sie. Mit ihr berechnest du bedingte Wahrscheinlichkeiten – also: Wie wahrscheinlich ist B, wenn A schon feststeht?",
        mitnehmen: [
          "Zeilen- und Spaltensummen ergeben die Randwahrscheinlichkeiten, alles zusammen 1",
          "P_A(B) = P(A ∩ B) / P(A)",
          "A und B unabhängig ⇔ P(A ∩ B) = P(A) · P(B)",
        ],
        merksatz: "Bei der bedingten Wahrscheinlichkeit rechnest du nur noch in der Zeile der Bedingung – sie ist die neue Gesamtheit.",
        check: {
          frage: "P(A) = 0,4 und P(A ∩ B) = 0,1. Wie groß ist P_A(B)?",
          optionen: ["0,04", "0,25", "0,5"],
          richtig: 1,
          erklaerung: "P_A(B) = P(A ∩ B) / P(A) = 0,1 / 0,4 = 0,25.",
        },
        ueben: { label: "Vier-Felder-Tafel", ansicht: "vierfelder" },
      },
      {
        id: "s3", kapitel: "Zufallsgrößen", titel: "Zufallsgröße und Erwartungswert", youtube: "fWozBbgM0gc",
        worum: "Eine Zufallsgröße ordnet jedem Ergebnis eine Zahl zu, zum Beispiel einen Gewinn. Der Erwartungswert sagt, was man auf lange Sicht im Mittel pro Durchgang erhält.",
        mitnehmen: [
          "Wahrscheinlichkeitsverteilung als Tabelle: Werte xᵢ und P(X = xᵢ)",
          "E(X) = x₁ · P(X = x₁) + x₂ · P(X = x₂) + …",
          "Faires Spiel: Der Erwartungswert des Gewinns ist 0",
        ],
        merksatz: "Der Erwartungswert muss selbst kein möglicher Wert sein – er ist ein Mittelwert über sehr viele Durchgänge.",
        check: {
          frage: "Mit 60 % Wahrscheinlichkeit verlierst du 1 €, mit 40 % gewinnst du 2 €. Wie groß ist der erwartete Gewinn pro Spiel?",
          optionen: ["−0,20 €", "0,20 €", "0,50 €"],
          richtig: 1,
          erklaerung: "E(X) = (−1) · 0,6 + 2 · 0,4 = −0,6 + 0,8 = 0,2 – im Mittel 20 Cent Gewinn pro Spiel.",
        },
      },
      {
        id: "s4", kapitel: "Zufallsgrößen", titel: "Binomialverteilung und Bernoulli-Formel", youtube: "QrfETC99a9Y",
        worum: "Wird ein Versuch mit genau zwei Ausgängen n-mal unabhängig wiederholt, ist die Anzahl der Treffer binomialverteilt. Die Formel von Bernoulli liefert jede Einzelwahrscheinlichkeit.",
        mitnehmen: [
          "Bernoulli-Kette: n Stufen, die Trefferwahrscheinlichkeit p bleibt gleich",
          "P(X = k) = (n über k) · pᵏ · (1 − p)ⁿ⁻ᵏ",
          "Erwartungswert: μ = n · p",
        ],
        merksatz: "(n über k) zählt die passenden Pfade, pᵏ · (1 − p)ⁿ⁻ᵏ ist die Wahrscheinlichkeit eines einzelnen Pfades.",
        check: {
          frage: "Ein Würfel wird 60-mal geworfen. Wie viele Sechsen erwartet man?",
          optionen: ["6", "10", "12"],
          richtig: 1,
          erklaerung: "μ = n · p = 60 · 1/6 = 10.",
        },
        ueben: { label: "Bernoulli-Bingo", ansicht: "bernoulli" },
      },
      {
        id: "s5", kapitel: "Beurteilende Statistik", titel: "Der Hypothesentest", youtube: "zoxDjuRa6xM",
        worum: "Stimmt eine Behauptung über eine Wahrscheinlichkeit? Der Hypothesentest entscheidet anhand einer Stichprobe – mit einer vorher festgelegten Irrtumswahrscheinlichkeit.",
        mitnehmen: [
          "Nullhypothese H₀ und Gegenhypothese H₁ festlegen",
          "Das Signifikanzniveau α bestimmt den Ablehnungsbereich",
          "Fehler 1. Art: H₀ wird abgelehnt, obwohl sie stimmt",
        ],
        merksatz: "Ein Test beweist nichts – er sagt nur, ob das Stichprobenergebnis mit H₀ noch vereinbar ist.",
        check: {
          frage: "Was bedeutet ein Signifikanzniveau von α = 5 %?",
          optionen: [
            "H₀ ist mit 95 % Wahrscheinlichkeit richtig",
            "Die Wahrscheinlichkeit, H₀ fälschlich abzulehnen, beträgt höchstens 5 %",
            "5 % der Stichprobe werden ausgewertet",
          ],
          richtig: 1,
          erklaerung: "α begrenzt den Fehler 1. Art: Ist H₀ wahr, landet das Ergebnis höchstens mit 5 % Wahrscheinlichkeit im Ablehnungsbereich.",
        },
      },
    ],
  },
};
