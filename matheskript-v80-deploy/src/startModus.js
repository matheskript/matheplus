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
/* Dashboard auch ohne Konto (sonst sehen Besucher die Story-Startseite, funcStartGast.jsx): localStorage-Schlüssel, Adressen /start-app und /start-story */
export const STARTAPP_SCHLUESSEL = "mm-start-app";
export const START_MODI = ["dunkel", "hell", "mix", "stadion", "ger"];

/* „stadion“ (21.10.): Rot-Weiß-Blau. Baut auf dem Mix auf (helles Blatt, farbige Inseln) –
   die Komponenten setzen data-modus="mix" plus data-edition="stadion" und färben darüber um.
   Bewusst ohne Vereinslogo und Vereinsnamen: nur die Farben. */
/* „ger“ (21.10., angezeigt als „GER“): Schwarz-Rot-Gold mit Weiß, ebenfalls auf Mix-Basis (data-edition="ger").
   „stadion“ wird angezeigt als „FCB“ (der Schlüssel bleibt, damit gespeicherte Wahl und Links weiter gelten). */
export const EDITIONEN = ["stadion", "ger"];
export const basisModus = (m) => (EDITIONEN.includes(m) ? "mix" : m);
export const editionVon = (m) => (EDITIONEN.includes(m) ? m : undefined);
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

/* Reihum: dunkel → hell → mix → stadion (FCB) → ger → dunkel */
export const naechsterModus = (m = startModus()) => START_MODI[(START_MODI.indexOf(m) + 1) % START_MODI.length];
export const startModusWechseln = () => startModusSetzen(naechsterModus());

/* Pfad wie "/start-hell" → "hell"; sonst null. Erkannt werden start-, startseite- und frontpage- mit hell, dunkel, mix oder stadion. */
export function modusAusPfad(pfad) {
  const m = /^\/?(?:start|startseite|frontpage)-(hell|dunkel|mix|stadion|fcb|ger|deutschland)\/?$/i.exec(String(pfad || "").split(/[?#]/)[0]);
  if (!m) return null;
  const k = m[1].toLowerCase();
  return k === "fcb" ? "stadion" : k === "deutschland" ? "ger" : k;
}

/* Die Edition hängt app-weit am Dokument (html[data-start-edition="stadion"]), damit Logo, Menüs und Kacheln
   auf jeder Seite umfärben können – nicht nur, solange die Startseite steht. */
export function editionAmDokument() {
  try {
    const e = editionVon(startModus());
    if (e) document.documentElement.setAttribute("data-start-edition", e);
    else document.documentElement.removeAttribute("data-start-edition");
  } catch { /* kein Dokument (Node) */ }
}
if (typeof window !== "undefined") {
  editionAmDokument();
  try { window.addEventListener(EVENT_START_MODUS, editionAmDokument); } catch { /* egal */ }
}
