/* ======================================================================
   Gespeicherte Arbeitsblätter (Lehrer-Arbeitsblatt-Generator)
   Mit Konto in Supabase (supabase/arbeitsblatt.sql, nur eigene Zeilen),
   im Vorschau-Modus ohne Supabase (DEMO) auf dem Gerät.
   Dazu: Blattkopf (Schule, Lehrkraft, Klasse) und Einstellungen merken,
   damit die Lehrkraft beim nächsten Mal nicht alles neu eintippt.
   ====================================================================== */
import { DEMO, sb } from "./konto.js";

const LOKAL = "matheplus-arbeitsblaetter";
const EINSTELLUNG = "matheplus-arbeitsblatt";
const lies = (k, s) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? s; } catch (e) { return s; } };
const schreib = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat */ } };

export const einstellungLesen = () => lies(EINSTELLUNG, {});
export const einstellungSchreiben = (v) => schreib(EINSTELLUNG, v);

export async function blaetterLaden() {
  if (DEMO) return lies(LOKAL, []);
  const { data, error } = await sb.from("arbeitsblaetter").select("id, titel, daten, erstellt").order("erstellt", { ascending: false }).limit(60);
  if (error) throw new Error("Ihre gespeicherten Blätter ließen sich gerade nicht laden.");
  return data || [];
}

export async function blattSpeichern(snap) {
  const titel = String(snap.titel || "Arbeitsblatt").slice(0, 120) || "Arbeitsblatt";
  if (DEMO) {
    const eintrag = { id: `lokal-${Date.now().toString(36)}`, titel, daten: snap, erstellt: new Date().toISOString() };
    schreib(LOKAL, [eintrag, ...lies(LOKAL, [])].slice(0, 60));
    return eintrag;
  }
  const { data, error } = await sb.from("arbeitsblaetter").insert({ titel, daten: snap }).select("id, titel, daten, erstellt").single();
  if (error) throw new Error(/ab_grenze/.test(error.message || "") ? "Sie haben schon 200 Blätter gespeichert. Löschen Sie ein altes, dann klappt es wieder." : "Das Blatt ließ sich gerade nicht speichern.");
  return data;
}

export async function blattLoeschen(id) {
  if (DEMO || String(id).startsWith("lokal-")) { schreib(LOKAL, lies(LOKAL, []).filter((b) => b.id !== id)); return; }
  const { error } = await sb.from("arbeitsblaetter").delete().eq("id", id);
  if (error) throw new Error("Das Blatt ließ sich gerade nicht löschen.");
}
