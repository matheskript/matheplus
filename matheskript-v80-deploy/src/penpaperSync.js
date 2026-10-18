/* ======================================================================
   penpaperSync.js – gleicht den Fortschritt im Pen-&-Paper-Kurs mit dem Konto ab
   (Supabase-Tabelle public.penpaper_fortschritt, siehe supabase/penpaper.sql).
   Gleiche Logik wie entdeckenSync.js: Browser-Speicher bleibt die schnelle Quelle, das Konto
   sichert zusätzlich und führt Geräte zusammen (penpaperMerge.js). Ohne die Tabelle läuft alles lokal.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { darfImKonto } from "./einwilligungLogik.js";
import { useSyncExternalStore } from "react";
import { erzeugeSync } from "./lernSync.js";
import { mergePenPaper, penpaperAnwenden, penpaperLeer, penpaperSnapshot, penpaperSyncHaken } from "./penpaperSpeicher.js";

export const PENPAPER_TABELLE = "penpaper_fortschritt";
export const PENPAPER_OWNER = "mm-penpaper-owner";

export const penpaperSyncOptionen = {
  tabelle: PENPAPER_TABELLE, besitzerSchluessel: PENPAPER_OWNER, merge: mergePenPaper,
  lesen: penpaperSnapshot, anwenden: penpaperAnwenden, leer: penpaperLeer,
};

let S = null;

export async function penpaperSyncStarten() {
  if (S) return S;
  const { sb, DEMO, kontoAbonnieren, kontoZustand, vorAbmelden } = await import("./konto.js");
  let speicher = null;
  try { speicher = window.localStorage; } catch (e) { /* privat */ }
  S = erzeugeSync({ client: DEMO ? null : sb, speicher, ...penpaperSyncOptionen });
  penpaperSyncHaken({ melden: () => S.melden(), ersetzen: () => S.ersetzen() });
  const pruefe = () => {
    const { nutzer: n, profil } = kontoZustand();
    const id = n && !n.demo && profil && darfImKonto(profil) ? n.id : null;
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
export function usePenpaperSyncStatus() {
  return useSyncExternalStore(
    (h) => { let ab = () => {}; const warte = setInterval(() => { if (S) { ab = S.abonnieren(h); clearInterval(warte); h(); } }, 300); return () => { clearInterval(warte); ab(); }; },
    () => (S ? S.zustand() : LEER),
  );
}
