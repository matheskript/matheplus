/* ======================================================================
   kontoRollen.js – Aufrufe der Datenbankfunktionen aus supabase/rollen.sql (Eltern ↔ Kind, Klassen, Plan).
   Ohne Supabase-Schlüssel (DEMO) läuft alles lokal mit Beispieldaten, damit sich die Oberfläche testen lässt.
   ====================================================================== */
import { sb, DEMO, kontoZustand, profilNeuLaden, demoEinwilligungSetzen, demoProfilZuToken } from "./konto.js";
import { einwilligungsFehler } from "./einwilligungLogik.js";
import { tagKey } from "./rollenLogik.js";

const lies = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
const schreib = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat */ } };
const FEHLER = "Das hat nicht geklappt. Bitte versuch es noch einmal.";

async function rpc(name, args) {
  const { data, error } = await sb.rpc(name, args);
  if (error) throw new Error(einwilligungsFehler(error) || FEHLER);
  return data;
}

/* ---------- Demo-Daten (nur Vorschau-Modus) ---------- */
const DEMO_SPEICHER = "mm-demo-rollen";
const demoTage = (muster) => {   // muster: Minuten vor 0..13 Tagen (0 = heute)
  const t = {};
  muster.forEach((min, i) => {
    if (!min) return;
    const d = new Date(); d.setDate(d.getDate() - i);
    t[tagKey(d)] = { s: min * 60, a: Math.round(min * 1.2), r: Math.round(min * 0.9) };
  });
  return t;
};
const demoSchueler = (id, name, klasse, muster, entdecken = {}) => ({
  id, name, schulform: "G9", klasse, plan: false, beispiel: true,
  letzte_aktivitaet: (() => { const i = muster.findIndex(Boolean); if (i < 0) return muster.length ? Date.now() - 40 * 86400000 : null; return Date.now() - i * 86400000; })(),
  tage: demoTage(muster),
  entdecken: { potenz_phase: 0, potenz_fertig: false, potenz_schritte: 0, video_haupt: false, reflexion_n: 0, ...entdecken },
});
const DEMO_KINDER = () => [
  demoSchueler("demo-k1", "Lena (Beispiel)", 8, [20, 15, 0, 25, 10, 0, 0, 15], { potenz_phase: 3, potenz_schritte: 9, video_haupt: true, reflexion_n: 3 }),
  demoSchueler("demo-k2", "Paul (Beispiel)", 6, [0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
];
const DEMO_KLASSE = () => ({
  id: "demo-klasse", name: "8a (Beispiel)", art: "schule", schulform: "G9", stufe: 8, code: "BSP8A2",
  schueler: [
    demoSchueler("demo-s1", "Anna Beispiel", 8, [30, 25, 0, 20, 0, 15, 0, 20], { potenz_fertig: true, potenz_phase: 6, video_haupt: true, reflexion_n: 3 }),
    demoSchueler("demo-s2", "Ben Beispiel", 8, [0, 0, 0, 12, 0, 0, 0, 0, 0, 0]),
    demoSchueler("demo-s3", "Clara Beispiel", 8, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20]),
    demoSchueler("demo-s4", "David Beispiel", 8, []),
  ],
});
const demoLesen = () => lies(DEMO_SPEICHER) || { eltern: [], klassen: [], verbunden: false };

/* ---------- Beziehungen ---------- */
export async function meineBeziehungen() {
  if (DEMO) {
    const d = demoLesen();
    return { eltern: d.eltern, kinder: [], klassen: d.klassenBeigetreten || [] };
  }
  return await rpc("meine_beziehungen");
}
export async function meineKinder() {
  if (DEMO) return DEMO_KINDER();
  return (await rpc("meine_kinder")) || [];
}
export async function klassenUebersicht() {
  if (DEMO) {
    const d = demoLesen();
    return [DEMO_KLASSE(), ...(d.eigeneKlassen || [])].sort((a, b) => a.stufe - b.stufe || String(a.name).localeCompare(String(b.name), "de"));
  }
  return (await rpc("klassen_uebersicht")) || [];
}
export async function schuelerDetail(id) {
  if (DEMO) {
    const z = [...DEMO_KINDER(), ...DEMO_KLASSE().schueler].find((s) => s.id === id);
    return z ? { zusammenfassung: z, noten: { 7: 2, 8: 3 }, lernstand: null, entdecken: null } : null;
  }
  return await rpc("schueler_detail", { sid: id });
}

/* ---------- Eltern ---------- */
export async function elternVerbinden(token) {
  if (DEMO) { const d = demoLesen(); schreib(DEMO_SPEICHER, { ...d, verbunden: true }); return { status: "ok", name: "Beispiel-Kind" }; }
  const r = await rpc("eltern_verbinden", { token });
  await profilNeuLaden();
  return r;
}
export async function verbindungLoesen(partnerId) {
  if (DEMO) { const d = demoLesen(); schreib(DEMO_SPEICHER, { ...d, eltern: (d.eltern || []).filter((e) => e.id !== partnerId) }); return true; }
  return await rpc("verbindung_loesen", { partner: partnerId });
}
export async function elternTokenErneuern() {
  if (DEMO) {
    const t = Array.from({ length: 16 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
    const p = { ...kontoZustand().profil, eltern_token: t };
    schreib("mm-demo-konto", { nutzer: kontoZustand().nutzer, profil: p });
    await profilNeuLaden();
    return t;
  }
  const t = await rpc("eltern_token_erneuern");
  await profilNeuLaden();
  return t;
}
/* Nur Vorschau: ein Beispiel-Elternteil, damit die Liste nicht leer bleibt */
export function demoElternHinzufuegen() {
  if (!DEMO) return;
  const d = demoLesen();
  schreib(DEMO_SPEICHER, { ...d, eltern: [{ id: "demo-e1", name: "Mama (Beispiel)", seit: new Date().toISOString() }] });
}

/* ---------- Klassen ---------- */
const DEMO_CODE = /^[A-HJ-NP-Z2-9]{6}$/;
export async function klasseAnlegen(name, schulform, stufe) {
  if (DEMO) {
    const d = demoLesen();
    const code = Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
    const k = { id: "demo-" + Date.now(), name, art: kontoZustand().profil?.rolle === "nachhilfe" ? "nachhilfe" : "schule", schulform, stufe, code, schueler: [] };
    schreib(DEMO_SPEICHER, { ...d, eigeneKlassen: [...(d.eigeneKlassen || []), k] });
    return { status: "ok", id: k.id, code };
  }
  return await rpc("klasse_anlegen", { k_name: name, k_schulform: schulform, k_stufe: stufe });
}
export async function klasseVorschau(code) {
  if (DEMO) return DEMO_CODE.test(code) ? { name: "8a (Beispiel)", art: "schule", schulform: "G9", stufe: 8, lehrkraft: "Frau Beispiel" } : { status: "ungueltig" };
  return await rpc("klasse_vorschau", { k_code: code });
}
export async function klasseBeitreten(code) {
  if (DEMO) {
    const d = demoLesen();
    const k = { id: "demo-klasse-b", name: "8a (Beispiel)", art: "schule", schulform: "G9", stufe: 8, lehrkraft: "Frau Beispiel", seit: new Date().toISOString() };
    schreib(DEMO_SPEICHER, { ...d, klassenBeigetreten: [k] });
    return { status: "ok", name: k.name };
  }
  return await rpc("klasse_beitreten", { k_code: code });
}
export async function klasseVerlassen(id) {
  if (DEMO) { const d = demoLesen(); schreib(DEMO_SPEICHER, { ...d, klassenBeigetreten: [] }); return true; }
  return await rpc("klasse_verlassen", { k_id: id });
}
export async function klasseSchuelerEntfernen(klasseId, schuelerId) {
  if (DEMO) return true;
  return await rpc("klasse_schueler_entfernen", { k_id: klasseId, s_id: schuelerId });
}
export async function klasseLoeschen(id) {
  if (DEMO) { const d = demoLesen(); schreib(DEMO_SPEICHER, { ...d, eigeneKlassen: (d.eigeneKlassen || []).filter((k) => k.id !== id) }); return true; }
  return await rpc("klasse_loeschen", { k_id: id });
}
export async function klasseCodeNeu(id) {
  if (DEMO) return "NEUC0D".replace("0", "K");
  return await rpc("klasse_code_neu", { k_id: id });
}

/* ---------- Rolle und Plan ---------- */
export async function rolleWechseln(rolle) {
  if (DEMO) {
    const p = { ...kontoZustand().profil, rolle };
    schreib("mm-demo-konto", { nutzer: kontoZustand().nutzer, profil: p });
    await profilNeuLaden();
    return true;
  }
  const ok = await rpc("rolle_wechseln", { neue_rolle: rolle });
  await profilNeuLaden();
  return ok;
}
export async function volljaehrigErklaeren() {
  if (DEMO) {
    const p = { ...kontoZustand().profil, volljaehrig_erklaert_am: new Date().toISOString() };
    schreib("mm-demo-konto", { nutzer: kontoZustand().nutzer, profil: p });
    await profilNeuLaden();
    return true;
  }
  const ok = await rpc("volljaehrig_erklaeren");
  await profilNeuLaden();
  return ok;
}

/* ---------- Pro buchen (Stripe über api/stripe/*) ---------- */
export const ANGEBOTE_ANZEIGE = [
  { id: "pro_monat", name: "Pro", preis: "9,90 € / Monat", zeile: "monatlich kündbar", plan: "pro", maxZiele: 1 },
  { id: "pro_jahr", name: "Pro Jahr", preis: "79 € / Jahr", zeile: "zwei Monate geschenkt", plan: "pro", maxZiele: 1, empfohlen: true },
  { id: "familie_monat", name: "Familie", preis: "14,90 € / Monat", zeile: "bis zu drei Kinder", plan: "familie", maxZiele: 3 },
];
export const PRO_ENTHAELT = ["Lernpfad mit Standortcheck und Wochenplan", "Prüfungsmodus und Abi-Ketten", "Meine Fehler üben und Wiederholung im richtigen Moment", "Mathilda ohne Tagesgrenze, Blattanalyse", "Alle Geräte, ein Lernstand"];

async function stripeAufruf(pfad, body) {
  const { zugangsToken } = await import("./konto.js");
  const token = zugangsToken();
  if (!token) throw new Error("Bitte zuerst anmelden.");
  const r = await fetch(pfad, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body || {}) });
  let d = null;
  try { d = await r.json(); } catch (e) { /* keine Antwort */ }
  if (!r.ok || !d || !d.url) throw new Error((d && d.error && d.error.message) || "Die Bezahlung ist gerade nicht erreichbar.");
  return d.url;
}
/* Öffnet Stripe Checkout; ziele = Konto-IDs (Kinder oder das eigene Konto) */
export async function proBuchen(angebot, ziele) {
  if (DEMO) throw new Error("Im Vorschau-Modus ist keine Bezahlung möglich.");
  const url = await stripeAufruf("/api/stripe/checkout", { angebot, ziele });
  window.location.assign(url);
}
export async function aboVerwalten() {
  if (DEMO) throw new Error("Im Vorschau-Modus gibt es kein Kundenportal.");
  window.location.assign(await stripeAufruf("/api/stripe/portal"));
}
export async function meineAbos() {
  if (DEMO) return [];
  try { return (await rpc("meine_abos")) || []; } catch (e) { return []; }
}

/* ======================================================================
   Konto löschen / Daten exportieren (supabase/konto.sql)
   ====================================================================== */
export async function kontoExport() {
  if (DEMO) {
    const daten = {};
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^(mm-|matheplus|matheskript)/.test(k)) daten[k] = localStorage.getItem(k); } } catch (e) { /* privat */ }
    return { format: "mythosmathe-export-1", erstellt: new Date().toISOString(), vorschau: true, geraet: daten };
  }
  return rpc("konto_export");
}
export async function kontoLoeschen(bestaetigung) {
  if (DEMO) return { status: "geloescht" };
  return rpc("konto_loeschen", { bestaetigung });
}

/* ---------- Eltern-Wochenmail (supabase/wochenmail.sql) ---------- */
export async function wochenmailStand() {
  if (DEMO) return { an: lies("mm-demo-wochenmail") !== false, zuletzt: null };
  return rpc("wochenmail_stand");
}
export async function wochenmailSetzen(an) {
  if (DEMO) { schreib("mm-demo-wochenmail", an); return { status: "ok", an }; }
  return rpc("wochenmail_setzen", { einschalten: an });
}

/* ---------- Klassen-Challenge (supabase/challenge.sql) ---------- */
const DEMO_CHALLENGE = () => ({
  status: "ok", klasse: "8a (Beispiel)", an: true, lehrkraft: (kontoZustand().profil || {}).rolle !== "schueler",
  woche_von: null, woche_bis: null, gesamt: 263,
  liste: [["Mo", 61], ["Lena", 54], ["Kaan", 47], ["Alex", 38, true], ["Ella", 33], ["Finn", 19], ["Noah", 11]].map(([name, punkte, ich]) => ({ name, punkte, ich: !!ich })),
  sieger_vorwoche: { name: "Lena", punkte: 72 }, mein_spitzname: null, ich_sichtbar: true, beispiel: true,
});
export async function challengeKlassen() {
  if (DEMO) return [{ id: "demo-klasse", name: "8a (Beispiel)", stufe: 8, code: "BSP8A2", an: true, lehrkraft: (kontoZustand().profil || {}).rolle !== "schueler", mitglieder: 7, beispiel: true }];
  return rpc("challenge_klassen");
}
export async function challengeRangliste(id) {
  if (DEMO) return DEMO_CHALLENGE();
  return rpc("challenge_rangliste", { k_id: id });
}
export async function challengeSchalten(id, an) {
  if (DEMO) return { status: "ok", an };
  return rpc("challenge_schalten", { k_id: id, an });
}
export async function challengeProfil(id, name, sichtbar) {
  if (DEMO) return { status: "ok" };
  return rpc("challenge_profil", { k_id: id, name, sichtbar });
}

/* ======================================================================
   Eltern-Einwilligung unter 16 (supabase/einwilligung.sql)
   ====================================================================== */
const MAIL_FEHLER = { ew_name: "Bitte gib deinen vollständigen Namen ein.", ew_mail: "Bitte gib eine gültige E-Mail-Adresse ein." };
async function rpcEw(name, args) {
  const { data, error } = await sb.rpc(name, args);
  if (error) {
    const t = String(error.message || "");
    const k = Object.keys(MAIL_FEHLER).find((x) => t.includes(x));
    throw new Error(k ? MAIL_FEHLER[k] : FEHLER);
  }
  return data;
}

/* Seite /einwilligung (Eltern, ohne Konto möglich) */
export async function einwilligungInfo(token) {
  if (DEMO) {
    const p = demoProfilZuToken(token);
    if (!p) return { status: "ungueltig" };
    const e = p.einwilligung || {};
    return { status: "ok", vorname: (p.name || "").split(" ")[0], unter16: p.unter16, erteilt: !!e.konto, erteilt_am: e.erteilt_am || null, von: e.von || null,
      konto: !!e.konto, ki: !!e.ki, klassen: !!e.klassen };
  }
  return rpcEw("einwilligung_info", { token });
}
export async function einwilligungErteilen(token, { name, email, ki, klassen }) {
  if (DEMO) {
    const ok = demoEinwilligungSetzen(token, { konto: true, ki: !!ki, klassen: !!klassen, erteilt_am: new Date().toISOString(), von: name });
    return { status: ok ? "ok" : "ungueltig" };
  }
  return rpcEw("einwilligung_erteilen", { token, e_name: name, e_mail: email, mit_ki: !!ki, mit_klassen: !!klassen });
}
export async function einwilligungWiderrufen(token) {
  if (DEMO) return { status: demoEinwilligungSetzen(token, null) ? "ok" : "ungueltig" };
  return rpcEw("einwilligung_widerrufen", { token });
}

/* Elternkonto: verbundene Kinder unter 16 */
export async function einwilligungKinder() {
  if (DEMO) return [];
  return (await rpcEw("einwilligung_kinder")) || [];
}
export async function einwilligungAlsEltern(kind, ki, klassen) {
  return rpcEw("einwilligung_als_eltern", { kid: kind, mit_ki: !!ki, mit_klassen: !!klassen });
}
export async function einwilligungWiderrufenAlsEltern(kind) {
  return rpcEw("einwilligung_widerrufen_als_eltern", { kid: kind });
}
