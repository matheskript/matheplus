/* ============================================================
   Modul Unterstufe – Klasse 5 und 6 in einem Kurs.
   Führt unterstufeDaten5.js und unterstufeDaten6.js zusammen und liefert
   die Abfragen, die Kursseite, Kachel, Pfade und Tests brauchen.
   Reine Daten, keine React-Importe (Node-testbar).

   Pfade:  /unterstufe · /unterstufe/klasse-5 · /unterstufe/klasse-6 ·
           /unterstufe/<einheit-id>   (pfade.js kennt alle Ids über UNTERSTUFE_SEITEN)
   Speicher (localStorage mm_unterstufe, siehe kursStand.js):
           { gelesen: {[id]: true}, haken: {[id]: [bool, bool, bool]}, zuletzt: id }
   Eine Lerneinheit ist geschafft, wenn alle drei „Ich kann …“-Haken sitzen.
   ============================================================ */
import { KLASSE5 } from "./unterstufeDaten5.js";
import { KLASSE6 } from "./unterstufeDaten6.js";

export const UNTERSTUFE_KLASSEN = [KLASSE5, KLASSE6];

export const UNTERSTUFE_INFO = {
  titel: "Unterstufe",
  zeile: "Klasse 5 und 6 – der ganze Stoff, Kapitel für Kapitel: lesen, Beispiel, Merksatz, dann gleich üben.",
  kurz: "Klasse 5 und 6",
};

/* Flache Liste aller Lerneinheiten mit Klasse und Kapitel */
export const UNTERSTUFE_EINHEITEN = UNTERSTUFE_KLASSEN.flatMap((k) =>
  k.kapitel.flatMap((kap) => kap.einheiten.map((e, i) => ({ ...e, klasse: k.id, kapitel: kap.id, kapitelTitel: kap.titel, marke: kap.marke, nr: i + 1, anzahl: kap.einheiten.length }))));

const NACH_ID = new Map(UNTERSTUFE_EINHEITEN.map((e) => [e.id, e]));

export const einheitVon = (id) => NACH_ID.get(id) || null;
export const klasseVon = (id) => UNTERSTUFE_KLASSEN.find((k) => k.id === String(id)) || null;
export const kapitelVon = (id) => UNTERSTUFE_KLASSEN.flatMap((k) => k.kapitel).find((kap) => kap.id === id) || null;

/* Nachbarn in der Gesamtfolge (Klasse 5 → Klasse 6) */
export function naechsteEinheit(id) {
  const i = UNTERSTUFE_EINHEITEN.findIndex((e) => e.id === id);
  return i >= 0 && i + 1 < UNTERSTUFE_EINHEITEN.length ? UNTERSTUFE_EINHEITEN[i + 1] : null;
}
export function vorigeEinheit(id) {
  const i = UNTERSTUFE_EINHEITEN.findIndex((e) => e.id === id);
  return i > 0 ? UNTERSTUFE_EINHEITEN[i - 1] : null;
}

/* Seiten des Moduls für pfade.js: die Klassenseiten und jede Lerneinheit */
export const UNTERSTUFE_SEITEN = [
  ...UNTERSTUFE_KLASSEN.map((k) => `klasse-${k.id}`),
  ...UNTERSTUFE_EINHEITEN.map((e) => e.id),
];
export const istUnterstufeSeite = (s) => UNTERSTUFE_SEITEN.includes(s);

/* Zahlen für Kachel und Kopf */
export const UNTERSTUFE_ZAHLEN = {
  einheiten: UNTERSTUFE_EINHEITEN.length,
  kapitel: UNTERSTUFE_KLASSEN.reduce((s, k) => s + k.kapitel.length, 0),
  jeKlasse: Object.fromEntries(UNTERSTUFE_KLASSEN.map((k) => [k.id, k.kapitel.reduce((s, kap) => s + kap.einheiten.length, 0)])),
};

/* Geschafft = alle „Ich kann …“-Haken gesetzt (haken[id] = [bool, bool, bool]) */
export const einheitGeschafft = (e, stand) => {
  const h = (stand && stand.haken && stand.haken[e.id]) || [];
  return e.kann.length > 0 && e.kann.every((_, i) => !!h[i]);
};

/* Stand je Klasse und gesamt; weiter = Lerneinheit, mit der es weitergeht (zuletzt geöffnete, sonst erste offene) */
export function unterstufeStand(stand) {
  const s = stand || {};
  const jeKlasse = {};
  for (const k of UNTERSTUFE_KLASSEN) {
    const liste = UNTERSTUFE_EINHEITEN.filter((e) => e.klasse === k.id);
    jeKlasse[k.id] = { fertig: liste.filter((e) => einheitGeschafft(e, s)).length, gesamt: liste.length };
  }
  const fertig = UNTERSTUFE_EINHEITEN.filter((e) => einheitGeschafft(e, s)).length;
  const zuletzt = s.zuletzt ? einheitVon(s.zuletzt) : null;
  const weiter = (zuletzt && !einheitGeschafft(zuletzt, s) ? zuletzt : null)
    || UNTERSTUFE_EINHEITEN.find((e) => !einheitGeschafft(e, s))
    || UNTERSTUFE_EINHEITEN[0];
  return { fertig, gesamt: UNTERSTUFE_EINHEITEN.length, jeKlasse, weiter };
}

/* Welche Kopfrechen-Trainer das Modul einbettet (Ids aus TRAINER, func14.jsx) */
export const KOPF_TRAINER_IDS = ["plusminus", "multiplizieren", "potenzen", "primzahlen", "primfaktoren", "division", "bruchrechnen"];
