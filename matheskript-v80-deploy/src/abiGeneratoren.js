/* ============================================================
   ABI-GENERATOREN – Aufgaben im Format des schriftlichen Abiturs, Teil A
   (ohne Hilfsmittel). Reine Mathematik, kein React – testbar mit Node.

   Jeder Aufgabentyp liefert eine 5-BE-Aufgabe wie im Leistungsfach BW
   (Pflichtaufgaben P1–P4, Wahlaufgaben W1–W6) und dazu:
     teile       a), b) … mit BE und Operator
     erwartung   der Erwartungshorizont: je Schritt ein Satz und seine BE –
                 danach korrigiert der Schüler selbst oder Mia (KI)
     kurz        die Ergebnisse in einer Zeile je Teilaufgabe
     kontrolle   die Zahlen hinter der Aufgabe (nur für Tests)

   Bauplan je Typ: Rechenkern mit Parametern, die ohne Rechner glatt aufgehen,
   Prüfungshülle (Text, Operator, BE) und Erwartungshorizont.
   Regel A5: Keine Zeile endet unvereinfacht; kein 1x, kein + 0, kein · 1,
   Ableitungen ausgeklammert. Formeln stehen in $…$ (Text-Komponente).
   Keine Originalaufgaben – nur das Format.
   ============================================================ */

/* ---------- Zufall mit festem Start (Seed → immer dieselbe Aufgabe) ---------- */
export function zufall(seed) {
  let s = (Number(seed) >>> 0) || 1;
  return () => {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const wahl = (z, liste) => liste[Math.floor(z() * liste.length)];
const ganzVon = (z, a, b) => a + Math.floor(z() * (b - a + 1));

/* ---------- Schreibweise ---------- */
const MINUS = "−";
export const zahl = (v) => (v < 0 ? MINUS + Math.abs(v) : String(v));
const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
/* Dezimalzahl mit Komma, höchstens vier Stellen, ohne Nullen am Ende */
export const dez = (v) => {
  const r = Math.round(v * 10000) / 10000;
  const s = String(Math.abs(r)).replace(".", ",");
  return (r < 0 ? MINUS : "") + s;
};
/* Bruch gekürzt als TeX, ganze Zahlen ohne Bruch */
export function bruch(z, n) {
  if (n < 0) { z = -z; n = -n; }
  const g = ggT(z, n) || 1;
  z /= g; n /= g;
  if (n === 1) return zahl(z);
  return `${z < 0 ? MINUS : ""}\\frac{${Math.abs(z)}}{${n}}`;
}
/* Summe aus Gliedern { c, v } (v = "" für Zahlen): Vorzeichen richtig, Nullen weg, kein 1x */
export function summe(glieder) {
  let s = "";
  for (const { c, v } of glieder) {
    if (!c) continue;
    const abs = Math.abs(c);
    const teil = v ? (abs === 1 ? v : `${abs}${v}`) : String(abs);
    if (!s) s = (c < 0 ? MINUS : "") + teil;
    else s += (c < 0 ? ` ${MINUS} ` : " + ") + teil;
  }
  return s || "0";
}
/* Zahlen als Summe (z. B. 8 − 4 + 6) */
const zahlSumme = (werte) => summe(werte.map((c) => ({ c, v: "" })));
const ebene = (n) => summe([{ c: n[0], v: "x_1" }, { c: n[1], v: "x_2" }, { c: n[2], v: "x_3" }]);
const spalte = (v) => `\\spalte{${zahl(v[0])}}{${zahl(v[1])}}{${zahl(v[2])}}`;
const punkt = (name, v) => `${name}(${zahl(v[0])} \\mid ${zahl(v[1])} \\mid ${zahl(v[2])})`;
const skalar = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const plus = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mal = (k, a) => [k * a[0], k * a[1], k * a[2]];
const quadratSumme = (v) => `\\sqrt{${v.filter((x) => x !== 0).map((x) => x * x).join(" + ")}} = \\sqrt{${skalar(v, v)}} = ${Math.round(Math.sqrt(skalar(v, v)))}`;
const binomKoeff = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };

const teil = (b, be, text) => ({ b, be, text });
const schritt = (teilB, be, text) => ({ teil: teilB, be, text });

/* ======================================================================
   ANALYSIS
   ====================================================================== */

/* Linearer Faktor m1·x + m0, maximal ausgeklammert: 2(x + 2), −(x + 1), 2(2 − x), 3x */
function linFaktor(m1, m0) {
  if (m0 === 0) return summe([{ c: m1, v: "x" }]);
  const s = m1 < 0 && m0 < 0 ? -1 : 1;
  const g = ggT(Math.abs(m1), Math.abs(m0)) || 1;
  const a1 = (s * m1) / g, a0 = (s * m0) / g;
  const innen = a1 < 0 && a0 > 0 ? `${a0} ${MINUS} ${Math.abs(a1) === 1 ? "" : Math.abs(a1)}x` : summe([{ c: a1, v: "x" }, { c: a0, v: "" }]);
  return `${s < 0 ? MINUS : ""}${g > 1 ? g : ""}(${innen})`;
}

/* Produktregel mit e-Funktion und Tangente bei x = 0: f(x) = (ax + b) · e^(kx) */
function genTangente(z) {
  const a = wahl(z, [1, 2, 3]);
  const k = wahl(z, [-1, 1]);
  const b = wahl(z, [-3, -2, -1, 1, 2, 3].filter((x) => a + x * k !== 0));   // Steigung f′(0) = a + bk ≠ 0: keine waagrechte Tangente
  const E = k === 1 ? "e^{x}" : `e^{${MINUS}x}`;
  const vStrich = k === 1 ? "e^{x}" : `${MINUS}e^{${MINUS}x}`;
  const lin = summe([{ c: a, v: "x" }, { c: b, v: "" }]);
  const m1 = a * k, m0 = a + b * k;
  const fStrich = `${linFaktor(m1, m0)} \\cdot ${E}`;
  const uStrichV = a === 1 ? E : `${a} \\cdot ${E}`;
  const produkt = `${uStrichV} ${k === 1 ? "+" : MINUS} (${lin}) \\cdot ${E}`;
  const tText = summe([{ c: m0, v: "x" }, { c: b, v: "" }]);
  return {
    einleitung: `Gegeben ist die Funktion $f$ mit $f(x) = (${lin}) \\cdot ${E}$.`,
    teile: [
      teil("a", 2, `Zeigen Sie, dass für die Ableitung gilt: $f'(x) = ${fStrich}$.`),
      teil("b", 3, `Bestimmen Sie eine Gleichung der Tangente an den Graphen von $f$ im Punkt $P(0 \\mid ${zahl(b)})$.`),
    ],
    erwartung: [
      schritt("a", 1, `Produktregel mit $u(x) = ${lin}$ und $v(x) = ${E}$, dabei $v'(x) = ${vStrich}$`),
      schritt("a", 1, `Zusammengefasst und ausgeklammert: $f'(x) = ${produkt} = ${fStrich}$`),
      schritt("b", 1, `Steigung: $f'(0) = ${zahl(m0)}$`),
      schritt("b", 1, `Achsenabschnitt: $c = f(0) = ${zahl(b)}$, weil $P$ auf der $y$-Achse liegt`),
      schritt("b", 1, `Tangente: $t(x) = ${tText}$`),
    ],
    kurz: [`a) $f'(x) = ${fStrich}$`, `b) $t(x) = ${tText}$`],
    kontrolle: { a, b, k, m1, m0 },
  };
}

/* Stammfunktion und bestimmtes Integral eines Polynoms: f(x) = 3p x² + 2q x + r */
function genIntegral(z) {
  let p, q, r, m, V;
  do {
    p = wahl(z, [-1, 1, 2]);
    q = wahl(z, [-3, -2, -1, 1, 2, 3]);
    r = wahl(z, [-4, -3, -2, -1, 1, 2, 3, 4, 5]);
    m = wahl(z, [1, 2, 3]);
    V = p * m ** 3 + q * m ** 2 + r * m;
  } while (V === 0);
  const fText = summe([{ c: 3 * p, v: "x^2" }, { c: 2 * q, v: "x" }, { c: r, v: "" }]);
  const FText = summe([{ c: p, v: "x^3" }, { c: q, v: "x^2" }, { c: r, v: "x" }]);
  const glieder = [p * m ** 3, q * m ** 2, r * m];
  const einsetzen = glieder.filter((g) => g !== 0).length > 1 ? `${zahlSumme(glieder)} = ` : "";
  const int = `\\int_0^{${m}} f(x)\\,dx`;
  return {
    einleitung: `Gegeben ist die Funktion $f$ mit $f(x) = ${fText}$.`,
    teile: [
      teil("a", 2, "Bestimmen Sie eine Stammfunktion $F$ von $f$."),
      teil("b", 3, `Berechnen Sie $${int}$.`),
    ],
    erwartung: [
      schritt("a", 1, "Jede Potenz einzeln: Exponent um 1 erhöhen, durch den neuen Exponenten teilen"),
      schritt("a", 1, `$F(x) = ${FText}$ (jede Konstante $C$ ist erlaubt)`),
      schritt("b", 1, `Hauptsatz: $${int} = F(${m}) ${MINUS} F(0)$`),
      schritt("b", 1, `Einsetzen: $F(${m}) = ${einsetzen}${zahl(V)}$ und $F(0) = 0$`),
      schritt("b", 1, `Ergebnis: $${int} = ${zahl(V)}$`),
    ],
    kurz: [`a) $F(x) = ${FText}$`, `b) $${int} = ${zahl(V)}$`],
    kontrolle: { p, q, r, m, V },
  };
}

/* Exponentialgleichung per Substitution z = e^x */
function genEGleichung(z) {
  const zwei = z() < 0.6;
  let p, q, B, C;
  if (zwei) {
    p = wahl(z, [1, 2, 3, 4]);
    do q = wahl(z, [2, 3, 4, 5]); while (q <= p);
    B = -(p + q); C = p * q;
  } else {
    p = wahl(z, [2, 3, 4, 5]);
    do q = -wahl(z, [1, 2, 3]); while (-q === p);   // zweite Lösung z = q < 0
    B = -(p + q); C = p * q;
  }
  const gl = `${summe([{ c: 1, v: "e^{2x}" }, { c: B, v: "e^{x}" }, { c: C, v: "" }])} = 0`;
  const zgl = `${summe([{ c: 1, v: "z^2" }, { c: B, v: "z" }, { c: C, v: "" }])} = 0`;
  const lsg = (w) => (w === 1 ? "x = 0" : `x = \\ln ${w}`);
  const lsgWert = (w) => (w === 1 ? "0" : `\\ln ${w}`);
  const ruecks = (w) => `$e^{x} = ${w}$ ergibt $${lsg(w)}$`;
  const menge = zwei ? `L = \\{${lsgWert(p)}; ${lsgWert(q)}\\}` : `L = \\{${lsgWert(p)}\\}`;
  return {
    einleitung: "Gegeben ist eine Exponentialgleichung.",
    teile: [teil("a", 5, `Bestimmen Sie alle Lösungen der Gleichung $${gl}$.`)],
    erwartung: [
      schritt("a", 1, `Substitution $z = e^{x}$ führt auf $${zgl}$`),
      schritt("a", 1, `Quadratische Gleichung gelöst (pq-Formel oder Satz von Vieta): $z_1 = ${zahl(p)}$, $z_2 = ${zahl(q)}$`),
      schritt("a", 1, `Rücksubstitution: ${ruecks(p)}`),
      schritt("a", 1, zwei ? `Rücksubstitution: ${ruecks(q)}` : `$e^{x} = ${zahl(q)}$ hat keine Lösung, weil $e^{x} > 0$ für alle $x$`),
      schritt("a", 1, `Lösungsmenge: $${menge}$`),
    ],
    kurz: [`$${menge}$`],
    kontrolle: { p, q, B, C, zwei },
  };
}

/* Extremstellen einer kubischen Funktion: f(x) = σ(x³ − 3a²x) + c */
function genExtrem(z) {
  const s = wahl(z, [1, -1]);
  const a = wahl(z, [1, 2, 3]);
  const c = wahl(z, [-4, -3, -2, -1, 0, 1, 2, 3, 4]);
  const fText = summe([{ c: s, v: "x^3" }, { c: -3 * s * a * a, v: "x" }, { c, v: "" }]);
  const fs = `${summe([{ c: 3 * s, v: "x^2" }, { c: -3 * s * a * a, v: "" }])} = ${s < 0 ? MINUS : ""}3(x ${MINUS} ${a})(x + ${a})`;
  const f2 = summe([{ c: 6 * s, v: "x" }]);
  const art = (x) => (6 * s * x < 0 ? "Hochpunkt" : "Tiefpunkt");
  const zeile = (x) => `$f''(${zahl(x)}) = ${zahl(6 * s * x)} ${6 * s * x < 0 ? "< 0" : "> 0"}$: ${art(x)} bei $x = ${zahl(x)}$`;
  return {
    einleitung: `Gegeben ist die Funktion $f$ mit $f(x) = ${fText}$.`,
    teile: [teil("a", 5, "Bestimmen Sie die Extremstellen von $f$ und geben Sie jeweils an, ob ein Hoch- oder ein Tiefpunkt vorliegt.")],
    erwartung: [
      schritt("a", 1, `$f'(x) = ${fs}$`),
      schritt("a", 1, `Notwendige Bedingung $f'(x) = 0$: $x_1 = ${zahl(-a)}$, $x_2 = ${a}$`),
      schritt("a", 1, `$f''(x) = ${f2}$`),
      schritt("a", 1, zeile(-a)),
      schritt("a", 1, zeile(a)),
    ],
    kurz: [`${art(-a)} bei $x = ${zahl(-a)}$, ${art(a)} bei $x = ${a}$`],
    kontrolle: { s, a, c },
  };
}

/* ======================================================================
   GEOMETRIE
   ====================================================================== */

/* Kleiner ganzzahliger Vektor, nicht null */
function kleinerVektor(z, max = 3) {
  let v;
  do v = [ganzVon(z, -max, max), ganzVon(z, -max, max), ganzVon(z, -max, max)]; while (!v[0] && !v[1] && !v[2]);
  return v;
}
const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const gekuerzt = (v) => { const g = ggT(ggT(v[0], v[1]), v[2]) || 1; return v.map((x) => x / g); };

/* Lage von Gerade und Ebene, ggf. Schnittpunkt */
function genLage(z) {
  const fall = z() < 0.66 ? "schneidet" : z() < 0.5 ? "parallel" : "liegt";
  let n, u, P, d, S = null, t0 = null;
  if (fall === "schneidet") {
    do { n = kleinerVektor(z); u = kleinerVektor(z); } while (skalar(n, u) === 0 || n.filter((x) => x === 0).length > 1);
    S = [ganzVon(z, -4, 4), ganzVon(z, -4, 4), ganzVon(z, -4, 4)];
    t0 = wahl(z, [-2, -1, 1, 2]);
    P = plus(S, mal(-t0, u));
    d = skalar(n, S);
  } else {
    do {
      n = kleinerVektor(z);
      u = gekuerzt(kreuz(n, kleinerVektor(z)));
    } while ((!u[0] && !u[1] && !u[2]) || Math.max(...u.map(Math.abs)) > 6 || n.filter((x) => x === 0).length > 1);
    P = [ganzVon(z, -4, 4), ganzVon(z, -4, 4), ganzVon(z, -4, 4)];
    d = skalar(n, P) + (fall === "liegt" ? 0 : wahl(z, [-6, -4, -3, 3, 5, 7]));
  }
  const nP = skalar(n, P), nu = skalar(n, u);
  const g = `g: \\vec{x} = ${spalte(P)} + t \\cdot ${spalte(u)}`;
  const E = `E: ${ebene(n)} = ${zahl(d)}`;
  const einsetzen = "Koordinaten der Geraden zeilenweise in die Ebenengleichung eingesetzt";
  const erwartung = fall === "schneidet" ? [
    schritt("a", 1, einsetzen),
    schritt("a", 1, `Gleichung in $t$: $${summe([{ c: nu, v: "t" }, { c: nP, v: "" }])} = ${zahl(d)}$`),
    schritt("a", 1, `$t = ${zahl(t0)}$`),
    schritt("a", 1, `Schnittpunkt $${punkt("S", S)}$`),
    schritt("a", 1, "$g$ schneidet $E$ in genau einem Punkt"),
  ] : [
    schritt("a", 1, einsetzen),
    schritt("a", 1, `$t$ fällt weg: $${zahl(nP)} = ${zahl(d)}$`),
    schritt("a", 1, fall === "liegt" ? "Das ist eine wahre Aussage – für jedes $t$" : "Das ist eine falsche Aussage – für kein $t$"),
    schritt("a", 1, fall === "liegt" ? "Also liegt $g$ in $E$" : "Also ist $g$ echt parallel zu $E$ (kein gemeinsamer Punkt)"),
    schritt("a", 1, "Kontrolle: $\\vec{n} \\cdot \\vec{u} = 0$, der Richtungsvektor steht senkrecht auf dem Normalenvektor"),
  ];
  const kurz = fall === "schneidet" ? `$g$ schneidet $E$ in $${punkt("S", S)}$` : fall === "liegt" ? "$g$ liegt in $E$" : "$g$ ist echt parallel zu $E$";
  return {
    einleitung: `Gegeben sind die Gerade $${g}$ und die Ebene $${E}$.`,
    teile: [teil("a", 5, "Untersuchen Sie die gegenseitige Lage von $g$ und $E$. Bestimmen Sie gegebenenfalls den Schnittpunkt.")],
    erwartung,
    kurz: [kurz],
    kontrolle: { fall, n, u, P, d, S, t0 },
  };
}

/* Normalenvektoren mit ganzzahliger Länge (pythagoreische Quadrupel) */
const QUADRUPEL = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11]];
function laengenVektor(z, liste = QUADRUPEL) {
  const [a, b, c, L] = wahl(z, liste);
  const teile = [a, b, c];
  for (let i = 2; i > 0; i--) { const j = Math.floor(z() * (i + 1)); [teile[i], teile[j]] = [teile[j], teile[i]]; }
  return { v: teile.map((x) => (z() < 0.5 ? -x : x)), L };
}

/* Abstand Punkt–Ebene und parallele Ebene durch den Punkt */
function genAbstand(z) {
  let n, L, Q, k, nQ, d;
  do {
    ({ v: n, L } = laengenVektor(z));
    Q = [ganzVon(z, -4, 4), ganzVon(z, -4, 4), ganzVon(z, -4, 4)];
    k = wahl(z, [1, 2, 3, 4]);
    nQ = skalar(n, Q);
    d = nQ - wahl(z, [-1, 1]) * k * L;
  } while (d === 0 || nQ === 0);
  const diff = nQ - d;
  const minusD = d < 0 ? `+ ${-d}` : `${MINUS} ${d}`;          // „− d“ ohne doppeltes Minus
  return {
    einleitung: `Gegeben sind die Ebene $E: ${ebene(n)} = ${zahl(d)}$ und der Punkt $${punkt("Q", Q)}$.`,
    teile: [
      teil("a", 3, "Berechnen Sie den Abstand des Punktes $Q$ von der Ebene $E$."),
      teil("b", 2, "Die Ebene $F$ ist parallel zu $E$ und enthält $Q$. Geben Sie eine Koordinatengleichung von $F$ an."),
    ],
    erwartung: [
      schritt("a", 1, `Abstandsformel: $d(Q, E) = \\frac{|\\vec{n} \\cdot \\vec{q} ${minusD}|}{|\\vec{n}|}$`),
      schritt("a", 1, `$|\\vec{n}| = ${quadratSumme(n)}$`),
      schritt("a", 1, `$\\vec{n} \\cdot \\vec{q} ${minusD} = ${zahl(nQ)} ${minusD} = ${zahl(diff)}$, also $d(Q, E) = \\frac{${Math.abs(diff)}}{${L}} = ${k}$`),
      schritt("b", 1, `Normalenvektor von $E$ übernehmen: $F: ${ebene(n)} = c$`),
      schritt("b", 1, `$Q$ einsetzen: $c = ${zahl(nQ)}$, also $F: ${ebene(n)} = ${zahl(nQ)}$`),
    ],
    kurz: [`a) $d(Q, E) = ${k}$`, `b) $F: ${ebene(n)} = ${zahl(nQ)}$`],
    kontrolle: { n, L, Q, d, k },
  };
}

/* Rechtwinkliges Dreieck im Raum und sein Flächeninhalt */
const LAENGEN_VEKTOREN = (() => {
  const basis = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [0, 3, 4, 5], [2, 4, 4, 6], [0, 6, 8, 10]];
  const aus = new Map();
  for (const [a, b, c, L] of basis) {
    const perms = [[a, b, c], [a, c, b], [b, a, c], [b, c, a], [c, a, b], [c, b, a]];
    for (const p of perms) for (const s0 of [1, -1]) for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
      const v = [p[0] * s0, p[1] * s1, p[2] * s2];
      aus.set(v.join(","), { v, L });
    }
  }
  return [...aus.values()];
})();
function genDreieck(z) {
  let v, w;
  for (;;) {
    v = wahl(z, LAENGEN_VEKTOREN);
    if (v.L > 7) continue;
    const passend = LAENGEN_VEKTOREN.filter((x) => skalar(x.v, v.v) === 0 && x.L <= 7);
    if (!passend.length) continue;
    w = wahl(z, passend);
    break;
  }
  const A = [ganzVon(z, -3, 3), ganzVon(z, -3, 3), ganzVon(z, -3, 3)];
  const B = plus(A, v.v), C = plus(A, w.v);
  const produkte = [v.v[0] * w.v[0], v.v[1] * w.v[1], v.v[2] * w.v[2]];
  const produktText = produkte.filter((x) => x !== 0).length > 1 ? `${zahlSumme(produkte)} = 0` : "0";
  const flaeche = (v.L * w.L) / 2;
  return {
    einleitung: `Gegeben sind die Punkte $${punkt("A", A)}$, $${punkt("B", B)}$ und $${punkt("C", C)}$.`,
    teile: [
      teil("a", 2, "Zeigen Sie, dass das Dreieck $ABC$ bei $A$ einen rechten Winkel hat."),
      teil("b", 3, "Berechnen Sie den Flächeninhalt des Dreiecks $ABC$."),
    ],
    erwartung: [
      schritt("a", 1, `$\\vec{AB} = ${spalte(v.v)}$ und $\\vec{AC} = ${spalte(w.v)}$`),
      schritt("a", 1, `$\\vec{AB} \\cdot \\vec{AC} = ${produktText}$, also stehen die Seiten senkrecht`),
      schritt("b", 1, `$|\\vec{AB}| = ${quadratSumme(v.v)}$`),
      schritt("b", 1, `$|\\vec{AC}| = ${quadratSumme(w.v)}$`),
      schritt("b", 1, `Flächeninhalt: $\\frac{1}{2} \\cdot ${v.L} \\cdot ${w.L} = ${dez(flaeche)}$`),
    ],
    kurz: [`a) $\\vec{AB} \\cdot \\vec{AC} = 0$`, `b) Flächeninhalt $${dez(flaeche)}$`],
    kontrolle: { A, B, C, v: v.v, w: w.v, Lv: v.L, Lw: w.L, flaeche },
  };
}

/* ======================================================================
   STOCHASTIK
   ====================================================================== */

/* Binomialverteilung: P(X = k) als Bruch und Erwartungswert */
function genBinom(z) {
  const [a, b] = wahl(z, [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5]]);
  const n = wahl(z, [3, 4, 5]);
  const k = ganzVon(z, 1, n - 1);
  const C = binomKoeff(n, k);
  const zaehler = C * a ** k * (b - a) ** (n - k), nenner = b ** n;
  const p = bruch(a, b), q = bruch(b - a, b);
  const potenz = (t, e) => (e === 1 ? t : `\\left(${t}\\right)^{${e}}`);
  const faktoren = [C, a ** k, (b - a) ** (n - k)].filter((f) => f !== 1);
  const zwischen = faktoren.length > 1 ? `\\frac{${faktoren.join(" \\cdot ")}}{${nenner}} = ` : "";
  const ungekuerzt = `\\frac{${zaehler}}{${nenner}}`;
  const ergebnis = bruch(zaehler, nenner);
  const kette = ungekuerzt === ergebnis ? ergebnis : `${ungekuerzt} = ${ergebnis}`;
  const E = bruch(n * a, b);
  return {
    einleitung: `Ein Glücksrad bleibt mit der Wahrscheinlichkeit $${p}$ auf Gold stehen. Es wird ${n}-mal gedreht. $X$ ist die Anzahl der Drehungen mit Gold.`,
    teile: [
      teil("a", 3, `Berechnen Sie $P(X = ${k})$.`),
      teil("b", 2, "Berechnen Sie den Erwartungswert von $X$."),
    ],
    erwartung: [
      schritt("a", 1, `$X$ ist binomialverteilt mit $n = ${n}$ und $p = ${p}$`),
      schritt("a", 1, `$P(X = ${k}) = \\binom{${n}}{${k}} \\cdot ${potenz(p, k)} \\cdot ${potenz(q, n - k)}$`),
      schritt("a", 1, `$P(X = ${k}) = ${zwischen}${kette}$`),
      schritt("b", 1, "$E(X) = n \\cdot p$"),
      schritt("b", 1, `$E(X) = ${n} \\cdot ${p} = ${E}$`),
    ],
    kurz: [`a) $P(X = ${k}) = ${ergebnis}$`, `b) $E(X) = ${E}$`],
    kontrolle: { a, b, n, k, zaehler, nenner },
  };
}

/* Bedingte Wahrscheinlichkeit mit Baum bzw. Vier-Felder-Tafel */
function genVierfeld(z) {
  const pA = wahl(z, [20, 30, 40, 60]), pBA = wahl(z, [50, 60, 70, 80, 90]), pBnA = wahl(z, [10, 20, 30, 40]);
  const ab = pA * pBA, nab = (100 - pA) * pBnA;          // in Zehntausendsteln
  const pB = ab + nab;
  const d = (x) => dez(x / 100), d2 = (x) => dez(x / 10000);
  return {
    einleitung: `In einem Abiturjahrgang trainieren ${pA} % der Schüler mit einer Lern-App ($A$). Von ihnen bestehen ${pBA} % eine Probeklausur ($B$), von den übrigen Schülern ${pBnA} %.`,
    teile: [
      teil("a", 2, "Berechnen Sie die Wahrscheinlichkeit, dass ein zufällig ausgewählter Schüler die Probeklausur besteht."),
      teil("b", 3, "Ein Schüler hat die Probeklausur bestanden. Berechnen Sie die Wahrscheinlichkeit, dass er mit der App trainiert hat."),
    ],
    erwartung: [
      schritt("a", 1, "Ansatz über beide Pfade: $P(B) = P(A) \\cdot P_A(B) + P(\\overline{A}) \\cdot P_{\\overline{A}}(B)$"),
      schritt("a", 1, `$P(B) = ${d(pA)} \\cdot ${d(pBA)} + ${d(100 - pA)} \\cdot ${d(pBnA)} = ${d2(ab)} + ${d2(nab)} = ${d2(pB)}$`),
      schritt("b", 1, "Gesucht ist $P_B(A) = \\frac{P(A \\cap B)}{P(B)}$"),
      schritt("b", 1, `$P(A \\cap B) = ${d(pA)} \\cdot ${d(pBA)} = ${d2(ab)}$`),
      schritt("b", 1, `$P_B(A) = \\frac{${d2(ab)}}{${d2(pB)}} = ${bruch(ab, pB)}$`),
    ],
    kurz: [`a) $P(B) = ${d2(pB)}$`, `b) $P_B(A) = ${bruch(ab, pB)}$`],
    kontrolle: { pA, pBA, pBnA, pB, ab },
  };
}

/* Glücksspiel: Erwartungswert, Fairness, fairer Betrag */
function genErwartung(z) {
  const ABSCHLUSS = [1, 2, 4, 5, 10, 20, 25, 50, 100];
  let N, q, x2, x3, e, Ez, En, x3fair;
  for (let i = 0; ; i++) {
    [N, ...q] = wahl(z, [[6, 3, 2, 1], [4, 2, 1, 1], [10, 5, 3, 2], [8, 4, 3, 1]]);
    x2 = wahl(z, [2, 3, 4]); x3 = wahl(z, [5, 6, 8, 10, 12]); e = wahl(z, [2, 3, 4]);
    const zaehler = q[1] * x2 + q[2] * x3;
    const g = ggT(zaehler, N); Ez = zaehler / g; En = N / g;
    const rest = e * N - q[1] * x2;
    x3fair = rest / q[2];
    if ((ABSCHLUSS.includes(En) && Ez !== e * En && Number.isInteger(x3fair) && x3fair > 0 && x3fair !== x3) || i > 400) break;
  }
  if (!(Number.isInteger(x3fair) && x3fair > 0)) { N = 4; q = [2, 1, 1]; x2 = 2; x3 = 8; e = 3; Ez = 5; En = 2; x3fair = 10; }
  const E = Ez / En;
  const p = q.map((x) => bruch(x, N));
  const euro = (v) => `${dez(v)}\\text{ €}`;
  return {
    einleitung: `Ein Glücksrad hat drei Felder. Feld 1 erscheint mit der Wahrscheinlichkeit $${p[0]}$, Feld 2 mit $${p[1]}$, Feld 3 mit $${p[2]}$. Feld 1 zahlt nichts aus, Feld 2 zahlt ${x2} €, Feld 3 zahlt ${x3} €. Ein Spiel kostet ${e} € Einsatz.`,
    teile: [
      teil("a", 2, "Berechnen Sie den Erwartungswert der Auszahlung."),
      teil("b", 1, "Entscheiden Sie, ob das Spiel fair ist."),
      teil("c", 2, "Die Auszahlung von Feld 3 soll so geändert werden, dass das Spiel fair ist. Bestimmen Sie den neuen Betrag."),
    ],
    erwartung: [
      schritt("a", 1, "Ansatz: Summe aus Wahrscheinlichkeit mal Auszahlung"),
      schritt("a", 1, `$E(X) = ${p[1]} \\cdot ${x2} + ${p[2]} \\cdot ${x3} = ${euro(E)}$`),
      schritt("b", 1, `${dez(E)} € ${E < e ? "<" : ">"} ${e} €: nicht fair, ${E < e ? "der Spieler verliert" : "der Anbieter verliert"} im Mittel ${dez(Math.abs(E - e))} € je Spiel`),
      schritt("c", 1, `Fair heißt $E(X) = ${e}$: $${p[1]} \\cdot ${x2} + ${p[2]} \\cdot a = ${e}$`),
      schritt("c", 1, `$a = ${x3fair}$, Feld 3 zahlt dann ${x3fair} € aus`),
    ],
    kurz: [`a) $E(X) = ${euro(E)}$`, "b) nicht fair", `c) ${x3fair} €`],
    kontrolle: { N, q, x2, x3, e, E, x3fair },
  };
}

/* ======================================================================
   KATALOG
   ====================================================================== */
export const SACHGEBIETE = {
  analysis: { id: "analysis", name: "Analysis", kurz: "Ana" },
  geometrie: { id: "geometrie", name: "Analytische Geometrie", kurz: "Geo" },
  stochastik: { id: "stochastik", name: "Stochastik", kurz: "Sto" },
};

export const AUFGABEN_TYPEN = [
  { id: "ana-tangente", sachgebiet: "analysis", titel: "Ableiten und Tangente", zeile: "Produktregel mit e-Funktion, Tangente im Punkt", trainer: "ableitungstrainer", gen: genTangente },
  { id: "ana-integral", sachgebiet: "analysis", titel: "Stammfunktion und Integral", zeile: "Aufleiten, Hauptsatz, Wert berechnen", trainer: "integrale", gen: genIntegral },
  { id: "ana-egleichung", sachgebiet: "analysis", titel: "Exponentialgleichung", zeile: "Substitution z = eˣ, Lösungsmenge", trainer: "gleichungen", gen: genEGleichung },
  { id: "ana-extrem", sachgebiet: "analysis", titel: "Extremstellen", zeile: "f′ = 0, Art mit f″", trainer: "kurvendiskussion", gen: genExtrem },
  { id: "geo-lage", sachgebiet: "geometrie", titel: "Gerade und Ebene", zeile: "Lage untersuchen, Schnittpunkt", trainer: "geraden", gen: genLage },
  { id: "geo-abstand", sachgebiet: "geometrie", titel: "Abstand Punkt – Ebene", zeile: "Abstandsformel, parallele Ebene", trainer: "abstaende", gen: genAbstand },
  { id: "geo-dreieck", sachgebiet: "geometrie", titel: "Rechter Winkel und Fläche", zeile: "Skalarprodukt, Längen, Flächeninhalt", trainer: "vektorgenerator", gen: genDreieck },
  { id: "sto-binom", sachgebiet: "stochastik", titel: "Binomialverteilung", zeile: "P(X = k) als Bruch, Erwartungswert", trainer: "bernoulli", gen: genBinom },
  { id: "sto-vierfeld", sachgebiet: "stochastik", titel: "Bedingte Wahrscheinlichkeit", zeile: "Pfadregeln, Satz von Bayes", trainer: "vierfelder", gen: genVierfeld },
  { id: "sto-erwartung", sachgebiet: "stochastik", titel: "Faires Spiel", zeile: "Erwartungswert, fairer Einsatz", trainer: "kombinatorik", gen: genErwartung },
];
export const typ = (id) => AUFGABEN_TYPEN.find((t) => t.id === id) || null;
export const typenIn = (sachgebiet) => AUFGABEN_TYPEN.filter((t) => t.sachgebiet === sachgebiet);

/* Eine Aufgabe zu einem Typ und Seed (gleicher Seed → gleiche Aufgabe) */
export function aufgabeErzeugen(typId, seed = 1) {
  const t = typ(typId);
  if (!t) throw new Error(`Unbekannter Aufgabentyp: ${typId}`);
  const z = zufall(`${seed}`.split("").reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7) ^ (AUFGABEN_TYPEN.indexOf(t) * 7919));
  const a = t.gen(z);
  const be = a.teile.reduce((s, x) => s + x.be, 0);
  return { id: `${typId}:${seed}`, typ: typId, sachgebiet: t.sachgebiet, titel: t.titel, trainer: t.trainer, seed, be, ...a };
}

/* Neuer Seed (für „Neue Aufgabe“) */
export const neuerSeed = () => Math.floor(Math.random() * 1e9) + 1;

/* Teil A wie im Leistungsfach BW: P1–P4 (2 × Analysis, Geometrie, Stochastik) und W1–W6 (je 2).
   Jeder der zehn Typen kommt genau einmal vor. */
export function teilAProbe(seed = 1) {
  const z = zufall(seed);
  const misch = (l) => { const a = l.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(z() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const ana = misch(typenIn("analysis")), geo = misch(typenIn("geometrie")), sto = misch(typenIn("stochastik"));
  const pflichtTypen = [ana[0], ana[1], geo[0], sto[0]];
  const wahlTypen = [ana[2], ana[3], geo[1], geo[2], sto[1], sto[2]];
  const s = (i) => (Number(seed) * 13 + i * 101) >>> 0;
  return {
    seed,
    pflicht: pflichtTypen.map((t, i) => ({ nr: `P${i + 1}`, ...aufgabeErzeugen(t.id, s(i)) })),
    wahl: wahlTypen.map((t, i) => ({ nr: `W${i + 1}`, ...aufgabeErzeugen(t.id, s(i + 4)) })),
  };
}

/* Aufgabe als Klartext (für Mia): ohne $-Zeichen, mit BE */
export function aufgabeAlsText(a, { mitErwartung = false } = {}) {
  const ohne = (s) => String(s).replace(/\$/g, "");
  const zeilen = [`${a.titel} (${a.be} BE)`, ohne(a.einleitung), ...a.teile.map((t) => `${t.b}) ${ohne(t.text)} (${t.be} BE)`)];
  if (mitErwartung) {
    zeilen.push("", "Erwartungshorizont:");
    a.erwartung.forEach((e, i) => zeilen.push(`${i + 1}. [${e.teil}] ${ohne(e.text)} (${e.be} BE)`));
  }
  return zeilen.join("\n");
}
