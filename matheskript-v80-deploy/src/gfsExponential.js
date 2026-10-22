/* ============================================================
   GFS-Trainer · Die Exponentialverteilung – Wartezeiten ohne Gedächtnis
   (Kursstufe 2, Kapitel X Normalverteilung / stetige Zufallsgrößen;
   G8 Klasse 12, G9 Klasse 13)
   Reine Logik ohne React: Dichte, Verteilungsfunktion, Kennwerte,
   Grenzwert der geometrischen Verteilung, Simulation mit festem
   Startwert, vier Übungsgeneratoren mit Prüfung, gezielter Rückmeldung
   zu typischen Fehlern und vollständigem Rechenweg, Gliederung, Tipps
   und Kolloquium. Getestet in tests/gfsExponential.test.mjs.
   Nichts stammt aus einem Schulbuch: Aufgaben, Kontexte, Zahlen und
   Formulierungen sind eigene.
   Schreibweise in den Rechenwegen: λ, ≤, ≈ und − direkt als Zeichen,
   Brüche als \frac, Produkte eng (0,25m), A5: nichts bleibt unvereinfacht.
   ============================================================ */
import { parse, kompiliere, hatX, hatVar } from "./formelEngine.js";

/* ---------- Zufall (wie gfsZiegen.js) ---------- */
/* mulberry32: kleiner Generator mit Startwert – wiederholbare Simulationen und Tests */
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

/* ---------- Zahlen ---------- */
export const rund = (x, n = 3) => { const f = 10 ** n; return Math.round(x * f + (x >= 0 ? 1e-9 : -1e-9)) / f; };
const sauber = (x) => rund(x, 9);
/* Dezimalkomma, echtes Minus, keine überflüssigen Nullen */
export const dk = (x, n = 3) => String(rund(x, n)).replace("-", "−").replace(".", ",");
/* auf s gültige Ziffern */
export const sig = (x, s = 3) => {
  if (!x) return 0;
  const e = Math.floor(Math.log10(Math.abs(x)));
  return rund(x, Math.max(0, s - 1 - e));
};
export const dkSig = (x, s = 3) => String(sig(x, s)).replace("-", "−").replace(".", ",");
/* Parameter (schon „schöne“ Zahlen) als Text */
const z = (x) => dk(x, 6);
/* Produkt zweier Zahlen als TeX ohne „· 1“ */
const mal = (a, b) => (a === 1 ? z(b) : b === 1 ? z(a) : `${z(a)} \\cdot ${z(b)}`);
/* e^{−k} als TeX */
const eHoch = (k) => `e^{−${z(k)}}`;
/* e^{−λ·t} mit eingesetzten Zahlen, dann ausgerechnet: „e^{−0,25 · 3} = e^{−0,75}“ (ohne doppelte Angabe) */
const eWeg = (l, t, vor = "") => {
  const a = `${vor}e^{−${mal(l, t)}}`, b = `${vor}${eHoch(sauber(l * t))}`;
  return a === b ? a : `${a} = ${b}`;
};
/* q · ln 2 ohne „1 ln 2“ */
const qln = (q) => (q === 1 ? "\\ln 2" : `${z(q)} \\ln 2`);
/* t · λ eng geschrieben, ohne „1λ“ */
const tl = (t) => (t === 1 ? "λ" : `${z(t)}λ`);
/* „=“ wenn die Rundung exakt ist, sonst „≈“ */
const gl = (wert, text) => (Math.abs(Number(String(text).replace("−", "-").replace(",", ".")) - wert) < 1e-12 ? "=" : "≈");

/* ---------- Die Mathematik ---------- */
export const dichte = (l, t) => (t < 0 ? 0 : l * Math.exp(-l * t));                 // f(t) = λe^(−λt)
export const vert = (l, t) => (t < 0 ? 0 : 1 - Math.exp(-l * t));                     // F(t) = P(T ≤ t)
export const ueber = (l, t) => (t < 0 ? 1 : Math.exp(-l * t));                        // P(T > t)
export const intervall = (l, a, b) => ueber(l, a) - ueber(l, b);                       // P(a ≤ T ≤ b)
export const erwartung = (l) => 1 / l;
export const median = (l) => Math.LN2 / l;
export const quantil = (l, q) => -Math.log(1 - q) / l;                                 // F(t) = q
export const bedingt = (l, s, t) => ueber(l, s + t) / ueber(l, s);                     // P_{T>s}(T > s + t)
/* Schritt 1: n Zeitschritte der Länge t/n, je Treffer mit λt/n → P(kein Treffer) */
export const grenzFolge = (l, t, n) => (1 - (l * t) / n) ** n;
/* Treppe der geometrischen Verteilung: P(T > t) bei Schritten Δt, Trefferwahrscheinlichkeit λΔt */
export const treppe = (l, dt, t) => (1 - l * dt) ** Math.floor(t / dt + 1e-9);

/* Wartezeiten ziehen (Inversionsmethode): u gleichverteilt in [0; 1) → t = −ln(1 − u)/λ */
export const ziehe = (l, rnd) => -Math.log(1 - rnd()) / l;
export function simuliere(N, l, rnd = Math.random) {
  const werte = new Array(N);
  for (let i = 0; i < N; i++) werte[i] = ziehe(l, rnd);
  return werte;
}
/* Histogramm auf [0; breite · anzahl): Anzahlen je Klasse und wie viele darüber liegen */
export function histogramm(werte, breite, anzahl) {
  const h = new Array(anzahl).fill(0);
  let drueber = 0;
  for (const w of werte) {
    const k = Math.floor(w / breite);
    if (k < anzahl) h[k] += 1; else drueber += 1;
  }
  return { h, drueber };
}
/* Gedächtnis-Test: nur die Werte über s, um s nach links geschoben */
export const restzeiten = (werte, s) => werte.filter((w) => w > s).map((w) => w - s);
export const mittel = (werte) => (werte.length ? werte.reduce((a, b) => a + b, 0) / werte.length : 0);

/* ---------- Daten der Herleitung und der Animationen ---------- */
/* Schritt 1 und Animation „treppe“: λ = 0,5 pro Minute, t = 2 Minuten */
export const TREPPE_L = 0.5;
export const TREPPE_DT = [1, 0.5, 0.25, 0.05];
export const TREPPE_WERTE = TREPPE_DT.map((dt) => ({ dt, p: sauber(TREPPE_L * dt), n: Math.round(2 / dt), wert: treppe(TREPPE_L, dt, 2) }));
export const GRENZ_TABELLE = [2, 4, 8, 40, 1000].map((n) => ({ n, wert: grenzFolge(TREPPE_L, 2, n) }));

/* Animation „zerfall“: 100 Kerne, Lebensdauer in Halbwertszeiten (λ = ln 2), fester Startwert */
export const ZERFALL_START = 40;
export const KERNE = (() => {
  const r = zufallszahlen(ZERFALL_START);
  return Array.from({ length: 100 }, () => ziehe(Math.LN2, r));
})();
export const uebrigNach = (tau) => KERNE.filter((x) => x > tau).length;

/* ---------- Eingaben lesen ---------- */
/* Zahl oder Term ohne Variable: „0,368“, „e^(−1)“, „1−e^(−1,5)“, „ln(2)/0,25“, „36,8 %“ → Zahl; sonst null */
export function liesWert(s) {
  let t = String(s ?? "").trim().replace(/\s+/g, "").replace(/−/g, "-").replace(/·/g, "*");
  if (!t) return null;
  let prozent = false;
  if (t.endsWith("%")) { prozent = true; t = t.slice(0, -1); }
  if (/^-?\d+,\d+,/.test(t)) return null;                 // „1,2,3“ ist keine Zahl
  const b = parse(t);
  if (!b || hatX(b) || hatVar(b)) return null;
  let v;
  try { v = kompiliere(b)(0); } catch (e) { return null; }
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return prozent ? v / 100 : v;
}
/* Toleranzen: Wahrscheinlichkeit auf drei Nachkommastellen, Zeit auf zwei (bei großen Zahlen 0,1 %), Rate auf drei gültige Ziffern */
export const TOLERANZ = {
  p: () => 0.0006,
  zeit: (soll) => Math.max(0.0051, Math.abs(soll) * 0.001),
  rate: (soll) => Math.abs(soll) * 0.006,
};
export const trifft = (ist, soll, typ = "p") => ist !== null && Math.abs(ist - soll) <= TOLERANZ[typ](soll);
const ANZEIGE = { p: (x) => dk(x, 3), zeit: (x) => dk(x, 2), rate: (x) => dkSig(x, 3) };
export const RUNDUNG = {
  p: "Wahrscheinlichkeiten exakt (z. B. e^(−1,5) oder 1 − e^(−2)) oder auf drei Nachkommastellen gerundet (0,223), auch in Prozent.",
  zeit: "Zeiten exakt (z. B. 4·ln(2)) oder auf zwei Nachkommastellen gerundet.",
  rate: "λ exakt (z. B. ln(2)/8) oder auf drei gültige Ziffern gerundet (z. B. 0,00357).",
};

/* ---------- Kontexte (eigene Formulierungen) ---------- */
/* Zahl mit Einheit, Einzahl bei 1: „1 Minute“, „2,5 Minuten“, „1 Tag“, „nach 1 Tag“ (Dativ: „Tagen“) */
const Mi = (x) => `${z(x)} ${x === 1 ? "Minute" : "Minuten"}`;
const St = (x) => `${z(x)} ${x === 1 ? "Stunde" : "Stunden"}`;
const Ta = (x) => `${z(x)} ${x === 1 ? "Tag" : "Tagen"}`;
/* mittel = mögliche mittlere Wartezeiten bzw. Lebensdauern; ganz = Zeitpunkte nur ganzzahlig */
const KONTEXTE = {
  hotline: {
    id: "hotline", einheit: "min", lang: "Minuten", mittel: [2, 4, 5, 10], ganz: false,
    mitL: (l) => `Bei einer Hotline gehen Anrufe zufällig und unabhängig voneinander ein, im Schnitt λ = ${z(l)} pro Minute. Die Wartezeit T (in Minuten) bis zum nächsten Anruf ist exponentialverteilt.`,
    mitMu: (m) => `Bei einer Hotline gehen Anrufe zufällig und unabhängig voneinander ein; im Mittel vergehen ${Mi(m)} bis zum nächsten Anruf. Die Wartezeit T (in Minuten) ist exponentialverteilt.`,
    gr: (t) => `dass der nächste Anruf erst nach mehr als ${Mi(t)} kommt`,
    kl: (t) => `dass innerhalb von ${Mi(t)} ein Anruf kommt`,
    zw: (a, b) => `dass der nächste Anruf nach frühestens ${z(a)} und spätestens ${Mi(b)} kommt`,
    aus: (a, b) => `dass der nächste Anruf schneller als in ${Mi(a)} oder erst nach mehr als ${Mi(b)} kommt`,
    wer: "Wartezeit",
  },
  taxi: {
    id: "taxi", einheit: "min", lang: "Minuten", mittel: [2, 4, 5, 10], ganz: false,
    mitL: (l) => `Am Taxistand eines Bahnhofs kommen freie Taxis zufällig an, im Schnitt λ = ${z(l)} pro Minute. Die Wartezeit T (in Minuten) auf das nächste Taxi ist exponentialverteilt.`,
    mitMu: (m) => `Am Taxistand eines Bahnhofs kommen freie Taxis zufällig an; im Mittel wartet man ${Mi(m)}. Die Wartezeit T (in Minuten) auf das nächste Taxi ist exponentialverteilt.`,
    gr: (t) => `dass du länger als ${Mi(t)} auf ein Taxi wartest`,
    kl: (t) => `dass innerhalb von ${Mi(t)} ein Taxi kommt`,
    zw: (a, b) => `dass das nächste Taxi nach frühestens ${z(a)} und spätestens ${Mi(b)} kommt`,
    aus: (a, b) => `dass das nächste Taxi schneller als in ${Mi(a)} oder erst nach mehr als ${Mi(b)} kommt`,
    wer: "Wartezeit",
  },
  bauteil: {
    id: "bauteil", einheit: "h", lang: "Stunden", mittel: [250, 500, 1000, 2000], ganz: true,
    mitL: (l) => `Die Lebensdauer T (in Stunden) eines Temperatursensors ist exponentialverteilt mit λ = ${z(l)} pro Stunde.`,
    mitMu: (m) => `Die Lebensdauer T (in Stunden) eines Temperatursensors ist exponentialverteilt; im Mittel hält ein Sensor ${St(m)}.`,
    gr: (t) => `dass ein Sensor länger als ${St(t)} hält`,
    kl: (t) => `dass ein Sensor in den ersten ${St(t)} ausfällt`,
    zw: (a, b) => `dass ein Sensor nach frühestens ${z(a)} und spätestens ${St(b)} ausfällt`,
    aus: (a, b) => `dass ein Sensor schon in den ersten ${St(a)} oder erst nach mehr als ${St(b)} ausfällt`,
    wer: "Lebensdauer",
  },
  kern: {
    id: "kern", einheit: "d", lang: "Tage", halb: [2, 4, 5, 8, 10], ganz: false,
    mitH: (h) => `Ein radioaktives Isotop hat eine Halbwertszeit von ${Ta(h)}. Die Lebensdauer T (in Tagen) eines einzelnen Kerns ist exponentialverteilt.`,
    gr: (t) => `dass ein bestimmter Kern nach ${Ta(t)} noch nicht zerfallen ist`,
    kl: (t) => `dass ein bestimmter Kern innerhalb von ${Ta(t)} zerfällt`,
    zw: (a, b) => `dass ein bestimmter Kern nach frühestens ${z(a)} und spätestens ${Ta(b)} zerfällt`,
    wer: "Lebensdauer",
  },
};
const WARTEN = ["hotline", "taxi", "bauteil"];
/* Zeitpunkt t = μ · r, passend zum Kontext (ganzzahlig bzw. auf halbe Einheiten) */
const passt = (K, t) => (K.ganz ? Number.isInteger(t) : Number.isInteger(sauber(t * 2)));
function zeitpunkte(K, mu, rs) {
  return rs.map((r) => sauber(mu * r)).filter((t) => t > 0 && passt(K, t));
}

/* ---------- Übungen ---------- */
export const ARTEN = [
  { id: "wkt", name: "Wahrscheinlichkeiten" },
  { id: "kenn", name: "Erwartungswert und Median" },
  { id: "lambda", name: "λ bestimmen" },
  { id: "gedaechtnis", name: "Ohne Gedächtnis" },
];

/* Ein Feld: [schlüssel, Beschriftung, Typ (p | zeit | rate), Einheit] */
const feld = (k, label, typ, einheit = "") => [k, label, typ, einheit];
/* Aufgabe zusammenbauen: soll, Anzeige (gerundet), exakte Eingabe, typische Fehler je Feld */
function bau(art, stufe, kontext, text, felderListe, soll, exakt, fallen, weg, mehr = {}) {
  const loesung = Object.fromEntries(felderListe.map(([k, , typ]) => [k, ANZEIGE[typ](soll[k])]));
  return { art, stufe, kontext, text, felder: felderListe, soll, loesung, exakt, fallen, weg, ...mehr };
}
/* Wahrscheinlichkeit als exakte Eingabe */
const eTxt = (k) => `e^(-${String(k).replace(".", ",")})`;

/* ---- 1 · Wahrscheinlichkeiten ---- */
function wktAufgabe(s, zufall) {
  if (s === 4 || (s === 5 && zufall(0, 1) === 0)) return wktHalb(s, zufall);
  const K = KONTEXTE[wahl(WARTEN, zufall)];
  const mu = wahl(K.mittel, zufall), l = sauber(1 / mu);
  const mitL = s <= 2;
  const satz = mitL ? K.mitL(l) : K.mitMu(mu);
  const weg = mitL ? [] : [`λ = \\frac{1}{${z(mu)}} = ${z(l)}`];
  const DENS = "Das ist ein Wert der Dichte f(t) = λe^(−λt), keine Wahrscheinlichkeit. Wahrscheinlichkeiten sind Flächen unter f – rechne mit F(t) = 1 − e^(−λt).";
  const MU = "λ ist der Kehrwert der mittleren Wartezeit: λ = 1/μ. Du hast mit der mittleren Zeit selbst gerechnet.";
  let art;
  if (s === 1) art = wahl(["gr", "kl"], zufall);
  else if (s === 2) art = "zw";
  else if (s === 3) art = wahl(["gr", "kl", "zw"], zufall);
  else art = "aus";
  if (art === "gr" || art === "kl") {
    const t = wahl(zeitpunkte(K, mu, s === 1 ? [0.5, 1, 2] : [0.25, 0.5, 0.75, 1.5, 2.5, 3]), zufall);
    const k = sauber(l * t);
    const p = art === "gr" ? Math.exp(-k) : 1 - Math.exp(-k);
    const v = dk(p, 3);
    weg.push(art === "gr"
      ? `P(T > ${z(t)}) = ${eWeg(l, t)} ${gl(p, v)} ${v}`
      : `P(T ≤ ${z(t)}) = 1 − P(T > ${z(t)}) = ${eWeg(l, t, "1 − ")} ${gl(p, v)} ${v}`);
    const fallen = [
      [1 - p, art === "gr" ? "Gegenereignis erwischt: „länger als t“ ist P(T > t) = e^(−λt). 1 − e^(−λt) ist die Wahrscheinlichkeit für „höchstens t“." : "Gegenereignis erwischt: „innerhalb von t“ ist P(T ≤ t) = 1 − e^(−λt). e^(−λt) allein ist die Wahrscheinlichkeit für „länger als t“."],
      [l * Math.exp(-k), DENS],
      ...(mitL ? [] : [[art === "gr" ? Math.exp(-mu * t) : 1 - Math.exp(-mu * t), MU]]),
      [art === "gr" ? Math.exp(-t / l) : 1 - Math.exp(-t / l), "Im Exponenten steht λ · t, nicht t : λ."],
    ];
    return bau("wkt", s, K.id, `${satz} Berechne die Wahrscheinlichkeit, ${K[art](t)}.`, [feld("p", "P", "p")], { p },
      { p: art === "gr" ? eTxt(k) : `1-${eTxt(k)}` }, { p: fallen }, weg, { l, mu, t, frage: art });
  }
  /* Intervall bzw. außerhalb des Intervalls */
  const paare = s === 2 ? [[0.5, 1], [0.5, 2], [1, 2], [1, 3], [0.25, 1], [0.5, 1.5], [1, 1.5], [2, 3]]
    : [[0.25, 0.75], [0.5, 1.5], [0.25, 2], [1, 2.5], [0.5, 3], [1.5, 3], [0.75, 2]];
  const moegliche = paare.map(([r1, r2]) => [sauber(mu * r1), sauber(mu * r2)]).filter(([a, b]) => passt(K, a) && passt(K, b));
  const [a, b] = wahl(moegliche, zufall);
  const ka = sauber(l * a), kb = sauber(l * b);
  const innen = Math.exp(-ka) - Math.exp(-kb);
  const zwei = (vor) => {   // e^{−λa} − e^{−λb} mit eingesetztem λ, dann ausgerechnet
    const x = `e^{−${mal(l, a)}} − e^{−${mal(l, b)}}`, y = `${eHoch(ka)} − ${eHoch(kb)}`;
    return x === y ? `${vor}${x}` : `${vor}${x} = ${y}`;
  };
  const fallen = [
    [1 - Math.exp(-kb), "Das ist P(T ≤ b). Die Zeiten vor a gehören nicht dazu: P(a ≤ T ≤ b) = F(b) − F(a)."],
    [Math.exp(-ka), "Das ist P(T ≥ a). Die Zeiten nach b gehören nicht dazu: P(a ≤ T ≤ b) = F(b) − F(a)."],
    [(1 - Math.exp(-kb)) + (1 - Math.exp(-ka)), "F(b) und F(a) werden subtrahiert, nicht addiert: P(a ≤ T ≤ b) = F(b) − F(a)."],
  ];
  if (art === "zw") {
    const v = dk(innen, 3);
    weg.push(`P(${z(a)} ≤ T ≤ ${z(b)}) = F(${z(b)}) − F(${z(a)})`);
    weg.push(`= (1 − e^{−${tl(b)}}) − (1 − e^{−${tl(a)}}) = e^{−${tl(a)}} − e^{−${tl(b)}}`);
    weg.push(`${zwei("= ")} ${gl(innen, v)} ${v}`);
    if (!mitL) fallen.push([Math.exp(-mu * a) - Math.exp(-mu * b), MU]);
    return bau("wkt", s, K.id, `${satz} Berechne die Wahrscheinlichkeit, ${K.zw(a, b)}.`, [feld("p", "P", "p")], { p: innen },
      { p: `${eTxt(ka)}-${eTxt(kb)}` }, { p: fallen }, weg, { l, mu, a, b, frage: art });
  }
  const p = 1 - innen;
  const v = dk(p, 3);
  weg.push(`P(${z(a)} ≤ T ≤ ${z(b)}) = ${zwei("")} ${gl(innen, dk(innen, 4))} ${dk(innen, 4)}`);
  weg.push(`P(T < ${z(a)} \\text{ oder } T > ${z(b)}) = 1 − P(${z(a)} ≤ T ≤ ${z(b)})`);
  weg.push(`= 1 − (${eHoch(ka)} − ${eHoch(kb)}) = 1 − ${eHoch(ka)} + ${eHoch(kb)} ${gl(p, v)} ${v}`);
  fallen.unshift([innen, "Das ist die Wahrscheinlichkeit für das Intervall selbst. Gefragt ist das Gegenteil: 1 − P(a ≤ T ≤ b)."]);
  return bau("wkt", s, K.id, `${satz} Berechne die Wahrscheinlichkeit, ${K.aus(a, b)}.`, [feld("p", "P", "p")], { p },
    { p: `1-${eTxt(ka)}+${eTxt(kb)}` }, { p: fallen }, weg, { l, mu, a, b, frage: art });
}

/* Wahrscheinlichkeit mit Halbwertszeit h: P(T > t) = 2^(−t/h) */
const zweiHoch = (q) => `2^{−${z(q)}}`;
function wktHalb(s, zufall) {
  const K = KONTEXTE.kern;
  const h = wahl(K.halb, zufall);
  const weg = [`P(T > ${z(h)}) = e^{−${z(h)}λ} = 0,5`, `λ = \\frac{\\ln 2}{${z(h)}}`];
  const HALB = "Mit der Halbwertszeit h gilt λ = ln 2/h, nicht 1/h – die Halbwertszeit ist der Median, nicht die mittlere Lebensdauer.";
  if (s === 4) {
    const art = wahl(["gr", "kl"], zufall);
    const q = wahl([0.5, 1.5, 2, 2.5, 3, 4].filter((x) => passt(K, sauber(x * h)) && sauber(x * h) !== 1), zufall);
    const t = sauber(q * h);
    const g = 2 ** -q;
    const p = art === "gr" ? g : 1 - g;
    const v = dk(p, 3);
    weg.push(`λ \\cdot ${z(t)} = \\frac{\\ln 2}{${z(h)}} \\cdot ${z(t)} = ${qln(q)}`);
    if (art === "gr") {
      const exakt = Number.isInteger(q) ? ` = \\frac{1}{${2 ** q}}` : "";
      weg.push(`P(T > ${z(t)}) = e^{−${qln(q)}} = ${zweiHoch(q)}${exakt} ${gl(p, v)} ${v}`);
    } else {
      const exakt = Number.isInteger(q) ? ` = 1 − \\frac{1}{${2 ** q}} = \\frac{${2 ** q - 1}}{${2 ** q}}` : "";
      weg.push(`P(T ≤ ${z(t)}) = 1 − e^{−${qln(q)}} = 1 − ${zweiHoch(q)}${exakt} ${gl(p, v)} ${v}`);
    }
    const fallen = [
      [1 - p, art === "gr" ? "Gegenereignis erwischt: „noch nicht zerfallen“ ist P(T > t)." : "Gegenereignis erwischt: „zerfällt innerhalb von t“ ist P(T ≤ t) = 1 − P(T > t)."],
      [art === "gr" ? Math.exp(-t / h) : 1 - Math.exp(-t / h), HALB],
      [art === "gr" ? Math.exp(-q) : 1 - Math.exp(-q), "Nach q Halbwertszeiten ist der Anteil (1/2)^q, nicht e^(−q)."],
    ];
    return bau("wkt", s, K.id, `${K.mitH(h)} Berechne die Wahrscheinlichkeit, ${K[art](t)}.`, [feld("p", "P", "p")], { p },
      { p: art === "gr" ? `2^(-${String(q).replace(".", ",")})` : `1-2^(-${String(q).replace(".", ",")})` }, { p: fallen }, weg, { h, t, q, frage: art });
  }
  /* Stufe 5: Intervall mit Halbwertszeit */
  const paare = [[0.5, 1.5], [1, 2.5], [0.5, 2], [1.5, 3], [1, 3]].filter(([x, y]) => passt(K, sauber(x * h)) && passt(K, sauber(y * h)));
  const [qa, qb] = wahl(paare, zufall);
  const a = sauber(qa * h), b = sauber(qb * h);
  const p = 2 ** -qa - 2 ** -qb;
  const v = dk(p, 3);
  const tex = (q) => (Number.isInteger(q) ? `\\frac{1}{${2 ** q}}` : zweiHoch(q));
  weg.push(`${a === 1 ? "λ" : `λ \\cdot ${z(a)}`} = ${qln(qa)}, \\quad λ \\cdot ${z(b)} = ${qln(qb)}`);
  weg.push(`P(${z(a)} ≤ T ≤ ${z(b)}) = F(${z(b)}) − F(${z(a)}) = ${tex(qa)} − ${tex(qb)} ${gl(p, v)} ${v}`);
  const fallen = [
    [1 - 2 ** -qb, "Das ist P(T ≤ b). Die Zeiten vor a gehören nicht dazu: P(a ≤ T ≤ b) = F(b) − F(a)."],
    [Math.exp(-a / h) - Math.exp(-b / h), HALB],
  ];
  return bau("wkt", s, K.id, `${K.mitH(h)} Berechne die Wahrscheinlichkeit, ${K.zw(a, b)}.`, [feld("p", "P", "p")], { p },
    { p: `2^(-${String(qa).replace(".", ",")})-2^(-${String(qb).replace(".", ",")})` }, { p: fallen }, weg, { h, a, b, frage: "zw" });
}

/* ---- 2 · Erwartungswert, Median, Quantile ---- */
const LN = { 4: "\\ln 4", 5: "\\ln 5", 10: "\\ln 10", 20: "\\ln 20", 100: "\\ln 100" };
function kennAufgabe(s, zufall) {
  if (s === 1 || s === 2) {
    const K = KONTEXTE[wahl(WARTEN, zufall)];
    const mu = wahl(K.mittel, zufall), l = sauber(1 / mu);
    const E = mu, m = Math.LN2 / l;
    const weg = [`E(T) = \\frac{1}{λ} = \\frac{1}{${z(l)}} = ${z(E)}`];
    const fallenE = [[l, "Das ist λ selbst. Der Erwartungswert ist der Kehrwert: E(T) = 1/λ."], [Math.LN2 / l, "Das ist der Median. Der Erwartungswert ist E(T) = 1/λ."]];
    const wer = K.wer === "Wartezeit" ? "die mittlere Wartezeit E(T)" : "die mittlere Lebensdauer E(T)";
    if (s === 1) {
      return bau("kenn", s, K.id, `${K.mitL(l)} Berechne ${wer}.`, [feld("E", "E(T)", "zeit", K.einheit)], { E }, { E: `1/${z(l)}` }, { E: fallenE }, weg, { l, mu });
    }
    weg.push(`F(m) = 0,5: \\quad 1 − e^{−${z(l)}m} = 0,5`);
    weg.push(`e^{−${z(l)}m} = 0,5`);
    weg.push(`−${z(l)}m = \\ln 0,5 = −\\ln 2`);
    weg.push(`m = \\frac{\\ln 2}{${z(l)}} = ${z(mu)} \\ln 2 ≈ ${dk(m, 2)}`);
    const fallenM = [
      [E, "Das ist der Erwartungswert. Der Median m löst F(m) = 0,5: m = ln 2/λ."],
      [E / 2, "Die Hälfte des Erwartungswerts ist nicht der Median – die Dichte ist schief. Löse 1 − e^(−λm) = 0,5."],
      [Math.LN2 * l, "λ gehört in den Nenner: m = ln 2/λ."],
    ];
    return bau("kenn", s, K.id, `${K.mitL(l)} Berechne ${wer} und den Median m von T.`,
      [feld("E", "E(T)", "zeit", K.einheit), feld("m", "m", "zeit", K.einheit)], { E, m }, { E: `1/${z(l)}`, m: `ln(2)/${z(l)}` }, { E: fallenE, m: fallenM }, weg, { l, mu });
  }
  if (s === 3) {
    if (zufall(0, 1) === 0) {
      const K = KONTEXTE.kern;
      const h = wahl(K.halb, zufall);
      const E = h / Math.LN2;
      const weg = [`P(T > ${z(h)}) = e^{−${z(h)}λ} = 0,5`, `λ = \\frac{\\ln 2}{${z(h)}}`, `E(T) = \\frac{1}{λ} = \\frac{${z(h)}}{\\ln 2} ≈ ${dk(E, 2)}`];
      const fallen = [
        [h, "Die Halbwertszeit ist der Median, nicht der Erwartungswert. Die mittlere Lebensdauer ist 1/λ."],
        [h * Math.LN2, "Umgekehrt: E(T) = 1/λ = h : ln 2 – die mittlere Lebensdauer ist länger als die Halbwertszeit."],
        [Math.LN2 / h, "Das ist λ. Der Erwartungswert ist der Kehrwert 1/λ."],
      ];
      return bau("kenn", s, K.id, `${K.mitH(h)} Berechne die mittlere Lebensdauer E(T) eines Kerns.`, [feld("E", "E(T)", "zeit", K.einheit)], { E },
        { E: `${z(h)}/ln(2)` }, { E: fallen }, weg, { h });
    }
    const K = KONTEXTE[wahl(WARTEN, zufall)];
    const mu = wahl(K.mittel, zufall), l = sauber(1 / mu), m = mu * Math.LN2;
    const weg = [`λ = \\frac{1}{${z(mu)}} = ${z(l)}`, `m = \\frac{\\ln 2}{λ} = \\frac{\\ln 2}{${z(l)}} = ${z(mu)} \\ln 2 ≈ ${dk(m, 2)}`];
    const fallen = [
      [mu, "Das ist der Erwartungswert. Der Median ist kleiner: m = ln 2/λ."],
      [mu / 2, "Die Hälfte der mittleren Zeit ist nicht der Median – die Dichte ist schief. Löse 1 − e^(−λm) = 0,5."],
      [Math.LN2 / mu, "λ = 1/μ gehört in den Nenner: m = ln 2/λ = μ · ln 2."],
    ];
    return bau("kenn", s, K.id, `${K.mitMu(mu)} Berechne den Median m von T – die Zeit, die in der Hälfte der Fälle unterschritten wird.`,
      [feld("m", "m", "zeit", K.einheit)], { m }, { m: `${z(mu)}*ln(2)` }, { m: fallen }, weg, { l, mu });
  }
  if (s === 4) {
    const K = KONTEXTE.bauteil;
    const mu = wahl(K.mittel, zufall), l = sauber(1 / mu);
    const [q, n] = wahl([[0.75, 4], [0.8, 5], [0.9, 10], [0.95, 20], [0.99, 100]], zufall);
    const rest = sauber(1 - q);
    const t = mu * Math.log(n);
    const weg = [
      `λ = \\frac{1}{${z(mu)}} = ${z(l)}`,
      `F(t) = ${z(q)}: \\quad 1 − e^{−${z(l)}t} = ${z(q)}`,
      `e^{−${z(l)}t} = ${z(rest)}`,
      `−${z(l)}t = \\ln ${z(rest)} = −${LN[n]}`,
      `t = \\frac{${LN[n]}}{${z(l)}} = ${z(mu)} ${LN[n]} ≈ ${dk(t, 2)}`,
    ];
    const fallen = [
      [-Math.log(q) * mu, `Das ist die Zeit, nach der erst ${dk(rest * 100, 0)} % ausgefallen sind. Ansatz: F(t) = ${dk(q, 2)}, also e^(−λt) = ${dk(rest, 2)}.`],
      [q * mu, "Linear geht es nicht: Löse 1 − e^(−λt) = q mit dem Logarithmus."],
      [Math.log(n) / mu, "λ steht im Nenner: t = ln(…)/λ."],
    ];
    return bau("kenn", s, K.id, `${K.mitMu(mu)} Nach welcher Zeit t sind ${dk(q * 100, 0)} % der Sensoren ausgefallen?`,
      [feld("t", "t", "zeit", K.einheit)], { t }, { t: `${z(mu)}*ln(${n})` }, { t: fallen }, weg, { l, mu, q });
  }
  /* Stufe 5: Anteile, die nicht von λ abhängen */
  const K = KONTEXTE[wahl(["hotline", "taxi"], zufall)];
  const mu = wahl(K.mittel, zufall), l = sauber(1 / mu);
  const variante = wahl(["kuerzer", "doppelt", "dazwischen"], zufall);
  if (variante === "kuerzer") {
    const p = 1 - Math.exp(-1);
    const weg = [`P(T ≤ E(T)) = 1 − e^{−λ \\cdot \\frac{1}{λ}} = 1 − e^{−1} ≈ ${dk(p, 3)}`];
    const fallen = [[0.5, "50 % gilt für den Median, nicht für den Erwartungswert. Setze t = 1/λ in F(t) ein."], [Math.exp(-1), "Gegenereignis erwischt: „kürzer als der Mittelwert“ ist F(1/λ) = 1 − e^(−1)."]];
    return bau("kenn", s, K.id, `${K.mitMu(mu)} Wie groß ist die Wahrscheinlichkeit, dass du kürzer als die mittlere Wartezeit wartest?`,
      [feld("p", "P", "p")], { p }, { p: "1-e^(-1)" }, { p: fallen }, weg, { l, mu, variante });
  }
  if (variante === "doppelt") {
    const p = Math.exp(-2);
    const weg = [`P(T > 2 \\cdot E(T)) = e^{−λ \\cdot \\frac{2}{λ}} = e^{−2} ≈ ${dk(p, 3)}`];
    const fallen = [[0.25, "Das wäre (1/2)², gerechnet mit dem Median. Mit t = 2/λ ergibt sich e^(−2)."], [1 - Math.exp(-2), "Gegenereignis erwischt: „länger als“ ist e^(−λt)."]];
    return bau("kenn", s, K.id, `${K.mitMu(mu)} Wie groß ist die Wahrscheinlichkeit, dass du länger als doppelt so lang wie im Mittel wartest?`,
      [feld("p", "P", "p")], { p }, { p: "e^(-2)" }, { p: fallen }, weg, { l, mu, variante });
  }
  const p = 0.5 - Math.exp(-1);
  const weg = [
    `m = \\frac{\\ln 2}{λ}, \\quad E(T) = \\frac{1}{λ}`,
    `P(m ≤ T ≤ E(T)) = e^{−λm} − e^{−λ \\cdot \\frac{1}{λ}}`,
    `= e^{−\\ln 2} − e^{−1} = 0,5 − e^{−1} ≈ ${dk(p, 3)}`,
  ];
  const fallen = [[1 - Math.exp(-1), "Das ist P(T ≤ E(T)). Vom Median an zählt nur noch der Teil ab 0,5: F(E) − F(m)."], [0.5, "Das ist die Wahrscheinlichkeit bis zum Median. Gefragt ist das Stück zwischen Median und Erwartungswert."]];
  return bau("kenn", s, K.id, `${K.mitMu(mu)} Wie groß ist die Wahrscheinlichkeit, dass die Wartezeit zwischen dem Median und der mittleren Wartezeit liegt?`,
    [feld("p", "P", "p")], { p }, { p: "0,5-e^(-1)" }, { p: fallen }, weg, { l, mu, variante });
}

/* ---- 3 · λ aus einer Angabe bestimmen ---- */
function lambdaAufgabe(s, zufall) {
  const VZ = "λ ist positiv: Der Logarithmus einer Zahl zwischen 0 und 1 ist negativ, darum steht ein Minus davor.";
  if (s === 1) {
    const K = KONTEXTE[wahl(WARTEN, zufall)];
    const mu = wahl(K.mittel, zufall), l = sauber(1 / mu);
    const weg = [`E(T) = \\frac{1}{λ} = ${z(mu)} \\;\\Rightarrow\\; λ = \\frac{1}{${z(mu)}} = ${z(l)}`];
    return bau("lambda", s, K.id, `${K.mitMu(mu)} Bestimme den Parameter λ der Exponentialverteilung.`, [feld("l", "λ", "rate")], { l },
      { l: `1/${z(mu)}` }, { l: [[mu, "λ ist der Kehrwert der mittleren Zeit: E(T) = 1/λ."], [Math.LN2 / mu, "Die mittlere Zeit ist der Erwartungswert, nicht die Halbwertszeit: λ = 1/E(T)."]] }, weg, { mu });
  }
  if (s === 2) {
    const K = KONTEXTE.kern;
    const h = wahl(K.halb, zufall), l = Math.LN2 / h;
    const weg = [`P(T > ${z(h)}) = e^{−${z(h)}λ} = 0,5`, `−${z(h)}λ = \\ln 0,5 = −\\ln 2`, `λ = \\frac{\\ln 2}{${z(h)}} ≈ ${dkSig(l)}`];
    return bau("lambda", s, K.id, `${K.mitH(h)} Bestimme den Parameter λ (pro Tag).`, [feld("l", "λ", "rate")], { l }, { l: `ln(2)/${z(h)}` },
      { l: [[1 / h, "Die Halbwertszeit ist der Median: e^(−λh) = 0,5 liefert λ = ln 2/h, nicht 1/h."], [Math.LN2 * h, "h gehört in den Nenner: λ = ln 2/h."], [-l, VZ]] }, weg, { h });
  }
  const K = KONTEXTE.bauteil;
  const t1 = wahl([50, 100, 200, 500], zufall);
  if (s === 3) {
    const p = wahl([0.1, 0.2, 0.25, 0.3, 0.4, 0.6], zufall);
    const rest = sauber(1 - p);
    const l = -Math.log(rest) / t1;
    const weg = [
      `P(T ≤ ${z(t1)}) = 1 − e^{−${z(t1)}λ} = ${z(p)}`,
      `e^{−${z(t1)}λ} = ${z(rest)}`,
      `−${z(t1)}λ = \\ln ${z(rest)}`,
      `λ = −\\frac{\\ln ${z(rest)}}{${z(t1)}} ≈ ${dkSig(l)}`,
    ];
    return bau("lambda", s, K.id, `Die Lebensdauer T (in Stunden) eines Temperatursensors ist exponentialverteilt. ${dk(p * 100, 0)} % der Sensoren fallen in den ersten ${St(t1)} aus. Bestimme λ (pro Stunde).`,
      [feld("l", "λ", "rate")], { l }, { l: `-ln(${z(rest)})/${z(t1)}` },
      { l: [[-Math.log(p) / t1, `Ausgefallen heißt F(t) = 1 − e^(−λt) = ${dk(p, 2)}, also e^(−λt) = ${dk(rest, 2)}. Du hast die beiden Anteile vertauscht.`],
        [p / t1, "Linear geht es nicht: Löse 1 − e^(−λt) = p mit dem Logarithmus."], [-l, VZ]] }, weg, { t: t1, anteil: p });
  }
  if (s === 4) {
    const q = wahl([0.1, 0.2, 0.25, 0.4, 0.5, 0.8], zufall);
    const l = -Math.log(q) / t1, E = 1 / l;
    const weg = [
      `P(T > ${z(t1)}) = e^{−${z(t1)}λ} = ${z(q)}`,
      `−${z(t1)}λ = \\ln ${z(q)}`,
      `λ = −\\frac{\\ln ${z(q)}}{${z(t1)}} ≈ ${dkSig(l)}`,
      `E(T) = \\frac{1}{λ} = −\\frac{${z(t1)}}{\\ln ${z(q)}} ≈ ${dk(E, 2)}`,
    ];
    return bau("lambda", s, K.id, `Die Lebensdauer T (in Stunden) eines Temperatursensors ist exponentialverteilt. Nur ${dk(q * 100, 0)} % der Sensoren halten länger als ${St(t1)}. Bestimme λ und die mittlere Lebensdauer E(T).`,
      [feld("l", "λ", "rate"), feld("E", "E(T)", "zeit", "h")], { l, E }, { l: `-ln(${z(q)})/${z(t1)}`, E: `-${z(t1)}/ln(${z(q)})` },
      { l: [[-Math.log(1 - q) / t1, "„Länger als t halten“ ist P(T > t) = e^(−λt). Du hast mit dem Anteil der Ausfälle gerechnet."], [-l, VZ], [(1 - q) / t1, "Linear geht es nicht: Löse e^(−λt) = q mit dem Logarithmus."]],
        E: [[l, "Das ist λ. Der Erwartungswert ist der Kehrwert 1/λ."], [Math.LN2 / l, "Das ist der Median. Der Erwartungswert ist 1/λ."]] }, weg, { t: t1, anteil: q });
  }
  /* Stufe 5: aus einer Angabe auf eine andere schließen */
  const q = wahl([0.5, 0.6, 0.7, 0.8, 0.9], zufall);
  const r = wahl([0.5, 1.5, 2, 2.5, 3], zufall);
  const t2 = sauber(t1 * r);
  const l = -Math.log(q) / t1;
  const p = q ** r;
  const weg = [
    `P(T > ${z(t1)}) = e^{−${z(t1)}λ} = ${z(q)}`,
    `λ = −\\frac{\\ln ${z(q)}}{${z(t1)}} ≈ ${dkSig(l)}`,
    `−${z(t2)}λ = ${z(t2)} \\cdot \\frac{\\ln ${z(q)}}{${z(t1)}} = ${z(r)} \\ln ${z(q)}`,
    `P(T > ${z(t2)}) = e^{${z(r)} \\ln ${z(q)}} = ${z(q)}^{${z(r)}} ${gl(p, dk(p, 3))} ${dk(p, 3)}`,
  ];
  return bau("lambda", s, K.id, `Die Lebensdauer T (in Stunden) eines Temperatursensors ist exponentialverteilt. ${dk(q * 100, 0)} % der Sensoren halten länger als ${St(t1)}. Bestimme λ und die Wahrscheinlichkeit, dass ein Sensor länger als ${St(t2)} hält.`,
    [feld("l", "λ", "rate"), feld("p", "P", "p")], { l, p }, { l: `-ln(${z(q)})/${z(t1)}`, p: `${z(q)}^(${z(r)})` },
    { l: [[-Math.log(1 - q) / t1, "„Länger als t halten“ ist P(T > t) = e^(−λt). Du hast mit dem Anteil der Ausfälle gerechnet."], [-l, VZ]],
      p: [[q * r, "Linear geht es nicht: Nach r-mal so langer Zeit ist der Anteil q^r, nicht q · r."], [q ** (1 / r), "Der Exponent ist umgekehrt: Nach r-mal so langer Zeit ist der Anteil q^r."], [1 - p, "Gegenereignis erwischt: „länger halten“ ist P(T > t) = e^(−λt)."]] }, weg, { t: t1, t2, anteil: q, r });
}

/* ---- 4 · Gedächtnislosigkeit ---- */
function gedaechtnisAufgabe(s, zufall) {
  const NEU = "Das ist die Wahrscheinlichkeit für ein neues Bauteil, insgesamt so lange zu halten. Unter der Bedingung T > s zählt nur noch die Restzeit.";
  const SCHON = "Das ist die Wahrscheinlichkeit, die ersten s zu überstehen – die sind schon geschafft und zählen nicht mehr.";
  if (s === 1 || s === 2 || s === 4) {
    const K = KONTEXTE.bauteil;
    const mu = wahl(K.mittel, zufall), l = sauber(1 / mu);
    const [rs, rt] = wahl([[0.5, 0.5], [1, 0.5], [1, 1], [2, 0.5], [0.5, 1], [2, 1], [1.5, 0.5]], zufall);
    const s0 = sauber(mu * rs), t = sauber(mu * rt), u = sauber(s0 + t);
    const ks = sauber(l * s0), kt = sauber(l * t), ku = sauber(l * u);
    const g = Math.exp(-kt);
    const bedingt = `P_{T > ${z(s0)}}(T > ${z(u)}) = \\frac{P(T > ${z(u)})}{P(T > ${z(s0)})}`;
    const bruchZeile = `= \\frac{${eHoch(ku)}}{${eHoch(ks)}} = ${eHoch(kt)}`;
    if (s === 1) {
      const v = dk(g, 3);
      const weg = [`λ \\cdot ${z(s0)} = ${z(ks)}, \\quad λ \\cdot ${z(u)} = ${z(ku)}`, bedingt, `${bruchZeile} ${gl(g, v)} ${v}`];
      return bau("gedaechtnis", s, K.id, `${K.mitL(l)} Ein Sensor läuft schon seit ${St(s0)}. Wie groß ist die Wahrscheinlichkeit, dass er weitere ${St(t)} hält – also insgesamt länger als ${St(u)}?`,
        [feld("p", "P", "p")], { p: g }, { p: eTxt(kt) }, { p: [[Math.exp(-ku), NEU], [Math.exp(-ks), SCHON], [1 - g, "Gegenereignis erwischt: „hält weiter“ ist P(T > …), nicht P(T ≤ …)."]] }, weg, { l, mu, s: s0, t, u });
    }
    if (s === 2) {
      const p = 1 - g, v = dk(p, 3);
      const weg = [`λ \\cdot ${z(s0)} = ${z(ks)}, \\quad λ \\cdot ${z(u)} = ${z(ku)}`, bedingt, bruchZeile, `P_{T > ${z(s0)}}(T ≤ ${z(u)}) = 1 − ${eHoch(kt)} ${gl(p, v)} ${v}`];
      return bau("gedaechtnis", s, K.id, `${K.mitL(l)} Ein Sensor läuft schon seit ${St(s0)}. Wie groß ist die Wahrscheinlichkeit, dass er in den nächsten ${St(t)} ausfällt?`,
        [feld("p", "P", "p")], { p }, { p: `1-${eTxt(kt)}` }, { p: [[1 - Math.exp(-ku), NEU], [g, "Gegenereignis erwischt: „fällt aus“ ist 1 − P(hält weiter)."], [1 - Math.exp(-ks), SCHON]] }, weg, { l, mu, s: s0, t, u });
    }
    /* Stufe 4: neu und gebraucht nebeneinander */
    const pn = Math.exp(-ku), vn = dk(pn, 3), v = dk(g, 3);
    const weg = [
      `\\text{neu: } P(T > ${z(u)}) = ${eWeg(l, u)} ${gl(pn, vn)} ${vn}`,
      `\\text{gebraucht: } ${bedingt}`,
      `${bruchZeile} ${gl(g, v)} ${v}`,
    ];
    return bau("gedaechtnis", s, K.id, `${K.mitL(l)} Wie groß ist die Wahrscheinlichkeit, dass ein neuer Sensor länger als ${St(u)} hält? Und wie groß ist sie für einen Sensor, der schon ${St(s0)} gelaufen ist?`,
      [feld("neu", "P(neu)", "p"), feld("p", "P(gebraucht)", "p")], { neu: pn, p: g }, { neu: eTxt(ku), p: eTxt(kt) },
      { neu: [[g, "Das ist die Wahrscheinlichkeit für den gebrauchten Sensor. Ein neuer muss die ganze Zeit von 0 an überstehen."], [Math.exp(-ks), "Das ist P(T > s). Gefragt ist ein neuer Sensor, der länger als s + t hält."]],
        p: [[pn, NEU], [pn / Math.exp(-kt), SCHON]] }, weg, { l, mu, s: s0, t, u });
  }
  if (s === 3) {
    const K = KONTEXTE[wahl(["hotline", "taxi"], zufall)];
    const mu = wahl(K.mittel, zufall), l = sauber(1 / mu);
    const [rs, rt] = wahl([[0.5, 1], [1, 1], [1, 0.5], [1.5, 1], [0.5, 1.5], [2, 1]].filter(([a, b]) => passt(K, mu * a) && passt(K, mu * b)), zufall);
    const s0 = sauber(mu * rs), t = sauber(mu * rt), u = sauber(s0 + t);
    const ks = sauber(l * s0), ku = sauber(l * u), kt = sauber(l * t);
    const g = Math.exp(-kt), v = dk(g, 3);
    const weg = [
      `λ = \\frac{1}{${z(mu)}} = ${z(l)}`,
      `P_{T > ${z(s0)}}(T > ${z(u)}) = \\frac{P(T > ${z(u)})}{P(T > ${z(s0)})}`,
      `= \\frac{${eHoch(ku)}}{${eHoch(ks)}} = ${eHoch(kt)} ${gl(g, v)} ${v}`,
    ];
    const wer = K.id === "taxi" ? "auf ein Taxi" : "auf den nächsten Anruf";
    return bau("gedaechtnis", s, K.id, `${K.mitMu(mu)} Du wartest schon ${Mi(s0)} ${wer}. Wie groß ist die Wahrscheinlichkeit, dass du insgesamt länger als ${Mi(u)} wartest?`,
      [feld("p", "P", "p")], { p: g }, { p: eTxt(kt) }, { p: [[Math.exp(-ku), "Das ist die Wahrscheinlichkeit von Anfang an. Die schon gewarteten Minuten sind vorbei – es zählt nur die Restzeit."], [Math.exp(-ks), SCHON], [Math.exp(-mu * t), "λ ist der Kehrwert der mittleren Wartezeit: λ = 1/μ."]] }, weg, { l, mu, s: s0, t, u });
  }
  /* Stufe 5: Kern mit Halbwertszeit, schon s Tage alt, zerfällt in den nächsten t Tagen */
  const K = KONTEXTE.kern;
  const h = wahl(K.halb, zufall);
  const q = wahl([0.5, 1.5, 2.5].filter((x) => passt(K, sauber(x * h)) && sauber(x * h) !== 1), zufall);   // nie „in den nächsten 1 Tag“
  const s0 = sauber(h * wahl([1, 2, 3], zufall)), t = sauber(q * h), u = sauber(s0 + t);
  const p = 1 - 2 ** -q, v = dk(p, 3);
  const weg = [
    `λ = \\frac{\\ln 2}{${z(h)}}, \\quad λ \\cdot ${z(t)} = ${qln(q)}`,
    `P_{T > ${z(s0)}}(T ≤ ${z(u)}) = 1 − P_{T > ${z(s0)}}(T > ${z(u)})`,
    `= 1 − P(T > ${z(t)}) \\quad \\text{(ohne Gedächtnis)}`,
    `= 1 − e^{−${qln(q)}} = 1 − ${zweiHoch(q)} ${gl(p, v)} ${v}`,
  ];
  return bau("gedaechtnis", s, K.id, `${K.mitH(h)} Ein bestimmter Kern existiert schon seit ${Ta(s0)}. Wie groß ist die Wahrscheinlichkeit, dass er in den nächsten ${Ta(t)} zerfällt?`,
    [feld("p", "P", "p")], { p }, { p: `1-2^(-${String(q).replace(".", ",")})` },
    { p: [[1 - 2 ** -(u / h), "Das ist die Wahrscheinlichkeit für einen frisch entstandenen Kern. Das Alter des Kerns spielt keine Rolle – nur die nächsten Tage zählen."],
      [2 ** -q, "Gegenereignis erwischt: „zerfällt“ ist 1 − P(überlebt)."], [1 - Math.exp(-t / h), "Mit der Halbwertszeit h gilt λ = ln 2/h, nicht 1/h."]] }, weg, { h, s: s0, t, u, q });
}

export function aufgabe(art, stufe, zufall = zz) {
  const s = stufeIn(stufe);
  if (art === "kenn") return kennAufgabe(s, zufall);
  if (art === "lambda") return lambdaAufgabe(s, zufall);
  if (art === "gedaechtnis") return gedaechtnisAufgabe(s, zufall);
  return wktAufgabe(s, zufall);
}

export const felder = (a) => a.felder;
export const auftrag = (a) => a.text;
export const rechenweg = (a) => a.weg;

/* Prüfen: eingabe = { feld: Text } → { ok, felder: { feld: bool }, grund } */
export function pruefe(a, eingabe = {}) {
  const ergebnis = {}, ist = {};
  for (const [k, , typ] of a.felder) {
    ist[k] = liesWert(eingabe[k]);
    ergebnis[k] = trifft(ist[k], a.soll[k], typ);
  }
  const ok = Object.values(ergebnis).every(Boolean);
  return { ok, felder: ergebnis, grund: ok ? "" : grundFuer(a, eingabe, ist, ergebnis) };
}

function grundFuer(a, eingabe, ist, erg) {
  const [k, , typ] = a.felder.find(([x]) => !erg[x]);
  const v = ist[k], soll = a.soll[k];
  if (!String(eingabe[k] ?? "").trim()) return "Fülle alle Felder aus.";
  if (v === null) return typ === "p" ? "Gib eine Zahl ein – exakt wie e^(−1,5) oder gerundet wie 0,223." : "Gib eine Zahl ein – exakt wie ln(2)/0,25 oder gerundet.";
  if (typ === "p" && (v < 0 || v > 1)) return v > 1 && Math.abs(v - 1 / soll) < 1e-3 * (1 / soll)
    ? "Prüfe das Vorzeichen im Exponenten: P(T > t) = e^(−λt) mit Minus. Eine Wahrscheinlichkeit liegt zwischen 0 und 1."
    : "Eine Wahrscheinlichkeit liegt zwischen 0 und 1. Prüfe das Vorzeichen im Exponenten und welche Fläche gefragt ist.";
  for (const [w, text] of a.fallen[k] || []) if (Math.abs(v - w) <= TOLERANZ[typ](w)) return text;
  if (Math.abs(v - soll) <= TOLERANZ[typ](soll) * 10) return typ === "p" ? "Fast – runde genauer: drei Nachkommastellen, oder gib den exakten Term ein."
    : typ === "rate" ? "Fast – runde genauer: drei gültige Ziffern, oder gib den exakten Term ein." : "Fast – runde genauer: zwei Nachkommastellen, oder gib den exakten Term ein.";
  return tipp(a);
}

export function tipp(a) {
  if (a.art === "wkt") return a.h ? "Mit Halbwertszeit: λ = ln 2/h, also P(T > t) = e^(−λt) = (1/2)^(t/h). Für Intervalle: F(b) − F(a)." : "P(T > t) = e^(−λt), P(T ≤ t) = 1 − e^(−λt), P(a ≤ T ≤ b) = e^(−λa) − e^(−λb). Bei gegebener mittlerer Zeit μ ist λ = 1/μ.";
  if (a.art === "kenn") return "E(T) = 1/λ. Median: F(m) = 0,5 ⇒ m = ln 2/λ. Allgemein: F(t) = q nach t auflösen – mit dem Logarithmus.";
  if (a.art === "lambda") return "Angabe als Gleichung schreiben (e^(−λt) = Anteil, der länger hält) und mit ln nach λ auflösen. Mittlere Zeit: λ = 1/E(T).";
  return "Ohne Gedächtnis: P_{T>s}(T > s + t) = P(T > s + t) : P(T > s) = e^(−λt). Es zählt nur die Restzeit t.";
}

/* ---------- GFS: Gliederung, Tipps, Kolloquium ---------- */
export const GLIEDERUNG = [
  { min: 2, titel: "Einstieg: gebraucht oder neu?", text: "Zwei gleiche Sensoren, einer neu, einer läuft schon 1000 Stunden. Welchen nimmst du? Fast alle nehmen den neuen. Löse erst am Ende auf: Wenn die Lebensdauer exponentialverteilt ist, ist es egal. Das ist deine Leitfrage." },
  { min: 4, titel: "Von kleinen Schritten zur e-Funktion", text: "Zeit in Schritte Δt teilen, in jedem Schritt Treffer mit λΔt: geometrische Verteilung, P(T > t) = (1 − λt/n)^n. An der Tafel den Grenzwert über den Differenzenquotienten von ln an der Stelle 1 zeigen; die Zahlentabelle für t = 2 auf eine Folie." },
  { min: 4, titel: "Dichte, Verteilungsfunktion, Fläche", text: "F(t) = 1 − e^(−λt), f = F′ = λe^(−λt). Betone: Wahrscheinlichkeiten sind Flächen, f(t) selbst ist keine. Ein Zahlenbeispiel mit P(a ≤ T ≤ b) = e^(−λa) − e^(−λb) und die Fläche 1 unter f." },
  { min: 3, titel: "Erwartungswert und Median", text: "E(T) = 1/λ mit der Stammfunktion G(t) = −(t + 1/λ)e^(−λt) – durch Ableiten bestätigen. Dann m = ln 2/λ und warum der Median kleiner ist: Die seltenen langen Wartezeiten ziehen den Mittelwert nach rechts." },
  { min: 4, titel: "Ohne Gedächtnis – Anwendungen und Grenzen", text: "Beweis P_{T>s}(T > s + t) = P(T > t) in drei Zeilen, dann die Leitfrage beantworten. Anwendungen: radioaktiver Zerfall (Halbwertszeit = Median), Bauteile, Hotline. Grenze: Verschleiß – ein Autoreifen hat ein Gedächtnis." },
];

export const TIPPS = [
  "Starte mit der Frage „neu oder gebraucht?“ und lass abstimmen. Die Auflösung am Ende ist dein stärkster Moment – verrate sie nicht zu früh.",
  "Rechne die Tabelle (1 − λt/n)^n vorher mit dem Taschenrechner nach und zeig sie auf einer Folie. Den Grenzwert und den Gedächtnis-Beweis entwickelst du an der Tafel.",
  "Aufs Handout gehören F, f, E(T) = 1/λ, m = ln 2/λ, der Gedächtnis-Beweis und je eine Aufgabe zu Wahrscheinlichkeit, Halbwertszeit und bedingter Wahrscheinlichkeit mit Lösung.",
];

export const KOLLOQUIUM = [
  { stufe: "Basis", frage: "Was ist der Unterschied zwischen der Dichte f und der Verteilungsfunktion F?",
    antwort: "F(t) = P(T ≤ t) ist eine Wahrscheinlichkeit und wächst von 0 bis 1. Die Dichte f = F′ ist die Steigung von F; Wahrscheinlichkeiten sind Flächen unter f. Zum Beispiel ist P(1 ≤ T ≤ 3) die Fläche unter f zwischen 1 und 3, also F(3) − F(1)." },
  { stufe: "Basis", frage: "Warum ist P(T = 2) = 0, obwohl man genau 2 Minuten warten kann?",
    antwort: "Bei einer stetigen Zufallsgröße ist die Wahrscheinlichkeit eines einzelnen Werts die Fläche über einem Punkt – und die ist 0. Erst Intervalle haben eine positive Wahrscheinlichkeit. Deshalb ist es auch egal, ob man P(T ≤ 2) oder P(T < 2) schreibt." },
  { stufe: "Basis", frage: "Warum ist die mittlere Wartezeit der Kehrwert von λ?",
    antwort: "λ ist die Rate: λ Ereignisse pro Zeiteinheit. Kommen im Schnitt 0,5 Anrufe pro Minute, dann vergehen im Mittel 2 Minuten bis zum nächsten. Rechnerisch: E(T) = ∫ t · λe^(−λt) dt von 0 bis ∞ = 1/λ, mit der Stammfunktion −(t + 1/λ)e^(−λt)." },
  { stufe: "Basis", frage: "Was bedeutet „ohne Gedächtnis“ anschaulich?",
    antwort: "Wie lange etwas schon gedauert hat, ändert nichts an der Restzeit. Ein Bauteil, das 1000 Stunden gelaufen ist, hält mit derselben Wahrscheinlichkeit noch t Stunden wie ein neues. Formal: P_{T>s}(T > s + t) = P(T > t)." },
  { stufe: "Vertiefung", frage: "Warum ist der Median kleiner als der Erwartungswert?",
    antwort: "Der Median ist ln 2/λ ≈ 0,69/λ, der Erwartungswert 1/λ. Die Dichte ist rechtsschief: Viele Wartezeiten sind kurz, wenige sehr lang. Die langen ziehen den Mittelwert nach rechts, am Median ändern sie nichts. Darum warten rund 63 % kürzer als im Mittel." },
  { stufe: "Vertiefung", frage: "Was hat die Halbwertszeit mit der Exponentialverteilung zu tun?",
    antwort: "Die Lebensdauer eines Kerns ist exponentialverteilt. Die Halbwertszeit ist ihr Median: Nach T½ = ln 2/λ ist ein Kern mit Wahrscheinlichkeit 1/2 zerfallen. Bei vielen Kernen ist deshalb nach einer Halbwertszeit ungefähr die Hälfte zerfallen – und wegen der Gedächtnislosigkeit nach jeder weiteren wieder die Hälfte des Rests." },
  { stufe: "Vertiefung", frage: "Was hat die Exponentialverteilung mit der geometrischen Verteilung zu tun?",
    antwort: "Die geometrische Verteilung zählt Versuche bis zum ersten Treffer. Teilt man die Zeit in Schritte Δt mit Trefferwahrscheinlichkeit λΔt, ist P(T > t) = (1 − λt/n)^n. Für n → ∞ geht das gegen e^(−λt). Die Exponentialverteilung ist also die stetige Schwester der geometrischen – und beide sind gedächtnislos." },
  { stufe: "Vertiefung", frage: "Kann die Dichte f(t) größer als 1 sein?",
    antwort: "Ja. Bei λ = 2 ist f(0) = 2. Das ist kein Widerspruch, weil f(t) keine Wahrscheinlichkeit ist. Nur die Fläche unter f muss 1 sein, und Flächen über kurzen Intervallen bleiben klein: P(0 ≤ T ≤ 0,1) = 1 − e^(−0,2) ≈ 0,18." },
  { stufe: "Vertiefung", frage: "Wie bestimmt man λ aus echten Messwerten?",
    antwort: "Am einfachsten über den Mittelwert: E(T) = 1/λ, also λ ≈ 1 : (Mittelwert der gemessenen Zeiten). Oder über einen Anteil: Halten 70 % länger als 100 Stunden, dann gilt e^(−100λ) = 0,7, also λ = −ln 0,7 : 100 ≈ 0,0036 pro Stunde." },
  { stufe: "Profi", frage: "Für welche Bauteile passt das Modell nicht?",
    antwort: "Für alles mit Verschleiß: Reifen, Kugellager, Glühwendeln. Dort steigt die Ausfallrate mit dem Alter, ein gebrauchtes Teil ist schlechter als ein neues. Auch Frühausfälle durch Fertigungsfehler passen nicht. In der Technik beschreibt man das mit der Badewannenkurve: Frühausfälle, eine lange Phase mit fast konstanter Rate – nur dort passt die Exponentialverteilung – und Verschleiß." },
  { stufe: "Profi", frage: "Gibt es außer der Exponentialverteilung andere stetige Verteilungen ohne Gedächtnis?",
    antwort: "Nein. Mit G(t) = P(T > t) bedeutet Gedächtnislosigkeit G(s + t) = G(s) · G(t) für alle s, t ≥ 0. Man kann zeigen, dass die einzigen stetigen fallenden Lösungen G(t) = e^(−λt) sind. Im Diskreten spielt die geometrische Verteilung dieselbe Rolle." },
  { stufe: "Profi", frage: "Ein Bus fährt genau alle 10 Minuten. Ist deine Wartezeit exponentialverteilt?",
    antwort: "Nein. Kommst du zu einer zufälligen Zeit, ist die Wartezeit gleichverteilt zwischen 0 und 10 Minuten, im Mittel 5. Sie hat ein Gedächtnis: Nach 8 Minuten Warten kommt der Bus sicher in den nächsten 2. Exponentialverteilt sind nur Wartezeiten auf Ereignisse, die zufällig und unabhängig voneinander eintreten – wie Anrufe oder Zerfälle." },
];
