/* Wächter für den Startchunk (Trainingstools G, 21.10.2026): Diese Module dürfen von main.jsx aus nicht
   statisch erreichbar sein – sie laden über lazyLaden() erst mit ihrer Ansicht. Wer einen neuen statischen
   Import einbaut, der eines davon mitzieht, sieht hier die Kette. Messen: npx vite build → dist/assets/index-*.js
   (Stand 23.10.: 1,28 MB / 396 kB gzip; 21.10.: 1,5 MB / 482 kB; vorher 3,4 MB / 1,4 MB). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src") + "/";
const RE = /^\s*(?:import|export)\s[^;]*?from\s*["'](\.[^"']+)["']|^\s*import\s*["'](\.[^"']+)["']/gm;

function abhaengigkeiten(datei) {
  let quelle; try { quelle = fs.readFileSync(SRC + datei, "utf8"); } catch { return []; }
  const aus = [];
  for (const m of quelle.matchAll(RE)) {
    let p = path.normalize(path.join(path.dirname(datei), m[1] || m[2]));
    if (!fs.existsSync(SRC + p)) for (const e of [".js", ".jsx", "/index.js"]) if (fs.existsSync(SRC + p + e)) { p += e; break; }
    aus.push(p);
  }
  return aus;
}
function statischerGraph(start = "main.jsx") {
  const eltern = { [start]: null }; const warte = [start];
  while (warte.length) { const f = warte.shift(); for (const d of abhaengigkeiten(f)) if (!(d in eltern)) { eltern[d] = f; warte.push(d); } }
  return eltern;
}
const kette = (eltern, ziel) => { const k = []; let x = ziel; while (x) { k.push(x); x = eltern[x]; } return k.reverse().join(" → "); };

/* Große Ansichten und Daten, die nur ihre eigene Seite braucht */
const NICHT_IM_START = [
  "func4.jsx", "func5.jsx", "func7.jsx", "func8.jsx", "func9.jsx", "func12.jsx", "func14.jsx",
  "funcRegelwerk.jsx", "funcErklaeranimation.jsx", "funcGraphenUebung.jsx", "funcHilfe.jsx", "fsIndex.js", "fsAnalysis.js",
  "funcEbbinghaus.jsx", "funcTraining.jsx", "perfKern.js", "funcQuickfinder.jsx", "funcHauptthema.jsx", "funcKapitelTraining.jsx",
  "funcOnboarding.jsx", "funcHeuteKarte.jsx", "funcMathildaSeite.jsx", "funcMathildaZyklus.jsx", "funcBlattScanner.jsx",
  "funcHauptmenueDesktop.jsx", "funcStartseite.jsx", "funcRecht.jsx", "funcArbeitsmenue.jsx", "kanalSeiten.js",
  "unterstufeDaten.js", "unterstufeDaten5.js", "unterstufeDaten6.js", "funcWettbewerbe.jsx", "deutschlandKarte.js",
  "funcDiffqTrainer.jsx", "diffqKern.js", "formelEngine.js", "regelwerkKern.js",
  /* Schnitt 23.10. (482 → 396 kB gzip): Suchindex beim ersten Fokus, Lernstand-Komponenten und großer Editor mit
     ihrer Ansicht (Speicherschicht in lernStand.js), Videokurse über videoLeicht.js, Mathilda-Gedächtnis beim
     Analysieren, Menübild, GFS-Kopf, Stadion-Farben und englische Zusatzdaten nur bei Bedarf */
  "suche.js", "fsLeicht.js", "func6.jsx", "func15.jsx", "base5.jsx", "mathildaKontext.js", "lernpfade.js",
  "funcMathildaBild.jsx", "funcGfsThemenKopf.jsx", "stadionGold.js", "kdEnglisch.js", "i18n/mindsetEn.js",
];

test("Startchunk: große Ansichten sind von main.jsx nicht statisch erreichbar (lazyLaden)", () => {
  const eltern = statischerGraph();
  const treffer = NICHT_IM_START.filter((m) => m in eltern).map((m) => kette(eltern, m));
  assert.deepEqual(treffer, [], `Statisch im Startchunk:\n${treffer.join("\n")}`);
});

test("Startchunk: der statische Graph bleibt klein", () => {
  const n = Object.keys(statischerGraph()).length;
  assert.ok(n <= 125, `${n} Module statisch von main.jsx erreichbar (Stand 23.10.: 103)`);
});
