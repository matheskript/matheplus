/* ============================================================
   BEREICHE IM BAND – welche Werkzeuge im Werkzeug-Band nebeneinander stehen
   Das Band unter der Kopfleiste (WerkzeugBand in funcWerkzeuge.jsx) zeigt
   links die Werkzeuge des aktuellen Bereichs als Reiter (aktiver mit Goldstrich)
   und rechts den Bereichs-Umschalter. Seit 21.10. gehört jedes Werkzeug zu
   einem Bereich – es gibt keinen Seitenkopf mit Stations-Pille mehr.
   (Die Exporte heißen aus historischen Gründen weiter KURSE/kurs/…)

   Ein Kurs = Eintrag in KURSE (Werkzeug-IDs aus werkzeuge.js).
   „Deine Kurse“ im Umschalter (meineKurse):
     1. selbst gewählt – im Lernstand unter training.kurse (Konto-Abgleich wie Mein Mathe-Training)
     2. sonst aus Mein Mathe-Training: Kurse, deren Gebiet (gruppe) ein Thema in Arbeit/danach hat
     3. sonst alle Kurse
   Nur der zuletzt benutzte Kurs liegt pro Gerät im Browser (SPEICHER).
   Reine Logik, ohne React – testbar mit Node.
   ============================================================ */
import { WERKZEUGE, ansichtenVon, werkzeug } from "./werkzeuge.js";

export const KURSE = [
  /* Jedes der 60 Werkzeuge gehört zu mindestens einem Bereich – seit 21.10. hat jedes Werkzeug das Band (ein Kopf für alle).
     Im Band heißen diese Gruppen „Bereiche“ (Panel: „Deine Bereiche“); „Kurs“ ist nur noch das, was eine Lack-Kachel hat.
     gruppen = Gebiete aus Mein Mathe-Training, bei denen dieser Bereich unter „Deine Bereiche“ erscheint.
     „√(…)“ in namen/kurzNamen setzt das Band mit MitWurzeln (Haken + Überstrich als ein Linienzug). */
  { id: "mittel", gruppe: "Mittelstufe", gruppen: ["Bruchrechnen", "Geometrie"], titel: "Mittelstufe", stufe: "", zeile: "Geraden, Parabeln, Pythagoras, Gleichungen, Brüche und Wurzeln",
    werkzeuge: ["geradengleichung", "parabeln", "pythagoras", "gleichungen", "bruchwurzel"],
    namen: { pythagoras: "Pythagoras", gleichungen: "Gleichungen", bruchwurzel: "Brüche und √(Wurzeln)" },
    kurzNamen: { gleichungen: "Gleichungen", bruchwurzel: "Brüche und √(Wurzeln)" } },
  { id: "analysis-ober", gruppe: "Analysis", titel: "Analysis", stufe: "Oberstufe", zeile: "Ableiten, Kurven, Integrale",
    werkzeuge: ["diffq", "ableitungstrainer", "kurvendiskussion", "scharen", "steckbrief", "optimierung", "integrale"],
    namen: { diffq: "Differenzenquotient", steckbrief: "Steckbrief", optimierung: "Optimierung" }, kurzNamen: { diffq: "h-Methode" } },
  { id: "funktionen-kennen", gruppe: "Analysis", titel: "Funktionen kennen", stufe: "", zeile: "Grundlagen, Sinus, Wachstum",
    werkzeuge: ["funktionen", "sinus", "wachstum"],
    namen: { funktionen: "Grundlagen", sinus: "Sinus", wachstum: "Wachstum" } },
  /* Vektoren (seit 22.10.): das Band zeigt nicht die neun Werkzeuge, sondern die vier Gruppen aus VEK_BEREICHE
     (Rechnen · Geraden · Ebenen · Hesse-Normalenform); innerhalb einer Gruppe steht das Seitenmenü links (vekUi). */
  { id: "vektoren-ober", gruppe: "Vektoren", titel: "Vektoren", stufe: "Oberstufe", zeile: "Rechnen, Geraden, Ebenen, Hesse-Normalenform",
    werkzeuge: ["vektorgenerator", "winkel", "kreuzprodukt", "zweipunkte", "geraden", "dreipunkte", "ebenen", "ebenevsebene", "abstaende", "hesse"],
    bereiche: "vek",
    namen: { vektorgenerator: "Rechnen", kreuzprodukt: "Kreuzprodukt", winkel: "Winkel", zweipunkte: "Zwei Punkte", dreipunkte: "Drei Punkte", ebenen: "Ebenen im Raum", geraden: "Lage", ebenevsebene: "Zwei Ebenen", abstaende: "Abstände", hesse: "Hesse-Normalenform" },
    kurzNamen: { ebenen: "Ebenen", ebenevsebene: "E vs. E", hesse: "HNF" } },
  { id: "stochastik-ober", gruppe: "Stochastik", titel: "Stochastik", stufe: "Oberstufe", zeile: "Bäume, Erwartungswert, Binomial, Tests",
    werkzeuge: ["kombinatorik", "vierfelder", "erwartungswert", "bernoulli", "hypothesentest", "normalverteilung"],
    namen: { kombinatorik: "Kombinatorik", erwartungswert: "Erwartungswert" } },
  { id: "fundament", gruppe: "Grundlagen", titel: "Fundament", stufe: "", zeile: "Axiome, Zahlenräume, Mengen und Logik, Textaufgaben",
    werkzeuge: ["axiome", "zahlenraeume", "mengenlogik", "textaufgaben"],
    namen: { axiome: "Axiome", zahlenraeume: "Zahlenräume", mengenlogik: "Mengen und Logik", textaufgaben: "Textaufgaben" } },
  { id: "gleichungen", gruppe: "Grundlagen", titel: "Terme und Gleichungen", stufe: "", zeile: "Terme, Gleichungen, Ungleichungen, Bruchterme, Gleichungssysteme",
    werkzeuge: ["terme", "gleichungen", "ungleichungen", "bruchterme", "lgs"],
    namen: { terme: "Terme", gleichungen: "Gleichungen", ungleichungen: "Ungleichungen", bruchterme: "Bruchterme", lgs: "Gleichungssysteme" },
    kurzNamen: { gleichungen: "Gleichungen", lgs: "LGS" } },
  { id: "geometrie-figuren", gruppe: "Geometrie", titel: "Geometrie", stufe: "Figuren und Winkel", zeile: "Koordinaten, Flächen, Quader, Winkel, Kongruenz, Konstruktionen",
    werkzeuge: ["koordinaten", "flaechen", "quader", "winkelsaetze", "kongruenz", "konstruktion"],
    namen: { koordinaten: "Koordinaten", flaechen: "Flächen", quader: "Quader", winkelsaetze: "Winkel", kongruenz: "Kongruenz", konstruktion: "Linien im Dreieck" } },
  { id: "geometrie-dreiecke", gruppe: "Geometrie", titel: "Geometrie", stufe: "Dreiecke und Körper", zeile: "Thales, Pythagoras, Höhensatz, Strahlensätze, Trigonometrie, Kreis, Körper",
    werkzeuge: ["thales", "pythagoras", "kathetensatz", "strahlensaetze", "trigonometrie", "kreis", "koerper"],
    namen: { thales: "Thales", pythagoras: "Pythagoras", kathetensatz: "Höhensatz", strahlensaetze: "Strahlensätze", trigonometrie: "Trigonometrie", kreis: "Kreis", koerper: "Körper" } },
  { id: "unterstufe-zahlen", gruppe: "Unterstufe", gruppen: ["Bruchrechnen", "Grundlagen"], titel: "Zahlen und Rechnen", stufe: "Klasse 5–6", zeile: "Stellenwert, ganze Zahlen, Primzahlen, Rechengesetze, Größen, Brüche, Dezimalzahlen",
    werkzeuge: ["stellenwert", "ganzezahlen", "primzahlen", "rechengesetze", "groessen", "bruchrechnen", "dezimal"],
    namen: { stellenwert: "Stellenwert", ganzezahlen: "Ganze Zahlen", primzahlen: "Primzahlen", rechengesetze: "Rechengesetze", groessen: "Größen", bruchrechnen: "Brüche", dezimal: "Dezimalzahlen" } },
  { id: "unterstufe-anwenden", gruppe: "Unterstufe", titel: "Zuordnungen, Prozent, Daten", stufe: "Klasse 5–6", zeile: "Dreisatz, Prozent und Zinsen, Diagramme, Zufall",
    werkzeuge: ["zuordnungen", "prozent", "diagramme", "zufall"],
    namen: { zuordnungen: "Dreisatz", prozent: "Prozent", diagramme: "Diagramme", zufall: "Zufall" } },
];

/* Reiter-Name im Band am Desktop (ab 1000 px): eigener Kurzname des Kurses, sonst der volle Werkzeugname.
   Darunter steht der kurze Name aus werkzeuge.js (kurz). */
export const reiterName = (k, id, w) => (k && k.namen && k.namen[id]) || w.name;
/* Reiter-Name unter 1000 px: eigener Kurzname des Kurses, sonst kurz aus werkzeuge.js */
export const reiterKurz = (k, id, w) => (k && k.kurzNamen && k.kurzNamen[id]) || w.kurz || w.name;

export const SPEICHER = "matheplus-trainingskurse";   // { gewaehlt: [id …], zuletzt: id }

export const kurs = (id) => KURSE.find((k) => k.id === id) || null;

/* Kurse, in denen das Werkzeug zur Ansicht vorkommt (Ansicht oder Umschalter-Ansicht, z. B. advplotter) */
export function kurseZu(ansicht) {
  return KURSE.filter((k) => k.werkzeuge.some((id) => { const w = werkzeug(id); return w && ansichtenVon(w).includes(ansicht); }));
}

function lies() {
  try { const s = JSON.parse(localStorage.getItem(SPEICHER) || "null"); return s && typeof s === "object" ? s : {}; } catch { return {}; }
}
function schreib(s) { try { localStorage.setItem(SPEICHER, JSON.stringify(s)); } catch { /* ignorieren */ } }

/* Deine Kurse. training = Lernstand.training; gebietVon(themaId, teile) → Gebiet („Analysis“ …) eines Themas
   aus Mein Mathe-Training. Liefert { kurse, quelle: "wahl" | "training" | "alle" } in KURSE-Reihenfolge. */
export function meineKurse(training, gebietVon = () => null) {
  const wahl = training && training.kurse && Array.isArray(training.kurse.gewaehlt) ? training.kurse.gewaehlt.filter((id) => kurs(id)) : [];
  if (wahl.length) return { kurse: KURSE.filter((k) => wahl.includes(k.id)), quelle: "wahl" };
  const MT = training && training.meinTraining;
  const themen = MT ? [...(MT.aktiv || []), ...(MT.danach || [])] : [];
  const gebiete = new Set(themen.map((t) => { try { return gebietVon(t.id, t.teile || null); } catch { return null; } }).filter(Boolean));
  const aus = KURSE.filter((k) => (k.gruppen || [k.gruppe]).some((g) => gebiete.has(g)));
  if (aus.length) return { kurse: aus, quelle: "training" };
  return { kurse: KURSE.slice(), quelle: "alle" };
}

/* Wahl umschalten (für training.kurse.gewaehlt): ausgehend von der aktuellen Liste */
export function wahlUmschalten(aktuell, id) {
  const ids = aktuell.map((k) => k.id);
  const neu = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  return KURSE.map((k) => k.id).filter((x) => neu.includes(x));
}

export function kursMerken(id) {
  if (!kurs(id)) return;
  schreib({ ...lies(), zuletzt: id });
}

/* Welcher Kurs gilt für diese Ansicht? Liegt das Werkzeug in mehreren Kursen,
   gewinnt der zuletzt gewählte; liegt es in keinem, null (dann altes Band). */
export function aktuellerKurs(ansicht, stand = lies()) {
  const k = kurseZu(ansicht);
  if (!k.length) return null;
  return k.find((x) => x.id === stand.zuletzt) || k[0];
}

/* Reiter des Bands: die Trainer des Kurses; ist das aktive Werkzeug nicht dabei
   (z. B. ein Vektor-Werkzeug), steht es zusätzlich am Ende. */
export function reiterFuer(k, aktivId) {
  const ids = k.werkzeuge.filter((id) => WERKZEUGE[id]);
  return aktivId && !ids.includes(aktivId) && WERKZEUGE[aktivId] ? [...ids, aktivId] : ids;
}

/* Alle Ansichten, die zu einem Kurs gehören (für func10: Band statt großem Seitenkopf) */
export const kursAnsichten = () => new Set(KURSE.flatMap((k) => k.werkzeuge.flatMap((id) => { const w = werkzeug(id); return w ? ansichtenVon(w) : []; })));

/* ============================================================
   VEKTOREN: vier Gruppen im Band, Seitenmenü je Gruppe (seit 22.10.)
   Ein Eintrag = ein Werkzeug (ansicht) und ggf. ein Modus darin (modus).
   Werkzeuge mit Modi (Rechnen mit Vektoren, Winkel, Geraden im Raum) lesen den Modus
   über useVekModus (vekNav.js) – ihr eigener Reiter oben entfällt, das Menü übernimmt.
   Geraden im Raum und Winkel verteilen ihre Modi auf zwei Gruppen
   (Gerade – Ebene und der Schnittwinkel stehen bei den Ebenen).
   ============================================================ */
export const VEK_BEREICHE = [
  { id: "rechnen", name: "Rechnen", kurz: "Rechnen", eintraege: [
    { id: "addsub", name: "Addition und Subtraktion", kurz: "Addition", ansicht: "vektorgenerator", modus: "addsub", bild: "summe" },
    { id: "vielfach", name: "Vielfache", kurz: "Vielfache", ansicht: "vektorgenerator", modus: "skalar", bild: "vielfaches" },
    { id: "linear", name: "Linearkombination", kurz: "Linear", ansicht: "vektorgenerator", modus: "linear", bild: "linear" },
    { id: "skalarprodukt", name: "Skalarprodukt", kurz: "Skalarprodukt", ansicht: "winkel", modus: "skalar", bild: "skalar" },
    { id: "vektorwinkel", name: "Winkel zwischen Vektoren", kurz: "Winkel", ansicht: "winkel", modus: "winkel", bild: "vektorwinkel" },
    { id: "kreuzprodukt", name: "Kreuzprodukt", kurz: "Kreuzprodukt", ansicht: "kreuzprodukt", bild: "kreuz" },
  ] },
  { id: "geraden", name: "Geraden", kurz: "Geraden", eintraege: [
    { id: "zweipunkte", name: "Gerade durch zwei Punkte", kurz: "Zwei Punkte", ansicht: "zweipunkte", bild: "gerade" },
    { id: "punktprobe", name: "Punktprobe", kurz: "Punktprobe", ansicht: "geraden", modus: "probe", bild: "auf" },
    { id: "gg", name: "Gerade – Gerade", kurz: "g – h", ansicht: "geraden", modus: "gg", bild: "windschief" },
  ] },
  { id: "ebenen", name: "Ebenen", kurz: "Ebenen", eintraege: [
    { id: "dreipunkte", name: "Ebene durch drei Punkte", kurz: "Drei Punkte", ansicht: "dreipunkte", bild: "punkt" },
    { id: "ebenen", name: "Ebenen im Raum", kurz: "Ebenen im Raum", ansicht: "ebenen", bild: "ebene" },
    { id: "ge", name: "Gerade – Ebene", kurz: "g – E", ansicht: "geraden", modus: "ge", bild: "ge-schneidend" },
    { id: "ee", name: "Zwei Ebenen", kurz: "E₁ – E₂", ansicht: "ebenevsebene", bild: "ee-schnitt" },
    { id: "gewinkel", name: "Schnittwinkel Gerade – Ebene", kurz: "Schnittwinkel", ansicht: "winkel", modus: "ge", bild: "ge-winkel" },
    { id: "abstaende", name: "Abstände", kurz: "Abstände", ansicht: "abstaende", bild: "abstand" },
  ] },
  { id: "hesse", name: "Hesse-Normalenform", kurz: "HNF", eintraege: [
    { id: "hesse", name: "Hesse-Normalenform", kurz: "HNF", ansicht: "hesse", bild: "lot" },
  ] },
];

/* Standardmodus je Werkzeug mit Modi (erster Eintrag im Menü) */
export const vekStandardModus = (ansicht) => {
  for (const b of VEK_BEREICHE) for (const e of b.eintraege) if (e.ansicht === ansicht && e.modus) return e.modus;
  return null;
};

/* Gruppe und Eintrag zu Ansicht + Modus. Ohne passenden Modus: erster Eintrag des Werkzeugs. */
export function vekWo(ansicht, modus = null) {
  let erst = null;
  for (const b of VEK_BEREICHE) for (const e of b.eintraege) {
    if (e.ansicht !== ansicht) continue;
    if (!e.modus || e.modus === modus) return { bereich: b, eintrag: e };
    if (!erst) erst = { bereich: b, eintrag: e };
  }
  return erst;
}
