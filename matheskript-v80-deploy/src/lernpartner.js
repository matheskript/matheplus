/* ======================================================================
   Lernpartner-Börse fürs Abi – reine Logik (kein React, Node-testbar)

   Gegenstück zu supabase/lernpartner.sql: dieselben erlaubten Werte, dieselbe
   Prüfung auf Kontaktdaten (lpTextOk), dieselbe Passung. Die Datenbank setzt alles
   durch; hier gibt es nur frühe Rückmeldung in der Oberfläche und den Beispielmodus
   (ohne Konto oder solange lernpartner.sql nicht eingespielt ist).
   ====================================================================== */

export const BEREICHE = [
  { id: "analysis", name: "Analysis" }, { id: "geometrie", name: "Geometrie" }, { id: "stochastik", name: "Stochastik" },
  { id: "teila", name: "Teil A ohne Hilfsmittel" }, { id: "muendlich", name: "Mündliche Prüfung" },
];
export const ZEITEN = [
  { id: "wt-nachmittag", name: "Mo–Fr nachmittags" }, { id: "wt-abend", name: "Mo–Fr abends" }, { id: "sa", name: "Samstag" }, { id: "so", name: "Sonntag" },
];
export const ORTE = [
  { id: "bibliothek", name: "Stadtbibliothek" }, { id: "schule", name: "Schule oder Schulbibliothek" }, { id: "cafe", name: "Café" }, { id: "lernraum", name: "Lernraum (Uni, Jugendhaus)" },
];
export const MELDEGRUENDE = [
  { id: "kontakt", name: "Will private Kontaktdaten oder ein Treffen privat" }, { id: "belaestigung", name: "Belästigend oder unangenehm" },
  { id: "fake", name: "Kein echter Abiturient" }, { id: "sonstiges", name: "Etwas anderes" },
];
export const MAX_GRUPPE = 6;
export const MAX_ANFRAGEN_TAG = 5;
const NAME = (liste) => Object.fromEntries(liste.map((x) => [x.id, x.name]));
export const BEREICH_NAME = NAME(BEREICHE), ZEIT_NAME = NAME(ZEITEN), ORT_NAME = NAME(ORTE);

/* Dieselbe Regel wie lp_text_ok in der Datenbank */
const KONTAKT = /(@|https?:|www\.|\.(de|com|net|org|io|me|eu)([^a-z]|$)|insta|snap|whats|wa\.me|tiktok|discord|telegram|signal|handy|nummer|telefon)/i;
export const lpTextOk = (t) => typeof t === "string" && !KONTAKT.test(t) && t.replace(/[^0-9]/g, "").length < 5;
export const nameOk = (n) => /^[A-Za-zÄÖÜäöüßéèçñ][A-Za-zÄÖÜäöüßéèçñ .-]{1,19}$/.test(String(n || "").trim()) && lpTextOk(String(n));
export const stadtOk = (s) => /^[A-Za-zÄÖÜäöüßéè][A-Za-zÄÖÜäöüßéè .()/-]{1,59}$/.test(String(s || "").trim().replace(/\s+/g, " "));
export const schuleOk = (s) => !s || (String(s).trim().length >= 2 && String(s).trim().length <= 80 && lpTextOk(String(s)));
export const ortNameOk = (s) => String(s || "").trim().length >= 2 && String(s).trim().length <= 60 && lpTextOk(String(s));

/* Rückgabecodes der Datenbank → Satz für die Oberfläche */
export const MELDUNG = {
  ok: "Gespeichert.",
  nicht_erlaubt: "Das geht mit deinem Konto gerade nicht.",
  name: "Nur der Vorname oder ein Spitzname – Buchstaben, keine Zahlen, keine Kontaktdaten.",
  stadt: "Bitte nur den Namen deiner Stadt.",
  schule: "Nur der Schulname – keine Kontaktdaten.",
  jahr: "Bitte dein Abi-Jahr wählen.",
  niveau: "Bitte deinen Kurs wählen.",
  nicht_gefunden: "Diese Person ist nicht mehr erreichbar.",
  limit: `Höchstens ${MAX_ANFRAGEN_TAG} Anfragen pro Tag – morgen geht es weiter.`,
  offen: "Zwischen euch läuft schon eine Anfrage.",
  gruppe: "Du bist nicht in dieser Gruppe.",
  gruppe_voll: `Die Gruppe ist voll (höchstens ${MAX_GRUPPE}).`,
  schon_drin: "Ist schon in der Gruppe.",
  ungueltig: "Bitte Zeit und Treffpunkt wählen.",
  zeit: "Bitte einen Termin in den nächsten 60 Tagen wählen.",
  ort: "Bitte eine Treffpunkt-Art wählen.",
  ort_name: "Nur der Name des öffentlichen Orts, etwa „Stadtbibliothek Mitte“ – keine Adresse, keine Kontaktdaten.",
  thema: "Bitte ein Thema wählen.",
  nicht_verbunden: "Du bist mit diesem Kind nicht verbunden.",
};
export const meldung = (code) => MELDUNG[code] || "Das hat nicht geklappt. Bitte noch einmal versuchen.";

/* Warum die Börse (noch) nicht offen ist */
export const GRUENDE = {
  kein_konto: { titel: "Mit Konto anmelden", text: "Die Lernpartner-Börse braucht ein Schülerkonto – sonst weiß niemand, wer wirklich Abiturient ist." },
  rolle: { titel: "Nur für Schülerkonten", text: "Lernpartner finden sich hier nur unter Schülern. Eltern geben ihrem Kind hier die Freigabe." },
  alter: { titel: "Alter angeben", text: "Gib in deinem Konto an, ob du unter 16 bist. Die Börse ist ab 16." },
  unter16: { titel: "Ab 16", text: "Die Lernpartner-Börse ist ab 16. Bis dahin: Lerngruppe mit deiner Klasse über die Lehrkraft." },
  freigabe: { titel: "Freigabe deiner Eltern", text: "Du bist noch nicht volljährig. Ein verbundenes Elternteil gibt die Börse für dich frei – einmal, mit einem Klick in seinem Konto." },
};

export const SICHER_TREFFEN = [
  "Erstes Treffen immer an einem öffentlichen Ort – Bibliothek, Schule, Café.",
  "Sag zu Hause, wann und wo du dich triffst.",
  "Keine Adresse, keine Nummer, keine Profile: Die App vermittelt nur das Treffen.",
  "Komisches Gefühl? Melden und blockieren – die Person sieht dich danach nicht mehr.",
];

/* Passung wie in lp_suchen(): wer kann, was ich suche (×2), wer sucht, was ich kann (×2), gemeinsame Zeiten, gleicher Kurs */
const schnitt = (a = [], b = []) => a.filter((x) => b.includes(x)).length;
export function passung(ich, du) {
  if (!ich || !du) return 0;
  return 2 * schnitt(du.helfen, ich.suchen) + 2 * schnitt(ich.helfen, du.suchen) + schnitt(du.zeiten, ich.zeiten) + (du.niveau === ich.niveau ? 1 : 0);
}
/* Warum passt ihr? Kurze Gründe für die Karte */
export function passungGruende(ich, du) {
  const g = [];
  const kann = (du.helfen || []).filter((x) => (ich.suchen || []).includes(x));
  const sucht = (du.suchen || []).filter((x) => (ich.helfen || []).includes(x));
  if (kann.length) g.push(`kann dir helfen: ${kann.map((x) => BEREICH_NAME[x]).join(", ")}`);
  if (sucht.length) g.push(`sucht Hilfe bei: ${sucht.map((x) => BEREICH_NAME[x]).join(", ")}`);
  const zeiten = (du.zeiten || []).filter((x) => (ich.zeiten || []).includes(x));
  if (zeiten.length) g.push(`gleiche Zeit: ${zeiten.map((x) => ZEIT_NAME[x]).join(", ")}`);
  return g;
}
/* Vorschlag für eine Anfrage: erste gemeinsame Zeit und Ort, sonst die eigenen */
export function vorschlag(ich, du) {
  const z = (ich.zeiten || []).find((x) => (du.zeiten || []).includes(x)) || (du.zeiten || [])[0] || (ich.zeiten || [])[0] || "wt-nachmittag";
  const o = (ich.orte || []).find((x) => (du.orte || []).includes(x)) || (du.orte || [])[0] || (ich.orte || [])[0] || "bibliothek";
  return { zeit: z, ort: o };
}

/* Steckbrief aus dem Abi-Profil vorbelegen */
export function steckbriefVorlage(abiProfil, kontoName = "") {
  const p = abiProfil || {};
  return {
    anzeigename: String(kontoName || "").split(" ")[0].replace(/[^A-Za-zÄÖÜäöüßéèçñ .-]/g, "").slice(0, 20),
    stadt: "", abi_jahr: p.jahr || 2027, niveau: p.niveau === "basis" ? "grundlegend" : p.niveau || "erhoeht", schule: "", schule_zeigen: false,
    helfen: [], suchen: [], zeiten: ["wt-nachmittag"], orte: ["bibliothek"], aktiv: true,
  };
}
export function steckbriefFehler(s) {
  if (!nameOk(s.anzeigename)) return "name";
  if (!stadtOk(s.stadt)) return "stadt";
  if (!schuleOk(s.schule)) return "schule";
  if (!(s.abi_jahr >= 2026 && s.abi_jahr <= 2035)) return "jahr";
  if (!["erhoeht", "grundlegend"].includes(s.niveau)) return "niveau";
  return null;
}

/* ---------- Beispielmodus (ohne Datenbank) ---------- */
export const BEISPIEL_PROFILE = [
  { id: "b1", anzeigename: "Lea", schule: "Hölderlin-Gymnasium", niveau: "erhoeht", helfen: ["stochastik", "teila"], suchen: ["geometrie"], zeiten: ["wt-nachmittag", "sa"], orte: ["bibliothek", "cafe"] },
  { id: "b2", anzeigename: "Jonas", schule: null, niveau: "erhoeht", helfen: ["geometrie"], suchen: ["analysis", "teila"], zeiten: ["wt-abend"], orte: ["bibliothek"] },
  { id: "b3", anzeigename: "Aylin", schule: "Königin-Katharina-Stift", niveau: "grundlegend", helfen: ["analysis"], suchen: ["muendlich"], zeiten: ["sa", "so"], orte: ["cafe", "lernraum"] },
  { id: "b4", anzeigename: "Mats", schule: null, niveau: "erhoeht", helfen: ["analysis", "geometrie"], suchen: ["stochastik"], zeiten: ["wt-nachmittag"], orte: ["schule", "bibliothek"] },
  { id: "b5", anzeigename: "Sophie", schule: "Wagenburg-Gymnasium", niveau: "grundlegend", helfen: ["muendlich"], suchen: ["analysis"], zeiten: ["wt-nachmittag", "so"], orte: ["lernraum"] },
];
export const BEISPIEL_ICH = { anzeigename: "Du", stadt: "Stuttgart", abi_jahr: 2027, niveau: "erhoeht", helfen: ["analysis"], suchen: ["stochastik", "geometrie"], zeiten: ["wt-nachmittag", "sa"], orte: ["bibliothek"], aktiv: true };
export function beispielTreffer(ich = BEISPIEL_ICH) {
  return BEISPIEL_PROFILE.map((p) => ({ ...p, passung: passung(ich, p), angefragt: false })).sort((a, b) => b.passung - a.passung);
}
export function beispielGruppe(jetzt = Date.now()) {
  const tag = (n, h) => { const d = new Date(jetzt + n * 86400000); d.setHours(h, 0, 0, 0); return d.toISOString(); };
  return {
    id: "bg1", name: "Lea & Du", satz_seed: 271828, beispiel: true,
    mitglieder: [{ id: "b1", name: "Lea", ich: false }, { id: "ich", name: "Du", ich: true }, { id: "b4", name: "Mats", ich: false }],
    treffen: [{ id: "bt1", wann: tag(3, 15), ort: "bibliothek", ort_name: "Stadtbibliothek am Mailänder Platz", thema: "teila", zusagen: 2, absagen: 0, meine: null }],
  };
}

/* Termin hübsch: „Sa 25.10., 15:00“ */
const WT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
export function terminText(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${WT[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}., ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* ---------- Aufrufe (sb = Supabase-Client aus konto.js) ---------- */
export function lpApi(sb) {
  const rpc = async (name, args) => {
    const { data, error } = await sb.rpc(name, args);
    if (error) { const e = new Error(error.message || "Fehler"); e.code = error.code; e.fehlt = /function|does not exist|not find|schema cache/i.test(error.message || ""); throw e; }
    return data;
  };
  return {
    status: () => rpc("lp_status"),
    speichern: (d) => rpc("lp_profil_speichern", { d }),
    loeschen: () => rpc("lp_profil_loeschen"),
    suchen: async () => (await rpc("lp_suchen")) || [],
    anfragen: (an, zeit, ort, gruppe = null) => rpc("lp_anfragen", { an_id: an, zeit_wahl: zeit, ort_wahl: ort, gruppe }),
    antworten: (anfrage, ja) => rpc("lp_antworten", { anfrage, ja }),
    zurueckziehen: (anfrage) => rpc("lp_zurueckziehen", { anfrage }),
    meine: () => rpc("lp_meine"),
    treffen: (gruppe, zeitpunkt, ort, ortsname, thema) => rpc("lp_treffen_vorschlagen", { gruppe, zeitpunkt, ort_wahl: ort, ortsname, thema_wahl: thema }),
    zusagen: (treffen, ja) => rpc("lp_zusagen", { treffen, ja }),
    verlassen: (gruppe) => rpc("lp_gruppe_verlassen", { gruppe }),
    blockieren: (an) => rpc("lp_blockieren", { an_id: an }),
    melden: (an, grund) => rpc("lp_melden", { an_id: an, grund }),
    freigeben: (kind, ja) => rpc("lp_freigeben", { kind, ja }),
    kinder: async () => (await rpc("lp_kinder")) || [],
  };
}
