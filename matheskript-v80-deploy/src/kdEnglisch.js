/* ======================================================================
   Kurvendiskussion auf Englisch.
   Die Rechenwege (Polynomplotter, Advanced Plotter) werden auf Deutsch
   aufgebaut. kdText() übersetzt jede Zeile – zuerst ganze Sätze und
   Satzmuster, dann Fachbegriffe, zuletzt die Punktnamen (H → Max usw.).
   Wird für den PDF-Export und als Rückfall für die Anzeige verwendet.
   ====================================================================== */

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const B = "(?<![\\p{L}])", E = "(?![\\p{L}])";
const wort = (de) => new RegExp(B + esc(de) + E, "gu");

/* Ganze Sätze und Satzmuster (Reihenfolge wichtig: lang vor kurz). */
const MUSTER = [
  [/^Diese Gleichung ist für jedes x erfüllt\.$/u, "This equation holds for every x."],
  [/^Diese Gleichung hat keine Lösung\.$/u, "This equation has no solution."],
  [/^x ausklammern: (.*) ist eine Lösung\.$/u, "Factor out x: $1 is a solution."],
  [/^Ausprobieren: (.*) ist eine Nullstelle\.$/u, "Trial: $1 is a zero."],
  [/^Rest = 0(\s*)(⇒|=>)(\s*)die Division geht ohne Rest auf\.$/u, "Remainder = 0$1$2$3the division leaves no remainder."],
  [/^Probe: /u, "Check: "],
  [/^Quadratische Gleichung lösen \(MNF\)$/u, "Solve the quadratic equation (quadratic formula)"],
  [/^Für den verbleibenden Faktor vom Grad (\d+) gibt es keine ganzzahlige Nullstelle [-−–] die weiteren Lösungen werden numerisch angenähert \(Bisektionsverfahren\)\.$/u,
    "The remaining factor of degree $1 has no integer zero – the other solutions are approximated numerically (bisection method)."],
  [/^Keine weiteren reellen Lösungen gefunden\.$/u, "No further real solutions found."],
  [/^Numerisch: /u, "Numerically: "],
  [/keine reelle Lösung\./u, "no real solution."],

  [/^D\(f\) = (ℝ|R) \(alle reellen Zahlen\), da f eine ganzrationale Funktion \(ein Polynom\) ist\.$/u, "D(f) = $1 (all real numbers), since f is a polynomial function."],
  [/^f enthält nur ungerade Exponenten \(x\^3 und x\^1\)\. Es gilt f\(-x\) = -f\(x\), daher ist f punktsymmetrisch zum Ursprung\.$/u,
    "f contains only odd exponents (x^3 and x^1). Since f(-x) = -f(x), f is point-symmetric about the origin."],
  [/^f enthält nur gerade Exponenten \(x\^4, x\^2, x\^0\)\. Es gilt f\(-x\) = f\(x\), daher ist f achsensymmetrisch zur y-Achse\.$/u,
    "f contains only even exponents (x^4, x^2, x^0). Since f(-x) = f(x), f is symmetric about the y-axis."],
  [/^f enthält sowohl gerade als auch ungerade Exponenten mit Koeffizient ungleich 0\. Es gilt weder f\(-x\) = f\(x\) noch f\(-x\) = -f\(x\) [-−–] es liegt keine Symmetrie zur y-Achse oder zum Ursprung vor\.$/u,
    "f contains both even and odd exponents with non-zero coefficients. Neither f(-x) = f(x) nor f(-x) = -f(x) holds – there is no symmetry about the y-axis or the origin."],
  [/^f\(−x\) = f\(x\) für alle x ⇒ achsensymmetrisch zur y-Achse\.$/u, "f(−x) = f(x) for all x ⇒ symmetric about the y-axis."],
  [/^f\(−x\) = −f\(x\) für alle x ⇒ punktsymmetrisch zum Ursprung\.$/u, "f(−x) = −f(x) for all x ⇒ point-symmetric about the origin."],
  [/^Weder f\(−x\) = f\(x\) noch f\(−x\) = −f\(x\) ⇒ keine Symmetrie zur y-Achse oder zum Ursprung\.$/u,
    "Neither f(−x) = f(x) nor f(−x) = −f(x) ⇒ no symmetry about the y-axis or the origin."],

  [/^f ist konstant: (.*) für alle x\.$/u, "f is constant: $1 for all x."],
  [/^Grad n = (\S+) \(gerade\), Leitkoeffizient (\S+) \(positiv\)\.$/u, "Degree n = $1 (even), leading coefficient $2 (positive)."],
  [/^Grad n = (\S+) \(gerade\), Leitkoeffizient (\S+) \(negativ\)\.$/u, "Degree n = $1 (even), leading coefficient $2 (negative)."],
  [/^Grad n = (\S+) \(ungerade\), Leitkoeffizient (\S+) \(positiv\)\.$/u, "Degree n = $1 (odd), leading coefficient $2 (positive)."],
  [/^Grad n = (\S+) \(ungerade\), Leitkoeffizient (\S+) \(negativ\)\.$/u, "Degree n = $1 (odd), leading coefficient $2 (negative)."],
  [/^Damit gilt: f\(x\) strebt für x (->|→) plus unendlich UND für x (->|→) minus unendlich gegen (plus|minus) unendlich\.$/u,
    "Hence: f(x) tends to $3 infinity as x $1 plus infinity AND as x $2 minus infinity."],
  [/^Damit gilt: f\(x\) strebt für x (->|→) plus unendlich gegen (plus|minus) unendlich, und für x (->|→) minus unendlich gegen (plus|minus) unendlich\.$/u,
    "Hence: f(x) tends to $2 infinity as x $1 plus infinity, and to $4 infinity as x $3 minus infinity."],

  [/^Ansatz: f\(x\) = 0$/u, "Set f(x) = 0"],
  [/^f besitzt keine reelle Nullstelle\.$/u, "f has no real zero."],
  [/^Da f höchstens linear ist \(Grad kleiner\/gleich 1\), besitzt f keine Extrempunkte\.$/u, "Since f is at most linear (degree at most 1), f has no extreme points."],
  [/^Da f höchstens quadratisch ist \(Grad kleiner\/gleich 2\), besitzt f keine Wendepunkte\.$/u, "Since f is at most quadratic (degree at most 2), f has no inflection points."],
  [/^f besitzt keine Extrempunkte\.$/u, "f has no extreme points."],
  [/^f besitzt keine Wendepunkte\.$/u, "f has no inflection points."],
  [/^Hinr\. Bed\.: Vorzeichen von f'' prüfen$/u, "Sufficient condition: check the sign of f''"],
  [/^Hinr\. Bed\.: Vorzeichen von f″ bzw\. Vorzeichenwechsel von f′$/u, "Sufficient condition: sign of f″ or sign change of f′"],
  [/^Notw\. Bed\.: (.*) mit Vorzeichenwechsel$/u, "Necessary condition: $1 with sign change"],
  [/^Notw\. Bed\.: /u, "Necessary condition: "],
  [/^f'\(x\) ist auf ganz (ℝ|R) gleich 0 — f ist konstant, weder monoton steigend noch fallend\.$/u, "f'(x) = 0 on all of $1 — f is constant, neither increasing nor decreasing."],
  [/^f''\(x\) ist auf ganz (ℝ|R) gleich 0 — f hat keine Krümmung \(f ist eine Gerade oder konstant\)\.$/u, "f''(x) = 0 on all of $1 — f has no curvature (f is a line or constant)."],
  [/^Es gibt weniger als zwei Nullstellen — dadurch lässt sich kein Intervall zwischen Nullstellen bilden\.$/u, "There are fewer than two zeros — so no interval between zeros can be formed."],

  [/^… und (\d+) weitere im Untersuchungsbereich\.$/u, "… and $1 more in the examined range."],
  [/^f ist im Untersuchungsbereich (.*) nirgends definiert\.$/u, "f is not defined anywhere in the examined range $1."],
  [/^D\(f\) = ℝ ohne (\d+) Stellen im Bereich (.*)$/u, "D(f) = ℝ without $1 points in the range $2"],
  [/^Ausgenommen sind u\. a\. (.*) \(die Lücken wiederholen sich\)\.$/u, "Excluded are, among others, $1 (the gaps repeat)."],
  [/^Numerisch bestimmt im Untersuchungsbereich (.*)\.$/u, "Determined numerically in the examined range $1."],
  [/: f schwingt und hat keinen Grenzwert\.$/u, ": f oscillates and has no limit."],
  [/: kein eindeutiger Grenzwert erkennbar\.$/u, ": no clear limit recognizable."],
  [/^Waagerechte Asymptote (.*) für x → (.*)\.$/u, "Horizontal asymptote $1 as x → $2."],
  [/^Senkrechte Asymptote (.*) am Rand des Definitionsbereichs\.$/u, "Vertical asymptote $1 at the edge of the domain."],
  [/^Im Untersuchungsbereich ist kein besonderes Grenzverhalten erkennbar\.$/u, "No special limit behavior in the examined range."],
  [/^f hat im Untersuchungsbereich (.*) keine Nullstelle\.$/u, "f has no zero in the examined range $1."],
  [/^Numerisch bestimmt \(Vorzeichenwechsel und Bisektion\)\.$/u, "Determined numerically (sign change and bisection)."],
  [/^f′ hat im Untersuchungsbereich keine Nullstelle ⇒ keine Extrempunkte\.$/u, "f′ has no zero in the examined range ⇒ no extreme points."],
  [/^f hat im Untersuchungsbereich keine Wendepunkte\.$/u, "f has no inflection points in the examined range."],
  [/^keiner, da f\(0\) nicht definiert ist$/u, "none, since f(0) is not defined"],
  [/^Es gibt keine zwei benachbarten Nullstellen mit stetigem Verlauf dazwischen — kein Nullstellenintegral\.$/u,
    "There are no two adjacent zeros with a continuous graph in between — no integral between zeros."],
  [/^Numerisch berechnet \(Simpson-Regel\)\.$/u, "Computed numerically (Simpson's rule)."],
  [/: hebbare Definitionslücke, /u, ": removable discontinuity, "],
  [/^Polstelle (⇒|=>) senkrechte Asymptote /u, "Pole $1 vertical asymptote "],
];

/* Überschriften und feste Begriffe */
const BEGRIFFE = [
  ["1. Definitionsbereich", "1. Domain"],
  ["2. Symmetrie", "2. Symmetry"],
  ["3. Verhalten im Unendlichen", "3. End behavior"],
  ["3. Grenzverhalten und Asymptoten", "3. Limits and asymptotes"],
  ["4. Nullstellen", "4. Zeros"],
  ["5. Erste und zweite Ableitung", "5. First and second derivative"],
  ["6. Extrempunkte", "6. Extreme points"],
  ["7. Monotonieverhalten", "7. Monotonicity"],
  ["8. Wendepunkte", "8. Inflection points"],
  ["9. Krümmungsverhalten", "9. Concavity"],
  ["10. Alle markanten Punkte", "10. All key points"],
  ["11. Integrale zwischen den Nullstellen", "11. Integrals between the zeros"],
  ["(nächster Term)", "(next term)"],
  ["(doppelte Lösung)", "(double solution)"],
  ["(doppelt)", "(double)"],
  ["doppelte Lösung", "double solution"],
  ["Quadratische Gleichung", "Quadratic equation"],
  ["Lineare Gleichung", "Linear equation"],
  ["Stammfunktion", "Antiderivative"],
  ["Intervall", "Interval"],
  ["y-Achsenabschnitt", "y-intercept"],
  ["streng monoton steigend", "strictly increasing"],
  ["streng monoton fallend", "strictly decreasing"],
  ["Linkskurve (konvex)", "concave up"],
  ["Rechtskurve (konkav)", "concave down"],
  ["kein Krümmungsverhalten", "no curvature"],
  ["keine Krümmung", "no curvature"],
  ["Sattelpunkt", "saddle point"],
  ["Hochpunkt", "maximum"],
  ["Tiefpunkt", "minimum"],
  ["Wendepunkte", "Inflection points"],
  ["Wendepunkt", "Inflection point"],
  ["Extrempunkte", "Extreme points"],
  ["Nullstellen", "Zeros"],
  ["Nullstelle", "zero"],
  ["konstant", "constant"],
  ["da f(0) =", "since f(0) ="],
  ["plus unendlich", "plus infinity"],
  ["minus unendlich", "minus infinity"],
].map(([de, en]) => [wort(de), en]);

/* Punktnamen: H(…|…) → Max(…|…), T → Min, S → SP, W → IP, N → Z, Sᵧ → Y */
const PUNKT = { H: "Max", T: "Min", S: "SP", W: "IP", N: "Z", "Sᵧ": "Y" };
const PUNKT_RE = /(?<![\p{L}])(Sᵧ|[HTSWN])([₀-₉]*)\((?=[^()]*\|)/gu;

export function kdText(s) {
  if (s == null) return s;
  let t = String(s);
  const vorne = t.match(/^\s*/)[0];
  t = t.slice(vorne.length);
  for (const [re, en] of MUSTER) t = t.replace(re, en);
  for (const [re, en] of BEGRIFFE) t = t.replace(re, en);
  t = t.replace(/(\d),(\d)/g, "$1.$2");   // Dezimalkomma → Dezimalpunkt
  t = t.replace(PUNKT_RE, (_, k, idx) => `${PUNKT[k]}${idx}(`);
  // Hochpunkt/Tiefpunkt/Sattelpunkt stehen jetzt klein mitten im Satz – am Zeilenanfang groß schreiben
  t = t.replace(/^(maximum|minimum|saddle point)/u, (w) => w[0].toUpperCase() + w.slice(1));
  return vorne + t;
}

/* Übersetzt den kompletten Inhalt einer Kurvendiskussion (Abschnitte, Zeilen, Polynomdivision). */
export function kdInhalt(inhalt) {
  const zeile = (zl) => {
    if (!zl) return zl;
    if (zl.pd) return { ...zl, anfang: zeile(zl.anfang), mitte: zl.mitte.map(zeile), ende: zl.ende.map(zeile) };
    return { ...zl, txt: zl.formel || zl.tex ? zl.txt : kdText(zl.txt), notiz: zl.notiz ? kdText(zl.notiz) : zl.notiz };
  };
  return { ...inhalt, abschnitte: inhalt.abschnitte.map((sek) => ({ ...sek, titel: kdText(sek.titel), zeilen: sek.zeilen.map(zeile) })) };
}
