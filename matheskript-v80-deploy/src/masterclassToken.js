/* ============================================================
   Masterclass-Zugangscodes – reine Logik (ohne React, ohne Supabase; auch in Node testbar).

   Ein Code sieht so aus: MC + 8 Zufallszeichen + 2 Prüfzeichen, z. B. „MC7K2Q9XFAH3“
   (angezeigt als „MC7K-2Q9X-FAH3“). Alphabet nach Crockford (ohne I, L, O, U),
   damit sich nichts verwechseln lässt; beim Eintippen werden O → 0, I/L → 1.

   Die Prüfzeichen fangen Tippfehler ab und lassen die Passwortseite (middleware.js)
   ohne Datenbankabfrage erkennen, ob ein Link überhaupt ein Masterclass-Link sein kann.
   Ob er gilt (angelegt, nicht gesperrt, nicht abgelaufen, nicht von jemand anderem
   eingelöst), entscheidet allein die Datenbank (supabase/masterclass.sql).

   Dieselbe Rechnung steht in middleware.js und in supabase/masterclass.sql
   (Funktion masterclass_pruefzeichen) – tests/masterclass.test.mjs prüft, dass alle gleich rechnen.
   ============================================================ */

export const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const SALZ = "mythosmathe-masterclass-v1";
export const PRAEFIX = "MC";
export const LINK_BASIS = "https://mythosmathe.de";
export const LINK_PFAD = "/masterclass/zugang";

/* Eingabe säubern: Großbuchstaben, ohne Leer- und Bindestriche, Verwechsler ersetzen */
export function tokenNormal(roh) {
  return String(roh || "").toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .replace(/O/g, "0").replace(/[IL]/g, "1").replace(/U/g, "V");
}

/* Form stimmt (ohne Prüfzeichen-Rechnung)? */
export const tokenForm = (t) => new RegExp(`^${PRAEFIX}[${ALPHABET}]{10}$`).test(String(t || ""));

/* Für die Anzeige: MC7K-2Q9X-FAH3 */
export const tokenAnzeige = (t) => {
  const n = tokenNormal(t);
  return n.length === 12 ? `${n.slice(0, 4)}-${n.slice(4, 8)}-${n.slice(8)}` : n;
};

async function sha256(text) {
  const daten = new TextEncoder().encode(text);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", daten));
}

/* Zwei Prüfzeichen aus den ersten 10 Bit von SHA-256(SALZ:körper) */
export async function pruefzeichen(koerper) {
  const h = await sha256(`${SALZ}:${koerper}`);
  const v = (h[0] << 2) | (h[1] >> 6);
  return ALPHABET[v >> 5] + ALPHABET[v & 31];
}

/* Vollständige Prüfung der Form inkl. Prüfzeichen */
export async function tokenGueltig(roh) {
  const t = tokenNormal(roh);
  if (!tokenForm(t)) return false;
  return (await pruefzeichen(t.slice(2, 10))) === t.slice(10);
}

/* Neuen Code erzeugen. zufall: optional eigene Zufallsquelle (für Tests) */
export async function tokenErzeugen(zufall) {
  const bytes = zufall || crypto.getRandomValues(new Uint8Array(8));
  let koerper = "";
  for (let i = 0; i < 8; i++) koerper += ALPHABET[bytes[i] & 31];
  return PRAEFIX + koerper + (await pruefzeichen(koerper));
}

export const zugangsLink = (token, basis = LINK_BASIS) => `${basis}${LINK_PFAD}?z=${tokenNormal(token)}`;

/* Code aus einer Adresse oder eingefügtem Link holen: „…/masterclass/zugang?z=MC…“, „MC7K-2Q9X-FAH3“ … */
export function tokenAusText(text) {
  const s = String(text || "");
  const q = /[?&]z=([0-9A-Za-z-]+)/.exec(s);
  if (q) return tokenNormal(q[1]);
  const m = /MC[0-9A-Za-z-]{10,16}/i.exec(s.replace(/\s/g, ""));
  return m ? tokenNormal(m[0]).slice(0, 12) : tokenNormal(s);
}
