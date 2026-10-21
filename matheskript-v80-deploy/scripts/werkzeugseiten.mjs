/* ======================================================================
   Vorgerenderte Seiten für Google und KI-Crawler (läuft nach vite build
   und formelseiten.mjs). GPTBot, ClaudeBot, PerplexityBot führen meist kein
   JavaScript aus – ohne diese Seiten sähen sie eine leere App.

   1. Für jedes Werkzeug dist/werkzeug-seiten/<pfad>.html und für jede Hub-Seite
      (Startseite → start.html, Trainingszentrum, Vision, Analysis, Vektoren, Stochastik):
      die gebaute App-Hülle (dist/index.html, gleiche Skripte) mit Titel, Beschreibung,
      Canonical, Open Graph (mit Bild aus public/og/), JSON-LD und dem Text als statischem
      Inhalt in #root. React ersetzt ihn beim Start durch die App.
      Die Middleware (middleware.js) liefert diese Dateien für /<pfad> und / aus.
   2. dist/sitemap.xml (mit lastmod), dist/robots.txt (Sperrliste statt Freigabeliste,
      KI-Crawler ausdrücklich erlaubt), dist/llms.txt (Übersicht) und dist/llms-full.txt (alle Texte).

   Sichtbarkeit: Solange SEO_OEFFENTLICH nicht "ja" ist, tragen die Seiten noindex
   (und die Middleware setzt X-Robots-Tag: noindex). Mit SEO_OEFFENTLICH=ja und
   SEITEN_SCHUTZ=aus (Vercel → Environment Variables, neu deployen) sind sie indexierbar.

   `node scripts/werkzeugseiten.mjs --pfade` schreibt nur src/seo/pfade.js (Liste für die Middleware).
   ====================================================================== */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { SEO_SEITEN, HUB_SEITEN, HUBS, seoText, seiteHtml, hubHtml, jsonLd, hubJsonLd, verwandteVon, hubBereiche, bereichVon, entitaet, steckbrief, esc, BASIS_URL, MARKE } from "../src/seo/index.js";
import { WERKZEUGE } from "../src/werkzeuge.js";

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = process.env.DIST_ORDNER ? resolve(process.env.DIST_ORDNER) : resolve(wurzel, "dist");
const BASIS = (process.env.SEO_BASIS_URL || BASIS_URL).replace(/\/$/, "");
const OEFFENTLICH = (process.env.SEO_OEFFENTLICH || "").toLowerCase() === "ja";
const FORMELN_OEFFENTLICH = (process.env.FORMELN_OEFFENTLICH || "").toLowerCase() === "ja";
const seiten = SEO_SEITEN();
const hubs = HUB_SEITEN();

/* Liste für die Middleware (klein, ohne Abhängigkeiten) */
const pfadeDatei = `/* Erzeugt von scripts/werkzeugseiten.mjs --pfade – nicht von Hand ändern (Test: tests/seo.test.mjs).
   Pfade, für die es eine vorgerenderte Seite gibt (dist/werkzeug-seiten/<pfad>.html); die Startseite heißt "start". */
export const SEO_PFADE = new Set(${JSON.stringify(seiten.map((s) => s.pfad).sort(), null, 2)});
export const HUB_PFADE = new Set(${JSON.stringify(hubs.map((h) => h.pfad || "start").sort(), null, 2)});
`;
writeFileSync(resolve(wurzel, "src/seo/pfade.js"), pfadeDatei);
if (process.argv.includes("--pfade")) { console.log(`src/seo/pfade.js: ${seiten.length} Werkzeug-Pfade, ${hubs.length} Hubs`); process.exit(0); }

/* lastmod/dateModified: letzte Änderung der Textdatei laut Git, sonst Build-Datum */
const heute = new Date().toISOString().slice(0, 10);
function gitDatum(datei) {
  try { return execSync(`git log -1 --format=%cs -- "${datei}"`, { cwd: wurzel, stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || heute; } catch (e) { return heute; }
}
const DATUM_TEXTE = {};
for (const f of ["texteAnalysis", "texteGrundlagen", "texteGeometrie", "texteVektorenStochastik", "texteUnterstufe", "hubs"]) DATUM_TEXTE[f] = gitDatum(`src/seo/${f}.js`);
const quelleVon = (id) => { const b = bereichVon(id); const bid = b ? b.id : ""; return ["analysis"].includes(bid) ? "texteAnalysis" : ["vektoren", "stochastik"].includes(bid) ? "texteVektorenStochastik" : ["geometrie"].includes(bid) ? "texteGeometrie" : ["zahlen", "prozent", "daten", "bruchrechnen"].includes(bid) ? "texteUnterstufe" : "texteGrundlagen"; };

const huelle = readFileSync(resolve(DIST, "index.html"), "utf8");
const ROBOTS_ALT = /(?:<!--[^>]*Suchmaschinen[^>]*-->\s*)?<meta name="robots"[^>]*>\s*<meta name="googlebot"[^>]*>/;
if (!ROBOTS_ALT.test(huelle) || !huelle.includes('<div id="root"></div>') || !huelle.includes("<title>")) throw new Error("dist/index.html hat nicht die erwartete Form");

const ogBild = (pfad) => {
  const name = pfad || "start";
  return existsSync(resolve(wurzel, "public", "og", `${name}.png`)) ? `${BASIS}/og/${name}.png` : `${BASIS}/og/start.png`;
};
const kopf = (titel, beschreibung, url, bild, ld) => `<meta name="robots" content="${OEFFENTLICH ? "index, follow, max-snippet:-1, max-image-preview:large" : "noindex, nofollow"}">
    <meta name="description" content="${esc(beschreibung)}">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website"><meta property="og:site_name" content="${MARKE}">
    <meta property="og:title" content="${esc(titel)}"><meta property="og:description" content="${esc(beschreibung)}"><meta property="og:url" content="${url}">
    <meta property="og:image" content="${bild}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(titel)}"><meta name="twitter:description" content="${esc(beschreibung)}"><meta name="twitter:image" content="${bild}">
    <meta property="og:locale" content="de_DE">
    <script type="application/ld+json">${ld}</script>`;
/* Titel ohne Suffix (bis 60 Zeichen; die Marke steht in og:site_name und im JSON-LD) */
const seiteSchreiben = (pfad, titel, beschreibung, url, ld, inhalt) => {
  const html = huelle
    .replace(ROBOTS_ALT, kopf(titel, beschreibung, url, ogBild(pfad), ld))
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(titel)}</title>`)
    .replace('<div id="root"></div>', `<div id="root">${inhalt}</div>`);
  const ziel = resolve(DIST, "werkzeug-seiten", `${pfad || "start"}.html`);
  mkdirSync(dirname(ziel), { recursive: true });
  writeFileSync(ziel, html);
};

mkdirSync(resolve(DIST, "werkzeug-seiten"), { recursive: true });
const urls = [];
for (const s of seiten) {
  const t = seoText(s.id);
  const url = `${BASIS}/${s.pfad}`;
  const datum = DATUM_TEXTE[quelleVon(s.id)];
  seiteSchreiben(s.pfad, t.titel, t.beschreibung, url, jsonLd(t, url, { datum }), seiteHtml(t, verwandteVon(s.id, seiten)));
  urls.push({ url, datum, prio: WERKZEUGE[s.id].etikett === "trainieren" ? "0.8" : "0.7" });
}
for (const h of hubs) {
  const H = HUBS[h.id];
  const url = h.pfad ? `${BASIS}/${h.pfad}` : `${BASIS}/`;
  const bereiche = hubBereiche(H, seiten);
  const alle = bereiche.flatMap((b) => b.werkzeuge);
  seiteSchreiben(h.pfad, H.titel, H.beschreibung, url, hubJsonLd(H, url, alle, { datum: DATUM_TEXTE.hubs }), hubHtml(H, bereiche));
  urls.push({ url, datum: DATUM_TEXTE.hubs, prio: h.pfad ? "0.9" : "1.0" });
}

/* Sitemap: Formelseiten (falls vorhanden) + Hubs + Werkzeuge, mit lastmod */
const alt = [];
if (FORMELN_OEFFENTLICH && existsSync(resolve(DIST, "sitemap.xml"))) {
  for (const m of readFileSync(resolve(DIST, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)) alt.push({ url: m[1], datum: heute, prio: "0.5" });
}
const sitemap = [...alt, ...(OEFFENTLICH ? urls : [])];
writeFileSync(resolve(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((u) => `  <url><loc>${u.url}</loc><lastmod>${u.datum}</lastmod><priority>${u.prio}</priority></url>`).join("\n")}
</urlset>
`);

/* robots.txt: Sperrliste (Privates), alles andere erlaubt; KI-Crawler ausdrücklich erlaubt. Vor dem Livegang: alles gesperrt. */
const PRIVAT = ["/api/", "/konto", "/dokumente", "/druck/", "/entwurf", "/__zugang", "/archiv/", "/mein-mathe-training", "/spenden", "/masterclass/zugang", "/klausurbriefkasten"];
const KI_CRAWLER = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "Amazonbot", "Bytespider", "meta-externalagent"];
const robots = OEFFENTLICH
  ? `User-agent: *\n${PRIVAT.map((p) => `Disallow: ${p}`).join("\n")}\nAllow: /\n\n${KI_CRAWLER.map((k) => `User-agent: ${k}\nAllow: /\n`).join("\n")}\nSitemap: ${BASIS}/sitemap.xml\n`
  : FORMELN_OEFFENTLICH ? `User-agent: *\nAllow: /formeln/\nAllow: /assets/\nDisallow: /\n\nSitemap: ${BASIS}/sitemap.xml\n` : "User-agent: *\nDisallow: /\n";
writeFileSync(resolve(DIST, "robots.txt"), robots);

/* llms.txt: Übersicht für KI-Assistenten (https://llmstxt.org); llms-full.txt: alle Texte */
const kopfText = `# ${MARKE}

> Mathe-Coaching und kostenlose Lern-App für Gymnasiasten von Klasse 5 bis zum Abitur (Bildungsplan Baden-Württemberg, Konstanz). ${seiten.length} interaktive Übungswerkzeuge mit Rechenweg und sofortiger Rückmeldung, Mathilda AI prüft fotografierte Rechnungen. Leitidee: Mathetalent ist ein Mythos – System + Freude = Erfolg. Gründer: Basti Blumenröther.

## Bereiche

${hubs.filter((h) => h.pfad).map((h) => `- [${HUBS[h.id].h1}](${BASIS}/${h.pfad}): ${HUBS[h.id].beschreibung}`).join("\n")}
`;
writeFileSync(resolve(DIST, "llms.txt"), `${kopfText}
## Werkzeuge

${seiten.map((s) => { const t = seoText(s.id); return `- [${WERKZEUGE[s.id].name}](${BASIS}/${s.pfad}): ${t.beschreibung}`; }).join("\n")}
`);
writeFileSync(resolve(DIST, "llms-full.txt"), `${kopfText}
${hubs.map((h) => { const H = HUBS[h.id]; return `## ${H.h1} (${h.pfad ? `${BASIS}/${h.pfad}` : `${BASIS}/`})\n\n${H.kurz}\n\n${H.text.join("\n\n")}\n\n${H.faq.map((q) => `**${q.f}** ${q.a}`).join("\n\n")}`; }).join("\n\n")}

${seiten.map((s) => { const t = seoText(s.id); return `## ${WERKZEUGE[s.id].name} (${BASIS}/${s.pfad})\n\n${entitaet(t)}\n\n${steckbrief(t).map(([k, v]) => `- ${k}: ${v}`).join("\n")}\n\n${t.text.join("\n\n")}${t.beispiel ? `\n\n### Beispiel mit Lösungsweg\n\nAufgabe: ${t.beispiel.aufgabe}\n\n${t.beispiel.schritte.map((z, i) => `${i + 1}. ${z}`).join("\n")}\n\nErgebnis: ${t.beispiel.ergebnis}` : ""}\n\n${t.faq.map((q) => `**${q.f}** ${q.a}`).join("\n\n")}`; }).join("\n\n")}
`);

console.log(`Vorgerendert: ${seiten.length} Werkzeug-Seiten + ${hubs.length} Hubs, Sitemap (${sitemap.length} URLs), robots.txt, llms.txt, llms-full.txt – ${OEFFENTLICH ? "ÖFFENTLICH" : "geschützt (noindex)"}`);
