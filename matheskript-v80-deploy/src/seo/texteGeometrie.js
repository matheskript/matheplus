/* ======================================================================
   SEO-/KI-Texte der Werkzeuge: Geometrie (21.10.2026)
   Format je Werkzeug-Id (Schlüssel aus werkzeuge.js) – siehe texteAnalysis.js und src/seo/index.js:
     titel        für <title>, höchstens 60 Zeichen
     beschreibung Meta-Description, 110–155 Zeichen
     kurz         ein Satz, sichtbar über dem Aufklapper „Was kann dieses Werkzeug?“
     text         2–3 Absätze, zusammen 150–250 Wörter, Schüler geduzt, konkret: was das Werkzeug kann
     faq          genau 3 Fragen; die dritte aus Elternsicht (gesiezt)
   Nur beschreiben, was das Werkzeug wirklich kann (geprüft an func*.jsx, geoMittel*.js, unterGen.js, trigMittel.js).
   ====================================================================== */
export const TEXTE_GEOMETRIE = {
  koordinaten: {
    titel: "Koordinatensystem üben: Punkte ablesen und spiegeln",
    beschreibung: "Koordinatensystem üben: Punkte P(x | y) ablesen, an x-Achse, y-Achse und Ursprung spiegeln, Parallelogramme ergänzen und Symmetrieachsen finden.",
    kurz: "Du liest Punkte ab, spiegelst sie an Achsen und Punkten und findest die Symmetrieachsen bekannter Figuren.",
    text: [
      "Ein Punkt P(x | y) im Koordinatensystem: erst der Rechtswert, dann der Hochwert. Das klingt einfach, doch beim Spiegeln geraten die Vorzeichen schnell durcheinander. Welche Koordinate ändert sich an der x-Achse, welche an der y-Achse, und was passiert am Ursprung?",
      "Im Modus „Entdecken“ stellst du x und y mit Reglern ein und wählst die Spiegelung: an der x-Achse, an der y-Achse oder am Ursprung. Der Bildpunkt P′ erscheint sofort im Gitter, daneben stehen beide Koordinaten und die Regel dazu. Kurze Animationen zeigen, wie man Punkte einträgt, abliest und was Achsen- und Punktsymmetrie bedeuten.",
      "Im Modus „Trainieren“ wählst du einen Aufgabentyp oder „Gemischt“: Punkt ablesen, Spiegeln an den Achsen und am Ursprung, Punktspiegelung an einem Punkt Z, Parallelogramm ergänzen und Symmetrieachsen zählen – vom Quadrat bis zum regelmäßigen Sechseck. Du gibst Zahlen ein, und typische Fehler werden gezielt benannt, etwa wenn du statt an Z am Ursprung gespiegelt hast. Über „Ich hänge fest“ bekommst du gestufte Hilfe.",
    ],
    faq: [
      { f: "Was passiert mit den Koordinaten beim Spiegeln an der x-Achse?", a: "Die x-Koordinate bleibt gleich, die y-Koordinate wechselt das Vorzeichen: Aus P(3 | 2) wird P′(3 | −2). An der y-Achse ist es umgekehrt, am Ursprung wechseln beide Vorzeichen." },
      { f: "Wie viele Symmetrieachsen hat ein Rechteck?", a: "Zwei – die beiden Mittellinien durch gegenüberliegende Seitenmitten. Die Diagonalen sind keine Symmetrieachsen. Ein Quadrat hat vier, ein Parallelogramm keine, es ist aber punktsymmetrisch." },
      { f: "Ist das Werkzeug für mein Kind in der Unterstufe geeignet?", a: "Ja. Es richtet sich an die Unterstufe und beginnt beim Ablesen einzelner Punkte. Ihr Kind kann im eigenen Tempo vom Entdecken zum Üben wechseln und bekommt bei jedem Schritt eine Rückmeldung." },
    ],
  },

  flaechen: {
    titel: "Flächeninhalt und Umfang berechnen: Formeln verstehen",
    beschreibung: "Fläche und Umfang üben: Rechteck, Dreieck, Parallelogramm, Trapez und Drachen – jede Formel aus dem Rechteck hergeleitet, dazu zusammengesetzte Figuren.",
    kurz: "Du siehst jede Flächenformel aus dem Rechteck entstehen und rechnest dann selbst Umfang und Flächeninhalt.",
    text: [
      "Fünf Figuren, fünf Formeln – wer sie nur auswendig lernt, verwechselt sie schnell. Dabei kommt jede Formel vom Rechteck: Das Dreieck ist ein halbes Rechteck, das Parallelogramm wird umgelegt, das Trapez verdoppelt, der Drachen passt in ein Rechteck aus seinen Diagonalen. Dazu kommt die zweite Falle: Umfang und Fläche werden gern vertauscht.",
      "Im Modus „Entdecken“ wählst du Rechteck, Dreieck, Parallelogramm, Trapez oder Drachen und veränderst die Maße mit Reglern. Der Flächeninhalt rechnet live mit, und unter „Woher kommt die Formel?“ steht, wie die Figur aus dem Rechteck entsteht. Kurze Animationen zeigen das Zerlegen und Umlegen in Bewegung.",
      "Im Modus „Trainieren“ rechnest du Umfang und Fläche von Rechtecken, eine fehlende Seite aus der Fläche, Flächen von Dreieck, Parallelogramm, Trapez und Drachen sowie eine zusammengesetzte L-Figur. Jede Aufgabe hat eine Skizze mit Maßen und ist in Schritte geteilt. Typische Fehler werden erkannt, zum Beispiel wenn du beim Parallelogramm die schräge Seite statt der Höhe nimmst.",
    ],
    faq: [
      { f: "Wie berechnet man den Flächeninhalt eines Trapezes?", a: "Mit A = (a + c) · h : 2. Dabei sind a und c die beiden parallelen Seiten und h ihr senkrechter Abstand. Zwei gleiche Trapeze ergeben zusammen ein Parallelogramm – daher das „: 2“." },
      { f: "Was ist der Unterschied zwischen Umfang und Flächeninhalt?", a: "Der Umfang ist der Weg einmal außen herum und wird in cm gemessen. Der Flächeninhalt ist das, was innen liegt, und wird in cm² gemessen. Beim Rechteck: u = 2a + 2b, A = a · b." },
      { f: "Hilft das Werkzeug meinem Kind, die Formeln zu behalten?", a: "Ja, weil es die Formeln nicht nur nennt, sondern zeigt, wie sie aus dem Rechteck entstehen. Wer das einmal gesehen hat, kann eine vergessene Formel selbst wieder herleiten." },
    ],
  },

  quader: {
    titel: "Quader und Würfel: Volumen, Oberfläche, Würfelnetze",
    beschreibung: "Quader und Würfel verstehen: Volumen aus Einheitswürfeln, Oberfläche aus sechs Rechtecken, Kantenlänge – und welche Würfelnetze sich falten lassen.",
    kurz: "Du baust Quader aus Einheitswürfeln, berechnest Volumen, Oberfläche und Kanten und prüfst, welche Netze sich zum Würfel falten.",
    text: [
      "Volumen, Oberfläche, Kantenlänge – drei Größen am selben Quader, drei verschiedene Formeln. Das Volumen zählt die Einheitswürfel: V = a · b · c. Die Oberfläche besteht aus drei Paaren gleicher Rechtecke. Und bei Würfelnetzen hilft nur räumliches Vorstellen: Welche Flächen liegen nach dem Falten gegenüber?",
      "Im Modus „Entdecken“ wählst du zwischen „Quader aus Würfeln“ und „Würfelnetze falten“. Beim Quader stellst du Länge, Breite und Höhe mit Reglern ein und siehst Volumen, Oberfläche oder Kanten. Bei den Netzen wählst du eines aus und erfährst, ob es ein Würfelnetz ist. Gleiche Farben zeigen gegenüberliegende Flächen. Kurze Animationen erklären Volumen, Oberfläche und Netze.",
      "Im Modus „Trainieren“ berechnest du Volumen, Oberfläche und Kantenlänge, die Höhe aus dem Volumen und Aufgaben am Würfel. Außerdem erkennst du unter mehreren Figuren das echte Würfelnetz. Jede Aufgabe ist in Schritte geteilt. Rechnest du bei der Oberfläche nur drei statt sechs Flächen, sagt dir die Rückmeldung genau das. Über „Ich hänge fest“ bekommst du gestufte Hilfe.",
    ],
    faq: [
      { f: "Wie berechnet man die Oberfläche eines Quaders?", a: "Mit O = 2 · (ab + ac + bc). Jede der drei verschiedenen Rechteckflächen kommt zweimal vor: oben und unten, vorn und hinten, links und rechts." },
      { f: "Woran erkennt man, ob ein Netz ein Würfelnetz ist?", a: "Es hat sechs Quadrate, und beim Falten darf keine Fläche doppelt belegt werden. Ein 2 × 2-Block oder fünf Quadrate in einer Reihe sind nie ein Würfelnetz. Es gibt genau 11 verschiedene Würfelnetze." },
      { f: "Mein Kind tut sich mit räumlichem Vorstellen schwer. Hilft das Werkzeug?", a: "Es zeigt Quader aus Einheitswürfeln und markiert in Netzen mit Farben, welche Flächen sich gegenüberliegen. So bekommt Ihr Kind ein Bild, bevor es rechnet, und kann Vermutungen sofort prüfen." },
    ],
  },

  winkelsaetze: {
    titel: "Winkel an Parallelen und Winkelsumme üben",
    beschreibung: "Winkel üben: Scheitel-, Neben-, Stufen-, Wechsel- und Nachbarwinkel an Parallelen, Winkelsumme im Dreieck und im n-Eck, Außenwinkel – mit Begründung.",
    kurz: "Du erkennst Winkelbeziehungen an Parallelen, nutzt die Winkelsumme im Dreieck und im n-Eck und berechnest fehlende Winkel mit Begründung.",
    text: [
      "Fehlende Winkel findest du mit wenigen Werkzeugen: Scheitel-, Stufen- und Wechselwinkel sind gleich groß, Neben- und Nachbarwinkel ergänzen sich zu 180°. Im Dreieck ist die Winkelsumme 180°, im n-Eck (n − 2) · 180°. Schwierig ist meist nicht das Rechnen, sondern das Erkennen: Welche Beziehung haben die beiden Winkel überhaupt?",
      "Im Modus „Entdecken“ wählst du ein Thema. Bei „Winkel an Parallelen“ veränderst du den Schnittwinkel und siehst, welche Winkel gleich sind. Bei der Winkelsumme im Dreieck verschiebst du Punkt C – die Parallele durch C zeigt, warum immer 180° herauskommen. Beim n-Eck stellst du die Eckenzahl ein und siehst die Zerlegung in n − 2 Dreiecke.",
      "Im Modus „Trainieren“ gibt es Winkel an Parallelen, den dritten Winkel im Dreieck, gleichschenklige Dreiecke, Außenwinkel, die Winkelsumme im n-Eck und regelmäßige n-Ecke. Bei Parallelen benennst du zuerst die Beziehung und rechnest dann. Verwechselst du gleich große mit sich ergänzenden Winkeln, sagt dir die Rückmeldung genau das.",
    ],
    faq: [
      { f: "Was ist der Unterschied zwischen Stufenwinkeln und Wechselwinkeln?", a: "Stufenwinkel haben an beiden Parallelen die gleiche Lage. Wechselwinkel liegen zwischen den Parallelen auf verschiedenen Seiten der Schnittgeraden. An Parallelen sind beide gleich groß." },
      { f: "Wie groß ist die Winkelsumme im Sechseck?", a: "(n − 2) · 180° mit n = 6 ergibt 720°. Im regelmäßigen Sechseck ist jeder Innenwinkel daher 720° : 6 = 120°." },
      { f: "Warum soll mein Kind die Winkelbeziehung benennen statt nur zu rechnen?", a: "Weil in Klassenarbeiten eine Begründung verlangt wird. Das Werkzeug fragt deshalb zuerst nach der Beziehung, etwa „Wechselwinkel“, und erst danach nach der Zahl. So übt Ihr Kind beides zusammen." },
    ],
  },

  konstruktion: {
    titel: "Besondere Linien im Dreieck: Umkreis, Inkreis, Schwerpunkt",
    beschreibung: "Besondere Linien im Dreieck: Mittelsenkrechte, Winkelhalbierende, Höhe, Seitenhalbierende – mit Umkreis, Inkreis, Schwerpunkt und Euler-Gerade.",
    kurz: "Du verschiebst eine Ecke und siehst, wo sich Mittelsenkrechten, Winkelhalbierende, Höhen und Seitenhalbierende schneiden.",
    text: [
      "Jedes Dreieck hat vier Sorten besonderer Linien, und je drei davon treffen sich in einem Punkt: Mittelsenkrechten im Umkreismittelpunkt, Winkelhalbierende im Inkreismittelpunkt, Höhen im Höhenschnittpunkt, Seitenhalbierende im Schwerpunkt. Leicht verwechselt man, welcher Punkt zu welcher Linie gehört und was er bedeutet.",
      "Im Modus „Entdecken“ wählst du die Linienart und verschiebst Punkt C. Du siehst, wie die Linien mitwandern, und liest an der Erklärung ab, was jeden Schnittpunkt ausmacht. Ein Hinweis zeigt, wo der Umkreismittelpunkt bei spitz-, recht- und stumpfwinkligen Dreiecken liegt. Auf Wunsch blendest du die Euler-Gerade ein, auf der Umkreismittelpunkt, Schwerpunkt und Höhenschnittpunkt liegen.",
      "Im Modus „Trainieren“ ordnest du Linien und Schnittpunkte ihren Eigenschaften zu, bestimmst die Lage des Umkreismittelpunkts, berechnest einen Schwerpunkt aus Koordinaten, den Umkreismittelpunkt eines rechtwinkligen Dreiecks, einen Inkreisradius und die Teilung 2 : 1 der Seitenhalbierenden. Jede Aufgabe ist in Schritte geteilt, mit Hinweisen und gezielter Rückmeldung – zum Beispiel, wenn du beim Schwerpunkt durch 2 statt durch 3 teilst.",
    ],
    faq: [
      { f: "Wie konstruiert man den Umkreis eines Dreiecks?", a: "Man zeichnet zwei Mittelsenkrechten der Seiten. Ihr Schnittpunkt ist der Umkreismittelpunkt U, der Abstand von U zu einer Ecke ist der Radius. Die dritte Mittelsenkrechte geht ebenfalls durch U." },
      { f: "Was ist der Unterschied zwischen Umkreis und Inkreis?", a: "Der Umkreis geht durch alle drei Ecken, sein Mittelpunkt liegt auf den Mittelsenkrechten. Der Inkreis berührt alle drei Seiten, sein Mittelpunkt liegt auf den Winkelhalbierenden." },
      { f: "Ersetzt das Werkzeug das Konstruieren mit Zirkel und Geodreieck?", a: "Nein. Es zeigt, warum die Konstruktionen funktionieren und wie sich die Punkte bei verschiedenen Dreiecken verhalten. Das Zeichnen von Hand sollte Ihr Kind trotzdem im Heft üben." },
    ],
  },

  kongruenz: {
    titel: "Kongruenzsätze üben: SSS, SWS, WSW und SsW",
    beschreibung: "Kongruenzsätze verstehen: Wann legen drei Stücke ein Dreieck eindeutig fest? SSS, SWS, WSW und SsW konstruieren, SSW und WWW als Gegenbeispiele.",
    kurz: "Du probierst Dreieckskonstruktionen aus und entscheidest, ob drei gegebene Stücke genau ein Dreieck festlegen.",
    text: [
      "Zwei Dreiecke sind kongruent, wenn sie deckungsgleich sind. Dafür reicht es, drei passende Stücke zu vergleichen – aber nicht irgendwelche drei. SSS, SWS, WSW und SsW legen ein Dreieck eindeutig fest. Bei drei Winkeln oder bei zwei Seiten mit dem Winkel gegenüber der kleineren Seite klappt das nicht. Genau dieser Unterschied ist in Klassenarbeiten gefragt.",
      "Im Modus „Entdecken“ wählst du einen Fall: SSS, SWS, WSW, SsW / SSW oder WWW. Du veränderst die Stücke mit Reglern und siehst die Konstruktion, bei SSS zum Beispiel mit zwei Kreisen. Das Werkzeug zeigt, ob genau ein Dreieck, zwei verschiedene, keines oder unendlich viele entstehen – und warum.",
      "Im Modus „Trainieren“ gibt es zwei Aufgabentypen. Bei „Angaben prüfen“ entscheidest du, welcher Kongruenzsatz passt und wie viele Dreiecke es gibt. Bei „An Figuren begründen“ suchst du in einer Figur die übereinstimmenden Stücke und nennst den passenden Satz. Fehler werden gezielt erklärt, etwa wenn der Winkel nicht zwischen den beiden Seiten liegt.",
    ],
    faq: [
      { f: "Was ist der Unterschied zwischen SsW und SSW?", a: "Bei beiden sind zwei Seiten und ein Winkel gegeben, der nicht zwischen ihnen liegt. Liegt der Winkel der größeren Seite gegenüber (SsW), ist das Dreieck eindeutig. Liegt er der kleineren gegenüber, kann es null, ein oder zwei Dreiecke geben." },
      { f: "Warum ist WWW kein Kongruenzsatz?", a: "Drei gleiche Winkel legen nur die Form fest, nicht die Größe. Man kann das Dreieck beliebig vergrößern oder verkleinern. Solche Dreiecke sind ähnlich, aber nicht kongruent." },
      { f: "Mein Kind soll Kongruenz begründen und weiß nicht, wie. Hilft das Werkzeug?", a: "Ja. Im Aufgabentyp „An Figuren begründen“ geht Ihr Kind Schritt für Schritt vor: erst die übereinstimmenden Stücke finden, dann den passenden Satz wählen. Genau diese Reihenfolge braucht eine Begründung." },
    ],
  },

  thales: {
    titel: "Satz des Thales: rechter Winkel im Halbkreis",
    beschreibung: "Satz des Thales verstehen und üben: rechter Winkel im Halbkreis, Beweis in Schritten, Umkehrung, Umkreis rechtwinkliger Dreiecke und Tangente.",
    kurz: "Du bewegst einen Punkt auf dem Halbkreis, siehst den rechten Winkel und übst Beweis, Umkreis und Tangente.",
    text: [
      "Liegt C auf einem Kreis über dem Durchmesser AB, ist der Winkel bei C immer ein rechter – egal wo C liegt. Umgekehrt ist in jedem rechtwinkligen Dreieck die Hypotenuse Durchmesser des Umkreises. Der Satz ist kurz, doch viele erkennen in Aufgaben nicht, dass er gerade gebraucht wird.",
      "Im Modus „Entdecken“ verschiebst du C mit einem Regler auf dem Kreis und siehst, dass der Winkel bei C immer 90° beträgt. Mit dem Regler „Abstand“ ziehst du C nach innen oder außen: Dann wird der Winkel stumpf oder spitz. Auf Wunsch blendest du die Beweisidee mit den beiden gleichschenkligen Dreiecken ein.",
      "Im Modus „Trainieren“ berechnest du Winkel im Thaleskreis und führst den Beweis in Schritten selbst. Weitere Aufgabentypen sind der Radius des Thaleskreises, die Lage eines Punktes innen, auf oder außerhalb des Kreises, die Tangente von einem Punkt an einen Kreis und der Umkreis eines rechtwinkligen Dreiecks. Dabei kommt auch der Satz des Pythagoras zum Einsatz.",
    ],
    faq: [
      { f: "Was besagt der Satz des Thales?", a: "Liegt der Punkt C auf einem Kreis mit dem Durchmesser AB, dann ist der Winkel ∠ACB ein rechter Winkel. Der Kreis heißt Thaleskreis über AB." },
      { f: "Wie beweist man den Satz des Thales?", a: "Man verbindet C mit dem Mittelpunkt M. Es entstehen zwei gleichschenklige Dreiecke mit gleichen Basiswinkeln α und β. Die Winkelsumme ergibt 2α + 2β = 180°, also ist der Winkel bei C gleich α + β = 90°." },
      { f: "Kann mein Kind mit dem Werkzeug auch Beweise üben?", a: "Ja. Im Aufgabentyp „Beweis in Schritten“ rechnet Ihr Kind den Beweis an einem Beispiel nach, Winkel für Winkel und mit Rückmeldung zu jedem Schritt. So wird aus dem Beweis eine nachvollziehbare Rechnung." },
    ],
  },

  pythagoras: {
    titel: "Satz des Pythagoras üben: Hypotenuse, Kathete, Raum",
    beschreibung: "Satz des Pythagoras üben: Hypotenuse und Kathete berechnen, Seiten benennen, Umkehrung prüfen, Sachaufgabe mit Leiter und Raumdiagonale im Quader.",
    kurz: "Du siehst die Quadrate über den Seiten und berechnest Schritt für Schritt Hypotenuse, Kathete und Raumdiagonale.",
    text: [
      "Im rechtwinkligen Dreieck gilt a² + b² = c². Die Formel kennen fast alle – die Fehler passieren woanders: Die Hypotenuse wird nicht erkannt, bei der Kathete wird addiert statt subtrahiert, oder man rechnet (a + b)² statt a² + b².",
      "Im Modus „Entdecken“ stellst du die Seiten a und b und den Winkel γ mit Reglern ein. Über allen drei Seiten stehen Quadrate, und du vergleichst a² + b² mit c². Nur bei γ = 90° sind beide gleich. Bei spitzem Winkel ist c² kleiner, bei stumpfem größer – so wird auch die Umkehrung des Satzes sichtbar.",
      "Im Modus „Trainieren“ gibt es sechs Aufgabentypen: Hypotenuse berechnen, Kathete berechnen, Seiten benennen, Umkehrung prüfen, eine Sachaufgabe mit Leiter und die Raumdiagonale im Quader. Jede Aufgabe ist in Schritte geteilt: Gleichung aufstellen, quadrieren, addieren oder subtrahieren, Wurzel ziehen. Typische Fehler werden erkannt und erklärt, etwa wenn du (a + b)² rechnest oder am Ende die Wurzel vergisst.",
      "Für Klassenarbeiten lohnt sich eine Routine: Zuerst den rechten Winkel markieren, dann die Hypotenuse benennen (sie liegt dem rechten Winkel gegenüber und ist die längste Seite), dann erst die Gleichung aufstellen. Wer die Hypotenuse sucht, addiert die Quadrate; wer eine Kathete sucht, subtrahiert. Am Ende die Wurzel ziehen und das Ergebnis mit Einheit und sinnvoll gerundet hinschreiben.",
      "Übe die Typen in dieser Reihenfolge: Seiten benennen, Hypotenuse berechnen, Kathete berechnen, dann Sachaufgaben und Raumdiagonale. Die Raumdiagonale im Quader braucht den Satz zweimal – erst die Flächendiagonale, dann die Raumdiagonale – und ist die häufigste Transferaufgabe in Klassenarbeiten. Danach geht es weiter mit Kathetensatz und Höhensatz sowie der Trigonometrie im rechtwinkligen Dreieck.",
    ],
    beispiel: {
      aufgabe: "Eine 5 m lange Leiter lehnt an einer Wand. Ihr Fuß steht 1,5 m von der Wand entfernt. Wie hoch reicht die Leiter?",
      schritte: [
        "Skizze: Wand, Boden und Leiter bilden ein rechtwinkliges Dreieck. Der rechte Winkel liegt zwischen Wand und Boden, die Leiter ist die Hypotenuse c = 5 m.",
        "Gesucht ist die Kathete h an der Wand, bekannt die Kathete 1,5 m am Boden: h² + 1,5² = 5².",
        "Nach h² auflösen (Kathete gesucht, also subtrahieren): h² = 25 − 2,25 = 22,75.",
        "Wurzel ziehen: h = √22,75 ≈ 4,77 m.",
        "Plausibilität: Die Höhe muss kleiner als die Leiter sein – 4,77 m < 5 m, passt. Der typische Fehler wäre h² = 25 + 2,25, also 5,22 m, länger als die Leiter selbst.",
      ],
      ergebnis: "Die Leiter reicht etwa 4,77 m hoch. Im Werkzeug ist diese Aufgabe der Typ „Sachaufgabe mit Leiter“; die Schritte Gleichung aufstellen, umstellen und Wurzel ziehen werden einzeln geprüft.",
    },
    faq: [
      { f: "Wie berechnet man eine Kathete mit dem Satz des Pythagoras?", a: "Man stellt a² + b² = c² um: b² = c² − a². Erst quadrieren, dann subtrahieren, ganz am Ende die Wurzel ziehen. Die Kathete ist immer kürzer als die Hypotenuse." },
      { f: "Wie berechnet man die Raumdiagonale eines Quaders?", a: "Zweimal mit Pythagoras: Zuerst die Diagonale der Grundfläche, e² = a² + b². Dann bilden e, die Höhe h und die Raumdiagonale d ein rechtwinkliges Dreieck: d² = e² + h²." },
      { f: "Woran erkenne ich, wo mein Kind beim Pythagoras Fehler macht?", a: "Das Werkzeug teilt jede Aufgabe in Schritte und benennt typische Fehler direkt, etwa „Du hast addiert. Bei der Kathete wird subtrahiert.“ Wenn Sie zuschauen, sehen Sie so, an welchem Schritt es hakt." },
    ],
  },

  kathetensatz: {
    titel: "Kathetensatz und Höhensatz üben: a² = c · p, h² = p · q",
    beschreibung: "Kathetensatz und Höhensatz verstehen: flächengleiche Quadrate und Rechtecke im rechtwinkligen Dreieck, Höhe, Kathete und Hypotenusenabschnitte berechnen.",
    kurz: "Du verschiebst den Höhenfußpunkt und siehst, warum Quadrat und Rechteck gleich groß bleiben – dann rechnest du selbst.",
    text: [
      "Die Höhe auf die Hypotenuse teilt das rechtwinklige Dreieck in zwei kleinere, ähnliche Dreiecke und die Hypotenuse c in die Abschnitte p und q. Daraus folgen zwei Flächensätze: der Kathetensatz a² = c · p und der Höhensatz h² = p · q. Schwierig ist vor allem die Wahl: Welcher Satz passt zu den gegebenen Größen?",
      "Im Modus „Entdecken“ wählst du Kathetensatz oder Höhensatz, stellst die Hypotenuse c ein und verschiebst den Fußpunkt der Höhe. Das Bild zeigt das Quadrat und das flächengleiche Rechteck, die Werte darunter rechnen mit. So siehst du, dass die Gleichheit für jede Lage des Fußpunkts gilt.",
      "Im Modus „Trainieren“ berechnest du die Höhe aus p und q, eine Kathete aus c und p, einen Abschnitt aus a und c oder aus h und p sowie die Höhe über die Fläche des Dreiecks. Bei vielen Aufgaben wählst du zuerst den passenden Satz und rechnest dann. Vergisst du die Wurzel oder stellst falsch um, bekommst du einen gezielten Hinweis.",
    ],
    faq: [
      { f: "Was ist der Unterschied zwischen Kathetensatz und Höhensatz?", a: "Der Kathetensatz verbindet eine Kathete mit der Hypotenuse und dem anliegenden Abschnitt: a² = c · p. Der Höhensatz verbindet die Höhe mit beiden Abschnitten: h² = p · q." },
      { f: "Wie berechnet man die Höhe im rechtwinkligen Dreieck?", a: "Sind die Abschnitte bekannt, mit dem Höhensatz: h = √(p · q). Sind die Seiten bekannt, über die Fläche: h = a · b : c, weil a · b : 2 und c · h : 2 dieselbe Fläche beschreiben." },
      { f: "Braucht mein Kind Kathetensatz und Höhensatz, wenn es den Pythagoras kann?", a: "Viele Aufgaben lassen sich auch mit Pythagoras lösen, aber nur über Umwege. Die beiden Sätze führen oft direkt zum Ziel. Fragen Sie bei der Lehrkraft nach, ob sie im aktuellen Unterricht verlangt werden." },
    ],
  },

  kreis: {
    titel: "Kreis berechnen: Umfang, Fläche, Kreisbogen, Sektor",
    beschreibung: "Kreisberechnung üben: Umfang u = 2πr, Fläche A = πr², Kreisbogen, Kreisausschnitt und Kreisring – auch rückwärts den Radius aus Umfang oder Fläche.",
    kurz: "Du stellst Radius und Winkel ein und siehst Umfang, Fläche, Bogen und Kreisausschnitt – dann rechnest du vorwärts und rückwärts.",
    text: [
      "Am Kreis hängt alles an zwei Formeln: u = 2πr und A = πr². Fehler entstehen trotzdem: Durchmesser und Radius werden vertauscht, π wird mitquadriert, oder beim Rückwärtsrechnen fehlt die Wurzel. Kreisbogen und Kreisausschnitt sind dann nur noch der Anteil α : 360° vom Ganzen.",
      "Im Modus „Entdecken“ stellst du den Radius r und den Mittelpunktswinkel α mit Reglern ein. Du siehst den Kreis mit Ausschnitt und alle Werte auf einen Blick: Durchmesser, Umfang, Fläche, Anteil, Bogenlänge und Sektorfläche. Unter „Warum π?“ steht, weshalb das Verhältnis von Umfang zu Durchmesser bei jedem Kreis gleich ist.",
      "Im Modus „Trainieren“ gibt es acht Aufgabentypen: Umfang, Flächeninhalt, Radius aus dem Umfang, Radius aus der Fläche, Kreisbogen, Kreisausschnitt, Kreisring und Fläche aus dem Durchmesser. Du rundest auf zwei Nachkommastellen. Typische Fehler, etwa der halbe Umfang oder d statt r in der Flächenformel, werden erkannt und erklärt. Bleibst du hängen, hilft dir „Ich hänge fest“ Schritt für Schritt weiter.",
    ],
    faq: [
      { f: "Wie berechnet man den Radius aus der Kreisfläche?", a: "Man stellt A = πr² nach r um: erst durch π teilen, dann die Wurzel ziehen, also r = √(A : π). Bei A = 50 cm² ergibt das r ≈ 3,99 cm." },
      { f: "Wie berechnet man die Fläche eines Kreisausschnitts?", a: "Als Anteil der ganzen Kreisfläche: A = πr² · α : 360°. Ein Ausschnitt mit α = 90° ist also genau ein Viertel des Kreises." },
      { f: "Mein Kind verwechselt ständig Radius und Durchmesser. Hilft das Werkzeug?", a: "Ja. Bei Aufgaben mit gegebenem Durchmesser fragt das Werkzeug zuerst nach dem Radius. Rechnet Ihr Kind trotzdem mit d, weist die Rückmeldung darauf hin, dass die Fläche dann viermal zu groß wird." },
    ],
  },

  koerper: {
    titel: "Volumen und Oberfläche: Zylinder, Kegel, Pyramide, Kugel",
    beschreibung: "Volumen und Oberfläche von Prisma, Zylinder, Pyramide, Kegel und Kugel berechnen – mit Schrägbild und Pythagoras für Mantellinie und Seitenhöhe.",
    kurz: "Du siehst Prisma, Zylinder, Pyramide, Kegel und Kugel im Schrägbild und berechnest Volumen und Oberfläche in Schritten.",
    text: [
      "Bei Körpern hilft eine Unterscheidung: Gerade Körper wie Prisma und Zylinder haben das Volumen V = G · h, spitze Körper wie Pyramide und Kegel nur ein Drittel davon. Bei der Oberfläche wird es schwieriger: Für Kegel und Pyramide brauchst du die schräge Höhe, und die liefert der Satz des Pythagoras.",
      "Im Modus „Entdecken“ wählst du Prisma, Zylinder, Pyramide, Kegel oder Kugel und stellst die Maße mit Reglern ein. Das Schrägbild ändert sich mit, daneben stehen Grundfläche, Volumen und Oberfläche. Bei Kegel und Pyramide siehst du, wie Mantellinie und Seitenhöhe mit Pythagoras berechnet werden.",
      "Im Modus „Trainieren“ berechnest du Volumen und Oberfläche von Zylinder, Pyramide, Kegel und Kugel, das Volumen eines Prismas und die Höhe aus dem Volumen. Die Aufgaben sind in Schritte geteilt, zum Beispiel erst Grundfläche, dann Mantellinie, dann Oberfläche. Vergisst du beim Kegel das Drittel oder rechnest den Mantel mit h statt mit s, wird genau das angesprochen.",
    ],
    faq: [
      { f: "Wie berechnet man die Oberfläche eines Kegels?", a: "O = πr² + πrs. Dabei ist s die Mantellinie, die man mit Pythagoras bestimmt: s = √(r² + h²). Mit der Höhe h statt s wird der Mantel zu klein." },
      { f: "Warum hat eine Pyramide nur ein Drittel des Volumens eines Prismas?", a: "Ein Würfel lässt sich in drei gleich große Pyramiden mit gleicher Grundfläche und Höhe zerlegen. Allgemein gilt für spitze Körper V = G · h : 3." },
      { f: "Kann mein Kind damit für eine Klassenarbeit über Körper üben?", a: "Ja. Es gibt Aufgaben zu allen fünf Körpern, jeweils zu Volumen und Oberfläche, in Schritten mit Rückmeldung. Über „Ich hänge fest“ bekommt Ihr Kind Hilfe, ohne gleich die ganze Lösung zu sehen." },
    ],
  },

  strahlensaetze: {
    titel: "Strahlensätze üben: V-Figur, X-Figur, Streckfaktor",
    beschreibung: "Strahlensätze verstehen und üben: 1. und 2. Strahlensatz in V-Figur und X-Figur, Streckfaktor k, die Abschnitt-Falle und Sachaufgaben mit Schatten.",
    kurz: "Du veränderst V- und X-Figur mit Reglern, siehst alle Verhältnisse live und löst dann Aufgaben zum 1. und 2. Strahlensatz.",
    text: [
      "Zwei Strahlen mit gemeinsamem Anfangspunkt S, geschnitten von zwei Parallelen: Alle zugehörigen Strecken stehen im selben Verhältnis k. Die häufigste Falle steckt im 2. Strahlensatz. Dort zählen nur Strecken, die in S beginnen – nicht der Abschnitt AA′. Dazu kommt der Kehrwert, der beim Aufstellen leicht hineinrutscht.",
      "Im Modus „Entdecken“ wählst du V-Figur oder X-Figur und veränderst die Längen und den Streckfaktor k mit Reglern. Alle Strecken und Verhältnisse rechnen live mit. Ein eigener Abschnitt zeigt die häufigste Falle: Das Verhältnis mit AA′ passt beim 2. Strahlensatz nicht zu k.",
      "Im Modus „Trainieren“ gibt es Aufgaben zum 1. Strahlensatz, zum 2. Strahlensatz, mit gegebenem Abschnitt, rückwärts gerechnet und als Sachaufgabe, bei der du eine Baumhöhe aus Schatten bestimmst. Du wählst zuerst die richtige Verhältnisgleichung und rechnest dann. Erwischst du den Kehrwert oder rechnest mit Differenzen statt Verhältnissen, sagt dir die Rückmeldung genau das. Zur Probe hilft immer: Die große Figur hat die längeren Strecken.",
    ],
    faq: [
      { f: "Was ist der Unterschied zwischen dem 1. und 2. Strahlensatz?", a: "Der 1. Strahlensatz vergleicht Strecken auf den beiden Strahlen: SA′ : SA = SB′ : SB. Der 2. Strahlensatz vergleicht die parallelen Strecken mit Strecken ab S: A′B′ : AB = SA′ : SA." },
      { f: "Gelten die Strahlensätze auch in der X-Figur?", a: "Ja. Kreuzen sich zwei Geraden in S und werden von zwei Parallelen geschnitten, gelten beide Strahlensätze genauso. Beim 2. Strahlensatz dürfen auch hier nur Strecken verwendet werden, die in S beginnen." },
      { f: "Mein Kind stellt die Verhältnisse immer falsch auf. Was hilft?", a: "Das Werkzeug lässt zuerst die richtige Gleichung auswählen und erklärt bei einer falschen Wahl, warum sie nicht stimmt, etwa beim Kehrwert. Eine Probe bleibt sinnvoll: Die große Figur muss die längeren Strecken haben." },
    ],
  },

  trigonometrie: {
    titel: "Trigonometrie üben: sin, cos, tan bis Kosinussatz",
    beschreibung: "Trigonometrie vom Einheitskreis aus: sin, cos und tan verstehen, Bogenmaß, rechtwinklige Dreiecke, Steigungswinkel sowie Sinus- und Kosinussatz üben.",
    kurz: "Ein Lernweg in sechs Kapiteln: vom Einheitskreis über das rechtwinklige Dreieck bis zum Sinus- und Kosinussatz.",
    text: [
      "Sinus, Kosinus und Tangens werden oft nur als Seitenverhältnisse auswendig gelernt. Am Einheitskreis wird klar, was sie wirklich sind: cos α und sin α sind die Koordinaten eines Punktes. Von dort aus ergeben sich das rechtwinklige Dreieck, der Tangens als Steigung und schließlich Sinus- und Kosinussatz für jedes Dreieck.",
      "Das Werkzeug ist ein Lernweg in sechs Kapiteln: Einheitskreis, Grad und Bogenmaß, rechtwinkliges Dreieck, Tangens, Sinus- und Kosinussatz und „Alles gemischt“. Die ersten fünf Kapitel haben je ein Erklärvideo als Animation, eine interaktive Darstellung und eigene Übungen; das letzte mischt alle Aufgaben. Dazu gehören Vorzeichen in den Quadranten, die Umrechnung zwischen Grad- und Bogenmaß, Seiten und Winkel im rechtwinkligen Dreieck, Sachaufgaben, Steigung in Prozent sowie Kosinussatz (SWS, SSS) und Sinussatz (WSW, SsW).",
      "Du kannst eine Zahl oder eine Rechnung eingeben. Der eingebaute Rechner hat ein eigenes Tastenfeld und lässt sich wie ein Taschenrechner zwischen DEG und RAD umschalten. Rechnest du versehentlich im Bogenmaß, erkennt die Rückmeldung genau diesen Fehler.",
    ],
    faq: [
      { f: "Wann nehme ich Sinus, Kosinus oder Tangens?", a: "Es kommt darauf an, welche Seiten gegeben oder gesucht sind. Sinus: Gegenkathete durch Hypotenuse. Kosinus: Ankathete durch Hypotenuse. Tangens: Gegenkathete durch Ankathete." },
      { f: "Wann brauche ich den Kosinussatz und wann den Sinussatz?", a: "Den Kosinussatz bei zwei Seiten und dem eingeschlossenen Winkel (SWS) oder bei drei Seiten (SSS). Den Sinussatz, wenn eine Seite mit dem gegenüberliegenden Winkel bekannt ist, etwa bei WSW oder SsW." },
      { f: "Mein Kind bekommt mit dem Taschenrechner falsche Ergebnisse. Woran liegt das?", a: "Häufig steht der Rechner auf RAD statt DEG. Im Kapitel „Grad und Bogenmaß“ gibt es dafür den Aufgabentyp „Die RAD-Falle“, und auch in den anderen Übungen erkennt das Werkzeug diesen Fehler. So lernt Ihr Kind, die Einstellung selbst zu prüfen." },
    ],
  },
};
