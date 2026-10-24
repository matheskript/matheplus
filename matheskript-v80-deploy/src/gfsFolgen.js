/* ============================================================
   GFS-Trainer · Folgen und Grenzwerte
   (Kursstufe 1, Kap. I Grundlagen der Differenzialrechnung)
   Reine Logik ohne React: exakte Brüche, Folgen des Labors (arithmetisch,
   geometrisch, 1/n, harmonische Partialsummen) mit ε-Schlauch und
   Partialsummen, vier Übungsgeneratoren mit Prüfung, gezielter Rückmeldung
   zu typischen Fehlern und vollständigem Rechenweg, Gliederung, Tipps und
   Kolloquium. Getestet in tests/gfsFolgen.test.mjs.
   Nichts stammt aus dem Schulbuch: Aufgaben, Kontexte, Zahlen und
   Formulierungen sind eigene.
   „Ab welchem n im ε-Schlauch“ wird überall exakt gerechnet (ganze Zahlen,
   BigInt) – nie mit Gleitkomma an der Grenze |aₙ − g| = ε.
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
const vz = (zufall) => (zufall(0, 1) === 0 ? 1 : -1);

/* ---------- Brüche (exakt) ---------- */
export const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
export const B = (z, n = 1) => {
  if (!Number.isInteger(z) || !Number.isInteger(n) || n === 0) throw new Error(`kein Bruch: ${z}/${n}`);
  if (n < 0) { z = -z; n = -n; }
  const g = ggT(z, n);
  return { z: z / g + 0, n: n / g };
};
export const wert = (b) => b.z / b.n;
export const plus = (a, b) => B(a.z * b.n + b.z * a.n, a.n * b.n);
export const minus = (a, b) => B(a.z * b.n - b.z * a.n, a.n * b.n);
export const mal = (a, b) => B(a.z * b.z, a.n * b.n);
export const durch = (a, b) => B(a.z * b.n, a.n * b.z);
export const gleich = (a, b) => !!a && !!b && a.z * b.n === b.z * a.n;
export const betrag = (b) => B(Math.abs(b.z), b.n);
export const hoch = (b, k) => { let r = B(1); for (let i = 0; i < k; i++) r = mal(r, b); return r; };
const EINS = B(1);

/* ---------- Zahlen schreiben ---------- */
/* Minus als „−“ in Rechenzeilen (nicht in TeX-Befehlen) */
const mm = (s) => s.replace(/-(?=\d)/g, "−");
/* Dezimalzahl mit Komma und echtem Minus, ohne überflüssige Nullen */
export function dk(x, n = 3) {
  const t = (Math.round(x * 10 ** n) / 10 ** n).toFixed(n).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return (t === "-0" ? "0" : t).replace("-", "−").replace(".", ",");
}
/* Geldbetrag mit genau zwei Nachkommastellen: 2734,20 */
export const euro = (x) => (Math.round(x * 100) / 100).toFixed(2).replace("-", "−").replace(".", ",");
/* gültige Ziffern (für kleine Werte wie 0,000957) */
export function sig(x, s = 3) {
  if (x === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(x)));
  return dk(x, Math.max(0, s - 1 - e));
}
/* so viele gültige Ziffern, dass die Zahl sichtbar nicht wie ε aussieht */
const neben = (x, e) => { let s = 3, t = sig(x, s); while (t === dk(wert(e), 6) && s < 9) t = sig(x, ++s); return t; };
/* abgeschnitten statt gerundet, mit „…“ (für „n > 143,77…“) – exakt aus einem Bruch */
export function abgeschnitten(b, stellen = 2) {
  if (b.n === 1) return String(b.z).replace("-", "−");
  const f = 10 ** stellen;
  const t = Math.floor((Math.abs(b.z) * f) / b.n);
  return `${b.z < 0 ? "−" : ""}${Math.floor(t / f)},${String(t % f).padStart(stellen, "0")}\\ldots`;
}
/* Grenze „n > …“: ganz oder abbrechend exakt, sonst abgeschnitten mit „…“ */
const grenzeTex = (b) => (b.n === 1 || endlich(b.n) ? zTex(b) : abgeschnitten(b));
/* dasselbe für eine irrationale Zahl (Quotient zweier Logarithmen) */
export const abgeschnittenX = (x, stellen = 2) => { const f = 10 ** stellen, t = Math.floor(x * f + 1e-9); return `${Math.floor(t / f)},${String(t % f).padStart(stellen, "0")}\\ldots`; };
/* TeX einer Zahl: ganze Zahlen ohne Bruchstrich, Minus als „−“ */
export const bTex = (b) => { const s = b.z < 0 ? "−" : ""; const a = Math.abs(b.z); return b.n === 1 ? `${s}${a}` : `${s}\\frac{${a}}{${b.n}}`; };
/* Klartext „−3/4“ */
export const bText = (b) => (b.n === 1 ? String(b.z) : `${b.z}/${b.n}`).replace("-", "−");
/* so, wie man es eintippt („-3/4“) */
export const alsEingabe = (b) => (b.n === 1 ? String(b.z) : `${b.z}/${b.n}`);
export const endlich = (n) => { while (n % 2 === 0) n /= 2; while (n % 5 === 0) n /= 5; return n === 1; };
/* abbrechende Dezimalzahl als Dezimalzahl (0,72), sonst als Bruch */
export function zTex(b) {
  if (b.n === 1 || !endlich(b.n)) return bTex(b);
  let k = 0; while ((10 ** k) % b.n !== 0) k++;
  return dk(wert(b), k);
}
/* negative Zahl als Faktor in Klammern: 3 · (−2) */
const kl = (b) => (b.z < 0 ? `(${bTex(b)})` : bTex(b));
/* Basis einer Potenz: Brüche und negative Zahlen in Klammern */
const klP = (b) => (b.z < 0 || b.n !== 1 ? `\\left(${bTex(b)}\\right)` : bTex(b));
const klPz = (b) => (b.z < 0 || (b.n !== 1 && !endlich(b.n)) ? `\\left(${zTex(b)}\\right)` : zTex(b));
/* Vorfaktor vor einem Term: 1 → nichts, −1 → „−“, sonst „3 \cdot “ */
const vor = (b) => (gleich(b, EINS) ? "" : gleich(b, B(-1)) ? "−" : `${bTex(b)} \\cdot `);
/* Koeffizient vor einer Variablen (eng): 1 → „“, −1 → „−“, 2 → „2“, 1/2 → „\frac{1}{2}“ */
const koef = (b) => (gleich(b, EINS) ? "" : gleich(b, B(-1)) ? "−" : bTex(b));
/* lineare Terme dn + c mit ganzen Zahlen: „3n + 1“, „−n + 23“, „4n“ */
export function linTex(d, c, v = "n") {
  const a = d === 1 ? v : d === -1 ? `−${v}` : `${String(d).replace("-", "−")}${v}`;
  if (c === 0) return a;
  return `${a} ${c > 0 ? "+" : "−"} ${Math.abs(c)}`;
}
/* Glieder einer Summe mit Vorzeichen: „12 − 6 + 3“ */
export function summenText(glieder) {
  return glieder.map((g, i) => (i === 0 ? zTex(g) : g.z < 0 ? `− ${zTex(betrag(g))}` : `+ ${zTex(g)}`)).join(" ");
}
/* „\frac{72}{9} = 8“ – aber nicht „\frac{1}{9} = \frac{1}{9}“ */
const mitWert = (roh, ergebnis) => (roh === ergebnis ? roh : `${roh} = ${ergebnis}`);
/* Potenz mit Exponent: ^1 wird weggelassen */
const pot = (basis, e) => (e === 1 ? basis : `${basis}^{${e}}`);

/* ---------- Eingaben lesen ---------- */
/* „3/4“, „−3/4“, „0,25“, „2“ → { b (exakter Bruch), art: ganz | dezimal | bruch, zr, nr (roh) }; sonst null */
export function lies(s) {
  const t = String(s ?? "").trim().replace(/\s/g, "").replace(/[−–]/g, "-");
  if (!t) return null;
  let m = /^([+-]?)(\d+)\/([+-]?)(\d+)$/.exec(t);
  if (m) {
    const z = Number(m[2]), n = Number(m[4]);
    if (n === 0 || !Number.isSafeInteger(z) || !Number.isSafeInteger(n)) return null;
    const neg = (m[1] === "-") !== (m[3] === "-");
    return { b: B(neg ? -z : z, n), art: "bruch", zr: z, nr: n };
  }
  m = /^([+-]?)(\d*)(?:[.,](\d+))?$/.exec(t);
  if (m && (m[2] || m[3])) {
    const nach = m[3] || "";
    if (nach.length > 12 || (m[2] || "").length > 12) return null;
    const z = Number((m[2] || "0") + nach);
    return { b: B(m[1] === "-" ? -z : z, 10 ** nach.length), art: nach ? "dezimal" : "ganz" };
  }
  return null;
}

/* ---------- Exakter Vergleich „Abstand < ε“ ---------- */
const BI = (x) => BigInt(x);
const potBI = (a, k) => BI(a) ** BI(k);
/* kleinster Index n ≥ start mit kleiner(n) = true; kleiner ist monoton (erst false, dann immer true) */
export function abIndex(kleiner, start = 1, grenze = 1e7) {
  if (kleiner(start)) return start;
  let lo = start, hi = start + 1;
  while (!kleiner(hi)) { lo = hi; hi *= 2; if (hi > grenze) return null; }
  while (hi - lo > 1) { const m = Math.floor((lo + hi) / 2); if (kleiner(m)) hi = m; else lo = m; }
  return hi;
}
/* Abstand |aₙ − g| als { z, n } (BigInt, nicht negativ) je Folgenart der Übungen */
export function abstand(f, n) {
  if (f.form === "kehr") return { z: BI(Math.abs(f.k)), n: BI(n) };                                     // c + k/n
  if (f.form === "linear") return { z: BI(Math.abs(f.b)), n: BI(n) };                                   // (an + b)/n
  if (f.form === "bruch") return { z: BI(Math.abs(f.b * f.c - f.a * f.d)), n: BI(f.c) * BI(f.c * n + f.d) };   // (an + b)/(cn + d)
  if (f.form === "potenz") return { z: potBI(Math.abs(f.q.z), n) * BI(Math.abs(f.b)), n: potBI(f.q.n, n) };   // c + b·qⁿ
  if (f.form === "quadrat") return { z: BI(Math.abs(f.b)), n: BI(f.c) * BI(n) * BI(n) };                // (an² + b)/(cn²)
  throw new Error(`unbekannte Folge ${f.form}`);
}
/* Glied aₙ als Zahl (für Bild und Test) */
export function glied(f, n) {
  if (f.form === "kehr") return f.c + f.k / n;
  if (f.form === "linear") return (f.a * n + f.b) / n;
  if (f.form === "bruch") return (f.a * n + f.b) / (f.c * n + f.d);
  if (f.form === "potenz") return f.c + f.b * wert(f.q) ** n;
  return (f.a * n * n + f.b) / (f.c * n * n);
}
export const imSchlauch = (f, n, eps) => { const a = abstand(f, n); return a.z * BI(eps.n) < BI(eps.z) * a.n; };
export const nNull = (f, eps) => abIndex((n) => imSchlauch(f, n, eps));

/* ---------- Geld exakt in Cent ---------- */
/* Betrag zb/nb in Cent (BigInt), kaufmännisch auf ganze Cent gerundet → Bruch in Euro */
export const centRund = (zb, nb) => B(Number((2n * zb + nb) / (2n * nb)), 100);
/* Sparplan: zu Beginn jedes Jahres R Euro, P % Zinsen, Guthaben am Ende des n-ten Jahres (auf Cent):
   R(1 + p) + R(1 + p)² + … + R(1 + p)ⁿ = R(1 + p) · ((1 + p)ⁿ − 1) / p, in Cent 100 · R(100 + P)((100 + P)ⁿ − 100ⁿ) / (P · 100ⁿ) */
export function sparplan(R, P, n) {
  const A = potBI(100 + P, n), Cn = potBI(100, n);
  return centRund(100n * BI(R) * BI(100 + P) * (A - Cn), BI(P) * Cn);
}

/* ======================================================================
   Labor: vier Folgen, ε-Schlauch, Partialsummen
   ====================================================================== */
export const LABOR_FOLGEN = [
  { id: "arith", name: "arithmetisch" },
  { id: "geo", name: "geometrisch" },
  { id: "kehr", name: "1/n" },
  { id: "harm", name: "harmonisch" },
];
/* ε-Werte des Reglers (exakt) */
export const EPS_LISTE = [B(1, 2), B(3, 10), B(1, 5), B(1, 10), B(1, 20), B(1, 50), B(1, 100)];
export const EPS_START = 3;   // 0,1
/* Parameter: arith { a1, d2 (= 2d) } ganzzahlig, geo { k: q = k/20 }, harm { S } */
export const LABOR_START = { arith: { a1: 1, d2: 1 }, geo: { k: 16 }, kehr: {}, harm: { S: 3 } };
export const qAus = (k) => B(k, 20);

export function laborGlied(art, p, n) {
  if (art === "arith") return p.a1 + ((n - 1) * p.d2) / 2;
  if (art === "geo") return (p.k / 20) ** (n - 1);
  if (art === "kehr") return 1 / n;
  let h = 0; for (let i = 1; i <= n; i++) h += 1 / i; return h;
}
/* Partialsumme sₙ (für „harm“ sind die Glieder selbst schon Partialsummen: null) */
export function laborSumme(art, p, n) {
  if (art === "arith") return n * p.a1 + (n * (n - 1) * p.d2) / 4;
  if (art === "geo") { const q = p.k / 20; return q === 1 ? n : (1 - q ** n) / (1 - q); }
  if (art === "kehr") return laborGlied("harm", p, n);
  return null;
}
/* Monotonie, Beschränktheit, Grenzwert g (exakt) und Wert der Reihe (exakt, null = divergent) */
export function laborEigenschaften(art, p) {
  if (art === "arith") {
    if (p.d2 === 0) return { monoton: "konstant", beschraenkt: true, g: B(p.a1), reihe: p.a1 === 0 ? B(0) : null };
    return { monoton: p.d2 > 0 ? "steigend" : "fallend", beschraenkt: false, g: null, reihe: null };
  }
  if (art === "geo") {
    const k = p.k, q = qAus(k);
    if (k === 20) return { monoton: "konstant", beschraenkt: true, g: B(1), reihe: null };
    if (k === -20) return { monoton: "keine", beschraenkt: true, g: null, reihe: null };
    if (Math.abs(k) > 20) return { monoton: k > 0 ? "steigend" : "keine", beschraenkt: false, g: null, reihe: null };
    return { monoton: k >= 0 ? "fallend" : "keine", beschraenkt: true, g: B(0), reihe: durch(EINS, minus(EINS, q)) };
  }
  if (art === "kehr") return { monoton: "fallend", beschraenkt: true, g: B(0), reihe: null };
  return { monoton: "steigend", beschraenkt: false, g: null, reihe: null };
}
/* ab welchem Index liegen alle Glieder im ε-Schlauch? (null: kein Grenzwert) */
export function laborN0(art, p, eps) {
  const e = laborEigenschaften(art, p);
  if (!e.g || art === "harm") return null;
  if (art === "arith" || p.k === 20) return 1;
  if (art === "kehr") return nNull({ form: "kehr", k: 1 }, eps);
  /* geo: aₙ = q^(n−1), Abstand |k|^(n−1) / 20^(n−1) */
  return abIndex((n) => potBI(Math.abs(p.k), n - 1) * BI(eps.n) < BI(eps.z) * potBI(20, n - 1));
}
/* harmonische Partialsummen: erstes n mit Hₙ > S (Hₙ ist für n ≥ 2 nie ganzzahlig – Gleitkomma reicht) */
export function ueberSchranke(S) {
  let h = 0, n = 0;
  while (h <= S) { n += 1; h += 1 / n; }
  return n;
}
export const HARM_SCHRANKEN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/* ======================================================================
   Übungen: vier Generatoren
   Jede Aufgabe trägt alles bei sich: text (mit $…$), felder (k, label als TeX, modus, typ, soll),
   loesung (Eingabetext), weg (Rechenweg als TeX-Zeilen), fallen (typische falsche Werte je Feld
   mit Rückmeldung), hilfe (Rückmeldung je Feld, wenn keine Falle passt).
   ====================================================================== */
export const ARTEN = [
  { id: "rekursiv", name: "Rekursiv → explizit" },
  { id: "summe", name: "Summenformeln" },
  { id: "grenzwert", name: "Grenzwert und ε" },
  { id: "reihe", name: "Unendliche Reihe" },
];

const FELD = (k, label, soll, typ = "exakt", mehr = {}) => ({
  k, label, soll, typ,
  modus: typ === "ganz" ? (soll.z < 0 ? "ganzvz" : "ganz") : typ === "gerundet" ? "zahl" : "bruch",
  ...mehr,
});
const nahDran = (f, b) => f.typ === "gerundet" && Math.abs(wert(b) - wert(f.soll)) <= (f.tol ?? 0.011);
/* gerundete Eingabe: so viele Nachkommastellen wie verlangt (Geld immer mit zwei: 2734,20) */
const gerundetText = (f, x) => (f.einheit === "€" ? euro(x) : dk(x, f.stellen ?? 2));
function fertig(a) {
  const loesung = {};
  for (const f of a.felder) loesung[f.k] = f.typ === "gerundet" ? gerundetText(f, wert(f.soll)) : alsEingabe(f.soll);
  /* Fallen, die zufällig die Lösung sind (oder ihr gerundet gleichen) oder doppelt vorkommen, fallen weg */
  const fallen = [];
  for (const x of a.fallen || []) {
    const f = a.felder.find((y) => y.k === x.k);
    if (!f || !x.wert || gleich(x.wert, f.soll) || nahDran(f, x.wert)) continue;
    if (f.typ === "ganz" && x.wert.n !== 1) continue;
    if (fallen.some((y) => y.k === x.k && gleich(y.wert, x.wert))) continue;
    fallen.push(x);
  }
  return { ...a, fallen, loesung };
}

/* ---------- 1 · Rekursiv → explizit ---------- */
function regelTex(typ, d) {
  if (typ === "arith") return `a_{n+1} = a_n ${d.z > 0 ? "+" : "−"} ${bTex(betrag(d))}`;
  return `a_{n+1} = ${koef(d)}a_n`;
}
const explizitGeo = (a1, q) => `${vor(a1)}${klP(q)}^{n − 1}`;
function rekursiv(s, zufall) {
  /* Stufe 1–3: rekursive Angabe → a₁, d bzw. q (Vorlage der expliziten Formel) und ein Glied a_k */
  if (s <= 3) {
    let typ, a1, d, k;
    if (s === 1 || (s === 2 && zufall(0, 1) === 0)) {
      typ = "arith";
      a1 = B(s === 1 ? zufall(1, 9) : zufall(15, 60));
      d = B(s === 1 ? zufall(2, 7) : -zufall(2, 9));
      k = s === 1 ? zufall(8, 25) : zufall(6, 15);
    } else if (s === 2) {
      typ = "geo"; a1 = B(zufall(1, 5)); d = B(wahl([2, 3], zufall)); k = d.z === 3 ? zufall(5, 7) : zufall(5, 9);
    } else {
      typ = "geo"; d = wahl([B(1, 2), B(-1, 2), B(1, 3), B(-2), B(3, 2), B(2, 3), B(-1, 3)], zufall);
      a1 = B(zufall(1, 9) * vz(zufall)); k = zufall(4, 6);
    }
    const arith = typ === "arith";
    const pk = hoch(d, k - 1);
    const ak = arith ? plus(a1, mal(B(k - 1), d)) : mal(a1, pk);
    const weg = arith ? [
      `${regelTex(typ, d)} \\;\\Rightarrow\\; \\text{arithmetisch mit } a_1 = ${bTex(a1)},\\; d = ${bTex(d)}`,
      `a_n = ${bTex(a1)} + (n − 1) \\cdot ${kl(d)} = ${linTex(d.z, a1.z - d.z)}`,
      `a_{${k}} = ${bTex(a1)} + ${k - 1} \\cdot ${kl(d)} = ${bTex(ak)}`,
    ] : [
      `${regelTex(typ, d)} \\;\\Rightarrow\\; \\text{geometrisch mit } a_1 = ${bTex(a1)},\\; q = ${bTex(d)}`,
      `a_n = ${explizitGeo(a1, d)}`,
      gleich(a1, EINS) || gleich(a1, B(-1))
        ? `a_{${k}} = ${vor(a1)}${klP(d)}^{${k - 1}} = ${bTex(ak)}`
        : `a_{${k}} = ${vor(a1)}${klP(d)}^{${k - 1}} = ${vor(a1)}${kl(pk)} = ${bTex(ak)}`,
    ];
    const SCHRITTE = `Von $a_1$ bis $a_{${k}}$ sind es nur ${k - 1} Schritte, nicht ${k}.`;
    const fallen = arith ? [
      { k: "ak", wert: plus(a1, mal(B(k), d)), text: `${SCHRITTE} Darum steht in der Formel $(n − 1) \\cdot d$.` },
      { k: "ak", wert: plus(a1, mal(B(k - 2), d)), text: `Zähle die Schritte noch einmal: Von $a_1$ bis $a_{${k}}$ kommt ${k - 1}-mal d dazu.` },
      { k: "d", wert: mal(d, B(-1)), text: "Achte auf das Vorzeichen: d ist das, was von einem Glied zum nächsten dazukommt – bei „− …“ ist d negativ." },
      { k: "a1", wert: plus(a1, d), text: "Das ist schon das zweite Glied. a₁ ist der Startwert, der direkt in der Angabe steht." },
    ] : [
      { k: "ak", wert: mal(a1, hoch(d, k)), text: `${SCHRITTE} Darum steht im Exponenten $n − 1$.` },
      { k: "ak", wert: mal(a1, mal(d, B(k - 1))), text: `Bei einer geometrischen Folge wird ${k - 1}-mal mit q multipliziert – das ist die Potenz $q^{${k - 1}}$, nicht das Produkt ${k - 1} · q.` },
      { k: "ak", wert: mal(betrag(a1), betrag(pk)), text: "Achte auf das Vorzeichen: Eine negative Basis mit ungeradem Exponenten bleibt negativ, ein negativer Startwert ebenso." },
      { k: "q", wert: durch(EINS, d), text: "Umgekehrt: q ist der Faktor, mit dem man ein Glied multipliziert, um das nächste zu bekommen – also q = aₙ₊₁ : aₙ." },
      { k: "q", wert: mal(d, B(-1)), text: "Achte auf das Vorzeichen von q: Es steht in der Regel direkt vor aₙ." },
    ];
    return fertig({
      art: "rekursiv", stufe: s, typ, k, vorlage: typ,
      text: `Eine Folge ist rekursiv gegeben: $a_1 = ${bTex(a1)}$ und $${regelTex(typ, d)}$. Bestimme $a_1$ und ${arith ? "$d$" : "$q$"} für die explizite Formel und berechne $a_{${k}}$.`,
      felder: [
        FELD("a1", "a_1", a1, "exakt", { vorlage: true }),
        FELD(arith ? "d" : "q", arith ? "d" : "q", d, "exakt", { vorlage: true }),
        FELD("ak", `a_{${k}}`, ak, "exakt", { name: `a${k}` }),
      ],
      weg, fallen,
      hilfe: {
        a1: "a₁ ist der Startwert der Folge – er steht in der rekursiven Angabe.",
        [arith ? "d" : "q"]: arith ? "d ist der feste Summand: aₙ₊₁ = aₙ + d." : "q ist der feste Faktor: aₙ₊₁ = q · aₙ.",
        ak: arith ? `Setze n = ${k} in die explizite Formel aₙ = a₁ + (n − 1) · d ein.` : `Setze n = ${k} in die explizite Formel aₙ = a₁ · qⁿ⁻¹ ein.`,
      },
    });
  }
  /* Stufe 4: arithmetisch aus zwei Gliedern – dazu: das wievielte Glied hat den Wert v? */
  if (s === 4) {
    const d = zufall(2, 7) * vz(zufall), i = zufall(2, 5), j = i + zufall(3, 6), m = zufall(15, 40);
    let a1; do { a1 = zufall(-10, 20); } while (a1 === 0);
    const ai = a1 + (i - 1) * d, aj = a1 + (j - 1) * d, v = a1 + (m - 1) * d, c = a1 - d;
    const zurueck = i - 1 === 1 ? "d" : `${i - 1}d`;
    const weg = [
      mm(`a_{${j}} = a_{${i}} + ${j - i}d \\;\\Rightarrow\\; ${j - i}d = ${aj} − ${kl(B(ai))} = ${aj - ai} \\;\\Rightarrow\\; d = ${d}`),
      mm(`a_1 = a_{${i}} − ${zurueck} = ${ai} − ${i - 1 === 1 ? kl(B(d)) : `${i - 1} \\cdot ${kl(B(d))}`} = ${a1}`),
      mm(`a_n = ${a1} + (n − 1) \\cdot ${kl(B(d))} = ${linTex(d, c)}`),
      mm(`${linTex(d, c)} = ${v} \\;\\Rightarrow\\; ${c === 0 ? "" : `${linTex(d, 0)} = ${v - c} \\;\\Rightarrow\\; `}n = ${m}`),
    ];
    return fertig({
      art: "rekursiv", stufe: s, typ: "arith", vorlage: "arith", i, j, m,
      text: `In einer arithmetischen Folge ist $a_{${i}} = ${bTex(B(ai))}$ und $a_{${j}} = ${bTex(B(aj))}$. Bestimme $a_1$ und $d$ und damit die explizite Formel. Das wievielte Glied hat den Wert $${bTex(B(v))}$?`,
      felder: [FELD("a1", "a_1", B(a1), "exakt", { vorlage: true }), FELD("d", "d", B(d), "exakt", { vorlage: true }), FELD("n", "n", B(m), "ganz")],
      weg,
      fallen: [
        { k: "d", wert: B(aj - ai, j - i + 1), text: `Von $a_{${i}}$ bis $a_{${j}}$ sind es ${j - i} Schritte, nicht ${j - i + 1}: $d = \\frac{a_{${j}} − a_{${i}}}{${j - i}}$.` },
        { k: "d", wert: B(aj - ai), text: `Zwischen $a_{${i}}$ und $a_{${j}}$ kommt d nicht einmal, sondern ${j - i}-mal dazu – teile noch durch ${j - i}.` },
        { k: "d", wert: B(-d), text: "Achte auf das Vorzeichen: d = (späteres Glied − früheres Glied) : Anzahl der Schritte." },
        { k: "a1", wert: B(ai), text: `Das ist $a_{${i}}$. Gehe von dort ${i - 1} Schritt${i - 1 === 1 ? "" : "e"} zurück: $a_1 = a_{${i}} − ${zurueck}$.` },
        { k: "a1", wert: B(ai - i * d), text: `Einen Schritt zu weit: Von $a_{${i}}$ bis $a_1$ sind es ${i - 1} Schritte, nicht ${i}.` },
        { k: "n", wert: B(m - 1), text: mm(`Zaunpfahl: $(n − 1) \\cdot d = ${v - a1}$ liefert $n − 1 = ${m - 1}$ – also ist n eins größer.`) },
      ],
      hilfe: { a1: `$a_1 = a_{${i}} − ${zurueck}$.`, d: `Zwischen $a_{${i}}$ und $a_{${j}}$ liegen ${j - i} Schritte: $d = \\frac{a_{${j}} − a_{${i}}}{${j - i}}$.`, n: "Setze die explizite Formel gleich dem Wert und löse nach n auf." },
    });
  }
  /* Stufe 5: geometrisch, a_i und a_(i+3) gegeben – ungerader Abstand, damit q eindeutig ist */
  const q = wahl([2, 3, -2, -3], zufall), a1 = zufall(1, 4) * vz(zufall), i = zufall(2, 3), j = i + 3;
  const m = zufall(j + 1, 9);
  const ai = a1 * q ** (i - 1), aj = a1 * q ** (j - 1), v = a1 * q ** (m - 1);
  const qB = B(q), a1B = B(a1);
  const teiler = i === 2 ? "q" : "q^{2}";
  const weg = [
    mm(`a_{${j}} = a_{${i}} \\cdot q^{3} \\;\\Rightarrow\\; q^{3} = \\frac{${aj}}{${ai}} = ${q ** 3} \\;\\Rightarrow\\; q = ${q}`),
    mm(`a_1 = \\frac{a_{${i}}}{${teiler}} = \\frac{${ai}}{${i === 2 ? q : q * q}} = ${a1}`),
    `a_n = ${explizitGeo(a1B, qB)}`,
    gleich(a1B, EINS) ? `${klP(qB)}^{n − 1} = ${bTex(B(v))} = ${klP(qB)}^{${m - 1}} \\;\\Rightarrow\\; n = ${m}`
      : `${explizitGeo(a1B, qB)} = ${bTex(B(v))} \\;\\Rightarrow\\; ${klP(qB)}^{n − 1} = ${bTex(B(v / a1))} = ${klP(qB)}^{${m - 1}} \\;\\Rightarrow\\; n = ${m}`,
  ];
  return fertig({
    art: "rekursiv", stufe: s, typ: "geo", vorlage: "geo", i, j, m,
    text: `In einer geometrischen Folge ist $a_{${i}} = ${bTex(B(ai))}$ und $a_{${j}} = ${bTex(B(aj))}$. Bestimme $a_1$ und $q$ und damit die explizite Formel. Das wievielte Glied hat den Wert $${bTex(B(v))}$?`,
    felder: [FELD("a1", "a_1", a1B, "exakt", { vorlage: true }), FELD("q", "q", qB, "exakt", { vorlage: true }), FELD("n", "n", B(m), "ganz")],
    weg,
    fallen: [
      { k: "q", wert: B(q ** 3), text: `$\\frac{a_{${j}}}{a_{${i}}}$ ist $q^{3}$ – es liegen drei Schritte dazwischen. Zieh noch die dritte Wurzel.` },
      { k: "q", wert: B(aj - ai, 3), text: "Das wäre der Weg für eine arithmetische Folge. Bei einer geometrischen Folge wird multipliziert: Teile die Glieder durcheinander." },
      { k: "q", wert: B(-q), text: "Achte auf das Vorzeichen: Eine negative Zahl hoch drei bleibt negativ." },
      { k: "a1", wert: B(ai), text: `Das ist $a_{${i}}$. Gehe zurück zum ersten Glied: Teile durch $${teiler}$.` },
      { k: "a1", wert: B(ai * q), text: `Zurück heißt teilen, nicht multiplizieren: $a_1 = \\frac{a_{${i}}}{${teiler}}$.` },
      { k: "n", wert: B(m - 1), text: `Der Exponent ist n − 1 = ${m - 1} – also ist n eins größer.` },
    ],
    hilfe: { a1: `$a_1 = \\frac{a_{${i}}}{${teiler}}$.`, q: `$a_{${j}} = a_{${i}} \\cdot q^{3}$, also $q^{3} = \\frac{a_{${j}}}{a_{${i}}}$.`, n: "Setze die explizite Formel gleich dem Wert, teile durch a₁ und vergleiche die Potenzen." },
  });
}

/* ---------- 2 · Summenformeln ---------- */
function summe(s, zufall) {
  if (s === 1) {
    const n = zufall(2, 20) * 10 + wahl([0, 0, 5, 1], zufall);
    const S = (n * (n + 1)) / 2;
    return fertig({
      art: "summe", stufe: s, n,
      text: `Berechne die Summe der ersten ${n} natürlichen Zahlen: $1 + 2 + 3 + \\ldots + ${n}$.`,
      felder: [FELD("s", `s_{${n}}`, B(S), "ganz", { name: "Summe" })],
      weg: [
        `s_n = \\frac{n(n + 1)}{2} \\quad \\text{(vorwärts und rückwärts addieren)}`,
        `1 + 2 + \\ldots + ${n} = \\frac{${n} \\cdot ${n + 1}}{2} = ${S}`,
      ],
      fallen: [
        { k: "s", wert: B(n * (n + 1)), text: "Teile noch durch 2: Beim Vorwärts- und Rückwärtsschreiben hast du jede Zahl doppelt gezählt." },
        { k: "s", wert: B(n * (n - 1), 2), text: `Jedes Paar aus vorwärts und rückwärts ergibt ${n} + 1 = ${n + 1}, nicht ${n - 1}.` },
        { k: "s", wert: B(n * n, 2), text: `Jedes Paar ergibt ${n + 1}, nicht ${n}: Rechne $\\frac{n(n + 1)}{2}$.` },
      ],
      hilfe: { s: "Schreib die Summe vorwärts und rückwärts untereinander: Jedes Paar ergibt n + 1, und es gibt n Paare." },
    });
  }
  if (s === 2) {
    /* fallend: a₁ so groß, dass mindestens 12 Glieder positiv bleiben – alle Summanden sind positiv */
    const steigt = zufall(0, 2) > 0;
    const d = steigt ? zufall(2, 9) : -zufall(2, 9);
    const a1 = steigt ? zufall(1, 15) : zufall(12 * -d, 12 * -d + 60);
    const nMax = steigt ? 40 : Math.min(40, Math.floor((a1 - 1) / -d) + 1);
    const n = zufall(12, nMax);
    const last = a1 + (n - 1) * d, S = (n * (a1 + last)) / 2;
    const gl = [B(a1), B(a1 + d), B(a1 + 2 * d)];
    return fertig({
      art: "summe", stufe: s, n,
      text: `Wie viele Summanden hat $${summenText(gl)} + \\ldots + ${last}$, und welchen Wert hat die Summe?`,
      felder: [FELD("n", "n", B(n), "ganz", { name: "Anzahl" }), FELD("s", "s", B(S), "exakt", { name: "Summe" })],
      weg: [
        mm(`d = ${a1 + d} − ${a1} = ${d}`),
        mm(`n = \\frac{${last} − ${a1}}{${d}} + 1 = ${n - 1} + 1 = ${n}`),
        `s_{${n}} = \\frac{${n} \\cdot (${a1} + ${last})}{2} = \\frac{${n} \\cdot ${a1 + last}}{2} = ${S}`,
      ],
      fallen: [
        { k: "n", wert: B(n - 1), text: `Zaunpfahl-Fehler: Von ${a1} bis ${last} sind es ${n - 1} Schritte – aber ${n} Glieder. Rechne noch + 1.` },
        { k: "s", wert: B(n * (a1 + last)), text: "Teile noch durch 2: n · (a₁ + aₙ) ist die doppelte Summe (vorwärts plus rückwärts)." },
        { k: "s", wert: B((n - 1) * (a1 + last), 2), text: "Mit der richtigen Anzahl der Glieder rechnen: n ist die Zahl der Summanden, nicht die Zahl der Schritte." },
        { k: "s", wert: B((n - 1) * (a1 + last - d), 2), text: "Die Summe passt nicht: Prüfe zuerst die Anzahl der Glieder (Zaunpfahl: Schritte + 1)." },
      ],
      hilfe: { n: "n = (letztes Glied − erstes Glied) : d + 1.", s: "sₙ = n · (a₁ + aₙ) : 2 – erstes plus letztes Glied, mal Anzahl, durch 2." },
    });
  }
  if (s === 3 || s === 4) {
    let a1, q, n;
    if (s === 3) {
      q = B(wahl([2, 3, 4, -2, -3], zufall));
      do { a1 = B(zufall(1, 6)); n = zufall(5, 8); } while (Math.abs(a1.z * q.z ** (n - 1)) > 20000);
    } else {
      const [qq, nMax, faktoren] = wahl([[B(1, 2), 8, [1, 3, 5]], [B(1, 3), 6, [1, 2]], [B(2, 3), 6, [1]], [B(-1, 2), 7, [1, 3]], [B(3, 4), 5, [1, 2]]], zufall);
      q = qq; n = zufall(5, nMax);
      a1 = B(wahl(faktoren, zufall) * q.n ** (n - 1));
    }
    const glieder = Array.from({ length: n }, (_, i) => mal(a1, hoch(q, i)));
    const last = glieder[n - 1];
    const qn = hoch(q, n);
    const S = mal(a1, durch(minus(EINS, qn), minus(EINS, q)));
    const hinten = last.z < 0 ? `− ${zTex(betrag(last))}` : `+ ${zTex(last)}`;
    const weg = [
      `q = \\frac{${bTex(glieder[1])}}{${bTex(a1)}} = ${bTex(q)}`,
      gleich(a1, EINS)
        ? `${klP(q)}^{n − 1} = ${bTex(last)} = ${klP(q)}^{${n - 1}} \\;\\Rightarrow\\; n = ${n}`
        : `${explizitGeo(a1, q)} = ${bTex(last)} \\;\\Rightarrow\\; ${klP(q)}^{n − 1} = ${bTex(durch(last, a1))} = ${klP(q)}^{${n - 1}} \\;\\Rightarrow\\; n = ${n}`,
    ];
    if (q.n === 1 && q.z > 1) {
      const Z = q.z ** n - 1;
      weg.push(q.z === 2
        ? `s_{${n}} = ${vor(a1)}\\frac{2^{${n}} − 1}{2 − 1} = ${gleich(a1, EINS) ? "" : `${vor(a1)}${Z} = `}${bTex(S)}`
        : `s_{${n}} = ${vor(a1)}\\frac{${q.z}^{${n}} − 1}{${q.z} − 1} = ${vor(a1)}\\frac{${Z}}{${q.z - 1}} = ${bTex(S)}`);
    } else if (q.n === 1) {
      weg.push(`s_{${n}} = ${vor(a1)}\\frac{1 − ${klP(q)}^{${n}}}{1 − ${kl(q)}} = ${vor(a1)}\\frac{${bTex(minus(EINS, qn))}}{${1 - q.z}} = ${bTex(S)}`);
    } else {
      weg.push(`s_{${n}} = ${vor(a1)}\\frac{1 − ${klP(q)}^{${n}}}{1 − ${q.z < 0 ? klP(q) : bTex(q)}} = ${vor(a1)}${bTex(minus(EINS, qn))} \\cdot ${bTex(durch(EINS, minus(EINS, q)))} = ${bTex(S)}`);
    }
    return fertig({
      art: "summe", stufe: s, n, q,
      text: `Wie viele Summanden hat $${summenText(glieder.slice(0, 3))} ${glieder[3].z < 0 ? "−" : "+"} \\ldots ${hinten}$, und welchen Wert hat die Summe?`,
      felder: [FELD("n", "n", B(n), "ganz", { name: "Anzahl" }), FELD("s", "s", S, "exakt", { name: "Summe" })],
      weg,
      fallen: [
        { k: "n", wert: B(n - 1), text: `Der Exponent n − 1 ist ${n - 1} – die Anzahl der Glieder ist eins größer: Der erste Summand hat den Exponenten 0.` },
        { k: "s", wert: mal(a1, durch(minus(EINS, hoch(q, n - 1)), minus(EINS, q))), text: "In der Summenformel steht $q^{n}$ mit n = Anzahl der Glieder, nicht $q^{n − 1}$." },
        { k: "s", wert: durch(minus(EINS, qn), minus(EINS, q)), text: "Den Startwert a₁ nicht vergessen: sₙ = a₁ · (1 − qⁿ) : (1 − q)." },
        { k: "s", wert: mal(a1, durch(minus(EINS, qn), plus(EINS, q))), text: "Im Nenner steht 1 − q, nicht 1 + q – das kommt vom Abziehen von q · sₙ." },
      ],
      hilfe: { n: "Bestimme q, setze a₁ · qⁿ⁻¹ gleich dem letzten Glied und vergleiche die Exponenten.", s: "sₙ = a₁ · (1 − qⁿ) : (1 − q) mit n = Anzahl der Glieder." },
    });
  }
  /* Stufe 5: Sachaufgaben */
  const kontext = wahl(["theater", "geruecht", "sparplan"], zufall);
  if (kontext === "theater") {
    const a1 = zufall(10, 24), d = zufall(2, 4), n = zufall(12, 30), last = a1 + (n - 1) * d, S = (n * (a1 + last)) / 2;
    return fertig({
      art: "summe", stufe: s, kontext, n,
      text: `In einem Theater hat die erste Reihe ${a1} Plätze, jede weitere Reihe ${d} Plätze mehr als die davor. Es gibt ${n} Reihen. Wie viele Plätze hat das Theater insgesamt?`,
      felder: [FELD("s", `s_{${n}}`, B(S), "ganz", { einheit: "Plätze", name: "Plätze" })],
      weg: [
        `a_{${n}} = ${a1} + ${n - 1} \\cdot ${d} = ${last}`,
        `s_{${n}} = \\frac{${n} \\cdot (${a1} + ${last})}{2} = \\frac{${n} \\cdot ${a1 + last}}{2} = ${S}`,
      ],
      fallen: [
        { k: "s", wert: B(n * (a1 + last)), text: "Teile noch durch 2: n · (a₁ + aₙ) zählt jeden Platz doppelt." },
        { k: "s", wert: B(n * (2 * a1 + n * d), 2), text: `Die letzte Reihe hat ${a1} + ${n - 1} · ${d} Plätze – bis zur ${n}. Reihe kommen nur ${n - 1}-mal ${d} Plätze dazu.` },
        { k: "s", wert: B(n * a1), text: "Die Reihen werden nach hinten länger – rechne mit dem Mittelwert aus erster und letzter Reihe." },
        { k: "s", wert: B(last), text: "Das ist nur die letzte Reihe. Gesucht ist die Summe über alle Reihen." },
      ],
      hilfe: { s: "Arithmetische Summe: sₙ = n · (a₁ + aₙ) : 2. Bestimme zuerst die Zahl der Plätze in der letzten Reihe." },
    });
  }
  if (kontext === "geruecht") {
    let q, n;
    do { q = zufall(2, 4); n = zufall(4, 8); } while (q ** n > 70000);
    const S = (q * (q ** n - 1)) / (q - 1);
    const name = wahl(["Mia", "Ben", "Lea", "Emil", "Sara", "Noah"], zufall);
    return fertig({
      art: "summe", stufe: s, kontext, n, q,
      text: `Am ersten Tag erzählt ${name} ein Gerücht ${q} Leuten. An jedem weiteren Tag erzählt jeder, der es am Vortag erfahren hat, es ${q} neuen Leuten. Wie viele Leute haben das Gerücht nach ${n} Tagen erfahren (${name} nicht mitgezählt)?`,
      felder: [FELD("s", `s_{${n}}`, B(S), "ganz", { einheit: "Leute", name: "Leute" })],
      weg: [
        `\\text{neu am Tag } k: ${q}^{k}, \\quad a_1 = ${q},\\; q = ${q},\\; n = ${n}`,
        q === 2
          ? `s_{${n}} = 2 \\cdot \\frac{2^{${n}} − 1}{2 − 1} = 2 \\cdot ${2 ** n - 1} = ${S}`
          : `s_{${n}} = ${q} \\cdot \\frac{${q}^{${n}} − 1}{${q} − 1} = ${q} \\cdot \\frac{${q ** n - 1}}{${q - 1}} = ${S}`,
      ],
      fallen: [
        { k: "s", wert: B(q ** n), text: `Das sind nur die Neuen am ${n}. Tag. Gesucht sind alle zusammen – addiere die Tage.` },
        { k: "s", wert: B((q ** n - 1) / (q - 1)), text: `Der erste Summand ist ${q} (die Leute vom ersten Tag), nicht 1: sₙ = a₁ · (qⁿ − 1) : (q − 1) mit a₁ = ${q}.` },
        { k: "s", wert: B((q * (q ** (n - 1) - 1)) / (q - 1)), text: `Das sind nur ${n - 1} Tage. Im Exponenten der Summenformel steht die Anzahl der Glieder: ${n}.` },
        { k: "s", wert: B(q * n), text: "Das Gerücht wächst nicht um gleich viele Leute pro Tag, sondern mit dem Faktor q – geometrisch, nicht arithmetisch." },
      ],
      hilfe: { s: "Am Tag k kommen qᵏ neue Leute dazu: geometrische Summe mit a₁ = q und n Gliedern." },
    });
  }
  /* Sparplan: zu Beginn jedes Jahres R Euro, P % Zinsen; exakt in Cent (BigInt), kaufmännisch gerundet */
  const R = wahl([100, 200, 500, 1000, 1200], zufall), P = zufall(1, 4), n = zufall(3, 10);
  const A = potBI(100 + P, n), Cn = potBI(100, n);
  const S = sparplan(R, P, n);
  const qTex = `1,0${P}`;
  const a1 = (R * (100 + P)) / 100;
  const glieder = n <= 3 ? Array.from({ length: n }, (_, i) => (i === 0 ? `${a1}` : `${a1} \\cdot ${pot(qTex, i)}`)).join(" + ")
    : `${a1} + ${a1} \\cdot ${qTex} + \\ldots + ${a1} \\cdot ${qTex}^{${n - 1}}`;
  return fertig({
    art: "summe", stufe: s, kontext: "sparplan", n, R, P,
    text: `Du zahlst zu Beginn jedes Jahres ${R} € auf ein Sparkonto ein. Das Guthaben wird mit ${P} % pro Jahr verzinst (Zinseszins). Wie viel Geld ist am Ende des ${n}. Jahres auf dem Konto? Runde auf Cent.`,
    felder: [FELD("s", `s_{${n}}`, S, "gerundet", { einheit: "€", tol: 0.011, stellen: 2, name: "Guthaben" })],
    weg: [
      `\\text{letzte Einzahlung 1 Jahr verzinst, erste ${n} Jahre}`,
      `a_1 = ${R} \\cdot ${qTex} = ${a1}, \\quad q = ${qTex}`,
      `s_{${n}} = ${glieder}`,
      `s_{${n}} = ${a1} \\cdot \\frac{${qTex}^{${n}} − 1}{${qTex} − 1} \\approx ${euro(wert(S))} \\text{ €}`,
    ],
    fallen: [
      { k: "s", wert: centRund(10000n * BI(R) * (A - Cn), BI(P) * Cn), text: "Die Einzahlung zu Jahresbeginn wird schon im ersten Jahr verzinst: Der erste Summand ist R · (1 + p), nicht R." },
      { k: "s", wert: B(R * n), text: "Ohne Zinsen wäre es nur die Summe der Einzahlungen. Jede Einzahlung wächst mit dem Faktor 1 + p pro Jahr." },
      { k: "s", wert: centRund(100n * BI(R) * A, Cn), text: "Das ist nur die erste Einzahlung mit Zinsen. Jede weitere Einzahlung kommt dazu – geometrische Summe." },
    ],
    hilfe: { s: "Jede Einzahlung wächst bis zum Ende: die letzte 1 Jahr, die erste n Jahre. Das ist eine geometrische Summe mit a₁ = R · (1 + p) und q = 1 + p." },
  });
}

/* ---------- 3 · Grenzwert und ε-Schlauch ---------- */
function grenzwert(s, zufall) {
  let f, g, formel, weg, eps, fallenG = [], hilfeG;
  const genauText = (grenze) => `\\text{bei } n = ${bTex(grenze)} \\text{ ist der Abstand genau } ${zTex(eps)} \\text{, also nicht kleiner}`;
  if (s === 1) {
    const k = zufall(1, 5), c = wahl([0, 0, 1, 2, -1], zufall);
    eps = wahl([B(1, 10), B(1, 20), B(1, 100), B(1, 1000)], zufall);
    f = { form: "kehr", k, c }; g = B(c);
    formel = c === 0 ? `\\frac{${k}}{n}` : `${bTex(B(c))} + \\frac{${k}}{n}`;
    const grenze = mal(B(k), durch(EINS, eps));
    weg = [
      `\\frac{${k}}{n} \\to 0 \\;\\Rightarrow\\; g = ${bTex(g)}`,
      `|a_n − g| = \\frac{${k}}{n} < ${zTex(eps)} \\;\\Leftrightarrow\\; n > \\frac{${k}}{${zTex(eps)}} = ${bTex(grenze)}`,
      genauText(grenze),
    ];
    fallenG = [{ k: "g", wert: B(c + k), text: `Das ist $a_1$. Der Grenzwert ist der Wert, dem die Glieder für große n nahekommen: $\\frac{${k}}{n}$ geht gegen 0.` }];
    if (c !== 0) fallenG.push({ k: "g", wert: B(0), text: `$\\frac{${k}}{n}$ geht gegen 0 – aber der Summand ${bTex(B(c))} bleibt stehen.` });
    hilfeG = `$\\frac{${k}}{n}$ geht gegen 0.`;
  } else if (s === 2) {
    const a = zufall(1, 5), b = zufall(1, 9) * vz(zufall);
    eps = wahl([B(1, 10), B(1, 50), B(1, 100)], zufall);
    f = { form: "linear", a, b }; g = B(a);
    formel = `\\frac{${linTex(a, b)}}{n}`;
    const grenze = mal(B(Math.abs(b)), durch(EINS, eps));
    weg = [
      `a_n = \\frac{${linTex(a, b)}}{n} = ${a} ${b > 0 ? "+" : "−"} \\frac{${Math.abs(b)}}{n} \\to ${a} \\;\\Rightarrow\\; g = ${a}`,
      `|a_n − ${a}| = \\frac{${Math.abs(b)}}{n} < ${zTex(eps)} \\;\\Leftrightarrow\\; n > \\frac{${Math.abs(b)}}{${zTex(eps)}} = ${bTex(grenze)}`,
      genauText(grenze),
    ];
    fallenG = [
      { k: "g", wert: B(b), text: "Teile Zähler und Nenner durch n: Der Summand mit n bleibt, der ohne n verschwindet." },
      { k: "g", wert: B(a + b), text: "Das ist $a_1$. Gefragt ist, wohin die Glieder für große n laufen." },
    ];
    hilfeG = `Schreibe $a_n = ${a} ${b > 0 ? "+" : "−"} \\frac{${Math.abs(b)}}{n}$.`;
  } else if (s === 3) {
    let a, b, c, d, D;
    eps = wahl([B(1, 10), B(1, 100)], zufall);
    do {
      a = zufall(1, 7); c = zufall(2, 4); d = zufall(1, 6); b = zufall(-6, 6); D = b * c - a * d;
    } while (D === 0 || Math.abs(D) * eps.n - c * d < c * c || a % c === 0);
    f = { form: "bruch", a, b, c, d }; g = B(a, c);
    const zae = linTex(a, b), nen = linTex(c, d), E = eps.n;
    formel = `\\frac{${zae}}{${nen}}`;
    const oben = b === 0 ? `${a}` : `${a} ${b > 0 ? "+" : "−"} \\frac{${Math.abs(b)}}{n}`;
    const gTex = ggT(a, c) === 1 ? `\\frac{${a}}{${c}}` : `\\frac{${a}}{${c}} = ${bTex(g)}`;
    /* |aₙ − g| = |D| / (c²n + cd), gekürzt durch t = ggT(|D|, c², cd): Z / (An + K) */
    const t = ggT(ggT(Math.abs(D), c * c), c * d), Z = Math.abs(D) / t, A = (c * c) / t, K = (c * d) / t, rechts = Z * E - K;
    const rest = `\\frac{${Z}}{${linTex(A, K)}}`;
    weg = [
      `a_n = \\frac{${oben}}{${c} + \\frac{${d}}{n}} \\to ${gTex} \\;\\Rightarrow\\; g = ${bTex(g)}`,
      `|a_n − g| = \\frac{|${c}(${zae}) − ${a === 1 ? "" : a}(${nen})|}{${c}(${nen})} = \\frac{${Math.abs(D)}}{${linTex(c * c, c * d)}}${t > 1 ? ` = ${rest}` : ""}`,
      `${rest} < ${zTex(eps)} \\;\\Leftrightarrow\\; ${linTex(A, K)} > ${Z * E} \\;\\Leftrightarrow\\; ${linTex(A, 0)} > ${rechts}`,
    ];
    if (A > 1) weg.push(`n > \\frac{${rechts}}{${A}} = ${grenzeTex(B(rechts, A))}`);
    fallenG = [
      { k: "g", wert: B(a), text: "Teile Zähler und Nenner durch n: Übrig bleibt das Verhältnis der Vorfaktoren von n – oben und unten." },
      { k: "g", wert: B(b, d), text: mm(`$\\frac{${b}}{${d}}$ wäre der Wert für n = 0. Für große n zählen nur die Glieder mit n.`) },
      { k: "g", wert: B(c, a), text: "Kehrwert erwischt: Der Vorfaktor aus dem Zähler steht oben, der aus dem Nenner unten." },
    ];
    hilfeG = "Teile Zähler und Nenner durch n und lass n gegen unendlich gehen.";
  } else if (s === 4) {
    const q = wahl([B(1, 2), B(-1, 2), B(1, 3), B(2, 3), B(3, 4), B(-3, 4), B(4, 5), B(9, 10), B(-2, 3)], zufall);
    eps = wahl([B(1, 10), B(1, 100), B(1, 1000)], zufall);
    f = { form: "potenz", q, b: 1, c: 0 }; g = B(0);
    formel = `${klP(q)}^{n}`;
    const qb = betrag(q);
    weg = [
      `|q| = ${zTex(qb)} < 1 \\;\\Rightarrow\\; ${klP(q)}^{n} \\to 0, \\quad g = 0`,
      `|a_n − 0| = ${klPz(qb)}^{n} < ${zTex(eps)}`,
      `n > \\frac{\\ln ${zTex(eps)}}{\\ln ${zTex(qb)}} = ${abgeschnittenX(Math.log(wert(eps)) / Math.log(wert(qb)))} \\quad (\\ln ${zTex(qb)} < 0)`,
    ];
    fallenG = [{ k: "g", wert: B(1), text: "Für |q| < 1 wird qⁿ immer kleiner: Jede Multiplikation mit q verkleinert den Betrag." }];
    hilfeG = "Für |q| < 1 geht qⁿ gegen 0.";
  } else {
    eps = wahl([B(1, 100), B(1, 1000)], zufall);
    if (zufall(0, 1) === 0) {
      const q = wahl([B(1, 2), B(2, 3), B(-1, 2), B(3, 4), B(4, 5)], zufall), c = zufall(-3, 5), b = wahl([2, 3, 5, -2], zufall);
      f = { form: "potenz", q, b, c }; g = B(c);
      formel = c === 0 ? `${b < 0 ? "−" : ""}${Math.abs(b)} \\cdot ${klP(q)}^{n}` : mm(`${c} ${b > 0 ? "+" : "−"} ${Math.abs(b)} \\cdot ${klP(q)}^{n}`);
      const qb = betrag(q), grenzeE = durch(eps, B(Math.abs(b)));
      weg = [
        mm(`${klP(q)}^{n} \\to 0 \\;\\Rightarrow\\; g = ${c}`),
        `|a_n − g| = ${Math.abs(b)} \\cdot ${klPz(qb)}^{n} < ${zTex(eps)} \\;\\Leftrightarrow\\; ${klPz(qb)}^{n} < ${bTex(grenzeE)}`,
        `n > \\frac{\\ln ${bTex(grenzeE)}}{\\ln ${zTex(qb)}} = ${abgeschnittenX(Math.log(wert(grenzeE)) / Math.log(wert(qb)))} \\quad (\\ln ${zTex(qb)} < 0)`,
      ];
      fallenG = [
        { k: "g", wert: B(c + b), text: "Das ist der Wert für n = 0. Für große n verschwindet der Summand mit qⁿ." },
        ...(c !== 0 ? [{ k: "g", wert: B(0), text: mm(`qⁿ geht gegen 0 – aber der Summand ${c} bleibt stehen.`) }] : []),
      ];
      hilfeG = "Für |q| < 1 geht qⁿ gegen 0 – was bleibt übrig?";
    } else {
      const a = zufall(1, 6), b = zufall(1, 9) * vz(zufall), c = wahl([1, 2, 4, 5], zufall);
      f = { form: "quadrat", a, b, c }; g = B(a, c);
      const zae = `${a === 1 ? "" : a}n^{2} ${b > 0 ? "+" : "−"} ${Math.abs(b)}`, nen = `${c === 1 ? "" : c}n^{2}`;
      formel = `\\frac{${zae}}{${nen}}`;
      const X = (Math.abs(b) * eps.n) / c, w = Math.round(Math.sqrt(X)), quad = w * w === X;
      const rest = B(Math.abs(b), c), restNen = `${rest.n === 1 ? "" : rest.n}n^{2}`;   // gekürzt: 6/(2n²) → 3/n²
      weg = [
        `a_n = ${bTex(g)} ${b > 0 ? "+" : "−"} \\frac{${rest.z}}{${restNen}} \\to ${bTex(g)} \\;\\Rightarrow\\; g = ${bTex(g)}`,
        `|a_n − g| = \\frac{${rest.z}}{${restNen}} < ${zTex(eps)} \\;\\Leftrightarrow\\; n^{2} > ${X}`,
        quad ? `n > \\sqrt{${X}} = ${w} \\quad \\text{(bei } n = ${w} \\text{ ist der Abstand genau } ${zTex(eps)} \\text{)}` : `n > \\sqrt{${X}} = ${abgeschnittenX(Math.sqrt(X))}`,
      ];
      fallenG = [
        { k: "g", wert: B(a), text: "Teile Zähler und Nenner durch n²: Es bleibt das Verhältnis der Vorfaktoren von n²." },
        { k: "g", wert: B(a + b, c), text: "Das ist a₁. Gefragt ist der Wert für große n – dort verschwindet der Summand ohne n²." },
      ];
      hilfeG = "Teile Zähler und Nenner durch n².";
    }
  }
  const n0 = nNull(f, eps);
  if (f.form === "potenz") {
    const qb = betrag(f.q), mb = Math.abs(f.b), fak = mb === 1 ? "" : `${mb} \\cdot `;
    /* exakt, wenn die Zahl als kurze Dezimalzahl abbricht (0,5³ = 0,125), sonst gerundet */
    const zeig = (k) => {
      const x = mal(B(mb), hoch(qb, k));
      return endlich(x.n) && x.n <= 1e6 && k > 0 ? `= ${zTex(x)}` : `\\approx ${neben(wert(x), eps)}`;
    };
    if (n0 > 1) weg.push(`${fak}${pot(klPz(qb), n0 - 1)} ${zeig(n0 - 1)} \\ge ${zTex(eps)}`);
    weg.push(`${fak}${pot(klPz(qb), n0)} ${zeig(n0)} < ${zTex(eps)}`);
  }
  weg.push(`n_0 = ${n0}`);
  /* Grenzfall: genau bei n₀ − 1 ist der Abstand gleich ε */
  const am = abstand(f, n0 - 1);
  const genau = n0 > 1 && am.z * BI(eps.n) === BI(eps.z) * am.n;
  return fertig({
    art: "grenzwert", stufe: s, folge: f, eps, formel, genau, n0,
    text: `Gegeben ist die Folge $a_n = ${formel}$. Bestimme ihren Grenzwert g und den kleinsten Index $n_0$, ab dem alle Glieder im ε-Schlauch mit ε = ${dk(wert(eps), 4)} liegen: $|a_n − g| < ${zTex(eps)}$ für alle $n \\ge n_0$.`,
    felder: [FELD("g", "g", g, "exakt", { name: "g" }), FELD("n0", "n_0", B(n0), "ganz", { name: "n0" })],
    weg,
    fallen: [
      ...fallenG,
      { k: "n0", wert: B(n0 - 1), text: genau
        ? `Bei $n = ${n0 - 1}$ ist der Abstand genau ${dk(wert(eps), 4)} – im Schlauch heißt aber echt kleiner als ε. Also erst ab $n = ${n0}$.`
        : `Bei $n = ${n0 - 1}$ ist der Abstand noch nicht kleiner als ε. n muss größer sein als die Grenze – also aufrunden.` },
      { k: "n0", wert: B(n0 + 1), text: `Schon bei $n = ${n0}$ ist der Abstand kleiner als ε. Gesucht ist der kleinste Index.` },
    ],
    hilfe: { g: hilfeG, n0: "Löse die Ungleichung |aₙ − g| < ε nach n auf. n₀ ist die kleinste ganze Zahl, die sie erfüllt." },
  });
}

/* ---------- 4 · Unendliche geometrische Reihe ---------- */
export const periodeTex = (I, V, P, L) => `${I},${V}\\overline{${String(P).padStart(L, "0")}}`;
function reihe(s, zufall) {
  if (s === 1 || s === 2) {
    const q = s === 1 ? wahl([B(1, 2), B(1, 3), B(1, 4), B(2, 3), B(3, 4), B(1, 5), B(2, 5)], zufall)
      : wahl([B(-1, 2), B(-1, 3), B(-2, 3), B(-1, 4), B(-3, 4), B(-1, 5)], zufall);
    const a1 = B(zufall(1, 3) * q.n * q.n);
    const gl = [a1, mal(a1, q), mal(a1, hoch(q, 2))];
    const S = durch(a1, minus(EINS, q));
    const weg = [
      `q = \\frac{${bTex(gl[1])}}{${bTex(a1)}} = ${bTex(q)}, \\quad |q| < 1`,
      `s = \\frac{a_1}{1 − q} = \\frac{${bTex(a1)}}{1 − ${q.z < 0 ? klP(q) : bTex(q)}} = \\frac{${bTex(a1)}}{${bTex(minus(EINS, q))}} = ${bTex(S)}`,
    ];
    return fertig({
      art: "reihe", stufe: s, q,
      text: s === 1 ? `Berechne den Wert der unendlichen Reihe $${summenText(gl)} + \\ldots$`
        : `Bestimme den Quotienten q und den Wert der unendlichen Reihe $${summenText(gl)} ${gl[2].z * q.z < 0 ? "−" : "+"} \\ldots$`,
      felder: s === 1 ? [FELD("s", "s", S, "exakt", { name: "Summe" })] : [FELD("q", "q", q, "exakt", { name: "q" }), FELD("s", "s", S, "exakt", { name: "Summe" })],
      weg,
      fallen: [
        { k: "s", wert: durch(EINS, minus(EINS, q)), text: "Den Startwert nicht vergessen: s = a₁ : (1 − q), nicht 1 : (1 − q)." },
        { k: "s", wert: durch(a1, plus(EINS, q)), text: "Im Nenner steht 1 − q. Das Minus kommt aus dem Abziehen von q · s." },
        { k: "s", wert: durch(a1, minus(EINS, betrag(q))), text: "Achte auf das Vorzeichen von q: Die Glieder wechseln ihr Vorzeichen, also ist q negativ – und 1 − q größer als 1." },
        { k: "s", wert: mal(a1, minus(EINS, q)), text: "Durch (1 − q) teilen, nicht damit multiplizieren: s = a₁ : (1 − q)." },
        { k: "q", wert: betrag(q), text: "Achte auf das Vorzeichen: Die Glieder wechseln ihr Vorzeichen, also ist q negativ." },
        { k: "q", wert: durch(EINS, q), text: "Umgekehrt: q = a₂ : a₁ – das zweite Glied durch das erste." },
      ],
      hilfe: { q: "q ist der Faktor von einem Glied zum nächsten: q = a₂ : a₁.", s: "Für |q| < 1 gilt a₁ + a₁q + a₁q² + … = a₁ : (1 − q)." },
    });
  }
  if (s === 3 || s === 4) {
    const L = wahl([1, 2], zufall);
    const neuP = () => { let P; do { P = L === 1 ? zufall(1, 8) : zufall(1, 98); } while (L === 2 && P % 11 === 0); return P; };
    let I = 0, V = "", P = neuP();
    if (s === 4) {
      do {
        I = wahl([0, 0, 1, 2], zufall); V = wahl(["", "0", String(zufall(1, 9))], zufall); P = neuP();
      } while ((I === 0 && V === "") || (V !== "" && Number(V) === P % 10));
    }
    const v = V.length, N = 10 ** L - 1, Ps = String(P).padStart(L, "0");
    const periodisch = B(P, 10 ** v * N);
    const wertX = plus(B(I * 10 ** v + Number(V || 0), 10 ** v), periodisch);
    const x = periodeTex(I, V, P, L);
    const gl = (k) => `\\frac{${P}}{${10 ** (v + k * L)}}`;
    const reiheTex = `${gl(1)} + ${gl(2)} + ${L === 1 ? `${gl(3)} + ` : ""}\\ldots`;
    const summeP = `\\frac{${gl(1)}}{1 − \\frac{1}{${10 ** L}}} = \\frac{${gl(1)}}{\\frac{${N}}{${10 ** L}}} = \\frac{${P}}{${10 ** v * N}}${ggT(P, 10 ** v * N) === 1 ? "" : ` = ${bTex(periodisch)}`}`;
    /* Teil vor der Periode: I bzw. I,V – als Dezimalzahl hingeschrieben, als Bruch weitergerechnet */
    const vorne = B(I * 10 ** v + Number(V || 0), 10 ** v);
    const vorneTex = Number(V) > 0 ? `${I},${V}` : String(I);
    const weg = vorne.z === 0 ? [
      `${x} = ${reiheTex}`,
      `a_1 = ${gl(1)}, \\quad q = \\frac{1}{${10 ** L}}`,
      `s = ${summeP}`,
    ] : [
      `${x} = ${vorneTex} + \\left(${reiheTex}\\right)`,
      `${reiheTex} = ${summeP}`,
      vorne.n === 1 ? `${x} = ${vorneTex} + ${bTex(periodisch)} = ${bTex(wertX)}`
        : `${x} = ${bTex(vorne)} + ${bTex(periodisch)} = ${bTex(wertX)}`,
    ];
    const fallen = s === 3 ? [
      { k: "s", wert: B(P, 10 ** L), text: `Das wäre die abbrechende Zahl 0,${Ps}. Die Periode geht aber unendlich weiter – summiere die geometrische Reihe mit $q = \\frac{1}{${10 ** L}}$.` },
      L === 2 ? { k: "s", wert: B(P, 90), text: "Bei zwei Ziffern in der Periode ist $q = \\frac{1}{100}$ – im Nenner steht 99, nicht 90." }
        : { k: "s", wert: B(P, 99), text: "Bei einer Ziffer in der Periode ist $q = \\frac{1}{10}$ – im Nenner steht 9." },
    ] : [
      { k: "s", wert: plus(B(I), B(Number(V + Ps), 10 ** (v + L) - 1)), text: "Vor der Periode steht eine Ziffer, die sich nicht wiederholt. Zerlege die Zahl: Vorperiode plus geometrische Reihe." },
      { k: "s", wert: plus(B(I), B(Number(V + Ps), 10 ** v * N)), text: `Fast: Ziehe die Vorperiode ab – im Zähler steht ${V}${Ps} − ${V}, nicht ${V}${Ps}.` },
      { k: "s", wert: minus(wertX, B(I)), text: "Den ganzzahligen Teil vor dem Komma nicht vergessen." },
    ];
    return fertig({
      art: "reihe", stufe: s, I, V, P, L, x,
      text: `Schreibe die periodische Dezimalzahl $${x}$ als vollständig gekürzten Bruch.`,
      felder: [FELD("s", x, wertX, "gekuerzt", { name: "Bruch" })],
      weg, fallen,
      hilfe: { s: s === 3 ? `Schreibe die Zahl als geometrische Reihe: $${reiheTex}$, und nutze $\\frac{a_1}{1 − q}$.` : "Zerlege die Zahl in den Teil vor der Periode und eine geometrische Reihe für die Periode." },
    });
  }
  /* Stufe 5: Ball oder Achilles */
  if (zufall(0, 1) === 0) {
    const h = zufall(1, 5);
    const [q, wort] = wahl([[B(1, 2), "50 %"], [B(3, 5), "60 %"], [B(3, 4), "75 %"], [B(4, 5), "80 %"], [B(2, 3), "zwei Drittel"]], zufall);
    const hq = mal(B(h), q), rest = durch(hq, minus(EINS, q)), S = plus(B(h), mal(B(2), rest));
    return fertig({
      art: "reihe", stufe: s, kontext: "ball", h, q,
      text: `Ein Ball fällt aus ${h} m Höhe auf den Boden und springt jedes Mal auf ${wort} seiner vorigen Höhe zurück. Welche Strecke legt er insgesamt zurück, wenn er (im Modell) unendlich oft springt?`,
      felder: [FELD("s", "s", S, "exakt", { einheit: "m", name: "Strecke" })],
      weg: [
        `s = ${h} + 2 \\cdot (${zTex(hq)} + ${zTex(mal(hq, q))} + \\ldots)`,
        `s = ${h} + 2 \\cdot \\frac{${zTex(hq)}}{1 − ${zTex(q)}} = ${h} + ${gleich(rest, EINS) ? "2" : `2 \\cdot ${zTex(rest)}`} = ${bTex(S)}`,
      ],
      fallen: [
        { k: "s", wert: durch(B(h), minus(EINS, q)), text: "Jeder Rücksprung führt hoch und wieder runter – zähle die Rücksprünge doppelt. Nur der erste Fall zählt einfach." },
        { k: "s", wert: plus(B(h), rest), text: "Hoch und runter: Jeder Rücksprung kommt zweimal vor. Faktor 2 vor der Reihe der Sprunghöhen." },
        { k: "s", wert: mal(B(2), durch(B(h), minus(EINS, q))), text: "Den ersten Fall aus der Starthöhe gibt es nur einmal – nach unten, nicht nach oben." },
      ],
      hilfe: { s: "Erst fällt der Ball h Meter. Jeder Rücksprung geht hoch und runter: s = h + 2 · (hq + hq² + …)." },
    });
  }
  const [L, vA, vS] = wahl([[100, 10, 1], [90, 10, 1], [60, 8, 2], [50, 6, 1], [120, 10, 2], [72, 9, 1], [45, 10, 1], [100, 6, 2], [150, 8, 2], [80, 10, 2], [30, 5, 1]], zufall);
  const t1 = B(L, vA), q = B(vS, vA), T = durch(t1, minus(EINS, q)), X = mal(B(vA), T);
  const ungenau = (b) => (b.n === 1 || endlich(b.n) ? zTex(b) : `${bTex(b)} \\approx ${dk(wert(b), 1)}`);
  return fertig({
    art: "reihe", stufe: s, kontext: "achilles", L, vA, vS,
    text: `Achilles läuft ${vA} m/s, eine Schildkröte ${vS} m/s; sie startet ${L} m vor ihm. Zenons Etappen: Achilles läuft bis zum Startpunkt der Schildkröte, dann bis zu dem Punkt, an dem sie inzwischen war, und so weiter. Summiere die Etappenzeiten: Nach welcher Zeit T und nach welcher Strecke x holt er sie ein? (Auf eine Nachkommastelle.)`,
    felder: [
      FELD("T", "T", T, "gerundet", { einheit: "s", tol: 0.051, stellen: 1, name: "T" }),
      FELD("x", "x", X, "gerundet", { einheit: "m", tol: 0.051, stellen: 1, name: "x" }),
    ],
    weg: [
      `t_1 = ${mitWert(`\\frac{${L}}{${vA}}`, zTex(t1))} \\text{ s}, \\quad q = ${mitWert(`\\frac{${vS}}{${vA}}`, bTex(q))}`,
      `T = ${zTex(t1)} + ${zTex(mal(t1, q))} + \\ldots = \\frac{${zTex(t1)}}{1 − ${bTex(q)}} = \\frac{${zTex(t1)}}{${bTex(minus(EINS, q))}} = ${ungenau(T)} \\text{ s}`,
      `x = ${vA} \\cdot ${zTex(T)} = ${ungenau(X)} \\text{ m}`,
    ],
    fallen: [
      { k: "T", wert: t1, text: "Das ist nur die erste Etappe. Danach kommen unendlich viele, immer kürzere Etappen dazu – summiere sie." },
      { k: "T", wert: durch(t1, plus(EINS, q)), text: "Im Nenner steht 1 − q: T = t₁ : (1 − q)." },
      { k: "T", wert: B(L, vA + vS), text: "Die beiden laufen in dieselbe Richtung – Achilles holt nur mit dem Unterschied der Geschwindigkeiten auf." },
      { k: "x", wert: B(L), text: "Am Startpunkt der Schildkröte ist er noch nicht fertig – sie ist inzwischen weitergelaufen. x = Geschwindigkeit · T." },
      { k: "x", wert: mal(B(vS), T), text: "Das ist der Weg der Schildkröte ab ihrem Start. Gesucht ist der Weg von Achilles: x = vₐ · T." },
    ],
    hilfe: { T: "Die erste Etappe dauert t₁ = Vorsprung : Geschwindigkeit von Achilles, jede weitere den q-ten Teil der vorigen mit q = Tempo der Schildkröte : Tempo von Achilles.", x: "x = Geschwindigkeit von Achilles · T." },
  });
}

/* ---------- Schnittstelle der Übungen ---------- */
export function aufgabe(art, stufe, zufall = zz) {
  const s = stufeIn(stufe);
  if (art === "rekursiv") return rekursiv(s, zufall);
  if (art === "summe") return summe(s, zufall);
  if (art === "grenzwert") return grenzwert(s, zufall);
  return reihe(s, zufall);
}
export const felder = (a) => a.felder;
export const auftrag = (a) => a.text;
export const rechenweg = (a) => a.weg;

/* Feld prüfen: { ok, l (gelesene Eingabe) } */
export function feldPruefen(f, eingabe) {
  const l = lies(eingabe);
  if (!l) return { ok: false, l: null };
  if (f.typ === "gerundet") return { ok: gleich(l.b, f.soll) || nahDran(f, l.b), l };
  if (f.typ === "gekuerzt") return { ok: gleich(l.b, f.soll) && (l.art === "ganz" || (l.art === "bruch" && ggT(l.zr, l.nr) === 1)), l };
  return { ok: gleich(l.b, f.soll), l };
}

export function pruefe(a, eingabe = {}) {
  const ergebnis = {}, gelesen = {};
  for (const f of a.felder) {
    const r = feldPruefen(f, eingabe[f.k]);
    ergebnis[f.k] = r.ok; gelesen[f.k] = r.l;
  }
  const ok = Object.values(ergebnis).every(Boolean);
  return { ok, felder: ergebnis, grund: ok ? "" : grundFuer(a, eingabe, gelesen, ergebnis) };
}

/* gezielte Rückmeldung zum ersten falschen Feld */
function grundFuer(a, eingabe, gelesen, erg) {
  const f = a.felder.find((x) => !erg[x.k]);
  if (!f) return "";
  const roh = String(eingabe[f.k] ?? "").trim(), l = gelesen[f.k];
  if (!roh) return "Fülle zuerst alle Felder aus.";
  if (!l) return f.typ === "ganz" ? "Gib eine ganze Zahl ein, zum Beispiel 12." : "Gib eine Zahl ein: ganze Zahl, Dezimalzahl mit Komma oder Bruch wie 3/4.";
  if (f.typ === "ganz" && l.b.n !== 1) return "Hier ist eine ganze Zahl gesucht – ein Index oder eine Anzahl.";
  if (f.typ === "gekuerzt" && gleich(l.b, f.soll)) {
    if (l.art === "dezimal") return "Gesucht ist ein Bruch wie 3/11, keine Dezimalzahl.";
    return `Der Wert stimmt, aber der Bruch ist noch nicht vollständig gekürzt: Teile Zähler und Nenner durch ${ggT(l.zr, l.nr)}.`;
  }
  if (f.typ !== "gerundet" && l.art === "dezimal" && Math.abs(wert(l.b) - wert(f.soll)) < Math.max(0.01, Math.abs(wert(f.soll)) * 0.002))
    return "Fast – aber gerundet. Gib den Wert exakt an, als Bruch wie 3/4.";
  /* gerundete Felder: eine Falle trifft auch, wenn die Eingabe ihr gerundet gleicht (9,1 für 100/11) */
  const trifftFalle = (x) => gleich(x.wert, l.b) || (f.typ === "gerundet" && Math.abs(wert(x.wert) - wert(l.b)) <= (f.tol ?? 0.011));
  const falle = (a.fallen || []).find((x) => x.k === f.k && trifftFalle(x));
  if (falle) return falle.text;
  if (f.typ === "gekuerzt" && l.art === "dezimal") return "Gesucht ist ein Bruch wie 3/11, keine Dezimalzahl.";
  return (a.hilfe && a.hilfe[f.k]) || tipp(a);
}

export function tipp(a) {
  if (a.art === "rekursiv") return a.typ === "arith" ? "Arithmetisch: aₙ = a₁ + (n − 1) · d. Bis zum n-ten Glied sind es n − 1 Schritte." : "Geometrisch: aₙ = a₁ · qⁿ⁻¹. Bis zum n-ten Glied wird (n − 1)-mal mit q multipliziert.";
  if (a.art === "summe") return a.q ? "Geometrische Summe: sₙ = a₁ · (1 − qⁿ) : (1 − q), n = Anzahl der Glieder." : "Arithmetische Summe: sₙ = n · (a₁ + aₙ) : 2, n = Anzahl der Glieder (Schritte + 1).";
  if (a.art === "grenzwert") return "Erst g bestimmen, dann |aₙ − g| < ε nach n auflösen. n₀ ist die kleinste ganze Zahl, die die Ungleichung erfüllt.";
  return "Unendliche geometrische Reihe: Für |q| < 1 ist a₁ + a₁q + a₁q² + … = a₁ : (1 − q).";
}

/* ======================================================================
   Herleitung: Zahlen, die die Seite nennt (getestet)
   ====================================================================== */
export const gauss = (n) => (n * (n + 1)) / 2;
export const geoSumme = (a1, q, n) => mal(a1, durch(minus(EINS, hoch(q, n)), minus(EINS, q)));
export const geoReihe = (a1, q) => durch(a1, minus(EINS, q));
/* Achilles: Vorsprung L, Geschwindigkeiten vA > vS → Zeit, Treffpunkt und die ersten Etappenzeiten */
export const achilles = (L, vA, vS) => { const T = B(L, vA - vS); return { T, x: mal(B(vA), T), etappen: [0, 1, 2, 3].map((k) => mal(B(L, vA), hoch(B(vS, vA), k))) }; };
/* springender Ball: Starthöhe h, Rücksprungfaktor q → Gesamtstrecke */
export const ballStrecke = (h, q) => plus(h, mal(B(2), geoReihe(mal(h, q), q)));
/* Zinseszins: Kapital nach n Jahren (exakt) */
export const kapital = (K0, P, n) => mal(B(K0), hoch(B(100 + P, 100), n));
/* Halbieren: 1/2 + 1/4 + … + 1/2ⁿ = 1 − 1/2ⁿ (exakt) */
export const halbSumme = (n) => geoSumme(B(1, 2), B(1, 2), n);
/* harmonische Partialsumme Hₙ = 1 + 1/2 + … + 1/n (Gleitkomma) */
export const harmonisch = (n) => { let h = 0; for (let i = 1; i <= n; i++) h += 1 / i; return h; };
/* Bündel der harmonischen Reihe: 1/(2ᵏ⁻¹ + 1) + … + 1/2ᵏ hat 2ᵏ⁻¹ Glieder, jedes ≥ 1/2ᵏ – zusammen ≥ 1/2 */
export const buendel = (k) => { let s = 0; for (let i = 2 ** (k - 1) + 1; i <= 2 ** k; i++) s += 1 / i; return { von: 2 ** (k - 1) + 1, bis: 2 ** k, anzahl: 2 ** (k - 1), summe: s }; };

/* ---------- GFS: Gliederung, Tipps, Kolloquium ---------- */
export const GLIEDERUNG = [
  { min: 3, titel: "Einstieg: Halbieren ohne Ende", text: "Reiß vor der Klasse ein Blatt in zwei Hälften, leg eine Hälfte hin, reiß den Rest wieder durch, leg wieder eine Hälfte daneben – und so weiter. Frage an die Klasse: Wie viel Papier liegt auf dem Tisch, wenn man das unendlich lange macht? Daraus wird deine Leitfrage." },
  { min: 3, titel: "Folgen: explizit und rekursiv", text: "Dieselbe Folge zweimal an die Tafel: aₙ\u00A0=\u00A02n\u00A0+\u00A01 und a₁\u00A0=\u00A03 mit aₙ₊₁\u00A0=\u00A0aₙ\u00A0+\u00A02. Dann arithmetische und geometrische Folgen mit ihren expliziten Formeln, Zinseszins als Beispiel aus dem Alltag, kurz: monoton und beschränkt." },
  { min: 4, titel: "Der Grenzwert mit dem ε-Schlauch", text: "Punkte der Folge (n + 1)/n zeichnen, einen Schlauch um 1 legen und ε verkleinern. Die Definition in Worten und an einem Beispiel rechnen: Für 1/n und ε = 0,01 liegen alle Glieder ab n = 101 im Schlauch. Ein Satz zur Ableitung als Grenzwert." },
  { min: 4, titel: "Summen und die geometrische Reihe", text: "Gauß-Trick (vorwärts und rückwärts) und der Trick mit q · s für die geometrische Summe. Dann n gegen unendlich: a₁/(1 − q). Antwort auf die Leitfrage mit 1/2 + 1/4 + 1/8 + … = 1, dazu 0,999… = 1 und Achilles." },
  { min: 3, titel: "Grenzen und Fazit", text: "Die harmonische Reihe: Die Glieder gehen gegen 0, die Summe trotzdem über jede Grenze – Beweis durch Bündeln an der Tafel. Fazit in einem Satz: Unendlich viele Summanden können eine endliche Summe haben, wenn sie schnell genug kleiner werden." },
];

export const TIPPS = [
  "Das halbierte Blatt oder ein Quadrat, das du an der Tafel immer weiter halbierst, ist dein stärkstes Bild. Komm am Schluss darauf zurück – dann schließt sich der Kreis zur Leitfrage.",
  "Rechne den ε-Schlauch einmal komplett mit konkreten Zahlen vor, zum Beispiel ε = 0,01. Die Definition allein bleibt abstrakt, das Beispiel bleibt hängen.",
  "Aufs Handout gehören: die expliziten Formeln der arithmetischen und geometrischen Folge, die Definition des Grenzwerts, beide Summenformeln mit Beweisidee, a₁/(1 − q) für |q| < 1 und der Bündel-Beweis der harmonischen Reihe.",
];

export const KOLLOQUIUM = [
  { stufe: "Basis", frage: "Was ist der Unterschied zwischen einer expliziten und einer rekursiven Darstellung?",
    antwort: "Explizit heißt: Man kann jedes Glied direkt aus n ausrechnen, zum Beispiel aₙ = 2n + 1, also a₁₀₀ = 201. Rekursiv heißt: Man kennt den Anfang und die Regel, wie ein Glied aus dem vorigen entsteht, zum Beispiel a₁ = 3 und aₙ₊₁ = aₙ + 2. Für a₁₀₀ müsste man rekursiv 99 Schritte gehen – deshalb sucht man gern die explizite Formel." },
  { stufe: "Basis", frage: "Woran erkennt man eine arithmetische und eine geometrische Folge?",
    antwort: "Bei einer arithmetischen Folge ist die Differenz aufeinanderfolgender Glieder immer gleich, bei einer geometrischen Folge der Quotient. 3, 7, 11, 15 ist arithmetisch mit d = 4, die Folge 3, 6, 12, 24 ist geometrisch mit q = 2." },
  { stufe: "Basis", frage: "Was bedeutet es, dass eine Folge den Grenzwert g hat?",
    antwort: "Egal wie schmal man den Schlauch um g macht: Ab einer bestimmten Stelle liegen alle Glieder darin, also |aₙ − g| < ε für alle n ≥ n₀. Bei aₙ = 1/n und ε = 0,01 ist das ab n = 101 so. Ausreißer am Anfang stören nicht – es zählt nur, was ab einer Stelle passiert." },
  { stufe: "Basis", frage: "Warum ist 0,999… genau 1 und nicht ein kleines bisschen weniger?",
    antwort: "0,999… ist die unendliche geometrische Reihe 9/10 + 9/100 + … mit a₁ = 9/10 und q = 1/10. Ihr Wert ist (9/10) : (1 − 1/10) = 1. Anders gesagt: Ein Abstand zwischen 0,999… und 1 müsste kleiner sein als jede positive Zahl – also ist er 0." },
  { stufe: "Vertiefung", frage: "Wie beweist man die Summenformel 1 + 2 + … + n = n(n + 1)/2?",
    antwort: "Man schreibt die Summe einmal vorwärts und einmal rückwärts untereinander. Jedes Paar übereinander ergibt n + 1, und es gibt n solche Paare. Die doppelte Summe ist also n(n + 1), die Summe selbst n(n + 1)/2. Für 1 bis 100 sind das 5050." },
  { stufe: "Vertiefung", frage: "Warum gilt die Formel a₁/(1 − q) nur für |q| < 1?",
    antwort: "Sie entsteht aus sₙ = a₁(1 − qⁿ)/(1 − q), wenn qⁿ gegen 0 geht – und das passiert nur für |q| < 1. Für q = 2 wachsen die Glieder, die Summe wird unendlich groß; die Formel würde trotzdem a₁/(1 − 2) = −a₁ liefern, also Unsinn. Für q = −1 springt die Teilsumme zwischen a₁ und 0 hin und her und hat keinen Grenzwert." },
  { stufe: "Vertiefung", frage: "Wie löst man das Paradoxon von Achilles und der Schildkröte auf?",
    antwort: "Zenon zählt unendlich viele Etappen und schließt, dass Achilles nie ankommt. Bei 100 m Vorsprung, 10 m/s und 1 m/s dauern die Etappen 10 s, 1 s, 0,1 s und so weiter – eine geometrische Reihe mit q = 0,1. Ihre Summe ist endlich: 100/9 s, etwa 11,1 s. Unendlich viele Schritte können zusammen eine endliche Zeit dauern." },
  { stufe: "Vertiefung", frage: "Reicht es, dass die Glieder gegen 0 gehen, damit die Summe endlich ist?",
    antwort: "Nein. Bei der harmonischen Reihe 1 + 1/2 + 1/3 + … gehen die Glieder gegen 0, aber man kann sie in Bündel teilen, die jeweils mindestens 1/2 ergeben: 1/3 + 1/4, dann 1/5 bis 1/8 und so weiter. Unendlich viele solche Bündel ergeben eine unendlich große Summe. Notwendig ist die Bedingung trotzdem: Gehen die Glieder nicht gegen 0, kann die Summe nicht endlich sein." },
  { stufe: "Profi", frage: "Kann eine Folge zwei verschiedene Grenzwerte haben?",
    antwort: "Nein. Wären g und h zwei verschiedene Grenzwerte, wähle ε als halben Abstand der beiden. Dann überlappen sich die Schläuche um g und um h nicht. Ab einer Stelle müssten aber alle Glieder in beiden Schläuchen zugleich liegen – das ist unmöglich." },
  { stufe: "Profi", frage: "Ist jede beschränkte Folge konvergent?",
    antwort: "Nein: (−1)ⁿ ist beschränkt, springt aber immer zwischen −1 und 1 und hat keinen Grenzwert. Es gilt aber: Eine Folge, die beschränkt und monoton ist, konvergiert – zum Beispiel (n + 1)/n, die fällt und nie unter 1 sinkt. Umgekehrt ist jede konvergente Folge beschränkt." },
  { stufe: "Profi", frage: "Was hat das alles mit der Ableitung zu tun?",
    antwort: "Die Ableitung ist selbst ein Grenzwert: f′(x₀) ist der Grenzwert der Differenzenquotienten (f(x₀ + h) − f(x₀))/h für h gegen 0. Setzt man h = 1/n ein, entsteht eine Folge von Sekantensteigungen, und die Tangentensteigung ist ihr Grenzwert. Ohne Grenzwerte gäbe es keine Differenzialrechnung." },
  { stufe: "Profi", frage: "Prallt der Ball unendlich oft auf – und dauert das dann unendlich lange?",
    antwort: "Im Modell prallt er unendlich oft auf, aber nicht unendlich lange. Die Dauer eines Sprungs wächst nur mit der Wurzel aus der Höhe. Springt der Ball zum Beispiel jedes Mal auf 60 % zurück, schrumpfen die Sprungzeiten jedes Mal mit dem Faktor Wurzel aus 0,6, also etwa 0,77 – wieder eine geometrische Reihe mit |q| < 1, die Gesamtzeit ist endlich. In Wirklichkeit kommt der Ball schon nach endlich vielen Sprüngen zur Ruhe, weil das Modell kleine Verluste und Verformungen nicht genau beschreibt." },
];
