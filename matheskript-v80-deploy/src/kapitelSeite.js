/* ======================================================================
   KAPITELSEITE – reine Logik (kein React, kein Speicher).
   Setzt für ein Buchkapitel alles zusammen, was die Kapitelseite zeigt
   (funcKapitelSeite.jsx, Pfad /kapitel/<slug>):
     · Kontext: Schulart, Klasse, Nummer im Buch, Nachbarkapitel der Klasse
     · Text (kapitelSeiten.js), Unterthemen mit Stand (hauptthema.js)
     · Kernformeln (kapitelFormeln.js), Vorwissen, „Baut darauf auf“
     · Werkzeuge und Hilfen, passende Kurse
   Test: tests/kapitelSeite.test.mjs
   ====================================================================== */
import { THEMEN, PLAN, SCHULARTEN, KURS_EMPFEHLUNG, klassenBoxen, kapitelFuer, hilfenFuer, roemisch } from "./schulbuch.js";
import { KAPITEL_FORMELN, klasseVonKapitel } from "./kapitelFormeln.js";
import { KAPITEL_TEXT } from "./kapitelSeiten.js";
import { kapitelStand, vorwissenStand, standAusGeneratoren } from "./hauptthema.js";
import { kapitelGeneratoren } from "./unterthemen.js";
import { WERKZEUGE } from "./werkzeuge.js";
import { KAPITEL_SLUG } from "./kapitelPfade.js";

export { KAPITEL_SLUG, kapitelAusSlug, kapitelPfad } from "./kapitelPfade.js";

/* Navigationsziel für gehe() */
export const kapitelSeitenZiel = (kapitel, schulart, klasse) => ({ ansicht: "kapitel", kapitel, schulart, klasse });

/* ---------- Kontext: in welcher Klasse steht das Kapitel? ---------- */
/* Gewünschte Schulart/Klasse, sofern das Kapitel dort steht; sonst die Klasse, in der es im Plan der Schulart steht;
   sonst die erste Schulart, die es enthält (z. B. „Teilbarkeit“ nur in G8). */
export function kapitelKontext(kapitelId, schulartWunsch = "g9", boxWunsch = null) {
  if (!THEMEN[kapitelId]) return null;
  const versuche = [schulartWunsch, ...SCHULARTEN.map((s) => s.id)].filter((s, i, a) => PLAN[s] && a.indexOf(s) === i);
  for (const sa of versuche) {
    const plan = PLAN[sa];
    let box = boxWunsch && (plan[boxWunsch] || []).includes(kapitelId) ? boxWunsch : null;
    if (!box) { const k = klasseVonKapitel(sa, kapitelId); box = k ? k.box : null; }
    if (!box) continue;
    const b = klassenBoxen(sa).find((x) => x.id === box);
    const liste = kapitelFuer(sa, box);
    const i = liste.findIndex((x) => x.id === kapitelId);
    const s = SCHULARTEN.find((x) => x.id === sa);
    return {
      schulart: sa, schulartName: s ? s.name : sa.toUpperCase(), klasse: box, klasseLabel: b ? b.label : box,
      nr: roemisch(liste[i].nr), index: i,
      liste: liste.map((x) => ({ id: x.id, nr: roemisch(x.nr), titel: x.titel })),
      vorher: i > 0 ? liste[i - 1] : null, nachher: i + 1 < liste.length ? liste[i + 1] : null,
    };
  }
  return { schulart: schulartWunsch, schulartName: "", klasse: null, klasseLabel: "", nr: null, index: -1, liste: [], vorher: null, nachher: null };
}

/* ---------- Baut darauf auf: spätere Kapitel, die dieses als Vorwissen nennen ---------- */
export function bautDaraufAuf(kapitelId, schulart = "g9", max = 4) {
  const rang = (id) => { const k = klasseVonKapitel(schulart, id); return k ? k.rang : 99; };
  return Object.keys(KAPITEL_FORMELN)
    .filter((id) => id !== kapitelId && THEMEN[id] && KAPITEL_FORMELN[id].vorwissen.some(([aus]) => aus === kapitelId))
    .sort((a, b) => rang(a) - rang(b))
    .slice(0, max)
    .map((id) => ({ kapitel: id, titel: THEMEN[id].titel, klasse: klasseVonKapitel(schulart, id) }));
}

/* ---------- Passende Kurse ---------- */
export const kurseZumKapitel = (kapitelId) => KURS_EMPFEHLUNG.filter((k) => k.kapitel.includes(kapitelId)).map(({ id, name, zeile, ziel }) => ({ id, name, zeile, ziel }));

/* ---------- Alles zusammen ---------- */
/* E = normierter Ebbinghaus-Lernstand ({ skills }) oder null */
export function kapitelSeite(kapitelId, { schulart = "g9", klasse = null, E = null } = {}) {
  const t = THEMEN[kapitelId];
  if (!t) return null;
  const kontext = kapitelKontext(kapitelId, schulart, klasse);
  const sa = kontext.schulart;
  const text = KAPITEL_TEXT[kapitelId] || { einstieg: t.zeile, ziele: [] };
  const stand = kapitelStand(kapitelId, E);
  const teile = stand.teile.map((u) => {
    const wz = u.wz && WERKZEUGE[u.wz] ? { id: u.wz, name: WERKZEUGE[u.wz].name, ziel: WERKZEUGE[u.wz].ziel } : null;
    return { ...u, wz, ueben: u.gen.length > 0 };
  });
  const formeln = KAPITEL_FORMELN[kapitelId] || null;
  const mitAufgaben = teile.filter((u) => u.stand.art !== "ohne").length;
  return {
    id: kapitelId, slug: KAPITEL_SLUG[kapitelId], titel: t.titel, zeile: t.zeile,
    einstieg: text.einstieg, ziele: text.ziele,
    kontext,
    teile,
    zaehlung: { gesamt: teile.length, mitAufgaben, sicher: stand.sicher, geuebt: stand.geuebt, offen: stand.offen },
    gesamtStand: standAusGeneratoren(kapitelGeneratoren(kapitelId), E),
    weg: formeln && formeln.weg ? formeln.weg : null,
    kern: formeln ? formeln.kern.map(([titel, ids]) => ({ titel, ids })) : [],
    vorwissen: vorwissenStand(kapitelId, sa, E),
    danach: bautDaraufAuf(kapitelId, sa),
    hilfen: hilfenFuer(kapitelId),
    kurse: kurseZumKapitel(kapitelId),
    trainieren: { ansicht: "trainieren", kapitel: kapitelId, schulart: sa, klasse: kontext.klasse },
    formelnZiel: { ansicht: "kapitelformeln", kapitel: kapitelId, schulart: sa, klasse: kontext.klasse },
    klausurZiel: { ansicht: "kapitelformeln", kapitel: kapitelId, schulart: sa, klasse: kontext.klasse, modus: "klausur" },
  };
}
