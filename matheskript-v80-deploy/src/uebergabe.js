/* ============================================================
   Übergaben zwischen Werkzeugen
   Ein Werkzeug legt Daten für eine Zielansicht ab („Mit dieser Funktion
   weiter …“), das Zielwerkzeug liest sie beim ersten Rendern
   (uebergabeLesen im useState-Initialisierer) und räumt sie danach weg
   (uebergabeErledigt im useEffect). Lesen ist bewusst ohne Seiteneffekt,
   damit doppelt ausgeführte Initialisierer nichts verlieren.
   Reine Logik, keine Importe.
   ============================================================ */
const ablage = {};
let hinweis = null;   // { ansicht, von, zeit } – für die Zeile „Übernommen aus …“

export function uebergabeSetzen(ansicht, daten, von, zurueck = null) {
  ablage[ansicht] = daten;
  hinweis = { ansicht, von: von || null, zurueck, zeit: Date.now() };
}

export const uebergabeLesen = (ansicht) => (ansicht in ablage ? ablage[ansicht] : null);

export function uebergabeErledigt(ansicht) { delete ablage[ansicht]; }

/* Hinweis gilt nur für die Ansicht, zu der gerade übergeben wurde; jeder normale Seitenwechsel löscht ihn */
export function uebergabeHinweis(ansicht) {
  if (!hinweis || hinweis.ansicht !== ansicht || !hinweis.von) return null;
  return hinweis.von;
}
/* Rückweg zum abgebenden Ort (z. B. zur laufenden Abi-Kette) – oder null */
export function uebergabeZurueck(ansicht) {
  return hinweis && hinweis.ansicht === ansicht && hinweis.zurueck ? hinweis.zurueck : null;
}
export function hinweisVerwerfen() { hinweis = null; }
/* Nur der Rückweg, ohne Daten (z. B. Lernpfad → Werkzeug → zurück zur Einheit) */
export function rueckwegSetzen(ansicht, von, zurueck) { hinweis = { ansicht, von: von || null, zurueck, zeit: Date.now() }; }

/* Polynom als Eingabetext für Kurvendiskussion und Ableitungstrainer, ohne „1·“, „+ −“ und Nullglieder:
   [[c, p], …] → z. B. „x^3-6*x^2+9*x-2“ (Regel A5: nichts bleibt unvereinfacht stehen) */
export function polyEingabe(paare) {
  const r = (v) => Math.round(v * 1e6) / 1e6;
  let s = "";
  for (const [c0, p] of paare) {
    const c = r(c0);
    if (c === 0) continue;
    const x = p === 0 ? "" : p === 1 ? "x" : `x^${p}`;
    const b = Math.abs(c), zahl = b === 1 && x ? "" : `${b}${x ? "*" : ""}`;
    s += `${c < 0 ? "-" : s ? "+" : ""}${zahl}${x}`;
  }
  return s || "0";
}
/* Zahl für einen Eingabetext: negative in Klammern nur, wo sie hinter einem Operator stehen */
export const zahlEingabe = (v) => String(Math.round(v * 1e6) / 1e6);
