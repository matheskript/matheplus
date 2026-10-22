/* ============================================================
   VEKTOREN-NAVIGATION – welcher Eintrag des Seitenmenüs gerade aktiv ist
   Das Band (Gruppe) und das Seitenmenü (Eintrag) lesen denselben Stand:
   aktuelle Ansicht + Modus. Werkzeuge mit Modi holen ihren Modus über
   useVekModus statt über eigenen useState – so bleibt das Menü stehen,
   wenn man zwischen Modi und Werkzeugen einer Gruppe wechselt.
   Kein Kontext nötig: ein kleiner Speicher im Modul (wie uebenWunsch.js).
   ============================================================ */
import { useEffect, useState, useSyncExternalStore } from "react";
import { vekStandardModus, vekWo } from "./trainingsKurse.js";

let stand = { ansicht: null, modus: null };
let gehen = null;          // gehe() der Werkzeugseite
let vorgemerkt = null;     // { ansicht, modus } – Modus fürs nächste Werkzeug
const hoerer = new Set();

const melden = () => hoerer.forEach((f) => f());
const abonnieren = (f) => { hoerer.add(f); return () => hoerer.delete(f); };
const lesen = () => stand;

/* Die Werkzeugseite meldet Ansicht und gehe() an (func: WerkzeugSeite) */
export function vekSeiteMelden(ansicht, gehe) {
  gehen = gehe;
  if (stand.ansicht !== ansicht) {
    const modus = vorgemerkt && vorgemerkt.ansicht === ansicht ? vorgemerkt.modus : vekStandardModus(ansicht);
    vorgemerkt = null;
    stand = { ansicht, modus };
    /* während des Renderns kein setState in fremden Komponenten auslösen */
    queueMicrotask(melden);
  }
}

/* Werkzeugseite verlassen: eingebettete Werkzeuge (Kurse, Sessions) laufen danach wieder lokal */
export function vekSeiteAbmelden(ansicht) {
  if (stand.ansicht !== ansicht) return;
  stand = { ansicht: null, modus: null };
  gehen = null;
  melden();
}

export const useVekStand = () => useSyncExternalStore(abonnieren, lesen, lesen);

/* Modus eines Werkzeugs: [modus, setModus]. Ohne angemeldete Seite (z. B. im Kursmodul) lokal. */
export function useVekModus(ansicht, standard) {
  const s = useVekStand();
  const [lokal, setLokal] = useState(standard);
  const angemeldet = s.ansicht === ansicht;
  useEffect(() => {
    if (angemeldet && !s.modus) { stand = { ansicht, modus: standard }; melden(); }
  }, [angemeldet, s.modus, ansicht, standard]);
  if (!angemeldet) return [lokal, setLokal];
  const setze = (m) => { stand = { ansicht, modus: m }; melden(); };
  return [s.modus || standard, setze];
}

/* Menü-Eintrag öffnen: gleiches Werkzeug → nur Modus wechseln, sonst Modus vormerken und hingehen */
export function vekEintragOeffnen(e) {
  if (e.ansicht === stand.ansicht) {
    if (e.modus && e.modus !== stand.modus) { stand = { ansicht: e.ansicht, modus: e.modus }; melden(); }
    return;
  }
  vorgemerkt = e.modus ? { ansicht: e.ansicht, modus: e.modus } : null;
  if (gehen) gehen({ ansicht: e.ansicht });
}

/* Aktive Gruppe + Eintrag für den aktuellen Stand */
export const vekAktiv = (s = stand) => (s.ansicht ? vekWo(s.ansicht, s.modus) : null);
