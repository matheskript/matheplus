/* Onboarding-Speicher (Klasse, Thema …) – aus funcOnboarding.jsx ausgelagert (21.10.2026), damit func2 und
   die Start-Karte nicht die Onboarding-Seite samt Heute-Karte in den Startchunk ziehen. */
export const SCHLUESSEL = "mm-onboarding-v1";
export function onboardingLoeschen() { try { localStorage.removeItem(SCHLUESSEL); } catch { /* egal */ } }
export function onboardingLesen() {
  try { const v = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null"); return v && typeof v === "object" ? v : null; } catch { return null; }
}
export function onboardingSchreiben(v) { try { localStorage.setItem(SCHLUESSEL, JSON.stringify({ ...v, zeit: Date.now() })); } catch { /* privat */ } }
export const stufeAusKlasse = (k) => (!k ? "alle" : k <= 6 ? "unter" : k <= 10 ? "mittel" : "ober");
