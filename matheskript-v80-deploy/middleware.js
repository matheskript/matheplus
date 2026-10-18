/* ======================================================================
   Passwortschutz für die ganze Seite (Vercel Routing Middleware).
   Ohne gültiges Zugangs-Cookie erscheint eine Passwortseite. Das Passwort
   kommt aus der Umgebungsvariablen SEITEN_PASSWORT, sonst gilt "mathe".
   Zum Abschalten: SEITEN_SCHUTZ=aus in Vercel setzen (oder Datei löschen).
   ====================================================================== */
import { next } from "@vercel/functions";

const COOKIE = "mm_zugang";
const COOKIE_WILLKOMMEN = "mm_willkommen";   // kurzes Cookie: die App zeigt danach 7 Sekunden die Willkommensseite (src/funcWillkommen.jsx)
const PFAD_LOGIN = "/__zugang";
const COOKIE_GAST = "mm_gast";   // für die App lesbar: Besucher ohne Passwort, der nur die Rechtsseiten sehen darf

/* Rechtsseiten und die Eltern-Einwilligung müssen immer erreichbar sein – auch während der Testphase.
   Die App (src/func10.jsx → gehe) schickt Gäste beim Weiterklicken über eine echte Seitenanfrage zurück zur Passwortseite. */
const OEFFENTLICH = ["/impressum", "/datenschutz", "/agb", "/widerruf", "/einwilligung"];
const istOeffentlich = (p) => OEFFENTLICH.includes(p.replace(/\/$/, "")) || p.startsWith("/assets/");

const passwort = () => (process.env.SEITEN_PASSWORT || "mathe");

async function hash(text) {
  const daten = new TextEncoder().encode(`mythosmathe:${text}`);
  const h = await crypto.subtle.digest("SHA-256", daten);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function cookieLesen(request, name) {
  const roh = request.headers.get("cookie") || "";
  for (const teil of roh.split(";")) {
    const [k, ...v] = teil.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

const sicher = (s) => String(s).replace(/[&<>"']/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[z]));

function seite(ziel, fehler) {
  return `<!doctype html>
<html lang="de"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Mythos Mathe – Zugang</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;
    font-family:Montserrat,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
    background:linear-gradient(170deg,#0B1E4A 0%,#004D98 100%);color:#fff}
  .karte{width:100%;max-width:380px;text-align:center}
  .logo{font-size:30px;font-weight:800;letter-spacing:-.02em;text-transform:uppercase;margin:0}
  .silber{background:linear-gradient(180deg,#fff 0%,#E3E8EF 35%,#B9C2CE 60%,#8E97A6 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
  .gold{background:linear-gradient(180deg,#FFE58A 0%,#EDBB00 45%,#E2B53C 70%,#A67C00 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
  .slogan{font-size:12px;font-weight:600;letter-spacing:.03em;color:#C9D6EE;margin:4px 0 30px}
  .slogan b{color:#EDBB00;font-weight:600}
  form{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:20px;padding:22px}
  p.info{font-size:14px;color:#C9D6EE;line-height:1.6;margin:0 0 16px}
  input{width:100%;height:50px;border-radius:14px;border:1.5px solid ${fehler ? "#FF9DA8" : "rgba(255,255,255,.3)"};background:rgba(255,255,255,.95);
    color:#0B1E4A;font-size:17px;padding:0 16px;font-family:inherit;outline:none}
  input:focus{border-color:#EDBB00}
  button{margin-top:12px;width:100%;height:50px;border:none;border-radius:999px;cursor:pointer;font-family:inherit;font-size:16px;font-weight:800;
    color:#0B1E4A;background:linear-gradient(150deg,#FFE9A0 0%,#EDBB00 55%,#C99A14 100%)}
  .fehler{color:#FF9DA8;font-size:13.5px;margin:10px 0 0}
</style></head>
<body><main class="karte">
  <p class="logo"><span class="silber">mythos</span><span class="gold">mathe</span><span class="silber">.de</span></p>
  <p class="slogan">System <b>+</b> Freude <b>=</b> Erfolg</p>
  <form method="post" action="${PFAD_LOGIN}">
    <p class="info">Du betrittst die Testversion von mythosmathe.de.</p>
    <input type="password" name="passwort" placeholder="Passwort" autocomplete="current-password" autocapitalize="off" autocorrect="off" spellcheck="false" autofocus required>
    <input type="hidden" name="ziel" value="${sicher(ziel)}">
    <button type="submit">Eintreten</button>
    ${fehler ? '<p class="fehler">Das Passwort stimmt nicht.</p>' : ""}
  </form>
</main></body></html>`;
}

const html = (inhalt, status = 200) => new Response(inhalt, {
  status,
  headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
});

export default async function middleware(request) {
  if ((process.env.SEITEN_SCHUTZ || "").toLowerCase() === "aus") return next();
  // Öffentliche Formelseiten (scripts/formelseiten.mjs): nur mit FORMELN_OEFFENTLICH=ja ohne Passwort
  if ((process.env.FORMELN_OEFFENTLICH || "").toLowerCase() === "ja") {
    const p = new URL(request.url).pathname;
    if (p === "/formeln" || p.startsWith("/formeln/") || p === "/sitemap.xml" || p === "/robots.txt") return next();
  }
  // Stripe ruft den Webhook ohne Cookie auf; die Signatur prüft die Funktion selbst
  if (new URL(request.url).pathname === "/api/stripe/webhook") return next();
  // Vercel Cron (prüft CRON_SECRET selbst) und der Abmelde-Link aus der Eltern-Wochenmail
  if (["/api/cron/wochenmail", "/api/cron/push", "/api/wochenmail-abmelden"].includes(new URL(request.url).pathname)) return next();
  // PWA: Manifest und Symbole lädt der Browser teils ohne Cookie
  { const p = new URL(request.url).pathname; if (p === "/manifest.webmanifest" || p.startsWith("/icons/")) return next(); }
  const url = new URL(request.url);
  const soll = await hash(passwort());

  // Passwort absenden
  if (url.pathname === PFAD_LOGIN && request.method === "POST") {
    let eingabe = "", ziel = "/";
    try {
      const form = await request.formData();
      eingabe = String(form.get("passwort") || "");
      ziel = String(form.get("ziel") || "/");
    } catch (e) { /* leer lassen */ }
    if (!ziel.startsWith("/") || ziel.startsWith("//")) ziel = "/";
    if (eingabe.trim().toLowerCase() === passwort().toLowerCase()) {
      const kopf = new Headers({ location: ziel, "cache-control": "no-store" });
      kopf.append("set-cookie", `${COOKIE}=${soll}; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; Secure; SameSite=Lax`);
      // Nur 2 Minuten gültig und für die Seite lesbar (kein HttpOnly): die App löscht es sofort nach dem Lesen
      kopf.append("set-cookie", `${COOKIE_WILLKOMMEN}=1; Path=/; Max-Age=120; Secure; SameSite=Lax`);
      kopf.append("set-cookie", `${COOKIE_GAST}=; Path=/; Max-Age=0; Secure; SameSite=Lax`);
      return new Response(null, { status: 303, headers: kopf });
    }
    return html(seite(ziel, true), 401);
  }

  // Schon freigeschaltet?
  if (cookieLesen(request, COOKIE) === soll) return next();

  // Rechtsseiten, Einwilligung und die dafür nötigen Programmdateien: ohne Passwort, als Gast markiert
  if (istOeffentlich(url.pathname)) {
    if (url.pathname.startsWith("/assets/")) return next();
    return next({ headers: { "set-cookie": `${COOKIE_GAST}=1; Path=/; Max-Age=3600; Secure; SameSite=Lax`, "x-robots-tag": "noindex" } });
  }

  // API-Aufrufe ohne Zugang: knapp ablehnen
  if (url.pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ error: { message: "Kein Zugang." } }), { status: 401, headers: { "content-type": "application/json" } });
  }
  return html(seite(url.pathname + url.search, false), 401);
}
