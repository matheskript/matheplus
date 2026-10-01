/* ======================================================================
   KONTO: Anmeldung (Google, Facebook), Profil und Empfehlungslink.
   Backend: Supabase (Auth + Tabelle public.profile, siehe supabase/schema.sql).
   Ohne VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY läuft ein Demo-Modus,
   der alles nur lokal im Browser speichert — so lässt sich die Oberfläche
   schon testen, bevor die Anmeldung eingerichtet ist.
   ====================================================================== */
import { useSyncExternalStore } from "react";
import { createClient } from "@supabase/supabase-js";

const URL_ = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const sb = URL_ && KEY ? createClient(URL_, KEY, { auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true } }) : null;
export const DEMO = !sb;

const REF_SPEICHER = "mm-werber";
const DEMO_SPEICHER = "mm-demo-konto";

const lies = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
const schreib = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat */ } };

/* ---------- kleiner Store für React ---------- */
let zustand = { geladen: false, nutzer: null, profil: null, geworben: 0, fehler: "" };
const hoerer = new Set();
const setzen = (teil) => { zustand = { ...zustand, ...teil }; hoerer.forEach((h) => h()); };
export function useKonto() {
  return useSyncExternalStore((h) => { hoerer.add(h); return () => hoerer.delete(h); }, () => zustand);
}

/* ---------- Empfehlungslink: ?ref=CODE merken, bis sich jemand anmeldet ---------- */
export function refAusUrlMerken() {
  try {
    const u = new URL(window.location.href);
    const ref = u.searchParams.get("ref");
    if (ref && /^[a-z0-9]{4,16}$/i.test(ref)) {
      schreib(REF_SPEICHER, { code: ref.toLowerCase(), zeit: Date.now() });
      u.searchParams.delete("ref");
      window.history.replaceState({}, "", u.pathname + (u.search ? u.search : "") + u.hash);
    }
  } catch (e) { /* ignorieren */ }
}
const gemerkterRef = () => {
  const r = lies(REF_SPEICHER);
  return r && Date.now() - r.zeit < 30 * 24 * 3600 * 1000 ? r.code : null;
};

export const empfehlungsLink = (code) => `https://mythosmathe.de/?ref=${code}`;

/* ---------- Laden ---------- */
async function profilLaden(nutzer) {
  if (!nutzer) { setzen({ geladen: true, nutzer: null, profil: null, geworben: 0 }); return; }
  if (DEMO) {
    const d = lies(DEMO_SPEICHER);
    setzen({ geladen: true, nutzer, profil: d?.profil || null, geworben: 0 });
    return;
  }
  const { data, error } = await sb.from("profile").select("*").eq("id", nutzer.id).maybeSingle();
  if (error) { setzen({ geladen: true, nutzer, fehler: "Dein Profil konnte nicht geladen werden." }); return; }
  let geworben = 0;
  if (data) {
    const r = await sb.rpc("anzahl_geworben");
    if (!r.error) geworben = r.data || 0;
  }
  setzen({ geladen: true, nutzer, profil: data || null, geworben, fehler: "" });
}

export function kontoStarten() {
  refAusUrlMerken();
  if (DEMO) {
    const d = lies(DEMO_SPEICHER);
    profilLaden(d?.nutzer || null);
    return;
  }
  sb.auth.getSession().then(({ data }) => profilLaden(data.session?.user || null));
  sb.auth.onAuthStateChange((_e, sitzung) => { profilLaden(sitzung?.user || null); });
}

/* ---------- Aktionen ---------- */
export async function anmelden(anbieter) {
  if (DEMO) {
    const nutzer = { id: "demo", email: anbieter === "google" ? "demo@gmail.com" : "demo@facebook.com", user_metadata: { full_name: "" }, demo: true };
    schreib(DEMO_SPEICHER, { nutzer, profil: null });
    profilLaden(nutzer);
    return;
  }
  const { error } = await sb.auth.signInWithOAuth({
    provider: anbieter,
    options: { redirectTo: `${window.location.origin}/?konto=1` },
  });
  if (error) setzen({ fehler: "Die Anmeldung konnte nicht gestartet werden." });
}

export async function abmelden() {
  if (DEMO) { schreib(DEMO_SPEICHER, null); profilLaden(null); return; }
  await sb.auth.signOut();
  profilLaden(null);
}

const neuerCode = () => Math.random().toString(36).slice(2, 10);

/* Legt das Profil beim ersten Mal an (nur der Name ist Pflicht) und verknüpft den Werber. */
export async function profilAnlegen(name) {
  const n = name.trim();
  if (!n) throw new Error("Bitte gib deinen Namen ein.");
  if (DEMO) {
    const profil = { id: "demo", name: n, schulform: null, klasse: null, noten: {}, ref_code: neuerCode(), geworben_von: gemerkterRef() ? "demo-werber" : null };
    schreib(DEMO_SPEICHER, { nutzer: zustand.nutzer, profil });
    schreib(REF_SPEICHER, null);
    setzen({ profil });
    return;
  }
  const { error } = await sb.from("profile").insert({ id: zustand.nutzer.id, name: n });
  if (error) throw new Error("Das Profil konnte nicht angelegt werden.");
  const ref = gemerkterRef();
  if (ref) { await sb.rpc("werber_setzen", { code: ref }); schreib(REF_SPEICHER, null); }
  await profilLaden(zustand.nutzer);
}

export async function profilSpeichern(aenderung) {
  const erlaubt = {};
  ["name", "schulform", "klasse", "noten"].forEach((k) => { if (k in aenderung) erlaubt[k] = aenderung[k]; });
  if ("name" in erlaubt && !String(erlaubt.name).trim()) throw new Error("Der Name darf nicht leer sein.");
  if (DEMO) {
    const profil = { ...zustand.profil, ...erlaubt };
    schreib(DEMO_SPEICHER, { nutzer: zustand.nutzer, profil });
    setzen({ profil });
    return;
  }
  const { error } = await sb.from("profile").update(erlaubt).eq("id", zustand.nutzer.id);
  if (error) throw new Error("Speichern hat nicht geklappt. Bitte versuch es noch einmal.");
  setzen({ profil: { ...zustand.profil, ...erlaubt } });
}
