/* ======================================================================
   Lesezeit für alle Animationen (seit 22.10.2026) – reine Logik, Node-testbar (tests/lesezeit.test.mjs).

   Grundsatz: Kein Text verschwindet, bevor ein Schüler ihn lesen konnte.
   Ein Fünft- bis Siebtklässler liest still etwa 120–140 Wörter pro Minute ≈ 14 Zeichen je Sekunde,
   dazu kommt ein Anlauf (Blick vom Bild zum Text). Daher: 1,2 s + 70 ms je Zeichen.

   Genutzt von
   · src/motion/kern.jsx (zeitplan der Motion-Animationen: Unterstufe, Vektoren)
   · Player in src/funcErklaeranimation.jsx (alle Erkläranimationen mit schritte: [{ von, text }])
   · src/wurzelMotion.js (Kopfrechnen √10k)

   Bewegung und Lesen: Reicht die Zeit eines Schritts nicht zum Lesen, wird der Schritt länger.
   Die Bewegung wird dabei höchstens um BEWEGUNG_MAX gestreckt (sonst wirkt sie zäh) – die übrige
   Zeit steht das Bild am Ende des Schritts still, während der Text zu Ende gelesen wird.
   ====================================================================== */

export const LESE_ANLAUF_MS = 1200;
export const LESE_MS_JE_ZEICHEN = 70;
export const BEWEGUNG_MAX = 1.6;            // Bewegungen höchstens 1,6-mal langsamer als gezeichnet

/* Lesezeit eines Textes in Millisekunden (0 ohne Text) */
export const lesezeitMs = (text) => (text ? LESE_ANLAUF_MS + LESE_MS_JE_ZEICHEN * String(text).length : 0);

/* Plan für einen Ablauf aus Schritten mit Startzeit (Sekunden), wie im Player:
   schritte: [{ von, text }], dauer: Ende der letzten Szene in Sekunden.
   puffer: Sekunden zusätzlich zum Lesen (Bild ansehen), faktor: jeder Schritt mindestens faktor × so lang wie gezeichnet.
   Liefert { schritte (neue von), dauer, zuDrehbuch(t) } – zuDrehbuch rechnet die Abspielzeit in die
   gezeichnete Zeit um: erst gestreckte Bewegung, dann Standbild am Schrittende. */
export function lesePlan(schritte, dauer, { puffer = 1.5, faktor = 1 } = {}) {
  const alt = schritte.map((s) => s.von);
  const altEnde = [...alt.slice(1), dauer];
  const teile = schritte.map((s, i) => {
    const gezeichnet = Math.max(0, altEnde[i] - alt[i]);
    const lesen = s.text ? lesezeitMs(s.text) / 1000 + puffer : 0;
    const lang = Math.max(gezeichnet * faktor, lesen, gezeichnet);
    const bewegt = Math.min(lang, gezeichnet * Math.max(faktor, BEWEGUNG_MAX));
    return { gezeichnet, lang: Math.round(lang * 10) / 10, bewegt };
  });
  let t = 0;
  const neu = teile.map((x) => { const v = t; t += x.lang; return Math.round(v * 10) / 10; });
  const neuDauer = Math.round(t * 10) / 10;
  const zuDrehbuch = (tt) => {
    if (tt <= 0) return 0;
    if (tt >= neuDauer) return dauer;
    let i = 0;
    while (i < neu.length - 1 && tt >= neu[i + 1]) i++;
    const x = teile[i], d = tt - neu[i];
    if (x.gezeichnet <= 0) return alt[i];
    return alt[i] + Math.min(1, d / (x.bewegt || 1)) * x.gezeichnet;
  };
  return { schritte: schritte.map((s, i) => ({ ...s, von: neu[i] })), dauer: neuDauer, zuDrehbuch };
}
