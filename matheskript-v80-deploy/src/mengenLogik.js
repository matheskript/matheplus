/* ======================================================================
   mengenLogik.js – Aufgaben für „Mengen und Logik“ (Bereich Fundament)
   Fünf Kapitel: Mengen und Elemente · Mengenoperationen · Intervalle ·
   Aussagen und Verknüpfungen · Folgern und Beweisen.
   Datenformat wie ungleichGen.js ({ art, text, schritte, pruef }).
   Zahlschritte mit gegen: [A, B] verlangen ein Gegenbeispiel n mit A(n) und
   nicht B(n) – das UI liest dann jede passende Zahl als richtig.
   Kein React, Node-testbar (tests/mengenLogik.test.mjs).
   ====================================================================== */
import { LEER, enthaelt, ganz, iv, mengeTex, mengenOptionen, mischen, ver, wahlAus, zTex } from "./mengenRechnen.js";

const T = (de, en) => [de, en];
const zahl = (id, titel, frage, text, wert, o = {}) => ({ typ: "zahl", id, titel, frage, text, wert, ...o, fehler: (o.fehler || []).filter((f) => Math.abs(f.wert - wert) > 1e-9) });
const wahl = (id, titel, frage, optionen, richtig, o = {}) => ({ typ: "wahl", id, titel, frage, optionen, richtig, ...o,
  fehler: (o.fehler || []).filter((f) => f.wahl !== richtig && optionen.some((op) => op[0] === f.wahl)) });
const dreh = (l, k) => { const n = l.length; const s = ((k % n) + n) % n; return [...l.slice(s), ...l.slice(0, s)]; };
const WF = () => [["w", T("wahr", "true")], ["f", T("falsch", "false")]];
const JN = () => [["ja", T("ja", "yes")], ["nein", T("nein", "no")]];

/* ---------- Eigenschaften natürlicher Zahlen ---------- */
const istPrim = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
const istQuadrat = (n) => Math.round(Math.sqrt(n)) ** 2 === n;
/* Je Eigenschaft: de (Hauptsatz), wenn (Nebensatz), dann (nach „dann“), nicht (verneint), en, enNicht */
const E = (de, wenn, dann, nicht, en, enNicht, f) => ({ de, wenn, dann, nicht, en, enNicht, f });
export const P = {
  gerade: E("x ist gerade", "x gerade ist", "ist x gerade", "x ist ungerade", "x is even", "x is odd", (n) => n % 2 === 0),
  ungerade: E("x ist ungerade", "x ungerade ist", "ist x ungerade", "x ist gerade", "x is odd", "x is even", (n) => n % 2 === 1),
  prim: E("x ist eine Primzahl", "x eine Primzahl ist", "ist x eine Primzahl", "x ist keine Primzahl", "x is a prime", "x is not a prime", istPrim),
  prim2: E("x ist eine Primzahl größer als 2", "x eine Primzahl größer als 2 ist", "ist x eine Primzahl größer als 2", "x ist keine Primzahl größer als 2", "x is a prime greater than 2", "x is not a prime greater than 2", (n) => istPrim(n) && n > 2),
  v3: E("x ist durch 3 teilbar", "x durch 3 teilbar ist", "ist x durch 3 teilbar", "x ist nicht durch 3 teilbar", "x is divisible by 3", "x is not divisible by 3", (n) => n % 3 === 0),
  v4: E("x ist durch 4 teilbar", "x durch 4 teilbar ist", "ist x durch 4 teilbar", "x ist nicht durch 4 teilbar", "x is divisible by 4", "x is not divisible by 4", (n) => n % 4 === 0),
  v5: E("x ist durch 5 teilbar", "x durch 5 teilbar ist", "ist x durch 5 teilbar", "x ist nicht durch 5 teilbar", "x is divisible by 5", "x is not divisible by 5", (n) => n % 5 === 0),
  v6: E("x ist durch 6 teilbar", "x durch 6 teilbar ist", "ist x durch 6 teilbar", "x ist nicht durch 6 teilbar", "x is divisible by 6", "x is not divisible by 6", (n) => n % 6 === 0),
  v10: E("x ist durch 10 teilbar", "x durch 10 teilbar ist", "ist x durch 10 teilbar", "x ist nicht durch 10 teilbar", "x is divisible by 10", "x is not divisible by 10", (n) => n % 10 === 0),
  g3: E("x ist gerade und durch 3 teilbar", "x gerade und durch 3 teilbar ist", "ist x gerade und durch 3 teilbar", "x ist ungerade oder nicht durch 3 teilbar", "x is even and divisible by 3", "x is odd or not divisible by 3", (n) => n % 2 === 0 && n % 3 === 0),
  g5: E("x ist gerade und durch 5 teilbar", "x gerade und durch 5 teilbar ist", "ist x gerade und durch 5 teilbar", "x ist ungerade oder nicht durch 5 teilbar", "x is even and divisible by 5", "x is odd or not divisible by 5", (n) => n % 2 === 0 && n % 5 === 0),
  qgerade: E("x² ist gerade", "x² gerade ist", "ist x² gerade", "x² ist ungerade", "x² is even", "x² is odd", (n) => (n * n) % 2 === 0),
  t12: E("x ist ein Teiler von 12", "x ein Teiler von 12 ist", "ist x ein Teiler von 12", "x ist kein Teiler von 12", "x is a divisor of 12", "x is not a divisor of 12", (n) => 12 % n === 0),
  t24: E("x ist ein Teiler von 24", "x ein Teiler von 24 ist", "ist x ein Teiler von 24", "x ist kein Teiler von 24", "x is a divisor of 24", "x is not a divisor of 24", (n) => 24 % n === 0),
  t30: E("x ist ein Teiler von 30", "x ein Teiler von 30 ist", "ist x ein Teiler von 30", "x ist kein Teiler von 30", "x is a divisor of 30", "x is not a divisor of 30", (n) => 30 % n === 0),
  quad: E("x ist eine Quadratzahl", "x eine Quadratzahl ist", "ist x eine Quadratzahl", "x ist keine Quadratzahl", "x is a square number", "x is not a square number", istQuadrat),
  ziff: E("x endet auf 0", "x auf 0 endet", "endet x auf 0", "x endet nicht auf 0", "x ends in 0", "x does not end in 0", (n) => n % 10 === 0),
};
/* „x“ am Satzanfang bzw. im Satz durch eine Zahl ersetzen */
const mit = (t, n) => t.replace(/\bx\b/, String(n));
/* Folgerung als Satz: „Wenn x gerade ist, dann ist x durch 4 teilbar.“ */
export const wennDann = (a, b) => T(`Wenn ${P[a].wenn}, dann ${P[b].dann}.`, `If ${P[a].en}, then ${P[b].en}.`);
const BIS = 400;
/* kleinstes Gegenbeispiel zu A ⇒ B (n ≤ 400) oder null */
export function gegenbeispiel(a, b) {
  for (let n = 1; n <= BIS; n++) if (P[a].f(n) && !P[b].f(n)) return n;
  return null;
}
export const folgt = (a, b) => gegenbeispiel(a, b) === null;
const pd = (id) => T(P[id].de, P[id].en);
const listeTex = (l) => (l.length ? `\\{${l.join("; ")}\\}` : "\\emptyset");

/* ======================================================================
   KAPITEL 1 · MENGEN UND ELEMENTE
   ====================================================================== */
export const ME_ARTEN = ["element", "aufzaehlen", "beschreiben", "teilmenge"];

function element(z) {
  const id = wahlAus(["gerade", "prim", "v3", "v4", "t24", "t30", "quad"], z);
  let n = ganz(1, 40, z);
  if (z() < 0.5) { for (let i = 0; i < 50 && !P[id].f(n); i++) n = ganz(1, 40, z); }
  const drin = P[id].f(n);
  return {
    art: "element",
    text: T(`Gegeben ist $A = \\{x \\in \\mathbb{N} \\mid$ ${P[id].de}$\\}$.`, `Let $A = \\{x \\in \\mathbb{N} \\mid$ ${P[id].en}$\\}$.`),
    schritte: [wahl("me-e", T("Element?", "Element?"), T(`Gilt $${n} \\in A$ oder $${n} \\notin A$?`, `Is $${n} \\in A$ or $${n} \\notin A$?`), [["in", `$${n} \\in A$`], ["nicht", `$${n} \\notin A$`]], drin ? "in" : "nicht", {
      hinweis: T(`Setze ${n} für x ein: Ist die Aussage wahr?`, `Substitute ${n} for x: is the statement true?`),
      erkl: T(`„${mit(P[id].de, n)}“ ist ${drin ? "wahr" : "falsch"}, also $${n} ${drin ? "\\in" : "\\notin"} A$.`, `“${mit(P[id].en, n)}” is ${drin ? "true" : "false"}, so $${n} ${drin ? "\\in" : "\\notin"} A$.`) })],
    pruef: { n, drin, id },
  };
}

function aufzaehlen(z) {
  const typ = ganz(0, 1, z);
  if (typ === 0) {
    const N = wahlAus([12, 18, 20, 24, 28, 30, 36, 40], z);
    const l = []; for (let d = 1; d <= N; d++) if (N % d === 0) l.push(d);
    return { art: "aufzaehlen",
      text: T(`$T = \\{x \\in \\mathbb{N} \\mid x \\text{ teilt } ${N}\\}$. Schreibe T in aufzählender Form.`, `$T = \\{x \\in \\mathbb{N} \\mid x \\text{ divides } ${N}\\}$. Write T by listing its elements.`),
      schritte: [zahl("me-a", T("Anzahl der Elemente", "Number of elements"), T("Wie viele Elemente hat T?", "How many elements does T have?"), "$|T| =$", l.length, {
        fehler: [{ wert: l.length - 2, text: T(`1 und ${N} selbst sind auch Teiler von ${N}.`, `1 and ${N} itself are divisors of ${N} too.`) }],
        hinweis: T("Teiler kommen in Paaren: 1 · " + N + ", 2 · …", "Divisors come in pairs: 1 · " + N + ", 2 · …"),
        erkl: `$T = ${listeTex(l)}$` })],
      pruef: { liste: l, f: (d) => N % d === 0 } };
  }
  const k = wahlAus([3, 4, 6, 7], z), M = ganz(20, 50, z);
  const l = []; for (let v = k; v < M; v += k) l.push(v);
  return { art: "aufzaehlen",
    text: T(`$V = \\{x \\in \\mathbb{N} \\mid x \\text{ ist Vielfaches von } ${k} \\text{ und } x < ${M}\\}$.`, `$V = \\{x \\in \\mathbb{N} \\mid x \\text{ is a multiple of } ${k} \\text{ and } x < ${M}\\}$.`),
    schritte: [zahl("me-a", T("Anzahl der Elemente", "Number of elements"), T("Wie viele Elemente hat V?", "How many elements does V have?"), "$|V| =$", l.length, {
      fehler: [{ wert: l.length + 1, text: T(`„x < ${M}“: ${M} selbst gehört nicht dazu – und 0 ist kein Element von ℕ.`, `“x < ${M}”: ${M} itself is not included – and 0 is not in ℕ.`) }],
      hinweis: T(`${k}, ${2 * k}, ${3 * k}, … solange kleiner als ${M}.`, `${k}, ${2 * k}, ${3 * k}, … as long as less than ${M}.`),
      erkl: `$V = ${listeTex(l)}$` })],
    pruef: { liste: l, f: (v) => v % k === 0 && v < M } };
}

function beschreiben(z) {
  const kand = ["gerade", "ungerade", "prim", "v3", "v4", "v5", "t12", "t24", "quad"];
  const id = wahlAus(kand, z);
  const G = 20;
  const l = []; for (let n = 1; n <= G; n++) if (P[id].f(n)) l.push(n);
  const schluessel = (x) => { const m = []; for (let n = 1; n <= G; n++) if (P[x].f(n)) m.push(n); return m.join(","); };
  const andere = mischen(kand.filter((x) => x !== id && schluessel(x) !== schluessel(id)), z).slice(0, 3);
  const opt = mischen([id, ...andere], z).map((x) => [x, pd(x)]);
  return {
    art: "beschreiben",
    text: T(`Grundmenge $G = \\{1; 2; …; 20\\}$ und $A = ${listeTex(l)}$.`, `Universe $G = \\{1; 2; …; 20\\}$ and $A = ${listeTex(l)}$.`),
    schritte: [wahl("me-b", T("Beschreibende Form", "Set-builder form"), T("Welche Eigenschaft beschreibt A? $A = \\{x \\in G \\mid … \\}$", "Which property describes A? $A = \\{x \\in G \\mid … \\}$"), opt, id, {
      hinweis: T("Prüfe jede Eigenschaft an zwei, drei Elementen – und an einer Zahl, die fehlt.", "Test each property on two or three elements – and on a number that is missing."),
      erkl: T(`$A = \\{x \\in G \\mid$ ${P[id].de}$\\}$`, `$A = \\{x \\in G \\mid$ ${P[id].en}$\\}$`) })],
    pruef: { liste: l, f: P[id].f, G },
  };
}

/* A ⊆ B? – bewusst gemischt: echte Teilmengen und typische Fallen */
const TEILMENGEN = [["v6", "v3"], ["v6", "gerade"], ["v4", "gerade"], ["t12", "t24"], ["v10", "v5"], ["prim2", "ungerade"],
  ["gerade", "v4"], ["v3", "v6"], ["prim", "ungerade"], ["t24", "t12"], ["v5", "v10"], ["quad", "gerade"], ["ungerade", "prim"], ["t30", "t24"]];
function teilmenge(z) {
  const [a, b] = wahlAus(TEILMENGEN, z);
  const g = gegenbeispiel(a, b);
  const ja = g === null;
  const schritte = [wahl("me-t1", T("Teilmenge?", "Subset?"), T("Gilt $A \\subseteq B$?", "Is $A \\subseteq B$?"), JN(), ja ? "ja" : "nein", {
    hinweis: T("A ⊆ B heißt: Jedes Element von A liegt auch in B. Ein einziges Element von A, das nicht in B liegt, widerlegt das.", "A ⊆ B means: every element of A is also in B. A single element of A that is not in B disproves it."),
    erkl: ja ? T(`Ja – wenn ${P[a].wenn}, dann ${P[b].dann}. Es gibt kein Gegenbeispiel.`, `Yes – if ${P[a].en}, then ${P[b].en}. There is no counterexample.`) : T(`Nein – z. B. ${g}: ${mit(P[a].de, g)}, aber ${mit(P[b].nicht, g)}.`, `No – e.g. ${g}: ${mit(P[a].en, g)}, but ${mit(P[b].enNicht, g)}.`) })];
  if (!ja) schritte.push(zahl("me-t2", T("Gegenbeispiel", "Counterexample"), T("Nenne ein Element von A, das nicht in B liegt.", "Give an element of A that is not in B."), "$x =$", g, {
    gegen: [a, b], hinweis: T("Probiere die kleinsten Elemente von A durch.", "Try the smallest elements of A."), erkl: T(`z. B. $x = ${g}$`, `e.g. $x = ${g}$`) }));
  return {
    art: "teilmenge",
    text: T(`$A = \\{x \\in \\mathbb{N} \\mid$ ${P[a].de}$\\}$, $B = \\{x \\in \\mathbb{N} \\mid$ ${P[b].de}$\\}$.`, `$A = \\{x \\in \\mathbb{N} \\mid$ ${P[a].en}$\\}$, $B = \\{x \\in \\mathbb{N} \\mid$ ${P[b].en}$\\}$.`),
    schritte, pruef: { a, b, ja, g },
  };
}

/* ======================================================================
   KAPITEL 2 · MENGENOPERATIONEN
   ====================================================================== */
export const OP_ARTEN = ["operation", "venn", "komplement", "anzahl"];
const OPN = { schnitt: "\\cap", ver: "\\cup", ohne: "\\setminus" };
const sortiert = (s) => [...s].sort((x, y) => x - y);
export function mengenOp(A, B, op) {
  const sb = new Set(B), sa = new Set(A);
  if (op === "schnitt") return sortiert(A.filter((x) => sb.has(x)));
  if (op === "ver") return sortiert([...new Set([...A, ...B])]);
  if (op === "ohne") return sortiert(A.filter((x) => !sb.has(x)));
  return sortiert(B.filter((x) => !sa.has(x)));   /* B \ A */
}
function zufallsMenge(z, n, bis) { const s = new Set(); while (s.size < n) s.add(ganz(1, bis, z)); return sortiert(s); }

function operation(z) {
  let A, B;
  do { A = zufallsMenge(z, ganz(4, 6, z), 12); B = zufallsMenge(z, ganz(3, 6, z), 12); }
  while (mengenOp(A, B, "schnitt").length === 0 || mengenOp(A, B, "ohne").length === 0 || mengenOp(A, B, "bohne").length === 0);
  const op = wahlAus(["schnitt", "ver", "ohne"], z);
  /* B \\ A heißt intern „bohne“ */
  const kand = ["schnitt", "ver", "ohne", "bohne"].map((o) => [o, listeTex(mengenOp(A, B, o))]);
  const gesehen = new Set(); const opt = [];
  for (const [o, t] of kand) if (!gesehen.has(t)) { gesehen.add(t); opt.push([t, `$${t}$`, o]); }
  const richtig = listeTex(mengenOp(A, B, op));
  const fehlerText = { schnitt: T("Das ist die Schnittmenge (in beiden).", "That's the intersection (in both)."), ver: T("Das ist die Vereinigung (in mindestens einer).", "That's the union (in at least one)."),
    ohne: T("Das ist A ohne B.", "That's A without B."), bohne: T("Das ist B ohne A – die Reihenfolge zählt.", "That's B without A – the order matters.") };
  return {
    art: "operation",
    text: T(`$A = ${listeTex(A)}$, $B = ${listeTex(B)}$.`, `$A = ${listeTex(A)}$, $B = ${listeTex(B)}$.`),
    schritte: [wahl("mo-o", T("Mengenoperation", "Set operation"), T(`Bestimme $A ${OPN[op]} B$.`, `Find $A ${OPN[op]} B$.`), dreh(opt.map(([k, a]) => [k, a]), ganz(0, 3, z)), richtig, {
      fehler: opt.filter(([, , o]) => o !== op).map(([k, , o]) => ({ wahl: k, text: fehlerText[o] })),
      hinweis: op === "schnitt" ? T("∩: Elemente, die in A UND in B liegen.", "∩: elements in A AND in B.") : op === "ver" ? T("∪: Elemente, die in A ODER in B liegen (oder in beiden).", "∪: elements in A OR in B (or both).") : T("A \\ B: Elemente von A, die NICHT in B liegen.", "A \\ B: elements of A that are NOT in B."),
      erkl: `$A ${OPN[op]} B = ${richtig}$` })],
    pruef: { A, B, op, ergebnis: mengenOp(A, B, op) },
  };
}

const REGIONEN = () => [["a", T("nur in A", "only in A")], ["b", T("nur in B", "only in B")], ["ab", T("in A ∩ B", "in A ∩ B")], ["k", T("in keiner der beiden", "in neither")]];
function venn(z) {
  const paare = [["gerade", "v3"], ["prim", "ungerade"], ["v4", "t24"], ["quad", "gerade"], ["v5", "gerade"], ["t30", "prim"]];
  const [a, b] = wahlAus(paare, z);
  const n = ganz(1, 30, z);
  const ina = P[a].f(n), inb = P[b].f(n);
  const r = ina && inb ? "ab" : ina ? "a" : inb ? "b" : "k";
  return {
    art: "venn",
    text: T(`Grundmenge $\\mathbb{N}$. A: ${P[a].de}. B: ${P[b].de}.`, `Universe $\\mathbb{N}$. A: ${P[a].en}. B: ${P[b].en}.`),
    skizze: { venn: true, a, b, n },
    schritte: [wahl("mo-v", T("Bereich im Mengenbild", "Region in the Venn diagram"), T(`In welchem Bereich steht die Zahl ${n}?`, `In which region is the number ${n}?`), REGIONEN(), r, {
      hinweis: T(`Prüfe beide Eigenschaften einzeln für ${n}.`, `Check both properties separately for ${n}.`),
      erkl: T(`${n}: A ${ina ? "ja" : "nein"}, B ${inb ? "ja" : "nein"}.`, `${n}: A ${ina ? "yes" : "no"}, B ${inb ? "yes" : "no"}.`) })],
    pruef: { a, b, n, r },
  };
}

function komplement(z) {
  const G = []; for (let n = 1; n <= 10; n++) G.push(n);
  const id = wahlAus(["gerade", "prim", "v3", "t12", "quad"], z);
  const A = G.filter(P[id].f);
  const K = G.filter((n) => !P[id].f(n));
  const opt = dreh(mengenOptionenListe([K, A, K.filter((x) => x !== 1), [...K, 0]]), ganz(0, 3, z));
  return {
    art: "komplement",
    text: T(`$G = \\{1; 2; …; 10\\}$, $A = \\{x \\in G \\mid$ ${P[id].de}$\\}$.`, `$G = \\{1; 2; …; 10\\}$, $A = \\{x \\in G \\mid$ ${P[id].en}$\\}$.`),
    schritte: [
      zahl("mo-k1", T("Mächtigkeit", "Size"), T("Wie viele Elemente hat A?", "How many elements does A have?"), "$|A| =$", A.length, { hinweis: T("Geh G von 1 bis 10 durch.", "Go through G from 1 to 10."), erkl: `$A = ${listeTex(A)}$` }),
      wahl("mo-k2", T("Komplement", "Complement"), T("Bestimme das Komplement $\\overline{A} = G \\setminus A$.", "Find the complement $\\overline{A} = G \\setminus A$."), opt, listeTex(K), {
        fehler: [{ wahl: listeTex(A), text: T("Das ist A selbst – das Komplement enthält alles andere aus G.", "That's A itself – the complement contains everything else in G.") }, { wahl: listeTex([...K, 0]), text: T("0 gehört nicht zur Grundmenge G.", "0 is not in the universe G.") }],
        hinweis: T("Alles aus G, was NICHT in A liegt.", "Everything in G that is NOT in A."), erkl: `$\\overline{A} = ${listeTex(K)}$` }),
    ],
    pruef: { A, K },
  };
}
function mengenOptionenListe(listen) {
  const ges = new Set(); const aus = [];
  for (const l of listen) { const t = listeTex(sortiert(l)); if (!ges.has(t)) { ges.add(t); aus.push([t, `$${t}$`]); } }
  return aus;
}

function anzahl(z) {
  const gesamt = ganz(24, 32, z), beide = ganz(2, 7, z);
  const nurA = ganz(4, 10, z), nurB = ganz(3, 9, z);
  const keine = gesamt - beide - nurA - nurB;
  if (keine < 0) return anzahl(z);
  const a = nurA + beide, b = nurB + beide;
  return {
    art: "anzahl",
    text: T(`In einer Klasse mit ${gesamt} Schülern spielen ${a} Fußball, ${b} Handball und ${beide} beides.`, `In a class of ${gesamt} students, ${a} play football, ${b} play handball and ${beide} play both.`),
    skizze: { zahlenVenn: [nurA, beide, nurB, keine], namen: [T("Fußball", "Football"), T("Handball", "Handball")] , verdeckt: true },
    schritte: [
      zahl("mo-n1", T("Mindestens eine Sportart", "At least one sport"), T("Wie viele spielen Fußball oder Handball (oder beides)?", "How many play football or handball (or both)?"), "$|F \\cup H| =$", a + b - beide, {
        fehler: [{ wert: a + b, text: T(`Die ${beide}, die beides spielen, hast du doppelt gezählt.`, `You counted the ${beide} who play both twice.`) }],
        hinweis: T("$|F \\cup H| = |F| + |H| − |F \\cap H|$", "$|F \\cup H| = |F| + |H| − |F \\cap H|$"),
        erkl: `$${a} + ${b} − ${beide} = ${a + b - beide}$` }),
      zahl("mo-n2", T("Keine der beiden", "Neither"), T("Wie viele spielen keine der beiden Sportarten?", "How many play neither sport?"), "", keine, {
        hinweis: T("Alle minus die, die mindestens eine Sportart spielen.", "Everyone minus those who play at least one sport."), erkl: `$${gesamt} − ${a + b - beide} = ${keine}$` }),
    ],
    pruef: { gesamt, a, b, beide, keine },
  };
}

/* ======================================================================
   KAPITEL 3 · INTERVALLE UND LÖSUNGSMENGEN
   ====================================================================== */
export const IV_ARTEN = ["schreibweise", "ganzzahlen", "schnitt", "vereinigung", "beschreibend"];
const zufallsIv = (z, unendlich = true) => {
  const t = unendlich ? ganz(0, 5, z) : 0;
  const lo = ganz(-6, 3, z), hi = lo + ganz(1, 7, z);
  const a = z() < 0.5, b = z() < 0.5;
  if (t === 4) return iv(-Infinity, hi, false, b);
  if (t === 5) return iv(lo, Infinity, a, false);
  return iv(lo, hi, a, b);
};
const relL = (zu) => (zu ? "\\le" : "<");
function ungleichungTex(m, v = "x") {
  if (m.lo === -Infinity) return `${v} ${m.hiZu ? "\\le" : "<"} ${zTex(m.hi)}`;
  if (m.hi === Infinity) return `${v} ${m.loZu ? "\\ge" : ">"} ${zTex(m.lo)}`;
  return `${zTex(m.lo)} ${relL(m.loZu)} ${v} ${relL(m.hiZu)} ${zTex(m.hi)}`;
}
const variante = (m, a, b) => iv(m.lo, m.hi, a, b);
function ivVarianten(m) {
  if (!isFinite(m.lo)) return [m, variante(m, false, !m.hiZu), iv(m.hi, Infinity, !m.hiZu, false), iv(m.hi, Infinity, m.hiZu, false)];
  if (!isFinite(m.hi)) return [m, variante(m, !m.loZu, false), iv(-Infinity, m.lo, false, !m.loZu), iv(-Infinity, m.lo, false, m.loZu)];
  return [m, variante(m, !m.loZu, m.hiZu), variante(m, m.loZu, !m.hiZu), variante(m, !m.loZu, !m.hiZu)];
}

function schreibweise(z) {
  const m = zufallsIv(z);
  return {
    art: "schreibweise",
    text: T(`$M = \\{x \\in \\mathbb{R} \\mid ${ungleichungTex(m)}\\}$.`, `$M = \\{x \\in \\mathbb{R} \\mid ${ungleichungTex(m)}\\}$.`),
    schritte: [wahl("iv-s", T("Intervallschreibweise", "Interval notation"), T("Schreibe M als Intervall.", "Write M as an interval."), dreh(mengenOptionen(ivVarianten(m)), ganz(0, 3, z)), mengeTex(m), {
      hinweis: T("≤ bzw. ≥: Zahl gehört dazu → Klammer zur Zahl hin. < bzw. >: Klammer nach außen. Bei ∞ immer nach außen.", "≤ or ≥: number included → bracket faces the number. < or >: bracket faces out. At ∞ always out."),
      erkl: `$M = ${mengeTex(m)}$` })],
    pruef: { m, f: (x) => enthaelt(m, x) },
  };
}

function ganzzahlen(z) {
  const m = zufallsIv(z, false);
  let n = 0; for (let k = Math.ceil(m.lo); k <= Math.floor(m.hi); k++) if (enthaelt(m, k)) n++;
  return {
    art: "ganzzahlen",
    text: T(`Gegeben ist das Intervall $I = ${mengeTex(m)}$.`, `Consider the interval $I = ${mengeTex(m)}$.`),
    skizze: { menge: m },
    schritte: [zahl("iv-g", T("Ganze Zahlen zählen", "Count integers"), T("Wie viele ganze Zahlen liegen in I?", "How many integers lie in I?"), "", n, {
      fehler: [{ wert: m.hi - m.lo + 1, text: T("Prüfe die Ränder: Eine nach außen zeigende Klammer schließt die Zahl aus.", "Check the ends: a bracket facing out excludes the number.") }, { wert: m.hi - m.lo, text: T("Zähle die Zahlen, nicht die Abstände.", "Count the numbers, not the gaps.") }],
      hinweis: T("Schreib die ganzen Zahlen von links nach rechts auf und achte auf die Klammern.", "Write the integers from left to right and watch the brackets."),
      erkl: T(`${n} ganze Zahlen`, `${n} integers`) })],
    pruef: { m, n },
  };
}

/* Schnitt und Vereinigung zweier Intervalle */
export function ivSchnitt(a, b) {
  let lo, loZu, hi, hiZu;
  if (a.lo > b.lo) { lo = a.lo; loZu = a.loZu; } else if (b.lo > a.lo) { lo = b.lo; loZu = b.loZu; } else { lo = a.lo; loZu = a.loZu && b.loZu; }
  if (a.hi < b.hi) { hi = a.hi; hiZu = a.hiZu; } else if (b.hi < a.hi) { hi = b.hi; hiZu = b.hiZu; } else { hi = a.hi; hiZu = a.hiZu && b.hiZu; }
  if (lo > hi || (lo === hi && !(loZu && hiZu))) return LEER();
  if (lo === hi) return { art: "pkt", pkt: [lo] };
  return iv(lo, hi, loZu, hiZu);
}
/* Vereinigung überlappender Intervalle (Aufgaben sind so gebaut, dass sie überlappen) */
export function ivVereinigung(a, b) {
  let lo, loZu, hi, hiZu;
  if (a.lo < b.lo) { lo = a.lo; loZu = a.loZu; } else if (b.lo < a.lo) { lo = b.lo; loZu = b.loZu; } else { lo = a.lo; loZu = a.loZu || b.loZu; }
  if (a.hi > b.hi) { hi = a.hi; hiZu = a.hiZu; } else if (b.hi > a.hi) { hi = b.hi; hiZu = b.hiZu; } else { hi = a.hi; hiZu = a.hiZu || b.hiZu; }
  return iv(lo, hi, loZu, hiZu);
}
function zweiIntervalle(z) {
  let a, b;
  do { a = zufallsIv(z); b = zufallsIv(z); } while (ivSchnitt(a, b).art !== "iv" || mengeTex(a) === mengeTex(b) || mengeTex(ivSchnitt(a, b)) === mengeTex(ivVereinigung(a, b)));
  return [a, b];
}
function schnittVer(z, op) {
  const [a, b] = zweiIntervalle(z);
  const s = ivSchnitt(a, b), v = ivVereinigung(a, b);
  const richtig = op === "schnitt" ? s : v;
  const falsch = op === "schnitt" ? v : s;
  const nachbarn = richtig.art === "iv" ? ivVarianten(richtig).slice(1, 3) : [];
  const opt = dreh(mengenOptionen([richtig, falsch, ...nachbarn]), ganz(0, 3, z));
  return {
    art: op === "schnitt" ? "schnitt" : "vereinigung",
    text: T(`$A = ${mengeTex(a)}$, $B = ${mengeTex(b)}$.`, `$A = ${mengeTex(a)}$, $B = ${mengeTex(b)}$.`),
    skizze: { mengen: [a, b] },
    schritte: [wahl("iv-o", op === "schnitt" ? T("Schnitt", "Intersection") : T("Vereinigung", "Union"), T(`Bestimme $A ${op === "schnitt" ? "\\cap" : "\\cup"} B$.`, `Find $A ${op === "schnitt" ? "\\cap" : "\\cup"} B$.`), opt, mengeTex(richtig), {
      fehler: [{ wahl: mengeTex(falsch), text: op === "schnitt" ? T("Das ist die Vereinigung. Der Schnitt ist nur der Teil, der in beiden liegt.", "That's the union. The intersection is only the part in both.") : T("Das ist der Schnitt. Die Vereinigung umfasst alles, was in A oder B liegt.", "That's the intersection. The union contains everything in A or B.") }],
      hinweis: T("Zeichne beide Intervalle übereinander auf eine Zahlengerade.", "Draw both intervals above each other on a number line."),
      erkl: `$A ${op === "schnitt" ? "\\cap" : "\\cup"} B = ${mengeTex(richtig)}$` })],
    pruef: { a, b, op, richtig },
  };
}

function beschreibend(z) {
  const m = zufallsIv(z);
  const kand = ivVarianten(m).map((v) => `\\{x \\in \\mathbb{R} \\mid ${ungleichungTex(v)}\\}`);
  const opt = []; const ges = new Set();
  for (const k of kand) if (!ges.has(k)) { ges.add(k); opt.push([k, `$${k}$`]); }
  return {
    art: "beschreibend",
    text: T(`Gegeben ist $I = ${mengeTex(m)}$.`, `Consider $I = ${mengeTex(m)}$.`),
    schritte: [wahl("iv-b", T("Mengenschreibweise", "Set-builder notation"), T("Welche Menge ist dasselbe wie I?", "Which set is the same as I?"), dreh(opt, ganz(0, 3, z)), kand[0], {
      hinweis: T("[a … heißt a ≤ x, ]a … heißt a < x.", "[a … means a ≤ x, ]a … means a < x."), erkl: `$I = ${kand[0]}$` })],
    pruef: { m },
  };
}

/* ======================================================================
   KAPITEL 4 · AUSSAGEN UND VERKNÜPFUNGEN
   ====================================================================== */
export const AU_ARTEN = ["aussage", "wahrheitswert", "tafel"];
export const AUSSAGEN = [
  { de: "7 ist eine Primzahl.", en: "7 is a prime.", ja: true },
  { de: "12 ist ungerade.", en: "12 is odd.", ja: true, notiz: ["eine falsche Aussage – aber eine Aussage", "a false statement – but a statement"] },
  { de: "Wie spät ist es?", en: "What time is it?", ja: false, notiz: ["eine Frage ist weder wahr noch falsch", "a question is neither true nor false"] },
  { de: "x + 1 = 5", en: "x + 1 = 5", ja: false, notiz: ["eine Aussageform: wahr oder falsch erst, wenn man für x etwas einsetzt", "an open sentence: true or false only once x is replaced"] },
  { de: "Mathe ist das schönste Fach.", en: "Maths is the nicest subject.", ja: false, notiz: ["eine Meinung – nicht objektiv wahr oder falsch", "an opinion – not objectively true or false"] },
  { de: "Jede gerade Zahl ist durch 4 teilbar.", en: "Every even number is divisible by 4.", ja: true, notiz: ["eine (falsche) Aussage – 6 ist ein Gegenbeispiel", "a (false) statement – 6 is a counterexample"] },
  { de: "√2 ist irrational.", en: "√2 is irrational.", ja: true },
  { de: "Schließ das Fenster!", en: "Close the window!", ja: false, notiz: ["eine Aufforderung", "a request"] },
  { de: "Es gibt unendlich viele Primzahlen.", en: "There are infinitely many primes.", ja: true },
  { de: "x² ≥ 0", en: "x² ≥ 0", ja: false, notiz: ["ohne Angabe, was x ist, eine Aussageform – mit „für alle x ∈ ℝ“ davor wird es eine wahre Aussage", "without saying what x is, an open sentence – with “for all x ∈ ℝ” in front it becomes a true statement"] },
];
function aussage(z) {
  const a = wahlAus(AUSSAGEN, z);
  return {
    art: "aussage",
    text: T(`„${a.de}“`, `“${a.en}”`),
    schritte: [wahl("au-a", T("Aussage oder nicht?", "Statement or not?"), T("Ist das eine Aussage im Sinne der Mathematik (entweder wahr oder falsch)?", "Is this a statement in the mathematical sense (either true or false)?"), JN(), a.ja ? "ja" : "nein", {
      hinweis: T("Eine Aussage ist ein Satz, der eindeutig wahr oder falsch ist – auch eine falsche Aussage ist eine Aussage.", "A statement is a sentence that is definitely true or false – a false statement is still a statement."),
      erkl: a.notiz ? T(`${a.ja ? "Ja" : "Nein"} – ${a.notiz[0]}.`, `${a.ja ? "Yes" : "No"} – ${a.notiz[1]}.`) : T("Ja – sie ist eindeutig wahr oder falsch.", "Yes – it is definitely true or false.") })],
    pruef: { ja: a.ja },
  };
}

/* konkrete Aussage „n hat Eigenschaft p“ */
function konkret(z) {
  const id = wahlAus(["gerade", "prim", "v3", "v4", "quad", "t24"], z);
  const n = ganz(2, 30, z);
  return { de: mit(P[id].de, n), en: mit(P[id].en, n), w: P[id].f(n) };
}
export const VERKN = {
  und: { tex: "\\land", de: "und", en: "and", f: (a, b) => a && b },
  oder: { tex: "\\lor", de: "oder", en: "or", f: (a, b) => a || b },
  folgt: { tex: "\\Rightarrow", de: "wenn …, dann", en: "if …, then", f: (a, b) => !a || b },
  aequ: { tex: "\\Leftrightarrow", de: "genau dann, wenn", en: "if and only if", f: (a, b) => a === b },
  nicht: { tex: "\\neg", de: "nicht", en: "not", f: (a) => !a },
};
function wahrheitswert(z) {
  const A = konkret(z); let B = konkret(z);
  while (B.de === A.de) B = konkret(z);
  const op = wahlAus(["und", "oder", "folgt", "aequ", "nicht"], z);
  const w = op === "nicht" ? !A.w : VERKN[op].f(A.w, B.w);
  const formel = op === "nicht" ? "\\neg A" : `A ${VERKN[op].tex} B`;
  const wf = (x) => (x ? "w" : "f");
  const schritte = [wahl("au-w1", T("Wahrheitswert von A", "Truth value of A"), T(`A: „${A.de}“`, `A: “${A.en}”`), WF(), wf(A.w), { hinweis: T("Rechne nach.", "Check it."), erkl: A.w ? T("A ist wahr.", "A is true.") : T("A ist falsch.", "A is false.") })];
  if (op !== "nicht") schritte.push(wahl("au-w2", T("Wahrheitswert von B", "Truth value of B"), T(`B: „${B.de}“`, `B: “${B.en}”`), WF(), wf(B.w), { hinweis: T("Rechne nach.", "Check it."), erkl: B.w ? T("B ist wahr.", "B is true.") : T("B ist falsch.", "B is false.") }));
  const regel = {
    und: T("A ∧ B ist nur wahr, wenn beide wahr sind.", "A ∧ B is only true if both are true."),
    oder: T("A ∨ B ist wahr, wenn mindestens eine wahr ist.", "A ∨ B is true if at least one is true."),
    folgt: T("A ⇒ B ist nur falsch, wenn A wahr und B falsch ist.", "A ⇒ B is only false if A is true and B is false."),
    aequ: T("A ⇔ B ist wahr, wenn A und B denselben Wahrheitswert haben.", "A ⇔ B is true if A and B have the same truth value."),
    nicht: T("¬A dreht den Wahrheitswert um.", "¬A flips the truth value."),
  }[op];
  schritte.push(wahl("au-w3", T("Verknüpfung", "Compound"), T(`Ist $${formel}$ wahr oder falsch?`, `Is $${formel}$ true or false?`), WF(), wf(w), {
    fehler: op === "folgt" && !A.w ? [{ wahl: "f", text: T("Aus einer falschen Voraussetzung folgt alles: A ⇒ B ist dann wahr.", "Anything follows from a false premise: A ⇒ B is then true.") }] : [],
    hinweis: regel, erkl: T(`$${formel}$ ist ${w ? "wahr" : "falsch"}. ${regel[0]}`, `$${formel}$ is ${w ? "true" : "false"}. ${regel[1]}`) }));
  return {
    art: "wahrheitswert",
    text: op === "nicht" ? T(`A: „${A.de}“`, `A: “${A.en}”`) : T(`A: „${A.de}“ B: „${B.de}“`, `A: “${A.en}” B: “${B.en}”`),
    schritte, pruef: { A, B, op, w },
  };
}
function tafel(z) {
  const op = wahlAus(["und", "oder", "folgt", "aequ"], z);
  const a = z() < 0.5, b = z() < 0.5;
  const w = VERKN[op].f(a, b);
  const t = (x) => (x ? "w" : "f");
  return {
    art: "tafel",
    text: T(`Wahrheitstafel für $A ${VERKN[op].tex} B$ (${VERKN[op].de}).`, `Truth table for $A ${VERKN[op].tex} B$ (${VERKN[op].en}).`),
    skizze: { tafel: op, zeile: [a, b] },
    schritte: [wahl("au-t", T("Zeile ausfüllen", "Fill in the row"), T(`A ist ${a ? "wahr" : "falsch"}, B ist ${b ? "wahr" : "falsch"}. Was steht in der letzten Spalte?`, `A is ${a ? "true" : "false"}, B is ${b ? "true" : "false"}. What goes in the last column?`), WF(), t(w), {
      fehler: op === "folgt" && !a ? [{ wahl: "f", text: T("Ist A falsch, ist A ⇒ B immer wahr („ex falso quodlibet“).", "If A is false, A ⇒ B is always true (“ex falso quodlibet”).") }] : [],
      hinweis: T("Denk an ein Versprechen: „Wenn es regnet, nehme ich den Schirm.“ Wann wäre es gebrochen?", "Think of a promise: “If it rains, I take the umbrella.” When would it be broken?"),
      erkl: T(`${t(a)} ${VERKN[op].de} ${t(b)} → ${t(w)}`, `${t(a)} ${VERKN[op].en} ${t(b)} → ${t(w)}`) })],
    pruef: { op, a, b, w },
  };
}

/* ======================================================================
   KAPITEL 5 · FOLGERN UND BEWEISEN
   ====================================================================== */
export const FO_ARTEN = ["implikation", "umkehrung", "notwendig", "verneinung", "quantor"];
function implikation(z) {
  const [a, b] = wahlAus(TEILMENGEN, z);
  const g = gegenbeispiel(a, b);
  const schritte = [wahl("fo-i1", T("Wahr oder falsch?", "True or false?"), T("Gilt diese Folgerung für alle natürlichen Zahlen x?", "Does this implication hold for all natural numbers x?"), WF(), g === null ? "w" : "f", {
    hinweis: T("Eine Allaussage widerlegt man mit einem einzigen Gegenbeispiel.", "One counterexample is enough to disprove a universal statement."),
    erkl: g === null ? T("Wahr – es gibt kein Gegenbeispiel.", "True – there is no counterexample.") : T(`Falsch – ${g} ist ein Gegenbeispiel: ${mit(P[a].de, g)}, aber ${mit(P[b].nicht, g)}.`, `False – ${g} is a counterexample: ${mit(P[a].en, g)}, but ${mit(P[b].enNicht, g)}.`) })];
  if (g !== null) schritte.push(zahl("fo-i2", T("Gegenbeispiel", "Counterexample"), T("Nenne eine Zahl, für die die Voraussetzung gilt, die Folgerung aber nicht.", "Give a number for which the premise holds but the conclusion does not."), "$x =$", g, {
    gegen: [a, b], hinweis: T("Teste kleine Zahlen, die die Voraussetzung erfüllen.", "Test small numbers that satisfy the premise."), erkl: T(`z. B. $x = ${g}$`, `e.g. $x = ${g}$`) }));
  return {
    art: "implikation",
    text: (([d, e]) => T(`„${d}“ (für alle $x \\in \\mathbb{N}$)`, `“${e}” (for all $x \\in \\mathbb{N}$)`))(wennDann(a, b)),
    schritte, pruef: { a, b, g },
  };
}
/* verneinte Satzteile: „x nicht gerade ist“ / „ist x nicht gerade“ */
const nichtWenn = (id) => { const t = P[id].nicht; const m = /^x (\S+) (.*)$/.exec(t); return m ? `x ${m[2]} ${m[1]}` : t; };
const nichtDann = (id) => { const t = P[id].nicht; const m = /^x (\S+) (.*)$/.exec(t); return m ? `${m[1]} x ${m[2]}` : t; };
const WAHRE = TEILMENGEN.filter(([a, b]) => folgt(a, b));
function umkehrung(z) {
  const [a, b] = wahlAus(WAHRE, z);
  const g = gegenbeispiel(b, a);
  const schritte = [
    wahl("fo-u1", T("Umkehrung bilden", "Form the converse"), T("Wie lautet die Umkehrung?", "What is the converse?"), [
      ["u", wennDann(b, a)],
      ["k", T(`Wenn ${nichtWenn(b)}, dann ${nichtDann(a)}.`, `If ${P[b].enNicht}, then ${P[a].enNicht}.`)],
      ["n", T(`Wenn ${nichtWenn(a)}, dann ${nichtDann(b)}.`, `If ${P[a].enNicht}, then ${P[b].enNicht}.`)],
    ], "u", {
      fehler: [{ wahl: "k", text: T("Das ist die Kontraposition – sie ist gleichwertig zur ursprünglichen Aussage.", "That's the contrapositive – it is equivalent to the original statement.") }],
      hinweis: T("Umkehrung: Voraussetzung und Folgerung tauschen die Plätze.", "Converse: premise and conclusion swap places."), erkl: T("Voraussetzung und Folgerung vertauscht.", "Premise and conclusion swapped.") }),
    wahl("fo-u2", T("Gilt die Umkehrung?", "Does the converse hold?"), T("Ist die Umkehrung wahr?", "Is the converse true?"), WF(), g === null ? "w" : "f", {
      hinweis: T("Aus „A ⇒ B wahr“ folgt nichts über „B ⇒ A“ – prüfe neu.", "“A ⇒ B true” says nothing about “B ⇒ A” – check again."),
      erkl: g === null ? T("Wahr – hier gilt sogar A ⇔ B.", "True – here even A ⇔ B holds.") : T(`Falsch – ${g}: ${mit(P[b].de, g)}, aber ${mit(P[a].nicht, g)}.`, `False – ${g}: ${mit(P[b].en, g)}, but ${mit(P[a].enNicht, g)}.`) }),
  ];
  const [d, e] = wennDann(a, b);
  return { art: "umkehrung", text: T(`Wahr ist: „${d}“`, `True: “${e}”`), schritte, pruef: { a, b, g } };
}

const BEDINGUNGEN = [["v4", "gerade"], ["gerade", "v4"], ["v6", "g3"], ["g3", "v6"], ["v10", "g5"], ["gerade", "qgerade"], ["v5", "ziff"], ["ziff", "v10"], ["prim", "ungerade"], ["v3", "prim"]];
function notwendig(z) {
  const [a, b] = wahlAus(BEDINGUNGEN, z);
  const hin = folgt(a, b), not = folgt(b, a);
  const r = hin && not ? "beides" : hin ? "hin" : not ? "not" : "keins";
  return {
    art: "notwendig",
    text: T(`A: „${P[a].de}“ B: „${P[b].de}“`, `A: “${P[a].en}” B: “${P[b].en}”`),
    schritte: [wahl("fo-n", T("Bedingung", "Condition"), T("Was ist A für B?", "What is A for B?"), [
      ["hin", T("hinreichend, aber nicht notwendig", "sufficient but not necessary")], ["not", T("notwendig, aber nicht hinreichend", "necessary but not sufficient")],
      ["beides", T("notwendig und hinreichend", "necessary and sufficient")], ["keins", T("weder noch", "neither")],
    ], r, {
      hinweis: T("A hinreichend für B: A ⇒ B. A notwendig für B: B ⇒ A (ohne A kein B).", "A sufficient for B: A ⇒ B. A necessary for B: B ⇒ A (no B without A)."),
      erkl: T(`A ⇒ B ist ${hin ? "wahr" : "falsch"}${hin ? "" : ` (Gegenbeispiel ${gegenbeispiel(a, b)})`}, B ⇒ A ist ${not ? "wahr" : "falsch"}${not ? "" : ` (Gegenbeispiel ${gegenbeispiel(b, a)})`}.`,
        `A ⇒ B is ${hin ? "true" : "false"}${hin ? "" : ` (counterexample ${gegenbeispiel(a, b)})`}, B ⇒ A is ${not ? "true" : "false"}${not ? "" : ` (counterexample ${gegenbeispiel(b, a)})`}.`) })],
    pruef: { a, b, r },
  };
}

export const VERNEINUNGEN = [
  { a: T("Alle Schüler der Klasse haben ein Handy.", "All students in the class have a phone."), r: T("Mindestens ein Schüler der Klasse hat kein Handy.", "At least one student in the class has no phone."),
    f: [T("Kein Schüler der Klasse hat ein Handy.", "No student in the class has a phone."), T("Alle Schüler der Klasse haben kein Handy.", "All students in the class have no phone.")] },
  { a: T("Es gibt eine gerade Primzahl.", "There is an even prime."), r: T("Alle Primzahlen sind ungerade.", "All primes are odd."),
    f: [T("Es gibt eine ungerade Primzahl.", "There is an odd prime."), T("Alle Primzahlen sind gerade.", "All primes are even.")] },
  { a: T("$\\forall x \\in \\mathbb{R}: x^2 \\ge 0$", "$\\forall x \\in \\mathbb{R}: x^2 \\ge 0$"), r: T("$\\exists x \\in \\mathbb{R}: x^2 < 0$", "$\\exists x \\in \\mathbb{R}: x^2 < 0$"),
    f: [T("$\\forall x \\in \\mathbb{R}: x^2 < 0$", "$\\forall x \\in \\mathbb{R}: x^2 < 0$"), T("$\\exists x \\in \\mathbb{R}: x^2 \\le 0$", "$\\exists x \\in \\mathbb{R}: x^2 \\le 0$")] },
  { a: T("$\\exists n \\in \\mathbb{N}: n > 100$", "$\\exists n \\in \\mathbb{N}: n > 100$"), r: T("$\\forall n \\in \\mathbb{N}: n \\le 100$", "$\\forall n \\in \\mathbb{N}: n \\le 100$"),
    f: [T("$\\forall n \\in \\mathbb{N}: n < 100$", "$\\forall n \\in \\mathbb{N}: n < 100$"), T("$\\exists n \\in \\mathbb{N}: n \\le 100$", "$\\exists n \\in \\mathbb{N}: n \\le 100$")] },
  { a: T("Es regnet und es ist kalt.", "It is raining and it is cold."), r: T("Es regnet nicht oder es ist nicht kalt.", "It is not raining or it is not cold."),
    f: [T("Es regnet nicht und es ist nicht kalt.", "It is not raining and it is not cold."), T("Es regnet oder es ist kalt.", "It is raining or it is cold.")] },
  { a: T("$x < −2 \\lor x > 2$", "$x < −2 \\lor x > 2$"), r: T("$−2 \\le x \\le 2$", "$−2 \\le x \\le 2$"),
    f: [T("$−2 < x < 2$", "$−2 < x < 2$"), T("$x > −2 \\lor x < 2$", "$x > −2 \\lor x < 2$")] },
  { a: T("Wenn es regnet, ist die Straße nass.", "If it rains, the street is wet."), r: T("Es regnet und die Straße ist nicht nass.", "It rains and the street is not wet."),
    f: [T("Wenn es nicht regnet, ist die Straße nicht nass.", "If it does not rain, the street is not wet."), T("Es regnet nicht und die Straße ist nass.", "It does not rain and the street is wet.")] },
  { a: T("Jede durch 4 teilbare Zahl ist gerade.", "Every number divisible by 4 is even."), r: T("Es gibt eine durch 4 teilbare Zahl, die ungerade ist.", "There is a number divisible by 4 that is odd."),
    f: [T("Keine durch 4 teilbare Zahl ist gerade.", "No number divisible by 4 is even."), T("Jede ungerade Zahl ist nicht durch 4 teilbar.", "Every odd number is not divisible by 4.")] },
];
function verneinung(z) {
  const i = ganz(0, VERNEINUNGEN.length - 1, z);
  const v = VERNEINUNGEN[i];
  const opt = dreh([["r", v.r], ["f1", v.f[0]], ["f2", v.f[1]]], ganz(0, 2, z));
  return {
    art: "verneinung",
    text: v.a,
    schritte: [wahl("fo-v", T("Verneinung", "Negation"), T("Welcher Satz ist die Verneinung (genau dann wahr, wenn der Satz falsch ist)?", "Which sentence is the negation (true exactly when the sentence is false)?"), opt, "r", {
      fehler: [{ wahl: "f1", text: T("Das ist zu stark: Für das Gegenteil reicht schon ein einziger Fall.", "That's too strong: for the opposite, a single case is enough.") }],
      hinweis: T("„Alle“ wird zu „es gibt ein … nicht“, „es gibt“ wird zu „alle … nicht“; „und“ wird zu „oder“ (und umgekehrt).", "“All” becomes “there is one … not”, “there is” becomes “all … not”; “and” becomes “or” (and vice versa)."),
      erkl: v.r })],
    pruef: { i },
  };
}

export const QUANTOREN = [
  { t: "\\forall x \\in \\mathbb{R}: x^2 \\ge 0", w: true, e: T("Ein Quadrat ist nie negativ.", "A square is never negative.") },
  { t: "\\forall x \\in \\mathbb{R}: x^2 > 0", w: false, e: T("Gegenbeispiel x = 0.", "Counterexample x = 0.") },
  { t: "\\exists x \\in \\mathbb{N}: x^2 = 2", w: false, e: T("1² = 1 und 2² = 4 – dazwischen liegt kein Quadrat einer natürlichen Zahl.", "1² = 1 and 2² = 4 – no square of a natural number lies in between.") },
  { t: "\\exists x \\in \\mathbb{R}: x^2 = 2", w: true, e: T("x = √2.", "x = √2.") },
  { t: "\\forall n \\in \\mathbb{N}: n^2 \\ge n", w: true, e: T("n² = n · n ≥ n, weil der zweite Faktor n ≥ 1 ist.", "n² = n · n ≥ n, because the second factor n is ≥ 1.") },
  { t: "\\forall x \\in \\mathbb{R}: x^2 \\ge x", w: false, e: T("Gegenbeispiel x = 0,5: 0,25 < 0,5.", "Counterexample x = 0.5: 0.25 < 0.5.") },
  { t: "\\exists x \\in \\mathbb{Z}: x + 5 = 2", w: true, e: T("x = −3.", "x = −3.") },
  { t: "\\exists x \\in \\mathbb{N}: x + 5 = 2", w: false, e: T("x = −3 ist keine natürliche Zahl.", "x = −3 is not a natural number.") },
  { t: "\\forall x \\in \\mathbb{R}: |x| = x", w: false, e: T("Gegenbeispiel x = −1: |−1| = 1.", "Counterexample x = −1: |−1| = 1.") },
  { t: "\\exists x \\in \\mathbb{R}: |x| = −x", w: true, e: T("Jedes x ≤ 0, z. B. x = −2.", "Any x ≤ 0, e.g. x = −2.") },
  { t: "\\forall x \\in \\mathbb{R}: 2x > x", w: false, e: T("Gegenbeispiel x = 0 (oder jede negative Zahl).", "Counterexample x = 0 (or any negative number).") },
  { t: "\\forall a, b \\in \\mathbb{R}: (a + b)^2 = a^2 + b^2", w: false, e: T("Gegenbeispiel a = b = 1: 4 ≠ 2. Richtig ist $(a + b)^2 = a^2 + 2ab + b^2$.", "Counterexample a = b = 1: 4 ≠ 2. Correct is $(a + b)^2 = a^2 + 2ab + b^2$.") },
];
function quantor(z) {
  const i = ganz(0, QUANTOREN.length - 1, z);
  const qq = QUANTOREN[i];
  return {
    art: "quantor",
    text: T(`$${qq.t}$`, `$${qq.t}$`),
    schritte: [wahl("fo-q", T("Quantoren", "Quantifiers"), T("Ist die Aussage wahr oder falsch?", "Is the statement true or false?"), WF(), qq.w ? "w" : "f", {
      hinweis: T("∀ („für alle“): ein Gegenbeispiel genügt zum Widerlegen. ∃ („es gibt“): ein Beispiel genügt zum Beweisen.", "∀ (“for all”): one counterexample disproves it. ∃ (“there exists”): one example proves it."),
      erkl: qq.e })],
    pruef: { i },
  };
}

/* ======================================================================
   Öffentliche Erzeuger
   ====================================================================== */
const ERZ = {
  element, aufzaehlen, beschreiben, teilmenge,
  operation, venn, komplement, anzahl,
  schreibweise, ganzzahlen, schnitt: (z) => schnittVer(z, "schnitt"), vereinigung: (z) => schnittVer(z, "ver"), beschreibend,
  aussage, wahrheitswert, tafel,
  implikation, umkehrung, notwendig, verneinung, quantor,
};
export const ML_TITEL = {
  element: ["Element oder nicht?", "Element or not?"], aufzaehlen: ["Aufzählende Form", "Listing form"], beschreiben: ["Beschreibende Form", "Set-builder form"], teilmenge: ["Teilmenge?", "Subset?"],
  operation: ["Schnitt, Vereinigung, Differenz", "Intersection, union, difference"], venn: ["Mengenbild", "Venn diagram"], komplement: ["Komplement", "Complement"], anzahl: ["Zählen mit Mengen", "Counting with sets"],
  schreibweise: ["Intervall schreiben", "Write an interval"], ganzzahlen: ["Ganze Zahlen im Intervall", "Integers in an interval"], schnitt: ["Schnitt von Intervallen", "Intersection of intervals"], vereinigung: ["Vereinigung von Intervallen", "Union of intervals"], beschreibend: ["Intervall als Menge", "Interval as a set"],
  aussage: ["Aussage oder nicht?", "Statement or not?"], wahrheitswert: ["Wahrheitswert", "Truth value"], tafel: ["Wahrheitstafel", "Truth table"],
  implikation: ["Folgerung prüfen", "Check an implication"], umkehrung: ["Umkehrung", "Converse"], notwendig: ["Notwendig oder hinreichend?", "Necessary or sufficient?"], verneinung: ["Verneinen", "Negate"], quantor: ["Für alle – es gibt", "For all – there exists"],
};
export const ML_KAPITEL_ARTEN = { me: ME_ARTEN, op: OP_ARTEN, iv: IV_ARTEN, au: AU_ARTEN, fo: FO_ARTEN };
export function mlAufgabe(art, z = Math.random) { return { ...ERZ[art](z), art }; }
export const praedikat = (id) => P[id];
export { listeTex, ungleichungTex, ivVarianten, ver };
