/* ============================================================
   TRAININGS-KURSE – welche Trainer im Werkzeug-Band nebeneinander stehen
   Das Band unter der Kopfleiste (WerkzeugBand in funcWerkzeuge.jsx) zeigt
   links die Trainer des aktuellen Kurses als Reiter (aktiver mit Goldstrich)
   und rechts den Kurs-Umschalter (früher „Tools“). Je Kurs etwa fünf bis
   sechs Trainer; Werkzeuge außerhalb aller Kurse behalten das alte Band
   (Werkzeuge der Station + „Tools“).

   Ein Kurs = Eintrag in KURSE (Werkzeug-IDs aus werkzeuge.js).
   „Gewählte Kurse“ liegen vorerst nur im Browser (SPEICHER); ohne Wahl
   stehen alle Kurse im Umschalter. Reine Logik, ohne React – testbar mit Node.
   ============================================================ */
import { WERKZEUGE, ansichtenVon, werkzeug } from "./werkzeuge.js";

export const KURSE = [
  { id: "analysis-ober", titel: "Analysis", stufe: "Oberstufe", zeile: "Ableiten, Kurven, Integrale",
    werkzeuge: ["ableitungstrainer", "kurvendiskussion", "scharen", "steckbrief", "optimierung", "integrale"],
    namen: { steckbrief: "Steckbrief", optimierung: "Optimierung" } },
  { id: "vektoren-ober", titel: "Vektoren", stufe: "Oberstufe", zeile: "Geraden, Ebenen, Abstände",
    werkzeuge: ["vektorgenerator", "geraden", "dreipunkte", "ebenevsebene", "abstaende"],
    namen: { dreipunkte: "Drei Punkte" } },
  { id: "stochastik-ober", titel: "Stochastik", stufe: "Oberstufe", zeile: "Bäume, Binomial, Tests",
    werkzeuge: ["kombinatorik", "vierfelder", "bernoulli", "hypothesentest", "normalverteilung"],
    namen: { kombinatorik: "Kombinatorik" } },
];

/* Reiter-Name im Band am Desktop (ab 1000 px): eigener Kurzname des Kurses, sonst der volle Werkzeugname.
   Darunter steht der kurze Name aus werkzeuge.js (kurz). */
export const reiterName = (k, id, w) => (k && k.namen && k.namen[id]) || w.name;

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

/* Die Kurse im Umschalter: gewählte (gültige) Kurse in KURSE-Reihenfolge, ohne Wahl alle */
export function gewaehlteKurse(stand = lies()) {
  const g = Array.isArray(stand.gewaehlt) ? stand.gewaehlt.filter((id) => kurs(id)) : [];
  return g.length ? KURSE.filter((k) => g.includes(k.id)) : KURSE.slice();
}

export function kurseWaehlen(ids) {
  const s = lies();
  schreib({ ...s, gewaehlt: ids.filter((id) => kurs(id)) });
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
