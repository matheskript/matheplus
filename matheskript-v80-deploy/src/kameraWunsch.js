/* Kamera-Wunsch: Die Startseite von MathildaAI hat bei „Textaufgabe“ und „Klausurbox“ einen Kamera-Knopf.
   Er wechselt auf die Zielseite und merkt sich hier, dass dort gleich die Kamera aufgehen soll.
   Die Zielseite holt den Wunsch beim Öffnen ab (kameraWunschHolen) – genau einmal und nur, solange er frisch ist. */
let wunsch = null;
const FRISCH_MS = 45000;   // genug Zeit für das Passwort-Fenster, falls der Bereich noch gesperrt ist

export function kameraWunschSetzen(ziel) {
  wunsch = { ziel, zeit: Date.now() };
}

export function kameraWunschHolen(ziel) {
  if (!wunsch || wunsch.ziel !== ziel) return false;
  const frisch = Date.now() - wunsch.zeit < FRISCH_MS;
  wunsch = null;
  return frisch;
}
