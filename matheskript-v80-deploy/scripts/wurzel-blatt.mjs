/* Kontaktbogen der Wurzel-Motion (Kopfrechnen √10k) – Werkzeug für die Entwicklung, nicht Teil der App.
   node scripts/wurzel-blatt.mjs [beispiele, z. B. 3025,5329] [ausgabeordner]
   · rendert wurzelZeichne (funcErklaeranimation.jsx) jede Sekunde-Marke aus ZEITEN unten
   · meldet NaN/Infinity/undefined im SVG
   · schreibt <ausgabe>/wurzel-<N>.html und, falls Playwright da ist, wurzel-<N>.png */
import { build } from "esbuild";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const hier = path.dirname(fileURLToPath(import.meta.url));
const wurzel = path.resolve(hier, "..");
const beispiele = (process.argv[2] || "3025,5329").split(",").map(Number);
const aus = path.resolve(process.argv[3] || "/tmp/wurzel-blatt");
mkdirSync(aus, { recursive: true });

const eintrag = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { wurzelZeichne } from "./src/funcErklaeranimation.jsx";
import { wurzelInfo, wurzelSchritte, wurzelZeiten } from "./src/wurzelMotion.js";
export function lauf(N, zeiten) {
  const I = wurzelInfo(N), sch = wurzelSchritte(I);
  return zeiten.map((t) => {
    const svg = renderToStaticMarkup(React.createElement("svg", { viewBox: "0 0 360 490", xmlns: "http://www.w3.org/2000/svg", width: 360, height: 490 }, wurzelZeichne(t, I)));
    const i = sch.reduce((a, s, k) => (t >= s.von - 0.001 ? k : a), 0);
    return { t, svg, schritt: i + 1, fehler: /NaN|Infinity|undefined/.test(svg) };
  });
}
export { wurzelZeiten, wurzelInfo };`;
const datei = path.join(wurzel, "node_modules", `.wurzel-lauf-${process.pid}.mjs`);
await build({ stdin: { contents: eintrag, resolveDir: wurzel, loader: "jsx" }, bundle: true, platform: "node", format: "esm", outfile: datei, jsx: "transform",
  loader: { ".js": "jsx" }, logLevel: "error", external: ["react", "react-dom", "react-dom/server"], define: { "import.meta.env": "{}" },
  /* Bilder, Schriften, CSS usw. aus der App braucht die Zeichnung nicht – leer einbinden */
  plugins: [{ name: "leer", setup(b) {
    b.onResolve({ filter: /\.(webp|png|jpe?g|gif|svg|ttf|woff2?|mp3|mp4|webm|pdf|css)(\?.*)?$/ }, (a) => ({ path: a.path, namespace: "leer" }));
    b.onLoad({ filter: /.*/, namespace: "leer" }, () => ({ contents: "export default \"\";", loader: "js" }));
  } }] });
const { lauf } = await import(pathToFileURL(datei).href + "?" + Date.now());
rmSync(datei, { force: true });

const ZEITEN = [3, 7, 12, 15, 17.5, 21.8, 24.5, 28.3, 31.5, 35.5, 40, 42.5, 45, 47.5, 50, 53, 56, 59.9];
const schrift = ["600", "700", "800"].map((g) => {
  const f = path.join(wurzel, "node_modules/@fontsource/montserrat/files", `montserrat-latin-${g}-normal.woff2`);
  return existsSync(f) ? `@font-face{font-family:Montserrat;font-weight:${g};src:url(file://${f})}` : "";
}).join("");
let fehler = 0;
for (const N of beispiele) {
  const bilder = lauf(N, ZEITEN);
  fehler += bilder.filter((b) => b.fehler).length;
  writeFileSync(path.join(aus, `wurzel-${N}.html`), `<!doctype html><meta charset="utf-8"><style>${schrift}
body{font-family:Montserrat,Arial,sans-serif;margin:12px;background:#fff;width:2280px}.r{display:flex;flex-wrap:wrap;gap:8px}
.b{width:360px;border:1px solid #ddd;border-radius:8px;padding:4px;background:#FAF6EC}.b p{font-size:12px;margin:2px 0 0;color:#333}</style>
<h2 style="font-size:15px">√${N}</h2><div class="r">${bilder.map((b) => `<div class="b">${b.svg}<p>${b.t} s · Schritt ${b.schritt}${b.fehler ? " · FEHLER" : ""}</p></div>`).join("")}</div>`);
}
try {
  execFileSync("python3", ["-c", `
import sys, glob
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(); s = b.new_page(viewport={"width": 2300, "height": 900})
    for f in sorted(glob.glob(sys.argv[1] + "/wurzel-*.html")):
        s.goto("file://" + f); s.wait_for_timeout(300); s.screenshot(path=f.replace(".html", ".png"), full_page=True)
    b.close()
`, aus], { stdio: "inherit" });
} catch (x) { console.log("(keine PNGs: " + x.message + ")"); }
console.log(`${beispiele.length} Beispiele in ${aus}${fehler ? ` – ${fehler} Bilder mit NaN/undefined` : " – keine Fehler"}`);
if (fehler) process.exitCode = 1;
