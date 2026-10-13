/* ======================================================================
   pythagoras.js – reine Mathematik hinter dem Modul „Satz des Pythagoras“
   (Mathe entdecken, funcEntdeckenPythagoras.jsx). Kein React, keine Imports.

   Geometrie der beiden Beweise:
   · Beweis 1: Quadrat mit Seitenlänge a+b, vier rechtwinklige Dreiecke (Katheten a, b).
       Anordnung A: in der Mitte das schräge Quadrat c².
       Anordnung B: in der Mitte die beiden Quadrate a² und b².
       Die Dreiecke wandern per Drehung und Verschiebung von A nach B (umlegen).
   · Beweis 2: Quadrat mit Seitenlänge c außen, die vier Dreiecke innen,
       in der Mitte ein Quadrat mit Seitenlänge |a−b|.
   Alle Dreiecke sind als [R, Pb, Pa] gespeichert: R = rechter Winkel,
   Pb = Ecke am Schenkel der Länge b, Pa = Ecke am Schenkel der Länge a.
   ====================================================================== */

export const rechteckFlaeche = (a, b) => a * b;
export const rechtwinkligFlaeche = (a, b) => (a * b) / 2;
export const dreieckFlaeche = (g, h) => (g * h) / 2;
export const hypotenuse = (a, b) => Math.sqrt(a * a + b * b);

/* Ein Dreieck, dessen Spitze auf der oberen Kante eines Rechtecks (Breite b, Höhe a) bei p liegt */
export function zerlegung(p, b, a) {
  const q = b - p;
  return { p, q, links: (p * a) / 2, rechts: (q * a) / 2, summe: (p * a) / 2 + (q * a) / 2, gesamt: (b * a) / 2 };
}

/* ---------- Beweis 1: vier Dreiecke im Quadrat der Seite a+b ---------- */
export const dreieckeA = (a, b) => {
  const s = a + b;
  return [
    [[s, 0], [a, 0], [s, a]],
    [[s, s], [s, a], [b, s]],
    [[0, s], [b, s], [0, b]],
    [[0, 0], [0, b], [a, 0]],
  ];
};

export const dreieckeB = (a, b) => {
  const s = a + b;
  return [
    [[s, 0], [a, 0], [s, a]],
    [[a, a], [s, a], [a, 0]],
    [[a, s], [a, a], [0, s]],
    [[0, a], [0, s], [a, a]],
  ];
};

const schwerpunkt = (d) => [(d[0][0] + d[1][0] + d[2][0]) / 3, (d[0][1] + d[1][1] + d[2][1]) / 3];
const abstand2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;

const permutationen = (n) => {
  const erg = [];
  const rek = (rest, akt) => {
    if (!rest.length) { erg.push(akt); return; }
    rest.forEach((x, i) => rek([...rest.slice(0, i), ...rest.slice(i + 1)], [...akt, x]));
  };
  rek(Array.from({ length: n }, (_, i) => i), []);
  return erg;
};
const PERM4 = permutationen(4);

/* Welches Dreieck aus A wandert wohin in B (kürzeste Wege), und mit welcher Drehung */
export function umlegePlan(a, b) {
  const A = dreieckeA(a, b), B = dreieckeB(a, b);
  const cA = A.map(schwerpunkt), cB = B.map(schwerpunkt);
  let beste = null, besteSumme = Infinity;
  for (const p of PERM4) {
    const sm = p.reduce((s, j, i) => s + abstand2(cA[i], cB[j]), 0);
    if (sm < besteSumme - 1e-9) { besteSumme = sm; beste = p; }
  }
  return A.map((da, i) => {
    const db = B[beste[i]];
    const ra = da[0], rb = db[0];
    const wA = Math.atan2(da[1][1] - ra[1], da[1][0] - ra[0]);
    const wB = Math.atan2(db[1][1] - rb[1], db[1][0] - rb[0]);
    let theta = wB - wA;
    while (theta > Math.PI + 1e-9) theta -= 2 * Math.PI;
    while (theta <= -Math.PI + 1e-9) theta += 2 * Math.PI;
    return { von: da, nach: db, ra, rb, theta };
  });
}

/* Eckpunkte eines Dreiecks nach einem Anteil t (0 … 1) der Bewegung: Drehung um den rechten Winkel plus Verschiebung */
export function dreieckBeiT(plan, t) {
  const w = plan.theta * t, c = Math.cos(w), s = Math.sin(w);
  const dx = (plan.rb[0] - plan.ra[0]) * t, dy = (plan.rb[1] - plan.ra[1]) * t;
  return plan.von.map(([x, y]) => {
    const u = x - plan.ra[0], v = y - plan.ra[1];
    return [plan.ra[0] + c * u - s * v + dx, plan.ra[1] + s * u + c * v + dy];
  });
}

/* Ecken des schrägen Quadrats c² in Anordnung A */
export const schraegesQuadrat = (a, b) => [[a, 0], [a + b, a], [b, a + b], [0, b]];

/* ---------- Beweis 2: Quadrat der Seite c, Dreiecke nach innen ---------- */
export function beweisZwei(a, b) {
  const c = hypotenuse(a, b);
  const O = [c / 2, c / 2];
  const dreh = ([x, y]) => [O[0] - (y - O[1]), O[1] + (x - O[0])];       // 90° gegen den Uhrzeigersinn um die Mitte
  const V = [[0, 0], [c, 0], [c, c], [0, c]];
  let Q = [(b * b) / c, (a * b) / c];
  const innen = [];
  for (let k = 0; k < 4; k++) { innen.push(Q); Q = dreh(Q); }
  const dreiecke = V.map((v, k) => [v, V[(k + 1) % 4], innen[k]]);
  return { c, V, innen, dreiecke };
}

/* ---------- Quadrate über den Seiten (Anwenden) ---------- */
export function quadrateUeber(a, b) {
  return {
    dreieck: [[0, 0], [a, 0], [0, b]],
    quadratA: [[0, 0], [a, 0], [a, -a], [0, -a]],
    quadratB: [[0, 0], [-b, 0], [-b, b], [0, b]],
    quadratC: [[a, 0], [a + b, a], [b, a + b], [0, b]],
    kasten: { x0: -b, x1: a + b, y0: -a, y1: a + b },
  };
}

/* ---------- Zahlenbeispiele ---------- */
export const TRIPEL = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
export const zufallsTripel = (zufall = Math.random) => {
  const t = TRIPEL[Math.floor(zufall() * TRIPEL.length)];
  return zufall() < 0.5 ? t : [t[1], t[0], t[2]];
};

/* Polygonfläche (Gaußsche Trapezformel), vorzeichenlos – für die Tests */
export const polygonFlaeche = (pts) => {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    s += x1 * y2 - x2 * y1;
  }
  return Math.abs(s) / 2;
};
