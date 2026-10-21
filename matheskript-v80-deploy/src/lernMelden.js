/* ======================================================================
   Meldungen an den Lernstand (aus func7/func8 ausgelagert, 21.10.2026): Aktivität je Tag, Prüfungsbefund.
   Eigene kleine Datei, damit merken.js und func9 nicht func7/func8 (Operatoren, Probeabitur,
   Messbericht …) in den Startchunk ziehen.
   ====================================================================== */
import { KOMP, LERN, tagSchluessel } from "./base3.jsx";
import { lernAendern } from "./func6.jsx";
import { FR } from "./funcRegistry.jsx";

export function tagVon(offset) { const d = new Date(); d.setDate(d.getDate() + offset); return d; }

/* Jede geprüfte Aufgabe irgendwo in der App landet hier. Die Lernzeit wird aus
   den Abständen zwischen den Aufgaben geschätzt — Pausen über drei Minuten zählen nicht. */
export function aktivitaetMelden({ ok = null, fehlerart = null, hilfe = false, anzahl = 1 } = {}) {
  if (!LERN.profil && !(FR.kontoAngemeldet && FR.kontoAngemeldet())) return;
  lernAendern((L) => {
    const k = tagSchluessel();
    const t = L.aktivitaet[k] || { sekunden: 0, aufgaben: 0, richtig: 0, hilfe: 0, fehler: {} };
    const jetzt = Date.now(), luecke = jetzt - (L.letzteAktivitaet || 0);
    t.sekunden += luecke < 30 * 60000 ? Math.min(luecke, 180000) / 1000 : 60;
    if (ok !== null) { t.aufgaben += anzahl; if (ok) t.richtig += anzahl; }
    if (hilfe) t.hilfe += 1;
    if (fehlerart) t.fehler[fehlerart] = (t.fehler[fehlerart] || 0) + 1;
    L.aktivitaet[k] = t;
    L.letzteAktivitaet = jetzt;
  });
}

/* Prüfungsergebnisse sind Belege für den Lernstand. */
export function pruefungsBefund(id, ok) {
  if (!id || !KOMP[id] || !LERN.profil) return;
  lernAendern((L) => {
    const alt = L.stand[id] || {};
    if (!ok && ["sicher", "vermutet"].includes(alt.status))
      L.stand[id] = { ...alt, status: "arbeit", faellig: Date.now(), zuletzt: Date.now() };
    else if (!ok && !alt.status) L.stand[id] = { ...alt, status: "luecke", zuletzt: Date.now() };
    else if (ok && !alt.status) L.stand[id] = { ...alt, status: "vermutet", zuletzt: Date.now() };
  });
}
