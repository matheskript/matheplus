/* ============================================================
   Buchung von Übungsergebnissen ins Fortschrittsprotokoll
   Jeder Trainer meldet richtig/falsch an merken() (func5.jsx) –
   daraus entstehen Fehlerprofil, Tagesaktivität und Lernstand.
   · buchen({ richtig, gruppe, fehlerart, art })  – direkt melden
   · useStateGebucht(init) – Ersatz für useState bei Rückmelde-Zuständen:
       Setzt ein Trainer { art: "gut" | "schlecht", … } oder
       "richtig" | "falsch", wird das automatisch gebucht.
   Bereich = aktuelle Ansicht (von func10 über FR.ansicht gesetzt).
   merken kommt lazy über FR, damit keine Zyklen entstehen.
   ============================================================ */
import { useCallback, useState } from "react";
import { FR } from "./funcRegistry.jsx";

export function buchen({ richtig, gruppe, fehlerart = null, stufe, art } = {}) {
  if (typeof richtig !== "boolean" || !FR.merken) return;
  const bereich = (FR.ansicht && FR.ansicht()) || "werkzeug";
  // art: Aufgabentyp innerhalb des Werkzeugs (z. B. Produktregel) – daraus liest die Heute-Karte den Stand je Einheit
  const eintrag = { bereich, gruppe: gruppe || bereich, richtig, fehlerart, ...(stufe ? { stufe } : null), ...(art ? { art } : null) };
  try { FR.merken(eintrag); } catch (e) { /* Protokoll ist optional */ }
  try { window.dispatchEvent(new CustomEvent("matheplus:buchung", { detail: eintrag })); } catch (e) { /* egal */ }
}

/* Liest aus einem Rückmelde-Wert, ob es ein Treffer war (null = nichts zu buchen) */
export function trefferAus(v) {
  if (v === "richtig") return true;
  if (v === "falsch") return false;
  if (v && typeof v === "object" && !Array.isArray(v)) {
    if (v.art === "gut") return true;
    if (v.art === "schlecht") return false;
  }
  return null;
}

export function useStateGebucht(init) {
  const [wert, setWert] = useState(init);
  const setze = useCallback((v) => {
    const t = trefferAus(v);
    if (t !== null) buchen({ richtig: t });
    setWert(v);
  }, []);
  return [wert, setze];
}
