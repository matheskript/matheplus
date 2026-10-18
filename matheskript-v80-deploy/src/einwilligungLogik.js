/* ======================================================================
   einwilligungLogik.js – reine Logik zur Eltern-Einwilligung unter 16 (ohne React, ohne Supabase).
   Gegenstück in der Datenbank: supabase/einwilligung.sql (einwilligung_ok).
   ====================================================================== */

export const EINWILLIGUNG_FASSUNG = "2026-10-18";
export const FEHLT = "eltern_einwilligung_fehlt";
export const FEHLT_TEXT = "Dafür brauchen wir zuerst die Zustimmung deiner Eltern. Den Link für sie findest du oben in deinem Konto.";

/* Was die Eltern freigeben können */
export const UMFANG = [
  { id: "konto", pflicht: true, titel: "Lernen im Konto speichern",
    text: "Lernstand, Trainingsergebnisse, Fortschritt in „Mathe entdecken“ sowie freiwillig Schulform, Klasse und Mathenoten werden im Konto gespeichert, damit sie auf jedem Gerät da sind und verbundene Eltern sie sehen." },
  { id: "ki", titel: "Mathilda (KI-Tutor) nutzen",
    text: "Fragen, Rechenwege und Fotos von Rechenblättern gehen zusammen mit Vorname, Klasse und einem kurzen Lernstandsauszug an den KI-Dienst Claude von Anthropic (USA). Fotos werden bei uns nicht gespeichert; Anthropic nutzt die Daten nicht zum Training." },
  { id: "klassen", titel: "Klassen beitreten",
    text: "Tritt dein Kind mit einem Code einer Klasse bei, sieht die Lehrkraft bzw. der Nachhilfelehrer Aktivität und Lernfortschritt. In der Klassen-Challenge erscheint ein Spitzname nur, wenn dein Kind das einschaltet." },
];

/* Wie der Server: Wer darf in diesem Bereich im Konto speichern?
   profil.einwilligung = Antwort von meine_einwilligung() (nur bei Schülern unter 16 geladen) */
export function darfImKonto(profil, bereich = "konto") {
  if (!profil) return true;                 // ohne Profil wird ohnehin nichts gespeichert
  if ((profil.rolle || "schueler") !== "schueler") return true;
  if (profil.unter16 === false) return true;
  if (profil.unter16 == null) return false; // erst Alter angeben
  const e = profil.einwilligung || {};
  return !!e[bereich];
}

/* Zustand für die Oberfläche des Schülers */
export function einwilligungStatus(profil) {
  if (!profil || (profil.rolle || "schueler") !== "schueler") return "nicht_noetig";
  if (profil.unter16 == null) return "alter_fehlt";
  if (profil.unter16 === false) return "nicht_noetig";
  return profil.einwilligung && profil.einwilligung.konto ? "erteilt" : "fehlt";
}

export const einwilligungsLink = (basis, token) => `${String(basis).replace(/\/$/, "")}/einwilligung?k=${encodeURIComponent(token || "")}`;

export function tokenAusUrl(href) {
  try {
    const u = new URL(href);
    const k = u.searchParams.get("k") || "";
    return /^[0-9a-f]{8,64}$/i.test(k) ? k.toLowerCase() : "";
  } catch (e) { return ""; }
}

export function elternBitte(vorname, link) {
  const n = String(vorname || "").trim();
  return `Hallo! ${n ? `Hier ist ${n}. ` : ""}Ich möchte mit Mythos Mathe lernen. Weil ich unter 16 bin, brauche ich eure Zustimmung, damit mein Lernstand im Konto gespeichert werden darf. Hier könnt ihr alles nachlesen und zustimmen: ${link}`;
}

export const mailGueltig = (m) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(m || "").trim());

/* Fehlermeldung aus Supabase in einen verständlichen Satz übersetzen (null = nicht unser Fall) */
export function einwilligungsFehler(fehler) {
  const t = String((fehler && (fehler.message || fehler.details || fehler.hint)) || fehler || "");
  return t.includes(FEHLT) ? FEHLT_TEXT : null;
}
