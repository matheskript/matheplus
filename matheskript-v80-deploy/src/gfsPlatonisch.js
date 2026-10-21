/* ============================================================
   GFS-Trainer · Platonische Körper – warum es genau fünf gibt
   (Klasse 9, Kapitel VII Körper)
   Reine Logik ohne React:
     · die fünf Körper (Koordinaten, Flächen, Kanten – Flächen werden aus
       den Ecken berechnet, nicht abgetippt), Drehung und Projektion für
       die selbst gezeichnete 3D-Ansicht, Dualkörper
     · Netze falten (Würfel, Tetraeder, alle 35 Hexominos), Ecke schließen
       (q regelmäßige p-Ecke um eine Ecke, bis sich die Lücke schließt)
     · vier Aufgaben-Generatoren mit Lösung und gezielter Rückmeldung,
       zwei Lückenbeweise, Gliederung, Tipps und Kolloquium
   Eigene Aufgaben und Formulierungen – nichts aus einem Schulbuch.
   Getestet in tests/gfsPlatonisch.test.mjs.
   ============================================================ */

export const PHI = (1 + Math.sqrt(5)) / 2;
export const rund = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
/* Zahl mit Komma, ohne überflüssige Nullen */
export const dk = (x, n = 2) => String(rund(x, n)).replace("-", "−").replace(".", ",");
/* Zahl aus Eingabe („108“, „128,57“, „128.57°“, „−2“) */
export const lies = (s) => {
  const t = String(s ?? "").trim().replace(/\s/g, "").replace(/°$/, "").replace(/−/g, "-").replace(",", ".");
  return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : null;
};
export const nah = (ist, soll, tol = 0.011) => ist !== null && Math.abs(ist - soll) <= tol;

const zz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const wahl = (liste, zufall = zz) => liste[zufall(0, liste.length - 1)];
const stufeIn = (s) => Math.max(1, Math.min(5, Math.round(s || 1)));

/* ---------- Vektoren ---------- */
const plus = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const minus = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mal = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const skalar = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const laenge = (a) => Math.sqrt(skalar(a, a));
const einheit = (a) => mal(a, 1 / laenge(a));
const mitte = (pts) => mal(pts.reduce(plus, [0, 0, 0]), 1 / pts.length);
export const vek = { plus, minus, mal, skalar, kreuz, laenge, einheit, mitte };

/* ---------- Innenwinkel ---------- */
export const NECK = { 3: "Dreieck", 4: "Quadrat", 5: "Fünfeck", 6: "Sechseck", 7: "Siebeneck", 8: "Achteck", 9: "Neuneck", 10: "Zehneck", 11: "Elfeck", 12: "Zwölfeck" };
export const NECKE = { 3: "Dreiecke", 4: "Quadrate", 5: "Fünfecke", 6: "Sechsecke", 7: "Siebenecke", 8: "Achtecke", 9: "Neunecke", 10: "Zehnecke", 11: "Elfecke", 12: "Zwölfecke" };
export const innenwinkel = (p) => ((p - 2) * 180) / p;
/* Was passiert, wenn q regelmäßige p-Ecke an einer Ecke zusammenkommen? */
export function eckenArt(p, q) {
  const S = q * innenwinkel(p);
  if (q < 3) return "zuwenig";
  if (Math.abs(S - 360) < 1e-9) return "flach";
  return S < 360 ? "ecke" : "ueber";
}
/* Alle Paare (p, q) mit p, q ≥ 3, die eine Ecke ergeben – das sind genau die fünf */
export function moeglichePaare(pMax = 20, qMax = 20) {
  const aus = [];
  for (let p = 3; p <= pMax; p++) for (let q = 3; q <= qMax; q++) if (eckenArt(p, q) === "ecke") aus.push([p, q]);
  return aus;
}

/* ---------- Die fünf Körper ---------- */
function ecken(id) {
  const s = [1, -1], g = 1 / PHI, P = PHI;
  const v = [];
  if (id === "tetraeder") v.push([1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]);
  if (id === "wuerfel" || id === "dodekaeder") for (const a of s) for (const b of s) for (const c of s) v.push([a, b, c]);
  if (id === "oktaeder") v.push([1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]);
  if (id === "ikosaeder") for (const a of s) for (const b of s) v.push([0, a, b * P], [a, b * P, 0], [b * P, 0, a]);
  if (id === "dodekaeder") for (const a of s) for (const b of s) v.push([0, a * g, b * P], [a * g, b * P, 0], [b * P, 0, a * g]);
  return v.map(einheit);                                   // Umkugelradius 1
}

/* Flächen eines konvexen Körpers: Ebenen durch drei Ecken, auf deren einer Seite alle anderen liegen.
   Die Ecken jeder Fläche werden gegen den Uhrzeigersinn sortiert (von außen gesehen). */
export function flaechenAus(v, eps = 1e-7) {
  const gesehen = new Set(), fl = [];
  for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) for (let k = j + 1; k < v.length; k++) {
    let n = kreuz(minus(v[j], v[i]), minus(v[k], v[i]));
    if (laenge(n) < eps) continue;
    n = einheit(n);
    const d = skalar(n, v[i]);
    const abst = v.map((w) => skalar(n, w) - d);
    if (abst.every((a) => a <= eps)) { /* richtige Seite */ } else if (abst.every((a) => a >= -eps)) n = mal(n, -1); else continue;
    const auf = v.map((_, m) => m).filter((m) => Math.abs(abst[m]) <= eps);
    const schl = auf.join(",");
    if (gesehen.has(schl)) continue;
    gesehen.add(schl);
    const c = mitte(auf.map((m) => v[m]));
    const u = einheit(minus(v[auf[0]], c)), w = kreuz(n, u);
    auf.sort((a, b) => Math.atan2(skalar(minus(v[a], c), w), skalar(minus(v[a], c), u)) - Math.atan2(skalar(minus(v[b], c), w), skalar(minus(v[b], c), u)));
    fl.push(auf);
  }
  return fl;
}
export function kantenAus(fl) {
  const m = new Map();
  fl.forEach((f, fi) => f.forEach((a, i) => {
    const b = f[(i + 1) % f.length], schl = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!m.has(schl)) m.set(schl, { a: Math.min(a, b), b: Math.max(a, b), flaechen: [] });
    m.get(schl).flaechen.push(fi);
  }));
  return [...m.values()];
}

const DATEN = [
  { id: "tetraeder", name: "Tetraeder", p: 3, q: 3, farbe: "#D4145A", dual: "tetraeder", wuerfel: "W4", element: "Feuer" },
  { id: "wuerfel", name: "Würfel", p: 4, q: 3, farbe: "#1E6BC0", dual: "oktaeder", wuerfel: "W6", element: "Erde", auch: "Hexaeder" },
  { id: "oktaeder", name: "Oktaeder", p: 3, q: 4, farbe: "#1E9C78", dual: "wuerfel", wuerfel: "W8", element: "Luft" },
  { id: "dodekaeder", name: "Dodekaeder", p: 5, q: 3, farbe: "#D49A00", dual: "ikosaeder", wuerfel: "W12", element: "Himmel" },
  { id: "ikosaeder", name: "Ikosaeder", p: 3, q: 5, farbe: "#7B4FA0", dual: "dodekaeder", wuerfel: "W20", element: "Wasser" },
];
export const KOERPER = DATEN.map((d) => {
  const v = ecken(d.id), fl = flaechenAus(v), ka = kantenAus(fl);
  const normalen = fl.map((f) => einheit(mitte(f.map((i) => v[i]))));
  return { ...d, ecken: v, flaechen: fl, kanten: ka, normalen, e: v.length, k: ka.length, f: fl.length,
    flaechenName: NECKE[d.p], flaecheName: NECK[d.p], schlaefli: `{${d.p}, ${d.q}}` };
});
export const koerper = (id) => KOERPER.find((k) => k.id === id) || KOERPER[1];

/* Dualkörper: Flächenmitten werden Ecken, benachbarte Flächen werden durch eine Kante verbunden */
export function dualVon(k) {
  const ecken = k.flaechen.map((f) => mitte(f.map((i) => k.ecken[i])));
  const kanten = k.kanten.map((ka) => ({ a: ka.flaechen[0], b: ka.flaechen[1] }));
  return { ecken, kanten };
}
/* Winkeldefizit an einer Ecke (360° minus Winkelsumme) – zusammen immer 720° (Descartes) */
export const defizit = (k) => 360 - k.q * innenwinkel(k.p);

/* ---------- Drehen und Projizieren ---------- */
export const EINS = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
export const matMal = (A, B) => A.map((z) => [0, 1, 2].map((j) => z[0] * B[0][j] + z[1] * B[1][j] + z[2] * B[2][j]));
export const matVek = (A, v) => [skalar(A[0], v), skalar(A[1], v), skalar(A[2], v)];
export const rotX = (w) => { const c = Math.cos(w), s = Math.sin(w); return [[1, 0, 0], [0, c, -s], [0, s, c]]; };
export const rotY = (w) => { const c = Math.cos(w), s = Math.sin(w); return [[c, 0, s], [0, 1, 0], [-s, 0, c]]; };
export const rotZ = (w) => { const c = Math.cos(w), s = Math.sin(w); return [[c, -s, 0], [s, c, 0], [0, 0, 1]]; };
/* Spalten wieder senkrecht und auf Länge 1 (gegen Rundungsdrift beim langen Ziehen) */
function ortho(R) {
  const a = einheit([R[0][0], R[1][0], R[2][0]]);
  let b = [R[0][1], R[1][1], R[2][1]];
  b = einheit(minus(b, mal(a, skalar(a, b))));
  const c = kreuz(a, b);
  return [[a[0], b[0], c[0]], [a[1], b[1], c[1]], [a[2], b[2], c[2]]];
}
/* Ziehen auf dem Bildschirm: nach rechts dreht um die senkrechte Achse, nach unten kippt die Oberseite nach vorn */
export const drehe = (R, dx, dy) => ortho(matMal(matMal(rotY(dx), rotX(dy)), R));
export const START_DREHUNG = matMal(rotX(0.42), rotY(-0.62));
/* Netz liegt in der Ebene z = 0: von schräg vorn oben betrachten, gefaltet wird zum Betrachter hin */
export const NETZ_START = matMal(rotX(-0.95), rotZ(0.3));

/* Gefaltetes Netz projizieren: auf die eigene Mitte zentriert und auf eine feste Größe gebracht,
   damit es beim Falten im Bild bleibt. Beide Seiten einer Fläche sind sichtbar (innen = Oberseite des Netzes). */
export function projiziereNetz(netz, t, R, opt = {}) {
  const d = opt.d ?? 5;
  const g = falte(netz, t);
  const m = mitte(g.flat());
  const r = Math.max(...g.flat().map((p) => laenge(minus(p, m)))) || 1;
  const flaechen = g.map((poly, i) => {
    const v = poly.map((p) => matVek(R, mal(minus(p, m), 1 / r)));
    const c = mitte(v);
    const n = einheit(kreuz(minus(v[1], v[0]), minus(v[2], v[0])));
    const oben = skalar(n, minus([0, 0, d], c)) > 0;
    return { i, punkte: v.map((p) => bildpunkt(p, opt)), tiefe: c[2], oben, licht: Math.abs(skalar(n, LICHT)) };
  });
  return flaechen.sort((a, b) => a.tiefe - b.tiefe);
}

/* Punkt → Bildpunkt. Bildschirm: x nach rechts, y nach unten; z zeigt zum Betrachter (leichte Perspektive). */
export function bildpunkt(v, { cx = 180, cy = 150, s = 100, d = 5 } = {}) {
  const f = d / (d - v[2]);
  return [cx + s * v[0] * f, cy - s * v[1] * f];
}
const LICHT = einheit([-0.45, 0.65, 1]);
export const licht = (n) => Math.max(0, skalar(n, LICHT));
/* Projektion eines Körpers: Flächen von hinten nach vorn sortiert, Kanten mit „verdeckt“ */
export function projiziere(k, R, opt = {}) {
  const d = opt.d ?? 5;
  const v = k.ecken.map((p) => matVek(R, p));
  const bild = v.map((p) => bildpunkt(p, opt));
  const flaechen = k.flaechen.map((f, i) => {
    const n = matVek(R, k.normalen[i]), c = mitte(f.map((j) => v[j]));
    const sichtbar = skalar(n, minus([0, 0, d], c)) > 0;
    return { i, punkte: f.map((j) => bild[j]), tiefe: c[2], sichtbar, licht: licht(n) };
  }).sort((a, b) => a.tiefe - b.tiefe);
  const sicht = new Map(flaechen.map((f) => [f.i, f.sichtbar]));
  const kanten = k.kanten.map((ka, i) => ({ i, a: bild[ka.a], b: bild[ka.b], verdeckt: !ka.flaechen.some((fi) => sicht.get(fi)), tiefe: (v[ka.a][2] + v[ka.b][2]) / 2 }));
  return { flaechen, kanten, ecken: bild.map((b, i) => ({ i, x: b[0], y: b[1], z: v[i][2] })) };
}
/* Farbe abschattieren: hell in [0, 1] → von dunkel (Schatten) über die Grundfarbe zu einem hellen Glanz */
export function schattiere(hex, hell) {
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const f = 0.5 + 0.62 * hell, glanz = Math.max(0, hell - 0.82) * 2.4;
  const g = c.map((x) => Math.round(Math.min(255, x * f + (255 - x * f) * glanz)));
  return `rgb(${g[0]},${g[1]},${g[2]})`;
}
export const punkteText = (pts) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

/* ---------- Netze falten ---------- */
/* Drehung eines Punktes um die Achse durch a mit Richtung u (Einheitsvektor) um den Winkel w (Rodrigues) */
function drehUm(pnt, a, u, w) {
  const v = minus(pnt, a), c = Math.cos(w), s = Math.sin(w);
  return plus(a, plus(plus(mal(v, c), mal(kreuz(u, v), s)), mal(u, skalar(u, v) * (1 - c))));
}
const gleich2 = (p, q, eps = 1e-6) => Math.abs(p[0] - q[0]) < eps && Math.abs(p[1] - q[1]) < eps;

/* Netz aus ebenen Vielecken (gegen den Uhrzeigersinn). Benachbart = gemeinsame Kante.
   Baum per Breitensuche ab der Wurzel; Faltwinkel = 180° − Flächenwinkel des Körpers. */
export function netzAus(polygone, faltwinkel, wurzel = 0) {
  const n = polygone.length;
  const nachbar = (i, j) => {
    const A = polygone[i], B = polygone[j];
    for (let x = 0; x < A.length; x++) {
      const a = A[x], b = A[(x + 1) % A.length];
      for (let y = 0; y < B.length; y++) if (gleich2(a, B[(y + 1) % B.length]) && gleich2(b, B[y])) return [a, b];
    }
    return null;
  };
  const baum = Array.from({ length: n }, () => null);
  baum[wurzel] = { eltern: -1 };
  const schlange = [wurzel];
  while (schlange.length) {
    const i = schlange.shift();
    for (let j = 0; j < n; j++) {
      if (baum[j]) continue;
      const kante = nachbar(i, j);
      if (kante) { baum[j] = { eltern: i, a: kante[0], b: kante[1] }; schlange.push(j); }
    }
  }
  return { polygone, baum, faltwinkel, zusammenhaengend: baum.every(Boolean) };
}
/* Gefaltetes Netz bei Fortschritt t ∈ [0, 1]: Liste der Vielecke im Raum (anfangs in der Ebene z = 0, Falten nach +z) */
export function falte(netz, t) {
  const w = netz.faltwinkel * Math.max(0, Math.min(1, t));
  const kette = (i) => { const k = []; for (let j = i; j >= 0 && netz.baum[j] && netz.baum[j].eltern >= 0; j = netz.baum[j].eltern) k.push(j); return k; };
  return netz.polygone.map((poly, i) => {
    const glieder = kette(i);
    return poly.map(([x, y]) => {
      let p = [x, y, 0];
      for (const j of glieder) {
        const { a, b } = netz.baum[j];
        const A = [a[0], a[1], 0], u = einheit([b[0] - a[0], b[1] - a[1], 0]);
        const m = mitte(netz.polygone[j].map(([px, py]) => [px, py, 0]));
        const seite = Math.sign(u[0] * (m[1] - A[1]) - u[1] * (m[0] - A[0])) || 1;   // Fläche hebt sich immer nach +z
        p = drehUm(p, A, u, seite * w);
      }
      return p;
    });
  });
}
const FW_WUERFEL = Math.PI / 2, FW_TETRA = Math.PI - Math.acos(1 / 3);
/* Würfelnetz aus Gitterzellen [x, y] */
export const quadrateAus = (zellen) => zellen.map(([x, y]) => [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]]);
const zentralste = (zellen) => {
  const grad = zellen.map(([x, y]) => zellen.filter(([u, w]) => Math.abs(u - x) + Math.abs(w - y) === 1).length);
  return grad.indexOf(Math.max(...grad));
};
export const wuerfelNetz = (zellen) => netzAus(quadrateAus(zellen), FW_WUERFEL, zentralste(zellen));
const H3 = Math.sqrt(3) / 2;
export const NETZE = {
  wuerfel: [
    { id: "kreuz", name: "Kreuz", zellen: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [1, 3]] },
    { id: "treppe", name: "Treppe", zellen: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]] },
    { id: "dreidrei", name: "3 + 3", zellen: [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]] },
  ],
  tetraeder: [
    { id: "dreieck", name: "Dreieck", polygone: [[[0.5, H3], [1, 0], [1.5, H3]], [[0, 0], [1, 0], [0.5, H3]], [[1, 0], [2, 0], [1.5, H3]], [[0.5, H3], [1.5, H3], [1, 2 * H3]]], wurzel: 0 },
    { id: "streifen", name: "Streifen", polygone: [[[0, 0], [1, 0], [0.5, H3]], [[1, 0], [1.5, H3], [0.5, H3]], [[1, 0], [2, 0], [1.5, H3]], [[2, 0], [2.5, H3], [1.5, H3]]], wurzel: 1 },
  ],
};
export function netzFuer(koerperId, netzId) {
  const liste = NETZE[koerperId];
  if (!liste) return null;
  const n = liste.find((x) => x.id === netzId) || liste[0];
  return koerperId === "wuerfel" ? { ...n, netz: wuerfelNetz(n.zellen) } : { ...n, netz: netzAus(n.polygone, FW_TETRA, n.wurzel) };
}
/* Fertig gefaltet: verschiedene Flächenmitten und Ecken zählen; zwei gleiche Mitten = Flächen liegen aufeinander */
export function faltErgebnis(netz) {
  const g = falte(netz, 1);
  const mitten = g.map(mitte);
  const doppelt = [];
  mitten.forEach((m, i) => mitten.forEach((w, j) => { if (j > i && laenge(minus(m, w)) < 1e-6) doppelt.push([i, j]); }));
  const pkt = [];
  g.flat().forEach((p) => { if (!pkt.some((q) => laenge(minus(p, q)) < 1e-6)) pkt.push(p); });
  return { flaechen: g, doppelt, ecken: pkt.length };
}

/* ---------- Hexominos: welche sind Würfelnetze? ---------- */
const norm = (z) => {
  const mx = Math.min(...z.map((c) => c[0])), my = Math.min(...z.map((c) => c[1]));
  return z.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
};
const SYM = [([x, y]) => [x, y], ([x, y]) => [-y, x], ([x, y]) => [-x, -y], ([x, y]) => [y, -x],
  ([x, y]) => [-x, y], ([x, y]) => [y, x], ([x, y]) => [x, -y], ([x, y]) => [-y, -x]];
const schluessel = (z) => norm(z).map((c) => c.join(":")).join(" ");
const kanonisch = (z) => SYM.map((f) => schluessel(z.map(f))).sort()[0];
export const lageVon = (zellen, nr) => norm(zellen.map(SYM[((nr % 8) + 8) % 8]));
let HEXO = null;
export function hexominos() {
  if (HEXO) return HEXO;
  let stufe = new Map([[kanonisch([[0, 0]]), [[0, 0]]]]);
  for (let n = 2; n <= 6; n++) {
    const neu = new Map();
    for (const z of stufe.values()) for (const [x, y] of z) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c = [x + dx, y + dy];
      if (z.some((w) => w[0] === c[0] && w[1] === c[1])) continue;
      const z2 = [...z, c], k = kanonisch(z2);
      if (!neu.has(k)) neu.set(k, norm(z2));
    }
    stufe = neu;
  }
  HEXO = [...stufe.values()].map((zellen) => ({ zellen, ...netzPruefung(zellen) }));
  return HEXO;
}
const hat = (z, x, y) => z.some((c) => c[0] === x && c[1] === y);
export function netzPruefung(zellen) {
  const { doppelt } = faltErgebnis(wuerfelNetz(zellen));
  const block = zellen.some(([x, y]) => hat(zellen, x + 1, y) && hat(zellen, x, y + 1) && hat(zellen, x + 1, y + 1));
  const reihe = zellen.some(([x, y]) => [1, 2, 3, 4].every((i) => hat(zellen, x + i, y)) || [1, 2, 3, 4].every((i) => hat(zellen, x, y + i)));
  return { istNetz: doppelt.length === 0, doppelt, grund: doppelt.length === 0 ? null : block ? "block" : reihe ? "reihe" : "ueberlappung" };
}

/* ---------- Ecke schließen: q regelmäßige p-Ecke um eine Ecke ----------
   Die Kanten an der Spitze zeigen in Richtung d_j = (sin β · cos φ_j, −cos β, sin β · sin φ_j) (y zeigt nach oben).
   s = 0: alle in der Ebene, nebeneinander (Lücke von 360° − q · α); s = 1: Lücke geschlossen.
   Der Winkel zwischen benachbarten Kanten bleibt immer α – die Flächen werden nur gekippt, nie verbogen. */
export function eckeOeffnung(p, q, s) {
  const a = (innenwinkel(p) * Math.PI) / 180;
  const ziel = (2 * Math.PI) / q;
  const geht = ziel > a + 1e-9;
  const D = geht ? a + s * (ziel - a) : a;
  const sin2 = geht ? Math.min(1, (1 - Math.cos(a)) / (1 - Math.cos(D))) : 1;
  const beta = Math.asin(Math.sqrt(sin2));
  return { alpha: a, D, beta, geht };
}
export function eckeFlaechen(p, q, s, L = 1) {
  const { alpha, D, beta } = eckeOeffnung(p, q, s);
  const richt = (j) => [Math.sin(beta) * Math.cos(j * D), -Math.cos(beta), Math.sin(beta) * Math.sin(j * D)];
  const aussen = (2 * Math.PI) / p;
  const flaechen = [];
  for (let j = 0; j < q; j++) {
    const e1 = richt(j), d2 = richt(j + 1);
    const e2 = einheit(minus(d2, mal(e1, skalar(d2, e1))));
    const pts = [[0, 0, 0]];
    let x = 0, y = 0, w = 0;
    for (let i = 1; i < p; i++) {
      x += L * Math.cos(w); y += L * Math.sin(w); w += aussen;
      pts.push(plus(mal(e1, x), mal(e2, y)));
    }
    flaechen.push(pts);
  }
  return { flaechen, alpha, beta };
}

/* ======================================================================
   Aufgaben-Generatoren
   ====================================================================== */
export const ARTEN = [
  { id: "winkel", name: "Passt die Ecke?" },
  { id: "zaehlen", name: "Ecken und Kanten zählen" },
  { id: "euler", name: "Euler: die fehlende Zahl" },
  { id: "netz", name: "Würfelnetz oder nicht?" },
];

/* ---------- 1 · Winkel an einer Ecke ---------- */
const WINKEL_POOL = {
  1: { p: [3, 4, 6], q: [3, 4] },
  2: { p: [3, 4, 5, 6], q: [3, 4, 5, 6] },
  3: { p: [3, 4, 5, 6, 8, 10, 12], q: [3, 4, 5] },
  4: { p: [5, 6, 7, 8, 9, 10, 12], q: [3, 4] },
  5: { p: [3, 5, 7, 9, 11], q: [3, 4, 5] },
};
export const ARTNAME = { ecke: "Ecke möglich", flach: "liegt flach (360°)", ueber: "geht nicht (über 360°)" };
function winkelAufgabe(s, zufall) {
  const { p: ps, q: qs } = WINKEL_POOL[s];
  const paare = { ecke: [], flach: [], ueber: [] };
  for (const p of ps) for (const q of qs) paare[eckenArt(p, q)].push([p, q]);
  const klassen = Object.keys(paare).filter((k) => paare[k].length);
  const [p, q] = wahl(paare[wahl(klassen, zufall)], zufall);
  const alpha = innenwinkel(p), S = q * alpha;
  return { art: "winkel", p, q, alpha, S, ergebnis: eckenArt(p, q) };
}

/* ---------- 2 · Zählen mit Doppelzählung ---------- */
const PLATON_ZAEHLEN = [
  { name: "Tetraeder", teile: [[4, 3]], q: 3 }, { name: "Würfel", teile: [[6, 4]], q: 3 }, { name: "Oktaeder", teile: [[8, 3]], q: 4 },
  { name: "Dodekaeder", teile: [[12, 5]], q: 3 }, { name: "Ikosaeder", teile: [[20, 3]], q: 5 },
];
const prisma = (n) => ({ name: `${n}-seitiges Prisma`, teile: [[2, n], [n, 4]], q: 3, hinweis: "Die Seitenflächen sind Quadrate (bzw. Rechtecke)." });
const antiprisma = (n) => ({ name: `${n}-seitiges Antiprisma`, teile: [[2, n], [2 * n, 3]], q: 4, hinweis: "Zwei gegeneinander verdrehte n-Ecke, dazwischen ein Band aus Dreiecken." });
const ARCHIMEDISCH = [
  { name: "abgestumpftes Tetraeder", teile: [[4, 3], [4, 6]], q: 3 },
  { name: "Kuboktaeder", teile: [[8, 3], [6, 4]], q: 4 },
  { name: "abgestumpfter Würfel", teile: [[8, 3], [6, 8]], q: 3 },
  { name: "abgestumpftes Oktaeder", teile: [[6, 4], [8, 6]], q: 3 },
  { name: "Ikosidodekaeder", teile: [[20, 3], [12, 5]], q: 4 },
];
const SCHWER = [
  { name: "Fußball (abgestumpftes Ikosaeder)", teile: [[12, 5], [20, 6]], q: 3 },
  { name: "Rhombenkuboktaeder", teile: [[8, 3], [18, 4]], q: 4 },
  { name: "abgestumpftes Dodekaeder", teile: [[20, 3], [12, 10]], q: 3 },
  { name: "Rhombenikosidodekaeder", teile: [[20, 3], [30, 4], [12, 5]], q: 4 },
];
export const ZAEHL_KOERPER = { PLATON_ZAEHLEN, ARCHIMEDISCH, SCHWER, prisma, antiprisma };
function zaehlAufgabe(s, zufall) {
  let kz;
  if (s === 1) kz = wahl(PLATON_ZAEHLEN, zufall);
  else if (s === 2) kz = zufall(0, 2) ? wahl(PLATON_ZAEHLEN, zufall) : prisma(zufall(5, 9));
  else if (s === 3) kz = zufall(0, 1) ? antiprisma(zufall(4, 9)) : wahl([prisma(zufall(10, 15)), ...ARCHIMEDISCH.slice(0, 2)], zufall);
  else if (s === 4) kz = wahl([...ARCHIMEDISCH, antiprisma(zufall(10, 15))], zufall);
  else kz = wahl(SCHWER, zufall);
  const summe = kz.teile.reduce((a, [anz, p]) => a + anz * p, 0);
  const f = kz.teile.reduce((a, [anz]) => a + anz, 0);
  return { art: "zaehlen", ...kz, f, summe, k: summe / 2, e: summe / kz.q };
}
export const neck = (p) => NECK[p] || `${p}-Eck`;
export const necke = (p) => NECKE[p] || `${p}-Ecke`;
/* „aus 12 Fünfecken und 20 Sechsecken“ (Dativ Plural) */
export const teileText = (teile) => teile.map(([anz, p]) => `${anz} ${necke(p)}n`).join(", ").replace(/, ([^,]*)$/, " und $1");

/* ---------- 3 · Eulerscher Polyedersatz ---------- */
const pyramide = (n) => ({ name: `${n}-seitige Pyramide`, e: n + 1, k: 2 * n, f: n + 1 });
const prismaEkf = (n) => ({ name: `${n}-seitiges Prisma`, e: 2 * n, k: 3 * n, f: n + 2 });
const doppelpyramide = (n) => ({ name: `${n}-seitige Doppelpyramide`, e: n + 2, k: 3 * n, f: 2 * n });
const antiprismaEkf = (n) => ({ name: `${n}-seitiges Antiprisma`, e: 2 * n, k: 4 * n, f: 2 * n + 2 });
const ekf = (z) => { const f = z.teile.reduce((a, [anz]) => a + anz, 0), sum = z.teile.reduce((a, [anz, p]) => a + anz * p, 0); return { name: z.name, e: sum / z.q, k: sum / 2, f }; };
const UMGEBAUT = [
  { name: "Würfel, von dem eine Ecke glatt abgeschnitten wurde", e: 10, k: 15, f: 7 },
  { name: "Würfel mit einer aufgesetzten Pyramide auf einer Fläche", e: 9, k: 16, f: 9 },
  { name: "Tetraeder, von dem alle vier Ecken abgeschnitten wurden", e: 12, k: 18, f: 8 },
  { name: "Oktaeder mit einer aufgesetzten Pyramide auf einer Dreiecksfläche", e: 7, k: 15, f: 10 },
  { name: "Würfel, von dem zwei gegenüberliegende Ecken abgeschnitten wurden", e: 12, k: 18, f: 8 },
];
export const EULER_KOERPER = { pyramide, prismaEkf, doppelpyramide, antiprismaEkf, UMGEBAUT };
function eulerAufgabe(s, zufall) {
  let kz;
  if (s === 1) kz = zufall(0, 1) ? (({ name, e, k, f }) => ({ name, e, k, f }))(wahl(KOERPER, zufall)) : wahl([pyramide(zufall(3, 6)), prismaEkf(zufall(3, 6))], zufall);
  else if (s === 2) kz = wahl([pyramide(zufall(5, 9)), prismaEkf(zufall(5, 9)), doppelpyramide(zufall(3, 6))], zufall);
  else if (s === 3) kz = wahl([pyramide(zufall(10, 20)), prismaEkf(zufall(10, 20)), doppelpyramide(zufall(6, 12)), antiprismaEkf(zufall(4, 10))], zufall);
  else if (s === 4) kz = ekf(wahl([...ARCHIMEDISCH, ...SCHWER], zufall));
  else kz = wahl(UMGEBAUT, zufall);
  const gesucht = s === 1 ? wahl(["e", "f"], zufall) : wahl(["e", "k", "f"], zufall);
  return { art: "euler", name: kz.name, e: kz.e, k: kz.k, f: kz.f, gesucht };
}

/* ---------- 4 · Würfelnetz oder nicht? ---------- */
function netzAufgabe(s, zufall) {
  const alle = hexominos();
  const netze = alle.filter((h) => h.istNetz);
  const keine = alle.filter((h) => !h.istNetz && (s >= 3 || h.grund !== "ueberlappung"));
  const h = zufall(0, 1) ? wahl(netze, zufall) : wahl(keine, zufall);
  const zellen = lageVon(h.zellen, zufall(0, 7));
  const pr = netzPruefung(zellen);
  return { art: "netz", zellen, istNetz: pr.istNetz, grund: pr.grund, doppelt: pr.doppelt };
}

export function aufgabe(art, stufe, zufall = zz) {
  const s = stufeIn(stufe);
  if (art === "winkel") return winkelAufgabe(s, zufall);
  if (art === "zaehlen") return zaehlAufgabe(s, zufall);
  if (art === "euler") return eulerAufgabe(s, zufall);
  return netzAufgabe(s, zufall);
}

const GROESSE = { e: "Ecken", k: "Kanten", f: "Flächen" };
export function auftrag(a) {
  if (a.art === "winkel") return `An einer Ecke sollen ${a.q} regelmäßige ${necke(a.p)} zusammenkommen. Wie groß ist ein Innenwinkel, wie groß die Winkelsumme an der Ecke – und entsteht so eine Ecke eines Körpers?`;
  if (a.art === "zaehlen") return `Ein ${a.name} besteht aus ${teileText(a.teile)}. An jeder Ecke treffen sich ${a.q} Flächen. Wie viele Kanten und wie viele Ecken hat der Körper?`;
  if (a.art === "euler") {
    const bek = ["e", "k", "f"].filter((x) => x !== a.gesucht).map((x) => `${a[x]} ${GROESSE[x]}`).join(" und ");
    return `${a.name.charAt(0).toUpperCase()}${a.name.slice(1)}: Der Körper hat ${bek}. Wie viele ${GROESSE[a.gesucht]} hat er?`;
  }
  return "Lässt sich diese Figur aus sechs Quadraten zu einem Würfel falten – ohne Lücke und ohne dass zwei Flächen aufeinanderliegen?";
}
/* Eingabefelder: [schlüssel, Beschriftung, Einheit] */
export function felder(a) {
  if (a.art === "winkel") return [["alpha", "α", "°"], ["S", "Summe", "°"]];
  if (a.art === "zaehlen") return [["k", "k", "Kanten"], ["e", "e", "Ecken"]];
  if (a.art === "euler") return [[a.gesucht, a.gesucht, GROESSE[a.gesucht]]];
  return [];
}
export function aufgabeTex(a) {
  if (a.art === "winkel") return `p = ${a.p}, \\quad q = ${a.q}`;
  if (a.art === "zaehlen") return `f = ${a.f}, \\quad q = ${a.q}`;
  if (a.art === "euler") return ["e", "k", "f"].map((x) => (x === a.gesucht ? `${x} = \\,?` : `${x} = ${a[x]}`)).join(", \\quad ");
  return "";
}

/* Prüfen. winkel: { alpha, S, wahl }; zaehlen: { k, e }; euler: { [gesucht] }; netz: true/false */
export function pruefe(a, ein) {
  if (a.art === "netz") {
    const ok = ein === a.istNetz;
    let grund = "";
    if (!ok && a.istNetz) grund = "Doch – es ist ein Würfelnetz. Nimm ein Quadrat als Boden und klappe die anderen der Reihe nach hoch: Jede Fläche findet ihren eigenen Platz. Mit dem Regler unten kannst du es falten.";
    if (!ok && !a.istNetz) grund = grundText(a.grund);
    return { ok, grund };
  }
  const fe = {};
  let grund = "";
  if (a.art === "winkel") {
    const al = lies(ein.alpha), S = lies(ein.S);
    fe.alpha = nah(al, a.alpha, 0.011);
    fe.S = nah(S, a.S, 0.021);
    fe.wahl = ein.wahl === a.ergebnis;
    if (!fe.alpha && al !== null) {
      if (nah(al, (a.p - 2) * 180, 0.5)) grund = `${dk(al)}° ist die Winkelsumme im ganzen ${neck(a.p)}. Ein einzelner Winkel ist der n-te Teil davon: (n − 2) · 180° geteilt durch n.`;
      else if (nah(al, 360 / a.p, 0.05)) grund = `${dk(al)}° = 360° : ${a.p} ist der Mittelpunktswinkel. Der Innenwinkel ist 180° minus diesen Winkel.`;
      else if (nah(al, 180 / a.p, 0.05) || nah(al, ((a.p - 2) * 180) / (a.p - 1), 0.05)) grund = "Die Winkelsumme im n-Eck ist (n − 2) · 180°, und sie verteilt sich auf n gleich große Winkel.";
      else grund = "Zerlege das n-Eck von einer Ecke aus in n − 2 Dreiecke: Winkelsumme (n − 2) · 180°, geteilt durch n Winkel.";
    } else if (fe.alpha && !fe.S && S !== null) grund = `An der Ecke liegen ${a.q} Winkel von je ${dk(a.alpha)}° – multipliziere.`;
    else if (fe.alpha && fe.S && !fe.wahl) {
      if (ein.wahl === "ecke" && a.ergebnis === "flach") grund = "Genau 360° heißt: Die Flächen füllen die Ebene rund um den Punkt lückenlos aus – sie liegen flach wie ein Fliesenmuster. Eine Ecke, die aus der Ebene herausragt, entsteht so nicht.";
      else if (ein.wahl === "ecke" && a.ergebnis === "ueber") grund = "Mehr als 360° passt nicht um einen Punkt: Die Flächen müssten sich überlappen oder wellen. Bei einem konvexen Körper geht das nicht.";
      else if (a.ergebnis === "ecke") grund = `Unter 360° bleibt eine Lücke von ${dk(360 - a.S)}°. Klebt man die Lücke zu, klappen die Flächen aus der Ebene hoch – genau so entsteht eine Ecke.`;
      else if (a.ergebnis === "flach") grund = "Die Summe ist genau 360° – nicht mehr und nicht weniger. Dann liegen die Flächen flach.";
      else grund = "Die Summe ist größer als 360° – das ist zu viel für eine Ecke.";
    }
    if (!grund && !fe.wahl && ein.wahl) grund = "Vergleiche die Winkelsumme mit 360°: kleiner → Ecke, gleich → flach, größer → geht nicht.";
  }
  if (a.art === "zaehlen") {
    const k = lies(ein.k), e = lies(ein.e);
    fe.k = nah(k, a.k, 0.01); fe.e = nah(e, a.e, 0.01);
    if (!fe.k && k !== null && nah(k, a.summe, 0.01)) grund = `${a.summe} ist die Zahl der Flächenkanten, wenn man jede Fläche einzeln zählt. Jede Kante gehört aber zu zwei Flächen und wurde doppelt gezählt – teile durch 2.`;
    else if (!fe.e && e !== null && nah(e, a.summe, 0.01)) grund = `${a.summe} zählt jede Ecke so oft, wie Flächen an ihr liegen. An jeder Ecke liegen ${a.q} Flächen – teile durch ${a.q}.`;
    else if (!fe.e && e !== null && nah(e, a.summe / 2, 0.01)) grund = `Bei den Ecken wird nicht durch 2 geteilt, sondern durch die Zahl der Flächen an einer Ecke, hier ${a.q}.`;
    else if (!fe.k || !fe.e) grund = `Zähle zuerst alle Flächenkanten zusammen: ${a.teile.map(([anz, p]) => `${anz} · ${p}`).join(" + ")}. Dann überlege, wie oft dabei jede Kante und jede Ecke vorkommt.`;
  }
  if (a.art === "euler") {
    const x = a.gesucht, w = lies(ein[x]);
    fe[x] = nah(w, a[x], 0.01);
    if (!fe[x] && w !== null) {
      const { e, k, f } = a;
      const falsch = { e: [[k + f - 2, "2"], [2 - k + f, "v"], [k - f - 2, "2"], [2 + k + f, "v"]],
        k: [[e + f + 2, "2"], [e - f + 2, "v"], [f - e + 2, "v"], [2 - e - f, "v"], [e - f - 2, "v"]],
        f: [[2 + e - k, "v"], [e + k - 2, "v"], [k - e - 2, "2"], [e - k + 2, "v"]] }[x];
      const tr = falsch.find(([z]) => z === w && z !== a[x]);
      if (tr && tr[1] === "2") grund = "Fast: Beim Umstellen ist die 2 auf die falsche Seite geraten. Bring e, k und f in die Gleichung e − k + f = 2 und löse dann Schritt für Schritt nach der gesuchten Größe auf.";
      else if (tr) grund = "Ein Vorzeichen stimmt nicht. Kanten werden abgezogen, Ecken und Flächen addiert: e − k + f = 2.";
      else grund = "Setze die beiden bekannten Zahlen in e − k + f = 2 ein und löse nach der dritten auf.";
    }
  }
  return { ok: Object.values(fe).every(Boolean), felder: fe, grund };
}
export function grundText(g) {
  if (g === "block") return "Vier Quadrate treffen sich in einem Punkt: 4 · 90° = 360°. Dort liegen die Flächen flach – an dieser Stelle kann keine Würfelecke entstehen, und beim Falten landen zwei Flächen aufeinander.";
  if (g === "reihe") return "Fünf Quadrate in einer Reihe: Nach vier Faltungen ist man einmal rundherum, und das fünfte Quadrat landet genau auf dem ersten.";
  return "Beim Falten landen zwei Flächen aufeinander (im Bild rot), und dafür bleibt eine andere Seite des Würfels offen.";
}

export function rechenweg(a) {
  if (a.art === "winkel") {
    const z = [`\\alpha = \\frac{(${a.p} - 2) \\cdot 180°}{${a.p}} = \\frac{${(a.p - 2) * 180}°}{${a.p}}${Number.isInteger(a.alpha) ? "" : " \\approx"} ${Number.isInteger(a.alpha) ? "= " : ""}${dk(a.alpha)}°`];
    z.push(`${a.q} \\cdot ${dk(a.alpha)}° ${Number.isInteger(a.S) ? "=" : "\\approx"} ${dk(a.S)}°`);
    if (a.ergebnis === "ecke") z.push(`${dk(a.S)}° < 360° \\;\\Rightarrow\\; \\text{Lücke von } ${dk(360 - a.S)}° \\text{ – die Flächen klappen zu einer Ecke hoch}`);
    else if (a.ergebnis === "flach") z.push(`\\text{genau } 360° \\;\\Rightarrow\\; \\text{die Flächen liegen flach – keine Ecke}`);
    else z.push(`${dk(a.S)}° > 360° \\;\\Rightarrow\\; \\text{die Flächen würden sich überlappen – keine Ecke}`);
    return z;
  }
  if (a.art === "zaehlen") {
    const glieder = a.teile.map(([anz, p]) => `${anz} \\cdot ${p}`).join(" + ");
    const zs = a.teile.length > 1 ? `${glieder} = ${a.summe}` : `${glieder} = ${a.summe}`;
    return [
      `\\text{Flächenkanten einzeln gezählt: } ${zs}`,
      `k = \\frac{${a.summe}}{2} = ${a.k} \\quad \\text{(jede Kante gehört zu zwei Flächen)}`,
      `e = \\frac{${a.summe}}{${a.q}} = ${a.e} \\quad \\text{(an jeder Ecke liegen ${a.q} Flächen)}`,
      `\\text{Probe: } e - k + f = ${a.e} - ${a.k} + ${a.f} = 2`,
    ];
  }
  if (a.art === "euler") {
    const { e, k, f } = a;
    const z = [`e - k + f = 2`];
    if (a.gesucht === "e") z.push(`e = 2 + k - f = 2 + ${k} - ${f} = ${e}`);
    if (a.gesucht === "k") z.push(`k = e + f - 2 = ${e} + ${f} - 2 = ${k}`);
    if (a.gesucht === "f") z.push(`f = 2 - e + k = 2 - ${e} + ${k} = ${f}`);
    z.push(`\\text{Probe: } ${e} - ${k} + ${f} = 2`);
    return z;
  }
  return [];
}
export function tipp(a) {
  if (a.art === "winkel") return "Innenwinkel eines regelmäßigen n-Ecks: (n − 2) · 180° geteilt durch n. Dann mal die Zahl der Flächen an der Ecke und mit 360° vergleichen.";
  if (a.art === "zaehlen") return "Zähle alle Kanten aller Flächen zusammen. Jede Kante kommt dabei zweimal vor, jede Ecke so oft, wie Flächen an ihr liegen.";
  if (a.art === "euler") return "Eulerscher Polyedersatz: Ecken minus Kanten plus Flächen ergibt 2.";
  return "Wähle ein Quadrat als Boden und klappe die Nachbarn hoch. Achte auf vier Quadrate um einen Punkt und auf fünf in einer Reihe.";
}

/* ---------- Begründen: Beweise mit Lücken ---------- */
export const BEGRUENDUNGEN = [
  {
    id: "winkel", titel: "Warum kann es höchstens fünf platonische Körper geben?",
    ziel: "q \\cdot \\alpha_{p} < 360°, \\quad q \\ge 3",
    schritte: [
      { text: "An jeder Ecke eines Körpers treffen sich mindestens …",
        optionen: ["drei Flächen", "zwei Flächen", "vier Flächen"], richtig: 0 },
      { text: "Die Winkel der Flächen an einer Ecke ergeben zusammen …",
        optionen: ["weniger als 360°", "genau 360°", "mehr als 360°"], richtig: 0 },
      { text: "Mindestens drei gleiche Winkel, zusammen unter 360° (bei genau 360° lägen die Flächen flach): Ein einzelner Innenwinkel ist also kleiner als …",
        optionen: ["120°", "90°", "180°"], richtig: 0 },
      { text: "Der Innenwinkel des regelmäßigen p-Ecks ist $\\frac{(p - 2) \\cdot 180°}{p}$: 60°, 90°, 108°, 120°, … Unter 120° liegen nur …",
        optionen: ["Dreieck, Quadrat und Fünfeck", "Dreieck und Quadrat", "alle Vielecke bis zum Zehneck"], richtig: 0 },
      { text: "Dreiecke haben 60°. An eine Ecke passen also …",
        optionen: ["3, 4 oder 5 Dreiecke", "3 bis 6 Dreiecke", "nur 3 Dreiecke"], richtig: 0 },
      { text: "Dreiecke: 180°, 240° und 300° sind kleiner als 360°, sechs Dreiecke ergeben genau 360°. Quadrate (90°) und Fünfecke (108°): An eine Ecke passen …",
        optionen: ["jeweils genau 3", "jeweils 3 oder 4", "4 Quadrate bzw. 3 Fünfecke"], richtig: 0 },
      { text: "Zusammen sind das …",
        optionen: ["höchstens fünf Möglichkeiten", "sechs Möglichkeiten", "unendlich viele Möglichkeiten"], richtig: 0 },
    ],
  },
  {
    id: "euler", titel: "Derselbe Beweis ohne Winkel – nur mit Zählen",
    ziel: "(p - 2)(q - 2) < 4",
    schritte: [
      { text: "Jede der $f$ Flächen hat $p$ Kanten, und jede Kante gehört zu zwei Flächen. Also gilt …",
        optionen: ["$p \\cdot f = 2k$", "$p \\cdot f = k$", "$f = 2k$"], richtig: 0 },
      { text: "An jeder der $e$ Ecken beginnen $q$ Kanten, und jede Kante hat zwei Ecken. Also gilt …",
        optionen: ["$q \\cdot e = 2k$", "$e = q \\cdot k$", "$q \\cdot e = k$"], richtig: 0 },
      { text: "Setzt man $e = \\frac{2k}{q}$ und $f = \\frac{2k}{p}$ in $e - k + f = 2$ ein und teilt durch $2k$, erhält man …",
        optionen: ["$\\frac{1}{q} + \\frac{1}{p} = \\frac{1}{2} + \\frac{1}{k}$", "$\\frac{1}{q} + \\frac{1}{p} = \\frac{1}{k}$", "$\\frac{1}{p} - \\frac{1}{q} = \\frac{1}{2}$"], richtig: 0 },
      { text: "Weil $\\frac{1}{k}$ positiv ist, folgt …",
        optionen: ["$\\frac{1}{p} + \\frac{1}{q} > \\frac{1}{2}$", "$\\frac{1}{p} + \\frac{1}{q} < \\frac{1}{2}$", "$\\frac{1}{p} + \\frac{1}{q} = \\frac{1}{2}$"], richtig: 0 },
      { text: "Mal $2pq$: $2q + 2p > pq$, also $pq - 2p - 2q + 4 < 4$. Das ist …",
        optionen: ["$(p - 2)(q - 2) < 4$", "$(p - 2)(q - 2) > 4$", "$(p + 2)(q + 2) < 4$"], richtig: 0 },
      { text: "Mit $p, q \\ge 3$ sind beide Faktoren mindestens 1. Ihr Produkt ist kleiner als 4 nur für …",
        optionen: ["(3, 3), (3, 4), (4, 3), (3, 5), (5, 3)", "(3, 3) und (4, 4)", "unendlich viele Paare"], richtig: 0 },
    ],
  },
];
/* Reihenfolge der Antworten je Anzeige mischen – die richtige liegt sonst immer vorn */
export function gemischt(optionen, salz = 0) {
  const idx = optionen.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = (i * 7 + salz * 3 + 1) % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}
/* Aus der Zählung: k = 1 / (1/p + 1/q − 1/2) */
export const kantenAusPQ = (p, q) => 1 / (1 / p + 1 / q - 1 / 2);

/* ---------- GFS: Gliederung, Tipps, Kolloquium ---------- */
export const GLIEDERUNG = [
  { min: 2, titel: "Einstieg", text: "Einen Satz Rollenspielwürfel mitbringen (W4, W6, W8, W12, W20) und herumgeben. Frage an die Klasse: Was haben diese fünf gemeinsam – und warum gibt es keinen sechsten Würfel dieser Art?" },
  { min: 3, titel: "Was „regelmäßig“ heißt", text: "Die drei Bedingungen: konvex, alle Flächen deckungsgleiche regelmäßige Vielecke, an jeder Ecke gleich viele Flächen. Gegenbeispiel Doppelpyramide aus sechs gleichseitigen Dreiecken: Flächen gleich, Ecken nicht." },
  { min: 6, titel: "Der Beweis an der Tafel", text: "Innenwinkel (n − 2) · 180° : n. An einer Ecke mindestens drei Flächen, zusammen unter 360°. Dann die Tabelle: Dreiecke 3, 4, 5 – Quadrate 3 – Fünfecke 3 – ab Sechsecken nichts mehr. Ergebnis: höchstens fünf." },
  { min: 5, titel: "Es gibt sie wirklich: Netze, Euler, Dualität", text: "Würfel und Tetraeder aus dem Netz falten. Tabelle mit Ecken, Kanten, Flächen: Immer e − k + f = 2. Würfel und Oktaeder tauschen Ecken und Flächen – Dualität." },
  { min: 2, titel: "Ausblick und Fazit", text: "Fußball, Kristalle, Viren mit Ikosaeder-Hülle. Fazit in einem Satz: Weil an jeder Ecke weniger als 360° Platz ist, gibt es genau fünf regelmäßige Körper." },
];
export const TIPPS = [
  "Bastle die fünf Körper vorher aus Karton und gib sie herum. Würfel und Tetraeder faltest du im Vortrag live aus dem Netz – das bleibt hängen.",
  "Schreib den Beweis als Tabelle an die Tafel: Zeilen für Dreieck, Quadrat, Fünfeck, Sechseck, Spalten für 3, 4, 5, 6 Flächen an einer Ecke, in jede Zelle die Winkelsumme und ein Haken oder Kreuz.",
  "Aufs Handout: die Definition, die Tabelle mit e, k und f, der Winkelbeweis in fünf Zeilen, zwei Übungsaufgaben mit Lösung und deine Quellen.",
];
export const KOLLOQUIUM = [
  { stufe: "Basis", frage: "Was ist ein platonischer Körper?",
    antwort: "Ein konvexer Körper, dessen Flächen alle deckungsgleiche regelmäßige Vielecke sind und an dessen Ecken jeweils gleich viele Flächen zusammenkommen. Beispiel: Der Würfel hat sechs Quadrate, an jeder Ecke treffen sich drei." },
  { stufe: "Basis", frage: "Warum müssen an einer Ecke mindestens drei Flächen zusammenkommen?",
    antwort: "Zwei Flächen treffen sich nur in einer Kante – sie können keinen Raum einschließen, die Ecke bliebe nach einer Seite offen. Erst mit drei Flächen entsteht eine räumliche Spitze, wie bei einer Zimmerecke." },
  { stufe: "Basis", frage: "Warum muss die Winkelsumme an einer Ecke kleiner als 360° sein?",
    antwort: "Bei genau 360° liegen die Flächen flach in der Ebene, wie Fliesen. Bei mehr als 360° würden sie sich überlappen. Nur wenn eine Lücke bleibt, kann man die Flächen zusammenklappen – dann entsteht eine Ecke." },
  { stufe: "Basis", frage: "Warum gibt es keinen platonischen Körper aus Sechsecken?",
    antwort: "Ein regelmäßiges Sechseck hat Innenwinkel von 120°. Schon drei davon ergeben 3 · 120° = 360°, sie liegen also flach – das Bienenwaben-Muster. Für eine Ecke bräuchte man weniger, aber mindestens drei Flächen sind Pflicht." },
  { stufe: "Vertiefung", frage: "Reicht es, dass alle Flächen gleiche regelmäßige Vielecke sind?",
    antwort: "Nein. Zwei Tetraeder, an einer Fläche zusammengeklebt, ergeben eine Doppelpyramide aus sechs gleichseitigen Dreiecken. Sie ist aber nicht regelmäßig: An drei Ecken treffen sich vier Flächen, an zwei Ecken nur drei." },
  { stufe: "Vertiefung", frage: "Der Winkelbeweis zeigt „höchstens fünf“ – woher weiß man, dass es alle fünf wirklich gibt?",
    antwort: "Man muss jeden Körper bauen. Tetraeder, Würfel und Oktaeder kann man direkt aus Netzen falten. Für Dodekaeder und Ikosaeder gibt es genaue Koordinaten, etwa mit dem goldenen Schnitt: Die Ecken des Ikosaeders liegen bei (0; ±1; ±φ) und den zyklischen Vertauschungen." },
  { stufe: "Vertiefung", frage: "Was sagt der Eulersche Polyedersatz?",
    antwort: "Für jeden konvexen Körper gilt Ecken minus Kanten plus Flächen gleich 2. Beim Würfel: 8 − 12 + 6 = 2, beim Ikosaeder: 12 − 30 + 20 = 2. Er gilt nicht für Körper mit Loch – ein Rahmen aus Holzleisten hat e − k + f = 0." },
  { stufe: "Vertiefung", frage: "Was bedeutet Dualität bei den platonischen Körpern?",
    antwort: "Verbindet man die Flächenmitten eines Würfels, entsteht ein Oktaeder – und umgekehrt. Dabei tauschen Ecken und Flächen ihre Anzahl, die Kanten bleiben: Würfel 8, 12, 6, Oktaeder 6, 12, 8. Genauso sind Dodekaeder und Ikosaeder dual, das Tetraeder ist zu sich selbst dual." },
  { stufe: "Vertiefung", frage: "Wie viele verschiedene Würfelnetze gibt es?",
    antwort: "Genau 11 – Drehungen und Spiegelungen nicht mitgezählt. Von den 35 Figuren aus sechs Quadraten lassen sich nur diese 11 falten. Zwei schnelle Ausschlusskriterien: vier Quadrate um einen Punkt (360°) und fünf Quadrate in einer Reihe." },
  { stufe: "Profi", frage: "Wie kommt man ohne Winkel, nur mit Zählen, auf dieselben fünf Körper?",
    antwort: "Zählt man die Kanten über die Flächen, gilt p · f = 2k, über die Ecken q · e = 2k. Eingesetzt in e − k + f = 2 ergibt sich 1/p + 1/q = 1/2 + 1/k, also 1/p + 1/q > 1/2 und damit (p − 2)(q − 2) < 4. Das erfüllen nur die fünf Paare (3, 3), (3, 4), (4, 3), (3, 5), (5, 3)." },
  { stufe: "Profi", frage: "Was ist das Winkeldefizit, und was ist daran besonders?",
    antwort: "Das Defizit einer Ecke ist das, was zu 360° fehlt – beim Würfel 90°. Zählt man es über alle Ecken zusammen, kommt bei jedem konvexen Körper 720° heraus (Satz von Descartes): Würfel 8 · 90°, Tetraeder 4 · 180°, Dodekaeder 20 · 36°, Ikosaeder 12 · 60°." },
  { stufe: "Profi", frage: "Was hat ein Fußball mit den platonischen Körpern zu tun?",
    antwort: "Der klassische Fußball ist ein abgestumpftes Ikosaeder: An jeder der 12 Ecken des Ikosaeders wird eine Spitze abgeschnitten, so entstehen 12 Fünfecke und 20 Sechsecke. Er hat 60 Ecken und 90 Kanten – und wieder gilt 60 − 90 + 32 = 2. Regelmäßig ist er nicht, weil zwei Sorten Flächen vorkommen." },
  { stufe: "Profi", frage: "Warum heißen die Körper „platonisch“?",
    antwort: "Der griechische Philosoph Platon ordnete sie in seinem Dialog Timaios den Elementen zu: Tetraeder Feuer, Würfel Erde, Oktaeder Luft, Ikosaeder Wasser, das Dodekaeder dem Himmel. Den Beweis, dass es genau fünf gibt, findet man im letzten Buch von Euklids „Elementen“." },
];
