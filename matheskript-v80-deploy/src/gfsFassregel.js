/* ============================================================
   GFS-Trainer · Die Keplersche Fassregel
   (Kursstufe 1, Kapitel III Integralrechnung)
   Reine Logik ohne React: exakte Brüche, Polynome, Fassregel (einfach
   und summiert), Rechteck- und Trapezregel, Parabel durch drei Punkte,
   Fassvolumen über Querschnitte, vier Übungsgeneratoren mit Prüfung,
   gezielter Rückmeldung zu typischen Fehlern und vollständigem Rechenweg,
   Gliederung, Tipps und Kolloquium.
   Getestet in tests/gfsFassregel.test.mjs.
   Nichts stammt aus einem Schulbuch: Aufgaben, Kontexte, Zahlen und
   Formulierungen sind eigene.
   Bezeichnungen überall gleich: Intervall [a; b], Mitte m = (a + b)/2,
   halbe Breite h = (b − a)/2, Näherung N = (b − a)/6 · (f(a) + 4f(m) + f(b)),
   Fehler = Näherung − exakter Wert.
   ============================================================ */

/* ---------- Zufall ---------- */
/* mulberry32: kleiner Generator mit Startwert – für wiederholbare Tests */
export function zufallszahlen(startwert = 1) {
  let s = startwert >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* Ganzzahl-Würfel zufall(a, b) wie in den übrigen GFS-Generatoren */
export const wuerfelAus = (rnd = Math.random) => (a, b) => a + Math.floor(rnd() * (b - a + 1));
const zz = wuerfelAus();
const wahl = (liste, zufall) => liste[(zufall || zz)(0, liste.length - 1)];
const stufeIn = (s) => Math.max(1, Math.min(5, Math.round(s || 1)));

/* ---------- Brüche (exakt) ---------- */
export const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
export function Q(z, n = 1) {
  if (n === 0) throw new Error("Nenner 0");
  if (n < 0) { z = -z; n = -n; }
  const g = ggT(z, n);
  return { z: z / g || 0, n: n / g };
}
/* Zahl → Bruch (Dezimalzahlen mit kleinem Nenner, z. B. 1,5 → 3/2) */
export function zuQ(x) {
  if (typeof x !== "number") return x;
  for (let d = 1; d <= 1000; d++) if (Math.abs(x * d - Math.round(x * d)) < 1e-9) return Q(Math.round(x * d), d);
  throw new Error(`keine Bruchzahl: ${x}`);
}
/* Rechnen mit Brüchen: über das kgV bzw. vorher gekürzt, damit die Zahlen klein bleiben */
export const qAdd = (a, b) => { a = zuQ(a); b = zuQ(b); const g = ggT(a.n, b.n); return Q(a.z * (b.n / g) + b.z * (a.n / g), (a.n / g) * b.n); };
export const qSub = (a, b) => { b = zuQ(b); return qAdd(a, { z: -b.z, n: b.n }); };
export const qMul = (a, b) => {
  a = zuQ(a); b = zuQ(b);
  const g1 = ggT(a.z, b.n), g2 = ggT(b.z, a.n);
  return Q((a.z / g1) * (b.z / g2), (a.n / g2) * (b.n / g1));
};
export const qDiv = (a, b) => { b = zuQ(b); if (b.z === 0) throw new Error("Division durch 0"); return qMul(a, { z: b.n * Math.sign(b.z), n: Math.abs(b.z) }); };
export const qWert = (a) => (typeof a === "number" ? a : a.z / a.n);
export const qGleich = (a, b) => { a = zuQ(a); b = zuQ(b); return a.z * b.n === b.z * a.n; };
export const qNull = (a) => zuQ(a).z === 0;
/* TeX: −\frac{7}{3}, 5, −5 (Minus als −) */
export function qTex(a) {
  a = zuQ(a);
  const v = a.z < 0 ? "−" : "";
  return a.n === 1 ? `${v}${Math.abs(a.z)}` : `${v}\\frac{${Math.abs(a.z)}}{${a.n}}`;
}
/* Klartext 7/3, −7/3 */
export const qText = (a) => { a = zuQ(a); return a.n === 1 ? String(a.z).replace("-", "−") : `${a.z < 0 ? "−" : ""}${Math.abs(a.z)}/${a.n}`; };
/* negative Zahl hinter einem Rechenzeichen in Klammern: + (−3) */
export const kl = (a) => (qWert(a) < 0 ? `(${qTex(a)})` : qTex(a));
/* Faktor vor einer Variablen: 1 fällt weg, −1 wird zu − (kein 1x, kein 1g₁) */
const koef = (q, v) => (qGleich(q, 1) ? v : qGleich(q, -1) ? `−${v}` : `${qTex(q)}${v}`);

/* ---------- Dezimalzahlen ---------- */
export const rund = (x, n = 3) => Math.round(x * 10 ** n) / 10 ** n;
/* Zahl mit Komma, höchstens n Nachkommastellen, ohne Nullen am Ende */
export const dk = (x, n = 3) => {
  const r = rund(x, n);
  return (r === 0 ? "0" : String(r)).replace("-", "−").replace(".", ",");
};
/* TeX mit schmalem Tausender-Abstand ab fünf Stellen: 203\,156, aber 5371 */
const tausend = (s) => (s.replace(/\D/g, "").length < 5 ? s : s.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,"));
export const dkTex = (x, n = 3) => { const [g, k] = dk(x, n).split(","); return tausend(g) + (k ? `,${k}` : ""); };
/* Grenze als TeX: ganze Zahl oder Bruch exakt, sonst Dezimalzahl */
const zTex = (x) => (typeof x === "number" && !Number.isInteger(x) ? dk(x) : qTex(zuQ(x)));

/* ---------- Polynome: Koeffizienten [c0, c1, c2, …] als Brüche ---------- */
export const poly = (...c) => c.map(zuQ);
export const polyGrad = (p) => { for (let k = p.length - 1; k >= 0; k--) if (!qNull(p[k])) return k; return 0; };
export function polyWert(p, x) {
  x = zuQ(x);
  let s = Q(0);
  for (let k = p.length - 1; k >= 0; k--) s = qAdd(qMul(s, x), p[k]);
  return s;
}
export const polyZahl = (p, x) => p.reduceRight((s, c) => s * x + qWert(c), 0);
export const polyStamm = (p) => [Q(0), ...p.map((c, k) => qDiv(c, k + 1))];
export const polyIntegral = (p, a, b) => { const F = polyStamm(p); return qSub(polyWert(F, b), polyWert(F, a)); };
export function polyMal(p, q) {
  const r = Array.from({ length: p.length + q.length - 1 }, () => Q(0));
  p.forEach((a, i) => q.forEach((b, j) => { r[i + j] = qAdd(r[i + j], qMul(a, b)); }));
  return r;
}
/* TeX eines Polynoms, höchste Potenz zuerst: x^3 − 2x^2 + 4 (kein 1x, kein ^1, kein + −) */
export function polyTex(p, v = "x") {
  const teile = [];
  for (let k = p.length - 1; k >= 0; k--) {
    const c = zuQ(p[k]);
    if (qNull(c)) continue;
    const neg = c.z < 0, betrag = Q(Math.abs(c.z), c.n);
    const pot = k === 0 ? "" : k === 1 ? v : `${v}^${k}`;
    const term = k > 0 && qGleich(betrag, 1) ? pot : `${qTex(betrag)}${pot}`;
    teile.push(teile.length ? `${neg ? "−" : "+"} ${term}` : `${neg ? "−" : ""}${term}`);
  }
  return teile.length ? teile.join(" ") : "0";
}

/* ---------- Die Regeln (Zahlen) ---------- */
/* Keplersche Fassregel: (b − a)/6 · (f(a) + 4 f(m) + f(b)) */
export const fass = (f, a, b) => ((b - a) / 6) * (f(a) + 4 * f((a + b) / 2) + f(b));
export const rechteck = (f, a, b) => (b - a) * f((a + b) / 2);          // Höhe in der Mitte
export const trapez = (f, a, b) => ((b - a) / 2) * (f(a) + f(b));
/* summierte Regeln: [a; b] in n gleich breite Stücke, auf jedem die einfache Regel */
export function summiert(regel, f, a, b, n = 1) {
  let s = 0;
  const d = (b - a) / n;
  for (let i = 0; i < n; i++) s += regel(f, a + i * d, a + (i + 1) * d);
  return s;
}
/* exakt mit Brüchen für Polynome */
export function fassQ(p, a, b) {
  a = zuQ(a); b = zuQ(b);
  const m = qDiv(qAdd(a, b), 2);
  const s = qAdd(qAdd(polyWert(p, a), qMul(4, polyWert(p, m))), polyWert(p, b));
  return qMul(qDiv(qSub(b, a), 6), s);
}
export function fassQSummiert(p, a, b, n) {
  a = zuQ(a); b = zuQ(b);
  const d = qDiv(qSub(b, a), n);
  let s = Q(0);
  for (let i = 0; i < n; i++) s = qAdd(s, fassQ(p, qAdd(a, qMul(i, d)), qAdd(a, qMul(i + 1, d))));
  return s;
}

/* ---------- Parabel durch (−h|y0), (0|y1), (h|y2): p(x) = αx² + βx + γ ---------- */
export function parabel3(h, y0, y1, y2) {
  const h2 = qMul(h, h);
  return {
    alpha: qDiv(qAdd(qSub(y0, qMul(2, y1)), y2), qMul(2, h2)),
    beta: qDiv(qSub(y2, y0), qMul(2, h)),
    gamma: zuQ(y1),
  };
}
/* Fläche unter dieser Parabel von −h bis h: 2αh³/3 + 2γh (der β-Teil fällt weg) */
export const parabelFlaeche = (h, { alpha, gamma }) => qAdd(qMul(qMul(alpha, Q(2, 3)), qMul(h, qMul(h, h))), qMul(qMul(2, gamma), h));
/* dieselbe Parabel als Zahlfunktion auf [a; b] (zum Zeichnen) */
export function parabelDurch(f, a, b) {
  const m = (a + b) / 2, h = (b - a) / 2, y0 = f(a), y1 = f(m), y2 = f(b);
  const al = (y0 - 2 * y1 + y2) / (2 * h * h), be = (y2 - y0) / (2 * h);
  return (x) => y1 + be * (x - m) + al * (x - m) * (x - m);
}

/* ---------- Fassvolumen (Längen in cm, Volumen in cm³) ---------- */
export const kreis = (r) => Math.PI * r * r;
export const fassVolumen = (ru, rm, ro, h) => (h / 6) * (kreis(ru) + 4 * kreis(rm) + kreis(ro));
/* Radius der Wand in der Höhe z (Parabel durch die drei Radien) */
export function fassProfil(ru, rm, ro, h) {
  const k = h / 2, al = (ru - 2 * rm + ro) / (2 * k * k), be = (ro - ru) / (2 * k);
  return (z) => rm + be * (z - k) + al * (z - k) * (z - k);
}
/* Wand als Parabel durch die drei Radien: A(z) = π r(z)² hat Grad 4 – exaktes Volumen */
export function parabelFass(ru, rm, ro, h) {
  const k = h / 2, al = (ru - 2 * rm + ro) / (2 * k * k), be = (ro - ru) / (2 * k);
  return Math.PI * (2 * k * rm * rm + ((be * be + 2 * rm * al) * 2 * k ** 3) / 3 + (al * al * 2 * k ** 5) / 5);
}
/* Fassregel − Parabelwand = π h (r_u − 2 r_m + r_o)² / 30 (≥ 0, genau 0 bei gerader Wand) */
export const fassAbweichung = (ru, rm, ro, h) => (Math.PI * h * (ru - 2 * rm + ro) ** 2) / 30;
/* Labor: Die Wand (Parabel durch die drei Radien) darf nirgends unter 0 fallen */
export function fassErlaubt(ru, rm, ro, h = 1) {
  if (Math.min(ru, rm, ro) < 0) return false;
  const k = h / 2, al = (ru - 2 * rm + ro) / (2 * k * k), be = (ro - ru) / (2 * k);
  if (al <= 0) return true;                                  // nach unten offen oder gerade: Minimum am Rand
  const t = -be / (2 * al);
  return Math.abs(t) >= k || rm - (be * be) / (4 * al) >= -1e-9;
}
/* Grundkörper: Querschnitte unten/Mitte/oben, Höhe und exaktes Volumen */
export const KOERPER = {
  zylinder: { name: "Zylinder", radien: (r) => [r, r, r], hoehe: (r, h) => h, exakt: (r, h) => Math.PI * r * r * h },
  kegel: { name: "Kegel", radien: (r) => [r, r / 2, 0], hoehe: (r, h) => h, exakt: (r, h) => (Math.PI * r * r * h) / 3 },
  kugel: { name: "Kugel", radien: (r) => [0, r, 0], hoehe: (r) => 2 * r, exakt: (r) => (4 / 3) * Math.PI * r ** 3 },
};
export const kegelstumpf = (ru, ro, h) => (Math.PI * h * (ru * ru + ru * ro + ro * ro)) / 3;

/* ---------- Eingaben lesen ---------- */
/* „7/3“, „−7/3“, „2,333“, „-0,5“, „ 12 “ → Zahl; sonst null */
export function liesZahl(s) {
  const t = String(s ?? "").trim().replace(/\s/g, "").replace(/[−–]/g, "-").replace(/^\+/, "");
  if (!t) return null;
  const b = /^(-?)(\d+(?:[.,]\d+)?)\/(-?)(\d+(?:[.,]\d+)?)$/.exec(t);
  if (b) {
    const z = Number(b[2].replace(",", ".")), n = Number(b[4].replace(",", "."));
    return n === 0 ? null : ((b[1] === b[3] ? 1 : -1) * z) / n;
  }
  const d = t.replace(",", ".");
  return /^-?(\d+\.?\d*|\.\d+)$/.test(d) ? Number(d) : null;
}

/* ---------- Funktionen, die keine Polynome sind ---------- */
const istGanz = (x) => Math.abs(x - Math.round(x)) < 1e-12;
export const NICHT_POLY = {
  exp: { tex: "e^x", f: Math.exp, F: Math.exp, grund: "Die e-Funktion ist kein Polynom",
    wTex: (x) => (x === 0 ? "1" : x === 1 ? "e" : `e^{${dk(x)}}`) },
  expMinus: { tex: "e^{−x}", f: (x) => Math.exp(-x), F: (x) => -Math.exp(-x), grund: "Die e-Funktion ist kein Polynom",
    wTex: (x) => (x === 0 ? "1" : x === 1 ? "e^{−1}" : `e^{−${dk(x)}}`) },
  kehr: { tex: "\\frac{1}{x}", f: (x) => 1 / x, F: Math.log, grund: "1/x ist kein Polynom",
    wTex: (x) => qTex(qDiv(1, zuQ(x))) },
  wurzel: { tex: "\\sqrt{x}", f: Math.sqrt, F: (x) => (2 / 3) * x ** 1.5, grund: "Die Wurzelfunktion ist kein Polynom",
    wTex: (x) => (istGanz(Math.sqrt(x)) ? String(Math.round(Math.sqrt(x))) : `\\sqrt{${dk(x)}}`) },
};
/* exakter Wert als TeX: e^2 − 1, 1 − e^{−2}, \ln 3, 16/3 */
export function exaktTex(id, a, b) {
  if (id === "exp") return `${NICHT_POLY.exp.wTex(b)} − ${NICHT_POLY.exp.wTex(a)}`;
  if (id === "expMinus") return `${NICHT_POLY.expMinus.wTex(a)} − ${NICHT_POLY.expMinus.wTex(b)}`;
  if (id === "kehr") return a === 1 ? `\\ln ${dk(b)}` : `\\ln ${dk(b)} − \\ln ${dk(a)}`;
  const w = (x) => Math.round(Math.sqrt(x)) ** 3;        // Quadratzahlen: x^{3/2} ganz
  const klammer = a === 0 ? `${b}^{\\frac{3}{2}}` : `(${b}^{\\frac{3}{2}} − ${a}^{\\frac{3}{2}})`;
  return `\\frac{2}{3} \\cdot ${klammer} = ${qTex(Q(2 * (w(b) - w(a)), 3))}`;
}

/* ---------- Labor: Funktionen mit Fenster, erlaubten Grenzen (Schritt 0,5) und Start ---------- */
/* x = erlaubte Grenzen, fenster = gezeigter Ausschnitt, ab = kleinstes x, an dem die Kurve gezeichnet wird */
export const LABOR_FUNKTIONEN = [
  { id: "kubisch", name: "Grad 3", tex: "f(x) = \\frac{1}{4}x^3 − \\frac{3}{2}x^2 + \\frac{9}{4}x + 1", grad: 3,
    f: (x) => x ** 3 / 4 - 1.5 * x * x + 2.25 * x + 1, F: (x) => x ** 4 / 16 - x ** 3 / 2 + 1.125 * x * x + x,
    x: [-0.5, 4.5], fenster: [-0.75, 4.75], y: [-1, 4], start: [0, 3] },
  { id: "parabel", name: "Parabel", tex: "f(x) = −\\frac{1}{2}x^2 + 2x + 1", grad: 2,
    f: (x) => -0.5 * x * x + 2 * x + 1, F: (x) => -(x ** 3) / 6 + x * x + x,
    x: [-0.5, 4.5], fenster: [-0.75, 4.75], y: [-1, 4], start: [0, 3] },
  { id: "quartisch", name: "Grad 4", tex: "f(x) = \\frac{1}{8}x^4 − x^2 + 2", grad: 4,
    f: (x) => x ** 4 / 8 - x * x + 2, F: (x) => x ** 5 / 40 - x ** 3 / 3 + 2 * x,
    x: [-2.5, 2.5], fenster: [-2.75, 2.75], y: [-0.5, 3], start: [-2, 2] },
  { id: "exp", name: "eˣ", tex: "f(x) = e^x", grad: null,
    f: Math.exp, F: Math.exp, x: [-1.5, 2], fenster: [-1.75, 2.25], y: [-0.5, 8], start: [0, 2] },
  { id: "kehr", name: "1/x", tex: "f(x) = \\frac{1}{x}", grad: null,
    f: (x) => 1 / x, F: Math.log, x: [0.5, 5], fenster: [-0.25, 5.25], y: [-0.25, 2.25], start: [1, 3], ab: 0.3 },
];
export const LABOR_SCHRITT = 0.5;
/* Grenzen verschieben: Schritt 0,5, im Fenster, a < b */
export function grenzeSetzen(fn, a, b, welche, d) {
  const lo = fn.x[0], hi = fn.x[1], s = LABOR_SCHRITT;
  if (welche === "a") return [Math.min(b - s, Math.max(lo, a + d * s)), b];
  return [a, Math.max(a + s, Math.min(hi, b + d * s))];
}
/* alle Werte eines Labor-Zustands: exakt, Näherungen und Fehler (Näherung − exakt) */
export function laborWerte(fn, a, b, n = 1) {
  const exakt = fn.F(b) - fn.F(a);
  const w = { exakt };
  for (const [k, regel] of [["fass", fass], ["rechteck", rechteck], ["trapez", trapez]]) {
    w[k] = summiert(regel, fn.f, a, b, n);
    const e = w[k] - exakt;
    w[`${k}Fehler`] = Math.abs(e) < 1e-10 * Math.max(1, Math.abs(exakt)) ? 0 : e;
  }
  return w;
}
export const FASS_VORLAGEN = [
  { id: "wein", name: "Weinfass", ru: 25, rm: 30, ro: 25, h: 80 },
  { id: "zylinder", name: "Zylinder", ru: 25, rm: 25, ro: 25, h: 80 },
  { id: "eimer", name: "Eimer", ru: 12, rm: 15, ro: 18, h: 30 },
  { id: "kegel", name: "Kegel", ru: 30, rm: 15, ro: 0, h: 60 },
];
export const FASS_GRENZEN = { r: [0, 40], h: [20, 120] };

/* Labor: Fehler der summierten Regel für (1/8)x⁴ + … (Polynom 4. Grades) – (b − a)⁵ / (960 n⁴) */
export const fehlerQuartisch = (a, b, n) => (b - a) ** 5 / (960 * n ** 4);

/* ---------- Herleitung: Potenzen 1, x, …, x⁴ auf [−1; 1] ---------- */
export const POTENZ_TEST = [0, 1, 2, 3, 4].map((k) => {
  const p = Array.from({ length: k + 1 }, (_, i) => Q(i === k ? 1 : 0));
  const w = [-1, 0, 1].map((x) => polyWert(p, x));
  return { k, werte: w, exakt: polyIntegral(p, -1, 1), regel: fassQ(p, -1, 1), ok: qGleich(polyIntegral(p, -1, 1), fassQ(p, -1, 1)) };
});

/* ---------- Herleitung: Zahlen der Beispiele ---------- */
export const BEISPIEL_EXP = {
  I: Math.E ** 2 - 1, fass: fass(Math.exp, 0, 2), rechteck: rechteck(Math.exp, 0, 2), trapez: trapez(Math.exp, 0, 2),
  zwei: summiert(fass, Math.exp, 0, 2, 2), vier: summiert(fass, Math.exp, 0, 2, 4),
};
export const BEISPIEL_KEHR = { I: Math.log(3), fass: fass((x) => 1 / x, 1, 3), rechteck: rechteck((x) => 1 / x, 1, 3), trapez: trapez((x) => 1 / x, 1, 3) };

/* ======================================================================
   Übungen
   ====================================================================== */
export const ARTEN = [
  { id: "anwenden", name: "Fassregel anwenden" },
  { id: "exakt", name: "Exakt oder nicht?" },
  { id: "fass", name: "Fassvolumen" },
  { id: "gewichte", name: "Parabel und Gewichte" },
];
/* Entscheidung im Typ „Exakt oder nicht?“ */
export const ENTSCHEIDUNG = [{ id: "ja", name: "exakt" }, { id: "nein", name: "nicht exakt" }];
/* Was jede Stufe verlangt (Anzeige über der Aufgabe) */
export const STUFEN_NAMEN = {
  anwenden: ["Parabel auf [0; b]", "Polynom 3. Grades", "Mitte als Bruch", "Messwerte im Alltag", "e-Funktion, 1/x, Wurzel"],
  exakt: ["Grad 2 bis 4", "Grad 3 oder 4, breiter", "erst ausmultiplizieren", "e-Funktion, 1/x, Wurzel", "zwei Fässer"],
  fass: ["Zylinder, Kegel, Kugel", "Weinfass", "Durchmesser gemessen", "Eimer mit gerader Wand", "rückwärts: Radius gesucht"],
  gewichte: ["Parabel, h = 1", "Parabel, h > 1", "Parabel und Fläche", "Gewichte auf [−h; h]", "Gewichte auf [0; b]"],
};

/* zufälliges Polynom vom Grad d mit kleinen ganzen Koeffizienten */
function zufallsPoly(d, zufall, lead, rest) {
  const c = [];
  for (let k = 0; k < d; k++) c.push(Q(zufall(rest[0], rest[1])));
  c.push(Q(wahl(lead, zufall)));
  return c;
}

/* Kontexte für Messwerte (Typ anwenden, Stufe 4) – eigene Formulierungen; T ist durch 6 teilbar */
const MESS = [
  { id: "weg", T: [12, 18, 24], label: "s", einheit: "m", integral: "s = \\int_0^{T} v(t)\\,dt",
    werte: (z) => { const v0 = z(8, 14), v1 = v0 + z(3, 6), v2 = v1 + z(1, 4); return [v0, v1, v2]; },
    text: (T, [y0, y1, y2]) => `Ein Auto fährt auf die Landstraße und beschleunigt. Ein Sensor misst seine Geschwindigkeit: zu Beginn ${y0} m/s, nach ${T / 2} s ${y1} m/s und nach ${T} s ${y2} m/s. Schätze mit der Fassregel, wie viele Meter es in diesen ${T} Sekunden zurücklegt.` },
  { id: "teich", T: [12, 18, 24, 30], label: "A", einheit: "m²", integral: "A = \\int_0^{T} b(x)\\,dx",
    werte: (z) => [z(2, 5), z(7, 12), z(2, 6)],
    text: (T, [y0, y1, y2]) => `Ein Teich ist ${T} m lang. Quer dazu misst man seine Breite: am einen Ende ${y0} m, genau in der Mitte ${y1} m, am anderen Ende ${y2} m. Schätze mit der Fassregel die Wasserfläche in Quadratmetern.` },
  { id: "pool", T: [12, 30, 60], label: "V", einheit: "l", integral: "V = \\int_0^{T} r(t)\\,dt",
    werte: (z) => { const r1 = z(25, 40); return [z(10, 20), r1, z(12, r1 - 5)]; },
    text: (T, [y0, y1, y2]) => `Ein Pool wird befüllt. Die Zuflussrate beträgt zu Beginn ${y0} Liter pro Minute, nach ${T / 2} Minuten ${y1} Liter pro Minute und nach ${T} Minuten ${y2} Liter pro Minute. Schätze mit der Fassregel, wie viele Liter in diesen ${T} Minuten zugeflossen sind.` },
];

/* Funktionen ohne Polynom mit passenden Intervallen (Stufe 3 bei „anwenden“ und „exakt“) */
const NP_FAELLE = [
  { id: "exp", a: 0, b: 1 }, { id: "exp", a: 0, b: 2 }, { id: "expMinus", a: 0, b: 2 },
  { id: "kehr", a: 1, b: 2 }, { id: "kehr", a: 1, b: 3 }, { id: "kehr", a: 1, b: 5 },
  { id: "wurzel", a: 0, b: 4 }, { id: "wurzel", a: 1, b: 9 }, { id: "wurzel", a: 4, b: 16 },
];

/* Produktformen für „Exakt oder nicht?“ Stufe 4: [TeX, Polynom] */
function produktForm(zufall) {
  const p = wahl([-2, -1, 1, 2], zufall), q = wahl([-2, -1, 1, 2, 3].filter((x) => x !== p), zufall), c = wahl([1, 2, 3], zufall);
  const lin = (r) => poly(-r, 1);                             // x − r
  const xm = (r) => (r > 0 ? `(x − ${r})` : `(x + ${-r})`);
  const formen = [
    () => [`${xm(p)}^2${xm(q)}^2`, polyMal(polyMal(lin(p), lin(p)), polyMal(lin(q), lin(q)))],
    () => [`x^2${xm(p)}^2`, polyMal(poly(0, 0, 1), polyMal(lin(p), lin(p)))],
    () => [`${xm(p)}^3`, polyMal(lin(p), polyMal(lin(p), lin(p)))],
    () => [`x${xm(p)}${xm(q)}`, polyMal(poly(0, 1), polyMal(lin(p), lin(q)))],
    () => [`(x^2 − ${c})^2`, polyMal(poly(-c, 0, 1), poly(-c, 0, 1))],
    () => [`${xm(p)}${xm(q)}`, polyMal(lin(p), lin(q))],
  ];
  return wahl(formen, zufall)();
}

/* Teile einer Fassregel-Rechnung für ein Polynom (exakt) */
export function polyTeile(p, a, b) {
  a = zuQ(a); b = zuQ(b);
  const m = qDiv(qAdd(a, b), 2);
  const fa = polyWert(p, a), fm = polyWert(p, m), fb = polyWert(p, b);
  const summe = qAdd(qAdd(fa, qMul(4, fm)), fb);
  const vor = qDiv(qSub(b, a), 6);
  return { a, b, m, fa, fm, fb, summe, vor, N: qMul(vor, summe), I: polyIntegral(p, a, b) };
}
/* Zahlen einer Fassregel-Rechnung für eine Zahlfunktion */
const zahlTeile = (f, a, b) => ({ a, b, m: (a + b) / 2, fa: f(a), fm: f((a + b) / 2), fb: f(b), N: fass(f, a, b) });

/* ---------- Aufgaben ---------- */
export function aufgabe(art, stufe, zufall = zz) {
  const s = stufeIn(stufe);
  if (art === "anwenden") return aufgabeAnwenden(s, zufall);
  if (art === "exakt") return aufgabeExakt(s, zufall);
  if (art === "fass") return aufgabeFass(s, zufall);
  return aufgabeGewichte(s, zufall);
}

/* Stufen: 1 Parabel auf [0; b] · 2 Grad 3, ganze Mitte · 3 Mitte als Bruch · 4 Messwerte im Sachkontext · 5 e-Funktion, 1/x, Wurzel (runden) */
function aufgabeAnwenden(s, zufall) {
  if (s === 5) {
    const fall = wahl(NP_FAELLE, zufall), F = NICHT_POLY[fall.id];
    const t = zahlTeile(F.f, fall.a, fall.b), I = F.F(fall.b) - F.F(fall.a);
    return { art: "anwenden", stufe: s, typ: "np", fn: fall.id, a: fall.a, b: fall.b, teile: t, I,
      soll: { m: t.m, N: t.N }, loesung: { m: dk(t.m), N: dk(t.N, 3) } };
  }
  if (s === 4) {
    const K = wahl(MESS, zufall), T = wahl(K.T, zufall), y = K.werte(zufall);
    const N = Q(T * (y[0] + 4 * y[1] + y[2]), 6);
    return { art: "anwenden", stufe: s, typ: "mess", kontext: K.id, T, y, soll: { N }, loesung: { N: qText(N) } };
  }
  let p, a, b;
  if (s === 1) { p = zufallsPoly(2, zufall, [-2, -1, 1, 2], [-3, 4]); a = 0; b = wahl([2, 4, 6], zufall); }
  else if (s === 2) { p = zufallsPoly(3, zufall, [-1, 1], [-3, 3]); a = zufall(-3, 1); b = a + wahl([2, 4], zufall); }
  else { p = zufallsPoly(wahl([2, 3, 3], zufall), zufall, [-1, 1, 2], [-3, 3]); a = zufall(-3, 0); b = a + wahl([1, 3], zufall); }
  const t = polyTeile(p, a, b);
  return { art: "anwenden", stufe: s, typ: "poly", p, a, b, teile: t, I: t.I, soll: { m: t.m, N: t.N }, loesung: { m: qText(t.m), N: qText(t.N) } };
}

/* Stufen: 1 Grad 2–4 auf Breite 2 · 2 Grad 3–4, breiter · 3 Produktform (erst ausmultiplizieren) · 4 e-Funktion, 1/x, Wurzel · 5 summierte Regel mit zwei Fässern */
function aufgabeExakt(s, zufall) {
  if (s === 4) {
    const fall = wahl(NP_FAELLE, zufall), F = NICHT_POLY[fall.id];
    const t = zahlTeile(F.f, fall.a, fall.b), I = F.F(fall.b) - F.F(fall.a), E = t.N - I;
    return { art: "exakt", stufe: s, typ: "np", fn: fall.id, a: fall.a, b: fall.b, n: 1, teile: t, I, N: t.N, exakt: false,
      soll: { ex: "nein", E }, loesung: { ex: "nein", E: dk(E, 4) } };
  }
  let p, a, b, tex = null, n = 1;
  if (s === 1) { p = zufallsPoly(wahl([2, 3, 3, 4, 4], zufall), zufall, [-1, 1, 2], [-3, 3]); a = zufall(-1, 1); b = a + 2; }
  else if (s === 2) { p = zufallsPoly(wahl([3, 4], zufall), zufall, [-1, 1], [-3, 3]); a = zufall(-2, 1); b = a + wahl([2, 4], zufall); }
  else if (s === 3) { [tex, p] = produktForm(zufall); a = zufall(-2, 1); b = a + wahl([2, 2, 4], zufall); }
  else { p = zufallsPoly(wahl([3, 4, 4], zufall), zufall, [-1, 1, 2], [-3, 3]); a = zufall(-2, 0); b = a + wahl([2, 4], zufall); n = 2; }
  const grad = polyGrad(p), I = polyIntegral(p, a, b);
  const N = n === 1 ? fassQ(p, a, b) : fassQSummiert(p, a, b, n);
  const E = qSub(N, I);
  return { art: "exakt", stufe: s, typ: "poly", p, tex, a, b, n, grad, I, N, exakt: grad <= 3,
    soll: { ex: grad <= 3 ? "ja" : "nein", E }, loesung: { ex: grad <= 3 ? "ja" : "nein", E: qText(E) } };
}

function aufgabeFass(s, zufall) {
  if (s === 1) {
    const koerper = wahl(["zylinder", "kegel", "kugel"], zufall);
    const r = koerper === "zylinder" ? wahl([20, 25, 30], zufall) : koerper === "kegel" ? wahl([10, 12, 15, 18], zufall) : wahl([10, 15, 20, 25], zufall);
    const h = KOERPER[koerper].hoehe(r, koerper === "zylinder" ? wahl([60, 80, 90, 100], zufall) : wahl([30, 45, 50, 60, 75], zufall));
    const radien = KOERPER[koerper].radien(r);
    const V = fassVolumen(...radien, h) / 1000;
    return { art: "fass", stufe: s, koerper, r, h, radien, soll: { V }, loesung: { V: dk(V, 1) } };
  }
  if (s === 2 || s === 3) {
    const ru = zufall(20, 30), rm = ru + zufall(3, 8), ro = s === 2 ? ru : ru + zufall(-4, 2), h = wahl([60, 70, 80, 90, 100], zufall);
    const V = fassVolumen(ru, rm, ro, h) / 1000;
    return { art: "fass", stufe: s, koerper: "fass", radien: [ru, rm, ro], durchmesser: s === 3, h, soll: { V }, loesung: { V: dk(V, 1) } };
  }
  if (s === 4) {
    const du = wahl([20, 22, 24, 26, 28], zufall), dO = du + wahl([4, 6, 8, 10, 12], zufall), h = wahl([24, 28, 30, 32, 36], zufall);
    const ru = du / 2, ro = dO / 2, rm = (ru + ro) / 2;
    const V = fassVolumen(ru, rm, ro, h) / 1000;
    return { art: "fass", stufe: s, koerper: "eimer", radien: [ru, rm, ro], durchmesser: true, h, soll: { rm, V }, loesung: { rm: dk(rm, 1), V: dk(V, 2) } };
  }
  /* Stufe 5: rückwärts – Radius in halber Höhe für ein Wunschvolumen */
  const rmFuer = (V, h, ru) => { const x = ((6 * V * 1000) / (Math.PI * h) - 2 * ru * ru) / 4; return x > 0 ? Math.sqrt(x) : 0; };
  let V = 200, h = 80, ru = 22;
  for (let i = 0; i < 60; i++) {
    const v = wahl([100, 120, 150, 180, 200, 225, 250], zufall), hh = wahl([60, 70, 80, 90], zufall), r = zufall(18, 26);
    const rm = rmFuer(v, hh, r);
    if (rm > r + 2 && rm < r + 12) { V = v; h = hh; ru = r; break; }
  }
  const rm = rmFuer(V, h, ru);
  return { art: "fass", stufe: s, koerper: "rueck", radien: [ru, rm, ru], h, Vziel: V, soll: { rm }, loesung: { rm: dk(rm, 1) } };
}

function aufgabeGewichte(s, zufall) {
  if (s <= 3) {
    const h = s === 1 ? 1 : s === 2 ? wahl([2, 3], zufall) : wahl([1, 2, 3], zufall);
    let y0, y1, y2;
    do { y0 = zufall(-4, 6); y1 = zufall(-4, 6); y2 = zufall(-4, 6); } while (y0 - 2 * y1 + y2 === 0 || y0 === y2);
    const par = parabel3(h, y0, y1, y2), A = parabelFlaeche(h, par);
    const soll = s === 3 ? { alpha: par.alpha, A } : { alpha: par.alpha, beta: par.beta, gamma: par.gamma };
    return { art: "gewichte", stufe: s, typ: "parabel", h, y: [y0, y1, y2], par, A, soll,
      loesung: Object.fromEntries(Object.entries(soll).map(([k, v]) => [k, qText(v)])) };
  }
  if (s === 4) {
    const h = wahl([1, 2, 3, 6], zufall);
    const g = [Q(h, 3), Q(4 * h, 3), Q(h, 3)];
    return { art: "gewichte", stufe: s, typ: "symm", h, soll: { g0: g[0], g1: g[1], g2: g[2] }, loesung: { g0: qText(g[0]), g1: qText(g[1]), g2: qText(g[2]) } };
  }
  const w = wahl([2, 3, 4, 6, 12], zufall);
  const g = [Q(w, 6), Q(2 * w, 3), Q(w, 6)];
  return { art: "gewichte", stufe: s, typ: "rand", w, soll: { g0: g[0], g1: g[1], g2: g[2] }, loesung: { g0: qText(g[0]), g1: qText(g[1]), g2: qText(g[2]) } };
}

/* ---------- Felder: [Schlüssel, Beschriftung (TeX), Einheit, Modus der Mathe-Tastatur, Toleranz] ---------- */
const TOL = { 1: 0.06, 2: 0.006, 3: 0.0006 };
export function felder(a) {
  if (a.art === "anwenden") {
    if (a.typ === "mess") { const K = MESS.find((x) => x.id === a.kontext); return [["N", K.label, K.einheit, "bruch", 0.06]]; }
    if (a.typ === "np") return [["m", "m", "", "zahl", TOL[2]], ["N", "N", "", "zahl", Math.min(0.0015 + 0.0002 * Math.abs(a.soll.N), Math.abs(a.soll.N - a.I) / 2.5)]];
    return [["m", "m", "", "bruch", TOL[2]], ["N", "N", "", "bruch", TOL[2]]];
  }
  if (a.art === "exakt") return [["ex", "", "", "wahl", 0], a.typ === "np"
    ? ["E", "\\text{Fehler}", "", "zahl", Math.min(0.00015, Math.abs(a.soll.E) / 2.5)]
    : ["E", "\\text{Fehler}", "", "bruch", TOL[3]]];
  if (a.art === "fass") {
    if (a.stufe === 4) return [["rm", "r_m", "cm", "zahl", 0.051], ["V", "V", "l", "zahl", Math.max(0.006, 0.001 * a.soll.V)]];
    if (a.stufe === 5) return [["rm", "r_m", "cm", "zahl", 0.08]];
    return [["V", "V", "l", "zahl", Math.max(0.06, 0.001 * a.soll.V)]];
  }
  if (a.typ === "parabel") return a.stufe === 3
    ? [["alpha", "\\alpha", "", "bruch", TOL[2]], ["A", "A", "", "bruch", TOL[2]]]
    : [["alpha", "\\alpha", "", "bruch", TOL[2]], ["beta", "\\beta", "", "bruch", TOL[2]], ["gamma", "\\gamma", "", "bruch", TOL[2]]];
  return [["g0", "g_0", "", "bruch", TOL[2]], ["g1", "g_1", "", "bruch", TOL[2]], ["g2", "g_2", "", "bruch", TOL[2]]];
}

/* Term einer Aufgabe als TeX (für Anzeige und Rechenweg) */
export const termTex = (a) => (a.typ === "np" ? NICHT_POLY[a.fn].tex : a.tex || polyTex(a.p));
const intTex = (a, b, f = "f(x)") => `\\int_{${zTex(a)}}^{${zTex(b)}} ${f}\\,dx`;

export function auftrag(a) {
  if (a.art === "anwenden") {
    if (a.typ === "mess") return MESS.find((x) => x.id === a.kontext).text(a.T, a.y);
    const genau = a.typ === "np" ? " Runde N auf drei Nachkommastellen." : "";
    return `Schätze $${intTex(a.a, a.b)}$ für $f(x) = ${termTex(a)}$ mit der Keplerschen Fassregel. Gib die Mitte $m$ des Intervalls und die Näherung $N$ an.${genau}`;
  }
  if (a.art === "exakt") {
    const n = a.n === 2 ? " mit der summierten Fassregel aus zwei gleich breiten Stücken" : " mit der Fassregel";
    const genau = a.typ === "np" ? " Runde auf vier Nachkommastellen." : "";
    return `Du schätzt $${intTex(a.a, a.b)}$ für $f(x) = ${termTex(a)}$${n}. Ist die Näherung exakt? Berechne den Fehler = Näherung − exakter Wert.${genau}`;
  }
  if (a.art === "fass") {
    const [ru, rm, ro] = a.radien;
    if (a.koerper === "zylinder") return `Eine zylinderförmige Regentonne hat den Radius ${ru} cm und ist ${a.h} cm hoch. Schätze ihr Volumen mit der Fassregel über drei Querschnitte – unten, in der Mitte, oben – in Litern (auf 0,1 l genau).`;
    if (a.koerper === "kegel") return `Ein Leitkegel von der Baustelle wird als voller Kegel gedacht: unten der Radius ${ru} cm, oben die Spitze, Höhe ${a.h} cm. Schätze sein Volumen mit der Fassregel über drei Querschnitte in Litern (auf 0,1 l genau).`;
    if (a.koerper === "kugel") return `Ein Gymnastikball ist eine Kugel mit dem Radius ${a.r} cm, also ${a.h} cm hoch. Schätze sein Volumen mit der Fassregel über drei waagrechte Querschnitte – unten, in der Mitte, oben – in Litern (auf 0,1 l genau).`;
    if (a.koerper === "fass") return a.durchmesser
      ? `Ein Fass ist ${a.h} cm hoch. Gemessen werden die Durchmesser: unten ${2 * ru} cm, in halber Höhe ${2 * rm} cm, oben ${2 * ro} cm. Schätze das Volumen mit der Fassregel in Litern (auf 0,1 l genau).`
      : `Ein Weinfass ist innen ${a.h} cm hoch. Boden und Deckel haben den Radius ${ru} cm, in halber Höhe beträgt der Radius ${rm} cm. Schätze das Volumen mit der Fassregel in Litern (auf 0,1 l genau).`;
    if (a.koerper === "eimer") return `Ein Eimer ist ${a.h} cm hoch, der Boden hat den Durchmesser ${2 * ru} cm, die Öffnung ${2 * ro} cm, die Wand ist gerade. Bestimme den Radius $r_m$ in halber Höhe und das Volumen mit der Fassregel in Litern (auf 0,01 l genau).`;
    return `Ein Fass soll ${a.Vziel} Liter fassen. Es wird ${a.h} cm hoch, Boden und Deckel haben den Radius ${ru} cm. Welchen Radius $r_m$ muss es in halber Höhe haben, wenn man mit der Fassregel rechnet? (auf 0,1 cm genau)`;
  }
  if (a.typ === "parabel") {
    const [y0, y1, y2] = a.y, h = a.h;
    const P = `$P(−${h} \\mid ${qTex(y0)})$, $Q(0 \\mid ${qTex(y1)})$ und $R(${h} \\mid ${qTex(y2)})$`;
    return a.stufe === 3
      ? `Die Parabel $p(x) = \\alpha{}x^2 + \\beta{}x + \\gamma$ geht durch ${P}. Bestimme $\\alpha$ und die Fläche $A = \\int_{−${h}}^{${h}} p(x)\\,dx.$`
      : `Bestimme die Parabel $p(x) = \\alpha{}x^2 + \\beta{}x + \\gamma$ durch ${P}.`;
  }
  if (a.typ === "symm") return `Gesucht ist eine Regel, die $\\int_{−${a.h}}^{${a.h}} f(x)\\,dx$ durch $g_0 \\cdot f(−${a.h}) + g_1 \\cdot f(0) + g_2 \\cdot f(${a.h})$ schätzt und für $f(x) = 1$, $f(x) = x$ und $f(x) = x^2$ exakt ist. Bestimme die Gewichte $g_0$, $g_1$ und $g_2$.`;
  return `Gesucht ist eine Regel, die $\\int_{0}^{${a.w}} f(x)\\,dx$ durch $g_0 \\cdot f(0) + g_1 \\cdot f(${qTex(Q(a.w, 2))}) + g_2 \\cdot f(${a.w})$ schätzt und für $f(x) = 1$, $f(x) = x$ und $f(x) = x^2$ exakt ist. Bestimme die Gewichte $g_0$, $g_1$ und $g_2$.`;
}

/* ---------- Prüfen ---------- */
export function pruefe(a, eingabe = {}) {
  const ergebnis = {}, ist = {};
  for (const [k, , , modus, tol] of felder(a)) {
    if (modus === "wahl") { ist[k] = eingabe[k] || null; ergebnis[k] = ist[k] === a.soll[k]; continue; }
    ist[k] = liesZahl(eingabe[k]);
    ergebnis[k] = ist[k] !== null && Math.abs(ist[k] - qWert(a.soll[k])) <= tol + 1e-12;
  }
  const ok = Object.values(ergebnis).every(Boolean);
  return { ok, felder: ergebnis, grund: ok ? "" : grundFuer(a, ist, ergebnis) };
}

/* typische Fehler: [falscher Wert, Rückmeldung]; der erste, der zur Eingabe passt, wird genannt */
function passend(ist, soll, tol, kand, standard) {
  if (ist === null) return "Gib eine Zahl ein – als Bruch (7/3) oder als Dezimalzahl mit Komma (2,33).";
  for (const [w, text] of kand) {
    if (!Number.isFinite(w) || Math.abs(w - soll) <= 2 * tol) continue;
    if (Math.abs(ist - w) <= Math.max(tol, Math.abs(w) * 1e-9)) return text;
  }
  return standard;
}
/* Fehler beim Anwenden der Regel (t: a, b, fa, fm, fb als Zahlen; fx: f an der falschen Mitte) */
function regelFehler(t, fxFalsch) {
  const w = t.b - t.a, S = t.fa + 4 * t.fm + t.fb;
  const kand = [
    [(w / 6) * (t.fa + t.fm + t.fb), "Die Mitte zählt vierfach: $f(a) + 4f(m) + f(b)$ – nicht einfach die Summe der drei Werte."],
    [(w / 3) * (t.fa + t.fm + t.fb), "Das ist der Mittelwert der drei Werte mal der Breite. Bei der Fassregel zählt die Mitte vierfach: Gewichte $1 : 4 : 1$."],
    [w * S, "Der Vorfaktor ist $\\frac{b − a}{6}$, nicht $b − a$: Die Gewichte $1 + 4 + 1 = 6$ müssen wieder herausgeteilt werden."],
    [(w / 3) * S, "In $\\frac{h}{3} \\cdot (…)$ ist $h$ die halbe Breite. Mit der ganzen Breite heißt der Vorfaktor $\\frac{b − a}{6}$."],
    [S / 6, "Die Breite fehlt als Faktor: $N = \\frac{b − a}{6} \\cdot (f(a) + 4f(m) + f(b))$."],
    [(w / 2) * (t.fa + t.fb), "Das ist die Trapezregel – sie benutzt nur die Randwerte. Bei der Fassregel kommt die Mitte mit dem Gewicht 4 dazu."],
    [w * t.fm, "Das ist die Rechteckregel mit der Höhe in der Mitte. Die Fassregel nimmt die Randwerte dazu: $f(a) + 4f(m) + f(b)$."],
    [-(w / 6) * S, "Achte auf das Vorzeichen – rechne die Funktionswerte noch einmal nach."],
  ];
  if (fxFalsch !== null) kand.push([(w / 6) * (t.fa + 4 * fxFalsch + t.fb), "Die Mitte ist $m = \\frac{a + b}{2}$, nicht $\\frac{b − a}{2}$."]);
  return kand;
}
function grundFuer(a, ist, erg) {
  const tol = Object.fromEntries(felder(a).map(([k, , , , t]) => [k, t]));
  if (a.art === "anwenden") {
    if (erg.m === false) return passend(ist.m, qWert(a.soll.m), tol.m,
      [[(qWert(a.b) - qWert(a.a)) / 2, "Die Mitte ist $m = \\frac{a + b}{2}$ – der Mittelwert der Grenzen, nicht die halbe Breite."]],
      "Die Mitte liegt genau zwischen den Grenzen: $m = \\frac{a + b}{2}$.");
    let t, fx = null;
    if (a.typ === "mess") t = { a: 0, b: a.T, fa: a.y[0], fm: a.y[1], fb: a.y[2] };
    else if (a.typ === "np") { t = a.teile; fx = a.a !== 0 ? NICHT_POLY[a.fn].f((a.b - a.a) / 2) : null; }
    else {
      t = { a: qWert(a.a), b: qWert(a.b), fa: qWert(a.teile.fa), fm: qWert(a.teile.fm), fb: qWert(a.teile.fb) };
      if (!qNull(a.a)) fx = polyZahl(a.p, (t.b - t.a) / 2);
    }
    const kand = regelFehler(t, fx);
    if (a.typ === "np") kand.unshift([a.I, "Das ist der exakte Wert des Integrals. Gefragt ist die Näherung mit der Fassregel – sie weicht etwas davon ab."]);
    return passend(ist.N, qWert(a.soll.N), tol.N, kand, a.typ === "mess"
      ? `Die drei Messwerte spielen die Rolle von $f(a)$, $f(m)$ und $f(b)$, die Breite ist $b − a = ${a.T}$. Setze in $\\frac{b − a}{6} \\cdot (f(a) + 4f(m) + f(b))$ ein.`
      : "Rechne $f(a)$, $f(m)$ und $f(b)$ noch einmal aus und setze in $N = \\frac{b − a}{6} \\cdot (f(a) + 4f(m) + f(b))$ ein.");
  }
  if (a.art === "exakt") {
    if (erg.ex === false) {
      if (!ist.ex) return "Entscheide zuerst: exakt oder nicht exakt?";
      if (a.typ === "np") return `${NICHT_POLY[a.fn].grund} – die Parabel durch die drei Punkte trifft die Kurve nicht genau, ein kleiner Fehler bleibt.`;
      if (a.grad <= 3) return `Grad ${a.grad}: Die Fassregel ist für alle Polynome bis Grad 3 exakt – sogar für $x^3$, obwohl sie nur eine Parabel benutzt.`;
      return `Grad ${a.grad}: Die Fassregel ist nur bis Grad 3 exakt. Für $x^4$ liefert sie zu viel – der Fehler ist nicht 0.${a.tex ? " Multipliziere zuerst aus, um den Grad zu sehen." : ""}`;
    }
    if (a.typ === "poly" && a.grad <= 3) return "Bei Grad höchstens 3 ist die Fassregel exakt – der Fehler ist 0.";
    const soll = qWert(a.soll.E);
    return passend(ist.E, soll, tol.E, [
      [-soll, "Das Vorzeichen ist umgedreht: Fehler = Näherung − exakter Wert."],
      [qWert(a.N), "Das ist die Näherung selbst. Gesucht ist die Differenz: Näherung − exakter Wert."],
      [qWert(a.I), "Das ist der exakte Wert. Gesucht ist die Differenz: Näherung − exakter Wert."],
      [0, "Der Fehler ist hier nicht 0 – genau stimmt die Fassregel nur bei Polynomen bis Grad 3."],
    ], "Berechne die Näherung und den exakten Wert (mit einer Stammfunktion) getrennt; Fehler = Näherung − exakter Wert.");
  }
  if (a.art === "fass") {
    const [ru, rm, ro] = a.radien, h = a.h;
    if (a.stufe === 5) {
      const V = a.Vziel * 1000, rest = (6 * V) / (Math.PI * h) - 2 * ru * ru;
      return passend(ist.rm, a.soll.rm, tol.rm, [
        [Math.sqrt(rest), "Das Gewicht 4 der Mitte fehlt beim Auflösen: erst durch 4 teilen, dann die Wurzel ziehen."],
        [rest / 4, "Das ist $r_m^2$ – jetzt noch die Wurzel ziehen."],
        [Math.sqrt(Math.max(0, ((6 * a.Vziel) / (Math.PI * h) - 2 * ru * ru) / 4)), "Rechne die Liter zuerst in cm³ um: 1 l = 1000 cm³."],
        [Math.sqrt(Math.max(0, ((3 * V) / (Math.PI * h) - 2 * ru * ru) / 4)), "Der Vorfaktor ist $\\frac{h}{6}$, nicht $\\frac{h}{3}$."],
      ], "Setze $V = \\frac{h}{6} \\cdot (A_u + 4A_m + A_o)$ mit $A = \\pi{}r^2$ an und löse nach $r_m$ auf. Liter vorher in cm³ umrechnen.");
    }
    if (a.stufe === 4 && erg.rm === false) return passend(ist.rm, a.soll.rm, tol.rm,
      [[2 * rm, "Das ist der Durchmesser in halber Höhe. Gesucht ist der Radius – die Hälfte davon."], [ro - ru, "Bei gerader Wand liegt $r_m$ genau zwischen den beiden Radien: $r_m = \\frac{r_u + r_o}{2}$."]],
      "Bei gerader Wand liegt der Radius in halber Höhe genau in der Mitte: $r_m = \\frac{r_u + r_o}{2}$.");
    const V = (r1, r2, r3) => ((h / 6) * Math.PI * (r1 * r1 + 4 * r2 * r2 + r3 * r3)) / 1000;
    const soll = a.soll.V;
    const kand = [
      [V(2 * ru, 2 * rm, 2 * ro), "Du hast mit den Durchmessern gerechnet. Die Querschnittsfläche ist $A = \\pi{}r^2$ mit dem Radius – so wird alles viermal zu groß."],
      [((h / 6) * Math.PI * (ru * ru + rm * rm + ro * ro)) / 1000, "Der mittlere Querschnitt zählt vierfach: $A_u + 4A_m + A_o$."],
      [soll / Math.PI, "In $A = \\pi{}r^2$ fehlt das $\\pi$."],
      [soll * 1000, "Das ist das Volumen in cm³. Rechne in Liter um: 1 l = 1000 cm³."],
      [2 * soll, "Der Vorfaktor ist $\\frac{h}{6}$, nicht $\\frac{h}{3}$."],
      [((h / 6) * Math.PI * (ru + 4 * rm + ro)) / 1000, "Die Querschnittsfläche ist $A = \\pi{}r^2$ – der Radius wird quadriert."],
    ];
    if (a.durchmesser) kand.unshift([V(ru / 2, rm / 2, ro / 2), "Die Maße sind Durchmesser – halbiere sie nur einmal."]);
    return passend(ist.V, soll, tol.V, kand,
      "Querschnitte $A = \\pi{}r^2$ unten, in der Mitte und oben ausrechnen, dann $V \\approx \\frac{h}{6} \\cdot (A_u + 4A_m + A_o)$; 1 l = 1000 cm³.");
  }
  if (a.typ === "parabel") {
    const [y0, y1, y2] = a.y, h = a.h;
    if (erg.alpha === false) return passend(ist.alpha, qWert(a.soll.alpha), tol.alpha, [
      [(y0 - 2 * y1 + y2) / 2, `Du hast vergessen, durch $h^2 = ${h * h}$ zu teilen: $\\alpha = \\frac{y_0 − 2y_1 + y_2}{2h^2}$.`],
      [-(y0 - 2 * y1 + y2) / (2 * h * h), "Vorzeichen prüfen: $\\alpha = \\frac{y_0 − 2y_1 + y_2}{2h^2}$."],
      [(y0 + y2) / (2 * h * h), "Beim Addieren der Gleichungen bleibt $2\\alpha{}h^2 + 2\\gamma = y_0 + y_2$ – ziehe $2\\gamma = 2y_1$ noch ab."],
    ], "Setze $x = −h$ und $x = h$ ein und addiere die Gleichungen – der $\\beta$-Teil fällt weg: $\\alpha = \\frac{y_0 − 2y_1 + y_2}{2h^2}$.");
    if (erg.beta === false) return passend(ist.beta, qWert(a.soll.beta), tol.beta, [
      [(y0 - y2) / (2 * h), "Vorzeichen umgedreht: $\\beta = \\frac{y_2 − y_0}{2h}$ – rechter Wert minus linker Wert."],
      [y2 - y0, `Teile noch durch $2h = ${2 * h}$: $\\beta = \\frac{y_2 − y_0}{2h}$.`],
    ], "Subtrahiere die Gleichungen für $x = h$ und $x = −h$: $2\\beta{}h = y_2 − y_0$.");
    if (erg.gamma === false) return `Setze $x = 0$ ein: Dann fallen $\\alpha{}x^2$ und $\\beta{}x$ weg, also ist $\\gamma = p(0) = ${qTex(y1)}$.`;
    const al = qWert(a.par.alpha), ga = qWert(a.par.gamma), be = qWert(a.par.beta);
    return passend(ist.A, qWert(a.soll.A), tol.A, [
      [(h / 6) * (y0 + 4 * y1 + y2), "Hier ist $h$ die halbe Breite: Die Fläche ist $\\frac{h}{3} \\cdot (y_0 + 4y_1 + y_2)$, nicht $\\frac{h}{6} \\cdot (…)$."],
      [(h / 3) * (y0 + y1 + y2), "Die Mitte zählt vierfach: $\\frac{h}{3} \\cdot (y_0 + 4y_1 + y_2)$."],
      [(al * h ** 3) / 3 + ga * h, "Du hast nur von 0 bis $h$ integriert. Die Fläche reicht von $−h$ bis $h$ – doppelt so viel."],
      [(2 * al * h ** 3) / 3 + 2 * ga * h + be * h * h, "Der $\\beta$-Teil fällt weg: $\\int_{−h}^{h} \\beta{}x\\,dx = 0$, weil sich die Flächen links und rechts aufheben."],
    ], "Integriere: $\\int_{−h}^{h} (\\alpha{}x^2 + \\beta{}x + \\gamma)\\,dx = \\frac{2}{3}\\alpha{}h^3 + 2\\gamma{}h$ – oder rechne direkt $\\frac{h}{3} \\cdot (y_0 + 4y_1 + y_2)$.");
  }
  const breite = a.typ === "symm" ? 2 * a.h : a.w;
  const g = ["g0", "g1", "g2"].map((k) => ist[k]);
  if (g.every((x) => x !== null)) {
    if (Math.abs(g[0] - 1) < 1e-9 && Math.abs(g[1] - 4) < 1e-9 && Math.abs(g[2] - 1) < 1e-9) return `$1 : 4 : 1$ ist nur das Verhältnis. Test mit $f(x) = 1$: Die Gewichte müssen zusammen die Breite ${breite} ergeben.`;
    if (Math.abs(g[0] + g[1] + g[2] - breite) > 1e-6) return `Test mit $f(x) = 1$: Links steht die Fläche ${breite}, rechts $g_0 + g_1 + g_2$. Die Gewichte müssen zusammen ${breite} ergeben.`;
    if (Math.abs(g[0] - g[2]) > 1e-6) return "Test mit $f(x) = x$: Damit links und rechts dasselbe herauskommt, müssen die äußeren Gewichte gleich sein: $g_0 = g_2$.";
  }
  return `Stelle für $f(x) = 1$, $f(x) = x$ und $f(x) = x^2$ je eine Bedingung auf und löse das Gleichungssystem. Kontrolle: $g_0 + g_1 + g_2 = ${breite}$.`;
}

/* ---------- Rechenwege (TeX-Zeilen, A5-sauber: nichts bleibt unvereinfacht stehen) ---------- */
/* Faktor · (Summe) – ohne „1 ·“ und dann auch ohne Klammer */
const malTex = (q, summe) => (qGleich(q, 1) ? summe : `${qTex(q)} \\cdot (${summe})`);
/* f(a) + 4 · f(m) + f(b) mit Zahlen; 4 · 1 wird gleich 4 */
const summeTex = (fa, fm, fb) => `${qTex(fa)} + ${qGleich(fm, 1) ? "4" : `4 \\cdot ${kl(fm)}`} + ${kl(fb)}`;
/* vor · (fa + 4 · fm + fb) = vor · S = Ergebnis */
function vorSumme(vor, fa, fm, fb, erg) {
  const S = qAdd(qAdd(fa, qMul(4, fm)), fb);
  const mitte = qGleich(vor, 1) || qGleich(S, 1) ? "" : ` = ${qTex(vor)} \\cdot ${kl(S)}`;
  return `${malTex(vor, summeTex(fa, fm, fb))}${mitte} = ${qTex(erg)}`;
}
const nZeile = (t, links = "N") => `${links} = ${vorSumme(t.vor, t.fa, t.fm, t.fb, t.N)}`;
/* x − y = Ergebnis (ganze Zahlen; bei y = 0 nur x) */
const minus = (x, y) => (y === 0 ? qTex(x) : `${qTex(x)} − ${kl(y)} = ${qTex(x - y)}`);
/* Vorfaktor (b − a)/6 mit Zwischenschritt, wenn er sich kürzen lässt */
function vorZeile(w) {
  const v = qDiv(w, 6), roh = `\\frac{${qTex(w)}}{6}`;
  return qTex(v) === roh ? `\\frac{b − a}{6} = ${roh}` : `\\frac{b − a}{6} = ${roh} = ${qTex(v)}`;
}
const werteZeile = (t) => `f(${qTex(t.a)}) = ${qTex(t.fa)}, \\quad f(${qTex(t.m)}) = ${qTex(t.fm)}, \\quad f(${qTex(t.b)}) = ${qTex(t.fb)}`;
/* Funktionswert einer Nicht-Polynom-Funktion: exakt, dazu gerundet, wenn nötig */
function npWert(F, x) {
  const v = F.f(x), ex = F.wTex(x);
  return Math.abs(rund(v, 4) - v) < 1e-12 ? (ex === dk(v, 4) ? ex : `${ex} = ${dk(v, 4)}`) : `${ex} \\approx ${dk(v, 4)}`;
}
const npSumme = (t) => `${dk(t.fa, 4)} + ${Math.abs(t.fm - 1) < 1e-12 ? "4" : `4 \\cdot ${dk(t.fm, 4)}`} + ${dk(t.fb, 4)}`;
function exaktZeilen(p, a, b, I) {
  const F = polyStamm(p), Fb = polyWert(F, b), Fa = polyWert(F, a);
  const kette = qNull(Fa) ? `${qTex(Fb)}` : `${qTex(Fb)} − ${kl(Fa)} = ${qTex(I)}`;
  return [`F(x) = ${polyTex(F)}`, `${intTex(a, b)} = F(${zTex(b)}) − F(${zTex(a)}) = ${kette}`];
}

export function rechenweg(a) {
  if (a.art === "anwenden") {
    if (a.typ === "mess") {
      const K = MESS.find((x) => x.id === a.kontext), [y0, y1, y2] = a.y, vor = Q(a.T, 6);
      return [
        K.integral.replace("{T}", `{${a.T}}`),
        `${K.label} \\approx ${malTex(vor, `${y0} + 4 \\cdot ${y1} + ${y2}`)} = ${qTex(vor)} \\cdot ${y0 + 4 * y1 + y2} = ${qTex(a.soll.N)}\\text{ ${K.einheit}}`,
      ];
    }
    if (a.typ === "np") {
      const F = NICHT_POLY[a.fn], t = a.teile;
      return [
        `m = \\frac{${a.a} + ${a.b}}{2} = ${dk(t.m)}`,
        `f(${a.a}) = ${npWert(F, a.a)}, \\quad f(${dk(t.m)}) = ${npWert(F, t.m)}, \\quad f(${a.b}) = ${npWert(F, a.b)}`,
        `N = ${qTex(Q(a.b - a.a, 6))} \\cdot (${npSumme(t)}) \\approx ${dk(t.N, 3)}`,
        `N \\approx ${dk(t.N, 3)} \\quad (\\text{exakt: } ${exaktTex(a.fn, a.a, a.b)} \\approx ${dk(a.I, 4)})`,
      ];
    }
    const t = a.teile;
    return [
      `m = \\frac{${qTex(t.a)} + ${kl(t.b)}}{2} = ${qTex(t.m)}, \\quad ${vorZeile(qSub(t.b, t.a))}`,
      werteZeile(t),
      nZeile(t),
      `\\text{Grad } ${polyGrad(a.p)} \\le 3 \\;\\Rightarrow\\; ${intTex(a.a, a.b)} = ${qTex(t.N)} \\text{ sogar exakt}`,
    ];
  }
  if (a.art === "exakt") {
    if (a.typ === "np") {
      const F = NICHT_POLY[a.fn], t = a.teile;
      return [
        `f(${a.a}) = ${npWert(F, a.a)}, \\quad f(${dk(t.m)}) = ${npWert(F, t.m)}, \\quad f(${a.b}) = ${npWert(F, a.b)}`,
        `N = ${qTex(Q(a.b - a.a, 6))} \\cdot (${npSumme(t)}) \\approx ${dk(t.N, 5)}`,
        `${intTex(a.a, a.b, F.tex)} = ${exaktTex(a.fn, a.a, a.b)} \\approx ${dk(a.I, 5)}`,
        `\\text{${F.grund}} \\;\\Rightarrow\\; \\text{nicht exakt}`,
        `\\text{Fehler} \\approx ${dk(t.N, 5)} − ${dk(a.I, 5)} \\approx ${dk(a.soll.E, 4)}`,
      ];
    }
    const z = [];
    if (a.tex) z.push(`f(x) = ${a.tex} = ${polyTex(a.p)}`);
    else z.push(`f(x) = ${polyTex(a.p)}`);
    z.push(a.grad <= 3 ? `\\text{Grad } ${a.grad} \\le 3 \\;\\Rightarrow\\; \\text{exakt}` : `\\text{Grad } ${a.grad} > 3 \\;\\Rightarrow\\; \\text{nicht exakt}`);
    if (a.n === 2) {
      const m = qDiv(qAdd(a.a, a.b), 2), t1 = polyTeile(a.p, a.a, m), t2 = polyTeile(a.p, m, a.b);
      z.push(werteZeile(t1), nZeile(t1, `N_1`), werteZeile(t2), nZeile(t2, `N_2`));
      z.push(`N = N_1 + N_2 = ${qTex(t1.N)} + ${kl(t2.N)} = ${qTex(a.N)}`);
    } else {
      const t = polyTeile(a.p, a.a, a.b);
      z.push(`m = ${qTex(t.m)}`, werteZeile(t), nZeile(t));
    }
    z.push(...exaktZeilen(a.p, a.a, a.b, a.I));
    z.push(qNull(a.soll.E) ? `\\text{Fehler} = ${qTex(a.N)} − ${kl(a.I)} = 0` : `\\text{Fehler} = ${qTex(a.N)} − ${kl(a.I)} = ${qTex(a.soll.E)}`);
    return z;
  }
  if (a.art === "fass") {
    const [ru, rm, ro] = a.radien, h = a.h;
    if (a.stufe === 5) {
      const V = a.Vziel * 1000, rechts = (6 * V) / (Math.PI * h), rest = rechts - 2 * ru * ru;
      return [
        `${a.Vziel}\\text{ l} = ${tausend(String(V))}\\text{ cm}^3`,
        `${tausend(String(V))} = ${qTex(Q(h, 6))} \\cdot \\pi \\cdot (${ru}^2 + 4r_m^2 + ${ru}^2)`,
        `${2 * ru * ru} + 4r_m^2 = \\frac{6 \\cdot ${tausend(String(V))}}{${h}\\pi} \\approx ${dkTex(rechts, 1)}`,
        `4r_m^2 \\approx ${dkTex(rechts, 1)} − ${2 * ru * ru} = ${dkTex(rest, 1)}`,
        `r_m^2 \\approx ${dkTex(rest / 4, 2)} \\;\\Rightarrow\\; r_m \\approx ${dk(a.soll.rm, 1)}\\text{ cm}`,
      ];
    }
    const z = [];
    if (a.durchmesser) z.push(`r = \\frac{d}{2}: \\quad r_u = ${dk(ru)}, \\; ${a.stufe === 4 ? "" : `r_m = ${dk(rm)}, \\; `}r_o = ${dk(ro)}`);
    if (a.stufe === 4) z.push(`r_m = \\frac{${dk(ru)} + ${dk(ro)}}{2} = ${dk(rm)}\\text{ cm}`);
    /* jede Querschnittsfläche in einer eigenen Zeile – sonst wird es am Handy zu breit */
    const A = (r) => (r === 0 ? "0" : `\\pi \\cdot ${dk(r)}^2 = ${dkTex(r * r, 2)}\\pi`);
    z.push(`A_u = ${A(ru)}`, `A_m = ${A(rm)}`, `A_o = ${A(ro)}`);
    const glieder = [ru > 0 ? `${dkTex(ru * ru, 2)}\\pi` : null, `4 \\cdot ${dkTex(rm * rm, 2)}\\pi`, ro > 0 ? `${dkTex(ro * ro, 2)}\\pi` : null].filter(Boolean);
    const S = ru * ru + 4 * rm * rm + ro * ro, Vcm = (h / 6) * Math.PI * S;
    z.push(`V \\approx ${qTex(Q(h, 6))} \\cdot ${glieder.length > 1 ? `(${glieder.join(" + ")})` : glieder[0]}`);
    z.push(`= ${qTex(Q(h, 6))} \\cdot ${dkTex(S, 2)}\\pi \\approx ${dkTex(Vcm, 0)}\\text{ cm}^3`);
    const st = a.stufe === 4 ? 2 : 1;
    const vergleich = { zylinder: "\\pi{}r^2h", kegel: "\\frac{1}{3}\\pi{}r^2h", kugel: "\\frac{4}{3}\\pi{}r^3", eimer: "\\frac{1}{3}\\pi{}h(r_u^2 + r_ur_o + r_o^2)" }[a.koerper];
    if (vergleich) z.push(`\\text{exakt: } ${vergleich} \\text{ – dieselbe Zahl}`);
    z.push(`V \\approx ${dk(a.soll.V, st)}\\text{ l}`);
    return z;
  }
  if (a.typ === "parabel") {
    const [y0, y1, y2] = a.y, h = a.h, { alpha, beta, gamma } = a.par;
    const h2 = Q(h * h);
    const z = [
      `x = 0: \\quad \\gamma = ${qTex(y1)}`,
      `x = ${h}: \\quad ${koef(h2, "\\alpha")} + ${koef(Q(h), "\\beta")} + \\gamma = ${qTex(y2)}`,
      `x = −${h}: \\quad ${koef(h2, "\\alpha")} − ${koef(Q(h), "\\beta")} + \\gamma = ${qTex(y0)}`,
      `\\text{addieren: } ${koef(Q(2 * h * h), "\\alpha")} + 2\\gamma = ${qTex(y0 + y2)}`,
      `${koef(Q(2 * h * h), "\\alpha")} = ${qTex(y0 + y2)} − 2\\gamma = ${minus(y0 + y2, 2 * y1)} \\;\\Rightarrow\\; \\alpha = ${qTex(alpha)}`,
    ];
    if (a.stufe === 3) {
      const A1 = qMul(qMul(Q(2, 3), alpha), h ** 3), A2 = qMul(2 * h, gamma);
      z.push(`A = \\frac{2}{3}\\alpha{}h^3 + 2\\gamma{}h = ${qNull(gamma) ? qTex(a.A) : `${qTex(A1)} + ${kl(A2)} = ${qTex(a.A)}`}`);
      z.push(`\\text{Probe: } A = ${vorSumme(Q(h, 3), Q(y0), Q(y1), Q(y2), a.A)}`);
    } else {
      z.push(`\\text{subtrahieren: } ${koef(Q(2 * h), "\\beta")} = ${minus(y2, y0)} \\;\\Rightarrow\\; \\beta = ${qTex(beta)}`);
      z.push(`p(x) = ${polyTex([gamma, beta, alpha])}`);
    }
    return z;
  }
  if (a.typ === "symm") {
    const h = a.h;
    return [
      `f(x) = 1: \\quad g_0 + g_1 + g_2 = ${2 * h}`,
      `f(x) = x: \\quad ${koef(Q(-h), "g_0")} + ${koef(Q(h), "g_2")} = 0 \\;\\Rightarrow\\; g_0 = g_2`,
      `f(x) = x^2: \\quad ${koef(Q(h * h), "g_0")} + ${koef(Q(h * h), "g_2")} = ${qTex(Q(2 * h ** 3, 3))} \\;\\Rightarrow\\; g_0 = g_2 = ${qTex(a.soll.g0)}`,
      `g_1 = ${2 * h} − 2g_0 = ${2 * h} − ${qTex(qMul(2, a.soll.g0))} = ${qTex(a.soll.g1)} \\;\\Rightarrow\\; g_0 : g_1 : g_2 = 1 : 4 : 1`,
    ];
  }
  const w = a.w, halb = Q(w, 2);
  return [
    `f(x) = 1: \\quad g_0 + g_1 + g_2 = ${w}`,
    `f(x) = x: \\quad ${koef(halb, "g_1")} + ${koef(Q(w), "g_2")} = ${qTex(Q(w * w, 2))} \\;\\Rightarrow\\; g_1 = ${w} − 2g_2`,
    `f(x) = x^2: \\quad ${koef(qMul(halb, halb), "g_1")} + ${koef(Q(w * w), "g_2")} = ${qTex(Q(w ** 3, 3))}`,
    `\\text{einsetzen: } ${qTex(Q(w ** 3, 4))} + ${koef(Q(w * w, 2), "g_2")} = ${qTex(Q(w ** 3, 3))} \\;\\Rightarrow\\; g_2 = ${qTex(a.soll.g2)}`,
    `g_1 = ${w} − 2g_2 = ${w} − ${qTex(qMul(2, a.soll.g2))} = ${qTex(a.soll.g1)}`,
    `g_0 = ${w} − ${kl(a.soll.g1)} − ${kl(a.soll.g2)} = ${qTex(a.soll.g0)} \\;\\Rightarrow\\; g_0 : g_1 : g_2 = 1 : 4 : 1`,
  ];
}

export function tipp(a) {
  if (a.art === "anwenden") return "Mitte m = (a + b)/2, dann N = (b − a)/6 · (f(a) + 4f(m) + f(b)).";
  if (a.art === "exakt") return "Exakt genau dann, wenn f ein Polynom vom Grad höchstens 3 ist. Fehler = Näherung − exakter Wert.";
  if (a.art === "fass") return "Querschnitte A = πr² unten, in der Mitte und oben; V ≈ h/6 · (A_u + 4A_m + A_o); 1 l = 1000 cm³.";
  if (a.typ === "parabel") return "x = 0 liefert γ. Die Gleichungen für x = h und x = −h addieren (α) bzw. subtrahieren (β).";
  return "Je eine Gleichung für f(x) = 1, x und x²: links das exakte Integral, rechts die Regel.";
}

/* ---------- GFS: Gliederung, Tipps, Kolloquium ---------- */
export const GLIEDERUNG = [
  { min: 2, titel: "Einstieg: ein Fass, drei Messungen", text: "Zeig ein bauchiges Gefäß oder das Bild eines Weinfasses und frag: Wie viel passt hinein, wenn man nur unten, in der Mitte und oben messen darf? Dazu ein Satz zur Geschichte: Johannes Kepler veröffentlichte 1615 ein Buch über das Ausmessen von Weinfässern – daher der Name." },
  { min: 3, titel: "Die Idee: Kurve durch Parabel ersetzen", text: "Am Graphen zeigen: Ein Wert gibt ein Rechteck, zwei Werte ein Trapez, drei Werte genau eine Parabel. Deren Fläche lässt sich exakt ausrechnen – und sie liegt sehr nah an der gesuchten Fläche." },
  { min: 5, titel: "Herleitung an der Tafel", text: "Intervall auf [−h; h] verschieben, Parabel αx² + βx + γ durch die drei Punkte legen, γ, α und β bestimmen, integrieren. Der β-Teil fällt weg, übrig bleibt h/3 · (y₀ + 4y₁ + y₂). Mit h = (b − a)/2 ist das die Fassregel." },
  { min: 4, titel: "Wie gut ist sie? Exakt bis Grad 3", text: "Beispiel eˣ auf [0; 2]: 6,421 statt 6,389. Vergleich mit dem Rechteck (0,952 zu wenig) und dem Trapez (2,000 zu viel). Dann die Überraschung: Für 1, x, x² und x³ stimmt die Regel exakt – also für alle Polynome bis Grad 3, für x⁴ nicht mehr." },
  { min: 3, titel: "Anwendung Fass und Fazit", text: "Volumen über Querschnitte: Zylinder, Kegel und Kugel kommen exakt heraus, das Weinfass bis auf wenige Promille. Ausblick summierte Regel. Fazit in einem Satz: drei Werte, Gewichte 1 : 4 : 1 – und für Polynome bis Grad 3 sogar exakt." },
];

export const TIPPS = [
  "Rechne die Herleitung vorher mehrmals frei an der Tafel – vor allem den Moment, in dem der β-Teil wegfällt. Genau dort wird im Kolloquium oft nachgefragt.",
  "Bring ein echtes Gefäß mit (Eimer, Blumentopf, Vase), miss drei Durchmesser und die Höhe, rechne live mit der Fassregel und gieß zur Kontrolle Wasser mit einem Messbecher ein.",
  "Aufs Handout gehören die Fassregel, die Herleitung in fünf Zeilen, die Tabelle Rechteck – Trapez – Fass für eˣ auf [0; 2] und die Querschnitte von Zylinder, Kegel und Kugel.",
];

export const KOLLOQUIUM = [
  { stufe: "Basis", frage: "Was sagt die Keplersche Fassregel, und was bedeuten die einzelnen Zeichen?",
    antwort: "Das Integral von a bis b wird geschätzt durch (b − a)/6 · (f(a) + 4f(m) + f(b)). Dabei sind a und b die Grenzen, m = (a + b)/2 ist die Mitte, und f(a), f(m), f(b) sind die drei Funktionswerte. Man braucht also nur drei Werte und keine Stammfunktion." },
  { stufe: "Basis", frage: "Woher kommt das Gewicht 4 in der Mitte?",
    antwort: "Aus der Fläche unter der Parabel durch die drei Punkte: Auf [−h; h] ergibt sie h/3 · (y₀ + 4y₁ + y₂). Ohne Parabel geht es auch: Die Regel soll für 1, x und x² stimmen. Aus f = 1 folgt g₀ + g₁ + g₂ = 2h, aus f = x folgt g₀ = g₂, aus f = x² folgt g₀ = g₂ = h/3. Für die Mitte bleiben 4h/3 – das Verhältnis 1 : 4 : 1." },
  { stufe: "Basis", frage: "Warum darf man das Intervall für die Herleitung auf [−h; h] verschieben?",
    antwort: "Verschiebt man den Graphen nach links oder rechts, ändert sich die Fläche darunter nicht. Mit g(t) = f(m + t) wird aus [a; b] das Intervall [−h; h], und die drei Werte bleiben dieselben: g(−h) = f(a), g(0) = f(m), g(h) = f(b). Die Rechnung wird viel kürzer, weil die Mitte bei 0 liegt." },
  { stufe: "Basis", frage: "Warum fällt der Term mit β beim Integrieren weg?",
    antwort: "βx ist eine ungerade Funktion: Links von 0 liegt genauso viel Fläche unter der x-Achse wie rechts darüber. Rechnerisch ist das Integral von βx von −h bis h gleich β · h²/2 − β · h²/2, also 0. Deshalb hängt die Fläche nur von α und γ ab." },
  { stufe: "Vertiefung", frage: "Warum ist die Regel auch für x³ exakt, obwohl sie nur eine Parabel benutzt?",
    antwort: "Auch x³ ist ungerade: Auf [−h; h] ist das Integral 0, und die Regel liefert h/3 · (−h³ + h³), also ebenfalls 0. Weil Integral und Regel beide linear sind, stimmt die Regel dann für jede Summe aus Vielfachen von 1, x, x² und x³ – also für alle Polynome bis Grad 3." },
  { stufe: "Vertiefung", frage: "Wie groß ist der Fehler bei eˣ auf [0; 2] – und ist die Näherung zu groß oder zu klein?",
    antwort: "Die Fassregel liefert (1 + 4e + e²)/3 ≈ 6,4207, exakt ist e² − 1 ≈ 6,3891. Der Fehler ist also etwa 0,0317, knapp 0,5 Prozent, und die Näherung ist zu groß. Das passt zur Fehlerformel: Die vierte Ableitung von eˣ ist positiv." },
  { stufe: "Vertiefung", frage: "Wie hängen Rechteck-, Trapez- und Fassregel zusammen?",
    antwort: "Die Fassregel ist ein gewichtetes Mittel: zwei Drittel Rechteck (Höhe in der Mitte) plus ein Drittel Trapez. Bei eˣ auf [0; 2] ist das Rechteck um 0,952 zu klein, das Trapez um 2,000 zu groß. Die Fehler haben verschiedene Vorzeichen, der des Trapezes ist etwa doppelt so groß – im Verhältnis 2 : 1 gemischt heben sie sich fast auf." },
  { stufe: "Vertiefung", frage: "Warum kommen Zylinder, Kegel und Kugel mit der Fassregel exakt heraus?",
    antwort: "Das Volumen ist das Integral der Querschnittsfläche A(z) über die Höhe. Beim Zylinder ist A konstant, beim Kegel wächst der Radius linear, also ist A quadratisch, und bei der Kugel ist r² = R² − (z − R)² ebenfalls quadratisch. Alle drei sind Polynome vom Grad höchstens 2. Bei der Kugel etwa: 2R/6 · 4πR² = 4/3 · πR³." },
  { stufe: "Profi", frage: "Für welche Funktionen ist die Regel schlecht, und wie groß ist der Fehler bei x⁴?",
    antwort: "Für x⁴ auf [−h; h] liefert die Regel 2h⁵/3, exakt sind 2h⁵/5 – der Fehler ist 4h⁵/15, also (b − a)⁵/120. Allgemein ist der Fehler (b − a)⁵/2880 · f⁗(ξ) für eine Stelle ξ im Intervall. Schlecht wird die Regel, wenn die vierte Ableitung groß ist, etwa bei 1/x nahe 0, oder wenn f einen Knick oder Sprung hat." },
  { stufe: "Profi", frage: "Was ist die summierte Fassregel, und wie schnell wird sie genauer?",
    antwort: "Man teilt [a; b] in gleich breite Stücke und wendet auf jedes die Fassregel an. Halbiert man die Breite, wird der Fehler je Stück etwa 32-mal kleiner, es gibt aber doppelt so viele Stücke – insgesamt etwa 16-mal kleiner. Bei eˣ auf [0; 2]: 0,0317 mit einem Fass, 0,0022 mit zwei und 0,00014 mit vier." },
  { stufe: "Profi", frage: "Warum ist die Fassregel beim echten Weinfass nicht ganz exakt?",
    antwort: "Ist die Fasswand eine Parabel, dann ist der Radius r(z) quadratisch und die Fläche A(z) = π · r(z)² ein Polynom vom Grad 4. Dann liefert die Fassregel genau π · h · (r_u − 2r_m + r_o)²/30 zu viel. Bei 80 cm Höhe und den Radien 25, 30 und 25 cm sind das etwa 0,84 Liter von rund 203 Litern, gut 0,4 Prozent." },
  { stufe: "Profi", frage: "Geht es mit drei Funktionswerten noch genauer?",
    antwort: "Ja, wenn man die Stellen frei wählen darf: Bei der Gauß-Quadratur mit drei Stellen liegen sie bei 0 und bei etwa ±0,775 · h, die Gewichte sind 8h/9 in der Mitte und 5h/9 außen. Diese Regel ist sogar bis Grad 5 exakt. Die Fassregel hat dafür den Vorteil, dass sie Rand und Mitte benutzt – genau dort, wo man beim Fass messen kann." },
];
