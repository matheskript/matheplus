/* ======================================================================
   KAPITEL-FORMELN – Formelauswahl zu einem Buchkapitel (Quickfinder)
   Für jedes Kapitel aus schulbuch.js (THEMEN):
     vorwissen: [kapitelId, [formelIds]] – was man aus früheren Kapiteln
                braucht, in der Reihenfolge, in der es zum Kapitel hinführt.
                Die Klasse wird aus dem Plan der gewählten Schulart bestimmt.
     kern:      [überschrift, [formelIds]] – die Formeln des Kapitels selbst.
     weg:       optional ein Satz, der den Roten Faden des Kapitels erzählt.
   Nur Kennungen aus der Formelsammlung (fsIndex.js); Test: tests/kapitelFormeln.test.mjs.
   Reine Daten, keine React-Importe.
   ====================================================================== */
import { PLAN, THEMEN, klassenBoxen } from "./schulbuch.js";

export const KAPITEL_FORMELN = {
  /* ---------- Unterstufe ---------- */
  natzahlen: {
    vorwissen: [],
    kern: [["Große Zahlen lesen und runden", ["stellenwert", "zehnerpotenzen", "runden", "ueberschlag"]], ["Teiler und Primzahlen", ["teil2510", "teil39", "primzahl"]]],
  },
  rechnen: {
    vorwissen: [["natzahlen", ["stellenwert", "runden", "ueberschlag"]]],
    kern: [["Rechenregeln", ["rechenreihenfolge", "kommutativ", "assoziativ", "distributiv"]], ["Geschickt rechnen", ["mal5", "mal25", "mal11", "mal9", "nahe100"]], ["Potenzen", ["potenz-def", "quadratzahlen"]]],
  },
  groessen: {
    vorwissen: [["natzahlen", ["zehnerpotenzen", "runden"]]],
    kern: [["Einheiten umrechnen", ["laengen", "masse", "zeit", "flaechen-einheiten"]], ["Maßstab", ["massstab"]]],
  },
  figuren: {
    vorwissen: [],
    kern: [["Grundbegriffe", ["geraden-lage", "koordinaten", "abstand-2d", "kreis-begriffe"]], ["Symmetrie", ["achsensymmetrie", "punktsymmetrie"]]],
  },
  flaechen: {
    vorwissen: [["groessen", ["laengen", "flaechen-einheiten"]]],
    kern: [["Umfang", ["umfang-rechteck"]], ["Flächeninhalt", ["rechteck", "quadrat", "zusammengesetzt"]]],
  },
  ganze: {
    vorwissen: [["rechnen", ["rechenreihenfolge", "distributiv"]]],
    kern: [["Negative Zahlen", ["negative-zahlen", "gegenzahl"]], ["Rechnen mit Vorzeichen", ["vorzeichen-add", "vorzeichen-mult", "minusklammer"]]],
  },
  brueche: {
    vorwissen: [["natzahlen", ["teil2510", "teil39", "primzahl"]]],
    kern: [["Was ein Bruch bedeutet", ["bruch-def", "anteil-von", "gemischt"]], ["Kürzen, erweitern, vergleichen", ["ggt", "kgv", "bruch-kuerzen", "bruch-erweitern", "bruch-vergleich"]]],
  },
  bruchrechnen: {
    vorwissen: [["brueche", ["kgv", "bruch-kuerzen", "bruch-erweitern", "gemischt"]]],
    kern: [["Die vier Grundrechenarten", ["bruch-add", "bruch-mul", "kehrwert", "bruch-div"]]],
  },
  dezimal: {
    vorwissen: [["brueche", ["bruch-def", "bruch-erweitern"]]],
    kern: [["Dezimalzahlen verstehen", ["dezimal-stellenwert", "bruch-dezimal", "periodisch", "dezimal-runden"]], ["Rechnen mit Dezimalzahlen", ["komma-verschieben", "dezimal-mult", "dezimal-div"]]],
  },
  rational: {
    vorwissen: [["ganze", ["vorzeichen-add", "vorzeichen-mult"]], ["bruchrechnen", ["bruch-add", "bruch-mul", "bruch-div"]]],
    kern: [["Rationale Zahlen", ["negative-zahlen", "gegenzahl", "minusklammer", "rechenreihenfolge"]]],
  },
  winkelkreis: {
    vorwissen: [["figuren", ["geraden-lage", "kreis-begriffe"]]],
    kern: [["Winkel", ["winkel-arten"]]],
  },
  koerper: {
    vorwissen: [["flaechen", ["rechteck", "quadrat"]], ["groessen", ["laengen"]]],
    kern: [["Quader und Würfel", ["quader", "quader-oberflaeche", "wuerfel"]], ["Rauminhalt messen", ["volumen-einheiten"]]],
  },
  daten: {
    vorwissen: [["brueche", ["anteil-von"]]],
    kern: [["Kenngrößen", ["arith-mittel", "median", "modus", "spannweite"]], ["Darstellen", ["relhaeuf", "kreisdiagramm"]]],
  },
  teilbarkeit: {
    vorwissen: [["natzahlen", ["stellenwert"]]],
    kern: [["Teilbarkeitsregeln", ["teil2510", "teil39", "teil48", "teil6", "teil11"]], ["Primzahlen", ["primzahl", "primfaktor", "teiler"]], ["ggT und kgV", ["ggt", "kgv", "ggt-kgv"]]],
  },

  /* ---------- Mittelstufe ---------- */
  prozent: {
    vorwissen: [["brueche", ["anteil-von"]], ["dezimal", ["bruch-dezimal"]]],
    kern: [["Prozentrechnung", ["prozent", "prozent-grundgleichung", "prozent-drei", "prozentpunkte", "promille"]], ["Mehr und weniger", ["wachstumsfaktor"]], ["Zinsen", ["zins-einfach"]]],
  },
  zuordnungen: {
    vorwissen: [["figuren", ["koordinaten"]], ["bruchrechnen", ["bruch-mul"]]],
    kern: [["Zuordnungen", ["zuordnung-tabelle", "proportional", "antiproportional"]], ["Dreisatz", ["dreisatz"]]],
  },
  linfkt: {
    vorwissen: [["figuren", ["koordinaten"]], ["zuordnungen", ["zuordnung-tabelle", "proportional"]]],
    kern: [["Geradengleichung", ["geradengl", "steigung", "punktsteigung"]], ["Lage von Geraden", ["orthogeraden", "schnittpunkt", "mittelpunkt-2d"]]],
  },
  termegl: {
    vorwissen: [["rechnen", ["rechenreihenfolge", "distributiv"]], ["rational", ["minusklammer", "vorzeichen-mult"]]],
    kern: [["Terme", ["variable", "zusammenfassen", "ausmultiplizieren", "ausklammern", "klammer-mal-klammer"]], ["Gleichungen", ["lineargl", "aequivalenzumformung", "probe"]]],
  },
  dreiecke: {
    vorwissen: [["winkelkreis", ["winkel-arten"]], ["figuren", ["geraden-lage"]]],
    kern: [["Winkelsätze", ["scheitelwinkel", "stufenwinkel", "winkelsumme", "aussenwinkel", "winkelsumme-viereck"]], ["Besondere Dreiecke und Kongruenz", ["gleichschenklig", "gleichseitig", "kongruenz", "dreiecksungleichung"]], ["Besondere Linien", ["mittelsenkrechte", "winkelhalbierende", "hoehe-dreieck"]]],
  },
  wkt1: {
    vorwissen: [["daten", ["relhaeuf"]], ["bruchrechnen", ["bruch-add", "bruch-mul"]]],
    kern: [["Wahrscheinlichkeit", ["laplace", "gegenereignis", "additionssatz"]], ["Mehrstufige Experimente", ["pfadregeln"]]],
  },
  binom: {
    vorwissen: [["termegl", ["ausmultiplizieren", "klammer-mal-klammer", "ausklammern"]], ["flaechen", ["rechteck"]]],
    kern: [["Binomische Formeln", ["binom1", "binom2", "binom3"]]],
  },
  wurzeln: {
    vorwissen: [["rechnen", ["potenz-def", "quadratzahlen"]]],
    kern: [["Quadratwurzeln", ["wurzel-def", "wurzelgesetze", "teilweise-wurzel"]], ["Reelle Zahlen", ["zahlbereiche"]]],
  },
  bruchterme: {
    vorwissen: [["bruchrechnen", ["bruch-kuerzen", "bruch-add", "bruch-mul", "bruch-div"]], ["binom", ["binom3"]], ["termegl", ["ausklammern", "aequivalenzumformung"]]],
    kern: [["Bruchgleichungen", ["bruchgleichung", "probe"]]],
  },
  quad: {
    vorwissen: [["binom", ["binom1", "binom2"]], ["linfkt", ["geradengl", "schnittpunkt"]]],
    weg: "Mit den binomischen Formeln wird aus der Normalform die Scheitelform – und daraus die Lösungsformel für jede quadratische Gleichung.",
    kern: [["Parabeln", ["parabel-normal", "scheitelform", "quadergaenzung", "scheitel-xs", "linearfaktor"]], ["Quadratische Gleichungen", ["nullprodukt", "pq", "mitternacht", "diskriminante", "vieta"]], ["Parabel und Gerade", ["gerade-parabel"]]],
  },
  lgs2: {
    vorwissen: [["linfkt", ["geradengl", "schnittpunkt"]], ["termegl", ["aequivalenzumformung"]]],
    kern: [["Lösungsverfahren", ["lgs-einsetzen", "lgs-gleichsetzen", "lgs-addition"]], ["Lösbarkeit", ["lgs-loesbar"]]],
  },
  kreis: {
    vorwissen: [["winkelkreis", ["winkel-arten"]], ["figuren", ["kreis-begriffe"]]],
    kern: [["Kreis", ["kreisumfang", "kreisflaeche"]], ["Kreisteile", ["kreissektor", "kreisring"]]],
  },
  prismen: {
    vorwissen: [["koerper", ["quader", "quader-oberflaeche"]], ["kreis", ["kreisumfang", "kreisflaeche"]]],
    kern: [["Grundflächen", ["dreieck-flaeche", "parallelogramm-ebene", "trapez", "drachen-raute", "vierecke"]], ["Prisma und Zylinder", ["prisma", "zylinder"]]],
  },
  potenzen: {
    vorwissen: [["rechnen", ["potenz-def"]], ["natzahlen", ["zehnerpotenzen"]], ["wurzeln", ["wurzel-def"]]],
    kern: [["Potenzgesetze", ["potenzgesetze", "potenz-pot", "potenzneg"]], ["Wurzeln als Potenzen", ["wurzelpot"]], ["Große und kleine Zahlen", ["wissenschaftlich"]]],
  },
  strahlen: {
    vorwissen: [["dreiecke", ["winkelsumme", "stufenwinkel", "kongruenz"]]],
    kern: [["Ähnlichkeit", ["zentrische-streckung", "aehnlich"]], ["Strahlensätze", ["strahlensatz1", "strahlensatz2"]]],
  },
  pythagoras: {
    vorwissen: [["wurzeln", ["wurzel-def", "teilweise-wurzel"]], ["binom", ["binom1"]], ["strahlen", ["aehnlich"]]],
    kern: [["Satzgruppe des Pythagoras", ["pythagoras", "kathetensatz", "hoehensatz"]], ["Rechte Winkel erkennen", ["pythagoras-umkehr", "thales"]], ["Anwendungen", ["abstand-punkte", "raumdiagonale"]]],
  },
  potfkt: {
    vorwissen: [["potenzen", ["potenzgesetze", "potenzneg", "wurzelpot"]], ["quad", ["parabel-normal", "scheitelform"]]],
    kern: [["Potenzfunktionen", ["potenzfkt", "symmetrie", "wurzelfkt"]], ["Graphen verändern", ["transform"]], ["Funktionsbegriff", ["intervalle"]]],
  },
  explog: {
    vorwissen: [["prozent", ["wachstumsfaktor"]], ["potenzen", ["potenzgesetze", "potenzneg"]]],
    weg: "Aus dem Wachstumsfaktor der Prozentrechnung wird eine Potenz – fragt man nach dem Exponenten, braucht man den Logarithmus.",
    kern: [["Wachstum", ["wachstum-lin", "zins", "expfkt"]], ["Logarithmus", ["logdef", "loggesetze", "logpot"]], ["Exponentialgleichungen", ["expgl"]]],
  },
  trig: {
    vorwissen: [["pythagoras", ["pythagoras"]], ["strahlen", ["aehnlich"]]],
    kern: [["Im rechtwinkligen Dreieck", ["sinus", "kosinus", "tangens", "steigungswinkel"]], ["In jedem Dreieck", ["sinussatz", "kosinussatz", "dreieck-trig"]]],
  },
  wkt2: {
    vorwissen: [["wkt1", ["laplace", "gegenereignis", "pfadregeln"]]],
    kern: [["Baum und Tafel", ["vierfelder", "bedingt"]], ["Mindestens einmal", ["mindestens"]], ["Zählen", ["fakultaet", "komb-mm", "komb-mo", "binomkoeff"]]],
  },
  ganzrat: {
    vorwissen: [["potfkt", ["potenzfkt", "symmetrie", "transform"]], ["quad", ["nullprodukt", "pq", "linearfaktor"]]],
    kern: [["Eigenschaften", ["grenzverhalten", "nullstellen"]], ["Gleichungen höheren Grades", ["polydiv", "substitution"]]],
  },
  sinfkt: {
    vorwissen: [["trig", ["sinus", "kosinus"]], ["kreis", ["kreisumfang"]], ["potfkt", ["transform"]]],
    weg: "Am Einheitskreis werden Sinus und Kosinus zu Koordinaten – läuft der Punkt immer weiter, entsteht die Sinuskurve.",
    kern: [["Einheitskreis", ["einheitskreis", "trig-pythagoras", "bogenmass", "standardwerte", "kosinuswerte"]], ["Beziehungen", ["symmetrien", "komplement", "verschiebung"]], ["Sinusfunktion", ["periode", "sinusfkt"]]],
  },
  diff1: {
    vorwissen: [["linfkt", ["steigung", "punktsteigung"]]],
    weg: "Die Steigung zwischen zwei Punkten kennst du – rücken die Punkte zusammen, wird daraus die Steigung in einem Punkt.",
    kern: [["Änderungsraten", ["diffquot", "ableitung", "hmethode"]], ["Tangente", ["tangente"]]],
  },
  ablregeln: {
    vorwissen: [["diff1", ["ableitung", "tangente"]], ["potenzen", ["potenzneg", "wurzelpot"]]],
    kern: [["Grundableitungen", ["abl-konst", "abl-id", "abl-potenz", "abl-kehrwert", "abl-wurzel"]], ["Ableitungsregeln", ["faktorregel", "summenregel", "differenzregel"]], ["Vorher umschreiben", ["bruch-pot", "wurzel-pot"]], ["Tangente und Normale", ["normale"]]],
  },
  kugel: {
    vorwissen: [["prismen", ["zylinder"]], ["pythagoras", ["pythagoras"]], ["kreis", ["kreisflaeche"]]],
    kern: [["Spitze Körper", ["pyramide", "kegel"]], ["Kugel", ["kugel"]], ["Zusammengesetzte Körper", ["zusammengesetzte-koerper"]]],
  },
  zufallsgr: {
    vorwissen: [["wkt1", ["laplace", "pfadregeln"]], ["daten", ["arith-mittel"]]],
    kern: [["Erwartungswert", ["erwartungswert", "fair"]], ["Streuung", ["varianz", "sigma"]]],
  },
  vek1: {
    vorwissen: [["pythagoras", ["abstand-punkte", "raumdiagonale"]], ["linfkt", ["mittelpunkt-2d"]]],
    kern: [["Vektoren", ["verbindungsvektor", "vektoraddition", "betrag", "mittelpunkt", "kollinear"]], ["Geraden im Raum", ["gerade-raum", "punktprobe", "lage-geraden"]]],
  },

  /* ---------- Kursstufe ---------- */
  ksDiff: {
    vorwissen: [["ablregeln", ["abl-potenz", "faktorregel", "summenregel", "tangente"]], ["ganzrat", ["nullstellen", "grenzverhalten"]]],
    weg: "Mit Ketten- und Produktregel lässt sich jede Funktion ableiten – und die Ableitungen verraten Hoch-, Tief- und Wendepunkte.",
    kern: [["Ableitungsregeln", ["produktregel", "kettenregel", "quotientenregel", "differenzierbar"]], ["Kurvendiskussion", ["monotonie", "extrem", "wende", "kruemmung", "sattel", "wendetangente"]], ["Anwendungen", ["optimierung", "steckbrief", "schnittwinkel"]]],
  },
  ksExp: {
    vorwissen: [["explog", ["expfkt", "logdef", "loggesetze", "expgl"]], ["ksDiff", ["kettenregel", "produktregel"]]],
    kern: [["e-Funktion und ln", ["abl-exp", "abl-ln", "logfkt", "abl-ax"]], ["Umkehrfunktion", ["umkehrfkt", "umkehrregel"]], ["Wachstumsmodelle", ["wachstum-exp", "verdopplung", "wachstum-begrenzt", "logistisch"]]],
  },
  ksInt: {
    vorwissen: [["ablregeln", ["abl-potenz", "faktorregel", "summenregel"]], ["ksDiff", ["kettenregel"]], ["ksExp", ["abl-exp", "abl-ln"]]],
    weg: "Integrieren ist Ableiten rückwärts – und mit dem Hauptsatz wird jede Fläche zu einer einfachen Differenz.",
    kern: [["Stammfunktionen", ["stammfkt", "potenz-rueck", "stamm-tabelle", "linsubst", "integralregeln"]], ["Das Integral", ["riemann", "hauptsatz", "integral-sym", "integralfkt"]], ["Flächen und Anwendungen", ["flaeche-betrag", "flaeche-zwischen", "bestand", "mittelwert", "rotation", "uneigentlich"]]],
  },
  ksFkt: {
    vorwissen: [["quad", ["scheitelform"]], ["potfkt", ["potenzfkt", "symmetrie"]], ["sinfkt", ["einheitskreis", "bogenmass", "periode"]], ["explog", ["expfkt"]], ["ksDiff", ["kettenregel", "extrem", "wende"]]],
    weg: "Von der verschobenen Parabel zur allgemeinen Sinusfunktion: Eine einzige Regel für Verschieben und Strecken, das Verhalten an den Rändern und Funktionen mit Parameter.",
    kern: [["Verschieben, Strecken, Spiegeln", ["transform", "betragsfkt"]], ["Verhalten im Unendlichen und Asymptoten", ["grenzverhalten", "asymptote"]], ["Trigonometrische Funktionen", ["sinusfkt", "verschiebung", "abl-sin", "abl-cos"]], ["Funktionenscharen", ["funktionenschar", "ortskurve"]]],
  },
  ksLgs: {
    vorwissen: [["lgs2", ["lgs-einsetzen", "lgs-addition"]], ["ksDiff", ["steckbrief"]]],
    kern: [["Gauß-Verfahren", ["gauss", "lgs-loesbar"]]],
  },
  ksGeraden: {
    vorwissen: [["vek1", ["verbindungsvektor", "vektoraddition", "betrag", "gerade-raum"]], ["ksLgs", ["gauss"]]],
    kern: [["Vektoren", ["einheitsvektor", "linearkombination", "kollinear", "komplanar", "schwerpunkt"]], ["Skalar- und Kreuzprodukt", ["skalarprodukt", "orthogonal", "vektorwinkel", "kreuzprodukt"]], ["Geraden", ["punktprobe", "lage-geraden"]], ["Ebenen", ["ebene-param", "ebene-normal", "koordform", "param-koord", "spurpunkte"]], ["Schnitte", ["schnitt-ge", "schnittgerade"]]],
  },
  ksAbstand: {
    vorwissen: [["ksGeraden", ["skalarprodukt", "vektorwinkel", "kreuzprodukt", "ebene-normal", "koordform"]]],
    kern: [["Abstände", ["hnf", "abstand-pe", "abstand-pg", "abstand-ws", "spiegelung"]], ["Schnittwinkel", ["winkel-gg", "winkel-ge", "winkel-ee"]], ["Flächen und Volumen", ["parallelogramm", "dreieck-vek", "spat"]]],
  },
  ksWkt: {
    vorwissen: [["wkt2", ["vierfelder", "bedingt", "binomkoeff"]], ["zufallsgr", ["erwartungswert", "sigma"]]],
    kern: [["Zählen", ["komb-om", "hypergeom"]], ["Bedingte Wahrscheinlichkeit", ["totale", "bayes", "unabh"]], ["Binomialverteilung", ["bernoulli", "binom-ew", "kumuliert", "mindestens-n", "ew-linear"]]],
  },
  ksTest: {
    vorwissen: [["ksWkt", ["bernoulli", "kumuliert", "binom-ew"]]],
    kern: [["Hypothesentest", ["hypotest", "hypotest-seiten", "fehlerarten"]], ["Sigma-Regeln", ["sigmaregeln"]]],
  },
  ksNormal: {
    vorwissen: [["ksWkt", ["binom-ew"]], ["zufallsgr", ["sigma"]], ["ksInt", ["hauptsatz"]]],
    kern: [["Normalverteilung", ["normalverteilung", "normal-standard", "normal-sigma"]], ["Näherung", ["binomial-normal"]]],
  },
  ksAbi: {
    vorwissen: [],
    kern: [["Analysis", ["kettenregel", "produktregel", "extrem", "wende", "hauptsatz", "flaeche-zwischen"]], ["Geometrie", ["skalarprodukt", "koordform", "hnf", "abstand-pe"]], ["Stochastik", ["pfadregeln", "bernoulli", "binom-ew", "hypotest"]]],
  },
};

/* Klasse, in der ein Kapitel im Plan der Schulart steht, z. B. "Klasse 9" oder "Klasse 5/6" */
export function klasseVonKapitel(schulart, kapitelId) {
  const plan = PLAN[schulart] || PLAN.g9;
  for (const b of klassenBoxen(schulart)) if ((plan[b.id] || []).includes(kapitelId)) return { box: b.id, label: b.label, rang: b.klassen[0] };
  return null;
}

/* Die fertige Auswahl: Abschnitte mit Überschrift, Herkunft und Formel-Ids.
   Vorwissen wird nach Klasse sortiert (ältestes zuerst), Formeln erscheinen nur einmal. */
export function kapitelAuswahl(kapitelId, schulart = "g9") {
  const d = KAPITEL_FORMELN[kapitelId];
  const t = THEMEN[kapitelId];
  if (!d || !t) return null;
  const gesehen = new Set();
  const nur = (ids) => ids.filter((id) => !gesehen.has(id) && gesehen.add(id));
  const eigene = klasseVonKapitel(schulart, kapitelId);
  const vorwissen = d.vorwissen
    .map(([aus, ids], i) => ({ aus, ids, i, k: klasseVonKapitel(schulart, aus) }))
    .sort((a, b) => (a.k ? a.k.rang : 0) - (b.k ? b.k.rang : 0) || a.i - b.i)
    .map(({ aus, ids, k }) => ({
      art: "vorwissen", titel: THEMEN[aus] ? THEMEN[aus].titel : aus, aus,
      herkunft: k ? (eigene && k.box === eigene.box ? "Früher in diesem Schuljahr" : `Klasse ${k.label}`) : "Früher im Unterricht",
      ids: nur(ids),
    }))
    .filter((a) => a.ids.length);
  const kern = d.kern.map(([titel, ids]) => ({ art: "kern", titel, ids: nur(ids) })).filter((a) => a.ids.length);
  return { kapitelId, titel: t.titel, zeile: t.zeile, weg: d.weg || null, klasse: eigene, vorwissen, kern };
}
