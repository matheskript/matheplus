/* ======================================================================
   perfAufgaben.js – kuratierter, mathematisch geprüfter Aufgabenbestand des Performance-Labs
   (reine Logik, kein React, kein Speicher).

   Erste Umsetzung: Fehlertyp „Vorzeichenfehler“ in vier Kontexten
     · klammern  → Minus vor einer Klammer           (Untertyp minus_klammer)
     · umformung → Äquivalenzumformungen             (Untertyp umstellen)
     · ableiten  → Ableiten                          (Untertyp ableiten)
     · terme     → Ausmultiplizieren, Zusammenfassen (Untertyp zusammenfassen)

   Warum kuratiert statt zufällig: Ein zufällig gekipptes Vorzeichen ergibt keine sinnvolle
   Fehleraufgabe. Jede Aufgabe hier hat
     · eine Musterlösung (Kette von Zeilen, alle gegenseitig äquivalent),
     · genau EINE definierte Fehlerstelle (der typische falsche Schritt, sonst identisch mit dem richtigen),
     · Validierungsregeln für die Form der Antwort (sonst wäre schon die unveränderte Ausgangszeile „richtig“),
     · ein Feedback, das zur belegten Fehlerursache passt – nie zu einer bloß vermuteten.
   Die Tests (tests/perfAufgaben.test.mjs) prüfen das alles exakt UND unabhängig davon numerisch.

   Eingabe, Bewertung und Hilfen laufen über bewerte() / hilfeText(); die Trainingsrunden
   (perfTraining.js) kennen keine Mathematik, sondern fragen nur hierher.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { aequivalent, betragsAtome, normalisiere, parseGleichung, parsePoly } from "./perfAlgebra.js";

/* ---------- Anzeige: aus Maschinenschreibweise wird die Formel für den M-Renderer ---------- */
export function anzeige(s) {
  let t = String(s ?? "").replace(/[−–]/g, "-").replace(/[·×]/g, "*").replace(/\s+/g, "");
  t = t.replace(/\^(\d+)/g, "^{$1}");
  let out = "";
  for (let i = 0; i < t.length; i++) {
    const c = t[i], vor = i > 0 ? t[i - 1] : "";
    if (c === "=") out += " = ";
    else if (c === "+") out += " + ";
    else if (c === "-") out += (i === 0 || "(=+-*".includes(vor)) ? "−" : " − ";
    else if (c === "*") out += " \\cdot ";
    else out += c;
  }
  return out.replace(/\s{2,}/g, " ").trim();
}
export const tex = (s) => `$${anzeige(s)}$`;

/* ---------- Regeltexte je Untertyp (Hilfestufe „Regel“) ---------- */
export const REGEL_JE_UNTERTYP = {
  minus_klammer: "Ein Minus vor der Klammer dreht das Vorzeichen von jedem Summanden in der Klammer um: $-(a + b) = -a - b$ und $-(a - b) = -a + b$.",
  umstellen: "Wechselt ein Term die Gleichungsseite, wechselt auch sein Vorzeichen: aus $+a$ wird $-a$ und aus $-a$ wird $+a$ (gemeint ist: auf beiden Seiten das Gleiche addieren oder subtrahieren).",
  ableiten: "Beim Ableiten bleibt das Vorzeichen eines Summanden erhalten: $(-a \\cdot x^{n})' = -a \\cdot n \\cdot x^{n-1}$. Steht ein Minus vor einer Klammer, wirkt es auf die Ableitung jedes Summanden.",
  zusammenfassen: "Beim Ausmultiplizieren gilt: Plus mal Minus ergibt Minus, Minus mal Minus ergibt Plus. Jedes Produkt bekommt sein eigenes Vorzeichen.",
};

/* Rückmeldung, wenn die Antwort nur in Vorzeichen vom Richtigen abweicht (ohne dass es der typische Fehler ist) */
const VORZEICHEN_GENERISCH = {
  minus_klammer: "Die Zahlen und Variablen stimmen, aber mindestens ein Vorzeichen ist noch falsch. Prüfe jeden Summanden, auf den das Minus vor der Klammer wirkt.",
  umstellen: "Die Zahlen und Variablen stimmen, aber mindestens ein Vorzeichen ist noch falsch. Prüfe jeden Term, der die Gleichungsseite gewechselt hat.",
  ableiten: "Die Beträge stimmen, aber mindestens ein Vorzeichen ist noch falsch. Prüfe, ob jeder Summand sein Vorzeichen beim Ableiten behalten hat.",
  zusammenfassen: "Die Beträge stimmen, aber mindestens ein Vorzeichen ist noch falsch. Prüfe jedes einzelne Produkt auf sein Vorzeichen.",
};

/* ======================================================================
   Aufgabenliste
   Felder: id · kontext · untertyp · schwierigkeit (1–3) · start (Ausgangszeile) · auftrag
           muster: Kette richtiger Zeilen; muster[0] ist der Schritt, der in fehlerSchritt falsch gemacht wird
           korrekt: Referenzlösung · fehlerSchritt: der typische falsche Schritt (= Fehlerstelle genau eines Vorzeichens)
           fehlerStelle / fehlerRichtig: der betroffene Term im falschen bzw. richtigen Schritt
           form: Validierungsregeln · feedbackTypisch · hinweise [Denkfrage, Regel, nächster Schritt]
   ====================================================================== */
const FORM_KLAMMER = ["ohneKlammern"];
const FORM_TERME = ["ohneKlammern", "zusammengefasst"];
const FORM_UMFORMUNG = ["gleichung", "variablenLinks"];

export const AUFGABEN_VORZEICHEN = [
  /* ---------- Minus vor einer Klammer ---------- */
  { id: "vz-kl-01", kontext: "klammern", untertyp: "minus_klammer", schwierigkeit: 1, art: "term",
    start: "3x-(2x-5)", auftrag: "Löse die Klammer auf.", korrekt: "x+5",
    muster: ["3x-2x+5", "x+5"], fehlerSchritt: "3x-2x-5", fehlerStelle: "-5", fehlerRichtig: "+5", form: FORM_KLAMMER,
    feedbackTypisch: "Hier wurde nur $2x$ umgedreht. Das Minus wirkt aber auch auf die $-5$ in der Klammer: $-(2x-5) = -2x+5$.",
    hinweise: ["In der Klammer stehen zwei Summanden. Auf wie viele davon wirkt das Minus davor?", "Minus vor der Klammer: Jedes Vorzeichen in der Klammer wird umgedreht.", "Aus $-(2x-5)$ wird $-2x$ und aus $-5$ wird $+5$. Fasse dann $3x-2x$ zusammen."] },
  { id: "vz-kl-02", kontext: "klammern", untertyp: "minus_klammer", schwierigkeit: 1, art: "term",
    start: "7-(x+4)+2x", auftrag: "Löse die Klammer auf.", korrekt: "x+3",
    muster: ["7-x-4+2x", "x+3"], fehlerSchritt: "7-x+4+2x", fehlerStelle: "+4", fehlerRichtig: "-4", form: FORM_KLAMMER,
    feedbackTypisch: "Das Minus vor der Klammer wurde nur auf $x$ angewendet. Die $+4$ in der Klammer wird ebenfalls zu $-4$.",
    hinweise: ["Welche Summanden stehen in der Klammer, und wie sieht jeder nach dem Auflösen aus?", "Ein Minus vor der Klammer dreht jedes Vorzeichen in der Klammer um.", "$-(x+4)$ wird zu $-x-4$. Dann stehen $7-x-4+2x$ da – fasse zusammen."] },
  { id: "vz-kl-03", kontext: "klammern", untertyp: "minus_klammer", schwierigkeit: 2, art: "term",
    start: "2x^2-(x^2-3x+1)", auftrag: "Löse die Klammer auf.", korrekt: "x^2+3x-1",
    muster: ["2x^2-x^2+3x-1", "x^2+3x-1"], fehlerSchritt: "2x^2-x^2-3x-1", fehlerStelle: "-3x", fehlerRichtig: "+3x", form: FORM_KLAMMER,
    feedbackTypisch: "Das Minus wurde bei $x^2$ und bei $1$ beachtet, bei $-3x$ aber nicht: $-(-3x)$ ergibt $+3x$.",
    hinweise: ["Die Klammer hat drei Summanden. Wurde das Minus bei allen dreien berücksichtigt?", "Minus mal Minus ergibt Plus: $-(-3x) = +3x$.", "$-(x^2-3x+1) = -x^2+3x-1$. Danach $2x^2-x^2$ zusammenfassen."] },
  { id: "vz-kl-04", kontext: "klammern", untertyp: "minus_klammer", schwierigkeit: 3, art: "term",
    start: "-(4-3x)+2(x-1)", auftrag: "Löse die Klammern auf und fasse zusammen.", korrekt: "5x-6",
    muster: ["-4+3x+2x-2", "5x-6"], fehlerSchritt: "-4-3x+2x-2", fehlerStelle: "-3x", fehlerRichtig: "+3x", form: FORM_TERME,
    feedbackTypisch: "In $-(4-3x)$ wurde nur die $4$ umgedreht. Auch $-3x$ wird umgedreht und ergibt $+3x$.",
    hinweise: ["Es gibt zwei Klammern. Löse sie nacheinander auf – zuerst die mit dem Minus davor.", "Minus vor der Klammer: Jedes Vorzeichen in der Klammer wird umgedreht, auch das von $-3x$.", "$-(4-3x) = -4+3x$ und $2(x-1) = 2x-2$. Fasse dann $3x+2x$ und $-4-2$ zusammen."] },

  /* ---------- Ausmultiplizieren und Zusammenfassen ---------- */
  { id: "vz-te-01", kontext: "terme", untertyp: "zusammenfassen", schwierigkeit: 2, art: "term",
    start: "2(x-4)-3(x-1)", auftrag: "Multipliziere aus und fasse zusammen.", korrekt: "-x-5",
    muster: ["2x-8-3x+3", "-x-5"], fehlerSchritt: "2x-8-3x-3", fehlerStelle: "-3", fehlerRichtig: "+3", form: FORM_TERME,
    feedbackTypisch: "Bei $-3(x-1)$ ist das zweite Produkt $(-3)\\cdot(-1) = +3$. Hier wurde $-3$ gerechnet.",
    hinweise: ["Welches Vorzeichen hat das Produkt $(-3)\\cdot(-1)$?", "Minus mal Minus ergibt Plus.", "$2(x-4) = 2x-8$ und $-3(x-1) = -3x+3$. Danach zusammenfassen."] },
  { id: "vz-te-02", kontext: "terme", untertyp: "zusammenfassen", schwierigkeit: 2, art: "term",
    start: "-4(2x-3)+5x", auftrag: "Multipliziere aus und fasse zusammen.", korrekt: "-3x+12",
    muster: ["-8x+12+5x", "-3x+12"], fehlerSchritt: "-8x-12+5x", fehlerStelle: "-12", fehlerRichtig: "+12", form: FORM_TERME,
    feedbackTypisch: "Das erste Produkt $(-4)\\cdot 2x = -8x$ stimmt. Beim zweiten gilt $(-4)\\cdot(-3) = +12$, nicht $-12$.",
    hinweise: ["Wie bekommt jeder Summand in der Klammer sein Vorzeichen, wenn du mit $-4$ multiplizierst?", "Minus mal Minus ergibt Plus.", "$-4(2x-3) = -8x+12$. Dann $-8x+5x$ zusammenfassen."] },
  { id: "vz-te-03", kontext: "terme", untertyp: "zusammenfassen", schwierigkeit: 2, art: "term",
    start: "(x+2)(x-5)", auftrag: "Multipliziere aus und fasse zusammen.", korrekt: "x^2-3x-10",
    muster: ["x^2-5x+2x-10", "x^2-3x-10"], fehlerSchritt: "x^2-5x+2x+10", fehlerStelle: "+10", fehlerRichtig: "-10", form: FORM_TERME,
    feedbackTypisch: "Das letzte Produkt ist $2\\cdot(-5) = -10$ (Plus mal Minus ergibt Minus), nicht $+10$.",
    hinweise: ["Multipliziere jeden Term der ersten Klammer mit jedem Term der zweiten. Welches Vorzeichen hat $2\\cdot(-5)$?", "Plus mal Minus ergibt Minus.", "$x\\cdot x = x^2$, $x\\cdot(-5) = -5x$, $2\\cdot x = 2x$, $2\\cdot(-5) = -10$. Dann $-5x+2x$ zusammenfassen."] },
  { id: "vz-te-04", kontext: "terme", untertyp: "zusammenfassen", schwierigkeit: 3, art: "term",
    start: "(3x-2)(x+4)-x^2", auftrag: "Multipliziere aus und fasse zusammen.", korrekt: "2x^2+10x-8",
    muster: ["3x^2+12x-2x-8-x^2", "2x^2+10x-8"], fehlerSchritt: "3x^2+12x-2x+8-x^2", fehlerStelle: "+8", fehlerRichtig: "-8", form: FORM_TERME,
    feedbackTypisch: "Das Produkt $(-2)\\cdot 4$ ist $-8$ (Minus mal Plus ergibt Minus), nicht $+8$.",
    hinweise: ["Welche vier Produkte entstehen beim Ausmultiplizieren, und welches Vorzeichen hat $(-2)\\cdot 4$?", "Minus mal Plus ergibt Minus.", "$3x\\cdot x = 3x^2$, $3x\\cdot 4 = 12x$, $-2\\cdot x = -2x$, $-2\\cdot 4 = -8$. Danach $-x^2$ nicht vergessen und zusammenfassen."] },

  /* ---------- Ableiten ---------- */
  { id: "vz-ab-01", kontext: "ableiten", untertyp: "ableiten", schwierigkeit: 1, art: "ableitung",
    start: "-3x^2+5x", auftrag: "Bilde die Ableitung.", korrekt: "-6x+5",
    muster: ["-6x+5"], fehlerSchritt: "6x+5", fehlerStelle: "6x", fehlerRichtig: "-6x", form: FORM_KLAMMER,
    feedbackTypisch: "Das Minus vor $3x^2$ bleibt beim Ableiten erhalten: $(-3x^2)' = -6x$. Hier ist es verloren gegangen.",
    hinweise: ["Welches Vorzeichen hat der Summand $-3x^2$ – und ändert das Ableiten daran etwas?", "Das Vorzeichen eines Summanden bleibt beim Ableiten erhalten: $(-a \\cdot x^{n})' = -a \\cdot n \\cdot x^{n-1}$.", "$(-3x^2)' = -3\\cdot 2x = -6x$ und $(5x)' = 5$."] },
  { id: "vz-ab-02", kontext: "ableiten", untertyp: "ableiten", schwierigkeit: 2, art: "ableitung",
    start: "2x^3-4x^2+x", auftrag: "Bilde die Ableitung.", korrekt: "6x^2-8x+1",
    muster: ["6x^2-8x+1"], fehlerSchritt: "6x^2+8x+1", fehlerStelle: "+8x", fehlerRichtig: "-8x", form: FORM_KLAMMER,
    feedbackTypisch: "Der Summand $-4x^2$ behält beim Ableiten sein Minus: $(-4x^2)' = -8x$.",
    hinweise: ["Leite jeden der drei Summanden einzeln ab. Welches Vorzeichen hat der mittlere?", "Das Vorzeichen eines Summanden bleibt beim Ableiten erhalten.", "$(2x^3)' = 6x^2$, $(-4x^2)' = -8x$, $(x)' = 1$."] },
  { id: "vz-ab-03", kontext: "ableiten", untertyp: "ableiten", schwierigkeit: 2, art: "ableitung",
    start: "7x-(x^2+4x)", auftrag: "Bilde die Ableitung.", korrekt: "-2x+3",
    muster: ["7-2x-4", "-2x+3"], fehlerSchritt: "7-2x+4", fehlerStelle: "+4", fehlerRichtig: "-4", form: FORM_KLAMMER,
    feedbackTypisch: "Das Minus vor der Klammer wirkt auf die Ableitung jedes Summanden: $-(x^2+4x)' = -(2x+4) = -2x-4$. Die $4$ hat ihr Minus verloren.",
    hinweise: ["Leite die Klammer ab. Was bewirkt das Minus davor bei jedem Summanden der Ableitung?", "Minus vor der Klammer: Jedes Vorzeichen in der abgeleiteten Klammer wird umgedreht.", "$(7x)' = 7$ und $-(x^2+4x)' = -(2x+4) = -2x-4$. Dann $7-4$ zusammenfassen."] },
  { id: "vz-ab-04", kontext: "ableiten", untertyp: "ableiten", schwierigkeit: 3, art: "ableitung",
    start: "-(x^3-2x^2)+6x", auftrag: "Bilde die Ableitung.", korrekt: "-3x^2+4x+6",
    muster: ["-3x^2+4x+6"], fehlerSchritt: "-3x^2-4x+6", fehlerStelle: "-4x", fehlerRichtig: "+4x", form: FORM_KLAMMER,
    feedbackTypisch: "In der Klammer steht $-2x^2$ und davor noch ein Minus: $-(-2x^2) = +2x^2$, abgeleitet $+4x$.",
    hinweise: ["Löse zuerst das Minus vor der Klammer auf, bevor du ableitest. Wie lautet $f$ dann?", "Minus mal Minus ergibt Plus: $-(-2x^2) = +2x^2$.", "$f(x) = -x^3+2x^2+6x$. Leite jeden Summanden einzeln ab."] },

  /* ---------- Äquivalenzumformungen ---------- */
  { id: "vz-um-01", kontext: "umformung", untertyp: "umstellen", schwierigkeit: 1, art: "gleichung",
    start: "3x-7=5x+1", auftrag: "Bringe alle Terme mit $x$ nach links und alle Zahlen nach rechts. Gib die umgeformte Gleichung ein.", korrekt: "x=-4",
    muster: ["3x-5x=1+7", "-2x=8", "x=-4"], fehlerSchritt: "3x-5x=1-7", fehlerStelle: "1-7", fehlerRichtig: "1+7", form: FORM_UMFORMUNG,
    feedbackTypisch: "Die $-7$ wechselt die Seite und wird dabei zu $+7$. Hier ist sie als $-7$ stehen geblieben.",
    hinweise: ["Welche Rechnung musst du auf beiden Seiten ausführen, damit die $-7$ links verschwindet?", "Addierst du auf beiden Seiten $7$, steht rechts $1+7$.", "Subtrahiere $5x$ und addiere $7$: $3x-5x = 1+7$."] },
  { id: "vz-um-02", kontext: "umformung", untertyp: "umstellen", schwierigkeit: 1, art: "gleichung",
    start: "4x+9=x-3", auftrag: "Bringe alle Terme mit $x$ nach links und alle Zahlen nach rechts. Gib die umgeformte Gleichung ein.", korrekt: "x=-4",
    muster: ["4x-x=-3-9", "3x=-12", "x=-4"], fehlerSchritt: "4x-x=-3+9", fehlerStelle: "-3+9", fehlerRichtig: "-3-9", form: FORM_UMFORMUNG,
    feedbackTypisch: "Die $+9$ wechselt die Seite und wird dabei zu $-9$. Hier ist sie als $+9$ stehen geblieben.",
    hinweise: ["Welche Rechnung machst du auf beiden Seiten, damit die $+9$ links verschwindet?", "Subtrahierst du auf beiden Seiten $9$, steht rechts $-3-9$.", "Subtrahiere $x$ und $9$: $4x-x = -3-9$."] },
  { id: "vz-um-03", kontext: "umformung", untertyp: "umstellen", schwierigkeit: 2, art: "gleichung",
    start: "-2x+5=3x-10", auftrag: "Bringe alle Terme mit $x$ nach links und alle Zahlen nach rechts. Gib die umgeformte Gleichung ein.", korrekt: "x=3",
    muster: ["-2x-3x=-10-5", "-5x=-15", "x=3"], fehlerSchritt: "-2x+3x=-10-5", fehlerStelle: "+3x", fehlerRichtig: "-3x", form: FORM_UMFORMUNG,
    feedbackTypisch: "Der Term $3x$ steht rechts mit Plus. Beim Wechsel nach links wird er zu $-3x$ – hier ist das Plus stehen geblieben.",
    hinweise: ["Was musst du auf beiden Seiten rechnen, damit $3x$ rechts verschwindet?", "Subtrahierst du auf beiden Seiten $3x$, steht links $-2x-3x$.", "Subtrahiere $3x$ und $5$: $-2x-3x = -10-5$."] },
  { id: "vz-um-04", kontext: "umformung", untertyp: "umstellen", schwierigkeit: 2, art: "gleichung",
    start: "6-2x=4x-12", auftrag: "Bringe alle Terme mit $x$ nach links und alle Zahlen nach rechts. Gib die umgeformte Gleichung ein.", korrekt: "x=3",
    muster: ["-2x-4x=-12-6", "-6x=-18", "x=3"], fehlerSchritt: "-2x-4x=-12+6", fehlerStelle: "-12+6", fehlerRichtig: "-12-6", form: FORM_UMFORMUNG,
    feedbackTypisch: "Die $+6$ steht links und wechselt nach rechts. Dort wird sie zu $-6$ – hier ist sie als $+6$ stehen geblieben.",
    hinweise: ["Was rechnest du auf beiden Seiten, damit die $6$ links verschwindet?", "Subtrahierst du auf beiden Seiten $6$, steht rechts $-12-6$.", "Subtrahiere $4x$ und $6$: $-2x-4x = -12-6$."] },
];

/* Register: Fehlertyp → Aufgaben. Weitere Fehlertypen kommen hier hinzu, sobald sie geprüfte Aufgaben haben. */
export const AUFGABEN = { vorzeichen: AUFGABEN_VORZEICHEN };
export const hatTraining = (typ) => Array.isArray(AUFGABEN[typ]) && AUFGABEN[typ].length >= 3;
export const aufgabeVon = (id) => Object.values(AUFGABEN).flat().find((a) => a.id === id) || null;

/* ======================================================================
   Eingabe lesen und bewerten
   ====================================================================== */
const PRAEFIX = /^\s*(f\s*['′’]?\s*\(\s*x\s*\)|y\s*['′’]?)\s*=/i;

/* Rohtext der Person → bereinigte Maschinenschreibweise (oder null, wenn leer) */
export function eingabeBereinigen(a, roh) {
  let t = String(roh ?? "").trim();
  if (!t) return null;
  if (a.art === "ableitung") t = t.replace(PRAEFIX, "");
  if (a.art !== "gleichung" && t.includes("=")) t = t.split("=").pop();   // Rechenkette „… = …“: zählt das Ende
  return t.trim() || null;
}

const hatKlammern = (t) => /[()]/.test(normalisiere(t));

/* Hat ein Polynom (ohne Klammern) mehrere Terme gleichen Grades? Dann ist es nicht zusammengefasst. */
function nichtZusammengefasst(t) {
  const s = normalisiere(t);
  if (/[()*/]/.test(s)) return true;
  const terme = s.match(/[+-]?[^+-]+/g) || [];
  const grade = terme.map((x) => (x.includes("x") ? (/x\^(\d+)/.exec(x)?.[1] ? Number(/x\^(\d+)/.exec(x)[1]) : 1) : 0));
  return new Set(grade).size !== grade.length;
}

/* Gleichung mit allen x-Termen links und nur Zahlen rechts? */
function variablenLinks(t) {
  const g = parseGleichung(t);
  if (!g) return false;
  const links0 = g.l[0]?.z === 0;               // links keine Zahl übrig
  const rechtsZahl = g.r.length === 1;          // rechts kein x
  const linksHatX = g.l.length > 1;
  return links0 && rechtsZahl && linksHatX;
}

/* Verletzte Formregel der Antwort oder null */
export function formVerletzt(a, text) {
  for (const regel of a.form || []) {
    if (regel === "gleichung" && !String(text).includes("=")) return "gleichung";
    if (regel === "ohneKlammern" && hatKlammern(text)) return "ohneKlammern";
    if (regel === "zusammengefasst" && !String(text).includes("=") && nichtZusammengefasst(text)) return "zusammengefasst";
    if (regel === "variablenLinks" && String(text).includes("=") && !variablenLinks(text)) return "variablenLinks";
  }
  return null;
}
const FORM_TEXT = {
  gleichung: "Gib die ganze Gleichung mit „=“ ein, zum Beispiel $3x = 5$.",
  ohneKlammern: "Der Wert stimmt, aber du sollst die Klammern auflösen – in deiner Antwort stehen noch Klammern.",
  zusammengefasst: "Der Wert stimmt, aber du sollst auch zusammenfassen: gleichartige Terme (zum Beispiel alle mit $x$) müssen in einem Term stehen.",
  variablenLinks: "Der Wert stimmt, aber alle Terme mit $x$ sollen links und alle Zahlen rechts vom Gleichheitszeichen stehen.",
};

/* Weicht die Antwort NUR in Vorzeichen von einer richtigen Zeile ab? (gleiche Beträge, nicht gleichwertig) */
function nurVorzeichenAbweichung(a, text) {
  const ziele = [a.korrekt, ...a.muster];
  return ziele.some((z) => aequivalent(z, text) === false && betragsAtome(z) === betragsAtome(text));
}

/* → { art: "leer" | "unlesbar" | "richtig" | "form" | "typisch" | "vorzeichen" | "falsch", text, zaehlt }
   zaehlt: ob die Eingabe als Versuch gewertet wird. Leere oder nicht lesbare Eingaben sind KEIN Rechenfehler. */
export function bewerte(a, roh) {
  const t = eingabeBereinigen(a, roh);
  if (t == null) return { art: "leer", zaehlt: false, text: "Bitte gib zuerst deine Lösung ein." };
  const gleichung = a.art === "gleichung";
  const wirdGleichung = t.includes("=");
  if (gleichung && !wirdGleichung) return { art: "unlesbar", zaehlt: false, text: FORM_TEXT.gleichung };
  const lesbar = gleichung ? !!parseGleichung(t) : !wirdGleichung && !!parsePoly(t);
  if (!lesbar) {
    return { art: "unlesbar", zaehlt: false, text: "Das konnte ich nicht als Term lesen. Erlaubt sind Zahlen, $x$, $+$, $-$, $\\cdot$, Klammern und Potenzen wie $x^2$." };
  }
  const gleich = aequivalent(a.korrekt, t);
  if (gleich === null) return { art: "unlesbar", zaehlt: false, text: "Das konnte ich nicht prüfen. Gib die Antwort bitte als Term bzw. als Gleichung in $x$ ein." };
  if (gleich) {
    const v = formVerletzt(a, t);
    return v ? { art: "form", zaehlt: true, text: FORM_TEXT[v] } : { art: "richtig", zaehlt: true, text: "Richtig." };
  }
  if (aequivalent(a.fehlerSchritt, t) === true) return { art: "typisch", zaehlt: true, text: a.feedbackTypisch };
  if (nurVorzeichenAbweichung(a, t)) return { art: "vorzeichen", zaehlt: true, text: VORZEICHEN_GENERISCH[a.untertyp] };
  return { art: "falsch", zaehlt: true, text: "Das stimmt noch nicht – und es ist mehr als nur ein Vorzeichen anders. Gehe die Rechnung Zeile für Zeile durch oder öffne einen Hinweis." };
}

/* Hilfestufen 1–3 (Denkfrage, Regel, nächster Schritt). Die Lösung selbst steht in loesungsWeg(). */
export function hilfeText(a, stufe) {
  return a.hinweise[Math.min(Math.max(Number(stufe) || 1, 1), 3) - 1];
}

/* Musterweg zum Anzeigen: Zeilen als Formeln, dazu die Fehlerstelle erklärt */
export function loesungsWeg(a) {
  return {
    zeilen: [a.start, ...a.muster].map(tex),
    fehlerSchritt: tex(a.fehlerSchritt),
    fehlerStelle: tex(a.fehlerStelle),
    fehlerRichtig: tex(a.fehlerRichtig),
    erklaerung: a.feedbackTypisch,
    regel: REGEL_JE_UNTERTYP[a.untertyp],
  };
}
