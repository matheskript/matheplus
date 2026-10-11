/* ======================================================================
   perfTraining.js – Trainingsrunden und Skill-Badges des Performance-Labs
   (reine Logik, kein React, kein Speicher; arbeitet wie perfKern.js auf dem Objekt P).

   Regeln
     · Eine Runde besteht aus genau drei geprüften Aufgaben desselben Fehlertyps.
     · Die Person gibt den korrigierten Term selbst ein; geprüft wird exakt (perfAufgaben.js).
     · Falsche Antworten schließen eine Aufgabe nicht ab. Hinweise zählen nicht als Fehler, werden aber festgehalten.
       „Lösung ansehen“ beendet die Aufgabe OHNE Erfolg. Abgebrochene Runden zählen nie.
     · Drei erfolgreiche Runden desselben Fehlertyps (= neun gelöste Aufgaben) schalten das Badge frei.
     · Idempotent: dieselbe Anfrage zweimal ergibt keinen zweiten Versuch, keine zweite Runde, kein zweites Badge.
     · Jede Funktion verlangt die Nutzer-ID und sieht nur Runden dieser Person.
     · Trainingsfehler fließen NICHT ins Fehlerprofil: Wer übt, soll nicht durch das Üben ein „Muster“ erzeugen.
       Das Fehlerprofil entsteht nur aus echten Übungen, Scans und eigenen Meldungen.

   Das Badge dokumentiert eine erreichte Trainingsleistung – keinen dauerhaft beseitigten Fehler.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { AUFGABEN, aufgabeVon, bewerte, hatTraining, hilfeText, loesungsWeg } from "./perfAufgaben.js";
import { SCHWELLEN, baueCluster, hashId, logge } from "./perfKern.js";
import { TAXONOMIE_VERSION, typName } from "./perfTaxonomie.js";

export const RUNDE_GROESSE = 3;
export const RUNDEN_FUER_BADGE = 3;
export const MAX_HILFE = 3;
const MAX_VERSUCHE = 40;

export const BADGES = {
  vorzeichen: { name: "Vorzeichen-Profi", symbol: "±" },
};
export const badgeName = (typ) => BADGES[typ]?.name || `${typName(typ)}-Profi`;
export const badgeSymbol = (typ) => BADGES[typ]?.symbol || "★";

export const RUNDEN_STATUS = { laufend: "läuft", erfolgreich: "erfolgreich", nicht_geschafft: "nicht geschafft", abgebrochen: "abgebrochen" };

const meine = (P, nutzerId) => P.runden.filter((r) => r.nutzerId === nutzerId);
const finde = (P, nutzerId, id) => P.runden.find((r) => r.id === id && r.nutzerId === nutzerId) || null;
const text = (v, max = 120) => String(v ?? "").slice(0, max);

export const laufendeRunde = (P, nutzerId, typ = null) => meine(P, nutzerId).find((r) => r.status === "laufend" && (!typ || r.typ === typ)) || null;

/* ---------- Auswahl der drei Aufgaben ---------- */
/* Rotation: bisher am seltensten gespielte Aufgaben zuerst, dann der am seltensten geübte Kontext, dann der Untertyp,
   der zum persönlichen Fehlerprofil passt. Ohne gewählten Schwerpunkt kommen drei verschiedene Kontexte dran.
   Innerhalb der Runde steigt die Schwierigkeit. */
export function waehleAufgaben(P, nutzerId, typ, opts = {}) {
  const pool = AUFGABEN[typ] || [];
  const benutzt = new Map();
  const kontextN = new Map();
  for (const r of meine(P, nutzerId)) {
    if (r.typ !== typ || r.status === "abgebrochen") continue;
    for (const s of r.aufgaben) {
      const m = benutzt.get(s.id) || { n: 0, zuletzt: 0 };
      m.n += 1; m.zuletzt = Math.max(m.zuletzt, r.zeit);
      benutzt.set(s.id, m);
      const k = aufgabeVon(s.id)?.kontext;
      if (k) kontextN.set(k, (kontextN.get(k) || 0) + 1);
    }
  }
  const profilUntertyp = (baueCluster(P, nutzerId).find((c) => c.typ === typ && pool.some((a) => a.untertyp === c.untertyp)) || {}).untertyp || null;
  const schwerpunkt = opts.untertyp && pool.some((a) => a.untertyp === opts.untertyp) ? opts.untertyp : null;
  const schluessel = (a, i) => {
    const m = benutzt.get(a.id) || { n: 0, zuletzt: 0 };
    return [schwerpunkt ? (a.untertyp === schwerpunkt ? 0 : 1) : 0, m.n, schwerpunkt ? 0 : kontextN.get(a.kontext) || 0,
      !schwerpunkt && a.untertyp === profilUntertyp ? 0 : 1, m.zuletzt, i];
  };
  const sortiert = pool.map((a, i) => ({ a, k: schluessel(a, i) })).sort((x, y) => {
    for (let j = 0; j < x.k.length; j++) if (x.k[j] !== y.k[j]) return x.k[j] - y.k[j];
    return 0;
  });
  const gewaehlt = [];
  const kontexte = new Set();
  for (const { a } of sortiert) {
    if (gewaehlt.length >= RUNDE_GROESSE) break;
    if (!schwerpunkt && kontexte.has(a.kontext) && sortiert.some((o) => !kontexte.has(o.a.kontext) && !gewaehlt.includes(o.a))) continue;
    gewaehlt.push(a); kontexte.add(a.kontext);
  }
  return gewaehlt.sort((x, y) => x.schwierigkeit - y.schwierigkeit).map((a) => a.id);
}

/* ---------- Runde starten / fortsetzen ---------- */
export function starteRunde(P, nutzerId, typ, opts = {}, jetzt = Date.now()) {
  if (!hatTraining(typ)) return { ok: false, grund: "Für diesen Fehlertyp gibt es noch kein geprüftes Training." };
  const lauf = laufendeRunde(P, nutzerId, typ);
  if (lauf) return { ok: true, runde: lauf, fortgesetzt: true };
  const ids = waehleAufgaben(P, nutzerId, typ, opts);
  if (ids.length !== RUNDE_GROESSE) return { ok: false, grund: "Es sind nicht genug geprüfte Aufgaben vorhanden." };
  const nr = meine(P, nutzerId).filter((r) => r.typ === typ).length + 1;
  const runde = {
    id: "rd-" + hashId(nutzerId, typ, nr, jetzt), nutzerId, typ, nr, schwerpunkt: opts.untertyp || null,
    zeit: jetzt, ende: null, status: "laufend", taxonomie: TAXONOMIE_VERSION,
    aufgaben: ids.map((id, pos) => ({ id, pos, status: "offen", versuche: [], hilfe: 0, ende: null })),
  };
  if (opts.demo) runde.demo = true;
  P.runden.push(runde);
  /* Speicher klein halten: älteste beendete Runden fallen weg (Badges tragen ihre eigene Zusammenfassung) */
  while (P.runden.length > SCHWELLEN.maxRunden) {
    const i = P.runden.findIndex((r) => r.status !== "laufend");
    if (i < 0) break;
    P.runden.splice(i, 1);
  }
  logge(P, `Trainingsrunde gestartet (${typ})`, [runde.id], jetzt);
  return { ok: true, runde, fortgesetzt: false };
}

/* ---------- Rundenende und Badge ---------- */
function rundeBeendenFallsFertig(P, r, jetzt) {
  if (r.status !== "laufend" || r.aufgaben.some((s) => s.status === "offen")) return { beendet: false, badge: null };
  r.status = r.aufgaben.every((s) => s.status === "geloest") ? "erfolgreich" : "nicht_geschafft";
  r.ende = jetzt;
  logge(P, `Trainingsrunde beendet (${r.status})`, [r.id], jetzt);
  const b = r.status === "erfolgreich" ? badgePruefen(P, r.nutzerId, r.typ, jetzt) : { neu: false, badge: null };
  return { beendet: true, badge: b.neu ? b.badge : null };
}

export const erfolgreicheRunden = (P, nutzerId, typ) => meine(P, nutzerId).filter((r) => r.typ === typ && r.status === "erfolgreich").sort((a, b) => (a.ende || a.zeit) - (b.ende || b.zeit));

/* Schaltet das Badge frei, wenn die Bedingung erfüllt ist – genau einmal pro Person und Fehlertyp. */
export function badgePruefen(P, nutzerId, typ, jetzt = Date.now()) {
  const vorhanden = P.badges.find((b) => b.nutzerId === nutzerId && b.typ === typ);
  if (vorhanden) return { neu: false, badge: vorhanden };
  const erf = erfolgreicheRunden(P, nutzerId, typ);
  if (erf.length < RUNDEN_FUER_BADGE) return { neu: false, badge: null };
  const drei = erf.slice(0, RUNDEN_FUER_BADGE);
  const slots = drei.flatMap((r) => r.aufgaben);
  const badge = {
    id: "bd-" + hashId(nutzerId, typ), nutzerId, typ, name: badgeName(typ), zeit: jetzt,
    rundenIds: drei.map((r) => r.id), aufgaben: slots.length,
    hilfen: slots.reduce((s, x) => s + x.hilfe, 0), versuche: slots.reduce((s, x) => s + x.versuche.length, 0),
    ohneHilfe: slots.filter((x) => x.hilfe === 0).length,
    lernhistorie: drei.map((r) => ({ rundeId: r.id, nr: r.nr, ende: r.ende, ohneHilfe: r.aufgaben.filter((x) => x.hilfe === 0).length })),
    taxonomie: TAXONOMIE_VERSION,
  };
  if (drei.some((r) => r.demo)) badge.demo = true;
  P.badges.push(badge);
  logge(P, `Badge freigeschaltet (${badge.name})`, [badge.id], jetzt);
  return { neu: true, badge };
}

/* ---------- Antwort, Hilfe, Lösung, Abbruch ---------- */
/* Ergebnis: { ok, bewertung, gezaehlt, runde, ... }. Nicht lesbare oder leere Eingaben zählen nicht als Versuch.
   opts.anfrageId macht die Anfrage wiederholbar: dieselbe ID ergibt dasselbe Ergebnis ohne zweiten Versuch. */
export function antworten(P, nutzerId, rundeId, pos, eingabe, opts = {}, jetzt = Date.now()) {
  const r = finde(P, nutzerId, rundeId);
  if (!r) return { ok: false, grund: "Diese Runde gehört nicht zu dir oder existiert nicht." };
  if (r.status !== "laufend") return { ok: false, grund: "Die Runde ist schon beendet.", runde: r };
  const slot = r.aufgaben[pos];
  if (!slot) return { ok: false, grund: "Diese Aufgabe gibt es in der Runde nicht." };
  const a = aufgabeVon(slot.id);
  if (!a) return { ok: false, grund: "Die Aufgabe ist nicht mehr vorhanden." };
  if (slot.status !== "offen") return { ok: true, schonErledigt: true, gezaehlt: false, bewertung: null, runde: r };

  const anfrageId = opts.anfrageId ? text(opts.anfrageId, 80) : null;
  if (anfrageId) {
    const v = slot.versuche.find((x) => x.anfrageId === anfrageId);
    if (v) return { ok: true, wiederholt: true, gezaehlt: false, bewertung: bewerte(a, v.eingabe), runde: r };
  }
  const bewertung = bewerte(a, eingabe);
  if (!bewertung.zaehlt) return { ok: true, gezaehlt: false, bewertung, runde: r };

  slot.versuche.push({ zeit: jetzt, eingabe: text(eingabe), art: bewertung.art, anfrageId });
  if (slot.versuche.length > MAX_VERSUCHE) slot.versuche.splice(0, slot.versuche.length - MAX_VERSUCHE);
  if (bewertung.art === "richtig") { slot.status = "geloest"; slot.ende = jetzt; }
  const fin = rundeBeendenFallsFertig(P, r, jetzt);
  return { ok: true, gezaehlt: true, bewertung, runde: r, rundeBeendet: fin.beendet, neuesBadge: fin.badge };
}

/* Nächste Hilfestufe freischalten (1 Denkfrage, 2 Regel, 3 nächster Schritt). Die Lösung selbst verrät keine Stufe. */
export function hilfeNehmen(P, nutzerId, rundeId, pos, jetzt = Date.now()) {
  const r = finde(P, nutzerId, rundeId);
  if (!r || r.status !== "laufend") return { ok: false, grund: "Keine laufende Runde." };
  const slot = r.aufgaben[pos];
  if (!slot || slot.status !== "offen") return { ok: false, grund: "Diese Aufgabe ist schon abgeschlossen." };
  const a = aufgabeVon(slot.id);
  if (slot.hilfe < MAX_HILFE) { slot.hilfe += 1; logge(P, `Hilfe ${slot.hilfe} genutzt`, [r.id], jetzt); }
  return { ok: true, stufe: slot.hilfe, texte: Array.from({ length: slot.hilfe }, (_, i) => hilfeText(a, i + 1)), runde: r };
}

/* Lösung ansehen: beendet die Aufgabe ohne Erfolg. */
export function loesungAufdecken(P, nutzerId, rundeId, pos, jetzt = Date.now()) {
  const r = finde(P, nutzerId, rundeId);
  if (!r || r.status !== "laufend") return { ok: false, grund: "Keine laufende Runde." };
  const slot = r.aufgaben[pos];
  if (!slot) return { ok: false, grund: "Diese Aufgabe gibt es in der Runde nicht." };
  if (slot.status === "offen") { slot.status = "aufgedeckt"; slot.ende = jetzt; }
  const a = aufgabeVon(slot.id);
  const fin = rundeBeendenFallsFertig(P, r, jetzt);
  return { ok: true, weg: loesungsWeg(a), runde: r, rundeBeendet: fin.beendet };
}

export function rundeAbbrechen(P, nutzerId, rundeId, jetzt = Date.now()) {
  const r = finde(P, nutzerId, rundeId);
  if (!r || r.status !== "laufend") return false;
  r.status = "abgebrochen"; r.ende = jetzt;
  logge(P, "Trainingsrunde abgebrochen", [r.id], jetzt);
  return true;
}

/* ---------- Anzeige: Stand und Historie ---------- */
export function trainingsStand(P, nutzerId, typ) {
  const erf = erfolgreicheRunden(P, nutzerId, typ);
  const badge = P.badges.find((b) => b.nutzerId === nutzerId && b.typ === typ) || null;
  return {
    typ, name: typName(typ), hatTraining: hatTraining(typ), erfolgreicheRunden: erf.length, noetig: RUNDEN_FUER_BADGE,
    aufgabenGeloest: erf.length * RUNDE_GROESSE, aufgabenNoetig: RUNDEN_FUER_BADGE * RUNDE_GROESSE,
    laufend: laufendeRunde(P, nutzerId, typ), badge, badgeName: badgeName(typ),
    letzteRunde: erf.length ? (erf[erf.length - 1].ende || erf[erf.length - 1].zeit) : null,
  };
}

export function rundenHistorie(P, nutzerId) {
  return meine(P, nutzerId).slice().sort((a, b) => b.zeit - a.zeit).map((r) => ({
    id: r.id, typ: r.typ, name: typName(r.typ), nr: r.nr, status: r.status, zeit: r.zeit, ende: r.ende, demo: !!r.demo,
    geloest: r.aufgaben.filter((s) => s.status === "geloest").length,
    aufgedeckt: r.aufgaben.filter((s) => s.status === "aufgedeckt").length,
    hilfen: r.aufgaben.reduce((s, x) => s + x.hilfe, 0),
    versuche: r.aufgaben.reduce((s, x) => s + x.versuche.length, 0),
    ohneHilfe: r.aufgaben.filter((s) => s.status === "geloest" && s.hilfe === 0).length,
  }));
}

export const badgesVon = (P, nutzerId) => P.badges.filter((b) => b.nutzerId === nutzerId);
/* Fehlertypen, für die es ein geprüftes Training gibt */
export const trainierbareTypen = () => Object.keys(AUFGABEN).filter(hatTraining);
