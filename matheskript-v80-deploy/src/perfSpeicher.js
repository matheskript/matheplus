/* ======================================================================
   perfSpeicher.js – Speicherschicht des Performance-Labs (ein React-Hook, sonst keine Oberfläche).

   Das Fehlergedächtnis (perfKern.js) arbeitet auf einem Objekt P. Diese Datei hält P,
   speichert es und benachrichtigt die Oberfläche. Wie beim Lernstand (func6.jsx) gilt:
   Artefakt-Speicher, sonst Browserspeicher, sonst Arbeitsspeicher.
   Das ist die EINE Stelle, die später gegen einen Server getauscht wird
   (vorbereitetes Schema: supabase/perf-lab.sql – noch nicht eingespielt).

   Nutzer: Jedes Ereignis, jede Runde und jedes Badge trägt die Nutzer-ID des Kontos
   (Supabase-ID, ohne Anmeldung „lokal“). Alle Abfragen filtern danach – auch wenn mehrere
   Konten dasselbe Gerät benutzen, sieht jede Person nur ihre eigenen Daten.

   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { useSyncExternalStore } from "react";
import { FEHLERTYPEN_TAX, KONTEXT_AUS_THEMA } from "./perfTaxonomie.js";
import { leerePerf, normierePerf, meldeAufgabe, meldeFehler } from "./perfKern.js";

export const PERF_SCHLUESSEL = "mm-performance-lab";

let P = leerePerf();
let version = 0;
const hoerer = new Set();
const RAM = {};

const parse = (t) => { try { const d = JSON.parse(t); return d && typeof d === "object" ? normierePerf(d) : null; } catch (e) { return null; } };

/* Synchron aus dem Browserspeicher lesen, damit beim ersten Rendern schon Daten da sind */
try { const t = window.localStorage.getItem(PERF_SCHLUESSEL); const d = t && parse(t); if (d) P = d; } catch (e) { /* privat/nicht verfügbar */ }

/* Zusätzlich der Artefakt-Speicher (Claude-Vorschau), falls vorhanden – asynchron */
try {
  if (typeof window !== "undefined" && window.storage && window.storage.get) {
    window.storage.get(PERF_SCHLUESSEL).then((r) => { const d = r && r.value && parse(r.value); if (d && !P.ereignisse.length && !P.runden.length) { P = d; melden(); } }).catch(() => {});
  }
} catch (e) { /* egal */ }

function melden() { version += 1; hoerer.forEach((h) => h()); }

async function schreiben() {
  const text = JSON.stringify(P);
  RAM[PERF_SCHLUESSEL] = text;
  try {
    if (typeof window !== "undefined" && window.storage && window.storage.set) { await window.storage.set(PERF_SCHLUESSEL, text); return; }
  } catch (e) { /* weiter */ }
  try { window.localStorage && window.localStorage.setItem(PERF_SCHLUESSEL, text); } catch (e) { /* bleibt im Arbeitsspeicher */ }
}

/* Ändert das Gedächtnis, speichert und benachrichtigt. fn bekommt P und darf es verändern. */
export function perfAendern(fn) {
  const r = fn(P);
  melden();
  schreiben();
  return r;
}
export const perfLesen = () => P;

/* React: liefert P und rendert neu, wenn sich etwas ändert. v ist die Version (für useMemo). */
export function usePerf() {
  const v = useSyncExternalStore((h) => { hoerer.add(h); return () => hoerer.delete(h); }, () => version);
  return { P, v };
}

/* Nutzer-ID aus dem Konto: Supabase-ID, sonst „lokal“ */
export const perfNutzerId = (konto) => (konto && konto.nutzer && konto.nutzer.id ? String(konto.nutzer.id) : "lokal");

/* ======================================================================
   Kanal A: Übungstools melden hier. Absichtlich ohne React, ohne Ausnahmen nach außen:
   Das Fehlergedächtnis darf eine Übung nie kaputt machen.
   a = Aufgabe der Trainingsseite (trainingDaten.js), r = Ergebnis von pruefeAntwort, eingabe = Rohtext/Wahl
   ====================================================================== */
export function digitalMelden(nutzerId, a, r, eingabe, zeit = Date.now()) {
  try {
    if (!a || !r || r.leer || r.ungueltig) return;                          // Eingabefehler sind keine Rechenfehler
    const testet = (a.fuer || []).filter((t) => FEHLERTYPEN_TAX[t]);
    const kontext = KONTEXT_AUS_THEMA[a.thema] || "allgemein";
    const schwierigkeit = Number(a.afb) || 2;
    perfAendern((Pm) => {
      meldeAufgabe(Pm, { nutzerId, id: `train:${a.id}`, zeit, testet, kontext, schwierigkeit, ok: !!r.ok, fehlerTyp: !r.ok && r.typ ? r.typ : null }, zeit);
      /* Nur belegte Fehler: r.typ kommt aus einer typischen Fehlantwort, die der Aufgabengenerator selbst berechnet hat */
      if (!r.ok && r.typ && FEHLERTYPEN_TAX[r.typ]) {
        const schritt = a.typ === "wahl" ? `Auswahl: Option ${Number(eingabe) + 1}` : String(eingabe ?? "");
        meldeFehler(Pm, {
          nutzerId, quelle: "digital", zeit, schritt: schritt || "(leer)", korrekt: a.typ === "wahl" ? "" : String(a.wert ?? ""),
          typ: r.typ, untertyp: "allgemein", eingabeStatus: "gueltig", typSicher: true,
          beobachtung: `Antwort „${schritt}“ bei: ${String(a.text || "").slice(0, 160)}`,
          pruefung: "Die Antwort stimmt mit einer typischen Fehlantwort dieser Aufgabe überein (vom Aufgabengenerator berechnet).",
          aufgabe: { id: `train:${a.id}`, text: String(a.text || "").slice(0, 280), kontext, schwierigkeit },
          ursprung: { art: "aufgabe", ref: `train:${a.id}` },
        }, zeit);
      }
    });
  } catch (e) { /* Übung läuft weiter */ }
}
