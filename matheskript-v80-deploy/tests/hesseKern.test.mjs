/* Hesse-Normalenform (src/hesseKern.js): Umrechnungen, Abstände numerisch, Generator nur mit schönen Zahlen,
   Standardschreibweise (kein 1x, kein + 0, kein + −, keine Hochzahl 1) */
import test from "node:test";
import assert from "node:assert/strict";
import * as K from "../src/hesseKern.js";
import { q, qNum } from "../src/rechnen2.js";

/* reproduzierbarer Zufall */
function lcg(seed) {
  let s = seed >>> 0;
  return () => { s = (1664525 * s + 1013904223) >>> 0; return s / 2 ** 32; };
}

const UNSAUBER = [
  [/(^|[^\d\w])1x_/, "1x"],
  [/(^|[^\d])0x_/, "0x"],
  [/\+\s*−/, "+ −"],
  [/−\s*−\s*\d/, "− −"],
  [/[+−]\s*0(?![\d,.])\s*(=|$|\})/, "± 0"],
  [/\^\{?1\}?(?!\d)/, "Hochzahl 1"],
  [/(?:·|\\cdot)\s*1\s*$/, "· 1 am Ende"],   // ausgeschriebene Produkte (6 · 1 + …) mit „=“ dahinter sind erlaubt
];
const sauber = (s, wo) => { for (const [re, was] of UNSAUBER) assert.ok(!re.test(s), `${wo}: ${was} in „${s}“`); };

test("schöne Normalenvektoren haben ganzzahlige Länge", () => {
  for (const n of K.SCHOENE_NORMALEN) assert.ok(K.betrag(n) !== null, n.join());
  const z = lcg(7);
  for (let i = 0; i < 500; i++) {
    const n = K.zufallsNormale(z);
    const b = K.betrag(n);
    assert.ok(Number.isInteger(b) && b > 0, `|${n}| nicht ganz`);
    assert.ok(n.some((x) => x !== 0));
  }
});

test("Betrag als TeX: ganz, Wurzel, teilweise gezogen", () => {
  assert.equal(K.betragTex([1, 2, 2]), "3");
  assert.equal(K.betragTex([1, 1, 1]), "\\sqrt{3}");
  assert.equal(K.betragTex([2, 2, 2]), "2\\sqrt{3}");
  assert.equal(K.betragKette([1, -2, 2]), "|\\vec{n}| = \\sqrt{1^2 + (−2)^2 + 2^2} = \\sqrt{9} = 3");
});

test("Standardschreibweise der Koordinatenform", () => {
  assert.equal(K.termTex([1, -1, 0]), "x_1 − x_2");
  assert.equal(K.termTex([0, 3, -4]), "3x_2 − 4x_3");
  assert.equal(K.termTex([-1, 0, 1], K.X_TEX, -5), "−x_1 + x_3 − 5");
  assert.equal(K.termTex([2, 0, 0], K.X_TEX, 0), "2x_1");
  assert.equal(K.koordTex([1, 2, 2], 6), "x_1 + 2x_2 + 2x_3 = 6");
  assert.equal(K.koordText([1, -2, 0], -3), "x₁ − 2x₂ = −3");
  assert.equal(K.hnfTex([1, 2, 2], 6), "\\frac{x_1 + 2x_2 + 2x_3 − 6}{3} = 0");
  assert.equal(K.hnfTex([0, 3, -4], -5), "\\frac{3x_2 − 4x_3 + 5}{5} = 0");
  assert.equal(K.hnfTex([2, 3, 6], 0), "\\frac{2x_1 + 3x_2 + 6x_3}{7} = 0");
  assert.equal(K.normalenformTex([1, 2, 2], [0, 0, 0]), "\\vec{x} \\cdot \\spalte{1}{2}{2} = 0");
});

test("Punkt-Normalenform → Koordinatenform → HNF: alle Ebenenpunkte erfüllen die HNF", () => {
  const z = lcg(11);
  for (let i = 0; i < 200; i++) {
    const n = K.zufallsNormale(z);
    const P = [Math.floor(z() * 7) - 3, Math.floor(z() * 7) - 3, Math.floor(z() * 7) - 3];
    const d = K.dAusPunkt(n, P);
    assert.equal(d, n[0] * P[0] + n[1] * P[1] + n[2] * P[2] + 0);
    assert.ok(!Object.is(d, -0), "nie −0");
    const [u, v] = K.ebenenBasis(n);
    assert.equal(K.skalar(n, u), 0); assert.equal(K.skalar(n, v), 0);
    assert.ok(K.kreuz(u, v).some((x) => x !== 0), "u, v nicht parallel");
    for (const [s, t] of [[0, 0], [1, 0], [0, 1], [-2, 3], [3, -1]]) {
      const X = K.plus(K.plus(P, K.mal(u, s)), K.mal(v, t));
      assert.equal(K.skalar(K.minusV(X, P), n), 0, "Normalenform");
      assert.equal(K.skalar(n, X), d, "Koordinatenform");
      assert.equal(K.abstandExakt(n, d, X).z, 0, "HNF");
      assert.equal(K.seite(n, d, X), "in");
    }
  }
});

test("Abstand mit Vorzeichen: numerisch gegen Lotfußpunkt geprüft", () => {
  const z = lcg(23);
  for (let i = 0; i < 300; i++) {
    const n = K.zufallsNormale(z);
    const d = Math.floor(z() * 21) - 10;
    const Q = [Math.floor(z() * 17) - 8, Math.floor(z() * 17) - 8, Math.floor(z() * 17) - 8];
    const delta = qNum(K.abstandExakt(n, d, Q));
    const F = K.lotfuss(n, d, Q);
    assert.ok(Math.abs(n[0] * F[0] + n[1] * F[1] + n[2] * F[2] - d) < 1e-9, "F liegt in E");
    const FQ = K.minusV(Q, F);
    assert.ok(Math.abs(Math.abs(delta) - K.laenge(FQ)) < 1e-9, "|δ| = |FQ|");
    assert.ok(Math.abs(delta - K.skalar(FQ, n) / K.laenge(n)) < 1e-9, "Vorzeichen = Richtung von n");
    assert.ok(Math.abs(delta - K.abstandZahl(n, d, Q)) < 1e-12);
    assert.equal(K.seite(n, d, Q), delta > 0 ? "ueber" : delta < 0 ? "unter" : "in");
  }
  // Vorzeichenwechsel beim Durchstoßen
  const n = [1, 2, 2], P = [2, 1, 1], d = 6;
  const n0 = K.mal(n, 1 / 3);
  const werte = [-2, -1, 0, 1, 2].map((h) => K.abstandZahl(n, d, K.plus(P, K.mal(n0, h))));
  werte.forEach((w, i) => assert.ok(Math.abs(w - (i - 2)) < 1e-12));
});

test("Abstand als TeX-Kette endet vereinfacht", () => {
  assert.equal(K.abstandTex([1, 2, 2], 6, [3, 3, 3]), "\\frac{3 + 2 \\cdot 3 + 2 \\cdot 3 − 6}{3} = \\frac{9}{3} = 3");
  assert.equal(K.abstandTex([1, 2, 2], 6, [1, 1, 1]), "\\frac{1 + 2 \\cdot 1 + 2 \\cdot 1 − 6}{3} = −\\frac{1}{3}");
  assert.equal(K.abstandTex([0, 3, -4], -5, [0, 1, 2]), "\\frac{3 \\cdot 1 − 4 \\cdot 2 + 5}{5} = 0");
  assert.equal(K.abstandTex([-1, 2, 2], 0, [-1, 0, 0]), "\\frac{−(−1) + 2 \\cdot 0 + 2 \\cdot 0}{3} = \\frac{1}{3}");
  assert.equal(K.bruchKette(6, 9), "\\frac{6}{9} = \\frac{2}{3}");
  assert.equal(K.bruchKette(-14, 7), "−\\frac{14}{7} = −2");
});

test("Generator: nur schöne Zahlen, Lage stimmt, alle Formen und Lagen kommen vor", () => {
  const z = lcg(42);
  const lagen = new Set(), formen = new Set();
  for (let i = 0; i < 600; i++) {
    const a = K.aufgabe(z);
    lagen.add(a.lage); formen.add(a.form);
    assert.ok(Number.isInteger(a.b) && a.b === K.betrag(a.n), "|n| ganz");
    for (const x of [...a.n, ...a.P, ...a.Q, a.d]) assert.ok(Number.isInteger(x), "ganzzahlig");
    for (const x of [...a.P, ...a.Q]) assert.ok(Math.abs(x) <= 9, "Koordinaten klein");
    assert.equal(a.d, K.skalar(a.n, a.P));
    assert.equal(a.zaehler, K.skalar(a.n, a.Q) - a.d);
    const ex = K.abstandExakt(a.n, a.d, a.Q);
    assert.deepEqual(ex, a.abstand);
    assert.ok(a.abstand.n === 1 || a.abstand.n <= a.b, "Nenner höchstens |n|");
    assert.ok(Math.abs(qNum(a.abstand)) <= 6, "Abstand nicht zu groß");
    assert.equal(K.seite(a.n, a.d, a.Q), a.lage);
    for (const s of K.rechenweg(a)) for (const zeile of s.zeilen) sauber(zeile, `Rechenweg ${s.titel}`);
    sauber(K.koordTex(a.n, a.d), "Koordinatenform");
    sauber(K.hnfTex(a.n, a.d), "HNF");
    sauber(K.normalenformTex(a.n, a.P), "Normalenform");
  }
  assert.deepEqual([...lagen].sort(), ["in", "ueber", "unter"]);
  assert.deepEqual([...formen].sort(), ["koord", "normal"]);
});

test("Rechenweg: Normalenform-Aufgaben rechnen d aus, letzte Zeile ist der Betrag", () => {
  const z = lcg(5);
  let normal = null, koord = null;
  while (!normal || !koord) { const a = K.aufgabe(z); if (a.form === "normal") normal = a; else koord = a; }
  const wn = K.rechenweg(normal), wk = K.rechenweg(koord);
  assert.equal(wn.length, wk.length + 1);
  assert.match(wn[0].zeilen[1], /^E: /);
  for (const w of [wn, wk]) {
    const letzte = w[w.length - 1].zeilen[0];
    assert.match(letzte, /^d\(Q; E\) = /);
  }
});

test("Prüfung: richtig, Vorzeichenfehler, vergessenes Teilen, leere Felder", () => {
  const a = { form: "normal", n: [1, 2, 2], b: 3, P: [2, 1, 1], d: 6, Q: [1, 1, 1], zaehler: -1, abstand: q(-1, 3), lage: "unter" };
  let r = K.pruefe(a, { d: "6", betrag: "3", zaehler: "−1", abstand: "-1/3" });
  assert.ok(r.alleRichtig, JSON.stringify(r));
  r = K.pruefe(a, { d: "6", betrag: "3", zaehler: "-1", abstand: "1/3" });
  assert.equal(r.felder.abstand, false);
  assert.ok(r.hinweise.some((h) => /Vorzeichen/.test(h)));
  r = K.pruefe(a, { d: "6", betrag: "3", zaehler: "-1", abstand: "-1" });
  assert.ok(r.hinweise.some((h) => /geteilt/.test(h)));
  r = K.pruefe(a, { d: "-6", betrag: "9", zaehler: "", abstand: "-0,333" });
  assert.equal(r.felder.d, false); assert.equal(r.felder.betrag, false); assert.equal(r.felder.zaehler, null);
  assert.equal(r.vollstaendig, false);
  r = K.pruefe({ ...a, form: "koord" }, { betrag: "3", abstand: "-2/6" });
  assert.ok(r.alleRichtig, "gekürzt oder nicht gekürzt – derselbe Wert");
});

test("Beispielebenen: Richtungsvektoren ⟂ n, Startpunkt mit ganzzahligem Abstand", () => {
  for (const e of K.BEISPIEL_EBENEN) {
    assert.equal(K.skalar(e.n, e.u), 0); assert.equal(K.skalar(e.n, e.v), 0);
    const ab = K.abstandExakt(e.n, e.d, e.Q);
    assert.equal(ab.n, 1); assert.ok(ab.z !== 0);
    const X = K.punktX(e, 1, -1, 2).map(qNum);
    assert.ok(Math.abs(K.abstandZahl(e.n, e.d, X) - 2) < 1e-12, "h = Höhe in LE");
  }
});
