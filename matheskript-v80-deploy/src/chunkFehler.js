/* ======================================================================
   Reine Logik gegen den „weißen Bildschirm“ nach einem Deploy (ohne React,
   testbar mit Node).

   Hintergrund: Jeder Build erzeugt neue Hash-Dateinamen für die per
   import() nachgeladenen Teile (func14-ab12cd.js …). Eine bereits offene
   App (oder eine zwischengespeicherte Hülle) verweist danach auf Dateien,
   die es nicht mehr gibt. Das Nachladen scheitert, und ohne Abfangen
   baut React den ganzen Baum ab. Ein Neuladen der Seite holt die neue
   Hülle und behebt es – das tun wir jetzt einmal automatisch.
   ====================================================================== */

const MUSTER = [
  /Failed to fetch dynamically imported module/i,   // Chrome, Edge
  /error loading dynamically imported module/i,     // Firefox
  /Importing a module script failed/i,              // Safari
  /Unable to preload CSS/i,                         // Vite (Stylesheet-Chunk)
  /Loading chunk [\w-]+ failed/i,                   // Webpack-Stil
  /ChunkLoadError/i,
];

/** Ist das ein Fehler beim Nachladen eines Programmteils? */
export function istChunkFehler(fehler) {
  if (!fehler) return false;
  const text = `${fehler.name || ""} ${fehler.message || ""} ${typeof fehler === "string" ? fehler : ""}`;
  return MUSTER.some((m) => m.test(text));
}

/** Mindestabstand zwischen zwei automatischen Neuladungen (verhindert Endlosschleifen). */
export const NEULADEN_ABSTAND_MS = 15000;

/** Darf jetzt automatisch neu geladen werden? `zuletzt` = Zeitstempel der letzten Neuladung oder null. */
export function neuLadenErlaubt(jetzt, zuletzt) {
  if (zuletzt == null || Number.isNaN(Number(zuletzt))) return true;
  return jetzt - Number(zuletzt) >= NEULADEN_ABSTAND_MS;
}
