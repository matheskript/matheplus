/* ============================================================
   Vercel-Funktion: Stripe-Webhook. Stripe ruft diese Adresse ohne Cookie auf
   (die Middleware lässt /api/stripe/webhook durch); die Echtheit prüft die
   Signatur mit STRIPE_WEBHOOK_SECRET. Jedes Ereignis wird höchstens einmal
   verarbeitet (stripe_ereignisse). Freischaltung: abo_setzen() in supabase/stripe.sql
   mit dem Service-Role-Key – der Browser kann das nie.
   Ereignisse in Stripe eintragen: checkout.session.completed, invoice.paid,
   invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted.
   ============================================================ */
import { ereignisZuAbo, rohBody, signaturPruefen, stripeClient, supabaseServer } from "../../src/stripeServer.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: { message: "Nur POST." } });
  const geheim = process.env.STRIPE_SECRET_KEY, webhookGeheim = process.env.STRIPE_WEBHOOK_SECRET;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!geheim || !webhookGeheim || !url || !service) return res.status(500).json({ error: { message: "Webhook nicht eingerichtet." } });
  const roh = await rohBody(req);
  if (!signaturPruefen(roh, req.headers["stripe-signature"], webhookGeheim)) return res.status(400).json({ error: { message: "Ungültige Signatur." } });
  let ev;
  try { ev = JSON.parse(roh); } catch { return res.status(400).json({ error: { message: "Kein JSON." } }); }
  try {
    const args = await ereignisZuAbo(ev, stripeClient(geheim));
    if (!args) return res.status(200).json({ ignoriert: ev.type });
    const sb = supabaseServer(url, service, process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);
    const r = await sb.rpc("abo_setzen", args);
    return res.status(200).json({ ok: true, typ: ev.type, ...(r || {}) });
  } catch (e) {
    // 500 → Stripe wiederholt die Zustellung später
    return res.status(500).json({ error: { message: e.message } });
  }
}
