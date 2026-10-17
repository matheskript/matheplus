/* ============================================================
   Vercel Cron: tägliche Push-Erinnerung (siehe vercel.json → crons).
   Nur an Geräte, deren Konto an diesem Tag noch nicht geübt hat (push_empfaenger()).
   Aus, bis eingetragen: PUSH_AN=ja, VITE_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY,
   VAPID_KONTAKT (mailto:…), SUPABASE_SERVICE_ROLE_KEY. CRON_SECRET setzt Vercel.
   Abgelaufene Geräte (404/410) werden gelöscht.
   ============================================================ */
import webpush from "web-push";
import { supabaseServer } from "../../src/stripeServer.js";

const TEXTE = [
  "Zehn Minuten reichen, um dranzubleiben.",
  "Dein Plan wartet – eine Einheit, dann ist der Tag gesichert.",
  "Kurz üben statt lange vor der Klausur pauken.",
  "Eine Aufgabe heute ist besser als fünf am Wochenende.",
];

export default async function handler(req, res) {
  const geheim = process.env.CRON_SECRET;
  if (!geheim || req.headers.authorization !== `Bearer ${geheim}`) return res.status(401).json({ error: { message: "Kein Zugang." } });
  if ((process.env.PUSH_AN || "").toLowerCase() !== "ja") return res.status(200).json({ aus: true });
  const oeff = process.env.VITE_VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY, kontakt = process.env.VAPID_KONTAKT || "mailto:info@mythosmathe.de";
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!oeff || !priv || !url || !service) return res.status(500).json({ error: { message: "VAPID- oder Supabase-Schlüssel fehlt." } });
  webpush.setVapidDetails(kontakt, oeff, priv);
  const sb = supabaseServer(url, service, null);
  let liste;
  try { liste = await sb.rpc("push_empfaenger"); } catch (e) { return res.status(500).json({ error: { message: e.message } }); }
  const text = TEXTE[new Date().getUTCDate() % TEXTE.length];
  const gesendet = [], weg = [];
  await Promise.all((liste || []).map(async (a) => {
    const nutzlast = JSON.stringify({ titel: a.name ? `${a.name}, kurz Mathe?` : "Kurz Mathe?", text, url: "/?ansicht=meintraining", tag: "mm-erinnerung" });
    try { await webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, nutzlast, { TTL: 6 * 3600 }); gesendet.push(a.endpoint); }
    catch (e) { if (e.statusCode === 404 || e.statusCode === 410) weg.push(a.endpoint); }
  }));
  try { await sb.rpc("push_ergebnis", { gesendet, weg }); } catch { /* beim nächsten Lauf */ }
  return res.status(200).json({ gesendet: gesendet.length, entfernt: weg.length });
}
