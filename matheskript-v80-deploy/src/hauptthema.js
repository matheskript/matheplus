/* ======================================================================
   HAUPTTHEMA – „Dein Training startet hier.“: ein Kapitel ist das aktuelle Thema
   (meist: die nächste Klassenarbeit). Reine Logik, kein React, kein Speicher.

   · Stand je Unterthema aus dem Ebbinghaus-Lernstand (training.ebbinghaus):
       sicher   – alle geübten Skills stabil oder gefestigt
       unsicher – letzte Aufgabe in einem Skill nicht sicher gelöst
       geuebt   – angefangen, aber noch nicht stabil
       offen    – noch nie geübt
       ohne     – das Unterthema hat (noch) keine Aufgaben mit Rückmeldung
   · Vorwissen („Dafür brauchst du sicher“): direktes Vorwissen des Kapitels mit demselben Stand
   · Countdown bis zur Klassenarbeit, nächstes Kapitel im Buch
   · Fortschritt beim Neu-Planen (anderes Datum) übernehmen
   Speicher und Oberfläche: funcHauptthema.jsx / funcQuickfinder.jsx.
   ====================================================================== */
import { FEHLERTYPEN } from "./trainingDaten.js";
import { skillsVonGenerator } from "./ebbinghaus.js";
import { THEMEN, kapitelFuer } from "./schulbuch.js";
import { kapitelGeneratoren, unterthemen } from "./unterthemen.js";
import { tageZwischen, vorwissenStufen } from "./trainingsplan.js";

const FEHLER = Object.fromEntries(Object.entries(FEHLERTYPEN || {}));
export const fehlerName = (typ) => (typ && FEHLER[typ] ? FEHLER[typ].name : null);

const SICHER = new Set(["stabil", "gefestigt"]);

/* Stand einer Menge von Generatoren (Aufgabentypen) im Lernstand E = { skills: { id: Skill } } */
export function standAusGeneratoren(gen, E) {
  const skillIds = [...new Set((gen || []).flatMap(skillsVonGenerator))];
  if (!skillIds.length) return { art: "ohne", richtig: 0, n: 0, fehler: null };
  const skills = E && E.skills ? E.skills : {};
  const geuebt = skillIds.map((id) => skills[id]).filter((s) => s && (s.review_history || []).length);
  // Die letzten zehn Ergebnisse dieser Skills: wie viele sicher?
  const verlauf = geuebt.flatMap((s) => s.review_history).sort((a, b) => (a.at < b.at ? -1 : 1)).slice(-10);
  const richtig = verlauf.filter((h) => h.ergebnis === "sicher").length;
  const letzterFehler = [...verlauf].reverse().find((h) => h.ergebnis !== "sicher" && h.fehler_typ);
  const basis = { richtig, n: verlauf.length, fehler: letzterFehler ? letzterFehler.fehler_typ : null };
  if (!geuebt.length) return { art: "offen", ...basis };
  if (geuebt.some((s) => s.last_result === "nicht" || s.last_result === "teilweise")) return { art: "unsicher", ...basis };
  if (geuebt.length === skillIds.length && geuebt.every((s) => s.first_learned_at && SICHER.has(s.mastery_status))) return { art: "sicher", ...basis };
  return { art: "geuebt", ...basis };
}

export const STAND = {
  sicher: { name: "Sicher" },
  geuebt: { name: "Geübt" },
  unsicher: { name: "Wackelt" },
  offen: { name: "Offen" },
  ohne: { name: "Mit Werkzeug üben" },
};

/* Unterthemen des Kapitels mit Stand, dazu die Zählung für die Kopfzeile */
export function kapitelStand(kapitelId, E) {
  const teile = unterthemen(kapitelId).map((u) => ({ ...u, stand: standAusGeneratoren(u.gen, E) }));
  const zaehle = (a) => teile.filter((u) => u.stand.art === a).length;
  return { teile, sicher: zaehle("sicher"), geuebt: zaehle("geuebt") + zaehle("unsicher"), offen: zaehle("offen"), ohne: zaehle("ohne") };
}

/* Kurzer Text unter dem Unterthema */
export function standZeile(stand) {
  const quote = stand.n ? ` · ${stand.richtig} von ${stand.n} sicher` : "";
  const f = fehlerName(stand.fehler);
  if (stand.art === "sicher") return `Sicher${quote}`;
  if (stand.art === "unsicher") return `Wackelt${quote}${f ? ` · zuletzt: ${f}` : ""}`;
  if (stand.art === "geuebt") return `Geübt${quote}${f ? ` · zuletzt: ${f}` : ""}`;
  if (stand.art === "offen") return "Offen · noch nicht geübt";
  return null;
}

/* „Dafür brauchst du sicher“: direktes Vorwissen (höchstens fünf Kapitel) mit Stand */
export function vorwissenStand(kapitelId, schulart, E, max = 5) {
  return vorwissenStufen(kapitelId, schulart).direkt.slice(0, max)
    .filter((k) => THEMEN[k])
    .map((k) => ({ kapitel: k, titel: THEMEN[k].titel, stand: standAusGeneratoren(kapitelGeneratoren(k), E) }));
}

/* Countdown: { tage, gesamt, anteil } – anteil = schon vergangener Teil der Vorbereitungszeit (0 … 1).
   Ohne Termin null; Termin vorbei: tage < 0. */
export function countdown(termin, seit, heute) {
  if (!termin) return null;
  const tage = tageZwischen(heute, termin);
  const gesamt = Math.max(1, tageZwischen(seit || heute, termin));
  const anteil = Math.max(0, Math.min(1, 1 - tage / gesamt));
  return { tage, gesamt, anteil };
}

/* Nächstes Kapitel im Buch derselben Klasse (für „Wie geht es weiter?“ nach der Arbeit) */
export function naechstesKapitel(schulart, klasse, kapitelId) {
  const liste = kapitelFuer(schulart, klasse);
  const i = liste.findIndex((k) => k.id === kapitelId);
  return i >= 0 && i + 1 < liste.length ? liste[i + 1] : null;
}

/* Neuer Plan (z. B. anderes Datum): Erledigtes übernehmen, wo Phase und Titel übereinstimmen (jede alte Einheit höchstens einmal) */
export function erledigtUebertragen(alterPlan, erledigt, neuerPlan) {
  if (!alterPlan || !neuerPlan) return {};
  const frei = alterPlan.einheiten.filter((e) => erledigt && erledigt[e.id]);
  const neu = {};
  for (const e of neuerPlan.einheiten) {
    const i = frei.findIndex((a) => a.phase === e.phase && a.titel === e.titel);
    if (i >= 0) { neu[e.id] = erledigt[frei[i].id]; frei.splice(i, 1); }
  }
  return neu;
}

/* Datum lesbar: „Do, 5. November“ */
const WT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const WT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function datumLang(s, en = false) {
  const [j, m, t] = String(s).split("-").map(Number);
  if (!j || !m || !t) return "";
  const d = new Date(j, m - 1, t, 12);
  return en ? `${WT_EN[d.getDay()]}, ${MON_EN[m - 1]} ${t}` : `${WT[d.getDay()]}, ${t}. ${MON[m - 1]}`;
}

/* Gültiges Hauptthema aus dem Speicher (sonst null) */
export function hauptthemaPruefen(h) {
  if (!h || typeof h !== "object" || !THEMEN[h.kapitel]) return null;
  const datum = (x) => (typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x) ? x : null);
  return { kapitel: h.kapitel, schulart: typeof h.schulart === "string" ? h.schulart : "g9", klasse: typeof h.klasse === "string" ? h.klasse : null,
    termin: datum(h.termin), seit: datum(h.seit), planId: typeof h.planId === "string" ? h.planId : null, note: Number.isInteger(h.note) && h.note >= 1 && h.note <= 6 ? h.note : null };
}
