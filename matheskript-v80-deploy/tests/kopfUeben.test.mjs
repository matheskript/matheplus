/* Modus „Üben“ im Kopfrechnen (src/kopfWeg.js `ueben`-Einträge + src/kopfUeben.js): Für jedes Thema und viele
   Zufallsaufgaben hat jeder Wahl-Schritt genau eine richtige Karte (= Zwischenergebnis des Rechenwegs), bis zu drei
   falsche (verschieden, mit Hinweis, nie gleich dem richtigen Wert), und jedes Thema hat mindestens einen Wahl-Schritt. */
import test from "node:test";
import assert from "node:assert/strict";
import { RECHNEN_THEMEN, wegPlusMinus, wegMultiplizieren, wegWurzel, wegDivision, wegBruch, wegPrimfaktoren, wegQuadrat } from "../src/kopfWeg.js";
import { uebenWeg, wahlZahl } from "../src/kopfUeben.js";

const zuf = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function pruefeWeg(r, wo) {
  assert.ok(r.ok, `${wo}: Rechenweg nicht ok (${r.hinweis})`);
  const schritte = uebenWeg(r, () => 0.42);
  assert.equal(schritte.length, r.schritte.length, `${wo}: Schrittzahl`);
  for (const s of schritte) {
    if (s.art === "info") continue;
    assert.ok(s.frage && s.frage.length > 3, `${wo}: Frage fehlt`);
    assert.ok(s.optionen.length >= 2 && s.optionen.length <= 4, `${wo}: ${s.optionen.length} Optionen bei „${s.frage}“`);
    assert.ok(s.optionen[0].richtig, `${wo}: erste Option nicht richtig`);
    const keys = s.optionen.map((o) => o.key);
    assert.equal(new Set(keys).size, keys.length, `${wo}: doppelte Karten ${keys}`);
    for (const o of s.optionen.slice(1)) {
      assert.ok(!o.richtig && o.wert.text !== s.richtig.text, `${wo}: falsche Karte gleich der richtigen`);
      assert.ok(o.hinweis && o.hinweis.length > 8, `${wo}: Hinweis fehlt bei ${o.wert.text}`);
      assert.ok(!/NaN|undefined/.test(o.wert.text), `${wo}: unlesbar ${o.wert.text}`);
    }
  }
  return schritte;
}

test("Alle Themen: Startwerte und 60 Zufallsaufgaben je Thema", () => {
  for (const [id, th] of Object.entries(RECHNEN_THEMEN)) {
    const start = Object.fromEntries(th.felder.map((f) => [f.id, f.start]));
    const zahlen = (w) => { const z = {}; th.felder.forEach((f) => { if (f.zeige && !f.zeige(w)) return; z[f.id] = f.art === "zahl" ? Number(w[f.id]) : w[f.id]; }); return z; };
    const s0 = pruefeWeg(th.rechne(zahlen(start)), `${id} Start`);
    assert.ok(wahlZahl(s0) >= 1, `${id}: Startaufgabe ohne Wahl-Schritt`);
    for (let i = 0; i < 60; i++) {
      const w = { ...start, ...th.zufall(zahlen(start)) };
      // Wahl-Felder zufällig durchspielen (Rechenart, Quadrat/Kubik/Wurzel)
      th.felder.filter((f) => f.art === "wahl").forEach((f) => { w[f.id] = f.optionen[i % f.optionen.length][0]; });
      const w2 = { ...w, ...th.zufall(zahlen(w)) };
      const r = th.rechne(zahlen(w2));
      if (!r.ok) continue;   // z. B. Minus mit negativem Ergebnis nach Wechsel der Rechenart
      const s = pruefeWeg(r, `${id} ${JSON.stringify(zahlen(w2))}`);
      assert.ok(wahlZahl(s) >= 1, `${id}: keine Wahl bei ${JSON.stringify(zahlen(w2))}`);
    }
  }
});

test("Plus 478 + 256: Spalten als Wahl, Übertrag als Fehler", () => {
  const s = uebenWeg(wegPlusMinus(478, 256, "+"), () => 0.1);
  const einer = s[1];
  assert.equal(einer.art, "wahl");
  assert.equal(einer.richtig.text, "14");
  assert.ok(einer.optionen.some((o) => o.wert.text === "13" || o.wert.text === "15"));
  const zehner = s[2];
  assert.equal(zehner.richtig.text, "13");
  assert.ok(zehner.optionen.some((o) => o.wert.text === "12" && /Übertrag/.test(o.hinweis)), "Übertrag-vergessen fehlt");
  assert.equal(s[s.length - 1].richtig.text, "734");
});

test("Minus 503 − 278: Ergänzen mit Übertrag", () => {
  const s = uebenWeg(wegPlusMinus(503, 278, "−"), () => 0.1);
  assert.equal(s[1].richtig.text, "5");    // 8 + 5 = 13
  assert.equal(s[2].richtig.text, "2");    // 7 + 1 = 8, 8 + 2 = 10
  assert.equal(s[s.length - 1].richtig.text, "225");
});

test("Mal 23 · 14: Teilprodukte und Addition", () => {
  const s = uebenWeg(wegMultiplizieren(23, 14), () => 0.3);
  const wahlen = s.filter((x) => x.art === "wahl").map((x) => x.richtig.text);
  assert.deepEqual(wahlen, ["230", "92", "322"]);
});

test("Wurzel 3025: Endziffer, Zehner, Mitte", () => {
  const s = uebenWeg(wegWurzel(3025), () => 0.3);
  const wahlen = s.filter((x) => x.art === "wahl");
  assert.equal(wahlen[0].richtig.text, "5");
  assert.equal(wahlen[1].richtig.text, "5");
  assert.equal(wahlen[wahlen.length - 1].richtig.text, "55");
  const s2 = uebenWeg(wegWurzel(5329), () => 0.3);
  const w2 = s2.filter((x) => x.art === "wahl");
  assert.equal(w2[0].richtig.text, "3 oder 7");
  assert.equal(w2[1].richtig.text, "7");
  assert.equal(w2[2].richtig.text, "73");
  assert.ok(w2[2].optionen.some((o) => o.wert.text === "77"), "anderer Kandidat fehlt");
});

test("Division 756 : 4 und Rest, Brüche, Primfaktoren, Quadrat", () => {
  const d = uebenWeg(wegDivision(756, 4), () => 0.3).filter((x) => x.art === "wahl").map((x) => x.richtig.text);
  assert.deepEqual(d, ["1", "3", "8", "3", "9", "0", "189"]);
  const b = uebenWeg(wegBruch("plus", 1, 2, 1, 3), () => 0.3).filter((x) => x.art === "wahl").map((x) => x.richtig.text);
  assert.deepEqual(b, ["6", "{3|6} + {2|6}", "{5|6}"]);
  const k = uebenWeg(wegBruch("kuerzen", 12, 18), () => 0.3).filter((x) => x.art === "wahl").map((x) => x.richtig.text);
  assert.deepEqual(k, ["{2|3}"]);
  const g = uebenWeg(wegBruch("geteilt", 2, 3, 4, 5), () => 0.3).filter((x) => x.art === "wahl").map((x) => x.richtig.text);
  assert.equal(g[0], "{2|3} · {5|4}");
  assert.equal(g[g.length - 1], "{5|6}");
  const p = uebenWeg(wegPrimfaktoren(84), () => 0.3).filter((x) => x.art === "wahl").map((x) => x.richtig.text);
  assert.deepEqual(p, ["2", "2", "3", "7", "2² · 3 · 7"]);
  const q = uebenWeg(wegQuadrat(23), () => 0.3).filter((x) => x.art === "wahl").map((x) => x.richtig.text);
  assert.deepEqual(q, ["120", "529"]);
});
