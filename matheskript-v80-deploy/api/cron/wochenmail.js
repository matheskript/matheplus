/* ============================================================
   Vercel Cron: Eltern-Wochenmail (Sonntag, siehe vercel.json → crons).
   Ausgeschaltet, bis alles eingetragen ist:
     WOCHENMAIL_AN=ja            Schalter
     RESEND_API_KEY              Mail-Versand (resend.com)
     WOCHENMAIL_ABSENDER         z. B. "Mythos Mathe <bericht@mythosmathe.de>" (Domain bei Resend bestätigt)
     SUPABASE_SERVICE_ROLE_KEY   + SUPABASE_URL (oder VITE_SUPABASE_URL)
     CRON_SECRET                 setzt Vercel automatisch; schützt den Aufruf
   Daten: wochenmail_daten() in supabase/wochenmail.sql. Probelauf ohne Versand:
   GET /api/cron/wochenmail?probe=1 (mit Authorization: Bearer CRON_SECRET).
   ============================================================ */
import { supabaseServer } from "../../src/stripeServer.js";
import { wochenmail } from "../../src/wochenmail.js";

const APP = (process.env.APP_URL || "https://mythosmathe.de").replace(/\/$/, "");

export default async function handler(req, res) {
  const geheim = process.env.CRON_SECRET;
  if (!geheim || req.headers.authorization !== `Bearer ${geheim}`) return res.status(401).json({ error: { message: "Kein Zugang." } });
  const probe = String(req.query?.probe || "") === "1";
  if ((process.env.WOCHENMAIL_AN || "").toLowerCase() !== "ja" && !probe) return res.status(200).json({ aus: true, hinweis: "WOCHENMAIL_AN ist nicht 'ja'." });
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resend = process.env.RESEND_API_KEY, absender = process.env.WOCHENMAIL_ABSENDER;
  if (!url || !service) return res.status(500).json({ error: { message: "Supabase-Server-Schlüssel fehlt." } });
  if (!probe && (!resend || !absender)) return res.status(500).json({ error: { message: "RESEND_API_KEY oder WOCHENMAIL_ABSENDER fehlt." } });

  const sb = supabaseServer(url, service, process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);
  let liste;
  try { liste = await sb.rpc("wochenmail_daten"); } catch (e) { return res.status(500).json({ error: { message: e.message } }); }
  const gesendet = [], fehler = [];
  for (const e of liste || []) {
    const kinder = (e.kinder || []).filter(Boolean);
    if (!kinder.length || !e.email) continue;
    const m = wochenmail({ eltern: e, kinder, appUrl: APP, abmeldeUrl: `${APP}/api/wochenmail-abmelden?t=${encodeURIComponent(e.token)}` });
    if (probe) { gesendet.push({ an: e.email.replace(/^(.).*(@.*)$/, "$1…$2"), betreff: m.betreff }); continue; }
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${resend}`, "content-type": "application/json" },
        body: JSON.stringify({ from: absender, to: [e.email], subject: m.betreff, html: m.html, text: m.text,
          headers: { "List-Unsubscribe": `<${APP}/api/wochenmail-abmelden?t=${encodeURIComponent(e.token)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } }),
      });
      if (r.ok) gesendet.push(e.eltern_id); else fehler.push({ id: e.eltern_id, status: r.status });
    } catch (err) { fehler.push({ id: e.eltern_id, fehler: err.message }); }
  }
  if (!probe && gesendet.length) { try { await sb.rpc("wochenmail_gesendet", { ids: gesendet }); } catch { /* nächster Lauf frühestens in 5 Tagen ohnehin */ } }
  return res.status(200).json({ probe, gesendet: probe ? gesendet : gesendet.length, fehler });
}
