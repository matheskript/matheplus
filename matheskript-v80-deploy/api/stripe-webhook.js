/* ======================================================================
   POST /api/stripe-webhook – Stripe meldet Zahlungen und Abo-Änderungen.
   Im Stripe-Dashboard als Webhook-Endpunkt eintragen mit den Ereignissen:
     checkout.session.completed
     checkout.session.async_payment_succeeded
     checkout.session.expired
     customer.subscription.updated
     customer.subscription.deleted
     charge.refunded
   Der Passwortschutz der Seite (middleware.js) lässt diesen Pfad durch;
   abgesichert ist er über die Stripe-Signatur.
   ====================================================================== */
import { stripe, admin, periodenEnde, aboAktiv } from "./_kasse.js";

export const config = { api: { bodyParser: false } };

async function rohDaten(req) {
  const teile = [];
  for await (const t of req) teile.push(typeof t === "string" ? Buffer.from(t) : t);
  return Buffer.concat(teile);
}

async function speichern(zeile) {
  const { error } = await admin().from("berechtigungen")
    .upsert({ ...zeile, aktualisiert: new Date().toISOString() }, { onConflict: "nutzer,produkt" });
  if (error) throw error;
}

function aboZeile(abo) {
  const nutzer = abo.metadata?.nutzer;
  if (!nutzer) return null;
  const ende = periodenEnde(abo);
  return {
    nutzer,
    produkt: "unlimited",
    status: aboAktiv(abo.status) ? (abo.cancel_at_period_end ? "gekuendigt" : "aktiv")
      : abo.status === "canceled" ? "beendet" : "ueberfaellig",
    bis: ende,
    kuendigung_zum: abo.cancel_at_period_end ? ende : null,
    stripe_kunde: typeof abo.customer === "string" ? abo.customer : abo.customer?.id,
    stripe_abo: abo.id,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  let ereignis;
  try {
    const roh = await rohDaten(req);
    ereignis = await stripe().webhooks.constructEventAsync(roh, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error("webhook signatur", e.message);
    return res.status(400).send("Ungültige Signatur.");
  }

  try {
    const o = ereignis.data.object;
    switch (ereignis.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        if (o.metadata?.art === "event") {   // Elternabend & Co.: Plätze bestätigen
          if (o.payment_status === "paid") {
            await admin().from("eventbuchungen")
              .update({ status: "bezahlt", stripe_session: o.id, stripe_zahlung: o.payment_intent || null })
              .eq("id", o.metadata.buchung);
          }
          break;
        }
        const nutzer = o.metadata?.nutzer || o.client_reference_id;
        const produkt = o.metadata?.produkt;
        if (!nutzer || !produkt) break;
        if (o.mode === "subscription") {
          const abo = await stripe().subscriptions.retrieve(o.subscription);
          const z = aboZeile({ ...abo, metadata: { ...abo.metadata, nutzer } });
          if (z) await speichern(z);
        } else if (o.payment_status === "paid") {
          await speichern({
            nutzer, produkt, status: "aktiv", bis: null, kuendigung_zum: null,
            stripe_kunde: o.customer || null, stripe_zahlung: o.payment_intent || null,
          });
        }
        break;
      }
      case "checkout.session.expired": {
        if (o.metadata?.art === "event") {   // Reservierung verfallen → Plätze wieder frei
          await admin().from("eventbuchungen").update({ status: "storniert" })
            .eq("id", o.metadata.buchung).eq("status", "reserviert");
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const z = aboZeile(o);
        if (z) await speichern(z);
        break;
      }
      case "charge.refunded": {
        // Vollständig erstattet (z. B. nach Widerruf) → Kurs wieder sperren.
        if (o.refunded && o.payment_intent) {
          await admin().from("berechtigungen")
            .update({ status: "erstattet", aktualisiert: new Date().toISOString() })
            .eq("stripe_zahlung", o.payment_intent);
          await admin().from("eventbuchungen")
            .update({ status: "erstattet" })
            .eq("stripe_zahlung", o.payment_intent);
        }
        break;
      }
      default: break;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("webhook verarbeitung", e);
    res.status(500).json({ ok: false }); // Stripe versucht es später erneut
  }
}
