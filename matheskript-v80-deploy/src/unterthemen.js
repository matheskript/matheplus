/* ======================================================================
   UNTERTHEMEN – was hinter jedem Buchkapitel (schulbuch.js, THEMEN) steckt.
   Im Quickfinder klappen sie als schmale Balken unter dem Kapitel auf.

   Je Unterthema:
     titel  – so, wie es im Unterricht heißt
     gen    – Aufgaben-Generatoren aus trainingDaten.js (sofort üben); leer = noch keine
     wz     – bestes Werkzeug der App (Schlüssel aus werkzeuge.js), optional

   Reine Daten, keine React-Importe. Test: tests/trainingsplan.test.mjs
   (jedes Kapitel hat Unterthemen, jeder Generator und jedes Werkzeug existiert).
   ====================================================================== */

const t = (titel, gen = [], wz = null) => ({ titel, gen, wz });

const LISTE = {
  /* ---------- Unterstufe ---------- */
  natzahlen: [t("Stellenwerttafel und große Zahlen"), t("Zahlenstrahl"), t("Runden und Überschlagen"), t("Teiler und Vielfache")],
  rechnen: [t("Schriftlich addieren und subtrahieren"), t("Schriftlich multiplizieren"), t("Schriftlich dividieren"), t("Rechengesetze und Rechenvorteile"), t("Punkt vor Strich und Klammern")],
  groessen: [t("Längen umrechnen"), t("Gewichte umrechnen"), t("Zeitspannen"), t("Geld und Kommazahlen"), t("Maßstab")],
  figuren: [t("Punkt, Strecke, Strahl, Gerade"), t("Senkrecht und parallel"), t("Koordinatensystem"), t("Achsensymmetrie"), t("Punktsymmetrie")],
  flaechen: [t("Umfang von Rechteck und Quadrat"), t("Flächeneinheiten umrechnen"), t("Flächeninhalt von Rechteck und Quadrat"), t("Zusammengesetzte Figuren")],
  ganze: [t("Negative Zahlen auf der Zahlengeraden"), t("Ordnen und Betrag"), t("Addieren und Subtrahieren"), t("Multiplizieren und Dividieren")],
  brueche: [t("Bruchteile darstellen"), t("Kürzen und Erweitern"), t("Brüche vergleichen"), t("Gemischte Zahlen"), t("Anteile berechnen")],
  bruchrechnen: [t("Brüche addieren und subtrahieren", ["bru-add"]), t("Brüche multiplizieren"), t("Durch einen Bruch dividieren", ["bru-div"]), t("Punkt vor Strich mit Brüchen", ["bru-add", "bru-div"])],
  dezimal: [t("Brüche als Dezimalzahlen"), t("Dezimalzahlen runden"), t("Addieren und Subtrahieren"), t("Multiplizieren und Dividieren"), t("Periodische Dezimalzahlen")],
  rational: [t("Rationale Zahlen ordnen"), t("Addieren und Subtrahieren", ["bru-add"]), t("Multiplizieren und Dividieren", ["bru-div"]), t("Rechengesetze", ["bru-add", "bru-div"])],
  winkelkreis: [t("Winkel messen und zeichnen", [], "winkelsaetze"), t("Winkelarten", ["geo-winkel"], "winkelsaetze"), t("Kreis und Kreisfiguren", ["geo-kreis"], "kreis"), t("Scheitel-, Neben- und Stufenwinkel", ["geo-winkel"], "winkelsaetze")],
  koerper: [t("Körper und Netze", [], "quader"), t("Oberfläche von Quader und Würfel", ["geo-quader"], "quader"), t("Volumen von Quader und Würfel", ["geo-quader"], "quader"), t("Volumeneinheiten", [], "groessen")],
  daten: [t("Häufigkeitstabellen"), t("Säulen- und Kreisdiagramm"), t("Mittelwert und Median"), t("Relative Häufigkeit")],
  teilbarkeit: [t("Teilbarkeitsregeln"), t("Primzahlen und Primfaktorzerlegung"), t("Größter gemeinsamer Teiler"), t("Kleinstes gemeinsames Vielfaches")],

  /* ---------- Mittelstufe ---------- */
  prozent: [t("Prozentwert berechnen", ["pro-wert"]), t("Prozentsatz berechnen", ["pro-wert"]), t("Grundwert berechnen", ["pro-grund"]), t("Erhöhung und Rabatt", ["pro-grund", "pro-wert"]), t("Zinsen und Zinseszins", ["wac-faktor"])],
  zuordnungen: [t("Zuordnungen erkennen"), t("Proportionale Zuordnungen", ["fkt-steigung"], "geradengleichung"), t("Antiproportionale Zuordnungen"), t("Dreisatz", ["pro-grund"])],
  linfkt: [t("Funktionen und Graphen", [], "geradengleichung"), t("Steigung und Steigungsdreieck", ["fkt-steigung"], "geradengleichung"), t("y-Achsenabschnitt", [], "geradengleichung"), t("Geradengleichung aufstellen", ["fkt-steigung"], "geradengleichung"), t("Schnittpunkt zweier Geraden", ["lgs-zwei"], "lgs")],
  termegl: [t("Terme aufstellen", [], "terme"), t("Terme vereinfachen", [], "terme"), t("Lineare Gleichungen lösen", ["gl-linear"], "gleichungen"), t("Sachaufgaben mit Gleichungen", ["gl-linear"], "gleichungen")],
  dreiecke: [t("Winkelsumme im Dreieck", ["geo-winkel"], "winkelsaetze"), t("Kongruenzsätze", ["geo-kongruenz"], "kongruenz"), t("Dreiecke konstruieren", ["geo-kongruenz"], "kongruenz"), t("Mittelsenkrechte und Winkelhalbierende", [], "konstruktion"), t("Satz des Thales", [], "thales")],
  wkt1: [t("Zufallsexperimente"), t("Laplace-Wahrscheinlichkeit", [], "kombinatorik"), t("Baumdiagramme", ["wkt-pfad"], "kombinatorik"), t("Pfadregeln", ["wkt-pfad"], "kombinatorik")],
  binom: [t("Ausmultiplizieren", ["gl-linear"], "terme"), t("Ausklammern", ["gl-ausklammern"], "terme"), t("Binomische Formeln", ["ter-binom"], "terme"), t("Faktorisieren", ["ter-binom", "gl-ausklammern"], "terme")],
  wurzeln: [t("Quadratwurzeln"), t("Irrationale Zahlen"), t("Teilweise Wurzel ziehen", ["pot-wurzel"], "terme"), t("Rechnen mit Wurzeln", ["pot-wurzel"], "terme")],
  bruchterme: [t("Definitionsmenge"), t("Bruchterme kürzen", [], "terme"), t("Hauptnenner und addieren", ["bru-add"], "terme"), t("Bruchgleichungen", ["gl-linear"], "gleichungen")],
  quad: [t("Normalparabel und Verschiebung", [], "parabeln"), t("Scheitelpunktform", ["fkt-scheitel"], "parabeln"), t("Quadratisch ergänzen", ["fkt-scheitel"], "parabeln"), t("pq- und abc-Formel", ["gl-quadrat"], "gleichungen"), t("Nullstellen und Schnittpunkte", ["gl-quadrat", "gl-ausklammern"], "parabeln")],
  lgs2: [t("Gleichsetzungsverfahren", ["lgs-zwei"], "lgs"), t("Einsetzungsverfahren", ["lgs-zwei"], "lgs"), t("Additionsverfahren", ["lgs-zwei"], "lgs"), t("Anzahl der Lösungen", [], "lgs"), t("Sachaufgaben", ["lgs-zwei"], "lgs")],
  kreis: [t("Kreisumfang", ["geo-kreis"], "kreis"), t("Kreisfläche", ["geo-kreis"], "kreis"), t("Kreisring", ["geo-kreis"], "kreis"), t("Kreisausschnitt und Kreisbogen", ["geo-sektor"], "kreis")],
  prismen: [t("Prismen erkennen", [], "koerper"), t("Oberfläche von Prismen", ["geo-prisma", "geo-quader"], "koerper"), t("Volumen von Prismen", ["geo-prisma"], "koerper"), t("Zylinder", ["geo-prisma"], "koerper")],
  potenzen: [t("Zehnerpotenzen"), t("Potenzgesetze", ["pot-gesetz"], "terme"), t("Negative Hochzahlen", ["pot-gesetz"], "terme"), t("Wurzeln als Potenzen", ["pot-wurzel"], "terme")],
  strahlen: [t("Zentrische Streckung", ["geo-strahlen"], "strahlensaetze"), t("Ähnliche Figuren", ["geo-strahlen"], "strahlensaetze"), t("Erster Strahlensatz", ["geo-strahlen"], "strahlensaetze"), t("Zweiter Strahlensatz", ["geo-strahlen"], "strahlensaetze")],
  pythagoras: [t("Satz des Pythagoras", ["geo-pythagoras"], "pythagoras"), t("Katheten berechnen", ["geo-pythagoras"], "pythagoras"), t("Kathetensatz und Höhensatz", [], "kathetensatz"), t("Anwendungen in Figuren und Körpern", ["geo-pythagoras"], "pythagoras")],
  trig: [t("Sinus, Kosinus und Tangens", ["geo-trig"], "trigonometrie"), t("Seiten berechnen", ["geo-trig"], "trigonometrie"), t("Winkel berechnen", [], "trigonometrie"), t("Sinussatz", [], "trigonometrie"), t("Kosinussatz", [], "trigonometrie"), t("Einheitskreis und Tangens", [], "trigonometrie")],
  potfkt: [t("Funktionsbegriff und Definitionsmenge"), t("Potenzfunktionen mit positiven Hochzahlen", ["pot-gesetz"], "kurvendiskussion"), t("Potenzfunktionen mit negativen Hochzahlen", ["pot-gesetz"], "kurvendiskussion"), t("Wurzelfunktionen", ["pot-wurzel"]), t("Symmetrie und Verhalten im Unendlichen", [], "kurvendiskussion")],
  explog: [t("Exponentielles Wachstum", ["wac-faktor"], "wachstum"), t("Exponentialfunktionen", [], "wachstum"), t("Logarithmus", ["pot-log"], "wachstum"), t("Exponentialgleichungen lösen", ["pot-log"], "wachstum"), t("Halbwertszeit und Verdopplungszeit", ["wac-faktor"], "wachstum")],
  wkt2: [t("Mehrstufige Baumdiagramme", ["wkt-pfad"], "kombinatorik"), t("Ziehen ohne Zurücklegen", ["wkt-pfad"], "kombinatorik"), t("Vier-Felder-Tafel", [], "vierfelder"), t("Bedingte Wahrscheinlichkeit", [], "vierfelder")],
  ganzrat: [t("Graphen verschieben und strecken", [], "kurvendiskussion"), t("Symmetrie", [], "kurvendiskussion"), t("Verhalten im Unendlichen", [], "kurvendiskussion"), t("Nullstellen", ["gl-ausklammern", "gl-quadrat"], "kurvendiskussion"), t("Gleichungen höheren Grades", ["gl-ausklammern"], "gleichungen")],
  sinfkt: [t("Einheitskreis und Bogenmaß", [], "trigonometrie"), t("Graph von Sinus und Kosinus", [], "sinus"), t("Periode", ["sin-periode"], "sinus"), t("Amplitude und Verschiebung", ["sin-periode"], "sinus")],
  diff1: [t("Mittlere Änderungsrate", ["fkt-steigung"]), t("Momentane Änderungsrate"), t("Ableitung an einer Stelle", ["abl-potenz"], "ableitungstrainer"), t("Ableitungsfunktion", ["abl-potenz"], "ableitungstrainer")],
  ablregeln: [t("Potenzregel", ["abl-potenz"], "ableitungstrainer"), t("Faktor- und Summenregel", ["abl-potenz"], "ableitungstrainer"), t("Tangentengleichung", ["abl-potenz", "fkt-steigung"], "ableitungstrainer"), t("Monotonie", [], "kurvendiskussion")],
  kugel: [t("Pyramide", ["geo-pyramide"], "koerper"), t("Kegel", ["geo-pyramide"], "koerper"), t("Kugel", ["geo-kugel"], "koerper"), t("Zusammengesetzte Körper", ["geo-prisma", "geo-pyramide", "geo-kugel"], "koerper")],
  zufallsgr: [t("Zufallsgrößen", [], "erwartungswert"), t("Wahrscheinlichkeitsverteilung", [], "erwartungswert"), t("Erwartungswert", [], "erwartungswert"), t("Faire Spiele", [], "erwartungswert")],
  vek1: [t("Punkte im Raum", [], "vektorgenerator"), t("Vektoren addieren und vervielfachen", [], "vektorgenerator"), t("Länge eines Vektors", ["vek-betrag"], "vektorgenerator"), t("Geradengleichung im Raum", [], "zweipunkte")],

  /* ---------- Kursstufe ---------- */
  ksDiff: [t("Produktregel", [], "ableitungstrainer"), t("Kettenregel", ["abl-kette", "abl-exp"], "ableitungstrainer"), t("Monotonie und Extrempunkte", ["kur-nachweis"], "kurvendiskussion"), t("Wendepunkte", ["kur-wende"], "kurvendiskussion"), t("Extremwertaufgaben", [], "optimierung"), t("Tangente und Normale", ["abl-potenz"], "ableitungstrainer")],
  ksExp: [t("e-Funktion ableiten", ["abl-exp"], "ableitungstrainer"), t("Natürlicher Logarithmus", ["pot-log"], "wachstum"), t("Exponentialgleichungen", ["pot-log"], "gleichungen"), t("Wachstumsmodelle", ["wac-faktor"], "wachstum"), t("Kurvendiskussion mit e-Funktionen", ["abl-exp"], "kurvendiskussion")],
  ksInt: [t("Stammfunktionen", [], "stammintegral"), t("Bestimmtes Integral", ["int-grenzen"], "stammintegral"), t("Hauptsatz", ["int-grenzen"], "stammintegral"), t("Fläche zwischen Graph und x-Achse", ["int-flaeche"], "integrale"), t("Fläche zwischen zwei Graphen", ["int-flaeche"], "integrale"), t("Rotationskörper", [], "integrale")],
  ksFkt: [t("Verschieben und strecken", [], "scharen"), t("Asymptoten und Polstellen", [], "kurvendiskussion"), t("Trigonometrische Funktionen", ["sin-periode"], "sinus"), t("Funktionsscharen", [], "scharen")],
  ksLgs: [t("Gauß-Verfahren", ["lgs-zwei"], "lgs"), t("Lösungsmengen", [], "lgs"), t("Funktionen aus Bedingungen bestimmen", [], "steckbrief")],
  ksGeraden: [t("Vektoren im Raum", ["vek-betrag"], "vektorgenerator"), t("Geraden", [], "zweipunkte"), t("Ebenen in Parameterform", [], "dreipunkte"), t("Koordinatenform und Normalenvektor", ["vek-ortho"], "ebenen"), t("Lagebeziehungen", [], "geraden")],
  ksAbstand: [t("Skalarprodukt und Orthogonalität", ["vek-ortho"], "winkel"), t("Abstand Punkt–Ebene", [], "abstaende"), t("Abstand Punkt–Gerade", [], "abstaende"), t("Windschiefe Geraden", [], "abstaende"), t("Schnittwinkel", ["vek-geradeebene"], "winkel")],
  ksWkt: [t("Kombinatorik", [], "kombinatorik"), t("Bedingte Wahrscheinlichkeit", ["wkt-pfad"], "vierfelder"), t("Bernoulli-Ketten", ["ber-genau"], "bernoulli"), t("Binomialverteilung", ["ber-genau", "ber-grenze"], "bernoulli"), t("Erwartungswert und Standardabweichung", [], "erwartungswert")],
  ksTest: [t("Hypothesen formulieren", [], "hypothesentest"), t("Einseitiger Test", ["ber-grenze"], "hypothesentest"), t("Zweiseitiger Test", ["ber-grenze"], "hypothesentest"), t("Fehler 1. und 2. Art", [], "hypothesentest")],
  ksNormal: [t("Stetige Zufallsgrößen", ["nv-kleiner"], "normalverteilung"), t("Gaußsche Glockenkurve", ["nv-kleiner"], "normalverteilung"), t("Sigma-Regeln", ["nv-zwischen"], "normalverteilung"), t("Wert zu einer Wahrscheinlichkeit", ["nv-quantil"], "normalverteilung"), t("Binomialverteilung annähern", ["nv-binom"], "normalverteilung")],
  ksAbi: [t("Teil A ohne Hilfsmittel", ["abl-potenz", "gl-quadrat", "ber-genau", "vek-ortho", "int-grenzen"]), t("Teil B mit Taschenrechner", ["kur-wende", "ber-grenze", "vek-geradeebene", "int-flaeche"]), t("Operatoren verstehen"), t("Probeabitur")],
};

/* Unterthemen eines Kapitels mit Id (kapitel.nummer) */
export function unterthemen(kapitelId) {
  return (LISTE[kapitelId] || []).map((u, i) => ({ id: `${kapitelId}.${i + 1}`, kapitel: kapitelId, nr: i + 1, ...u }));
}
export function unterthema(id) {
  if (!id) return null;
  const [k] = String(id).split(".");
  return unterthemen(k).find((u) => u.id === id) || null;
}
/* Alle Generatoren eines Kapitels (ohne Doppelte, in Reihenfolge der Unterthemen) */
export const kapitelGeneratoren = (kapitelId) => [...new Set(unterthemen(kapitelId).flatMap((u) => u.gen))];
export const UNTERTHEMEN_KAPITEL = Object.keys(LISTE);
