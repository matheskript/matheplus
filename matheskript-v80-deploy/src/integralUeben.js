/* ============================================================
   Integraltrainer – Modus „Üben“ (ohne Oberfläche)
   Zwischen Auto (die App rechnet vor) und Lernen (der Schüler tippt jeden
   Schritt selbst) liegt Üben: Der Schüler geht denselben Rechenweg wie in
   Lernen, wählt aber je Schritt aus fertigen Antworten – eine richtige (das
   Soll des Kern-Schritts) und bis zu drei falsche, jede mit einem typischen
   Fehler GENAU dieses Schritts und einem kurzen Hinweis.

   uebenWeg(aufgabe, zufall) → je Term-/Zahl-/Zahlen-Schritt des Kerns ein
     Schritt { id, art, label, ueber, plusC, frage, richtig, optionen }
     (Form aus uebenKern.uebenSchritt: optionen[0] ist die richtige, dahinter
     bis zu drei falsche mit festen Zufallsrängen).
     Werte:  term   { text, tex }   text = Tastenfeld-Schreibweise (lies()-lesbar)
             zahl   { wert, tex }
             zahlen { werte, tex }
     Info-Schritte des Kerns sind keine Wahl – sie erscheinen in der Oberfläche
     wie in Lernen von selbst.

   Jede falsche Option ist mit GENAU der Prüfung des Kern-Schritts (schritt.pruefen,
   dieselbe wie in Lernen) als falsch bestätigt; ein „Fehler“, der zufällig
   gleichwertig ist (z. B. g − f statt f − g, ln ohne Betrag), fällt heraus.
   Reine Logik, testbar mit Node (tests/integralUeben.test.mjs).
   ============================================================ */
import { eng, exaktTex, naeherung } from "./integralKern.js";
import { STELLEN, auswerter, bruch, lies, polyKoef, stammfunktion, tex } from "./regelwerkKern.js";
import { ableitung } from "./formelEngine.js";
import { pTex, q } from "./rechnen2.js";
import { falscheOptionen, uebenSchritt } from "./uebenKern.js";

/* ---------- Baum-Bausteine ---------- */
const num = (v) => ({ k: "num", v });
const X = { k: "x" };
const add = (a, b) => ({ k: "+", a, b });
const sub = (a, b) => ({ k: "-", a, b });
const mul = (a, b) => ({ k: "*", a, b });
const div = (a, b) => ({ k: "/", a, b });
const pow = (a, b) => ({ k: "^", a, b });
const neg = (a) => ({ k: "neg", a });
const fn = (n, a) => ({ k: "fn", n, a });
const endlich = (v) => typeof v === "number" && Number.isFinite(v);
const rund = (c) => (Math.abs(c - Math.round(c)) < 1e-9 ? Math.round(c) : c);
const T = (n) => eng(tex(n));
const HOCH = { 2: "²", 3: "³", 4: "⁴", 5: "⁵" };

/* Zahl als Knoten: ganze Zahl, Bruch z/n oder (selten) Dezimalzahl */
function zahlKnoten(v) {
  const b = bruch(v, 1000);
  if (!b) return v < 0 ? neg(num(-v)) : num(v);
  const betrag = b.n === 1 ? num(Math.abs(b.z)) : div(num(Math.abs(b.z)), num(b.n));
  return b.z < 0 ? neg(betrag) : betrag;
}
/* Koeffizient · Kern ohne „1 ·“ und mit sauberem Minus */
function mitKoef(v, kern) {
  if (Math.abs(v - 1) < 1e-12) return kern;
  if (Math.abs(v + 1) < 1e-12) return neg(kern);
  const b = bruch(v, 1000);
  if (!b) return v < 0 ? neg(mul(num(-v), kern)) : mul(num(v), kern);
  const betrag = b.n === 1 ? num(Math.abs(b.z)) : div(num(Math.abs(b.z)), num(b.n));
  return b.z < 0 ? neg(mul(betrag, kern)) : mul(betrag, kern);
}
/* c / kern als Bruch: 2/x, −1/(3x²) */
function bruchTerm(c, kern) {
  const b = bruch(Math.abs(c), 1000) || { z: Math.abs(c), n: 1 };
  const t = div(num(b.z), b.n === 1 ? kern : mul(num(b.n), kern));
  return c < 0 ? neg(t) : t;
}
/* c · x^r in der Schreibweise des Kerns (x², 1/x², √x, x^(3/2)) */
function potenzTerm(c, r) {
  if (Math.abs(r) < 1e-12) return zahlKnoten(c);
  if (Math.abs(r - 1) < 1e-12) return mitKoef(c, X);
  if (Number.isInteger(r) && r > 1) return mitKoef(c, pow(X, num(r)));
  if (Number.isInteger(r) && r < 0) return bruchTerm(c, r === -1 ? X : pow(X, num(-r)));
  if (Math.abs(r - 0.5) < 1e-12) return mitKoef(c, fn("sqrt", X));
  return mitKoef(c, pow(X, zahlKnoten(r)));
}
/* Summe aus Teilen (Minus-Teile werden abgezogen) */
function summe(teile) {
  let erg = null;
  for (const t of teile) {
    if (!t || (t.k === "num" && t.v === 0)) continue;
    if (!erg) erg = t;
    else erg = t.k === "neg" ? sub(erg, t.a) : add(erg, t);
  }
  return erg || num(0);
}
const istZahl = (n) => !!n && (n.k === "num" || (n.k === "neg" && istZahl(n.a)) || (n.k === "/" && n.a.k === "num" && n.b.k === "num"));
const zahlWert = (n) => auswerter(n)(0);
/* Baum mit einer Zahl vervielfachen – in der Form, in der der Kern Stammfunktionen schreibt */
function skaliere(n, k) {
  if (Math.abs(k - 1) < 1e-12) return n;
  if (n.k === "neg") return skaliere(n.a, -k);
  if (k < 0) return neg(skaliere(n, -k));
  if (n.k === "*" && istZahl(n.a)) return mitKoef(zahlWert(n.a) * k, n.b);
  if (n.k === "/" && istZahl(n.a)) {
    const z = zahlWert(n.a);
    if (istZahl(n.b)) return zahlKnoten((z * k) / zahlWert(n.b));
    if (n.b.k === "*" && istZahl(n.b.a)) return bruchTerm((z * k) / zahlWert(n.b.a), n.b.b);
    return bruchTerm(z * k, n.b);
  }
  if (istZahl(n)) return zahlKnoten(zahlWert(n) * k);
  return mitKoef(k, n);
}
/* Vorzeichen eines Baums drehen */
const gedreht = (n) => (n.k === "neg" ? n.a : neg(n));

/* ---------- Baum → Tastenfeld-Schreibweise (von lies() lesbar) ---------- */
/* Rang: Summe 1, Produkt/Quotient 2, Potenz 4, Atom 5 */
export function eingabeText(n, aussen = 0, rechts = false) {
  if (!n) return "";
  const klam = (s, r) => (r < aussen || (rechts && r === aussen) ? `(${s})` : s);
  switch (n.k) {
    case "num": {
      if (n.v < 0) return klam(`-${eingabeText(num(-n.v))}`, 2);
      if (Number.isInteger(n.v)) return String(n.v);
      const b = bruch(n.v, 100000);
      return b ? klam(`${b.z}/${b.n}`, 2) : String(n.v);
    }
    case "x": return "x";
    case "var": return n.n;
    case "e": return "e";
    case "pi": return "pi";
    case "par": return `(${eingabeText(n.a)})`;
    case "neg": return klam(`-${eingabeText(n.a, 2, true)}`, 2);
    case "+": return klam(`${eingabeText(n.a, 1)}+${eingabeText(n.b, 1, true)}`, 1);
    case "-": return klam(`${eingabeText(n.a, 1)}-${eingabeText(n.b, 1, true)}`, 1);
    case "*": return klam(`${eingabeText(n.a, 2)}*${eingabeText(n.b, 2, true)}`, 2);
    case "/": return klam(`${eingabeText(n.a, 2)}/${eingabeText(n.b, 2, true)}`, 2);
    case "^": {
      const basis = ["x", "e", "pi"].includes(n.a.k) || (n.a.k === "num" && n.a.v >= 0 && Number.isInteger(n.a.v)) ? eingabeText(n.a) : `(${eingabeText(n.a)})`;
      const ex = n.b.k === "num" && n.b.v >= 0 && Number.isInteger(n.b.v) ? String(n.b.v) : `(${eingabeText(n.b)})`;
      return klam(`${basis}^${ex}`, 4);
    }
    case "fn": return `${n.n === "lnb" ? "ln" : n.n}(${eingabeText(n.a)})`;
    case "log": return `log(${eingabeText(n.a)})`;
    default: return "";
  }
}

/* ---------- Anzeige ---------- */
/* Polynome genau so wie der Kern (pTex), alles andere über die Formel-Engine */
function qPoly(koef) {
  const p = [];
  for (const c of koef) { const b = bruch(c, 5000); if (!b) return null; p.push(q(b.z, b.n)); }
  return p;
}
/* Koeffizienten, wenn der Baum schon eine Summe von Monomen ist (nichts wird ausmultipliziert: (2x − 1)⁴ bleibt stehen) */
function monomSumme(n) {
  const teile = [];
  const geh = (m, vz) => {
    if (m.k === "par") return geh(m.a, vz);
    if (m.k === "+") return geh(m.a, vz) && geh(m.b, vz);
    if (m.k === "-") return geh(m.a, vz) && geh(m.b, -vz);
    const p = potenzForm(m);
    if (!p || !Number.isInteger(p.r) || p.r < 0 || p.r > 9) return false;
    teile.push({ c: p.c * vz, r: p.r });
    return true;
  };
  if (!n || !geh(n, 1)) return null;
  const koef = [];
  for (const t of teile) koef[t.r] = (koef[t.r] || 0) + t.c;
  for (let i = 0; i < koef.length; i++) koef[i] = koef[i] || 0;
  return koef;
}
export function termTex(baum) {
  const k = monomSumme(baum);
  const p = k ? qPoly(k) : null;
  return p ? pTex(p) : T(baum);
}
/* Zahl als TeX: exakt (Bruch, e, π, ln 2 …), sonst gerundet – wie der Kern in antwortTex */
export function zahlTexFuer(v) {
  const e = exaktTex(v);
  if (e) return e;
  const b = bruch(v, 5000);
  return b ? pTex([q(b.z, b.n)]) : naeherung(v, 3);
}
/* Zahl als Eingabetext für zahlLesen: 7/3, −2, 0.3333 */
export function zahlText(v) {
  const b = bruch(v, 5000);
  return b ? (b.n === 1 ? String(b.z) : `${b.z}/${b.n}`) : String(v);
}
/* Zahl im Klartext der Hinweise: 7/3, −2, 2,5 */
const zh = (v) => {
  const b = bruch(v, 5000);
  if (b) return (b.n === 1 ? String(b.z) : `${b.z}/${b.n}`).replace("-", "−");
  return naeherung(v, 2).replace("{,}", ",");
};
const listeTex = (werte) => [...werte].sort((a, b) => a - b).map((w, i) => `x_{${i + 1}} = ${zahlTexFuer(w)}`).join("; \\; ");

/* ---------- Form eines Summanden: c · x^r ---------- */
function potenzForm(t) {
  if (!t) return null;
  if (t.k === "neg") { const p = potenzForm(t.a); return p && { c: -p.c, r: p.r }; }
  if (t.k === "num") return { c: t.v, r: 0 };
  if (t.k === "x") return { c: 1, r: 1 };
  if (t.k === "^" && t.a.k === "x" && istZahl(t.b)) return { c: 1, r: zahlWert(t.b) };
  if (t.k === "fn" && t.n === "sqrt" && t.a.k === "x") return { c: 1, r: 0.5 };
  if (t.k === "*" && istZahl(t.a)) { const p = potenzForm(t.b); return p && { c: p.c * zahlWert(t.a), r: p.r }; }
  if (t.k === "/" && istZahl(t.a)) {
    if (istZahl(t.b)) return { c: zahlWert(t.a) / zahlWert(t.b), r: 0 };
    const p = potenzForm(t.b);
    return p && Math.abs(p.c - 1) < 1e-12 ? { c: zahlWert(t.a), r: -p.r } : null;
  }
  return null;
}
const hatFn = (n, name) => !!n && typeof n === "object" && ((n.k === "fn" && n.n === name) || hatFn(n.a, name) || hatFn(n.b, name));

/* ---------- Fehlerkataloge: Terme ---------- */

/* Stammfunktion bilden (Typen stamm, anfang, bestimmt, flaeche; D bei zwei) */
function fehlerStamm(f, st) {
  const k = [];
  const teile = st.teile;
  const Fs = teile.map((t) => t.F);
  // sin/cos: falsches Vorzeichen (vor „abgeleitet“: bei 3 sin(x) ist 3 cos(x) beides – der Vorzeichen-Hinweis passt besser)
  teile.forEach((t, i) => {
    const sinus = hatFn(t.f, "sin"), cosinus = hatFn(t.f, "cos");
    if (!sinus && !cosinus) return;
    k.push({ art: "trig-vorzeichen", baum: summe(Fs.map((F, j) => (j === i ? gedreht(F) : F))),
      hinweis: sinus ? "∫ sin(x) dx = −cos(x) + C: Das Minus kommt daher, dass (cos x)′ = −sin x ist." : "∫ cos(x) dx = sin(x) + C – ohne Minus, denn (sin x)′ = cos x. Das Minus gehört zu ∫ sin." });
  });
  // Ableitung statt Stammfunktion
  const abl = ableitung(f);
  if (abl) k.push({ art: "abgeleitet", baum: abl, hinweis: "Das ist f′, die Ableitung. Gesucht ist die Stammfunktion F – also rückwärts: Exponent um 1 erhöhen und durch den neuen Exponenten teilen." });
  // Exponent erhöht, aber nicht geteilt (bei allen Potenz-Summanden)
  const ohneTeilen = teile.map((t) => { const p = potenzForm(t.f); return p && Math.abs(p.r + 1) > 1e-12 ? potenzTerm(p.c, p.r + 1) : t.F; });
  if (teile.some((t, i) => ohneTeilen[i] !== t.F)) {
    k.push({ art: "ohne-teilen", baum: summe(ohneTeilen), hinweis: "Der Exponent ist um 1 erhöht, aber nicht durch den neuen Exponenten geteilt: ∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C. Probe: Ableiten muss wieder f ergeben." });
  }
  if (teile.length >= 2) {
    // nur der erste Summand aufgeleitet
    k.push({ art: "nur-erster", baum: summe([Fs[0], ...teile.slice(1).map((t) => t.f)]), hinweis: "Nur der erste Summand ist aufgeleitet – jeder Summand bekommt seine eigene Stammfunktion." });
    // Vorzeichen eines Summanden gedreht (der zweite)
    k.push({ art: "vorzeichen-summand", baum: summe(Fs.map((F, i) => (i === 1 ? gedreht(F) : F))), hinweis: "Ein Vorzeichen ist umgekippt: Beim Aufleiten bleibt das Vorzeichen jedes Summanden erhalten." });
  }
  // Konstante k vergessen (k · x fehlt)
  const konst = teile.findIndex((t) => { const p = potenzForm(t.f); return p && Math.abs(p.r) < 1e-12; });
  if (konst >= 0 && teile.length >= 2) {
    k.push({ art: "konstante-weg", baum: summe(Fs.filter((_, i) => i !== konst)), hinweis: "Die Zahl ohne x ist verloren gegangen: Aus k wird k · x, denn (k · x)′ = k." });
  }
  // lineare Verkettung: Faktor 1/m vergessen oder mit m multipliziert; Klammerpotenz nicht durch n + 1 geteilt
  teile.forEach((t, i) => {
    const kp = kettenPotenz(t.f);
    if (kp && kp.n + 1 !== 0) {
      k.push({ art: "ohne-teilen", baum: summe(Fs.map((F, j) => (j === i ? skaliere(F, kp.n + 1) : F))),
        hinweis: `Exponent um 1 erhöht, aber nicht durch den neuen Exponenten geteilt: ∫ (mx + c)ⁿ dx = (mx + c)ⁿ⁺¹ / ((n + 1) · m) + C – hier also durch ${zh(kp.n + 1)} teilen.` });
    }
    const m = t.linear && t.linear.m;
    if (!m || Math.abs(m - 1) < 1e-12) return;
    const innen = `${Math.abs(m) === 1 ? (m < 0 ? "−" : "") : zh(m)}x${t.linear.c ? (t.linear.c < 0 ? " − " : " + ") + zh(Math.abs(t.linear.c)) : ""}`;
    k.push({ art: "innen-vergessen", baum: summe(Fs.map((F, j) => (j === i ? skaliere(F, m) : F))),
      hinweis: `Innere Funktion ${innen}: durch ${zh(m)} teilen. Beim Ableiten bringt die Kettenregel den Faktor ${zh(m)} – er muss sich wegheben.` });
    k.push({ art: "innen-multipliziert", baum: summe(Fs.map((F, j) => (j === i ? skaliere(F, m * m) : F))),
      hinweis: `Durch die innere Ableitung ${zh(m)} teilen, nicht mit ihr multiplizieren: Die Kettenregel liefert beim Ableiten den Faktor ${zh(m)}, den gleicht 1/${zh(m)} aus.` });
  });
  // e-Funktion wie eine Potenz behandelt
  teile.forEach((t, i) => {
    const ex = ePotenz(t.f);
    if (!ex) return;
    const u1 = add(ex.u, num(1));
    k.push({ art: "e-potenzregel", baum: summe(Fs.map((F, j) => (j === i ? div(mitKoef(ex.k, pow({ k: "e" }, u1)), u1) : F))),
      hinweis: "eˣ ist keine Potenz von x – die Potenzregel gilt hier nicht. Es gilt (eˣ)′ = eˣ, also ∫ eˣ dx = eˣ + C." });
    k.push({ art: "e-mal-x", baum: summe(Fs.map((F, j) => (j === i ? mul(mitKoef(ex.k, X), pow({ k: "e" }, ex.u)) : F))),
      hinweis: "∫ eˣ dx = eˣ + C – ohne zusätzlichen Faktor x: (x · eˣ)′ wäre nach der Produktregel eˣ + x · eˣ, nicht eˣ." });
  });
  // f selbst (nicht aufgeleitet) – nur, wenn sonst wenig Fehler greifen
  if (k.length < 3) k.push({ art: "f-selbst", baum: f, hinweis: "Das ist f selbst – gesucht ist F mit F′ = f, also „rückwärts ableiten“." });
  return k;
}
/* k · (mx + c)^n mit ganzem n ≠ 0, 1 (Klammer bleibt stehen) */
function kettenPotenz(t) {
  if (!t) return null;
  if (t.k === "neg") { const p = kettenPotenz(t.a); return p && { ...p, k: -p.k }; }
  if (t.k === "*" && istZahl(t.a)) { const p = kettenPotenz(t.b); return p && { ...p, k: p.k * zahlWert(t.a) }; }
  if (t.k === "/" && istZahl(t.a)) { const p = kettenPotenz(t.b); return p && Math.abs(p.k - 1) < 1e-12 ? { k: zahlWert(t.a), n: -p.n } : null; }
  if (t.k === "^" && istZahl(t.b) && ["+", "-"].includes(t.a.k)) { const n = zahlWert(t.b); return Number.isInteger(n) && n !== 0 && n !== 1 ? { k: 1, n } : null; }
  return null;
}
/* k · e^u */
function ePotenz(t) {
  if (!t) return null;
  if (t.k === "neg") { const p = ePotenz(t.a); return p && { ...p, k: -p.k }; }
  if (t.k === "*" && istZahl(t.a)) { const p = ePotenz(t.b); return p && { ...p, k: p.k * zahlWert(t.a) }; }
  if (t.k === "^" && t.a.k === "e") return { k: 1, u: t.b };
  return null;
}

/* Differenzfunktion d = f − g (zwei) */
function fehlerDifferenz(fK, gK) {
  const n = Math.max(fK.length, gK.length);
  const koef = (fkt) => Array.from({ length: n }, (_, i) => fkt(fK[i] || 0, gK[i] || 0));
  const k = [
    { art: "g-minus-f", koef: koef((a, b) => b - a), hinweis: "Das ist g − f. Für die Fläche ist das zwar gleich groß, aber d ist als f − g festgelegt." },
    { art: "plus", koef: koef((a, b) => a + b), hinweis: "Addiert statt abgezogen: d(x) = f(x) − g(x)." },
    { art: "nur-f", koef: koef((a) => a), hinweis: "Das ist f allein – d(x) = f(x) − g(x), g muss abgezogen werden." },
  ];
  const gGlieder = gK.map((c, i) => (Math.abs(c) > 1e-12 ? i : -1)).filter((i) => i >= 0);
  if (gGlieder.length >= 2) {
    const fuehrend = gGlieder[gGlieder.length - 1];
    k.unshift({ art: "klammer", koef: koef((a, b) => a + b).map((c, i) => (i === fuehrend ? (fK[i] || 0) - (gK[i] || 0) : c)),
      hinweis: "Klammer um g: Beim Abziehen dreht sich JEDES Vorzeichen in g um, nicht nur das erste." });
  }
  return k.map(({ koef: kf, ...rest }) => ({ ...rest, baum: polyAusKoef(kf) }));
}
/* Polynom-Baum aus Koeffizienten [a0, a1, …] (absteigend geschrieben) */
function polyAusKoef(koef) {
  const teile = [];
  for (let e = koef.length - 1; e >= 0; e--) { const c = rund(koef[e]); if (Math.abs(c) > 1e-12) teile.push(potenzTerm(c, e)); }
  return summe(teile);
}

/* ---------- Fehlerkataloge: Zahlen ---------- */

/* Grenze einsetzen (bestimmt: Fb, Fa) */
function fehlerGrenze(ctx, oben) {
  const { Fb, Fa, I, fb, fa, a, b, FK } = ctx;
  const g = oben ? b : a, Fg = oben ? Fb : Fa, name = oben ? "b" : "a", andere = oben ? "a" : "b";
  const k = [
    { art: "f-statt-F", wert: oben ? fb : fa, hinweis: `Das ist f(${name}) – eingesetzt wird in die Stammfunktion F, nicht in f.` },
    { art: "vertauscht", wert: oben ? Fa : Fb, hinweis: oben ? `Das ist F(a) mit der unteren Grenze – hier kommt die obere Grenze b = ${zh(b)} hinein.` : `Das ist F(b) mit der oberen Grenze – hier kommt die untere Grenze a = ${zh(a)} hinein.` },
  ];
  if (FK) {
    if (g < 0 && FK.some((c, i) => i >= 2 && i % 2 === 0 && Math.abs(c) > 1e-12)) {
      const w = FK.reduce((s, c, i) => s + (i === 0 ? c : c * -(Math.abs(g) ** i)), 0);
      k.push({ art: "negativ-quadrat", wert: w, hinweis: `Bei der negativen Grenze gehört die Klammer mit: (${zh(g)})² = +${zh(g * g)}, nicht −${zh(g * g)}.` });
    }
    const hoch = FK.reduce((m, c, i) => (i >= 2 && Math.abs(c) > 1e-12 ? i : m), 0);
    if (hoch >= 2 && Math.abs(g) !== 1 && g !== 0) {
      const w = FK.reduce((s, c, i) => s + (i === 0 ? c : c * g), 0);
      const gk = g < 0 ? `(${zh(g)})` : zh(g);
      k.push({ art: "exponent-vergessen", wert: w, hinweis: `Die Hochzahl gilt auch für die eingesetzte Zahl: x${HOCH[hoch] || `^${hoch}`} wird zu ${gk}${HOCH[hoch] || `^${hoch}`} = ${zh(g ** hoch)}, nicht zu ${zh(g)}.` });
    }
  }
  if (oben) k.push({ art: "zu-frueh", wert: I, hinweis: "Das ist schon F(b) − F(a). Hier nur die obere Grenze einsetzen – abgezogen wird im nächsten Schritt." });
  else k.push({ art: "vorzeichen", wert: -Fg, hinweis: "Das ist −F(a). Hier wird nur F(a) ausgerechnet – das Minus kommt erst beim Hauptsatz F(b) − F(a)." });
  k.push({ art: "andere-grenze-f", wert: oben ? fa : fb, hinweis: `Das ist f(${andere}) – weder die richtige Funktion noch die richtige Grenze: F(${name}) ist gesucht.` });
  return k;
}

/* Hauptsatz (bestimmt: I) */
function fehlerHauptsatz({ Fb, Fa, I }) {
  return [
    { art: "vertauscht", wert: Fa - Fb, hinweis: "Vorzeichen gedreht: Es heißt F(b) − F(a) – erst die obere Grenze, dann die untere abziehen." },
    { art: "addiert", wert: Fb + Fa, hinweis: "Du hast F(a) addiert statt abgezogen: F(b) − F(a)." },
    { art: "ohne-Fa", wert: Fb, hinweis: "Das ist nur F(b) – F(a) muss noch abgezogen werden." },
    { art: "ohne-Fb", wert: -Fa, hinweis: "Das ist nur −F(a) – F(b) fehlt noch." },
    { art: "vorzeichen", wert: -I, hinweis: "Vorzeichen des Ergebnisses gedreht – rechne F(b) − F(a) noch einmal in Ruhe." },
  ];
}

/* C bestimmen (anfang) */
function fehlerC({ y0, w, C }) {
  return [
    { art: "vorzeichen", wert: y0 + w, hinweis: "Vorzeichen: Aus F₀(x₀) + C = y₀ folgt C = y₀ − F₀(x₀)." },
    { art: "F0", wert: w, hinweis: "Das ist F₀(x₀) selbst – C = y₀ − F₀(x₀)." },
    { art: "y0", wert: y0, hinweis: "Das ist y₀ – F₀(x₀) ist nicht 0 und muss von y₀ abgezogen werden." },
    { art: "gedreht", wert: -C, hinweis: "C = y₀ − F₀(x₀), nicht F₀(x₀) − y₀." },
  ];
}

/* Teilintegral I_k (flaeche, zwei) */
function fehlerTeil(ctx, i) {
  const t = ctx.teile[i], Py = ctx.Fn(t.bis), Px = ctx.Fn(t.von), name = ctx.typ === "zwei" ? "D" : "F";
  const k = [
    { art: "vorzeichen", wert: -t.wert, hinweis: t.wert < 0 ? "Das ist der Betrag. Das Integral selbst ist hier negativ – den Betrag nimmst du erst beim Flächeninhalt A." : `Vorzeichen gedreht – hast du die Grenzen vertauscht? Es heißt ${name}(obere Grenze) − ${name}(untere Grenze).` },
    { art: "addiert", wert: Py + Px, hinweis: `${name}(untere Grenze) wird abgezogen, nicht addiert.` },
    { art: "ohne-untere", wert: Py, hinweis: `Das ist nur ${name}(${zh(t.bis)}) – ${name}(${zh(t.von)}) muss noch abgezogen werden.` },
  ];
  if (ctx.teile.length > 1) k.push({ art: "ganz", wert: ctx.bilanz, hinweis: `Das ist das Integral über das ganze Intervall – hier nur von ${zh(t.von)} bis ${zh(t.bis)} integrieren.` });
  return k;
}

/* Flächeninhalt A (flaeche, zwei) */
function fehlerFlaeche(ctx) {
  const { teile, bilanz, A } = ctx;
  const k = [
    { art: "bilanz", wert: bilanz, hinweis: "Das ist die Bilanz: Teilflächen unter der x-Achse zählen negativ. Für den Flächeninhalt die Beträge der Teilintegrale addieren." },
    { art: "negativ", wert: -A, hinweis: "Ein Flächeninhalt ist nie negativ – Beträge nehmen." },
  ];
  if (teile.length > 1) {
    k.push({ art: "bilanz-betrag", wert: Math.abs(bilanz), hinweis: "Das ist der Betrag der Bilanz – addiere die Beträge der einzelnen Teilintegrale." });
    k.push({ art: "teil-vergessen", wert: A - Math.abs(teile[teile.length - 1].wert), hinweis: "Ein Teilintegral fehlt – jede Teilfläche zählt mit ihrem Betrag." });
  }
  return k;
}

/* Nullstellen / Schnittstellen (zahlen) */
function fehlerNullstellen(ctx) {
  const { nst, fn, fName } = ctx;
  const istNst = (w) => nst.some((x) => Math.abs(x - w) < 1e-9);
  // Probe an einer Stelle der falschen Liste, die keine Nullstelle ist
  const probe = (werte) => {
    const w = werte.find((v) => !istNst(v));
    if (w === undefined) return "";
    const y = fn(w);
    return ` Probe: ${fName}(${zh(w)}) = ${endlich(y) ? zh(y) : "?"} ≠ 0.`;
  };
  const dazu = (art, werte, text) => { if (werte.some((v) => !istNst(v)) || werte.length !== nst.length) k.push({ art, werte, hinweis: `${text}${probe(werte)}` }); };
  const k = [];
  const i = nst.findIndex((x) => Math.abs(x) > 1e-12 && !istNst(-x));
  if (i >= 0) {
    dazu("vorzeichen", nst.map((x) => -x), "Die Vorzeichen sind gedreht.");
    if (nst.length >= 2) dazu("eins-gedreht", nst.map((x, j) => (j === i ? -x : x)), "Eine Stelle hat das falsche Vorzeichen.");
  }
  const sym = nst.length === 4 && nst.every((x) => nst.some((y) => Math.abs(x + y) < 1e-9));
  if (sym) {
    const v = Math.max(...nst);
    dazu("plusminus", nst.filter((x) => x > 0), `Rücksubstitution: x² = ${zh(v * v)} hat ZWEI Lösungen, x = ${zh(v)} und x = −${zh(v)} – jede Lösung für z liefert zwei Werte für x.`);
  } else if (nst.length >= 3 && nst.some((x) => Math.abs(x) < 1e-12)) {
    dazu("null-vergessen", nst.filter((x) => Math.abs(x) > 1e-12), "x = 0 fehlt: Beim Ausklammern von x ist x = 0 selbst eine Lösung (Satz vom Nullprodukt).");
  } else if (nst.length >= 3) {
    // der Kern rät zuerst die Nullstelle mit dem kleinsten Betrag (1, −1, 2, −2 …)
    const geraten = [...nst].sort((x, y) => Math.abs(x) - Math.abs(y) || y - x)[0];
    dazu("geratene-vergessen", nst.filter((x) => x !== geraten), `Eine Lösung fehlt: Die geratene Nullstelle x = ${zh(geraten)} gehört mit dazu – die Polynomdivision liefert nur die übrigen.`);
  }
  if (nst.length >= 2) {
    const d = nst[1] - nst[0] > 0 ? 1 : -1;
    dazu("verschoben", nst.map((x) => x + d), "Alle Stellen sind um 1 verrutscht – mach die Probe durch Einsetzen.");
  }
  return k;
}

/* ---------- Fragen je Schritt ---------- */
function frageZu(aufgabe, s) {
  const typ = aufgabe.typ, i = aufgabe.kopf.int;
  if (s.id === "F") return typ === "anfang" ? "Bilde eine Stammfunktion $F_{0}$ von f (ohne C)." : typ === "stamm" ? "Bilde die Stammfunktion F von f." : "Bilde eine Stammfunktion F von f (ohne + C).";
  if (s.id === "D") return "Bilde eine Stammfunktion D von d (ohne + C).";
  if (s.id === "d") return "Bilde $d(x) = f(x) − g(x)$ und fasse zusammen.";
  if (s.id === "Fb") return `Setz die obere Grenze $b = ${i.b}$ in F ein.`;
  if (s.id === "Fa") return `Setz die untere Grenze $a = ${i.a}$ in F ein.`;
  if (s.id === "I") return "Hauptsatz: Rechne $F(b) − F(a)$ aus.";
  if (s.id === "C") return `Setz $${aufgabe.kopf.punkt}$ ein und löse nach C auf.`;
  if (s.id === "null") return typ === "zwei" ? "Löse $d(x) = 0$ – das sind die Schnittstellen." : "Bestimme alle Nullstellen von f.";
  if (/^I\d$/.test(s.id)) {
    const t = aufgabe.bild.teile[Number(s.id.slice(1)) - 1];
    return `Berechne das Teilintegral $I_{${s.id.slice(1)}}$ von $${zahlTexFuer(t.von)}$ bis $${zahlTexFuer(t.bis)}$.`;
  }
  if (s.id === "A") return aufgabe.bild.teile.length > 1 ? "Addiere die Beträge der Teilintegrale." : "Der Flächeninhalt ist der Betrag des Integrals.";
  return s.frage;
}

/* ---------- Auswahl (gemeinsamer Kern: uebenKern.js) ---------- */
/* Terme werden über ihre Werte an den Prüfstellen verglichen – gleiche Funktion, gleicher Schlüssel */
const signatur = (baum) => {
  const g = auswerter(baum);
  return STELLEN.map((x) => { const y = g(x); return endlich(y) ? String(Math.round(y * 1e6) / 1e6) : "–"; }).join("|");
};
const schluessel = (w) => (typeof w.text === "string" ? `t:${lies(w.text) ? signatur(lies(w.text)) : w.text}` : Array.isArray(w.werte) ? `l:${[...w.werte].sort((a, b) => a - b).map((v) => Math.round(v * 1e6) / 1e6).join("|")}` : `z:${Math.round(w.wert * 1e6) / 1e6}`);
const lesbar = (w) => (typeof w.text === "string" ? !!lies(w.text) : Array.isArray(w.werte) ? w.werte.every(endlich) : endlich(w.wert));

/* Kontext einer Aufgabe: Bäume, Werte, die mehrere Schritte brauchen */
function kontext(aufgabe) {
  const ctx = { typ: aufgabe.typ };
  const fText = aufgabe.typ === "zwei" ? aufgabe.d && aufgabe.d.text : aufgabe.f && aufgabe.f.text;
  ctx.f = fText ? lies(fText) : null;                  // bei zwei: d
  ctx.st = ctx.f ? stammfunktion(ctx.f) : null;
  ctx.Fn = ctx.st ? auswerter(ctx.st.F) : null;
  ctx.fn = ctx.f ? auswerter(ctx.f) : null;
  const B = aufgabe.bild || {};
  if (aufgabe.typ === "bestimmt") {
    const s = (id) => aufgabe.schritte.find((x) => x.id === id);
    ctx.Fb = s("Fb").soll; ctx.Fa = s("Fa").soll; ctx.I = s("I").soll;
    ctx.a = B.a; ctx.b = B.b; ctx.fb = B.fn(B.b); ctx.fa = B.fn(B.a);
    ctx.FK = ctx.st ? polyKoef(ctx.st.F) : null;
  }
  if (aufgabe.typ === "anfang") { ctx.y0 = B.y0; ctx.w = B.Fn(B.x0); ctx.C = B.C; }
  if (aufgabe.typ === "flaeche" || aufgabe.typ === "zwei") {
    ctx.teile = B.teile; ctx.bilanz = B.teile.reduce((s, t) => s + t.wert, 0);
    ctx.A = aufgabe.schritte.find((x) => x.id === "A").soll;
    ctx.nst = aufgabe.schritte.find((x) => x.id === "null").sollWerte;
    ctx.fName = aufgabe.typ === "zwei" ? "d" : "f";
  }
  if (aufgabe.typ === "zwei") { ctx.fK = polyKoef(lies(aufgabe.f.text)); ctx.gK = polyKoef(lies(aufgabe.g.text)); }
  return ctx;
}

/* ---------- Der Weg ---------- */
export function uebenWeg(aufgabe, zufall = Math.random) {
  if (!aufgabe || aufgabe.fehler || !Array.isArray(aufgabe.schritte)) return [];
  const ctx = kontext(aufgabe);
  const schritte = [];
  for (const s of aufgabe.schritte) {
    if (s.art === "info") continue;
    const basis = { id: s.id, art: s.art, label: s.label, ueber: s.ueber, plusC: !!s.plusC, frage: frageZu(aufgabe, s), schluessel, zufall };
    if (s.art === "term") {
      const plusC = (t) => (s.plusC ? `${t} + C` : t);
      let richtigBaum = s.sollText ? lies(s.sollText) : null;
      if (!richtigBaum && ctx.st) richtigBaum = ctx.st.F;
      if (!richtigBaum) continue;
      const richtig = { text: s.sollText || eingabeText(richtigBaum), tex: plusC(termTex(richtigBaum)) };
      let kand = [];
      if (s.id === "d" && ctx.fK && ctx.gK) kand = fehlerDifferenz(ctx.fK, ctx.gK);
      else if (ctx.f && ctx.st) kand = fehlerStamm(ctx.f, ctx.st);
      const kandidaten = kand.map(({ baum, art, hinweis }) => ({ art, hinweis, wert: { text: eingabeText(baum), tex: plusC(termTex(baum)) } }));
      const pruefe = (w) => s.pruefen(w.text);
      let falsche = falscheOptionen(richtig, kandidaten, { pruefe, schluessel, lesbar, max: 3, zufall });
      if (!falsche.length) falsche = notnagelTerm(richtig, richtigBaum, pruefe, plusC);
      schritte.push(uebenSchritt({ ...basis, richtig, falsche }));
    } else if (s.art === "zahl") {
      const richtig = { wert: s.soll, tex: zahlTexFuer(s.soll) };
      let kand = [];
      if (s.id === "Fb" || s.id === "Fa") kand = fehlerGrenze(ctx, s.id === "Fb");
      else if (s.id === "I") kand = fehlerHauptsatz(ctx);
      else if (s.id === "C") kand = fehlerC(ctx);
      else if (/^I\d$/.test(s.id)) kand = fehlerTeil(ctx, Number(s.id.slice(1)) - 1);
      else if (s.id === "A") kand = fehlerFlaeche(ctx);
      const kandidaten = kand.filter((k) => endlich(k.wert)).map(({ wert, art, hinweis }) => ({ art, hinweis, wert: { wert, tex: zahlTexFuer(wert) } }));
      const pruefe = (w) => s.pruefen(zahlText(w.wert));
      let falsche = falscheOptionen(richtig, kandidaten, { pruefe, schluessel, lesbar, max: 3, zufall });
      if (!falsche.length) falsche = falscheOptionen(richtig, [{ art: "notnagel", wert: { wert: -s.soll || 1, tex: zahlTexFuer(-s.soll || 1) }, hinweis: "Dieser Wert passt nicht – rechne den Schritt noch einmal nach." }], { pruefe, schluessel, lesbar, max: 1, zufall });
      schritte.push(uebenSchritt({ ...basis, richtig, falsche }));
    } else if (s.art === "zahlen") {
      const richtig = { werte: [...s.sollWerte].sort((a, b) => a - b), tex: listeTex(s.sollWerte) };
      const kandidaten = fehlerNullstellen(ctx).map(({ werte, art, hinweis }) => ({ art, hinweis, wert: { werte: [...werte].sort((a, b) => a - b), tex: listeTex(werte) } }));
      const pruefe = (w) => s.pruefen(w.werte.map(zahlText));
      const falsche = falscheOptionen(richtig, kandidaten, { pruefe, schluessel, lesbar, max: 3, zufall });
      schritte.push(uebenSchritt({ ...basis, richtig, falsche }));
    }
  }
  return schritte;
}

/* Notnagel für Terme, falls kein Katalogfehler greift (z. B. eigene Funktionen): Vorzeichen gedreht, sonst + x */
function notnagelTerm(richtig, baum, pruefe, plusC) {
  for (const [art, b, hinweis] of [["notnagel", gedreht(baum), "Vorzeichen gedreht – leite zur Probe ab, es muss f herauskommen."], ["notnagel", add(baum, X), "Da ist ein Summand zu viel – leite zur Probe ab, es muss genau f herauskommen."]]) {
    const wert = { text: eingabeText(b), tex: plusC(termTex(b)) };
    if (schluessel(wert) === schluessel(richtig) || !lesbar(wert)) continue;
    const r = pruefe(wert);
    if (!r.ok) return [{ wert, art, hinweis }];
  }
  return [];
}

/* Zahl der Wahl-Schritte einer Aufgabe (ohne Info-Schritte) */
export const uebenSchritteZahl = (aufgabe) => (aufgabe && !aufgabe.fehler ? aufgabe.schritte.filter((s) => s.art !== "info").length : 0);
