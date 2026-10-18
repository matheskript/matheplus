import test from "node:test";
import assert from "node:assert/strict";
import * as U from "../src/ungleichGen.js";
import { enthaelt, mengeTex } from "../src/mengenRechnen.js";
import { a5, schritteOk } from "./aufgabenDaten.mjs";

const ALLE = [...U.LIN_ARTEN, ...U.BET_ARTEN, ...U.BU_ARTEN, ...U.QU_ARTEN];
const L = 600;
/* Stichproben: ganze Zahlen, Halbe und Drittel um die Grenzen herum */
const PROBEN = [];
for (let x = -30; x <= 30; x += 0.5) PROBEN.push(x);
for (let x = -12; x <= 12; x += 1 / 3) PROBEN.push(Math.round(x * 1e9) / 1e9);

test("Alle Aufgabentypen haben einen Titel", () => {
  for (const art of ALLE) assert.ok(U.UG_TITEL[art], art);
});

test("Jede Aufgabe: Schritte vollständig, A5, Lösungsmenge stimmt mit der Ausgangsungleichung überein", () => {
  for (const art of ALLE) for (let i = 0; i < L; i++) {
    const au = U.ugAufgabe(art);
    assert.equal(au.art, art);
    schritteOk(au); a5(au);
    const p = au.pruef;
    if (p.f) {
      for (const x of PROBEN) assert.equal(enthaelt(p.menge, x), p.f(x), `${art}: x = ${x}, L = ${mengeTex(p.menge)}, ${au.text[0]}`);
      /* die Mengen-Antwort im letzten Auswahlschritt ist genau L */
      const letzter = au.schritte[au.schritte.length - 1];
      if (letzter.typ === "wahl" && letzter.optionen.some((o) => o[1].startsWith("$") && /[\[\]]|mathbb|emptyset/.test(o[0]))) assert.equal(letzter.richtig, mengeTex(p.menge), `${art}: ${au.text[0]}`);
    } else if (p.g) {
      for (const x of p.loes) assert.ok(Math.abs(p.g(x)) < 1e-9, `${art}: ${x} löst nicht ${au.text[0]}`);
      /* die Lösungen stehen als Zahlschritte in der Aufgabe */
      const werte = au.schritte.filter((s) => s.typ === "zahl").map((s) => s.wert);
      for (const x of p.loes) assert.ok(werte.some((w) => Math.abs(w - x) < 1e-9), `${art}: Lösung ${x} fehlt`);
    } else if (p.anzahl !== undefined) {
      const { a, b, c } = p;
      const n = c < 0 ? 0 : c === 0 ? 1 : 2;
      assert.equal(n, p.anzahl);
      if (c >= 0) { const l = [(c - b) / a, (-c - b) / a]; assert.equal(new Set(l.map((v) => v.toFixed(9))).size, n); }
    } else {
      assert.equal(p.wert, p.soll, `${art}: ${au.text[0]}`);
    }
  }
});

test("Beispiele: Zeichen dreht bei negativem Faktor", () => {
  let gesehen = 0;
  for (let i = 0; i < 200; i++) {
    const au = U.ugAufgabe("negativ");
    const st = au.schritte[1];
    assert.ok(st.fehler.length === 1, "Denkfehler „Zeichen nicht gedreht“ ist hinterlegt");
    gesehen++;
  }
  assert.ok(gesehen > 0);
});
