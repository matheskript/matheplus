/* ======================================================================
   trigMittel.js – reine Logik des Mittelstufen-Werkzeugs Trigonometrie
   (kein React, kein DOM; getestet in tests/trigMittel.test.mjs)

   · Winkel-Helfer: Grad ↔ Bogenmaß, π-Brüche, sin/cos/tan in Grad
   · trigAuswerten(text, modus): kleiner Taschenrechner für die Eingabe
     „5 · sin(35)“, „cos⁻¹(0,6)“, „2π/3“, „sin(30°)“ im Modus DEG oder RAD.
     Er rechnet absichtlich wie ein echter Schul-Taschenrechner: Steht er
     auf RAD, ist sin(30) der Sinus von 30 Bogenmaß – genau der Fehler,
     den die Übungen erkennen und erklären.
   · Aufgabengeneratoren je Kapitel: Einheitskreis, Grad- und Bogenmaß,
     rechtwinkliges Dreieck (Verhältnisse, Sachaufgaben), Tangens.
     Sie liefern nur Zahlen; die Schritte baut funcTrigonometrie.jsx.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */

export const RAD = Math.PI / 180;
export const sinG = (g) => Math.sin(g * RAD);
export const cosG = (g) => Math.cos(g * RAD);
export const tanG = (g) => Math.tan(g * RAD);
export const asinG = (x) => Math.asin(x) / RAD;
export const acosG = (x) => Math.acos(x) / RAD;
export const atanG = (x) => Math.atan(x) / RAD;
export const gradZuBogen = (g) => g * RAD;
export const bogenZuGrad = (x) => x / RAD;

const zufall = (l) => l[Math.floor(Math.random() * l.length)];
const ganz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
let zaehler = 0;

/* Zahl mit deutschem Komma, gerundet, ohne überflüssige Nullen, echtes Minuszeichen */
export const zt = (v, st = 4) => {
  if (!isFinite(v)) return "–";
  const r = Math.round(v * 10 ** st) / 10 ** st;
  return String(Object.is(r, -0) ? 0 : r).replace(".", ",").replace("-", "−");
};

/* Grad als Vielfaches von π: g = 135 → [3, 4] (x = 3/4 · π) */
export function piBruch(g) {
  const t = ggT(Math.round(g), 180);
  return [Math.round(g) / t, 180 / t];
}
/* TeX des Bogenmaßes: [1,1] → π, [2,1] → 2π, [1,6] → π/6, [3,4] → 3π/4 (immer vollständig gekürzt, Regel A5) */
export function piTex([z, n]) {
  if (z === 0) return "0";
  const vz = z < 0 ? "−" : "";
  const za = Math.abs(z);
  const oben = za === 1 ? "π" : `${za}π`;
  return n === 1 ? `${vz}${oben}` : `${vz}\\frac{${oben}}{${n}}`;
}
/* Faktor vor π als TeX: [3,4] → \frac{3}{4}, [2,1] → 2 */
export const faktorTex = ([z, n]) => (n === 1 ? `${z}` : `\\frac{${z}}{${n}}`).replace("-", "−");

/* Quadrant eines Winkels in Grad (1 … 4); auf einer Achse 0 */
export function quadrant(g) {
  const w = ((g % 360) + 360) % 360;
  if (w % 90 === 0) return 0;
  return Math.floor(w / 90) + 1;
}

/* ======================================================================
   TASCHENRECHNER
   Grammatik:  summe   = produkt { (+|−) produkt }
               produkt = vorz { (·|÷|unsichtbares Mal) vorz }
               vorz    = (+|−) vorz | potenz
               potenz  = nachgest [ ^ vorz ]
               nachgest= einfach { ° | ² | ³ }
               einfach = Zahl | π | ( summe ) | Funktion argument | √ argument
   Funktionen: sin cos tan, sin⁻¹ cos⁻¹ tan⁻¹ (auch asin, arcsin, sin^-1), sqrt, wurzel
   „°“ heißt „diese Zahl ist in Grad“: im Modus RAD wird sie umgerechnet, im Modus DEG nicht.
   Ergebnis: { wert } oder { fehler: "leer" | "syntax" | "bereich" | "undefiniert" }
   ====================================================================== */
const FUNKTIONEN = ["sin⁻¹", "cos⁻¹", "tan⁻¹", "arcsin", "arccos", "arctan", "asin", "acos", "atan", "sqrt", "wurzel", "sin", "cos", "tan"];
const NAME = { "sin⁻¹": "asin", "cos⁻¹": "acos", "tan⁻¹": "atan", arcsin: "asin", arccos: "acos", arctan: "atan", wurzel: "sqrt" };

function zerlege(text) {
  let s = String(text ?? "")
    .replace(/[−–]/g, "-").replace(/[·×∙⋅*]/g, "*").replace(/[÷:]/g, "/")
    .replace(/\s+/g, "").toLowerCase()
    .replace(/\^\(?-1\)?(?=\()/g, "⁻¹")            // sin^-1( bzw. sin^(-1)( → sin⁻¹(
    .replace(/pi/g, "π").replace(/deg/g, "°");
  /* Komma ist Dezimalzeichen (die Eingabe kennt keine Argument-Trennung) */
  s = s.replace(/,/g, ".");
  const t = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    const zahl = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
    if (zahl) { t.push({ art: "zahl", wert: Number(zahl[1]) }); i += zahl[1].length; continue; }
    const f = FUNKTIONEN.find((n) => s.startsWith(n, i));
    if (f) { t.push({ art: "fkt", name: NAME[f] || f }); i += f.length; continue; }
    if (ch === "√") { t.push({ art: "fkt", name: "sqrt" }); i++; continue; }
    if (ch === "π") { t.push({ art: "zahl", wert: Math.PI }); i++; continue; }
    if ("+-*/^()°²³".includes(ch)) { t.push({ art: ch }); i++; continue; }
    return null;
  }
  return t;
}

export function trigAuswerten(text, modus = "deg") {
  if (!String(text ?? "").trim()) return { fehler: "leer" };
  const t = zerlege(text);
  if (!t || !t.length) return { fehler: "syntax" };
  const rad = modus === "rad";
  const zuRad = (w) => (rad ? w : w * RAD);           // Argument der Winkelfunktion → Bogenmaß
  const vonRad = (w) => (rad ? w : w / RAD);          // Ergebnis der Umkehrfunktion → Anzeigeeinheit
  let i = 0;
  let fehler = null;
  const sieh = () => t[i];
  const nimm = (art) => (t[i] && t[i].art === art ? t[i++] : null);
  const startetEinfach = (x) => x && (x.art === "zahl" || x.art === "fkt" || x.art === "(");

  function einfach() {
    const x = t[i];
    if (!x) throw new Error("syntax");
    if (x.art === "zahl") { i++; return x.wert; }
    if (x.art === "(") {
      i++;
      const w = summe();
      nimm(")");                                          // fehlende schließende Klammer am Ende ist erlaubt
      return w;
    }
    if (x.art === "fkt") {
      i++;
      /* sin(30)² ist (sin 30)², darum nur die Klammer als Argument; ohne Klammer: sin 30° */
      const arg = sieh() && sieh().art === "(" ? einfach() : potenz();
      return anwenden(x.name, arg);
    }
    throw new Error("syntax");
  }
  function einfachMitNach() { let w = einfach(); return nachgestellt(w); }
  function nachgestellt(w) {
    for (;;) {
      if (nimm("°")) { w = rad ? w * RAD : w; continue; }
      if (nimm("²")) { w = w * w; continue; }
      if (nimm("³")) { w = w * w * w; continue; }
      return w;
    }
  }
  function anwenden(name, a) {
    switch (name) {
      case "sin": return Math.sin(zuRad(a));
      case "cos": return Math.cos(zuRad(a));
      case "tan": {
        if (Math.abs(Math.cos(zuRad(a))) < 1e-12) { fehler = "undefiniert"; return NaN; }
        return Math.tan(zuRad(a));
      }
      case "asin": if (a < -1 - 1e-12 || a > 1 + 1e-12) { fehler = "bereich"; return NaN; } return vonRad(Math.asin(Math.max(-1, Math.min(1, a))));
      case "acos": if (a < -1 - 1e-12 || a > 1 + 1e-12) { fehler = "bereich"; return NaN; } return vonRad(Math.acos(Math.max(-1, Math.min(1, a))));
      case "atan": return vonRad(Math.atan(a));
      case "sqrt": if (a < 0) { fehler = "bereich"; return NaN; } return Math.sqrt(a);
      default: throw new Error("syntax");
    }
  }
  function potenz() {
    const b = einfachMitNach();
    if (nimm("^")) return b ** vorz();
    return b;
  }
  function vorz() {
    if (nimm("-")) return -vorz();
    if (nimm("+")) return vorz();
    return potenz();
  }
  function produkt() {
    let w = vorz();
    for (;;) {
      if (nimm("*")) { w *= vorz(); continue; }
      if (nimm("/")) { const d = vorz(); if (d === 0) { fehler = "undefiniert"; return NaN; } w /= d; continue; }
      if (startetEinfach(sieh())) { w *= potenz(); continue; }   // 2sin(30), 3π, 2(4+1)
      return w;
    }
  }
  function summe() {
    let w = produkt();
    for (;;) {
      if (nimm("+")) { w += produkt(); continue; }
      if (nimm("-")) { w -= produkt(); continue; }
      return w;
    }
  }
  let w;
  try {
    w = summe();
    while (nimm(")")) { /* überzählige Klammern am Ende ignorieren */ }
    if (i < t.length) return { fehler: "syntax" };
  } catch (e) {
    return { fehler: "syntax" };
  }
  if (fehler) return { fehler };
  if (!isFinite(w)) return { fehler: "undefiniert" };
  return { wert: Math.abs(w) < 1e-13 ? 0 : w };
}

/* Steht in der Eingabe überhaupt eine Rechnung (sonst reicht das Lesen einer Zahl)? */
export const istTerm = (s) => /[a-zπ√()°²³^*·×÷+]/i.test(String(s ?? "").replace(/^\s*[-−]/, ""));

/* ======================================================================
   KAPITEL 1 · Einheitskreis
   ====================================================================== */
export const EK_ARTEN = ["vorzeichen", "bezug", "gleich", "punkt", "winkel"];
const PUNKTE = [[0.6, 0.8], [0.8, 0.6], [0.28, 0.96], [0.96, 0.28]];

export function ekAufgabe(art = zufall(EK_ARTEN)) {
  const id = ++zaehler;
  const fn = zufall(["sin", "cos"]);
  if (art === "vorzeichen") {
    const q = ganz(1, 4);
    const al = 90 * (q - 1) + 5 * ganz(2, 16);              // 10° … 80° im Quadranten
    const wert = fn === "sin" ? sinG(al) : cosG(al);
    return { id, art, fn, al, q, richtig: wert > 0 ? "+" : "-", wert };
  }
  if (art === "bezug") {
    const be = zufall([20, 25, 30, 35, 40, 50, 55, 60, 65, 70]);
    const form = zufall(["180-", "180+", "360-"]);
    const al = form === "180-" ? 180 - be : form === "180+" ? 180 + be : 360 - be;
    const f = fn === "sin" ? sinG : cosG;
    const vz = f(al) / f(be) > 0 ? "+" : "-";
    return { id, art, fn, al, be, form, richtig: `${vz}${fn}`, wert: f(al) };
  }
  if (art === "gleich") {
    /* zweiter Winkel in [0°, 360°) mit demselben Sinus bzw. Kosinus */
    const al = fn === "sin" ? zufall([ganz(2, 17) * 5, 180 + ganz(2, 16) * 5]) : ganz(2, 34) * 5;
    if (fn === "sin" && al === 90) return ekAufgabe(art);
    const partner = fn === "sin" ? ((540 - al) % 360) : 360 - al;   // sin: 180° − α (auch für α > 180°)
    return { id, art, fn, al, partner };
  }
  if (art === "punkt") {
    const [x0, y0] = zufall(PUNKTE);
    const q = zufall([1, 2]);
    const x = q === 1 ? x0 : -x0;
    return { id, art, x, y: y0, q, al: acosG(x) };
  }
  /* winkel: sin α = v mit α im 2. Quadranten bzw. cos α = v mit α im 4. Quadranten */
  const a0 = ganz(3, 15) * 5;                                // 15° … 75°
  const v = Math.round((fn === "sin" ? sinG(a0) : cosG(a0)) * 100) / 100;
  const grund = fn === "sin" ? asinG(v) : acosG(v);
  const ziel = fn === "sin" ? 180 - grund : 360 - grund;
  return { id, art: "winkel", fn, v, grund, ziel, q: fn === "sin" ? 2 : 4 };
}

/* ======================================================================
   KAPITEL 2 · Grad- und Bogenmaß
   ====================================================================== */
export const BM_ARTEN = ["zuBogen", "zuGrad", "bogen", "falle"];
const BESONDERE = [30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360, 15, 36, 72];

export function bmAufgabe(art = zufall(BM_ARTEN)) {
  const id = ++zaehler;
  if (art === "zuBogen") {
    const g = zufall(BESONDERE);
    const [z, n] = piBruch(g);
    return { id, art, g, z, n, k: z / n, x: gradZuBogen(g) };
  }
  if (art === "zuGrad") {
    if (Math.random() < 0.65) {
      const g = zufall(BESONDERE);
      const [z, n] = piBruch(g);
      return { id, art, mitPi: true, z, n, x: gradZuBogen(g), g };
    }
    const x = zufall([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]);
    return { id, art, mitPi: false, x, g: bogenZuGrad(x) };
  }
  if (art === "bogen") {
    const r = zufall([2, 3, 4, 5, 6, 8, 10, 12]);
    const g = zufall([30, 40, 45, 60, 72, 80, 90, 100, 120, 135, 150, 200, 240, 300]);
    const x = gradZuBogen(g);
    return { id, art, r, g, x, b: r * x, falsch: r * g };
  }
  /* falle: sin(30) im falschen Modus */
  const g = zufall([30, 45, 60, 90]);
  return { id, art: "falle", g, deg: sinG(g), rad: Math.sin(g) };
}

/* ======================================================================
   KAPITEL 3 · Rechtwinkliges Dreieck: Verhältnisse und Sachaufgaben
   (Seite/Winkel berechnen: neueRechtAufgabe in funcTrigonometrie.jsx)
   ====================================================================== */
export const TRIPEL = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];

/* Zwei Seiten gegeben → dritte über Pythagoras → ein Verhältnis (sin, cos oder tan von α) */
export function verhaeltnisAufgabe() {
  const [p, q, c0] = zufall(TRIPEL);
  const k = zufall([1, 1, 2]);
  const tausch = Math.random() < 0.5;
  const a = (tausch ? q : p) * k, b = (tausch ? p : q) * k, c = c0 * k;   // a gegenüber α, b an α, c Hypotenuse
  const fehlt = zufall(["a", "b", "c"]);
  const fn = zufall(["sin", "cos", "tan"]);
  const wert = { sin: a / c, cos: b / c, tan: a / b }[fn];
  const bruch = { sin: [a, c], cos: [b, c], tan: [a, b] }[fn];
  const t = ggT(bruch[0], bruch[1]);
  return { id: ++zaehler, art: "verhaeltnis", a, b, c, fehlt, fn, wert, bruch: [bruch[0] / t, bruch[1] / t], al: atanG(a / b) };
}

/* Sachaufgaben im rechtwinkligen Dreieck */
export const SACHEN = ["leiter", "rampe", "drachen", "lot"];
/* Zufällig gleiche Werte im Grad- und Bogenmaß (z. B. sin 71° ≈ sin 71) würden die Bogenmaß-Rückmeldung verschlucken – dann neu ziehen. */
export function sachAufgabe(was = zufall(SACHEN)) {
  for (;;) { const a = sachRoh(was); if (Math.abs(a.wert - a.rad) > 0.05) return a; }
}
function sachRoh(was) {
  const id = ++zaehler;
  if (was === "leiter") {        // Leiter lehnt an der Wand: Länge, Winkel zum Boden → Höhe an der Wand
    const L = zufall([4, 5, 6, 7, 8]), al = ganz(62, 76);
    return { id, art: "sache", was, L, al, wert: L * sinG(al), fn: "sin", falsch: L * cosG(al), rad: L * Math.sin(al) };
  }
  if (was === "rampe") {         // Rampe: Höhenunterschied und Rampenlänge → Neigungswinkel
    const h = zufall([0.4, 0.5, 0.6, 0.8, 1, 1.2]), L = zufall([4, 5, 6, 8, 10]);
    return { id, art: "sache", was, h, L, wert: asinG(h / L), fn: "sin⁻¹", falsch: atanG(h / L), rad: Math.asin(h / L) };
  }
  if (was === "drachen") {       // Drachenschnur: Länge, Winkel zum Boden → Höhe des Drachens
    const L = zufall([30, 40, 50, 60, 80]), al = zufall([30, 32, 35, 38, 40, 42, 48, 50, 52, 55, 58, 60]);   // ohne 45°: dort wäre sin = cos
    return { id, art: "sache", was, L, al, wert: L * sinG(al), fn: "sin", falsch: L * cosG(al), rad: L * Math.sin(al) };
  }
  /* lot: Baum auf dem Hang – Hanglänge und Hangwinkel → waagerechte Entfernung */
  const L = zufall([50, 80, 100, 120, 150]), al = ganz(8, 30);
  return { id, art: "sache", was, L, al, wert: L * cosG(al), fn: "cos", falsch: L * sinG(al), rad: L * Math.cos(al) };
}

/* ======================================================================
   KAPITEL 4 · Tangens
   ====================================================================== */
export const TAN_ARTEN = ["einheit", "steigung", "prozent", "hoehe", "schatten"];

export function tanAufgabe(art = zufall(TAN_ARTEN)) {
  const id = ++zaehler;
  if (art === "einheit") {
    /* sin α und cos α bekannt → tan α = sin α / cos α */
    const [x0, y0] = zufall(PUNKTE);
    const q = zufall([1, 2]);
    const cos = q === 1 ? x0 : -x0, sin = y0;
    return { id, art, sin, cos, q, wert: sin / cos, kehr: cos / sin };
  }
  if (art === "steigung") {
    const m = zufall([0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4]);
    const b = zufall([-3, -2, -1, 1, 2, 3, 4]);
    return { id, art, m, b, wert: atanG(m), rad: Math.atan(m), kehr: atanG(1 / m) };
  }
  if (art === "prozent") {
    if (Math.random() < 0.6) {
      const p = zufall([4, 6, 8, 10, 12, 15, 18, 20, 25]);
      return { id, art, richtung: "winkel", p, wert: atanG(p / 100), falsch: atanG(p), rad: Math.atan(p / 100) };
    }
    const al = zufall([2, 3, 4, 5, 6, 8, 10, 12]);
    return { id, art, richtung: "prozent", al, wert: 100 * tanG(al), falsch: al, rad: 100 * Math.tan(al) };
  }
  if (art === "hoehe") {
    const d = zufall([20, 25, 30, 40, 50, 60, 80]), al = ganz(20, 55), auge = zufall([0, 1.6]);
    const h1 = d * tanG(al);
    return { id, art, d, al, auge, h1, wert: h1 + auge, falsch: d * sinG(al), rad: d * Math.tan(al) };
  }
  /* schatten: Höhe und Schattenlänge → Winkel der Sonne über dem Horizont */
  const h = zufall([2, 3, 5, 10, 12, 20, 30]), s = zufall([2, 4, 6, 8, 10, 15, 25]);
  return { id, art: "schatten", h, s, wert: atanG(h / s), kehr: atanG(s / h), rad: Math.atan(h / s) };
}
