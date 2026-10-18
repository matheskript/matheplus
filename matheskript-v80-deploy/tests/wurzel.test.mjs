/* Wurzeln sind EIN Linienzug – in der App, im PDF und in jeder neuen Datei.
   Dieser Test schlägt an, sobald irgendwo wieder ein „√“-Zeichen mit einer
   eigenen Linie (border-top, overline …) kombiniert wird. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  WURZEL_MASS, W_ANF, W_END, klartextMarkieren, klartextWurzeln, radikandLesen, wurzelPunkte, wurzelStrich, wurzelStuecke, wurzelTiefe,
} from "../src/wurzelGeometrie.js";
import { hatWurzel, ueberstrichHoehe, wurzelnImPdf } from "../src/wurzelPdf.js";

const SRC = new URL("../src/", import.meta.url).pathname;
const alleDateien = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? alleDateien(p) : /\.(jsx?|mjs|css)$/.test(n) ? [p] : [];
});
const DATEIEN = alleDateien(SRC).map((p) => ({ p: p.slice(SRC.length), s: readFileSync(p, "utf8") }));
const ERLAUBT = new Set(["wurzelZeichen.jsx", "wurzelGeometrie.js", "wurzelPdf.js"]);

/* ---------- Geometrie ---------- */

test("Spitze des Aufstrichs und Überstrich liegen exakt auf derselben Höhe – ein durchgehender Zug", () => {
  for (const f of [11, 14, 16, 22, 34]) {
    for (const h of [f * 1.2, f * 1.6, f * 3]) {
      const s = wurzelStrich(f, 400);
      const p = wurzelPunkte({ w: 5 * f, h, f, s });
      assert.equal(p.length, 5);
      assert.equal(p[3][1], p[4][1], "Spitze und Überstrich auf gleicher Höhe");
      assert.equal(p[3][1], s / 2, "Überstrich ganz oben im Kasten");
      assert.ok(p[4][0] > p[3][0], "Überstrich läuft nach rechts");
      assert.ok(p[2][1] > p[1][1] && p[2][1] <= h, "Abstrich geht nach unten, bleibt im Kasten");
      assert.ok(p[3][0] <= WURZEL_MASS.haken * f, "Radikand beginnt erst hinter der Spitze");
    }
  }
});

test("Strich wächst mit der Schrift und ist bei fetter Schrift kräftiger", () => {
  assert.ok(wurzelStrich(32) > wurzelStrich(16));
  assert.ok(wurzelStrich(20, 700) > wurzelStrich(20, 400));
  assert.ok(wurzelStrich(8) >= 1);
});

/* ---------- Klartext ---------- */

test("Klartext-Wurzeln werden erkannt, Klammern nach √ entfallen", () => {
  assert.deepEqual(radikandLesen("√(a² + b²) = c", 1), ["a² + b²", 10]);
  assert.deepEqual(radikandLesen("√12 ≈", 1), ["12", 3]);
  assert.deepEqual(radikandLesen("√2,5", 1), ["2,5", 4]);
  assert.deepEqual(radikandLesen("√x₁", 1), ["x₁", 3]);
  assert.equal(radikandLesen("√ ist ein Zeichen", 1), null);
  assert.deepEqual(klartextWurzeln("c = √(a² + b²)"), ["c = ", { wurzel: ["a² + b²"], index: null }]);
  assert.deepEqual(klartextWurzeln("H(−√a | 2a√a)"), ["H(−", { wurzel: ["a"], index: null }, " | 2a", { wurzel: ["a"], index: null }, ")"]);
  assert.deepEqual(klartextWurzeln("³√8 = 2"), [{ wurzel: ["8"], index: "3" }, " = 2"]);
  assert.deepEqual(klartextWurzeln("√(1 + √2)"), [{ wurzel: ["1 + ", { wurzel: ["2"], index: null }], index: null }]);
  assert.deepEqual(klartextWurzeln("Taste √ drücken"), ["Taste √ drücken"]);
});

test("Markierungen fürs PDF: hin und zurück, Verschachtelung", () => {
  const t = klartextMarkieren("x = √(1 + √2)");
  assert.equal(t, `x = ${W_ANF}1 + ${W_ANF}2${W_END}${W_END}`);
  const st = wurzelStuecke(t);
  assert.deepEqual(st, ["x = ", { wurzel: ["1 + ", { wurzel: ["2"] }] }]);
  assert.equal(wurzelTiefe(st), 2);
  assert.equal(klartextMarkieren(t), t, "zweimal markieren ändert nichts");
  assert.ok(!t.includes("√"));
});

/* ---------- PDF ---------- */

function attrappe() {
  const log = [];
  const doc = {
    groesse: 10,
    getFontSize() { return this.groesse; },
    text(t, x, y) { log.push(["text", t, x, y]); return this; },
    getTextWidth(t) { return t.length * this.groesse * 0.3528 * 0.55; },
    lines(d, x, y) { log.push(["lines", d, x, y]); },
    setDrawColor() {}, setLineWidth() {}, getTextColor() { return "#000000"; }, getDrawColor() { return "#000000"; }, getLineWidth() { return 0.2; },
  };
  return { doc: wurzelnImPdf(doc), log };
}

test("PDF: Wurzel ist ein einziger Linienzug, Überstrich exakt waagerecht über dem Radikanden", () => {
  const { doc, log } = attrappe();
  const t = klartextMarkieren("c = √(a² + b²)");
  doc.text(t, 10, 50);
  const zuege = log.filter((e) => e[0] === "lines");
  assert.equal(zuege.length, 1, "ein Linienzug pro Wurzel");
  const [, d, x0, y0] = zuege[0];
  assert.equal(d.length, 4, "Anstrich, Abstrich, Aufstrich, Überstrich in einem Zug");
  assert.equal(d[3][1], 0, "Überstrich waagerecht, ohne Versatz an der Spitze");
  const pts = [[x0, y0]];
  d.forEach(([dx, dy]) => pts.push([pts.at(-1)[0] + dx, pts.at(-1)[1] + dy]));
  const radikand = log.find((e) => e[0] === "text" && e[1] === "a² + b²");
  assert.ok(radikand, "Radikand wird ohne Klammern gesetzt");
  assert.ok(radikand[2] >= pts[3][0], "Radikand beginnt hinter der Spitze");
  assert.ok(pts[4][0] >= radikand[2] + doc.getTextWidth("a² + b²") - 1e-9, "Überstrich deckt den ganzen Radikanden");
  assert.ok(pts[4][1] < 50 - 0.9 * doc.groesse * 0.3528, "Hochzahlen bekommen Platz unter dem Überstrich");
  assert.ok(!log.some((e) => e[0] === "text" && /[√\u0001\u0002]/.test(e[1])), "kein √-Zeichen und keine Markierung im PDF-Text");
});

test("PDF: Breite und rechtsbündiger Text berücksichtigen die Wurzel", () => {
  const { doc, log } = attrappe();
  const t = klartextMarkieren("√2");
  assert.ok(hatWurzel(t));
  const b = doc.getTextWidth(t);
  assert.ok(b > doc.getTextWidth("2"));
  doc.text(t, 100, 20, { align: "right" });
  const z = log.find((e) => e[0] === "lines");
  assert.ok(Math.abs(z[2] - (100 - b)) < 1, "beginnt um die Gesamtbreite links vom Anker");
  assert.ok(ueberstrichHoehe(wurzelStuecke(klartextMarkieren("√(1+√2)"))[0].wurzel) > ueberstrichHoehe(["2"]),
    "äußere Wurzel hat den höheren Überstrich");
});

/* ---------- Wächter für den ganzen Quelltext ---------- */

test("Nirgends wird „√“ mit einer eigenen Linie (border-top, overline …) kombiniert", () => {
  const LINIE = /border-?top|borderTop|overline|text-decoration|textDecoration/;
  const funde = [];
  for (const { p, s } of DATEIEN) {
    if (ERLAUBT.has(p)) continue;
    const zeilen = s.split("\n");
    zeilen.forEach((z, i) => {
      if (!z.includes("√")) return;
      // Glyph in JSX/Markup (nicht in Kommentaren oder Daten-Strings), dazu eine Linie in der Nähe
      const umgebung = zeilen.slice(Math.max(0, i - 2), i + 3).join("\n");
      const imMarkup = />\s*√\s*</.test(z) || />√[^<\n]*</.test(z) || /√<span|√\{/.test(z) || /["'`]√["'`]\s*\}?\s*<\/span>/.test(z);
      if (imMarkup && LINIE.test(umgebung)) funde.push(`${p}:${i + 1}: ${z.trim().slice(0, 120)}`);
    });
  }
  // CSS-Klassen, die eine Wurzel aus Glyph + Rand bauen
  for (const { p, s } of DATEIEN) {
    if (ERLAUBT.has(p)) continue;
    if (/\.[\w-]*(wurzel|rad|sqrt)[\w-]*\s*\{[^}]*border-top/i.test(s)) funde.push(`${p}: CSS-Klasse mit border-top für eine Wurzel`);
  }
  assert.deepEqual(funde, [], "Wurzeln immer mit <WurzelZeichen> / \\sqrt{…} / <MitWurzeln> setzen:\n" + funde.join("\n"));
});

test("Die alte Glyph-Wurzel im Formelsatz ist weg; \\sqrt läuft über WurzelZeichen", () => {
  const f3 = DATEIEN.find((d) => d.p === "func3.jsx").s;
  assert.match(f3, /t\.typ === "sqrt"\) return <WurzelZeichen/);
  const f19 = DATEIEN.find((d) => d.p === "func19.jsx").s;
  assert.match(f19, /export function Wurzel[^]*?<WurzelZeichen/);
  const pdf = DATEIEN.find((d) => d.p === "func11.jsx").s;
  assert.doesNotMatch(pdf, /`√\(\$\{|`√\$\{/, "PDF baut keine „√(…)“-Texte mehr");
  assert.match(pdf, /wurzelnImPdf\(d\)/);
});

test("TeX in JSX-Attributen nie als \"…\\\\…\" (dort wird nichts entwertet – es erschiene „\\mathbbN“)", () => {
  const funde = [];
  for (const { p, s } of DATEIEN) {
    if (!p.endsWith(".jsx")) continue;
    s.split("\n").forEach((z, i) => {
      if (/\s[a-zA-Z]+="[^"{}]*\\\\[a-zA-Z{]/.test(z)) funde.push(`${p}:${i + 1}: ${z.trim().slice(0, 120)}`);
    });
  }
  assert.deepEqual(funde, [], "Attribut als {\"…\"} schreiben:\n" + funde.join("\n"));
});
