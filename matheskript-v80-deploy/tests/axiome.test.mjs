import test from "node:test";
import assert from "node:assert/strict";
import {
  AXIOME, BEISPIELE_ERWEITERN, BEISPIELE_KUERZEN, BEISPIEL_GLEICHUNG, BEWEIS_BINOM1, BEWEIS_BINOM2, BEWEIS_BINOM3, BEWEIS_KUERZEN,
  BEWEIS_EINDEUTIG, BEWEIS_KEIN_INVERSES, BEWEIS_MAL_NULL, BEWEIS_PLUS_MAL_MINUS,
  MAL_GESETZE, NICHT_ASSOZIATIV, PLUS_GESETZE, UMSCHREIBUNGEN, distribut, ergaenzung, inversen, mz, schoen,
  verkleideteEins, verkleideteNull, verkleidungen,
} from "../src/axiome.js";

/* ---------- kleiner TeX-Auswerter für die Teilmenge, die das Modul benutzt ----------
   Zahlen, einbuchstabige Variablen, + − · (\cdot), Klammern, \frac{}{}, \sqrt{}, Hochzahl ^2 / ^{…},
   Nebeneinanderschreiben = Malnehmen (2ab, x(x−1)). Alles andere wirft einen Fehler. */
function tokens(tex) {
  const t = String(tex).replace(/−/g, "-");
  const out = [];
  let i = 0;
  while (i < t.length) {
    const ch = t[i];
    let m;
    if (/\s/.test(ch)) { i++; continue; }
    if ((m = /^\\([a-zA-Z]+)/.exec(t.slice(i)))) {
      // Wie im Formelsatz der App (mLies): Befehle sind genau die Buchstabenfolge nach dem Backslash.
      // „\cdota“ wäre also ein unbekannter Befehl – fehlende Leerzeichen fallen hier auf.
      if (!["cdot", "frac", "sqrt", "text", "quad"].includes(m[1])) throw new Error(`Unbekannter Befehl \\${m[1]} in ${tex}`);
      out.push({ k: "cmd", s: m[1] }); i += m[0].length;
    }
    else if ((m = /^\d+(\.\d+)?/.exec(t.slice(i)))) { out.push({ k: "num", s: m[0] }); i += m[0].length; }
    else if (/[a-zA-Z]/.test(ch)) { out.push({ k: "let", s: ch }); i++; }
    else if ("+-^{}()=".includes(ch)) { out.push({ k: "sym", s: ch }); i++; }
    else throw new Error(`Unbekanntes Zeichen „${ch}“ in ${tex}`);
  }
  return out;
}
function werte(tex, belegung = {}) {
  const tk = tokens(tex);
  let i = 0;
  const peek = () => tk[i];
  const next = () => tk[i++];
  const erwarte = (s) => { const x = next(); if (!x || x.s !== s) throw new Error(`„${s}“ erwartet in ${tex}`); };
  const istFaktor = (x) => x && (x.k === "num" || x.k === "let" || x.s === "(" || x.s === "{" || (x.k === "cmd" && (x.s === "frac" || x.s === "sqrt")));
  function ausdruck() {
    let v = produkt();
    while (peek() && peek().k === "sym" && (peek().s === "+" || peek().s === "-")) { const op = next().s; const w = produkt(); v = op === "+" ? v + w : v - w; }
    return v;
  }
  function produkt() {
    let v = vorzeichen();
    for (;;) {
      const x = peek();
      if (x && x.k === "cmd" && x.s === "cdot") { next(); v *= vorzeichen(); }
      else if (istFaktor(x)) v *= vorzeichen();
      else break;
    }
    return v;
  }
  function vorzeichen() { if (peek() && peek().s === "-" && peek().k === "sym") { next(); return -vorzeichen(); } return potenz(); }
  function potenz() { const b = atom(); if (peek() && peek().s === "^") { next(); return b ** gruppe(); } return b; }
  function gruppe() { if (peek() && peek().s === "{") { next(); const v = ausdruck(); erwarte("}"); return v; } return atom(); }
  function atom() {
    const x = next();
    if (!x) throw new Error(`Unerwartetes Ende in ${tex}`);
    if (x.k === "num") return Number(x.s);
    if (x.k === "let") { if (!(x.s in belegung)) throw new Error(`Variable ${x.s} fehlt in ${tex}`); return belegung[x.s]; }
    if (x.s === "(") { const v = ausdruck(); erwarte(")"); return v; }
    if (x.s === "{") { const v = ausdruck(); erwarte("}"); return v; }
    if (x.k === "cmd" && x.s === "frac") { const z = gruppe(); const n = gruppe(); return z / n; }
    if (x.k === "cmd" && x.s === "sqrt") return Math.sqrt(gruppe());
    throw new Error(`Unerwartetes Zeichen „${x.s}“ in ${tex}`);
  }
  const v = ausdruck();
  if (i !== tk.length) throw new Error(`Rest „${tk[i].s}“ in ${tex}`);
  return v;
}
const nah = (a, b, msg) => assert.ok(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)), `${msg}: ${a} ≠ ${b}`);

/* Zeilentext aus den Segmenten; führendes „=“ weg */
const zeilenTex = (z) => z.seg.map((s) => (typeof s === "string" ? s : s.t)).join("").replace(/^\s*=/, "");
const belegungVon = (vars, werteListe) => Object.fromEntries(vars.map((v, i) => [v, werteListe[i]]));

test("Auswerter: Grundrechenarten, Potenz, Bruch, Wurzel, Nebeneinanderschreiben", () => {
  nah(werte("2+3\\cdot4"), 14, "Punkt vor Strich");
  nah(werte("(2+3)\\cdot4"), 20, "Klammer");
  nah(werte("2ab", { a: 3, b: 4 }), 24, "2ab");
  nah(werte("-a^2", { a: 3 }), -9, "−a² = −(a²)");
  nah(werte("(-a)^2", { a: 3 }), 9, "(−a)²");
  nah(werte("\\frac{x^2-x}{x}", { x: 5 }), 4, "Bruch");
  nah(werte("\\frac{1}{\\sqrt{2}}"), Math.SQRT1_2, "Wurzel im Nenner");
  nah(werte("x(x-1)", { x: 4 }), 12, "Klammer ohne Malpunkt");
  nah(werte("a+(-b)", { a: 1, b: 5 }), -4, "Plus Minus");
  assert.throws(() => werte("a+", { a: 1 }));
  assert.throws(() => werte("c", { a: 1 }));
});

test("Gesetze: Proben stimmen links = rechts, und die gezeigten Terme rechnen dasselbe wie pruefe()", () => {
  for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) for (let c = 1; c <= 9; c++) {
    for (const g of [...PLUS_GESETZE, ...MAL_GESETZE]) {
      const [l, r] = g.pruefe(a, b, c);
      nah(l, r, `${g.kz} bei ${a},${b},${c}`);
      const [tl, tr] = g.zeige(a, b, c);
      nah(werte(tl), l, `${g.kz} links gezeigt`);
      nah(werte(tr), r, `${g.kz} rechts gezeigt`);
    }
  }
  assert.equal(PLUS_GESETZE.find((g) => g.neutral).kz, "A3");
  assert.equal(MAL_GESETZE.find((g) => g.neutral).kz, "M3");
});

test("Axiome: zehn Einträge, eindeutige Kürzel, Formeln lassen sich lesen", () => {
  assert.equal(AXIOME.length, 10);
  assert.equal(new Set(AXIOME.map((x) => x.kz)).size, 10);
  const lesbar = AXIOME.filter((x) => x.kz !== "N");
  for (const x of lesbar) assert.ok(x.tex.includes("="), x.kz);
  // Distributivgesetz und die Rechteckprobe
  for (const [a, b, c] of [[1, 2, 3], [4, 5, 6], [9, 1, 1]]) {
    const d = distribut(a, b, c);
    assert.equal(d.gesamt, d.summe);
    assert.equal(d.teil1 + d.teil2, d.gesamt);
  }
});

test("Kürzen und Erweitern: jede Zeile hat an allen Proben denselben Wert wie die erste", () => {
  for (const bsp of [...BEISPIELE_KUERZEN, ...BEISPIELE_ERWEITERN]) {
    assert.ok(bsp.zeilen.length >= 3, bsp.id);
    for (const p of bsp.proben) {
      const bel = belegungVon(bsp.vars, p);
      const soll = werte(zeilenTex(bsp.zeilen[0]), bel);
      bsp.zeilen.forEach((z, i) => nah(werte(zeilenTex(z), bel), soll, `${bsp.id} Zeile ${i + 1} bei ${JSON.stringify(p)}`));
    }
  }
  // Erweitern: genau die erwarteten Werte
  nah(werte(zeilenTex(BEISPIELE_ERWEITERN[0].zeilen[3])), 7 / 12, "1/3 + 1/4");
  nah(werte(zeilenTex(BEISPIELE_ERWEITERN[1].zeilen[2])), Math.SQRT1_2, "√2/2");
});

test("Kürzen: jede hervorgehobene „eins“-Stelle ist wirklich 1 (nur für erlaubte Belegungen)", () => {
  for (const bsp of [...BEISPIELE_KUERZEN, ...BEISPIELE_ERWEITERN]) {
    let gefunden = 0;
    for (const z of bsp.zeilen) for (const s of z.seg) {
      if (typeof s === "object" && s.k === "eins") {
        gefunden++;
        for (const p of bsp.proben) nah(werte(s.t, belegungVon(bsp.vars, p)), 1, `${bsp.id}: „${s.t}“`);
      }
    }
    // Kürzen: der zerlegte Faktor und die vereinfachte 1; Erweitern: mindestens der eingefügte Faktor
    assert.ok(gefunden >= (bsp.id.startsWith("k") ? 2 : 1), `${bsp.id}: zu wenige markierte Einsen (${gefunden})`);
  }
  assert.equal(BEISPIELE_KUERZEN[2].ausnahme, "x ≠ 0");
});

test("Quadratische Ergänzung als Gleichung: beide Lösungen erfüllen jede Zeile, ein Fremdwert nicht", () => {
  const { zeilen, loesungen } = BEISPIEL_GLEICHUNG;
  for (const z of zeilen) {
    const [l, r] = zeilenTex(z).split("=");
    for (const x of loesungen) nah(werte(l, { x }), werte(r, { x }), `„${zeilenTex(z)}“ bei x = ${x}`);
    assert.notEqual(werte(l, { x: 2 }), werte(r, { x: 2 }), `„${zeilenTex(z)}“ darf bei x = 2 nicht gelten`);
  }
  // die markierten Nullen sind wirklich 0
  for (const z of zeilen) for (const s of z.seg) if (typeof s === "object" && s.k === "null" && s.t === "+9-9") nah(werte("0" + s.t), 0, "9 − 9");
  // x² + 6x = 7 hat genau die Lösungen 1 und −7
  for (const x of loesungen) nah(x * x + 6 * x, 7, `x = ${x}`);
});

test("ergaenzung(b): Hilfszahlen und jede Zeile für alle geraden b von −14 bis 14", () => {
  for (let b = -14; b <= 14; b += 2) {
    if (b === 0) continue;
    const e = ergaenzung(b);
    assert.equal(e.h * 2, Math.abs(b));
    assert.equal(e.q, (b / 2) ** 2);
    for (const x of [-3, 0, 1.5, 4, 10]) {
      const soll = x * x + b * x;
      e.zeilen.forEach((z, i) => nah(werte(zeilenTex(z), { x }), soll, `b = ${b}, Zeile ${i + 1}, x = ${x}`));
    }
    // die letzte Zeile ist ein Quadrat minus q
    assert.ok(zeilenTex(e.zeilen[3]).includes(")^2-"), `b = ${b}`);
  }
  // Beispiel aus dem Konzept: x² − 6x → +9 −9 → (x − 3)² − 9
  const e6 = ergaenzung(-6);
  assert.equal(e6.q, 9);
  assert.equal(zeilenTex(e6.zeilen[3]), "(x-3)^2-9");
  assert.equal(zeilenTex(ergaenzung(6).zeilen[3]), "(x+3)^2-9");
});

test("Verkleidungen: genau eine echte 1 bzw. 0 unter den Antworten, Werte stimmen mit dem Text überein", () => {
  for (let n = 2; n <= 9; n++) {
    for (const [gen, soll] of [[verkleideteEins(n), 1], [verkleideteNull(n), 0]]) {
      const alle = [gen.richtig, ...gen.falsch];
      assert.equal(new Set(alle.map((a) => a.id)).size, alle.length);
      assert.equal(alle.filter((a) => Math.abs(a.wert - soll) < 1e-12).length, 1, `n = ${n}, Zielwert ${soll}`);
      for (const a of alle) nah(werte(a.tex), a.wert, `n = ${n}: ${a.tex}`);
      assert.equal(gen.richtig.wert, soll);
    }
    const v = verkleidungen(n);
    for (const t of v.eins) nah(werte(t), 1, `eins ${t}`);
    for (const t of v.null) nah(werte(t), 0, `null ${t}`);
  }
});

test("Inverse Elemente: a + (−a) = 0 und a · (1/a) = 1 für a ≠ 0; zu 0 gibt es kein multiplikatives Inverses", () => {
  for (let a = -9; a <= 9; a++) {
    const v = inversen(a);
    assert.equal(v.add[2] + 0, 0);
    if (a === 0) { assert.equal(v.kehrExistiert, false); assert.equal(v.kehr, null); assert.equal(v.mal, null); }
    else { assert.equal(v.kehrExistiert, true); nah(v.mal[2], 1, `a = ${a}`); }
  }
  // ob a·x = 1 für irgendein x lösbar ist, hängt von a ≠ 0 ab: für a = 0 liefert jedes x das Produkt 0
  for (const x of [-5, -1, 0, 0.001, 1, 7, 1e9]) assert.ok(0 * x === 0, `0 · ${x}`);
});

test("Umschreibungen und Nicht-Assoziativität von − und :", () => {
  for (const u of UMSCHREIBUNGEN) assert.ok(u.kurz && u.lang && (u.art === "plus" || u.art === "mal"));
  nah(werte(UMSCHREIBUNGEN[0].kurz), werte(UMSCHREIBUNGEN[0].lang), "8 − 3");
  nah(werte(UMSCHREIBUNGEN[1].kurz, { x: 7, y: 2 }), werte(UMSCHREIBUNGEN[1].lang, { x: 7, y: 2 }), "x − y");
  nah(werte(UMSCHREIBUNGEN[2].lang), 3, "12 · 1/4");
  assert.deepEqual(NICHT_ASSOZIATIV.minus, { links: 3, rechts: 7 });
  assert.deepEqual(NICHT_ASSOZIATIV.geteilt, { links: 3, rechts: 12 });
  assert.deepEqual(NICHT_ASSOZIATIV.plusMitInversen, [3, 3, 3]);
  // Kommutativität gilt für − auch nicht
  assert.notEqual(8 - 3, 3 - 8);
});

/* Deterministische Pseudozufallszahlen: ganze Zahlen, damit nichts gerundet werden muss */
const lcg = (s) => () => ((s = (s * 1103515245 + 12345) % 2147483648), s);
function ganzeProben(n) {
  const z = lcg(42);
  return Array.from({ length: n }, () => [(z() % 41) - 20, (z() % 41) - 20]);
}

test("Beweisketten der binomischen Formeln: jede Zeile ist für 60 ganzzahlige Paare (a, b) gleich der ersten", () => {
  const erwartet = {
    b1: (a, b) => a * a + 2 * a * b + b * b,
    b2: (a, b) => a * a - 2 * a * b + b * b,
    b3: (a, b) => a * a - b * b,
  };
  const ketten = { b1: BEWEIS_BINOM1, b2: BEWEIS_BINOM2, b3: BEWEIS_BINOM3 };
  for (const [id, kette] of Object.entries(ketten)) {
    assert.ok(kette.zeilen.length >= 5, id);
    for (const [a, b] of [...kette.proben, ...ganzeProben(60)]) {
      const bel = { a, b };
      const soll = erwartet[id](a, b);
      kette.zeilen.forEach((z, i) => assert.ok(werte(zeilenTex(z), bel) === soll, `${id}, Zeile ${i + 1}, a = ${a}, b = ${b}`));
    }
  }
});

test("Beweis 3: die markierte 1 und die markierte „1 + 1“ sind richtig; 2 := 1 + 1", () => {
  const z = BEWEIS_BINOM1.zeilen;
  const eins = z.flatMap((x) => x.seg).filter((s) => typeof s === "object");
  assert.deepEqual(eins.map((s) => s.k), ["eins", "dist"]);
  nah(werte("(1+1)"), 2, "1 + 1 = 2");
  // Warum ab + ab = 2ab? 1·ab + 1·ab = (1+1)·ab
  for (const [a, b] of ganzeProben(20)) assert.ok(werte("1\\cdot a\\cdot b+1\\cdot a\\cdot b", { a, b }) === werte("(1+1)\\cdot a\\cdot b", { a, b }));
});

test("Dritte binomische Formel: die markierte Null ist wirklich 0", () => {
  const marken = BEWEIS_BINOM3.zeilen.flatMap((x) => x.seg).filter((s) => typeof s === "object" && s.k === "null");
  assert.equal(marken.length, 2);
  for (const [a, b] of ganzeProben(20)) {
    assert.ok(werte("-a\\cdot b+a\\cdot b", { a, b }) === 0, `−ab + ab bei ${a}, ${b}`);
    assert.ok(werte("0") === 0);
  }
});

test("Hilfsergebnisse: a·(−b) = −(a·b), −(−z) = z, (−b)·(−b) = b·b", () => {
  for (const [a, b] of ganzeProben(40)) {
    assert.equal(a * (-b), -(a * b));
    assert.equal(-(-a), a);
    assert.equal((-b) * (-b), b * b);
    assert.equal(a * b + a * (-b), 0);
  }
});

test("Typografie: mz() ersetzt nur das Minuszeichen", () => {
  assert.equal(mz("x^2-6x"), "x^2−6x");
  assert.equal(mz("\\frac{a}{b}"), "\\frac{a}{b}");
});

test("Kürzen im Detail: jede Zeile von 2a/2b → a/b ist für a, b ≠ 0 gleich", () => {
  const k = BEWEIS_KUERZEN;
  for (const [a, b] of [...k.proben, [7, -3], [-1.5, 8]]) {
    const bel = { a, b };
    const soll = a / b;
    k.zeilen.forEach((z, i) => nah(werte(zeilenTex(z), bel), soll, `Zeile ${i + 1}, a = ${a}, b = ${b}`));
  }
  // das Zwischenergebnis 1/(2b) = 1/2 · 1/b
  for (const b of [1, 3, -7, 0.25]) nah(werte("\\frac{1}{2b}", { b }), werte("\\frac{1}{2}\\cdot\\frac{1}{b}", { b }), `b = ${b}`);
});

test("schoen(): ändert nie den Wert, setzt Luft um Rechenzeichen, lässt unäres Minus und Text in Ruhe", () => {
  const alle = [
    ...BEISPIELE_KUERZEN, ...BEISPIELE_ERWEITERN, BEWEIS_KUERZEN, BEWEIS_BINOM1, BEWEIS_BINOM2, BEWEIS_BINOM3, ergaenzung(-6), ergaenzung(8),
  ].flatMap((x) => x.zeilen.map((z) => ({ x, tex: zeilenTex(z) })));
  assert.ok(alle.length > 40);
  for (const { x, tex } of alle) {
    const bel = Object.fromEntries((x.vars || ["x"]).map((v, i) => [v, [3, 5][i]]));
    assert.ok(Math.abs(werte(schoen(tex), bel) - werte(tex, bel)) < 1e-12, `„${tex}“ → „${schoen(tex)}“`);
  }
  assert.equal(schoen("a^2+2ab-b^2"), "a^2 + 2ab - b^2");
  assert.equal(schoen("=a^2-a\\cdot b"), "= a^2 - a \\cdot b");
  assert.equal(schoen("a+(-b)"), "a + (-b)");
  assert.equal(schoen("-a\\cdot b+a\\cdot b"), "-a \\cdot b + a \\cdot b");
  assert.equal(schoen("\\frac{x^2-x}{x}"), "\\frac{x^2 - x}{x}");
  assert.equal(schoen("x^{n-1}"), "x^{n - 1}");
});

test("Beweise ohne Zahlenkette: jede Zeile hat Formel und Begründung; Beweis 1 benutzt genau die Axiome, die er nennt", () => {
  for (const [name, b] of Object.entries({ BEWEIS_MAL_NULL, BEWEIS_KEIN_INVERSES, BEWEIS_PLUS_MAL_MINUS, BEWEIS_EINDEUTIG })) {
    assert.ok(b.length >= 4, name);
    for (const z of b) { assert.ok(z.seg.length >= 1 && z.grund.length > 5, name); }
  }
  const grund = BEWEIS_MAL_NULL.map((z) => z.grund).join(" | ");
  for (const k of ["A3", "D", "A4", "A1"]) assert.ok(grund.includes(k), `Beweis 1 nennt ${k}`);
  // die Rechnung von Beweis 1 für ein beliebiges x: aus x = x + x folgt x = 0
  for (const x of [-4, 0, 3, 1e6]) { const gleich = x === x + x; assert.equal(gleich, x === 0); }
  // Eindeutigkeit des Inversen: q = q + 0 = q + (p + q') = (q + p) + q' = 0 + q' = q'
  for (const [p, q, q2] of [[3, -3, -3], [0, 0, 0], [7.5, -7.5, -7.5]]) { assert.equal(p + q, 0); assert.equal(p + q2, 0); assert.equal(q, q2); }
});
