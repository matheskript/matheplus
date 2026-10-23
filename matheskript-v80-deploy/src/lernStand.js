/* ============================================================
   Lernstand: Speicherschicht und Hook (aus func6.jsx herausgelöst, 23.10.2026)
   Klein und ohne Komponenten, damit der Startchunk func6.jsx (Einstufung,
   Lernlandkarte, Profil, LoesungsWeg …) nicht laden muss. func6.jsx
   exportiert alles weiter – alte Importe funktionieren.
   ============================================================ */
import React, { useState } from "react";
import { PROTOKOLL } from "./base2.jsx";
import { GRUPPE_ZU_KOMPETENZ, LERN, LERN_SCHLUESSEL, RAM_SPEICHER } from "./base3.jsx";
import { syncMelden } from "./lernSync.js";

/* ---------- Speicherschicht ---------- */

/* Die einzige Stelle, die später gegen den Server getauscht wird.
   Bis dahin: Artefakt-Speicher, sonst Browserspeicher, sonst Arbeitsspeicher. */

export function lernBenachrichtigen() { LERN.hoerer.forEach((h) => h()); }


/* Der Lernstand in der gespeicherten Form – auch die Grundlage für den Abgleich mit dem Konto (lernSync.js). */
export function lernSnapshot() {
  return { profil: LERN.profil, stand: LERN.stand, einstufung: LERN.einstufung, aktivitaet: LERN.aktivitaet,
    plan: LERN.plan, verlauf: LERN.verlauf, testFehl: LERN.testFehl, letzteAktivitaet: LERN.letzteAktivitaet,
    messungen: LERN.messungen, experimente: LERN.experimente, noten: LERN.noten, pseudonym: LERN.pseudonym, termine: LERN.termine, training: LERN.training || null, pfad: LERN.pfad || null, protokoll: PROTOKOLL.slice(-500),
    _zeit: LERN.zeit || 0 };
}

/* Leerer Stand (z. B. nach dem Abmelden auf einem geteilten Gerät) */
export function lernLeer() {
  return { profil: null, stand: {}, einstufung: null, aktivitaet: {}, plan: null, verlauf: [], testFehl: {}, letzteAktivitaet: 0,
    messungen: {}, experimente: {}, noten: [], pseudonym: null, termine: [], training: null, pfad: null, protokoll: [], _zeit: 0 };
}

/* Setzt einen gespeicherten Stand ein (Laden, Abgleich mit dem Konto). Ändert den Änderungsstempel nicht. */
export function lernAnwenden(d) {
  d = d || lernLeer();
  LERN.profil = d.profil || null; LERN.stand = d.stand || {}; LERN.einstufung = d.einstufung || null;
  LERN.aktivitaet = d.aktivitaet || {}; LERN.plan = d.plan || null; LERN.verlauf = d.verlauf || [];
  LERN.testFehl = d.testFehl || {}; LERN.letzteAktivitaet = d.letzteAktivitaet || 0;
  LERN.messungen = d.messungen || {}; LERN.experimente = d.experimente || {}; LERN.noten = d.noten || []; LERN.pseudonym = d.pseudonym || null; LERN.termine = d.termine || []; LERN.training = d.training || null; LERN.pfad = d.pfad || null;
  LERN.zeit = d._zeit || 0;
  PROTOKOLL.splice(0, PROTOKOLL.length, ...(d.protokoll || []));
}

function lernLokalSichern() { speicherSchreiben(lernSnapshot()); }

export function lernSpeichern() {
  LERN.zeit = Date.now();
  lernLokalSichern();
  syncMelden();
}

/* Vom Konto-Abgleich gesetzt: lokal sichern und anzeigen, ohne erneut hochzuladen */
export function lernVomKonto(d) {
  lernAnwenden(d);
  lernLokalSichern();
  lernBenachrichtigen();
}

export function lernAendern(fn) {
  fn(LERN);
  lernBenachrichtigen();
  lernSpeichern();
}

export async function speicherLesen() {
  try {
    if (typeof window !== "undefined" && window.storage && window.storage.get) {
      const r = await window.storage.get(LERN_SCHLUESSEL);
      if (r && r.value) return JSON.parse(r.value);
    }
  } catch (e) { /* Schlüssel noch nicht vorhanden */ }
  try {
    const v = window.localStorage && window.localStorage.getItem(LERN_SCHLUESSEL);
    if (v) return JSON.parse(v);
  } catch (e) { /* nicht verfügbar */ }
  return RAM_SPEICHER[LERN_SCHLUESSEL] || null;
}

export async function speicherSchreiben(daten) {
  RAM_SPEICHER[LERN_SCHLUESSEL] = daten;
  const text = JSON.stringify(daten);
  try {
    if (typeof window !== "undefined" && window.storage && window.storage.set) {
      await window.storage.set(LERN_SCHLUESSEL, text);
      return;
    }
  } catch (e) { /* weiter zum Browserspeicher */ }
  try { window.localStorage && window.localStorage.setItem(LERN_SCHLUESSEL, text); } catch (e) { /* bleibt im Arbeitsspeicher */ }
}

export async function lernLaden() {
  const d = await speicherLesen();
  if (d) lernAnwenden(d);
  LERN.geladen = true;
  lernBenachrichtigen();
}


export function useLern() {
  const [, setZ] = useState(0);
  React.useEffect(() => {
    const h = () => setZ((z) => z + 1);
    LERN.hoerer.add(h);
    return () => LERN.hoerer.delete(h);
  }, []);
  return LERN;
}

/* Übungsergebnisse aus der ganzen App fließen in den Lernstand ein. */

export function lernAusUebung(eintrag) {
  const id = GRUPPE_ZU_KOMPETENZ[eintrag.gruppe];
  if (!id || !LERN.profil) return;
  lernAendern((L) => {
    const alt = L.stand[id] || { status: null, folge: 0, n: 0, ok: 0 };
    const neu = { ...alt, n: (alt.n || 0) + 1, ok: (alt.ok || 0) + (eintrag.richtig ? 1 : 0), zuletzt: Date.now() };
    if (eintrag.richtig) {
      neu.folge = (alt.folge || 0) + 1;
      if (neu.folge >= 5) neu.status = "sicher";
      else if (neu.status !== "sicher") neu.status = "arbeit";
    } else {
      neu.folge = 0;
      neu.status = alt.status === "sicher" ? "arbeit" : alt.status === "luecke" ? "luecke" : "arbeit";
    }
    L.stand[id] = neu;
  });
}
