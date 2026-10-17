/* Kleine Konstanten aus großen Seiten-Modulen – damit func10 diese Seiten nachladen kann */
export const LANDING = "landingpage";

export const ENTWUERFE = [
  { ansicht: "entwurf-start", name: "Neue Startseite", kurz: "Weniger Mathe-Stress – Einstieg & Überblick" },
  { ansicht: "entwurf-checken", name: "Mathe-Checken", kurz: "Kursseite – 2-Monats-Konzept" },
  { ansicht: "entwurf-pakete", name: "Tool-Pakete", kurz: "Kostenlos, Plus & Maximum" },
  { ansicht: "entwurf-werkzeuge", name: "Alle Werkzeuge", kurz: "Alte Startseite mit allen Rechentools" },
  { ansicht: "entwurf-vorher", name: "Vorher: Stand 17.10.", kurz: "Website vor der Max-Version – Desktop & Mobil" },
];
export const istEntwurf = (a) => typeof a === "string" && a.startsWith("entwurf-");
