/* ======================================================================
   trainingAuftraege.js – Aufträge von Coach/Lehrkraft im Tagesplan (supabase/training.sql) und der
   Freigabe-Schalter des Schülers. Ohne Supabase (Vorschau) oder im Test-Account läuft alles lokal im Browser.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { sb, DEMO, kontoZustand } from "./konto.js";

const SPEICHER = "mm-training-auftraege";
const FEHLER = "Das hat nicht geklappt. Bitte versuch es noch einmal.";
const lies = () => { try { return JSON.parse(localStorage.getItem(SPEICHER)) || { auftraege: [], freigabe: false }; } catch (e) { return { auftraege: [], freigabe: false }; } };
const schreib = (v) => { try { localStorage.setItem(SPEICHER, JSON.stringify(v)); } catch (e) { /* privat */ } };
const lokal = () => DEMO || !!(kontoZustand().nutzer && kontoZustand().nutzer.demo);
const FEHLT = /42883|PGRST202|does not exist|schema cache|not find the function/i;

async function rpc(name, args) {
  const { data, error } = await sb.rpc(name, args);
  if (error) { const e = new Error(FEHLER); e.fehlt = FEHLT.test(`${error.code || ""} ${error.message || ""}`); e.roh = error; throw e; }
  return data;
}

/* Aufträge des angemeldeten Schülers: [{ id, titel, zeile, ziel, faellig, erstellt, erledigt, absender, rolle }] */
export async function meineAuftraege() {
  if (lokal()) return lies().auftraege;
  if (!kontoZustand().nutzer) return [];
  try { return (await rpc("meine_auftraege")) || []; }
  catch (e) { if (e.fehlt) return []; throw e; }
}

export async function auftragErledigt(id, zurueck = false) {
  if (lokal()) {
    const d = lies();
    d.auftraege = d.auftraege.map((a) => (a.id === id ? { ...a, erledigt: zurueck ? null : new Date().toISOString() } : a));
    schreib(d);
    return true;
  }
  return rpc("auftrag_erledigt", { aid: id, zurueck });
}

/* Coach/Lehrkraft legt einen Eintrag in den Plan eines Schülers. ziel: { ansicht, … } oder null. */
export async function auftragGeben(schuelerId, { titel, zeile = "", ziel = null, faellig = null }) {
  const t = String(titel || "").trim();
  if (!t) throw new Error("Bitte gib dem Auftrag einen Titel.");
  if (lokal()) {
    const d = lies();
    const me = kontoZustand().profil || {};
    d.auftraege.unshift({ id: `a${Date.now().toString(36)}`, schueler_id: schuelerId, titel: t.slice(0, 120), zeile: String(zeile || "").slice(0, 200), ziel, faellig, erstellt: new Date().toISOString(), erledigt: null, absender: me.name || "Vorschau", rolle: me.rolle || "nachhilfe" });
    schreib(d);
    return { status: "ok" };
  }
  const r = await rpc("auftrag_geben", { schueler: schuelerId, titel: t, zeile, ziel, faellig });
  if (r && r.status === "keine_freigabe") throw new Error("Dieser Schüler hat Einträge durch die Lehrkraft nicht freigegeben.");
  if (r && r.status === "nicht_verbunden") throw new Error("Du bist mit diesem Schüler nicht verbunden.");
  if (r && r.status === "zu_viele") throw new Error("Höchstens zehn offene Aufträge je Schüler.");
  if (!r || r.status !== "ok") throw new Error(FEHLER);
  return r;
}
export async function auftraegeFuer(schuelerId) {
  if (lokal()) return lies().auftraege.filter((a) => a.schueler_id === schuelerId);
  try { return (await rpc("auftraege_fuer", { schueler: schuelerId })) || []; }
  catch (e) { if (e.fehlt) return []; throw e; }
}
export async function auftragLoeschen(id) {
  if (lokal()) { const d = lies(); d.auftraege = d.auftraege.filter((a) => a.id !== id); schreib(d); return true; }
  return rpc("auftrag_loeschen", { aid: id });
}

/* Schalter: Darf die Lehrkraft Einträge in meinen Plan legen? */
export async function lehrerFreigeben(erlaubt) {
  if (lokal()) { const d = lies(); d.freigabe = !!erlaubt; schreib(d); return !!erlaubt; }
  return rpc("lehrer_freigeben", { erlaubt: !!erlaubt });
}
export async function lehrerFreigabe() {
  if (lokal()) return lies().freigabe;
  if (!kontoZustand().nutzer) return false;
  try { return !!(await rpc("lehrer_freigabe")); }
  catch (e) { if (e.fehlt) return false; throw e; }
}
