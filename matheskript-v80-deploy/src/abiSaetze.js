/* ============================================================
   Abi-Aufgabensätze im Stil des baden-württembergischen Abiturs – reine Mathematik (kein React).

   Zehn feste Sätze (Satz 1 … 10, je mit festem Zufallsstart, damit ein Satz immer derselbe bleibt),
   jeder nach dem gleichen Aufbau wie das BW-Abitur:
     Teil A  ohne Hilfsmittel  – A1 Analysis · A2 Geometrie · A3 Stochastik   (30 VP)
     Teil B  mit WTR/Formelsammlung – B1 Analysis (Sachzusammenhang) · B2 Geometrie · B3 Stochastik (30 VP)
   Operatoren wie im Original: Bestimmen Sie, Berechnen Sie, Zeigen Sie, Begründen Sie, Geben Sie an,
   Weisen Sie nach, Ermitteln Sie, Interpretieren Sie. VP = Verrechnungspunkte. Keine Original-Aufgaben,
   nur das Format – und keine Notenprognose.

   Teilaufgaben haben dieselbe Form wie in abiKetten.js, plus zwei neue Arten:
     art "term"       – der Schüler tippt einen Funktionsterm; geprüft numerisch an Stützstellen
     art "begruenden" – der Schüler hakt ab, welche Argumente er geschrieben hat (Selbstkontrolle)
   Regel A5: Jede Lösungszeile endet vereinfacht. Alle Zahlen gehen sauber auf, wo kein WTR erlaubt ist.
   ============================================================ */
import { ableitung, alsText, kompiliere, ohnePar, parse } from "./formelEngine.js";
import { binomTabelle, kritisch, kumuliert, pAb, pBis } from "./hypo.js";
import { kreuz, laenge, skalar, vSub, winkelZwischen } from "./rechnen2.js";
import { ebeneGleich, ebeneText, leseZahl, normiereEbene, polyKlartext } from "./abiKetten.js";

/* ---------- Zufall mit festem Start (jeder Satz bleibt derselbe) ---------- */
export function zufallMit(start) {
  let s = (start >>> 0) || 1;
  return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const runde = (v, s = 6) => Math.round(v * 10 ** s) / 10 ** s;
const zahl = (v) => String(runde(v, 4)).replace(".", ",").replace("-", "−");
const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
const bruch = (z, n) => { const g = ggT(z, n) || 1; const vzc = n < 0 ? -1 : 1; z = (vzc * z) / g; n = (vzc * n) / g; return n === 1 ? zahl(z) : `${zahl(z)}/${zahl(n)}`; };
const hoch = { 2: "²", 3: "³", 4: "⁴" };
/* Klartext der Engine etwas glätten: e^((−1) · x) → e^(−x), e^((−2) · x) → e^(−2x), (−8) · x → −8x */
const huebsch = (t) => t.replace(/e\^\(\(−1\) · x\)/g, "e^(−x)").replace(/e\^\(\((−?\d+(?:,\d+)?)\) · x\)/g, "e^($1x)").replace(/\((−\d+(?:,\d+)?)\) · x/g, "$1x").replace(/\((−\d+(?:,\d+)?)\) · /g, "$1 · ");
const termText = (eingabe) => huebsch(alsText(ohnePar(parse(eingabe))));
const termAbl = (eingabe) => ableitung(parse(eingabe));

/* Polynom-Eingabe/Text aus [[c, p], …] */
const polyEingabe = (paare) => paare.filter(([c]) => c !== 0).map(([c, p], i) => `${c < 0 ? "-" : i ? "+" : ""}${Math.abs(c) === 1 && p ? "" : `${Math.abs(c)}${p ? "*" : ""}`}${p === 0 ? "" : p === 1 ? "x" : `x^${p}`}`).join("") || "0";
const poly = (paare) => polyKlartext(paare);
const vek = (v) => `(${v.map(zahl).join(" | ")})`;
const kl = (v) => (v < 0 ? `(${zahl(v)})` : zahl(v));
const koef = (c, x) => (Math.abs(c) === 1 ? (c < 0 ? "−" : "") + x : `${zahl(c)}${x}`);

/* ---------- Teilaufgaben-Bausteine ---------- */
const feld = (name, wert, toleranz = 1e-6) => ({ name, wert, toleranz });
const num = (id, titel, frage, felder, punkte, loesung) => ({ id, titel, frage, felder, punkte, loesung });
const term = (id, titel, frage, eingabe, punkte, loesung) => ({ id, titel, frage, art: "term", felder: [{ name: "f'(x)", wert: eingabe }], punkte, loesung });
const begruenden = (id, titel, frage, kriterien, punkte, loesung) => ({ id, titel, frage, art: "begruenden", felder: [], kriterien, punkte, loesung });

/* ======================================================================
   Teil A · Analysis (ohne Hilfsmittel)
   ====================================================================== */
function a1Ableitung(z) {
  const wahl = (l) => l[Math.floor(z() * l.length)];
  const art = wahl(["produkt", "kette", "quotient"]);
  let e, text;
  if (art === "produkt") { const a = wahl([1, 2, 3]), c = wahl([-2, -1, 1, 2]); e = `${a === 1 ? "" : a + "*"}x^2*e^(${c}*x)`; text = `${a === 1 ? "" : a}x² · e^(${c === 1 ? "" : c === -1 ? "−" : zahl(c)}x)`; }
  else if (art === "kette") { const a = wahl([2, 3]), b = wahl([-3, -1, 1, 2]), n = wahl([3, 4]); e = `(${a}*x${b < 0 ? "-" : "+"}${Math.abs(b)})^${n}`; text = `(${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)})${hoch[n]}`; }
  else { const a = wahl([1, 2, 3]); e = `(${a === 1 ? "" : a + "*"}x)/(x^2+1)`; text = `${a === 1 ? "" : a}x / (x² + 1)`; }
  const abl = termAbl(e);
  const regel = art === "produkt" ? "Produktregel mit Kettenregel für e^(…)" : art === "kette" ? "Kettenregel: äußere Ableitung mal innere Ableitung" : "Quotientenregel";
  return term("1", "Ableitung", `Gegeben ist die Funktion f mit f(x) = ${text}. Bestimmen Sie die erste Ableitung f'(x).`, e, 3,
    `${regel}: f'(x) = ${huebsch(alsText(abl))}.`);
}

function a1Integral(z) {
  const wahl = (l) => l[Math.floor(z() * l.length)];
  const a = wahl([1, 2, 3]), b = wahl([-2, 1, 2, 4]), k = wahl([1, 2, 3]);
  // ∫0^k (a x² + b) dx = a k³/3 + b k   (exakt als Bruch)
  const zaehler = a * k ** 3 + 3 * b * k, nenner = 3;
  return num("2", "Integral", `Berechnen Sie das Integral ∫₀^${k} (${poly([[a, 2], [b, 0]])}) dx. Geben Sie das Ergebnis als Bruch oder Dezimalzahl an.`,
    [feld("I", zaehler / nenner, 1e-4)], 3,
    `Stammfunktion F(x) = ${a === 3 ? "x³" : `${bruch(a, 3)}·x³`} ${b < 0 ? "−" : "+"} ${koef(Math.abs(b), "x")}; F(${k}) − F(0) = ${bruch(a * k ** 3, 3)} ${b * k < 0 ? "−" : "+"} ${Math.abs(b * k)} = ${bruch(zaehler, nenner)}.`);
}

function a1Gleichung(z) {
  const wahl = (l) => l[Math.floor(z() * l.length)];
  const art = wahl(["efaktor", "kubisch", "lnfaktor"]);
  if (art === "efaktor") {
    const k = wahl([1, 2, 3]);
    return num("3", "Gleichung lösen", `Bestimmen Sie alle Lösungen der Gleichung e^x · (x² − ${k * k}) = 0. Geben Sie die Lösungen der Größe nach an.`,
      [feld("x₁", -k), feld("x₂", k)], 3,
      `e^x ist nie 0, also x² − ${k * k} = 0 ⇒ x² = ${k * k} ⇒ x = −${k} oder x = ${k}. Lösungsmenge {−${k}; ${k}}.`);
  }
  if (art === "kubisch") {
    const k = wahl([1, 2, 3]), m = wahl([1, 2]);
    // m x³ − m k² x = m x (x² − k²)
    return num("3", "Gleichung lösen", `Bestimmen Sie alle Lösungen der Gleichung ${poly([[m, 3], [-m * k * k, 1]])} = 0. Geben Sie die Lösungen der Größe nach an.`,
      [feld("x₁", -k), feld("x₂", 0), feld("x₃", k)], 3,
      `Ausklammern: ${m === 1 ? "" : m}x · (x² − ${k * k}) = 0 ⇒ x = 0 oder x² = ${k * k} ⇒ x = −${k} oder x = ${k}. Lösungsmenge {−${k}; 0; ${k}}.`);
  }
  const k = wahl([2, 3, 4]);
  return num("3", "Gleichung lösen", `Bestimmen Sie alle Lösungen der Gleichung (x − ${k}) · ln(x) = 0.`,
    [feld("x₁", 1), feld("x₂", k)], 3,
    `Ein Produkt ist null, wenn ein Faktor null ist: x − ${k} = 0 ⇒ x = ${k}; ln(x) = 0 ⇒ x = 1. Beide liegen im Definitionsbereich x > 0. Lösungsmenge {1; ${k}}.`);
}

function a1Tangente(z) {
  const wahl = (l) => l[Math.floor(z() * l.length)];
  const a = wahl([1, 2, -1]), c = wahl([-3, -1, 1, 2]), x0 = wahl([-2, -1, 1, 2]);
  const f = (x) => a * x * x + c, fs = (x) => 2 * a * x;
  const m = fs(x0), n = f(x0) - m * x0;
  return num("4", "Tangente", `Gegeben ist f mit f(x) = ${poly([[a, 2], [c, 0]])}. Bestimmen Sie die Gleichung der Tangente an den Graphen von f im Punkt P(${zahl(x0)} | f(${zahl(x0)})) in der Form y = m·x + n.`,
    [feld("m", m), feld("n", n)], 3,
    `f'(x) = ${poly([[2 * a, 1]])}, also m = f'(${zahl(x0)}) = ${zahl(m)}. f(${zahl(x0)}) = ${zahl(f(x0))}; n = ${zahl(f(x0))} − (${zahl(m)})·(${zahl(x0)}) = ${zahl(f(x0))} ${m * x0 < 0 ? "+" : "−"} ${zahl(Math.abs(m * x0))} = ${zahl(n)}. Tangente: y = ${poly([[m, 1], [n, 0]])}.`);
}

function a1Begruenden(z) {
  const wahl = (l) => l[Math.floor(z() * l.length)];
  const art = wahl(["nullstelle", "monoton", "symmetrie"]);
  if (art === "nullstelle") {
    const k = wahl([2, 3, 5]);
    return begruenden("5", "Begründen", `Begründen Sie, dass die Funktion f mit f(x) = x⁴ + ${k} keine Nullstelle hat.`,
      [`x⁴ ≥ 0 für alle x (gerade Potenz)`, `also f(x) = x⁴ + ${k} ≥ ${k} > 0`, "ein Wert, der nie 0 wird, liefert keine Nullstelle (Fazit in einem Satz)"], 3,
      `Für alle x gilt x⁴ ≥ 0, also f(x) ≥ ${k} > 0. Der Funktionswert ist nie 0, f hat keine Nullstelle.`);
  }
  if (art === "monoton") {
    const k = wahl([2, 3, 5]);
    return begruenden("5", "Begründen", `Begründen Sie, dass die Funktion f mit f(x) = x³ + ${k}x auf ganz ℝ streng monoton wachsend ist.`,
      [`f'(x) = 3x² + ${k} gebildet`, `3x² ≥ 0, also f'(x) ≥ ${k} > 0 für alle x`, "positive Ableitung überall ⇒ streng monoton wachsend (Fazit)"], 3,
      `f'(x) = 3x² + ${k}. Wegen 3x² ≥ 0 ist f'(x) ≥ ${k} > 0 für alle x. Eine überall positive Ableitung bedeutet: f ist streng monoton wachsend.`);
  }
  const a = wahl([1, 2]), b = wahl([3, 5]);
  return begruenden("5", "Begründen", `Begründen Sie, dass der Graph der Funktion f mit f(x) = ${a === 1 ? "" : a}x³ − ${b}x punktsymmetrisch zum Ursprung ist.`,
    [`f(−x) berechnet: ${a === 1 ? "" : a}(−x)³ − ${b}(−x) = −${a === 1 ? "" : a}x³ + ${b}x`, "erkannt: f(−x) = −f(x)", "Fazit: nur ungerade Exponenten ⇒ punktsymmetrisch zum Ursprung"], 3,
    `f(−x) = ${a === 1 ? "" : a}(−x)³ − ${b}(−x) = −${a === 1 ? "" : a}x³ + ${b}x = −f(x). Also ist der Graph punktsymmetrisch zum Ursprung.`);
}

/* ======================================================================
   Teil A · Geometrie (ohne Hilfsmittel)
   ====================================================================== */
function a2Ebene(z) {
  const wahl = (l) => l[Math.floor(z() * l.length)];
  for (;;) {
    const A = [wahl([0, 1, 2]), wahl([0, 1, 2]), wahl([0, 1, 3])], B = [wahl([2, 3, 4]), wahl([0, 1]), wahl([0, 2])], Cp = [wahl([0, 1]), wahl([3, 4]), wahl([1, 2])];
    const n = kreuz(vSub(B, A), vSub(Cp, A));
    if (n.every((x) => x === 0) || n.some((x) => Math.abs(x) > 12)) continue;
    const d = skalar(n, A);
    const k = normiereEbene(n, d);
    const p = (P) => `(${P.join(" | ")})`;
    return { id: "6", titel: "Ebene aufstellen", art: "ebene", punkte: 4,
      frage: `Gegeben sind die Punkte A${p(A)}, B${p(B)} und C${p(Cp)}. Bestimmen Sie eine Koordinatengleichung der Ebene E durch A, B und C.`,
      felder: [feld("a", k[0]), feld("b", k[1]), feld("c", k[2]), feld("d", k[3])],
      loesung: `Spannvektoren AB = ${vek(vSub(B, A))} und AC = ${vek(vSub(Cp, A))}; Normalenvektor n = AB × AC = ${vek(n)}. Mit A: d = n·A = ${zahl(d)}. E: ${ebeneText(k)}.` };
  }
}

function a2Lage(z) {
  const wahl = (l) => l[Math.floor(z() * l.length)];
  const art = wahl(["spur", "ortho", "abstand"]);
  if (art === "spur") {
    const P = [wahl([1, 2, 3]), wahl([-2, 1, 2]), wahl([2, 4, 6])], u = [wahl([1, -1, 2]), wahl([1, 2, -2]), wahl([-1, -2])];
    const t = -P[2] / u[2];
    const S = P.map((x, i) => x + t * u[i]);
    return num("7", "Spurpunkt", `Die Gerade g verläuft durch P(${P.join(" | ")}) mit dem Richtungsvektor u = ${vek(u)}. Bestimmen Sie den Schnittpunkt S von g mit der x₁x₂-Ebene.`,
      [feld("s₁", S[0]), feld("s₂", S[1])], 3,
      `In der x₁x₂-Ebene gilt x₃ = 0: ${zahl(P[2])} + t·(${zahl(u[2])}) = 0 ⇒ t = ${zahl(t)}. Einsetzen: S(${S.map(zahl).join(" | ")}).`);
  }
  if (art === "ortho") {
    const u = [wahl([1, 2, 3]), wahl([-2, -1, 2]), wahl([1, 2])];
    const v = [u[1], -u[0], 0];   // senkrecht
    const w = [1, 1, 1];
    const sk = skalar(u, w);
    return num("7", "Orthogonalität", `Gegeben sind die Vektoren u = ${vek(u)}, v = ${vek(v)} und w = ${vek(w)}. Berechnen Sie die Skalarprodukte u·v und u·w und geben Sie an, welcher der Vektoren v, w orthogonal zu u ist (v: 1, w: 2, keiner: 0).`,
      [feld("u·v", 0), feld("u·w", sk), feld("orthogonal", sk === 0 ? 0 : 1)], 3,
      `u·v = ${zahl(u[0])}·${kl(u[1])} + ${kl(u[1])}·${kl(-u[0])} + ${zahl(u[2])}·0 = 0 ⇒ v ⊥ u. u·w = ${zahl(u[0])} ${u[1] < 0 ? "−" : "+"} ${zahl(Math.abs(u[1]))} + ${zahl(u[2])} = ${zahl(sk)}${sk === 0 ? " ⇒ auch w ⊥ u" : " ≠ 0 ⇒ w nicht orthogonal zu u"}.`);
  }
  const n = [wahl([2, 1]), wahl([2, -2]), wahl([1, -1])];
  // Normalenvektor mit Länge 3: (2|2|1) oder (1|2|2)-Varianten
  const nv = Math.abs(n[0]) === 2 && Math.abs(n[1]) === 2 ? [n[0], n[1], 1] : [1, 2, 2];
  const d = wahl([3, 6, 9]), P = [wahl([1, 2, 3]), wahl([0, 1, 2]), wahl([0, 1, 4])];
  const abst = Math.abs(skalar(nv, P) - d) / 3;
  return num("7", "Abstand", `Gegeben sind die Ebene E: ${ebeneText([...nv, d])} und der Punkt P(${P.join(" | ")}). Berechnen Sie den Abstand von P zu E.`,
    [feld("d(P, E)", abst, 1e-4)], 3,
    `|n| = √(${nv.map((x) => x * x).join(" + ")}) = 3. Hessesche Normalenform: d = |${nv[0]}·${P[0]} + ${nv[1]}·${P[1]} + ${nv[2]}·${P[2]} − ${d}| / 3 = |${zahl(skalar(nv, P) - d)}| / 3 = ${bruch(Math.abs(skalar(nv, P) - d), 3)}.`);
}

/* ======================================================================
   Teil A · Stochastik (ohne Hilfsmittel)
   ====================================================================== */
function a3Urne(z) {
  const wahl = (l) => l[Math.floor(z() * l.length)];
  const r = wahl([2, 3, 4]), b = wahl([2, 3]);
  const n = r + b;
  // zweimal ziehen ohne Zurücklegen: P(beide rot), P(genau eine rot)
  const pRR = (r * (r - 1)) / (n * (n - 1));
  const pEine = (2 * r * b) / (n * (n - 1));
  return num("8", "Urne", `In einer Urne liegen ${r} rote und ${b} blaue Kugeln. Es werden nacheinander zwei Kugeln ohne Zurücklegen gezogen. Berechnen Sie die Wahrscheinlichkeit, dass beide Kugeln rot sind, und die Wahrscheinlichkeit, dass genau eine Kugel rot ist. Geben Sie die Ergebnisse als Brüche an.`,
    [feld("P(rr)", pRR, 1e-4), feld("P(genau eine rot)", pEine, 1e-4)], 4,
    `Pfadregel: P(rr) = ${r}/${n} · ${r - 1}/${n - 1} = ${bruch(r * (r - 1), n * (n - 1))}. Genau eine rote Kugel über zwei Pfade: P = ${r}/${n} · ${b}/${n - 1} + ${b}/${n} · ${r}/${n - 1} = ${bruch(2 * r * b, n * (n - 1))}.`);
}

function a3Spiel(z) {
  const wahl = (l) => l[Math.floor(z() * l.length)];
  const einsatz = wahl([1, 2]), g6 = wahl([3, 4, 5]), gGerade = wahl([0, 1]);
  // Würfel: 6 → g6 Auszahlung, andere gerade (2,4) → gGerade, sonst nichts; Erwartungswert der Auszahlung
  const E = (g6 + 2 * gGerade) / 6;
  const netto = E - einsatz;
  return [
    num("9", "Erwartungswert", `Bei einem Spiel wird ein Würfel einmal geworfen. Der Einsatz beträgt ${einsatz} €. Bei einer 6 werden ${g6} € ausgezahlt, bei einer 2 oder 4 werden ${gGerade} € ausgezahlt, sonst nichts. Berechnen Sie den Erwartungswert der Auszahlung X (in €).`,
      [feld("E(X)", E, 1e-4)], 2,
      `E(X) = ${g6}·1/6${gGerade ? ` + ${gGerade}·2/6` : ""} = ${bruch(g6 + 2 * gGerade, 6)} € (die anderen Ergebnisse zahlen 0 € und fallen weg).`),
    begruenden("10", "Faires Spiel", `Begründen Sie, ob das Spiel fair ist.`,
      [`Vergleich Erwartungswert ${zahl(E)} € mit Einsatz ${einsatz} €`, `erwarteter Nettogewinn ${zahl(netto)} € berechnet`, `Schluss: ${netto === 0 ? "gleich 0 ⇒ fair" : "ungleich 0 ⇒ nicht fair (Vorteil " + (netto > 0 ? "Spieler" : "Anbieter") + ")"}`], 2,
      `Erwarteter Nettogewinn = E(X) − Einsatz = ${zahl(E)} − ${einsatz} = ${zahl(netto)} €. ${netto === 0 ? "Er ist 0, das Spiel ist fair." : `Er ist ${netto > 0 ? "positiv" : "negativ"}, das Spiel ist nicht fair.`}`),
  ];
}

/* ======================================================================
   Teil B · Analysis (mit Hilfsmitteln): Sachzusammenhang
   ====================================================================== */
function b1Sach(z) {
  const wahl = (l) => l[Math.floor(z() * l.length)];
  const kontext = wahl([
    { was: "Konzentration eines Medikaments im Blut", einheit: "mg/l", t: "Stunden", ganz: "Die Konzentration eines Medikaments im Blut eines Patienten wird für t ≥ 0 (t in Stunden nach der Einnahme) beschrieben durch" },
    { was: "Wasserstand eines Bachs nach einem Gewitter", einheit: "cm über Normal", t: "Stunden", ganz: "Der Wasserstand eines Bachs über dem Normalpegel wird nach einem Gewitter für t ≥ 0 (t in Stunden) beschrieben durch" },
    { was: "Zufluss in ein Rückhaltebecken", einheit: "m³/min", t: "Minuten", ganz: "Die Zuflussrate in ein Regenrückhaltebecken wird für t ≥ 0 (t in Minuten) beschrieben durch" },
  ]);
  const a = wahl([8, 10, 12, 20]), b = wahl([0.25, 0.5, 0.4]);
  const eingabe = `${a}*x*e^(-${b}*x)`;
  const f = kompiliere(parse(eingabe));
  const tMax = 1 / b, yMax = f(tMax), tW = 2 / b, yW = f(tW);
  const T = wahl([6, 8, 10]);
  const t0 = wahl([1, 2]);
  const simpson = (g, u, v, n = 400) => { const h = (v - u) / n; let s = g(u) + g(v); for (let i = 1; i < n; i++) s += g(u + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };
  const I = simpson(f, 0, T);
  const mw = I / T;
  const fText = `${a}·t·e^(−${zahl(b)}t)`;
  const einzel = { Stunden: "Stunde", Minuten: "Minute" }[kontext.t] || kontext.t;
  const f1Text = `${a}·(1 − ${zahl(b)}t)·e^(−${zahl(b)}t)`, f2Text = `${zahl(a * b)}·(${zahl(b)}t − 2)·e^(−${zahl(b)}t)`;
  return [
    num("1", "Funktionswert", `${kontext.ganz} f(t) = ${fText} (f(t) in ${kontext.einheit}). Berechnen Sie f(${t0}) und runden Sie auf zwei Dezimalen.`,
      [feld(`f(${t0})`, runde(f(t0), 2), 0.011)], 2,
      `f(${t0}) = ${a}·${t0}·e^(−${zahl(b * t0)}) ≈ ${zahl(runde(f(t0), 2))} ${kontext.einheit}.`),
    num("2", "Maximum", `Bestimmen Sie rechnerisch den Zeitpunkt, zu dem f den größten Wert annimmt, und diesen Wert (zwei Dezimalen).`,
      [feld("t", tMax, 1e-3), feld("f(t)", runde(yMax, 2), 0.011)], 3,
      `Produktregel: f'(t) = ${f1Text}. f'(t) = 0 ⇔ 1 − ${zahl(b)}t = 0 ⇔ t = ${zahl(tMax)}. Vorzeichenwechsel von + nach − ⇒ Maximum; f(${zahl(tMax)}) = ${a}·${zahl(tMax)}·e⁻¹ ≈ ${zahl(runde(yMax, 2))} ${kontext.einheit}.`),
    num("3", "Stärkste Abnahme", `Ermitteln Sie den Zeitpunkt, zu dem f am stärksten abnimmt (zwei Dezimalen).`,
      [feld("t", tW, 1e-3)], 3,
      `Stärkste Abnahme = Wendepunkt mit f' minimal: f''(t) = 0 ⇔ t = ${zahl(tW)} (f''(t) = ${f2Text}; Vorzeichenwechsel von − nach + ⇒ dort ist f' minimal). f(${zahl(tW)}) ≈ ${zahl(runde(yW, 2))}.`),
    num("4", "Mittelwert", `Berechnen Sie den mittleren Wert von f im Zeitraum von 0 bis ${T} ${kontext.t} (eine Dezimale).`,
      [feld("Mittelwert", runde(mw, 1), 0.06)], 3,
      `Mittelwert = 1/${T} · ∫₀^${T} f(t) dt ≈ 1/${T} · ${zahl(runde(I, 2))} ≈ ${zahl(runde(mw, 1))} ${kontext.einheit} (Integral mit dem WTR).`),
    begruenden("5", "Interpretieren", `Interpretieren Sie die Bedeutung von f'(${t0}) im Sachzusammenhang und geben Sie das Verhalten von f für t → ∞ an.`,
      [`f'(${t0}) als momentane Änderungsrate (${kontext.was}) zum Zeitpunkt t = ${t0} gedeutet, Einheit ${kontext.einheit} pro ${einzel}`, `Vorzeichen von f'(${t0}) richtig: ${f(t0 + 1e-6) > f(t0 - 1e-6) ? "positiv, der Wert steigt" : "negativ, der Wert sinkt"}`, "für t → ∞ gilt f(t) → 0 (e-Funktion fällt schneller als t wächst), im Sachzusammenhang gedeutet"], 2,
      `f'(${t0}) ist die momentane Änderungsrate zum Zeitpunkt t = ${t0}: So schnell ändert sich die Größe „${kontext.was}“ gerade (in ${kontext.einheit} pro ${einzel}); sie ist ${f(t0 + 1e-6) > f(t0 - 1e-6) ? "positiv" : "negativ"}. Für t → ∞ geht f(t) gegen 0, weil e^(−${zahl(b)}t) schneller fällt, als t wächst: Langfristig bleibt nichts übrig.`),
  ];
}

/* ======================================================================
   Teil B · Geometrie (mit Hilfsmitteln): Pyramide / Dach
   ====================================================================== */
function b2Pyramide(z) {
  const wahl = (l) => l[Math.floor(z() * l.length)];
  const h = wahl([4, 5, 6]), s = wahl([4, 6]), S = [s / 2, s / 2, h];
  const A = [0, 0, 0], B = [s, 0, 0], Cp = [s, s, 0], D = [0, s, 0];
  // Seitenfläche BCS
  const n = kreuz(vSub(Cp, B), vSub(S, B));
  const k = normiereEbene(n, skalar(n, B));
  const winkel = winkelZwischen(n, [0, 0, 1]);
  const kantenlaenge = laenge(vSub(S, A));
  const V = (s * s * h) / 3;
  const p = (P) => `(${P.join(" | ")})`;
  return [
    { id: "1", titel: "Ebene der Seitenfläche", art: "ebene", punkte: 3,
      frage: `Die Pyramide ABCDS hat die quadratische Grundfläche mit A${p(A)}, B${p(B)}, C${p(Cp)}, D${p(D)} und die Spitze S${p(S)} (Längen in m). Bestimmen Sie eine Koordinatengleichung der Ebene, in der die Seitenfläche BCS liegt.`,
      felder: [feld("a", k[0]), feld("b", k[1]), feld("c", k[2]), feld("d", k[3])],
      loesung: `BC = ${vek(vSub(Cp, B))}, BS = ${vek(vSub(S, B))}; n = BC × BS = ${vek(n)}; d = n·B = ${zahl(skalar(n, B))}. E: ${ebeneText(k)}.` },
    num("2", "Neigungswinkel", `Berechnen Sie den Winkel, den die Seitenfläche BCS mit der Grundfläche einschließt (eine Dezimale).`,
      [feld("α", runde(winkel, 1), 0.06)], 2,
      `Normalenvektoren ${vek(k.slice(0, 3))} und (0 | 0 | 1): cos α = |n·e₃| / (|n|·1) = ${zahl(runde(Math.abs(k[2]) / laenge(k.slice(0, 3)), 4))} ⇒ α ≈ ${zahl(runde(winkel, 1))}°.`),
    num("3", "Kante und Volumen", `Berechnen Sie die Länge der Kante AS (zwei Dezimalen) und das Volumen der Pyramide.`,
      [feld("|AS|", runde(kantenlaenge, 2), 0.011), feld("V", V, 1e-3)], 3,
      `|AS| = √(${S[0]}² + ${S[1]}² + ${h}²) = √${zahl(skalar(S, S))} ≈ ${zahl(runde(kantenlaenge, 2))} m. V = 1/3 · G · h = 1/3 · ${s * s} · ${h} = ${zahl(V)} m³.`),
  ];
}

/* ======================================================================
   Teil B · Stochastik (mit Hilfsmitteln): Binomialverteilung und Test
   ====================================================================== */
function b3Binomial(z) {
  const wahl = (l) => l[Math.floor(z() * l.length)];
  const kontext = wahl([
    { was: "Glühlampen aus der Produktion", treffer: "defekt", p: wahl([0.05, 0.1]), n: wahl([50, 100]) },
    { was: "Schüler eines Jahrgangs", treffer: "mit Fahrrad zur Schule", p: wahl([0.3, 0.4]), n: wahl([50, 80]) },
    { was: "Kunden eines Online-Shops", treffer: "Rücksendung", p: wahl([0.2, 0.25]), n: wahl([40, 60]) },
  ]);
  const { n, p } = kontext;
  const t = binomTabelle(n, p), c = kumuliert(t);
  const k1 = Math.round(n * p), k2 = Math.round(n * p * 1.5);
  const alpha = wahl([0.05, 0.1]);
  const r = kritisch(n, p, alpha, "rechts");
  const p1 = Math.min(0.95, p + 0.15);
  const c1 = kumuliert(binomTabelle(n, p1));
  const beta = pBis(c1, r.g - 1);
  const pr = (v) => v.toFixed(4).replace(".", ",");
  return [
    num("1", "Binomialverteilung", `Erfahrungsgemäß sind ${zahl(p * 100)} % aller ${kontext.was} „${kontext.treffer}“. Es werden ${n} zufällig ausgewählt; X sei die Anzahl mit dieser Eigenschaft. Berechnen Sie P(X = ${k1}) und P(X ≥ ${k2}) (vier Dezimalen).`,
      [feld(`P(X = ${k1})`, runde(t[k1], 4), 6e-4), feld(`P(X ≥ ${k2})`, runde(pAb(c, k2), 4), 6e-4)], 3,
      `X ist binomialverteilt mit n = ${n} und p = ${zahl(p)}. P(X = ${k1}) = C(${n}, ${k1})·${zahl(p)}^${k1}·${zahl(1 - p)}^${n - k1} ≈ ${pr(t[k1])}; P(X ≥ ${k2}) = 1 − P(X ≤ ${k2 - 1}) ≈ ${pr(pAb(c, k2))}.`),
    num("2", "Hypothesentest", `Es wird vermutet, dass der Anteil inzwischen größer als ${zahl(p * 100)} % ist. Dazu wird ein Test mit n = ${n} auf dem Signifikanzniveau ${zahl(alpha * 100)} % durchgeführt (H₀: p = ${zahl(p)}, H₁: p > ${zahl(p)}). Bestimmen Sie den Ablehnungsbereich von H₀ in der Form {g; …; ${n}}.`,
      [feld("g", r.g)], 3,
      `Rechtsseitiger Test: gesucht das kleinste g mit P(X ≥ g) ≤ ${zahl(alpha)} für p = ${zahl(p)}. Mit dem WTR: P(X ≥ ${r.g}) ≈ ${pr(pAb(c, r.g))} ≤ ${zahl(alpha)}, P(X ≥ ${r.g - 1}) ≈ ${pr(pAb(c, r.g - 1))} > ${zahl(alpha)}. Ablehnungsbereich {${r.g}; …; ${n}}.`),
    num("3", "Fehler 2. Art", `Tatsächlich beträgt der Anteil ${zahl(p1 * 100)} %. Berechnen Sie die Wahrscheinlichkeit für einen Fehler 2. Art (vier Dezimalen).`,
      [feld("β", runde(beta, 4), 6e-4)], 2,
      `Fehler 2. Art: H₀ wird nicht abgelehnt, obwohl p = ${zahl(p1)} gilt: β = P(X ≤ ${r.g - 1}) mit p = ${zahl(p1)} ≈ ${pr(beta)}.`),
    begruenden("4", "Fehler deuten", `Beschreiben Sie den Fehler 1. Art in diesem Sachzusammenhang und begründen Sie, wie sich eine Vergrößerung von n auf den Fehler 2. Art auswirkt.`,
      [`Fehler 1. Art: H₀ wird abgelehnt, obwohl der Anteil in Wahrheit ${zahl(p * 100)} % beträgt (im Sachzusammenhang formuliert)`, `seine Wahrscheinlichkeit ist höchstens ${zahl(alpha)}`, "größeres n ⇒ Verteilung konzentriert sich enger um n·p ⇒ Fehler 2. Art wird kleiner"], 1,
      `Fehler 1. Art: Man schließt auf einen gestiegenen Anteil, obwohl er bei ${zahl(p * 100)} % liegt; die Wahrscheinlichkeit dafür ist höchstens ${zahl(alpha)}. Mit größerem n streut X relativ weniger um n·p, Ablehnungsbereich und tatsächliche Verteilung überlappen weniger: β sinkt.`),
  ];
}

/* ======================================================================
   Sätze
   ====================================================================== */
export const ANZAHL_SAETZE = 10;
export const BUNDESLAND = "Baden-Württemberg";

export function abiSatz(nr, { zufallsStart } = {}) {
  const z = zufallMit(zufallsStart !== undefined ? zufallsStart : 0x51A7 * nr + 2026);
  const teilA = [
    { id: "A1", titel: "Analysis", teile: [a1Ableitung(z), a1Integral(z), a1Gleichung(z), a1Tangente(z), a1Begruenden(z)] },
    { id: "A2", titel: "Geometrie", teile: [a2Ebene(z), a2Lage(z)] },
    { id: "A3", titel: "Stochastik", teile: [a3Urne(z), ...a3Spiel(z)] },
  ];
  const teilB = [
    { id: "B1", titel: "Analysis", teile: b1Sach(z) },
    { id: "B2", titel: "Geometrie", teile: b2Pyramide(z) },
    { id: "B3", titel: "Stochastik", teile: b3Binomial(z) },
  ];
  const summe = (bl) => bl.reduce((s, b) => s + b.teile.reduce((x, t) => x + t.punkte, 0), 0);
  return {
    nr, titel: `Abi-Satz ${nr}`, bundesland: BUNDESLAND,
    teile: [
      { id: "A", name: "Teil A", hilfsmittel: "ohne Hilfsmittel", minuten: 90, bloecke: teilA, punkte: summe(teilA) },
      { id: "B", name: "Teil B", hilfsmittel: "mit WTR und Formelsammlung", minuten: 180, bloecke: teilB, punkte: summe(teilB) },
    ],
    punkte: summe(teilA) + summe(teilB),
  };
}

export const alleTeile = (satz) => satz.teile.flatMap((t) => t.bloecke.flatMap((b) => b.teile.map((x) => ({ ...x, block: b.id, teilId: t.id }))));

/* ---------- Prüfen ---------- */
const STUETZEN = [-2.3, -1.1, -0.4, 0.37, 0.9, 1.6, 2.8];
/* Zwei Terme sind gleich, wenn sie an allen Stützstellen (im gemeinsamen Definitionsbereich) übereinstimmen */
export function termGleich(sollEingabe, istText) {
  const HOCH = { "²": "^2", "³": "^3", "⁴": "^4", "⁵": "^5", "ˣ": "^x", "⁻¹": "^(-1)" };
  const norm = String(istText || "").replace(/⁻¹/g, "^(-1)").replace(/[²³⁴⁵ˣ]/g, (z) => HOCH[z]).replace(/·/g, "*").replace(/,/g, ".").replace(/−/g, "-").replace(/√\(/g, "sqrt(").replace(/\s+/g, "");
  const bs = parse(String(sollEingabe)), bi = parse(norm);
  if (!bs || !bi) return false;
  const fs = kompiliere(bs), fi = kompiliere(bi);
  let n = 0;
  for (const x of STUETZEN) {
    const a = fs(x), b = fi(x);
    if (!Number.isFinite(a)) continue;
    if (!Number.isFinite(b) || Math.abs(a - b) > 1e-6 * (1 + Math.abs(a))) return false;
    n += 1;
  }
  return n >= 4;
}

/* Prüfen einer Teilaufgabe. eingaben: Zahlen/Texte je Feld; bei "begruenden" die Liste der abgehakten Kriterien (bool) */
export function pruefeAbiTeil(teil, eingaben) {
  if (teil.art === "begruenden") {
    const haken = teil.kriterien.map((_, i) => eingaben[i] === true);
    const n = haken.filter(Boolean).length;
    const punkte = n === teil.kriterien.length ? teil.punkte : Math.floor((teil.punkte * n) / teil.kriterien.length);
    return { punkte, richtig: haken, alle: n === teil.kriterien.length };
  }
  if (teil.art === "term") {
    const ok = termGleich(teil.felder[0].wert, eingaben[0]);
    return { punkte: ok ? teil.punkte : 0, richtig: [ok], alle: ok };
  }
  const werte = teil.felder.map((_, i) => leseZahl(eingaben[i]));
  let richtig;
  if (teil.art === "ebene") {
    const ok = ebeneGleich(teil.felder.map((f) => f.wert), werte);
    richtig = teil.felder.map(() => ok);
  } else richtig = teil.felder.map((f, i) => Number.isFinite(werte[i]) && Math.abs(werte[i] - f.wert) <= f.toleranz);
  const anteil = richtig.filter(Boolean).length / richtig.length;
  const punkte = teil.art === "ebene" || teil.felder.length === 1 ? (anteil === 1 ? teil.punkte : 0) : Math.round(teil.punkte * anteil);
  return { punkte, richtig, alle: richtig.every(Boolean) };
}

/* Für Anzeige: Lösungen aller Felder als Text (Zahlen gerundet, Terme als Klartext) */
export const feldLoesung = (teil, i) => (teil.art === "term" ? termText(teil.felder[i].wert) : zahl(runde(teil.felder[i].wert, 4)));
