/* ============================================================
   ABI-ZENTRUM – reine Logik (kein React, Node-testbar)

   · Abi-Profil: Bundesland, Abi-Jahr, Niveau (erhöht/grundlegend), Prüfungsform
     (schriftlich/mündlich), Hilfsmittel, Termin, Ziel, Zeit am Tag.
   · Prüfungsprofile: Aufbau, BE, Zeiten, Wahlregeln, Hilfsmittel, Termine.
     Baden-Württemberg ist ausgearbeitet; andere Länder laufen über das
     IQB-Format (erhöhtes/grundlegendes Niveau) mit eigenem Termin.
   · Rückwärtsplan: Phasen und Probeabis vom heutigen Tag bis zur Prüfung.
   · Ergebnisse der Abi-Aufgaben (BE je Sachgebiet) und Vorschläge für heute.
   · Verweise auf Kurse, Trainer und Prüfungssimulationen der App.

   Gespeichert wird im Lernstand unter training.abi (Konto-Abgleich über
   lernMerge: der jüngere Stand mit „zuletzt“ gewinnt).
   Stand der Prüfungsdaten: 21.10.2026 (Quellen im Konzept „Abi-Kurs Mathe“).
   ============================================================ */

export const TAG = 86400000;

/* ---------- Bundesländer ---------- */
export const LAENDER = [
  { id: "BW", name: "Baden-Württemberg" }, { id: "BY", name: "Bayern" }, { id: "BE", name: "Berlin" }, { id: "BB", name: "Brandenburg" },
  { id: "HB", name: "Bremen" }, { id: "HH", name: "Hamburg" }, { id: "HE", name: "Hessen" }, { id: "MV", name: "Mecklenburg-Vorpommern" },
  { id: "NI", name: "Niedersachsen" }, { id: "NW", name: "Nordrhein-Westfalen" }, { id: "RP", name: "Rheinland-Pfalz" }, { id: "SL", name: "Saarland" },
  { id: "SN", name: "Sachsen" }, { id: "ST", name: "Sachsen-Anhalt" }, { id: "SH", name: "Schleswig-Holstein" }, { id: "TH", name: "Thüringen" },
];
export const landName = (id) => (LAENDER.find((l) => l.id === id) || { name: id }).name;

/* Wörter je Land: BW sagt Leistungsfach/Basisfach, die meisten anderen LK/GK */
export function niveauWorte(land) {
  return land === "BW"
    ? { erhoeht: "Leistungsfach", grundlegend: "Basisfach" }
    : { erhoeht: "Leistungskurs (LK)", grundlegend: "Grundkurs (GK)" };
}

/* ---------- Prüfungsprofile ---------- */
export const PRUEFUNGEN = {
  "bw-lf": {
    id: "bw-lf", land: "BW", niveau: "erhoeht", form: "schriftlich", titel: "Leistungsfach Baden-Württemberg", kurz: "Leistungsfach BW · schriftlich",
    be: 100, minuten: 300, ausgearbeitet: true,
    teilA: { be: 30, abgabeSpaetestens: 110, vorgelegt: 10, bearbeiten: 6, pflicht: ["analysis", "analysis", "geometrie", "stochastik"], wahl: { aus: 6, waehle: 2 }, beJe: 5, hilfsmittel: "keine" },
    teilB: { be: { analysis: 30, geometrie: 20, stochastik: 20 }, auswahl: "Der Fachlehrer wählt je Sachgebiet eine von zwei Aufgaben.", hilfsmittel: "wissenschaftlicher Taschenrechner und IQB-Formeldokument" },
    termine: { 2027: { haupt: "2027-05-05", nach: "2027-05-31", schriftlichAb: "2027-04-16" } },   // schriftlichAb: erste reguläre schriftliche Prüfung aller Fächer (15.4. ist nur das Hebraicum)
  },
  "bw-bf": {
    id: "bw-bf", land: "BW", niveau: "grundlegend", form: "muendlich", titel: "Basisfach Baden-Württemberg", kurz: "Basisfach BW · mündlich",
    ausgearbeitet: true, vorbereitung: 20, dauer: 20,
    teile: ["Vortrag, etwa 10 Minuten", "Prüfungsgespräch, etwa 10 Minuten, im anderen Sachgebiet"],
    sachgebiete: "Analysis plus Geometrie oder Stochastik", hilfsmittel: "in der Prüfung keine; ob in der Vorbereitung, steht in der Aufgabe",
    hinweis: "Die Aufgaben stellt die Schule, nicht zentral.",
    termine: { 2027: { von: "2027-06-28", bis: "2027-07-08" } },
  },
  "iqb-ea": {
    id: "iqb-ea", land: null, niveau: "erhoeht", form: "schriftlich", titel: "Erhöhtes Niveau (IQB-Format)", kurz: "LK · schriftlich",
    be: null, poolBe: 100, ausgearbeitet: false,
    teilA: { abgabeSpaetestens: 110, hilfsmittel: "keine" },
    teilB: { hilfsmittel: "je Land: WTR, CAS oder GTR und Formeldokument" },
    hinweis: "Bindend für alle Länder ist nur: Teil A ohne Hilfsmittel, Abgabe spätestens nach 110 Minuten. Aufbau, BE und Hilfsmittel legt dein Land fest – Termin und Hilfsmittel trägst du selbst ein.",
  },
  "iqb-ga": {
    id: "iqb-ga", land: null, niveau: "grundlegend", form: "schriftlich", titel: "Grundlegendes Niveau (IQB-Format)", kurz: "GK · schriftlich",
    be: null, poolBe: 80, ausgearbeitet: false,
    teilA: { abgabeSpaetestens: 100, hilfsmittel: "keine" },
    teilB: { hilfsmittel: "je Land: WTR, CAS oder GTR und Formeldokument" },
    hinweis: "Bindend für alle Länder ist nur: Teil A ohne Hilfsmittel, mit fester Abgabezeit. Aufbau, BE und Hilfsmittel legt dein Land fest – Termin und Hilfsmittel trägst du selbst ein.",
  },
};

/* ---------- Profil ---------- */
export const PROFIL_LEER = {
  land: "BW", jahr: 2027, niveau: "erhoeht", form: "schriftlich", hilfsmittel: "WTR",
  termin: null, muendlich: null, pruefungenAb: null, punkte: null, ziel: null, minuten: 20, ferien: true, fertig: false,
};
const NIVEAUS = ["erhoeht", "grundlegend"], FORMEN = ["schriftlich", "muendlich", "beides"], HILFSMITTEL = ["WTR", "CAS", "GTR"];
const istDatum = (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
const punkteWert = (p) => (p === null || p === undefined || p === "" ? null : Math.max(0, Math.min(15, Math.round(Number(p)))));

export function profilNormieren(p) {
  const r = { ...PROFIL_LEER, ...(p || {}) };
  if (!LAENDER.some((l) => l.id === r.land)) r.land = "BW";
  r.jahr = Math.max(2026, Math.min(2035, Math.round(Number(r.jahr)) || 2027));
  if (!NIVEAUS.includes(r.niveau)) r.niveau = "erhoeht";
  if (!FORMEN.includes(r.form)) r.form = "schriftlich";
  if (!HILFSMITTEL.includes(r.hilfsmittel)) r.hilfsmittel = "WTR";
  if (r.land === "BW") { r.hilfsmittel = "WTR"; r.form = r.niveau === "erhoeht" ? (r.form === "muendlich" ? "schriftlich" : r.form) : "muendlich"; }
  r.termin = istDatum(r.termin) ? r.termin : null;
  r.muendlich = istDatum(r.muendlich) ? r.muendlich : null;
  r.pruefungenAb = istDatum(r.pruefungenAb) ? r.pruefungenAb : null;
  r.punkte = Number.isNaN(punkteWert(r.punkte)) ? null : punkteWert(r.punkte);
  r.ziel = Number.isNaN(punkteWert(r.ziel)) ? null : punkteWert(r.ziel);
  r.minuten = [10, 20, 30].includes(Number(r.minuten)) ? Number(r.minuten) : 20;
  r.ferien = r.ferien !== false;
  r.fertig = !!r.fertig;
  return r;
}

/* Welches Prüfungsprofil gilt? BW: Leistungsfach schriftlich, Basisfach mündlich; sonst IQB-Format */
export function pruefungFuer(profil) {
  const p = profilNormieren(profil);
  if (p.land === "BW") return PRUEFUNGEN[p.niveau === "erhoeht" ? "bw-lf" : "bw-bf"];
  return PRUEFUNGEN[p.niveau === "erhoeht" ? "iqb-ea" : "iqb-ga"];
}

/* Prüfungstag der schriftlichen Prüfung (eigener Eintrag vor bekanntem Termin) */
export function schriftlichAm(profil) {
  const p = profilNormieren(profil);
  if (p.form === "muendlich") return null;
  if (p.termin) return p.termin;
  const pr = pruefungFuer(p);
  return (pr.termine && pr.termine[p.jahr] && pr.termine[p.jahr].haupt) || null;
}
/* Mündliche Prüfung: eigener Tag, sonst Beginn des Prüfungsfensters */
export function muendlichAm(profil) {
  const p = profilNormieren(profil);
  if (p.form === "schriftlich") return null;
  if (p.muendlich) return p.muendlich;
  const pr = p.land === "BW" ? PRUEFUNGEN["bw-bf"] : null;
  return (pr && pr.termine[p.jahr] && pr.termine[p.jahr].von) || null;
}
/* Beginn der schriftlichen Prüfungen aller Fächer (eigener Eintrag vor bekanntem Termin) – davor liegt die Generalprobe */
export function pruefungenAb(profil) {
  const p = profilNormieren(profil);
  if (p.pruefungenAb) return p.pruefungenAb;
  if (p.termin) return null;
  const pr = pruefungFuer(p);
  return (pr.termine && pr.termine[p.jahr] && pr.termine[p.jahr].schriftlichAb) || null;
}
/* Der nächste Prüfungstag, auf den der Plan zielt */
export function zielTermin(profil, heute = datum(Date.now())) {
  const kandidaten = [schriftlichAm(profil), muendlichAm(profil)].filter(Boolean).filter((d) => d >= heute).sort();
  return kandidaten[0] || null;
}

/* ---------- Datum (lokal, als JJJJ-MM-TT) ---------- */
export const datum = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const ms = (d) => Date.parse(`${d}T12:00:00Z`);
export const tageZwischen = (von, bis) => Math.round((ms(bis) - ms(von)) / TAG);
export const plusTage = (d, n) => new Date(ms(d) + n * TAG).toISOString().slice(0, 10);
const wochentag = (d) => new Date(ms(d)).getUTCDay();   // 0 = Sonntag
/* letzter Samstag am oder vor d */
const samstagVor = (d) => plusTage(d, -((wochentag(d) + 1) % 7));
const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const TAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
export const datumLang = (d) => (d ? `${TAGE[wochentag(d)]}, ${Number(d.slice(8))}. ${MONATE[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}` : "");
export const datumKurz = (d) => (d ? `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.` : "");

export function countdown(ziel, heute = datum(Date.now())) {
  if (!ziel) return null;
  const tage = tageZwischen(heute, ziel);
  return { tage, wochen: Math.floor(tage / 7), vorbei: tage < 0, heute: tage === 0 };
}

/* ---------- Rückwärtsplan ---------- */
export const PHASEN = {
  start: { titel: "Start", zeile: "Profil, Standortcheck, Lücken finden" },
  fundament: { titel: "Fundament und Teil A", zeile: "Pflichttypen ohne Hilfsmittel, Grundlagen schließen" },
  teilb: { titel: "Teil-B-Typen", zeile: "Unter der Woche Teilaufgaben, am Wochenende ganze Aufgaben" },
  form: { titel: "Prüfungsform", zeile: "Gemischte Sätze, Zeit, Wahlaufgaben" },
  wiederholen: { titel: "Wiederholen", zeile: "Fehlerliste, Formeln, nichts Neues – leicht, neben den anderen Prüfungen" },
  muendlich: { titel: "Mündlich üben", zeile: "Vortrag und Prüfungsgespräch mit Mia" },
};

/* Phasen von heute bis zur Prüfung. Je kürzer die Zeit, desto weniger Phasen.
   Generalprobe: am Samstag vor Beginn der schriftlichen Prüfungen (pruefungenAb), sonst zwei Wochen vorher.
   Ergebnis: { phasen: [{ id, titel, zeile, von, bis }], meilensteine: [{ id, titel, datum }] } */
export function rueckwaertsplan(von, bis, { muendlich = false, ab = null } = {}) {
  const D = tageZwischen(von, bis);
  if (!(D > 0)) return { phasen: [], meilensteine: [] };
  const phasen = [], meilensteine = [];
  const add = (id, a, b) => { if (tageZwischen(a, b) >= 0) phasen.push({ id, ...PHASEN[id], von: a, bis: b }); };
  if (muendlich) {
    const wdh = Math.min(14, Math.max(1, Math.round(D * 0.25)));
    add("start", von, plusTage(von, Math.min(6, D - 1)));
    const nachStart = plusTage(von, Math.min(7, D));
    if (tageZwischen(nachStart, plusTage(bis, -wdh - 1)) >= 0) add("muendlich", nachStart, plusTage(bis, -wdh - 1));
    add("wiederholen", plusTage(bis, -wdh), plusTage(bis, -1));
    if (D > 14) meilensteine.push({ id: "generalprobe", titel: "Generalprobe: Vortrag und Gespräch mit Mia", datum: plusTage(bis, -7) });
    meilensteine.push({ id: "pruefung", titel: "Mündliche Prüfung", datum: bis });
    return { phasen, meilensteine };
  }
  /* D Lerntage: von … bis − 1. Aufteilung Start | Mitte | Wiederholen, die Mitte nur ab 6 Tagen */
  const startTage = D >= 42 ? 7 : D >= 14 ? 3 : D >= 7 ? 1 : 0;
  let wdh = Math.min(28, Math.max(2, Math.round(D * 0.18)), D - startTage);
  let R = D - startTage - wdh;
  if (R < 6) { wdh += R; R = 0; }
  let i = 0;
  const abschnitt = (id, len) => { if (len > 0) { add(id, plusTage(von, i), plusTage(von, i + len - 1)); i += len; } return plusTage(von, i - 1); };
  abschnitt("start", startTage);
  if (R) {
    const anteile = D >= 84 ? [["fundament", 0.3], ["teilb", 0.43], ["form", 0.27]] : D >= 42 ? [["teilb", 0.55], ["form", 0.45]] : [["form", 1]];
    let rest = R;
    anteile.forEach(([id, anteil], k) => {
      const len = k === anteile.length - 1 ? rest : Math.max(1, Math.round(R * anteil));
      const b = abschnitt(id, len);
      rest -= len;
      if (id === "fundament") meilensteine.push({ id: "teilaprobe", titel: "Teil-A-Probe (30 BE, 110 Minuten)", datum: samstagVor(b) });
      if (id === "teilb") meilensteine.push({ id: "probeabi1", titel: "Probeabi 1", datum: samstagVor(b) });
      if (id === "form") meilensteine.push({ id: "probeabi2", titel: "Probeabi 2", datum: samstagVor(b) });
    });
  }
  abschnitt("wiederholen", wdh);
  if (D > 14) {
    const vorAllem = ab && ab < bis ? samstagVor(plusTage(ab, -1)) : null;
    meilensteine.push({ id: "generalprobe", titel: "Generalprobe zur Prüfungszeit", datum: vorAllem && vorAllem > von ? vorAllem : plusTage(bis, -14) });
  }
  meilensteine.push({ id: "pruefung", titel: "Schriftliche Prüfung", datum: bis });
  return { phasen, meilensteine: meilensteine.filter((m) => m.datum >= von && m.datum <= bis).sort((x, y) => (x.datum < y.datum ? -1 : 1)) };
}

/* Plan aus dem Profil: Start am Tag, an dem das Profil angelegt wurde (sonst heute) */
export function planFuer(profil, abiStand = null, heute = datum(Date.now())) {
  const p = profilNormieren(profil);
  const ziel = zielTermin(p, heute);
  if (!ziel) return { ziel: null, phasen: [], meilensteine: [] };
  const muendlich = ziel === muendlichAm(p) && ziel !== schriftlichAm(p);
  const beginn = abiStand && abiStand.beginn && abiStand.beginn <= heute ? abiStand.beginn : heute;
  return { ziel, muendlich, ...rueckwaertsplan(beginn < ziel ? beginn : heute, ziel, { muendlich, ab: muendlich ? null : pruefungenAb(p) }) };
}
export const phaseAm = (plan, tag) => (plan && plan.phasen ? plan.phasen.find((x) => x.von <= tag && tag <= x.bis) || null : null);
export const naechsterMeilenstein = (plan, tag) => (plan && plan.meilensteine ? plan.meilensteine.find((m) => m.datum >= tag) || null : null);

/* ---------- Ergebnisse ---------- */
export const MAX_ERGEBNISSE = 200;
export const ABI_LEER = { version: 1, profil: null, beginn: null, ergebnisse: [], proben: [], zuletzt: 0 };
export function abiNormieren(a) {
  const r = { ...ABI_LEER, ...(a && typeof a === "object" ? a : {}) };
  r.profil = r.profil ? profilNormieren(r.profil) : null;
  r.ergebnisse = Array.isArray(r.ergebnisse) ? r.ergebnisse.filter((e) => e && e.typ && Number.isFinite(e.be) && Number.isFinite(e.max)).slice(-MAX_ERGEBNISSE) : [];
  r.proben = Array.isArray(r.proben) ? r.proben.slice(-30) : [];
  r.zuletzt = Number(r.zuletzt) || 0;
  return r;
}
/* Ergebnis einer Abi-Aufgabe eintragen (be = erreicht, max = möglich, quelle = selbst | mia) */
export function ergebnisEintragen(abi, { typ, sachgebiet, be, max, quelle = "selbst", sekunden = null }, jetzt = Date.now()) {
  const r = abiNormieren(abi);
  const e = { typ, sachgebiet, be: Math.max(0, Math.min(max, Number(be) || 0)), max, quelle, sekunden, zeit: jetzt };
  r.ergebnisse = [...r.ergebnisse, e].slice(-MAX_ERGEBNISSE);
  r.zuletzt = jetzt;
  return r;
}
export function probeEintragen(abi, { art, be, max, sekunden }, jetzt = Date.now()) {
  const r = abiNormieren(abi);
  r.proben = [...r.proben, { art, be, max, sekunden, zeit: jetzt }].slice(-30);
  r.zuletzt = jetzt;
  return r;
}

/* Quote je Sachgebiet (letzte 30 Ergebnisse je Gebiet) */
export function statistik(abi) {
  const r = abiNormieren(abi);
  const aus = {};
  for (const g of ["analysis", "geometrie", "stochastik"]) {
    const liste = r.ergebnisse.filter((e) => e.sachgebiet === g).slice(-30);
    const be = liste.reduce((s, e) => s + e.be, 0), max = liste.reduce((s, e) => s + e.max, 0);
    aus[g] = { anzahl: liste.length, be, max, quote: max ? be / max : null };
  }
  return aus;
}
/* Schwächstes Gebiet: noch nie geübt vor niedrigster Quote */
export function schwaechstesGebiet(abi) {
  const s = statistik(abi);
  const ordnung = ["analysis", "geometrie", "stochastik"];
  const leer = ordnung.find((g) => !s[g].anzahl);
  if (leer) return leer;
  return ordnung.slice().sort((a, b) => s[a].quote - s[b].quote)[0];
}

/* Vorschläge für heute je Phase – Verweise in der App (ziel = gehe-Eintrag) */
export function heuteVorschlaege(profil, plan, abi, heute = datum(Date.now())) {
  const p = profilNormieren(profil);
  const phase = phaseAm(plan, heute);
  const gebiet = schwaechstesGebiet(abi);
  const GEBIET = { analysis: "Analysis", geometrie: "Geometrie", stochastik: "Stochastik" };
  const liste = [];
  if (p.form !== "muendlich") liste.push({ id: "aufgabe", titel: `Abi-Aufgabe ${GEBIET[gebiet]}`, zeile: "Eine 5-BE-Aufgabe im Prüfungsformat, Uhr läuft", ziel: { ansicht: "abiaufgaben" }, gebiet, gold: true });
  if (!phase || phase.id === "start") liste.push({ id: "check", titel: "Standortcheck", zeile: "Wo stehst du? Kurze Aufgaben je Gebiet", ziel: { ansicht: "lernpfad" } });
  if (phase && phase.id === "form") liste.push({ id: "probe", titel: "Teil-A-Probe", zeile: "Zehn Aufgaben, sechs bearbeiten, 110 Minuten", ziel: { ansicht: "abiteila" } });
  if (phase && (phase.id === "muendlich" || p.form !== "schriftlich")) liste.push({ id: "muendlich", titel: "Mündliche Prüfung üben", zeile: "Vortrag und Gespräch mit Mia", ziel: { ansicht: "mia" }, mia: "muendlich" });
  liste.push({ id: "mia", titel: "Lösung von Mia korrigieren lassen", zeile: "Foto vom Blatt, BE je Schritt", ziel: { ansicht: "mia" } });
  liste.push({ id: "training", titel: "Mein Mathe-Training", zeile: `Dein Tagesplan, ${p.minuten} Minuten`, ziel: { ansicht: "meintraining" } });
  return liste.slice(0, 4);
}

/* ---------- Verweise in der App ---------- */
export const TRAINER = {
  analysis: ["ableitungstrainer", "kurvendiskussion", "scharen", "steckbrief", "optimierung", "integrale", "wachstum", "sinus"],
  geometrie: ["vektorgenerator", "lgs", "dreipunkte", "geraden", "ebenevsebene", "abstaende"],
  stochastik: ["kombinatorik", "vierfelder", "bernoulli", "hypothesentest", "normalverteilung"],
};
export const KURSE = [
  { id: "diffkurs", titel: "Differentialrechnung", zeile: "Schulbuch lesen, direkt trainieren", ziel: { ansicht: "diffkurs" }, gebiet: "analysis" },
  { id: "vekkurs", titel: "Vektoren, Geraden und Ebenen", zeile: "Heftkapitel lesen und trainieren", ziel: { ansicht: "vekkurs" }, gebiet: "geometrie" },
  { id: "efunktion", titel: "Minikurs e-Funktion", zeile: "Die wichtigste Funktion der Oberstufe", ziel: { ansicht: "efunktion" }, gebiet: "analysis" },
  { id: "penpaper", titel: "Pen & Paper", zeile: "Sauber aufschreiben – BE sichern", ziel: { ansicht: "penpaperkurs" } },
  { id: "mckurs", titel: "Mathe Abi Masterclass", zeile: "Kursbereich mit Videos und Live-Calls", ziel: { ansicht: "mckurs" } },
  { id: "kiwahl", titel: "Mathe mit KI lernen", zeile: "Mathilda, Gemini, Claude richtig nutzen", ziel: { ansicht: "kiwahl" } },
  { id: "headnumbers", titel: "Kopfrechnen", zeile: "Teil A heißt: ohne Rechner", ziel: { ansicht: "headnumbers" } },
  { id: "formeln", titel: "Formelsammlung", zeile: "238 Formeln mit Herleitung", ziel: { ansicht: "formeln" } },
];
export const SIMULATION = [
  { id: "teila", titel: "Teil-A-Probe", zeile: "Zehn Aufgaben, sechs bearbeiten, 110 Minuten – wie im Leistungsfach", ziel: { ansicht: "abiteila" }, gold: true },
  { id: "abiketten", titel: "Abi-Ketten", zeile: "Analysis, Geometrie, Stochastik unter Zeit", ziel: { ansicht: "abiketten" } },
  { id: "abisaetze", titel: "Abi-Sätze", zeile: "Teil A und B am Stück (noch im alten 60-VP-Format)", ziel: { ansicht: "abisaetze" } },
  { id: "probeabitur", titel: "Probeabitur", zeile: "Einmal alles unter Prüfungsbedingungen", ziel: { ansicht: "abitur" } },
  { id: "pruefung", titel: "Prüfungsmodus", zeile: "Ein Thema mit Uhr und automatischer Abgabe", ziel: { ansicht: "pruefung" } },
];

/* Zeitvorgabe: rund 3 Minuten je BE (300 Minuten für 100 BE) */
export const minutenFuer = (be) => Math.round(be * 3);
