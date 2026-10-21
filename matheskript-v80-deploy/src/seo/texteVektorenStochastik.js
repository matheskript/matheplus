/* ======================================================================
   SEO-/KI-Texte der Werkzeuge: Vektoren und Stochastik (21.10.2026)
   Format je Werkzeug-Id (Schlüssel aus werkzeuge.js) – siehe src/seo/index.js und texteAnalysis.js:
     titel        für <title>, höchstens 60 Zeichen
     beschreibung Meta-Description, 110–155 Zeichen
     kurz         ein Satz, sichtbar über dem Aufklapper „Was kann dieses Werkzeug?“
     text         2–3 Absätze, zusammen 150–250 Wörter, Schüler geduzt, konkret: was das Werkzeug kann
     faq          genau 3 Fragen; die dritte aus Elternsicht (gesiezt)
   Nur beschreiben, was das Werkzeug wirklich kann (geprüft in func16/19/20/23/24, funcGeraden,
   func17/18, funcErwartung, funcKombinatorik, funcHypothesentest, funcNormalverteilung).
   ====================================================================== */
export const TEXTE_VEKTOREN_STOCHASTIK = {
  /* ---------- Vektoren ---------- */

  vektorgenerator: {
    titel: "Rechnen mit Vektoren: Beispiele mit Rechenweg",
    beschreibung: "Vektoren addieren, subtrahieren, mit Zahlen multiplizieren, Linearkombination und Skalarprodukt – unbegrenzt neue Beispiele, jedes mit Rechenweg.",
    kurz: "Du wählst eine Rechenart und bekommst so viele Beispiele, wie du willst – jedes mit vollständigem Rechenweg.",
    text: [
      "Vektorrechnung beginnt mit wenigen Regeln: Vektoren werden komponentenweise addiert und subtrahiert, eine Zahl vor dem Vektor wird mit jeder Komponente multipliziert, und das Skalarprodukt fasst alles zu einer einzigen Zahl zusammen. Die Regeln sind einfach – Fehler entstehen bei Vorzeichen, Klammern und beim Verwechseln von Vektor und Zahl.",
      "Hier wählst du eine Rechenart: Vektoraddition und -subtraktion, Skalarmultiplikation, Linearkombination k · a + j · b oder Skalarprodukt. Mit „Neues Beispiel“ erzeugst du beliebig viele Aufgaben, alle Koordinaten liegen zwischen −7 und 7. Jede Rechnung steht Schritt für Schritt da: einsetzen, ausmultiplizieren, komponentenweise zusammenfassen. Beim Skalarprodukt sagt dir das Werkzeug zusätzlich, ob die Vektoren senkrecht stehen und ob der Winkel spitz oder stumpf ist.",
      "Am meisten lernst du, wenn du jedes Beispiel erst auf Papier rechnest und dann vergleichst. Kreuzprodukt und Abstände haben eigene Werkzeuge, zu denen du von hier direkt weiterkommst. Der Stoff gehört zur analytischen Geometrie der Kursstufe in Baden-Württemberg.",
    ],
    faq: [
      { f: "Wie addiert man zwei Vektoren?", a: "Komponentenweise: erste Komponente plus erste, zweite plus zweite, dritte plus dritte. Bei der Subtraktion genauso mit Minus." },
      { f: "Was ist der Unterschied zwischen Skalarmultiplikation und Skalarprodukt?", a: "Bei der Skalarmultiplikation wird ein Vektor mit einer Zahl multipliziert, das Ergebnis ist ein Vektor. Das Skalarprodukt zweier Vektoren ist eine Zahl: a₁b₁ + a₂b₂ + a₃b₃." },
      { f: "Bekommt mein Kind hier Aufgaben zum Selbstrechnen?", a: "Das Werkzeug erzeugt beliebig viele Beispiele mit Rechenweg, prüft aber keine Eingaben. Ihr Kind rechnet am besten erst selbst auf Papier und vergleicht danach mit dem gezeigten Rechenweg." },
    ],
  },

  kreuzprodukt: {
    titel: "Kreuzprodukt berechnen: Formel, Einsetzen, Ergebnis",
    beschreibung: "Kreuzprodukt zweier Vektoren mit Rechenweg: Formel, eingesetzte Zahlen, Ergebnis – dazu Probe per Skalarprodukt und Flächeninhalt des Parallelogramms.",
    kurz: "Zwei Vektoren eingeben – du siehst die Formel, die eingesetzten Zahlen und den Vektor, der auf beiden senkrecht steht.",
    text: [
      "Das Kreuzprodukt a × b liefert einen Vektor, der auf a und auf b senkrecht steht. In der analytischen Geometrie brauchst du es ständig, vor allem für den Normalenvektor einer Ebene. Die Formel ist kurz, aber unübersichtlich: Die Indizes laufen im Kreis, und ein vertauschtes Minus macht das ganze Ergebnis falsch.",
      "Du gibst die beiden Vektoren ein, mit Plus- und Minus-Knöpfen oder direkt als ganze Zahl, Bruch, Kommazahl oder Wurzel wie √5. Das Werkzeug zeigt zuerst die allgemeine Formel, dann die eingesetzten Zahlen und das Ergebnis. Darunter steht die Probe: Beide Skalarprodukte mit dem Ergebnis sind 0. Außerdem berechnet es die Länge des Kreuzprodukts, also den Flächeninhalt des Parallelogramms, das a und b aufspannen. Sind die Vektoren parallel, erklärt es, warum der Nullvektor herauskommt.",
      "Merkregeln zu zyklischen Indizes, „über Kreuz“ und zur Reihenfolge helfen dir, die Formel ohne Formelsammlung zu können. Fertige Beispiele, etwa mit Einheitsvektoren oder Wurzeln, lassen sich mit einem Tipp laden.",
    ],
    faq: [
      { f: "Wie berechnet man das Kreuzprodukt?", a: "a × b = (a₂b₃ − a₃b₂ | a₃b₁ − a₁b₃ | a₁b₂ − a₂b₁). Jede Zeile benutzt die beiden anderen Indizes: überkreuz multiplizieren, dann abziehen." },
      { f: "Wofür braucht man das Kreuzprodukt?", a: "Vor allem für den Normalenvektor einer Ebene aus zwei Spannvektoren. Seine Länge ist außerdem der Flächeninhalt des Parallelogramms aus a und b, das Dreieck hat die Hälfte." },
      { f: "Kann mein Kind damit Hausaufgaben kontrollieren?", a: "Ja. Sie geben die Vektoren aus der Aufgabe ein, auch mit Brüchen oder Wurzeln, und sehen Formel, Einsetzen und Ergebnis. So lässt sich genau erkennen, in welcher Zeile ein Fehler steckt." },
    ],
  },

  winkel: {
    titel: "Winkel zwischen Vektoren berechnen: Skalarprodukt üben",
    beschreibung: "Skalarprodukt und Winkel üben: Winkel zwischen Vektoren, zwischen Geraden und zwischen Gerade und Ebene – erst schätzen, dann rechnen, mit Rechenweg.",
    kurz: "Erst schätzt du den Winkel am Bild, dann rechnest du ihn mit dem Skalarprodukt aus – das Werkzeug prüft und zeigt den Weg.",
    text: [
      "Das Skalarprodukt verbindet Rechnung und Geometrie: a · b = |a| · |b| · cos φ. Daraus folgt die Winkelformel cos φ = (a · b) / (|a| · |b|). Schwierig wird es bei der Frage, welcher Winkel gemeint ist – zwischen Vektoren bis 180°, zwischen Geraden höchstens 90°, und zwischen Gerade und Ebene rechnet man plötzlich mit dem Sinus.",
      "Das Werkzeug hat drei Übungen. Beim Skalarprodukt tippst du zuerst, ob der Winkel spitz, recht oder stumpf ist, und trägst dann a · b ein. Beim Vektorwinkel schätzt du den Winkel mit einem Regler, berechnest ihn und wählst, ob er zwischen Vektoren oder zwischen Geraden gesucht ist. Bei Gerade und Ebene entscheidest du dich zwischen Sinus- und Kosinus-Formel und berechnest α. Jede Eingabe wird geprüft, typische Fehler wie der Nebenwinkel werden benannt, und der Rechenweg zeigt alle Schritte bis zum arccos bzw. arcsin.",
      "Ein Bild zeigt den echten Winkel. Über „Ich hänge fest“ bekommst du gestufte Hinweise. Winkelberechnungen kommen in fast jeder Abituraufgabe zur analytischen Geometrie vor.",
    ],
    faq: [
      { f: "Wie berechnet man den Winkel zwischen zwei Vektoren?", a: "Mit cos φ = (a · b) / (|a| · |b|): Skalarprodukt ausrechnen, durch das Produkt der Längen teilen, dann arccos. Der Taschenrechner muss auf Gradmaß stehen." },
      { f: "Warum nimmt man beim Winkel zwischen Gerade und Ebene den Sinus?", a: "Von der Ebene kennt man nur den Normalenvektor n, und der steht senkrecht auf ihr. Der Winkel zu n ergänzt α zu 90°, deshalb gilt sin α = |u · n| / (|u| · |n|)." },
      { f: "Woran sieht mein Kind, ob es richtig gerechnet hat?", a: "Jedes Ergebnis wird sofort geprüft. Bei typischen Fehlern, etwa dem Nebenwinkel statt des Schnittwinkels, erklärt das Werkzeug genau diesen Fehler – nicht nur „falsch“." },
    ],
  },

  zweipunkte: {
    titel: "Geradengleichung aus zwei Punkten aufstellen",
    beschreibung: "Geradengleichung durch zwei Punkte im Raum: Stützvektor und Richtungsvektor bestimmen, auf zwei Wegen rechnen, im 3D-Bild sehen und eigene Lösung prüfen.",
    kurz: "Zwei Punkte eingeben – du siehst die Gerade im Raum und die Geradengleichung auf zwei Wegen.",
    text: [
      "Eine Gerade im Raum schreibt man als x = p + t · u. Der Stützvektor p zeigt auf einen Punkt der Geraden, der Richtungsvektor u gibt die Richtung an. Aus zwei Punkten A und B bekommst du beides: A als Stützpunkt und AB = B − A als Richtung. Verwirrend ist, dass es viele richtige Gleichungen für dieselbe Gerade gibt.",
      "Du trägst die Koordinaten von A und B ein und siehst die Gerade in einem 3D-Bild, das du mit Finger oder Maus drehen kannst. Darunter stehen zwei Wege: einmal mit Stützpunkt A und Richtung AB, einmal mit B und BA. Das Werkzeug zeigt, warum beide dieselbe Gerade beschreiben. Danach gibst du im Teil „Jetzt selbst“ eine eigene Geradengleichung ein. Das Werkzeug prüft, ob sie dieselbe Gerade ist, und sagt dir, ob die Richtung oder der Stützpunkt nicht passt.",
      "Wenn du nicht weiterkommst, gibt „Ich hänge fest“ gestufte Hinweise. Geradengleichungen sind die Grundlage für Lagebeziehungen und Abstände in der Kursstufe.",
    ],
    faq: [
      { f: "Wie stellt man eine Geradengleichung aus zwei Punkten auf?", a: "Einen Punkt als Stützvektor nehmen und den Verbindungsvektor als Richtung: g: x = A + t · (B − A). Welcher Punkt Stützpunkt ist, spielt keine Rolle." },
      { f: "Warum gibt es mehrere richtige Geradengleichungen?", a: "Jeder Punkt der Geraden darf Stützpunkt sein, und jedes Vielfache ≠ 0 des Richtungsvektors zeigt in dieselbe Richtung. Alle diese Gleichungen beschreiben dieselbe Gerade." },
      { f: "Wird die Lösung meines Kindes auch dann als richtig erkannt, wenn sie anders aussieht als im Buch?", a: "Ja. Das Werkzeug prüft, ob die eingegebene Gleichung dieselbe Gerade beschreibt. Ein anderer Stützpunkt oder ein Vielfaches des Richtungsvektors zählt als richtig." },
    ],
  },

  dreipunkte: {
    titel: "Ebenengleichung aus drei Punkten: Koordinatenform",
    beschreibung: "Ebene durch drei Punkte: Spannvektoren, Parameterform, Normalenvektor per Kreuzprodukt und Koordinatenform – drei Wege, mit 3D-Bild und Selbstkontrolle.",
    kurz: "Drei Punkte eingeben – du bekommst die Ebene in Parameterform und Koordinatenform, auf drei Wegen gerechnet.",
    text: [
      "Drei Punkte, die nicht auf einer Geraden liegen, legen genau eine Ebene fest. Die Parameterform liest du direkt ab: ein Punkt als Stützvektor, die Wege zu den beiden anderen als Spannvektoren. Für die Koordinatenform n₁x₁ + n₂x₂ + n₃x₃ = d brauchst du einen Normalenvektor – und genau dieser Schritt mit dem Kreuzprodukt kostet in Klausuren viele Punkte.",
      "Du gibst A, B und C ein und siehst die Punkte und die Ebene im drehbaren 3D-Bild. Das Werkzeug prüft zuerst, ob die Punkte überhaupt eine Ebene festlegen. Dann rechnet es drei Wege, je mit A, B oder C als Stützpunkt: Spannvektoren, Parameterform, Normalenvektor als Kreuzprodukt, Ansatz und Koordinatengleichung. Ein Vergleich zeigt, dass die drei Gleichungen Vielfache voneinander sind. Im Teil „Jetzt selbst“ trägst du deine eigene Koordinatengleichung ein; das Werkzeug erkennt auch Vielfache als richtig und sagt, ob der Normalenvektor oder d nicht stimmt.",
      "Mit der fertigen Ebene geht es direkt weiter in den Ebenen-Visualizer oder zu den Abständen.",
    ],
    faq: [
      { f: "Wie bestimmt man die Koordinatenform aus drei Punkten?", a: "Spannvektoren AB und AC bilden, Normalenvektor n = AB × AC berechnen, dann d = n · a mit dem Ortsvektor von A. Die Gleichung lautet n₁x₁ + n₂x₂ + n₃x₃ = d." },
      { f: "Was ist der Unterschied zwischen Parameterform und Koordinatenform?", a: "Die Parameterform beschreibt die Ebene mit Stützvektor und zwei Spannvektoren. Die Koordinatenform ist eine einzige Gleichung, aus der man den Normalenvektor direkt abliest." },
      { f: "Was passiert, wenn mein Kind drei Punkte auf einer Geraden eingibt?", a: "Das Werkzeug erkennt das, weil AB × AC dann der Nullvektor ist, und erklärt: Durch eine Gerade gehen unendlich viele Ebenen, die Ebene ist nicht eindeutig." },
    ],
  },

  ebenen: {
    titel: "Ebenen-Visualizer: Koordinatenform im 3D-Bild",
    beschreibung: "Ebenen in Koordinatenform im Raum drehen: a, b, c und d einstellen, Spurpunkte, Spurgeraden, Normalenvektor und Abstand zum Ursprung direkt ablesen.",
    kurz: "Stell a, b, c und d ein und sieh, wie sich die Ebene ax₁ + bx₂ + cx₃ = d im Raum kippt und verschiebt.",
    text: [
      "Eine Ebene in Koordinatenform ax₁ + bx₂ + cx₃ = d ist nur eine Gleichung – sie im Kopf als Fläche im Raum zu sehen, fällt vielen schwer. Dabei ist der Zusammenhang klar: a, b und c bilden den Normalenvektor und bestimmen die Neigung, d verschiebt die Ebene parallel.",
      "Im Ebenen-Visualizer stellst du a, b, c und d ein und drehst den Raum mit Finger oder Maus, zoomst hinein oder wählst eine feste Ansicht. Spurgeraden, Normalenvektor und ein Würfel zur Orientierung lassen sich einblenden. Daneben stehen die Eigenschaften der Ebene: Normalenvektor, Spurpunkte, Achsenabschnittsform, Abstand zum Ursprung und Winkel zur x₁x₂-Ebene. Ein Hinweis nennt besondere Lagen, etwa „parallel zur x₃-Achse“ oder „durch den Ursprung“. Beispiele und eine Zufallsebene laden typische Fälle.",
      "Mit derselben Ebene geht es weiter zu „Ebene vs. Ebene“ oder zu den Abständen. So übst du das räumliche Vorstellungsvermögen, das du für jede Aufgabe zur analytischen Geometrie in der Kursstufe brauchst.",
    ],
    faq: [
      { f: "Wie berechnet man die Spurpunkte einer Ebene?", a: "Zwei Koordinaten null setzen und die dritte ausrechnen: S₁(d/a | 0 | 0), S₂(0 | d/b | 0), S₃(0 | 0 | d/c). Ist ein Koeffizient 0, gibt es auf dieser Achse keinen Spurpunkt." },
      { f: "Was bedeutet es, wenn in der Koordinatenform ein Koeffizient 0 ist?", a: "Die Ebene ist parallel zur zugehörigen Achse, bei c = 0 also parallel zur x₃-Achse. Sind zwei Koeffizienten 0, ist sie parallel zu einer Koordinatenebene." },
      { f: "Hilft das Werkzeug, wenn meinem Kind das räumliche Vorstellen schwerfällt?", a: "Genau dafür ist es gedacht. Ihr Kind verändert eine Zahl und sieht sofort, wie die Ebene kippt oder sich verschiebt. Das Bild lässt sich frei drehen." },
    ],
  },

  geraden: {
    titel: "Lagebeziehung von Geraden: Punktprobe und windschief",
    beschreibung: "Lage von Geraden im Raum üben: Punktprobe, Gerade–Gerade (identisch, parallel, schneidend, windschief) und Gerade–Ebene – erst vermuten, dann rechnen.",
    kurz: "Erst vermutest du am drehbaren 3D-Bild, wie Punkt, Geraden und Ebene liegen – dann beweist die Rechnung es Schritt für Schritt.",
    text: [
      "Zwei Geraden im Raum können identisch, echt parallel, schneidend oder windschief sein. Windschief gibt es nur im Raum: nicht parallel und trotzdem kein gemeinsamer Punkt. Wer die Fälle nicht sauber trennt, rechnet schnell im Kreis – besonders beim Gleichsetzen mit zwei Parametern.",
      "Das Werkzeug hat drei Übungen. Bei der Punktprobe bewegst du einen Punkt mit dem Regler t auf der Geraden und vermutest, ob P darauf liegt. Bei Gerade–Gerade drehst du das 3D-Bild und tippst auf eine der vier Lagen. Bei Gerade–Ebene entscheidest du zwischen schneidend, parallel und enthalten. Danach zeigt die Rechnung, ob deine Vermutung stimmt: Richtungsvektoren vergleichen, Geraden gleichsetzen, zwei Zeilen lösen und die dritte prüfen, bei der Ebene u · n berechnen und einsetzen. Schnittpunkte werden ausgerechnet und im Bild markiert.",
      "Du kannst einen bestimmten Fall wählen oder dir einen zufälligen geben lassen. „Ich hänge fest“ hilft mit gestuften Hinweisen. Lagebeziehungen sind ein fester Bestandteil der Abituraufgaben zur analytischen Geometrie.",
    ],
    faq: [
      { f: "Wie prüft man, ob zwei Geraden windschief sind?", a: "Erst prüfen, ob die Richtungsvektoren Vielfache sind. Wenn nicht, die Geraden gleichsetzen, zwei Zeilen nach t und s lösen und in die dritte einsetzen. Passt sie nicht, sind die Geraden windschief." },
      { f: "Wie macht man eine Punktprobe?", a: "P = A + t · u ansetzen und jede Zeile nach t auflösen. Kommt in allen drei Zeilen dasselbe t heraus, liegt P auf der Geraden, sonst nicht." },
      { f: "Warum soll mein Kind erst vermuten und dann rechnen?", a: "Die Vermutung zwingt dazu, sich die Lage vorzustellen. Stimmt sie nicht mit der Rechnung überein, sieht Ihr Kind sofort, welche Zeile den Ausschlag gibt – das bleibt besser hängen als reines Nachrechnen." },
    ],
  },

  ebenevsebene: {
    titel: "Schnittgerade zweier Ebenen und Schnittwinkel",
    beschreibung: "Zwei Ebenen in Koordinatenform: Lage bestimmen (schneidend, parallel, identisch), Schnittgerade und Schnittwinkel berechnen – mit drehbarem 3D-Bild.",
    kurz: "Stell zwei Ebenen ein und sieh sofort, ob sie sich schneiden – mit Schnittgerade, Schnittwinkel und 3D-Bild.",
    text: [
      "Zwei Ebenen im Raum schneiden sich in einer Geraden, sind echt parallel oder identisch. Entscheidend sind die Normalenvektoren: Sind sie Vielfache voneinander, sind die Ebenen parallel oder gleich, sonst schneiden sie sich. Die Schnittgerade zu berechnen ist dann echte Rechenarbeit mit einem unterbestimmten Gleichungssystem.",
      "Du stellst beide Ebenen in Koordinatenform ein und siehst sie im 3D-Bild, das du drehen und zoomen kannst; die Grundebenen lassen sich einblenden. Das Werkzeug nennt die Lage und begründet sie über die Normalenvektoren. Schneiden sich die Ebenen, bekommst du die Schnittgerade: Die Richtung ist das Kreuzprodukt n₁ × n₂, der Stützpunkt entsteht, indem eine Koordinate 0 gesetzt und das übrige Gleichungssystem gelöst wird. Darunter steht der Schnittwinkel mit vollständiger Rechnung über die Normalenvektoren.",
      "Beispiele für jede Lage, auch eine senkrechte Ebene und die x₁x₂-Ebene, lassen sich mit einem Tipp laden. Aus dem Ebenen-Visualizer kannst du eine Ebene direkt als E₁ übernehmen. So vergleichst du deine eigene Rechnung aus dem Heft Schritt für Schritt.",
    ],
    faq: [
      { f: "Wie berechnet man die Schnittgerade zweier Ebenen?", a: "Eine Möglichkeit: Richtungsvektor u = n₁ × n₂ bilden, dann einen gemeinsamen Punkt suchen, indem man eine Koordinate 0 setzt und das restliche Gleichungssystem löst. Alternativ löst man das System mit einem Parameter." },
      { f: "Wie berechnet man den Schnittwinkel zweier Ebenen?", a: "Über die Normalenvektoren: cos α = |n₁ · n₂| / (|n₁| · |n₂|). Der Betrag im Zähler sorgt dafür, dass der spitze Winkel zwischen 0° und 90° herauskommt." },
      { f: "Kann mein Kind damit eigene Aufgaben aus dem Unterricht nachrechnen?", a: "Ja, beide Ebenengleichungen lassen sich frei einstellen. Ihr Kind sieht dann Lage, Schnittgerade und Schnittwinkel und kann die eigene Rechnung Schritt für Schritt vergleichen." },
    ],
  },

  abstaende: {
    titel: "Abstand Punkt–Ebene, Punkt–Gerade, windschiefe Geraden",
    beschreibung: "Abstände im Raum berechnen: Punkt, Gerade und Ebene in jeder Kombination – mit Hessescher Normalform, Lotfußpunkt, 3D-Bild und vollständigem Rechenweg.",
    kurz: "Wähle zwei Objekte – Punkt, Gerade oder Ebene – und du bekommst den Abstand mit 3D-Bild und Rechenweg.",
    text: [
      "Abstand heißt immer: kürzeste Verbindung, senkrecht gemessen. Trotzdem rechnet man je nach Kombination ganz anders – mit dem Lotfußpunkt beim Abstand Punkt–Gerade, mit der Hesseschen Normalform beim Abstand Punkt–Ebene, mit dem Kreuzprodukt bei windschiefen Geraden. Genau diese Vielfalt macht das Thema unübersichtlich.",
      "Du wählst für „von“ und „bis“ je einen Punkt, eine Gerade oder eine Ebene und trägst die Werte ein. Das Werkzeug deckt alle sechs Kombinationen ab und zeigt Bild und Rechnung: Länge des Verbindungsvektors, Lotbedingung und Lotfußpunkt, Hessesche Normalform, Vergleich der Richtungs- oder Normalenvektoren. Schneiden sich die Objekte, sagt es dir, warum der Abstand 0 ist. Bei Punkt–Gerade und Punkt–Ebene gibt es zusätzlich den Modus „Lotfußpunkt bestimmen“: Du wählst den richtigen Ansatz, trägst den Lotfußpunkt und die Länge des Lots ein und bekommst eine Rückmeldung. Das 3D-Bild lässt sich drehen, sodass du die kürzeste Verbindung wirklich siehst.",
      "„Ich hänge fest“ hilft mit gestuften Hinweisen zur gewählten Kombination. Abstandsberechnungen gehören zu den typischen Abituraufgaben zur analytischen Geometrie.",
    ],
    faq: [
      { f: "Wie berechnet man den Abstand eines Punktes von einer Ebene?", a: "Mit der Hesseschen Normalform: Für E: ax₁ + bx₂ + cx₃ = d und P(p₁ | p₂ | p₃) gilt d(P; E) = |a·p₁ + b·p₂ + c·p₃ − d| / √(a² + b² + c²)." },
      { f: "Wie berechnet man den Abstand windschiefer Geraden?", a: "Mit dem gemeinsamen Normalenvektor n = u × v der Richtungsvektoren: d = |AB · n| / |n|, wobei A und B die Stützpunkte der beiden Geraden sind." },
      { f: "Ist das Werkzeug eher zum Nachschlagen oder zum Üben?", a: "Beides. Im Rechenmodus sieht Ihr Kind zu jeder Kombination den vollständigen Weg. Im Modus „Lotfußpunkt bestimmen“ rechnet es selbst und bekommt eine Rückmeldung zu seiner Eingabe." },
    ],
  },

  /* ---------- Stochastik ---------- */

  kombinatorik: {
    titel: "Kombinatorik üben: Urnenmodell und Baumdiagramm",
    beschreibung: "Ziehen mit und ohne Zurücklegen, Zählmethode wählen (nᵏ, n!/(n − k)!, n über k) und Baumdiagramme beschriften – mit Pfadregel, Summenregel und Simulation.",
    kurz: "Du ziehst Kugeln aus der Urne, findest die passende Zählformel und beschriftest Baumdiagramme selbst.",
    text: [
      "Kombinatorik ist eine Frage von zwei Entscheidungen: Kommt es auf die Reihenfolge an? Darf sich etwas wiederholen? Wer diese Fragen richtig beantwortet, findet die Formel fast von selbst. Beim Urnenmodell kommt eine dritte Frage dazu: Wird zurückgelegt? Ohne Zurücklegen ändern sich die Wahrscheinlichkeiten nach jedem Zug.",
      "Das Werkzeug hat drei Übungen. Bei „Versuche durchführen“ ziehst du Kugeln mit oder ohne Zurücklegen, berechnest die Wahrscheinlichkeit für jeden Zug, wendest die Pfadregel an und entscheidest, ob die Binomialverteilung passt. Eine Simulation zieht 1000-mal. Bei „Zählmethode wählen“ bekommst du Aufgaben wie Ausschuss, Ämterwahl, Zahlencode oder Lotto, beantwortest die beiden Kernfragen und berechnest Anzahl und Wahrscheinlichkeit; ein kleiner Fall mit vier Elementen lässt sich zur Kontrolle aufzählen. Bei „Baumdiagramm aufbauen“ beschriftest du die Zweige selbst und rechnest mit Pfad- und Summenregel.",
      "Jede Eingabe wird geprüft, typische Denkfehler werden erklärt. Den fertigen Baum kannst du als Vier-Felder-Tafel weiterverwenden. So lernst du, Zählen und Wahrscheinlichkeit sauber zu trennen.",
    ],
    faq: [
      { f: "Wann rechnet man mit „n über k“ und wann mit n!/(n − k)!?", a: "„n über k“ zählt Auswahlen ohne Reihenfolge, etwa einen Ausschuss. n!/(n − k)! zählt geordnete Auswahlen ohne Wiederholung, etwa verschiedene Ämter. Ohne Reihenfolge teilt man durch k!." },
      { f: "Was ist der Unterschied zwischen Ziehen mit und ohne Zurücklegen?", a: "Mit Zurücklegen bleibt die Urne gleich, jeder Zug hat dieselbe Wahrscheinlichkeit. Ohne Zurücklegen fehlt die gezogene Kugel, Zähler und Nenner ändern sich – das ist keine Bernoulli-Kette." },
      { f: "Für welche Klassenstufe ist das Werkzeug geeignet?", a: "Für die Mittelstufe bis zum Abitur. Urnen und Baumdiagramme kommen schon vor der Oberstufe vor, die Zählformeln und die Abgrenzung zur Binomialverteilung braucht Ihr Kind in der Kursstufe." },
    ],
  },

  vierfelder: {
    titel: "Vierfeldertafel und bedingte Wahrscheinlichkeit",
    beschreibung: "Vierfeldertafel mit Anzahlen oder Prozent: bedingte Wahrscheinlichkeit mit Rechenweg, Baumdiagramm, umgekehrter Baum und Prüfung auf Unabhängigkeit.",
    kurz: "Du stellst die vier inneren Felder ein – Randsummen, Baumdiagramme und alle bedingten Wahrscheinlichkeiten rechnen sich live mit.",
    text: [
      "Die Vier-Felder-Tafel ordnet zwei Merkmale, etwa „krank – gesund“ und „Test positiv – negativ“. Schwierig ist nicht die Tafel selbst, sondern die bedingte Wahrscheinlichkeit: P_A(B) bezieht sich nur auf die Gruppe A, nicht auf alle. Genau hier passieren die meisten Fehler, besonders beim berühmten medizinischen Test.",
      "Du arbeitest wahlweise mit absoluten Häufigkeiten oder mit Wahrscheinlichkeiten in Prozent und stellst die inneren Felder ein. Die Randsummen ergänzen sich automatisch, und alle Werte rechnen sich live mit, sobald du ein Feld änderst. Für jede bedingte Wahrscheinlichkeit wählst du Ereignis und Bedingung; das Werkzeug markiert Schnittfeld und Randsumme in der Tafel und zeigt die Rechnung. Dazu siehst du das Einheitsquadrat, das Baumdiagramm und den umgekehrten Baum, der zum Satz von Bayes führt. Außerdem prüft es, ob die Merkmale stochastisch unabhängig sind.",
      "Fertige Beispiele wie Medizinischer Test, Sportverein oder Münze und Würfel lassen sich laden, die Merkmale kannst du umbenennen. „Ich hänge fest“ gibt gestufte Hinweise. Von hier geht es weiter zum Baumdiagramm-Training.",
    ],
    faq: [
      { f: "Wie berechnet man eine bedingte Wahrscheinlichkeit mit der Vierfeldertafel?", a: "P_A(B) = P(A ∩ B) / P(A): den Wert im Schnittfeld durch die Randsumme der Bedingung teilen. Man rechnet nur noch in der Zeile oder Spalte der Bedingung." },
      { f: "Woran erkennt man, ob zwei Ereignisse unabhängig sind?", a: "A und B sind stochastisch unabhängig, wenn P(A ∩ B) = P(A) · P(B) gilt – gleichwertig: P_A(B) = P(B). Das Wissen über A ändert dann nichts an B." },
      { f: "Warum ist das Beispiel mit dem medizinischen Test so wichtig?", a: "Es zeigt, wie stark sich P_A(B) und P_B(A) unterscheiden können: Selbst bei einem guten Test ist ein positives Ergebnis bei einer seltenen Krankheit oft kein sicherer Befund. Das ist auch außerhalb der Schule nützlich." },
    ],
  },

  erwartungswert: {
    titel: "Erwartungswert berechnen: faire Spiele und Einsatz",
    beschreibung: "Erwartungswert üben: Gewinnverteilung aufstellen, Nettogewinn und Auszahlung trennen, fairen Einsatz finden und mit Simulation vieler Spiele vergleichen.",
    kurz: "Du stellst die Gewinnverteilung auf, berechnest den Erwartungswert, findest den fairen Einsatz und prüfst alles per Simulation.",
    text: [
      "Der Erwartungswert ist der Durchschnitt, der sich auf lange Sicht pro Spiel einstellt: E(X) = x₁ · p₁ + x₂ · p₂ + … + xₙ · pₙ. Der häufigste Fehler ist nicht die Formel, sondern die Verwechslung von Auszahlung und Nettogewinn. Den Einsatz zahlst du immer, auch wenn du verlierst.",
      "Das Werkzeug hat drei Übungen mit Würfel, Glücksrad, Münzen und zwei Würfeln. Bei „Gewinnverteilung“ ergänzt du die fehlende Wahrscheinlichkeit, rechnest die Nettogewinne aus, berechnest E(X) und deutest das Ergebnis. Bei „Fairer Einsatz“ bestimmst du die erwartete Auszahlung und schiebst den Einsatz mit einem Regler, bis der erwartete Nettogewinn 0 € ist. Bei „Langfristig spielen“ vermutest du zuerst, was mit dem Durchschnitt passiert, und simulierst dann viele Spiele. Ein Verlauf zeigt, wie sich der durchschnittliche Nettogewinn dem Erwartungswert nähert.",
      "Jede Eingabe wird geprüft. Typische Fehler wie das einfache Mitteln ohne Gewichtung werden erkannt und erklärt. Der Erwartungswert begegnet dir von der Mittelstufe bis zur Binomialverteilung in der Kursstufe.",
    ],
    faq: [
      { f: "Wann ist ein Spiel fair?", a: "Wenn der erwartete Nettogewinn genau 0 ist. Der faire Einsatz ist dann gleich der erwarteten Auszahlung. In einzelnen Spielen kann man trotzdem gewinnen oder verlieren." },
      { f: "Was ist der Unterschied zwischen Auszahlung und Nettogewinn?", a: "Die Auszahlung ist das, was man ausgezahlt bekommt. Der Nettogewinn ist Auszahlung minus Einsatz und damit negativ, wenn nichts ausgezahlt wird." },
      { f: "Was lernt mein Kind durch die Simulation?", a: "Dass der Erwartungswert kein Versprechen für ein einzelnes Spiel ist, sondern ein Durchschnitt über sehr viele Spiele. Die Simulation macht sichtbar, wie stark kurze Spielserien schwanken." },
    ],
  },

  bernoulli: {
    titel: "Binomialverteilung: Bernoulli-Kette mit Simulation",
    beschreibung: "Bernoulli-Kette und Binomialverteilung: P(X = k), P(X ≤ k), P(X ≥ k) mit Rechenweg, Histogramm, Tabelle, Erwartungswert und Simulation bis 1000 Durchgänge.",
    kurz: "Stell n, p und das Ereignis ein – du bekommst Wahrscheinlichkeit, Rechenweg und Histogramm und kannst das Experiment live simulieren.",
    text: [
      "Eine Bernoulli-Kette besteht aus n gleichen, unabhängigen Versuchen mit Trefferwahrscheinlichkeit p. Die Anzahl der Treffer ist binomialverteilt: P(X = k) = (n über k) · pᵏ · (1 − p)ⁿ⁻ᵏ. Die eigentliche Hürde ist die Übersetzung aus dem Text: Heißt „mehr als 3“ nun X ≥ 3 oder X ≥ 4?",
      "Du stellst n bis 100 und p ein und wählst das Ereignis: genau k, höchstens k, mindestens k oder ein Intervall von a bis k. Das Werkzeug zeigt Wahrscheinlichkeit und Rechenweg, das Histogramm mit markiertem Bereich und auf Wunsch die Tabelle mit P(X = k), P(X ≤ k) und P(X ≥ k) wie im Tafelwerk. Dazu kommen Erwartungswert μ = n · p, Standardabweichung σ und die σ-Umgebung. Beim Experiment laufen die Versuche einzeln ab, oder du simulierst 10, 100 oder 1000 Durchgänge und vergleichst die relative Häufigkeit mit der Theorie.",
      "In der Übung „Textaufgabe → Kette einstellen“ bekommst du einen Aufgabentext und stellst n, p und Ereignis selbst ein; das Werkzeug sagt dir, was noch nicht passt. Die Binomialverteilung ist ein zentrales Thema der Kursstufe.",
    ],
    faq: [
      { f: "Wie berechnet man P(X ≥ k) bei der Binomialverteilung?", a: "Meist über das Gegenereignis: P(X ≥ k) = 1 − P(X ≤ k − 1). Die kumulierte Wahrscheinlichkeit P(X ≤ k − 1) liest man aus der Tabelle ab oder berechnet sie mit dem Taschenrechner." },
      { f: "Wann darf man mit der Binomialverteilung rechnen?", a: "Wenn die Versuchszahl n fest ist, jeder Versuch nur Treffer oder Niete kennt, die Versuche unabhängig sind und p bei jedem Versuch gleich bleibt – etwa beim Ziehen mit Zurücklegen." },
      { f: "Warum gibt es eine Simulation, wenn die Formel das Ergebnis schon liefert?", a: "Die Simulation zeigt Ihrem Kind, was eine Wahrscheinlichkeit bedeutet: Die relative Häufigkeit schwankt um den berechneten Wert und nähert sich ihm bei vielen Durchgängen. Das macht die Formel anschaulich." },
    ],
  },

  hypothesentest: {
    titel: "Hypothesentest üben: Ablehnungsbereich und Fehlerarten",
    beschreibung: "Binomialtest Schritt für Schritt: H₀ und H₁ aus dem Sachkontext, Testrichtung, Ablehnungsbereich, Entscheidung sowie Fehler 1. und 2. Art – mit Simulation.",
    kurz: "Vom Sachkontext zur Entscheidung: H₀ aufstellen, den Ablehnungsbereich finden und verstehen, welche Fehler passieren können.",
    text: [
      "Ein Hypothesentest entscheidet anhand einer Stichprobe, ob man einer Behauptung noch glaubt. Die Rechnung ist Binomialverteilung – schwierig ist alles drumherum: Welche Behauptung ist H₀? Liegt der Ablehnungsbereich links, rechts oder auf beiden Seiten? Und warum beweist „H₀ wird nicht verworfen“ gar nichts?",
      "Das Werkzeug hat drei Übungen. Bei „Test aufbauen“ liest du einen Sachkontext, etwa defekte Bauteile, eine Umfrage, einen Würfel oder ein Medikament, bestimmst H₀ und die Testrichtung, nennst die Verteilung unter H₀, suchst mit der Tabelle der kumulierten Wahrscheinlichkeiten den Ablehnungsbereich und formulierst die Entscheidung. Bei „Ablehnungsbereich“ verschiebst du die Grenze am Histogramm, bis der Bereich so groß wie möglich ist, ohne α zu überschreiten. Bei „Fehler verstehen“ berechnest du die Wahrscheinlichkeiten für den Fehler 1. und 2. Art und simulierst 1000 Tests mit einem selbst gewählten wahren p.",
      "Jeder Schritt wird geprüft und bei Fehlern erklärt; „Ich hänge fest“ gibt gestufte Hinweise. Hypothesentests sind ein Thema der Kursstufe und kommen im Abitur vor.",
    ],
    faq: [
      { f: "Wie bestimmt man den Ablehnungsbereich eines Hypothesentests?", a: "Unter der Annahme, dass H₀ gilt, sucht man den größten Bereich A mit P(X ∈ A) ≤ α. Bei einem rechtsseitigen Test also das kleinste g mit P(X ≥ g) ≤ α, beidseitig je α/2 pro Seite." },
      { f: "Was ist der Unterschied zwischen Fehler 1. Art und Fehler 2. Art?", a: "Fehler 1. Art: H₀ wird verworfen, obwohl H₀ wahr ist. Fehler 2. Art: H₀ wird nicht verworfen, obwohl H₀ falsch ist. Für den Fehler 2. Art braucht man einen konkreten wahren Wert p₁." },
      { f: "Mein Kind kann rechnen, verliert aber Punkte bei der Formulierung – hilft das?", a: "Ja. Das Werkzeug fragt Hypothesen, Testrichtung und Entscheidung einzeln ab und achtet auf die vorsichtige Formulierung: Nichtverwerfen ist kein Beweis für H₀. Genau dort gehen in Klausuren oft Punkte verloren." },
    ],
  },

  normalverteilung: {
    titel: "Normalverteilung verstehen: Glockenkurve, Φ, Sigma",
    beschreibung: "Normalverteilung: von der Binomialverteilung zur Glockenkurve, Wahrscheinlichkeit als Fläche, Standardisieren mit Φ, Sigma-Regeln und rückwärts rechnen.",
    kurz: "Entdecke in fünf Stationen, woher die Glockenkurve kommt, und übe dann zehn Aufgabentypen von Φ(z) bis zum Rückwärtsrechnen.",
    text: [
      "Bei stetigen Zufallsgrößen wie Körpergröße oder Füllmenge sind Wahrscheinlichkeiten Flächen unter der Glockenkurve. Ein einzelner Wert hat die Wahrscheinlichkeit 0. Gerechnet wird mit Standardisieren: z = (x − μ) / σ, dann Φ(z) ablesen. Viele verwechseln dabei die Höhe der Kurve mit einer Wahrscheinlichkeit oder teilen durch σ² statt durch σ.",
      "Im Modus „Entdecken“ gehst du fünf Stationen durch: vom Histogramm der Binomialverteilung zur Glocke, die Gaußsche Dichtefunktion mit Hochpunkt und Wendestellen bei μ ± σ, Wahrscheinlichkeit als Fläche, die Sigma-Regeln und das Rückwärtsrechnen mit Quantilen samt Näherung der Binomialverteilung. Jede Station hat eine Animation und ein Labor mit Reglern. Im Modus „Üben“ gibt es zehn Aufgabentypen, darunter Ablesen, Standardisieren, P(X ≤ x), P(X ≥ x), Intervalle, Quantile, σ bestimmen und Binomial ≈ Normal. Die Aufgaben sind in Schritte zerlegt, und typische Denkfehler bekommen eine eigene Rückmeldung.",
      "Auch die Taschenrechner-Befehle normalcdf und invNorm werden erklärt. Die Normalverteilung ist Stoff der Kursstufe und verbindet Binomialverteilung und Hypothesentest.",
    ],
    faq: [
      { f: "Wie berechnet man P(X ≤ x) bei der Normalverteilung?", a: "Standardisieren mit z = (x − μ) / σ und dann P(X ≤ x) = Φ(z) aus der Tabelle oder mit dem Taschenrechner ablesen. Für P(X ≥ x) rechnet man 1 − Φ(z)." },
      { f: "Was besagen die Sigma-Regeln?", a: "Bei einer Normalverteilung liegen etwa 68,3 % der Werte in μ ± σ, etwa 95,4 % in μ ± 2σ und etwa 99,7 % in μ ± 3σ. Werte außerhalb von μ ± 2σ gelten als auffällig." },
      { f: "Muss mein Kind die Herleitung der Glockenkurve können?", a: "Für die meisten Klausuren nicht. Die Stationen zeigen aber, woher Formel und Sigma-Regeln kommen. Wer das verstanden hat, wendet Φ und Standardisieren sicherer an, statt nur Rezepte abzuarbeiten." },
    ],
  },
};
