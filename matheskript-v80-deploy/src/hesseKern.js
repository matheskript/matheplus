/* ======================================================================
   hesseKern.js – Hesse-Normalenform: reine Logik (kein React)
   · schöne Normalenvektoren (|n⃗| ganzzahlig: (1|2|2), (2|3|6), (0|3|4) …)
   · Punkt-Normalenform → Koordinatenform → HNF (als TeX, Standardschreibweise:
     kein 1x₁, kein + 0, kein + −; Regel A5: jede Zeile endet vereinfacht)
   · Abstand Punkt–Ebene mit Vorzeichen (Seite der Ebene), exakt als Bruch
   · Richtungsvektoren in der Ebene, Lotfußpunkt, Aufgabengenerator + Prüfung
   Brüche aus rechnen2.js. TeX-Ausgabe für M (func3.jsx): \spalte{a}{b}{c}, \vec{…}, \frac, \sqrt.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { ggT, q, qAbs, qAdd, qGleich, qLies, qMul, qNum, qSub, qTex } from "./rechnen2.js";

/* ---------- Vektoren ---------- */
export const skalar = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + 0;   // + 0: nie −0
export const kreuz = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
export const plus = (a, b) => a.map((x, i) => x + b[i]);
export const minusV = (a, b) => a.map((x, i) => x - b[i]);
export const mal = (a, c) => a.map((x) => x * c);
export const laenge = (a) => Math.hypot(a[0], a[1], a[2]);

/* Brüche: Zahl oder {z, n} → {z, n} */
const alsQ = (x) => (typeof x === "number" ? q(x) : x);
export const qSkalar = (a, b) => [0, 1, 2].reduce((s, i) => qAdd(s, qMul(alsQ(a[i]), alsQ(b[i]))), q(0));

/* ---------- schöne Normalenvektoren ---------- */
/* Pythagoreische Quadrupel: a² + b² + c² ist eine Quadratzahl */
export const SCHOENE_NORMALEN = [[1, 2, 2], [2, 3, 6], [1, 4, 8], [2, 6, 9], [0, 3, 4], [4, 4, 7], [0, 5, 12], [3, 4, 12], [6, 6, 7]];

export const betragQuadrat = (n) => skalar(n, n);
/* |n⃗| als ganze Zahl – oder null, wenn die Länge keine ganze Zahl ist */
export function betrag(n) {
  const qq = betragQuadrat(n), r = Math.round(Math.sqrt(qq));
  return r * r === qq ? r : null;
}
/* |n⃗| = s·√w mit quadratfreiem w */
export function betragWurzel(n) {
  let s = 1, w = betragQuadrat(n);
  for (let p = 2; p * p <= w; p++) while (w % (p * p) === 0) { w /= p * p; s *= p; }
  return { s, w };
}

/* Zufallszahlen: zufall() ∈ [0, 1) – austauschbar für Tests */
const ganzZ = (zufall, a, b) => a + Math.floor(zufall() * (b - a + 1));
const wahl = (zufall, l) => l[Math.floor(zufall() * l.length)];

/* Schöner Normalenvektor: Quadrupel mischen, Vorzeichen würfeln, selten ·2 */
export function zufallsNormale(zufall = Math.random, { faktor = true } = {}) {
  const v = [...wahl(zufall, SCHOENE_NORMALEN)];
  for (let i = 2; i > 0; i--) { const j = Math.floor(zufall() * (i + 1)); [v[i], v[j]] = [v[j], v[i]]; }
  const n = v.map((x) => (x !== 0 && zufall() < 0.5 ? -x : x));
  return faktor && Math.max(...n.map(Math.abs)) <= 4 && zufall() < 0.2 ? mal(n, 2) : n;
}

/* ---------- Ebene ---------- */
/* Punkt-Normalenform (x⃗ − p⃗)·n⃗ = 0  →  n⃗·x⃗ = d mit d = n⃗·p⃗ */
export const dAusPunkt = (n, p) => skalar(n, p);

/* Zwei kurze ganzzahlige Richtungsvektoren der Ebene (beide ⟂ n⃗, nicht parallel) */
export function ebenenBasis(n) {
  const kand = [];
  for (const [i, j] of [[0, 1], [0, 2], [1, 2]]) {
    const v = [0, 0, 0];
    v[i] = n[j]; v[j] = -n[i];
    if (v.every((x) => x === 0)) continue;
    const g = v.reduce((a, x) => ggT(a, x), 0) || 1;
    let w = v.map((x) => x / g);
    if (w.find((x) => x !== 0) < 0) w = mal(w, -1);
    kand.push(w);
  }
  kand.sort((a, b) => skalar(a, a) - skalar(b, b));
  const u = kand[0];
  const v = kand.find((w) => kreuz(u, w).some((x) => x !== 0));
  return [u, v];
}

/* Orthonormale Basis der Ebene (Zahlen, fürs Bild) */
export function orthoBasis(n) {
  const L = laenge(n), e = mal(n, 1 / L);
  const hilf = Math.abs(e[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  let e1 = kreuz(e, hilf); e1 = mal(e1, 1 / laenge(e1));
  const e2 = kreuz(e, e1);
  return [e1, e2];
}

/* Wert der linken Seite minus d: n⃗·q⃗ − d (Bruch) */
export const einsetzWert = (n, d, Q) => qSub(qSkalar(n, Q), q(d));

/* Abstand mit Vorzeichen (n⃗·q⃗ − d)/|n⃗| – exakt als Bruch, wenn |n⃗| ganz ist, sonst null */
export function abstandExakt(n, d, Q) {
  const b = betrag(n);
  if (b === null) return null;
  const z = einsetzWert(n, d, Q);
  return q(z.z + 0, z.n * b);   // + 0: nie −0
}
export const abstandZahl = (n, d, Q) => qNum(einsetzWert(n, d, Q)) / laenge(n);

/* Seite der Ebene: „ueber“ = in Richtung n⃗, „unter“ = Gegenseite, „in“ = in der Ebene */
export function seite(n, d, Q) {
  const z = einsetzWert(n, d, Q);
  return z.z === 0 ? "in" : z.z > 0 ? "ueber" : "unter";
}

/* Lotfußpunkt F = Q − δ·n⃗₀ (Zahlen) */
export function lotfuss(n, d, Q) {
  const Qz = Q.map((x) => qNum(alsQ(x)));
  const t = (skalar(n, Qz) - d) / betragQuadrat(n);
  return Qz.map((x, i) => x - t * n[i]);
}

/* Q = P + w mit n⃗·w⃗ = z, |wᵢ| ≤ grenze; kurze w⃗ bevorzugt (null, wenn keiner gefunden) */
export function punktMitWert(n, P, z, { grenze = 4, ohneNull = true } = {}) {
  let best = null;
  for (let a = -grenze; a <= grenze; a++) for (let b = -grenze; b <= grenze; b++) for (let c = -grenze; c <= grenze; c++) {
    const w = [a, b, c];
    if (ohneNull && a === 0 && b === 0 && c === 0) continue;
    if (skalar(n, w) !== z) continue;
    const L = skalar(w, w);
    if (!best || L < best.L) best = { w, L };
  }
  return best ? plus(P, best.w) : null;
}

/* ---------- Darstellung (TeX für M) ---------- */
export const zahl = (x) => (typeof x === "number" ? String(x).replace("-", "−") : qTex(x));
/* in Klammern, wenn negativ (für Produkte und eingesetzte Werte) */
export const kl = (x) => { const w = typeof x === "number" ? x : qNum(x); return w < 0 ? `(${zahl(x)})` : zahl(x); };

export const X_TEX = ["x_1", "x_2", "x_3"];
export const X_TEXT = ["x₁", "x₂", "x₃"];

/* Linearer Term in Standardschreibweise: 2x₁ − x₂ + 3, ohne 1x, 0x, + 0, + − */
export function termTex(koeff, vars = X_TEX, konst = 0) {
  const teile = [];
  koeff.forEach((c, i) => {
    if (c === 0) return;
    const b = Math.abs(c) === 1 ? "" : String(Math.abs(c));
    teile.push({ neg: c < 0, t: `${b}${vars[i]}` });
  });
  if (konst !== 0) teile.push({ neg: konst < 0, t: String(Math.abs(konst)) });
  if (!teile.length) return "0";
  return teile.map((s, i) => (i === 0 ? (s.neg ? "−" : "") + s.t : ` ${s.neg ? "−" : "+"} ${s.t}`)).join("");
}
export const koordTex = (n, d) => `${termTex(n)} = ${zahl(d)}`;
export const koordText = (n, d) => `${termTex(n, X_TEXT)} = ${zahl(d)}`;

export const spalteTex = (v) => `\\spalte{${zahl(v[0])}}{${zahl(v[1])}}{${zahl(v[2])}}`;

/* |n⃗| als TeX: „3“, „\sqrt{14}“, „2\sqrt{3}“ */
export function betragTex(n) {
  const { s, w } = betragWurzel(n);
  if (w === 1) return String(s);
  return `${s === 1 ? "" : s}\\sqrt{${w}}`;
}

/* (x⃗ − p⃗)·n⃗ = 0 */
export function normalenformTex(n, p) {
  const nullP = p.every((x) => (typeof x === "number" ? x === 0 : x.z === 0));
  return nullP ? `\\vec{x} \\cdot ${spalteTex(n)} = 0` : `\\left(\\vec{x} − ${spalteTex(p)}\\right) \\cdot ${spalteTex(n)} = 0`;
}

/* n⃗₀ = 1/|n⃗| · n⃗ */
export function n0Tex(n) {
  const b = betragTex(n);
  return b === "1" ? spalteTex(n) : `\\frac{1}{${b}} \\cdot ${spalteTex(n)}`;
}

/* HNF in Vektorform: (x⃗ − p⃗)·n⃗₀ = 0 */
export function hnfVektorTex(n, p) {
  const nullP = p.every((x) => (typeof x === "number" ? x === 0 : x.z === 0));
  return `${nullP ? "\\vec{x}" : `\\left(\\vec{x} − ${spalteTex(p)}\\right)`} \\cdot ${n0Tex(n)} = 0`;
}

/* HNF in Koordinatenform: (n₁x₁ + n₂x₂ + n₃x₃ − d)/|n⃗| = 0 */
export function hnfTex(n, d) {
  const z = termTex(n, X_TEX, -d), b = betragTex(n);
  return b === "1" ? `${z} = 0` : `\\frac{${z}}{${b}} = 0`;
}

/* Skalarprodukt ausgeschrieben: 1·2 + 2·(−1) + 2·3 */
export const skalarTex = (a, b) => [0, 1, 2].map((i) => `${kl(a[i])} \\cdot ${kl(b[i])}`).join(" + ");

/* Zähler der HNF mit eingesetztem Punkt: x₁ + 2x₂ − 2x₃ − 6 → 4 + 2·(−1) − 2·3 − 6 */
export function einsetzTex(n, d, Q) {
  const teile = [];
  n.forEach((c, i) => {
    if (c === 0) return;
    const a = Math.abs(c);
    const erster = teile.length === 0;
    const wert = a === 1 ? (erster && c > 0 ? zahl(Q[i]) : kl(Q[i])) : `${a} \\cdot ${kl(Q[i])}`;
    teile.push(erster ? (c < 0 ? "−" : "") + wert : ` ${c < 0 ? "−" : "+"} ${wert}`);
  });
  if (d !== 0) teile.push(` ${d > 0 ? "−" : "+"} ${Math.abs(d)}`);
  return teile.join("") || "0";
}

/* Bruch z/b als Kette bis zur Endform: „\frac{6}{3} = 2“, „−\frac{2}{3}“, „\frac{6}{9} = \frac{2}{3}“, „0“ */
export function bruchKette(z, b) {
  if (z === 0) return "0";
  if (b === 1) return zahl(z);
  const vz = z < 0 ? "−" : "", a = Math.abs(z);
  const roh = `${vz}\\frac{${a}}{${b}}`;
  const red = q(z, b);
  return red.n === b ? roh : `${roh} = ${zahl(red)}`;
}

/* Abstand mit Vorzeichen als Gleichungskette: \frac{einsetzen}{|n|} = … */
export function abstandTex(n, d, Q) {
  const b = betrag(n);
  const z = einsetzWert(n, d, Q);
  const ein = einsetzTex(n, d, Q);
  if (b === null) return `\\frac{${ein}}{${betragTex(n)}} = \\frac{${zahl(z)}}{${betragTex(n)}}`;
  if (b === 1) return `${ein} = ${zahl(z)}`;
  if (z.n !== 1) return `\\frac{${ein}}{${b}} = ${zahl(q(z.z, z.n * b))}`;
  return `\\frac{${ein}}{${b}} = ${bruchKette(z.z, b)}`;
}

/* |n⃗| ausgerechnet: \sqrt{1^2 + 2^2 + (−2)^2} = \sqrt{9} = 3 */
export function betragKette(n) {
  const unter = n.map((x) => `${kl(x)}^2`).join(" + ");
  const qq = betragQuadrat(n), b = betragTex(n);
  return `|\\vec{n}| = \\sqrt{${unter}} = \\sqrt{${qq}}${b === `\\sqrt{${qq}}` ? "" : ` = ${b}`}`;
}

export const LAGE_TEXT = {
  ueber: "Q liegt auf der Seite, in die der Normalenvektor zeigt („über“ E).",
  unter: "Q liegt auf der Gegenseite („unter“ E).",
  in: "Q liegt in der Ebene E.",
};

/* ---------- Aufgaben ---------- */

/* Eine Übungsaufgabe: Ebene in Koordinaten- oder Normalenform, Punkt Q, Abstand mit Vorzeichen.
   Alle Koordinaten ganz und |·| ≤ 9, |n⃗| ganz, der Abstand ist ganz oder ein Bruch mit Nenner |n⃗|. */
export function aufgabe(zufall = Math.random, { form } = {}) {
  for (let versuch = 0; versuch < 500; versuch++) {
    const n = zufallsNormale(zufall);
    const b = betrag(n);
    const P = [ganzZ(zufall, -3, 3), ganzZ(zufall, -3, 3), ganzZ(zufall, -3, 3)];
    const d = skalar(n, P);
    if (Math.abs(d) > 40) continue;
    const r = zufall();
    const lage = r < 0.4 ? "ueber" : r < 0.8 ? "unter" : "in";
    let z = 0;
    if (lage !== "in") {
      const ganzerAbstand = zufall() < 0.6;
      let betragZ;
      if (ganzerAbstand) betragZ = b * ganzZ(zufall, 1, b >= 9 ? 1 : b >= 5 ? 2 : 3);
      else { do betragZ = ganzZ(zufall, 1, 2 * b); while (betragZ % b === 0); }
      z = lage === "ueber" ? betragZ : -betragZ;
    }
    // zufälliger kurzer Verschiebungsvektor w mit n⃗·w⃗ = z (alle Kandidaten sammeln, einen ziehen –
    // so bleibt die gewürfelte Lage erhalten und „in der Ebene“ wird nicht bevorzugt)
    const kandidaten = [];
    for (let x = -4; x <= 4; x++) for (let y = -4; y <= 4; y++) for (let w3 = -4; w3 <= 4; w3++) {
      const w = [x, y, w3];
      if (skalar(n, w) !== z || (x === 0 && y === 0 && w3 === 0)) continue;
      const Qk = plus(P, w);
      if (Qk.every((c) => Math.abs(c) <= 9)) kandidaten.push(Qk);
    }
    if (!kandidaten.length) continue;
    const Q = wahl(zufall, kandidaten);
    const f = form || (zufall() < 0.5 ? "koord" : "normal");
    return { form: f, n, b, P, d, Q, zaehler: z, abstand: q(z, b), lage };
  }
  // Rückfall (praktisch nie): feste Aufgabe
  return { form: "koord", n: [1, 2, 2], b: 3, P: [2, 1, 1], d: 6, Q: [3, 3, 3], zaehler: 9, abstand: q(3), lage: "ueber" };
}

/* Vollständiger Rechenweg als TeX-Zeilen: [{ titel, zeilen: [tex], text? }] */
export function rechenweg(a) {
  const { n, P, d, Q } = a;
  const schritte = [];
  if (a.form === "normal") {
    schritte.push({
      titel: "Koordinatenform: Ausmultiplizieren, d = n⃗ · p⃗",
      zeilen: [`d = ${skalarTex(n, P)} = ${zahl(d)}`, `E: ${koordTex(n, d)}`],
    });
  }
  schritte.push({ titel: "Länge des Normalenvektors", zeilen: [betragKette(n)] });
  schritte.push({ titel: "Hesse-Normalenform: durch |n⃗| teilen", zeilen: [`E: ${hnfTex(n, d)}`] });
  schritte.push({ titel: "Q einsetzen: Abstand mit Vorzeichen", zeilen: [`\\delta = ${abstandTex(n, d, Q)}`] });
  const ab = a.abstand;
  schritte.push({
    titel: "Vorzeichen deuten",
    text: ab.z === 0 ? "Das Ergebnis ist 0: Q erfüllt die Ebenengleichung." : ab.z > 0
      ? "Positiv: Q liegt auf der Seite, in die n⃗ zeigt." : "Negativ: Q liegt auf der Gegenseite von n⃗.",
    zeilen: [ab.z === 0 ? "d(Q; E) = 0" : `d(Q; E) = |${zahl(ab)}| = ${zahl(qAbs(ab))}`],
  });
  return schritte;
}

/* Eingaben prüfen. eingaben: { betrag, d, abstand } als Text; Ergebnis je Feld true/false/null (leer) + Hinweis */
export function pruefe(a, eingaben) {
  const lies = (s) => (String(s ?? "").trim() === "" ? undefined : qLies(s));
  const out = { felder: {}, hinweise: [] };
  const bE = lies(eingaben.betrag);
  out.felder.betrag = bE === undefined ? null : !!bE && qGleich(bE, q(a.b));
  if (out.felder.betrag === false) out.hinweise.push(`|n⃗| = √(n₁² + n₂² + n₃²) – quadriere jede Koordinate, auch die negativen.`);
  if (a.form === "normal") {
    const dE = lies(eingaben.d);
    out.felder.d = dE === undefined ? null : !!dE && qGleich(dE, q(a.d));
    if (out.felder.d === false) out.hinweise.push(dE && qGleich(dE, q(-a.d)) ? "Bei d stimmt das Vorzeichen nicht: d = n⃗ · p⃗ (nicht −n⃗ · p⃗)." : "d bekommst du, indem du den Aufpunkt einsetzt: d = n⃗ · p⃗.");
  }
  if (eingaben.zaehler !== undefined) {
    const zE = lies(eingaben.zaehler);
    out.felder.zaehler = zE === undefined ? null : !!zE && qGleich(zE, q(a.zaehler));
    if (out.felder.zaehler === false) out.hinweise.push(zE && qGleich(zE, q(-a.zaehler))
      ? "Beim Zähler stimmt das Vorzeichen nicht: erst n⃗ · q⃗ ausrechnen, dann d abziehen."
      : "Zähler: Koordinaten von Q in n₁x₁ + n₂x₂ + n₃x₃ einsetzen und d abziehen.");
  }
  const aE = lies(eingaben.abstand);
  if (aE === undefined) out.felder.abstand = null;
  else if (!aE) { out.felder.abstand = false; out.hinweise.push("Den Abstand bitte als ganze Zahl, Bruch (z. B. −2/3) oder Dezimalzahl eintragen."); }
  else {
    out.felder.abstand = qGleich(aE, a.abstand);
    if (!out.felder.abstand) {
      if (qGleich(aE, q(-a.abstand.z, a.abstand.n)) && a.abstand.z !== 0) out.hinweise.push("Der Betrag stimmt, das Vorzeichen nicht. In der HNF steht n⃗·x⃗ − d im Zähler – nicht d − n⃗·x⃗.");
      else if (qGleich(aE, q(a.zaehler))) out.hinweise.push("Fast: Das ist n⃗·q⃗ − d. In der HNF wird noch durch |n⃗| geteilt.");
      else if (qGleich(aE, qAbs(a.abstand))) out.hinweise.push("Das ist der Abstand ohne Vorzeichen. Gefragt ist der Wert mit Vorzeichen – er verrät die Seite.");
      else out.hinweise.push("Setze die Koordinaten von Q in die HNF ein: (n₁q₁ + n₂q₂ + n₃q₃ − d) / |n⃗|.");
    }
  }
  const werte = Object.values(out.felder);
  out.vollstaendig = werte.every((w) => w !== null);
  out.alleRichtig = out.vollstaendig && werte.every((w) => w === true);
  return out;
}

/* ---------- Beispielebenen für Entdecken ---------- */
/* n⃗, Aufpunkt P, kurze Richtungsvektoren u⃗, v⃗ und ein Startpunkt Q mit ganzzahligem Abstand */
export function beispielEbene(n, P) {
  const b = betrag(n);
  const [u, v] = ebenenBasis(n);
  const d = skalar(n, P);
  const Q0 = punktMitWert(n, P, 2 * b, { grenze: 3 }) || punktMitWert(n, P, b, { grenze: 3 }) || plus(P, n);
  // seitlich versetzt (u⃗ ⟂ n⃗ ändert den Abstand nicht): Lot und n⃗₀ liegen im Bild nicht übereinander
  const Q = Q0.map((x, i) => x + 2 * u[i]).every((x) => Math.abs(x) <= 6) ? Q0.map((x, i) => x + 2 * u[i]) : Q0;
  return { n, b, P, d, u, v, Q };
}
export const BEISPIEL_EBENEN = [
  { id: "a", name: "n⃗ = (1 | 2 | 2)", ...beispielEbene([1, 2, 2], [2, 1, 1]) },
  { id: "b", name: "n⃗ = (2 | 3 | 6)", ...beispielEbene([2, 3, 6], [1, 2, 0]) },
  { id: "c", name: "n⃗ = (0 | 3 | 4)", ...beispielEbene([0, 3, 4], [1, 0, 2]) },
];

/* Punkt X = P + s·u⃗ + t·v⃗ + h·n⃗₀ (h in Längeneinheiten) – exakt als Brüche, wenn |n⃗| ganz ist */
export function punktX(e, s, t, h = 0) {
  return e.P.map((p, i) => qAdd(q(p + s * e.u[i] + t * e.v[i]), q(h * e.n[i], e.b)));
}
