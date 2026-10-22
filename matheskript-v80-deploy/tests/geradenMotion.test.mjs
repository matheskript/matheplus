/* Animationen „Gerade durch zwei Punkte“: g_zweipunkte (Geradentrainer, y = mx + c) und v_zweipunkte (Vektoren, x⃗ = p⃗ + t · u⃗).
   Motion-Norm (src/motion/NORM.md): frage ≤ 70 Zeichen mit „?“, kern 20–130 Zeichen, Untertitel ≤ 75 Zeichen, 8–26 s,
   jedes Bild ohne NaN/undefined; eingebaut in beide Werkzeuge; Zahlen passen zur Rechnung des Werkzeugs. */
import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { GERADEN_MOTION } from "../src/motion/medienGeraden.js";
import { geradePQ, bWert } from "../src/geradenLogik.js";

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const quelle = (d) => readFileSync(path.join(wurzel, d), "utf8");

test("Texte nach der Motion-Norm", () => {
  assert.deepEqual(Object.keys(GERADEN_MOTION).sort(), ["g_zweipunkte", "v_zweipunkte"]);
  for (const [name, tx] of Object.entries(GERADEN_MOTION)) {
    assert.ok(tx.titel, name);
    assert.ok(tx.frage.length <= 70 && tx.frage.trim().endsWith("?"), `${name}: frage`);
    assert.ok(!/⃗/.test(tx.frage), `${name}: frage ohne Vektorpfeil`);
    assert.ok(tx.kern.length >= 20 && tx.kern.length <= 130, `${name}: kern ${tx.kern.length} Zeichen`);
    assert.ok(!/:innen|\*innen/.test(tx.frage + tx.kern));
  }
});

test("beide Szenen: Dauer 8–26 s, Untertitel ≤ 75 Zeichen, saubere Bilder", async () => {
  const datei = path.join(wurzel, "node_modules", `.geraden-motion-${process.pid}.mjs`);
  await build({
    stdin: { contents: `
      import React from "react";
      import { renderToStaticMarkup } from "react-dom/server";
      export { SZENEN } from "./src/funcUnterstufeMotion.jsx";
      export { zeitplan, fortschritt, B } from "./src/motion/kern.jsx";
      export { React, renderToStaticMarkup };`, resolveDir: wurzel, loader: "jsx" },
    bundle: true, platform: "node", format: "esm", outfile: datei, loader: { ".js": "jsx" }, logLevel: "error",
    external: ["react", "react-dom", "react-dom/server"],
  });
  try {
    const { SZENEN, zeitplan, fortschritt, B, React, renderToStaticMarkup } = await import(pathToFileURL(datei).href);
    for (const name of ["g_zweipunkte", "v_zweipunkte"]) {
      const S = SZENEN[name];
      assert.ok(S, `${name} fehlt im Abspieler`);
      const plan = zeitplan(S.ablauf({}));
      assert.ok(plan.dauer >= 8000 && plan.dauer <= 26000, `${name}: ${plan.dauer} ms`);
      for (const a of plan.abschnitte) assert.ok(!a.text || a.text.length <= 75, `${name}/${a.k}: ${a.text}`);
      for (let i = 0; i <= 40; i++) {
        const t = (plan.dauer * i) / 40, { Z, z } = fortschritt(plan, t);
        const svg = renderToStaticMarkup(React.createElement("svg", { viewBox: `0 0 ${B} ${S.h}` }, S.bild({ Z, z, p: {}, t })));
        assert.ok(!/NaN|Infinity|undefined/.test(svg), `${name} @${Math.round(t)} ms`);
      }
    }
  } finally { rmSync(datei, { force: true }); }
});

test("Zahlen stimmen mit dem Werkzeug überein", () => {
  /* Geradentrainer öffnet mit P(1 | 3), Q(3 | 7) → m = 2, c = 1 */
  const g = geradePQ([1, 3], [3, 7]);
  assert.equal(bWert(g.m), 2);
  assert.equal(bWert(g.c), 1);
  assert.match(quelle("src/funcGeradengleichung.jsx"), /useState\(\{ P: \[1, 3\], Q: \[3, 7\] \}\)/);
  const gz = quelle("src/motion/szenenGeraden.jsx");
  assert.match(gz, /const P = \[1, 3\], Q = \[3, 7\]/);
  assert.match(gz, /y = 2x \+ 1/);
  /* Vektoren: A(1 | 1 | 2), B(2 | 5 | 4) → AB⃗ = (1 | 4 | 2) */
  const vz = quelle("src/motion/szenenVektoren.jsx");
  assert.match(vz, /const ZA = \[1, 1, 2\], ZB = \[2, 5, 4\], ZU = sub\(ZB, ZA\)/);
  assert.match(vz, /\(2 − 1 \| 5 − 1 \| 4 − 2\)/);
});

test("eingebaut: Geradentrainer (Zwei Punkte, Handy und Desktop) und Vektoren „Zwei Punkte – eine Gerade“", () => {
  const ger = quelle("src/funcGeradengleichung.jsx"), v = quelle("src/func23.jsx");
  assert.equal((ger.match(/<GeradenMotion szene="g_zweipunkte"/g) || []).length, 2);
  assert.equal((v.match(/<GeradenMotion szene="v_zweipunkte"/g) || []).length, 2);
  for (const q of [ger, v]) assert.match(q, /React\.lazy\(\(\) => import\("\.\/funcGeradenMotion\.jsx"\)/);
});
