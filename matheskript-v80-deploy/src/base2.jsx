import React, { useState, useRef } from "react";
import { ABL_KAPITEL, ganz, ohneNull, zuf } from "./base1.jsx";
import { FR } from "./funcRegistry.jsx";

export const B01 = {
  nr: 1,
  titel: "Lineare Funktionen",
  kurz: "Steigung als Änderungsrate — der Ursprung der ganzen Analysis",
  theorie: [
    { t: "text", s: "Die Gerade ist der Ursprung der gesamten Analysis. Alles, was später kommt — Ableitung, Tangente, Monotonie — ist der Versuch, krumme Funktionen lokal wie Geraden zu behandeln." },
    { t: "formel", titel: "Grundform", zeilen: ["f(x) = m \\cdot x + b"] },
    { t: "text", s: "$m$ ist die Steigung: Um wie viel ändert sich $y$, wenn $x$ um 1 wächst? $b$ ist der Funktionswert an der Stelle $x = 0$." },
    { t: "formel", titel: "Steigung aus zwei Punkten", zeilen: ["m = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}"] },
    { t: "merk", s: "Das ist bereits der Differenzenquotient. Genau diese Formel wird später zum Ableitungsbegriff weiterentwickelt — die Analysis beginnt hier, nicht erst beim Limes." },
    { t: "formel", titel: "Die vier Standardfragen", zeilen: [
      "Nullstelle: \\quad mx + b = 0 \\quad\\Rightarrow\\quad x_0 = -\\frac{b}{m}",
      "Schnittpunkt: \\quad f(x) = g(x) \\text , dann einsetzen",
      "parallel: \\quad m_1 = m_2",
      "orthogonal: \\quad m_1 \\cdot m_2 = -1",
    ] },
    { t: "merk", s: "Typischer Fehler: Punkt und Steigung eingesetzt, aber $b$ nicht mehr berechnet. Ein Punkt allein legt keine Gerade fest — immer beide Informationen verarbeiten." },
  ],
  beispiele: [
    { titel: "Gerade durch zwei Punkte", schritte: [
      "P(-2 \\, | \\, 5) \\, , \\quad Q(4 \\, | \\, -7)",
      "m = \\frac{-7 - 5}{4 - (-2)} = \\frac{-12}{6} = -2",
      "5 = -2 \\cdot (-2) + b = 4 + b",
    ], ergebnis: "y = -2x + 1" },
    { titel: "Senkrechte durch einen Punkt", schritte: [
      "g: y = \\frac{3}{4}x - 3 \\, , \\quad R(8 \\, | \\, 1)",
      "m_2 = -\\frac{1}{m_1} = -\\frac{4}{3}",
      "1 = -\\frac{4}{3} \\cdot 8 + b",
    ], ergebnis: "y = -\\frac{4}{3}x + \\frac{35}{3}" },
  ],
  aufgaben: [
    { frage: "Bestimme die Gleichung der Geraden durch $P(-2 \\, | \\, 5)$ und $Q(4 \\, | \\, -7)$.", loesung: "-2x+1", zeig: "-2x + 1" },
    { frage: "Gegeben ist $g: y = \\frac{3}{4}x - 3$. Berechne die Nullstelle.", loesung: "4" },
    { frage: "Berechne den Schnittpunkt von $g: y = \\frac{3}{4}x - 3$ mit $h: y = -2x + 8$. Gib den x-Wert an.", loesung: "4" },
    { frage: "Stelle die Parallele zu $g: y = \\frac{3}{4}x - 3$ durch $R(8 \\, | \\, 1)$ auf.", loesung: "0.75x-5", zeig: "\\frac{3}{4}x - 5" },
    { frage: "Stelle die Senkrechte zu $g$ durch $R(8 \\, | \\, 1)$ auf.", loesung: "-4/3*x+35/3", zeig: "-\\frac{4}{3}x + \\frac{35}{3}" },
    { frage: "Eine Gerade hat die Steigung $m = -\\frac{2}{5}$ und geht durch $S(-5 \\, | \\, 4)$. Bestimme $b$.", loesung: "2" },
    { frage: "Dieselbe Gerade: Bestimme ihre Nullstelle.", loesung: "5" },
    { frage: "Ein Taxi kostet 3,50 € Grundpreis und 2,20 € je Kilometer. Stelle die Kostenfunktion $K(x)$ auf.", loesung: "2.2x+3.5", zeig: "2{,}2x + 3{,}5" },
    { frage: "Zwei Geraden schneiden sich nie und sind nicht identisch. Was folgt daraus für $m$ und $b$?", frei: true, antwort: "$m_1 = m_2$ und $b_1 \\neq b_2$. Bei verschiedenen Steigungen fällt beim Gleichsetzen der x-Term nicht weg, es gäbe also immer genau eine Lösung." },
    { frage: "Berechne die mittlere Steigung von $f(x) = x^2$ zwischen $x_1 = 1$ und $x_2 = 3$.", loesung: "4" },
  ],
  thema: "lineare Funktionen, Geraden durch zwei Punkte, Parallelität und Orthogonalität",
  ersatz: () => { const m = ohneNull(-4, 4), b = ganz(-6, 6), x = ohneNull(1, 4);
    return { frage: `Eine Gerade hat die Steigung $m = ${m}$ und geht durch $P(${x} \\, | \\, ${m * x + b})$. Bestimme $b$.`, loesung: String(b) }; },
};


export const B02 = {
  nr: 2,
  titel: "Von der Sekante zur Tangente",
  kurz: "Mittlere und lokale Änderungsrate sauber trennen",
  theorie: [
    { t: "text", s: "Die zentrale Idee der Analysis in einem Satz: Man ersetzt die Steigung zwischen zwei Punkten durch die Steigung in einem Punkt, indem man den zweiten Punkt unendlich nah heranrücken lässt." },
    { t: "formel", titel: "Mittlere Änderungsrate auf [a ; b]", zeilen: ["m_{Sek} = \\frac{f(b) - f(a)}{b - a}"] },
    { t: "formel", titel: "Lokale Änderungsrate an der Stelle x₀", zeilen: ["f′(x_0) = \\lim_{h \\to 0} \\frac{f(x_0+h) - f(x_0)}{h}"] },
    { t: "merk", s: "Drei Deutungen von $f′(x_0)$: geometrisch die Tangentensteigung, physikalisch die Momentangeschwindigkeit, sachbezogen das Wachstum pro Einheit." },
    { t: "text", s: "Die h-Methode läuft immer gleich: $f(x_0+h)$ ausmultiplizieren, die konstanten Terme heben sich weg, $h$ ausklammern und kürzen — und erst danach $h \\to 0$ setzen." },
  ],
  beispiele: [
    { titel: "Die Raten rücken zusammen", schritte: [
      "f(x) = x^2 \\text auf [1 ; 3] : \\quad \\frac{9-1}{2} = 4",
      "auf [1 ; 2] : \\quad \\frac{4-1}{1} = 3",
      "auf [1 ; 1{,}1] : \\quad \\frac{1{,}21-1}{0{,}1} = 2{,}1",
    ], ergebnis: "Die Werte streben gegen f′(1) = 2." },
    { titel: "Weg-Zeit-Gesetz", schritte: [
      "s(t) = 0{,}5t^2 \\, , \\quad s′(t) = t",
      "Durchschnitt auf [2 ; 5] : \\quad \\frac{12{,}5 - 2}{3} = 3{,}5",
    ], ergebnis: "Momentangeschwindigkeit bei t = 5: s′(5) = 5 m/s" },
  ],
  aufgaben: [
    { frage: "Berechne die mittlere Änderungsrate von $f(x) = x^2$ auf $[1 \\, ; \\, 3]$.", loesung: "4" },
    { frage: "Dieselbe Funktion auf $[1 \\, ; \\, 1{,}1]$.", loesung: "2.1" },
    { frage: "Bestimme $f′(1)$ für $f(x) = x^2$ mit der h-Methode.", loesung: "2" },
    { frage: "Bestimme $f′(3)$ für $f(x) = x^2 - 4x$ mit der h-Methode.", loesung: "2" },
    { frage: "Zeige mit der h-Methode: Für $f(x) = x^3$ gilt $f′(x) = 3x^2$. Gib $f′(x)$ ein.", loesung: "3x^2", zeig: "3x^2" },
    { frage: "Ein Körper legt $s(t) = 0{,}5t^2$ zurück. Wie groß ist die Durchschnittsgeschwindigkeit auf $[2 \\, ; \\, 5]$?", loesung: "3.5" },
    { frage: "Wie groß ist die Momentangeschwindigkeit bei $t = 5$?", loesung: "5" },
    { frage: "An welcher Stelle hat $f(x) = x^2$ die Steigung 6?", loesung: "3" },
    { frage: "Erkläre in drei Sätzen, warum man $h$ nicht von Anfang an gleich 0 setzen darf.", frei: true, antwort: "Vor dem Kürzen steht im Nenner $h$, also entstünde $\\frac{0}{0}$ — ein undefinierter Ausdruck. Erst das Ausklammern und Kürzen macht den Term an der Stelle $h = 0$ auswertbar. Der Grenzwert beschreibt, wogegen der Quotient strebt, nicht welchen Wert er bei $h = 0$ hat." },
    { frage: "Skizziere eine Funktion, die bei $x = 0$ stetig, dort aber nicht differenzierbar ist.", frei: true, antwort: "Zum Beispiel $f(x) = |x|$. Der Graph hat dort einen Knick: von links ergibt der Differenzenquotient $-1$, von rechts $+1$. Eine eindeutige Tangente gibt es nicht." },
  ],
  thema: "Differenzenquotient, h-Methode, mittlere und lokale Änderungsrate",
  ersatz: () => { const a = ohneNull(1, 4), x = ganz(1, 4);
    return { frage: `$f(x) = ${a}x^2$. Bestimme $f′(${x})$ mit der h-Methode.`, loesung: String(2 * a * x) }; },
};


export const B04 = {
  nr: 4,
  titel: "Nullstellen, Symmetrie, Grenzverhalten",
  kurz: "Das Gerüst des Graphen, bevor die Ableitung ins Spiel kommt",
  theorie: [
    { t: "text", s: "Bevor du Extrem- und Wendepunkte suchst, musst du wissen, wo die Funktion überhaupt lebt. Definitionsbereich, Nullstellen, Symmetrie und Randverhalten legen die grobe Gestalt bereits fest." },
    { t: "formel", titel: "Vier Techniken für Nullstellen", zeilen: [
      "A \\quad Ausklammern: \\quad x^3 - 4x = x(x^2 - 4)",
      "B \\quad pq- oder abc-Formel",
      "C \\quad Substitution \\, z = x^2 \\, bei biquadratischen Termen",
      "D \\quad Polynomdivision ab Grad 3",
    ] },
    { t: "merk", s: "Bei der Polynomdivision rät man die erste Nullstelle unter den Teilern des absoluten Glieds. Und: niemals durch $x$ teilen statt auszuklammern — sonst verliert man die Nullstelle bei null." },
    { t: "text", s: "<b>Vielfachheit lesen.</b> Einfach: der Graph schneidet die Achse. Doppelt: er berührt sie, dort liegt ein Extrempunkt. Dreifach: er schneidet mit waagerechter Tangente." },
    { t: "formel", titel: "Symmetrie in zehn Sekunden", zeilen: [
      "f(-x) = f(x) \\quad\\Rightarrow\\quad achsensymmetrisch \\, , nur gerade Exponenten",
      "f(-x) = -f(x) \\quad\\Rightarrow\\quad punktsymmetrisch \\, , nur ungerade Exponenten",
    ] },
    { t: "merk", s: "Das absolute Glied zählt als $x^0$, also als gerader Exponent. Ein Polynom mit ungeraden Exponenten und absolutem Glied ist deshalb nicht punktsymmetrisch." },
    { t: "text", s: "<b>Verhalten für $x \\to \\pm\\infty$.</b> Nur der Summand höchsten Grades entscheidet. Gerader Grad mit positivem Leitkoeffizient: beide Äste nach oben. Ungerader Grad: gegenläufige Äste." },
  ],
  beispiele: [
    { titel: "Ausklammern", schritte: [
      "f(x) = x^3 - 4x = x(x^2 - 4)",
      "x = 0 \\quad oder \\quad x^2 = 4",
    ], ergebnis: "x = 0 \\, , \\quad x = 2 \\, , \\quad x = -2" },
    { titel: "Substitution", schritte: [
      "x^4 - 13x^2 + 36 = 0 \\, , \\quad z = x^2",
      "z^2 - 13z + 36 = 0 \\quad\\Rightarrow\\quad z = 4 \\, ; \\, 9",
    ], ergebnis: "x = ±2 und x = ±3" },
  ],
  aufgaben: [
    { frage: "Bestimme die positive Nullstelle von $f(x) = x^3 - 4x$.", loesung: "2" },
    { frage: "Bestimme die von null verschiedene Nullstelle von $f(x) = 2x^4 - 8x^3$.", loesung: "4" },
    { frage: "Löse $x^4 - 13x^2 + 36 = 0$. Gib die größte Lösung an.", loesung: "3" },
    { frage: "$f(x) = x^3 - 2x^2 - 5x + 6$ hat die Nullstelle $x_1 = 1$. Gib die größte der übrigen an.", loesung: "3" },
    { frage: "Bestimme die positive Nullstelle von $f(x) = x^3 + 2x^2 - 3x$.", loesung: "1" },
    { frage: "Untersuche $f(x) = x^4 - 3x^2 + 1$ auf Symmetrie und begründe mit $f(-x)$.", frei: true, antwort: "Nur gerade Exponenten, also $f(-x) = f(x)$ — achsensymmetrisch zur y-Achse." },
    { frage: "Beschreibe das Verhalten von $f(x) = -2x^3 + 5x^2$ für $x \\to \\pm\\infty$.", frei: true, antwort: "Nur $-2x^3$ entscheidet. Ungerader Grad mit negativem Leitkoeffizient: von links oben nach rechts unten." },
    { frage: "Bestimme die Nullstelle von $f(x) = \\frac{x+2}{x^2-9}$.", loesung: "-2" },
    { frage: "Gib den Definitionsbereich derselben Funktion an.", frei: true, antwort: "$\\mathbb{R}$ ohne $3$ und $-3$. Dort wird der Nenner null, es liegen Polstellen vor — Nullstellen des Nenners sind nie Nullstellen der Funktion." },
    { frage: "$f(x) = (x-2)^2(x+1)$. Wie sieht der Graph in der Nähe von $x = 2$ aus?", frei: true, antwort: "Die doppelte Nullstelle bedeutet Berührung statt Schnitt — dort liegt ein Extrempunkt. Das liest man ohne jede Ableitung an der Vielfachheit ab." },
  ],
  thema: "Nullstellen durch Ausklammern, Substitution und Polynomdivision, Symmetrie, Grenzverhalten",
  ersatz: () => { const k = ohneNull(1, 5);
    return { frage: `Bestimme die positive Nullstelle von $f(x) = x^3 - ${k * k}x$.`, loesung: String(k) }; },
};


export const B05 = {
  nr: 5,
  titel: "Monotonie & Extrempunkte",
  kurz: "Notwendig ist nicht hinreichend — und Ränder zählen mit",
  theorie: [
    { t: "formel", titel: "Monotonie", zeilen: [
      "f′(x) > 0 \\quad\\Rightarrow\\quad streng monoton steigend",
      "f′(x) < 0 \\quad\\Rightarrow\\quad streng monoton fallend",
    ] },
    { t: "formel", titel: "Extrempunkte", zeilen: [
      "notwendig: \\quad f′(x_0) = 0",
      "hinreichend: \\quad f″(x_0) \\neq 0",
      "f″(x_0) < 0 \\Rightarrow Hochpunkt \\, , \\quad f″(x_0) > 0 \\Rightarrow Tiefpunkt",
    ] },
    { t: "merk", s: "Die notwendige Bedingung liefert nur Kandidaten. $f(x) = x^3$ hat bei 0 eine waagerechte Tangente und trotzdem keinen Extrempunkt — deshalb die zweite Prüfung." },
    { t: "text", s: "<b>Sonderfall $f″(x_0) = 0$.</b> Das ist keine Absage, sondern keine Aussage. Jetzt greift zwingend das Vorzeichenwechsel-Kriterium von $f′$: von plus nach minus ergibt einen Hochpunkt, von minus nach plus einen Tiefpunkt, kein Wechsel einen Sattelpunkt." },
    { t: "merk", s: "Auf einem abgeschlossenen Intervall $[a \\, ; \\, b]$ musst du zusätzlich $f(a)$ und $f(b)$ mit den lokalen Extremwerten vergleichen. Randextrema werden im Abitur am häufigsten vergessen." },
  ],
  beispiele: [
    { titel: "Extrempunkte bestimmen", schritte: [
      "f(x) = x^3 - 3x \\, , \\quad f′ = 3x^2 - 3 = 0 \\Rightarrow x = ±1",
      "f″ = 6x \\, , \\quad f″(-1) = -6 < 0",
      "f″(1) = 6 > 0",
    ], ergebnis: "H(-1 | 2) und T(1 | -2)" },
    { titel: "Randextremum", schritte: [
      "f(x) = x^3 - 3x \\text auf [0 ; 4]",
      "Hochpunkt bei x = -1 liegt außerhalb",
      "f(0) = 0 \\, , \\quad f(1) = -2 \\, , \\quad f(4) = 52",
    ], ergebnis: "Globales Maximum 52 am Rand bei x = 4" },
  ],
  aufgaben: [
    { frage: "$f(x) = x^3 - 3x$. An welcher Stelle liegt der Hochpunkt?", loesung: "-1" },
    { frage: "Wie lautet dessen y-Wert?", loesung: "2" },
    { frage: "$f(x) = \\frac{1}{4}x^4 - 2x^2$. Gib die positive Tiefpunktstelle an.", loesung: "2" },
    { frage: "Wie lautet dort der Funktionswert?", loesung: "-4" },
    { frage: "$f(x) = \\frac{1}{3}x^3 - x^2 - 3x$. An welcher Stelle liegt der Tiefpunkt?", loesung: "3" },
    { frage: "Wie lautet dort der Funktionswert?", loesung: "-9" },
    { frage: "Bestimme das globale Maximum von $f(x) = x^3 - 3x$ auf $[0 \\, ; \\, 4]$.", loesung: "52" },
    { frage: "An welcher positiven Stelle gilt $f′(x) = 0$ für $f(x) = x^3 - 3x^2$?", loesung: "2" },
    { frage: "Zeige, dass $f(x) = x^4$ bei $x = 0$ einen Tiefpunkt hat, obwohl $f″(0) = 0$ ist.", frei: true, antwort: "$f″(0) = 0$ liefert keine Aussage, kein Ausschluss. $f′ = 4x^3$ ist links von 0 negativ und rechts positiv — der Vorzeichenwechsel von minus nach plus bedeutet Tiefpunkt." },
    { frage: "Warum reicht $f′(x_0) = 0$ allein nicht aus?", frei: true, antwort: "Weil auch Sattelpunkte diese Bedingung erfüllen. Die Bedingung ist notwendig, aber nicht hinreichend — es braucht $f″$ oder den Vorzeichenwechsel." },
  ],
  thema: "Monotonie, notwendige und hinreichende Bedingung, Extrempunkte, Randextrema",
  ersatz: () => { const k = ohneNull(1, 4);
    return { frage: `$f(x) = x^3 - ${3 * k * k}x$. An welcher positiven Stelle liegt der Tiefpunkt?`, loesung: String(k) }; },
};


export const B06 = {
  nr: 6,
  titel: "Krümmung & Wendepunkte",
  kurz: "Was f″ über die Drehung des Graphen verrät",
  theorie: [
    { t: "merk", s: "$f′$ beschreibt, wohin der Graph läuft. $f″$ beschreibt, wie er sich dabei dreht. Extrempunkte von $f$ sind Nullstellen von $f′$ — Wendepunkte von $f$ sind Extrempunkte von $f′$." },
    { t: "formel", titel: "Krümmung", zeilen: [
      "f″(x) > 0 \\quad\\Rightarrow\\quad linksgekrümmt \\, (konvex)",
      "f″(x) < 0 \\quad\\Rightarrow\\quad rechtsgekrümmt \\, (konkav)",
    ] },
    { t: "formel", titel: "Wendepunkt in vier Schritten", zeilen: [
      "1. \\quad f″(x) = 0 \\quad lösen",
      "2. \\quad f‴(x_0) \\neq 0 \\quad prüfen",
      "3. \\quad y-Wert über f(x_0) berechnen",
      "4. \\quad Wendetangente: \\, y = f′(x_0)(x - x_0) + f(x_0)",
    ] },
    { t: "merk", s: "Der y-Wert kommt immer aus $f$, nie aus $f″$. Das ist einer der häufigsten Flüchtigkeitsfehler." },
    { t: "text", s: "Ein <b>Sattelpunkt</b> ist ein Wendepunkt mit $f′(x_0) = 0$, also mit waagerechter Wendetangente. Bei $f(x) = x^3$ im Ursprung verschwinden erste und zweite Ableitung, die dritte nicht." },
  ],
  beispiele: [
    { titel: "Wendepunkt bestimmen", schritte: [
      "f(x) = x^3 - 3x^2 \\, , \\quad f″ = 6x - 6 = 0 \\Rightarrow x = 1",
      "f‴ = 6 \\neq 0 \\quad bestätigt",
      "f(1) = 1 - 3 = -2",
    ], ergebnis: "W(1 | -2), links davon rechtsgekrümmt" },
    { titel: "Wendetangente", schritte: [
      "f(x) = x^3 - 3x^2 - 9x + 27 \\, , \\quad W(1 | 16)",
      "f′(1) = 3 - 6 - 9 = -12",
      "y = -12(x - 1) + 16",
    ], ergebnis: "y = -12x + 28" },
  ],
  aufgaben: [
    { frage: "$f(x) = x^3 - 3x^2$. An welcher Stelle liegt der Wendepunkt?", loesung: "1" },
    { frage: "Wie lautet dort der y-Wert?", loesung: "-2" },
    { frage: "$f(x) = x^3 - 3x$. An welcher Stelle liegt der Wendepunkt?", loesung: "0" },
    { frage: "$f(x) = \\frac{1}{4}x^4 - 2x^2$. Gib die positive Wendestelle an.", loesung: "2/sqrt(3)", zeig: "\\frac{2}{\\sqrt{3}}" },
    { frage: "$f(x) = x^3 - 3x^2 - 9x + 27$ hat den Wendepunkt $W(1 \\, | \\, 16)$. Stelle die Wendetangente auf.", loesung: "-12x+28", zeig: "-12x + 28" },
    { frage: "$f(x) = x^3 - 6x^2 + 5$. An welcher Stelle liegt der Wendepunkt?", loesung: "2" },
    { frage: "Zeige, dass $f(x) = x^3$ im Ursprung einen Sattelpunkt besitzt.", frei: true, antwort: "$f′ = 3x^2$, $f″ = 6x$, $f‴ = 6$. Bei $x = 0$ verschwinden erste und zweite Ableitung, die dritte nicht — Wendepunkt mit waagerechter Tangente." },
    { frage: "Der Graph von $f′$ ist eine nach oben geöffnete Parabel mit Nullstellen bei $-2$ und $4$. Was folgt für $f$?", frei: true, antwort: "Hochpunkt bei $-2$, Tiefpunkt bei $4$. Der Scheitel der Parabel bei $x = 1$ ist das Minimum von $f′$ und damit die Wendestelle von $f$." },
    { frage: "Warum muss man nach $f″(x_0) = 0$ noch $f‴$ prüfen?", frei: true, antwort: "Weil $f″(x_0) = 0$ nur notwendig ist. Erst $f‴(x_0) \\neq 0$ sichert den Vorzeichenwechsel der Krümmung — sonst könnte die Krümmung gleich bleiben." },
    { frage: "Wie ist $f(x) = x^3 - 3x^2$ rechts von $x = 1$ gekrümmt?", frei: true, antwort: "Linksgekrümmt. Für $x > 1$ ist $f″ = 6x - 6 > 0$." },
  ],
  thema: "Krümmung, Wendepunkte, Wendetangenten, Sattelpunkte",
  ersatz: () => { const k = ohneNull(1, 5);
    return { frage: `$f(x) = x^3 - ${3 * k}x^2 + 4$. An welcher Stelle liegt der Wendepunkt?`, loesung: String(k) }; },
};


export const B07 = {
  nr: 7,
  titel: "Die vollständige Kurvendiskussion",
  kurz: "Alle Teilschritte in fester Reihenfolge verbinden",
  theorie: [
    { t: "text", s: "Hier wird nichts Neues gelernt. Es geht ausschließlich darum, alle Teilschritte in fester Reihenfolge zu verbinden und sauber zu notieren." },
    { t: "formel", titel: "Das 9-Schritte-Protokoll", zeilen: [
      "1. \\, Definitionsbereich \\quad 2. \\, Symmetrie \\quad 3. \\, Achsenschnittpunkte",
      "4. \\, Grenzverhalten \\quad 5. \\, Ableitungen \\, f′ , f″ , f‴",
      "6. \\, Extrempunkte \\quad 7. \\, Monotonieintervalle",
      "8. \\, Wendepunkte und Krümmung \\quad 9. \\, Graph",
    ] },
    { t: "merk", s: "Warum steht das Grenzverhalten vor den Ableitungen? Weil Grad, Leitkoeffizient, Nullstellen und Symmetrie zusammen schon eine Rohskizze ergeben. Wer danach einen Hochpunkt berechnet, der nicht dazu passt, erkennt den Rechenfehler sofort." },
    { t: "text", s: "<b>Pen-&-Paper-Check vor der Abgabe.</b> Jeder Schritt überschrieben, ein Gedanke pro Zeile, Gleichheitszeichen nur zwischen Gleichem, Nebenrechnung abgetrennt, jedes Ergebnis als Punkt $(x \\, | \\, y)$ notiert, Antwortsatz — und morgen noch rekonstruierbar." },
    { t: "merk", s: "Der Graph entsteht aus den berechneten Punkten, nicht umgekehrt. Wer zuerst zeichnet und dann rechnet, bestätigt nur seine Erwartung." },
  ],
  beispiele: [
    { titel: "Musterablauf, Teil 1", schritte: [
      "f(x) = x^3 - 3x^2 - 9x + 27",
      "Raten: f(3) = 0 \\quad\\Rightarrow\\quad f(x) = (x-3)^2(x+3)",
      "S_y(0 \\, | \\, 27)",
    ], ergebnis: "Nullstellen: x = 3 (doppelt) und x = -3" },
    { titel: "Musterablauf, Teil 2", schritte: [
      "f′ = 3x^2 - 6x - 9 = 3(x-3)(x+1)",
      "f″(-1) = -12 < 0 \\, , \\quad f″(3) = 12 > 0",
      "f″ = 6x - 6 = 0 \\Rightarrow x = 1",
    ], ergebnis: "H(-1 | 32), T(3 | 0), W(1 | 16)" },
  ],
  aufgaben: [
    { frage: "$f(x) = x^3 - 3x^2 + 4$. Bestimme $f′(x)$.", loesung: "3x^2-6x", zeig: "3x^2 - 6x" },
    { frage: "Dieselbe Funktion: Gib die positive Extremstelle an.", loesung: "2" },
    { frage: "Wie lautet dort der Funktionswert?", loesung: "0" },
    { frage: "An welcher Stelle liegt der Wendepunkt von $f(x) = x^3 - 3x^2 + 4$?", loesung: "1" },
    { frage: "Wie lautet der y-Achsenabschnitt derselben Funktion?", loesung: "4" },
    { frage: "Gib die negative Nullstelle von $f(x) = x^3 - 3x^2 + 4$ an.", loesung: "-1" },
    { frage: "Im Musterablauf gilt $H(-1 \\, | \\, 32)$. Wie lautet der y-Wert des Tiefpunkts von $f(x) = x^3 - 3x^2 - 9x + 27$?", loesung: "0" },
    { frage: "$f(x) = \\frac{1}{4}x^4 - 2x^2 + 4$. Bestimme $f′(x)$.", loesung: "x^3-4x", zeig: "x^3 - 4x" },
    { frage: "Warum steht die Symmetrieprüfung so weit vorn im Protokoll?", frei: true, antwort: "Weil sie Arbeit spart: Bei Achsensymmetrie genügt es, eine Seite zu untersuchen, die andere folgt durch Spiegelung. Nachträglich bringt die Erkenntnis nichts mehr." },
    { frage: "Im Pen-&-Paper-Check steht: jedes Ergebnis als Punkt notieren. Warum ist das mehr als Formsache?", frei: true, antwort: "Ein Extrempunkt ist ein Punkt, keine Zahl. Wer nur die x-Stelle nennt, hat die Aufgabe halb gelöst — und merkt nicht, wenn der y-Wert nicht zur Skizze passt." },
  ],
  thema: "vollständige Kurvendiskussion ganzrationaler Funktionen dritten und vierten Grades",
  ersatz: () => { const k = ohneNull(1, 4);
    return { frage: `$f(x) = x^3 - ${3 * k}x^2$. Bestimme $f′(x)$.`, loesung: `3x^2-${6 * k}x` }; },
};


export const B08 = {
  nr: 8,
  titel: "Anwendung & Transfer",
  kurz: "Tangente, Extremwert, Steckbrief, Scharen — die Abiturtypen",
  theorie: [
    { t: "formel", titel: "Tangente und Normale", zeilen: [
      "t(x) = f′(x_0)(x - x_0) + f(x_0)",
      "m_n = -\\frac{1}{f′(x_0)} \\quad bei gleichem Punkt",
    ] },
    { t: "formel", titel: "Extremwertaufgaben in fünf Schritten", zeilen: [
      "1. \\, Zielgröße benennen \\quad 2. \\, Hauptbedingung",
      "3. \\, Nebenbedingung auflösen \\quad 4. \\, einsetzen",
      "5. \\, Extremum bestimmen, Ränder vergleichen, Antwortsatz",
    ] },
    { t: "merk", s: "Der eigentliche Schritt ist Nummer 3. Erst die Nebenbedingung macht aus einer Funktion mit zwei Variablen eine mit einer — alles davor ist Aufschreiben, alles danach Routine." },
    { t: "formel", titel: "Steckbriefaufgaben übersetzen", zeilen: [
      "P(a \\, | \\, b) \\, liegt \\, auf \\, G_f \\quad\\Rightarrow\\quad f(a) = b",
      "Extrempunkt \\, bei \\, x = a \\quad\\Rightarrow\\quad f′(a) = 0",
      "Wendepunkt \\, bei \\, x = a \\quad\\Rightarrow\\quad f″(a) = 0",
      "Steigung \\, m \\, bei \\, x = a \\quad\\Rightarrow\\quad f′(a) = m",
    ] },
    { t: "merk", s: "Faustregel: Grad $n$ bedeutet $n+1$ Unbekannte und damit ebenso viele Gleichungen. Wer weniger Informationen hat, kann die Funktion nicht eindeutig bestimmen." },
    { t: "text", s: "Bei <b>Funktionenscharen</b> wird der Parameter $t$ beim Ableiten nach $x$ wie eine Konstante behandelt. Eliminiert man $t$ aus $x(t)$ und $y(t)$, erhält man die Ortskurve — sie darf kein $t$ mehr enthalten." },
  ],
  beispiele: [
    { titel: "Tangente und Normale", schritte: [
      "f(x) = x^2 - 2x + 3 \\, , \\quad x_0 = 2",
      "f′(2) = 2 \\, , \\quad f(2) = 3",
      "t: y = 2(x-2) + 3",
    ], ergebnis: "t: y = 2x - 1 und n: y = -0{,}5x + 4" },
    { titel: "Extremwertaufgabe", schritte: [
      "Schachtel aus 30 × 30 cm: \\quad V(x) = x(30-2x)^2",
      "V′ = (30-2x)(30-6x) = 0",
      "x = 5 \\quad oder \\quad x = 15 \\, (Randfall)",
    ], ergebnis: "x = 5 cm, V = 2000 cm³" },
  ],
  aufgaben: [
    { frage: "Bestimme die Tangente an $f(x) = x^2 - 2x + 3$ an der Stelle $x_0 = 2$.", loesung: "2x-1", zeig: "2x - 1" },
    { frage: "Bestimme die zugehörige Normale.", loesung: "-0.5x+4", zeig: "-\\frac{1}{2}x + 4" },
    { frage: "An welcher positiven Stelle hat $f(x) = x^3 - 3x^2$ eine Tangente mit der Steigung 9?", loesung: "3" },
    { frage: "Aus einem Karton 30 × 30 cm wird eine offene Schachtel gefaltet. Für welches $x$ wird das Volumen maximal?", loesung: "5" },
    { frage: "Wie groß ist dieses maximale Volumen in cm³?", loesung: "2000" },
    { frage: "Einem Parabelbogen $y = 9 - x^2$ wird ein achsensymmetrisches Rechteck einbeschrieben. Für welches $x$ wird die Fläche maximal?", loesung: "sqrt(3)", zeig: "\\sqrt{3}" },
    { frage: "Eine Funktion dritten Grades ist punktsymmetrisch zum Ursprung und hat bei $H(-1 \\, | \\, 2)$ einen Hochpunkt. Bestimme $f(x)$.", loesung: "x^3-3x", zeig: "x^3 - 3x" },
    { frage: "Grad 3, Wendepunkt $W(0 \\, | \\, 2)$, Wendetangente mit Steigung $-3$, Tiefpunkt bei $x = 1$. Bestimme $f(x)$.", loesung: "x^3-3x+2", zeig: "x^3 - 3x + 2" },
    { frage: "Für die Schar $f_t(x) = x^3 - 3t^2x$ mit $t > 0$: Wie lautet die Ortskurve aller Hochpunkte?", loesung: "-2x^3", zeig: "-2x^3" },
    { frage: "$f(x) = x \\cdot e^{-x}$. An welcher Stelle liegt der Hochpunkt?", loesung: "1" },
  ],
  thema: "Tangente und Normale, Extremwertaufgaben, Steckbriefaufgaben, Funktionenscharen",
  ersatz: () => { const x0 = ohneNull(1, 4), a = ohneNull(1, 3);
    return { frage: `Bestimme die Tangente an $f(x) = ${a}x^2$ an der Stelle $x_0 = ${x0}$.`, loesung: `${2 * a * x0}x-${a * x0 * x0}` }; },
};


export const MODUL_KATALOG = [
  { id: "ableitung", nr: 3, titel: "Ableitungsregeln", unter: "Baustein 03 · Das Handwerk",
    kurz: "Von der Definition zur Potenzregel, jede Regel hergeleitet", pdf: true, kapitel: ABL_KAPITEL },
  { id: "b01", nr: 1, titel: "Lineare Funktionen", unter: "Baustein 01 · Die Gerade",
    kurz: "Steigung als Änderungsrate — der Ursprung der Analysis", kapitel: [B01] },
  { id: "b02", nr: 2, titel: "Von der Sekante zur Tangente", unter: "Baustein 02 · Der Ableitungsbegriff",
    kurz: "Mittlere und lokale Änderungsrate sauber trennen", kapitel: [B02] },
  { id: "b04", nr: 4, titel: "Nullstellen & Grenzverhalten", unter: "Baustein 04 · Das Gerüst",
    kurz: "Vier Techniken für Nullstellen, Symmetrie, Randverhalten", kapitel: [B04] },
  { id: "b05", nr: 5, titel: "Monotonie & Extrempunkte", unter: "Baustein 05 · Was f′ verrät",
    kurz: "Notwendig ist nicht hinreichend — und Ränder zählen mit", kapitel: [B05] },
  { id: "b06", nr: 6, titel: "Krümmung & Wendepunkte", unter: "Baustein 06 · Was f″ verrät",
    kurz: "Wendepunkte, Wendetangenten, Sattelpunkte", kapitel: [B06] },
  { id: "b07", nr: 7, titel: "Kurvendiskussion", unter: "Baustein 07 · Das Protokoll",
    kurz: "Alle Teilschritte in fester Reihenfolge verbinden", kapitel: [B07] },
  { id: "b08", nr: 8, titel: "Anwendung & Transfer", unter: "Baustein 08 · Abiturtypen",
    kurz: "Tangente, Extremwert, Steckbrief, Scharen", kapitel: [B08] },
].sort((a, b) => a.nr - b.nr);

/* ---------- Komponenten ---------- */


export const istLeer = (s) => !s || !s.trim();

/* Liest eine Zahl, auch wenn sie als Term dasteht — etwa (-8)/4. */

export const gleichZahl = (a, b) => a !== null && Math.abs(a - b) < 1e-6;


export const WEG_TYPEN = [
  {
    id: "scheitel",
    titel: "Scheitelpunkt einer Parabel",
    kurz: "Ableiten, null setzen, einsetzen, Punkt notieren",
    erzeugen: (...a) => FR.parabelErzeugen(...a),
    aufgabe: (a) => `Bestimme den Scheitelpunkt der Parabel. Schreib den vollständigen Rechenweg auf, nicht nur das Ergebnis.`,
    bausteine: [["f′", "f′(x)="], ["f″", "f″(x)="], ["x=", "x="], ["y=", "y="], ["H", "H"], ["T", "T"]],
    schritte: [
      { id: "abl", name: "Ableitung f′(x) gebildet",
        frage: "Welche Bedingung erfüllt die Tangente in einem Scheitelpunkt — und welches Werkzeug misst Tangentensteigungen?",
        tipp: "Der Scheitelpunkt hat eine waagerechte Tangente. Waagerecht heißt Steigung null, und Steigungen liefert die erste Ableitung. Bilde sie also zuerst.",
        muster: (a) => `f′(x) = ${a.abl.replace("+-", "-")}` },
      { id: "null", name: "f′(x) = 0 gesetzt",
        frage: "Du hast f′. Welchen Wert muss die Steigung im Scheitelpunkt haben?",
        tipp: "Setze deine Ableitung gleich null. Das ist die notwendige Bedingung für einen Extrempunkt.",
        muster: (a) => `${a.abl.replace("+-", "-")} = 0` },
      { id: "xs", name: "Extremstelle x berechnet",
        frage: "Die Gleichung steht. Was kommt heraus, wenn du nach x auflöst?",
        tipp: "Es ist eine lineare Gleichung — den Summanden auf die andere Seite bringen und durch den Vorfaktor teilen.",
        muster: (a) => `x = ${a.xs}` },
      { id: "ys", name: "Funktionswert eingesetzt",
        frage: "Du hast die Stelle. In welche Funktion setzt du sie ein, um die zweite Koordinate zu bekommen?",
        tipp: "In f, nicht in f′. Die Ableitung liefert Steigungen, nicht Funktionswerte.",
        muster: (a) => `f(${a.xs}) = ${a.ys}` },
      { id: "art", name: "Art begründet", weich: true,
        frage: "Ist das ein Hoch- oder ein Tiefpunkt? Woran siehst du das?",
        tipp: "Das Vorzeichen von a entscheidet über die Öffnung: positiv heißt nach oben, also Tiefpunkt. Oder du prüfst mit f″.",
        muster: (a) => `f″(x) = ${2 * a.a}` },
      { id: "punkt", name: "Ergebnis als Punkt notiert",
        frage: "Beide Koordinaten sind bekannt. Wie schreibt man ein Ergebnis in der Geometrie auf?",
        tipp: "Als Punkt mit beiden Koordinaten, nicht als einzelne Zahl. Die Art gehört in den Namen.",
        muster: (a) => `${a.hoch ? "H" : "T"}(${a.xs}|${a.ys})` },
    ],
    regeln: (a) => [
      { id: "abl", art: "term", kopf: /^f['′]\(x\)$/, soll: a.abl, auchNull: "null",
        fehler: "Die Ableitung stimmt nicht. Aus ax² wird 2ax, aus bx wird b, die Konstante fällt weg." },
      { id: "null", art: "nullgleichung", soll: a.abl },
      { id: "xs", art: "zahl", kopf: /^x(_?s)?$/, soll: a.xs,
        fehler: "Die Extremstelle stimmt nicht. Setze f′(x) = 0 und löse nach x auf." },
      { id: "ys", art: "zahl", kopf: /^(y(_?s)?|f\(-?[\d.,]+\))$/, soll: a.ys,
        fehler: "Der Funktionswert stimmt nicht. Setze die Extremstelle in f ein, nicht in f′." },
      { id: "art", art: "zahl", kopf: /^f(['′]{2}|'')\(x\)$/, soll: 2 * a.a,
        fehler: "Die zweite Ableitung stimmt nicht. Sie ist bei einer Parabel konstant." },
      { id: "punkt", art: "punkt", soll: [a.xs, a.ys], marke: a.hoch ? "H" : "T", gegenMarke: a.hoch ? "T" : "H",
        markeFehler: `Die Art stimmt nicht — bei diesem Vorzeichen von a liegt ein ${a.art} vor.` },
      { id: "scheitelform", art: "form", soll: a.f, muster: /\(.*\)\s*\^\s*2/, erfuelltAuch: ["abl", "null", "xs", "ys"],
        lob: "Du hast die Scheitelpunktform benutzt — auch ein vollständiger Weg. Beide Koordinaten lassen sich daraus ablesen." },
      { art: "falle", soll: a.f, wennNull: true,
        fehler: "Hier wird f(x) = 0 gesetzt. Das liefert die Nullstellen, nicht den Scheitelpunkt." },
    ],
  },
  {
    id: "nullstellen",
    titel: "Nullstellen einer Parabel",
    kurz: "Ansatz f(x) = 0, lösen, beide Stellen angeben",
    erzeugen: (...a) => FR.quadratMitNullstellen(...a),
    aufgabe: () => `Bestimme alle Nullstellen. Schreib den Rechenweg auf, nicht nur die Ergebnisse.`,
    bausteine: [["f(x)=", "f(x)="], ["x=", "x="], ["x₁=", "x_1="], ["x₂=", "x_2="], ["±", "±"], ["√▯", "sqrt(▯)"]],
    schritte: [
      { id: "ansatz", name: "f(x) = 0 angesetzt",
        frage: "Was bedeutet Nullstelle — welchen Wert hat die Funktion dort?",
        tipp: "Eine Nullstelle ist eine Stelle mit Funktionswert null. Setze also den Term gleich null.",
        muster: (a) => `${a.f.replace(/\+-/g, "-")} = 0` },
      { id: "x1", name: "erste Nullstelle berechnet",
        frage: "Wie löst du eine quadratische Gleichung — welches Werkzeug passt hier?",
        tipp: "Erst durch den Vorfaktor teilen, dann pq-Formel. Oder in Faktoren zerlegen, wenn du die Zerlegung siehst.",
        muster: (a) => `x_1 = ${a.r1}` },
      { id: "x2", name: "zweite Nullstelle berechnet",
        frage: "Eine quadratische Gleichung hat höchstens wie viele Lösungen?",
        tipp: "Zwei. Vergiss die zweite Lösung nicht — das ± der pq-Formel liefert beide.",
        muster: (a) => `x_2 = ${a.r2}` },
    ],
    regeln: (a) => [
      { id: "ansatz", art: "nullgleichung", soll: a.f },
      { id: "ansatz", art: "term", kopf: /^f\(x\)$/, soll: a.f, auchNull: "ansatz" },
      { id: "x", art: "zahlmenge", kopf: /^x_?[12]?$/, soll: [a.r1, a.r2], teile: ["x1", "x2"],
        fehler: "Diese Zahl ist keine Nullstelle. Setz sie zur Probe in f ein — es müsste null herauskommen." },
      { id: "faktor", art: "form", soll: a.f, muster: /\)\s*\(/, lob: "Sauber in Faktoren zerlegt — daran liest man die Nullstellen direkt ab." },
    ],
  },
  {
    id: "tangente",
    titel: "Tangente an eine Parabel",
    kurz: "Steigung, Berührpunkt, Geradengleichung",
    erzeugen: (...a) => FR.tangenteErzeugen(...a),
    aufgabe: (a) => `Bestimme die Tangente an den Graphen von f an der Stelle x₀ = ${a.x0}.`,
    bausteine: [["f′", "f′(x)="], ["m=", "m="], ["t(x)=", "t(x)="], ["x=", "x="], ["y=", "y="], ["f(▯)", "f(▯)"]],
    schritte: [
      { id: "abl", name: "Ableitung f′(x) gebildet",
        frage: "Eine Gerade braucht Steigung und einen Punkt. Woher bekommst du die Steigung einer Kurve an einer Stelle?",
        tipp: "Die Tangentensteigung an der Stelle x₀ ist f′(x₀). Bilde also zuerst die Ableitung.",
        muster: (a) => `f′(x) = ${a.abl.replace("+-", "-")}` },
      { id: "m", name: "Steigung f′(x₀) berechnet",
        frage: "Du hast f′. Was musst du einsetzen, um die Steigung genau an dieser Stelle zu bekommen?",
        tipp: `Setze x₀ in f′ ein.`,
        muster: (a) => `m = ${a.m}` },
      { id: "y0", name: "Berührpunkt berechnet",
        frage: "Die Steigung allein legt keine Gerade fest. Was fehlt noch?",
        tipp: "Ein Punkt. Setze x₀ in f ein — nicht in f′ — das gibt die y-Koordinate des Berührpunkts.",
        muster: (a) => `f(${a.x0}) = ${a.y0}` },
      { id: "gerade", name: "Tangentengleichung aufgestellt",
        frage: "Steigung und Punkt sind bekannt. Welche Form einer Geradengleichung nutzt genau das?",
        tipp: "Die Punkt-Steigungs-Form: t(x) = m·(x − x₀) + f(x₀). Ausmultipliziert ergibt das die Normalform.",
        muster: (a) => `t(x) = ${a.m}x ${a.n < 0 ? "-" : "+"} ${Math.abs(a.n)}` },
    ],
    regeln: (a) => [
      { id: "abl", art: "term", kopf: /^f['′]\(x\)$/, soll: a.abl,
        fehler: "Die Ableitung stimmt nicht. Aus ax² wird 2ax, aus bx wird b, die Konstante fällt weg." },
      { id: "m", art: "zahl", kopf: new RegExp(`^(m|f['′]\\(${a.x0}\\))$`), soll: a.m,
        fehler: "Die Steigung stimmt nicht. Setze x₀ in f′ ein, nicht in f." },
      { id: "y0", art: "zahl", kopf: new RegExp(`^(y_?0|f\\(${a.x0}\\))$`), soll: a.y0,
        fehler: "Der Funktionswert stimmt nicht. Setze x₀ in f ein, nicht in f′." },
      { id: "gerade", art: "term", kopf: /^(t\(x\)|y)$/, soll: a.tangente,
        fehler: "Die Tangentengleichung stimmt noch nicht. Prüfe, ob deine Gerade wirklich durch den Berührpunkt geht." },
    ],
  },
  {
    id: "extrem",
    titel: "Extrempunkte einer kubischen Funktion",
    kurz: "Beide Stellen, Art prüfen, zwei Punkte angeben",
    erzeugen: (...a) => FR.kubischErzeugen(...a),
    aufgabe: () => `Bestimme alle Extrempunkte mit Art und Begründung.`,
    bausteine: [["f′", "f′(x)="], ["f″", "f″(x)="], ["x=", "x="], ["x₁=", "x_1="], ["H", "H"], ["T", "T"]],
    schritte: [
      { id: "abl", name: "Ableitung f′(x) gebildet",
        frage: "Woran erkennt man eine Extremstelle am Verhalten der Steigung?",
        tipp: "Die Steigung ist dort null. Bilde zuerst f′.",
        muster: (a) => `f′(x) = ${a.fs}` },
      { id: "null", name: "f′(x) = 0 gesetzt",
        frage: "Welche Gleichung musst du lösen, um die Kandidaten zu finden?",
        tipp: "f′(x) = 0. Das ist die notwendige Bedingung — sie liefert nur Kandidaten, noch keine Entscheidung.",
        muster: (a) => `${a.fs} = 0` },
      { id: "x", name: "beide Extremstellen berechnet",
        frage: "Eine quadratische Gleichung — wie viele Lösungen erwartest du hier?",
        tipp: "Zwei. Klammere aus oder nutze die pq-Formel, und gib beide Stellen an.",
        muster: (a) => `x_1 = ${a.klein}` },
      { id: "art", name: "Art über f″ geprüft", weich: true,
        frage: "Warum reicht f′(x) = 0 nicht aus?",
        tipp: "Weil auch Sattelpunkte diese Bedingung erfüllen. Prüfe mit f″: negativ bedeutet Hochpunkt, positiv Tiefpunkt.",
        muster: (a) => `f″(x) = ${a.fss}` },
      { id: "punkt", name: "Ergebnis als Punkte notiert",
        frage: "Was fehlt einem Ergebnis, das nur aus x-Werten besteht?",
        tipp: "Die y-Werte. Setze jede Stelle in f ein und schreib beide Ergebnisse als Punkte.",
        muster: (a) => `H(${a.hoch}|${a.f(a.hoch)})` },
    ],
    regeln: (a) => [
      { id: "abl", art: "term", kopf: /^f['′]\(x\)$/, soll: a.fs, auchNull: "null",
        fehler: "Die Ableitung stimmt nicht. Der Grad muss um eins sinken." },
      { id: "null", art: "nullgleichung", soll: a.fs },
      { id: "x", art: "zahlmenge", kopf: /^x_?[12]?$/, soll: [a.klein, a.gross], teile: ["x1", "x2"],
        fehler: "Diese Stelle ist keine Nullstelle von f′." },
      { id: "art", art: "term", kopf: /^f(['′]{2}|'')\(x\)$/, soll: a.fss,
        fehler: "Die zweite Ableitung stimmt nicht." },
      { id: "punkt", art: "punktmenge", soll: [[a.hoch, a.f(a.hoch)], [a.tief, a.f(a.tief)]],
        marken: ["H", "T"], teile: ["punktH", "punktT"] },
    ],
  },
];

/* --- Der typunabhängige Prüfer --- */


export const FORMELN = [
  { gruppe: "Grundlagen", name: "Differenzenquotient", f: "\\frac{f(x_0+h) - f(x_0)}{h}",
    kurz: "Steigung der Sekante durch zwei Punkte · mittlere Änderungsrate", kap: 1 },
  { gruppe: "Grundlagen", name: "Ableitung an einer Stelle", f: "f′(x_0) = \\lim_{h \\to 0} \\frac{f(x_0+h) - f(x_0)}{h}",
    kurz: "Steigung der Tangente · lokale Änderungsrate", kap: 1 },
  { gruppe: "Grundlagen", name: "Tangente", f: "t(x) = f′(x_0)(x - x_0) + f(x_0)",
    kurz: "Gerade, die den Graphen in einem Punkt berührt", kap: 2 },
  { gruppe: "Grundlagen", name: "Normale", f: "m_n = -\\frac{1}{f′(x_0)}",
    kurz: "steht senkrecht auf der Tangente · gleicher Punkt", kap: 2 },

  { gruppe: "Grundableitungen", name: "Konstante", f: "f(x) = c \\quad\\Rightarrow\\quad f′(x) = 0",
    kurz: "gilt für jede feste Zahl, auch π und Parameter", kap: 3 },
  { gruppe: "Grundableitungen", name: "Identität", f: "f(x) = x \\quad\\Rightarrow\\quad f′(x) = 1",
    kurz: "die Winkelhalbierende · überall Steigung 1", kap: 3 },
  { gruppe: "Grundableitungen", name: "Potenzregel", f: "f(x) = x^n \\quad\\Rightarrow\\quad f′(x) = n \\, x^{n-1}",
    kurz: "gilt für alle reellen Exponenten, nicht nur natürliche", kap: 5 },
  { gruppe: "Grundableitungen", name: "Kehrwert", f: "f(x) = \\frac{1}{x} \\quad\\Rightarrow\\quad f′(x) = -\\frac{1}{x^2}",
    kurz: "Spezialfall der Potenzregel mit n = -1", kap: 1 },
  { gruppe: "Grundableitungen", name: "Wurzel", f: "f(x) = \\sqrt{x} \\quad\\Rightarrow\\quad f′(x) = \\frac{1}{2\\sqrt{x}}",
    kurz: "erst umschreiben zu x^{1/2}, dann Potenzregel", kap: 5 },

  { gruppe: "Ableitungsregeln", name: "Faktorregel", f: "(c \\cdot f)′ = c \\cdot f′",
    kurz: "konstanter Faktor bleibt unverändert stehen", kap: 4 },
  { gruppe: "Ableitungsregeln", name: "Summenregel", f: "(u + v)′ = u′ + v′",
    kurz: "gliedweise ableiten", kap: 4 },
  { gruppe: "Ableitungsregeln", name: "Differenzregel", f: "(u - v)′ = u′ - v′",
    kurz: "folgt aus Summen- und Faktorregel mit c = -1", kap: 4 },
  { gruppe: "Ableitungsregeln", name: "Produktregel", f: "(u \\cdot v)′ = u′v + uv′",
    kurz: "nicht u′·v′ — der häufigste Fehler überhaupt", kap: 4 },
  { gruppe: "Ableitungsregeln", name: "Quotientenregel", f: "\\left( \\frac{u}{v} \\right)′ = \\frac{u′v - uv′}{v^2}",
    kurz: "Reihenfolge im Zähler beachten · oft durch Umschreiben vermeidbar" },
  { gruppe: "Ableitungsregeln", name: "Kettenregel", f: "f(x) = u(v(x)) \\quad\\Rightarrow\\quad f′ = u′(v(x)) \\cdot v′(x)",
    kurz: "äußere mal innere Ableitung · innere nie vergessen" },

  { gruppe: "Spezielle Funktionen", name: "e-Funktion", f: "f(x) = e^x \\quad\\Rightarrow\\quad f′(x) = e^x",
    kurz: "ihre eigene Ableitung · wird nie null", kap: 6 },
  { gruppe: "Spezielle Funktionen", name: "Natürlicher Logarithmus", f: "f(x) = \\ln x \\quad\\Rightarrow\\quad f′(x) = \\frac{1}{x}",
    kurz: "nur für x > 0 definiert", kap: 6 },
  { gruppe: "Spezielle Funktionen", name: "Sinus", f: "f(x) = \\sin x \\quad\\Rightarrow\\quad f′(x) = \\cos x",
    kurz: "nur im Bogenmaß gültig", kap: 6 },
  { gruppe: "Spezielle Funktionen", name: "Kosinus", f: "f(x) = \\cos x \\quad\\Rightarrow\\quad f′(x) = -\\sin x",
    kurz: "Viererzyklus: sin → cos → −sin → −cos → sin", kap: 6 },
  { gruppe: "Spezielle Funktionen", name: "Allgemeine Exponentialfunktion", f: "f(x) = a^x \\quad\\Rightarrow\\quad f′(x) = a^x \\ln a",
    kurz: "für a = e wird ln a = 1 — daher die Sonderrolle von e" },

  { gruppe: "Vorher umschreiben", name: "Bruch als Potenz", f: "\\frac{1}{x^n} = x^{-n}",
    kurz: "spart fast immer die Quotientenregel", kap: 5 },
  { gruppe: "Vorher umschreiben", name: "Wurzel als Potenz", f: "\\sqrt{x} = x^{\\frac{1}{2}} \\, , \\quad \\frac{1}{\\sqrt{x}} = x^{-\\frac{1}{2}}",
    kurz: "danach greift die Potenzregel direkt", kap: 5 },

  { gruppe: "Anwendung", name: "Monotonie", f: "f′(x) > 0 \\Rightarrow \\text s t e i g e n d \\, , \\quad f′(x) < 0 \\Rightarrow \\text f a l l e n d",
    kurz: "auf Intervallen argumentieren, nicht punktweise" },
  { gruppe: "Anwendung", name: "Extrempunkt", f: "f′(x_0) = 0 \\, , \\quad f″(x_0) \\neq 0",
    kurz: "f″ < 0 Hochpunkt · f″ > 0 Tiefpunkt · notwendig ≠ hinreichend" },
  { gruppe: "Anwendung", name: "Wendepunkt", f: "f″(x_0) = 0 \\, , \\quad f‴(x_0) \\neq 0",
    kurz: "y-Wert immer über f berechnen, nie über f″" },
  { gruppe: "Anwendung", name: "Krümmung", f: "f″(x) > 0 \\Rightarrow \\text l i n k s \\, , \\quad f″(x) < 0 \\Rightarrow \\text r e c h t s",
    kurz: "linksgekrümmt heißt konvex, rechtsgekrümmt konkav" },
  { gruppe: "Anwendung", name: "Sattelpunkt", f: "f′(x_0) = 0 \\quad \\text u n d \\quad f″(x_0) = 0",
    kurz: "Wendepunkt mit waagerechter Tangente · Vorzeichenwechsel prüfen" },
];


export const GZ_FAMILIEN = [
  {
    id: "gerade", name: "Gerade", grad: 1,
    mach: () => {
      const m = ohneNull(-3, 3), b = ganz(-4, 4);
      return {
        f: (x) => m * x + b, fs: () => m, fss: () => 0, m,
        wozu: "Eine Gerade hat überall dieselbe Steigung. Ihre Ableitung ist deshalb eine waagerechte Gerade auf der Höhe dieser Steigung — hier auf " + m + ".",
        grad: 1,
      };
    },
  },
  {
    id: "parabel", name: "Parabel", grad: 2,
    mach: () => {
      const a = zuf([1, -1, 0.5, -0.5, 2, -2]), b = ganz(-3, 3), c = ganz(-4, 4);
      return {
        f: (x) => a * x * x + b * x + c, fs: (x) => 2 * a * x + b, fss: () => 2 * a,
        wozu: "Eine Parabel hat als Ableitung eine Gerade. Deren Nullstelle liegt genau unter dem Scheitelpunkt — links davon fällt f, rechts steigt sie (oder umgekehrt).",
        grad: 2,
      };
    },
  },
  {
    id: "kubisch", name: "kubische Funktion", grad: 3,
    mach: () => {
      const k = FR.kubischErzeugen();
      return {
        f: k.f, fs: (x) => 3 * k.a * x * x + 2 * k.b * x + k.c, fss: (x) => 6 * k.a * x + 2 * k.b,
        wozu: "Eine kubische Funktion hat als Ableitung eine Parabel. Deren Nullstellen liegen genau bei den beiden Extremstellen von f.",
        grad: 3,
      };
    },
  },
  {
    id: "quartisch", name: "Funktion vierten Grades", grad: 4,
    mach: () => {
      const a = zuf([0.25, -0.25, 0.5, -0.5]), b = ohneNull(-3, 3), c = ganz(-3, 3);
      return {
        f: (x) => a * x ** 4 + b * x * x + c,
        fs: (x) => 4 * a * x ** 3 + 2 * b * x,
        fss: (x) => 12 * a * x * x + 2 * b,
        wozu: "Grad 4 wird beim Ableiten zu Grad 3. Weil nur gerade Exponenten vorkommen, ist f achsensymmetrisch — die Ableitung ist dann punktsymmetrisch.",
        grad: 4,
      };
    },
  },
  {
    id: "hyperbel", name: "Hyperbel", grad: 0,
    mach: () => {
      const a = zuf([1, -1, 2, -2, 3, -3]);
      return {
        f: (x) => a / x, fs: (x) => -a / (x * x), fss: (x) => (2 * a) / (x * x * x),
        wozu: `Aus ${a}/x wird ${-a}/x². Die Ableitung hat auf beiden Ästen dasselbe Vorzeichen, denn x² ist immer positiv — die Hyperbel ${a > 0 ? "fällt" : "steigt"} überall, wo sie definiert ist.`,
        grad: 0, luecke: true,
      };
    },
  },
  {
    id: "sinus", name: "Sinuskurve", grad: 0,
    mach: () => {
      const a = zuf([1, 2, -1, -2]);
      return {
        f: (x) => a * Math.sin(x), fs: (x) => a * Math.cos(x), fss: (x) => -a * Math.sin(x),
        wozu: "Aus Sinus wird Kosinus — dieselbe Wellenform, nur um eine Viertelperiode nach links verschoben. Wo f einen Hochpunkt hat, schneidet f′ die Achse.",
        grad: 0,
      };
    },
  },
];


export const PLATZ = "▯";

/* --- Anzeigeparser: versteht zusätzlich den Platzhalter --- */


export const ohneKlammer = (n) => (n && n.op === "klammer" ? ohneKlammer(n.l) : n);


export const TASTEN_ZAHL = ["7", "8", "9", "(", "4", "5", "6", ")", "1", "2", "3", "+", "0", ".", "x", "-", "^", "*", "/", PLATZ];


export const TASTEN_FUNK = [
  { z: "x²", e: "x^2" }, { z: "x³", e: "x^3" }, { z: "xⁿ", e: `x^(${PLATZ})` },
  { z: "√▯", e: `sqrt(${PLATZ})` }, { z: "√x", e: "sqrt(x)" },
  { z: "1/▯", e: `1/(${PLATZ})` }, { z: "▯/▯", e: `(${PLATZ})/(${PLATZ})` },
  { z: "sin", e: `sin(${PLATZ})` }, { z: "cos", e: `cos(${PLATZ})` }, { z: "tan", e: `tan(${PLATZ})` },
  { z: "ln", e: `ln(${PLATZ})` }, { z: "eˣ", e: "e^x" }, { z: "e▯", e: `e^(${PLATZ})` },
  { z: "sin x", e: "sin(x)" }, { z: "cos x", e: "cos(x)" }, { z: "ln x", e: "ln(x)" },
];


export const TASTEN_PARAM = ["a", "b", "c", "d", "h", "k", "t", "n", "pi"];


export const vz = (k) => (k < 0 ? `- ${Math.abs(k)}` : `+ ${k}`);

export const vzm = (k) => (k < 0 ? `${k}` : `+${k}`);

/* Ein Schritt des Lösungswegs: ein Satz, dazu eine Formelzeile. */

export const W = (t, f) => ({ t, f });


export const ABL_TYPEN = [
  {
    id: "polynom", name: "Polynome", regel: "Potenz-, Faktor- und Summenregel",
    erklaerung: "Gliedweise ableiten. Der Exponent wandert als Faktor nach vorn und sinkt um eins, das absolute Glied fällt weg.",
    mach: (st) => {
      const a = ohneNull(2, 5), b = ohneNull(-6, 6), c = ohneNull(-9, 9);
      const potenzH = "Potenzregel: der Exponent wandert als Faktor nach vorn und sinkt um eins.";
      if (st <= 1) { const n = ganz(2, 4); const erg = `${a * n}x^{${n - 1}}`; return {
        tex: `${a}x^{${n}}`, f: `${a}x^${n}`, loesung: `${a * n}x^${n - 1}`, zeig: erg,
        weg: FR.wegSumme([{ tex: `${a}x^{${n}}`, abl: `${a} \\cdot ${n} \\cdot x^{${n - 1}} = ${erg}`, h: potenzH }], erg),
        fallen: [{ t: `${a * n}x^${n}`, h: "Der Exponent muss um eins sinken, nicht stehen bleiben." },
                 { t: `${a}x^${n - 1}`, h: "Der alte Exponent wandert als Faktor nach vorn — er fehlt bei dir." }] }; }
      if (st === 2) { const n = ganz(3, 5), m = ganz(1, 2);
        const erg = `${a * n}x^{${n - 1}} ${vz(b * m)}${m > 1 ? `x^{${m - 1}}` : ""}`; return {
        tex: `${a}x^{${n}} ${vz(b)}x${m > 1 ? `^{${m}}` : ""}`, f: `${a}x^${n}+${b}x^${m}`,
        loesung: `${a * n}x^${n - 1}${vzm(b * m)}${m > 1 ? `x^${m - 1}` : ""}`, zeig: erg,
        weg: FR.wegSumme([
          { tex: `${a}x^{${n}}`, abl: `${a * n}x^{${n - 1}}`, h: potenzH },
          { tex: `${b}x${m > 1 ? `^{${m}}` : ""}`, abl: `${b * m}${m > 1 ? `x^{${m - 1}}` : ""}`,
            h: m > 1 ? potenzH : "Bei x hoch eins bleibt nur der Vorfaktor übrig." },
        ], erg) }; }
      if (st === 3) { const n = ganz(3, 5), m = ganz(1, 2);
        const erg = `${a * n}x^{${n - 1}} ${vz(b * m)}${m > 1 ? `x^{${m - 1}}` : ""}`; return {
        tex: `${a}x^{${n}} ${vz(b)}x${m > 1 ? `^{${m}}` : ""} ${vz(c)}`, f: `${a}x^${n}+${b}x^${m}+${c}`,
        loesung: `${a * n}x^${n - 1}${vzm(b * m)}${m > 1 ? `x^${m - 1}` : ""}`, zeig: erg,
        weg: FR.wegSumme([
          { tex: `${a}x^{${n}}`, abl: `${a * n}x^{${n - 1}}`, h: potenzH },
          { tex: `${b}x${m > 1 ? `^{${m}}` : ""}`, abl: `${b * m}${m > 1 ? `x^{${m - 1}}` : ""}`, h: potenzH },
          { tex: `${c}`, abl: `0`, h: "Eine Konstante ändert sich nicht — ihre Ableitung ist null." },
        ], erg),
        fallen: [{ t: `${a * n}x^${n - 1}${vzm(b * m)}${m > 1 ? `x^${m - 1}` : ""}${vzm(c)}`,
                   h: "Die Ableitung einer Konstanten ist null — das absolute Glied fällt weg." }] }; }
      if (st === 4) { const n = ganz(3, 5); const erg = `${a * n}x^{${n - 1}} ${vz(-b)} \\cdot \\frac{1}{x^2}`; return {
        tex: `${a}x^{${n}} ${vz(b)} \\cdot \\frac{1}{x}`, f: `${a}x^${n}+${b}/x`,
        loesung: `${a * n}x^${n - 1}-${b}/x^2`, zeig: erg,
        weg: FR.wegSumme([
          { tex: `${a}x^{${n}}`, abl: `${a * n}x^{${n - 1}}`, h: potenzH },
          { tex: `${b} \\cdot \\frac{1}{x}`, abl: `${b} \\cdot (-1) \\cdot x^{-2} = ${-b} \\cdot \\frac{1}{x^2}`,
            h: "Schreib den Bruch erst als Potenz: 1 durch x ist x hoch minus eins. Dabei entsteht das Minuszeichen." },
        ], erg),
        fallen: [{ t: `${a * n}x^${n - 1}+${b}/x^2`, h: "Beim Kehrwert entsteht ein Minuszeichen: aus x⁻¹ wird −x⁻²." }] }; }
      const n = ganz(3, 5); const erg = `${a * n}x^{${n - 1}} ${vz(b)} \\cdot \\frac{1}{2\\sqrt{x}}`; return {
        tex: `${a}x^{${n}} ${vz(b)}\\sqrt{x}`, f: `${a}x^${n}+${b}*sqrt(x)`,
        loesung: `${a * n}x^${n - 1}${vzm(b)}/(2*sqrt(x))`, zeig: erg,
        weg: FR.wegSumme([
          { tex: `${a}x^{${n}}`, abl: `${a * n}x^{${n - 1}}`, h: potenzH },
          { tex: `${b}\\sqrt{x}`, abl: `${b} \\cdot \\frac{1}{2}x^{-\\frac{1}{2}} = ${b} \\cdot \\frac{1}{2\\sqrt{x}}`,
            h: "Schreib die Wurzel erst als Potenz: √x ist x hoch ein halb. Dann greift die Potenzregel." },
        ], erg),
        fallen: [{ t: `${a * n}x^${n - 1}+${b}*sqrt(x)`, h: "Die Wurzel muss erst als x^{1/2} geschrieben und dann abgeleitet werden." }] };
    },
  },
  {
    id: "produkt", name: "Produkte", regel: "Produktregel",
    erklaerung: "u′v + uv′. Nicht gliedweise ableiten — das ist der häufigste Fehler überhaupt.",
    mach: (st) => {
      const a = ohneNull(1, 4), b = ohneNull(-5, 5), c = ohneNull(1, 4), d = ohneNull(-6, 6), e2 = ohneNull(-5, 5);
      if (st <= 1) { const erg = `${3 * a}x^2 ${vz(a * b)}`; return {
        tex: `${a}x \\cdot (x^2 ${vz(b)})`, f: `${a}x*(x^2+${b})`,
        loesung: `${3 * a}x^2${vzm(a * b)}`, zeig: erg,
        weg: FR.wegProdukt(`${a}x`, `${a}`, `x^2 ${vz(b)}`, `2x`,
          `f′ = ${a}(x^2 ${vz(b)}) + ${a}x \\cdot 2x`, erg),
        fallen: [{ t: `${a}*2x`, h: "Produkte werden nicht gliedweise abgeleitet. Hier steht u′ · v′ statt u′v + uv′." }] }; }
      if (st === 2) { const erg = `${3 * a * c}x^2 ${vz(2 * b * c)}x ${vz(a * d)}`; return {
        tex: `(${a}x ${vz(b)})(${c}x^2 ${vz(d)})`, f: `(${a}x+${b})*(${c}x^2+${d})`,
        loesung: `${3 * a * c}x^2${vzm(2 * b * c)}x${vzm(a * d)}`, zeig: erg,
        weg: FR.wegProdukt(`${a}x ${vz(b)}`, `${a}`, `${c}x^2 ${vz(d)}`, `${2 * c}x`,
          `f′ = ${a}(${c}x^2 ${vz(d)}) + (${a}x ${vz(b)}) \\cdot ${2 * c}x`, erg),
        fallen: [{ t: `${a}*${2 * c}x`, h: "Das ist u′ · v′. Die Produktregel lautet u′v + uv′." }] }; }
      if (st === 3) { const erg = `${3 * a * c}x^2 ${vz(2 * a * d + 2 * b * c)}x ${vz(a * e2 + b * d)}`; return {
        tex: `(${a}x ${vz(b)})(${c}x^2 ${vz(d)}x ${vz(e2)})`, f: `(${a}x+${b})*(${c}x^2+${d}x+${e2})`,
        loesung: `${3 * a * c}x^2${vzm(2 * a * d + 2 * b * c)}x${vzm(a * e2 + b * d)}`, zeig: erg,
        weg: FR.wegProdukt(`${a}x ${vz(b)}`, `${a}`, `${c}x^2 ${vz(d)}x ${vz(e2)}`, `${2 * c}x ${vz(d)}`,
          `f′ = ${a}(${c}x^2 ${vz(d)}x ${vz(e2)}) + (${a}x ${vz(b)})(${2 * c}x ${vz(d)})`, erg) }; }
      if (st === 4) { const k = ganz(2, 3); const erg = `e^x(x^{${k}} + ${k}x^{${k - 1}})`; return {
        tex: `x^{${k}} \\cdot e^x`, f: `x^${k}*e^x`,
        loesung: `e^x*(x^${k}+${k}x^${k - 1})`, zeig: erg,
        weg: FR.wegProdukt(`x^{${k}}`, `${k}x^{${k - 1}}`, `e^x`, `e^x`,
          `f′ = ${k}x^{${k - 1}}e^x + x^{${k}}e^x`, erg),
        fallen: [{ t: `${k}x^${k - 1}*e^x`, h: "Die Ableitung von e^x wurde vergessen — es fehlt der zweite Summand." }] }; }
      const k = ganz(2, 3); const erg = `${k}x^{${k - 1}} \\sin x + x^{${k}} \\cos x`; return {
        tex: `x^{${k}} \\cdot \\sin x`, f: `x^${k}*sin(x)`,
        loesung: `${k}x^${k - 1}*sin(x)+x^${k}*cos(x)`, zeig: erg,
        weg: FR.wegProdukt(`x^{${k}}`, `${k}x^{${k - 1}}`, `\\sin x`, `\\cos x`,
          `f′ = ${k}x^{${k - 1}} \\sin x + x^{${k}} \\cos x`, erg),
        fallen: [{ t: `${k}x^${k - 1}*cos(x)`, h: "Das ist u′ · v′. Beide Summanden der Produktregel werden gebraucht." }] };
    },
  },
  {
    id: "kette", name: "Verkettungen", regel: "Kettenregel",
    erklaerung: "Äußere mal innere Ableitung. Die innere Ableitung wird am häufigsten vergessen.",
    mach: (st) => {
      const a = ohneNull(2, 4), b = ganz(1, 6);
      if (st <= 1) { const erg = `${2 * a}(${a}x ${vz(b)})`; return {
        tex: `(${a}x ${vz(b)})^2`, f: `(${a}x+${b})^2`,
        loesung: `${2 * a}*(${a}x+${b})`, zeig: erg,
        weg: FR.wegKette(`v^2`, `${a}x ${vz(b)}`, `${a}`, `f′ = 2(${a}x ${vz(b)}) \\cdot ${a}`, erg),
        fallen: [{ t: `2*(${a}x+${b})`, h: `Die innere Ableitung fehlt: der Faktor ${a} vor der Klammer.` }] }; }
      if (st === 2) { const n = ganz(3, 5); const erg = `${n * a}(${a}x ${vz(b)})^{${n - 1}}`; return {
        tex: `(${a}x ${vz(b)})^{${n}}`, f: `(${a}x+${b})^${n}`,
        loesung: `${n * a}*(${a}x+${b})^${n - 1}`, zeig: erg,
        weg: FR.wegKette(`v^{${n}}`, `${a}x ${vz(b)}`, `${a}`,
          `f′ = ${n}(${a}x ${vz(b)})^{${n - 1}} \\cdot ${a}`, erg),
        fallen: [{ t: `${n}*(${a}x+${b})^${n - 1}`, h: `Die innere Ableitung fehlt: der Faktor ${a}.` }] }; }
      if (st === 3) { const erg = `${a}\\cos(${a}x ${vz(b)})`; return {
        tex: `\\sin(${a}x ${vz(b)})`, f: `sin(${a}x+${b})`,
        loesung: `${a}*cos(${a}x+${b})`, zeig: erg,
        weg: FR.wegKette(`\\sin v`, `${a}x ${vz(b)}`, `${a}`,
          `f′ = \\cos(${a}x ${vz(b)}) \\cdot ${a}`, erg),
        fallen: [{ t: `cos(${a}x+${b})`, h: `Die innere Ableitung fehlt: der Faktor ${a}.` },
                 { t: `-${a}*cos(${a}x+${b})`, h: "Das Vorzeichen stimmt nicht — (sin u)′ ist plus cos u." }] }; }
      if (st === 4) { if (Math.random() < 0.5) { const erg = `${a}e^{${a}x ${vz(b)}}`; return {
          tex: `e^{${a}x ${vz(b)}}`, f: `e^(${a}x+${b})`,
          loesung: `${a}*e^(${a}x+${b})`, zeig: erg,
          weg: FR.wegKette(`e^v`, `${a}x ${vz(b)}`, `${a}`, `f′ = e^{${a}x ${vz(b)}} \\cdot ${a}`, erg),
          fallen: [{ t: `e^(${a}x+${b})`, h: `Die innere Ableitung fehlt: der Faktor ${a}.` }] }; }
        const erg = `\\frac{${a}}{2\\sqrt{${a}x + ${b}}}`; return {
          tex: `\\sqrt{${a}x + ${b}}`, f: `sqrt(${a}x+${b})`,
          loesung: `${a}/(2*sqrt(${a}x+${b}))`, zeig: erg,
          weg: FR.wegKette(`\\sqrt{v}`, `${a}x + ${b}`, `${a}`,
            `f′ = \\frac{1}{2\\sqrt{${a}x + ${b}}} \\cdot ${a}`, erg),
          fallen: [{ t: `1/(2*sqrt(${a}x+${b}))`, h: `Die innere Ableitung fehlt: der Faktor ${a}.` }] }; }
      if (Math.random() < 0.5) { const erg = `${2 * a}x \\cos(${a}x^2 ${vz(b)})`; return {
        tex: `\\sin(${a}x^2 ${vz(b)})`, f: `sin(${a}x^2+${b})`,
        loesung: `${2 * a}x*cos(${a}x^2+${b})`, zeig: erg,
        weg: FR.wegKette(`\\sin v`, `${a}x^2 ${vz(b)}`, `${2 * a}x`,
          `f′ = \\cos(${a}x^2 ${vz(b)}) \\cdot ${2 * a}x`, erg),
        fallen: [{ t: `cos(${a}x^2+${b})`, h: `Die innere Ableitung von ${a}x² ist ${2 * a}x — sie fehlt.` }] }; }
      const erg = `${2 * a}x \\, e^{${a}x^2}`; return {
        tex: `e^{${a}x^2}`, f: `e^(${a}x^2)`,
        loesung: `${2 * a}x*e^(${a}x^2)`, zeig: erg,
        weg: FR.wegKette(`e^v`, `${a}x^2`, `${2 * a}x`, `f′ = e^{${a}x^2} \\cdot ${2 * a}x`, erg),
        fallen: [{ t: `e^(${a}x^2)`, h: `Die innere Ableitung von ${a}x² fehlt.` }] };
    },
  },
  {
    id: "quotient", name: "Quotienten", regel: "Quotientenregel",
    erklaerung: "(u′v − uv′) geteilt durch v². Auf die Reihenfolge im Zähler achten, sonst kippt das Vorzeichen.",
    mach: (st) => {
      let a, b, c, d;
      do { a = ohneNull(1, 4); b = ohneNull(-5, 5); c = ohneNull(1, 3); d = ohneNull(-5, 5); }
      while (a * d - b * c === 0);
      if (st <= 1) { while (d === b) d = ohneNull(-5, 5); const z = d - b;
        const erg = `\\frac{${z}}{(x ${vz(d)})^2}`; return {
        tex: `\\frac{x ${vz(b)}}{x ${vz(d)}}`, f: `(x+${b})/(x+${d})`,
        loesung: `${z}/((x+${d})^2)`, zeig: erg,
        weg: FR.wegQuotient(`x ${vz(b)}`, `1`, `x ${vz(d)}`, `1`,
          `f′ = \\frac{1 \\cdot (x ${vz(d)}) - (x ${vz(b)}) \\cdot 1}{(x ${vz(d)})^2}`, erg),
        fallen: [{ t: `${-z}/((x+${d})^2)`, h: "Im Zähler steht u′v − uv′, nicht umgekehrt — dadurch kippt das Vorzeichen." }] }; }
      if (st === 2) { const z = a * d - b * c; const erg = `\\frac{${z}}{(${c}x ${vz(d)})^2}`; return {
        tex: `\\frac{${a}x ${vz(b)}}{${c}x ${vz(d)}}`, f: `(${a}x+${b})/(${c}x+${d})`,
        loesung: `${z}/((${c}x+${d})^2)`, zeig: erg,
        weg: FR.wegQuotient(`${a}x ${vz(b)}`, `${a}`, `${c}x ${vz(d)}`, `${c}`,
          `f′ = \\frac{${a}(${c}x ${vz(d)}) - (${a}x ${vz(b)}) \\cdot ${c}}{(${c}x ${vz(d)})^2}`, erg),
        fallen: [{ t: `${-z}/((${c}x+${d})^2)`, h: "Reihenfolge im Zähler vertauscht: u′v − uv′, nicht uv′ − u′v." },
                 { t: `${a}/${c}`, h: "Zähler und Nenner werden nicht einzeln abgeleitet." }] }; }
      if (st === 3) { const erg = `\\frac{${a * c}x^2 ${vz(2 * a * d)}x ${vz(-b * c)}}{(${c}x ${vz(d)})^2}`; return {
        tex: `\\frac{${a}x^2 ${vz(b)}}{${c}x ${vz(d)}}`, f: `(${a}x^2+${b})/(${c}x+${d})`,
        loesung: `(${a * c}x^2+${2 * a * d}x-${b * c})/((${c}x+${d})^2)`, zeig: erg,
        weg: FR.wegQuotient(`${a}x^2 ${vz(b)}`, `${2 * a}x`, `${c}x ${vz(d)}`, `${c}`,
          `f′ = \\frac{${2 * a}x(${c}x ${vz(d)}) - (${a}x^2 ${vz(b)}) \\cdot ${c}}{(${c}x ${vz(d)})^2}`, erg) }; }
      if (st === 4) { const erg = `\\frac{${-a * c}x^2 ${vz(-2 * b * c)}x ${vz(a * d)}}{(${c}x^2 ${vz(d)})^2}`; return {
        tex: `\\frac{${a}x ${vz(b)}}{${c}x^2 ${vz(d)}}`, f: `(${a}x+${b})/(${c}x^2+${d})`,
        loesung: `(${-a * c}x^2-${2 * b * c}x+${a * d})/((${c}x^2+${d})^2)`, zeig: erg,
        weg: FR.wegQuotient(`${a}x ${vz(b)}`, `${a}`, `${c}x^2 ${vz(d)}`, `${2 * c}x`,
          `f′ = \\frac{${a}(${c}x^2 ${vz(d)}) - (${a}x ${vz(b)}) \\cdot ${2 * c}x}{(${c}x^2 ${vz(d)})^2}`, erg) }; }
      if (Math.random() < 0.5) { const erg = `\\frac{e^x(x-1)}{x^2}`; return {
        tex: `\\frac{e^x}{x}`, f: `e^x/x`, loesung: `e^x*(x-1)/x^2`, zeig: erg,
        weg: FR.wegQuotient(`e^x`, `e^x`, `x`, `1`, `f′ = \\frac{e^x \\cdot x - e^x \\cdot 1}{x^2}`, erg),
        fallen: [{ t: `e^x/1`, h: "Zähler und Nenner werden nicht einzeln abgeleitet." }] }; }
      const erg = `\\frac{1 - \\ln x}{x^2}`; return {
        tex: `\\frac{\\ln x}{x}`, f: `ln(x)/x`, loesung: `(1-ln(x))/x^2`, zeig: erg,
        weg: FR.wegQuotient(`\\ln x`, `\\frac{1}{x}`, `x`, `1`,
          `f′ = \\frac{\\frac{1}{x} \\cdot x - \\ln x \\cdot 1}{x^2}`, erg),
        fallen: [{ t: `(ln(x)-1)/x^2`, h: "Reihenfolge im Zähler vertauscht — u′v − uv′." }] };
    },
  },
  {
    id: "speziell", name: "Spezielle Funktionen", regel: "exp, ln, sin, cos",
    erklaerung: "Die vier Grundableitungen, meist kombiniert mit Faktor- oder Produktregel.",
    mach: (st) => {
      const a = ohneNull(2, 6), b = ohneNull(-6, 6);
      if (st <= 1) { if (Math.random() < 0.5) { const erg = `${a}\\cos x`; return {
          tex: `${a}\\sin x`, f: `${a}*sin(x)`, loesung: `${a}*cos(x)`, zeig: erg,
          weg: [W("Der konstante Faktor bleibt beim Ableiten unverändert stehen.", `f = ${a} \\cdot \\sin x`),
                W("Die Ableitung des Sinus ist der Kosinus — ohne Vorzeichenwechsel.", `(\\sin x)′ = \\cos x`),
                W("Beides zusammen.", `f′(x) = ${erg}`)],
          fallen: [{ t: `-${a}*cos(x)`, h: "(sin x)′ ist plus cos x. Das Minus gehört zur Ableitung des Kosinus." }] }; }
        const erg = `-${a}\\sin x`; return {
          tex: `${a}\\cos x`, f: `${a}*cos(x)`, loesung: `-${a}*sin(x)`, zeig: erg,
          weg: [W("Der konstante Faktor bleibt stehen.", `f = ${a} \\cdot \\cos x`),
                W("Die Ableitung des Kosinus ist minus Sinus. Das Minuszeichen gehört dazu.", `(\\cos x)′ = -\\sin x`),
                W("Beides zusammen.", `f′(x) = ${erg}`)],
          fallen: [{ t: `${a}*sin(x)`, h: "(cos x)′ ist minus sin x — das Vorzeichen fehlt." }] }; }
      if (st === 2) { const erg = `${a}\\cos x ${vz(-b)}\\sin x`; return {
        tex: `${a}\\sin x ${vz(b)}\\cos x`, f: `${a}*sin(x)+${b}*cos(x)`,
        loesung: `${a}*cos(x)-${b}*sin(x)`, zeig: erg,
        weg: FR.wegSumme([
          { tex: `${a}\\sin x`, abl: `${a}\\cos x`, h: "Sinus wird zu Kosinus, der Faktor bleibt." },
          { tex: `${b}\\cos x`, abl: `${-b}\\sin x`, h: "Kosinus wird zu minus Sinus — hier dreht sich das Vorzeichen." },
        ], erg),
        fallen: [{ t: `${a}*cos(x)+${b}*sin(x)`, h: "Beim Kosinus entsteht ein Minuszeichen." }] }; }
      if (st === 3) { if (Math.random() < 0.5) { const erg = `${a}e^x ${vz(2 * b)}x`; return {
          tex: `${a}e^x ${vz(b)}x^2`, f: `${a}*e^x+${b}x^2`, loesung: `${a}*e^x${vzm(2 * b)}*x`, zeig: erg,
          weg: FR.wegSumme([
            { tex: `${a}e^x`, abl: `${a}e^x`, h: "Die e-Funktion ist ihre eigene Ableitung." },
            { tex: `${b}x^2`, abl: `${2 * b}x`, h: "Potenzregel wie gewohnt." },
          ], erg) }; }
        const erg = `\\frac{${a}}{x} ${vz(b)}`; return {
          tex: `${a}\\ln x ${vz(b)}x`, f: `${a}*ln(x)+${b}x`, loesung: `${a}/x${vzm(b)}`, zeig: erg,
          weg: FR.wegSumme([
            { tex: `${a}\\ln x`, abl: `\\frac{${a}}{x}`, h: "Die Ableitung von ln x ist 1 durch x." },
            { tex: `${b}x`, abl: `${b}`, h: "Bei x hoch eins bleibt der Vorfaktor übrig." },
          ], erg),
          fallen: [{ t: `${a}/x`, h: `Der lineare Summand wurde vergessen — seine Ableitung ist ${b}.` }] }; }
      if (st === 4) { if (Math.random() < 0.5) { const erg = `\\sin x + x \\cos x`; return {
          tex: `x \\cdot \\sin x`, f: `x*sin(x)`, loesung: `sin(x)+x*cos(x)`, zeig: erg,
          weg: FR.wegProdukt(`x`, `1`, `\\sin x`, `\\cos x`, `f′ = 1 \\cdot \\sin x + x \\cdot \\cos x`, erg),
          fallen: [{ t: `cos(x)`, h: "Das ist u′ · v′. Bei einem Produkt braucht es beide Summanden." }] }; }
        const erg = `${a}\\ln x + ${a}`; return {
          tex: `${a}x \\cdot \\ln x`, f: `${a}x*ln(x)`, loesung: `${a}*ln(x)+${a}`, zeig: erg,
          weg: FR.wegProdukt(`${a}x`, `${a}`, `\\ln x`, `\\frac{1}{x}`,
            `f′ = ${a}\\ln x + ${a}x \\cdot \\frac{1}{x}`, erg),
          fallen: [{ t: `${a}*ln(x)`, h: "Der zweite Summand der Produktregel fehlt: x · (1/x) ergibt 1." }] }; }
      if (Math.random() < 0.5) { const erg = `e^x(\\sin x + \\cos x)`; return {
        tex: `e^x \\cdot \\sin x`, f: `e^x*sin(x)`, loesung: `e^x*(sin(x)+cos(x))`, zeig: erg,
        weg: FR.wegProdukt(`e^x`, `e^x`, `\\sin x`, `\\cos x`, `f′ = e^x \\sin x + e^x \\cos x`, erg),
        fallen: [{ t: `e^x*cos(x)`, h: "Das ist nur u · v′. Der Summand u′v fehlt." }] }; }
      const erg = `2x \\ln x + x`; return {
        tex: `x^2 \\cdot \\ln x`, f: `x^2*ln(x)`, loesung: `2x*ln(x)+x`, zeig: erg,
        weg: FR.wegProdukt(`x^2`, `2x`, `\\ln x`, `\\frac{1}{x}`,
          `f′ = 2x \\ln x + x^2 \\cdot \\frac{1}{x}`, erg),
        fallen: [{ t: `2x*ln(x)`, h: "Der zweite Summand fehlt: x² · (1/x) ergibt x." }] };
    },
  },
];

/* --- Fehleranalyse: deterministisch, ohne Modell --- */


export const GEN_MODULE = [
  { id: "gerade", titel: "Geradengleichungen", kurz: "Aus zwei Punkten oder aus Punkt und Steigung — mit Schaubild." },
  { id: "ableiten", titel: "Ableitungen bilden", kurz: "Potenz-, Faktor-, Summen-, Produkt-, Ketten- und Quotientenregel, dazu exp, ln, sin, cos." },
  { id: "kurve", titel: "Kurvendiskussion", kurz: "Alle neun Schritte zu einer erzeugten Funktion, geprüft wird am Schluss." },
  { id: "blatt", titel: "Arbeitsblatt drucken", kurz: "Aufgabenblatt im Matheskript-Layout mit Lösungsteil — zum Ausdrucken oder als PDF." },
];


export const PRIMLISTE = (() => {
  const grenze = 500, sieb = new Array(grenze + 1).fill(true);
  sieb[0] = sieb[1] = false;
  for (let i = 2; i * i <= grenze; i++) if (sieb[i]) for (let j = i * i; j <= grenze; j += i) sieb[j] = false;
  return sieb.map((p, i) => (p ? i : 0)).filter(Boolean);
})();

/* Kleinste Quadratzahl oberhalb von n — sie zeigt, wie weit man testen muss. */

export const PF_STUFEN = [
  { id: "klein", name: "zweistellig", von: 12, bis: 99 },
  { id: "mittel", name: "dreistellig", von: 100, bis: 499 },
  { id: "gross", name: "groß", von: 500, bis: 2000 },
];

/* Es werden ausschließlich zusammengesetzte Zahlen gestellt — die Aufgabe ist
   das Zerlegen, nicht das Erkennen einer Primzahl. */

export const KOPF_WERKZEUGE = [
  { id: "primfaktoren", titel: "Primfaktorzerlegung", kurz: "Primzahl erkennen oder vollständig zerlegen — jeden Faktor einzeln." },
];


export const PROTOKOLL = [];


export const FEHLERARTEN = {
  regel: "Regel falsch angewendet",
  tiefe: "falsche Ableitungsstufe",
  vorzeichen: "Vorzeichenfehler",
  summand: "Summand vergessen oder zu viel",
  faktor: "konstanter Faktor daneben",
  schreibweise: "Schreibweise",
  grenzuebergang: "Grenzübergang h → 0 noch nicht korrekt",
  sonstiges: "sonstige Abweichung",
};


export const LW_GRIECHISCH = ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "λ", "μ", "ν", "ξ",
  "π", "ρ", "σ", "τ", "φ", "χ", "ψ", "ω", "Γ", "Δ", "Θ", "Λ", "Ξ", "Π", "Σ", "Φ", "Ω"];


export const LW_KLEIN = "abcdefghijklmnopqrstuvwxyz".split("");

export const LW_GROSS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");


export const LW_FUNKTIONEN = [
  { z: "sin x", e: "sin(x)" }, { z: "cos x", e: "cos(x)" }, { z: "tan x", e: "tan(x)" },
  { z: "ln x", e: "ln(x)" }, { z: "eˣ", e: "e^x" }, { z: "√x", e: "sqrt(x)" },
  { z: "sin(▯)", e: `sin(${PLATZ})` }, { z: "cos(▯)", e: `cos(${PLATZ})` }, { z: "tan(▯)", e: `tan(${PLATZ})` },
  { z: "ln(▯)", e: `ln(${PLATZ})` }, { z: "e^(▯)", e: `e^(${PLATZ})` }, { z: "√(▯)", e: `sqrt(${PLATZ})` },
];


export const LW_FX = [
  { z: "f(x)", e: "f(x)" }, { z: "f′(x)", e: "f′(x)" }, { z: "f″(x)", e: "f″(x)" }, { z: "f‴(x)", e: "f‴(x)" },
  { z: "f(▯)", e: `f(${PLATZ})` }, { z: "g(x)", e: "g(x)" }, { z: "t(x)", e: "t(x)" }, { z: "F(x)", e: "F(x)" },
];


export const LW_ZAHLEN = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ",", "."];

export const LW_HOCH = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "−", "n", "k"];


export const BEREICHE = [
  { id: "A", name: "Algebra", untertitel: "Rechnen und Gleichungen lösen",
    leitsatz: "Rechnen ist vorwärts: Zahl rein, Ergebnis raus. Eine Gleichung lösen ist rückwärts: Das Ergebnis ist bekannt, die Zahl gesucht." },
  { id: "B", name: "Funktionen und Analysis", untertitel: "Geraden und Kurven",
    leitsatz: "Eine Funktion ist eine Rechnung, die man sehen kann. Jede Gleichung aus der Algebra wird hier zu einem Punkt im Koordinatensystem." },
];


