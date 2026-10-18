/* ============================================================
   SCHULBUCH – Quickfinder auf der Startseite („Mein Training“)
   Schulart (G8 · G9 · GMS) → Klasse → Buchkapitel → Hilfen in der App.

   Baden-Württemberg. Die Kapitel orientieren sich am Lambacher Schweizer
   (Bildungsplan 2016, G8-Bände 5–10 und Kursstufe) – für G9 (ab 2025/26
   wieder Regelform) und die Gemeinschaftsschule ist derselbe Stoff auf ein
   Jahr mehr verteilt. Reihenfolge und Zuschnitt sind je Schule verschieden;
   die Titel sind so gewählt, dass man sein Kapitel wiedererkennt.

   Reine Daten, keine React-Importe: darf von base- und func-Dateien
   importiert werden (nur werkzeuge.js).
   ============================================================ */
import { WERKZEUGE } from "./werkzeuge.js";

export const SCHULARTEN = [
  { id: "g8", name: "G8", zeile: "Gymnasium, Abitur nach Klasse 12", kursstufe: [11, 12] },
  { id: "g9", name: "G9", zeile: "Gymnasium, Abitur nach Klasse 13", kursstufe: [12, 13] },
  { id: "gms", name: "GS9", zeile: "Gemeinschaftsschule, Abitur nach Klasse 13", kursstufe: [12, 13] },
];
export const SCHULART_STANDARD = "g9";

/* Klassenboxen je Schulart, immer mit 5/6 als einer Box. G8: 5/6 … 12 (sieben Boxen, 11 und 12 = Kursstufe, gold).
   G9 und GMS: 5/6 … 13 (acht Boxen, 12 und 13 gold). Eine eigene Abi-Box gibt es nicht mehr. */
export function klassenBoxen(schulart) {
  const s = SCHULARTEN.find((x) => x.id === schulart) || SCHULARTEN[1];
  const klassen = schulart === "g8" ? [[5, 6], [7], [8], [9], [10], [11], [12]] : [[5, 6], [7], [8], [9], [10], [11], [12], [13]];
  return klassen.map((ks) => ({ id: ks.join("-"), label: ks.join("/"), klassen: ks, gold: ks.some((k) => s.kursstufe.includes(k)) }));
}
export const schulart = (id) => SCHULARTEN.find((x) => x.id === id) || null;
export const stufeAusKlassenBox = (box) => (!box ? "alle" : box.klassen[0] <= 7 ? "unter" : box.klassen[0] <= 10 ? "mittel" : "ober");

/* ---------- Hilfen: Werkzeuge der App und weitere Seiten ---------- */
const w = (id) => ({ art: "werkzeug", id });
const z = (name, zeile, ziel) => ({ art: "seite", name, zeile, ziel });
const HEAD = z("Kopfrechnen", "Einmaleins, Quadratzahlen, schriftliches Rechnen, Brüche", { ansicht: "headnumbers" });
const WARMUP = z("5 Minuten Mathe", "Fünf kurze Aufgaben zum Aufwärmen", { ansicht: "warmup" });
const FS_UNTER = z("Formelsammlung · Unterstufe", "Alle Regeln für Klasse 5 bis 7", { ansicht: "formeln", bereich: "unterstufe" });
const FS_GEO = z("Formelsammlung · Geometrie", "Pythagoras, Kreis, Körper, Einheitskreis", { ansicht: "formeln", bereich: "geometrie" });
const FS_TERME = z("Formelsammlung · Terme", "Binomische Formeln, pq-Formel, Logarithmen", { ansicht: "formeln", bereich: "terme" });
const FS_FKT = z("Formelsammlung · Funktionen", "Geraden, Parabeln, Wachstum, Sinus", { ansicht: "formeln", bereich: "funktionen" });
const FS_ANA = z("Formelsammlung · Analysis", "Ableiten, Integrieren, Kurvendiskussion", { ansicht: "formeln", bereich: "analysis" });
const FS_VEK = z("Formelsammlung · Vektoren", "Skalarprodukt, Ebenen, Abstände", { ansicht: "formeln", bereich: "vektoren" });
const FS_STO = z("Formelsammlung · Stochastik", "Bayes, Binomialverteilung, Tests", { ansicht: "formeln", bereich: "stochastik" });
const FS_KOPF = z("Formelsammlung · Kopfrechnen", "Rechentricks, Teilbarkeit, Brüche", { ansicht: "formeln", bereich: "kopfrechnen" });
const E_TEILER = z("Teilbarkeitsregeln entdecken", "Alle Regeln von 2 bis 9 selbst herleiten", { ansicht: "entdecken", seite: "teiler" });
const E_PYTH = z("Satz des Pythagoras entdecken", "Entdecke, warum a² + b² = c² gilt", { ansicht: "entdecken", seite: "pythagoras" });
const E_BINOM = z("Binomische Formeln entdecken", "Drei Formeln aus Flächen gebaut", { ansicht: "entdecken", seite: "binomisch" });
const E_GRENZ = z("Ableitung als Grenzwert", "Von der Sekante zur Tangente", { ansicht: "entdecken", seite: "grenzwert" });
const E_PASCAL = z("Pascalsches Dreieck", "Vom Zahlenmuster zur Potenzregel", { ansicht: "entdecken", seite: "praxis" });
const DIFFQ = z("Differenzenquotient", "Vom Tangentenproblem zur Ableitung", { ansicht: "diffq" });
const POTREGEL = z("Potenzregel", "Beweis mit Produktregel und vollständiger Induktion", { ansicht: "potenzregel" });
const ABIKETTEN = z("Abi-Ketten", "Eine Abi-Aufgabe durch mehrere Werkzeuge", { ansicht: "abiketten" });
const ABISAETZE = z("Abi-Sätze", "Zehn komplette Aufgabensätze im Abi-Format", { ansicht: "abisaetze" });
const PROBEABI = z("Probeabitur", "Teil A und B mit Uhr und Notenpunkten", { ansicht: "abitur" });
const PRUEFUNG = z("Prüfungsmodus", "Ohne Hilfen, mit Punkten", { ansicht: "pruefung" });
const OPERATOREN = z("Operatoren", "Was „bestimmen“, „zeigen“, „begründen“ verlangen", { ansicht: "operatoren" });

/* ---------- Die Themen (Buchkapitel) ---------- */
/* titel: so, wie das Kapitel im Buch heißt (oder heißen könnte); hilfen: in der Reihenfolge, in der sie helfen */
export const THEMEN = {
  /* Unterstufe */
  natzahlen: { titel: "Natürliche Zahlen", zeile: "Stellenwert, Zahlenstrahl, runden, Teilbarkeit", hilfen: [HEAD, E_TEILER, FS_KOPF, FS_UNTER] },
  rechnen: { titel: "Rechnen mit natürlichen Zahlen", zeile: "Schriftlich rechnen, Rechengesetze, Rechenvorteile", hilfen: [HEAD, WARMUP, FS_KOPF, FS_UNTER] },
  groessen: { titel: "Größen und Messen", zeile: "Länge, Gewicht, Zeit, Geld, Maßstab", hilfen: [FS_UNTER, WARMUP] },
  figuren: { titel: "Geometrische Figuren und Symmetrie", zeile: "Punkt, Strecke, Gerade, Koordinatensystem, Spiegeln", hilfen: [FS_UNTER, FS_GEO] },
  flaechen: { titel: "Umfang und Flächeninhalt", zeile: "Rechteck, Quadrat, zusammengesetzte Figuren", hilfen: [FS_UNTER, FS_GEO, WARMUP] },
  ganze: { titel: "Ganze Zahlen", zeile: "Negative Zahlen, Zahlengerade, Rechnen mit Vorzeichen", hilfen: [WARMUP, HEAD, FS_UNTER] },
  brueche: { titel: "Brüche und Anteile", zeile: "Bruchteile, kürzen, erweitern, vergleichen", hilfen: [w("bruchrechnen"), HEAD, WARMUP, FS_KOPF, FS_UNTER] },
  bruchrechnen: { titel: "Rechnen mit Brüchen", zeile: "Addieren, subtrahieren, multiplizieren, dividieren", hilfen: [w("bruchrechnen"), HEAD, WARMUP, FS_KOPF, FS_UNTER] },
  dezimal: { titel: "Dezimalzahlen", zeile: "Umwandeln, runden, schriftlich rechnen", hilfen: [HEAD, WARMUP, FS_UNTER] },
  rational: { titel: "Rationale Zahlen", zeile: "Negative Brüche und Dezimalzahlen, alle vier Rechenarten", hilfen: [w("bruchrechnen"), WARMUP, HEAD, FS_UNTER] },
  winkelkreis: { titel: "Winkel und Kreis", zeile: "Winkel messen und zeichnen, Winkelarten, Kreisfiguren", hilfen: [w("winkelsaetze"), FS_UNTER, FS_GEO] },
  koerper: { titel: "Quader und Würfel", zeile: "Netze, Oberfläche, Rauminhalt", hilfen: [FS_UNTER, FS_GEO] },
  daten: { titel: "Daten und Diagramme", zeile: "Häufigkeiten, Mittelwert, Säulen- und Kreisdiagramm", hilfen: [FS_UNTER, WARMUP] },
  teilbarkeit: { titel: "Teilbarkeit und Primzahlen", zeile: "Teilbarkeitsregeln, ggT, kgV, Primfaktoren", hilfen: [E_TEILER, HEAD, FS_KOPF] },

  /* Mittelstufe */
  prozent: { titel: "Prozent- und Zinsrechnung", zeile: "Grundwert, Prozentsatz, Prozentwert, Zinsen", hilfen: [WARMUP, HEAD, FS_UNTER] },
  zuordnungen: { titel: "Zuordnungen und Dreisatz", zeile: "Proportional, antiproportional, Graphen lesen", hilfen: [w("geradengleichung"), FS_UNTER, WARMUP] },
  linfkt: { titel: "Lineare Funktionen", zeile: "Steigung, y-Achsenabschnitt, Geradengleichung", hilfen: [w("geradengleichung"), w("gleichungen"), FS_FKT] },
  termegl: { titel: "Terme und lineare Gleichungen", zeile: "Terme aufstellen, vereinfachen, Gleichungen umformen", hilfen: [w("bruchterme"), w("terme"), w("gleichungen"), FS_TERME] },
  dreiecke: { titel: "Winkel, Dreiecke und Kongruenz", zeile: "Winkelsätze, Dreiecke konstruieren, besondere Linien", hilfen: [w("winkelsaetze"), w("kongruenz"), w("konstruktion"), w("thales"), FS_GEO, FS_UNTER] },
  wkt1: { titel: "Zufall und Wahrscheinlichkeit", zeile: "Laplace-Experimente, Baumdiagramme, Pfadregeln", hilfen: [w("kombinatorik"), w("vierfelder"), FS_STO] },
  binom: { titel: "Terme mit Klammern und binomische Formeln", zeile: "Ausmultiplizieren, ausklammern, faktorisieren", hilfen: [w("terme"), E_BINOM, FS_TERME] },
  wurzeln: { titel: "Quadratwurzeln und reelle Zahlen", zeile: "Wurzeln ziehen, teilweise Wurzeln, irrationale Zahlen", hilfen: [w("terme"), w("gleichungen"), HEAD, FS_TERME] },
  bruchterme: { titel: "Bruchterme und Bruchgleichungen", zeile: "Kürzen, Hauptnenner, Definitionsmenge", hilfen: [w("terme"), w("gleichungen"), FS_TERME] },
  quad: { titel: "Quadratische Funktionen und Gleichungen", zeile: "Parabeln, Scheitelform, pq-Formel", hilfen: [w("parabeln"), w("gleichungen"), FS_FKT, FS_TERME] },
  lgs2: { titel: "Lineare Gleichungssysteme", zeile: "Zwei Gleichungen, zwei Variablen: Einsetzen, Gleichsetzen, Addieren", hilfen: [w("lgs"), w("gleichungen"), w("geradengleichung")] },
  kreis: { titel: "Kreis: Umfang und Flächeninhalt", zeile: "Kreiszahl π, Kreisring, Kreisausschnitt", hilfen: [w("kreis"), FS_GEO, w("thales"), WARMUP] },
  prismen: { titel: "Prismen und Zylinder", zeile: "Oberfläche und Volumen", hilfen: [w("koerper"), FS_GEO, WARMUP] },
  potenzen: { titel: "Potenzen und Potenzgesetze", zeile: "Ganze und rationale Hochzahlen, Zehnerpotenzen", hilfen: [w("terme"), w("gleichungen"), FS_TERME] },
  strahlen: { titel: "Ähnlichkeit und Strahlensätze", zeile: "Zentrische Streckung, V- und X-Figur", hilfen: [w("strahlensaetze"), FS_GEO] },
  pythagoras: { titel: "Satz des Pythagoras", zeile: "a² + b² = c², Katheten- und Höhensatz, Anwendungen", hilfen: [w("pythagoras"), w("kathetensatz"), E_PYTH, w("thales"), w("trigonometrie"), FS_GEO] },
  trig: { titel: "Trigonometrie im Dreieck", zeile: "Sinus, Kosinus, Tangens, Sinus- und Kosinussatz", hilfen: [w("trigonometrie"), FS_GEO] },
  potfkt: { titel: "Potenzfunktionen und Funktionsbegriff", zeile: "f(x), Definitionsmenge, Graphen von xⁿ", hilfen: [w("kurvendiskussion"), FS_FKT] },
  explog: { titel: "Exponentialfunktionen und Logarithmus", zeile: "Wachstum, Zerfall, Exponentialgleichungen", hilfen: [w("wachstum"), w("gleichungen"), FS_FKT, FS_TERME] },
  wkt2: { titel: "Mehrstufige Zufallsexperimente", zeile: "Baumdiagramm, Vier-Felder-Tafel, bedingte Wahrscheinlichkeit", hilfen: [w("vierfelder"), w("kombinatorik"), FS_STO] },
  ganzrat: { titel: "Ganzrationale Funktionen", zeile: "Graphen verschieben und strecken, Symmetrie, Gleichungen höheren Grades", hilfen: [w("kurvendiskussion"), w("gleichungen"), w("steckbrief"), FS_FKT] },
  sinfkt: { titel: "Sinus- und Kosinusfunktion", zeile: "Einheitskreis, Periode, Amplitude, Verschiebung", hilfen: [w("sinus"), w("trigonometrie"), FS_FKT] },
  diff1: { titel: "Einführung in die Differenzialrechnung", zeile: "Mittlere und momentane Änderungsrate, Ableitung", hilfen: [E_GRENZ, DIFFQ, w("ableitungstrainer")] },
  ablregeln: { titel: "Ableitungsregeln", zeile: "Potenz-, Faktor- und Summenregel, Tangente", hilfen: [w("ableitungstrainer"), POTREGEL, E_PASCAL, FS_ANA] },
  kugel: { titel: "Kugel, Kegel und Pyramide", zeile: "Oberfläche und Volumen der Körper", hilfen: [w("koerper"), FS_GEO, w("optimierung")] },
  zufallsgr: { titel: "Zufallsgrößen und Erwartungswert", zeile: "Wahrscheinlichkeitsverteilung, faire Spiele", hilfen: [w("erwartungswert"), w("bernoulli"), FS_STO] },
  vek1: { titel: "Vektoren und Geraden im Raum", zeile: "Koordinaten im Raum, Vektoren addieren, Geradengleichung", hilfen: [w("vektorgenerator"), w("zweipunkte"), FS_VEK] },

  /* Kursstufe (Kapitel I–X wie im Lambacher Schweizer Kursstufe) */
  ksDiff: { titel: "Grundlagen der Differenzialrechnung", zeile: "Ketten- und Produktregel, Monotonie, Extrem- und Wendepunkte, Tangente", hilfen: [w("ableitungstrainer"), w("kurvendiskussion"), w("optimierung"), POTREGEL, FS_ANA] },
  ksExp: { titel: "Exponential- und Logarithmusfunktionen", zeile: "e-Funktion, ln, Umkehrfunktion, Wachstum", hilfen: [w("wachstum"), w("kurvendiskussion"), w("gleichungen"), FS_FKT] },
  ksInt: { titel: "Integralrechnung", zeile: "Stammfunktion, Hauptsatz, Flächen, Rotationskörper", hilfen: [w("stammintegral"), w("integrale"), FS_ANA] },
  ksFkt: { titel: "Funktionen und ihre Graphen", zeile: "Transformationen, Asymptoten, trigonometrische Funktionen, Scharen", hilfen: [w("scharen"), w("kurvendiskussion"), w("sinus"), FS_FKT] },
  ksLgs: { titel: "Lineare Gleichungssysteme", zeile: "Gauß-Verfahren, Lösungsmengen, Funktionen bestimmen", hilfen: [w("lgs"), w("steckbrief"), FS_TERME] },
  ksGeraden: { titel: "Geraden und Ebenen", zeile: "Vektoren, Parameter- und Koordinatenform, Lagebeziehungen", hilfen: [w("vektorgenerator"), w("zweipunkte"), w("dreipunkte"), w("ebenen"), w("geraden"), w("ebenevsebene"), w("kreuzprodukt"), FS_VEK] },
  ksAbstand: { titel: "Abstände und Winkel", zeile: "HNF, Abstand Punkt–Gerade, windschiefe Geraden, Schnittwinkel", hilfen: [w("abstaende"), w("winkel"), w("kreuzprodukt"), FS_VEK] },
  ksWkt: { titel: "Grundlagen der Wahrscheinlichkeitsrechnung", zeile: "Kombinatorik, bedingte Wahrscheinlichkeit, Bernoulli, Binomialverteilung", hilfen: [w("kombinatorik"), w("vierfelder"), w("erwartungswert"), w("bernoulli"), FS_STO] },
  ksTest: { titel: "Testen mit der Binomialverteilung", zeile: "Ein- und zweiseitiger Hypothesentest, Fehler 1. und 2. Art", hilfen: [w("hypothesentest"), w("bernoulli"), FS_STO] },
  ksNormal: { titel: "Normalverteilung", zeile: "Glockenfunktion, Sigma-Regeln, stetige Zufallsgrößen", hilfen: [w("bernoulli"), FS_STO] },
  ksAbi: { titel: "Abiturvorbereitung", zeile: "Ganze Aufgaben im Abi-Format, Operatoren, Prüfungsmodus", hilfen: [ABIKETTEN, ABISAETZE, PROBEABI, OPERATOREN, PRUEFUNG] },
};

/* ---------- Welche Kapitel in welcher Klasse ---------- */
const G8 = {
  "5-6": ["natzahlen", "rechnen", "groessen", "figuren", "flaechen", "ganze", "brueche", "bruchrechnen", "dezimal", "rational", "winkelkreis", "koerper", "teilbarkeit", "daten"],
  7: ["prozent", "zuordnungen", "linfkt", "termegl", "dreiecke", "wkt1"],
  8: ["binom", "wurzeln", "bruchterme", "quad", "lgs2", "kreis", "prismen"],
  9: ["potenzen", "strahlen", "pythagoras", "potfkt", "explog", "trig", "wkt2"],
  10: ["ganzrat", "diff1", "ablregeln", "sinfkt", "kugel", "zufallsgr"],
  11: ["ksDiff", "ksExp", "ksInt", "ksFkt", "ksWkt"],
  12: ["ksLgs", "ksGeraden", "ksAbstand", "ksTest", "ksNormal", "ksAbi"],
};
const G9 = {
  "5-6": ["natzahlen", "rechnen", "groessen", "figuren", "flaechen", "ganze", "brueche", "bruchrechnen", "dezimal", "winkelkreis", "koerper", "daten"],
  7: ["rational", "prozent", "zuordnungen", "termegl", "dreiecke", "wkt1"],
  8: ["linfkt", "binom", "lgs2", "wurzeln", "kreis", "prismen"],
  9: ["quad", "bruchterme", "potenzen", "strahlen", "pythagoras", "wkt2"],
  10: ["trig", "potfkt", "explog", "sinfkt", "kugel", "zufallsgr"],
  11: ["ganzrat", "diff1", "ablregeln", "ksDiff", "vek1", "ksWkt"],
  12: ["ksExp", "ksInt", "ksFkt", "ksLgs", "ksGeraden"],
  13: ["ksAbstand", "ksTest", "ksNormal", "ksAbi"],
};
export const PLAN = { g8: G8, g9: G9, gms: G9 };

/* Kapitel zu Schulart und Klassenbox (id wie in klassenBoxen) – mit laufender Nummer wie im Buch */
export function kapitelFuer(schulartId, boxId) {
  const plan = PLAN[schulartId] || PLAN.g9;
  const ids = plan[boxId] || [];
  return ids.map((id, i) => ({ id, nr: i + 1, ...THEMEN[id] }));
}

/* Hilfen eines Kapitels als flache Liste { name, zeile, ziel, art, id } */
export function hilfenFuer(themaId) {
  const t = THEMEN[themaId];
  if (!t) return [];
  return t.hilfen.map((h) => {
    if (h.art === "werkzeug") {
      const wz = WERKZEUGE[h.id];
      return wz ? { art: "werkzeug", id: h.id, name: wz.name, zeile: wz.zeile, ziel: wz.ziel, etikett: wz.etikett } : null;
    }
    return { art: "seite", id: h.ziel.ansicht + (h.ziel.seite || h.ziel.bereich || ""), name: h.name, zeile: h.zeile, ziel: h.ziel };
  }).filter(Boolean);
}

/* Römische Ziffer fürs Kapitel (I … XII) */
export const roemisch = (n) => ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][n] || String(n);
