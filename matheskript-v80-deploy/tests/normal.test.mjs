/* Normalverteilung (normal.js) und die neuen Generatoren für Geometrie und Normalverteilung
   in trainingDaten.js: Werte gegen Tabellenwerte, Quantil als Umkehrung, Aufgaben unabhängig
   nachgerechnet, Fehlerwerte treffen nie die Lösung, Verdrahtung in Unterthemen und Lernpfad. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { NV_ARTEN, Phi, SIGMA_REGELN, binomNaeherung, dichte, nvAufgabe, phi, quantil, vert, zwischen } from "../src/normal.js";
import { FEHLERTYPEN, GENERATOREN, THEMEN, neueAufgabe, pruefeAntwort } from "../src/trainingDaten.js";
import { skillsVonGenerator } from "../src/ebbinghaus.js";
import { unterthemen } from "../src/unterthemen.js";
import { STATION_GENERATOREN } from "../src/lernpfade.js";
import { WERKZEUGE, wo } from "../src/werkzeuge.js";

const nah = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

test("Φ stimmt mit Tabellenwerten überein, φ ist die Ableitung von Φ", () => {
  const TAB = [[0, 0.5], [0.5, 0.69146], [1, 0.84134], [1.28, 0.89973], [1.645, 0.95002], [1.96, 0.97500], [2, 0.97725], [2.33, 0.99010], [2.58, 0.99506], [3, 0.99865]];
  for (const [z, p] of TAB) { assert.ok(nah(Phi(z), p, 6e-6), `Φ(${z})`); assert.ok(nah(Phi(-z), 1 - p, 6e-6), `Φ(−${z})`); }
  for (const z of [-2.5, -1, 0, 0.7, 2.2]) assert.ok(nah((Phi(z + 1e-5) - Phi(z - 1e-5)) / 2e-5, phi(z), 1e-7));
  /* Gesamtfläche einer beliebigen Glocke = 1 (Mittelpunktsregel) */
  for (const [mu, s] of [[0, 1], [176, 7], [40, 0.4]]) {
    let f = 0; const h = s / 200;
    for (let x = mu - 10 * s; x < mu + 10 * s; x += h) f += dichte(x + h / 2, mu, s) * h;
    assert.ok(nah(f, 1, 1e-6));
  }
});

test("Quantil ist die Umkehrung von Φ; Sigma-Regeln", () => {
  for (const p of [0.001, 0.01, 0.025, 0.05, 0.1, 0.3, 0.5, 0.8, 0.9, 0.95, 0.975, 0.99, 0.999]) assert.ok(nah(Phi(quantil(p)), p, 1e-12), `p = ${p}`);
  assert.ok(nah(quantil(0.975), 1.959964, 1e-6));
  assert.deepEqual(SIGMA_REGELN.map((r) => Math.round(r.p * 1000) / 10), [68.3, 95.4, 99.7]);
  assert.ok(nah(zwischen(-1.96, 1.96), 0.95, 1e-4));
});

test("Binomial ≈ Normal: Näherung liegt nahe am exakten Wert", () => {
  const binomBis = (n, p, k) => { let s = 0, ln = 0; for (let i = 0; i <= k; i++) { if (i > 0) ln += Math.log(n - i + 1) - Math.log(i); s += Math.exp(ln + i * Math.log(p) + (n - i) * Math.log(1 - p)); } return s; };
  for (const [n, p, k] of [[200, 0.3, 65], [100, 0.5, 45], [400, 0.1, 35], [300, 0.4, 130]]) assert.ok(Math.abs(binomNaeherung(n, p, k) - binomBis(n, p, k)) < 0.01, `${n} ${p} ${k}`);
});

test("nvAufgabe: alle Arten 500-mal, Werte unabhängig nachgerechnet", () => {
  for (const art of NV_ARTEN) for (let i = 0; i < 500; i++) {
    const a = nvAufgabe(art);
    assert.equal(a.art, art);
    assert.ok(a.s > 0);
    if (art === "kleiner") assert.ok(nah(a.wert, vert(a.x, a.mu, a.s)));
    if (art === "groesser") assert.ok(nah(a.wert, 1 - vert(a.x, a.mu, a.s)) && a.x !== a.mu);
    if (art === "zwischen") { assert.ok(a.a < a.b); assert.ok(nah(a.wert, a.Pb - a.Pa)); }
    if (art === "standard" || art === "kleiner" || art === "groesser") assert.ok(Math.abs(a.zWert) <= 2.81 && Math.abs(a.zWert) >= 0.24, `${art}: z = ${a.zWert}`);
    if (art === "sigma") assert.ok(nah(a.oben - a.unten, 2 * a.k * a.s));
    if (art === "quantil") assert.ok(nah(vert(a.wert, a.mu, a.s), a.p, 1e-9));
    if (art === "sigmaRueck") { assert.ok(a.wert > 0, "σ positiv"); assert.ok(nah(vert(a.c, a.mu, a.wert), a.p, 1e-9)); }
    if (art === "binom") { assert.ok(a.sB > 3); assert.ok(nah(a.wert, binomNaeherung(a.n, a.p, a.k))); assert.ok(Math.abs(a.wert - a.ohneKorrektur) > 0.0075); }
  }
});

const NEU = ["geo-kreis", "geo-sektor", "geo-quader", "geo-prisma", "geo-pyramide", "geo-kugel", "geo-winkel", "geo-kongruenz", "geo-strahlen", "nv-kleiner", "nv-zwischen", "nv-quantil", "nv-binom"];
const PI = Math.PI, r2 = (v) => Math.round(v * 100) / 100;
const NACH = {
  "geo-kreis": (d) => (d.art === "flaeche" ? r2(PI * (d.d / 2) ** 2) : r2(2 * PI * d.r)),
  "geo-sektor": ({ r, al, bogen }) => r2(((bogen ? 2 * PI * r : PI * r * r) * al) / 360),
  "geo-quader": ({ a, b, c, ober }) => (ober ? 2 * (a * b + a * c + b * c) : a * b * c),
  "geo-prisma": (d) => (d.v === "zylV" ? r2(PI * (d.d / 2) ** 2 * d.h) : d.v === "zylO" ? r2(2 * PI * d.r * (d.r + d.h)) : (d.g * d.hg * d.h) / 2),
  "geo-pyramide": (d) => (d.art === "pyramide" ? r2((d.a * d.a * d.h) / 3) : r2((PI * d.r * d.r * d.h) / 3)),
  "geo-kugel": ({ r, vol }) => (vol ? r2((4 / 3) * PI * r ** 3) : r2(4 * PI * r * r)),
  "geo-winkel": (d) => (d.art === "dreieck" ? 180 - d.al - d.be : ((d.n - 2) * 180) / d.n),
  "geo-strahlen": (d) => (d.zweiter ? (d.p * (d.a + d.d)) / d.a : (d.b * d.d) / d.a),
  "nv-kleiner": ({ art, mu, s, x }) => (art === "kleiner" ? vert(x, mu, s) : 1 - vert(x, mu, s)),
  "nv-zwischen": (d) => (d.art === "sigma" ? zwischen(-d.k, d.k) : zwischen(d.a, d.b, d.mu, d.s)),
  "nv-quantil": ({ mu, s, p }) => mu + quantil(p) * s,
  "nv-binom": ({ n, p, k }) => binomNaeherung(n, p, k),
};

test("neue Generatoren: registriert, Thema, Skill, Fehlertypen", () => {
  for (const id of NEU) {
    const g = GENERATOREN.find((x) => x.id === id);
    assert.ok(g, id);
    assert.ok(THEMEN[g.thema], `${id}: Thema`);
    assert.ok(skillsVonGenerator(id).length >= 1, `${id}: Skill`);
    for (const f of g.fuer) assert.ok(FEHLERTYPEN[f], `${id}: ${f}`);
  }
});

test("neue Generatoren: 1500 Läufe je Aufgabe, nachgerechnet, Fehlerwerte treffen nie", () => {
  for (const id of NEU) for (let i = 0; i < 1500; i++) {
    const a = neueAufgabe(id);
    assert.equal(a.hinweise.length, 3, id);
    assert.ok(a.loesung.length >= 1 && a.erklaer.kriterien.length >= 1, id);
    for (const f of a.fehler) assert.ok(FEHLERTYPEN[f.typ], `${id}: ${f.typ}`);
    if (a.typ === "wahl") {
      assert.equal(new Set(a.optionen).size, a.optionen.length);
      assert.ok(pruefeAntwort(a, a.richtig).ok);
      for (const f of a.fehler) assert.notEqual(f.wahl, a.richtig);
      continue;
    }
    assert.ok(nah(NACH[id](a.daten), a.wert, 1e-9), `${id}: ${a.wert} statt ${NACH[id](a.daten)} (${JSON.stringify(a.daten)})`);
    assert.ok(pruefeAntwort(a, String(a.wert).replace(".", ",")).ok, `${id}: Antwort nicht akzeptiert`);
    for (const f of a.fehler) assert.ok(Math.abs(f.wert - a.wert) > a.toleranz, `${id}: Fehlerwert trifft die Lösung`);
    assert.ok(isFinite(a.wert) && a.wert > 0, `${id}: Wert ${a.wert}`);
  }
});

test("Kongruenz: die Lösung passt zur Lage der Stücke", () => {
  for (let i = 0; i < 400; i++) {
    const a = neueAufgabe("geo-kongruenz");
    const soll = { sss: "SSS", sws: "SWS", wsw: "WSW", ssw: "SsW", sswKlein: "nicht eindeutig", www: "nicht eindeutig" }[a.daten.fall];
    assert.equal(a.optionen[a.richtig], soll);
  }
});

test("Verdrahtung: Werkzeug, Station, Unterthemen und Lernpfad", () => {
  assert.ok(WERKZEUGE.normalverteilung);
  assert.equal(wo("normalverteilung").station.id, "normal");
  for (const k of ["kreis", "prismen", "kugel", "dreiecke", "strahlen", "ksNormal", "winkelkreis", "koerper"]) {
    const us = unterthemen(k);
    assert.ok(us.some((u) => u.gen.length), `${k}: kein Unterthema mit Übungen`);
  }
  for (const u of unterthemen("ksNormal")) assert.equal(u.wz, "normalverteilung");
  for (const k of ["geometrie.dreieck", "geometrie.kreiskoerper", "geometrie.aehnlich", "stochastik.normal"]) assert.ok(STATION_GENERATOREN[k].length >= 1, k);
});
