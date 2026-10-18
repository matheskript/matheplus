/* ======================================================================
   penpaperSpeicher.js – Lernfortschritt im Pen-&-Paper-Kurs.
   Der Browser (localStorage) ist die schnelle, immer verfügbare Quelle. Ist ein Konto angemeldet,
   gleicht penpaperSync.js denselben Stand mit der Tabelle public.penpaper_fortschritt ab
   (supabase/penpaper.sql). Form siehe penpaperMerge.js. Keine React-Imports.
   ====================================================================== */
import { LEKTIONEN_ANZAHL, LEKTION_IDS, TAG_IDS, mergePenPaper, normalisiere } from "./penpaperMerge.js";

const SCHLUESSEL = "matheskript-penpaper-v1";
export { LEKTIONEN_ANZAHL, LEKTION_IDS, TAG_IDS };

const leer = () => normalisiere({});
let D = leer();
const hoerer = new Set();
let haken = null;
export const penpaperSyncHaken = (h) => { haken = h; };

try {
  const t = window.localStorage.getItem(SCHLUESSEL);
  if (t) D = normalisiere(JSON.parse(t));
} catch (e) { /* privat oder nicht verfügbar */ }

function lokalSichern() {
  try { window.localStorage && window.localStorage.setItem(SCHLUESSEL, JSON.stringify(D)); } catch (e) { /* bleibt im Arbeitsspeicher */ }
  hoerer.forEach((f) => { try { f(); } catch (e) { /* egal */ } });
}
function sichern(ersetzen = false) {
  D._zeit = Date.now();
  lokalSichern();
  if (haken) { try { ersetzen ? haken.ersetzen() : haken.melden(); } catch (e) { /* Sync darf nie stören */ } }
}

export const penpaperStand = () => D;
export const penpaperHoeren = (f) => { hoerer.add(f); return () => hoerer.delete(f); };

/* ---------- Abgleich mit dem Konto ---------- */
export const penpaperSnapshot = () => normalisiere(D);
export const penpaperLeer = leer;
export function penpaperAnwenden(d) { D = normalisiere(d); lokalSichern(); }
export { mergePenPaper };

/* ---------- Lektionen ---------- */
export const lektionFertig = (id) => !!(D.lektionen[id] && D.lektionen[id].fertig);
export function lektionSetzen(id, fertig) {
  if (!LEKTION_IDS.includes(id)) return;
  D.lektionen = { ...D.lektionen, [id]: { fertig: !!fertig, zeit: Date.now() } };
  sichern();
}
export const lektionenFertig = () => LEKTION_IDS.filter(lektionFertig).length;
export function zuletztSetzen(id) {
  if (!LEKTION_IDS.includes(id) || (D.zuletzt && D.zuletzt.id === id)) return;
  D.zuletzt = { id, zeit: Date.now() };
  sichern();
}
/* Nächste offene Lektion (ab der zuletzt geöffneten) */
export function naechsteLektion() {
  const start = D.zuletzt ? LEKTION_IDS.indexOf(D.zuletzt.id) : 0;
  for (let k = 0; k < LEKTIONEN_ANZAHL; k++) { const id = LEKTION_IDS[(start + k) % LEKTIONEN_ANZAHL]; if (!lektionFertig(id)) return id; }
  return null;
}

/* ---------- Übungen ---------- */
export const uebungStand = (id) => D.uebungen[id] || { geloest: false, versuche: 0, zeit: 0 };
export function uebungBuchen(id, geloest) {
  const alt = uebungStand(id);
  D.uebungen = { ...D.uebungen, [id]: { geloest: alt.geloest || !!geloest, versuche: alt.versuche + 1, zeit: Date.now() } };
  sichern();
}

/* ---------- 7-Tage-Plan ---------- */
export const tagAn = (id) => !!(D.tage[id] && D.tage[id].an);
export function tagSetzen(id, an) {
  if (!TAG_IDS.includes(id)) return;
  D.tage = { ...D.tage, [id]: { an: !!an, zeit: Date.now() } };
  sichern();
}
export const tageFertig = () => TAG_IDS.filter(tagAn).length;

/* ---------- Von vorn ---------- */
export function penpaperZuruecksetzen() { D = leer(); sichern(true); }
