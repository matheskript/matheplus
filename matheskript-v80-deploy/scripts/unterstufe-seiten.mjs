/* ======================================================================
   Seiten des Moduls Unterstufe für pfade.js (21.10.2026): src/unterstufeSeiten.js enthält nur die
   Ids (klasse-5, klasse-6, jede Lerneinheit) – damit pfade.js nicht unterstufeDaten5/6 (180 kB)
   ins Startbündel zieht. Nach jeder Änderung an unterstufeDaten*.js ausführen:
     node scripts/unterstufe-seiten.mjs
   Wächter: tests/unterstufeSeiten.test.mjs (schlägt an, wenn die Datei veraltet ist).
   ====================================================================== */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { UNTERSTUFE_SEITEN } from "../src/unterstufeDaten.js";

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), "..");
writeFileSync(resolve(wurzel, "src/unterstufeSeiten.js"), `/* Erzeugt von scripts/unterstufe-seiten.mjs – nicht von Hand ändern (Test: tests/unterstufeSeiten.test.mjs).
   Seiten des Moduls Unterstufe: Klassenseiten und jede Lerneinheit (nur die Ids, für pfade.js). */
export const UNTERSTUFE_SEITEN = ${JSON.stringify(UNTERSTUFE_SEITEN)};
export const istUnterstufeSeite = (s) => UNTERSTUFE_SEITEN.includes(s);
`);
console.log(`src/unterstufeSeiten.js: ${UNTERSTUFE_SEITEN.length} Seiten`);
