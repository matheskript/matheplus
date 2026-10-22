/* ======================================================================
   SEO-/KI-Texte der Werkzeuge: Grundlagen (Fundament, Gleichungen, Funktionen,
   Mittelstufe) – Stand 21.10.2026
   Format je Werkzeug-Id (Schlüssel aus werkzeuge.js) – siehe src/seo/index.js
   und die Vorlage texteAnalysis.js:
     titel        für <title>, höchstens 60 Zeichen
     beschreibung Meta-Description, 110–155 Zeichen
     kurz         ein Satz, sichtbar über dem Aufklapper „Was kann dieses Werkzeug?“
     text         2–3 Absätze, zusammen 150–250 Wörter, Schüler geduzt, konkret: was das Werkzeug kann
     faq          genau 3 Fragen; die dritte aus Elternsicht (gesiezt)
   Nur beschreiben, was das Werkzeug wirklich kann. Keine erfundenen Zahlen, Stimmen oder Siegel.
   ====================================================================== */
export const TEXTE_GRUNDLAGEN = {
  axiome: {
    titel: "Rechengesetze üben: Kommutativ-, Assoziativ-, Distributiv",
    beschreibung: "Die neun Axiome für Plus und Mal verstehen: Kommutativ-, Assoziativ- und Distributivgesetz, neutrale und inverse Elemente – erkennen, begründen, üben.",
    kurz: "Du lernst die neun Spielregeln für Plus und Mal kennen und begründest damit jeden Rechenschritt.",
    text: [
      "Brüche kürzen, Gleichungen lösen, ausmultiplizieren: Alles beruht auf neun Spielregeln für nur zwei Rechenarten. Kommutativ- und Assoziativgesetz, die neutralen Elemente 0 und 1, die Gegenzahl −a und der Kehrwert 1/a, dazu das Distributivgesetz als Brücke zwischen Plus und Mal. Viele Schüler wenden diese Regeln täglich an, ohne sie benennen zu können – und genau dort entstehen später Fehler.",
      "Im Teil „Entdecken“ tippst du jedes der neun Axiome an und siehst eine Probe mit Zahlen: links und rechts kommt dasselbe heraus. Du erfährst, warum Minus nur Plus mit der Gegenzahl ist und Geteilt nur Mal mit dem Kehrwert. In ausgewählten Rechnungen deckst du Schritt für Schritt auf, welches Axiom hinter jeder Zeile steckt. Ein Lernmodul in zehn Phasen führt bis zu ersten eigenen Beweisen wie a · 0 = 0.",
      "Im Teil „Üben“ erkennst du Gesetze an Zahlen und Termen, begründest Rechenschritte, bestimmst Inverse, schreibst Minus und Geteilt um, entlarvst verkleidete Nullen und Einsen, rechnest geschickt mit dem Distributivgesetz und klammerst aus. Jede Antwort wird sofort geprüft, typische Verwechslungen werden erklärt.",
    ],
    faq: [
      { f: "Was ist der Unterschied zwischen Kommutativgesetz und Assoziativgesetz?", a: "Das Kommutativgesetz erlaubt das Vertauschen: a + b = b + a. Das Assoziativgesetz erlaubt das Versetzen von Klammern: (a + b) + c = a + (b + c). Beide gelten für Plus und Mal, nicht für Minus und Geteilt." },
      { f: "Warum gilt das Kommutativgesetz nicht für Minus?", a: "Weil 8 − 3 = 5, aber 3 − 8 = −5 ist. Schreibst du 8 − 3 als 8 + (−3), darfst du wieder tauschen: (−3) + 8 = 5." },
      { f: "Bringt das meinem Kind auch etwas für die normalen Klassenarbeiten?", a: "Ja. Wer die Rechengesetze sicher kennt, macht weniger Vorzeichen- und Klammerfehler beim Umformen, Ausmultiplizieren und Kürzen. Die Übungen trainieren genau diese Schritte an Zahlen und Termen." },
    ],
  },

  zahlenraeume: {
    titel: "Zahlenbereiche ℕ, ℤ, ℚ, ℝ verstehen und üben",
    beschreibung: "Natürliche, ganze, rationale und reelle Zahlen: warum es ℤ, ℚ und ℝ gibt, Zahlen einordnen, Abgeschlossenheit prüfen und √2 ist irrational beweisen.",
    kurz: "Du reist von ℕ über ℤ und ℚ bis ℝ und siehst, warum jeder neue Zahlenbereich nötig wird.",
    text: [
      "Mit natürlichen Zahlen kannst du addieren und multiplizieren, ohne ℕ zu verlassen. Aber 3 − 8 hat dort kein Ergebnis, 3 : 8 auch nicht, und x² = 2 schon gar nicht. Genau deshalb gibt es die ganzen, die rationalen und die reellen Zahlen. Wer diesen Aufbau versteht, ordnet Zahlen sicher ein und weiß, welche Gleichung in welchem Zahlenbereich lösbar ist.",
      "Im Teil „Entdecken“ gehst du die Reise in Stationen durch. Jede Station hat eine Erkläranimation, einen Tester „Bleibt das Ergebnis drin?“ für die Abgeschlossenheit und ein Merke. Bei ℝ führt dich der Widerspruchsbeweis „√2 ist irrational“ Zeile für Zeile, dazu siehst du Näherungsbrüche für √2. Zum Schluss fasst ein Mengenbild zum Antippen alles zusammen.",
      "Im Teil „Üben“ ordnest du Zahlen ein, prüfst Elemente und Abgeschlossenheit, findest die Rechnung, die aus einem Zahlenbereich hinausführt, verwandelst Dezimalzahlen in Brüche und entscheidest, ob eine Wurzel rational ist. Jede Antwort wird sofort geprüft und erklärt.",
    ],
    faq: [
      { f: "Was ist der Unterschied zwischen rationalen und reellen Zahlen?", a: "Rationale Zahlen lassen sich als Bruch p/q mit ganzen Zahlen schreiben, ihre Dezimaldarstellung bricht ab oder ist periodisch. Reelle Zahlen umfassen zusätzlich die irrationalen Zahlen wie √2 oder π." },
      { f: "Wie beweist man, dass √2 irrational ist?", a: "Durch Widerspruch: Angenommen, √2 = p/q mit vollständig gekürztem Bruch. Dann ist p² = 2q², also p gerade, daraus folgt q gerade – das widerspricht dem vollständigen Kürzen." },
      { f: "Ist das Thema für mein Kind schon in der Unterstufe sinnvoll?", a: "Die Stationen ℕ und ℤ passen bereits zur Unterstufe, ℚ und ℝ zur Mittelstufe. Ihr Kind kann mit den ersten Stationen beginnen und den Rest später ergänzen, wenn Wurzeln im Unterricht drankommen." },
    ],
  },

  mengenlogik: {
    titel: "Mengen und Logik üben: Intervalle, Aussagen, Folgern",
    beschreibung: "Mengen verknüpfen, Intervalle schreiben, Wahrheitstafeln füllen, Implikationen prüfen: Schnittmenge, Vereinigung, Komplement, Quantoren, Gegenbeispiel.",
    kurz: "Du lernst die Sprache der Mathematik: Mengen, Intervalle, Aussagen und richtiges Folgern.",
    text: [
      "Lösungsmengen, Definitionsbereiche, „genau dann, wenn“: Mathematik spricht in Mengen und Aussagen. Wer ∩ und ∪ verwechselt oder nicht weiß, wann eine Folgerung gilt, verliert Punkte, obwohl die Rechnung stimmt. Das Werkzeug macht diese Sprache sicher, Schritt für Schritt und mit vielen kleinen Beispielen.",
      "Der Lernweg hat sechs Kapitel: Mengen und Elemente, Mengenoperationen, Intervalle, Aussagen und Verknüpfungen, Folgern und Beweisen sowie ein gemischtes Kapitel. Jede Einführung gibt es in drei Stufen – Stufe 1 zum Einstieg, Stufe 2 wie im Unterricht, Stufe 3 zur Vertiefung. In Laboren baust du eine Menge, verknüpfst zwei Mengen im Mengenbild, ziehst Intervallgrenzen auf der Zahlengeraden, füllst Wahrheitstafeln und prüfst Folgerungen.",
      "In den Übungen entscheidest du über Element oder nicht, schreibst Mengen aufzählend und beschreibend, bildest Schnitt, Vereinigung, Differenz und Komplement, schreibst Intervalle und schneidest sie. Dazu kommen Wahrheitswerte, Umkehrungen, notwendige und hinreichende Bedingungen, Verneinungen und Quantoren. Jede Antwort wird sofort geprüft. Liegst du daneben, zeigt dir eine kurze Erklärung, woran es lag – zum Beispiel, dass für eine Allaussage schon ein einziges Gegenbeispiel genügt.",
    ],
    faq: [
      { f: "Was ist der Unterschied zwischen Schnittmenge und Vereinigungsmenge?", a: "Die Schnittmenge A ∩ B enthält die Elemente, die in beiden Mengen liegen. Die Vereinigungsmenge A ∪ B enthält alle Elemente, die in mindestens einer der beiden Mengen liegen." },
      { f: "Wann ist eine Implikation A ⇒ B falsch?", a: "Nur dann, wenn A wahr und B falsch ist. In allen anderen Fällen ist A ⇒ B wahr – auch wenn A falsch ist. Um eine Allaussage zu widerlegen, genügt ein einziges Gegenbeispiel." },
      { f: "Braucht mein Kind Mengenlehre überhaupt noch?", a: "Ja, wenn auch selten als eigenes Kapitel. Lösungsmengen, Intervalle und Definitionsbereiche begleiten Ihr Kind von der Mittelstufe bis zum Abitur. Wer die Schreibweisen sicher beherrscht, kann sich auf die eigentliche Rechnung konzentrieren." },
    ],
  },

  funktionen: {
    titel: "Funktionen Grundlagen: Definitionsbereich, Umkehrfunktion",
    beschreibung: "Funktionsbegriff, Potenz- und Wurzelfunktionen, Umkehrfunktion und Verkettung verstehen – plus eigenes Training für Definitions- und Wertebereich.",
    kurz: "Du lernst den Funktionsbegriff, Potenz- und Wurzelfunktionen, Umkehrfunktion und Verkettung – mit Laboren und Übungen.",
    text: [
      "Bevor du ableitest oder integrierst, musst du wissen, was eine Funktion überhaupt ist: eine Zuordnung, die jedem x genau ein y zuordnet. Darauf bauen Potenz- und Wurzelfunktionen, Umkehrfunktion und Verkettung auf. Besonders der Definitions- und Wertebereich wird oft unterschätzt – dabei wird er in fast jeder Klausur abgefragt.",
      "Der Lernweg hat sieben Kapitel: Funktionsbegriff, Potenzfunktionen, Wurzelfunktionen, Umkehrfunktion, Verkettung, Definitions- und Wertebereich als eigenes Training und ein gemischtes Kapitel. Jede Einführung gibt es in drei Stufen. In Laboren änderst du die Hochzahl einer Potenzfunktion, siehst √x aus der halben Parabel entstehen, spiegelst einen Punkt an y = x und schickst x durch eine Verkettungsmaschine.",
      "Die Übungen reichen von „Funktion oder nicht?“ über Funktionswerte, Symmetrie und Verhalten im Unendlichen bis zu Wurzelgleichungen, dem Term von f⁻¹ und dem Aufstellen von f ∘ g. Beim Definitionsbereich übst du Wurzeln, Brüche und Logarithmen, beim Wertebereich Scheitel, Asymptoten und Sinus. Jede Antwort wird sofort geprüft.",
    ],
    faq: [
      { f: "Wie bestimmt man den Definitionsbereich einer Funktion?", a: "Du suchst die verbotenen Stellen: Ein Nenner darf nicht 0 werden, unter einer Quadratwurzel darf keine negative Zahl stehen, und das Argument eines Logarithmus muss größer als 0 sein." },
      { f: "Wie bildet man die Umkehrfunktion?", a: "Du löst y = f(x) nach x auf und vertauschst dann x und y. Der Graph von f⁻¹ ist der an y = x gespiegelte Graph von f, Definitions- und Wertebereich tauschen die Rollen." },
      { f: "Ist das Werkzeug eher für die Mittel- oder die Oberstufe gedacht?", a: "Für beide. Funktionsbegriff und Potenzfunktionen passen zur Mittelstufe, Umkehrfunktion und Verkettung zur Oberstufe. Durch die drei Stufen jeder Einführung findet Ihr Kind den passenden Einstieg." },
    ],
  },

  textaufgaben: {
    titel: "Textaufgaben übersetzen: vom Text zur Gleichung",
    beschreibung: "Textaufgaben lösen lernen: jede Information in eine Bedingung übersetzen – von Rechenwörtern in Klasse 5 bis zur Steckbriefaufgabe im Abitur.",
    kurz: "Erst übersetzen, dann rechnen: Du verwandelst jede Information im Text in eine mathematische Bedingung.",
    text: [
      "Bei Textaufgaben scheitern die meisten nicht am Rechnen, sondern am Übersetzen. „Das Dreifache, vermindert um 4“, „höchstens drei Treffer“, „Hochpunkt bei H(6 | 4)“ – jede dieser Stellen ist eine Bedingung. Wer sie sauber aufschreibt, hat die halbe Aufgabe gelöst.",
      "Das Werkzeug hat die Modi „Entdecken“ und „Trainieren“. In „Entdecken“ findest du die Leitidee, ein Beispiel zum Antippen, die Übersetzungskette, die häufigsten Übersetzungsfallen und ein Übersetzungs-Wörterbuch. In „Trainieren“ wählst du eines von acht Themen, von Rechenwörtern und Sachaufgaben über Gleichungssysteme und Funktionen bis zu Stochastik-Signalwörtern, Steckbriefaufgaben, Analysis im Sachkontext und Vektoren. Dazu kommen drei Stufen: Erkennen (Übersetzung auswählen), Übersetzen (Bedingung selbst tippen) und Ganze Aufgabe (alle Bedingungen selbst finden). Deine Eingabe wird mathematisch geprüft.",
      "Im Reiter „Mathilda“ fotografierst du eine Aufgabe aus deinem Buch oder tippst sie ab. Mathilda, die KI der App, übersetzt jede Stelle und erklärt, warum. Im Modus „Erst selbst versuchen“ bleiben die Übersetzungen verdeckt, bis du es probiert hast.",
    ],
    faq: [
      { f: "Wie übersetzt man „höchstens“ und „mindestens“ in der Stochastik?", a: "„Höchstens 3“ heißt P(X ≤ 3), „mindestens 3“ heißt P(X ≥ 3). „Mehr als 3“ ist P(X > 3), also P(X ≥ 4) bei ganzzahligem X." },
      { f: "Wie viele Bedingungen brauche ich für eine Textaufgabe?", a: "So viele, wie es Unbekannte gibt. Eine Gleichung mit zwei Unbekannten reicht nicht – dann fehlt noch eine Information im Text." },
      { f: "Ab welcher Klasse kann mein Kind das Werkzeug nutzen?", a: "Ab Klasse 5. Die Themen sind nach Klassenstufen sortiert, von Rechenwörtern in der Unterstufe bis zu Steckbriefaufgaben im Abitur. Ihr Kind wählt einfach die passende Klasse aus." },
    ],
  },

  geradengleichung: {
    titel: "Geradengleichung aufstellen: y = m·x + c aus zwei Punkten",
    beschreibung: "Geradengleichung y = m·x + c bestimmen: Steigung aus zwei Punkten berechnen, y-Achsenabschnitt aus Punkt und Steigung – Schritt für Schritt mit Schaubild.",
    kurz: "Du stellst y = m·x + c aus zwei Punkten oder aus Punkt und Steigung auf – Schritt für Schritt mit Schaubild.",
    text: [
      "Eine Gerade ist durch zwei Zahlen festgelegt: die Steigung m und den y-Achsenabschnitt c. Klingt einfach, doch in der Praxis passieren immer dieselben Fehler. Zähler und Nenner werden vertauscht, ein Vorzeichen geht verloren, oder bei c wird m · x vergessen. Das Werkzeug zeigt dir, wo genau es hakt.",
      "Der Geradentrainer hat drei Teile. In „Grundlagen“ verschiebst du die Gerade mit Reglern für m und c und siehst, dass jeder Punkt auf der Geraden y = m·x + c erfüllt. In „Zwei Punkte“ wählst du P und Q – über ein kleines Zahlenfeld, durch Ziehen im Schaubild oder per Würfel. Dann berechnest du die Steigung mit dem Steigungsdreieck, danach c und zum Schluss die Gleichung. In „Punkt und Steigung“ sind ein Punkt und die Steigung gegeben, und du bestimmst c. Im Modus „Rechnen“ steht der ganze Rechenweg als Musterlösung da und läuft mit, wenn du die Punkte änderst.",
      "Im Modus „Trainieren“ hat jeder Schritt ein eigenes Eingabefeld. Bei typischen Fehlern bekommst du einen gezielten Hinweis, etwa „Zähler und Nenner sind vertauscht“. Wenn du nicht weiterkommst, zeigt „Lösung zeigen“ den Rechenweg für genau diesen Schritt.",
    ],
    faq: [
      { f: "Wie berechnet man die Steigung aus zwei Punkten?", a: "Mit m = (y_Q − y_P) / (x_Q − x_P), also Höhenunterschied durch Breitenunterschied. Wichtig: In Zähler und Nenner dieselbe Reihenfolge, beide Male Q minus P." },
      { f: "Wie bestimme ich den y-Achsenabschnitt c?", a: "Du setzt einen Punkt P und die Steigung m in y = m·x + c ein und löst nach c auf: c = y_P − m · x_P." },
      { f: "In welcher Klasse lernt mein Kind lineare Funktionen?", a: "In der Mittelstufe, in Baden-Württemberg meist in Klasse 7 oder 8. Geraden bleiben bis zum Abitur wichtig, zum Beispiel für Tangenten in der Analysis." },
    ],
  },

  parabeln: {
    titel: "Parabeln üben: Scheitelform, Normalform, Nullstellen",
    beschreibung: "Quadratische Funktionen trainieren: Scheitelpunkt ablesen, Normalform in Scheitelform umformen, Nullstellen mit abc-Formel – mit Graph und Zielgraph.",
    kurz: "Du trainierst Normalform, Scheitelform und Nullstellen – mit Graph und Aufgabe auf einem Bildschirm.",
    text: [
      "Eine Parabel lässt sich auf verschiedene Arten schreiben, und jede Form verrät etwas anderes: Die Normalform ax² + bx + c zeigt den y-Achsenabschnitt, die Scheitelform a(x − d)² + e den Scheitel, die Produktform die Nullstellen. Schwierig wird es beim Wechseln zwischen den Formen.",
      "Der Parabeltrainer hat die Modi „Entdecken“ und „Trainieren“. Im Trainieren wählst du ein Thema und einen Aufgabentyp. Bei der Normalform findest du den passenden Graphen, liest ab oder setzt ein. Bei der Scheitelform liest du den Scheitel ab und rechnest zwischen Normal- und Scheitelform um. Bei den Nullstellen bestimmst du die Anzahl und nutzt die Produktform, die abc-Formel oder Wege ohne Formel. Es gibt drei Stufen und Runden zu zehn Aufgaben mit Punkten. Beim Zielgraph stellst du die Parameter so ein, dass deine Parabel auf dem vorgegebenen Graphen liegt.",
      "Als Ausblick gibt es zwei weitere Themen: den Brennpunkt der Parabel mit Tangente und Normale sowie die Schnittpunkte von Parabel und Gerade.",
    ],
    faq: [
      { f: "Wie forme ich die Normalform in die Scheitelform um?", a: "Mit quadratischer Ergänzung: a ausklammern, die Hälfte des Faktors vor x quadrieren, addieren und wieder abziehen, dann die binomische Formel anwenden. Beispiel: x² − 4x + 1 = (x − 2)² − 3, Scheitel S(2 | −3)." },
      { f: "Wie viele Nullstellen kann eine Parabel haben?", a: "Zwei, eine oder keine. Das entscheidet die Diskriminante b² − 4ac: positiv bedeutet zwei, null eine und negativ keine Nullstelle." },
      { f: "Kann mein Kind mit dem Trainer für eine Klassenarbeit üben?", a: "Ja. Ihr Kind wählt gezielt das Thema, das in der Arbeit drankommt, und die passende Stufe. Jede Eingabe wird sofort geprüft, und am Ende einer Runde sieht es, wie viele Aufgaben ohne Fehler gelungen sind." },
    ],
  },

  sinus: {
    titel: "Sinusfunktion verstehen: Amplitude, Periode, Verschiebung",
    beschreibung: "Allgemeine Sinusfunktion f(x) = a · sin(b · (x − c)) + d: Parameter einstellen, bis der Graph passt – mit Amplitude, Periode, Ableitung und Nullstellen.",
    kurz: "Du stellst a, b, c und d so ein, dass dein Sinusgraph genau auf dem Zielgraphen liegt.",
    text: [
      "Die allgemeine Sinusfunktion f(x) = a · sin(b · (x − c)) + d hat vier Parameter, und jeder verändert den Graphen auf eine eigene Art: a streckt nach oben und unten, b staucht in x-Richtung, c verschiebt nach links oder rechts, d hebt die Mittellinie. Schwer wird es, wenn du sie aus einem Graphen ablesen sollst.",
      "Im Modus „Trainieren“ ist ein goldener Zielgraph vorgegeben. Du veränderst a, b, c und d mit Plus und Minus, bis dein Graph genau darauf liegt. Die App erkennt den Treffer sofort. Die Verschiebung c kannst du wahlweise als Vielfaches von π einstellen. Kommst du nicht weiter, zeigt dir „Lösung zeigen“ eine mögliche Lösung. Im Modus „Entdecken“ probierst du ohne Ziel aus, was jeder Parameter bewirkt.",
      "Zu deiner Funktion siehst du Amplitude, Periode und Ableitung mit Kettenregel. Die Nullstellen werden im Bereich −2π ≤ x ≤ 2π berechnet. Auf Wunsch blendest du f′ als zweiten Graphen ein.",
    ],
    faq: [
      { f: "Wie berechnet man die Periode einer Sinusfunktion?", a: "Mit p = 2π / |b|. Ist zum Beispiel b = 2, dann ist die Periode π – der Graph schwingt doppelt so schnell wie sin(x)." },
      { f: "Wie lese ich Amplitude und Mittellinie aus dem Graphen ab?", a: "Mittellinie d = (Hochwert + Tiefwert) / 2, Amplitude |a| = (Hochwert − Tiefwert) / 2. Pendelt der Graph zwischen 1 und 5, ist d = 3 und |a| = 2." },
      { f: "Wann kommt die allgemeine Sinusfunktion im Unterricht dran?", a: "In Baden-Württemberg in der Regel ab Klasse 10, vertieft in der Kursstufe. Dort wird sie auch abgeleitet und zur Beschreibung periodischer Vorgänge genutzt." },
    ],
  },

  wachstum: {
    titel: "Exponentielles Wachstum und Logarithmus üben",
    beschreibung: "Exponentielles Wachstum mit Logarithmen: Wachstumsfaktor aus Messwerten, Verdopplungs- und Halbwertszeit berechnen, Zielwert erreichen – mit Rechenweg.",
    kurz: "Du stellst exponentielle Modelle aus Messwerten auf und bestimmst mit Logarithmen unbekannte Zeiten.",
    text: [
      "Exponentiell heißt: In gleichen Zeitabständen wird mit demselben Faktor multipliziert. Daraus entsteht N(t) = N₀ · aᵗ. Schwierig wird es, wenn die Zeit gesucht ist, denn dann steht die Unbekannte im Exponenten und du brauchst den Logarithmus. Typische Fehler: Prozent und Faktor werden verwechselt, oder eine Halbierung wird gleichmäßig auf die Tage verteilt.",
      "Das Werkzeug hat drei Übungen. In „Modell aus Messwerten“ prüfst du an einer Tabelle, ob lineares oder exponentielles Wachstum vorliegt. Dann bestimmst du Anfangswert, Wachstumsfaktor, prozentuale Änderung und k = ln a, entscheidest zwischen diskret und kontinuierlich und erstellst eine Prognose. In „Verdopplung und Halbwertszeit“ löst du aᵀ = 2 oder aᵀ = ½ mit Logarithmen und schließt umgekehrt von der Halbwertszeit auf den Faktor. In „Zielwert erreichen“ isolierst du die Potenz, prüfst, ob du logarithmieren darfst, berechnest t und wählst den passenden Antwortsatz.",
      "Die Sachkontexte reichen von Bakterien und Zinsen bis zu Medikamenten und radioaktivem Zerfall. Bei falschen Eingaben erklärt das Werkzeug den typischen Denkfehler, und der Graph erscheint, sobald die ersten Schritte gelöst sind.",
    ],
    faq: [
      { f: "Wie berechnet man die Verdopplungszeit?", a: "Aus aᵀ = 2 folgt T = ln 2 / ln a. Bei einem Wachstum um 5 % pro Jahr ist a = 1,05 und T = ln 2 / ln 1,05 ≈ 14,2 Jahre." },
      { f: "Was ist der Unterschied zwischen Wachstumsfaktor und Wachstumsrate?", a: "Der Faktor a ist die Zahl, mit der pro Zeiteinheit multipliziert wird. Die prozentuale Änderung ist p = (a − 1) · 100 %. Ein Faktor von 0,9 bedeutet also eine Abnahme um 10 %." },
      { f: "Hilft das Werkzeug auch bei Zinsaufgaben?", a: "Ja. Ein Sachkontext ist jährliche Verzinsung. Ihr Kind lernt dabei auch, warum Zinsen ein diskretes Modell sind: Das Kapital ändert sich nur am Jahresende, nicht zwischendurch." },
    ],
  },

  bruchwurzel: {
    titel: "Bruchterme und Wurzeln üben: kürzen, vereinfachen",
    beschreibung: "Bruchterme kürzen und Bruchgleichungen lösen, Quadratwurzeln teilweise ziehen, multiplizieren und den Nenner rational machen – mit den typischen Fallen.",
    kurz: "Du trainierst Bruchterme und das Rechnen mit Quadratwurzeln – samt den Fallen, in die fast jeder einmal tappt.",
    text: [
      "An Brüchen und Wurzeln hängt in der Mittelstufe fast jede Rechnung. Gleichzeitig lauern hier die hartnäckigsten Fehler: aus Summen kürzen, eine Lösung außerhalb der Definitionsmenge übersehen oder √(9 + 16) als 3 + 4 rechnen. Dieses Werkzeug bündelt beide Themen in einem Trainer.",
      "Im Modus „Brüche“ bestimmst du Definitionsmengen, auch mit x² im Nenner. Du kürzt Bruchterme, addierst mit dem Hauptnenner und löst Bruchgleichungen. Eine eigene Aufgabe zeigt die Falle, dass eine berechnete Lösung nicht in D liegt. Im Modus „Wurzeln“ gibt es sechs Aufgabentypen: Wurzel ziehen, teilweise Wurzel ziehen, Wurzeln multiplizieren, die Falle √(a² + b²), Nenner wurzelfrei machen und die Wurzel aus einem Bruch. Du wählst einen Typ oder lässt mischen.",
      "Jede Aufgabe ist in kleine Schritte zerlegt, die du nacheinander löst. Bei einer falschen Antwort erklärt das Werkzeug, welcher Denkfehler dahintersteckt. Ein Aufklapper „Kurz erklärt“ fasst die wichtigsten Regeln zusammen, damit du sie vor der nächsten Aufgabe schnell nachlesen kannst.",
    ],
    faq: [
      { f: "Wie zieht man teilweise die Wurzel?", a: "Du zerlegst die Zahl unter der Wurzel in eine Quadratzahl mal einen Rest und ziehst die Wurzel aus der Quadratzahl: √50 = √(25 · 2) = 5√2." },
      { f: "Warum ist √(a + b) nicht gleich √a + √b?", a: "Weil die Wurzel nur bei Produkten und Brüchen aufgeteilt werden darf. Gegenbeispiel: √(9 + 16) = √25 = 5, aber √9 + √16 = 3 + 4 = 7." },
      { f: "Für welche Klassenstufe ist das Werkzeug gedacht?", a: "Für die Mittelstufe. Quadratwurzeln und Bruchterme kommen in Baden-Württemberg typischerweise in Klasse 8 und 9 dran und werden danach in jeder Klassenstufe gebraucht." },
    ],
  },

  bruchterme: {
    titel: "Bruchgleichungen lösen: Definitionsmenge und Kürzen",
    beschreibung: "Bruchterme und Bruchgleichungen mit x im Nenner: Definitionsmenge bestimmen, nur Faktoren kürzen, Hauptnenner finden und Scheinlösungen erkennen.",
    kurz: "Du bestimmst Definitionsmengen, kürzt Bruchterme richtig und löst Bruchgleichungen ohne Scheinlösung.",
    text: [
      "Sobald x im Nenner steht, gelten zwei neue Regeln: Der Nenner darf nie 0 werden, und gekürzt werden nur Faktoren, niemals einzelne Summanden. Wer das vergisst, bekommt Scheinlösungen, also Zahlen, die beim Rechnen herauskommen, aber gar nicht eingesetzt werden dürfen.",
      "Im Modus „Entdecken“ vergleichst du den Bruchterm (x² − p²) / (x − p) mit dem gekürzten Term x + p. Für fast jedes x stimmen die Werte überein. Nur bei x = p ist der Bruchterm nicht definiert, und im Graphen entsteht eine Lücke. So siehst du, warum die Definitionsmenge auch nach dem Kürzen wichtig bleibt.",
      "Im Modus „Trainieren“ gibt es sechs Aufgabentypen: Definitionsmenge, Definitionsmenge mit x², Kürzen, Addieren mit Hauptnenner, Bruchgleichung lösen und die Falle „Lösung prüfen“. Jede Aufgabe ist in Schritte zerlegt, etwa Nenner zerlegen, ausgeschlossene Zahl bestimmen, Nenner beseitigen und lösen. Bei falschen Antworten bekommst du einen Hinweis auf den typischen Fehler, zum Beispiel wenn aus einer Summe gekürzt wurde.",
    ],
    faq: [
      { f: "Wie bestimmt man die Definitionsmenge eines Bruchterms?", a: "Du setzt jeden Nenner gleich 0 und löst. Diese Zahlen schließt du aus. Bei 3 / (x² − 4) sind das x = 2 und x = −2, also D = ℝ \\ {−2; 2}." },
      { f: "Was ist eine Scheinlösung bei einer Bruchgleichung?", a: "Eine Zahl, die beim Umformen herauskommt, aber nicht in der Definitionsmenge liegt. Eingesetzt würde ein Nenner 0. Deshalb wird jede Lösung am Ende mit D verglichen." },
      { f: "Warum verliert mein Kind bei Bruchgleichungen so oft Punkte?", a: "Meist wegen zweier Fehler: Es wird aus Summen gekürzt, oder die Lösung wird nicht mit der Definitionsmenge geprüft. Beide Fehler trainiert das Werkzeug gezielt, mit eigener Aufgabe für die Falle." },
    ],
  },

  terme: {
    titel: "Terme vereinfachen: Ausklammern, binomische Formeln",
    beschreibung: "Terme vereinfachen, ausklammern, binomische Formeln und Potenzgesetze üben: Term eintippen, die App prüft Gleichwertigkeit und Form, mit Hinweisen.",
    kurz: "Du tippst deinen Term ein, und die App prüft, ob er gleichwertig ist und in der verlangten Form steht.",
    text: [
      "Terme sind das Handwerkszeug unter allen Gleichungen. Klammern auflösen, gleichartige Terme zusammenfassen, ausklammern, binomische Formeln erkennen, Potenzen zusammenfassen und Brüche kürzen – wer hier unsicher ist, verliert später in jeder Aufgabe Punkte, auch in der Oberstufe.",
      "Das Werkzeug hat fünf Übungen: Terme vereinfachen, Ausklammern, Binomische Formeln (wahlweise ausmultiplizieren oder faktorisieren), Potenzgesetze und Bruchterme. Du tippst dein Ergebnis selbst ein, zum Beispiel 3x(x+2) oder x^9. Die App zeigt, wie sie deine Eingabe gelesen hat, und prüft zwei Dinge: Ist dein Term gleichwertig zur Aufgabe? Und steht er wirklich in der verlangten Form, also vollständig vereinfacht, ausgeklammert oder gekürzt?",
      "Stimmt etwas nicht, bekommst du Hinweise in Stufen, erst allgemein, dann genauer. Ab dem zweiten Versuch siehst du zusätzlich eine Probe mit einer Zahl für x, die Aufgabenterm und deinen Term vergleicht. Die Lösung erscheint nur, wenn du sie ausdrücklich anforderst. So bleibt das Denken bei dir, und du merkst dir die Regeln deutlich besser.",
    ],
    faq: [
      { f: "Wie lauten die drei binomischen Formeln?", a: "(a + b)² = a² + 2ab + b², (a − b)² = a² − 2ab + b² und (a + b)(a − b) = a² − b²." },
      { f: "Wie prüfe ich, ob zwei Terme gleichwertig sind?", a: "Setze dieselbe Zahl für x in beide Terme ein. Kommt etwas Verschiedenes heraus, sind sie nicht gleichwertig. Stimmen die Werte bei mehreren Zahlen überein, sind sie sehr wahrscheinlich gleichwertig." },
      { f: "Lohnt sich Termtraining auch noch in der Oberstufe?", a: "Ja. Viele Fehler beim Ableiten, Integrieren oder bei Steckbriefaufgaben sind eigentlich Termfehler. Ein kurzes Training mit diesem Werkzeug deckt solche Lücken auf, bevor sie Ihr Kind in Klausuren Punkte kosten." },
    ],
  },

  gleichungen: {
    titel: "Gleichungen lösen üben: Äquivalenzumformungen",
    beschreibung: "Gleichungen Schritt für Schritt lösen: Äquivalenzumformungen eintippen – linear, quadratisch, Exponential-, Logarithmus- und Bruchgleichungen, mit Probe.",
    kurz: "Du sagst, welche Umformung passiert, und die App führt sie auf beiden Seiten aus – bis x allein steht.",
    text: [
      "Eine Gleichung zu lösen heißt, sie so lange gleichwertig umzuformen, bis x allein dasteht. Die Rechnung selbst ist selten das Problem. Schwierig ist die Entscheidung, welcher Schritt als Nächstes sinnvoll ist. Genau diese Entscheidung übernimmst hier du.",
      "Im Modus „Trainieren“ wählst du die Gleichungsart – linear, quadratisch, exponentiell, mit Logarithmus oder Bruchgleichung – und eine von drei Stufen. Du tippst eine Äquivalenzumformung ein, zum Beispiel −5, :3 oder ln. Die App führt sie auf beiden Seiten aus und schreibt die neue Zeile darunter. Dazu kommen Werkzeuge wie Wurzel ziehen, Mitternachtsformel und Substitution. Bei Bruchgleichungen steht die Definitionsmenge oben. Am Ende siehst du Lösungsmenge und Probe, auf Wunsch auch einen Musterweg. Eigene Gleichungen aus Heft oder Buch kannst du eintippen oder fotografieren; das Foto liest Mathilda, die KI der App.",
      "Im Modus „Entdecken“ gibt es fünf Übungen: Umformungen trainieren, Methode wählen, Fehler finden, Lösungsmenge verstehen und geometrisch deuten, also f(x) = g(x) als Schnittpunkte von Graphen.",
      "Was das Werkzeug dir beibringt, ist die Entscheidung, nicht das Ausrechnen: Erst Klammern auflösen und zusammenfassen, dann alle x auf eine Seite, dann die Zahlen, zum Schluss durch den Faktor vor x teilen. Bei quadratischen Gleichungen zuerst in die Form x² + px + q = 0 bringen, dann pq-Formel oder Mitternachtsformel. Die Probe am Ende ist kein Zusatz, sondern der Schritt, der dir in der Klausur den Punkt rettet.",
      "Beginne auf Stufe 1 mit linearen Gleichungen und arbeite dich zu Bruch- und Exponentialgleichungen vor. Nutze die Übung „Fehler finden“ im Modus „Entdecken“, um typische Umformungsfehler zu erkennen, bevor du sie selbst machst. Gleichungen mit mehreren Unbekannten löst du anschließend im Werkzeug Gleichungssysteme; die Deutung als Schnittpunkt zweier Graphen führt direkt zu den Geraden und Parabeln.",
    ],
    beispiel: {
      aufgabe: "Löse die Gleichung 2x² − 8x = −6.",
      schritte: [
        "Durch 2 teilen, damit vor x² eine 1 steht: x² − 4x = −3.",
        "+3 auf beiden Seiten, damit rechts 0 steht: x² − 4x + 3 = 0. Jetzt ist p = −4 und q = 3.",
        "pq-Formel: x = 2 ± √(4 − 3) = 2 ± √1 = 2 ± 1.",
        "Beide Lösungen: x₁ = 1 und x₂ = 3.",
        "Probe mit x = 1: 2·1 − 8·1 = −6 ✓. Probe mit x = 3: 2·9 − 8·3 = 18 − 24 = −6 ✓.",
      ],
      ergebnis: "L = {1; 3}. Im Werkzeug tippst du nacheinander „:2“, „+3“ und „pq-Formel“ – die App führt jeden Schritt auf beiden Seiten aus.",
    },
    faq: [
      { f: "Was ist eine Äquivalenzumformung?", a: "Eine Umformung, die die Lösungsmenge nicht verändert, zum Beispiel auf beiden Seiten dieselbe Zahl addieren oder durch dieselbe Zahl ungleich 0 teilen. Mit x malnehmen ist keine sichere Äquivalenzumformung." },
      { f: "Wie löst man eine Exponentialgleichung?", a: "Zuerst die Potenz isolieren, dann beide Seiten logarithmieren. Beispiel: 3 · 2ˣ = 48 ⇒ 2ˣ = 16 ⇒ x = ln 16 / ln 2 = 4." },
      { f: "Rechnet die App meinem Kind die Gleichung einfach vor?", a: "Nein. Ihr Kind entscheidet jeden Schritt selbst, die App führt nur aus, was eingetippt wurde. Erst auf Wunsch gibt es einen Tipp für den nächsten Schritt oder einen Musterweg zum Vergleich." },
    ],
  },

  ungleichungen: {
    titel: "Ungleichungen und Betragsungleichungen lösen",
    beschreibung: "Lineare, quadratische und Betragsungleichungen lösen: Zeichen bei negativem Faktor umdrehen, Betrag als Abstand verstehen, an der Parabel ablesen.",
    kurz: "Du löst lineare, quadratische und Betragsungleichungen und schreibst die Lösungsmenge als Intervall.",
    text: [
      "Ungleichungen löst du fast wie Gleichungen – mit einer wichtigen Ausnahme: Multiplizierst oder teilst du mit einer negativen Zahl, dreht sich das Zeichen um. Dazu kommen Beträge, die als Abstand auf der Zahlengeraden viel leichter zu verstehen sind als mit Fallunterscheidungen allein, und quadratische Ungleichungen, die du am besten an der Parabel abliest.",
      "Der Lernweg hat fünf Kapitel: lineare Ungleichungen, Betrag und Betragsgleichungen, Betragsungleichungen, quadratische Ungleichungen und ein gemischtes Kapitel. Jede Einführung gibt es in drei Stufen. In Laboren stellst du einen negativen Faktor ein und siehst das Zeichen kippen, verschiebst Mittelpunkt und Abstand eines Betrags und liest an einer verschiebbaren Parabel ab, wo sie über oder unter der x-Achse liegt. Für quadratische Ungleichungen gibt es zusätzlich eine Vorzeichentabelle.",
      "Die Übungen reichen von Doppelungleichungen und einem Tarifvergleich über Betragsgleichungen und „Wie viele Lösungen?“ bis zu quadratischen Ungleichungen in Produkt- und Normalform. Die Lösungsmenge gibst du als Intervall an, und jede Antwort wird sofort geprüft.",
    ],
    faq: [
      { f: "Warum dreht sich das Ungleichheitszeichen beim Teilen durch eine negative Zahl?", a: "Weil Multiplizieren mit einer negativen Zahl die Reihenfolge auf der Zahlengeraden umkehrt: 2 < 5, aber −2 > −5. Aus −2x < 6 wird deshalb x > −3." },
      { f: "Wie löst man eine Betragsungleichung wie |x − 3| < 2?", a: "Lies |x − 3| als Abstand von x zu 3. Der Abstand soll kleiner als 2 sein, also liegt x zwischen 1 und 5: L = ]1; 5[." },
      { f: "Wofür braucht mein Kind Ungleichungen später?", a: "Zum Beispiel für Definitionsbereiche, Monotonie in der Analysis und in der Stochastik bei Aussagen wie „höchstens“ oder „mindestens“. Wer Ungleichungen sicher löst, hat es in der Kursstufe deutlich leichter." },
    ],
  },

  lgs: {
    titel: "Gleichungssysteme mit 3 Unbekannten: Gauß-Verfahren",
    beschreibung: "Lineare Gleichungssysteme mit drei Unbekannten lösen: Gleichungen selbst kombinieren, Gauß-Verfahren und direkter Weg als Musterlösung, Deutung als Ebenen.",
    kurz: "Du kombinierst die Gleichungen I, II und III selbst, bis x, y und z einzeln dastehen – die App rechnet mit.",
    text: [
      "Ein lineares Gleichungssystem mit drei Unbekannten wirkt zuerst unübersichtlich. Das Prinzip ist aber immer gleich: Du kombinierst Gleichungen so, dass eine Unbekannte verschwindet, bis nur noch eine übrig ist. Schwer ist die Wahl der richtigen Kombination – und das saubere Rechnen Spalte für Spalte.",
      "Hier entscheidest du, und die App rechnet. Du baust aus I, II und III ein neues System. Dabei übernimmst du eine Gleichung unverändert oder gibst eine Kombination ein wie II − I, 2·I + 3·III oder (II − I) : 2. Die App prüft, dass keine Information verloren geht, und lehnt zum Beispiel Kombinationen ab, die nur 0 = 0 liefern. Es gibt drei Schwierigkeitsstufen. Zum Vergleich kannst du zwei Musterlösungen aufrufen: das Gauß-Verfahren mit Treppenform und Rückwärtseinsetzen sowie den direkten Weg.",
      "Zum Schluss siehst du die Lösung geometrisch: Jede Gleichung beschreibt eine Ebene im Raum, und die Lösung ist ihr gemeinsamer Schnittpunkt S. Das Bild kannst du durch Ziehen drehen.",
      "Zwei Dinge entscheiden in der Klausur: die Wahl der Kombinationen und die Buchführung. Schreibe jede neue Gleichung mit Namen (II′, III′) und notiere daneben, woraus sie entstand – genau so zeigt es das Werkzeug. Prüfe am Ende alle drei Ausgangsgleichungen mit der Lösung; wer nur eine prüft, übersieht Rechenfehler in den anderen.",
      "Starte auf Stufe 1 mit Systemen, bei denen eine Unbekannte schon fehlt, und steigere dich zu Systemen mit Brüchen. Vergleiche deinen Weg anschließend mit dem Gauß-Verfahren – es ist nicht immer der kürzeste, aber der sicherste, weil er immer gleich abläuft. In der Oberstufe brauchst du das Verfahren bei Ebenen und bei Steckbriefaufgaben, wo aus Bedingungen an eine Funktion ein Gleichungssystem für die Koeffizienten entsteht.",
    ],
    beispiel: {
      aufgabe: "Löse das Gleichungssystem I: x + y + z = 6, II: 2x − y + z = 3, III: x + 2y − z = 2.",
      schritte: [
        "x eliminieren: II − 2·I ergibt −3y − z = −9, also II′: 3y + z = 9. III − I ergibt III′: y − 2z = −4.",
        "Aus III′ folgt y = 2z − 4. In II′ einsetzen: 3·(2z − 4) + z = 9, also 7z − 12 = 9 und z = 3.",
        "Rückwärts einsetzen: y = 2·3 − 4 = 2.",
        "In I: x = 6 − y − z = 6 − 2 − 3 = 1.",
        "Probe in allen drei Gleichungen: I: 1 + 2 + 3 = 6 ✓, II: 2 − 2 + 3 = 3 ✓, III: 1 + 4 − 3 = 2 ✓.",
      ],
      ergebnis: "x = 1, y = 2, z = 3 – geometrisch der Schnittpunkt S(1|2|3) der drei Ebenen.",
    },
    faq: [
      { f: "Wie funktioniert das Gauß-Verfahren?", a: "Du bringst das System durch Addieren von Vielfachen der Gleichungen auf Treppenform: unten nur noch eine Unbekannte, darüber zwei, oben drei. Dann löst du von unten nach oben durch Einsetzen." },
      { f: "Welche Umformungen sind bei einem Gleichungssystem erlaubt?", a: "Gleichungen vertauschen, eine Gleichung mit einer Zahl ungleich 0 multiplizieren und das Vielfache einer Gleichung zu einer anderen addieren. Diese Umformungen ändern die Lösungsmenge nicht." },
      { f: "Wo braucht mein Kind Gleichungssysteme mit drei Unbekannten?", a: "Vor allem in der Kursstufe: bei Steckbriefaufgaben in der Analysis und bei Lagebeziehungen von Ebenen in der Vektorgeometrie. Beides gehört zum Abitur in Baden-Württemberg." },
    ],
  },
};
