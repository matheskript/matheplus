/* ======================================================================
   ebbinghaus.js – Wiederholungsplan „Ebbinghaus“ (reine Logik, kein React, kein Speicher)

   Idee: Wer eine Aufgabe einmal verstanden und gelöst hat, kann sie nicht automatisch
   später wieder. Jede Übung gehört zu einem oder mehreren Skills. Sobald ein Skill zum
   ersten Mal selbstständig gelöst wurde, plant die App die nächsten Wiederholungen.

   Wichtig (ehrlich): Der Plan ist ein STARTMODELL, keine universell optimale Formel und keine
   Vorhersage, wann jemand etwas vergisst. Er reagiert auf die beobachtete Leistung.

   Daten je Skill (Feldnamen wie im Auftrag):
     skill_id, first_learned_at, last_reviewed_at, next_review_at, interval_days,
     consecutive_successes, mastery_status, last_error_type, source_exercise_ids, review_history
   Dazu intern: stufe (Index des zuletzt geschafften Planschritts), last_result.

   Zeit: Termine (next_review_at) sind KALENDERTAGE im Format „JJJJ-MM-TT“, ohne Uhrzeit und ohne
   Zeitzone. „Heute“ wird aus der Ortszeit des Geräts bestimmt (oder aus einer übergebenen Zone).
   So wechselt der Tag um Mitternacht des Schülers, und Reisen oder Zeitumstellung verschieben
   nichts. Absolute Zeitpunkte (first_learned_at, last_reviewed_at, Verlaufszeit) sind ISO-Zeiten.

   Aufgaben und Mathematik kommen unverändert aus trainingDaten.js. Keine base-Datei darf
   diese Datei importieren.
   ====================================================================== */
import { FEHLERTYPEN, GENERATOREN, THEMEN } from "./trainingDaten.js";

/* ---------- Plan ---------- */

/* Abstände in Tagen ab dem ersten selbstständigen Lösen (Tag 0). Konfigurierbar über E.plan. */
export const PLAENE = {
  standard: { name: "Standard", tage: [0, 1, 3, 7, 14, 30, 60] },
  kompakt: { name: "Kompakt (Prüfung in Sicht)", tage: [0, 1, 2, 4, 7, 14, 30] },
  /* Enger Rhythmus für einzelne Skills mit wiederkehrendem Fehler (S.rhythmus = "eng", siehe meinTraining.js) */
  eng: { name: "Eng (wiederkehrender Fehler)", tage: [0, 1, 2, 4, 8, 16, 30] },
};
export const PLAN_IDS = Object.keys(PLAENE);
export const SCHRITTE = [
  { name: "Verstehen und erste Anwendung", kurz: "Erste Anwendung" },
  { name: "Kurze Wiederholung", kurz: "Kurze Wiederholung" },
  { name: "Leicht veränderte Aufgabe", kurz: "Leicht veränderte Aufgabe" },
  { name: "Anwendung ohne Hilfe", kurz: "Ohne Hilfe" },
  { name: "Anwendung mit zusätzlichem Rechenschritt", kurz: "Zusätzlicher Rechenschritt" },
  { name: "Langzeit-Check", kurz: "Langzeit-Check" },
  { name: "Erneuter Langzeit-Check", kurz: "Erneuter Langzeit-Check" },
];
export const ERHALT_TAGE = 90;      // nach dem letzten Planschritt: seltene Erhaltungs-Checks
export const MAX_HISTORIE = 60;     // je Skill gespeicherte Verlaufseinträge
export const MAX_QUELLEN = 30;      // je Skill gespeicherte Aufgaben-IDs
export const SCHRITT_AB_HILFE_AUS = 3; // ab diesem Schritt (Tag 7) soll ohne Hilfe gearbeitet werden

/* Plan eines Skills: ein eigener Rhythmus am Skill (S.rhythmus, z. B. "eng") geht vor dem Plan des Lernstands (E.plan) */
export const planTage = (E, S) => (PLAENE[S && S.rhythmus] || PLAENE[E && E.plan] || PLAENE.standard).tage;
export const letzterSchritt = (E, S) => planTage(E, S).length - 1;
export const RHYTHMEN = ["standard", "eng"];
/* Setzt den Rhythmus einzelner Skills – nur für Skills, die es schon gibt (nie neue anlegen, sonst würden sie fällig).
   Verändert E; liefert die geänderten Skill-Ids. */
export function rhythmusSetzen(E, skillIds, rhythmus = "eng") {
  const aus = [];
  if (!RHYTHMEN.includes(rhythmus)) return aus;
  for (const id of skillIds || []) {
    const S = SKILL_INFO[id] && E.skills[id];
    if (!S) continue;
    const neu = rhythmus === "standard" ? null : rhythmus;
    if ((S.rhythmus || null) === neu) continue;
    if (neu) S.rhythmus = neu; else delete S.rhythmus;
    aus.push(id);
  }
  return aus;
}

/* ---------- Skills ---------- */

/* Jeder Skill hängt an echten Generatoren aus trainingDaten.js. `voraus` sind Voraussetzungen. */
export const SKILLS = [
  { id: "gleichungen-umformen", name: "Gleichungen umformen", gen: ["gl-linear"], voraus: [] },
  { id: "pq-formel", name: "Quadratische Gleichungen (pq-Formel)", gen: ["gl-quadrat"], voraus: ["gleichungen-umformen"] },
  { id: "ausklammern", name: "Ausklammern und Nullprodukt", gen: ["gl-ausklammern"], voraus: ["gleichungen-umformen"] },
  { id: "bruch-addieren", name: "Brüche addieren", gen: ["bru-add"], voraus: [] },
  { id: "bruch-teilen", name: "Durch einen Bruch teilen", gen: ["bru-div"], voraus: ["bruch-addieren"] },
  { id: "binomische-formeln", name: "Binomische Formeln", gen: ["ter-binom"], voraus: [] },
  { id: "potenzregel", name: "Potenzregel", gen: ["abl-potenz"], voraus: [] },
  { id: "kettenregel", name: "Kettenregel", gen: ["abl-kette", "abl-exp"], voraus: ["potenzregel"] },
  { id: "wendepunkte", name: "Wendepunkte bestimmen", gen: ["kur-wende"], voraus: ["potenzregel", "gleichungen-umformen"] },
  { id: "extrempunkte", name: "Extrempunkte nachweisen", gen: ["kur-nachweis"], voraus: ["potenzregel", "pq-formel"] },
  { id: "integral-grenzen", name: "Bestimmte Integrale", gen: ["int-grenzen"], voraus: ["potenzregel"] },
  { id: "flaeche-nullstellen", name: "Flächen mit Vorzeichenwechsel", gen: ["int-flaeche"], voraus: ["integral-grenzen", "pq-formel"] },
  { id: "bernoulli-genau", name: "Bernoulli-Formel", gen: ["ber-genau"], voraus: [] },
  { id: "bernoulli-grenze", name: "Mindestens, höchstens, mehr als", gen: ["ber-grenze"], voraus: ["bernoulli-genau"] },
  { id: "vektor-betrag", name: "Länge eines Vektors", gen: ["vek-betrag"], voraus: [] },
  { id: "vektor-ortho", name: "Orthogonale Vektoren", gen: ["vek-ortho"], voraus: ["vektor-betrag"] },
  { id: "gerade-ebene-winkel", name: "Winkel Gerade–Ebene", gen: ["vek-geradeebene"], voraus: ["vektor-ortho"] },
  /* Grundlagen der Mittelstufe */
  { id: "prozentwert", name: "Prozentwert berechnen", gen: ["pro-wert"], voraus: [] },
  { id: "grundwert", name: "Grundwert nach Erhöhung", gen: ["pro-grund"], voraus: ["prozentwert"] },
  { id: "steigung", name: "Steigung aus zwei Punkten", gen: ["fkt-steigung"], voraus: ["bruch-addieren"] },
  { id: "scheitelpunkt", name: "Scheitelpunkt bestimmen", gen: ["fkt-scheitel"], voraus: ["binomische-formeln"] },
  { id: "potenzgesetze", name: "Potenzgesetze", gen: ["pot-gesetz"], voraus: [] },
  { id: "teilweise-wurzel", name: "Teilweise Wurzel ziehen", gen: ["pot-wurzel"], voraus: [] },
  { id: "exponentialgleichung", name: "Exponentialgleichungen", gen: ["pot-log"], voraus: ["potenzgesetze"] },
  { id: "pythagoras", name: "Satz des Pythagoras", gen: ["geo-pythagoras"], voraus: ["teilweise-wurzel"] },
  { id: "trig-dreieck", name: "Sinus und Kosinus im Dreieck", gen: ["geo-trig"], voraus: ["pythagoras"] },
  { id: "pfadregel", name: "Pfadregel ohne Zurücklegen", gen: ["wkt-pfad"], voraus: ["bruch-addieren"] },
  { id: "lgs-einsetzen", name: "Gleichungssysteme lösen", gen: ["lgs-zwei"], voraus: ["gleichungen-umformen"] },
  { id: "sinus-periode", name: "Periode der Sinusfunktion", gen: ["sin-periode"], voraus: [] },
  { id: "wachstumsfaktor", name: "Exponentielles Wachstum", gen: ["wac-faktor"], voraus: ["prozentwert", "potenzgesetze"] },
  /* Geometrie der Mittelstufe */
  { id: "quader", name: "Volumen und Oberfläche des Quaders", gen: ["geo-quader"], voraus: [] },
  { id: "winkelsumme", name: "Winkelsummen", gen: ["geo-winkel"], voraus: [] },
  { id: "kongruenzsaetze", name: "Kongruenzsätze", gen: ["geo-kongruenz"], voraus: ["winkelsumme"] },
  { id: "strahlensaetze", name: "Strahlensätze", gen: ["geo-strahlen"], voraus: ["bruch-addieren"] },
  { id: "kreis", name: "Kreisumfang und Kreisfläche", gen: ["geo-kreis"], voraus: [] },
  { id: "kreisteile", name: "Kreisbogen und Kreisausschnitt", gen: ["geo-sektor"], voraus: ["kreis"] },
  { id: "prisma-zylinder", name: "Prisma und Zylinder", gen: ["geo-prisma"], voraus: ["kreis", "quader"] },
  { id: "pyramide-kegel", name: "Pyramide und Kegel", gen: ["geo-pyramide"], voraus: ["prisma-zylinder"] },
  { id: "kugel", name: "Kugel", gen: ["geo-kugel"], voraus: ["kreis"] },
  /* Normalverteilung */
  { id: "normal-standard", name: "Normalverteilung: P(X ≤ x)", gen: ["nv-kleiner"], voraus: [] },
  { id: "normal-intervall", name: "Normalverteilung: Intervalle und Sigma-Regeln", gen: ["nv-zwischen"], voraus: ["normal-standard"] },
  { id: "normal-quantil", name: "Normalverteilung rückwärts", gen: ["nv-quantil"], voraus: ["normal-standard"] },
  { id: "normal-binom", name: "Binomialverteilung annähern", gen: ["nv-binom"], voraus: ["normal-standard", "bernoulli-genau"] },
];
export const SKILL_IDS = SKILLS.map((s) => s.id);
export const SKILL_INFO = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

/* Zusätzliche Skills, die eine Aufgabe ebenfalls trainiert (neben dem Hauptskill) */
export const EXTRA_TAGS = {
  "abl-kette": ["potenzregel"],        // (ax + b)^n: Kettenregel UND Potenzregel
  "kur-wende": ["potenzregel"],        // f″ bilden heißt zweimal mit der Potenzregel ableiten
  "int-flaeche": ["integral-grenzen"], // Teilintegrale sind bestimmte Integrale
};

/* Aufgaben-Skill: erster Eintrag = Hauptskill */
export function skillsVonGenerator(genId) {
  const haupt = SKILLS.filter((s) => s.gen.includes(genId)).map((s) => s.id);
  return [...new Set([...haupt, ...(EXTRA_TAGS[genId] || [])])];
}

const genInfo = (id) => GENERATOREN.find((g) => g.id === id);
export const skillGeneratoren = (skillId) => (SKILL_INFO[skillId] ? SKILL_INFO[skillId].gen.map(genInfo).filter(Boolean) : []);

/* Fehlertypen, die zu einem Skill gehören (aus den Generatoren) */
export function skillFehlertypen(skillId) {
  return [...new Set(skillGeneratoren(skillId).flatMap((g) => g.fuer || []))];
}

/* Kapitel/Thema für die Anzeige, z. B. „Analysis · Ableiten“ */
export function skillKapitel(skillId) {
  const g = skillGeneratoren(skillId)[0];
  const t = g && THEMEN[g.thema];
  return t ? { thema: g.thema, name: t.name, gruppe: t.gruppe, tools: t.tools || [] } : { thema: null, name: "", gruppe: "", tools: [] };
}

/* Alle Voraussetzungen (rekursiv, ohne den Skill selbst) */
export function voraussetzungen(skillId, gesehen = new Set()) {
  const s = SKILL_INFO[skillId];
  if (!s) return [];
  for (const v of s.voraus) {
    if (gesehen.has(v)) continue;
    gesehen.add(v);
    voraussetzungen(v, gesehen);
  }
  return [...gesehen];
}

/* Prüft die Definition: jede Generator-ID und jede Voraussetzung existiert, keine Zyklen */
export function validiereSkills() {
  const f = [];
  for (const s of SKILLS) {
    for (const g of s.gen) if (!genInfo(g)) f.push(`${s.id}: Generator ${g} fehlt`);
    for (const v of s.voraus) if (!SKILL_INFO[v]) f.push(`${s.id}: Voraussetzung ${v} fehlt`);
    if (voraussetzungen(s.id).includes(s.id)) f.push(`${s.id}: Zyklus`);
  }
  for (const [g, ids] of Object.entries(EXTRA_TAGS)) {
    if (!genInfo(g)) f.push(`EXTRA_TAGS: Generator ${g} fehlt`);
    for (const i of ids) if (!SKILL_INFO[i]) f.push(`EXTRA_TAGS: Skill ${i} fehlt`);
  }
  if (new Set(SKILL_IDS).size !== SKILL_IDS.length) f.push("doppelte Skill-IDs");
  return f;
}

/* ---------- Kalender (ohne Zeitzonen-Fallen) ---------- */

/* Kalendertag „JJJJ-MM-TT“ eines Zeitpunkts in der Ortszeit (oder in der Zone tz, z. B. "Europe/Berlin") */
export function datumVon(ms, tz) {
  const d = new Date(ms);
  if (tz) {
    const t = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
    return t;
  }
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const utcTag = (datum) => { const [y, m, t] = datum.split("-").map(Number); return Date.UTC(y, m - 1, t) / 86400000; };
export function addTage(datum, n) {
  const d = new Date((utcTag(datum) + n) * 86400000);
  const p = (x) => String(x).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}
export const tageZwischen = (von, bis) => utcTag(bis) - utcTag(von);
export const istDatum = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(utcTag(s));

/* ---------- Zustand ---------- */

export function leereEbb() { return { version: 1, plan: "standard", skills: {}, tage: {}, arbeiten: [] }; }
export const MAX_TAGE = 60;     // gespeicherte Tagespläne
export const ARTEN = {
  wiederholung: "Wiederholen",
  voraussetzung: "Voraussetzung auffrischen",
  weiter: "Weiter lernen",
  pruefung: "Für die Arbeit auffrischen",
};
export const ARBEIT_ARTEN = ["Klassenarbeit", "Test", "Klausur"];
export const MAX_ARBEITEN = 40;

export function leererSkill(id, heute) {
  return {
    skill_id: id, first_learned_at: null, last_reviewed_at: null, next_review_at: heute, interval_days: 0,
    consecutive_successes: 0, mastery_status: "neu", last_error_type: null, source_exercise_ids: [], review_history: [],
    stufe: 0, last_result: null,
  };
}

/* Macht aus gespeicherten (evtl. beschädigten oder alten) Daten einen gültigen Zustand */
export function normiereEbb(E) {
  const d = { ...leereEbb(), ...(E && typeof E === "object" ? E : {}) };
  if (!PLAENE[d.plan]) d.plan = "standard";
  const skills = {};
  const heute = datumVon(Date.now());
  for (const [id, s0] of Object.entries(d.skills && typeof d.skills === "object" ? d.skills : {})) {
    if (!SKILL_INFO[id] || !s0 || typeof s0 !== "object") continue;
    const s = { ...leererSkill(id, heute), ...s0, skill_id: id };
    if (!istDatum(s.next_review_at)) s.next_review_at = heute;
    s.stufe = Math.max(0, Math.min(PLAENE.standard.tage.length - 1, Number.isFinite(s.stufe) ? Math.trunc(s.stufe) : 0));
    s.interval_days = Number.isFinite(s.interval_days) ? s.interval_days : 0;
    s.consecutive_successes = Number.isFinite(s.consecutive_successes) ? s.consecutive_successes : 0;
    s.source_exercise_ids = Array.isArray(s.source_exercise_ids) ? s.source_exercise_ids.slice(-MAX_QUELLEN) : [];
    s.review_history = Array.isArray(s.review_history) ? s.review_history.slice(-MAX_HISTORIE) : [];
    if (s.rhythmus && (!RHYTHMEN.includes(s.rhythmus) || s.rhythmus === "standard")) delete s.rhythmus;
    s.mastery_status = statusVon(s, d);
    skills[id] = s;
  }
  d.skills = skills;
  const tage = {};
  for (const [dat, t] of Object.entries(d.tage && typeof d.tage === "object" ? d.tage : {})) {
    if (!istDatum(dat) || !t || !Array.isArray(t.items)) continue;
    tage[dat] = { erstellt: typeof t.erstellt === "string" ? t.erstellt : null,
      items: t.items.filter((i) => i && SKILL_INFO[i.skill_id]).map((i) => ({ skill_id: i.skill_id, art: ARTEN[i.art] ? i.art : "wiederholung", grund: typeof i.grund === "string" ? i.grund : "", ...(typeof i.arbeit === "string" ? { arbeit: i.arbeit } : {}) })) };
  }
  const dl = Object.keys(tage).sort();
  d.tage = Object.fromEntries(dl.slice(-MAX_TAGE).map((k) => [k, tage[k]]));
  d.arbeiten = normiereArbeiten(d.arbeiten);
  return d;
}

/* ---------- Status ---------- */
export const STATUS = {
  neu: { name: "Neu", farbe: "#5B8FD1", text: "Noch nicht selbstständig gelöst" },
  training: { name: "Im Training", farbe: "#004D98", text: "Wird gerade gefestigt" },
  unsicher: { name: "Unsicher", farbe: "#B85C2E", text: "Letzte Wiederholung noch nicht sicher" },
  stabil: { name: "Stabil", farbe: "#2F8F5B", text: "Mehrere Wiederholungen geschafft" },
  gefestigt: { name: "Langfristig gefestigt", farbe: "#7A5800", text: "Alle Planschritte geschafft" },
};
export function statusVon(S, E) {
  if (!S.first_learned_at) return "neu";
  if (S.last_result === "nicht" || S.last_result === "teilweise") return "unsicher";
  const letzter = letzterSchritt(E || leereEbb());
  if (S.stufe >= letzter) return "gefestigt";
  if (S.stufe >= 3) return "stabil";
  return "training";
}

/* ---------- Ergebnis einer Aufgabe einordnen ---------- */

/* z = Zustand der Aufgabe im Aufgabenlauf: { gebucht, ok, versuche, hilfeEnde }
   sicher   = selbstständig, im ersten Versuch, ohne Hilfe richtig
   teilweise = richtig, aber mit Hinweisen oder erst im zweiten Versuch
   nicht    = Lösung gezeigt oder nicht gelöst */
export function bewerte(z) {
  if (!z || !z.gebucht) return null;
  const hilfe = z.hilfeEnde || 0;
  if (z.ok && hilfe === 0) return "sicher";
  if (z.ok && hilfe < 4) return "teilweise";
  return "nicht";
}
export const ERGEBNIS_TEXT = {
  sicher: { name: "Sicher gelöst", farbe: "#2F8F5B" },
  teilweise: { name: "Teilweise sicher", farbe: "#B98A00" },
  nicht: { name: "Noch nicht abrufbar", farbe: "#B85C2E" },
};

/* ---------- Buchen ---------- */

/* Bucht EIN Ergebnis für die betroffenen Skills.
   info: { ergebnis, exercise_id, generator, hilfe, versuche, fehler_typ, quelle }
   Liefert eine Liste der Änderungen (für die Anzeige). Mehrfaches Buchen derselben Aufgabe wird ignoriert. */
export function bucheErgebnis(E, skillIds, info, jetzt = Date.now(), tz) {
  const heute = datumVon(jetzt, tz);
  const iso = new Date(jetzt).toISOString();
  const ergebnis = info.ergebnis;
  const aenderungen = [];
  if (!["sicher", "teilweise", "nicht"].includes(ergebnis)) return aenderungen;

  /* Welche Skills bekommen das Ergebnis? Hauptskill immer; weitere Tags bei Erfolg; bei Fehlern nur,
     wenn der Fehlertyp zu ihnen gehört. */
  const haupt = skillIds[0];
  const ziele = skillIds.filter((id, i) => i === 0 || ergebnis !== "nicht" || (info.fehler_typ && skillFehlertypen(id).includes(info.fehler_typ)));

  for (const id of ziele) {
    if (!SKILL_INFO[id]) continue;
    const S = E.skills[id] || (E.skills[id] = leererSkill(id, heute));
    if (info.exercise_id && S.review_history.some((h) => h.exercise_id === info.exercise_id)) continue; // schon gebucht
    const plan = planTage(E, S);
    const letzter = plan.length - 1;

    const lernphase = !S.first_learned_at;
    const faellig = lernphase || S.next_review_at <= heute;
    const verspaetung = !lernphase && faellig ? tageZwischen(S.next_review_at, heute) : 0;
    const stufeVorher = S.stufe;
    const naechsterVorher = S.next_review_at;

    if (lernphase) {
      if (ergebnis === "sicher") {
        S.first_learned_at = iso; S.stufe = 0; S.interval_days = plan[1] - plan[0];
        S.consecutive_successes = 1; S.next_review_at = addTage(heute, S.interval_days);
      } else {
        S.interval_days = 1; S.consecutive_successes = 0; S.next_review_at = addTage(heute, 1);
      }
    } else if (!faellig && ergebnis !== "nicht") {
      /* Zusätzliches Üben vor dem Termin: wird festgehalten, verschiebt den Plan aber nicht
         (sonst würde zweimaliges Üben am selben Tag den Plan doppelt vorrücken lassen). */
    } else if (ergebnis === "sicher") {
      const neu = Math.min(letzter, S.stufe + 1);
      S.stufe = neu;
      S.interval_days = neu >= letzter ? ERHALT_TAGE : plan[neu + 1] - plan[neu];
      S.consecutive_successes += 1;
      S.next_review_at = addTage(heute, S.interval_days);
    } else if (ergebnis === "teilweise") {
      S.interval_days = Math.max(1, Math.ceil((S.interval_days || 1) / 2));
      S.consecutive_successes = 0;
      S.next_review_at = addTage(heute, S.interval_days);
    } else { // nicht abrufbar: kein Rückschritt – die Stufe bleibt, die Wiederholung wird morgen nachgeholt
      S.interval_days = 1; S.consecutive_successes = 0;
      S.next_review_at = addTage(heute, 1);
    }

    S.last_reviewed_at = iso;
    S.last_result = ergebnis;
    if (ergebnis !== "sicher" && info.fehler_typ) S.last_error_type = info.fehler_typ;
    if (info.exercise_id) { S.source_exercise_ids.push(info.exercise_id); if (S.source_exercise_ids.length > MAX_QUELLEN) S.source_exercise_ids.splice(0, S.source_exercise_ids.length - MAX_QUELLEN); }
    S.review_history.push({
      at: iso, datum: heute, exercise_id: info.exercise_id || null, generator: info.generator || null, ergebnis,
      hilfe: info.hilfe || 0, versuche: info.versuche || 1, fehler_typ: info.fehler_typ || null, quelle: info.quelle || null,
      schritt: lernphase ? 0 : Math.min(letzter, stufeVorher + 1), faellig, verspaetung_tage: verspaetung,
      stufe_vorher: stufeVorher, stufe_nachher: S.stufe, naechster: S.next_review_at,
    });
    if (S.review_history.length > MAX_HISTORIE) S.review_history.splice(0, S.review_history.length - MAX_HISTORIE);
    S.mastery_status = statusVon(S, E);
    aenderungen.push({ skill_id: id, ergebnis, lernphase, faellig, verspaetung, stufeVorher, stufeNachher: S.stufe, naechster: S.next_review_at, naechsterVorher, interval: S.interval_days, status: S.mastery_status });
  }

  /* Ursache bei Fehlern: Liegt der Fehler bei einer Voraussetzung? Dann kommt diese bald wieder dran. */
  if (ergebnis !== "sicher" && info.fehler_typ && haupt) {
    for (const v of voraussetzungen(haupt)) {
      if (!skillFehlertypen(v).includes(info.fehler_typ)) continue;
      const V = E.skills[v] || (E.skills[v] = leererSkill(v, addTage(heute, 1)));
      if (V.next_review_at > addTage(heute, 1)) V.next_review_at = addTage(heute, 1);
      V.last_error_type = info.fehler_typ;
      V.mastery_status = statusVon(V, E);
      aenderungen.push({ skill_id: v, voraussetzungVon: haupt, fehler_typ: info.fehler_typ, naechster: V.next_review_at, status: V.mastery_status });
    }
  }
  return aenderungen;
}

/* Bucht einen ganzen Aufgabenlauf: aufgaben[k] gehört zum Zustand zs[k] */
export function bucheLauf(E, aufgaben, zs, jetzt = Date.now(), quelle = null, tz) {
  const alle = [];
  aufgaben.forEach((a, k) => {
    const z = zs[k];
    const ergebnis = bewerte(z);
    if (!ergebnis) return;
    const skills = skillsVonGenerator(a.variante);
    if (!skills.length) return;
    const fehlerTyp = z.erstOk === false || z.ok === false ? (z.typ || null) : null;
    alle.push(...bucheErgebnis(E, skills, {
      ergebnis, exercise_id: a.id, generator: a.variante, hilfe: z.hilfeEnde || 0, versuche: z.versuche || 1, fehler_typ: fehlerTyp, quelle,
    }, jetzt, tz));
  });
  return alle;
}

/* ---------- Fälligkeit, Priorität, Heute-Ansicht ---------- */

export const istFaellig = (S, heute) => Boolean(S) && S.next_review_at <= heute;
export const schrittVon = (S, E) => (S.first_learned_at ? Math.min(letzterSchritt(E), S.stufe + 1) : 0);

/* Geschätzte Dauer in Minuten (aus den Zeitrichtwerten der Aufgaben) */
export function minutenFuer(skillIds) {
  const sek = skillIds.reduce((s, id) => {
    const g = skillGeneratoren(id)[0];
    return s + (g ? (g.afb === 1 ? 90 : g.afb === 2 ? 150 : 210) : 120);
  }, 0);
  return skillIds.length ? Math.max(1, Math.round(sek / 60)) : 0;
}

/* Auswahl für „Heute in Mathe“. Reihenfolge:
   1 überfällig · 2 zuletzt Schwierigkeiten · 3 heute fällig · 4 ältere Voraussetzung für den aktuellen Stoff.
   aktuellesThema: z. B. das zuletzt geübte Thema (T.zuletzt). */
export function heuteAuswahl(E, { jetzt = Date.now(), tz, aktuellesThema = null, max = 8, vorlauf = 3 } = {}) {
  const heute = datumVon(jetzt, tz);
  const items = [];
  for (const S of Object.values(E.skills)) {
    if (!istFaellig(S, heute)) continue;
    const ueber = tageZwischen(S.next_review_at, heute);
    const schlecht = S.last_result === "nicht" || S.last_result === "teilweise";
    let prio, grund;
    if (!S.first_learned_at) { prio = ueber > 0 ? 1 : 2; grund = "Noch nicht selbstständig gelöst – hier fehlt der erste sichere Schritt."; }
    else if (ueber > 0) { prio = 1; grund = `Überfällig seit ${ueber} ${ueber === 1 ? "Tag" : "Tagen"}.`; }
    else if (schlecht) { prio = 2; grund = "Zuletzt gab es hier Schwierigkeiten – kurz gezielt nachtrainieren."; }
    else { prio = 3; grund = "Heute fällig."; }
    items.push({ skill_id: S.skill_id, prio, grund, ueberfaellig: Math.max(0, ueber), schritt: schrittVon(S, E), status: statusVon(S, E), stufe: S.stufe });
  }
  items.sort((a, b) => a.prio - b.prio || b.ueberfaellig - a.ueberfaellig || a.stufe - b.stufe || a.skill_id.localeCompare(b.skill_id));

  /* 4: ältere Skills, die für das aktuelle Thema gebraucht werden und bald fällig sind */
  const extra = [];
  if (aktuellesThema) {
    const gebraucht = new Set();
    for (const s of SKILLS) if (skillKapitel(s.id).thema === aktuellesThema) voraussetzungen(s.id).forEach((v) => gebraucht.add(v));
    const bis = addTage(heute, vorlauf);
    for (const id of gebraucht) {
      const S = E.skills[id];
      if (!S || !S.first_learned_at || S.next_review_at <= heute || S.next_review_at > bis) continue;
      const nuetzlich = SKILLS.filter((s) => skillKapitel(s.id).thema === aktuellesThema && voraussetzungen(s.id).includes(id)).map((s) => s.name);
      extra.push({ skill_id: id, prio: 4, grund: `Wird für ${THEMEN[aktuellesThema].name} gebraucht${nuetzlich.length ? ` (${nuetzlich[0]})` : ""} und ist bald fällig.`, ueberfaellig: 0, schritt: schrittVon(S, E), status: statusVon(S, E), stufe: S.stufe });
    }
  }
  const faelligAnzahl = items.length;
  const auswahl = [...items, ...extra].slice(0, max);
  return { heute, faellig: faelligAnzahl, items: auswahl, minuten: minutenFuer(auswahl.map((x) => x.skill_id)) };
}

/* Wie viele Skills wurden heute schon wiederholt (für den Fortschrittsbalken der Einheit)? */
export function heuteErledigt(E, jetzt = Date.now(), tz) {
  const heute = datumVon(jetzt, tz);
  return Object.values(E.skills).filter((S) => S.review_history.some((h) => h.datum === heute)).length;
}

/* ---------- Aufgabenwahl mit Variation ---------- */

/* Wählt den Generator für die Wiederholung. Schritt 2 (Tag 3): eine andere Aufgabenart als zuletzt.
   Schritt 4 (Tag 14): die anspruchsvollste Art (mehr Rechenschritte). Sonst: möglichst nicht dieselbe wie zuletzt. */
export function waehleGenerator(skillId, schritt, letzterGenerator = null, rng = Math.random, fehlerTyp = null) {
  const gens = skillGeneratoren(skillId);
  if (!gens.length) return null;
  /* Nach einem Fehler: gezielt eine Aufgabenart, die genau diesen Fehlertyp trainiert (statt nur die Musterlösung zu zeigen) */
  const gezielt = fehlerTyp ? gens.filter((g) => (g.fuer || []).includes(fehlerTyp)) : [];
  if (gezielt.length) {
    const neu = gezielt.filter((g) => g.id !== letzterGenerator);
    const p = neu.length ? neu : gezielt;
    return p[Math.floor(rng() * p.length) % p.length].id;
  }
  if (schritt === 4) return gens.slice().sort((a, b) => b.afb - a.afb)[0].id;
  const andere = gens.filter((g) => g.id !== letzterGenerator);
  const pool = andere.length ? andere : gens;
  return pool[Math.floor(rng() * pool.length) % pool.length].id;
}
export function letzterGeneratorVon(S) {
  const h = S && S.review_history;
  return h && h.length ? h[h.length - 1].generator : null;
}


/* ======================================================================
   Tagesplan & Lernübersicht (erste Version)
   ====================================================================== */

const NEU_TAGE = 14;   // so lange zählt ein Thema als „aktuell“ nach der letzten Übung

/* Woran lernt der Schüler gerade? Themen mit Übung in den letzten Tagen (jüngste zuerst, höchstens 3).
   T = Trainingsstand (LERN.training), darf null sein. */
export function aktuelleThemen(E, T, { jetzt = Date.now(), tz } = {}) {
  const heute = datumVon(jetzt, tz);
  const grenze = jetzt - NEU_TAGE * 86400000;
  const zeiten = {};
  if (T && T.themen) for (const [t, v] of Object.entries(T.themen)) if (THEMEN[t] && v && v.zuletzt >= grenze) zeiten[t] = Math.max(zeiten[t] || 0, v.zuletzt);
  const ab = addTage(heute, -7);
  for (const S of Object.values((E && E.skills) || {})) {
    const k = skillKapitel(S.skill_id);
    if (!k.thema) continue;
    for (const h of S.review_history) if (h.datum >= ab) zeiten[k.thema] = Math.max(zeiten[k.thema] || 0, Date.parse(h.at) || 0);
  }
  return Object.entries(zeiten).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([thema, zuletzt]) => ({ thema, name: THEMEN[thema].name, zuletzt }));
}

const gelernt = (E, id) => Boolean(E.skills[id] && E.skills[id].first_learned_at);

/* Neue Skills zum „Weiterlernen“: noch nie geübt, alle Voraussetzungen schon gelernt, bevorzugt in den aktuellen Themen */
function weiterKandidaten(E, themen) {
  const frei = SKILLS.filter((s) => !E.skills[s.id] && s.voraus.every((v) => gelernt(E, v)));
  const imThema = (s) => themen.some((t) => skillKapitel(s.id).thema === t.thema);
  return [...frei.filter(imThema), ...(themen.length ? [] : frei)];
}

/* Baut den Plan für heute (rein, ohne zu speichern). */
export function tagesplanBauen(E, T, { jetzt = Date.now(), tz, max = 8 } = {}) {
  const themen = aktuelleThemen(E, T, { jetzt, tz });
  const sicht = heuteAuswahl(E, { jetzt, tz, aktuellesThema: themen.length ? themen[0].thema : null, max: 100 });
  const wdh = sicht.items.filter((i) => i.prio < 4).slice(0, 6).map((i) => ({ skill_id: i.skill_id, art: "wiederholung", grund: i.grund }));
  const vor = sicht.items.filter((i) => i.prio === 4).slice(0, 2).map((i) => ({ skill_id: i.skill_id, art: "voraussetzung", grund: i.grund }));
  const belegt = [...wdh, ...vor].map((i) => i.skill_id);
  const ar = arbeitsItems(E, { jetzt, tz, bereits: belegt });
  /* Reihenfolge: fällige Wiederholungen, dann alles für die Arbeit, dann Grundlagen, dann sonstige neue Schritte */
  const items = [...wdh, ...ar.weiter, ...ar.auffrisch, ...vor];
  const platz = Math.max(0, max - items.length);
  const wunsch = wdh.length >= 5 ? 1 : 2;
  const schon = new Set(items.map((i) => i.skill_id));
  let n = 0;
  for (const s of weiterKandidaten(E, themen)) {
    if (n >= Math.min(wunsch, platz)) break;
    if (schon.has(s.id)) continue;
    const th = skillKapitel(s.id);
    items.push({ skill_id: s.id, art: "weiter", grund: `Neuer Schritt in ${th.name || "deinem Stoff"}: Die Grundlagen dafür sitzen schon.` });
    n++;
  }
  return { erstellt: new Date(jetzt).toISOString(), items: items.slice(0, max), themen };
}

/* Legt den Tagesplan an, falls es heute noch keinen gibt. Gibt es ihn schon, bleibt er stehen:
   Neu fällige Skills (z. B. nach einem Fehler: „morgen wieder“ gilt für morgen, nicht für heute) werden nur ergänzt,
   nichts verschwindet – was heute schon geübt wurde, bleibt als erledigt sichtbar. Verändert E. */
export function tagesplanSichern(E, T, { jetzt = Date.now(), tz, max = 8 } = {}) {
  if (!E.tage) E.tage = {};
  const heute = datumVon(jetzt, tz);
  const neu = tagesplanBauen(E, T, { jetzt, tz, max });
  const alt = E.tage[heute];
  if (!alt) {
    E.tage[heute] = { erstellt: neu.erstellt, items: neu.items };
  } else {
    const da = new Set(alt.items.map((i) => i.skill_id));
    for (const i of neu.items) if (!da.has(i.skill_id) && (i.art !== "weiter" || i.arbeit) && alt.items.length < max + 4) alt.items.push(i);
  }
  const ds = Object.keys(E.tage).sort();
  for (const k of ds.slice(0, Math.max(0, ds.length - MAX_TAGE))) delete E.tage[k];
  return E.tage[heute];
}

/* Wie weit ist der heutige Plan? Je Eintrag: erledigt, Ergebnis, Termin danach. */
export function tagesStand(E, { jetzt = Date.now(), tz } = {}) {
  const heute = datumVon(jetzt, tz);
  const plan = E.tage && E.tage[heute];
  const geuebtHeute = (id) => ((E.skills[id] && E.skills[id].review_history) || []).filter((h) => h.datum === heute);
  const items = ((plan && plan.items) || []).map((i) => {
    const h = geuebtHeute(i.skill_id);
    const S = E.skills[i.skill_id];
    return { ...i, name: SKILL_INFO[i.skill_id].name, erledigt: h.length > 0, ergebnis: h.length ? h[h.length - 1].ergebnis : null,
      naechster: h.length && S ? S.next_review_at : null, status: S ? statusVon(S, E) : "neu" };
  });
  const imPlan = new Set(items.map((i) => i.skill_id));
  const zusaetzlich = Object.values(E.skills).filter((S) => !imPlan.has(S.skill_id) && geuebtHeute(S.skill_id).length).map((S) => ({ skill_id: S.skill_id, name: SKILL_INFO[S.skill_id].name }));
  const erledigt = items.filter((i) => i.erledigt).length;
  return { heute, vorhanden: Boolean(plan), items, erledigt, gesamt: items.length, fertig: items.length > 0 && erledigt === items.length, zusaetzlich,
    minutenRest: minutenFuer(items.filter((i) => !i.erledigt).map((i) => i.skill_id)) };
}

/* Lernübersicht: was wurde gelernt (und wann), die letzten Tage, die nächsten Tage. */
export function lernUebersicht(E, { jetzt = Date.now(), tz, rueck = 14, vor = 14 } = {}) {
  const heute = datumVon(jetzt, tz);
  const skills = Object.values(E.skills);
  const alle = skills.filter((S) => S.first_learned_at).map((S) => ({
    skill_id: S.skill_id, name: SKILL_INFO[S.skill_id].name, thema: skillKapitel(S.skill_id).name,
    erstmals: datumVon(Date.parse(S.first_learned_at), tz), zuletzt: S.last_reviewed_at ? datumVon(Date.parse(S.last_reviewed_at), tz) : null,
    naechster: S.next_review_at, status: statusVon(S, E), stufe: S.stufe, wiederholungen: S.review_history.filter((h) => h.faellig && h.schritt > 0).length,
  })).sort((a, b) => (a.erstmals < b.erstmals ? 1 : a.erstmals > b.erstmals ? -1 : a.name.localeCompare(b.name)));

  const proTag = {};
  for (const S of skills) for (const h of S.review_history) (proTag[h.datum] = proTag[h.datum] || []).push({ skill_id: S.skill_id, ergebnis: h.ergebnis });
  const rangE = { nicht: 0, teilweise: 1, sicher: 2 };
  const rueckblick = [];
  for (let i = 0; i < rueck; i++) {
    const d = addTage(heute, -i);
    const liste = proTag[d] || [];
    const nach = {};
    for (const x of liste) if (!nach[x.skill_id] || rangE[x.ergebnis] < rangE[nach[x.skill_id]]) nach[x.skill_id] = x.ergebnis;
    const plan = E.tage && E.tage[d];
    rueckblick.push({ datum: d, aufgaben: liste.length, skills: Object.entries(nach).map(([skill_id, ergebnis]) => ({ skill_id, name: SKILL_INFO[skill_id].name, ergebnis })),
      geplant: plan ? plan.items.length : null, geplantErledigt: plan ? plan.items.filter((it) => nach[it.skill_id]).length : null });
  }

  const vorschau = Array.from({ length: vor }, (_, i) => ({ datum: addTage(heute, i), skills: [] }));
  for (const S of skills) {
    if (!S.first_learned_at && S.next_review_at > heute) continue;
    const i = Math.max(0, tageZwischen(heute, S.next_review_at));
    if (i < vor) vorschau[i].skills.push({ skill_id: S.skill_id, name: SKILL_INFO[S.skill_id].name, neu: !S.first_learned_at });
  }
  vorschau.forEach((v) => v.skills.sort((a, b) => a.name.localeCompare(b.name)));

  let serie = 0;
  let d = (proTag[heute] || []).length ? heute : addTage(heute, -1);
  while ((proTag[d] || []).length) { serie++; d = addTage(d, -1); }
  const stat = (k) => alle.filter((x) => x.status === k).length;
  return {
    heute, gelernt: alle, serie, aufgabenGesamt: skills.reduce((n, S) => n + S.review_history.length, 0),
    seit: alle.length ? alle[alle.length - 1].erstmals : null,
    anzahl: { gelernt: alle.length, training: stat("training"), unsicher: stat("unsicher"), stabil: stat("stabil"), gefestigt: stat("gefestigt"), neu: skills.length - alle.length },
    rueckblick, vorschau,
  };
}


/* ======================================================================
   Klassenarbeiten: Schüler trägt Datum und Themen ein, der Tagesplan reagiert sofort.
   Gespeichert in E.arbeiten. Löschen = Markierung (geloescht), damit der Abgleich zwischen Geräten
   nichts wiederbelebt.
   ====================================================================== */

export function normiereArbeiten(liste) {
  const aus = new Map();
  for (const a of Array.isArray(liste) ? liste : []) {
    if (!a || typeof a.id !== "string" || !istDatum(a.datum)) continue;
    const neu = {
      id: a.id, art: typeof a.art === "string" && a.art ? a.art.slice(0, 30) : "Klassenarbeit", datum: a.datum,
      themen: [...new Set((Array.isArray(a.themen) ? a.themen : []).filter((t) => THEMEN[t]))],
      notiz: typeof a.notiz === "string" ? a.notiz.slice(0, 80) : "",
      erstellt: Number.isFinite(a.erstellt) ? a.erstellt : 0, geaendert: Number.isFinite(a.geaendert) ? a.geaendert : (Number.isFinite(a.erstellt) ? a.erstellt : 0),
      geloescht: a.geloescht === true,
    };
    const alt = aus.get(neu.id);
    if (!alt || neu.geaendert >= alt.geaendert) aus.set(neu.id, neu);
  }
  return [...aus.values()].sort((x, y) => x.datum.localeCompare(y.datum) || x.id.localeCompare(y.id)).slice(-MAX_ARBEITEN);
}

export function arbeitNeu(E, { art = "Klassenarbeit", datum, themen = [], notiz = "" }, jetzt = Date.now()) {
  if (!istDatum(datum)) return null;
  const a = { id: `a${jetzt.toString(36)}${Math.random().toString(36).slice(2, 5)}`, art, datum, themen, notiz, erstellt: jetzt, geaendert: jetzt, geloescht: false };
  E.arbeiten = normiereArbeiten([...(E.arbeiten || []), a]);
  return E.arbeiten.find((x) => x.id === a.id) || null;
}
export function arbeitLoeschen(E, id, jetzt = Date.now()) {
  E.arbeiten = normiereArbeiten((E.arbeiten || []).map((a) => (a.id === id ? { ...a, geloescht: true, geaendert: jetzt } : a)));
}

export const tageText = (n) => (n <= 0 ? "heute" : n === 1 ? "morgen" : `in ${n} Tagen`);
const datumKurzTT = (d) => `${d.slice(8, 10)}.${d.slice(5, 7)}.`;

/* Bevorstehende Arbeiten (ab heute), nächste zuerst */
export function kommendeArbeiten(E, { jetzt = Date.now(), tz } = {}) {
  const heute = datumVon(jetzt, tz);
  return (E.arbeiten || []).filter((a) => !a.geloescht && a.datum >= heute)
    .map((a) => ({ ...a, tage: tageZwischen(heute, a.datum), themenNamen: a.themen.map((t) => THEMEN[t].name) }));
}

/* Skills zu den Themen einer Arbeit */
export const skillsZuThemen = (themen) => SKILLS.filter((s) => themen.includes(skillKapitel(s.id).thema));

/* Wie steht es um eine Arbeit? Reiner Überblick für die Anzeige direkt nach dem Eintragen. */
export function arbeitsPlanung(E, a, { jetzt = Date.now(), tz } = {}) {
  const heute = datumVon(jetzt, tz);
  const tage = Math.max(0, tageZwischen(heute, a.datum));
  const skills = skillsZuThemen(a.themen);
  const gelernt = skills.filter((s) => E.skills[s.id] && E.skills[s.id].first_learned_at);
  const sitzen = gelernt.filter((s) => E.skills[s.id].last_result === "sicher").length;
  const neu = skills.length - gelernt.length;
  const proTag = 3;                                           // höchstens so viele neue Schritte am Tag im Plan
  return { tage, anzahl: skills.length, neu, sitzen, unsicher: gelernt.length - sitzen, knapp: neu > proTag * Math.max(0, tage - 1), keineSkills: skills.length === 0 };
}

/* Auswahl für den Tagesplan aus den Arbeiten der nächsten 28 Tage */
function arbeitsItems(E, { jetzt, tz, bereits }) {
  const heute = datumVon(jetzt, tz);
  const arbeiten = kommendeArbeiten(E, { jetzt, tz }).filter((a) => a.tage <= 28);
  const weiter = [], auffrisch = [];
  const belegt = new Set(bereits);
  for (const a of arbeiten) {
    const ziele = skillsZuThemen(a.themen).map((s) => s.id);
    const name = (id) => skillKapitel(id).name;
    const wann = `${a.art} ${tageText(a.tage)} (${datumKurzTT(a.datum)})`;
    /* neue Schritte: nicht begonnene Skills des Themas und ihre nicht begonnenen Grundlagen, sobald deren Grundlagen sitzen */
    const kandidaten = [];
    for (const id of ziele) for (const id2 of [...voraussetzungen(id).reverse(), id]) if (!E.skills[id2] && !kandidaten.includes(id2)) kandidaten.push(id2);
    const frei = kandidaten.filter((id) => SKILL_INFO[id].voraus.every((v) => gelernt_(E, v)));
    const grundlage = (id) => !ziele.includes(id);
    for (const id of frei.slice(0, a.tage <= 14 ? 3 : 2)) {
      if (belegt.has(id)) continue;
      belegt.add(id);
      weiter.push({ skill_id: id, art: "weiter", arbeit: a.id, grund: grundlage(id) ? `Grundlage für deine ${wann}: Ohne ${SKILL_INFO[id].name} wird ${name(ziele[0])} schwer.` : `Für deine ${wann}: Dieser Skill gehört zum Stoff (${name(id)}).` });
    }
    /* Auffrischen: bekannte Skills, deren nächste Wiederholung zu spät oder lange her wäre */
    const abstand = a.tage <= 3 ? 1 : 3;
    for (const id of ziele) {
      const S = E.skills[id];
      if (belegt.has(id) || !S || !S.first_learned_at || S.next_review_at <= heute) continue;
      const letzte = S.last_reviewed_at ? datumVon(Date.parse(S.last_reviewed_at), tz) : null;
      if (letzte && tageZwischen(letzte, heute) < abstand) continue;
      if (!(a.tage <= 7 || S.next_review_at > addTage(a.datum, -2))) continue;
      belegt.add(id);
      auffrisch.push({ skill_id: id, art: "pruefung", arbeit: a.id, grund: `Auffrischen für deine ${wann}.` });
    }
  }
  return { weiter: weiter.slice(0, 3), auffrisch: auffrisch.slice(0, arbeiten.some((a) => a.tage <= 3) ? 4 : 3) };
}
const gelernt_ = (E, id) => Boolean(E.skills[id] && E.skills[id].first_learned_at);

/* Eine Woche (Mo–So) für den Kalender. woche: 0 = diese Woche, -1 = vorige, 1 = nächste …
   heutePlan: Plan von heute in der Form tagesStand(...) (damit der Kalender den angezeigten Plan zeigt). fremde: [{datum, art}] */
export function wochenDaten(E, { jetzt = Date.now(), tz, woche = 0, heutePlan = null, fremde = [] } = {}) {
  const heute = datumVon(jetzt, tz);
  const dow = new Date(heute + "T00:00:00Z").getUTCDay();
  const montag = addTage(heute, -((dow + 6) % 7) + 7 * woche);
  const skills = Object.values(E.skills);
  const rang = { nicht: 0, teilweise: 1, sicher: 2 };
  const tage = Array.from({ length: 7 }, (_, i) => {
    const d = addTage(montag, i);
    const nach = {};
    let aufgaben = 0;
    for (const S of skills) for (const h of S.review_history) if (h.datum === d) { aufgaben++; if (!nach[S.skill_id] || rang[h.ergebnis] < rang[nach[S.skill_id]]) nach[S.skill_id] = h.ergebnis; }
    const geuebt = Object.entries(nach).map(([skill_id, ergebnis]) => ({ skill_id, name: SKILL_INFO[skill_id].name, ergebnis }));
    let plan = null;
    if (d === heute && heutePlan) plan = { items: heutePlan.items, gesamt: heutePlan.gesamt, erledigt: heutePlan.erledigt };
    else if (E.tage && E.tage[d]) {
      const items = E.tage[d].items.map((it) => ({ ...it, name: SKILL_INFO[it.skill_id].name, erledigt: Boolean(nach[it.skill_id]), ergebnis: nach[it.skill_id] || null }));
      plan = { items, gesamt: items.length, erledigt: items.filter((x) => x.erledigt).length };
    }
    const faellig = d > heute ? skills.filter((S) => S.next_review_at === d).map((S) => ({ skill_id: S.skill_id, name: SKILL_INFO[S.skill_id].name, neu: !S.first_learned_at })).sort((a, b) => a.name.localeCompare(b.name)) : [];
    const arbeiten = [
      ...(E.arbeiten || []).filter((a) => !a.geloescht && a.datum === d).map((a) => ({ id: a.id, art: a.art, themen: a.themen.map((t) => THEMEN[t].name), notiz: a.notiz })),
      ...fremde.filter((f) => f.datum === d).map((f) => ({ id: `x${f.datum}`, art: f.art, themen: [], notiz: "" })),
    ];
    return { datum: d, zeit: d < heute ? "vergangen" : d === heute ? "heute" : "zukunft", geuebt, aufgaben, plan, faellig, arbeiten };
  });
  return { woche, start: montag, ende: addTage(montag, 6), tage };
}
