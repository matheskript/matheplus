/* ============================================================
   TRAININGS-KURSE – welche Trainer im Werkzeug-Band nebeneinander stehen
   Das Band unter der Kopfleiste (WerkzeugBand in funcWerkzeuge.jsx) zeigt
   links die Trainer des aktuellen Kurses als Reiter (aktiver mit Goldstrich)
   und rechts den Kurs-Umschalter (früher „Tools“). Je Kurs etwa fünf bis
   sechs Trainer; Werkzeuge außerhalb aller Kurse behalten das alte Band
   (Werkzeuge der Station + „Tools“).

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
  /* Mittelstufe: ein allgemeiner Kurs statt je Gebiet – dort hat jedes Thema nur einen Trainer.
     gruppen = Gebiete aus Mein Mathe-Training, bei denen dieser Kurs unter „Deine Kurse“ erscheint.
     „√(…)“ in namen/kurzNamen setzt das Band mit MitWurzeln (Haken + Überstrich als ein Linienzug). */
  { id: "mittel", gruppe: "Mittelstufe", gruppen: ["Bruchrechnen", "Geometrie"], titel: "Mittelstufe", stufe: "", zeile: "Geraden, Parabeln, Pythagoras, Gleichungen, Brüche und Wurzeln",
    werkzeuge: ["geradengleichung", "parabeln", "pythagoras", "gleichungen", "bruchwurzel"],
    namen: { pythagoras: "Pythagoras", gleichungen: "Gleichungen", bruchwurzel: "Brüche und √(Wurzeln)" },
    kurzNamen: { gleichungen: "Gleichungen", bruchwurzel: "Brüche und √(Wurzeln)" } },
  { id: "analysis-ober", gruppe: "Analysis", titel: "Analysis", stufe: "Oberstufe", zeile: "Ableiten, Kurven, Integrale",
    werkzeuge: ["ableitungstrainer", "kurvendiskussion", "scharen", "steckbrief", "optimierung", "integrale"],
    namen: { steckbrief: "Steckbrief", optimierung: "Optimierung" } },
  { id: "vektoren-ober", gruppe: "Vektoren", titel: "Vektoren", stufe: "Oberstufe", zeile: "Geraden, Ebenen, Abstände",
    werkzeuge: ["vektorgenerator", "geraden", "dreipunkte", "ebenevsebene", "abstaende"],
    namen: { dreipunkte: "Drei Punkte" } },
  { id: "stochastik-ober", gruppe: "Stochastik", titel: "Stochastik", stufe: "Oberstufe", zeile: "Bäume, Binomial, Tests",
    werkzeuge: ["kombinatorik", "vierfelder", "bernoulli", "hypothesentest", "normalverteilung"],
    namen: { kombinatorik: "Kombinatorik" } },
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
   (z. B. Stammfunktion & Integral), steht es zusätzlich am Ende. */
export function reiterFuer(k, aktivId) {
  const ids = k.werkzeuge.filter((id) => WERKZEUGE[id]);
  return aktivId && !ids.includes(aktivId) && WERKZEUGE[aktivId] ? [...ids, aktivId] : ids;
}

/* Alle Ansichten, die zu einem Kurs gehören (für func10: Band statt großem Seitenkopf) */
export const kursAnsichten = () => new Set(KURSE.flatMap((k) => k.werkzeuge.flatMap((id) => { const w = werkzeug(id); return w ? ansichtenVon(w) : []; })));
