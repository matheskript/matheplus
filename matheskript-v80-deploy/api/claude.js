/* ============================================================
   Vercel-Funktion: Weiterleitung der App-Anfragen an die Claude-API.
   - Der API-Schlüssel liegt nur hier auf dem Server (Umgebungsvariable
     ANTHROPIC_API_KEY in Vercel) und gelangt nie in den Browser.
   - Das Modell legt der Server fest (ANTHROPIC_MODEL, sonst Standard).
   - Kontingent: angemeldete Nutzer (Authorization: Bearer <Supabase-Token>)
     zählen je Konto und Tag über ki_verbrauchen() (supabase/ki.sql):
     Free KI_FREI_PRO_TAG (Standard 30) Anfragen am Tag, Pro unbegrenzt.
     Ohne Anmeldung gilt die Begrenzung pro Gerät/IP und Stunde (best effort,
     im Speicher der Server-Instanz).
   - Tool Use: Mit `werkzeuge: true` bekommt Mathilda die Rechenwerkzeuge der
     App (src/mathildaWerkzeuge.js: Ableiten, Kurvendiskussion, Binomialverteilung …).
     Sie werden hier serverseitig ausgeführt; die KI formuliert nur.
   ============================================================ */
import { WERKZEUG_DEFINITIONEN, werkzeugAusfuehren } from "../src/mathildaWerkzeuge.js";

const STANDARD_MODELL = "claude-sonnet-5-5";
const MAX_TOKENS = 4000;
const MAX_ANFRAGEN_PRO_STUNDE = Number(process.env.KI_LIMIT_PRO_STUNDE || 40);
const FREI_PRO_TAG = Number(process.env.KI_FREI_PRO_TAG || 30);
const MAX_WERKZEUG_RUNDEN = 6;
const zaehler = new Map(); // schluessel -> [zeitstempel, ...]

function fehler(res, status, nachricht, extra) {
  res.status(status).json({ error: { type: "proxy_error", message: nachricht, ...(extra || {}) } });
}

function begrenzt(schluessel) {
  const jetzt = Date.now(), stunde = 60 * 60 * 1000;
  const liste = (zaehler.get(schluessel) || []).filter((t) => jetzt - t < stunde);
  if (liste.length >= MAX_ANFRAGEN_PRO_STUNDE) { zaehler.set(schluessel, liste); return true; }
  liste.push(jetzt);
  zaehler.set(schluessel, liste);
  if (zaehler.size > 5000) zaehler.clear(); // Speicher klein halten
  return false;
}

/* Kontingent je Konto: Supabase prüft das Token, ki_verbrauchen() zählt.
   Liefert null, wenn kein Token da ist oder Supabase nicht konfiguriert ist (dann gilt die Gerätegrenze). */
async function kontingent(req) {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!token || !url || !anon) return null;
  try {
    const r = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/ki_verbrauchen`, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: anon, authorization: `Bearer ${token}` },
      body: JSON.stringify({ frei_pro_tag: FREI_PRO_TAG }),
    });
    if (r.status === 401) return { ungueltig: true };
    if (!r.ok) return null;   // Funktion fehlt (ki.sql nicht ausgeführt) o. ä.: nicht blockieren
    const d = await r.json();
    return d && typeof d === "object" ? d : null;
  } catch { return null; }
}

async function claude(schluessel, anfrage) {
  const antwort = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": schluessel, "anthropic-version": "2023-06-01" },
    body: JSON.stringify(anfrage),
  });
  const text = await antwort.text();
  let daten = null;
  try { daten = JSON.parse(text); } catch { /* unlesbar */ }
  return { status: antwort.status, daten };
}

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") return fehler(res, 405, "Nur POST-Anfragen sind erlaubt.");

  const schluessel = process.env.ANTHROPIC_API_KEY;
  if (!schluessel) {
    return fehler(res, 500, "Auf dem Server ist noch kein API-Schlüssel hinterlegt (ANTHROPIC_API_KEY in Vercel eintragen und neu deployen).");
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return fehler(res, 400, "Die Anfrage ist unvollständig (keine Nachrichten).");
  }

  /* Einwilligung: Ohne die bestätigte Information über die Übermittlung an Anthropic geht nichts raus.
     Die App setzt den Kopf erst, nachdem im Einwilligungsfenster zugestimmt wurde (src/kiEinwilligung.js). */
  if (String(req.headers["x-ki-einwilligung"] || "") !== "1") {
    return fehler(res, 428, "Bevor Mathilda antwortet, brauchen wir einmal deine Zustimmung. Bitte bestätige sie im Fenster und versuch es dann noch einmal.",
      { grund: "ki_einwilligung" });
  }

  /* Kontingent: erst das Konto, sonst Gerät/IP */
  const konto = await kontingent(req);
  if (konto && konto.ungueltig) return fehler(res, 401, "Die Anmeldung ist abgelaufen. Bitte neu anmelden.");
  if (konto && konto.erlaubt === false && konto.grund === "eltern_einwilligung") {
    return fehler(res, 403, "Für Mathilda fehlt noch die Zustimmung deiner Eltern (bei unter 16) oder deine Altersangabe. Beides findest du in deinem Konto.",
      { grund: "eltern_einwilligung" });
  }
  if (konto && konto.erlaubt === false) {
    return fehler(res, 429, `Dein Tageskontingent ist aufgebraucht (${konto.limit} Anfragen). Morgen geht es weiter – oder mit Pro ohne Grenze.`,
      { kontingent: { anzahl: konto.anzahl, limit: konto.limit, plan: konto.plan } });
  }
  if (!konto) {
    const geraet = String(req.headers["x-geraet"] || "").slice(0, 80);
    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    if (begrenzt(geraet || ip || "unbekannt")) {
      return fehler(res, 429, "Zu viele Anfragen in kurzer Zeit. Bitte in einer Stunde noch einmal versuchen – oder anmelden, dann zählt das Konto.");
    }
  }

  const anfrage = {
    model: process.env.ANTHROPIC_MODEL || STANDARD_MODELL,
    max_tokens: Math.min(Number(body.max_tokens) || 1500, MAX_TOKENS),
    messages: body.messages,
  };
  if (typeof body.system === "string") anfrage.system = body.system;
  if (String(req.headers["x-sprache"] || "") === "en") {
    const hinweis = "LANGUAGE: The student is using the English version of the site. Write every text meant for the student in English "
      + "(explanations, feedback, task texts, hints). Keep any requested JSON structure, keys and formatting exactly as specified; "
      + "only the human-readable values are in English.";
    anfrage.system = anfrage.system ? anfrage.system + "\n\n" + hinweis : hinweis;
  }
  const mitWerkzeugen = body.werkzeuge === true;
  if (mitWerkzeugen) anfrage.tools = WERKZEUG_DEFINITIONEN;

  try {
    let { status, daten } = await claude(schluessel, anfrage);
    if (!daten) return fehler(res, 502, "Die KI hat keine lesbare Antwort geliefert.");
    /* Werkzeugrunden: Mathilda fragt die Engine, der Server rechnet, die KI formuliert */
    const protokoll = [];
    let runden = 0;
    while (mitWerkzeugen && status === 200 && daten.stop_reason === "tool_use" && runden < MAX_WERKZEUG_RUNDEN) {
      runden += 1;
      const aufrufe = (daten.content || []).filter((c) => c.type === "tool_use");
      const ergebnisse = aufrufe.map((c) => {
        const text = werkzeugAusfuehren(c.name, c.input || {});
        protokoll.push({ name: c.name, eingabe: c.input, ergebnis: text });
        return { type: "tool_result", tool_use_id: c.id, content: text };
      });
      anfrage.messages = [...anfrage.messages, { role: "assistant", content: daten.content }, { role: "user", content: ergebnisse }];
      ({ status, daten } = await claude(schluessel, anfrage));
      if (!daten) return fehler(res, 502, "Die KI hat keine lesbare Antwort geliefert.");
    }
    if (status === 200 && daten && typeof daten === "object") {
      if (protokoll.length) daten.werkzeuge = protokoll;
      if (konto) daten.kontingent = { anzahl: konto.anzahl, limit: konto.limit, plan: konto.plan };
    }
    return res.status(status).json(daten);
  } catch (e) {
    return fehler(res, 502, "Die KI ist gerade nicht erreichbar. Bitte gleich noch einmal versuchen.");
  }
}
