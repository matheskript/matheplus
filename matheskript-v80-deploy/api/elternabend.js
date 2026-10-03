/* ======================================================================
   /api/elternabend – Plätze und Buchung für Veranstaltungen (EVENTS in _kasse.js).
   GET  ?event=elternabend_2026_11_01  → { frei, gesamt, buchbar }
   POST { event, plaetze, name, email, volljaehrig, sofortBeginn } → { url }
   Keine Anmeldung nötig. Plätze werden für die Dauer des Bezahlvorgangs
   (30 Minuten) reserviert; der Webhook bestätigt oder gibt sie wieder frei.
   ====================================================================== */
import { EVENTS, stripe, admin, fehler, herkunft, preisId } from "./_kasse.js";

const MINUTEN = 30;

async function stand(id) {
  const ev = EVENTS[id];
  const { data, error } = await admin().rpc("event_belegt", { ev: id });
  if (error) throw error;
  const frei = Math.max(0, ev.maxPlaetze - (data || 0));
  const offen = Date.now() < new Date(ev.buchbarBis).getTime();
  return { frei, gesamt: ev.maxPlaetze, buchbar: offen && frei > 0, offen };
}

export default async function handler(req, res) {
  const id = String((req.method === "GET" ? req.query?.event : req.body?.event) || "");
  const ev = EVENTS[id];
  if (!ev) return fehler(res, 404, "Diese Veranstaltung gibt es nicht.");

  try {
    if (req.method === "GET") {
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(await stand(id));
    }
    if (req.method !== "POST") return fehler(res, 405, "Nur GET oder POST.");

    const b = req.body || {};
    const plaetze = Number(b.plaetze);
    const name = String(b.name || "").trim().slice(0, 120);
    const email = String(b.email || "").trim().toLowerCase().slice(0, 200);
    if (!Number.isInteger(plaetze) || plaetze < 1 || plaetze > ev.maxProBuchung) return fehler(res, 400, `Bitte 1 bis ${ev.maxProBuchung} Plätze wählen.`);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fehler(res, 400, "Bitte Name und eine gültige E-Mail-Adresse angeben.");
    if (b.volljaehrig !== true) return fehler(res, 400, "Buchen kann nur ein volljähriger Vertragspartner.");

    const s = await stand(id);
    if (!s.offen) return fehler(res, 409, "Die Buchung für diese Veranstaltung ist geschlossen.");
    if (s.frei < plaetze) return fehler(res, 409, s.frei === 0 ? "Leider ausgebucht." : `Es sind nur noch ${s.frei} Plätze frei.`);

    const { data: buchung, error } = await admin().rpc("event_reservieren", {
      ev: id, anzahl: plaetze, maximum: ev.maxPlaetze, kunde_name: name, kunde_email: email, minuten: MINUTEN + 2,
    });
    if (error) throw error;
    if (!buchung) return fehler(res, 409, "Gerade eben wurden die letzten Plätze vergeben. Bitte lade die Seite neu.");

    const meta = {
      art: "event", event: id, buchung, plaetze: String(plaetze), name,
      volljaehrig_bestaetigt: "ja", sofort_beginn_verlangt: b.sofortBeginn ? "ja" : "nein",
      zustimmung_zeit: new Date().toISOString(),
    };
    const basis = herkunft(req);
    let sitzung;
    try {
      sitzung = await stripe().checkout.sessions.create({
        mode: "payment",
        locale: "de",
        line_items: [{ price: await preisId(ev), quantity: plaetze }],
        customer_email: email,
        customer_creation: "always",
        client_reference_id: buchung,
        expires_at: Math.floor(Date.now() / 1000) + MINUTEN * 60,
        metadata: meta,
        payment_intent_data: { metadata: meta, description: `${ev.name} · ${plaetze} Platz/Plätze` },
        invoice_creation: { enabled: true, invoice_data: { description: `${ev.name} – ${ev.beschreibung}`, metadata: meta } },
        success_url: `${basis}/?elternabend=1&buchung=erfolg`,
        cancel_url: `${basis}/?elternabend=1&buchung=abbruch`,
        custom_text: { submit: { message: "Dein Platz ist 30 Minuten für dich reserviert. Bestätigung und Rechnung kommen per E-Mail." } },
      });
    } catch (e) {
      await admin().from("eventbuchungen").update({ status: "storniert" }).eq("id", buchung);
      throw e;
    }
    await admin().from("eventbuchungen").update({ stripe_session: sitzung.id }).eq("id", buchung);
    res.status(200).json({ url: sitzung.url });
  } catch (e) {
    console.error("elternabend", e);
    fehler(res, 500, "Die Buchung konnte nicht gestartet werden. Bitte versuch es gleich noch einmal.");
  }
}
