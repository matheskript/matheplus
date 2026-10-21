/* ======================================================================
   KAPITEL-PFADE – /kapitel/<slug> für die Kapitelseiten (klein, damit pfade.js
   nicht die ganze Kapitel-Logik laden muss). Test: tests/kapitelSeite.test.mjs
   ====================================================================== */
import { THEMEN } from "./schulbuch.js";

/* ---------- Pfade: /kapitel/<slug> ---------- */
const slugAus = (t) => String(t).toLowerCase()
  .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/* Slug aus dem Titel; gleiche Titel (z. B. „Lineare Gleichungssysteme“ in Klasse 8 und in der Kursstufe)
   bekommen bei den Kursstufen-Kapiteln den Zusatz „-oberstufe“. Der Pfad folgt dem Titel – wer einen Kapiteltitel ändert, ändert auch den Link. */
export const KAPITEL_SLUG = (() => {
  const zaehl = {};
  for (const id of Object.keys(THEMEN)) { const s = slugAus(THEMEN[id].titel); zaehl[s] = (zaehl[s] || 0) + 1; }
  const out = {};
  for (const id of Object.keys(THEMEN)) {
    const s = slugAus(THEMEN[id].titel);
    out[id] = zaehl[s] > 1 && id.startsWith("ks") ? `${s}-oberstufe` : s;
  }
  return out;
})();
const NACH_SLUG = Object.fromEntries(Object.entries(KAPITEL_SLUG).map(([id, s]) => [s, id]));
export const kapitelAusSlug = (s) => NACH_SLUG[s] || null;
export const kapitelPfad = (id) => (KAPITEL_SLUG[id] ? `/kapitel/${KAPITEL_SLUG[id]}` : null);

