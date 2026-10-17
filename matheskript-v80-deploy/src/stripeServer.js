/* ======================================================================
   stripeServer.js – Bausteine für die Stripe-Funktionen in api/stripe/ (nur Server, kein React).
   · Signaturprüfung des Webhooks (HMAC-SHA256, wie Stripe sie beschreibt)
   · Stripe-REST-Aufrufe ohne SDK (form-kodiert)
   · Supabase-Aufrufe mit dem Service-Role-Key (nie im Browser)
   · Übersetzung eines Stripe-Ereignisses in den Aufruf abo_setzen() (supabase/stripe.sql)
   Angebote und Preise: die Price-IDs stehen in Umgebungsvariablen (STRIPE_PRICE_…).
   ====================================================================== */
import { createHmac, timingSafeEqual } from "node:crypto";

export const ANGEBOTE = {
  pro_monat: { plan: "pro", name: "Pro (monatlich)", preisVar: "STRIPE_PRICE_PRO_MONAT", maxZiele: 1 },
  pro_jahr: { plan: "pro", name: "Pro (jährlich)", preisVar: "STRIPE_PRICE_PRO_JAHR", maxZiele: 1 },
  familie_monat: { plan: "familie", name: "Familie (monatlich)", preisVar: "STRIPE_PRICE_FAMILIE_MONAT", maxZiele: 3 },
};
export const ANGEBOT_IDS = Object.keys(ANGEBOTE);
export const preisId = (angebot, env = process.env) => (ANGEBOTE[angebot] ? env[ANGEBOTE[angebot].preisVar] || null : null);

/* ---------- Webhook-Signatur ---------- */
export function signaturPruefen(rohBody, kopf, geheimnis, { jetzt = Math.floor(Date.now() / 1000), toleranz = 300 } = {}) {
  if (!rohBody || !kopf || !geheimnis) return false;
  const teile = Object.fromEntries(String(kopf).split(",").map((t) => t.trim().split("=")).filter((x) => x.length === 2));
  const t = Number(teile.t);
  const v1 = String(kopf).split(",").map((x) => x.trim()).filter((x) => x.startsWith("v1=")).map((x) => x.slice(3));
  if (!t || !v1.length || Math.abs(jetzt - t) > toleranz) return false;
  const erwartet = createHmac("sha256", geheimnis).update(`${t}.${rohBody}`).digest("hex");
  return v1.some((s) => s.length === erwartet.length && timingSafeEqual(Buffer.from(s, "utf8"), Buffer.from(erwartet, "utf8")));
}
/* Für Tests: Signaturkopf erzeugen */
export const signaturBauen = (rohBody, geheimnis, t = Math.floor(Date.now() / 1000)) => `t=${t},v1=${createHmac("sha256", geheimnis).update(`${t}.${rohBody}`).digest("hex")}`;

/* ---------- Stripe-REST ---------- */
function form(obj, praefix = "", aus = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const name = praefix ? `${praefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((x, i) => (typeof x === "object" ? form(x, `${name}[${i}]`, aus) : aus.push(`${encodeURIComponent(`${name}[${i}]`)}=${encodeURIComponent(x)}`)));
    else if (typeof v === "object") form(v, name, aus);
    else aus.push(`${encodeURIComponent(name)}=${encodeURIComponent(v)}`);
  }
  return aus.join("&");
}
export const formKodieren = (obj) => form(obj);

export function stripeClient(geheim, fetchFn = globalThis.fetch) {
  const aufruf = async (methode, pfad, daten) => {
    const r = await fetchFn(`https://api.stripe.com/v1${pfad}`, {
      method: methode,
      headers: { authorization: `Bearer ${geheim}`, "content-type": "application/x-www-form-urlencoded" },
      body: methode === "GET" ? undefined : form(daten || {}),
    });
    const d = await r.json();
    if (!r.ok) throw new Error((d && d.error && d.error.message) || `Stripe-Fehler ${r.status}`);
    return d;
  };
  return { post: (pfad, daten) => aufruf("POST", pfad, daten), get: (pfad) => aufruf("GET", pfad) };
}

/* ---------- Supabase mit Service-Role ---------- */
export function supabaseServer(url, serviceKey, anonKey, fetchFn = globalThis.fetch) {
  const basis = String(url || "").replace(/\/$/, "");
  return {
    /* Wer ist der Nutzer hinter dem Token? */
    async nutzer(token) {
      if (!token) return null;
      const r = await fetchFn(`${basis}/auth/v1/user`, { headers: { apikey: anonKey, authorization: `Bearer ${token}` } });
      if (!r.ok) return null;
      const d = await r.json();
      return d && d.id ? d : null;
    },
    async rpc(name, args) {
      const r = await fetchFn(`${basis}/rest/v1/rpc/${name}`, { method: "POST", headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}`, "content-type": "application/json" }, body: JSON.stringify(args || {}) });
      const d = await r.json().catch(() => null);
      if (!r.ok) throw new Error((d && (d.message || d.hint)) || `Supabase-Fehler ${r.status}`);
      return d;
    },
    async profil(id, spalten = "id,name,rolle,stripe_kunde,plan,pro_bis") {
      const r = await fetchFn(`${basis}/rest/v1/profile?id=eq.${encodeURIComponent(id)}&select=${encodeURIComponent(spalten)}`, { headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` } });
      const d = await r.json().catch(() => []);
      return Array.isArray(d) && d[0] ? d[0] : null;
    },
  };
}

/* ---------- Checkout vorbereiten ---------- */
const UUID = /^[0-9a-f-]{36}$/i;
export function checkoutPruefen({ angebot, ziele, zahler }) {
  const a = ANGEBOTE[angebot];
  if (!a) throw new Error("Unbekanntes Angebot.");
  const liste = [...new Set((Array.isArray(ziele) ? ziele : []).map(String).filter((z) => UUID.test(z)))];
  if (!liste.length) throw new Error("Kein Konto ausgewählt.");
  if (liste.length > a.maxZiele) throw new Error(a.maxZiele === 1 ? "Dieses Angebot gilt für ein Konto." : `Höchstens ${a.maxZiele} Konten.`);
  return { plan: a.plan, ziele: liste, zahler: String(zahler) };
}

export function checkoutParameter({ angebot, preis, ziele, zahler, email, kunde, origin }) {
  const a = ANGEBOTE[angebot];
  const meta = { zahler, plan: a.plan, angebot, ziele: ziele.join(",") };
  const p = {
    mode: "subscription",
    line_items: [{ price: preis, quantity: 1 }],
    client_reference_id: zahler,
    success_url: `${origin}/?pro=danke`,
    cancel_url: `${origin}/?konto`,
    locale: "de",
    allow_promotion_codes: "true",
    billing_address_collection: "auto",
    metadata: meta,
    subscription_data: { metadata: meta },
    consent_collection: { terms_of_service: "required" },
  };
  if (kunde) p.customer = kunde; else if (email) p.customer_email = email;
  return p;
}

/* ---------- Ereignis → abo_setzen ---------- */
const sekundenZuIso = (s) => (s ? new Date(Number(s) * 1000).toISOString() : null);
/* Liefert die Argumente für abo_setzen oder null, wenn das Ereignis nichts mit Abos zu tun hat. */
export async function ereignisZuAbo(ev, stripe) {
  const typ = ev.type || "";
  let sub = null;
  if (typ === "checkout.session.completed") {
    const s = ev.data.object;
    if (s.mode !== "subscription" || !s.subscription) return null;
    sub = await stripe.get(`/subscriptions/${s.subscription}`);
  } else if (typ.startsWith("customer.subscription.")) {
    sub = ev.data.object;
  } else if (typ === "invoice.paid" || typ === "invoice.payment_failed") {
    const inv = ev.data.object;
    const id = typeof inv.subscription === "string" ? inv.subscription : inv.subscription && inv.subscription.id;
    if (!id) return null;
    sub = await stripe.get(`/subscriptions/${id}`);
  } else return null;
  const m = (sub && sub.metadata) || {};
  if (!m.zahler || !UUID.test(m.zahler)) return null;
  const ziele = String(m.ziele || "").split(",").map((z) => z.trim()).filter((z) => UUID.test(z));
  const periode = sub.current_period_end || (sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].current_period_end) || null;
  const status = typ === "customer.subscription.deleted" ? "canceled" : typ === "invoice.payment_failed" ? "past_due" : sub.status;
  return {
    p_abo_id: sub.id, p_zahler: m.zahler, p_plan: m.plan === "familie" ? "familie" : "pro", p_status: status,
    p_bis: sekundenZuIso(periode), p_ziele: ziele, p_kunde: typeof sub.customer === "string" ? sub.customer : (sub.customer && sub.customer.id) || null,
    p_ereignis: ev.id, p_typ: typ,
  };
}

/* Rohen Anfragekörper lesen (bodyParser ist für den Webhook abgeschaltet) */
export function rohBody(req) {
  return new Promise((loese, lehne) => {
    if (typeof req.body === "string") return loese(req.body);
    if (req.body && Buffer.isBuffer(req.body)) return loese(req.body.toString("utf8"));
    const teile = [];
    req.on("data", (c) => teile.push(c));
    req.on("end", () => loese(Buffer.concat(teile).toString("utf8")));
    req.on("error", lehne);
  });
}
