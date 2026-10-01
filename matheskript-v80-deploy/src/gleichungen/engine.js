/* ---------- Gleichungslöser · Rechenkern ----------
   Ein kleines Computeralgebra-System für Schulgleichungen. Der Schüler sagt,
   WAS auf beiden Seiten passiert (−5, :3, ln, Wurzel …), der Kern führt es
   exakt aus und vereinfacht. Gerechnet wird mit Brüchen, nicht mit Kommazahlen.

   Datenmodell
   - Summe  = Array von Termen (kanonisch sortiert, gleichartige zusammengefasst)
   - Term   = { k: Bruch, f: [Faktor] }
   - Faktor = { a: Atom, e: Bruch }                       (Atom hoch e)
   - Atom   = { t: "x" }
            | { t: "sum", s: Summe }                        z. B. (x − 3)
            | { t: "num", v: Bruch }                        nur für √2 u. ä.
            | { t: "exp", b: Basis, a: Summe }              b^a, Basis "e" oder Bruch
            | { t: "log", b: Basis, a: Summe }              log_b(a)
   Klammern wie 2(x − 3) bleiben stehen, bis der Schüler ausmultipliziert oder
   durch 2 teilt — genau wie im Heft. */

export class Fehler extends Error {}
export class Undefiniert extends Error {}

/* ---------- Brüche ---------- */

const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const sicher = (n) => {
  if (!Number.isSafeInteger(n)) throw new Fehler("Die Zahlen werden zu groß für den Gleichungslöser.");
  return n;
};

export function R(n, d = 1) {
  if (d === 0) throw new Fehler("Durch 0 kann man nicht teilen.");
  sicher(n); sicher(d);
  if (d < 0) { n = -n; d = -d; }
  const g = ggT(n, d);
  return { n: n / g, d: d / g };
}
const EINS = R(1), NULL = R(0), HALB = R(1, 2);
const radd = (a, b) => R(sicher(a.n * b.d + b.n * a.d), sicher(a.d * b.d));
const rsub = (a, b) => radd(a, rneg(b));
const rmul = (a, b) => R(sicher(a.n * b.n), sicher(a.d * b.d));
const rdiv = (a, b) => { if (b.n === 0) throw new Fehler("Durch 0 kann man nicht teilen."); return R(sicher(a.n * b.d), sicher(a.d * b.n)); };
const rneg = (a) => ({ n: -a.n, d: a.d });
const rabs = (a) => ({ n: Math.abs(a.n), d: a.d });
const rnull = (a) => a.n === 0;
const reins = (a) => a.n === 1 && a.d === 1;
const rganz = (a) => a.d === 1;
const rgleich = (a, b) => a.n === b.n && a.d === b.d;
const rwert = (a) => a.n / a.d;
const rs = (a) => (a.d === 1 ? `${a.n}` : `${a.n}/${a.d}`);
function rpow(a, m) {
  if (m === 0) return EINS;
  if (m < 0) { if (a.n === 0) throw new Fehler("Durch 0 kann man nicht teilen."); return rpow(R(a.d, a.n), -m); }
  let n = 1, d = 1;
  for (let i = 0; i < m; i++) { n = sicher(n * a.n); d = sicher(d * a.d); }
  return R(n, d);
}

/* Zerlegt n in s² · rest mit quadratfreiem rest. */
function quadratAbspalten(n) {
  let s = 1, rest = n;
  for (let p = 2; p * p <= rest; p++) while (rest % (p * p) === 0) { rest /= p * p; s *= p; }
  return [s, rest];
}

/* Gibt m zurück, falls r = b^m mit kleinem rationalem m, sonst null. */
function potenzVon(r, b) {
  const rv = rwert(r), bv = rwert(b);
  if (rv <= 0 || bv <= 0 || bv === 1) return null;
  const m = Math.log(rv) / Math.log(bv);
  for (let q = 1; q <= 6; q++) {
    const p = Math.round(m * q);
    if (Math.abs(m * q - p) > 1e-9) continue;
    try { if (rgleich(rpow(b, p), rpow(r, q))) return R(p, q); } catch (e) { return null; }
  }
  return null;
}

/* ---------- Basen, Schlüssel ---------- */

const baseKey = (b) => (b === "e" ? "e" : rs(b));
const baseEq = (a, b) => baseKey(a) === baseKey(b);
const baseWert = (b) => (b === "e" ? Math.E : rwert(b));

function akey(a) {
  switch (a.t) {
    case "x": return "x";
    case "sum": return `(${skey(a.s)})`;
    case "num": return `#${rs(a.v)}`;
    case "exp": return `E${baseKey(a.b)}[${skey(a.a)}]`;
    case "log": return `L${baseKey(a.b)}[${skey(a.a)}]`;
    default: return "?";
  }
}
const fkey = (f) => `${akey(f.a)}^${rs(f.e)}`;
const tkey = (t) => t.f.map(fkey).join("*");
export const skey = (S) => S.map((t) => `${rs(t.k)}:${tkey(t)}`).join("+");

export function atomHatX(a) {
  switch (a.t) {
    case "x": return true;
    case "num": return false;
    case "sum": return hatX(a.s);
    default: return hatX(a.a);
  }
}
export const termHatX = (t) => t.f.some((f) => atomHatX(f.a));
export const hatX = (S) => S.some(termHatX);

/* Rationale Zahl, falls die Summe eine reine Zahl ist, sonst null. */
function alsBruch(S) {
  if (S.length === 0) return NULL;
  if (S.length === 1 && S[0].f.length === 0) return S[0].k;
  return null;
}

/* ---------- Normalisieren ---------- */

function normTerm(k, faktoren) {
  if (rnull(k)) return null;
  const queue = [...faktoren];
  const map = new Map();
  const exps = new Map();
  const extra = [];
  const hinzu = (a, e) => {
    const key = akey(a);
    if (map.has(key)) map.get(key).e = radd(map.get(key).e, e);
    else map.set(key, { a, e });
  };

  while (queue.length) {
    const { a, e } = queue.shift();
    if (rnull(e)) continue;
    switch (a.t) {
      case "x": hinzu(a, e); break;
      case "num": {
        if (rganz(e)) { k = rmul(k, rpow(a.v, e.n)); break; }
        if (a.v.n < 0) throw new Undefiniert("Die Wurzel aus einer negativen Zahl ist nicht definiert.");
        if (e.d === 2) {
          const ganz = Math.floor(e.n / 2);
          k = rmul(k, rpow(a.v, ganz));
          const [s, rest] = quadratAbspalten(sicher(a.v.n * a.v.d));
          k = rmul(k, R(s, a.v.d));
          if (rest !== 1) hinzu({ t: "num", v: R(rest) }, HALB);
          break;
        }
        hinzu(a, e);
        break;
      }
      case "exp": {
        const bk = baseKey(a.b);
        const skaliert = reins(e) ? a.a : sSkal(a.a, e);
        if (exps.has(bk)) exps.get(bk).a = sAdd(exps.get(bk).a, skaliert);
        else exps.set(bk, { b: a.b, a: skaliert });
        break;
      }
      case "log": {
        const r = alsBruch(a.a);
        if (r !== null) {
          if (r.n <= 0) throw new Undefiniert(`${logName(a.b)}(${rs(r)}) ist nicht definiert — der Logarithmus braucht eine positive Zahl.`);
          if (reins(r)) { if (e.n > 0) return null; throw new Fehler("Durch 0 kann man nicht teilen."); }
          const m = a.b === "e" ? null : potenzVon(r, a.b);
          if (m !== null && rganz(e)) {
            if (rnull(m)) { if (e.n > 0) return null; throw new Fehler("Durch 0 kann man nicht teilen."); }
            k = rmul(k, rpow(m, e.n));
            break;
          }
        }
        // log_b(b^A) = A
        const arg = a.a;
        if (arg.length === 1 && reins(arg[0].k) && arg[0].f.length === 1 && arg[0].f[0].a.t === "exp"
          && baseEq(arg[0].f[0].a.b, a.b) && reins(arg[0].f[0].e)) {
          queue.push({ a: { t: "sum", s: arg[0].f[0].a.a }, e });
          break;
        }
        hinzu(a, e);
        break;
      }
      case "sum": {
        const s = a.s;
        if (s.length === 0) { if (e.n > 0) return null; throw new Fehler("Durch 0 kann man nicht teilen."); }
        if (s.length === 1) {
          const t = s[0];
          if (rganz(e)) k = rmul(k, rpow(t.k, e.n));
          else {
            if (t.k.n < 0) throw new Undefiniert("Die Wurzel aus einer negativen Zahl ist nicht definiert.");
            if (!reins(t.k)) queue.push({ a: { t: "num", v: t.k }, e });
          }
          for (const f of t.f) queue.push({ a: f.a, e: rmul(f.e, e) });
          break;
        }
        hinzu(a, e);
        break;
      }
      default: break;
    }
  }

  for (const { b, a } of exps.values()) {
    if (a.length === 0) continue;
    let rest = a;
    if (!hatX(a)) {
      const bleib = [];
      for (const t of a) {
        if (t.f.length === 0 && b !== "e" && rganz(t.k)) { k = rmul(k, rpow(b, t.k.n)); continue; }
        if (t.f.length === 1 && t.f[0].a.t === "log" && baseEq(t.f[0].a.b, b) && reins(t.f[0].e) && rganz(t.k)) {
          const C = alsBruch(t.f[0].a.a);
          if (C) { k = rmul(k, rpow(C, t.k.n)); continue; }
        }
        bleib.push(t);
      }
      rest = bleib;
      if (rest.length === 0) continue;
      if (b !== "e" && rest.length === 1 && rest[0].f.length === 0) { extra.push({ a: { t: "num", v: b }, e: rest[0].k }); continue; }
    } else if (a.length === 1 && a[0].f.length === 1 && a[0].f[0].a.t === "log" && baseEq(a[0].f[0].a.b, b) && reins(a[0].f[0].e)) {
      // b^(m·log_b(A)) = A^m
      extra.push({ a: { t: "sum", s: a[0].f[0].a.a }, e: a[0].k });
      continue;
    }
    hinzu({ t: "exp", b, a: rest }, EINS);
  }

  if (extra.length) return normTerm(k, [...[...map.values()].filter((f) => !rnull(f.e)), ...extra]);

  // log_b(r1) / log_b(r2) mit r1 = r2^m  →  m
  const logs = [...map.values()].filter((f) => f.a.t === "log" && alsBruch(f.a.a) !== null);
  for (const oben of logs) {
    if (!reins(oben.e)) continue;
    for (const unten of logs) {
      if (unten.e.n !== -1 || unten.e.d !== 1 || !baseEq(oben.a.b, unten.a.b)) continue;
      const m = potenzVon(alsBruch(oben.a.a), alsBruch(unten.a.a));
      if (m) { k = rmul(k, m); oben.e = NULL; unten.e = NULL; break; }
    }
  }

  const f = [...map.values()].filter((x) => !rnull(x.e)).sort((p, q) => (akey(p.a) < akey(q.a) ? -1 : akey(p.a) > akey(q.a) ? 1 : 0));
  return { k, f };
}

function sumGrad(S) {
  let g = 0;
  for (const t of S) {
    let d = 0;
    for (const f of t.f) if (f.a.t === "x") d += rwert(f.e); else if (f.a.t === "sum" && hatX(f.a.s)) d += rwert(f.e) * sumGrad(f.a.s);
    g = Math.max(g, d);
  }
  return g;
}

function rang(t, mitX) {
  if (!termHatX(t)) {
    const zahl = t.f.length === 0;
    return mitX ? [2, zahl ? 1 : 0] : [0, zahl ? 0 : 1];
  }
  const nichtPoly = t.f.some((f) => (f.a.t === "exp" || f.a.t === "log") && atomHatX(f.a));
  if (nichtPoly) {
    // e^(2x) vor e^x: nach dem x-Koeffizienten im Exponenten
    let m = 0;
    for (const f of t.f) if (f.a.t === "exp" && atomHatX(f.a)) for (const u of f.a.a) if (u.f.some((g) => g.a.t === "x")) m = Math.max(m, rwert(u.k));
    return [0, -m];
  }
  let grad = 0;
  for (const f of t.f) if (f.a.t === "x") grad += rwert(f.e); else if (f.a.t === "sum" && hatX(f.a.s)) grad += rwert(f.e) * sumGrad(f.a.s);
  return mitX ? [nichtPoly ? 0 : 1, -grad] : [1, -grad];
}

function logFalten(terme) {
  const gruppen = new Map();
  terme.forEach((t, i) => {
    if (t.f.length === 1 && t.f[0].a.t === "log" && reins(t.f[0].e) && rganz(t.k) && alsBruch(t.f[0].a.a) !== null) {
      const bk = baseKey(t.f[0].a.b);
      if (!gruppen.has(bk)) gruppen.set(bk, []);
      gruppen.get(bk).push(i);
    }
  });
  let geaendert = false;
  const weg = new Set();
  const neu = [];
  for (const idx of gruppen.values()) {
    if (idx.length < 2) continue;
    let P = EINS;
    const b = terme[idx[0]].f[0].a.b;
    for (const i of idx) { P = rmul(P, rpow(alsBruch(terme[i].f[0].a.a), terme[i].k.n)); weg.add(i); }
    const nt = normTerm(EINS, [{ a: { t: "log", b, a: zahlSumme(P) }, e: EINS }]);
    if (nt) neu.push(nt);
    geaendert = true;
  }
  if (!geaendert) return null;
  return [...terme.filter((_, i) => !weg.has(i)), ...neu];
}

export function normSum(terme) {
  const flach = [];
  for (const t of terme) {
    const nt = normTerm(t.k, t.f);
    if (!nt) continue;
    if (nt.f.length === 1 && nt.f[0].a.t === "sum" && reins(nt.f[0].e) && reins(nt.k)) { flach.push(...nt.f[0].a.s); continue; }
    flach.push(nt);
  }
  const map = new Map();
  for (const t of flach) {
    const key = tkey(t);
    if (map.has(key)) map.get(key).k = radd(map.get(key).k, t.k);
    else map.set(key, { k: t.k, f: t.f });
  }
  let res = [...map.values()].filter((t) => !rnull(t.k));
  const gefaltet = logFalten(res);
  if (gefaltet) return normSum(gefaltet);
  const mitX = res.some(termHatX);
  res.sort((p, q) => {
    const a = rang(p, mitX), b = rang(q, mitX);
    if (a[0] !== b[0]) return a[0] - b[0];
    if (a[1] !== b[1]) return a[1] - b[1];
    const ka = tkey(p), kb = tkey(q);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
  return res;
}

/* ---------- Grundrechenarten auf Summen ---------- */

export const zahlSumme = (r) => (rnull(r) ? [] : [{ k: r, f: [] }]);
const X_SUMME = [{ k: EINS, f: [{ a: { t: "x" }, e: EINS }] }];
const E_SUMME = [{ k: EINS, f: [{ a: { t: "exp", b: "e", a: zahlSumme(EINS) }, e: EINS }] }];

export const sAdd = (A, B) => normSum([...A, ...B]);
export const sNeg = (A) => A.map((t) => ({ k: rneg(t.k), f: t.f }));
export const sSub = (A, B) => sAdd(A, sNeg(B));
export const sSkal = (A, q) => normSum(A.map((t) => ({ k: rmul(t.k, q), f: t.f })));
const tMul = (a, b) => ({ k: rmul(a.k, b.k), f: [...a.f, ...b.f] });
const sumAtom = (S, e = EINS) => ({ a: { t: "sum", s: S }, e });

/* Produkt, ohne Klammern aufzulösen: 2·(x − 3) bleibt 2(x − 3). */
function sMul(A, B) {
  if (A.length === 0 || B.length === 0) return [];
  if (A.length === 1 && B.length === 1) return normSum([tMul(A[0], B[0])]);
  if (A.length === 1) return normSum([{ k: A[0].k, f: [...A[0].f, sumAtom(B)] }]);
  if (B.length === 1) return normSum([{ k: B[0].k, f: [...B[0].f, sumAtom(A)] }]);
  return normSum([{ k: EINS, f: [sumAtom(A), sumAtom(B)] }]);
}

/* Eine ganze Gleichungsseite mit einem Term multiplizieren — Summand für Summand. */
const seiteMal = (S, t) => normSum(S.map((u) => tMul(u, t)));

function kehrTerm(t) {
  if (rnull(t.k)) throw new Fehler("Durch 0 kann man nicht teilen.");
  return { k: rdiv(EINS, t.k), f: t.f.map((f) => ({ a: f.a, e: rneg(f.e) })) };
}

function sPow(B, E) {
  const n = alsBruch(E);
  if (n !== null) {
    if (B.length === 0) {
      if (n.n <= 0) throw new Fehler("0 hoch 0 oder hoch eine negative Zahl ist nicht definiert.");
      return [];
    }
    if (B.length === 1) {
      const t = B[0];
      if (!rganz(n) && t.k.n < 0) throw new Undefiniert("Die Wurzel aus einer negativen Zahl ist nicht definiert.");
      return normSum([{ k: EINS, f: [sumAtom(B, n)] }]);
    }
    return normSum([{ k: EINS, f: [sumAtom(B, n)] }]);
  }
  // Exponent mit x (oder irrational): feste Basis nötig
  const b = alsBruch(B);
  if (b !== null) {
    if (b.n <= 0) throw new Fehler("Bei Exponentialfunktionen muss die Basis positiv sein.");
    if (reins(b)) return zahlSumme(EINS);
    return normSum([{ k: EINS, f: [{ a: { t: "exp", b, a: E }, e: EINS }] }]);
  }
  if (B.length === 1 && reins(B[0].k) && B[0].f.length === 1 && B[0].f[0].a.t === "exp" && reins(B[0].f[0].e)) {
    const ex = B[0].f[0].a;
    return normSum([{ k: EINS, f: [{ a: { t: "exp", b: ex.b, a: sMul(ex.a, E) }, e: EINS }] }]);
  }
  throw new Fehler("Steht x im Exponenten, muss die Basis eine feste Zahl sein (z. B. 2^x oder e^x).");
}

export function ausmultiplizieren(S) {
  const erg = [];
  for (const t of S) {
    let teil = [{ k: t.k, f: [] }];
    for (const f of t.f) {
      if (f.a.t === "sum" && rganz(f.e) && f.e.n > 0) {
        const innen = ausmultiplizieren(f.a.s);
        for (let i = 0; i < f.e.n; i++) teil = teil.flatMap((a) => innen.map((b) => tMul(a, b)));
      } else teil = teil.map((u) => ({ k: u.k, f: [...u.f, f] }));
    }
    erg.push(...teil);
  }
  return normSum(erg);
}

/* Koeffizienten [c0, c1, c2, …], falls die (ausmultiplizierte) Summe ein Polynom in x ist. */
export function polyKoeff(S) {
  const koeff = [];
  for (const t of ausmultiplizieren(S)) {
    let grad = 0;
    for (const f of t.f) {
      if (f.a.t !== "x" || !rganz(f.e) || f.e.n < 0) return null;
      grad += f.e.n;
    }
    while (koeff.length <= grad) koeff.push(NULL);
    koeff[grad] = radd(koeff[grad], t.k);
  }
  while (koeff.length && rnull(koeff[koeff.length - 1])) koeff.pop();
  return koeff;
}

/* ---------- Auswerten ---------- */

function atomWert(a, x) {
  switch (a.t) {
    case "x": return x;
    case "num": return rwert(a.v);
    case "sum": return wert(a.s, x);
    case "exp": return Math.pow(baseWert(a.b), wert(a.a, x));
    case "log": { const v = wert(a.a, x); return v > 0 ? Math.log(v) / Math.log(baseWert(a.b)) : NaN; }
    default: return NaN;
  }
}
export function wert(S, x = 0) {
  let s = 0;
  for (const t of S) {
    let p = rwert(t.k);
    for (const f of t.f) {
      const v = atomWert(f.a, x), e = rwert(f.e);
      if (e < 0 && v === 0) return NaN;
      p *= Math.pow(v, e);
    }
    s += p;
  }
  return s;
}

/* ---------- Parser ---------- */

const TIEF = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };

function normText(s) {
  return String(s)
    .replace(/[−–—]/g, "-")
    .replace(/[·⋅×∙•]/g, "*")
    .replace(/[:÷]/g, "/")
    .replace(/,/g, ".")
    .replace(/[₀-₉]/g, (z) => `_${TIEF[z]}`)
    .replace(/_(_)/g, "_")
    .replace(/sqrt|wurzel/gi, "√")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function zerlegen(s) {
  const tok = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const text = s.slice(i, j);
      if ((text.match(/\./g) || []).length > 1 || text === ".") throw new Fehler(`„${text}“ ist keine Zahl.`);
      tok.push({ t: "zahl", v: text });
      i = j;
    } else if (s.startsWith("ln", i)) { tok.push({ t: "fn", b: "e" }); i += 2; }
    else if (s.startsWith("lg", i)) { tok.push({ t: "fn", b: R(10) }); i += 2; }
    else if (s.startsWith("log", i)) {
      i += 3;
      let base = "10";
      const m = /^_?\{?(\d+)\}?/.exec(s.slice(i));
      if (m && (s[i] === "_" || s[i + m[0].length] === "(")) { base = m[1]; i += m[0].length; }
      const b = R(parseInt(base, 10));
      if (b.n < 2) throw new Fehler("Die Basis eines Logarithmus muss eine Zahl größer als 1 sein.");
      tok.push({ t: "fn", b });
    } else if (c === "x") { tok.push({ t: "x" }); i++; }
    else if (c === "e") { tok.push({ t: "e" }); i++; }
    else if (c === "π") throw new Fehler("π kann der Gleichungslöser noch nicht.");
    else if ("+-*/^()√".includes(c)) { tok.push({ t: c }); i++; }
    else if (c === "²" || c === "³") { tok.push({ t: "hoch", v: c === "²" ? 2 : 3 }); i++; }
    else if (c === "[" || c === "{") { tok.push({ t: "(" }); i++; }
    else if (c === "]" || c === "}") { tok.push({ t: ")" }); i++; }
    else throw new Fehler(`Das Zeichen „${c}“ kenne ich nicht.`);
  }
  return tok;
}

function zahlLesen(text) {
  if (!text.includes(".")) return R(parseInt(text, 10));
  const [g, n] = text.split(".");
  return R(parseInt((g || "0") + n, 10), 10 ** n.length);
}

export function ausdruckLesen(eingabe) {
  const tok = zerlegen(normText(eingabe));
  if (!tok.length) throw new Fehler("Da steht noch nichts.");
  let p = 0;
  const sieh = () => tok[p];
  const nimm = (t) => { if (!tok[p] || tok[p].t !== t) throw new Fehler(t === ")" ? "Eine Klammer wird nicht geschlossen." : `Erwartet: ${t}`); return tok[p++]; };
  const startetPrimaer = (t) => t && ["zahl", "x", "e", "fn", "(", "√"].includes(t.t);

  function summe() {
    let s = produkt();
    while (sieh() && (sieh().t === "+" || sieh().t === "-")) {
      const op = tok[p++].t;
      const r = produkt();
      s = op === "+" ? sAdd(s, r) : sSub(s, r);
    }
    return s;
  }
  function produkt() {
    let s = vorzeichen();
    for (;;) {
      const t = sieh();
      if (t && t.t === "*") { p++; s = sMul(s, vorzeichen()); }
      else if (t && t.t === "/") { p++; s = teilen(s, vorzeichen()); }
      else if (startetPrimaer(t)) s = sMul(s, potenz());
      else return s;
    }
  }
  function vorzeichen() {
    const t = sieh();
    if (t && t.t === "-") { p++; return sNeg(vorzeichen()); }
    if (t && t.t === "+") { p++; return vorzeichen(); }
    return potenz();
  }
  function potenz() {
    const basis = nachgestellt();
    if (sieh() && sieh().t === "^") { p++; return sPow(basis, vorzeichen()); }
    return basis;
  }
  function nachgestellt() {
    let s = primaer();
    while (sieh() && sieh().t === "hoch") s = sPow(s, zahlSumme(R(tok[p++].v)));
    return s;
  }
  function primaer() {
    const t = tok[p];
    if (!t) throw new Fehler("Der Ausdruck hört mittendrin auf.");
    p++;
    switch (t.t) {
      case "zahl": return zahlSumme(zahlLesen(t.v));
      case "x": return X_SUMME;
      case "e": return E_SUMME;
      case "(": { const s = summe(); nimm(")"); return s; }
      case "√": return sPow(nachgestellt(), zahlSumme(HALB));
      case "fn": {
        const arg = nachgestellt();
        if (arg.length === 0) throw new Undefiniert(`${logName(t.b)}(0) ist nicht definiert.`);
        return normSum([{ k: EINS, f: [{ a: { t: "log", b: t.b, a: arg }, e: EINS }] }]);
      }
      default: throw new Fehler(t.t === ")" ? "Da ist eine Klammer zu viel." : `„${t.t}“ steht an einer Stelle, an der eine Zahl oder x erwartet wird.`);
    }
  }
  const s = summe();
  if (p < tok.length) throw new Fehler(tok[p].t === ")" ? "Da ist eine Klammer zu viel." : "Der Ausdruck ist nicht vollständig lesbar.");
  return s;
}

function teilen(A, B) {
  if (B.length === 0) throw new Fehler("Durch 0 kann man nicht teilen.");
  if (B.length === 1) return sMul(A, [kehrTerm(B[0])]);
  return sMul(A, normSum([{ k: EINS, f: [sumAtom(B, R(-1))] }]));
}

export function gleichungLesen(text) {
  const teile = normText(text).split("=");
  if (teile.length !== 2 || !teile[0] || !teile[1]) throw new Fehler("Eine Gleichung braucht genau ein Gleichheitszeichen, z. B. 3x + 5 = 20.");
  const l = ausdruckLesen(teile[0]), r = ausdruckLesen(teile[1]);
  if (!hatX(l) && !hatX(r)) throw new Fehler("In der Gleichung kommt kein x vor.");
  return { l, r };
}

/* ---------- Status eines Zweigs ---------- */

const istX = (S) => S.length === 1 && reins(S[0].k) && S[0].f.length === 1 && S[0].f[0].a.t === "x" && reins(S[0].f[0].e);

export function status(z) {
  if (z.status === "keine") return z;
  const lx = hatX(z.l), rx = hatX(z.r);
  if (!lx && !rx) {
    const d = sSub(z.l, z.r);
    const v = wert(d);
    if (d.length === 0 || Math.abs(v) < 1e-12) return { ...z, status: "alle" };
    return { ...z, status: "keine", grund: "Widerspruch: Beide Seiten sind verschieden, egal was x ist." };
  }
  if (z.sub) return { ...z, status: "offen" };
  if (istX(z.l) && !rx) return { ...z, status: "geloest", wert: z.r };
  if (istX(z.r) && !lx) return { ...z, status: "geloest", wert: z.l };
  return { ...z, status: "offen" };
}

/* ---------- Bruchgleichungen ---------- */

/* Sammelt die Nenner mit x: Map akey → { a, e } (größter Exponent) */
function nennerFaktoren(S, map = new Map()) {
  for (const t of S) for (const f of t.f) {
    if (f.e.n < 0 && atomHatX(f.a)) {
      const key = akey(f.a), e = rneg(f.e), alt = map.get(key);
      if (!alt || rwert(e) > rwert(alt.e)) map.set(key, { a: f.a, e });
    }
  }
  return map;
}
export const hatXNenner = (z) => nennerFaktoren(z.r, nennerFaktoren(z.l)).size > 0;

/* Stellen, an denen ein Nenner 0 wird — sie gehören nicht zur Definitionsmenge. */
export function definitionsluecken(start) {
  const werte = [];
  for (const { a } of nennerFaktoren(start.r, nennerFaktoren(start.l)).values()) {
    const S = a.t === "x" ? X_SUMME : a.t === "sum" ? a.s : null;
    if (!S) continue;
    const k = polyKoeff(S);
    if (!k || k.length < 2) continue;
    if (k.length === 2) werte.push(zahlSumme(rdiv(rneg(k[0]), k[1])));
    else if (k.length === 3) {
      try { mitternacht({ l: S, r: [] }).zweige.filter((z) => z.status === "geloest").forEach((z) => werte.push(z.wert)); } catch (e) { /* ignorieren */ }
    }
  }
  const eindeutig = [];
  werte.forEach((w) => { if (!eindeutig.some((u) => Math.abs(wert(u) - wert(w)) < 1e-9)) eindeutig.push(w); });
  return eindeutig.sort((p, q) => wert(p) - wert(q));
}

function hauptnennerZweig(z) {
  const map = nennerFaktoren(z.r, nennerFaktoren(z.l));
  if (!map.size) throw new Fehler("Hier steht kein x im Nenner — den Hauptnenner braucht man nur bei Bruchgleichungen.");
  let zahlNenner = 1;
  for (const t of [...z.l, ...z.r]) zahlNenner = (zahlNenner * t.k.d) / ggT(zahlNenner, t.k.d);
  const hn = { k: R(zahlNenner), f: [...map.values()] };
  const l = ausmultiplizieren(seiteMal(z.l, hn)), r = ausmultiplizieren(seiteMal(z.r, hn));
  return { zweige: [status({ l, r })], hn: normSum([hn]) };
}

/* ---------- Substitution ---------- */

/* Prüft, ob sich die Gleichung mit u = x² (biquadratisch) oder u = b^(kx) in eine
   quadratische Gleichung verwandeln lässt. */
export function substInfo(z) {
  if (z.sub) return null;
  const pk = [polyKoeff(z.l), polyKoeff(z.r)];
  if (pk[0] && pk[1]) {
    const grad = Math.max(pk[0].length, pk[1].length) - 1;
    const gerade = pk.every((k) => k.every((c, i) => i % 2 === 0 || rnull(c)));
    return grad === 4 && gerade ? { art: "quad", ziel: [{ k: EINS, f: [{ a: { t: "x" }, e: R(2) }] }] } : null;
  }
  let basis = null;
  const ms = new Map();
  for (const S of [z.l, z.r]) for (const t of S) for (const f of t.f) {
    if (!atomHatX(f.a)) continue;
    if (f.a.t !== "exp" || !reins(f.e)) return null;
    const a = f.a.a;
    if (!(a.length === 1 && a[0].f.length === 1 && a[0].f[0].a.t === "x" && reins(a[0].f[0].e) && a[0].k.n > 0)) return null;
    if (basis && !baseEq(basis, f.a.b)) return null;
    basis = f.a.b;
    ms.set(rs(a[0].k), a[0].k);
  }
  if (!basis || ms.size !== 2) return null;
  const [m1, m2] = [...ms.values()].sort((p, q) => rwert(p) - rwert(q));
  if (!rgleich(m2, rmul(m1, R(2)))) return null;
  const ziel = normSum([{ k: EINS, f: [{ a: { t: "exp", b: basis, a: [{ k: m1, f: [{ a: { t: "x" }, e: EINS }] }] }, e: EINS }] }]);
  return { art: "exp", b: basis, k: m1, ziel };
}

function substZweig(z) {
  const info = substInfo(z);
  if (!info) {
    throw new Fehler(z.sub ? "Hier wurde schon substituiert. Löse nach u auf und mach dann die Rücksubstitution."
      : "Substitution hilft, wenn nur x⁴ und x² vorkommen (u = x²) oder e^(2x) und e^x (u = e^x). Das ist hier nicht der Fall.");
  }
  let l, r;
  if (info.art === "quad") {
    const neu = (k) => normSum(k.map((c, i) => ({ k: c, f: i ? [{ a: { t: "x" }, e: R(i, 2) }] : [] })).filter((t) => !rnull(t.k)));
    l = neu(polyKoeff(z.l)); r = neu(polyKoeff(z.r));
  } else {
    const ersetze = (S) => normSum(S.map((t) => ({
      k: t.k,
      f: t.f.map((f) => (f.a.t === "exp" && atomHatX(f.a) ? { a: { t: "x" }, e: rgleich(f.a.a[0].k, info.k) ? EINS : R(2) } : f)),
    })));
    l = ersetze(z.l); r = ersetze(z.r);
  }
  return { zweige: [status({ l, r, sub: { ziel: info.ziel }, var: "u" })], ziel: info.ziel };
}

function ruecksubZweig(z) {
  if (!z.sub) throw new Fehler("Hier wurde nichts substituiert — eine Rücksubstitution ist nicht nötig.");
  let wertU;
  if (istX(z.l) && !hatX(z.r)) wertU = z.r;
  else if (istX(z.r) && !hatX(z.l)) wertU = z.l;
  else throw new Fehler("Löse zuerst nach u auf (u = …). Erst dann setzt du für u wieder den ursprünglichen Term ein.");
  return [status({ l: z.sub.ziel, r: wertU })];
}

/* ---------- Umformungen ---------- */

function logVon(b, S) {
  if (S.length === 0) throw new Undefiniert(`${logName(b)}(0) ist nicht definiert.`);
  if (S.length > 1) {
    if (!hatX(S) && !(wert(S) > 0)) throw new Undefiniert(`Der ${logName(b)} einer negativen Zahl ist nicht definiert.`);
    return normSum([{ k: EINS, f: [{ a: { t: "log", b, a: S }, e: EINS }] }]);
  }
  const t = S[0];
  if (t.k.n < 0) throw new Undefiniert(`Der ${logName(b)} einer negativen Zahl ist nicht definiert.`);
  const erg = [];
  const logTerm = (arg, k = EINS) => ({ k, f: [{ a: { t: "log", b, a: arg }, e: EINS }] });
  if (!reins(t.k)) erg.push(logTerm(zahlSumme(t.k)));
  for (const f of t.f) {
    const a = f.a;
    if (a.t === "exp") {
      if (baseEq(a.b, b)) erg.push(...a.a.map((u) => ({ k: rmul(u.k, f.e), f: u.f })));
      else {
        const basisSumme = a.b === "e" ? E_SUMME : zahlSumme(a.b);
        const lb = logTerm(basisSumme);
        erg.push(...a.a.map((u) => tMul({ k: rmul(u.k, f.e), f: u.f }, lb)));
      }
    } else if (a.t === "x") erg.push(logTerm(X_SUMME, f.e));
    else if (a.t === "sum") erg.push(logTerm(a.s, f.e));
    else if (a.t === "num") erg.push(logTerm(zahlSumme(a.v), f.e));
    else erg.push(logTerm([{ k: EINS, f: [{ a, e: EINS }] }], f.e));
  }
  return normSum(erg);
}

const expVon = (b, S) => normSum([{ k: EINS, f: [{ a: { t: "exp", b, a: S }, e: EINS }] }]);

function wurzelSeite(S) {
  return normSum([{ k: EINS, f: [sumAtom(S, HALB)] }]);
}

export function logName(b) {
  if (b === "e") return "ln";
  if (rgleich(b, R(10))) return "lg";
  return `log${rs(b).split("").map((z) => "₀₁₂₃₄₅₆₇₈₉"[+z] ?? z).join("")}`;
}

/* Liest, was der Schüler ins Feld getippt hat. */
export function opLesen(eingabe) {
  const t = normText(eingabe);
  if (!t) throw new Fehler("Tippe zuerst eine Umformung ein, zum Beispiel −5, +6x oder :3.");
  if (t === "ln") return { art: "log", b: "e" };
  if (t === "lg" || t === "log") return { art: "log", b: R(10) };
  let m = /^log_?\{?(\d+)\}?$/.exec(t);
  if (m) { const b = R(parseInt(m[1], 10)); if (b.n < 2) throw new Fehler("Die Basis muss größer als 1 sein."); return { art: "log", b }; }
  if (/^e\^?(\(\))?$/.test(t)) return { art: "exp", b: "e" };
  m = /^(\d+)\^(\(\))?$/.exec(t);
  if (m) { const b = R(parseInt(m[1], 10)); if (b.n < 2) throw new Fehler("Die Basis muss größer als 1 sein."); return { art: "exp", b }; }
  if (t === "√") return { art: "wurzel" };
  const c = t[0];
  if ("+-*/".includes(c)) {
    const rest = t.slice(1);
    if (!rest) throw new Fehler("Hinter dem Rechenzeichen fehlt noch etwas.");
    const arg = ausdruckLesen(rest);
    if (c === "+") return { art: "add", arg };
    if (c === "-") return { art: "add", arg: sNeg(arg) };
    if (c === "*") return { art: "mul", arg };
    return { art: "div", arg };
  }
  if (/^\d|^x/.test(t)) throw new Fehler("Setz ein Rechenzeichen davor: +, −, · oder : — zum Beispiel „−5“ oder „:3“.");
  throw new Fehler("Beginne mit +, −, · oder :. Für Funktionen tippe ln, lg, log_2, e^ oder 10^.");
}

function mitBeidenSeiten(z, fn) {
  try {
    const l = fn(z.l), r = fn(z.r);
    return [status({ l, r })];
  } catch (e) {
    if (e instanceof Undefiniert) return [{ l: z.l, r: z.r, status: "keine", grund: e.message }];
    throw e;
  }
}

function xSeite(z) {
  const lx = hatX(z.l), rx = hatX(z.r);
  if (lx && rx) return null;
  return lx ? { S: z.l, K: z.r, links: true } : { S: z.r, K: z.l, links: false };
}
const orient = (links, S, K, extra = {}) => status(links ? { l: S, r: K, ...extra } : { l: K, r: S, ...extra });

function einzweig(z, op) {
  switch (op.art) {
    case "add":
      return mitBeidenSeiten(z, (S) => sAdd(S, op.arg));
    case "mul":
    case "div": {
      const A = op.arg;
      if (hatX(A) && !(op.art === "mul" && hatXNenner(z))) {
        throw new Fehler(op.art === "mul"
          ? "Mit einem Term mit x zu multiplizieren ist keine sichere Äquivalenzumformung: Dabei kann die falsche Lösung x = 0 dazukommen."
          : "Durch x zu teilen ist keine Äquivalenzumformung, wenn x = 0 sein könnte. Klammere x lieber aus und nutze den Satz vom Nullprodukt.");
      }
      if (A.length === 0) throw new Fehler(op.art === "mul" ? "Mit 0 zu multiplizieren ist keine Äquivalenzumformung — danach stünde 0 = 0." : "Durch 0 kann man nicht teilen.");
      let t;
      if (A.length === 1) t = op.art === "mul" ? A[0] : kehrTerm(A[0]);
      else t = { k: EINS, f: [sumAtom(A, op.art === "mul" ? EINS : R(-1))] };
      if (!hatX(A) && Math.abs(wert([t])) < 1e-14) throw new Fehler("Dieser Ausdruck ist 0 — damit darf man nicht multiplizieren oder teilen.");
      // Bei Bruchgleichungen: mit dem Nenner multiplizieren und gleich ausmultiplizieren
      if (hatX(A)) return mitBeidenSeiten(z, (S) => ausmultiplizieren(seiteMal(S, t)));
      return mitBeidenSeiten(z, (S) => seiteMal(S, t));
    }
    case "log": {
      const x = xSeite(z);
      if (x && x.S.length > 1) throw new Fehler(`Erst isolieren: Der ${logName(op.b)} hilft nur, wenn auf der Seite mit x ein einzelnes Produkt steht, z. B. 3·2^x. Bring zuerst die Zahl auf die andere Seite.`);
      return mitBeidenSeiten(z, (S) => logVon(op.b, S));
    }
    case "exp": {
      const x = xSeite(z);
      if (x && x.S.length > 1) throw new Fehler("Erst isolieren: Bring zuerst alles außer dem Logarithmus auf die andere Seite, sodass er allein steht.");
      return mitBeidenSeiten(z, (S) => expVon(op.b, S));
    }
    case "wurzel": {
      const x = xSeite(z);
      if (!x) throw new Fehler("Auf beiden Seiten steht x. Bring zuerst alles mit x auf eine Seite.");
      const { S, K, links } = x;
      if (S.length !== 1) throw new Fehler("Wurzelziehen geht nur, wenn auf der x-Seite ein einzelnes Quadrat steht, z. B. x² = 9 oder (x − 3)² = 16. Isoliere zuerst das Quadrat.");
      const t = S[0];
      const xf = t.f.filter((f) => atomHatX(f.a));
      const quadrat = xf.length > 0 && xf.every((f) => (f.a.t === "x" || f.a.t === "sum") && rganz(f.e) && f.e.n > 0 && f.e.n % 2 === 0);
      if (!quadrat) throw new Fehler("Links steht kein Quadrat. Wurzelziehen lohnt sich erst, wenn x² oder eine Klammer² allein steht.");
      if (t.k.n < 0) throw new Fehler("Vor dem Quadrat steht ein Minus. Teile zuerst durch die negative Zahl davor.");
      const v = wert(K);
      const neuS = wurzelSeite(S);
      if (!Number.isFinite(v)) throw new Fehler("Die andere Seite lässt sich nicht auswerten.");
      if (v < -1e-12) return [{ l: z.l, r: z.r, status: "keine", grund: "Ein Quadrat ist nie negativ — diese Gleichung hat keine Lösung." }];
      if (Math.abs(v) < 1e-12) return [orient(links, neuS, [])];
      const w = wurzelSeite(K);
      return [orient(links, neuS, w), orient(links, neuS, sNeg(w))];
    }
    default:
      throw new Fehler("Diese Umformung kenne ich nicht.");
  }
}

export function mitternacht(z) {
  let S;
  if (z.r.length === 0) S = z.l;
  else if (z.l.length === 0) S = z.r;
  else throw new Fehler("Bring zuerst alles auf eine Seite, sodass auf der anderen Seite 0 steht. Dann Mitternachtsformel.");
  const k = polyKoeff(S);
  if (!k) throw new Fehler("Die Mitternachtsformel gilt nur für Gleichungen der Form ax² + bx + c = 0.");
  if (k.length < 3) throw new Fehler("Hier gibt es kein x² — die Gleichung ist linear. Löse sie mit ganz normalen Umformungen.");
  if (k.length > 3) throw new Fehler("Hier kommt x hoch 3 oder mehr vor. Die Mitternachtsformel gilt nur bis x².");
  const [c, b, a] = k;
  const D = rsub(rmul(b, b), rmul(R(4), rmul(a, c)));
  const detail = { a, b, c, D };
  if (D.n < 0) return { zweige: [{ l: z.l, r: z.r, status: "keine", grund: "Die Diskriminante unter der Wurzel ist negativ — es gibt keine reelle Lösung." }], detail };
  const p = rdiv(rneg(b), rmul(R(2), a));
  if (D.n === 0) return { zweige: [status({ l: X_SUMME, r: zahlSumme(p) })], detail };
  const w = sSkal(wurzelSeite(zahlSumme(D)), rdiv(EINS, rmul(R(2), a)));
  const x1 = sAdd(zahlSumme(p), w), x2 = sSub(zahlSumme(p), w);
  const sort = wert(x1) <= wert(x2) ? [x1, x2] : [x2, x1];
  detail.wurzelD = wurzelSeite(zahlSumme(D));
  return { zweige: sort.map((x) => status({ l: X_SUMME, r: x })), detail };
}

function ausklammernZweig(z) {
  const x = xSeite(z);
  if (!x) throw new Fehler("Auf beiden Seiten steht x. Bring zuerst alles auf eine Seite.");
  const { S, K, links } = x;
  if (S.length < 2) throw new Fehler("Ausklammern braucht eine Summe, z. B. x² − 5x.");
  let min = Infinity;
  for (const t of S) {
    const fx = t.f.find((f) => f.a.t === "x");
    if (!fx || !rganz(fx.e) || fx.e.n < 1) throw new Fehler("Nicht jeder Summand enthält x — hier lässt sich x nicht ausklammern.");
    min = Math.min(min, fx.e.n);
  }
  let g = S.every((t) => rganz(t.k)) ? S.reduce((acc, t) => ggT(acc, t.k.n), 0) : 1;
  if (S[0].k.n < 0) g = -g;
  const gR = R(g);
  const innen = normSum(S.map((t) => ({
    k: rdiv(t.k, gR),
    f: t.f.map((f) => (f.a.t === "x" ? { a: f.a, e: R(f.e.n - min) } : f)),
  })));
  const neu = normSum([{ k: gR, f: [{ a: { t: "x" }, e: R(min) }, sumAtom(innen)] }]);
  return [orient(links, neu, K)];
}

function nullproduktZweig(z) {
  const x = xSeite(z);
  if (!x) throw new Fehler("Auf beiden Seiten steht x. Bring zuerst alles auf eine Seite.");
  const { S, K } = x;
  if (K.length !== 0) throw new Fehler("Der Satz vom Nullprodukt braucht eine 0 auf der anderen Seite.");
  if (S.length !== 1) throw new Fehler("Auf der x-Seite steht eine Summe, kein Produkt. Klammere zuerst aus.");
  const faktoren = S[0].f.filter((f) => atomHatX(f.a)).sort((p, q) => faktorRang(p) - faktorRang(q));
  const zweige = [];
  for (const f of faktoren) {
    if (f.e.n < 0) continue;
    if (f.a.t === "x") zweige.push(status({ l: X_SUMME, r: [] }));
    else if (f.a.t === "sum") zweige.push(status({ l: f.a.s, r: [] }));
    else if (f.a.t === "log") zweige.push(status({ l: [{ k: EINS, f: [{ a: f.a, e: EINS }] }], r: [] }));
  }
  if (!zweige.length) throw new Fehler("Keiner der Faktoren kann 0 werden — die Gleichung hat keine Lösung.");
  if (zweige.length === 1 && faktoren.length === 1 && faktoren[0].a.t === "x" && reins(faktoren[0].e)) {
    throw new Fehler("Hier steht nur ein Faktor mit x. Teile einfach durch die Zahl davor.");
  }
  return zweige;
}

/* Wendet eine Umformung auf alle noch offenen Zweige an.
   op: Ergebnis von opLesen oder { art: "mitternacht" | "ausmult" | "ausklam" | "nullprod" } */
export function anwenden(zweige, op) {
  const offen = zweige.filter((z) => z.status === "offen");
  if (!offen.length) throw new Fehler("Die Gleichung ist schon gelöst.");
  let detail = null;
  const neu = [];
  const fehler = [];
  for (const z of zweige) {
    if (z.status !== "offen") { neu.push(z); continue; }
    try {
      let erg;
      if (op.art === "mitternacht") { const m = mitternacht(z); detail = { ...m.detail, var: z.var || "x" }; erg = m.zweige; }
      else if (op.art === "ausmult") erg = [status({ l: ausmultiplizieren(z.l), r: ausmultiplizieren(z.r) })];
      else if (op.art === "ausklam") erg = ausklammernZweig(z);
      else if (op.art === "nullprod") erg = nullproduktZweig(z);
      else if (op.art === "hauptnenner") { const h = hauptnennerZweig(z); detail = { hn: h.hn }; erg = h.zweige; }
      else if (op.art === "subst") { const h = substZweig(z); detail = { ziel: h.ziel }; erg = h.zweige; }
      else if (op.art === "ruecksub") erg = ruecksubZweig(z);
      else erg = einzweig(z, op);
      if (z.sub && op.art !== "ruecksub" && op.art !== "subst") {
        erg = erg.map((n) => (n.status === "keine" ? { ...n, sub: z.sub, var: z.var } : status({ l: n.l, r: n.r, sub: z.sub, var: z.var })));
      }
      neu.push(...erg);
    } catch (e) {
      if (!(e instanceof Fehler)) throw e;
      if (offen.length === 1) throw e;
      fehler.push(e.message);
      neu.push(z);
    }
  }
  if (fehler.length === offen.length) throw new Fehler(fehler[0]);
  if (op.art === "ausmult" && neu.every((z, i) => skey(z.l) === skey(zweige[i].l) && skey(z.r) === skey(zweige[i].r))) {
    throw new Fehler("Hier gibt es keine Klammer zum Ausmultiplizieren.");
  }
  return { zweige: neu, detail };
}

/* ---------- Lösungsmenge und Probe ---------- */

export function loesung(zweige, start) {
  if (zweige.some((z) => z.status === "offen")) return null;
  if (zweige.some((z) => z.status === "alle")) return { alle: true, werte: [], entfallen: [] };
  const werte = [];
  for (const z of zweige) {
    if (z.status !== "geloest") continue;
    const v = wert(z.wert);
    if (werte.some((w) => Math.abs(w.v - v) < 1e-9)) continue;
    const l = wert(start.l, v), r = wert(start.r, v);
    const ok = Number.isFinite(l) && Number.isFinite(r) && Math.abs(l - r) <= 1e-7 * Math.max(1, Math.abs(l), Math.abs(r));
    werte.push({ s: z.wert, v, exakt: alsBruch(z.wert) !== null, probe: ok, probeL: l, probeR: r, definiert: Number.isFinite(l) && Number.isFinite(r) });
  }
  werte.sort((a, b) => a.v - b.v);
  return { alle: false, werte: werte.filter((w) => w.definiert), entfallen: werte.filter((w) => !w.definiert) };
}

export function komplexitaet(zweige) {
  let n = 0;
  const zaehl = (S) => { for (const t of S) { n += 1 + t.f.length; for (const f of t.f) if (f.a.t === "sum") zaehl(f.a.s); } };
  for (const z of zweige) if (z.status === "offen") { zaehl(z.l); zaehl(z.r); }
  return n;
}

/* ---------- Darstellung als Baum (für Text und JSX) ---------- */

const txt = (v) => ({ t: "txt", v });
const reihe = (...c) => ({ t: "reihe", c: c.flat() });

function faktorRang(f) {
  switch (f.a.t) {
    case "num": return 0;
    case "x": return 1;
    case "sum": return 2;
    default: return atomHatX(f.a) ? 3 : 4;
  }
}

let VARNAME = "x";
function atomBaum(a, e) {
  const hoch = (b) => (reins(e) ? b : { t: "hoch", b, e: txt(rs(e)) });
  switch (a.t) {
    case "x":
      if (rgleich(e, HALB)) return { t: "wurzel", c: { t: "var", n: VARNAME } };
      return hoch({ t: "var", n: VARNAME });
    case "num":
      if (rgleich(e, HALB)) return { t: "wurzel", c: txt(rs(a.v)) };
      return hoch(txt(rs(a.v)));
    case "sum":
      if (rgleich(e, HALB)) return { t: "wurzel", c: sumBaum(a.s) };
      return hoch({ t: "klammer", c: sumBaum(a.s) });
    case "exp": {
      const basis = a.b === "e" ? txt("e") : a.b.d === 1 ? txt(rs(a.b)) : { t: "klammer", c: txt(rs(a.b)) };
      if (a.a.length === 1 && reins(a.a[0].k) && a.a[0].f.length === 0) return basis;
      return { t: "hoch", b: basis, e: sumBaum(a.a) };
    }
    case "log": {
      const name = a.b === "e" ? txt("ln") : rgleich(a.b, R(10)) ? txt("lg") : { t: "tief", b: txt("log"), i: txt(rs(a.b)) };
      const f = reihe(name, { t: "klammer", c: sumBaum(a.a) });
      return reins(e) ? f : { t: "hoch", b: { t: "klammer", c: f }, e: txt(rs(e)) };
    }
    default: return txt("?");
  }
}

function produktBaum(zahl, faktoren) {
  const fs = [...faktoren].sort((p, q) => faktorRang(p) - faktorRang(q));
  if (!fs.length) return txt(String(zahl));
  const teile = [];
  let vorher = null;
  if (zahl !== 1) { teile.push(txt(String(zahl))); vorher = "zahl"; }
  for (const f of fs) {
    const art = f.a.t === "num" && rgleich(f.e, HALB) ? "wurzel" : f.a.t;
    const ohnePunkt = vorher === null
      || (vorher === "zahl" && (art === "x" || art === "sum" || art === "wurzel"))
      || (vorher === "x" && art === "sum")
      || (vorher === "sum" && art === "sum");
    if (!ohnePunkt) teile.push(txt("·"));
    teile.push(atomBaum(f.a, f.e));
    vorher = art;
  }
  return reihe(teile);
}

function termBaum(t) {
  const oben = t.f.filter((f) => f.e.n > 0);
  const unten = t.f.filter((f) => f.e.n < 0).map((f) => ({ a: f.a, e: rneg(f.e) }));
  if (t.k.d === 1 && !unten.length) return produktBaum(t.k.n, oben);
  let o;
  if (t.k.n === 1 && oben.length === 1 && oben[0].a.t === "sum" && reins(oben[0].e)) o = sumBaum(oben[0].a.s);
  else o = produktBaum(t.k.n, oben);
  const u = t.k.d === 1 && unten.length === 1 && unten[0].a.t === "sum" && reins(unten[0].e) ? sumBaum(unten[0].a.s) : produktBaum(t.k.d, unten);
  return { t: "bruch", o, u };
}

export function sumBaum(S, v) {
  if (v && v !== VARNAME) { const alt = VARNAME; VARNAME = v; try { return sumBaum(S); } finally { VARNAME = alt; } }
  if (!S.length) return txt("0");
  const teile = [];
  S.forEach((t, i) => {
    const neg = t.k.n < 0;
    if (i === 0) { if (neg) teile.push(txt("−")); }
    else teile.push(txt(neg ? " − " : " + "));
    teile.push(termBaum({ k: rabs(t.k), f: t.f }));
  });
  return reihe(teile);
}

const HOCHZ = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "−": "⁻", "-": "⁻" };
const TIEFZ = "₀₁₂₃₄₅₆₇₈₉";

export function baumText(n) {
  switch (n.t) {
    case "txt": return n.v;
    case "var": return n.n || "x";
    case "reihe": return n.c.map(baumText).join("");
    case "klammer": return `(${baumText(n.c)})`;
    case "tief": return baumText(n.b) + baumText(n.i).split("").map((z) => TIEFZ[+z] ?? z).join("");
    case "wurzel": { const c = baumText(n.c); return /^[\w.]+$/.test(c) ? `√${c}` : `√(${c})`; }
    case "bruch": {
      const o = baumText(n.o), u = baumText(n.u);
      const oo = /[+−\s]/.test(o) ? `(${o})` : o, uu = /[+−·\s]/.test(u) ? `(${u})` : u;
      return `${oo}/${uu}`;
    }
    case "hoch": {
      const b = baumText(n.b), e = baumText(n.e);
      if (/^[0-9]+$/.test(e)) return b + e.split("").map((z) => HOCHZ[z]).join("");
      return /^([0-9]+|[a-z])$/.test(e) ? `${b}^${e}` : `${b}^(${e})`;
    }
    default: return "";
  }
}

export const alsText = (S, v) => baumText(sumBaum(S, v));
export const gleichungText = (z) => `${alsText(z.l)} = ${alsText(z.r)}`;

/* Baum für die Randnotiz „| −5“ */
export function opBaum(op) {
  const brauchtKlammer = (S) => S.length > 1 || (S.length === 1 && S[0].k.n < 0);
  switch (op.art) {
    case "add": {
      const neg = op.arg.length === 1 ? op.arg[0].k.n < 0 : false;
      const S = neg ? sNeg(op.arg) : op.arg;
      const inhalt = S.length > 1 ? { t: "klammer", c: sumBaum(S) } : sumBaum(S);
      return reihe(txt(neg ? "−" : "+"), inhalt);
    }
    case "mul":
    case "div": {
      const inhalt = brauchtKlammer(op.arg) ? { t: "klammer", c: sumBaum(op.arg) } : sumBaum(op.arg);
      return reihe(txt(op.art === "mul" ? "·" : ":"), inhalt);
    }
    case "log": return op.b === "e" ? txt("ln") : rgleich(op.b, R(10)) ? txt("lg") : { t: "tief", b: txt("log"), i: txt(rs(op.b)) };
    case "exp": return { t: "hoch", b: txt(op.b === "e" ? "e" : rs(op.b)), e: txt("( )") };
    case "wurzel": return txt("√ ±");
    case "mitternacht": return txt("Mitternachts\u00ADformel");
    case "ausmult": return txt("ausmultiplizieren");
    case "ausklam": return txt("x ausklammern");
    case "nullprod": return txt("Nullprodukt");
    case "ruecksub": return txt("Rück\u00ADsubstitution");
    case "subst": return txt("Substitution");
    case "hauptnenner": return txt("· Hauptnenner");
    default: return txt("");
  }
}

export const bruchText = (r) => rs(r).replace("-", "−");
export const bruchBaum = (r) => sumBaum(zahlSumme(r));

/* ---------- Tipps ---------- */

function opFuerTerm(t, vorzeichenUmdrehen = true) {
  const neg = t.k.n < 0;
  const abs = alsText([{ k: rabs(t.k), f: t.f }]);
  return vorzeichenUmdrehen ? (neg ? `+${abs}` : `−${abs}`) : abs;
}

export function tipp(zweige) {
  const z = zweige.find((w) => w.status === "offen");
  if (!z) return null;
  const lx = hatX(z.l), rx = hatX(z.r);

  if (z.sub && ((istX(z.l) && !rx) || (istX(z.r) && !lx))) {
    return { text: `u ist bestimmt. Jetzt zurück zu x: Bei der Rücksubstitution setzt du für u wieder ${alsText(z.sub.ziel)} ein.`, op: "#ruecksub" };
  }
  if (hatXNenner(z)) {
    return { text: "Bruchgleichung: Werte, bei denen ein Nenner 0 wird, sind verboten — sie stehen oben in der Definitionsmenge. Multipliziere dann beide Seiten mit dem Hauptnenner, danach steht kein Bruch mehr da.", op: "#hauptnenner" };
  }
  const si = substInfo(z);
  if (si) {
    return { text: si.art === "quad"
      ? "Hier kommen nur x⁴ und x² vor — eine biquadratische Gleichung. Substituiere u = x², dann wird daraus eine quadratische Gleichung in u."
      : `Hier steckt ${alsText(si.ziel)} zweimal drin: einmal so und einmal im Quadrat. Mit u = ${alsText(si.ziel)} wird daraus eine quadratische Gleichung in u.`, op: "#subst" };
  }

  if (lx && rx) {
    const beideExp = [z.l, z.r].every((S) => S.length === 1 && S[0].f.some((f) => f.a.t === "exp" && atomHatX(f.a)));
    if (beideExp) {
      const b = [z.l, z.r].map((S) => S[0].f.find((f) => f.a.t === "exp").a.b);
      if (baseEq(b[0], b[1])) {
        const op = b[0] === "e" ? "ln" : `log_${rs(b[0])}`;
        return { text: "Auf beiden Seiten steht eine Potenz mit derselben Basis. Logarithmiere beide Seiten — dann stehen nur noch die Exponenten da.", op };
      }
    }
    const pl = polyKoeff(z.l), pr = polyKoeff(z.r);
    const grad = pl && pr ? Math.max(pl.length, pr.length) - 1 : null;
    if (grad !== null && grad >= 2) {
      const t = z.r[0];
      return { text: "Eine quadratische Gleichung löst du, indem du zuerst alles auf eine Seite bringst — auf der anderen muss 0 stehen. Hol die Terme von rechts nach links, einen nach dem anderen.", op: opFuerTerm(t) };
    }
    const xTerm = z.r.find(termHatX);
    return { text: "Auf beiden Seiten steht x. Sammle alle Terme mit x auf einer Seite, indem du den x-Term der rechten Seite auf beiden Seiten abziehst.", op: opFuerTerm(xTerm) };
  }

  const { S, K } = lx ? { S: z.l, K: z.r } : { S: z.r, K: z.l };
  const poly = polyKoeff(S);

  if (S.length > 1) {
    const grad = poly ? poly.length - 1 : null;
    const konst = S.filter((t) => !termHatX(t));
    if (grad === 2 && poly[1] && !rnull(poly[1])) {
      if (K.length) return { text: "Da stehen x² und x — das ist ein Fall für die Mitternachtsformel. Dafür muss auf einer Seite 0 stehen. Bring zuerst die andere Seite herüber.", op: `−${K.length > 1 ? `(${alsText(K)})` : alsText(K)}`.replace("−−", "+") };
      if (!konst.length) return { text: "Es gibt keinen Zahlterm. Am schnellsten: x ausklammern, dann liefert der Satz vom Nullprodukt beide Lösungen. Die Mitternachtsformel geht auch.", op: "#ausklam" };
      return { text: "Die Gleichung hat die Form ax² + bx + c = 0. Das ist genau der Fall für die Mitternachtsformel.", op: "#mitternacht" };
    }
    if (konst.length) return { text: "Gleichung lösen heißt, die Rechnung rückwärts zu gehen. Was zuletzt dazukam, geht zuerst weg: Bring die Zahl ohne x auf die andere Seite.", op: opFuerTerm(konst[konst.length - 1]) };
    if (S.some((t) => t.f.some((f) => f.a.t === "sum" && hatX(f.a.s)))) return { text: "Löse zuerst die Klammer auf, damit du die Terme mit x zusammenfassen kannst.", op: "#ausmult" };
    if (grad !== null && grad >= 2 && !K.length) return { text: "Jeder Summand enthält x. Klammere x aus, dann hilft der Satz vom Nullprodukt.", op: "#ausklam" };
    return { text: "Versuche, die Terme mit x zusammenzufassen oder auszuklammern.", op: "#ausklam" };
  }

  const t = S[0];
  const fx = t.f.filter((f) => atomHatX(f.a));
  const fc = t.f.filter((f) => !atomHatX(f.a));

  if (!K.length && (fx.length >= 2 || (fx.length === 1 && fx[0].a.t === "sum" && reins(fx[0].e)))) {
    return { text: "Ein Produkt ist genau dann 0, wenn einer der Faktoren 0 ist. Nutze den Satz vom Nullprodukt.", op: "#nullprod" };
  }
  if (!reins(t.k) || fc.length) {
    if (fx.length === 1 && fx[0].a.t === "sum" && reins(fx[0].e) && !fc.length && t.k.d === 1) {
      return { text: "Vor der Klammer steht eine Zahl. Teile beide Seiten durch diese Zahl — dann fällt die Klammer weg. (Ausmultiplizieren geht auch.)", op: `:${t.k.n < 0 ? `(${bruchText(t.k)})` : bruchText(t.k)}` };
    }
    let op;
    if (fc.length) {
      const c = alsText([{ k: t.k, f: fc }]);
      op = `:${/[\s+−]/.test(c) || t.k.n < 0 ? `(${c})` : c}`;
    } else if (t.k.n === 1 || t.k.n === -1) op = `·${t.k.n < 0 ? `(−${t.k.d})` : t.k.d}`;
    else op = `:${t.k.n < 0 ? `(${bruchText(t.k)})` : bruchText(t.k)}`;
    return { text: "Der Faktor vor dem x-Teil muss weg. Mal wird rückwärts zu geteilt: Teile beide Seiten durch diesen Faktor.", op };
  }
  const f = fx[0];
  if (fx.length === 1) {
    if ((f.a.t === "x" || f.a.t === "sum") && rganz(f.e) && f.e.n % 2 === 0) {
      const v = wert(K);
      if (v < 0) return { text: "Ein Quadrat kann nie negativ werden. Zieh trotzdem die Wurzel, dann siehst du: Diese Gleichung hat keine Lösung.", op: "#wurzel" };
      return { text: "Das Quadrat steht allein. Zieh auf beiden Seiten die Wurzel — und denk an die zwei Lösungen: plus und minus.", op: "#wurzel" };
    }
    if (f.a.t === "exp") {
      if (f.a.b === "e") return { text: "Die e-Potenz steht allein. Die Umkehrung von e^ ist ln: Logarithmiere beide Seiten.", op: "ln" };
      return { text: `Die Potenz zur Basis ${rs(f.a.b)} steht allein. Logarithmiere mit log zur Basis ${rs(f.a.b)} — oder mit ln, dann musst du danach noch durch ln(${rs(f.a.b)}) teilen.`, op: `log_${rs(f.a.b)}` };
    }
    if (f.a.t === "log") {
      const b = f.a.b;
      const name = b === "e" ? "e^" : `${rs(b)}^`;
      return { text: `Der Logarithmus steht allein. Seine Umkehrung ist die Potenz: Nimm beide Seiten als Exponent zur Basis ${b === "e" ? "e" : rs(b)}.`, op: name };
    }
  }
  return { text: "Überlege, welche Rechnung zuletzt mit x passiert ist, und mach sie rückwärts.", op: null };
}

/* Wandelt eine Tipp-Op in eine ausführbare Umformung um (für Tests und den „Zeig’s mir“-Knopf). */
export function tippAlsOp(op) {
  if (!op) return null;
  if (op === "#mitternacht") return { art: "mitternacht" };
  if (op === "#ausmult") return { art: "ausmult" };
  if (op === "#ausklam") return { art: "ausklam" };
  if (op === "#nullprod") return { art: "nullprod" };
  if (op === "#wurzel") return { art: "wurzel" };
  if (op === "#subst") return { art: "subst" };
  if (op === "#ruecksub") return { art: "ruecksub" };
  if (op === "#hauptnenner") return { art: "hauptnenner" };
  return opLesen(op);
}

/* ---------- Aufgaben ---------- */

const zufall = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const wahl = (arr) => arr[Math.floor(Math.random() * arr.length)];
const nichtNull = (a, b) => { let v = 0; while (v === 0) v = zufall(a, b); return v; };

/* Lineare Summe als Text: glieder = [[koeff, "x"], [koeff, ""]] */
function glieder(liste) {
  let s = "";
  for (const [k, teil] of liste) {
    if (k === 0) continue;
    const betrag = Math.abs(k);
    const koeff = teil && betrag === 1 ? "" : String(betrag);
    const zeichen = s === "" ? (k < 0 ? "−" : "") : k < 0 ? " − " : " + ";
    s += zeichen + koeff + (teil && koeff && !/^[x(]/.test(teil) ? "·" : "") + teil;
  }
  return s || "0";
}

export const ARTEN = [
  { id: "linear", name: "Linear", kurz: "3x + 5 = 20" },
  { id: "quadratisch", name: "Quadratisch", kurz: "x² − 5x + 6 = 0" },
  { id: "exponential", name: "Exponential", kurz: "3·2^x = 48" },
  { id: "logarithmus", name: "Logarithmus", kurz: "ln(x) = 2" },
  { id: "bruch", name: "Bruchgleichung", kurz: "3/(x − 1) = 2" },
];
export const STUFEN = [
  { id: 1, name: "Einstieg" },
  { id: 2, name: "Standard" },
  { id: 3, name: "Knifflig" },
];

const GENERATOREN = {
  linear: {
    1: () => wahl([
      () => { const a = zufall(2, 9), x = zufall(-9, 9), b = nichtNull(-15, 15); return `${glieder([[a, "x"], [b, ""]])} = ${a * x + b}`; },
      () => { const x = zufall(-12, 12), b = nichtNull(-20, 20); return `${glieder([[1, "x"], [b, ""]])} = ${x + b}`; },
      () => { const a = wahl([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8]), x = zufall(-9, 9); return `${glieder([[a, "x"]])} = ${a * x}`; },
    ])(),
    2: () => wahl([
      () => {
        const x = zufall(-8, 8); let a = nichtNull(-9, 9), c = nichtNull(-9, 9);
        while (a === c) c = nichtNull(-9, 9);
        const b = nichtNull(-15, 15), d = (a - c) * x + b;
        return `${glieder([[a, "x"], [b, ""]])} = ${glieder([[c, "x"], [d, ""]])}`;
      },
      () => {
        const x = zufall(-8, 8), a = zufall(2, 7), c = zufall(1, 7), b = nichtNull(-12, 12), d = b - (a + c) * x;
        return `${glieder([[b, ""], [-a, "x"]])} = ${glieder([[c, "x"], [d, ""]])}`;
      },
    ])(),
    3: () => wahl([
      () => {
        const x = zufall(-7, 7), a = wahl([2, 3, 4, 5, -2, -3]), p = nichtNull(-6, 6);
        let c = nichtNull(-6, 6); while (c === a) c = nichtNull(-6, 6);
        const d = a * (x + p) - c * x;
        return `${a}(${glieder([[1, "x"], [p, ""]])}) = ${glieder([[c, "x"], [d, ""]])}`;
      },
      () => {
        const x = zufall(-6, 6), a = wahl([2, 3, 4]), p = nichtNull(-5, 5), e = nichtNull(-9, 9);
        let c = wahl([2, 3, 5]); while (c === a) c = wahl([2, 3, 5, 6]);
        const q = (a * (x + p) + e) / c - x;
        if (!Number.isInteger(q) || q === 0) return GENERATOREN.linear[3]();
        return `${a}(${glieder([[1, "x"], [p, ""]])}) ${e < 0 ? "−" : "+"} ${Math.abs(e)} = ${c}(${glieder([[1, "x"], [q, ""]])})`;
      },
      () => { const a = wahl([2, 3, 4, 5]), x = a * zufall(-5, 6), b = nichtNull(-9, 9); return `x/${a} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${x / a + b}`; },
      () => { const a = wahl([2, 3, 4]), p = nichtNull(-8, 8), c = zufall(-6, 6); return `(${glieder([[1, "x"], [p, ""]])})/${a} = ${c}`; },
    ])(),
  },
  quadratisch: {
    1: () => wahl([
      () => { const a = wahl([1, 2, 3, 4, 5]), r = zufall(1, 9); return `${a === 1 ? "" : a}x² = ${a * r * r}`; },
      () => { const r = zufall(2, 12); return `x² − ${r * r} = 0`; },
      () => { const r = zufall(1, 8), b = nichtNull(-20, 20); return `${glieder([[1, "x²"], [b, ""]])} = ${r * r + b}`; },
      () => { const a = wahl([2, 3, 5]), r = zufall(1, 6); return `${a}x² − ${a * r * r} = 0`; },
    ])(),
    2: () => wahl([
      () => { const p = nichtNull(-6, 6), q = zufall(1, 7); return `(${glieder([[1, "x"], [p, ""]])})² = ${q * q}`; },
      () => { const a = wahl([2, 3, 4]), p = nichtNull(-5, 5), q = zufall(1, 5); return `${a}(${glieder([[1, "x"], [p, ""]])})² = ${a * q * q}`; },
      () => { const b = nichtNull(-9, 9); return `${glieder([[1, "x²"], [b, "x"]])} = 0`; },
      () => { const a = wahl([2, 3, -2]), b = nichtNull(-6, 6); return `${glieder([[a, "x²"], [a * b, "x"]])} = 0`; },
      () => { const p = nichtNull(-5, 5), q = zufall(1, 6), c = nichtNull(-9, 9); return `(${glieder([[1, "x"], [p, ""]])})² ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${q * q + c}`; },
    ])(),
    3: () => wahl([
      () => {
        const a = wahl([1, 1, 2, -1, 3]); let r1 = zufall(-7, 7), r2 = zufall(-7, 7);
        while (r2 === r1) r2 = zufall(-7, 7);
        return `${glieder([[a, "x²"], [-a * (r1 + r2), "x"], [a * r1 * r2, ""]])} = 0`;
      },
      () => {
        const a = wahl([1, 2]); let r1 = zufall(-6, 6), r2 = zufall(-6, 6);
        while (r2 === r1) r2 = zufall(-6, 6);
        const b = -a * (r1 + r2), c = a * r1 * r2;
        const B = nichtNull(-8, 8), C = B - b, D = -c;
        return `${glieder([[a, "x²"], [B, "x"]])} = ${glieder([[C, "x"], [D, ""]])}`;
      },
      () => {
        const b = wahl([-8, -6, -4, -2, 2, 4, 6, 8]); let c;
        do { c = zufall(-8, 8); } while (Number.isInteger(Math.sqrt(b * b - 4 * c)) || b * b - 4 * c <= 0);
        return `${glieder([[1, "x²"], [b, "x"], [c, ""]])} = 0`;
      },
      () => { const p = zufall(1, 4), c = p * p + zufall(1, 6); return `${glieder([[1, "x²"], [2 * p, "x"], [c, ""]])} = 0`; },
      () => { const a = zufall(1, 3); let b = zufall(1, 4); while (b === a) b = zufall(1, 4); return `${glieder([[1, "x^4"], [-(a * a + b * b), "x²"], [a * a * b * b, ""]])} = 0`; },
      () => { const a = zufall(1, 4), c = zufall(1, 5); return `${glieder([[1, "x^4"], [c - a * a, "x²"], [-a * a * c, ""]])} = 0`; },
    ])(),
  },
  exponential: {
    1: () => wahl([
      () => { const [b, max] = wahl([[2, 7], [3, 4], [5, 3], [10, 3]]); const n = zufall(1, max); return `${b}^x = ${b ** n}`; },
      () => `e^x = ${zufall(2, 9)}`,
      () => { const n = zufall(2, 4); return `e^x = e^${n}`; },
    ])(),
    2: () => wahl([
      () => { const a = zufall(2, 6), [b, max] = wahl([[2, 6], [3, 4], [5, 3]]); const n = zufall(1, max); return `${a}·${b}^x = ${a * b ** n}`; },
      () => { const [b, max] = wahl([[2, 7], [3, 4]]); const n = zufall(2, max), m = nichtNull(-3, 3); return `${b}^(${glieder([[1, "x"], [m, ""]])}) = ${b ** n}`; },
      () => { const c = nichtNull(-9, 9), k = zufall(2, 9); return `e^x ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${k + c}`; },
      () => { const a = zufall(2, 5), k = zufall(2, 8); return `${a}e^x = ${a * k}`; },
    ])(),
    3: () => wahl([
      () => { const a = zufall(2, 5), k = zufall(2, 3), q = zufall(2, 6), c = nichtNull(-9, 9); return `${a}e^(${k}x) ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${a * q + c}`; },
      () => {
        const [b, max] = wahl([[2, 6], [3, 4]]); const k = wahl([2, 3]), n = zufall(1, max);
        const x = zufall(0, 3), m = k * x - n;
        if (m === 0) return `${b}^(${k}x) = ${b ** n}`;
        return `${b}^(${glieder([[k, "x"], [-m, ""]])}) = ${b ** n}`;
      },
      () => { const m = nichtNull(-5, 5), k = wahl([2, 3]); return `e^(${k}x) = e^(${glieder([[1, "x"], [m, ""]])})`; },
      () => { const a = zufall(2, 4), [b, max] = wahl([[2, 5], [3, 3]]); const n = zufall(1, max), c = zufall(1, 12); return `${a}·${b}^x − ${c} = ${a * b ** n - c}`; },
      () => { const p = zufall(1, 6); let q = zufall(1, 6); while (q === p) q = zufall(1, 6); return `e^(2x) − ${p + q}e^x + ${p * q} = 0`; },
      () => { const m = zufall(0, 3); let n = zufall(0, 3); while (n === m) n = zufall(0, 3); return `2^(2x) − ${2 ** m + 2 ** n}·2^x + ${2 ** (m + n)} = 0`; },
      () => { const p = zufall(2, 6), q = zufall(1, 5); return `${glieder([[1, "e^(2x)"], [q - p, "e^x"], [-p * q, ""]])} = 0`; },
    ])(),
  },
  logarithmus: {
    1: () => wahl([
      () => `ln(x) = ${zufall(1, 3)}`,
      () => `lg(x) = ${zufall(1, 3)}`,
      () => `log₂(x) = ${zufall(2, 6)}`,
      () => `log₃(x) = ${zufall(2, 4)}`,
    ])(),
    2: () => wahl([
      () => { const a = zufall(2, 4), n = zufall(1, 3), c = nichtNull(-6, 6); return `${a}·ln(x) ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${a * n + c}`; },
      () => { const n = zufall(2, 5), m = nichtNull(-6, 6); return `log₂(${glieder([[1, "x"], [m, ""]])}) = ${n}`; },
      () => { const n = zufall(1, 3), a = wahl([2, 4, 5]); return `lg(${a}x) = ${n}`; },
      () => { const c = zufall(1, 5), d = zufall(1, 3); return `ln(x) − ${c} = ${d - c}`; },
    ])(),
    3: () => wahl([
      () => {
        const n = zufall(1, 3), k = wahl([1, 2, 3]), x = zufall(1, 8), m = 3 ** n - k * x, a = zufall(2, 3), c = zufall(1, 6);
        return `${a}·log₃(${glieder([[k, "x"], [m, ""]])}) − ${c} = ${a * n - c}`;
      },
      () => { const a = zufall(2, 6), b = zufall(2, 6); return `ln(x) + ln(${a}) = ln(${a * b})`; },
      () => { const a = zufall(2, 4), m = zufall(1, 6), n = zufall(1, 3); return `${a}·ln(x − ${m}) = ${a * n}`; },
      () => { const [a, n] = wahl([[2, 2], [4, 2], [5, 2], [20, 3], [25, 3], [2, 3], [5, 3]]); return `lg(x) + lg(${a}) = ${n}`; },
    ])(),
  },
};

GENERATOREN.bruch = {
  1: () => wahl([
    () => { const x = nichtNull(-9, 9), b = nichtNull(-6, 6); return `${b * x}/x = ${b}`; },
    () => { const x = nichtNull(-6, 6), q = nichtNull(-6, 6), c = nichtNull(-9, 9); return `${q * x}/x ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${q + c}`; },
    () => { const x = nichtNull(-8, 8), b = wahl([2, 3, 4, 5]); return `${b * x * 2}/(2x) = ${b}`; },
  ])(),
  2: () => wahl([
    () => { const x = zufall(-6, 8), p = nichtNull(-6, 6), b = nichtNull(-5, 5); if (x + p === 0) return GENERATOREN.bruch[2](); return `${b * (x + p)}/(${glieder([[1, "x"], [p, ""]])}) = ${b}`; },
    () => { const p = zufall(-5, 5); let q = zufall(-5, 5); while (q === p) q = zufall(-5, 5); const a = nichtNull(-6, 6); let b = nichtNull(-6, 6); while (b === a) b = nichtNull(-6, 6);
      return `${a}/(${glieder([[1, "x"], [-p, ""]])}) = ${b}/(${glieder([[1, "x"], [-q, ""]])})`; },
    () => { const a = nichtNull(-6, 6), p = nichtNull(-5, 5), c = wahl([-3, -2, 2, 3, 4]); return `(${glieder([[1, "x"], [a, ""]])})/(${glieder([[1, "x"], [-p, ""]])}) = ${c}`; },
  ])(),
  3: () => wahl([
    () => { const a = nichtNull(-6, 6), b = nichtNull(-6, 6), p = zufall(-4, 4); let q = zufall(-4, 4); while (q === p) q = zufall(-4, 4); const c = nichtNull(-3, 3);
      return `${a}/(${glieder([[1, "x"], [-p, ""]])}) + ${b}/(${glieder([[1, "x"], [-q, ""]])}) = ${c}`.replace("+ -", "− "); },
    () => { const p = nichtNull(-5, 5), c = wahl([2, 3, 4, -2]); return `x/(${glieder([[1, "x"], [-p, ""]])}) = ${p}/(${glieder([[1, "x"], [-p, ""]])}) ${c < 0 ? "−" : "+"} ${Math.abs(c)}`.replace("= -", "= −"); },
    () => { const a = nichtNull(-6, 6), b = nichtNull(-6, 6), p = nichtNull(-4, 4), c = nichtNull(-3, 3); return `${a}/x + ${b}/(${glieder([[1, "x"], [p, ""]])}) = ${c}`.replace("+ -", "− "); },
    () => { const a = nichtNull(-5, 5), b = nichtNull(-5, 5), p = nichtNull(-4, 4); let q = nichtNull(-4, 4); while (q === p) q = nichtNull(-4, 4);
      return `(${glieder([[1, "x"], [a, ""]])})/(${glieder([[1, "x"], [-p, ""]])}) = (${glieder([[1, "x"], [b, ""]])})/(${glieder([[1, "x"], [-q, ""]])})`; },
  ])(),
};

/* Eine Aufgabe taugt, wenn der Musterweg sie löst und alle Lösungen glatt sind. */
function tauglich(g) {
  const m = musterweg(g);
  if (!m || m.schritte.length < 1) return false;
  const L = loesung(m.ende, g);
  if (!L) return false;
  return L.werte.every((w) => w.probe && (w.exakt ? w.s[0] ? w.s[0].k.d <= 4 && Math.abs(w.v) <= 40 : true : true));
}

export function erzeugen(art, stufe) {
  for (let versuch = 0; versuch < 30; versuch++) {
    const text = GENERATOREN[art][stufe]();
    try {
      const g = gleichungLesen(text);
      const z = status({ ...g });
      if (z.status === "offen" && (art !== "bruch" || tauglich(g))) return { ...g, text };
    } catch (e) { /* neuer Versuch */ }
  }
  return { ...gleichungLesen("2x + 3 = 11"), text: "2x + 3 = 11" };
}

/* Musterweg: folgt den Tipps, bis die Gleichung gelöst ist. */
export function musterweg(start) {
  let zweige = [status({ l: start.l, r: start.r })];
  const schritte = [];
  for (let i = 0; i < 14 && zweige.some((z) => z.status === "offen"); i++) {
    const t = tipp(zweige);
    if (!t || !t.op) return null;
    let erg;
    try { erg = anwenden(zweige, tippAlsOp(t.op)); } catch (e) { return null; }
    schritte.push({ op: tippAlsOp(t.op), zweigeVorher: zweige, detail: erg.detail });
    zweige = erg.zweige;
  }
  if (zweige.some((z) => z.status === "offen")) return null;
  return { schritte, ende: zweige };
}
