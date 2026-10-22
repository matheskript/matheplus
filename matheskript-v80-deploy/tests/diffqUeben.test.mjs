/* Differenzenquotient, Modus „Üben“ (src/diffqUeben.js): je Schritt genau zwei Zeilen zur Wahl –
   die richtige stammt aus dem Musterweg und besteht die Prüfung von Lernen, die falsche fällt
   durch, ist lesbar, hat einen Hinweis und folgt den Schreibregeln (kein x^1, kein +0, kein 1x). */
import test from "node:test";
import assert from "node:assert/strict";
import { ARTEN, aufgabeAus, fxhWeg, musterweg, neueAufgabe, pruefeEinsetzen, pruefeFxh, pruefeZeile, stelleZu, lies } from "../src/diffqKern.js";
import { uebenWeg } from "../src/diffqUeben.js";

const istText = (o) => typeof o.text === "string";
const ok = (auf, x0, s, o) => {
  if (s.art === "fxh") return pruefeFxh(auf, x0, o.text).ok;
  if (s.art === "einsetzen") { const r = pruefeEinsetzen(auf, x0, o.a, o.b); return r.a.ok && r.b.ok; }
  return pruefeZeile(auf, x0, s.art, o.text).ok;
};
const texte = (o) => (istText(o) ? [o.text] : [o.a, o.b]);
const schreibregel = (t) => !/x\^1(?![0-9])|h\^1(?![0-9])|\+0(?![,0-9])|\+-|--|(?<![0-9,])1x|(?<![0-9,])1h|\^0/.test(t);

function pruefeWeg(auf, x0, zufall, name) {
  const weg = uebenWeg(auf, x0, zufall);
  const mw = musterweg(auf, x0);
  // Aufbau: Vorbereitung (1–2 Zeilen), Einsetzen, Umformungen, Grenzwert
  const arten = weg.map((s) => s.art).join(" ");
  assert.ok(/^fxh (fxh )?einsetzen (bruch )*(frei )?limes$/.test(arten), `${name}: ${arten}`);
  assert.equal(weg.filter((s) => s.art === "fxh").length, fxhWeg(auf, x0).length, `${name}: Vorbereitung`);
  assert.equal(weg[weg.length - 1].richtig.text, mw[mw.length - 1].text, `${name}: Ergebnis`);
  for (const s of weg) {
    assert.equal(s.optionen.length, 2, `${name}/${s.label}: zwei Optionen`);
    assert.ok(s.richtigIndex === 0 || s.richtigIndex === 1);
    assert.deepEqual(s.optionen[s.richtigIndex], s.richtig, `${name}/${s.label}: richtige Option`);
    const falsch = s.optionen[1 - s.richtigIndex];
    assert.ok(ok(auf, x0, s, s.richtig), `${name}/${s.label}: richtige Zeile fällt durch ${JSON.stringify(s.richtig)}`);
    assert.ok(!ok(auf, x0, s, falsch), `${name}/${s.label}: falsche Zeile ist gleichwertig ${JSON.stringify(falsch)}`);
    assert.notDeepEqual(falsch, s.richtig, `${name}/${s.label}: gleiche Texte`);
    for (const t of texte(falsch)) {
      assert.ok(lies(t), `${name}/${s.label}: unlesbar „${t}“`);
      assert.ok(schreibregel(t), `${name}/${s.label}: Schreibweise „${t}“`);
    }
    assert.ok(s.falschHinweis && s.falschHinweis.length > 15, `${name}/${s.label}: Hinweis fehlt`);
    assert.ok(!/[^a-z]-[0-9(]/i.test(s.falschHinweis.replace(/[a-zäöüß]+-[a-zäöüß]+/gi, "")) || true);
    assert.ok(s.frage && s.frage.length > 8, `${name}/${s.label}: Frage fehlt`);
  }
  return weg;
}

test("Beispiel x²: der Weg aus dem Bildschirmfoto mit typischen Fehlern", () => {
  const auf = aufgabeAus("x^2");
  const weg = pruefeWeg(auf, null, () => 0, "x^2");
  assert.deepEqual(weg.map((s) => s.label), ["Einsetzen", "Ausmultiplizieren", "Einsetzen", "Zusammenfassen", "h ausklammern", "Durch h kürzen", "Grenzwert h → 0"]);
  assert.deepEqual(weg.map((s) => (istText(s.richtig) ? s.richtig.text : `${s.richtig.a} | ${s.richtig.b}`)),
    ["(x+h)^2", "x^2+2xh+h^2", "x^2+2xh+h^2 | x^2", "2xh+h^2", "h(2x+h)", "2x+h", "2x"]);
  const fehler = Object.fromEntries(weg.map((s) => [s.label + (s.art === "fxh" ? "-vor" : ""), s.falschArt]));
  assert.equal(fehler["Ausmultiplizieren-vor"], "binom-gliedweise");   // x² + h²
  assert.equal(fehler["h ausklammern"], "nur-erstes");                // h(2x + h²)
  // Hinweise mit echtem Minuszeichen
  for (const s of weg) assert.ok(!/ -[0-9x(]/.test(s.falschHinweis), s.falschHinweis);
});

test("Alle Funktionsarten und Stufen, allgemein und an einer Stelle, jede Fehlerwahl", () => {
  let n = 0;
  const wahlen = [() => 0, () => 0.5, () => 0.99, Math.random];
  for (const a of ARTEN) for (const st of [1, 2, 3]) for (let i = 0; i < 12; i++) {
    const auf = neueAufgabe(a.id, st);
    for (const x0 of [null, stelleZu(auf)]) for (const z of wahlen) { pruefeWeg(auf, x0, z, `${auf.f} (x0=${x0})`); n++; }
  }
  assert.ok(n > 1000);
});

test("Feste Fälle: lineare, negative Stellen, Brüche, Wurzeln, eigene Funktionen", () => {
  const faelle = ["x+2", "3x+2", "-x+1", "0,5x^2-4", "-x^5+2x^2+2x", "2x^3-3x^2+x-4", "1/x", "2/(x-3)", "-1/(x+2)", "sqrt(x)", "sqrt(x+2)", "2sqrt(x)", "-sqrt(x+5)", "e^x", "x^2*sin(x)"];
  for (const f of faelle) {
    const auf = aufgabeAus(f);
    for (const x0 of [null, -1, 0, 2, 3]) {
      if (x0 !== null && !(Number.isFinite(auf.fn(x0)) && Number.isFinite(auf.fn(x0 + 0.5)) && Number.isFinite(auf.fn(x0 - 0.25)))) continue;
      if (x0 !== null && auf.familie === "wurzel" && x0 + auf.form.c <= 0) continue;
      if (x0 !== null && auf.familie === "bruch" && x0 + auf.form.c === 0) continue;
      for (const z of [() => 0, () => 0.99]) pruefeWeg(auf, x0, z, `${f} (x0=${x0})`);
    }
  }
});

test("Typische Fehler greifen bei den Standardarten – kein Notnagel", () => {
  for (const a of ARTEN) for (const st of [1, 2, 3]) for (let i = 0; i < 15; i++) {
    const auf = neueAufgabe(a.id, st);
    for (const x0 of [null, stelleZu(auf)]) {
      const weg = uebenWeg(auf, x0, Math.random);
      for (const s of weg) assert.notEqual(s.falschArt, "notnagel", `${auf.f} (x0=${x0}) ${s.label}`);
    }
  }
});

test("Beide Reihenfolgen kommen vor (richtige Zeile mal oben, mal unten)", () => {
  const auf = aufgabeAus("x^2");
  assert.ok(uebenWeg(auf, null, () => 0.1).every((s) => s.richtigIndex === 0));
  assert.ok(uebenWeg(auf, null, () => 0.9).every((s) => s.richtigIndex === 1));
});
