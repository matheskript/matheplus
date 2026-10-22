/* ======================================================================
   termFeldMittel.js – Modell der Termeingabe für die Mittelstufe (rein, ohne React).
   Der Term ist ein Baum aus Zeilen: Zeichen (Ziffern, x, + − · : , ( )) und
   Bausteine Bruch { t: "bruch", zaehler, nenner } und Hochzahl { t: "hoch", inhalt }.
   Die Schreibmarke ist { zeile, idx }. Die Oberfläche (funcTermFeldMittel.jsx)
   zeichnet den Baum als echte Mathe (Bruchstrich, hochgestellte Zahl) – keine
   „Gelesen als“-Zeile. alsText() liefert den Term für den Formel-Parser
   (formelEngine.parse) und meldet leere Felder mit Ort, damit die Marke hinspringt.
   Bewusst nur Mittelstufe: keine π, e, sin, ln, Wurzeln; Variable nur x.
   Vorbild: Prototyp „Termeingabe Mittelstufe“ (21.10.).
   ====================================================================== */

export const OPS = "+−·:";
const istZiffer = (c) => typeof c === "string" && /[0-9]/.test(c);
const istBuchstabe = (c) => typeof c === "string" && /[a-z]/i.test(c);
const istOp = (c) => typeof c === "string" && OPS.includes(c);
export const istBaustein = (it) => !!it && typeof it === "object";

function neueZeile(eltern) { const z = []; z.eltern = eltern; return z; }
function neuerBruch() { const b = { t: "bruch" }; b.zaehler = neueZeile(b); b.nenner = neueZeile(b); return b; }
function neueHochzahl() { const h = { t: "hoch" }; h.inhalt = neueZeile(h); return h; }
export const zeilenVon = (b) => (b.t === "bruch" ? [b.zaehler, b.nenner] : [b.inhalt]);
const leer = (b) => zeilenVon(b).every((z) => z.length === 0);
function setzeIn(zeile, it) { if (istBaustein(it)) it.zeile = zeile; }

export function neuesModell() {
  const wurzel = neueZeile(null);
  return { wurzel, marke: { zeile: wurzel, idx: 0 } };
}
export const istLeer = (m) => m.wurzel.length === 0;

/* ---------- Schreibmarke ---------- */
function rechts(m) {
  const { zeile, idx } = m.marke;
  if (idx < zeile.length) {
    const it = zeile[idx];
    m.marke = istBaustein(it) ? { zeile: zeilenVon(it)[0], idx: 0 } : { zeile, idx: idx + 1 };
    return;
  }
  const b = zeile.eltern; if (!b) return;
  const zs = zeilenVon(b), k = zs.indexOf(zeile);
  m.marke = k < zs.length - 1 ? { zeile: zs[k + 1], idx: 0 } : { zeile: b.zeile, idx: b.zeile.indexOf(b) + 1 };
}
function links(m) {
  const { zeile, idx } = m.marke;
  if (idx > 0) {
    const it = zeile[idx - 1];
    if (istBaustein(it)) { const zs = zeilenVon(it), z = zs[zs.length - 1]; m.marke = { zeile: z, idx: z.length }; }
    else m.marke = { zeile, idx: idx - 1 };
    return;
  }
  const b = zeile.eltern; if (!b) return;
  const zs = zeilenVon(b), k = zs.indexOf(zeile);
  m.marke = k > 0 ? { zeile: zs[k - 1], idx: zs[k - 1].length } : { zeile: b.zeile, idx: b.zeile.indexOf(b) };
}
function raus(m) { const b = m.marke.zeile.eltern; if (b) m.marke = { zeile: b.zeile, idx: b.zeile.indexOf(b) + 1 }; }

/* ---------- Einfügen ---------- */
function einfuegen(m, it) {
  setzeIn(m.marke.zeile, it);
  m.marke.zeile.splice(m.marke.idx, 0, it); m.marke.idx++;
}
function zeichen(m, c) {
  const b = m.marke.zeile.eltern;
  // Hochzahl endet vor + − · : ) – außer einem Vorzeichen am Anfang der leeren Hochzahl
  if (b && b.t === "hoch" && (istOp(c) || c === ")") && !(c === "−" && m.marke.zeile.length === 0)) raus(m);
  einfuegen(m, c);
}
/* Bruch: nimmt den Operanden vor der Marke in den Zähler (Zahl, x, Hochzahl, ganze Klammer) */
function bruch(m) {
  const { zeile, idx } = m.marke;
  let j = idx;
  if (zeile[j - 1] === ")") {
    let tiefe = 0;
    for (let k = j - 1; k >= 0; k--) {
      if (zeile[k] === ")") tiefe++;
      else if (zeile[k] === "(") { tiefe--; if (tiefe === 0) { j = k; break; } }
    }
  } else {
    while (j > 0 && (istZiffer(zeile[j - 1]) || istBuchstabe(zeile[j - 1]) || zeile[j - 1] === "," || (istBaustein(zeile[j - 1]) && zeile[j - 1].t === "hoch"))) j--;
  }
  let genommen = zeile.splice(j, idx - j);
  if (genommen[0] === "(" && genommen[genommen.length - 1] === ")") genommen = genommen.slice(1, -1);   // (x + 2) → Zähler x + 2
  const b = neuerBruch(); b.zeile = zeile;
  genommen.forEach((it) => { setzeIn(b.zaehler, it); b.zaehler.push(it); });
  zeile.splice(j, 0, b);
  m.marke = genommen.length ? { zeile: b.nenner, idx: 0 } : { zeile: b.zaehler, idx: 0 };
}
function hoch(m) {
  const vor = m.marke.zeile[m.marke.idx - 1];
  if (istBaustein(vor) && vor.t === "hoch") { m.marke = { zeile: vor.inhalt, idx: vor.inhalt.length }; return; }
  const h = neueHochzahl(); einfuegen(m, h); m.marke = { zeile: h.inhalt, idx: 0 };
}
function hochZahl(m, n) {
  const b = m.marke.zeile.eltern;
  if (b && b.t === "hoch") { einfuegen(m, n); return; }
  const h = neueHochzahl(); h.inhalt.push(n); einfuegen(m, h);
}

/* ---------- Löschen: nie halb ---------- */
function loeschen(m) {
  const { zeile, idx } = m.marke;
  if (idx > 0) {
    const it = zeile[idx - 1];
    if (istBaustein(it) && !leer(it)) { const zs = zeilenVon(it), z = zs[zs.length - 1]; m.marke = { zeile: z, idx: z.length }; return; }
    if (it === "(" && zeile[idx] === ")") { zeile.splice(idx - 1, 2); m.marke.idx--; return; }   // leeres Klammerpaar ganz weg
    zeile.splice(idx - 1, 1); m.marke.idx--; return;
  }
  const b = zeile.eltern; if (!b) return;
  const pos = b.zeile.indexOf(b);
  if (leer(b)) { b.zeile.splice(pos, 1); m.marke = { zeile: b.zeile, idx: pos }; return; }
  if (b.t === "bruch" && zeile === b.nenner) { m.marke = { zeile: b.zaehler, idx: b.zaehler.length }; return; }
  m.marke = { zeile: b.zeile, idx: pos };
}

/* ---------- Tasten ---------- */
export const TASTEN_MITTEL = [
  ["7"], ["8"], ["9"], ["("], [")"], ["⌫"],
  ["4"], ["5"], ["6"], ["+"], ["−"], ["x²"],
  ["1"], ["2"], ["3"], ["·"], [":"], ["xⁿ"],
  ["0"], [","], ["x"], ["bruch"], ["←"], ["→"],
];
export function taste(m, t) {
  if (t === "⌫") loeschen(m);
  else if (t === "←") links(m);
  else if (t === "→") rechts(m);
  else if (t === "x²") hochZahl(m, "2");
  else if (t === "x³") hochZahl(m, "3");
  else if (t === "xⁿ") hoch(m);
  else if (t === "bruch") bruch(m);
  else if (t === "leeren") { const n = neuesModell(); m.wurzel = n.wurzel; m.marke = n.marke; }
  else zeichen(m, t);
}
/* Computertastatur → Taste (null = nicht unsere) */
export function tasteAus(key) {
  if (/^[0-9]$/.test(key)) return key;
  if (key === "x" || key === "X") return "x";
  const k = { "+": "+", "-": "−", "*": "·", ":": ":", "/": "bruch", "^": "xⁿ", "²": "x²", "³": "x³", "(": "(", ")": ")", ",": ",", ".": ",",
    Backspace: "⌫", ArrowLeft: "←", ArrowRight: "→" }[key];
  return k || null;
}

/* ---------- Klammern prüfen (für die Anzeige) ---------- */
export function klammerInfo(zeile) {
  let offen = 0; const falsch = new Set();
  zeile.forEach((it, i) => { if (it === "(") offen++; else if (it === ")") { if (offen > 0) offen--; else falsch.add(i); } });
  return { offen, falsch };
}

/* ---------- Text für den Parser + Fehler mit Ort ---------- */
const ASCII = { "−": "-", "·": "*", ":": "/", ",": "." };
class Leer extends Error { constructor(code, zeile, idx = 0) { super(code); this.code = code; this.zeile = zeile; this.idx = idx; } }
function text(zeile) {
  let s = "";
  zeile.forEach((it, i) => {
    if (!istBaustein(it)) { s += ASCII[it] ?? it; return; }
    if (it.t === "bruch") {
      if (!it.zaehler.length) throw new Leer("zaehlerLeer", it.zaehler);
      if (!it.nenner.length) throw new Leer("nennerLeer", it.nenner);
      s += `((${text(it.zaehler)})/(${text(it.nenner)}))`;
      return;
    }
    const vor = zeile[i - 1];
    if (i === 0 || istOp(vor) || vor === "(") throw new Leer("basisFehlt", zeile, i);
    if (!it.inhalt.length) throw new Leer("hochLeer", it.inhalt);
    const innen = text(it.inhalt);
    s += /^[0-9]+$/.test(innen) ? `^${innen}` : `^(${innen})`;   // einfache Hochzahl ohne Klammer (sonst sieht die Formprüfung eine Klammer)
  });
  return s;
}
/* { text } oder { fehler: code, zeile, idx } */
export function alsText(m) {
  try { return { text: text(m.wurzel) }; }
  catch (e) { if (e instanceof Leer) return { fehler: e.code, zeile: e.zeile, idx: e.idx }; throw e; }
}
export const FEHLER_TEXT = {
  zaehlerLeer: ["Der Zähler ist noch leer.", "The numerator is still empty."],
  nennerLeer: ["Der Nenner ist noch leer.", "The denominator is still empty."],
  hochLeer: ["Die Hochzahl ist noch leer.", "The exponent is still empty."],
  basisFehlt: ["Vor der Hochzahl fehlt die Basis.", "The exponent has no base."],
};

/* Term aus Kurzschrift (Tests, Vorbelegung): x^{2}, frac{a}{b} */
export function ausKurzschrift(s) {
  const m = neuesModell();
  let i = 0;
  const lies = (zeile, ende) => {
    while (i < s.length && s[i] !== ende) {
      const c = s[i];
      if (c === " ") { i++; continue; }
      if (c === "^") { i += 2; const h = neueHochzahl(); h.zeile = zeile; zeile.push(h); lies(h.inhalt, "}"); i++; continue; }
      if (s.startsWith("frac{", i)) { i += 5; const b = neuerBruch(); b.zeile = zeile; zeile.push(b); lies(b.zaehler, "}"); i += 2; lies(b.nenner, "}"); i++; continue; }
      zeile.push(c === "-" ? "−" : c === "*" ? "·" : c); i++;
    }
  };
  lies(m.wurzel, undefined);
  m.marke = { zeile: m.wurzel, idx: m.wurzel.length };
  return m;
}
