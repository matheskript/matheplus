/* ======================================================================
   STARTSEITE – Dunkel / Hell / Mix: der Modus der Startseite (funcStartseite.jsx).
   „dunkel“ = Nachtblau, „hell“ = weißer Grund, „mix“ = weißer Grund mit
   dunklen Inseln (blaue Bühne, Hauptkacheln, zwei Streifen) – Standard seit 21.10.

   Gewählt wird je Browser (localStorage); umschalten über die Pille unten
   links auf der Startseite, das Arbeitsmenü (wie „Switch to English“) oder
   per Link: /start-hell, /start-dunkel und /start-mix landen danach auf „/“.
   Reine Daten und Browser-Speicher, keine React-Importe (Node-testbar).
   ====================================================================== */

export const START_MODUS_SCHLUESSEL = "matheplus-start-modus";
export const EVENT_START_MODUS = "mm-start-modus";
export const START_MODI = ["dunkel", "hell", "mix"];
const STANDARD = "mix";

/* Gewählter Modus: "dunkel", "hell" oder "mix" (ohne Wahl: mix) */
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

/* Reihum: dunkel → hell → mix → dunkel */
export const naechsterModus = (m = startModus()) => START_MODI[(START_MODI.indexOf(m) + 1) % START_MODI.length];
export const startModusWechseln = () => startModusSetzen(naechsterModus());

/* Pfad wie "/start-hell" → "hell"; sonst null. Erkannt werden start-, startseite- und frontpage- mit hell, dunkel oder mix. */
export function modusAusPfad(pfad) {
  const m = /^\/?(?:start|startseite|frontpage)-(hell|dunkel|mix)\/?$/i.exec(String(pfad || "").split(/[?#]/)[0]);
  return m ? m[1].toLowerCase() : null;
}
