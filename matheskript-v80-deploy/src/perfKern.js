/* ======================================================================
   perfKern.js – Fehlergedächtnis des Performance-Labs (reine Logik, kein React, kein Speicher).

   EIN Gedächtnis für zwei Lernkanäle:
     · Kanal A (digital): Übungstools melden einen Fehler samt Aufgabe und Eingabe.
     · Kanal B (Scan):    Handschrift-Analysen melden Zeilen; der Kern prüft selbst nach,
                          ob der gemeldete Schritt mathematisch wirklich falsch ist.
   Beide laufen durch dieselbe Aufnahme (ereignisBauen → speichereEreignis), dieselbe
   Taxonomie (perfTaxonomie.js) und dasselbe Clustering.

   Grundsätze
     · Beobachtung, mathematische Prüfung, Ursachenhypothese und Konfidenz werden getrennt geführt.
     · Nur der früheste falsche Schritt zählt; Folgefehler werden nicht als eigene Ursache gespeichert.
     · Unsichere Ereignisse landen in „zur Klärung“, nie in einem bestätigten Cluster.
     · Muster sind abgestuft (einzeln → möglich → wiederkehrend → gestützt) und immer erklärbar.
     · Alles ist idempotent: dieselbe Meldung zweimal ergibt ein Ereignis.

   Die Datenhaltung ist ausgelagert: dieses Modul arbeitet auf einem Objekt P (siehe leerePerf)
   und kennt weder localStorage noch Server. Ein späterer Server-Endpunkt ruft dieselben
   Funktionen auf. Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { aequivalent, erkenneVorzeichenfehler, fruehesterFehler } from "./perfAlgebra.js";
import { FEHLERTYPEN_TAX, KONTEXTE, TAXONOMIE_VERSION, kontextName, normiereTyp, typName, untertypName } from "./perfTaxonomie.js";

export const SCHEMA_VERSION = 1;
export const TAG = 86400000;

/* Alle Schwellen an einer Stelle – sie erscheinen auch in den Erklärtexten der Oberfläche. */
export const SCHWELLEN = {
  mindKonfidenz: 0.5,        // darunter zählt ein Ereignis nie
  sicherKonfidenz: 0.75,     // ab hier gilt ein Ereignis als „sicher“
  scanMindKonfidenz: 0.6,    // Scan: darunter immer „unsicher“
  scanMindLesbarkeit: 5,     // Scan: Lesbarkeit 0–10, darunter immer „unsicher“
  kiMaxKonfidenz: 0.8,       // reine KI-Diagnose wird nie sicherer als das
  moeglich: 2,               // ab 2 Beobachtungen: mögliches Muster
  wiederkehrend: 3,          // ab 3 Beobachtungen …
  wiederkehrendTage: 2,      // … an mindestens 2 Tagen …
  wiederkehrendAufgaben: 2,  // … in mindestens 2 verschiedenen Aufgaben …
  wiederkehrendSicher: 2,    // … davon mindestens 2 sichere Ereignisse
  gestuetzt: 5,              // gestützt: ≥ 5 Beobachtungen an ≥ 3 Tagen
  gestuetztTage: 3,          //   oder ≥ 4 Beobachtungen in beiden Kanälen
  gestuetztKanalMin: 4,
  fenster: 8,                // Vergleichsfenster für Fehlerquoten (Aufgaben)
  mindFenster: 4,            // kleinstes zulässiges Fenster
  unterschied: 0.15,         // Mindestunterschied der Quoten für „seltener/häufiger“
  maxSchwierigkeitsAbstand: 0.75,
  rueckfallTage: 14,
  nachTrainingMin: 4,        // so viele neue Aufgaben braucht eine Aussage nach dem Training
  maxEreignisse: 500, maxAufgaben: 800, maxRunden: 120, maxProtokoll: 200,
};

export const STATUS_NAMEN = { erkannt: "erkannt", bestaetigt: "bestätigt", unsicher: "unsicher", verworfen: "verworfen" };
export const MUSTER_NAMEN = {
  einzeln: "einzelne Beobachtung", moeglich: "mögliches Muster", wiederkehrend: "wiederkehrendes Muster", gestuetzt: "durch weitere Beobachtungen gestützt",
};
const MUSTER_RANG = { einzeln: 1, moeglich: 2, wiederkehrend: 3, gestuetzt: 4 };
export const QUELLEN = { digital: "digitale Übung", scan: "eingescanntes Blatt", manuell: "manuell gemeldet" };

/* ---------- Grundbausteine ---------- */
function fnv(text, seed) {
  let h = seed >>> 0;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(16).padStart(8, "0");
}
export const hashId = (...teile) => { const t = teile.map((x) => String(x ?? "")).join("␟"); return fnv(t, 2166136261) + fnv(t, 5381); };
const tagVon = (ts) => Math.floor(ts / TAG);
const klemme = (v, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo));
const text = (v, max = 400) => String(v ?? "").slice(0, max);

export function leerePerf() {
  return { v: SCHEMA_VERSION, taxonomie: TAXONOMIE_VERSION, ereignisse: [], aufgaben: [], runden: [], badges: [], protokoll: [] };
}
export function normierePerf(P) {
  const d = { ...leerePerf(), ...(P || {}) };
  for (const k of ["ereignisse", "aufgaben", "runden", "badges", "protokoll"]) d[k] = Array.isArray(d[k]) ? d[k] : [];
  return d;
}
export function logge(P, was, ids = [], jetzt = Date.now()) {
  P.protokoll.push({ zeit: jetzt, was, ids });
  if (P.protokoll.length > SCHWELLEN.maxProtokoll) P.protokoll.splice(0, P.protokoll.length - SCHWELLEN.maxProtokoll);
}

/* ======================================================================
   1 · Aufnahme eines Fehlerereignisses (beide Kanäle)
   ====================================================================== */

/* Eingabe:
   { nutzerId, quelle: "digital"|"scan"|"manuell", zeit,
     aufgabe: { id, text, kontext, schwierigkeit },
     schritt (fehlerhafter Rechenschritt), korrekt, stelle,
     typ, untertyp, konfidenz, beobachtung, pruefung, hypothesen: [{typ, untertyp, konfidenz, grund}],
     ursprung: { art: "aufgabe"|"scan"|"manuell"|"legacy", ref },
     eingabeStatus: "gueltig" | "ungueltig"          (digital)
     typSicher: boolean                              (digital: Typ aus belegter typischer Fehlantwort)
     lesbarkeit: 0–10, mathGeprueft: boolean        (Scan)
     status: optional – nur "bestaetigt" wird übernommen (Nutzer hat bestätigt) }
   Ergebnis: { ok: true, ereignis } | { ok: false, grund } */
export function ereignisBauen(e, jetzt = Date.now()) {
  if (!e || typeof e !== "object") return { ok: false, grund: "Keine Daten übergeben." };
  const quelle = e.quelle;
  if (!QUELLEN[quelle]) return { ok: false, grund: "Unbekannte Quelle." };
  const nutzerId = text(e.nutzerId || "lokal", 80);
  const legacy = e.ursprung?.art === "legacy";
  const schritt = text(e.schritt, 300).trim();
  if (!schritt && !legacy) return { ok: false, grund: "Es fehlt der fehlerhafte Rechenschritt." };

  if (quelle === "digital") {
    if (e.eingabeStatus !== "gueltig" && !legacy) return { ok: false, grund: "Die Eingabe war mathematisch nicht lesbar – das ist ein Eingabefehler, kein Rechenfehler." };
    if (!e.typSicher && !legacy) return { ok: false, grund: "Der Fehlertyp ist nicht belegt – eine falsche Antwort allein wird nicht als Fehlertyp gespeichert." };
  }

  const nt = normiereTyp(e.typ, e.untertyp);
  if (!nt && quelle !== "scan") return { ok: false, grund: "Unbekannter Fehlertyp." };

  /* Konfidenz und Status: hier steckt die Vorsicht gegenüber Foto-Erkennung */
  let konfidenz = e.konfidenz;
  if (konfidenz == null) konfidenz = quelle === "manuell" ? 1 : quelle === "digital" ? 0.85 : 0.5;
  konfidenz = klemme(konfidenz, 0, 1);
  let status = "erkannt";
  if (quelle === "manuell") { status = "bestaetigt"; konfidenz = 1; }
  if (quelle === "scan") {
    const lesb = Number.isFinite(e.lesbarkeit) ? e.lesbarkeit : 0;
    if (!e.mathGeprueft) konfidenz = Math.min(konfidenz, 0.55);
    if (!nt || !e.mathGeprueft || konfidenz < SCHWELLEN.scanMindKonfidenz || lesb < SCHWELLEN.scanMindLesbarkeit) status = "unsicher";
  }
  if (e.status === "bestaetigt" && nt) status = "bestaetigt";   // ausdrückliche Bestätigung der Person

  const ref = text(e.ursprung?.ref || hashId(schritt, e.aufgabe?.text || ""), 120);
  const kontext = KONTEXTE[e.aufgabe?.kontext] ? e.aufgabe.kontext : "allgemein";
  const ereignis = {
    id: "ev-" + hashId(nutzerId, quelle, ref, schritt, nt?.typ || "offen", nt?.untertyp || ""),
    nutzerId, quelle, zeit: Number.isFinite(e.zeit) ? e.zeit : jetzt,
    aufgabe: { id: text(e.aufgabe?.id || ref, 120), text: text(e.aufgabe?.text, 300), kontext, schwierigkeit: klemme(Number(e.aufgabe?.schwierigkeit) || 2, 1, 3) },
    schritt, korrekt: text(e.korrekt, 300), stelle: text(e.stelle, 200),
    haupt: nt?.haupt || null, typ: nt?.typ || null, untertyp: nt?.untertyp || null,
    konfidenz, status,
    beobachtung: text(e.beobachtung || schritt, 400), pruefung: text(e.pruefung, 400),
    hypothesen: (Array.isArray(e.hypothesen) ? e.hypothesen : []).slice(0, 3).map((h) => ({
      typ: text(h.typ, 40), untertyp: text(h.untertyp, 40), konfidenz: klemme(h.konfidenz, 0, 1), grund: text(h.grund, 240),
    })),
    ursprung: { art: ["aufgabe", "scan", "manuell", "legacy"].includes(e.ursprung?.art) ? e.ursprung.art : quelle === "scan" ? "scan" : "aufgabe", ref },
    taxonomie: TAXONOMIE_VERSION,
  };
  if (e.demo) ereignis.demo = true;
  return { ok: true, ereignis };
}

/* Zählt ein Ereignis für Muster und Profil? */
export const zaehlt = (e) => !!e.typ && (e.status === "erkannt" || e.status === "bestaetigt") && e.konfidenz >= SCHWELLEN.mindKonfidenz;
export const istSicher = (e) => e.status === "bestaetigt" || e.konfidenz >= SCHWELLEN.sicherKonfidenz;

/* Cluster-Schlüssel: gleicher Fehlertyp UND gleicher Untertyp. Ist der Untertyp noch offen,
   trennt zusätzlich der mathematische Kontext. Das Ergebnis geht NIE in den Schlüssel ein –
   gleiche falsche Ergebnisse allein vereinigen nichts. */
export function clusterSchluessel(e) {
  if (!e.typ) return "offen";
  const u = e.manuell?.untertyp ?? e.untertyp ?? "allgemein";
  const t = e.manuell?.typ ?? e.typ;
  const basis = u === "allgemein" ? `${t}|allgemein@${e.aufgabe?.kontext || "allgemein"}` : `${t}|${u}`;
  return e.teilung ? `${basis}#${e.teilung}` : basis;
}

/* Lesbare Begründung, warum ein Ereignis zu seinem Cluster gehört */
function zuordnungsGrund(P, e) {
  const gleich = P.ereignisse.filter((x) => x.nutzerId === e.nutzerId && x.id !== e.id && zaehlt(x) && clusterSchluessel(x) === clusterSchluessel(e));
  const sonst = P.ereignisse.filter((x) => x.nutzerId === e.nutzerId && x.id !== e.id && zaehlt(x) && x.typ === e.typ && clusterSchluessel(x) !== clusterSchluessel(e));
  const tn = typName(e.typ), un = untertypName(e.typ, e.untertyp);
  if (!e.typ) return "Noch keinem Fehlertyp zugeordnet – wartet auf Klärung.";
  const wo = `Kontext: ${kontextName(e.aufgabe.kontext)}`;
  if (gleich.length) return `Gleicher Fehlertyp (${tn}) und gleicher Untertyp (${un || "offen"}) wie ${gleich.length} frühere Beobachtung${gleich.length > 1 ? "en" : ""}. ${wo}.`;
  if (sonst.length) return `Gleicher Fehlertyp (${tn}), aber anderer Untertyp bzw. Kontext als bisherige Beobachtungen – bewusst getrennt, weil dieselbe Ursache nicht belegt ist. ${wo}.`;
  return `Erste Beobachtung dieses Fehlertyps (${tn}${un && e.untertyp !== "allgemein" ? `, ${un}` : ""}) – neues vorläufiges Cluster. ${wo}.`;
}

/* Speichert ein Ereignis, wenn es noch nicht existiert. → { neu, ereignis, grund } */
export function speichereEreignis(P, ereignis, jetzt = Date.now()) {
  const vorhanden = P.ereignisse.find((x) => x.id === ereignis.id);
  if (vorhanden) return { neu: false, ereignis: vorhanden, grund: "Diese Meldung ist schon gespeichert (doppelte Meldung ignoriert)." };
  ereignis.zuordnung = zuordnungsGrund(P, ereignis);
  P.ereignisse.push(ereignis);
  if (P.ereignisse.length > SCHWELLEN.maxEreignisse) {
    const i = P.ereignisse.findIndex((x) => x.status === "verworfen");
    P.ereignisse.splice(i >= 0 ? i : 0, 1);
  }
  logge(P, `Ereignis aufgenommen (${ereignis.quelle}, ${ereignis.status})`, [ereignis.id], jetzt);
  return { neu: true, ereignis };
}

/* Komfort: bauen + speichern */
export function meldeFehler(P, eingabe, jetzt = Date.now()) {
  const b = ereignisBauen(eingabe, jetzt);
  if (!b.ok) return { neu: false, abgelehnt: true, grund: b.grund };
  return speichereEreignis(P, b.ereignis, jetzt);
}

/* ---------- Aufgaben (Nenner für Fehlerquoten) ---------- */
/* { nutzerId, id, zeit, quelle: "digital", testet: [Fehlertypen], kontext, schwierigkeit, ok, fehlerTyp } */
export function meldeAufgabe(P, a, jetzt = Date.now()) {
  const nutzerId = text(a.nutzerId || "lokal", 80);
  const id = "au-" + hashId(nutzerId, a.id);
  if (P.aufgaben.some((x) => x.id === id)) return { neu: false };
  const eintrag = {
    id, nutzerId, zeit: Number.isFinite(a.zeit) ? a.zeit : jetzt, quelle: a.quelle || "digital",
    testet: (a.testet || []).filter((t) => FEHLERTYPEN_TAX[t]), kontext: KONTEXTE[a.kontext] ? a.kontext : "allgemein",
    schwierigkeit: klemme(Number(a.schwierigkeit) || 2, 1, 3), ok: !!a.ok, fehlerTyp: a.fehlerTyp && FEHLERTYPEN_TAX[a.fehlerTyp] ? a.fehlerTyp : null,
  };
  if (a.demo) eintrag.demo = true;
  P.aufgaben.push(eintrag);
  if (P.aufgaben.length > SCHWELLEN.maxAufgaben) P.aufgaben.splice(0, P.aufgaben.length - SCHWELLEN.maxAufgaben);
  return { neu: true };
}

/* ======================================================================
   2 · Scan-Diagnose: Beobachtung → mathematische Prüfung → Hypothese → Konfidenz
   ====================================================================== */

/* Validiert die strukturierte KI-Antwort. Unbekannte Typen/Untertypen werden verworfen,
   nicht erfunden. Rückgabe: Liste gültiger Hypothesen oder []. */
export function validiereDiagnose(roh) {
  const liste = Array.isArray(roh?.hypothesen) ? roh.hypothesen : [];
  const ok = [];
  for (const h of liste.slice(0, 5)) {
    const nt = normiereTyp(h?.typ, h?.untertyp);
    if (!nt) continue;
    ok.push({
      typ: nt.typ, untertyp: nt.untertyp,
      konfidenz: Math.min(klemme(Number(h.konfidenz), 0, 1), SCHWELLEN.kiMaxKonfidenz),
      grund: text(h.begruendung ?? h.grund, 240), quelle: "ki",
    });
  }
  return ok.sort((a, b) => b.konfidenz - a.konfidenz).slice(0, 3);
}

/* Prompt für die reine Text-Klassifikation (kein Bild!). Die Antwort wird mit validiereDiagnose geprüft. */
export function diagnosePrompt(vorher, nachher, kontextHinweis = "") {
  const typen = Object.entries(FEHLERTYPEN_TAX).map(([id, t]) => `- ${id}: ${t.name}; Untertypen: ${Object.keys(t.untertypen).join(", ")}`).join("\n");
  return `Ein Schüler hat in einer handschriftlichen Rechnung diesen Übergang geschrieben. Er wurde mathematisch geprüft und ist NACHWEISLICH falsch.

Zeile davor: ${vorher}
Zeile danach: ${nachher}
${kontextHinweis ? `Kontext: ${kontextHinweis}\n` : ""}
Bestimme, welche Fehlerursache am wahrscheinlichsten dahintersteckt. Wähle NUR aus dieser Liste (typ und untertyp exakt wie angegeben):
${typen}

Regeln: Beschreibe nur die Rechnung, nicht den Menschen. Wenn mehrere Ursachen möglich sind, nenne bis zu drei Hypothesen mit unterschiedlicher Konfidenz (0 bis 1). Wenn du unsicher bist, sag es über eine niedrige Konfidenz.
Antworte AUSSCHLIESSLICH mit JSON, ohne Markdown:
{"hypothesen":[{"typ":"…","untertyp":"…","konfidenz":0.0,"begruendung":"ein Satz, unter 140 Zeichen"}]}`;
}

/* Validiert die strukturierte Foto-Lesung der KI (Transkription), bevor daraus irgendetwas entsteht.
   Erwartet { zeilen: [Text], zeilenStatus: ["ok"|"unklar"], lesbarkeit: 0–10, durchgestrichen: [Text], mehrereWege: bool, mathildaFehler: {zeile, was, richtig} | null }.
   Rückgabe: { ok: true, lesung } | { ok: false, grund }. Durchgestrichenes und Randnotizen werden nie als Rechenzeilen übernommen. */
export function validiereScanLesung(roh) {
  if (!roh || typeof roh !== "object" || !Array.isArray(roh.zeilen)) return { ok: false, grund: "Die Foto-Lesung hatte nicht das erwartete Format." };
  const zeilen = [], status = [];
  roh.zeilen.slice(0, 30).forEach((z, i) => {
    const t = text(typeof z === "string" ? z : z?.text, 200).trim();
    if (!t) return;
    zeilen.push(t);
    status.push(Array.isArray(roh.zeilenStatus) && roh.zeilenStatus[i] === "unklar" ? "unklar" : "ok");
  });
  if (zeilen.length < 2) return { ok: false, grund: "Es konnten weniger als zwei Rechenzeilen gelesen werden – dafür gibt es keinen Übergang zu prüfen." };
  const lesbarkeit = klemme(Number(roh.lesbarkeit), 0, 10);
  const mf = roh.mathildaFehler && typeof roh.mathildaFehler === "object" ? { zeile: Number(roh.mathildaFehler.zeile) || null, was: text(roh.mathildaFehler.was, 200), richtig: text(roh.mathildaFehler.richtig, 200) } : null;
  return {
    ok: true,
    lesung: {
      zeilen, zeilenStatus: status, lesbarkeit: roh.mehrereWege ? Math.min(lesbarkeit, 7) : lesbarkeit,
      durchgestrichen: (Array.isArray(roh.durchgestrichen) ? roh.durchgestrichen : []).slice(0, 10).map((x) => text(x, 120)),
      mehrereWege: !!roh.mehrereWege, mathildaFehler: mf && mf.zeile ? mf : null,
    },
  };
}

/* Scan-Auswertung. Eingabe: { zeilen: [Text], zeilenStatus: ["ok"|"fehler"|"unklar"], lesbarkeit,
   mathildaFehler: { zeile (ab 1), was, richtig } | null, kiHypothesen: [validierte Hypothesen] | null,
   kontext, scanId }
   Rückgabe: { beobachtung, pruefung: { status, index, vorher, nachher, uebereinstimmung, luecken },
               hypothesen, vorschlag: Eingabe für ereignisBauen | null, hinweis, braucht: "ki" | null } */
export function scanDiagnose(s) {
  const zeilenRoh = s.zeilen || [];
  const stat = s.zeilenStatus || [];
  /* Unleserliche Zeilen nehmen wir nicht in die Kette – sie werden zur Klärung markiert. */
  const zeilen = [], orig = [];
  zeilenRoh.forEach((z, i) => { if (stat[i] !== "unklar" && String(z).trim()) { zeilen.push(z); orig.push(i); } });
  const unklar = zeilenRoh.map((_, i) => i).filter((i) => stat[i] === "unklar");
  const beobachtung = zeilenRoh.map((z, i) => `${i + 1}: ${z}${stat[i] === "unklar" ? " (unleserlich)" : ""}`).join(" | ");

  const f = fruehesterFehler(zeilen);
  const pruefung = { status: f.status, index: f.index != null ? orig[f.index] : null, vorher: f.vorher, nachher: f.nachher, luecken: f.luecken.map((i) => orig[i]), unklar, uebereinstimmung: null };
  if (f.status !== "falsch") {
    return { beobachtung, pruefung, hypothesen: [], vorschlag: null, braucht: null,
      hinweis: f.status === "ok" && !s.mathildaFehler
        ? "Alle lesbaren Übergänge sind mathematisch gleichwertig – hier wurde kein Fehler gespeichert."
        : f.status === "ok"
          ? "Mathilda meldet einen Fehler, die mathematische Prüfung kann ihn nicht bestätigen. Es wird nichts gespeichert – der Schritt ist entweder richtig gelesen oder nicht prüfbar."
          : "Die Zeilen lassen sich nicht automatisch prüfen (z. B. Wurzeln, Brüche mit x oder Text). Es wird nichts als Fehler gespeichert." };
  }
  /* Stimmt die mathematische Prüfung mit der Meldung von Mathilda überein? */
  if (s.mathildaFehler?.zeile != null) pruefung.uebereinstimmung = Number(s.mathildaFehler.zeile) - 1 === pruefung.index;

  const hyp = [];
  const art = s.kontext === "ableiten" ? "ableiten" : null;
  const vz = erkenneVorzeichenfehler(f.vorher, f.nachher, art);
  if (vz.ist) hyp.push({ typ: "vorzeichen", untertyp: vz.untertyp, konfidenz: vz.sicherheit, grund: vz.grund, quelle: "regel" });
  for (const h of s.kiHypothesen || []) if (!hyp.some((x) => x.typ === h.typ && x.untertyp === h.untertyp)) hyp.push(h);
  hyp.sort((a, b) => b.konfidenz - a.konfidenz);

  const beste = hyp[0] || null;
  const pruefText = `Der Übergang von Zeile ${pruefung.index} nach Zeile ${pruefung.index + 1} ist mathematisch nicht gleichwertig (exakt geprüft).`;
  /* Entwurf ohne Fehlertyp: Der Fehler ist nachweislich da. Bleibt die Ursache offen, kann die Person den Typ selbst wählen
     (das ergibt dann ein von ihr bestätigtes Ereignis) – es wird nie ein Typ geraten und gespeichert. */
  const entwurf = {
    quelle: "scan", schritt: f.nachher, korrekt: s.mathildaFehler?.richtig || "", stelle: `Zeile ${pruefung.index + 1}`,
    beobachtung: beobachtung.slice(0, 400), pruefung: pruefText, hypothesen: hyp,
    aufgabe: { id: "scan-" + (s.scanId || hashId(zeilenRoh.join("\n"))), text: zeilenRoh[0] || "", kontext: s.kontext || "allgemein", schwierigkeit: 2 },
    ursprung: { art: "scan", ref: `${s.scanId || hashId(zeilenRoh.join("\n"))}:${pruefung.index + 1}` },
    lesbarkeit: s.lesbarkeit, mathGeprueft: true,
  };
  const vorschlag = beste ? { ...entwurf, typ: beste.typ, untertyp: beste.untertyp, konfidenz: beste.konfidenz } : null;
  return {
    beobachtung, pruefung: { ...pruefung, text: pruefText }, hypothesen: hyp, vorschlag, entwurf,
    braucht: beste ? null : "ki",
    hinweis: beste ? null : "Der Schritt ist falsch, aber die Ursache ist noch offen. Wähle selbst einen Fehlertyp oder lass Mathilda eine Hypothese vorschlagen.",
  };
}

/* ======================================================================
   3 · Cluster: abgeleitet aus den Ereignissen, immer erklärbar
   ====================================================================== */
const meineEreignisse = (P, nutzerId) => P.ereignisse.filter((e) => e.nutzerId === nutzerId);
const woche = (ts) => Math.floor((ts / TAG + 3) / 7);       // Wochen-Index (Donnerstag-Offset egal, nur Bucket)

export function musterStatus(z) {
  const n = z.length;
  if (n === 0) return null;
  if (n < SCHWELLEN.moeglich) return "einzeln";
  const tage = new Set(z.map((e) => tagVon(e.zeit))).size;
  const aufgaben = new Set(z.map((e) => e.aufgabe.id)).size;
  const sicher = z.filter(istSicher).length;
  const kanaele = new Set(z.map((e) => e.quelle)).size;
  const wieder = n >= SCHWELLEN.wiederkehrend && tage >= SCHWELLEN.wiederkehrendTage && aufgaben >= SCHWELLEN.wiederkehrendAufgaben && sicher >= SCHWELLEN.wiederkehrendSicher;
  if (!wieder) return "moeglich";
  if ((n >= SCHWELLEN.gestuetzt && tage >= SCHWELLEN.gestuetztTage) || (kanaele >= 2 && n >= SCHWELLEN.gestuetztKanalMin)) return "gestuetzt";
  return "wiederkehrend";
}

export function baueCluster(P, nutzerId, jetzt = Date.now()) {
  const gruppen = new Map();
  for (const e of meineEreignisse(P, nutzerId)) {
    if (!zaehlt(e)) continue;
    const k = clusterSchluessel(e);
    if (!gruppen.has(k)) gruppen.set(k, []);
    gruppen.get(k).push(e);
  }
  const cluster = [];
  for (const [schluessel, z] of gruppen) {
    z.sort((a, b) => a.zeit - b.zeit);
    const typ = z[0].manuell?.typ ?? z[0].typ;
    const untertyp = z[0].manuell?.untertyp ?? z[0].untertyp ?? "allgemein";
    const quellen = { digital: 0, scan: 0, manuell: 0 };
    z.forEach((e) => { quellen[e.quelle] += 1; });
    const runden = P.runden.filter((r) => r.nutzerId === nutzerId && r.typ === typ && r.status === "erfolgreich");
    const letzteTraining = runden.reduce((m, r) => Math.max(m, r.ende || r.zeit), 0) || null;
    const wochenJetzt = woche(jetzt);
    const verlauf = Array.from({ length: 12 }, (_, i) => ({ woche: wochenJetzt - 11 + i, n: 0 }));
    z.forEach((e) => { const b = verlauf.find((v) => v.woche === woche(e.zeit)); if (b) b.n += 1; });
    cluster.push({
      id: "cl-" + hashId(nutzerId, schluessel), nutzerId, schluessel, typ, untertyp, haupt: FEHLERTYPEN_TAX[typ]?.haupt || null,
      ereignisIds: z.map((e) => e.id), haeufigkeit: z.length,
      tage: new Set(z.map((e) => tagVon(e.zeit))).size, aufgabenAnzahl: new Set(z.map((e) => e.aufgabe.id)).size,
      themen: [...new Set(z.map((e) => e.aufgabe.kontext))], quellen,
      konfidenz: Math.round((z.reduce((s, e) => s + e.konfidenz, 0) / z.length) * 100) / 100,
      status: musterStatus(z), erste: z[0].zeit, letzte: z[z.length - 1].zeit, letzteTraining, verlauf,
      gruende: z.map((e) => ({ id: e.id, zeit: e.zeit, quelle: e.quelle, text: e.zuordnung || "" })),
    });
  }
  return cluster.sort((a, b) => MUSTER_RANG[b.status] - MUSTER_RANG[a.status] || b.haeufigkeit - a.haeufigkeit || b.letzte - a.letzte);
}

/* Ereignisse, die auf Klärung warten (unsicher oder ohne Typ) */
export const zurKlaerung = (P, nutzerId) => meineEreignisse(P, nutzerId).filter((e) => e.status === "unsicher").sort((a, b) => b.zeit - a.zeit);

/* ---------- Korrekturen: Zuordnung ändern, bestätigen, verwerfen, Cluster teilen ---------- */
const finde = (P, nutzerId, id) => P.ereignisse.find((e) => e.id === id && e.nutzerId === nutzerId);

export function ereignisKorrigieren(P, nutzerId, id, { typ, untertyp, status }, jetzt = Date.now()) {
  const e = finde(P, nutzerId, id);
  if (!e) return false;
  if (typ) {
    const nt = normiereTyp(typ, untertyp);
    if (!nt) return false;
    e.manuell = { typ: nt.typ, untertyp: nt.untertyp };
    e.typ = nt.typ; e.haupt = nt.haupt; e.untertyp = nt.untertyp;
    e.teilung = undefined;
    e.zuordnung = `Von dir neu zugeordnet: ${typName(nt.typ)}${untertypName(nt.typ, nt.untertyp) && nt.untertyp !== "allgemein" ? `, ${untertypName(nt.typ, nt.untertyp)}` : ""}.`;
    if (e.status === "unsicher" && !status) e.status = "bestaetigt";
  }
  if (status && STATUS_NAMEN[status]) {
    if (status === "bestaetigt" && !e.typ) return false;
    e.status = status;
  }
  logge(P, `Ereignis korrigiert (${[typ && "Typ", status].filter(Boolean).join(", ")})`, [id], jetzt);
  return true;
}

/* Teilt ein Cluster: die gewählten Ereignisse bilden ein eigenes Cluster */
export function clusterTeilen(P, nutzerId, clusterId, ereignisIds, jetzt = Date.now()) {
  const c = baueCluster(P, nutzerId, jetzt).find((x) => x.id === clusterId);
  if (!c || !ereignisIds.length || ereignisIds.length >= c.ereignisIds.length) return false;
  const belegt = new Set(P.ereignisse.filter((e) => e.nutzerId === nutzerId).map((e) => e.teilung).filter(Boolean));
  let n = 2; while (belegt.has(String(n))) n++;
  for (const id of ereignisIds) {
    const e = finde(P, nutzerId, id);
    if (e && c.ereignisIds.includes(id)) { e.teilung = String(n); e.zuordnung = "Von dir aus einem gemischten Cluster abgetrennt."; }
  }
  logge(P, "Cluster geteilt", ereignisIds, jetzt);
  return true;
}

/* ======================================================================
   4 · Fehlerquote, zeitliche Entwicklung, Rückfall
   ====================================================================== */
const meineAufgaben = (P, nutzerId, typ) => P.aufgaben.filter((a) => a.nutzerId === nutzerId && a.quelle === "digital" && a.testet.includes(typ)).sort((a, b) => a.zeit - b.zeit);
const quote = (liste, typ) => (liste.length ? liste.filter((a) => a.fehlerTyp === typ).length / liste.length : null);

/* Fehlerquote nur über vergleichbare Aufgaben: nur Aufgaben, die diesen Fehlertyp überhaupt prüfen */
export function fehlerquote(P, nutzerId, typ) {
  const a = meineAufgaben(P, nutzerId, typ);
  return { aufgaben: a.length, fehler: a.filter((x) => x.fehlerTyp === typ).length, quote: quote(a, typ) };
}

export function verlaufAussage(P, nutzerId, typ, jetzt = Date.now()) {
  const name = typName(typ);
  const a = meineAufgaben(P, nutzerId, typ);
  const w = Math.min(SCHWELLEN.fenster, Math.floor(a.length / 2));
  if (w < SCHWELLEN.mindFenster) {
    return { art: "zuWenig", aufgaben: a.length, text: `Für „${name}“ liegen erst ${a.length} vergleichbare Aufgaben vor. Für eine Aussage zur Entwicklung braucht es mindestens ${2 * SCHWELLEN.mindFenster}.` };
  }
  const neu = a.slice(-w), alt = a.slice(-2 * w, -w);
  const mittel = (l) => l.reduce((s, x) => s + x.schwierigkeit, 0) / l.length;
  if (Math.abs(mittel(neu) - mittel(alt)) > SCHWELLEN.maxSchwierigkeitsAbstand) {
    return { art: "nichtVergleichbar", aufgaben: a.length, text: `Die letzten ${w} Aufgaben zu „${name}“ waren deutlich schwerer oder leichter als die davor – ein direkter Vergleich wäre nicht fair.` };
  }
  const fN = neu.filter((x) => x.fehlerTyp === typ).length, fA = alt.filter((x) => x.fehlerTyp === typ).length;
  const rN = fN / w, rA = fA / w;
  /* Hat sich die Menge der Übungen stark verändert? Dann nicht von „Verbesserung“ sprechen. */
  const alle = (von, bis) => a.filter((x) => x.zeit >= von && x.zeit < bis).length;
  const jetztMenge = alle(jetzt - 14 * TAG, jetzt + 1), davorMenge = alle(jetzt - 28 * TAG, jetzt - 14 * TAG);
  const wenigerAktiv = davorMenge >= SCHWELLEN.mindFenster && jetztMenge < davorMenge / 2;
  const hinweis = wenigerAktiv ? ` Allerdings hast du in den letzten zwei Wochen deutlich weniger geübt (${jetztMenge} statt ${davorMenge} Aufgaben) – das schwächt die Aussage.` : "";
  if (rN <= rA - SCHWELLEN.unterschied) {
    return { art: wenigerAktiv ? "seltenerAberWeniger" : "seltener", aufgaben: a.length, rN, rA, text: `In den letzten ${w} vergleichbaren Aufgaben ist „${name}“ seltener aufgetreten (${fN} von ${w}, davor ${fA} von ${w}).${hinweis}` };
  }
  if (rN >= rA + SCHWELLEN.unterschied) {
    return { art: "haeufiger", aufgaben: a.length, rN, rA, text: `In den letzten ${w} vergleichbaren Aufgaben ist „${name}“ häufiger aufgetreten (${fN} von ${w}, davor ${fA} von ${w}).${hinweis}` };
  }
  return { art: "gleich", aufgaben: a.length, rN, rA, text: `Bei „${name}“ ist über die letzten ${2 * w} vergleichbaren Aufgaben kein belastbarer Unterschied zu erkennen (${fN} von ${w} gegenüber ${fA} von ${w}).${hinweis}` };
}

/* Wirkung eines erfolgreichen Trainings: nur anhand NEUER digitaler Aufgaben danach */
export function trainingsEffekt(P, nutzerId, typ) {
  const runden = P.runden.filter((r) => r.nutzerId === nutzerId && r.typ === typ && r.status === "erfolgreich");
  if (!runden.length) return null;
  const t = Math.max(...runden.map((r) => r.ende || r.zeit));
  const a = meineAufgaben(P, nutzerId, typ);
  const danach = a.filter((x) => x.zeit > t), davor = a.filter((x) => x.zeit <= t).slice(-SCHWELLEN.fenster);
  if (danach.length < SCHWELLEN.nachTrainingMin || davor.length < SCHWELLEN.nachTrainingMin) {
    return { art: "offen", text: `Nach dem letzten Training liegen ${danach.length} neue vergleichbare Aufgaben vor. Ab ${SCHWELLEN.nachTrainingMin} lässt sich sagen, ob sich etwas verändert hat.` };
  }
  const fD = danach.filter((x) => x.fehlerTyp === typ).length, fV = davor.filter((x) => x.fehlerTyp === typ).length;
  const rD = fD / danach.length, rV = fV / davor.length;
  const name = typName(typ);
  if (rD <= rV - SCHWELLEN.unterschied) return { art: "besser", text: `Seit dem Training ist „${name}“ in ${fD} von ${danach.length} Aufgaben aufgetreten, davor in ${fV} von ${davor.length}. Das ist ein gutes Zeichen – dauerhaft sicher ist es damit noch nicht belegt.` };
  if (rD >= rV + SCHWELLEN.unterschied) return { art: "schlechter", text: `Seit dem Training ist „${name}“ in ${fD} von ${danach.length} Aufgaben aufgetreten, davor in ${fV} von ${davor.length}. Eine weitere Runde kann sich lohnen.` };
  return { art: "gleich", text: `Seit dem Training ist bei „${name}“ noch kein klarer Unterschied zu sehen (${fD} von ${danach.length} gegenüber ${fV} von ${davor.length}).` };
}

/* Erneutes Auftreten nach längerer Pause */
export function rueckfall(P, nutzerId, typ) {
  const z = meineEreignisse(P, nutzerId).filter((e) => zaehlt(e) && (e.manuell?.typ ?? e.typ) === typ).sort((a, b) => a.zeit - b.zeit);
  if (z.length < 2) return null;
  const letzte = z[z.length - 1], davor = z[z.length - 2];
  const tage = Math.round((letzte.zeit - davor.zeit) / TAG);
  return tage >= SCHWELLEN.rueckfallTage ? { nachTagen: tage, zeit: letzte.zeit } : null;
}

/* ======================================================================
   5 · Trainingsvorschläge – regelbasiert, mit sichtbarer Begründung
   ====================================================================== */
const PUNKTE_MUSTER = { einzeln: 5, moeglich: 15, wiederkehrend: 40, gestuetzt: 50 };

export function trainingsVorschlaege(P, nutzerId, jetzt = Date.now()) {
  const alle = meineEreignisse(P, nutzerId).filter(zaehlt);
  /* Pro CLUSTER (Typ + Untertyp/Kontext) bewerten – verschiedene Ursachen werden nicht zu einem Muster addiert.
     Trainiert wird pro Fehlertyp; je Typ gilt der stärkste Cluster. */
  const schluessel = [...new Set(alle.map(clusterSchluessel))];
  const out = [];
  for (const k of schluessel) {
    const z = alle.filter((e) => clusterSchluessel(e) === k).sort((a, b) => a.zeit - b.zeit);
    const typ = z[0].manuell?.typ ?? z[0].typ;
    const untertyp = z[0].manuell?.untertyp ?? z[0].untertyp ?? "allgemein";
    const status = musterStatus(z);
    if (MUSTER_RANG[status] < MUSTER_RANG.moeglich) continue;   // einzelne Beobachtung: kein Vorschlag
    const tage = new Set(z.map((e) => tagVon(e.zeit))).size;
    const kanaele = [...new Set(z.map((e) => e.quelle))];
    const letzte = z[z.length - 1].zeit;
    const konf = z.reduce((s, e) => s + e.konfidenz, 0) / z.length;
    const runden = P.runden.filter((r) => r.nutzerId === nutzerId && r.typ === typ && r.status === "erfolgreich");
    const letzteRunde = runden.reduce((m, r) => Math.max(m, r.ende || r.zeit), 0);
    const badge = P.badges.find((b) => b.nutzerId === nutzerId && b.typ === typ);

    const teile = [[`Muster: ${MUSTER_NAMEN[status]}`, PUNKTE_MUSTER[status]]];
    if (tage >= 3) teile.push(["an mindestens 3 Tagen", 15]); else if (tage >= 2) teile.push(["an 2 Tagen", 10]);
    if (kanaele.includes("digital") && kanaele.includes("scan")) teile.push(["in beiden Lernkanälen", 15]);
    if (jetzt - letzte <= 14 * TAG) teile.push(["zuletzt in den letzten 14 Tagen", 10]);
    teile.push([`Konfidenz ${Math.round(konf * 100)} %`, Math.round(konf * 10)]);
    if (letzteRunde && jetzt - letzteRunde <= 7 * TAG) teile.push(["gerade erst trainiert", -25]);
    if (badge && letzte <= badge.zeit) teile.push(["Badge freigeschaltet, seitdem nichts Neues", -10]);
    if (letzteRunde && letzte > letzteRunde && jetzt - letzteRunde > 14 * TAG) teile.push(["nach dem letzten Training erneut aufgetreten", 5]);
    const punkte = teile.reduce((s, t) => s + t[1], 0);

    const kanalText = kanaele.includes("digital") && kanaele.includes("scan")
      ? "in digitalen Übungen und auf deinen eingescannten Blättern"
      : kanaele.length === 1 && kanaele[0] === "scan" ? "auf deinen eingescannten Blättern"
        : kanaele.length === 1 && kanaele[0] === "manuell" ? "in deinen eigenen Meldungen" : "in digitalen Übungen";
    const trainierbar = !!FEHLERTYPEN_TAX[typ]?.training;
    const un = untertyp !== "allgemein" ? untertypName(typ, untertyp) : null;
    const grund = `Du hast ${kanalText} ${z.length}-mal „${typName(typ)}“${un ? ` (${un})` : ""} gezeigt (an ${tage} ${tage === 1 ? "Tag" : "Tagen"}).`
      + (status === "moeglich" ? " Das ist erst ein mögliches Muster – das Training hilft zu klären, ob es sich festigt." : "")
      + (trainierbar ? " Dieses Training konzentriert sich genau darauf." : " Für diesen Fehlertyp gibt es noch kein Training – es ist geplant.");
    out.push({ typ, untertyp, name: typName(typ), status, punkte, teile, grund, trainierbar, anzahl: z.length, tage, kanaele });
  }
  const besteJeTyp = new Map();
  for (const v of out.sort((a, b) => b.punkte - a.punkte)) if (!besteJeTyp.has(v.typ)) besteJeTyp.set(v.typ, v);
  return [...besteJeTyp.values()];
}

/* ======================================================================
   6 · Übernahme der bisherigen „Meine Fehler üben“-Beobachtungen
   ====================================================================== */
/* Dieselben Beobachtungen, die die bisherige Trainingsseite führt, werden einmalig (idempotent)
   in das gemeinsame Gedächtnis übernommen – damit es keine zwei getrennten Historien gibt. */
export function importiereAlteBeobachtungen(P, nutzerId, beobachtungen) {
  let n = 0;
  for (const b of beobachtungen || []) {
    if (!FEHLERTYPEN_TAX[b.typ]) continue;
    const r = meldeFehler(P, {
      nutzerId, quelle: "digital", zeit: b.zeit, schritt: "(frühere Übung, Rechenschritt nicht gespeichert)",
      typ: b.typ, konfidenz: 0.8, ursprung: { art: "legacy", ref: `legacy:${b.id}` },
      aufgabe: { id: `legacy:${b.id}`, text: "", kontext: b.thema, schwierigkeit: 2 },
    }, b.zeit);
    if (r.neu) n++;
  }
  return n;
}

/* ======================================================================
   7 · Daten löschen / exportieren (Aufbewahrungsregeln)
   ====================================================================== */
export function loescheNutzerdaten(P, nutzerId) {
  for (const k of ["ereignisse", "aufgaben", "runden", "badges"]) P[k] = P[k].filter((x) => x.nutzerId !== nutzerId);
  P.protokoll = [];
}
export const loescheTestdaten = (P, nutzerId) => {
  P.ereignisse = P.ereignisse.filter((e) => !(e.demo && e.nutzerId === nutzerId));
  P.aufgaben = P.aufgaben.filter((a) => !(a.demo && a.nutzerId === nutzerId));
  P.runden = P.runden.filter((r) => !(r.demo && r.nutzerId === nutzerId));
  P.badges = P.badges.filter((b) => !(b.demo && b.nutzerId === nutzerId));
};
export const exportiere = (P, nutzerId) => ({
  version: SCHEMA_VERSION, taxonomie: TAXONOMIE_VERSION,
  ereignisse: P.ereignisse.filter((e) => e.nutzerId === nutzerId), aufgaben: P.aufgaben.filter((a) => a.nutzerId === nutzerId),
  runden: P.runden.filter((r) => r.nutzerId === nutzerId), badges: P.badges.filter((b) => b.nutzerId === nutzerId),
});

/* Vorbereitung Prüfungssimulation (Version 1 ohne Echtzeit-Warnung):
   liefert die Muster, gegen die ein aktueller Rechenweg später verglichen werden kann.
   Eine Warnung darf nur erscheinen, wenn der Fehler im selben Moment zuverlässig erkannt wurde –
   eine Diagnose erst nach Abgabe ist eine Auswertung, keine Warnung. */
export function profilFuerPruefung(P, nutzerId, jetzt = Date.now()) {
  return baueCluster(P, nutzerId, jetzt).filter((c) => MUSTER_RANG[c.status] >= MUSTER_RANG.wiederkehrend)
    .map((c) => ({ typ: c.typ, untertyp: c.untertyp, status: c.status, konfidenz: c.konfidenz }));
}

export { aequivalent };
