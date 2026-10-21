/* ======================================================================
   IndexNow: Bing (und damit ChatGPT-Suche, Copilot, DuckDuckGo) nach einem Deploy über neue oder
   geänderte Seiten informieren. Google nutzt IndexNow nicht – dort reicht die Sitemap in der Search Console.

   Einrichten (einmalig, siehe claude/search-console-anleitung.md):
   1. Schlüssel erzeugen (32 Hex-Zeichen), z. B.  node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   2. Datei public/<schluessel>.txt anlegen, Inhalt = der Schlüssel; deployen.
   3. In Vercel INDEXNOW_SCHLUESSEL=<schluessel> setzen.

   Ausführen nach einem Deploy (lokal, mit gesetztem INDEXNOW_SCHLUESSEL):
     INDEXNOW_SCHLUESSEL=… node scripts/indexnow.mjs            → alle URLs der Sitemap
     INDEXNOW_SCHLUESSEL=… node scripts/indexnow.mjs /integrale → nur diese Pfade
   ====================================================================== */
const BASIS = (process.env.SEO_BASIS_URL || "https://mythosmathe.de").replace(/\/$/, "");
const schluessel = process.env.INDEXNOW_SCHLUESSEL;
if (!schluessel) { console.error("INDEXNOW_SCHLUESSEL fehlt (siehe Kopf dieser Datei)."); process.exit(1); }

const host = new URL(BASIS).host;
let urls = process.argv.slice(2).map((p) => `${BASIS}/${p.replace(/^\/+/, "")}`);
if (!urls.length) {
  const xml = await (await fetch(`${BASIS}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
if (!urls.length) { console.error("Keine URLs (Sitemap leer – SEO_OEFFENTLICH=ja gesetzt?)."); process.exit(1); }

const antwort = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key: schluessel, keyLocation: `${BASIS}/${schluessel}.txt`, urlList: urls.slice(0, 10000) }),
});
console.log(`IndexNow: ${urls.length} URLs gemeldet – Antwort ${antwort.status} ${antwort.statusText}`);
process.exit(antwort.ok ? 0 : 1);
