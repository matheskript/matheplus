/* ======================================================================
   SEO-/KI-Texte der Werkzeuge: Unterstufe, Klasse 5 bis 7 (21.10.2026)
   Format je Werkzeug-Id (Schlüssel aus werkzeuge.js) – siehe texteAnalysis.js und src/seo/index.js:
     titel        für <title>, höchstens 60 Zeichen
     beschreibung Meta-Description, 110–155 Zeichen
     kurz         ein Satz, sichtbar über dem Aufklapper „Was kann dieses Werkzeug?“
     text         2–3 Absätze, zusammen 150–250 Wörter, Schüler geduzt, einfache Sprache
     faq          genau 3 Fragen; die dritte aus Elternsicht (gesiezt)
   Nur beschreiben, was das Werkzeug wirklich kann (geprüft an func*.jsx, unterGen.js, bruchGen.js,
   ui3.jsx/Schritt, funcHilfe.jsx/„Ich hänge fest“). Keine erfundenen Zahlen, Stimmen oder Siegel.
   ====================================================================== */
export const TEXTE_UNTERSTUFE = {
  dezimal: {
    titel: "Dezimalzahlen üben: umwandeln, runden, Komma",
    beschreibung: "Dezimalzahlen üben: Bruch in Dezimalzahl umwandeln, runden, Komma verschieben, mit Komma multiplizieren und dividieren – mit Stellenwerttafel.",
    kurz: "Du lässt Ziffern in der Stellenwerttafel wandern und übst Umwandeln, Runden und Rechnen mit Komma Schritt für Schritt.",
    text: [
      "Dezimalzahlen sind Brüche in anderer Schreibweise: 0,1 ist ein Zehntel, 0,01 ein Hundertstel. Schwierig wird es beim Rechnen. Wohin wandert das Komma bei mal 10? Wie viele Kommastellen hat ein Produkt? Und warum hört 1/3 als Dezimalzahl nie auf?",
      "Im Modus Entdecken siehst du eine Stellenwerttafel von Tausendern bis Tausendsteln. Du wählst eine Zahl und drückst · 10 oder : 10. Die Ziffern rücken dann eine Stelle weiter, das Komma bleibt fest. Daneben steht die Zahl als Bruch, auch gekürzt. Kurze Animationen zeigen dir dazu die Grundideen.",
      "Im Modus Trainieren wählst du einen Aufgabentyp: Bruch → Dezimalzahl, Dezimalzahl → Bruch, Runden, Komma verschieben, Multiplizieren, Dividieren oder „Abbrechend oder periodisch?“. Jede Aufgabe ist in kleine Schritte geteilt. Du gibst jeden Schritt selbst ein und lässt ihn prüfen. Bei typischen Fehlern bekommst du einen passenden Hinweis, zum Beispiel „Abgeschnitten statt gerundet – ab 5 wird aufgerundet.“ Wenn du festhängst, hilft „Ich hänge fest“ in kleinen Stufen weiter.",
    ],
    faq: [
      { f: "Wie wandelt man einen Bruch in eine Dezimalzahl um?", a: "Man teilt den Zähler durch den Nenner: 3/8 = 3 : 8 = 0,375. Geht die Division nicht auf, entsteht eine periodische Dezimalzahl, zum Beispiel 1/3 = 0,333…" },
      { f: "Wie multipliziert man zwei Dezimalzahlen?", a: "Erst ohne Komma rechnen, dann die Kommastellen beider Faktoren addieren: 0,3 · 0,4 hat zwei Kommastellen, also 12 → 0,12." },
      { f: "Ist das Werkzeug für mein Kind in Klasse 6 geeignet?", a: "Ja. Es deckt den Stoff zu Dezimalzahlen aus Klasse 5 und 6 ab. Ihr Kind rechnet selbst, jeder Schritt wird sofort geprüft, und bei Fehlern erscheint ein Hinweis statt nur „falsch“." },
    ],
  },

  bruchrechnen: {
    titel: "Bruchrechnen üben: kürzen, erweitern, plus, mal",
    beschreibung: "Bruchrechnen üben mit Bruchstreifen: kürzen, erweitern, addieren, subtrahieren, multiplizieren, dividieren, gemischte Zahlen – mit Hinweis bei Fehlern.",
    kurz: "Du rechnest Brüche Schritt für Schritt – vom Kürzen bis zum Doppelbruch – und siehst am Bruchstreifen, was dabei passiert.",
    text: [
      "Bei Brüchen gelten für jede Rechenart eigene Regeln. Bei plus und minus braucht man einen gemeinsamen Nenner. Bei mal rechnet man Zähler mal Zähler und Nenner mal Nenner. Bei geteilt nimmt man mit dem Kehrwert mal. Wer diese Regeln verwechselt, rechnet schnell 1/3 + 1/4 = 2/7. Das ist ein typischer Fehler.",
      "Im Modus Entdecken arbeitest du mit Bruchstreifen. Beim Erweitern und Kürzen siehst du: Die Fläche bleibt gleich, nur die Einteilung wird feiner oder gröber. Beim Gleichnamig machen legst du zwei Brüche auf denselben Nenner und addierst sie am Streifen.",
      "Im Modus Trainieren gibt es zehn Aufgabentypen: Kürzen, Erweitern, Addieren, Subtrahieren, Multiplizieren, Dividieren, gemischte Zahlen, Anteil berechnen, Doppelbruch und Vergleichen. Du tippst Brüche einfach als 3/4 ein. Jede Aufgabe läuft in Schritten, etwa erst Hauptnenner, dann Zähler, dann Ergebnis. Stimmt der Wert, aber der Bruch ist nicht ganz gekürzt, sagt dir das Werkzeug genau das. Bei typischen Fehlern wie „Nenner addiert“ erklärt ein Hinweis, was schiefging.",
      "Für die Klassenarbeit hilft eine feste Reihenfolge: erst gemischte Zahlen in unechte Brüche umwandeln, dann die Rechenart bestimmen, dann rechnen und zum Schluss vollständig kürzen. Das Werkzeug besteht auf dem letzten Schritt – 6/8 ist nicht falsch, aber nicht fertig. Am Bruchstreifen kannst du jedes Ergebnis prüfen: Ein Bruch größer als 1 füllt mehr als einen ganzen Streifen.",
      "Übe in dieser Reihenfolge: Kürzen und Erweitern, bis du Brüche sicher vergleichen kannst, dann Addieren und Subtrahieren mit Hauptnenner, dann Multiplizieren und Dividieren, zuletzt gemischte Zahlen und Doppelbrüche. Zehn Aufgaben am Tag reichen, wenn du jede auf Papier rechnest und nur das Ergebnis eintippst. Bruchterme mit Variablen findest du später im Werkzeug Bruchterme und -gleichungen.",
    ],
    beispiel: {
      aufgabe: "Berechne 2/3 + 3/4 und anschließend 1 1/2 : 3/4.",
      schritte: [
        "Addition: Hauptnenner von 3 und 4 ist 12. Erweitern: 2/3 = 8/12 und 3/4 = 9/12.",
        "Zähler addieren, Nenner behalten: 8/12 + 9/12 = 17/12. Als gemischte Zahl: 1 5/12. Weiter kürzen geht nicht, da 17 eine Primzahl ist.",
        "Division: 1 1/2 zuerst in einen unechten Bruch umwandeln: 1 1/2 = 3/2.",
        "Durch einen Bruch teilt man, indem man mit dem Kehrwert multipliziert: 3/2 : 3/4 = 3/2 · 4/3.",
        "Zähler mal Zähler, Nenner mal Nenner: 12/6. Kürzen: 12/6 = 2.",
        "Probe: 2 · 3/4 = 6/4 = 3/2 = 1 1/2 – stimmt.",
      ],
      ergebnis: "2/3 + 3/4 = 17/12 = 1 5/12 und 1 1/2 : 3/4 = 2. Im Werkzeug gibst du bei der Addition erst den Hauptnenner ein, dann die Zähler, dann das gekürzte Ergebnis – jeder Schritt wird einzeln geprüft.",
    },
    faq: [
      { f: "Wie addiert man zwei Brüche mit verschiedenen Nennern?", a: "Erst auf den Hauptnenner erweitern, dann die Zähler addieren und den Nenner stehen lassen: 1/3 + 1/4 = 4/12 + 3/12 = 7/12. Am Ende vollständig kürzen." },
      { f: "Wie teilt man durch einen Bruch?", a: "Man multipliziert mit dem Kehrwert des zweiten Bruchs: 2/3 : 4/5 = 2/3 · 5/4 = 10/12 = 5/6." },
      { f: "Mein Kind macht bei Brüchen immer wieder dieselben Fehler. Hilft das Werkzeug?", a: "Ja. Typische Fehler wie Nenner addieren oder nicht vollständig kürzen werden erkannt und benannt. So sieht Ihr Kind, welche Regel noch wackelt, und übt genau diese Rechenart gezielt weiter." },
    ],
  },

  stellenwert: {
    titel: "Stellenwerttafel und Runden: große Zahlen üben",
    beschreibung: "Große Zahlen verstehen: Stellenwerttafel bis zu den Millionen, Runden, Zahlenstrahl, Vorgänger und Nachfolger, römische Zahlen und Zehnerpotenzen üben.",
    kurz: "Du baust große Zahlen in der Stellenwerttafel, rundest sie und liest sie am Zahlenstrahl ab.",
    text: [
      "Unser Zahlensystem beruht auf einer einfachen Idee: Jede Stelle ist zehnmal so viel wert wie die Stelle rechts daneben. So schreibt man mit nur zehn Ziffern beliebig große Zahlen. Bei Millionen verliert man aber schnell den Überblick. Und beim Runden ist oft nicht klar, welche Ziffer entscheidet.",
      "Im Modus Entdecken siehst du eine Stellenwerttafel von den Einern bis zu den Millionen. Mit Plus und Minus veränderst du jede Stelle einzeln. Darunter stehen die Zerlegung der Zahl, zum Beispiel 3 M + 4 HT + 7 T, und die gerundeten Werte auf Zehner bis Hunderttausender. Bei kleineren Zahlen siehst du auch die römische Schreibweise.",
      "Im Modus Trainieren gibt es sieben Aufgabentypen: Ziffer an einer Stelle, Runden, Zahl aus Zerlegung, Zahlenstrahl, Vorgänger und Nachfolger, römische Zahlen und Zehnerpotenzen. Beim Zahlenstrahl liest du eine markierte Stelle im Bild ab. Du gibst jede Antwort selbst ein und bekommst sofort Rückmeldung. Wenn du nicht weiterkommst, zeigt dir „Ich hänge fest“ Hinweise in kleinen Stufen.",
    ],
    faq: [
      { f: "Wie rundet man eine Zahl richtig?", a: "Man schaut nur auf die Ziffer rechts von der Rundungsstelle. Ist sie 0 bis 4, wird abgerundet, ist sie 5 bis 9, wird aufgerundet: 3 457 auf Hunderter gerundet ist 3 500." },
      { f: "Wie liest man römische Zahlen?", a: "I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. Die Werte werden addiert; steht ein kleineres Zeichen vor einem größeren, wird es abgezogen: IX = 9, XL = 40." },
      { f: "Wofür braucht mein Kind die Stellenwerttafel in Klasse 5?", a: "Sie ist die Grundlage für alles Weitere: Runden, schriftliches Rechnen und später Dezimalzahlen. Wer den Stellenwert sicher versteht, macht in diesen Themen deutlich weniger Fehler." },
    ],
  },

  ganzezahlen: {
    titel: "Negative Zahlen üben: Vorzeichenregeln verstehen",
    beschreibung: "Negative Zahlen verstehen: Zahlengerade mit Pfeilmodell, Rechnen mit Vorzeichen, Minus mal Minus, Temperaturaufgaben und negative Brüche – mit Hinweisen.",
    kurz: "An der Zahlengeraden mit Pfeilen siehst du, warum minus minus plus ergibt – und übst alle Vorzeichenregeln.",
    text: [
      "Mit negativen Zahlen kommen die Vorzeichen ins Spiel. Viele Fehler entstehen genau hier: Ist 3 − (−5) nun 8 oder −2? Ist −4 · (−3) positiv oder negativ? Und ist −2 größer oder kleiner als −7? Mit einem Bild im Kopf wird das viel einfacher.",
      "Im Modus Entdecken stellst du eine Startzahl, plus oder minus und eine zweite Zahl ein. Auf der Zahlengeraden siehst du dann die Rechnung als Pfeile. Plus geht nach rechts, minus dreht die Richtung um. So wird sichtbar, warum „minus eine negative Zahl“ dasselbe ist wie plus. Kurze Animationen erklären die Regeln zusätzlich.",
      "Im Modus Trainieren gibt es acht Aufgabentypen: Addieren, Subtrahieren, Multiplizieren, Dividieren, Vergleichen, Temperatur, Punkt vor Strich und negative Brüche. Bei manchen Aufgaben hilft dir eine Zahlengerade im Bild. Machst du einen typischen Fehler, bekommst du einen genauen Hinweis, zum Beispiel „Betrag stimmt, Vorzeichen nicht.“ So merkst du sofort, was du falsch gemacht hast.",
    ],
    faq: [
      { f: "Warum ergibt minus mal minus plus?", a: "Weil ein Minuszeichen die Richtung umdreht. Zweimal umdrehen führt zurück zur ursprünglichen Richtung: (−4) · (−3) = 12. Merkregel: gleiche Vorzeichen → plus, verschiedene → minus." },
      { f: "Wie subtrahiert man eine negative Zahl?", a: "Minus heißt: die Gegenzahl addieren. Aus 3 − (−5) wird 3 + 5 = 8. Auf der Zahlengeraden geht man also nach rechts." },
      { f: "In welcher Klasse kommen negative Zahlen dran?", a: "Je nach Schule und Bundesland in Klasse 6 oder 7. Ihr Kind kann mit dem Werkzeug schon vorher die Zahlengerade verstehen und die Vorzeichenregeln danach gezielt festigen." },
    ],
  },

  primzahlen: {
    titel: "Primzahlen, ggT und kgV üben mit Faktorbaum",
    beschreibung: "Primzahlen mit dem Sieb des Eratosthenes finden, Primfaktorzerlegung mit Faktorbaum, ggT und kgV berechnen – auch in Sachaufgaben, Schritt für Schritt.",
    kurz: "Du siebst Primzahlen bis 100 aus, zerlegst Zahlen im Faktorbaum und bestimmst damit ggT und kgV.",
    text: [
      "Primzahlen sind die Bausteine aller natürlichen Zahlen. Jede Zahl lässt sich eindeutig in Primfaktoren zerlegen, zum Beispiel 60 = 2² · 3 · 5. Mit dieser Zerlegung findest du den größten gemeinsamen Teiler (ggT) und das kleinste gemeinsame Vielfache (kgV). Beides brauchst du später beim Kürzen und beim Hauptnenner.",
      "Im Modus Entdecken gibt es zwei Teile. Beim Sieb des Eratosthenes streichst du Schritt für Schritt die Vielfachen von 2, 3, 5 und 7. Übrig bleiben die Primzahlen bis 100. Im Faktorbaum wählst du eine Zahl und siehst, wie sie in ihre Primfaktoren zerfällt. Dazu gibt es kurze Animationen.",
      "Im Modus Trainieren wählst du zwischen „Primzahl?“, Primfaktorzerlegung, ggT, kgV und zwei Arten von Sachaufgaben. Bei den Sachaufgaben entscheidest du zuerst: Wird etwas ohne Rest aufgeteilt (ggT) oder treffen sich zwei Abläufe wieder (kgV)? Erst dann rechnest du. Jeder Schritt wird geprüft, und bei typischen Fehlern wie „1 ist eine Primzahl“ bekommst du einen Hinweis.",
    ],
    faq: [
      { f: "Ist 1 eine Primzahl?", a: "Nein. Eine Primzahl hat genau zwei verschiedene Teiler: 1 und sich selbst. Die 1 hat nur einen Teiler. Die kleinste Primzahl ist deshalb 2." },
      { f: "Was ist der Unterschied zwischen ggT und kgV?", a: "Der ggT ist die größte Zahl, die beide Zahlen ohne Rest teilt: ggT(12; 18) = 6. Das kgV ist die kleinste Zahl, die Vielfaches von beiden ist: kgV(12; 18) = 36." },
      { f: "Warum ist das Thema für mein Kind wichtig?", a: "Ohne ggT und kgV wird Bruchrechnen mühsam: Mit dem ggT kürzt man, mit dem kgV findet man den Hauptnenner. Sitzt dieses Thema, fällt Ihrem Kind das Rechnen mit Brüchen deutlich leichter." },
    ],
  },

  rechengesetze: {
    titel: "Punkt vor Strich üben: Rechengesetze verstehen",
    beschreibung: "Rechenreihenfolge üben: Klammer, Potenz, Punkt vor Strich. Dazu Kommutativ-, Assoziativ- und Distributivgesetz und geschickt im Kopf rechnen.",
    kurz: "Du rechnest Terme in der richtigen Reihenfolge Schritt für Schritt und lernst, mit Rechengesetzen geschickt zu rechnen.",
    text: [
      "Was ist 2 + 3 · 4? Wer einfach von links nach rechts rechnet, kommt auf 20. Richtig ist 14, denn Punkt geht vor Strich. Die feste Reihenfolge lautet: Klammern, dann Potenzen, dann Punktrechnung, dann Strichrechnung. Die Rechengesetze helfen dir außerdem, schwierige Aufgaben ganz leicht im Kopf zu lösen.",
      "Im Modus Entdecken wählst du einen Term, zum Beispiel 50 − 2 · (3 + 1)² oder 7 · 98. Das Werkzeug rechnet ihn Schritt für Schritt mit dir. Der nächste Rechenschritt ist jeweils markiert. Unter jedem Schritt steht, warum er jetzt dran ist, etwa „Klammer zuerst“ oder „Distributivgesetz: ausmultiplizieren“.",
      "Im Modus Trainieren gibt es sieben Aufgabentypen: Punkt vor Strich, Klammern, Potenzen, Distributivgesetz, Rechenvorteil, Gesetz benennen und Term aus Text. Bei „Rechenvorteil“ entscheidest du, welche Zahlen du zuerst zusammenfasst, damit es leicht wird. Bei „Term aus Text“ wählst du den passenden Term zu einer Beschreibung. Typische Fehler werden erkannt, zum Beispiel „Von links nach rechts gerechnet – Punkt vor Strich vergessen.“",
    ],
    faq: [
      { f: "In welcher Reihenfolge rechnet man?", a: "Klammern zuerst, dann Potenzen, dann Punktrechnung (· und :), zuletzt Strichrechnung (+ und −). Innerhalb einer Stufe rechnet man von links nach rechts." },
      { f: "Was sagt das Distributivgesetz?", a: "a · (b + c) = a · b + a · c. Damit rechnet man geschickt im Kopf: 7 · 98 = 7 · (100 − 2) = 700 − 14 = 686." },
      { f: "Mein Kind rechnet oft einfach von links nach rechts. Was hilft?", a: "Das Werkzeug zeigt die Reihenfolge an Beispielen Schritt für Schritt und erkennt genau diesen Fehler beim Üben. Ihr Kind bekommt dann einen Hinweis und kann den Schritt sofort korrigieren." },
    ],
  },

  groessen: {
    titel: "Einheiten umrechnen: Länge, Masse, Fläche, Volumen",
    beschreibung: "Größen umrechnen mit der Umrechnungstreppe: Längen, Massen, Zeit, Flächen, Volumen und Liter – dazu Maßstab auf Karten, Schritt für Schritt geübt.",
    kurz: "Mit der Umrechnungstreppe rechnest du Einheiten sicher um – von mm bis km, von ml bis hl, dazu Maßstab.",
    text: [
      "Beim Umrechnen passieren zwei typische Fehler. Man nimmt die falsche Umrechnungszahl, oder man rechnet in die falsche Richtung. Besonders tückisch sind Flächen und Volumen. Bei Flächen ist die Umrechnungszahl 100, bei Volumen 1000 und nicht 10 wie bei Längen.",
      "Im Modus Entdecken wählst du eine Größenart und eine Einheit und gibst eine Zahl ein. Das Werkzeug zeigt dir dieselbe Größe sofort in allen Einheiten. Die Umrechnungstreppe im Bild zeigt, mit welcher Zahl du von Stufe zu Stufe rechnest. Eine Stufe hinunter heißt mal, eine Stufe hinauf heißt geteilt.",
      "Im Modus Trainieren wählst du Längen, Massen, Zeit, Flächen, Volumen, Hohlmaße oder Maßstab. Jede Umrechnung geht in drei Schritten: Zuerst entscheidest du, ob die neue Einheit größer oder kleiner ist. Dann bestimmst du die Umrechnungszahl. Erst danach rechnest du das Ergebnis aus. Die Treppe steht dabei als Hilfe im Bild. Bei Maßstab-Aufgaben rechnest du Kartenlängen in echte Entfernungen um. Bei typischen Fehlern wie „Falsche Richtung: mal und geteilt vertauscht.“ bekommst du sofort einen Hinweis.",
    ],
    faq: [
      { f: "Wie rechnet man m² in cm² um?", a: "1 m² = 100 dm² = 10 000 cm². Bei Flächen ist die Umrechnungszahl zwischen benachbarten Einheiten 100, weil Länge und Breite jeweils mit 10 multipliziert werden." },
      { f: "Wie viele Milliliter sind ein Liter?", a: "1 l = 1000 ml. Außerdem gilt 1 l = 1 dm³. So kann man zwischen Hohlmaßen und Volumeneinheiten wechseln." },
      { f: "Wie kann ich mein Kind beim Umrechnen unterstützen?", a: "Lassen Sie Ihr Kind vor jeder Rechnung laut sagen, ob die Zahl größer oder kleiner werden muss. Genau diesen Schritt fragt das Werkzeug ab, bevor gerechnet wird. Das verhindert die meisten Richtungsfehler." },
    ],
  },

  zuordnungen: {
    titel: "Dreisatz üben: proportional und antiproportional",
    beschreibung: "Zuordnungen und Dreisatz üben: proportional oder antiproportional an Tabelle und Graph erkennen, auf eins schließen, Proportionalitätsfaktor bestimmen.",
    kurz: "Du erkennst proportionale und antiproportionale Zuordnungen an Tabelle und Graph und rechnest mit dem Dreisatz.",
    text: [
      "Bei einer Zuordnung gehört zu jedem x-Wert ein y-Wert. Proportional heißt: doppelt so viel x, doppelt so viel y. Antiproportional heißt: doppelt so viel x, halb so viel y. Der häufigste Fehler beim Dreisatz ist, die beiden Arten zu verwechseln. Dann rechnet man mal, wo man teilen müsste.",
      "Im Modus Entdecken schaltest du zwischen proportional und antiproportional um und stellst den Faktor k mit einem Regler ein. Tabelle und Graph ändern sich sofort mit. Bei proportionalen Zuordnungen bleibt der Quotient y : x gleich, und der Graph ist eine Gerade durch den Ursprung. Bei antiproportionalen bleibt das Produkt x · y gleich, und der Graph ist eine Hyperbel.",
      "Im Modus Trainieren gibt es sechs Aufgabentypen: Zuordnung erkennen, Dreisatz proportional, Dreisatz antiproportional, Proportionalitätsfaktor, Lücke in der Tabelle und Graph deuten. Beim Dreisatz schließt du erst auf eins und dann auf die gesuchte Menge. Rechnest du falsch herum, sagt dir der Hinweis, warum, zum Beispiel „Mehr Leute, weniger Zeit.“",
    ],
    faq: [
      { f: "Wie funktioniert der Dreisatz?", a: "In drei Schritten: gegebene Menge, dann auf eins schließen, dann auf die gesuchte Menge. 4 Hefte kosten 6 €, 1 Heft kostet 1,50 €, 7 Hefte kosten 10,50 €." },
      { f: "Woran erkennt man eine antiproportionale Zuordnung?", a: "Das Produkt x · y ist in der ganzen Tabelle gleich. Typisch: Mehr Arbeiter brauchen weniger Zeit. Der Graph ist keine Gerade, sondern eine Hyperbel." },
      { f: "Warum verwechselt mein Kind beim Dreisatz oft mal und geteilt?", a: "Meist fehlt der Blick auf die Art der Zuordnung. Das Werkzeug lässt Ihr Kind deshalb zuerst entscheiden, ob proportional oder antiproportional vorliegt, und erklärt falsche Rechenrichtungen direkt." },
    ],
  },

  prozent: {
    titel: "Prozentrechnung üben: Grundwert, Rabatt, Zinsen",
    beschreibung: "Prozentrechnung mit Prozentstreifen: Grundwert, Prozentwert und Prozentsatz berechnen, dazu Rabatt, Mehrwertsteuer, Netto aus Brutto und Zinsen.",
    kurz: "Am Prozentstreifen siehst du Grundwert, Prozentsatz und Prozentwert und übst Rabatt, Mehrwertsteuer und Zinsen.",
    text: [
      "Prozent heißt „von Hundert“. In jeder Prozentaufgabe stecken drei Größen: der Grundwert G (das Ganze, 100 %), der Prozentsatz p % und der Prozentwert W (der Teil). Schwierig ist meist nicht das Rechnen, sondern die Frage: Welche der drei Größen ist gesucht? Und was ist überhaupt das Ganze?",
      "Im Modus Entdecken stellst du Grundwert und Prozentsatz mit Reglern ein. Der Prozentstreifen zeigt, wie der Prozentwert mitwächst. Daneben steht derselbe Rechenweg zweimal: einmal als Dreisatz über 1 % und einmal mit der Formel W = G · p : 100. Kurze Animationen zu Prozentwert, Grundwert, Rabatt, Mehrwertsteuer und Zinseszins ergänzen das Bild.",
      "Im Modus Trainieren gibt es acht Aufgabentypen: Prozentwert, Grundwert, Prozentsatz, Rabatt, Mehrwertsteuer, Netto aus Brutto, Zinsen und Zinseszins. Bei „Netto aus Brutto“ steckt eine bekannte Falle: Man darf nicht einfach 19 % abziehen. Das Werkzeug erkennt diesen und andere typische Fehler und erklärt sie dir. Jede Aufgabe ist in kleine Schritte geteilt, zum Beispiel erst 1 %, dann der gesuchte Wert.",
      "Merke dir den Prozentstreifen als Bild: Links steht das Ganze (100 %), rechts der Teil. Bei Rabatt und Mehrwertsteuer ist die Frage immer, welche Zahl die 100 % ist – der alte Preis, nicht der neue. Das Werkzeug stellt deshalb bei jeder Aufgabe zuerst die Frage nach dem Grundwert und rechnet dann über 1 %. So funktioniert derselbe Weg für Rabatt, Zinsen, Netto aus Brutto und Zinseszins.",
      "Übe die acht Typen nicht durcheinander, sondern in Paaren: Prozentwert und Prozentsatz, Grundwert und Netto aus Brutto, Rabatt und Mehrwertsteuer, Zinsen und Zinseszins. Bei jeder Aufgabe schreibst du vorher auf, welche der drei Größen gesucht ist. Wer das zuverlässig kann, hat die Hälfte der Textaufgaben der Klasse 7 gelöst – der Rest ist Rechnen über 1 %.",
    ],
    beispiel: {
      aufgabe: "Ein Fahrrad kostet 238 € inklusive 19 % Mehrwertsteuer. Wie hoch sind Nettopreis und Mehrwertsteuer?",
      schritte: [
        "Grundwert bestimmen: Der Nettopreis ist das Ganze (100 %). Der Bruttopreis enthält zusätzlich 19 %, entspricht also 119 %.",
        "Auf 1 % zurückrechnen: 238 € : 119 = 2 € je Prozent.",
        "Netto berechnen: 100 % = 100 · 2 € = 200 €.",
        "Mehrwertsteuer: 19 % = 19 · 2 € = 38 €. Probe: 200 € + 38 € = 238 €.",
        "Die Falle: 19 % von 238 € abziehen ergibt 238 € − 45,22 € = 192,78 € – falsch, weil 238 € nicht der Grundwert ist. Genau diesen Fehler meldet das Werkzeug.",
      ],
      ergebnis: "Netto 200 €, Mehrwertsteuer 38 €. Kurzform: 238 € : 1,19 = 200 €.",
    },
    faq: [
      { f: "Wie berechnet man den Grundwert?", a: "Man rechnet über 1 %: Wenn 30 % genau 24 € sind, ist 1 % gleich 24 € : 30 = 0,80 €, und 100 % sind 80 €. Als Formel: G = W : p · 100." },
      { f: "Warum darf man vom Bruttopreis nicht einfach 19 % abziehen?", a: "Die 19 % Mehrwertsteuer werden vom Nettopreis berechnet. Der Bruttopreis entspricht also 119 %. Den Nettopreis erhält man daher mit Brutto : 1,19." },
      { f: "Braucht mein Kind Prozentrechnung auch später noch?", a: "Ja. Prozent- und Zinsrechnung kommt bis zum Abitur immer wieder vor, etwa bei Wachstum und in der Stochastik. Wer die drei Grundgrößen sicher unterscheidet, hat es in diesen Themen leichter." },
    ],
  },

  diagramme: {
    titel: "Mittelwert, Median, Diagramme: Daten auswerten",
    beschreibung: "Daten auswerten: Säulen- und Kreisdiagramme, relative Häufigkeit, Mittelwert, Median und Spannweite – mit einer Umfrage, die du selbst einstellst.",
    kurz: "Du stellst eine kleine Umfrage ein und siehst Säulen- und Kreisdiagramm, Mittelwert, Median und Spannweite live.",
    text: [
      "Daten begegnen dir überall: in Umfragen, Tabellen und Diagrammen. Um sie zu verstehen, brauchst du ein paar Kennwerte. Der Mittelwert ist die Summe geteilt durch die Anzahl. Der Median ist der mittlere Wert der sortierten Liste. Die Spannweite ist der größte minus der kleinste Wert. Oft verwechselt man Mittelwert und Median oder vergisst, die Liste zu sortieren.",
      "Im Modus Entdecken stellst du mit fünf Reglern die Ergebnisse einer Umfrage zu Hobbys ein. Säulen- und Kreisdiagramm ändern sich sofort mit. Gleichzeitig siehst du Gesamtzahl, relative Häufigkeit, Mittelwert, Median und Spannweite. Probier aus, was passiert, wenn eine Säule sehr hoch wird: Der Mittelwert springt, der Median kaum.",
      "Im Modus Trainieren gibt es sechs Aufgabentypen: Mittelwert, Median, Spannweite, relative Häufigkeit, Kreisdiagramm und Diagramm ablesen. Beim Kreisdiagramm berechnest du den Winkel für eine Gruppe, beim Ablesen liest du Werte aus einem Säulendiagramm. Jede Eingabe wird geprüft. Typische Fehler werden benannt, etwa „Das ist der Median, nicht der Mittelwert.“",
    ],
    faq: [
      { f: "Was ist der Unterschied zwischen Mittelwert und Median?", a: "Der Mittelwert ist die Summe aller Werte geteilt durch ihre Anzahl. Der Median ist der Wert in der Mitte der sortierten Liste. Ausreißer verändern den Mittelwert stark, den Median kaum." },
      { f: "Wie berechnet man den Winkel im Kreisdiagramm?", a: "Anteil mal 360°. Haben 6 von 24 Befragten Fußball gewählt, ist der Anteil 6/24 = 1/4, und der Winkel beträgt 360° : 4 = 90°." },
      { f: "Ist das Thema für mein Kind in Klasse 5 oder 6 schon wichtig?", a: "Ja. Diagramme lesen und Kennwerte berechnen gehört schon in den unteren Klassen zum Unterricht. Außerdem bereitet es auf die Stochastik vor, die bis zum Abitur weitergeführt wird." },
    ],
  },

  zufall: {
    titel: "Wahrscheinlichkeit üben: Würfel, Urne, Pfadregel",
    beschreibung: "Wahrscheinlichkeit verstehen: Würfel-Experiment bis 1000 Würfe, Laplace-Wahrscheinlichkeit, Urne, Gegenereignis, Pfadregel und relative Häufigkeit üben.",
    kurz: "Du würfelst bis zu tausendmal und siehst, wie sich die Häufigkeiten bei 1/6 einpendeln – dann übst du Wahrscheinlichkeiten.",
    text: [
      "Wie wahrscheinlich ist eine Sechs? Bei einem fairen Würfel ist jede Augenzahl gleich wahrscheinlich, also beträgt die Wahrscheinlichkeit 1/6. Trotzdem kommt bei sechs Würfen nicht immer genau eine Sechs. Dieser Unterschied zwischen Wahrscheinlichkeit und tatsächlicher Häufigkeit ist am Anfang verwirrend.",
      "Im Modus Entdecken würfelst du 10, 100 oder 1000 Mal auf einen Klick. Ein Diagramm zeigt die relativen Häufigkeiten aller sechs Augenzahlen. Daneben steht die größte Abweichung von 1/6. Bei wenigen Würfen schwanken die Werte stark, bei vielen Würfen kommen sie 1/6 immer näher. Das nennt man das empirische Gesetz der großen Zahlen.",
      "Im Modus Trainieren gibt es sechs Aufgabentypen: Würfel, Urne, Gegenereignis, zweistufige Zufallsversuche mit der Pfadregel, relative Häufigkeit und erwartete Anzahl. Wahrscheinlichkeiten gibst du als vollständig gekürzten Bruch ein. Bei typischen Fehlern bekommst du einen Hinweis, zum Beispiel „Entlang eines Pfades wird multipliziert, nicht addiert.“ Wenn du nicht weiterkommst, hilft dir „Ich hänge fest“ mit Hinweisen in kleinen Stufen.",
    ],
    faq: [
      { f: "Wie berechnet man eine Laplace-Wahrscheinlichkeit?", a: "Wenn alle Ergebnisse gleich wahrscheinlich sind, gilt: P(E) = Anzahl der günstigen Ergebnisse : Anzahl der möglichen Ergebnisse. Eine gerade Zahl würfeln: 3/6 = 1/2." },
      { f: "Was ist ein Gegenereignis?", a: "Das Gegenereignis tritt genau dann ein, wenn das Ereignis nicht eintritt. Es gilt P(nicht E) = 1 − P(E). Keine Sechs würfeln: 1 − 1/6 = 5/6." },
      { f: "Kann mein Kind Wahrscheinlichkeit verstehen, ohne viel zu rechnen?", a: "Ja, das ist der Sinn des Würfel-Experiments. Ihr Kind sieht selbst, wie sich die Häufigkeiten bei vielen Würfen einpendeln. Danach fällt die Rechnung mit Brüchen viel leichter." },
    ],
  },
};
