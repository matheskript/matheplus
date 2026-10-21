/* ======================================================================
   tagesplan.js – DIE Tagesplan-Logik der App (seit 21.10.2026), für Gast und Konto gleich.
   Reine Logik: kein React, kein Speicher. Die Oberflächen (Heute-Karte auf der Startseite, Seite „Mein
   Mathe-Training“) zeigen denselben Plan aus demselben Lernstand (training.meinTraining + training.ebbinghaus,
   lokal und mit Konto abgeglichen).

   Vorher gab es zwei Antworten auf „Was mache ich heute?“: die Heute-Karte rechnete aus Werkzeug-Einheiten und
   dem Protokoll, Mein Mathe-Training aus Themen, Ebbinghaus-Wiederholungen und Budget. Jetzt:

   1 · Themen sicherstellen (themenSicherstellen)
       Hat der Schüler keine Themen gewählt, bekommt er bis zu zwei Kapitel seiner Klasse aus seinem Bereich
       (Onboarding/Quickfinder) als Vorschlag (auto: true, ohne Basis-Checks). Wählt er selbst ein Thema, fallen die
       Vorschläge weg; entfernt er einen Vorschlag, kommt er erst zurück, wenn Klasse oder Bereich wechseln.
   2 · Aufnahme in den Tag (meinTraining.tagesplanSichern – Regeln vom 20.10. unverändert)
       Aufträge → fällige Wiederholungen → Fehler üben → Nachholen (Deckel 50 %) → ein Schritt je Thema →
       Aufs Blatt (nie verdrängt) → Warm-up bei Platz. Budget 8 Einträge oder 10/20/30 Minuten, Neustart ab 7 Tagen.
   3 · Reihenfolge am Tag (tagesReihenfolge) – getrennt von der Aufnahme:
       Warm-up → Aufträge → Wiederholen → Fehler → Neustart-Check/Basis → Kerntraining → Aufs Blatt.
       (Warm-up wurde bisher als Letztes aufgenommen und stand deshalb am Ende – ein Warm-up am Ende ist sinnlos.)
   4 · Konkret statt Kapitelname (anreichern): Ein Kerntraining mit Werkzeug heißt „Produktregel trainieren“, nicht
       „Ableitungsregeln“ – die Einheitenwahl aus heuteFokus.js (heute angefangen → schwach → neu → am längsten her)
       ist Teil des Plans.
   5 · Erledigt einheitlich: Haken im Plan ODER heutige Buchungen im Protokoll (Werkzeug-Einheit voll, Fehlertraining,
       Warm-up, Blatt-Foto an Mathilda). Wiederholungen gelten, sobald der Skill heute geübt wurde (Ebbinghaus).

   Test: tests/tagesplan.test.mjs. Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { PLAN, SCHULART_STANDARD, THEMEN as KAPITEL, klassenBoxen } from "./schulbuch.js";
import { kapitelGeneratoren, unterthema } from "./unterthemen.js";
import { THEMEN as TRAINING, FEHLERTYPEN, GENERATOREN, normiere } from "./trainingDaten.js";
import { WERKZEUGE } from "./werkzeuge.js";
import { SKILL_INFO, datumVon } from "./ebbinghaus.js";
import { TYPEN, tagesStand, tagesplanNeu, tagesplanSichern, themaBereich, themaHinzufuegen, themaInfo } from "./meinTraining.js";
import { einheitWahl, einheitenVon, erledigtHeute, fehlerFokus, heuteAnteil, tagNr } from "./heuteFokus.js";

/* ---------- 1 · Themen sicherstellen ---------- */
/* Bereich des Onboardings/Quickfinders (werkzeuge.BEREICHE-Id) → Trainingsthemen (trainingDaten.THEMEN), in Vorzugsreihenfolge */
export const BEREICH_THEMEN = {
  analysis: ["ableiten", "kurven", "integrale", "sinus", "wachstum", "funktionen"],
  vektoren: ["vektoren"],
  stochastik: ["bernoulli", "wkt", "normal"],
  geometrie: ["geometrie", "dreieckgeo", "kreiskoerper"],
  gleichungen: ["gleichungen", "terme", "lgs", "funktionen", "potenzen"],
  bruchrechnen: ["brueche"],
  prozent: ["prozent", "funktionen"],
  zahlen: ["potenzen", "brueche"],
  daten: ["wkt"],
  fundament: [],
};
export const AUTO_MAX = 2;

/* Kapitel der Klasse, die sich trainieren lassen (Aufgaben oder Werkzeug), zuerst die aus dem Bereich – in Buchreihenfolge.
   Hat die eigene Klasse nichts aus dem Bereich (Klasse 12 ohne Stochastik), zählen die Nachbarklassen. */
export function autoThemen({ schulart = SCHULART_STANDARD, klasse = null, thema = null } = {}) {
  const plan = PLAN[schulart] || PLAN[SCHULART_STANDARD];
  const trainierbarIn = (box) => ((box && plan[box]) || []).filter((k) => KAPITEL[k] && (kapitelGeneratoren(k).length || (themaInfo(k) || {}).wz));
  const kapitel = (klasse && plan[klasse]) || [];
  const trainierbar = trainierbarIn(klasse);
  const wunsch = BEREICH_THEMEN[thema] || [];
  const imBereich = (liste) => liste.filter((k) => wunsch.includes(themaBereich(k)));
  let passend = imBereich(trainierbar);
  if (!passend.length && wunsch.length) {
    const boxen = klassenBoxen(schulart).map((b) => b.id), i = boxen.indexOf(klasse);
    for (const nachbar of [boxen[i - 1], boxen[i + 1]]) if (!passend.length && nachbar) passend = imBereich(trainierbarIn(nachbar));
  }
  passend.sort((a, b) => wunsch.indexOf(themaBereich(a)) - wunsch.indexOf(themaBereich(b)) || kapitel.indexOf(a) - kapitel.indexOf(b));
  /* verschiedene Werkzeuge, sonst stünde zweimal „Polynome ableiten“ im Plan */
  const aus = [], wz = new Set();
  for (const k of [...passend, ...trainierbar.filter((k) => !passend.includes(k))]) {
    const w = (themaInfo(k) || {}).wz || `gen:${k}`;
    if (wz.has(w)) continue;
    wz.add(w); aus.push(k);
    if (aus.length >= AUTO_MAX) break;
  }
  return aus;
}

export const autoSchluessel = ({ schulart = SCHULART_STANDARD, klasse = null, thema = null } = {}) => `${schulart}|${klasse || ""}|${thema || ""}`;
const istAuto = (t) => t.auto === true;

/* Verändert MT. Liefert true, wenn sich etwas geändert hat. */
export function themenSicherstellen(MT, profil = {}, heute = datumVon(Date.now())) {
  const manuell = [...MT.aktiv, ...MT.danach].some((t) => !istAuto(t));
  const autoDa = [...MT.aktiv, ...MT.danach].some(istAuto);
  if (manuell) {
    if (!autoDa) return false;
    MT.aktiv = MT.aktiv.filter((t) => !istAuto(t));
    MT.danach = MT.danach.filter((t) => !istAuto(t));
    MT.nachholen = MT.nachholen.filter((e) => [...MT.aktiv, ...MT.danach].some((t) => t.id === e.thema));
    return true;
  }
  if (!profil.klasse) return false;
  const schluessel = autoSchluessel(profil);
  if (MT.auto && MT.auto.schluessel === schluessel && (MT.auto.aus || autoDa)) return false;
  const ids = autoThemen(profil);
  if (!ids.length) return false;
  if (ids.every((id) => MT.aktiv.some((t) => t.id === id && istAuto(t)))) { MT.auto = { schluessel, aus: false }; return false; }
  MT.aktiv = MT.aktiv.filter((t) => !istAuto(t));
  MT.danach = MT.danach.filter((t) => !istAuto(t));
  MT.nachholen = MT.nachholen.filter((e) => MT.aktiv.some((t) => t.id === e.thema));
  for (const id of ids) themaHinzufuegen(MT, { id, schulart: profil.schulart || SCHULART_STANDARD, klasse: profil.klasse, auto: true }, heute);
  MT.auto = { schluessel, aus: false };
  return true;
}

/* Ein aktives Thema, das im Plan von heute noch nicht vorkommt (gerade erst aufgenommen)? Dann wird der Tag neu gebaut, Erledigtes bleibt. */
const MAX_EINTRAEGE_NEU = 12;
function neuesThema(MT, heute) {
  const plan = MT.tage[heute];
  if (!plan || plan.eintraege.length >= MAX_EINTRAEGE_NEU) return false;
  const im = new Set(plan.eintraege.map((e) => e.thema).filter(Boolean));
  return MT.aktiv.some((t) => !im.has(t.id) && !MT.nachholen.some((n) => n.thema === t.id));
}

/* ---------- 2 · Plan für heute (Themen sicherstellen + Tagesplan sichern) – verändert MT und E ---------- */
export function planSichern(MT, E, T, { profil = {}, jetzt = Date.now(), tz, fremd = [] } = {}) {
  const heute = datumVon(jetzt, tz);
  const geaendert = themenSicherstellen(MT, profil, heute);
  if (geaendert && MT.tage[heute]) delete MT.tage[heute];   // Themen neu → Plan von heute neu (Erledigtes hängt an Einträgen, die es so nicht mehr gibt)
  if (MT.tage[heute] && neuesThema(MT, heute)) return tagesplanNeu(MT, E, T, { jetzt, tz, fremd });
  return tagesplanSichern(MT, E, T, { jetzt, tz, fremd });
}
/* Muss gespeichert werden? (die Oberfläche fragt das, bevor sie den Lernstand anfasst) */
export function planFehlt(MT, { profil = {}, jetzt = Date.now(), tz, fremd = [] } = {}) {
  const heute = datumVon(jetzt, tz);
  const plan = MT.tage[heute];
  if (!plan) return true;
  const manuell = [...MT.aktiv, ...MT.danach].some((t) => !istAuto(t));
  const autoDa = [...MT.aktiv, ...MT.danach].some(istAuto);
  if (manuell && autoDa) return true;
  if (!manuell && profil.klasse && !(MT.auto && MT.auto.schluessel === autoSchluessel(profil) && (MT.auto.aus || autoDa)) && autoThemen(profil).length) return true;
  if (neuesThema(MT, heute)) return true;
  const da = new Set(plan.eintraege.filter((e) => e.typ === "fremd").map((e) => e.auftrag));
  return fremd.some((f) => f && !f.erledigt && f.titel && !da.has(f.id));
}

/* ---------- 3 · Reihenfolge am Tag ---------- */
export const REIHENFOLGE = ["warmup", "fremd", "wiederholung", "fehler", "check", "basis", "kern", "blatt"];
export function tagesReihenfolge(eintraege) {
  const rang = (e) => { const i = REIHENFOLGE.indexOf(e.typ); return i < 0 ? REIHENFOLGE.length : i; };
  return eintraege.map((e, i) => ({ e, i })).sort((a, b) => rang(a.e) - rang(b.e) || a.i - b.i).map((x) => x.e);
}

/* ---------- 4 + 5 · Anreichern: konkrete Einheit, Motiv, Start-Ziel, Grund, erledigt ---------- */
const heuteProtokoll = (protokoll, jetzt) => { const h = tagNr(jetzt); return (protokoll || []).filter((e) => e && typeof e.richtig === "boolean" && e.zeit && tagNr(e.zeit) === h); };
const kurzVon = (t) => String(t || "").replace(/\s*\(.*\)\s*/, "").split(/[:·–]/)[0].trim().slice(0, 24);
const generatorThema = (gen) => { const g = GENERATOREN.find((x) => x.id === gen); return g && TRAINING[g.thema] ? g.thema : null; };
const themaWerkzeug = (thema) => { const t = thema && TRAINING[thema]; const w = t && t.tools && t.tools[0]; return w ? { ansicht: w.ansicht, ...(w.trainer ? { trainer: w.trainer } : {}), ...(w.bereich ? { bereich: w.bereich } : {}) } : null; };
/* Werkzeug eines Eintrags: eigenes wz, sonst das erste Werkzeug des Trainingsthemas seiner Generatoren */
function werkzeugFuer(e) {
  if (e.wz && WERKZEUGE[e.wz]) return { id: e.wz, ziel: WERKZEUGE[e.wz].ziel };
  const gen = (e.gen || [])[0];
  const ziel = themaWerkzeug(gen ? generatorThema(gen) : e.thema ? themaBereich(e.thema) : null);
  if (!ziel) return null;
  const id = Object.keys(WERKZEUGE).find((k) => WERKZEUGE[k].ziel && WERKZEUGE[k].ziel.ansicht === ziel.ansicht) || null;
  return { id, ziel };
}
/* Kleine Überschrift über dem Auftrag: Thema des Kerntrainings bzw. Art des Eintrags */
function kickerVon(e) {
  const info = e.thema ? themaInfo(e.thema) : null;
  const art = e.typ === "basis" ? "Basis-Check" : e.typ === "check" ? "Neustart-Check" : e.nachholenVon ? "Nachholen" : null;
  const thema = info ? (info.art === "unterthema" ? info.kapitelTitel : info.titel) : "";
  return [art, thema].filter(Boolean).join(" · ") || TYPEN[e.typ].name;
}
const BLATT = { id: "blatt", titel: "Aufs Blatt: eine Aufgabe von Hand", kurz: "Aufs Blatt", inhalt: ["eine Aufgabe auf Papier", "Foto an Mathilda", "Rechenweg prüfen lassen"], aufgaben: 1, min: TYPEN.blatt.min };
const WARMUP = { id: "warmup", titel: "5 Minuten Mathe", kurz: "Warm-up", inhalt: ["fünf kurze Aufgaben", "Kopf anschalten", "ohne Taschenrechner"], aufgaben: 5, min: TYPEN.warmup.min };

export function anreichern(MT, E, T, { protokoll = [], jetzt = Date.now(), tz, kapitel = null } = {}) {
  const stand = tagesStand(MT, E, { jetzt, tz });
  const P = heuteProtokoll(protokoll, jetzt);
  const Tn = normiere(T || {});
  const belegt = {};                                     // je Werkzeug die heute schon vergebenen Einheiten
  const eintraege = stand.eintraege.map((e) => {
    const basis = { ...e, key: e.id, typ: e.typ, erledigt: !!e.erledigt, anteil: e.erledigt ? 1 : 0, grund: e.typ, motiv: e.typ, ziel: e.ziel || null, art: null, kapitel: null, fehlertyp: e.fehlertyp || null };
    if (e.typ === "kern" || e.typ === "basis" || e.typ === "check") {
      const w = werkzeugFuer(e);
      if (w && w.id && einheitenVon(w.id).length && e.typ === "kern") {
        const wahl = einheitWahl(w.id, { protokoll, jetzt, kapitel, ohne: belegt[w.id] || [] });
        (belegt[w.id] = belegt[w.id] || []).push(wahl.einheit.id);
        const erl = basis.erledigt || erledigtHeute(wahl);
        return { ...basis, titel: wahl.einheit.titel, einheit: wahl.einheit, wahl, werkzeug: w.id, motiv: w.id, grund: e.nachholenVon ? "nachholen" : wahl.grund, ziel: w.ziel, art: wahl.einheit.art || null, kapitel: wahl.einheit.kapitel || null,
          kicker: kickerVon(e), erledigt: erl, anteil: erl ? 1 : heuteAnteil(wahl) || 0, heuteN: (wahl.stand || wahl.werkzeug).heute };
      }
      const u = e.teil ? unterthema(e.teil) : null;
      const einheit = { id: `${e.typ}-${e.id}`, titel: e.titel, kurz: kurzVon(u ? u.titel : e.titel), inhalt: [e.zeile].filter(Boolean), aufgaben: e.anzahl || 0, min: e.min };
      return { ...basis, einheit, werkzeug: w ? w.id : null, motiv: w && w.id ? w.id : e.typ, grund: e.nachholenVon ? "nachholen" : e.typ === "kern" ? (e.zeile && /Runde/.test(e.zeile) ? "dran" : "neu") : e.typ, ziel: w ? w.ziel : null, kicker: kickerVon(e) };
    }
    if (e.typ === "wiederholung") {
      const info = SKILL_INFO[e.skill_id] || { name: e.titel, gen: [] };
      const ziel = themaWerkzeug(generatorThema(info.gen[0]));
      return { ...basis, einheit: { id: `w-${e.skill_id}`, titel: `Wiederholen: ${info.name}`, kurz: kurzVon(info.name), inhalt: [e.zeile].filter(Boolean), aufgaben: 1, min: e.min }, motiv: "wiederholung", grund: "wiederholung", ziel, skill: e.skill_id, kicker: "Wiederholen" };
    }
    if (e.typ === "fehler") {
      const f = fehlerFokus(Tn, null, { protokoll, jetzt });
      const id = e.fehlertyp && FEHLERTYPEN[e.fehlertyp] ? e.fehlertyp : f.id;
      const typ = FEHLERTYPEN[id];
      const einheit = { ...f.einheit, id: `fehler-${id}`, titel: typ.name, kurz: kurzVon(typ.name), inhalt: [typ.kurz], tipp: typ.tipp, min: e.min };
      const erl = basis.erledigt || f.stand.heute >= einheit.aufgaben;
      return { ...basis, einheit, fehler: f, motiv: "fehler", grund: f.grund === "vorsorge" ? "fehler" : f.grund, ziel: { ansicht: "fehlertraining" }, fehlertyp: id, erledigt: erl, anteil: erl ? 1 : Math.min(1, f.stand.heute / einheit.aufgaben), heuteN: f.stand.heute, kicker: "Meine Fehler üben" };
    }
    if (e.typ === "fremd") return { ...basis, einheit: { id: `auftrag-${e.auftrag}`, titel: e.titel, kurz: "Auftrag", inhalt: [e.zeile, e.absender ? `von ${e.absender}` : ""].filter(Boolean), aufgaben: 0, min: e.min }, motiv: "auftrag", grund: "auftrag", kicker: e.absender ? `Auftrag von ${e.absender}` : "Auftrag" };
    if (e.typ === "blatt") {
      const erl = basis.erledigt || P.some((x) => x.bereich === "analyse");
      return { ...basis, einheit: { ...BLATT, min: e.min }, motiv: "blatt", grund: "blatt", ziel: e.ziel || { ansicht: "analyse", foto: "blatt" }, erledigt: erl, anteil: erl ? 1 : 0, kicker: "Pen & Paper" };
    }
    if (e.typ === "warmup") {
      const n = P.filter((x) => x.bereich === "warmup").length;
      const erl = basis.erledigt || n >= WARMUP.aufgaben;
      return { ...basis, einheit: { ...WARMUP, min: e.min }, motiv: "warmup", grund: "warmup", ziel: e.ziel || { ansicht: "warmup" }, erledigt: erl, anteil: erl ? 1 : Math.min(1, n / WARMUP.aufgaben), heuteN: n, kicker: "Warm-up" };
    }
    return { ...basis, einheit: { id: e.id, titel: e.titel, kurz: kurzVon(e.titel), inhalt: [e.zeile].filter(Boolean), aufgaben: e.anzahl || 0, min: e.min }, kicker: TYPEN[e.typ] ? TYPEN[e.typ].name : "" };
  });
  /* Summen neu – Erledigt kommt jetzt auch aus dem Protokoll, nicht nur aus dem Haken */
  const sortiert = tagesReihenfolge(eintraege);
  const erledigt = sortiert.filter((e) => e.erledigt).length;
  return { ...stand, eintraege: sortiert, erledigt, gesamt: sortiert.length, fertig: sortiert.length > 0 && erledigt === sortiert.length,
    minutenRest: sortiert.filter((e) => !e.erledigt).reduce((s, e) => s + e.min, 0), nachgeholt: sortiert.filter((e) => e.nachholenVon).length };
}

/* Kopfzeile: Umfang als Ansage („4 Runden · 32 Min“, „Noch 3 Runden · 20 Min“, „Für heute geschafft“) */
export function kopfText(eintraege) {
  const offen = eintraege.filter((x) => !x.erledigt);
  const runden = (n) => `${n} ${n === 1 ? "Runde" : "Runden"}`;
  const min = eintraege.reduce((s, x) => s + (x.einheit ? x.einheit.min : 0), 0);
  if (!eintraege.length) return { haupt: "Heute ist nichts geplant", zeit: null };
  if (!offen.length) return { haupt: "Für heute geschafft", zeit: null };
  if (offen.length === eintraege.length) return { haupt: runden(eintraege.length), zeit: `${min} Min` };
  const rest = offen.reduce((s, x) => s + Math.max(1, Math.round(x.einheit.min * (1 - (x.anteil || 0)))), 0);
  return { haupt: `Noch ${runden(offen.length)}`, zeit: `${rest} Min` };
}

/* Was passiert beim Start eines Eintrags: Ziel für gehe(), Aufgabentyp fürs Werkzeug, Lernweg-Kapitel, Fehlertyp */
export function startVon(e) {
  if (!e) return null;
  return { ziel: e.ziel || null, art: e.art || null, kapitel: e.kapitel || null, fehlertyp: e.typ === "fehler" ? e.fehlertyp : null, aufgaben: (e.gen || []).length > 0 };
}
