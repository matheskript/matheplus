/* ======================================================================
   Protokoll einer Übung melden (aus func5.jsx ausgelagert, 21.10.2026). Eigene Datei, damit func3
   (Text/Zeile) nicht die ganze func5 (Kopfrechnen, Fortschritt, Differenzenquotient …) in den
   Startchunk zieht. Läuft im Arbeitsspeicher der Sitzung; Lernstand und Aktivität werden mitgezählt.
   ====================================================================== */
import { FR } from "./funcRegistry.jsx";
import { PROTOKOLL } from "./base2.jsx";
import { LERN } from "./base3.jsx";
import { lernAusUebung, lernSpeichern } from "./lernStand.js";
import { aktivitaetMelden } from "./lernMelden.js";

export function merken(eintrag) {
  if (!eintrag.bereich && FR.ansicht) { try { eintrag = { bereich: FR.ansicht(), ...eintrag }; } catch (e) { /* egal */ } }
  PROTOKOLL.push({ zeit: Date.now(), ...eintrag });
  try { lernAusUebung(eintrag); } catch (e) { /* Lernstand ist optional */ }
  try { aktivitaetMelden({ ok: eintrag.richtig ?? null, fehlerart: eintrag.fehlerart || null }); } catch (e) { /* optional */ }
  if (PROTOKOLL.length > 500) PROTOKOLL.splice(0, PROTOKOLL.length - 500);
  if (LERN.geladen) lernSpeichern();
}
FR.merken = merken;   // für buchung.jsx (Trainer melden richtig/falsch)
