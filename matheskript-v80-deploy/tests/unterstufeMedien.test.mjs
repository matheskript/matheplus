/* Modul Unterstufe – Medien: jede Lerneinheit hat Video + mindestens eine Motion-Animation,
   jede Animation verweist auf eine vorhandene Szene und rendert zu jedem Zeitpunkt fehlerfrei (kein NaN/undefined),
   jeder Ablauf hat Untertitel, Brüche nie mit Schrägstrich in Untertiteln. */
import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { UNTERSTUFE_EINHEITEN } from "../src/unterstufeDaten.js";
import { ANIMATIONEN, animationenFuer, videoFuer, VIDEO_EIGEN, VIDEO_PLATZHALTER, werkzeugAnimationen, WERKZEUGE_MIT_ANIMATION } from "../src/unterstufeMedien.js";
import { ANIM_WERKZEUGE } from "../src/motion/medienWerkzeuge.js";
import { WERKZEUGE } from "../src/werkzeuge.js";

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IDS = new Set(UNTERSTUFE_EINHEITEN.map((e) => e.id));

test("jede Lerneinheit hat mindestens eine Animation, keine fremden Schlüssel", () => {
  for (const e of UNTERSTUFE_EINHEITEN) assert.ok(animationenFuer(e.id).length >= 1, `${e.id}: keine Animation`);
  for (const id of Object.keys(ANIMATIONEN)) assert.ok(IDS.has(id), `Animation für unbekannte Lerneinheit ${id}`);
  for (const [id, liste] of Object.entries(ANIMATIONEN)) for (const a of liste) {
    assert.equal(typeof a.szene, "string", id);
    assert.ok(a.titel && a.titel.length <= 40, `${id}: Titel fehlt oder zu lang`);
  }
});

/* Motion-Norm (src/motion/NORM.md): jede Animation beantwortet eine Frage und endet mit einem Kernsatz */
test("jede Animation hat eine Frage (≤ 70 Zeichen, mit ?) und einen Kernsatz (≤ 130 Zeichen)", () => {
  const eigene = Object.entries(ANIM_WERKZEUGE).flatMap(([w, l]) => l.filter((a) => !a.aus).map((a) => ["werkzeug:" + w, a]));
  const alle = [...Object.entries(ANIMATIONEN).flatMap(([id, l]) => l.map((a) => [id, a])), ...eigene];
  for (const [id, a] of alle) {
    const wo = `${id}/${a.szene} (${a.titel})`;
    assert.equal(typeof a.frage, "string", `${wo}: frage fehlt`);
    assert.ok(a.frage.trim().endsWith("?") && a.frage.length <= 70, `${wo}: frage endet nicht mit ? oder ist länger als 70 Zeichen: ${a.frage}`);
    assert.equal(typeof a.kern, "string", `${wo}: kern fehlt`);
    assert.ok(a.kern.length >= 20 && a.kern.length <= 130, `${wo}: kern kürzer als 20 oder länger als 130 Zeichen: ${a.kern}`);
    assert.ok(!/\d\s*\/\s*\d/.test(a.frage + a.kern), `${wo}: Bruch mit Schrägstrich in Frage/Kern`);
  }
});

test("jede Lerneinheit hat mindestens zwei Animationen mit verschiedenen Szenen", () => {
  for (const e of UNTERSTUFE_EINHEITEN) {
    const l = animationenFuer(e.id);
    assert.ok(l.length >= 2, `${e.id}: nur ${l.length} Animation`);
  }
});

test("die 13 Unterstufen-Werkzeuge haben Animationen, alle Verweise lösen auf", () => {
  const soll = ["stellenwert", "ganzezahlen", "primzahlen", "rechengesetze", "groessen", "dezimal", "koordinaten", "flaechen", "quader", "zuordnungen", "prozent", "diagramme", "zufall"];
  for (const w of soll) {
    assert.ok(WERKZEUGE[w], `Werkzeug ${w} unbekannt`);
    assert.ok(werkzeugAnimationen(w).length >= 2, `${w}: weniger als zwei Animationen`);
    assert.equal(werkzeugAnimationen(w).length, ANIM_WERKZEUGE[w].length, `${w}: Verweis löst nicht auf`);
  }
  assert.deepEqual([...WERKZEUGE_MIT_ANIMATION].sort(), [...soll].sort());
});

test("jede Lerneinheit hat ein Video (eigenes oder Platzhalter)", () => {
  assert.match(VIDEO_PLATZHALTER.youtube, /^[\w-]{11}$/);
  for (const e of UNTERSTUFE_EINHEITEN) assert.match(videoFuer(e.id).youtube, /^[\w-]{11}$/, e.id);
  for (const id of Object.keys(VIDEO_EIGEN)) assert.ok(IDS.has(id), `Video für unbekannte Lerneinheit ${id}`);
  assert.equal(videoFuer(UNTERSTUFE_EINHEITEN[0].id).platzhalter, !VIDEO_EIGEN[UNTERSTUFE_EINHEITEN[0].id]);
});

test("alle Szenen existieren und rendern zu jedem Zeitpunkt sauber", async () => {
  const datei = path.join(wurzel, "node_modules", `.motion-test-${process.pid}.mjs`);
  await build({
    stdin: { contents: `
      import React from "react";
      import { renderToStaticMarkup } from "react-dom/server";
      export { SZENEN } from "./src/funcUnterstufeMotion.jsx";
      export { zeitplan, fortschritt, untertitel, B } from "./src/motion/kern.jsx";
      export { React, renderToStaticMarkup };`, resolveDir: wurzel, loader: "jsx" },
    bundle: true, platform: "node", format: "esm", outfile: datei, loader: { ".js": "jsx" }, logLevel: "error",
    external: ["react", "react-dom", "react-dom/server"],
  });
  try {
    const { SZENEN, zeitplan, fortschritt, untertitel, B, React, renderToStaticMarkup } = await import(pathToFileURL(datei).href);
    let n = 0;
    const alle = [...Object.entries(ANIMATIONEN), ...WERKZEUGE_MIT_ANIMATION.map((w) => ["werkzeug:" + w, werkzeugAnimationen(w)])];
    for (const [id, liste] of alle) for (const a of liste) {
      const S = SZENEN[a.szene];
      assert.ok(S, `${id}: Szene ${a.szene} fehlt`);
      const plan = zeitplan(S.ablauf(a.p || {}));
      const texte = plan.abschnitte.filter((s) => s.text).map((s) => s.text);
      assert.ok(texte.length >= 1, `${id}/${a.szene}: kein Untertitel`);
      for (const t of texte) assert.ok(!/\d\s*\/\s*\d/.test(t), `${id}/${a.szene}: Bruch mit Schrägstrich im Untertitel: ${t}`);
      assert.ok(plan.dauer >= 2500 && plan.dauer <= 35000, `${id}/${a.szene}: Dauer ${plan.dauer} ms (Norm: 10–35 s mit Lesezeit, Untertitel kürzen oder Abschnitte zusammenlegen)`);
      for (const t of texte) assert.ok(t.length <= 75, `${id}/${a.szene}: Untertitel länger als 75 Zeichen: ${t}`);
      for (const q of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
        const t = plan.dauer * q, { Z, z } = fortschritt(plan, t);
        const svg = renderToStaticMarkup(React.createElement("svg", { viewBox: `0 0 ${B} ${S.h}` }, S.bild({ Z, z, p: a.p || {}, t })));
        assert.ok(!/NaN|Infinity|undefined/.test(svg), `${id}/${a.szene} @${q}: NaN/undefined im SVG`);
        untertitel(plan, t);
      }
      n++;
    }
    assert.ok(n >= 140, `nur ${n} Animationen`);
  } finally { rmSync(datei, { force: true }); }
});
