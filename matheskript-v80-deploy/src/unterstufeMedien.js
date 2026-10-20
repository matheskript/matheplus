/* ============================================================
   Modul Unterstufe – Medien je Lerneinheit: Motion-Animationen und Video.
   Reine Daten, kein React (Node-testbar: tests/unterstufeMedien.test.mjs).

   ANIMATIONEN: { [einheitId]: [{ szene, titel, p }] } – zusammengeführt aus src/motion/medien*.js;
                die Szenen selbst stehen in src/motion/szenen*.jsx (Abspieler: funcUnterstufeMotion.jsx).
   VIDEOS:      Jede Lerneinheit hat ein Video. Solange kein eigenes da ist, steht ein PLATZHALTER
                (ein Video von Michael Penn, Englisch). Eigenes Video eintragen:
                  VIDEO_EIGEN["roemische-zahlen-zweiersystem"] = { youtube: "<ID>", titel: "Römische Zahlen in 5 Minuten" };
                Dann verschwindet der Platzhalter-Hinweis automatisch.
   ============================================================ */
import { ANIM_ZAHLEN } from "./motion/medienZahlen.js";
import { ANIM_GEOMETRIE } from "./motion/medienGeometrie.js";
import { ANIM_BRUECHE } from "./motion/medienBrueche.js";
import { ANIM_DATEN } from "./motion/medienDaten.js";

export const ANIMATIONEN = { ...ANIM_ZAHLEN, ...ANIM_GEOMETRIE, ...ANIM_BRUECHE, ...ANIM_DATEN };

export const animationenFuer = (id) => ANIMATIONEN[id] || [];

/* Platzhalter: Michael Penn, „A number theory problem from Morocco!“ */
export const VIDEO_PLATZHALTER = { youtube: "ihzRJOwVKPU", titel: "Michael Penn: A number theory problem from Morocco!", platzhalter: true };

/* Eigene Videos je Lerneinheit (YouTube-ID). Leer = Platzhalter. */
export const VIDEO_EIGEN = {
};

export function videoFuer(id) {
  const v = VIDEO_EIGEN[id];
  if (v && v.youtube) return { ...v, platzhalter: false };
  return VIDEO_PLATZHALTER;
}
