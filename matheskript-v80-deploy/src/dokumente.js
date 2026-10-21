/* ======================================================================
   DOKUMENTE – die Liste für die Seite „Dokumente“ (Arbeitsmenü, F).
   Reine Daten ohne React, damit ein Node-Test sie prüfen kann.

   REGEL: Jedes PDF/Dokument, das in einer Sitzung entsteht (Schulbuch, Arbeitsheft,
   Businessplan …), bekommt hier einen Eintrag – mit Seitenzahl und Zweck.
     - datei: Pfad unter public/ (z. B. "/dokumente/xyz.pdf"), oder null, solange die Datei
       noch nicht im Projekt liegt (dann zeigt die Box „Datei noch nicht hier abgelegt“).
     - cover: optional, Pfad des Covers (Rückseite + Rücken + Vorderseite) unter public/; die Karte zeigt dann den Knopf „Cover“ (Download).
     - reihe: kleine Goldzeile über dem Titel (Reihe/Band, z. B. „Schulbuch Band 2“); titel: nur der eigentliche Titel, groß in Weiß.
     - seiten: Zahl, oder null, wenn die Seitenzahl noch offen ist.
     - zwecke: Kurzmarken, jede aus ZWECK_MARKEN.
     - oeffentlich: true = steht auf dem Blog auch ohne Passwort (nur Leseproben – nie ganze Bücher, sie werden auf Amazon verkauft).
     - amazon: Link zur Amazon-Seite; bei Leseproben ohne Link zeigt die Karte „Bald auf Amazon“.
     - farbe: Lack der Karte (eine aus FARBEN, Paletten in kursFarben.js), motiv: Bild rechts oben (funcDokumentMotive.jsx).
   VERTRAULICHE Dokumente (Businessplan, Finanzplan) nicht unter public/ legen:
   alles in public/ ist für jeden mit dem direkten Link abrufbar, sobald der Seitenschutz aus ist.
   Ausnahme: /druck/… und /buecher/<band>/<Name>.pdf bleiben immer hinter dem Passwort (middleware.js).
   ====================================================================== */

export const ZWECK_MARKEN = ["Amazon", "Hier auf der Seite", "Investoren", "Intern"];

export const FARBEN = ["porzellan", "tiefblau", "granat", "lackschwarz", "nachtblau", "amethyst"];

export const DOKUMENTE = [
  {
    id: "leseprobe-ableitungen",
    farbe: "nachtblau",
    motiv: "tangente",
    reihe: "Leseprobe · Schulbuch Band 1",
    titel: "Ableitungen",
    art: "PDF · Inhalt und Kapitel I",
    seiten: 10,
    zwecke: ["Hier auf der Seite"],
    zweck: "Öffentliche Leseprobe für den Blog: Titel, Inhalt und Kapitel I „Geraden und Änderungsraten“ samt Training I (Seiten 1–10 des Schulbuchs). Das ganze Buch gibt es nur auf Amazon.",
    stand: "21.10.2026",
    datei: "/leseprobe/Ableitungen-Leseprobe.pdf",
    oeffentlich: true,
    amazon: null,
  },
  {
    id: "leseprobe-vektoren",
    farbe: "tiefblau",
    motiv: "ebene",
    reihe: "Leseprobe · Schulbuch Band 2",
    titel: "Vektoren, Geraden und Ebenen",
    art: "PDF · Inhalt und Kapitel I",
    seiten: 10,
    zwecke: ["Hier auf der Seite"],
    zweck: "Öffentliche Leseprobe für den Blog: Titel, Inhalt und Kapitel I „Geraden und Gleichungssysteme“ samt Training I (Seiten 1–10 des Schulbuchs). Das ganze Buch gibt es nur auf Amazon.",
    stand: "21.10.2026",
    datei: "/leseprobe/Vektoren-Leseprobe.pdf",
    oeffentlich: true,
    amazon: null,
  },
  {
    id: "schulbuch-ableitungen",
    farbe: "porzellan",
    motiv: "tangente",
    reihe: "Schulbuch Band 1",
    titel: "Ableitungen",
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
    reihe: "Schulbuch Band 2",
    titel: "Vektoren, Geraden und Ebenen",
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
    reihe: "Schulbuch Band 3 · Probekapitel",
    titel: "Kurvendiskussion",
    art: "PDF · Schulbuch",
    seiten: 12,
    zwecke: ["Intern"],
    zweck: "Probekapitel I „Extrempunkte“ (waagrechte Tangente, Vorzeichenwechsel, zweite Ableitung) – Test des Schulbuch-Agenten. Weitere Kapitel folgen, danach Amazon-Ausgabe.",
    stand: "21.10.2026",
    datei: "/buecher/kurvendiskussion/Kurvendiskussion.pdf",
  },  {
    id: "schulbuch-dreiecksgeometrie",
    farbe: "amethyst",
    motiv: "dreieck",
    reihe: "Schulbuch Band 4",
    titel: "Dreiecksgeometrie",
    art: "PDF · Schulbuch",
    seiten: 65,
    zwecke: ["Amazon", "Hier auf der Seite"],
    zweck: "Klasse 7–9: Flächen, Winkel und Konstruktionen, Dreieck und Kreis, Pythagoras, Ähnlichkeit, Trigonometrie – mit Klassenarbeits-Training und Lösungen. Auf der Seite Grundlage des Kurses Dreiecksgeometrie; Amazon-Ausgabe folgt (noch ohne QR-Codes).",
    stand: "21.10.2026",
    datei: "/buecher/dreiecksgeometrie/Dreiecksgeometrie.pdf",
  },

  {
    id: "druck-ableitungen-innenteil",
    farbe: "porzellan",
    motiv: "druck",
    reihe: "Amazon-Druckausgabe Band 1",
    titel: "Ableitungen",
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
    reihe: "Amazon-Druckausgabe Band 2",
    titel: "Vektoren, Geraden und Ebenen",
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
    reihe: "Businessplan 2027–2029",
    titel: "Mythos Mathe",
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
    reihe: "Arbeitsheft · Matheskript Band 2",
    titel: "Pen & Paper",
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
    reihe: "Arbeitsheft Analysis 01",
    titel: "Von der Geraden zur Kurvendiskussion",
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
    reihe: "Grundlagendokument · Version 1.0",
    titel: "Die Matheskript Bibel",
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

/* Voller Name für Vorlese-Texte und Suche: kleine Goldzeile + Haupttitel („Schulbuch Band 2 – Vektoren, Geraden und Ebenen“). */
export const vollTitel = (d) => (d.reihe ? `${d.reihe} – ${d.titel}` : d.titel);
