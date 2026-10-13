/* ======================================================================
   entdeckenSync.js – gleicht den Fortschritt in „Mathe entdecken“ mit dem Konto ab
   (Supabase-Tabelle public.entdecken_fortschritt, siehe supabase/entdecken.sql).

   Gleiche Logik wie beim Lernstand (lernSync.js → erzeugeSync): Der Browser-Speicher bleibt die
   schnelle Quelle, das Konto sichert zusätzlich und führt Geräte zusammen (entdeckenMerge.js).
   Fremdes Konto auf demselben Gerät: kein Übernehmen, kein Hochladen. Beim Abmelden wird zuerst
   gesichert und danach der lokale Stand geleert. Ohne die Tabelle läuft alles lokal weiter.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { useSyncExternalStore } from "react";
import { erzeugeSync } from "./lernSync.js";
import { mergeEntdecken } from "./entdeckenMerge.js";
import { entdeckenAnwenden, entdeckenLeer, entdeckenSnapshot, entdeckenSyncHaken } from "./entdeckenSpeicher.js";

export const ENTDECKEN_TABELLE = "entdecken_fortschritt";
export const ENTDECKEN_OWNER = "mm-entdecken-owner";

export const entdeckenSyncOptionen = {
  tabelle: ENTDECKEN_TABELLE, besitzerSchluessel: ENTDECKEN_OWNER, merge: mergeEntdecken,
  lesen: entdeckenSnapshot, anwenden: entdeckenAnwenden, leer: entdeckenLeer,
};

let S = null;

/* Einmal beim Start der App aufrufen (neben syncStarten für den Lernstand). */
export async function entdeckenSyncStarten() {
  if (S) return S;
  const { sb, DEMO, kontoAbonnieren, kontoZustand, vorAbmelden } = await import("./konto.js");
  let speicher = null;
  try { speicher = window.localStorage; } catch (e) { /* privat */ }
  S = erzeugeSync({ client: DEMO ? null : sb, speicher, ...entdeckenSyncOptionen });
  entdeckenSyncHaken({ melden: () => S.melden(), ersetzen: () => S.ersetzen() });
  const pruefe = () => {
    const n = kontoZustand().nutzer;
    const id = n && !n.demo ? n.id : null;
    if (id && id !== S.zustand().nutzerId) S.anmelden(id);
    else if (!id && S.zustand().nutzerId) S.abgemeldet();
  };
  kontoAbonnieren(pruefe);
  vorAbmelden.push(() => S.vorAbmelden());
  try { document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") S.flush(); }); } catch (e) { /* kein Browser */ }
  pruefe();
  return S;
}

const LEER = { status: "lokal", zuletzt: null, nutzerId: null, fehler: "" };
export function useEntdeckenSyncStatus() {
  return useSyncExternalStore(
    (h) => { let ab = () => {}; const warte = setInterval(() => { if (S) { ab = S.abonnieren(h); clearInterval(warte); h(); } }, 300); return () => { clearInterval(warte); ab(); }; },
    () => (S ? S.zustand() : LEER),
  );
}
