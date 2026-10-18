/* ======================================================================
   geoMittel2.js – reine Mathematik für die Mittelstufen-Geometrie, Teil 2
   (Winkelsätze, Kathetensatz und Höhensatz, Kreis und Kreisteile,
   Körper, besondere Linien im Dreieck / Konstruktionen).
   Kein React, keine Importe von func-/base-Dateien: Node-testbar
   (tests/geoMittel2.test.mjs). Oberflächen: funcWinkelsaetze.jsx,
   funcKathetensatz.jsx, funcKreis.jsx, funcKoerper.jsx, funcKonstruktion.jsx.
   ====================================================================== */

export const GRAD = Math.PI / 180;
const wahlAus = (l, z) => l[Math.floor(z() * l.length)];
export const rund2 = (v) => Math.round(v * 100) / 100;

/* ---------- Winkel an Parallelen ----------
   Zwei Parallelen g (oben, Schnittpunkt S1) und h (unten, S2), eine Schnittgerade t.
   φ = Winkel zwischen der Parallelen (Richtung rechts) und t (Richtung nach oben).
   Lagen je Schnittpunkt: or (oben rechts) = φ, ol = 180° − φ, ul = φ, ur = 180° − φ.  */
export const LAGEN = ["ol", "or", "ul", "ur"];
export const lagenWert = (lage, phi) => (lage === "or" || lage === "ul" ? phi : 180 - phi);
const GEGEN = { or: "ul", ul: "or", ol: "ur", ur: "ol" };

/* Beziehung zwischen zwei Winkeln (Schnittpunkt 1|2, Lage) */
export function beziehung(s1, l1, s2, l2) {
  if (s1 === s2) {
    if (l1 === l2) return "gleich";
    return GEGEN[l1] === l2 ? "scheitel" : "neben";
  }
  if (l1 === l2) return "stufen";
  /* zwischen den Parallelen liegen: an der oberen Geraden die unteren Lagen, an der unteren die oberen */
  const innen = (s, l) => (s === 1 ? l[0] === "u" : l[0] === "o");
  if (innen(s1, l1) && innen(s2, l2)) return l1[1] !== l2[1] ? "wechsel" : "nachbar";
  return "ohne";
}
export const BEZ_GLEICH = { scheitel: true, stufen: true, wechsel: true, neben: false, nachbar: false };

/* Aufgaben zu Winkelsätzen. art: parallel | dreieck | gleichschenklig | aussen | neck | regelmaessig */
export const WINKEL_ARTEN = ["parallel", "dreieck", "gleichschenklig", "aussen", "neck", "regelmaessig"];
export function winkelAufgabe(art, z = Math.random) {
  art = art || wahlAus(WINKEL_ARTEN, z);
  if (art === "parallel") {
    const phi = wahlAus([35, 40, 48, 52, 57, 62, 65, 70, 74], z);
    let s1, l1, s2, l2, bez;
    do {
      s1 = wahlAus([1, 2], z); l1 = wahlAus(LAGEN, z); s2 = wahlAus([1, 2], z); l2 = wahlAus(LAGEN, z);
      bez = beziehung(s1, l1, s2, l2);
    } while (bez === "gleich" || bez === "ohne");
    const gegeben = lagenWert(l1, phi), gesucht = lagenWert(l2, phi);
    return { art, phi, s1, l1, s2, l2, bez, gegeben, gesucht };
  }
  if (art === "dreieck") {
    const a = wahlAus([28, 35, 42, 47, 54, 61, 66, 73], z), b = wahlAus([31, 38, 44, 52, 59, 68], z);
    return { art, a, b, c: 180 - a - b };
  }
  if (art === "gleichschenklig") {
    const spitzeGegeben = z() < 0.5;
    const basis = wahlAus([32, 38, 44, 51, 55, 63, 67, 72, 78], z);
    return { art, spitzeGegeben, basis, spitze: 180 - 2 * basis };
  }
  if (art === "aussen") {
    const a = wahlAus([34, 41, 46, 53, 58, 64], z), b = wahlAus([37, 43, 49, 56, 71], z);
    return { art, a, b, innen: 180 - a - b, aussen: a + b };
  }
  if (art === "neck") {
    const n = wahlAus([4, 5, 6, 7, 8, 9, 10, 12], z);
    return { art, n, summe: (n - 2) * 180 };
  }
  const n = wahlAus([5, 6, 8, 9, 10, 12, 15, 18, 20], z);
  return { art: "regelmaessig", n, summe: (n - 2) * 180, innen: ((n - 2) * 180) / n, aussen: 360 / n };
}

/* ---------- Kathetensatz und Höhensatz ----------
   Rechtwinkliges Dreieck ABC mit γ = 90°, Höhe h auf c teilt c in q (bei A) und p (bei B).
   a² = c · p   b² = c · q   h² = p · q                                                   */
export function satzgruppe(a, b) {
  const c = Math.hypot(a, b);
  return { a, b, c, p: (a * a) / c, q: (b * b) / c, h: (a * b) / c };
}
export const KATH_ARTEN = ["hoehe", "kathete", "abschnitt", "rueck", "flaeche"];
export function kathAufgabe(art, z = Math.random) {
  art = art || wahlAus(KATH_ARTEN, z);
  if (art === "hoehe" || art === "rueck") {
    const [p, q] = wahlAus([[4, 9], [2, 8], [1, 9], [3, 12], [4, 16], [8, 18], [5, 20], [9, 16], [2, 18], [1, 4], [6, 24], [3, 27]], z);
    const h = Math.sqrt(p * q);
    return z() < 0.5 ? { art, p, q, h } : { art, p: q, q: p, h };
  }
  const [a, b] = wahlAus([[3, 4], [6, 8], [15, 20], [9, 12], [12, 16], [5, 12], [8, 15], [4, 3], [8, 6], [20, 15]], z);
  return { art, ...satzgruppe(a, b) };
}

/* ---------- Kreis und Kreisteile ----------
   art: umfang | flaeche | radiusU | radiusA | bogen | sektor | ring | durchmesser */
export const KREIS_ARTEN = ["umfang", "flaeche", "radiusU", "radiusA", "bogen", "sektor", "ring", "durchmesser"];
export function kreisAufgabe(art, z = Math.random) {
  art = art || wahlAus(KREIS_ARTEN, z);
  const r = wahlAus([2, 2.5, 3, 4, 4.5, 5, 6, 7, 8, 10, 12], z);
  if (art === "umfang") return { art, r, wert: 2 * Math.PI * r };
  if (art === "flaeche") return { art, r, wert: Math.PI * r * r };
  if (art === "durchmesser") { const d = wahlAus([4, 6, 8, 10, 12, 14, 20], z); return { art, d, r: d / 2, wert: Math.PI * (d / 2) ** 2 }; }
  if (art === "radiusU") { const u = rund2(2 * Math.PI * r); return { art, u, r, wert: u / (2 * Math.PI) }; }
  if (art === "radiusA") { const A = rund2(Math.PI * r * r); return { art, A, r, wert: Math.sqrt(A / Math.PI) }; }
  const alpha = wahlAus([30, 45, 60, 72, 90, 120, 135, 150, 216, 270], z);
  if (art === "bogen") return { art, r, alpha, umfang: 2 * Math.PI * r, wert: (2 * Math.PI * r * alpha) / 360 };
  if (art === "sektor") return { art, r, alpha, flaeche: Math.PI * r * r, wert: (Math.PI * r * r * alpha) / 360 };
  const R = r + wahlAus([1, 1.5, 2, 3], z);
  return { art: "ring", R, r, wert: Math.PI * (R * R - r * r) };
}

/* ---------- Körper ----------
   Zylinder (r, h), quadratische Pyramide (a, h), Kegel (r, h), Kugel (r), dreiseitiges Prisma
   mit rechtwinkliger Grundfläche (Katheten a, b; Höhe h).                                    */
export const koerper = {
  zylinder: ({ r, h }) => ({ G: Math.PI * r * r, M: 2 * Math.PI * r * h, V: Math.PI * r * r * h, O: 2 * Math.PI * r * r + 2 * Math.PI * r * h }),
  pyramide: ({ a, h }) => { const hs = Math.hypot(h, a / 2); return { G: a * a, hs, M: 2 * a * hs, V: (a * a * h) / 3, O: a * a + 2 * a * hs }; },
  kegel: ({ r, h }) => { const s = Math.hypot(r, h); return { G: Math.PI * r * r, s, M: Math.PI * r * s, V: (Math.PI * r * r * h) / 3, O: Math.PI * r * r + Math.PI * r * s }; },
  kugel: ({ r }) => ({ V: (4 / 3) * Math.PI * r ** 3, O: 4 * Math.PI * r * r }),
  prisma: ({ a, b, h }) => { const c = Math.hypot(a, b); return { G: (a * b) / 2, c, M: (a + b + c) * h, V: ((a * b) / 2) * h, O: a * b + (a + b + c) * h }; },
};
export const KOERPER_ARTEN = ["zylV", "zylO", "pyrV", "pyrO", "kegV", "kegO", "kugV", "kugO", "prismaV", "hoehe"];
export function koerperAufgabe(art, z = Math.random) {
  art = art || wahlAus(KOERPER_ARTEN, z);
  if (art === "zylV" || art === "zylO") { const m = { r: wahlAus([2, 3, 4, 5, 6], z), h: wahlAus([5, 7, 8, 10, 12], z) }; return { art, k: "zylinder", m, ...koerper.zylinder(m) }; }
  if (art === "pyrV" || art === "pyrO") { const [a, h] = wahlAus([[6, 4], [8, 3], [10, 12], [12, 8], [16, 6], [6, 9], [10, 6]], z); const m = { a, h }; return { art, k: "pyramide", m, ...koerper.pyramide(m) }; }
  if (art === "kegV" || art === "kegO") { const [r, h] = wahlAus([[3, 4], [6, 8], [5, 12], [8, 6], [9, 12], [4, 3], [8, 15]], z); const m = { r, h }; return { art, k: "kegel", m, ...koerper.kegel(m) }; }
  if (art === "kugV" || art === "kugO") { const m = { r: wahlAus([2, 3, 4, 5, 6, 1.5], z) }; return { art, k: "kugel", m, ...koerper.kugel(m) }; }
  if (art === "prismaV") { const [a, b] = wahlAus([[3, 4], [6, 8], [5, 12]], z); const m = { a, b, h: wahlAus([5, 10, 7], z) }; return { art, k: "prisma", m, ...koerper.prisma(m) }; }
  /* hoehe: Zylinder mit gegebenem Volumen (gerundet) und Radius → Höhe */
  const m = { r: wahlAus([2, 3, 4, 5], z), h: wahlAus([6, 8, 9, 10, 15], z) };
  const V = rund2(koerper.zylinder(m).V);
  return { art: "hoehe", k: "zylinder", m, Vgeg: V, G: Math.PI * m.r * m.r, hWert: V / (Math.PI * m.r * m.r) };
}

/* ---------- Besondere Punkte im Dreieck ---------- */
export function schwerpunkt(A, B, C) { return [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3]; }
export function umkreismitte(A, B, C) {
  const d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
  if (Math.abs(d) < 1e-12) return null;
  const q = (P) => P[0] * P[0] + P[1] * P[1];
  return [(q(A) * (B[1] - C[1]) + q(B) * (C[1] - A[1]) + q(C) * (A[1] - B[1])) / d,
    (q(A) * (C[0] - B[0]) + q(B) * (A[0] - C[0]) + q(C) * (B[0] - A[0])) / d];
}
export function inkreismitte(A, B, C) {
  const a = Math.hypot(B[0] - C[0], B[1] - C[1]), b = Math.hypot(A[0] - C[0], A[1] - C[1]), c = Math.hypot(A[0] - B[0], A[1] - B[1]);
  const u = a + b + c;
  const M = [(a * A[0] + b * B[0] + c * C[0]) / u, (a * A[1] + b * B[1] + c * C[1]) / u];
  const flaeche = Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) / 2;
  return { M, r: (2 * flaeche) / u };
}
export function hoehenschnitt(A, B, C) {
  const S = schwerpunkt(A, B, C), U = umkreismitte(A, B, C);
  if (!U) return null;
  return [3 * S[0] - 2 * U[0], 3 * S[1] - 2 * U[1]];   // Euler-Gerade: H = 3S − 2U
}

/* Aufgaben zu besonderen Linien. art: linie | lage | schwerpunkt | umkreis | inkreis | teilung */
export const KONSTR_ARTEN = ["linie", "lage", "schwerpunkt", "umkreis", "inkreis", "teilung"];
export const LINIEN = {
  mittelsenkrechte: { punkt: "umkreis" }, winkelhalbierende: { punkt: "inkreis" }, hoehe: { punkt: "hoehenschnitt" }, seitenhalbierende: { punkt: "schwerpunkt" },
};
export function konstrAufgabe(art, z = Math.random) {
  art = art || wahlAus(KONSTR_ARTEN, z);
  if (art === "linie") return { art, linie: wahlAus(Object.keys(LINIEN), z) };
  if (art === "lage") {
    const typ = wahlAus(["spitz", "recht", "stumpf"], z);
    const g = typ === "spitz" ? wahlAus([55, 64, 72, 80], z) : typ === "recht" ? 90 : wahlAus([105, 118, 126, 140], z);
    const a = wahlAus([25, 30, 35], z);
    return { art, typ, winkel: [a, 180 - a - g, g] };
  }
  if (art === "schwerpunkt") {
    let A, B, C, S;
    do {
      A = [wahlAus([-3, -2, -1, 0, 1], z), wahlAus([-2, -1, 0, 1], z)];
      B = [wahlAus([3, 4, 5, 6, 7], z), wahlAus([-2, -1, 0, 2], z)];
      C = [wahlAus([0, 1, 2, 3, 4], z), wahlAus([3, 4, 5, 6, 8], z)];
      S = schwerpunkt(A, B, C);
    } while (!Number.isInteger(S[0]) || !Number.isInteger(S[1]));
    return { art, A, B, C, S };
  }
  if (art === "umkreis") {
    /* rechtwinkliges Dreieck in Koordinaten: C im Ursprung, A auf der x-, B auf der y-Achse (verschoben) */
    const [a, b] = wahlAus([[6, 8], [4, 6], [8, 2], [10, 4], [6, 6], [12, 8]], z);
    const v = [wahlAus([-2, 0, 1, 2], z), wahlAus([-1, 0, 2, 3], z)];
    const C = v, A = [v[0] + a, v[1]], B = [v[0], v[1] + b];
    return { art, A, B, C, M: [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2] };
  }
  if (art === "inkreis") {
    const [a, b, c] = wahlAus([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [20, 21, 29]], z);
    const A = (a * b) / 2, u = a + b + c;
    return { art, a, b, c, flaeche: A, u, r: (2 * A) / u };
  }
  /* teilung: Schwerpunkt teilt jede Seitenhalbierende im Verhältnis 2 : 1 (von der Ecke aus) */
  const s = wahlAus([6, 9, 12, 7.5, 10.5, 15], z);
  return { art: "teilung", s, ecke: (2 * s) / 3, seite: s / 3 };
}
