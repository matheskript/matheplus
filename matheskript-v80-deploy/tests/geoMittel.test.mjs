import test from "node:test";
import assert from "node:assert/strict";
import {
  TRIPEL, PYTH_ARTEN, pythAufgabe, rechtwinklig, hypotenuse, kathete,
  THALES_ARTEN, thalesAufgabe, thalesWinkel, winkelBeiC,
  KONG_ARTEN, KONG_FIGUREN, kongruenzAufgabe, satzVon, anzahlVon, ssw, sssMoeglich, GRAD,
} from "../src/geoMittel.js";

const nah = (a, b, e = 1e-9) => Math.abs(a - b) <= e;

test("Pythagoras: Tripel sind rechtwinklig, Rechenhelfer stimmen", () => {
  for (const [a, b, c] of TRIPEL) {
    assert.ok(rechtwinklig(a, b, c), `${a} ${b} ${c}`);
    assert.ok(rechtwinklig(c, a, b));
    assert.ok(nah(hypotenuse(a, b), c, 1e-9));
    assert.ok(nah(kathete(c, a), b, 1e-9));
  }
  assert.ok(!rechtwinklig(4, 5, 6));
});

test("Pythagoras: alle Aufgabentypen sind in sich stimmig (je 2000 Läufe)", () => {
  for (const art of PYTH_ARTEN) for (let i = 0; i < 2000; i++) {
    const au = pythAufgabe(art);
    assert.equal(au.art, art);
    if (art === "hyp") assert.ok(nah(au.a ** 2 + au.b ** 2, au.c ** 2, 1e-9));
    if (art === "kath") { assert.ok(nah(au.a ** 2 + au.b ** 2, au.c ** 2, 1e-9)); assert.ok(au.b > 0 && au.b < au.c); }
    if (art === "benennung") {
      assert.ok(nah(au.l1 ** 2 + au.l2 ** 2, au.l3 ** 2, 1e-9));
      assert.ok(!au.hyp.includes(au.recht), "Hypotenuse liegt dem rechten Winkel gegenüber");
      assert.ok(au.k1.includes(au.recht) && au.k2.includes(au.recht));
      assert.equal(new Set([au.hyp, au.k1, au.k2]).size, 3);
      assert.equal(au.wert, au.gesuchtHyp ? au.l3 : au.l2);
    }
    if (art === "umkehr") {
      assert.equal(au.ja, nah(au.summe, au.quadrat, 1e-9));
      assert.equal(au.lang, Math.max(...au.seiten));
      assert.ok(sssMoeglich(...au.seiten), "Umkehr-Dreieck existiert");
    }
    if (art === "leiter") { assert.ok(nah(au.boden ** 2 + au.hoehe ** 2, au.leiter ** 2, 1e-9)); }
    if (art === "raum") { assert.ok(nah(au.a ** 2 + au.b ** 2 + au.h ** 2, au.d ** 2, 1e-9)); assert.ok(Number.isInteger(au.d)); }
  }
});

test("Thales: Winkel im Halbkreis sind 90°, außerhalb spitz, innerhalb stumpf", () => {
  for (let t = 5; t <= 175; t += 5) {
    assert.ok(nah(winkelBeiC(t, 1), 90, 1e-9), String(t));
    assert.ok(winkelBeiC(t, 0.7) > 90 && winkelBeiC(t, 1.3) < 90);
    const w = thalesWinkel(t);
    assert.ok(nah(w.alpha + w.beta + w.gamma, 180));
  }
});

test("Thales: Aufgaben stimmig (je 1000 Läufe)", () => {
  for (const art of THALES_ARTEN) for (let i = 0; i < 1000; i++) {
    const au = thalesAufgabe(art);
    if (art === "winkel" || art === "beweis") { assert.equal(au.alpha + au.beta, 90); assert.ok(au.alpha > 0 && au.alpha < 90); }
    if (art === "radius") { assert.ok(nah(au.ac ** 2 + au.bc ** 2, au.ab ** 2, 1e-9)); assert.equal(au.r, au.ab / 2); }
    if (art === "lage") {
      const soll = au.d < au.r - 1e-9 ? "innen" : au.d > au.r + 1e-9 ? "aussen" : "auf";
      assert.equal(au.lage, soll);
    }
    if (art === "tangente") assert.ok(nah(au.r ** 2 + au.t ** 2, au.d ** 2, 1e-9));
    if (art === "umkreis") { assert.ok(nah(au.a ** 2 + au.b ** 2, au.c ** 2, 1e-9)); assert.equal(au.r, au.c / 2); }
  }
});

test("SSW: Anzahl der Schnittpunkte geometrisch nachgerechnet", () => {
  assert.equal(ssw(6, 2, 40).anzahl, 0);
  assert.equal(ssw(6, 6 * Math.sin(40 * GRAD), 40).anzahl, 1);
  assert.equal(ssw(6, 5, 40).anzahl, 2);
  assert.equal(ssw(6, 7, 40).anzahl, 1);
  /* jede gefundene Lage von B hat wirklich den Abstand a von C */
  for (let k = 0; k < 500; k++) {
    const b = 1 + Math.random() * 8, a = 0.5 + Math.random() * 9, al = 5 + Math.random() * 170;
    const C = [b * Math.cos(al * GRAD), b * Math.sin(al * GRAD)];
    for (const x of ssw(b, a, al).xs) assert.ok(nah(Math.hypot(x - C[0], C[1]), a, 1e-9));
  }
});

test("Kongruenz: Generator-Lösung = unabhängige Klassifikation (je 1500 Läufe)", () => {
  for (const art of KONG_ARTEN) for (let i = 0; i < 1500; i++) {
    const au = kongruenzAufgabe(art);
    assert.equal(au.stuecke.length, 3);
    assert.equal(satzVon(au.stuecke), au.satz, `${art}: ${JSON.stringify(au.stuecke)}`);
    assert.equal(String(anzahlVon(au.stuecke)), String(au.anzahl), `${art}: ${JSON.stringify(au.stuecke)}`);
    if (art === "ssw-klein") assert.equal(au.anzahl, 2, JSON.stringify(au.stuecke));
    if (art === "ssw-schief") assert.equal(au.anzahl, 0, JSON.stringify(au.stuecke));
    if (art === "ssw-gross") assert.equal(au.anzahl, 1);
    if (["sss", "sws", "wsw", "sww"].includes(art)) assert.equal(au.anzahl, 1);
    if (art === "www") assert.equal(au.stuecke.reduce((s, x) => s + x.wert, 0), 180);
  }
});

test("Kongruenz: Figuren haben einen gültigen Satz und drei Gleichheiten", () => {
  for (const f of KONG_FIGUREN) {
    assert.ok(["SSS", "SWS", "WSW", "SsW"].includes(f.satz));
    assert.equal(f.gleich.length, 3);
  }
});
