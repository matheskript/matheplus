/* ======================================================================
   gleichKurs.js – Bereich „Gleichungen“ (Verstehen · Auto · Üben · Lernen)
   Rein, ohne React, mit Node testbar (tests/gleichKurs.test.mjs,
   tests/gleichUeben.test.mjs).

   Leitidee: Rechnen heißt, aus bekannten Zahlen eine neue zu machen
   (7 · 8 → 56). Eine Gleichung ist eine Information über eine unbekannte
   Zahl (7 · x = 56) – lösen heißt, diese Zahl zu finden (x = 8).

   Sieben Stufen von „eine Rechnung, eine Lücke“ bis „x im Exponenten“.
   Jede Aufgabe trägt
     info       die Information über die Zahl in Worten (de/en)
     zeilen     die Rechnung Zeile für Zeile { l, r, op } (TeX); op ist die
                Umformung, die zur nächsten Zeile führt
     loesungen  alle Lösungen (ganzzahlig)
     kette      (wo x nur einmal vorkommt) die Rechenkette vorwärts
     fallen     typische falsche Ergebnisse mit Fehlerart
     probe      Probe je Lösung (TeX, links und rechts ausgerechnet)
   Jede Umformung (op) bringt eigene Auswahl-Möglichkeiten mit: die richtige
   und zwei typische Fehlgriffe mit Erklärung. Der Modus „Üben“ zeigt sie als
   goldene Karten (uebenSchritte → uebenKern.uebenSchritt, Oberfläche
   funcUebenWahl.jsx); „Auto“ zeigt die ganze Rechnung; „Lernen“ (früher
   Training) lässt nur das Ergebnis tippen.

   Lernstand: LERN.training.gleich = { stufen: { s1: {...} }, fehler, runden, … }
   Regel A5: keine Zeile endet unvereinfacht (kein 1x, + −, + 0, ^1 …).
   ====================================================================== */

import { uebenSchritt } from "./uebenKern.js";

export const TAG_MS = 86400000;
const t = (de, en) => ({ de, en });

/* ---------------------------------------------------------------- Zufall */
export const zufall = (rng = Math.random) => ({
  zz: (a, b) => a + Math.floor(rng() * (b - a + 1)),
  ohne0: (a, b) => { let v; do { v = a + Math.floor(rng() * (b - a + 1)); } while (v === 0); return v; },
  wahl: (arr) => arr[Math.floor(rng() * arr.length)],
  ja: (p = 0.5) => rng() < p,
});
export const mischen = (arr, rng = Math.random) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
const kgV = (a, b) => Math.abs(a * b) / ggT(a, b);

/* ---------------------------------------------------------------- Schreibweise (A5) */
export const Z = (v) => String(v).replace(/-/g, "−");                         // Zahl mit echtem Minus
export const par = (v) => (v < 0 ? `(${Z(v)})` : Z(v));                        // negative Zahl in Klammern (Probe)
export const kx = (c, v = "x") => (c === 1 ? v : c === -1 ? `−${v}` : `${Z(c)}${v}`);   // 3x, x, −x
export const pl = (b) => (b < 0 ? `− ${-b}` : `+ ${b}`);                        // „+ 3“ / „− 3“
export const plKx = (c, v = "x") => (c < 0 ? `− ${kx(-c, v)}` : `+ ${kx(c, v)}`);
/* c·x + d als Seite (ohne „+ 0“, ohne „0x“) */
export const seite = (c, d, v = "x") => {
  const teile = [];
  if (c !== 0) teile.push(kx(c, v));
  if (d !== 0) teile.push(teile.length ? pl(d) : Z(d));
  return teile.join(" ") || "0";
};
const wortPlus = (b, en) => (b < 0 ? (en ? `minus ${-b}` : `minus ${-b}`) : (en ? `plus ${b}` : `plus ${b}`));
const dazu = (b, en) => (en ? (b < 0 ? `${-b} is subtracted` : `${b} is added`)
  : b < 0 ? (b === -1 ? "wird 1 abgezogen" : `werden ${-b} abgezogen`) : (b === 1 ? "kommt 1 dazu" : `kommen ${b} dazu`));
const ZAHLWORT = { 2: ["Zweien", "twos"], 3: ["Dreien", "threes"], 5: ["Fünfen", "fives"], 10: ["Zehnen", "tens"] };
const malWort = (a, en) => (en ? `${a} times` : `${a}-mal`);

/* ---------------------------------------------------------------- Umformungen */
/* Jede Umformung hat: kurz (TeX am Rand, z. B. „− 5“), lang (Satz), und erzeugt
   Auswahl-Möglichkeiten mit einer richtigen und zwei Fehlgriffen. */
export const OP = {
  plus: (k) => ({ art: "plus", k, kurz: k < 0 ? `− ${-k}` : `+ ${k}`,
    lang: t(`Auf beiden Seiten ${k < 0 ? `${-k} abziehen` : `${k} addieren`}`, `${k < 0 ? `Subtract ${-k} from` : `Add ${k} to`} both sides`) }),
  mal: (k) => ({ art: "mal", k, kurz: `· ${Z(k)}`, lang: t(`Beide Seiten mit ${Z(k)} malnehmen`, `Multiply both sides by ${Z(k)}`) }),
  geteilt: (k) => ({ art: "geteilt", k, kurz: `: ${par(k)}`, lang: t(`Beide Seiten durch ${Z(k)} teilen`, `Divide both sides by ${Z(k)}`) }),
  minusx: (c) => ({ art: "minusx", k: c, kurz: c < 0 ? `+ ${kx(-c)}` : `− ${kx(c)}`,
    lang: c < 0 ? t(`Auf beiden Seiten ${kx(-c)} addieren`, `Add ${kx(-c)} to both sides`) : t(`Auf beiden Seiten ${kx(c)} abziehen`, `Subtract ${kx(c)} from both sides`) }),
  klammer: (a) => ({ art: "klammer", k: a, kurz: t("ausmultiplizieren", "expand"), lang: t("Klammer ausmultiplizieren", "Expand the bracket") }),
  zusammen: () => ({ art: "zusammen", kurz: t("zusammenfassen", "combine"), lang: t("Gleichartige Glieder zusammenfassen", "Combine like terms") }),
  wurzel: () => ({ art: "wurzel", kurz: "\\sqrt{\\;}", lang: t("Wurzel ziehen – beide Vorzeichen", "Take the square root – both signs") }),
  quadrieren: () => ({ art: "quadrieren", kurz: "(\\;)^{2}", lang: t("Beide Seiten quadrieren", "Square both sides") }),
  potenz: (b, n) => ({ art: "potenz", k: b, n, kurz: t(`als ${b}er-Potenz`, `as a power of ${b}`), lang: t(`Rechte Seite als Potenz von ${b} schreiben`, `Write the right side as a power of ${b}`) }),
  vergleich: () => ({ art: "vergleich", auto: true, kurz: t("Exponenten vergleichen", "compare exponents"), lang: t("Exponenten vergleichen", "Compare the exponents") }),
};

/* Fehlgriffe je Umformung (zwei je Schritt). kontext: Zusatzangaben aus der Aufgabe */
function fehlgriffe(op, kontext = {}) {
  const { art, k } = op;
  if (art === "plus") return [
    { art: "vorzeichen", lang: t(`Auf beiden Seiten ${k < 0 ? `${-k} addieren` : `${k} abziehen`}`, `${k < 0 ? `Add ${-k} to` : `Subtract ${k} from`} both sides`),
      warum: t(`Das ist erlaubt, macht es aber schlimmer: Links steht dann ${k < 0 ? `− ${2 * -k}` : `+ ${2 * k}`} statt nichts. Die Umkehrung von ${Z(-k)} ist ${Z(k)}.`, `Allowed, but it makes things worse: the left side then has ${k < 0 ? `− ${2 * -k}` : `+ ${2 * k}`} instead of nothing. The inverse of ${Z(-k)} is ${Z(k)}.`) },
    { art: "eineSeite", lang: t(`Nur links ${k < 0 ? `${-k} abziehen` : `${k} addieren`}`, `${k < 0 ? `Subtract ${-k}` : `Add ${k}`} on the left only`),
      warum: t("Dann stimmt die Gleichung nicht mehr. Was du links tust, musst du auch rechts tun – wie bei einer Waage.", "Then the equation is no longer true. Whatever you do on the left, you must do on the right – like a balance.") },
  ];
  if (art === "geteilt") return [
    { art: "umkehr", lang: t(`Beide Seiten mit ${Z(k)} malnehmen`, `Multiply both sides by ${Z(k)}`),
      warum: t(`x wird mit ${Z(k)} malgenommen. Die Umkehrung von „mal“ ist „geteilt“.`, `x is multiplied by ${Z(k)}. The inverse of “times” is “divide”.`) },
    { art: "operation", lang: t(`Auf beiden Seiten ${Z(k)} abziehen`, `Subtract ${Z(k)} from both sides`),
      warum: t(`Zwischen ${Z(k)} und x steht ein Mal, kein Plus. ${kx(k)} heißt ${Z(k)} · x.`, `Between ${Z(k)} and x there is a times, not a plus. ${kx(k)} means ${Z(k)} · x.`) },
  ];
  if (art === "mal") return [
    { art: "umkehr", lang: t(`Beide Seiten durch ${Z(k)} teilen`, `Divide both sides by ${Z(k)}`),
      warum: t(`Hier wird durch ${Z(k)} geteilt. Die Umkehrung von „geteilt“ ist „mal“.`, `Here the number is divided by ${Z(k)}. The inverse of “divide” is “times”.`) },
    kontext.hauptnenner
      ? { art: "nenner", lang: t(`Beide Seiten mit ${kontext.einNenner} malnehmen`, `Multiply both sides by ${kontext.einNenner}`),
        warum: t(`Damit fällt nur ein Nenner weg. Nimm den Hauptnenner ${k}: Er ist durch beide Nenner teilbar.`, `That removes only one denominator. Use the common denominator ${k}: it is divisible by both.`) }
      : { art: "operation", lang: t(`Auf beiden Seiten ${Z(k)} addieren`, `Add ${Z(k)} to both sides`),
        warum: t("Der Bruchstrich bedeutet „geteilt“. Plus hebt ihn nicht auf.", "The fraction bar means “divided by”. Adding does not undo it.") },
  ];
  if (art === "minusx") return [
    { art: "vorzeichen", lang: k < 0 ? t(`Auf beiden Seiten ${kx(-k)} abziehen`, `Subtract ${kx(-k)} from both sides`) : t(`Auf beiden Seiten ${kx(k)} addieren`, `Add ${kx(k)} to both sides`),
      warum: t("Erlaubt, aber dann hast du rechts noch mehr x. Du willst das x rechts loswerden.", "Allowed, but then you have even more x on the right. You want to get rid of the x on the right.") },
    { art: "durchX", lang: t("Beide Seiten durch x teilen", "Divide both sides by x"),
      warum: t("Durch x zu teilen ist gefährlich: x könnte 0 sein. Außerdem verschwindet das x dadurch nicht.", "Dividing by x is risky: x could be 0. And it does not make the x disappear.") },
  ];
  if (art === "klammer") return [
    { art: "klammer", lang: t(`Nur x mit ${k} malnehmen: ${kx(k)} ${pl(kontext.b)}`, `Multiply only x by ${k}: ${kx(k)} ${pl(kontext.b)}`),
      warum: t(`Die ${k} vor der Klammer gilt für alles in der Klammer: ${k} · x und ${k} · ${par(kontext.b)}.`, `The ${k} in front of the bracket applies to everything inside: ${k} · x and ${k} · ${par(kontext.b)}.`) },
    { art: "unterKlammer", lang: t(`Auf beiden Seiten ${Z(kontext.b)} abziehen`, `Subtract ${Z(kontext.b)} from both sides`),
      warum: t(`Die ${Z(kontext.b)} steckt in der Klammer und wird noch mit ${k} malgenommen. Erst die Klammer auflösen.`, `The ${Z(kontext.b)} is inside the bracket and still multiplied by ${k}. Expand first.`) },
  ];
  if (art === "zusammen") return [
    { art: "zusammenfassen", lang: t(`Malnehmen: ${kx(kontext.u * kontext.v)}`, `Multiply: ${kx(kontext.u * kontext.v)}`),
      warum: t(`Gleichartige Glieder addierst du: ${kx(kontext.u)} + ${kx(kontext.v)} = ${kx(kontext.u + kontext.v)}.`, `Like terms are added: ${kx(kontext.u)} + ${kx(kontext.v)} = ${kx(kontext.u + kontext.v)}.`) },
    { art: "durchX", lang: t("Beide Seiten durch x teilen", "Divide both sides by x"),
      warum: t("Dann stehen links nur noch Zahlen – aber das x ist nicht gefunden. Erst zusammenfassen.", "Then only numbers are left on the left – but x is not found. Combine first.") },
  ];
  if (art === "wurzel") return [
    { art: "einLoesung", lang: t("Wurzel ziehen – nur die positive Zahl", "Take the square root – positive number only"),
      warum: t(`Auch die negative Zahl passt: (−${kontext.w})² = ${kontext.w * kontext.w}. Es gibt zwei Zahlen.`, `The negative number works too: (−${kontext.w})² = ${kontext.w * kontext.w}. There are two numbers.`) },
    { art: "halbieren", lang: t("Beide Seiten durch 2 teilen", "Divide both sides by 2"),
      warum: t("Das Quadrat heißt x · x, nicht 2 · x. Die Umkehrung des Quadrierens ist das Wurzelziehen.", "Squaring means x · x, not 2 · x. The inverse of squaring is taking the root.") },
  ];
  if (art === "quadrieren") return [
    { art: "halbieren", lang: t("Beide Seiten mit 2 malnehmen", "Multiply both sides by 2"),
      warum: t("Die Wurzel ist keine Halbierung. Die Umkehrung der Wurzel ist das Quadrieren.", "The root is not halving. The inverse of the root is squaring.") },
    kontext.a !== undefined
      ? { art: "unterWurzel", lang: t(`Auf beiden Seiten ${Z(kontext.a)} abziehen`, `Subtract ${Z(kontext.a)} from both sides`),
        warum: t(`Die ${Z(kontext.a)} steht unter der Wurzel. Erst die Wurzel auflösen, dann kommst du an sie heran.`, `The ${Z(kontext.a)} is under the root. Undo the root first, then you can reach it.`) }
      : { art: "einLoesung", lang: t("Wurzel ziehen", "Take the square root"),
        warum: t("Die Wurzel steht schon da. Du brauchst die Umkehrung: Quadrieren.", "The root is already there. You need the inverse: squaring.") },
  ];
  if (art === "potenz") return [
    { art: "exponent", lang: t(`Beide Seiten durch ${k} teilen`, `Divide both sides by ${k}`),
      warum: t(`x steht im Exponenten, nicht als Faktor: ${k}^x heißt ${k} · ${k} · … (x-mal).`, `x is in the exponent, not a factor: ${k}^x means ${k} · ${k} · … (x times).`) },
    { art: "halbieren", lang: t("Wurzel ziehen", "Take the square root"),
      warum: t("Die Wurzel holt keinen Exponenten herunter. Schreib die Zahl als Potenz derselben Basis und vergleiche.", "A root does not bring the exponent down. Write the number as a power of the same base and compare.") },
  ];
  return [];
}

/* Auswahl für einen Schritt: richtige Umformung + zwei Fehlgriffe, gemischt */
export function auswahlFuer(op, kontext = {}, rng = Math.random) {
  if (op.auto) return [];
  const richtig = { key: "r", richtig: true, art: null, lang: op.lang, warum: null };
  const falsch = fehlgriffe(op, kontext).map((f, i) => ({ key: `f${i + 1}`, richtig: false, art: f.art, lang: f.lang, warum: f.warum }));
  return mischen([richtig, ...falsch], rng);
}

/* ---------------------------------------------------------------- Stufen */
export const STUFEN = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];
export const STUFE_INFO = {
  s1: { nr: 1, zeichen: "7x", titel: t("Eine Rechnung, eine Lücke", "One operation, one gap"), kurz: t("7 · x = 56 · x + 9 = 15 – ein Schritt rückwärts", "7 · x = 56 · x + 9 = 15 – one step backwards"), beispiel: "7x = 56" },
  s2: { nr: 2, zeichen: "3x+5", titel: t("Zwei Schritte", "Two steps"), kurz: t("3x + 5 = 26 – die Rechenkette rückwärts gehen", "3x + 5 = 26 – walk the chain backwards"), beispiel: "3x + 5 = 26" },
  s3: { nr: 3, zeichen: "x|x", titel: t("x auf beiden Seiten", "x on both sides"), kurz: t("5x − 4 = 2x + 11 – erst die x auf eine Seite", "5x − 4 = 2x + 11 – first gather the x"), beispiel: "5x − 4 = 2x + 11" },
  s4: { nr: 4, zeichen: "a(x)", titel: t("Mit Klammern", "With brackets"), kurz: t("3(x + 2) = x + 14 – Klammer auflösen, dann sortieren", "3(x + 2) = x + 14 – expand, then sort"), beispiel: "3(x + 2) = x + 14" },
  s5: { nr: 5, zeichen: "x/a", titel: t("Mit Brüchen", "With fractions"), kurz: t("Nenner loswerden, dann wie gewohnt", "Clear the denominators, then as usual"), beispiel: "\\frac{x}{2} + \\frac{x}{3} = 10" },
  s6: { nr: 6, zeichen: "x²", titel: t("Zwei Zahlen passen", "Two numbers fit"), kurz: t("x² = 49 – plus und minus 7", "x² = 49 – plus and minus 7"), beispiel: "x^{2} = 49" },
  s7: { nr: 7, zeichen: "2ˣ", titel: t("x im Exponenten oder unter der Wurzel", "x in the exponent or under a root"), kurz: t("2^x = 32 · √x = 6 – die passende Umkehrung", "2^x = 32 · √x = 6 – the matching inverse"), beispiel: "2^{x} = 32" },
};
export const stufeNr = (s) => STUFE_INFO[s].nr;

let laufNr = 0;
const neueId = () => `g${Date.now().toString(36)}${(++laufNr).toString(36)}`;

/* Hilfen für Zeilen und Ketten */
const zeile = (l, r, op = null) => ({ l, r, op });
/* c · X + d für die Probe: „3 · (−2) + 5“, „(−2) + 5“, „3 · 4“ */
const probeSeite = (c, X, d) => {
  const vorne = c === 1 ? par(X) : `${Z(c)} · ${par(X)}`;
  return d === 0 ? vorne : `${vorne} ${pl(d)}`;
};
const TEIL = { 2: ["die Hälfte", "half"], 3: ["ein Drittel", "a third"], 4: ["ein Viertel", "a quarter"], 5: ["ein Fünftel", "a fifth"], 6: ["ein Sechstel", "a sixth"] };
const loesZeilen = (werte) => (werte.length === 1 ? [zeile("x", Z(werte[0]))] : [zeile("x_{1}", Z(werte[0])), zeile("x_{2}", Z(werte[1]))]);

/* ---------- Stufe 1: ein Schritt ---------- */
function stufe1(R, en) {
  const typ = R.wahl(["mal", "plus", "minus", "geteilt"]);
  if (typ === "mal") {
    const a = R.zz(2, 9), X = R.zz(2, 12), c = a * X;
    return { typ, gl: [`${kx(a)}`, `${c}`], loesungen: [X],
      info: t(`Eine Zahl mal ${a} ergibt ${c}.`, `A number times ${a} gives ${c}.`),
      zeilen: [zeile(kx(a), Z(c), OP.geteilt(a)), ...loesZeilen([X])],
      kette: { start: "x", schritte: [{ vor: `· ${a}`, rueck: `: ${a}`, wert: c }] },
      fallen: [{ wert: c * a, art: "umkehr" }, { wert: c - a, art: "operation" }],
      probe: [{ x: X, l: `${a} · ${X}`, wl: c, r: Z(c), wr: c }] };
  }
  if (typ === "plus") {
    const X = R.zz(2, 15), b = R.zz(2, 19), c = X + b;
    return { typ, gl: [`x + ${b}`, `${c}`], loesungen: [X],
      info: t(`Eine Zahl plus ${b} ergibt ${c}.`, `A number plus ${b} gives ${c}.`),
      zeilen: [zeile(`x + ${b}`, Z(c), OP.plus(-b)), ...loesZeilen([X])],
      kette: { start: "x", schritte: [{ vor: `+ ${b}`, rueck: `− ${b}`, wert: c }] },
      fallen: [{ wert: c + b, art: "vorzeichen" }],
      probe: [{ x: X, l: `${X} + ${b}`, wl: c, r: Z(c), wr: c }] };
  }
  if (typ === "minus") {
    const b = R.zz(2, 15), X = R.zz(b + 1, b + 15), c = X - b;
    return { typ, gl: [`x − ${b}`, `${c}`], loesungen: [X],
      info: t(`Eine Zahl minus ${b} ergibt ${c}.`, `A number minus ${b} gives ${c}.`),
      zeilen: [zeile(`x − ${b}`, Z(c), OP.plus(b)), ...loesZeilen([X])],
      kette: { start: "x", schritte: [{ vor: `− ${b}`, rueck: `+ ${b}`, wert: c }] },
      fallen: [{ wert: c - b, art: "vorzeichen" }],
      probe: [{ x: X, l: `${X} − ${b}`, wl: c, r: Z(c), wr: c }] };
  }
  const a = R.zz(2, 9), c = R.zz(2, 12), X = a * c;
  return { typ: "geteilt", gl: [`\\frac{x}{${a}}`, `${c}`], loesungen: [X],
    info: t(`Eine Zahl geteilt durch ${a} ergibt ${c}.`, `A number divided by ${a} gives ${c}.`),
    zeilen: [zeile(`\\frac{x}{${a}}`, Z(c), OP.mal(a)), ...loesZeilen([X])],
    kette: { start: "x", schritte: [{ vor: `: ${a}`, rueck: `· ${a}`, wert: c }] },
    fallen: [{ wert: c / a, art: "umkehr" }, { wert: c + a, art: "operation" }].filter((f) => Number.isInteger(f.wert)),
    probe: [{ x: X, l: `${X} : ${a}`, wl: c, r: Z(c), wr: c }] };
}

/* ---------- Stufe 2: zwei Schritte ---------- */
function stufe2(R) {
  const typ = R.wahl(["axb", "axb", "bruch"]);
  const X = R.ja(0.25) ? -R.zz(1, 6) : R.zz(1, 12);
  if (typ === "axb") {
    const a = R.zz(2, 9), b = R.ohne0(-15, 15), c = a * X + b;
    return { typ, gl: [`${kx(a)} ${pl(b)}`, Z(c)], loesungen: [X],
      info: t(`Eine Zahl wird mit ${a} malgenommen, dann ${dazu(b, false)}. Ergebnis: ${Z(c)}.`, `A number is multiplied by ${a}, then ${dazu(b, true)}. Result: ${Z(c)}.`),
      zeilen: [zeile(`${kx(a)} ${pl(b)}`, Z(c), OP.plus(-b)), zeile(kx(a), Z(c - b), OP.geteilt(a)), ...loesZeilen([X])],
      kette: { start: "x", schritte: [{ vor: `· ${a}`, rueck: `: ${a}`, wert: a * X }, { vor: pl(b), rueck: pl(-b), wert: c }] },
      fallen: [{ wert: (c + b) / a, art: "vorzeichen" }, { wert: c / a - b, art: "teilweise" }, { wert: c / a + b, art: "teilweise" }].filter((f) => Number.isInteger(f.wert) && f.wert !== X),
      probe: [{ x: X, l: `${a} · ${par(X)} ${pl(b)}`, wl: c, r: Z(c), wr: c }] };
  }
  const a = R.zz(2, 6), Y = R.ohne0(-5, 10), Xb = a * Y, b = R.ohne0(-12, 12), c = Y + b;
  return { typ, gl: [`\\frac{x}{${a}} ${pl(b)}`, Z(c)], loesungen: [Xb],
    info: t(`Eine Zahl wird durch ${a} geteilt, dann ${dazu(b, false)}. Ergebnis: ${Z(c)}.`, `A number is divided by ${a}, then ${dazu(b, true)}. Result: ${Z(c)}.`),
    zeilen: [zeile(`\\frac{x}{${a}} ${pl(b)}`, Z(c), OP.plus(-b)), zeile(`\\frac{x}{${a}}`, Z(Y), OP.mal(a)), ...loesZeilen([Xb])],
    kette: { start: "x", schritte: [{ vor: `: ${a}`, rueck: `· ${a}`, wert: Y }, { vor: pl(b), rueck: pl(-b), wert: c }] },
    fallen: [{ wert: (c + b) * a, art: "vorzeichen" }, { wert: c * a - b, art: "teilweise" }].filter((f) => f.wert !== Xb),
    probe: [{ x: Xb, l: `\\frac{${Z(Xb)}}{${a}} ${pl(b)}`, wl: c, r: Z(c), wr: c }] };
}

/* ---------- Stufe 3: x auf beiden Seiten ---------- */
function stufe3(R) {
  let a, b, c, d, X;
  do { a = R.zz(2, 9); c = R.zz(1, a - 1); X = R.ohne0(-8, 10); b = R.ohne0(-12, 12); d = a * X + b - c * X; } while (d === b || d === 0 || Math.abs(d) > 60);
  const k = a - c;
  const zeilen = [zeile(seite(a, b), seite(c, d), OP.minusx(c)), zeile(seite(k, b), Z(d), OP.plus(-b))];
  if (k === 1) zeilen.push(...loesZeilen([X]));
  else zeilen.push(zeile(kx(k), Z(d - b), OP.geteilt(k)), ...loesZeilen([X]));
  const zahlText = (m, en) => (m === 1 ? (en ? "the number" : "die Zahl") : `${malWort(m, en)} ${en ? "the number" : "die Zahl"}`);
  return { typ: "beide", gl: [seite(a, b), seite(c, d)], loesungen: [X],
    info: t(`${zahlText(a, false)} ${wortPlus(b, false)} ergibt dasselbe wie ${zahlText(c, false)} ${wortPlus(d, false)}.`.replace(/^./, (s) => s.toUpperCase()),
      `${zahlText(a, true)} ${wortPlus(b, true)} gives the same as ${zahlText(c, true)} ${wortPlus(d, true)}.`.replace(/^./, (s) => s.toUpperCase())),
    zeilen,
    fallen: [{ wert: (d - b) / (a + c), art: "vorzeichen" }, { wert: (d + b) / k, art: "vorzeichen" }].filter((f) => Number.isInteger(f.wert) && f.wert !== X),
    probe: [{ x: X, l: probeSeite(a, X, b), wl: a * X + b, r: probeSeite(c, X, d), wr: c * X + d }] };
}

/* ---------- Stufe 4: Klammern ---------- */
function stufe4(R) {
  let a, b, c, d, X;
  do { a = R.zz(2, 6); c = R.zz(1, a - 1); b = R.ohne0(-6, 6); X = R.ohne0(-6, 9); d = a * (X + b) - c * X; } while (d === a * b || Math.abs(d) > 60);
  const k = a - c, ab = a * b;
  const zeilen = [
    zeile(`${a}(x ${pl(b)})`, seite(c, d), OP.klammer(a)),
    zeile(seite(a, ab), seite(c, d), OP.minusx(c)),
    zeile(seite(k, ab), Z(d), OP.plus(-ab)),
  ];
  if (k === 1) zeilen.push(...loesZeilen([X]));
  else zeilen.push(zeile(kx(k), Z(d - ab), OP.geteilt(k)), ...loesZeilen([X]));
  return { typ: "klammer", gl: [`${a}(x ${pl(b)})`, seite(c, d)], loesungen: [X], kontext: { b },
    info: t(`Nimmt man die Zahl ${wortPlus(b, false)} und das Ganze mal ${a}, kommt dasselbe heraus wie bei ${c === 1 ? "der Zahl" : `${c}-mal der Zahl`} ${wortPlus(d, false)}.`,
      `Take the number ${wortPlus(b, true)} and multiply the whole by ${a}: you get the same as ${c === 1 ? "the number" : `${c} times the number`} ${wortPlus(d, true)}.`),
    zeilen,
    fallen: [{ wert: (d - b) / k, art: "klammer" }, { wert: (d - ab) / (a + c), art: "vorzeichen" }].filter((f) => Number.isInteger(f.wert) && f.wert !== X),
    probe: [{ x: X, l: `${a} · (${Z(X)} ${pl(b)})`, wl: a * (X + b), r: probeSeite(c, X, d), wr: c * X + d }] };
}

/* ---------- Stufe 5: Brüche ---------- */
function stufe5(R) {
  if (R.ja(0.5)) {
    let a, c, d, X, b;
    do { a = R.zz(1, 5); c = R.zz(2, 6); X = R.ohne0(-6, 10); d = R.ohne0(-8, 10); b = c * d - a * X; } while (b === 0 || Math.abs(b) > 30);
    const zeilen = [zeile(`\\frac{${seite(a, b)}}{${c}}`, Z(d), OP.mal(c)), zeile(seite(a, b), Z(c * d), OP.plus(-b))];
    if (a === 1) zeilen.push(...loesZeilen([X]));
    else zeilen.push(zeile(kx(a), Z(c * d - b), OP.geteilt(a)), ...loesZeilen([X]));
    return { typ: "bruchA", gl: [`\\frac{${seite(a, b)}}{${c}}`, Z(d)], loesungen: [X],
      info: t(`${a === 1 ? "Die Zahl" : `${a}-mal die Zahl`} ${wortPlus(b, false)}, das Ganze geteilt durch ${c}, ergibt ${Z(d)}.`, `${a === 1 ? "The number" : `${a} times the number`} ${wortPlus(b, true)}, all divided by ${c}, gives ${Z(d)}.`),
      zeilen,
      kette: { start: "x", schritte: [...(a === 1 ? [] : [{ vor: `· ${a}`, rueck: `: ${a}`, wert: a * X }]), { vor: pl(b), rueck: pl(-b), wert: a * X + b }, { vor: `: ${c}`, rueck: `· ${c}`, wert: d }] },
      fallen: [{ wert: (d - b) / a, art: "teilweise" }, { wert: (c * d + b) / a, art: "vorzeichen" }].filter((f) => Number.isInteger(f.wert) && f.wert !== X),
      probe: [{ x: X, l: `\\frac{${a === 1 ? Z(X) : `${a} · ${par(X)}`} ${pl(b)}}{${c}}`, wl: d, r: Z(d), wr: d }] };
  }
  let p, q;
  do { p = R.wahl([2, 3, 4, 5, 6]); q = R.wahl([2, 3, 4, 5, 6]); } while (p >= q || kgV(p, q) > 12);
  const L = kgV(p, q), m = R.ohne0(-2, 3), X = L * m, s = X / p + X / q, u = L / p, v = L / q;
  return { typ: "bruchB", gl: [`\\frac{x}{${p}} + \\frac{x}{${q}}`, Z(s)], loesungen: [X], kontext: { hauptnenner: true, einNenner: q === L ? p : q, u, v },
    info: t(`${TEIL[p][0].replace(/^./, (x) => x.toUpperCase())} einer Zahl und ${TEIL[q][0]} derselben Zahl ergeben zusammen ${Z(s)}.`,
      `${TEIL[p][1].replace(/^./, (x) => x.toUpperCase())} of a number plus ${TEIL[q][1]} of the same number make ${Z(s)}.`),
    zeilen: [
      zeile(`\\frac{x}{${p}} + \\frac{x}{${q}}`, Z(s), OP.mal(L)),
      zeile(`${kx(u)} + ${kx(v)}`, Z(L * s), OP.zusammen()),
      zeile(kx(u + v), Z(L * s), OP.geteilt(u + v)),
      ...loesZeilen([X]),
    ],
    fallen: [{ wert: s * p, art: "nenner" }, { wert: s * q, art: "nenner" }, { wert: (L * s) / (u * v), art: "zusammenfassen" }].filter((f) => Number.isInteger(f.wert) && f.wert !== X),
    probe: [{ x: X, l: `\\frac{${Z(X)}}{${p}} + \\frac{${Z(X)}}{${q}}`, wl: s, r: Z(s), wr: s }] };
}

/* ---------- Stufe 6: zwei Lösungen ---------- */
function stufe6(R) {
  const typ = R.wahl(["rein", "plus", "faktor", "binom"]);
  const w = R.zz(2, 12), q2 = w * w;
  if (typ === "rein") {
    return { typ, gl: ["x^{2}", Z(q2)], loesungen: [-w, w], kontext: { w },
      info: t(`Eine Zahl mit sich selbst malgenommen ergibt ${q2}.`, `A number multiplied by itself gives ${q2}.`),
      zeilen: [zeile("x^{2}", Z(q2), OP.wurzel()), ...loesZeilen([-w, w])],
      fallen: [{ wert: q2 / 2, art: "halbieren" }].filter((f) => Number.isInteger(f.wert)),
      probe: [{ x: -w, l: `(−${w})^{2}`, wl: q2, r: Z(q2), wr: q2 }, { x: w, l: `${w}^{2}`, wl: q2, r: Z(q2), wr: q2 }] };
  }
  if (typ === "plus") {
    const b = R.ohne0(-20, 20), c = q2 + b;
    return { typ, gl: [`x^{2} ${pl(b)}`, Z(c)], loesungen: [-w, w], kontext: { w },
      info: t(`Eine Zahl mit sich selbst malgenommen, ${b < 0 ? `dann ${-b} weniger` : `dann ${b} mehr`}: Ergebnis ${Z(c)}.`, `A number times itself, ${b < 0 ? `then ${-b} less` : `then ${b} more`}: result ${Z(c)}.`),
      zeilen: [zeile(`x^{2} ${pl(b)}`, Z(c), OP.plus(-b)), zeile("x^{2}", Z(q2), OP.wurzel()), ...loesZeilen([-w, w])],
      fallen: [],
      probe: [{ x: -w, l: `(−${w})^{2} ${pl(b)}`, wl: c, r: Z(c), wr: c }, { x: w, l: `${w}^{2} ${pl(b)}`, wl: c, r: Z(c), wr: c }] };
  }
  if (typ === "faktor") {
    const a = R.zz(2, 5), w2 = R.zz(2, 8), qq = w2 * w2, c = a * qq;
    return { typ, gl: [`${a}x^{2}`, Z(c)], loesungen: [-w2, w2], kontext: { w: w2 },
      info: t(`Das ${a}-Fache einer Quadratzahl ist ${c}. Welche Zahl wurde quadriert?`, `${a} times the square of a number is ${c}. Which number was squared?`),
      zeilen: [zeile(`${a}x^{2}`, Z(c), OP.geteilt(a)), zeile("x^{2}", Z(qq), OP.wurzel()), ...loesZeilen([-w2, w2])],
      fallen: [],
      probe: [{ x: -w2, l: `${a} · (−${w2})^{2}`, wl: c, r: Z(c), wr: c }, { x: w2, l: `${a} · ${w2}^{2}`, wl: c, r: Z(c), wr: c }] };
  }
  const a = R.ohne0(-6, 6), w3 = R.zz(1, 8), x1 = -a - w3, x2 = -a + w3;
  return { typ: "binom", gl: [`(x ${pl(a)})^{2}`, Z(w3 * w3)], loesungen: [x1, x2], kontext: { w: w3 },
    info: t(`Die Zahl ${wortPlus(a, false)}, mit sich selbst malgenommen, ergibt ${w3 * w3}.`, `The number ${wortPlus(a, true)}, multiplied by itself, gives ${w3 * w3}.`),
    zeilen: [zeile(`(x ${pl(a)})^{2}`, Z(w3 * w3), OP.wurzel()), zeile(`x ${pl(a)}`, `±${w3}`, OP.plus(-a)), ...loesZeilen([x1, x2])],
    fallen: [{ wert: w3 - a, art: "vorzeichen" }].filter((f) => f.wert !== x1 && f.wert !== x2),
    probe: [x1, x2].map((x) => ({ x, l: `(${Z(x)} ${pl(a)})^{2}`, wl: (x + a) ** 2, r: Z(w3 * w3), wr: w3 * w3 })) };
}

/* ---------- Stufe 7: Exponent und Wurzel ---------- */
const POT_MAX = { 2: 7, 3: 4, 5: 3, 10: 4 };
function stufe7(R) {
  const typ = R.wahl(["exp", "expFaktor", "wurzel", "wurzelPlus"]);
  if (typ === "exp" || typ === "expFaktor") {
    const b = R.wahl([2, 2, 3, 5, 10]), n = R.zz(2, POT_MAX[b]), wert = b ** n;
    if (typ === "exp") {
      return { typ, gl: [`${b}^{x}`, Z(wert)], loesungen: [n],
        info: t(`Nimmt man so viele ${ZAHLWORT[b][0]} miteinander mal, wie die Zahl sagt, kommt ${wert} heraus.`, `Multiply as many ${ZAHLWORT[b][1]} together as the number says, and you get ${wert}.`),
        zeilen: [zeile(`${b}^{x}`, Z(wert), OP.potenz(b, n)), zeile(`${b}^{x}`, `${b}^{${n}}`, OP.vergleich()), ...loesZeilen([n])],
        fallen: [{ wert: wert / b, art: "exponent" }].filter((f) => Number.isInteger(f.wert) && f.wert !== n),
        probe: [{ x: n, l: `${b}^{${n}}`, wl: wert, r: Z(wert), wr: wert }] };
    }
    const a = R.zz(2, 5), c = a * wert;
    return { typ, gl: [`${a} · ${b}^{x}`, Z(c)], loesungen: [n],
      info: t(`${a}-mal „${b} hoch die Zahl“ ergibt ${c}.`, `${a} times “${b} to the power of the number” gives ${c}.`),
      zeilen: [zeile(`${a} · ${b}^{x}`, Z(c), OP.geteilt(a)), zeile(`${b}^{x}`, Z(wert), OP.potenz(b, n)), zeile(`${b}^{x}`, `${b}^{${n}}`, OP.vergleich()), ...loesZeilen([n])],
      fallen: [{ wert: c / (a * b), art: "exponent" }].filter((f) => Number.isInteger(f.wert) && f.wert !== n),
      probe: [{ x: n, l: `${a} · ${b}^{${n}}`, wl: c, r: Z(c), wr: c }] };
  }
  if (typ === "wurzel") {
    const w = R.zz(2, 12);
    return { typ, gl: ["\\sqrt{x}", Z(w)], loesungen: [w * w],
      info: t(`Die Wurzel aus einer Zahl ist ${w}.`, `The square root of a number is ${w}.`),
      zeilen: [zeile("\\sqrt{x}", Z(w), OP.quadrieren()), ...loesZeilen([w * w])],
      kette: { start: "x", schritte: [{ vor: "\\sqrt{\\;}", rueck: "(\\;)^{2}", wert: w }] },
      fallen: [{ wert: 2 * w, art: "halbieren" }, { wert: w, art: "quadrieren" }],
      probe: [{ x: w * w, l: `\\sqrt{${w * w}}`, wl: w, r: Z(w), wr: w }] };
  }
  const w = R.zz(2, 9), a = R.ohne0(-12, 12), X = w * w - a;
  return { typ, gl: [`\\sqrt{x ${pl(a)}}`, Z(w)], loesungen: [X], kontext: { a },
    info: t(`Die Wurzel aus (Zahl ${wortPlus(a, false)}) ist ${w}.`, `The square root of (number ${wortPlus(a, true)}) is ${w}.`),
    zeilen: [zeile(`\\sqrt{x ${pl(a)}}`, Z(w), OP.quadrieren()), zeile(`x ${pl(a)}`, Z(w * w), OP.plus(-a)), ...loesZeilen([X])],
    kette: { start: "x", schritte: [{ vor: pl(a), rueck: pl(-a), wert: w * w }, { vor: "\\sqrt{\\;}", rueck: "(\\;)^{2}", wert: w }] },
    fallen: [{ wert: w - a, art: "quadrieren" }, { wert: w * w + a, art: "vorzeichen" }].filter((f) => f.wert !== X),
    probe: [{ x: X, l: `\\sqrt{${Z(X)} ${pl(a)}}`, wl: w, r: Z(w), wr: w }] };
}

const GEN = { s1: stufe1, s2: stufe2, s3: stufe3, s4: stufe4, s5: stufe5, s6: stufe6, s7: stufe7 };

/* Neue Aufgabe einer Stufe. Ergänzt jede Umformung um ihre Auswahl. */
export function neueAufgabe(stufe, { rng = Math.random } = {}) {
  const R = zufall(rng);
  const roh = GEN[stufe](R);
  const kontext = { ...(roh.kontext || {}) };
  const zeilen = roh.zeilen.map((z) => (z.op ? { ...z, auswahl: auswahlFuer(z.op, { ...kontext, w: kontext.w }, rng) } : z));
  const loesungen = [...roh.loesungen].sort((a, b) => a - b);
  return { id: neueId(), stufe, ...roh, zeilen, loesungen, fallen: (roh.fallen || []).filter((f) => !loesungen.includes(f.wert)) };
}
export const glTex = (a) => `${a.gl[0]} = ${a.gl[1]}`;

/* ---------------------------------------------------------------- Modus „Üben“ */
/* Die Frage eines Schritts im Ton des Werkzeugs: bei Klammer und Zusammenfassen „zuerst“, sonst „als Nächstes“ */
export const uebenFrage = (op, en = false) => (op.art === "klammer" || op.art === "zusammen"
  ? (en ? "What do you do first?" : "Was machst du zuerst?")
  : (en ? "What do you do next?" : "Was machst du als Nächstes?"));

/* Üben-Schritte einer Aufgabe: je Zeile mit nicht-automatischer Umformung ein Schritt (Form aus
   uebenKern.uebenSchritt). Die Möglichkeiten sind die kuratierten aus z.auswahl – die richtige
   und höchstens drei falsche in der Reihenfolge der Aufgabe, jede mit Hinweis
   „<Fehlername>. <Warum>“. Automatische Schritte („Exponenten vergleichen“) bleiben ein Knopf
   und zählen nicht. zeile = Index der Zeile, deren Umformung gewählt wird; nr = 1 … n. */
export function uebenSchritte(a, { zufall = Math.random, en = false } = {}) {
  const liste = [];
  a.zeilen.forEach((z, i) => {
    if (!z.op || z.op.auto || !Array.isArray(z.auswahl)) return;
    const richtig = z.auswahl.find((o) => o.richtig);
    if (!richtig) return;
    const falsche = z.auswahl.filter((o) => !o.richtig).slice(0, 3)
      .map((o) => ({ wert: o, art: o.art, hinweis: `${fehlerName(o.art, en)}. ${o.warum ? o.warum[en ? "en" : "de"] : ""}`.trim() }));
    liste.push(uebenSchritt({ richtig, falsche, schluessel: (o) => `${i}-${o.key}`, zufall, zeile: i, nr: liste.length + 1, op: z.op, frage: uebenFrage(z.op, en) }));
  });
  return liste;
}
/* Schritt zur Zeile i (oder null, wenn die Zeile keine Wahl hat) */
export const uebenSchrittZu = (schritte, i) => schritte.find((s) => s.zeile === i) || null;

/* ---------------------------------------------------------------- Wertung */
/* Eingabe lesen: „−7“, „-7“, „7“; leere Eingabe → null */
export function zahlLesen(s) {
  const r = String(s ?? "").trim().replace(/−/g, "-").replace(/\s+/g, "").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(r)) return null;
  return Number(r);
}
/* antworten: Liste von Eingaben (eine oder zwei). Ergebnis { ok, fehler: { art } | null, teil } */
export function wertung(aufgabe, antworten) {
  const werte = antworten.map(zahlLesen).filter((v) => v !== null);
  const soll = aufgabe.loesungen;
  if (!werte.length) return { ok: false, fehler: null, leer: true };
  const sortiert = [...new Set(werte)].sort((a, b) => a - b);
  const ok = sortiert.length === soll.length && sortiert.every((v, i) => v === soll[i]);
  if (ok) return { ok: true, fehler: null };
  if (soll.length === 2 && sortiert.length === 1 && soll.includes(sortiert[0])) return { ok: false, fehler: { art: "einLoesung" }, teil: true };
  if (soll.length === 2 && sortiert.length >= 1 && sortiert.every((v) => soll.includes(v))) return { ok: false, fehler: { art: "einLoesung" }, teil: true };
  for (const v of sortiert) {
    const f = (aufgabe.fallen || []).find((x) => x.wert === v);
    if (f) return { ok: false, fehler: { art: f.art } };
    if (soll.length === 1 && v === -soll[0]) return { ok: false, fehler: { art: "vorzeichen" } };
  }
  return { ok: false, fehler: null };
}

/* ---------------------------------------------------------------- Fehlerarten */
export const FEHLERART = {
  vorzeichen: { name: t("Vorzeichen beim Umkehren", "Sign when reversing"), tipp: t("Die Umkehrung von + 5 ist − 5 – und zwar auf beiden Seiten.", "The inverse of + 5 is − 5 – on both sides.") },
  eineSeite: { name: t("Nur eine Seite umgeformt", "Only one side changed"), tipp: t("Eine Gleichung ist wie eine Waage: Was links passiert, passiert auch rechts.", "An equation is like a balance: what happens on the left happens on the right.") },
  umkehr: { name: t("Falsche Umkehrung", "Wrong inverse"), tipp: t("Mal ↔ geteilt, plus ↔ minus. Frag dich zuerst: Was wurde mit x gemacht?", "Times ↔ divide, plus ↔ minus. First ask: what was done to x?") },
  operation: { name: t("Rechenart verwechselt", "Operation mixed up"), tipp: t("3x heißt 3 · x. Der Bruchstrich heißt „geteilt“.", "3x means 3 · x. The fraction bar means “divided by”.") },
  teilweise: { name: t("Nur teilweise umgekehrt", "Only partly reversed"), tipp: t("Geh die Rechenkette rückwärts: Was zuletzt passiert ist, machst du zuerst rückgängig.", "Walk the chain backwards: undo first what happened last.") },
  durchX: { name: t("Durch x geteilt", "Divided by x"), tipp: t("Bring die x mit Plus oder Minus auf eine Seite. Teilen durch x ist keine sichere Umformung.", "Move the x with plus or minus to one side. Dividing by x is not a safe step.") },
  klammer: { name: t("Klammer nur teilweise ausmultipliziert", "Bracket partly expanded"), tipp: t("Der Faktor vor der Klammer gilt für jedes Glied darin.", "The factor in front applies to every term inside.") },
  unterKlammer: { name: t("In der Klammer umgeformt", "Changed inside the bracket"), tipp: t("Erst die Klammer auflösen, dann umstellen.", "Expand the bracket first, then rearrange.") },
  nenner: { name: t("Nicht mit dem Hauptnenner", "Not the common denominator"), tipp: t("Nimm eine Zahl, die durch alle Nenner teilbar ist. Dann fallen alle Brüche auf einmal weg.", "Use a number divisible by all denominators. Then all fractions disappear at once.") },
  zusammenfassen: { name: t("Falsch zusammengefasst", "Combined wrongly"), tipp: t("Gleichartige Glieder addierst du: 3x + 2x = 5x.", "Like terms are added: 3x + 2x = 5x.") },
  einLoesung: { name: t("Zweite Lösung vergessen", "Second solution missing"), tipp: t("Auch eine negative Zahl im Quadrat ist positiv: (−7)² = 49.", "A negative number squared is positive too: (−7)² = 49.") },
  halbieren: { name: t("Quadrat mit Verdoppeln verwechselt", "Square confused with doubling"), tipp: t("x² heißt x · x. Die Umkehrung ist die Wurzel, nicht das Halbieren.", "x² means x · x. The inverse is the root, not halving.") },
  quadrieren: { name: t("Wurzel nicht aufgelöst", "Root not undone"), tipp: t("Die Umkehrung der Wurzel ist das Quadrieren – auf beiden Seiten.", "The inverse of the root is squaring – on both sides.") },
  unterWurzel: { name: t("Unter der Wurzel umgeformt", "Changed under the root"), tipp: t("Erst die Wurzel auflösen, dann kommst du an das, was darunter steht.", "Undo the root first, then you can reach what is under it.") },
  exponent: { name: t("Exponent wie Faktor behandelt", "Exponent treated as factor"), tipp: t("Schreib die rechte Seite als Potenz derselben Basis und vergleiche die Exponenten.", "Write the right side as a power of the same base and compare exponents.") },
};
export const fehlerName = (art, en = false) => (FEHLERART[art] ? FEHLERART[art].name[en ? "en" : "de"] : art);
export const fehlerTipp = (art, en = false) => (FEHLERART[art] ? FEHLERART[art].tipp[en ? "en" : "de"] : "");

/* ---------------------------------------------------------------- Lernstand */
export const ABSTAND_TAGE = [0, 1, 3, 7, 14, 30];
export const tagNr = (zeit) => Math.floor((zeit - new Date(zeit).getTimezoneOffset() * 60000) / TAG_MS);

export function leererStand() {
  return { v: 1, stufen: {}, fehler: {}, runden: 0, schritte: 0, film: false, zuletzt: 0 };
}
export function normiereGleich(G) {
  const d = { ...leererStand(), ...(G && typeof G === "object" ? G : {}) };
  d.stufen = d.stufen && typeof d.stufen === "object" ? { ...d.stufen } : {};
  d.fehler = d.fehler && typeof d.fehler === "object" ? { ...d.fehler } : {};
  for (const s of STUFEN) {
    const x = d.stufen[s];
    if (x && typeof x === "object") d.stufen[s] = { n: 0, ok: 0, okOhne: 0, serie: 0, kasten: 0, faellig: 0, zuletzt: 0, tage: [], ...x, tage: Array.isArray(x.tage) ? x.tage.slice(-10) : [] };
  }
  return d;
}
const leereStufe = () => ({ n: 0, ok: 0, okOhne: 0, serie: 0, kasten: 0, faellig: 0, zuletzt: 0, tage: [] });

/* Ein Ergebnis verbuchen. hilfe: 0 = ohne Hilfe, > 0 = mit Tipp/Lösungsweg */
export function buche(G, stufe, ok, { hilfe = 0, zeit = Date.now(), fehler = null } = {}) {
  const s = G.stufen[stufe] || (G.stufen[stufe] = leereStufe());
  s.n += 1; s.zuletzt = zeit; G.zuletzt = zeit;
  const tag = tagNr(zeit);
  if (ok) {
    s.ok += 1; s.serie += 1;
    if (hilfe === 0) {
      s.okOhne += 1;
      if (!s.tage.includes(tag)) s.tage = [...s.tage, tag].slice(-10);
      /* Kasten steigt höchstens einmal pro Tag – sonst wäre eine lange Runde schon „sicher“ */
      if (s.kastenTag !== tag || s.kasten === 0) { s.kasten = Math.min(ABSTAND_TAGE.length - 1, s.kasten + 1); s.kastenTag = tag; }
    }
    s.faellig = zeit + Math.max(1, ABSTAND_TAGE[s.kasten]) * TAG_MS;   // richtig gelöst ist frühestens morgen wieder fällig
  } else {
    s.serie = 0;
    s.kasten = Math.max(0, s.kasten - 1);
    s.faellig = zeit;
    if (fehler) G.fehler[fehler] = (G.fehler[fehler] || 0) + 1;
  }
}

/* Status einer Stufe: neu · unsicher · aufbau · sicher */
export function stufenStatus(s) {
  if (!s || s.n === 0) return "neu";
  if (s.serie === 0 && s.n >= 1 && s.ok / s.n < 0.6) return "unsicher";
  if (s.kasten >= 3 && new Set(s.tage).size >= 2) return "sicher";
  if (s.serie === 0) return "unsicher";
  return "aufbau";
}
export const istFaellig = (s, jetzt = Date.now()) => Boolean(s && s.n > 0 && s.faellig <= jetzt && stufenStatus(s) !== "neu");

export function uebersicht(G, jetzt = Date.now()) {
  const liste = STUFEN.map((id) => {
    const s = G.stufen[id];
    return { id, status: stufenStatus(s), n: s ? s.n : 0, ok: s ? s.ok : 0, quote: s && s.n ? s.ok / s.n : 0, faellig: istFaellig(s, jetzt) };
  });
  const zaehler = liste.reduce((z, x) => ({ ...z, [x.status]: (z[x.status] || 0) + 1 }), {});
  return { liste, zaehler, faellig: liste.filter((x) => x.faellig).length, sicher: zaehler.sicher || 0 };
}

/* Nächster sinnvoller Schritt: zuerst der Film (Verstehen), dann Fälliges, dann die erste nicht sichere Stufe */
export function empfehlung(G, jetzt = Date.now()) {
  if (!G.film && !Object.keys(G.stufen).length) return { art: "verstehen" };
  const u = uebersicht(G, jetzt);
  const unsicher = u.liste.find((x) => x.status === "unsicher");
  if (unsicher) return { art: "stufe", stufe: unsicher.id };
  const offen = u.liste.find((x) => x.status !== "sicher");
  if (u.faellig >= 2) return { art: "wiederholen" };
  if (offen) return { art: "stufe", stufe: offen.id };
  return { art: "gemischt" };
}

/* Runde bauen: art = "stufe" | "gemischt" | "wiederholen" */
export const RUNDENLAENGE = 6;
export function baueRunde(G, { art = "stufe", stufe = "s1", anzahl = RUNDENLAENGE, jetzt = Date.now(), rng = Math.random } = {}) {
  let quellen;
  if (art === "stufe") quellen = Array(anzahl).fill(stufe);
  else {
    const u = uebersicht(G, jetzt);
    let pool;
    if (art === "wiederholen") pool = u.liste.filter((x) => x.faellig || x.status === "unsicher").map((x) => x.id);
    else {
      /* gemischt: alle begonnenen Stufen plus die nächste neue */
      const begonnen = u.liste.filter((x) => x.status !== "neu").map((x) => x.id);
      const naechste = u.liste.find((x) => x.status === "neu");
      pool = [...begonnen, ...(naechste ? [naechste.id] : [])];
    }
    if (!pool.length) pool = art === "wiederholen" ? [] : ["s1", "s2"];
    if (!pool.length) return [];
    /* Unsichere doppelt gewichten */
    const gewichtet = pool.flatMap((id) => (u.liste.find((x) => x.id === id).status === "unsicher" ? [id, id] : [id]));
    quellen = Array.from({ length: anzahl }, (_, i) => (i < pool.length ? pool[i] : gewichtet[Math.floor(rng() * gewichtet.length)]));
    quellen = mischen(quellen, rng).sort((a, b) => stufeNr(a) - stufeNr(b));   // leicht → schwer
  }
  return quellen.map((s) => neueAufgabe(s, { rng }));
}

export function haeufigeFehler(G, min = 2) {
  return Object.entries(G.fehler || {}).filter(([, n]) => n >= min).sort((a, b) => b[1] - a[1]).map(([art, n]) => ({ art, n }));
}
/* Kurzstand für andere Seiten (ohne die Logik zu laden) */
export function kurzStand(G, jetzt = Date.now()) {
  const u = uebersicht(G, jetzt);
  return { sicher: u.sicher, begonnen: u.liste.filter((x) => x.status !== "neu").length, gesamt: STUFEN.length, faellig: u.faellig };
}
