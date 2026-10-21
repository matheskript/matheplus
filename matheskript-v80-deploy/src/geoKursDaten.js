/* ============================================================
   Kurs Dreiecksgeometrie – die Module (reine Daten, auch für die
   Startseiten-Kachel, kursStand.js und Tests). Ein Modul je Unterkapitel
   des Schulbuchs „Dreiecksgeometrie“ (Band 4, Klasse 7–9) plus je Kapitel
   ein Training. werkzeuge = Schlüssel in KURS_WERKZEUGE (funcGeoKurs.jsx),
   bei den Unterkapiteln genau die Werkzeuge aus den „In der App“-Kästen
   der Buchseiten (schulbuch/dreiecksgeometrie/viewer.mjs, ZIELE),
   bei den Trainings die Werkzeuge des Kapitels.
   ============================================================ */
/* Die Lesefunktion des Buchs liegt unter /buecher/dreiecksgeometrie (schulbuch/dreiecksgeometrie/LIESMICH.md) */
export const BUCH_BEREIT = true;

/* von/bis = Buchseiten (Dateinummer in schulbuch/dreiecksgeometrie/pages = Seitenzahl).
   Die Auftaktseite eines Kapitels gehört wie in den anderen Kursen zum ersten Modul.
   titel = Überschrift <h2> der ersten Seite, frage = Leitfrage der Seite. */
export const KURS_MODULE = [
  { id: "rechteck", kap: "I", nr: "1", titel: "Rechteck und Quadrat", frage: "Was misst der Flächeninhalt – und warum ist er beim Rechteck „Länge mal Breite“?", von: 3, bis: 5,
    werkzeuge: ["flaechen"] },
  { id: "rechtwinklig", kap: "I", nr: "2", titel: "Das rechtwinklige Dreieck – ein halbes Rechteck", frage: "Wie groß ist ein Dreieck mit einem rechten Winkel?", von: 6, bis: 7,
    werkzeuge: ["flaechen"] },
  { id: "dreieckflaeche", kap: "I", nr: "3", titel: "Jedes Dreieck: Grundseite mal Höhe durch 2", frage: "Wie groß ist ein Dreieck ohne rechten Winkel?", von: 8, bis: 9,
    werkzeuge: ["flaechen"] },
  { id: "vierecke", kap: "I", nr: "4", titel: "Parallelogramm, Trapez und Drachen", frage: "Wie führt man diese Vierecke auf Rechteck und Dreieck zurück?", von: 10, bis: 11,
    werkzeuge: ["flaechen"] },
  { id: "t1", kap: "I", nr: "", titel: "Training I", frage: "Flächen – prüfe dich, bevor es mit Winkeln weitergeht.", von: 12, bis: 12,
    werkzeuge: ["flaechen"] },
  { id: "winkelgeraden", kap: "II", nr: "5", titel: "Winkel an Geraden", frage: "Welche Winkel sind gleich groß, wenn eine Gerade zwei Parallelen schneidet?", von: 13, bis: 15,
    werkzeuge: ["winkelsaetze"] },
  { id: "winkelsumme", kap: "II", nr: "6", titel: "Die Winkelsumme im Dreieck", frage: "Warum haben die drei Winkel jedes Dreiecks zusammen genau 180°?", von: 16, bis: 17,
    werkzeuge: ["winkelsaetze"] },
  { id: "kongruenz", kap: "II", nr: "7", titel: "Kongruente Dreiecke", frage: "Welche drei Angaben legen ein Dreieck eindeutig fest?", von: 18, bis: 19,
    werkzeuge: ["kongruenz"] },
  { id: "linien", kap: "II", nr: "8", titel: "Besondere Linien im Dreieck", frage: "Wo liegt der Punkt, der von drei Orten gleich weit entfernt ist?", von: 20, bis: 21,
    werkzeuge: ["konstruktion"] },
  { id: "t2", kap: "II", nr: "", titel: "Training II", frage: "Winkel und Konstruktionen – prüfe dich, bevor es mit Dreieck und Kreis weitergeht.", von: 22, bis: 22,
    werkzeuge: ["winkelsaetze", "kongruenz", "konstruktion"] },
  { id: "umkreis", kap: "III", nr: "9", titel: "Umkreis und Inkreis", frage: "Welcher Kreis geht durch alle drei Ecken – und welcher berührt alle drei Seiten?", von: 23, bis: 25,
    werkzeuge: ["konstruktion"] },
  { id: "thales", kap: "III", nr: "10", titel: "Der Satz des Thales", frage: "Welcher Winkel entsteht, wenn man einen Kreispunkt mit den Enden eines Durchmessers verbindet?", von: 26, bis: 27,
    werkzeuge: ["thales"] },
  { id: "t3", kap: "III", nr: "", titel: "Training III", frage: "Dreieck und Kreis – prüfe dich, bevor es mit dem Satz des Pythagoras weitergeht.", von: 28, bis: 28,
    werkzeuge: ["konstruktion", "thales"] },
  { id: "pythagoras", kap: "IV", nr: "11", titel: "Der Satz des Pythagoras", frage: "Wie hängen die drei Seiten eines rechtwinkligen Dreiecks zusammen?", von: 29, bis: 31,
    werkzeuge: ["pythagoras"] },
  { id: "pythanwenden", kap: "IV", nr: "12", titel: "Pythagoras anwenden und umkehren", frage: "Wo versteckt sich ein rechtwinkliges Dreieck – und wie weist man einen rechten Winkel nach?", von: 32, bis: 33,
    werkzeuge: ["pythagoras"] },
  { id: "kathetensatz", kap: "IV", nr: "13", titel: "Kathetensatz und Höhensatz", frage: "Was entdeckt man, wenn die Höhe das rechtwinklige Dreieck zerlegt?", von: 34, bis: 35,
    werkzeuge: ["kathetensatz"] },
  { id: "t4", kap: "IV", nr: "", titel: "Training IV", frage: "Der Satz des Pythagoras und seine Familie – prüfe dich, bevor es mit der Ähnlichkeit weitergeht.", von: 36, bis: 36,
    werkzeuge: ["pythagoras", "kathetensatz"] },
  { id: "vergroessern", kap: "V", nr: "14", titel: "Vergrößern und Verkleinern", frage: "Was passiert mit Längen, Winkeln und Flächen, wenn man eine Figur vergrößert?", von: 37, bis: 39,
    werkzeuge: ["strahlensaetze"] },
  { id: "strahlensaetze", kap: "V", nr: "15", titel: "Die Strahlensätze", frage: "Wie berechnet man Längen, die man nicht messen kann?", von: 40, bis: 41,
    werkzeuge: ["strahlensaetze"] },
  { id: "aehnlich", kap: "V", nr: "16", titel: "Ähnliche Dreiecke", frage: "Woran erkennt man ähnliche Dreiecke, ohne alle Seiten zu messen?", von: 42, bis: 43,
    werkzeuge: ["trigonometrie"] },
  { id: "t5", kap: "V", nr: "", titel: "Training V", frage: "Ähnlichkeit – prüfe dich, bevor es mit der Trigonometrie losgeht.", von: 44, bis: 44,
    werkzeuge: ["strahlensaetze", "trigonometrie"] },
  { id: "sinuskosinus", kap: "VI", nr: "17", titel: "Sinus, Kosinus und Tangens", frage: "Warum gehört zu jedem Winkel ein festes Seitenverhältnis?", von: 45, bis: 47,
    werkzeuge: ["trigonometrie"] },
  { id: "seitenwinkel", kap: "VI", nr: "18", titel: "Seiten und Winkel berechnen", frage: "Wie berechnet man aus einem Winkel und einer Seite die anderen Seiten?", von: 48, bis: 49,
    werkzeuge: ["trigonometrie"] },
  { id: "trigoanwenden", kap: "VI", nr: "19", titel: "Trigonometrie anwenden", frage: "Wie misst man Höhen und Steigungen, an die man nicht herankommt?", von: 50, bis: 51,
    werkzeuge: ["trigonometrie"] },
  { id: "t6", kap: "VI", nr: "", titel: "Training VI", frage: "Trigonometrie – prüfe dich, bevor du weitermachst.", von: 52, bis: 52,
    werkzeuge: ["trigonometrie"] },
];

export const KAPITEL = { I: "Flächen", II: "Winkel und Konstruktionen", III: "Dreieck und Kreis", IV: "Der Satz des Pythagoras", V: "Ähnlichkeit", VI: "Trigonometrie" };

/* Kurztitel für die Übersicht und die Kachel – damit jede Überschrift in eine Zeile passt */
export const TITEL_KURZ = {
  rechtwinklig: "Das rechtwinklige Dreieck", dreieckflaeche: "Die Fläche jedes Dreiecks", pythanwenden: "Pythagoras anwenden",
};
export const KAPITEL_KURZ = { II: "Winkel und Konstruktionen", IV: "Satz des Pythagoras" };
