/* ======================================================================
   Leichte Kopie der Videokurse für den Startchunk (23.10.2026): src/videoLeicht.js enthält je
   Kurs nur die Lektions-IDs – damit func1 (Kurskarten: Abzeichen „n Videos“, nächste Lektion)
   nicht die ganzen Kursdaten aus base5.jsx und den Player aus func15.jsx ins Startbündel zieht.
   Nach jeder Änderung an VIDEOKURSE (base5.jsx) ausführen:  node scripts/video-leicht.mjs
   Wächter: tests/videoLeicht.test.mjs (schlägt an, wenn die Datei veraltet ist).
   ====================================================================== */
import { writeFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export async function videoLektionen() {
  const datei = resolve(wurzel, `node_modules/.video-leicht-${process.pid}.mjs`);
  await build({ entryPoints: [resolve(wurzel, "src/base5.jsx")], bundle: true, format: "esm", platform: "node", outfile: datei, logLevel: "error",
    loader: { ".js": "jsx" }, jsx: "automatic", external: ["react", "react/jsx-runtime"] });
  try {
    const { VIDEOKURSE } = await import(pathToFileURL(datei).href);
    return Object.fromEntries(Object.entries(VIDEOKURSE).map(([k, v]) => [k, v.lektionen.map((l) => l.id)]));
  } finally { rmSync(datei, { force: true }); }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const lek = await videoLektionen();
  writeFileSync(resolve(wurzel, "src/videoLeicht.js"), `/* Erzeugt von scripts/video-leicht.mjs – nicht von Hand ändern (Test: tests/videoLeicht.test.mjs).
   Je Videokurs die Lektions-IDs in Reihenfolge (Kurskarten brauchen nur Anzahl und nächste Lektion). */
export const VIDEO_LEKTIONEN = ${JSON.stringify(lek)};
`);
  console.log(`src/videoLeicht.js: ${Object.keys(lek).length} Kurse, ${Object.values(lek).reduce((s, l) => s + l.length, 0)} Lektionen`);
}
