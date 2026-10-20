/* ======================================================================
   meinTraining.js – „Mein Mathe-Training“: das eine Planungsgehirn der App (reine Logik, kein React, kein Speicher).

   Ersetzt die getrennten Planer (Trainingsplan, Lernpfad-Wochenplan, Hauptthema-Plan, Ebbinghaus-Tagesplan)
   durch EINEN Tagesplan mit einem Lernstand. Die Bausteine bleiben: Skills und Wiederholungen aus
   ebbinghaus.js, Aufgaben aus trainingDaten.js, Kapitel und Unterthemen aus schulbuch.js / unterthemen.js.

   Zustand MT (liegt im Lernstand unter training.meinTraining, Konto-Abgleich: jüngster Stand gewinnt):
     aktiv      – bis zu 3 Themen in Arbeit (Kapitel oder Unterthema), je mit Teilen, Vorbereitung und Zähler
     danach     – bis zu 3 Themen in der Warteschlange (rücken automatisch nach)
     fertig     – abgeschlossene Themen (id, Datum)
     budget     – { art: "eintraege" | "minuten", wert }
     tage       – je Kalendertag der gespeicherte Plan (einmal pro Tag gebaut, danach nur ergänzt) und Erledigtes
     nachholen  – Stapel verpasster Kerntrainings/Basis-Checks (je Thema höchstens eins)
     freigabe   – { lehrer: bool } Darf die Lehrkraft Einträge in den Plan legen? (Coach darf immer)
     letzterBesuch – Kalendertag des letzten Plans (daraus ergeben sich „verpasste Tage“)

   Regeln (Stand 20.10.2026):
     · Fehler setzen nichts zurück (ebbinghaus.js); wiederkehrender Fehlertyp → enger Rhythmus + Video-Karte
     · Nachholen: Wiederholungen verfallen nie (sie bleiben fällig), Kern/Basis werden gestapelt (eins je Thema),
       Warm-up/Blatt-Foto verfallen; Nachhol-Einträge belegen höchstens die Hälfte des Tages;
       ab 7 verpassten Tagen Neustart-Check statt Nachholen
     · Tagesbudget wahlweise bis 8 Einträge oder 10/20/30 Minuten
   Keine base-Datei darf diese Datei importieren. Test: tests/meinTraining.test.mjs
   ====================================================================== */
import { THEMEN as KAPITEL, PLAN, SCHULART_STANDARD, klassenBoxen } from "./schulbuch.js";
import { unterthema, unterthemen, kapitelGeneratoren } from "./unterthemen.js";
import { KAPITEL_FORMELN } from "./kapitelFormeln.js";
import { vorbereitungFuer } from "./trainingsplan.js";
import { WERKZEUGE } from "./werkzeuge.js";
import { FEHLERTYPEN, GENERATOREN, THEMEN, normiere, wiederkehrende } from "./trainingDaten.js";
import { SKILL_INFO, addTage, datumVon, heuteAuswahl, istDatum, letzterSchritt, rhythmusSetzen, schrittVon, skillFehlertypen, skillsVonGenerator, tageZwischen } from "./ebbinghaus.js";
import { videoFuerThema } from "./trainingVideos.js";

/* ---------- Konstanten ---------- */
export const MAX_AKTIV = 3;
export const MAX_DANACH = 3;
export const NEUSTART_AB = 7;          // verpasste Tage, ab denen nicht nachgeholt, sondern neu gestartet wird
export const NACHHOL_ANTEIL = 0.5;     // Deckel: höchstens die Hälfte des Tagesplans
export const MAX_TAGE = 60;
export const MAX_NACHHOLEN = 12;
export const MAX_FERTIG = 60;
export const BUDGET = {
  eintraege: { name: "Einträge", werte: [8], einheit: "Einträge" },
  minuten: { name: "Minuten", werte: [10, 20, 30], einheit: "Min." },
};
export const TYPEN = {
  fremd: { name: "Auftrag", min: 10, farbe: "#7A5800" },
  check: { name: "Neustart-Check", min: 6, farbe: "#B85C2E" },
  wiederholung: { name: "Wiederholen", min: 3, farbe: "#004D98" },
  fehler: { name: "Fehler üben", min: 6, farbe: "#B85C2E" },
  basis: { name: "Basis-Check", min: 5, farbe: "#5B8FD1" },
  kern: { name: "Kerntraining", min: 8, farbe: "#A50044" },
  blatt: { name: "Aufs Blatt", min: 5, farbe: "#2F8F5B" },
  warmup: { name: "Warm-up", min: 5, farbe: "#8A6A00" },
};
export const TYP_IDS = Object.keys(TYPEN);
/* Drei Stufen eines Themas, abgeleitet aus der Ebbinghaus-Stufe der Skills (0 … 6) */
export const STUFEN = [
  { id: "wiedererkennen", name: "Wiedererkennen", ab: 0, zeile: "Du erkennst, was zu tun ist" },
  { id: "abrufen", name: "Abrufen", ab: 2, zeile: "Du holst den Weg aus dem Kopf" },
  { id: "anwenden", name: "Anwenden", ab: 4, zeile: "Du wendest es sicher an – auch anders verpackt" },
];
export const THEMA_STATUS = {
  neu: { name: "Neu", farbe: "#5B8FD1" },
  arbeit: { name: "In Arbeit", farbe: "#004D98" },
  wartet: { name: "Wartet auf Wiederholung", farbe: "#7A5800" },
  sicher: { name: "Sicher", farbe: "#2F8F5B" },
};

/* ---------- Themen (Kapitel oder Unterthema) ---------- */
const afb = (id) => (GENERATOREN.find((g) => g.id === id) || { afb: 2 }).afb;
const nachAfb = (ids) => [...ids].sort((a, b) => afb(a) - afb(b));

export function themaInfo(id) {
  if (!id || typeof id !== "string") return null;
  const u = unterthema(id);
  if (u) {
    const k = KAPITEL[u.kapitel];
    return { id, art: "unterthema", kapitel: u.kapitel, kapitelTitel: k.titel, titel: u.titel, zeile: k.titel, teile: [u], gen: u.gen, wz: u.wz || null, nr: u.nr, anzahl: unterthemen(u.kapitel).length };
  }
  const k = KAPITEL[id];
  if (!k) return null;
  const teile = unterthemen(id);
  return { id, art: "kapitel", kapitel: id, kapitelTitel: k.titel, titel: k.titel, zeile: k.zeile, teile, gen: kapitelGeneratoren(id), wz: (teile.find((t) => t.wz) || {}).wz || null, nr: null, anzahl: teile.length };
}
/* Hauptskill jedes Generators des Themas (ohne Doppelte) */
export function themaSkills(id, teile = null) {
  const info = themaInfo(id);
  if (!info) return [];
  const gen = teile ? info.teile.filter((t) => teile.includes(t.id)).flatMap((t) => t.gen) : info.gen;
  return [...new Set(gen.map((g) => skillsVonGenerator(g)[0]).filter(Boolean))];
}
/* Thema (trainingDaten.THEMEN) zum ersten Generator – für die Priorität der Wiederholungen */
export function themaBereich(id, teile = null) {
  const info = themaInfo(id);
  if (!info) return null;
  const gen = (teile ? info.teile.filter((t) => teile.includes(t.id)).flatMap((t) => t.gen) : info.gen)[0];
  const g = gen && GENERATOREN.find((x) => x.id === gen);
  return g && THEMEN[g.thema] ? g.thema : null;
}
export function stufeVon(stufe) {
  let aus = STUFEN[0];
  for (const s of STUFEN) if (stufe >= s.ab) aus = s;
  return aus;
}

/* Wie steht ein Thema? Aus den Ebbinghaus-Skills seiner Generatoren. */
export function themaStand(E, id, { teile = null, heute = datumVon(Date.now()) } = {}) {
  const alle = themaSkills(id, teile);
  const sk = (s) => E && E.skills && E.skills[s];
  const gelernt = alle.filter((s) => sk(s) && sk(s).first_learned_at);
  const letzter = letzterSchritt(E || {});
  /* erstes Lösen zählt schon; ab der 30-Tage-Stufe (5) gilt der Skill als voll – der 60-Tage-Schritt ist nur Erhalt */
  const summe = gelernt.reduce((a, s) => a + (1 + Math.min(letzter - 1, sk(s).stufe)) / letzter, 0);
  const prozent = alle.length ? Math.round((100 * summe) / alle.length) : 0;
  const stufeMittel = gelernt.length ? gelernt.reduce((a, s) => a + sk(s).stufe, 0) / gelernt.length : -1;
  const sicherSkills = alle.filter((s) => sk(s) && sk(s).stufe >= 5 && sk(s).last_result === "sicher").length;
  const sicher = alle.length > 0 && sicherSkills === alle.length;
  const unsicher = gelernt.some((s) => sk(s).last_result === "nicht" || sk(s).last_result === "teilweise");
  const naechste = gelernt.map((s) => sk(s).next_review_at).sort()[0] || null;
  const letzte = gelernt.map((s) => sk(s).last_reviewed_at).filter(Boolean).sort().pop() || null;
  const status = !gelernt.length ? "neu" : sicher ? "sicher" : naechste && naechste > heute && !unsicher ? "wartet" : "arbeit";
  return {
    id, skills: alle.length, gelernt: gelernt.length, sicherSkills, prozent, status, sicher, unsicher,
    stufe: stufeMittel < 0 ? null : stufeVon(stufeMittel), naechste, letzte: letzte ? datumVon(Date.parse(letzte)) : null, ohneAufgaben: alle.length === 0,
  };
}

/* ---------- Zustand ---------- */
export function leerMT() {
  return { version: 1, zuletzt: 0, aktiv: [], danach: [], fertig: [], budget: { art: "eintraege", wert: 8 }, tage: {}, nachholen: [], freigabe: { lehrer: false }, letzterBesuch: null, neustart: null };
}
function normiereThema(t, heute) {
  if (!t || typeof t !== "object" || !themaInfo(t.id)) return null;
  const info = themaInfo(t.id);
  const teile = (Array.isArray(t.teile) ? t.teile : []).filter((x) => info.teile.some((y) => y.id === x));
  return {
    id: t.id, teile: teile.length ? teile : info.teile.map((x) => x.id),
    schulart: PLAN[t.schulart] ? t.schulart : SCHULART_STANDARD, klasse: typeof t.klasse === "string" ? t.klasse : null,
    seit: istDatum(t.seit) ? t.seit : heute, kern: Number.isFinite(t.kern) ? Math.max(0, Math.trunc(t.kern)) : 0,
    vorbereitung: (Array.isArray(t.vorbereitung) ? t.vorbereitung : []).filter((k) => KAPITEL[k]),
  };
}
function normiereEintrag(e) {
  if (!e || typeof e !== "object" || !TYPEN[e.typ] || typeof e.id !== "string") return null;
  const aus = { ...e, min: Number.isFinite(e.min) ? e.min : TYPEN[e.typ].min, gen: Array.isArray(e.gen) ? e.gen.filter((g) => GENERATOREN.some((x) => x.id === g)) : [] };
  if (aus.typ === "wiederholung" && !SKILL_INFO[aus.skill_id]) return null;
  if (aus.thema && !themaInfo(aus.thema)) return null;
  return aus;
}
export function normiereMT(roh, heute = datumVon(Date.now())) {
  const d = { ...leerMT(), ...(roh && typeof roh === "object" ? roh : {}) };
  d.zuletzt = Number.isFinite(d.zuletzt) ? d.zuletzt : 0;
  const gesehen = new Set();
  const liste = (l, max) => (Array.isArray(l) ? l : []).map((t) => normiereThema(t, heute)).filter((t) => t && !gesehen.has(t.id) && gesehen.add(t.id)).slice(0, max);
  d.aktiv = liste(d.aktiv, MAX_AKTIV);
  d.danach = liste(d.danach, MAX_DANACH);
  d.fertig = (Array.isArray(d.fertig) ? d.fertig : []).filter((f) => f && themaInfo(f.id) && istDatum(f.am)).slice(-MAX_FERTIG);
  const b = d.budget && typeof d.budget === "object" ? d.budget : {};
  d.budget = BUDGET[b.art] && BUDGET[b.art].werte.includes(b.wert) ? { art: b.art, wert: b.wert } : { art: "eintraege", wert: 8 };
  const tage = {};
  for (const [dat, t] of Object.entries(d.tage && typeof d.tage === "object" ? d.tage : {})) {
    if (!istDatum(dat) || !t || !Array.isArray(t.eintraege)) continue;
    tage[dat] = { erstellt: typeof t.erstellt === "string" ? t.erstellt : null, eintraege: t.eintraege.map(normiereEintrag).filter(Boolean),
      erledigt: t.erledigt && typeof t.erledigt === "object" ? t.erledigt : {}, neustart: t.neustart === true, verpasst: Number.isFinite(t.verpasst) ? t.verpasst : 0, ausgewertet: t.ausgewertet === true };
  }
  d.tage = Object.fromEntries(Object.keys(tage).sort().slice(-MAX_TAGE).map((k) => [k, tage[k]]));
  d.nachholen = (Array.isArray(d.nachholen) ? d.nachholen : []).map(normiereEintrag).filter((e) => e && istDatum(e.von)).slice(-MAX_NACHHOLEN);
  d.freigabe = { lehrer: !!(d.freigabe && d.freigabe.lehrer) };
  d.letzterBesuch = istDatum(d.letzterBesuch) ? d.letzterBesuch : null;
  d.neustart = d.neustart && istDatum(d.neustart.am) ? { am: d.neustart.am } : null;
  return d;
}

/* ---------- Themen verwalten ---------- */
const kapitelVon = (id) => (themaInfo(id) || {}).kapitel;
export const istDabei = (MT, id) => [...MT.aktiv, ...MT.danach].some((t) => t.id === id || kapitelVon(t.id) === kapitelVon(id));

export function themaHinzufuegen(MT, { id, teile = null, schulart = SCHULART_STANDARD, klasse = null } = {}, heute = datumVon(Date.now())) {
  const info = themaInfo(id);
  if (!info) return { ok: false, grund: "unbekannt" };
  if (istDabei(MT, id)) return { ok: false, grund: "schon" };
  if (MT.aktiv.length >= MAX_AKTIV && MT.danach.length >= MAX_DANACH) return { ok: false, grund: "voll" };
  const gew = (teile || info.teile.map((t) => t.id)).filter((x) => info.teile.some((y) => y.id === x));
  const vb = vorbereitungFuer(gew.length ? gew : info.teile.map((t) => t.id), PLAN[schulart] ? schulart : SCHULART_STANDARD);
  const t = { id, teile: gew.length ? gew : info.teile.map((x) => x.id), schulart: PLAN[schulart] ? schulart : SCHULART_STANDARD, klasse, seit: heute, kern: 0,
    vorbereitung: [...vb.basis, ...vb.zwischen].filter((k) => kapitelGeneratoren(k).length).slice(0, 3) };
  MT.fertig = MT.fertig.filter((f) => f.id !== id);
  if (MT.aktiv.length < MAX_AKTIV) { MT.aktiv.push(t); MT.zuletzt = Date.now(); return { ok: true, wo: "aktiv" }; }
  MT.danach.push(t); MT.zuletzt = Date.now();
  return { ok: true, wo: "danach" };
}
export function nachruecken(MT, heute = datumVon(Date.now())) {
  const nach = [];
  while (MT.aktiv.length < MAX_AKTIV && MT.danach.length) { const t = MT.danach.shift(); t.seit = heute; MT.aktiv.push(t); nach.push(t.id); }
  return nach;
}
export function themaEntfernen(MT, id, heute = datumVon(Date.now())) {
  const vorher = MT.aktiv.length + MT.danach.length;
  MT.aktiv = MT.aktiv.filter((t) => t.id !== id);
  MT.danach = MT.danach.filter((t) => t.id !== id);
  MT.nachholen = MT.nachholen.filter((e) => e.thema !== id);
  nachruecken(MT, heute);
  MT.zuletzt = Date.now();
  return vorher !== MT.aktiv.length + MT.danach.length;
}
export function themaAbschliessen(MT, id, heute = datumVon(Date.now())) {
  if (!MT.aktiv.some((t) => t.id === id)) return false;
  MT.aktiv = MT.aktiv.filter((t) => t.id !== id);
  MT.nachholen = MT.nachholen.filter((e) => e.thema !== id);
  MT.fertig = [...MT.fertig.filter((f) => f.id !== id), { id, am: heute }].slice(-MAX_FERTIG);
  nachruecken(MT, heute);
  MT.zuletzt = Date.now();
  return true;
}
/* Aus der Warteschlange nach vorn (tauscht mit dem Ende von aktiv, falls voll) */
export function themaVorziehen(MT, id, heute = datumVon(Date.now())) {
  const i = MT.danach.findIndex((t) => t.id === id);
  if (i < 0) return false;
  const [t] = MT.danach.splice(i, 1);
  if (MT.aktiv.length >= MAX_AKTIV) { const alt = MT.aktiv.pop(); MT.danach.unshift(alt); }
  t.seit = heute; MT.aktiv.push(t); MT.zuletzt = Date.now();
  return true;
}
export function budgetSetzen(MT, art, wert) {
  if (!BUDGET[art] || !BUDGET[art].werte.includes(wert)) return false;
  MT.budget = { art, wert }; MT.zuletzt = Date.now();
  return true;
}
export function freigabeSetzen(MT, lehrer) { MT.freigabe = { lehrer: !!lehrer }; MT.zuletzt = Date.now(); }

/* ---------- Buchreihenfolge ---------- */
export function kapitelReihe(schulart = SCHULART_STANDARD) {
  const plan = PLAN[schulart] || PLAN.g9;
  return klassenBoxen(schulart).flatMap((b) => plan[b.id] || []);
}
const rang = (schulart, k) => { const r = kapitelReihe(schulart).indexOf(k); return r < 0 ? 999 : r; };
export const nachBuch = (themen) => [...themen].sort((a, b) => rang(a.schulart, kapitelVon(a.id)) - rang(b.schulart, kapitelVon(b.id)));

/* ---------- Einträge ---------- */
const grund = (typ) => TYPEN[typ].min;
function kernEintrag(t) {
  const info = themaInfo(t.id);
  const teile = t.teile.length ? t.teile : info.teile.map((x) => x.id);
  const teilId = teile[t.kern % teile.length];
  const u = unterthema(teilId);
  const runde = Math.floor(t.kern / teile.length) + 1;
  const gen = nachAfb(u ? u.gen : []);
  return { typ: "kern", thema: t.id, kapitel: info.kapitel, teil: teilId, titel: u ? u.titel : info.titel,
    zeile: `${info.kapitelTitel}${u && info.art === "kapitel" ? ` · Unterthema ${u.nr} von ${info.anzahl}` : ""}${runde > 1 ? ` · ${runde}. Runde` : ""}`,
    gen, anzahl: gen.length ? 5 : 0, min: gen.length ? grund("kern") : 6, wz: u && u.wz && WERKZEUGE[u.wz] ? u.wz : null };
}
function basisEintrag(t) {
  const info = themaInfo(t.id);
  const k = t.vorbereitung[0];
  const gen = nachAfb(kapitelGeneratoren(k)).slice(0, 3);
  return { typ: "basis", thema: t.id, kapitel: k, titel: `Basis-Check: ${KAPITEL[k].titel}`, zeile: `Grundlage für ${info.titel}`, gen, anzahl: 3, min: grund("basis") };
}
function checkEintrag(t) {
  const info = themaInfo(t.id);
  const gen = nachAfb([...new Set(info.teile.filter((x) => t.teile.includes(x.id)).flatMap((x) => x.gen))]);
  return { typ: "check", thema: t.id, kapitel: info.kapitel, titel: `Neustart-Check: ${info.titel}`, zeile: "Fünf Aufgaben – danach baut sich dein Plan neu", gen: gen.slice(0, 5), anzahl: gen.length ? 5 : 0, min: grund("check"), wz: info.wz };
}
export const themaEintrag = (t) => (t.vorbereitung.length ? basisEintrag(t) : kernEintrag(t));

/* Fehler-Karte zu einem wiederkehrenden Fehlertyp: Video (Lektion unserer Kurse oder Platzhalter) + Tipp */
export function fehlerKarte(wk) {
  if (!wk || !FEHLERTYPEN[wk.id]) return null;
  const f = FEHLERTYPEN[wk.id];
  return { typ: wk.id, name: f.name, kurz: f.kurz, tipp: f.tipp, thema: f.thema, themaName: THEMEN[f.thema] ? THEMEN[f.thema].name : "", n: wk.n, tage: wk.tage, video: videoFuerThema(f.thema) };
}
/* Skills, die in den engen Rhythmus gehören: wiederkehrender Fehlertyp (Beobachtungen) oder ≥ 3 „nicht abrufbar“ an ≥ 2 Tagen –
   nur Skills, die der Schüler schon hat */
export function engeSkills(E, T) {
  const aus = new Set();
  const da = Object.keys((E && E.skills) || {});
  for (const w of wiederkehrende(normiere(T || {}))) for (const s of da) if (skillFehlertypen(s).includes(w.id)) aus.add(s);
  for (const S of Object.values((E && E.skills) || {})) {
    const schlecht = (S.review_history || []).filter((h) => h.ergebnis === "nicht");
    if (schlecht.length >= 3 && new Set(schlecht.map((h) => h.datum)).size >= 2) aus.add(S.skill_id);
  }
  return [...aus];
}

/* ---------- Tagesplan bauen ---------- */
/* fremd: Aufträge von Coach/Lehrkraft [{ id, titel, zeile, ziel, absender, erledigt }] (kommen vom Server) */
export function tagesplanBauen(MT, E, T, { jetzt = Date.now(), tz, fremd = [] } = {}) {
  const heute = datumVon(jetzt, tz);
  const b = MT.budget;
  const maxN = b.art === "eintraege" ? b.wert : 12;
  const maxMin = b.art === "minuten" ? b.wert : Infinity;
  const eintraege = [];
  let min = 0;
  /* Ein Platz (bzw. fünf Minuten) bleibt immer für „Aufs Blatt“ frei – das tägliche Pen-&-Paper-Foto wird nie verdrängt */
  const reserve = (e) => (e.typ === "blatt" || eintraege.some((x) => x.typ === "blatt") ? 0 : 1);
  const passt = (e) => eintraege.length + reserve(e) < maxN && (min + e.min + reserve(e) * TYPEN.blatt.min <= maxMin || eintraege.length === 0);
  const push = (e, erzwingen = false) => {
    if (!erzwingen && !passt(e)) return false;
    eintraege.push({ ...e, id: `${heute}-${eintraege.length + 1}` }); min += e.min;
    return true;
  };
  const verpasst = MT.letzterBesuch && MT.letzterBesuch < heute ? Math.max(0, tageZwischen(MT.letzterBesuch, heute) - 1) : 0;
  const neustart = verpasst >= NEUSTART_AB && MT.aktiv.length > 0;
  const wk = wiederkehrende(normiere(T || {}))[0] || null;

  /* 1 · Aufträge von Coach/Lehrkraft: stehen oben, verfallen nie, zählen aufs Budget, werden aber nie gekappt */
  for (const f of fremd) if (f && !f.erledigt && f.titel) push({ typ: "fremd", auftrag: f.id, titel: f.titel, zeile: f.zeile || "", ziel: f.ziel || null, absender: f.absender || "", min: grund("fremd") }, true);

  /* 2 · Neustart-Check nach langer Pause: ein Check je Thema, sonst nichts – der Plan baut sich danach neu */
  if (neustart) {
    for (const t of nachBuch(MT.aktiv)) push(checkEintrag(t), true);
    push({ typ: "blatt", titel: "Aufs Blatt: eine Aufgabe von Hand", zeile: "Rechne eine Aufgabe auf Papier und schick Mathilda das Foto.", ziel: { ansicht: "analyse", foto: "blatt" }, min: grund("blatt") });
    return { heute, eintraege, verpasst, neustart: true, nachgeholt: 0, fehlerKarte: wk ? fehlerKarte(wk) : null, minuten: min };
  }

  /* 3 · fällige Wiederholungen (überfällig → Schwierigkeiten → heute fällig). Plätze bleiben frei für: ein Schritt je aktivem Thema,
     den Fehler-Eintrag und das Blatt – mindestens zwei Wiederholungen kommen aber immer dran */
  const bereich = MT.aktiv.length ? themaBereich(MT.aktiv[0].id, MT.aktiv[0].teile) : null;
  const sicht = heuteAuswahl(E, { jetzt, tz, aktuellesThema: bereich, max: 20 });
  const wdhMax = Math.max(2, maxN - eintraege.length - 1 - (wk ? 1 : 0) - MT.aktiv.length);
  for (const it of sicht.items.filter((i) => i.prio < 4).slice(0, wdhMax)) {
    const S = E.skills[it.skill_id];
    push({ typ: "wiederholung", skill_id: it.skill_id, titel: SKILL_INFO[it.skill_id].name, zeile: it.grund, schritt: S ? schrittVon(S, E) : 0, gen: [], anzahl: 1, min: grund("wiederholung") });
  }

  /* 4 · wiederkehrender Fehler: gezielt üben (die Video-Karte steht darüber) */
  if (wk) push({ typ: "fehler", fehlertyp: wk.id, titel: `Fehler üben: ${FEHLERTYPEN[wk.id].name}`, zeile: FEHLERTYPEN[wk.id].kurz, ziel: { ansicht: "fehlertraining" }, min: grund("fehler") });

  /* 5 · Nachholen: ältestes zuerst, höchstens die Hälfte des Tages */
  const deckelN = Math.max(1, Math.floor(maxN * NACHHOL_ANTEIL));
  const deckelMin = maxMin === Infinity ? Infinity : maxMin * NACHHOL_ANTEIL;
  let nhN = 0, nhMin = 0, nachgeholt = 0;
  const nachgeholteThemen = new Set();
  for (const e of [...MT.nachholen].sort((p, q) => p.von.localeCompare(q.von))) {
    if (nhN >= deckelN || nhMin + e.min > deckelMin) break;
    const { id: nachholId, ...rest } = e;
    if (push({ ...rest, nachholId: nachholId || `${e.von}-${e.typ}-${e.thema}`, nachholenVon: e.von })) { nhN++; nhMin += e.min; nachgeholt++; nachgeholteThemen.add(e.thema); }
  }

  /* 6 · je aktivem Thema ein Schritt: Basis-Check, solange Vorbereitung offen ist, sonst Kerntraining in Buchreihenfolge */
  for (const t of nachBuch(MT.aktiv)) if (!nachgeholteThemen.has(t.id)) push(themaEintrag(t));

  /* 7 · täglich aufs Blatt (Pen & Paper): eine Aufgabe von Hand, Foto an Mathilda */
  push({ typ: "blatt", titel: "Aufs Blatt: eine Aufgabe von Hand", zeile: "Rechne eine Aufgabe auf Papier und schick Mathilda das Foto.", ziel: { ansicht: "analyse", foto: "blatt" }, min: grund("blatt") });

  /* 8 · Warm-up nur, wenn noch Platz ist */
  if (!eintraege.some((e) => e.typ === "warmup")) push({ typ: "warmup", titel: "5 Minuten Mathe", zeile: "Fünf kurze Aufgaben zum Aufwärmen", ziel: { ansicht: "warmup" }, min: grund("warmup") });

  return { heute, eintraege, verpasst, neustart: false, nachgeholt, fehlerKarte: wk ? fehlerKarte(wk) : null, minuten: min };
}

/* Verpasste Kern/Basis-Einträge vergangener Tage auf den Nachhol-Stapel legen (je Thema und Typ nur der jüngste) */
export function nachholenAuffuellen(MT, heute) {
  for (const d of Object.keys(MT.tage).sort()) {
    const t = MT.tage[d];
    if (d >= heute || t.ausgewertet) continue;
    for (const e of t.eintraege) {
      if (t.erledigt[e.id] || !["kern", "basis"].includes(e.typ) || !e.thema) continue;
      if (!MT.aktiv.some((x) => x.id === e.thema)) continue;
      const { id, nachholId, nachholenVon, ...rest } = e;
      MT.nachholen = MT.nachholen.filter((n) => !(n.thema === e.thema && n.typ === e.typ));
      MT.nachholen.push({ ...rest, id: `nh-${d}-${e.typ}-${e.thema}`, von: nachholenVon || d });
    }
    t.ausgewertet = true;
  }
  MT.nachholen = MT.nachholen.slice(-MAX_NACHHOLEN);
}

/* Legt den Plan für heute an (einmal pro Tag); gibt es ihn schon, kommen nur neue Aufträge und neu fällige Wiederholungen dazu.
   Verändert MT (und E: enger Rhythmus für Skills mit wiederkehrendem Fehler). */
export function tagesplanSichern(MT, E, T, { jetzt = Date.now(), tz, fremd = [] } = {}) {
  const heute = datumVon(jetzt, tz);
  const eng = engeSkills(E, T);
  if (eng.length && E) rhythmusSetzen(E, eng, "eng");
  if (!MT.tage[heute]) {
    nachholenAuffuellen(MT, heute);
    const neu = tagesplanBauen(MT, E, T, { jetzt, tz, fremd });
    MT.tage[heute] = { erstellt: new Date(jetzt).toISOString(), eintraege: neu.eintraege, erledigt: {}, neustart: neu.neustart, verpasst: neu.verpasst, ausgewertet: false };
    if (neu.neustart) { MT.nachholen = []; MT.neustart = { am: heute }; }
  } else {
    const plan = MT.tage[heute];
    const neu = tagesplanBauen(MT, E, T, { jetzt, tz, fremd });
    const daAuftrag = new Set(plan.eintraege.filter((e) => e.typ === "fremd").map((e) => e.auftrag));
    const daSkill = new Set(plan.eintraege.filter((e) => e.typ === "wiederholung").map((e) => e.skill_id));
    for (const e of neu.eintraege) {
      if (e.typ === "fremd" && !daAuftrag.has(e.auftrag)) plan.eintraege.unshift({ ...e, id: `${heute}-a${plan.eintraege.length + 1}` });
      else if (e.typ === "wiederholung" && !daSkill.has(e.skill_id) && plan.eintraege.length < (MT.budget.art === "eintraege" ? MT.budget.wert : 12) + 4) plan.eintraege.push({ ...e, id: `${heute}-w${plan.eintraege.length + 1}` });
    }
  }
  MT.letzterBesuch = heute;
  const ds = Object.keys(MT.tage).sort();
  for (const k of ds.slice(0, Math.max(0, ds.length - MAX_TAGE))) delete MT.tage[k];
  MT.zuletzt = Date.now();
  return MT.tage[heute];
}

/* Plan von heute neu bauen (z. B. nach Budgetwechsel oder neuem Thema) – Erledigtes bleibt erledigt, der Tag zählt nicht als verpasst */
export function tagesplanNeu(MT, E, T, { jetzt = Date.now(), tz, fremd = [] } = {}) {
  const heute = datumVon(jetzt, tz);
  const alt = MT.tage[heute];
  const signatur = (e) => `${e.typ}|${e.thema || ""}|${e.teil || ""}|${e.kapitel || ""}|${e.skill_id || ""}|${e.auftrag || ""}|${e.fehlertyp || ""}`;
  const erledigtAlt = new Map();
  if (alt) for (const e of alt.eintraege) if (alt.erledigt[e.id]) erledigtAlt.set(signatur(e), alt.erledigt[e.id]);
  delete MT.tage[heute];
  if (alt) MT.letzterBesuch = addTage(heute, -1);   // heute war man da – kein verpasster Tag
  const plan = tagesplanSichern(MT, E, T, { jetzt, tz, fremd });
  for (const e of plan.eintraege) if (erledigtAlt.has(signatur(e))) plan.erledigt[e.id] = erledigtAlt.get(signatur(e));
  if (alt && alt.verpasst !== undefined) plan.verpasst = alt.verpasst;
  if (alt) plan.neustart = alt.neustart;
  return plan;
}

/* Ein Eintrag ist geschafft: Erledigt-Vermerk, Zähler des Themas, Nachhol-Stapel. Verändert MT. */
export function eintragErledigt(MT, eintrag, { jetzt = Date.now(), tz, richtig = null, n = null, zurueck = false } = {}) {
  const heute = datumVon(jetzt, tz);
  const plan = MT.tage[heute];
  if (!plan) return false;
  const e = plan.eintraege.find((x) => x.id === eintrag.id) || eintrag;
  if (zurueck) { delete plan.erledigt[e.id]; MT.zuletzt = Date.now(); return true; }
  if (plan.erledigt[e.id]) return false;
  plan.erledigt[e.id] = { zeit: jetzt, ...(richtig !== null ? { richtig, n } : {}) };
  const t = MT.aktiv.find((x) => x.id === e.thema);
  if (t) {
    if (e.typ === "kern") t.kern += 1;
    if (e.typ === "basis" && t.vorbereitung[0] === e.kapitel) t.vorbereitung.shift();
    if (e.typ === "check") t.vorbereitung = [];
  }
  if (e.nachholId) MT.nachholen = MT.nachholen.filter((x) => x.id !== e.nachholId && !(x.thema === e.thema && x.typ === e.typ));
  MT.zuletzt = Date.now();
  return true;
}

/* Stand von heute für die Anzeige. Wiederholungen gelten auch als erledigt, wenn der Skill heute woanders geübt wurde. */
export function tagesStand(MT, E, { jetzt = Date.now(), tz } = {}) {
  const heute = datumVon(jetzt, tz);
  const plan = MT.tage[heute];
  const geuebt = (id) => Boolean(E && E.skills[id] && E.skills[id].review_history.some((h) => h.datum === heute));
  const eintraege = ((plan && plan.eintraege) || []).map((e) => {
    const er = plan.erledigt[e.id] || null;
    const skillHeute = e.typ === "wiederholung" && geuebt(e.skill_id);
    const S = e.typ === "wiederholung" && E ? E.skills[e.skill_id] : null;
    const letzte = S && skillHeute ? S.review_history.filter((h) => h.datum === heute).pop() : null;
    return { ...e, erledigt: Boolean(er) || skillHeute, ergebnis: letzte ? letzte.ergebnis : er && er.n ? (er.richtig === er.n ? "sicher" : er.richtig > 0 ? "teilweise" : "nicht") : null,
      naechster: S && skillHeute ? S.next_review_at : null, typName: TYPEN[e.typ].name, farbe: TYPEN[e.typ].farbe };
  });
  const erledigt = eintraege.filter((e) => e.erledigt).length;
  const offen = eintraege.filter((e) => !e.erledigt);
  return { heute, vorhanden: Boolean(plan), eintraege, erledigt, gesamt: eintraege.length, fertig: eintraege.length > 0 && erledigt === eintraege.length,
    minutenRest: offen.reduce((s, e) => s + e.min, 0), minuten: eintraege.reduce((s, e) => s + e.min, 0), neustart: Boolean(plan && plan.neustart), verpasst: plan ? plan.verpasst : 0,
    nachgeholt: eintraege.filter((e) => e.nachholenVon).length, offenNachholen: MT.nachholen.length };
}

/* Für den Wochenkalender: je Tag geplant/erledigt/nachgeholt */
export function tagInfo(MT, datum) {
  const t = MT.tage[datum];
  if (!t) return null;
  const erledigt = t.eintraege.filter((e) => t.erledigt[e.id]).length;
  return { geplant: t.eintraege.length, erledigt, nachgeholt: t.eintraege.filter((e) => e.nachholenVon && t.erledigt[e.id]).length, neustart: t.neustart, verpasst: t.eintraege.length > 0 && erledigt === 0 };
}

/* ---------- Mathilda: kurze Sätze ohne Vorwurf ---------- */
export function mathildaRueckkehr({ verpasst = 0, neustart = false, nachgeholt = 0, offen = 0, fertig = false, minuten = 0, erster = false }) {
  if (erster) return "Willkommen in deinem Training. Wähl unten ein Thema – ich plane ab morgen jeden Tag für dich.";
  if (neustart) return `${verpasst} Tage Pause. Kein Nachholen – heute ein kurzer Check je Thema, dann bauen wir deinen Plan neu auf.`;
  if (verpasst > 0) return `${verpasst === 1 ? "Ein Tag" : `${verpasst} Tage`} Pause. Heute: ${nachgeholt ? `${nachgeholt === 1 ? "eins" : nachgeholt} nachholen, dann weiter` : "einfach weiter"}.`;
  if (fertig) return "Tagesplan geschafft. Mehr ist heute nicht nötig.";
  if (offen === 0) return "Heute ist nichts fällig. Wenn du magst, übe unten freiwillig ein Thema.";
  return `Heute ${offen === 1 ? "ein Eintrag" : `${offen} Einträge`}, etwa ${minuten} Minuten. Fang oben an.`;
}

/* ---------- Vorschläge „Als Nächstes“ ---------- */
const kapitelZuGenerator = (gen) => {
  for (const k of Object.keys(KAPITEL)) if (unterthemen(k).some((u) => u.gen.includes(gen))) return k;
  return null;
};
export function vorschlaege(MT, E, { schulart = SCHULART_STANDARD, klasse = null, heute = datumVon(Date.now()), max = 3 } = {}) {
  const belegt = new Set([...MT.aktiv, ...MT.danach].map((t) => kapitelVon(t.id)));
  const fertig = new Set(MT.fertig.map((f) => kapitelVon(f.id)));
  const aus = [];
  const nimm = (k, art, grundText, mathilda) => {
    if (!KAPITEL[k] || belegt.has(k) || fertig.has(k) || aus.some((v) => v.id === k) || aus.length >= max) return false;
    aus.push({ id: k, art, titel: KAPITEL[k].titel, zeile: KAPITEL[k].zeile, grund: grundText, mathilda });
    return true;
  };
  const reihe = kapitelReihe(schulart);
  const sichere = MT.aktiv.filter((t) => themaStand(E, t.id, { teile: t.teile, heute }).sicher).map((t) => kapitelVon(t.id));
  const anker = [...[...MT.fertig].reverse().map((f) => kapitelVon(f.id)), ...sichere];
  /* a) Buchreihenfolge: nach einem sicheren oder fertigen Thema das nächste Kapitel */
  for (const k of anker) {
    const i = reihe.indexOf(k);
    for (let j = i + 1; i >= 0 && j < reihe.length; j++) {
      if (nimm(reihe[j], "buch", `Kommt im Buch nach „${KAPITEL[k].titel}“.`, `„${KAPITEL[k].titel}“ sitzt. Im Buch folgt „${KAPITEL[reihe[j]].titel}“ – der logische nächste Schritt.`)) break;
      if (belegt.has(reihe[j]) || fertig.has(reihe[j]) || aus.some((v) => v.id === reihe[j])) continue;
      break;
    }
  }
  /* b) Vorwissenslücke: Skills mit Schwierigkeiten, deren Kapitel nicht in Arbeit ist */
  for (const S of Object.values((E && E.skills) || {})) {
    if (!(S.last_result === "nicht" || S.last_result === "teilweise")) continue;
    const g = (SKILL_INFO[S.skill_id] || { gen: [] }).gen[0];
    const k = g && kapitelZuGenerator(g);
    if (k) nimm(k, "luecke", `Bei „${SKILL_INFO[S.skill_id].name}“ hakt es noch.`, `Bei „${SKILL_INFO[S.skill_id].name}“ hakt es noch. „${KAPITEL[k].titel}“ räumt diese Grundlage auf, bevor sie dich später bremst.`);
  }
  /* c) Baut darauf auf: Kapitel, deren Vorwissen ein sicheres/fertiges Thema ist */
  for (const k of anker) {
    for (const [kid, d] of Object.entries(KAPITEL_FORMELN)) {
      if (!d.vorwissen.some(([aus0]) => aus0 === k)) continue;
      nimm(kid, "baut-auf", `Baut auf „${KAPITEL[k].titel}“ auf.`, `„${KAPITEL[kid].titel}“ baut direkt auf „${KAPITEL[k].titel}“ auf – jetzt ist der beste Moment dafür.`);
    }
  }
  /* d) Ohne Anker: die Kapitel der eigenen Klasse */
  if (!aus.length && klasse) {
    const plan = PLAN[schulart] || PLAN.g9;
    for (const k of plan[klasse] || []) nimm(k, "klasse", `Steht in deinem Buch (Klasse ${klasse.replace("-", "/")}).`, `Für Klasse ${klasse.replace("-", "/")} steht „${KAPITEL[k].titel}“ in deinem Buch. Fang damit an.`);
  }
  return aus.slice(0, max);
}

/* ---------- Übersicht für „Stand“ ---------- */
export function standUebersicht(MT, E, { jetzt = Date.now(), tz } = {}) {
  const heute = datumVon(jetzt, tz);
  const skills = Object.values((E && E.skills) || {});
  const gelernt = skills.filter((S) => S.first_learned_at).length;
  const tageAktiv = new Set();
  for (const S of skills) for (const h of S.review_history) if (tageZwischen(h.datum, heute) < 30) tageAktiv.add(h.datum);
  for (const [d, t] of Object.entries(MT.tage)) if (tageZwischen(d, heute) < 30 && Object.keys(t.erledigt).length) tageAktiv.add(d);
  return { gelernt, aktiveTage: tageAktiv.size, fertig: MT.fertig.length, aktiv: MT.aktiv.length, sicher: MT.aktiv.filter((t) => themaStand(E, t.id, { teile: t.teile, heute }).sicher).length };
}

/* ---------- Testkonto: ein glaubwürdiger Lernstand, damit die Seite nicht leer ist ---------- */
export function testThemen(heute = datumVon(Date.now())) {
  const MT = leerMT();
  themaHinzufuegen(MT, { id: "quad", schulart: "g9", klasse: "9" }, addTage(heute, -6));
  themaHinzufuegen(MT, { id: "pythagoras.1", schulart: "g9", klasse: "9" }, addTage(heute, -3));
  themaHinzufuegen(MT, { id: "potenzen", schulart: "g9", klasse: "9" }, addTage(heute, -1));
  themaHinzufuegen(MT, { id: "strahlen", schulart: "g9", klasse: "9" }, heute);
  MT.aktiv[0].kern = 4; MT.aktiv[0].vorbereitung = [];
  MT.aktiv[1].kern = 1; MT.aktiv[1].vorbereitung = [];
  /* Vorgestern gab es einen Plan, der liegen blieb – daraus entsteht heute ein Nachhol-Eintrag */
  const vorgestern = Date.parse(`${addTage(heute, -2)}T12:00:00`);
  tagesplanSichern(MT, { skills: {}, tage: {}, arbeiten: [] }, null, { jetzt: vorgestern });
  const alt = MT.tage[addTage(heute, -2)];
  const kern = alt.eintraege.find((e) => e.typ === "kern" || e.typ === "basis");
  if (kern) alt.erledigt[kern.id] = { zeit: vorgestern + 3600000, richtig: 4, n: 5 };   // eins geschafft, der Rest blieb liegen
  MT.letzterBesuch = addTage(heute, -2);
  return MT;
}
