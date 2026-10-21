/* ======================================================================
   KOPFLEISTE – reine Daten (ohne React, Node-testbar). Oberfläche: funcKopfleiste.jsx.

   Besuchermenü (nicht angemeldet): feste Punkte in der Kopfleiste, kein Ausklappen.
   Vision ist eine eigene Seite (/vision, funcVision.jsx). Mathe lernen ist ein
   Abschnitt der Startseite (id lernen in funcStartseite.jsx, Sprung
   „kopfmenue-anker“ in sprung.js).
   ====================================================================== */
export const BESUCHER_MENUE = [
  { id: "vision", name: "Vision", ziel: { ansicht: "vision" } },
  { id: "lernen", name: "Mathe lernen", ziel: { ansicht: "start" }, anker: "lernen" },
  { id: "mathilda", name: "Mathilda AI", ziel: { ansicht: "analyse", foto: "blatt" } },
  { id: "blog", name: "Blog", ziel: { ansicht: "blog" } },
];

/* Welcher Punkt des Besuchermenüs gehört zur Seite? (wird gold unterstrichen) */
export function besucherAktiv(ansicht, foto) {
  if (ansicht === "vision") return "vision";
  if (ansicht === "blog") return "blog";
  if (ansicht === "analyse" && (!foto || foto === "blatt")) return "mathilda";
  return null;
}
