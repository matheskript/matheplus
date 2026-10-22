/* Differenzenquotient, Modus „Üben“ (src/diffqUeben.js): je Schritt die richtige Zeile und bis zu drei
   falsche – die richtige stammt aus dem Musterweg und besteht die Prüfung von Lernen, jede falsche fällt
   durch, ist lesbar, hat einen Hinweis und folgt den Schreibregeln (kein x^1, kein +0, kein 1x). */
import test from "node:test";
import assert from "node:assert/strict";
import { ARTEN, aufgabeAus, fxhWeg, musterweg, neueAufgabe, pruefeEinsetzen, pruefeFxh, pruefeZeile, stelleZu, lies } from "../src/diffqKern.js";
import { uebenWeg } from "../src/diffqUeben.js";
import { sichtbareOptionen } from "../src/uebenKern.js";

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
    assert.ok(s.optionen.length >= 2 && s.optionen.length <= 4, `${name}/${s.label}: ${s.optionen.length} Optionen`);
    assert.ok(s.optionen[0].richtig && s.optionen.slice(1).every((o) => !o.richtig), `${name}/${s.label}: optionen[0] muss die richtige sein`);
    assert.deepEqual(s.optionen[0].wert, s.richtig, `${name}/${s.label}: richtige Option`);
    assert.ok(ok(auf, x0, s, s.richtig), `${name}/${s.label}: richtige Zeile fällt durch ${JSON.stringify(s.richtig)}`);
    assert.equal(new Set(s.optionen.map((o) => o.key)).size, s.optionen.length, `${name}/${s.label}: doppelte Optionen`);
    for (const o of s.optionen.slice(1)) {
      assert.ok(!ok(auf, x0, s, o.wert), `${name}/${s.label}: falsche Zeile ist gleichwertig ${JSON.stringify(o.wert)}`);
      for (const t of texte(o.wert)) {
        assert.ok(lies(t), `${name}/${s.label}: unlesbar „${t}“`);
        assert.ok(schreibregel(t), `${name}/${s.label}: Schreibweise „${t}“`);
      }
      assert.ok(o.hinweis && o.hinweis.length > 15, `${name}/${s.label}: Hinweis fehlt (${o.art})`);
    }
    // Jede Anzeigegröße enthält die richtige Zeile genau einmal
    for (const k of [2, 3, 4]) assert.equal(sichtbareOptionen(s, k).filter((o) => o.richtig).length, 1);
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
  const arten = Object.fromEntries(weg.map((s) => [s.label + (s.art === "fxh" ? "-vor" : ""), s.optionen.slice(1).map((o) => o.art)]));
  assert.ok(arten["Ausmultiplizieren-vor"].includes("binom-gliedweise"), arten["Ausmultiplizieren-vor"].join());   // x² + h²
  assert.ok(arten["h ausklammern"].includes("nur-erstes"), arten["h ausklammern"].join());                        // h(2x + h²)
  assert.ok(weg.every((s) => s.optionen.length >= 3), "x²: jeder Schritt hat mindestens zwei falsche Zeilen");
  // Hinweise mit echtem Minuszeichen
  for (const s of weg) for (const o of s.optionen.slice(1)) assert.ok(!/ -[0-9x(]/.test(o.hinweis), o.hinweis);
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
      for (const s of weg) assert.ok(s.optionen.slice(1).every((o) => o.art !== "notnagel"), `${auf.f} (x0=${x0}) ${s.label}`);
    }
  }
});

test("Position der richtigen Zeile ist zufällig, aber je Schritt fest", () => {
  const auf = aufgabeAus("x^2");
  const pos = new Set();
  for (let i = 0; i < 40; i++) for (const s of uebenWeg(auf, null)) {
    const sicht = sichtbareOptionen(s, 4);
    pos.add(sicht.findIndex((o) => o.richtig));
    assert.deepEqual(sichtbareOptionen(s, 4).map((o) => o.key), sicht.map((o) => o.key));   // stabil
  }
  assert.ok(pos.size >= 3, `richtige Zeile nur an Position ${[...pos]}`);
});
