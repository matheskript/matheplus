/* ============================================================
   Kurs Differentialrechnung – die Module (reine Daten, auch für Tests).
   Ein Modul je Kapitel des Schulbuchs „Ableitungen“. von/bis = Buchseiten
   (aus schulbuch/ableitungen/dist/verzeichnis.json). werkzeuge = Schlüssel
   in KURS_WERKZEUGE (funcDiffKurs.jsx).
   ============================================================ */
export const KURS_MODULE = [
  { id: "geraden", kap: "I", nr: "1", titel: "Geraden und Steigung", frage: "Wie misst man, wie steil eine Gerade ist?", von: 3, bis: 5,
    werkzeuge: ["geradenBasics", "funktionen"] },
  { id: "geradengl", kap: "I", nr: "2", titel: "Geradengleichungen ermitteln", frage: "Was muss man wissen, um eine Gerade eindeutig festzulegen?", von: 6, bis: 7,
    werkzeuge: ["geraden", "geradenPQ"] },
  { id: "rate", kap: "I", nr: "3", titel: "Mittlere Änderungsrate", frage: "Wie schnell ändert sich etwas – im Durchschnitt?", von: 8, bis: 9,
    werkzeuge: ["diffq", "geradenPQ", "funktionen"] },
  { id: "t1", kap: "I", nr: "", titel: "Training I", frage: "Geraden und Änderungsraten – prüfe dich, bevor es mit der Ableitung losgeht.", von: 10, bis: 10,
    werkzeuge: ["geradenPQ", "geraden", "diffq"] },
  { id: "tangentenproblem", kap: "II", nr: "4", titel: "Das Tangentenproblem", frage: "Welche Gerade schmiegt sich in einem Punkt an eine Kurve an?", von: 11, bis: 13,
    werkzeuge: ["zoomfilm", "geraden", "grenzwert"] },
  { id: "diffquot", kap: "II", nr: "5", titel: "Der Differenzenquotient", frage: "Wie nähert man die unbekannte Tangentensteigung mit Sekanten an?", von: 14, bis: 15,
    werkzeuge: ["diffq", "zoomfilm", "heftSekante"] },
  { id: "sekante", kap: "II", nr: "6", titel: "Von der Sekante zur Tangente", frage: "Wie steil ist ein Graph in einem einzigen Punkt?", von: 16, bis: 17,
    werkzeuge: ["diffq", "grenzwert", "heftSekante"] },
  { id: "stelle", kap: "II", nr: "7", titel: "Die Ableitung an einer Stelle", frage: "Was verrät die Zahl f′(x₀) – und auf welchen Wegen bekommt man sie?", von: 18, bis: 19,
    werkzeuge: ["ableitungstrainer", "graphzuordnung", "diffq", "plotter"] },
  { id: "ableitungsfunktion", kap: "II", nr: "8", titel: "Die Ableitungsfunktion", frage: "Kann man die Steigung an allen Stellen auf einmal berechnen?", von: 20, bis: 21,
    werkzeuge: ["graphzuordnung", "grenzwert", "ableitungstrainer", "plotter"] },
  { id: "t2", kap: "II", nr: "", titel: "Training II", frage: "Alles klar? Prüfe dich, bevor es mit den Regeln weitergeht.", von: 22, bis: 22,
    werkzeuge: ["graphzuordnung", "diffq", "ableitungstrainer"] },
  { id: "faktor", kap: "III", nr: "9", titel: "Faktorregel", frage: "Was passiert mit der Steigung, wenn man einen Graphen streckt?", von: 23, bis: 25,
    werkzeuge: ["ableitungstrainer", "heftRegeln", "terme"] },
  { id: "summe", kap: "III", nr: "10", titel: "Summenregel", frage: "Darf man eine Summe Stück für Stück ableiten?", von: 26, bis: 27,
    werkzeuge: ["ableitungstrainer", "parabeln", "heftRegeln", "plotter"] },
  { id: "produkt", kap: "III", nr: "11", titel: "Produktregel", frage: "Wie leitet man ein Produkt ab?", von: 28, bis: 29,
    werkzeuge: ["ableitungstrainer", "heftRegeln", "terme"] },
  { id: "potenz", kap: "III", nr: "12", titel: "Potenzregel", frage: "Gibt es ein Muster hinter x², x³, x⁴, …?", von: 30, bis: 31,
    werkzeuge: ["potenzregel", "pascal", "ableitungstrainer", "heftRegeln"] },
  { id: "quotient", kap: "III", nr: "13", titel: "Quotientenregel", frage: "Wie leitet man einen Bruch ab, in dessen Nenner x steht?", von: 32, bis: 33,
    werkzeuge: ["ableitungstrainer", "bruchterme", "advplotter"] },
  { id: "kette", kap: "III", nr: "14", titel: "Kettenregel", frage: "Wie leitet man eine Funktion ab, in der eine andere steckt?", von: 34, bis: 35,
    werkzeuge: ["ableitungstrainer", "funktionen", "advplotter"] },
  { id: "spezielle", kap: "III", nr: "15", titel: "Sinus, Kosinus, eˣ und ln x", frage: "Gibt es Funktionen, die ihre eigene Ableitung sind?", von: 36, bis: 37,
    werkzeuge: ["ableitungstrainer", "trigonometrie", "sinus", "wachstum"] },
  { id: "t3", kap: "III", nr: "", titel: "Training III", frage: "Alle Regeln gemischt – so wie in der Klausur.", von: 38, bis: 38,
    werkzeuge: ["ableitungstrainer", "rechenweg", "advplotter"] },
  { id: "tangente", kap: "IV", nr: "16", titel: "Tangente und Normale", frage: "Wie lautet die Gleichung der Geraden, die einen Graphen berührt?", von: 39, bis: 41,
    werkzeuge: ["geraden", "plotter", "ableitungstrainer"] },
  { id: "vermischt", kap: "IV", nr: "17", titel: "Vermischte Übungen und Rückblick", frage: "Alles zusammen – bis zum Abiturniveau.", von: 42, bis: 43,
    werkzeuge: ["plotter", "steckbrief", "scharen", "optimierung"] },
  { id: "loes", kap: "L", nr: "", titel: "Lösungen", frage: "Alle Lösungen zum Nachschlagen und Vergleichen.", von: 44, bis: 48, werkzeuge: [] },
];

export const KAPITEL = { I: "Geraden und Änderungsraten", II: "Die Ableitung", III: "Ableitungsregeln", IV: "Anwenden und Üben", L: "Anhang" };

