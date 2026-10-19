/* ============================================================
   GFS · Pascal’sches Dreieck – Übungen zu den Aufgaben der GFS-Seite
   Jede Buchaufgabe wird hier als eigene Übung zur gleichen Idee neu gebaut:
   eigene Zahlen (Generator), eigene Formulierung, eigene Darstellung,
   meist mit einer Stufe mehr Tiefe. Nichts ist aus dem Buch abgeschrieben.
     Zeile bauen          – zur Idee „Dreieck selbst erstellen“
     Zwei Darstellungen   – zur Idee „eine Zahl steht zweimal in einer Zeile“
     Ganz ausmultiplizieren – zur Idee „Koeffizienten von (a + b)ⁿ ergänzen“
     Dreieckszahlen       – zur Idee „Dreieckszahlen in der Diagonale“
     Begründen            – zu den Begründungsaufträgen (Symmetrie, Diagonale)
   Reine Logik, getestet in tests/gfsPascalAufgaben.test.mjs.
   ============================================================ */
import { binom, bt, pot, zeile } from "./gfsPascal.js";

export const BUCH_ARTEN = [
  { id: "zeile", name: "Zeile bauen" },
  { id: "doppelt", name: "Zwei Darstellungen" },
  { id: "ausmulti", name: "Ganz ausmultiplizieren" },
  { id: "dreieckszahl", name: "Dreieckszahlen" },
  { id: "begruenden", name: "Begründen" },
];

const zz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const ganz = (s) => { const t = String(s ?? "").replace(/\s/g, "").replace(/−/g, "-"); return /^[+-]?\d+$/.test(t) ? Number(t) : null; };
const stufeIn = (s) => Math.max(1, Math.min(5, s));

/* ---------- Aufgaben erzeugen ---------- */
export function buchAufgabe(art, stufe, zufall = zz) {
  const s = stufeIn(stufe);
  if (art === "zeile") {
    // Gegeben Zeile n, gesucht die linke Hälfte von Zeile n + 1 (der Rest folgt aus der Symmetrie)
    const n = zufall([3, 5, 7, 9, 11][s - 1], [5, 7, 9, 11, 13][s - 1]);
    const ziel = zeile(n + 1);
    const felder = Array.from({ length: Math.floor((n + 1) / 2) }, (_, i) => i + 1);   // Stellen 1 … Mitte
    return { art, n, oben: zeile(n), ziel, felder };
  }
  if (art === "doppelt") {
    // Stufe 1 ohne Zeile 5 – das Einzelbeispiel der Buchseite kommt so nie vor
    const n = s === 1 ? [4, 6, 7][zufall(0, 2)] : zufall([4, 6, 8, 10, 12][s - 1], [6, 8, 10, 12, 15][s - 1]);
    const k = s === 1 ? 1 : zufall(2, Math.floor((n - 1) / 2));
    return { art, n, k, x: binom(n, k) };
  }
  if (art === "ausmulti") {
    const n = zufall([3, 4, 5, 5, 4][s - 1], [4, 5, 6, 7, 5][s - 1]);
    const variante = s <= 2 ? "plus" : s === 3 ? "minus" : s === 4 ? (zufall(0, 1) ? "minus" : "plus") : "faktor";
    const c = variante === "faktor" ? zufall(2, 3) : 1;
    const soll = Array.from({ length: n + 1 }, (_, k) => binom(n, k) * (variante === "minus" ? (-1) ** k : 1) * c ** k);
    return { art, n, variante, c, soll };
  }
  if (art === "dreieckszahl") {
    const m = zufall([4, 5, 8, 12, 20][s - 1], [6, 9, 14, 20, 40][s - 1]);
    return { art, m, wert: (m * (m + 1)) / 2 };
  }
  return { art: "begruenden" };
}

/* ---------- Prüfen ---------- */
/* zeile: eingabe = Array (Stellen 1 … Mitte); ausmulti: Array aller Koeffizienten;
   doppelt: { a, b } (zwei Stellen k); dreieckszahl: { wert, n, k }.
   Ergebnis: { ok, felder: [true|false|null …] } – je Feld richtig/falsch/leer */
export function buchPruefe(a, e) {
  if (a.art === "zeile") {
    const felder = a.felder.map((k, i) => { const v = ganz(e[i]); return v === null ? null : v === a.ziel[k]; });
    return { ok: felder.every((f) => f === true), felder };
  }
  if (a.art === "ausmulti") {
    const felder = a.soll.map((w, i) => { const v = ganz(e[i]); return v === null ? null : v === w; });
    return { ok: felder.every((f) => f === true), felder };
  }
  if (a.art === "doppelt") {
    const p = ganz(e.a), q = ganz(e.b);
    const passt = (k) => k !== null && k >= 0 && k <= a.n && binom(a.n, k) === a.x;
    const felder = [p === null ? null : passt(p), q === null ? null : passt(q)];
    return { ok: passt(p) && passt(q) && p !== q, felder, gleich: p !== null && p === q };
  }
  if (a.art === "dreieckszahl") {
    const w = ganz(e.wert), n = ganz(e.n), k = ganz(e.k);
    const fw = w === null ? null : w === a.wert;
    const fb = n === null || k === null ? null : n >= 0 && k >= 0 && k <= n && binom(n, k) === a.wert;
    return { ok: fw === true && fb === true, felder: [fw, fb] };
  }
  return { ok: false, felder: [] };
}

/* ---------- Aufgabentext ---------- */
export function buchAuftrag(a) {
  if (a.art === "zeile") return `Hier ist Zeile ${a.n}. Baue Zeile ${a.n + 1} – die linke Hälfte genügt, den Rest liefert die Symmetrie.`;
  if (a.art === "doppelt") return `In Zeile ${a.n} kommt die Zahl ${a.x} zweimal vor. An welchen Stellen k steht sie? (Gezählt wird ab 0.)`;
  if (a.art === "ausmulti") {
    if (a.variante === "minus") return "Multipliziere vollständig aus. Achte auf die Vorzeichen.";
    if (a.variante === "faktor") return `Multipliziere vollständig aus. Die ${a.c} steckt in jedem Summanden mit drin.`;
    return "Multipliziere vollständig aus. Trage alle Koeffizienten ein.";
  }
  if (a.art === "dreieckszahl") return `Berechne die ${a.m}. Dreieckszahl 1 + 2 + … + ${a.m} und schreibe sie als Binomialkoeffizienten.`;
  return "";
}

/* Die einzelnen Summanden für „Ganz ausmultiplizieren“: TeX hinter dem Eingabefeld */
export function ausmultiTeile(a) {
  return a.soll.map((_, k) => (a.variante === "faktor" ? pot("x", a.n - k) : `${pot("a", a.n - k)}${pot("b", k)}`));
}
/* Ausmultiplizierte Summe als TeX (Regel A5: kein 1·, kein +−) */
export function ausmultiSummanden(a) {
  const t = ausmultiTeile(a);
  return a.soll.map((w, k) => {
    const betrag = Math.abs(w) === 1 && t[k] ? "" : String(Math.abs(w));
    const zeichen = k === 0 ? (w < 0 ? "-" : "") : w < 0 ? " - " : " + ";
    return `${zeichen}${betrag}${t[k]}`;
  });
}
export const ausmultiSumme = (a) => ausmultiSummanden(a).join("");
export function ausmultiKopf(a) {
  if (a.variante === "faktor") return `(x + ${a.c})^{${a.n}}`;
  return a.variante === "minus" ? `(a - b)^{${a.n}}` : `(a + b)^{${a.n}}`;
}

/* ---------- Rechenweg ---------- */
export function buchRechenweg(a) {
  if (a.art === "zeile") {
    const z = a.felder.map((k) => `${a.oben[k - 1]} + ${a.oben[k]} = ${a.ziel[k]}`);
    return [...z, `\\text{Zeile ${a.n + 1}: } ${a.ziel.join(",\\; ")}`];
  }
  if (a.art === "doppelt") {
    const { n, k, x } = a;
    return [
      `${bt(n, k)} = ${x} \\quad \\text{und} \\quad ${bt(n, n - k)} = ${bt(n, k)} = ${x}`,
      `\\text{Gesucht: } k = ${k} \\text{ und } k = ${n - k} \\quad (\\text{denn } ${k} + ${n - k} = ${n})`,
    ];
  }
  if (a.art === "ausmulti") {
    const z = [`\\text{Zeile ${a.n}: } ${zeile(a.n).join(",\\; ")}`];
    if (a.variante === "minus") z.push("\\text{Vorzeichen abwechselnd: } +,\\; -,\\; +,\\; \\ldots");
    if (a.variante === "faktor") z.push(`\\text{Koeffizient } k\\text{: } ${bt(a.n, "k")} \\cdot ${a.c}^{k}`);
    // Summe in Häppchen zu drei Summanden, damit sie am Handy lesbar bleibt
    const teile = ausmultiSummanden(a);
    for (let i = 0; i < teile.length; i += 3) z.push(`${i === 0 ? `${ausmultiKopf(a)} = ` : "\\qquad "}${teile.slice(i, i + 3).join("")}`);
    return z;
  }
  if (a.art === "dreieckszahl") {
    const { m, wert } = a;
    return [
      `1 + 2 + \\ldots + ${m} = \\frac{${m} \\cdot ${m + 1}}{2} = ${wert}`,
      `${bt(m + 1, 2)} = \\frac{${m + 1} \\cdot ${m}}{2} = ${wert}`,
    ];
  }
  return [];
}

export function buchTipp(a) {
  if (a.art === "zeile") return "Jede innere Zahl ist die Summe der beiden Zahlen schräg darüber: Stelle k entsteht aus Stelle k − 1 und Stelle k der Zeile darüber.";
  if (a.art === "doppelt") return `Die Zeile ist symmetrisch. Steht die Zahl an Stelle k, dann auch an Stelle ${a.n} − k.`;
  if (a.art === "ausmulti") {
    if (a.variante === "minus") return "Schreibe a − b als a + (−b). Dann trägt jeder Summand mit b hoch ungerade ein Minus.";
    if (a.variante === "faktor") return `Ersetze b durch ${a.c}: Der Summand mit x hoch (n − k) bekommt den Faktor (n über k) · ${a.c} hoch k.`;
    return `Die Koeffizienten sind genau die Zahlen aus Zeile ${a.n} des Dreiecks.`;
  }
  if (a.art === "dreieckszahl") return "Paare bilden: 1 + m, 2 + (m − 1), … – jedes Paar ergibt m + 1. In der Diagonale mit k = 2 findest du sie wieder.";
  return "";
}

/* ---------- Begründen: Beweise mit Lücken ---------- */
/* Jeder Schritt: Text (mit $…$ für Formeln), danach eine Lücke mit Auswahl. */
export const BEGRUENDUNGEN = [
  {
    id: "symmetrie", titel: "Warum ist jede Zeile symmetrisch?",
    ziel: "\\binom{n}{k} = \\binom{n}{n-k} \\qquad (0 \\le k \\le n)",
    schritte: [
      { text: "Setze in die Formel $n - k$ an die Stelle von $k$: $\\binom{n}{n-k} = \\frac{n!}{(n-k)! \\cdot (n-(n-k))!}$. Im Nenner vereinfacht sich $n - (n - k)$ zu …",
        optionen: ["$k$", "$n$", "$n - k$"], richtig: 0 },
      { text: "Im Nenner steht jetzt $(n-k)! \\cdot k!$. Die Reihenfolge der Faktoren darf man vertauschen, denn es gilt das …",
        optionen: ["Kommutativgesetz", "Distributivgesetz", "Gesetz der großen Zahlen"], richtig: 0 },
      { text: "Damit ist $\\frac{n!}{k! \\cdot (n-k)!}$ entstanden – also genau …",
        optionen: ["$\\binom{n}{k}$", "$\\binom{n-1}{k}$", "$\\binom{k}{n}$"], richtig: 0 },
      { text: "Zum Abzählen: Wer aus $n$ Plätzen die $k$ Treffer-Plätze auswählt, hat damit gleichzeitig festgelegt …",
        optionen: ["die $n - k$ Plätze der Nieten", "nur den ersten Platz", "gar nichts weiter"], richtig: 0 },
    ],
  },
  {
    id: "diagonale", titel: "Warum stehen die Dreieckszahlen in der Diagonale mit k = 2?",
    ziel: "\\binom{m+1}{2} = 1 + 2 + \\ldots + m",
    schritte: [
      { text: "Die Diagonale direkt daneben besteht aus den Zahlen $\\binom{n}{1}$. Für jede Zeile gilt $\\binom{n}{1} = $ …",
        optionen: ["$n$", "$1$", "$n - 1$"], richtig: 0 },
      { text: "Nach der Bauregel ist $\\binom{n+1}{2} = \\binom{n}{1} + \\binom{n}{2} = n + \\binom{n}{2}$. Jede Zahl der Diagonale entsteht also aus der vorigen, indem man …",
        optionen: ["die nächste natürliche Zahl addiert", "immer 2 addiert", "die Zahl verdoppelt"], richtig: 0 },
      { text: "Die Diagonale beginnt mit $\\binom{2}{2} = 1$. Danach folgen $1 + 2$, $1 + 2 + 3$, … – an der Stelle $\\binom{m+1}{2}$ steht also …",
        optionen: ["die $m$-te Dreieckszahl", "$m^2$", "$2^m$"], richtig: 0 },
    ],
  },
];
/* Reihenfolge der Antworten je Anzeige mischen – die richtige liegt sonst immer vorn */
export function gemischt(optionen, salz = 0) {
  const idx = optionen.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = (i * 7 + salz * 3 + 1) % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}

/* ---------- Gegenüberstellung: Buchaufgabe → Übung in der App ----------
   Für Basti und die Kursseite: welche Idee der GFS-Seite wird wie trainiert. Bewusst keine Buchtexte. */
export const ADAPTION = [
  { buch: "Aufgabe 1 a", idee: "Das Dreieck selbst aufbauen", app: "zeile", wie: "Statt ein ganzes Dreieck abzuschreiben, baut man immer eine neue Zeile aus der vorigen – mit Prüfung jedes Feldes und der Symmetrie als Abkürzung." },
  { buch: "Aufgabe 1 b", idee: "Binomialkoeffizienten im Dreieck ablesen", app: "berechnen", wie: "Zufällige n und k statt einer festen Liste, dazu wahlweise Rechnung mit Fakultäten und die Probe über die Pascal-Regel." },
  { buch: "Aufgabe 1 c", idee: "Eine Zahl rückwärts als Binomialkoeffizient schreiben", app: "rueckwaerts", wie: "Immer neue Zahlen; erkannt werden alle gültigen Darstellungen, auch mehrfache wie 120." },
  { buch: "Aufgabe 2 a", idee: "Eine Zahl steht zweimal in einer Zeile", app: "doppelt", wie: "Beliebige Zeilen bis 15 statt eines Einzelbeispiels; die Rückmeldung zeigt, warum die Stellen zusammen n ergeben." },
  { buch: "Aufgabe 2 b", idee: "Die Symmetrie begründen", app: "begruenden", wie: "Geführter Beweis in vier Schritten, algebraisch und durch Abzählen, mit Auswahl an jeder Lücke." },
  { buch: "Aufgabe 3", idee: "Koeffizienten der binomischen Formel", app: "ausmulti", wie: "Andere Exponenten, dazu (a − b)ⁿ mit Vorzeichen und (x + c)ⁿ mit Faktor – eine Stufe tiefer als im Buch." },
  { buch: "Aufgabe 4", idee: "Dreieckszahlen in der Diagonale", app: "dreieckszahl", wie: "Rechnen (Gauß-Paarbildung) plus Darstellung als (m + 1 über 2), dazu der geführte Beweis und ein Punktebild statt „im Internet informieren“." },
];
