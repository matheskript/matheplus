/* ======================================================================
   POST /api/vertrag-melden – Kündigungsbutton (§ 312k BGB) und
   Widerrufsfunktion. Funktioniert OHNE Anmeldung.
   Body: { art: "kuendigung" | "widerruf", name, email, vertrag, kuendigungsart, grund, nachricht }
   - Jede Erklärung wird mit Zeitstempel in public.vertragsmeldungen gespeichert.
   - Kündigung von Unlimited: Das Abo wird automatisch zum Ende des
     laufenden Monats beendet, wenn es unter der E-Mail gefunden wird.
   - Widerruf: wird erfasst; die Erstattung löst der Anbieter im
     Stripe-Dashboard aus (dann sperrt der Webhook den Zugang).
   ====================================================================== */
import { stripe, admin, nutzerAus, fehler, periodenEnde, aboAktiv } from "./_kasse.js";

const zaehler = new Map();
const zuOft = (k) => {
  const jetzt = Date.now(), l = (zaehler.get(k) || []).filter((t) => jetzt - t < 3600e3);
  l.push(jetzt); zaehler.set(k, l);
  return l.length > 10;
};
const datum = (iso) => new Date(iso).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" });

async function aboKuendigen(email, nutzer) {
  const s = stripe();
  const kunden = [];
  if (nutzer) {
    const { data } = await admin().from("berechtigungen").select("stripe_kunde").eq("nutzer", nutzer.id).not("stripe_kunde", "is", null);
    (data || []).forEach((d) => kunden.push(d.stripe_kunde));
  }
  const gefunden = await s.customers.list({ email, limit: 10 });
  gefunden.data.forEach((k) => kunden.push(k.id));
  const enden = [];
  for (const kunde of [...new Set(kunden)]) {
    const abos = await s.subscriptions.list({ customer: kunde, status: "all", limit: 20 });
    for (const abo of abos.data) {
      if (!aboAktiv(abo.status)) continue;
      const neu = abo.cancel_at_period_end ? abo : await s.subscriptions.update(abo.id, { cancel_at_period_end: true });
      enden.push(periodenEnde(neu));
    }
  }
  return enden.filter(Boolean);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return fehler(res, 405, "Nur POST.");
  const b = req.body || {};
  const art = b.art === "widerruf" ? "widerruf" : b.art === "kuendigung" ? "kuendigung" : null;
  const name = String(b.name || "").trim().slice(0, 120);
  const email = String(b.email || "").trim().toLowerCase().slice(0, 200);
  const vertrag = String(b.vertrag || "").slice(0, 40);
  if (!art) return fehler(res, 400, "Unbekannte Erklärung.");
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fehler(res, 400, "Bitte Name und eine gültige E-Mail-Adresse angeben.");
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  if (zuOft(ip || email)) return fehler(res, 429, "Zu viele Anfragen. Bitte versuch es später noch einmal oder schreib uns eine E-Mail.");

  const eingang = new Date().toISOString();
  let ergebnis = art === "widerruf"
    ? "Dein Widerruf ist eingegangen. Wir erstatten berechtigte Zahlungen innerhalb von 14 Tagen auf demselben Zahlungsweg."
    : "Deine Kündigung ist eingegangen. Wir ordnen sie deinem Vertrag zu und bestätigen dir das Vertragsende.";

  try {
    if (art === "kuendigung" && vertrag === "unlimited" && process.env.STRIPE_SECRET_KEY) {
      const nutzer = await nutzerAus(req).catch(() => null);
      const enden = await aboKuendigen(email, nutzer);
      if (enden.length) ergebnis = `Dein Abo Mythos Mathe Unlimited ist gekündigt. Es endet am ${datum(enden.sort()[0])}; bis dahin bleibt der Zugang bestehen.`;
      else ergebnis = "Deine Kündigung ist eingegangen. Unter dieser E-Mail-Adresse haben wir kein laufendes Abo gefunden – wir prüfen das von Hand und melden uns.";
    }
    const { data, error } = await admin().from("vertragsmeldungen").insert({
      art, name, email, vertrag,
      kuendigungsart: String(b.kuendigungsart || "ordentlich").slice(0, 20),
      grund: String(b.grund || "").slice(0, 1000),
      nachricht: String(b.nachricht || "").slice(0, 2000),
      ergebnis, eingang,
    }).select("id").single();
    if (error) throw error;
    res.status(200).json({ id: data.id, eingang, ergebnis });
  } catch (e) {
    console.error("vertrag-melden", e);
    fehler(res, 500, `Die Erklärung konnte gerade nicht gespeichert werden. Bitte schick sie per E-Mail – maßgeblich ist der Zeitpunkt deines Absendens.`);
  }
}
