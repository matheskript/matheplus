/* ======================================================================
   STARTSEITE – Dunkel / Hell: der Modus der Startseite (funcStartseite.jsx).
   „dunkel“ = Nachtblau mit Rechenpapier (Standard), „hell“ = weißer Grund.

   Gewählt wird je Browser (localStorage); umschalten über die Pille unten
   links auf der Startseite, das Arbeitsmenü (wie „Switch to English“) oder
   per Link: /start-hell und /start-dunkel landen danach auf „/“.
   Reine Daten und Browser-Speicher, keine React-Importe (Node-testbar).
   ====================================================================== */

export const START_MODUS_SCHLUESSEL = "matheplus-start-modus";
export const EVENT_START_MODUS = "mm-start-modus";
export const START_MODI = ["dunkel", "hell"];
const STANDARD = "dunkel";

/* Gewählter Modus: "dunkel" oder "hell" (ohne Wahl: dunkel) */
export function startModus() {
  try {
    const v = localStorage.getItem(START_MODUS_SCHLUESSEL);
    return START_MODI.includes(v) ? v : STANDARD;
  } catch { return STANDARD; }
}

export function startModusSetzen(v) {
  if (!START_MODI.includes(v)) return;
  try { localStorage.setItem(START_MODUS_SCHLUESSEL, v); } catch { /* privat */ }
  try { window.dispatchEvent(new Event(EVENT_START_MODUS)); } catch { /* kein Fenster */ }
}

export const startModusWechseln = () => startModusSetzen(startModus() === "hell" ? "dunkel" : "hell");

/* Pfad wie "/start-hell" → "hell"; sonst null. Erkannt werden start-, startseite- und frontpage- mit hell oder dunkel. */
export function modusAusPfad(pfad) {
  const m = /^\/?(?:start|startseite|frontpage)-(hell|dunkel)\/?$/i.exec(String(pfad || "").split(/[?#]/)[0]);
  return m ? m[1].toLowerCase() : null;
}
