/* ======================================================================
   ZUGANG: Was ist frei, was ist gekauft?

   1) Trainingsgeräte (Üben + Prüfung): ohne Unlimited FREI_PRO_TAG Aufgaben
      pro Kalendertag. Gezählt wird jede geprüfte Aufgabe (über merken() in
      func5.jsx), solange gerade ein Trainingsgerät offen ist. Geräte, die
      nichts an merken() melden, zählen beim Öffnen einmal.
      KI-Funktionen (Mathilda, Aufgabengenerator, Begründen) bleiben frei –
      sie sind laut AGB § 10 kein Teil bezahlter Leistungen.
   2) Selbstlernkurs Analysis 1: erste Lektion frei, Rest nach dem Kauf.

   Der Tageszähler liegt im Browser (localStorage). Das ist bewusst einfach
   gehalten; wer Speicher löscht, kann ihn zurücksetzen.
   ====================================================================== */
import { useSyncExternalStore } from "react";
import { kontoStand, hatRecht } from "./konto.js";

export const FREI_PRO_TAG = 10;
export const PREISE = { analysis1: 50, unlimited: 20 };
export const BEZAHLKURSE = { analysis1: { freieLektionen: 1 } };

/* Welche Ansichten sind Trainingsgeräte? (ansicht → true | Set erlaubter Ziele) */
const GERAETE = {
  gleichungen: true, lgs: true, ableitungstrainer: true, kopf: true,
  abitur: true, modellieren: true,
  training: new Set(["weg", "kd", "gz", "klausur"]),
};
/* Diese Geräte melden keine einzelnen Aufgaben → zählen beim Öffnen. */
const ZAEHLT_BEIM_OEFFNEN = new Set(["abitur", "modellieren", "training:kd", "training:klausur"]);

export function istTrainingsgeraet(ansicht, ziel) {
  const g = GERAETE[ansicht];
  return g === true || (g instanceof Set && g.has(ziel ?? null));
}

const heute = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const SCHLUESSEL = "mm-aufgaben-heute";
const lies = () => {
  try { const z = JSON.parse(localStorage.getItem(SCHLUESSEL)); return z && z.tag === heute() ? z.n : 0; }
  catch (e) { return 0; }
};

let stand = { n: lies(), aktiv: null };   // aktiv = Schlüssel des offenen Geräts oder null
const hoerer = new Set();
const melden = () => hoerer.forEach((h) => h());
export function useTageszaehler() {
  return useSyncExternalStore((h) => { hoerer.add(h); return () => hoerer.delete(h); }, () => stand);
}

export const hatUnlimited = (rechte = kontoStand().rechte) => hatRecht(rechte, "unlimited");
export const hatKurs = (kursId, rechte = kontoStand().rechte) => hatRecht(rechte, kursId);
export const restHeute = () => Math.max(0, FREI_PRO_TAG - stand.n);
export const gesperrt = () => !hatUnlimited() && stand.n >= FREI_PRO_TAG;

function zaehlen() {
  if (hatUnlimited()) return;
  const n = lies() + 1;
  try { localStorage.setItem(SCHLUESSEL, JSON.stringify({ tag: heute(), n })); } catch (e) { /* privat */ }
  stand = { ...stand, n };
  melden();
}

/* Von merken() aufgerufen: eine geprüfte Aufgabe. */
export function aufgabeGezaehlt() {
  if (stand.aktiv) zaehlen();
}

/* Von der App bei jedem Ansichtswechsel aufgerufen. */
export function geraetGeoeffnet(ansicht, ziel) {
  const schluessel = istTrainingsgeraet(ansicht, ziel) ? (GERAETE[ansicht] === true ? ansicht : `${ansicht}:${ziel}`) : null;
  const neu = schluessel && schluessel !== stand.aktiv;
  stand = { n: lies(), aktiv: schluessel };
  melden();
  if (neu && ZAEHLT_BEIM_OEFFNEN.has(schluessel) && !gesperrt()) zaehlen();
}

/* Kurs: Ist diese Lektion (Index ab 0) gesperrt? */
export function lektionGesperrt(kursId, i, rechte = kontoStand().rechte) {
  const k = BEZAHLKURSE[kursId];
  return !!k && i >= k.freieLektionen && !hatKurs(kursId, rechte);
}
