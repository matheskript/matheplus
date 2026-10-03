/* ======================================================================
   POST /api/kasse  – startet den Stripe-Checkout (Kreditkarte oder PayPal).
   Body: { produkt: "analysis1" | "unlimited", volljaehrig: true, sofortBeginn: bool }
   Antwort: { url } → der Browser leitet dorthin weiter.
   Freigeschaltet wird erst durch den Webhook (api/stripe-webhook.js).
   ====================================================================== */
import { PRODUKTE, stripe, admin, nutzerAus, fehler, herkunft } from "./_kasse.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return fehler(res, 405, "Nur POST.");
  try {
    const nutzer = await nutzerAus(req);
    if (!nutzer) return fehler(res, 401, "Bitte melde dich zuerst an.");

    const { produkt, volljaehrig, sofortBeginn } = req.body || {};
    const p = PRODUKTE[produkt];
    if (!p) return fehler(res, 400, "Unbekanntes Produkt.");
    if (volljaehrig !== true) return fehler(res, 400, "Kostenpflichtige Bestellungen kann nur ein volljähriger Vertragspartner aufgeben.");

    // Schon gekauft bzw. Abo läuft? Dann nicht doppelt verkaufen.
    const { data: alt } = await admin().from("berechtigungen").select("produkt, status, stripe_kunde")
      .eq("nutzer", nutzer.id);
    const bestehend = (alt || []).find((b) => b.produkt === produkt && ["aktiv", "gekuendigt"].includes(b.status));
    if (bestehend) return fehler(res, 409, p.abo ? "Unlimited ist für dieses Konto bereits aktiv." : "Dieser Kurs ist für dieses Konto bereits freigeschaltet.");
    const kunde = (alt || []).find((b) => b.stripe_kunde)?.stripe_kunde || null;

    const basis = herkunft(req);
    const meta = {
      nutzer: nutzer.id,
      produkt,
      volljaehrig_bestaetigt: "ja",
      sofort_beginn_verlangt: sofortBeginn ? "ja" : "nein",
      zustimmung_zeit: new Date().toISOString(),
    };

    const sitzung = await stripe().checkout.sessions.create({
      mode: p.abo ? "subscription" : "payment",
      locale: "de",
      // Zahlungsarten (Karte, PayPal …) werden im Stripe-Dashboard aktiviert.
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: p.preis,
          product_data: { name: p.name, description: p.beschreibung },
          ...(p.abo ? { recurring: { interval: "month" } } : {}),
        },
      }],
      client_reference_id: nutzer.id,
      ...(kunde ? { customer: kunde } : { customer_email: nutzer.email || undefined }),
      ...(p.abo ? { subscription_data: { metadata: meta } } : { customer_creation: "always", payment_intent_data: { metadata: meta } }),
      metadata: meta,
      success_url: `${basis}/?konto=1&kauf=erfolg&produkt=${produkt}`,
      cancel_url: `${basis}/?konto=1&kauf=abbruch`,
      custom_text: {
        submit: { message: p.abo
          ? "Monatlich 20,00 € bis zur Kündigung. Jederzeit zum Ende des laufenden Monats kündbar."
          : "Einmalig 50,00 €. Kein Abo, keine automatische Verlängerung." },
      },
    });
    res.status(200).json({ url: sitzung.url });
  } catch (e) {
    console.error("kasse", e);
    fehler(res, 500, "Der Bezahlvorgang konnte nicht gestartet werden. Bitte versuch es gleich noch einmal.");
  }
}
