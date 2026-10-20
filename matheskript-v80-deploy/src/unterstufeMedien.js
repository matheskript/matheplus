/* ============================================================
   Modul Unterstufe – Medien je Lerneinheit: Motion-Animationen und Video.
   Reine Daten, kein React (Node-testbar: tests/unterstufeMedien.test.mjs).

   ANIMATIONEN: { [einheitId]: [{ szene, titel, p }] } – zusammengeführt aus src/motion/medien*.js;
   werkzeugAnimationen(id): Animationen für die 13 Unterstufen-Werkzeuge (src/motion/medienWerkzeuge.js);
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
import { ANIM_WERKZEUGE } from "./motion/medienWerkzeuge.js";

export const ANIMATIONEN = { ...ANIM_ZAHLEN, ...ANIM_GEOMETRIE, ...ANIM_BRUECHE, ...ANIM_DATEN };

export const animationenFuer = (id) => ANIMATIONEN[id] || [];

/* Animationen der Unterstufen-Werkzeuge (Entdecken): Verweise { aus, nr } auf Lerneinheiten werden aufgelöst */
export function werkzeugAnimationen(werkzeug) {
  return (ANIM_WERKZEUGE[werkzeug] || []).map((a) => {
    if (!a.aus) return a;
    const quelle = (ANIMATIONEN[a.aus] || [])[a.nr || 0];
    return quelle ? { ...quelle, titel: a.titel || quelle.titel } : null;
  }).filter(Boolean);
}
export const WERKZEUGE_MIT_ANIMATION = Object.keys(ANIM_WERKZEUGE);

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
