/* Stripe-Bausteine und -Routen ohne Netz: fetch wird nachgebildet. */
import test from "node:test";
import assert from "node:assert/strict";
import { ANGEBOTE, checkoutParameter, checkoutPruefen, ereignisZuAbo, formKodieren, preisId, signaturBauen, signaturPruefen, stripeClient } from "../src/stripeServer.js";

const Z = "11111111-1111-4111-8111-111111111111", K1 = "22222222-2222-4222-8222-222222222222", K2 = "33333333-3333-4333-8333-333333333333";

test("Webhook-Signatur: gültig, falsches Geheimnis, abgelaufen, verfälscht", () => {
  const body = JSON.stringify({ id: "evt_1", type: "invoice.paid" });
  const kopf = signaturBauen(body, "whsec_test");
  assert.equal(signaturPruefen(body, kopf, "whsec_test"), true);
  assert.equal(signaturPruefen(body, kopf, "whsec_anders"), false);
  assert.equal(signaturPruefen(body + " ", kopf, "whsec_test"), false);
  assert.equal(signaturPruefen(body, signaturBauen(body, "whsec_test", Math.floor(Date.now() / 1000) - 1000), "whsec_test"), false);
  assert.equal(signaturPruefen(body, "", "whsec_test"), false);
  assert.equal(signaturPruefen(body, "t=abc,v1=zz", "whsec_test"), false);
});

test("Checkout prüfen: Angebote, Ziele, Grenzen", () => {
  assert.deepEqual(checkoutPruefen({ angebot: "pro_monat", ziele: [K1, K1], zahler: Z }), { plan: "pro", ziele: [K1], zahler: Z });
  assert.throws(() => checkoutPruefen({ angebot: "pro_monat", ziele: [K1, K2], zahler: Z }), /ein Konto/);
  assert.throws(() => checkoutPruefen({ angebot: "familie_monat", ziele: [K1, K2, Z, "44444444-4444-4444-8444-444444444444"], zahler: Z }), /Höchstens 3/);
  assert.throws(() => checkoutPruefen({ angebot: "gold", ziele: [K1], zahler: Z }), /Unbekannt/);
  assert.throws(() => checkoutPruefen({ angebot: "pro_jahr", ziele: ["nix"], zahler: Z }), /Kein Konto/);
  assert.equal(preisId("pro_monat", { STRIPE_PRICE_PRO_MONAT: "price_1" }), "price_1");
  assert.equal(preisId("pro_jahr", {}), null);
  for (const a of Object.values(ANGEBOTE)) assert.ok(["pro", "familie"].includes(a.plan));
});

test("Checkout-Parameter: Abo-Modus, Metadaten auf Sitzung und Abo, Kunde statt E-Mail", () => {
  const p = checkoutParameter({ angebot: "familie_monat", preis: "price_f", ziele: [K1, K2], zahler: Z, email: "e@x.de", kunde: null, origin: "https://app.test" });
  assert.equal(p.mode, "subscription");
  assert.equal(p.line_items[0].price, "price_f");
  assert.equal(p.metadata.ziele, `${K1},${K2}`);
  assert.equal(p.subscription_data.metadata.plan, "familie");
  assert.equal(p.customer_email, "e@x.de");
  assert.equal(p.success_url, "https://app.test/?pro=danke");
  const q = checkoutParameter({ angebot: "pro_jahr", preis: "price_j", ziele: [K1], zahler: Z, email: "e@x.de", kunde: "cus_9", origin: "https://app.test" });
  assert.equal(q.customer, "cus_9"); assert.equal(q.customer_email, undefined);
  const f = formKodieren(p);
  assert.match(f, /line_items%5B0%5D%5Bprice%5D=price_f/);
  assert.match(f, /subscription_data%5Bmetadata%5D%5Bzahler%5D=/);
});

test("Ereignis → abo_setzen: Checkout, Rechnung, Kündigung, Fremdes ignoriert", async () => {
  const sub = { id: "sub_1", status: "active", customer: "cus_1", current_period_end: 1800000000, metadata: { zahler: Z, plan: "familie", ziele: `${K1},${K2},kaputt` } };
  const stripe = { get: async (pfad) => { assert.equal(pfad, "/subscriptions/sub_1"); return sub; } };
  const a = await ereignisZuAbo({ id: "evt_1", type: "checkout.session.completed", data: { object: { mode: "subscription", subscription: "sub_1" } } }, stripe);
  assert.deepEqual(a, { p_abo_id: "sub_1", p_zahler: Z, p_plan: "familie", p_status: "active", p_bis: new Date(1800000000 * 1000).toISOString(), p_ziele: [K1, K2], p_kunde: "cus_1", p_ereignis: "evt_1", p_typ: "checkout.session.completed" });
  const b = await ereignisZuAbo({ id: "evt_2", type: "invoice.paid", data: { object: { subscription: "sub_1" } } }, stripe);
  assert.equal(b.p_status, "active"); assert.equal(b.p_ereignis, "evt_2");
  const c = await ereignisZuAbo({ id: "evt_3", type: "invoice.payment_failed", data: { object: { subscription: "sub_1" } } }, stripe);
  assert.equal(c.p_status, "past_due");
  const d = await ereignisZuAbo({ id: "evt_4", type: "customer.subscription.deleted", data: { object: { ...sub, status: "canceled" } } }, stripe);
  assert.equal(d.p_status, "canceled");
  assert.equal(await ereignisZuAbo({ id: "evt_5", type: "checkout.session.completed", data: { object: { mode: "payment" } } }, stripe), null);
  assert.equal(await ereignisZuAbo({ id: "evt_6", type: "payment_intent.succeeded", data: { object: {} } }, stripe), null);
  const ohne = { get: async () => ({ id: "sub_x", status: "active", metadata: {} }) };
  assert.equal(await ereignisZuAbo({ id: "evt_7", type: "invoice.paid", data: { object: { subscription: "sub_x" } } }, ohne), null);
});

test("Stripe-Client: Fehler werden zu lesbaren Ausnahmen", async () => {
  const c = stripeClient("sk_test", async (url, init) => {
    assert.equal(init.headers.authorization, "Bearer sk_test");
    return { ok: false, status: 402, json: async () => ({ error: { message: "Karte abgelehnt" } }) };
  });
  await assert.rejects(c.post("/checkout/sessions", { mode: "subscription" }), /Karte abgelehnt/);
});

/* ---------- Routen ---------- */
process.env.STRIPE_SECRET_KEY = "sk_test"; process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
process.env.SUPABASE_URL = "https://beispiel.supabase.co"; process.env.SUPABASE_SERVICE_ROLE_KEY = "service"; process.env.SUPABASE_ANON_KEY = "anon";
process.env.STRIPE_PRICE_PRO_MONAT = "price_m";
import { ANGEBOT } from "../src/angebot.js";
const { default: checkout } = await import("../api/stripe/checkout.js");
const { default: webhook } = await import("../api/stripe/webhook.js");
const { default: portal } = await import("../api/stripe/portal.js");
const res = () => { const r = { code: 200, body: null, status(c) { r.code = c; return r; }, json(b) { r.body = b; return r; } }; return r; };

let rpcAufrufe = [];
globalThis.fetch = async (url, init = {}) => {
  const u = String(url);
  if (u.endsWith("/auth/v1/user")) return init.headers.authorization === "Bearer gut" ? { ok: true, json: async () => ({ id: Z, email: "eltern@x.de" }) } : { ok: false, json: async () => ({}) };
  if (u.includes("/rest/v1/rpc/darf_bezahlen_fuer")) { const b = JSON.parse(init.body); return { ok: true, json: async () => b.ziel === K1 }; }
  if (u.includes("/rest/v1/rpc/abo_setzen")) { rpcAufrufe.push(JSON.parse(init.body)); return { ok: true, json: async () => ({ doppelt: false, aktiv: true, freigeschaltet: 1 }) }; }
  if (u.includes("/rest/v1/profile?")) return { ok: true, json: async () => [{ id: Z, stripe_kunde: "cus_7" }] };
  if (u.endsWith("/v1/checkout/sessions")) { assert.match(init.body, /customer=cus_7/); return { ok: true, json: async () => ({ url: "https://checkout.stripe.com/c/x" }) }; }
  if (u.endsWith("/v1/billing_portal/sessions")) return { ok: true, json: async () => ({ url: "https://billing.stripe.com/p/x" }) };
  if (u.includes("/v1/subscriptions/sub_1")) return { ok: true, json: async () => ({ id: "sub_1", status: "active", customer: "cus_7", current_period_end: 1800000000, metadata: { zahler: Z, plan: "pro", ziele: K1 } }) };
  throw new Error(`unerwartet: ${u}`);
};

test("Routen checkout und portal: ohne Angebot „Pro“ (angebot.js) antworten sie mit 404", async () => {
  const vorher = ANGEBOT.pro;
  try {
    ANGEBOT.pro = false;
    let r = res(); await checkout({ method: "POST", headers: { host: "app.test", authorization: "Bearer gut" }, body: { angebot: "pro_monat", ziele: [K1] } }, r); assert.equal(r.code, 404);
    r = res(); await portal({ method: "POST", headers: { host: "app.test", authorization: "Bearer gut" } }, r); assert.equal(r.code, 404);
  } finally { ANGEBOT.pro = vorher; }
});

test("Route checkout: Anmeldung, Berechtigung, Sitzung", async () => {
  ANGEBOT.pro = true;
  let r = res(); await checkout({ method: "POST", headers: { host: "app.test" }, body: { angebot: "pro_monat", ziele: [K1] } }, r); assert.equal(r.code, 401);
  r = res(); await checkout({ method: "POST", headers: { host: "app.test", authorization: "Bearer gut" }, body: { angebot: "pro_monat", ziele: [K2] } }, r); assert.equal(r.code, 403);
  r = res(); await checkout({ method: "POST", headers: { host: "app.test", authorization: "Bearer gut" }, body: { angebot: "pro_jahr", ziele: [K1] } }, r); assert.equal(r.code, 400);   // kein Preis hinterlegt
  r = res(); await checkout({ method: "POST", headers: { host: "app.test", authorization: "Bearer gut" }, body: { angebot: "pro_monat", ziele: [K1] } }, r);
  assert.equal(r.code, 200); assert.equal(r.body.url, "https://checkout.stripe.com/c/x");
});

test("Route webhook: Signatur, Verarbeitung, Unbekanntes ignoriert", async () => {
  rpcAufrufe = [];
  const body = JSON.stringify({ id: "evt_9", type: "checkout.session.completed", data: { object: { mode: "subscription", subscription: "sub_1" } } });
  let r = res(); await webhook({ method: "POST", headers: { "stripe-signature": "t=1,v1=00" }, body }, r); assert.equal(r.code, 400);
  r = res(); await webhook({ method: "POST", headers: { "stripe-signature": signaturBauen(body, "whsec_test") }, body }, r);
  assert.equal(r.code, 200); assert.equal(r.body.ok, true);
  assert.equal(rpcAufrufe.length, 1); assert.equal(rpcAufrufe[0].p_abo_id, "sub_1"); assert.deepEqual(rpcAufrufe[0].p_ziele, [K1]);
  const fremd = JSON.stringify({ id: "evt_10", type: "charge.refunded", data: { object: {} } });
  r = res(); await webhook({ method: "POST", headers: { "stripe-signature": signaturBauen(fremd, "whsec_test") }, body: fremd }, r);
  assert.equal(r.code, 200); assert.equal(r.body.ignoriert, "charge.refunded");
});

test("Route portal: Kunde nötig", async () => {
  ANGEBOT.pro = true;
  let r = res(); await portal({ method: "POST", headers: { host: "app.test" } }, r); assert.equal(r.code, 401);
  r = res(); await portal({ method: "POST", headers: { host: "app.test", authorization: "Bearer gut" } }, r); assert.equal(r.code, 200); assert.match(r.body.url, /billing/);
});
