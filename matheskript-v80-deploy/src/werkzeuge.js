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
   ============================================================ */

export const ETIKETTEN = {
  entdecken: { name: "Entdecken", text: "Regler, Live-Bild, ausprobieren" },
  rechnen: { name: "Rechnen", text: "Die App rechnet dir den Weg vor" },
  trainieren: { name: "Trainieren", text: "Du rechnest selbst, die App prüft" },
};

export const WERKZEUGE = {
  /* ---------- Analysis ---------- */
  geradengleichung: { name: "Geradengleichung", kurz: "Geraden", zeile: "y = m·x + c aus zwei Punkten oder Punkt und Steigung", slogan: "y = m·x + c aus zwei Punkten oder aus Punkt und Steigung.",
    zeichen: "mx+c", bild: "gerade", ziel: { ansicht: "geradengleichung" }, etikett: "trainieren" },
  parabeln: { name: "Parabeln", kurz: "Parabeln", zeile: "Scheitelpunkt, Scheitelform, Nullstellen, Brennpunkt", slogan: "Scheitelpunkt, Scheitelform, Nullstellen und Brennpunkt.",
    zeichen: "ax²", bild: "parabel", ziel: { ansicht: "parabeln" }, etikett: "entdecken" },
  sinus: { name: "Sinusfunktion", kurz: "Sinus", zeile: "f(x) = a · sin(b · (x − c)) + d", slogan: "a, b, c und d finden, bis der Graph passt.",
    zeichen: "∿", bild: "sinus", ziel: { ansicht: "sinus" }, etikett: "entdecken" },
  wachstum: { name: "Wachstum und Logarithmen", kurz: "Wachstum", zeile: "Messwerte, Halbwertszeit, Zielwert", slogan: "Exponentielle Modelle, Halbwertszeiten und Logarithmen.",
    zeichen: "aᵗ", bild: "wachstum", ziel: { ansicht: "wachstum" }, etikett: "trainieren" },
  ableitungstrainer: { name: "Ableitungstrainer", kurz: "Ableiten", zeile: "f′, f″ und f‴ eingeben und prüfen", slogan: "f′, f″ und f‴ eingeben und sofort prüfen lassen.",
    zeichen: "f′", bild: "ableitung", ziel: { ansicht: "ableitungstrainer" }, etikett: "trainieren" },
  kurvendiskussion: { name: "Kurvendiskussion", kurz: "Kurven", zeile: "Polynome oder beliebige Funktionen – Graph, Ableitungen, PDF", slogan: "Graph, Ableitungen und die komplette Kurvendiskussion – für Polynome und beliebige Funktionen.",
    zeichen: "f(x)", bild: "kurve", ziel: { ansicht: "plotter" }, auch: ["advplotter"], etikett: "rechnen",
    modi: [{ ansicht: "plotter", name: "Polynome" }, { ansicht: "advplotter", name: "Beliebige Funktionen" }] },
  scharen: { name: "Funktionsscharen", kurz: "Scharen", zeile: "Parameter, Ortskurven, Sonderfälle", slogan: "Parameter per Regler verändern, Punkte und Ortskurven berechnen.",
    zeichen: "fₐ", bild: "scharen", ziel: { ansicht: "scharen" }, etikett: "entdecken" },
  steckbrief: { name: "Steckbriefaufgaben", kurz: "Steckbrief", zeile: "Aus Eigenschaften die Funktion bestimmen", slogan: "Aus Hochpunkt, Wendepunkt & Co. die Funktion bauen.",
    zeichen: "f(?)", bild: "steckbrief", ziel: { ansicht: "steckbrief" }, etikett: "trainieren" },
  optimierung: { name: "Optimierungswerkstatt", kurz: "Optimierung", zeile: "Schachtel, Fläche, eigener Ansatz", slogan: "Vom Text zur Zielfunktion – Schachtel, Fläche, eigener Ansatz.",
    zeichen: "max", bild: "optimierung", ziel: { ansicht: "optimierung" }, etikett: "trainieren" },
  integrale: { name: "Integrale", kurz: "Integrale", zeile: "Stammfunktionen, Flächen, Bestand", slogan: "Stammfunktionen bilden, Flächen und Bestände berechnen.",
    zeichen: "∫", bild: "integral", ziel: { ansicht: "integrale" }, etikett: "trainieren" },

  /* ---------- Vektoren ---------- */
  vektorgenerator: { name: "Rechnen mit Vektoren", kurz: "Rechnen", zeile: "A ± B, k · A, k · A + j · B und Skalarprodukt mit Rechenweg", slogan: "Addition, Vielfache, Linearkombination und Skalarprodukt – immer neue Beispiele mit Rechenweg.",
    zeichen: "a⃗", bild: "wuerfel", ziel: { ansicht: "vektorgenerator" }, etikett: "rechnen" },
  kreuzprodukt: { name: "Kreuzprodukt", kurz: "Kreuz", zeile: "a × b – Formel, eingesetzt, Ergebnis", slogan: "Zwei Vektoren eingeben – Formel, eingesetzt, Ergebnis.",
    zeichen: "×", bild: "kreuz", ziel: { ansicht: "kreuzprodukt" }, etikett: "rechnen" },
  winkel: { name: "Winkel und Skalarprodukt", kurz: "Winkel", zeile: "Skalarprodukt, Vektorwinkel, Gerade-Ebene", slogan: "Skalarprodukt verstehen und Winkel berechnen.",
    zeichen: "φ", bild: "winkel", ziel: { ansicht: "winkel" }, etikett: "trainieren" },
  zweipunkte: { name: "Zwei Punkte – eine Gerade", kurz: "Gerade", zeile: "Geradengleichung auf zwei Wegen", slogan: "Geradengleichung aus zwei Punkten – auf zwei Wegen.",
    zeichen: "AB", bild: "gerade2p", ziel: { ansicht: "zweipunkte" }, etikett: "trainieren" },
  dreipunkte: { name: "Drei Punkte – eine Ebene", kurz: "Ebene", zeile: "Drei Wege, mit Koordinatenform", slogan: "Drei Wege zur Ebene, mit Koordinatenform.",
    zeichen: "ABC", bild: "ebene3p", ziel: { ansicht: "dreipunkte" }, etikett: "trainieren" },
  ebenen: { name: "Ebenen-Visualizer", kurz: "Visualizer", zeile: "Ebenen live im Raum drehen", slogan: "Ebenen in Koordinatenform live im Raum drehen.",
    zeichen: "E", bild: "ebene", ziel: { ansicht: "ebenen" }, etikett: "entdecken" },
  geraden: { name: "Geraden im Raum", kurz: "Lage", zeile: "Punktprobe, Lage von Geraden und Ebenen", slogan: "Punktprobe und Lage: schneidend, parallel, windschief.",
    zeichen: "g", bild: "geraden", ziel: { ansicht: "geraden" }, etikett: "trainieren" },
  ebenevsebene: { name: "Ebene vs. Ebene", kurz: "E vs. E", zeile: "Schnittgerade und Schnittwinkel", slogan: "Schnittgerade und Schnittwinkel zweier Ebenen.",
    zeichen: "E₁E₂", bild: "ebenen2", ziel: { ansicht: "ebenevsebene" }, etikett: "rechnen" },
  abstaende: { name: "Abstände", kurz: "Abstände", zeile: "Punkt, Gerade, Ebene – alle Kombinationen", slogan: "Punkt, Gerade, Ebene – jede Kombination mit 3D-Bild.",
    zeichen: "d", bild: "abstand", ziel: { ansicht: "abstaende" }, etikett: "rechnen" },

  /* ---------- Stochastik ---------- */
  kombinatorik: { name: "Urnen und Kombinatorik", kurz: "Kombinatorik", zeile: "Ziehen, Zählmethoden, Baumdiagramme", slogan: "Ziehen, Zählmethoden, Baumdiagramme.",
    zeichen: "n!", bild: "urne", ziel: { ansicht: "kombinatorik" }, etikett: "trainieren" },
  vierfelder: { name: "Vier-Felder-Tafel", kurz: "Vierfelder", zeile: "Mit Baumdiagramm und bedingter WKT", slogan: "Absolut oder in Prozent – mit Baum und bedingter WKT.",
    zeichen: "▦", bild: "tafel", ziel: { ansicht: "vierfelder" }, etikett: "rechnen" },
  erwartungswert: { name: "Erwartungswert und faire Spiele", kurz: "Erwartung", zeile: "Gewinnverteilung, fairer Einsatz, Simulation", slogan: "Nettogewinn, Erwartungswert, fairer Einsatz – mit Simulation.",
    zeichen: "E(X)", bild: "erwartung", ziel: { ansicht: "erwartungswert" }, etikett: "trainieren" },
  bernoulli: { name: "Bernoulli-Kette", kurz: "Bernoulli", zeile: "Binomialverteilung live simulieren", slogan: "Binomialverteilung live sehen und simulieren.",
    zeichen: "B", bild: "balken", ziel: { ansicht: "bernoulli" }, etikett: "entdecken" },
  hypothesentest: { name: "Hypothesentests", kurz: "Tests", zeile: "H₀, Ablehnungsbereich, Fehler 1. und 2. Art", slogan: "H₀ aufstellen, Ablehnungsbereich finden, Fehler verstehen.",
    zeichen: "H₀", bild: "hypothese", ziel: { ansicht: "hypothesentest" }, etikett: "trainieren" },

  /* ---------- Gleichungen ---------- */
  terme: { name: "Terme und Potenzgesetze", kurz: "Terme", zeile: "Vereinfachen, ausklammern, kürzen", slogan: "Vereinfachen, Ausklammern, Binomische Formeln, Potenzen, Brüche.",
    zeichen: "xⁿ", bild: "termkarte", ziel: { ansicht: "terme" }, etikett: "trainieren" },
  gleichungen: { name: "Gleichungen lösen", kurz: "Lösen", zeile: "Du formst um, die App rechnet mit – dazu fünf Verstehen-Modi", slogan: "Äquivalenzumformungen eintippen – linear bis Logarithmus, mit Verstehen-Modi.",
    zeichen: "x =", bild: "gleichung", ziel: { ansicht: "gleichungen" }, auch: ["gleichverstehen"], etikett: "trainieren",
    modi: [{ ansicht: "gleichungen", name: "Lösen" }, { ansicht: "gleichverstehen", name: "Verstehen" }] },
  lgs: { name: "Gleichungssysteme", kurz: "LGS", zeile: "Mit drei Variablen", slogan: "LGS mit drei Unbekannten – Gauß-Verfahren und direkter Weg.",
    zeichen: "I II III", bild: "lgs", ziel: { ansicht: "lgs" }, etikett: "trainieren" },
};

/* Bereiche → Stationen (in Abi-Reihenfolge) → Werkzeuge */
export const BEREICHE = [
  { id: "analysis", titel: "Analysis", uebersicht: "analysis", text: "Vier Stationen: Funktionen kennen, untersuchen, bestimmen, integrieren.",
    video: { name: "Videokurse Analysis", zeile: "Analysis 1–5 mit Videolektionen und Checks" },
    stationen: [
      { id: "kennen", titel: "Kennen", zeile: "Die wichtigsten Funktionsklassen", werkzeuge: ["geradengleichung", "parabeln", "sinus", "wachstum"] },
      { id: "untersuchen", titel: "Untersuchen", zeile: "Ableiten und Kurven diskutieren", werkzeuge: ["ableitungstrainer", "kurvendiskussion", "scharen"] },
      { id: "bestimmen", titel: "Bestimmen", zeile: "Funktionen aufstellen und anwenden", werkzeuge: ["steckbrief", "optimierung"] },
      { id: "integrieren", titel: "Integrieren", zeile: "Stammfunktionen, Flächen, Bestand", werkzeuge: ["integrale"] },
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
  { id: "gleichungen", titel: "Gleichungen", uebersicht: null, text: "Zwei Stationen: Terme umformen, Gleichungen lösen.",
    video: { name: "Videokurs Gleichungen", zeile: "Umformen, Gleichungssysteme, Musterlösungen" },
    stationen: [
      { id: "terme", titel: "Terme umformen", zeile: "Vereinfachen, ausklammern, Potenzen", werkzeuge: ["terme"] },
      { id: "loesen", titel: "Gleichungen lösen", zeile: "Einzelne Gleichungen und Systeme", werkzeuge: ["gleichungen", "lgs"] },
    ] },
];

/* ---------- Abfragen ---------- */

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
