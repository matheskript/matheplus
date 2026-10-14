/* ============================================================
   Abi-Ketten – reine Mathematik (kein React)
   Eine Abi-Kette ist eine Prüfungsaufgabe, die in Teilaufgaben durch
   mehrere Werkzeuge läuft. Jede Kette wird zufällig, aber so erzeugt,
   dass alle Ergebnisse sauber aufgehen:
   · analysis  – Funktion aus Hoch- und Tiefpunkt → Wendepunkt →
                 Wendetangente → Integral zwischen den Extremstellen
   · geometrie – Pyramide ABCS: Ebene der Grundfläche → Höhe als
                 Abstand → Grundfläche → Volumen
   · stochastik – Sachkontext → Bernoulli-Modell → Hypothesentest →
                 Fehler 2. Art
   Jede Teilaufgabe: { id, titel, frage, felder: [{ name, wert, toleranz }],
   punkte, loesung (Text), werkzeug: { ziel, daten, titel } }.
   Prüfen: pruefeTeil(teil, eingaben) → { punkte, richtig: [bool …] }.
   Regel A5: Lösungstexte enden nie auf unvereinfachten Ausdrücken.
   ============================================================ */

const runde = (v, s = 6) => Math.round(v * 10 ** s) / 10 ** s;
const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
const komma = (v, s = 2) => {
  const r = runde(v, s);
  return (Object.is(r, -0) ? 0 : r).toFixed(s).replace(/\.?0+$/, "").replace(".", ",").replace("-", "−");
};
const zahl = (v) => String(runde(v, 6)).replace(".", ",").replace("-", "−");
const vz = (v, erstes = false) => (v < 0 ? (erstes ? "−" : " − ") : erstes ? "" : " + ");

/* Polynom in Klartext: [[c, p], …] → „2x³ − 3x² + 1“ (ohne 1·, ohne + −) */
export function polyKlartext(paare) {
  const hoch = { 2: "²", 3: "³", 4: "⁴" };
  let s = "";
  for (const [c0, p] of paare) {
    const c = runde(c0);
    if (c === 0) continue;
    const x = p === 0 ? "" : p === 1 ? "x" : `x${hoch[p] || `^${p}`}`;
    const b = Math.abs(c);
    s += vz(c, !s) + (b === 1 && x ? "" : zahl(b)) + x;
  }
  return s || "0";
}

/* ---------- Analysis ---------- */
export function analysisKette(zufall = Math.random) {
  const wahl = (l) => l[Math.floor(zufall() * l.length)];
  for (;;) {
    const k = wahl([1, -1, 1, -1, 2, -2]);
    const u = wahl([-3, -2, -1, 0, 1]);
    const v = u + wahl([2, 4]);
    const d = wahl([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
    const a = k, b = -1.5 * k * (u + v), c = 3 * k * u * v;
    const f = (x) => a * x ** 3 + b * x ** 2 + c * x + d;
    const fs = (x) => 3 * a * x ** 2 + 2 * b * x + c;
    if ([f(u), f(v)].some((y) => Math.abs(y) > 40) || Math.abs(c) > 40) continue;
    const xw = (u + v) / 2, yw = f(xw), m = fs(xw), n = yw - m * xw;
    const F = (x) => (a / 4) * x ** 4 + (b / 3) * x ** 3 + (c / 2) * x ** 2 + d * x;
    const I = F(v) - F(u);
    const H = k > 0 ? { x: u, y: f(u) } : { x: v, y: f(v) };
    const T = k > 0 ? { x: v, y: f(v) } : { x: u, y: f(u) };
    const fText = polyKlartext([[a, 3], [b, 2], [c, 1], [d, 0]]);
    const fEingabe = [[a, 3], [b, 2], [c, 1], [d, 0]].filter(([q]) => q !== 0)
      .map(([q, p], i) => `${q < 0 ? "-" : i ? "+" : ""}${Math.abs(q) === 1 && p ? "" : `${Math.abs(q)}${p ? "*" : ""}`}${p === 0 ? "" : p === 1 ? "x" : `x^${p}`}`).join("") || "0";
    const werkzeugF = { ziel: "advplotter", daten: { text: fEingabe }, titel: "In der Kurvendiskussion nachsehen" };
    return {
      id: "analysis", titel: "Analysis: vom Steckbrief zur Fläche", minuten: 25,
      einleitung: `Der Graph einer ganzrationalen Funktion f dritten Grades hat den Hochpunkt H(${zahl(H.x)} | ${zahl(H.y)}) und den Tiefpunkt T(${zahl(T.x)} | ${zahl(T.y)}).`,
      f: { a, b, c, d, text: fText, eingabe: fEingabe },
      teile: [
        { id: "a", titel: "Funktion bestimmen", punkte: 4,
          frage: "Bestimme den Funktionsterm f(x) = ax³ + bx² + cx + d.",
          felder: [{ name: "a", wert: a }, { name: "b", wert: b }, { name: "c", wert: c }, { name: "d", wert: d }].map((x) => ({ ...x, toleranz: 1e-6 })),
          loesung: `Aus f′(${zahl(u)}) = 0, f′(${zahl(v)}) = 0, f(${zahl(H.x)}) = ${zahl(H.y)} und f(${zahl(T.x)}) = ${zahl(T.y)} folgt f(x) = ${fText}.`,
          werkzeug: { ziel: "ableitungstrainer", daten: { text: fEingabe }, titel: "Diese Funktion selbst ableiten" } },
        { id: "b", titel: "Wendepunkt", punkte: 2,
          frage: "Bestimme die Koordinaten des Wendepunkts W.",
          felder: [{ name: "x", wert: xw, toleranz: 1e-6 }, { name: "y", wert: yw, toleranz: 1e-6 }],
          loesung: `f″(x) = ${polyKlartext([[6 * a, 1], [2 * b, 0]])} = 0 ⇒ x = ${zahl(xw)}; f(${zahl(xw)}) = ${zahl(yw)}, also W(${zahl(xw)} | ${zahl(yw)}).`,
          werkzeug: werkzeugF },
        { id: "c", titel: "Wendetangente", punkte: 2,
          frage: "Bestimme die Gleichung der Tangente an den Graphen im Wendepunkt: y = m·x + n.",
          felder: [{ name: "m", wert: m, toleranz: 1e-6 }, { name: "n", wert: n, toleranz: 1e-6 }],
          loesung: `m = f′(${zahl(xw)}) = ${zahl(m)}; n = ${zahl(yw)}${vz(-m * xw)}${zahl(Math.abs(m * xw))} = ${zahl(n)}, also y = ${polyKlartext([[m, 1], [n, 0]])}.`,
          werkzeug: { ziel: "ableitungstrainer", daten: { text: fEingabe }, titel: "f′ im Ableitungstrainer prüfen" } },
        { id: "d", titel: "Integral", punkte: 2,
          frage: `Berechne ∫ f(x) dx von x = ${zahl(Math.min(u, v))} bis x = ${zahl(Math.max(u, v))} (auf zwei Nachkommastellen).`,
          felder: [{ name: "I", wert: I, toleranz: 0.0051 }],
          loesung: `F(x) = ${polyKlartext([[a / 4, 4], [b / 3, 3], [c / 2, 2], [d, 1]].map(([q, p]) => [runde(q, 4), p]))}; F(${zahl(v)}) − F(${zahl(u)}) = ${komma(I)}.`,
          werkzeug: werkzeugF },
      ],
    };
  }
}

/* ---------- Geometrie ---------- */
const sub = (p, q) => p.map((x, i) => x - q[i]);
const kreuz = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const skalar = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
const laenge = (u) => Math.sqrt(skalar(u, u));
const punktText = (n, p) => `${n}(${p.map(zahl).join(" | ")})`;

export function normiereEbene(nv, d) {
  const g = [...nv, d].reduce((x, y) => ggT(x, y), 0) || 1;
  const erster = nv.find((x) => x !== 0) || 1;
  const s = erster < 0 ? -1 : 1;
  return [...nv.map((x) => (s * x) / g || 0), (s * d) / g || 0];
}

export function ebeneText(k) {
  const [a, b, c, d] = k;
  let s = "";
  [[a, "x₁"], [b, "x₂"], [c, "x₃"]].forEach(([q, x]) => {
    if (q === 0) return;
    s += vz(q, !s) + (Math.abs(q) === 1 ? "" : zahl(Math.abs(q))) + x;
  });
  return `${s || "0"} = ${zahl(d)}`;
}

export function geometrieKette(zufall = Math.random) {
  const zz = (a, b) => a + Math.floor(zufall() * (b - a + 1));
  for (;;) {
    const A = [zz(-2, 3), zz(-2, 3), zz(0, 2)], B = [zz(-2, 4), zz(-2, 4), zz(0, 3)], C = [zz(-2, 4), zz(-2, 4), zz(0, 3)];
    const nv = kreuz(sub(B, A), sub(C, A));
    if (nv.every((x) => x === 0)) continue;
    const k = normiereEbene(nv, skalar(nv, A));
    if (k.some((x) => Math.abs(x) > 10) || k.slice(0, 3).filter((x) => x !== 0).length < 2) continue;
    const S = [zz(-3, 5), zz(-3, 5), zz(3, 8)];
    const spat = Math.abs(skalar(nv, sub(S, A)));
    if (spat === 0) continue;
    const h = Math.abs(skalar(k.slice(0, 3), S) - k[3]) / laenge(k.slice(0, 3));
    if (h < 1.5 || h > 9) continue;
    const G = laenge(nv) / 2, V = spat / 6;
    if (G < 2) continue;
    const nN = k.slice(0, 3);
    return {
      id: "geometrie", titel: "Geometrie: Pyramide im Raum", minuten: 25,
      einleitung: `Die Punkte ${punktText("A", A)}, ${punktText("B", B)} und ${punktText("C", C)} bilden die Grundfläche einer dreiseitigen Pyramide mit der Spitze ${punktText("S", S)}.`,
      punkte: { A, B, C, S }, ebene: k,
      teile: [
        { id: "a", titel: "Ebene der Grundfläche", punkte: 3, art: "ebene",
          frage: "Bestimme eine Koordinatengleichung der Ebene E durch A, B und C: a·x₁ + b·x₂ + c·x₃ = d.",
          felder: [{ name: "a", wert: k[0] }, { name: "b", wert: k[1] }, { name: "c", wert: k[2] }, { name: "d", wert: k[3] }].map((x) => ({ ...x, toleranz: 1e-6 })),
          loesung: `n = AB × AC = (${nv.map(zahl).join(" | ")}); gekürzt E: ${ebeneText(k)}. Jedes Vielfache dieser Gleichung beschreibt dieselbe Ebene.`,
          werkzeug: { ziel: "ebenen", daten: { k }, titel: "Ebene im Visualizer ansehen" } },
        { id: "b", titel: "Höhe der Pyramide", punkte: 3,
          frage: "Berechne die Höhe h der Pyramide, also den Abstand von S zur Ebene E (auf zwei Nachkommastellen).",
          felder: [{ name: "h", wert: h, toleranz: 0.0051 }],
          loesung: `Hessesche Normalform mit n = (${nN.map(zahl).join(" | ")}): h = |n · S − ${zahl(k[3])}| / |n| = |${zahl(skalar(nN, S))} − ${k[3] < 0 ? `(${zahl(k[3])})` : zahl(k[3])}| / √${zahl(skalar(nN, nN))} = ${zahl(Math.abs(skalar(nN, S) - k[3]))} / √${zahl(skalar(nN, nN))} ≈ ${komma(h)}.`,
          werkzeug: { ziel: "abstaende", daten: { ebene: k, punkt: S }, titel: "Abstand im Werkzeug nachrechnen" } },
        { id: "c", titel: "Grundfläche", punkte: 2,
          frage: "Berechne den Flächeninhalt G des Dreiecks ABC (auf zwei Nachkommastellen).",
          felder: [{ name: "G", wert: G, toleranz: 0.0051 }],
          loesung: `G = ½ · |AB × AC| = ½ · √${zahl(skalar(nv, nv))} ≈ ${komma(G)}.`,
          werkzeug: { ziel: "kreuzprodukt", daten: null, titel: "Kreuzprodukt-Werkzeug öffnen" } },
        { id: "d", titel: "Volumen", punkte: 2,
          frage: "Berechne das Volumen V der Pyramide (auf zwei Nachkommastellen).",
          felder: [{ name: "V", wert: V, toleranz: 0.0051 }],
          loesung: `V = ⅓ · G · h ≈ ⅓ · ${komma(G)} · ${komma(h)} ≈ ${komma(V)} (exakt: |(AB × AC) · AS| / 6 = ${zahl(spat)}/6).`,
          werkzeug: null },
      ],
    };
  }
}

/* Ebene prüfen: Vielfache zählen als richtig */
export function ebeneGleich(k, eingabe) {
  if (eingabe.some((x) => !Number.isFinite(x)) || eingabe.slice(0, 3).every((x) => x === 0)) return false;
  const i = k.findIndex((x) => x !== 0);
  if (eingabe[i] === 0) return false;
  const f = eingabe[i] / k[i];
  return k.every((x, j) => Math.abs(x * f - eingabe[j]) < 1e-6);
}

/* ---------- Stochastik ---------- */
export function binomialP(n, p, k) {
  if (k < 0 || k > n) return 0;
  let lg = 0;
  for (let i = 1; i <= k; i++) lg += Math.log(n - k + i) - Math.log(i);
  return Math.exp(lg + k * Math.log(p) + (n - k) * Math.log(1 - p));
}
export const binomialBis = (n, p, k) => { let s = 0; for (let i = 0; i <= k; i++) s += binomialP(n, p, i); return Math.min(1, s); };
export const binomialAb = (n, p, k) => (k <= 0 ? 1 : 1 - binomialBis(n, p, k - 1));

/* kleinste Grenze g mit P(X ≥ g) ≤ α (rechtsseitiger Test) */
export function rechteGrenze(n, p, alpha) {
  for (let g = 0; g <= n + 1; g++) if (binomialAb(n, p, g) <= alpha + 1e-12) return g;
  return n + 1;
}

const STOCH_KONTEXTE = [
  { p0: 0.1, p1: 0.2, ns: [30, 40], text: (n) => `Ein Hersteller gibt an, höchstens 10 % seiner Bauteile seien defekt. Ein Kunde prüft ${n} zufällig ausgewählte Bauteile. X ist die Anzahl defekter Bauteile.`, h0: "p ≤ 0,1", treffer: "defekte Bauteile" },
  { p0: 0.6, p1: 0.75, ns: [30, 40], text: (n) => `Ein bewährtes Medikament heilt 60 % der Erkrankten. Ein neues Medikament wird an ${n} Patienten getestet. X ist die Anzahl der Geheilten.`, h0: "p ≤ 0,6", treffer: "Geheilte" },
  { p0: 1 / 6, p1: 0.25, ns: [30, 36], text: (n) => `Ein Würfel steht im Verdacht, zu oft eine Sechs zu zeigen. Er wird ${n}-mal geworfen. X ist die Anzahl der Sechsen.`, h0: "p ≤ 1/6", treffer: "Sechsen" },
];
const pText = (p) => (Math.abs(p - 1 / 6) < 1e-12 ? "1/6" : zahl(p));

export function stochastikKette(zufall = Math.random) {
  const kx = STOCH_KONTEXTE[Math.floor(zufall() * STOCH_KONTEXTE.length)];
  const n = kx.ns[Math.floor(zufall() * kx.ns.length)], p = kx.p0, alpha = 0.05;
  const mu = Math.round(n * p);
  const k1 = mu, k2 = mu + Math.max(3, Math.round(Math.sqrt(n * p * (1 - p))));
  const pa = binomialP(n, p, k1), pb = binomialAb(n, p, k2);
  const g = rechteGrenze(n, p, alpha);
  const beta = binomialBis(n, kx.p1, g - 1);
  const werkzeugB = { ziel: "bernoulli", daten: { n, p }, titel: `B(${n}; ${pText(p)}) in der Bernoulli-Kette ansehen` };
  return {
    id: "stochastik", titel: "Stochastik: vom Modell zum Test", minuten: 25,
    einleitung: `${kx.text(n)} Nimm an, dass X binomialverteilt ist.`,
    n, p, teile: [
      { id: "a", titel: "Einzelwahrscheinlichkeit", punkte: 2,
        frage: `Berechne unter der Annahme p = ${pText(p)} die Wahrscheinlichkeit P(X = ${k1}) (auf vier Nachkommastellen).`,
        felder: [{ name: "P", wert: pa, toleranz: 0.00051 }],
        loesung: `X ∼ B(${n}; ${pText(p)}): P(X = ${k1}) = (${n} über ${k1}) · ${pText(p)}^${k1} · (1 − ${pText(p)})^${n - k1} ≈ ${komma(pa, 4)}.`,
        werkzeug: werkzeugB },
      { id: "b", titel: "Mindestens", punkte: 2,
        frage: `Berechne P(X ≥ ${k2}) für p = ${pText(p)} (auf vier Nachkommastellen).`,
        felder: [{ name: "P", wert: pb, toleranz: 0.00051 }],
        loesung: `P(X ≥ ${k2}) = 1 − P(X ≤ ${k2 - 1}) ≈ ${komma(pb, 4)}.`,
        werkzeug: werkzeugB },
      { id: "c", titel: "Hypothesentest", punkte: 3,
        frage: `Getestet wird H₀: ${kx.h0} gegen H₁: p > ${pText(p)} auf dem Niveau α = 5 %. Der Ablehnungsbereich ist A = {g; …; ${n}}. Bestimme g.`,
        felder: [{ name: "g", wert: g, toleranz: 1e-9 }],
        loesung: `Gesucht ist das kleinste g mit P(X ≥ g) ≤ 0,05: P(X ≥ ${g}) ≈ ${komma(binomialAb(n, p, g), 4)} ≤ 0,05, aber P(X ≥ ${g - 1}) ≈ ${komma(binomialAb(n, p, g - 1), 4)} > 0,05. Also A = {${g}; …; ${n}}.`,
        werkzeug: { ziel: "hypothesentest", daten: { n, p }, titel: "Ablehnungsbereich im Werkzeug verschieben" } },
      { id: "d", titel: "Fehler 2. Art", punkte: 3,
        frage: `In Wahrheit sei p = ${pText(kx.p1)}. Berechne die Wahrscheinlichkeit, dass H₀ trotzdem nicht verworfen wird (auf vier Nachkommastellen).`,
        felder: [{ name: "β", wert: beta, toleranz: 0.00051 }],
        loesung: `β = P(X ≤ ${g - 1}) mit p = ${pText(kx.p1)} ≈ ${komma(beta, 4)}.`,
        werkzeug: { ziel: "hypothesentest", daten: { n, p }, titel: "Fehler im Werkzeug verstehen" } },
    ],
  };
}

export const KETTEN = [
  { id: "analysis", titel: "Analysis: vom Steckbrief zur Fläche", zeile: "Funktion bestimmen → Wendepunkt → Tangente → Integral", erzeuge: analysisKette },
  { id: "geometrie", titel: "Geometrie: Pyramide im Raum", zeile: "Ebene → Höhe als Abstand → Grundfläche → Volumen", erzeuge: geometrieKette },
  { id: "stochastik", titel: "Stochastik: vom Modell zum Test", zeile: "Bernoulli-Modell → mindestens → Ablehnungsbereich → Fehler 2. Art", erzeuge: stochastikKette },
];

/* Eingabe lesen: Komma oder Punkt, Brüche „a/b“, Minuszeichen in jeder Form */
export function leseZahl(text) {
  const t = String(text ?? "").trim().replace(/[−–]/g, "-").replace(",", ".").replace(/\s+/g, "");
  if (!t) return NaN;
  const m = t.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (m) { const z = Number(m[1]), nn = Number(m[2]); return nn === 0 ? NaN : z / nn; }
  return /^-?\d*\.?\d+$/.test(t) ? Number(t) : NaN;
}

/* Teilaufgabe prüfen → { punkte, richtig: [bool je Feld], alle } */
export function pruefeTeil(teil, eingaben) {
  const werte = teil.felder.map((_, i) => leseZahl(eingaben[i]));
  let richtig;
  if (teil.art === "ebene") {
    const ok = ebeneGleich(teil.felder.map((f) => f.wert), werte);
    richtig = teil.felder.map(() => ok);
  } else {
    richtig = teil.felder.map((f, i) => Number.isFinite(werte[i]) && Math.abs(werte[i] - f.wert) <= f.toleranz);
  }
  const anteil = richtig.filter(Boolean).length / richtig.length;
  const punkte = teil.art === "ebene" || teil.felder.length === 1 ? (anteil === 1 ? teil.punkte : 0) : Math.round(teil.punkte * anteil);
  return { punkte, richtig, alle: richtig.every(Boolean) };
}
