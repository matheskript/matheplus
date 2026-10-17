/* Abmelden von der Eltern-Wochenmail per Link (ohne Anmeldung, mit Token).
   GET zeigt eine Bestätigung, POST (One-Click aus dem Mailprogramm) meldet direkt ab. */
import { supabaseServer } from "../src/stripeServer.js";

const seite = (titel, text) => `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${titel}</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Montserrat,system-ui,sans-serif;background:linear-gradient(170deg,#0B1E4A 0%,#004D98 100%);color:#fff}
main{max-width:420px;text-align:center}h1{font-size:24px;margin:0 0 10px}p{color:#C9D6EE;line-height:1.6}a{color:#EDBB00;font-weight:700}</style></head>
<body><main><h1>${titel}</h1><p>${text}</p><p><a href="/">Zur App</a></p></main></body></html>`;

export default async function handler(req, res) {
  const t = String(req.query?.t || "");
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  if (!/^[a-f0-9]{32,80}$/.test(t)) return res.status(400).send(seite("Link ungültig", "Dieser Abmelde-Link ist nicht vollständig."));
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return res.status(500).send(seite("Gerade nicht möglich", "Bitte später noch einmal versuchen oder in der App unter Konto abschalten."));
  try {
    const ok = await supabaseServer(url, service, null).rpc("wochenmail_abmelden", { t });
    if (req.method === "POST") return res.status(200).send("ok");
    return res.status(200).send(ok ? seite("Abgemeldet", "Sie bekommen keine Wochenmail mehr. In der App unter Konto lässt sie sich jederzeit wieder einschalten.")
      : seite("Schon erledigt", "Zu diesem Link gibt es keine aktive Wochenmail."));
  } catch { return res.status(500).send(seite("Gerade nicht möglich", "Bitte später noch einmal versuchen.")); }
}
