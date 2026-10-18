/* ======================================================================
   textaufgaben.js – Bereich „Textaufgaben übersetzen“ (reine Logik, kein React)
   Tests: tests/textaufgaben.test.mjs

   Leitidee: Eine Textaufgabe ist eine verschlüsselte Gleichung. Jede Information
   im Text wird zu einer mathematischen Bedingung – „Hochpunkt bei H(6|4)“ heißt
   f(6) = 4 und f′(6) = 0. Erst übersetzen, dann rechnen. Hier wird nur übersetzt.

   Acht Themen von Klasse 5 bis 13:
     woerter     Rechenwörter → Terme und Gleichungen          Kl. 5–7
     gleichung   Sachaufgaben mit einer Unbekannten             Kl. 7–8
     lgs         Zwei Unbekannte → Gleichungssystem             Kl. 8–9
     funktion    Funktionen aus Bedingungen (Gerade, Parabel,   Kl. 9–10
                 Wachstum)
     stochastik  Signalwörter: höchstens, mindestens …          Kl. 10–13
     steckbrief  Steckbriefaufgaben (Hoch-, Wende-, Sattelpunkt, Kl. 11–13
                 Tangenten, Symmetrie)
     anwendung   Sachkontext Analysis: Änderungsrate, Bestand,  Kl. 11–13
                 Mittelwert, Integral
     vektoren    Lagebeziehungen in Bedingungen                 Kl. 11–13 (nur Auswahl)

   Aufgabe = {
     id, thema, titel,
     teile: ["Text", { s: 0 }, "Text", { a: true } …]   – {s:i}: Textstelle i, {a}: Ansatz-Stelle
     ansatz?: { t, frage, optionen: [{ id, tex|text, richtig, rueck }], zeile, warum, unbekannte }
     stellen: [{ t, bedeutung, ziel: [{ c, alt? }], falsch: [{ c|tex, text }], warum, tippbar, zielTex? }]
     funktionen, eval (Ansatz zum Einsetzen beim Prüfen), einsetzen? (Zeilen des LGS)
   }
   ====================================================================== */
import { englisch } from "./i18n.js";
import { STANDARD_FUNKTIONEN, expAnsatz, gleichwertig, linAnsatz, polyAnsatz, scheitelAnsatz } from "./bedingungen.js";

const zw = (de, en) => (englisch() ? en : de);
const z = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const wahl = (arr) => arr[Math.floor(Math.random() * arr.length)];
const mische = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rund = (v) => Math.round(v * 1e6) / 1e6;

/* Zahl in einfacher Schreibweise (Eingabe/Prüfung): Komma im Deutschen, „-“ für Minus */
export const dez = (v) => { const s = String(rund(v)); return englisch() ? s : s.replace(".", ","); };
/* Zahl im Fließtext: echtes Minuszeichen */
export const dt = (v) => dez(v).replace("-", "−");
const pkt = (x, y) => `(${dt(x)}|${dt(y)})`;
const euro = (v) => (englisch() ? `€${(Math.round(v * 100) / 100).toFixed(2)}` : `${(Math.round(v * 100) / 100).toFixed(2).replace(".", ",")} €`);

/* Linearer Term ohne 1x, + − und Nullglieder: [[3, "x"], [-4, ""]] → „3x - 4“ */
export function lin(glieder) {
  let s = "";
  for (const [k0, v] of glieder) {
    const k = rund(k0);
    if (k === 0) continue;
    const b = Math.abs(k);
    const zahl = v && b === 1 ? "" : dez(b);
    if (!s) s = (k < 0 ? "-" : "") + zahl + v;
    else s += (k < 0 ? " - " : " + ") + zahl + v;
  }
  return s || "0";
}
const strich = (k) => "'".repeat(k);
/* f^(k)(x0) = y0 in einfacher Schreibweise */
const fb = (k, x0, y0, n = "f") => `${n}${strich(k)}(${dez(x0)}) = ${dez(y0)}`;

let zaehler = 0;

/* ---------- Themen ---------- */
export const THEMEN = [
  { id: "woerter", name: ["Rechenwörter", "Maths words"], zeile: ["Das Dreifache, vermindert um … → Terme und Gleichungen", "Triple, decreased by … → terms and equations"], klasse: [5, 7], symbol: "3x−4" },
  { id: "gleichung", name: ["Sachaufgaben", "Word problems"], zeile: ["Alter, Preise, Prozent, Bewegung → eine Gleichung", "Ages, prices, percent, motion → one equation"], klasse: [7, 8], symbol: "x = ?" },
  { id: "lgs", name: ["Zwei Unbekannte", "Two unknowns"], zeile: ["Köpfe und Beine, Eintritt, Ziffern → Gleichungssystem", "Heads and legs, tickets, digits → system of equations"], klasse: [8, 9], symbol: "x, y" },
  { id: "funktion", name: ["Funktionen aufstellen", "Setting up functions"], zeile: ["Gerade, Parabel, Wachstum aus Bedingungen", "Lines, parabolas, growth from conditions"], klasse: [9, 10], symbol: "f(2)=5" },
  { id: "stochastik", name: ["Signalwörter Stochastik", "Probability key words"], zeile: ["höchstens, mindestens, mehr als → P(X …)", "at most, at least, more than → P(X …)"], klasse: [10, 13], symbol: "P(X≥3)" },
  { id: "steckbrief", name: ["Steckbriefaufgaben", "Reconstruction tasks"], zeile: ["Hochpunkt, Wendepunkt, Tangente, Symmetrie → Bedingungen", "Maximum, inflection point, tangent, symmetry → conditions"], klasse: [11, 13], symbol: "f′(6)=0" },
  { id: "anwendung", name: ["Analysis im Sachkontext", "Calculus in context"], zeile: ["Änderungsrate, Bestand, Mittelwert, Integral", "Rate of change, stock, mean value, integral"], klasse: [11, 13], symbol: "h′(3)=6" },
  { id: "vektoren", name: ["Vektoren und Lage", "Vectors and position"], zeile: ["parallel, senkrecht, liegt auf, rechtwinklig", "parallel, perpendicular, lies on, right-angled"], klasse: [11, 13], symbol: "u·n=0", nurWahl: true },
];
export const themaName = (t) => zw(t.name[0], t.name[1]);
export const themaZeile = (t) => zw(t.zeile[0], t.zeile[1]);
export const THEMA_IDS = THEMEN.map((t) => t.id);

/* Klassen-Auswahl → Themen */
export const KLASSEN_STUFEN = [
  { id: "5-6", von: 5, bis: 6, name: ["Klasse 5–6", "Year 5–6"] },
  { id: "7-8", von: 7, bis: 8, name: ["Klasse 7–8", "Year 7–8"] },
  { id: "9-10", von: 9, bis: 10, name: ["Klasse 9–10", "Year 9–10"] },
  { id: "11-13", von: 11, bis: 13, name: ["Klasse 11–13", "Year 11–13"] },
  { id: "alle", von: 5, bis: 13, name: ["Alle", "All"] },
];
export function themenFuer(stufeId) {
  const k = KLASSEN_STUFEN.find((s) => s.id === stufeId) || KLASSEN_STUFEN[4];
  return THEMEN.filter((t) => t.klasse[0] <= k.bis && t.klasse[1] >= k.von);
}
export const klasseText = (t) => (t.klasse[0] === t.klasse[1] ? zw(`Klasse ${t.klasse[0]}`, `Year ${t.klasse[0]}`) : zw(`Klasse ${t.klasse[0]}–${t.klasse[1]}`, `Year ${t.klasse[0]}–${t.klasse[1]}`));

/* Drei Stufen – unabhängig vom Thema */
export const STUFEN = [
  { id: 1, name: ["Erkennen", "Recognise"], zeile: ["Textstelle markiert, Übersetzung auswählen", "Phrase marked, pick the translation"] },
  { id: 2, name: ["Übersetzen", "Translate"], zeile: ["Textstelle markiert, Bedingung selbst tippen", "Phrase marked, type the condition"] },
  { id: 3, name: ["Ganze Aufgabe", "Whole task"], zeile: ["Nichts markiert: alle Bedingungen selbst finden", "Nothing marked: find all conditions yourself"] },
];

/* ---------- Bausteine ---------- */
const st = (t, ziel, falsch, warum, bedeutung, o = {}) => ({
  t, bedeutung, warum, tippbar: o.tippbar !== false,
  ziel: ziel.map((c) => (typeof c === "string" ? { c } : c)),
  falsch: falsch.filter(Boolean),
  zielTex: o.zielTex || null,
});
/* Denkfehler, die (z. B. wegen einer Symmetrie oder besonderer Zahlen) in Wahrheit gleichwertig zur Lösung sind, fliegen raus */
function ohneEchteTreffer(stellen, o) {
  const op = { funktionen: o.funktionen || STANDARD_FUNKTIONEN, ansatz: o.eval || null };
  return stellen.map((s) => ({ ...s, falsch: s.falsch.filter((f) => !f.c || !s.ziel.some((zz) => gleichwertig(f.c, zz.c, op))) }));
}
const fertig = (thema, titel, teile, stellen, o = {}) => ({ id: ++zaehler, thema, titel, teile, stellen: ohneEchteTreffer(stellen, o), ansatz: o.ansatz || null, funktionen: o.funktionen, eval: o.eval || null, einsetzen: o.einsetzen || null, variablen: o.variablen || [], frage: o.frage || null });

/* Ansatz-Schritt für Sachaufgaben: Was ist x (und y)? */
function variablenWahl(richtig, falsche, zeile, warum) {
  return {
    t: null, frage: zw("Was wählst du als Unbekannte?", "What do you choose as the unknown?"),
    optionen: [{ id: "r", text: richtig, richtig: true }, ...falsche.map(([text, rueck], i) => ({ id: `f${i}`, text, richtig: false, rueck }))],
    zeile, warum, unbekannte: null,
  };
}

/* ======================================================================
   1 · RECHENWÖRTER (Klasse 5–7)
   ====================================================================== */
const VIELFACH = {
  2: ["Das Doppelte", "Double"], 3: ["Das Dreifache", "Three times"], 4: ["Das Vierfache", "Four times"],
  5: ["Das Fünffache", "Five times"], 6: ["Das Sechsfache", "Six times"],
};
function woerter() {
  const v = z(1, 7);
  const X = [["x", zw("die gesuchte Zahl", "the number you are looking for")]];
  const kopf = zw("Nenne die gesuchte Zahl x und übersetze Stück für Stück.", "Call the unknown number x and translate piece by piece.");
  if (v === 1) {
    const k = z(2, 6), m = z(1, 9), x = z(2, 12), r = k * x - m;
    const kx = lin([[k, "x"]]), t1 = lin([[k, "x"], [-m, ""]]);
    return fertig("woerter", zw("Zahlenrätsel", "Number puzzle"),
      [zw("Denke dir eine Zahl. ", "Think of a number. "), { s: 0 }, ", ", { s: 1 }, ", ", { s: 2 }, "."],
      [
        st(zw(`${VIELFACH[k][0]} dieser Zahl`, `${VIELFACH[k][1]} this number`), [kx],
          [{ c: `x + ${k}`, text: zw(`Das ${k}-Fache heißt „mal ${k}“, nicht „plus ${k}“.`, `Times ${k} means multiplying, not adding ${k}.`) },
            { c: `x^${k}`, text: zw(`Das wäre die ${k}. Potenz – „das ${k}-Fache“ ist ${kx}.`, `That would be the power ${k} – ${k} times is ${kx}.`) },
            { c: `x/${k}`, text: zw(`Das wäre der ${k}. Teil.`, `That would be one ${k}th.`) }],
          zw(`„Das ${k}-Fache“ heißt mal ${k}: $${kx}$.`, `“${k} times” means multiply by ${k}: $${kx}$.`), zw(`die Zahl mal ${k}`, `the number times ${k}`)),
        st(zw(`vermindert um ${m}`, `decreased by ${m}`), [t1],
          [{ c: `${k}(x - ${m})`, text: zw(`Vermindert wird das ${k}-Fache, nicht die Zahl selbst – keine Klammer.`, `It is the product that is decreased, not the number itself – no brackets.`) },
            { c: `${m} - ${kx}`, text: zw(`Vom ${k}-Fachen wird ${m} abgezogen – ${kx} steht vorn.`, `${m} is subtracted from ${kx} – ${kx} comes first.`) },
            { c: lin([[k, "x"], [m, ""]]), text: zw("„Vermindert“ heißt minus.", "“Decreased” means minus.") }],
          zw(`„Vermindert um ${m}“ heißt: vom bisherigen Term ${m} abziehen.`, `“Decreased by ${m}” means subtract ${m} from what you have.`), zw(`minus ${m}`, `minus ${m}`)),
        st(zw(`ergibt ${r}`, `gives ${r}`), [`${t1} = ${r}`],
          [{ c: `${kx} = ${r - m}`, text: zw(`Schon umgestellt – und dabei falsch: ${m} kommt mit Plus auf die andere Seite.`, `Already rearranged – and wrong: ${m} moves across with a plus.`) },
            { c: `x - ${m} = ${r}`, text: zw(`Das ${k}-Fache fehlt.`, `The factor ${k} is missing.`) },
            { c: `${k}(x - ${m}) = ${r}`, text: zw("Keine Klammer: nur das Produkt wird vermindert.", "No brackets: only the product is decreased.") }],
          zw(`„Ergibt“ ist das Gleichheitszeichen: $${t1} = ${r}$.`, `“Gives” is the equals sign: $${t1} = ${r}$.`), zw("ist gleich", "equals")),
      ], { variablen: X, frage: kopf });
  }
  if (v === 2) {
    const k = z(2, 4), m = z(2, 9), x = z(1, 12), r = k * (x + m);
    const s1 = lin([[1, "x"], [m, ""]]);
    return fertig("woerter", zw("Zahlenrätsel", "Number puzzle"),
      [{ s: 0 }, " ", { s: 1 }, zw(", so ", ". You "), { s: 2 }, "."],
      [
        st(zw(`Addiert man zu einer Zahl ${m}`, `If you add ${m} to a number`), [s1],
          [{ c: `${m}x`, text: zw("Addieren heißt plus, nicht mal.", "Adding means plus, not times.") }, { c: `x - ${m}`, text: zw("Addieren heißt plus.", "Adding means plus.") }],
          zw(`Zur Zahl x kommt ${m} dazu: $${s1}$.`, `${m} is added to x: $${s1}$.`), zw(`x plus ${m}`, `x plus ${m}`)),
        st(zw(`und ${k === 2 ? "verdoppelt" : k === 3 ? "verdreifacht" : "vervierfacht"} das Ergebnis`, `and ${k === 2 ? "double" : k === 3 ? "triple" : "quadruple"} the result`), [`${k}(${s1})`],
          [{ c: lin([[k, "x"], [m, ""]]), text: zw("Das Ergebnis – also die ganze Summe – wird vervielfacht: Klammer!", "The result – the whole sum – is multiplied: brackets!") },
            { c: `${s1} + ${k}`, text: zw("Verdoppeln heißt mal 2.", "Doubling means times 2.") }],
          zw(`„Das Ergebnis“ ist die Summe $${s1}$ – sie kommt ganz in die Klammer: $${k}(${s1})$.`, `“The result” is the sum $${s1}$ – all of it goes into brackets: $${k}(${s1})$.`), zw(`die Summe mal ${k}`, `the sum times ${k}`)),
        st(zw(`erhält man ${r}`, `get ${r}`), [`${k}(${s1}) = ${r}`],
          [{ c: `${lin([[k, "x"], [m, ""]])} = ${r}`, text: zw("Die Klammer fehlt: Das ganze Ergebnis wird vervielfacht.", "Brackets are missing: the whole result is multiplied.") }],
          zw(`„Erhält man“ ist das Gleichheitszeichen.`, `“You get” is the equals sign.`), zw("ist gleich", "equals")),
      ], { variablen: X, frage: kopf });
  }
  if (v === 3) {
    const x = z(3, 15), m = z(1, 9), a = 2 * x + m;
    return fertig("woerter", zw("Zahlenrätsel", "Number puzzle"),
      [{ s: 0 }, " ", { s: 1 }, "."],
      [
        st(zw(`Die Differenz aus ${a} und einer Zahl`, `The difference of ${a} and a number`), [`${a} - x`],
          [{ c: `x - ${a}`, text: zw(`„Differenz aus ${a} und x“: ${a} steht zuerst.`, `“Difference of ${a} and x”: ${a} comes first.`) }, { c: `${a} + x`, text: zw("Differenz heißt minus.", "Difference means minus.") }],
          zw(`Die Differenz „aus a und b“ ist a − b – die Reihenfolge des Satzes bleibt.`, `The difference “of a and b” is a − b – the order of the sentence stays.`), zw(`${a} minus die Zahl`, `${a} minus the number`)),
        st(zw(`ist um ${m} größer als die Zahl selbst`, `is ${m} more than the number itself`), [`${a} - x = ${lin([[1, "x"], [m, ""]])}`],
          [{ c: `${a} - x + ${m} = x`, text: zw(`„Um ${m} größer“: Die Differenz ist größer – also muss die kleinere Seite (die Zahl) ${m} dazubekommen.`, `“${m} more”: the difference is larger – so the smaller side (the number) needs ${m} added.`) },
            { c: `${a} - x = ${m}`, text: zw("Verglichen wird mit der Zahl selbst, nicht mit null.", "It is compared with the number itself.") }],
          zw(`„A ist um ${m} größer als B“ heißt A = B + ${m}: Erst wenn die kleinere Seite ${m} dazubekommt, sind beide gleich.`, `“A is ${m} more than B” means A = B + ${m}: only when the smaller side gets ${m} more are both equal.`), zw(`gleich der Zahl plus ${m}`, `equals the number plus ${m}`)),
      ], { variablen: X, frage: kopf });
  }
  if (v === 4) {
    const k = z(2, 6), x = k * z(2, 9), m = z(1, 12), r = x / k + m;
    return fertig("woerter", zw("Zahlenrätsel", "Number puzzle"),
      [{ s: 0 }, zw(" und ", " and "), { s: 1 }, zw(", so ", ". You "), { s: 2 }, "."],
      [
        st(zw(`Teilt man eine Zahl durch ${k}`, `If you divide a number by ${k}`), [`x/${k}`],
          [{ c: `${k}/x`, text: zw(`„Eine Zahl durch ${k}“: Die Zahl steht oben.`, `“A number divided by ${k}”: the number is on top.`) }, { c: `${k}x`, text: zw("Teilen, nicht malnehmen.", "Divide, not multiply.") }],
          zw(`„x durch ${k}“ ist der Bruch $\\frac{x}{${k}}$.`, `“x divided by ${k}” is the fraction $\\frac{x}{${k}}$.`), zw(`x geteilt durch ${k}`, `x divided by ${k}`)),
        st(zw(`addiert dann ${m}`, `then add ${m}`), [`x/${k} + ${m}`],
          [{ c: `(x + ${m})/${k}`, text: zw(`Erst geteilt, dann ${m} addiert – ${m} gehört nicht in den Zähler.`, `First divide, then add ${m} – ${m} does not belong in the numerator.`) }],
          zw(`Die Reihenfolge der Sätze ist die Reihenfolge der Rechnung: erst teilen, dann ${m} addieren.`, `The order of the sentence is the order of the calculation: divide first, then add ${m}.`), zw(`plus ${m}`, `plus ${m}`)),
        st(zw(`erhält man ${dt(r)}`, `get ${dt(r)}`), [`x/${k} + ${m} = ${r}`],
          [{ c: `(x + ${m})/${k} = ${r}`, text: zw(`${m} wird erst nach dem Teilen addiert.`, `${m} is added after dividing.`) }],
          zw(`„Erhält man“ ist das Gleichheitszeichen.`, `“You get” is the equals sign.`), zw("ist gleich", "equals")),
      ], { variablen: X, frage: kopf });
  }
  if (v === 5) {
    const k = z(1, 5), x = k + z(1, 6), m = x * x - k * x;
    const kx = lin([[k, "x"]]);
    return fertig("woerter", zw("Zahlenrätsel", "Number puzzle"),
      [{ s: 0 }, " ", { s: 2 }, " ", { s: 1 }, "."],
      [
        st(zw("Das Quadrat einer Zahl", "The square of a number"), ["x^2"],
          [{ c: "2x", text: zw("Quadrat heißt hoch 2, nicht mal 2.", "Square means to the power 2, not times 2.") }, { c: "x + 2", text: zw("Quadrat heißt hoch 2.", "Square means to the power 2.") }],
          zw("Quadrat: die Zahl mal sich selbst, $x^2$.", "Square: the number times itself, $x^2$."), zw("x mal x", "x times x")),
        st(k === 1 ? zw("die Zahl selbst", "the number itself") : zw(`das ${k}-Fache der Zahl`, `${k} times the number`), [kx],
          [{ c: `x + ${k}`, text: zw("„Das Fache“ heißt mal.", "“Times” means multiply.") }],
          zw(`$${kx}$`, `$${kx}$`), zw(`${k} mal x`, `${k} times x`)),
        st(zw(`ist um ${m} größer als`, `is ${m} more than`), [`x^2 = ${lin([[k, "x"], [m, ""]])}`],
          [{ c: `x^2 + ${m} = ${kx}`, text: zw(`„Um ${m} größer“: $x^2$ ist die größere Seite – die kleinere Seite bekommt ${m} dazu.`, `“${m} more”: $x^2$ is the larger side – the smaller side gets ${m} added.`) },
            { c: `x^2 = ${m}`, text: zw("Verglichen wird mit dem zweiten Term, nicht mit null.", "It is compared with the second term.") }],
          zw(`„A ist um ${m} größer als B“: A = B + ${m}.`, `“A is ${m} more than B”: A = B + ${m}.`), zw(`gleich … plus ${m}`, `equals … plus ${m}`)),
      ], { variablen: X, frage: kopf });
  }
  if (v === 6) {
    const x = z(5, 60), r = 2 * x + 1;
    return fertig("woerter", zw("Zahlenrätsel", "Number puzzle"),
      [zw("Die Summe aus einer Zahl und ", "The sum of a number and "), { s: 0 }, " ", { s: 1 }, "."],
      [
        st(zw("ihrem Nachfolger", "its successor"), ["x + 1"],
          [{ c: "x - 1", text: zw("Das wäre der Vorgänger.", "That would be the predecessor.") }, { c: "2x", text: zw("Der Nachfolger ist die nächste Zahl, nicht das Doppelte.", "The successor is the next number, not double.") }],
          zw("Der Nachfolger ist die nächste ganze Zahl: $x + 1$.", "The successor is the next whole number: $x + 1$."), zw("die Zahl danach", "the next number")),
        st(zw(`ist ${r}`, `is ${r}`), [`x + (x + 1) = ${r}`],
          [{ c: `x + 1 = ${r}`, text: zw("Gemeint ist die Summe aus der Zahl und ihrem Nachfolger – x fehlt.", "It is the sum of the number and its successor – x is missing.") }],
          zw("Summe: beide Terme addieren, dann „ist“ = Gleichheitszeichen.", "Sum: add both terms; “is” is the equals sign."), zw("Summe gleich", "sum equals")),
      ], { variablen: X, frage: kopf });
  }
  /* v === 7: „um m kleiner als“ */
  const m = z(2, 15), x = 2 * m;
  return fertig("woerter", zw("Zahlenrätsel", "Number puzzle"),
    [{ s: 0 }, " ", { s: 1 }, "."],
    [
      st(zw("Die Hälfte einer Zahl", "Half of a number"), ["x/2"],
        [{ c: "2x", text: zw("Die Hälfte ist geteilt durch 2, nicht mal 2.", "Half is divided by 2, not times 2.") }, { c: "x - 2", text: zw("Die Hälfte ist geteilt durch 2.", "Half is divided by 2.") }],
        zw("Hälfte: $\\frac{x}{2}$.", "Half: $\\frac{x}{2}$."), zw("x geteilt durch 2", "x divided by 2")),
      st(zw(`ist um ${m} kleiner als die Zahl`, `is ${m} less than the number`), [`x/2 = x - ${m}`],
        [{ c: `x/2 - ${m} = x`, text: zw(`„Um ${m} kleiner“: Die Hälfte ist kleiner – also zieht man von der größeren Seite (der Zahl) ${m} ab.`, `“${m} less”: half is smaller – so ${m} is taken from the larger side (the number).`) },
          { c: `x = x/2 - ${m}`, text: zw(`Vertauscht: Die Hälfte ist die kleinere Seite – ihr fehlen ${m} zur Zahl.`, `Swapped: half is the smaller side – it is ${m} short of the number.`) }],
        zw(`„A ist um ${m} kleiner als B“ heißt A = B − ${m}.`, `“A is ${m} less than B” means A = B − ${m}.`), zw(`gleich der Zahl minus ${m}`, `equals the number minus ${m}`)),
    ], { variablen: [["x", zw("die gesuchte Zahl", "the number")]], frage: kopf });
}

/* ======================================================================
   2 · SACHAUFGABEN MIT EINER UNBEKANNTEN (Klasse 7–8)
   ====================================================================== */
const KINDER = [["Lena", "sie"], ["Tim", "er"], ["Mia", "sie"], ["Jonas", "er"], ["Emma", "sie"], ["Paul", "er"]];
function gleichung() {
  const v = z(1, 7);
  if (v === 1) {   // Alter
    let k, m, n, x;
    do { k = z(3, 5); m = z(2, 3); n = z(4, 20); x = (n * (m - 1)) / (k - m); } while (!(m < k && Number.isInteger(x) && x >= 4 && x <= 16));
    const [kind] = wahl(KINDER);
    const kx = lin([[k, "x"]]), xn = lin([[1, "x"], [n, ""]]), kxn = lin([[k, "x"], [n, ""]]);
    return fertig("gleichung", zw("Alter", "Ages"),
      [zw(`Die Mutter von ${kind} ist heute `, `${kind}'s mother is now `), { s: 0 }, ". ", { s: 1 }, zw(" ist sie ", " she is "), { s: 2 }, zw(`. Wie alt ist ${kind} heute?`, `. How old is ${kind} now?`)],
      [
        st(zw(`${k}-mal so alt wie ${kind}`, `${k} times as old as ${kind}`), [kx],
          [{ c: `x + ${k}`, text: zw(`„${k}-mal so alt“ heißt mal ${k}.`, `“${k} times as old” means times ${k}.`) }, { c: `x/${k}`, text: zw("Die Mutter ist älter, nicht jünger.", "The mother is older, not younger.") }],
          zw(`Alter der Mutter heute: $${kx}$.`, `Mother's age now: $${kx}$.`), zw("Alter der Mutter heute", "mother's age now")),
        st(zw(`In ${n} Jahren`, `In ${n} years`), [xn, kxn],
          [{ c: `${k}(x + ${n})`, text: zw(`In ${n} Jahren ist die Mutter ${n} Jahre älter – nicht ${k} · ${n} Jahre.`, `In ${n} years the mother is ${n} years older – not ${k} · ${n}.`) },
            { c: lin([[1, "x"], [-n, ""]]), text: zw("In der Zukunft wird man älter: plus.", "In the future you get older: plus.") }],
          zw(`Beide werden ${n} Jahre älter: ${kind} $${xn}$, die Mutter $${kxn}$.`, `Both get ${n} years older: ${kind} $${xn}$, the mother $${kxn}$.`), zw("beide Alter in der Zukunft", "both ages in the future")),
        st(zw(`nur noch ${m === 2 ? "doppelt" : "dreimal"} so alt`, `only ${m === 2 ? "twice" : "three times"} as old`), [`${kxn} = ${m}(${xn})`],
          [{ c: `${kxn} = ${lin([[m, "x"], [n, ""]])}`, text: zw(`Das ${m}-Fache des ganzen künftigen Alters: Klammer um $${xn}$.`, `${m} times the whole future age: brackets around $${xn}$.`) },
            { c: `${m}(${kxn}) = ${xn}`, text: zw(`Vertauscht: Die Mutter ist ${m}-mal so alt wie das Kind – das ${m} gehört zum Kind.`, `Swapped: the mother is ${m} times as old as the child – the ${m} belongs with the child.`) }],
          zw(`Alter der Mutter dann = ${m} · Alter von ${kind} dann.`, `Mother's age then = ${m} · ${kind}'s age then.`), zw("Vergleich der künftigen Alter", "comparison of future ages")),
      ], { variablen: [["x", zw(`Alter von ${kind} heute (in Jahren)`, `${kind}'s age now (in years)`)]],
        ansatz: variablenWahl(zw(`das heutige Alter von ${kind}`, `${kind}'s age now`),
          [[zw("das heutige Alter der Mutter", "the mother's age now"), zw("Geht auch – aber gefragt ist nach dem Kind. Wähle als x, wonach gefragt ist; dann musst du am Ende nichts umrechnen.", "Possible – but the question asks about the child. Choose what is asked for as x.")],
            [zw(`die Zahl ${n}`, `the number ${n}`), zw(`${n} ist bekannt – eine Unbekannte steht nicht schon im Text.`, `${n} is given – an unknown is not already in the text.`)]],
          zw(`x = Alter von ${kind} heute`, `x = ${kind}'s age now`), zw("Am einfachsten ist x das, wonach gefragt ist.", "It is easiest to take x as the thing asked for.")) });
  }
  if (v === 2) {   // Preise
    const a = z(2, 5), x = wahl([0.8, 1.2, 1.5, 1.8, 2.4]), d = wahl([0.5, 0.9, 1.2, 1.6]), T = rund(a * x + x + d);
    const xd = lin([[1, "x"], [d, ""]]);
    return fertig("gleichung", zw("Preise", "Prices"),
      [{ s: 1 }, zw(" und ein Block ", " and a pad "), { s: 2 }, zw(". Ein Block kostet ", ". A pad costs "), { s: 0 }, zw(". Was kostet ein Heft?", ". How much is one notebook?")],
      [
        st(zw(`${euro(d)} mehr als ein Heft`, `${euro(d)} more than a notebook`), [xd],
          [{ c: `${dez(d)}x`, text: zw(`„${euro(d)} mehr“ heißt plus ${dez(d)}, nicht mal.`, `“${euro(d)} more” means plus ${dez(d)}, not times.`) }, { c: lin([[1, "x"], [-d, ""]]), text: zw("Mehr heißt plus.", "More means plus.") }],
          zw(`Preis eines Blocks: $${xd}$.`, `Price of a pad: $${xd}$.`), zw("Preis eines Blocks", "price of a pad")),
        st(zw(`${a} Hefte`, `${a} notebooks`), [lin([[a, "x"]])],
          [{ c: `x + ${a}`, text: zw(`${a} Hefte kosten ${a}-mal so viel wie eins.`, `${a} notebooks cost ${a} times one.`) }],
          zw(`$${a} \\cdot x$ – ${a} Hefte zu je x Euro.`, `$${a} \\cdot x$ – ${a} notebooks at x euros each.`), zw("Preis aller Hefte", "price of all notebooks")),
        st(zw(`kosten zusammen ${euro(T)}`, `cost ${euro(T)} together`), [`${lin([[a, "x"]])} + (${xd}) = ${dez(T)}`],
          [{ c: `${lin([[a, "x"], [d, ""]])} = ${dez(T)}`, text: zw(`Der Block kostet $${xd}$, nicht nur ${dez(d)}.`, `The pad costs $${xd}$, not just ${dez(d)}.`) },
            { c: `${a}(${xd}) = ${dez(T)}`, text: zw("Nur ein Block, nicht a Blöcke.", "Only one pad.") }],
          zw("„Zusammen“: alle Preise addieren, dann ist die Summe der Gesamtpreis.", "“Together”: add all prices; the sum is the total."), zw("Summe gleich Gesamtpreis", "sum equals total")),
      ], { variablen: [["x", zw("Preis eines Hefts in €", "price of one notebook in €")]],
        ansatz: variablenWahl(zw("der Preis eines Hefts", "the price of one notebook"),
          [[zw(`der Gesamtpreis ${euro(T)}`, `the total ${euro(T)}`), zw("Der Gesamtpreis steht im Text – er ist bekannt.", "The total is given in the text – it is known.")],
            [zw(`die Anzahl ${a} der Hefte`, `the number ${a} of notebooks`), zw("Die Anzahl ist bekannt.", "The number is known.")]],
          zw("x = Preis eines Hefts (in €)", "x = price of one notebook (in €)"), zw("Gefragt ist nach dem Heft – und der Block hängt davon ab.", "The question asks about the notebook – and the pad depends on it.")) });
  }
  if (v === 3) {   // Rechteck
    const x = z(3, 15), d = z(2, 9), U = 2 * x + 2 * (x + d);
    const xd = lin([[1, "x"], [d, ""]]);
    return fertig("gleichung", zw("Rechteck", "Rectangle"),
      [zw("Ein Rechteck ist ", "A rectangle is "), { s: 0 }, ". ", { s: 1 }, zw(". Wie breit ist es?", ". How wide is it?")],
      [
        st(zw(`${d} cm länger als breit`, `${d} cm longer than it is wide`), [xd],
          [{ c: `${d}x`, text: zw(`${d} cm länger heißt plus ${d}.`, `${d} cm longer means plus ${d}.`) }],
          zw(`Länge = Breite + ${d}: $${xd}$.`, `Length = width + ${d}: $${xd}$.`), zw("die Länge", "the length")),
        st(zw(`Sein Umfang beträgt ${U} cm`, `Its perimeter is ${U} cm`), [`2x + 2(${xd}) = ${U}`],
          [{ c: `x + (${xd}) = ${U}`, text: zw("Das ist nur der halbe Umfang – jede Seite kommt zweimal vor.", "That is only half the perimeter – each side appears twice.") },
            { c: `x(${xd}) = ${U}`, text: zw("Das wäre der Flächeninhalt, nicht der Umfang.", "That would be the area, not the perimeter.") }],
          zw("Umfang: alle vier Seiten addieren, $2 \\cdot$ Breite $+ 2 \\cdot$ Länge.", "Perimeter: add all four sides, $2 \\cdot$ width $+ 2 \\cdot$ length."), zw("Summe aller Seiten", "sum of all sides")),
      ], { variablen: [["x", zw("Breite in cm", "width in cm")]],
        ansatz: variablenWahl(zw("die Breite", "the width"), [[zw(`der Umfang ${U} cm`, `the perimeter ${U} cm`), zw("Der Umfang ist gegeben.", "The perimeter is given.")]],
          zw("x = Breite (in cm)", "x = width (in cm)"), zw("Gefragt ist die Breite, die Länge hängt davon ab.", "The width is asked for; the length depends on it.")) });
  }
  if (v === 4) {   // Tarif
    const G = wahl([4, 5, 7.5, 9]), p = wahl([6, 8, 9, 12]), x = z(20, 140), R = rund(G + (p / 100) * x);
    const pe = rund(p / 100);
    return fertig("gleichung", zw("Handytarif", "Phone plan"),
      [zw("Ein Handytarif kostet ", "A phone plan costs "), { s: 1 }, zw(" und ", " and "), { s: 0 }, ". ", { s: 2 }, zw(". Wie viele Minuten wurde telefoniert?", ". How many minutes were used?")],
      [
        st(zw(`${p} ct pro Gesprächsminute`, `${p} cents per minute`), [lin([[pe, "x"]])],
          [{ c: `${p}x`, text: zw(`Achte auf die Einheit: ${p} ct = ${dt(pe)} €. Rechne alles in Euro.`, `Watch the unit: ${p} cents = €${dt(pe)}. Work in euros.`) }, { c: `x + ${dez(pe)}`, text: zw("Pro Minute heißt mal Anzahl der Minuten.", "Per minute means times the number of minutes.") }],
          zw(`x Minuten zu je ${dt(pe)} €: $${dez(pe)}x$ (in Euro).`, `x minutes at €${dt(pe)} each: $${dez(pe)}x$ (in euros).`), zw("Kosten für die Minuten", "cost of the minutes")),
        st(zw(`${euro(G)} Grundgebühr im Monat`, `${euro(G)} basic fee per month`), [dez(G)],
          [{ c: `${dez(G)}x`, text: zw("Die Grundgebühr fällt einmal im Monat an, nicht pro Minute.", "The basic fee is charged once a month, not per minute.") }],
          zw("Fester Betrag – kommt genau einmal dazu.", "Fixed amount – added exactly once."), zw("fester Betrag", "fixed amount")),
        st(zw(`Im Mai beträgt die Rechnung ${euro(R)}`, `In May the bill is ${euro(R)}`), [`${dez(G)} + ${dez(pe)}x = ${dez(R)}`],
          [{ c: `(${dez(G)} + ${dez(pe)})x = ${dez(R)}`, text: zw("Die Grundgebühr fällt einmal an, nicht pro Minute.", "The basic fee is charged once, not per minute.") },
            { c: `${dez(G)} + ${p}x = ${dez(R)}`, text: zw(`Einheiten mischen: ${p} ct sind ${dt(pe)} €.`, `Mixed units: ${p} cents are €${dt(pe)}.`) }],
          zw("Grundgebühr + Minutenkosten = Rechnung.", "Basic fee + minute cost = bill."), zw("Gesamtkosten gleich Rechnung", "total cost equals bill")),
      ], { variablen: [["x", zw("Anzahl der Minuten", "number of minutes")]],
        ansatz: variablenWahl(zw("die Anzahl der Minuten", "the number of minutes"), [[zw("der Preis pro Minute", "the price per minute"), zw("Der Preis pro Minute steht im Text.", "The price per minute is given.")]],
          zw("x = Anzahl der Minuten", "x = number of minutes"), zw("Gefragt ist die Zahl der Minuten.", "The number of minutes is asked for.")) });
  }
  if (v === 5) {   // Prozent
    const rauf = Math.random() < 0.6;
    const p = rauf ? wahl([10, 15, 20, 25, 30]) : wahl([10, 15, 20, 25, 30, 40]);
    const f = rund(rauf ? 1 + p / 100 : 1 - p / 100);
    const x = wahl([200, 240, 300, 360, 400, 480, 500, 600, 800]), N = rund(f * x);
    const was = wahl([[zw("ein Fahrrad", "a bike"), zw("das Fahrrad", "the bike")], [zw("eine Jacke", "a jacket"), zw("die Jacke", "the jacket")], [zw("ein Handy", "a phone"), zw("das Handy", "the phone")]]);
    const teil = rauf ? zw(`Nach einer Preiserhöhung um ${p} %`, `After a price rise of ${p} %`) : zw(`Nach ${p} % Rabatt`, `After a ${p} % discount`);
    return fertig("gleichung", zw("Prozent", "Percent"),
      [{ s: 0 }, zw(` kostet ${was[0]} `, ` ${was[1]} costs `), { s: 1 }, zw(`. Wie teuer war ${was[1]} vorher?`, `. What was the price before?`)],
      [
        st(teil, [`${dez(f)}x`],
          [{ c: rauf ? `x + ${p}` : `x - ${p}`, text: zw(`${p} % sind ein Anteil von x, keine feste Zahl.`, `${p} % is a share of x, not a fixed number.`) },
            { c: `${dez(p / 100)}x`, text: zw(`Das ist nur die ${rauf ? "Erhöhung" : "Ersparnis"}, nicht der neue Preis.`, `That is only the ${rauf ? "increase" : "saving"}, not the new price.`) }],
          zw(`Neuer Preis = alter Preis ${rauf ? "+" : "−"} ${p} % davon = $${dez(f)} \\cdot x$ (Faktor $1 ${rauf ? "+" : "−"} ${dez(p / 100)}$).`, `New price = old price ${rauf ? "+" : "−"} ${p} % of it = $${dez(f)} \\cdot x$ (factor $1 ${rauf ? "+" : "−"} ${dez(p / 100)}$).`), zw("neuer Preis", "new price")),
        st(euro(N), [`${dez(f)}x = ${dez(N)}`],
          [{ c: `x = ${rauf ? `${dez(N)} - ${dez(p / 100)}*${dez(N)}` : `${dez(N)} + ${dez(p / 100)}*${dez(N)}`}`, text: zw(`Die ${p} % beziehen sich auf den alten Preis, nicht auf den neuen – rückwärts darfst du nicht einfach ${p} % ${rauf ? "abziehen" : "addieren"}.`, `The ${p} % refers to the old price, not the new one – going backwards you can't just ${rauf ? "subtract" : "add"} ${p} %.`) },
            { c: `x = ${dez(f)}*${dez(N)}`, text: zw("Umgekehrt: Der neue Preis ist das Vielfache des alten.", "The other way round: the new price is a multiple of the old.") }],
          zw("Der neue Preis ist bekannt – er ist der Faktor mal dem alten Preis.", "The new price is known – it is the factor times the old price."), zw("neuer Preis gleich", "new price equals")),
      ], { variablen: [["x", zw("alter Preis in €", "old price in €")]],
        ansatz: variablenWahl(zw("der Preis vorher", "the price before"), [[zw("der neue Preis", "the new price"), zw("Der neue Preis steht im Text.", "The new price is given.")], [zw(`die ${p} %`, `the ${p} %`), zw("Der Prozentsatz ist gegeben.", "The percentage is given.")]],
          zw("x = Preis vorher (in €)", "x = price before (in €)"), zw("Die Prozente beziehen sich auf den alten Preis – er ist der Grundwert.", "The percentage refers to the old price – it is the base value.")) });
  }
  if (v === 6) {   // Verteilen
    const x = z(5, 25), d = z(2, 12), T = x + 2 * x + x + d;
    const xd = lin([[1, "x"], [d, ""]]);
    return fertig("gleichung", zw("Verteilen", "Sharing"),
      [zw("Anna, Ben und Clara ", "Anna, Ben and Clara "), { s: 2 }, zw(". Anna bekommt ", ". Anna gets "), { s: 0 }, zw(", Clara bekommt ", ", Clara gets "), { s: 1 }, zw(". Wie viel bekommt Ben?", ". How much does Ben get?")],
      [
        st(zw("doppelt so viel wie Ben", "twice as much as Ben"), ["2x"],
          [{ c: "x + 2", text: zw("Doppelt heißt mal 2.", "Twice means times 2.") }, { c: "x/2", text: zw("Anna bekommt mehr als Ben.", "Anna gets more than Ben.") }],
          zw("Annas Anteil: $2x$.", "Anna's share: $2x$."), zw("Annas Anteil", "Anna's share")),
        st(zw(`${d} € mehr als Ben`, `€${d} more than Ben`), [xd],
          [{ c: `${d}x`, text: zw(`${d} € mehr heißt plus ${d}.`, `€${d} more means plus ${d}.`) }],
          zw(`Claras Anteil: $${xd}$.`, `Clara's share: $${xd}$.`), zw("Claras Anteil", "Clara's share")),
        st(zw(`teilen sich ${T} €`, `share €${T}`), [`x + 2x + (${xd}) = ${T}`],
          [{ c: `2x + (${xd}) = ${T}`, text: zw("Ben bekommt auch etwas: x gehört mit in die Summe.", "Ben gets something too: x belongs in the sum.") },
            { c: `2x + ${d} = ${T}`, text: zw("Alle drei Anteile addieren.", "Add all three shares.") }],
          zw("Alle Anteile zusammen ergeben den ganzen Betrag.", "All shares together make the whole amount."), zw("Summe der Anteile", "sum of shares")),
      ], { variablen: [["x", zw("Bens Anteil in €", "Ben's share in €")]],
        ansatz: variablenWahl(zw("Bens Anteil", "Ben's share"), [[zw("Annas Anteil", "Anna's share"), zw("Geht – aber die anderen Anteile werden mit Ben verglichen. Mit x = Ben wird alles einfacher.", "Possible – but the others are compared with Ben. With x = Ben everything is easier.")]],
          zw("x = Bens Anteil (in €)", "x = Ben's share (in €)"), zw("Wähle die Größe, mit der die anderen verglichen werden.", "Choose the quantity the others are compared with.")) });
  }
  /* v === 7: Einholen */
  const [v1, v2] = wahl([[15, 20], [18, 27], [20, 30], [16, 24], [12, 18], [10, 15]]);
  return fertig("gleichung", zw("Bewegung", "Motion"),
    [zw("Ein Radfahrer startet um 9 Uhr ", "A cyclist starts at 9 am "), { s: 0 }, ". ", { s: 1 }, zw(` fährt ein Mofa auf derselben Strecke mit ${v2} km/h hinterher. Wann `, ` a moped follows on the same road at ${v2} km/h. When does it `), { s: 2 }, "?"],
    [
      st(zw(`mit ${v1} km/h`, `at ${v1} km/h`), [lin([[v1, "x"]])],
        [{ c: `x + ${v1}`, text: zw("Weg = Geschwindigkeit mal Zeit.", "Distance = speed times time.") }, { c: `x/${v1}`, text: zw("Weg = Geschwindigkeit mal Zeit.", "Distance = speed times time.") }],
        zw(`Weg des Radfahrers nach x Stunden: $${v1}x$ km.`, `Cyclist's distance after x hours: $${v1}x$ km.`), zw("Weg des Radfahrers", "cyclist's distance")),
      st(zw("Eine Stunde später", "One hour later"), ["x - 1"],
        [{ c: "x + 1", text: zw("Das Mofa fährt kürzer, weil es später startet.", "The moped rides for less time because it starts later.") }],
        zw("Das Mofa ist eine Stunde weniger unterwegs: $x − 1$.", "The moped rides one hour less: $x − 1$."), zw("Fahrzeit des Mofas", "moped's travel time")),
      st(zw("holt das Mofa ihn ein", "catch up with him"), [`${v1}x = ${v2}(x - 1)`],
        [{ c: `${v1}x = ${v2}x`, text: zw("Das Mofa fährt eine Stunde weniger.", "The moped rides one hour less.") },
          { c: `${v2}x = ${v1}(x - 1)`, text: zw("Vertauscht: Das langsamere Fahrzeug ist länger unterwegs.", "Swapped: the slower vehicle travels for longer.") }],
        zw("Einholen heißt: Beide haben denselben Weg zurückgelegt.", "Catching up means: both have covered the same distance."), zw("gleicher Weg", "same distance")),
    ], { variablen: [["x", zw("Fahrzeit des Radfahrers in h", "cyclist's travel time in h")]],
      ansatz: variablenWahl(zw("die Fahrzeit des Radfahrers", "the cyclist's travel time"), [[zw("der Weg bis zum Treffpunkt", "the distance to the meeting point"), zw("Geht auch, ist aber umständlicher – die Frage lautet „wann“.", "Possible but harder – the question is “when”.")]],
        zw("x = Fahrzeit des Radfahrers (in h ab 9 Uhr)", "x = cyclist's travel time (in h after 9 am)"), zw("Gefragt ist ein Zeitpunkt – also eine Zeit als x.", "A time is asked for – so take a time as x.")) });
}

/* ======================================================================
   3 · ZWEI UNBEKANNTE (Klasse 8–9)
   ====================================================================== */
function zweiVariablen(x, y, falsch) {
  return {
    t: null, frage: zw("Welche Unbekannten wählst du?", "Which unknowns do you choose?"),
    optionen: [{ id: "r", text: `x = ${x}, y = ${y}`, richtig: true }, ...falsch.map(([text, rueck], i) => ({ id: `f${i}`, text, richtig: false, rueck }))],
    zeile: `x = ${x}, y = ${y}`, warum: zw("Zwei unbekannte Größen brauchen zwei Variablen – und zwei Gleichungen.", "Two unknown quantities need two variables – and two equations."), unbekannte: null,
  };
}
function lgs() {
  const v = z(1, 6);
  if (v === 1) {
    const x = z(5, 30), y = z(3, 20), K = x + y, B = 2 * x + 4 * y;
    return fertig("lgs", zw("Hühner und Kaninchen", "Hens and rabbits"),
      [zw("Auf einem Hof leben Hühner und Kaninchen. Zusammen haben sie ", "A farm has hens and rabbits. Together they have "), { s: 0 }, zw(" und ", " and "), { s: 1 }, "."],
      [
        st(zw(`${K} Köpfe`, `${K} heads`), [`x + y = ${K}`],
          [{ c: `2x + 4y = ${K}`, text: zw("Jedes Tier hat genau einen Kopf.", "Every animal has exactly one head.") }],
          zw("Jedes Tier hat einen Kopf: Anzahl Hühner + Anzahl Kaninchen.", "Every animal has one head: number of hens + number of rabbits."), zw("Anzahl aller Tiere", "number of all animals")),
        st(zw(`${B} Beine`, `${B} legs`), [`2x + 4y = ${B}`],
          [{ c: `4x + 2y = ${B}`, text: zw("Hühner haben 2 Beine, Kaninchen 4 – und x zählt die Hühner.", "Hens have 2 legs, rabbits 4 – and x counts the hens.") },
            { c: `x + y = ${B}`, text: zw("Das zählt Tiere, nicht Beine.", "That counts animals, not legs.") }],
          zw("Jedes Huhn 2 Beine, jedes Kaninchen 4: $2x + 4y$.", "Each hen 2 legs, each rabbit 4: $2x + 4y$."), zw("Anzahl aller Beine", "number of all legs")),
      ], { variablen: [["x", zw("Anzahl der Hühner", "number of hens")], ["y", zw("Anzahl der Kaninchen", "number of rabbits")]],
        ansatz: zweiVariablen(zw("Anzahl Hühner", "number of hens"), zw("Anzahl Kaninchen", "number of rabbits"), [[zw("x = Köpfe, y = Beine", "x = heads, y = legs"), zw("Köpfe und Beine sind gegeben – gesucht sind die Tiere.", "Heads and legs are given – the animals are unknown.")]]) });
  }
  if (v === 2) {
    const x = z(8, 18), y = z(3, 9);
    const [a1, b1, a2, b2] = wahl([[3, 2, 2, 4], [2, 3, 1, 4], [2, 1, 1, 3], [4, 2, 3, 5]]);
    const T1 = a1 * x + b1 * y, T2 = a2 * x + b2 * y;
    const t = (a, b) => zw(`${a} Erwachsene und ${b} Kinder`, `${a} adults and ${b} children`);
    return fertig("lgs", zw("Eintritt", "Admission"),
      [zw("Im Zoo zahlen ", "At the zoo "), { s: 0 }, ". ", { s: 1 }, zw(". Was kostet eine Karte für Erwachsene, was für Kinder?", ". What does an adult ticket cost, and a child's ticket?")],
      [
        st(zw(`${t(a1, b1)} zusammen ${T1} €`, `${t(a1, b1)} pay €${T1} together`), [`${lin([[a1, "x"], [b1, "y"]])} = ${T1}`],
          [{ c: `${lin([[b1, "x"], [a1, "y"]])} = ${T1}`, text: zw(`x ist der Preis für Erwachsene – die ${a1} gehört zu x.`, `x is the adult price – the ${a1} belongs with x.`) },
            { c: `${a1 + b1}(x + y) = ${T1}`, text: zw("Es sind verschieden viele Erwachsene und Kinder.", "There are different numbers of adults and children.") }],
          zw("Anzahl mal Einzelpreis, für beide Gruppen addiert.", "Number times single price, added for both groups."), zw("Gesamtpreis Gruppe 1", "total for group 1")),
        st(zw(`${t(a2, b2)} zahlen ${T2} €`, `${t(a2, b2)} pay €${T2}`), [`${lin([[a2, "x"], [b2, "y"]])} = ${T2}`],
          [{ c: `${lin([[b2, "x"], [a2, "y"]])} = ${T2}`, text: zw("Erwachsene gehören zu x.", "Adults belong with x.") }],
          zw("Gleiche Übersetzung für die zweite Gruppe.", "Same translation for the second group."), zw("Gesamtpreis Gruppe 2", "total for group 2")),
      ], { variablen: [["x", zw("Preis Erwachsene in €", "adult price in €")], ["y", zw("Preis Kind in €", "child price in €")]],
        ansatz: zweiVariablen(zw("Preis Erwachsene", "adult price"), zw("Preis Kind", "child price"), [[zw("x = Anzahl Erwachsene, y = Anzahl Kinder", "x = number of adults, y = number of children"), zw("Die Anzahlen stehen im Text – unbekannt sind die Preise.", "The numbers are given – the prices are unknown.")]]) });
  }
  if (v === 3) {
    const x = z(4, 20), y = z(3, 15), N = x + y, W = x + 2 * y;
    return fertig("lgs", zw("Münzen", "Coins"),
      [zw("In einer Spardose liegen ", "A money box contains "), { s: 0 }, zw(", nur 1-€- und 2-€-Münzen. ", ", only €1 and €2 coins. "), { s: 1 }, "."],
      [
        st(zw(`${N} Münzen`, `${N} coins`), [`x + y = ${N}`],
          [{ c: `x + 2y = ${N}`, text: zw("Gezählt werden Münzen, nicht Euro.", "This counts coins, not euros.") }],
          zw("Anzahl 1-€-Münzen + Anzahl 2-€-Münzen.", "Number of €1 coins + number of €2 coins."), zw("Anzahl der Münzen", "number of coins")),
        st(zw(`Zusammen sind es ${W} €`, `Together they are worth €${W}`), [`x + 2y = ${W}`],
          [{ c: `2x + y = ${W}`, text: zw("y zählt die 2-€-Münzen – die 2 gehört zu y.", "y counts the €2 coins – the 2 belongs with y.") },
            { c: `x + y = ${W}`, text: zw("Das zählt Münzen, nicht Euro.", "That counts coins, not euros.") }],
          zw("Wert: jede 1-€-Münze 1 €, jede 2-€-Münze 2 €.", "Value: each €1 coin €1, each €2 coin €2."), zw("Gesamtwert", "total value")),
      ], { variablen: [["x", zw("Anzahl 1-€-Münzen", "number of €1 coins")], ["y", zw("Anzahl 2-€-Münzen", "number of €2 coins")]],
        ansatz: zweiVariablen(zw("Anzahl 1-€-Münzen", "number of €1 coins"), zw("Anzahl 2-€-Münzen", "number of €2 coins"), [[zw("x = Münzen, y = Euro", "x = coins, y = euros"), zw("Beides ist gegeben.", "Both are given.")]]) });
  }
  if (v === 4) {
    let x, y; do { x = z(1, 8); y = z(2, 9); } while (y <= x);
    const s = x + y, d = 9 * (y - x);
    return fertig("lgs", zw("Ziffernrätsel", "Digit puzzle"),
      [zw("Bei einer zweistelligen Zahl ist ", "For a two-digit number "), { s: 0 }, ". ", { s: 1 }, zw(", so ist die neue Zahl ", ", the new number is "), { s: 2 }, "."],
      [
        st(zw(`die Quersumme ${s}`, `the digit sum is ${s}`), [`x + y = ${s}`],
          [{ c: `10x + y = ${s}`, text: zw("Die Quersumme ist die Summe der Ziffern, nicht die Zahl.", "The digit sum is the sum of the digits, not the number.") }],
          zw("Quersumme = Zehnerziffer + Einerziffer.", "Digit sum = tens digit + units digit."), zw("Summe der Ziffern", "sum of digits")),
        st(zw("Vertauscht man die Ziffern", "If you swap the digits"), ["10y + x"],
          [{ c: "y*x", text: zw("„yx“ wäre y mal x – die Zahl mit den Ziffern y und x ist 10y + x.", "“yx” would be y times x – the number with digits y and x is 10y + x.") },
            { c: "10x + y", text: zw("Das ist die ursprüngliche Zahl.", "That is the original number.") }],
          zw("Die Zahl mit Zehnerziffer y und Einerziffer x ist $10y + x$ (Stellenwert!).", "The number with tens digit y and units digit x is $10y + x$ (place value!)."), zw("neue Zahl", "new number")),
        st(zw(`um ${d} größer`, `${d} greater`), [`10y + x = 10x + y + ${d}`],
          [{ c: `10y + x + ${d} = 10x + y`, text: zw(`Die neue Zahl ist größer – die ${d} kommt zur kleineren Seite.`, `The new number is greater – ${d} goes with the smaller side.`) }],
          zw(`Neue Zahl = alte Zahl + ${d}; die alte Zahl ist $10x + y$.`, `New number = old number + ${d}; the old number is $10x + y$.`), zw("Vergleich der Zahlen", "comparison of numbers")),
      ], { variablen: [["x", zw("Zehnerziffer", "tens digit")], ["y", zw("Einerziffer", "units digit")]],
        ansatz: zweiVariablen(zw("Zehnerziffer", "tens digit"), zw("Einerziffer", "units digit"), [[zw("x = die Zahl, y = die neue Zahl", "x = the number, y = the new number"), zw("Mit den Ziffern als Variablen kannst du Quersumme und Vertauschen ausdrücken.", "With the digits as variables you can express both the digit sum and the swap.")]]) });
  }
  if (v === 5) {
    const M = wahl([10, 20]);
    const x = z(2, M - 2), y = M - x;   // Mischpreis 12 − 4x/M: immer ein Vielfaches von 0,2
    const pm = rund((8 * x + 12 * y) / M), W = 8 * x + 12 * y;
    return fertig("lgs", zw("Mischung", "Mixture"),
      [zw("Ein Händler mischt Kaffee zu 8 €/kg mit Kaffee zu 12 €/kg. Er erhält ", "A dealer mixes coffee at €8/kg with coffee at €12/kg. He gets "), { s: 0 }, ", ", { s: 1 }, "."],
      [
        st(zw(`${M} kg Mischung`, `${M} kg of mixture`), [`x + y = ${M}`],
          [{ c: `8x + 12y = ${M}`, text: zw("Hier geht es um Kilogramm, nicht um Euro.", "This is about kilograms, not euros.") }],
          zw("Die Mengen beider Sorten ergeben zusammen die Mischung.", "The amounts of both kinds add up to the mixture."), zw("Gesamtmenge", "total amount")),
        st(zw(`die ${dt(pm)} €/kg kosten soll`, `which should cost €${dt(pm)}/kg`), [{ c: `8x + 12y = ${W}`, alt: [`8x + 12y = ${dez(pm)}*${M}`] }],
          [{ c: `8x + 12y = ${dez(pm)}`, text: zw(`${dt(pm)} €/kg ist ein Preis pro Kilogramm – der Gesamtwert der Mischung ist ${dt(pm)} · ${M}.`, `€${dt(pm)}/kg is a price per kilogram – the total value is ${dt(pm)} · ${M}.`) }],
          zw("Wert der Sorten zusammen = Wert der Mischung = Preis pro kg mal Menge.", "Value of both kinds = value of mixture = price per kg times amount."), zw("Gesamtwert", "total value")),
      ], { variablen: [["x", zw("kg Kaffee zu 8 €", "kg of €8 coffee")], ["y", zw("kg Kaffee zu 12 €", "kg of €12 coffee")]],
        ansatz: zweiVariablen(zw("kg Sorte 8 €", "kg of €8 kind"), zw("kg Sorte 12 €", "kg of €12 kind"), [[zw("x = Preis, y = Menge", "x = price, y = amount"), zw("Die Preise sind gegeben – unbekannt sind die Mengen.", "Prices are given – amounts are unknown.")]]) });
  }
  /* v === 6: Rechteck */
  const k = z(2, 4), y = z(2, 9), x = k * y, U = 2 * x + 2 * y;
  return fertig("lgs", zw("Rechteck", "Rectangle"),
    [zw("Ein Rechteck hat ", "A rectangle has "), { s: 0 }, ". ", { s: 1 }, "."],
    [
      st(zw(`den Umfang ${U} cm`, `a perimeter of ${U} cm`), [`2x + 2y = ${U}`],
        [{ c: `x + y = ${U}`, text: zw("Halber Umfang – jede Seite kommt zweimal vor.", "Half the perimeter – each side appears twice.") }, { c: `x*y = ${U}`, text: zw("Das wäre der Flächeninhalt.", "That would be the area.") }],
        zw("Umfang = 2 · Länge + 2 · Breite.", "Perimeter = 2 · length + 2 · width."), zw("Umfang", "perimeter")),
      st(zw(`Die Länge ist ${k}-mal so groß wie die Breite`, `The length is ${k} times the width`), [`x = ${k}y`],
        [{ c: `y = ${k}x`, text: zw(`Vertauscht! Die Länge ist größer: x = ${k} · y. Probe mit Zahlen: Breite 2 → Länge ${2 * k}.`, `Swapped! The length is larger: x = ${k} · y. Check with numbers: width 2 → length ${2 * k}.`) }],
        zw(`Die größere Größe ist gleich dem ${k}-Fachen der kleineren – sonst ergibt die Probe mit Zahlen Unsinn.`, `The larger quantity equals ${k} times the smaller one – check with numbers.`), zw("Vergleich Länge – Breite", "length vs. width")),
    ], { variablen: [["x", zw("Länge in cm", "length in cm")], ["y", zw("Breite in cm", "width in cm")]],
      ansatz: zweiVariablen(zw("Länge", "length"), zw("Breite", "width"), [[zw("x = Umfang, y = Fläche", "x = perimeter, y = area"), zw("Unbekannt sind die Seiten.", "The sides are unknown.")]]) });
}

/* ======================================================================
   4 · FUNKTIONEN AUFSTELLEN (Klasse 9–10)
   ====================================================================== */
const ANS_LIN = { id: "lin", tex: "f(x) = mx + c" };
const ANS_QUAD = { id: "quad", tex: "f(x) = ax^2 + bx + c" };
const ANS_SCH = { id: "sch", tex: "f(x) = a(x - d)^2 + e" };
const ANS_EXP = { id: "exp", tex: "f(x) = a \\cdot b^x" };
function ansatzWahl(phrase, richtig, falsche, warum, unbekannte) {
  const alle = [richtig, ...falsche.map(([a]) => a)];
  return {
    t: phrase, frage: zw("Welcher Ansatz passt?", "Which general form fits?"),
    optionen: alle.map((a, i) => ({ id: a.id, tex: a.tex, richtig: i === 0, rueck: i === 0 ? null : falsche[i - 1][1] })),
    zeile: richtig.tex, warum, unbekannte,
  };
}
/* Denkfehler zu „P(x|y) liegt auf dem Graphen“ */
const punktFalsch = (x1, y1) => [
  { c: fb(0, y1, x1), text: zw("Erst x, dann y: P(x|y) liegt auf dem Graphen heißt f(x) = y.", "x first, then y: P(x|y) on the graph means f(x) = y.") },
  { c: fb(1, x1, y1), text: zw("Ein Punkt ist ein Funktionswert, keine Steigung.", "A point is a function value, not a slope.") },
  { c: fb(0, x1, -y1 || 1), text: zw("Achte auf das Vorzeichen der y-Koordinate.", "Watch the sign of the y-coordinate.") },
];
function funktion() {
  const v = z(1, 6);
  const fLin = ["f"];
  if (v === 1 || v === 2) {
    const lage = v === 1 ? "y" : wahl(["par", "senk"]);
    const m = wahl(lage === "senk" ? [-2, -1, -0.5, 0.5, 1, 2] : [-3, -2, -1, 1, 2, 3, 0.5, -0.5]), c = z(-5, 6), x1 = wahl([-3, -2, -1, 1, 2, 3, 4]), y1 = rund(m * x1 + c);
    const stellen = [];
    const teile = [{ a: true }];
    if (lage === "y") {
      teile.push(" ", { s: 0 }, zw(" und ", " and "), { s: 1 }, ".");
      stellen.push(st(zw(`geht durch den Punkt P${pkt(x1, y1)}`, `passes through the point P${pkt(x1, y1)}`), [fb(0, x1, y1)],
        punktFalsch(x1, y1),
        zw(`Ein Punkt P(x|y) liegt auf dem Graphen, wenn f(x) = y: $f(${dt(x1)}) = ${dt(y1)}$.`, `A point P(x|y) lies on the graph if f(x) = y: $f(${dt(x1)}) = ${dt(y1)}$.`), zw("Punkt liegt auf dem Graphen", "point lies on the graph")));
      stellen.push(st(zw(`schneidet die y-Achse bei ${dt(c)}`, `crosses the y-axis at ${dt(c)}`), [fb(0, 0, c)],
        [{ c: fb(0, c, 0), text: zw("Das wäre eine Nullstelle bei x = " + dt(c) + ". Die y-Achse liegt bei x = 0.", "That would be a zero at x = " + dt(c) + ". The y-axis is at x = 0.") },
          { c: `m = ${dez(c)}`, text: zw("Der Schnitt mit der y-Achse ist ein Punkt, keine Steigung.", "The y-intercept is a point, not a slope.") },
          { c: fb(0, 0, c + 1), text: zw("Lies den Wert genau ab: Bei x = 0 ist f(0) = " + dt(c) + ".", "Read the value carefully: at x = 0, f(0) = " + dt(c) + ".") }],
        zw("Auf der y-Achse ist x = 0: $f(0) = " + dt(c) + "$ – in $mx + c$ ist das gerade c.", "On the y-axis x = 0: $f(0) = " + dt(c) + "$ – in $mx + c$ this is c."), zw("Wert bei x = 0", "value at x = 0")));
    } else {
      const m0 = lage === "par" ? m : -1 / m;
      const geradeText = `y = ${lin([[m0, "x"], [z(1, 7), ""]])}`;
      teile.push(" ", { s: 0 }, zw(" und ", " and "), { s: 1 }, ".");
      stellen.push(st(lage === "par" ? zw(`verläuft parallel zu ${geradeText.replace(/-/g, "−")}`, `is parallel to ${geradeText.replace(/-/g, "−")}`) : zw(`steht senkrecht auf ${geradeText.replace(/-/g, "−")}`, `is perpendicular to ${geradeText.replace(/-/g, "−")}`),
        [{ c: `m = ${dez(m)}`, alt: [`f'(0) = ${dez(m)}`] }],
        lage === "par"
          ? [{ c: `m = ${dez(-1 / m)}`, text: zw("Das wäre senkrecht – parallel heißt gleiche Steigung.", "That would be perpendicular – parallel means equal slope.") }, { c: `c = ${geradeText.split(" ").pop()}`, text: zw("Parallel heißt gleiche Steigung – der y-Achsenabschnitt darf anders sein.", "Parallel means equal slope – the y-intercept may differ.") }]
          : [{ c: `m = ${dez(m0)}`, text: zw("Das ist die Steigung der anderen Geraden – senkrecht heißt $m_1 \\cdot m_2 = −1$.", "That is the slope of the other line – perpendicular means $m_1 \\cdot m_2 = −1$.") }, { c: `m = ${dez(-m0)}`, text: zw("Nur das Vorzeichen zu ändern reicht nicht: Kehrwert und Vorzeichen, $m = −\\frac{1}{m_1}$.", "Changing the sign is not enough: reciprocal and sign, $m = −\\frac{1}{m_1}$.") }],
        lage === "par" ? zw(`Parallele Geraden haben dieselbe Steigung: $m = ${dt(m)}$.`, `Parallel lines have the same slope: $m = ${dt(m)}$.`) : zw(`Senkrecht: $m \\cdot ${dt(m0)} = −1$, also $m = ${dt(m)}$.`, `Perpendicular: $m \\cdot ${dt(m0)} = −1$, so $m = ${dt(m)}$.`),
        zw("Steigung", "slope")));
      stellen.push(st(zw(`geht durch Q${pkt(x1, y1)}`, `passes through Q${pkt(x1, y1)}`), [fb(0, x1, y1)],
        punktFalsch(x1, y1),
        zw(`Punkt auf dem Graphen: $f(${dt(x1)}) = ${dt(y1)}$.`, `Point on the graph: $f(${dt(x1)}) = ${dt(y1)}$.`), zw("Punkt liegt auf dem Graphen", "point lies on the graph")));
    }
    return fertig("funktion", zw("Gerade", "Straight line"), teile, stellen, {
      funktionen: fLin, eval: linAnsatz(),
      ansatz: ansatzWahl(zw("Eine Gerade", "A straight line"), ANS_LIN, [[ANS_QUAD, zw("Eine Gerade hat kein $x^2$.", "A straight line has no $x^2$.")], [ANS_EXP, zw("Das ist eine Exponentialfunktion.", "That is an exponential function.")]],
        zw("Gerade: $f(x) = mx + c$ – zwei Unbekannte m und c, also zwei Bedingungen.", "Line: $f(x) = mx + c$ – two unknowns m and c, so two conditions."), ["m", "c"]),
    });
  }
  if (v === 3) {   // Scheitel + Punkt
    const a = wahl([-2, -1, -0.5, 0.5, 1, 2]), d = z(-3, 4), e = z(-4, 5), x1 = d + wahl([-2, -1, 1, 2]), y1 = rund(a * (x1 - d) ** 2 + e);
    return fertig("funktion", zw("Parabel", "Parabola"),
      [{ a: true }, zw(" hat ", " has "), { s: 0 }, zw(" und ", " and "), { s: 1 }, "."],
      [
        st(zw(`ihren Scheitelpunkt in S${pkt(d, e)}`, `its vertex at S${pkt(d, e)}`), [`d = ${dez(d)}`, `e = ${dez(e)}`],
          [d !== 0 ? { c: `d = ${dez(-d)}`, text: zw("In $a(x − d)^2 + e$ steht d mit Minus – der Scheitel liegt bei x = d, ohne Vorzeichenwechsel.", "In $a(x − d)^2 + e$, d appears with a minus – the vertex is at x = d.") } : null,
            d !== e ? { c: `d = ${dez(e)}`, text: zw("Vertauscht: d ist die x-Koordinate des Scheitels.", "Swapped: d is the x-coordinate of the vertex.") } : null,
            { c: fb(0, d, 0), text: zw("Der Scheitel ist keine Nullstelle.", "The vertex is not a zero.") }],
          zw("In der Scheitelform $a(x − d)^2 + e$ ist S(d|e) der Scheitel: Die Koordinaten kannst du direkt einsetzen.", "In vertex form $a(x − d)^2 + e$, S(d|e) is the vertex: insert the coordinates directly."), zw("Scheitel ablesen", "read off the vertex")),
        st(zw(`geht durch P${pkt(x1, y1)}`, `passes through P${pkt(x1, y1)}`), [fb(0, x1, y1)],
          punktFalsch(x1, y1),
          zw(`Punkt auf dem Graphen: $f(${dt(x1)}) = ${dt(y1)}$ – daraus bekommst du a.`, `Point on the graph: $f(${dt(x1)}) = ${dt(y1)}$ – this gives you a.`), zw("Punkt liegt auf dem Graphen", "point lies on the graph")),
      ], { funktionen: fLin, eval: scheitelAnsatz(),
        ansatz: ansatzWahl(zw("Eine Parabel", "A parabola"), ANS_SCH, [[ANS_QUAD, zw("Geht auch, aber mit dem Scheitel ist die Scheitelform viel schneller: Zwei Unbekannte stehen sofort fest.", "Possible, but with the vertex the vertex form is much quicker.")], [ANS_LIN, zw("Eine Parabel ist keine Gerade.", "A parabola is not a straight line.")]],
          zw("Ist der Scheitel gegeben, nimm die Scheitelform: drei Unbekannte a, d, e – der Scheitel liefert d und e.", "If the vertex is given, use vertex form: three unknowns a, d, e – the vertex gives d and e."), ["a", "d", "e"]) });
  }
  if (v === 4) {   // Nullstellen + y-Achse
    const n1 = z(-4, -1), n2 = z(1, 5), a = wahl([-2, -1, 1, 2]), c = a * n1 * n2;
    return fertig("funktion", zw("Parabel", "Parabola"),
      [{ a: true }, " ", { s: 0 }, zw(" und ", " and "), { s: 1 }, "."],
      [
        st(zw(`schneidet die y-Achse bei ${dt(c)}`, `crosses the y-axis at ${dt(c)}`), [fb(0, 0, c)],
          [{ c: fb(0, c, 0), text: zw("Die y-Achse liegt bei x = 0.", "The y-axis is at x = 0.") }],
          zw("y-Achse: x = 0.", "y-axis: x = 0."), zw("Wert bei x = 0", "value at x = 0")),
        st(zw(`hat die Nullstellen ${dt(n1)} und ${dt(n2)}`, `has the zeros ${dt(n1)} and ${dt(n2)}`), [fb(0, n1, 0), fb(0, n2, 0)],
          [{ c: fb(0, 0, n1), text: zw(`Nullstelle bei x = ${dt(n1)} heißt: Dort ist der Funktionswert 0.`, `A zero at x = ${dt(n1)} means the function value there is 0.`) }],
          zw("Nullstelle = Stelle, an der f den Wert 0 hat – zwei Nullstellen, zwei Bedingungen.", "Zero = place where f is 0 – two zeros, two conditions."), zw("Funktionswert 0", "function value 0")),
      ], { funktionen: fLin, eval: polyAnsatz([["a", 2], ["b", 1], ["c", 0]]),
        ansatz: ansatzWahl(zw("Der Graph einer quadratischen Funktion", "The graph of a quadratic function"), ANS_QUAD, [[ANS_LIN, zw("Quadratisch heißt mit $x^2$.", "Quadratic means with $x^2$.")], [ANS_EXP, zw("Das ist eine Exponentialfunktion.", "That is exponential.")]],
          zw("Quadratische Funktion: drei Unbekannte a, b, c – also drei Bedingungen.", "Quadratic function: three unknowns a, b, c – so three conditions."), ["a", "b", "c"]) });
  }
  if (v === 5) {   // Wurf
    const h = wahl([1.5, 2, 2.5]), xs = z(4, 12), H = rund(h + wahl([2, 3, 4, 5])), w = z(14, 30);
    const zweite = Math.random() < 0.5;
    return fertig("funktion", zw("Wurf", "Throw"),
      [zw("Ein Ball wird ", "A ball is thrown "), { s: 0 }, zw(". Seine Flugbahn ist eine Parabel (x: waagrechte Entfernung in m). ", ". Its path is a parabola (x: horizontal distance in m). "), { a: true }, zw(" Er ", " It "), { s: 1 }, "."],
      [
        st(zw(`aus ${dt(h)} m Höhe abgeworfen`, `from a height of ${dt(h)} m`), [fb(0, 0, h)],
          [{ c: fb(0, h, 0), text: zw("Abwurf heißt Entfernung x = 0, Höhe " + dt(h) + ".", "Release means distance x = 0, height " + dt(h) + ".") }],
          zw("Beim Abwurf ist die waagrechte Entfernung 0.", "At release the horizontal distance is 0."), zw("Startpunkt", "start point")),
        zweite
          ? st(zw(`erreicht nach ${xs} m seine größte Höhe von ${dt(H)} m`, `reaches its greatest height of ${dt(H)} m after ${xs} m`), [`d = ${xs}`, `e = ${dez(H)}`],
            [{ c: fb(0, H, xs), text: zw("Erst x, dann y: Entfernung " + xs + ", Höhe " + dt(H) + ".", "x first, then y.") }, { c: `d = ${dez(H)}`, text: zw("Vertauscht: d ist die Entfernung.", "Swapped: d is the distance.") }],
            zw("Größte Höhe = Scheitel S(" + xs + "|" + dt(H) + ").", "Greatest height = vertex S(" + xs + "|" + dt(H) + ")."), zw("Scheitel", "vertex"))
          : st(zw(`landet nach ${w} m auf dem Boden`, `lands on the ground after ${w} m`), [fb(0, w, 0)],
            [{ c: fb(0, 0, w), text: zw("Landen heißt Höhe 0 bei Entfernung " + w + ".", "Landing means height 0 at distance " + w + ".") }],
            zw("Am Boden ist die Höhe 0: Nullstelle bei x = " + w + ".", "On the ground the height is 0: zero at x = " + w + "."), zw("Höhe 0", "height 0")),
      ], { funktionen: fLin, eval: zweite ? scheitelAnsatz() : polyAnsatz([["a", 2], ["b", 1], ["c", 0]]),
        ansatz: zweite
          ? ansatzWahl(zw("Gesucht ist die Gleichung der Flugbahn.", "Find the equation of the path."), ANS_SCH, [[ANS_QUAD, zw("Geht auch – mit dem Scheitel ist die Scheitelform aber schneller.", "Possible – but with the vertex the vertex form is quicker.")], [ANS_EXP, zw("Eine Flugbahn ist eine Parabel.", "A trajectory is a parabola.")]],
            zw("Die größte Höhe ist der Scheitel – also Scheitelform.", "The greatest height is the vertex – so use vertex form."), ["a", "d", "e"])
          : ansatzWahl(zw("Gesucht ist die Gleichung der Flugbahn.", "Find the equation of the path."), ANS_QUAD, [[ANS_LIN, zw("Eine Flugbahn ist gekrümmt.", "A path is curved.")], [ANS_EXP, zw("Eine Flugbahn ist eine Parabel.", "A trajectory is a parabola.")]],
            zw("Parabel in Normalform – mit zwei Bedingungen hier fehlt noch eine dritte Information.", "Parabola in standard form – two conditions here, a third piece of information is still missing."), ["a", "b", "c"]) });
  }
  /* v === 6: Wachstum */
  const art = wahl(["plus", "minus", "doppelt", "halb"]);
  const N0 = wahl([200, 500, 800, 1200, 2000]);
  const p = wahl([3, 4, 5, 8, 12, 15]), T = z(2, 8);
  const was = wahl([[zw("Eine Bakterienkultur umfasst", "A bacteria culture has"), zw("Bakterien", "bacteria"), zw("stündlich", "per hour"), zw("Stunden", "hours")], [zw("Ein Guthaben beträgt", "A balance is"), zw("Euro", "euros"), zw("jährlich", "per year"), zw("Jahre", "years")], [zw("Ein Wald hat", "A forest has"), zw("Bäume", "trees"), zw("jährlich", "per year"), zw("Jahre", "years")]]);
  const zweite = art === "plus"
    ? st(zw(`wächst ${was[2]} um ${p} %`, `grows by ${p} % ${was[2]}`), [{ c: `b = ${dez(1 + p / 100)}`, alt: [`f(1) = ${dez(1 + p / 100)}*f(0)`] }],
      [{ c: `b = ${p}`, text: zw(`${p} % Wachstum heißt Faktor $1 + ${dez(p / 100)}$.`, `${p} % growth means factor $1 + ${dez(p / 100)}$.`) }, { c: `b = ${dez(p / 100)}`, text: zw(`Das ist nur der Zuwachs – der Wachstumsfaktor ist $1 + ${dez(p / 100)}$.`, `That is only the increase – the growth factor is $1 + ${dez(p / 100)}$.`) }],
      zw(`Jede Zeiteinheit: alter Bestand + ${p} % → Faktor $b = ${dt(1 + p / 100)}$.`, `Each time step: old value + ${p} % → factor $b = ${dt(1 + p / 100)}$.`), zw("Wachstumsfaktor", "growth factor"))
    : art === "minus"
      ? st(zw(`nimmt ${was[2]} um ${p} % ab`, `decreases by ${p} % ${was[2]}`), [{ c: `b = ${dez(1 - p / 100)}`, alt: [`f(1) = ${dez(1 - p / 100)}*f(0)`] }],
        [{ c: `b = ${dez(-p / 100)}`, text: zw("Der Faktor ist nie negativ – es bleiben " + (100 - p) + " % übrig.", "The factor is never negative – " + (100 - p) + " % remain.") }, { c: `b = ${dez(p / 100)}`, text: zw("Es bleiben " + (100 - p) + " %, nicht " + p + " %.", (100 - p) + " % remain, not " + p + " %.") }],
        zw(`Abnahme um ${p} %: Es bleiben ${100 - p} % → $b = ${dt(1 - p / 100)}$.`, `Decrease by ${p} %: ${100 - p} % remain → $b = ${dt(1 - p / 100)}$.`), zw("Abnahmefaktor", "decay factor"))
      : art === "doppelt"
        ? st(zw(`verdoppelt sich alle ${T} ${was[3]}`, `doubles every ${T} ${was[3]}`), [{ c: `f(${T}) = 2*f(0)`, alt: [`b^${T} = 2`] }],
          [{ c: `b = 2`, text: zw(`Verdopplung in ${T} Zeiteinheiten, nicht in einer.`, `Doubling in ${T} time steps, not one.`) }, { c: `f(${T}) = 2`, text: zw("Doppelt so viel wie am Anfang – nicht der Wert 2.", "Twice the start value – not the value 2.") }],
          zw(`Nach ${T} Zeiteinheiten ist es doppelt so viel wie am Anfang: $f(${T}) = 2 \\cdot f(0)$, also $b^{${T}} = 2$.`, `After ${T} time steps it is twice the start: $f(${T}) = 2 \\cdot f(0)$, so $b^{${T}} = 2$.`), zw("Verdopplungszeit", "doubling time"))
        : st(zw(`halbiert sich alle ${T} ${was[3]}`, `halves every ${T} ${was[3]}`), [{ c: `f(${T}) = 0,5*f(0)`.replace("0,5", dez(0.5)), alt: [`b^${T} = ${dez(0.5)}`] }],
          [{ c: `b = ${dez(0.5)}`, text: zw(`Halbierung in ${T} Zeiteinheiten, nicht in einer.`, `Halving in ${T} time steps, not one.`) }, { c: `f(${T}) = ${dez(0.5)}`, text: zw("Halb so viel wie am Anfang – nicht der Wert 0,5.", "Half the start value – not the value 0.5.") }],
          zw(`$f(${T}) = ${dt(0.5)} \\cdot f(0)$, also $b^{${T}} = ${dt(0.5)}$.`, `$f(${T}) = ${dt(0.5)} \\cdot f(0)$, so $b^{${T}} = ${dt(0.5)}$.`), zw("Halbwertszeit", "half-life"));
  return fertig("funktion", zw("Wachstum", "Growth"),
    [`${was[0]} `, { s: 0 }, zw(" und ", " and "), { s: 1 }, ". ", { a: true }],
    [
      st(zw(`zu Beginn ${N0} ${was[1]}`, `${N0} ${was[1]} at the start`), [fb(0, 0, N0)],
        [{ c: fb(0, 1, N0), text: zw("„Zu Beginn“ heißt t = 0.", "“At the start” means t = 0.") }, { c: `b = ${N0}`, text: zw("Der Anfangswert ist a, nicht b.", "The start value is a, not b.") }],
        zw(`Anfangswert: $f(0) = ${N0}$ – in $a \\cdot b^x$ ist das gerade a.`, `Start value: $f(0) = ${N0}$ – in $a \\cdot b^x$ this is a.`), zw("Anfangswert", "start value")),
      zweite,
    ], { funktionen: fLin, eval: expAnsatz(),
      ansatz: ansatzWahl(zw("Gesucht ist eine Funktion für den Bestand.", "Find a function for the amount."), ANS_EXP, [[ANS_LIN, zw("Prozentuales Wachstum ist exponentiell, nicht linear: Es kommt jedes Mal ein Anteil dazu, kein fester Betrag.", "Percentage growth is exponential, not linear.")], [ANS_QUAD, zw("Eine Parabel beschreibt keinen prozentualen Zuwachs.", "A parabola does not describe percentage growth.")]],
        zw("Gleicher Faktor pro Zeitschritt → exponentiell: $f(x) = a \\cdot b^x$.", "Same factor per time step → exponential: $f(x) = a \\cdot b^x$."), ["a", "b"]) });
}

/* ======================================================================
   5 · SIGNALWÖRTER STOCHASTIK (Klasse 10–13)
   ====================================================================== */
const KONTEXTE = [
  { n: [20, 30, 50], p: [0.3, 0.25, 0.4], de: (n, p) => `Ein Glücksrad wird ${n}-mal gedreht; die Wahrscheinlichkeit für Rot beträgt ${dt(p)}.`, en: (n, p) => `A wheel is spun ${n} times; the probability of red is ${dt(p)}.`, X: ["die Anzahl der roten Felder", "the number of reds"], tr: ["Rot", "red"], wie: ["gedreht", "spun"] },
  { n: [50, 80, 100], p: [0.85, 0.9, 0.8], de: (n, p) => `Von einer Samensorte keimen ${dt(p * 100)} % der Samen. Ein Gärtner sät ${n} Samen.`, en: (n, p) => `${dt(p * 100)} % of seeds of a variety germinate. A gardener sows ${n} seeds.`, X: ["die Anzahl der keimenden Samen", "the number of seeds that germinate"], tr: ["keimende Samen", "germinating seeds"], wie: ["gesät", "sown"] },
  { n: [100, 200], p: [0.05, 0.04, 0.02], de: (n, p) => `Eine Maschine produziert mit ${dt(p * 100)} % Ausschuss. Es werden ${n} Teile geprüft.`, en: (n, p) => `A machine produces ${dt(p * 100)} % defective parts. ${n} parts are checked.`, X: ["die Anzahl der defekten Teile", "the number of defective parts"], tr: ["defekte Teile", "defective parts"], wie: ["geprüft", "checked"] },
  { n: [10, 12, 20], p: [0.25, 0.2], de: (n, p) => `Ein Test hat ${n} Fragen mit je ${Math.round(1 / p)} Antworten, von denen genau eine richtig ist. Lisa rät bei jeder Frage.`, en: (n, p) => `A test has ${n} questions with ${Math.round(1 / p)} answers each, exactly one correct. Lisa guesses every question.`, X: ["die Anzahl der richtigen Antworten", "the number of correct answers"], tr: ["richtige Antworten", "correct answers"], wie: ["geraten", "guessed"] },
];
function ereignisStelle(n) {
  const art = wahl(["genau", "hoechstens", "mindestens", "mehr", "weniger", "zwischen", "einer", "keiner"]);
  const k = z(3, Math.max(4, Math.min(n - 2, 12)));
  if (art === "genau") return st(zw(`genau ${k}`, `exactly ${k}`), [`P(X = ${k})`],
    [{ c: `P(X ≤ ${k})`, text: zw("„Genau“ heißt nur dieser eine Wert.", "“Exactly” means just this value.") }, { c: `P(X ≥ ${k})`, text: zw("„Genau“ heißt nur dieser eine Wert.", "“Exactly” means just this value.") }],
    zw("Genau ein Wert: $P(X = k)$.", "Exactly one value: $P(X = k)$."), zw(`X ist ${k}`, `X equals ${k}`));
  if (art === "hoechstens") return st(zw(`höchstens ${k}`, `at most ${k}`), [`P(X ≤ ${k})`],
    [{ c: `P(X < ${k})`, text: zw(`„Höchstens ${k}“ schließt ${k} mit ein.`, `“At most ${k}” includes ${k}.`) }, { c: `P(X ≥ ${k})`, text: zw("Höchstens heißt: nicht mehr als – also kleiner oder gleich.", "At most means not more than – less than or equal.") }],
    zw(`Höchstens ${k}: 0, 1, …, ${k} – also $X \\leq ${k}$.`, `At most ${k}: 0, 1, …, ${k} – so $X \\leq ${k}$.`), zw(`X ist ${k} oder weniger`, `X is ${k} or less`));
  if (art === "mindestens") return st(zw(`mindestens ${k}`, `at least ${k}`), [{ c: `P(X ≥ ${k})`, alt: [`1 - P(X ≤ ${k - 1})`] }],
    [{ c: `P(X > ${k})`, text: zw(`„Mindestens ${k}“ schließt ${k} mit ein.`, `“At least ${k}” includes ${k}.`) }, { c: `1 - P(X ≤ ${k})`, text: zw(`Das Gegenereignis von „mindestens ${k}“ ist „höchstens ${k - 1}“, nicht „höchstens ${k}“.`, `The complement of “at least ${k}” is “at most ${k - 1}”.`) }],
    zw(`$P(X \\geq ${k}) = 1 − P(X \\leq ${k - 1})$ – im Tafelwerk stehen meist nur die „höchstens“-Werte.`, `$P(X \\geq ${k}) = 1 − P(X \\leq ${k - 1})$ – tables usually list only “at most” values.`), zw(`X ist ${k} oder mehr`, `X is ${k} or more`));
  if (art === "mehr") return st(zw(`mehr als ${k}`, `more than ${k}`), [{ c: `P(X ≥ ${k + 1})`, alt: [`1 - P(X ≤ ${k})`] }],
    [{ c: `P(X ≥ ${k})`, text: zw(`„Mehr als ${k}“ heißt ab ${k + 1} – ${k} selbst zählt nicht.`, `“More than ${k}” starts at ${k + 1}.`) }],
    zw(`Mehr als ${k}: ${k + 1}, ${k + 2}, … → $P(X \\geq ${k + 1}) = 1 − P(X \\leq ${k})$.`, `More than ${k}: ${k + 1}, ${k + 2}, … → $P(X \\geq ${k + 1})$.`), zw(`X ist größer als ${k}`, `X is greater than ${k}`));
  if (art === "weniger") return st(zw(`weniger als ${k}`, `fewer than ${k}`), [`P(X ≤ ${k - 1})`],
    [{ c: `P(X ≤ ${k})`, text: zw(`„Weniger als ${k}“ – ${k} selbst zählt nicht.`, `“Fewer than ${k}” – ${k} itself does not count.`) }],
    zw(`Weniger als ${k}: höchstens ${k - 1}.`, `Fewer than ${k}: at most ${k - 1}.`), zw(`X ist kleiner als ${k}`, `X is less than ${k}`));
  if (art === "zwischen") {
    const a = Math.max(1, k - z(2, 4));
    return st(zw(`zwischen ${a} und ${k} (jeweils einschließlich)`, `between ${a} and ${k} (inclusive)`), [{ c: `P(${a} ≤ X ≤ ${k})`, alt: [`P(X ≤ ${k}) - P(X ≤ ${a - 1})`] }],
      [{ c: `P(X ≤ ${k}) - P(X ≤ ${a})`, text: zw(`So fehlt X = ${a}: Abziehen musst du nur bis ${a - 1}.`, `This misses X = ${a}: subtract only up to ${a - 1}.`) }],
      zw(`$P(${a} \\leq X \\leq ${k}) = P(X \\leq ${k}) − P(X \\leq ${a - 1})$.`, `$P(${a} \\leq X \\leq ${k}) = P(X \\leq ${k}) − P(X \\leq ${a - 1})$.`), zw("ein Bereich", "a range"));
  }
  if (art === "einer") return st(zw("mindestens einmal", "at least once"), [{ c: "P(X ≥ 1)", alt: ["1 - P(X = 0)"] }],
    [{ c: "P(X = 1)", text: zw("Mindestens einmal heißt 1, 2, 3, … – nicht genau einmal.", "At least once means 1, 2, 3, … – not exactly once.") }, { c: "1 - P(X = 1)", text: zw("Das Gegenereignis von „mindestens einmal“ ist „keinmal“: X = 0.", "The complement of “at least once” is “never”: X = 0.") }],
    zw("Mindestens einmal = nicht keinmal: $1 − P(X = 0)$.", "At least once = not never: $1 − P(X = 0)$."), zw("X ist nicht 0", "X is not 0"));
  return st(zw("kein einziges Mal", "not even once"), ["P(X = 0)"],
    [{ c: "P(X ≤ 1)", text: zw("Kein einziges Mal heißt X = 0.", "Not even once means X = 0.") }],
    zw("Keinmal: $P(X = 0)$.", "Never: $P(X = 0)$."), zw("X ist 0", "X is 0"));
}
function stochastik() {
  const K = wahl(KONTEXTE);
  const n = wahl(K.n), p = wahl(K.p);
  const v = z(1, 4);
  const satz = zw(K.de(n, p), K.en(n, p));
  if (v === 4) {   // mindestens-mindestens
    const ziel = wahl([0.9, 0.95, 0.99]);
    return fertig("stochastik", zw("Mindestens – mindestens – mindestens", "At least – at least – at least"),
      [zw(`Die Trefferwahrscheinlichkeit beträgt ${dt(p)}. Wie oft muss man es mindestens versuchen, damit man `, `The probability of success is ${dt(p)}. How many times at least must you try so that you get `), { s: 1 }, zw(" ", " "), { s: 0 }, zw(" einen Treffer erzielt?", " one success?")],
      [
        st(zw("mindestens", "at least"), [{ c: "P(X ≥ 1)", alt: ["1 - P(X = 0)"] }],
          [{ c: "P(X = 1)", text: zw("Mindestens ein Treffer, nicht genau einer.", "At least one success, not exactly one.") }],
          zw("Mindestens ein Treffer: $P(X \\geq 1) = 1 − P(X = 0)$.", "At least one success: $P(X \\geq 1) = 1 − P(X = 0)$."), zw("Ereignis", "event")),
        st(zw(`mit einer Wahrscheinlichkeit von mindestens ${dt(ziel * 100)} %`, `with a probability of at least ${dt(ziel * 100)} %`), [{ c: `P(X ≥ 1) ≥ ${dez(ziel)}`, alt: [`1 - P(X = 0) ≥ ${dez(ziel)}`, `1 - ${dez(1 - p)}^n ≥ ${dez(ziel)}`, `${dez(1 - p)}^n ≤ ${dez(1 - ziel)}`] }],
          [{ c: `P(X ≥ 1) = ${dez(ziel)}`, text: zw(`„Mindestens ${dt(ziel * 100)} %“ ist eine Ungleichung: $\\geq ${dt(ziel)}$.`, `“At least ${dt(ziel * 100)} %” is an inequality: $\\geq ${dt(ziel)}$.`) },
            { c: `P(X ≥ 1) ≥ ${ziel * 100}`, text: zw(`Prozent als Dezimalzahl: ${dt(ziel * 100)} % = ${dt(ziel)}.`, `Percent as a decimal: ${dt(ziel * 100)} % = ${dt(ziel)}.`) }],
          zw(`Die Wahrscheinlichkeit des Ereignisses soll mindestens ${dt(ziel)} sein. Mit $P(X = 0) = ${dt(1 - p)}^n$ wird daraus $1 − ${dt(1 - p)}^n \\geq ${dt(ziel)}$.`, `The probability must be at least ${dt(ziel)}. With $P(X = 0) = ${dt(1 - p)}^n$ this becomes $1 − ${dt(1 - p)}^n \\geq ${dt(ziel)}$.`), zw("Ungleichung für n", "inequality for n")),
      ], { funktionen: [], variablen: [["n", zw("Anzahl der Versuche (gesucht)", "number of trials (unknown)")], ["X", zw("Anzahl der Treffer", "number of successes")]] });
  }
  const e1 = ereignisStelle(n);
  let e2; do { e2 = ereignisStelle(n); } while (e2.t === e1.t);
  return fertig("stochastik", zw("Binomialverteilung", "Binomial distribution"),
    [satz + " ", zw(`X ist ${K.X[0]}. Notiere `, `X is ${K.X[1]}. Write down `), { s: 0 }, zw(" und ", " and "), { s: 1 }, zw(`. Ereignis A: `, `. Event A: `), { s: 2 }, ` ${zw(K.tr[0], K.tr[1])}. ${zw("Ereignis B: ", "Event B: ")}`, { s: 3 }, ` ${zw(K.tr[0], K.tr[1])}.`],
    [
      st(zw("die Anzahl der Versuche", "the number of trials"), [`n = ${n}`],
        [{ c: `n = ${dez(p)}`, text: zw("n zählt die Versuche – p ist die Wahrscheinlichkeit.", "n counts the trials – p is the probability.") }],
        zw(`Gezählt wird, wie oft ${K.wie[0]} wird: n = ${n}.`, `Count how often it is ${K.wie[1]}: n = ${n}.`), zw("Kettenlänge n", "number of trials n")),
      st(zw("die Trefferwahrscheinlichkeit", "the probability of success"), [`p = ${dez(p)}`],
        [{ c: `p = ${dez(1 - p)}`, text: zw("Treffer ist das, was X zählt – " + K.tr[0] + ".", "A success is what X counts.") }, { c: `p = ${dez(p * 100)}`, text: zw("Wahrscheinlichkeiten liegen zwischen 0 und 1.", "Probabilities lie between 0 and 1.") }],
        zw(`Treffer = ${K.tr[0]}, also p = ${dt(p)}.`, `Success = ${K.tr[1]}, so p = ${dt(p)}.`), zw("Wahrscheinlichkeit p", "probability p")),
      e1, e2,
    ], { funktionen: [], variablen: [["X", zw(K.X[0], K.X[1])]] });
}

/* ======================================================================
   6 · STECKBRIEFAUFGABEN (Klasse 11–13)
   ====================================================================== */
const ANSAETZE = {
  p2: { tex: "f(x) = ax^2 + bx + c", koeff: [["a", 2], ["b", 1], ["c", 0]] },
  p3: { tex: "f(x) = ax^3 + bx^2 + cx + d", koeff: [["a", 3], ["b", 2], ["c", 1], ["d", 0]] },
  p3u: { tex: "f(x) = ax^3 + bx", koeff: [["a", 3], ["b", 1]] },
  p4g: { tex: "f(x) = ax^4 + bx^2 + c", koeff: [["a", 4], ["b", 2], ["c", 0]] },
  p4: { tex: "f(x) = ax^4 + bx^3 + cx^2 + dx + k", koeff: [["a", 4], ["b", 3], ["c", 2], ["d", 1], ["k", 0]] },
};
const fallend = (p, k) => { let f = 1; for (let i = 0; i < k; i++) f *= p - i; return f; };
/* Polynom als Liste [Koeffizient, Hochzahl] */
const pw = (P, x, k = 0) => rund(P.reduce((s, [c, p]) => (p - k < 0 ? s : s + c * fallend(p, k) * x ** (p - k)), 0));
const VZ_HOCH = (P, x) => pw(P, x, 2) < 0;

/* Eigenschaften → Textstellen */
const form = (f, s) => ({ ...s, form: f });
const E = {
  extrem(P, x0) {
    const y0 = pw(P, x0), hoch = VZ_HOCH(P, x0);
    const N = hoch ? ["Hochpunkt", "maximum", "H"] : ["Tiefpunkt", "minimum", "T"];
    return form("nomen", st(zw(`einen ${N[0]} in ${N[2]}${pkt(x0, y0)}`, `a ${N[1]} at ${N[2]}${pkt(x0, y0)}`), [fb(0, x0, y0), fb(1, x0, 0)],
      [x0 !== y0 ? { c: fb(0, y0, x0), text: zw("Erst x, dann y: $" + N[2] + "(x|y)$ heißt $f(x) = y$.", "x first, then y.") } : null,
        { c: fb(2, x0, 0), text: zw("$f'' = 0$ gehört zum Wendepunkt. Am " + N[0] + " ist die Tangente waagrecht: $f' = 0$.", "$f'' = 0$ belongs to an inflection point. At a " + N[1] + " the tangent is horizontal: $f' = 0$.") },
        y0 !== 0 ? { c: fb(1, x0, y0), text: zw(`$f'(${dt(x0)})$ ist die Steigung – die ist am ${N[0]} 0. ${dt(y0)} ist der Funktionswert.`, `$f'(${dt(x0)})$ is the slope – it is 0 at a ${N[1]}. ${dt(y0)} is the function value.`) } : null],
      zw(`Zwei Informationen: Der Punkt liegt auf dem Graphen, $f(${dt(x0)}) = ${dt(y0)}$, und die Tangente ist dort waagrecht, $f'(${dt(x0)}) = 0$. ($f''(${dt(x0)}) ${hoch ? "<" : ">"} 0$ ist keine Gleichung – damit prüfst du am Ende.)`,
        `Two pieces of information: the point lies on the graph, $f(${dt(x0)}) = ${dt(y0)}$, and the tangent is horizontal there, $f'(${dt(x0)}) = 0$. ($f''(${dt(x0)}) ${hoch ? "<" : ">"} 0$ is not an equation – you use it to check at the end.)`),
      zw("Punkt auf dem Graphen + waagrechte Tangente", "point on the graph + horizontal tangent")));
  },
  extremstelle(P, x0) {
    return form("nomen", st(zw(`an der Stelle x = ${dt(x0)} ein Extremum`, `an extremum at x = ${dt(x0)}`), [fb(1, x0, 0)],
      [{ c: fb(0, x0, 0), text: zw("Ein Extremum an einer Stelle sagt nichts über den Funktionswert.", "An extremum at a point says nothing about the function value.") }, { c: fb(2, x0, 0), text: zw("Extremum: $f' = 0$, nicht $f''$.", "Extremum: $f' = 0$, not $f''$.") }],
      zw(`Nur die Stelle ist bekannt, nicht die Höhe: eine Bedingung, $f'(${dt(x0)}) = 0$.`, `Only the position is known, not the height: one condition, $f'(${dt(x0)}) = 0$.`), zw("waagrechte Tangente", "horizontal tangent")));
  },
  wende(P, x0) {
    const y0 = pw(P, x0);
    return form("nomen", st(zw(`einen Wendepunkt in W${pkt(x0, y0)}`, `an inflection point at W${pkt(x0, y0)}`), [fb(0, x0, y0), fb(2, x0, 0)],
      [{ c: fb(1, x0, 0), text: zw("$f' = 0$ gehört zum Extrempunkt – am Wendepunkt ist $f'' = 0$.", "$f' = 0$ belongs to an extremum – at an inflection point $f'' = 0$.") },
        x0 !== y0 ? { c: fb(0, y0, x0), text: zw("Erst x, dann y.", "x first, then y.") } : null],
      zw(`Punkt auf dem Graphen, $f(${dt(x0)}) = ${dt(y0)}$, und Krümmungswechsel, $f''(${dt(x0)}) = 0$.`, `Point on the graph, $f(${dt(x0)}) = ${dt(y0)}$, and change of curvature, $f''(${dt(x0)}) = 0$.`), zw("Punkt + Krümmungswechsel", "point + change of curvature")));
  },
  sattel(P, x0) {
    const y0 = pw(P, x0);
    return form("nomen", st(zw(`einen Sattelpunkt in S${pkt(x0, y0)}`, `a saddle point at S${pkt(x0, y0)}`), [fb(0, x0, y0), fb(1, x0, 0), fb(2, x0, 0)],
      [{ c: fb(0, y0, x0), text: zw("Erst x, dann y.", "x first, then y.") }],
      zw("Ein Sattelpunkt ist ein Wendepunkt mit waagrechter Tangente: drei Bedingungen – f, f′ und f″.", "A saddle point is an inflection point with a horizontal tangent: three conditions – f, f′ and f″."), zw("Wendepunkt mit waagrechter Tangente", "inflection point with horizontal tangent")));
  },
  yachse(P) {
    const y0 = pw(P, 0);
    if (y0 === 0) return form("verb", st(zw("verläuft durch den Ursprung", "passes through the origin"), [fb(0, 0, 0)],
      [{ c: fb(1, 0, 0), text: zw("Durch den Ursprung heißt nur: Der Punkt (0|0) liegt auf dem Graphen.", "Through the origin only means (0|0) lies on the graph.") }],
      zw("Ursprung = O(0|0): $f(0) = 0$.", "Origin = O(0|0): $f(0) = 0$."), zw("Punkt (0|0)", "point (0|0)")));
    return form("verb", st(zw(`schneidet die y-Achse bei y = ${dt(y0)}`, `crosses the y-axis at y = ${dt(y0)}`), [fb(0, 0, y0)],
      [{ c: fb(0, y0, 0), text: zw("Das wäre eine Nullstelle. Auf der y-Achse ist x = 0.", "That would be a zero. On the y-axis x = 0.") }],
      zw(`y-Achse: x = 0, also $f(0) = ${dt(y0)}$.`, `y-axis: x = 0, so $f(0) = ${dt(y0)}$.`), zw("Wert bei x = 0", "value at x = 0")));
  },
  punkt(P, x0) {
    const y0 = pw(P, x0);
    return form("verb", st(zw(`geht durch den Punkt P${pkt(x0, y0)}`, `passes through P${pkt(x0, y0)}`), [fb(0, x0, y0)],
      [x0 !== y0 ? { c: fb(0, y0, x0), text: zw("Erst x, dann y.", "x first, then y.") } : null, { c: fb(1, x0, y0), text: zw("Ein Punkt ist ein Funktionswert, keine Steigung.", "A point is a function value, not a slope.") }],
      zw(`Punkt auf dem Graphen: $f(${dt(x0)}) = ${dt(y0)}$.`, `Point on the graph: $f(${dt(x0)}) = ${dt(y0)}$.`), zw("Punkt auf dem Graphen", "point on the graph")));
  },
  nullstelle(P, x0) {
    return form("verb", st(zw(`hat bei x = ${dt(x0)} eine Nullstelle`, `has a zero at x = ${dt(x0)}`), [fb(0, x0, 0)],
      [{ c: fb(0, 0, x0), text: zw("Vertauscht: An der Nullstelle ist der Funktionswert 0.", "Swapped: at a zero the function value is 0.") }, { c: fb(1, x0, 0), text: zw("Nullstelle heißt f = 0, nicht f′ = 0.", "Zero means f = 0, not f′ = 0.") }],
      zw(`Nullstelle: $f(${dt(x0)}) = 0$.`, `Zero: $f(${dt(x0)}) = 0$.`), zw("Funktionswert 0", "function value 0")));
  },
  beruehrt(P, x0) {
    return form("verb", st(zw(`berührt die x-Achse bei x = ${dt(x0)}`, `touches the x-axis at x = ${dt(x0)}`), [fb(0, x0, 0), fb(1, x0, 0)],
      [{ c: fb(2, x0, 0), text: zw("Berühren heißt: Die x-Achse ist dort Tangente – also $f' = 0$.", "Touching means the x-axis is a tangent there – so $f' = 0$.") }],
      zw("Berühren = Nullstelle und die x-Achse ist Tangente: $f = 0$ und $f' = 0$ (doppelte Nullstelle).", "Touching = zero and the x-axis is the tangent: $f = 0$ and $f' = 0$ (double zero)."), zw("Nullstelle mit waagrechter Tangente", "zero with horizontal tangent")));
  },
  steigung(P, x0) {
    const m = pw(P, x0, 1);
    return form("verb", st(zw(`hat an der Stelle x = ${dt(x0)} die Steigung ${dt(m)}`, `has slope ${dt(m)} at x = ${dt(x0)}`), [fb(1, x0, m)],
      [{ c: fb(0, x0, m), text: zw("Steigung heißt Ableitung: $f'$, nicht $f$.", "Slope means derivative: $f'$, not $f$.") }, m !== x0 ? { c: fb(1, m, x0), text: zw("Vertauscht: Die Stelle steht in der Klammer.", "Swapped: the position goes inside the brackets.") } : null],
      zw(`Steigung = Wert der Ableitung: $f'(${dt(x0)}) = ${dt(m)}$.`, `Slope = value of the derivative: $f'(${dt(x0)}) = ${dt(m)}$.`), zw("Ableitung an der Stelle", "derivative at the point")));
  },
  parallel(P, x0) {
    const m = pw(P, x0, 1), n = z(1, 7);
    return form("satz", st(zw(`Die Tangente an der Stelle x = ${dt(x0)} verläuft parallel zur Geraden y = ${lin([[m, "x"], [n, ""]]).replace(/-/g, "−")}`, `The tangent at x = ${dt(x0)} is parallel to the line y = ${lin([[m, "x"], [n, ""]]).replace(/-/g, "−")}`),
      [fb(1, x0, m)],
      [{ c: `f(${dez(x0)}) = ${dez(m * x0 + n)}`, text: zw("Parallel heißt nur gleiche Steigung – die Tangente ist nicht dieselbe Gerade.", "Parallel only means the same slope – the tangent is not the same line.") }, { c: fb(1, x0, n), text: zw("Die Steigung der Geraden ist der Faktor vor x.", "The slope of the line is the factor in front of x.") }],
      zw(`Parallel = gleiche Steigung: $f'(${dt(x0)}) = ${dt(m)}$.`, `Parallel = same slope: $f'(${dt(x0)}) = ${dt(m)}$.`), zw("gleiche Steigung", "same slope")));
  },
  senkrecht(P, x0) {
    const m = pw(P, x0, 1);
    const g = m === 1 ? "-x + 1" : m === -1 ? "x + 1" : m > 0 ? `-x/${m} + 1` : `x/${-m} + 1`;
    return form("satz", st(zw(`Die Tangente bei x = ${dt(x0)} steht senkrecht auf der Geraden y = ${g.replace(/-/g, "−")}`, `The tangent at x = ${dt(x0)} is perpendicular to the line y = ${g.replace(/-/g, "−")}`),
      [fb(1, x0, m)],
      [{ c: `f'(${dez(x0)}) = ${dez(-1 / m)}`, text: zw("Das ist die Steigung der Geraden selbst – senkrecht heißt $m_1 \\cdot m_2 = −1$.", "That is the slope of the line itself – perpendicular means $m_1 \\cdot m_2 = −1$.") }],
      zw(`Senkrecht: $m_t \\cdot m_g = −1$. Die Gerade hat Steigung $${dt(-1 / m)}$, also $f'(${dt(x0)}) = ${dt(m)}$.`, `Perpendicular: $m_t \\cdot m_g = −1$. The line has slope $${dt(-1 / m)}$, so $f'(${dt(x0)}) = ${dt(m)}$.`), zw("Steigung über $m_1 \\cdot m_2 = −1$", "slope via $m_1 \\cdot m_2 = −1$")));
  },
  tangente(P, x0) {
    const m = pw(P, x0, 1), y0 = pw(P, x0), n = rund(y0 - m * x0);
    return form("satz", st(zw(`Im Punkt P(${dt(x0)}|f(${dt(x0)})) hat der Graph die Tangente y = ${lin([[m, "x"], [n, ""]]).replace(/-/g, "−")}`, `At P(${dt(x0)}|f(${dt(x0)})) the graph has the tangent y = ${lin([[m, "x"], [n, ""]]).replace(/-/g, "−")}`),
      [fb(0, x0, y0), fb(1, x0, m)],
      [{ c: fb(0, x0, n), text: zw(`${dt(n)} ist der y-Achsenabschnitt der Tangente, nicht $f(${dt(x0)})$. Setze x = ${dt(x0)} in die Tangente ein.`, `${dt(n)} is the tangent's y-intercept, not $f(${dt(x0)})$. Insert x = ${dt(x0)} into the tangent.`) }],
      zw(`Zwei Bedingungen: Berührpunkt liegt auf beiden – $f(${dt(x0)}) = ${dt(m)} \\cdot ${dt(x0)} ${n < 0 ? "−" : "+"} ${dt(Math.abs(n))} = ${dt(y0)}$ – und gleiche Steigung, $f'(${dt(x0)}) = ${dt(m)}$.`, `Two conditions: the point of contact lies on both – $f(${dt(x0)}) = ${dt(y0)}$ – and equal slope, $f'(${dt(x0)}) = ${dt(m)}$.`), zw("Berührpunkt + Steigung", "point of contact + slope")));
  },
  wendetangente(P, x0) {
    const m = pw(P, x0, 1), y0 = pw(P, x0), n = rund(y0 - m * x0);
    return form("satz", st(zw(`Die Wendetangente an der Stelle x = ${dt(x0)} hat die Gleichung y = ${lin([[m, "x"], [n, ""]]).replace(/-/g, "−")}`, `The inflectional tangent at x = ${dt(x0)} is y = ${lin([[m, "x"], [n, ""]]).replace(/-/g, "−")}`),
      [fb(0, x0, y0), fb(1, x0, m), fb(2, x0, 0)],
      [{ c: fb(1, x0, 0), text: zw("Eine Wendetangente ist nicht automatisch waagrecht – ihre Steigung steht in der Gleichung.", "An inflectional tangent is not automatically horizontal – its slope is in the equation.") }],
      zw("Wendetangente = Tangente im Wendepunkt: drei Bedingungen – Punkt ($f$), Steigung ($f'$), Wendepunkt ($f'' = 0$).", "Inflectional tangent = tangent at the inflection point: three conditions – point ($f$), slope ($f'$), inflection ($f'' = 0$)."), zw("Punkt + Steigung + Wendepunkt", "point + slope + inflection")));
  },
  waagrecht(P, x0) {
    return form("verb", st(zw(`hat bei x = ${dt(x0)} eine waagrechte Tangente`, `has a horizontal tangent at x = ${dt(x0)}`), [fb(1, x0, 0)],
      [{ c: fb(0, x0, 0), text: zw("Waagrecht betrifft die Steigung, nicht den Funktionswert.", "Horizontal is about the slope, not the value.") }],
      zw(`Waagrecht = Steigung 0: $f'(${dt(x0)}) = 0$.`, `Horizontal = slope 0: $f'(${dt(x0)}) = 0$.`), zw("Steigung 0", "slope 0")));
  },
};

function einsetzenZeilen(koeff, stellen) {
  const zeilen = [];
  for (const s of stellen) for (const ziel of s.ziel) {
    const m = /^f('*)\(([-\d.,]+)\) = ([-\d.,]+)$/.exec(ziel.c);
    if (!m) continue;
    const k = m[1].length, x0 = Number(m[2].replace(",", ".")), y0 = Number(m[3].replace(",", "."));
    const glieder = koeff.map(([v, p]) => [p - k < 0 ? 0 : fallend(p, k) * x0 ** (p - k), v]);
    zeilen.push({ bed: ziel.c, gl: `${lin(glieder)} = ${dez(y0)}` });
  }
  return zeilen;
}

function steckbrief() {
  const art = wahl(["p3", "p3", "p3", "p3u", "p4g", "p2"]);
  let P, stellen, ansatzPhrase, falsche, warum;
  const kombi = (...e) => e;
  if (art === "p3") {
    /* f(x) = k(2x³ − 3(p+q)x² + 6pq·x) + d: Extremstellen p und q, Wendestelle (p+q)/2 */
    let p, q; do { p = z(-2, 3); q = z(-2, 3); } while (p === q || (p + q) % 2 !== 0);
    const k = wahl([-1, 1]);
    const variante = z(1, 7);
    let d = z(-4, 4);
    const roh = [[2 * k, 3], [-3 * k * (p + q), 2], [6 * k * p * q, 1]];
    if (variante === 4) d = -pw(roh.map(([c, e]) => [c, e]), p);   // berührt die x-Achse in p
    if (variante === 6 && Math.random() < 0.5) d = 0;
    P = [...roh, [d, 0]].filter(([c]) => c !== 0);
    const w = (p + q) / 2;
    const x1 = wahl([-1, 1, 2].filter((x) => x !== p && x !== q && x !== w)) ?? 1;
    if (variante === 1) stellen = kombi(E.extrem(P, p), E.extrem(P, q));
    else if (variante === 2) stellen = kombi(E.extrem(P, p), E.wende(P, w));
    else if (variante === 3) stellen = w === 0 ? kombi(E.wendetangente(P, w), E.punkt(P, x1)) : kombi(E.wendetangente(P, w), E.yachse(P));
    else if (variante === 4) stellen = kombi(E.beruehrt(P, p), E.extrem(P, q));
    else if (variante === 5) stellen = kombi(E.extrem(P, p), E.steigung(P, x1), x1 === 0 ? E.punkt(P, 3) : E.yachse(P));
    else if (variante === 6) stellen = kombi(E.wende(P, w), wahl([E.parallel, E.senkrecht, E.steigung])(P, w === x1 ? x1 + 1 : x1), w === 0 ? E.punkt(P, 2) : E.yachse(P));
    else stellen = kombi(E.extremstelle(P, p), E.wende(P, w), E.punkt(P, x1 === w ? x1 + 2 : x1));
    if (variante === 6) {   // senkrecht nur, wenn die Steigung dort ±1…±4 ist
      const s = stellen[1];
      if (/senkrecht|perpendicular/.test(s.t) && /f'\([^)]*\) = 0$/.test(s.ziel[0].c)) stellen[1] = E.steigung(P, w === x1 ? x1 + 1 : x1);
    }
    ansatzPhrase = zw("Der Graph einer ganzrationalen Funktion dritten Grades", "The graph of a polynomial function of degree 3");
    falsche = [["p3u", zw("Davon steht nichts im Text: Ohne Symmetrie brauchst du alle vier Koeffizienten.", "The text says nothing about symmetry: you need all four coefficients.")], ["p2", zw("Dritten Grades heißt: höchste Hochzahl 3.", "Degree 3 means highest power 3.")], ["p4", zw("Dritten Grades, nicht vierten.", "Degree 3, not 4.")]];
    warum = zw("Grad 3: vier Unbekannte a, b, c, d – du brauchst vier Bedingungen.", "Degree 3: four unknowns a, b, c, d – you need four conditions.");
  } else if (art === "p3u") {
    const p = wahl([1, 2]), k = wahl([-1, 1]);
    P = [[k, 3], [-3 * k * p * p, 1]];
    const v = z(1, 2);
    stellen = v === 1 ? [E.extrem(P, p)] : [E.steigung(P, 0), E.punkt(P, wahl([1, 2, 3]))];
    ansatzPhrase = zw("Der Graph einer ganzrationalen Funktion dritten Grades ist punktsymmetrisch zum Ursprung", "The graph of a polynomial function of degree 3 is point-symmetric about the origin");
    falsche = [["p3", zw("Punktsymmetrisch zum Ursprung heißt: nur ungerade Hochzahlen – $bx^2$ und $d$ fallen weg.", "Point symmetry about the origin means odd powers only – $bx^2$ and $d$ drop out.")], ["p4g", zw("Gerade Hochzahlen gehören zur Achsensymmetrie.", "Even powers belong to axis symmetry.")], ["p2", zw("Dritten Grades heißt: höchste Hochzahl 3.", "Degree 3 means highest power 3.")]];
    warum = zw("Punktsymmetrie zum Ursprung: nur ungerade Hochzahlen, $f(x) = ax^3 + bx$ – zwei Unbekannte. $f(0) = 0$ und $f''(0) = 0$ gelten dann von selbst.", "Point symmetry about the origin: odd powers only, $f(x) = ax^3 + bx$ – two unknowns. $f(0) = 0$ and $f''(0) = 0$ then hold automatically.");
  } else if (art === "p4g") {
    const p = wahl([1, 2]), k = wahl([-1, 1]), c = z(-3, 4);
    P = [[k, 4], [-2 * k * p * p, 2], [c, 0]].filter(([x]) => x !== 0);
    stellen = [E.extrem(P, p), E.yachse(P)];
    ansatzPhrase = zw("Der Graph einer ganzrationalen Funktion vierten Grades ist achsensymmetrisch zur y-Achse", "The graph of a polynomial function of degree 4 is symmetric about the y-axis");
    falsche = [["p4", zw("Achsensymmetrie zur y-Achse heißt: nur gerade Hochzahlen – $bx^3$ und $dx$ fallen weg.", "Symmetry about the y-axis means even powers only – $bx^3$ and $dx$ drop out.")], ["p3u", zw("Ungerade Hochzahlen gehören zur Punktsymmetrie.", "Odd powers belong to point symmetry.")], ["p2", zw("Vierten Grades heißt: höchste Hochzahl 4.", "Degree 4 means highest power 4.")]];
    warum = zw("Achsensymmetrie: nur gerade Hochzahlen, $f(x) = ax^4 + bx^2 + c$ – drei Unbekannte. Wegen der Symmetrie liegt der zweite Extrempunkt gespiegelt und liefert keine neue Bedingung.", "Axis symmetry: even powers only, $f(x) = ax^4 + bx^2 + c$ – three unknowns. Because of symmetry the second extremum is mirrored and gives no new condition.");
  } else {
    const p = z(-3, 3), k = wahl([-2, -1, 1, 2]), v = z(-4, 4);
    P = [[k, 2], [-2 * k * p, 1], [k * p * p + v, 0]].filter(([x]) => x !== 0);
    const x1 = p + wahl([-2, -1, 1, 2]);
    stellen = [E.extrem(P, p), E.punkt(P, x1)];
    if (/Hochpunkt|Tiefpunkt|maximum|minimum/.test(stellen[0].t)) stellen[0].t = stellen[0].t.replace(/einen (Hoch|Tief)punkt in [HT]/, "den Scheitelpunkt S").replace(/a (maximum|minimum) at [HT]/, "its vertex at S");
    ansatzPhrase = zw("Eine Parabel", "A parabola");
    falsche = [["p3", zw("Eine Parabel ist quadratisch – höchste Hochzahl 2.", "A parabola is quadratic – highest power 2.")], ["p4g", zw("Eine Parabel ist quadratisch.", "A parabola is quadratic.")]];
    warum = zw("Parabel: $f(x) = ax^2 + bx + c$ – drei Unbekannte, drei Bedingungen. Der Scheitel ist ein Extrempunkt: $f$ und $f'$.", "Parabola: $f(x) = ax^2 + bx + c$ – three unknowns, three conditions. The vertex is an extremum: $f$ and $f'$.");
  }
  const A = ANSAETZE[art];
  const ansatz = {
    t: ansatzPhrase, frage: zw("Welcher Ansatz passt?", "Which general form fits?"),
    optionen: [{ id: art, tex: A.tex, richtig: true }, ...falsche.map(([id, rueck]) => ({ id, tex: ANSAETZE[id].tex, richtig: false, rueck }))],
    zeile: A.tex, warum, unbekannte: A.koeff.map(([v]) => v),
  };
  /* Text: „<Ansatz> hat A und B, geht durch C. <Satz D>.“ – Reihenfolge der Stellen = Lesereihenfolge */
  stellen = [...stellen.filter((s) => s.form !== "satz"), ...stellen.filter((s) => s.form === "satz")];
  const teile = [{ a: true }];
  const lauf = stellen.filter((s) => s.form !== "satz");
  const mitVerb = /\bist\b|\bis\b/.test(ansatzPhrase);
  lauf.forEach((s, j) => {
    const vor = j === 0 ? (mitVerb ? zw(" und ", " and ") : " ") : j === lauf.length - 1 ? zw(" und ", " and ") : ", ";
    const hat = s.form === "nomen" && !(j > 0 && lauf[j - 1].form === "nomen") ? zw("hat ", "has ") : "";
    teile.push(vor + hat, { s: j });
  });
  teile.push(".");
  stellen.forEach((s, i) => { if (s.form === "satz") teile.push(" ", { s: i }, "."); });
  return fertig("steckbrief", zw("Steckbrief", "Reconstruction"), teile, stellen, {
    funktionen: ["f"], eval: polyAnsatz(A.koeff), ansatz,
    einsetzen: einsetzenZeilen(A.koeff, stellen), frage: zw("Bestimme die Funktionsgleichung – hier zuerst nur: Welche Bedingungen stecken im Text?", "Find the equation – here first just: which conditions are in the text?"),
  });
}

/* ======================================================================
   7 · ANALYSIS IM SACHKONTEXT (Klasse 11–13)
   ====================================================================== */
function anwendung() {
  const v = z(1, 4);
  if (v === 1) {   // Pflanze
    const h0 = z(2, 8), t1 = z(6, 12), H = z(25, 60), t2 = z(2, t1 - 2), t3 = z(1, t1 - 1), g = z(2, 9);
    const pool = [
      st(zw(`Zu Beginn ist die Pflanze ${h0} cm hoch`, `At the start the plant is ${h0} cm tall`), [`h(0) = ${h0}`], [{ c: `h(${h0}) = 0`, text: zw("Zu Beginn heißt t = 0.", "At the start means t = 0.") }, { c: `h'(0) = ${h0}`, text: zw("Die Höhe ist ein Funktionswert, keine Änderungsrate.", "The height is a function value, not a rate.") }], zw(`Beginn = Zeitpunkt t = 0: $h(0) = ${h0}$.`, `Start = time t = 0: $h(0) = ${h0}$.`), zw("Anfangswert", "start value")),
      st(zw(`Nach ${t1} Wochen erreicht sie ihre maximale Höhe von ${H} cm`, `After ${t1} weeks it reaches its maximum height of ${H} cm`), [`h(${t1}) = ${H}`, `h'(${t1}) = 0`], [{ c: `h'(${t1}) = ${H}`, text: zw("Die maximale Höhe ist ein Funktionswert. Die Ableitung ist dort 0.", "The maximum height is a function value. The derivative there is 0.") }, { c: `h''(${t1}) = 0`, text: zw("Maximum: $h' = 0$.", "Maximum: $h' = 0$.") }], zw("Hochpunkt im Sachkontext: Wert und waagrechte Tangente.", "Maximum in context: value and horizontal tangent."), zw("Hochpunkt", "maximum")),
      st(zw(`Nach ${t2} Wochen wächst sie am schnellsten`, `After ${t2} weeks it grows fastest`), [`h''(${t2}) = 0`], [{ c: `h'(${t2}) = 0`, text: zw(`$h'(${t2}) = 0$ hieße: Sie wächst gar nicht. „Am schnellsten“ heißt: $h'$ ist maximal, also $h''(${t2}) = 0$.`, `$h'(${t2}) = 0$ would mean it does not grow at all. “Fastest” means $h'$ is maximal, so $h''(${t2}) = 0$.`) }], zw("Wachstumsgeschwindigkeit = $h'$. Sie ist maximal, wo ihre Ableitung null ist: Wendestelle von h.", "Growth rate = $h'$. It is maximal where its derivative is zero: inflection point of h."), zw("Wendestelle", "inflection point")),
      st(zw(`Nach ${t3} Wochen wächst sie um ${g} cm pro Woche`, `After ${t3} weeks it grows by ${g} cm per week`), [`h'(${t3}) = ${g}`], [{ c: `h(${t3}) = ${g}`, text: zw("„cm pro Woche“ ist eine Änderungsrate: Ableitung.", "“cm per week” is a rate: derivative.") }], zw("Einheit „pro Woche“ verrät die Änderungsrate: $h'$.", "The unit “per week” reveals the rate: $h'$."), zw("Änderungsrate", "rate of change")),
    ];
    const wahl3 = mische([0, 1, 2, 3]).slice(0, 3).sort();
    const st3 = wahl3.map((i) => pool[i]);
    const teile = [zw("Die Höhe einer Pflanze wird durch h(t) beschrieben (t in Wochen, h in cm). ", "The height of a plant is h(t) (t in weeks, h in cm). ")];
    st3.forEach((s, i) => { teile.push({ s: i }, ". "); });
    return fertig("anwendung", zw("Wachstum einer Pflanze", "Plant growth"), teile, st3, { funktionen: ["h"], variablen: [["h(t)", zw("Höhe in cm nach t Wochen", "height in cm after t weeks")]] });
  }
  if (v === 2) {   // Temperatur
    const tw = z(13, 16), t8 = z(6, 9), T8 = z(8, 16), ts = z(17, 21), r = z(1, 3), a = z(6, 9), b = a + z(8, 12), M = z(12, 22);
    const pool = [
      st(zw(`Um ${tw} Uhr ist es am wärmsten`, `At ${tw}:00 it is warmest`), [`T'(${tw}) = 0`], [{ c: `T(${tw}) = 0`, text: zw("Am wärmsten heißt Maximum: Die Änderungsrate ist 0, nicht die Temperatur.", "Warmest means maximum: the rate of change is 0, not the temperature.") }, { c: `T''(${tw}) = 0`, text: zw("Maximum: $T' = 0$.", "Maximum: $T' = 0$.") }], zw(`Maximum ohne gegebenen Wert: nur $T'(${tw}) = 0$.`, `Maximum without a given value: only $T'(${tw}) = 0$.`), zw("Extremstelle", "extremum")),
      st(zw(`Um ${t8} Uhr beträgt die Temperatur ${T8} °C`, `At ${t8}:00 the temperature is ${T8} °C`), [`T(${t8}) = ${T8}`], [{ c: `T(${T8}) = ${t8}`, text: zw("Erst die Zeit, dann der Wert.", "Time first, then value.") }, { c: `T'(${t8}) = ${T8}`, text: zw("Eine Temperatur ist ein Funktionswert, keine Änderungsrate.", "A temperature is a function value, not a rate.") }], zw(`Funktionswert: $T(${t8}) = ${T8}$.`, `Function value: $T(${t8}) = ${T8}$.`), zw("Funktionswert", "function value")),
      st(zw(`Um ${ts} Uhr sinkt die Temperatur um ${r} °C pro Stunde`, `At ${ts}:00 the temperature falls by ${r} °C per hour`), [`T'(${ts}) = -${r}`], [{ c: `T'(${ts}) = ${r}`, text: zw("„Sinkt“: Die Änderungsrate ist negativ.", "“Falls”: the rate is negative.") }, { c: `T(${ts}) = -${r}`, text: zw("„Pro Stunde“ verrät eine Änderungsrate: $T'$.", "“Per hour” reveals a rate: $T'$.") }], zw(`Sinken = negative Änderungsrate: $T'(${ts}) = −${r}$.`, `Falling = negative rate: $T'(${ts}) = −${r}$.`), zw("negative Änderungsrate", "negative rate")),
      st(zw(`Die Durchschnittstemperatur zwischen ${a} und ${b} Uhr beträgt ${M} °C`, `The mean temperature between ${a}:00 and ${b}:00 is ${M} °C`), [], [
        { tex: `\\int_{${a}}^{${b}} T(t)\\,dt = ${M}`, text: zw(`Ohne $\\frac{1}{${b - a}}$ ist das die Summe über die Zeit, nicht der Durchschnitt.`, `Without $\\frac{1}{${b - a}}$ this is the sum over time, not the mean.`) },
        { tex: `\\frac{T(${b}) − T(${a})}{${b - a}} = ${M}`, text: zw("Das ist die mittlere Änderungsrate, nicht der Mittelwert der Temperatur.", "That is the average rate of change, not the mean temperature.") },
        { tex: `T(${(a + b) / 2}) = ${M}`, text: zw("Der Wert in der Mitte ist im Allgemeinen nicht der Durchschnitt.", "The value in the middle is not the mean in general.") }],
      zw(`Mittelwert einer Funktion: $\\frac{1}{b − a}\\int_a^b T(t)\\,dt$ – hier mit $b − a = ${b - a}$.`, `Mean value of a function: $\\frac{1}{b − a}\\int_a^b T(t)\\,dt$ – here $b − a = ${b - a}$.`), zw("Mittelwert über ein Intervall", "mean over an interval"),
      { tippbar: false, zielTex: [`\\frac{1}{${b - a}}\\int_{${a}}^{${b}} T(t)\\,dt = ${M}`] }),
    ];
    const idx = mische([0, 1, 2, 3]).slice(0, 3).sort();
    const st3 = idx.map((i) => pool[i]);
    const teile = [zw("T(t) beschreibt die Temperatur an einem Sommertag (t in Stunden nach Mitternacht, T in °C). ", "T(t) describes the temperature on a summer day (t in hours after midnight, T in °C). ")];
    st3.forEach((s, i) => teile.push({ s: i }, ". "));
    return fertig("anwendung", zw("Temperatur", "Temperature"), teile, st3, { funktionen: ["T"], variablen: [["T(t)", zw("Temperatur in °C", "temperature in °C")]] });
  }
  if (v === 3) {   // Becken
    const V0 = wahl([200, 300, 500]), T = z(5, 9), t4 = z(2, 5), M = wahl([60, 80, 120, 150]), tm = z(1, 4);
    const pool = [
      st(zw(`Zu Beginn befinden sich ${V0} m³ Wasser im Becken`, `At the start the pool holds ${V0} m³ of water`), [`V(0) = ${V0}`], [{ c: `r(0) = ${V0}`, text: zw("Die Wassermenge ist V, nicht die Zuflussrate r.", "The amount is V, not the inflow rate r.") }], zw(`Bestand zu Beginn: $V(0) = ${V0}$.`, `Amount at the start: $V(0) = ${V0}$.`), zw("Anfangsbestand", "initial amount")),
      st(zw(`Nach ${T} Stunden ist wieder genauso viel Wasser im Becken wie zu Beginn`, `After ${T} hours there is as much water as at the start`), [`V(${T}) = V(0)`], [{ c: `V(${T}) = 0`, text: zw("„Genauso viel wie zu Beginn“ – nicht leer.", "“As much as at the start” – not empty.") }, { c: `r(${T}) = 0`, text: zw("Gleicher Bestand heißt nicht, dass gerade nichts zufließt.", "The same amount does not mean nothing is flowing in.") }], zw(`Bestand später = Bestand zu Beginn: $V(${T}) = V(0)$ (gleichwertig: $\\int_0^{${T}} r(t)\\,dt = 0$).`, `Later amount = start amount: $V(${T}) = V(0)$.`), zw("gleicher Bestand", "same amount")),
      st(zw(`In den ersten ${t4} Stunden fließen insgesamt ${M} m³ zu`, `In the first ${t4} hours a total of ${M} m³ flows in`), [], [
        { tex: `r(${t4}) = ${M}`, text: zw(`$r(${t4})$ ist die Rate im Zeitpunkt ${t4} – eine Menge über eine Zeitspanne ist ein Integral.`, `$r(${t4})$ is the rate at time ${t4} – an amount over a period is an integral.`) },
        { tex: `\\int_{0}^{${t4}} r(t)\\,dt = ${M} \\cdot ${t4}`, text: zw("Das Integral ist schon die Menge – nicht noch mal mit der Zeit multiplizieren.", "The integral already is the amount – don't multiply by time again.") },
        { tex: `r'(${t4}) = ${M}`, text: zw("Die Ableitung der Rate ist hier nicht gefragt.", "The derivative of the rate is not asked for.") }],
      zw("Rate über die Zeit aufsummiert = Integral: Zuflussmenge = $\\int r(t)\\,dt$.", "Rate summed over time = integral: amount = $\\int r(t)\\,dt$."), zw("Gesamtmenge aus der Rate", "total from the rate"),
      { tippbar: false, zielTex: [`\\int_{0}^{${t4}} r(t)\\,dt = ${M}`] }),
      st(zw(`Die Zuflussrate ist nach ${tm} Stunden am größten`, `The inflow rate is greatest after ${tm} hours`), [`r'(${tm}) = 0`], [{ c: `r(${tm}) = 0`, text: zw("Am größten: Die Ableitung der Rate ist 0, nicht die Rate selbst.", "Greatest: the derivative of the rate is 0, not the rate itself.") }, { c: `V'(${tm}) = 0`, text: zw("$V' = r$ – damit hieße das: gerade kein Zufluss.", "$V' = r$ – that would mean no inflow at that moment.") }], zw(`Maximum der Rate: $r'(${tm}) = 0$ (Wendestelle von V).`, `Maximum of the rate: $r'(${tm}) = 0$ (inflection point of V).`), zw("Extremstelle der Rate", "extremum of the rate")),
    ];
    const idx = mische([0, 1, 2, 3]).slice(0, 3).sort();
    const st3 = idx.map((i) => pool[i]);
    const teile = [zw("Ein Becken wird befüllt. r(t) ist die Zuflussrate (m³ pro Stunde), V(t) die Wassermenge im Becken (m³), t in Stunden. ", "A pool is filled. r(t) is the inflow rate (m³ per hour), V(t) the amount of water (m³), t in hours. ")];
    st3.forEach((s, i) => teile.push({ s: i }, ". "));
    return fertig("anwendung", zw("Zufluss und Bestand", "Inflow and amount"), teile, st3, { funktionen: ["r", "V"], variablen: [["r(t)", zw("Zuflussrate", "inflow rate")], ["V(t)", zw("Wassermenge", "amount of water")]] });
  }
  /* v === 4: Bestand B(t) */
  const a = z(0, 3), b = a + wahl([2, 4, 5]), dur = z(10, 40), t2 = z(1, 6), w = z(20, 80), B0 = wahl([120, 250, 400]);
  const pool = [
    st(zw(`Zwischen t = ${a} und t = ${b} nimmt der Bestand durchschnittlich um ${dur} Tiere pro Jahr zu`, `Between t = ${a} and t = ${b} the population grows on average by ${dur} animals per year`), [{ c: `(B(${b}) - B(${a}))/${b - a} = ${dur}`, alt: [`B(${b}) - B(${a}) = ${dur * (b - a)}`] }],
      [{ c: `B'(${(a + b) / 2}) = ${dur}`, text: zw("Das ist die momentane Rate in der Mitte – gefragt ist der Durchschnitt über das Intervall.", "That is the instantaneous rate in the middle – the average over the interval is asked for.") },
        { c: `(B(${b}) - B(${a}))/${b} = ${dur}`, text: zw(`Das Intervall ist ${b} − ${a} = ${b - a} Jahre lang.`, `The interval is ${b} − ${a} = ${b - a} years long.`) }],
      zw(`„Durchschnittlich pro Jahr“ = mittlere Änderungsrate: Differenzenquotient $\\frac{B(${b}) − B(${a})}{${b - a}}$.`, `“On average per year” = average rate of change: $\\frac{B(${b}) − B(${a})}{${b - a}}$.`), zw("mittlere Änderungsrate", "average rate of change")),
    st(zw(`Im Zeitpunkt t = ${t2} wächst der Bestand momentan um ${w} Tiere pro Jahr`, `At time t = ${t2} the population is growing at ${w} animals per year`), [`B'(${t2}) = ${w}`],
      [{ c: `B(${t2}) = ${w}`, text: zw("„Pro Jahr“ ist eine Rate: Ableitung.", "“Per year” is a rate: derivative.") }, { c: `(B(${t2 + 1}) - B(${t2}))/1 = ${w}`, text: zw("„Momentan“ heißt lokale Änderungsrate, nicht über ein ganzes Jahr gemittelt.", "“Instantaneous” means the local rate, not averaged over a year.") }],
      zw(`„Momentan“ = lokale Änderungsrate: $B'(${t2}) = ${w}$.`, `“Instantaneous” = local rate: $B'(${t2}) = ${w}$.`), zw("momentane Änderungsrate", "instantaneous rate")),
    st(zw(`Zu Beginn der Beobachtung (t = 0) leben ${B0} Tiere im Gebiet`, `At the start (t = 0) there are ${B0} animals`), [`B(0) = ${B0}`], [{ c: `B'(0) = ${B0}`, text: zw("Ein Bestand ist ein Funktionswert.", "A population is a function value.") }], zw(`Anfangsbestand: $B(0) = ${B0}$.`, `Initial population: $B(0) = ${B0}$.`), zw("Anfangsbestand", "initial population")),
  ];
  const teile = [zw("B(t) beschreibt den Bestand einer Tierpopulation (t in Jahren). ", "B(t) describes an animal population (t in years). ")];
  pool.forEach((s, i) => teile.push({ s: i }, ". "));
  return fertig("anwendung", zw("Bestand und Änderungsrate", "Population and rate of change"), teile, pool, { funktionen: ["B"], variablen: [["B(t)", zw("Anzahl der Tiere", "number of animals")]] });
}

/* ======================================================================
   8 · VEKTOREN (Klasse 11–13, nur Auswahl)
   ====================================================================== */
const V = (n) => `\\vec{${n}}`;
const VEK_POOL = () => [
  st(zw("Der Punkt P liegt auf der Geraden g", "The point P lies on the line g"), [], [
    { tex: `${V("p")} \\cdot ${V("u")} = 0`, text: zw("Skalarprodukt 0 heißt senkrecht – mit „liegt auf“ hat das nichts zu tun.", "Dot product 0 means perpendicular – nothing to do with “lies on”.") },
    { tex: `${V("p")} = ${V("a")} + ${V("u")}`, text: zw("Das ist nur ein einziger Punkt der Geraden (r = 1).", "That is only one point of the line (r = 1).") }],
  zw("Liegt P auf g, gibt es einen Parameter r, der P liefert: Punktprobe.", "If P lies on g, some parameter r produces P: point test."), zw("Punktprobe", "point test"), { tippbar: false, zielTex: [`${V("p")} = ${V("a")} + r \\cdot ${V("u")} \\text{ für ein } r \\in ℝ`] }),
  st(zw("Die Geraden g und h sind parallel", "The lines g and h are parallel"), [], [
    { tex: `${V("u")} \\cdot ${V("v")} = 0`, text: zw("Skalarprodukt 0 heißt orthogonal, nicht parallel.", "Dot product 0 means orthogonal, not parallel.") },
    { tex: `${V("u")} = ${V("v")}`, text: zw("Die Richtungsvektoren müssen nicht gleich sein – Vielfache genügen.", "Direction vectors need not be equal – multiples suffice.") }],
  zw("Parallel: Richtungsvektoren sind Vielfache voneinander (und kein gemeinsamer Punkt, sonst identisch).", "Parallel: direction vectors are multiples of each other."), zw("Richtungsvektoren Vielfache", "direction vectors are multiples"), { tippbar: false, zielTex: [`${V("u")} = k \\cdot ${V("v")}`] }),
  st(zw("Die Geraden g und h stehen senkrecht aufeinander", "The lines g and h are perpendicular"), [], [
    { tex: `${V("u")} = k \\cdot ${V("v")}`, text: zw("Vielfache Richtungsvektoren heißt parallel.", "Multiple direction vectors means parallel.") },
    { tex: `${V("u")} \\cdot ${V("v")} = 1`, text: zw("Senkrecht heißt Skalarprodukt 0, nicht 1.", "Perpendicular means dot product 0, not 1.") }],
  zw("Senkrecht: Skalarprodukt der Richtungsvektoren ist 0.", "Perpendicular: the dot product of the direction vectors is 0."), zw("Skalarprodukt 0", "dot product 0"), { tippbar: false, zielTex: [`${V("u")} \\cdot ${V("v")} = 0`] }),
  st(zw("Die Gerade g verläuft parallel zur Ebene E", "The line g is parallel to the plane E"), [], [
    { tex: `${V("u")} = k \\cdot ${V("n")}`, text: zw("Das hieße: g steht senkrecht auf E.", "That would mean g is perpendicular to E.") }],
  zw("Parallel zur Ebene: Der Richtungsvektor steht senkrecht auf dem Normalenvektor.", "Parallel to the plane: the direction vector is perpendicular to the normal vector."), zw("u senkrecht zu n", "u perpendicular to n"), { tippbar: false, zielTex: [`${V("u")} \\cdot ${V("n")} = 0`] }),
  st(zw("Die Gerade g steht senkrecht auf der Ebene E", "The line g is perpendicular to the plane E"), [], [
    { tex: `${V("u")} \\cdot ${V("n")} = 0`, text: zw("Das hieße: g ist parallel zu E.", "That would mean g is parallel to E.") }],
  zw("Senkrecht auf E: Richtungsvektor und Normalenvektor sind Vielfache.", "Perpendicular to E: direction vector and normal vector are multiples."), zw("u parallel zu n", "u parallel to n"), { tippbar: false, zielTex: [`${V("u")} = k \\cdot ${V("n")}`] }),
  st(zw("Das Dreieck ABC ist bei B rechtwinklig", "Triangle ABC has a right angle at B"), [], [
    { tex: `${V("AB")} \\cdot ${V("AC")} = 0`, text: zw("Das wäre der rechte Winkel bei A.", "That would be the right angle at A.") },
    { tex: `|${V("BA")}| = |${V("BC")}|`, text: zw("Gleich lange Seiten – das ist gleichschenklig.", "Equal sides – that is isosceles.") }],
  zw("Rechter Winkel bei B: die beiden Seiten, die von B ausgehen, sind orthogonal.", "Right angle at B: the two sides starting at B are orthogonal."), zw("Seiten an B orthogonal", "sides at B orthogonal"), { tippbar: false, zielTex: [`${V("BA")} \\cdot ${V("BC")} = 0`] }),
  st(zw("Das Dreieck ABC ist gleichschenklig mit der Basis AB", "Triangle ABC is isosceles with base AB"), [], [
    { tex: `|${V("AB")}| = |${V("AC")}|`, text: zw("Die Basis ist die dritte Seite – gleich lang sind die beiden Schenkel an C.", "The base is the third side – the two legs at C are equal.") }],
  zw("Basis AB: Die Schenkel AC und BC sind gleich lang.", "Base AB: legs AC and BC are equal."), zw("Schenkel gleich lang", "legs equal"), { tippbar: false, zielTex: [`|${V("CA")}| = |${V("CB")}|`] }),
  st(zw("Das Viereck ABCD ist ein Parallelogramm", "ABCD is a parallelogram"), [], [
    { tex: `${V("AB")} = ${V("CD")}`, text: zw(`${V("CD")} zeigt in die Gegenrichtung – richtig ist ${V("DC")}.`, `${V("CD")} points the other way – it should be ${V("DC")}.`) }],
  zw("Parallelogramm: gegenüberliegende Seiten sind gleich lang und gleich gerichtet – beim Umlauf A→B und D→C.", "Parallelogram: opposite sides are equal and point the same way – A→B and D→C."), zw("gleiche Verschiebung", "same translation"), { tippbar: false, zielTex: [`${V("AB")} = ${V("DC")}`] }),
  st(zw("M ist der Mittelpunkt der Strecke AB", "M is the midpoint of AB"), [], [
    { tex: `${V("m")} = \\frac{1}{2}(${V("b")} − ${V("a")})`, text: zw(`Das ist der halbe Verbindungsvektor – vom Ursprung aus fehlt ${V("a")}.`, `That is half the connecting vector – ${V("a")} is missing.`) }],
  zw("Mittelpunkt: Mittelwert der Ortsvektoren.", "Midpoint: mean of the position vectors."), zw("Mittelwert der Ortsvektoren", "mean of position vectors"), { tippbar: false, zielTex: [`${V("m")} = \\frac{1}{2}(${V("a")} + ${V("b")})`] }),
  st(zw("Der Punkt P hat von der Ebene E den Abstand 3", "The point P is at distance 3 from the plane E"), [], [
    { tex: `${V("n")} \\cdot (${V("p")} − ${V("a")}) = 3`, text: zw("Ohne Betrag und ohne Division durch $|\\vec{n}|$ ist das kein Abstand.", "Without absolute value and division by $|\\vec{n}|$ this is not a distance.") },
    { tex: `|${V("p")} − ${V("a")}| = 3`, text: zw("Das ist der Abstand zum Aufpunkt A, nicht zur Ebene.", "That is the distance to point A, not to the plane.") }],
  zw("Abstand Punkt–Ebene mit der Hesseschen Normalform.", "Point–plane distance with the Hesse normal form."), zw("Abstand zur Ebene", "distance to the plane"), { tippbar: false, zielTex: [`\\frac{|${V("n")} \\cdot (${V("p")} − ${V("a")})|}{|${V("n")}|} = 3`] }),
];
function vektoren() {
  const pool = mische(VEK_POOL()).slice(0, 3);
  const teile = [zw("Gegeben sind Punkte A, B, C, D und P, die Geraden g: $\\vec{x} = \\vec{a} + r \\cdot \\vec{u}$ und h: $\\vec{x} = \\vec{b} + s \\cdot \\vec{v}$ sowie die Ebene E mit Normalenvektor $\\vec{n}$ durch A. ", "Given points A, B, C, D and P, lines g: $\\vec{x} = \\vec{a} + r \\cdot \\vec{u}$ and h: $\\vec{x} = \\vec{b} + s \\cdot \\vec{v}$, and plane E through A with normal $\\vec{n}$. ")];
  pool.forEach((s, i) => teile.push({ s: i }, ". "));
  return fertig("vektoren", zw("Lagebeziehungen", "Positions"), teile, pool, { funktionen: [] });
}

/* ======================================================================
   Erzeugen und Hilfen für die Oberfläche
   ====================================================================== */
const GEN = { woerter, gleichung, lgs, funktion, stochastik, steckbrief, anwendung, vektoren };
export function neueTextaufgabe(thema) {
  const id = thema && GEN[thema] ? thema : wahl(THEMA_IDS);
  return GEN[id]();
}

/* Auswahl-Optionen einer Textstelle (Mehrfachauswahl), stabil gemischt nach Aufgaben-id */
export function stellenOptionen(stelle, seed = 0) {
  const richtig = stelle.zielTex
    ? stelle.zielTex.map((tex, i) => ({ id: `r${i}`, tex, richtig: true }))
    : stelle.ziel.map((zz, i) => ({ id: `r${i}`, c: zz.c, richtig: true }));
  const falsch = stelle.falsch.slice(0, 3).map((f, i) => ({ id: `f${i}`, c: f.c, tex: f.tex, richtig: false, text: f.text }));
  const alle = [...richtig, ...falsch];
  const k = Math.abs(seed * 7 + alle.length) % alle.length;
  return [...alle.slice(k), ...alle.slice(0, k)];
}

/* Auswahl prüfen: gewählte ids → { ok, fehlend, zuviel: [{ text }] } */
export function pruefeAuswahl(optionen, gewaehlt) {
  const g = new Set(gewaehlt);
  const fehlend = optionen.filter((o) => o.richtig && !g.has(o.id)).length;
  const zuviel = optionen.filter((o) => !o.richtig && g.has(o.id));
  return { ok: fehlend === 0 && zuviel.length === 0, fehlend, zuviel };
}

/* Alle Bedingungen einer Aufgabe (für Stufe 3 und die Zusammenfassung) */
export const alleZiele = (a) => a.stellen.flatMap((s, i) => s.ziel.map((zz) => ({ ...zz, stelle: i })));
export const anzahlBedingungen = (a) => a.stellen.reduce((s, x) => s + (x.zielTex ? x.zielTex.length : x.ziel.length), 0);
export const alleTippbar = (a) => a.stellen.every((s) => s.tippbar);

/* Schnelltasten fürs Tippen je Thema */
export function schnelltasten(a) {
  if (a.thema === "stochastik") return ["P(X", "≤", "≥", "=", "<", ">", ")", ";"];
  if (a.thema === "woerter" || a.thema === "gleichung") return ["x", "(", ")", "/", "²", "=", ";"];
  if (a.thema === "lgs") return ["x", "y", "(", ")", "=", ";"];
  const f = (a.funktionen && a.funktionen[0]) || "f";
  return [`${f}(`, `${f}′(`, `${f}″(`, ")", "=", ";", "−"];
}

/* ======================================================================
   ÜBERSETZUNGS-WÖRTERBUCH (Verstehen)
   ====================================================================== */
export const WB_GRUPPEN = [
  { id: "rechnen", name: ["Rechenwörter", "Maths words"] },
  { id: "sach", name: ["Sachaufgaben", "Word problems"] },
  { id: "funktion", name: ["Funktionen", "Functions"] },
  { id: "steckbrief", name: ["Steckbrief", "Reconstruction"] },
  { id: "sachkontext", name: ["Änderung und Bestand", "Change and amount"] },
  { id: "stochastik", name: ["Stochastik", "Probability"] },
  { id: "vektoren", name: ["Vektoren", "Vectors"] },
];
export function woerterbuch() {
  const e = (gruppe, de, en, tex, wde, wen) => ({ gruppe, phrase: zw(de, en), tex, warum: zw(wde, wen) });
  return [
    e("rechnen", "die Summe aus a und b", "the sum of a and b", "a + b", "Summe = Ergebnis einer Addition.", "Sum = result of an addition."),
    e("rechnen", "die Differenz aus a und b", "the difference of a and b", "a − b", "Reihenfolge wie im Satz: a zuerst.", "Order as in the sentence: a first."),
    e("rechnen", "das Produkt aus a und b", "the product of a and b", "a \\cdot b", "Produkt = Ergebnis einer Multiplikation.", "Product = result of a multiplication."),
    e("rechnen", "der Quotient aus a und b", "the quotient of a and b", "\\frac{a}{b}", "Das Erste steht oben.", "The first one goes on top."),
    e("rechnen", "das Dreifache einer Zahl", "three times a number", "3x", "„-fache“ heißt mal.", "“times” means multiply."),
    e("rechnen", "das Doppelte der Summe aus x und 3", "double the sum of x and 3", "2(x + 3)", "Vervielfacht wird die ganze Summe: Klammer.", "The whole sum is doubled: brackets."),
    e("rechnen", "A ist um 5 größer als B", "A is 5 more than B", "A = B + 5", "Erst wenn die kleinere Seite 5 dazubekommt, sind beide gleich.", "Only when the smaller side gets 5 more are they equal."),
    e("rechnen", "A ist um 5 kleiner als B", "A is 5 less than B", "A = B − 5", "Von der größeren Seite 5 abziehen.", "Subtract 5 from the larger side."),
    e("rechnen", "der Nachfolger / Vorgänger von x", "the successor / predecessor of x", "x + 1 \\;/\\; x − 1", "Die nächste bzw. vorige ganze Zahl.", "The next / previous whole number."),
    e("rechnen", "ergibt, erhält man, ist", "gives, you get, is", "=", "Das Gleichheitszeichen.", "The equals sign."),
    e("sach", "A ist dreimal so alt wie B", "A is three times as old as B", "A = 3B", "Probe mit Zahlen: B = 10 → A = 30.", "Check with numbers: B = 10 → A = 30."),
    e("sach", "in 5 Jahren", "in 5 years", "x + 5", "Jedes Alter wird um 5 größer.", "Every age increases by 5."),
    e("sach", "20 % mehr als x", "20 % more than x", "1{,}2 \\cdot x", "Grundwert x plus 20 % davon.", "Base x plus 20 % of it."),
    e("sach", "nach 20 % Rabatt", "after 20 % discount", "0{,}8 \\cdot x", "Es bleiben 80 %.", "80 % remain."),
    e("sach", "9 ct pro Minute", "9 cents per minute", "0{,}09 \\cdot x", "Pro = mal Anzahl; Einheit vereinheitlichen.", "Per = times the count; use one unit."),
    e("sach", "Umfang eines Rechtecks", "perimeter of a rectangle", "2a + 2b", "Jede Seite kommt zweimal vor.", "Each side appears twice."),
    e("sach", "holt ein, treffen sich", "catches up, meet", "s_1 = s_2", "Gleicher Ort = gleicher Weg vom Start.", "Same place = same distance from the start."),
    e("sach", "zweistellige Zahl mit Ziffern x und y", "two-digit number with digits x and y", "10x + y", "Stellenwert: Zehner zählt zehnfach.", "Place value: tens count ten times."),
    e("funktion", "P(2|5) liegt auf dem Graphen", "P(2|5) lies on the graph", "f(2) = 5", "Erst x, dann y.", "x first, then y."),
    e("funktion", "schneidet die y-Achse bei 3", "crosses the y-axis at 3", "f(0) = 3", "Auf der y-Achse ist x = 0.", "On the y-axis x = 0."),
    e("funktion", "Nullstelle bei x = 4", "zero at x = 4", "f(4) = 0", "Funktionswert 0.", "Function value 0."),
    e("funktion", "parallel zu y = 2x + 1", "parallel to y = 2x + 1", "m = 2", "Gleiche Steigung.", "Same slope."),
    e("funktion", "senkrecht zu y = 2x + 1", "perpendicular to y = 2x + 1", "m = −\\frac{1}{2}", "$m_1 \\cdot m_2 = −1$.", "$m_1 \\cdot m_2 = −1$."),
    e("funktion", "Scheitelpunkt S(1|−3)", "vertex S(1|−3)", "f(x) = a(x − 1)^2 − 3", "Scheitelform: S(d|e) direkt einsetzen.", "Vertex form: insert S(d|e) directly."),
    e("funktion", "wächst jährlich um 5 %", "grows by 5 % per year", "b = 1{,}05", "Wachstumsfaktor 1 + p/100.", "Growth factor 1 + p/100."),
    e("funktion", "halbiert sich alle 8 Jahre", "halves every 8 years", "f(8) = 0{,}5 \\cdot f(0)", "Bezogen auf den Anfangswert.", "Relative to the start value."),
    e("steckbrief", "Hochpunkt / Tiefpunkt H(6|4)", "maximum / minimum H(6|4)", "f(6) = 4,\\; f′(6) = 0", "Punkt + waagrechte Tangente. $f''$ prüft nur.", "Point + horizontal tangent. $f''$ only checks."),
    e("steckbrief", "Extremum an der Stelle x = 2", "extremum at x = 2", "f′(2) = 0", "Nur die Stelle ist bekannt.", "Only the position is known."),
    e("steckbrief", "Wendepunkt W(1|3)", "inflection point W(1|3)", "f(1) = 3,\\; f″(1) = 0", "Punkt + Krümmungswechsel.", "Point + change of curvature."),
    e("steckbrief", "Sattelpunkt S(0|2)", "saddle point S(0|2)", "f(0) = 2,\\; f′(0) = 0,\\; f″(0) = 0", "Wendepunkt mit waagrechter Tangente.", "Inflection point with horizontal tangent."),
    e("steckbrief", "berührt die x-Achse bei x = 3", "touches the x-axis at x = 3", "f(3) = 0,\\; f′(3) = 0", "Doppelte Nullstelle.", "Double zero."),
    e("steckbrief", "Steigung 4 an der Stelle x = 1", "slope 4 at x = 1", "f′(1) = 4", "Steigung = Ableitung.", "Slope = derivative."),
    e("steckbrief", "Tangente y = 4x − 5 in P(2|f(2))", "tangent y = 4x − 5 at P(2|f(2))", "f(2) = 3,\\; f′(2) = 4", "Berührpunkt auf beiden + gleiche Steigung.", "Point on both + same slope."),
    e("steckbrief", "Wendetangente y = 2x + 1 bei x = 1", "inflectional tangent y = 2x + 1 at x = 1", "f(1) = 3,\\; f′(1) = 2,\\; f″(1) = 0", "Tangente + Wendepunkt: drei Bedingungen.", "Tangent + inflection point: three conditions."),
    e("steckbrief", "punktsymmetrisch zum Ursprung", "point-symmetric about the origin", "f(x) = ax^3 + bx", "Nur ungerade Hochzahlen.", "Odd powers only."),
    e("steckbrief", "achsensymmetrisch zur y-Achse", "symmetric about the y-axis", "f(x) = ax^4 + bx^2 + c", "Nur gerade Hochzahlen.", "Even powers only."),
    e("sachkontext", "wächst um 6 cm pro Woche", "grows by 6 cm per week", "h′(t) = 6", "„pro“ verrät die Änderungsrate.", "“per” reveals the rate."),
    e("sachkontext", "sinkt um 2 °C pro Stunde", "falls by 2 °C per hour", "T′(t) = −2", "Sinken = negative Rate.", "Falling = negative rate."),
    e("sachkontext", "wächst am schnellsten", "grows fastest", "h″(t) = 0", "Rate maximal → Wendestelle.", "Rate maximal → inflection point."),
    e("sachkontext", "durchschnittlich 30 pro Jahr zwischen 1 und 5", "on average 30 per year between 1 and 5", "\\frac{B(5) − B(1)}{4} = 30", "Mittlere Änderungsrate.", "Average rate of change."),
    e("sachkontext", "insgesamt 120 m³ zwischen 0 und 4 h", "a total of 120 m³ between 0 and 4 h", "\\int_0^4 r(t)\\,dt = 120", "Menge aus einer Rate = Integral.", "Amount from a rate = integral."),
    e("sachkontext", "Durchschnittstemperatur zwischen 6 und 18 Uhr", "mean temperature between 6 and 18 h", "\\frac{1}{12}\\int_6^{18} T(t)\\,dt", "Mittelwert einer Funktion.", "Mean value of a function."),
    e("stochastik", "genau 3", "exactly 3", "P(X = 3)", "Ein Wert.", "One value."),
    e("stochastik", "höchstens 3", "at most 3", "P(X \\leq 3)", "3 gehört dazu.", "3 is included."),
    e("stochastik", "mindestens 3", "at least 3", "P(X \\geq 3) = 1 − P(X \\leq 2)", "Gegenereignis: höchstens 2.", "Complement: at most 2."),
    e("stochastik", "mehr als 3", "more than 3", "P(X \\geq 4)", "3 gehört nicht dazu.", "3 is not included."),
    e("stochastik", "weniger als 3", "fewer than 3", "P(X \\leq 2)", "3 gehört nicht dazu.", "3 is not included."),
    e("stochastik", "mindestens einmal", "at least once", "1 − P(X = 0)", "Gegenereignis: keinmal.", "Complement: never."),
    e("stochastik", "mit mindestens 90 % Wahrscheinlichkeit", "with at least 90 % probability", "P(\\ldots) \\geq 0{,}9", "Ungleichung, Prozent als Dezimalzahl.", "Inequality, percent as decimal."),
    e("vektoren", "P liegt auf g", "P lies on g", "\\vec{p} = \\vec{a} + r \\cdot \\vec{u}", "Punktprobe.", "Point test."),
    e("vektoren", "g parallel zu h", "g parallel to h", "\\vec{u} = k \\cdot \\vec{v}", "Richtungsvektoren Vielfache.", "Direction vectors are multiples."),
    e("vektoren", "g senkrecht zu h", "g perpendicular to h", "\\vec{u} \\cdot \\vec{v} = 0", "Skalarprodukt 0.", "Dot product 0."),
    e("vektoren", "g parallel zu E", "g parallel to E", "\\vec{u} \\cdot \\vec{n} = 0", "u senkrecht zum Normalenvektor.", "u perpendicular to the normal."),
    e("vektoren", "g senkrecht zu E", "g perpendicular to E", "\\vec{u} = k \\cdot \\vec{n}", "u parallel zum Normalenvektor.", "u parallel to the normal."),
    e("vektoren", "rechtwinklig bei B", "right angle at B", "\\vec{BA} \\cdot \\vec{BC} = 0", "Die Seiten an B.", "The sides at B."),
    e("vektoren", "ABCD Parallelogramm", "ABCD parallelogram", "\\vec{AB} = \\vec{DC}", "Gleiche Verschiebung.", "Same translation."),
  ];
}

/* Beispiel für „Verstehen“: der Satz aus der Einleitung, Stelle für Stelle */
export function beispielSteckbrief() {
  return {
    teile: [{ a: true }, zw(" hat ", " has "), { s: 0 }, zw(" und ", " and "), { s: 1 }, "."],
    ansatz: { t: zw("Der Graph einer ganzrationalen Funktion dritten Grades", "The graph of a polynomial function of degree 3"), zeile: "f(x) = ax^3 + bx^2 + cx + d", warum: zw("Grad 3 → vier Unbekannte a, b, c, d → vier Bedingungen nötig.", "Degree 3 → four unknowns a, b, c, d → four conditions needed.") },
    stellen: [
      { t: zw("einen Hochpunkt in H(6|4)", "a maximum at H(6|4)"), tex: ["f(6) = 4", "f′(6) = 0"], warum: zw("Der Punkt liegt auf dem Graphen, und die Tangente ist dort waagrecht.", "The point lies on the graph, and the tangent is horizontal there.") },
      { t: zw("einen Wendepunkt in W(2|−4)", "an inflection point at W(2|−4)"), tex: ["f(2) = −4", "f″(2) = 0"], warum: zw("Der Punkt liegt auf dem Graphen, und die Krümmung wechselt dort.", "The point lies on the graph, and the curvature changes there.") },
    ],
  };
}
