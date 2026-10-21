import test from "node:test";
import assert from "node:assert/strict";
import { ARTEN, BEISPIEL, QUADRUPEL, koordText, laenge, liesZahl, neueAufgabe, normalenWert, normalenvektorMitLaenge, pruefe, punktInEbene, punktNeben, skalar, diff } from "../src/hesseKern.js";

/* deterministischer Zufall */
const rndAus = (saat) => () => { saat = (saat * 1103515245 + 12345) % 2147483648; return saat / 2147483648; };

test("Quadrupel haben ganzzahlige Länge, gemischte Normalenvektoren auch", () => {
  for (const q of QUADRUPEL) assert.equal(Math.round(laenge(q)) ** 2, skalar(q, q), q.join());
  const rnd = rndAus(7);
  for (let i = 0; i < 200; i++) {
    const n = normalenvektorMitLaenge(rnd);
    assert.equal(Math.round(laenge(n)) ** 2, skalar(n, n), n.join());
    assert.ok(laenge(n) <= 9);
  }
});

test("Beispiel-Ebene: u, v liegen in E, X(s,t) erfüllt die Gleichung, P(s,t,h) hat Abstand 3|h|", () => {
  const { n, A, d, u, v, L } = BEISPIEL;
  assert.equal(skalar(A, n), d);
  assert.equal(skalar(u, n), 0);
  assert.equal(skalar(v, n), 0);
  assert.equal(L, Math.round(laenge(n)));
  for (let s = -2; s <= 2; s++) for (let t = -2; t <= 2; t++) {
    const X = punktInEbene(s, t);
    assert.equal(skalar(X, n), d);
    assert.deepEqual(normalenWert(X), { wert: 0, hnf: 0, abstand: 0 });
    for (let h = -2; h <= 2; h++) {
      const P = punktNeben(s, t, h);
      const w = normalenWert(P);
      assert.equal(w.wert, 9 * h);         // (p − a) · n = h · |n|²
      assert.equal(w.hnf, 3 * h);          // (p − a) · n₀ = h · |n|
      assert.equal(w.abstand, 3 * Math.abs(h));
    }
  }
  assert.equal(koordText(n, d), "x₁ + 2x₂ + 2x₃ = 7");
  assert.equal(koordText([-2, 0, 1], -3), "−2x₁ + x₃ = −3");
});

test("Eingaben lesen: Komma, Minuszeichen, Bruch", () => {
  assert.equal(liesZahl("−3"), -3);
  assert.equal(liesZahl("-3"), -3);
  assert.equal(liesZahl(" 2,5 "), 2.5);
  assert.equal(liesZahl("1/2"), 0.5);
  assert.equal(liesZahl("1/0"), null);
  assert.equal(liesZahl("abc"), null);
  assert.equal(liesZahl(""), null);
});

test("Aufgaben: jede Art, Lösung stimmt, Prüfung erkennt richtig und typische Fehler", () => {
  const rnd = rndAus(3);
  for (let lauf = 0; lauf < 60; lauf++) {
    for (const art of ARTEN) {
      const a = neueAufgabe(art, rnd);
      assert.equal(a.art, art);
      if (art === "ablesen") {
        assert.ok(pruefe(a, a.n.map(String)).ok);
        assert.ok(pruefe(a, a.n.map((x) => String(-2 * x))).ok, "Vielfache gelten");
        assert.ok(!pruefe(a, ["0", "0", "0"]).ok);
        assert.equal(pruefe(a, ["1", "x", "2"]).art, "warn");
        const falsch = [a.n[1], a.n[0], a.n[2]];
        if (falsch.join() !== a.n.join() && !(falsch.every((x, i) => x === -a.n[i]))) assert.ok(!pruefe(a, falsch.map(String)).ok, "vertauscht ist falsch");
      }
      if (art === "koordinatenform") {
        assert.equal(a.loesung, skalar(a.A, a.n));
        assert.ok(pruefe(a, String(a.loesung)).ok);
        if (a.loesung !== 0) assert.match(pruefe(a, String(-a.loesung)).text, /Vorzeichen/);
      }
      if (art === "punktprobe") {
        assert.equal(a.loesung, skalar(diff(a.A, a.P), a.n));
        assert.equal(a.liegt, a.loesung === 0);
        assert.ok(pruefe(a, String(a.loesung)).ok);
        const pn = skalar(a.P, a.n);
        if (pn !== a.loesung) assert.match(pruefe(a, String(pn)).text, /p · n/);
      }
      if (art === "laenge") {
        assert.equal(a.loesung ** 2, skalar(a.n, a.n));
        assert.ok(pruefe(a, String(a.loesung)).ok);
        assert.match(pruefe(a, String(a.loesung ** 2)).text, /Wurzel/);
      }
      if (art === "abstand") {
        // Abstand = |n·p − d| / |n| ganzzahlig und = |t|·|n|
        assert.equal(Math.abs(skalar(a.n, a.P) - a.d) / a.L, a.loesung);
        assert.equal(skalar(a.n, a.F), a.d, "Lotfußpunkt liegt in E");
        assert.ok(Number.isInteger(a.loesung) && a.loesung > 0);
        assert.ok(pruefe(a, String(a.loesung)).ok);
        assert.ok(pruefe(a, String(a.loesung).replace(".", ",")).ok);
        assert.match(pruefe(a, String(Math.abs(a.wert))).text, /noch nicht durch/);
        assert.match(pruefe(a, String(-a.loesung)).text, /Betrag/);
        assert.equal(pruefe(a, "").art, "warn");
      }
    }
  }
});

test("Punktprobe: etwa die Hälfte der Punkte liegt in der Ebene", () => {
  const rnd = rndAus(11);
  let drin = 0;
  for (let i = 0; i < 200; i++) if (neueAufgabe("punktprobe", rnd).liegt) drin++;
  assert.ok(drin > 50 && drin < 150, String(drin));
});
