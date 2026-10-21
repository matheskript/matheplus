/* ======================================================================
   Leichter Formel-Index für die Suche (21.10.2026): src/fsLeicht.js enthält je Formel nur
   id, n, k, g, bereich (54 kB statt 500 kB) – damit die Suche nicht die ganze Formelsammlung
   ins Startbündel zieht. Nach jeder Änderung an fs*.js ausführen:  node scripts/fs-leicht.mjs
   Wächter: tests/fsLeicht.test.mjs (schlägt an, wenn die Datei veraltet ist).
   ====================================================================== */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FS_ALLE, FS_BEREICHE } from "../src/fsIndex.js";

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const leicht = FS_ALLE.map((f) => ({ id: f.id, n: f.n, k: f.k || "", g: f.g || "", bereich: f.bereich }));
const bereiche = FS_BEREICHE.map((b) => ({ id: b.id, name: b.name, kurz: b.kurz || "" }));
writeFileSync(resolve(wurzel, "src/fsLeicht.js"), `/* Erzeugt von scripts/fs-leicht.mjs – nicht von Hand ändern (Test: tests/fsLeicht.test.mjs).
   Leichter Index der Formelsammlung für die Suche: nur Name, Kurzform, Stichwörter, Bereich. */
export const FS_LEICHT = ${JSON.stringify(leicht)};
export const FS_BEREICHE_LEICHT = ${JSON.stringify(bereiche)};
`);
console.log(`src/fsLeicht.js: ${leicht.length} Formeln`);
