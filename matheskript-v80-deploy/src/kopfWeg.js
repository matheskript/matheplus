/* ======================================================================
   KOPFWEG – Rechenwege für den Kopfrechenbereich (Modus „Rechnen“)
   Reine Logik ohne React, testbar mit Node (tests/kopfWeg.test.mjs).

   Jede Funktion liefert entweder
     { ok: true, ergebnis, schritte: [{ text, rechnung? }], … }
   oder
     { ok: false, hinweis }.

   Regel A5: Das Ergebnis steht immer vollständig vereinfacht da
   (gekürzte Brüche, Potenzschreibweise nur bei gleichen Faktoren,
   kein „· 1“, kein „+ 0“).

   Brüche stehen im Text als {Zähler|Nenner}; die Oberfläche setzt sie
   übereinander.
   ====================================================================== */

export const MAL = "·";
const STELLEN = ["Einer", "Zehner", "Hunderter", "Tausender", "Zehntausender", "Hunderttausender", "Millionen"];
const HOCH = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };

export const ggT = (a, b) => (b === 0 ? a : ggT(b, a % b));
export const kgV = (a, b) => (a / ggT(a, b)) * b;
const ganz = (x) => typeof x === "number" && Number.isInteger(x) && Number.isFinite(x);
const ziffern = (n) => String(n).split("").map(Number);
const ok = (ergebnis, schritte, extra = {}) => ({ ok: true, ergebnis, schritte, ...extra });
const nein = (hinweis) => ({ ok: false, hinweis });
const hochZahl = (e) => String(e).split("").map((d) => HOCH[d]).join("");
const istPrim = (n) => { if (n < 2) return false; for (let t = 2; t * t <= n; t++) if (n % t === 0) return false; return true; };
const primzahlenBis = (m) => { const l = []; for (let t = 2; t <= m; t++) if (istPrim(t)) l.push(t); return l; };

/* Faktoren als Produkt mit Potenzen: [2,2,3,7] → „2² · 3 · 7“ */
export function potenzForm(faktoren) {
  const z = new Map();
  faktoren.forEach((f) => z.set(f, (z.get(f) || 0) + 1));
  return [...z.entries()].map(([f, e]) => (e === 1 ? String(f) : `${f}${hochZahl(e)}`)).join(` ${MAL} `);
}

/* Bruch als Text: ganze Zahl, wenn der Nenner 1 ist */
const bruchText = (z, n) => (n === 1 ? String(z) : `{${z}|${n}}`);
const gemischt = (z, n) => (n > 1 && z > n && z % n !== 0 ? `${Math.floor(z / n)} {${z % n}|${n}}` : null);

/* ---------------------------------------------------------------- Plus und Minus */
export function wegPlusMinus(a, b, op) {
  if (![a, b].every(ganz) || a < 0 || b < 0) return nein("Gib zwei natürliche Zahlen ein.");
  if (a > 9999999 || b > 9999999) return nein("Bis sieben Stellen – darüber wird die Rechnung unübersichtlich.");
  if (op !== "+" && op !== "−") return nein("Wähle Plus oder Minus.");
  if (op === "−" && b > a) return nein("Beim Minus muss die erste Zahl mindestens so groß sein wie die zweite.");
  const breite = Math.max(String(a).length, String(b).length);
  const A = ziffern(String(a).padStart(breite, "0")), B = ziffern(String(b).padStart(breite, "0"));
  const aus = Array(breite).fill(0);
  const schritte = [{ text: `Schreibe die Zahlen untereinander: Einer unter Einer, Zehner unter Zehner. Dann rechnest du von rechts nach links, Spalte für Spalte.` }];
  let u = 0;
  for (let i = breite - 1; i >= 0; i--) {
    const name = STELLEN[breite - 1 - i];
    const x = A[i], y = B[i];
    if (op === "+") {
      const s = x + y + u;
      aus[i] = s % 10;
      const neu = s >= 10 ? 1 : 0;
      schritte.push({
        text: `${name}: ${u ? `${x} + ${y} + ${u}` : `${x} + ${y}`} = ${s}. Schreibe ${s % 10}${neu ? " und merke dir 1 als Übertrag" : ""}.`,
      });
      u = neu;
    } else {
      const sub = y + u;
      if (sub > x) {
        aus[i] = x + 10 - sub; u = 1;
        schritte.push({ text: `${name}: ${sub} plus wie viel gibt ${x}? Das geht nicht, also ergänzt du bis ${x + 10}: ${sub} + ${aus[i]} = ${x + 10}. Schreibe ${aus[i]} und merke dir 1 als Übertrag.` });
      } else {
        aus[i] = x - sub; u = 0;
        schritte.push({ text: `${name}: ${sub} plus wie viel gibt ${x}? ${sub} + ${aus[i]} = ${x}. Schreibe ${aus[i]}.` });
      }
    }
  }
  if (op === "+" && u) schritte.push({ text: `Übrig bleibt der Übertrag 1: Schreibe ihn ganz vorn hin.` });
  const ergebnis = op === "+" ? a + b : a - b;
  schritte.push({ text: `Probe mit der Umkehrung: ${op === "+" ? `${ergebnis} − ${b} = ${a}` : `${ergebnis} + ${b} = ${a}`}.`, rechnung: `${a} ${op} ${b} = ${ergebnis}` });
  return ok(String(ergebnis), schritte, { wert: ergebnis, rechnung: `${a} ${op} ${b} = ${ergebnis}` });
}

/* ---------------------------------------------------------------- Multiplizieren */
function kleinesEinmaleins(p, q) {
  /* p ≤ q ≤ 10, beide ≥ 1 */
  const w = p * q;
  if (p === 1) return [{ text: `Mal 1 ändert nichts: ${q} bleibt ${q}.`, rechnung: `1 ${MAL} ${q} = ${q}` }];
  const t = {
    2: [{ text: `Mal 2 heißt verdoppeln: ${p} + ${p} = ${w}.`, rechnung: `${p} ${MAL} 2 = ${w}` }],
    3: [{ text: `Mal 3 = mal 2 plus noch einmal die Zahl: ${p * 2} + ${p} = ${w}.`, rechnung: `${p} ${MAL} 3 = ${p} ${MAL} 2 + ${p} = ${w}` }],
    4: [{ text: `Mal 4 heißt zweimal verdoppeln: ${p} → ${p * 2} → ${w}.`, rechnung: `${p} ${MAL} 4 = ${w}` }],
    5: [{ text: `Mal 5 heißt mal 10 und dann halbieren: ${p * 10} : 2 = ${w}.`, rechnung: `${p} ${MAL} 5 = ${p * 10} : 2 = ${w}` }],
    6: [{ text: `Mal 6 = mal 5 plus noch einmal die Zahl: ${p * 5} + ${p} = ${w}.`, rechnung: `${p} ${MAL} 6 = ${p} ${MAL} 5 + ${p} = ${w}` }],
    7: [{ text: `Mal 7 = mal 5 plus mal 2: ${p * 5} + ${p * 2} = ${w}.`, rechnung: `${p} ${MAL} 7 = ${p} ${MAL} 5 + ${p} ${MAL} 2 = ${w}` }],
    8: [{ text: `Mal 8 = mal 10 minus mal 2: ${p * 10} − ${p * 2} = ${w}.`, rechnung: `${p} ${MAL} 8 = ${p} ${MAL} 10 − ${p} ${MAL} 2 = ${w}` }],
    9: [{ text: `Mal 9 = mal 10 minus die Zahl: ${p * 10} − ${p} = ${w}.`, rechnung: `${p} ${MAL} 9 = ${p} ${MAL} 10 − ${p} = ${w}` }],
    10: [{ text: `Mal 10: Hänge eine Null an.`, rechnung: `${p} ${MAL} 10 = ${w}` }],
  };
  return t[q];
}

/* A · d für eine einstellige Zahl d: nach den Stellen von A zerlegt */
function malEinstellig(A, d) {
  if (A <= 10 || d <= 1) return { teile: null, wert: A * d };
  const s = ziffern(A);
  const teile = s.map((z, i) => ({ stelle: z * 10 ** (s.length - 1 - i), wert: z * 10 ** (s.length - 1 - i) * d })).filter((t) => t.stelle > 0);
  return { teile, wert: A * d };
}

export function wegMultiplizieren(a, b) {
  if (![a, b].every(ganz) || a < 0 || b < 0) return nein("Gib zwei natürliche Zahlen ein.");
  if (a > 9999 || b > 9999) return nein("Bis vierstellig – darüber rechnest du besser schriftlich.");
  const w = a * b;
  const rechnung = `${a} ${MAL} ${b} = ${w}`;
  if (a === 0 || b === 0) return ok("0", [{ text: "Mal 0 ergibt immer 0.", rechnung }], { wert: 0, rechnung });
  const p = Math.min(a, b), q = Math.max(a, b);
  if (q <= 10) {
    const s = kleinesEinmaleins(p, q);
    return ok(String(w), [...s, { text: `Ergebnis: ${rechnung}.` }], { wert: w, rechnung });
  }
  /* mehrstellig: die kleinere Zahl nach Stellen zerlegen */
  const kleiner = p, grosser = q;
  const sk = ziffern(kleiner);
  const teile = sk.map((z, i) => ({ z, stelle: z * 10 ** (sk.length - 1 - i) })).filter((t) => t.stelle > 0);
  const schritte = [];
  if (teile.length === 1) {
    const t = teile[0];
    const nullen = String(t.stelle).length - 1;
    schritte.push({ text: `${kleiner} ist ${t.z} mit ${nullen} ${nullen === 1 ? "Null" : "Nullen"}. Rechne erst ${grosser} ${MAL} ${t.z}, dann hänge die ${nullen === 1 ? "Null" : "Nullen"} an.`,
      rechnung: `${grosser} ${MAL} ${t.z} = ${grosser * t.z}  →  ${rechnung}` });
    const m = malEinstellig(grosser, t.z);
    if (m.teile && m.teile.length > 1) schritte.splice(1, 0, { text: `${grosser} ${MAL} ${t.z} nach den Stellen von ${grosser}: ${m.teile.map((x) => `${x.stelle} ${MAL} ${t.z} = ${x.wert}`).join(", ")}. Zusammen ${m.teile.map((x) => x.wert).join(" + ")} = ${m.wert}.` });
    return ok(String(w), schritte, { wert: w, rechnung });
  }
  schritte.push({ text: `Zerlege ${kleiner} nach Stellen: ${kleiner} = ${teile.map((t) => t.stelle).join(" + ")}.` });
  const teilErg = [];
  teile.forEach((t) => {
    const nullen = String(t.stelle).length - 1;
    const prod = grosser * t.stelle;
    teilErg.push(prod);
    const m = malEinstellig(grosser, t.z);
    const wie = nullen > 0 ? `erst ${grosser} ${MAL} ${t.z} = ${grosser * t.z}, dann ${nullen} ${nullen === 1 ? "Null" : "Nullen"} anhängen` : (m.teile && m.teile.length > 1 ? `${m.teile.map((x) => `${x.stelle} ${MAL} ${t.z} = ${x.wert}`).join(", ")} → ${m.teile.map((x) => x.wert).join(" + ")} = ${m.wert}` : "direkt");
    schritte.push({ text: `Teilprodukt: ${grosser} ${MAL} ${t.stelle} (${wie}).`, rechnung: `${grosser} ${MAL} ${t.stelle} = ${prod}` });
  });
  let laufend = teilErg[0];
  for (let i = 1; i < teilErg.length; i++) {
    const neu = laufend + teilErg[i];
    schritte.push({ text: i === 1 ? `Addiere die Teilprodukte: ${laufend} + ${teilErg[i]} = ${neu}.` : `Weiter: ${laufend} + ${teilErg[i]} = ${neu}.` });
    laufend = neu;
  }
  schritte.push({ text: `Größe prüfen: ${grosser} ${MAL} ${kleiner} liegt etwa bei ${runden1(grosser)} ${MAL} ${runden1(kleiner)} = ${runden1(grosser) * runden1(kleiner)}.` });
  return ok(String(w), schritte, { wert: w, rechnung });
}
/* auf die erste Stelle gerundet (zum Abschätzen) */
function runden1(n) {
  if (n < 10) return n;
  const f = 10 ** (String(n).length - 1);
  return Math.round(n / f) * f;
}

/* ---------------------------------------------------------------- Primzahlen */
export function wegPrimzahl(n) {
  if (!ganz(n) || n < 0) return nein("Gib eine natürliche Zahl ein.");
  if (n > 10000) return nein("Bis 10 000 – darüber wird die Liste der Tests zu lang für den Kopf.");
  if (n < 2) return ok(`${n} ist keine Primzahl`, [{ text: `Eine Primzahl hat genau zwei Teiler: 1 und sich selbst. ${n} hat ${n === 0 ? "unendlich viele Teiler" : "nur einen Teiler"} – also ist ${n} keine Primzahl.` }], { prim: false });
  const g = Math.floor(Math.sqrt(n));
  const schritte = [];
  if (g < 2) {
    schritte.push({ text: `Es gibt keine Primzahl zwischen 2 und √${n} zu testen. ${n} ist durch nichts außer 1 und sich selbst teilbar: eine Primzahl.` });
    return ok(`${n} ist eine Primzahl`, schritte, { prim: true });
  }
  schritte.push({ text: `Du musst nur Primzahlen bis ${g} testen: ${g} ${MAL} ${g} = ${g * g}${g * g === n ? "" : `, aber ${g + 1} ${MAL} ${g + 1} = ${(g + 1) * (g + 1)} ist schon größer als ${n}`}. Ein Teiler über ${g} hätte einen Partner darunter, den du schon gefunden hättest.` });
  for (const p of primzahlenBis(g)) {
    let teilt, text;
    if (p === 2) { teilt = n % 2 === 0; text = `Test 2: ${n} endet auf ${n % 10}, ${teilt ? "also gerade → durch 2 teilbar" : "also ungerade → nicht durch 2 teilbar"}.`; }
    else if (p === 3) { const s = ziffern(n).reduce((x, y) => x + y, 0); teilt = n % 3 === 0; text = `Test 3: Quersumme ${ziffern(n).join(" + ")} = ${s}, ${teilt ? "durch 3 teilbar" : "nicht durch 3 teilbar"}.`; }
    else if (p === 5) { teilt = n % 5 === 0; text = `Test 5: ${n} endet auf ${n % 10}, ${teilt ? "also durch 5 teilbar" : "also nicht durch 5 teilbar"}.`; }
    else { teilt = n % p === 0; text = `Test ${p}: ${n} : ${p} = ${Math.floor(n / p)}${teilt ? "" : ` Rest ${n % p}`}${teilt ? " – geht auf." : " – geht nicht auf."}`; }
    schritte.push({ text });
    if (teilt) {
      schritte.push({ text: `${p} ist ein Teiler: ${n} = ${p} ${MAL} ${n / p}. Damit ist ${n} keine Primzahl.`, rechnung: `${n} = ${p} ${MAL} ${n / p}` });
      return ok(`${n} ist keine Primzahl`, schritte, { prim: false, teiler: p });
    }
  }
  schritte.push({ text: `Keine Primzahl bis ${g} teilt ${n}. Also ist ${n} eine Primzahl.` });
  return ok(`${n} ist eine Primzahl`, schritte, { prim: true });
}

/* ---------------------------------------------------------------- Primfaktoren */
export function wegPrimfaktoren(n) {
  if (!ganz(n) || n < 2) return nein("Gib eine Zahl ab 2 ein.");
  if (n > 999999) return nein("Bis 999 999.");
  let rest = n;
  const faktoren = [];
  const schritte = [];
  let q = 2;
  while (rest > 1) {
    const uebersprungen = [];
    while (q * q <= rest && rest % q !== 0) { if (istPrim(q)) uebersprungen.push(q); q += q === 2 ? 1 : 2; }
    if (q * q > rest) {
      /* der Rest ist selbst prim */
      if (faktoren.length === 0) {
        schritte.push({ text: `Keine Primzahl bis √${n} teilt ${n}. ${n} ist selbst eine Primzahl und lässt sich nicht weiter zerlegen.` });
        return ok(`${n} ist eine Primzahl`, schritte, { faktoren: [n], prim: true });
      }
      faktoren.push(rest);
      schritte.push({ text: `${rest} ist prim – das ist der letzte Faktor.`, rechnung: `${rest} : ${rest} = 1` });
      rest = 1;
    } else {
      faktoren.push(q);
      schritte.push({ text: `${uebersprungen.length ? `${uebersprungen.join(", ")} ${uebersprungen.length === 1 ? "geht" : "gehen"} nicht auf – ` : ""}kleinster Teiler von ${rest}: ${q}.`, rechnung: `${rest} : ${q} = ${rest / q}` });
      rest /= q;
    }
  }
  const produkt = faktoren.join(` ${MAL} `);
  const pot = potenzForm(faktoren);
  const ergebnis = pot === produkt ? `${n} = ${produkt}` : `${n} = ${produkt} = ${pot}`;
  schritte.push({ text: `Probe: Multipliziere alle Faktoren: ${produkt} = ${n}.` });
  return ok(ergebnis, schritte, { faktoren, prim: false });
}

/* ---------------------------------------------------------------- Quadrate, Kuben, Wurzeln */
export function wegQuadrat(n) {
  if (!ganz(n) || n < 1) return nein("Gib eine Zahl ab 1 ein.");
  if (n > 99) return nein("Bis 99 – größere Quadrate rechnest du besser schriftlich.");
  const w = n * n;
  const rechnung = `${n}² = ${w}`;
  const schritte = [];
  if (n <= 10) {
    schritte.push({ text: `Das gehört zum Einmaleins: ${n} ${MAL} ${n} = ${w}.`, rechnung });
  } else if (n % 10 === 0) {
    const a = n / 10;
    schritte.push({ text: `${n} = ${a} ${MAL} 10. Rechne ${a}² = ${a * a} und hänge zwei Nullen an.`, rechnung: `${a}² = ${a * a}  →  ${rechnung}` });
  } else if (n % 10 === 5) {
    const k = (n - 5) / 10;
    schritte.push({ text: `${n} endet auf 5. Rechne ${k} ${MAL} ${k + 1} = ${k * (k + 1)} und hänge 25 an.`, rechnung: `${k} ${MAL} ${k + 1} = ${k * (k + 1)}  →  ${rechnung}` });
  } else {
    const a = Math.floor(n / 10) * 10, b = n - a;
    if (b <= 5) {
      schritte.push({ text: `Zerlege ${n} = ${a} + ${b} und nutze (a + b)² = a² + 2ab + b².` });
      schritte.push({ text: `${a}² = ${a * a}, 2 ${MAL} ${a} ${MAL} ${b} = ${2 * a * b}, ${b}² = ${b * b}.`, rechnung: `${n}² = ${a * a} + ${2 * a * b} + ${b * b} = ${w}` });
    } else {
      const c = 10 - b, a2 = a + 10;
      schritte.push({ text: `${n} ist nah an ${a2}: ${n} = ${a2} − ${c}. Nutze (a − b)² = a² − 2ab + b².` });
      schritte.push({ text: `${a2}² = ${a2 * a2}, 2 ${MAL} ${a2} ${MAL} ${c} = ${2 * a2 * c}, ${c}² = ${c * c}.`, rechnung: `${n}² = ${a2 * a2} − ${2 * a2 * c} + ${c * c} = ${w}` });
    }
  }
  schritte.push({ text: `Ergebnis: ${rechnung}.` });
  return ok(String(w), schritte, { wert: w, rechnung });
}

export function wegKubik(n) {
  if (!ganz(n) || n < 1) return nein("Gib eine Zahl ab 1 ein.");
  if (n > 20) return nein("Bis 20.");
  const q = n * n, w = n * n * n;
  const rechnung = `${n}³ = ${w}`;
  if (n === 1) return ok("1", [{ text: "1 mal 1 mal 1 bleibt 1.", rechnung }], { wert: 1, rechnung });
  const schritte = [{ text: `Erst das Quadrat: ${n}² = ${q}.` }];
  const m = wegMultiplizieren(q, n);
  schritte.push({ text: `Dann noch einmal mal ${n}: ${q} ${MAL} ${n} = ${w}.`, rechnung: `${n}³ = ${q} ${MAL} ${n} = ${w}` });
  if (m.ok && m.schritte.length > 2 && q > 10) schritte.push({ text: `So rechnest du ${q} ${MAL} ${n}: ${m.schritte.slice(0, -1).map((s) => s.text).join(" ")}` });
  return ok(String(w), schritte, { wert: w, rechnung });
}

/* Wurzel aus einer Quadratzahl bis 10 000 in drei Schritten (Endziffer, Zehnerstelle, Mitte) */
const KANDIDAT = { 0: [0], 1: [1, 9], 4: [2, 8], 5: [5], 6: [4, 6], 9: [3, 7] };
export function wegWurzel(N) {
  if (!ganz(N) || N < 1) return nein("Gib eine Zahl ab 1 ein.");
  if (N > 10000) return nein("Bis 10 000.");
  const r = Math.round(Math.sqrt(N));
  if (r * r !== N) {
    const u = Math.floor(Math.sqrt(N));
    const ca = Math.round(Math.sqrt(N) * 10) / 10;
    return ok(`√${N} ≈ ${String(ca).replace(".", ",")}`, [
      { text: `${N} ist keine Quadratzahl: ${u}² = ${u * u} ist kleiner und ${u + 1}² = ${(u + 1) * (u + 1)} ist größer.` },
      { text: `Die Wurzel liegt also zwischen ${u} und ${u + 1}, ungefähr bei ${String(ca).replace(".", ",")}.` },
    ], { quadrat: false, wert: ca });
  }
  const schritte = [];
  if (N <= 100) {
    schritte.push({ text: `Frage: Welche Zahl mit sich selbst malgenommen ergibt ${N}? Das kennst du aus den Quadratzahlen: ${r} ${MAL} ${r} = ${N}.`, rechnung: `√${N} = ${r}` });
    return ok(String(r), schritte, { quadrat: true, wert: r });
  }
  const ende = N % 10, kand = KANDIDAT[ende];
  const vorne = Math.floor(N / 100);
  const z = Math.floor(Math.sqrt(vorne));
  if (kand.length === 1) {
    schritte.push({ text: `Endziffer ${ende}: Die Wurzel endet auf ${kand[0]} (${kand[0]}² = ${kand[0] * kand[0]}).` });
  } else {
    schritte.push({ text: `Endziffer ${ende}: Die Wurzel endet auf ${kand[0]} oder ${kand[1]} (${kand[0]}² = ${kand[0] * kand[0]}, ${kand[1]}² = ${kand[1] * kand[1]}).` });
  }
  schritte.push({ text: `Streiche die letzten zwei Ziffern: Es bleibt ${vorne}. Das liegt zwischen ${z * z} = ${z}² und ${(z + 1) * (z + 1)} = ${z + 1}². Die Wurzel beginnt also mit ${z}.` });
  if (kand.length === 2) {
    const mitte = 10 * z + 5;
    const kleiner = N < mitte * mitte;
    schritte.push({ text: `Zwei Kandidaten: ${10 * z + kand[0]} und ${10 * z + kand[1]}. Teste die Mitte ${mitte}: ${z} ${MAL} ${z + 1} = ${z * (z + 1)}, dann 25 anhängen, also ${mitte}² = ${mitte * mitte}. ${N} ist ${kleiner ? "kleiner" : "größer"}, also gilt der ${kleiner ? "kleinere" : "größere"} Kandidat.` });
  } else {
    schritte.push({ text: `Es bleibt nur ein Kandidat: ${r}. Ein Mitte-Test ist nicht nötig.` });
  }
  schritte.push({ text: `Probe: ${r}² = ${N}.`, rechnung: `√${N} = ${r}` });
  return ok(String(r), schritte, { quadrat: true, wert: r });
}

/* ---------------------------------------------------------------- Schriftlich Teilen */
export function wegDivision(a, b) {
  if (![a, b].every(ganz) || a < 0 || b < 1) return nein("Gib eine natürliche Zahl und einen Teiler ab 1 ein.");
  if (a > 999999 || b > 999) return nein("Bis sechsstellig geteilt durch dreistellig.");
  const q = Math.floor(a / b), r = a % b;
  const ergebnis = r ? `${a} : ${b} = ${q} Rest ${r}` : `${a} : ${b} = ${q}`;
  if (a === 0) return ok(`0 : ${b} = 0`, [{ text: `Null geteilt durch ${b} ist 0.` }], { quotient: 0, rest: 0, rechnung: `0 : ${b} = 0` });
  if (a < b) return ok(ergebnis, [{ text: `${a} ist kleiner als ${b}: Der Teiler passt kein einziges Mal hinein. Ergebnis: 0 Rest ${a}.` }], { quotient: 0, rest: a, rechnung: ergebnis });
  const D = ziffern(a);
  const schritte = [];
  let cur = 0, idx = 0, gestartet = false;
  while (idx < D.length) {
    cur = cur * 10 + D[idx];
    if (!gestartet) {
      if (cur < b && idx < D.length - 1) { idx++; continue; }
      gestartet = true;
      const gen = D.slice(0, idx + 1).join("");
      schritte.push({ text: idx === 0 ? `Beginne links: ${gen} ist mindestens so groß wie ${b}.` : `Nimm so viele Ziffern von links, bis die Zahl mindestens so groß ist wie ${b}: ${gen}.` });
    } else {
      schritte.push({ text: `Hole die nächste Ziffer herunter: ${D[idx]}. Du hast jetzt ${cur}.` });
    }
    const qd = Math.floor(cur / b), prod = qd * b, neu = cur - prod;
    if (qd === 0) {
      schritte.push({ text: `${b} passt in ${cur} kein Mal: schreibe 0 ins Ergebnis. Der Rest bleibt ${cur}.` });
    } else {
      schritte.push({ text: `Wie oft passt ${b} in ${cur}? ${qd}-mal. Schreibe ${qd} ins Ergebnis, rechne ${qd} ${MAL} ${b} = ${prod} und ziehe ab.`, rechnung: `${cur} − ${prod} = ${neu}` });
    }
    cur = neu;
    idx++;
  }
  schritte.push({ text: r ? `Die Ziffern sind aufgebraucht. Es bleibt Rest ${r}.` : `Die Ziffern sind aufgebraucht und es bleibt kein Rest: Die Aufgabe geht auf.` });
  schritte.push({ text: `Probe: ${q} ${MAL} ${b}${r ? ` + ${r}` : ""} = ${a}.`, rechnung: ergebnis });
  return ok(ergebnis, schritte, { quotient: q, rest: r, rechnung: ergebnis });
}

/* ---------------------------------------------------------------- Brüche */
export function wegBruch(art, z1, n1, z2 = 1, n2 = 1) {
  const alle = art === "kuerzen" ? [z1, n1] : [z1, n1, z2, n2];
  if (!alle.every(ganz) || alle.some((x) => x < 0)) return nein("Gib ganze Zahlen ein.");
  if (alle.some((x) => x > 999)) return nein("Bis 999.");
  if (n1 < 1 || (art !== "kuerzen" && n2 < 1)) return nein("Der Nenner darf nicht 0 sein.");
  const schritte = [];

  /* Ergebnis zusammenfassen: kürzen, ganze Zahl, gemischte Zahl */
  const abschluss = (z, n, schon = false) => {
    const g = ggT(z, n) || 1;
    if (g > 1 && z > 0) {
      schritte.push({ text: `Kürze vollständig: ggT von ${z} und ${n} ist ${g}. Teile Zähler und Nenner durch ${g}.`, rechnung: `${bruchText(z, n)} = ${bruchText(z / g, n / g)}` });
      z /= g; n /= g;
    } else if (!schon && z > 0) {
      schritte.push({ text: `Prüfe das Kürzen: Zähler und Nenner haben keinen gemeinsamen Teiler außer 1. Das Ergebnis ist vollständig gekürzt.` });
    }
    if (z === 0) { n = 1; }
    const gm = gemischt(z, n);
    if (gm) schritte.push({ text: `Als gemischte Zahl: ${gm}.` });
    return { z, n, text: z === 0 ? "0" : bruchText(z, n), gemischt: gm };
  };

  if (art === "kuerzen") {
    if (z1 === 0) return ok("0", [{ text: `Null geteilt durch ${n1} ist 0.` }], { z: 0, n: 1 });
    const g = ggT(z1, n1);
    if (g === 1) schritte.push({ text: `Zähler ${z1} und Nenner ${n1} haben keinen gemeinsamen Teiler außer 1. Der Bruch ist schon vollständig gekürzt.` });
    const r = abschluss(z1, n1, true);
    return ok(r.text, schritte, { z: r.z, n: r.n, gemischt: r.gemischt });
  }

  if (art === "plus" || art === "minus") {
    const op = art === "plus" ? "+" : "−";
    let a = z1, b = z2, H = n1;
    if (n1 === n2) {
      schritte.push({ text: `Beide Brüche haben denselben Nenner ${n1}. Du rechnest nur mit den Zählern.` });
    } else {
      H = kgV(n1, n2);
      const f1 = H / n1, f2 = H / n2;
      schritte.push({ text: `Die Nenner sind verschieden. Der Hauptnenner ist das kleinste gemeinsame Vielfache von ${n1} und ${n2}: ${H}.` });
      a = z1 * f1; b = z2 * f2;
      schritte.push({ text: `Erweitere: ${n1} ${MAL} ${f1} = ${H} und ${n2} ${MAL} ${f2} = ${H}. Den Zähler multiplizierst du mit demselben Faktor.`, rechnung: `${bruchText(z1, n1)} ${op} ${bruchText(z2, n2)} = ${bruchText(a, H)} ${op} ${bruchText(b, H)}` });
    }
    if (art === "minus" && b > a) return nein("Das Ergebnis wäre negativ – tausche die beiden Brüche.");
    const z = art === "plus" ? a + b : a - b;
    schritte.push({ text: `${art === "plus" ? "Addiere" : "Subtrahiere"} die Zähler, der Nenner bleibt ${H}: ${a} ${op} ${b} = ${z}.`, rechnung: `${bruchText(a, H)} ${op} ${bruchText(b, H)} = ${bruchText(z, H)}` });
    const r = abschluss(z, H);
    return ok(r.text, schritte, { z: r.z, n: r.n, gemischt: r.gemischt });
  }

  if (art === "mal" || art === "geteilt") {
    let zz2 = z2, nn2 = n2;
    if (art === "geteilt") {
      if (z2 === 0) return nein("Durch 0 kannst du nicht teilen.");
      schritte.push({ text: `Teilen durch einen Bruch heißt: mal den Kehrwert. Vertausche Zähler und Nenner des zweiten Bruchs.`, rechnung: `${bruchText(z1, n1)} : ${bruchText(z2, n2)} = ${bruchText(z1, n1)} ${MAL} ${bruchText(n2, z2)}` });
      zz2 = n2; nn2 = z2;
    }
    if (z1 === 0) return ok("0", [...schritte, { text: `Null mal etwas ist 0.` }], { z: 0, n: 1 });
    let a = z1, b = zz2, c = n1, d = nn2;
    const g1 = ggT(a, d), g2 = ggT(b, c);
    if (g1 > 1 || g2 > 1) {
      const teile = [];
      if (g1 > 1) { teile.push(`${a} und ${d} durch ${g1}`); a /= g1; d /= g1; }
      if (g2 > 1) { teile.push(`${b} und ${c} durch ${g2}`); b /= g2; c /= g2; }
      schritte.push({ text: `Kürze vor dem Multiplizieren über Kreuz: ${teile.join(" und ")}. Das macht die Zahlen klein.`, rechnung: `${bruchText(a, c)} ${MAL} ${bruchText(b, d)}` });
    } else {
      schritte.push({ text: `Prüfe zuerst, ob du über Kreuz kürzen kannst: Hier geht es nicht.` });
    }
    const z = a * b, n = c * d;
    schritte.push({ text: `Multipliziere Zähler mit Zähler und Nenner mit Nenner: ${a} ${MAL} ${b} = ${z} und ${c} ${MAL} ${d} = ${n}.`, rechnung: `${bruchText(a, c)} ${MAL} ${bruchText(b, d)} = ${bruchText(z, n)}` });
    const r = abschluss(z, n, true);
    return ok(r.text, schritte, { z: r.z, n: r.n, gemischt: r.gemischt });
  }
  return nein("Wähle eine Rechenart.");
}

/* ---------------------------------------------------------------- Themen für die Eingabemaske */
const zuf = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (l) => l[zuf(0, l.length - 1)];

/* felder: { id, label, art: "zahl" | "wahl", max (Stellen), optionen, zeige(werte) } */
export const RECHNEN_THEMEN = {
  plusminus: {
    titel: "Plus und Minus", text: "Gib zwei Zahlen ein. Die App rechnet Spalte für Spalte vor.",
    felder: [
      { id: "a", label: "1. Zahl", art: "zahl", stellen: 7, start: 478 },
      { id: "op", label: "Rechenart", art: "wahl", optionen: [["+", "Plus"], ["−", "Minus"]], start: "+" },
      { id: "b", label: "2. Zahl", art: "zahl", stellen: 7, start: 256 },
    ],
    rechne: (v) => wegPlusMinus(v.a, v.b, v.op),
    zufall: (v) => { const a = zuf(100, 9999), b = zuf(10, 9999); return v.op === "−" ? { a: Math.max(a, b), b: Math.min(a, b) } : { a, b }; },
  },
  multiplizieren: {
    titel: "Multiplizieren", text: "Gib zwei Zahlen bis vierstellig ein. Die App zerlegt und rechnet vor.",
    felder: [
      { id: "a", label: "1. Zahl", art: "zahl", stellen: 4, start: 23 },
      { id: "b", label: "2. Zahl", art: "zahl", stellen: 4, start: 14 },
    ],
    rechne: (v) => wegMultiplizieren(v.a, v.b),
    zufall: () => (Math.random() < 0.4 ? { a: zuf(3, 9), b: zuf(6, 9) } : { a: zuf(12, 99), b: zuf(11, 99) }),
  },
  primzahlen: {
    titel: "Primzahlen", text: "Gib eine Zahl bis 10 000 ein. Die App testet Schritt für Schritt, ob sie prim ist.",
    felder: [{ id: "n", label: "Zahl", art: "zahl", stellen: 5, start: 97 }],
    rechne: (v) => wegPrimzahl(v.n),
    zufall: () => ({ n: Math.random() < 0.5 ? pick(primzahlenBis(500).filter((p) => p > 20)) : zuf(30, 999) }),
  },
  primfaktoren: {
    titel: "Primfaktoren", text: "Gib eine Zahl bis 999 999 ein. Die App spaltet Primfaktor für Primfaktor ab.",
    felder: [{ id: "n", label: "Zahl", art: "zahl", stellen: 6, start: 84 }],
    rechne: (v) => wegPrimfaktoren(v.n),
    zufall: () => ({ n: zuf(20, 999) }),
  },
  potenzen: {
    titel: "Quadrate und Wurzeln", text: "Wähle Quadrat, Kubik oder Wurzel und gib die Zahl ein.",
    felder: [
      { id: "art", label: "Aufgabe", art: "wahl", optionen: [["quadrat", "Quadrat"], ["kubik", "Kubik"], ["wurzel", "Wurzel"]], start: "quadrat" },
      { id: "n", label: "Zahl", art: "zahl", stellen: 5, start: 23 },
    ],
    rechne: (v) => (v.art === "wurzel" ? wegWurzel(v.n) : v.art === "kubik" ? wegKubik(v.n) : wegQuadrat(v.n)),
    zufall: (v) => (v.art === "wurzel" ? { n: zuf(11, 99) ** 2 } : v.art === "kubik" ? { n: zuf(3, 15) } : { n: zuf(11, 49) }),
  },
  division: {
    titel: "Schriftlich Teilen", text: "Gib die Zahl und den Teiler ein. Die App teilt Ziffer für Ziffer.",
    felder: [
      { id: "a", label: "Zahl", art: "zahl", stellen: 6, start: 756 },
      { id: "b", label: "Teiler", art: "zahl", stellen: 3, start: 4 },
    ],
    rechne: (v) => wegDivision(v.a, v.b),
    zufall: () => { const b = zuf(3, 29); return { a: b * zuf(20, 400) + (Math.random() < 0.5 ? 0 : zuf(1, b - 1)), b }; },
  },
  bruchrechnen: {
    titel: "Bruchrechnung", text: "Wähle die Rechenart und gib die Brüche ein.",
    felder: [
      { id: "art", label: "Aufgabe", art: "wahl", optionen: [["kuerzen", "Kürzen"], ["plus", "+"], ["minus", "−"], ["mal", "·"], ["geteilt", ":"]], start: "plus" },
      { id: "z1", label: "Zähler 1", art: "zahl", stellen: 3, start: 1 },
      { id: "n1", label: "Nenner 1", art: "zahl", stellen: 3, start: 2 },
      { id: "z2", label: "Zähler 2", art: "zahl", stellen: 3, start: 1, zeige: (v) => v.art !== "kuerzen" },
      { id: "n2", label: "Nenner 2", art: "zahl", stellen: 3, start: 3, zeige: (v) => v.art !== "kuerzen" },
    ],
    rechne: (v) => wegBruch(v.art, v.z1, v.n1, v.z2, v.n2),
    zufall: (v) => {
      if (v.art === "kuerzen") { const g = zuf(2, 9), n = zuf(2, 9), z = zuf(1, n - 1 || 1); return { z1: z * g, n1: n * g }; }
      const n1 = pick([2, 3, 4, 5, 6, 8]), n2 = pick([2, 3, 4, 5, 6, 8]);
      let a = { z: zuf(1, n1), n: n1 }, b = { z: zuf(1, n2), n: n2 };
      if (v.art === "minus" && a.z * b.n < b.z * a.n) [a, b] = [b, a];
      return { z1: a.z, n1: a.n, z2: b.z, n2: b.n };
    },
  },
};
