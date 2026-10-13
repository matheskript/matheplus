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

export const planTage = (E) => (PLAENE[E && E.plan] || PLAENE.standard).tage;
export const letzterSchritt = (E) => planTage(E).length - 1;

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

export function leereEbb() { return { version: 1, plan: "standard", skills: {} }; }

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
    s.mastery_status = statusVon(s, d);
    skills[id] = s;
  }
  d.skills = skills;
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
  const plan = planTage(E);
  const letzter = plan.length - 1;
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
    } else { // nicht abrufbar
      S.stufe = Math.max(0, S.stufe - 2);
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
export function waehleGenerator(skillId, schritt, letzterGenerator = null, rng = Math.random) {
  const gens = skillGeneratoren(skillId);
  if (!gens.length) return null;
  if (schritt === 4) return gens.slice().sort((a, b) => b.afb - a.afb)[0].id;
  const andere = gens.filter((g) => g.id !== letzterGenerator);
  const pool = andere.length ? andere : gens;
  return pool[Math.floor(rng() * pool.length) % pool.length].id;
}
export function letzterGeneratorVon(S) {
  const h = S && S.review_history;
  return h && h.length ? h[h.length - 1].generator : null;
}
