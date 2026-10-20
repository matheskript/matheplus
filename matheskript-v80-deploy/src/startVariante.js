/* ======================================================================
   STARTSEITE A / B – Umschalter zwischen den zwei Fassungen der Startseite.
   A = der bisherige Stand (func2.jsx, Startseite), B = die neue Fassung mit
   demselben Inhalt in anderem Design (funcStartseiteB.jsx).

   Gewählt wird je Browser (localStorage); Direct Links setzen die Wahl:
     /start-a   → Fassung A      /start-b   → Fassung B
   (auch /startseite-a, /frontpage-b …). Beide landen danach auf „/“.
   Reine Daten und Browser-Speicher, keine React-Importe (Node-testbar).
   ====================================================================== */

export const START_VARIANTE_SCHLUESSEL = "matheplus-start-variante";
export const EVENT_START_VARIANTE = "mm-start-variante";
export const START_VARIANTEN = ["a", "b"];
const STANDARD = "a";

/* Gewählte Fassung: "a" oder "b" (ohne Wahl: A) */
export function startVariante() {
  try {
    const v = localStorage.getItem(START_VARIANTE_SCHLUESSEL);
    return START_VARIANTEN.includes(v) ? v : STANDARD;
  } catch { return STANDARD; }
}

/* true, sobald jemand bewusst gewählt hat (Link oder Umschalter) – dann bleibt der Umschalter sichtbar */
export function startVarianteGewaehlt() {
  try { return START_VARIANTEN.includes(localStorage.getItem(START_VARIANTE_SCHLUESSEL)); } catch { return false; }
}

export function startVarianteSetzen(v) {
  if (!START_VARIANTEN.includes(v)) return;
  try { localStorage.setItem(START_VARIANTE_SCHLUESSEL, v); } catch { /* privat */ }
  try { window.dispatchEvent(new Event(EVENT_START_VARIANTE)); } catch { /* kein Fenster */ }
}

/* Pfad wie "/start-b" → "b"; sonst null. Erkannt werden start-, startseite- und frontpage- mit a oder b. */
export function varianteAusPfad(pfad) {
  const m = /^\/?(?:start|startseite|frontpage)-([ab])\/?$/i.exec(String(pfad || "").split(/[?#]/)[0]);
  return m ? m[1].toLowerCase() : null;
}
