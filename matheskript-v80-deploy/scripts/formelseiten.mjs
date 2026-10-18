/* ======================================================================
   Öffentliche Formelseiten erzeugen (läuft nach `vite build`)
   1. `vite build --ssr src/ssr/formelSeitenSSR.jsx` → dist-ssr/
   2. Für jede Formel dist/formeln/<id>/index.html, dazu dist/formeln/index.html
   3. dist/sitemap.xml und dist/robots.txt

   Sichtbarkeit: Solange FORMELN_OEFFENTLICH nicht "ja" ist, tragen alle
   Seiten <meta name="robots" content="noindex"> und die Middleware schützt
   sie mit dem Seitenpasswort. Mit FORMELN_OEFFENTLICH=ja (Vercel →
   Environment Variables, danach neu deployen) werden /formeln/, die
   Sitemap und robots.txt ohne Passwort ausgeliefert und indexierbar.
   ====================================================================== */
import { build } from "vite";
import { mkdirSync, writeFileSync, readFileSync, rmSync, copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(wurzel, "dist"), SSR = resolve(wurzel, "dist-ssr");
const BASIS = (process.env.FORMELN_BASIS_URL || "https://mythosmathe.de").replace(/\/$/, "");
const OEFFENTLICH = (process.env.FORMELN_OEFFENTLICH || "").toLowerCase() === "ja";

await build({ root: wurzel, logLevel: "error", build: { ssr: "src/ssr/formelSeitenSSR.jsx", outDir: SSR, emptyOutDir: true, rollupOptions: { output: { format: "esm", entryFileNames: "formeln.mjs" } } } });
const { seiten, FARBEN: C } = await import(pathToFileURL(resolve(SSR, "formeln.mjs")).href);

const esc = (s) => String(s).replace(/[&<>"]/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[z]));

const rahmen = (s) => `<!doctype html>
<html lang="de"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(s.titel)}</title>
<meta name="description" content="${esc(s.beschreibung)}">
<meta name="robots" content="${OEFFENTLICH ? "index, follow" : "noindex, nofollow"}">
<link rel="canonical" href="${BASIS}${s.url}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(s.titel)}"><meta property="og:description" content="${esc(s.beschreibung)}"><meta property="og:url" content="${BASIS}${s.url}">
<meta name="theme-color" content="${C.seeTief}">
<link href="/formeln/schrift.css" rel="stylesheet">
${s.id ? `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "LearningResource", name: s.titel.split(" – ")[0], description: s.beschreibung,
    educationalLevel: "Sekundarstufe", inLanguage: "de", learningResourceType: "Formel mit Herleitung", isPartOf: { "@type": "WebSite", name: "Mythos Mathe", url: BASIS },
    about: s.bereich, url: `${BASIS}${s.url}` }).replace(/</g, "\\u003c")}</script>` : ""}
<style>
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:${C.sand};color:${C.tinte};font-family:Montserrat,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a:focus-visible{outline:2px solid ${C.flaggold};outline-offset:2px}
.kopf{background:${C.seeTief}}
.kopf a{display:block;max-width:720px;margin:0 auto;padding:14px 20px;text-decoration:none;font-weight:700;font-size:22px;letter-spacing:-.02em;text-transform:uppercase}
.s{background:linear-gradient(180deg,#fff 0%,${C.silberHell} 50%,${C.silber} 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.g{background:linear-gradient(180deg,#FFE58A 0%,${C.flaggold} 45%,${C.goldWarm} 70%,#A67C00 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
main{max-width:720px;margin:0 auto;padding:26px 20px 60px}
footer{max-width:720px;margin:0 auto;padding:0 20px 40px;font-size:12.5px;color:${C.grau}}
footer a{color:${C.see}}
svg{max-width:100%;height:auto}
.bild input,.bild button{pointer-events:none;opacity:.55}
</style></head>
<body>
<header class="kopf"><a href="/" aria-label="Zur Startseite von mythosmathe.de"><span class="s">mythos</span><span class="g">mathe</span><span class="s">.de</span></a></header>
<main>${s.html}</main>
<footer><a href="/formeln/">Alle Formeln</a> · <a href="/">mythosmathe.de</a> · Mathe-Coaching und Lern-App für Gymnasiasten<br><a href="/impressum">Impressum</a> · <a href="/datenschutz">Datenschutz</a></footer>
</body></html>
`;

/* Montserrat lokal ausliefern (keine Verbindung zu Google Fonts) */
const SCHRIFT_DIR = resolve(DIST, "formeln", "schrift");
mkdirSync(SCHRIFT_DIR, { recursive: true });
const GEWICHTE = [300, 400, 500, 600, 700, 800];
for (const w of GEWICHTE) copyFileSync(resolve(wurzel, "node_modules/@fontsource/montserrat/files", `montserrat-latin-${w}-normal.woff2`), resolve(SCHRIFT_DIR, `montserrat-${w}.woff2`));
writeFileSync(resolve(DIST, "formeln", "schrift.css"), GEWICHTE.map((w) =>
  `@font-face{font-family:Montserrat;font-style:normal;font-weight:${w};font-display:swap;src:url(/formeln/schrift/montserrat-${w}.woff2) format("woff2")}`).join("\n"));

const alle = seiten();
for (const s of alle) {
  const ziel = resolve(DIST, s.pfad);
  mkdirSync(dirname(ziel), { recursive: true });
  writeFileSync(ziel, rahmen(s));
}

const heute = new Date().toISOString().slice(0, 10);
writeFileSync(resolve(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${alle.map((s) => `  <url><loc>${BASIS}${s.url}</loc><lastmod>${heute}</lastmod><changefreq>monthly</changefreq><priority>${s.id ? "0.7" : "0.9"}</priority></url>`).join("\n")}
</urlset>
`);
writeFileSync(resolve(DIST, "robots.txt"), OEFFENTLICH
  ? `User-agent: *\nAllow: /formeln/\nDisallow: /\n\nSitemap: ${BASIS}/sitemap.xml\n`
  : "User-agent: *\nDisallow: /\n");

rmSync(SSR, { recursive: true, force: true });
console.log(`Formelseiten: ${alle.length} Seiten, Sitemap, robots.txt – ${OEFFENTLICH ? "ÖFFENTLICH" : "geschützt (noindex)"}`);
