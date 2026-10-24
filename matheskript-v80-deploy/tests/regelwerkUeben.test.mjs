/* Modus „Üben“ im Ableitungstrainer (src/regelwerkUeben.js): Für jede Regel und Stufe sowie für eigene
   Funktionen liefert uebenWeg* je Schritt eine richtige Zeile (besteht gleichwertig) und bis zu drei falsche
   (jede fällt bei gleichwertig durch, alle verschieden, jede mit Hinweis). */
import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEER = ["ttf", "woff", "woff2", "jpg", "jpeg", "png", "css", "svg", "webp", "gif", "mp4", "pdf"];

let U, K;
test.before(async () => {
  const datei = path.join(wurzel, "node_modules", `.regelwerkueben-test-${process.pid}.mjs`);
  const quelle = path.join(wurzel, "node_modules", `.regelwerkueben-entry-${process.pid}.mjs`);
  const { writeFileSync } = await import("node:fs");
  writeFileSync(quelle, `export * as U from "../src/regelwerkUeben.js"; export * as K from "../src/regelwerkKern.js";`);
  await build({
    entryPoints: [quelle],
    bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error",
    loader: { ".js": "jsx", ...Object.fromEntries(LEER.map((e) => [`.${e}`, "empty"])) },
    external: ["react", "react-dom", "@supabase/supabase-js"],
    define: { "import.meta.env": JSON.stringify({ DEV: false }) },
  });
  try { ({ U, K } = await import(pathToFileURL(datei).href)); } finally { rmSync(datei, { force: true }); rmSync(quelle, { force: true }); }
});

/* fester Zufall, damit die Läufe reproduzierbar sind */
const zufallAb = (seed) => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

function pruefeSchritte(schritte, soll, wo) {
  assert.ok(schritte.length > 0, `${wo}: keine Schritte`);
  for (const s of schritte) {
    assert.ok(s.optionen.length >= 2, `${wo} ${s.art}: nur ${s.optionen.length} Option(en) – ${s.richtig.tex}`);
    assert.ok(s.optionen.length <= 4, `${wo} ${s.art}: zu viele Optionen`);
    assert.ok(s.optionen[0].richtig, `${wo} ${s.art}: erste Option nicht die richtige`);
    assert.ok(s.frage && s.label, `${wo} ${s.art}: Frage oder Label fehlt`);
    const keys = new Set(s.optionen.map((o) => o.key));
    assert.equal(keys.size, s.optionen.length, `${wo} ${s.art}: doppelte Zeilen ${[...s.optionen.map((o) => o.key)]}`);
    const sollBaum = soll(s);
    assert.ok(K.gleichwertig(s.optionen[0].wert.baum, sollBaum), `${wo} ${s.art}: richtige Zeile ${s.richtig.tex} besteht nicht`);
    for (const o of s.optionen.slice(1)) {
      assert.ok(!o.richtig, `${wo} ${s.art}: zwei richtige`);
      assert.ok(!K.gleichwertig(o.wert.baum, sollBaum), `${wo} ${s.art}: falsche Zeile ${o.wert.tex} ist gleichwertig`);
      assert.ok(o.hinweis && o.hinweis.length > 10, `${wo} ${s.art}: Hinweis fehlt bei ${o.wert.tex}`);
      assert.ok(!/NaN|undefined/.test(o.wert.tex), `${wo} ${s.art}: unlesbar ${o.wert.tex}`);
    }
  }
}

test("Werkstatt: alle Regeln und Stufen, 25 Läufe – richtig besteht, falsch fällt durch", () => {
  const regeln = [["produkt", 3], ["quotient", 3], ["reziprok", 3], ["linkette", 3], ["kette", 3], ["gold", 5]];
  let zweier = 0, gesamt = 0;
  for (const [regel, stufen] of regeln) {
    for (let st = 1; st <= stufen; st++) {
      for (let i = 0; i < 25; i++) {
        const auf = K.neueAufgabe(regel, st);
        const ml = K.musterloesung(auf.regel, auf.u, auf.v);
        const schritte = U.uebenWegWerkstatt(auf, zufallAb(i * 7 + st));
        const kette = auf.regel === "kette" || auf.regel === "linkette";
        const erwartet = auf.regel === "reziprok" ? 2 : kette ? 4 : 3;
        assert.equal(schritte.length, erwartet, `${regel} ${st}: ${schritte.length} Schritte für ${auf.uText} / ${auf.vText}`);
        assert.deepEqual(schritte.map((s) => s.art), auf.regel === "reziprok" ? ["v1", "f1"] : kette ? ["u1", "uv", "v1", "f1"] : ["u1", "v1", "f1"]);
        const soll = (s) => (s.art === "u1" ? ml.u1 : s.art === "v1" ? ml.v1 : s.art === "uv" ? ml.uv : ml.soll);
        pruefeSchritte(schritte, soll, `${regel} ${st} (${auf.uText} / ${auf.vText})`);
        for (const s of schritte) { gesamt++; if (s.optionen.length === 2) zweier++; }
      }
    }
  }
  // Fast immer gibt es mindestens zwei sinnvolle falsche Zeilen
  assert.ok(zweier / gesamt < 0.15, `zu viele Schritte mit nur zwei Karten: ${zweier} von ${gesamt}`);
});

test("Werkstatt: Produktregel x² · sin(x) – Fehlerbilder sind die bekannten", () => {
  const u = K.lies("x^2"), v = K.lies("sin(x)");
  const schritte = U.uebenWegWerkstatt({ regel: "produkt", u, v }, zufallAb(3));
  const [u1, v1, f1] = schritte;
  assert.equal(u1.richtig.tex, "2x");
  assert.ok(u1.optionen.some((o) => o.art === "exponent-bleibt" || o.art === "nicht-abgeleitet" || o.art === "faktor-fehlt" || o.art === "vorzeichen" || o.art === "v-statt-u" || o.art === "zweimal"));
  assert.equal(v1.richtig.tex, "\\cos(x)");
  assert.ok(v1.optionen.slice(1).some((o) => o.art === "sin-minus"), "sin → −cos fehlt");
  assert.ok(K.gleichwertig(f1.richtig.baum, U.ableitungsKette(K.lies("x^2*sin(x)"))[1]));
  const arten = f1.optionen.slice(1).map((o) => o.art);
  assert.ok(arten.includes("regel") || arten.includes("vorzeichen") || arten.includes("nur-u1v1"), `f′-Fehler: ${arten}`);
});

test("Werkstatt: Kettenregel e^(x²) – u′(v(x)) hat eigene Fehler", () => {
  const u = K.lies("e^x"), v = K.lies("x^2");
  const schritte = U.uebenWegWerkstatt({ regel: "kette", u, v }, zufallAb(5));
  const uv = schritte.find((s) => s.art === "uv");
  assert.ok(uv, "Schritt uv fehlt");
  assert.ok(uv.optionen.length >= 3, `uv nur ${uv.optionen.length} Optionen`);
  const arten = uv.optionen.slice(1).map((o) => o.art);
  assert.ok(arten.some((a) => ["nicht-eingesetzt", "nicht-abgeleitet", "v-strich-eingesetzt", "schon-f"].includes(a)), `uv-Fehler: ${arten}`);
});

test("Eigene Funktion: f′, f″, f‴ für typische Funktionen", () => {
  const fs = ["x^3-2x^2+5", "sin(2x)", "e^(-x^2)", "x*e^x", "1/x", "sqrt(x)", "3x^2", "ln(x)", "x^2", "cos(x)+x"];
  for (const f of fs) {
    const k2 = U.ableitungsKette(K.lies(f));
    const schritte = U.uebenWegEigen(k2, zufallAb(11));
    assert.equal(schritte.length, 3, `${f}: ${schritte.length} Schritte`);
    pruefeSchritte(schritte, (s) => k2[s.stufe], `eigen ${f}`);
    assert.deepEqual(schritte.map((s) => s.label), ["f′(x) =", "f″(x) =", "f‴(x) ="]);
  }
});

test("fehlerAbleitung: Polynom und Grundfunktionen liefern die erwarteten Fehlerarten", () => {
  const arten = (f) => U.fehlerAbleitung(K.lies(f)).map((k) => k.art);
  assert.ok(arten("x^3+2x+1").includes("konstante-bleibt"));
  assert.ok(arten("x^3+2x+1").includes("exponent-bleibt"));
  assert.ok(arten("3x^2").includes("koef-weg"));
  assert.ok(arten("sin(x)").includes("sin-minus"));
  assert.ok(arten("cos(x)").includes("cos-plus"));
  assert.ok(arten("e^x").includes("e-potenz"));
  assert.ok(arten("sqrt(x)").includes("wurzel-halb"));
  assert.ok(arten("e^(2x)").some((a) => a.startsWith("regel-")));
  assert.ok(arten("x*sin(x)").includes("regel-produkt"));
});
