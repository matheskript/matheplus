/* ======================================================================
   ANGEBOTE – der zentrale Schalter (reine Logik, ohne React, testbar mit Node).

   Stand 19.10.2026: Start als privater Blog. Die Seite verkauft nichts und wirbt nicht
   für Coaching; einziger Zahlungseingang ist die freiwillige Spende (spenden.js).
   Alles Kommerzielle bleibt im Code, ist aber hinter diesen Schaltern abgeschaltet.

   Wieder einschalten (z. B. nächste Woche): die Zeile auf true setzen, Tests, Push.
     pro          Pro/Familie: „Pro werden“, Karte „Mein Plan“ (Bezahlung), Stripe-Routen in api/stripe
     kurse        Mathe Abi Masterclass (+ Zugangslinks), Mathe checken, Nachhilfe-Kurs, „Bald“-Kurse
     elternabend  Elternabend (Kachel, Anmeldung)
     landingpage  Verkaufsseite /landingpage
     coaching     „Mit Basti sprechen“ / Coaching-Kontakt (zusammen mit COACHING in base3.jsx)
     agb          AGB und Widerrufsbelehrung in der Fußzeile und bei der Anmeldung
   Mit dem Passwort „skript“ (Sitzung) bleiben die abgeschalteten Seiten für Basti erreichbar.
   ====================================================================== */

export const ANGEBOT = {
  pro: false,
  kurse: false,
  elternabend: false,
  landingpage: false,
  coaching: false,
  agb: false,
};

/* Ansichten, die zu einem Schalter gehören (Ansicht = Schlüssel in func10.jsx / pfade.js) */
export const ANSICHTEN_JE_ANGEBOT = {
  kurse: ["masterclass", "mckurs", "mczugang", "mathecheck", "nachhilfekurs"],
  elternabend: ["elternabend"],
  landingpage: ["landingpage"],
};

/* Ist diese Ansicht gerade abgeschaltet? `frei` = Basti hat das Passwort eingegeben. */
export function ansichtGesperrt(ansicht, frei = false, cfg = ANGEBOT) {
  if (frei) return false;
  return Object.entries(ANSICHTEN_JE_ANGEBOT).some(([schalter, liste]) => !cfg[schalter] && liste.includes(ansicht));
}

/* Abgeschaltete Ansicht → Startseite (Direktlink, Lesezeichen, alter Mail-Link); sonst unverändert */
export const ansichtErlaubt = (ansicht, frei = false, cfg = ANGEBOT) => (ansichtGesperrt(ansicht, frei, cfg) ? "start" : ansicht);
