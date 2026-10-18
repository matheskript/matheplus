/* ======================================================================
   ungleichGen.js – Aufgaben für „Ungleichungen und Beträge“
   Vier Kapitel: lineare Ungleichungen · Betrag und Betragsgleichungen ·
   Betragsungleichungen · quadratische Ungleichungen.

   Jede Aufgabe ist reine Daten:
     { art, text: [de, en], schritte: [...], pruef }
   Schritte (vom UI in zs/ws aus geoUi.jsx übersetzt):
     { typ: "zahl", id, titel, frage, text, wert, hinweis, erkl, fehler: [{ wert, text }] }
     { typ: "wahl", id, titel, frage, optionen: [[schlüssel, anzeige]], richtig, hinweis, erkl, fehler: [{ wahl, text }] }
   Texte sind Paare [de, en]; reine TeX-Strings sind sprachneutral.
   pruef: { f(x) → wahr/falsch der Ausgangs-Ungleichung, menge } bzw. { g(x) → links − rechts, loes }
   – damit prüft tests/ungleichGen.test.mjs jede Aufgabe numerisch nach.
   Kein React.
   ====================================================================== */
import {
  DREH, LEER, R, REL_TEX, REL_TEXT, abstandTex, gilt, ganz, ganzOhne0, halbIntervall, istStreng, iv, linTex, loesTex,
  dezTex, mengeTex, mengenOptionen, nachbarnHalb, ohne, pktMenge, quadTex, ver, wahlAus, zKl, zTex,
} from "./mengenRechnen.js";

const T = (de, en) => [de, en];
/* Denkfehler, die mit der richtigen Antwort zusammenfallen (oder keine Option sind), fallen weg */
const zahl = (id, titel, frage, text, wert, o = {}) => ({ typ: "zahl", id, titel, frage, text, wert, ...o, fehler: (o.fehler || []).filter((f) => Math.abs(f.wert - wert) > 1e-9) });
const wahl = (id, titel, frage, optionen, richtig, o = {}) => ({ typ: "wahl", id, titel, frage, optionen, richtig, ...o,
  fehler: (o.fehler || []).filter((f) => f.wahl !== richtig && optionen.some((op) => op[0] === f.wahl)) });
/* Optionen deterministisch rotieren, damit die richtige nicht immer vorn steht */
const dreh = (l, k) => { const n = l.length; const s = ((k % n) + n) % n; return [...l.slice(s), ...l.slice(0, s)]; };
const relT = (rel) => REL_TEXT[rel];

/* Schritt „Lösungsmenge“ für ein Halbintervall x rel g */
function mengeSchritt(id, rel, g, k) {
  const [richtig, klammer, falschRichtung] = nachbarnHalb(rel, g);
  const opt = dreh(mengenOptionen([richtig, klammer, falschRichtung]), k);
  return wahl(id, T("Lösungsmenge", "Solution set"), T("Wie lautet die Lösungsmenge L?", "What is the solution set L?"), opt, mengeTex(richtig), {
    fehler: [
      { wahl: mengeTex(klammer), text: istStreng(rel) ? T(`Bei „${relT(rel)}“ gehört ${zText0(g)} nicht dazu – die Klammer zeigt nach außen.`, `With “${relT(rel)}”, ${zText0(g)} is not included – the bracket points outwards.`) : T(`Bei „${relT(rel)}“ gehört ${zText0(g)} dazu – die Klammer zeigt zur Zahl.`, `With “${relT(rel)}”, ${zText0(g)} is included – the bracket faces the number.`) },
      { wahl: mengeTex(falschRichtung), text: T("Falsche Richtung: Prüfe mit einer Zahl, die deutlich links von der Grenze liegt.", "Wrong direction: test with a number clearly to the left of the bound.") },
    ],
    hinweis: T("Bei < und > ist die Grenze ausgeschlossen (Klammer nach außen), bei ≤ und ≥ eingeschlossen. ∞ bekommt immer eine offene Klammer.", "With < and > the bound is excluded (bracket facing out), with ≤ and ≥ included. ∞ always gets an open bracket."),
    erkl: T(`$L = ${mengeTex(richtig)}$`, `$L = ${mengeTex(richtig)}$`),
  });
}
const zText0 = (g) => `$${zTex(g)}$`;

/* ======================================================================
   KAPITEL 1 · LINEARE UNGLEICHUNGEN
   ====================================================================== */
export const LIN_ARTEN = ["einfach", "negativ", "beidseitig", "doppelt", "sach"];

function linEinfach(z, negativ) {
  const a = negativ ? -ganz(2, 6, z) : ganz(2, 6, z);
  const g = ganz(-6, 6, z);
  const b = ganzOhne0(-9, 9, z);
  const rel = wahlAus(["<", "<=", ">", ">="], z);
  const c = a * g + b;
  const rel2 = a < 0 ? DREH[rel] : rel;
  const k = ganz(0, 5, z);
  const fall = T(`Löse die Ungleichung $${linTex(a, b)} ${REL_TEX[rel]} ${zTex(c)}$.`, `Solve the inequality $${linTex(a, b)} ${REL_TEX[rel]} ${zTex(c)}$.`);
  const optTeilen = dreh([
    [loesTex(rel2, g), `$${loesTex(rel2, g)}$`],
    [loesTex(DREH[rel2], g), `$${loesTex(DREH[rel2], g)}$`],
    [loesTex(rel2, -g === g ? g + 1 : -g), `$${loesTex(rel2, -g === g ? g + 1 : -g)}$`],
  ], k);
  return {
    art: negativ ? "negativ" : "einfach", text: fall,
    schritte: [
      zahl("ug-l1", T("Zahl hinüberbringen", "Move the number"), T(`Rechne auf beiden Seiten ${b > 0 ? "− " + b : "+ " + -b}. Was steht dann rechts?`, `Apply ${b > 0 ? "− " + b : "+ " + -b} on both sides. What is on the right?`),
        `$${linTex(a, 0)} ${REL_TEX[rel]}$`, c - b, {
          fehler: [{ wert: c + b, text: T("Beim Hinüberbringen wechselt die Zahl ihr Rechenzeichen.", "When you move the number, its operation switches.") }],
          hinweis: T("Wie bei einer Gleichung: Auf beiden Seiten dasselbe rechnen. Plus und Minus ändern das Ungleichheitszeichen nie.", "Like an equation: do the same on both sides. Adding and subtracting never change the inequality sign."),
          erkl: T(`$${linTex(a, 0)} ${REL_TEX[rel]} ${zTex(c - b)}$`, `$${linTex(a, 0)} ${REL_TEX[rel]} ${zTex(c - b)}$`) }),
      wahl("ug-l2", T(`Durch ${zTex(a)} teilen`, `Divide by ${zTex(a)}`), T(`Teile durch $${zTex(a)}$. Was entsteht?`, `Divide by $${zTex(a)}$. What do you get?`), optTeilen, loesTex(rel2, g), {
        fehler: [{ wahl: loesTex(DREH[rel2], g), text: a < 0 ? T("Du teilst durch eine negative Zahl – dabei dreht sich das Ungleichheitszeichen um.", "You divide by a negative number – this flips the inequality sign.") : T("Durch eine positive Zahl teilen ändert das Zeichen nicht.", "Dividing by a positive number does not change the sign.") }],
        hinweis: T("Mal oder geteilt durch eine negative Zahl dreht das Zeichen: < wird >, ≤ wird ≥.", "Multiplying or dividing by a negative number flips the sign: < becomes >, ≤ becomes ≥."),
        erkl: a < 0
          ? T(`$${linTex(a, 0)} ${REL_TEX[rel]} ${zTex(c - b)} \\;\\mid : ${zKl(a)} \\;\\Rightarrow\\; ${loesTex(rel2, g)}$ – Zeichen gedreht.`, `$${linTex(a, 0)} ${REL_TEX[rel]} ${zTex(c - b)} \\;\\mid : ${zKl(a)} \\;\\Rightarrow\\; ${loesTex(rel2, g)}$ – sign flipped.`)
          : T(`$${loesTex(rel2, g)}$`, `$${loesTex(rel2, g)}$`) }),
      mengeSchritt("ug-l3", rel2, g, k + 1),
    ],
    pruef: { f: (x) => gilt(a * x + b, rel, c), menge: halbIntervall(rel2, g) },
  };
}

function linBeidseitig(z) {
  let a, cc;
  do { a = ganzOhne0(-5, 7, z); cc = ganzOhne0(-5, 7, z); } while (a === cc);
  const g = ganz(-6, 6, z);
  const b = ganz(-9, 9, z);
  const d = (a - cc) * g + b;
  const rel = wahlAus(["<", "<=", ">", ">="], z);
  const k = a - cc;
  const rel2 = k < 0 ? DREH[rel] : rel;
  const seed = ganz(0, 5, z);
  return {
    art: "beidseitig",
    text: T(`Löse $${linTex(a, b)} ${REL_TEX[rel]} ${linTex(cc, d)}$.`, `Solve $${linTex(a, b)} ${REL_TEX[rel]} ${linTex(cc, d)}$.`),
    schritte: [
      zahl("ug-b1", T("Sortieren", "Sort"), T(`Bring alle x nach links und alle Zahlen nach rechts. Welche Zahl steht rechts?`, `Bring all x to the left and all numbers to the right. Which number is on the right?`),
        `$${linTex(k, 0)} ${REL_TEX[rel]}$`, d - b, {
          fehler: [{ wert: d + b, text: T("Vorzeichen beim Hinüberbringen der Zahl prüfen.", "Check the sign when moving the number.") }, { wert: b - d, text: T("Rechts muss d − b stehen, nicht b − d.", "The right side must be d − b, not b − d.") }],
          hinweis: T(`Links: $${linTex(a, 0)} − ${cc < 0 ? `(${linTex(cc, 0)})` : linTex(cc, 0)} = ${linTex(k, 0)}$. Rechts: die Zahl von rechts minus die Zahl von links.`, `Left: $${linTex(a, 0)} − ${cc < 0 ? `(${linTex(cc, 0)})` : linTex(cc, 0)} = ${linTex(k, 0)}$. Right: the number on the right minus the number on the left.`),
          erkl: T(`$${linTex(k, 0)} ${REL_TEX[rel]} ${zTex(d - b)}$`, `$${linTex(k, 0)} ${REL_TEX[rel]} ${zTex(d - b)}$`) }),
      ...(k === 1 ? [] : [wahl("ug-b2", T(`Durch ${zTex(k)} teilen`, `Divide by ${zTex(k)}`), T(`Teile durch $${zTex(k)}$.`, `Divide by $${zTex(k)}$.`),
        dreh([[loesTex(rel2, g), `$${loesTex(rel2, g)}$`], [loesTex(DREH[rel2], g), `$${loesTex(DREH[rel2], g)}$`], [loesTex(rel2, g + 1), `$${loesTex(rel2, g + 1)}$`]], seed), loesTex(rel2, g), {
          fehler: [{ wahl: loesTex(DREH[rel2], g), text: k < 0 ? T("Teilen durch eine negative Zahl dreht das Zeichen.", "Dividing by a negative number flips the sign.") : T("Teilen durch eine positive Zahl lässt das Zeichen stehen.", "Dividing by a positive number keeps the sign.") }],
          hinweis: T("Ist der Faktor vor x negativ? Dann Zeichen drehen.", "Is the factor in front of x negative? Then flip the sign."),
          erkl: T(`$${loesTex(rel2, g)}$`, `$${loesTex(rel2, g)}$`) })]),
      mengeSchritt("ug-b3", rel2, g, seed + 2),
    ],
    pruef: { f: (x) => gilt(a * x + b, rel, cc * x + d), menge: halbIntervall(rel2, g) },
  };
}

function linDoppelt(z) {
  const a = wahlAus([2, 3, 4, -2, -3], z);
  const b = ganz(-6, 6, z);
  const lo = ganz(-5, 3, z), hi = lo + ganz(2, 6, z);
  /* Werte am Rand: bei a < 0 vertauschen sich die Seiten */
  const links = a > 0 ? a * lo + b : a * hi + b;
  const rechts = a > 0 ? a * hi + b : a * lo + b;
  const r1 = wahlAus(["<", "<="], z), r2 = wahlAus(["<", "<="], z);
  /* x-Grenzen und ob sie dazugehören */
  const loZu = a > 0 ? r1 === "<=" : r2 === "<=";
  const hiZu = a > 0 ? r2 === "<=" : r1 === "<=";
  const richtig = iv(lo, hi, loZu, hiZu);
  const s = ganz(0, 3, z);
  const opt = dreh(mengenOptionen([richtig, iv(lo, hi, !loZu, !hiZu), iv(lo, hi, hiZu, loZu), ver(iv(-Infinity, lo, false, !loZu), iv(hi, Infinity, !hiZu, false))]), s);
  return {
    art: "doppelt",
    text: T(`Löse die Doppelungleichung $${zTex(links)} ${REL_TEX[r1]} ${linTex(a, b)} ${REL_TEX[r2]} ${zTex(rechts)}$.`, `Solve the double inequality $${zTex(links)} ${REL_TEX[r1]} ${linTex(a, b)} ${REL_TEX[r2]} ${zTex(rechts)}$.`),
    schritte: [
      zahl("ug-d1", T("Untere Grenze", "Lower bound"), T("Forme alle drei Teile gleichzeitig um. Welche Zahl ist die untere Grenze für x?", "Transform all three parts at once. What is the lower bound for x?"), "$x$:", lo, {
        fehler: [{ wert: hi, text: T("Das ist die obere Grenze – beim Teilen durch eine negative Zahl tauschen die Seiten.", "That's the upper bound – dividing by a negative number swaps the sides.") }],
        hinweis: T(`Erst auf allen drei Seiten ${b >= 0 ? "− " + b : "+ " + -b}, dann durch ${zTex(a)} teilen.`, `First ${b >= 0 ? "− " + b : "+ " + -b} on all three parts, then divide by ${zTex(a)}.`),
        erkl: T(`Untere Grenze: $${zTex(lo)}$`, `Lower bound: $${zTex(lo)}$`) }),
      zahl("ug-d2", T("Obere Grenze", "Upper bound"), T("Und die obere Grenze?", "And the upper bound?"), "$x$:", hi, {
        hinweis: T("Die andere Seite der Doppelungleichung.", "The other side of the double inequality."), erkl: T(`Obere Grenze: $${zTex(hi)}$`, `Upper bound: $${zTex(hi)}$`) }),
      wahl("ug-d3", T("Lösungsmenge", "Solution set"), T("Welche Grenzen gehören dazu?", "Which bounds are included?"), opt, mengeTex(richtig), {
        fehler: [{ wahl: mengeTex(iv(lo, hi, hiZu, loZu)), text: T("Beim Teilen durch eine negative Zahl wandern auch die Zeichen mit auf die andere Seite.", "When dividing by a negative number, the signs move to the other side too.") }],
        hinweis: T("≤ → eckige Klammer zur Zahl hin, < → Klammer nach außen.", "≤ → bracket facing the number, < → bracket facing out."),
        erkl: T(`$L = ${mengeTex(richtig)}$`, `$L = ${mengeTex(richtig)}$`) }),
    ],
    pruef: { f: (x) => gilt(links, r1, a * x + b) && gilt(a * x + b, r2, rechts), menge: richtig },
  };
}

function linSach(z) {
  const diff = wahlAus([5, 8, 10, 12, 15, 20], z);
  const xs = wahlAus([20, 25, 30, 40, 50, 60], z);
  const pA = ganz(4, 12, z), pB = pA + diff;
  const grund = (diff * xs) / 100;
  const eur = (v) => dezTex(v, 2, true);
  const s = ganz(0, 2, z);
  const ugl = `${eur(grund)} + ${dezTex(pA / 100, 2)}x < ${dezTex(pB / 100, 2)}x`;
  const opt = dreh([
    [ugl, `$${ugl}$`],
    [`${eur(grund)} + ${dezTex(pA / 100, 2)}x > ${dezTex(pB / 100, 2)}x`, `$${eur(grund)} + ${dezTex(pA / 100, 2)}x > ${dezTex(pB / 100, 2)}x$`],
    [`${eur(grund)} + ${dezTex(pB / 100, 2)}x < ${dezTex(pA / 100, 2)}x`, `$${eur(grund)} + ${dezTex(pB / 100, 2)}x < ${dezTex(pA / 100, 2)}x$`],
  ], s);
  return {
    art: "sach",
    text: T(`Tarif A: $${eur(grund)}$ € Grundgebühr und ${pA} ct pro Minute. Tarif B: keine Grundgebühr, ${pB} ct pro Minute. Ab wie vielen Minuten im Monat ist Tarif A günstiger?`,
      `Plan A: $${eur(grund)}$ € base fee and ${pA} ct per minute. Plan B: no base fee, ${pB} ct per minute. From how many minutes a month is plan A cheaper?`),
    schritte: [
      wahl("ug-s1", T("Ungleichung aufstellen", "Set up the inequality"), T("x = Minuten im Monat, Preise in €. Welche Ungleichung beschreibt „A ist günstiger als B“?", "x = minutes per month, prices in €. Which inequality says “A is cheaper than B”?"), opt, ugl, {
        hinweis: T("Kosten von A links, Kosten von B rechts; „günstiger“ heißt „kleiner“.", "Cost of A on the left, cost of B on the right; “cheaper” means “less”."),
        erkl: T(`$${ugl}$`, `$${ugl}$`) }),
      zahl("ug-s2", T("Grenze", "Bound"), T("Löse die Ungleichung. Ab welcher Minutenzahl gilt sie?", "Solve the inequality. From which number of minutes does it hold?"), "$x >$", xs, {
        hinweis: T(`$${dezTex(pA / 100, 2)}x$ auf beiden Seiten abziehen, dann durch $${dezTex(diff / 100, 2)}$ teilen.`, `Subtract $${dezTex(pA / 100, 2)}x$ on both sides, then divide by $${dezTex(diff / 100, 2)}$.`),
        erkl: T(`$${eur(grund)} < ${dezTex(diff / 100, 2)}x \\;\\Rightarrow\\; x > ${xs}$`, `$${eur(grund)} < ${dezTex(diff / 100, 2)}x \\;\\Rightarrow\\; x > ${xs}$`) }),
      zahl("ug-s3", T("Antwort", "Answer"), T("Ab wie vielen ganzen Minuten ist A günstiger?", "From how many whole minutes is A cheaper?"), T("ab", "from"), xs + 1, {
        einheit: T("Minuten", "minutes"),
        fehler: [{ wert: xs, text: T(`Bei genau ${xs} Minuten kosten beide Tarife gleich viel – „günstiger“ verlangt „>“.`, `At exactly ${xs} minutes both plans cost the same – “cheaper” needs “>”.`) }],
        hinweis: T("x > Grenze: Die Grenze selbst gehört nicht dazu.", "x > bound: the bound itself is not included."),
        erkl: T(`Ab ${xs + 1} Minuten ist A günstiger (bei ${xs} Minuten gleich teuer).`, `From ${xs + 1} minutes plan A is cheaper (at ${xs} minutes equal).`) }),
    ],
    pruef: { f: (x) => grund + (pA / 100) * x < (pB / 100) * x - 1e-12, menge: halbIntervall(">", xs) },
  };
}

/* ======================================================================
   KAPITEL 2 · BETRAG UND BETRAGSGLEICHUNGEN
   ====================================================================== */
export const BET_ARTEN = ["wert", "abstand", "gleichung", "anzahl", "zwei"];

function betWert(z) {
  const typ = ganz(0, 3, z);
  if (typ === 0) {
    const a = ganz(2, 9, z), b = a + ganz(2, 9, z);
    return { art: "wert", text: T(`Berechne $|${a} − ${b}|$.`, `Calculate $|${a} − ${b}|$.`),
      schritte: [zahl("bw-1", T("Betrag", "Absolute value"), T("Erst innen rechnen, dann den Betrag nehmen.", "Calculate inside first, then take the absolute value."), `$|${a} − ${b}| =$`, b - a, {
        fehler: [{ wert: a - b, text: T("Der Betrag ist nie negativ – er ist ein Abstand.", "An absolute value is never negative – it's a distance.") }],
        hinweis: T(`$${a} − ${b} = ${zTex(a - b)}$`, `$${a} − ${b} = ${zTex(a - b)}$`), erkl: T(`$|${zTex(a - b)}| = ${b - a}$`, `$|${zTex(a - b)}| = ${b - a}$`) })],
      pruef: { wert: Math.abs(a - b), soll: b - a } };
  }
  if (typ === 1) {
    const a = ganz(2, 12, z);
    return { art: "wert", text: T(`Berechne $−|−${a}|$.`, `Calculate $−|−${a}|$.`),
      schritte: [zahl("bw-2", T("Betrag mit Minus davor", "Absolute value with a minus in front"), T("Das Minus vor den Betragsstrichen bleibt stehen.", "The minus in front of the bars stays."), `$−|−${a}| =$`, -a, {
        fehler: [{ wert: a, text: T("Der Betrag von −" + a + " ist " + a + ", aber das Minus davor steht außerhalb.", "The absolute value of −" + a + " is " + a + ", but the minus in front is outside.") }],
        hinweis: T("Erst $|−" + a + "|$ ausrechnen.", "First work out $|−" + a + "|$."), erkl: T(`$−|−${a}| = −${a}$`, `$−|−${a}| = −${a}$`) })],
      pruef: { wert: -Math.abs(-a), soll: -a } };
  }
  if (typ === 2) {
    const a = ganz(2, 9, z), b = ganz(2, 9, z);
    return { art: "wert", text: T(`Berechne $|−${a}| + |${b}|$.`, `Calculate $|−${a}| + |${b}|$.`),
      schritte: [zahl("bw-3", T("Zwei Beträge", "Two absolute values"), T("Jeden Betrag einzeln ausrechnen.", "Work out each absolute value separately."), `$|−${a}| + |${b}| =$`, a + b, {
        fehler: [{ wert: b - a, text: T(`$|−${a}| = ${a}$, nicht $−${a}$.`, `$|−${a}| = ${a}$, not $−${a}$.`) }],
        hinweis: T("Ein Betrag macht jede Zahl nichtnegativ.", "An absolute value makes every number non-negative."), erkl: T(`$${a} + ${b} = ${a + b}$`, `$${a} + ${b} = ${a + b}$`) })],
      pruef: { wert: Math.abs(-a) + Math.abs(b), soll: a + b } };
  }
  const a = ganz(2, 6, z), b = ganz(2, 6, z);
  return { art: "wert", text: T(`Berechne $|${a} \\cdot (−${b})| − ${a}$.`, `Calculate $|${a} \\cdot (−${b})| − ${a}$.`),
    schritte: [zahl("bw-4", T("Betrag eines Produkts", "Absolute value of a product"), T("Innen ausmultiplizieren, Betrag nehmen, dann subtrahieren.", "Multiply inside, take the absolute value, then subtract."), `$|${a} \\cdot (−${b})| − ${a} =$`, a * b - a, {
      fehler: [{ wert: -a * b - a, text: T("Der Betrag von " + -a * b + " ist " + a * b + ".", "The absolute value of " + -a * b + " is " + a * b + ".") }],
      hinweis: T(`$|${a} \\cdot (−${b})| = |−${a * b}|$`, `$|${a} \\cdot (−${b})| = |−${a * b}|$`), erkl: T(`$${a * b} − ${a} = ${a * b - a}$`, `$${a * b} − ${a} = ${a * b - a}$`) })],
    pruef: { wert: Math.abs(a * -b) - a, soll: a * b - a } };
}

function betAbstand(z) {
  const m = ganzOhne0(-6, 6, z), r = ganz(1, 7, z);
  return {
    art: "abstand",
    text: T(`Löse $|${abstandTex(m)}| = ${r}$. Denke an den Abstand auf der Zahlengeraden.`, `Solve $|${abstandTex(m)}| = ${r}$. Think of the distance on the number line.`),
    schritte: [
      zahl("ba-1", T("Mittelpunkt", "Centre"), T(`$|${abstandTex(m)}|$ ist der Abstand von x zu welcher Zahl?`, `$|${abstandTex(m)}|$ is the distance from x to which number?`), T("zur Zahl", "to the number"), m, {
        fehler: [{ wert: -m, text: T(`Achtung Vorzeichen: $|x − a|$ ist der Abstand zu a. $${abstandTex(m)} = x − ${zKl(m)}$.`, `Watch the sign: $|x − a|$ is the distance to a. $${abstandTex(m)} = x − ${zKl(m)}$.`) }],
        hinweis: T("|x − a| = Abstand von x und a.", "|x − a| = distance between x and a."), erkl: T(`Abstand zu $${zTex(m)}$`, `Distance to $${zTex(m)}$`) }),
      zahl("ba-2", T("Kleinere Lösung", "Smaller solution"), T(`Welche Zahl hat links vom Mittelpunkt den Abstand ${r}?`, `Which number to the left of the centre has distance ${r}?`), "$x_1 =$", m - r, {
        hinweis: T("Mittelpunkt minus Abstand.", "Centre minus distance."), erkl: T(`$x_1 = ${zTex(m)} − ${r} = ${zTex(m - r)}$`, `$x_1 = ${zTex(m)} − ${r} = ${zTex(m - r)}$`) }),
      zahl("ba-3", T("Größere Lösung", "Larger solution"), T("Und rechts davon?", "And to the right of it?"), "$x_2 =$", m + r, {
        hinweis: T("Mittelpunkt plus Abstand.", "Centre plus distance."), erkl: T(`$x_2 = ${zTex(m)} + ${r} = ${zTex(m + r)}$, also $L = \\{${zTex(m - r)}; ${zTex(m + r)}\\}$`, `$x_2 = ${zTex(m)} + ${r} = ${zTex(m + r)}$, so $L = \\{${zTex(m - r)}; ${zTex(m + r)}\\}$`) }),
    ],
    pruef: { g: (x) => Math.abs(x - m) - r, loes: [m - r, m + r] },
  };
}

function betGleichung(z) {
  let a = wahlAus([1, 2, 3], z);
  let x2 = ganz(-6, 3, z), x1 = x2 + ganz(1, 8, z);
  if ((a * (x1 - x2)) % 2) x1 += 1;
  const c = (a * (x1 - x2)) / 2;
  let b = c - a * x1;
  const neg = z() < 0.35;
  if (neg) { a = -a; b = -b; }
  /* Fall 1: ax + b = c, Fall 2: ax + b = −c */
  const f1 = (c - b) / a, f2 = (-c - b) / a;
  return {
    art: "gleichung",
    text: T(`Löse $|${linTex(a, b)}| = ${c}$.`, `Solve $|${linTex(a, b)}| = ${c}$.`),
    schritte: [
      zahl("bg-1", T("Fall 1: Inhalt positiv", "Case 1: inside positive"), T(`Der Inhalt ist $${c}$:`, `The inside equals $${c}$:`), `$${linTex(a, b)} = ${c} \\;\\Rightarrow\\; x =$`, f1, {
        hinweis: T("Löse die lineare Gleichung.", "Solve the linear equation."), erkl: T(`$x = ${zTex(f1)}$`, `$x = ${zTex(f1)}$`) }),
      zahl("bg-2", T("Fall 2: Inhalt negativ", "Case 2: inside negative"), T(`Der Inhalt ist $−${c}$:`, `The inside equals $−${c}$:`), `$${linTex(a, b)} = −${c} \\;\\Rightarrow\\; x =$`, f2, {
        fehler: [{ wert: -f1, text: T("Nicht einfach das Vorzeichen der ersten Lösung umdrehen – rechne Fall 2 mit −" + c + " neu.", "Don't just flip the sign of the first solution – solve case 2 with −" + c + ".") }],
        hinweis: T("Betrag = c heißt: Inhalt = c oder Inhalt = −c.", "Absolute value = c means: inside = c or inside = −c."),
        erkl: T(`$x = ${zTex(f2)}$, also $L = \\{${zTex(Math.min(f1, f2))}; ${zTex(Math.max(f1, f2))}\\}$`, `$x = ${zTex(f2)}$, so $L = \\{${zTex(Math.min(f1, f2))}; ${zTex(Math.max(f1, f2))}\\}$`) }),
    ],
    pruef: { g: (x) => Math.abs(a * x + b) - c, loes: [f1, f2] },
  };
}

function betAnzahl(z) {
  const a = ganzOhne0(-4, 4, z), b = ganz(-8, 8, z);
  const typ = ganz(0, 2, z);
  const c = typ === 0 ? -ganz(1, 9, z) : typ === 1 ? 0 : ganz(1, 9, z);
  const n = c < 0 ? 0 : c === 0 ? 1 : 2;
  const erkl = c < 0 ? T(`Ein Betrag ist nie negativ, $${zTex(c)}$ wird nie erreicht: $L = \\emptyset$.`, `An absolute value is never negative, $${zTex(c)}$ is never reached: $L = \\emptyset$.`)
    : c === 0 ? T(`Betrag 0 nur, wenn der Inhalt 0 ist: $${linTex(a, b)} = 0 \\Rightarrow x = ${zTex(-b / a)}$ – eine Lösung.`, `Absolute value 0 only if the inside is 0: $${linTex(a, b)} = 0 \\Rightarrow x = ${zTex(-b / a)}$ – one solution.`)
      : T(`Inhalt $= ${c}$ oder Inhalt $= −${c}$ – zwei verschiedene Lösungen.`, `Inside $= ${c}$ or inside $= −${c}$ – two different solutions.`);
  return {
    art: "anzahl",
    text: T(`Wie viele Lösungen hat $|${linTex(a, b)}| = ${zTex(c)}$? Ohne zu rechnen!`, `How many solutions does $|${linTex(a, b)}| = ${zTex(c)}$ have? Without calculating!`),
    schritte: [wahl("bn-1", T("Anzahl der Lösungen", "Number of solutions"), T("Entscheide nur anhand der rechten Seite.", "Decide only by looking at the right side."),
      [["0", T("keine", "none")], ["1", T("genau eine", "exactly one")], ["2", T("zwei", "two")]], String(n), {
        fehler: [{ wahl: "2", text: c < 0 ? T("Ein Betrag kann nie negativ sein.", "An absolute value can never be negative.") : T("Bei 0 fallen beide Fälle zusammen.", "With 0, both cases coincide.") }],
        hinweis: T("Rechte Seite negativ, null oder positiv?", "Right side negative, zero or positive?"), erkl })],
    pruef: { anzahl: n, a, b, c },
  };
}

function betZwei(z) {
  const p = ganz(-7, 5, z);
  const r = p + 2 * ganz(1, 5, z);
  const m = (p + r) / 2;
  const [u, v] = z() < 0.5 ? [p, r] : [r, p];
  return {
    art: "zwei",
    text: T(`Löse $|${abstandTex(u)}| = |${abstandTex(v)}|$.`, `Solve $|${abstandTex(u)}| = |${abstandTex(v)}|$.`),
    schritte: [
      wahl("bz-1", T("Bedeutung", "Meaning"), T("Was bedeutet die Gleichung auf der Zahlengeraden?", "What does the equation mean on the number line?"), [
        ["m", T(`x ist gleich weit von $${zTex(u)}$ und $${zTex(v)}$ entfernt.`, `x is equally far from $${zTex(u)}$ and $${zTex(v)}$.`)],
        ["g", T(`x ist gleich $${zTex(u)}$ oder gleich $${zTex(v)}$.`, `x equals $${zTex(u)}$ or $${zTex(v)}$.`)],
        ["d", T(`Der Abstand von $${zTex(u)}$ und $${zTex(v)}$ ist x.`, `The distance between $${zTex(u)}$ and $${zTex(v)}$ is x.`)],
      ], "m", { hinweis: T("|x − a| ist der Abstand von x zu a.", "|x − a| is the distance from x to a."), erkl: T("Gleicher Abstand zu beiden Zahlen.", "Equal distance to both numbers.") }),
      zahl("bz-2", T("Lösung", "Solution"), T("Welche Zahl liegt genau in der Mitte?", "Which number lies exactly in the middle?"), "$x =$", m, {
        hinweis: T("Mitte = (a + b) : 2", "Middle = (a + b) : 2"), erkl: T(`$x = \\frac{${zTex(u)} + ${zKl(v)}}{2} = ${zTex(m)}$ – genau eine Lösung.`, `$x = \\frac{${zTex(u)} + ${zKl(v)}}{2} = ${zTex(m)}$ – exactly one solution.`) }),
    ],
    pruef: { g: (x) => Math.abs(x - u) - Math.abs(x - v), loes: [m] },
  };
}

/* ======================================================================
   KAPITEL 3 · BETRAGSUNGLEICHUNGEN
   ====================================================================== */
export const BU_ARTEN = ["innen", "aussen", "linear", "ablesen"];

function grenzSchritte(idp, lo, hi) {
  return [
    zahl(`${idp}-1`, T("Linke Grenze", "Left bound"), T("Wo beginnt bzw. endet der Bereich links?", "Where is the left bound?"), "$x$:", lo, {
      hinweis: T("Mittelpunkt minus Abstand.", "Centre minus distance."), erkl: `$${zTex(lo)}$` }),
    zahl(`${idp}-2`, T("Rechte Grenze", "Right bound"), T("Und rechts?", "And on the right?"), "$x$:", hi, {
      hinweis: T("Mittelpunkt plus Abstand.", "Centre plus distance."), erkl: `$${zTex(hi)}$` }),
  ];
}
function innenAussen(lo, hi, rel) {
  const zu = !istStreng(rel);
  return rel === "<" || rel === "<=" ? iv(lo, hi, zu, zu) : ver(iv(-Infinity, lo, false, zu), iv(hi, Infinity, zu, false));
}
function buMengeSchritt(id, lo, hi, rel, k) {
  const richtig = innenAussen(lo, hi, rel);
  const andere = innenAussen(lo, hi, DREH[rel]);
  const klammer = innenAussen(lo, hi, istStreng(rel) ? (rel === "<" ? "<=" : ">=") : (rel === "<=" ? "<" : ">"));
  const dreh2 = innenAussen(lo, hi, istStreng(DREH[rel]) ? (DREH[rel] === "<" ? "<=" : ">=") : (DREH[rel] === "<=" ? "<" : ">"));
  const opt = dreh(mengenOptionen([richtig, andere, klammer, dreh2]), k);
  const innen = rel === "<" || rel === "<=";
  return wahl(id, T("Lösungsmenge", "Solution set"), innen ? T("Abstand kleiner als … – innen oder außen?", "Distance less than … – inside or outside?") : T("Abstand größer als … – innen oder außen?", "Distance greater than … – inside or outside?"), opt, mengeTex(richtig), {
    fehler: [{ wahl: mengeTex(andere), text: innen ? T("„Abstand kleiner“ heißt: nah am Mittelpunkt, also zwischen den Grenzen.", "“Distance less” means close to the centre, so between the bounds.") : T("„Abstand größer“ heißt: weit weg vom Mittelpunkt, also außerhalb.", "“Distance greater” means far from the centre, so outside.") }],
    hinweis: T("< oder ≤: innen (ein Intervall). > oder ≥: außen (zwei Teile).", "< or ≤: inside (one interval). > or ≥: outside (two parts)."),
    erkl: `$L = ${mengeTex(richtig)}$`,
  });
}

function buInnenAussen(z, innen) {
  const m = ganz(-5, 5, z), r = ganz(1, 6, z);
  const rel = innen ? wahlAus(["<", "<="], z) : wahlAus([">", ">="], z);
  const k = ganz(0, 3, z);
  return {
    art: innen ? "innen" : "aussen",
    text: T(`Löse $|${abstandTex(m)}| ${REL_TEX[rel]} ${r}$.`, `Solve $|${abstandTex(m)}| ${REL_TEX[rel]} ${r}$.`),
    schritte: [...grenzSchritte("bu", m - r, m + r), buMengeSchritt("bu-3", m - r, m + r, rel, k)],
    pruef: { f: (x) => gilt(Math.abs(x - m), rel, r), menge: innenAussen(m - r, m + r, rel) },
  };
}

function buLinear(z) {
  let a = wahlAus([2, 3, -2, 4], z);
  let lo = ganz(-5, 3, z), hi = lo + ganz(1, 6, z);
  if ((Math.abs(a) * (hi - lo)) % 2) hi += 1;
  const c = (Math.abs(a) * (hi - lo)) / 2;
  const b = a > 0 ? -c - a * lo : c - a * lo;   /* a·lo + b = −c (a > 0) bzw. = c (a < 0) */
  const rel = wahlAus(["<", "<=", ">", ">="], z);
  const k = ganz(0, 3, z);
  return {
    art: "linear",
    text: T(`Löse $|${linTex(a, b)}| ${REL_TEX[rel]} ${c}$.`, `Solve $|${linTex(a, b)}| ${REL_TEX[rel]} ${c}$.`),
    schritte: [
      zahl("bl-1", T("Kleinere Grenze", "Smaller bound"), T(`Löse die Betragsgleichung $|${linTex(a, b)}| = ${c}$. Kleinere Lösung?`, `Solve $|${linTex(a, b)}| = ${c}$. Smaller solution?`), "$x_1 =$", lo, {
        hinweis: T(`$${linTex(a, b)} = ${c}$ oder $${linTex(a, b)} = −${c}$`, `$${linTex(a, b)} = ${c}$ or $${linTex(a, b)} = −${c}$`), erkl: `$x_1 = ${zTex(lo)}$` }),
      zahl("bl-2", T("Größere Grenze", "Larger bound"), T("Größere Lösung?", "Larger solution?"), "$x_2 =$", hi, { hinweis: T("Der andere Fall.", "The other case."), erkl: `$x_2 = ${zTex(hi)}$` }),
      buMengeSchritt("bl-3", lo, hi, rel, k),
    ],
    pruef: { f: (x) => gilt(Math.abs(a * x + b), rel, c), menge: innenAussen(lo, hi, rel) },
  };
}

function buAblesen(z) {
  let m, r;
  do { m = ganzOhne0(-5, 5, z); r = ganz(1, 6, z); } while (Math.abs(m) === r);
  const rel = wahlAus(["<", "<=", ">", ">="], z);
  const menge = innenAussen(m - r, m + r, rel);
  const kand = [
    `|${abstandTex(m)}| ${REL_TEX[rel]} ${r}`,
    `|${abstandTex(-m)}| ${REL_TEX[rel]} ${r}`,
    `|${abstandTex(m)}| ${REL_TEX[DREH[rel]]} ${r}`,
    `|${abstandTex(r)}| ${REL_TEX[rel]} ${Math.abs(m)}`,
  ];
  const k = ganz(0, 3, z);
  return {
    art: "ablesen",
    text: T(`Die Lösungsmenge ist $L = ${mengeTex(menge)}$ (siehe Zahlengerade). Welche Betragsungleichung gehört dazu?`, `The solution set is $L = ${mengeTex(menge)}$ (see number line). Which absolute value inequality belongs to it?`),
    skizze: { menge },
    schritte: [
      zahl("bb-1", T("Mittelpunkt", "Centre"), T("Welche Zahl liegt genau in der Mitte zwischen den Grenzen?", "Which number lies exactly halfway between the bounds?"), "$m =$", m, {
        hinweis: T("Mitte = (linke + rechte Grenze) : 2", "Middle = (left + right bound) : 2"), erkl: `$m = ${zTex(m)}$` }),
      wahl("bb-2", T("Ungleichung", "Inequality"), T("Welche Ungleichung passt?", "Which inequality fits?"), dreh(kand.map((t) => [t, `$${t}$`]), k), kand[0], {
        fehler: [
          { wahl: kand[1], text: T(`Vorzeichen: Der Abstand zu $${zTex(m)}$ ist $|${abstandTex(m)}|$.`, `Sign: the distance to $${zTex(m)}$ is $|${abstandTex(m)}|$.`) },
          { wahl: kand[2], text: T("Innen und außen vertauscht.", "Inside and outside swapped.") },
          { wahl: kand[3], text: T("Mittelpunkt und Abstand vertauscht.", "Centre and distance swapped.") },
        ],
        hinweis: T("Mittelpunkt m, Abstand r = halbe Breite; innen → <, außen → >.", "Centre m, distance r = half the width; inside → <, outside → >."),
        erkl: `$${kand[0]}$` }),
    ],
    pruef: { f: (x) => gilt(Math.abs(x - m), rel, r), menge },
  };
}

/* ======================================================================
   KAPITEL 4 · QUADRATISCHE UNGLEICHUNGEN
   ====================================================================== */
export const QU_ARTEN = ["nullstellen", "normalform", "keine", "qdoppelt"];

function quMenge(a, x1, x2, rel) {
  /* a(x − x1)(x − x2) rel 0 mit x1 < x2 */
  const zu = !istStreng(rel);
  const positiv = rel === ">" || rel === ">=";
  const aussen = (a > 0) === positiv;
  return aussen ? ver(iv(-Infinity, x1, false, zu), iv(x2, Infinity, zu, false)) : iv(x1, x2, zu, zu);
}
function quSchritte(a, x1, x2, rel, k, produkt) {
  const richtig = quMenge(a, x1, x2, rel);
  const aussen = richtig.art === "ver";
  const opt = dreh(mengenOptionen([richtig, quMenge(-a, x1, x2, rel), quMenge(a, x1, x2, istStreng(rel) ? (rel === "<" ? "<=" : ">=") : (rel === "<=" ? "<" : ">")), quMenge(-a, x1, x2, istStreng(rel) ? (rel === "<" ? "<=" : ">=") : (rel === "<=" ? "<" : ">"))]), k);
  const oben = rel === ">" || rel === ">=";
  return [
    zahl("uq-1", T("Kleinere Nullstelle", "Smaller root"), produkt ? T("Lies die Nullstellen aus der Produktform ab. Kleinere?", "Read off the roots from the factored form. Smaller one?") : T("Bestimme die Nullstellen (pq-Formel oder Satz von Vieta). Kleinere?", "Find the roots (quadratic formula or Vieta). Smaller one?"), "$x_1 =$", x1, {
      fehler: [{ wert: -x1, text: T("Vorzeichen: $(x − a) = 0$ ergibt $x = a$.", "Sign: $(x − a) = 0$ gives $x = a$.") }],
      hinweis: produkt ? T("Ein Produkt ist 0, wenn ein Faktor 0 ist.", "A product is 0 if one factor is 0.") : T(`$x^2 + px + q = 0 \\Rightarrow x = −\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 − q}$`, `$x^2 + px + q = 0 \\Rightarrow x = −\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 − q}$`),
      erkl: `$x_1 = ${zTex(x1)}$` }),
    zahl("uq-2", T("Größere Nullstelle", "Larger root"), T("Und die größere?", "And the larger one?"), "$x_2 =$", x2, { hinweis: T("Die zweite Nullstelle.", "The second root."), erkl: `$x_2 = ${zTex(x2)}$` }),
    wahl("uq-3", T("Parabel lesen", "Read the parabola"), T(`Die Parabel ist nach ${a > 0 ? "oben" : "unten"} geöffnet. Wo liegt sie ${oben ? "oberhalb" : "unterhalb"} der x-Achse?`, `The parabola opens ${a > 0 ? "upwards" : "downwards"}. Where is it ${oben ? "above" : "below"} the x-axis?`),
      [["z", T("zwischen den Nullstellen", "between the roots")], ["a", T("außerhalb der Nullstellen", "outside the roots")]], aussen ? "a" : "z", {
        fehler: [{ wahl: aussen ? "z" : "a", text: a > 0 ? T("Nach oben geöffnet: zwischen den Nullstellen liegt der Graph unter der x-Achse.", "Opening upwards: between the roots the graph is below the x-axis.") : T("Nach unten geöffnet: zwischen den Nullstellen liegt der Graph über der x-Achse.", "Opening downwards: between the roots the graph is above the x-axis.") }],
        hinweis: T("Skizziere die Parabel: Öffnung und Nullstellen genügen.", "Sketch the parabola: opening and roots are enough."),
        erkl: aussen ? T("außerhalb der Nullstellen", "outside the roots") : T("zwischen den Nullstellen", "between the roots") }),
    wahl("uq-4", T("Lösungsmenge", "Solution set"), T("Nullstellen dabei oder nicht?", "Roots included or not?"), opt, mengeTex(richtig), {
      hinweis: T("Bei ≤ und ≥ gehören die Nullstellen dazu, bei < und > nicht.", "With ≤ and ≥ the roots are included, with < and > they are not."), erkl: `$L = ${mengeTex(richtig)}$` }),
  ];
}
/* (x − d)² als TeX, d = 0 → x² */
const quadrat = (d) => (d === 0 ? "x^2" : `(${abstandTex(d)})^2`);
/* a(x − x1)(x − x2) als TeX */
const faktor = (r) => (r === 0 ? "x" : `(${abstandTex(r)})`);
function produktTex(a, x1, x2) {
  const vor = a === 1 ? "" : a === -1 ? "−" : zTex(a);
  return `${vor}${faktor(x1)}${faktor(x2)}`;
}

function quNullstellen(z, produkt) {
  const a = produkt ? wahlAus([1, -1, 2, -2], z) : wahlAus([1, 1, 1, -1], z);
  const x1 = ganz(-6, 3, z), x2 = x1 + ganz(1, 7, z);
  const rel = wahlAus(["<", "<=", ">", ">="], z);
  const k = ganz(0, 3, z);
  const b = -a * (x1 + x2), c = a * x1 * x2;
  const term = produkt ? produktTex(a, x1, x2) : quadTex(a, b, c);
  return {
    art: produkt ? "nullstellen" : "normalform",
    text: T(`Löse $${term} ${REL_TEX[rel]} 0$.`, `Solve $${term} ${REL_TEX[rel]} 0$.`),
    schritte: quSchritte(a, x1, x2, rel, k, produkt),
    pruef: { f: (x) => gilt(a * x * x + b * x + c, rel, 0), menge: quMenge(a, x1, x2, rel) },
  };
}

function quKeine(z) {
  const a = wahlAus([1, -1], z), d = ganz(-4, 4, z), e = ganz(1, 6, z);
  /* a((x − d)² + e) hat keine Nullstelle */
  const b = -2 * a * d, c = a * (d * d + e);
  const rel = wahlAus(["<", "<=", ">", ">="], z);
  const oben = rel === ">" || rel === ">=";
  const richtig = (a > 0) === oben ? R() : LEER();
  return {
    art: "keine",
    text: T(`Löse $${quadTex(a, b, c)} ${REL_TEX[rel]} 0$.`, `Solve $${quadTex(a, b, c)} ${REL_TEX[rel]} 0$.`),
    schritte: [
      wahl("uk-1", T("Nullstellen?", "Roots?"), T("Wie viele Nullstellen hat die Parabel? (Tipp: Diskriminante oder Scheitelform)", "How many roots does the parabola have? (Tip: discriminant or vertex form)"),
        [["0", T("keine", "none")], ["1", T("eine", "one")], ["2", T("zwei", "two")]], "0", {
          hinweis: T(`Scheitelform: $${a < 0 ? "−" : ""}\\left(${quadrat(d)} + ${e}\\right)$ – der Scheitel liegt bei y = ${zTex(a * e)}.`, `Vertex form: $${a < 0 ? "−" : ""}\\left(${quadrat(d)} + ${e}\\right)$ – the vertex is at y = ${zTex(a * e)}.`),
          erkl: T(`Scheitel $S(${zTex(d)} \\mid ${zTex(a * e)})$, Öffnung nach ${a > 0 ? "oben" : "unten"}: keine Nullstelle.`, `Vertex $S(${zTex(d)} \\mid ${zTex(a * e)})$, opening ${a > 0 ? "up" : "down"}: no root.`) }),
      wahl("uk-2", T("Lösungsmenge", "Solution set"), T(`Die Parabel liegt ganz ${a > 0 ? "über" : "unter"} der x-Achse. Lösungsmenge?`, `The parabola lies entirely ${a > 0 ? "above" : "below"} the x-axis. Solution set?`),
        [["\\mathbb{R}", "$\\mathbb{R}$"], ["\\emptyset", "$\\emptyset$"], [`\\{${zTex(d)}\\}`, `$\\{${zTex(d)}\\}$`]], mengeTex(richtig), {
          hinweis: T("Gilt die Ungleichung für alle x oder für kein x?", "Does the inequality hold for every x or for none?"), erkl: `$L = ${mengeTex(richtig)}$` }),
    ],
    pruef: { f: (x) => gilt(a * x * x + b * x + c, rel, 0), menge: richtig },
  };
}

function quDoppelt(z) {
  const d = ganzOhne0(-5, 5, z);
  const rel = wahlAus(["<", "<=", ">", ">="], z);
  /* (x − d)² rel 0 */
  const richtig = rel === "<" ? LEER() : rel === "<=" ? pktMenge(d) : rel === ">" ? ohne(d) : R();
  const k = ganz(0, 3, z);
  const opt = dreh(mengenOptionen([richtig, LEER(), pktMenge(d), ohne(d), R()]), k);
  return {
    art: "doppelt",
    text: T(`Löse $${quadTex(1, -2 * d, d * d)} ${REL_TEX[rel]} 0$.`, `Solve $${quadTex(1, -2 * d, d * d)} ${REL_TEX[rel]} 0$.`),
    schritte: [
      zahl("ud-1", T("Binomische Formel", "Binomial formula"), T(`Schreibe den Term als $(x − a)^2$. a = ?`, `Write the term as $(x − a)^2$. a = ?`), "$a =$", d, {
        fehler: [{ wert: -d, text: T("Vorzeichen: $(x − a)^2 = x^2 − 2ax + a^2$.", "Sign: $(x − a)^2 = x^2 − 2ax + a^2$.") }],
        hinweis: T("Zweite bzw. erste binomische Formel rückwärts.", "Binomial formula backwards."), erkl: `$(${abstandTex(d)})^2$` }),
      wahl("ud-2", T("Lösungsmenge", "Solution set"), T("Ein Quadrat ist nie negativ und nur an einer Stelle 0. Lösungsmenge?", "A square is never negative and 0 at only one point. Solution set?"), opt, mengeTex(richtig), {
        hinweis: T(`$(${abstandTex(d)})^2 \\ge 0$ für alle x, $= 0$ nur bei $x = ${zTex(d)}$.`, `$(${abstandTex(d)})^2 \\ge 0$ for all x, $= 0$ only at $x = ${zTex(d)}$.`), erkl: `$L = ${mengeTex(richtig)}$` }),
    ],
    pruef: { f: (x) => gilt((x - d) * (x - d), rel, 0), menge: richtig },
  };
}

/* ======================================================================
   Öffentliche Erzeuger
   ====================================================================== */
const ERZ = {
  einfach: (z) => linEinfach(z, false), negativ: (z) => linEinfach(z, true), beidseitig: linBeidseitig, doppelt: linDoppelt, sach: linSach,
  wert: betWert, abstand: betAbstand, gleichung: betGleichung, anzahl: betAnzahl, zwei: betZwei,
  innen: (z) => buInnenAussen(z, true), aussen: (z) => buInnenAussen(z, false), linear: buLinear, ablesen: buAblesen,
  nullstellen: (z) => quNullstellen(z, true), normalform: (z) => quNullstellen(z, false), keine: quKeine, doppelt2: quDoppelt,
};
/* „doppelt“ gibt es zweimal (Doppelungleichung, doppelte Nullstelle) – im Kapitel 4 heißt der Typ „qdoppelt“ */
export const UG_TITEL = {
  einfach: ["Eine Seite mit x", "x on one side"], negativ: ["Negativer Faktor", "Negative factor"], beidseitig: ["x auf beiden Seiten", "x on both sides"],
  doppelt: ["Doppelungleichung", "Double inequality"], sach: ["Tarifvergleich", "Comparing plans"],
  wert: ["Beträge berechnen", "Calculate absolute values"], abstand: ["Abstand auf der Zahlengeraden", "Distance on the number line"], gleichung: ["Betragsgleichung", "Absolute value equation"],
  anzahl: ["Wie viele Lösungen?", "How many solutions?"], zwei: ["Zwei Beträge", "Two absolute values"],
  innen: ["Abstand kleiner", "Distance less"], aussen: ["Abstand größer", "Distance greater"], linear: ["|ax + b| und eine Zahl", "|ax + b| and a number"], ablesen: ["Ungleichung ablesen", "Read off the inequality"],
  nullstellen: ["Produktform", "Factored form"], normalform: ["Normalform", "Standard form"], keine: ["Ohne Nullstellen", "Without roots"], qdoppelt: ["Doppelte Nullstelle", "Double root"],
};
export const KAPITEL_ARTEN = { lin: LIN_ARTEN, bet: BET_ARTEN, bu: BU_ARTEN, qu: QU_ARTEN };

export function ugAufgabe(art, z = Math.random) {
  const intern = art === "qdoppelt" ? "doppelt2" : art;
  const au = ERZ[intern](z);
  return { ...au, art };
}
