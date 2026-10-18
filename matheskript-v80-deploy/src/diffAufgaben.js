/* ======================================================================
   diffAufgaben.js – Aufgabentool des Kurses Differentialrechnung
   Jede Aufgabe aus dem Schulbuch „Ableitungen“ ist einem Aufgabentyp
   zugeordnet (BUCH_TYPEN). Zu jedem Typ erzeugt neueAufgabe() beliebig
   viele gleichwertige neue Aufgaben – mit Schritten zum Eintippen,
   gezielter Rückmeldung bei typischen Denkfehlern und Rechenweg.
   Begründungs-, Beweis- und Skizzenaufgaben haben keinen Typ: Dort zeigt
   die App die Buchaufgabe mit Lösung, aber keine Varianten.
   Reine Logik (Tests: tests/diffAufgaben.test.mjs).
   ====================================================================== */
import { zufall } from "./diffKern.js";
import { TYPEN_I, TYPEN_I2, TYPEN_II } from "./diffAufgaben1.js";
import { TYPEN_III, TYPEN_IV, REGEL_TITEL, ableitAufgabe } from "./diffAufgaben2.js";

const ABLEITEN = Object.fromEntries(Object.entries(REGEL_TITEL).map(([regel, titel]) => [`abl-${regel}`, { titel, gen: (r) => ableitAufgabe(regel, r) }]));

export const TYPEN = { ...TYPEN_I, ...TYPEN_I2, ...TYPEN_II, ...ABLEITEN, ...TYPEN_III, ...TYPEN_IV };

/* Buchseite-Aufgabennummer → Aufgabentyp (optional mit Variante „typ:variante“).
   Seitenzahlen wie im Buch (schulbuch/ableitungen, dist/verzeichnis.json). */
export const BUCH_TYPEN = {
  // 1 Geraden und Steigung (S. 5)
  "5-1": "steigung2p", "5-2": "mbAblesen", "5-3": "punktSteigung", "5-4": "prozent", "5-5": "kollinear", "5-6": "linGrund", "5-7": "punktAufGerade",
  // 2 Geradengleichungen (S. 7)
  "7-1": "punktSteigung", "7-2": "zweiPunkte", "7-3": "punktSteigung", "7-4": "parallel", "7-5": "kerze", "7-6": "achsenschnitt", "7-8": "senkrecht",
  // 3 Mittlere Änderungsrate (S. 9)
  "9-1": "mittlereRate", "9-2": "sekante", "9-3": "durchschnitt", "9-4": "tabelleRate", "9-5": "dqZahl",
  // Training I (S. 10)
  "10-T1": "steigung2p", "10-T2": "geradeAusGraph", "10-T3": "zweiPunkte", "10-T4": "linZwei", "10-T5": "mittlereRate", "10-T6": "rateZwei", "10-T7": "dqTerm:quad",
  // 4 Tangentenproblem (S. 13)
  "13-3": "scheitel",
  // 5 Differenzenquotient (S. 15)
  "15-1": "dqTerm", "15-2": "dqZahl", "15-3": "dqTerm:quad", "15-5": "durchschnitt", "15-6": "dqTerm:kehr", "15-8": "dqSymmetrisch",
  // 6 Von der Sekante zur Tangente (S. 17)
  "17-1": "hMethode", "17-2": "hMethode:bewegung", "17-5": "hMethode:kubik", "17-6": "hMethode:kehr", "17-7": "stelleZurSteigung",
  // 7 Ableitung an einer Stelle (S. 19)
  "19-1": "vorzeichenGraph", "19-2": "hMethode", "19-3": "dqNumerisch",
  // 8 Ableitungsfunktion (S. 21)
  "21-1": "hFunktion", "21-2": "stelleZurSteigung", "21-3": "hFunktion",
  // Training II (S. 22)
  "22-T1": "sekante:kubisch", "22-T2": "hMethode", "22-T4": "hMethode:ballon", "22-T6": "parameterA", "22-T7": "hFunktion",
  // 9 Faktorregel (S. 25)
  "25-1": "abl-faktor", "25-2": "steigungAnStellen", "25-3": "rueckwaerts", "25-4": "abl-faktor", "25-5": "stelleZurSteigung", "25-6": "faktorSteigung", "25-7": "bewegung:kugel", "25-8": "bewegung:bremsweg", "25-10": "parameterA",
  // 10 Summenregel (S. 27)
  "27-1": "abl-summe", "27-2": "steigungAnStellen", "27-3": "abl-summe", "27-4": "scheitel", "27-5": "parallelTangente", "27-6": "rueckwaerts", "27-7": "gewinn", "27-8": "parameterBC",
  // 11 Produktregel (S. 29)
  "29-1": "abl-produkt", "29-2": "abl-produkt", "29-3": "abl-produkt", "29-4": "abl-produkt", "29-5": "umsatz",
  // 12 Potenzregel (S. 31)
  "31-1": "abl-potenz", "31-2": "abl-potenz", "31-3": "hoehere", "31-4": "waagrecht:kubisch", "31-6": "abl-potenz", "31-7": "rueckwaerts", "31-9": "potenzN",
  // 13 Quotientenregel (S. 33)
  "33-1": "abl-quotient", "33-2": "abl-potneg", "33-3": "abl-quotient", "33-4": "abl-quotient", "33-5": "waagrecht:bruch", "33-7": "konzentration",
  // 14 Kettenregel (S. 35)
  "35-1": "abl-kette", "35-2": "abl-kette", "35-3": "abl-kette", "35-4": "abl-prodkette", "35-5": "waagrecht:biquad", "35-6": "kettenSach", "35-7": "abl-kette",
  // 15 Sinus, Kosinus, eˣ, ln x (S. 37)
  "37-1": "abl-speziell", "37-2": "abl-speziellPQ", "37-3": "trigStellen", "37-4": "wachstum", "37-5": "abl-speziell",
  // Training III (S. 38)
  "38-T1": "abl-mix", "38-T2": "abl-speziellPQ", "38-T4": "abl-mix", "38-T5": "waagrecht:kubisch", "38-T6": "uvWerte",
  // 16 Tangente und Normale (S. 41)
  "41-1": "tangente", "41-2": "normale", "41-3": "parallelTangente:kubisch", "41-4": "tangenteDreieck", "41-7": "tangenteVonAussen",
  // 17 Vermischte Übungen (S. 42)
  "42-1": "abl-mix", "42-2": "tangente:kubPoly", "42-4": "zufluss", "42-5": "schar",
};

export const typVon = (seite, nr) => BUCH_TYPEN[`${seite}-${nr}`] || null;
export const typTitel = (schluessel) => (TYPEN[String(schluessel).split(":")[0]] || {}).titel || "";

/* Ein „typischer Fehler“, der bei diesen Zahlen zufällig dasselbe ergibt wie die Lösung
   (z. B. m(x + x₀) statt m(x − x₀) bei m = 0), wird gestrichen – sonst hieße es „Denkfehler“ bei richtiger Antwort. */
function ohneScheinfehler(s) {
  if (!s.fehler || !s.fehler.length) return;
  if (s.art === "zahl") s.fehler = s.fehler.filter((f) => Math.abs(f.wert - s.wert) > 1e-9);
  if (s.art === "term") {
    const [lo, hi] = s.bereich || [-3, 3];
    const xs = Array.from({ length: 9 }, (_, i) => lo + ((hi - lo) * ((i * 0.6180339887) % 1)));
    s.fehler = s.fehler.filter((f) => !xs.filter((x) => Number.isFinite(s.soll.js(x)) && Number.isFinite(f.js(x))).every((x) => Math.abs(f.js(x) - s.soll.js(x)) < 1e-9));
  }
}

let laufend = 0;
/* Neue Aufgabe zum Typ „typ“ bzw. „typ:variante“. seed (Zahl) macht sie wiederholbar. */
export function neueAufgabe(schluessel, seed) {
  const [typ, variante] = String(schluessel).split(":");
  const T = TYPEN[typ];
  if (!T) throw new Error("Unbekannter Aufgabentyp: " + schluessel);
  const r = zufall(seed);
  const a = T.gen(r, variante);
  a.schritte.forEach(ohneScheinfehler);
  a.weg = (a.weg || []).filter((z, i, alle) => z !== alle[i - 1]);   // keine Zeile doppelt hintereinander
  laufend += 1;
  return { ...a, typ: schluessel, titel: T.titel, id: `${typ}-${seed ?? "z"}-${laufend}` };
}
