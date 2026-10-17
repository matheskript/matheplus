/* ======================================================================
   FORMELSAMMLUNG · VERZEICHNIS
   Führt alle Bereiche zusammen, berechnet die Rückverweise („Darauf baut
   auf“) und enthält die Roten Fäden – Wege quer durch die Bereiche.
   Reine Daten, keine React-Abhängigkeit (auch in Node-Tests nutzbar).
   ====================================================================== */
import { FS_ANALYSIS } from "./fsAnalysis.js";
import { FS_FUNKTIONEN } from "./fsFunktionen.js";
import { FS_VEKTOREN } from "./fsVektoren.js";
import { FS_STOCHASTIK } from "./fsStochastik.js";
import { FS_GEOMETRIE } from "./fsGeometrie.js";
import { FS_TERME } from "./fsTerme.js";
import { FS_KOPF, FS_LOGIK } from "./fsKopfLogik.js";
import { FS_ERG, FS_NEU } from "./fsErgaenzungen.js";
import { FS_ZAHLEN } from "./fsZahlen.js";
import { FS_UNTER_GEOMETRIE } from "./fsUnterGeometrie.js";
import { FS_UNTER_TERME } from "./fsUnterTerme.js";
import { FS_UNTER_DATEN } from "./fsUnterDaten.js";
import { FS_UNTER_ZUORDNUNGEN } from "./fsUnterZuordnungen.js";
import { FS_MITTEL_NEU } from "./fsMittelNeu.js";
import { FS_OBER_NEU } from "./fsOberNeu.js";

export const FS_BEREICHE = [
  { id: "analysis", name: "Analysis", zeile: "Ableiten, Integrieren, Kurvendiskussion", bild: "kurve" },
  { id: "funktionen", name: "Funktionen", zeile: "Geraden, Parabeln, Wachstum, Sinus", bild: "parabel" },
  { id: "vektoren", name: "Vektoren", zeile: "Skalarprodukt, Ebenen, Abstände", bild: "kreuz" },
  { id: "stochastik", name: "Stochastik", zeile: "Bayes, Binomialverteilung, Tests", bild: "balken" },
  { id: "geometrie", name: "Geometrie und Trigonometrie", kurz: "Geometrie", zeile: "Pythagoras, Kreis, Körper, Einheitskreis", bild: "trig" },
  { id: "terme", name: "Terme und Gleichungen", kurz: "Terme", zeile: "Binomische Formeln, pq-Formel, Logarithmen", bild: "terme" },
  { id: "zahlen", name: "Zahlen und Größen", kurz: "Zahlen", zeile: "Stellenwert, Brüche, Dezimalzahlen, Prozent, Einheiten", bild: "zahlenstrahl" },
  { id: "kopfrechnen", name: "Kopfrechnen", zeile: "Rechentricks, Teilbarkeit, Brüche", bild: "kopf" },
  { id: "logik", name: "Mengenlehre und Logik", kurz: "Logik", zeile: "Mengen, Junktoren, Beweisverfahren", bild: "menge" },
];

/* ---------------------------------------------------------------------
   STUFEN · st: "unter" | "unter-mittel" | "mittel" | "beide" | "ober" | "alle"
   ("beide" = Mittel- und Oberstufe, bleibt aus Kompatibilität gültig)
   kl: optional, Klasse der Einführung (BW-Bildungsplan Gymnasium)
   --------------------------------------------------------------------- */
export const STUFEN = ["unter", "mittel", "ober"];
export const ST_WERTE = ["unter", "unter-mittel", "mittel", "beide", "ober", "alle"];
const ST_ZU = { unter: ["unter"], "unter-mittel": ["unter", "mittel"], mittel: ["mittel"], beide: ["mittel", "ober"], ober: ["ober"], alle: ["unter", "mittel", "ober"] };
export const stufenVon = (e) => ST_ZU[e && e.st] || ["mittel"];
export const STUFEN_INFO = {
  unter: { name: "Unterstufe", klassen: "Klasse 5–7", kurz: "5–7", von: 5, bis: 7 },
  mittel: { name: "Mittelstufe", klassen: "Klasse 8–10", kurz: "8–10", von: 8, bis: 10 },
  ober: { name: "Oberstufe", klassen: "Klasse 11–13", kurz: "11–13", von: 11, bis: 13 },
};
export const istUnterstufe = (e) => stufenVon(e).includes("unter");
/* Virtueller Bereich: bündelt alle Unterstufen-Einträge aus den Themenbereichen */
export const FS_UNTERSTUFE = { id: "unterstufe", name: "Unterstufe · Klasse 5–7", kurz: "Unterstufe 5–7", zeile: "Zahlen, Brüche, Dezimalzahlen, Prozent, Größen, Winkel, Terme, Daten" };

/* Alte Kennungen von Bereichen (Deep-Links, gespeicherte Zustände) */
export const FS_BEREICH_ALIAS = { trigonometrie: "geometrie" };

/* Ergänzungen (fsErgaenzungen.js): weitere Beweise, Verknüpfungen, Beispiele – ohne die Grunddaten umzuschreiben */
const erg = (e) => {
  const z = FS_ERG[e.id];
  if (!z) return e;
  const her = [...(Array.isArray(e.her) ? e.her : e.her ? [e.her] : []), ...(z.her || [])];
  return { ...e, ...(z.bild ? { bild: z.bild } : {}), ...(z.wz && !e.wz ? { wz: z.wz } : {}), ...(z.syn ? { syn: [e.syn, z.syn].filter(Boolean).join(" ") } : {}), her, nutzt: [...(e.nutzt || []), ...(z.nutzt || [])],
    bsp: [...(e.bsp || []), ...(z.bsp || [])], ...(z.falle ? { falle: e.falle ? e.falle : z.falle } : {}) };
};
const mit = (bereich, liste) => liste.map((e) => ({ bereich, ...erg(e) }));

/* Unterstufen-Einträge stehen vor dem Bestand ihres Bereichs (Gruppenreihenfolge = Reihenfolge im Array) */
const ROH = [
  ...mit("analysis", FS_ANALYSIS),
  ...mit("funktionen", [...FS_UNTER_ZUORDNUNGEN, ...FS_FUNKTIONEN]),
  ...mit("vektoren", FS_VEKTOREN),
  ...mit("stochastik", [...FS_UNTER_DATEN, ...FS_STOCHASTIK]),
  ...mit("geometrie", [...FS_UNTER_GEOMETRIE, ...FS_GEOMETRIE]),
  ...mit("terme", [...FS_UNTER_TERME, ...FS_TERME]),
  ...mit("zahlen", FS_ZAHLEN),
  ...mit("kopfrechnen", FS_KOPF),
  ...mit("logik", FS_LOGIK),
  ...FS_NEU.map((e) => ({ ...erg(e) })),
  ...[...FS_MITTEL_NEU, ...FS_OBER_NEU].map((e) => ({ ...erg(e) })),
];
/* Einträge mit neuer Gruppe direkt hinter ihre Gruppe im selben Bereich sortieren (stabil) */
export const FS_ALLE = (() => {
  const reihe = [];
  for (const e of ROH) if (!reihe.some((r) => r[0] === e.bereich && r[1] === e.g)) reihe.push([e.bereich, e.g]);
  const rang = (e) => reihe.findIndex((r) => r[0] === e.bereich && r[1] === e.g);
  return ROH.map((e, i) => [e, i]).sort((a, b) => {
    const ba = FS_BEREICHE.findIndex((x) => x.id === a[0].bereich), bb = FS_BEREICHE.findIndex((x) => x.id === b[0].bereich);
    return ba - bb || rang(a[0]) - rang(b[0]) || a[1] - b[1];
  }).map(([e]) => e);
})();

export const FS_NACH_ID = Object.fromEntries(FS_ALLE.map((e) => [e.id, e]));

/* Rückverweise: Für jede Formel, welche anderen Formeln auf ihr aufbauen und wie. */
export const FS_DARAUF = (() => {
  const r = {};
  for (const e of FS_ALLE) {
    for (const [id, wie] of e.nutzt || []) (r[id] ||= []).push([e.id, wie]);
  }
  return r;
})();

/* Herleitungen immer als Liste */
export const herleitungen = (e) => (!e || !e.her ? [] : Array.isArray(e.her) ? e.her : [e.her]);

/* Bereich einer Formel samt Anzeigename */
export const bereichVon = (id) => FS_BEREICHE.find((b) => b.id === (FS_BEREICH_ALIAS[id] || id)) || FS_BEREICHE[0];

/* Werkzeuge, die keine Einträge in werkzeuge.js sind */
export const FS_ZUSATZ_ZIELE = {
  entdecken: { name: "Mathe entdecken", zeile: "Interaktives Lernmodul mit Beweisen zum Ausprobieren", ziel: { ansicht: "entdecken" } },
  kopf: { name: "Kopfrechnen", zeile: "Trainer für Rechentricks, Teilbarkeit und Brüche", ziel: { ansicht: "kopf" } },
};

/* Suche über Name, Kurztext, Gruppe und Formel – Name zählt am meisten */
export function fsSuche(text) {
  const s = String(text || "").trim().toLowerCase();
  if (!s) return [];
  const teile = s.split(/\s+/);
  const punkte = (e) => {
    const name = e.n.toLowerCase(), syn = (e.syn || "").toLowerCase(), rest = `${e.k} ${e.g} ${e.f}`.toLowerCase();
    let p = 0;
    for (const t of teile) {
      if (name.startsWith(t)) p += 6;
      else if (name.includes(t)) p += 4;
      else if (syn.split(/\s+/).some((w) => w.startsWith(t))) p += 4;
      else if (rest.includes(t)) p += 1;
      else return 0;
    }
    return p;
  };
  return FS_ALLE.map((e) => [e, punkte(e)]).filter(([, p]) => p > 0).sort((a, b) => b[1] - a[1]).map(([e]) => e);
}

/* ---------------------------------------------------------------------
   ROTE FÄDEN · Wege quer durch die Formelsammlung.
   Jede Station: [Formel-id, wie es von hier zur nächsten Station geht].
   --------------------------------------------------------------------- */
export const FS_FAEDEN = [
  {
    id: "pythagoras-skalar", titel: "Vom Pythagoras zum Skalarprodukt",
    text: "Ein rechter Winkel, vier Bereiche: Wie aus einem Satz über Quadrate die Winkelformel für Vektoren wird.",
    stationen: [
      ["pythagoras", "Im Koordinatensystem wird der Abstand zweier Punkte zur Hypotenuse."],
      ["abstand-punkte", "Im Raum zweimal angewandt ergibt sich die Länge eines Vektors."],
      ["betrag", "Ist der Winkel nicht 90°, braucht der Pythagoras einen Korrekturterm."],
      ["kosinussatz", "Der Kosinussatz im Dreieck aus a, b und a − b liefert das Skalarprodukt."],
      ["skalarprodukt", "Nach cos φ umgestellt entsteht die Winkelformel."],
      ["vektorwinkel", "Bei 90° wird der Kosinus null – und damit das Skalarprodukt."],
      ["orthogonal", null],
    ],
  },
  {
    id: "sekante-flaeche", titel: "Von der Sekante zur Fläche",
    text: "Die ganze Analysis in sieben Schritten: Steigung, Grenzwert, Ableitung – und rückwärts zur Fläche.",
    stationen: [
      ["steigung", "Zwei Punkte auf einem Graphen statt auf einer Geraden: der Differenzenquotient."],
      ["diffquot", "Der zweite Punkt rückt immer näher – der Grenzwert ist die Tangentensteigung."],
      ["ableitung", "Mit der Steigung im Punkt entsteht die Tangentengleichung."],
      ["tangente", "Rückwärts gefragt: Welche Funktion hat f als Ableitung?"],
      ["stammfkt", "Die Flächenfunktion wächst mit der Rate f – sie ist eine Stammfunktion."],
      ["hauptsatz", "Mit dem Hauptsatz werden Flächen zu einer einfachen Differenz."],
      ["flaeche-zwischen", null],
    ],
  },
  {
    id: "binomisch-ueberall", titel: "Die binomischen Formeln sind überall",
    text: "Ein Quadrat aus vier Teilen taucht in Gleichungen, Parabeln, Ableitungen und Wahrscheinlichkeiten wieder auf.",
    stationen: [
      ["binom1", "Rückwärts gelesen ergänzt man zum vollständigen Quadrat."],
      ["quadergaenzung", "Damit sieht man jeder Parabel ihren Scheitel an."],
      ["scheitelform", "Allgemein durchgeführt entsteht die Lösungsformel für jede quadratische Gleichung."],
      ["mitternacht", "Für (a + b)ⁿ braucht man die Koeffizienten des Pascalschen Dreiecks."],
      ["binomkoeff", "Diese zählen die Pfade mit k Treffern – das Herz der Bernoulli-Formel."],
      ["bernoulli", "Und mit (x + h)ⁿ beweist man die Potenzregel."],
      ["abl-potenz", null],
    ],
  },
  {
    id: "e-wachstum", titel: "Potenzen, Logarithmen und e",
    text: "Wie aus dem Zählen von Faktoren Logarithmen, die Zahl e und alle Wachstumsmodelle werden.",
    stationen: [
      ["potenzgesetze", "Fragt man nach dem Exponenten, entsteht der Logarithmus."],
      ["logdef", "Die Potenzgesetze übersetzen sich in Logarithmengesetze."],
      ["logpot", "Damit holt man den Exponenten aus jeder Exponentialgleichung."],
      ["expgl", "Unter allen Basen gibt es genau eine, deren Funktion ihre eigene Ableitung ist."],
      ["abl-exp", "Mit e beschreibt man jedes exponentielle Wachstum."],
      ["wachstum-exp", "Aus e^{kT} = 2 folgt die Verdopplungszeit."],
      ["verdopplung", "Zerfällt nur der Abstand zur Schranke, entsteht begrenztes Wachstum."],
      ["wachstum-begrenzt", null],
    ],
  },
  {
    id: "einheitskreis", titel: "Einmal rund um den Einheitskreis",
    text: "Ein Zeiger der Länge 1 erklärt Sinus, Kosinus, ihre Werte, ihre Symmetrien und ihre Ableitungen.",
    stationen: [
      ["sinus", "Mit Hypotenuse 1 werden Sinus und Kosinus zu Koordinaten auf dem Kreis."],
      ["einheitskreis", "Pythagoras im Einheitskreis."],
      ["trig-pythagoras", "Winkel misst man als Weglänge auf dem Kreis."],
      ["bogenmass", "Nach einer vollen Umdrehung wiederholt sich alles."],
      ["periode", "Die Geschwindigkeit des umlaufenden Punktes liefert die Ableitung."],
      ["abl-sin", "Mit Streckungen und Verschiebungen passt sich der Sinus an jede Schwingung an."],
      ["sinusfkt", null],
    ],
  },
  {
    id: "zaehlen-testen", titel: "Vom Zählen zum Hypothesentest",
    text: "Kombinatorik, Wahrscheinlichkeit und Statistik bauen direkt aufeinander auf.",
    stationen: [
      ["fakultaet", "Lässt man die Reihenfolge weg, teilt man durch k!."],
      ["binomkoeff", "Günstige durch mögliche Fälle."],
      ["laplace", "Bei mehrstufigen Experimenten multipliziert man entlang der Pfade."],
      ["pfadregeln", "Pfadregel mal Anzahl der Pfade."],
      ["bernoulli", "Der Schwerpunkt der Verteilung ist n · p."],
      ["binom-ew", "Rund um μ liegen feste Anteile innerhalb von σ, 2σ, 3σ."],
      ["sigmaregeln", "Was unter H₀ sehr unwahrscheinlich ist, bildet den Ablehnungsbereich."],
      ["hypotest", null],
    ],
  },
  {
    id: "baum-tafel", titel: "Baum, Tafel und Bayes",
    text: "Dieselben vier Wahrscheinlichkeiten – einmal als Baum, einmal als Tafel, einmal umgedreht.",
    stationen: [
      ["pfadregeln", "Ab der zweiten Stufe stehen an den Ästen bedingte Wahrscheinlichkeiten."],
      ["bedingt", "Die vier Pfadenden sind die vier Felder der Tafel."],
      ["vierfelder", "Die Spaltensumme ist die totale Wahrscheinlichkeit."],
      ["totale", "Damit lässt sich die Bedingung umdrehen."],
      ["bayes", "Ändert die Bedingung nichts, sind die Ereignisse unabhängig."],
      ["unabh", null],
    ],
  },
  {
    id: "senkrecht", titel: "Was »senkrecht« in jedem Bereich bedeutet",
    text: "Vom Steigungsdreieck bis zur Hesseschen Normalform: ein rechter Winkel, viele Formeln.",
    stationen: [
      ["orthogeraden", "Mit Richtungsvektoren geschrieben ist m₁m₂ = −1 ein Skalarprodukt."],
      ["orthogonal", "Ein Vektor, der auf allen Vektoren einer Ebene senkrecht steht, beschreibt sie."],
      ["ebene-normal", "Ausmultipliziert entsteht die Koordinatenform."],
      ["koordform", "Den Normalenvektor aus zwei Spannvektoren liefert das Kreuzprodukt."],
      ["kreuzprodukt", "Normiert man n, misst die Ebenengleichung Abstände."],
      ["hnf", "Punkt einsetzen – fertig."],
      ["abstand-pe", null],
    ],
  },
  {
    id: "extremwerte", titel: "Ableitungen finden das Beste",
    text: "Von der Steigung zum Optimum: wie Kurvendiskussion zu Anwendungen wird.",
    stationen: [
      ["ableitung", "Das Vorzeichen der Ableitung verrät Steigen und Fallen."],
      ["monotonie", "Wechselt es, liegt ein Hoch- oder Tiefpunkt vor."],
      ["extrem", "Dieselbe Idee eine Ableitung höher findet Wendepunkte."],
      ["wende", "Eigenschaften werden zu Gleichungen – so rekonstruiert man Funktionen."],
      ["steckbrief", "Oder man sucht das Maximum einer Zielfunktion."],
      ["optimierung", null],
    ],
  },
  {
    id: "flaeche-volumen", titel: "Vom Rechteck zur Kugel",
    text: "Alle Flächen und Volumen gehen auf Länge mal Breite zurück – mit Zerlegen, Umlegen und Integrieren.",
    stationen: [
      ["rechteck", "Ein Dreieck ist ein halbes Rechteck."],
      ["dreieck-flaeche", "Tortenstücke eines Kreises werden zu einem fast-Rechteck."],
      ["kreisflaeche", "Gestapelte Kreise ergeben einen Zylinder."],
      ["zylinder", "Drei Pyramiden füllen ein Prisma."],
      ["pyramide", "Mit runder Grundfläche: der Kegel."],
      ["kegel", "Zylinder minus Kegel ist eine Halbkugel."],
      ["kugel", "Allgemein: Scheiben aufsummieren mit dem Integral."],
      ["rotation", null],
    ],
  },
  {
    id: "beweisen", titel: "Wie Mathematiker beweisen",
    text: "Implikation, Kontraposition, Widerspruch und Induktion – mit klassischen Beispielen.",
    stationen: [
      ["implikation", "Eine Implikation ist gleichwertig zu ihrer Kontraposition."],
      ["kontraposition", "Damit zeigt man: Ist p² gerade, so ist p gerade – der Schlüssel für √2."],
      ["widerspruch", "Für Aussagen über alle natürlichen Zahlen gibt es ein eigenes Verfahren."],
      ["induktion", "Das klassische Beispiel – das man auch ohne Induktion sieht."],
      ["gauss-summe", null],
    ],
  },
];
