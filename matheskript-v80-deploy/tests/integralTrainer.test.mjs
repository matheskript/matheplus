/* Integraltrainer (src/integralKern.js): Alle Aufgabentypen und Stufen erzeugen lösbare Aufgaben,
   die Rechenwege stimmen numerisch, die Prüfungen akzeptieren richtige und lehnen falsche Eingaben ab,
   und keine Rechenzeile endet unvereinfacht (Regel A5). */
import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { q } from "../src/rechnen2.js";

const Kp = (zs) => zs.map((x) => q(x));

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEER = ["ttf", "woff", "woff2", "jpg", "jpeg", "png", "css", "svg", "webp", "gif", "mp4", "pdf"];

let K;
test.before(async () => {
  const datei = path.join(wurzel, "node_modules", `.integraltrainer-test-${process.pid}.mjs`);
  await build({
    entryPoints: [path.join(wurzel, "src/integralKern.js")],
    bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error",
    loader: { ".js": "jsx", ...Object.fromEntries(LEER.map((e) => [`.${e}`, "empty"])) },
    external: ["react", "react-dom", "@supabase/supabase-js"],
    define: { "import.meta.env": JSON.stringify({ DEV: false }) },
  });
  try { K = await import(pathToFileURL(datei).href); } finally { rmSync(datei, { force: true }); }
});

const LAEUFE = 70;
const alleKombis = () => K.TYPEN.flatMap((t) => t.stufen.map((_, i) => [t.id, i + 1]));
/* Simpson-Regel */
function integral(fn, a, b, n = 2000) {
  const h = (b - a) / n;
  let s = fn(a) + fn(b);
  for (let i = 1; i < n; i++) s += fn(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}
const nahe = (x, y, tol = 1e-4) => Math.abs(x - y) <= tol * (1 + Math.abs(y));

test("Jeder Typ und jede Stufe liefert vollständige Aufgaben", () => {
  for (const [typ, stufe] of alleKombis()) {
    for (let i = 0; i < LAEUFE; i++) {
      const a = K.neueAufgabe(typ, stufe);
      assert.ok(!a.fehler, `${typ}/${stufe}: ${a.fehler}`);
      assert.equal(a.typ, typ);
      assert.ok(a.schritte.length >= 2, `${typ}/${stufe}: zu wenige Schritte`);
      for (const s of a.schritte) {
        assert.ok(s.id && s.titel && s.frage, `${typ}/${stufe}: Schritt unvollständig`);
        assert.ok(Array.isArray(s.zeilen) && s.zeilen.length, `${typ}/${stufe}/${s.id}: keine Rechenzeilen`);
        if (s.art !== "info") assert.equal(typeof s.pruefen, "function");
      }
      assert.ok(a.bild && typeof a.bild.fn === "function", `${typ}/${stufe}: Bild fehlt`);
      assert.ok(a.ergebnis && a.ergebnis.tex, `${typ}/${stufe}: Ergebnis fehlt`);
    }
  }
});

test("Ergebnisse stimmen mit numerischer Integration überein", () => {
  for (const [typ, stufe] of alleKombis()) {
    for (let i = 0; i < LAEUFE; i++) {
      const a = K.neueAufgabe(typ, stufe), B = a.bild;
      if (typ === "bestimmt") {
        assert.ok(nahe(integral(B.fn, B.a, B.b), a.ergebnis.wert, 1e-5), `${typ}/${stufe}: ${a.f.tex} von ${B.a} bis ${B.b}`);
        const s = a.schritte;
        assert.ok(nahe(s.find((x) => x.id === "Fb").soll, B.Fn(B.b), 1e-8));
        assert.ok(nahe(s.find((x) => x.id === "Fa").soll, B.Fn(B.a), 1e-8));
      }
      if (typ === "flaeche") {
        const A = integral((x) => Math.abs(B.fn(x)), B.a, B.b, 6000);
        assert.ok(nahe(A, a.ergebnis.wert, 1e-4), `${typ}/${stufe}: A = ${a.ergebnis.wert}, numerisch ${A}`);
        for (const r of B.nullstellen) assert.ok(Math.abs(B.fn(r)) < 1e-9, `${typ}/${stufe}: ${r} ist keine Nullstelle`);
        for (const t of B.teile) assert.ok(nahe(integral(B.fn, t.von, t.bis), t.wert, 1e-6));
      }
      if (typ === "zwei") {
        const A = integral((x) => Math.abs(B.fn(x) - B.gn(x)), B.a, B.b, 6000);
        assert.ok(nahe(A, a.ergebnis.wert, 1e-4), `${typ}/${stufe}: A = ${a.ergebnis.wert}, numerisch ${A}`);
        for (const r of B.nullstellen) assert.ok(Math.abs(B.fn(r) - B.gn(r)) < 1e-9, `${typ}/${stufe}: ${r} ist keine Schnittstelle`);
      }
      if (typ === "anfang") {
        const F = (x) => B.Fn(x) + B.C;
        assert.ok(nahe(F(B.x0), B.y0, 1e-9), `${typ}/${stufe}: F(x₀) ≠ y₀`);
        const h = 1e-5, x = B.x0 + 0.37;
        assert.ok(nahe((F(x + h) - F(x - h)) / (2 * h), B.fn(x), 1e-4), `${typ}/${stufe}: F′ ≠ f`);
      }
      if (typ === "stamm") {
        const h = 1e-5;
        for (const x of [0.41, 1.37, 2.13]) {
          const y = B.fn(x), d = (B.Fn(x + h) - B.Fn(x - h)) / (2 * h);
          if (Number.isFinite(y)) assert.ok(nahe(d, y, 1e-4), `${typ}/${stufe}: F′(${x}) ≠ f(${x}) bei ${a.f.tex}`);
        }
      }
    }
  }
});

test("Prüfungen: richtige Antworten zählen, falsche nicht", () => {
  for (const [typ, stufe] of alleKombis()) {
    for (let i = 0; i < 40; i++) {
      const a = K.neueAufgabe(typ, stufe);
      for (const s of a.schritte) {
        if (s.art === "zahl") {
          assert.ok(typeof s.soll === "number", `${typ}/${stufe}/${s.id}: kein Sollwert`);
          const r = s.pruefen(String(s.soll));
          assert.equal(r.ok, true, `${typ}/${stufe}/${s.id}: richtige Zahl ${s.soll} abgelehnt (${r.hinweis})`);
          const f = s.pruefen(String(s.soll + 1.5));
          assert.equal(f.ok, false, `${typ}/${stufe}/${s.id}: falsche Zahl akzeptiert`);
          assert.ok(f.hinweis.length > 5);
        }
        if (s.art === "zahlen") {
          const r = s.pruefen([...s.sollWerte].reverse().map(String));
          assert.equal(r.ok, true, `${typ}/${stufe}/${s.id}: richtige Nullstellen abgelehnt`);
          const f = s.pruefen(s.sollWerte.map((w, j) => String(j ? w : w + 0.5)));
          assert.equal(f.ok, false);
          assert.equal(s.pruefen(s.sollWerte.map(() => "")).ok, false);
        }
        if (s.art === "term" && s.sollText) {
          const r = s.pruefen(s.sollText);
          assert.equal(r.ok, true, `${typ}/${stufe}/${s.id}: richtiger Term ${s.sollText} abgelehnt (${r.hinweis})`);
          assert.equal(s.pruefen(`${s.sollText}+x`).ok, false, `${typ}/${stufe}/${s.id}: falscher Term akzeptiert`);
        }
      }
    }
  }
});

test("Typische Fehler bekommen gezielte Hinweise", () => {
  const a = K.baueBestimmtPoly(Kp([0, 0, 3]), q(1), q(2), 1);   // ∫₁² 3x² dx = 7, F = x³
  const I = a.schritte.find((s) => s.id === "I");
  assert.equal(I.pruefen("7").ok, true);
  assert.match(I.pruefen("-7").hinweis, /Vorzeichen/);
  assert.match(I.pruefen("9").hinweis, /addiert/);
  assert.match(I.pruefen("8").hinweis, /nur F\(b\)/);
  const Fb = a.schritte.find((s) => s.id === "Fb");
  assert.match(Fb.pruefen("12").hinweis, /f\(b\)/);
  assert.equal(Fb.pruefen("8").ok, true);
  // Fläche: Bilanz statt Fläche
  const fl2 = K.baueFlaeche(Kp([0, -1, 0, 1]), Kp([-1, 0, 1]), null, 2);   // x³ − x
  const A = fl2.schritte.find((s) => s.id === "A");
  assert.equal(A.pruefen("1/2").ok, true);
  assert.match(A.pruefen("0").hinweis, /Bilanz/);
  const I1 = fl2.schritte.find((s) => s.id === "I1"), I2 = fl2.schritte.find((s) => s.id === "I2");
  assert.equal(I1.pruefen("1/4").ok, true);
  assert.match(I2.pruefen("1/4").hinweis, /Betrag/);
  assert.equal(I2.pruefen("-0.25").ok, true);
  // gerundete Eingaben
  assert.equal(I1.pruefen("0,25").ok, true);
  const zw = K.baueZwei(Kp([2, 0, -1]), Kp([0, 1]), Kp([-2, 1]), 1);   // f = 2 − x², g = x → d = −x² − x + 2
  const d = zw.schritte.find((s) => s.id === "d");
  assert.equal(d.pruefen("-x^2-x+2").ok, true);
  assert.equal(d.pruefen("x^2+x-2").ok, true);
  assert.match(d.pruefen("x^2+x-2").hinweis, /g − f/);
  assert.match(d.pruefen("-x^2+x+2").hinweis, /Vorzeichen/);
  assert.equal(zw.ergebnis.tex, "\\frac{9}{2}");
});

test("Exaktwerte: e, π, ln und Brüche werden erkannt", () => {
  const fall = [
    [Math.E - 1, "e − 1"], [Math.PI / 2, "\\frac{π}{2}"], [Math.E ** 2 / 2 - 0.5, "\\frac{1}{2}e^{2} − \\frac{1}{2}"],
    [1 - 1 / Math.E, "1 − \\frac{1}{e}"], [Math.log(3) / 2, "\\frac{1}{2}\\ln(3)"], [1 - Math.LN2, "1 − \\ln(2)"], [3 * Math.E - 3, "3e − 3"],
    [26 / 3, "\\frac{26}{3}"], [-16 / 3, "−\\frac{16}{3}"], [2, "2"], [Math.E - 0.5, "e − \\frac{1}{2}"], [Math.E ** 2, "e^{2}"],
  ];
  for (const [v, t] of fall) assert.equal(K.exaktTex(v), t, `exaktTex(${v})`);
  assert.equal(K.exaktTex(Math.sqrt(7)), null);
});

test("Nullstellenwege: pq-Formel, x ausklammern, raten + Polynomdivision, Substitution", () => {
  const w1 = K.nullstellenWeg(Kp([-2, -1, 1]));                      // x² − x − 2
  assert.deepEqual(w1.loesungen.map((x) => x.z / x.n), [-1, 2]);
  assert.ok(w1.zeilen.some((z) => /pq/.test(z.notiz || "")));
  const w2 = K.nullstellenWeg(Kp([0, -6, -1, 1]));                   // x³ − x² − 6x
  assert.deepEqual(w2.loesungen.map((x) => x.z / x.n), [-2, 0, 3]);
  assert.ok(w2.zeilen.some((z) => /ausklammern/.test(z.notiz || "")));
  const w3 = K.nullstellenWeg(Kp([-2, 1, 2, -1]));                   // −x³ + 2x² + x − 2
  assert.deepEqual(w3.loesungen.map((x) => x.z / x.n), [-1, 1, 2]);
  assert.ok(w3.zeilen.some((z) => /Polynomdivision/.test(z.notiz || "")));
  const w4 = K.nullstellenWeg(Kp([4, 0, -5, 0, 1]));                 // x⁴ − 5x² + 4
  assert.deepEqual(w4.loesungen.map((x) => x.z / x.n), [-2, -1, 1, 2]);
  assert.ok(w4.zeilen.some((z) => /Substitution/.test(z.k.join(" "))));
});

test("Eigene Funktion: Polynome exakt, andere über die Formel-Engine, Fehler verständlich", () => {
  const p = K.eigeneAufgabe("bestimmt", { f: "x^2-4", a: "-1", b: "2" });
  assert.equal(p.ergebnis.tex, "−9");
  const t = K.eigeneAufgabe("bestimmt", { f: "e^x", a: "0", b: "1" });
  assert.equal(t.ergebnis.tex, "e − 1");
  assert.match(K.eigeneAufgabe("bestimmt", { f: "1/x", a: "-1", b: "1" }).fehler, /nicht überall definiert/);
  assert.match(K.eigeneAufgabe("bestimmt", { f: "x^2", a: "2", b: "2" }).fehler, /gleich/);
  assert.match(K.eigeneAufgabe("stamm", { f: "e^(x^2)" }).fehler, /keine Stammfunktionsregel/);
  assert.equal(K.eigeneAufgabe("stamm", { f: "cos(3x)" }).ergebnis.tex, "F(x) = \\frac{1}{3}\\sin(3x) + C");
});

/* ---------- Regel A5 auf allen Rechenzeilen ---------- */
const N = String.raw`\d+(?:[.,]\d+)?`;
const MUSTER = [
  [new RegExp(String.raw`(?:^|=)\s*${N}\s*[+−\-]\s*${N}\s*$`), "Zahl ± Zahl am Zeilenende"],
  [new RegExp(String.raw`(?:^|=)\s*${N}\s*(?:·|\\cdot|\*)\s*${N}\s*$`), "Zahl · Zahl am Zeilenende"],
  [/(^|[^\d.,\w])1\s*(?:·|\\cdot)?\s*x(?![\w])/, "1x bzw. 1 · x"],
  [/\+\s*[−-]\s*\d/, "+ − Zahl"],
  [/[−-]\s*[−-]\s*\d/, "− − Zahl"],
  [/(?:·|\\cdot)\s*1(?![\d,.\/^])/, "· 1"],
  [/[+−-]\s*0(?![\d,.])\s*$/, "± 0 am Ende"],
  [/\^\{1\}/, "Hochzahl 1"],
  [/(?:\d|\})\s+(?:x|e\^|\\sin|\\cos|\\ln)(?![\w])/, "Produkt nicht eng (Pen & Paper)"],
];
/* Grenzen „_{…}^{…}“ (Integral, eckige Klammer) entfernen – das Leerzeichen danach ist kein Produkt */
function ohneGrenzen(t) {
  let aus = "", i = 0;
  const gruppe = (j) => { let tief = 0; for (let k = j; k < t.length; k++) { if (t[k] === "{") tief++; else if (t[k] === "}" && --tief === 0) return k + 1; } return t.length; };
  while (i < t.length) {
    if (t[i] === "_" && t[i + 1] === "{") { const e = gruppe(i + 1); if (t[e] === "^" && t[e + 1] === "{") { i = gruppe(e + 1); aus += "▫"; continue; } }
    aus += t[i]; i++;
  }
  return aus;
}
test("Regel A5: keine unvereinfachten Endstücke, Produkte eng", () => {
  const funde = new Map();
  for (const [typ, stufe] of alleKombis()) {
    for (let i = 0; i < 120; i++) {
      const a = K.neueAufgabe(typ, stufe);
      const zeilen = a.schritte.flatMap((s) => [...s.zeilen.map((z) => z.k.join(" ")), s.antwortTex || ""]);
      zeilen.push(a.ergebnis.tex, ...(a.kopf.funktionen || []).map((f) => f.tex));
      for (const t of zeilen.map(ohneGrenzen)) for (const stueck of t.split(/;/)) for (const [re, was] of MUSTER) {
        const m = re.exec(stueck);
        if (!m) continue;
        const rest = stueck.slice(m.index + m[0].length);
        if (was !== "Produkt nicht eng (Pen & Paper)" && /=|≈|\\Leftrightarrow/.test(rest)) continue;
        const schl = `${typ}/${stufe}: ${was} → „${stueck.slice(0, 110)}“`;
        funde.set(schl, true);
      }
    }
  }
  if (funde.size) console.log([...funde.keys()].slice(0, 40).join("\n"));
  assert.equal(funde.size, 0);
});

test("Hilfe-Kontext für „Ich hänge fest“ passt zur Aufgabe", () => {
  for (const t of K.TYPEN) {
    const a = K.neueAufgabe(t.id, 1);
    for (const s of a.schritte) {
      const h = K.hilfeKontext(a, s.id);
      assert.ok(h && h.id && h.aufgabe.includes(s.titel));
    }
  }
});
