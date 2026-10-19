/* ============================================================
   Vercel-Funktion: Stripe-Kundenportal (Abo verwalten, kündigen, Rechnungen).
   POST, Authorization: Bearer <Supabase-Token>. Antwort: { url }.
   ============================================================ */
import { ANGEBOT } from "../../src/angebot.js";
import { stripeClient, supabaseServer } from "../../src/stripeServer.js";

const fehler = (res, status, message) => res.status(status).json({ error: { message } });

export default async function handler(req, res) {
  if (req.method !== "POST") return fehler(res, 405, "Nur POST.");
  if (!ANGEBOT.pro) return fehler(res, 404, "Dieses Angebot gibt es zurzeit nicht.");   // Schalter: src/angebot.js
  const geheim = process.env.STRIPE_SECRET_KEY;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!geheim || !url || !service || !anon) return fehler(res, 500, "Das Kundenportal ist auf dem Server noch nicht eingerichtet.");
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const sb = supabaseServer(url, service, anon);
  const nutzer = await sb.nutzer(token);
  if (!nutzer) return fehler(res, 401, "Bitte zuerst anmelden.");
  const profil = await sb.profil(nutzer.id);
  if (!profil || !profil.stripe_kunde) return fehler(res, 404, "Für dieses Konto gibt es noch kein Abo.");
  try {
    const origin = `https://${req.headers["x-forwarded-host"] || req.headers.host}`;
    const s = await stripeClient(geheim).post("/billing_portal/sessions", { customer: profil.stripe_kunde, return_url: `${origin}/?konto` });
    return res.status(200).json({ url: s.url });
  } catch (e) { return fehler(res, 502, e.message); }
}
