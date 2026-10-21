/* Einwilligung vor dem ersten Foto / der ersten Mathilda-Anfrage – nur Lesen und Schreiben.
   Eigene kleine Datei, damit Fußzeile (funcRecht) und App-Hülle (func10) nicht die ganze func9.jsx
   (Auswertung, Einwilligungsfenster …) in den Startchunk ziehen (Trainingstools G, 21.10.2026). */
import { RAM_SPEICHER } from "./base3.jsx";
import { EINWILLIGUNG_SCHLUESSEL } from "./base4.jsx";

export function einwilligungLesen() {
  try { const v = window.localStorage.getItem(EINWILLIGUNG_SCHLUESSEL); if (v) return JSON.parse(v); } catch (e) { /* nicht verfügbar */ }
  return RAM_SPEICHER[EINWILLIGUNG_SCHLUESSEL] || null;
}

export function einwilligungSetzen(v) {
  RAM_SPEICHER[EINWILLIGUNG_SCHLUESSEL] = v;
  try {
    if (v) window.localStorage.setItem(EINWILLIGUNG_SCHLUESSEL, JSON.stringify(v));
    else window.localStorage.removeItem(EINWILLIGUNG_SCHLUESSEL);
  } catch (e) { /* bleibt im Arbeitsspeicher */ }
}
