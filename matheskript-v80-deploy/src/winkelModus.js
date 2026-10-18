/* ======================================================================
   winkelModus.js – Winkeleinstellung des Trig-Rechners (DEG oder RAD)
   wie beim Schul-Taschenrechner: eine Einstellung für die ganze App,
   gespeichert im Gerät (matheplus-winkelmodus). Kein React, kein DOM-Zwang.
   ====================================================================== */
const SCHLUESSEL = "matheplus-winkelmodus";
const lies = () => { try { return localStorage.getItem(SCHLUESSEL) === "rad" ? "rad" : "deg"; } catch (e) { return "deg"; } };
let modus = typeof window === "undefined" ? "deg" : lies();
const hoerer = new Set();

export const winkelModus = () => modus;
export const winkelAbo = (h) => { hoerer.add(h); return () => hoerer.delete(h); };
export function setzeWinkelModus(m) {
  const neu = m === "rad" ? "rad" : "deg";
  if (neu === modus) return;
  modus = neu;
  try { localStorage.setItem(SCHLUESSEL, neu); } catch (e) { /* ohne Speicher */ }
  hoerer.forEach((h) => h());
}
