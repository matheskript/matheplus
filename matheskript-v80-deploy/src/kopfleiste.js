/* ======================================================================
   KOPFLEISTE – reine Daten (ohne React, Node-testbar). Oberfläche: funcKopfleiste.jsx.

   Besuchermenü (nicht angemeldet): feste Punkte in der Kopfleiste, kein Ausklappen.
   Vision ist eine eigene Seite (/vision, funcVision.jsx). Mathe lernen ist ein
   Abschnitt der Startseite (id lernen in funcStartseite.jsx, Sprung
   „kopfmenue-anker“ in sprung.js).
   ====================================================================== */
export const BESUCHER_MENUE = [
  { id: "vision", name: "Vision", ziel: { ansicht: "vision" }, kurz: "Warum jeder Mathe versteht", kurzEn: "Why anyone gets math" },
  { id: "lernen", name: "Mathe lernen", ziel: { ansicht: "start" }, anker: "lernen", kurz: "Kurse, Trainer und Werkzeuge", kurzEn: "Courses, trainers and tools" },
  { id: "mathilda", name: "Mathilda AI", ziel: { ansicht: "analyse", foto: "blatt" }, kurz: "Sie prüft deinen Rechenweg", kurzEn: "She checks your working" },
  { id: "blog", name: "Blog", ziel: { ansicht: "blog" }, kurz: "Ideen und Hintergründe", kurzEn: "Ideas and background" },
];

/* Welcher Punkt des Besuchermenüs gehört zur Seite? (wird gold unterstrichen) */
export function besucherAktiv(ansicht, foto) {
  if (ansicht === "vision") return "vision";
  if (ansicht === "blog") return "blog";
  if (ansicht === "analyse" && (!foto || foto === "blatt")) return "mathilda";
  return null;
}
