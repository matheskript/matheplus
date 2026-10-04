/* ======================================================================
   hypo.js – reine Mathematik für Hypothesentests (Binomialtest), ohne React.
   Richtungen: "links"  H₀: p ≥ p₀, Ablehnungsbereich A = {0, …, g}
               "rechts" H₀: p ≤ p₀, Ablehnungsbereich A = {g, …, n}
               "beide"  H₀: p = p₀, A = {0, …, gl} ∪ {gr, …, n}, je Seite höchstens α/2
   Bei zusammengesetztem H₀ wird – wie in der Schule üblich – am Rand p = p₀
   gerechnet; dort ist die Irrtumswahrscheinlichkeit am größten.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */

/* Verteilung B(n; p) als Tabelle P(X = k), k = 0 … n */
export function binomTabelle(n, p) {
  const t = new Array(n + 1).fill(0);
  if (p <= 0) { t[0] = 1; return t; }
  if (p >= 1) { t[n] = 1; return t; }
  // Logarithmisch berechnen: stabil auch für größere n
  let lnB = 0;
  for (let k = 0; k <= n; k++) {
    if (k > 0) lnB += Math.log(n - k + 1) - Math.log(k);
    t[k] = Math.exp(lnB + k * Math.log(p) + (n - k) * Math.log(1 - p));
  }
  return t;
}

const EPS = 1e-12;
export const kumuliert = (t) => { const c = []; let s = 0; for (const x of t) { s += x; c.push(Math.min(1, s)); } return c; };
export const pBis = (c, k) => (k < 0 ? 0 : k >= c.length - 1 ? 1 : c[k]);            // P(X ≤ k)
export const pAb = (c, k) => (k <= 0 ? 1 : k > c.length - 1 ? 0 : 1 - c[k - 1]);    // P(X ≥ k)

/* Kritische Werte. Rückgabe: { g } bzw. { gl, gr }; g = −1 bzw. n + 1 bedeutet: leerer Bereich */
export function kritisch(n, p0, alpha, richtung) {
  const c = kumuliert(binomTabelle(n, p0));
  const links = (a) => { let g = -1; for (let k = 0; k <= n; k++) { if (pBis(c, k) <= a + EPS) g = k; else break; } return g; };
  const rechts = (a) => { let g = n + 1; for (let k = n; k >= 0; k--) { if (pAb(c, k) <= a + EPS) g = k; else break; } return g; };
  if (richtung === "links") return { g: links(alpha) };
  if (richtung === "rechts") return { g: rechts(alpha) };
  return { gl: links(alpha / 2), gr: rechts(alpha / 2) };
}

export const imBereich = (k, r, richtung) => (richtung === "links" ? k <= r.g : richtung === "rechts" ? k >= r.g : k <= r.gl || k >= r.gr);

/* Wahrscheinlichkeit, dass X in den Ablehnungsbereich fällt, wenn in Wahrheit p gilt */
export function pAblehnung(n, p, r, richtung) {
  const c = kumuliert(binomTabelle(n, p));
  if (richtung === "links") return pBis(c, r.g);
  if (richtung === "rechts") return pAb(c, r.g);
  return pBis(c, r.gl) + pAb(c, r.gr);
}
/* Fehler 1. Art (am Rand p₀) und Fehler 2. Art (für konkretes p₁) */
export const fehler1 = (n, p0, r, richtung) => pAblehnung(n, p0, r, richtung);
export const fehler2 = (n, p1, r, richtung) => 1 - pAblehnung(n, p1, r, richtung);

/* Simulation: m Tests, wenn in Wahrheit p gilt; Anteil der Ablehnungen */
export function simuliereTests(n, p, r, richtung, m) {
  let ab = 0;
  for (let i = 0; i < m; i++) {
    let k = 0;
    for (let j = 0; j < n; j++) if (Math.random() < p) k++;
    if (imBereich(k, r, richtung)) ab++;
  }
  return ab;
}
