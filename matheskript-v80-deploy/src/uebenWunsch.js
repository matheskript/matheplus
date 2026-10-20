/* Üben-Wunsch: Das Modul Unterstufe (und andere Lernseiten) schicken auf ein Werkzeug und wünschen sich dort
   gleich einen Modus (entdecken | ueben) und einen Aufgabentyp. Das Werkzeug holt sich den Wunsch beim Öffnen ab:
   ZweiModi (geoUi.jsx) liest den Modus, UebenRahmen den Aufgabentyp – jeweils nur, solange der Wunsch frisch ist,
   und nur für das Werkzeug, für das er gesetzt wurde. Kein Speicher, kein React. */
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
