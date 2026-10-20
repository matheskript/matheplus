/* ======================================================================
   trainingVideos.js – welches Video die Fehler-Karte in „Mein Mathe-Training“ zeigt.

   Ein wiederkehrender Fehlertyp (trainingDaten.js, FEHLERTYPEN[typ].thema) löst neben dem engen
   Wiederholungsrhythmus eine Karte aus: „Schau dir das Video zu … nochmal an.“
     · Gibt es zum Thema eine Lektion in unseren Videokursen (base5.jsx, VIDEOKURSE), zeigt die Karte sie.
     · Sonst steht ein PLATZHALTER: ein Link auf passende Videos von Michael Penn (YouTube). Diese Platzhalter
       werden nach und nach durch eigene deutsche Videos ersetzt – dafür hier einfach { kurs, lektion } eintragen.
   Reine Daten, kein React. Test: tests/meinTraining.test.mjs prüft, dass jede Lektion existiert.
   ====================================================================== */

export const PLATZHALTER_KANAL = "https://www.youtube.com/@MichaelPennMath/search?query=";

/* thema (trainingDaten.THEMEN) → Lektion unserer Videokurse ODER Platzhalter-Suche */
export const VIDEO_ZU_THEMA = {
  ableiten:    { kurs: "analysis4", lektion: "a2" },
  kurven:      { kurs: "analysis4", lektion: "a3" },
  integrale:   { kurs: "analysis5", lektion: "i2" },
  bernoulli:   { kurs: "stochastik", lektion: "s4" },
  wkt:         { kurs: "stochastik", lektion: "s1" },
  vektoren:    { kurs: "vektoren", lektion: "v2" },
  funktionen:  { kurs: "analysis1", lektion: "g2" },
  lgs:         { kurs: "analysis1", lektion: "g4" },
  wachstum:    { kurs: "analysis3", lektion: "f1" },
  potenzen:    { kurs: "analysis3", lektion: "f2" },
  sinus:       { kurs: "analysis3", lektion: "f3" },
  /* Platzhalter (Michael Penn), bis eigene Videos da sind */
  gleichungen: { platzhalter: "solving quadratic equations" },
  terme:       { platzhalter: "binomial expansion" },
  brueche:     { platzhalter: "fractions" },
  prozent:     { platzhalter: "percent" },
  geometrie:   { platzhalter: "pythagorean theorem trigonometry" },
  kreiskoerper:{ platzhalter: "volume of a cone sphere" },
  dreieckgeo:  { platzhalter: "similar triangles" },
  normal:      { platzhalter: "normal distribution" },
};

/* Liefert { art: "lektion", kurs, lektion } oder { art: "platzhalter", url, suche } – nie null für bekannte Themen */
export function videoFuerThema(thema) {
  const v = VIDEO_ZU_THEMA[thema];
  if (!v) return { art: "platzhalter", url: PLATZHALTER_KANAL, suche: "" };
  if (v.kurs) return { art: "lektion", kurs: v.kurs, lektion: v.lektion };
  return { art: "platzhalter", url: PLATZHALTER_KANAL + encodeURIComponent(v.platzhalter), suche: v.platzhalter };
}
