/* Kontaktbogen der Unterstufen-Animationen (Werkzeug für die Entwicklung, nicht Teil der App).
   node scripts/motion-blatt.mjs [filter] [ausgabeordner]
     filter: Teil einer Lerneinheit-Id oder Szenenname (leer = alle)
   · rendert jede Animation jeder passenden Lerneinheit zu 5 Zeitpunkten (0 %, 25 %, 50 %, 75 %, 100 %)
   · meldet Fehler (Ausnahmen, NaN/Infinity/undefined im SVG, fehlende Szenen, fehlender Untertitel)
   · schreibt <ausgabe>/blatt.html und, falls Playwright da ist, PNGs je 6 Lerneinheiten (blatt-1.png …) */
import { build } from "esbuild";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const hier = path.dirname(fileURLToPath(import.meta.url));
const wurzel = path.resolve(hier, "..");
const filter = process.argv[2] || "";
const aus = path.resolve(process.argv[3] || "/tmp/motion-blatt");
mkdirSync(aus, { recursive: true });

const eintrag = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SZENEN } from "./src/funcUnterstufeMotion.jsx";
import { zeitplan, fortschritt, untertitel, B } from "./src/motion/kern.jsx";
import { animationenFuer } from "./src/unterstufeMedien.js";
import { UNTERSTUFE_EINHEITEN } from "./src/unterstufeDaten.js";
export function lauf(filter) {
  const fehler = [], karten = [];
  for (const e of UNTERSTUFE_EINHEITEN) {
    const anims = animationenFuer(e.id);
    if (!anims.length) { if (!filter) fehler.push(e.id + ": keine Animation"); continue; }
    for (const a of anims) {
      if (filter && !e.id.includes(filter) && a.szene !== filter) continue;
      const S = SZENEN[a.szene];
      if (!S) { fehler.push(e.id + ": Szene fehlt: " + a.szene); continue; }
      let plan;
      try { plan = zeitplan(S.ablauf(a.p || {})); } catch (x) { fehler.push(e.id + "/" + a.szene + ": ablauf: " + x.message); continue; }
      if (!plan.abschnitte.some((s) => s.text)) fehler.push(e.id + "/" + a.szene + ": kein Untertitel");
      const bilder = [];
      for (const q of [0, 0.25, 0.5, 0.75, 1]) {
        const t = plan.dauer * q;
        try {
          const { Z, z } = fortschritt(plan, t);
          const svg = renderToStaticMarkup(React.createElement("svg", { viewBox: "0 0 " + B + " " + S.h, xmlns: "http://www.w3.org/2000/svg", width: 360, height: S.h }, S.bild({ Z, z, p: a.p || {}, t })));
          if (/NaN|Infinity|undefined/.test(svg)) fehler.push(e.id + "/" + a.szene + " @" + q + ": NaN/undefined im SVG");
          bilder.push({ q, svg, text: untertitel(plan, t) });
        } catch (x) { fehler.push(e.id + "/" + a.szene + " @" + q + ": " + x.message); }
      }
      karten.push({ id: e.id, titel: e.titel, anim: a.titel || a.szene, szene: a.szene, dauer: plan.dauer, bilder });
    }
  }
  return { fehler, karten };
}`;
const datei = path.join(wurzel, "node_modules", `.motion-lauf-${process.pid}.mjs`);
await build({ stdin: { contents: eintrag, resolveDir: wurzel, loader: "jsx" }, bundle: true, platform: "node", format: "esm", outfile: datei, jsx: "transform",
  loader: { ".js": "jsx" }, logLevel: "error", external: ["react", "react-dom", "react-dom/server"] });
const { lauf } = await import(pathToFileURL(datei).href + "?" + Date.now());
const { fehler, karten } = lauf(filter);
rmSync(datei, { force: true });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const seite = (liste) => `<!doctype html><meta charset="utf-8"><style>
body{font-family:Montserrat,Arial,sans-serif;margin:16px;background:#fff;width:1880px}
.k{margin:0 0 18px;padding:10px;border:1px solid #ddd;border-radius:10px}
.k h2{font-size:14px;margin:0 0 6px}.r{display:flex;gap:8px}
.b{width:360px;border:1px solid #eee;border-radius:8px;padding:4px}.b p{font-size:11px;margin:4px 0 0;color:#333;min-height:28px}
</style>${liste.map((k) => `<div class="k"><h2>${esc(k.id)} · ${esc(k.anim)} <small>(${k.szene}, ${Math.round(k.dauer / 100) / 10} s)</small></h2><div class="r">${k.bilder.map((b) => `<div class="b">${b.svg}<p>${Math.round(b.q * 100)} % · ${esc(b.text)}</p></div>`).join("")}</div></div>`).join("")}`;
writeFileSync(path.join(aus, "blatt.html"), seite(karten));
const N = 6, bloecke = [];
for (let i = 0; i < karten.length; i += N) bloecke.push(karten.slice(i, i + N));
bloecke.forEach((b, i) => writeFileSync(path.join(aus, `blatt-${i + 1}.html`), seite(b)));
try {
  execFileSync("python3", ["-c", `
import sys, glob
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(); s = b.new_page(viewport={"width": 1920, "height": 900})
    for f in sorted(glob.glob(sys.argv[1] + "/blatt-*.html")):
        s.goto("file://" + f); s.screenshot(path=f.replace(".html", ".png"), full_page=True)
    b.close()
`, aus], { stdio: "inherit" });
} catch (x) { console.log("(keine PNGs: " + x.message + ")"); }
console.log(`${karten.length} Animationen, ${bloecke.length} Bögen in ${aus}`);
if (fehler.length) { console.log("FEHLER:\n" + fehler.join("\n")); process.exitCode = 1; } else console.log("keine Fehler");
