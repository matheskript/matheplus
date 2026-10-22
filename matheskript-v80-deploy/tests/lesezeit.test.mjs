/* Lesezeit für alle Animationen (src/lesezeit.js): kein Text verschwindet, bevor er gelesen ist.
   Prüft die Regel selbst und dass beide Abspieler (Motion, Player) sie benutzen. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { lesezeitMs, lesePlan, BEWEGUNG_MAX, LESE_MS_JE_ZEICHEN, LESE_ANLAUF_MS } from "../src/lesezeit.js";

const src = (f) => readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8");

test("Lesetempo Klasse 5–7: 1,2 s Anlauf + 70 ms je Zeichen", () => {
  assert.equal(LESE_ANLAUF_MS, 1200);
  assert.equal(LESE_MS_JE_ZEICHEN, 70);
  assert.equal(lesezeitMs(""), 0);
  assert.equal(lesezeitMs("x".repeat(100)), 8200);
});

test("lesePlan: jeder Schritt mindestens Lesezeit + Puffer, nie kürzer als gezeichnet", () => {
  const schritte = [{ von: 0, text: "a".repeat(150) }, { von: 4, text: "kurz" }, { von: 10, text: "b".repeat(60) }];
  const p = lesePlan(schritte, 14, { puffer: 1.5 });
  const ende = [...p.schritte.slice(1).map((s) => s.von), p.dauer];
  p.schritte.forEach((s, i) => {
    const d = ende[i] - s.von;
    assert.ok(d >= lesezeitMs(schritte[i].text) / 1000 + 1.5 - 0.06, `Schritt ${i + 1}: ${d} s`);
  });
  assert.ok(ende[1] - p.schritte[1].von >= 6 - 0.06, "Schritt 2 bleibt so lang wie gezeichnet (6 s)");
});

test("lesePlan: Abspielzeit → gezeichnete Zeit monoton, Grenzen treffen, Bewegung höchstens 1,6-mal gestreckt", () => {
  const schritte = [{ von: 0, text: "a".repeat(200) }, { von: 4, text: "b".repeat(30) }];
  const p = lesePlan(schritte, 8);
  assert.equal(p.zuDrehbuch(0), 0);
  assert.equal(p.zuDrehbuch(p.dauer), 8);
  assert.ok(Math.abs(p.zuDrehbuch(p.schritte[1].von) - 4) < 1e-9);
  /* Schritt 1: 4 s gezeichnet, Bewegung fertig nach 4 · 1,6 = 6,4 s, danach Standbild bei 4 */
  assert.ok(Math.abs(p.zuDrehbuch(4 * BEWEGUNG_MAX) - 4) < 1e-9);
  assert.equal(p.zuDrehbuch(p.schritte[1].von - 0.5), 4);
  let alt = -1;
  for (let t = 0; t <= p.dauer; t += 0.1) { const d = p.zuDrehbuch(t); assert.ok(d >= alt - 1e-9); alt = d; }
});

test("Beide Abspieler benutzen die Regel: Player (Erkläranimationen) und Motion (Unterstufe, Vektoren)", () => {
  assert.match(src("funcErklaeranimation.jsx"), /lesePlan\(szene\.schritte, szene\.dauer/);
  assert.match(src("funcErklaeranimation.jsx"), /szene\.zeichne\(plan\.zuDrehbuch\(tt\)\)/);
  assert.match(src("motion/kern.jsx"), /export const lesedauer = lesezeitMs/);
  assert.match(src("funcUnterstufeMotion.jsx"), /vorlaufRest\.current = lesezeitMs\(frage\)/);
});

test("Kein eigener Abspieler an der Regel vorbei: alle Schrittlisten laufen über den Player", () => {
  const dateien = readdirSync(new URL("../src/", import.meta.url)).filter((f) => /\.jsx$/.test(f));
  for (const f of dateien) {
    const s = src(f);
    if (!/\{ von: 0, text/.test(s) || f === "funcErklaeranimation.jsx") continue;
    assert.ok(/import \{[^}]*\b(Player|lauf)\b[^}]*\} from "\.\/funcErklaeranimation\.jsx"/.test(s) || /AnimKarte/.test(s),
      `${f}: Schritte mit Text, aber weder Player noch AnimKarte`);
  }
});
