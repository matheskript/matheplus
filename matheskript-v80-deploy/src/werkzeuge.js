/* ============================================================
   WERKZEUGE – die eine Liste aller Mathe-Werkzeuge
   Startseite (Schulmathe-Training → Bereiche), Werkzeug-Menü (☰ im Kopf),
   Leiste im Kopfbereich jeder Werkzeugseite, Übersichtsseiten
   (Analysis, Vektoren, Stochastik) und das Seitenmenü NAV werden
   alle aus dieser Datei erzeugt. Ein neues Werkzeug braucht nur
   einen Eintrag in WERKZEUGE und seinen Platz in einer Station.

   Reine Daten, keine Importe: Diese Datei darf von base- UND
   func-Dateien importiert werden.

   Felder je Werkzeug:
     name     – Titel überall
     kurz     – Kurzname für die Leiste im Kopfbereich (Handy)
     zeile    – eine Zeile unter dem Namen (Startseite, Menü)
     slogan   – Text auf den Übersichtsseiten
     zeichen  – Symbol im blauen Quadrat (Übersichtsseiten)
     bild     – Motiv auf der Startseite (MiniBild in func2.jsx)
     ziel     – Navigationsziel für gehe()
     auch     – weitere Ansichten, die zu diesem Werkzeug gehören
                (Umschalter oben auf der Seite, z. B. Polynome | Beliebige)
     etikett  – entdecken | rechnen | trainieren
     stufe    – mittel | ober | beide (Stufen-Schalter auf der Startseite)
     unter    – true: erscheint auch in der Unterstufe (Kl. 5–6); reine Unterstufen-Werkzeuge haben stufe "unter"
     Die Zeile muss auf dem Handy (360 px) in eine Zeile passen.
   ============================================================ */

export const ETIKETTEN = {
  entdecken: { name: "Entdecken", text: "Regler, Live-Bild, ausprobieren" },
  rechnen: { name: "Rechnen", text: "Die App rechnet dir den Weg vor" },
  trainieren: { name: "Trainieren", text: "Du rechnest selbst, die App prüft" },
};

export const WERKZEUGE = {
  /* ---------- Fundament (für alle Stufen) ---------- */
  axiome: { name: "Axiome und Rechenregeln", kurz: "Axiome", zeile: "Neun Spielregeln für Plus und Mal", slogan: "Das Fundament: Kommutativ-, Assoziativ- und Distributivgesetz, neutrale und inverse Elemente – erkennen, begründen, trainieren.",
    zeichen: "a+0", bild: "axiome", ziel: { ansicht: "axiome" }, etikett: "trainieren", stufe: "beide", unter: true },
  zahlenraeume: { name: "Zahlenräume: von ℕ bis ℝ", kurz: "Zahlenräume", zeile: "Natürlich, ganz, rational, reell", slogan: "Warum es negative Zahlen, Brüche und Wurzeln gibt: ℕ → ℤ → ℚ → ℝ mit Erkläranimationen und Widerspruchsbeweis.",
    zeichen: "ℕℝ", bild: "zahlenraeume", ziel: { ansicht: "zahlenraeume" }, etikett: "entdecken", stufe: "beide", unter: true },
  mengenlogik: { name: "Mengen und Logik", kurz: "Mengen", zeile: "Mengen, Intervalle, Aussagen, Folgern", slogan: "Die Sprache der Mathematik: Mengen verknüpfen, Intervalle lesen, Aussagen verbinden, richtig folgern und widerlegen.",
    zeichen: "A∩B", bild: "menge", ziel: { ansicht: "mengenlogik" }, etikett: "trainieren", stufe: "beide", unter: true },
  /* ---------- Funktionen: Grundlagen (Analysis · Kennen) ---------- */
  funktionen: { name: "Funktionen: Grundlagen", kurz: "Funktionen", zeile: "Potenz, Wurzel, Umkehrung, Verkettung", slogan: "Funktionsbegriff, Potenz- und Wurzelfunktionen, Umkehrfunktion, Verkettung – und Definitions- und Wertebereich als eigenes Training.",
    zeichen: "f⁻¹", bild: "funktionen", ziel: { ansicht: "funktionen" }, etikett: "trainieren", stufe: "beide" },
  /* ---------- Textaufgaben (alle Stufen) ---------- */
  textaufgaben: { name: "Textaufgaben übersetzen", kurz: "Textaufgaben", zeile: "Text → Bedingungen, Klasse 5 bis Abi", slogan: "Erst übersetzen, dann rechnen: Jede Information im Text wird zur Bedingung – vom Zahlenrätsel bis zur Steckbriefaufgabe. Mit Mathilda für jedes Foto.",
    zeichen: "T→f", bild: "textaufgaben", ziel: { ansicht: "textaufgaben" }, etikett: "trainieren", stufe: "beide", unter: true },
  /* ---------- Analysis ---------- */
  /* ---------- Geradentrainer (Mittelstufe: Grundlagen, Zwei Punkte, Punkt und Steigung; Rechnen | Trainieren) ---------- */
  geradengleichung: { name: "Geradentrainer", kurz: "Geraden", zeile: "Grundlagen, zwei Punkte, Punkt und Steigung", slogan: "Was eine Gerade ist und wie du y = m·x + c aus zwei Punkten oder aus Punkt und Steigung findest.",
    zeichen: "mx+c", bild: "gerade", ziel: { ansicht: "geradengleichung" }, etikett: "trainieren", stufe: "mittel" },
  /* ---------- Parabeln (Mittelstufe, eigenes Werkzeug wie Geraden) ---------- */
  parabeln: { name: "Parabeln", kurz: "Parabeln", zeile: "Normalform, Scheitelform, Nullstellen", slogan: "Normalform, Scheitelform und Nullstellen trainieren – plus Brennpunkt und Schnittpunkte.",
    zeichen: "ax²", bild: "parabel", ziel: { ansicht: "parabeln" }, etikett: "trainieren", stufe: "mittel" },

  sinus: { name: "Sinusfunktion", kurz: "Sinus", zeile: "f(x) = a · sin(b · (x − c)) + d", slogan: "a, b, c und d finden, bis der Graph passt.",
    zeichen: "∿", bild: "sinus", ziel: { ansicht: "sinus" }, etikett: "entdecken", stufe: "beide" },
  wachstum: { name: "Wachstum und Logarithmen", kurz: "Wachstum", zeile: "Messwerte, Halbwertszeit, Zielwert", slogan: "Exponentielle Modelle, Halbwertszeiten und Logarithmen.",
    zeichen: "aᵗ", bild: "wachstum", ziel: { ansicht: "wachstum" }, etikett: "trainieren", stufe: "beide" },
  diffq: { name: "Differenzenquotient", kurz: "h-Methode", zeile: "Einsetzen, kürzen, Grenzwert bilden", slogan: "Den Bruch des Differenzenquotienten Zeile für Zeile selbst aufbauen – bis zur Ableitung.",
    zeichen: "Δy/Δx", bild: "diffq", ziel: { ansicht: "diffq" }, etikett: "trainieren", stufe: "ober" },
  ableitungstrainer: { name: "Ableitungstrainer", kurz: "Ableiten", zeile: "f′, f″ und f‴ eingeben und prüfen", slogan: "f′, f″ und f‴ eingeben und sofort prüfen lassen.",
    zeichen: "f′", bild: "ableitung", ziel: { ansicht: "ableitungstrainer" }, etikett: "trainieren", stufe: "ober" },
  kurvendiskussion: { name: "Kurvendiskussion", kurz: "Kurven", zeile: "Graph, Ableitungen und PDF", slogan: "Graph, Ableitungen und die komplette Kurvendiskussion – für Polynome und beliebige Funktionen.",
    zeichen: "f(x)", bild: "kurve", ziel: { ansicht: "plotter" }, auch: ["advplotter"], etikett: "rechnen", stufe: "ober",
    modi: [{ ansicht: "plotter", name: "Polynome" }, { ansicht: "advplotter", name: "Beliebige Funktionen", kurz: "Beliebig" }] },
  scharen: { name: "Funktionsscharen", kurz: "Scharen", zeile: "Parameter, Ortskurven, Sonderfälle", slogan: "Parameter per Regler verändern, Punkte und Ortskurven berechnen.",
    zeichen: "fₐ", bild: "scharen", ziel: { ansicht: "scharen" }, etikett: "entdecken", stufe: "ober" },
  steckbrief: { name: "Steckbriefaufgaben", kurz: "Steckbrief", zeile: "Aus Eigenschaften die Funktion", slogan: "Aus Hochpunkt, Wendepunkt & Co. die Funktion bauen.",
    zeichen: "f(?)", bild: "steckbrief", ziel: { ansicht: "steckbrief" }, etikett: "trainieren", stufe: "ober" },
  optimierung: { name: "Optimierungswerkstatt", kurz: "Optimierung", zeile: "Schachtel, Fläche, eigener Ansatz", slogan: "Vom Text zur Zielfunktion – Schachtel, Fläche, eigener Ansatz.",
    zeichen: "max", bild: "optimierung", ziel: { ansicht: "optimierung" }, etikett: "trainieren", stufe: "ober" },
  integrale: { name: "Integrale", kurz: "Integrale", zeile: "Stammfunktionen, Flächen, Bestand", slogan: "Stammfunktionen bilden, Flächen und Bestände berechnen.",
    zeichen: "∫", bild: "integral", ziel: { ansicht: "integrale" }, etikett: "trainieren", stufe: "ober" },

  /* ---------- Vektoren ---------- */
  vektorgenerator: { name: "Rechnen mit Vektoren", kurz: "Rechnen", zeile: "A ± B, k · A, Skalarprodukt mit Weg", slogan: "Addition, Vielfache, Linearkombination und Skalarprodukt – immer neue Beispiele mit Rechenweg.",
    zeichen: "a⃗", bild: "wuerfel", ziel: { ansicht: "vektorgenerator" }, etikett: "rechnen", stufe: "ober" },
  kreuzprodukt: { name: "Kreuzprodukt", kurz: "Kreuz", zeile: "a × b – Formel, eingesetzt, Ergebnis", slogan: "Zwei Vektoren eingeben – Formel, eingesetzt, Ergebnis.",
    zeichen: "×", bild: "kreuz", ziel: { ansicht: "kreuzprodukt" }, etikett: "rechnen", stufe: "ober" },
  winkel: { name: "Winkel und Skalarprodukt", kurz: "Winkel", zeile: "Skalarprodukt und Vektorwinkel", slogan: "Skalarprodukt verstehen und Winkel berechnen.",
    zeichen: "φ", bild: "winkel", ziel: { ansicht: "winkel" }, etikett: "trainieren", stufe: "ober" },
  zweipunkte: { name: "Zwei Punkte – eine Gerade", kurz: "Gerade", zeile: "Geradengleichung auf zwei Wegen", slogan: "Geradengleichung aus zwei Punkten – auf zwei Wegen.",
    zeichen: "AB", bild: "gerade2p", ziel: { ansicht: "zweipunkte" }, etikett: "trainieren", stufe: "ober" },
  dreipunkte: { name: "Drei Punkte – eine Ebene", kurz: "Ebene", zeile: "Drei Wege, mit Koordinatenform", slogan: "Drei Wege zur Ebene, mit Koordinatenform.",
    zeichen: "ABC", bild: "ebene3p", ziel: { ansicht: "dreipunkte" }, etikett: "trainieren", stufe: "ober" },
  ebenen: { name: "Ebenen im Raum", kurz: "Ebenen", zeile: "Ebenen live im Raum drehen", slogan: "Ebenen in Koordinatenform live im Raum drehen.",
    zeichen: "E", bild: "ebene", ziel: { ansicht: "ebenen" }, etikett: "entdecken", stufe: "ober" },
  geraden: { name: "Geraden im Raum", kurz: "Lage", zeile: "Punktprobe und Lage", slogan: "Punktprobe und Lage: schneidend, parallel, windschief.",
    zeichen: "g", bild: "geraden", ziel: { ansicht: "geraden" }, etikett: "trainieren", stufe: "ober" },
  ebenevsebene: { name: "Zwei Ebenen", kurz: "Zwei Ebenen", zeile: "Schnittgerade und Schnittwinkel", slogan: "Schnittgerade und Schnittwinkel zweier Ebenen.",
    zeichen: "E₁E₂", bild: "ebenen2", ziel: { ansicht: "ebenevsebene" }, etikett: "rechnen", stufe: "ober" },
  hesse: { name: "Hesse-Normalenform", kurz: "HNF", zeile: "Normalenvektor, Normalenform, Abstand mit Vorzeichen", slogan: "Vom Normalenvektor zur Hesse-Normalenform – mit Herleitung, 3D-Bild und Übung.",
    zeichen: "n₀", bild: "abstand", ziel: { ansicht: "hesse" }, etikett: "entdecken", stufe: "ober" },
  abstaende: { name: "Abstände", kurz: "Abstände", zeile: "Alle Kombinationen mit 3D-Bild", slogan: "Punkt, Gerade, Ebene – jede Kombination mit 3D-Bild.",
    zeichen: "d", bild: "abstand", ziel: { ansicht: "abstaende" }, etikett: "rechnen", stufe: "ober" },

  /* ---------- Stochastik ---------- */
  kombinatorik: { name: "Urnen und Kombinatorik", kurz: "Kombinatorik", zeile: "Ziehen, Zählen, Baumdiagramme", slogan: "Ziehen, Zählmethoden, Baumdiagramme.",
    zeichen: "n!", bild: "urne", ziel: { ansicht: "kombinatorik" }, etikett: "trainieren", stufe: "beide" },
  vierfelder: { name: "Vier-Felder-Tafel", kurz: "Vierfelder", zeile: "Mit Baumdiagramm und bedingter WKT", slogan: "Absolut oder in Prozent – mit Baum und bedingter WKT.",
    zeichen: "▦", bild: "tafel", ziel: { ansicht: "vierfelder" }, etikett: "rechnen", stufe: "beide" },
  erwartungswert: { name: "Erwartungswert und faire Spiele", kurz: "Erwartung", zeile: "Fairer Einsatz und Simulation", slogan: "Nettogewinn, Erwartungswert, fairer Einsatz – mit Simulation.",
    zeichen: "E(X)", bild: "erwartung", ziel: { ansicht: "erwartungswert" }, etikett: "trainieren", stufe: "beide" },
  bernoulli: { name: "Bernoulli-Kette", kurz: "Bernoulli", zeile: "Binomialverteilung live simulieren", slogan: "Binomialverteilung live sehen und simulieren.",
    zeichen: "B", bild: "balken", ziel: { ansicht: "bernoulli" }, etikett: "entdecken", stufe: "ober" },
  hypothesentest: { name: "Hypothesentests", kurz: "Tests", zeile: "H₀, Ablehnungsbereich, Fehlerarten", slogan: "H₀ aufstellen, Ablehnungsbereich finden, Fehler verstehen.",
    zeichen: "H₀", bild: "hypothese", ziel: { ansicht: "hypothesentest" }, etikett: "trainieren", stufe: "ober" },
  normalverteilung: { name: "Normalverteilung", kurz: "Normal", zeile: "Glockenkurve, Φ, Sigma-Regeln", slogan: "Von der Binomialverteilung zur Glocke: μ und σ, Wahrscheinlichkeit als Fläche, Sigma-Regeln, rückwärts rechnen.",
    zeichen: "φ", bild: "normal", ziel: { ansicht: "normalverteilung" }, etikett: "entdecken", stufe: "ober" },

  /* ---------- Geometrie ---------- */
  koordinaten: { name: "Koordinatensystem und Symmetrie", kurz: "Koordinaten", zeile: "Punkte, Spiegeln, Symmetrieachsen", slogan: "Punkte ablesen und eintragen, an Achsen und Punkten spiegeln, Symmetrie erkennen.",
    zeichen: "P(x|y)", bild: "koordinaten", ziel: { ansicht: "koordinaten" }, etikett: "entdecken", stufe: "unter", unter: true },
  flaechen: { name: "Umfang und Flächeninhalt", kurz: "Flächen", zeile: "Rechteck bis Trapez und Drachen", slogan: "Jede Flächenformel aus dem Rechteck hergeleitet – dazu zusammengesetzte Figuren.",
    zeichen: "A", bild: "flaechen", ziel: { ansicht: "flaechen" }, etikett: "trainieren", stufe: "mittel", unter: true },
  quader: { name: "Quader und Würfel", kurz: "Quader", zeile: "Volumen, Oberfläche, Würfelnetze", slogan: "Volumen aus Einheitswürfeln, Oberfläche, Kanten – und welche Netze sich falten lassen.",
    zeichen: "a³", bild: "quader", ziel: { ansicht: "quader" }, etikett: "entdecken", stufe: "unter", unter: true },
  winkelsaetze: { name: "Winkel und Winkelsummen", kurz: "Winkel", zeile: "Parallelen, Dreieck, n-Eck", slogan: "Scheitel-, Stufen- und Wechselwinkel, Winkelsumme im Dreieck und im n-Eck.",
    zeichen: "∠", bild: "parallelwinkel", ziel: { ansicht: "winkelsaetze" }, etikett: "entdecken", stufe: "mittel", unter: true },
  konstruktion: { name: "Besondere Linien im Dreieck", kurz: "Linien", zeile: "Umkreis, Inkreis, Schwerpunkt", slogan: "Mittelsenkrechte, Winkelhalbierende, Höhe, Seitenhalbierende – und ihre Schnittpunkte.",
    zeichen: "⊙", bild: "konstruktion", ziel: { ansicht: "konstruktion" }, etikett: "entdecken", stufe: "mittel" },
  kongruenz: { name: "Kongruenzsätze", kurz: "Kongruenz", zeile: "SSS, SWS, WSW, SsW – eindeutig?", slogan: "Wann drei Stücke ein Dreieck festlegen – Konstruktionen und Begründen an Figuren.",
    zeichen: "≅", bild: "kongruenz", ziel: { ansicht: "kongruenz" }, etikett: "entdecken", stufe: "mittel" },
  thales: { name: "Satz des Thales", kurz: "Thales", zeile: "Rechter Winkel im Halbkreis", slogan: "Jeder Winkel im Halbkreis ist ein rechter – mit Beweis, Umkreis und Tangente.",
    zeichen: "∟", bild: "thales", ziel: { ansicht: "thales" }, etikett: "entdecken", stufe: "mittel" },
  pythagoras: { name: "Satz des Pythagoras", kurz: "Pythagoras", zeile: "a² + b² = c², auch im Raum", slogan: "Fehlende Seiten im rechtwinkligen Dreieck – Umkehrung, Sachaufgaben, Raumdiagonale.",
    zeichen: "c²", bild: "pythagoras", ziel: { ansicht: "pythagoras" }, etikett: "trainieren", stufe: "mittel" },
  kathetensatz: { name: "Kathetensatz und Höhensatz", kurz: "Höhensatz", zeile: "a² = c · p und h² = p · q", slogan: "Die Satzgruppe des Pythagoras: flächengleiche Quadrate und Rechtecke im rechtwinkligen Dreieck.",
    zeichen: "h²", bild: "kathetensatz", ziel: { ansicht: "kathetensatz" }, etikett: "trainieren", stufe: "mittel" },
  kreis: { name: "Kreis und Kreisteile", kurz: "Kreis", zeile: "Umfang, Fläche, Bogen, Sektor", slogan: "π, Umfang und Fläche, Kreisbogen, Kreisausschnitt und Kreisring – auch rückwärts.",
    zeichen: "π", bild: "kreis", ziel: { ansicht: "kreis" }, etikett: "trainieren", stufe: "mittel" },
  koerper: { name: "Körper: Volumen und Oberfläche", kurz: "Körper", zeile: "Prisma, Zylinder, Kegel, Kugel", slogan: "Prisma, Zylinder, Pyramide, Kegel und Kugel – Schrägbild, Formeln, Pythagoras im Körper.",
    zeichen: "V", bild: "koerper", ziel: { ansicht: "koerper" }, etikett: "trainieren", stufe: "mittel" },
  strahlensaetze: { name: "Strahlensätze", kurz: "Strahlen", zeile: "V- und X-Figur, Streckfaktor k", slogan: "Zwei Strahlen, zwei Parallelen – fehlende Längen über Verhältnisse.",
    zeichen: "k", bild: "strahlen", ziel: { ansicht: "strahlensaetze" }, etikett: "trainieren", stufe: "mittel" },
  trigonometrie: { name: "Trigonometrie", kurz: "Trigo", zeile: "Einheitskreis, Bogenmaß, sin, cos, tan, Sinus- und Kosinussatz", slogan: "Vom Einheitskreis bis zum Kosinussatz – verstehen, dann rechnen.",
    zeichen: "sin", bild: "trig", ziel: { ansicht: "trigonometrie" }, etikett: "trainieren", stufe: "mittel" },

  /* ---------- Bruchrechnen ---------- */
  dezimal: { name: "Dezimalzahlen", kurz: "Dezimal", zeile: "Umwandeln, runden, Komma", slogan: "Bruch und Dezimalzahl umwandeln, runden, mit Komma multiplizieren und dividieren.",
    zeichen: "0,5", bild: "dezimal", ziel: { ansicht: "dezimal" }, etikett: "trainieren", stufe: "unter", unter: true },
  bruchrechnen: { name: "Brüche rechnen", kurz: "Brüche", zeile: "Kürzen, plus, minus, mal, geteilt", slogan: "Kürzen, erweitern und alle Grundrechenarten – mit Bruchstreifen und gezielter Fehlerrückmeldung.",
    zeichen: "¾", bild: "bruch", ziel: { ansicht: "bruchrechnen" }, etikett: "trainieren", stufe: "unter", unter: true },
  bruchwurzel: { name: "Brüche und Wurzeln", kurz: "Brüche & Wurzeln", zeile: "Bruchterme, Quadratwurzeln, Fallen", slogan: "Bruchterme kürzen und lösen, Quadratwurzeln ziehen und vereinfachen – mit den typischen Fallen.",
    zeichen: "√x", bild: "bruchterm", ziel: { ansicht: "bruchwurzel" }, etikett: "trainieren", stufe: "mittel" },
  bruchterme: { name: "Bruchterme und -gleichungen", kurz: "Bruchterme", zeile: "Definitionsmenge, kürzen, lösen", slogan: "x im Nenner: Definitionsmenge, Kürzen nur von Faktoren, Bruchgleichungen ohne Scheinlösung.",
    zeichen: "1/x", bild: "bruchterm", ziel: { ansicht: "bruchterme" }, etikett: "trainieren", stufe: "mittel" },

  /* ---------- Gleichungen ---------- */
  terme: { name: "Terme und Potenzgesetze", kurz: "Terme", zeile: "Vereinfachen, ausklammern, kürzen", slogan: "Vereinfachen, Ausklammern, Binomische Formeln, Potenzen, Brüche.",
    zeichen: "xⁿ", bild: "termkarte", ziel: { ansicht: "terme" }, etikett: "trainieren", stufe: "mittel" },
  gleichungen: { name: "Gleichungen lösen", kurz: "Lösen", zeile: "Umformen und verstehen", slogan: "Äquivalenzumformungen eintippen – linear bis Logarithmus, mit Verstehen-Modi.",
    zeichen: "x =", bild: "gleichung", ziel: { ansicht: "gleichungen" }, auch: ["gleichverstehen"], etikett: "trainieren", stufe: "beide", unter: true,
    modi: [{ ansicht: "gleichverstehen", name: "Entdecken" }, { ansicht: "gleichungen", name: "Trainieren" }] },
  ungleichungen: { name: "Ungleichungen und Beträge", kurz: "Ungleichungen", zeile: "Linear, quadratisch, mit Betrag", slogan: "Lösungsmengen von Ungleichungen finden, Betragsgleichungen und -ungleichungen lösen, quadratische Ungleichungen an der Parabel ablesen.",
    zeichen: "x < 3", bild: "ungleichung", ziel: { ansicht: "ungleichungen" }, etikett: "trainieren", stufe: "beide" },
  lgs: { name: "Gleichungssysteme", kurz: "LGS", zeile: "Mit drei Variablen", slogan: "LGS mit drei Unbekannten – Gauß-Verfahren und direkter Weg.",
    zeichen: "I II III", bild: "lgs", ziel: { ansicht: "lgs" }, etikett: "trainieren", stufe: "beide" },

  /* ---------- Zahlen und Größen (Unterstufe) ---------- */
  stellenwert: { name: "Natürliche Zahlen und Stellenwert", kurz: "Stellenwert", zeile: "Große Zahlen, runden, Zahlenstrahl", slogan: "Stellenwerttafel bis zu den Millionen, runden, Zahlenstrahl, römische Zahlen.",
    zeichen: "10⁶", bild: "stellenwert", ziel: { ansicht: "stellenwert" }, etikett: "entdecken", stufe: "unter", unter: true },
  ganzezahlen: { name: "Ganze und rationale Zahlen", kurz: "Ganze Zahlen", zeile: "Negative Zahlen, Vorzeichenregeln", slogan: "Zahlengerade und Pfeilmodell, Rechnen mit Vorzeichen, negative Brüche.",
    zeichen: "−3", bild: "ganzezahlen", ziel: { ansicht: "ganzezahlen" }, etikett: "trainieren", stufe: "unter", unter: true },
  primzahlen: { name: "Primzahlen, ggT und kgV", kurz: "Primzahlen", zeile: "Sieb, Faktorbaum, ggT, kgV", slogan: "Primzahlen aussieben, Primfaktorzerlegung, ggT und kgV – auch in Sachaufgaben.",
    zeichen: "ggT", bild: "primzahlen", ziel: { ansicht: "primzahlen" }, etikett: "trainieren", stufe: "unter", unter: true },
  rechengesetze: { name: "Rechengesetze und Rechenvorteile", kurz: "Rechengesetze", zeile: "Punkt vor Strich, geschickt rechnen", slogan: "Rechenreihenfolge Schritt für Schritt, Kommutativ-, Assoziativ- und Distributivgesetz.",
    zeichen: "a·(b+c)", bild: "rechengesetze", ziel: { ansicht: "rechengesetze" }, etikett: "trainieren", stufe: "unter", unter: true },
  groessen: { name: "Größen umrechnen", kurz: "Größen", zeile: "Länge, Masse, Zeit, Fläche, Volumen", slogan: "Mit der Umrechnungstreppe sicher umrechnen – dazu Maßstab auf Karten.",
    zeichen: "km", bild: "groessen", ziel: { ansicht: "groessen" }, etikett: "trainieren", stufe: "unter", unter: true },

  /* ---------- Zuordnungen und Prozent ---------- */
  zuordnungen: { name: "Zuordnungen und Dreisatz", kurz: "Dreisatz", zeile: "Proportional, antiproportional", slogan: "Zuordnungen an Tabelle und Graph erkennen und mit dem Dreisatz rechnen.",
    zeichen: "y ~ x", bild: "zuordnungen", ziel: { ansicht: "zuordnungen" }, etikett: "trainieren", stufe: "unter", unter: true },
  prozent: { name: "Prozent- und Zinsrechnung", kurz: "Prozent", zeile: "Grundwert, Rabatt, Zinsen", slogan: "Prozentstreifen, Grundwert, Prozentwert, Rabatt, Mehrwertsteuer und Zinsen.",
    zeichen: "%", bild: "prozent", ziel: { ansicht: "prozent" }, etikett: "trainieren", stufe: "unter", unter: true },

  /* ---------- Daten und Zufall (Unterstufe) ---------- */
  diagramme: { name: "Daten und Diagramme", kurz: "Diagramme", zeile: "Mittelwert, Median, Diagramme", slogan: "Säulen- und Kreisdiagramme, relative Häufigkeit, Mittelwert, Median, Spannweite.",
    zeichen: "x̄", bild: "diagramme", ziel: { ansicht: "diagramme" }, etikett: "entdecken", stufe: "unter", unter: true },
  zufall: { name: "Zufall und Wahrscheinlichkeit", kurz: "Zufall", zeile: "Würfel, Urne, Pfadregel", slogan: "Laplace-Wahrscheinlichkeit, Würfel-Experiment, Gegenereignis und Pfadregel.",
    zeichen: "P", bild: "zufall", ziel: { ansicht: "zufall" }, etikett: "entdecken", stufe: "unter", unter: true },
};

/* Bereiche → Stationen (in Abi-Reihenfolge) → Werkzeuge. Das ist die Struktur für Kopfleiste, „Weiter“,
   wo(), Lernpfad und Übersichtsseiten. Wie die Startseite sie gruppiert und benennt, steht weiter unten
   in START_BLOECKE. */
export const BEREICHE = [
  { id: "fundament", titel: "Fundament", uebersicht: null, text: "Drei Stationen: Axiome und Rechenregeln, die Zahlenräume von ℕ bis ℝ, Mengen und Logik.", fundament: true,
    stationen: [
      { id: "axiome", titel: "Axiome und Rechenregeln", zeile: "Die Spielregeln jeder Rechnung", werkzeuge: ["axiome"] },
      { id: "zahlenraeume", titel: "Zahlenräume", zeile: "Von ℕ über ℤ und ℚ bis ℝ", werkzeuge: ["zahlenraeume"] },
      { id: "mengenlogik", titel: "Mengen und Logik", zeile: "Die Sprache der Mathematik", werkzeuge: ["mengenlogik"] },
    ] },
  { id: "textaufgaben", titel: "Textaufgaben", uebersicht: null, text: "Eine Station: Textaufgaben in Bedingungen übersetzen – mit Mathilda für jedes Foto.",
    stationen: [
      { id: "uebersetzen", titel: "Übersetzen", zeile: "Text → Gleichungen und Bedingungen", werkzeuge: ["textaufgaben"] },
    ] },
  { id: "analysis", titel: "Funktionen und Kurven", uebersicht: "analysis", text: "Vier Stationen: Funktionen kennen, untersuchen, bestimmen, integrieren.",
    video: { name: "Videokurse Analysis", zeile: "Analysis 1–5 mit Videolektionen und Checks" },
    stationen: [
      { id: "kennen", titel: "Kennen", zeile: "Die wichtigsten Funktionsklassen", werkzeuge: ["funktionen", "sinus", "wachstum"] },
      { id: "untersuchen", titel: "Untersuchen", zeile: "Ableiten und Kurven diskutieren", werkzeuge: ["diffq", "ableitungstrainer", "kurvendiskussion", "scharen"] },
      { id: "bestimmen", titel: "Bestimmen", zeile: "Funktionen aufstellen und anwenden", werkzeuge: ["steckbrief", "optimierung"] },
      { id: "integrieren", titel: "Integrieren", zeile: "Stammfunktionen, Flächen, Bestand", werkzeuge: ["integrale"] },
    ] },
  { id: "vektoren", titel: "Vektoren, Geraden und Ebenen", uebersicht: "vektoren", text: "Drei Stationen: rechnen, Geraden und Ebenen aufstellen, Lage und Abstand.",
    video: { name: "Videokurs Vektoren", zeile: "Fünf Lektionen mit Kurz-Checks" },
    stationen: [
      { id: "rechnen", titel: "Rechnen", zeile: "Vektoren, Kreuz- und Skalarprodukt", werkzeuge: ["vektorgenerator", "kreuzprodukt", "winkel"] },
      { id: "aufstellen", titel: "Aufstellen", zeile: "Geraden und Ebenen aus Punkten", werkzeuge: ["zweipunkte", "dreipunkte", "ebenen"] },
      { id: "lage", titel: "Lage und Abstand", zeile: "Schneiden, parallel, windschief, Abstände", werkzeuge: ["geraden", "ebenevsebene", "abstaende", "hesse"] },
    ] },
  { id: "stochastik", titel: "Wahrscheinlichkeitsrechnung", uebersicht: "stochastik", text: "Vier Stationen: zählen, Zufallsgrößen, testen, Normalverteilung.",
    video: { name: "Videokurs Stochastik", zeile: "Vom Baumdiagramm zum Hypothesentest" },
    stationen: [
      { id: "zaehlen", titel: "Zählen und Bäume", zeile: "Urnen, Pfade, Vier-Felder-Tafel", werkzeuge: ["kombinatorik", "vierfelder"] },
      { id: "zufallsgroessen", titel: "Zufallsgrößen", zeile: "Erwartungswert und Binomialverteilung", werkzeuge: ["erwartungswert", "bernoulli"] },
      { id: "testen", titel: "Testen", zeile: "Hypothesen prüfen", werkzeuge: ["hypothesentest"] },
      { id: "normal", titel: "Normalverteilung", zeile: "Stetige Zufallsgrößen und die Glocke", werkzeuge: ["normalverteilung"] },
    ] },
  { id: "geometrie", titel: "Geometrie", uebersicht: null, text: "Sechs Stationen: Figuren und Flächen, Winkel und Dreiecke, rechte Winkel, Ähnlichkeit, Dreiecke berechnen, Kreis und Körper.",
    stationen: [
      { id: "figuren", titel: "Figuren und Flächen", zeile: "Koordinaten, Flächen, Quader", werkzeuge: ["koordinaten", "flaechen", "quader"] },
      { id: "dreieck", titel: "Winkel und Dreiecke", zeile: "Winkelsätze, Kongruenz, Konstruktionen", werkzeuge: ["winkelsaetze", "kongruenz", "konstruktion"] },
      { id: "rechtwinklig", titel: "Rechte Winkel", zeile: "Thales, Pythagoras, Höhensatz", werkzeuge: ["thales", "pythagoras", "kathetensatz"] },
      { id: "aehnlich", titel: "Ähnlichkeit", zeile: "Strahlensätze und Streckfaktor", werkzeuge: ["strahlensaetze"] },
      { id: "dreiecke", titel: "Dreiecke berechnen", zeile: "Sinus, Kosinus, Tangens", werkzeuge: ["trigonometrie"] },
      { id: "kreiskoerper", titel: "Kreis und Körper", zeile: "Kreisteile, Volumen, Oberfläche", werkzeuge: ["kreis", "koerper"] },
    ] },
  { id: "bruchrechnen", titel: "Brüche und Dezimalzahlen", uebersicht: null, text: "Zwei Stationen: Brüche und Dezimalzahlen, Bruchterme und Bruchgleichungen.",
    stationen: [
      { id: "brueche", titel: "Brüche und Dezimalzahlen", zeile: "Kürzen, Grundrechenarten, Komma", werkzeuge: ["bruchrechnen", "dezimal"] },
      { id: "bruchterme", titel: "Bruchterme", zeile: "x im Nenner: kürzen und lösen", werkzeuge: ["bruchterme", "bruchwurzel"] },
    ] },
  { id: "gleichungen", titel: "Gleichungen", uebersicht: null, text: "Fünf Stationen: Terme umformen, Gleichungen lösen, Ungleichungen und Beträge, Geraden, Parabeln.",
    video: { name: "Videokurs Gleichungen", zeile: "Umformen, Gleichungssysteme, Musterlösungen" },
    stationen: [
      { id: "terme", titel: "Terme umformen", zeile: "Vereinfachen, ausklammern, Potenzen", werkzeuge: ["terme"] },
      { id: "loesen", titel: "Gleichungen lösen", zeile: "Einzelne Gleichungen und Systeme", werkzeuge: ["gleichungen", "lgs"] },
      { id: "ungleichungen", titel: "Ungleichungen und Beträge", zeile: "Lösungsmengen als Intervalle", werkzeuge: ["ungleichungen"] },
      { id: "gerade", titel: "Geraden", zeile: "Grundlagen, zwei Punkte, Punkt und Steigung", werkzeuge: ["geradengleichung"] },
      { id: "parabel", titel: "Parabeln", zeile: "Normalform, Scheitelform, Nullstellen", werkzeuge: ["parabeln"] },
    ] },
  { id: "zahlen", titel: "Zahlen und Größen", uebersicht: null, text: "Drei Stationen: Zahlen, Rechnen, Größen.",
    stationen: [
      { id: "zahlen", titel: "Zahlen", zeile: "Stellenwert, ganze Zahlen, Primzahlen", werkzeuge: ["stellenwert", "ganzezahlen", "primzahlen"] },
      { id: "rechnen", titel: "Rechnen", zeile: "Reihenfolge und Rechengesetze", werkzeuge: ["rechengesetze"] },
      { id: "groessen", titel: "Größen", zeile: "Einheiten umrechnen, Maßstab", werkzeuge: ["groessen"] },
    ] },
  { id: "prozent", titel: "Zuordnungen und Prozent", uebersicht: null, text: "Zwei Stationen: Zuordnungen, Prozent und Zinsen.",
    stationen: [
      { id: "zuordnung", titel: "Zuordnungen", zeile: "Proportional, antiproportional, Dreisatz", werkzeuge: ["zuordnungen"] },
      { id: "prozent", titel: "Prozent und Zinsen", zeile: "Grundwert, Prozentwert, Zinsen", werkzeuge: ["prozent"] },
    ] },
  { id: "daten", titel: "Daten und Zufall", uebersicht: null, text: "Zwei Stationen: Daten auswerten, Zufall.",
    stationen: [
      { id: "daten", titel: "Daten", zeile: "Diagramme und Kennwerte", werkzeuge: ["diagramme"] },
      { id: "zufall", titel: "Zufall", zeile: "Wahrscheinlichkeit, Experimente", werkzeuge: ["zufall"] },
    ] },
];

/* ---------- Anordnung der Schulmathematik-Liste (Startseite und Menü) ----------
   Nur Anzeige: Welche Stationen stehen unter welcher Überschrift, in welcher Reihenfolge, für welche Stufe.
   BEREICHE oben bleibt die Struktur für Kopfleiste, Lernpfad und Übersichtsseiten.
   Eine Station steht als „bereich.station“ oder als Objekt { ref, titel, zeile, werkzeuge, nur } – mit
   eigenen Feldern, wenn sie hier anders heißt oder anders zusammengesetzt ist.
   nur: Stufen-Schalter-Werte (unter | mittel | ober | alle), bei denen Block bzw. Station erscheint.
   titelStufe: andere Überschrift in einer Stufe (Mittelstufe: „Geraden und Parabeln“).
   vorTitel: Kurzwort vor dem Titel, in derselben Schrift wie alle Kachel-Titel – am Computer „Analysis – Funktionen und Kurven“, am Handy nur „Analysis“.
   Entfällt, wenn titelStufe für die Stufe greift (Mittelstufe: „Geraden und Parabeln“ steht ohne Vorsatz).
   Abi-Vorbereitung und die Formelsammlung im Werkzeugkasten sind keine Werkzeuge und stehen in func2.jsx. */
export const START_BLOECKE = [
  { id: "analysis", quelle: "analysis", vorTitel: "Analysis", titelStufe: { mittel: "Geraden und Parabeln" },
    stationen: ["gleichungen.gerade", "gleichungen.parabel", "analysis.kennen", "analysis.untersuchen", "analysis.bestimmen", "analysis.integrieren"] },
  { id: "vektoren", quelle: "vektoren", vorTitel: "Geometrie", nur: ["ober", "alle"],
    stationen: ["vektoren.rechnen", "vektoren.aufstellen", "vektoren.lage",
      { id: "lgs", titel: "Gleichungssysteme", zeile: "Lösen mit Gauß, auch mit drei Unbekannten", werkzeuge: ["lgs"] }] },
  { id: "stochastik", quelle: "stochastik", vorTitel: "Stochastik", stationen: ["stochastik.zaehlen", "stochastik.zufallsgroessen", "stochastik.testen", "stochastik.normal"] },
  { id: "geometrie", quelle: "geometrie", stationen: ["geometrie.figuren", "geometrie.dreieck", "geometrie.rechtwinklig", "geometrie.aehnlich", "geometrie.dreiecke", "geometrie.kreiskoerper"] },
  { id: "bruchrechnen", quelle: "bruchrechnen", stationen: ["bruchrechnen.brueche"] },
  { id: "zahlen", quelle: "zahlen", stationen: ["zahlen.zahlen", "zahlen.rechnen", "zahlen.groessen"] },
  { id: "prozent", quelle: "prozent", stationen: ["prozent.zuordnung", "prozent.prozent"] },
  { id: "daten", quelle: "daten", stationen: ["daten.daten", "daten.zufall"] },
  { id: "fundament", quelle: "fundament", titel: "Mathematisches Fundament", fundament: true, stationen: ["fundament.axiome", "fundament.zahlenraeume", "fundament.mengenlogik"] },
  { id: "werkzeuge", titel: "Formelsammlung und Werkzeuge", text: "Formeln nachschlagen, Gleichungen lösen, Textaufgaben übersetzen.", kiste: true,
    stationen: [
      "gleichungen.terme",
      { ref: "gleichungen.loesen", zeile: "Umformen und verstehen", werkzeuge: ["gleichungen"] },
      { id: "gleichungssysteme", titel: "Gleichungssysteme", zeile: "Mit drei Unbekannten", werkzeuge: ["lgs"], nur: ["mittel"] },
      "gleichungen.ungleichungen",
      "bruchrechnen.bruchterme",
      { ref: "textaufgaben.uebersetzen", titel: "Textaufgaben", zeile: "Text → Bedingungen, mit Mathilda" },
    ] },
];

function stationAus(eintrag) {
  const e = typeof eintrag === "string" ? { ref: eintrag } : eintrag;
  let basis = {};
  if (e.ref) {
    const [bId, sId] = e.ref.split(".");
    const st = BEREICHE.find((b) => b.id === bId)?.stationen.find((x) => x.id === sId);
    if (!st) throw new Error(`START_BLOECKE: Station ${e.ref} gibt es nicht`);
    basis = { id: e.ref, titel: st.titel, zeile: st.zeile, werkzeuge: st.werkzeuge };
  }
  const { ref, ...rest } = e;
  return { ...basis, ...rest, werkzeuge: [...(rest.werkzeuge || basis.werkzeuge)] };
}

/* Die Blöcke der Schulmathematik-Liste für einen Stufen-Schalter-Wert (Stationen und Werkzeuge noch ungefiltert nach passtStufe) */
export function startBloecke(stufe = "alle") {
  return START_BLOECKE.filter((b) => !b.nur || b.nur.includes(stufe)).map((b) => {
    const q = b.quelle ? BEREICHE.find((x) => x.id === b.quelle) : null;
    return {
      id: b.id,
      titel: (b.titelStufe && b.titelStufe[stufe]) || b.titel || q.titel,
      vorTitel: b.titelStufe && b.titelStufe[stufe] ? undefined : b.vorTitel,
      text: b.text || (q && q.text) || "",
      video: q ? q.video : undefined,
      fundament: !!b.fundament,
      kiste: !!b.kiste,
      stationen: b.stationen.map(stationAus).filter((st) => !st.nur || st.nur.includes(stufe)),
    };
  });
}

/* ---------- Abfragen ---------- */

/* Stufen-Schalter: passt ein Werkzeug zur gewählten Stufe? (wahl: alle | unter | mittel | ober)
   Unterstufe (Kl. 5–6): nur Werkzeuge mit unter: true. Mittelstufe (Kl. 7–10), Oberstufe (Kl. 11–13). „beide“ = Mittel- und Oberstufe. */
export const passtStufe = (w, wahl) => !wahl || wahl === "alle" || (wahl === "unter" ? !!w.unter : w.stufe === "beide" || w.stufe === wahl);

export const werkzeug = (id) => (WERKZEUGE[id] ? { id, ...WERKZEUGE[id] } : null);

/* Alle Ansichten eines Werkzeugs (Hauptansicht + Umschalter-Ansichten) */
export const ansichtenVon = (w) => [w.ziel.ansicht, ...(w.auch || [])];

/* Werkzeug, Station und Bereich zu einer Ansicht – oder null */
export function wo(ansicht) {
  for (const b of BEREICHE) {
    if (b.uebersicht && b.uebersicht === ansicht) return { bereich: b, station: null, werkzeug: null, sNr: 0 };
    for (let i = 0; i < b.stationen.length; i++) {
      const s = b.stationen[i];
      for (const id of s.werkzeuge) {
        const w = werkzeug(id);
        if (w && ansichtenVon(w).includes(ansicht)) return { bereich: b, station: s, werkzeug: w, sNr: i + 1 };
      }
    }
  }
  return null;
}

export const istWerkzeugAnsicht = (ansicht) => !!wo(ansicht);

/* Einträge für das Seitenmenü NAV (Gruppe „Werkzeuge“) */
export function navWerkzeuge() {
  const liste = [];
  for (const b of BEREICHE) {
    if (b.uebersicht) liste.push({ name: b.titel, kurz: `Alle ${b.titel}-Werkzeuge im Überblick`, ansicht: b.uebersicht });
    for (const s of b.stationen) for (const id of s.werkzeuge) {
      const w = WERKZEUGE[id];
      liste.push({ name: w.name, kurz: w.zeile, ...w.ziel });
    }
  }
  return liste;
}
