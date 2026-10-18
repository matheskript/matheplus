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
     unter    – true: erscheint auch in der Unterstufe (Kl. 5–7)
     Die Zeile muss auf dem Handy (360 px) in eine Zeile passen.
   ============================================================ */

export const ETIKETTEN = {
  entdecken: { name: "Entdecken", text: "Regler, Live-Bild, ausprobieren" },
  rechnen: { name: "Rechnen", text: "Die App rechnet dir den Weg vor" },
  trainieren: { name: "Trainieren", text: "Du rechnest selbst, die App prüft" },
};

export const WERKZEUGE = {
  /* ---------- Analysis ---------- */
  geradengleichung: { name: "Geradengleichung", kurz: "Geraden", zeile: "Aus zwei Punkten oder mit Steigung", slogan: "y = m·x + c aus zwei Punkten oder aus Punkt und Steigung.",
    zeichen: "mx+c", bild: "gerade", ziel: { ansicht: "geradengleichung" }, etikett: "trainieren", stufe: "mittel" },
  parabeln: { name: "Parabeln", kurz: "Parabeln", zeile: "Scheitel, Nullstellen, Brennpunkt", slogan: "Scheitelpunkt, Scheitelform, Nullstellen und Brennpunkt.",
    zeichen: "ax²", bild: "parabel", ziel: { ansicht: "parabeln" }, etikett: "entdecken", stufe: "mittel" },
  sinus: { name: "Sinusfunktion", kurz: "Sinus", zeile: "f(x) = a · sin(b · (x − c)) + d", slogan: "a, b, c und d finden, bis der Graph passt.",
    zeichen: "∿", bild: "sinus", ziel: { ansicht: "sinus" }, etikett: "entdecken", stufe: "beide" },
  wachstum: { name: "Wachstum und Logarithmen", kurz: "Wachstum", zeile: "Messwerte, Halbwertszeit, Zielwert", slogan: "Exponentielle Modelle, Halbwertszeiten und Logarithmen.",
    zeichen: "aᵗ", bild: "wachstum", ziel: { ansicht: "wachstum" }, etikett: "trainieren", stufe: "beide" },
  ableitungstrainer: { name: "Ableitungstrainer", kurz: "Ableiten", zeile: "f′, f″ und f‴ eingeben und prüfen", slogan: "f′, f″ und f‴ eingeben und sofort prüfen lassen.",
    zeichen: "f′", bild: "ableitung", ziel: { ansicht: "ableitungstrainer" }, etikett: "trainieren", stufe: "ober" },
  kurvendiskussion: { name: "Kurvendiskussion", kurz: "Kurven", zeile: "Graph, Ableitungen und PDF", slogan: "Graph, Ableitungen und die komplette Kurvendiskussion – für Polynome und beliebige Funktionen.",
    zeichen: "f(x)", bild: "kurve", ziel: { ansicht: "plotter" }, auch: ["advplotter"], etikett: "rechnen", stufe: "ober",
    modi: [{ ansicht: "plotter", name: "Polynome" }, { ansicht: "advplotter", name: "Beliebige Funktionen" }] },
  scharen: { name: "Funktionsscharen", kurz: "Scharen", zeile: "Parameter, Ortskurven, Sonderfälle", slogan: "Parameter per Regler verändern, Punkte und Ortskurven berechnen.",
    zeichen: "fₐ", bild: "scharen", ziel: { ansicht: "scharen" }, etikett: "entdecken", stufe: "ober" },
  steckbrief: { name: "Steckbriefaufgaben", kurz: "Steckbrief", zeile: "Aus Eigenschaften die Funktion", slogan: "Aus Hochpunkt, Wendepunkt & Co. die Funktion bauen.",
    zeichen: "f(?)", bild: "steckbrief", ziel: { ansicht: "steckbrief" }, etikett: "trainieren", stufe: "ober" },
  optimierung: { name: "Optimierungswerkstatt", kurz: "Optimierung", zeile: "Schachtel, Fläche, eigener Ansatz", slogan: "Vom Text zur Zielfunktion – Schachtel, Fläche, eigener Ansatz.",
    zeichen: "max", bild: "optimierung", ziel: { ansicht: "optimierung" }, etikett: "trainieren", stufe: "ober" },
  stammintegral: { name: "Stammfunktion & Integral", kurz: "Hauptsatz", zeile: "F bilden, ∫ₐᵇ mit dem Hauptsatz", slogan: "Stammfunktion bilden und Integrale mit dem Hauptsatz berechnen – Schritt für Schritt.",
    zeichen: "F(b) − F(a)", bild: "hauptsatz", ziel: { ansicht: "stammintegral" }, etikett: "trainieren", stufe: "ober" },
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
  ebenen: { name: "Ebenen-Visualizer", kurz: "Visualizer", zeile: "Ebenen live im Raum drehen", slogan: "Ebenen in Koordinatenform live im Raum drehen.",
    zeichen: "E", bild: "ebene", ziel: { ansicht: "ebenen" }, etikett: "entdecken", stufe: "ober" },
  geraden: { name: "Geraden im Raum", kurz: "Lage", zeile: "Punktprobe und Lage", slogan: "Punktprobe und Lage: schneidend, parallel, windschief.",
    zeichen: "g", bild: "geraden", ziel: { ansicht: "geraden" }, etikett: "trainieren", stufe: "ober" },
  ebenevsebene: { name: "Ebene vs. Ebene", kurz: "E vs. E", zeile: "Schnittgerade und Schnittwinkel", slogan: "Schnittgerade und Schnittwinkel zweier Ebenen.",
    zeichen: "E₁E₂", bild: "ebenen2", ziel: { ansicht: "ebenevsebene" }, etikett: "rechnen", stufe: "ober" },
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

  /* ---------- Geometrie ---------- */
  winkelsaetze: { name: "Winkel und Winkelsummen", kurz: "Winkel", zeile: "Parallelen, Dreieck, n-Eck", slogan: "Scheitel-, Stufen- und Wechselwinkel, Winkelsumme im Dreieck und im n-Eck.",
    zeichen: "∠", bild: "parallelwinkel", ziel: { ansicht: "winkelsaetze" }, etikett: "entdecken", stufe: "mittel", unter: true },
  konstruktion: { name: "Besondere Linien im Dreieck", kurz: "Linien", zeile: "Umkreis, Inkreis, Schwerpunkt", slogan: "Mittelsenkrechte, Winkelhalbierende, Höhe, Seitenhalbierende – und ihre Schnittpunkte.",
    zeichen: "⊙", bild: "konstruktion", ziel: { ansicht: "konstruktion" }, etikett: "entdecken", stufe: "mittel", unter: true },
  kongruenz: { name: "Kongruenzsätze", kurz: "Kongruenz", zeile: "SSS, SWS, WSW, SsW – eindeutig?", slogan: "Wann drei Stücke ein Dreieck festlegen – Konstruktionen und Begründen an Figuren.",
    zeichen: "≅", bild: "kongruenz", ziel: { ansicht: "kongruenz" }, etikett: "entdecken", stufe: "mittel", unter: true },
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
  trigonometrie: { name: "Trigonometrie am Dreieck", kurz: "Trigo", zeile: "sin, cos, tan, Sinus- und Kosinussatz", slogan: "Seiten und Winkel berechnen – rechtwinklig und allgemein.",
    zeichen: "sin", bild: "trig", ziel: { ansicht: "trigonometrie" }, etikett: "trainieren", stufe: "mittel" },

  /* ---------- Bruchrechnen ---------- */
  bruchrechnen: { name: "Brüche rechnen", kurz: "Brüche", zeile: "Kürzen, plus, minus, mal, geteilt", slogan: "Kürzen, erweitern und alle Grundrechenarten – mit Bruchstreifen und gezielter Fehlerrückmeldung.",
    zeichen: "¾", bild: "bruch", ziel: { ansicht: "bruchrechnen" }, etikett: "trainieren", stufe: "mittel", unter: true },
  bruchterme: { name: "Bruchterme und -gleichungen", kurz: "Bruchterme", zeile: "Definitionsmenge, kürzen, lösen", slogan: "x im Nenner: Definitionsmenge, Kürzen nur von Faktoren, Bruchgleichungen ohne Scheinlösung.",
    zeichen: "1/x", bild: "bruchterm", ziel: { ansicht: "bruchterme" }, etikett: "trainieren", stufe: "mittel" },

  /* ---------- Gleichungen ---------- */
  terme: { name: "Terme und Potenzgesetze", kurz: "Terme", zeile: "Vereinfachen, ausklammern, kürzen", slogan: "Vereinfachen, Ausklammern, Binomische Formeln, Potenzen, Brüche.",
    zeichen: "xⁿ", bild: "termkarte", ziel: { ansicht: "terme" }, etikett: "trainieren", stufe: "mittel", unter: true },
  gleichungen: { name: "Gleichungen lösen", kurz: "Lösen", zeile: "Umformen und verstehen", slogan: "Äquivalenzumformungen eintippen – linear bis Logarithmus, mit Verstehen-Modi.",
    zeichen: "x =", bild: "gleichung", ziel: { ansicht: "gleichungen" }, auch: ["gleichverstehen"], etikett: "trainieren", stufe: "beide", unter: true,
    modi: [{ ansicht: "gleichungen", name: "Lösen" }, { ansicht: "gleichverstehen", name: "Verstehen" }] },
  lgs: { name: "Gleichungssysteme", kurz: "LGS", zeile: "Mit drei Variablen", slogan: "LGS mit drei Unbekannten – Gauß-Verfahren und direkter Weg.",
    zeichen: "I II III", bild: "lgs", ziel: { ansicht: "lgs" }, etikett: "trainieren", stufe: "beide" },
};

/* Bereiche → Stationen (in Abi-Reihenfolge) → Werkzeuge */
export const BEREICHE = [
  { id: "analysis", titel: "Analysis", uebersicht: "analysis", text: "Vier Stationen: Funktionen kennen, untersuchen, bestimmen, integrieren.",
    video: { name: "Videokurse Analysis", zeile: "Analysis 1–5 mit Videolektionen und Checks" },
    stationen: [
      { id: "kennen", titel: "Kennen", zeile: "Die wichtigsten Funktionsklassen", werkzeuge: ["geradengleichung", "parabeln", "sinus", "wachstum"] },
      { id: "untersuchen", titel: "Untersuchen", zeile: "Ableiten und Kurven diskutieren", werkzeuge: ["ableitungstrainer", "kurvendiskussion", "scharen"] },
      { id: "bestimmen", titel: "Bestimmen", zeile: "Funktionen aufstellen und anwenden", werkzeuge: ["steckbrief", "optimierung"] },
      { id: "integrieren", titel: "Integrieren", zeile: "Stammfunktionen, Flächen, Bestand", werkzeuge: ["stammintegral", "integrale"] },
    ] },
  { id: "vektoren", titel: "Vektoren", uebersicht: "vektoren", text: "Drei Stationen: rechnen, Geraden und Ebenen aufstellen, Lage und Abstand.",
    video: { name: "Videokurs Vektoren", zeile: "Fünf Lektionen mit Kurz-Checks" },
    stationen: [
      { id: "rechnen", titel: "Rechnen", zeile: "Vektoren, Kreuz- und Skalarprodukt", werkzeuge: ["vektorgenerator", "kreuzprodukt", "winkel"] },
      { id: "aufstellen", titel: "Aufstellen", zeile: "Geraden und Ebenen aus Punkten", werkzeuge: ["zweipunkte", "dreipunkte", "ebenen"] },
      { id: "lage", titel: "Lage und Abstand", zeile: "Schneiden, parallel, windschief, Abstände", werkzeuge: ["geraden", "ebenevsebene", "abstaende"] },
    ] },
  { id: "stochastik", titel: "Stochastik", uebersicht: "stochastik", text: "Drei Stationen: zählen, Zufallsgrößen, testen.",
    video: { name: "Videokurs Stochastik", zeile: "Vom Baumdiagramm zum Hypothesentest" },
    stationen: [
      { id: "zaehlen", titel: "Zählen und Bäume", zeile: "Urnen, Pfade, Vier-Felder-Tafel", werkzeuge: ["kombinatorik", "vierfelder"] },
      { id: "zufallsgroessen", titel: "Zufallsgrößen", zeile: "Erwartungswert und Binomialverteilung", werkzeuge: ["erwartungswert", "bernoulli"] },
      { id: "testen", titel: "Testen", zeile: "Hypothesen prüfen", werkzeuge: ["hypothesentest"] },
    ] },
  { id: "geometrie", titel: "Geometrie", uebersicht: null, text: "Fünf Stationen: Winkel und Dreiecke, rechte Winkel, Ähnlichkeit, Dreiecke berechnen, Kreis und Körper.",
    stationen: [
      { id: "dreieck", titel: "Winkel und Dreiecke", zeile: "Winkelsätze, Kongruenz, Konstruktionen", werkzeuge: ["winkelsaetze", "kongruenz", "konstruktion"] },
      { id: "rechtwinklig", titel: "Rechte Winkel", zeile: "Thales, Pythagoras, Höhensatz", werkzeuge: ["thales", "pythagoras", "kathetensatz"] },
      { id: "aehnlich", titel: "Ähnlichkeit", zeile: "Strahlensätze und Streckfaktor", werkzeuge: ["strahlensaetze"] },
      { id: "dreiecke", titel: "Dreiecke berechnen", zeile: "Sinus, Kosinus, Tangens", werkzeuge: ["trigonometrie"] },
      { id: "kreiskoerper", titel: "Kreis und Körper", zeile: "Kreisteile, Volumen, Oberfläche", werkzeuge: ["kreis", "koerper"] },
    ] },
  { id: "bruchrechnen", titel: "Bruchrechnen", uebersicht: null, text: "Zwei Stationen: Brüche rechnen, Bruchterme und Bruchgleichungen.",
    stationen: [
      { id: "brueche", titel: "Brüche rechnen", zeile: "Kürzen, erweitern, Grundrechenarten", werkzeuge: ["bruchrechnen"] },
      { id: "bruchterme", titel: "Bruchterme", zeile: "x im Nenner: kürzen und lösen", werkzeuge: ["bruchterme"] },
    ] },
  { id: "gleichungen", titel: "Gleichungen", uebersicht: null, text: "Zwei Stationen: Terme umformen, Gleichungen lösen.",
    video: { name: "Videokurs Gleichungen", zeile: "Umformen, Gleichungssysteme, Musterlösungen" },
    stationen: [
      { id: "terme", titel: "Terme umformen", zeile: "Vereinfachen, ausklammern, Potenzen", werkzeuge: ["terme"] },
      { id: "loesen", titel: "Gleichungen lösen", zeile: "Einzelne Gleichungen und Systeme", werkzeuge: ["gleichungen", "lgs"] },
    ] },
];

/* ---------- Abfragen ---------- */

/* Stufen-Schalter: passt ein Werkzeug zur gewählten Stufe? (wahl: alle | unter | mittel | ober)
   Unterstufe (Kl. 5–7): nur Werkzeuge mit unter: true. „beide“ = Mittel- und Oberstufe. */
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
