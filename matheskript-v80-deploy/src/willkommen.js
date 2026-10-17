/* ======================================================================
   WILLKOMMEN NACH DEM PASSWORT – Zeiten und Rechenhilfen
   Ohne Oberfläche, damit sie in tests/willkommen.test.mjs geprüft werden können.
   Die Oberfläche steht in funcWillkommen.jsx, das Cookie setzt middleware.js.
   ====================================================================== */

export const COOKIE_WILLKOMMEN = "mm_willkommen";
export const SCHREIB_MS = 6000;   // der Text ist nach 6 Sekunden komplett geschrieben
export const GESAMT_MS = 7000;    // der Goldbalken ist nach 7 Sekunden voll, dann geht es in die App
export const FEEDBACK_OEFFNEN = "mm-feedback-oeffnen";   // Ereignis: Feedback-Auswahl öffnen

/** Wie viele von n Zeichen sind nach `vergangen` Millisekunden geschrieben? */
export function geschriebeneZeichen(vergangen, n, schreibMs = SCHREIB_MS) {
  if (!(n > 0) || !(vergangen > 0)) return 0;
  return Math.min(n, Math.floor((vergangen / schreibMs) * n));
}

/** Anzahl der sichtbaren Zeichen (Leerzeichen zählen nicht mit). */
export function zaehleZeichen(texte) {
  return texte.join("").replace(/\s/g, "").length;
}

/** Steht das Willkommens-Cookie in einem document.cookie-Text? */
export function willkommenCookieGesetzt(cookieText) {
  return String(cookieText || "").split(";").some((teil) => teil.trim() === `${COOKIE_WILLKOMMEN}=1`);
}
