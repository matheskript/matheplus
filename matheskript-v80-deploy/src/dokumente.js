/* ======================================================================
   DOKUMENTE – die Liste für die Seite „Dokumente“ (Arbeitsmenü, F).
   Reine Daten ohne React, damit ein Node-Test sie prüfen kann.

   REGEL: Jedes PDF/Dokument, das in einer Sitzung entsteht (Schulbuch, Arbeitsheft,
   Businessplan …), bekommt hier einen Eintrag – mit Seitenzahl und Zweck.
     - datei: Pfad unter public/ (z. B. "/dokumente/xyz.pdf"), oder null, solange die Datei
       noch nicht im Projekt liegt (dann zeigt die Box „Datei noch nicht hier abgelegt“).
     - cover: optional, Pfad des Covers (Rückseite + Rücken + Vorderseite) unter public/; die Karte zeigt dann den Knopf „Cover“ (Download).
     - seiten: Zahl, oder null, wenn die Seitenzahl noch offen ist.
     - zwecke: Kurzmarken, jede aus ZWECK_MARKEN.
     - farbe: Lack der Karte (eine aus FARBEN, Paletten in kursFarben.js), motiv: Bild rechts oben (funcDokumentMotive.jsx).
   VERTRAULICHE Dokumente (Businessplan, Finanzplan) nicht unter public/ legen:
   alles in public/ ist für jeden mit dem direkten Link abrufbar, sobald der Seitenschutz aus ist.
   Ausnahme: /druck/… und /buecher/<band>/<Name>.pdf bleiben immer hinter dem Passwort (middleware.js).
   ====================================================================== */

export const ZWECK_MARKEN = ["Amazon", "Hier auf der Seite", "Investoren", "Intern"];

export const FARBEN = ["porzellan", "tiefblau", "granat", "lackschwarz", "nachtblau"];

export const DOKUMENTE = [
  {
    id: "schulbuch-ableitungen",
    farbe: "porzellan",
    motiv: "tangente",
    titel: "Schulbuch Band 1 – Ableitungen",
    art: "PDF · Schulbuch",
    seiten: 50,
    zwecke: ["Amazon", "Hier auf der Seite"],
    zweck: "Amazon-Ausgabe (Print-on-Demand und E-Book, A4 in Farbe). Auf der Seite ist es die Grundlage des Kurses Differentialrechnung (zum Lesen im Kurs, ohne PDF-Download). Seit 20.10. mit QR-Codes zu 110 Aufgaben (neue Übungsblätter unter mythosmathe.de/b1/…).",
    stand: "20.10.2026",
    datei: "/buecher/ableitungen/Ableitungen.pdf",
  },
  {
    id: "schulbuch-vektoren",
    farbe: "tiefblau",
    motiv: "ebene",
    titel: "Schulbuch Band 2 – Vektoren, Geraden und Ebenen",
    art: "PDF · Schulbuch",
    seiten: 70,
    zwecke: ["Amazon", "Hier auf der Seite"],
    zweck: "Amazon-Ausgabe (Print-on-Demand und E-Book, A4 in Farbe). Auf der Seite ist es die Grundlage des Kurses Vektoren, Geraden und Ebenen. Seit 20.10. mit QR-Codes zu 153 Aufgaben (mythosmathe.de/b2/…).",
    stand: "20.10.2026",
    datei: "/buecher/vektoren/Vektoren.pdf",
  },
  {
    id: "schulbuch-kurvendiskussion",
    farbe: "granat",
    motiv: "extrem",
    titel: "Schulbuch Band 3 – Kurvendiskussion (Probekapitel)",
    art: "PDF · Schulbuch",
    seiten: 12,
    zwecke: ["Intern"],
    zweck: "Probekapitel I „Extrempunkte“ (waagrechte Tangente, Vorzeichenwechsel, zweite Ableitung) – Test des Schulbuch-Agenten. Weitere Kapitel folgen, danach Amazon-Ausgabe.",
    stand: "21.10.2026",
    datei: "/buecher/kurvendiskussion/Kurvendiskussion.pdf",
  },
  {
    id: "druck-ableitungen-innenteil",
    farbe: "porzellan",
    motiv: "druck",
    titel: "Amazon-Druckausgabe Band 1 – Ableitungen",
    art: "PDF · Druckausgabe KDP",
    seiten: 58,
    zwecke: ["Amazon"],
    zweck: "Hochladen bei Kindle Direct Publishing als Manuskript: A4 mit 3,2 mm Beschnitt, Premium-Farbe. Vorspann I–VIII stellt Mythos Mathe vor (Teil der Leseprobe), danach das Buch mit QR-Codes zu jeder Rechenaufgabe. Vor dem Upload in kdp.json Impressum-Adresse eintragen. Cover: Rückseite, Buchrücken (3,46 mm für 58 Seiten) und Vorderseite in einer Datei, mit Beschnitt und weißem Feld unten rechts für den Barcode, den KDP setzt.",
    stand: "20.10.2026",
    datei: "/druck/Ableitungen-Druck.pdf",
    cover: "/druck/Ableitungen-Umschlag.pdf",
  },
  {
    id: "druck-vektoren-innenteil",
    farbe: "tiefblau",
    motiv: "druck",
    titel: "Amazon-Druckausgabe Band 2 – Vektoren, Geraden und Ebenen",
    art: "PDF · Druckausgabe KDP",
    seiten: 78,
    zwecke: ["Amazon"],
    zweck: "Hochladen bei Kindle Direct Publishing als Manuskript: A4 mit 3,2 mm Beschnitt, Premium-Farbe. Vorspann I–VIII mit Mythos Mathe (Leseprobe), danach das Buch mit QR-Codes zu den Rechenaufgaben. Vor dem Upload in kdp.json Impressum-Adresse eintragen. Cover: Rückseite, Buchrücken (4,65 mm für 78 Seiten) und Vorderseite in einer Datei, mit Beschnitt und weißem Feld unten rechts für den Barcode, den KDP setzt.",
    stand: "20.10.2026",
    datei: "/druck/Vektoren-Druck.pdf",
    cover: "/druck/Vektoren-Umschlag.pdf",
  },
  {
    id: "businessplan",
    farbe: "lackschwarz",
    motiv: "diagramm",
    titel: "Businessplan Mythos Mathe 2027–2029",
    art: "PDF · Investoren-Dossier",
    seiten: 8,
    zwecke: ["Investoren"],
    zweck: "Unterlage für das Investorengespräch (150.000 bzw. 250.000 €). Alle Zahlen sind Vorschläge und von dir noch nicht bestätigt; Kontaktdaten fehlen noch auf Cover und Seite 8.",
    stand: "20.10.2026",
    datei: null,
  },
  {
    id: "arbeitsheft-penpaper",
    farbe: "nachtblau",
    motiv: "heft",
    titel: "Arbeitsheft Pen & Paper (Matheskript Band 2)",
    art: "PDF · Arbeitsheft",
    seiten: 10,
    zwecke: ["Hier auf der Seite"],
    zweck: "Inhaltliche Grundlage des Pen-&-Paper-Kurses in der App. Das PDF selbst wird in der App nicht angeboten.",
    stand: "18.10.2026",
    datei: null,
  },
  {
    id: "arbeitsheft-analysis-01",
    farbe: "nachtblau",
    motiv: "heft",
    titel: "Arbeitsheft Analysis 01 – Von der Geraden zur Kurvendiskussion",
    art: "PDF · Arbeitsheft",
    seiten: null,
    zwecke: ["Intern"],
    zweck: "Band 4 des Matheskript-Systems: 8 Bausteine mit über 60 Aufgaben für Klasse 10–13.",
    stand: "",
    datei: null,
  },
  {
    id: "matheskript-bibel",
    farbe: "granat",
    motiv: "buch",
    titel: "Die Matheskript Bibel (Version 1.0)",
    art: "PDF · Grundlagendokument",
    seiten: 23,
    zwecke: ["Intern"],
    zweck: "Einstieg in das Matheskript-System: Pen & Paper, Denken, Struktur, Zahlen, Verstehen. Ausgangspunkt für die geplanten fünf Bände.",
    stand: "",
    datei: null,
  },
];

/* Kleine Zusammenfassung für die Kopfzeile der Seite */
export function dokumenteUebersicht(liste = DOKUMENTE) {
  const seiten = liste.reduce((s, d) => s + (d.seiten || 0), 0);
  const ohneDatei = liste.filter((d) => !d.datei).length;
  return { anzahl: liste.length, seiten, ohneDatei };
}
