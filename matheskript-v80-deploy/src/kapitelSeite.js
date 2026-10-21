/* ======================================================================
   KAPITELSEITE – Übersicht zu einem Schulbuchkapitel (Ansicht „kapitel“, Pfad /kapitel/<id>)
   Eine Grundseite für alle Kapitel aus schulbuch.js (THEMEN): Kopf mit römischer Nummer,
   was im Kapitel steckt (Unterthemen mit Üben und passendem Werkzeug), alle Werkzeuge
   und Hilfen, unsere Kurse dazu, vorheriges und nächstes Kapitel der Klasse.
   Aufruf: ☰-Menü → Dein Schulbuch → Kapitel aufklappen → „Kapitelseite“.
   Reine Daten und Logik, keine React-Importe. Test: tests/kapitelSeite.test.mjs
   ====================================================================== */
import { THEMEN, PLAN, KURS_EMPFEHLUNG, SCHULART_STANDARD, hilfenFuer, kapitelFuer, klassenBoxen, roemisch, schulart as schulartVon } from "./schulbuch.js";
import { unterthemen } from "./unterthemen.js";
import { WERKZEUGE } from "./werkzeuge.js";

export const istKapitel = (id) => typeof id === "string" && Object.prototype.hasOwnProperty.call(THEMEN, id);

/* Klassenbox, in der das Kapitel bei dieser Schulart steht (bevorzugt die übergebene) */
export function boxFuerKapitel(kapitelId, schulartId, wunschBox) {
  const plan = PLAN[schulartId] || PLAN[SCHULART_STANDARD];
  if (wunschBox && (plan[wunschBox] || []).includes(kapitelId)) return String(wunschBox);
  for (const [box, ids] of Object.entries(plan)) if (ids.includes(kapitelId)) return box;
  return null;
}

/* Werkzeug als kleine Karte (Zeichen, Name, Zeile, Ziel, Etikett) */
function werkzeugKarte(id) {
  const wz = WERKZEUGE[id];
  return wz ? { id, name: wz.name, zeile: wz.zeile, zeichen: wz.zeichen || "∑", ziel: wz.ziel, etikett: wz.etikett || null } : null;
}

/* Alles, was die Kapitelseite zeigt – oder null, wenn es das Kapitel nicht gibt */
export function kapitelUebersicht(kapitelId, schulartId, wunschBox) {
  if (!istKapitel(kapitelId)) return null;
  const sa = PLAN[schulartId] ? schulartId : SCHULART_STANDARD;
  const t = THEMEN[kapitelId];
  const boxId = boxFuerKapitel(kapitelId, sa, wunschBox);
  const box = boxId ? klassenBoxen(sa).find((b) => b.id === boxId) : null;
  const liste = boxId ? kapitelFuer(sa, boxId) : [];
  const i = liste.findIndex((k) => k.id === kapitelId);
  const nachbar = (k) => (k ? { id: k.id, nr: roemisch(k.nr), titel: k.titel } : null);

  const hilfen = hilfenFuer(kapitelId);
  const werkzeuge = hilfen.filter((h) => h.art === "werkzeug").map((h) => werkzeugKarte(h.id)).filter(Boolean);
  const seiten = hilfen.filter((h) => h.art === "seite");

  const teile = unterthemen(kapitelId).map((u) => ({
    id: u.id, nr: u.nr, titel: u.titel,
    ueben: u.gen.length > 0,
    werkzeug: u.wz ? werkzeugKarte(u.wz) : null,
  }));

  const kurse = KURS_EMPFEHLUNG.filter((k) => k.kapitel.includes(kapitelId)).map(({ id, name, zeile, ziel }) => ({ id, name, zeile, ziel }));

  return {
    id: kapitelId, titel: t.titel, zeile: t.zeile,
    nr: i >= 0 ? roemisch(liste[i].nr) : null,
    schulart: sa, schulartName: (schulartVon(sa) || {}).name || "G9",
    box: boxId, klasseLabel: box ? box.label : null,
    kursstufe: !!(box && box.gold), unterstufe: !!(box && box.klassen[0] <= 6),
    anzahlKapitel: liste.length,
    vor: i > 0 ? nachbar(liste[i - 1]) : null,
    nach: i >= 0 && i < liste.length - 1 ? nachbar(liste[i + 1]) : null,
    teile, werkzeuge, seiten, kurse,
    uebbar: teile.filter((x) => x.ueben).length,
    trainieren: { ansicht: "trainieren", kapitel: kapitelId, schulart: sa, klasse: boxId || undefined },
    formeln: { ansicht: "kapitelformeln", kapitel: kapitelId, schulart: sa, klasse: boxId || undefined },
  };
}

/* Ziel für gehe(), um die Kapitelseite zu öffnen */
export const kapitelSeitenZiel = (kapitelId, schulartId, box) => ({ ansicht: "kapitel", kapitel: kapitelId, schulart: schulartId, klasse: box });
