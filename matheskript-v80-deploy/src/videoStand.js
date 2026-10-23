/* Stand der Videokurse für die Kurskarten (Startchunk, 23.10.2026): Anzahl der Videos und nächste
   offene Lektion – nur aus der leichten Kopie src/videoLeicht.js und localStorage. Der Player und die
   ganzen Kursdaten bleiben in func15.jsx/base5.jsx und laden erst mit ihrer Ansicht.
   Schlüssel und Regeln identisch mit func15.jsx (dort re-exportiert). */
import { VIDEO_LEKTIONEN } from "./videoLeicht.js";

export const videoSchluessel = (kursId) => `mm-videokurs-${kursId}`;
export function ladeErledigt(kursId) {
  try { return JSON.parse(localStorage.getItem(videoSchluessel(kursId)) || "[]"); } catch { return []; }
}
export const videoAnzahl = (kursId) => (VIDEO_LEKTIONEN[kursId] ? VIDEO_LEKTIONEN[kursId].length : 0);

/* Index der nächsten noch nicht erledigten Lektion (oder 0). */
export function naechsteLektion(kursId) {
  const ids = VIDEO_LEKTIONEN[kursId];
  if (!ids) return 0;
  const erledigt = ladeErledigt(kursId);
  const i = ids.findIndex((id) => !erledigt.includes(id));
  return i < 0 ? 0 : i;
}
