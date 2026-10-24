/* ======================================================================
   Herausgeber der Werkzeug-Seiten (SEO/KI). Seit 24.10.2026 tritt auf der
   Seite keine Person mehr auf – Mythos Mathe spricht für sich, ein Name steht
   nur im Impressum. Für JSON-LD ist der Autor deshalb die Organisation; die
   Zeile unter jedem Werkzeug und in den vorgerenderten Seiten nennt nur die Marke.
   ====================================================================== */
export const HERAUSGEBER = {
  name: "Mythos Mathe",
  kurz: "Kostenlose Mathe-Lern-App fürs Gymnasium: Werkzeuge mit Rechenweg, Mathilda AI prüft das Blatt, Klasse 5 bis Abitur.",
};

/* schema.org Organization für das JSON-LD (author und publisher) */
export const autorLd = (basis) => ({
  "@type": "Organization",
  name: HERAUSGEBER.name,
  url: basis,
  description: HERAUSGEBER.kurz,
  address: { "@type": "PostalAddress", addressLocality: "Konstanz", addressCountry: "DE" },
});
