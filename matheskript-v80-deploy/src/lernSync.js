/* ======================================================================
   lernSync.js – gleicht den Lernstand mit dem Konto (Supabase-Tabelle public.lernstand) ab.

   Grundsatz: Der Browser-Speicher bleibt die schnelle, immer verfügbare Quelle (die App
   funktioniert auch offline und ohne Konto). Ist ein Konto angemeldet, wird dieser Stand
   zusätzlich im Konto gesichert und beim Anmelden auf jedem Gerät zusammengeführt
   (lernMerge.js) – es geht nichts verloren, auch nicht bei Nutzung auf mehreren Geräten.

   Besitzer: Auf dem Gerät steht, zu welchem Konto der lokale Lernstand gehört. Meldet sich ein
   ANDERES Konto an, wird der fremde lokale Stand nicht übernommen und nicht hochgeladen;
   stattdessen wird der Stand des anmeldenden Kontos geladen (oder leer gestartet).
   Beim Abmelden wird zuerst gesichert; war das erfolgreich, wird der lokale Stand geleert.

   Zustände: lokal (kein Konto-Speicher) · aus (nicht angemeldet) · verbinde · ok · ausstehend ·
   nicht-eingerichtet (SQL noch nicht ausgeführt) · fehler.
   Die Fabrik ist allgemein: tabelle, besitzerSchluessel und merge sind austauschbar (Standard = Lernstand);
   entdeckenSync.js nutzt sie für „Mathe entdecken“.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { useSyncExternalStore } from "react";
import { mergeLernstand } from "./lernMerge.js";

export const TABELLE = "lernstand";
export const OWNER_SCHLUESSEL = "mm-lern-owner";
const MAX_ZEICHEN = 900000;

const FEHLT = /42P01|PGRST205|does not exist|schema cache|relation .* not found/i;

/* Fabrik – mit eingesetztem Client testbar. client: Supabase-Client oder null (dann nur lokal).
   speicher: localStorage-ähnlich. lesen(): aktueller Stand. anwenden(snap): Stand setzen und lokal sichern. leer(): leerer Stand. */
export function erzeugeSync({ client, speicher, lesen, anwenden, leer, verzoegerung = 3000, uhr = () => Date.now(),
  tabelle = TABELLE, besitzerSchluessel = OWNER_SCHLUESSEL, merge = mergeLernstand }) {
  let st = { status: client ? "aus" : "lokal", zuletzt: null, nutzerId: null, fehler: "" };
  const hoerer = new Set();
  const setze = (t) => { st = { ...st, ...t }; hoerer.forEach((h) => h()); };
  let timer = null, laufend = null, nochmal = false, ersetzen = false;
  const json = (o) => JSON.stringify(o);

  const besitzer = () => { try { return (speicher && speicher.getItem(besitzerSchluessel)) || ""; } catch (e) { return ""; } };
  const setzeBesitzer = (v) => { try { if (!speicher) return; v ? speicher.setItem(besitzerSchluessel, v) : speicher.removeItem(besitzerSchluessel); } catch (e) { /* privat */ } };
  const fehlerStatus = (err) => (FEHLT.test(`${err.code || ""} ${err.message || ""}`) ? "nicht-eingerichtet" : "fehler");

  async function abgleich(erster) {
    const id = st.nutzerId;
    if (!client || !id) return false;
    if (erster) setze({ status: "verbinde", fehler: "" });
    let r;
    try {
      r = await client.from(tabelle).select("daten,geaendert").eq("nutzer_id", id).maybeSingle();
    } catch (e) { setze({ status: "fehler", fehler: String(e && e.message || e) }); return false; }
    if (r.error) { setze({ status: fehlerStatus(r.error), fehler: r.error.message || "" }); return false; }
    const remote = r.data ? r.data.daten : null;
    const lokal = lesen();
    const fremd = erster && besitzer() && besitzer() !== id;       // lokaler Stand gehört einem anderen Konto
    const ersetzt = ersetzen && !erster; ersetzen = false;
    const ziel = ersetzt ? lokal : fremd ? (remote || leer()) : remote ? merge(lokal, remote) : lokal;
    if (json(ziel) !== json(lokal)) anwenden(ziel);
    setzeBesitzer(id);
    if (!remote || json(ziel) !== json(remote)) {
      if (json(ziel).length > MAX_ZEICHEN) { setze({ status: "fehler", fehler: "Lernstand zu groß zum Speichern." }); return false; }
      let p;
      try { p = await client.from(tabelle).upsert({ nutzer_id: id, daten: ziel, version: 1 }, { onConflict: "nutzer_id" }); }
      catch (e) { setze({ status: "fehler", fehler: String(e && e.message || e) }); return false; }
      if (p.error) { setze({ status: fehlerStatus(p.error), fehler: p.error.message || "" }); return false; }
    }
    setze({ status: "ok", zuletzt: uhr(), fehler: "" });
    return true;
  }

  /* Läuft nie doppelt: kommt währenddessen eine Änderung, folgt danach ein weiterer Durchlauf. */
  async function sync(erster = false) {
    if (laufend) { nochmal = true; return laufend; }
    laufend = (async () => {
      try { return await abgleich(erster); }
      finally { laufend = null; if (nochmal) { nochmal = false; sync(false); } }
    })();
    return laufend;
  }

  return {
    zustand: () => st,
    abonnieren: (h) => { hoerer.add(h); return () => hoerer.delete(h); },
    /* Konto angemeldet (oder gewechselt): abgleichen */
    async anmelden(id) { clearTimeout(timer); setze({ nutzerId: id }); return sync(true); },
    abgemeldet() { clearTimeout(timer); setze({ nutzerId: null, status: client ? "aus" : "lokal", fehler: "" }); },
    /* Lokale Änderung: kurz warten (mehrere Änderungen zusammenfassen), dann sichern */
    melden() {
      if (!client || !st.nutzerId) return;
      if (st.status === "nicht-eingerichtet") return;
      setze({ status: "ausstehend" });
      clearTimeout(timer);
      timer = setTimeout(() => { sync(false); }, verzoegerung);
    },
    /* Bewusstes Löschen/Zurücksetzen: der lokale Stand ersetzt den Konto-Stand (kein Zusammenführen, sonst käme Gelöschtes zurück) */
    ersetzen() { ersetzen = true; this.melden(); },
    async flush() { clearTimeout(timer); if (laufend) await laufend; if (st.nutzerId && st.status === "ausstehend") await sync(false); if (laufend) await laufend; return st.status === "ok"; },
    /* Vor dem Abmelden: sichern; war das erfolgreich, den lokalen Stand leeren (geteilte Geräte). */
    async vorAbmelden() {
      if (!client || !st.nutzerId) return;
      clearTimeout(timer);
      if (laufend) await laufend;
      const ok = await sync(false);
      if (ok) { anwenden(leer()); setzeBesitzer(""); }
    },
  };
}

/* ---------- Betrieb in der App ---------- */
let S = null;

/* Einmal beim Start (nach dem lokalen Laden) aufrufen. api: { lesen, anwenden, leer } aus func6.jsx */
export async function syncStarten(api) {
  if (S) return S;
  const { sb, DEMO, kontoAbonnieren, kontoZustand, vorAbmelden } = await import("./konto.js");
  let speicher = null;
  try { speicher = window.localStorage; } catch (e) { /* privat */ }
  S = erzeugeSync({ client: DEMO ? null : sb, speicher, ...api });
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
export const syncErsetzen = () => { if (S) S.ersetzen(); };
export const syncMelden = () => { if (S) S.melden(); };

const LEER = { status: "lokal", zuletzt: null, nutzerId: null, fehler: "" };
export function useSyncStatus() {
  return useSyncExternalStore(
    (h) => { let ab = () => {}; const warte = setInterval(() => { if (S) { ab = S.abonnieren(h); clearInterval(warte); h(); } }, 300); return () => { clearInterval(warte); ab(); }; },
    () => (S ? S.zustand() : LEER),
  );
}
