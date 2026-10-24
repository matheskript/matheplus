/* ============================================================
   GFS-Trainer · Kugeln (Kursstufe 1, Kap. VI Geraden und Ebenen)
   Reine Logik ohne React:
     · Kugelgleichung: Mittelpunktsform, ausmultiplizierte Form, quadratische
       Ergänzung (auch „keine Kugel“), Punktprobe
     · Gerade – Kugel: Einsetzen, Diskriminante, Schnittpunkte, Sehne
     · Ebene – Kugel: Abstand (Hesse-Normalenform), Schnittkreis, Berührpunkt
     · Tangentialebene, Ortung mit drei Kugeln
     · vier Übungsgeneratoren mit Prüfung, gezielter Rückmeldung, Tipp und
       vollständigem Rechenweg; Gliederung, Tipps, Kolloquium
   Exakt gerechnet: Brüche aus rechnen2.js, Wurzeln aus wzahl.js.
   Getestet in tests/gfsKugeln.test.mjs.
   Nichts stammt aus einem Schulbuch: Aufgaben, Zahlen und Formulierungen sind eigene.
   ============================================================ */
import { ggT, q, qAdd, qSub, qMul, qDiv, qNeg, qAbs, qNum, qGleich, qNull, qTex, qText, qLies } from "./rechnen2.js";
import { wTerm, wZ, wLies, wTex, wText, wNum, wGleich, wMul, wWurzel } from "./wzahl.js";

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

/* ---------- Vektoren (ganze Zahlen) ---------- */
export const vAdd = (a, b) => a.map((x, i) => x + b[i]);
export const vSub = (a, b) => a.map((x, i) => x - b[i]);
export const vMal = (a, k) => a.map((x) => x * k);
export const skalar = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const quadrat = (a) => skalar(a, a);
export const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const ggT3 = (v) => v.reduce((g, x) => ggT(g, x), 0) || 1;
const gleichV = (a, b) => a.every((x, i) => x === b[i]);
const nullAnz = (v) => v.filter((x) => x === 0).length;

/* Ganzzahlige Vektoren mit |v|² = n2 (Pythagoras-Quadrupel) */
const GITTER = new Map();
export function gitterVektoren(n2) {
  if (GITTER.has(n2)) return GITTER.get(n2);
  const l = [], g = Math.floor(Math.sqrt(n2));
  for (let a = -g; a <= g; a++) for (let b = -g; b <= g; b++) {
    const c2 = n2 - a * a - b * b;
    if (c2 < 0) continue;
    const c = Math.round(Math.sqrt(c2));
    if (c * c !== c2) continue;
    l.push([a, b, c]);
    if (c !== 0) l.push([a, b, -c]);
  }
  GITTER.set(n2, l);
  return l;
}
/* bevorzugt Vektoren mit höchstens einer Null (sonst wird es achsenparallel und langweilig) */
const schoen = (liste) => { const s = liste.filter((v) => nullAnz(v) <= 1); return s.length ? s : liste; };

/* kleine Richtungsvektoren: Einträge −3 … 3, teilerfremd, |u|² ≤ 14, erster Eintrag ≠ 0 positiv */
const KLEIN = (() => {
  const l = [];
  for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) for (let c = -3; c <= 3; c++) {
    const v = [a, b, c];
    if (nullAnz(v) === 3 || ggT3(v) !== 1 || quadrat(v) > 14) continue;
    const erst = v.find((x) => x !== 0);
    if (erst < 0) continue;
    l.push(v);
  }
  return l;
})();

/* ---------- Zahlen als Text und TeX ---------- */
const qz = (x) => (typeof x === "number" ? q(x) : x);
export const kTex = (x) => qTex(qz(x));
export const kText = (x) => qText(qz(x));
export const rund = (x, n = 2) => { const f = 10 ** n; return Math.round(x * f + (x >= 0 ? 1e-9 : -1e-9)) / f; };
export const dk = (x, n = 2) => String(rund(x, n)).replace("-", "−").replace(".", ",");
/* Betrag einer Zahl als TeX (für „… − 3“) */
const bTex = (x) => { const v = qz(x); return qTex(q(Math.abs(v.z), v.n)); };
/* Wurzel aus einer nicht negativen rationalen Zahl, exakt: √(p/q) = √(p·q)/q */
export const wurzelQ = (x) => { const v = qz(x); return v.z <= 0 ? wZ(0) : wTerm(q(1, v.n), v.z * v.n); };
/* Vorfaktor ohne 1: „“, „−“, „2“, „−3“ */
const vorf = (k) => (k === 1 ? "" : k === -1 ? "−" : String(k).replace("-", "−"));

export const punktTex = (name, p) => `${name}(${p.map(kTex).join(" \\mid ")})`;
export const spalteTex = (v) => `\\spalte{${kTex(v[0])}}{${kTex(v[1])}}{${kTex(v[2])}}`;
/* lineare Terme: „2x_1 + x_2 − 2x_3“ (Koeffizienten ganz oder Bruch, Nullen fallen weg) */
export function linTex(koeff, namen = ["x_1", "x_2", "x_3"]) {
  let s = "";
  koeff.forEach((c0, i) => {
    const c = qz(c0);
    if (qNull(c)) return;
    const a = qAbs(c);
    const teil = `${a.z === 1 && a.n === 1 ? "" : qTex(a)}${namen[i]}`;
    s += s ? ` ${c.z < 0 ? "−" : "+"} ${teil}` : `${c.z < 0 ? "−" : ""}${teil}`;
  });
  return s || "0";
}
/* Anhang „ + 3“ / „ − 5“ (leer bei 0) */
const anh = (x) => { const v = qz(x); return qNull(v) ? "" : ` ${v.z < 0 ? "−" : "+"} ${bTex(v)}`; };
/* Ebene in Koordinatenform */
export const ebeneTex = (n, k) => `${linTex(n)} = ${kTex(k)}`;
/* Gerade in Parameterform */
export const geradeTex = (p, u) => `\\vec{x} = ${spalteTex(p)} + t \\cdot ${spalteTex(u)}`;
/* (x_i − m_i)² mit richtigem Vorzeichen; bei m_i = 0 nur x_i² */
const klammer = (name, m0) => { const m = qz(m0); return qNull(m) ? `${name}^2` : `(${name} ${m.z > 0 ? "−" : "+"} ${bTex(m)})^2`; };
/* Kugel in Mittelpunktsform */
export const kugelTex = (m, r2) => `${klammer("x_1", m[0])} + ${klammer("x_2", m[1])} + ${klammer("x_3", m[2])} = ${kTex(r2)}`;
/* Kugel ausmultipliziert: f(x₁² + x₂² + x₃²) + a x₁ + b x₂ + c x₃ + e = 0 */
export function kugelAllgTex(f, lin, e) {
  const v = f === 1 ? "" : String(f);
  const l = linTex(lin);
  return `${v}x_1^2 + ${v}x_2^2 + ${v}x_3^2${l === "0" ? "" : (l.startsWith("−") ? ` − ${l.slice(1)}` : ` + ${l}`)}${anh(e)} = 0`;
}
/* quadratischer Term in t: „2t^2 − 12t + 10“ */
export function quadTex(a, b, c) {
  let s = `${vorf(a)}t^2`;
  if (b) s += ` ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}t`;
  if (c) s += ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}`;
  return s;
}
/* Koordinate eines Geradenpunkts: „−3 + t“, „2t“, „6“ */
const kompTex = (p, u) => {
  if (u === 0) return kTex(p);
  const t = `${Math.abs(u) === 1 ? "" : Math.abs(u)}t`;
  if (p === 0) return `${u < 0 ? "−" : ""}${t}`;
  return `${kTex(p)} ${u < 0 ? "−" : "+"} ${t}`;
};
/* (u t + w)² für die eingesetzte Kugelgleichung: „(t − 5)^2“, „(2t)^2“, „3^2“, „(−4)^2“ */
const einsetzTex = (u, w) => {
  if (u === 0) return w < 0 ? `(${kTex(w)})^2` : `${w}^2`;
  const t = `${vorf(u)}t`;
  if (w === 0) return u === 1 ? "t^2" : `(${t})^2`;
  return `(${t} ${w < 0 ? "−" : "+"} ${Math.abs(w)})^2`;
};
/* Differenz (p − m)² für die Punktprobe: „(5 − 2)^2“, „(3 + 1)^2“, „(−2)^2“, „4^2“ */
const diffTex = (p, m) => {
  if (m === 0) return p < 0 ? `(${kTex(p)})^2` : `${p}^2`;
  return `(${kTex(p)} ${m > 0 ? "−" : "+"} ${Math.abs(m)})^2`;
};
/* Summe von Zahlen als Text: „9 + 16 + 0“, „4 − 1 − 6“ */
const summeTex = (zahlen) => zahlen.map((x, i) => (i === 0 ? kTex(x) : ` ${qz(x).z < 0 ? "−" : "+"} ${bTex(x)}`)).join("");
/* r = √(r²) = vereinfacht */
export function radiusTex(r2, name = "r") {
  const r = wurzelQ(r2), roh = `\\sqrt{${kTex(r2)}}`;
  return roh === wTex(r) ? `${name} = ${roh}` : `${name} = ${roh} = ${wTex(r)}`;
}

/* ---------- Die Mathematik ---------- */

/* Kugel aus der ausmultiplizierten Form f(x₁² + x₂² + x₃²) + a x₁ + b x₂ + c x₃ + e = 0:
   M = (−a/(2f) | −b/(2f) | −c/(2f)), r² = (a² + b² + c²)/(4f²) − e/f; art: kugel | punkt | leer */
export function kugelAusAllgemein(a, b, c, e, f = 1) {
  const F = q(f);
  const m = [a, b, c].map((k) => qDiv(qNeg(qz(k)), qMul(q(2), F)));
  const r2 = qSub(m.reduce((s, x) => qAdd(s, qMul(x, x)), q(0)), qDiv(qz(e), F));
  return { m, r2, art: r2.z > 0 ? "kugel" : r2.z === 0 ? "punkt" : "leer" };
}
/* Koeffizienten der ausmultiplizierten Form (f = 1): [a, b, c], e */
export function kugelAllgemein(m, r2) {
  const M = m.map(qz);
  return { lin: M.map((x) => qMul(q(-2), x)), e: qSub(M.reduce((s, x) => qAdd(s, qMul(x, x)), q(0)), qz(r2)) };
}

/* Punktprobe: Wert der linken Seite und Lage */
export function punktLage(m, r, p) {
  const w = quadrat(vSub(p, m));
  return { w, lage: w < r * r ? "innen" : w === r * r ? "auf" : "aussen" };
}

/* Gerade x = p + t·u in Kugel (m, r²) einsetzen: u²t² + 2u·w t + (w² − r²) = 0 mit w = p − m.
   D = b² − 4ac = 4u²(r² − d²), d = Abstand von M zur Geraden. Lösungen t exakt (wzahl), Punkte numerisch. */
export function geradeKugel(m, r2, p, u) {
  const w = vSub(p, m);
  const a = quadrat(u), b = 2 * skalar(u, w), c = quadrat(w) - r2;
  const D = b * b - 4 * a * c;
  const lage = D > 0 ? "sekante" : D === 0 ? "tangente" : "passante";
  const d2 = q(quadrat(kreuz(u, w)), a);              // Abstand² von M zur Geraden
  let t = [];
  if (D >= 0) {
    const wD = wWurzel(D), vor = wZ(q(-b, 2 * a)), teil = wMul(wD, wZ(q(1, 2 * a)));
    const minus = wMul(teil, wZ(q(-1)));
    t = D === 0 ? [wZ(q(-b, 2 * a))] : [summe(vor, minus), summe(vor, teil)];
  }
  const tn = t.map(wNum);
  return { a, b, c, D, lage, d2, w, t, tn, punkte: tn.map((x) => p.map((pi, i) => pi + x * u[i])) };
}
const summe = (x, y) => { const r = []; for (const s of [...x, ...y]) { const i = r.findIndex((k) => k.w === s.w); if (i < 0) r.push({ ...s }); else r[i] = { w: s.w, c: qAdd(r[i].c, s.c) }; } return r.filter((s) => !qNull(s.c)).sort((p1, p2) => p1.w - p2.w); };

/* Ebene n·x = k und Kugel (m, r): Abstand d (exakt), Lage, Lotfußpunkt F (exakt), Schnittkreisradius ρ (exakt) */
export function ebeneKugel(m, r, n, k) {
  const n2 = quadrat(n), nm = skalar(n, m), diff = nm - k;
  const d = wTerm(q(Math.abs(diff), n2), n2);          // |n·m − k| / |n|
  const d2 = q(diff * diff, n2);
  const lambda = q(k - nm, n2);
  const F = m.map((mi, i) => qAdd(q(mi), qMul(lambda, q(n[i]))));
  const rho2 = qSub(q(r * r), d2);
  const lage = rho2.z > 0 ? "kreis" : rho2.z === 0 ? "beruehrt" : "keine";
  return { n2, nm, diff, d, d2, lambda, F, rho2, rho: rho2.z > 0 ? wurzelQ(rho2) : wZ(0), lage };
}

/* Tangentialebene in B: n = b − m, k = n·b; liefert auch die zweite Form (x − m)·n = r² */
export function tangentialebene(m, b) {
  const n = vSub(b, m);
  return { n, k: skalar(n, b), r2: quadrat(n) };
}

/* Ortung mit drei Kugeln (Mittelpunkte O, (a|0|0), (0|b|0)): Ebenen aus Differenzen, dann x₃ */
export function ortung(r1, a, r2, b, r3) {
  const x1 = q(a * a + r1 * r1 - r2 * r2, 2 * a);      // K2 − K1: −2a x₁ + a² = r2² − r1²
  const x2 = q(b * b + r1 * r1 - r3 * r3, 2 * b);
  const x3q = qSub(q(r1 * r1), qAdd(qMul(x1, x1), qMul(x2, x2)));
  return { x1, x2, x3q, x3: x3q.z >= 0 ? wurzelQ(x3q) : null };
}

/* Beispiele der Herleitung (überall dieselbe Kugel) – die Seite zeigt genau diese Zahlen */
export const BEISPIEL = {
  m: [2, -1, 3], r: 5,
  punkte: { P: [5, 3, 3], Q: [1, 1, 1], R: [7, -1, -1] },
  allgemein: { lin: [-4, 2, -6], e: -11 },
  leer: { lin: [-2, 0, 4], e: 6 },
  g: { p: [-3, -2, 6], u: [1, 1, 0] },
  h: { p: [3, 0, 8], u: [1, 1, 0] },
  k: { p: [3, 0, 9], u: [1, 1, 0] },
  E: { n: [2, 1, -2], k: 6 }, Eb: { n: [2, 1, -2], k: 12 }, Eb2: { n: [2, 1, -2], k: -18 }, Ek: { n: [2, 1, -2], k: 15 },
  B: [6, -4, 3],
  ortung: { r1: 7, a: 8, r2: 9, b: 12, r3: 11 },
  /* Animation „Gerade“: g_c: x = (5 | −5 | 3 + c) + t(−3 | 4 | 0) hat von M den Abstand c (Lotfußpunkt bei t = 1 senkrecht über M) */
  anim: { u: [-3, 4, 0], c: [3, 5, 6] },
};
export const animGerade = (c) => ({ p: [5, -5, 3 + c], u: [-3, 4, 0] });

/* ---------- Labor ----------
   Gerade: g = M − u + σ·e₃ + t·u mit u = (−3 | 4 | 0) → 25t² − 50t + (σ² + 25 − r²) = 0, Abstand |σ|.
   Ebene: E: 2x₁ + x₂ − 2x₃ = n·m + 3σ, Abstand |σ|. */
export const LABOR = { u: [-3, 4, 0], n: [2, 1, -2], m: [-3, 3], r: [1, 6], extra: 3 };
export function laborGerade(m, r, s) {
  const u = LABOR.u, p = [m[0] - u[0], m[1] - u[1], m[2] + s];
  const e = geradeKugel(m, r * r, p, u);
  const rest = r * r - s * s;                          // r² − d²
  const wurzel = rest > 0 ? wWurzel(rest) : wZ(0);
  const fuss = [m[0], m[1], m[2] + s];                  // Punkt von g, der M am nächsten ist (t = 1)
  const exaktPunkte = rest >= 0 && Number.isInteger(Math.sqrt(rest));
  const punkte = rest < 0 ? [] : rest === 0 ? [fuss.map((x) => q(x))]
    : exaktPunkte ? [-1, 1].map((sg) => fuss.map((x, i) => qAdd(q(x), q(sg * Math.sqrt(rest) * u[i], 5)))) : null;
  return { ...e, p, u, s, d: Math.abs(s), rest, sehne: rest > 0 ? wMul(wZ(q(2)), wurzel) : wZ(0), fuss, punkteExakt: punkte };
}
export function laborEbene(m, r, s) {
  const n = LABOR.n, k = skalar(n, m) + 3 * s;
  return { n, k, s, ...ebeneKugel(m, r, n, k) };
}

/* ---------- Eingaben lesen ---------- */
/* rationale Zahl: 3, −2, 7/3, 2,5 */
export const liesQ = (s) => qLies(String(s ?? "").replace(/\s+/g, ""));
/* Zahl mit Wurzel oder Dezimalzahl: „2√6“, „√24“, „3√2/2“, „4,9“ */
export function liesW(s) {
  const t = String(s ?? "").trim();
  if (!t) return null;
  const w = wLies(t);
  return w ? { w, dezimal: /[.,]/.test(t) && !/√|sqrt|wurzel/i.test(t) } : null;
}
/* Wurzel-Antwort: exakt gleich oder als Dezimalzahl auf zwei Nachkommastellen */
const TOL = 0.0051;
export const trifftW = (ist, soll) => !!ist && (wGleich(ist.w, soll) || (ist.dezimal && Math.abs(wNum(ist.w) - wNum(soll)) <= TOL + 1e-12));

/* ---------- Übungen ---------- */
export const ARTEN = [
  { id: "gleichung", name: "Kugelgleichung" },
  { id: "gerade", name: "Punkt und Gerade" },
  { id: "ebene", name: "Ebene und Kugel" },
  { id: "tangential", name: "Tangentialebene" },
];
export const STUFEN_NAMEN = {
  gleichung: ["Ablesen", "Aufstellen", "Ergänzen", "Profi"],
  gerade: ["Punktprobe", "Einsetzen", "Schnittpunkte", "Berühren", "Sehne"],
  ebene: ["Abstand", "Radius", "Schnittkreis", "Parameter"],
  tangential: ["Normalenvektor", "Koordinatenform", "Aus der Gleichung", "Kugel auf der Ebene"],
};
export const stufenZahl = (art) => (STUFEN_NAMEN[art] || STUFEN_NAMEN.gleichung).length;

export const PUNKT_LAGE = [{ id: "innen", name: "innerhalb" }, { id: "auf", name: "auf K" }, { id: "aussen", name: "außerhalb" }];
export const GERADE_LAGE = [{ id: "passante", name: "Passante" }, { id: "tangente", name: "Tangente" }, { id: "sekante", name: "Sekante" }];
export const EBENE_LAGE = [{ id: "keine", name: "kein gemeinsamer Punkt" }, { id: "beruehrt", name: "Berührpunkt" }, { id: "kreis", name: "Schnittkreis" }];
const LAGE_NAME = Object.fromEntries([...PUNKT_LAGE, ...GERADE_LAGE, ...EBENE_LAGE].map((o) => [o.id, o.name]));

const R2_QUADRAT = [4, 9, 16, 25, 36, 49];
const R2_WURZEL = [7, 8, 10, 12, 13, 18, 20, 27, 28, 32, 45, 50];
const NORMALEN3 = gitterVektoren(9).filter((v) => nullAnz(v) === 0);       // (1 | 2 | 2) mit Vertauschungen und Vorzeichen
const NORMALEN7 = gitterVektoren(49).filter((v) => nullAnz(v) === 0);      // (2 | 3 | 6) …
const mZufall = (zufall, g = 4) => { for (;;) { const m = [zufall(-g, g), zufall(-g, g), zufall(-g, g)]; if (nullAnz(m) <= 1) return m; } };
const BLOCK_M = (modus = "ganzvz") => ({ typ: "punkt", name: "M", ks: ["m1", "m2", "m3"], modus });
const BLOCK_R = { typ: "zahl", k: "r", tex: "r", modus: "wurzel" };

/* Aufgabe vervollständigen: Schlüssel, Typen, Lösungstexte */
function fertig(a) {
  const typen = {};
  for (const b of a.bloecke) {
    if (b.typ === "wahl") typen[b.k] = "wahl";
    else if (b.typ === "zahl") typen[b.k] = b.modus === "wurzel" ? "w" : "q";
    else for (const k of b.ks) typen[k] = "q";
  }
  const loesung = {};
  for (const [k, typ] of Object.entries(typen)) {
    const v = a.soll[k];
    loesung[k] = typ === "wahl" ? v : typ === "w" ? wText(v) : qText(qz(v));
  }
  return { ...a, typen, keys: Object.keys(typen), loesung };
}

export function aufgabe(art, stufe, zufall = zz) {
  const s = Math.max(1, Math.min(stufenZahl(art), Math.round(stufe || 1)));
  if (art === "gerade") return aufgabeGerade(s, zufall);
  if (art === "ebene") return aufgabeEbene(s, zufall);
  if (art === "tangential") return aufgabeTangential(s, zufall);
  return aufgabeGleichung(s, zufall);
}

/* ===== Kugelgleichung: 1 Ablesen · 2 Aufstellen (Punkt oder Durchmesser) · 3 Ergänzen · 4 Vorfaktor oder halbe Koordinaten ===== */
function aufgabeGleichung(s, zufall) {
  const art = "gleichung";
  const r2Wahl = (anteil) => (zufall(1, 10) <= anteil ? wahl(R2_QUADRAT, zufall) : wahl(R2_WURZEL, zufall));
  const sollMR = (m, r2) => ({ m1: qz(m[0]), m2: qz(m[1]), m3: qz(m[2]), r: wurzelQ(r2) });
  if (s === 1) {
    const m = mZufall(zufall, 6), r2 = r2Wahl(7);
    return fertig({ art, stufe: s, variante: "ablesen", m, r2: q(r2),
      text: `Die Kugel K hat die Gleichung $${kugelTex(m, r2)}$. Gib den Mittelpunkt M und den Radius r an.`,
      bloecke: [BLOCK_M(), BLOCK_R], soll: sollMR(m, r2) });
  }
  if (s === 2) {
    if (zufall(0, 1) === 0) {
      const m = mZufall(zufall, 5);
      let v;
      do { v = [zufall(-5, 5), zufall(-5, 5), zufall(-5, 5)]; } while (nullAnz(v) > 1 || quadrat(v) > 50);
      const P = vAdd(m, v), r2 = quadrat(v);
      return fertig({ art, stufe: s, variante: "punkt", m, P, v, r2: q(r2),
        text: `Die Kugel K hat den Mittelpunkt $${punktTex("M", m)}$ und geht durch den Punkt $${punktTex("P", P)}$. Stelle ihre Gleichung auf: $${klammer("x_1", m[0])} + ${klammer("x_2", m[1])} + ${klammer("x_3", m[2])} = r^2$. Gib $r^2$ und den Radius r an.`,
        bloecke: [{ typ: "zahl", k: "r2", tex: "r^2", modus: "ganz" }, BLOCK_R], soll: { r2: q(r2), r: wurzelQ(r2) } });
    }
    const m = mZufall(zufall, 4);
    let v;
    do { v = [zufall(-4, 4), zufall(-4, 4), zufall(-4, 4)]; } while (nullAnz(v) > 1);
    const A = vSub(m, v), B = vAdd(m, v), r2 = quadrat(v);
    return fertig({ art, stufe: s, variante: "durchmesser", m, A, B, v, r2: q(r2),
      text: `Die Punkte $${punktTex("A", A)}$ und $${punktTex("B", B)}$ liegen sich auf einer Kugel genau gegenüber: Die Strecke AB ist ein Durchmesser. Gib den Mittelpunkt M und den Radius r der Kugel an.`,
      bloecke: [BLOCK_M(), BLOCK_R], soll: sollMR(m, r2) });
  }
  if (s === 3) {
    const m = mZufall(zufall, 5), r2 = r2Wahl(6);
    const { lin, e } = kugelAllgemein(m, r2);
    return fertig({ art, stufe: s, variante: "ergaenzen", m, r2: q(r2), f: 1, lin, e,
      text: `Zeige, dass $${kugelAllgTex(1, lin, e)}$ eine Kugel beschreibt, und gib ihren Mittelpunkt M und ihren Radius r an.`,
      bloecke: [BLOCK_M(), BLOCK_R], soll: sollMR(m, r2) });
  }
  if (zufall(0, 1) === 0) {
    const f = wahl([2, 3], zufall), m = mZufall(zufall, 4), r2 = r2Wahl(6);
    const { lin, e } = kugelAllgemein(m, r2);
    const linF = lin.map((x) => qMul(x, q(f))), eF = qMul(e, q(f));
    return fertig({ art, stufe: s, variante: "faktor", m, r2: q(r2), f, lin, e, linF, eF,
      text: `Zeige, dass $${kugelAllgTex(f, linF, eF)}$ eine Kugel beschreibt, und gib ihren Mittelpunkt M und ihren Radius r an.`,
      bloecke: [BLOCK_M(), BLOCK_R], soll: sollMR(m, r2) });
  }
  let h;
  do { h = [zufall(-7, 7), zufall(-7, 7), zufall(-7, 7)]; } while (nullAnz(h) > 1 || h.every((x) => x % 2 === 0));
  const m = h.map((x) => q(x, 2));
  const H = quadrat(h);                                   // |m|² = H/4
  const e = q(Math.ceil(H / 4) - zufall(1, 12));          // e ganz, r² = H/4 − e > 0
  const r2 = qSub(q(H, 4), e);
  const lin = h.map((x) => q(-x));
  return fertig({ art, stufe: s, variante: "halb", m, r2, f: 1, lin, e,
    text: `Zeige, dass $${kugelAllgTex(1, lin, e)}$ eine Kugel beschreibt, und gib ihren Mittelpunkt M und ihren Radius r an. Brüche gibst du als 3/2 ein.`,
    bloecke: [BLOCK_M("bruch"), BLOCK_R], soll: { m1: m[0], m2: m[1], m3: m[2], r: wurzelQ(r2) } });
}

/* ===== Punkt und Gerade: 1 Punktprobe · 2 Einsetzen (Lage) · 3 Schnittpunkte · 4 Berührpunkt · 5 Sehnenlänge ===== */
/* Sekante mit ganzzahligen Schnittpunkten: zwei Gitterpunkte der Kugel verbinden */
function sekanteGanz(m, r, zufall) {
  const L = schoen(gitterVektoren(r * r));
  for (let i = 0; i < 400; i++) {
    const v1 = wahl(L, zufall), v2 = wahl(L, zufall);
    if (gleichV(v1, v2) || gleichV(v1, vMal(v2, -1))) continue;
    const diff = vSub(v2, v1), g = ggT3(diff), u = vMal(diff, 1 / g);
    if (quadrat(u) > 24 || u.some((x) => Math.abs(x) > 4) || nullAnz(u) > 1) continue;
    const j = wahl([-2, -1, 1, 2].filter((x) => x !== -g), zufall);
    const S1 = vAdd(m, v1), p = vSub(S1, vMal(u, j));
    return { p, u, S: [S1, vAdd(m, v2)], t: [j, j + g] };
  }
  return null;
}
/* Tangente: Berührpunkt B = m + v, Richtung u ⊥ v */
function tangenteGanz(m, r, zufall) {
  const v = wahl(schoen(gitterVektoren(r * r)), zufall);
  const kand = KLEIN.filter((u) => skalar(u, v) === 0 && nullAnz(u) <= 1);
  const u0 = wahl(kand.length ? kand : KLEIN.filter((u) => skalar(u, v) === 0), zufall);
  const u = zufall(0, 1) ? u0 : vMal(u0, -1);
  const j = wahl([-2, -1, 1, 2], zufall), B = vAdd(m, v);
  return { p: vSub(B, vMal(u, j)), u, B, t: j };
}
/* Gerade mit Abstand² d2 (ganz) vom Mittelpunkt: Lotvektor e ⊥ u mit |e|² = d2 */
function geradeMitAbstand(m, u, bedingung, zufall, g = 8) {
  const kand = [];
  for (let a = -g; a <= g; a++) for (let b = -g; b <= g; b++) for (let c = -g; c <= g; c++) {
    const e = [a, b, c];
    if (skalar(e, u) === 0 && bedingung(quadrat(e))) kand.push(e);
  }
  if (!kand.length) return null;
  const e = wahl(kand, zufall), j = wahl([-2, -1, 1, 2], zufall);
  return { p: vAdd(vAdd(m, e), vMal(u, -j)), u, e };
}
function aufgabeGerade(s, zufall) {
  const art = "gerade";
  if (s === 1) {
    const r = wahl([3, 5, 6, 7], zufall), m = mZufall(zufall, 4);
    const fall = wahl(["innen", "auf", "aussen"], zufall);
    let v;
    if (fall === "auf") v = wahl(schoen(gitterVektoren(r * r)), zufall);
    else do { v = [zufall(-r - 2, r + 2), zufall(-r - 2, r + 2), zufall(-r - 2, r + 2)]; }
    while (nullAnz(v) > 1 || (fall === "innen" ? quadrat(v) >= r * r : quadrat(v) <= r * r || quadrat(v) > r * r + 3 * r));
    const P = vAdd(m, v);
    return fertig({ art, stufe: s, r, m, P, v, fall,
      text: `Liegt der Punkt $${punktTex("P", P)}$ innerhalb, auf oder außerhalb der Kugel $K: ${kugelTex(m, r * r)}$? Setze P in die linke Seite der Kugelgleichung ein.`,
      bloecke: [{ typ: "zahl", k: "w", tex: "\\text{linke Seite}", modus: "ganz" }, { typ: "wahl", k: "lage", optionen: PUNKT_LAGE }],
      soll: { w: q(quadrat(v)), lage: fall } });
  }
  const r = s === 5 ? wahl([4, 5, 6, 7], zufall) : wahl([3, 5, 6, 7], zufall);
  const m = mZufall(zufall, 4), r2 = r * r;
  const kTx = kugelTex(m, r2);
  if (s === 2) {
    const fall = wahl(["sekante", "tangente", "passante"], zufall);
    let gr;
    if (fall === "sekante") gr = sekanteGanz(m, r, zufall);
    else if (fall === "tangente") gr = tangenteGanz(m, r, zufall);
    else { const u = wahl(KLEIN.filter((x) => nullAnz(x) <= 1), zufall); gr = geradeMitAbstand(m, u, (d2) => d2 > r2 && d2 <= r2 + 2 * r + 4, zufall); }
    const e = geradeKugel(m, r2, gr.p, gr.u);
    return fertig({ art, stufe: s, r, m, p: gr.p, u: gr.u, fall, e,
      text: `Gegeben sind die Kugel $K: ${kTx}$ und die Gerade $g: ${geradeTex(gr.p, gr.u)}$. Setze g in K ein und bringe die Gleichung auf die Form $at^2 + bt + c = 0$ (kürzen ist erlaubt). Wie liegt g zu K?`,
      bloecke: [{ typ: "quad", ks: ["a", "b", "c"] }, { typ: "wahl", k: "lage", optionen: GERADE_LAGE }],
      gruppen: [{ art: "proportional", ks: ["a", "b", "c"] }],
      soll: { a: q(e.a), b: q(e.b), c: q(e.c), lage: e.lage } });
  }
  if (s === 3) {
    const gr = sekanteGanz(m, r, zufall), e = geradeKugel(m, r2, gr.p, gr.u);
    return fertig({ art, stufe: s, r, m, p: gr.p, u: gr.u, e, S: gr.S,
      text: `Die Gerade $g: ${geradeTex(gr.p, gr.u)}$ schneidet die Kugel $K: ${kTx}$ in zwei Punkten. Berechne die Schnittpunkte $S_1$ und $S_2$.`,
      bloecke: [{ typ: "punkt", name: "S_1", ks: ["s1", "s2", "s3"], modus: "ganzvz" }, { typ: "punkt", name: "S_2", ks: ["t1", "t2", "t3"], modus: "ganzvz" }],
      gruppen: [{ art: "paar", ks: [["s1", "s2", "s3"], ["t1", "t2", "t3"]] }],
      soll: { s1: q(gr.S[0][0]), s2: q(gr.S[0][1]), s3: q(gr.S[0][2]), t1: q(gr.S[1][0]), t2: q(gr.S[1][1]), t3: q(gr.S[1][2]) } });
  }
  if (s === 4) {
    const gr = tangenteGanz(m, r, zufall), e = geradeKugel(m, r2, gr.p, gr.u);
    return fertig({ art, stufe: s, r, m, p: gr.p, u: gr.u, e, B: gr.B,
      text: `Zeige, dass die Gerade $g: ${geradeTex(gr.p, gr.u)}$ die Kugel $K: ${kTx}$ berührt, und berechne den Berührpunkt B.`,
      bloecke: [{ typ: "punkt", name: "B", ks: ["b1", "b2", "b3"], modus: "ganzvz" }],
      soll: { b1: q(gr.B[0]), b2: q(gr.B[1]), b3: q(gr.B[2]) } });
  }
  let gr;
  do {
    const u = wahl(KLEIN.filter((x) => nullAnz(x) <= 1), zufall);
    gr = geradeMitAbstand(m, u, (d2) => d2 >= 1 && d2 < r2, zufall, r);
  } while (!gr || quadrat(vSub(gr.p, m)) === r2);           // Stützpunkt nicht auf K (sonst ist c = 0)
  const e = geradeKugel(m, r2, gr.p, gr.u);
  const sehne = wMul(wZ(q(2)), wWurzel(r2 - quadrat(gr.e)));
  return fertig({ art, stufe: s, r, m, p: gr.p, u: gr.u, e, sehne,
    text: `Die Gerade $g: ${geradeTex(gr.p, gr.u)}$ schneidet die Kugel $K: ${kTx}$. Wie lang ist die Sehne, die K aus g herausschneidet? Gib sie exakt (z. B. 2√6) oder auf zwei Nachkommastellen gerundet an.`,
    bloecke: [{ typ: "zahl", k: "s", tex: "s", modus: "wurzel" }], soll: { s: sehne } });
}

/* ===== Ebene und Kugel: 1 Abstand + Lage · 2 Abstand + Radius · 3 Schnittkreis · 4 Parameter k ===== */
function aufgabeEbene(s, zufall) {
  const art = "ebene";
  const m = mZufall(zufall, 4);
  const nWahl = (nur3) => (nur3 || zufall(1, 10) <= 7 ? wahl(NORMALEN3, zufall) : wahl(NORMALEN7, zufall));
  const sg = () => (zufall(0, 1) ? 1 : -1);
  if (s <= 2) {
    const n = nWahl(false), nl = Math.round(Math.sqrt(quadrat(n)));
    const r = zufall(3, 7);
    const fall = s === 2 ? "kreis" : wahl(["kreis", "beruehrt", "keine"], zufall);
    const d = fall === "kreis" ? zufall(1, r - 1) : fall === "beruehrt" ? r : zufall(r + 1, r + 3);
    const k = skalar(n, m) + sg() * nl * d;
    const e = ebeneKugel(m, r, n, k);
    const kTx = kugelTex(m, r * r), eTx = ebeneTex(n, k);
    if (s === 1) {
      return fertig({ art, stufe: s, m, r, n, k, e, fall,
        text: `Gegeben sind die Kugel $K: ${kTx}$ und die Ebene $E: ${eTx}$. Berechne den Abstand d des Mittelpunkts M von E und entscheide, wie E und K zueinander liegen.`,
        bloecke: [{ typ: "zahl", k: "d", tex: "d", modus: "bruch" }, { typ: "wahl", k: "lage", optionen: EBENE_LAGE }],
        soll: { d: q(d), lage: fall } });
    }
    return fertig({ art, stufe: s, m, r, n, k, e, fall,
      text: `Die Ebene $E: ${eTx}$ schneidet die Kugel $K: ${kTx}$ in einem Kreis. Berechne den Abstand d des Mittelpunkts M von E und den Radius ρ des Schnittkreises (exakt, z. B. 2√6, oder auf zwei Nachkommastellen).`,
      bloecke: [{ typ: "zahl", k: "d", tex: "d", modus: "bruch" }, { typ: "zahl", k: "rho", tex: "\\rho", modus: "wurzel" }],
      soll: { d: q(d), rho: e.rho } });
  }
  if (s === 3) {
    const n = nWahl(true), r = zufall(4, 7), lambda = sg();
    const F = vAdd(m, vMal(n, lambda)), k = skalar(n, F);
    const e = ebeneKugel(m, r, n, k);
    return fertig({ art, stufe: s, m, r, n, k, e, F, lambda,
      text: `Die Ebene $E: ${ebeneTex(n, k)}$ schneidet die Kugel $K: ${kugelTex(m, r * r)}$. Bestimme den Mittelpunkt F und den Radius ρ des Schnittkreises.`,
      bloecke: [{ typ: "punkt", name: "F", ks: ["f1", "f2", "f3"], modus: "ganzvz" }, { typ: "zahl", k: "rho", tex: "\\rho", modus: "wurzel" }],
      soll: { f1: q(F[0]), f2: q(F[1]), f3: q(F[2]), rho: e.rho } });
  }
  const n = nWahl(zufall(0, 2) > 0), nl = Math.round(Math.sqrt(quadrat(n))), nm = skalar(n, m);
  const variante = zufall(0, 1) ? "beruehren" : "radius";
  let r, d, rho = null;
  if (variante === "beruehren") { r = zufall(2, 7); d = r; }
  else [r, rho, d] = wahl([[5, 4, 3], [5, 3, 4], [10, 8, 6], [10, 6, 8], [13, 12, 5]], zufall);
  const k1 = nm - nl * d, k2 = nm + nl * d;
  const nTx = linTex(n);
  return fertig({ art, stufe: s, variante, m, r, n, nm, nl, d, rho, k: [k1, k2],
    text: variante === "beruehren"
      ? `Für welche Werte von k berührt die Ebene $E_k: ${nTx} = k$ die Kugel $K: ${kugelTex(m, r * r)}$?`
      : `Für welche Werte von k schneidet die Ebene $E_k: ${nTx} = k$ die Kugel $K: ${kugelTex(m, r * r)}$ in einem Kreis mit dem Radius $\\rho = ${rho}$?`,
    bloecke: [{ typ: "zahl", k: "k1", tex: "k_1", modus: "ganzvz" }, { typ: "zahl", k: "k2", tex: "k_2", modus: "ganzvz" }],
    gruppen: [{ art: "paar", ks: [["k1"], ["k2"]] }],
    soll: { k1: q(k1), k2: q(k2) } });
}

/* ===== Tangentialebene: 1 Normalenvektor · 2 Koordinatenform · 3 aus der ausmultiplizierten Gleichung · 4 Kugel auf schiefer Ebene ===== */
function aufgabeTangential(s, zufall) {
  const art = "tangential";
  if (s <= 3) {
    const r = wahl([3, 5, 6, 7], zufall), m = mZufall(zufall, 4);
    const v = wahl(schoen(gitterVektoren(r * r)), zufall), B = vAdd(m, v);
    const T = tangentialebene(m, B);
    const { lin, e } = kugelAllgemein(m, r * r);
    const kTx = s === 3 ? kugelAllgTex(1, lin, e) : kugelTex(m, r * r);
    if (s === 1) {
      return fertig({ art, stufe: s, r, m, B, v, T,
        text: `Der Punkt $${punktTex("B", B)}$ liegt auf der Kugel $K: ${kTx}$. Bestimme den Normalenvektor $\\vec{n} = \\vec{MB}$ der Tangentialebene in B.`,
        bloecke: [{ typ: "vektor", name: "\\vec{n}", ks: ["n1", "n2", "n3"], modus: "ganzvz" }],
        soll: { n1: q(v[0]), n2: q(v[1]), n3: q(v[2]) } });
    }
    return fertig({ art, stufe: s, r, m, B, v, T, lin, e,
      text: `Der Punkt $${punktTex("B", B)}$ liegt auf der Kugel $K: ${kTx}$. Stelle die Gleichung der Tangentialebene T in B in Koordinatenform auf.`,
      bloecke: [{ typ: "ebene", ks: ["a", "b", "c", "k"] }],
      gruppen: [{ art: "proportional", ks: ["a", "b", "c", "k"] }],
      soll: { a: q(v[0]), b: q(v[1]), c: q(v[2]), k: q(T.k) } });
  }
  const sieben = zufall(1, 4) === 1;
  const n = wahl((sieben ? NORMALEN7 : NORMALEN3).filter((x) => x[2] !== 0), zufall);
  const nl = sieben ? 7 : 3, r = sieben ? 7 : wahl([3, 6], zufall);
  const B = [zufall(-3, 3), zufall(-3, 3), zufall(-2, 3)], k = skalar(n, B);
  const vz = n[2] > 0 ? 1 : -1;
  const versatz = vMal(n, (vz * r) / nl);
  const M = vAdd(B, versatz);
  return fertig({ art, stufe: s, r, n, nl, k, B, vz, versatz, M,
    text: `Eine Kugel mit dem Radius ${r} liegt auf der schiefen Ebene $E: ${ebeneTex(n, k)}$ und berührt sie im Punkt $${punktTex("B", B)}$. Sie liegt oberhalb von E, also auf der Seite mit den größeren $x_3$-Werten. Wo liegt ihr Mittelpunkt M?`,
    bloecke: [BLOCK_M()], soll: { m1: q(M[0]), m2: q(M[1]), m3: q(M[2]) } });
}

/* ---------- Prüfen ---------- */
function lies(typ, roh) {
  if (typ === "wahl") return roh ? String(roh) : null;
  if (typ === "w") return liesW(roh);
  return liesQ(roh);
}
const gleichQ = (x, y) => !!x && qGleich(x, qz(y));
/* x ∝ y (Faktor ≠ 0); y enthält mindestens einen Eintrag ≠ 0 */
function proportional(x, y) {
  if (x.some((v) => !v)) return false;
  const i = y.findIndex((v) => !qNull(qz(v)));
  if (i < 0 || qNull(x[i])) return false;
  const f = qDiv(x[i], qz(y[i]));
  return x.every((v, j) => qGleich(v, qMul(f, qz(y[j]))));
}

/* Prüft eine Eingabe { schlüssel: text }; liefert { ok, felder: { schlüssel: true/false }, grund } */
export function pruefe(a, eingabe = {}) {
  const ist = {}, felder = {};
  for (const k of a.keys) ist[k] = lies(a.typen[k], eingabe[k]);
  const inGruppe = new Set((a.gruppen || []).flatMap((g) => g.ks.flat()));
  for (const k of a.keys) {
    if (inGruppe.has(k)) continue;
    const typ = a.typen[k];
    felder[k] = typ === "wahl" ? ist[k] === a.soll[k] : typ === "w" ? trifftW(ist[k], a.soll[k]) : gleichQ(ist[k], a.soll[k]);
  }
  for (const g of a.gruppen || []) {
    if (g.art === "proportional") {
      const ok = proportional(g.ks.map((k) => ist[k]), g.ks.map((k) => a.soll[k]));
      for (const k of g.ks) felder[k] = ok;
    } else {
      const [A, B] = g.ks;
      const tupel = (ks) => ks.map((k) => ist[k]);
      const gleichT = (x, ks) => x.every((v, i) => gleichQ(v, a.soll[ks[i]]));
      const x = tupel(A), y = tupel(B);
      const xa = gleichT(x, A), xb = gleichT(x, B), ya = gleichT(y, A), yb = gleichT(y, B);
      const ganz = (xa && yb) || (xb && ya);
      for (const k of A) felder[k] = ganz || ((xa || xb) && !(ya && xa) && !(yb && xb));
      for (const k of B) felder[k] = ganz || ((ya || yb) && !(ya && xa) && !(yb && xb));
    }
  }
  const ok = a.keys.every((k) => felder[k]);
  return { ok, felder, grund: ok ? "" : grundFuer(a, ist, felder) };
}

/* ---------- Gezielte Rückmeldung zum ersten falschen Feld ---------- */
const nahe = (x, y, tol = TOL) => x !== null && x !== undefined && Math.abs(x - y) <= tol;
const wertW = (x) => (x ? wNum(x.w) : null);
const wertQ = (x) => (x ? qNum(x) : null);
const LEER = "Fülle zuerst alle Felder aus – Brüche als 3/2, Wurzeln als 2√6 oder gerundet mit Komma.";
const RUNDEN = "Fast: Runde auf zwei Nachkommastellen (oder gib den exakten Wert mit √ an).";

function grundFuer(a, ist, felder) {
  if (a.keys.some((k) => ist[k] === null)) return LEER;
  if (a.art === "gleichung") return grundGleichung(a, ist, felder);
  if (a.art === "gerade") return grundGerade(a, ist, felder);
  if (a.art === "ebene") return grundEbene(a, ist, felder);
  return grundTangential(a, ist, felder);
}

function grundRadius(r2, istR, extra = []) {
  const v = wertW(istR), soll = wNum(wurzelQ(r2)), R2 = qNum(qz(r2));
  if (nahe(v, R2, 1e-9) && Math.abs(R2 - soll) > 1e-9) return "Rechts in der Kugelgleichung steht $r^2$, nicht r – zieh noch die Wurzel.";
  for (const [wert, text] of extra) if (nahe(v, wert, 1e-6)) return text;
  if (nahe(v, soll, 0.06)) return RUNDEN;
  return "Lies $r^2$ auf der rechten Seite der Mittelpunktsform ab und zieh die Wurzel.";
}

function grundGleichung(a, ist, felder) {
  const mFalsch = ["m1", "m2", "m3"].filter((k) => k in felder && !felder[k]);
  if (mFalsch.length) {
    const k = mFalsch[0], i = Number(k[1]) - 1, soll = qNum(qz(a.soll[k])), v = wertQ(ist[k]);
    if (a.variante === "durchmesser") {
      if (nahe(v, a.B[i] - a.A[i], 1e-9)) return "Das ist $\\vec{AB}$. Der Mittelpunkt liegt in der Mitte der Strecke: $\\vec{m} = \\frac{1}{2}(\\vec{a} + \\vec{b})$.";
      if (nahe(v, a.A[i] + a.B[i], 1e-9)) return "Die Summe $\\vec{a} + \\vec{b}$ musst du noch halbieren.";
      return "M ist der Mittelpunkt der Strecke AB: Addiere die Koordinaten von A und B und halbiere sie.";
    }
    if (soll !== 0 && nahe(v, -soll, 1e-9)) {
      return a.variante === "ablesen"
        ? `Vorzeichen: In der Klammer steht immer x minus Mittelpunktskoordinate. Aus $${klammer(`x_${i + 1}`, a.m[i])}$ liest du $m_${i + 1} = ${kTex(a.m[i])}$ ab.`
        : `Vorzeichen: Die Koordinate ist minus die Hälfte der Zahl vor $x_${i + 1}$ – aus $x_${i + 1}^2 ${qNum(qz(a.lin[i])) < 0 ? "−" : "+"} ${bTex(a.lin[i])}x_${i + 1}$ wird $${klammer(`x_${i + 1}`, a.m[i])}$.`;
    }
    if (a.lin && nahe(v, -qNum(qz(a.lin[i])), 1e-9)) return `Halbiere die Zahl vor $x_${i + 1}$: Beim Ausmultiplizieren liefert $(x_${i + 1} − m_${i + 1})^2$ das Glied $−2m_${i + 1}x_${i + 1}$.`;
    if (a.variante === "faktor" && nahe(v, a.f * soll, 1e-9)) return `Teile zuerst die ganze Gleichung durch ${a.f}, damit vor $x_1^2$, $x_2^2$ und $x_3^2$ jeweils 1 steht.`;
    if (a.variante === "faktor" && nahe(v, -qNum(qz(a.linF[i])) / 2, 1e-9)) return `Teile zuerst die ganze Gleichung durch ${a.f} – erst dann gilt „Mittelpunkt = minus halbe Zahl vor $x_i$“.`;
    return a.variante === "ablesen" ? "Lies die Koordinaten aus den Klammern ab: $(x_i − m_i)^2$." : "Ergänze jede Klammer quadratisch und lies dann die Mittelpunktsform ab.";
  }
  if ("r2" in felder && !felder.r2) {
    const v = wertQ(ist.r2), w = quadrat(a.v);
    if (nahe(v, Math.sqrt(w), 1e-9)) return "Gefragt ist $r^2$ – die Summe der Quadrate, ohne Wurzel.";
    if (nahe(v, a.v.reduce((s0, x) => s0 + Math.abs(x), 0), 1e-9) || nahe(v, a.v.reduce((s0, x) => s0 + x, 0), 1e-9)) return "Quadriere jede Koordinatendifferenz, bevor du addierst: $r^2 = (p_1 − m_1)^2 + (p_2 − m_2)^2 + (p_3 − m_3)^2$.";
    if (nahe(v, quadrat(a.P), 1e-9)) return "Rechne mit den Differenzen P − M, nicht mit den Koordinaten von P allein.";
    return "$r^2$ ist das Abstandsquadrat von M und P: Setze P in die linke Seite der Gleichung ein.";
  }
  const extra = [];
  if (a.variante === "durchmesser") extra.push([2 * Math.sqrt(quadrat(a.v)), "Das ist die Länge des Durchmessers AB. Der Radius ist die Hälfte davon."]);
  if (a.e !== undefined) {
    const e = qNum(qz(a.e)), rr = qNum(qz(a.r2));
    if (-e > 0 && Math.abs(Math.sqrt(-e) - Math.sqrt(rr)) > 1e-9) extra.push([Math.sqrt(-e), "Die Zahlen, die du links ergänzt hast, musst du auch rechts addieren – sonst stimmt die Gleichung nicht mehr."]);
    if (e > 0) extra.push([Math.sqrt(e), "Die Zahlen, die du links ergänzt hast, musst du auch rechts addieren – sonst stimmt die Gleichung nicht mehr."]);
  }
  if (a.variante === "faktor") extra.push([Math.sqrt(qNum(qz(a.r2)) * a.f), `Teile zuerst durch ${a.f}: Erst dann steht rechts $r^2$.`]);
  return grundRadius(a.r2, ist.r, extra);
}

/* liegt X (rational) auf der Geraden p + t·u? */
const aufGerade = (X, p, u) => { const d = X.map((x, i) => qSub(x, q(p[i]))); const c = [qSub(qMul(d[1], q(u[2])), qMul(d[2], q(u[1]))), qSub(qMul(d[2], q(u[0])), qMul(d[0], q(u[2]))), qSub(qMul(d[0], q(u[1])), qMul(d[1], q(u[0])))]; return c.every(qNull); };
const aufKugel = (X, m, r2) => qGleich(X.reduce((s0, x, i) => qAdd(s0, qMul(qSub(x, q(m[i])), qSub(x, q(m[i])))), q(0)), q(r2));
function punktGrund(X, a) {
  const g = aufGerade(X, a.p, a.u), k = aufKugel(X, a.m, a.r * a.r);
  if (g && !k) return "Dieser Punkt liegt auf g, aber nicht auf K – prüfe die Lösungen der quadratischen Gleichung.";
  if (!g && k) return "Dieser Punkt liegt auf K, aber nicht auf g – setze das berechnete t in die Geradengleichung ein.";
  return "Setze die Koordinaten von g in K ein, löse die quadratische Gleichung nach t und setze t wieder in g ein.";
}
function grundGerade(a, ist, felder) {
  if (a.stufe === 1) {
    if (!felder.w) {
      const v = wertQ(ist.w);
      if (nahe(v, a.v.reduce((s0, x) => s0 + Math.abs(x), 0), 1e-9) || nahe(v, a.v.reduce((s0, x) => s0 + x, 0), 1e-9)) return "Quadriere jede Klammer, bevor du addierst.";
      if (nahe(v, quadrat(a.P), 1e-9)) return "Ziehe von jeder Koordinate von P die passende Koordinate von M ab, bevor du quadrierst.";
      return "Setze P ein: $(p_1 − m_1)^2 + (p_2 − m_2)^2 + (p_3 − m_3)^2$ – jede Klammer einzeln quadrieren.";
    }
    const w = quadrat(a.v), r = a.r;
    const mitR = w < r ? "innen" : w === r ? "auf" : "aussen";
    if (ist.lage === mitR) return `Vergleiche mit der rechten Seite $r^2 = ${r * r}$, nicht mit $r = ${r}$.`;
    return `Kleiner als $r^2 = ${r * r}$ heißt innerhalb, gleich heißt auf K, größer heißt außerhalb.`;
  }
  if (a.stufe === 2) {
    if (!felder.a) {
      const x = ["a", "b", "c"].map((k) => ist[k]), { a: A, b: B, c: Cc, w } = a.e;
      if (proportional(x, [A, B / 2, Cc])) return "Im mittleren Glied fehlt der Faktor 2 der binomischen Formel: $(t − 5)^2 = t^2 − 10t + 25$.";
      if (proportional(x, [A, B, quadrat(w)])) return `Die rechte Seite $r^2 = ${a.r * a.r}$ muss noch auf die linke Seite: Ziehe sie ab, damit rechts 0 steht.`;
      if (proportional(x, [A, -B, Cc])) return "Prüfe das Vorzeichen im mittleren Glied: Setze $x_i − m_i$ als $(u_i t + p_i − m_i)$ ein.";
      return "Setze $x_1$, $x_2$, $x_3$ der Geraden in die Kugelgleichung ein, multipliziere die Klammern aus und fasse nach $t^2$, t und Zahl zusammen.";
    }
    const D = a.e.D;
    return `$D = b^2 − 4ac = ${kTex(D)}${D > 0 ? " > 0" : D < 0 ? " < 0" : ""}$: ${D > 0 ? "zwei Lösungen, also zwei Schnittpunkte – eine Sekante" : D === 0 ? "genau eine Lösung, also ein Berührpunkt – eine Tangente" : "keine Lösung, also kein gemeinsamer Punkt – eine Passante"}.`;
  }
  if (a.stufe === 3) {
    const X = ["s1", "s2", "s3"].map((k) => ist[k]), Y = ["t1", "t2", "t3"].map((k) => ist[k]);
    if (X.every((v, i) => qGleich(v, Y[i]))) return "Beide Punkte sind gleich – die quadratische Gleichung hat zwei verschiedene Lösungen $t_1$ und $t_2$.";
    return punktGrund(felder.s1 ? Y : X, a);
  }
  if (a.stufe === 4) return punktGrund(["b1", "b2", "b3"].map((k) => ist[k]), a);
  const v = wertW(ist.s), soll = wNum(a.sehne), dt = Math.sqrt(a.e.D) / a.e.a;
  if (nahe(v, dt, 0.006) && Math.abs(dt - soll) > 0.01) return "Das ist $t_2 − t_1$. Die Sehne ist $|\\vec{S_1S_2}| = (t_2 − t_1) \\cdot |\\vec{u}|$ – multipliziere noch mit der Länge des Richtungsvektors.";
  if (nahe(v, soll / 2, 0.006)) return "Das ist die halbe Sehne. Gesucht ist der ganze Abstand der beiden Schnittpunkte.";
  if (nahe(v, Math.sqrt(a.e.D), 0.006)) return "$\\sqrt{D}$ ist noch keine Länge: Berechne $t_1$ und $t_2$ und dann $|\\vec{S_1S_2}|$.";
  if (nahe(v, soll, 0.06)) return RUNDEN;
  return "Berechne die beiden Lösungen $t_1$, $t_2$ und dann den Abstand der Schnittpunkte: $s = |t_2 − t_1| \\cdot |\\vec{u}|$.";
}

function grundEbene(a, ist, felder) {
  if (a.stufe <= 2 && !felder.d) {
    const v = wertQ(ist.d), nl = Math.sqrt(a.e.n2), diff = a.e.diff;
    if (nahe(v, Math.abs(diff), 1e-9) && nl !== 1) return `Teile noch durch $|\\vec{n}| = ${nl}$ – erst dann ist es der Abstand (Hesse-Normalenform).`;
    if (nahe(v, -Math.abs(diff) / nl, 1e-9)) return "Ein Abstand ist nie negativ: Nimm den Betrag.";
    if (nahe(v, Math.abs(a.e.nm + a.k) / nl, 1e-9)) return "Vorzeichen: $d = \\frac{|\\vec{n} \\cdot \\vec{m} − k|}{|\\vec{n}|}$ – k wird abgezogen.";
    return "Setze M in die Hesse-Normalenform ein: $d = \\frac{|\\vec{n} \\cdot \\vec{m} − k|}{|\\vec{n}|}$.";
  }
  if (a.stufe === 1) return `Vergleiche d mit $r = ${a.r}$: $d < r$ Schnittkreis, $d = r$ Berührpunkt, $d > r$ kein gemeinsamer Punkt.`;
  if (a.stufe <= 3 && "rho" in felder && !felder.rho && (a.stufe === 2 || ["f1", "f2", "f3"].every((k) => felder[k]))) {
    const v = wertW(ist.rho), r = a.r, d2 = qNum(a.e.d2), d = Math.sqrt(d2);
    if (nahe(v, r - d, 1e-6)) return "Nicht $r − d$: Im rechtwinkligen Dreieck aus M, F und einem Kreispunkt gilt $d^2 + \\rho^2 = r^2$.";
    if (nahe(v, r * r - d2, 1e-6)) return "Das ist $\\rho^2$ – zieh noch die Wurzel.";
    if (nahe(v, Math.sqrt(r * r + d2), 0.006)) return "r ist die Hypotenuse: $\\rho^2 = r^2 − d^2$, nicht $r^2 + d^2$.";
    if (nahe(v, wNum(a.e.rho), 0.06)) return RUNDEN;
    return "Pythagoras im Dreieck aus M, F und einem Kreispunkt X: $\\rho = \\sqrt{r^2 − d^2}$.";
  }
  if (a.stufe === 3) {
    const X = ["f1", "f2", "f3"].map((k) => ist[k]);
    if (X.every((v, i) => qGleich(v, q(a.m[i])))) return "F ist nicht M: Gehe von M senkrecht zur Ebene – entlang $\\vec{n}$ – bis du in E ankommst.";
    if (X.every((v, i) => qGleich(v, q(a.m[i] - a.lambda * a.n[i])))) return "Falsche Richtung: F muss die Ebenengleichung erfüllen. Prüfe das Vorzeichen von λ.";
    const inE = qGleich(X.reduce((s0, x, i) => qAdd(s0, qMul(x, q(a.n[i]))), q(0)), q(a.k));
    if (inE) return "F liegt zwar in E, aber nicht auf dem Lot durch M. Setze die Lotgerade $\\vec{x} = \\vec{m} + λ\\vec{n}$ in E ein.";
    return "F ist der Lotfußpunkt: Setze die Lotgerade $\\vec{x} = \\vec{m} + λ\\vec{n}$ in E ein, bestimme λ und dann F.";
  }
  const werte = [ist.k1, ist.k2].map(qNum), soll = a.k;
  if (werte[0] === werte[1] && soll.includes(werte[0])) return "Es gibt zwei solche Ebenen – auf jeder Seite von M eine. Denk an den Betrag: $|\\vec{n} \\cdot \\vec{m} − k| = d \\cdot |\\vec{n}|$ hat zwei Lösungen.";
  const betrag = a.nm === 0 ? "|k|" : `|${kTex(a.nm)} − k|`;
  if (a.nl !== 1 && werte.some((v) => v === a.nm - a.d || v === a.nm + a.d)) return `Multipliziere mit $|\\vec{n}| = ${a.nl}$: Aus $\\frac{${betrag}}{${a.nl}} = ${a.d}$ folgt $${betrag} = ${a.nl * a.d}$.`;
  if (a.variante === "radius" && werte.some((v) => v === a.nm - a.nl * a.r || v === a.nm + a.nl * a.r)) return "Gesucht ist der Abstand d mit $d^2 + \\rho^2 = r^2$ – nicht r selbst.";
  return a.variante === "beruehren" ? "Berühren heißt $d = r$: Setze $\\frac{|\\vec{n} \\cdot \\vec{m} − k|}{|\\vec{n}|} = r$ und löse nach k auf." : "Bestimme zuerst $d = \\sqrt{r^2 − \\rho^2}$ und löse dann $\\frac{|\\vec{n} \\cdot \\vec{m} − k|}{|\\vec{n}|} = d$ nach k auf.";
}

function grundTangential(a, ist, felder) {
  if (a.stufe === 1) {
    const X = ["n1", "n2", "n3"].map((k) => qNum(ist[k]));
    if (gleichV(X, vMal(a.v, -1))) return "Das ist $\\vec{BM}$ – auch senkrecht zur Ebene, aber gefragt ist $\\vec{MB} = \\vec{b} − \\vec{m}$.";
    if (gleichV(X, a.B)) return "Das ist der Ortsvektor von B. Gesucht ist der Vektor von M nach B: $\\vec{b} − \\vec{m}$.";
    return "Rechne $\\vec{MB} = \\vec{b} − \\vec{m}$: Ziehe von jeder Koordinate von B die von M ab.";
  }
  if (a.stufe <= 3) {
    const x = ["a", "b", "c", "k"].map((k) => ist[k]);
    const nOk = proportional(x.slice(0, 3), a.v);
    if (nOk) {
      if (proportional(x, [...a.v, skalar(a.v, a.m)])) return "In die Ebene gehört der Punkt B, nicht M: $k = \\vec{n} \\cdot \\vec{b}$.";
      return "Der Normalenvektor stimmt. Für k setzt du B in die linke Seite ein: $k = \\vec{n} \\cdot \\vec{b}$.";
    }
    if (proportional(x.slice(0, 3), a.B)) return "Der Normalenvektor ist $\\vec{MB}$, nicht der Ortsvektor von B.";
    if (a.stufe === 3) return "Bestimme zuerst M aus der Kugelgleichung (quadratische Ergänzung). Der Normalenvektor ist dann $\\vec{MB} = \\vec{b} − \\vec{m}$.";
    return "Die Tangentialebene steht senkrecht auf dem Radius: Ihr Normalenvektor ist $\\vec{MB} = \\vec{b} − \\vec{m}$.";
  }
  const X = ["m1", "m2", "m3"].map((k) => qNum(ist[k]));
  if (gleichV(X, vSub(a.B, a.versatz))) return "Dieser Mittelpunkt liegt unterhalb der Ebene – die Kugel liegt aber oben auf (größeres $x_3$).";
  if (gleichV(X, a.B)) return "B ist der Berührpunkt, nicht der Mittelpunkt. Der Mittelpunkt liegt im Abstand r senkrecht über B.";
  if (a.r !== a.nl && (gleichV(X, vAdd(a.B, vMal(a.n, a.vz * a.r))) || gleichV(X, vAdd(a.B, vMal(a.n, a.vz))))) return `Normiere zuerst: Gehe genau ${a.r} Längeneinheiten senkrecht zur Ebene, also $${a.r} \\cdot \\vec{n}_0$ mit $\\vec{n}_0 = \\frac{\\vec{n}}{|\\vec{n}|}$ und $|\\vec{n}| = ${a.nl}$.`;
  return "Der Mittelpunkt liegt im Abstand r senkrecht über B: $\\vec{m} = \\vec{b} + r \\cdot \\vec{n}_0$, mit $\\vec{n}_0$ in Richtung größerer $x_3$-Werte.";
}

/* ---------- Tipp (nach einem Fehlversuch) ---------- */
export function tipp(a) {
  if (a.art === "gleichung") return a.stufe === 1 ? "Mittelpunktsform: $(x_1 − m_1)^2 + (x_2 − m_2)^2 + (x_3 − m_3)^2 = r^2$ – Vorzeichen in der Klammer umdrehen, rechts steht $r^2$."
    : a.variante === "punkt" ? "P liegt auf der Kugel, also ist $r^2$ das Abstandsquadrat von M und P: $r^2 = (p_1 − m_1)^2 + (p_2 − m_2)^2 + (p_3 − m_3)^2$."
      : a.variante === "durchmesser" ? "Der Mittelpunkt halbiert den Durchmesser: $\\vec{m} = \\frac{1}{2}(\\vec{a} + \\vec{b})$. Der Radius ist der Abstand von M zu A oder B."
        : "Ergänze jede Koordinate quadratisch: $x_1^2 − 4x_1 = (x_1 − 2)^2 − 4$. Was du links ergänzt, kommt rechts dazu.";
  if (a.art === "gerade") return a.stufe === 1 ? "Setze P ein und vergleiche mit $r^2$."
    : "Setze die Koordinaten der Geraden in K ein. Die Gleichung $at^2 + bt + c = 0$ hat je nach $D = b^2 − 4ac$ zwei, eine oder keine Lösung.";
  if (a.art === "ebene") return "Abstand mit der Hesse-Normalenform: $d = \\frac{|\\vec{n} \\cdot \\vec{m} − k|}{|\\vec{n}|}$. Schnittkreis: Mittelpunkt ist der Lotfußpunkt, $\\rho = \\sqrt{r^2 − d^2}$.";
  return a.stufe === 4 ? "Vom Berührpunkt aus senkrecht zur Ebene um r nach oben: $\\vec{m} = \\vec{b} + r \\cdot \\vec{n}_0$."
    : "Normalenvektor der Tangentialebene ist $\\vec{MB}$, und B liegt in der Ebene: $\\vec{n} \\cdot \\vec{x} = \\vec{n} \\cdot \\vec{b}$.";
}

/* ---------- Rechenweg (TeX-Zeilen; die letzte Zeile ist das Ergebnis) ---------- */

/* quadratische Ergänzung als Zeilen: Gruppen, rechte Seite, Mittelpunktsform */
function ergaenzung(lin, e, m, r2) {
  const L = lin.map(qz), M = m.map(qz);
  const gruppe = (i) => {
    const name = `x_${i + 1}`;
    if (qNull(L[i])) return `${name}^2`;
    const a = qAbs(L[i]);
    return `(${name}^2 ${L[i].z < 0 ? "−" : "+"} ${a.z === 1 && a.n === 1 ? "" : qTex(a)}${name} + ${qTex(qMul(M[i], M[i]))})`;
  };
  const rechts = [qNeg(qz(e)), ...M.filter((x) => !qNull(x)).map((x) => qMul(x, x))].filter((x, i) => i > 0 || !qNull(x));
  const sortiert = `${[0, 1, 2].map((i) => {
    const name = `x_${i + 1}`;
    if (qNull(L[i])) return `${name}^2`;
    const a = qAbs(L[i]);
    return `${name}^2 ${L[i].z < 0 ? "−" : "+"} ${a.z === 1 && a.n === 1 ? "" : qTex(a)}${name}`;
  }).join(" + ").replace(/\+ −/g, "−")} = ${kTex(qNeg(qz(e)))}`;
  return [
    sortiert,
    `${[0, 1, 2].map(gruppe).join(" + ")}`,
    `= ${summeTex(rechts)} = ${kTex(r2)}`,
    kugelTex(m, r2),
  ];
}

export function rechenweg(a) {
  const z = [];
  if (a.art === "gleichung") {
    const ergebnis = `${punktTex("M", a.m)}, \\quad r = ${wTex(wurzelQ(a.r2))}`;
    if (a.variante === "ablesen") {
      z.push("(x_1 − m_1)^2 + (x_2 − m_2)^2 + (x_3 − m_3)^2 = r^2");
      z.push(`${kugelTex(a.m, a.r2)} \\;\\Rightarrow\\; ${punktTex("M", a.m)}`);
      z.push(radiusTex(a.r2));
    } else if (a.variante === "punkt") {
      const P = a.P, m = a.m;
      z.push(`r^2 = |\\vec{MP}|^2 = ${P.map((p, i) => diffTex(p, m[i])).join(" + ")}`);
      z.push(`= ${summeTex(a.v.map((x) => x * x))} = ${quadrat(a.v)}`);
      z.push(`${kugelTex(m, a.r2)}`);
      z.push(radiusTex(a.r2));
      z.push(`r^2 = ${quadrat(a.v)}, \\quad r = ${wTex(wurzelQ(a.r2))}`);
      return z;
    } else if (a.variante === "durchmesser") {
      z.push(`\\vec{m} = \\frac{1}{2}(\\vec{a} + \\vec{b}) = \\frac{1}{2} \\cdot ${spalteTex(vAdd(a.A, a.B))} = ${spalteTex(a.m)}`);
      z.push(`r = |\\vec{MB}| = \\sqrt{${summeTex(a.v.map((x) => x * x))}}${wurzelKette(quadrat(a.v))}`);
    } else {
      if (a.variante === "faktor") z.push(`\\text{durch } ${a.f} \\text{ teilen: } ${kugelAllgTex(1, a.lin, a.e)}`);
      z.push(...ergaenzung(a.lin, a.e, a.m, a.r2));
      z.push(radiusTex(a.r2));
    }
    z.push(ergebnis);
    return z;
  }
  if (a.art === "gerade") {
    if (a.stufe === 1) {
      const w = quadrat(a.v), r2 = a.r * a.r;
      z.push(`${a.P.map((p, i) => diffTex(p, a.m[i])).join(" + ")}`);
      z.push(`= ${summeTex(a.v.map((x) => x * x))} = ${w}`);
      z.push(w < r2 ? `${w} < ${r2} = r^2 \\;\\Rightarrow\\; P \\text{ liegt innerhalb von } K` : w === r2 ? `${w} = r^2 \\;\\Rightarrow\\; P \\text{ liegt auf } K` : `${w} > ${r2} = r^2 \\;\\Rightarrow\\; P \\text{ liegt außerhalb von } K`);
      return z;
    }
    const { p, u, m } = a, e = a.e, w = e.w;
    z.push(`x_1 = ${kompTex(p[0], u[0])}, \\; x_2 = ${kompTex(p[1], u[1])}, \\; x_3 = ${kompTex(p[2], u[2])}`);
    z.push(`${[0, 1, 2].map((i) => einsetzTex(u[i], w[i])).join(" + ")} = ${a.r * a.r}`);
    z.push(`${quadTex(e.a, e.b, quadrat(w))} = ${a.r * a.r} \\;\\Rightarrow\\; ${quadTex(e.a, e.b, e.c)} = 0`);
    const vierAC = 4 * e.a * e.c;
    z.push(`D = b^2 − 4ac = ${e.b === 0 ? "" : e.b * e.b}${e.b === 0 ? kTex(-vierAC) : vierAC === 0 ? "" : ` ${vierAC > 0 ? "−" : "+"} ${Math.abs(vierAC)}`}${e.b !== 0 && vierAC !== 0 ? ` = ${kTex(e.D)}` : ""}`);
    if (a.stufe === 2) {
      z.push(e.D > 0 ? "D > 0 \\;\\Rightarrow\\; \\text{zwei Schnittpunkte: } g \\text{ ist eine Sekante}"
        : e.D === 0 ? "D = 0 \\;\\Rightarrow\\; \\text{ein Berührpunkt: } g \\text{ ist eine Tangente}"
          : "D < 0 \\;\\Rightarrow\\; \\text{kein gemeinsamer Punkt: } g \\text{ ist eine Passante}");
      return z;
    }
    if (a.stufe === 3) {
      const sD = Math.round(Math.sqrt(e.D));
      z.push(`t_{1,2} = \\frac{${e.b === 0 ? "" : kTex(-e.b) + " "}\\pm ${sD}}{${2 * e.a}} \\;\\Rightarrow\\; t_1 = ${kTex(wNum(e.t[0]))}, \\; t_2 = ${kTex(wNum(e.t[1]))}`);
      const S = e.tn.map((t) => p.map((pi, i) => pi + Math.round(t) * u[i]));
      z.push(`t_1 = ${kTex(wNum(e.t[0]))}: \\; ${punktTex("S_1", S[0])}`);
      z.push(`t_2 = ${kTex(wNum(e.t[1]))}: \\; ${punktTex("S_2", S[1])}`);
      z.push(`${punktTex("S_1", S[0])}, \\quad ${punktTex("S_2", S[1])}`);
      return z;
    }
    if (a.stufe === 4) {
      const t = Math.round(e.tn[0]);
      z.push(`D = 0: \\; t = \\frac{${kTex(-e.b)}}{${2 * e.a}} = ${kTex(t)}`);
      z.push(punktTex("B", a.B));
      return z;
    }
    const wD = wWurzel(e.D), dt = wMul(wD, wZ(q(1, e.a))), ul = wWurzel(quadrat(u));
    z.push(`t_{1,2} = \\frac{${e.b === 0 ? "" : kTex(-e.b) + " "}\\pm \\sqrt{${e.D}}}{${2 * e.a}} \\;\\Rightarrow\\; t_2 − t_1 = \\frac{\\sqrt{${e.D}}}{${e.a}} = ${wTex(dt)}`);
    z.push(`|\\vec{u}| = \\sqrt{${quadrat(u)}}${wTex(ul) === `\\sqrt{${quadrat(u)}}` ? "" : ` = ${wTex(ul)}`}`);
    z.push(`s = (t_2 − t_1) \\cdot |\\vec{u}| = ${wTex(a.sehne)}${wIstGanz(a.sehne) ? "" : ` \\approx ${dk(wNum(a.sehne))}`}`);
    return z;
  }
  if (a.art === "ebene") {
    const { n, k, m, r } = a, nl = Math.round(Math.sqrt(quadrat(n))), nm = skalar(n, m);
    if (a.stufe <= 2 || a.stufe === 4) {
      z.push(`|\\vec{n}| = \\sqrt{${summeTex(n.map((x) => x * x))}} = ${nl}, \\quad \\vec{n} \\cdot \\vec{m} = ${produkte(n, m)}`);
    }
    if (a.stufe <= 2) {
      const diff = nm - k;
      z.push(`d = \\frac{|${kTex(nm)} ${k < 0 ? "+" : "−"} ${Math.abs(k)}|}{${nl}} = \\frac{${Math.abs(diff)}}{${nl}} = ${kTex(q(Math.abs(diff), nl))}`);
      const d = Math.abs(diff) / nl;
      if (a.stufe === 1) {
        z.push(d < r ? `d = ${d} < ${r} = r \\;\\Rightarrow\\; E \\text{ schneidet } K \\text{ in einem Kreis}` : d === r ? `d = ${d} = r \\;\\Rightarrow\\; E \\text{ berührt } K` : `d = ${d} > ${r} = r \\;\\Rightarrow\\; \\text{kein gemeinsamer Punkt}`);
        return z;
      }
      z.push(`\\rho = \\sqrt{r^2 − d^2} = \\sqrt{${r * r} − ${d * d}}${wurzelKette(r * r - d * d)}`);
      z.push(`d = ${d}, \\quad \\rho = ${wTex(a.e.rho)}`);
      return z;
    }
    if (a.stufe === 3) {
      const n2 = quadrat(n);
      z.push(`\\text{Lot: } \\vec{x} = ${spalteTex(m)} + λ \\cdot ${spalteTex(n)}, \\quad \\vec{n} \\cdot \\vec{m} = ${produkte(n, m)}`);
      z.push(`\\text{in } E: \\; ${nm === 0 ? "" : `${kTex(nm)} + `}${n2}λ = ${kTex(k)} \\;\\Rightarrow\\; λ = ${kTex(a.lambda)}`);
      z.push(`λ = ${kTex(a.lambda)}: \\; ${punktTex("F", a.F)}, \\quad d = |\\vec{MF}| = ${nl}`);
      z.push(`\\rho = \\sqrt{r^2 − d^2} = \\sqrt{${r * r} − ${nl * nl}}${wurzelKette(r * r - nl * nl)}`);
      z.push(`${punktTex("F", a.F)}, \\quad \\rho = ${wTex(a.e.rho)}`);
      return z;
    }
    const D = a.nl * a.d;
    z.push(a.variante === "beruehren" ? `\\text{Berühren: } d = r = ${a.r}` : `d = \\sqrt{r^2 − \\rho^2} = \\sqrt{${a.r * a.r} − ${a.rho * a.rho}} = ${a.d}`);
    const betrag = nm === 0 ? "|k|" : `|${kTex(nm)} − k|`;
    z.push(`\\frac{${betrag}}{${a.nl}} = ${a.d} \\;\\Rightarrow\\; ${betrag} = ${D}`);
    z.push(nm === 0 ? `k = −${D} \\text{ oder } k = ${D}` : `${kTex(nm)} − k = ${D} \\text{ oder } ${kTex(nm)} − k = −${D}`);
    z.push(`k_1 = ${kTex(a.k[0])}, \\quad k_2 = ${kTex(a.k[1])}`);
    return z;
  }
  /* tangential */
  if (a.stufe <= 3) {
    const { m, B, v } = a, r2 = a.r * a.r;
    if (a.stufe === 3) {
      z.push(...ergaenzung(a.lin, a.e, m, r2).slice(1));
      z.push(`${punktTex("M", m)}, \\quad r = ${a.r}`);
    }
    z.push(`\\text{Probe: } ${B.map((b, i) => diffTex(b, m[i])).join(" + ")} = ${r2} \\;\\Rightarrow\\; B \\in K`);
    z.push(`\\vec{n} = \\vec{MB} = ${spalteTex(B)} − ${spalteTex(m)} = ${spalteTex(v)}`);
    if (a.stufe === 1) { z.push(`\\vec{n} = ${spalteTex(v)}`); return z; }
    z.push(`T: \\; ${spalteTex(v)} \\cdot \\left(\\vec{x} − ${spalteTex(B)}\\right) = 0`);
    const prod = v.map((x, i) => x * B[i]).filter((x) => x !== 0);
    z.push(`T: \\; ${linTex(v)} = ${prod.length > 1 ? `${summeTex(prod)} = ` : ""}${kTex(a.T.k)}`);
    z.push(`T: \\; ${ebeneTex(v, a.T.k)}`);
    return z;
  }
  const { n, nl, r, B, versatz, M } = a;
  z.push(`\\text{Probe: } \\vec{n} \\cdot \\vec{b} = ${produkte(n, B)} \\;\\Rightarrow\\; B \\in E`);
  z.push(`|\\vec{n}| = \\sqrt{${summeTex(n.map((x) => x * x))}} = ${nl}, \\quad \\vec{n}_0 = \\frac{1}{${nl}} \\cdot ${spalteTex(n)}`);
  z.push(`n_3 = ${kTex(n[2])} ${n[2] > 0 ? ">" : "<"} 0 \\;\\Rightarrow\\; \\text{nach oben zeigt } ${a.vz > 0 ? "" : "−"}\\vec{n}_0`);
  z.push(`\\vec{m} = \\vec{b} ${a.vz > 0 ? "+" : "−"} ${r} \\cdot \\vec{n}_0 = ${spalteTex(B)} + ${spalteTex(versatz)} = ${spalteTex(M)}`);
  z.push(punktTex("M", M));
  return z;
}
const wIstGanz = (w) => w.length === 0 || (w.length === 1 && w[0].w === 1 && w[0].c.n === 1);
/* „= \sqrt{16} = 4“ bzw. „= \sqrt{32} = 4\sqrt{2}“ bzw. „“ (wenn schon einfach) */
function wurzelKette(x) {
  const w = wWurzel(x), roh = `\\sqrt{${x}}`;
  return wTex(w) === roh ? ` = ${roh}` : ` = ${roh} = ${wTex(w)}`;
}
/* n·m als Summe der Produkte, dann ausgerechnet */
function produkte(n, m) {
  const pr = n.map((x, i) => x * m[i]).filter((x) => x !== 0);
  const s = skalar(n, m);
  if (!pr.length) return "0";
  return pr.length === 1 ? kTex(s) : `${summeTex(pr)} = ${kTex(s)}`;
}

/* Ergebniszeile (letzte Zeile des Rechenwegs) */
export const ergebnisTex = (a) => rechenweg(a).slice(-1)[0];

/* ---------- GFS: Gliederung, Tipps, Kolloquium ---------- */
export const GLIEDERUNG = [
  { min: 2, titel: "Einstieg: Was ist eine Kugel?", text: "Zeig einen Ball und frag die Klasse nach einer Definition. Dann der Vergleich mit dem Kreis: Alle Punkte mit demselben Abstand vom Mittelpunkt – in der Ebene ein Kreis, im Raum eine Kugel. Das ist die Leitfrage: Wie wird daraus eine Gleichung?" },
  { min: 4, titel: "Die Kugelgleichung", text: "Abstand mit dem Satz des Pythagoras im Raum, quadrieren, Mittelpunktsform und Vektorform. Punktprobe an drei Punkten (innen, auf, außen). Dann der Rückweg mit quadratischer Ergänzung – und das Beispiel, bei dem rechts −1 herauskommt." },
  { min: 4, titel: "Gerade und Kugel", text: "Einsetzen an der Tafel bis zur quadratischen Gleichung in t. Die Diskriminante entscheidet: Sekante, Tangente, Passante. Zeig die drei parallelen Geraden in einem Bild und rechne die Schnittpunkte der Sekante aus." },
  { min: 4, titel: "Ebene, Schnittkreis, Tangentialebene", text: "Abstand mit der Hesse-Normalenform, dann das rechtwinklige Dreieck M, F, X mit ρ² = r² − d². Danach die Tangentialebene mit Normalenvektor MB und der kurze Beweis mit Pythagoras, warum sie nur einen Punkt mit der Kugel gemeinsam hat." },
  { min: 3, titel: "Anwendung und Fazit", text: "Orten mit drei Kugeln: Gleichungen voneinander abziehen, zwei Kandidaten, Entscheidung durch eine Zusatzinformation. Fazit in einem Satz: Eine Kugel ist eine Abstandsbedingung – darum entscheiden bei Geraden und Ebenen immer Abstände." },
];

export const TIPPS = [
  "Bring einen Ball und ein Blatt Papier mit: Ein Blatt, das den Ball schneidet, zeigt den Schnittkreis, ein Blatt, das ihn nur berührt, die Tangentialebene. Das bleibt im Kopf.",
  "Rechne alle Beispiele mit derselben Kugel M(2 | −1 | 3), r = 5. Dann musst du nicht ständig neue Zahlen einführen, und die Klasse sieht, wie die Ergebnisse zusammenpassen.",
  "Aufs Handout gehören die Mittelpunktsform, die quadratische Ergänzung als Beispiel, die Tabelle D > 0, D = 0, D < 0, die Formel ρ² = r² − d² und die Gleichung der Tangentialebene.",
];

export const KOLLOQUIUM = [
  { stufe: "Basis", frage: "Wie lautet die Gleichung einer Kugel, und woher kommt sie?",
    antwort: "Eine Kugel besteht aus allen Punkten X, die vom Mittelpunkt M den Abstand r haben. Der Abstand ist der Betrag von X − M, also nach Pythagoras die Wurzel aus (x₁ − m₁)² + (x₂ − m₂)² + (x₃ − m₃)². Weil beide Seiten nicht negativ sind, darf man quadrieren und erhält (x₁ − m₁)² + (x₂ − m₂)² + (x₃ − m₃)² = r²." },
  { stufe: "Basis", frage: "Wie prüfst du, ob ein Punkt innerhalb, auf oder außerhalb einer Kugel liegt?",
    antwort: "Ich setze den Punkt in die linke Seite der Mittelpunktsform ein. Das Ergebnis ist sein Abstandsquadrat zu M. Ist es kleiner als r², liegt der Punkt innen, ist es gleich r², liegt er auf der Kugel, ist es größer, liegt er außen. Für M(2 | −1 | 3) und r = 5 liefert P(5 | 3 | 3) genau 9 + 16 + 0 = 25, P liegt also auf der Kugel." },
  { stufe: "Basis", frage: "Wie bekommst du aus x₁² + x₂² + x₃² − 4x₁ + 2x₂ − 6x₃ − 11 = 0 Mittelpunkt und Radius?",
    antwort: "Mit quadratischer Ergänzung: x₁² − 4x₁ wird zu (x₁ − 2)² − 4, x₂² + 2x₂ zu (x₂ + 1)² − 1 und x₃² − 6x₃ zu (x₃ − 3)² − 9. Bringt man alle Zahlen nach rechts, steht dort 11 + 4 + 1 + 9 = 25. Also ist M(2 | −1 | 3) und r = 5. Kurz: Der Mittelpunkt ist minus die Hälfte der Zahlen vor x₁, x₂, x₃." },
  { stufe: "Basis", frage: "Woran erkennst du nach dem Einsetzen einer Geraden, wie sie zur Kugel liegt?",
    antwort: "Nach dem Einsetzen entsteht eine quadratische Gleichung at² + bt + c = 0. Ihre Diskriminante D = b² − 4ac entscheidet: Ist D positiv, gibt es zwei Lösungen und zwei Schnittpunkte, die Gerade ist eine Sekante. Ist D = 0, gibt es genau einen Berührpunkt, eine Tangente. Ist D negativ, gibt es keinen gemeinsamen Punkt, eine Passante." },
  { stufe: "Vertiefung", frage: "Warum ist der Schnitt einer Ebene mit einer Kugel immer ein Kreis?",
    antwort: "Sei F der Lotfußpunkt von M auf die Ebene und d der Abstand MF. Für jeden Punkt X der Ebene steht MF senkrecht auf FX, also gilt MX² = d² + FX². X liegt genau dann auf der Kugel, wenn MX = r ist, also wenn FX² = r² − d². Alle Schnittpunkte haben damit denselben Abstand ρ von F mit ρ² = r² − d² – das ist ein Kreis um F." },
  { stufe: "Vertiefung", frage: "Warum ist der Radiusvektor MB ein Normalenvektor der Tangentialebene in B?",
    antwort: "Ich nehme die Ebene durch B, die auf MB senkrecht steht. Für jeden ihrer Punkte X gilt nach Pythagoras MX² = MB² + BX² = r² + BX². Für X ≠ B ist das größer als r², X liegt außerhalb. Diese Ebene hat also nur B mit der Kugel gemeinsam und ist damit die Tangentialebene. Jede andere Ebene durch B wäre schräg zum Radius und würde die Kugel in einem Kreis schneiden." },
  { stufe: "Vertiefung", frage: "Wie findest du Mittelpunkt und Radius eines Schnittkreises konkret?",
    antwort: "Den Mittelpunkt F bekomme ich mit dem Lot: Ich setze die Gerade x = m + λ·n in die Ebenengleichung ein, bestimme λ und damit F. Der Abstand d ist |MF| oder direkt die Hesse-Normalenform. Dann gilt ρ² = r² − d². Im Beispiel 2x₁ + x₂ − 2x₃ = 6 mit M(2 | −1 | 3) und r = 5 ist λ = 1, F(4 | 0 | 1), d = 3 und ρ = 4." },
  { stufe: "Vertiefung", frage: "Was bedeutet es, wenn bei der quadratischen Ergänzung rechts eine negative Zahl oder null steht?",
    antwort: "Links steht eine Summe von Quadraten, und die ist nie negativ. Steht rechts eine negative Zahl, erfüllt kein einziger Punkt die Gleichung – es gibt keine Kugel. Steht rechts null, müssen alle drei Quadrate null sein, das erfüllt nur der Punkt M selbst. Nur bei einer positiven Zahl ist es eine Kugel mit diesem r²." },
  { stufe: "Vertiefung", frage: "Kann man die Lage von Gerade und Kugel auch ohne Einsetzen bestimmen?",
    antwort: "Ja, über den Abstand d des Mittelpunkts von der Geraden: d < r heißt Sekante, d = r Tangente, d > r Passante. Beide Wege passen zusammen, denn nach dem Einsetzen gilt D = 4·|u|²·(r² − d²), wobei u der Richtungsvektor ist. D und r − d haben also immer dasselbe Vorzeichen." },
  { stufe: "Profi", frage: "Wie viele Tangentialebenen an eine Kugel sind parallel zu einer gegebenen Ebene?",
    antwort: "Genau zwei, auf jeder Seite des Mittelpunkts eine. Sie haben denselben Normalenvektor n und den Abstand r von M: |n·m − k| / |n| = r. Wegen des Betrags gibt es zwei Lösungen, k = n·m − r·|n| und k = n·m + r·|n|. Die Berührpunkte liegen auf der Geraden durch M in Richtung n, im Abstand r von M." },
  { stufe: "Profi", frage: "Warum braucht man zum Orten mit Kugeln drei oder sogar vier Abstände?",
    antwort: "Ein Abstand legt eine Kugel fest. Zwei Kugeln schneiden sich – wenn überhaupt – in einem Kreis, denn zieht man ihre Gleichungen voneinander ab, bleibt eine Ebenengleichung übrig. Eine dritte Kugel schneidet diesen Kreis meist in zwei Punkten. Welcher es ist, muss eine weitere Information entscheiden, etwa eine vierte Kugel. Beim GPS braucht man den vierten Satelliten außerdem, weil die Uhr im Empfänger nicht genau genug geht." },
  { stufe: "Profi", frage: "Ist jede Gleichung zweiten Grades in x₁, x₂, x₃ eine Kugel?",
    antwort: "Nein. Die Quadrate x₁², x₂², x₃² müssen denselben Vorfaktor haben – sonst ist es zum Beispiel ein Ellipsoid wie 2x₁² + x₂² + x₃² = 4. Mischprodukte wie x₁x₂ dürfen nicht vorkommen, sonst ist die Fläche gedreht oder keine Kugel. Und nach der quadratischen Ergänzung muss rechts eine positive Zahl stehen, sonst ist die Lösungsmenge ein Punkt oder leer." },
];
