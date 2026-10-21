/* ======================================================================
   Term-Parser der Termtastatur (aus func4.jsx ausgelagert, 21.10.2026): Maschinenschrift → Baum → TeX.
   Eigene Datei, damit func3 (Text/Zeile) nicht die ganze func4 (Klausur, Kurvendiskussion,
   Regelwerkstatt, Hilfe mit Formelsammlung …) in den Startchunk zieht.
   ====================================================================== */
import { PLATZ, ohneKlammer } from "./base2.jsx";

/* Der Term wird als Maschinenschrift geführt, aber gesetzt angezeigt.
   ▯ ist ein Platzhalter: Er wird gefüllt, sobald man etwas einfügt,
   und mit der Pfeiltaste springt man zum nächsten. */


export function tMarken(s) {
  const m = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === PLATZ) { m.push({ t: "box" }); i++; }
    else if (/[0-9.]/.test(ch)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; m.push({ t: "num", v: s.slice(i, j) }); i = j; }
    else if (/[a-zA-Z\u0370-\u03ff]/.test(ch)) {
      const rest = s.slice(i).toLowerCase();
      const fn = ["sqrt", "exp", "sin", "cos", "tan", "log", "ln"].find(
        (name) => rest.startsWith(name) && rest[name.length] === "(");
      if (fn) { m.push({ t: "name", v: fn }); i += fn.length; }
      else if (rest.startsWith("pi")) { m.push({ t: "name", v: "pi" }); i += 2; }
      else {
        let name = ch; i += 1;   // Groß- und Kleinschreibung bleiben erhalten
        // Δx und Δy sind ein Symbol, kein Produkt
        if (/[\u0391-\u03a9]/.test(ch) && i < s.length && /[a-zA-Z]/.test(s[i])) { name += s[i]; i++; }
        while (i < s.length && "′″‴'".includes(s[i])) { name += s[i]; i++; }
        m.push({ t: "name", v: name });
      }
    }
    else if ("+-*/^()".includes(ch)) { m.push({ t: ch }); i++; }
    else if (/\s/.test(ch)) { i++; }
    else { m.push({ t: "?" }); i++; }
  }
  return m;
}


export function tBaum(m) {
  let p = 0;
  const schau = () => m[p];
  const nimm = (t) => { if (m[p] && m[p].t === t) { p++; return true; } return false; };

  function summe() {
    let n = produkt(); if (!n) return null;
    while (schau() && (schau().t === "+" || schau().t === "-")) {
      const op = schau().t; p++;
      const r = produkt(); if (!r) return null;
      n = { op, l: n, r };
    }
    return n;
  }
  function produkt() {
    let n = vorz(); if (!n) return null;
    for (;;) {
      if (schau() && (schau().t === "*" || schau().t === "/")) {
        const op = schau().t; p++;
        const r = vorz(); if (!r) return null;
        n = { op, l: n, r };
      } else if (schau() && ["num", "name", "box", "("].includes(schau().t)) {
        const r = vorz(); if (!r) return null;
        n = { op: "*", still: true, l: n, r };
      } else return n;
    }
  }
  function vorz() {
    if (nimm("-")) { const n = vorz(); return n ? { op: "neg", l: n } : null; }
    if (nimm("+")) return vorz();
    return potenz();
  }
  function potenz() {
    const b = atom(); if (!b) return null;
    if (nimm("^")) { const e = vorz(); return e ? { op: "^", l: b, r: e } : null; }
    return b;
  }
  function atom() {
    const k = schau(); if (!k) return null;
    if (k.t === "box") { p++; return { op: "box" }; }
    if (k.t === "num") { p++; return { op: "num", v: k.v }; }
    if (k.t === "(") { p++; const n = summe(); if (!n || !nimm(")")) return null; return { op: "klammer", l: n }; }
    if (k.t === "name") {
      p++;
      const name = k.v;
      if (["sin", "cos", "tan", "ln", "log", "sqrt", "exp"].includes(name)) {
        if (!nimm("(")) return null;
        const a = summe(); if (!a || !nimm(")")) return null;
        return { op: "fn", name, l: a };
      }
      if (/^[a-zA-Z]['′″‴]{0,3}$/.test(name) && schau() && schau().t === "(") {
        p++;
        const a = summe(); if (!a || !nimm(")")) return null;
        return { op: "fnroh", name, l: a };
      }
      return { op: "var", name };
    }
    return null;
  }
  const n = summe();
  return n && p === m.length ? n : null;
}


export function tTex(n, aussen = 0) {
  const klam = (s, r) => (r < aussen ? `(${s})` : s);
  switch (n.op) {
    case "num": return n.v.replace(".", "{,}");
    case "var": return n.name === "pi" ? "\\pi" : n.name;
    case "box": return "▯";
    case "klammer": return `(${tTex(n.l, 0)})`;
    case "neg": return klam(`-${tTex(n.l, 2)}`, 1);
    case "+": return klam(`${tTex(n.l, 1)} + ${tTex(n.r, 1)}`, 1);
    case "-": return klam(`${tTex(n.l, 1)} - ${tTex(n.r, 2)}`, 1);
    case "*": {
      const a = tTex(n.l, 2), b = tTex(n.r, 2);
      const punkt = /[0-9]$/.test(a) && /^[0-9]/.test(b);
      return klam(`${a}${punkt ? " \\cdot " : " "}${b}`, 2);
    }
    case "/": return `\\frac{${tTex(ohneKlammer(n.l), 0)}}{${tTex(ohneKlammer(n.r), 0)}}`;
    case "^": return klam(`${tTex(n.l, 5)}^{${tTex(n.r, 0)}}`, 4);
    case "fnroh": return `${n.name}(${tTex(ohneKlammer(n.l), 0)})`;
    case "fn": {
      const name = n.name === "sqrt" ? null : n.name === "ln" || n.name === "log" ? "\\ln" : `\\${n.name}`;
      if (!name) return `\\sqrt{${tTex(ohneKlammer(n.l), 0)}}`;
      return `${name}(${tTex(ohneKlammer(n.l), 0)})`;
    }
    default: return "";
  }
}


export function termAlsTex(text) {
  if (!text) return null;
  const b = tBaum(tMarken(text));
  return b ? tTex(b) : null;
}
