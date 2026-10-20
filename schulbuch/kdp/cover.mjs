// Umschlag für Amazon KDP: eine Datei mit Rückseite + Buchrücken + Vorderseite, mit 3,2 mm Beschnitt.
// Vorderseite = pages/01-cover.html, Rückseite = pages/99-rueckseite.html des Buchs (so bleibt die Gestaltung eine).
// Aufruf im Buchordner: node ../kdp/cover.mjs  (liest kdp.json, dist-kdp/buch.html und dist-kdp/seiten.json)
// Danach: python3 ../kdp/render-cover.py  → dist-kdp/Umschlag.pdf
// Maße (KDP): Breite = Beschnitt + 210 + Rücken + 210 + Beschnitt, Höhe = 297 + 2 · Beschnitt,
// Rücken = Seitenzahl · 0,0596 mm (Farbdruck auf weißem Papier). Rückentext erst ab 80 Seiten – hier nur Farbe.
import fs from "node:fs";
import path from "node:path";
import { qrSvg } from "../qr.mjs";

const ROOT = process.cwd();
const K = JSON.parse(fs.readFileSync(path.join(ROOT, "kdp.json"), "utf8"));
const DIST = path.join(ROOT, process.env.DIST || "dist-kdp");
const buch = fs.readFileSync(path.join(DIST, "buch.html"), "utf8");
const seitenZahl = (buch.match(/<section class="page/g) || []).length;
const BLEED = 3.2, RUECKEN = Math.round(seitenZahl * 0.0596 * 100) / 100;
const BREITE = 2 * BLEED + 420 + RUECKEN, HOEHE = 297 + 2 * BLEED;

const seite = (datei) => fs.readFileSync(path.join(ROOT, "pages", datei), "utf8").replace(/^<!--[\s\S]*?-->\s*/, "");
const css = /<style>([\s\S]*?)<\/style>/.exec(buch)[1];
// Formeln ($…$) sind im fertigen Buch schon gesetzt – wir nehmen die gerenderten Seiten aus buch.html
const sektion = (datei) => { const m = new RegExp(`<section class="page frei[^"]*"[^>]*data-datei="${datei}"[^>]*>([\\s\\S]*?)</section>`).exec(buch); if (!m) throw new Error("Seite fehlt: " + datei); return m[1]; };
let vorn = sektion("01-cover.html");
let hinten = sektion("99-rueckseite.html");
// Rückseite: Fußzeile nach oben, damit unten rechts Platz für den Barcode bleibt (KDP setzt ihn selbst: 2" × 1,2")
hinten = hinten.replace("bottom:20mm;display:flex", "bottom:66mm;display:flex").replace("bottom:52mm;text-align:center", "bottom:92mm;text-align:center");
const qr = await qrSvg("/");
hinten = hinten.replace(/<\/div>\s*$/, `
  <div style="position:absolute;left:${24 + BLEED}mm;bottom:${18 + BLEED}mm;display:flex;align-items:center;gap:5mm;color:#D6E0F2;font-size:9.2pt;line-height:1.5;max-width:100mm">
    <div style="background:#fff;border-radius:2mm;padding:1.6mm;flex:0 0 auto">${qr.replace("<svg", '<svg style="width:24mm;height:24mm;display:block"')}</div>
    <div><b style="color:#EDBB00;font-size:11pt;display:block;margin-bottom:1mm">mythosmathe.de</b>Werkzeuge, Trainer und der Kurs zu diesem Buch – kostenlos, im Browser. Jede Aufgabe im Buch trägt einen QR-Code für neue Übungsblätter.</div>
  </div>
  <div style="position:absolute;right:${22 + BLEED}mm;bottom:${14 + BLEED}mm;width:54mm;height:33mm;background:#fff;border-radius:1.5mm"></div>
</div>`);

const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Umschlag – ${K.titel}</title>
<link rel="stylesheet" href="katex.css"><style>${css}
@page { size: ${BREITE}mm ${HOEHE}mm; margin: 0; }
html, body { background: #0E1E4A; }
.umschlag { position: relative; width: ${BREITE}mm; height: ${HOEHE}mm; background: #0E1E4A; overflow: hidden; margin: 0; }
.umschlag .page { position: absolute; top: 0; width: ${210 + BLEED}mm; height: ${HOEHE}mm; margin: 0; box-shadow: none; }
.umschlag .hinten { left: 0; }
.umschlag .vorn { right: 0; }
.umschlag .ruecken { position: absolute; top: 0; left: ${BLEED + 210}mm; width: ${RUECKEN}mm; height: 100%; background: #0E1E4A; }
/* Kapitelbänder laufen in den Beschnitt */
.umschlag .hinten > div > div:first-child + div, .umschlag .hinten > div > div:first-child { width: ${7 + BLEED}mm; }
.umschlag .vorn > div > div:first-child + div, .umschlag .vorn > div > div:first-child { width: ${7 + BLEED}mm; }
</style></head><body>
<div class="umschlag">
  <section class="page frei hinten">${hinten}</section>
  <div class="ruecken"></div>
  <section class="page frei vorn">${vorn}</section>
</div>
</body></html>`;
fs.writeFileSync(path.join(DIST, "umschlag.html"), html);
fs.writeFileSync(path.join(DIST, "umschlag.json"), JSON.stringify({ seiten: seitenZahl, ruecken_mm: RUECKEN, breite_mm: BREITE, hoehe_mm: HOEHE, beschnitt_mm: BLEED }, null, 1));
console.log(`Umschlag: ${seitenZahl} Seiten, Rücken ${RUECKEN} mm, Blatt ${BREITE} × ${HOEHE} mm → ${path.relative(ROOT, DIST)}/umschlag.html`);
