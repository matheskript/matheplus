/* Werkzeug „Stammfunktion & Integral“ (Hauptsatz-Trainer): Die Rückmeldung muss stimmen.
   Früher meldete der Trainer „Richtig!“ (bei Status falsch), sobald die Ableitung der Eingabe an den Prüfstellen
   nicht berechenbar war (ln(−x), √(−x), ln(x − 5)) oder nur für x > 0 passte (√x⁶ für 3x²), und Terme wie (√x)⁶
   galten als richtig, weil links von 0 alles verziehen wurde. Hier: richtige, falsche und Grenzfälle. */
import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEER = ["ttf", "woff", "woff2", "jpg", "jpeg", "png", "css", "svg", "webp", "gif", "mp4", "pdf"];

let K;
test.before(async () => {
  const datei = path.join(wurzel, "node_modules", `.stammintegral-test-${process.pid}.mjs`);
  await build({
    entryPoints: [path.join(wurzel, "src/regelwerkKern.js")],
    bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error",
    loader: { ".js": "jsx", ...Object.fromEntries(LEER.map((e) => [`.${e}`, "empty"])) },
    external: ["react", "react-dom", "@supabase/supabase-js"],
    define: { "import.meta.env": JSON.stringify({ DEV: false }) },
  });
  try { K = await import(pathToFileURL(datei).href); } finally { rmSync(datei, { force: true }); }
});

const stamm = (f, ein) => K.pruefeStamm(ein, K.lies(f));
const integral = (f, a, b) => {
  const ff = K.lies(f), A = K.grenzeLesen(a), B = K.grenzeLesen(b);
  return { f: ff, a: A.v, b: B.v, hs: K.hauptsatz(ff, A, B) };
};

test("Stammfunktion: richtige Eingaben sind richtig (auch + C, andere Schreibweise)", () => {
  for (const [f, F] of [
    ["3x^2", "x^3"], ["3x^2", "x^3+5"], ["3x^2", "x^3-2"], ["2x", "x^2"], ["cos(x)", "sin(x)"], ["sin(x)", "-cos(x)"],
    ["e^x", "e^x"], ["e^(2x)", "e^(2x)/2"], ["1/x^2", "-1/x"], ["sqrt(x)", "2/3x^(3/2)"], ["sqrt(x)", "2/3*sqrt(x)^3"],
    ["4x^3-4x", "x^4-2x^2"], ["cos(3x)", "sin(3x)/3"],
  ]) {
    const r = stamm(f, F);
    assert.equal(r.ok, true, `${f} → ${F} sollte richtig sein (${r.hinweis})`);
    assert.equal(r.hinweis, "", `${f} → ${F}: kein Zusatzhinweis erwartet`);
  }
});

test("Stammfunktion: ln(x) statt ln|x| ist richtig mit Hinweis, auch bei linearem Argument", () => {
  for (const [f, F] of [["1/x", "ln(x)"], ["1/x", "ln(-x)"], ["2/x", "2ln(x)"], ["1/(2x-3)", "ln(2x-3)/2"], ["x+1/x", "x^2/2+ln(x)"]]) {
    const r = stamm(f, F);
    assert.equal(r.ok, true, `${f} → ${F}: ${r.hinweis}`);
    assert.match(r.hinweis, /ln\|…\|/);
  }
});

test("Stammfunktion: falsche Eingaben sind nie richtig und der Hinweis sagt nie „Richtig“", () => {
  for (const [f, F] of [
    ["3x^2", "ln(-x)"], ["3x^2", "sqrt(-x)"], ["x^2", "ln(x-5)"], ["3x^2", "sqrt(x^6)"], ["3x^2", "sqrt(x)^6"], ["2x", "sqrt(x)^4"],
    ["3x^2", "3x^3"], ["3x^2", "x^2"], ["cos(x)", "-sin(x)"], ["1/x^2", "1/x"], ["sqrt(x)", "2/3*sqrt(-x)^3"], ["1/x", "ln(x^2)"],
    ["e^(2x)", "e^(2x)"], ["e^(2x)", "2e^(2x)"], ["x^3", "x^4"], ["1/x", "1/x"], ["3x^2", "6x"],
  ]) {
    const r = stamm(f, F);
    assert.equal(r.ok, false, `${f} → ${F} darf nicht als richtig gelten`);
    assert.ok(r.hinweis && !/^Richtig/.test(r.hinweis), `${f} → ${F}: Hinweis „${r.hinweis}“`);
  }
});

test("Stammfunktion: gezielte Hinweise für typische Fehler", () => {
  assert.equal(stamm("3x^2", "3x^2").art, "f");
  assert.equal(stamm("3x^2", "6x").art, "abgeleitet");
  assert.equal(stamm("cos(x)", "-sin(x)").art, "abgeleitet");
  assert.equal(stamm("2x", "-x^2").art, "vorzeichen");
  assert.equal(stamm("sin(x)", "cos(x)").art, "abgeleitet");
  assert.equal(stamm("e^x", "-e^x").art, "vorzeichen");
  assert.equal(stamm("x^3", "x^4").art, "faktor");
  assert.equal(stamm("e^(2x)", "e^(2x)").art, "f");
  assert.match(stamm("e^(2x)", "e^(2x)/4").hinweis, /inneren Faktor/);
  assert.equal(stamm("3x^2", "sqrt(x^6)").art, "teilweise");
  assert.equal(stamm("3x^2", "x^3+").unvollstaendig, true);
  assert.equal(stamm("3x^2", "").ok, false);
});

test("Integral, Nebenrechnung F: muss auf dem ganzen Intervall passen", () => {
  const p = integral("3x^2", "-2", "1");
  assert.equal(K.pruefeIntegralStamm("x^3", p.f, p.hs, p.a, p.b).ok, true);
  assert.equal(K.pruefeIntegralStamm("x^3+7", p.f, p.hs, p.a, p.b).ok, true);
  assert.equal(K.pruefeIntegralStamm("sqrt(x)^6", p.f, p.hs, p.a, p.b).ok, false, "(√x)⁶ ist bei x = −2 nicht definiert");
  assert.equal(K.pruefeIntegralStamm("3x^2", p.f, p.hs, p.a, p.b).art, "f");
  assert.equal(K.pruefeIntegralStamm("-x^3", p.f, p.hs, p.a, p.b).art, "vorzeichen");
  const ln = integral("1/x", "1", "e");
  assert.equal(K.pruefeIntegralStamm("ln(x)", ln.f, ln.hs, ln.a, ln.b).ok, true, "ln(x) reicht auf [1; e]");
  const lnNeg = integral("1/x", "-e", "-1");
  const r = K.pruefeIntegralStamm("ln(x)", lnNeg.f, lnNeg.hs, lnNeg.a, lnNeg.b);
  assert.equal(r.ok, false, "ln(x) ist auf [−e; −1] nicht definiert");
  assert.equal(r.art, "intervall");
  assert.equal(K.pruefeIntegralStamm("ln(-x)", lnNeg.f, lnNeg.hs, lnNeg.a, lnNeg.b).ok, true);
});

test("Integral, Wert: richtig, Vorzeichen, vertauschte Grenzen, fehlendes F(a)", () => {
  const p = integral("3x^2", "1", "2");                // F = x³, F(2) = 8, F(1) = 1, Wert 7
  assert.equal(p.hs.wert, 7);
  for (const ein of ["7", "7,0", "7.000", "14/2", " 7 "]) assert.equal(K.pruefeIntegralWert(ein, p.hs).ok, true, ein);
  assert.equal(K.pruefeIntegralWert("-7", p.hs).art, "vorzeichen");
  assert.equal(K.pruefeIntegralWert("−7", p.hs).art, "vorzeichen");
  assert.equal(K.pruefeIntegralWert("9", p.hs).art, "addiert");
  assert.equal(K.pruefeIntegralWert("8", p.hs).art, "ohneFa");
  assert.equal(K.pruefeIntegralWert("-1", p.hs).art, "ohneFb");
  assert.equal(K.pruefeIntegralWert("6", p.hs).ok, false);
  assert.equal(K.pruefeIntegralWert("7,1", p.hs).ok, false);
  assert.equal(K.pruefeIntegralWert("", p.hs).unvollstaendig, true);
  assert.equal(K.pruefeIntegralWert("x", p.hs).unvollstaendig, true);

  // vertauschte Grenzen: ∫ von 2 bis 1 = F(1) − F(2) = −7
  const v = integral("3x^2", "2", "1");
  assert.equal(v.hs.wert, -7);
  assert.equal(K.pruefeIntegralWert("-7", v.hs).ok, true);
  assert.equal(K.pruefeIntegralWert("7", v.hs).art, "vorzeichen");
  assert.equal(K.pruefeIntegralWert("1", v.hs).art, "ohneFa");

  // F(a) = 0: „nur F(b)“ ist dann die richtige Antwort, kein Fehlerhinweis
  const n = integral("3x^2", "0", "2");
  assert.equal(K.pruefeIntegralWert("8", n.hs).ok, true);

  // Wert 0: −0 ist auch richtig
  const s = integral("sin(x)", "-pi", "pi");
  assert.equal(K.pruefeIntegralWert("0", s.hs).ok, true);
  assert.equal(K.pruefeIntegralWert("-0", s.hs).ok, true);

  // Brüche und Konstanten
  const b = integral("x^2", "0", "1");
  assert.equal(K.pruefeIntegralWert("1/3", b.hs).ok, true);
  assert.equal(K.pruefeIntegralWert("0,333", b.hs).ok, true);
  assert.equal(K.pruefeIntegralWert("0,3", b.hs).ok, false);
  assert.equal(K.pruefeIntegralWert("-1/3", b.hs).art, "vorzeichen");
  const e = integral("1/x", "1", "e");
  assert.equal(K.pruefeIntegralWert("1", e.hs).ok, true);
});

test("Integral, Wert: kein falsches „Richtig“ über viele zufällige Aufgaben", () => {
  for (let i = 0; i < 60; i++) {
    const n = K.neueIntegralAufgabe(1 + (i % 3));
    const p = integral(n.fText, n.aText, n.bText);
    const w = p.hs.wert;
    assert.equal(K.pruefeIntegralWert(w.toFixed(6), p.hs).ok, true, `${n.fText} [${n.aText}; ${n.bText}]`);
    for (const falsch of [w + 1, -w, p.hs.Fb + p.hs.Fa, p.hs.Fb]) {
      if (Math.abs(falsch - w) <= 1e-3 * (1 + Math.abs(w))) continue;   // fällt zufällig mit dem richtigen Wert zusammen
      const r = K.pruefeIntegralWert(falsch.toFixed(6), p.hs);
      assert.equal(r.ok, false, `${n.fText} [${n.aText}; ${n.bText}]: ${falsch} statt ${w}`);
      assert.ok(!/^Richtig/.test(r.hinweis));
    }
  }
});
