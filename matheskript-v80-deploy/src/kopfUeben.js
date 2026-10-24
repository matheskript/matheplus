/* ======================================================================
   KOPFRECHNEN – Modus „Üben“ (ohne Oberfläche)
   Aus einem Rechenweg (kopfWeg.js, { ok, ergebnis, schritte }) werden die
   Üben-Schritte gebaut: Jeder Schritt mit `ueben` wird zur Wahl aus Karten
   (richtiges Zwischenergebnis + bis zu drei typische Fehler), Schritte ohne
   `ueben` (Erklärung, Probe) laufen von selbst mit („info“).

   uebenWeg(r, zufall) → [{ art: "wahl" | "info", index, text, rechnung,
                           frage, label, richtig: { text }, optionen }]
   Werte sind Texte (Brüche als {Zähler|Nenner}); die Oberfläche setzt sie
   mit MitBruch. Reine Logik, Test: tests/kopfUeben.test.mjs.
   ====================================================================== */
import { falscheOptionen, uebenSchritt } from "./uebenKern.js";

const schluessel = (w) => w.text;
const lesbar = (w) => typeof w.text === "string" && w.text.trim() !== "" && !/NaN|undefined/.test(w.text);

export function uebenWeg(r, zufall = Math.random) {
  if (!r || !r.ok) return [];
  const schritte = [];
  r.schritte.forEach((s, index) => {
    const u = s.ueben;
    if (!u || u.wert == null) { schritte.push({ art: "info", index, text: s.text, rechnung: s.rechnung || null }); return; }
    const richtig = { text: String(u.wert) };
    const kandidaten = (u.falsch || []).map((f) => ({ wert: { text: String(f.wert) }, hinweis: f.hinweis, art: "fehler" }));
    const falsche = falscheOptionen(richtig, kandidaten, { pruefe: (w) => ({ ok: w.text === richtig.text, hinweis: "" }), schluessel, lesbar, max: 3, zufall });
    if (!falsche.length) { schritte.push({ art: "info", index, text: s.text, rechnung: s.rechnung || null }); return; }
    schritte.push(uebenSchritt({ art: "wahl", index, text: s.text, rechnung: s.rechnung || null, frage: u.frage, label: "", richtig, falsche, schluessel, zufall }));
  });
  return schritte;
}

/* Zahl der Wahl-Schritte (für „Schritt n von N“) */
export const wahlZahl = (schritte) => schritte.filter((s) => s.art === "wahl").length;
