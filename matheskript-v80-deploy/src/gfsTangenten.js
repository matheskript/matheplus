/* ============================================================
   GFS-Trainer · Tangentenprobleme
   (Kursstufe 1, Kap. I Grundlagen der Differenzialrechnung)
   Reine Logik ohne React:
     · Brüche und Polynome exakt (Berührstellen, Steigungen, Achsenabschnitte)
     · Tangenten durch einen Punkt P(a | b) an die Normalparabel und an x³ + px:
       Anzahl exakt über die Diskriminante bzw. die Vorzeichen von g(0) und g(a),
       Berührstellen exakt (Doppelfälle) oder per Intervallhalbierung
     · vier Übungsgeneratoren mit Prüfung, gezielter Rückmeldung, Tipp und Rechenweg
     · Gliederung, Tipps und Kolloquium für den Vortrag
   Getestet in tests/gfsTangenten.test.mjs. Aufgaben, Zahlen und Formulierungen
   sind eigene – nichts stammt aus einem Schulbuch.
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
const wahl = (liste, zufall) => liste[zufall(0, liste.length - 1)];
const stufeIn = (s) => Math.max(1, Math.min(5, Math.round(s || 1)));

/* ---------- Brüche (immer gekürzt, Nenner positiv) ---------- */
export const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
export function Q(z, n = 1) {
  if (typeof z === "object") return z;
  if (!Number.isInteger(z) || !Number.isInteger(n) || n === 0) throw new Error(`kein Bruch: ${z}/${n}`);
  if (n < 0) { z = -z; n = -n; }
  const g = ggT(z, n);
  return { z: z / g + 0, n: n / g };
}
const q = (x) => (typeof x === "number" ? Q(x) : x);
export const plus = (a, b) => { a = q(a); b = q(b); return Q(a.z * b.n + b.z * a.n, a.n * b.n); };
export const minus = (a, b) => { a = q(a); b = q(b); return Q(a.z * b.n - b.z * a.n, a.n * b.n); };
export const mal = (a, b) => { a = q(a); b = q(b); return Q(a.z * b.z, a.n * b.n); };
export const durch = (a, b) => { a = q(a); b = q(b); return Q(a.z * b.n, a.n * b.z); };
export const neg = (a) => { a = q(a); return Q(-a.z, a.n); };
export const betrag = (a) => { a = q(a); return Q(Math.abs(a.z), a.n); };
export const wert = (a) => { a = q(a); return a.z / a.n; };
export const gleich = (a, b) => { a = q(a); b = q(b); return a.z * b.n === b.z * a.n; };
export const istNull = (a) => q(a).z === 0;
const quadrat = (a) => mal(a, a);

/* TeX: „−\frac{3}{2}“, „4“ – Minus als U+2212 */
export function qTex(a) {
  a = q(a);
  const s = a.z < 0 ? "−" : "";
  return a.n === 1 ? `${s}${Math.abs(a.z)}` : `${s}\\frac{${Math.abs(a.z)}}{${a.n}}`;
}
/* Eingabe, wie sie ein Schüler tippt: „-3/2“ */
export const qEin = (a) => { a = q(a); return `${a.z < 0 ? "-" : ""}${Math.abs(a.z)}${a.n === 1 ? "" : `/${a.n}`}`; };
/* Zahl mit Komma, ohne überflüssige Nullen: 1,5 · −0,25 */
export const rund = (x, n = 3) => Math.round(x * 10 ** n) / 10 ** n;
export const dk = (x, n = 3) => { const r = rund(x, n); return String(Object.is(r, -0) ? 0 : r).replace("-", "−").replace(".", ","); };
/* Koordinate für Punkte im Text: Halbe als Dezimalzahl (P(0,5 | −1,5)), sonst Bruch */
export const koordTex = (a) => { a = q(a); return [1, 2, 4, 5, 10].includes(a.n) ? dk(wert(a)) : qTex(a); };

/* ---------- Polynome (Koeffizienten nach Potenzen: k[0] + k[1]x + k[2]x² + …) ---------- */
export function polyTex(p, v = "x") {
  let s = "";
  for (let k = p.length - 1; k >= 0; k--) {
    const c = q(p[k] ?? 0);
    if (c.z === 0) continue;
    const b = betrag(c);
    const koeff = k > 0 && b.z === 1 && b.n === 1 ? "" : qTex(b);
    const variable = k === 0 ? "" : k === 1 ? v : `${v}^${k}`;
    if (s === "") s = (c.z < 0 ? "−" : "") + koeff + variable;
    else s += (c.z < 0 ? " − " : " + ") + koeff + variable;
  }
  return s || "0";
}
/* Gerade y = mx + c als TeX (A5: kein 1x, kein + 0, kein + −) */
export const geradeTex = (m, c) => polyTex([q(c), q(m)]);
/* Polynom mit Dezimalzahlen (Labor): [0,5, 0, −3, 2] → „2u^3 − 3u^2 + 0,5“ */
export function polyDez(k, v = "u") {
  let s = "";
  for (let i = k.length - 1; i >= 0; i--) {
    const c = rund(k[i] ?? 0, 3);
    if (c === 0) continue;
    const b = Math.abs(c);
    const koeff = i > 0 && b === 1 ? "" : dk(b);
    const variable = i === 0 ? "" : i === 1 ? v : `${v}^${i}`;
    if (s === "") s = (c < 0 ? "−" : "") + koeff + variable;
    else s += (c < 0 ? " − " : " + ") + koeff + variable;
  }
  return s || "0";
}
/* Summe zweier Brüche als Ausdruck: „4 + 3“, „4 − 3“; Nullen fallen weg */
function summeTex(x, y) {
  x = q(x); y = q(y);
  if (istNull(x)) return qTex(y);
  if (istNull(y)) return qTex(x);
  return `${qTex(x)} ${y.z < 0 ? "−" : "+"} ${qTex(betrag(y))}`;
}

/* Funktionen: Polynom { typ: "poly", k } oder Hyperbel a/x { typ: "hyp", a } */
export const poly = (...k) => ({ typ: "poly", k: k.map(q) });
export const hyp = (a) => ({ typ: "hyp", a });
export function fWert(f, x) {
  x = q(x);
  if (f.typ === "hyp") return durch(Q(f.a), x);
  let s = Q(0), pot = Q(1);
  for (const c of f.k) { s = plus(s, mal(c, pot)); pot = mal(pot, x); }
  return s;
}
export const fAbleitung = (f) => (f.typ === "hyp" ? null : { typ: "poly", k: f.k.slice(1).map((c, i) => mal(c, i + 1)) });
export const fSteigung = (f, x) => (f.typ === "hyp" ? neg(durch(Q(f.a), quadrat(q(x)))) : fWert(fAbleitung(f), x));
export const fTex = (f) => (f.typ === "hyp" ? `${f.a < 0 ? "−" : ""}\\frac{${Math.abs(f.a)}}{x}` : polyTex(f.k));
export const fAblTex = (f) => (f.typ === "hyp" ? `${f.a > 0 ? "−" : ""}\\frac{${Math.abs(f.a)}}{x^2}` : polyTex(fAbleitung(f).k));

/* Punkt-Steigungs-Form mit Zahlen: m(x − u) + f(u), z. B. „−2(x + 1) + 1“ */
export function psfTex(m, u, fu) {
  m = q(m); u = q(u); fu = q(fu);
  if (istNull(m)) return qTex(fu);
  let s;
  if (istNull(u)) s = polyTex([0, m]);
  else {
    const vor = gleich(m, 1) ? "" : gleich(m, -1) ? "−" : qTex(m);
    s = `${vor}(x ${u.z > 0 ? "−" : "+"} ${qTex(betrag(u))})`;
  }
  if (!istNull(fu)) s += fu.z > 0 ? ` + ${qTex(fu)}` : ` − ${qTex(betrag(fu))}`;
  return s;
}
/* „t(x) = 2(x − 1) + 3 = 2x + 1“ – die Zwischenform nur, wenn sie anders aussieht */
const ausmultipliziert = (name, m, u, fu) => {
  const c = minus(fu, mal(m, u));
  const a = psfTex(m, u, fu), e = geradeTex(m, c);
  return a === e ? `${name} = ${e}` : `${name} = ${a} = ${e}`;
};

/* ======================================================================
   Die Mathematik für Labor, Animationen und Herleitung
   ====================================================================== */
const EPS = 1e-9;
const sortiert = (l) => [...l].sort((x, y) => x - y);
function bisektion(g, l, r) {
  let gl = g(l);
  if (Math.abs(gl) < 1e-14) return l;
  for (let i = 0; i < 200 && r - l > 1e-13; i++) {
    const m = (l + r) / 2, gm = g(m);
    if (gm === 0) return m;
    if ((gm > 0) === (gl > 0)) { l = m; gl = gm; } else r = m;
  }
  return (l + r) / 2;
}

/* Normalparabel f(x) = x², P(a | b): u² − 2au + b = 0, D = a² − b */
export const anzahlParabel = (a, b) => { const D = a * a - b; return Math.abs(D) < EPS ? 1 : D > 0 ? 2 : 0; };
export function parabelStellen(a, b) {
  const n = anzahlParabel(a, b);
  if (n === 0) return [];
  if (n === 1) return [a];
  const w = Math.sqrt(a * a - b);
  return [a - w, a + w];
}

/* f(x) = x³ + px, P(a | b): Tangente in u durch P ⇔ g(u) = 2u³ − 3au² + c = 0 mit c = b − pa.
   g′(u) = 6u(u − a): Extremstellen 0 und a mit g(0) = c (= b minus Wendetangente bei a), g(a) = c − a³ (= b − f(a)).
   a = 0: g streng monoton → 1. Sonst: g(0) · g(a) < 0 → 3, eines davon 0 → 2 (doppelte Nullstelle), sonst 1. */
export function anzahlKubisch(p, a, b) {
  if (Math.abs(a) < EPS) return 1;
  const c = b - p * a, g0 = c, ga = c - a ** 3;
  if (Math.abs(g0) < EPS || Math.abs(ga) < EPS) return 2;
  return g0 * ga < 0 ? 3 : 1;
}
export function kubikStellen(p, a, b) {
  const n = anzahlKubisch(p, a, b);
  const c = b - p * a;
  if (n === 2) return Math.abs(c) < EPS ? sortiert([0, 1.5 * a]) : sortiert([a, -a / 2]);
  const g = (u) => 2 * u ** 3 - 3 * a * u * u + c;
  const R = 1 + Math.max(1.5 * Math.abs(a), Math.abs(c) / 2);      // Cauchy-Schranke: alle Nullstellen in (−R, R)
  const lo = Math.min(0, a), hi = Math.max(0, a);
  const teile = n === 3 ? [[-R, lo], [lo, hi], [hi, R]] : [[-R, R]];
  return teile.map(([l, r]) => bisektion(g, l, r));
}

/* Die beiden Kurven des Labors (dieselben wie in Herleitung und Animationen) */
export const KURVEN = {
  parabel: { id: "parabel", name: "Normalparabel", tex: "f(x) = x^2", f: (x) => x * x, f1: (x) => 2 * x, start: [0.5, -2] },
  kubisch: { id: "kubisch", name: "Kubisch", tex: "f(x) = x^3 − 3x", p: -3, f: (x) => x ** 3 - 3 * x, f1: (x) => 3 * x * x - 3,
    wende: (x) => -3 * x, start: [1, -2.5] },
};
/* Gleichung für die Berührstelle im Labor: Parabel u² − 2au + b = 0, kubisch g(u) = 2u³ − 3au² + (b + 3a) = 0 */
export const laborKoeffizienten = (id, a, b) => (id === "parabel" ? [b, -2 * a, 1] : [b + 3 * a, 0, -3 * a, 2]);
export const anzahlTangenten = (id, a, b) => (id === "parabel" ? anzahlParabel(a, b) : anzahlKubisch(KURVEN.kubisch.p, a, b));
export const beruehrstellen = (id, a, b) => (id === "parabel" ? parabelStellen(a, b) : kubikStellen(KURVEN.kubisch.p, a, b));
export function tangenteIn(id, u) {
  const K = KURVEN[id];
  const m = K.f1(u), y = K.f(u);
  return { u, y, m, c: y - m * u };
}
/* Gerade als Text für das Labor: „y = −2x − 1“, gerundet mit „≈“ */
export function geradeText(m, c, n = 2) {
  const genau = Math.abs(rund(m, n) - m) < 1e-9 && Math.abs(rund(c, n) - c) < 1e-9;
  const mm = rund(m, n), cc = rund(c, n);
  let s = mm === 0 ? "" : mm === 1 ? "x" : mm === -1 ? "−x" : `${dk(mm, n)}x`;
  if (cc !== 0 || s === "") s += s === "" ? dk(cc, n) : cc > 0 ? ` + ${dk(cc, n)}` : ` − ${dk(-cc, n)}`;
  return { text: `y ${genau ? "=" : "≈"} ${s}`, genau };
}

/* Hügel der Anwendung: f(x) = 4 − ¼x² auf [−4; 4], Hütte bei B(5 | 0), Drohne über x = −4.
   Tangente in u durch B ⇔ u² − 10u + 16 = 0 ⇔ u = 2 (u = 8 liegt außerhalb des Hügels).
   Sichtgrenze t(x) = −x + 5, über x = −4 also in der Höhe 9. */
export const HUEGEL = { f: (x) => 4 - (x * x) / 4, f1: (x) => -x / 2, rand: 4, B: [5, 0], u: 2, drohneX: -4, grenze: 9 };
export const huegelTangente = (x) => -x + 5;
/* Erster Punkt, an dem die Sichtlinie von der Drohne (−4 | h) zur Hütte den Hügel trifft (null: freie Sicht).
   Schnitt mit 4 − ¼x²: 9x² − 4hx + 20h − 144 = 0 */
export function sichtHindernis(h) {
  const D = 16 * h * h - 36 * (20 * h - 144);
  if (D <= 1e-9) return null;
  const x = (4 * h - Math.sqrt(D)) / 18;
  return x >= -HUEGEL.rand && x <= HUEGEL.rand ? [x, HUEGEL.f(x)] : null;
}
/* Gemeinsame Tangenten der Herleitung: f(x) = x², g(x) = −x² + 2x − 5 → y = −2x − 1 und y = 4x − 4 */
export const GEMEINSAM = { f: (x) => x * x, g: (x) => -x * x + 2 * x - 5, u: [-1, 2], v: [2, -1], t: [[-2, -1], [4, -4]] };

/* ======================================================================
   Übungen
   ====================================================================== */
export const ARTEN = [
  { id: "tangente", name: "Tangente in einem Punkt" },
  { id: "normale", name: "Normale in einem Punkt" },
  { id: "aussen", name: "Tangenten von außen" },
  { id: "anzahl", name: "Anzahl · gemeinsame Tangente" },
];

const feld = (k, vor, nach, modus, aria) => ({ k, vor, nach, modus, aria });
const zeileGerade = (name, i = "") => [
  feld(`m${i}`, `${name}(x) =`, "x +", "bruch",`Steigung von ${name.replace(/_(\d)/, "$1")}`),
  feld(`c${i}`, "", "", "bruch", `Achsenabschnitt von ${name.replace(/_(\d)/, "$1")}`),
];
const ok = (x, max = 40) => Math.abs(wert(x)) <= max;

/* Kurven je Stufe für Tangente und Normale */
function kurveTN(s, z) {
  if (s === 1) return poly(z(-4, 4), 0, wahl([1, -1, 2], z));
  if (s === 2) return poly(z(-5, 5), wahl([-4, -3, -2, -1, 1, 2, 3, 4], z), wahl([1, -1, 2, -2], z));
  if (s === 3) return poly(z(-3, 3), z(-4, 4), 0, wahl([1, -1], z));
  if (s === 4) return poly(z(-3, 3), z(-3, 3), wahl([-3, -2, -1, 1, 2, 3], z), wahl([Q(1, 2), Q(-1, 2), 1, 2], z));
  return z(0, 1) ? hyp(wahl([-6, -4, -3, -2, -1, 1, 2, 3, 4, 6], z)) : poly(z(-3, 3), 0, wahl([-2, -1, 1, 2], z), 0, Q(1, 4));
}
function stelleTN(s, f, z) {
  if (f.typ === "hyp") return wahl([-3, -2, -1, 1, 2, 3], z);
  if (s === 1) return wahl([-3, -2, -1, 1, 2, 3], z);
  if (s === 2) return z(-3, 3);
  return wahl([-2, -1, 1, 2], z);
}

/* Parabel f(x) = kx² + px + q, deren Tangenten von P bei u1 und u2 berühren:
   u1 + u2 = 2a und k·u1·u2 = b − pa − q */
function aussenAufgabe(s, z) {
  for (let v = 0; v < 80; v++) {
    let k = Q(1), p = Q(0), qq = Q(0), u1, u2;
    if (s === 1) { const c = z(1, 3); u1 = -c; u2 = c; }
    else {
      const d = s === 5 ? wahl([1, 3, 5], z) : wahl([2, 4, 6], z);
      u1 = z(-4, 4 - d); u2 = u1 + d;
      if (s >= 3) { p = Q(wahl([-4, -3, -2, -1, 1, 2, 3, 4], z)); qq = Q(z(-3, 3)); }
      if (s === 4) k = q(wahl([-1, 2, Q(1, 2), Q(-1, 2)], z));
      if (s === 5) k = Q(wahl([1, -1, 2], z));
    }
    const f = poly(qq, p, k);
    const a = Q(u1 + u2, 2);
    const b = plus(plus(mal(k, u1 * u2), mal(p, a)), qq);
    if (!ok(b, 25)) continue;
    const t = [u1, u2].map((u) => { const m = fSteigung(f, u); return { m, c: minus(fWert(f, u), mal(m, u)) }; });
    if (!t.every((x) => ok(x.m) && ok(x.c))) continue;
    const soll = { u1: Q(u1), u2: Q(u2), ...(s >= 2 ? { m1: t[0].m, c1: t[0].c, m2: t[1].m, c2: t[1].c } : {}) };
    const zeilen = [[feld("u1", "u_1 =", "", "ganzvz", "Berührstelle u1"), feld("u2", "u_2 =", "", "ganzvz", "Berührstelle u2")]];
    if (s >= 2) zeilen.push(zeileGerade("t_1", 1), zeileGerade("t_2", 2));
    return { art: "aussen", stufe: s, f, P: { a, b }, k, p, q: qq, soll, zeilen,
      paare: [[["u1"], ["u2"]], ...(s >= 2 ? [[["m1", "c1"], ["m2", "c2"]]] : [])] };
  }
  return aussenAufgabe(1, z);
}

/* Anzahl der Tangenten (Stufe 1–3, Auswahl) und gemeinsame Tangenten (Stufe 4–5) */
function anzahlAufgabe(s, z) {
  if (s <= 2) {
    for (let v = 0; v < 80; v++) {
      const f = s === 1 ? poly(0, 0, 1) : poly(z(-3, 3), z(-3, 3), wahl([1, -1, 2, -2], z));
      const k = f.k[2];
      const a = z(-3, 3), fa = wert(fWert(f, a));
      const kat = z(0, 2), vz = k.z > 0 ? 1 : -1;
      const b = kat === 2 ? fa - vz * z(1, 5) : kat === 1 ? fa : fa + vz * z(1, 4);
      if (Math.abs(b) > 20) continue;
      return { art: "anzahl", stufe: s, kurve: "parabel", f, P: { a: Q(a), b: Q(b) }, optionen: [0, 1, 2, 3], richtig: kat };
    }
  }
  if (s === 3) {
    const p = wahl([-3, 0, 3], z);
    const f = poly(0, p, 0, 1);
    const kat = z(1, 3);
    let a, b;
    if (kat === 3) {
      a = wahl([-2, 2], z);
      const lo = Math.min(p * a, a ** 3 + p * a), hi = Math.max(p * a, a ** 3 + p * a);
      b = z(lo + 1, hi - 1);
    } else if (kat === 2) {
      a = wahl([-2, -1, 1, 2], z);
      b = z(0, 1) ? a ** 3 + p * a : p * a;
    } else if (z(0, 2) === 0) { a = 0; b = z(-4, 4); }
    else {
      a = wahl([-2, -1, 1, 2], z);
      const lo = Math.min(p * a, a ** 3 + p * a), hi = Math.max(p * a, a ** 3 + p * a);
      b = z(0, 1) ? hi + z(1, 3) : lo - z(1, 3);
    }
    return { art: "anzahl", stufe: 3, kurve: "kubisch", p, f, P: { a: Q(a), b: Q(b) }, optionen: [0, 1, 2, 3], richtig: anzahlKubisch(p, a, b) };
  }
  /* gemeinsame Tangenten von f(x) = x² + sx + r und g(x) = −x² + (2S + s)x − (u1² + u2²) + r mit S = u1 + u2 */
  const u1 = z(-3, 2), u2 = z(u1 + 1, 3);
  const sh = s === 5 ? wahl([-3, -2, -1, 1, 2, 3], z) : 0, r = s === 5 ? z(-3, 3) : 0;
  const S = u1 + u2;
  const f = poly(r, sh, 1), g = poly(-(u1 * u1 + u2 * u2) + r, 2 * S + sh, -1);
  const t = [u1, u2].map((u) => ({ m: Q(2 * u + sh), c: Q(-u * u + r) }));
  return { art: "anzahl", stufe: s, kurve: "gemeinsam", f, g, u: [u1, u2], v: [S - u1, S - u2], sh, r, S,
    soll: { m1: t[0].m, c1: t[0].c, m2: t[1].m, c2: t[1].c }, zeilen: [zeileGerade("t_1", 1), zeileGerade("t_2", 2)],
    paare: [[["m1", "c1"], ["m2", "c2"]]] };
}

export function aufgabe(art, stufe, zufall = zz) {
  const s = stufeIn(stufe), z = zufall;
  let a;
  if (art === "tangente" || (art === "normale" && s <= 4)) {
    for (let v = 0; v < 120 && !a; v++) {
      const f = kurveTN(s, z), u = Q(stelleTN(s, f, z));
      const fu = fWert(f, u), ft = fSteigung(f, u);
      if (art === "normale" && (istNull(ft) || !ok(ft, 6))) continue;
      const m = art === "tangente" ? ft : neg(durch(1, ft));
      const c = minus(fu, mal(m, u));
      if (!ok(m) || !ok(c) || !ok(fu) || m.n > 12 || c.n > 12) continue;
      a = { art, stufe: s, f, u, fu, ft, soll: { m, c }, zeilen: [zeileGerade(art === "tangente" ? "t" : "n")] };
    }
  } else if (art === "normale") {
    /* Stufe 5: Tangente, Normale und x-Achse bilden ein Dreieck */
    for (let v = 0; v < 200 && !a; v++) {
      const f = poly(z(-4, 4), wahl([-3, -2, -1, 1, 2, 3], z), wahl([1, -1, 2, -2, Q(1, 2)], z));
      const u = Q(z(-3, 3));
      const fu = fWert(f, u), ft = fSteigung(f, u);
      if (istNull(fu) || istNull(ft) || !ok(fu, 4) || !ok(ft, 4)) continue;
      const xt = minus(u, durch(fu, ft)), xn = plus(u, mal(fu, ft));
      const A = mal(Q(1, 2), mal(betrag(minus(xn, xt)), betrag(fu)));
      if (!ok(A, 60) || A.n > 12 || xt.n > 6 || xn.n > 6) continue;
      a = { art, stufe: 5, dreieck: true, f, u, fu, ft, soll: { xt, xn, A },
        zeilen: [[feld("xt", "x_T =", "", "bruch", "Nullstelle der Tangente"), feld("xn", "x_N =", "", "bruch", "Nullstelle der Normale")], [feld("A", "A =", "", "bruch", "Flächeninhalt")]] };
    }
  } else if (art === "aussen") a = aussenAufgabe(s, z);
  else a = anzahlAufgabe(s, z);
  if (a.soll) a.loesung = Object.fromEntries(Object.entries(a.soll).map(([k, x]) => [k, qEin(x)]));
  else a.loesung = { wahl: a.richtig };
  return a;
}

/* Aufgabentext mit $…$-Formeln */
export function auftrag(a) {
  const f = `$f(x) = ${fTex(a.f)}$`;
  const P = a.P ? `$P(${koordTex(a.P.a)} \\mid ${koordTex(a.P.b)})$` : "";
  if (a.art === "tangente") return `Bestimme die Gleichung der Tangente an den Graphen von ${f} an der Stelle $u = ${qTex(a.u)}$.`;
  if (a.art === "normale" && a.dreieck) return `Tangente und Normale an den Graphen von ${f} an der Stelle $u = ${qTex(a.u)}$ schneiden die x-Achse bei $x_T$ und $x_N$. Berechne beide Stellen und den Flächeninhalt $A$ des Dreiecks aus Tangente, Normale und x-Achse.`;
  if (a.art === "normale") return `Bestimme die Gleichung der Normale an den Graphen von ${f} an der Stelle $u = ${qTex(a.u)}$.`;
  if (a.art === "aussen") return `Vom Punkt ${P} aus werden Tangenten an den Graphen von ${f} gelegt. Bestimme die beiden Berührstellen${a.stufe >= 2 ? " und die Gleichungen der Tangenten" : ""}.`;
  if (a.kurve === "gemeinsam") return `Die Graphen von ${f} und $g(x) = ${fTex(a.g)}$ haben zwei gemeinsame Tangenten. Bestimme ihre Gleichungen.`;
  return `Wie viele Tangenten an den Graphen von ${f} gehen durch den Punkt ${P}?`;
}

/* ---------- Prüfen ---------- */
/* „-3/2“, „1,5“, „−0,33“, „4“ → { wert, q (nur bei Brüchen und ganzen Zahlen), dezimal } */
export function liesZahl(s) {
  const t = String(s ?? "").trim().replace(/\s/g, "").replace(/[−–]/g, "-");
  if (!t) return null;
  const b = /^([+-]?)(\d+)\/(\d+)$/.exec(t);
  if (b) {
    const n = Number(b[3]);
    if (!n) return null;
    const zahl = Number(b[2]) * (b[1] === "-" ? -1 : 1);
    return { wert: zahl / n, q: Q(zahl, n), dezimal: false };
  }
  if (!/^[+-]?(\d+([.,]\d*)?|[.,]\d+)$/.test(t)) return null;
  const w = Number(t.replace(",", "."));
  return /[.,]/.test(t) ? { wert: w, dezimal: true } : { wert: w, q: Q(w), dezimal: false };
}
/* Brüche und ganze Zahlen exakt, Dezimalzahlen auf zwei Stellen gerundet (−1/3 ≈ −0,33) */
export function trifft(ein, soll) {
  if (!ein) return false;
  if (ein.q) return gleich(ein.q, soll);
  const d = Math.abs(ein.wert - wert(soll));
  return d < 1e-9 || d <= 0.0051;
}
const nahe = (ein, x) => !!ein && Math.abs(ein.wert - (typeof x === "number" ? x : wert(x))) < 1e-6;

export function pruefe(a, eingabe) {
  if (a.optionen) {
    const i = Number(eingabe);
    return i === a.richtig ? { ok: true } : { ok: false, grund: mcGrund(a, i) };
  }
  const ein = Object.fromEntries(Object.keys(a.soll).map((k) => [k, liesZahl(eingabe?.[k])]));
  const felder = Object.fromEntries(Object.keys(a.soll).map((k) => [k, trifft(ein[k], a.soll[k])]));
  /* Reihenfolge innerhalb eines Paares ist egal (u1/u2, t1/t2) */
  for (const [g1, g2] of a.paare || []) {
    const gerade = [...g1, ...g2].filter((k) => felder[k]).length;
    const tausch = g1.filter((k, i) => trifft(ein[k], a.soll[g2[i]])).length + g2.filter((k, i) => trifft(ein[k], a.soll[g1[i]])).length;
    if (tausch > gerade) {
      g1.forEach((k, i) => { felder[k] = trifft(ein[k], a.soll[g2[i]]); });
      g2.forEach((k, i) => { felder[k] = trifft(ein[k], a.soll[g1[i]]); });
      g1.forEach((k, i) => { [ein[k], ein[g2[i]]] = [ein[g2[i]], ein[k]]; });
    }
  }
  const alle = Object.values(felder).every(Boolean);
  return { ok: alle, felder, grund: alle ? "" : grundFuer(a, ein, felder) };
}

function mcGrund(a, i) {
  const n = a.richtig;
  if (a.kurve === "kubisch") {
    if (i === 0) return "Eine Gleichung dritten Grades hat immer mindestens eine Lösung – durch jeden Punkt geht mindestens eine Tangente an eine kubische Kurve.";
    if (n === 3) return "Prüfe die Lage von P: Liegt P zwischen der Kurve und der Wendetangente, haben g(0) und g(a) verschiedene Vorzeichen – dann hat g drei Nullstellen.";
    if (n === 2) return "P liegt genau auf der Kurve oder auf der Wendetangente. Dann ist g(a) = 0 oder g(0) = 0, und g hat eine doppelte Nullstelle: zwei verschiedene Berührstellen.";
    return wert(a.P.a) === 0
      ? "P liegt senkrecht über oder unter dem Wendepunkt: g(u) = 2u³ + c ist streng monoton und hat genau eine Nullstelle."
      : "g(0) und g(a) haben dasselbe Vorzeichen. Dann schneidet der Graph von g die u-Achse nur einmal.";
  }
  if (i === 3) return "Bei einer Parabel ist die Gleichung für die Berührstelle quadratisch – mehr als zwei Lösungen gibt es nie.";
  if (n === 2) return i === 0
    ? "P liegt außerhalb der Parabel, nicht auf ihrer Innenseite. Vergleiche b mit f(a) – die Diskriminante ist positiv."
    : "Genau eine Tangente gibt es nur, wenn P auf der Parabel liegt. Setze a in f ein: f(a) ist nicht b.";
  if (n === 1) return "Setze a in f ein: Es kommt genau b heraus. P liegt auf der Parabel, die Diskriminante ist null – nur die Tangente in P geht durch P.";
  return "P liegt auf der Innenseite der Parabel, dort, wo sie sich öffnet. Die Diskriminante ist negativ: Jede Tangente läuft an P vorbei.";
}

function grundFuer(a, ein, fe) {
  if (a.art === "tangente" || (a.art === "normale" && !a.dreieck)) {
    const m = a.soll.m, tang = a.art === "tangente";
    if (!fe.m) {
      if (!ein.m) return "Gib die Steigung als Zahl oder Bruch ein, zum Beispiel -3/2 oder 1,5.";
      if (tang && nahe(ein.m, a.fu) && !gleich(a.fu, m)) return "Das ist der Funktionswert f(u). Die Steigung der Tangente ist die Ableitung an der Stelle u: m = f′(u).";
      if (tang && !istNull(a.ft) && nahe(ein.m, neg(durch(1, a.ft)))) return "Das ist die Steigung der Normale. Die Tangente hat die Steigung f′(u).";
      if (tang) return `Leite f ab und setze u = ${dk(wert(a.u))} ein: Die Steigung der Tangente ist f′(u).`;
      if (nahe(ein.m, a.ft)) return "Das ist die Steigung der Tangente. Die Normale steht senkrecht darauf: Ihre Steigung ist −1/f′(u).";
      if (nahe(ein.m, durch(1, a.ft))) return "Fast: Das Minuszeichen fehlt. Zwei Geraden sind senkrecht, wenn das Produkt ihrer Steigungen −1 ist.";
      if (nahe(ein.m, neg(a.ft))) return "Nur das Vorzeichen zu tauschen reicht nicht – nimm auch den Kehrwert: m = −1/f′(u).";
      return "Berechne zuerst f′(u). Die Normale hat die Steigung −1/f′(u).";
    }
    if (!ein.c) return "Gib den y-Achsenabschnitt als Zahl oder Bruch ein.";
    if (nahe(ein.c, a.fu) && !gleich(a.fu, a.soll.c)) return "Der y-Achsenabschnitt ist nicht f(u). Setze in die Punkt-Steigungs-Form ein und multipliziere aus: m(x − u) + f(u).";
    if (nahe(ein.c, plus(a.fu, mal(m, a.u)))) return "Vorzeichenfehler: In der Klammer steht x − u, beim Ausmultiplizieren wird m · u abgezogen.";
    return `Die Gerade geht durch B(u | f(u)): Aus f(u) = m · u + c folgt c = f(u) − m · u.`;
  }
  if (a.art === "normale") {
    if (!fe.xt) {
      if (nahe(ein.xt, plus(a.u, durch(a.fu, a.ft)))) return "Vorzeichenfehler bei der Tangente: Aus f′(u)(x − u) + f(u) = 0 folgt x = u − f(u)/f′(u).";
      if (nahe(ein.xt, a.soll.xn)) return "Das ist die Nullstelle der Normale. Die Tangente hat die Steigung f′(u), nicht −1/f′(u).";
      return "Setze die Tangente gleich null: f′(u)(x − u) + f(u) = 0, also x_T = u − f(u)/f′(u).";
    }
    if (!fe.xn) {
      if (nahe(ein.xn, minus(a.u, mal(a.fu, a.ft)))) return "Vorzeichenfehler bei der Normale: Aus −(x − u)/f′(u) + f(u) = 0 folgt x = u + f(u) · f′(u).";
      return "Setze die Normale gleich null: −(x − u)/f′(u) + f(u) = 0, also x_N = u + f(u) · f′(u).";
    }
    if (nahe(ein.A, mul2(a.soll.A))) return "Die Dreiecksfläche ist die Hälfte von Grundseite mal Höhe – das ½ fehlt.";
    return "Die Grundseite liegt auf der x-Achse: |x_N − x_T|. Die Höhe ist der Abstand des Berührpunkts zur x-Achse, also |f(u)|. A = ½ · Grundseite · Höhe.";
  }
  if (a.art === "aussen") {
    if (!fe.u1 || !fe.u2) {
      if (!ein.u1 || !ein.u2) return "Gib beide Berührstellen als ganze Zahlen ein.";
      if (nahe(ein.u1, a.P.a) || nahe(ein.u2, a.P.a)) return "P liegt nicht auf der Parabel – die Berührstelle ist nicht a, sondern unbekannt. Setze P in die allgemeine Tangente t(x) = f′(u)(x − u) + f(u) ein und löse nach u auf.";
      if (nahe(ein.u1, neg(a.soll.u1)) || nahe(ein.u2, neg(a.soll.u2)) || nahe(ein.u1, neg(a.soll.u2))) return "Prüfe die Vorzeichen: In der Gleichung steht a − u, nicht u − a. Mach am Ende die Probe – P muss auf jeder Tangente liegen.";
      return "Setze P(a | b) in t(x) = f′(u)(x − u) + f(u) ein: Es entsteht eine quadratische Gleichung für u. Ihre beiden Lösungen sind die Berührstellen.";
    }
    return "Mit der Berührstelle u ist es die gewöhnliche Tangente in B(u | f(u)): Steigung f′(u), Achsenabschnitt f(u) − f′(u) · u. Probe: P muss auf beiden Tangenten liegen.";
  }
  /* gemeinsame Tangente: berührt die eingegebene Gerade wenigstens eine der beiden Kurven? */
  const B = wert(a.g.k[1]), G = wert(a.g.k[0]);
  for (const i of [1, 2]) {
    const m = ein[`m${i}`], c = ein[`c${i}`];
    if (!m || !c || (fe[`m${i}`] && fe[`c${i}`])) continue;
    const aufF = Math.abs(c.wert - (a.r - ((m.wert - a.sh) / 2) ** 2)) < 1e-6;      // x² + sx + r = mx + c doppelt
    const aufG = Math.abs(c.wert - (G + (m.wert - B) ** 2 / 4)) < 1e-6;             // −x² + Bx + G = mx + c doppelt
    if (aufF && !aufG) return `Die Gerade t${i} berührt zwar f, aber nicht g. Eine gemeinsame Tangente muss zu beiden Kurven passen: gleiche Steigung und gleicher y-Achsenabschnitt.`;
    if (aufG && !aufF) return `Die Gerade t${i} berührt zwar g, aber nicht f. Eine gemeinsame Tangente muss zu beiden Kurven passen: gleiche Steigung und gleicher y-Achsenabschnitt.`;
  }
  if (Object.values(ein).some((x) => !x)) return "Gib Steigung und y-Achsenabschnitt beider Tangenten als Zahl oder Bruch ein.";
  return "Tangente an f in u, Tangente an g in v. Gleiche Steigung liefert v in Abhängigkeit von u, gleicher y-Achsenabschnitt dann eine quadratische Gleichung für u.";
}
const mul2 = (x) => mal(x, 2);

/* ---------- Rechenweg (TeX-Zeilen, endet beim Ergebnis) ---------- */
/* rechte Seite einer Tangente mit unbekannter Berührstelle: „(2u − 4)x − u^2 + 3“ */
function geradeU(st, ac) {
  let s = `${/\s[+−]\s/.test(st) ? `(${st})` : st}x`;
  if (ac !== "0") s += ac.startsWith("−") ? ` − ${ac.slice(1)}` : ` + ${ac}`;
  return s;
}
const ausU = (u) => (istNull(u) ? "u" : `u ${u.z > 0 ? "−" : "+"} ${qTex(betrag(u))}`);
/* (u − u1)(u − u2) – mit einer Null als u(u − u2) */
const faktorTex = (u1, u2) => (u1 === 0 ? `u(${ausU(Q(u2))})` : u2 === 0 ? `u(${ausU(Q(u1))})` : `(${ausU(Q(u1))})(${ausU(Q(u2))})`);
const teiler = (k) => (gleich(k, 1) ? "" : ` \\quad | : ${q(k).z < 0 ? `(${qTex(k)})` : qTex(k)}`);
/* Ansatz für f(x) = kx² + px + q und P(a | b): Tangente allgemein, P einsetzen, nach u ordnen, normieren.
   Ergebnis: u² − 2au + C = 0 mit C = (b − pa − q) : k */
function ansatzParabel(f, P) {
  const qq = f.k[0], p = f.k[1], k = f.k[2], { a, b } = P;
  const rest = minus(minus(b, mal(p, a)), qq), C = durch(rest, k);
  const z = [
    `t(x) = f′(u)(x − u) + f(u) = ${geradeU(polyTex([p, mal(2, k)], "u"), polyTex([qq, 0, neg(k)], "u"))}`,
    `P \\text{ einsetzen: } ${qTex(b)} = ${polyTex([plus(mal(p, a), qq), mal(2, mal(k, a)), neg(k)], "u")}`,
    `${polyTex([rest, neg(mal(2, mal(k, a))), k], "u")} = 0${teiler(k)}`,
  ];
  if (!gleich(k, 1)) z.push(`${polyTex([C, neg(mal(2, a)), 1], "u")} = 0`);
  return { z, C };
}

export function rechenweg(a) {
  const f = a.f;
  if (a.art === "tangente" || (a.art === "normale" && !a.dreieck)) {
    const z = [`f′(x) = ${fAblTex(f)}`, `f(${qTex(a.u)}) = ${qTex(a.fu)}, \\quad f′(${qTex(a.u)}) = ${qTex(a.ft)}`];
    if (a.art === "normale") z.push(`m_n = −\\frac{1}{f′(${qTex(a.u)})} = ${qTex(a.soll.m)}`);
    z.push(ausmultipliziert(a.art === "tangente" ? "t(x)" : "n(x)", a.soll.m, a.u, a.fu));
    return z;
  }
  if (a.art === "normale") {
    const mn = neg(durch(1, a.ft)), basis = betrag(minus(a.soll.xn, a.soll.xt)), hoehe = betrag(a.fu);
    const faktoren = [basis, hoehe].filter((x) => !gleich(x, 1)).map(qTex);
    return [
      `f′(x) = ${fAblTex(f)}`,
      `f(${qTex(a.u)}) = ${qTex(a.fu)}, \\quad f′(${qTex(a.u)}) = ${qTex(a.ft)}`,
      ausmultipliziert("t(x)", a.ft, a.u, a.fu),
      ausmultipliziert("n(x)", mn, a.u, a.fu),
      `t(x) = 0 \\;\\Rightarrow\\; x_T = ${qTex(a.soll.xt)}, \\quad n(x) = 0 \\;\\Rightarrow\\; x_N = ${qTex(a.soll.xn)}`,
      `\\text{Grundseite } |x_N − x_T| = ${qTex(basis)}, \\quad \\text{Höhe } |f(${qTex(a.u)})| = ${qTex(hoehe)}`,
      faktoren.length ? `A = \\frac{1}{2}${faktoren.map((x) => ` \\cdot ${x}`).join("")} = ${qTex(a.soll.A)}` : `A = ${qTex(a.soll.A)}`,
    ];
  }
  if (a.art === "aussen") {
    const { z: ansatz, C } = ansatzParabel(f, a.P);
    const pa = a.P.a, D = minus(quadrat(pa), C), r = durch(minus(a.soll.u2, a.soll.u1), 2);
    const aT = istNull(pa) ? "" : `${qTex(pa)} `;
    const unter = summeTex(quadrat(pa), neg(C));
    const z = [
      `f′(x) = ${fAblTex(f)}`,
      ...ansatz,
      `u_{1,2} = ${aT}\\pm \\sqrt{${unter}}${unter === qTex(D) ? "" : ` = ${aT}\\pm \\sqrt{${qTex(D)}}`} = ${aT}\\pm ${qTex(r)}`,
      `u_1 = ${qTex(a.soll.u1)}, \\quad u_2 = ${qTex(a.soll.u2)}`,
    ];
    if (a.stufe >= 2) [1, 2].forEach((i) => z.push(ausmultipliziert(`t_${i}(x)`, a.soll[`m${i}`], a.soll[`u${i}`], fWert(f, a.soll[`u${i}`]))));
    return z;
  }
  if (a.kurve === "parabel") {
    const { z: ansatz, C } = ansatzParabel(f, a.P);
    const pa = a.P.a, D = minus(quadrat(pa), C);
    const unter = summeTex(quadrat(pa), neg(C));
    const n = a.richtig;
    return [
      `f′(x) = ${fAblTex(f)}`,
      ...ansatz,
      `D = a^2 − C = ${unter}${unter === qTex(D) ? "" : ` = ${qTex(D)}`} \\quad (a = ${qTex(pa)}, \\; C = ${qTex(C)})`,
      n === 2 ? "D > 0 \\;\\Rightarrow\\; \\text{zwei Berührstellen: 2 Tangenten}"
        : n === 1 ? "D = 0 \\;\\Rightarrow\\; \\text{eine Berührstelle (P liegt auf der Parabel): 1 Tangente}"
          : "D < 0 \\;\\Rightarrow\\; \\text{keine Berührstelle: 0 Tangenten}",
    ];
  }
  if (a.kurve === "kubisch") {
    const p = a.p, pa = wert(a.P.a), b = wert(a.P.b), c = b - p * pa;
    const z = [
      `f′(x) = ${fAblTex(f)}`,
      `t(x) = f′(u)(x − u) + f(u) = ${geradeU(polyTex([p, 0, 3], "u"), "−2u^3")}`,
      `P \\text{ einsetzen: } ${qTex(a.P.b)} = ${polyTex([p * pa, 0, 3 * pa, -2], "u")}`,
      `g(u) = ${polyTex([c, 0, -3 * pa, 2], "u")} = 0`,
    ];
    const n = a.richtig;
    if (pa === 0) {
      z.push(`g(u) \\text{ ist streng monoton steigend} \\;\\Rightarrow\\; \\text{genau eine Lösung}`);
    } else {
      z.push(`g′(u) = ${polyTex([0, -6 * pa, 6], "u")} = 6u(${ausU(Q(pa))}) \\;\\Rightarrow\\; \\text{Extremstellen } 0 \\text{ und } ${qTex(Q(pa))}`);
      z.push(`g(0) = ${qTex(Q(c))}, \\quad g(${qTex(Q(pa))}) = ${qTex(Q(c - pa ** 3))}`);
      z.push(n === 3 ? "\\text{verschiedene Vorzeichen} \\;\\Rightarrow\\; \\text{drei Nullstellen}"
        : n === 2 ? "\\text{ein Extremwert ist 0} \\;\\Rightarrow\\; \\text{doppelte Nullstelle, also zwei verschiedene Lösungen}"
          : "\\text{gleiches Vorzeichen} \\;\\Rightarrow\\; \\text{nur eine Nullstelle}");
    }
    z.push(`\\Rightarrow\\; ${n} \\text{ ${n === 1 ? "Tangente" : "Tangenten"} durch P}`);
    return z;
  }
  /* gemeinsame Tangenten */
  const { sh, r, S, g } = a;
  const C = mal(a.u[0], a.u[1]);
  const vTex = polyTex([S, -1], "u");
  const G = g.k[0];
  const plusG = istNull(G) ? "" : G.z < 0 ? ` − ${qTex(betrag(G))}` : ` + ${qTex(G)}`;
  return [
    `\\text{an } f \\text{ in } u\\text{: } y = ${geradeU(polyTex([sh, 2], "u"), polyTex([r, 0, -1], "u"))}`,
    `\\text{an } g \\text{ in } v\\text{: } y = ${geradeU(polyTex([g.k[1], -2], "v"), polyTex([G, 0, 1], "v"))}`,
    `\\text{gleiche Steigung: } ${polyTex([sh, 2], "u")} = ${polyTex([g.k[1], -2], "v")} \\;\\Rightarrow\\; v = ${vTex}`,
    `\\text{gleicher Achsenabschnitt: } ${polyTex([r, 0, -1], "u")} = (${vTex})^2${plusG}`,
    `${polyTex([r, 0, -1], "u")} = ${polyTex([plus(S * S, G), -2 * S, 1], "u")}`,
    `${polyTex([mal(2, C), -2 * S, 2], "u")} = 0 \\quad | : 2`,
    `${polyTex([C, -S, 1], "u")} = 0 \\;\\Rightarrow\\; ${faktorTex(a.u[0], a.u[1])} = 0`,
    `u_1 = ${qTex(Q(a.u[0]))}, \\quad u_2 = ${qTex(Q(a.u[1]))}`,
    `t_1(x) = ${geradeTex(a.soll.m1, a.soll.c1)}, \\quad t_2(x) = ${geradeTex(a.soll.m2, a.soll.c2)}`,
  ];
}

export function tipp(a) {
  if (a.art === "tangente") return "Berührpunkt B(u | f(u)), Steigung f′(u). Dann t(x) = f′(u)(x − u) + f(u) ausmultiplizieren.";
  if (a.art === "normale") return a.dreieck
    ? "Nullstellen von Tangente und Normale bestimmen. Dreiecksfläche = ½ · Grundseite · Höhe, die Höhe ist |f(u)|."
    : "Die Normale geht durch denselben Punkt B(u | f(u)), hat aber die Steigung −1/f′(u).";
  if (a.art === "aussen") return "Tangente mit unbekannter Berührstelle u aufschreiben, P einsetzen, die quadratische Gleichung nach u lösen.";
  if (a.kurve === "gemeinsam") return "Tangente an f in u, Tangente an g in v: gleiche Steigung und gleicher y-Achsenabschnitt.";
  return "Stelle die Gleichung für die Berührstelle u auf und zähle ihre Lösungen – bei der Parabel mit der Diskriminante, bei der kubischen Kurve mit den Vorzeichen von g(0) und g(a).";
}

/* ======================================================================
   GFS: Gliederung, Tipps, Kolloquium
   ====================================================================== */
export const GLIEDERUNG = [
  { min: 2, titel: "Einstieg: ein Lineal und eine Parabel", text: "Zeichne eine große Parabel an die Tafel und einen Punkt P darunter. Leg ein Lineal an P an und dreh es langsam: Mal schneidet es die Parabel zweimal, mal gar nicht – und in genau zwei Lagen berührt es sie. Frage an die Klasse: Wo genau? Das ist deine Leitfrage." },
  { min: 3, titel: "Tangente und Normale", text: "Die Punkt-Steigungs-Form t(x) = f′(u)(x − u) + f(u) an einem Beispiel herleiten, danach die Normale mit der Steigung −1/f′(u). Kurz zeigen, warum senkrechte Geraden Steigungen mit dem Produkt −1 haben." },
  { min: 5, titel: "Tangenten von außen", text: "Der Kern des Vortrags: Die Berührstelle u ist unbekannt. Tangente allgemein aufschreiben, P einsetzen, die Gleichung für u lösen. Vorrechnen an f(x) = x² mit P(1 | −3): u = −1 und u = 3. Dann allgemein: D = a² − b entscheidet über zwei, eine oder keine Tangente." },
  { min: 4, titel: "Mehr Tangenten und gemeinsame Tangenten", text: "Bei f(x) = x³ − 3x wird die Gleichung kubisch: bis zu drei Tangenten. Das Bild mit den Gebieten zeigen – Kurve und Wendetangente sind die Grenzen. Danach die gemeinsame Tangente zweier Parabeln: gleiche Steigung, gleicher Achsenabschnitt." },
  { min: 3, titel: "Anwendung und Fazit", text: "Die Drohne über dem Hügel: Die Sichtgrenze ist die Tangente von B an den Hügel, und eine der beiden Lösungen fällt weg. Fazit in einem Satz: Die Zahl der Tangenten durch P ist die Zahl der Lösungen einer Gleichung für die Berührstelle." },
];

export const TIPPS = [
  "Rechne das Beispiel mit P(1 | −3) so oft, bis du es ohne Zettel an der Tafel kannst – es trägt den ganzen Vortrag.",
  "Zeichne die Parabel groß und genau (Wertetabelle oder Schablone), damit die Tangenten wirklich berühren. Ein schiefes Tafelbild weckt Zweifel an einer richtigen Rechnung.",
  "Aufs Handout gehören die Tangentenformel, der Ansatz für einen Punkt außerhalb, die Fallunterscheidung mit D = a² − b, das Gebietsbild der kubischen Funktion und zwei Übungsaufgaben mit Lösung.",
];

export const KOLLOQUIUM = [
  { stufe: "Basis", frage: "Wie stellst du die Gleichung der Tangente in einem Kurvenpunkt auf?",
    antwort: "Die Tangente geht durch den Berührpunkt B(u | f(u)) und hat dort dieselbe Steigung wie die Kurve, also f′(u). Mit der Punkt-Steigungs-Form folgt t(x) = f′(u)(x − u) + f(u). Beispiel: f(x) = ½x² an der Stelle u = 2 ergibt t(x) = 2(x − 2) + 2 = 2x − 2." },
  { stufe: "Basis", frage: "Was ist eine Normale, und wie bekommst du ihre Steigung?",
    antwort: "Die Normale steht im Berührpunkt senkrecht auf der Tangente. Zwei Geraden sind genau dann senkrecht, wenn das Produkt ihrer Steigungen −1 ist. Deshalb hat die Normale die Steigung −1/f′(u). Ist f′(u) = 0, ist die Tangente waagrecht und die Normale die senkrechte Gerade x = u." },
  { stufe: "Basis", frage: "Warum kannst du bei einem Punkt P außerhalb der Kurve nicht einfach die Tangente in P aufstellen?",
    antwort: "P liegt nicht auf der Kurve, dort gibt es also keinen Berührpunkt. Die Berührstelle u ist die Unbekannte. Ich schreibe die Tangente allgemein mit u auf und verlange, dass P darauf liegt. Das liefert eine Gleichung für u, und jede Lösung ist eine Berührstelle, also eine Tangente." },
  { stufe: "Basis", frage: "Wie viele Tangenten gehen von P(a | b) an die Normalparabel?",
    antwort: "Einsetzen liefert u² − 2au + b = 0 mit der Diskriminante D = a² − b. Liegt P unterhalb der Parabel, ist b < a² und D > 0: zwei Tangenten. Liegt P auf der Parabel, ist D = 0: genau eine, die Tangente in P. Liegt P oberhalb, ist D < 0: keine." },
  { stufe: "Vertiefung", frage: "Warum geht von einem Punkt oberhalb der Normalparabel keine Tangente aus – anschaulich?",
    antwort: "Für die Tangente in u gilt f(x) − t(x) = x² − 2ux + u² = (x − u)², und das ist nie negativ. Jede Tangente liegt also ganz unterhalb der Parabel und berührt sie nur bei u. Ein Punkt oberhalb der Parabel liegt damit auch oberhalb jeder Tangente – keine kann durch ihn gehen." },
  { stufe: "Vertiefung", frage: "Warum gehen durch einen Punkt höchstens drei Tangenten an eine kubische Funktion?",
    antwort: "Die Bedingung, dass P auf der Tangente in u liegt, ist eine Gleichung dritten Grades in u – sie hat höchstens drei Lösungen. Verschiedene Berührstellen geben auch verschiedene Geraden: f(x) − t(x) ist ein Polynom dritten Grades, und jede Berührstelle ist eine doppelte Nullstelle davon. Zwei doppelte Nullstellen bräuchten den Grad vier." },
  { stufe: "Vertiefung", frage: "Was passiert, wenn P auf der Wendetangente liegt?",
    antwort: "Für f(x) = x³ − 3x lautet die Gleichung 2u³ − 3au² + 3a + b = 0. Auf der Wendetangente y = −3x ist b = −3a, und es bleibt u²(2u − 3a) = 0. Die Lösung u = 0 ist doppelt: Zwei der drei Berührstellen sind im Wendepunkt zusammengefallen. Übrig bleiben die Wendetangente und die Tangente bei u = 1,5a." },
  { stufe: "Vertiefung", frage: "Wie findest du eine gemeinsame Tangente zweier Parabeln?",
    antwort: "Ich schreibe die Tangente an f in u und die Tangente an g in v auf. Es soll dieselbe Gerade sein, also müssen Steigung und y-Achsenabschnitt übereinstimmen – zwei Gleichungen für u und v. Bei f(x) = x² und g(x) = −x² + 2x − 5 folgt v = 1 − u und u² − u − 2 = 0, also u = −1 oder u = 2: die Tangenten y = −2x − 1 und y = 4x − 4." },
  { stufe: "Vertiefung", frage: "Gibt es einen zweiten Weg zur gemeinsamen Tangente?",
    antwort: "Ja, über die Diskriminante: Die Gerade y = mx + c berührt eine Parabel genau dann, wenn die Schnittgleichung eine doppelte Lösung hat. Für x² heißt das m² + 4c = 0, für −x² + 2x − 5 heißt es (m − 2)² − 4(c + 5) = 0. Mit c = −m²/4 folgt m² − 2m − 8 = 0, also m = 4 oder m = −2 – dieselben Tangenten." },
  { stufe: "Profi", frage: "Wie viele Tangenten kann es bei einer ganzrationalen Funktion vom Grad n höchstens durch einen Punkt geben?",
    antwort: "Höchstens n (für n ≥ 2). Die Bedingung f′(u)(a − u) + f(u) = b ist eine Polynomgleichung in u. Hat f den Leitkoeffizienten k, steht vor uⁿ der Faktor k − nk = (1 − n)k, und der ist für n ≥ 2 nicht null. Die Gleichung hat also genau den Grad n und damit höchstens n Lösungen." },
  { stufe: "Profi", frage: "Gilt die Aufteilung in Gebiete mit einer, zwei und drei Tangenten für jede kubische Funktion?",
    antwort: "Ja. Verschiebt man den Wendepunkt in den Ursprung und streckt in y-Richtung, wird aus jeder kubischen Funktion eine der Form x³ + px. Dabei bleiben Geraden Geraden und Berührungen Berührungen. Für x³ + px liefert dieselbe Rechnung: Zwischen Kurve und Wendetangente gehen drei Tangenten durch P, auf der Kurve oder der Wendetangente außer im Wendepunkt zwei, sonst eine." },
  { stufe: "Profi", frage: "Wo stößt die Methode an Grenzen?",
    antwort: "An einem Knick wie bei f(x) = |x| an der Stelle 0 gibt es keine Ableitung und damit keine Tangente. Eine senkrechte Tangente, etwa bei der Wurzelfunktion an der Stelle 0, lässt sich nicht als t(x) = mx + c schreiben. Und nicht jede Lösung passt zur Aufgabe: Beim Hügel liegt die zweite Berührstelle u = 8 außerhalb des Hügels und fällt weg." },
];
