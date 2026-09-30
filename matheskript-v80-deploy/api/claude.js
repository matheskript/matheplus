/* ============================================================
   Vercel-Funktion: Weiterleitung der App-Anfragen an die Claude-API.
   - Der API-Schlüssel liegt nur hier auf dem Server (Umgebungsvariable
     ANTHROPIC_API_KEY in Vercel) und gelangt nie in den Browser.
   - Das Modell legt der Server fest (ANTHROPIC_MODEL, sonst Standard).
   - Einfache Begrenzung pro Gerät/IP gegen Missbrauch (best effort,
     pro Server-Instanz im Speicher).
   ============================================================ */

const STANDARD_MODELL = "claude-sonnet-5-5";
const MAX_TOKENS = 4000;
const MAX_ANFRAGEN_PRO_STUNDE = Number(process.env.KI_LIMIT_PRO_STUNDE || 40);
const zaehler = new Map(); // schluessel -> [zeitstempel, ...]

function fehler(res, status, nachricht) {
  res.status(status).json({ error: { type: "proxy_error", message: nachricht } });
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

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") return fehler(res, 405, "Nur POST-Anfragen sind erlaubt.");

  const schluessel = process.env.ANTHROPIC_API_KEY;
  if (!schluessel) {
    return fehler(res, 500, "Auf dem Server ist noch kein API-Schlüssel hinterlegt (ANTHROPIC_API_KEY in Vercel eintragen und neu deployen).");
  }

  const geraet = String(req.headers["x-geraet"] || "").slice(0, 80);
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  if (begrenzt(geraet || ip || "unbekannt")) {
    return fehler(res, 429, "Zu viele Anfragen in kurzer Zeit. Bitte in einer Stunde noch einmal versuchen.");
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return fehler(res, 400, "Die Anfrage ist unvollständig (keine Nachrichten).");
  }

  const anfrage = {
    model: process.env.ANTHROPIC_MODEL || STANDARD_MODELL,
    max_tokens: Math.min(Number(body.max_tokens) || 1500, MAX_TOKENS),
    messages: body.messages,
  };
  if (typeof body.system === "string") anfrage.system = body.system;

  try {
    const antwort = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": schluessel,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(anfrage),
    });
    const text = await antwort.text();
    let daten;
    try { daten = JSON.parse(text); } catch { return fehler(res, 502, "Die KI hat keine lesbare Antwort geliefert."); }
    return res.status(antwort.status).json(daten);
  } catch (e) {
    return fehler(res, 502, "Die KI ist gerade nicht erreichbar. Bitte gleich noch einmal versuchen.");
  }
}
