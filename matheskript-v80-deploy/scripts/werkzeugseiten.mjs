/* ======================================================================
   Vorgerenderte Werkzeug-Seiten für Google und KI-Crawler (läuft nach vite build
   und formelseiten.mjs). GPTBot, ClaudeBot, PerplexityBot führen meist kein
   JavaScript aus – ohne diese Seiten sähen sie eine leere App.

   1. Für jedes Werkzeug dist/werkzeug-seiten/<pfad>.html: die gebaute App-Hülle
      (dist/index.html, gleiche Skripte) mit Titel, Beschreibung, Canonical,
      Open Graph, JSON-LD (LearningResource + FAQPage + Autor) und dem Text als
      statischem Inhalt in #root. React ersetzt ihn beim Start durch die App.
      Die Middleware (middleware.js) liefert diese Datei für /<pfad> aus.
   2. dist/sitemap.xml, dist/robots.txt (Formelseiten + Werkzeuge) und dist/llms.txt.

   Sichtbarkeit: Solange SEO_OEFFENTLICH nicht "ja" ist, tragen die Seiten noindex
   (und die Middleware setzt X-Robots-Tag: noindex). Mit SEO_OEFFENTLICH=ja und
   SEITEN_SCHUTZ=aus (Vercel → Environment Variables, neu deployen) sind sie indexierbar.

   `node scripts/werkzeugseiten.mjs --pfade` schreibt nur src/seo/pfade.js (Liste für die Middleware).
   ====================================================================== */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_SEITEN, seoText, seiteHtml, jsonLd, verwandteVon, esc, BASIS_URL } from "../src/seo/index.js";
import { WERKZEUGE } from "../src/werkzeuge.js";

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = process.env.DIST_ORDNER ? resolve(process.env.DIST_ORDNER) : resolve(wurzel, "dist");
const BASIS = (process.env.SEO_BASIS_URL || BASIS_URL).replace(/\/$/, "");
const OEFFENTLICH = (process.env.SEO_OEFFENTLICH || "").toLowerCase() === "ja";
const FORMELN_OEFFENTLICH = (process.env.FORMELN_OEFFENTLICH || "").toLowerCase() === "ja";
const seiten = SEO_SEITEN();

/* Liste für die Middleware (klein, ohne Abhängigkeiten) */
const pfadeDatei = `/* Erzeugt von scripts/werkzeugseiten.mjs --pfade – nicht von Hand ändern (Test: tests/seo.test.mjs).
   Pfade, für die es eine vorgerenderte Werkzeug-Seite gibt (dist/werkzeug-seiten/<pfad>.html). */
export const SEO_PFADE = new Set(${JSON.stringify(seiten.map((s) => s.pfad).sort(), null, 2)});
`;
writeFileSync(resolve(wurzel, "src/seo/pfade.js"), pfadeDatei);
if (process.argv.includes("--pfade")) { console.log(`src/seo/pfade.js: ${seiten.length} Pfade`); process.exit(0); }

const huelle = readFileSync(resolve(DIST, "index.html"), "utf8");
const ROBOTS_ALT = /(?:<!--[^>]*Suchmaschinen[^>]*-->\s*)?<meta name="robots"[^>]*>\s*<meta name="googlebot"[^>]*>/;
if (!ROBOTS_ALT.test(huelle) || !huelle.includes('<div id="root"></div>') || !huelle.includes("<title>")) throw new Error("dist/index.html hat nicht die erwartete Form");

mkdirSync(resolve(DIST, "werkzeug-seiten"), { recursive: true });
for (const s of seiten) {
  const t = seoText(s.id);
  const url = `${BASIS}/${s.pfad}`;
  const kopf = `<meta name="robots" content="${OEFFENTLICH ? "index, follow, max-snippet:-1" : "noindex, nofollow"}">
    <meta name="description" content="${esc(t.beschreibung)}">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website"><meta property="og:site_name" content="Mythos Mathe">
    <meta property="og:title" content="${esc(t.titel)}"><meta property="og:description" content="${esc(t.beschreibung)}"><meta property="og:url" content="${url}">
    <meta property="og:locale" content="de_DE">
    <script type="application/ld+json">${jsonLd(t, url)}</script>`;
  const html = huelle
    .replace(ROBOTS_ALT, kopf)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(t.titel)} | Mythos Mathe</title>`)
    .replace('<div id="root"></div>', `<div id="root">${seiteHtml(t, verwandteVon(s.id, seiten))}</div>`);
  const ziel = resolve(DIST, "werkzeug-seiten", `${s.pfad}.html`);
  mkdirSync(dirname(ziel), { recursive: true });
  writeFileSync(ziel, html);
}

/* Sitemap: Formelseiten (falls vorhanden) + Werkzeuge */
const urls = [];
if (FORMELN_OEFFENTLICH && existsSync(resolve(DIST, "sitemap.xml"))) {
  for (const m of readFileSync(resolve(DIST, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(m[1]);
}
if (OEFFENTLICH) urls.push(...seiten.map((s) => `${BASIS}/${s.pfad}`));
writeFileSync(resolve(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`);
const erlaubt = [...(FORMELN_OEFFENTLICH ? ["/formeln/"] : []), ...(OEFFENTLICH ? seiten.map((s) => `/${s.pfad}$`) : [])];
writeFileSync(resolve(DIST, "robots.txt"), erlaubt.length
  ? `User-agent: *\n${erlaubt.map((a) => `Allow: ${a}`).join("\n")}\nAllow: /assets/\nDisallow: /\n\nSitemap: ${BASIS}/sitemap.xml\n`
  : "User-agent: *\nDisallow: /\n");

/* llms.txt: kurze Übersicht für KI-Assistenten (https://llmstxt.org) */
writeFileSync(resolve(DIST, "llms.txt"), `# Mythos Mathe

> Mathe-Coaching und kostenlose Lern-App für Gymnasiasten von Klasse 5 bis zum Abitur (Bildungsplan Baden-Württemberg). Interaktive Übungswerkzeuge mit Rechenweg und sofortiger Rückmeldung. Leitidee: Mathetalent ist ein Mythos – System + Freude = Erfolg.

## Werkzeuge

${seiten.map((s) => { const t = seoText(s.id); return `- [${WERKZEUGE[s.id].name}](${BASIS}/${s.pfad}): ${t.beschreibung}`; }).join("\n")}
`);

console.log(`Werkzeug-Seiten: ${seiten.length} Seiten, Sitemap (${urls.length} URLs), robots.txt, llms.txt – ${OEFFENTLICH ? "ÖFFENTLICH" : "geschützt (noindex)"}`);
