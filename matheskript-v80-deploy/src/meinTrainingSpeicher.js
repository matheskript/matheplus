/* ======================================================================
   meinTrainingSpeicher.js – Zugriff auf den Zustand von „Mein Mathe-Training“ im Lernstand
   (training.meinTraining, neben training.ebbinghaus). Kleine Datei ohne Oberfläche, damit Startseite und
   Quickfinder Themen übernehmen können, ohne die ganze Seite zu laden. Keine base-Datei darf sie importieren.
   ====================================================================== */
import { useMemo } from "react";
import { lernAendern, useLern } from "./func6.jsx";
import { normiere } from "./trainingDaten.js";
import { arbeitNeu, datumVon, istDatum, normiereEbb } from "./ebbinghaus.js";
import { auswahlNachKapitel } from "./trainingsplan.js";
import { normiereMT, tagesplanNeu, themaHinzufuegen, themaBereich } from "./meinTraining.js";

/* fn(MT, E, T) darf alle drei verändern; danach wird alles zurückgeschrieben und gesichert (lokal + Konto). */
export function mtAendern(fn) {
  lernAendern((L) => {
    L.training = normiere(L.training);
    const E = normiereEbb(L.training.ebbinghaus);
    const MT = normiereMT(L.training.meinTraining);
    fn(MT, E, L.training);
    MT.zuletzt = Date.now();
    L.training.ebbinghaus = E;
    L.training.meinTraining = MT;
  });
}
export function useMT() {
  const L = useLern();
  const roh = L.training && L.training.meinTraining;
  return useMemo(() => normiereMT(roh), [roh]);
}

/* Aus einer Unterthemen-Auswahl (Quickfinder, Hauptthema) Themen übernehmen – je Kapitel ein Thema mit genau den angehakten
   Unterthemen; optional eine Klassenarbeit (Datum) dazu. Liefert { aufgenommen: [ids], uebrig: [ids], arbeit } */
export function themenUebernehmen({ teile = [], kapitel = null, schulart = "g9", klasse = null, termin = null, art = "Klassenarbeit", ohne = [] } = {}) {
  let aus = { aufgenommen: [], uebrig: [], arbeit: null };
  mtAendern((MT, E, T) => {
    const heute = datumVon(Date.now());
    const gruppen = teile.length ? auswahlNachKapitel(teile, schulart) : kapitel ? [{ kapitel, teile: [], ganz: true }] : [];
    for (const g of gruppen) {
      const id = g.teile.length === 1 && !g.ganz ? g.teile[0].id : g.kapitel;
      const r = themaHinzufuegen(MT, { id, teile: g.ganz || g.teile.length <= 1 ? null : g.teile.map((x) => x.id), schulart, klasse }, heute);
      (r.ok ? aus.aufgenommen : aus.uebrig).push(id);
      if (r.ok && ohne.length) for (const t of [...MT.aktiv, ...MT.danach]) if (t.id === id) t.vorbereitung = t.vorbereitung.filter((k) => !ohne.includes(k));
    }
    if (termin && istDatum(termin) && termin >= heute && gruppen.length) {
      const bereiche = [...new Set(gruppen.map((g) => themaBereich(g.kapitel)).filter(Boolean))];
      if (!(E.arbeiten || []).some((a) => !a.geloescht && a.datum === termin)) aus.arbeit = arbeitNeu(E, { art, datum: termin, themen: bereiche, notiz: "" }, Date.now());
    }
    if (aus.aufgenommen.length) tagesplanNeu(MT, E, T, { jetzt: Date.now() });
  });
  return aus;
}
