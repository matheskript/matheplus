/* ======================================================================
   Tab-Titel je Ansicht (21.10.2026). Werkzeuge: Name aus werkzeuge.js; übrige Seiten
   aus SEITEN_TITEL; sonst nur die Marke. Reine Logik, Node-testbar.
   func10.jsx setzt daraus document.title bei jedem Seitenwechsel – vorher blieb
   im Tab, im Verlauf und in Lesezeichen immer der Titel der zuerst geladenen Seite.
   ====================================================================== */
import { wo } from "./werkzeuge.js";

export const MARKE = "Mythos Mathe";

export const SEITEN_TITEL = {
  start: "Mathe kann jeder verstehen",
  landingpage: "Mathetalent ist ein Mythos",
  vision: "Vision: Eine Generation, die Mathe versteht",
  feedback: "Feedback: Diese Seite ist eine Baustelle",
  blog: "Mathe-Blog",
  trainingszentrum: "Trainingszentrum",
  meintraining: "Mein Mathe-Training",
  trainieren: "Eine Sache trainieren",
  warmup: "5 Minuten Mathe",
  fehlertraining: "Meine Fehler üben",
  pruefung: "Prüfungsmodus",
  klausurnach: "Klassenarbeit nachbereiten",
  training: "Aufgaben trainieren",
  abiketten: "Abi-Ketten",
  abisaetze: "Abi-Sätze",
  abi: "Abi-Zentrum",
  analyse: "Mathilda AI",
  formeln: "Formelsammlung",
  entdecken: "Mathe entdecken",
  unterstufe: "Unterstufe – Klasse 5 und 6",
  diffkurs: "Kurs Differentialrechnung",
  vekkurs: "Kurs Vektoren, Geraden und Ebenen",
  gfs: "GFS-Training",
  penpaperkurs: "Pen & Paper",
  headnumbers: "Kopfrechnen",
  gleichkurs: "Gleichungen lernen",
  lehrkraefte: "Für Lehrkräfte",
  lehrerblatt: "Arbeitsblatt-Generator",
  spenden: "Unterstützen",
  impressum: "Impressum",
  datenschutz: "Datenschutz",
  elternabend: "Elternabend",
  konto: "Mein Konto",
};

/* Titel für den Tab: „Ableitungstrainer – Mythos Mathe“, „Mythos Mathe – Mathe kann jeder verstehen“ (Start) oder nur die Marke */
export function tabTitel(ansicht) {
  const ort = wo(ansicht);
  if (ort && ort.werkzeug) return `${ort.werkzeug.name} – ${MARKE}`;
  if (ansicht === "start") return `${MARKE} – ${SEITEN_TITEL.start}`;
  const t = SEITEN_TITEL[ansicht];
  return t ? `${t} – ${MARKE}` : MARKE;
}
