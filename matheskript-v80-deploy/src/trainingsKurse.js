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
    werkzeuge: ["ableitungstrainer", "kurvendiskussion", "scharen", "steckbrief", "optimierung", "integrale"],
    namen: { steckbrief: "Steckbrief", optimierung: "Optimierung" } },
  { id: "funktionen-kennen", gruppe: "Analysis", titel: "Funktionen kennen", stufe: "", zeile: "Grundlagen, Sinus, Wachstum",
    werkzeuge: ["funktionen", "sinus", "wachstum"],
    namen: { funktionen: "Grundlagen", sinus: "Sinus", wachstum: "Wachstum" } },
  { id: "vektoren-ober", gruppe: "Vektoren", titel: "Vektoren", stufe: "Oberstufe", zeile: "Rechnen, Geraden, Ebenen, Abstände",
    werkzeuge: ["vektorgenerator", "kreuzprodukt", "winkel", "zweipunkte", "dreipunkte", "ebenen", "geraden", "ebenevsebene", "abstaende"],
    namen: { vektorgenerator: "Rechnen", kreuzprodukt: "Kreuzprodukt", winkel: "Winkel", zweipunkte: "Zwei Punkte", dreipunkte: "Drei Punkte", ebenen: "Ebenen im Raum", geraden: "Lage", ebenevsebene: "Zwei Ebenen", abstaende: "Abstände" },
    kurzNamen: { ebenen: "Ebenen", ebenevsebene: "E vs. E" } },
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
