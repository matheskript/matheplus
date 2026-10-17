/* Legt die Stripe-Produkte und Preise für Pro/Familie an und gibt die Umgebungsvariablen für Vercel aus.
   Einmal ausführen:  STRIPE_SECRET_KEY=sk_test_… node scripts/stripe-preise.mjs
   (zuerst mit dem Test-Schlüssel, später mit dem Live-Schlüssel noch einmal). */
const geheim = process.env.STRIPE_SECRET_KEY;
if (!geheim) { console.error("STRIPE_SECRET_KEY fehlt."); process.exit(1); }
const form = (o) => Object.entries(o).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
async function post(pfad, daten) {
  const r = await fetch(`https://api.stripe.com/v1${pfad}`, { method: "POST", headers: { authorization: `Bearer ${geheim}`, "content-type": "application/x-www-form-urlencoded" }, body: form(daten) });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error ? d.error.message : `Stripe ${r.status}`);
  return d;
}
const pro = await post("/products", { name: "Mythos Mathe Pro", description: "Lernpfad, Prüfungsmodus, Mathilda ohne Tagesgrenze – für ein Schülerkonto" });
const familie = await post("/products", { name: "Mythos Mathe Familie", description: "Pro für bis zu drei Kinder" });
const monat = await post("/prices", { product: pro.id, currency: "eur", unit_amount: 990, "recurring[interval]": "month", nickname: "Pro monatlich" });
const jahr = await post("/prices", { product: pro.id, currency: "eur", unit_amount: 7900, "recurring[interval]": "year", nickname: "Pro jährlich" });
const fam = await post("/prices", { product: familie.id, currency: "eur", unit_amount: 1490, "recurring[interval]": "month", nickname: "Familie monatlich" });
console.log(`\nIn Vercel eintragen (Project → Settings → Environment Variables):\nSTRIPE_PRICE_PRO_MONAT=${monat.id}\nSTRIPE_PRICE_PRO_JAHR=${jahr.id}\nSTRIPE_PRICE_FAMILIE_MONAT=${fam.id}\nSTRIPE_SECRET_KEY=${geheim.slice(0, 12)}…\nSTRIPE_WEBHOOK_SECRET=whsec_… (aus Stripe → Developers → Webhooks → Endpoint https://<domain>/api/stripe/webhook)\nSUPABASE_SERVICE_ROLE_KEY=… (Supabase → Settings → API, nie im Frontend)\n`);
