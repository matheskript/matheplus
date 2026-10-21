/* Quickfinder-Speicher (Schulart, Klasse, Kapitel, Auswahl) – aus funcQuickfinder.jsx ausgelagert (21.10.2026),
   damit func2 (klasseErmitteln) nicht die ganze Quickfinder-Oberfläche in den Startchunk zieht. */
import { kapitelFuer, klassenBoxen, schulart as schulartVon } from "./schulbuch.js";
import { unterthema } from "./unterthemen.js";
import { hauptthemaPruefen } from "./hauptthema.js";

export const SCHLUESSEL = "matheplus-quickfinder";
export function lesen() {
  try {
    const v = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null");
    if (!v || typeof v !== "object") return null;
    if (!schulartVon(v.schulart)) return null;
    const box = klassenBoxen(v.schulart).find((b) => b.id === v.klasse) ? v.klasse : null;
    const kapitel = box && kapitelFuer(v.schulart, box).some((k) => k.id === v.kapitel) ? v.kapitel : null;
    const teil = kapitel && v.teil && unterthema(v.teil) && unterthema(v.teil).kapitel === kapitel ? v.teil : null;
    return { schulart: v.schulart, klasse: box, kapitel, teil, modus: v.modus === "plan" ? "plan" : "sache", auswahl: auswahlLesen(v), haupt: hauptthemaPruefen(v.haupt) };
  } catch { return null; }
}
/* Angehakte Unterthemen für den Trainingsplan (nur gültige Ids, ohne Doppelte) */
export function auswahlLesen(v) { return Array.isArray(v && v.auswahl) ? [...new Set(v.auswahl.filter((id) => typeof id === "string" && unterthema(id)))] : []; }
export function schreiben(v) { try { localStorage.setItem(SCHLUESSEL, JSON.stringify(v)); } catch { /* privat */ } }
export function quickfinderLesen() { return lesen(); }
