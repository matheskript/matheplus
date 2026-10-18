/* ======================================================================
   normal.js – reine Mathematik der Normalverteilung (ohne React, Node-testbar)
     φ, Φ             – Dichte und Verteilungsfunktion der Standardnormalverteilung
     dichte, vert     – mit Erwartungswert μ und Standardabweichung σ
     zwischen         – P(a ≤ X ≤ b)
     quantil          – Umkehrung von Φ (Acklam + ein Halley-Schritt)
     SIGMA_REGELN     – P(μ − kσ ≤ X ≤ μ + kσ) für k = 1, 2, 3 und die
                        „runden“ Prozente 90 %, 95 %, 99 %
     nvAufgabe(art)   – Aufgaben für das Werkzeug „Normalverteilung“
   Konvention wie im Unterricht: z-Werte auf zwei Nachkommastellen,
   Wahrscheinlichkeiten auf vier Nachkommastellen; geprüft wird mit dem
   exakten Wert und einer Toleranz, die das Runden über die Tabelle abdeckt.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */

const WURZEL_2PI = Math.sqrt(2 * Math.PI);

/* Dichte der Standardnormalverteilung */
export const phi = (z) => Math.exp(-0.5 * z * z) / WURZEL_2PI;

/* Φ(z) über die Reihe Φ(z) = ½ + φ(z) · Σ z^(2n+1) / (1·3·5·…·(2n+1)) (Marsaglia).
   Alle Glieder haben dasselbe Vorzeichen – keine Auslöschung, Genauigkeit ~1e-15 für |z| ≤ 8. */
export function Phi(z) {
  if (!isFinite(z)) return z > 0 ? 1 : 0;
  if (z < -8.5) return 0;
  if (z > 8.5) return 1;
  let s = z, t = z;
  for (let i = 3; i < 400; i += 2) {
    t *= (z * z) / i;
    const neu = s + t;
    if (neu === s) break;
    s = neu;
  }
  return Math.min(1, Math.max(0, 0.5 + phi(z) * s));
}

export const dichte = (x, mu = 0, s = 1) => phi((x - mu) / s) / s;
export const vert = (x, mu = 0, s = 1) => Phi((x - mu) / s);
export const zwischen = (a, b, mu = 0, s = 1) => Math.max(0, vert(b, mu, s) - vert(a, mu, s));
export const zWert = (x, mu, s) => (x - mu) / s;

/* Quantil z_p mit Φ(z_p) = p (Peter Acklam, danach ein Halley-Schritt → ~1e-15) */
const A = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
const B = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
const CC = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
const D = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
export function quantil(p) {
  if (!(p > 0 && p < 1)) return p <= 0 ? -Infinity : Infinity;
  const pl = 0.02425;
  let x;
  if (p < pl) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((CC[0] * q + CC[1]) * q + CC[2]) * q + CC[3]) * q + CC[4]) * q + CC[5]) / ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1);
  } else if (p <= 1 - pl) {
    const q = p - 0.5, r = q * q;
    x = ((((((A[0] * r + A[1]) * r + A[2]) * r + A[3]) * r + A[4]) * r + A[5]) * q) / (((((B[0] * r + B[1]) * r + B[2]) * r + B[3]) * r + B[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((CC[0] * q + CC[1]) * q + CC[2]) * q + CC[3]) * q + CC[4]) * q + CC[5]) / ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1);
  }
  const e = Phi(x) - p, u = e * WURZEL_2PI * Math.exp((x * x) / 2);
  return x - u / (1 + (x * u) / 2);
}

/* Sigma-Regeln (auf drei Nachkommastellen in Prozent wie in der Formelsammlung) */
export const SIGMA_REGELN = [
  { k: 1, p: zwischen(-1, 1), prozent: "68,3 %" },
  { k: 2, p: zwischen(-2, 2), prozent: "95,4 %" },
  { k: 3, p: zwischen(-3, 3), prozent: "99,7 %" },
];
export const SIGMA_RUND = [
  { p: 0.9, k: 1.64 }, { p: 0.95, k: 1.96 }, { p: 0.99, k: 2.58 },
];

/* Binomialverteilung ≈ Normalverteilung (de Moivre–Laplace) */
export const binomMu = (n, p) => n * p;
export const binomSigma = (n, p) => Math.sqrt(n * p * (1 - p));
export const laplaceOk = (n, p) => binomSigma(n, p) > 3;
/* P(X ≤ k) mit Stetigkeitskorrektur */
export const binomNaeherung = (n, p, k) => Phi((k + 0.5 - binomMu(n, p)) / binomSigma(n, p));

/* ---------- Rundungen ---------- */
export const r2 = (v) => Math.round(v * 100) / 100;
export const r4 = (v) => Math.round(v * 10000) / 10000;
/* Toleranzen: Wahrscheinlichkeit (Tabelle mit gerundetem z), z-Werte */
export const TOL_P = 0.0025;
export const TOL_Z = 0.006;

/* ======================================================================
   Aufgaben
   ====================================================================== */
/* Sachkontexte: mu/sigma-Auswahl, Schrittweite der x-Werte, Einheit */
export const KONTEXTE = [
  { id: "groesse", mu: [174, 176, 178], s: [6, 7, 8], schritt: 1, einheit: "cm",
    de: (m, s) => `Die Körpergröße X (in cm) von 16-jährigen Jungen ist annähernd normalverteilt mit $\\mu = ${dz(m)}$ und $\\sigma = ${dz(s)}$.`,
    en: (m, s) => `The height X (in cm) of 16-year-old boys is approximately normally distributed with $\\mu = ${dz(m)}$ and $\\sigma = ${dz(s)}$.`,
    wasDe: "ein zufällig ausgewählter Junge", wasEn: "a randomly chosen boy", groesserDe: "größer als", groesserEn: "taller than", kleinerDe: "höchstens", kleinerEn: "at most" },
  { id: "flasche", mu: [500, 750, 1000], s: [3, 4, 5], schritt: 1, einheit: "ml",
    de: (m, s) => `Eine Anlage füllt Saftflaschen ab. Die Füllmenge X (in ml) ist normalverteilt mit $\\mu = ${dz(m)}$ und $\\sigma = ${dz(s)}$.`,
    en: (m, s) => `A machine fills juice bottles. The filling amount X (in ml) is normally distributed with $\\mu = ${dz(m)}$ and $\\sigma = ${dz(s)}$.`,
    wasDe: "eine zufällig ausgewählte Flasche", wasEn: "a randomly chosen bottle", groesserDe: "mehr als", groesserEn: "more than", kleinerDe: "höchstens", kleinerEn: "at most" },
  { id: "schraube", mu: [40, 50, 60], s: [0.4, 0.5, 0.8], schritt: 0.1, einheit: "mm",
    de: (m, s) => `Die Länge X (in mm) von Schrauben aus einer Produktion ist normalverteilt mit $\\mu = ${dz(m)}$ und $\\sigma = ${dz(s)}$.`,
    en: (m, s) => `The length X (in mm) of screws from a production line is normally distributed with $\\mu = ${dz(m)}$ and $\\sigma = ${dz(s)}$.`,
    wasDe: "eine zufällig ausgewählte Schraube", wasEn: "a randomly chosen screw", groesserDe: "länger als", groesserEn: "longer than", kleinerDe: "höchstens", kleinerEn: "at most" },
  { id: "punkte", mu: [55, 60, 65], s: [10, 12, 15], schritt: 1, einheit: zwDe("Punkte", "points"),
    de: (m, s) => `Die Punktzahl X in einem landesweiten Test ist annähernd normalverteilt mit $\\mu = ${dz(m)}$ und $\\sigma = ${dz(s)}$.`,
    en: (m, s) => `The score X in a nationwide test is approximately normally distributed with $\\mu = ${dz(m)}$ and $\\sigma = ${dz(s)}$.`,
    wasDe: "ein zufällig ausgewählter Teilnehmer", wasEn: "a randomly chosen participant", groesserDe: "mehr als", groesserEn: "more than", kleinerDe: "höchstens", kleinerEn: "at most" },
  { id: "akku", mu: [800, 1000, 1200], s: [50, 80, 100], schritt: 10, einheit: "h",
    de: (m, s) => `Die Lebensdauer X (in Stunden) eines Akkutyps ist normalverteilt mit $\\mu = ${dz(m)}$ und $\\sigma = ${dz(s)}$.`,
    en: (m, s) => `The lifetime X (in hours) of a battery type is normally distributed with $\\mu = ${dz(m)}$ and $\\sigma = ${dz(s)}$.`,
    wasDe: "ein zufällig ausgewählter Akku", wasEn: "a randomly chosen battery", groesserDe: "länger als", groesserEn: "longer than", kleinerDe: "höchstens", kleinerEn: "at most" },
  { id: "apfel", mu: [170, 180, 190], s: [12, 15, 20], schritt: 1, einheit: "g",
    de: (m, s) => `Die Masse X (in g) von Äpfeln einer Sorte ist normalverteilt mit $\\mu = ${dz(m)}$ und $\\sigma = ${dz(s)}$.`,
    en: (m, s) => `The mass X (in g) of apples of one variety is normally distributed with $\\mu = ${dz(m)}$ and $\\sigma = ${dz(s)}$.`,
    wasDe: "ein zufällig ausgewählter Apfel", wasEn: "a randomly chosen apple", groesserDe: "schwerer als", groesserEn: "heavier than", kleinerDe: "höchstens", kleinerEn: "at most" },
];
function zwDe(de, en) { return { de, en }; }
/* Zahl mit Dezimalkomma (für TeX/Text) */
export const dz = (v, st = 4) => String(Math.round(v * 10 ** st) / 10 ** st).replace(".", ",").replace(/-/g, "−");

export const NV_ARTEN = ["ablesen", "standard", "kleiner", "groesser", "zwischen", "sigma", "quantil", "sigmaRueck", "binom", "stetig"];

const wahlAus = (l, z) => l[Math.floor(z() * l.length)];
const aufSchritt = (v, sch) => Math.round(v / sch) * sch;
const sauber = (v) => Math.round(v * 1e6) / 1e6;

/* Ein x-Wert mit |z| zwischen zmin und zmax (auf Schrittweite des Kontexts) */
function xWert(k, mu, s, z, zmin = 0.25, zmax = 2.4, seite = 0) {
  for (let i = 0; i < 200; i++) {
    const sg = seite || (z() < 0.5 ? -1 : 1);
    const zz = zmin + z() * (zmax - zmin);
    const x = sauber(aufSchritt(mu + sg * zz * s, k.schritt));
    const zx = (x - mu) / s;
    if (Math.abs(zx) >= zmin - 1e-9 && Math.abs(zx) <= zmax + 1e-9 && x !== mu) return x;
  }
  return sauber(mu + s);
}

export function nvAufgabe(art, z = Math.random) {
  if (!art) art = wahlAus(NV_ARTEN, z);
  const k = wahlAus(KONTEXTE, z), mu = wahlAus(k.mu, z), s = wahlAus(k.s, z);
  const basis = { art, kontext: k.id, mu, s, einheit: k.einheit };
  switch (art) {
    case "ablesen":
      return { ...basis };
    case "standard": {
      const x = xWert(k, mu, s, z, 0.3, 2.8);
      return { ...basis, x, zWert: sauber((x - mu) / s) };
    }
    case "kleiner": {
      const x = xWert(k, mu, s, z);
      return { ...basis, x, zWert: sauber((x - mu) / s), wert: vert(x, mu, s) };
    }
    case "groesser": {
      const x = xWert(k, mu, s, z);
      return { ...basis, x, zWert: sauber((x - mu) / s), PhiZ: vert(x, mu, s), wert: 1 - vert(x, mu, s) };
    }
    case "zwischen": {
      for (;;) {
        const a = xWert(k, mu, s, z, 0.2, 2.2, -1), b = xWert(k, mu, s, z, 0.2, 2.2, z() < 0.75 ? 1 : -1);
        const lo = Math.min(a, b), hi = Math.max(a, b);
        if (hi - lo < 0.3 * s) continue;
        return { ...basis, a: lo, b: hi, za: sauber((lo - mu) / s), zb: sauber((hi - mu) / s), Pa: vert(lo, mu, s), Pb: vert(hi, mu, s), wert: zwischen(lo, hi, mu, s) };
      }
    }
    case "sigma": {
      const kk = wahlAus([1, 2, 3], z);
      const regel = SIGMA_REGELN[kk - 1];
      return { ...basis, k: kk, unten: sauber(mu - kk * s), oben: sauber(mu + kk * s), wert: regel.p, prozent: regel.prozent };
    }
    case "quantil": {
      const p = wahlAus([0.05, 0.1, 0.2, 0.8, 0.9, 0.95, 0.975, 0.025], z);
      const zp = quantil(p);
      return { ...basis, p, zp, wert: mu + zp * s };
    }
    case "sigmaRueck": {
      /* μ bekannt, P(X ≤ c) = p bekannt → σ = (c − μ) / z_p; c so gewählt, dass σ „glatt“ ist */
      const p = wahlAus([0.9, 0.95, 0.975, 0.99, 0.1, 0.05], z);
      const zp = quantil(p);
      const c = sauber(aufSchritt(mu + zp * s, k.schritt));
      return { ...basis, p, zp, c, wert: (c - mu) / zp };
    }
    case "binom": {
      for (;;) {
        const n = wahlAus([100, 150, 200, 250, 300, 400, 500], z), p = wahlAus([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6], z);
        const m = n * p, sg = Math.sqrt(n * p * (1 - p));
        if (sg <= 3) continue;
        const kk = Math.round(m + (z() * 3 - 1.5) * sg);
        if (kk === m || kk < 1 || kk >= n) continue;
        const ohne = Phi((kk - m) / sg), mit = Phi((kk + 0.5 - m) / sg);
        if (Math.abs(ohne - mit) < 3 * TOL_P) continue;
        return { ...basis, kontext: "binom", n, p, muB: m, sB: sg, k: kk, wert: mit, ohneKorrektur: ohne };
      }
    }
    default: {
      /* stetig: vier Aussagen zur stetigen Zufallsgröße */
      const welche = wahlAus(["punkt", "hoehe", "flaeche", "breite"], z);
      return { ...basis, frage: welche };
    }
  }
}

/* Funktionswert der Dichte als Text (für das Ablesen am Graphen) */
export const maxHoehe = (s) => 1 / (s * WURZEL_2PI);
