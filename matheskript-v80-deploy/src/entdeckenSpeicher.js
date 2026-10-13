/* ======================================================================
   entdeckenSpeicher.js – Lernfortschritt im Bereich „Mathe entdecken“.
   Der Browser (localStorage) ist die schnelle, immer verfügbare Quelle. Ist ein Konto angemeldet,
   gleicht entdeckenSync.js denselben Stand mit der Tabelle public.entdecken_fortschritt ab
   (supabase/entdecken.sql). Keine React-Imports.

   Form (siehe entdeckenMerge.js → normalisiere):
   {
     reflexion: { q1: { wahl, text, zeit }, q2: …, q3: … },     // Reflexion zum Hauptvideo
     video:     { haupt: { an, zeit }, puzzle: …, calculus: … }, // vom Schüler als „gesehen“ markiert
     potenz:    { phase: 0–6, stand: [n0 … n6], fertig, phasenFertig, zeit },  // siebenphasiges Modul
     zuletzt:   { id: "einstieg" | "potenz", label, zeit },
     _zeit
   }
   ====================================================================== */
import { PHASEN, mergeEntdecken, normalisiere } from "./entdeckenMerge.js";

const SCHLUESSEL = "matheskript-entdecken-v1";
export const PHASEN_ANZAHL = PHASEN;

const leer = () => normalisiere({});

let D = leer();
const hoerer = new Set();
/* Wird von entdeckenSync.js gesetzt: melden() = lokale Änderung, ersetzen() = bewusstes Zurücksetzen */
let haken = null;
export const entdeckenSyncHaken = (h) => { haken = h; };

try {
  const t = window.localStorage.getItem(SCHLUESSEL);
  if (t) D = normalisiere(JSON.parse(t));
} catch (e) { /* privat oder nicht verfügbar: bleibt im Arbeitsspeicher */ }

function lokalSichern() {
  try { window.localStorage && window.localStorage.setItem(SCHLUESSEL, JSON.stringify(D)); } catch (e) { /* bleibt im Arbeitsspeicher */ }
  hoerer.forEach((f) => { try { f(); } catch (e) { /* egal */ } });
}

/* Lokale Änderung: sichern, anzeigen und beim Konto melden */
function sichern(ersetzen = false) {
  D._zeit = Date.now();
  lokalSichern();
  if (haken) { try { ersetzen ? haken.ersetzen() : haken.melden(); } catch (e) { /* Sync darf nie stören */ } }
}

export const entdeckenStand = () => D;
export const entdeckenHoeren = (f) => { hoerer.add(f); return () => hoerer.delete(f); };

/* ---------- Abgleich mit dem Konto (entdeckenSync.js) ---------- */
export const entdeckenSnapshot = () => normalisiere(D);
export const entdeckenLeer = leer;
/* Vom Abgleich gesetzt: lokal sichern und anzeigen, ohne erneut hochzuladen */
export function entdeckenAnwenden(d) {
  D = normalisiere(d);
  lokalSichern();
}
export { mergeEntdecken };

/* ---------- Einstieg: Video und drei Reflexionsfragen ---------- */
export const REFLEX_IDS = ["q1", "q2", "q3"];

export const reflexionBeantwortet = (q) => !!q && (!!q.wahl || (q.text || "").trim().length >= 3);

export function reflexionSetzen(id, teil) {
  const alt = D.reflexion[id] || { wahl: "", text: "", zeit: 0 };
  D.reflexion = { ...D.reflexion, [id]: { ...alt, ...teil, zeit: Date.now() } };
  D.zuletzt = { id: "einstieg", label: "Reflexionsfragen zum Video", zeit: Date.now() };
  sichern();
}

export const videoGesehen = (id) => !!(D.video[id] && D.video[id].an);
export function videoSetzen(id, gesehen) {
  D.video = { ...D.video, [id]: { an: !!gesehen, zeit: Date.now() } };
  if (gesehen) D.zuletzt = { id: "einstieg", label: "Video angesehen", zeit: Date.now() };
  sichern();
}

/* „Abgeschlossen“, wenn das Hauptvideo als gesehen markiert ist und alle drei Reflexionsfragen beantwortet sind */
export const statusEinstieg = () => {
  const n = REFLEX_IDS.filter((id) => reflexionBeantwortet(D.reflexion[id])).length;
  const v = videoGesehen("haupt");
  return n === REFLEX_IDS.length && v ? "fertig" : n > 0 || v ? "arbeit" : "offen";
};
export const einstiegFortschritt = () => REFLEX_IDS.filter((id) => reflexionBeantwortet(D.reflexion[id])).length;

/* ---------- Potenzregel-Modul ---------- */
export function potenzStandSetzen(phase, anzahl) {
  const stand = D.potenz.stand.slice();
  stand[phase] = Math.max(stand[phase], anzahl);
  D.potenz = { ...D.potenz, stand, zeit: Date.now() };
  D.zuletzt = { id: "potenz", label: `Phase ${phase + 1} von ${PHASEN_ANZAHL}`, zeit: Date.now() };
  sichern();
}

export function potenzPhaseSetzen(phase) {
  D.potenz = { ...D.potenz, phase, zeit: Date.now() };
  D.zuletzt = { id: "potenz", label: `Phase ${phase + 1} von ${PHASEN_ANZAHL}`, zeit: Date.now() };
  sichern();
}

export function potenzFertigSetzen(fertig) {
  D.potenz = { ...D.potenz, fertig, zeit: Date.now() };
  if (fertig) D.zuletzt = { id: "potenz", label: "Modul abgeschlossen", zeit: Date.now() };
  sichern();
}

/* Bewusstes Zurücksetzen: der lokale Stand ersetzt den Konto-Stand (kein Zusammenführen, sonst käme Gelöschtes zurück) */
export function potenzZuruecksetzen() {
  D.potenz = { ...leer().potenz, zeit: Date.now() };
  sichern(true);
}

export const statusPotenz = () => {
  if (D.potenz.fertig) return "fertig";
  return D.potenz.stand.some((n) => n > 0) || D.potenz.phase > 0 ? "arbeit" : "offen";
};

/* Phasen, die ganz durchgearbeitet sind (Anzahl der Schritte kennt nur das Modul selbst, deshalb meldet es sie) */
export function potenzPhasenFertigSetzen(liste) {
  D.potenz = { ...D.potenz, phasenFertig: liste, zeit: Date.now() };
  sichern();
}
export const potenzPhasenFertig = () => D.potenz.phasenFertig || [];
