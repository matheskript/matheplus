/* Gold Level im Ableitungstrainer („Ableiten üben“): Kombinationen aus allen Regeln, Stufe 1–5.
   Jede Stufe liefert echte Aufgaben (kein Rückfall auf x²·sin(x)), mehrere Hauptregeln und eine Musterlösung,
   die numerisch mit der Ableitung von f übereinstimmt. */
import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEER = ["ttf", "woff", "woff2", "jpg", "jpeg", "png", "css", "svg", "webp", "gif", "mp4", "pdf"];

let K;
test.before(async () => {
  const datei = path.join(wurzel, "node_modules", `.gold-test-${process.pid}.mjs`);
  await build({
    entryPoints: [path.join(wurzel, "src/regelwerkKern.js")],
    bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error",
    loader: { ".js": "jsx", ...Object.fromEntries(LEER.map((e) => [`.${e}`, "empty"])) },
    external: ["react", "react-dom", "@supabase/supabase-js"],
    define: { "import.meta.env": JSON.stringify({ DEV: false }) },
  });
  try { K = await import(pathToFileURL(datei).href); } finally { rmSync(datei, { force: true }); }
});

for (let st = 1; st <= 5; st++) {
  test(`Gold Level Stufe ${st}: echte Aufgaben, mehrere Hauptregeln, Lösung stimmt`, () => {
    const arten = new Set();
    for (let i = 0; i < 300; i++) {
      const a = K.neueAufgabe("gold", st);
      assert.ok(!(a.uText === "x^2" && a.vText === "sin(x)"), `Stufe ${st}: Rückfallaufgabe`);
      arten.add(a.regel);
      const ml = K.musterloesung(a.regel, a.u, a.v);
      assert.ok(ml && ml.ergebnis, `Stufe ${st}: keine Musterlösung für ${a.uText} | ${a.vText}`);
      assert.ok(K.gleichwertig(ml.ergebnis, ml.soll), `Stufe ${st}: Ergebnis falsch für ${a.uText} | ${a.vText}`);
    }
    assert.ok(arten.size >= 3, `Stufe ${st}: nur ${[...arten]}`);
  });
}

test("Stufen über 3 bleiben bei den einzelnen Regeln auf Stufe 3", () => {
  const a = K.neueAufgabe("produkt", 5);
  assert.equal(a.regel, "produkt");
});
