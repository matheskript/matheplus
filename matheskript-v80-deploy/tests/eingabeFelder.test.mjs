import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/* Wächter: Das alte Tastenfeld „Zahlen | Funktionen | Parameter“ (TermTastatur aus func4) ist abgelöst.
   Termeingaben in Übungen laufen über TermEingabe (Anzeige + Formel-Tastenfeld, Desktop daneben/darunter, Handy darunter). */
const SRC = new URL("../src/", import.meta.url);
const dateien = readdirSync(SRC).filter((d) => /\.(jsx|js)$/.test(d)).map((d) => [d, readFileSync(new URL(d, SRC), "utf8")]);

test("kein altes Tastenfeld mit Zahlen | Funktionen | Parameter", () => {
  for (const [d, s] of dateien) {
    assert.ok(!/\["param",\s*"Parameter"\]/.test(s), `${d}: alter Umschalter Zahlen/Funktionen/Parameter`);
    assert.ok(!/TASTEN_(ZAHL|FUNK|PARAM)\b/.test(s), `${d}: alte Tastenlisten`);
  }
});

test("TermTastatur ist nur noch die neue Termeingabe", () => {
  const f4 = dateien.find(([d]) => d === "func4.jsx")[1];
  const i = f4.indexOf("export function TermTastatur");
  assert.ok(i >= 0);
  assert.match(f4.slice(i, i + 200), /<TermEingabe /);
});

test("Termaufgaben bieten das Tastenfeld immer an (kein Umschalter zurück aufs alte Feld)", () => {
  for (const [d, s] of dateien) {
    if (!s.includes("<TermTastatur")) continue;
    assert.ok(!/setTippen\(!tippen\)|setTastatur\(!tastatur\)/.test(s), `${d}: Umschalter neben TermTastatur`);
  }
});
