/* ============================================================
   GFS-Trainer · Pascal’sches Dreieck und Binomialkoeffizienten
   Reine Logik und Daten (keine Importe): Aufgaben, Rechenwege,
   Gliederung und Kolloquiumsfragen. Getestet in tests/gfsPascal.test.mjs.
   ============================================================ */

/* ---------- Rechnen ---------- */

export function binom(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0;
  const m = Math.min(k, n - k);
  let w = 1;
  for (let i = 1; i <= m; i++) w = (w * (n - m + i)) / i;
  return Math.round(w);
}

export const fakultaet = (n) => { let w = 1; for (let i = 2; i <= n; i++) w *= i; return w; };

export const zeile = (n) => Array.from({ length: n + 1 }, (_, k) => binom(n, k));

/* Alle Darstellungen x = (n über k) mit 2 ≤ k ≤ n − 2, nur die linke Hälfte und ihr Spiegelbild */
export function darstellungen(x) {
  const aus = [];
  for (let n = 4; n <= x; n++) {
    if (binom(n, 2) > x) break;
    for (let k = 2; k <= n / 2; k++) {
      const w = binom(n, k);
      if (w > x) break;
      if (w === x) { aus.push([n, k]); if (k !== n - k) aus.push([n, n - k]); }
    }
  }
  return aus.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

/* ---------- TeX-Bausteine ---------- */

export const bt = (n, k) => `\\binom{${n}}{${k}}`;
/* Potenz ohne ^1 und ohne ^0 (Regel A5) */
export const pot = (basis, e) => (e === 0 ? "" : e === 1 ? basis : `${basis}^{${e}}`);
/* Absteigendes Produkt von oben bis unten, z. B. 10 · 9 · 8 */
const produkt = (oben, anzahl) => Array.from({ length: anzahl }, (_, i) => oben - i).join(" \\cdot ");

/* ---------- Aufgaben ---------- */

export const STUFEN_NMAX = [6, 8, 10, 12, 15];
export const ARTEN = [
  { id: "berechnen", name: "Berechnen" },
  { id: "rueckwaerts", name: "Rückwärts" },
  { id: "binomisch", name: "Binomische Formel" },
];

const zz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

export function aufgabe(art, stufe, zufall = zz) {
  const nMax = STUFEN_NMAX[Math.max(1, Math.min(5, stufe)) - 1];
  if (art === "rueckwaerts") {
    const n = zufall(Math.max(4, nMax - 4), nMax);
    const k = zufall(2, Math.floor(n / 2));
    const x = binom(n, k);
    return { art, x, loesungen: darstellungen(x) };
  }
  if (art === "binomisch") {
    const n = zufall(Math.max(3, nMax - 5), Math.min(nMax, 10));
    const k = zufall(1, n - 1);
    const c = stufe >= 4 ? zufall(2, 3) : 1;
    return { art, n, k, c, soll: binom(n, k) * c ** k };
  }
  const n = zufall(Math.max(3, nMax - 4), nMax);
  const k = stufe === 1 ? zufall(0, n) : zufall(2, n - 2);
  return { art: "berechnen", n, k, soll: binom(n, k) };
}

/* Aufgabentext als TeX (für den Kopf der Aufgabenkarte) */
export function aufgabeTex(a) {
  if (a.art === "rueckwaerts") return `${a.x} = \\binom{n}{k}`;
  if (a.art === "binomisch") {
    return a.c === 1
      ? `(a + b)^{${a.n}}: \\text{ Koeffizient von } ${pot("a", a.n - a.k)}${pot("b", a.k)}`
      : `(x + ${a.c})^{${a.n}}: \\text{ Koeffizient von } ${pot("x", a.n - a.k)}`;
  }
  return bt(a.n, a.k);
}

export function pruefe(a, eingabe) {
  if (a.art === "rueckwaerts") {
    const n = Number(eingabe.n), k = Number(eingabe.k);
    if (!Number.isInteger(n) || !Number.isInteger(k)) return "unlesbar";
    if (k < 2 || k > n - 2) return "rand";
    return binom(n, k) === a.x ? "ok" : "nein";
  }
  const t = String(eingabe).replace(/[\s.]/g, "");
  if (!/^\d+$/.test(t)) return "unlesbar";
  return Number(t) === a.soll ? "ok" : "nein";
}

/* Vollständiger Rechenweg: Zeilen als TeX */
export function rechenweg(a) {
  if (a.art === "rueckwaerts") {
    const z = [];
    const [n, k] = a.loesungen[0];
    z.push(`${bt(n, k)} = \\frac{${produkt(n, k)}}{${produkt(k, k)}} = ${a.x}`);
    const alle = a.loesungen.map(([p, q]) => bt(p, q)).join(", \\; ");
    z.push(`\\text{Alle Lösungen: } ${alle}`);
    return z;
  }
  if (a.art === "binomisch") {
    const { n, k, c } = a;
    const b = binom(n, k);
    if (c === 1) {
      return [
        `(a + b)^{${n}} = \\ldots + ${bt(n, k)} \\cdot ${pot("a", n - k)}${pot("b", k)} + \\ldots`,
        `${bt(n, k)} = ${b}`,
      ];
    }
    const ck = c ** k;
    return [
      `(x + ${c})^{${n}} = \\ldots + ${bt(n, k)} \\cdot ${pot("x", n - k)} \\cdot ${pot(String(c), k)} + \\ldots`,
      k === 1
        ? `${bt(n, k)} \\cdot ${c} = ${b} \\cdot ${c} = ${b * c}`
        : `${bt(n, k)} \\cdot ${pot(String(c), k)} = ${b} \\cdot ${ck} = ${b * ck}`,
    ];
  }
  const { n, k, soll } = a;
  const m = Math.min(k, n - k);
  const z = [];
  if (m === 0) {
    z.push(`${bt(n, k)} = \\frac{${n}!}{${k}! \\cdot ${n - k}!} = 1`);
    return z;
  }
  if (m !== k) z.push(`${bt(n, k)} = ${bt(n, m)} \\quad \\text{(Symmetrie)}`);
  if (m === 1) {
    z.push(`${bt(n, m)} = \\frac{${n}!}{1! \\cdot ${n - 1}!} = ${n}`);
    return z;
  }
  z.push(`${bt(n, m)} = \\frac{${n}!}{${m}! \\cdot ${n - m}!} = \\frac{${produkt(n, m)}}{${produkt(m, m)}}`);
  z.push(`= \\frac{${fakultaet(n) / fakultaet(n - m)}}{${fakultaet(m)}} = ${soll}`);
  z.push(`\\text{Probe: } ${bt(n - 1, k - 1)} + ${bt(n - 1, k)} = ${binom(n - 1, k - 1)} + ${binom(n - 1, k)} = ${soll}`);
  return z;
}

/* Ein Tipp, wenn die Eingabe falsch war */
export function tipp(a) {
  if (a.art === "rueckwaerts") return `Suche ${a.x} im Dreieck: Die Zeilennummer ist n, die Stelle in der Zeile (bei 0 beginnend gezählt) ist k.`;
  if (a.art === "binomisch") {
    return a.c === 1
      ? "Der Exponent von b verrät k, der Exponent der Klammer verrät n. Der Koeffizient ist der Binomialkoeffizient aus Zeile n an Stelle k."
      : `Der Summand mit x hoch ${a.n - a.k} enthält die ${a.c} genau ${a.k}-mal. Multipliziere den Binomialkoeffizienten mit dieser Potenz von ${a.c}.`;
  }
  return "Kürze die Fakultäten: Im Zähler bleiben die k größten Faktoren von n! stehen, im Nenner steht k!. Oder lies die Zahl im Dreieck ab.";
}

/* ---------- GFS: Gliederung und Kolloquium ---------- */

export const GLIEDERUNG = [
  { min: 2, titel: "Einstieg", text: "Baue die ersten fünf Zeilen des Dreiecks live an der Tafel auf und lass die Klasse die nächste Zeile ergänzen. Dann die Leitfrage: Warum stehen hier genau die Binomialkoeffizienten?" },
  { min: 3, titel: "Zwei Bauanleitungen", text: "Die Summenregel des Dreiecks und die Formel mit Fakultäten. Erkläre, was der Binomialkoeffizient zählt: Möglichkeiten, k Treffer auf n Plätze zu verteilen." },
  { min: 5, titel: "Der Beweis", text: "Erst das Beispiel (5 über 3) = (4 über 2) + (4 über 3), dann die allgemeine Pascal-Regel mit gemeinsamem Nenner. Zum Schluss: gleiche Ränder plus gleiche Regel ergibt Zeile für Zeile dieselben Zahlen." },
  { min: 3, titel: "Muster und Anwendungen", text: "Binomische Formeln für (a + b) hoch n, Pfade in der Binomialverteilung, Symmetrie, Zeilensumme 2 hoch n, Dreieckszahlen in der dritten Diagonale." },
  { min: 2, titel: "Geschichte und Fazit", text: "Pascal, aber auch al-Karadschi, Omar Chayyam, Jia Xian und Yang Hui. Fazit in einem Satz und Überleitung zu den Fragen." },
];

export const TIPPS = [
  "Den Beweis an der Tafel entwickeln, nicht auf einer Folie zeigen – die Lehrkraft will sehen, dass du ihn selbst führen kannst.",
  "Immer zuerst das konkrete Zahlenbeispiel, danach die allgemeine Rechnung mit n und k.",
  "Auf das Handout gehören die Formel, die Pascal-Regel, das Dreieck bis Zeile 10 und zwei Übungsaufgaben mit Lösung.",
];

export const KOLLOQUIUM = [
  { stufe: "Basis", frage: "Warum legt man 0! = 1 fest?",
    antwort: "Weil n! = n · (n − 1)! dann auch für n = 1 gilt: 1! = 1 · 0!. Außerdem liefert die Formel nur so (n über 0) = 1 – und es gibt genau eine Möglichkeit, keinen Treffer auszuwählen. 0! ist ein leeres Produkt, und das leere Produkt ist 1." },
  { stufe: "Basis", frage: "Warum ist das Dreieck symmetrisch?",
    antwort: "Es gilt (n über k) = (n über n − k). Wer k Treffer-Plätze auswählt, legt damit automatisch die n − k Nieten-Plätze fest. In der Formel vertauschen k! und (n − k)! im Nenner einfach ihre Rollen." },
  { stufe: "Basis", frage: "Was bedeutet (n über k) eigentlich?",
    antwort: "Die Anzahl der Möglichkeiten, aus n Plätzen genau k auszuwählen – zum Beispiel die Anzahl der Pfade mit genau k Treffern in einem Baumdiagramm mit n Stufen." },
  { stufe: "Vertiefung", frage: "Warum ist die Summe jeder Zeile eine Zweierpotenz?",
    antwort: "Zeile n zählt alle Treffer-Nieten-Ketten der Länge n, sortiert nach der Anzahl der Treffer. Insgesamt gibt es 2 · 2 · … · 2 = 2ⁿ solche Ketten. Algebraisch: (1 + 1)ⁿ ausmultiplizieren." },
  { stufe: "Vertiefung", frage: "Was hat das Dreieck mit (a + b)ⁿ zu tun?",
    antwort: "Beim Ausmultiplizieren wählt man aus jeder der n Klammern a oder b. Der Summand aⁿ⁻ᵏbᵏ entsteht so oft, wie man k der n Klammern für b auswählen kann – also (n über k)-mal. Das ist der binomische Lehrsatz." },
  { stufe: "Vertiefung", frage: "Wo braucht man das in der Binomialverteilung?",
    antwort: "In P(X = k) = (n über k) · pᵏ · (1 − p)ⁿ⁻ᵏ. Jeder Pfad mit k Treffern hat dieselbe Wahrscheinlichkeit pᵏ(1 − p)ⁿ⁻ᵏ, und (n über k) zählt, wie viele solcher Pfade es gibt." },
  { stufe: "Vertiefung", frage: "Warum stehen die Dreieckszahlen in der dritten Diagonale?",
    antwort: "(n über 2) = n(n − 1)/2 = 1 + 2 + … + (n − 1). Mit der Summenregel: Jede Zahl der dritten Diagonale ist die vorige plus die Zahl links daneben aus der zweiten Diagonale – und dort stehen 1, 2, 3, 4, … Man addiert also immer die nächste natürliche Zahl." },
  { stufe: "Profi", frage: "Für welche k gilt die Pascal-Regel genau – und warum?",
    antwort: "Für 1 ≤ k ≤ n − 1. Bei k = 0 käme (n − 1 über −1) vor, bei k = n käme (n − 1 über n) vor – beide sind mit der Formel nicht definiert. Die Ränder behandelt man deshalb getrennt: Dort steht immer 1." },
  { stufe: "Profi", frage: "Geht der Beweis auch ohne Bruchrechnung?",
    antwort: "Ja, durch Abzählen. Wähle k aus n Personen aus und betrachte eine feste Person. Entweder sie ist dabei – dann wählt man noch k − 1 aus den übrigen n − 1 – oder sie ist nicht dabei – dann wählt man alle k aus den übrigen n − 1. Zusammen: (n − 1 über k − 1) + (n − 1 über k)." },
  { stufe: "Profi", frage: "Warum folgt aus der Pascal-Regel, dass alle Zahlen übereinstimmen?",
    antwort: "Vollständige Induktion über die Zeilen: Zeile 0 stimmt. Stimmt Zeile n − 1, dann stimmen in Zeile n die Ränder (beide 1) und alle inneren Zahlen, weil beide Dreiecke mit derselben Regel aus denselben Zahlen darüber gebildet werden." },
  { stufe: "Profi", frage: "Was sieht man, wenn man nur die ungeraden Zahlen einfärbt?",
    antwort: "Das Sierpinski-Dreieck, ein Fraktal: ein Dreieck aus drei Dreiecken, jedes davon wieder aus drei Dreiecken und so weiter. Es entsteht, weil gerade + gerade und ungerade + ungerade gerade ergeben." },
];
