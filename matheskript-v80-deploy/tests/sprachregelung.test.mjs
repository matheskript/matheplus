/* Wächter für die Sprachregelung der Werkzeuge (21.10.2026):
   · Modus-Wörter in Werkzeugen sind nur Entdecken · Rechnen · Trainieren (die drei Etiketten)
   · eine Stufenskala: Stufe 1 · 2 · 3
   · Deutsch, ein Gattungsname: „Werkzeug“ (kein Tools, Basics, Advanced, Gold Level, Automatik)
   · „Kurs“ nur für Lack-Kacheln; Band-Gruppen heißen Bereiche
   Geprüft werden Oberflächentexte in src/*.jsx (JSX-Text, Strings in zw()/L()/Listen), keine Kommentare. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { ETIKETTEN, WERKZEUGE } from "../src/werkzeuge.js";

const ohneKommentare = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
const dateien = readdirSync("src").filter((f) => f.endsWith(".jsx") && !/^funcStartArchiv|^funcVorher/.test(f));
const quelle = (f) => ohneKommentare(readFileSync(`src/${f}`, "utf8"));

/* Verbotene Oberflächenwörter: Muster, die nur in Texten vorkommen (JSX-Text, Strings als Beschriftung) */
const VERBOTEN = [
  [/"Automatik"/, "„Automatik“ → Rechnen"],
  [/\["training", (?:zw\()?"Training"/, "Modus „Training“ → Trainieren"],
  [/zw\("Üben", "Practise"\)/, "Modus „Üben“ → Trainieren"],
  [/>Tools<|"Tools"\s*[},\]]|name: "Tools"/, "„Tools“ → Werkzeuge"],
  [/"Basics"|>Basics</, "„Basics“ → Grundlagen"],
  [/>Advanced<|"Advanced"/, "„Advanced“ → Beliebige Funktionen"],
  [/Gold Level/, "„Gold Level“ → Stufe 3"],
  [/Deine Kurse|Weitere Kurse|Kurs wechseln/, "Band-Gruppen heißen Bereiche"],
  [/name: "Einfach"|"Knifflig"|"Profi"|zw\("Vertiefung"/, "Stufenskala ist Stufe 1 · 2 · 3"],
  [/Head & Numbers(?! · )/, "„Head & Numbers“ heißt Kopfrechnen"],   // „Head & Numbers · …“ ist der Speicher-Schlüssel der Statistik
];

test("Keine verbotenen Oberflächenwörter in den Werkzeugen", () => {
  const treffer = [];
  for (const f of dateien) {
    const q = quelle(f);
    for (const [re, warum] of VERBOTEN) if (re.test(q)) treffer.push(`${f}: ${warum}`);
  }
  assert.deepEqual(treffer, [], treffer.join("\n"));
});

test("Die Etiketten sind die drei Modus-Wörter", () => {
  assert.deepEqual(Object.values(ETIKETTEN).map((e) => e.name), ["Entdecken", "Rechnen", "Trainieren"]);
});

test("Werkzeugnamen: Deutsch, kein vs., kein Visualizer", () => {
  for (const [id, w] of Object.entries(WERKZEUGE)) {
    assert.ok(!/vs\.|Visualizer|Basics|Advanced|Tool\b/.test(`${w.name} ${w.zeile} ${w.kurz}`), `${id}: ${w.name} – ${w.zeile}`);
  }
});
