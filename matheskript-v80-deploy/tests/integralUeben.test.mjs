/* Integraltrainer, Modus „Üben“ (src/integralUeben.js): je Wahl-Schritt die richtige Antwort und bis zu drei
   falsche – die richtige ist das Soll des Kern-Schritts und besteht dessen Prüfung (dieselbe wie in Lernen),
   jede falsche fällt durch, ist lesbar, hat einen Hinweis; Schlüssel verschieden; so viele Schritte wie
   Nicht-Info-Schritte des Kerns. Alle fünf Typen × alle Stufen × ≥ 20 Zufallsläufe. */
import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEER = ["ttf", "woff", "woff2", "jpg", "jpeg", "png", "css", "svg", "webp", "gif", "mp4", "pdf"];

let K, U, R, sichtbareOptionen;
test.before(async () => {
  const entry = path.join(wurzel, "node_modules", `.integralueben-entry-${process.pid}.mjs`);
  const datei = path.join(wurzel, "node_modules", `.integralueben-test-${process.pid}.mjs`);
  // absolute Pfade: node_modules kann ein Symlink in einen anderen Klon sein
  const src = (n) => JSON.stringify(path.join(wurzel, "src", n));
  writeFileSync(entry, [
    `export * as K from ${src("integralKern.js")};`,
    `export * as U from ${src("integralUeben.js")};`,
    `export * as R from ${src("regelwerkKern.js")};`,
    `export { sichtbareOptionen } from ${src("uebenKern.js")};`,
  ].join("\n"));
  try {
    await build({
      entryPoints: [entry], bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error",
      loader: { ".js": "jsx", ...Object.fromEntries(LEER.map((e) => [`.${e}`, "empty"])) },
      external: ["react", "react-dom", "@supabase/supabase-js"],
      define: { "import.meta.env": JSON.stringify({ DEV: false }) },
    });
    ({ K, U, R, sichtbareOptionen } = await import(pathToFileURL(datei).href));
  } finally { rmSync(entry, { force: true }); rmSync(datei, { force: true }); }
});

const LAEUFE = 24;
const alleKombis = () => K.TYPEN.flatMap((t) => t.stufen.map((_, i) => [t.id, i + 1]));
const schrittVon = (a, id) => a.schritte.find((s) => s.id === id);
/* Prüfung des Kerns auf einen Options-Wert anwenden – genau so, wie uebenWeg sie verwendet */
const pruefe = (s, w) => (s.art === "term" ? s.pruefen(w.text) : s.art === "zahlen" ? s.pruefen(w.werte.map(U.zahlText)) : s.pruefen(U.zahlText(w.wert)));

function pruefeWeg(a, zufall, name) {
  const weg = U.uebenWeg(a, zufall);
  const erwartet = a.schritte.filter((s) => s.art !== "info");
  assert.equal(weg.length, erwartet.length, `${name}: ${weg.length} Üben-Schritte, ${erwartet.length} Wahl-Schritte im Kern`);
  assert.deepEqual(weg.map((u) => u.id), erwartet.map((s) => s.id), `${name}: Reihenfolge`);
  for (const u of weg) {
    const s = schrittVon(a, u.id);
    assert.equal(u.art, s.art);
    assert.ok(u.label, `${name}/${u.id}: Label fehlt`);
    assert.ok(u.frage && u.frage.length > 8, `${name}/${u.id}: Frage fehlt`);
    assert.ok(u.optionen.length >= 2 && u.optionen.length <= 4, `${name}/${u.id}: ${u.optionen.length} Optionen`);
    assert.ok(u.optionen[0].richtig && u.optionen.slice(1).every((o) => !o.richtig), `${name}/${u.id}: optionen[0] muss die richtige sein`);
    assert.deepEqual(u.optionen[0].wert, u.richtig);
    assert.equal(new Set(u.optionen.map((o) => o.key)).size, u.optionen.length, `${name}/${u.id}: doppelte Schlüssel`);
    // richtig: besteht die Lernen-Prüfung, und ist das Soll des Kerns
    const r = pruefe(s, u.richtig);
    assert.equal(r.ok, true, `${name}/${u.id}: richtige Antwort ${JSON.stringify(u.richtig)} fällt durch (${r.hinweis})`);
    if (s.art === "zahl") assert.equal(u.richtig.wert, s.soll);
    if (s.art === "zahlen") assert.deepEqual(u.richtig.werte, [...s.sollWerte].sort((x, y) => x - y));
    if (s.art === "term" && s.sollText) assert.equal(u.richtig.text, s.sollText);
    if (s.art === "term") assert.ok(R.lies(u.richtig.text), `${name}/${u.id}: richtiger Term unlesbar „${u.richtig.text}“`);
    assert.ok(u.richtig.tex && u.richtig.tex.length > 0, `${name}/${u.id}: TeX der richtigen Antwort fehlt`);
    for (const o of u.optionen.slice(1)) {
      const f = pruefe(s, o.wert);
      assert.equal(f.ok, false, `${name}/${u.id}: falsche Option ist gleichwertig ${JSON.stringify(o.wert)} (${o.art})`);
      if (s.art === "term") assert.ok(R.lies(o.wert.text), `${name}/${u.id}: unlesbar „${o.wert.text}“`);
      if (s.art === "zahl") assert.ok(Number.isFinite(o.wert.wert));
      if (s.art === "zahlen") assert.ok(o.wert.werte.every(Number.isFinite));
      assert.ok(o.wert.tex && !/NaN|undefined|Infinity/.test(o.wert.tex), `${name}/${u.id}: TeX „${o.wert.tex}“`);
      assert.ok(o.hinweis && o.hinweis.length > 15, `${name}/${u.id}: Hinweis fehlt (${o.art})`);
      assert.ok(!/\$/.test(o.hinweis), `${name}/${u.id}: Hinweis mit TeX-Dollar „${o.hinweis}“`);
      assert.ok(!/ -[0-9x(]/.test(o.hinweis), `${name}/${u.id}: Bindestrich statt Minus „${o.hinweis}“`);
    }
    for (const k of [2, 3, 4]) assert.equal(sichtbareOptionen(u, k).filter((o) => o.richtig).length, 1);
  }
  return weg;
}

test("Alle fünf Typen, alle Stufen, viele Zufallsläufe: richtig besteht, falsch fällt durch", () => {
  let n = 0;
  const wahlen = [() => 0, () => 0.5, () => 0.99, Math.random];
  for (const [typ, stufe] of alleKombis()) {
    for (let i = 0; i < LAEUFE; i++) {
      const a = K.neueAufgabe(typ, stufe);
      pruefeWeg(a, wahlen[i % wahlen.length], `${typ}/${stufe} ${a.f && (a.f.text || a.f.tex)}`);
      n++;
    }
  }
  assert.ok(n >= 17 * LAEUFE);
});

test("Typische Fehler greifen: jeder Schritt hat mindestens eine falsche Karte, Standardfälle mehrere", () => {
  const faelle = [
    [K.baueBestimmtPoly([1, 0, 3].map((z) => ({ z, n: 1 })), { z: 1, n: 1 }, { z: 2, n: 1 }), ["F", "Fb", "Fa", "I"]],
    [K.baueStamm("3x^2+2x-1"), ["F"]],
    [K.baueStamm("2sin(x)"), ["F"]],
    [K.baueStamm("e^(2x)"), ["F"]],
    [K.baueStamm("1/(2x+1)"), ["F"]],
  ];
  for (const [a, ids] of faelle) {
    assert.ok(!a.fehler);
    const weg = pruefeWeg(a, () => 0, a.f.text);
    assert.deepEqual(weg.map((u) => u.id), ids);
    for (const u of weg) assert.ok(u.optionen.length >= 3, `${a.f.text}/${u.id}: nur ${u.optionen.length} Karten`);
    assert.ok(weg.every((u) => u.optionen.slice(1).every((o) => o.art !== "notnagel")), `${a.f.text}: Notnagel`);
  }
});

test("Fehlerarten je Schritt: ∫₁² (3x² + 1) dx", () => {
  const a = K.baueBestimmtPoly([1, 0, 3].map((z) => ({ z, n: 1 })), { z: 1, n: 1 }, { z: 2, n: 1 });
  const weg = U.uebenWeg(a, () => 0);
  const arten = Object.fromEntries(weg.map((u) => [u.id, u.optionen.slice(1).map((o) => o.art)]));
  const text = (u, i) => u.optionen[i].wert.tex;
  assert.equal(text(weg[0], 0), "x^{3} + x");                         // F wie im Kern (pTex)
  assert.ok(arten.F.some((x) => ["ohne-teilen", "abgeleitet", "nur-erster", "vorzeichen-summand"].includes(x)), arten.F.join());
  assert.equal(weg[1].richtig.wert, 10); assert.equal(weg[2].richtig.wert, 2); assert.equal(weg[3].richtig.wert, 8);
  assert.ok(arten.I.every((x) => ["vertauscht", "addiert", "ohne-Fa", "ohne-Fb", "vorzeichen"].includes(x)), arten.I.join());
  // Die Werte der falschen Karten stimmen mit dem beschriebenen Fehler überein
  const I = weg[3].optionen.slice(1);
  for (const o of I) {
    if (o.art === "vertauscht") assert.equal(o.wert.wert, -8);
    if (o.art === "addiert") assert.equal(o.wert.wert, 12);
    if (o.art === "ohne-Fa") assert.equal(o.wert.wert, 10);
  }
});

test("Stammfunktion: Fehlerbilder stimmen (Ableitung, nicht geteilt, nur ein Summand, Vorzeichen, innere Ableitung)", () => {
  // Höchstens drei falsche Karten erscheinen (gemischt) – über mehrere Läufe sammeln wir alle Fehlerbilder ein
  const bilder = (text) => {
    const alle = {};
    for (let i = 0; i < 30; i++) {
      const weg = U.uebenWeg(K.baueStamm(text), Math.random);
      for (const o of weg[0].optionen.slice(1)) alle[o.art] = o.wert.tex.replace(/ \+ C$/, "");
    }
    return alle;
  };
  const b1 = bilder("6x+1");
  assert.equal(b1.abgeleitet, "6");
  assert.equal(b1["nur-erster"], "3x^{2} + 1");
  const b2 = bilder("x^3+4");
  assert.equal(b2["ohne-teilen"], "x^{4} + 4x");
  assert.equal(b2["konstante-weg"], "\\frac{1}{4}x^{4}");
  const b3 = bilder("sin(x)");
  assert.equal(b3["trig-vorzeichen"], "\\cos(x)");
  const b4 = bilder("e^(2x)");
  assert.equal(b4["innen-vergessen"], "e^{2x}");
  assert.ok(b4["e-potenzregel"], "e-Potenzregel fehlt");
  const b5 = bilder("8(2x-1)^3");
  assert.equal(b5["innen-vergessen"], "2(2x − 1)^{4}");
  assert.equal(b5["ohne-teilen"], "4(2x − 1)^{4}");   // m² = 4 = n + 1: „innen-multipliziert“ fällt als Doppel weg
  // ln ohne Betrag gilt als richtig und ist deshalb keine falsche Karte
  const b6 = U.uebenWeg(K.baueStamm("1/x"), () => 0)[0];
  assert.equal(b6.richtig.text, "ln(x)");
  assert.ok(b6.optionen.slice(1).every((o) => !/^ln\(x\)$/.test(o.wert.text)));
});

test("Fläche und zwei Graphen: Nullstellen-Fehler, Teilintegrale, Bilanz statt Fläche", () => {
  const q = (z, n = 1) => ({ z, n });
  const b = K.baueFlaeche([q(0), q(-4), q(0), q(1)], [q(-2), q(0), q(2)], null, 2);    // f = x³ − 4x, Nullstellen −2, 0, 2
  const weg = U.uebenWeg(b, () => 0);
  assert.deepEqual(weg.map((u) => u.id), ["null", "F", "I1", "I2", "A"]);
  const nullArten = weg[0].optionen.slice(1).map((o) => o.art);
  assert.ok(nullArten.includes("null-vergessen") || nullArten.includes("verschoben") || nullArten.includes("eins-gedreht"), nullArten.join());
  const A = weg[4];
  assert.equal(A.richtig.wert, 8);
  const arten = A.optionen.slice(1).map((o) => o.art);
  assert.ok(arten.includes("negativ") || arten.includes("teil-vergessen") || arten.includes("bilanz-betrag"), arten.join());
  for (const o of A.optionen.slice(1)) {
    if (o.art === "negativ") assert.equal(o.wert.wert, -8);
    if (o.art === "teil-vergessen") assert.equal(o.wert.wert, 4);
  }
  // Zwei Graphen: d = f − g; g − f ist gleichwertig und darf keine falsche Karte sein
  const z = K.baueZwei([q(2), q(0), q(-1)], [q(-2), q(0), q(0)], [q(-2), q(2)], 1);  // f = −x² + 2, g = −2 → d = −x² + 4
  const wz = U.uebenWeg(z, () => 0);
  assert.equal(wz[0].id, "d");
  assert.ok(wz[0].optionen.slice(1).every((o) => o.art !== "g-minus-f"));
  assert.ok(wz[0].optionen.slice(1).some((o) => o.art === "plus" || o.art === "nur-f"));
});

test("Position der richtigen Karte ist zufällig, aber je Schritt fest", () => {
  const a = K.baueBestimmtPoly([1, 0, 3].map((z) => ({ z, n: 1 })), { z: 1, n: 1 }, { z: 2, n: 1 });
  const pos = new Set();
  for (let i = 0; i < 40; i++) for (const u of U.uebenWeg(a)) {
    const sicht = sichtbareOptionen(u, 4);
    pos.add(sicht.findIndex((o) => o.richtig));
    assert.deepEqual(sichtbareOptionen(u, 4).map((o) => o.key), sicht.map((o) => o.key));
  }
  assert.ok(pos.size >= 3, `richtige Karte nur an Position ${[...pos]}`);
});

test("eingabeText: Bäume werden von lies() gelesen und stimmen numerisch", () => {
  for (const t of ["1/3x^3-2x+1", "-x^4-sin(x)", "2e^(2x)", "8(2x-1)^3", "sqrt(2x+1)", "1/(2x+1)", "4/(2x+1)^2", "x^2+1/x", "-(2x^3)-x", "e^x+2x", "cos(2x)+1", "2/x^2"]) {
    const b = R.lies(t), text = U.eingabeText(b), b2 = R.lies(text);
    assert.ok(b2, `${t} → „${text}“ unlesbar`);
    for (const x of [0.7, 1.3, 2.9]) {
      const y1 = R.auswerter(b)(x), y2 = R.auswerter(b2)(x);
      assert.ok(Math.abs(y1 - y2) < 1e-9 * (1 + Math.abs(y1)), `${t} → „${text}“ bei x=${x}: ${y1} ≠ ${y2}`);
    }
  }
});
