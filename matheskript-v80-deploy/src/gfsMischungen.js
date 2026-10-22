/* ============================================================
   GFS-Trainer · Mischungen – wie viel nimmt man von jeder Sorte?
   (Klasse 8, Kapitel VII Lineare Gleichungssysteme)
   Reine Logik ohne React: exakte Bruchrechnung, Mischungsgleichung,
   Mischungskreuz, Verdünnen, drei Sorten, vier Übungsgeneratoren mit
   Prüfung, gezielter Rückmeldung zu typischen Fehlern und vollständigem
   Rechenweg, dazu Gliederung, Tipps und Kolloquium.
   Getestet in tests/gfsMischungen.test.mjs.
   Nichts stammt aus dem Schulbuch: Aufgaben, Kontexte, Zahlen und
   Formulierungen sind eigene.
   Schreibweise überall: Mengen m₁, m₂ (g oder kg), Werte c₁ < c₂
   (Prozent, € je kg oder ‰), Mischwert c. Prozent heißt hier immer
   Massenanteil (g Stoff je 100 g Lösung) – dann ist die Rechnung exakt.
   ============================================================ */

/* ---------- Zufall ---------- */
/* mulberry32: kleiner Generator mit Startwert – für wiederholbare Tests */
export function zufallszahlen(startwert = 1) {
  let s = startwert >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* Ganzzahl-Würfel zufall(a, b) wie in den übrigen GFS-Generatoren */
export const wuerfelAus = (rnd = Math.random) => (a, b) => a + Math.floor(rnd() * (b - a + 1));
const zz = wuerfelAus();
const wahl = (liste, zufall) => liste[(zufall || zz)(0, liste.length - 1)];
const stufeIn = (s) => Math.max(1, Math.min(5, Math.round(s || 1)));

/* ---------- Exakte Brüche { z, n } (n > 0, gekürzt) ---------- */
export const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
export const Q = (z, n = 1) => {
  if (n < 0) { z = -z; n = -n; }
  const g = ggT(z, n);
  return { z: z / g + 0, n: n / g };
};
/* Zahl (höchstens vier Nachkommastellen) oder Bruch → Bruch */
export const R = (x) => (typeof x === "object" && x !== null ? x : Q(Math.round(Number(x) * 10000), 10000));
export const plus = (a, b) => { a = R(a); b = R(b); return Q(a.z * b.n + b.z * a.n, a.n * b.n); };
export const mal = (a, b) => { a = R(a); b = R(b); return Q(a.z * b.z, a.n * b.n); };
export const minus = (a, b) => plus(a, mal(b, -1));
export const durch = (a, b) => { a = R(a); b = R(b); return Q(a.z * b.n, a.n * b.z); };
export const gleich = (a, b) => { a = R(a); b = R(b); return a.z * b.n === b.z * a.n; };
export const wert = (a) => { a = R(a); return a.z / a.n; };
export const summe = (liste) => liste.reduce((s, x) => plus(s, x), Q(0));
export const ganz = (a) => R(a).n === 1;
const prozent = (c) => durch(c, 100);

/* Abbrechende Dezimalzahl mit Komma und „−“ (höchstens max Stellen), sonst null */
export function dezimal(q, max = 6) {
  q = R(q);
  let n = q.n, s2 = 0, s5 = 0;
  while (n % 2 === 0) { n /= 2; s2++; }
  while (n % 5 === 0) { n /= 5; s5++; }
  const st = Math.max(s2, s5);
  if (n !== 1 || st > max) return null;
  let s = String(Math.round((Math.abs(q.z) * 10 ** st) / q.n));
  if (st > 0) {
    s = s.padStart(st + 1, "0");
    s = `${s.slice(0, -st)},${s.slice(-st)}`.replace(/0+$/, "").replace(/,$/, "");
  }
  return (q.z < 0 ? "−" : "") + s;
}
/* Zahl für TeX und Text: Dezimalzahl, sonst Bruch */
export const zt = (q) => { q = R(q); return dezimal(q) ?? `${q.z < 0 ? "−" : ""}\\frac{${Math.abs(q.z)}}{${q.n}}`; };
/* Geldbetrag: ganze Euro ohne Komma (20), sonst zwei Nachkommastellen (12,40) */
export const geld = (q) => {
  const ct = mal(q, 100);
  if (!ganz(ct) || ganz(q)) return zt(q);
  const s = String(Math.abs(ct.z)).padStart(3, "0");
  return `${ct.z < 0 ? "−" : ""}${s.slice(0, -2)},${s.slice(-2)}`;
};

/* ---------- Eingaben lesen ---------- */
/* „12,5“, „12.5“, „25/2“, „7,5/2“, „−3“, „12,5 %“, „320 g“, „14,20 €“ → exakter Bruch; sonst null */
export function lies(s) {
  const t = String(s ?? "").replace(/\s/g, "").replace(/−/g, "-").replace(/(€\/kg|€|‰|%|kg|g)$/i, "");
  if (!t) return null;
  const teil = (u) => {
    if (!/^-?(\d+([.,]\d+)?|[.,]\d+)$/.test(u)) return null;
    const neg = u.startsWith("-");
    const [a, b = ""] = u.replace("-", "").replace(",", ".").split(".");
    return Q((neg ? -1 : 1) * Number(`${a || "0"}${b}`), 10 ** b.length);
  };
  const st = t.split("/");
  if (st.length === 1) return teil(st[0]);
  if (st.length !== 2) return null;
  const a = teil(st[0]), b = teil(st[1]);
  return a && b && b.z !== 0 ? durch(a, b) : null;
}

/* ---------- Die Mathematik ---------- */
/* Mischwert = gewichteter Mittelwert: c = (m₁c₁ + m₂c₂ + …) : (m₁ + m₂ + …) */
export const mischwert = (teile) => durch(summe(teile.map(({ m, c }) => mal(m, c))), summe(teile.map((t) => t.m)));
/* Mischungskreuz: Abstände zum Ziel über Kreuz. d1 = c₂ − c (Teile Sorte 1), d2 = c − c₁ (Teile Sorte 2);
   p1 : p2 = d1 : d2 in kleinsten ganzen Zahlen. Gültig nur, wenn c echt zwischen c₁ und c₂ liegt. */
export function kreuz(c1, c2, c) {
  const d1 = minus(c2, c), d2 = minus(c, c1);
  const gueltig = wert(d1) > 0 && wert(d2) > 0;
  if (!gueltig) return { d1, d2, gueltig };
  const r = durch(d1, d2);
  return { d1, d2, p1: r.z, p2: r.n, gueltig };
}
/* Gesamtmenge M nach dem Kreuz aufteilen */
export function verteilen(c1, c2, c, M) {
  const k = kreuz(c1, c2, c);
  if (!k.gueltig) return null;
  const teil = durch(M, k.p1 + k.p2);
  return { ...k, teil, m1: mal(teil, k.p1), m2: mal(teil, k.p2) };
}
/* Lineares Gleichungssystem a1·x + b1·y = r1, a2·x + b2·y = r2 (Cramer), exakt */
export function loese2(a1, b1, r1, a2, b2, r2) {
  const d = minus(mal(a1, b2), mal(a2, b1));
  if (wert(d) === 0) return null;
  return { x: durch(minus(mal(r1, b2), mal(r2, b1)), d), y: durch(minus(mal(a1, r2), mal(a2, r1)), d) };
}

/* ---------- Beispiele der Herleitung (auf der Seite und in den Animationen dieselben Zahlen) ---------- */
export const ERHALTEN = { m1: 200, c1: 5, m2: 100, c2: 20 };                  // Schritt 1: ergibt 10 %
export const BEISPIEL = { c1: 5, c2: 20, c: 12, M: 600 };                    // Schritt 3/4: 320 g und 280 g
export const WIPPE_MEHR = 480;                                               // Wippe: 320 g zu 5 % und 480 g zu 20 % → 14 %
export const VERDUENNEN = { m: 400, c1: 15, c: 6 };                          // Schritt 5: 600 g Wasser
export const DREI = { preise: [8, 12, 20], M: 10, c: 14 };                   // Schritt 6: Nüsse, unendlich viele Lösungen
/* drei Sorten: z frei gewählt, x und y aus den beiden Gleichungen */
export function dreiSorten(z, d = DREI) {
  const [p1, p2, p3] = d.preise;
  const l = loese2(1, 1, minus(d.M, z), p1, p2, minus(mal(d.M, d.c), mal(p3, z)));
  return { x: l.x, y: l.y, z: R(z) };
}
/* Bereich für z, in dem x ≥ 0 und y ≥ 0 bleiben (lineare Funktionen von z, Ränder exakt) */
export function dreiGrenzen(d = DREI) {
  const a = dreiSorten(0, d), b = dreiSorten(1, d);
  const grenzen = [];
  for (const k of ["x", "y"]) {
    const v0 = a[k], st = minus(b[k], a[k]);                       // k(z) = v0 + st · z
    if (wert(st) !== 0) grenzen.push({ k, z: durch(mal(v0, -1), st), steigt: wert(st) > 0 });
  }
  let lo = Q(0), hi = R(d.M);
  for (const g of grenzen) {
    if (g.steigt && wert(g.z) > wert(lo)) lo = g.z;
    if (!g.steigt && wert(g.z) < wert(hi)) hi = g.z;
  }
  return [lo, hi];
}

/* ---------- Labor: zwei Gefäße und eine Wippe ---------- */
export const LABOR = { mMin: 20, mMax: 600, mSchritt: 20, cMin: 0, cMax: 40, cSchritt: 1 };
export const LABOR_VORLAGEN = [
  { id: "start", name: "5 % + 20 %", m1: 200, c1: 5, m2: 100, c2: 20 },
  { id: "kreuz", name: "Ziel 12 %", m1: 320, c1: 5, m2: 280, c2: 20 },
  { id: "gleich", name: "Gleich viel", m1: 200, c1: 5, m2: 200, c2: 20 },
  { id: "wasser", name: "Mit Wasser", m1: 600, c1: 0, m2: 400, c2: 15 },
];
/* Zahl zum Anzeigen: exakt, wenn sie höchstens `stellen` Nachkommastellen hat, sonst gerundet mit ≈ */
export function anzeige(q, stellen = 2) {
  const d = dezimal(q, stellen);
  if (d !== null) return { text: d, exakt: true };
  const r = Math.round(wert(q) * 10 ** stellen) / 10 ** stellen;
  return { text: String(r).replace("-", "−").replace(".", ","), exakt: false };
}
const gl = (x) => (x.exakt ? "=" : "\\approx");
/* Gewicht · Abstand; im Abstand 1 ist das Drehmoment einfach das Gewicht, im Abstand 0 null */
const hebel = (m, a, aa, ha, ungenau) => (wert(a) === 0 ? "0" : gleich(a, 1) ? String(m) : `${m} \\cdot ${aa.text} ${ungenau ? "\\approx" : "="} ${ha.text}`);
/* Alles, was das Labor zeigt: Stoff, Masse, Mischwert und das Hebelgesetz (beide Seiten gleich) */
export function labor(m1, c1, m2, c2) {
  const M = m1 + m2;
  const s1 = mal(m1, prozent(c1)), s2 = mal(m2, prozent(c2)), S = plus(s1, s2);
  const c = mischwert([{ m: m1, c: c1 }, { m: m2, c: c2 }]);
  const abst = (x) => (wert(x) < 0 ? mal(x, -1) : x);
  const a1 = abst(minus(c, c1)), a2 = abst(minus(c2, c));
  const h1 = mal(m1, a1), h2 = mal(m2, a2);
  const ca = anzeige(c), a1a = anzeige(a1), a2a = anzeige(a2), ha = anzeige(h1, 1);
  const ungenau = !a1a.exakt || !a2a.exakt || !ha.exakt;
  return { M, s1, s2, S, c, a1, a2, h1, h2, ca,
    zeilen: [
      `\\text{Stoff: } ${zt(s1)} + ${zt(s2)} = ${zt(S)} \\text{ g in } ${m1} + ${m2} = ${M} \\text{ g}`,
      `c = \\frac{${zt(S)}}{${M}} ${gl(ca)} ${ca.text} %`,
      `\\text{Hebel links: } ${hebel(m1, a1, a1a, ha, ungenau)}, \\quad \\text{rechts: } ${hebel(m2, a2, a2a, ha, ungenau)}`,
    ] };
}
/* Wippe mit selbst gesetztem Unterstützungspunkt p: Gewicht mal Abstand links und rechts von p */
export function drehmomente(teile, p) {
  let links = 0, rechts = 0;
  for (const { m, c } of teile) {
    if (c < p) links += m * (p - c);
    else rechts += m * (c - p);
  }
  return { links, rechts };
}

/* ---------- Kontexte (eigene Formulierungen) ---------- */
/* max: höchster Massenanteil in Prozent, den es als Lösung bei Zimmertemperatur gibt
   (Kochsalz löst sich nur bis gut 26 %, Haushaltszucker bis etwa 67 %) */
const LOESUNG = [
  { id: "salz", stoff: "Salz", name: "Salzlösung", namen: "Salzlösungen", max: 24, akk: "das Salz", rein: "reines Salz", reinN: "reines Salz" },
  { id: "zucker", stoff: "Zucker", name: "Zuckerlösung", namen: "Zuckerlösungen", max: 60, akk: "den Zucker", rein: "reinen Zucker", reinN: "reiner Zucker" },
];
const ZWEI = [
  { id: "kaffee", wer: "Eine Rösterei", a: "Bohnen aus Brasilien", b: "Bohnen aus Äthiopien", ware: "Kaffee" },
  { id: "tee", wer: "Ein Teeladen", a: "Schwarztee", b: "Grüntee", ware: "Tee" },
  { id: "nuss", wer: "Ein Marktstand", a: "Erdnüsse", b: "Cashewkerne", ware: "Nussmischung" },
  { id: "bonbon", wer: "Ein Süßwarenladen", a: "Fruchtbonbons", b: "Schokolinsen", ware: "Naschmischung" },
];
const DREI_SORTEN = [
  { wer: "Für Studentenfutter mischt ein Bioladen", s: ["Rosinen", "Haselnüsse", "Mandeln"] },
  { wer: "Für ein Müsli mischt eine kleine Manufaktur", s: ["Haferflocken", "Trockenobst", "Walnüsse"] },
];
/* für das Gleichungssystem: Verhältnisse 3 : 5, 1 : 4, 1 : 3 und 13 : 7 – keine langen Tausendstel-Ketten */
const SILBER_LGS = [
  { c1: 800, c2: 1000, c: 925, z: "Sterlingsilber (925 ‰)", a: "800er Silber", b: "reines Silber" },
  { c1: 800, c2: 925, c: 900, z: "900er Silber", a: "800er Silber", b: "Sterlingsilber" },
  { c1: 900, c2: 1000, c: 925, z: "Sterlingsilber (925 ‰)", a: "900er Silber", b: "reines Silber" },
  { c1: 800, c2: 900, c: 835, z: "835er Silber", a: "800er Silber", b: "900er Silber" },
];
const SILBER = [
  { c1: 800, c2: 1000, c: 925, z: "Sterlingsilber (925 ‰ Silber)", a: "800er Silber", b: "reines Silber" },
  { c1: 800, c2: 1000, c: 900, z: "900er Silber", a: "800er Silber", b: "reines Silber" },
  { c1: 0, c2: 1000, c: 925, z: "Sterlingsilber (925 ‰ Silber)", a: "Kupfer", b: "reines Silber" },
  { c1: 0, c2: 1000, c: 750, z: "750er Gold (750 ‰ Gold)", a: "Legierungsmetall ohne Gold", b: "reines Gold" },
  { c1: 0, c2: 1000, c: 585, z: "585er Gold (585 ‰ Gold)", a: "Legierungsmetall ohne Gold", b: "reines Gold" },
  { c1: 585, c2: 1000, c: 750, z: "750er Gold", a: "585er Gold", b: "reines Gold" },
];

/* Kandidaten erzeugen, bis einer passt (fester Startwert → feste Aufgabe) */
function suche(erzeuge, passt, versuche = 600) {
  for (let i = 0; i < versuche; i++) { const x = erzeuge(); if (x && passt(x)) return x; }
  return null;
}

/* ---------- Übungen ---------- */
export const ARTEN = [
  { id: "mischwert", name: "Mischung berechnen" },
  { id: "mengen", name: "Mengen für ein Ziel" },
  { id: "verduennen", name: "Verdünnen" },
  { id: "lgs", name: "Gleichungssystem" },
];

const F = (k, tex, einheit, aria) => ({ k, tex, einheit, aria: aria || k });
const loesungAus = (soll) => Object.fromEntries(Object.entries(soll).map(([k, v]) => [k, dezimal(v)]));

/* 1 · Mischung berechnen */
function mischwertAufgabe(s, zufall) {
  if (s === 2 || s === 4) {
    if (s === 2) {
      const K = wahl(ZWEI, zufall);
      const o = suche(() => {
        const c1 = Q(zufall(50, 160), 10), c2 = plus(c1, Q(zufall(10, 140), 10));
        const m1 = zufall(2, 9), m2 = zufall(2, 9);
        return m1 === m2 ? null : { c1, c2, m1, m2, c: mischwert([{ m: m1, c: c1 }, { m: m2, c: c2 }]) };
      }, (x) => dezimal(x.c, 2) !== null) || { c1: Q(12), c2: Q(18), m1: 3, m2: 2, c: Q(72, 5) };
      return { art: "mischwert", stufe: s, typ: "preis", K, ...o, teile: [{ m: o.m1, c: o.c1 }, { m: o.m2, c: o.c2 }],
        text: `${K.wer} mischt ${o.m1} kg ${K.a} zu ${geld(o.c1)} € je kg mit ${o.m2} kg ${K.b} zu ${geld(o.c2)} € je kg. Was muss 1 kg der Mischung kosten, damit der Gesamtpreis gleich bleibt?`,
        felder: [F("c", "c", "€ je kg", "Preis je kg der Mischung")], soll: { c: o.c } };
    }
    const K = wahl(DREI_SORTEN, zufall);
    const o = suche(() => {
      const p = [zufall(30, 90), zufall(91, 150), zufall(151, 240)].map((x) => Q(x, 10));
      const m = [zufall(2, 7), zufall(2, 7), zufall(2, 7)];
      return { p, m, c: mischwert(m.map((mm, i) => ({ m: mm, c: p[i] }))) };
    }, (x) => dezimal(x.c, 2) !== null && new Set(x.m).size > 1) || { p: [Q(5), Q(12), Q(20)], m: [2, 3, 5], c: Q(146, 10) };
    const teile = o.m.map((m, i) => ({ m, c: o.p[i] }));
    return { art: "mischwert", stufe: s, typ: "preis", K, teile, c: o.c,
      text: `${K.wer} ${o.m[0]} kg ${K.s[0]} zu ${geld(o.p[0])} € je kg, ${o.m[1]} kg ${K.s[1]} zu ${geld(o.p[1])} € je kg und ${o.m[2]} kg ${K.s[2]} zu ${geld(o.p[2])} € je kg. Was kostet 1 kg der Mischung?`,
      felder: [F("c", "c", "€ je kg", "Preis je kg der Mischung")], soll: { c: o.c } };
  }
  const K = wahl(LOESUNG, zufall);
  const schritt = s === 3 ? 25 : 50;
  const o = suche(() => {
    const c1 = zufall(2, 12), c2 = c1 + zufall(4, 26);
    const m1 = schritt * zufall(2, s === 3 ? 16 : 14), m2 = schritt * zufall(2, s === 3 ? 16 : 14);
    return m1 === m2 || c2 > K.max ? null : { c1, c2, m1, m2, c: mischwert([{ m: m1, c: c1 }, { m: m2, c: c2 }]) };
  }, (x) => (s === 3 ? dezimal(x.c, 1) !== null && !ganz(x.c) : ganz(x.c))) || { c1: 5, c2: 20, m1: 200, m2: 100, c: Q(10) };
  const teile = [{ m: o.m1, c: o.c1 }, { m: o.m2, c: o.c2 }];
  if (s === 5) {
    return { art: "mischwert", stufe: s, typ: "umkehr", K, ...o, teile,
      text: `${o.m1} g ${K.name} mit ${o.c1} % ${K.stoff} werden mit ${o.m2} g einer zweiten ${K.name} gemischt. Die Mischung enthält ${dezimal(o.c)} % ${K.stoff}. Wie viel Prozent ${K.stoff} enthält die zweite Lösung?`,
      felder: [F("c2", "c_2", "%", "Prozentsatz der zweiten Lösung")], soll: { c2: R(o.c2) } };
  }
  return { art: "mischwert", stufe: s, typ: "prozent", K, ...o, teile,
    text: `${o.m1} g ${K.name} mit ${o.c1} % ${K.stoff} werden mit ${o.m2} g ${K.name} mit ${o.c2} % ${K.stoff} gemischt. Wie viel Prozent ${K.stoff} enthält die Mischung?`,
    felder: [F("c", "c", "%", "Prozentsatz der Mischung")], soll: { c: o.c } };
}

/* 2 · Mengen für eine Zielmischung (Mischungskreuz oder Gleichungssystem) */
function mengenAufgabe(s, zufall) {
  if (s === 5) {
    const L = wahl(SILBER, zufall);
    const k = kreuz(L.c1, L.c2, L.c);
    const teile = k.p1 + k.p2;
    const M = suche(() => teile * wahl([1, 2, 3, 4, 5, 10, 20, 25, 50], zufall), (m) => m >= 80 && m <= 1200) || teile * Math.ceil(100 / teile);
    const v = verteilen(L.c1, L.c2, L.c, M);
    return { art: "mengen", stufe: s, typ: "legierung", L, c1: L.c1, c2: L.c2, c: R(L.c), M, einheit: "g",
      text: `Ein Goldschmied will ${M} g ${L.z} herstellen. Er hat ${L.a} (${L.c1} ‰) und ${L.b} (${L.c2} ‰). Wie viel Gramm braucht er von jedem?`,
      legende: [`m₁: ${L.a}`, `m₂: ${L.b}`], felder: [F("m1", "m_1", "g", L.a), F("m2", "m_2", "g", L.b)], soll: { m1: v.m1, m2: v.m2 } };
  }
  if (s === 2) {
    const K = wahl(ZWEI, zufall);
    const o = suche(() => {
      const c1 = zufall(8, 20), c2 = c1 + zufall(4, 16), c = zufall(c1 + 1, c2 - 1);
      const k = kreuz(c1, c2, c);
      if (k.p1 + k.p2 > 16) return null;
      const M = (k.p1 + k.p2) * wahl([2, 3, 4, 5], zufall) * (k.p1 + k.p2 <= 4 ? wahl([2, 3, 5], zufall) : 1);
      return M >= 4 && M <= 60 ? { c1, c2, c, M, v: verteilen(c1, c2, c, M) } : null;
    }, () => true) || { c1: 18, c2: 30, c: 21, M: 12, v: verteilen(18, 30, 21, 12) };
    return { art: "mengen", stufe: s, typ: "preis", K, c1: R(o.c1), c2: R(o.c2), c: R(o.c), M: o.M, einheit: "kg",
      text: `${K.wer} will ${o.M} kg ${K.ware} zu ${geld(o.c)} € je kg anbieten. Gemischt werden ${K.a} zu ${geld(o.c1)} € je kg und ${K.b} zu ${geld(o.c2)} € je kg. Wie viel Kilogramm braucht man von jeder Sorte?`,
      legende: [`m₁: ${K.a}`, `m₂: ${K.b}`], felder: [F("m1", "m_1", "kg", K.a), F("m2", "m_2", "kg", K.b)], soll: { m1: o.v.m1, m2: o.v.m2 } };
  }
  const K = wahl(LOESUNG, zufall);
  const o = suche(() => {
    let c1, c2, c;
    if (s === 4) {
      c1 = Q(zufall(4, 30), 2); c2 = plus(c1, Q(zufall(8, 40), 2)); c = plus(c1, Q(zufall(1, Math.round(wert(minus(c2, c1)) * 10) - 1), 10));
      if (ganz(c1) && ganz(c2) && ganz(c)) return null;
    } else {
      c1 = zufall(2, 15); c2 = c1 + zufall(5, 30); c = zufall(c1 + 1, c2 - 1);
    }
    if (wert(c2) > K.max) return null;
    const k = kreuz(c1, c2, c);
    if (!k.gueltig || k.p1 + k.p2 > 24 || k.p1 === k.p2) return null;
    if (s === 3) {
      const m1 = k.p1 * wahl([10, 20, 25, 40, 50], zufall);
      const m2 = durch(mal(m1, k.p2), k.p1);
      return m1 <= 800 && wert(m2) <= 1200 ? { c1, c2, c, m1, m2, k } : null;
    }
    const M = (k.p1 + k.p2) * wahl(s === 4 ? [5, 10, 20, 25] : [10, 20, 25, 40, 50], zufall);
    return M >= 200 && M <= 2000 ? { c1, c2, c, M, v: verteilen(c1, c2, c, M) } : null;
  }, (x) => (s === 4 ? dezimal(x.v.m1, 1) !== null && dezimal(x.v.m2, 1) !== null : true)) || { c1: 5, c2: 20, c: 12, M: 600, v: verteilen(5, 20, 12, 600), m1: 320, m2: Q(280) };
  const leg = [`m₁: Lösung mit ${dezimal(o.c1)} %`, `m₂: Lösung mit ${dezimal(o.c2)} %`];
  if (s === 3) {
    return { art: "mengen", stufe: s, typ: "vorrat", K, c1: R(o.c1), c2: R(o.c2), c: R(o.c), m1: o.m1, einheit: "g",
      text: `Du hast ${o.m1} g ${K.name} mit ${dezimal(o.c1)} % ${K.stoff}. Mit einer ${K.name} mit ${dezimal(o.c2)} % willst du daraus eine Lösung mit ${dezimal(o.c)} % machen und deinen Vorrat ganz aufbrauchen. Wie viel Gramm der ${dezimal(o.c2)}-%-Lösung brauchst du, und wie viel Gramm Mischung entstehen?`,
      legende: [`m₂: Lösung mit ${dezimal(o.c2)} %`, "M: Mischung insgesamt"],
      felder: [F("m2", "m_2", "g", `Lösung mit ${dezimal(o.c2)} %`), F("M", "M", "g", "Mischung insgesamt")], soll: { m2: o.m2, M: plus(o.m1, o.m2) } };
  }
  return { art: "mengen", stufe: s, typ: "prozent", K, c1: R(o.c1), c2: R(o.c2), c: R(o.c), M: o.M, einheit: "g",
    text: `Du brauchst ${o.M} g ${K.name} mit ${dezimal(o.c)} % ${K.stoff}. Im Regal stehen ${K.namen} mit ${dezimal(o.c1)} % und mit ${dezimal(o.c2)} %. Wie viel Gramm nimmst du von jeder?`,
    legende: leg, felder: [F("m1", "m_1", "g", leg[0].slice(4)), F("m2", "m_2", "g", leg[1].slice(4))], soll: { m1: o.v.m1, m2: o.v.m2 } };
}

/* 3 · Verdünnen und Aufkonzentrieren */
function verduennenAufgabe(s, zufall) {
  const K = wahl(LOESUNG, zufall);
  if (s === 5) {
    const essig = zufall(0, 1) === 0;
    const o = suche(() => {
      const c1 = essig ? 25 : wahl([10, 12, 15, 16, 20, 24, 30, 40].filter((x) => x <= K.max), zufall);
      const c = essig ? wahl([5, 5, 4, 10], zufall) : zufall(2, c1 - 2);
      const k = kreuz(0, c1, c);                     // Sorte 1 = Wasser (0 %), Sorte 2 = Konzentrat
      if (k.p1 + k.p2 > 20) return null;
      const M = (k.p1 + k.p2) * wahl([10, 20, 25, 50, 100], zufall);
      return M >= 200 && M <= 2000 ? { c1, c, M, v: verteilen(0, c1, c, M) } : null;
    }, () => true) || { c1: 25, c: 5, M: 1000, v: verteilen(0, 25, 5, 1000) };
    const text = essig
      ? `Essigessenz enthält ${o.c1} % Säure. Für Salatessig sollen ${o.M} g mit ${o.c} % Säure entstehen. Wie viel Gramm Essigessenz und wie viel Gramm Wasser brauchst du?`
      : `Aus einer ${K.name} mit ${o.c1} % ${K.stoff} und Wasser sollen ${o.M} g Lösung mit ${o.c} % ${K.stoff} entstehen. Wie viel Gramm der ${o.c1}-%-Lösung und wie viel Gramm Wasser brauchst du?`;
    return { art: "verduennen", stufe: s, typ: "ansetzen", K, essig, c1: R(o.c1), c: R(o.c), M: o.M, text,
      legende: [essig ? "L: Essigessenz" : `L: Lösung mit ${o.c1} %`, "W: Wasser"],
      felder: [F("L", "L", "g", essig ? "Essigessenz" : `Lösung mit ${o.c1} %`), F("W", "W", "g", "Wasser")], soll: { L: o.v.m2, W: o.v.m1 } };
  }
  const o = suche(() => {
    const m = 50 * zufall(2, 16);
    if (s === 1) {
      const c1 = zufall(6, Math.min(40, K.max)), c = zufall(2, c1 - 2);
      const w = durch(mal(m, c1 - c), c);
      return ganz(w) && wert(w) <= 3000 ? { m, c1, c, w } : null;
    }
    if (s === 2) {
      const c1 = zufall(6, Math.min(40, K.max)), w = 50 * zufall(1, 16);
      const c = durch(m * c1, m + w);
      return dezimal(c, 1) !== null ? { m, c1, w, c } : null;
    }
    if (s === 3) {
      const c1 = zufall(2, 16), c = c1 + zufall(3, 30);
      const x = durch(mal(m, c - c1), 100 - c);       // Kreuz mit reinem Stoff (100 %)
      return ganz(x) && wert(x) <= 600 && c <= K.max ? { m, c1, c, x } : null;
    }
    const c1 = zufall(2, 16), c = c1 + zufall(2, 25);
    const w = durch(mal(m, c - c1), c);                // verdampftes Wasser
    return ganz(w) && c <= K.max ? { m, c1, c, w } : null;
  }, () => true) || [null, { m: 400, c1: 15, c: 6, w: Q(600) }, { m: 400, c1: 15, w: 600, c: Q(6) }, { m: 300, c1: 10, c: 25, x: Q(60) }, { m: 600, c1: 10, c: 15, w: Q(200) }][s];
  const basis = { art: "verduennen", stufe: s, K, m: o.m, c1: R(o.c1) };
  if (s === 1) return { ...basis, typ: "wasser", c: R(o.c),
    text: `${o.m} g ${K.name} mit ${o.c1} % ${K.stoff} sollen auf ${o.c} % verdünnt werden. Wie viel Gramm Wasser musst du dazugeben?`,
    felder: [F("w", "w", "g", "Wasser")], soll: { w: o.w } };
  if (s === 2) return { ...basis, typ: "neu", w: o.w,
    text: `Zu ${o.m} g ${K.name} mit ${o.c1} % ${K.stoff} gibst du ${o.w} g Wasser. Wie viel Prozent ${K.stoff} enthält die neue Lösung?`,
    felder: [F("c", "c", "%", "Prozentsatz der neuen Lösung")], soll: { c: o.c } };
  if (s === 3) return { ...basis, typ: "rein", c: R(o.c),
    text: `${o.m} g ${K.name} mit ${o.c1} % ${K.stoff} sollen ${o.c} % bekommen. Dazu löst du ${K.rein} darin auf. Wie viel Gramm ${K.stoff} brauchst du?`,
    felder: [F("x", "x", "g", K.reinN)], soll: { x: o.x } };
  return { ...basis, typ: "verdampfen", c: R(o.c),
    text: `${o.m} g ${K.name} mit ${o.c1} % ${K.stoff} werden erhitzt, bis so viel Wasser verdampft ist, dass die Lösung ${o.c} % ${K.stoff} enthält. Wie viel Gramm Wasser verdampfen?`,
    felder: [F("w", "w", "g", "verdampftes Wasser")], soll: { w: o.w } };
}

/* 4 · Gleichungssystem aufstellen und lösen: I x + y = S, II A·x + B·y = W */
function lgsAufgabe(s, zufall) {
  let o;
  if (s === 1) {
    const K = wahl(ZWEI, zufall);
    o = suche(() => {
      const a = zufall(8, 20), b = a + zufall(2, 14), x = zufall(2, 24), y = zufall(2, 24);
      return x === y ? null : { K, A: R(a), B: R(b), x: R(x), y: R(y) };
    }, () => true);
    o.S = plus(o.x, o.y); o.W = plus(mal(o.A, o.x), mal(o.B, o.y));
    o.text = `${o.K.wer} hat ${dezimal(o.S)} kg ${o.K.ware} aus zwei Sorten gemischt: ${o.K.a} zu ${geld(o.A)} € je kg und ${o.K.b} zu ${geld(o.B)} € je kg. Zusammen haben die Zutaten ${geld(o.W)} € gekostet.`;
    o.xy = [`x: kg ${o.K.a}`, `y: kg ${o.K.b}`];
  } else if (s === 2) {
    o = suche(() => {
      const x = zufall(4, 40), y = zufall(4, 60);
      return x === y ? null : { A: R(2), B: Q(1, 2), x: R(x), y: R(y) };
    }, () => true);
    o.S = plus(o.x, o.y); o.W = plus(mal(o.A, o.x), mal(o.B, o.y));
    o.text = `In einer Spendendose liegen nur 2-€-Münzen und 50-Cent-Münzen, zusammen ${dezimal(o.S)} Stück im Wert von ${geld(o.W)} €.`;
    o.xy = ["x: Anzahl der 2-€-Münzen", "y: Anzahl der 50-Cent-Münzen"];
  } else if (s === 3) {
    const K = wahl(ZWEI, zufall);
    o = suche(() => {
      const a = zufall(8, 20), b = a + zufall(2, 14), x = zufall(2, 20), y = zufall(2, 20);
      if (x === y) return null;
      const c = durch(a * x + b * y, x + y);
      return dezimal(c, 2) !== null ? { K, A: R(a), B: R(b), x: R(x), y: R(y), c } : null;
    }, () => true) || { K, A: R(18), B: R(30), x: R(9), y: R(3), c: R(21) };
    o.S = plus(o.x, o.y); o.W = mal(o.S, o.c);
    o.text = `${o.K.wer} mischt ${o.K.a} zu ${geld(o.A)} € je kg und ${o.K.b} zu ${geld(o.B)} € je kg zu ${dezimal(o.S)} kg ${o.K.ware}. 1 kg der Mischung kostet ${geld(o.c)} €.`;
    o.xy = [`x: kg ${o.K.a}`, `y: kg ${o.K.b}`];
  } else if (s === 4) {
    const K = wahl(LOESUNG, zufall);
    o = suche(() => {
      const c1 = zufall(2, 15), c2 = c1 + zufall(5, 30), x = 20 * zufall(2, 30), y = 20 * zufall(2, 30);
      if (x === y || c2 > K.max) return null;
      const c = durch(c1 * x + c2 * y, x + y);
      return dezimal(c, 1) !== null ? { K, c1, c2, A: prozent(c1), B: prozent(c2), x: R(x), y: R(y), c } : null;
    }, () => true) || { K, c1: 5, c2: 20, A: prozent(5), B: prozent(20), x: R(320), y: R(280), c: R(12) };
    o.S = plus(o.x, o.y); o.W = mal(o.S, prozent(o.c));
    o.text = `Aus ${o.K.namen} mit ${o.c1} % und mit ${o.c2} % ${o.K.stoff} sollen ${dezimal(o.S)} g Lösung mit ${dezimal(o.c)} % ${o.K.stoff} entstehen. In Gleichung II zählst du ${o.K.akk} in Gramm.`;
    o.xy = [`x: g der Lösung mit ${o.c1} %`, `y: g der Lösung mit ${o.c2} %`];
  } else {
    const L = wahl(SILBER_LGS, zufall);
    const k = kreuz(L.c1, L.c2, L.c);
    const M = suche(() => (k.p1 + k.p2) * wahl([1, 2, 4, 5, 10, 20], zufall), (m) => m >= 80 && m <= 1200) || (k.p1 + k.p2) * Math.ceil(80 / (k.p1 + k.p2));
    const v = verteilen(L.c1, L.c2, L.c, M);
    o = { L, A: Q(L.c1, 1000), B: Q(L.c2, 1000), x: v.m1, y: v.m2, S: R(M) };
    o.W = mal(o.S, Q(L.c, 1000));
    o.text = `Ein Goldschmied schmilzt ${L.a} (${L.c1} ‰) und ${L.b} (${L.c2} ‰) zu ${M} g ${L.z} zusammen. In Gleichung II zählst du das reine Silber in Gramm.`;
    o.xy = [`x: g ${L.a}`, `y: g ${L.b}`];
  }
  return { art: "lgs", stufe: s, ...o,
    text: `${o.text} Stelle das Gleichungssystem auf (I: Mengen, II: Werte) und löse es.`,
    legende: o.xy,
    felder: [F("S", "", "", "Gleichung I rechte Seite"), F("A", "", "", "Gleichung II Faktor vor x"), F("B", "", "", "Gleichung II Faktor vor y"),
      F("W", "", "", "Gleichung II rechte Seite"), F("x", "x", "", "x"), F("y", "y", "", "y")],
    soll: { S: o.S, A: o.A, B: o.B, W: o.W, x: o.x, y: o.y } };
}

export function aufgabe(art, stufe, zufall = zz) {
  const s = stufeIn(stufe);
  const a = art === "mengen" ? mengenAufgabe(s, zufall) : art === "verduennen" ? verduennenAufgabe(s, zufall)
    : art === "lgs" ? lgsAufgabe(s, zufall) : mischwertAufgabe(s, zufall);
  return { ...a, loesung: loesungAus(a.soll) };
}

export const felder = (a) => a.felder;
export const auftrag = (a) => a.text;

/* ---------- Prüfen ---------- */
/* Prüfen: { feld: eingabe } → { ok, felder: { feld: true/false }, grund } */
export function pruefe(a, eingabe = {}) {
  const ist = Object.fromEntries(a.felder.map(({ k }) => [k, lies(eingabe[k])]));
  const erg = {};
  if (a.art === "lgs") {
    /* II darf mit einer Zahl multipliziert sein (6x + 18y = 9240 statt 0,06x + 0,18y = 92,4) */
    const { A, B, W } = ist;
    const propAB = !!(A && B && wert(A) !== 0 && gleich(mal(A, a.soll.B), mal(B, a.soll.A)));
    erg.S = !!ist.S && gleich(ist.S, a.soll.S);
    erg.A = erg.B = propAB;
    erg.W = propAB && !!W && gleich(mal(A, a.soll.W), mal(W, a.soll.A));
    erg.x = !!ist.x && gleich(ist.x, a.soll.x);
    erg.y = !!ist.y && gleich(ist.y, a.soll.y);
  } else {
    for (const { k } of a.felder) erg[k] = !!ist[k] && gleich(ist[k], a.soll[k]);
  }
  const ok = Object.values(erg).every(Boolean);
  return { ok, felder: erg, grund: ok ? "" : grundFuer(a, ist, erg) };
}

const istGleich = (x, y) => x !== null && x !== undefined && gleich(x, y);
const LEER = "Trag in jedes Feld eine Zahl ein – ganz, als Dezimalzahl (12,5) oder als Bruch (25/2).";

function grundFuer(a, ist, erg) {
  const leer = a.felder.find(({ k }) => !ist[k]);
  if (leer) return LEER;
  if (a.art === "mischwert") return mischwertFehler(a, ist);
  if (a.art === "mengen") return mengenFehler(a, ist, erg);
  if (a.art === "verduennen") return verduennenFehler(a, ist, erg);
  return lgsFehler(a, ist, erg);
}

function mischwertFehler(a, ist) {
  const preis = a.typ === "preis";
  if (a.typ === "umkehr") {
    const v = ist.c2;
    if (istGleich(v, minus(mal(2, a.c), a.c1))) return `Das wäre richtig, wenn beide Mengen gleich wären. Hier sind sie verschieden – rechne über ${a.K.akk} in Gramm.`;
    if (wert(v) <= wert(a.c)) return `Die zweite Lösung muss stärker sein als die Mischung: Die erste hat nur ${a.c1} %, die Mischung aber ${dezimal(a.c)} %.`;
    if (istGleich(v, durch(mal(a.m1 + a.m2, a.c), a.m2))) return "Von der Gesamtmenge an Stoff stammt ein Teil schon aus der ersten Lösung – zieh ihn ab, bevor du durch m₂ teilst.";
    return `Stoff gesamt = (m₁ + m₂) · c. Davon stammen m₁ · c₁ aus der ersten Lösung, der Rest aus den ${a.m2} g der zweiten.`;
  }
  const v = ist.c, t = a.teile;
  const cs = t.map((x) => R(x.c)), ms = t.map((x) => x.m);
  const einfach = durch(summe(cs), cs.length);
  const zaehler = summe(t.map((x) => mal(x.m, x.c)));
  const lo = Math.min(...cs.map(wert)), hi = Math.max(...cs.map(wert));
  if (istGleich(v, einfach) && !ms.every((m) => m === ms[0])) return `Das ist der einfache Mittelwert. Er stimmt nur bei gleichen Mengen – hier ist von einer Sorte mehr da, und sie zählt stärker.`;
  if (istGleich(v, summe(cs))) return preis ? "Preise je kg addieren sich beim Mischen nicht. Addiere die Gesamtpreise und teile durch die Gesamtmenge." : "Prozente addieren sich beim Mischen nicht. Addiere die Gramm Stoff und teile durch die Gesamtmenge.";
  if (t.length === 2 && istGleich(v, durch(plus(mal(t[1].m, t[0].c), mal(t[0].m, t[1].c)), ms[0] + ms[1]))) return "Die Gewichte sind vertauscht: Jeder Wert wird mit der Menge SEINER Sorte multipliziert.";
  if (!preis && istGleich(v, prozent(a.c))) return `Richtig gerechnet, aber als Anteil angegeben. Gefragt sind Prozent: ${dezimal(prozent(a.c))} = ${dezimal(a.c)} %.`;
  if (istGleich(v, zaehler) || istGleich(v, prozent(zaehler))) return preis ? "Das ist der Gesamtpreis der Mischung. Teile noch durch die Gesamtmenge in kg." : "Das ist die Menge Stoff in Gramm (oder ihr Hundertfaches). Teile noch durch die Gesamtmenge.";
  if (wert(v) < lo || wert(v) > hi) return `Eine Mischung liegt immer zwischen ihren Sorten – hier zwischen ${preis ? geld(lo) : dezimal(R(lo))} und ${preis ? geld(hi) : dezimal(R(hi))}.`;
  return preis ? "Gesamtpreis : Gesamtmenge. Gesamtpreis = Summe aus Menge · Preis je kg jeder Sorte." : "Mischungsgleichung: c = (m₁ · c₁ + m₂ · c₂) : (m₁ + m₂). Rechne zuerst die Gramm Stoff jeder Lösung aus.";
}

function mengenFehler(a, ist, erg) {
  const k = kreuz(a.c1, a.c2, a.c);
  if (a.typ === "vorrat") {
    if (!erg.m2) {
      if (istGleich(ist.m2, durch(mal(a.m1, k.p1), k.p2))) return "Das Verhältnis ist umgedreht: Im Kreuz gehört c₂ − c zur ersten Lösung und c − c₁ zur zweiten.";
      if (istGleich(ist.m2, a.m1)) return "Gleich viel von beiden ergibt nur den einfachen Mittelwert. Rechne das Verhältnis mit dem Mischungskreuz aus.";
      return `Mischungskreuz: m₁ : m₂ = (c₂ − c) : (c − c₁). Deine ${a.m1} g sind ${k.p1} Teile – wie groß ist dann ein Teil?`;
    }
    return "Die Gesamtmenge ist einfach m₁ + m₂: dein Vorrat plus die zugegebene Lösung.";
  }
  const { m1, m2 } = ist, s = a.soll;
  if (istGleich(m1, s.m2) && istGleich(m2, s.m1)) return "Vertauscht: Von der Sorte, die näher am Zielwert liegt, braucht man mehr. Im Kreuz gehört c₂ − c zu Sorte 1.";
  if (istGleich(m1, durch(a.M, 2)) && istGleich(m2, durch(a.M, 2))) return "Halbe-halbe ergibt nur den einfachen Mittelwert der beiden Sorten. Der Zielwert liegt aber nicht genau in der Mitte.";
  if (istGleich(m1, k.d1) && istGleich(m2, k.d2) || istGleich(m1, k.p1) && istGleich(m2, k.p2)) return `Das ist das Verhältnis in Teilen. Verteile noch die ${dezimal(a.M)} ${a.einheit} auf ${k.p1 + k.p2} Teile.`;
  if (!istGleich(plus(m1, m2), a.M)) return `Zusammen müssen es genau ${dezimal(a.M)} ${a.einheit} sein.`;
  return "Die Summe stimmt, das Verhältnis nicht. Probe mit dem Wert: m₁ · c₁ + m₂ · c₂ muss (m₁ + m₂) · c ergeben.";
}

function verduennenFehler(a, ist, erg) {
  const stoff = mal(a.m, prozent(a.c1));
  if (a.typ === "wasser") {
    const neu = durch(stoff, prozent(a.c));
    if (istGleich(ist.w, neu)) return "Das ist die Menge der fertigen Lösung. Deine Lösung ist schon darin – zieh ihre Masse ab.";
    if (istGleich(ist.w, a.m)) return "Gleich viel Wasser halbiert die Konzentration nur. Rechne über den Stoff, der beim Verdünnen gleich bleibt.";
    return `Der Stoff bleibt gleich: ${dezimal(stoff)} g. Die neue Lösung muss so schwer sein, dass diese ${dezimal(stoff)} g genau ${dezimal(a.c)} % sind.`;
  }
  if (a.typ === "neu") {
    if (istGleich(ist.c, durch(mal(a.c1, a.m), a.w))) return "Teile durch die ganze neue Lösung (Lösung plus Wasser), nicht nur durch das Wasser.";
    if (wert(ist.c) >= wert(a.c1)) return "Durch Wasser wird eine Lösung schwächer, nie stärker.";
    return `Stoff: ${dezimal(stoff)} g. Neue Masse: ${a.m} g + ${dezimal(a.w)} g. Prozentsatz = Stoff : neue Masse.`;
  }
  if (a.typ === "rein") {
    if (istGleich(ist.x, mal(a.m, prozent(minus(a.c, a.c1))))) return `Auch das zugegebene ${a.K.stoff} macht die Lösung schwerer – die ${dezimal(a.c)} % beziehen sich auf die neue Masse. Nimm das Kreuz mit 100 % für ${a.K.rein}.`;
    return `${a.K.reinN.charAt(0).toUpperCase()}${a.K.reinN.slice(1)} ist eine „Lösung“ mit 100 %. Kreuz: Lösung : ${a.K.stoff} = (100 − c) : (c − c₁).`;
  }
  if (a.typ === "verdampfen") {
    const rest = durch(stoff, prozent(a.c));
    if (istGleich(ist.w, rest)) return "Das ist die Lösung, die übrig bleibt. Gefragt ist, wie viel Wasser verdampft ist.";
    return `Der Stoff bleibt: ${dezimal(stoff)} g. Sie sollen ${dezimal(a.c)} % der übrigen Lösung sein – daraus folgt, wie viel übrig bleibt.`;
  }
  /* ansetzen */
  if (istGleich(ist.L, a.soll.W) && istGleich(ist.W, a.soll.L)) return "Vertauscht: Von der starken Lösung braucht man wenig, vom Wasser viel.";
  if (!istGleich(plus(ist.L, ist.W), a.M)) return `Zusammen müssen es ${a.M} g sein.`;
  return "Kreuz mit Wasser (0 %): Lösung : Wasser = (c − 0) : (c₁ − c).";
}

function lgsFehler(a, ist, erg) {
  const s = a.soll;
  if (!erg.S) {
    if (istGleich(ist.S, s.W)) return "In Gleichung I stehen die Mengen, nicht der Gesamtwert: x + y = Gesamtmenge.";
    return "Gleichung I zählt die Mengen: Zusammen sind es so viele kg, Gramm oder Stück, wie im Text stehen.";
  }
  if (!erg.A) {
    if (gleich(mal(ist.A, s.A), mal(ist.B, s.B))) return "In Gleichung II gehört der Wert jeder Sorte zu IHRER Variablen – du hast die Faktoren vor x und y vertauscht.";
    return "Gleichung II zählt die Werte: Wert je Einheit von Sorte 1 mal x plus Wert je Einheit von Sorte 2 mal y.";
  }
  if (!erg.W) {
    /* rechts nur der Mischwert je Einheit statt des Gesamtwerts */
    if (a.stufe >= 3 && istGleich(mal(ist.W, s.A), mal(durch(s.W, s.S), ist.A))) return a.stufe === 3
      ? "Rechts steht der Gesamtwert der Mischung: Gesamtmenge · Preis je kg – nicht nur der Preis je kg."
      : "Rechts steht die Menge Stoff in Gramm: Gesamtmenge · Anteil – nicht der Anteil allein.";
    return "Die linke Seite von II passt, die rechte nicht: Rechts steht der Gesamtwert (der genannte Betrag bzw. Gesamtmenge · Mischwert).";
  }
  if (istGleich(ist.x, s.y) && istGleich(ist.y, s.x)) return "x und y sind vertauscht – schau in die Legende, wofür x und y stehen.";
  if (!istGleich(plus(ist.x, ist.y), s.S)) return `Probe mit I: x + y muss ${dezimal(s.S)} ergeben.`;
  return "Probe mit II: Setz x und y in Gleichung II ein – die rechte Seite stimmt noch nicht.";
}

/* ---------- Rechenweg (TeX-Zeilen, jede bis zur einfachsten Form) ---------- */
const z = (q) => zt(q);
/* Faktor vor einer Variablen: 1 → „“, −1 → „−“ */
const vor = (q, v) => { q = R(q); return gleich(q, 1) ? v : gleich(q, -1) ? `−${v}` : `${z(q)}${v}`; };
/* p Teile zu je teil: „3 · 40 = 120“, bei einem Teil nur „40“ */
const teileMal = (p, teil) => (p === 1 ? z(teil) : gleich(teil, 1) ? String(p) : `${p} \\cdot ${z(teil)} = ${z(mal(p, teil))}`);

export function rechenweg(a) {
  if (a.art === "mischwert") {
    if (a.typ === "preis") {
      const t = a.teile, P = t.map((x) => mal(x.m, x.c)), PS = summe(P), MS = summe(t.map((x) => x.m));
      return [
        ...t.map((x, i) => `\\text{Sorte ${i + 1}: } ${x.m} \\cdot ${geld(x.c)} = ${geld(P[i])} \\text{ €}`),
        `\\text{Gesamtpreis: } ${P.map(geld).join(" + ")} = ${geld(PS)} \\text{ €}`,
        `\\text{Gesamtmenge: } ${t.map((x) => x.m).join(" + ")} = ${z(MS)} \\text{ kg}`,
        `c = \\frac{${geld(PS)}}{${z(MS)}} = ${geld(a.c)} \\text{ € je kg}`,
      ];
    }
    const st = a.K.stoff, s1 = mal(a.m1, prozent(a.c1)), M = a.m1 + a.m2;
    if (a.typ === "umkehr") {
      const S = mal(M, prozent(a.c)), s2 = minus(S, s1);
      return [
        `\\text{Mischung: } ${a.m1} + ${a.m2} = ${M} \\text{ g}`,
        `\\text{${st} gesamt: } ${M} \\cdot ${z(a.c)} % = ${z(S)} \\text{ g}`,
        `\\text{aus Lösung 1: } ${a.m1} \\cdot ${a.c1} % = ${z(s1)} \\text{ g}`,
        `\\text{aus Lösung 2: } ${z(S)} − ${z(s1)} = ${z(s2)} \\text{ g}`,
        `c_2 = \\frac{${z(s2)}}{${a.m2}} = ${z(durch(s2, a.m2))} = ${z(a.c2)} %`,
      ];
    }
    const s2 = mal(a.m2, prozent(a.c2)), S = plus(s1, s2);
    return [
      `\\text{Lösung 1: } ${a.m1} \\cdot ${a.c1} % = ${z(s1)} \\text{ g ${st}}`,
      `\\text{Lösung 2: } ${a.m2} \\cdot ${a.c2} % = ${z(s2)} \\text{ g ${st}}`,
      `\\text{Mischung: } ${a.m1} + ${a.m2} = ${M} \\text{ g}`,
      `\\text{${st}: } ${z(s1)} + ${z(s2)} = ${z(S)} \\text{ g}`,
      `c = \\frac{${z(S)}}{${M}} = ${z(durch(S, M))} = ${z(a.c)} %`,
    ];
  }
  if (a.art === "mengen") {
    const k = kreuz(a.c1, a.c2, a.c), e = a.einheit;
    const zeilen = [
      `\\text{Sorte 1: } c_2 − c = ${z(a.c2)} − ${z(a.c)} = ${z(k.d1)}`,
      `\\text{Sorte 2: } c − c_1 = ${z(a.c)} − ${z(a.c1)} = ${z(k.d2)}`,
      gleich(k.d1, k.p1) && gleich(k.d2, k.p2) ? `m_1 : m_2 = ${k.p1} : ${k.p2}` : `m_1 : m_2 = ${z(k.d1)} : ${z(k.d2)} = ${k.p1} : ${k.p2}`,
    ];
    if (a.typ === "vorrat") {
      const teil = durch(a.m1, k.p1);
      zeilen.push(
        `${k.p1} \\text{ Teile} = ${a.m1} \\text{ g}`,
        `1 \\text{ Teil} = \\frac{${a.m1}}{${k.p1}} = ${z(teil)} \\text{ g}`,
        `m_2 = ${teileMal(k.p2, teil)} \\text{ g}`,
        `M = ${a.m1} + ${z(a.soll.m2)} = ${z(a.soll.M)} \\text{ g}`,
      );
      return zeilen;
    }
    const v = verteilen(a.c1, a.c2, a.c, a.M);
    zeilen.push(
      `${k.p1} + ${k.p2} = ${k.p1 + k.p2} \\text{ Teile}`,
      `1 \\text{ Teil} = \\frac{${z(a.M)}}{${k.p1 + k.p2}} = ${z(v.teil)} \\text{ ${e}}`,
      `m_1 = ${teileMal(k.p1, v.teil)} \\text{ ${e}}`,
      `m_2 = ${teileMal(k.p2, v.teil)} \\text{ ${e}}`,
    );
    if (a.typ === "preis") {
      const W1 = mal(v.m1, a.c1), W2 = mal(v.m2, a.c2);
      zeilen.push(`\\text{Probe: } ${z(v.m1)} \\cdot ${geld(a.c1)} + ${z(v.m2)} \\cdot ${geld(a.c2)} = ${geld(W1)} + ${geld(W2)} = ${geld(plus(W1, W2))} \\text{ €}`);
      zeilen.push(`${z(a.M)} \\cdot ${geld(a.c)} = ${geld(mal(a.M, a.c))} \\text{ €} ✓`);
    }
    return zeilen;
  }
  if (a.art === "verduennen") {
    const st = a.K.stoff, stoff = mal(a.m, prozent(a.c1));
    const bleibt = `\\text{${st}: } ${a.m} \\cdot ${z(a.c1)} % = ${z(stoff)} \\text{ g (bleibt gleich)}`;
    if (a.typ === "wasser" || a.typ === "verdampfen") {
      const neu = durch(stoff, prozent(a.c));
      const wo = a.typ === "wasser" ? "der neuen Lösung" : "des Rests";
      return [
        bleibt,
        `${z(stoff)} \\text{ g sind } ${z(a.c)} % \\text{ ${wo}}`,
        `\\text{${a.typ === "wasser" ? "neue Lösung" : "Rest"}: } \\frac{${z(stoff)}}{${z(prozent(a.c))}} = ${z(neu)} \\text{ g}`,
        a.typ === "wasser" ? `\\text{Wasser: } ${z(neu)} − ${a.m} = ${z(a.soll.w)} \\text{ g}` : `\\text{verdampft: } ${a.m} − ${z(neu)} = ${z(a.soll.w)} \\text{ g}`,
      ];
    }
    if (a.typ === "neu") {
      const M = plus(a.m, a.w);
      return [
        bleibt,
        `\\text{neue Lösung: } ${a.m} + ${z(a.w)} = ${z(M)} \\text{ g}`,
        `c = \\frac{${z(stoff)}}{${z(M)}} = ${z(durch(stoff, M))} = ${z(a.soll.c)} %`,
      ];
    }
    if (a.typ === "rein") {
      const k = kreuz(a.c1, 100, a.c), teil = durch(a.m, k.p1);
      return [
        `\\text{${a.K.reinN}: } 100 %`,
        `\\text{Lösung: } 100 − ${z(a.c)} = ${z(k.d1)}`,
        `\\text{${st}: } ${z(a.c)} − ${z(a.c1)} = ${z(k.d2)}`,
        gleich(k.d1, k.p1) ? `\\text{Lösung} : \\text{${st}} = ${k.p1} : ${k.p2}` : `\\text{Lösung} : \\text{${st}} = ${z(k.d1)} : ${z(k.d2)} = ${k.p1} : ${k.p2}`,
        `${k.p1} \\text{ Teile} = ${a.m} \\text{ g}`,
        `1 \\text{ Teil} = \\frac{${a.m}}{${k.p1}} = ${z(teil)} \\text{ g}`,
        `x = ${teileMal(k.p2, teil)} \\text{ g}`,
      ];
    }
    const k = kreuz(0, a.c1, a.c), v = verteilen(0, a.c1, a.c, a.M);
    return [
      `\\text{Wasser (0 %): } ${z(a.c1)} − ${z(a.c)} = ${z(k.d1)}`,
      `\\text{Lösung: } ${z(a.c)} − 0 = ${z(k.d2)}`,
      gleich(k.d1, k.p1) ? `W : L = ${k.p1} : ${k.p2}` : `W : L = ${z(k.d1)} : ${z(k.d2)} = ${k.p1} : ${k.p2}`,
      `${k.p1} + ${k.p2} = ${k.p1 + k.p2} \\text{ Teile}`,
      `1 \\text{ Teil} = \\frac{${a.M}}{${k.p1 + k.p2}} = ${z(v.teil)} \\text{ g}`,
      `L = ${teileMal(k.p2, v.teil)} \\text{ g}`,
      `W = ${teileMal(k.p1, v.teil)} \\text{ g}`,
    ];
  }
  /* lgs: Einsetzungsverfahren */
  const { S, A, B, W, x, y } = a.soll;
  const AS = mal(A, S), d = minus(B, A), rechts = minus(W, AS);
  const zeilen = [
    `\\text{I: } x + y = ${z(S)}`,
    `\\text{II: } ${vor(A, "x")} + ${vor(B, "y")} = ${z(W)}`,
    `\\text{aus I: } x = ${z(S)} − y`,
    `\\text{in II: } ${gleich(A, 1) ? "" : `${z(A)} \\cdot `}(${z(S)} − y) + ${vor(B, "y")} = ${z(W)}`,
    `${z(AS)} − ${vor(A, "y")} + ${vor(B, "y")} = ${z(W)}`,
    wert(d) > 0 ? `${z(AS)} + ${vor(d, "y")} = ${z(W)}` : `${z(AS)} − ${vor(mal(d, -1), "y")} = ${z(W)}`,
  ];
  const dd = wert(d) > 0 ? d : mal(d, -1), rr = wert(d) > 0 ? rechts : mal(rechts, -1);
  if (gleich(dd, 1)) zeilen.push(`y = ${z(rr)}`);
  else zeilen.push(`${vor(dd, "y")} = ${z(rr)}`, `y = \\frac{${z(rr)}}{${z(dd)}} = ${z(y)}`);
  zeilen.push(`x = ${z(S)} − ${z(y)} = ${z(x)}`);
  const px = mal(A, x), py = mal(B, y);
  const teilA = gleich(A, 1) ? z(x) : `${z(A)} \\cdot ${z(x)}`, teilB = gleich(B, 1) ? z(y) : `${z(B)} \\cdot ${z(y)}`;
  zeilen.push(`\\text{Probe II: } ${teilA} + ${teilB} = ${z(px)} + ${z(py)} = ${z(W)} ✓`);
  return zeilen;
}

export function tipp(a) {
  if (a.art === "mischwert") return a.typ === "umkehr"
    ? "Rechne in Gramm Stoff: Stoff der Mischung minus Stoff der ersten Lösung = Stoff der zweiten. Dann durch ihre Masse teilen."
    : "Werte (Gramm Stoff bzw. Euro) addieren, Mengen addieren, dann teilen: c = (m₁ · c₁ + m₂ · c₂) : (m₁ + m₂).";
  if (a.art === "mengen") return "Mischungskreuz: c₂ − c Teile von Sorte 1, c − c₁ Teile von Sorte 2. Dann die Gesamtmenge auf die Teile verteilen.";
  if (a.art === "verduennen") return "Der gelöste Stoff bleibt beim Verdünnen und Verdampfen gleich. Wasser ist eine Lösung mit 0 %, reiner Stoff eine mit 100 %.";
  return "I zählt die Mengen, II die Werte (Preis · Menge bzw. Gramm Stoff). Dann I nach x auflösen und in II einsetzen.";
}

/* ---------- GFS: Gliederung, Tipps, Kolloquium ---------- */
export const GLIEDERUNG = [
  { min: 3, titel: "Einstieg: Was kommt heraus?", text: "Zwei Gläser Zuckerwasser mit Etikett: 200 g mit 5 % und 100 g mit 20 %. Frag die Klasse, wie stark die Mischung ist. Meistens kommen 25 % und 12,5 % – beides falsch. Das ist deine Leitfrage: Wie rechnet man Mischungen richtig, und wie viel nimmt man von jeder Sorte?" },
  { min: 3, titel: "Was erhalten bleibt", text: "Prozent ist ein Anteil, kein Vorrat. Erhalten bleiben die Gramm Lösung und die Gramm Zucker: 10 g + 20 g in 300 g ergeben 10 %. Daraus die Mischungsgleichung und der gewichtete Mittelwert – mit der Folgerung, dass die Mischung immer zwischen den Sorten liegt." },
  { min: 4, titel: "Zwei Unbekannte: das Gleichungssystem", text: "Die umgekehrte Frage an der Tafel: 600 g mit 12 % aus 5 % und 20 %. Gleichung I für die Mengen, Gleichung II für den Zucker, dann Einsetzungsverfahren bis 320 g und 280 g. Kurz zeigen, dass das Additionsverfahren dasselbe liefert." },
  { min: 4, titel: "Mischungskreuz und Wippe", text: "Die Mischungsgleichung in drei Zeilen zum Kreuz umformen: m₁ · (c − c₁) = m₂ · (c₂ − c). Dann das Kreuz mit 8 : 7 und die Teile. Zum Schluss die Wippe: Die Mengen sind Gewichte, der Mischwert ist der Punkt, an dem sie im Gleichgewicht ist." },
  { min: 3, titel: "Grenzen, Verdünnen, Ausblick", text: "Warum 25 % aus 5 % und 20 % unmöglich ist. Verdünnen als Mischen mit 0 %, reiner Stoff als 100 %. Ausblick: Bei drei Sorten gibt es unendlich viele Mischungen. Fazit in einem Satz: Die Mengen verhalten sich umgekehrt wie die Abstände zum Zielwert." },
];

export const TIPPS = [
  "Bring zwei durchsichtige Gläser mit unterschiedlich stark gefärbtem Wasser mit und gieß sie vor der Klasse zusammen. Ein Bild, das man gesehen hat, merkt man sich besser als jede Formel.",
  "Rechne an der Tafel immer mit demselben Beispiel (5 %, 20 %, 12 %, 600 g). Wer dieselben Zahlen im Gleichungssystem, im Kreuz und auf der Wippe wiederfindet, sieht, dass alles dieselbe Gleichung ist.",
  "Auf das Handout gehören die Mischungsgleichung, das Kreuz mit Herleitung, ein Verdünnungsbeispiel mit 0 % und zwei Übungsaufgaben mit Lösung – eine mit Prozent, eine mit Preisen.",
];

export const KOLLOQUIUM = [
  { stufe: "Basis", frage: "Warum darf man beim Mischen die Prozentsätze nicht einfach addieren?",
    antwort: "Prozent ist ein Anteil, kein Vorrat. Erhalten bleiben die Mengen: die Gramm Lösung und die Gramm Stoff. 200 g mit 5 % enthalten 10 g Zucker, 100 g mit 20 % enthalten 20 g. Zusammen sind es 30 g Zucker in 300 g, also 10 % – und nicht 25 %. Eine Mischung kann nie stärker sein als ihre stärkste Sorte." },
  { stufe: "Basis", frage: "Was bedeutet „gewichteter Mittelwert“ bei einer Mischung?",
    antwort: "Jede Sorte zählt mit ihrem Mengenanteil: c = m₁/(m₁ + m₂) · c₁ + m₂/(m₁ + m₂) · c₂. Die beiden Anteile ergeben zusammen 1. Bei gleichen Mengen sind beide 1/2, dann ist es der einfache Mittelwert. Im Beispiel mit 200 g und 100 g zählt die 5-%-Lösung doppelt so stark, deshalb liegt die Mischung mit 10 % näher an 5 %." },
  { stufe: "Basis", frage: "Wie stellst du das Gleichungssystem für eine Mischungsaufgabe auf?",
    antwort: "Zwei Variablen für die beiden Mengen, zwei Bedingungen. Gleichung I zählt die Mengen: x + y = Gesamtmenge. Gleichung II zählt den Wert – Gramm Stoff oder Euro: 0,05x + 0,2y = 72 bei 600 g mit 12 %. Dann löse ich zum Beispiel mit dem Einsetzungsverfahren und erhalte 320 g und 280 g." },
  { stufe: "Basis", frage: "Wie funktioniert das Mischungskreuz?",
    antwort: "Links stehen die beiden Sorten, in der Mitte der Zielwert. Über Kreuz bildet man die Abstände: 20 − 12 = 8 gehört zur 5-%-Lösung, 12 − 5 = 7 zur 20-%-Lösung. Man mischt also im Verhältnis 8 : 7. Für 600 g sind das 15 Teile zu je 40 g, also 320 g und 280 g." },
  { stufe: "Vertiefung", frage: "Warum stimmt das Mischungskreuz?",
    antwort: "Es ist nur die umgestellte Mischungsgleichung. Aus m₁c₁ + m₂c₂ = (m₁ + m₂)c wird nach dem Ausmultiplizieren und Sortieren m₂ · (c₂ − c) = m₁ · (c − c₁). Teilt man durch m₂ · (c − c₁), steht da m₁ : m₂ = (c₂ − c) : (c − c₁) – genau die Abstände über Kreuz." },
  { stufe: "Vertiefung", frage: "Was hat eine Wippe mit Mischungen zu tun?",
    antwort: "Man legt die Mengen als Gewichte auf einen Zahlenstrahl an die Stellen c₁ und c₂. Im Gleichgewicht gilt das Hebelgesetz: Gewicht mal Abstand ist links und rechts gleich, also m₁ · (c − c₁) = m₂ · (c₂ − c). Das ist dieselbe Gleichung wie beim Kreuz. Der Unterstützungspunkt liegt also genau beim Mischwert – 320 · 7 = 2240 = 280 · 8." },
  { stufe: "Vertiefung", frage: "Warum muss der Zielwert zwischen den beiden Sorten liegen?",
    antwort: "Der Mischwert ist ein gewichteter Mittelwert mit positiven Anteilen, er liegt deshalb immer zwischen c₁ und c₂. Rechnerisch zeigt das Kreuz es auch: Für 25 % aus 5 % und 20 % wäre 20 − 25 = −5, man bräuchte eine negative Menge. Liegt das Ziel genau auf einer Sorte, braucht man von der anderen nichts." },
  { stufe: "Vertiefung", frage: "Warum legt das Kreuz nur das Verhältnis fest und nicht die Gesamtmenge?",
    antwort: "Die Mischungsgleichung enthält nur das Verhältnis m₁ : m₂. Verdoppelt man beide Mengen, bleibt der Mischwert gleich. Deshalb braucht man eine zweite Angabe – die Gesamtmenge oder die Menge einer Sorte –, um die Teile in Gramm umzurechnen. Im Gleichungssystem ist das Gleichung I." },
  { stufe: "Vertiefung", frage: "Wie verdünnt man eine Lösung, und was zeigt dabei das Kreuz?",
    antwort: "Wasser ist eine Lösung mit 0 %. Der gelöste Stoff bleibt gleich: 400 g mit 15 % enthalten 60 g Salz. Für 6 % müssen sie 6 % der neuen Lösung sein, also wiegt sie 1000 g – es fehlen 600 g Wasser. Das Kreuz mit 15 % und 0 % liefert (6 − 0) : (15 − 6) = 6 : 9 = 2 : 3, und 400 : 600 ist genau 2 : 3." },
  { stufe: "Profi", frage: "Was passiert bei drei Sorten?",
    antwort: "Dann gibt es drei Unbekannte, aber weiterhin nur zwei Bedingungen: Menge und Wert. Eine Mengenangabe darf man frei wählen, die anderen beiden folgen daraus – es gibt unendlich viele Mischungen. Bei Nüssen zu 8 €, 12 € und 20 € je kg und 10 kg zu 14 € gilt y = 15 − 3z und x = 2z − 5. Damit keine Menge negativ wird, muss z zwischen 2,5 kg und 5 kg liegen." },
  { stufe: "Profi", frage: "Gilt die Rechnung auch, wenn man Volumen statt Massen mischt – etwa Alkohol und Wasser?",
    antwort: "Mit Massenanteilen ist sie exakt, denn Massen addieren sich immer. Volumen nicht unbedingt: Mischt man Alkohol und Wasser, ist das Gesamtvolumen etwas kleiner als die Summe der Einzelvolumen. Mit Volumenprozent stimmt die Mischungsrechnung dann nur näherungsweise. Deshalb rechnen Aufgaben mit Gramm oder setzen voraus, dass sich die Volumen addieren." },
  { stufe: "Profi", frage: "Wo begegnet dir dieselbe Rechnung außerhalb von Lösungen und Preisen?",
    antwort: "Überall, wo ein gewichteter Mittelwert entsteht. Notendurchschnitt zweier Klassen: 20 Schüler mit 2,5 und 10 mit 3,1 ergeben (50 + 31) : 30 = 2,7. Mischtemperatur von Wasser, wenn keine Wärme verloren geht. Und die Durchschnittsgeschwindigkeit einer Fahrt – gewichtet mit den Fahrzeiten, nicht mit den Strecken." },
];
