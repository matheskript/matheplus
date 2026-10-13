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
     axiome:    { phase: 0–6, stand: [n0 … n6], fertig, zeit },                // Modul „Axiome“ (Lernangebot 1)
     module:    { pythagoras: { phase, stand: [n0 …], fertig, zeit } },        // weitere Module (MODULE in entdeckenMerge.js)
     teiler:    { stand: [n0 … n7], quiz: { runden, perfekt }, zeit },         // Teilbarkeitsregeln: Schritte je Regel (Reihenfolge 2,5,3,4,6,7,8,9), Quiz-Zähler
     zuletzt:   { id: "axiome" | "einstieg" | "potenz" | "pythagoras" | "teiler", label, zeit },
     _zeit
   }
   ====================================================================== */
import { AXIOM_PHASEN, MODULE, PHASEN, TEILER_REGELN, mergeEntdecken, normalisiere } from "./entdeckenMerge.js";
import { TEILER_REIHE, TEILER_SCHRITTE } from "./teiler.js";

const SCHLUESSEL = "matheskript-entdecken-v1";
export const PHASEN_ANZAHL = PHASEN;
export const AXIOM_PHASEN_ANZAHL = AXIOM_PHASEN;
export const MODUL_PHASEN = MODULE;

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

/* ---------- Axiome-Modul ---------- */
export function axiomeStandSetzen(phase, anzahl) {
  const stand = D.axiome.stand.slice();
  stand[phase] = Math.max(stand[phase], anzahl);
  D.axiome = { ...D.axiome, stand, zeit: Date.now() };
  D.zuletzt = { id: "axiome", label: `Phase ${phase + 1} von ${AXIOM_PHASEN}`, zeit: Date.now() };
  sichern();
}

export function axiomePhaseSetzen(phase) {
  D.axiome = { ...D.axiome, phase, zeit: Date.now() };
  D.zuletzt = { id: "axiome", label: `Phase ${phase + 1} von ${AXIOM_PHASEN}`, zeit: Date.now() };
  sichern();
}

export function axiomeFertigSetzen(fertig) {
  D.axiome = { ...D.axiome, fertig, zeit: Date.now() };
  if (fertig) D.zuletzt = { id: "axiome", label: "Modul abgeschlossen", zeit: Date.now() };
  sichern();
}

/* Bewusstes Zurücksetzen: ersetzt den Konto-Stand (kein Zurückmischen) */
export function axiomeZuruecksetzen() {
  D.axiome = { ...leer().axiome, zeit: Date.now() };
  sichern(true);
}

export const statusAxiome = () => {
  if (D.axiome.fertig) return "fertig";
  return D.axiome.stand.some((n) => n > 0) || D.axiome.phase > 0 ? "arbeit" : "offen";
};

/* ---------- Weitere Module (z. B. „pythagoras“) – gleiche Logik wie beim Potenzregel-Modul ---------- */
export const modulStand = (id) => D.module[id];

export function modulStandSetzen(id, phase, anzahl) {
  const m = D.module[id];
  const stand = m.stand.slice();
  stand[phase] = Math.max(stand[phase], anzahl);
  D.module = { ...D.module, [id]: { ...m, stand, zeit: Date.now() } };
  D.zuletzt = { id, label: `Phase ${phase + 1} von ${MODULE[id]}`, zeit: Date.now() };
  sichern();
}

export function modulPhaseSetzen(id, phase) {
  D.module = { ...D.module, [id]: { ...D.module[id], phase, zeit: Date.now() } };
  D.zuletzt = { id, label: `Phase ${phase + 1} von ${MODULE[id]}`, zeit: Date.now() };
  sichern();
}

export function modulFertigSetzen(id, fertig) {
  D.module = { ...D.module, [id]: { ...D.module[id], fertig, zeit: Date.now() } };
  if (fertig) D.zuletzt = { id, label: "Modul abgeschlossen", zeit: Date.now() };
  sichern();
}

/* Bewusstes Zurücksetzen: ersetzt den Konto-Stand (kein Zusammenführen) */
export function modulZuruecksetzen(id) {
  D.module = { ...D.module, [id]: { ...leer().module[id], zeit: Date.now() } };
  sichern(true);
}

export const statusModul = (id) => {
  const m = D.module[id];
  if (m.fertig) return "fertig";
  return m.stand.some((n) => n > 0) || m.phase > 0 ? "arbeit" : "offen";
};

/* Phasen, die ganz durchgearbeitet sind (Anzahl der Schritte kennt nur das Modul selbst, deshalb meldet es sie) */
export function potenzPhasenFertigSetzen(liste) {
  D.potenz = { ...D.potenz, phasenFertig: liste, zeit: Date.now() };
  sichern();
}
export const potenzPhasenFertig = () => D.potenz.phasenFertig || [];

/* ---------- Teilbarkeitsregeln ---------- */
export const teilerStandSetzen = (regel, anzahl) => {
  const stand = D.teiler.stand.slice();
  stand[regel] = Math.max(stand[regel], anzahl);
  D.teiler = { ...D.teiler, stand, zeit: Date.now() };
  D.zuletzt = { id: "teiler", label: `Teilbarkeit durch ${TEILER_REIHE[regel]}`, zeit: Date.now() };
  sichern();
};

/* Eine Quiz-Runde ist ausgewertet (perfekt = keine Zahl falsch markiert oder übersehen) */
export function teilerQuizBuchen(perfekt) {
  const q = D.teiler.quiz;
  D.teiler = { ...D.teiler, quiz: { runden: q.runden + 1, perfekt: q.perfekt + (perfekt ? 1 : 0) }, zeit: Date.now() };
  D.zuletzt = { id: "teiler", label: "Quiz: Zahlen markieren", zeit: Date.now() };
  sichern();
}

/* Bewusstes Zurücksetzen: ersetzt den Konto-Stand (kein Zusammenführen) */
export function teilerZuruecksetzen() {
  D.teiler = { ...leer().teiler, zeit: Date.now() };
  sichern(true);
}

export const teilerRegelFertig = (regel) => D.teiler.stand[regel] >= TEILER_SCHRITTE[regel];
export const teilerFertigAnzahl = () => TEILER_SCHRITTE.filter((_, k) => teilerRegelFertig(k)).length;
export const teilerAnzahl = TEILER_REGELN;
export const statusTeiler = () => {
  if (teilerFertigAnzahl() === TEILER_REGELN) return "fertig";
  return D.teiler.stand.some((n) => n > 0) || D.teiler.quiz.runden > 0 ? "arbeit" : "offen";
};
