/* ============================================================
   Vercel-Funktion: Stripe Checkout für Pro/Familie starten.
   POST { angebot: "pro_monat" | "pro_jahr" | "familie_monat", ziele: [Konto-IDs] }
   Authorization: Bearer <Supabase-Token des Zahlers> (Elternteil oder volljähriger Schüler).
   Antwort: { url } – die App leitet dorthin weiter. Freigeschaltet wird erst vom Webhook.
   Umgebungsvariablen: STRIPE_SECRET_KEY, STRIPE_PRICE_PRO_MONAT, STRIPE_PRICE_PRO_JAHR,
   STRIPE_PRICE_FAMILIE_MONAT, SUPABASE_URL (oder VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY,
   SUPABASE_ANON_KEY (oder VITE_SUPABASE_ANON_KEY).
   ============================================================ */
import { ANGEBOT } from "../../src/angebot.js";
import { checkoutParameter, checkoutPruefen, preisId, stripeClient, supabaseServer } from "../../src/stripeServer.js";

const fehler = (res, status, message) => res.status(status).json({ error: { message } });

export default async function handler(req, res) {
  if (req.method !== "POST") return fehler(res, 405, "Nur POST.");
  if (!ANGEBOT.pro) return fehler(res, 404, "Dieses Angebot gibt es zurzeit nicht.");   // Schalter: src/angebot.js
  const geheim = process.env.STRIPE_SECRET_KEY;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!geheim || !url || !service || !anon) return fehler(res, 500, "Die Bezahlung ist auf dem Server noch nicht eingerichtet (STRIPE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY fehlen).");

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body) return fehler(res, 400, "Unvollständige Anfrage.");
  const preis = preisId(body.angebot);
  if (!preis) return fehler(res, 400, "Für dieses Angebot ist noch kein Preis hinterlegt.");

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const sb = supabaseServer(url, service, anon);
  const nutzer = await sb.nutzer(token);
  if (!nutzer) return fehler(res, 401, "Bitte zuerst anmelden.");

  let p;
  try { p = checkoutPruefen({ angebot: body.angebot, ziele: body.ziele, zahler: nutzer.id }); } catch (e) { return fehler(res, 400, e.message); }
  try {
    for (const z of p.ziele) {
      const darf = await sb.rpc("darf_bezahlen_fuer", { zahler: nutzer.id, ziel: z });
      if (darf !== true) return fehler(res, 403, "Du kannst nur für verbundene Kinder bezahlen – oder für dich selbst, wenn du volljährig bist.");
    }
    const profil = await sb.profil(nutzer.id);
    const origin = `https://${req.headers["x-forwarded-host"] || req.headers.host}`;
    const stripe = stripeClient(geheim);
    const sitzung = await stripe.post("/checkout/sessions", checkoutParameter({ angebot: body.angebot, preis, ziele: p.ziele, zahler: nutzer.id, email: nutzer.email, kunde: profil && profil.stripe_kunde, origin }));
    return res.status(200).json({ url: sitzung.url });
  } catch (e) {
    return fehler(res, 502, `Die Bezahlung konnte nicht gestartet werden: ${e.message}`);
  }
}
