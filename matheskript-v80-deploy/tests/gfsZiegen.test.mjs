/* GFS · Das Ziegenproblem (gfsZiegen.js)
   Mathematik gegen eine unabhängige, exakte Aufzählung aller Fälle geprüft, Simulation gegen
   das Gesetz der großen Zahlen, Generatoren über viele Startwerte, A5 in allen Lösungstexten. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  zufallszahlen, wuerfelAus, ggT, liesBruch, bruch, wert, mal, plus, gleich, bTex, bText, dk,
  gewinnBleiben, gewinnWechseln, uebrig, moderatorOeffnet, runde, simuliere, liesWkt, liesZahl, trifft,
  ARTEN, SZENARIEN, aufgabe, felder, auftrag, pruefe, rechenweg, tipp, gemischt, FAELLE, dreihundert,
  GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "../src/gfsZiegen.js";

/* Dieselben Muster wie tests/a5.test.mjs – nichts bleibt unvereinfacht stehen */
const N = String.raw`\d+(?:[.,]\d+)?`;
const A5 = [
  new RegExp(String.raw`(?:^|=)\s*${N}\s*[+−\-]\s*${N}\s*$`), new RegExp(String.raw`(?:^|=)\s*${N}\s*(?:·|\\cdot|\*)\s*${N}\s*$`),
  /(^|[^\d.,\w])1\s*(?:·|\\cdot)?\s*x(?![\w])/, /\+\s*[−-]\s*\d/, /[−-]\s*[−-]\s*\d/, /(?:·|\\cdot)\s*1(?![\d,.\/^])/, /[+−-]\s*0(?![\d,.])\s*$/,
  /(?<!_\{[^}]*\}|_-?\d)\^\{?1\}?(?![\d])/,
];
const a5ok = (z) => A5.every((m) => !m.test(z));
/* Brüche in TeX müssen gekürzt sein (\frac{4}{6} wäre unvereinfacht) – außer h = G/N, das direkt als Dezimalzahl weitergeht */
const gekuerzt = (z) => [...z.matchAll(/\\frac\{(\d+)\}\{(\d+)\}/g)].every(([, a, b]) => ggT(+a, +b) === 1);

/* ---------- Unabhängige exakte Aufzählung ----------
   n Türen, du wählst Tür 0. Für jede Autoposition liefert `moderator` die möglichen Öffnungen mit
   Wahrscheinlichkeit (und ob er den Wechsel anbietet). Bedingung = was du beobachtet hast.
   Ergebnis: P(Wechseln gewinnt | Bedingung), Wechsel gleichmäßig auf die übrigen geschlossenen Türen. */
const teilmengen = (liste, k) => (k === 0 ? [[]] : liste.flatMap((x, i) => teilmengen(liste.slice(i + 1), k - 1).map((r) => [x, ...r])));
function exakt(n, moderator, bedingung = () => true) {
  let zaehler = 0, nenner = 0;
  for (let auto = 0; auto < n; auto++) {
    for (const { offen, p, angebot = true } of moderator(auto)) {
      if (!angebot || !bedingung(offen, auto)) continue;
      const pw = p / n;
      nenner += pw;
      const zu = [];
      for (let i = 1; i < n; i++) if (!offen.includes(i)) zu.push(i);
      if (zu.includes(auto)) zaehler += pw / zu.length;
    }
  }
  return zaehler / nenner;
}
/* wissender Moderator: k zufällige Nieten außer deiner Tür */
const wissend = (n, k) => (auto) => {
  const nieten = []; for (let i = 1; i < n; i++) if (i !== auto) nieten.push(i);
  const alle = teilmengen(nieten, k);
  return alle.map((offen) => ({ offen, p: 1 / alle.length }));
};
/* ahnungsloser Moderator: k zufällige Türen außer deiner – auch die Autotür */
const ahnungslos = (n, k) => () => {
  const andere = []; for (let i = 1; i < n; i++) andere.push(i);
  const alle = teilmengen(andere, k);
  return alle.map((offen) => ({ offen, p: 1 / alle.length }));
};
const nurNieten = (offen, auto) => !offen.includes(auto);
const nah = (x, y) => Math.abs(x - y) < 1e-12;
const dezimalVon = (v) => dk(v, v >= 0.1 ? 2 : 4);

test("Brüche und Eingaben", () => {
  assert.deepEqual(bruch(4, 6), { z: 2, n: 3 });
  assert.deepEqual(mal(bruch(2, 3), bruch(3, 4)), { z: 1, n: 2 });
  assert.deepEqual(plus(bruch(1, 3), bruch(1, 3)), { z: 2, n: 3 });
  assert.ok(gleich(bruch(2, 4), bruch(1, 2)));
  assert.equal(bTex(bruch(2, 3)), "\\frac{2}{3}"); assert.equal(bTex(bruch(3, 3)), "1"); assert.equal(bText(bruch(0, 5)), "0");
  assert.equal(liesWkt("2/3"), 2 / 3); assert.equal(liesWkt(" 0,67 "), 0.67); assert.equal(liesWkt("66,7 %"), 0.667);
  assert.equal(liesWkt(",5"), 0.5); assert.equal(liesWkt("1"), 1); assert.equal(liesWkt("2/0"), null); assert.equal(liesWkt("zwei"), null); assert.equal(liesWkt(""), null);
  assert.equal(liesZahl("1 200"), 1200); assert.equal(liesZahl("12,5"), 12.5); assert.equal(liesZahl("x"), null);
  assert.ok(trifft(0.67, 2 / 3) && trifft(liesWkt("67%"), 2 / 3) && !trifft(0.6, 2 / 3) && !trifft(null, 0.5));
  assert.ok(trifft(0.0436, 12 / 275) && !trifft(0.04, 12 / 275), "kleine Werte genauer");
  assert.deepEqual(liesBruch("12 / 275"), { z: 12, n: 275 }); assert.equal(liesBruch("0,5"), null);
  assert.equal(dk(2 / 3), "0,667");
});

test("Drei Türen: Bleiben 1/3, Wechseln 2/3 – exakt aufgezählt", () => {
  assert.ok(gleich(gewinnBleiben(3), bruch(1, 3)));
  assert.ok(gleich(gewinnWechseln(3, 1), bruch(2, 3)));
  assert.ok(nah(exakt(3, wissend(3, 1)), 2 / 3));
  // auch unter der Bedingung „er hat Tür 3 geöffnet“ (Index 2)
  assert.ok(nah(exakt(3, wissend(3, 1), (o) => o[0] === 2), 2 / 3));
  // Fallunterscheidung der Herleitung
  assert.equal(FAELLE.length, 3);
  assert.equal(FAELLE.filter((f) => f.wechseln).length, 2);
  assert.equal(FAELLE.filter((f) => f.bleiben).length, 1);
  assert.ok(FAELLE.every((f) => f.bleiben !== f.wechseln));
  // 300 Spiele: wissend 100 von 150, ahnungslos 50 von 100
  const w = dreihundert(true), a = dreihundert(false);
  assert.equal(w.summe, 150); assert.ok(gleich(w.wechseln, bruch(2, 3)));
  assert.equal(a.summe, 100); assert.ok(gleich(a.wechseln, bruch(1, 2)));
});

test("n Türen, k geöffnet: Formel = exakte Aufzählung, Wechseln schlägt Bleiben für k ≥ 1", () => {
  for (let n = 3; n <= 8; n++) for (let k = 0; k <= n - 2; k++) {
    const formel = wert(gewinnWechseln(n, k));
    assert.ok(nah(formel, exakt(n, wissend(n, k))), `n = ${n}, k = ${k}`);
    assert.ok(nah(formel, (n - 1) / (n * (n - 1 - k))));
    assert.equal(uebrig(n, k), n - 1 - k);
    if (k === 0) assert.ok(nah(formel, 1 / n), "ohne Öffnen ist Wechseln wie Bleiben");
    else assert.ok(formel > wert(gewinnBleiben(n)), `n = ${n}, k = ${k}`);
  }
  assert.ok(gleich(gewinnWechseln(100), bruch(99, 100)));
});

test("Ahnungsloser Moderator: nach lauter Nieten steht es 1:1", () => {
  for (let n = 3; n <= 7; n++) assert.ok(nah(exakt(n, ahnungslos(n, n - 2), nurNieten), 1 / 2), `n = ${n}`);
});

test("Moderator-Szenarien: angegebene Lösung = exakte Aufzählung", () => {
  const drei = (id) => {
    if (id === "wissend") return exakt(3, wissend(3, 1));
    if (id === "ahnungslos") return exakt(3, ahnungslos(3, 1), nurNieten);
    if (id === "engel") return exakt(3, (auto) => wissend(3, 1)(auto).map((x) => ({ ...x, angebot: auto !== 0 })));
    if (id === "teufel") return exakt(3, (auto) => wissend(3, 1)(auto).map((x) => ({ ...x, angebot: auto === 0 })));
    /* Vorliebe: bei zwei Nieten (Auto hinter deiner Tür) die kleinere Nummer, also Index 1 = Tür 2 */
    const vorliebe = (auto) => [{ offen: [auto === 0 ? 1 : auto === 1 ? 2 : 1], p: 1 }];
    if (id === "vorliebeZu") return exakt(3, vorliebe, (o) => o[0] === 2);
    if (id === "vorliebeOffen") return exakt(3, vorliebe, (o) => o[0] === 1);
    return null;
  };
  for (const sz of SZENARIEN) {
    const ns = sz.zahl ? [4, 5, 6, 7] : [3];
    for (const n of ns) {
      const soll = sz.id === "wissendN" ? exakt(n, wissend(n, n - 2)) : sz.id === "ahnungslosN" ? exakt(n, ahnungslos(n, n - 2), nurNieten) : drei(sz.id);
      assert.ok(soll !== null && nah(wert(sz.richtig(n)), soll), `${sz.id} n = ${n}: ${bText(sz.richtig(n))} statt ${soll}`);
      const werte = sz.optionen(n).map(wert);
      assert.equal(new Set(werte.map((v) => v.toFixed(9))).size, 4, `${sz.id}: Optionen verschieden`);
      assert.ok(sz.optionen(n).some((o) => gleich(o, sz.richtig(n))), `${sz.id}: Lösung unter den Optionen`);
      assert.ok(sz.text(n).endsWith("?") && sz.erklaerung(n).length >= 1);
    }
  }
});

test("Runden und Simulation: Gesetz der großen Zahlen, gleicher Startwert = gleiche Folge", () => {
  const r1 = zufallszahlen(42), r2 = zufallszahlen(42);
  for (let i = 0; i < 50; i++) assert.equal(r1(), r2());
  const rnd = zufallszahlen(7);
  for (let i = 0; i < 2000; i++) {
    const r = runde(3, rnd);
    assert.ok(!r.offen.includes(r.auto) && !r.offen.includes(r.erste) && r.offen.length === 1);
    assert.ok(r.wechsel !== r.erste && !r.offen.includes(r.wechsel));
    assert.ok(r.bleibenGewinnt !== r.wechselnGewinnt, "bei drei Türen gewinnt genau eine Strategie");
  }
  const s = simuliere(200000, 3, zufallszahlen(2026));
  assert.equal(s.bleiben + s.wechseln, 200000);
  assert.ok(Math.abs(s.wechseln / s.N - 2 / 3) < 0.005, String(s.wechseln / s.N));
  const zehn = simuliere(100000, 10, zufallszahlen(9), 4);
  assert.ok(Math.abs(zehn.wechseln / zehn.N - wert(gewinnWechseln(10, 4))) < 0.006);
  assert.ok(Math.abs(zehn.bleiben / zehn.N - 0.1) < 0.006);
  const v = simuliere(50, 3, zufallszahlen(3), 1, true);
  assert.equal(v.kurve.length, 50);
  assert.ok(v.kurve.every(([b, w]) => nah(b + w, 1)));
  // Moderator öffnet nur erlaubte Türen, auch bei vielen Türen
  const rr = zufallszahlen(11);
  for (let i = 0; i < 500; i++) {
    const o = moderatorOeffnet(100, 17, 42, 98, rr);
    assert.equal(o.length, 98); assert.ok(!o.includes(17) && !o.includes(42));
  }
});

/* Antworten, die ein Schüler typischerweise falsch gibt – jede muss erkannt werden und eine Begründung bekommen */
function typischFalsch(a) {
  if (a.art === "grundtyp") return [{ ...a.loesung, b: "1/2" }, { ...a.loesung, w: "1/2" }, { ...a.loesung, w: bText(bruch(1, a.n - a.k)) }];
  if (a.art === "baum") return [{ ...a.loesung, a: a.loesung.b, b: a.loesung.a }, { ...a.loesung, d: dk(wert(a.soll.b) + wert(a.soll.c)) }];
  if (a.art === "haeufigkeit") return [{ ...a.loesung, h: String(a.G) }, { ...a.loesung, E: String(a.M / 2 + 7) === a.loesung.E ? "0" : String(a.M / 2) }];
  return a.optionen.map((_, i) => i).filter((i) => i !== a.richtig);
}

test("Generatoren: über viele Startwerte stabil, lösbar, Rückmeldung zu typischen Fehlern, A5-sauber", () => {
  const exaktCache = new Map();
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) for (let seed = 1; seed <= 300; seed++) {
    const zufall = wuerfelAus(zufallszahlen(seed * 31 + s));
    const a = aufgabe(id, s, zufall);
    const wo = `${id} Stufe ${s} Startwert ${seed}`;
    assert.equal(a.art, id, wo);
    assert.ok(auftrag(a).length > 40 && tipp(a).length > 10, wo);
    if (id === "moderator") {
      assert.equal(pruefe(a, a.richtig).ok, true, wo);
      assert.deepEqual([...a.reihenfolge].sort(), [0, 1, 2, 3]);
      for (const i of typischFalsch(a)) { const e = pruefe(a, i); assert.equal(e.ok, false); assert.ok(e.grund.length > 20, `${wo}: ${a.szenario} Option ${i}`); }
      for (const z of [...a.erklaerung, ...a.fehler]) assert.ok(a5ok(z.replace(/\$/g, "")), `${wo}: ${z}`);
      continue;
    }
    // Lösung wird als richtig erkannt – auch als Dezimalzahl
    assert.equal(pruefe(a, a.loesung).ok, true, `${wo}: ${JSON.stringify(a.loesung)}`);
    const dezimal = Object.fromEntries(felder(a).map(([k, , , typ]) => [k, typ === "zahl" ? a.loesung[k] : dezimalVon(typeof a.soll[k] === "number" ? a.soll[k] : wert(a.soll[k]))]));
    assert.equal(pruefe(a, dezimal).ok, true, `${wo}: dezimal ${JSON.stringify(dezimal)}`);
    // typische Fehler
    for (const f of typischFalsch(a)) {
      const e = pruefe(a, f);
      if (e.ok) continue;      // falsche Antwort kann zufällig stimmen (z. B. n − k = 2 → 1/2 ist dann korrekt)
      assert.ok(e.grund.length > 20, `${wo}: ${JSON.stringify(f)}`);
    }
    // leere Eingabe
    assert.equal(pruefe(a, {}).ok, false);
    for (const z of rechenweg(a)) {
      assert.ok(a5ok(z), `${wo}: ${z}`);
      if (id !== "haeufigkeit") assert.ok(gekuerzt(z), `${wo}: ungekürzt ${z}`);
    }
    if (id === "grundtyp" || id === "baum") {
      assert.ok(a.n >= 3 && a.k >= 1 && a.k <= a.n - 2, wo);
      if (s === 1) assert.ok(a.n === 3 && a.k === 1);
      if (a.n <= 8) {
        const key = `${a.n}/${a.k}`;
        if (!exaktCache.has(key)) exaktCache.set(key, exakt(a.n, wissend(a.n, a.k)));
        const w = id === "grundtyp" ? a.soll.w : a.soll.d;
        assert.ok(nah(wert(w), exaktCache.get(key)), `${wo}: ${bText(w)}`);
      }
      if (id === "baum") {
        assert.ok(gleich(plus(a.soll.a, a.soll.b), bruch(1, 1)));
        assert.ok(gleich(a.soll.d, mal(a.soll.b, a.soll.c)));
      }
    }
    if (id === "haeufigkeit") {
      assert.ok(a.G >= 0 && a.G <= a.N && Number.isInteger(a.G), wo);
      assert.ok(Number.isInteger(a.soll.E) && a.soll.E > 0, `${wo}: Erwartung ganzzahlig`);
      if (s >= 3) assert.ok(Number.isInteger(a.soll.Eb));
      assert.ok(Math.abs(liesWkt(a.loesung.h) - a.G / a.N) < 0.0006);
    }
  }
});

test("Generatoren: Zufallsergebnis passt zur Wahrscheinlichkeit (Häufigkeiten im Mittel nahe p)", () => {
  let summe = 0, runden = 0;
  for (let seed = 1; seed <= 400; seed++) {
    const a = aufgabe("haeufigkeit", 1, wuerfelAus(zufallszahlen(seed)));
    summe += a.G; runden += a.N;
  }
  assert.ok(Math.abs(summe / runden - 2 / 3) < 0.02, String(summe / runden));
});

test("Mischen, Gliederung, Tipps, Kolloquium", () => {
  for (let salz = 0; salz < 12; salz++) assert.deepEqual([...gemischt([1, 2, 3, 4], salz)].sort(), [0, 1, 2, 3]);
  assert.equal(GLIEDERUNG.length, 5);
  assert.ok(GLIEDERUNG.reduce((s, g) => s + g.min, 0) >= 15);
  assert.equal(TIPPS.length, 3);
  assert.ok(KOLLOQUIUM.length >= 6);
  assert.ok(KOLLOQUIUM.every((q) => q.frage.endsWith("?") && q.antwort.length > 60 && ["Basis", "Vertiefung", "Profi"].includes(q.stufe)));
  for (const st of ["Basis", "Vertiefung", "Profi"]) assert.ok(KOLLOQUIUM.some((q) => q.stufe === st), st);
  for (const t of [...GLIEDERUNG.map((g) => g.text), ...TIPPS, ...KOLLOQUIUM.map((q) => q.antwort)]) assert.ok(a5ok(t), t);
});

test("Seite: Exporte, mindestens drei Animationen, TeX in Attributen nur als {\"…\"}", () => {
  const q = readFileSync(new URL("../src/funcGfsZiegen.jsx", import.meta.url), "utf8");
  assert.match(q, /export function GfsZiegenSeite\(\{ gehe \}\)/);
  assert.match(q, /export function ZiegenBild\(/);
  assert.match(q, /viewBox="0 0 160 120"/);
  const anims = [...q.matchAll(/<ZiegenAnimation art="([a-z-]+)"/g)].map((m) => m[1]);
  assert.ok(new Set(anims).size >= 3, `Animationen: ${anims}`);
  for (const a of anims) assert.match(q, new RegExp(`\\n  "?${a}"?: \\{ titel:`), `Szene ${a} fehlt`);
  assert.doesNotMatch(q, /\s[a-zA-Z]+="[^"{}]*\\\\[a-zA-Z{]/);
  for (const b of ["Formeln", "Schritt", "Kasten", "Chip", "RoterFaden", "Kolloquium"]) assert.match(q, new RegExp(`\\b${b}\\b`));
  assert.match(q, /from "\.\/funcGfsBausteine\.jsx"/);
  assert.match(q, /AnimKarte/);
});
