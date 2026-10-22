/* Wurzel-Motion (Kopfrechnen √10k, src/wurzelMotion.js): langsam genug zum Mitlesen, richtige Rechnung, Inhalt wie gewünscht */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DREHBUCH, LESEN, WURZEL_BEISPIELE, WURZEL_START, WURZEL_PAARE, PAAR_ZEIT, KANDIDATEN, FOLGERUNG, drehbuchZeit, wurzelInfo, wurzelSchritte, wurzelZeiten } from "../src/wurzelMotion.js";

test("Jeder Schritt lässt Zeit zum Mitlesen: Lesezeit + 2,5 s, mindestens 1,5-mal das Drehbuch", () => {
  for (const N of WURZEL_BEISPIELE) {
    const I = wurzelInfo(N), { s, dauer } = wurzelZeiten(I.zwei), a = DREHBUCH(I.zwei);
    const ende = [...s.slice(1), dauer], aEnde = [...a.s.slice(1), a.dauer];
    assert.equal(s.length, a.s.length);
    wurzelSchritte(I).forEach((x, i) => {
      const d = ende[i] - s[i];
      assert.ok(d >= LESEN(x.text) + 2.5 - 0.01, `${N}, Schritt ${i + 1}: ${d} s für ${x.text.length} Zeichen`);
      assert.ok(d >= 1.5 * (aEnde[i] - a.s[i]) - 0.01, `${N}, Schritt ${i + 1}: schneller als 1,5 × Drehbuch`);
    });
    assert.ok(dauer <= 120, `${N}: länger als zwei Minuten`);
  }
});

test("Abspielzeit → Drehbuch: Schrittgrenzen fallen zusammen, monoton, Ende = Ende", () => {
  for (const zwei of [false, true]) {
    const n = wurzelZeiten(zwei), a = DREHBUCH(zwei);
    n.s.forEach((v, i) => assert.ok(Math.abs(drehbuchZeit(v, zwei) - a.s[i]) < 1e-9));
    assert.equal(drehbuchZeit(n.dauer, zwei), a.dauer);
    let alt = -1;
    for (let t = 0; t <= n.dauer; t += 0.25) { const d = drehbuchZeit(t, zwei); assert.ok(d >= alt); alt = d; }
  }
  /* die sechs Endziffern-Paare passen in Schritt 3 des Drehbuchs */
  const { s } = DREHBUCH(false);
  assert.ok(s[2] + PAAR_ZEIT[PAAR_ZEIT.length - 1] + 1.5 < s[3]);
});

test("Reihenfolge: 10² oben, 1² unten; Zehnerquadrat-Leiter ebenso", () => {
  const q = readFileSync(new URL("../src/funcErklaeranimation.jsx", import.meta.url), "utf8");
  assert.match(q, /const LY = \(i\) => RY\(9 - i\)/);
  assert.match(q, /const leiterY = \(s\) => 194 \+ \(4 - s\) \* 36/);
  assert.match(q, /const t = drehbuchZeit\(tAbspiel, I\.zwei\)/);
});

test("Startbeispiel 3025 = 55²: zwischen 2500 und 3600, Endziffer 5 nur von 5", () => {
  assert.equal(WURZEL_START, 3025);
  assert.ok(WURZEL_BEISPIELE.includes(3025));
  const I = wurzelInfo(3025);
  assert.equal(I.gewaehlt, 55);
  assert.equal(I.unten, 2500);
  assert.equal(I.oben, 3600);
  assert.equal(I.zwei, false);
  const texte = wurzelSchritte(I).map((x) => x.text).join(" ");
  assert.match(texte, /zwischen 2500 = 50² und 3600 = 60²/i);
  assert.match(texte, /Die Wurzel aus 3025 ist 55/);
});

test("Rechnung stimmt für jede Quadratzahl von 11² bis 99² (Endziffer + Zehnerquadrate + näher dran)", () => {
  for (let n = 11; n <= 99; n++) {
    const I = wurzelInfo(n * n);
    assert.equal(I.gewaehlt, n, `${n * n}: ${I.gewaehlt} statt ${n}`);
    assert.ok(I.unten <= n * n && n * n < I.oben, `${n * n} liegt nicht zwischen ${I.unten} und ${I.oben}`);
    assert.ok(I.kand.includes(n % 10), `${n * n}: Endziffer ${n % 10} fehlt in den Kandidaten`);
  }
});

test("Endziffern-Paare: n² und (10 − n)² enden gleich, 25 und 100 allein – genau die Tabelle", () => {
  for (const p of WURZEL_PAARE) {
    for (const n of p.n) assert.equal((n * n) % 10, p.ende, `${n}² endet nicht auf ${p.ende}`);
    assert.deepEqual(p.zeilen, p.n.map((n) => n - 1));
    assert.deepEqual(KANDIDATEN[p.ende].map((k) => (k === 0 ? 10 : k)), p.n);
  }
  /* 2, 3, 7, 8 kommen als letzte Ziffer einer Quadratzahl nie vor */
  for (let n = 0; n < 100; n++) assert.ok(![2, 3, 7, 8].includes((n * n) % 10));
  assert.equal(FOLGERUNG.wurzel ** 2, FOLGERUNG.quadrat);
  assert.equal(FOLGERUNG.wurzel % 10, FOLGERUNG.einer);
  assert.ok(!WURZEL_BEISPIELE.includes(FOLGERUNG.quadrat), "Folgerung nimmt kein Beispiel vorweg");
});

test("Texte: alle Beispiele vollständig, Reihenfolge wie gewünscht, keine Gendersprache", () => {
  for (const N of WURZEL_BEISPIELE) {
    const I = wurzelInfo(N);
    const sch = wurzelSchritte(I);
    assert.equal(sch.length, I.zwei ? 8 : 7);
    const t = sch.map((x) => x.text);
    assert.match(t[0], /1, 4, 9, 16, 25, 36, 49, 64, 81 und 100/);
    assert.match(t[1], /zwei Nullen/);
    assert.match(t[2], /1 und 81.*4 und 64.*9 und 49.*16 und 36.*Nur 25/);
    assert.match(t[3], /Einerziffer|endet ihre Wurzel/);
    assert.match(t[5], new RegExp(`Zwischen ${I.unten} = ${I.z * 10}²`));
    assert.match(t[t.length - 1], new RegExp(`Probe: ${I.gewaehlt}² = ${N}`));
    assert.ok(!/:innen|\*innen|Innen\b/.test(t.join(" ")));
  }
});

test("Kopfrechnen √10k zeigt die Szene, der Film-Eintrag nennt die Dauer", () => {
  assert.match(readFileSync(new URL("../src/func14.jsx", import.meta.url), "utf8"), /modus === "wurzel10k" && <ErklaerAnimation art="wurzel"/);
  assert.match(readFileSync(new URL("../src/trainingszentrum.js", import.meta.url), "utf8"), /wurzel: \{[^}]*dauer: 103/);
  assert.match(readFileSync(new URL("../src/funcErklaeranimation.jsx", import.meta.url), "utf8"), /useState\(WURZEL_START\)/);
});
