/* Geraden aus zwei Punkten – Motion-Texte (Norm: src/motion/NORM.md).
   g_zweipunkte: Geradentrainer (Mittelstufe), Reiter „Zwei Punkte“, unter dem Rechenweg.
   v_zweipunkte: Vektoren „Zwei Punkte – eine Gerade“, unter den zwei Wegen.
   frage ≤ 70 Zeichen mit „?“ (ohne Vektorpfeil), kern 20–130 Zeichen und sagt den Grund. Test: tests/geradenMotion.test.mjs */
export const GERADEN_MOTION = {
  g_zweipunkte: {
    titel: "Gerade durch zwei Punkte",
    frage: "Wie bekommt man aus zwei Punkten die Gleichung y = mx + c?",
    kern: "Das Steigungsdreieck von P nach Q liefert m (Höhe durch Breite). Von P zurück bis x = 0 liefert c, die Höhe auf der y-Achse.",
  },
  v_zweipunkte: {
    titel: "Gerade durch zwei Punkte",
    frage: "Wie wird aus zwei Punkten im Raum eine Geradengleichung?",
    kern: "Ein Punkt liefert den Stützvektor, der Weg zum zweiten Punkt (B − A) die Richtung – t läuft damit die ganze Gerade ab.",
  },
};
