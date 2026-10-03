/* ======================================================================
   Gemeinsame Bausteine der Bezahlfunktionen (kein eigener Endpunkt –
   Dateien mit "_" am Anfang veröffentlicht Vercel nicht als Funktion).

   Umgebungsvariablen in Vercel:
     STRIPE_SECRET_KEY          sk_live_… bzw. sk_test_…
     STRIPE_WEBHOOK_SECRET      whsec_… (vom Webhook-Endpunkt im Stripe-Dashboard)
     SUPABASE_URL               wie VITE_SUPABASE_URL
     SUPABASE_SERVICE_ROLE_KEY  Service-Role-Schlüssel (NIE im Browser verwenden)
   ====================================================================== */
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

/* Alle verkäuflichen Produkte an EINER Stelle. Die Preise liegen als Produkte
   in Stripe und werden über den Lookup-Key gefunden – so funktioniert derselbe
   Code im Test- und im Live-Konto. `preis` (Cent) dient nur der Anzeige/Prüfung. */
export const PRODUKTE = {
  analysis1: {
    name: "Selbstlernkurs Analysis 1 – Geraden",
    beschreibung: "Videokurs mit Lektionen, Merksätzen und Kurz-Checks. Unbefristeter Zugang, ohne persönliche Korrektur.",
    preis: 5000,
    lookupKey: "analysis1_einmal",
    abo: false,
  },
  unlimited: {
    name: "Mythos Mathe Unlimited",
    beschreibung: "Alle Trainingsgeräte in Üben und Prüfung ohne Tageslimit. Monatlich kündbar.",
    preis: 2000,
    lookupKey: "unlimited_monat",
    abo: true,
  },
};

/* Veranstaltungen mit begrenzten Plätzen. Preis je Platz in Cent. */
export const EVENTS = {
  elternabend_2026_11_01: {
    name: "Elternabend 1. November 2026 – Evelyn's Café",
    beschreibung: "Inklusive zwei Getränke, ein Snack und Kursunterlagen mit Stift, Heft und Block.",
    preis: 2700,
    lookupKey: "elternabend_2026_11_01",
    maxPlaetze: 40,
    maxProBuchung: 4,
    buchbarBis: "2026-11-01T12:00:00+01:00",
  },
};

let _stripe = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY fehlt in Vercel.");
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

let _admin = null;
export function admin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt in Vercel.");
  if (!_admin) _admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return _admin;
}

/* Angemeldeten Nutzer aus dem Supabase-Token im Authorization-Header lesen. */
export async function nutzerAus(req) {
  const kopf = String(req.headers.authorization || "");
  const token = kopf.startsWith("Bearer ") ? kopf.slice(7) : "";
  if (!token) return null;
  const { data, error } = await admin().auth.getUser(token);
  return error ? null : data.user;
}

export function fehler(res, status, nachricht) {
  res.status(status).json({ error: { message: nachricht } });
}

/* Basis-URL der App für Rücksprünge aus dem Checkout. */
export function herkunft(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}

/* Abo-Periodenende: seit Stripe-API 2025-03 an den Abo-Positionen, vorher am Abo selbst. */
export function periodenEnde(abo) {
  const s = abo.current_period_end ?? abo.items?.data?.[0]?.current_period_end;
  return s ? new Date(s * 1000).toISOString() : null;
}

/* Stripe-Preis zum Produkt (wird je Server-Instanz zwischengespeichert). */
const _preise = new Map();
export async function preisId(p) {
  if (_preise.has(p.lookupKey)) return _preise.get(p.lookupKey);
  const { data } = await stripe().prices.list({ lookup_keys: [p.lookupKey], active: true, limit: 1 });
  if (!data[0]) throw new Error(`In Stripe fehlt ein aktiver Preis mit Lookup-Key ${p.lookupKey}.`);
  if (data[0].unit_amount !== p.preis) throw new Error(`Preis ${p.lookupKey} in Stripe (${data[0].unit_amount}) passt nicht zur App (${p.preis}).`);
  _preise.set(p.lookupKey, data[0].id);
  return data[0].id;
}

export const aboAktiv = (status) => ["active", "trialing"].includes(status);
