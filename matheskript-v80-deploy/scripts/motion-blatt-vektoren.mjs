/* Kontaktbogen der Vektoren-Animationen (Hesse-Normalenform; Werkzeug für die Entwicklung, nicht Teil der App).
   node scripts/motion-blatt-vektoren.mjs [filter] [ausgabeordner]
     filter: Szenenname (v_normalenform, v_hnf; leer = beide)
   · rendert jede Szene mit den Parametern der Seite (P_LEER aus funcHesse.jsx) zu 8 Zeitpunkten (0 … 100 %)
     und zusätzlich einmal je Abschnitt (Mitte und Ende des Abschnitts) – so sieht man jeden Untertitel mit seinem Bild
   · meldet Fehler (Ausnahmen, NaN/Infinity/undefined im SVG, Untertitel > 75 Zeichen, frage/kern aus MOTION_TEXTE
     in funcHesse.jsx fehlt oder verletzt die Norm: frage ≤ 70 Zeichen mit „?“, kern 20–130 Zeichen)
   · schreibt <ausgabe>/blatt-<szene>.html, <ausgabe>/abschnitte-<szene>.html und, falls Playwright da ist, PNGs */
import { build } from "esbuild";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const hier = path.dirname(fileURLToPath(import.meta.url));
const wurzel = path.resolve(hier, "..");
const filter = process.argv[2] || "";
const aus = path.resolve(process.argv[3] || "/tmp/motion-blatt-vektoren");
mkdirSync(aus, { recursive: true });

/* P_LEER und MOTION_TEXTE aus funcHesse.jsx lesen (nicht die ganze Seite bündeln – sie zieht halb die App mit) */
const hesse = readFileSync(path.join(wurzel, "src/funcHesse.jsx"), "utf8");
const literal = (name) => {
  const m = hesse.match(new RegExp("const " + name + " = (\\{[^\\n]*?\\}|\\{[\\s\\S]*?\\n\\});"));
  if (!m) throw new Error(name + " in funcHesse.jsx nicht gefunden");
  return m[1];
};
const P_LEER_QUELLE = literal("P_LEER"), TEXTE = new Function("return " + literal("MOTION_TEXTE"))();
new Function("return " + P_LEER_QUELLE)();   // wirft, wenn P_LEER kein reines Objekt-Literal ist

const eintrag = `
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SZENEN_VEKTOREN } from "./src/motion/szenenVektoren.jsx";
import { zeitplan, fortschritt, untertitel, B } from "./src/motion/kern.jsx";
export function lauf(filter, TEXTE) {
  const fehler = [], karten = [];
  const P_LEER = ${P_LEER_QUELLE};
  for (const [name, S] of Object.entries(SZENEN_VEKTOREN)) {
    if (filter && name !== filter) continue;
    let plan;
    try { plan = zeitplan(S.ablauf(P_LEER)); } catch (x) { fehler.push(name + ": ablauf: " + x.message); continue; }
    for (const a of plan.abschnitte) if (a.text && a.text.length > 75) fehler.push(name + "/" + a.k + ": Untertitel " + a.text.length + " Zeichen");
    const tx = TEXTE[name] || {};
    if (!tx.frage || tx.frage.length > 70 || !tx.frage.trim().endsWith("?")) fehler.push(name + ": frage fehlt, > 70 Zeichen oder ohne „?“");
    if (tx.frage && /\u20D7/.test(tx.frage)) fehler.push(name + ": frage mit Vektorpfeil (der Abspieler setzt ihn dort nicht)");
    if (!tx.kern || tx.kern.length < 20 || tx.kern.length > 130) fehler.push(name + ": kern fehlt oder nicht 20–130 Zeichen (" + (tx.kern || "").length + ")");
    const bild = (t) => {
      const { Z, z } = fortschritt(plan, t);
      const svg = renderToStaticMarkup(React.createElement("svg", { viewBox: "0 0 " + B + " " + S.h, xmlns: "http://www.w3.org/2000/svg", width: 360, height: S.h }, S.bild({ Z, z, p: P_LEER, t })));
      if (/NaN|Infinity|undefined/.test(svg)) fehler.push(name + " @" + Math.round(t) + " ms: NaN/undefined im SVG");
      return { svg, text: untertitel(plan, t) };
    };
    const bilder = [], abschnitte = [];
    for (let i = 0; i < 8; i++) {
      const q = i / 7, t = plan.dauer * q;
      try { bilder.push({ titel: Math.round(q * 100) + " %", ...bild(t) }); } catch (x) { fehler.push(name + " @" + q + ": " + x.message); }
    }
    for (const a of plan.abschnitte) {
      for (const [lage, t] of [["Mitte", (a.start + a.ende) / 2], ["Ende", a.ende - 1]]) {
        try { abschnitte.push({ titel: a.k + " · " + lage + " (" + Math.round(a.start / 100) / 10 + "–" + Math.round(a.ende / 100) / 10 + " s)", ...bild(t) }); }
        catch (x) { fehler.push(name + "/" + a.k + ": " + x.message); }
      }
    }
    karten.push({ name, dauer: plan.dauer, frage: tx.frage || "", kern: tx.kern || "", abschnitteZahl: plan.abschnitte.length, bilder, abschnitte,
      plan: plan.abschnitte.map((a) => a.k + ": " + Math.round(a.ms) + " ms" + (a.text ? " (" + a.text.length + " Z.)" : "")) });
  }
  return { fehler, karten };
}`;
const datei = path.join(wurzel, "node_modules", `.motion-lauf-vek-${process.pid}.mjs`);
await build({ stdin: { contents: eintrag, resolveDir: wurzel, loader: "jsx" }, bundle: true, platform: "node", format: "esm", outfile: datei, jsx: "transform",
  loader: { ".js": "jsx" }, logLevel: "error", external: ["react", "react-dom", "react-dom/server"] });
const { lauf } = await import(pathToFileURL(datei).href + "?" + Date.now());
const { fehler, karten } = lauf(filter, TEXTE);
rmSync(datei, { force: true });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const seite = (k, bilder, breite) => `<!doctype html><meta charset="utf-8"><style>
body{font-family:Montserrat,Arial,sans-serif;margin:16px;background:#fff;width:${breite}px}
h2{font-size:14px;margin:0 0 8px}.r{display:flex;flex-wrap:wrap;gap:8px}
.b{width:360px;border:1px solid #eee;border-radius:8px;padding:4px}.b p{font-size:11px;margin:4px 0 0;color:#333;min-height:30px}.b b{color:#004D98}
</style><h2>${esc(k.name)} <small>(${Math.round(k.dauer / 100) / 10} s, ${k.abschnitteZahl} Abschnitte)</small></h2><p style="font-size:12px;margin:0 0 8px"><b>Frage:</b> ${esc(k.frage)}<br><b>Das Wichtigste:</b> ${esc(k.kern)}</p><div class="r">${bilder.map((b) => `<div class="b">${b.svg}<p><b>${esc(b.titel)}</b> · ${esc(b.text)}</p></div>`).join("")}</div>`;
for (const k of karten) {
  writeFileSync(path.join(aus, `blatt-${k.name}.html`), seite(k, k.bilder, 1500));
  writeFileSync(path.join(aus, `abschnitte-${k.name}.html`), seite(k, k.abschnitte, 1500));
  console.log(`${k.name}: ${Math.round(k.dauer / 100) / 10} s\n  ${k.plan.join("\n  ")}`);
}
try {
  execFileSync("python3", ["-c", `
import sys, glob
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(); s = b.new_page(viewport={"width": 1540, "height": 900})
    for f in sorted(glob.glob(sys.argv[1] + "/*.html")):
        s.goto("file://" + f); s.screenshot(path=f.replace(".html", ".png"), full_page=True)
    b.close()
`, aus], { stdio: "inherit" });
} catch (x) { console.log("(keine PNGs: " + x.message + ")"); }
console.log(`${karten.length} Szenen in ${aus}`);
if (fehler.length) { console.log("FEHLER:\n" + fehler.join("\n")); process.exitCode = 1; } else console.log("keine Fehler");
