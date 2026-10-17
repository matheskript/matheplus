/* ======================================================================
   geoMittel.js – reine Mathematik für die Mittelstufen-Geometrie
   (Satz des Pythagoras, Satz des Thales, Kongruenzsätze).
   Kein React, keine Importe von func-/base-Dateien: Node-testbar
   (tests/geoMittel.test.mjs). Die Oberflächen liegen in
   funcPythagorasWz.jsx, funcThales.jsx und funcKongruenz.jsx.

   Bezeichnungen im Dreieck wie im Schulbuch: Seite a liegt dem Punkt A
   gegenüber (a = BC), b = AC, c = AB; α bei A, β bei B, γ bei C.
   γ liegt also zwischen a und b, α zwischen b und c, β zwischen a und c.
   ====================================================================== */

export const GRAD = Math.PI / 180;
export const rund = (v, st = 2) => Math.round(v * 10 ** st) / 10 ** st;
const wahlAus = (l, z) => l[Math.floor(z() * l.length)];

/* ---------- Pythagoras ---------- */

/* Pythagoreische Tripel (a < b < c) – ganzzahlige Ergebnisse ohne Taschenrechner-Rundung */
export const TRIPEL = [
  [3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20],
  [7, 24, 25], [15, 20, 25], [10, 24, 26], [20, 21, 29], [9, 40, 41], [1.5, 2, 2.5], [2.4, 3.2, 4], [0.9, 1.2, 1.5],
];

/* Ist das Dreieck mit diesen Seiten rechtwinklig? (Umkehrung des Satzes) */
export function rechtwinklig(s1, s2, s3) {
  const [x, y, z] = [s1, s2, s3].sort((p, q) => p - q);
  return Math.abs(x * x + y * y - z * z) < 1e-9;
}

/* Fehlende Seite: hyp = true → c aus a, b; sonst Kathete aus c und einer Kathete */
export const hypotenuse = (a, b) => Math.sqrt(a * a + b * b);
export const kathete = (c, a) => Math.sqrt(c * c - a * a);

/* Aufgaben zum Satz des Pythagoras.
   art: hyp | kath | benennung | umkehr | leiter | raum                         */
export const PYTH_ARTEN = ["hyp", "kath", "benennung", "umkehr", "leiter", "raum"];
export function pythAufgabe(art, z = Math.random) {
  art = art || wahlAus(PYTH_ARTEN, z);
  const t = wahlAus(TRIPEL, z);
  const glatt = z() < 0.6;   // 60 % ganzzahlig, sonst auf zwei Stellen runden
  if (art === "hyp") {
    const [a, b] = glatt ? [t[0], t[1]] : [wahlAus([2, 2.5, 3, 4, 4.5, 5, 6], z), wahlAus([3, 3.5, 5, 6.5, 7, 8], z)];
    return { art, a, b, c: hypotenuse(a, b), glatt: Number.isInteger(hypotenuse(a, b) * 10) };
  }
  if (art === "kath") {
    if (glatt) return { art, c: t[2], a: t[0], b: t[1], glatt: true };
    const c = wahlAus([7, 8, 9, 10, 12], z), a = wahlAus([3, 4, 5, 6], z);
    return { art, c, a, b: kathete(c, a), glatt: false };
  }
  if (art === "benennung") {
    /* Dreieck PQR, rechter Winkel bei einem zufälligen Punkt; Seiten heißen nach den Endpunkten */
    const ecken = ["P", "Q", "R"];
    const recht = wahlAus(ecken, z);
    const andere = ecken.filter((e) => e !== recht);
    const hyp = andere.join("");                       // Seite gegenüber dem rechten Winkel
    const k1 = [recht, andere[0]].sort().join(""), k2 = [recht, andere[1]].sort().join("");
    const gesuchtHyp = z() < 0.5;
    return { art, recht, hyp, k1, k2, l1: t[0], l2: t[1], l3: t[2], gesuchtHyp, wert: gesuchtHyp ? t[2] : t[1] };
  }
  if (art === "umkehr") {
    const ja = z() < 0.5;
    let s = [...t];
    if (!ja) {
      const d = t[2] >= 5 ? 1 : 0.5;
      let neu = t[2] + wahlAus([-1, 1], z) * d;
      if (neu === t[0] || neu === t[1]) neu = t[2] + d;   // keine zwei gleich langen Seiten (Auswahl wäre doppelt)
      s = [t[0], t[1], neu];
    }
    const [x, y, w] = [...s].sort((p, q) => p - q);
    return { art, seiten: s, kurz1: x, kurz2: y, lang: w, summe: x * x + y * y, quadrat: w * w, ja: rechtwinklig(...s) };
  }
  if (art === "leiter") {
    const [boden, hoehe, leiter] = wahlAus([[1.5, 2, 2.5], [0.9, 1.2, 1.5], [1.2, 3.5, 3.7], [2.4, 3.2, 4], [1.6, 6.3, 6.5], [1, 2.4, 2.6]], z);
    return { art, boden, hoehe, leiter };
  }
  /* raum: Raumdiagonale im Quader a × b × h */
  const [a, b, h] = wahlAus([[3, 4, 12], [2, 3, 6], [1, 2, 2], [4, 4, 7], [2, 6, 9], [6, 8, 24], [1, 4, 8]], z);
  const e = hypotenuse(a, b);
  return { art, a, b, h, e, d: hypotenuse(e, h) };
}

/* ---------- Thales ---------- */

/* Winkel im Dreieck ABC mit Durchmesser AB = 2r, C auf dem Kreis um M unter dem Winkel t (Grad)
   gemessen von MB aus. Liefert α, β, γ in Grad (Summe 180°, γ = 90°). */
export function thalesWinkel(t) {
  const a = t / 2;          // Umfangswinkel über BC: α = t/2 (Mittelpunktswinkel BMC = t)
  return { alpha: a, beta: 90 - a, gamma: 90 };
}

/* Winkel bei C für einen Punkt C mit Abstand f·r von M (f = 1: auf dem Kreis) unter dem Winkel t */
export function winkelBeiC(t, f = 1) {
  const C = [f * Math.cos(t * GRAD), f * Math.sin(t * GRAD)];
  const A = [-1, 0], B = [1, 0];
  const u = [A[0] - C[0], A[1] - C[1]], v = [B[0] - C[0], B[1] - C[1]];
  const cos = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v));
  return Math.acos(Math.max(-1, Math.min(1, cos))) / GRAD;
}

/* Aufgaben zum Satz des Thales. art: winkel | beweis | radius | lage | tangente | umkreis */
export const THALES_ARTEN = ["winkel", "beweis", "radius", "lage", "tangente", "umkreis"];
export function thalesAufgabe(art, z = Math.random) {
  art = art || wahlAus(THALES_ARTEN, z);
  if (art === "winkel" || art === "beweis") {
    const alpha = wahlAus([18, 22, 25, 28, 32, 35, 38, 41, 47, 52, 56, 63, 67, 72], z);
    return { art, alpha, beta: 90 - alpha, gamma: 90 };
  }
  if (art === "radius") {
    const t = wahlAus(TRIPEL.filter((x) => x[2] <= 30), z);
    return { art, ac: t[0], bc: t[1], ab: t[2], r: t[2] / 2 };
  }
  if (art === "lage") {
    const r = wahlAus([3, 4, 5, 6, 7.5], z);
    const lage = wahlAus(["innen", "auf", "aussen"], z);
    const d = lage === "auf" ? r : lage === "innen" ? rund(r * wahlAus([0.5, 0.6, 0.75, 0.8], z), 2) : rund(r * wahlAus([1.2, 1.25, 1.4, 1.5], z), 2);
    return { art, r, d, lage, durchmesser: 2 * r };
  }
  if (art === "tangente") {
    /* Kreis um M mit Radius r, Punkt P mit |MP| = d; Tangente von P berührt in B: MB ⟂ PB (Thaleskreis über MP) */
    const [r, t, d] = wahlAus([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [1.5, 2, 2.5], [9, 12, 15], [7, 24, 25]], z);
    return { art, r, d, t };
  }
  /* umkreis: rechtwinkliges Dreieck → Umkreismittelpunkt = Mitte der Hypotenuse, Radius = c/2 */
  const t = wahlAus(TRIPEL.filter((x) => Number.isInteger(x[2])), z);
  return { art, a: t[0], b: t[1], c: t[2], r: t[2] / 2 };
}

/* ---------- Kongruenzsätze ---------- */

/* Anzahl der (nicht deckungsgleichen) Dreiecke zu Seiten b (anliegend) und a (gegenüber) mit Winkel α:
   Konstruktion: Winkel α bei A, C im Abstand b auf dem einen Schenkel, Kreis um C mit Radius a schneidet
   den anderen Schenkel. Liefert { anzahl, h, xs } (xs = Lagen von B auf dem Schenkel). */
export function ssw(b, a, alphaGrad) {
  if (alphaGrad <= 0 || alphaGrad >= 180) return { anzahl: 0, h: 0, xs: [] };
  const h = b * Math.sin(alphaGrad * GRAD), m = b * Math.cos(alphaGrad * GRAD);
  const eps = 1e-9;
  if (a < h - eps) return { anzahl: 0, h, xs: [] };
  if (Math.abs(a - h) <= eps) return m > eps ? { anzahl: 1, h, xs: [m] } : { anzahl: 0, h, xs: [] };
  const w = Math.sqrt(a * a - h * h);
  const xs = [m - w, m + w].filter((x) => x > eps);
  return { anzahl: xs.length, h, xs };
}

/* SSS möglich? (Dreiecksungleichung, streng) */
export const sssMoeglich = (a, b, c) => a + b > c && a + c > b && b + c > a;

/* Fälle für „Welcher Kongruenzsatz?“ – jede Angabe als Liste von Stücken.
   satz: SSS | SWS | WSW | SsW | keiner;  anzahl: 0 | 1 | 2 | "unendlich" */
export const KONG_SAETZE = ["SSS", "SWS", "WSW", "SsW", "keiner"];
export const KONG_ARTEN = ["sss", "sws", "wsw", "sww", "ssw-gross", "ssw-klein", "www", "sss-falsch", "wsw-falsch", "ssw-schief"];

/* Ein Stück: { t: "S" | "W", name: "a" | "α" …, wert } */
const S = (name, wert) => ({ t: "S", name, wert });
const W = (name, wert) => ({ t: "W", name, wert });

export function kongruenzAufgabe(art, z = Math.random) {
  art = art || wahlAus(KONG_ARTEN, z);
  const seite = () => wahlAus([3, 4, 4.5, 5, 5.5, 6, 6.5, 7, 8], z);
  const winkel = () => wahlAus([30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80], z);
  if (art === "sss") {
    let a, b, c; do { a = seite(); b = seite(); c = seite(); } while (!sssMoeglich(a, b, c));
    return { art, stuecke: [S("a", a), S("b", b), S("c", c)], satz: "SSS", anzahl: 1 };
  }
  if (art === "sss-falsch") {
    const a = wahlAus([2, 3, 3.5], z), b = wahlAus([3, 4], z), c = a + b + wahlAus([0, 0.5, 1.5], z);
    return { art, stuecke: [S("a", a), S("b", b), S("c", c)], satz: "SSS", anzahl: 0 };
  }
  if (art === "sws") {
    /* Winkel zwischen den beiden Seiten: (a, b, γ) oder (b, c, α) oder (a, c, β) */
    const v = wahlAus([[["a", "b"], "γ"], [["b", "c"], "α"], [["a", "c"], "β"]], z);
    return { art, stuecke: [S(v[0][0], seite()), S(v[0][1], seite()), W(v[1], wahlAus([40, 55, 70, 95, 110, 125], z))], satz: "SWS", anzahl: 1 };
  }
  if (art === "wsw" || art === "wsw-falsch") {
    /* Seite mit den beiden anliegenden Winkeln: (c; α, β), (a; β, γ), (b; α, γ) */
    const v = wahlAus([["c", ["α", "β"]], ["a", ["β", "γ"]], ["b", ["α", "γ"]]], z);
    const w1 = winkel();
    const w2 = art === "wsw" ? wahlAus([35, 45, 50, 60, 70], z) : 180 - w1 + wahlAus([0, 10, 25], z);
    return { art, stuecke: [S(v[0], seite()), W(v[1][0], w1), W(v[1][1], w2)], satz: "WSW", anzahl: art === "wsw" ? 1 : 0 };
  }
  if (art === "sww") {
    /* Seite, ein anliegender und der gegenüberliegende Winkel: (a; β, α) → dritter Winkel aus der Winkelsumme → WSW */
    const v = wahlAus([["a", "β", "α"], ["c", "α", "γ"], ["b", "γ", "β"]], z);
    return { art, stuecke: [S(v[0], seite()), W(v[1], wahlAus([35, 45, 50, 60], z)), W(v[2], wahlAus([40, 55, 65, 75], z))], satz: "WSW", anzahl: 1, sww: true };
  }
  if (art === "ssw-gross" || art === "ssw-klein" || art === "ssw-schief") {
    /* zwei Seiten und ein Winkel, der NICHT zwischen ihnen liegt: gegenüber der Seite „gegen“ */
    const v = wahlAus([["a", "b", "α"], ["b", "c", "β"], ["c", "a", "γ"], ["a", "c", "α"], ["b", "a", "β"], ["c", "b", "γ"]], z);
    const [gegen, anlieg, w] = v;   // w liegt gegenüber von „gegen“, an „anlieg“ an
    const alpha = wahlAus([30, 35, 40, 45, 50], z);
    let sGegen, sAnlieg;
    if (art === "ssw-gross") { sAnlieg = wahlAus([4, 5, 6], z); sGegen = sAnlieg + wahlAus([1, 1.5, 2], z); }
    else {
      sAnlieg = wahlAus([6, 7, 8], z);
      const h = sAnlieg * Math.sin(alpha * GRAD);
      /* klein: zwei Lösungen (h < gegen < anlieg); schief: zu kurz (keine Lösung) */
      sGegen = art === "ssw-klein" ? rund(Math.min(sAnlieg - 0.5, Math.ceil((h + 0.6) * 2) / 2), 1) : rund(Math.max(0.5, Math.floor((h - 0.4) * 2) / 2), 1);
    }
    const r = ssw(sAnlieg, sGegen, alpha);
    return { art, stuecke: [S(gegen, sGegen), S(anlieg, sAnlieg), W(w, alpha)], satz: art === "ssw-gross" ? "SsW" : "keiner", anzahl: r.anzahl, h: r.h };
  }
  /* www */
  const a1 = wahlAus([40, 50, 60, 70], z), b1 = wahlAus([30, 45, 55, 65], z);
  return { art, stuecke: [W("α", a1), W("β", b1), W("γ", 180 - a1 - b1)], satz: "keiner", anzahl: "unendlich" };
}

/* Welche Seite liegt welchem Winkel gegenüber / zwischen welchen Seiten liegt ein Winkel? */
export const GEGENUEBER = { a: "α", b: "β", c: "γ", "α": "a", "β": "b", "γ": "c" };
export const ZWISCHEN = { "α": ["b", "c"], "β": ["a", "c"], "γ": ["a", "b"] };

/* Satz aus den Stücken bestimmen (unabhängige Prüfung der Generator-Lösung) */
export function satzVon(stuecke) {
  const s = stuecke.filter((x) => x.t === "S"), w = stuecke.filter((x) => x.t === "W");
  if (s.length === 3) return "SSS";
  if (w.length === 3) return "keiner";
  if (w.length === 2) return "WSW";                    // WSW oder SWW (dritter Winkel aus der Winkelsumme)
  const [x, y] = s.map((q) => q.name), wi = w[0].name;
  if (ZWISCHEN[wi].includes(x) && ZWISCHEN[wi].includes(y)) return "SWS";
  const gegen = s.find((q) => GEGENUEBER[q.name] === wi);
  const anl = s.find((q) => q !== gegen);
  return gegen && gegen.wert > anl.wert ? "SsW" : "keiner";
}

/* Anzahl der Dreiecke aus den Stücken (unabhängig vom Generator berechnet) */
export function anzahlVon(stuecke) {
  const s = stuecke.filter((x) => x.t === "S"), w = stuecke.filter((x) => x.t === "W");
  if (w.length === 3) return Math.abs(w.reduce((u, x) => u + x.wert, 0) - 180) < 1e-9 ? "unendlich" : 0;
  if (s.length === 3) return sssMoeglich(...s.map((x) => x.wert)) ? 1 : 0;
  if (w.length === 2) return w[0].wert + w[1].wert < 180 ? 1 : 0;
  const wi = w[0];
  const zw = ZWISCHEN[wi.name];
  if (zw.includes(s[0].name) && zw.includes(s[1].name)) return wi.wert < 180 ? 1 : 0;
  const gegen = s.find((q) => GEGENUEBER[q.name] === wi.name), anl = s.find((q) => q !== gegen);
  return ssw(anl.wert, gegen.wert, wi.wert).anzahl;
}

/* Figuren zum Begründen: warum sind zwei Teildreiecke kongruent? */
export const KONG_FIGUREN = [
  { id: "parallelogramm", satz: "WSW", gleich: ["gemeinsame Seite AC", "Wechselwinkel an AB ∥ CD", "Wechselwinkel an AD ∥ BC"],
    text: "Im Parallelogramm ABCD teilt die Diagonale AC die Fläche in die Dreiecke ABC und CDA. Warum sind sie kongruent? (Die Gegenseiten sind parallel.)" },
  { id: "gleichschenklig", satz: "SSS", gleich: ["AC = BC (gleichschenklig)", "AM = MB (M ist Mitte von AB)", "gemeinsame Seite CM"],
    text: "Im gleichschenkligen Dreieck ABC mit AC = BC ist M die Mitte der Basis AB. Warum sind die Dreiecke AMC und BMC kongruent?" },
  { id: "kreuz", satz: "SWS", gleich: ["AS = SC", "BS = SD", "Scheitelwinkel bei S"],
    text: "Die Strecken AC und BD schneiden sich in S und halbieren sich dort gegenseitig. Warum sind die Dreiecke ASB und CSD kongruent?" },
  { id: "drachen", satz: "SSS", gleich: ["AB = AD", "CB = CD", "gemeinsame Seite AC"],
    text: "Im Drachenviereck ABCD gilt AB = AD und CB = CD. Warum sind die Dreiecke ABC und ADC kongruent?" },
];
