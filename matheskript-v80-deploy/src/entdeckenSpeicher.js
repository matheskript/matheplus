/* ======================================================================
   entdeckenSpeicher.js – Lernfortschritt im Bereich „Mathe entdecken“.
   Liegt im Browser (localStorage), pro Gerät. Reine Daten, keine Imports.

   Form:
   {
     reflexion: { q1: { wahl, text }, q2: …, q3: … },     // Reflexion zum Hauptvideo
     potenz:    { phase: 0–6, stand: [n0 … n6], fertig: false },  // siebenphasiges Modul
     zuletzt:   { id: "einstieg" | "potenz", label, zeit }
   }
   ====================================================================== */

const SCHLUESSEL = "matheskript-entdecken-v1";
export const PHASEN_ANZAHL = 7;

const leer = () => ({ reflexion: {}, potenz: { phase: 0, stand: Array(PHASEN_ANZAHL).fill(0), fertig: false }, zuletzt: null });

let D = leer();
const hoerer = new Set();

try {
  const t = window.localStorage.getItem(SCHLUESSEL);
  if (t) {
    const p = JSON.parse(t);
    if (p && typeof p === "object") {
      D = { ...leer(), ...p, potenz: { ...leer().potenz, ...(p.potenz || {}) } };
      if (!Array.isArray(D.potenz.stand) || D.potenz.stand.length !== PHASEN_ANZAHL) D.potenz.stand = Array(PHASEN_ANZAHL).fill(0);
    }
  }
} catch (e) { /* privat oder nicht verfügbar: bleibt im Arbeitsspeicher */ }

function sichern() {
  try { window.localStorage && window.localStorage.setItem(SCHLUESSEL, JSON.stringify(D)); } catch (e) { /* bleibt im Arbeitsspeicher */ }
  hoerer.forEach((f) => { try { f(); } catch (e) { /* egal */ } });
}

export const entdeckenStand = () => D;
export const entdeckenHoeren = (f) => { hoerer.add(f); return () => hoerer.delete(f); };

/* ---------- Einstieg: drei Reflexionsfragen ---------- */
export const REFLEX_IDS = ["q1", "q2", "q3"];

export const reflexionBeantwortet = (q) => !!q && (!!q.wahl || (q.text || "").trim().length >= 3);

export function reflexionSetzen(id, teil) {
  D.reflexion = { ...D.reflexion, [id]: { ...(D.reflexion[id] || {}), ...teil } };
  D.zuletzt = { id: "einstieg", label: "Reflexionsfragen zum Video", zeit: Date.now() };
  sichern();
}

export const statusEinstieg = () => {
  const n = REFLEX_IDS.filter((id) => reflexionBeantwortet(D.reflexion[id])).length;
  return n === 0 ? "offen" : n === REFLEX_IDS.length ? "fertig" : "arbeit";
};
export const einstiegFortschritt = () => REFLEX_IDS.filter((id) => reflexionBeantwortet(D.reflexion[id])).length;

/* ---------- Potenzregel-Modul ---------- */
export function potenzStandSetzen(phase, anzahl) {
  const stand = D.potenz.stand.slice();
  stand[phase] = Math.max(stand[phase], anzahl);
  D.potenz = { ...D.potenz, stand };
  D.zuletzt = { id: "potenz", label: `Phase ${phase + 1} von ${PHASEN_ANZAHL}`, zeit: Date.now() };
  sichern();
}

export function potenzPhaseSetzen(phase) {
  D.potenz = { ...D.potenz, phase };
  D.zuletzt = { id: "potenz", label: `Phase ${phase + 1} von ${PHASEN_ANZAHL}`, zeit: Date.now() };
  sichern();
}

export function potenzFertigSetzen(fertig) {
  D.potenz = { ...D.potenz, fertig };
  if (fertig) D.zuletzt = { id: "potenz", label: "Modul abgeschlossen", zeit: Date.now() };
  sichern();
}

export function potenzZuruecksetzen() {
  D.potenz = leer().potenz;
  sichern();
}

export const statusPotenz = () => {
  if (D.potenz.fertig) return "fertig";
  return D.potenz.stand.some((n) => n > 0) || D.potenz.phase > 0 ? "arbeit" : "offen";
};

/* Phasen, die ganz durchgearbeitet sind (Anzahl der Schritte kennt nur das Modul selbst, deshalb meldet es sie) */
export function potenzPhasenFertigSetzen(liste) {
  D.potenz = { ...D.potenz, phasenFertig: liste };
  sichern();
}
export const potenzPhasenFertig = () => D.potenz.phasenFertig || [];
