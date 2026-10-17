import test from "node:test";
import assert from "node:assert/strict";
import { ANZAHL_SAETZE, abiSatz, alleTeile, feldLoesung, pruefeAbiTeil, termGleich, zufallMit } from "../src/abiSaetze.js";

test("zehn Sätze: fest, 60 VP (30 + 30), alle Operatoren aus dem Abitur", () => {
  for (let n = 1; n <= ANZAHL_SAETZE; n++) {
    const a = abiSatz(n), b = abiSatz(n);
    assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), `Satz ${n} nicht reproduzierbar`);
    assert.equal(a.punkte, 60); assert.deepEqual(a.teile.map((t) => t.punkte), [30, 30]);
    for (const t of alleTeile(a)) {
      assert.match(t.frage, /Bestimmen Sie|Berechnen Sie|Begründen Sie|Zeigen Sie|Geben Sie|Ermitteln Sie|Interpretieren Sie|Beschreiben Sie|Weisen Sie/, `${n}/${t.block}${t.id}: Operator fehlt`);
      assert.ok(t.punkte >= 1 && t.loesung.length > 20);
    }
  }
});

test("jede Teilaufgabe: Musterlösung besteht die Prüfung, Falsches nicht (alle Sätze)", () => {
  for (let n = 1; n <= ANZAHL_SAETZE; n++) {
    for (const t of alleTeile(abiSatz(n))) {
      if (t.art === "begruenden") {
        const r = pruefeAbiTeil(t, t.kriterien.map(() => true));
        assert.equal(r.punkte, t.punkte); assert.equal(pruefeAbiTeil(t, []).punkte, 0);
        continue;
      }
      if (t.art === "term") {
        assert.equal(pruefeAbiTeil(t, [feldLoesung(t, 0)]).punkte, t.punkte, `${n}/${t.block}${t.id}: Lösungstext nicht lesbar: ${feldLoesung(t, 0)}`);
        assert.equal(pruefeAbiTeil(t, ["x^2"]).punkte, 0);
        continue;
      }
      const r = pruefeAbiTeil(t, t.felder.map((f) => String(f.wert)));
      assert.equal(r.punkte, t.punkte, `${n}/${t.block}${t.id}: ${JSON.stringify(t.felder)}`);
      const falsch = pruefeAbiTeil(t, t.felder.map((f) => String(f.wert + 7)));
      assert.equal(falsch.punkte, 0, `${n}/${t.block}${t.id}: Falsches zählt`);
      if (t.art === "ebene") assert.equal(pruefeAbiTeil(t, t.felder.map((f) => String(2 * f.wert))).punkte, t.punkte, "Vielfaches der Ebene gilt");
    }
  }
});

test("Regel A5 in allen Lösungstexten und Aufgabentexten", () => {
  const verboten = [/\b1x/, /\+ −/, /− −/, /[a-z]\^1\b/, /\+ 0\b/, /\(\+/, /\d-\d/];
  for (let n = 1; n <= ANZAHL_SAETZE; n++) for (const t of alleTeile(abiSatz(n))) for (const re of verboten) {
    assert.ok(!re.test(t.loesung), `${n}/${t.block}${t.id} Lösung: ${re} in „${t.loesung}“`);
    assert.ok(!re.test(t.frage), `${n}/${t.block}${t.id} Frage: ${re} in „${t.frage}“`);
  }
});

test("Termvergleich: Schreibweisen, Falsches, Unlesbares", () => {
  assert.equal(termGleich("2*x*e^(x)+x^2*e^(x)", "e^x·(2x+x^2)".replace("·", "*")), true);
  assert.equal(termGleich("2*x*e^(x)+x^2*e^(x)", "(x^2+2x)e^x"), true);
  assert.equal(termGleich("6*(2*x+2)^2", "6(2x+2)^2"), true);
  assert.equal(termGleich("6*(2*x+2)^2", "12(2x+2)"), false);
  assert.equal(termGleich("6*(2*x+2)^2", "6(2x+2)^^2"), false);
  assert.equal(termGleich("6*(2*x+2)^2", ""), false);
});

test("Zufall mit Start ist reproduzierbar und gleichverteilt genug", () => {
  const a = zufallMit(42), b = zufallMit(42);
  const xs = Array.from({ length: 1000 }, () => a());
  assert.deepEqual(xs.slice(0, 5), Array.from({ length: 5 }, () => b()));
  assert.ok(xs.every((x) => x >= 0 && x < 1));
  const mitte = xs.filter((x) => x < 0.5).length; assert.ok(mitte > 420 && mitte < 580);
});
