/* Üben-Wunsch: Das Modul Unterstufe (und andere Lernseiten) schicken auf ein Werkzeug und wünschen sich dort
   gleich einen Modus (entdecken | ueben) und einen Aufgabentyp. Das Werkzeug holt sich den Wunsch beim Öffnen ab:
   ZweiModi (geoUi.jsx) liest den Modus, UebenRahmen den Aufgabentyp – jeweils nur, solange der Wunsch frisch ist,
   und nur für das Werkzeug, für das er gesetzt wurde. Kein Speicher, kein React. */
import { WERKZEUGE } from "./werkzeuge.js";

let wunsch = null;
const FRISCH_MS = 20000;

export function uebenWunschSetzen(werkzeug, { modus = null, art = null } = {}) {
  wunsch = { werkzeug, modus, art, zeit: Date.now() };
}

/* Nur lesen (der Modus wird vor dem Aufgabentyp gebraucht) */
export function uebenWunschLesen(werkzeug) {
  if (!wunsch || Date.now() - wunsch.zeit > FRISCH_MS) { wunsch = null; return null; }
  if (werkzeug && wunsch.werkzeug !== werkzeug) return null;
  return wunsch;
}

/* Lesen und verbrauchen */
export function uebenWunschHolen(werkzeug) {
  const w = uebenWunschLesen(werkzeug);
  if (w) wunsch = null;
  return w;
}

/* Für Tests und die Seitenwechsel: Wunsch verwerfen */
export function uebenWunschVerwerfen() { wunsch = null; }

/* Startmodus eines Werkzeugs (Norm 21.10.): ein frischer Wunsch gewinnt; sonst öffnet ein Werkzeug mit dem Etikett
   „Trainieren“ gleich bei der Aufgabe („ueben“), alle anderen in „entdecken“. Der Name des Werkzeugs (titel) reicht,
   wenn die Id nicht bekannt ist. */
export function startModus(werkzeugOderTitel, sonst = "entdecken") {
  const w = uebenWunschLesen();
  if (w && w.modus) return w.modus;
  const id = WERKZEUGE[werkzeugOderTitel] ? werkzeugOderTitel
    : Object.keys(WERKZEUGE).find((k) => WERKZEUGE[k].name === werkzeugOderTitel || WERKZEUGE[k].name === String(werkzeugOderTitel).replace(/:.*$/, ""));
  const eintrag = id ? WERKZEUGE[id] : null;
  return eintrag && eintrag.etikett === "trainieren" ? "ueben" : sonst;
}
