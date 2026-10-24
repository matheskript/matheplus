/* ============================================================
   Ableitungstrainer (Regelwerkstatt + Eigene Funktion) – Modus „Üben“
   (ohne Oberfläche)

   Zwischen Auto (die App rechnet vor) und Lernen (der Schüler tippt jede
   Ableitung selbst) liegt Üben: Der Schüler geht jeden Schritt selbst,
   wählt aber aus fertigen Zeilen – eine richtige und bis zu drei falsche,
   jede mit einem typischen Fehler genau dieses Schritts.

   uebenWegWerkstatt({ regel, u, v }, zufall) → Schritte
     u1  u′(x)        (Produkt, Quotient, Ketten)
     uv  u′(v(x))     (Ketten)
     v1  v′(x)        (alle Regeln)
     f1  f′(x)        (die Regel anwenden)
   uebenWegEigen([f, f′, f″, f‴], zufall) → drei Schritte abl (f′, f″, f‴)

   Jede Option ist { tex, baum }; jede falsche Option ist mit gleichwertig()
   (dieselbe Prüfung wie in Lernen) als falsch bestätigt. Reine Logik,
   testbar mit Node (tests/regelwerkUeben.test.mjs).
   ============================================================ */
import { ableitung, hatX } from "./formelEngine.js";
import {
  REGELN, STELLEN, auswerter, einsetzen, fehlerbilder, gleichwertig, musterloesung, polyKoef, polyBaum, regelFuer, schoen, summanden, tex,
} from "./regelwerkKern.js";
import { falscheOptionen, uebenSchritt } from "./uebenKern.js";

/* ---------- Bausteine (dieselben Knoten wie in regelwerkKern.js) ---------- */
const num = (v) => ({ k: "num", v });
const X = { k: "x" };
const add = (a, b) => ({ k: "+", a, b });
const sub = (a, b) => ({ k: "-", a, b });
const mul = (a, b) => ({ k: "*", a, b });
const div = (a, b) => ({ k: "/", a, b });
const pow = (a, b) => ({ k: "^", a, b });
const neg = (a) => ({ k: "neg", a });
const fn = (n, a) => ({ k: "fn", n, a });
const E = { k: "e" };
const endlich = (y) => typeof y === "number" && Number.isFinite(y);
const istX = (n) => !!n && n.k === "x";
const istNull = (n) => !!n && !hatX(n) && Math.abs(auswerter(n)(1)) < 1e-12;
const c = (p, i) => p[i];
/* Term als Klartext für Hinweise (TeX ohne Befehle: \frac → /, \cdot → ·, Klammern der Exponenten weg) */
const mt = (n) => {
  let t;
  try { t = tex(n); } catch (e) { return "…"; }
  return t.replace(/\\cdot/g, "·").replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)").replace(/\\(sin|cos|ln|sqrt|tan)/g, "$1")
    .replace(/\^\{([^{}]*)\}/g, "^$1").replace(/[{}]/g, "").replace(/\\,/g, " ").replace(/\s+/g, " ").trim();
};
/* Negativ als Polynom, wenn möglich (−(6x − 4) → −6x + 4) */
const negativ = (n) => { const p = polyKoef(n); return p ? polyBaum(p.map((v) => -v)) : neg(n); };

/* Option aus einem Baum: Schönschreiben, TeX; unlesbare Bäume → null */
export function option(baum) {
  if (!baum) return null;
  let s;
  try { s = schoen(baum); } catch (e) { s = baum; }
  let t;
  try { t = tex(s); } catch (e) { return null; }
  if (!t || /NaN|undefined|Infinity/.test(t)) return null;
  return { tex: t, baum: s };
}
const lesbar = (w) => {
  if (!w || !w.baum || !w.tex) return false;
  try {
    const g = auswerter(w.baum);
    return STELLEN.filter((x) => endlich(g(x))).length >= 4;
  } catch (e) { return false; }
};
const schluessel = (w) => w.tex;
/* Prüfung wie in Lernen: numerisch gleichwertig zum Soll */
const pruefer = (soll) => (w) => ({ ok: gleichwertig(w.baum, soll), hinweis: "" });

/* Kandidat { baum, hinweis, art } → { wert, hinweis, art } (unlesbare fallen weg) */
const kandidaten = (liste) => liste
  .filter((k) => k && k.baum)
  .map((k) => ({ wert: option(k.baum), hinweis: k.hinweis, art: k.art }))
  .filter((k) => k.wert);

/* ---------- Typische Fehler beim Ableiten EINES Terms g ---------- */
/* name: wie der Term heißt (u, v, f, f′ …), ziel: wie die Ableitung heißt (u′, v′, f′, f″ …) */
export function fehlerAbleitung(g, name = "f", ziel = `${name}′`) {
  const k = [];
  if (!g) return k;
  const g1 = ableitung(g);
  const strich = (s) => `${s}(x)`;
  // Reihenfolge = Vorrang bei gleicher Zeile: erst die Fehler der nötigen Regel (genauester Hinweis),
  // dann Grundfunktionen und Potenzregel, zuletzt die allgemeinen Fehler.
  const r = regelFuer(g);
  if (r && ["produkt", "quotient", "reziprok", "linkette", "kette"].includes(r.art)) {
    for (const [baum, hinweis] of fehlerbilder(r.art, r.art === "reziprok" ? null : r.u, r.v)) k.push({ art: `regel-${r.art}`, baum, hinweis });
  }

  const teile = summanden(g);
  const p = polyKoef(g);
  if (teile.length >= 2) {
    // Konstanter Summand bleibt stehen
    const konst = teile.filter((t) => !hatX(t));
    const mitX = teile.filter((t) => hatX(t));
    if (konst.length && mitX.length) {
      let b = null;
      for (const t of [...mitX.map((t) => ableitung(t)), ...konst]) b = b ? add(b, t) : t;
      // Die unvereinfachte Form steht im Hinweis – die Karte zeigt die Zeile zusammengefasst (6 − 4 → 2)
      k.push({ art: "konstante-bleibt", baum: b, hinweis: `Eine Zahl ohne x fällt beim Ableiten weg (Ableitung 0) – hier steht sie noch: ${mt(b)}.` });
    }
    // Nur der erste Summand abgeleitet
    if (mitX.length >= 2) {
      let b = null;
      teile.forEach((t, i) => { const s = i === 0 ? ableitung(t) : t; b = b ? add(b, s) : s; });
      k.push({ art: "nur-erster", baum: b, hinweis: `Nur der erste Summand ist abgeleitet (${mt(b)}) – jeder Summand wird abgeleitet.` });
    }
  }
  if (p && p.length >= 2) {
    // Potenzregel-Fehler auf dem ganzen Polynom
    const bleibt = p.map((c, i) => (i === 0 ? 0 : c * i));                 // Exponent nicht verringert: c·i·xⁱ
    const faktor = p.slice(1);                                               // Faktor i vergessen: c·xⁱ⁻¹
    const grad = p.length - 1;
    if (grad >= 2) {
      k.push({ art: "exponent-bleibt", baum: polyBaum(bleibt), hinweis: "Potenzregel: Der Exponent wird um 1 kleiner – aus xⁿ wird n · xⁿ⁻¹." });
      if (p.some((c, i) => i >= 2 && Math.abs(c) > 1e-12)) k.push({ art: "faktor-fehlt", baum: polyBaum(faktor), hinweis: "Potenzregel: Der alte Exponent kommt als Faktor nach vorn – (xⁿ)′ = n · xⁿ⁻¹." });
    }
    // Zahlfaktor vergessen: (3x²)′ = 3 · 2x, nicht 2x
    const ohneKoef = p.map((c, i) => (i === 0 ? 0 : (Math.abs(c) > 1e-12 ? Math.sign(c) : 0) * i)).slice(1);
    const iK = p.map((c, i) => i).reverse().find((i) => i >= 1 && Math.abs(c(p, i)) > 1e-12 && Math.abs(Math.abs(c(p, i)) - 1) > 1e-12);
    if (iK !== undefined) {
      const term = polyBaum(p.map((c0, i) => (i === iK ? c0 : 0)));
      k.push({ art: "koef-weg", baum: polyBaum(ohneKoef), hinweis: `Der Zahlfaktor bleibt beim Ableiten stehen: (${mt(term)})′ = ${mt(ableitung(term))}, nicht ${mt(ableitung(polyBaum(p.map((c0, i) => (i === iK ? Math.sign(c0) : 0)))))}.` });
    }
  }
  // Grundfunktionen (auch mit Minus davor: −sin(x))
  const kern = teile.length === 1 ? g : null;
  if (kern) {
    const f = kern.k === "neg" ? kern.a : kern;
    const innen = (m) => (m && m.k === "fn" ? m.a : null);
    const fname = (m) => (m && m.k === "fn" ? m.n : m && m.k === "^" && m.a.k === "e" ? "exp" : null);
    const a = innen(f);
    if (fname(f) === "sin" && a) k.push({ art: "sin-minus", baum: neg(fn("cos", a)), hinweis: "(sin x)′ = cos x – ohne Minus. Das Minus gehört zu (cos x)′ = −sin x." });
    if (fname(f) === "cos" && a) k.push({ art: "cos-plus", baum: fn("sin", a), hinweis: "(cos x)′ = −sin x – das Minus fehlt." });
    if (fname(f) === "exp" && istX(f.b)) k.push({ art: "e-potenz", baum: mul(X, pow(E, sub(X, num(1)))), hinweis: "Die Potenzregel gilt nur für xⁿ – eˣ bleibt beim Ableiten eˣ." });
    if (fname(f) === "ln" && a && istX(a)) k.push({ art: "ln-falsch", baum: div(num(1), pow(X, num(2))), hinweis: "(ln x)′ = 1/x. Du hast 1/x noch einmal abgeleitet." });
    if (fname(f) === "sqrt" && a && istX(a)) {
      k.push({ art: "wurzel-halb", baum: div(num(1), fn("sqrt", X)), hinweis: "Der Faktor ½ fehlt: √x = x^½, also (√x)′ = ½ · x^(−½) = 1/(2√x)." });
      k.push({ art: "wurzel-faktor", baum: div(fn("sqrt", X), num(2)), hinweis: "Der Exponent wird um 1 kleiner: aus x^½ wird ½ · x^(−½), nicht ½ · x^½." });
    }
    // 1/xⁿ: Vorzeichen des negativen Exponenten
    if (f.k === "/" && !hatX(f.a) && f.b && (istX(f.b) || (f.b.k === "^" && istX(f.b.a) && f.b.b.k === "num"))) {
      const n = istX(f.b) ? 1 : f.b.b.v;
      k.push({ art: "negexp-vorzeichen", baum: neg(ableitung(f)), hinweis: `1/xⁿ = x⁻ⁿ – beim Ableiten kommt −${n} nach vorn, das Minus bleibt.` });
    }
  }
  // Allgemein: nicht abgeleitet, Vorzeichen, zweimal abgeleitet
  k.push({ art: "nicht-abgeleitet", baum: g, hinweis: `Das ist ${strich(name)} selbst – du hast noch nicht abgeleitet.` });
  if (!istNull(g1)) k.push({ art: "vorzeichen", baum: negativ(g1), hinweis: "Alle Vorzeichen sind gedreht – prüfe, wo ein Minus verloren gegangen ist." });
  if (hatX(g1)) k.push({ art: "zweimal", baum: ableitung(g1), hinweis: `Zweimal abgeleitet – gesucht ist ${strich(ziel)}, also nur eine Ableitung von ${strich(name)}.` });
  return k;
}

/* ---------- Fragen ---------- */
const FRAGE = {
  u1: (kette) => (kette ? "Leite die äußere Funktion u ab (in x geschrieben)." : "Leite u ab."),
  uv: () => "Setz die innere Funktion v(x) in u′ ein.",
  v1: (kette) => (kette ? "Leite die innere Funktion v ab." : "Leite v ab."),
  f1: (kette, art) => `Wende die ${REGELN[art].name} an: Welche Zeile ist f′(x)?`,
};
const LABEL = { u1: "u′(x) =", uv: "u′(v(x)) =", v1: "v′(x) =", f1: "f′(x) =" };

/* ---------- Der Weg in der Werkstatt ---------- */
/* auf = { regel (wirksame Regel), u (Baum | null), v (Baum) } */
export function uebenWegWerkstatt(auf, zufall = Math.random) {
  const art = auf.regel, u = auf.u || null, v = auf.v;
  if (!v || !hatX(v)) return [];
  const mitU = art !== "reziprok";
  if (mitU && (!u || !hatX(u))) return [];
  const kette = art === "kette" || art === "linkette";
  const ml = musterloesung(art, u, v);
  const schritte = [];
  const dazu = (id, richtigBaum, kand) => {
    const richtig = option(richtigBaum);
    if (!richtig) return;
    const soll = richtigBaum;
    const falsche = falscheOptionen(richtig, kandidaten(kand), { pruefe: pruefer(soll), schluessel, lesbar, max: 3, zufall });
    schritte.push(uebenSchritt({ art: id, label: LABEL[id], frage: FRAGE[id](kette, art), richtig, falsche, schluessel, zufall }));
  };
  if (mitU) {
    const k = fehlerAbleitung(u, "u");
    k.push({ art: "v-statt-u", baum: ableitung(v), hinweis: "Das ist v′(x) – gesucht ist die Ableitung von u." });
    dazu("u1", ml.u1, k);
  }
  if (kette) {
    const u1 = ableitung(u), v1 = ableitung(v);
    dazu("uv", ml.uv, [
      { art: "nicht-eingesetzt", baum: u1, hinweis: "Das ist u′(x) – setze noch die innere Funktion v(x) für x ein." },
      { art: "nicht-abgeleitet", baum: einsetzen(u, v), hinweis: "Das ist u(v(x)) – u muss erst abgeleitet werden, dann wird v(x) eingesetzt." },
      { art: "v-strich-eingesetzt", baum: einsetzen(u1, v1), hinweis: "Eingesetzt wird die innere Funktion v(x), nicht ihre Ableitung v′(x)." },
      { art: "schon-f", baum: mul(einsetzen(u1, v), v1), hinweis: "Das ist schon f′(x). Hier steht nur u′ an der Stelle v(x) – ohne die innere Ableitung." },
    ]);
  }
  {
    const k = fehlerAbleitung(v, "v");
    if (mitU) k.push({ art: "u-statt-v", baum: ableitung(u), hinweis: "Das ist u′(x) – gesucht ist die Ableitung von v." });
    dazu("v1", ml.v1, k);
  }
  {
    const k = fehlerbilder(art, u, v).map(([baum, hinweis]) => ({ art: "regel", baum, hinweis }));
    k.push({ art: "vorzeichen", baum: negativ(ml.ergebnis), hinweis: "Fast! Das Vorzeichen ist gedreht – prüfe, wo ein Minus verloren gegangen ist." });
    if (kette) k.push({ art: "nur-aussen", baum: ml.uv, hinweis: "Die innere Ableitung fehlt: f′(x) = u′(v(x)) · v′(x)." });
    if (art === "produkt") k.push({ art: "nur-u1v1", baum: add(ableitung(u), ableitung(v)), hinweis: "Ein Produkt wird nicht summandenweise abgeleitet: (u · v)′ = u′ · v + u · v′." });
    dazu("f1", ml.ergebnis, k);
  }
  return schritte;
}

/* ---------- Eigene Funktion: f′, f″, f‴ ---------- */
const NAMEN = ["f", "f′", "f″", "f‴"];
/* [f, f′, f″, f‴] als Bäume (wie die Kette in func13) */
export function ableitungsKette(f) {
  const l = [f];
  for (let i = 1; i <= 3; i++) l.push(ableitung(l[i - 1]));
  return l;
}
export function uebenWegEigen(kette, zufall = Math.random) {
  // kette = [f, f′, f″, f‴] als Bäume
  const schritte = [];
  for (let st = 1; st <= 3 && st < kette.length; st++) {
    const soll = kette[st];
    const richtig = option(soll);
    if (!richtig) break;
    const kand = fehlerAbleitung(kette[st - 1], NAMEN[st - 1], NAMEN[st]);
    const falsche = falscheOptionen(richtig, kandidaten(kand), { pruefe: pruefer(soll), schluessel, lesbar, max: 3, zufall });
    schritte.push(uebenSchritt({ art: "abl", stufe: st, label: `${NAMEN[st]}(x) =`, frage: `Leite ${NAMEN[st - 1]}(x) ab.`, richtig, falsche, schluessel, zufall }));
  }
  return schritte;
}
