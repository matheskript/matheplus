import test from "node:test";
import assert from "node:assert/strict";
import * as F from "../src/funktionenGen.js";
import { enthaelt, mengeTex } from "../src/mengenRechnen.js";
import { a5, schritteOk } from "./aufgabenDaten.mjs";

const ALLE = Object.values(F.FK_KAPITEL_ARTEN).flat();
const L = 400;
const PROBEN = [];
for (let x = -20; x <= 20; x += 0.25) PROBEN.push(x);
const dichte = (lo, hi) => { const l = []; for (let i = 0; i <= 40000; i++) l.push(lo + ((hi - lo) * i) / 40000); return l; };

test("Titel für alle Typen", () => { for (const a of ALLE) assert.ok(F.FK_TITEL[a], a); });

test("Jede Aufgabe vollständig und A5", () => {
  for (const art of ALLE) for (let i = 0; i < L; i++) { const au = F.fkAufgabe(art); schritteOk(au); a5(au); }
});

test("Definitionsbereiche stimmen: x ∈ D ⇔ f(x) ist definiert", () => {
  for (const fam of F.D_FAMILIEN) for (let i = 0; i < 300; i++) {
    const G = F.FAMILIEN[fam](Math.random);
    for (const x of PROBEN) assert.equal(enthaelt(G.D, x), Number.isFinite(G.f(x)), `${fam}: ${G.tex}, x = ${x}, D = ${mengeTex(G.D)}`);
    /* die kritische Stelle ist eine Grenze bzw. ausgeschlossene Stelle von D */
    assert.ok(mengeTex(G.D).includes(String(Math.abs(G.krit))), `${fam}: krit ${G.krit} passt nicht zu ${mengeTex(G.D)}`);
  }
});

test("Wertebereiche stimmen: Werte liegen in W, W wird ausgeschöpft", () => {
  for (const fam of F.W_FAMILIEN) for (let i = 0; i < 20; i++) {
    const G = F.FAMILIEN[fam](Math.random);
    const xs = [...(fam === "exp" ? dichte(-15, 15) : dichte(-600, 600)), ...Array.from({ length: 41 }, (_, k) => k - 20)].sort((p, q) => p - q).filter((x) => Number.isFinite(G.f(x)));
    const ys = xs.map(G.f);
    for (const y of ys) assert.ok(enthaelt(G.W, y) || Math.abs(y) > 1e6, `${fam}: ${G.tex} hat Wert ${y} ∉ ${mengeTex(G.W)}`);
    /* Ausschöpfen: Stichproben aus W (beschränkt) werden von f fast erreicht */
    const ziele = [-5, -2.5, -1, -0.3, 0.3, 1, 2.5, 4].map((t) => t + (G.wkrit ?? 0)).filter((t) => enthaelt(G.W, t));
    for (const t of ziele) assert.ok(ys.some((y, j) => Math.abs(y - t) < 0.08 || (j + 1 < ys.length && (y - t) * (ys[j + 1] - t) <= 0 && Math.abs(y - ys[j + 1]) < 5)), `${fam}: ${G.tex} erreicht ${t} ∈ ${mengeTex(G.W)} nicht`);
  }
});

test("Umkehrfunktionen stimmen: f⁻¹(f(x)) = x", () => {
  for (let i = 0; i < 400; i++) {
    for (const art of ["ulinear", "uterm"]) {
      const au = F.fkAufgabe(art);
      const p = au.pruef;
      for (const x of PROBEN) {
        if (p.Df && !enthaelt(p.Df, x)) continue;
        const y = p.f(x);
        if (!Number.isFinite(y) || Math.abs(y) > 1e6) continue;
        assert.ok(Math.abs(p.finv(y) - x) < 1e-6, `${art}: ${au.text[0]} bei x = ${x}`);
        if (p.Dinv) assert.ok(enthaelt(p.Dinv, y), `${art}: f(x) = ${y} ∉ D(f⁻¹)`);
      }
    }
    const w = F.fkAufgabe("uwert");
    assert.ok(Math.abs(w.pruef.f(w.pruef.x0) - w.pruef.y0) < 1e-12);
  }
});

test("Verkettung, Potenz und Wurzel: Rechenergebnisse", () => {
  for (let i = 0; i < 500; i++) {
    const v = F.fkAufgabe("vwert"); const p = v.pruef;
    assert.ok(Math.abs(F.AUSSEN[p.a].f(F.INNEN[p.g].f(p.x0)) - p.w) < 1e-12);
    const r = F.fkAufgabe("parameter"); assert.equal(r.pruef.a * r.pruef.k ** r.pruef.n, r.pruef.y);
    const g = F.fkAufgabe("wgleichung");
    for (const x of g.pruef.loes) assert.ok(Math.abs(Math.sqrt(x + g.pruef.a) - g.pruef.b) < 1e-12);
    const s = F.fkAufgabe("symmetrie");
    for (const x of [1, 2, 3]) assert.ok(Math.abs(s.pruef.f(-x) - (s.pruef.gerade ? 1 : -1) * s.pruef.f(x)) < 1e-9);
    const d = F.fkAufgabe("potdw");
    for (const x of PROBEN) if (x !== 0) assert.ok(enthaelt(d.pruef.W, d.pruef.f(x)));
  }
});
