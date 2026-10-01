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

/* ---------- Empfehlungslink: mythosmathe.de/2+5=7 ----------
   Jeder Schüler bekommt eine eigene, richtige Gleichung als Code. Ruft jemand
   den Link auf, merkt sich die Seite die Gleichung, bis er sich anmeldet. */
export const GLEICHUNG = /^(\d{1,3})([+-])(\d{1,3})=(\d{1,4})$/;
export function istRefGleichung(t) {
  const m = GLEICHUNG.exec(t);
  if (!m) return false;
  const [a, op, b, c] = [Number(m[1]), m[2], Number(m[3]), Number(m[4])];
  return (op === "+" ? a + b : a - b) === c;
}
export function refAusUrlMerken() {
  try {
    const u = new URL(window.location.href);
    let code = null;
    const pfad = decodeURIComponent(u.pathname.slice(1)).replace(/\s+/g, "").replace(/[−–]/g, "-");
    if (istRefGleichung(pfad)) code = pfad;
    const alt = u.searchParams.get("ref");               // ältere Links ?ref=…
    if (!code && alt) code = alt.replace(/ /g, "+");   // „+“ wird in Query-Strings zu Leerzeichen
    if (code) {
      schreib(REF_SPEICHER, { code, zeit: Date.now() });
      u.searchParams.delete("ref");
      window.history.replaceState({}, "", "/" + (u.search ? u.search : "") + u.hash);
    }
  } catch (e) { /* ignorieren */ }
}
const gemerkterRef = () => {
  const r = lies(REF_SPEICHER);
  return r && Date.now() - r.zeit < 30 * 24 * 3600 * 1000 ? r.code : null;
};

export const empfehlungsLink = (code) => `https://mythosmathe.de/${code}`;

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

const neuerCode = () => {
  const z = () => 2 + Math.floor(Math.random() * 98);
  let a = z(), b = z();
  if (Math.random() < 0.5 || a === b) return `${a}+${b}=${a + b}`;
  if (a < b) [a, b] = [b, a];
  return `${a}-${b}=${a - b}`;
};

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
