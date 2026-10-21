/* ======================================================================
   matheTastaturLogik.js – reine Logik der Mathe-Tastatur (kein React, kein DOM).
   Einfügen an der Schreibmarke, Löschen, Überspringen von „)“, Tastenbelegung je Modus.
   Getestet in tests/matheTastatur.test.mjs. Keine base-Datei darf diese Datei importieren.
   ====================================================================== */

/* Modi eines Feldes
     ganz     nur Ziffern
     ganzvz   Ziffern und Minus (ganze Zahlen mit Vorzeichen)
     zahl     Ziffern, Komma/Punkt, Minus
     bruch    wie zahl, zusätzlich Bruchstrich /
     wurzel   wie bruch, zusätzlich Wurzelzeichen √ (für exakte Zahlen wie 1/2, 0,5, √5, −√7)
     datum    Ziffern, Punkt, Minus, Schrägstrich
     formel   alles: Variablen, Funktionen, Potenzen, Klammern, f(x) …
     trig     Taschenrechner der Trigonometrie: Ziffern, Rechenzeichen, sin, cos, tan,
              sin⁻¹, cos⁻¹, tan⁻¹, π, °, √, x² (kein eˣ, kein ln) – ausgewertet von trigMittel.js */
export const MODI = ["ganz", "ganzvz", "zahl", "bruch", "wurzel", "datum", "formel", "trig"];
export const istModus = (m) => MODI.includes(m);

/* Tastenart: { id, anz (Beschriftung), text (einzufügen), zurueck (Schreibmarke so viele Zeichen zurück), label (Vorlese-Text) } */
export const Z = (n) => ({ id: n, anz: n, text: n, label: n });

/* Zusatztasten des Zahlenblocks je Modus (null = Taste entfällt) */
export function zahlenTasten(modus, dez = ",") {
  return {
    minus: modus !== "ganz" ? { id: "minus", anz: "−", text: "-", label: "Minus" } : null,
    dez: modus === "zahl" || modus === "bruch" || modus === "wurzel" ? { id: "dez", anz: dez, text: dez, label: dez === "," ? "Komma" : "Punkt" }
      : modus === "datum" ? { id: "punkt", anz: ".", text: ".", label: "Punkt" } : null,
    bruch: modus === "bruch" || modus === "wurzel" ? { id: "bruch", anz: "/", text: "/", label: "Bruchstrich" } : modus === "datum" ? { id: "schraeg", anz: "/", text: "/", label: "Schrägstrich" } : null,
    wurzel: modus === "wurzel" ? { id: "wurzel", anz: "√", text: "√", label: "Wurzel" } : null,
  };
}

/* Formel-Ebene 1 (Zahlen, Rechenzeichen, Variable) und Ebene 2 (Funktionen).
   Eingefügt wird nur, was der Term-Parser der App versteht: x, e, pi, sin, cos, tan, ln, log, sqrt, ^, ( ), + - * /. */
export const FORMEL_HAUPT = [
  Z("7"), Z("8"), Z("9"), { id: "klauf", anz: "(", text: "(", label: "Klammer auf" }, { id: "klzu", anz: ")", text: ")", label: "Klammer zu" }, { id: "weg", anz: "⌫", aktion: "weg", label: "Löschen" },
  Z("4"), Z("5"), Z("6"), { id: "plus", anz: "+", text: "+", label: "Plus" }, { id: "minus", anz: "−", text: "-", label: "Minus" }, { id: "mal", anz: "·", text: "*", label: "Mal" },
  Z("1"), Z("2"), Z("3"), { id: "durch", anz: "÷", text: "/", label: "Geteilt" }, { id: "hoch", anz: "^", text: "^", label: "Hoch" }, { id: "x", anz: "x", text: "x", label: "x" },
  Z("0"), { id: "dez", anz: ",", text: ",", label: "Komma", dez: true }, { id: "pi", anz: "π", text: "pi", label: "Pi" }, { id: "quad", anz: "x²", text: "^2", label: "hoch 2" }, { id: "wurzel", anz: "√", text: "sqrt()", zurueck: 1, label: "Wurzel" }, { id: "ok", anz: "OK", aktion: "ok", label: "Fertig" },
];
export const FORMEL_FUNKTION = [
  { id: "sin", anz: "sin", text: "sin()", zurueck: 1, label: "Sinus" }, { id: "cos", anz: "cos", text: "cos()", zurueck: 1, label: "Kosinus" }, { id: "tan", anz: "tan", text: "tan()", zurueck: 1, label: "Tangens" },
  { id: "ln", anz: "ln", text: "ln()", zurueck: 1, label: "natürlicher Logarithmus" }, { id: "log", anz: "log", text: "log()", zurueck: 1, label: "Logarithmus" }, { id: "weg", anz: "⌫", aktion: "weg", label: "Löschen" },
  { id: "ehoch", anz: "eˣ", text: "e^()", zurueck: 1, label: "e hoch" }, { id: "kub", anz: "x³", text: "^3", label: "hoch 3" }, { id: "hochn", anz: "xⁿ", text: "^()", zurueck: 1, label: "hoch n" },
  { id: "wurzel", anz: "√", text: "sqrt()", zurueck: 1, label: "Wurzel" }, { id: "kehr", anz: "1/x", text: "1/()", zurueck: 1, label: "Kehrwert" }, { id: "e", anz: "e", text: "e", label: "Eulersche Zahl" },
  { id: "fx", anz: "f(x)", text: "f(x)", label: "f von x" }, { id: "fs", anz: "f′(x)", text: "f'(x)", label: "f Strich von x" }, { id: "gx", anz: "g(x)", text: "g(x)", label: "g von x" },
  { id: "gleich", anz: "=", text: "=", label: "Gleichheitszeichen" }, { id: "semi", anz: ";", text: ";", label: "Semikolon" }, { id: "ok", anz: "OK", aktion: "ok", label: "Fertig" },
];
/* Trig-Rechner: eine Ebene, 6 Spalten × 5 Reihen. Umkehrfunktionen stehen so im Feld, wie sie im Heft stehen: sin⁻¹( … ) */
export const TRIG_TASTEN = [
  { id: "sin", anz: "sin", text: "sin()", zurueck: 1, label: "Sinus" }, { id: "cos", anz: "cos", text: "cos()", zurueck: 1, label: "Kosinus" }, { id: "tan", anz: "tan", text: "tan()", zurueck: 1, label: "Tangens" },
  { id: "asin", anz: "sin⁻¹", text: "sin⁻¹()", zurueck: 1, label: "Arkussinus" }, { id: "acos", anz: "cos⁻¹", text: "cos⁻¹()", zurueck: 1, label: "Arkuskosinus" }, { id: "atan", anz: "tan⁻¹", text: "tan⁻¹()", zurueck: 1, label: "Arkustangens" },
  Z("7"), Z("8"), Z("9"), { id: "klauf", anz: "(", text: "(", label: "Klammer auf" }, { id: "klzu", anz: ")", text: ")", label: "Klammer zu" }, { id: "weg", anz: "⌫", aktion: "weg", label: "Löschen" },
  Z("4"), Z("5"), Z("6"), { id: "mal", anz: "·", text: "·", label: "Mal" }, { id: "durch", anz: "÷", text: "÷", label: "Geteilt" }, { id: "quad", anz: "x²", text: "²", label: "hoch 2" },
  Z("1"), Z("2"), Z("3"), { id: "plus", anz: "+", text: "+", label: "Plus" }, { id: "minus", anz: "−", text: "−", label: "Minus" }, { id: "wurzel", anz: "√", text: "√()", zurueck: 1, label: "Wurzel" },
  Z("0"), { id: "dez", anz: ",", text: ",", label: "Komma", dez: true }, { id: "pi", anz: "π", text: "π", label: "Pi" }, { id: "grad", anz: "°", text: "°", label: "Grad" }, { id: "hoch", anz: "^", text: "^", label: "Hoch" }, { id: "ok", anz: "OK", aktion: "ok", label: "Fertig" },
];

/* Parameter und Variablen für die Ebene „abc“: Vollständiges Alphabet, damit nichts unmöglich bleibt. */
export const BUCHSTABEN_DE = [["q", "w", "e", "r", "t", "z", "u", "i", "o", "p"], ["a", "s", "d", "f", "g", "h", "j", "k", "l"], ["y", "x", "c", "v", "b", "n", "m"]];
export const BUCHSTABEN_EN = [["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"], ["a", "s", "d", "f", "g", "h", "j", "k", "l"], ["z", "x", "c", "v", "b", "n", "m"]];

/* Zeichen, die ein Feld im jeweiligen Modus überhaupt annimmt (für den Test und für die Prüfung der Tasten) */
export const ERLAUBT = {
  ganz: /^[0-9]$/,
  ganzvz: /^[0-9-]$/,
  zahl: /^[0-9,.\-]$/,
  bruch: /^[0-9,./\-]$/,
  wurzel: /^[0-9,./\-√]$/,
  datum: /^[0-9.\-/]$/,
};

/* ---------------------------------------------------------------------
   Bearbeitung: Wert + Auswahl (von, bis) → neuer Wert + Schreibmarke
   --------------------------------------------------------------------- */
export function einfuegen(wert, von, bis, text, zurueck = 0) {
  const a = Math.max(0, Math.min(von ?? wert.length, wert.length));
  const b = Math.max(a, Math.min(bis ?? a, wert.length));
  /* Schließende Klammer: steht schon eine direkt hinter der Schreibmarke, nur überspringen (wie bei Taschenrechnern). */
  if (text === ")" && a === b && wert[a] === ")") return { wert, pos: a + 1 };
  const neu = wert.slice(0, a) + text + wert.slice(b);
  return { wert: neu, pos: a + text.length - zurueck };
}

export function loeschen(wert, von, bis) {
  const a = Math.max(0, Math.min(von ?? wert.length, wert.length));
  const b = Math.max(a, Math.min(bis ?? a, wert.length));
  if (a !== b) return { wert: wert.slice(0, a) + wert.slice(b), pos: a };
  if (a === 0) return { wert, pos: 0 };
  /* Eine leere Funktionsklammer „sin()“ wird als Ganzes entfernt, wenn die Schreibmarke zwischen den Klammern steht. */
  const m = /(sin⁻¹|cos⁻¹|tan⁻¹|sin|cos|tan|ln|log|sqrt|e\^|\^|f|g|f'|1\/|√)\($/.exec(wert.slice(0, a));
  if (m && wert[a] === ")") return { wert: wert.slice(0, a - m[0].length) + wert.slice(a + 1), pos: a - m[0].length };
  /* Ein Zeichen links der Schreibmarke (Surrogatpaare werden nicht zerrissen) */
  const cp = wert.codePointAt(a - 1) >= 0xdc00 && wert.codePointAt(a - 1) <= 0xdfff ? 2 : 1;
  return { wert: wert.slice(0, a - cp) + wert.slice(a), pos: a - cp };
}

/* Zeigt die Tastatur in diesem Modus auf diesem Gerät automatisch? Auf Geräten mit Maus nur für Formeln. */
/* Der Trig-Rechner zeigt sein Tastenfeld auch mit Maus: sin⁻¹ oder π tippt man auf der Computertastatur nicht. */
export const zeigeAutomatisch = (modus, grobZeiger) => (grobZeiger ? istModus(modus) : modus === "formel" || modus === "trig");

/* Am Desktop steht das Tastenfeld neben dem Feld, nicht als Leiste unten.
   feld = getBoundingClientRect() des Feldes, vb/vh = Fenstergröße, b/h = Größe des Tastenfelds.
   Reihenfolge: rechts daneben → links daneben → darunter → darüber. Immer ganz im Fenster. */
export const DESKTOP_TASTATUR_AB = 840;
export function tastaturPlatz(feld, vb, vh, b, h, abstand = 12, oben = 72) {
  const rand = 12;
  const klemme = (v, lo, hi) => Math.max(lo, Math.min(v, Math.max(lo, hi)));
  const topNeben = klemme(feld.top - 8, oben, vh - h - rand);
  if (vb - feld.right - abstand - rand >= b) return { seite: "rechts", left: feld.right + abstand, top: topNeben };
  if (feld.left - abstand - rand >= b) return { seite: "links", left: feld.left - abstand - b, top: topNeben };
  const left = klemme(feld.right - b, rand, vb - b - rand);
  if (feld.bottom + abstand + h <= vh - rand) return { seite: "unten", left, top: feld.bottom + abstand };
  if (feld.top - abstand - h >= oben) return { seite: "oben", left, top: Math.min(feld.top - abstand - h, vh - h - rand) };
  return { seite: "unten", left, top: klemme(feld.bottom + abstand, oben, vh - h - rand) };
}

/* Welche Buchstaben außer x, e und π braucht eine Lösung? (Für die Variablen-Tasten des Formel-Tastenfelds.)
   Funktionsnamen (sin, cos, tan, ln, log, sqrt, exp) und pi zählen nicht. */
export function variablenAus(loesung) {
  const t = String(loesung || "").replace(/\\[a-zA-Z]+/g, " ").replace(/sqrt|sin|cos|tan|exp|log|ln|pi/gi, " ");
  const v = new Set();
  for (const ch of t) if (/[a-zA-Z]/.test(ch) && ch !== "x" && ch !== "e") v.add(ch);
  return [...v].sort();
}

/* Zahl-Aufgabe: Welcher Modus passt zur Lösung? Mit π, e, ln, sin … → formel; mit Wurzel → wurzel; sonst bruch. */
export function zahlModusAus(loesung) {
  const t = String(loesung ?? "");
  if (/pi|π|\be\b|e\^|ln|log|sin|cos|tan|[a-df-wyz]/i.test(t.replace(/sqrt/gi, ""))) return "formel";
  if (/sqrt|√/.test(t)) return "wurzel";
  return "bruch";
}
