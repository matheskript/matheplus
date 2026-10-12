/* ======================================================================
   headNumbers.js – reine Logik für den Kurs „Head & Numbers“.
   Kein React, kein Speicher. Die Oberfläche steht in funcHeadNumbers.jsx,
   die Rundenmaschine (Zahlenfeld, Rückmeldung, Serie, Bestwert) ist der
   vorhandene Schnellrechen-Baustein aus func14.jsx.

   Inhalt
     1. Zahlenbestand: Einmaleins bis 100, Quadratzahlen bis 625, Kubikzahlen
        bis 1000 – eindeutig definiert und mit validiereBestand() prüfbar.
     2. Lernstand je Zahlenbeziehung (Vorwärts- und Rückwärtsrichtung getrennt):
        richtig, falsch, Hilfen, Serie, Tage, Tempo, Wiederholungsabstand.
        Ein einziges Mal richtig reicht nie für „beherrscht“.
     3. Auswahl: unsichere Aufgaben häufiger, sichere in wachsenden Abständen
        (dieselben Abstände wie im übrigen Training, ABSTAENDE).
     4. Aufgabenformate, jeweils mit geprüfter Lösung, Tipps und Erklärung.
   Die Daten liegen im vorhandenen Lernstand unter LERN.training.kopf.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { ABSTAENDE } from "./trainingDaten.js";

export const TAG_MS = 86400000;

/* ---------------------------------------------------------------------
   1. Zahlenbestand
   --------------------------------------------------------------------- */
export const BEREICH = Object.freeze({
  einmaleins: Object.freeze({ min: 1, max: 10 }),
  quadrate: Object.freeze({ min: 1, max: 25 }),
  kubik: Object.freeze({ min: 1, max: 10 }),
});

/* Wörtlich aus dem Kursauftrag – dient nur als Gegenprobe zur Berechnung. */
export const QUADRATE_SOLL = Object.freeze([1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484, 529, 576, 625]);
export const KUBIK_SOLL = Object.freeze([1, 8, 27, 64, 125, 216, 343, 512, 729, 1000]);

export const MODULE = Object.freeze(["einmaleins", "quadrate", "kubik"]);
export const RICHTUNGEN = Object.freeze(["v", "r"]);   // v = vorwärts (Aufgabe → Ergebnis), r = rückwärts (Ergebnis → Aufgabe)

/* Reihenfolge der Einmaleins-Reihen vom Leichten zum Schweren (bestimmt die Blöcke) */
const REIHEN_RANG = { 1: 0, 10: 0, 2: 0, 5: 0, 3: 1, 4: 1, 6: 2, 9: 2, 7: 3, 8: 3 };

export const BLOECKE = {
  einmaleins: [
    { id: "e0", de: "1er, 2er, 5er, 10er", en: "1s, 2s, 5s, 10s" },
    { id: "e1", de: "3er und 4er", en: "3s and 4s" },
    { id: "e2", de: "6er und 9er", en: "6s and 9s" },
    { id: "e3", de: "7er und 8er", en: "7s and 8s" },
  ],
  quadrate: [
    { id: "q0", von: 1, bis: 10, de: "1² bis 10²", en: "1² to 10²" },
    { id: "q1", von: 11, bis: 15, de: "11² bis 15²", en: "11² to 15²" },
    { id: "q2", von: 16, bis: 20, de: "16² bis 20²", en: "16² to 20²" },
    { id: "q3", von: 21, bis: 25, de: "21² bis 25²", en: "21² to 25²" },
  ],
  kubik: [
    { id: "k0", von: 1, bis: 5, de: "1³ bis 5³", en: "1³ to 5³" },
    { id: "k1", von: 6, bis: 10, de: "6³ bis 10³", en: "6³ to 10³" },
  ],
};

const blockEinmaleins = (a, b) => Math.min(REIHEN_RANG[a], REIHEN_RANG[b]);
const blockQuadrat = (n) => (n <= 10 ? 0 : n <= 15 ? 1 : n <= 20 ? 2 : 3);
const blockKubik = (n) => (n <= 5 ? 0 : 1);

/* Fakten: Einmaleins als ungeordnetes Paar (a ≤ b, 55 Stück – 7·8 und 8·7 sind dieselbe Tatsache),
   Quadrate 1–25, Kuben 1–10. Die Reihenfolge der Faktoren wird beim Fragen gewürfelt,
   sodass alle 100 Aufgaben a · b vorkommen. */
export const FAKTEN = { einmaleins: [], quadrate: [], kubik: [] };
for (let a = BEREICH.einmaleins.min; a <= BEREICH.einmaleins.max; a++) {
  for (let b = a; b <= BEREICH.einmaleins.max; b++) {
    FAKTEN.einmaleins.push({ id: `e:${a}x${b}`, modul: "einmaleins", a, b, wert: a * b, block: blockEinmaleins(a, b) });
  }
}
for (let n = BEREICH.quadrate.min; n <= BEREICH.quadrate.max; n++) {
  FAKTEN.quadrate.push({ id: `q:${n}`, modul: "quadrate", n, wert: n * n, block: blockQuadrat(n) });
}
for (let n = BEREICH.kubik.min; n <= BEREICH.kubik.max; n++) {
  FAKTEN.kubik.push({ id: `k:${n}`, modul: "kubik", n, wert: n ** 3, block: blockKubik(n) });
}
export const EINMALEINS_100 = Object.freeze(
  Array.from({ length: 100 }, (_, i) => [Math.floor(i / 10) + 1, (i % 10) + 1]),
);

const FAKT_NACH_ID = new Map();
Object.values(FAKTEN).flat().forEach((f) => FAKT_NACH_ID.set(f.id, f));

/* Items = Fakt × Richtung. Schlüssel z. B. „e:7x8:v“, „q:17:r“, „k:5:v“ */
export const ITEMS = { einmaleins: [], quadrate: [], kubik: [] };
export const ITEM_INFO = new Map();
for (const m of MODULE) {
  for (const f of FAKTEN[m]) {
    for (const r of RICHTUNGEN) {
      const key = `${f.id}:${r}`;
      ITEMS[m].push(key);
      ITEM_INFO.set(key, { key, modul: m, fakt: f, richtung: r, block: f.block });
    }
  }
}
export const ALLE_ITEMS = Object.freeze(MODULE.flatMap((m) => ITEMS[m]));
export const itemInfo = (key) => ITEM_INFO.get(key) || null;
export const itemKey = (fakt, richtung) => `${fakt.id}:${richtung}`;

const isqrt = (v) => Math.round(Math.sqrt(v));
const icbrt = (v) => Math.round(Math.cbrt(v));
export const istQuadrat = (v) => Number.isInteger(v) && v >= 0 && isqrt(v) ** 2 === v;
export const istKubik = (v) => Number.isInteger(v) && v >= 0 && icbrt(v) ** 3 === v;

/* Gegenprobe des gesamten Bestands. Leere Liste = in Ordnung. */
export function validiereBestand() {
  const f = [];
  const gleich = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
  if (FAKTEN.einmaleins.length !== 55) f.push("Einmaleins: erwartet 55 Fakten");
  if (EINMALEINS_100.length !== 100 || !EINMALEINS_100.every(([a, b]) => a >= 1 && a <= 10 && b >= 1 && b <= 10)) f.push("Einmaleins: 100 Aufgaben a·b mit 1 ≤ a,b ≤ 10 erwartet");
  if (!FAKTEN.einmaleins.every((x) => x.wert === x.a * x.b && x.a <= x.b)) f.push("Einmaleins: falsches Produkt");
  if (!gleich(FAKTEN.quadrate.map((x) => x.wert), [...QUADRATE_SOLL])) f.push("Quadratzahlen weichen vom Soll ab");
  if (!gleich(FAKTEN.kubik.map((x) => x.wert), [...KUBIK_SOLL])) f.push("Kubikzahlen weichen vom Soll ab");
  if (FAKTEN.quadrate.length !== 25) f.push("Quadratzahlen: erwartet 1² bis 25²");
  if (FAKTEN.kubik.length !== 10) f.push("Kubikzahlen: erwartet 1³ bis 10³");
  if (new Set(ALLE_ITEMS).size !== ALLE_ITEMS.length) f.push("Item-Schlüssel nicht eindeutig");
  if (ALLE_ITEMS.length !== 2 * (55 + 25 + 10)) f.push("Anzahl der Items stimmt nicht");
  for (const m of MODULE) {
    if (!FAKTEN[m].every((x) => x.block >= 0 && x.block < BLOECKE[m].length)) f.push(`${m}: Block außerhalb`);
  }
  return f;
}

/* ---------------------------------------------------------------------
   2. Lernstand
   ---------------------------------------------------------------------
   Je Item:  r  richtig getippt (Abruf)      f  falsch (Abruf oder Erkennen)
             e  richtig erkannt (Auswahl, Zuordnung)
             h  richtig, aber mit Hilfe
             folge   richtige Antworten ohne Hilfe in Folge (nur Abruf)
             tage    verschiedene Tage dieser Serie
             sFolge, sTage   dasselbe für schnelle Antworten
             ok      letzte Antwort richtig (true/false) oder null
             stufe, stufeTag, faellig   Wiederholungsabstand
   --------------------------------------------------------------------- */
export const SCHNELL_SEK = {
  v: { einmaleins: 4, quadrate: 6, kubik: 6 },
  r: { einmaleins: 5, quadrate: 8, kubik: 8 },
};
export const STATUS = ["neu", "unsicher", "aufbau", "sicher", "automatisiert"];
const RANG = { unsicher: 0, neu: 1, aufbau: 2, sicher: 3, automatisiert: 4 };
export const schlechterer = (a, b) => (RANG[a] <= RANG[b] ? a : b);

export const tagNr = (zeit) => Math.floor(zeit / TAG_MS);

export function leererKopfStand() {
  return { items: {}, verstehen: {}, entdeckt: {}, best: {}, runden: 0, punkte: 0, seit: null, zuletzt: null };
}

const istObjekt = (x) => x && typeof x === "object" && !Array.isArray(x);
const zahl0 = (x) => (Number.isFinite(x) && x >= 0 ? Math.floor(x) : 0);

/* Gelesene Daten bereinigen: unbekannte Schlüssel fallen weg, Felder werden geprüft. */
export function normiereKopf(K) {
  const d = leererKopfStand();
  if (!istObjekt(K)) return d;
  if (istObjekt(K.items)) {
    for (const [key, s] of Object.entries(K.items)) {
      if (!ITEM_INFO.has(key) || !istObjekt(s)) continue;
      d.items[key] = {
        r: zahl0(s.r), f: zahl0(s.f), e: zahl0(s.e), h: zahl0(s.h),
        folge: zahl0(s.folge), tage: Array.isArray(s.tage) ? s.tage.filter(Number.isFinite).slice(-8) : [],
        sFolge: zahl0(s.sFolge), sTage: Array.isArray(s.sTage) ? s.sTage.filter(Number.isFinite).slice(-8) : [],
        ok: s.ok === true ? true : s.ok === false ? false : null,
        stufe: Math.min(ABSTAENDE.length - 1, zahl0(s.stufe)), stufeTag: zahl0(s.stufeTag),
        faellig: zahl0(s.faellig), zuletzt: zahl0(s.zuletzt),
      };
    }
  }
  if (istObjekt(K.verstehen)) for (const [k, v] of Object.entries(K.verstehen)) if (istObjekt(v)) d.verstehen[k] = { r: zahl0(v.r), f: zahl0(v.f), zuletzt: zahl0(v.zuletzt) };
  if (istObjekt(K.entdeckt)) for (const [k, v] of Object.entries(K.entdeckt)) if (v) d.entdeckt[k] = true;
  if (istObjekt(K.best)) for (const [k, v] of Object.entries(K.best)) if (istObjekt(v) && Number.isFinite(v.richtig) && Number.isFinite(v.gesamt)) d.best[k] = { richtig: v.richtig, gesamt: v.gesamt, sek: Number.isFinite(v.sek) ? v.sek : null, zeit: zahl0(v.zeit) };
  d.runden = zahl0(K.runden); d.punkte = zahl0(K.punkte); d.seit = Number.isFinite(K.seit) ? K.seit : null; d.zuletzt = typeof K.zuletzt === "string" ? K.zuletzt : null;
  return d;
}

const neuerItem = () => ({ r: 0, f: 0, e: 0, h: 0, folge: 0, tage: [], sFolge: 0, sTage: [], ok: null, stufe: 0, stufeTag: 0, faellig: 0, zuletzt: 0 });
const merkeTag = (liste, tag) => { if (!liste.includes(tag)) liste.push(tag); if (liste.length > 8) liste.splice(0, liste.length - 8); };

/* Eine Antwort verbuchen.
   modus   „abruf“ = selbst getippt · „erkennen“ = aus Auswahl/Zuordnung
   hilfe   0 = ohne Tipp, 1–2 = Tippstufe, 3 = Lösung angesehen
   sek     Antwortzeit (nur für Abruf ohne Hilfe von Bedeutung)                */
export function buche(K, key, ok, { sek = null, hilfe = 0, modus = "abruf", zeit = Date.now() } = {}) {
  const info = ITEM_INFO.get(key);
  if (!info) return null;
  const s = K.items[key] || neuerItem();
  const heute = tagNr(zeit);
  s.zuletzt = zeit;
  K.zuletzt = info.modul;
  if (!K.seit) K.seit = zeit;
  if (!ok) {
    s.f += 1; s.folge = 0; s.tage = []; s.sFolge = 0; s.sTage = []; s.ok = false;
    s.stufe = Math.max(0, s.stufe - (modus === "abruf" ? 2 : 1));
    s.faellig = zeit;                                   // gleich wieder fällig
  } else if (hilfe > 0) {
    if (modus === "erkennen") s.e += 1; else s.r += 1;   // zählt, bringt die Serie aber nicht voran
    s.h += 1; s.ok = true;
    s.faellig = zeit + ABSTAENDE[s.stufe] * TAG_MS;
  } else if (modus === "erkennen") {
    s.e += 1;
    if (!s.faellig) s.faellig = zeit + ABSTAENDE[0] * TAG_MS;   // neu erkannt: morgen selbst abrufen
  } else {
    s.r += 1; s.ok = true; s.folge += 1; merkeTag(s.tage, heute);
    if (sek != null && sek <= SCHNELL_SEK[info.richtung][info.modul]) { s.sFolge += 1; merkeTag(s.sTage, heute); }
    else { s.sFolge = 0; s.sTage = []; }
    if (s.stufeTag !== heute) { s.stufe = Math.min(ABSTAENDE.length - 1, s.stufe + 1); s.stufeTag = heute; }   // höchstens eine Stufe pro Tag
    s.faellig = zeit + ABSTAENDE[s.stufe] * TAG_MS;
  }
  K.items[key] = s;
  return s;
}

/* Verständnisaufgaben (Muster entdecken) zählen getrennt – sie sind keine Abrufaufgaben. */
export function bucheVerstehen(K, id, ok, zeit = Date.now()) {
  const v = K.verstehen[id] || { r: 0, f: 0, zuletzt: 0 };
  if (ok) v.r += 1; else v.f += 1;
  v.zuletzt = zeit;
  K.verstehen[id] = v;
}
export function markiereEntdeckt(K, id) { K.entdeckt[id] = true; }

/* Bestwert: zuerst die Zahl der richtigen Antworten, bei Gleichstand die Zeit. Zeit nur, wenn gemessen. */
export function setzeBest(K, id, { richtig, gesamt, sek = null }, zeit = Date.now()) {
  const alt = K.best[id];
  const besser = !alt || richtig / gesamt > alt.richtig / alt.gesamt
    || (richtig / gesamt === alt.richtig / alt.gesamt && sek != null && (alt.sek == null || sek < alt.sek));
  if (besser) K.best[id] = { richtig, gesamt, sek, zeit };
  return besser;
}

/* Status eines Items – „sicher“ erst nach einer Serie über mindestens zwei Tage,
   „automatisiert“ zusätzlich mit wiederholt schnellem, richtigem Abruf. */
export function status(s) {
  if (!s || s.r + s.f + s.e === 0) return "neu";
  if (s.ok === false) return "unsicher";
  if (s.f > 0 && s.folge < 2) return "unsicher";
  if (s.folge >= 3 && s.tage.length >= 2) return s.sFolge >= 3 && s.sTage.length >= 2 ? "automatisiert" : "sicher";
  return "aufbau";
}

export const istFaellig = (s, jetzt = Date.now()) => Boolean(s && (s.r + s.f + s.e) > 0 && s.faellig <= jetzt);

/* Beide Richtungen eines Fakts: der schwächere Status zählt (für Übersichten). */
export function faktStatus(K, fakt) {
  return schlechterer(status(K.items[itemKey(fakt, "v")]), status(K.items[itemKey(fakt, "r")]));
}

/* ---------------------------------------------------------------------
   3. Fortschritt, Blöcke, Stufen
   --------------------------------------------------------------------- */
const GUT = ["aufbau", "sicher", "automatisiert"];
const BLOCK_OEFFNEN = 0.6;   // Anteil der Items früherer Blöcke, die mindestens „aufbau“ sein müssen

export const itemsVon = (modul) => ITEMS[modul] || [];

export function offeneBloecke(K, modul) {
  const offen = [0];
  for (let i = 1; i < BLOECKE[modul].length; i++) {
    const vorher = ITEMS[modul].filter((k) => ITEM_INFO.get(k).block < i);
    const gut = vorher.filter((k) => GUT.includes(status(K.items[k]))).length;
    if (vorher.length && gut / vorher.length >= BLOCK_OEFFNEN) offen.push(i); else break;
  }
  return offen;
}

const zaehlen = (K, keys, jetzt) => {
  const z = { neu: 0, unsicher: 0, aufbau: 0, sicher: 0, automatisiert: 0 };
  let faellig = 0;
  for (const k of keys) {
    const s = K.items[k], st = status(s);
    z[st] += 1;
    if (istFaellig(s, jetzt)) faellig += 1;
  }
  return { zaehler: z, faellig };
};

export function modulUebersicht(K, modul, jetzt = Date.now()) {
  const keys = ITEMS[modul];
  const { zaehler, faellig } = zaehlen(K, keys, jetzt);
  const offen = offeneBloecke(K, modul);
  const bloecke = BLOECKE[modul].map((b, index) => ({ ...b, index, offen: offen.includes(index), ...zaehlen(K, keys.filter((k) => ITEM_INFO.get(k).block === index), jetzt), gesamt: keys.filter((k) => ITEM_INFO.get(k).block === index).length }));
  const unsicher = keys.filter((k) => status(K.items[k]) === "unsicher")
    .sort((x, y) => (K.items[y].f - K.items[x].f) || (K.items[y].zuletzt - K.items[x].zuletzt));
  const gesamt = keys.length;
  return {
    modul, gesamt, zaehler, faellig, bloecke, offen, unsicher,
    angefangen: gesamt - zaehler.neu,
    gut: zaehler.aufbau + zaehler.sicher + zaehler.automatisiert,
    sicher: zaehler.sicher + zaehler.automatisiert,
    anteilSicher: (zaehler.sicher + zaehler.automatisiert) / gesamt,
    anteilGut: (zaehler.aufbau + zaehler.sicher + zaehler.automatisiert) / gesamt,
  };
}

export function gesamtUebersicht(K, jetzt = Date.now()) {
  const alle = MODULE.map((m) => modulUebersicht(K, m, jetzt));
  const gesamt = alle.reduce((n, u) => n + u.gesamt, 0);
  const sicher = alle.reduce((n, u) => n + u.sicher, 0);
  const gut = alle.reduce((n, u) => n + u.gut, 0);
  return { module: alle, gesamt, sicher, gut, anteilSicher: sicher / gesamt, anteilGut: gut / gesamt, faellig: alle.reduce((n, u) => n + u.faellig, 0), unsicher: alle.reduce((n, u) => n + u.unsicher.length, 0) };
}

/* Lernstufen: 1 verstehen · 2 mit Unterstützung · 3 selbstständig · 4 schnell · 5 wiederholen · 6 Challenge.
   Verstehen, Unterstützung und selbstständig sind immer offen (flexible Reihenfolge).
   Tempo und Challenge sind freischaltbar, Wiederholen ist offen, sobald etwas ansteht. */
export const STUFEN = ["verstehen", "unterstuetzt", "selbst", "schnell", "wiederholen", "challenge"];

export function stufenStand(K, modul, jetzt = Date.now()) {
  if (modul === "gemischt") {
    const u = gesamtUebersicht(K, jetzt);
    return { wiederholen: { offen: u.unsicher + u.faellig > 0, anzahl: u.unsicher + u.faellig }, schnell: { offen: true }, challenge: { offen: true } };
  }
  const u = modulUebersicht(K, modul, jetzt);
  const offeneItems = ITEMS[modul].filter((k) => u.offen.includes(ITEM_INFO.get(k).block));
  const gutOffen = offeneItems.filter((k) => GUT.includes(status(K.items[k]))).length / offeneItems.length;
  const schnellOffen = gutOffen >= 0.5;
  const challengeOffen = u.anteilGut >= 0.7 && u.anteilSicher >= 1 / 3;
  return {
    verstehen: { offen: true }, unterstuetzt: { offen: true }, selbst: { offen: true },
    schnell: { offen: schnellOffen, fehlt: schnellOffen ? 0 : Math.ceil(0.5 * offeneItems.length) - Math.round(gutOffen * offeneItems.length), noetig: Math.ceil(0.5 * offeneItems.length) },
    wiederholen: { offen: u.unsicher.length + u.faellig > 0, anzahl: u.unsicher.length + u.faellig },
    challenge: { offen: challengeOffen, anteilGut: u.anteilGut, anteilSicher: u.anteilSicher },
  };
}

/* Nächster sinnvoller Schritt für ein Modul (nur ein Vorschlag, nie eine Pflicht). */
export function empfehlung(K, modul, jetzt = Date.now()) {
  if (modul === "gemischt") {
    const u = gesamtUebersicht(K, jetzt);
    return u.unsicher + u.faellig > 0 ? "wiederholen" : "challenge";
  }
  const u = modulUebersicht(K, modul, jetzt);
  if (u.angefangen === 0) return K.entdeckt[`${modul}:start`] ? "unterstuetzt" : "verstehen";
  if (u.unsicher.length >= 3 || u.faellig >= 5) return "wiederholen";
  const st = stufenStand(K, modul, jetzt);
  if (st.challenge.offen) return "challenge";
  if (st.schnell.offen && u.anteilSicher >= 0.4) return "schnell";
  return u.gut / u.gesamt < 0.3 ? "unterstuetzt" : "selbst";
}

/* Hinweis auf unsichere Grundlagen. Bewusst vorsichtig: erst ab mindestens 4 Beobachtungen
   je Item und nur als Hinweis auf den Trainingsstand – keine Diagnose, keine Aussage über Ursachen.
   Schnittstelle für spätere Verknüpfungen (Mathilda, Lernlandkarte). */
export const MIN_BEOBACHTUNGEN_HINWEIS = 4;
export function schwacheGrundlagen(K) {
  const treffer = [];
  for (const key of ALLE_ITEMS) {
    const s = K.items[key];
    if (!s) continue;
    const n = s.r + s.f + s.e;
    if (n >= MIN_BEOBACHTUNGEN_HINWEIS && status(s) === "unsicher" && s.f >= 2) treffer.push({ key, modul: ITEM_INFO.get(key).modul, richtung: ITEM_INFO.get(key).richtung, beobachtungen: n, falsch: s.f });
  }
  const nachModul = {};
  for (const t of treffer) (nachModul[t.modul] = nachModul[t.modul] || []).push(t);
  return { treffer, nachModul, genug: treffer.length > 0 };
}

/* ---------------------------------------------------------------------
   4. Auswahl
   --------------------------------------------------------------------- */
const wert = (key) => ITEM_INFO.get(key).fakt.wert;

export function gewichtVon(K, key, jetzt = Date.now()) {
  const s = K.items[key], st = status(s);
  const faellig = !s || !s.faellig || s.faellig <= jetzt;
  const ueber = s && s.faellig ? Math.min(7, Math.max(0, (jetzt - s.faellig) / TAG_MS)) : 0;
  const basis = {
    neu: 3, unsicher: 8,
    aufbau: faellig ? 4 : 1.5,
    sicher: faellig ? 2 : 0.2,
    automatisiert: faellig ? 0.8 : 0.05,
  }[st];
  return basis * (1 + ueber / 7);
}

/* Kandidaten: offene Blöcke (oder frei gewählte Blöcke), optional nur Unsicheres/Fälliges */
export function kandidaten(K, { module = MODULE, bloecke = null, nur = null, richtung = null, jetzt = Date.now() } = {}) {
  let liste = [];
  for (const m of module) {
    const erlaubt = bloecke ? bloecke.filter((i) => i >= 0 && i < BLOECKE[m].length) : offeneBloecke(K, m);
    liste = liste.concat(ITEMS[m].filter((k) => erlaubt.includes(ITEM_INFO.get(k).block)));
  }
  if (richtung) liste = liste.filter((k) => ITEM_INFO.get(k).richtung === richtung);
  if (nur === "wiederholen") liste = liste.filter((k) => status(K.items[k]) === "unsicher" || (istFaellig(K.items[k], jetzt) && status(K.items[k]) !== "neu"));
  return liste;
}

export const mischen = (arr, rng = Math.random) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/* Gewichtete Ziehung ohne Zurücklegen. eindeutig(key) → Liste von Texten, die in einer Runde nur einmal vorkommen dürfen. */
export function waehleItems(K, liste, anzahl, { jetzt = Date.now(), rng = Math.random, ausgleich = false, eindeutig = null, maxNeuAnteil = 0.4, wiederholungErlaubt = true } = {}) {
  let rest = [...liste];
  const gewaehlt = [];
  const benutzt = new Set();
  let neuZahl = 0;
  const maxNeu = Math.max(1, Math.ceil(anzahl * maxNeuAnteil));
  const ziehe = (kand) => {
    let k = kand;
    if (neuZahl >= maxNeu) { const ohne = k.filter((x) => status(K.items[x]) !== "neu"); if (ohne.length) k = ohne; }
    if (eindeutig) k = k.filter((x) => eindeutig(x).every((t) => !benutzt.has(t)));
    if (!k.length) return null;
    const w = k.map((x) => gewichtVon(K, x, jetzt));
    const summe = w.reduce((a, b) => a + b, 0);
    let u = rng() * summe, idx = 0;
    for (; idx < w.length - 1; idx++) { u -= w[idx]; if (u < 0) break; }
    const key = k[idx];
    if (status(K.items[key]) === "neu") neuZahl += 1;
    if (eindeutig) eindeutig(key).forEach((t) => benutzt.add(t));
    rest = rest.filter((x) => x !== key);
    gewaehlt.push(key);
    return key;
  };
  if (ausgleich) {
    const proModul = Math.floor(anzahl / MODULE.length);
    for (const m of MODULE) {
      for (let i = 0; i < proModul; i++) ziehe(rest.filter((x) => ITEM_INFO.get(x).modul === m));
    }
  }
  while (gewaehlt.length < anzahl) { if (!ziehe(rest)) break; }
  // zu kleine Auswahl: wiederholen, ohne dass zwei gleiche direkt aufeinander folgen
  if (wiederholungErlaubt && !eindeutig && gewaehlt.length < anzahl && gewaehlt.length > 0) {
    const basis = [...gewaehlt];
    let i = 0;
    while (gewaehlt.length < anzahl) {
      const kand = basis[i % basis.length]; i += 1;
      if (basis.length > 1 && kand === gewaehlt[gewaehlt.length - 1]) continue;
      gewaehlt.push(kand);
      if (i > anzahl * 5) break;
    }
  }
  return mischen(gewaehlt, rng);
}

/* ---------------------------------------------------------------------
   5. Aufgabenformate
   ---------------------------------------------------------------------
   Aufgabe: { id, format, key, art: "zahl" | "wahl", modus: "abruf" | "erkennen",
              frage, text, ohneGleich, loesung, optionen: [{ wert, text }],
              hilfen: [Tipp 1, Tipp 2], erklaerung, betrifft: [Items bei richtiger Antwort],
              schaden: { optionswert: [Items] }, meta }
   --------------------------------------------------------------------- */
let zaehlerId = 0;
const mk = (o) => ({ id: `hn${Date.now().toString(36)}${++zaehlerId}`, hilfen: [], ohneGleich: false, frage: null, ...o });
const zuf = (a, b, rng) => a + Math.floor(rng() * (b - a + 1));
const waehle = (arr, rng) => arr[Math.floor(rng() * arr.length)];
const T = (en) => (de, e) => (en ? e : de);
const MAL = "·";

/* ----- Tipps ----- */
function tippEinmaleins(a, b, en) {
  const t = T(en), p = a * b;
  const [x, y] = a >= b ? [a, b] : [b, a];   // x ≥ y
  if (y === 1) return [t("Mal 1 ändert nichts.", "Times 1 changes nothing."), `${x} ${MAL} 1 = ${p}`];
  if (y === 10 || x === 10) { const o = x === 10 ? y : x; return [t("Mal 10: Hänge einfach eine Null an.", "Times 10: just append a zero."), `${o} ${MAL} 10 = ${p}`]; }
  if (y === 5 || x === 5) { const o = x === 5 ? y : x; return [t("Mal 5 ist die Hälfte von mal 10.", "Times 5 is half of times 10."), t(`${o} ${MAL} 10 = ${o * 10}, die Hälfte davon ist ${p}.`, `${o} ${MAL} 10 = ${o * 10}, half of that is ${p}.`)]; }
  if (y === 2) return [t("Mal 2 heißt verdoppeln.", "Times 2 means doubling."), `${x} + ${x} = ${p}`];
  if (x === 9 || y === 9) { const o = x === 9 ? y : x; return [t("Mal 9 = mal 10 minus einmal die Zahl.", "Times 9 = times 10 minus the number once."), `${o} ${MAL} 10 − ${o} = ${o * 10} − ${o} = ${p}`]; }
  if (x >= 6) return [t(`Zerlege ${x} in 5 + ${x - 5}.`, `Split ${x} into 5 + ${x - 5}.`), `5 ${MAL} ${y} + ${x - 5} ${MAL} ${y} = ${5 * y} + ${(x - 5) * y} = ${p}`];
  return [t(`Zähle in ${y}er-Schritten.`, `Count in steps of ${y}.`), Array.from({ length: x }, (_, i) => (i + 1) * y).join(", ")];
}
function tippQuadrat(n, en) {
  const t = T(en), p = n * n;
  if (n === 1) return [t("1 mal 1.", "1 times 1."), `1 ${MAL} 1 = 1`];
  if (n <= 10) return [t(`Das ist die Aufgabe ${n} ${MAL} ${n} aus dem Einmaleins.`, `This is ${n} ${MAL} ${n} from the times table.`), `${n} ${MAL} ${n} = ${p}`];
  if (n % 10 === 5) { const k = (n - 5) / 10; return [t(`Endet die Zahl auf 5: Rechne ${k} ${MAL} ${k + 1} und hänge 25 an.`, `If the number ends in 5: calculate ${k} ${MAL} ${k + 1} and append 25.`), `${k} ${MAL} ${k + 1} = ${k * (k + 1)} → ${k * (k + 1)}25`]; }
  const z = Math.floor(n / 10) * 10, b = n - z;
  if (b === 0) return [t(`Zehnerzahl: ${n / 10}² ${MAL} 100.`, `Multiple of ten: ${n / 10}² ${MAL} 100.`), `${n / 10}² = ${(n / 10) ** 2} → ${p}`];
  return [t(`Zerlege ${n} = ${z} + ${b}: (${z} + ${b})² = ${z}² + 2 ${MAL} ${z} ${MAL} ${b} + ${b}².`, `Split ${n} = ${z} + ${b}: (${z} + ${b})² = ${z}² + 2 ${MAL} ${z} ${MAL} ${b} + ${b}².`), `${z * z} + ${2 * z * b} + ${b * b} = ${p}`];
}
function tippKubik(n, en) {
  const t = T(en);
  if (n === 1) return [t("1 mal 1 mal 1.", "1 times 1 times 1."), `1 ${MAL} 1 ${MAL} 1 = 1`];
  return [t(`${n}³ = ${n} ${MAL} ${n} ${MAL} ${n}: rechne zuerst ${n} ${MAL} ${n}.`, `${n}³ = ${n} ${MAL} ${n} ${MAL} ${n}: first calculate ${n} ${MAL} ${n}.`), `${n * n} ${MAL} ${n} = ${n ** 3}`];
}
const endQuadrat = (v) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => (d * d) % 10 === v % 10);
function tippRueckQuadrat(n, en) {
  const t = T(en), v = n * n, ds = endQuadrat(v);
  return [
    t(`Die Endziffer ${v % 10} verrät: Die gesuchte Zahl endet auf ${ds.join(" oder ")}.`, `The last digit ${v % 10} tells you: the number you are looking for ends in ${ds.join(" or ")}.`),
    t(`${v} liegt zwischen ${(n - 1) ** 2} und ${(n + 1) ** 2}.`, `${v} lies between ${(n - 1) ** 2} and ${(n + 1) ** 2}.`),
  ];
}
const endKubik = (v) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => (d ** 3) % 10 === v % 10);
function tippRueckKubik(n, en) {
  const t = T(en), v = n ** 3, ds = endKubik(v);
  return [
    t(`Die Endziffer ${v % 10} verrät: Die gesuchte Zahl endet auf ${ds.join(" oder ")}.`, `The last digit ${v % 10} tells you: the number you are looking for ends in ${ds.join(" or ")}.`),
    t(`${v} liegt zwischen ${(n - 1) ** 3} und ${(n + 1) ** 3}.`, `${v} lies between ${(n - 1) ** 3} and ${(n + 1) ** 3}.`),
  ];
}

/* Optionen mischen und die richtige Position finden */
function optionenMischen(optionen, rng) { return mischen(optionen, rng); }

/* ----- Einmaleins ----- */
function einmaleinsOrdnung(f, rng) { return f.a === f.b ? [f.a, f.b] : rng() < 0.5 ? [f.a, f.b] : [f.b, f.a]; }
const kE = (a, b, r) => `e:${Math.min(a, b)}x${Math.max(a, b)}:${r}`;

function eBlitz(info, o) {
  const f = info.fakt, [a, b] = einmaleinsOrdnung(f, o.rng), t = T(o.en);
  return mk({ format: "e-blitz", key: info.key, art: "zahl", modus: "abruf", text: `${a} ${MAL} ${b}`, loesung: a * b,
    hilfen: tippEinmaleins(a, b, o.en), betrifft: [info.key],
    erklaerung: `${a} ${MAL} ${b} = ${a * b}   (${a * b} : ${a} = ${b})`, meta: { a, b } });
}
function eFehlt(info, o) {
  const f = info.fakt, [a, b] = einmaleinsOrdnung(f, o.rng), t = T(o.en), p = a * b;
  const links = o.rng() < 0.5;
  const text = links ? `${a} ${MAL} ? = ${p}` : `? ${MAL} ${b} = ${p}`;
  const loesung = links ? b : a;
  const [x, y] = links ? [a, b] : [b, a];
  return mk({ format: "e-fehlt", key: info.key, art: "zahl", modus: "abruf", frage: t("Welche Zahl fehlt?", "Which number is missing?"), text, ohneGleich: true, loesung,
    hilfen: [t(`Wie oft passt ${x} in ${p}? Das ist die Umkehrung von ${x} ${MAL} ?.`, `How often does ${x} fit into ${p}? That is the inverse of ${x} ${MAL} ?.`), tippEinmaleins(a, b, o.en)[0]],
    betrifft: [info.key], erklaerung: `${a} ${MAL} ${b} = ${p}   (${p} : ${x} = ${y})`, meta: { a, b, links, p } });
}
function eDivision(info, o) {
  const f = info.fakt, [a, b] = einmaleinsOrdnung(f, o.rng), p = a * b, t = T(o.en);
  return mk({ format: "e-division", key: info.key, art: "zahl", modus: "abruf", text: `${p} : ${a}`, loesung: b,
    hilfen: [t(`Welche Zahl mal ${a} ergibt ${p}?`, `Which number times ${a} gives ${p}?`), tippEinmaleins(a, b, o.en)[0]],
    betrifft: [info.key], erklaerung: `${p} : ${a} = ${b}   (${a} ${MAL} ${b} = ${p})`, meta: { a, b, p } });
}
function eFamilie(info, o) {
  const f = info.fakt, [a, b] = einmaleinsOrdnung(f, o.rng), p = a * b, t = T(o.en);
  return mk({ format: "e-familie", key: info.key, art: "zahl", modus: "abruf",
    frage: t(`Zahlenfamilie: Aus ${a} ${MAL} ${b} = ${p} folgt …`, `Number family: from ${a} ${MAL} ${b} = ${p} it follows …`), text: `${p} : ${b}`, loesung: a,
    hilfen: [t(`Multiplikation und Division gehören zusammen: ${a} ${MAL} ${b} = ${p} und ${b} ${MAL} ${a} = ${p}.`, `Multiplication and division belong together: ${a} ${MAL} ${b} = ${p} and ${b} ${MAL} ${a} = ${p}.`)],
    betrifft: [info.key], erklaerung: `${a} ${MAL} ${b} = ${p},  ${b} ${MAL} ${a} = ${p},  ${p} : ${a} = ${b},  ${p} : ${b} = ${a}`, meta: { a, b, p } });
}
function eKorrektur(info, o) {
  const f = info.fakt, [a, b] = einmaleinsOrdnung(f, o.rng), p = a * b, t = T(o.en);
  const kand = [...new Set([a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, p + 1, p - 1, p + 10, p - 10, p + a, p - b])].filter((x) => x > 0 && x !== p);
  const falsch = waehle(kand, o.rng);
  return mk({ format: "e-korrektur", key: info.key, art: "zahl", modus: "abruf", frage: t("Hier steckt ein Fehler. Wie lautet das richtige Ergebnis?", "There is a mistake here. What is the correct result?"),
    text: `${a} ${MAL} ${b} = ${falsch}`, ohneGleich: true, loesung: p, hilfen: tippEinmaleins(a, b, o.en), betrifft: [info.key],
    erklaerung: `${a} ${MAL} ${b} = ${p}, nicht ${falsch}`, meta: { a, b, falsch } });
}
function ePaar(info, o) {
  const f = info.fakt, p = f.wert, t = T(o.en);
  const [a, b] = einmaleinsOrdnung(f, o.rng);
  const mogl = [[a + 1, b], [a, b + 1], [a - 1, b], [a, b - 1], [a + 1, b - 1], [a - 1, b + 1], [a + 1, b + 1], [a - 1, b - 1]]
    .filter(([x, y]) => x >= 1 && x <= 10 && y >= 1 && y <= 10 && x * y !== p);
  const gesehen = new Set([[a, b].sort((x, y) => x - y).join("x")]);
  const gewaehlt = mischen(mogl, o.rng).filter(([x, y]) => { const k = [x, y].sort((u, v) => u - v).join("x"); if (gesehen.has(k)) return false; gesehen.add(k); return true; }).slice(0, 3);
  while (gewaehlt.length < 3) { const x = zuf(2, 9, o.rng), y = zuf(2, 9, o.rng); if (x * y !== p && !gewaehlt.some(([u, v]) => u === x && v === y)) gewaehlt.push([x, y]); }
  const paare = [[a, b], ...gewaehlt];
  const ids = paare.map(([x, y], i) => ({ wert: String(i), text: `${x} ${MAL} ${y}`, x, y }));
  const optionen = optionenMischen(ids, o.rng);
  return mk({ format: "e-paar", key: info.key, art: "wahl", modus: "erkennen", frage: t(`Welches Faktorenpaar ergibt ${p}?`, `Which pair of factors gives ${p}?`), text: `? ${MAL} ? = ${p}`, ohneGleich: true,
    loesung: "0", optionen: optionen.map(({ wert, text }) => ({ wert, text })), betrifft: [info.key],
    hilfen: [t(`Probiere die Reihen durch: Welche Zahl aus dem Einmaleins teilt ${p}?`, `Try the times tables: which number from the table divides ${p}?`)],
    erklaerung: `${a} ${MAL} ${b} = ${p}`, meta: { p, paare: paare.map(([x, y]) => x * y) } });
}
function eFehler(info, o) {
  const f0 = info.fakt, t = T(o.en);
  const andere = mischen(FAKTEN.einmaleins.filter((f) => f.id !== f0.id), o.rng).slice(0, 3);
  const fakten = mischen([f0, ...andere], o.rng);
  const falschIdx = o.rng() < 0.5 ? fakten.indexOf(f0) : zuf(0, 3, o.rng);
  const zeilen = fakten.map((f, i) => {
    const [a, b] = einmaleinsOrdnung(f, o.rng), p = f.wert;
    if (i !== falschIdx) return { f, a, b, r: p, text: `${a} ${MAL} ${b} = ${p}`, key: `${f.id}:v` };
    const kand = [...new Set([a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, p + 1, p - 1, p + 10, p - 10])].filter((x) => x > 0 && x !== p);
    const r = waehle(kand, o.rng);
    return { f, a, b, r, text: `${a} ${MAL} ${b} = ${r}`, key: `${f.id}:v`, falsch: true };
  });
  const z = zeilen[falschIdx];
  const optionen = zeilen.map((x, i) => ({ wert: String(i), text: x.text }));
  const schaden = {}; zeilen.forEach((x, i) => { if (i !== falschIdx) schaden[String(i)] = [x.key]; });
  return mk({ format: "e-fehler", key: info.key, art: "wahl", modus: "erkennen", frage: t("Fehlerdetektiv: Welche Rechnung ist falsch?", "Error detective: which calculation is wrong?"), text: "?",
    loesung: String(falschIdx), optionen, betrifft: zeilen.map((x) => x.key), schaden,
    erklaerung: `${z.a} ${MAL} ${z.b} = ${z.f.wert}, ${t("nicht", "not")} ${z.r}`, meta: { zeilen: zeilen.map((x) => ({ a: x.a, b: x.b, r: x.r })), falschIdx } });
}

/* ----- Quadratzahlen ----- */
function qBlitz(info, o) {
  const n = info.fakt.n, t = T(o.en);
  return mk({ format: "q-blitz", key: info.key, art: "zahl", modus: "abruf", text: `${n}²`, loesung: n * n, hilfen: tippQuadrat(n, o.en), betrifft: [info.key],
    erklaerung: `${n}² = ${n} ${MAL} ${n} = ${n * n}`, meta: { n } });
}
function qRueck(info, o) {
  const n = info.fakt.n, v = n * n, t = T(o.en);
  const wurzel = o.rng() < 0.5;
  return mk({ format: "q-rueck", key: info.key, art: "zahl", modus: "abruf", frage: wurzel ? null : t("Welche Zahl wurde quadriert?", "Which number was squared?"),
    text: wurzel ? `√${v}` : `?² = ${v}`, ohneGleich: !wurzel, loesung: n, hilfen: tippRueckQuadrat(n, o.en), betrifft: [info.key],
    erklaerung: `${n}² = ${v}, ${t("also", "so")} √${v} = ${n}`, meta: { n, v, wurzel } });
}
function qDetektiv(info, o) {
  const n = info.fakt.n, t = T(o.en);
  const andere = mischen(Array.from({ length: 25 }, (_, i) => i + 1).filter((x) => x !== n), o.rng).slice(0, 2);
  const basen = [n, ...andere];
  const k = zuf(2, 25, o.rng);
  const d = zuf(1, Math.min(2 * k, 9), o.rng);
  const m = k * k + d;
  const optionen = optionenMischen([...basen.map((x) => ({ wert: String(x * x), text: String(x * x), basis: x })), { wert: String(m), text: String(m), basis: null }], o.rng);
  const schaden = {}; basen.forEach((x) => { schaden[String(x * x)] = [`q:${x}:r`]; });
  return mk({ format: "q-detektiv", key: info.key, art: "wahl", modus: "erkennen", frage: t("Zahlendetektiv: Welche Zahl ist keine Quadratzahl?", "Number detective: which number is not a square number?"), text: "?",
    loesung: String(m), optionen: optionen.map(({ wert, text }) => ({ wert, text })), betrifft: basen.map((x) => `q:${x}:r`), schaden,
    erklaerung: t(`${m} liegt zwischen ${k}² = ${k * k} und ${(k + 1) ** 2}. ${basen.map((x) => `${x * x} = ${x}²`).join(", ")}.`, `${m} lies between ${k}² = ${k * k} and ${(k + 1) ** 2}. ${basen.map((x) => `${x * x} = ${x}²`).join(", ")}.`),
    hilfen: [t("Rechne die Wurzeln im Kopf nach: Nur bei Quadratzahlen kommt eine ganze Zahl heraus.", "Check the roots: only square numbers give a whole number."), t("Endziffern von Quadratzahlen: 0, 1, 4, 5, 6 oder 9.", "Last digits of square numbers: 0, 1, 4, 5, 6 or 9.")],
    meta: { basen, m } });
}
function qNachbar(info, o) {
  const n = Math.min(info.fakt.n, 24), t = T(o.en);
  const d = zuf(1, 2 * n, o.rng);
  const m = n * n + d;
  const kand = Array.from({ length: 24 }, (_, i) => i + 1).filter((i) => i !== n).sort((x, y) => Math.abs(x - n) - Math.abs(y - n) || o.rng() - 0.5).slice(0, 3);
  const paare = [n, ...kand];
  const optionen = optionenMischen(paare.map((i) => ({ wert: String(i), text: `${i}² ${t("und", "and")} ${i + 1}²` })), o.rng);
  return mk({ format: "q-nachbar", key: info.key, art: "wahl", modus: "erkennen", frage: t(`Zwischen welchen beiden Quadratzahlen liegt ${m}?`, `Between which two square numbers does ${m} lie?`), text: `${m}`,
    loesung: String(n), optionen, betrifft: [`q:${n}:v`, `q:${n + 1}:v`], schaden: Object.fromEntries(kand.map((i) => [String(i), [`q:${n}:v`]])),
    hilfen: [t(`Vergleiche ${m} mit Quadratzahlen, die du sicher kennst, z. B. ${Math.max(1, n - 1)}² = ${(Math.max(1, n - 1)) ** 2}.`, `Compare ${m} with square numbers you know well, e.g. ${Math.max(1, n - 1)}² = ${(Math.max(1, n - 1)) ** 2}.`)],
    erklaerung: `${n}² = ${n * n} < ${m} < ${(n + 1) ** 2} = ${n + 1}²`, meta: { n, m } });
}
function qSchaetzen(info, o) {
  const n = info.fakt.n, v = n * n, t = T(o.en);
  const vertauscht = (() => { const s = String(v); return s.length > 1 ? Number(s.split("").reverse().join("")) : v + 2; })();
  const kand = [...new Set([n * 2, n * (n - 1), n * (n + 1), v + 10, v - 10, v + n, v - n, vertauscht, (n + 1) ** 2, (n - 1) ** 2])].filter((x) => x > 0 && x !== v);
  const falsch = mischen(kand, o.rng).slice(0, 3);
  while (falsch.length < 3) { const x = v + zuf(2, 9, o.rng); if (!falsch.includes(x) && x !== v) falsch.push(x); }
  const optionen = optionenMischen([v, ...falsch].map((x) => ({ wert: String(x), text: String(x) })), o.rng);
  return mk({ format: "q-schaetzen", key: info.key, art: "wahl", modus: "erkennen", frage: t("Welches Ergebnis stimmt?", "Which result is correct?"), text: `${n}²`,
    loesung: String(v), optionen, betrifft: [info.key], schaden: Object.fromEntries(falsch.map((x) => [String(x), [info.key]])),
    hilfen: tippQuadrat(n, o.en), erklaerung: `${n}² = ${v}`, meta: { n, v } });
}

/* ----- Kubikzahlen ----- */
function kBlitz(info, o) {
  const n = info.fakt.n;
  return mk({ format: "k-blitz", key: info.key, art: "zahl", modus: "abruf", text: `${n}³`, loesung: n ** 3, hilfen: tippKubik(n, o.en), betrifft: [info.key],
    erklaerung: `${n}³ = ${n} ${MAL} ${n} ${MAL} ${n} = ${n * n} ${MAL} ${n} = ${n ** 3}`, meta: { n } });
}
function kRueck(info, o) {
  const n = info.fakt.n, v = n ** 3, t = T(o.en);
  const wurzel = o.rng() < 0.5;
  return mk({ format: "k-rueck", key: info.key, art: "zahl", modus: "abruf", frage: wurzel ? null : t("Welche Zahl hoch drei ergibt …?", "Which number cubed gives …?"),
    text: wurzel ? `∛${v}` : `?³ = ${v}`, ohneGleich: !wurzel, loesung: n, hilfen: tippRueckKubik(n, o.en), betrifft: [info.key],
    erklaerung: `${n}³ = ${v}, ${t("also", "so")} ∛${v} = ${n}`, meta: { n, v, wurzel } });
}
function kKlass(info, o) {
  const n = info.fakt.n, t = T(o.en);
  const ja = o.rng() < 0.5;
  let m = n ** 3;
  if (!ja) {
    const kand = [m + 1, m - 1, m + n, m - n, m + 10, m - 10, m + 2 * n].filter((x) => x > 0 && !istKubik(x));
    m = waehle(kand, o.rng);
  }
  return mk({ format: "k-klass", key: info.key, art: "wahl", modus: "erkennen", frage: t(`Ist ${m} eine Kubikzahl?`, `Is ${m} a cube number?`), text: `${m}`,
    loesung: ja ? "ja" : "nein", optionen: [{ wert: "ja", text: t("Ja", "Yes") }, { wert: "nein", text: t("Nein", "No") }], betrifft: [info.key], schaden: { [ja ? "nein" : "ja"]: [info.key] },
    hilfen: [t("Prüfe die Endziffer: Bei Kubikzahlen bestimmt sie die Endziffer der Basis eindeutig.", "Check the last digit: for cube numbers it determines the last digit of the base."), t(`Liegt ${m} zwischen zwei Kubikzahlen, die du kennst?`, `Does ${m} lie between two cube numbers you know?`)],
    erklaerung: ja ? `${m} = ${n}³` : `${m} ${t("liegt zwischen", "lies between")} ${n}³ = ${n ** 3} ${t("und", "and")} ${(n + 1) ** 3}, ${t("ist also keine Kubikzahl", "so it is not a cube number")}`, meta: { m, ja } });
}
function kVergleich(info, o) {
  const n = info.fakt.n, A = n ** 3, t = T(o.en);
  const kand = [];
  for (let j = 1; j <= 25; j++) kand.push({ text: `${j}²`, v: j * j, key: `q:${j}:v` });
  for (let m = 1; m <= 10; m++) if (m !== n) kand.push({ text: `${m}³`, v: m ** 3, key: `k:${m}:v` });
  const nah = kand.map((x) => ({ x, d: Math.abs(x.v - A) })).filter(({ x }) => x.text !== `${n}³`).sort((p, q) => p.d - q.d || o.rng() - 0.5).slice(0, 6).map(({ x }) => x);
  const gleich = kand.find((x) => x.v === A && x.text !== `${n}³`);
  const B = gleich && o.rng() < 0.4 ? gleich : waehle(nah.filter((x) => x.v !== A).length ? nah.filter((x) => x.v !== A) : nah, o.rng);
  const richtig = A === B.v ? "g" : A > B.v ? "a" : "b";
  return mk({ format: "k-vergleich", key: info.key, art: "wahl", modus: "erkennen", frage: t("Welche Zahl ist größer?", "Which number is larger?"), text: "?",
    loesung: richtig, optionen: [{ wert: "a", text: `${n}³` }, { wert: "b", text: B.text }, { wert: "g", text: t("gleich groß", "equal") }],
    betrifft: [info.key, B.key], schaden: { a: [info.key], b: [info.key, B.key], g: [info.key, B.key] },
    hilfen: [t("Rechne beide Potenzen aus und vergleiche die Ergebnisse.", "Work out both powers and compare the results.")],
    erklaerung: `${n}³ = ${A}, ${B.text} = ${B.v}`, meta: { A, B: B.v } });
}
function qk(info, o) {
  const v = info.fakt.wert, t = T(o.en);
  if (v === 729) return kKlass(info, o);   // 729 = 9³ = 27² – 27 liegt außerhalb des Trainingsbereichs
  const q = istQuadrat(v), k = istKubik(v);
  const richtig = q && k ? "beide" : q ? "quadrat" : k ? "kubik" : "keins";
  const keys = [info.key];
  if (q && k) { const nq = isqrt(v), nk = icbrt(v); if (nq <= 25) keys.push(`q:${nq}:r`); if (nk <= 10) keys.push(`k:${nk}:r`); }
  const optionen = [{ wert: "quadrat", text: t("Quadratzahl", "Square number") }, { wert: "kubik", text: t("Kubikzahl", "Cube number") }, { wert: "beide", text: t("beides", "both") }, { wert: "keins", text: t("keins von beiden", "neither") }];
  const schaden = Object.fromEntries(optionen.filter((x) => x.wert !== richtig).map((x) => [x.wert, [info.key]]));
  return mk({ format: "qk", key: info.key, art: "wahl", modus: "erkennen", frage: t("Quadrat oder Kubik? Ordne die Zahl zu.", "Square or cube? Classify the number."), text: `${v}`,
    loesung: richtig, optionen, betrifft: [...new Set(keys)], schaden,
    hilfen: [t("Prüfe beides: Ist die Zahl ein Quadrat? Ist sie ein Kubik? Manche Zahlen sind beides.", "Check both: is it a square? Is it a cube? Some numbers are both.")],
    erklaerung: q && k ? `${v} = ${isqrt(v)}² = ${icbrt(v)}³` : q ? `${v} = ${isqrt(v)}²` : `${v} = ${icbrt(v)}³`, meta: { v, q, k } });
}

const GENERATOR = {
  "e-blitz": eBlitz, "e-fehlt": eFehlt, "e-division": eDivision, "e-familie": eFamilie, "e-korrektur": eKorrektur, "e-paar": ePaar, "e-fehler": eFehler,
  "q-blitz": qBlitz, "q-rueck": qRueck, "q-detektiv": qDetektiv, "q-nachbar": qNachbar, "q-schaetzen": qSchaetzen,
  "k-blitz": kBlitz, "k-rueck": kRueck, "k-klass": kKlass, "k-vergleich": kVergleich, qk,
};
export const FORMATE = Object.freeze(Object.keys(GENERATOR));
/* Richtung, in der ein Format den Anker-Fakt abfragt */
export const FORMAT_RICHTUNG = {
  "e-blitz": "v", "e-korrektur": "v", "e-fehler": "v", "e-fehlt": "r", "e-division": "r", "e-familie": "r", "e-paar": "r",
  "q-blitz": "v", "q-nachbar": "v", "q-schaetzen": "v", "q-rueck": "r", "q-detektiv": "r",
  "k-blitz": "v", "k-vergleich": "v", "k-rueck": "r", "k-klass": "r", qk: "r",
};

export function aufgabeFuer(key, format, { rng = Math.random, en = false } = {}) {
  const info = ITEM_INFO.get(key);
  if (!info) throw new Error(`Unbekanntes Item: ${key}`);
  const g = GENERATOR[format];
  if (!g) throw new Error(`Unbekanntes Format: ${format}`);
  return g(info, { rng, en });
}

/* Welche Formate in welcher Stufe für welches Modul und welche Richtung */
const FORMAT_TABELLE = {
  unterstuetzt: {
    einmaleins: { v: [["e-blitz", 3], ["e-fehler", 2], ["e-korrektur", 1]], r: [["e-familie", 3], ["e-paar", 2], ["e-fehlt", 2], ["e-division", 1]] },
    quadrate: { v: [["q-blitz", 3], ["q-schaetzen", 2], ["q-nachbar", 1]], r: [["q-rueck", 2], ["q-detektiv", 2], ["qk", 1]] },
    kubik: { v: [["k-blitz", 3], ["k-vergleich", 1]], r: [["k-rueck", 2], ["k-klass", 2], ["qk", 1]] },
  },
  selbst: {
    einmaleins: { v: [["e-blitz", 4], ["e-korrektur", 1]], r: [["e-fehlt", 3], ["e-division", 3]] },
    quadrate: { v: [["q-blitz", 1]], r: [["q-rueck", 1]] },
    kubik: { v: [["k-blitz", 1]], r: [["k-rueck", 1]] },
  },
  schnell: {
    einmaleins: { v: [["e-blitz", 1]], r: [["e-division", 2], ["e-fehlt", 1]] },
    quadrate: { v: [["q-blitz", 1]], r: [["q-rueck", 1]] },
    kubik: { v: [["k-blitz", 1]], r: [["k-rueck", 1]] },
  },
};
FORMAT_TABELLE.wiederholen = FORMAT_TABELLE.selbst;
FORMAT_TABELLE.challenge = {};
for (const m of MODULE) {
  FORMAT_TABELLE.challenge[m] = {};
  for (const r of RICHTUNGEN) FORMAT_TABELLE.challenge[m][r] = [...FORMAT_TABELLE.unterstuetzt[m][r], ...FORMAT_TABELLE.selbst[m][r]];
}

export function formatFuerKey(key, stufe, rng = Math.random) {
  const info = ITEM_INFO.get(key);
  const liste = (FORMAT_TABELLE[stufe] || FORMAT_TABELLE.selbst)[info.modul][info.richtung];
  const summe = liste.reduce((s, [, w]) => s + w, 0);
  let u = rng() * summe;
  for (const [f, w] of liste) { u -= w; if (u < 0) return f; }
  return liste[0][0];
}
export const formateFuer = (modul, stufe, richtung) => (FORMAT_TABELLE[stufe] || FORMAT_TABELLE.selbst)[modul][richtung].map(([f]) => f);

export const RUNDENLAENGE = { verstehen: 6, unterstuetzt: 8, selbst: 10, schnell: 12, wiederholen: 10, challenge: 15 };

/* Eine ganze Runde bauen: adaptiv gewichtet, ohne doppelte Items. */
export function baueRunde(K, { modul = "gemischt", stufe = "selbst", anzahl = null, jetzt = Date.now(), rng = Math.random, en = false, bloecke = null } = {}) {
  const module = modul === "gemischt" ? [...MODULE] : [modul];
  const nur = stufe === "wiederholen" ? "wiederholen" : null;
  let kand = kandidaten(K, { module, bloecke, nur, jetzt });
  if (!kand.length && nur) return [];
  if (!kand.length) kand = kandidaten(K, { module, bloecke: [0], jetzt });
  const n = anzahl || RUNDENLAENGE[stufe] || 10;
  const keys = waehleItems(K, kand, nur ? Math.min(n, kand.length) : n, { jetzt, rng, ausgleich: modul === "gemischt" && n >= 6, wiederholungErlaubt: !nur });
  return keys.map((k) => aufgabeFuer(k, formatFuerKey(k, stufe, rng), { rng, en }));
}

/* Antwort auswerten: Ergebnis und die zu verbuchenden Items.
   antwort bei „zahl“: Zahl oder Zahlentext, bei „wahl“: der Wert der gewählten Option. */
export function wertung(aufgabe, antwort) {
  const ok = aufgabe.art === "zahl" ? Number(antwort) === aufgabe.loesung && String(antwort).trim() !== "" : String(antwort) === String(aufgabe.loesung);
  const items = ok ? aufgabe.betrifft : (aufgabe.schaden && aufgabe.schaden[String(antwort)]) || [aufgabe.key];
  return { ok, items: [...new Set(items)] };
}

/* ---------------------------------------------------------------------
   6. Zuordnungsspiel und Zahlenmemory
   --------------------------------------------------------------------- */
function paarTexte(info, richtung) {
  const f = info.fakt;
  if (info.modul === "einmaleins") return richtung === "v" ? { links: `${f.a} ${MAL} ${f.b}`, rechts: String(f.wert) } : { links: String(f.wert), rechts: `${f.a} ${MAL} ${f.b}` };
  const hoch = info.modul === "quadrate" ? "²" : "³";
  return richtung === "v" ? { links: `${f.n}${hoch}`, rechts: String(f.wert) } : { links: String(f.wert), rechts: String(f.n) };
}

/* Paare für ein Spiel: gewichtet nach Lernstand, jede Karte in der Runde eindeutig. */
export function paarRunde(K, { modul = "gemischt", anzahl = 6, richtung = "mix", bloecke = null, jetzt = Date.now(), rng = Math.random } = {}) {
  const module = modul === "gemischt" ? [...MODULE] : [modul];
  const r0 = richtung === "mix" ? (rng() < 0.5 ? "v" : "r") : richtung;
  // Paare mit zwei gleichen Karten (∛1 = 1, √1 = 1) taugen nicht zum Verbinden
  const kand = kandidaten(K, { module, bloecke, richtung: r0, jetzt }).filter((k) => { const t = paarTexte(ITEM_INFO.get(k), r0); return t.links !== t.rechts; });
  const eindeutig = (key) => { const t = paarTexte(ITEM_INFO.get(key), r0); return [`L${t.links}`, `R${t.rechts}`, `L${t.rechts}`, `R${t.links}`]; };
  const keys = waehleItems(K, kand, Math.min(anzahl, kand.length), { jetzt, rng, ausgleich: modul === "gemischt" && anzahl >= 6, eindeutig, wiederholungErlaubt: false });
  return { richtung: r0, paare: keys.map((key) => ({ key, ...paarTexte(ITEM_INFO.get(key), r0) })) };
}

/* ---------------------------------------------------------------------
   7. Verständnisaufgaben (Muster entdecken) – zählen nicht als Abruf
   --------------------------------------------------------------------- */
export function musterAufgabe(typ, { rng = Math.random, en = false } = {}) {
  const t = T(en);
  if (typ === "q-diff") {
    const n = zuf(1, 24, rng);
    return mk({ format: "q-diff", art: "zahl", modus: "verstehen", verstehensId: "q-diff", frage: t(`Um wie viel wächst das Quadrat von ${n}² auf ${n + 1}²?`, `By how much does the square grow from ${n}² to ${n + 1}²?`),
      text: `${(n + 1) ** 2} − ${n * n}`, loesung: 2 * n + 1,
      hilfen: [t(`(n + 1)² = n² + 2n + 1: Es kommen 2 ${MAL} ${n} + 1 dazu.`, `(n + 1)² = n² + 2n + 1: you add 2 ${MAL} ${n} + 1.`)],
      erklaerung: `${(n + 1) ** 2} − ${n * n} = ${2 * n + 1} = 2 ${MAL} ${n} + 1`, meta: { n } });
  }
  throw new Error(`Unbekannte Verständnisaufgabe: ${typ}`);
}

/* Beschriftung eines Items für Listen („7 · 8“, „√289“, „∛512“) */
export function itemText(key, richtung = null) {
  const info = ITEM_INFO.get(key);
  if (!info) return key;
  const f = info.fakt, r = richtung || info.richtung;
  if (info.modul === "einmaleins") return r === "v" ? `${f.a} ${MAL} ${f.b}` : `${f.wert} : ${f.a}`;
  if (info.modul === "quadrate") return r === "v" ? `${f.n}²` : `√${f.wert}`;
  return r === "v" ? `${f.n}³` : `∛${f.wert}`;
}
