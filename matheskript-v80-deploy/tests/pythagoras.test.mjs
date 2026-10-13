import test from "node:test";
import assert from "node:assert/strict";
import {
  TRIPEL, beweisZwei, dreieckBeiT, dreieckFlaeche, dreieckeA, dreieckeB, hypotenuse, polygonFlaeche, quadrateUeber,
  rechteckFlaeche, rechtwinkligFlaeche, schraegesQuadrat, umlegePlan, zerlegung, zufallsTripel,
} from "../src/pythagoras.js";

const nah = (x, y, eps = 1e-9) => Math.abs(x - y) <= eps;
const punktNah = (p, q) => nah(p[0], q[0]) && nah(p[1], q[1]);
const seite = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);

test("Rechteck, rechtwinkliges Dreieck, beliebiges Dreieck", () => {
  assert.equal(rechteckFlaeche(3, 4), 12);
  assert.equal(rechtwinkligFlaeche(3, 4), 6);
  assert.equal(dreieckFlaeche(7, 4), 14);
  for (let b = 1; b <= 8; b++) for (let a = 1; a <= 6; a++) for (let p = 0; p <= b; p++) {
    const z = zerlegung(p, b, a);
    assert.ok(nah(z.summe, z.gesamt) && nah(z.gesamt, (b * a) / 2));
    assert.equal(z.p + z.q, b);
    // Gaußsche Formel für das Dreieck (0,0), (b,0), (p,a)
    assert.ok(nah(polygonFlaeche([[0, 0], [b, 0], [p, a]]), z.gesamt));
  }
  const z = zerlegung(2, 7, 4);
  assert.deepEqual([z.links, z.rechts, z.summe], [4, 10, 14]);
});

test("Beweis 1: Anordnung A – vier gleiche rechtwinklige Dreiecke, schräges Quadrat hat Seite c", () => {
  for (let a = 1; a <= 7; a++) for (let b = 1; b <= 7; b++) {
    const s = a + b, c = hypotenuse(a, b);
    const A = dreieckeA(a, b);
    for (const [R, Pb, Pa] of A) {
      assert.ok(nah(seite(R, Pb), b) && nah(seite(R, Pa), a), `Katheten a=${a} b=${b}`);
      assert.ok(nah(seite(Pb, Pa), c));
      assert.ok(nah(polygonFlaeche([R, Pb, Pa]), (a * b) / 2));
    }
    const Q = schraegesQuadrat(a, b);
    for (let i = 0; i < 4; i++) assert.ok(nah(seite(Q[i], Q[(i + 1) % 4]), c));
    // Fläche des großen Quadrats = vier Dreiecke + c²
    assert.ok(nah(s * s, 4 * ((a * b) / 2) + polygonFlaeche(Q)));
    assert.ok(nah(polygonFlaeche(Q), c * c));
  }
});

test("Beweis 1: Anordnung B – gleiche Dreiecke, freie Fläche = a² + b²", () => {
  for (let a = 1; a <= 7; a++) for (let b = 1; b <= 7; b++) {
    const s = a + b;
    for (const [R, Pb, Pa] of dreieckeB(a, b)) {
      assert.ok(nah(seite(R, Pb), b) && nah(seite(R, Pa), a));
      assert.ok(nah(polygonFlaeche([R, Pb, Pa]), (a * b) / 2));
    }
    assert.ok(nah(s * s - 4 * ((a * b) / 2), a * a + b * b));
  }
});

test("Umlegen: bei t = 0 Anordnung A, bei t = 1 genau Anordnung B (nur Drehung und Verschiebung)", () => {
  for (let a = 1; a <= 7; a++) for (let b = 1; b <= 7; b++) {
    const plan = umlegePlan(a, b);
    assert.equal(plan.length, 4);
    const B = dreieckeB(a, b);
    const benutzt = new Set();
    for (const p of plan) {
      p.von.forEach((pt, k) => assert.ok(punktNah(dreieckBeiT(p, 0)[k], pt)));
      const ende = dreieckBeiT(p, 1);
      const j = B.findIndex((db) => db.every((pt, k) => punktNah(ende[k], pt)));
      assert.ok(j >= 0, `Ende passt auf ein B-Dreieck (a=${a}, b=${b})`);
      benutzt.add(j);
      for (const t of [0.25, 0.5, 0.75]) {                      // Form bleibt in jedem Augenblick erhalten
        const d = dreieckBeiT(p, t);
        assert.ok(nah(seite(d[0], d[1]), b) && nah(seite(d[0], d[2]), a) && nah(polygonFlaeche(d), (a * b) / 2, 1e-9));
      }
    }
    assert.equal(benutzt.size, 4, "jedes B-Dreieck genau einmal");
  }
});

test("Beweis 2: Außenquadrat c, vier Dreiecke innen, Innenquadrat |a−b|", () => {
  for (let a = 1; a <= 7; a++) for (let b = 1; b <= 7; b++) {
    const { c, V, innen, dreiecke } = beweisZwei(a, b);
    assert.ok(nah(c * c, a * a + b * b));
    for (const [v0, v1, q] of dreiecke) {
      assert.ok(nah(seite(v0, v1), c));
      assert.ok(nah(seite(v0, q), b, 1e-9) && nah(seite(v1, q), a, 1e-9));
      assert.ok(nah(polygonFlaeche([v0, v1, q]), (a * b) / 2, 1e-9));
    }
    for (let i = 0; i < 4; i++) assert.ok(nah(seite(innen[i], innen[(i + 1) % 4]), Math.abs(a - b), 1e-9));
    assert.ok(nah(polygonFlaeche(V), 4 * ((a * b) / 2) + polygonFlaeche(innen), 1e-9));
    assert.ok(nah(polygonFlaeche(innen), (a - b) ** 2, 1e-9));
  }
});

test("Quadrate über den Seiten: a² + b² = c²", () => {
  for (let a = 1; a <= 7; a++) for (let b = 1; b <= 7; b++) {
    const q = quadrateUeber(a, b);
    assert.ok(nah(polygonFlaeche(q.quadratA), a * a) && nah(polygonFlaeche(q.quadratB), b * b));
    assert.ok(nah(polygonFlaeche(q.quadratC), polygonFlaeche(q.quadratA) + polygonFlaeche(q.quadratB)));
    const xs = [...q.quadratA, ...q.quadratB, ...q.quadratC].map((p) => p[0]), ys = [...q.quadratA, ...q.quadratB, ...q.quadratC].map((p) => p[1]);
    assert.equal(Math.min(...xs), q.kasten.x0); assert.equal(Math.max(...xs), q.kasten.x1);
    assert.equal(Math.min(...ys), q.kasten.y0); assert.equal(Math.max(...ys), q.kasten.y1);
  }
});

test("Zahlentripel sind ganzzahlig und rechtwinklig; Zufallsauswahl liefert beide Reihenfolgen", () => {
  for (const [a, b, c] of TRIPEL) assert.equal(a * a + b * b, c * c);
  const gesehen = new Set();
  for (let i = 0; i < 200; i++) {
    const [a, b, c] = zufallsTripel();
    assert.equal(a * a + b * b, c * c);
    gesehen.add(a < b ? "klein-zuerst" : "gross-zuerst");
  }
  assert.equal(gesehen.size, 2);
});
