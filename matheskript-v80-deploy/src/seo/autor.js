/* ======================================================================
   Autor der Werkzeug-Seiten (SEO/KI, 21.10.2026). Steht aufklappbar unter jedem
   Werkzeug (funcWerkzeugInfo.jsx), in den vorgerenderten Seiten und als
   schema.org-Person im JSON-LD. Nur belegte Fakten, exakt so von Basti bestätigt –
   keine Gesamtzahl der Preise.
   ====================================================================== */
export const AUTOR = {
  name: "Basti Blumenröther",
  rolle: "Gründer von Mythos Mathe",
  kurz: "Mathestudium an der Universität Konstanz, langjährige Arbeit mit Schülern, mehrfacher Preisträger im Landes- und Bundeswettbewerb Mathematik.",
  preise: [
    "Landeswettbewerb Mathematik Baden-Württemberg: 3. Preis in Klasse 8 (1. Runde); in Klasse 9 und 10 jeweils 1. Preis in der 1. und in der 2. Runde, dazu die Seminarteilnahme",
    "Bundeswettbewerb Mathematik: drei Jahre in Folge 1. Preis in der 1. Runde; 3. Preis in der 2. Runde (Klasse 11) und 2. Preis in der 2. Runde (Klasse 12)",
    "Tag der Mathematik, Universität Konstanz: Sieger des Einzelwettbewerbs",
  ],
};

/* schema.org Person für das JSON-LD */
export const autorLd = (basis) => ({
  "@type": "Person",
  name: AUTOR.name,
  jobTitle: AUTOR.rolle,
  description: AUTOR.kurz,
  award: AUTOR.preise,
  worksFor: { "@type": "Organization", name: "Mythos Mathe", url: basis },
});
