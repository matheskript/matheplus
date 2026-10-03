import React, { useState, useRef } from "react";

/* Verwandelt eine Hex-Farbe in ein transparentes rgba() für Box-Hintergrund und -Rand. */

export function hexZuRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


/* Matheskript · Version 80 */

/* FC-Barcelona-Farben (Blaugrana): Barça-Blau trägt die Flächen (Kopfleiste, Menü,
   dunkle Karten), Grana ist Marke und Handlung, Gold aus dem Wappen setzt Akzente
   und markiert das Aktive. Rostbraun bleibt der Fehlerfarbe vorbehalten.
   (Die Schlüsselnamen see/seeTief/gruen/flaggold sind historisch und bleiben aus Kompatibilität.) */

export const C = {
  see: "#004D98",
  seeTief: "#0E1E4A",
  himmel: "#E8EFF9",
  sand: "#F8FAFD",
  weiss: "#FFFFFF",
  gruen: "#A50044",
  gruenDunkel: "#7F0034",
  granaHell: "#D4145A",
  signal: "#B85C2E",
  tinte: "#0F1A33",
  grau: "#5A6582",
  hellgrau: "#A3ACC2",
  linie: "#E3E8F2",
  seeHell: "#5B8FD1",
  ablGrau: "#8E98B3",
  /* Barça-Gold für Akzente auf Blau */
  flaggold: "#EDBB00",
  goldText: "#C9D6EE",
  /* Silber als zweite Akzentfarbe neben Gold (Logo mythosmathe.de, Kacheln) */
  silber: "#C7CDD6",
  silberHell: "#E9ECF1",
  silberDunkel: "#8E97A6",
  goldWarm: "#E2B53C",
  /* Nur für die Koeffizienten-Farbcodierung im Polynomplotter — dort trägt jeder
     der fünf Koeffizienten eine eigene Farbe, das reguläre Farbschema reicht dafür nicht. */
  gold: "#B8860B",
  smaragd: "#2F8F5B",
  lila: "#7B4FA0",
};


export const REGELN = [
  "Raum geben",
  "Lesbar schreiben",
  "Entscheidende Schritte zeigen",
  "Vertikal ordnen",
  "Operatoren korrekt verwenden",
  "Nebenrechnung trennen",
  "Ergebnis abschließen",
];


export const PROMPT = `Du bist Mathilda, die Analyse-Instanz des Lernsystems "Matheskript" von Mythos Mathe.

Du bekommst das Foto einer handschriftlichen Mathematik-Lösung auf weißem Blankopapier. Du bewertest ZWEI Dinge getrennt: den Rechenweg und die äußere Arbeitsstruktur.

GRUNDHALTUNG (nicht verhandelbar):
- Bewertet wird das Blatt, niemals der Mensch. Nie "du bist unstrukturiert", sondern "auf diesem Blatt stehen zwei Schritte in einer Zeile".
- Mathe ist kein Talenttest. Kein Lob-Geschwafel, kein Tadel. Sachlich, präzise, freundlich.
- Wenn du eine Zeile nicht sicher lesen kannst, behaupte KEINEN Rechenfehler. Markiere sie als unklar.

RECHENWEG:
Transkribiere jede erkennbare Zeile. Prüfe von Zeile zu Zeile, ob der Übergang mathematisch korrekt ist. Melde NUR den ERSTEN echten Bruch in der Kette, nicht die Folgefehler.

DIE 7 PEN-&-PAPER-REGELN (jeweils 0-10):
1. Raum geben - Weißraum, Zeilenabstand, keine Quetschung an den Rand
2. Lesbar schreiben - Zeichen eindeutig unterscheidbar
3. Entscheidende Schritte zeigen - keine wichtigen Umformungen nur im Kopf
4. Vertikal ordnen - ein Gedanke pro Zeile, Gleichheitszeichen untereinander
5. Operatoren korrekt verwenden - "=" nur zwischen wirklich Gleichem, nicht als Pfeil
6. Nebenrechnung trennen - Hauptweg bleibt als Strang erkennbar
7. Ergebnis abschließen - Endergebnis markiert, nicht im Fließtext verloren

DIE 6 FATALEN FEHLERARTEN (nur nennen, wenn im Bild wirklich sichtbar):
"Schritte im Kopf", "Mehrere Schritte pro Zeile", "= als Pfeil", "Ohne Ziel gerechnet", "Kein erkennbarer Hauptweg", "Ergebnis nicht abgeschlossen"

Antworte AUSSCHLIESSLICH mit diesem JSON, ohne Markdown, ohne Vorrede:
{"lesbarkeit":0-10,"hinweis":"nur wenn die Erkennung unsicher ist, sonst leerer String","zeilen":[{"t":"Zeile als Text","s":"ok|fehler|unklar"}],"fehler":{"zeile":Zeilennummer ab 1 oder null,"was":"was genau bricht","richtig":"wie der Schritt korrekt lautet"},"regeln":[{"p":0-10,"b":"Beleg aus dem Bild"}],"gesamt":0-10,"fatal":["..."],"schritt":"genau EIN konkreter nächster Schritt fürs nächste Blatt"}

Das Array "regeln" enthält exakt 7 Einträge in der Reihenfolge der Regeln oben.
Halte "b" unter 90 Zeichen, "was" und "richtig" unter 140 Zeichen.`;

/* Hier später die URL des gehosteten Erklärvideos eintragen
   (Vimeo-Direktlink, Cloudflare Stream, eigener Server …).
   Solange das Feld leer ist, kannst du über den Button unter dem
   Rahmen eine lokale Videodatei zum Ansehen laden. */

export const VIDEO_URL = "";

/* Demo-Video von Basti — nur zu Testzwecken an drei Stellen eingebunden, die mit
   Ableitungen zu tun haben. Für den echten Betrieb bekommt jeder Baustein sein
   eigenes Video (siehe die Videokurse-Planung). */

export const DEMO_VIDEO_ID = "50LsVekhMCU";

/* Einleitungsvideo zum Differenzenquotienten — ein Fremdvideo als Platzhalter,
   bis Basti ein eigenes aufgenommen hat (siehe DIFFQ-Bereich weiter unten). */

export const DIFFQ_VIDEO_ID = "7xd_G5uIp7k";
export const POTENZREGEL_VIDEO_ID = "2f_TkmDkz2E";

/* Lädt die YouTube-IFrame-API genau einmal, egal wie viele Videos auf der
   Seite stehen. Läuft nur in einem echten Browser — in Claudes eigener
   Dateivorschau bleibt "bereit" dauerhaft false, dann greift der Link unten. */

export const videoZeit = (s) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
};

/* Eigene, schmale Steuerleiste statt der vollen YouTube-Oberfläche: nur ein
   Play/Pause-Knopf und eine Zeitleiste, kein Teilen, keine Einstellungen,
   kein Titel, keine verwandten Videos. Dafür läuft der Player mit
   controls: 0 und wir steuern ihn über die YouTube-IFrame-API selbst. */

export const GRENZE = 2.8 * 1024 * 1024;


export const API_URL = typeof window !== "undefined" && /claude\.(ai|site)|claudeusercontent/.test(window.location.hostname)
  ? "https://api.anthropic.com/v1/messages" : "/api/claude";

/* ---------- Trainingsbereich ---------- */


export const MODULE = [
  {
    id: "b01",
    titel: "Lineare Funktionen",
    unter: "Baustein 01 · Steigung & Änderungsrate",
    einleitung: [
      "Die Gerade ist der Ursprung der gesamten Analysis. Alles, was später kommt – Ableitung, Tangente, Monotonie – ist der Versuch, krumme Funktionen lokal wie Geraden zu behandeln.",
      "Wer die Steigung nicht als Änderungsrate versteht, versteht auch die Ableitung nicht.",
    ],
    punkte: [
      "f(x) = m·x + b — m ist die Änderung von y pro Schritt in x, b der Funktionswert bei x = 0",
      "Steigung aus zwei Punkten: m = Δy / Δx — das ist bereits der Differenzenquotient",
      "Parallel: m₁ = m₂ — Orthogonal: m₁ · m₂ = −1",
      "Typischer Fehler: m berechnet, aber b vergessen. Ein Punkt allein legt keine Gerade fest.",
    ],
    aufgaben: [
      {
        frage: "1.1 — Bestimme die Gleichung der Geraden durch P(−2 | 5) und Q(4 | −7).",
        optionen: ["y = −2x + 1", "y = −2x − 1", "y = 2x + 9", "y = −0,5x + 4"],
        richtig: 0,
        erklaerung: "m = (−7 − 5) / (4 − (−2)) = −12/6 = −2. Dann P einsetzen: 5 = −2·(−2) + b = 4 + b, also b = 1. Der zweite Schritt wird am häufigsten vergessen.",
      },
      {
        frage: "1.2 — Gegeben ist g: y = ¾x − 3. Wo liegt die Nullstelle?",
        optionen: ["x = −4", "x = 4", "x = −3", "x = 2,25"],
        richtig: 1,
        erklaerung: "¾x − 3 = 0 ⇒ ¾x = 3 ⇒ x = 4. Wer x = −4 wählt, hat das Vorzeichen beim Umstellen mitgenommen statt es aufzulösen.",
      },
      {
        frage: "1.5 — Wie lautet die Parallele zu g: y = ¾x − 3 durch R(8 | 1)?",
        optionen: ["y = ¾x + 1", "y = ¾x − 5", "y = −⁴⁄₃x + 5", "y = ¾x − 3"],
        richtig: 1,
        erklaerung: "Parallel heißt gleiche Steigung, also m = ¾. Einsetzen: 1 = ¾·8 + b = 6 + b ⇒ b = −5.",
      },
      {
        frage: "1.6 — Und die Senkrechte zu g durch denselben Punkt R(8 | 1)?",
        optionen: ["y = −⁴⁄₃x + ³⁵⁄₃", "y = −¾x + 7", "y = ⁴⁄₃x − ²⁹⁄₃", "y = −⁴⁄₃x − ³⁵⁄₃"],
        richtig: 0,
        erklaerung: "Orthogonalität verlangt m₁·m₂ = −1, also m₂ = −4/3. Einsetzen: 1 = −4/3·8 + b = −32/3 + b ⇒ b = 35/3. Der häufigste Fehler ist, nur das Vorzeichen zu drehen und den Kehrwert zu vergessen.",
      },
      {
        frage: "1.9 — Zwei Geraden schneiden sich nie und sind nicht identisch. Was folgt daraus?",
        optionen: [
          "m₁ = m₂ und b₁ = b₂",
          "m₁ = m₂ und b₁ ≠ b₂",
          "m₁ · m₂ = −1",
          "m₁ ≠ m₂ und b₁ = b₂",
        ],
        richtig: 1,
        erklaerung: "Setzt man gleich: m₁x + b₁ = m₂x + b₂. Bei verschiedenen Steigungen gibt es immer genau eine Lösung. Kein Schnittpunkt entsteht nur, wenn die x-Terme wegfallen und dann ein Widerspruch b₁ = b₂ übrig bleibt.",
      },
      {
        frage: "1.10 — Die mittlere Steigung von f(x) = x² zwischen x₁ = 1 und x₂ = 3 beträgt 4. Warum ist das keine Steigung der Funktion an einer einzelnen Stelle?",
        optionen: [
          "Weil x² keine Steigung besitzt",
          "Weil 4 nur der gerundete Wert ist",
          "Weil sie die Steigung der Sekante durch zwei Punkte beschreibt, nicht die Neigung in einem Punkt",
          "Weil man dafür die zweite Ableitung braucht",
        ],
        richtig: 2,
        erklaerung: "Die 4 ist die Steigung der Verbindungsgeraden zwischen (1|1) und (3|9). Sie mittelt über das ganze Intervall. Genau aus dieser Größe entsteht auf der nächsten Seite der Ableitungsbegriff, indem man den zweiten Punkt heranrücken lässt.",
      },
    ],
  },
  {
    id: "b02",
    titel: "Von der Sekante zur Tangente",
    unter: "Baustein 02 · Der Ableitungsbegriff",
    einleitung: [
      "Die zentrale Idee der Analysis in einem Satz: Man ersetzt die Steigung zwischen zwei Punkten durch die Steigung in einem Punkt, indem man den zweiten Punkt unendlich nah heranrücken lässt.",
    ],
    punkte: [
      "Mittlere Änderungsrate auf [a; b]: (f(b) − f(a)) / (b − a) — Sekantensteigung",
      "Lokale Änderungsrate: f′(x₀) = lim h→0 von (f(x₀+h) − f(x₀)) / h",
      "h-Methode: ausmultiplizieren, zusammenfassen, h ausklammern und kürzen — erst dann h → 0",
      "Drei Deutungen von f′(x₀): Tangentensteigung, Momentangeschwindigkeit, Wachstum pro Einheit",
    ],
    aufgaben: [
      {
        frage: "2.1 — Die mittleren Änderungsraten von f(x) = x² lauten auf [1; 3] gleich 4, auf [1; 2] gleich 3, auf [1; 1,1] gleich 2,1. Was beobachtest du?",
        optionen: [
          "Die Werte fallen gegen 2, also gegen f′(1)",
          "Die Werte fallen gegen 0",
          "Die Werte schwanken zufällig",
          "Die Werte nähern sich der Intervalllänge",
        ],
        richtig: 0,
        erklaerung: "Je kürzer das Intervall, desto näher liegt die Sekantensteigung an der Tangentensteigung. Der Grenzwert 2 ist genau f′(1). Das ist der Ableitungsbegriff, numerisch sichtbar gemacht.",
      },
      {
        frage: "2.2 — Der Differenzenquotient von f(x) = x² auf [1; 1+h] vereinfacht sich zu …",
        optionen: ["2 + h", "2h + h²", "1 + h", "2 + h²"],
        richtig: 0,
        erklaerung: "((1+h)² − 1)/h = (1 + 2h + h² − 1)/h = (2h + h²)/h = 2 + h. Erst nach dem Kürzen darf h → 0 gesetzt werden, das liefert f′(1) = 2.",
      },
      {
        frage: "2.6 — Warum darf man h nicht von Anfang an gleich 0 setzen?",
        optionen: [
          "Weil dann die Funktion undefiniert wird",
          "Weil im Nenner 0 stünde und 0/0 kein Ergebnis ist",
          "Weil der Grenzwert sonst zu groß wird",
          "Weil man erst die Ableitungsregeln braucht",
        ],
        richtig: 1,
        erklaerung: "Vor dem Kürzen steht 0/0 da — ein undefinierter Ausdruck, keine Zahl. Erst das Ausklammern und Kürzen von h macht den Term an der Stelle h = 0 überhaupt auswertbar.",
      },
      {
        frage: "2.3 — Bestimme f′(3) für f(x) = x² − 4x.",
        optionen: ["2", "6", "−2", "5"],
        richtig: 0,
        erklaerung: "f′(x) = 2x − 4, also f′(3) = 6 − 4 = 2. Über die h-Methode kommt exakt dasselbe heraus — genau das ist die Kontrolle, die das Heft verlangt.",
      },
      {
        frage: "2.5 — Ein Körper legt s(t) = 0,5t² zurück (m, s). Wie groß ist die Momentangeschwindigkeit bei t = 5?",
        optionen: ["3,5 m/s", "12,5 m/s", "5 m/s", "2,5 m/s"],
        richtig: 2,
        erklaerung: "s′(t) = t, also s′(5) = 5 m/s. Die 3,5 m/s wären die Durchschnittsgeschwindigkeit auf [2; 5] — die beiden Begriffe sauber zu trennen ist der Kern dieses Bausteins.",
      },
      {
        frage: "2.7 — An welcher Stelle hat f(x) = x² die Steigung 6?",
        optionen: ["x = 6", "x = 3", "x = 36", "x = 1,5"],
        richtig: 1,
        erklaerung: "f′(x) = 2x = 6 ⇒ x = 3. Steigung 0 liegt entsprechend bei x = 0 vor, dem Scheitelpunkt.",
      },
    ],
  },
  {
    id: "b03",
    titel: "Die Ableitungsregeln",
    unter: "Baustein 03 · Das Handwerk",
    einleitung: [
      "Ab hier wird nicht mehr verstanden, sondern trainiert. Ableiten muss so sicher sitzen wie das kleine Einmaleins.",
      "Sonst verbraucht die Kurvendiskussion später deine ganze Denkkapazität am falschen Ort.",
    ],
    punkte: [
      "Potenzregel: xⁿ ⇒ n·xⁿ⁻¹ — gilt für alle reellen Exponenten",
      "Produktregel: (u·v)′ = u′v + uv′",
      "Quotientenregel: (u/v)′ = (u′v − uv′) / v² — Reihenfolge im Zähler beachten",
      "Kettenregel: äußere mal innere Ableitung",
      "Vorher umschreiben: 4/x = 4x⁻¹, √x = x^½, 1/x³ = x⁻³",
    ],
    aufgaben: [
      {
        frage: "3.1a — Leite ab: f(x) = 5x⁴ − 3x² + 7x − 2",
        optionen: ["20x³ − 6x + 7", "20x³ − 6x + 7 − 2", "20x³ − 3x + 7", "5x³ − 6x + 7"],
        richtig: 0,
        erklaerung: "Gliedweise: 20x³, −6x, +7, und die Konstante −2 fällt weg. Die Ableitung einer Konstanten ist 0, nicht die Konstante selbst — einer der drei fatalen Ableitungsfehler aus dem Heft.",
      },
      {
        frage: "3.1c — Leite ab: f(x) = 4/x",
        optionen: ["4x⁻²", "−4x⁻²", "−4x⁻¹", "1/4x²"],
        richtig: 1,
        erklaerung: "Erst umschreiben: 4/x = 4x⁻¹. Dann Potenzregel: 4·(−1)·x⁻² = −4x⁻². Wer umschreibt, braucht die Quotientenregel hier gar nicht.",
      },
      {
        frage: "3.2a — Leite ab: f(x) = (2x − 1)⁵",
        optionen: ["5(2x − 1)⁴", "10(2x − 1)⁴", "10(2x − 1)⁵", "2(2x − 1)⁴"],
        richtig: 1,
        erklaerung: "Äußere Ableitung 5(2x−1)⁴, innere Ableitung 2, Produkt daraus: 10(2x−1)⁴. Die vergessene innere Ableitung ist der klassische Kettenregelfehler.",
      },
      {
        frage: "3.3b — Leite ab: f(x) = (x + 1)/(x − 1)",
        optionen: ["−2/(x − 1)²", "2/(x − 1)²", "1/(x − 1)²", "−2/(x + 1)²"],
        richtig: 0,
        erklaerung: "Quotientenregel: (1·(x−1) − (x+1)·1)/(x−1)² = (x − 1 − x − 1)/(x−1)² = −2/(x−1)². Bei vertauschter Reihenfolge im Zähler dreht sich das Vorzeichen — deshalb steht die Reihenfolge im Heft ausdrücklich dabei.",
      },
      {
        frage: "3.5 — Ein Schüler schreibt: „(x² · x³)′ = 2x · 3x² = 6x³.“ Was ist verletzt?",
        optionen: [
          "Die Kettenregel, richtig wäre 5x⁴",
          "Die Produktregel, richtig wäre 5x⁴",
          "Die Potenzregel, richtig wäre 6x³",
          "Nichts, die Rechnung stimmt",
        ],
        richtig: 1,
        erklaerung: "Produkte werden nicht gliedweise abgeleitet. Am einfachsten hier: erst zusammenfassen zu x⁵, dann ableiten zu 5x⁴. Über die Produktregel: 2x·x³ + x²·3x² = 2x⁴ + 3x⁴ = 5x⁴.",
      },
      {
        frage: "3.6 — Gib eine Funktion an, deren Ableitung f′(x) = 6x − 4 ist. Wie viele solcher Funktionen gibt es?",
        optionen: [
          "Genau eine: 3x² − 4x",
          "Zwei",
          "Unendlich viele: 3x² − 4x + c für jedes c",
          "Keine",
        ],
        richtig: 2,
        erklaerung: "Jede additive Konstante verschwindet beim Ableiten. Deshalb gibt es unendlich viele Stammfunktionen, die sich nur um c unterscheiden — ein erster Blick auf die Integralrechnung.",
      },
      {
        frage: "3.7 — An welcher Stelle hat f(x) = ⅓x³ − x² die Steigung 3?",
        optionen: ["x = 3 und x = −1", "nur x = 3", "x = 1 und x = −3", "x = 0 und x = 2"],
        richtig: 0,
        erklaerung: "f′(x) = x² − 2x = 3 ⇒ x² − 2x − 3 = 0 ⇒ (x − 3)(x + 1) = 0. Wichtig: Die Gleichung wird auf null gebracht, nicht die 3 einfach stehen gelassen.",
      },
    ],
  },
  {
    id: "b04",
    titel: "Nullstellen, Symmetrie, Grenzverhalten",
    unter: "Baustein 04 · Das Gerüst des Graphen",
    einleitung: [
      "Bevor du Extrem- und Wendepunkte suchst, musst du wissen, wo die Funktion überhaupt lebt.",
      "Definitionsbereich, Nullstellen, Symmetrie und Randverhalten legen die grobe Gestalt des Graphen bereits fest.",
    ],
    punkte: [
      "Ausklammern, wenn jedes Glied ein x enthält",
      "pq- oder abc-Formel bei quadratischen Gleichungen",
      "Substitution z = x² bei biquadratischen Termen",
      "Polynomdivision ab Grad 3: erste Nullstelle raten (Teiler des absoluten Glieds), dann dividieren",
      "Vielfachheit: einfach schneidet, doppelt berührt, dreifach schneidet mit waagerechter Tangente",
    ],
    aufgaben: [
      {
        frage: "4.1a — Bestimme alle Nullstellen von f(x) = x³ − 4x.",
        optionen: ["x = ±2", "x = 0 und x = ±2", "x = 0 und x = 4", "x = ±4"],
        richtig: 1,
        erklaerung: "x(x² − 4) = 0. Das Produkt ist null, wenn ein Faktor null ist: x = 0 oder x = ±2. Wer durch x teilt statt auszuklammern, verliert die Nullstelle bei 0 — ein Klassiker.",
      },
      {
        frage: "4.2 — Löse x⁴ − 13x² + 36 = 0.",
        optionen: ["x = ±2 und x = ±3", "x = 4 und x = 9", "x = ±2 und x = ±9", "x = ±13"],
        richtig: 0,
        erklaerung: "Substitution z = x²: z² − 13z + 36 = 0 ⇒ z = 4 oder z = 9. Rücksubstitution: x = ±2 und x = ±3. Der häufigste Fehler ist, bei z stehen zu bleiben.",
      },
      {
        frage: "4.3 — f(x) = x³ − 2x² − 5x + 6 hat die Nullstelle x₁ = 1. Wie lauten die übrigen?",
        optionen: ["x = 2 und x = −3", "x = 3 und x = −2", "x = −1 und x = 6", "x = 3 und x = 2"],
        richtig: 1,
        erklaerung: "Division durch (x − 1) ergibt x² − x − 6 = (x − 3)(x + 2). Die geratene Nullstelle findet man unter den Teilern des absoluten Glieds 6.",
      },
      {
        frage: "4.4c — Welche Symmetrie besitzt f(x) = x³ + x²?",
        optionen: ["achsensymmetrisch zur y-Achse", "punktsymmetrisch zum Ursprung", "keine der beiden", "beides"],
        richtig: 2,
        erklaerung: "f(−x) = −x³ + x² ist weder f(x) noch −f(x). Reine Symmetrie verlangt ausschließlich gerade oder ausschließlich ungerade Exponenten. Gemischt heißt: keine.",
      },
      {
        frage: "4.5a — Beschreibe das Verhalten von f(x) = −2x³ + 5x² für x → ±∞.",
        optionen: [
          "x → +∞: f → +∞ ; x → −∞: f → −∞",
          "x → +∞: f → −∞ ; x → −∞: f → +∞",
          "beide Äste nach oben",
          "beide Äste nach unten",
        ],
        richtig: 1,
        erklaerung: "Nur der höchste Grad entscheidet: −2x³. Ungerader Grad mit negativem Leitkoeffizient heißt von links oben nach rechts unten. Der Term 5x² spielt im Unendlichen keine Rolle.",
      },
      {
        frage: "4.6 — Bestimme Definitionsbereich und Nullstelle von f(x) = (x + 2)/(x² − 9).",
        optionen: [
          "D = ℝ\\{±3}, Nullstelle x = −2",
          "D = ℝ\\{±9}, Nullstelle x = 2",
          "D = ℝ, Nullstelle x = −2",
          "D = ℝ\\{±3}, Nullstelle x = ±3",
        ],
        richtig: 0,
        erklaerung: "Der Nenner wird bei x = ±3 null, dort liegen Polstellen. Ein Bruch ist null, wenn der Zähler null ist: x = −2. Nullstellen des Nenners sind nie Nullstellen der Funktion.",
      },
      {
        frage: "4.7 — Wie sieht der Graph von f(x) = (x − 2)²(x + 1) in der Nähe von x = 2 aus?",
        optionen: [
          "Er schneidet die x-Achse",
          "Er berührt die x-Achse, dort liegt ein Extrempunkt",
          "Er hat dort eine Polstelle",
          "Er schneidet mit waagerechter Tangente",
        ],
        richtig: 1,
        erklaerung: "Die doppelte Nullstelle bedeutet Berührung. Das lässt sich ohne jede Ableitung aus der Vielfachheit ablesen — und spart in der Klausur echte Zeit.",
      },
    ],
  },
  {
    id: "b05",
    titel: "Monotonie & Extrempunkte",
    unter: "Baustein 05 · Was f′ verrät",
    einleitung: [
      "f′ beschreibt, wohin der Graph läuft. Extrempunkte von f sind Nullstellen von f′.",
      "Die entscheidende Unterscheidung dieses Bausteins ist die zwischen notwendiger und hinreichender Bedingung.",
    ],
    punkte: [
      "f′(x) > 0 ⇒ streng monoton steigend, f′(x) < 0 ⇒ streng monoton fallend",
      "Notwendig: f′(x₀) = 0 — liefert nur Kandidaten",
      "Hinreichend: zusätzlich f″(x₀) ≠ 0. Negativ ⇒ Hochpunkt, positiv ⇒ Tiefpunkt",
      "f″(x₀) = 0 ⇒ keine Aussage, jetzt zwingend Vorzeichenwechsel von f′ prüfen",
      "Auf [a; b] zusätzlich f(a) und f(b) vergleichen — Randextrema werden im Abitur häufig vergessen",
    ],
    aufgaben: [
      {
        frage: "5.1 — Bestimme die Extrempunkte von f(x) = x³ − 3x.",
        optionen: [
          "H(−1 | 2) und T(1 | −2)",
          "H(1 | −2) und T(−1 | 2)",
          "nur T(0 | 0)",
          "H(−1 | −2) und T(1 | 2)",
        ],
        richtig: 0,
        erklaerung: "f′ = 3x² − 3 = 0 ⇒ x = ±1. f″ = 6x: f″(−1) = −6 < 0 ⇒ Hochpunkt, f″(1) = 6 > 0 ⇒ Tiefpunkt. y-Werte über f einsetzen, nicht über f′.",
      },
      {
        frage: "Warum reicht f′(x₀) = 0 allein nicht aus, um einen Extrempunkt nachzuweisen?",
        optionen: [
          "Weil die Rechnung ungenau sein könnte",
          "Weil auch Sattelpunkte diese Bedingung erfüllen",
          "Weil f″ immer benötigt wird",
          "Weil x₀ außerhalb des Definitionsbereichs liegen könnte",
        ],
        richtig: 1,
        erklaerung: "f(x) = x³ hat bei 0 eine waagerechte Tangente, aber keinen Extrempunkt. Die Bedingung ist notwendig, nicht hinreichend — deshalb die zweite Prüfung über f″ oder den Vorzeichenwechsel.",
      },
      {
        frage: "5.2 — Untersuche f(x) = ¼x⁴ − 2x² auf Extrempunkte.",
        optionen: [
          "H(0 | 0), T(2 | −4), T(−2 | −4)",
          "T(0 | 0), H(±2 | 4)",
          "nur H(0 | 0)",
          "H(±2 | −4), T(0 | 0)",
        ],
        richtig: 0,
        erklaerung: "f′ = x³ − 4x = x(x² − 4) ⇒ x = 0; ±2. f″ = 3x² − 4: f″(0) = −4 < 0 ⇒ Hochpunkt, f″(±2) = 8 > 0 ⇒ Tiefpunkte. Die Symmetrie zur y-Achse macht die beiden Tiefpunkte erwartbar.",
      },
      {
        frage: "5.4 — Warum hat f(x) = x⁴ bei x = 0 einen Tiefpunkt, obwohl f″(0) = 0 ist?",
        optionen: [
          "Weil f‴(0) ≠ 0 ist",
          "Weil f′ dort von negativ nach positiv wechselt",
          "Weil x⁴ immer positiv ist",
          "Es ist gar kein Tiefpunkt, sondern ein Sattelpunkt",
        ],
        richtig: 1,
        erklaerung: "f″(0) = 0 liefert keine Aussage, das ist kein Ausschluss. Jetzt greift das Vorzeichenwechsel-Kriterium: f′ = 4x³ ist links von 0 negativ, rechts positiv — von fallend nach steigend, also Tiefpunkt.",
      },
      {
        frage: "5.5 — Bestimme das globale Maximum von f(x) = x³ − 3x auf dem Intervall [0; 4].",
        optionen: [
          "2 bei x = −1",
          "52 bei x = 4",
          "0 bei x = 0",
          "−2 bei x = 1",
        ],
        richtig: 1,
        erklaerung: "Der Hochpunkt bei x = −1 liegt außerhalb des Intervalls. Innerhalb gibt es nur den Tiefpunkt bei x = 1. Das Maximum liegt daher am Rand: f(4) = 64 − 12 = 52. Genau dieser Randvergleich wird im Abitur am häufigsten vergessen.",
      },
    ],
  },
  {
    id: "b06",
    titel: "Krümmung & Wendepunkte",
    unter: "Baustein 06 · Was f″ verrät",
    einleitung: [
      "f″ beschreibt, wie sich der Graph dreht. Wendepunkte von f sind Extrempunkte von f′.",
    ],
    punkte: [
      "f″(x) > 0 ⇒ linksgekrümmt (konvex), f″(x) < 0 ⇒ rechtsgekrümmt (konkav)",
      "Wendepunkt: f″(x₀) = 0 notwendig, f‴(x₀) ≠ 0 hinreichend",
      "y-Wert immer über f(x₀) berechnen, dann als Punkt notieren",
      "Wendetangente: y = f′(x₀)(x − x₀) + f(x₀)",
      "Sattelpunkt = Wendepunkt mit f′(x₀) = 0, also waagerechter Wendetangente",
    ],
    aufgaben: [
      {
        frage: "6.1 — Bestimme den Wendepunkt von f(x) = x³ − 3x².",
        optionen: ["W(1 | −2)", "W(1 | 1)", "W(0 | 0)", "W(2 | −4)"],
        richtig: 0,
        erklaerung: "f″ = 6x − 6 = 0 ⇒ x = 1. f‴ = 6 ≠ 0, also bestätigt. y-Wert über f: f(1) = 1 − 3 = −2. Der y-Wert muss aus f kommen, nicht aus f″.",
      },
      {
        frage: "6.1 — Wie ist f(x) = x³ − 3x² links von x = 1 gekrümmt?",
        optionen: ["linksgekrümmt", "rechtsgekrümmt", "gar nicht gekrümmt", "wechselnd"],
        richtig: 1,
        erklaerung: "Für x < 1 ist f″ = 6x − 6 < 0, also rechtsgekrümmt (konkav). Rechts des Wendepunkts kehrt sich das um — genau das macht die Stelle zum Wendepunkt.",
      },
      {
        frage: "6.3 — Warum besitzt f(x) = x³ im Ursprung einen Sattelpunkt?",
        optionen: [
          "Weil f(0) = 0 ist",
          "Weil f′(0) = 0 und f″(0) = 0 sind, aber f‴(0) ≠ 0",
          "Weil die Funktion punktsymmetrisch ist",
          "Weil f″ dort das Vorzeichen nicht wechselt",
        ],
        richtig: 1,
        erklaerung: "f′ = 3x², f″ = 6x, f‴ = 6. Bei x = 0 verschwinden erste und zweite Ableitung, die dritte nicht. Also Wendepunkt mit waagerechter Tangente — die Definition des Sattelpunkts.",
      },
      {
        frage: "6.4 — Der Graph von f′ ist eine nach oben geöffnete Parabel mit Nullstellen bei −2 und 4. Was folgt für f?",
        optionen: [
          "Hochpunkt bei −2, Tiefpunkt bei 4, Wendepunkt bei 1",
          "Tiefpunkt bei −2, Hochpunkt bei 4, Wendepunkt bei 1",
          "Zwei Wendepunkte bei −2 und 4",
          "Hochpunkt bei 1, keine Wendestelle",
        ],
        richtig: 0,
        erklaerung: "Nullstellen von f′ sind Extremstellen von f. Links von −2 ist f′ positiv (steigend), dazwischen negativ (fallend), danach wieder positiv: Hoch, dann Tief. Der Scheitel der Parabel bei x = 1 ist das Minimum von f′, also die Wendestelle von f.",
      },
    ],
  },
  {
    id: "b07",
    titel: "Die vollständige Kurvendiskussion",
    unter: "Baustein 07 · Das Protokoll",
    einleitung: [
      "Hier wird nichts Neues gelernt. Es geht ausschließlich darum, alle Teilschritte in fester Reihenfolge zu verbinden und sauber zu notieren.",
      "Der Graph entsteht aus den berechneten Punkten — nicht umgekehrt.",
    ],
    punkte: [
      "1. Definitionsbereich  2. Symmetrie  3. Achsenschnittpunkte",
      "4. Verhalten für x → ±∞  5. Ableitungen f′, f″, f‴",
      "6. Extrempunkte  7. Monotonieintervalle",
      "8. Wendepunkte und Krümmung  9. Wertetabelle und Graph",
      "Vor der Abgabe: Pen-&-Paper-Check — jeder Schritt überschrieben, ein Gedanke pro Zeile, jedes Ergebnis als Punkt (x | y)",
    ],
    aufgaben: [
      {
        frage: "Warum steht das Grenzverhalten im Protokoll vor den Ableitungen?",
        optionen: [
          "Weil es am einfachsten ist",
          "Weil es die grobe Gestalt festlegt, an der man alle späteren Ergebnisse auf Plausibilität prüfen kann",
          "Weil es sonst vergessen wird",
          "Weil man dafür f′ nicht braucht",
        ],
        richtig: 1,
        erklaerung: "Grad, Leitkoeffizient, Nullstellen und Symmetrie ergeben zusammen bereits eine Rohskizze. Wer danach einen Hochpunkt berechnet, der zu dieser Skizze nicht passt, erkennt den Rechenfehler sofort statt erst beim Zeichnen.",
      },
      {
        frage: "Musterablauf — f(x) = x³ − 3x² − 9x + 27 hat die Nullstellen …",
        optionen: [
          "x = 3 (doppelt) und x = −3",
          "x = 3 und x = −9",
          "x = ±3 und x = 27",
          "x = −3 (doppelt) und x = 3",
        ],
        richtig: 0,
        erklaerung: "Raten liefert f(3) = 27 − 27 − 27 + 27 = 0. Die Division führt auf f(x) = (x − 3)²(x + 3). Die doppelte Nullstelle bei 3 bedeutet Berührung — und tatsächlich liegt dort der Tiefpunkt T(3 | 0).",
      },
      {
        frage: "Musterablauf — welche Extrempunkte besitzt f(x) = x³ − 3x² − 9x + 27?",
        optionen: [
          "H(−1 | 32) und T(3 | 0)",
          "H(3 | 0) und T(−1 | 32)",
          "H(1 | 16) und T(3 | 0)",
          "nur T(3 | 0)",
        ],
        richtig: 0,
        erklaerung: "f′ = 3x² − 6x − 9 = 3(x − 3)(x + 1) ⇒ x = −1; 3. f″ = 6x − 6: f″(−1) = −12 < 0 ⇒ Hochpunkt, f″(3) = 12 > 0 ⇒ Tiefpunkt.",
      },
      {
        frage: "Im Pen-&-Paper-Check steht: „jedes Ergebnis als Punkt (x | y) notiert“. Warum ist das mehr als Formsache?",
        optionen: [
          "Es sieht ordentlicher aus",
          "Es zwingt dich, den y-Wert tatsächlich zu berechnen statt nur die x-Stelle zu nennen",
          "Es spart Platz",
          "Es ist Vorschrift im Abitur",
        ],
        richtig: 1,
        erklaerung: "Ein Extrempunkt ist ein Punkt, keine Zahl. Wer nur „Hochpunkt bei x = −1“ schreibt, hat die Aufgabe halb gelöst und verliert Punkte — und merkt außerdem nicht, wenn der y-Wert nicht zur Skizze passt.",
      },
    ],
  },
  {
    id: "b08",
    titel: "Anwendung & Transfer",
    unter: "Baustein 08 · Die Abituraufgaben-Typen",
    einleitung: [
      "Vier Typen decken den Großteil aller Abituraufgaben zur Analysis ab: Tangente und Normale, Extremwertaufgaben, Steckbriefaufgaben und Funktionenscharen.",
      "Sie verlangen kein neues Wissen, sondern die Übersetzung einer Textaufgabe in die bekannten Werkzeuge.",
    ],
    punkte: [
      "Tangente: y = f′(x₀)(x − x₀) + f(x₀) — Normale: Steigung −1/f′(x₀), gleicher Punkt",
      "Extremwert: Zielgröße, Hauptbedingung, Nebenbedingung, einsetzen, Extremum prüfen, Ränder vergleichen",
      "Steckbrief: Punkt auf Gf ⇒ f(a) = b · Extrempunkt ⇒ f′(a) = 0 · Wendepunkt ⇒ f″(a) = 0",
      "Grad n ⇒ n + 1 Unbekannte ⇒ ebenso viele Gleichungen nötig",
      "Schar: Parameter t beim Ableiten nach x wie eine Konstante behandeln",
    ],
    aufgaben: [
      {
        frage: "8.1 — Bestimme die Tangente an f(x) = x² − 2x + 3 an der Stelle x₀ = 2.",
        optionen: ["y = 2x − 1", "y = 2x + 3", "y = 2x", "y = −0,5x + 4"],
        richtig: 0,
        erklaerung: "f′(x) = 2x − 2, also f′(2) = 2. f(2) = 3. Einsetzen: y = 2(x − 2) + 3 = 2x − 1. Die Antwort y = −0,5x + 4 wäre die Normale.",
      },
      {
        frage: "8.2 — An welcher Stelle hat der Graph von f(x) = x³ − 3x² eine Tangente mit Steigung 9?",
        optionen: ["x = 3 und x = −1", "nur x = 3", "x = 9", "x = 0 und x = 2"],
        richtig: 0,
        erklaerung: "f′ = 3x² − 6x = 9 ⇒ 3x² − 6x − 9 = 0 ⇒ x² − 2x − 3 = 0 ⇒ x = 3 oder x = −1. Es gibt oft mehr als eine Lösung — nach der ersten aufzuhören kostet Punkte.",
      },
      {
        frage: "8.4 — Aus einem Karton 30 cm × 30 cm werden an den Ecken Quadrate der Seitenlänge x ausgeschnitten und eine offene Schachtel gefaltet. Für welches x wird das Volumen maximal?",
        optionen: ["x = 5, V = 2000 cm³", "x = 7,5, V = 1687,5 cm³", "x = 10, V = 1000 cm³", "x = 15, V = 0"],
        richtig: 0,
        erklaerung: "V(x) = x(30 − 2x)². Ableiten und ausklammern: V′ = (30 − 2x)(30 − 6x) ⇒ x = 5 oder x = 15. Bei x = 15 ist das Volumen null, also Randfall. Bleibt x = 5 mit V = 5 · 20² = 2000 cm³.",
      },
      {
        frage: "8.3 — Einem Parabelbogen y = 9 − x² wird über der x-Achse ein achsensymmetrisches Rechteck einbeschrieben. Wie lautet der maximale Flächeninhalt?",
        optionen: ["A = 12√3 ≈ 20,8", "A = 18", "A = 9√3", "A = 27"],
        richtig: 0,
        erklaerung: "Breite 2x, Höhe 9 − x², also A(x) = 18x − 2x³. A′ = 18 − 6x² = 0 ⇒ x = √3. Einsetzen: A = 2√3 · 6 = 12√3. Der Schlüssel ist, die Breite als 2x anzusetzen — die Symmetrie wird gern übersehen.",
      },
      {
        frage: "8.5 — Eine ganzrationale Funktion dritten Grades ist punktsymmetrisch zum Ursprung und hat bei H(−1 | 2) einen Hochpunkt. Wie lautet f(x)?",
        optionen: ["f(x) = x³ − 3x", "f(x) = −x³ + 3x", "f(x) = x³ − 3x + 2", "f(x) = 2x³ − x"],
        richtig: 0,
        erklaerung: "Punktsymmetrie erlaubt nur ungerade Exponenten: f = ax³ + bx. Aus f′(−1) = 0 folgt 3a + b = 0, aus f(−1) = 2 folgt −a − b = 2. Einsetzen ergibt a = 1, b = −3.",
      },
      {
        frage: "8.7 — Für die Schar ft(x) = x³ − 3t²x mit t > 0: Wie lautet die Ortskurve aller Hochpunkte?",
        optionen: ["y = −2x³", "y = 2x³", "y = −2t³", "y = x³ − 3x"],
        richtig: 0,
        erklaerung: "f′ = 3x² − 3t² = 0 ⇒ x = ±t. Der Hochpunkt liegt bei H(−t | 2t³). Nun t eliminieren: aus x = −t folgt t = −x, eingesetzt y = 2(−x)³ = −2x³. Die Ortskurve darf kein t mehr enthalten.",
      },
      {
        frage: "8.8 — Untersuche f(x) = x · e⁻ˣ. Wo liegt der Hochpunkt?",
        optionen: ["H(1 | e⁻¹)", "H(0 | 0)", "H(2 | 2e⁻²)", "H(−1 | −e)"],
        richtig: 0,
        erklaerung: "Produktregel: f′ = e⁻ˣ − x·e⁻ˣ = e⁻ˣ(1 − x). e-Terme werden nie null, also entscheidet der Faktor davor: 1 − x = 0 ⇒ x = 1. Der Wendepunkt liegt entsprechend bei W(2 | 2e⁻²).",
      },
    ],
  },
];


export const M_AUSWAHL = [
  { n: 1, d: 1 }, { n: -1, d: 1 }, { n: 2, d: 1 }, { n: -2, d: 1 }, { n: 3, d: 1 }, { n: -3, d: 1 },
  { n: 1, d: 2 }, { n: -1, d: 2 }, { n: 3, d: 2 }, { n: -3, d: 2 },
  { n: 2, d: 3 }, { n: -2, d: 3 }, { n: 3, d: 4 }, { n: -3, d: 4 },
];


export const KAUF_LINKS = {
  penpaper: "",
  analysis1: "",
  analysis2: "",
  analysis3: "",
  analysis4: "",
  analysis5: "",
  vektoren: "",
  stochastik: "",
};


export const KURSE = [
  {
    id: "penpaper",
    titel: "Pen & Paper",
    unter: "Das Blatt als Arbeitsplatz des Denkens",
    preis: 100,
    stufe: "Klasse 8 – 13",
    umfang: "7 Bausteine · Videokurs mit Kurz-Checks",
    grafik: "papier",
    kurz: "Das Fundament für jedes Thema: klar aufschreiben, strukturiert arbeiten, sicher mit Fehlern umgehen – nach dem Matheskript-System.",
    text: [
      "Wer in Klausuren scheitert, scheitert fast nie am Stoff, sondern an der Art zu arbeiten: Schritte im Kopf, zu viel in einer Zeile, ein Gleichheitszeichen als Pfeil, Rechnen ohne Ziel. Pen & Paper setzt genau dort an – nicht mit mehr Aufgaben, sondern mit besserem Denken auf dem Papier.",
      "Der Kurs behandelt dein Blatt als Arbeitsplatz des Denkens: zwei Grundgesetze, die 7 Goldenen Regeln, ein Arbeitsprozess in sechs Stufen, das 5-Fragen-Protokoll für den Moment, in dem du feststeckst, und ein Pen-&-Paper-Check für jede Abgabe. Das alles gilt in Analysis genauso wie in Vektoren und Stochastik.",
    ],
    lernst: [
      "So aufschreiben, dass dein Blatt dein Denken entlastet statt belastet",
      "Die 7 Goldenen Regeln sicher anwenden – eine Idee pro Zeile, vertikal geordnet",
      "Gleichheitszeichen, Äquivalenz- und Folgepfeile korrekt verwenden",
      "Jede Aufgabe mit dem 6-Stufen-Prozess angehen: Orientieren bis Abschließen",
      "Mit dem 5-Fragen-Protokoll weiterkommen, statt auf die Lösung zu schauen",
      "Deine Lösung vor der Abgabe mit dem Pen-&-Paper-Check prüfen",
    ],
    fuerWen: "Für alle ab Klasse 8 bis zum Abitur – unabhängig vom Thema. Besonders für alle, die „eigentlich alles verstehen“, aber in Klausuren trotzdem Punkte verlieren. Am besten vor oder parallel zu den Themenkursen.",
  },
  {
    id: "analysis1",
    titel: "Analysis 1",
    unter: "Geraden",
    preis: 50,
    stufe: "Klasse 8 – 11",
    umfang: "5 Bausteine · Videokurs mit Kurz-Checks",
    grafik: "gerade",
    kurz: "Lineare Funktionen von Grund auf: Steigung, Achsenabschnitt, Geradengleichungen, Schnittpunkte und die Lage zweier Geraden.",
    text: [
      "Die Gerade ist die einfachste Funktion – und die wichtigste. Steigung als Änderungsrate, der Differenzenquotient, das Gleichsetzen zweier Terme: Alles, was später in der Analysis kommt, benutzt genau diese Ideen.",
      "Der Kurs baut sie sauber auf: vom Ablesen und Aufstellen einer Geradengleichung bis zu Schnittpunkten, parallelen und senkrechten Geraden. Wer hier sicher ist, hat in der Oberstufe ein Fundament, das trägt.",
    ],
    lernst: [
      "Steigung und y-Achsenabschnitt ablesen und deuten",
      "Die Steigung aus zwei Punkten mit dem Steigungsdreieck berechnen",
      "Eine Geradengleichung aus zwei Punkten oder Punkt und Steigung aufstellen",
      "Schnittpunkte zweier Geraden durch Gleichsetzen berechnen",
      "Parallele und senkrechte Geraden erkennen und aufstellen",
    ],
    fuerWen: "Für alle ab Klasse 8, die lineare Funktionen sicher beherrschen wollen – und für alle in der Oberstufe, bei denen es an dieser Stelle wackelt. Ideal als Einstieg vor Analysis 2.",
  },
  {
    id: "analysis2",
    titel: "Analysis 2",
    unter: "Polynome",
    preis: 100,
    stufe: "Klasse 9 – 12",
    umfang: "5 Bausteine · Videokurs mit Kurz-Checks",
    grafik: "polynom",
    kurz: "Ganzrationale Funktionen lesen und lösen: Grad, Verhalten im Unendlichen, Symmetrie, Nullstellen und Polynomdivision.",
    text: [
      "Ganzrationale Funktionen sind das Material fast jeder Abituraufgabe. Wer ihren Term lesen kann, weiß schon vor dem Rechnen, wie der Graph ungefähr aussieht – wie viele Nullstellen möglich sind, wohin er im Unendlichen läuft, ob er symmetrisch ist.",
      "Der Kurs verbindet diesen Blick mit dem Handwerk: Nullstellen mit Ausklammern, pq-Formel, Substitution und Polynomdivision. Genau die Techniken, die du in der Kurvendiskussion ständig brauchst.",
    ],
    lernst: [
      "Grad und Leitkoeffizient bestimmen und deuten",
      "Das Verhalten im Unendlichen ohne Rechnung angeben",
      "Symmetrie erkennen und mit f(−x) nachweisen",
      "Nullstellen mit Ausklammern, pq-Formel und Substitution berechnen",
      "Mit Polynomdivision einen Linearfaktor abspalten",
    ],
    fuerWen: "Für alle, die Geraden und quadratische Funktionen kennen und jetzt zu höheren Graden übergehen. Setzt Analysis 1 oder sicheres Rechnen mit Termen voraus.",
  },
  {
    id: "analysis3",
    titel: "Analysis 3",
    unter: "Andere Funktionen",
    preis: 100,
    stufe: "Klasse 10 – 13",
    umfang: "5 Bausteine · Videokurs mit Kurz-Checks",
    grafik: "funktionen",
    kurz: "e-Funktion, Logarithmus, Sinus und Kosinus, Wurzel- und gebrochenrationale Funktionen – jede Funktionsklasse mit ihren Eigenheiten.",
    text: [
      "Im Abitur kommen nicht nur Polynome vor. Wachstum wird mit der e-Funktion modelliert, Schwingungen mit Sinus und Kosinus, Konzentrationen oft mit gebrochenrationalen Funktionen. Jede Klasse hat ihren eigenen Definitionsbereich, ihre typischen Asymptoten und ihre eigenen Ableitungen.",
      "Der Kurs stellt die fünf wichtigsten Klassen nebeneinander, damit du sie sicher unterscheidest: Was darf ich einsetzen? Wo ist der Graph nicht definiert? Welche Eigenschaft wird in der Aufgabe gerade gefragt?",
    ],
    lernst: [
      "Die e-Funktion und ihre besonderen Eigenschaften nutzen",
      "Exponentialgleichungen mit dem natürlichen Logarithmus lösen",
      "Sinus- und Kosinusfunktionen strecken, stauchen und verschieben",
      "Definitionsbereiche von Wurzelfunktionen bestimmen",
      "Definitionslücken, Pole und Asymptoten gebrochenrationaler Funktionen finden",
    ],
    fuerWen: "Für die Oberstufe, sobald der Unterricht über Polynome hinausgeht. Setzt Analysis 2 voraus.",
  },
  {
    id: "analysis4",
    titel: "Analysis 4",
    unter: "Kurvendiskussion",
    preis: 100,
    stufe: "Klasse 11 – 13",
    umfang: "5 Bausteine · Videokurs mit Kurz-Checks",
    grafik: "kurve",
    kurz: "Vom Differenzenquotienten bis zur vollständigen Kurvendiskussion auf Abiturniveau – mit einem Protokoll, das in jeder Klausur trägt.",
    text: [
      "Analysis ist kein Themenhaufen, sondern eine Kette. Wer bei der Kurvendiskussion scheitert, scheitert fast nie an der Kurvendiskussion – sondern an einem Baustein davor.",
      "Dieser Kurs baut die Kette auf: Steigung als Änderungsrate, daraus der Ableitungsbegriff, daraus das Handwerk der Ableitungsregeln, daraus Extrem- und Wendepunkte und am Ende die vollständige Diskussion eines Graphen.",
    ],
    lernst: [
      "Die h-Methode sicher durchführen und f′(x) geometrisch deuten",
      "Alle Ableitungsregeln fehlerfrei anwenden, auch verschachtelt",
      "Extrempunkte mit notwendiger und hinreichender Bedingung bestimmen",
      "Wendepunkte berechnen und das Krümmungsverhalten beschreiben",
      "Eine Kurvendiskussion vollständig und sauber notieren",
    ],
    fuerWen: "Für alle in der Oberstufe, die die Kurvendiskussion sicher beherrschen wollen. Setzt Analysis 2 (Polynome und Nullstellen) voraus.",
  },
  {
    id: "analysis5",
    titel: "Analysis 5",
    unter: "Integrale",
    preis: 100,
    stufe: "Klasse 11 – 13",
    umfang: "5 Bausteine · Videokurs mit Kurz-Checks",
    grafik: "flaeche",
    kurz: "Stammfunktionen, Hauptsatz, Flächen mit der x-Achse und zwischen Graphen, Rotationsvolumen.",
    text: [
      "Wenn die Ableitung sitzt, kehrt sich die Frage um: Welche Funktion hatte diese Steigung? Aus dieser Umkehrung entsteht das Integral – und mit ihm die Fähigkeit, Flächen, Volumina und Gesamtmengen zu berechnen.",
      "Der Kurs führt vom Bilden einer Stammfunktion über den Hauptsatz zu den typischen Abituraufgaben: Flächen mit Vorzeichenwechsel, Flächen zwischen zwei Graphen und Rotationskörper.",
    ],
    lernst: [
      "Stammfunktionen bilden und durch Ableiten prüfen",
      "Bestimmte Integrale mit dem Hauptsatz berechnen",
      "Flächen mit der x-Achse korrekt an den Nullstellen zerlegen",
      "Flächen zwischen zwei Graphen über die Differenzfunktion bestimmen",
      "Das Volumen von Rotationskörpern berechnen",
    ],
    fuerWen: "Für alle, die die Ableitung sicher beherrschen und in der Schule bei Integralen angekommen sind. Setzt Analysis 4 voraus.",
  },
  {
    id: "vektoren",
    titel: "Vektoren",
    unter: "Geraden, Ebenen und Lagebeziehungen im Raum",
    preis: 100,
    stufe: "Klasse 11 – 13",
    umfang: "6 Bausteine · über 45 Aufgaben · ca. 16 Stunden",
    grafik: "vektor",
    kurz: "Analytische Geometrie von Grund auf – vom Ortsvektor bis zu Abständen zwischen windschiefen Geraden.",
    text: [
      "Vektorgeometrie scheitert selten am Rechnen. Sie scheitert daran, dass man sich die Lage im Raum nicht vorstellt und deshalb nicht weiß, welches Verfahren gerade das richtige ist.",
      "Dieser Kurs baut zuerst die Anschauung auf und liefert dann für jede Frage ein festes Verfahren: Wie liegen zwei Geraden zueinander? Wo schneidet eine Gerade eine Ebene? Wie weit ist ein Punkt von einer Ebene entfernt? Jedes Verfahren mit klarem Startpunkt und klarem Abschluss.",
    ],
    lernst: [
      "Mit Vektoren rechnen: Addition, Vielfache, Betrag, Einheitsvektor",
      "Skalarprodukt für Winkel und Orthogonalität, Kreuzprodukt für Normalenvektoren",
      "Geraden in Parameterform aufstellen und Punktproben durchführen",
      "Ebenen in Parameter-, Normalen- und Koordinatenform – und sicher umformen",
      "Lagebeziehungen bestimmen: parallel, schneidend, windschief, identisch",
      "Schnittpunkte, Schnittgeraden und Schnittwinkel berechnen",
      "Abstände: Punkt–Gerade, Punkt–Ebene, windschiefe Geraden",
    ],
    fuerWen: "Für die Oberstufe, unabhängig von Analysis. Der Kurs ist eigenständig und setzt nur Grundrechenarten und etwas räumliches Vorstellungsvermögen voraus.",
  },
  {
    id: "stochastik",
    titel: "Stochastik",
    unter: "Wahrscheinlichkeit, Verteilungen und Tests",
    preis: 100,
    stufe: "Klasse 11 – 13",
    umfang: "5 Bausteine · Videokurs mit Kurz-Checks",
    grafik: "stochastik",
    kurz: "Vom Baumdiagramm bis zum Hypothesentest – die Stochastik des Abiturs, zurückgeführt auf wenige klare Regeln.",
    text: [
      "Stochastik wirkt oft wie eine Sammlung von Tricks: hier ein Baumdiagramm, dort eine Formel, dann plötzlich ein Test. Tatsächlich stecken dahinter nur wenige Grundideen – Pfade, Bedingungen, Erwartungswerte und Verteilungen.",
      "Dieser Kurs führt diese Ideen der Reihe nach ein und zeigt bei jeder Aufgabe, welche davon gerade gefragt ist. So erkennst du im Abitur auf einen Blick, ob du ein Baumdiagramm, eine Vierfeldertafel oder die Binomialverteilung brauchst.",
    ],
    lernst: [
      "Mehrstufige Zufallsversuche mit Baumdiagramm und Pfadregeln lösen",
      "Vierfeldertafeln aufstellen und bedingte Wahrscheinlichkeiten berechnen",
      "Unabhängigkeit von Ereignissen prüfen",
      "Zufallsgrößen beschreiben und ihren Erwartungswert berechnen",
      "Binomialverteilte Zufallsgrößen erkennen und mit der Bernoulli-Formel rechnen",
      "Einen einseitigen Hypothesentest aufstellen und das Ergebnis deuten",
    ],
    fuerWen: "Für die Oberstufe, unabhängig von Analysis und Vektoren. Vorausgesetzt wird nur sicheres Bruchrechnen – das kannst du im Bereich Kopfrechnen auffrischen.",
  },
];


export const INTRO_VIDEO_URL = "";

export const BIBEL_URL = "";

/* Beispieldaten für die Demo-Ansicht. Im Livebetrieb kommen sie aus dem Nutzerkonto. */

export const DEMO = {
  streak: 12,
  eigenstaendigkeit: 61,
  vorher: 3,
  wochen: [38, 41, 40, 47, 52, 55, 61],
  fehler: [
    { name: "Zeilenkompression", trend: "runter" },
    { name: "Gleichheitszeichen als Pfeil", trend: "hoch" },
  ],
  heute: { titel: "Zeilenkompression, Wiedervorlage", knopf: "Zwillingsaufgabe rechnen" },
  kurs: { name: "Analysis 1, Baustein 3", fortschritt: 43 },
};


export const KOEFF_FARBEN = { e: C.see, a: C.gruen, b: C.gold, c: C.smaragd, d: C.lila };

export const KOEFF_SPALTEN = ["e", "a", "b", "c", "d"];

export const KOEFF_HOCH = { 4: "⁴", 3: "³", 2: "²" };

/* Baut eine Formel-Zeile (f, f′ oder f″) als festes 5-Spalten-Raster auf —
   eine Spalte je Koeffizient, leer wenn der Term in dieser Zeile wegfällt.
   So stehen die Plus-/Minuszeichen von f, f′ und f″ exakt untereinander. */

export const Regler = ({ label, wert, setzen, min, max, farbe }) => (
  <div className="flex flex-col items-center" style={{
    flex: 1, minWidth: 0, padding: "7px 3px 8px", borderRadius: 12,
    border: `1.5px solid ${hexZuRgba(farbe, 0.32)}`, background: hexZuRgba(farbe, 0.08),
  }}>
    <span style={{ fontSize: 10.5, fontWeight: 600, color: farbe, marginBottom: 2, whiteSpace: "nowrap" }}>
      {label}
    </span>
    <span style={{ fontSize: 15, fontWeight: 700, color: farbe, marginBottom: 6, whiteSpace: "nowrap" }}>
      {wert > 0 ? `+${wert}` : wert}
    </span>
    <div className="flex flex-col items-center" style={{ gap: 5 }}>
      <button onClick={() => setzen(Math.min(max, wert + 1))}
        style={{ ...knopfWinzig, borderColor: hexZuRgba(farbe, 0.4), color: farbe }}>+</button>
      <button onClick={() => setzen(Math.max(min, wert - 1))}
        style={{ ...knopfWinzig, borderColor: hexZuRgba(farbe, 0.4), color: farbe }}>−</button>
    </div>
  </div>
);

/* ---------- Kurvendiskussion ---------- */

/* Alle positiven Teiler von n (für die Ganzzahl-Nullstellensuche). */

export const knopfKlein = {
  width: 34, height: 34, borderRadius: 10, border: `1px solid ${C.linie}`,
  background: C.weiss, color: C.see, fontSize: 18, fontFamily: "inherit", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};

/* Plus/Minus für den Polynomplotter — untereinander statt nebeneinander,
   dadurch dürfen sie größer sein, obwohl fünf Koeffizienten in eine Reihe
   passen müssen. Rand- und Textfarbe werden pro Koeffizient überschrieben
   (siehe Regler). */

export const knopfWinzig = {
  width: 34, height: 30, borderRadius: 9, border: `1px solid ${C.linie}`,
  background: C.weiss, fontSize: 18, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};

/* ---------- Formelsatz ---------- */

/* Kleiner Setzer für eine LaTeX-Teilmenge. Rendert in derselben Schrift wie
   der Fließtext, mit echten Bruchstrichen statt Schrägstrichen. */


export const MSYM = {
  cdot: "·", times: "×", to: "→", rightarrow: "→", Rightarrow: "⇒", Leftrightarrow: "⇔",
  in: "∈", neq: "≠", ne: "≠", pm: "±", mp: "∓", infty: "∞", ldots: "…", dots: "…",
  le: "≤", leq: "≤", ge: "≥", geq: "≥", approx: "≈", Delta: "Δ", pi: "π", varepsilon: "ε",
  quad: "\u2003", qquad: "\u2003\u2003", ",": "\u2009", ";": "\u2009", ":": "\u2009",
  " ": " ", sin: "sin", cos: "cos", tan: "tan", ln: "ln", exp: "exp", prime: "′",
};

export const MMENGEN = { R: "ℝ", N: "ℕ", Z: "ℤ", Q: "ℚ", C: "ℂ" };


export const HOCH = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };


export const PARAM_WERTE = {
  a: 1.3097, b: 2.1741, c: 0.7309, d: 3.1103, g: 1.5107, h: 2.0301, k: 1.8719,
  m: 0.5903, n: 2.2917, p: 1.9703, q: 3.3701, r: 0.2917, s: 1.0709, t: 2.5303,
  u: 0.8311, v: 1.6301, w: 2.7109, y: 1.1903, z: 0.4111,
};


export const FUNKTIONEN = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  ln: Math.log, log: Math.log, exp: Math.exp, sqrt: Math.sqrt, abs: Math.abs,
};


export const PRUEFSTELLEN = [0.37, 0.86, 1.23, 1.74, 2.31, 3.08, 4.13];


export const DIFFQ_TESTPAARE = [
  { x: 0.37, h: 0.21 }, { x: 0.86, h: -0.14 }, { x: 1.23, h: 0.33 },
  { x: 1.74, h: 0.09 }, { x: 2.31, h: -0.27 }, { x: 3.08, h: 0.17 },
];


export const ganzNZ = (von, bis) => { let v; do { v = ganz(von, bis); } while (v === 0); return v; };


export const MODUL_PDF_URL = ""; // Adresse der PDF „Matheskript-Ableitungsregeln.pdf" eintragen


export const zuf = (a) => a[Math.floor(Math.random() * a.length)];

export const ganz = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const ohneNull = (min, max) => { let v = 0; while (v === 0) v = ganz(min, max); return v; };


export const ABL_KAPITEL = [
  {
    nr: 1,
    titel: "Ableitung & Differenzenquotient",
    kurz: "Woher die Definition kommt und wie die h-Methode funktioniert",
    theorie: [
      { t: "text", s: "Die Steigung einer Geraden ist einfach: zwei Punkte, $\\frac{\\Delta y}{\\Delta x}$. Bei einer Kurve geht das nicht, weil die Steigung an jeder Stelle eine andere ist." },
      { t: "text", s: "Der Ausweg: Man nimmt trotzdem zwei Punkte — den interessierenden Punkt $P(x_0 \\, | \\, f(x_0))$ und einen zweiten, der um $h$ daneben liegt. Die Gerade dadurch heißt Sekante, ihre Steigung ist der Differenzenquotient." },
      { t: "formel", titel: "Differenzenquotient", zeilen: ["\\frac{f(x_0+h)-f(x_0)}{h}"] },
      { t: "text", s: "Lässt man $h$ immer kleiner werden, rückt der zweite Punkt heran und aus der Sekante wird die Tangente. Deren Steigung ist die gesuchte Zahl." },
      { t: "formel", titel: "Definition", zeilen: ["f′(x_0) = \\lim_{h \\to 0} \\frac{f(x_0+h)-f(x_0)}{h}"] },
      { t: "merk", s: "Die h-Methode in drei Schritten: ausmultiplizieren, $h$ ausklammern und kürzen, erst dann $h \\to 0$ setzen. Wer $h$ sofort null setzt, hat die Rechnung nicht abgekürzt, sondern zerstört — vorher steht $\\frac{0}{0}$ da." },
      { t: "text", s: "Fünf Funktionen, direkt aus der Definition hergeleitet:" },
      { t: "formel", titel: "Konstante und Identität", zeilen: [
        "\\frac{1-1}{h} = 0 \\quad\\Rightarrow\\quad f′(x) = 0",
        "\\frac{(x+h)-x}{h} = 1 \\quad\\Rightarrow\\quad f′(x) = 1",
      ] },
      { t: "formel", titel: "f(x) = x²", zeilen: [
        "\\frac{(x+h)^2 - x^2}{h} = \\frac{2xh + h^2}{h} = 2x + h",
        "\\Rightarrow \\quad f′(x) = 2x",
      ] },
      { t: "formel", titel: "f(x) = x³", zeilen: [
        "\\frac{(x+h)^3 - x^3}{h} = 3x^2 + 3xh + h^2",
        "\\Rightarrow \\quad f′(x) = 3x^2",
      ] },
      { t: "formel", titel: "f(x) = 1/x", zeilen: [
        "\\frac{\\frac{1}{x+h} - \\frac{1}{x}}{h} = \\frac{x-(x+h)}{h \\cdot x(x+h)}",
        "= \\frac{-1}{x(x+h)} \\quad\\Rightarrow\\quad f′(x) = -\\frac{1}{x^2}",
      ] },
      { t: "merk", s: "Beachte das Minuszeichen. $\\frac{1}{x}$ fällt überall, wo sie definiert ist — das passt zum Bild." },
    ],
    beispiele: [
      { titel: "Steigung von f(x) = x² an der Stelle 3", schritte: [
        "\\frac{(3+h)^2 - 9}{h} = \\frac{9 + 6h + h^2 - 9}{h}",
        "= \\frac{6h + h^2}{h} = 6 + h",
      ], ergebnis: "f′(3) = 6" },
      { titel: "Steigung von f(x) = 1/x an der Stelle 2", schritte: [
        "\\frac{\\frac{1}{2+h} - \\frac{1}{2}}{h} = \\frac{2-(2+h)}{h \\cdot 2(2+h)}",
        "= \\frac{-1}{2(2+h)}",
      ], ergebnis: "f′(2) = -\\frac{1}{4}" },
    ],
    aufgaben: [
      { frage: "$f(x) = x^2$. Bestimme $f′(2)$ mit der h-Methode.", loesung: "4" },
      { frage: "$f(x) = x^2 - 4x$. Bestimme $f′(3)$.", loesung: "2" },
      { frage: "$f(x) = 3x^2$. Bestimme $f′(x)$ mit der h-Methode.", loesung: "6x", zeig: "6x" },
      { frage: "$f(x) = x^3$. Bestimme $f′(2)$.", loesung: "12" },
      { frage: "$f(x) = \\frac{1}{x}$. Bestimme $f′(3)$.", loesung: "-1/9", zeig: "-\\frac{1}{9}" },
      { frage: "$f(x) = x^2 + x$. Bestimme $f′(x)$.", loesung: "2x+1", zeig: "2x + 1" },
      { frage: "$f(x) = 5$. Bestimme $f′(x)$.", loesung: "0" },
      { frage: "$f(x) = -2x + 7$. Bestimme $f′(x)$.", loesung: "-2" },
      { frage: "Berechne die mittlere Änderungsrate von $f(x) = x^3$ auf dem Intervall $[1 \\, ; \\, 2]$.", loesung: "7" },
      { frage: "$f(x) = \\frac{1}{x^2}$. Bestimme $f′(x)$ mit der h-Methode.", loesung: "-2/x^3", zeig: "-\\frac{2}{x^3}" },
    ],
    thema: "Differenzenquotient und h-Methode, einfache Funktionen wie ax²+bx, x³, 1/x",
    ersatz: () => { const a = ohneNull(2, 5), b = ohneNull(-6, 6); return { frage: `$f(x) = ${a}x^2 ${b < 0 ? "-" : "+"} ${Math.abs(b)}x$. Bestimme $f′(x)$ mit der h-Methode.`, loesung: `${2 * a}x+${b}` }; },
  },
  {
    nr: 2,
    titel: "Punkt gegen Funktion",
    kurz: "Der Unterschied zwischen f′(x₀) und f′",
    theorie: [
      { t: "merk", s: "$f′(x_0)$ ist eine Zahl. Sie beschreibt die Steigung an genau einer Stelle.\n\n$f′$ ist eine Funktion. Sie ordnet jeder Stelle $x$ die dortige Steigung zu." },
      { t: "text", s: "Der Unterschied ist derselbe wie zwischen „die Temperatur um 14 Uhr\" und „der Temperaturverlauf des Tages\". Das eine ist ein Wert, das andere eine Zuordnung." },
      { t: "text", s: "Praktisch wichtig wird das bei Fragen wie „an welchen Stellen ist die Steigung 6\". Dafür braucht man zwingend die Ableitungsfunktion, weil eine Gleichung zu lösen ist: $f′(x) = 6$. Mit einer einzelnen Zahl käme man nicht weiter." },
      { t: "text", s: "Die Ableitung muss nicht überall existieren, wo die Funktion existiert. Bei $f(x) = |x|$ liefert der Differenzenquotient an der Stelle 0 von rechts einen anderen Wert als von links:" },
      { t: "formel", titel: "Betragsfunktion an der Stelle 0", zeilen: [
        "h > 0 : \\quad \\frac{|h| - 0}{h} = \\frac{h}{h} = 1",
        "h < 0 : \\quad \\frac{|h| - 0}{h} = \\frac{-h}{h} = -1",
      ] },
      { t: "merk", s: "Ein Grenzwert existiert nur, wenn beide Seiten denselben Wert liefern. Also ist $|x|$ bei 0 nicht differenzierbar, obwohl sie dort stetig ist. Differenzierbar $\\Rightarrow$ stetig — die Umkehrung gilt nicht." },
      { t: "formel", titel: "Tangente im Punkt (x₀ | f(x₀))", zeilen: ["t(x) = f′(x_0) \\cdot (x - x_0) + f(x_0)"] },
    ],
    beispiele: [
      { titel: "Von der Funktion zum Wert", schritte: [
        "f(x) = x^2 \\quad\\Rightarrow\\quad f′(x) = 2x",
        "f′(-3) = -6",
      ], ergebnis: "Der Graph fällt bei x = -3 steil." },
      { titel: "Tangente an f(x) = x² bei x₀ = 1", schritte: [
        "f′(1) = 2 \\quad \\text und \\quad f(1) = 1",
        "t(x) = 2(x - 1) + 1",
      ], ergebnis: "t(x) = 2x - 1" },
    ],
    aufgaben: [
      { frage: "$f(x) = x^2$. Bestimme zuerst $f′(x)$, dann $f′(-3)$. Gib $f′(-3)$ ein.", loesung: "-6" },
      { frage: "Erkläre den Unterschied zwischen $f′(2)$ und $f′$.", frei: true, antwort: "$f′(2)$ ist eine einzelne Zahl, nämlich die Steigung an der Stelle 2. $f′$ ist eine Funktion, die jeder Stelle $x$ ihre Steigung zuordnet." },
      { frage: "Stelle die Tangente an $f(x) = x^2$ an der Stelle $x_0 = 1$ auf. Gib den Term ein.", loesung: "2x-1", zeig: "2x - 1" },
      { frage: "Für $f(x) = x^3$ ist $f′(x) = 3x^2$. An welcher positiven Stelle ist die Steigung 12?", loesung: "2" },
      { frage: "Zeige, dass $f(x) = |x|$ an der Stelle 0 nicht differenzierbar ist.", frei: true, antwort: "Der rechtsseitige Differenzenquotient ist 1, der linksseitige $-1$. Da beide Seiten verschiedene Werte liefern, existiert der Grenzwert nicht." },
      { frage: "Gib für $f(x) = \\frac{1}{x}$ den Definitionsbereich von $f$ und von $f′$ an.", frei: true, antwort: "Beide Male $\\mathbb{R}$ ohne die Null. Hier stimmen die Bereiche überein, das ist aber nicht immer so." },
      { frage: "An welcher Stelle hat $f(x) = x^2$ eine waagerechte Tangente?", loesung: "0" },
      { frage: "Von einer Funktion ist bekannt: $f′(x) = 2x + 3$. Wie groß ist die Steigung bei $x = -1$?", loesung: "1" },
      { frage: "$f(x) = \\sqrt{x}$ ist auf $[0 \\, ; \\, \\infty)$ definiert. Warum existiert $f′(0)$ nicht?", frei: true, antwort: "Der Differenzenquotient $\\frac{\\sqrt{h}}{h} = \\frac{1}{\\sqrt{h}}$ wächst für $h \\to 0$ über alle Grenzen. Die Tangente stünde senkrecht." },
      { frage: "Warum ist $f′(x_0)$ eine Zahl, $f′$ aber eine Funktion?", frei: true, antwort: "$f′(x_0)$ entsteht durch Einsetzen einer festen Stelle in die Definition, $f′$ durch dieselbe Rechnung mit allgemeinem $x$ — das Ergebnis hängt dann noch von $x$ ab." },
    ],
    thema: "Unterschied Ableitung an einer Stelle und Ableitungsfunktion, Tangentengleichungen, Differenzierbarkeit",
    ersatz: () => { const n = ohneNull(-4, 4); return { frage: `Für $f(x) = x^2$ ist $f′(x) = 2x$. Wie groß ist $f′(${n})$?`, loesung: String(2 * n) }; },
  },
  {
    nr: 3,
    titel: "Die Grundbausteine",
    kurz: "f(x) = c und f(x) = x — mehr braucht es nicht als Fundament",
    theorie: [
      { t: "text", s: "Alles, was folgt, steht auf zwei Ergebnissen. Sie sind so einfach, dass man sie leicht unterschätzt — aber ohne sie gibt es keine weitere Regel." },
      { t: "formel", titel: "Konstante Funktion", zeilen: [
        "f(x) = c \\, , \\quad c \\in \\mathbb{R} \\quad\\Rightarrow\\quad f′(x) = 0",
        "\\frac{c - c}{h} = \\frac{0}{h} = 0 \\quad \\text f ü r \\, jedes \\, h \\neq 0",
      ] },
      { t: "text", s: "Der Quotient ist nicht ungefähr null, sondern exakt null — für jedes $h$. Damit ist auch sein Grenzwert null. Anschaulich: Der Graph ist eine waagerechte Gerade." },
      { t: "merk", s: "Das gilt für jede reelle Zahl, auch für $\\pi$, für $\\sqrt{2}$ und für einen festen Parameter $a$. Entscheidend ist nicht, wie kompliziert die Zahl aussieht, sondern dass sie nicht von $x$ abhängt." },
      { t: "formel", titel: "Identität", zeilen: [
        "f(x) = x \\quad\\Rightarrow\\quad f′(x) = 1",
        "\\frac{(x+h) - x}{h} = \\frac{h}{h} = 1",
      ] },
      { t: "text", s: "Der Graph ist die Winkelhalbierende. Auf einen Schritt nach rechts kommt genau ein Schritt nach oben — an jeder Stelle gleich." },
    ],
    beispiele: [
      { titel: "Eine große Konstante", schritte: ["f(x) = 2025", "\\frac{2025 - 2025}{h} = 0"], ergebnis: "f′(x) = 0 — die Zahl ist groß, aber unveränderlich." },
      { titel: "Die Identität", schritte: ["f(x) = x \\quad\\Rightarrow\\quad f′(x) = 1", "f′(17) = 1 \\, , \\quad f′(-4) = 1"], ergebnis: "Die Ableitung ist konstant, obwohl f keine Konstante ist. Kein Widerspruch: f wächst überall gleich schnell." },
    ],
    aufgaben: [
      { frage: "$f(x) = 7$. Bestimme $f′(x)$.", loesung: "0" },
      { frage: "$f(x) = x$. Bestimme $f′(100)$.", loesung: "1" },
      { frage: "$f(x) = -\\sqrt{2}$. Bestimme $f′(x)$.", loesung: "0" },
      { frage: "$g(t) = t$. Bestimme $g′(t)$.", loesung: "1" },
      { frage: "Sei $a \\in \\mathbb{R}$ fest. Bestimme $f′(x)$ für $f(x) = a$.", loesung: "0" },
      { frage: "$f(x) = \\pi^2$. Bestimme $f′(x)$.", loesung: "0" },
      { frage: "Warum ist das Ergebnis bei $f(x) = c$ exakt null und nicht nur ungefähr null?", frei: true, antwort: "Weil der Zähler $c - c$ für jedes $h$ exakt null ist. Der Quotient ist also schon vor dem Grenzübergang null, nicht erst danach." },
      { frage: "Welche sind konstant? $f(x) = 3$, $g(x) = 3x$, $h(x) = x^3$, $k(x) = c$ mit festem $c$, $m(x) = 0$", frei: true, antwort: "Konstant sind $f$, $k$ und $m$. Bei $g$ und $h$ hängt der Funktionswert von $x$ ab." },
      { frage: "Warum ist die Tangente an $f(x) = x$ in jedem Punkt die Funktion selbst?", frei: true, antwort: "Die Tangente hat die Steigung 1 und geht durch $(x_0 \\, | \\, x_0)$. Genau das beschreibt die Winkelhalbierende — Tangente und Funktion fallen zusammen." },
      { frage: "Sei $c \\in \\mathbb{R}$ fest. Bestimme die Ableitung von $f(x) = c^2$.", loesung: "0" },
    ],
    thema: "Ableitung konstanter Funktionen und der Identität",
    ersatz: () => (Math.random() < 0.5
      ? { frage: `$f(x) = ${ganz(2, 99)}$. Bestimme $f′(x)$.`, loesung: "0" }
      : { frage: `$f(x) = x$. Bestimme $f′(${ganz(-20, 20)})$.`, loesung: "1" }),
  },
  {
    nr: 4,
    titel: "Faktor-, Summen- und Produktregel",
    kurz: "Wie sich Ableitungen bei Vielfachen, Summen und Produkten verhalten",
    theorie: [
      { t: "formel", titel: "Faktorregel", zeilen: [
        "(c \\cdot f)′ = c \\cdot f′",
        "\\frac{c \\, f(x+h) - c \\, f(x)}{h} = c \\cdot \\frac{f(x+h) - f(x)}{h}",
      ] },
      { t: "text", s: "Der konstante Faktor lässt sich vor den Bruch und damit auch vor den Grenzwert ziehen. In Worten: Ein konstanter Faktor bleibt beim Ableiten unverändert stehen." },
      { t: "formel", titel: "Summenregel", zeilen: [
        "(u + v)′ = u′ + v′",
        "\\frac{u(x+h) + v(x+h) - u(x) - v(x)}{h}",
        "= \\frac{u(x+h) - u(x)}{h} + \\frac{v(x+h) - v(x)}{h}",
      ] },
      { t: "text", s: "Beide Summanden haben einen Grenzwert, und die Summe konvergenter Folgen konvergiert gegen die Summe der Grenzwerte. Mit der Faktorregel und $c = -1$ folgt sofort auch die Differenzregel." },
      { t: "merk", s: "Achtung: $(u \\cdot v)′$ ist NICHT $u′ \\cdot v′$. Ein Gegenbeispiel genügt: Für $u = v = x$ wäre $u′ \\cdot v′ = 1$, aber $(x \\cdot x)′ = (x^2)′ = 2x$." },
      { t: "formel", titel: "Produktregel", zeilen: ["(u \\cdot v)′ = u′v + uv′"] },
      { t: "text", s: "Herleitung durch geschicktes Ergänzen einer Null. Im Zähler wird $u(x) \\, v(x+h)$ einmal abgezogen und einmal addiert:" },
      { t: "formel", zeilen: [
        "\\frac{u(x+h)v(x+h) - u(x)v(x)}{h}",
        "= \\frac{u(x+h)v(x+h) - u(x)v(x+h)}{h} + \\frac{u(x)v(x+h) - u(x)v(x)}{h}",
        "= v(x+h) \\cdot \\frac{u(x+h)-u(x)}{h} + u(x) \\cdot \\frac{v(x+h)-v(x)}{h}",
      ] },
      { t: "text", s: "Im Grenzübergang wird der erste Bruch zu $u′(x)$, der zweite zu $v′(x)$, und $v(x+h)$ strebt gegen $v(x)$ — hier wird gebraucht, dass differenzierbare Funktionen stetig sind." },
      { t: "merk", s: "Die Faktorregel ist ein Sonderfall der Produktregel: Setzt man $u(x) = c$, ist $u′ = 0$ und es bleibt $c \\cdot v′$ übrig." },
    ],
    beispiele: [
      { titel: "Faktor und Summe zusammen", schritte: [
        "f(x) = 5x^2 + 3x",
        "f′(x) = 5 \\cdot 2x + 3 \\cdot 1",
      ], ergebnis: "f′(x) = 10x + 3" },
      { titel: "Produktregel als Probe", schritte: [
        "f(x) = x \\cdot x^2 \\, , \\quad u = x \\, , \\quad v = x^2",
        "f′ = 1 \\cdot x^2 + x \\cdot 2x = x^2 + 2x^2",
      ], ergebnis: "f′(x) = 3x^2 — dasselbe wie die direkte Herleitung von x³." },
    ],
    aufgaben: [
      { frage: "Leite ab: $f(x) = 5x^2$", loesung: "10x", zeig: "10x" },
      { frage: "Leite ab: $f(x) = x^2 + x^3$", loesung: "2x+3x^2", zeig: "2x + 3x^2" },
      { frage: "Leite ab: $f(x) = 3x^3 - 4x^2 + 7x - 2$", loesung: "9x^2-8x+7", zeig: "9x^2 - 8x + 7" },
      { frage: "Leite $f(x) = x \\cdot x^2$ mit der Produktregel ab.", loesung: "3x^2", zeig: "3x^2" },
      { frage: "Leite ab: $f(x) = (x+1)(x-1)$", loesung: "2x", zeig: "2x" },
      { frage: "Leite $f(x) = x^2 \\cdot \\frac{1}{x}$ mit der Produktregel ab. Vereinfache das Ergebnis.", loesung: "1" },
      { frage: "Leite ab: $f(x) = (2x+3)(x^2-1)$", loesung: "6x^2+6x-2", zeig: "6x^2 + 6x - 2" },
      { frage: "Leite ab: $f(x) = 7 \\cdot \\frac{1}{x}$", loesung: "-7/x^2", zeig: "-\\frac{7}{x^2}" },
      { frage: "Leite aus der Produktregel die Regel für drei Faktoren her: $(u \\cdot v \\cdot w)′ = ?$", frei: true, antwort: "$(uvw)′ = u′vw + uv′w + uvw′$. Man fasst $v \\cdot w$ als einen Faktor auf und wendet die Produktregel zweimal an." },
      { frage: "Leite ab: $f(x) = (x^2+1) \\cdot x^3$", loesung: "5x^4+3x^2", zeig: "5x^4 + 3x^2" },
    ],
    thema: "Faktorregel, Summenregel und Produktregel, Produkte zweier Polynome, konstante Vielfache",
    ersatz: () => { const a = ohneNull(1, 4), b = ohneNull(-5, 5), c = ohneNull(1, 4), d = ohneNull(-5, 5);
      return { frage: `Leite mit der Produktregel ab: $f(x) = (${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)})(${c}x ${d < 0 ? "-" : "+"} ${Math.abs(d)})$`, loesung: `${2 * a * c}x+${a * d + b * c}` }; },
  },
  {
    nr: 5,
    titel: "Polynome und die Potenzregel",
    kurz: "Warum die Potenzregel keine neue Wahrheit ist, sondern eine Folgerung",
    theorie: [
      { t: "formel", titel: "Polynom vom Grad n", zeilen: ["f(x) = a_nx^n + a_{n-1}x^{n-1} + \\ldots + a_1x + a_0 \\, , \\quad a_n \\neq 0"] },
      { t: "text", s: "Ein Polynom besteht aus genau drei Zutaten: Potenzen von $x$, konstante Faktoren davor und Pluszeichen dazwischen. Für alle drei gibt es inzwischen eine Regel." },
      { t: "formel", titel: "Potenzregel", zeilen: ["f(x) = x^n \\quad\\Rightarrow\\quad f′(x) = n \\cdot x^{n-1}"] },
      { t: "text", s: "Herleitung durch vollständige Induktion. Der Anfang bei $n = 1$ ist die Identität aus Kapitel 3: $(x)′ = 1$, und die Formel liefert $1 \\cdot x^0 = 1$." },
      { t: "formel", titel: "Induktionsschritt", zeilen: [
        "x^{n+1} = x \\cdot x^n \\quad \\text P r o d u k t r e g e l",
        "(x^{n+1})′ = 1 \\cdot x^n + x \\cdot n \\, x^{n-1}",
        "= x^n + n \\, x^n = (n+1) \\, x^n",
      ] },
      { t: "merk", s: "Eingeflossen sind nur zwei Dinge: die Ableitung der Identität aus Kapitel 3 und die Produktregel aus Kapitel 4. Die Potenzregel ist keine neue Wahrheit, sondern eine Folgerung." },
      { t: "text", s: "Die Formel gilt auch für negative und gebrochene Exponenten. Für $f(x) = \\frac{1}{x} = x^{-1}$ liefert sie $-1 \\cdot x^{-2} = -\\frac{1}{x^2}$, und genau das wurde in Kapitel 1 direkt ausgerechnet." },
      { t: "merk", s: "Zwei Folgerungen für die Klausur: Der Grad sinkt um genau eins — deshalb hat eine kubische Funktion höchstens zwei Extremstellen. Und das absolute Glied verschwindet — eine Verschiebung nach oben ändert keine Steigung." },
    ],
    beispiele: [
      { titel: "Ein Polynom fünften Grades", schritte: ["f(x) = 4x^5 - 3x^2 + 7x - 9"], ergebnis: "f′(x) = 20x^4 - 6x + 7" },
      { titel: "Höhere Ableitungen", schritte: [
        "f(x) = x^4 - 4x^3 + 2",
        "f′(x) = 4x^3 - 12x^2",
        "f″(x) = 12x^2 - 24x",
      ], ergebnis: "f‴(x) = 24x - 24 — mit jedem Schritt sinkt der Grad um eins." },
    ],
    aufgaben: [
      { frage: "Leite ab: $f(x) = x^5$", loesung: "5x^4", zeig: "5x^4" },
      { frage: "Leite ab: $f(x) = x^7 - 3x^4$", loesung: "7x^6-12x^3", zeig: "7x^6 - 12x^3" },
      { frage: "Leite ab: $f(x) = \\frac{1}{4}x^4 - 2x^2 + 5$", loesung: "x^3-4x", zeig: "x^3 - 4x" },
      { frage: "Leite ab: $f(x) = \\frac{1}{3}x^3 - \\frac{1}{2}x^2 + x - 8$", loesung: "x^2-x+1", zeig: "x^2 - x + 1" },
      { frage: "$f$ ist ein Polynom vom Grad 6. Welchen Grad haben $f′$ und $f‴$?", frei: true, antwort: "$f′$ hat Grad 5, $f‴$ hat Grad 3. Jede Ableitung senkt den Grad um genau eins." },
      { frage: "$f(x) = x^4 - 4x^3 + 2$. Bestimme $f‴(x)$.", loesung: "24x-24", zeig: "24x - 24" },
      { frage: "Führe den Induktionsschritt für $n = 3$ vor, also die Herleitung von $(x^4)′$ aus $(x^3)′$.", frei: true, antwort: "$(x^4)′ = (x \\cdot x^3)′ = 1 \\cdot x^3 + x \\cdot 3x^2 = x^3 + 3x^3 = 4x^3$." },
      { frage: "An welcher positiven Stelle hat $f(x) = 2x^3 - x$ die Steigung 5?", loesung: "1" },
      { frage: "An welcher positiven Stelle gilt $f′(x) = 0$ für $f(x) = x^3 - 3x^2$?", loesung: "2" },
      { frage: "Gib das Polynom mit $f′(x) = 6x - 4$ und $f(0) = 0$ an.", loesung: "3x^2-4x", zeig: "3x^2 - 4x" },
    ],
    thema: "Potenzregel und Ableitung ganzrationaler Funktionen, auch höhere Ableitungen",
    ersatz: () => { const a = ohneNull(1, 5), b = ohneNull(-6, 6), c = ohneNull(-8, 8), n = ganz(3, 6);
      return { frage: `Leite ab: $f(x) = ${a}x^{${n}} ${b < 0 ? "-" : "+"} ${Math.abs(b)}x^2 ${c < 0 ? "-" : "+"} ${Math.abs(c)}x$`, loesung: `${a * n}x^${n - 1}+${2 * b}x+${c}` }; },
  },
  {
    nr: 6,
    titel: "Spezielle Funktionen",
    kurz: "exp, ln, sin und cos — je ein zusätzlicher Grenzwert genügt",
    theorie: [
      { t: "text", s: "Polynome lassen sich allein aus Kapitel 3 und 4 ableiten. Für die folgenden vier Funktionen braucht es zusätzlich je einen Grenzwert, der sich nicht durch Umformen gewinnen lässt." },
      { t: "formel", titel: "Grundlage für die e-Funktion", zeilen: ["\\lim_{h \\to 0} \\frac{e^h - 1}{h} = 1"] },
      { t: "text", s: "In Worten: $e^x$ hat an der Stelle 0 exakt die Steigung 1. Genau dadurch ist die Zahl $e$ festgelegt." },
      { t: "formel", titel: "Ableitung von eˣ", zeilen: [
        "\\frac{e^{x+h} - e^x}{h} = \\frac{e^x e^h - e^x}{h} = e^x \\cdot \\frac{e^h - 1}{h}",
        "\\Rightarrow \\quad f′(x) = e^x",
      ] },
      { t: "merk", s: "Die Exponentialfunktion ist ihre eigene Ableitung. Und $e^x$ wird nie null: Bei Produkten entscheidet immer der Faktor davor über die Nullstellen." },
      { t: "formel", titel: "Ableitung von ln x, x > 0", zeilen: [
        "\\frac{\\ln(x+h) - \\ln x}{h} = \\frac{1}{h} \\ln \\left( 1 + \\frac{h}{x} \\right)",
        "= \\frac{1}{x} \\cdot \\ln \\left( \\left( 1 + \\frac{h}{x} \\right)^{\\frac{x}{h}} \\right)",
        "\\Rightarrow \\quad f′(x) = \\frac{1}{x}",
      ] },
      { t: "text", s: "Mit $u = \\frac{h}{x}$ ist der innere Ausdruck genau $(1+u)^{\\frac{1}{u}}$. Er strebt gegen $e$, und $\\ln e = 1$." },
      { t: "formel", titel: "Grundlagen für Sinus und Kosinus", zeilen: [
        "\\lim_{h \\to 0} \\frac{\\sin h}{h} = 1 \\quad \\text und \\quad \\lim_{h \\to 0} \\frac{\\cos h - 1}{h} = 0",
      ] },
      { t: "merk", s: "Beide Grenzwerte gelten nur im Bogenmaß. Im Gradmaß stimmen die Ableitungsregeln für Sinus und Kosinus nicht." },
      { t: "formel", titel: "Ableitung von sin x", zeilen: [
        "\\frac{\\sin(x+h) - \\sin x}{h}",
        "= \\sin x \\cdot \\frac{\\cos h - 1}{h} + \\cos x \\cdot \\frac{\\sin h}{h}",
        "\\to \\sin x \\cdot 0 + \\cos x \\cdot 1 = \\cos x",
      ] },
      { t: "text", s: "Analog ergibt sich $(\\cos x)′ = -\\sin x$." },
      { t: "merk", s: "Der Viererzyklus: $\\sin x \\to \\cos x \\to -\\sin x \\to -\\cos x \\to \\sin x$. Bei Fragen nach der hundertsten Ableitung teilt man durch 4 und schaut auf den Rest." },
    ],
    beispiele: [
      { titel: "Produktregel mit e-Funktion", schritte: [
        "f(x) = x \\cdot e^x \\, , \\quad u = x \\, , \\quad v = e^x",
        "f′ = 1 \\cdot e^x + x \\cdot e^x",
      ], ergebnis: "f′(x) = e^x(1 + x) — ausgeklammert sieht man die Nullstelle bei x = -1." },
      { titel: "Produktregel mit Logarithmus", schritte: [
        "f(x) = x \\cdot \\ln x \\, , \\quad v′ = \\frac{1}{x}",
        "f′ = 1 \\cdot \\ln x + x \\cdot \\frac{1}{x}",
      ], ergebnis: "f′(x) = \\ln x + 1 — null bei x = \\frac{1}{e}." },
    ],
    aufgaben: [
      { frage: "Leite ab: $f(x) = e^x$. Gib $f′(x)$ ein.", loesung: "e^x", zeig: "e^x" },
      { frage: "Leite ab: $f(x) = 3e^x - 2$", loesung: "3e^x", zeig: "3e^x" },
      { frage: "Leite ab: $f(x) = x \\cdot e^x$", loesung: "e^x*(1+x)", zeig: "e^x(1+x)" },
      { frage: "Leite ab: $f(x) = \\ln x$", loesung: "1/x", zeig: "\\frac{1}{x}" },
      { frage: "Leite ab: $f(x) = x \\cdot \\ln x$", loesung: "ln(x)+1", zeig: "\\ln x + 1" },
      { frage: "Leite ab: $f(x) = \\sin x + \\cos x$", loesung: "cos(x)-sin(x)", zeig: "\\cos x - \\sin x" },
      { frage: "Leite ab: $f(x) = x^2 \\cdot \\sin x$", loesung: "2x*sin(x)+x^2*cos(x)", zeig: "2x \\sin x + x^2 \\cos x" },
      { frage: "Leite ab: $f(x) = \\sin x \\cdot \\cos x$", loesung: "cos(x)^2-sin(x)^2", zeig: "\\cos^2 x - \\sin^2 x" },
      { frage: "Leite ab: $f(x) = e^x \\cdot \\sin x$", loesung: "e^x*(sin(x)+cos(x))", zeig: "e^x(\\sin x + \\cos x)" },
      { frage: "Bestimme die vierte Ableitung von $f(x) = \\sin x$.", loesung: "sin(x)", zeig: "\\sin x" },
    ],
    thema: "Ableitungen von e-Funktion, Logarithmus, Sinus und Kosinus, auch in Produkten mit Potenzen",
    ersatz: () => { const a = ohneNull(2, 6), w = zuf(["e^x", "sin(x)", "cos(x)"]);
      const abl = { "e^x": `${a}e^x`, "sin(x)": `${a}cos(x)`, "cos(x)": `-${a}sin(x)` }[w];
      const zeig = { "e^x": "e^x", "sin(x)": "\\sin x", "cos(x)": "\\cos x" }[w];
      return { frage: `Leite ab: $f(x) = ${a} \\cdot ${zeig} + ${ganz(2, 9)}$`, loesung: abl }; },
  },
];

/* ---------- Die übrigen Bausteine aus Arbeitsheft Analysis 01 ---------- */


