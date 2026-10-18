/* ======================================================================
   KONTO: Anmeldung (Google, Facebook), Profil und Empfehlungslink.
   Backend: Supabase (Auth + Tabelle public.profile, siehe supabase/schema.sql).
   Ohne VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY läuft ein Demo-Modus,
   der alles nur lokal im Browser speichert — so lässt sich die Oberfläche
   schon testen, bevor die Anmeldung eingerichtet ist.
   ====================================================================== */
import { FR } from "./funcRegistry.jsx";
import { useSyncExternalStore } from "react";
import { createClient } from "@supabase/supabase-js";
import { einladungAusUrl, istGeschlecht } from "./rollenLogik.js";
import { einwilligungsFehler } from "./einwilligungLogik.js";

const URL_ = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const sb = URL_ && KEY ? createClient(URL_, KEY, { auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true } }) : null;
export const DEMO = !sb;

const REF_SPEICHER = "mm-werber";
const DEMO_SPEICHER = "mm-demo-konto";
const EINLADUNG_SPEICHER = "mm-einladung";

const lies = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
const schreib = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat */ } };

/* ---------- kleiner Store für React ---------- */
let zustand = { geladen: false, nutzer: null, profil: null, geworben: 0, fehler: "", hinweis: "" };
const hoerer = new Set();
const setzen = (teil) => { zustand = { ...zustand, ...teil }; hoerer.forEach((h) => h()); };
/* Für den Lernstand-Abgleich (lernSync.js): Zustand lesen, Änderungen abonnieren, vor dem Abmelden noch sichern */
export const kontoZustand = () => zustand;
FR.kontoAngemeldet = () => !!zustand.nutzer;   // für aktivitaetMelden (func8.jsx): Tageswerte auch ohne Lernprofil
export const kontoAbonnieren = (fn) => { hoerer.add(fn); return () => hoerer.delete(fn); };
export const vorAbmelden = [];
export function useKonto() {
  return useSyncExternalStore((h) => { hoerer.add(h); return () => hoerer.delete(h); }, () => zustand);
}

/* ---------- Empfehlungslink: matheplus-scls.vercel.app/482913 ----------
   Jeder Schüler bekommt eine eigene sechsstellige Zahl als Code – zufällig
   oder selbst gewählt. Ruft jemand den Link auf, merkt sich die Seite die Zahl,
   bis er sich anmeldet. */
export const REF_ZAHL = /^[1-9][0-9]{5}$/;
export const istRefCode = (t) => REF_ZAHL.test(String(t));
export function refAusUrlMerken() {
  try {
    const u = new URL(window.location.href);
    let code = null;
    const pfad = decodeURIComponent(u.pathname.slice(1)).replace(/[\s/]+/g, "");
    if (istRefCode(pfad)) code = pfad;
    const alt = (u.searchParams.get("ref") || "").trim();   // ältere Links ?ref=…
    if (!code && istRefCode(alt)) code = alt;
    /* Einladung: ?als=eltern&e=<Token> (Eltern) oder ?klasse=<Code> (Klassenbeitritt) */
    const einl = einladungAusUrl(window.location.href);
    if (einl) schreib(EINLADUNG_SPEICHER, { ...einl, zeit: Date.now() });
    const hatEinl = ["als", "e", "klasse"].some((k) => u.searchParams.has(k));
    if (code) schreib(REF_SPEICHER, { code, zeit: Date.now() });
    if (code || hatEinl) {
      ["ref", "als", "e", "klasse"].forEach((k) => u.searchParams.delete(k));
      window.history.replaceState({}, "", "/" + (u.search ? u.search : "") + u.hash);
    }
  } catch (e) { /* ignorieren */ }
}
/* Gemerkte Einladung (30 Tage): { als, token, klasse } oder null */
export const gemerkteEinladung = () => {
  const r = lies(EINLADUNG_SPEICHER);
  return r && Date.now() - r.zeit < 30 * 24 * 3600 * 1000 ? r : null;
};
export const einladungVergessen = (feld) => {
  const r = lies(EINLADUNG_SPEICHER);
  if (!r) return;
  const n = feld ? { ...r, [feld]: null } : null;
  if (feld === "token") n.als = null;
  schreib(EINLADUNG_SPEICHER, n && (n.als || n.token || n.klasse) ? n : null);
};
const gemerkterRef = () => {
  const r = lies(REF_SPEICHER);
  return r && Date.now() - r.zeit < 30 * 24 * 3600 * 1000 ? r.code : null;
};

/* Basisadresse der Empfehlungslinks = exakter Link der App (zentral, nur hier ändern). */
export const REF_BASIS = "https://matheplus-scls.vercel.app";
export const REF_BASIS_ANZEIGE = REF_BASIS.replace(/^https?:\/\//, "");
export const empfehlungsLink = (code) => `${REF_BASIS}/${code}`;

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
  if (data && (data.rolle || "schueler") === "schueler" && data.unter16 === true) {
    const e = await sb.rpc("meine_einwilligung");   // fehlt einwilligung.sql noch: bleibt leer = nichts freigegeben
    data.einwilligung = !e.error && e.data ? e.data : null;
  }
  let geworben = 0;
  if (data) {
    const r = await sb.rpc("anzahl_geworben");
    if (!r.error) geworben = r.data || 0;
  }
  setzen({ geladen: true, nutzer, profil: data || null, geworben, fehler: "" });
}

export const profilNeuLaden = () => profilLaden(zustand.nutzer);
export const hinweisSchliessen = () => setzen({ hinweis: "" });

export function kontoStarten() {
  refAusUrlMerken();
  if (DEMO) {
    const d = lies(DEMO_SPEICHER);
    profilLaden(d?.nutzer || null);
    return;
  }
  sb.auth.getSession().then(({ data }) => { zugang = data.session?.access_token || null; profilLaden(data.session?.user || null); });
  sb.auth.onAuthStateChange((_e, sitzung) => { zugang = sitzung?.access_token || null; profilLaden(sitzung?.user || null); });
}

/* Zugangstoken der angemeldeten Sitzung – geht als Authorization-Kopf an /api/claude (Kontingent je Konto) */
let zugang = null;
export const zugangsToken = () => zugang;
FR.zugangsToken = zugangsToken;

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

/* ---------- E-Mail und Passwort ----------
   (Instagram-Anmeldung gibt es technisch nicht: Meta bietet dafür keine Schnittstelle an.)
   Hinweis: Solange „Confirm email“ in Supabase aus ist, gibt es keine E-Mail-Bestätigung und kein „Passwort vergessen“. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const fehlerText = (m = "") => {
  const t = m.toLowerCase();
  if (t.includes("invalid login")) return "E-Mail oder Passwort stimmt nicht.";
  if (t.includes("already registered") || t.includes("already been registered")) return "Mit dieser E-Mail gibt es schon ein Konto – bitte melde dich an.";
  if (t.includes("password") && (t.includes("least") || t.includes("short") || t.includes("weak"))) return "Das Passwort ist zu kurz oder zu einfach (mindestens 8 Zeichen).";
  if (t.includes("rate") || t.includes("too many")) return "Zu viele Versuche. Bitte warte kurz und versuch es dann noch einmal.";
  if (t.includes("email not confirmed")) return "Die E-Mail-Adresse ist noch nicht bestätigt.";
  return "Das hat nicht geklappt. Bitte versuch es noch einmal.";
};
export async function anmeldenEmail(email, passwort, neu) {
  const mail = String(email || "").trim().toLowerCase();
  if (!EMAIL.test(mail)) throw new Error("Bitte gib eine gültige E-Mail-Adresse ein.");
  if (String(passwort || "").length < 8) throw new Error("Das Passwort braucht mindestens 8 Zeichen.");
  if (DEMO) {
    const alt = lies(DEMO_SPEICHER);
    if (!neu && !(alt && alt.nutzer && alt.nutzer.email === mail)) throw new Error("E-Mail oder Passwort stimmt nicht.");
    const nutzer = { id: "demo", email: mail, user_metadata: {}, demo: true };
    schreib(DEMO_SPEICHER, { nutzer, profil: alt && alt.nutzer && alt.nutzer.email === mail ? alt.profil : null });
    await profilLaden(nutzer);
    return;
  }
  const r = neu ? await sb.auth.signUp({ email: mail, password: passwort }) : await sb.auth.signInWithPassword({ email: mail, password: passwort });
  if (r.error) throw new Error(fehlerText(r.error.message));
  if (neu && !r.data.session) throw new Error("Zum Fertigstellen wird eine Bestätigung per E-Mail verlangt – die ist hier noch nicht eingerichtet.");
}

export async function abmelden() {
  for (const f of vorAbmelden) { try { await f(); } catch (e) { /* Abmelden darf daran nicht scheitern */ } }
  if (DEMO) { schreib(DEMO_SPEICHER, null); profilLaden(null); return; }
  await sb.auth.signOut();
  profilLaden(null);
}

export const neuerCode = () => String(100000 + Math.floor(Math.random() * 900000));

/* Ist die Zahl gültig und noch frei? */
export async function refPruefen(code) {
  if (!istRefCode(code)) return { gueltig: false, frei: false };
  if (DEMO) return { gueltig: true, frei: true };
  const { data, error } = await sb.rpc("ref_frei", { code });
  return { gueltig: true, frei: !error && !!data };
}

/* Legt den Empfehlungslink endgültig fest. */
export async function refFestlegen(code) {
  if (!istRefCode(code)) throw new Error("Bitte eine sechsstellige Zahl wählen.");
  if (DEMO) {
    const profil = { ...zustand.profil, ref_code: code, ref_fest: true };
    schreib(DEMO_SPEICHER, { nutzer: zustand.nutzer, profil });
    setzen({ profil });
    return;
  }
  const { data, error } = await sb.rpc("ref_festlegen", { code });
  if (error) throw new Error("Das hat nicht geklappt. Bitte versuch es noch einmal.");
  if (data === "vergeben") throw new Error("Diese Zahl hat schon jemand anderes – nimm eine andere.");
  if (data === "ungueltig") throw new Error("Bitte eine sechsstellige Zahl wählen.");
  if (data === "schon_fest") throw new Error("Dein Link ist bereits festgelegt.");
  setzen({ profil: { ...zustand.profil, ref_code: code, ref_fest: true } });
}

/* Legt das Profil beim ersten Mal an (Name, Rolle, bei Schüler das Geschlecht) und verknüpft Werber und – bei Eltern – das einladende Kind. */
export async function profilAnlegen(name, rolle = "schueler", geschlecht = null, unter16 = null) {
  const n = name.trim();
  if (!n) throw new Error("Bitte gib deinen Namen ein.");
  if (!["schueler", "eltern", "lehrkraft", "nachhilfe"].includes(rolle)) throw new Error("Bitte wähle aus, wer du bist.");
  if (rolle === "schueler" && !istGeschlecht(geschlecht)) throw new Error("Bitte wähle Schüler oder Schülerin.");
  if (rolle === "schueler" && typeof unter16 !== "boolean") throw new Error("Bitte gib an, ob du schon 16 bist.");
  const g = rolle === "schueler" ? geschlecht : null;
  const einl = gemerkteEinladung();
  const tokenFuerEltern = rolle === "eltern" && einl && einl.token ? einl.token : null;
  if (DEMO) {
    const profil = { id: "demo", name: n, rolle, geschlecht: g, plan: "free", unter16: rolle === "schueler" ? unter16 : null, einwilligung: null, schulform: null, klasse: null, noten: {}, ref_code: neuerCode(), ref_fest: false,
      eltern_token: Array.from({ length: 16 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""),
      geworben_von: gemerkterRef() ? "demo-werber" : null };
    schreib(DEMO_SPEICHER, { nutzer: zustand.nutzer, profil });
    schreib(REF_SPEICHER, null);
    if (tokenFuerEltern) { schreib(EINLADUNG_SPEICHER, null); setzen({ hinweis: "Du bist jetzt mit dem Konto deines Kindes verbunden (Vorschau)." }); }
    setzen({ profil });
    return;
  }
  const { error } = await sb.from("profile").insert({ id: zustand.nutzer.id, name: n, rolle, ...(g ? { geschlecht: g } : {}) });
  if (error) throw new Error("Das Profil konnte nicht angelegt werden.");
  if (rolle === "schueler") await sb.rpc("alter_angeben", { ist_unter16: unter16 });
  const ref = gemerkterRef();
  if (ref) { await sb.rpc("werber_setzen", { code: ref }); schreib(REF_SPEICHER, null); }
  let hinweis = "";
  if (tokenFuerEltern) {
    const r = await sb.rpc("eltern_verbinden", { token: tokenFuerEltern });
    if (!r.error && r.data && (r.data.status === "ok" || r.data.status === "schon")) { hinweis = `Du bist jetzt mit ${r.data.name} verbunden.`; schreib(EINLADUNG_SPEICHER, null); }
    else if (!r.error && r.data && r.data.status === "zu_viele") hinweis = "Dieses Kind hat schon die höchste Zahl an verbundenen Elternteilen.";
    else hinweis = "Der Einladungslink war nicht mehr gültig. Bitte lass dir von deinem Kind einen neuen schicken.";
  }
  await profilLaden(zustand.nutzer);
  if (hinweis) setzen({ hinweis });
}

export async function profilSpeichern(aenderung) {
  const erlaubt = {};
  ["name", "schulform", "klasse", "noten", "geschlecht"].forEach((k) => { if (k in aenderung) erlaubt[k] = aenderung[k]; });
  if ("name" in erlaubt && !String(erlaubt.name).trim()) throw new Error("Der Name darf nicht leer sein.");
  if ("geschlecht" in erlaubt && !istGeschlecht(erlaubt.geschlecht)) throw new Error("Bitte wähle Schüler oder Schülerin.");
  if (DEMO) {
    const p0 = zustand.profil || {};
    if ((p0.rolle || "schueler") === "schueler" && ["schulform", "klasse", "noten"].some((k) => k in erlaubt)
        && !(p0.unter16 === false || (p0.unter16 && p0.einwilligung && p0.einwilligung.konto))) throw new Error(einwilligungsFehler("eltern_einwilligung_fehlt"));
    const profil = { ...zustand.profil, ...erlaubt };
    schreib(DEMO_SPEICHER, { nutzer: zustand.nutzer, profil });
    setzen({ profil });
    return;
  }
  const { error } = await sb.from("profile").update(erlaubt).eq("id", zustand.nutzer.id);
  if (error) throw new Error(einwilligungsFehler(error) || "Speichern hat nicht geklappt. Bitte versuch es noch einmal.");
  setzen({ profil: { ...zustand.profil, ...erlaubt } });
}

/* ---------- Altersangabe und Eltern-Einwilligung (supabase/einwilligung.sql) ---------- */
export async function alterAngeben(unter16) {
  if (DEMO) {
    const d = lies(DEMO_SPEICHER) || {};
    const profil = { ...zustand.profil, unter16, alter_angegeben_am: new Date().toISOString() };
    schreib(DEMO_SPEICHER, { ...d, nutzer: zustand.nutzer, profil });
    setzen({ profil });
    return;
  }
  const { error } = await sb.rpc("alter_angeben", { ist_unter16: unter16 });
  if (error) throw new Error("Das hat nicht geklappt. Ist supabase/einwilligung.sql schon ausgeführt?");
  await profilLaden(zustand.nutzer);
}

/* Nur Vorschau-Modus: Einwilligung im lokalen Demo-Profil ablegen (die Seite /einwilligung nutzt das) */
export function demoEinwilligungSetzen(token, einwilligung) {
  const d = lies(DEMO_SPEICHER);
  if (!d || !d.profil || d.profil.eltern_token !== token) return false;
  d.profil = { ...d.profil, einwilligung };
  schreib(DEMO_SPEICHER, d);
  if (zustand.profil && zustand.profil.eltern_token === token) setzen({ profil: d.profil });
  return true;
}
export function demoProfilZuToken(token) {
  const d = lies(DEMO_SPEICHER);
  return d && d.profil && d.profil.eltern_token === token ? d.profil : null;
}
