/* ======================================================================
   SEO-/KI-Texte der Werkzeuge: Analysis Oberstufe (Pilot, 21.10.2026)
   Format je Werkzeug-Id (Schlüssel aus werkzeuge.js) – siehe src/seo/index.js:
     titel        für <title>, höchstens 60 Zeichen
     beschreibung Meta-Description, 110–155 Zeichen
     kurz         ein Satz, sichtbar über dem Aufklapper „Was kann dieses Werkzeug?“
     text         2–3 Absätze, zusammen 150–250 Wörter, Schüler geduzt, konkret: was das Werkzeug kann
     faq          genau 3 Fragen; die dritte aus Elternsicht (gesiezt)
   Nur beschreiben, was das Werkzeug wirklich kann. Keine erfundenen Zahlen, Stimmen oder Siegel.
   ====================================================================== */
export const TEXTE_ANALYSIS = {
  diffq: {
    titel: "Differenzenquotient üben: h-Methode Schritt für Schritt",
    beschreibung: "Differenzenquotient selbst aufbauen: f(x+h) und f(x) einsetzen, den Bruch Zeile für Zeile umformen, h kürzen, Grenzwert bilden – jede Zeile wird geprüft.",
    kurz: "Du baust den Bruch des Differenzenquotienten selbst auf – Zeile für Zeile, jede Umformung wird sofort geprüft.",
    text: [
      "Der Differenzenquotient ist der Weg zur Ableitung, den jede Klausur zur Einführung der Differentialrechnung verlangt: f(x+h) und f(x) einsetzen, den Bruch umformen, h kürzen und h gegen 0 laufen lassen. Genau diesen Weg gehst du hier selbst. Der Bruch ist interaktiv: Unten steht immer h, oben setzt du zuerst f(x+h) und f(x) in zwei Felder ein, danach schreibst du die nächste Zeile – ausmultiplizieren, zusammenfassen, h ausklammern.",
      "Jede neue Zeile übernimmt die Zeile darüber, sodass du sie wie auf dem Papier weiter bearbeitest. Das Werkzeug prüft jede Zeile mathematisch: Es rechnet mit x und h und vergleicht deine Zeile mit der Zeile darüber. Eine andere, aber gleichwertige Schreibweise zählt deshalb als richtig. Fehlt ein Minus, fehlt das gemischte Glied der binomischen Formel oder steht h noch im Nenner, bekommst du genau diesen Hinweis.",
      "Du kannst die Ableitungsfunktion f′(x) herleiten oder die Steigung an einer festen Stelle x₀ berechnen. Es gibt lineare, quadratische und kubische Funktionen, Potenzen, Brüche wie 1/(x+2) und Wurzeln – oder du gibst eine eigene Funktion ein. Der Modus Rechnen zeigt den vollständigen Musterweg vom Einsetzen bis zum Grenzwert, wenn du eine Herleitung nachlesen willst.",
    ],
    faq: [
      { f: "Muss ich den Bruch genauso umformen wie in der Musterlösung?", a: "Nein. Das Werkzeug prüft jede Zeile rechnerisch gegen die Zeile darüber. Du kannst mehr oder weniger Zwischenschritte schreiben, solange jede Zeile gleichwertig bleibt." },
      { f: "Was ist der Unterschied zwischen Ableitungsfunktion und an einer Stelle?", a: "Bei der Ableitungsfunktion bleibt x stehen und am Ende kommt f′(x) heraus. An einer Stelle setzt du von Anfang an die Zahl x₀ ein und erhältst die Steigung f′(x₀) als Zahl." },
      { f: "Hilft das Werkzeug meinem Kind bei der ersten Klausur zur Differentialrechnung?", a: "Ja. Die h-Methode ist dort Standard, und hier übt Ihr Kind genau das Aufschreiben Zeile für Zeile. Jeder Fehler wird an der Stelle erklärt, an der er entsteht, nicht erst am Ergebnis." },
    ],
  },

  ableitungstrainer: {
    titel: "Ableitungstrainer: Ableitungen üben mit Rechenweg",
    beschreibung: "Ableiten üben bis zum Abitur: f′, f″ und f‴ selbst eingeben und sofort prüfen lassen – mit Produkt-, Quotienten- und Kettenregel und vollständigem Rechenweg.",
    kurz: "Du gibst f′, f″ und f‴ selbst ein, der Trainer prüft sofort und zeigt den Rechenweg Schritt für Schritt.",
    text: [
      "Ableiten ist Handwerk: Potenz-, Faktor- und Summenregel, dazu Produkt-, Quotienten- und Kettenregel. Sicher wirst du nur, wenn du die Regeln oft und richtig anwendest. Genau dafür ist der Ableitungstrainer da. Du wählst einen Aufgabentyp, zum Beispiel Polynome, Wurzeln, e-Funktionen oder verkettete Funktionen, und tippst die Ableitung selbst ein.",
      "Der Trainer prüft deine Eingabe mathematisch, nicht als Text: Auch eine anders geschriebene, aber gleichwertige Lösung zählt als richtig. Ist sie falsch, siehst du den Rechenweg mit der passenden Regel und dem Ergebnis in vereinfachter Form. So erkennst du, ob dir die Regel fehlt oder ob nur beim Zusammenfassen etwas schiefgegangen ist.",
      "Die Aufgaben passen zum Stoff der Kursstufe in Baden-Württemberg und zum Abitur. Höhere Ableitungen bis f‴ brauchst du später für Wendepunkte und Kurvendiskussionen – hier übst du sie gleich mit. Am meisten bringt der Trainer, wenn du jede Aufgabe zuerst auf Papier löst und erst dann eintippst: So trainierst du genau das, was in der Klausur zählt, nämlich sauberes Aufschreiben ohne Hilfe.",
    ],
    faq: [
      { f: "Welche Ableitungsregeln kann ich mit dem Ableitungstrainer üben?", a: "Potenz-, Faktor- und Summenregel sowie Produkt-, Quotienten- und Kettenregel – an Polynomen, Wurzeln, Brüchen, e-Funktionen und verketteten Funktionen." },
      { f: "Was passiert, wenn meine Ableitung anders aussieht als die Musterlösung?", a: "Der Trainer vergleicht mathematisch. Eine gleichwertige Schreibweise wird als richtig erkannt; nur wirklich falsche Ergebnisse werden markiert und mit Rechenweg erklärt." },
      { f: "Kann mein Kind damit allein für die Klausur üben?", a: "Ja. Jede Eingabe wird sofort geprüft und bei Fehlern mit Rechenweg erklärt. Ihr Kind sieht dadurch selbst, welche Regel noch unsicher ist, und braucht dafür keine Lösungshefte." },
    ],
  },

  kurvendiskussion: {
    titel: "Kurvendiskussion Rechner mit Rechenweg und Graph",
    beschreibung: "Kurvendiskussion mit Rechenweg: Nullstellen, Extrem- und Wendepunkte, Symmetrie und Verhalten im Unendlichen – für Polynome und beliebige Funktionen, mit Graph.",
    kurz: "Funktion eingeben – du bekommst Graph, f′ und f″ und die komplette Kurvendiskussion mit Rechenweg.",
    text: [
      "Eine Kurvendiskussion ist keine Zauberei, sondern eine feste Reihenfolge: Definitionsbereich, Symmetrie, Verhalten im Unendlichen, Nullstellen, Ableitungen, Extrempunkte, Wendepunkte. Dieses Werkzeug geht genau diese Reihenfolge mit dir durch. Für Polynome stellst du die Koeffizienten ein, für beliebige Funktionen gibst du den Term frei ein.",
      "Du siehst den Graphen von f zusammen mit f′ und f″ und alle markanten Punkte direkt im Bild. Darunter steht die Kurvendiskussion mit Rechenweg: notwendige und hinreichende Bedingung, Polynomdivision oder Mitternachtsformel bei den Nullstellen, Monotonie- und Krümmungsverhalten. So kannst du deine eigene Rechnung auf Papier Schritt für Schritt vergleichen.",
      "Zum Schluss lässt sich die ganze Diskussion als PDF speichern – praktisch, um sie neben deinen Hefteintrag zu legen oder vor der Klausur noch einmal durchzugehen. Gerade im Abitur kommt es darauf an, die Schritte vollständig und in der richtigen Reihenfolge aufzuschreiben. Mit dem Werkzeug prüfst du schnell, ob deine Ergebnisse stimmen, und siehst im Graphen, was jeder Schritt bedeutet.",
    ],
    faq: [
      { f: "Für welche Funktionen funktioniert die Kurvendiskussion?", a: "Für Polynome mit eingestellten Koeffizienten und im zweiten Modus für frei eingegebene Funktionen, zum Beispiel mit e-Funktion, Wurzel oder Bruch." },
      { f: "Zeigt das Werkzeug auch den Rechenweg?", a: "Ja. Zu jedem Schritt stehen die Bedingungen und die Rechnung, bei Nullstellen auch Polynomdivision oder Mitternachtsformel – nicht nur das Ergebnis." },
      { f: "Ersetzt das Werkzeug das eigene Rechnen?", a: "Nein, und das soll es auch nicht. Am meisten bringt es, wenn Ihr Kind erst selbst auf Papier rechnet und danach mit dem Rechenweg vergleicht. So werden Fehler sichtbar, statt abgeschrieben zu werden." },
    ],
  },

  scharen: {
    titel: "Funktionsscharen verstehen: Parameter und Ortskurven",
    beschreibung: "Funktionsscharen interaktiv: Parameter per Regler verändern, Hoch-, Tief- und Wendepunkte in Abhängigkeit vom Parameter berechnen und Ortskurven sehen.",
    kurz: "Bewege den Parameter per Regler und sieh, wie Graph, besondere Punkte und Ortskurve mitwandern.",
    text: [
      "Ein Parameter in der Funktionsgleichung erzeugt nicht einen Graphen, sondern eine ganze Familie. Genau das macht Funktionsscharen im Abitur so ungewohnt: Rechnungen enthalten plötzlich Buchstaben, und Ergebnisse hängen vom Parameter ab. Dieses Werkzeug macht die Schar sichtbar.",
      "Du veränderst den Parameter mit einem Regler und beobachtest, wie sich der Graph verschiebt, streckt oder spiegelt. Hoch-, Tief- und Wendepunkte wandern dabei auf einer Ortskurve, die du im Bild siehst. Daneben steht die Rechnung mit Parameter, damit du nachvollziehst, woher die Koordinaten kommen und wann Sonderfälle auftreten, etwa wenn ein Extrempunkt verschwindet.",
      "So verbindest du die abstrakte Rechnung mit einem Bild im Kopf – eine gute Vorbereitung auf typische Abituraufgaben zu Scharen und Ortskurven. Rechne die Koordinaten eines Extrempunkts zuerst selbst mit Parameter aus. Dann setzt du im Werkzeug einen konkreten Wert ein und prüfst, ob dein Ergebnis zum Bild passt. So findest du Vorzeichen- und Rechenfehler sofort.",
    ],
    faq: [
      { f: "Was ist eine Ortskurve?", a: "Die Kurve, auf der ein besonderer Punkt – zum Beispiel der Tiefpunkt – liegt, wenn man den Parameter verändert. Man erhält sie, indem man den Parameter aus den Koordinaten eliminiert." },
      { f: "Muss ich die Rechnung mit Parameter selbst können?", a: "Im Abitur ja. Das Werkzeug zeigt dir, was die Rechnung bedeutet und ob dein Ergebnis zum Bild passt – rechnen solltest du trotzdem selbst." },
      { f: "In welcher Klasse kommen Funktionsscharen dran?", a: "In Baden-Württemberg in der Kursstufe, meist im Zusammenhang mit Kurvendiskussion und Steckbriefaufgaben. Viele Abituraufgaben enthalten eine Schar." },
    ],
  },

  steckbrief: {
    titel: "Steckbriefaufgaben üben: Funktion aus Eigenschaften",
    beschreibung: "Steckbriefaufgaben Schritt für Schritt: aus Hochpunkt, Wendepunkt und Nullstelle Bedingungen aufstellen, Gleichungssystem lösen, Funktionsgleichung finden.",
    kurz: "Aus Eigenschaften wie Hochpunkt oder Wendepunkt baust du Schritt für Schritt die gesuchte Funktion.",
    text: [
      "Bei Steckbriefaufgaben ist die Funktion gesucht, und gegeben sind nur ihre Eigenschaften: ein Hochpunkt hier, ein Wendepunkt dort, eine Nullstelle. Der Trick: Jede Eigenschaft ist eine Gleichung. Wer das einmal verstanden hat, löst jede Steckbriefaufgabe nach demselben Muster.",
      "Das Werkzeug führt dich durch dieses Muster. Zuerst wählst du den Ansatz, also den Grad der Funktion. Dann übersetzt du jede Eigenschaft in eine Bedingung, etwa f′(2) = 0 für einen Extrempunkt bei x = 2. Aus den Bedingungen entsteht ein lineares Gleichungssystem, das du löst. Am Ende prüfst du, ob die gefundene Funktion alle Eigenschaften erfüllt – auch im Graphen.",
      "Die Aufgaben gibt es in verschiedenen Stufen, von Parabeln bis zu Polynomen dritten und vierten Grades, passend zur Kursstufe und zum Abitur. Weil jede Aufgabe nach demselben Muster abläuft, merkst du schnell, an welcher Stelle du unsicher bist: beim Übersetzen des Textes, beim Ableiten oder beim Lösen des Gleichungssystems. Genau diesen Schritt kannst du dann gezielt wiederholen.",
    ],
    faq: [
      { f: "Wie übersetze ich einen Wendepunkt in Bedingungen?", a: "Ein Wendepunkt W(a | b) liefert zwei Gleichungen: f(a) = b, weil der Punkt auf dem Graphen liegt, und f″(a) = 0. Ein Extrempunkt liefert entsprechend f(a) = b und f′(a) = 0." },
      { f: "Wie viele Bedingungen brauche ich?", a: "So viele wie Unbekannte im Ansatz: Eine Funktion dritten Grades hat vier Koeffizienten, also brauchst du vier Bedingungen." },
      { f: "Warum fallen Steckbriefaufgaben vielen Schülern schwer?", a: "Weil drei Dinge zusammenkommen: Text übersetzen, Ableitungen bilden und ein Gleichungssystem lösen. Das Werkzeug trennt diese Schritte, sodass Ihr Kind sieht, an welcher Stelle es hakt." },
    ],
  },

  optimierung: {
    titel: "Optimierungsaufgaben (Extremwertaufgaben) üben",
    beschreibung: "Extremwertaufgaben verstehen: vom Text zur Zielfunktion, Nebenbedingung einsetzen, Ableitung null setzen, Randwerte prüfen – an Schachtel und Zaun.",
    kurz: "Vom Text zur Zielfunktion: Schachtel, Fläche oder dein eigener Ansatz – mit Nebenbedingung, Ableitung und Randwerten.",
    text: [
      "Optimierungsaufgaben, auch Extremwertaufgaben genannt, haben immer dieselbe Struktur: Was soll maximal oder minimal werden? Welche Bedingung schränkt ein? Daraus entsteht eine Zielfunktion mit einer Variablen, deren Extremum du mit der Ableitung findest. Schwer ist meist nicht das Ableiten, sondern der Weg vom Text zur Funktion.",
      "In der Optimierungswerkstatt übst du genau diesen Weg. Bei der Schachtel aus einem Blatt Papier oder der größten Fläche, die ein Zaun umschließen kann, siehst du das Objekt im Bild und veränderst die Variable. Gleichzeitig entsteht die Zielfunktion als Graph. So erkennst du, warum der optimale Wert dort liegt, wo die Ableitung null wird – und warum du die Randwerte des Definitionsbereichs prüfen musst.",
      "Im eigenen Ansatz stellst du Zielfunktion und Nebenbedingung selbst auf und lässt sie prüfen. Das ist der Teil, den du im Abitur ohne Hilfe können musst. Wer die Struktur einmal verstanden hat, erkennt sie in jeder neuen Textaufgabe wieder – egal ob es um Verpackungen, Zäune oder Rinnen geht.",
    ],
    faq: [
      { f: "Was ist der Unterschied zwischen Zielfunktion und Nebenbedingung?", a: "Die Zielfunktion beschreibt die Größe, die optimal werden soll, zum Beispiel ein Volumen. Die Nebenbedingung verbindet die Variablen, etwa eine feste Seitenlänge, und erlaubt es, eine Variable zu ersetzen." },
      { f: "Warum muss ich Randwerte prüfen?", a: "Weil das Maximum auch am Rand des Definitionsbereichs liegen kann, wo die Ableitung nicht null ist. Erst der Vergleich mit den Randwerten sichert das Ergebnis ab." },
      { f: "Hilft das Werkzeug bei Textaufgaben im Abitur?", a: "Ja, denn es trainiert genau den Schritt, an dem die meisten scheitern: aus einem Text eine Funktion zu machen. Das Bild zeigt Ihrem Kind dabei, was die Rechnung bedeutet." },
    ],
  },

  integrale: {
    titel: "Integraltrainer: Stammfunktion, Integral und Fläche",
    beschreibung: "Integrieren üben mit Bild und Rechenweg: Stammfunktionen bilden, bestimmte Integrale mit dem Hauptsatz, Flächen mit der x-Achse und zwischen zwei Graphen.",
    kurz: "Stammfunktionen, bestimmte Integrale und Flächen – mit Rechenweg links und dem passenden Bild rechts.",
    text: [
      "Der Integraltrainer verbindet Rechnen und Sehen. Du wählst einen Aufgabentyp: Stammfunktion bilden, Stammfunktion durch einen Punkt, bestimmtes Integral, Fläche zwischen Graph und x-Achse, Fläche zwischen zwei Graphen oder Bestand aus einer Änderungsrate. Jede Aufgabe gibt es in mehreren Stufen.",
      "Im Trainingsmodus rechnest du selbst: Du gibst die Stammfunktion und die Ergebnisse ein und bekommst gezielte Rückmeldung, etwa wenn du f(b) statt F(b) eingesetzt oder Flächen unter der x-Achse mit dem falschen Vorzeichen gezählt hast. Im Bild siehst du die Fläche wachsen, die Stammfunktion als Höhenunterschied F(b) − F(a) und bei Flächen zwischen Graphen, wie man eine Kurve auf die x-Achse zieht.",
      "Eigene Funktionen kannst du ebenfalls eingeben, zum Beispiel aus deinem Schulbuch. Das Werkzeug bildet dann Stammfunktion und Integral mit dem Hauptsatz. Im Automatikmodus siehst du den ganzen Rechenweg auf einmal, im Trainingsmodus erscheint im Bild nur, was du schon gelöst hast. So bleibt die Arbeit bei dir, und das Bild bestätigt dein Ergebnis.",
    ],
    faq: [
      { f: "Was ist der Unterschied zwischen Integral und Fläche?", a: "Das Integral zählt Flächen unter der x-Achse negativ. Für die Fläche teilst du an den Nullstellen auf und addierst die Beträge der Teilintegrale." },
      { f: "Kann ich eigene Funktionen aus dem Schulbuch eingeben?", a: "Ja. Über „Eigene Funktion“ gibst du f und, wenn nötig, die Grenzen ein; der Trainer bildet die Stammfunktion und rechnet mit dem Hauptsatz." },
      { f: "Ab wann ist Integralrechnung dran?", a: "In Baden-Württemberg in der Kursstufe. Sie ist fester Bestandteil des Mathe-Abiturs, sowohl im Basis- als auch im Leistungsfach." },
    ],
  },
};
