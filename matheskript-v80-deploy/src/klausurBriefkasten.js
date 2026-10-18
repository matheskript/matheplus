/* ======================================================================
   klausurBriefkasten.js – Mathildas Klausurbriefkasten (reine Logik, kein React)
   Tests: tests/klausurBriefkasten.test.mjs

   Schüler werfen das Aufgabenblatt einer zurückgegebenen Klassenarbeit ein.
   Grundsatz „analysieren statt sammeln“:
   - Das Foto bleibt im Browser, geht nur zur Analyse an Mathilda (Anthropic)
     und wird danach verworfen. Es wird nirgends gespeichert.
   - Mathilda liefert NUR die Struktur: Thema, Aufgabentypen, Operatoren,
     Anforderungsbereiche, Punkte, Dauer, Hilfsmittel – in eigenen Worten,
     ohne Aufgabentexte, ohne Zahlenwerte, ohne Namen, ohne Noten.
   - Gespeichert wird nur diese Struktur plus Bundesland, Schulart, Klasse,
     optional Schule und Monat (supabase/klausurbriefkasten.sql).
   - Aus vielen Meldungen entsteht ein Profil je Land/Schulart/Klasse/Kapitel
     (profilAus) – daraus baut die App eigene, neue Testklausuren.
   ====================================================================== */
import { PLAN, SCHULARTEN, THEMEN } from "./schulbuch.js";

export const VERSION = 1;
export const MAX_SEITEN = 3;
export const MAX_BYTES_GESAMT = 3.4 * 1024 * 1024;   // Body-Limit api/claude.js: 4 MB (Base64 + Prompt)

/* ---------- Auswahllisten ---------- */
export const BUNDESLAENDER = [
  ["bw", "Baden-Württemberg"], ["by", "Bayern"], ["be", "Berlin"], ["bb", "Brandenburg"], ["hb", "Bremen"], ["hh", "Hamburg"],
  ["he", "Hessen"], ["mv", "Mecklenburg-Vorpommern"], ["ni", "Niedersachsen"], ["nw", "Nordrhein-Westfalen"], ["rp", "Rheinland-Pfalz"],
  ["sl", "Saarland"], ["sn", "Sachsen"], ["st", "Sachsen-Anhalt"], ["sh", "Schleswig-Holstein"], ["th", "Thüringen"],
].map(([id, name]) => ({ id, name }));

/* G8/G9/GMS aus schulbuch.js (Baden-Württemberg) + allgemeine Schularten anderer Länder */
export const SCHULARTEN_BK = [
  ...SCHULARTEN.map((s) => ({ id: s.id, name: s.id === "gms" ? "Gemeinschaftsschule" : `Gymnasium ${s.name}`, zeile: s.zeile, maxKlasse: s.id === "g8" ? 12 : 13 })),
  { id: "realschule", name: "Realschule", zeile: "Abschluss nach Klasse 10", maxKlasse: 10 },
  { id: "gesamtschule", name: "Gesamtschule / Stadtteilschule", zeile: "mit gymnasialer Oberstufe", maxKlasse: 13 },
  { id: "berufl", name: "Berufliches Gymnasium", zeile: "Klassen 11 bis 13", maxKlasse: 13 },
  { id: "sonstige", name: "Andere Schulart", zeile: "", maxKlasse: 13 },
];
export const schulartBk = (id) => SCHULARTEN_BK.find((s) => s.id === id) || null;
export const klassenFuer = (schulartId) => {
  const s = schulartBk(schulartId);
  const von = schulartId === "berufl" ? 11 : 5;
  const bis = s ? s.maxKlasse : 13;
  return Array.from({ length: bis - von + 1 }, (_, i) => von + i);
};

/* Buchkapitel zur Klasse (Lambacher Schweizer BW als Orientierung; andere Schularten wie G9) */
export function kapitelZurKlasse(schulartId, klasse) {
  const plan = PLAN[schulartId] || PLAN.g9;
  const box = Number(klasse) <= 6 ? "5-6" : String(klasse);
  return (plan[box] || []).filter((id) => THEMEN[id]).map((id) => ({ id, titel: THEMEN[id].titel, zeile: THEMEN[id].zeile }));
}

export const ARTEN = ["klassenarbeit", "klausur", "test", "abitur", "sonstiges"];
export const HILFSMITTEL = ["keine", "wtr", "gtr", "cas", "formelsammlung", "merkhilfe"];
export const ANFORDERUNG = ["I", "II", "III"];
export const DARSTELLUNG = ["text", "term", "graph", "tabelle", "skizze", "diagramm"];

/* ---------- Was der Schüler vorher bestätigt (wird nicht gespeichert, nur verlangt) ---------- */
export const FREIGABE = [
  { id: "zurueck", de: "Ich habe die Arbeit schon zurückbekommen und darf das Aufgabenblatt behalten.", en: "I have already got the test back and may keep the task sheet." },
  { id: "alle", de: "Alle haben sie geschrieben – auch Parallelklassen und Nachschreiber.", en: "Everyone has written it – including parallel classes and make-up tests." },
  { id: "nurAufgaben", de: "Auf dem Foto ist nur das Aufgabenblatt: kein Name, keine Note, keine Lösungen oder Korrekturen.", en: "The photo shows only the task sheet: no name, no grade, no solutions or corrections." },
];
export const freigabeKomplett = (f) => FREIGABE.every((x) => f && f[x.id] === true);

/* ---------- Auftrag an Mathilda ---------- */
export const ANALYSE_REGELN = `MODUS „KLAUSURBRIEFKASTEN“ (vom Schüler ausdrücklich gewählt):
Du analysierst das Aufgabenblatt einer zurückgegebenen Klassenarbeit, damit die App später EIGENE, NEUE Übungsklausuren im passenden Stil bauen kann.
Du lieferst nur die STRUKTUR der Arbeit, nie ihren Inhalt:
- KEINE Abschrift, KEINE wörtlichen Aufgabentexte, KEINE Zahlenwerte, Funktionsterme oder Daten aus den Aufgaben.
  Beschreibe jede Aufgabe allgemein in eigenen Worten („Nullstellen einer ganzrationalen Funktion 3. Grades durch Ausklammern bestimmen“).
- KEINE Namen von Personen (Schüler, Lehrkraft), KEINE Schulnamen, KEINE Noten, KEINE Kürzel, Unterschriften oder Korrekturen.
  Steht so etwas auf dem Foto, ignorierst du es und meldest nur in "personenbezug", WELCHE Art von Angabe zu sehen war.
- Du löst nichts und bewertest nichts.`;

export function analysePrompt({ seiten = 1, bundesland = "", schulart = "", klasse = "", kapitel = null } = {}) {
  const land = (BUNDESLAENDER.find((b) => b.id === bundesland) || {}).name || "unbekannt";
  const art = (schulartBk(schulart) || {}).name || "unbekannt";
  const liste = kapitelZurKlasse(schulart, klasse);
  const gewaehlt = kapitel && THEMEN[kapitel] ? `Der Schüler ordnet die Arbeit dem Kapitel „${THEMEN[kapitel].titel}“ (id ${kapitel}) zu.` : "Der Schüler hat kein Kapitel gewählt.";
  return `${seiten > 1 ? `Die ${seiten} Fotos sind Seiten derselben Arbeit, in dieser Reihenfolge.` : "Auf dem Foto ist das Aufgabenblatt einer Mathe-Arbeit."}
Angaben des Schülers: ${land}, ${art}, Klasse ${klasse || "?"}. ${gewaehlt}
Kapitel dieser Klasse (id: Titel): ${liste.map((k) => `${k.id}: ${k.titel}`).join(" · ") || "keine Liste"}

So gehst du vor:
1. Ist es kein Aufgabenblatt einer Mathe-Arbeit oder unlesbar: "lesbar": false und eine kurze Bitte in "rueckfrage". Nicht raten.
2. "art": genau eines von ${ARTEN.map((a) => `"${a}"`).join(", ")}.
3. "kapitel": die passendste id aus der Liste oben (oder null), "thema": das Thema in 2–6 Wörtern, "schwerpunkte": bis zu 5 Stichwörter.
4. "dauer_min", "gesamtpunkte": nur wenn auf dem Blatt angegeben, sonst null. "hilfsmittel": Liste aus ${HILFSMITTEL.map((a) => `"${a}"`).join(", ")} – nur was angegeben oder eindeutig ist (z. B. ein Teil „ohne Taschenrechner“ → "keine" und "wtr").
5. "aufgaben": jede Teilaufgabe einzeln, höchstens 30:
   "nr" (wie auf dem Blatt, z. B. "2b"), "typ" (Aufgabentyp in 3–8 Wörtern), "operator" (das Verb, z. B. "Berechne", "Begründe", "Skizziere"),
   "inhalt" (höchstens 25 Wörter, allgemein, OHNE Zahlen und Terme aus der Aufgabe), "kontext" ("innermathematisch" oder der Sachkontext in 1–3 Wörtern, z. B. "Wurf", "Handytarif"),
   "punkte" (Zahl oder null), "anforderung" ("I" reproduzieren, "II" zusammenhängen, "III" verallgemeinern/reflektieren),
   "darstellung": Liste aus ${DARSTELLUNG.map((a) => `"${a}"`).join(", ")}, "ohne_hilfsmittel": true/false.
6. "niveau": 1 (leicht) bis 5 (sehr anspruchsvoll) im Vergleich zu üblichen Arbeiten dieser Klasse. "besonderheiten": bis zu 4 kurze Beobachtungen zum Aufbau (z. B. „Beweisaufgabe am Ende“, „Fehler finden“, „Teil A ohne Hilfsmittel“).
7. "personenbezug": Liste aus "name", "note", "korrektur", "loesungen", "unterschrift", "schule", "lehrkraft" – was davon auf dem Foto zu sehen war. Sonst [].

Antworte NUR mit diesem JSON, ohne Text davor oder danach:
{"lesbar": true, "rueckfrage": null, "art": "klassenarbeit", "kapitel": "quad", "thema": "Quadratische Funktionen", "schwerpunkte": ["Scheitelform", "Nullstellen"],
 "dauer_min": 45, "gesamtpunkte": 40, "hilfsmittel": ["wtr"],
 "aufgaben": [{"nr": "1a", "typ": "Scheitelpunkt aus Normalform bestimmen", "operator": "Bestimme", "inhalt": "Normalform per quadratischer Ergänzung in Scheitelform bringen", "kontext": "innermathematisch", "punkte": 4, "anforderung": "I", "darstellung": ["term"], "ohne_hilfsmittel": false}],
 "niveau": 3, "besonderheiten": [], "personenbezug": []}`;
}

/* ---------- Personenbezogenes aus Freitext entfernen (zweite Sicherung nach dem Prompt) ---------- */
const SCHULWORT = "(?:Gymnasium|Realschule|Gesamtschule|Gemeinschaftsschule|Stadtteilschule|Oberschule|Schulzentrum|Kolleg|Lyzeum|Schule)";
export function ohnePersonen(s) {
  let t = String(s == null ? "" : s);
  t = t.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "")                                            // E-Mail
    .replace(/https?:\/\/\S+|www\.\S+/gi, "")                                                 // Links
    .replace(/(?:\+?\d[\d ()/-]{7,}\d)/g, (m) => (/\d{6,}|\d{3,}[ /-]\d{3,}/.test(m) ? "" : m)) // Telefonnummern
    .replace(/\b(?:Herr|Frau|Hr\.|Fr\.|Mr\.|Mrs\.|Ms\.|Dr\.|StR|StRin|OStR|OStRin)\s+[A-ZÄÖÜ][\wäöüß.-]*(?:\s+[A-ZÄÖÜ][\wäöüß-]+)?/g, "Lehrkraft")
    .replace(/\b(?:Name|Vorname|Nachname|Klasse\s+von|Lehrer(?:in)?|Lehrkraft|Fachlehrer(?:in)?|Kürzel)\s*:\s*[^,;\n]*/gi, "")
    .replace(/\bNote\s*:?\s*[1-6](?:[+-]|,\d)?\b|\b(?:sehr gut|gut|befriedigend|ausreichend|mangelhaft|ungenügend)\s*\([1-6]\)/gi, "")
    .replace(new RegExp(`\\b[A-ZÄÖÜ][\\wäöüß.]*(?:-[A-ZÄÖÜ][\\wäöüß.]*)*-${SCHULWORT}\\b`, "g"), "Schule")
    .replace(new RegExp(`\\b${SCHULWORT}\\s+(?:am|an der|an den|in|im)\\s+[A-ZÄÖÜ][\\wäöüß-]*(?:\\s+[A-ZÄÖÜ][\\wäöüß-]*)?`, "g"), "Schule")
    .replace(/\s*\b(?:bei|von|mit|für|an)\s+(?:der\s+|dem\s+|unserer\s+|unserem\s+)?Lehrkraft\b/gi, "")
    .replace(/\s{2,}/g, " ").replace(/\s+([,.;:])/g, "$1").trim();
  return t;
}

/* ---------- Antwort normalisieren: nur erlaubte Felder, gekürzt, ohne Personenbezug ---------- */
const txt = (v, max) => ohnePersonen(typeof v === "string" ? v : v == null ? "" : String(v)).slice(0, max).trim();
const liste = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]);
const zahl = (v, min, max) => { const n = Number(v); return Number.isFinite(n) && n >= min && n <= max ? Math.round(n * 2) / 2 : null; };
const ausListe = (v, erlaubt) => [...new Set(liste(v).map((x) => String(x).toLowerCase().trim()).filter((x) => erlaubt.includes(x)))];
const wortAnzahl = (s) => s.split(/\s+/).filter(Boolean).length;
/* Zahlenwerte, Terme und Gleichungen aus Beschreibungen entfernen (z. B. „f(x) = 2x³ − 4“, „bei x = 3“) */
export function ohneZahlenwerte(s) {
  return String(s)
    .replace(/\$[^$]*\$/g, "")
    .replace(/[A-Za-z]\s*\([^)]*\)\s*=\s*[^\s,;.]+(?:\s*[+\-−·*/]\s*[^\s,;.]+)*/g, "")
    .replace(/[A-Za-z]\s*=\s*-?[\d,.]+[^\s,;.]*/g, "")
    .replace(/(?:[\d.,]+\s*[a-z²³⁴]?\s*[+\-−·*/^=]\s*)+[\d.,]+[a-z²³⁴]*/gi, "")
    .replace(/\(\s*-?[\d.,]+\s*[|;]\s*-?[\d.,]+\s*\)/g, "")
    .replace(/\s{2,}/g, " ").replace(/\s+([,.;:])/g, "$1").replace(/^[,.;:\s]+|[,;:\s]+$/g, "").trim()
    .split(" ").reduce(satzrestWeg, []).join(" ").replace(/\s+([,.;:])/g, "$1").trim();
}
/* Nach dem Entfernen von Termen bleiben Reste wie „Scheitel von per Ergänzung“ – verwaiste Verhältniswörter weg */
const VERWAIST = /^(?:von|bei|für|mit|durch|an|zu|und|im|am|in)$/i;
const DANACH = /^(?:per|mit|durch|bei|von|und|deuten|berechnen|bestimmen|zeigen|ermitteln|angeben|skizzieren|[,.;:])$/i;
function satzrestWeg(acc, w, i, alle) {
  if (VERWAIST.test(w) && (i === alle.length - 1 || DANACH.test(alle[i + 1]) || VERWAIST.test(alle[i + 1]))) return acc;
  acc.push(w); return acc;
}

export function analyseLesen(roh, { kapitelErlaubt = null } = {}) {
  const o = roh && typeof roh === "object" ? roh : {};
  const aufgaben = liste(o.aufgaben).slice(0, 30).map((a) => {
    const x = a && typeof a === "object" ? a : {};
    const inhalt = ohneZahlenwerte(txt(x.inhalt, 220));
    return {
      nr: txt(x.nr, 8).replace(/[^\w.)-]/g, ""),
      typ: ohneZahlenwerte(txt(x.typ, 90)),
      operator: txt(x.operator, 30).replace(/[^A-Za-zÄÖÜäöüß -]/g, "").trim(),
      inhalt: wortAnzahl(inhalt) > 30 ? inhalt.split(/\s+/).slice(0, 30).join(" ") + " …" : inhalt,
      kontext: txt(x.kontext, 40) || "innermathematisch",
      punkte: zahl(x.punkte, 0, 200),
      anforderung: ANFORDERUNG.includes(String(x.anforderung).toUpperCase()) ? String(x.anforderung).toUpperCase() : null,
      darstellung: ausListe(x.darstellung, DARSTELLUNG),
      ohneHilfsmittel: x.ohne_hilfsmittel === true || x.ohneHilfsmittel === true,
    };
  }).filter((a) => a.typ || a.inhalt);
  const kap = typeof o.kapitel === "string" && THEMEN[o.kapitel] && (!kapitelErlaubt || kapitelErlaubt.includes(o.kapitel)) ? o.kapitel : null;
  const lesbar = o.lesbar !== false && aufgaben.length > 0;
  return {
    lesbar,
    rueckfrage: txt(o.rueckfrage, 300) || (lesbar ? "" : "Ich konnte darauf kein Aufgabenblatt einer Mathe-Arbeit erkennen. Fotografiere es noch einmal gerade von oben bei gutem Licht."),
    art: ARTEN.includes(o.art) ? o.art : "klassenarbeit",
    kapitel: kap,
    thema: ohneZahlenwerte(txt(o.thema, 80)),
    schwerpunkte: liste(o.schwerpunkte).map((x) => ohneZahlenwerte(txt(x, 50))).filter(Boolean).slice(0, 5),
    dauerMin: zahl(o.dauer_min ?? o.dauerMin, 5, 330),
    gesamtpunkte: zahl(o.gesamtpunkte, 1, 500),
    hilfsmittel: ausListe(o.hilfsmittel, HILFSMITTEL),
    aufgaben,
    niveau: zahl(o.niveau, 1, 5) == null ? null : Math.round(Number(o.niveau)),
    besonderheiten: liste(o.besonderheiten).map((x) => ohneZahlenwerte(txt(x, 90))).filter(Boolean).slice(0, 4),
    personenbezug: ausListe(o.personenbezug, ["name", "note", "korrektur", "loesungen", "unterschrift", "schule", "lehrkraft"]),
  };
}

/* ---------- Angaben des Schülers prüfen ---------- */
export function angabenFehler({ bundesland, schulart, klasse, monat } = {}, heute = new Date()) {
  const f = [];
  if (!BUNDESLAENDER.some((b) => b.id === bundesland)) f.push("bundesland");
  if (!schulartBk(schulart)) f.push("schulart");
  if (!klassenFuer(schulart).includes(Number(klasse))) f.push("klasse");
  if (monat) {
    const m = /^(\d{4})-(\d{2})$/.exec(monat);
    const jetzt = heute.getFullYear() * 12 + heute.getMonth();
    if (!m || Number(m[2]) < 1 || Number(m[2]) > 12 || Number(m[1]) * 12 + Number(m[2]) - 1 > jetzt || Number(m[1]) * 12 + Number(m[2]) - 1 < jetzt - 36) f.push("monat");
  }
  return f;
}

/* Schulname nur grob säubern: keine Mails/Links/Telefon, kurz */
export const schuleSaeubern = (s) => String(s || "").replace(/[\w.+-]+@[\w-]+\.[\w.-]+|https?:\/\/\S+|www\.\S+/g, "").replace(/[<>{}$]/g, "").replace(/\s+/g, " ").trim().slice(0, 100);

/* ---------- Die Meldung, die tatsächlich gespeichert wird ---------- */
export function meldungBauen({ angaben = {}, analyse }) {
  const a = analyse || {};
  return {
    v: VERSION,
    bundesland: angaben.bundesland,
    schulart: angaben.schulart,
    klasse: Number(angaben.klasse),
    schule: schuleSaeubern(angaben.schule) || null,
    monat: angaben.monat || null,
    kapitel: angaben.kapitel && THEMEN[angaben.kapitel] ? angaben.kapitel : a.kapitel || null,
    analyse: {
      art: a.art, thema: a.thema, schwerpunkte: a.schwerpunkte, dauerMin: a.dauerMin, gesamtpunkte: a.gesamtpunkte,
      hilfsmittel: a.hilfsmittel, niveau: a.niveau, besonderheiten: a.besonderheiten,
      aufgaben: (a.aufgaben || []).map(({ nr, typ, operator, inhalt, kontext, punkte, anforderung, darstellung, ohneHilfsmittel }) =>
        ({ nr, typ, operator, inhalt, kontext, punkte, anforderung, darstellung, ohneHilfsmittel })),
    },
  };
}

/* Größe in Bytes (die Datenbank begrenzt analyse auf 24 kB) */
export const meldungGroesse = (m) => new TextEncoder().encode(JSON.stringify(m)).length;

/* ---------- Auswertung vieler Meldungen → Profil für Testklausuren ----------
   filter: { bundesland, schulart, klasse, kapitel } – leere Felder = alle. */
const zaehle = (werte) => {
  const z = new Map();
  for (const w of werte) if (w != null && w !== "") z.set(w, (z.get(w) || 0) + 1);
  return [...z.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))).map(([wert, anzahl]) => ({ wert, anzahl }));
};
const median = (xs) => { const s = xs.filter((x) => x != null).sort((a, b) => a - b); if (!s.length) return null; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const normTyp = (s) => String(s || "").toLowerCase().replace(/[^a-zäöüß0-9 ]/g, "").replace(/\s+/g, " ").trim();

export function profilAus(meldungen, filter = {}) {
  const passt = (m) => ["bundesland", "schulart", "kapitel"].every((k) => !filter[k] || m[k] === filter[k]) && (!filter.klasse || Number(m.klasse) === Number(filter.klasse));
  const ms = (meldungen || []).filter((m) => m && m.analyse && passt(m));
  const auf = ms.flatMap((m) => m.analyse.aufgaben || []);
  const anf = zaehle(auf.map((a) => a.anforderung));
  const summeAnf = anf.reduce((n, x) => n + x.anzahl, 0) || 1;
  return {
    anzahl: ms.length,
    schulen: new Set(ms.map((m) => (m.schule || "").toLowerCase()).filter(Boolean)).size,
    dauerMin: median(ms.map((m) => m.analyse.dauerMin)),
    gesamtpunkte: median(ms.map((m) => m.analyse.gesamtpunkte)),
    aufgabenJeArbeit: median(ms.map((m) => (m.analyse.aufgaben || []).length)),
    niveau: median(ms.map((m) => m.analyse.niveau)),
    anforderung: Object.fromEntries(ANFORDERUNG.map((k) => [k, Math.round((100 * ((anf.find((x) => x.wert === k) || {}).anzahl || 0)) / summeAnf)])),
    typen: zaehle(auf.map((a) => normTyp(a.typ))).slice(0, 20),
    operatoren: zaehle(auf.map((a) => (a.operator || "").trim())).slice(0, 12),
    kontexte: zaehle(auf.map((a) => a.kontext).filter((k) => k && k !== "innermathematisch")).slice(0, 12),
    anteilSachkontext: auf.length ? Math.round((100 * auf.filter((a) => a.kontext && a.kontext !== "innermathematisch").length) / auf.length) : 0,
    anteilOhneHilfsmittel: auf.length ? Math.round((100 * auf.filter((a) => a.ohneHilfsmittel).length) / auf.length) : 0,
    hilfsmittel: zaehle(ms.flatMap((m) => m.analyse.hilfsmittel || [])),
    besonderheiten: zaehle(ms.flatMap((m) => m.analyse.besonderheiten || [])).slice(0, 8),
  };
}

/* Anzeige-Namen */
export const ART_NAME = { klassenarbeit: ["Klassenarbeit", "Class test"], klausur: ["Klausur", "Exam"], test: ["Test", "Quiz"], abitur: ["Abitur", "Final exam"], sonstiges: ["Sonstiges", "Other"] };
export const HILFSMITTEL_NAME = { keine: ["ohne Hilfsmittel", "no aids"], wtr: ["Taschenrechner", "calculator"], gtr: ["Grafikrechner", "graphing calculator"], cas: ["CAS", "CAS"], formelsammlung: ["Formelsammlung", "formula sheet"], merkhilfe: ["Merkhilfe", "reference sheet"] };
export const PERSON_NAME = { name: ["Name", "name"], note: ["Note", "grade"], korrektur: ["Korrekturen", "corrections"], loesungen: ["Lösungen", "solutions"], unterschrift: ["Unterschrift", "signature"], schule: ["Schulname", "school name"], lehrkraft: ["Lehrkraft", "teacher"] };
