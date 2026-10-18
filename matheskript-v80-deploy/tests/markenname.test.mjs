/* Wächter: Schreibweise der Marke „MathildaAI“ (festes Corporate Design)
   Mathilda mit großem M und sonst klein (weiß auf dunklem Grund), AI groß und in Gold – nie „MATHILDA“, nie „MathildaAI“ per Versalien.
   Im Code läuft das über <MathildaName /> bzw. mitMathildaAI() aus src/mathildaName.jsx. */
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const dateien = readdirSync(SRC).filter((f) => /\.(jsx|js)$/.test(f));
const zeilenVon = (f) => readFileSync(join(SRC, f), "utf8").split("\n").map((z, i) => [i + 1, z]);

test("Mathilda wird nie in Versalien gesetzt (kein MATHILDA, kein uppercase auf derselben Zeile)", () => {
  const funde = [];
  for (const f of dateien) {
    for (const [nr, z] of zeilenVon(f)) {
      if (/\bMATHILDA\b(?!_)/.test(z)) funde.push(`${f}:${nr} enthält „MATHILDA“`);
      if (/Mathilda/.test(z) && /(textTransform\s*:\s*["']uppercase|text-transform\s*:\s*uppercase|toUpperCase)/.test(z)) funde.push(`${f}:${nr} setzt Mathilda in Versalien`);
    }
  }
  assert.deepEqual(funde, []);
});

test("Wortmarke nur über MathildaName: kein handgebautes Mathilda<span>AI</span>", () => {
  const funde = [];
  for (const f of dateien) {
    if (f === "mathildaName.jsx") continue;
    for (const [nr, z] of zeilenVon(f)) {
      if (/Mathilda\s*<span[^>]*>\s*AI\s*<\/span>/.test(z)) funde.push(`${f}:${nr} baut die Wortmarke von Hand`);
    }
  }
  assert.deepEqual(funde, []);
});

test("MathildaName: Mathilda weiß (auf dunkel), AI in Gold, keine Versalien", () => {
  const q = readFileSync(join(SRC, "mathildaName.jsx"), "utf8");
  assert.match(q, />Mathilda<\/span>/);
  assert.match(q, />AI<\/span>/);
  assert.match(q, /#FFFFFF/);
  assert.match(q, /#EDBB00/);
  assert.match(q, /textTransform: "none"/);
});
