/* ======================================================================
   sprache.js – Spracheingabe für Zahlenfelder (22.10.2026): reine Logik, kein React, kein Browser.
   Der Browser (Web Speech API, de-DE) liefert einen Text wie
     „3 2 -1“ · „drei zwei minus eins“ · „3, 2, −1“ · „minus drei Komma fünf“ · „zwei Drittel“ · „3 durch 4“
   zahlenAusSprache() macht daraus eine Liste von Feldwerten im Format der App:
     ["3", "2", "-3"] · ["-3,5"] · ["2/3"] · ["3/4"]
   (ASCII-Minus, Komma als Dezimaltrenner, Schrägstrich als Bruch – genau das, was die Feld-Filter
   der Werkzeuge annehmen; MatheFeld-Modus „ganz“ streicht ein Minus selbst weg).
   Die Verteilung auf die Felder einer Gruppe macht funcSprache.jsx (Reihenfolge der Felder = Reihenfolge der Zahlen).
   Getestet in tests/sprache.test.mjs.
   ====================================================================== */

const EINER = { null: 0, nul: 0, zero: 0, ein: 1, eine: 1, einen: 1, einem: 1, einer: 1, eins: 1, zwei: 2, zwo: 2, drei: 3, vier: 4, fünf: 5, fuenf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9,
  zehn: 10, elf: 11, zwölf: 12, zwoelf: 12, dreizehn: 13, vierzehn: 14, fünfzehn: 15, fuenfzehn: 15, sechzehn: 16, siebzehn: 17, achtzehn: 18, neunzehn: 19 };
const ZEHNER = { zwanzig: 20, dreißig: 30, dreissig: 30, vierzig: 40, fünfzig: 50, fuenfzig: 50, sechzig: 60, siebzig: 70, achtzig: 80, neunzig: 90 };
/* Bruchwörter → Nenner (halb, Drittel, Viertel …, auch „halbe/halbes/Hälfte“) */
const BRUCH = { halb: 2, halbe: 2, halbes: 2, halben: 2, hälfte: 2, haelfte: 2, drittel: 3, viertel: 4, fünftel: 5, fuenftel: 5, sechstel: 6, siebtel: 7, achtel: 8, neuntel: 9, zehntel: 10, zwölftel: 12, zwoelftel: 12, hundertstel: 100 };
const MINUS = new Set(["minus", "negativ", "-", "−", "–"]);
const PLUS = new Set(["plus", "+"]);
const KOMMA = new Set(["komma", "coma", ","]);
const DURCH = new Set(["durch", "geteilt", "/", "bruch"]);
/* Wörter, die nichts bedeuten und übersprungen werden */
const FUELL = new Set(["und", "dann", "der", "die", "das", "ist", "gleich", "=", "vektor", "punkt", "koordinate", "koordinaten", "x", "x1", "x2", "x3", "a", "b", "c", "d", "n", "p",
  "äh", "ähm", "also", "ganz", "ganze", "ganzes", "mal", "ähh", "|", "strich", "senkrecht", "oder", "ne", "so", "jetzt", "bitte", "zahl", "wert", "ergebnis", "normalenvektor", "richtungsvektor", "stützvektor", "abstand", "länge"]);

/* Zahlwort (auch zusammengesetzt: „dreiundzwanzig“, „hundertfünf“, „zweihundertdreißig“) → Zahl oder null */
export function zahlwort(w) {
  if (w in EINER) return EINER[w];
  if (w in ZEHNER) return ZEHNER[w];
  // hundert / tausend
  let m = /^(.*?)(hundert|tausend)(.*)$/.exec(w);
  if (m) {
    const vorne = m[1] === "" || m[1] === "ein" ? 1 : zahlwort(m[1]);
    const hinten = m[3] === "" ? 0 : zahlwort(m[3]);
    if (vorne === null || hinten === null) return null;
    return vorne * (m[2] === "hundert" ? 100 : 1000) + hinten;
  }
  // einer + und + zehner: „dreiundzwanzig“, „einundvierzig“
  m = /^(.+?)und(.+)$/.exec(w);
  if (m && m[1] in EINER && m[2] in ZEHNER && EINER[m[1]] < 10) return ZEHNER[m[2]] + EINER[m[1]];
  return null;
}

/* Text in Marken zerlegen. Ein Komma mit Leerzeichen danach trennt Zahlen („3, 2, -1“);
   ein Komma zwischen Ziffern ohne Leerzeichen ist ein Dezimalkomma („3,5“). Punkt zwischen Ziffern ebenso („3.5“). */
function marken(text) {
  let t = String(text || "").toLowerCase().replace(/[−–]/g, "-").replace(/\s+/g, " ").trim();
  t = t.replace(/(\d)\.(\d)/g, "$1,$2");                        // 3.5 → 3,5
  t = t.replace(/(\d)\/(\d)/g, "$1 / $2");                      // 3/4 → 3 / 4
  t = t.replace(/(\d)\s*-\s*(\d)/g, "$1 -$2");                  // „3 - 1“ heißt „3, −1“ (nie Subtraktion)
  t = t.replace(/,(?=\s|$)/g, " , ").replace(/\|/g, " | ").replace(/;/g, " ; ").replace(/\(|\)/g, " ");
  t = t.replace(/[.!?:]+(?=\s|$)/g, " ");                      // Satzzeichen am Wortende („eins.“)
  return t.split(" ").filter(Boolean).flatMap((m) => {
    // „-3“ → ["-", "3"]; „-dreikommafünf“ bleibt ein Wort
    const v = /^-(.+)$/.exec(m);
    if (v && v[1] !== "") return ["-", v[1]];
    // „3,5“ (Ziffern mit Dezimalkomma) → eine Marke
    return [m];
  });
}

/* Eine Marke als Zahl lesen: Ziffern (auch „3,5“) oder Zahlwort → { z: Zahl, dezimal: boolean } oder null */
function lies(m) {
  if (/^\d+(,\d+)?$/.test(m)) return { z: Number(m.replace(",", ".")), text: m };
  const z = zahlwort(m);
  if (z !== null) return { z, text: String(z) };
  return null;
}

const fertig = (eintrag) => {
  if (!eintrag) return null;
  let s = eintrag.text;
  if (eintrag.nenner) s = `${s}/${eintrag.nenner}`;
  else if (eintrag.nachkomma !== undefined) s = `${s},${eintrag.nachkomma}`;
  if (eintrag.minus && s !== "0") s = `-${s}`;
  return s;
};

/* Hauptfunktion: Text → Liste von Feldwerten (Strings) */
export function zahlenAusSprache(text) {
  const liste = [];
  let akt = null;                // { text, minus, nachkomma?, nenner? }
  let minusWartet = false;
  let kommaWartet = false;
  let durchWartet = false;
  const abschliessen = () => { const s = fertig(akt); if (s !== null) liste.push(s); akt = null; kommaWartet = false; durchWartet = false; };
  for (const m of marken(text)) {
    if (MINUS.has(m)) { abschliessen(); minusWartet = true; continue; }
    if (PLUS.has(m)) { abschliessen(); minusWartet = false; continue; }
    if (m === "," || m === ";" || m === "|") { abschliessen(); minusWartet = false; continue; }
    if (KOMMA.has(m)) { if (akt && akt.nachkomma === undefined && !akt.nenner) kommaWartet = true; continue; }
    if (DURCH.has(m)) { if (akt && !akt.nenner && akt.nachkomma === undefined) durchWartet = true; continue; }
    if (m in BRUCH) {
      // „ein halb“, „zwei Drittel“, „drei Viertel“ – ohne Zähler zählt 1 („halb“)
      if (!akt) akt = { text: "1", minus: minusWartet };
      if (akt.nachkomma === undefined && !akt.nenner) akt.nenner = BRUCH[m];
      minusWartet = false;
      abschliessen();
      continue;
    }
    if (FUELL.has(m)) continue;
    const z = lies(m);
    if (!z) continue;                                           // unbekanntes Wort: überspringen
    if (akt && kommaWartet) { akt.nachkomma = z.text.replace(",", ""); kommaWartet = false; abschliessen(); continue; }
    if (akt && durchWartet) { akt.nenner = z.text; durchWartet = false; abschliessen(); continue; }
    abschliessen();
    akt = { text: z.text, minus: minusWartet };
    minusWartet = false;
  }
  abschliessen();
  return liste;
}

/* Hat dieser Browser die Spracherkennung? (nur im Browser sinnvoll) */
export function sprachUnterstuetzt(w = typeof window !== "undefined" ? window : null) {
  return !!(w && (w.SpeechRecognition || w.webkitSpeechRecognition));
}
