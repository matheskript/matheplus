/* Klausurgenerator (func4.jsx): Zahl-Antworten dürfen exakt eingegeben werden – sqrt(3), 2√3, π/2, e^2, ln(2) –,
   nicht nur als gerundete Dezimalzahl. Terme mit Variable bleiben abgelehnt. */
import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEER = ["ttf", "woff", "woff2", "jpg", "jpeg", "png", "css", "svg", "webp", "gif", "mp4", "pdf"];
let zahlWert;

test.before(async () => {
  const eingang = path.join(wurzel, "node_modules", `.zahlwert-eingang-${process.pid}.js`);
  const datei = path.join(wurzel, "node_modules", `.zahlwert-test-${process.pid}.mjs`);
  writeFileSync(eingang, `export { zahlWert } from "../src/func4.jsx";\n`);
  await build({
    entryPoints: [eingang], bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error",
    loader: { ".js": "jsx", ...Object.fromEntries(LEER.map((e) => [`.${e}`, "empty"])) },
    external: ["react", "react-dom", "@supabase/supabase-js"],
    define: { "import.meta.env": JSON.stringify({ DEV: false }) },
  });
  ({ zahlWert } = await import(pathToFileURL(datei).href));
  rmSync(eingang); rmSync(datei);
});

test("exakte Werte werden gelesen", () => {
  const nah = (a, b) => assert.ok(a !== null && Math.abs(a - b) < 1e-12, `${a} ≠ ${b}`);
  nah(zahlWert("sqrt(3)"), Math.sqrt(3));
  nah(zahlWert("√3"), Math.sqrt(3));
  nah(zahlWert("2√3"), 2 * Math.sqrt(3));
  nah(zahlWert("√3/2"), Math.sqrt(3) / 2);
  nah(zahlWert("pi/2"), Math.PI / 2);
  nah(zahlWert("π"), Math.PI);
  nah(zahlWert("e^2"), Math.E ** 2);
  nah(zahlWert("ln(2)"), Math.LN2);
});

test("Dezimalzahlen und Brüche wie bisher, Variablen und Unsinn abgelehnt", () => {
  assert.equal(zahlWert("1,7321"), 1.7321);
  assert.equal(zahlWert("3/4"), 0.75);
  assert.equal(zahlWert("-2"), -2);
  assert.equal(zahlWert("x+1"), null);
  assert.equal(zahlWert("abc"), null);
  assert.equal(zahlWert(""), null);
});
