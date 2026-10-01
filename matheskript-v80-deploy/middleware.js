/* ======================================================================
   Passwortschutz für die ganze Seite (Vercel Routing Middleware).
   Ohne gültiges Zugangs-Cookie erscheint eine Passwortseite. Das Passwort
   kommt aus der Umgebungsvariablen SEITEN_PASSWORT, sonst gilt "mathe".
   Zum Abschalten: SEITEN_SCHUTZ=aus in Vercel setzen (oder Datei löschen).
   ====================================================================== */
import { next } from "@vercel/functions";

const COOKIE = "mm_zugang";
const PFAD_LOGIN = "/__zugang";

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
    <p class="info">Diese Seite ist noch nicht öffentlich. Bitte gib das Passwort ein.</p>
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
      return new Response(null, {
        status: 303,
        headers: {
          location: ziel,
          "set-cookie": `${COOKIE}=${soll}; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; Secure; SameSite=Lax`,
          "cache-control": "no-store",
        },
      });
    }
    return html(seite(ziel, true), 401);
  }

  // Schon freigeschaltet?
  if (cookieLesen(request, COOKIE) === soll) return next();

  // API-Aufrufe ohne Zugang: knapp ablehnen
  if (url.pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ error: { message: "Kein Zugang." } }), { status: 401, headers: { "content-type": "application/json" } });
  }
  return html(seite(url.pathname + url.search, false), 401);
}
