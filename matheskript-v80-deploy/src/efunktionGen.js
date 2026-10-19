/* ---------- Themenseite „Die natürliche Exponentialfunktion“: Aufgabengenerator ----------
   Reines JS (ohne React), damit die Mathematik in tests/efunktion.test.mjs geprüft werden kann.
   Jede Aufgabe liefert TeX für die Anzeige, die Funktion f, die Lösung als Funktion (abl / tangente)
   und den vollständigen Rechenweg als Formelzeilen. Schreibweise nach Regel A5:
   x statt 1x, kein ^1, kein +0, kein 1·e^x. */

const zz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const zzOhne0 = (a, b) => { let v = 0; while (v === 0) v = zz(a, b); return v; };
const wahl = (liste) => liste[Math.floor(Math.random() * liste.length)];

/* Summanden zu einem Term verbinden: ["2e^{x}", "-3x", "5"] → "2e^{x} - 3x + 5" */
export function summe(teile) {
  const t = teile.filter((s) => s && s !== "0");
  if (!t.length) return "0";
  return t.map((s, i) => (i === 0 ? s : s.startsWith("-") ? ` - ${s.slice(1)}` : ` + ${s}`)).join("");
}

/* k·x^n als TeX (n = 0, 1, 2), mit Vorzeichen vorn */
export function glied(k, n) {
  if (k === 0) return "0";
  if (n === 0) return String(k);
  const b = Math.abs(k), v = k < 0 ? "-" : "";
  return `${v}${b === 1 ? "" : b}${n === 1 ? "x" : `x^{${n}}`}`;
}

/* m·x + k als TeX: "x", "-x", "2x+1", "-3x-2", "4" */
export function linear(m, k) {
  return summe([glied(m, 1), glied(k, 0)]);
}

/* a·e^{(m·x + k)} als TeX */
export function eGlied(a, m = 1, k = 0) {
  if (a === 0) return "0";
  const ex = `e^{${linear(m, k)}}`;
  return a === 1 ? ex : a === -1 ? `-${ex}` : `${a}${ex}`;
}

/* Faktor vor einer Klammer bzw. einem Term: 1 → "", −1 → "-", sonst die Zahl */
/* e^k als TeX, mit e^1 = e */
const eHoch = (k) => (k === 1 ? "e" : `e^{${k}}`);
const vorFaktor = (a) => (a === 1 ? "" : a === -1 ? "-" : String(a));
const kl = (t) => (t.startsWith("-") ? `(${t})` : t);
const zweiGlieder = (t) => /[+-]/.test(t.slice(1));

/* Gleichungskette ohne doppelte Glieder: ["f(0)", "3", "3"] → "f(0) = 3" */
export function kette(teile) {
  const t = teile.filter((x, i) => i === 0 || x !== teile[i - 1]);
  return t.join(" = ");
}

/* ---------- Modus 1: Ableiten ---------- */

export function ableitAufgabe(stufe) {
  if (stufe <= 1) {
    const a = zzOhne0(-9, 9), c = zz(-9, 9);
    return {
      tex: summe([eGlied(a), glied(c, 0)]),
      f: (x) => a * Math.exp(x) + c,
      abl: (x) => a * Math.exp(x),
      ablTex: eGlied(a),
      weg: [
        `(${eGlied(a)})′ = ${a === 1 ? "" : `${kl(String(a))} \\cdot `}(e^{x})′ = ${eGlied(a)} \\quad (Faktorregel)`,
        ...(c !== 0 ? [`(${c})′ = 0 \\quad (Konstante)`] : []),
        `f′(x) = ${eGlied(a)}`,
      ],
      tipp: "Der Faktor vor eˣ bleibt stehen, eˣ abgeleitet ist wieder eˣ. Eine Konstante fällt weg.",
    };
  }
  if (stufe === 2) {
    const a = zzOhne0(-6, 6), p = zzOhne0(-5, 5), q = zz(-9, 9), r = zz(-9, 9);
    const ablTex = summe([eGlied(a), glied(2 * p, 1), glied(q, 0)]);
    return {
      tex: summe([eGlied(a), glied(p, 2), glied(q, 1), glied(r, 0)]),
      f: (x) => a * Math.exp(x) + p * x * x + q * x + r,
      abl: (x) => a * Math.exp(x) + 2 * p * x + q,
      ablTex,
      weg: [
        `(${eGlied(a)})′ = ${eGlied(a)}`,
        `(${glied(p, 2)})′ = ${p} \\cdot 2x = ${glied(2 * p, 1)}`,
        ...(q !== 0 ? [`(${glied(q, 1)})′ = ${q}`] : []),
        ...(r !== 0 ? [`(${r})′ = 0`] : []),
        `f′(x) = ${ablTex} \\quad (Summenregel)`,
      ],
      tipp: "Summenregel: jedes Glied einzeln ableiten. eˣ bleibt eˣ, bei x² hilft die Potenzregel.",
    };
  }
  if (stufe === 3) {
    const a = zzOhne0(-5, 5), k = zzOhne0(-4, 4), q = zzOhne0(-9, 9);
    const ablTex = summe([eGlied(a, 1, k), glied(q, 0)]);
    return {
      tex: summe([eGlied(a, 1, k), glied(q, 1)]),
      f: (x) => a * Math.exp(x + k) + q * x,
      abl: (x) => a * Math.exp(x + k) + q,
      ablTex,
      weg: [
        `e^{${linear(1, k)}} = ${eHoch(k)} \\cdot e^{x} \\quad (Potenzgesetz)`,
        `(${eGlied(a, 1, k)})′ = ${vorFaktor(a)}${eHoch(k)} \\cdot (e^{x})′ = ${vorFaktor(a)}${eHoch(k)} \\cdot e^{x} = ${eGlied(a, 1, k)}`,
        `(${glied(q, 1)})′ = ${q}`,
        `f′(x) = ${ablTex}`,
      ],
      tipp: "Schreib e^(x+k) als e^k · eˣ. e^k ist nur ein konstanter Faktor – der Term ändert sich beim Ableiten also nicht.",
    };
  }
  if (stufe === 4) {
    const a = zzOhne0(-4, 4), m = wahl([-3, -2, -1, 2, 3, 4]), k = zz(-3, 3), r = zz(-6, 6);
    const ablTex = eGlied(a * m, m, k);
    return {
      tex: summe([eGlied(a, m, k), glied(r, 0)]),
      f: (x) => a * Math.exp(m * x + k) + r,
      abl: (x) => a * m * Math.exp(m * x + k),
      ablTex,
      weg: [
        `\\text{innere Funktion } v(x) = ${linear(m, k)}, \\quad v′(x) = ${m}`,
        `(${eGlied(a, m, k)})′ = ${a} \\cdot e^{${linear(m, k)}} \\cdot ${kl(String(m))} \\quad (Kettenregel)`,
        `f′(x) = ${ablTex}`,
      ],
      tipp: "Kettenregel: äußere Ableitung (die e-Funktion bleibt stehen) mal innere Ableitung (der Faktor vor x im Exponenten).",
    };
  }
  /* Stufe 5: (p·x + q)·e^x mit der Produktregel */
  const p = zzOhne0(-4, 4), q = zzOhne0(-6, 6);
  const u = linear(p, q), uKl = zweiGlieder(u) ? `(${u})` : u;
  const ergLin = linear(p, p + q);
  const ablTex = p + q === 0 ? `${vorFaktor(p)}xe^{x}` : `(${ergLin})e^{x}`;
  return {
    tex: `${uKl}e^{x}`,
    f: (x) => (p * x + q) * Math.exp(x),
    abl: (x) => (p * x + p + q) * Math.exp(x),
    ablTex,
    weg: [
      `u = ${u}, \\quad u′ = ${p}; \\quad v = e^{x}, \\quad v′ = e^{x}`,
      `f′(x) = u′ \\cdot v + u \\cdot v′ = ${p} \\cdot e^{x} + ${uKl} \\cdot e^{x}`,
      kette(["", `(${summe([String(p), glied(p, 1), glied(q, 0)])})e^{x}`, ablTex]),
    ],
    tipp: "Produktregel (u·v)′ = u′·v + u·v′ mit u = Klammer und v = eˣ. Danach eˣ ausklammern.",
  };
}

/* ---------- Modus 2: Asymptote, Wertemenge, Monotonie ---------- */

export function asymptoteAufgabe(stufe) {
  const s = stufe >= 2 ? wahl([1, -1]) : 1;
  const a = stufe >= 3 ? zzOhne0(-4, 4) : wahl([1, -1]);
  const k = stufe >= 4 ? zzOhne0(-3, 3) : 0;
  const d = stufe >= 5 ? zz(-9, 9) : zzOhne0(-6, 6);
  const tex = summe([eGlied(a, s, k), glied(d, 0)]);
  const nachMinus = s === 1;                     // e^{±x+k} → 0 für x → −∞ bzw. +∞
  const oben = a > 0;                             // Graph liegt oberhalb der Asymptote
  const steigend = a * s > 0;
  const W = oben ? `]${d}; +\\infty[` : `]-\\infty; ${d}[`;
  return {
    tex, a, s, k, d,
    f: (x) => a * Math.exp(s * x + k) + d,
    richtig: { y: d, richtung: nachMinus ? 0 : 1, wert: oben ? 0 : 1, mono: steigend ? 0 : 1 },
    weg: [
      linear(s, k) === "x"
        ? `x \\to -\\infty: \\quad e^{x} \\to 0`
        : `x \\to ${nachMinus ? "-" : "+"}\\infty: \\quad ${linear(s, k)} \\to -\\infty, \\quad e^{${linear(s, k)}} \\to 0`,
      `\\Rightarrow \\quad f(x) \\to ${d} \\quad \\text{Asymptote } y = ${d}`,
      `x \\to ${nachMinus ? "+" : "-"}\\infty: \\quad f(x) \\to ${oben ? "+" : "-"}\\infty`,
      `${eGlied(a, s, k)} ${oben ? ">" : "<"} 0 \\quad \\Rightarrow \\quad W_f = ${W}`,
      `f′(x) = ${eGlied(a * s, s, k)} ${steigend ? ">" : "<"} 0 \\quad \\Rightarrow \\quad \\text{streng monoton ${steigend ? "steigend" : "fallend"}}`,
    ],
  };
}

/* ---------- Modus 3: Tangente im Schnittpunkt mit der y-Achse ---------- */

export function tangentenAufgabe(stufe) {
  if (stufe >= 5) {
    const p = zzOhne0(-4, 4), q = zzOhne0(-5, 5);
    const u = linear(p, q), uKl = zweiGlieder(u) ? `(${u})` : u;
    const m = p + q, t = q;
    return {
      tex: `${uKl}e^{x}`,
      f: (x) => (p * x + q) * Math.exp(x),
      tangente: (x) => m * x + t, m, t,
      weg: [
        `f(0) = ${q} \\cdot e^{0} = ${q} \\quad \\Rightarrow \\quad S_y(0 \\mid ${q})`,
        `f′(x) = ${p} \\cdot e^{x} + ${uKl} \\cdot e^{x} = ${p + q === 0 ? `${vorFaktor(p)}xe^{x}` : `(${linear(p, p + q)})e^{x}`}`,
        `f′(0) = ${m}`,
        `t: \\; y = ${linear(m, t)}`,
      ],
    };
  }
  const a = zzOhne0(-5, 5);
  const m = stufe >= 4 ? wahl([-3, -2, -1, 2, 3]) : stufe >= 3 ? wahl([1, -1]) : 1;
  const b = stufe >= 2 ? zzOhne0(-6, 6) : 0;
  const d = zz(-6, 6);
  const tex = summe([eGlied(a, m), glied(b, 1), glied(d, 0)]);
  const t = a + d, mt = a * m + b;
  const ablTex = summe([eGlied(a * m, m), glied(b, 0)]);
  return {
    tex,
    f: (x) => a * Math.exp(m * x) + b * x + d,
    tangente: (x) => mt * x + t, m: mt, t,
    weg: [
      kette(["f(0)", summe([`${vorFaktor(a)}e^{0}`, glied(d, 0)]), summe([String(a), glied(d, 0)]), String(t)]),
      `f′(x) = ${ablTex}`,
      kette(["f′(0)", summe([eGlied(a * m, m).replace("e^{" + linear(m, 0) + "}", "e^{0}"), glied(b, 0)]), summe([String(a * m), glied(b, 0)]), String(mt)]),
      `t: \\; y = f′(0) \\cdot x + f(0) = ${linear(mt, t)}`,
    ],
  };
}
