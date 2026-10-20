/* Kleine Konstanten aus großen Seiten-Modulen – damit func10 diese Seiten nachladen kann */
export const LANDING = "landingpage";

export const ENTWUERFE = [
  { ansicht: "entwurf-start", name: "Neue Startseite", kurz: "Weniger Mathe-Stress – Einstieg & Überblick" },
  { ansicht: "entwurf-checken", name: "Mathe-Checken", kurz: "Kursseite – 2-Monats-Konzept" },
  { ansicht: "entwurf-pakete", name: "Tool-Pakete", kurz: "Kostenlos, Plus & Maximum" },
  { ansicht: "entwurf-werkzeuge", name: "Alle Werkzeuge", kurz: "Alte Startseite mit allen Rechentools" },
  { ansicht: "entwurf-vorher", name: "50-Euro-Seite (17.10.)", kurz: "Website vor der Max-Version – Desktop & Mobil" },
  { ansicht: "entwurf-biro", name: "Biro-Edition (20.10.)", kurz: "Website am 20.10. – Desktop & Mobil" },
];
/* Weitere passwortgeschützte Seiten im Arbeitsmenü (Landingpage und Entwürfe stehen separat) */
export const WEITERE_SEITEN = [
  { ansicht: "elternabend", name: "Elternabend" },
  { ansicht: "masterclass", name: "Mathe Abi Masterclass" },
  { ansicht: "mathecheck", name: "Mathe checken" },
  { ansicht: "nachhilfekurs", name: "Nachhilfe-Kurs" },
];
export const istEntwurf = (a) => typeof a === "string" && a.startsWith("entwurf-");

/* Passwort-Sperre (gemeinsam für Entwürfe, 7 Mathe-Mythen, Elternabend). Im Code steht nur der SHA-256-Wert.
   Einmal entsperrt, bleibt der Zugang für diese Browser-Sitzung offen. Das ist eine Sperre im Browser, kein Server-Schutz. */
export const PW_HASH = "744ac4c7a298e917d88972fbbf5a9440cc04c24e24b63c62d292b1771ab69d7b";
export const FREI_KEY = "mm-entwurf-frei";
export const EVENT_FREI = "mm-entwurf-frei-geaendert";
export const istFrei = () => { try { return sessionStorage.getItem(FREI_KEY) === PW_HASH; } catch (e) { return false; } };
async function sha256(t) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
}
/* Prüft das Passwort; bei Erfolg wird die Sitzung freigeschaltet und true geliefert */
export async function entsperren(pw) {
  let ok = false;
  try { ok = (await sha256(String(pw).trim().toLowerCase())) === PW_HASH; } catch (e) { ok = false; }
  if (ok) {
    try { sessionStorage.setItem(FREI_KEY, PW_HASH); } catch (e) { /* privat */ }
    try { window.dispatchEvent(new Event(EVENT_FREI)); } catch (e) { /* ohne Fenster */ }
  }
  return ok;
}
