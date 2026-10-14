/* ======================================================================
   trainingStatistik.js – Auswertung des gesamten Trainings für den
   Kontobereich („Mein Training“). Reine Logik, kein React, kein Speicher.

   Quellen
     · protokoll  – jede geprüfte Aufgabe aus merken() (func5.jsx):
                    { zeit, bereich?, gruppe?, richtig, fehlerart?, sekunden? }
                    (nur die letzten 500 Einträge werden aufbewahrt)
     · aktivitaet – Tageswerte aus aktivitaetMelden() (func8.jsx):
                    { "JJJJ-MM-TT": { sekunden, aufgaben, richtig, hilfe, fehler{} } }
   Beide Quellen beschreiben dieselben Ereignisse. Je Tag gilt deshalb
   die größere Zahl (keine Doppelzählung), die Lernzeit kommt aus den
   Tageswerten oder wird wie in aktivitaetMelden aus den Abständen
   zwischen den Aufgaben geschätzt.

   Darf von base- und func-Dateien importiert werden (importiert nur werkzeuge.js).
   ====================================================================== */
import { wo } from "./werkzeuge.js";

export const TAG_MS = 86400000;
export const SITZUNG_PAUSE_MS = 20 * 60000;   // längere Pause = neue Sitzung

export const tagKey = (d) => {
  const x = d instanceof Date ? d : new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const tagStart = (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d; };
const plusTage = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const montagVon = (ts) => { const d = tagStart(ts); return plusTage(d, -((d.getDay() + 6) % 7)); };
export const quoteVon = (richtig, aufgaben) => (aufgaben > 0 ? Math.round((richtig / aufgaben) * 100) : null);

/* ---------- Namen der Bereiche ---------- */
/* Ansichten, die kein Werkzeug aus werkzeuge.js sind */
const ANSICHT_NAMEN = {
  abikette: { name: "Abi-Ketten", ziel: { ansicht: "abiketten" } },
  abiketten: { name: "Abi-Ketten", ziel: { ansicht: "abiketten" } },
  rechenweg: { name: "Kurvendiskussion · Rechenweg", ziel: { ansicht: "plotter" } },
  graph: { name: "Graphen zuordnen", ziel: { ansicht: "plotter" } },
  headnumbers: { name: "Head & Numbers", ziel: { ansicht: "headnumbers" } },
  kopf: { name: "Kopfrechnen", ziel: { ansicht: "kopf" } },
  training: { name: "Aufgaben üben", ziel: { ansicht: "training" } },
  meintraining: { name: "Mein Training", ziel: { ansicht: "meintraining" } },
  warmup: { name: "5 Minuten Mathe", ziel: { ansicht: "warmup" } },
  fehlertraining: { name: "Meine Fehler üben", ziel: { ansicht: "fehlertraining" } },
  pruefung: { name: "Prüfungsmodus", ziel: { ansicht: "pruefung" } },
  wiederholen: { name: "Wiederholen", ziel: { ansicht: "wiederholen" } },
  ebbinghaus: { name: "Ebbinghaus", ziel: { ansicht: "ebbinghaus" } },
  einstufung: { name: "Einstufung", ziel: { ansicht: "einstufung" } },
  entdecken: { name: "Mathe entdecken", ziel: { ansicht: "entdecken" } },
  diffq: { name: "Differenzenquotient", ziel: { ansicht: "diffq" } },
  begruenden: { name: "Erklär deinen Schritt", ziel: { ansicht: "begruenden" } },
  formeln: { name: "Formelsammlung", ziel: { ansicht: "formeln" } },
};
/* Gruppen, die einen eigenen Bereich bilden (unabhängig von der Ansicht) */
const GRUPPEN_PRAEFIX = [
  ["Head & Numbers", { id: "headnumbers", name: "Head & Numbers", ziel: { ansicht: "headnumbers" } }],
  ["Teilbarkeit", { id: "teiler", name: "Teilbarkeitsregeln", ziel: { ansicht: "entdecken" } }],
  ["Bruchrechnen", { id: "brueche", name: "Bruchrechnen", ziel: { ansicht: "kopf" } }],
];

export function bereichVon(e) {
  const g = String(e.gruppe || "");
  for (const [p, b] of GRUPPEN_PRAEFIX) if (g.startsWith(p)) return b;
  const a = e.bereich;
  if (a) {
    const ort = wo(a);
    if (ort && ort.werkzeug) return { id: ort.werkzeug.id, name: ort.werkzeug.name, ziel: ort.werkzeug.ziel };
    if (ANSICHT_NAMEN[a]) return { id: a, ...ANSICHT_NAMEN[a] };
    return { id: a, name: a.charAt(0).toUpperCase() + a.slice(1), ziel: { ansicht: a } };
  }
  if (g) { const n = g.split(" · ")[0]; return { id: `g:${n}`, name: n, ziel: null }; }
  return { id: "sonstiges", name: "Sonstiges", ziel: null };
}

/* ---------- Lernzeit aus Abständen schätzen (wie aktivitaetMelden) ---------- */
function zeitSchaetzen(eintraege) {
  let vor = 0, s = 0;
  for (const e of eintraege) {
    const l = e.zeit - vor;
    s += vor && l < 30 * 60000 ? Math.min(l, 180000) / 1000 : 60;
    vor = e.zeit;
  }
  return s;
}

/* ---------- Hauptfunktion ---------- */
export function trainingStatistik({ protokoll = [], aktivitaet = {}, jetzt = Date.now(), wochen = 12, fehlerNamen = {} } = {}) {
  const liste = (protokoll || [])
    .filter((e) => e && typeof e.zeit === "number" && typeof e.richtig === "boolean")
    .sort((a, b) => a.zeit - b.zeit);

  /* Tage aus dem Protokoll */
  const ausProt = {};
  for (const e of liste) {
    const k = tagKey(e.zeit);
    const t = (ausProt[k] = ausProt[k] || { aufgaben: 0, richtig: 0, eintraege: [] });
    t.aufgaben++; if (e.richtig) t.richtig++; t.eintraege.push(e);
  }
  /* Zusammenführen mit den Tageswerten */
  const tage = {};
  const keys = new Set([...Object.keys(ausProt), ...Object.keys(aktivitaet || {})]);
  for (const k of keys) {
    const p = ausProt[k], a = (aktivitaet || {})[k];
    const pa = p ? p.aufgaben : 0, aa = a ? a.aufgaben || 0 : 0;
    const nehmeA = aa > pa;
    const aufgaben = Math.max(pa, aa);
    const richtig = nehmeA ? Math.min(aa, a.richtig || 0) : p ? p.richtig : 0;
    const sekunden = Math.max(a ? a.sekunden || 0 : 0, p ? zeitSchaetzen(p.eintraege) : 0);
    if (aufgaben > 0 || sekunden >= 60) tage[k] = { aufgaben, richtig, sekunden };
  }

  const summe = (pred) => {
    let aufgaben = 0, richtig = 0, sekunden = 0, aktiveTage = 0;
    for (const [k, t] of Object.entries(tage)) {
      if (!pred(k)) continue;
      aufgaben += t.aufgaben; richtig += t.richtig; sekunden += t.sekunden;
      if (t.aufgaben > 0) aktiveTage++;
    }
    return { aufgaben, richtig, sekunden, aktiveTage, quote: quoteVon(richtig, aufgaben) };
  };
  const heute0 = tagStart(jetzt);
  const grenzeKey = (n) => tagKey(plusTage(heute0, -n));       // Tag vor n Tagen
  const heuteKey = tagKey(heute0);
  const gesamt = summe(() => true);
  const letzte7 = summe((k) => k > grenzeKey(7) && k <= heuteKey);
  const vorige7 = summe((k) => k > grenzeKey(14) && k <= grenzeKey(7));
  const letzte30 = summe((k) => k > grenzeKey(30) && k <= heuteKey);

  /* Serie: aufeinanderfolgende Tage mit mindestens einer Aufgabe (heute zählt mit, unterbricht aber nicht) */
  let serie = 0;
  for (let i = 0; i < 400; i++) {
    const t = tage[tagKey(plusTage(heute0, -i))];
    if (t && t.aufgaben > 0) serie++;
    else if (i === 0) continue;
    else break;
  }

  /* Raster: die letzten `wochen` Wochen, Montag bis Sonntag */
  const start = plusTage(montagVon(jetzt), -7 * (wochen - 1));
  const raster = [];
  for (let w = 0; w < wochen; w++) {
    const wStart = plusTage(start, 7 * w);
    const woche = { start: wStart.getTime(), tage: [], aufgaben: 0, richtig: 0, sekunden: 0, aktiveTage: 0 };
    for (let d = 0; d < 7; d++) {
      const dd = plusTage(wStart, d), k = tagKey(dd), t = tage[k];
      const zukunft = dd.getTime() > heute0.getTime();
      woche.tage.push({ key: k, ts: dd.getTime(), aufgaben: t ? t.aufgaben : 0, richtig: t ? t.richtig : 0, sekunden: t ? t.sekunden : 0,
        quote: t ? quoteVon(t.richtig, t.aufgaben) : null, zukunft, heute: k === heuteKey });
      if (t && !zukunft) { woche.aufgaben += t.aufgaben; woche.richtig += t.richtig; woche.sekunden += t.sekunden; if (t.aufgaben > 0) woche.aktiveTage++; }
    }
    woche.quote = quoteVon(woche.richtig, woche.aufgaben);
    raster.push(woche);
  }

  /* Bereiche (Themen) aus dem Protokoll */
  const bereiche = {};
  const grenze14 = heute0.getTime() - 13 * TAG_MS;
  for (const e of liste) {
    const b = bereichVon(e);
    const x = (bereiche[b.id] = bereiche[b.id] || { ...b, aufgaben: 0, richtig: 0, zuletzt: 0, neu: { a: 0, r: 0 }, alt: { a: 0, r: 0 } });
    x.aufgaben++; if (e.richtig) x.richtig++;
    x.zuletzt = Math.max(x.zuletzt, e.zeit);
    const teil = e.zeit >= grenze14 ? x.neu : x.alt;
    teil.a++; if (e.richtig) teil.r++;
  }
  const themen = Object.values(bereiche).map((x) => {
    const qNeu = quoteVon(x.neu.r, x.neu.a), qAlt = quoteVon(x.alt.r, x.alt.a);
    const trend = x.neu.a >= 4 && x.alt.a >= 4 ? qNeu - qAlt : null;
    return { id: x.id, name: x.name, ziel: x.ziel, aufgaben: x.aufgaben, richtig: x.richtig, quote: quoteVon(x.richtig, x.aufgaben), zuletzt: x.zuletzt, trend };
  }).sort((a, b) => b.aufgaben - a.aufgaben || b.zuletzt - a.zuletzt);
  const belastbar = themen.filter((t) => t.aufgaben >= 5);
  const staerke = belastbar.length >= 2 ? [...belastbar].sort((a, b) => b.quote - a.quote || b.aufgaben - a.aufgaben)[0] : null;
  const baustelleKand = belastbar.length >= 2 ? [...belastbar].sort((a, b) => a.quote - b.quote || b.aufgaben - a.aufgaben)[0] : null;
  const baustelle = baustelleKand && staerke && baustelleKand.id !== staerke.id && baustelleKand.quote < 90 ? baustelleKand : null;

  /* Häufigste Fehler (letzte 30 Tage) */
  const zaehl = {};
  const g30 = heute0.getTime() - 29 * TAG_MS;
  for (const e of liste) if (!e.richtig && e.fehlerart && e.zeit >= g30) zaehl[e.fehlerart] = (zaehl[e.fehlerart] || 0) + 1;
  const ausAkt = {};
  for (const [k, t] of Object.entries(aktivitaet || {})) {
    if (k <= grenzeKey(30) || !t || !t.fehler) continue;
    for (const [f, n] of Object.entries(t.fehler)) ausAkt[f] = (ausAkt[f] || 0) + n;
  }
  const fehler = [...new Set([...Object.keys(zaehl), ...Object.keys(ausAkt)])]
    .map((art) => ({ art, name: fehlerNamen[art] || (art === "rechnen" ? "Rechenfehler" : art), anzahl: Math.max(zaehl[art] || 0, ausAkt[art] || 0) }))
    .filter((f) => f.anzahl > 0)
    .sort((a, b) => b.anzahl - a.anzahl);

  /* Sitzungen: zusammenhängende Arbeit im selben Bereich */
  const sitzungen = [];
  for (const e of liste) {
    const b = bereichVon(e);
    const s = sitzungen[sitzungen.length - 1];
    if (s && s.id === b.id && e.zeit - s.ende <= SITZUNG_PAUSE_MS) {
      s.ende = e.zeit; s.aufgaben++; if (e.richtig) s.richtig++;
    } else {
      sitzungen.push({ id: b.id, name: b.name, ziel: b.ziel, start: e.zeit, ende: e.zeit, aufgaben: 1, richtig: e.richtig ? 1 : 0 });
    }
  }
  sitzungen.forEach((s) => { s.quote = quoteVon(s.richtig, s.aufgaben); });
  sitzungen.reverse();

  return { tage, gesamt, letzte7, vorige7, letzte30, serie, raster, themen, staerke, baustelle, fehler, sitzungen, leer: gesamt.aufgaben === 0 };
}

/* ---------- Anzeige-Helfer ---------- */
export function dauerKurz(sekunden) {
  const m = Math.round((sekunden || 0) / 60);
  if (m < 60) return `${m} Min.`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} Std. ${r} Min.` : `${h} Std.`;
}

/* Kurzform für Kennzahl-Kacheln: „45 Min.“, „1,5 Std.“, „11 Std.“ */
export function dauerKachel(sekunden) {
  const m = Math.round((sekunden || 0) / 60);
  if (m < 60) return `${m} Min.`;
  const h = m / 60;
  return `${h < 10 ? String(Math.round(h * 10) / 10).replace(".", ",") : Math.round(h)} Std.`;
}
