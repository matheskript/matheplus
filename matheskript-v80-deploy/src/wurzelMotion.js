/* ======================================================================
   Wurzel aus vierstelligen Quadratzahlen – Logik und Texte der Motion (22.10.2026)
   Die Zeichnung steht in funcErklaeranimation.jsx (Szene „wurzel“, Kopfrechnen √10k).
   Ablauf, eine Minute:
   1 Quadratzahlen 1² bis 10²
   2 daneben die Zehnerquadrate 10² bis 100²: dieselben Zahlen mit zwei Nullen
   3 letzte Ziffern: 1|81, 4|64, 9|49, 16|36 enden gleich, 25 und 100 allein
   4 Folgerung: letzte Ziffer der Quadratzahl → Einerziffer der Wurzel
   5 Beispiel: die letzte Ziffer
   6 zwischen welchen Zehnerquadraten liegt die Zahl? → Zehnerziffer
   7 (nur bei zwei Kandidaten) näher am unteren oder oberen Zehnerquadrat?
   8 Ergebnis mit Probe
   Test: tests/wurzelMotion.test.mjs
   ====================================================================== */

export const WURZEL_DAUER = 60;
export const WURZEL_BEISPIELE = [3025, 1296, 5329, 7569, 9604];
export const WURZEL_START = 3025;

/* letzte Ziffer der Quadratzahl → mögliche Einerziffern der Wurzel */
export const ENDEN = [[1, "1|9"], [4, "2|8"], [9, "3|7"], [6, "4|6"], [5, "5"], [0, "0"]];
export const KANDIDATEN = { 0: [0], 1: [1, 9], 4: [2, 8], 5: [5], 6: [4, 6], 9: [3, 7] };

/* Paare in der Liste 1² bis 10² (Zeilen 0 bis 9): n² und (10 − n)² enden gleich, 25 und 100 allein */
export const WURZEL_PAARE = [
  { zeilen: [0, 8], n: [1, 9], ende: 1, wurzel: "1 oder 9" },
  { zeilen: [1, 7], n: [2, 8], ende: 4, wurzel: "2 oder 8" },
  { zeilen: [2, 6], n: [3, 7], ende: 9, wurzel: "3 oder 7" },
  { zeilen: [3, 5], n: [4, 6], ende: 6, wurzel: "4 oder 6" },
  { zeilen: [4], n: [5], ende: 5, wurzel: "nur 5" },
  { zeilen: [9], n: [10], ende: 0, wurzel: "nur 0" },
];

/* Beispiel der Folgerung (Schritt 4) – absichtlich keine der Beispielzahlen, damit nichts vorweggenommen wird */
export const FOLGERUNG = { wurzel: 43, quadrat: 1849, einer: 3 };

const NB = " ";
export const gz = (n) => (n >= 10000 ? `10${NB}000` : String(n));

export function wurzelInfo(N) {
  const n = Math.round(Math.sqrt(N));
  const ende = N % 10;
  const kand = KANDIDATEN[ende] || [n % 10];
  const kandKlein = kand.map((k) => (k === 0 ? 10 : k)); // Endziffer der Wurzel als Zahl von 1 bis 10
  const vorne = Math.floor(N / 100);
  const z = Math.floor(Math.sqrt(vorne)); // Zehnerziffer der Wurzel
  const unten = z * z * 100, oben = (z + 1) * (z + 1) * 100; // z. B. 2500 = 50², 3600 = 60²
  const zwei = kand.length === 2;
  const abU = N - unten, abO = oben - N;
  const kleiner = abU < abO; // näher an der unteren Zehnerquadratzahl → kleinerer Kandidat
  const gewaehlt = zwei ? 10 * z + (kleiner ? kand[0] : kand[1]) : 10 * z + kand[0];
  return { N, n, ende, kand, kandKlein, vorne, z, unten, oben, zwei, abU, abO, kleiner, gewaehlt, kandZahlen: kand.map((k) => 10 * z + k) };
}

/* Anfangszeiten der Schritte; beide Fassungen dauern genau eine Minute */
export const wurzelZeiten = (zwei) => (zwei
  ? { s: [0, 7.5, 15.5, 30, 37, 42.5, 48.5, 54], dauer: WURZEL_DAUER }
  : { s: [0, 7.5, 15.5, 30, 38, 44, 52], dauer: WURZEL_DAUER });

/* Zeitpunkte der sechs Endziffern-Paare in Schritt 3 (relativ zum Schrittbeginn) */
export const PAAR_ZEIT = [1.5, 3.7, 5.9, 8.1, 10.3, 12.1];

export function wurzelSchritte(I) {
  const [a, b] = I.kandKlein;
  const [k0, k1] = I.kandZahlen;
  const F = FOLGERUNG;
  const t1 = `Zuerst die Quadratzahlen von 1 bis 10: 1, 4, 9, 16, 25, 36, 49, 64, 81 und 100. Diese zehn Zahlen solltest du auswendig können – mehr brauchst du für alle Wurzeln bis 10${NB}000 nicht.`;
  const t2 = "Daneben die Quadratzahlen der Zehnerzahlen: 10², 20², 30² bis 100². Es sind genau dieselben Zahlen, nur mit zwei Nullen dran – denn (10 · n)² = n² · 100, zum Beispiel 70² = 7² · 100 = 4900.";
  const t3 = "Jetzt die letzten Ziffern: 1 und 81 enden beide auf 1, 4 und 64 auf 4, 9 und 49 auf 9, 16 und 36 auf 6. Nur 25 endet auf 5 und nur 100 auf 0. Die Paare liegen spiegelbildlich um die 5: n² und (10 − n)² enden immer gleich.";
  const t4 = `Das sagt dir direkt, worauf die Wurzel einer vierstelligen Quadratzahl endet. Die Zehner der Wurzel ändern die letzte Ziffer nicht: ${F.wurzel}² = ${F.quadrat} endet wie ${F.einer}² = ${F.einer * F.einer}. Endet die Quadratzahl auf 9, endet ihre Wurzel auf 3 oder 7; endet sie auf 5, dann nur auf 5. Auf 2, 3, 7 oder 8 endet nie eine Quadratzahl.`;
  const t5 = I.zwei
    ? `Beispiel: ${I.N}. Die letzte Ziffer ist ${I.ende} – wie bei ${a}² = ${a * a} und ${b}² = ${b * b}. Die Wurzel endet also auf ${a} oder ${b}.`
    : `Beispiel: ${I.N}. Die letzte Ziffer ist ${I.ende}, und auf ${I.ende} endet nur ${a}² = ${a * a}. Die Wurzel endet also sicher auf ${I.kand[0]}.`;
  const t6 = `Jetzt die eigentliche Frage: Zwischen welchen Zehnerquadraten liegt ${I.N}? Zwischen ${gz(I.unten)} = ${I.z * 10}² und ${gz(I.oben)} = ${(I.z + 1) * 10}². Die Wurzel liegt also zwischen ${I.z * 10} und ${(I.z + 1) * 10} – ihre Zehnerziffer ist ${I.z}.`
    + (I.zwei ? ` Zwei Kandidaten bleiben: ${k0} und ${k1}.` : "");
  const naeher = I.kleiner ? gz(I.unten) : gz(I.oben);
  const t7 = `Welcher der beiden? ${I.N} liegt näher an ${naeher}: nach unten sind es ${I.abU}, nach oben ${I.abO}. Also liegt die Wurzel näher an ${I.kleiner ? I.z * 10 : (I.z + 1) * 10} – es ist ${I.gewaehlt}.`;
  const t8 = `Zehnerziffer ${I.z} aus den Zehnerquadraten, Einerziffer ${I.gewaehlt % 10} aus der letzten Ziffer: Die Wurzel aus ${I.N} ist ${I.gewaehlt}. Probe: ${I.gewaehlt}² = ${I.N}.`;
  const texte = I.zwei ? [t1, t2, t3, t4, t5, t6, t7, t8] : [t1, t2, t3, t4, t5, t6, t8];
  return wurzelZeiten(I.zwei).s.map((von, i) => ({ von, text: texte[i] }));
}

export function wurzelBeschreibung(I) {
  return `Animation, eine Minute: Wurzel aus ${I.N}. Die Quadratzahlen von 1 bis 10, daneben die Zehnerquadrate mit zwei Nullen, dann die letzten Ziffern (1 und 81, 4 und 64, 9 und 49, 16 und 36 enden gleich, 25 und 100 allein). Die letzte Ziffer von ${I.N} liefert die Einerziffer, die Lage zwischen ${gz(I.unten)} und ${gz(I.oben)} die Zehnerziffer. Ergebnis ${I.gewaehlt}.`;
}
