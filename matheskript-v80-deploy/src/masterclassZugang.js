/* ============================================================
   Masterclass-Zugang: persönlicher Link → Freischaltung.

   Ablauf
   1. Teilnehmer öffnet https://mythosmathe.de/masterclass/zugang?z=MC7K2Q9XFAH3
      (middleware.js lässt ihn ohne Seitenpasswort hinein, wenn der Code echt aussieht).
   2. linkAusUrlMerken() merkt sich den Code (localStorage) und nimmt ihn aus der Adresse.
   3. Die Zugangsseite prüft den Code (masterclass_link_pruefen) und begrüßt ihn mit Namen.
   4. Mit Konto: masterclass_einloesen() bindet den Code an das Konto, setzt Pro bis zum
      Kursende (Mathilda ohne Tageslimit) und masterclass_bis im Profil.
      Ohne Konto: Kurs und Videos sind auf diesem Gerät offen; eingelöst wird automatisch
      nach der Anmeldung (autoEinloesen, aufgerufen aus func10.jsx).
   Vorschau-Modus (ohne Supabase): alles lokal, gültig ist jeder Code mit richtigen Prüfzeichen.
   ============================================================ */
import { sb, DEMO, profilNeuLaden } from "./konto.js";
import { tokenNormal, tokenGueltig, tokenAusText, LINK_PFAD } from "./masterclassToken.js";

const LINK = "matheplus-masterclass-link";       // { token, zeit, name?, gruppe?, bis?, geprueft? }
const VORSCHAU = "matheplus-masterclass-vorschau"; // Basti: Kurs ohne Link ansehen (Entwurfs-Passwort)
export const VORSCHAU_PASSWORT = "skript";

const lies = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
const schreib = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat */ } };

const hoerer = new Set();
const melden = () => hoerer.forEach((h) => h());
export const zugangAbonnieren = (fn) => { hoerer.add(fn); return () => hoerer.delete(fn); };

export const gemerkterLink = () => lies(LINK);
export function linkVergessen() { schreib(LINK, null); melden(); }

/* Beim Start der App: Code aus /masterclass/zugang?z=… merken und aus der Adresse nehmen */
export function linkAusUrlMerken() {
  try {
    const u = new URL(window.location.href);
    const z = u.searchParams.get("z");
    if (!z || !u.pathname.replace(/\/+$/, "").toLowerCase().endsWith(LINK_PFAD)) return null;
    const token = tokenNormal(z);
    const alt = lies(LINK);
    if (!alt || alt.token !== token) schreib(LINK, { token, zeit: Date.now() });
    u.searchParams.delete("z");
    window.history.replaceState({}, "", u.pathname + u.search + u.hash);
    return token;
  } catch (e) { return null; }
}

/* Code prüfen. Liefert { gueltig, grund?, name?, gruppe?, bis?, eingeloest? } */
export async function linkPruefen(roh) {
  const token = tokenAusText(roh);
  if (!(await tokenGueltig(token))) return { gueltig: false, grund: "form", token };
  if (DEMO) return { gueltig: true, token, name: null, gruppe: "Masterclass (Vorschau)", bis: null };
  const { data, error } = await sb.rpc("masterclass_link_pruefen", { p_token: token });
  if (error) {
    // Funktion noch nicht eingerichtet (masterclass.sql fehlt): Form genügt vorerst
    if (/function|does not exist|schema cache/i.test(error.message || "")) return { gueltig: true, token, ungeprueft: true };
    return { gueltig: false, grund: "netz", token };
  }
  return { token, ...(data || { gueltig: false, grund: "unbekannt" }) };
}

/* Geprüften Code auf diesem Gerät merken (Kurs ist damit offen) */
export function linkSpeichern(pruefung) {
  if (!pruefung || !pruefung.gueltig) return;
  schreib(LINK, { token: pruefung.token, zeit: Date.now(), name: pruefung.name || null, gruppe: pruefung.gruppe || null,
    bis: pruefung.bis || null, geprueft: true, eingeloest: !!pruefung.eingeloest_hier });
  melden();
}

/* Code an das angemeldete Konto binden */
export async function einloesen(roh) {
  const token = tokenAusText(roh);
  if (DEMO) {
    if (!(await tokenGueltig(token))) throw new Error("Dieser Code ist nicht gültig.");
    const alt = lies(LINK) || {};
    schreib(LINK, { ...alt, token, zeit: Date.now(), geprueft: true, eingeloest: true });
    melden();
    return { ok: true };
  }
  const { data, error } = await sb.rpc("masterclass_einloesen", { p_token: token });
  if (error) throw new Error(FEHLER[(error.message || "").match(/mc_[a-z_]+/)?.[0]] || "Das Einlösen hat nicht geklappt. Bitte versuch es noch einmal.");
  const alt = lies(LINK) || {};
  schreib(LINK, { ...alt, token, zeit: Date.now(), geprueft: true, eingeloest: true, name: data?.name ?? alt.name ?? null, gruppe: data?.gruppe ?? alt.gruppe ?? null, bis: data?.bis ?? alt.bis ?? null });
  await profilNeuLaden();
  melden();
  return data;
}

export const FEHLER = {
  mc_unbekannt: "Diesen Code gibt es nicht. Prüf bitte den Link aus deiner Nachricht.",
  mc_gesperrt: "Dieser Zugang ist gesperrt. Melde dich bitte bei Basti.",
  mc_abgelaufen: "Dieser Zugang ist abgelaufen.",
  mc_vergeben: "Dieser Code ist schon mit einem anderen Konto verbunden. Jeder Teilnehmer hat seinen eigenen Link.",
  mc_nicht_angemeldet: "Bitte melde dich zuerst an.",
};

/* Nach der Anmeldung automatisch einlösen (einmal je Sitzung und Code) */
let versucht = null;
export async function autoEinloesen(konto) {
  const l = lies(LINK);
  if (!l || !l.token || l.eingeloest || !konto || !konto.nutzer || !konto.profil) return null;
  if (konto.profil.masterclass_bis && new Date(konto.profil.masterclass_bis) > new Date()) return null;
  if (versucht === l.token) return null;
  versucht = l.token;
  try { return await einloesen(l.token); } catch (e) { return { fehler: e.message }; }
}

/* Vorschau für Basti */
export const vorschauAn = () => { try { return sessionStorage.getItem(VORSCHAU) === "1"; } catch (e) { return false; } };
export function vorschauSetzen(an) { try { an ? sessionStorage.setItem(VORSCHAU, "1") : sessionStorage.removeItem(VORSCHAU); } catch (e) { /* privat */ } melden(); }

/* Gesamtstatus für die Oberfläche */
export function masterclassStatus(konto, jetzt = new Date()) {
  const p = konto && konto.profil;
  const l = lies(LINK);
  const imKonto = !!(p && p.masterclass_bis && new Date(p.masterclass_bis) > jetzt);
  const linkOffen = !!(l && l.geprueft && (!l.bis || new Date(l.bis) > jetzt));
  const vorschau = vorschauAn();
  return {
    offen: imKonto || linkOffen || vorschau,
    imKonto,
    linkOffen,
    vorschau: vorschau && !imKonto && !linkOffen,
    angemeldet: !!(konto && konto.nutzer),
    name: (l && l.name) || (p && p.name) || null,
    gruppe: (p && p.masterclass_gruppe) || (l && l.gruppe) || null,
    bis: (p && p.masterclass_bis) || (l && l.bis) || null,
    token: l ? l.token : null,
    wartetAufEinloesen: !!(l && l.geprueft && !l.eingeloest && !imKonto),
    pro: !!(p && p.plan === "pro" && (!p.pro_bis || new Date(p.pro_bis) > jetzt)),
  };
}
