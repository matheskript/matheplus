/* ======================================================================
   POST /api/abo-verwalten – öffnet das Stripe-Kundenportal
   (Zahlungsmittel ändern, Rechnungen, Abo kündigen).
   Antwort: { url }
   ====================================================================== */
import { stripe, admin, nutzerAus, fehler, herkunft } from "./_kasse.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return fehler(res, 405, "Nur POST.");
  try {
    const nutzer = await nutzerAus(req);
    if (!nutzer) return fehler(res, 401, "Bitte melde dich zuerst an.");
    const { data } = await admin().from("berechtigungen").select("stripe_kunde")
      .eq("nutzer", nutzer.id).not("stripe_kunde", "is", null).limit(1);
    const kunde = data?.[0]?.stripe_kunde;
    if (!kunde) return fehler(res, 404, "Zu diesem Konto gibt es noch keine Zahlungen.");
    const portal = await stripe().billingPortal.sessions.create({
      customer: kunde,
      return_url: `${herkunft(req)}/?konto=1`,
      locale: "de",
    });
    res.status(200).json({ url: portal.url });
  } catch (e) {
    console.error("abo-verwalten", e);
    fehler(res, 500, "Die Verwaltung konnte nicht geöffnet werden.");
  }
}
