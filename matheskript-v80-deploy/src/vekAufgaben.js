/* ======================================================================
   vekAufgaben.js – Aufgabentool des Kurses „Vektoren, Geraden und Ebenen“
   (Band 2). Gleiche Bauweise wie diffAufgaben.js: jede rechnerische
   Buchaufgabe ist einem Typ zugeordnet (BUCH_TYPEN), neueAufgabe() erzeugt
   beliebig viele gleichwertige neue Aufgaben mit Schritten und Rechenweg.
   Die Typen liegen in vekAufgaben1.js … vekAufgaben4.js (Kapitel I–VI).
   Reine Logik (Tests: tests/vekAufgaben.test.mjs).
   ====================================================================== */
import { zufall } from "./diffKern.js";
import { TYPEN_1, BUCH_1 } from "./vekAufgaben1.js";
import { TYPEN_2, BUCH_2 } from "./vekAufgaben2.js";
import { TYPEN_3, BUCH_3 } from "./vekAufgaben3.js";
import { TYPEN_4, BUCH_4 } from "./vekAufgaben4.js";

export const TYPEN = { ...TYPEN_1, ...TYPEN_2, ...TYPEN_3, ...TYPEN_4 };
export const BUCH_TYPEN = { ...BUCH_1, ...BUCH_2, ...BUCH_3, ...BUCH_4 };

export const typVon = (seite, nr) => BUCH_TYPEN[`${seite}-${nr}`] || null;
export const typTitel = (schluessel) => (TYPEN[String(schluessel).split(":")[0]] || {}).titel || "";

/* Ein „typischer Fehler“, der zufällig dasselbe ergibt wie die Lösung, wird gestrichen */
function ohneScheinfehler(s) {
  if (!s.fehler || !s.fehler.length) return;
  if (s.art === "zahl") s.fehler = s.fehler.filter((f) => Math.abs(f.wert - s.wert) > 1e-9);
}

let laufend = 0;
export function neueAufgabe(schluessel, seed) {
  const [typ, variante] = String(schluessel).split(":");
  const T = TYPEN[typ];
  if (!T) throw new Error("Unbekannter Aufgabentyp: " + schluessel);
  const r = zufall(seed);
  const a = T.gen(r, variante);
  a.schritte.forEach(ohneScheinfehler);
  a.weg = (a.weg || []).filter((z, i, alle) => z !== alle[i - 1]);
  laufend += 1;
  return { ...a, typ: schluessel, titel: T.titel, id: `${typ}-${seed ?? "z"}-${laufend}` };
}
