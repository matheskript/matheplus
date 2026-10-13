/* ======================================================================
   kontoRollen.js – Aufrufe der Datenbankfunktionen aus supabase/rollen.sql (Eltern ↔ Kind, Klassen, Plan).
   Ohne Supabase-Schlüssel (DEMO) läuft alles lokal mit Beispieldaten, damit sich die Oberfläche testen lässt.
   ====================================================================== */
import { sb, DEMO, kontoZustand, profilNeuLaden } from "./konto.js";
import { tagKey } from "./rollenLogik.js";

const lies = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
const schreib = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat */ } };
const FEHLER = "Das hat nicht geklappt. Bitte versuch es noch einmal.";

async function rpc(name, args) {
  const { data, error } = await sb.rpc(name, args);
  if (error) throw new Error(FEHLER);
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
