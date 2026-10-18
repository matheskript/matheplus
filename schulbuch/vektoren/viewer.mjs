// Baut aus dist/buch.html das blätterbare Buch für die App: dist/viewer/
// Aufruf: node viewer.mjs <pfad-zu-matheskript-v80-deploy>
import fs from "node:fs";
import path from "node:path";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const APP = process.argv[2];
const { pfadFuer } = await import(path.join(APP, "src/pfade.js"));
const DIST = path.join(ROOT, "dist");
const OUT = path.join(DIST, "viewer");
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(path.join(DIST, "fonts"), path.join(OUT, "fonts"), { recursive: true });
fs.copyFileSync(path.join(DIST, "katex.css"), path.join(OUT, "katex.css"));
fs.copyFileSync(path.join(DIST, "Vektoren.pdf"), path.join(OUT, "Vektoren.pdf"));

// Sprungziele aus den „In der App“-Kästen
const ZIELE = [
  ["Rechnen mit Vektoren", "vektorgenerator"], ["Zwei Punkte", "zweipunkte"], ["Drei Punkte", "dreipunkte"],
  ["Ebenen-Visualizer", "ebenen"], ["Geraden im Raum", "geraden"], ["Ebene vs. Ebene", "ebenevsebene"],
  ["Abstände", "abstaende"], ["Kreuzprodukt", "kreuzprodukt"], ["Winkel und Skalarprodukt", "winkel"],
  ["Gleichungssysteme", "lgs"], ["Werkzeug Geraden", "geradengleichung"], ["Werkzeug  Geraden", "geradengleichung"], ["Abi-Ketten", "abiketten"],
  ["Formelsammlung", "formeln"], ["Meine Fehler üben", "fehlertraining"], ["Mathilda", { ansicht: "analyse", foto: "blatt" }],
];
let html = fs.readFileSync(path.join(DIST, "buch.html"), "utf8");
let sprungZahl = 0;
html = html.replace(/<div class="notiz mathilda">([\s\S]*?)<\/div>/g, (ganz, inhalt) => {
  const text = inhalt.replace(/<[^>]+>/g, " ");
  const treffer = ZIELE.find(([wort]) => text.includes(wort));
  if (!treffer) return ganz;
  const ziel = typeof treffer[1] === "string" ? { ansicht: treffer[1] } : treffer[1];
  const pfad = pfadFuer(ziel);
  if (!pfad) throw new Error("Kein Pfad für " + JSON.stringify(ziel));
  sprungZahl++;
  return `<div class="notiz mathilda">${inhalt}<a class="appsprung" href="${pfad}" data-ziel='${JSON.stringify(ziel)}' target="_top">In der App öffnen →</a></div>`;
});

// Inhaltsverzeichnis aus den Seiten
const seiten = JSON.parse(fs.readFileSync(path.join(DIST, "seiten.json"), "utf8"));
const inhalt = [];
for (const s of seiten) {
  const titel = s.datei.includes("cover") ? "Titel" : s.datei.includes("rueckseite") ? "Rückseite"
    : s.typ === "auftakt" ? `Kapitel ${s.kap} · Auftakt` : (s.ukap || "");
  if (!titel) continue;
  if (inhalt.length && inhalt[inhalt.length - 1].titel === titel) continue;
  inhalt.push({ titel, seite: s.nr, kap: s.kap });
}

const kopf = `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="stylesheet" href="viewer.css">`;
const leiste = `<div id="leiste">
  <button id="knInhalt" class="kn" aria-label="Inhaltsverzeichnis"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 6h16M4 12h16M4 18h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Inhalt</span></button>
  <div id="anzeige"><b>Vektoren, Geraden und Ebenen</b><span id="seitenText"></span></div>
  <div class="rechts">
    <button id="knLupe" class="kn rund" aria-label="Vergrößern"><svg viewBox="0 0 24 24" width="19" height="19"><circle cx="10.5" cy="10.5" r="6" stroke="currentColor" stroke-width="2" fill="none"/><path d="M15 15l5 5M8 10.5h5M10.5 8v5" id="lupePlus" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    <button id="knZurueck" class="kn rund" aria-label="Zurückblättern"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <button id="knWeiter" class="kn rund" aria-label="Weiterblättern"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <a id="knPdf" class="kn" href="Vektoren.pdf" download><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span>PDF</span></a>
  </div>
</div>
<div id="schleier"></div>
<nav id="inhalt" aria-label="Inhaltsverzeichnis"><div class="inhalt-kopf">Inhalt</div><ol>${inhalt.map((e) => `<li><button data-seite="${e.seite}" class="kap-${e.kap}"><span>${e.titel}</span><i>${e.seite}</i></button></li>`).join("")}</ol></nav>
<div id="buehne"><div id="aufschlag"></div></div>
<div id="fuss"><input id="regler" type="range" min="1" max="${seiten.length}" value="1" aria-label="Seite wählen"></div>`;

html = html.replace("<title>", kopf + "<title>")
  .replace(/<body>/, "<body class=\"viewer\">" + leiste + "<div id=\"vorrat\">")
  .replace("</body>", "</div><script src=\"viewer.js\"></script></body>");
fs.writeFileSync(path.join(OUT, "index.html"), html);
fs.copyFileSync(path.join(ROOT, "viewer.css"), path.join(OUT, "viewer.css"));
fs.copyFileSync(path.join(ROOT, "viewer.js"), path.join(OUT, "viewer.js"));
fs.writeFileSync(path.join(OUT, "inhalt.json"), JSON.stringify(inhalt, null, 1));
console.log(`Viewer: ${seiten.length} Seiten, ${inhalt.length} Inhaltseinträge, ${sprungZahl} App-Sprünge.`);
