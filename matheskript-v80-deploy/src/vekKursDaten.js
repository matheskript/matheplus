/* ============================================================
   Kurs Vektoren, Geraden und Ebenen – die Module (reine Daten, auch für die
   Startseiten-Kachel und Tests). Ein Modul je Unterkapitel des Hefts.
   werkzeuge = Schlüssel in KURS_WERKZEUGE (funcVekKurs.jsx).
   ============================================================ */
/* Das Heft ist fertig: die Lesefunktion ersetzt den Platzhalter */
export const BUCH_BEREIT = true;

/* Ein Modul je Unterkapitel des Hefts. von/bis = Buchseiten (Dateinummer in schulbuch/vektoren/pages = Seitenzahl).
   Die Auftaktseite eines Kapitels gehört wie im Differentialrechnungskurs zum ersten Modul. */
export const KURS_MODULE = [
  { id: "zweigeraden", kap: "I", nr: "1", titel: "Zwei Geraden in der Ebene", frage: "Wo treffen sich zwei Geraden – und warum ist das schon ein Gleichungssystem?", von: 3, bis: 5,
    werkzeuge: ["geraden2d", "lgs"] },
  { id: "gauss", kap: "I", nr: "2", titel: "Das Gauß-Verfahren", frage: "Wie löst man drei Gleichungen mit drei Unbekannten mit System?", von: 6, bis: 7,
    werkzeuge: ["lgs"] },
  { id: "loesungsmengen", kap: "I", nr: "3", titel: "Keine, eine oder unendlich viele Lösungen", frage: "Woran erkennt man, wie viele Lösungen ein Gleichungssystem hat?", von: 8, bis: 9,
    werkzeuge: ["lgs", "ebenevsebene"] },
  { id: "t1", kap: "I", nr: "", titel: "Training I", frage: "Gleichungssysteme – prüfe dich, bevor es in den Raum geht.", von: 10, bis: 10,
    werkzeuge: ["lgs", "geraden2d"] },
  { id: "raum", kap: "II", nr: "4", titel: "Punkte im Raum", frage: "Wie beschreibt man die Lage eines Punktes im Raum?", von: 11, bis: 13,
    werkzeuge: ["ebenen", "vektorgenerator"] },
  { id: "vektoren", kap: "II", nr: "5", titel: "Vektoren", frage: "Was haben alle Pfeile mit gleicher Richtung und Länge gemeinsam?", von: 14, bis: 15,
    werkzeuge: ["vektorgenerator", "zweipunkte"] },
  { id: "rechnen", kap: "II", nr: "6", titel: "Rechnen mit Vektoren", frage: "Wie addiert und vervielfacht man Verschiebungen?", von: 16, bis: 17,
    werkzeuge: ["vektorgenerator"] },
  { id: "linear", kap: "II", nr: "7", titel: "Kollinear, komplanar, linear abhängig", frage: "Wann liegen Vektoren auf einer Linie oder in einer Ebene?", von: 18, bis: 19,
    werkzeuge: ["vektorgenerator", "lgs", "kreuzprodukt"] },
  { id: "t2", kap: "II", nr: "", titel: "Training II", frage: "Punkte und Vektoren im Raum – prüfe dich, bevor die Geraden kommen.", von: 20, bis: 20,
    werkzeuge: ["vektorgenerator", "zweipunkte"] },
  { id: "parameter", kap: "III", nr: "8", titel: "Geraden in Parameterform", frage: "Wie beschreibt man eine Gerade im Raum, wo y = m · x + c nicht mehr reicht?", von: 21, bis: 23,
    werkzeuge: ["zweipunkte", "geraden"] },
  { id: "lagegeraden", kap: "III", nr: "9", titel: "Lage zweier Geraden", frage: "Schneiden, parallel, identisch – oder windschief?", von: 24, bis: 25,
    werkzeuge: ["geraden", "lgs"] },
  { id: "t3", kap: "III", nr: "", titel: "Training III", frage: "Geraden im Raum – alles klar?", von: 26, bis: 26,
    werkzeuge: ["geraden", "zweipunkte"] },
  { id: "skalar", kap: "IV", nr: "10", titel: "Skalarprodukt und Orthogonalität", frage: "Wie erkennt man an Zahlen, dass zwei Vektoren senkrecht stehen?", von: 27, bis: 29,
    werkzeuge: ["winkel", "vektorgenerator"] },
  { id: "winkelvek", kap: "IV", nr: "11", titel: "Winkel zwischen Vektoren", frage: "Wie berechnet man den Winkel zwischen zwei Richtungen im Raum?", von: 30, bis: 31,
    werkzeuge: ["winkel"] },
  { id: "kreuz", kap: "IV", nr: "12", titel: "Das Kreuzprodukt", frage: "Gibt es einen Vektor, der auf zwei Vektoren zugleich senkrecht steht?", von: 32, bis: 33,
    werkzeuge: ["kreuzprodukt", "dreipunkte"] },
  { id: "t4", kap: "IV", nr: "", titel: "Training IV", frage: "Skalar- und Kreuzprodukt gemischt.", von: 34, bis: 34,
    werkzeuge: ["winkel", "kreuzprodukt"] },
  { id: "ebeneparam", kap: "V", nr: "13", titel: "Ebenen in Parameterform", frage: "Wie spannt man mit zwei Richtungen eine Ebene auf?", von: 35, bis: 37,
    werkzeuge: ["dreipunkte", "ebenen"] },
  { id: "normalenform", kap: "V", nr: "14", titel: "Normalenform und Koordinatenform", frage: "Reicht ein einziger Vektor, um eine Ebene festzulegen?", von: 38, bis: 39,
    werkzeuge: ["dreipunkte", "kreuzprodukt", "ebenen"] },
  { id: "spurpunkte", kap: "V", nr: "15", titel: "Umwandeln, Spurpunkte, Zeichnen", frage: "Wie wechselt man zwischen den Formen – und wie zeichnet man eine Ebene?", von: 40, bis: 41,
    werkzeuge: ["ebenen", "dreipunkte"] },
  { id: "geradeebene", kap: "V", nr: "16", titel: "Gerade und Ebene", frage: "Durchstößt die Gerade die Ebene, liegt sie darin oder läuft sie parallel?", von: 42, bis: 43,
    werkzeuge: ["abstaende", "ebenen"] },
  { id: "ebeneebene", kap: "V", nr: "17", titel: "Zwei und drei Ebenen", frage: "Wo schneiden sich Ebenen – und was hat das mit Gleichungssystemen zu tun?", von: 44, bis: 45,
    werkzeuge: ["ebenevsebene", "lgs"] },
  { id: "t5", kap: "V", nr: "", titel: "Training V", frage: "Ebenen in allen Formen – alles klar?", von: 46, bis: 46,
    werkzeuge: ["ebenevsebene", "dreipunkte", "ebenen"] },
  { id: "hnf", kap: "VI", nr: "18", titel: "Abstand Punkt–Ebene", frage: "Wie weit ist ein Punkt von einer Ebene entfernt?", von: 47, bis: 49,
    werkzeuge: ["abstaende"] },
  { id: "punktgerade", kap: "VI", nr: "19", titel: "Abstand Punkt–Gerade", frage: "Wo liegt der Lotfußpunkt – und wie findet man ihn auf zwei Wegen?", von: 50, bis: 51,
    werkzeuge: ["abstaende", "geraden"] },
  { id: "windschief", kap: "VI", nr: "20", titel: "Abstand windschiefer Geraden", frage: "Wie nah kommen sich zwei Geraden, die sich nie treffen?", von: 52, bis: 53,
    werkzeuge: ["abstaende", "geraden"] },
  { id: "schnittwinkel", kap: "VI", nr: "21", titel: "Schnittwinkel", frage: "Unter welchem Winkel schneiden sich Geraden und Ebenen?", von: 54, bis: 55,
    werkzeuge: ["winkel", "ebenevsebene"] },
  { id: "spiegeln", kap: "VI", nr: "22", titel: "Spiegelungen", frage: "Wie spiegelt man einen Punkt an einem Punkt oder an einer Ebene?", von: 56, bis: 57,
    werkzeuge: ["abstaende", "vektorgenerator"] },
  { id: "t6", kap: "VI", nr: "", titel: "Training VI", frage: "Abstände, Winkel, Spiegelungen – prüfe dich.", von: 58, bis: 58,
    werkzeuge: ["abstaende", "winkel"] },
  { id: "abitur", kap: "A", nr: "", titel: "Abitur-Training", frage: "Alles zusammen – auf Abiturniveau.", von: 59, bis: 60,
    werkzeuge: ["abstaende", "ebenevsebene", "geraden"] },
  { id: "rueckblick", kap: "A", nr: "", titel: "Rückblick · Alles auf einen Blick", frage: "Alle Formen, Verfahren und Formeln auf einer Seite.", von: 61, bis: 61, werkzeuge: [] },
  { id: "loes", kap: "L", nr: "", titel: "Lösungen", frage: "Alle Lösungen zum Nachschlagen und Vergleichen.", von: 62, bis: 68, werkzeuge: [] },
];

export const KAPITEL = { I: "Geraden und Gleichungssysteme", II: "Vektoren im Raum", III: "Geraden im Raum", IV: "Skalarprodukt und Kreuzprodukt", V: "Ebenen", VI: "Abstände, Winkel, Spiegelungen", A: "Abitur", L: "Anhang" };

/* Kurztitel und Kurznamen der Kapitel für die Übersicht – damit jede Überschrift in eine Zeile passt */
export const TITEL_KURZ = {
  loesungsmengen: "Anzahl der Lösungen", linear: "Linear abhängig", skalar: "Skalarprodukt", normalenform: "Normalenform",
  spurpunkte: "Spurpunkte und Zeichnen", windschief: "Windschiefe Geraden", rueckblick: "Rückblick",
};
export const KAPITEL_KURZ = { I: "Gleichungssysteme", II: "Vektoren im Raum", III: "Geraden im Raum", IV: "Skalar- und Kreuzprodukt", V: "Ebenen", VI: "Abstände und Winkel", A: "Abitur", L: "Anhang" };
