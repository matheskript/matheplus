/* ============================================================
   GFS-Trainer · Wachstum und Differenzialgleichungen
   (Kursstufe 1, Kapitel II Exponential- und Logarithmusfunktionen;
   G8 Klasse 11, G9 Klasse 12)
   Reine Logik ohne React: die drei Wachstumsmodelle (rechte Seite der
   DGL, exakte Lösung, Euler-Verfahren), Daten der Herleitung und der
   Animationen, vier Übungsgeneratoren mit Prüfung, gezielter Rückmeldung
   zu typischen Fehlern und vollständigem Rechenweg, Gliederung, Tipps
   und Kolloquium. Getestet in tests/gfsWachstum.test.mjs.
   Nichts stammt aus einem Schulbuch: Aufgaben, Kontexte, Zahlen und
   Formulierungen sind eigene.
   Schreibweise: Minus als „−“, Dezimalkomma, Produkte eng (0,3t, 50e^{…}),
   in der DGL „·“ zwischen Faktor und Funktion; A5: nichts bleibt
   unvereinfacht. Aufträge enthalten Formeln in $…$ (Text-Baustein),
   Rückmeldungen und Tipps sind reiner Text.
   ============================================================ */
import { parse, kompiliere, hatX, hatVar } from "./formelEngine.js";

/* ---------- Zufall (wie gfsZiegen.js) ---------- */
/* mulberry32: kleiner Generator mit Startwert – wiederholbare Aufgaben und Tests */
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
export const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
/* Dezimalkomma, echtes Minus, keine überflüssigen Nullen */
export const dk = (x, n = 3) => String(rund(x, n)).replace("-", "−").replace(".", ",");
/* auf s gültige Ziffern */
export const sig = (x, s = 3) => {
  if (!x) return 0;
  const e = Math.floor(Math.log10(Math.abs(x)));
  return rund(x, Math.max(0, s - 1 - e));
};
export const dkSig = (x, s = 3) => String(sig(x, s)).replace("-", "−").replace(".", ",");
/* Tausender ab 10 000 gruppieren: in TeX mit „\,“, im Text mit schmalem Leerzeichen */
const gruppiert = (x, trenner) => {
  const [g, d] = dk(x, 6).split(",");
  const m = g.replace("−", "");
  const ganz = m.length > 4 ? m.replace(/\B(?=(\d{3})+(?!\d))/g, trenner) : m;
  return `${g.startsWith("−") ? "−" : ""}${ganz}${d ? `,${d}` : ""}`;
};
export const zT = (x) => gruppiert(sauber(x), "\\,");      // Zahl in TeX
export const zP = (x) => gruppiert(sauber(x), " ");   // Zahl im Fließtext
/* Zahl, wie man sie eintippt („-0,2“) */
const ein = (x) => String(sauber(x)).replace(".", ",");
/* „=“ wenn der angezeigte Wert exakt ist, sonst „≈“ */
const gl = (wert, text) => (Math.abs(Number(String(text).replace("−", "-").replace(",", ".")) - wert) < 1e-9 ? "=" : "≈");
/* Exponent kt in TeX, ohne „1t“ */
const ex = (k, v = "t") => (sauber(k) === 1 ? v : sauber(k) === -1 ? `−${v}` : `${zT(k)}${v}`);
/* c · e^{kt} in TeX, eng und ohne „1e“ */
const eT = (c, k, v = "t") => `${sauber(c) === 1 ? "" : sauber(c) === -1 ? "−" : zT(c)}e^{${ex(k, v)}}`;
/* e^x mit Zahl x, e^1 = e */
const eZ = (x) => (sauber(x) === 1 ? "e" : `e^{${zT(x)}}`);
/* Faktor vor einem Term: „3 \cdot “ oder nichts bei 1 */
const malT = (c) => (sauber(c) === 1 ? "" : `${zT(c)} \\cdot `);

/* Verhältnis zweier positiver Zahlen: ganz, endliche Dezimalzahl oder gekürzter Bruch (TeX und Eingabe) */
export function verhaeltnis(zl, nn) {
  let d = 0;
  while (d < 6 && (!Number.isInteger(sauber(zl * 10 ** d)) || !Number.isInteger(sauber(nn * 10 ** d)))) d += 1;
  let a = Math.round(zl * 10 ** d), b = Math.round(nn * 10 ** d);
  const g = ggT(a, b); a /= g; b /= g;
  let r = b; while (r % 2 === 0) r /= 2; while (r % 5 === 0) r /= 5;
  const wert = a / b;
  if (b === 1 || r === 1) return { wert, tex: zT(wert), ein: ein(wert), bruch: false };
  return { wert, tex: `\\frac{${a}}{${b}}`, ein: `(${a}/${b})`, bruch: true };
}
const lnT = (v) => (v.bruch ? `\\ln${v.tex}` : `\\ln ${v.tex}`);
/* ln eines Verhältnisses q < 1 vereinfacht: ln 0,25 = −ln 4 */
const lnKlein = (zl, nn) => `${lnT(verhaeltnis(zl, nn))} = −${lnT(verhaeltnis(nn, zl))}`;

/* ---------- Die drei Modelle ----------
   exponentiell  f′ = k · f              f(t) = f(0) · e^(kt)
   beschränkt    f′ = k · (S − f)        f(t) = S − (S − f(0)) · e^(−kt)
   logistisch    f′ = k · f · (S − f)    f(t) = S / (1 + (S/f(0) − 1) · e^(−kSt)) */
export const MODELLE = [
  { id: "exp", name: "exponentiell", dgl: "f′ = k · f" },
  { id: "beschraenkt", name: "beschränkt", dgl: "f′ = k · (S − f)" },
  { id: "logistisch", name: "logistisch", dgl: "f′ = k · f · (S − f)" },
];
export function rate(m, { k, S }, f) {
  if (m === "exp") return k * f;
  if (m === "beschraenkt") return k * (S - f);
  return k * f * (S - f);
}
export function loesung(m, { k, S, f0 }, t) {
  if (m === "exp") return f0 * Math.exp(k * t);
  if (m === "beschraenkt") return S - (S - f0) * Math.exp(-k * t);
  if (f0 === 0) return 0;
  return S / (1 + (S / f0 - 1) * Math.exp(-k * S * t));
}
/* Euler: f(t + Δt) ≈ f(t) + Δt · f′(t), f′ aus der DGL */
export const eulerSchritt = (m, p, f, dt) => f + dt * rate(m, p, f);
export function euler(m, p, dt, n) {
  const w = [p.f0];
  for (let i = 0; i < n; i++) w.push(eulerSchritt(m, p, w[i], dt));
  return w;
}
export const verdopplungszeit = (k) => Math.LN2 / Math.abs(k);
export const wendezeit = ({ k, S, f0 }) => Math.log(S / f0 - 1) / (k * S);
export const maxRate = ({ k, S }) => (k * S * S) / 4;

/* ---------- Daten der Herleitung ---------- */
export const BSP_EXP = { k: 0.5, f0: 3 };                       // Schritt 1: f(t) = 3e^{0,5t}
export const BAKTERIEN = { verdopplung: 3 };                     // Schritt 2: k = ln 2/3
export const TEE = { k: 0.1, S: 20, f0: 90, t: 10, ziel: 40 };   // Schritt 3: Newton
export const INFUSION = { zufuhr: 6, abbau: 0.2, f0: 0, t: 5 };  // Schritt 3: S = 30 mg
export const GERUECHT = { k: 0.0005, S: 1000, f0: 10 };          // Schritt 4: t_W = 2 ln 99, f′max = 125
export const EULER_BSP = { k: 0.5, S: 10, f0: 2, bis: 2 };       // Schritt 5 und Animation „euler“
export const EULER_DT = [1, 0.5, 0.25, 0.1, 0.01];
export const EULER_TABELLE = EULER_DT.map((dt) => {
  const n = Math.round(EULER_BSP.bis / dt);
  const wert = euler("beschraenkt", EULER_BSP, dt, n)[n];
  return { dt, n, wert, fehler: wert - loesung("beschraenkt", EULER_BSP, EULER_BSP.bis) };
});
/* Schritt 6: vier Messreihen mit gleichen Zeitabständen (eigene Beispielwerte, exakt aus den Modellen) */
export const DATEN = [
  { id: "linear", name: "linear", f: [20, 35, 50, 65, 80], merkmal: "Differenzen gleich" },
  { id: "exp", name: "exponentiell", f: [16, 24, 36, 54, 81], merkmal: "Quotienten gleich" },
  { id: "beschraenkt", name: "beschränkt", f: [20, 60, 80, 90, 95], merkmal: "Differenzen halbieren sich" },
  { id: "logistisch", name: "logistisch", f: [10, 25, 50, 75, 90], merkmal: "Differenzen erst größer, dann kleiner" },
];
/* Daten der fünf Erkläranimationen (die Zahlen in den Schritttexten prüft tests/gfsWachstum.test.mjs) */
export const ANIM = {
  feld: { k: 0.5, S: 8, starts: [1, 4, 11] },               // Richtungsfeld von f′ = 0,5 · (8 − f)
  exp: { k: Math.LN2 / 2, f0: 1 },                           // Verdopplungszeit genau 2
  tee: { k: 0.1, S: 20, f0: 90 },                            // Abstand halbiert sich alle 10 ln 2 ≈ 6,93 min
  logistisch: { k: 0.1, S: 10, f0: 0.1 },                    // kS = 1, t_W = ln 99, f′max = 2,5
  euler: { ...EULER_BSP, dts: [1, 0.5, 0.25] },
};
export const differenzen = (f) => f.slice(1).map((v, i) => sauber(v - f[i]));
export const quotienten = (f) => f.slice(1).map((v, i) => v / f[i]);

/* ---------- Eingaben lesen ---------- */
/* Zahl oder Term ohne Variable: „45,75“, „20+70e^(−1)“, „ln(3,5)/0,1“, „-ln(2)/8“ → Zahl; sonst null */
export function liesWert(s) {
  const t = String(s ?? "").trim().replace(/\s+/g, "").replace(/−/g, "-").replace(/·/g, "*");
  if (!t) return null;
  if (/^-?\d+,\d+,/.test(t)) return null;                 // „1,2,3“ ist keine Zahl
  const b = parse(t);
  if (!b || hatX(b) || hatVar(b)) return null;
  let v;
  try { v = kompiliere(b)(0); } catch (e) { return null; }
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
/* Toleranzen: Werte und Zeiten auf zwei Nachkommastellen (große Werte 0,01 %), k auf drei gültige Ziffern,
   Anzahlen (Schüler, Tiere, Nutzer) auf ganze Zahlen, Euler-Werte auf zwei Nachkommastellen */
export const TOLERANZ = {
  wert: (soll) => Math.max(0.0051, Math.abs(soll) * 1e-4),
  zeit: (soll) => Math.max(0.0051, Math.abs(soll) * 1e-4),
  rate: (soll) => Math.abs(soll) * 0.006,
  anzahl: () => 0.51,
  euler: (soll) => Math.max(0.0051, Math.abs(soll) * 1e-4),
};
export const trifft = (ist, soll, typ = "wert") => ist !== null && Math.abs(ist - soll) <= TOLERANZ[typ](soll);
const ANZEIGE = { wert: (x) => dk(x, 2), zeit: (x) => dk(x, 2), rate: (x) => dkSig(x, 3), anzahl: (x) => dk(x, 1), euler: (x) => dk(x, 2) };
export const RUNDUNG = {
  wert: "Werte exakt (z. B. 20 + 70e^(−1)) oder auf zwei Nachkommastellen gerundet.",
  zeit: "Zeiten exakt (z. B. ln(3,5)/0,1) oder auf zwei Nachkommastellen gerundet.",
  rate: "k exakt (z. B. ln(2)/3) oder auf drei gültige Ziffern gerundet (z. B. 0,231).",
  anzahl: "Anzahlen exakt (z. B. 1000/(1 + 99e^(−2,5))) oder auf ganze Zahlen gerundet.",
  euler: "Euler-Werte auf zwei Nachkommastellen gerundet. Mit deinem gerundeten Vorwert weiterzurechnen ist erlaubt.",
};

/* ---------- Kontexte (eigene Formulierungen) ---------- */
const EINH = {
  h: { ein: "Stunde", dat: "Stunden", akk: "Stunden", kurz: "h", pro: "pro Stunde" },
  d: { ein: "Tag", dat: "Tagen", akk: "Tage", kurz: "Tage", pro: "pro Tag" },
  a: { ein: "Jahr", dat: "Jahren", akk: "Jahre", kurz: "Jahre", pro: "pro Jahr" },
  min: { ein: "Minute", dat: "Minuten", akk: "Minuten", kurz: "min", pro: "pro Minute" },
  w: { ein: "Woche", dat: "Wochen", akk: "Wochen", kurz: "Wochen", pro: "pro Woche" },
  mo: { ein: "Monat", dat: "Monaten", akk: "Monate", kurz: "Monate", pro: "pro Monat" },
};
const nach = (x, e) => `${zP(x)} ${x === 1 ? EINH[e].ein : EINH[e].dat}`;     // „nach 3 Stunden“
const alle = (x, e) => `alle ${zP(x)} ${EINH[e].akk}`;                          // „alle 3 Stunden“ (x ≥ 2)

/* Exponentielles Wachstum bzw. exponentielle Abnahme */
const EXP = {
  bakterien: {
    id: "bakterien", e: "h", ks: [0.2, 0.25, 0.3, 0.4, 0.5], f0s: [2, 3, 5, 8], ts: [2, 3, 4, 5, 6], faktoren: [2, 5, 10], zeiten: [2, 3, 4, 5, 6], einheit: "Tausend",
    dgl: (k, f0) => `Eine Bakterienkultur wächst in einer Nährlösung. Ihre Größe $f(t)$ in Tausend ($t$ in Stunden) erfüllt $f′(t) = ${zT(k)} \\cdot f(t)$. Zu Beginn sind es ${zP(f0)} Tausend Bakterien.`,
    wert: (t) => `Wie viele Bakterien (in Tausend) sind es nach ${nach(t, "h")}?`,
    zeit: (B) => `Nach welcher Zeit sind es ${zP(B)} Tausend Bakterien?`,
    angabe: (T) => `Eine Bakterienkultur verdoppelt ihre Größe ${alle(T, "h")}. Ihr Wachstum folgt $f′(t) = k \\cdot f(t)$ ($t$ in Stunden). Bestimme die Wachstumskonstante $k$.`,
    mitK: (k) => `Eine Bakterienkultur wächst nach $f′(t) = ${zT(k)} \\cdot f(t)$ ($t$ in Stunden). Nach welcher Zeit $T_D$ hat sich ihre Größe verdoppelt?`,
  },
  algen: {
    id: "algen", e: "d", ks: [0.1, 0.15, 0.2], f0s: [4, 5, 10, 12], ts: [5, 7, 10], faktoren: [2, 3, 5], zeiten: [4, 5, 7, 10], einheit: "m²",
    dgl: (k, f0) => `Auf einem Teich breitet sich ein Algenteppich aus. Die bedeckte Fläche $f(t)$ in m² ($t$ in Tagen) erfüllt $f′(t) = ${zT(k)} \\cdot f(t)$. Zu Beginn sind ${zP(f0)} m² bedeckt.`,
    wert: (t) => `Wie groß ist die bedeckte Fläche nach ${nach(t, "d")}?`,
    zeit: (B) => `Nach welcher Zeit sind ${zP(B)} m² bedeckt?`,
    angabe: (T) => `Ein Algenteppich auf einem Teich verdoppelt seine Fläche ${alle(T, "d")}. Sein Wachstum folgt $f′(t) = k \\cdot f(t)$ ($t$ in Tagen). Bestimme die Wachstumskonstante $k$.`,
    mitK: (k) => `Ein Algenteppich wächst nach $f′(t) = ${zT(k)} \\cdot f(t)$ ($t$ in Tagen). Nach welcher Zeit $T_D$ hat sich seine Fläche verdoppelt?`,
  },
  konto: {
    id: "konto", e: "a", ks: [0.02, 0.025, 0.03, 0.04], f0s: [1000, 2000, 5000], ts: [5, 10, 15, 20], faktoren: [2, 3], zeiten: [10, 20, 25], einheit: "€",
    dgl: (k, f0) => `Ein Guthaben wird stetig verzinst. Der Kontostand $f(t)$ in Euro ($t$ in Jahren) erfüllt $f′(t) = ${zT(k)} \\cdot f(t)$. Angelegt werden ${zP(f0)} €.`,
    wert: (t) => `Wie hoch ist der Kontostand nach ${nach(t, "a")}?`,
    zeit: (B) => `Nach welcher Zeit ist der Kontostand auf ${zP(B)} € gewachsen?`,
    angabe: (T) => `Ein stetig verzinstes Guthaben verdoppelt sich ${alle(T, "a")}. Der Kontostand folgt $f′(t) = k \\cdot f(t)$ ($t$ in Jahren). Bestimme den Zinssatz $k$.`,
    mitK: (k) => `Ein Guthaben wird stetig verzinst: $f′(t) = ${zT(k)} \\cdot f(t)$ ($t$ in Jahren). Nach welcher Zeit $T_D$ hat es sich verdoppelt?`,
  },
  medikament: {
    id: "medikament", e: "h", ks: [-0.1, -0.15, -0.2, -0.25], f0s: [200, 400, 500, 800], ts: [2, 3, 4, 6], faktoren: [2, 4, 5, 10], zeiten: [2, 4, 5, 6, 8], einheit: "mg", ab: true,
    dgl: (k, f0) => `Ein Wirkstoff wird im Körper abgebaut. Seine Menge $f(t)$ in mg im Blut ($t$ in Stunden) erfüllt $f′(t) = ${zT(k)} \\cdot f(t)$. Zu Beginn sind ${zP(f0)} mg im Blut.`,
    wert: (t) => `Wie viel Wirkstoff ist nach ${nach(t, "h")} noch im Blut?`,
    zeit: (B) => `Nach welcher Zeit sind nur noch ${zP(B)} mg im Blut?`,
    angabe: (T) => `Die Menge eines Wirkstoffs im Blut halbiert sich ${alle(T, "h")}. Der Abbau folgt $f′(t) = k \\cdot f(t)$ ($t$ in Stunden). Bestimme $k$.`,
    mitK: (k) => `Ein Wirkstoff wird nach $f′(t) = ${zT(k)} \\cdot f(t)$ abgebaut ($t$ in Stunden). Nach welcher Zeit $T_H$ ist nur noch die Hälfte im Blut?`,
  },
  isotop: {
    id: "isotop", e: "d", ks: [-0.02, -0.05, -0.1], f0s: [10, 20, 50], ts: [5, 10, 20], faktoren: [2, 4, 5, 10], zeiten: [3, 8, 12, 15], einheit: "mg", ab: true,
    dgl: (k, f0) => `Ein radioaktives Präparat zerfällt. Seine Masse $f(t)$ in mg ($t$ in Tagen) erfüllt $f′(t) = ${zT(k)} \\cdot f(t)$. Zu Beginn sind es ${zP(f0)} mg.`,
    wert: (t) => `Wie viel mg sind nach ${nach(t, "d")} noch übrig?`,
    zeit: (B) => `Nach welcher Zeit sind nur noch ${zP(B)} mg übrig?`,
    angabe: (T) => `Ein radioaktives Präparat hat eine Halbwertszeit von ${nach(T, "d")}. Seine Masse folgt $f′(t) = k \\cdot f(t)$ ($t$ in Tagen). Bestimme $k$.`,
    mitK: (k) => `Ein radioaktives Präparat zerfällt nach $f′(t) = ${zT(k)} \\cdot f(t)$ ($t$ in Tagen). Wie groß ist seine Halbwertszeit $T_H$?`,
  },
};
const WACHSEN = ["bakterien", "algen", "konto"], ABNEHMEN = ["medikament", "isotop"];

/* Beschränktes Wachstum */
const BESCHR = {
  tee: {
    id: "tee", e: "min", Ss: [20, 22], f0s: [80, 90, 95], ks: [0.05, 0.08, 0.1], ts: [5, 10, 15], Bs: [40, 50, 60], einheit: "°C",
    dgl: (k, S, f0) => `Eine Tasse Tee mit ${zP(f0)} °C steht in einem Raum mit ${zP(S)} °C. Ihre Temperatur $f(t)$ in °C ($t$ in Minuten) erfüllt $f′(t) = ${zT(k)} \\cdot (${zT(S)} − f(t))$.`,
    wert: (t) => `Wie warm ist der Tee nach ${nach(t, "min")}?`,
    zeit: (B) => `Nach welcher Zeit hat er sich auf ${zP(B)} °C abgekühlt?`,
  },
  limo: {
    id: "limo", e: "min", Ss: [20, 22, 25], f0s: [4, 6, 8], ks: [0.04, 0.05, 0.1], ts: [10, 20, 30], Bs: [12, 15, 18], einheit: "°C",
    dgl: (k, S, f0) => `Eine Flasche Limonade kommt mit ${zP(f0)} °C aus dem Kühlschrank in einen Raum mit ${zP(S)} °C. Ihre Temperatur $f(t)$ in °C ($t$ in Minuten) erfüllt $f′(t) = ${zT(k)} \\cdot (${zT(S)} − f(t))$.`,
    wert: (t) => `Wie warm ist die Limonade nach ${nach(t, "min")}?`,
    zeit: (B) => `Nach welcher Zeit hat sie ${zP(B)} °C erreicht?`,
  },
  infusion: {
    id: "infusion", e: "h", Ss: [30, 40, 50], f0s: [0], ks: [0.2, 0.25, 0.4], ts: [2, 3, 5], anteile: [0.5, 0.75, 0.9], einheit: "mg",
    dgl: (k, S) => `Bei einer Dauerinfusion nähert sich die Wirkstoffmenge $f(t)$ in mg im Blut ($t$ in Stunden) dem Sättigungswert ${zP(S)} mg: $f′(t) = ${zT(k)} \\cdot (${zT(S)} − f(t))$. Zu Beginn ist kein Wirkstoff im Blut.`,
    wert: (t) => `Wie viel Wirkstoff ist nach ${nach(t, "h")} im Blut?`,
    zeit: (B) => `Nach welcher Zeit sind ${zP(B)} mg im Blut?`,
  },
};

/* Logistisches Wachstum: k = kS/S ist immer eine abbrechende Dezimalzahl (S nur mit Primfaktoren 2 und 5) */
const LOGIST = {
  geruecht: {
    id: "geruecht", e: "d", Ss: [400, 500, 800, 1000], f0s: [5, 10, 20], kSs: [0.4, 0.5, 0.8], ts: [3, 5, 8], einheit: "Schüler",
    dgl: (k, S, f0) => `An einer Schule mit ${zP(S)} Schülern verbreitet sich ein Gerücht. Die Zahl $f(t)$ der Schüler, die es kennen ($t$ in Tagen), erfüllt $f′(t) = ${zT(k)} \\cdot f(t) \\cdot (${zT(S)} − f(t))$. Zu Beginn kennen es ${zP(f0)} Schüler.`,
    wert: (t) => `Wie viele Schüler kennen das Gerücht nach ${nach(t, "d")}?`,
  },
  kaninchen: {
    id: "kaninchen", e: "mo", Ss: [200, 400, 500], f0s: [10, 20, 25], kSs: [0.25, 0.4, 0.5], ts: [4, 6, 10], einheit: "Tiere",
    dgl: (k, S, f0) => `Auf einer Insel ist Platz für höchstens ${zP(S)} Kaninchen. Der Bestand $f(t)$ ($t$ in Monaten) erfüllt $f′(t) = ${zT(k)} \\cdot f(t) \\cdot (${zT(S)} − f(t))$. Anfangs leben dort ${zP(f0)} Kaninchen.`,
    wert: (t) => `Wie viele Kaninchen leben nach ${nach(t, "mo")} auf der Insel?`,
  },
  app: {
    id: "app", e: "w", Ss: [2000, 5000, 10000], f0s: [50, 100, 200], kSs: [0.25, 0.4, 0.5], ts: [4, 6, 10], einheit: "Nutzer",
    dgl: (k, S, f0) => `Eine neue Lern-App kann in einer Stadt höchstens ${zP(S)} Nutzer gewinnen. Die Nutzerzahl $f(t)$ ($t$ in Wochen) erfüllt $f′(t) = ${zT(k)} \\cdot f(t) \\cdot (${zT(S)} − f(t))$. Zu Beginn sind es ${zP(f0)} Nutzer.`,
    wert: (t) => `Wie viele Nutzer hat die App nach ${nach(t, "w")}?`,
  },
};

/* ---------- Übungen ---------- */
export const ARTEN = [
  { id: "dgl", name: "DGL und Lösung" },
  { id: "parameter", name: "Parameter bestimmen" },
  { id: "bestand", name: "Bestand und Zeitpunkt" },
  { id: "euler", name: "Euler-Verfahren" },
];

/* Ein Feld: [schlüssel, Beschriftung ($…$ erlaubt), Typ (wert | zeit | rate | anzahl | euler), Einheit, Zeichen] */
const feld = (k, label, typ, einheit = "", zeichen = "=") => [k, label, typ, einheit, zeichen];
function bau(art, stufe, kontext, text, felderListe, soll, exakt, fallen, weg, mehr = {}) {
  const loesung = Object.fromEntries(felderListe.map(([k, , typ]) => [k, ANZEIGE[typ](soll[k])]));
  return { art, stufe, kontext, text, felder: felderListe, soll, loesung, exakt, fallen, weg, ...mehr };
}
/* Reihenfolge der Antworten je Anzeige mischen (wie gfsZiegen.js) */
export function gemischt(optionen, salz = 0) {
  const idx = optionen.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = (i * 7 + salz * 3 + 1) % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}
/* Auswahlaufgabe: optionen (Text mit $…$), richtig = Index, fehler = Rückmeldung je Option, weg = Erklärung (Text mit $…$) */
function auswahl(art, stufe, kontext, text, optionen, richtig, fehler, weg, zufall, mehr = {}) {
  return { art, stufe, kontext, text, mc: true, optionen, richtig, fehler, weg, felder: [], soll: {}, loesung: { wahl: richtig },
    reihenfolge: gemischt(optionen, zufall(0, 11)), ...mehr };
}

/* ======================= 1 · DGL und Lösung ======================= */
const dglTex = (m, { k, S }) => (m === "exp" ? `f′(t) = ${zT(k)} \\cdot f(t)`
  : m === "beschraenkt" ? `f′(t) = ${zT(k)} \\cdot (${zT(S)} − f(t))` : `f′(t) = ${zT(k)} \\cdot f(t) \\cdot (${zT(S)} − f(t))`);

/* Stufe 1: Welche Funktion löst f′ = k · f mit f(0) = a? */
function dglZuordnen(s, zufall) {
  const k = wahl([0.2, 0.3, 0.4, 0.5, 1.5, -0.2, -0.4, -0.5], zufall), a = wahl([2, 3, 4, 5, 8], zufall);
  const opt = [`$f(t) = ${eT(a, k)}$`, `$f(t) = ${eT(k, a)}$`, `$f(t) = ${zT(a)} ${k > 0 ? "+" : "−"} ${ex(Math.abs(k))}$`, `$f(t) = ${eT(a, -k)}$`];
  const fehler = [
    "",
    `Setze t = 0 ein: f(0) wäre ${dk(k, 3)} statt ${a}. Startwert und Faktor im Exponenten sind vertauscht.`,
    `Hier ist f′(t) = ${dk(k, 3)} konstant. Die DGL verlangt aber eine Änderungsrate, die proportional zum Bestand ist – das schafft nur die e-Funktion.`,
    `Ableiten liefert f′(t) = ${dk(-k, 3)} · f(t). Das Vorzeichen im Exponenten muss zu k = ${dk(k, 3)} passen.`,
  ];
  const weg = [
    `Einsetzen: $f(t) = ${eT(a, k)}$ hat $f′(t) = ${eT(sauber(a * k), k)} = ${zT(k)} \\cdot ${eT(a, k)} = ${zT(k)} \\cdot f(t)$.`,
    `Startwert: $f(0) = ${zT(a)} \\cdot e^0 = ${zT(a)}$. Beides passt.`,
  ];
  return auswahl("dgl", s, "zuordnen", `Welche Funktion löst die Differenzialgleichung $${dglTex("exp", { k })}$ mit dem Anfangswert $f(0) = ${zT(a)}$?`,
    opt, 0, fehler, weg, zufall, { k, a });
}

/* Stufe 2: f(t) = S ∓ c · e^(−kt) gegeben – k und S durch Einsetzen bestimmen */
function dglBeschraenktAblesen(s, zufall) {
  const S = wahl([20, 40, 50, 80, 100], zufall), k = wahl([0.1, 0.2, 0.3, 0.5], zufall);
  const unten = zufall(0, 1) === 0;                       // f(0) < S (wächst) oder f(0) > S (fällt)
  const c = unten ? wahl([S / 2, sauber(S * 0.75), S], zufall) : wahl([30, 50, 70], zufall);
  const v = unten ? 1 : -1;                                // f(t) = S − v · c · e^(−kt)
  const fT = `${zT(S)} ${unten ? "−" : "+"} ${eT(c, -k)}`;
  const ck = sauber(c * k);
  const weg = [
    unten ? `f′(t) = −${zT(c)} \\cdot (−${zT(k)})e^{${ex(-k)}} = ${eT(ck, -k)}` : `f′(t) = ${zT(c)} \\cdot (−${zT(k)})e^{${ex(-k)}} = −${eT(ck, -k)}`,
    `${zT(S)} − f(t) = ${unten ? "" : "−"}${eT(c, -k)}`,
    unten ? `f′(t) = ${zT(k)} \\cdot ${eT(c, -k)} = ${zT(k)} \\cdot (${zT(S)} − f(t))` : `f′(t) = ${zT(k)} \\cdot (−${eT(c, -k)}) = ${zT(k)} \\cdot (${zT(S)} − f(t))`,
    `k = ${zT(k)}, \\quad S = ${zT(S)}`,
  ];
  const f0 = sauber(S - v * c);
  const fallen = {
    k: [[-k, "Die Ableitung von e^(−kt) bringt den Faktor −k. Zusammen mit dem Vorzeichen vor dem e-Term ergibt sich f′ = k · (S − f) mit positivem k."],
      [ck, `Das ist f′(0), die Anfangsänderungsrate. k ist der Faktor vor dem Abstand: f′(t) = k · (S − f(t)).`],
      [c, `${zP(c)} ist der Anfangsabstand S − f(0) (bis auf das Vorzeichen), nicht k. k steht im Exponenten.`]],
    S: [[f0, `Das ist f(0). S ist der Wert, dem sich f nähert: Für große t geht e^(−kt) gegen 0, also f(t) gegen ${zP(S)}.`],
      [c, `${zP(c)} ist der Anfangsabstand zur Schranke. S ist der Wert, dem sich f nähert – die Zahl ohne e-Term.`],
      [sauber(S + v * c), "Für große t geht e^(−kt) gegen 0. Übrig bleibt die Zahl ohne e-Term – das ist S."]],
  };
  return bau("dgl", s, unten ? "ablesen-wachsend" : "ablesen-fallend",
    `Die Funktion $f(t) = ${fT}$ löst eine Differenzialgleichung der Form $f′(t) = k \\cdot (S − f(t))$. Bestimme $k$ und $S$ durch Einsetzen.`,
    [feld("k", "$k$", "rate"), feld("S", "$S$", "wert")], { k, S }, { k: ein(k), S: ein(S) }, fallen, weg, { modell: "beschraenkt", c, unten });
}

/* Stufe 3: Messreihe → Modell (Differenzen und Quotienten) */
const MESSREIHEN = {
  linear: [[12, 7], [20, 15], [35, 9], [50, 12], [80, -6]].map(([a, d]) => [0, 1, 2, 3, 4].map((t) => a + d * t)),
  exp: [[16, 1.5], [10, 2], [64, 1.25], [25, 1.2], [40, 1.5]].map(([a, q]) => [0, 1, 2, 3, 4].map((t) => sauber(a * q ** t))),
  beschraenkt: [[100, 80, 0.5], [1000, 625, 0.8], [20, -64, 0.75], [50, 40, 0.5]].map(([S, d, q]) => [0, 1, 2, 3, 4].map((t) => sauber(S - d * q ** t))),
  logistisch: [[100, 9, 1 / 3], [1000, 16, 0.25], [500, 49, 1 / 7], [300, 25, 0.2]].map(([S, a, q]) => [0, 1, 2, 3, 4].map((t) => rund(S / (1 + a * q ** t), 2))),
};
export const MODELL_OPTIONEN = [["linear", "Lineares Wachstum"], ["exp", "Exponentielles Wachstum"], ["beschraenkt", "Beschränktes Wachstum"], ["logistisch", "Logistisches Wachstum"]];
const liste = (xs, n = 2) => xs.map((x) => dk(x, n)).join("; ");
function dglModell(s, zufall) {
  const id = wahl(MODELL_OPTIONEN.map(([x]) => x), zufall);
  const f = wahl(MESSREIHEN[id], zufall);
  const d = differenzen(f), q = quotienten(f), dq = d.slice(1).map((x, i) => x / d[i]);
  const D = liste(d), Q = liste(q);
  const fehlerFuer = (w) => {
    if (w === id) return "";
    if (w === "linear") return `Die Differenzen sind nicht gleich (${D}). Linear hieße: in jedem Zeitschritt derselbe Zuwachs.`;
    if (w === "exp") return `Die Quotienten aufeinanderfolgender Werte sind nicht gleich (${Q}). Exponentiell hieße: in jedem Zeitschritt derselbe Faktor.`;
    if (w === "beschraenkt") return id === "logistisch" ? `Die Differenzen (${D}) werden erst größer und dann kleiner. Beim beschränkten Wachstum werden sie von Anfang an kleiner.`
      : `Beim beschränkten Wachstum schrumpfen die Differenzen um einen festen Faktor. Hier sind sie ${D}.`;
    return `Logistisch hieße: Die Differenzen wachsen erst und schrumpfen dann. Hier sind sie ${D}.`;
  };
  const weg = id === "linear" ? [`Differenzen: ${D} – alle gleich.`, "Gleicher Zuwachs in jedem Zeitschritt: lineares Wachstum, $f′$ ist konstant."]
    : id === "exp" ? [`Quotienten: ${Q} – alle gleich.`, "Gleicher Faktor in jedem Zeitschritt: exponentielles Wachstum, $f′ = k \\cdot f$."]
    : id === "beschraenkt" ? [`Differenzen: ${D} – jede ist das ${dk(dq[0], 2)}-Fache der vorigen.`, `Der Abstand zur Schranke schrumpft um einen festen Faktor: beschränktes Wachstum, $f′ = k \\cdot (S − f)$.`]
    : [`Differenzen: ${D} – erst größer, dann kleiner.`, `Quotienten: ${Q} – nicht gleich.`, "Langsam am Anfang, schnell in der Mitte, langsam am Ende: logistisches Wachstum mit Wendepunkt."];
  return auswahl("dgl", s, "modell", "Ein Bestand wurde in gleichen Zeitabständen gemessen (Werte gerundet). Welches Modell passt? Untersuche Differenzen und Quotienten aufeinanderfolgender Werte.",
    MODELL_OPTIONEN.map(([, n]) => n), MODELL_OPTIONEN.findIndex(([x]) => x === id), MODELL_OPTIONEN.map(([x]) => fehlerFuer(x)), weg, zufall,
    { tabelle: { t: [0, 1, 2, 3, 4], f }, modell: id });
}

/* Stufe 4: f(t) = S / (1 + b · e^(−ct)) gegeben – S und k ablesen (c = kS) */
function dglLogistischAblesen(s, zufall) {
  const S = wahl([100, 200, 500, 1000, 2000], zufall), b = wahl([4, 9, 19, 24, 49, 99], zufall), c = wahl([0.2, 0.4, 0.5, 0.8, 1], zufall);
  const k = sauber(c / S);
  const weg = [
    "f(t) = \\frac{S}{1 + \\left(\\frac{S}{f(0)} − 1\\right)e^{−kSt}} \\quad \\text{(allgemeine Lösung)}",
    `\\text{Vergleich: } S = ${zT(S)}, \\quad kS = ${zT(c)}`,
    `k = \\frac{${zT(c)}}{${zT(S)}} = ${zT(k)}`,
  ];
  const fallen = {
    S: [[sauber(S / (1 + b)), `Das ist f(0). S ist der Grenzwert für große t: Der Nenner geht gegen 1, also f(t) gegen ${zP(S)}.`],
      [b, "b ist der Faktor vor der e-Funktion im Nenner. S steht im Zähler – dem nähert sich f für große t."]],
    k: [[c, `Im Exponenten steht k · S, nicht k. Teile ${dk(c, 3)} noch durch S.`],
      [sauber(c * S), "Im Exponenten steht k · S. Also k = (Faktor im Exponenten) : S, nicht mal S."],
      [sauber(S / c), "Umgekehrt: k = (Faktor im Exponenten) : S."]],
  };
  return bau("dgl", s, "logistisch-ablesen",
    `Die Funktion $f(t) = \\frac{${zT(S)}}{1 + ${eT(b, -c)}}$ löst eine Differenzialgleichung der Form $f′(t) = k \\cdot f(t) \\cdot (S − f(t))$. Bestimme $S$ und $k$.`,
    [feld("S", "$S$", "wert"), feld("k", "$k$", "rate")], { S, k }, { S: ein(S), k: ein(k) }, fallen, weg, { modell: "logistisch", b, c });
}

/* Stufe 5: Infusion – DGL aufstellen, in die Form k · (S − f) bringen, Lösung angeben */
function dglInfusion(s, zufall) {
  const paare = [];
  for (const p of [2, 3, 4, 5, 6, 8]) for (const q of [0.1, 0.2, 0.25, 0.4, 0.5]) {
    const S = sauber(p / q);
    if (Number.isInteger(S * 2) && S <= 80 && S >= 8) paare.push([p, q, S]);
  }
  const [p, q, S] = wahl(paare, zufall);
  const f0 = wahl([0, 2, 5].filter((x) => x < S / 2), zufall);
  const a = sauber(S - f0);
  const weg = [
    `f′(t) = ${zT(p)} − ${zT(q)} \\cdot f(t) = ${zT(q)} \\cdot (${zT(S)} − f(t))`,
    `k = ${zT(q)}, \\quad S = \\frac{${zT(p)}}{${zT(q)}} = ${zT(S)}`,
    f0 === 0 ? `f(t) = ${zT(S)} − ${eT(a, -q)} \\quad \\text{(wegen } f(0) = 0\\text{)}` : `f(t) = ${zT(S)} − (${zT(S)} − ${zT(f0)})e^{${ex(-q)}} = ${zT(S)} − ${eT(a, -q)}`,
    `a = ${zT(a)}`,
  ];
  const fallen = {
    k: [[p, `${zP(p)} mg pro Stunde ist die Zufuhr. k ist der Faktor vor f(t) beim Abbau.`], [sauber(1 / q), "Der Abbau ist 0,… · f(t) – k ist genau dieser Faktor, nicht sein Kehrwert."]],
    S: [[p, `${zP(p)} ist die Zufuhr pro Stunde. Im Gleichgewicht gleichen sich Zufuhr und Abbau aus: ${dk(p, 3)} = ${dk(q, 3)} · S.`],
      [sauber(p * q), `Im Gleichgewicht gilt ${dk(p, 3)} = ${dk(q, 3)} · S, also S = ${dk(p, 3)} : ${dk(q, 3)} – geteilt, nicht multipliziert.`]],
    a: [...(f0 > 0 ? [[S, "a ist der Anfangsabstand S − f(0): Bei t = 0 muss f(0) herauskommen."], [f0, "Setze t = 0 ein: f(0) = S − a, also a = S − f(0)."], [sauber(S + f0), "a = S − f(0): Der Startwert wird abgezogen, nicht addiert."]] : []),
      [-a, "Mit f(t) = S − a · e^(−kt) gilt f(0) = S − a. Das Vorzeichen von a muss dazu passen."]],
  };
  return bau("dgl", s, "infusion",
    `Ein Patient erhält über eine Infusion gleichmäßig ${zP(p)} mg eines Wirkstoffs pro Stunde. Gleichzeitig baut der Körper pro Stunde $${zT(q)} \\cdot f(t)$ mg ab, wobei $f(t)$ die Menge im Blut ist ($t$ in Stunden). ${f0 === 0 ? "Zu Beginn ist kein Wirkstoff im Blut." : `Zu Beginn sind ${zP(f0)} mg im Blut.`} Stelle die DGL auf, bringe sie auf die Form $f′(t) = k \\cdot (S − f(t))$ und gib die Lösung als $f(t) = S − a \\cdot e^{−kt}$ an.`,
    [feld("k", "$k$", "rate"), feld("S", "$S$", "wert", "mg"), feld("a", "$a$", "wert", "mg")], { k: q, S, a }, { k: ein(q), S: `${ein(p)}/${ein(q)}`, a: ein(a) }, fallen, weg,
    { modell: "beschraenkt", p, q, f0 });
}

function dglAufgabe(s, zufall) {
  if (s === 1) return dglZuordnen(s, zufall);
  if (s === 2) return dglBeschraenktAblesen(s, zufall);
  if (s === 3) return dglModell(s, zufall);
  if (s === 4) return dglLogistischAblesen(s, zufall);
  return dglInfusion(s, zufall);
}

/* ======================= 2 · Parameter bestimmen ======================= */
const LG = "Rechne mit dem natürlichen Logarithmus ln, nicht mit lg.";
function parameterAufgabe(s, zufall) {
  if (s === 1 || (s === 2 && zufall(0, 1) === 0)) {
    /* Verdopplungs- bzw. Halbwertszeit → k */
    const K = EXP[wahl(s === 1 ? WACHSEN : ABNEHMEN, zufall)];
    const T = wahl(K.zeiten, zufall);
    const ab = !!K.ab, k = ab ? -Math.LN2 / T : Math.LN2 / T;
    const v = dkSig(k, 3);
    const weg = ab ? [
      `f(0) \\cdot e^{${zT(T)}k} = 0,5 \\cdot f(0)`,
      `e^{${zT(T)}k} = 0,5 \\;\\Rightarrow\\; ${zT(T)}k = \\ln 0,5 = −\\ln 2`,
      `k = −\\frac{\\ln 2}{${zT(T)}} ${gl(k, v)} ${v}`,
    ] : [
      `f(0) \\cdot e^{${zT(T)}k} = 2 \\cdot f(0)`,
      `e^{${zT(T)}k} = 2 \\;\\Rightarrow\\; ${zT(T)}k = \\ln 2`,
      `k = \\frac{\\ln 2}{${zT(T)}} ${gl(k, v)} ${v}`,
    ];
    const fallen = [
      [ab ? Math.LN2 / T : -Math.LN2 / T, ab ? "Bei einer Abnahme ist k negativ: e^(kT) = 0,5 und ln 0,5 = −ln 2." : "Bei Wachstum ist k positiv: e^(kT) = 2 und ln 2 > 0."],
      [(ab ? -1 : 1) / T, `Linear gedacht: Der Kehrwert der ${ab ? "Halbwertszeit" : "Verdopplungszeit"} reicht nicht. Aus e^(kT) = ${ab ? "0,5" : "2"} folgt k = ${ab ? "−" : ""}ln 2 : T.`],
      [(ab ? -0.5 : 0.5) / T, `Linear gerechnet. Löse e^(kT) = ${ab ? "0,5" : "2"} mit dem Logarithmus.`],
      [(ab ? -1 : 1) * T / Math.LN2, "Umgekehrt: k = ln 2 : T, nicht T : ln 2."],
      [(ab ? -1 : 1) * Math.log10(2) / T, LG],
    ];
    return bau("parameter", s, K.id, K.angabe(T), [feld("k", "$k$", "rate", EINH[K.e].pro)], { k }, { k: `${ab ? "-" : ""}ln(2)/${ein(T)}` }, { k: fallen }, weg, { T });
  }
  if (s === 2) {
    /* k gegeben → Verdopplungs- bzw. Halbwertszeit */
    const K = EXP[wahl([...WACHSEN, ...ABNEHMEN], zufall)];
    const k = wahl(K.ks, zufall), ab = k < 0, T = Math.LN2 / Math.abs(k), v = dk(T, 2), n = ab ? "T_H" : "T_D";
    const weg = ab ? [
      `e^{${zT(k)}${n}} = 0,5 \\;\\Rightarrow\\; ${zT(k)}${n} = \\ln 0,5 = −\\ln 2`,
      `${n} = \\frac{\\ln 2}{${zT(-k)}} ${gl(T, v)} ${v}`,
    ] : [
      `e^{${zT(k)}${n}} = 2 \\;\\Rightarrow\\; ${zT(k)}${n} = \\ln 2`,
      `${n} = \\frac{\\ln 2}{${zT(k)}} ${gl(T, v)} ${v}`,
    ];
    const fallen = [
      [1 / Math.abs(k), "Die Verdopplungs- bzw. Halbwertszeit ist nicht einfach 1 : k. Aus e^(kT) = 2 bzw. 0,5 folgt T = ln 2 : |k|."],
      [Math.LN2 * Math.abs(k), "Nach T auflösen heißt durch k teilen: T = ln 2 : |k|."],
      [Math.log10(2) / Math.abs(k), LG],
      [-T, "Eine Zeit ist positiv. Bei einer Abnahme sind k und ln 0,5 beide negativ – minus durch minus."],
    ];
    return bau("parameter", s, K.id, K.mitK(k), [feld("T", `$${n}$`, "zeit", EINH[K.e].kurz)], { T }, { T: `ln(2)/${ein(Math.abs(k))}` }, { T: fallen }, weg, { k });
  }
  if (s === 3) {
    /* Newton: S aus dem Kontext, k aus einer Messung */
    const S = wahl([18, 20, 22], zufall), f0 = wahl([80, 90, 95], zufall), t1 = wahl([5, 10], zufall), r = wahl([0.5, 0.6, 0.7, 0.8], zufall);
    const d0 = f0 - S, f1 = sauber(S + d0 * r), k = -Math.log(r) / t1, v = dkSig(k, 3);
    const weg = [
      `S = ${zT(S)} \\quad \\text{(Raumtemperatur)}`,
      `f(t) = ${zT(S)} + ${eT(d0, -1, "kt")}, \\quad f(${zT(t1)}) = ${zT(f1)}`,
      `${zT(S)} + ${zT(d0)}e^{−${zT(t1)}k} = ${zT(f1)} \\;\\Rightarrow\\; e^{−${zT(t1)}k} = \\frac{${zT(sauber(f1 - S))}}{${zT(d0)}} = ${zT(r)}`,
      `−${zT(t1)}k = \\ln ${zT(r)} \\;\\Rightarrow\\; k = −\\frac{\\ln ${zT(r)}}{${zT(t1)}} ${gl(k, v)} ${v}`,
    ];
    const fallen = {
      S: [[0, "Der Tee kühlt nicht auf 0 °C ab: Die Schranke S ist die Raumtemperatur."],
        [f0, "Das ist der Startwert f(0). S ist die Temperatur, der sich der Tee nähert – die des Raums."],
        [f1, "Das ist ein Messwert. S ist die Temperatur, der sich der Tee nähert – die des Raums."]],
      k: [[-Math.log(f1 / f0) / t1, "Exponentiell nimmt der Abstand zur Raumtemperatur ab. Rechne mit (f(t) − S) : (f(0) − S), nicht mit f(t) : f(0)."],
        [Math.log(r) / t1, `k ist positiv: ln ${dk(r, 3)} ist negativ, darum steht ein Minus davor.`],
        [(1 - r) / t1, "Linear geht es nicht: Die Abkühlung wird immer langsamer. Löse e^(−kt) = … mit dem Logarithmus."],
        [-Math.log10(r) / t1, LG],
        [(f0 - f1) / t1, "Das ist die mittlere Abkühlung in °C pro Minute. k ist der Faktor vor dem Abstand: f′ = k · (S − f)."]],
    };
    return bau("parameter", s, "tee",
      `Eine Tasse Tee wird mit ${zP(f0)} °C in einen Raum mit ${zP(S)} °C gestellt. Nach ${nach(t1, "min")} hat sie noch ${zP(f1)} °C. Die Temperatur $f(t)$ ($t$ in Minuten) folgt $f′(t) = k \\cdot (S − f(t))$. Bestimme $S$ und $k$.`,
      [feld("S", "$S$", "wert", "°C"), feld("k", "$k$", "rate", "pro Minute")], { S, k }, { S: ein(S), k: `-ln(${ein(r)})/${ein(t1)}` }, fallen, weg, { f0, t1, f1, r });
  }
  if (s === 4) {
    const variante = wahl(["anfang", "halb", "erreicht"], zufall);
    if (variante === "anfang") {
      const S = wahl([30, 40, 50, 60], zufall), f0 = wahl([0, 10], zufall), k = wahl([0.1, 0.2, 0.25, 0.4], zufall);
      const d = S - f0, r = sauber(k * d);
      const weg = [
        f0 === 0 ? `f′(0) = k \\cdot (${zT(S)} − f(0)) = ${zT(S)}k = ${zT(r)}` : `f′(0) = k \\cdot (${zT(S)} − ${zT(f0)}) = ${zT(d)}k = ${zT(r)}`,
        `k = \\frac{${zT(r)}}{${zT(d)}} = ${zT(k)}`,
      ];
      const fallen = [
        [r, "Das ist die Änderungsrate f′(0) selbst. k ist der Faktor: f′(0) = k · (S − f(0))."],
        [d / r, "Umgekehrt: k = f′(0) : (S − f(0))."],
        ...(f0 > 0 ? [[r / S, "Es zählt der Abstand zur Sättigung S − f(0), nicht S."]] : []),
      ];
      return bau("parameter", s, "infusion-anfang",
        `Bei einer Dauerinfusion nähert sich die Wirkstoffmenge $f(t)$ in mg dem Sättigungswert ${zP(S)} mg; es gilt $f′(t) = k \\cdot (${zT(S)} − f(t))$ ($t$ in Stunden). ${f0 === 0 ? "Zu Beginn ist kein Wirkstoff im Blut" : `Zu Beginn sind ${zP(f0)} mg im Blut`}, und die Menge steigt anfangs um ${zP(r)} mg pro Stunde. Bestimme $k$.`,
        [feld("k", "$k$", "rate", "pro Stunde")], { k }, { k: `${ein(r)}/${ein(d)}` }, { k: fallen }, weg, { S, f0, r });
    }
    if (variante === "halb") {
      const T = wahl([5, 6, 8, 10], zufall), S = wahl([20, 22], zufall), f0 = wahl([4, 6], zufall), k = Math.LN2 / T, v = dkSig(k, 3);
      const weg = [
        "S − f(t) = (S − f(0)) \\cdot e^{−kt}",
        `e^{−${zT(T)}k} = 0,5 \\;\\Rightarrow\\; −${zT(T)}k = \\ln 0,5 = −\\ln 2`,
        `k = \\frac{\\ln 2}{${zT(T)}} ${gl(k, v)} ${v}`,
      ];
      const fallen = [[1 / T, "Nicht 1 : T: Aus e^(−kT) = 0,5 folgt k = ln 2 : T."], [0.5 / T, "Linear gerechnet. Löse e^(−kT) = 0,5 mit dem Logarithmus."],
        [-k, "k ist positiv. Das Minus steckt schon in e^(−kt)."], [Math.log10(2) / T, LG]];
      return bau("parameter", s, "limo-halb",
        `Eine Flasche Limonade mit ${zP(f0)} °C erwärmt sich in einem Raum mit ${zP(S)} °C nach $f′(t) = k \\cdot (${zT(S)} − f(t))$ ($t$ in Minuten). Der Abstand zur Raumtemperatur halbiert sich ${alle(T, "min")}. Bestimme $k$.`,
        [feld("k", "$k$", "rate", "pro Minute")], { k }, { k: `ln(2)/${ein(T)}` }, { k: fallen }, weg, { T, S, f0 });
    }
    const S = wahl([30, 40, 50], zufall), p = wahl([0.5, 0.75, 0.8, 0.9], zufall), t1 = wahl([2, 3, 4], zufall);
    const B = sauber(S * p), rest = sauber(1 - p), k = -Math.log(rest) / t1, v = dkSig(k, 3);
    const weg = [
      `f(t) = ${zT(S)} − ${eT(S, -1, "kt")}`,
      `${zT(S)} − ${zT(S)}e^{−${zT(t1)}k} = ${zT(B)} \\;\\Rightarrow\\; e^{−${zT(t1)}k} = ${zT(rest)}`,
      `−${zT(t1)}k = ${lnKlein(rest, 1)}`,
      `k = \\frac{${lnT(verhaeltnis(1, rest))}}{${zT(t1)}} ${gl(k, v)} ${v}`,
    ];
    const fallen = [
      [-Math.log(p) / t1, `e^(−kt) ist der Anteil, der noch fehlt: 1 − ${dk(B, 3)} : ${dk(S, 3)} = ${dk(rest, 3)}, nicht ${dk(p, 3)}.`],
      [p / t1, "Linear geht es nicht: Die Menge steigt immer langsamer. Löse e^(−kt) = … mit dem Logarithmus."],
      [Math.log(rest) / t1, "k ist positiv: Der Logarithmus einer Zahl unter 1 ist negativ, darum das Minus."],
      [-Math.log10(rest) / t1, LG],
    ];
    return bau("parameter", s, "infusion-erreicht",
      `Bei einer Dauerinfusion nähert sich die Wirkstoffmenge $f(t)$ in mg dem Sättigungswert ${zP(S)} mg nach $f′(t) = k \\cdot (${zT(S)} − f(t))$ ($t$ in Stunden). Zu Beginn ist kein Wirkstoff im Blut, nach ${nach(t1, "h")} sind es ${zP(B)} mg. Bestimme $k$.`,
      [feld("k", "$k$", "rate", "pro Stunde")], { k }, { k: `-ln(${ein(rest)})/${ein(t1)}` }, { k: fallen }, weg, { S, t1, B });
  }
  /* Stufe 5: S und k aus Änderungsraten */
  if (zufall(0, 1) === 0) {
    const paare = [];
    for (const S of [40, 50, 60, 80, 100]) for (const k of [0.1, 0.2, 0.25, 0.5]) for (const a1 of [5, 10, 15, 20]) for (const a2 of [25, 30, 35]) {
      if (a2 < S - 5) paare.push([S, k, a1, a2]);
    }
    const [S, k, a1, a2] = wahl(paare, zufall);
    const r1 = sauber(k * (S - a1)), r2 = sauber(k * (S - a2)), da = a2 - a1;
    const weg = [
      `k \\cdot (S − ${zT(a1)}) = ${zT(r1)}, \\quad k \\cdot (S − ${zT(a2)}) = ${zT(r2)}`,
      `\\text{Subtrahieren: } ${zT(da)}k = ${zT(sauber(r1 - r2))} \\;\\Rightarrow\\; k = ${zT(k)}`,
      `S − ${zT(a1)} = \\frac{${zT(r1)}}{${zT(k)}} = ${zT(sauber(S - a1))} \\;\\Rightarrow\\; S = ${zT(S)}`,
    ];
    const fallen = {
      k: [[r1 / a1, "Das wäre exponentielles Wachstum f′ = k · f. Hier ist f′ proportional zum Abstand S − f – stelle zwei Gleichungen auf."],
        [-k, `Vorzeichen: Je mehr gelernt ist, desto kleiner die Rate. (S − ${zP(a1)}) − (S − ${zP(a2)}) = ${zP(da)}, also ${zP(da)}k = ${dk(r1, 3)} − ${dk(r2, 3)} > 0.`],
        [sauber(r1 - r2), `Die Differenz der Raten gehört noch durch die Differenz der Bestände geteilt: k = (${dk(r1, 3)} − ${dk(r2, 3)}) : ${zP(da)}.`]],
      S: [[sauber(a1 + r1), `Aus k · (S − ${zP(a1)}) = ${dk(r1, 3)} folgt S − ${zP(a1)} = ${dk(r1, 3)} : k – nicht ${dk(r1, 3)}.`],
        [sauber(r1 / k), `Das ist der Abstand S − ${zP(a1)}. S selbst ist um ${zP(a1)} größer.`]],
    };
    return bau("parameter", s, "vokabeln",
      `Beim Vokabellernen gilt für die Zahl $f(t)$ der gelernten Vokabeln ($t$ in Tagen) $f′(t) = k \\cdot (S − f(t))$. Bei ${zP(a1)} gelernten Vokabeln kommen ${zP(r1)} pro Tag dazu, bei ${zP(a2)} gelernten nur noch ${zP(r2)} pro Tag. Bestimme $k$ und die Schranke $S$.`,
      [feld("k", "$k$", "rate", "pro Tag"), feld("S", "$S$", "wert")], { k, S }, { k: ein(k), S: ein(S) }, fallen, weg, { a1, a2, r1, r2 });
  }
  const S = wahl([400, 500, 1000, 2000, 5000, 10000], zufall), kS = wahl([0.2, 0.4, 0.5, 0.8], zufall);
  const k = sauber(kS / S), W = S / 2, r = sauber((kS * S) / 4), WW = W * W;
  const weg = [
    `\\text{Wendepunkt bei } f = \\frac{S}{2} = ${zT(W)} \\;\\Rightarrow\\; S = ${zT(S)}`,
    `f′_{max} = k \\cdot ${zT(W)} \\cdot (${zT(S)} − ${zT(W)}) = ${zT(WW)}k = ${zT(r)}`,
    `k = \\frac{${zT(r)}}{${zT(WW)}} = ${zT(k)}`,
  ];
  const fallen = {
    S: [[W, "Am Wendepunkt ist f = S/2 – die Schranke ist doppelt so groß."]],
    k: [[r / (S * S), "f′max = k · S/2 · S/2 = kS²/4 – der Faktor 4 fehlt."],
      [(2 * r) / (S * S), "Am Wendepunkt ist auch S − f = S/2: f′max = k · S/2 · S/2."],
      [r / W, "f′ = k · f · (S − f): Beide Faktoren f und S − f gehören dazu."]],
  };
  return bau("parameter", s, "app-maximum",
    `Eine Lern-App verbreitet sich logistisch nach $f′(t) = k \\cdot f(t) \\cdot (S − f(t))$ ($t$ in Wochen). Am schnellsten wächst die Nutzerzahl bei ${zP(W)} Nutzern, nämlich um ${zP(r)} Nutzer pro Woche. Bestimme die Schranke $S$ und $k$.`,
    [feld("S", "$S$", "wert", "Nutzer"), feld("k", "$k$", "rate")], { S, k }, { S: ein(S), k: `${ein(r)}/${ein(WW)}` }, fallen, weg, { W, r });
}

/* ======================= 3 · Bestand und Zeitpunkt ======================= */
function bestandAufgabe(s, zufall) {
  if (s === 1 || s === 2) {
    const K = EXP[wahl([...WACHSEN, ...ABNEHMEN], zufall)];
    const k = wahl(K.ks, zufall), f0 = wahl(K.f0s, zufall);
    const fT = `f(t) = ${eT(f0, k)}`;
    if (s === 1) {
      const t1 = wahl(K.ts, zufall), kt = sauber(k * t1), w = f0 * Math.exp(kt), v = dk(w, 2);
      const weg = [`f(t) = f(0) \\cdot e^{kt} = ${eT(f0, k)}`, `f(${zT(t1)}) = ${zT(f0)}e^{${zT(k)} \\cdot ${zT(t1)}} = ${zT(f0)}${eZ(kt)} ${gl(w, v)} ${v}`];
      const fallen = [
        [f0 * Math.exp(k) * t1, "Die Zeit gehört in den Exponenten: f(t) = f(0) · e^(k · t), nicht e^k · t."],
        [f0 * (1 + k * t1), "Das ist lineares Wachstum mit der Anfangsrate. Die Änderungsrate k · f ändert sich mit dem Bestand – deshalb die e-Funktion."],
        [f0 * Math.exp(-kt), "Vorzeichen: Bei f′ = k · f steht im Exponenten dasselbe k, f(t) = f(0) · e^(kt)."],
        [Math.exp(kt), "Der Startwert fehlt: f(t) = f(0) · e^(kt)."],
        [f0 * (1 + k) ** t1, "Das ist ein Modell mit dem Faktor 1 + k pro Zeiteinheit. Die DGL f′ = k · f führt auf den Faktor e^k."],
        [k * f0 * Math.exp(kt), "Das ist die Änderungsrate f′(t), nicht der Bestand f(t)."],
      ];
      return bau("bestand", s, K.id, `${K.dgl(k, f0)} ${K.wert(t1)}`, [feld("f", `$f(${zT(t1)})$`, "wert", K.einheit)], { f: w },
        { f: `${ein(f0)}e^(${ein(kt)})` }, { f: fallen }, weg, { k, f0, t: t1 });
    }
    const m = wahl(K.faktoren, zufall), ab = k < 0, B = sauber(ab ? f0 / m : f0 * m), t = Math.log(B / f0) / k, v = dk(t, 2);
    const q = verhaeltnis(B, f0);
    const weg = [
      `${eT(f0, k)} = ${zT(B)}`,
      `e^{${ex(k)}} = ${q.tex}`,
      ab ? `${ex(k)} = ${lnKlein(B, f0)}` : `${ex(k)} = ${lnT(q)}`,
      `t = \\frac{${lnT(verhaeltnis(ab ? f0 : B, ab ? B : f0))}}{${zT(Math.abs(k))}} ${gl(t, v)} ${v}`,
    ];
    const fallen = [
      [(B / f0) / k, "Um t aus dem Exponenten zu holen, brauchst du den Logarithmus: e^(kt) = q ⇔ kt = ln q."],
      [Math.log(B) / k, "Teile zuerst durch den Startwert: e^(kt) = B : f(0). Erst dann logarithmieren."],
      [Math.log(B / f0) * k, "Nach t auflösen heißt durch k teilen: t = ln(…) : k."],
      [Math.log(Math.abs(B - f0)) / Math.abs(k), "f(0) ist ein Faktor: erst durch f(0) teilen, nicht f(0) abziehen."],
      [-t, "Eine Zeit ist positiv. Prüfe die Vorzeichen: ln einer Zahl unter 1 ist negativ, bei einer Abnahme ist auch k negativ."],
      [Math.log10(B / f0) / k, LG],
    ];
    return bau("bestand", s, K.id, `${K.dgl(k, f0)} ${K.zeit(B)}`, [feld("t", "$t$", "zeit", EINH[K.e].kurz)], { t },
      { t: `ln(${q.ein})/(${ein(k)})` }, { t: fallen }, weg, { k, f0, B, fT });
  }
  if (s === 3) {
    const K = BESCHR[wahl(["tee", "limo", "infusion"], zufall)];
    const S = wahl(K.Ss, zufall), f0 = wahl(K.f0s, zufall), k = wahl(K.ks, zufall), t1 = wahl(K.ts, zufall);
    const B = K.anteile ? sauber(S * wahl(K.anteile, zufall)) : wahl(K.Bs, zufall);
    const d0 = sauber(S - f0), kt = sauber(k * t1), w = S - d0 * Math.exp(-kt), vw = dk(w, 2);
    const t = Math.log((S - f0) / (S - B)) / k, vt = dk(t, 2);
    const fT = d0 > 0 ? `${zT(S)} − ${eT(d0, -k)}` : `${zT(S)} + ${eT(-d0, -k)}`;
    const q = verhaeltnis(Math.abs(S - B), Math.abs(d0));
    const weg = [
      `f(t) = S − (S − f(0)) \\cdot e^{−kt} = ${fT}`,
      `f(${zT(t1)}) = ${zT(S)} ${d0 > 0 ? "−" : "+"} ${zT(Math.abs(d0))}${eZ(-kt)} ${gl(w, vw)} ${vw}`,
      `${fT} = ${zT(B)} \\;\\Rightarrow\\; e^{${ex(-k)}} = ${q.tex}`,
      `${ex(-k)} = ${lnKlein(Math.abs(S - B), Math.abs(d0))}`,
      `t = \\frac{${lnT(verhaeltnis(Math.abs(d0), Math.abs(S - B)))}}{${zT(k)}} ${gl(t, vt)} ${vt}`,
    ];
    const fallen = {
      f: [[S - d0 * Math.exp(kt), "Im Exponenten steht −k · t: Der Abstand zu S wird kleiner, nicht größer."],
        [S * Math.exp(-kt), "Nicht S nimmt exponentiell ab, sondern der Abstand S − f(0)."],
        [f0 * Math.exp(-kt), `${K.id === "infusion" ? "Die Menge" : "Die Temperatur"} nähert sich nicht 0, sondern S. Exponentiell ändert sich nur der Abstand zur Schranke.`],
        [S - f0 * Math.exp(-kt), "In der Klammer steht der Anfangsabstand S − f(0), nicht f(0)."],
        [S + d0 * Math.exp(-kt), "Vorzeichen: f(t) = S − (S − f(0)) · e^(−kt). Prüfe mit t = 0, ob f(0) herauskommt."]],
      t: [[Math.abs(Math.log(f0 / B)) / k, "Erst die Schranke abziehen: Exponentiell ändert sich nur der Abstand zu S."],
        [-t, "Eine Zeit ist positiv: ln einer Zahl unter 1 ist negativ, darum das Minus."],
        [Math.abs((S - B) / (S - f0) - 1) / k, "Linear geht es nicht. Löse e^(−kt) = … mit dem Logarithmus."],
        [Math.log10((S - f0) / (S - B)) / k, LG]],
    };
    return bau("bestand", s, K.id, `${K.dgl(k, S, f0)} ${K.wert(t1)} ${K.zeit(B)}`,
      [feld("f", `$f(${zT(t1)})$`, "wert", K.einheit), feld("t", "$t$", "zeit", EINH[K.e].kurz)], { f: w, t },
      { f: `${ein(S)}-(${ein(d0)})e^(-${ein(kt)})`, t: `ln(${verhaeltnis(Math.abs(d0), Math.abs(S - B)).ein})/${ein(k)}` }, fallen, weg, { k, S, f0, t1, B });
  }
  const K = LOGIST[wahl(Object.keys(LOGIST), zufall)];
  const S = wahl(K.Ss, zufall), f0 = wahl(K.f0s.filter((x) => S % x === 0 && S / x > 4), zufall), kS = wahl(K.kSs, zufall);
  const k = sauber(kS / S), a = S / f0 - 1, p = { k, S, f0 };
  const fT = `f(t) = \\frac{${zT(S)}}{1 + ${eT(a, -kS)}}`;
  const kopf = [
    "f(t) = \\frac{S}{1 + \\left(\\frac{S}{f(0)} − 1\\right)e^{−kSt}}",
    `\\frac{S}{f(0)} − 1 = \\frac{${zT(S)}}{${zT(f0)}} − 1 = ${zT(a)}, \\quad kS = ${zT(k)} \\cdot ${zT(S)} = ${zT(kS)}`,
    fT,
  ];
  if (s === 4) {
    const t1 = wahl(K.ts, zufall), w = loesung("logistisch", p, t1), vw = dk(w, 1), tw = Math.log(a) / kS, vt = dk(tw, 2);
    const weg = [...kopf,
      `f(${zT(t1)}) = \\frac{${zT(S)}}{1 + ${zT(a)}${eZ(sauber(-kS * t1))}} ${gl(w, vw)} ${vw}`,
      `f(t_W) = \\frac{S}{2} \\;\\Rightarrow\\; ${eT(a, -kS, "t_W")} = 1`,
      `t_W = \\frac{\\ln ${zT(a)}}{${zT(kS)}} ${gl(tw, vt)} ${vt}`,
    ];
    const fallen = {
      f: [[S / (1 + a * Math.exp(-k * t1)), "Im Exponenten steht k · S · t, nicht k · t."],
        [S / (1 + a * Math.exp(kS * t1)), "Vorzeichen: Im Nenner steht e^(−kSt) – der Bestand wächst, der Nenner wird kleiner."],
        [f0 * Math.exp(kS * t1), "Das ist das exponentielle Anfangsverhalten f(0) · e^(kSt). Es überschätzt den Bestand, weil die Bremse S − f fehlt."]],
      tw: [[Math.log(a) / k, "Im Exponenten steht kS: t_W = ln(…) : (kS)."],
        [a / kS, "Um t aus dem Exponenten zu holen, brauchst du den Logarithmus: e^(kSt) = …"],
        [Math.log(S / 2) / kS, "Am Wendepunkt ist f = S/2, also 1 + b · e^(−kSt) = 2. Daraus folgt b · e^(−kSt) = 1."]],
    };
    return bau("bestand", s, K.id, `${K.dgl(k, S, f0)} ${K.wert(t1)} Wann wächst der Bestand am schnellsten (Wendestelle $t_W$)?`,
      [feld("f", `$f(${zT(t1)})$`, "anzahl", K.einheit), feld("tw", "$t_W$", "zeit", EINH[K.e].kurz)], { f: w, tw },
      { f: `${ein(S)}/(1+${ein(a)}e^(-${ein(sauber(kS * t1))}))`, tw: `ln(${ein(a)})/${ein(kS)}` }, fallen, weg, { k, S, f0, t: t1 });
  }
  /* Stufe 5 */
  if (zufall(0, 1) === 0) {
    const pr = wahl([0.9, 0.95, 0.99], zufall), q = Math.round(pr / (1 - pr)), t = Math.log(q * a) / kS, vt = dk(t, 2), r = maxRate(p), vr = dk(r, 2);
    const weg = [...kopf,
      `${fT.slice(7)} = ${zT(sauber(pr * S))} \\;\\Rightarrow\\; ${eT(a, -kS)} = \\frac{1}{${q}}`,
      `e^{${ex(-kS)}} = \\frac{1}{${zT(q * a)}} \\;\\Rightarrow\\; ${ex(-kS)} = −\\ln ${zT(q * a)}`,
      `t = \\frac{\\ln ${zT(q * a)}}{${zT(kS)}} ${gl(t, vt)} ${vt}`,
      `f′_{max} = k \\cdot \\frac{S}{2} \\cdot \\frac{S}{2} = \\frac{kS^2}{4} = ${vr}`,
    ];
    const fallen = {
      t: [[Math.log(a) / kS, `Das ist die Wendestelle (halbe Schranke). Gesucht ist der Zeitpunkt für ${dk(pr * 100, 0)} %.`],
        [Math.log(q * a) / k, "Im Exponenten steht kS: t = ln(…) : (kS)."],
        [Math.log(a / q) / kS, `Bei ${dk(pr * 100, 0)} % ist der Nenner 1 : ${dk(pr, 2)}, also b · e^(−kSt) = 1 : ${q} – nicht ${q}.`]],
      r: [[(k * S * S) / 2, "Am Wendepunkt ist f = S/2 und S − f = S/2: f′max = k · S/2 · S/2 = kS²/4."],
        [k * S * S, "Setze f = S/2 ein: f′max = k · S/2 · (S − S/2) = kS²/4."],
        [k * (S / 2), "f′ = k · f · (S − f): Beide Faktoren f und S − f gehören dazu."]],
    };
    return bau("bestand", s, K.id, `${K.dgl(k, S, f0)} Nach welcher Zeit $t$ ist der Bestand auf ${dk(pr * 100, 0)} % der Schranke gewachsen? Wie groß ist die größte Änderungsrate $f′_{max}$?`,
      [feld("t", "$t$", "zeit", EINH[K.e].kurz), feld("r", "$f′_{max}$", "wert", EINH[K.e].pro)], { t, r },
      { t: `ln(${q * a})/${ein(kS)}`, r: `${ein(k)}*${S}^2/4` }, fallen, weg, { k, S, f0, anteil: pr });
  }
  /* Tee: bei welcher Temperatur kühlt er nur noch um r °C pro Minute ab – und wann? */
  const paare = [];
  for (const k2 of [0.05, 0.1, 0.2]) for (const r of [0.5, 1, 2]) {
    const d = sauber(r / k2);
    if (d >= 4 && d <= 40) paare.push([k2, r, d]);
  }
  const [kk, r, d] = wahl(paare, zufall);
  const S2 = wahl([20, 22], zufall), f02 = wahl([80, 90, 95], zufall), d0 = f02 - S2, T = sauber(S2 + d), t = Math.log(d0 / d) / kk, vt = dk(t, 2);
  const q = verhaeltnis(d0, d);
  const weg = [
    `f′(t) = ${zT(kk)} \\cdot (${zT(S2)} − f(t)) = −${zT(r)}`,
    `${zT(S2)} − f(t) = −${zT(d)} \\;\\Rightarrow\\; f(t) = ${zT(T)}`,
    `${zT(S2)} + ${eT(d0, -kk)} = ${zT(T)} \\;\\Rightarrow\\; e^{${ex(-kk)}} = ${verhaeltnis(d, d0).tex}`,
    `${ex(-kk)} = ${lnKlein(d, d0)}`,
    `t = \\frac{${lnT(q)}}{${zT(kk)}} ${gl(t, vt)} ${vt}`,
  ];
  const fallen = {
    T: [[d, `Das ist der Abstand zur Raumtemperatur. Die Temperatur selbst ist um ${zP(S2)} °C höher.`],
      [sauber(S2 - d), "Der Tee ist wärmer als der Raum: f(t) = S + Abstand, nicht S − Abstand."],
      [sauber(S2 + r), "Die Rate ist k mal der Abstand: Abstand = Rate : k, nicht die Rate selbst."]],
    t: [[Math.log(f02 / T) / kk, "Exponentiell ändert sich nur der Abstand zur Raumtemperatur: (T − S) : (f(0) − S)."],
      [-t, "Eine Zeit ist positiv: ln einer Zahl unter 1 ist negativ."]],
  };
  return bau("bestand", s, "tee-rate",
    `Eine Tasse Tee mit ${zP(f02)} °C steht in einem Raum mit ${zP(S2)} °C. Ihre Temperatur $f(t)$ in °C ($t$ in Minuten) erfüllt $f′(t) = ${zT(kk)} \\cdot (${zT(S2)} − f(t))$. Bei welcher Temperatur kühlt der Tee nur noch um ${zP(r)} °C pro Minute ab – und wann ist das?`,
    [feld("T", "Temperatur", "wert", "°C"), feld("t", "$t$", "zeit", "min")], { T, t }, { T: ein(T), t: `ln(${q.ein})/${ein(kk)}` }, fallen, weg,
    { k: kk, S: S2, f0: f02, r });
}

/* ======================= 4 · Euler-Verfahren ======================= */
const r4 = (x) => dk(x, 4);
/* f′ an einer Stelle mit eingesetztem Wert, als TeX: „0,2 \cdot (50 − 10)“ */
const einsetzen = (m, { k, S }, f) => (m === "exp" ? `${zT(k)} \\cdot ${r4(f)}`
  : m === "beschraenkt" ? `${zT(k)} \\cdot (${zT(S)} − ${r4(f)})` : `${zT(k)} \\cdot ${r4(f)} \\cdot (${zT(S)} − ${r4(f)})`);
function eulerAufgabe(s, zufall) {
  let m, p, dt, n;
  if (s === 1) { m = "exp"; p = { k: wahl([0.1, 0.2, 0.25, 0.5, -0.1, -0.2, -0.25], zufall), f0: wahl([40, 80, 100, 200, 400], zufall) }; dt = 1; n = 2; }
  else if (s === 2 || (s === 4 && zufall(0, 1) === 0)) {
    const S = wahl([10, 20, 50, 100], zufall);
    m = "beschraenkt"; p = { S, k: wahl([0.1, 0.2, 0.4, 0.5], zufall), f0: sauber(S * wahl([0.1, 0.2, 0.5], zufall)) };   // nie f(0) = 0: sonst stünde „10 − 0“ im Rechenweg
    dt = s === 4 ? 0.5 : wahl([0.5, 1], zufall); n = s === 4 ? 3 : 2;
  } else if (s === 4) { m = "exp"; p = { k: wahl([0.2, 0.4, -0.2, -0.4], zufall), f0: wahl([50, 100, 200], zufall) }; dt = 0.5; n = 3; }
  else {
    const S = wahl([100, 500, 1000], zufall), kS = wahl([0.2, 0.4, 0.5], zufall);
    m = "logistisch"; p = { S, k: sauber(kS / S), f0: sauber(S * wahl([0.05, 0.1, 0.2], zufall)) };
    dt = s === 5 ? wahl([0.5, 1], zufall) : 1; n = s === 5 ? 3 : 2;
  }
  const w = euler(m, p, dt, n), ts = w.map((_, i) => sauber(i * dt));
  const mitExakt = s >= 4, T = ts[n], ex0 = loesung(m, p, T);
  const felderListe = ts.slice(1).map((t, i) => feld(`f${i + 1}`, `$f(${zT(t)})$`, "euler", "", "≈"));
  if (mitExakt) felderListe.push(feld("ex", `$f(${zT(T)})$ exakt`, "wert"));
  const soll = Object.fromEntries(ts.slice(1).map((_, i) => [`f${i + 1}`, w[i + 1]]));
  if (mitExakt) soll.ex = ex0;
  const exaktTex = m === "exp" ? `${zT(p.f0)}${eZ(sauber(p.k * T))}`
    : m === "beschraenkt" ? (p.S === p.f0 ? zT(p.S) : `${zT(p.S)} − ${zT(sauber(p.S - p.f0))}${eZ(sauber(-p.k * T))}`)
    : `\\frac{${zT(p.S)}}{1 + ${zT(sauber(p.S / p.f0 - 1))}${eZ(sauber(-p.k * p.S * T))}}`;
  const exaktEin = m === "exp" ? `${ein(p.f0)}e^(${ein(sauber(p.k * T))})`
    : m === "beschraenkt" ? `${ein(p.S)}-${ein(sauber(p.S - p.f0))}e^(${ein(sauber(-p.k * T))})`
    : `${ein(p.S)}/(1+${ein(sauber(p.S / p.f0 - 1))}e^(${ein(sauber(-p.k * p.S * T))}))`;
  /* m_i = Steigung, die die DGL im Punkt (t_i | f_i) vorschreibt; Zwischenwerte auf vier Stellen */
  const genau = (x) => Math.abs(rund(x, 4) - x) < 1e-9;
  const weg = [`f(t + Δt) ≈ f(t) + Δt \\cdot m, \\quad m = \\text{Steigung aus der DGL}`];
  for (let i = 0; i < n; i++) {
    const g = rate(m, p, w[i]), gs = r4(g), ns = r4(w[i + 1]);
    weg.push(`m_{${i}} = ${einsetzen(m, p, w[i])} ${genau(w[i]) && genau(g) ? "=" : "≈"} ${gs}`);
    const zuwachs = dt === 1 ? (g < 0 ? `− ${r4(-g)}` : `+ ${gs}`)
      : Math.abs(g) === 1 ? `${g < 0 ? "−" : "+"} ${zT(dt)}`                 // Δt · 1 = Δt (A5: kein „· 1“)
      : `+ ${zT(dt)} \\cdot ${g < 0 ? `(${gs})` : gs}`;
    weg.push(`f(${zT(ts[i + 1])}) ≈ ${r4(w[i])} ${zuwachs} ${genau(w[i]) && genau(g) && genau(w[i + 1]) ? "=" : "≈"} ${ns}`);
  }
  const zusammen = ts.slice(1).map((t, i) => `f(${zT(t)}) ≈ ${ANZEIGE.euler(w[i + 1])}`).join(", \\quad ");
  weg.push(zusammen);
  if (mitExakt) weg.push(`\\text{exakt: } f(${zT(T)}) = ${exaktTex} ${gl(ex0, dk(ex0, 2))} ${dk(ex0, 2)}`);
  /* typische Fehler je Schritt */
  const g0 = rate(m, p, p.f0);
  const fallen = { f1: [[p.f0 + dt * -g0, "Vorzeichen: Euler geht in Richtung der Steigung – neuer Wert = alter Wert + Δt · f′."],
    [dt * g0, "Der alte Wert fehlt: f(t + Δt) ≈ f(t) + Δt · f′(t)."],
    [loesung(m, p, dt), "Das ist der exakte Wert der Lösung. Gefragt ist die Euler-Näherung entlang der Tangente."],
    ...(dt !== 1 ? [[p.f0 + g0, "Die Schrittweite fehlt: Der Zuwachs ist Δt · f′, hier mit Δt = 0,5."]] : [])] };
  for (let i = 2; i <= n; i++) {
    fallen[`f${i}`] = [[p.f0 + i * dt * g0, "Die Steigung muss in jedem Schritt neu aus dem aktuellen Wert berechnet werden – nicht immer die vom Start."],
      [loesung(m, p, i * dt), "Das ist der exakte Wert der Lösung. Gefragt ist die Euler-Näherung."],
      ...(dt !== 1 ? [[w[i - 1] + rate(m, p, w[i - 1]), "Die Schrittweite fehlt: Der Zuwachs ist Δt · f′, hier mit Δt = 0,5."]] : [])];
  }
  if (mitExakt) fallen.ex = [[w[n], "Das ist die Euler-Näherung. Exakt rechnest du mit der Lösungsformel der DGL."]];
  const ziele = ts.slice(1).map((t) => `$f(${zT(t)})$`);
  const zielText = ziele.length === 2 ? `${ziele[0]} und ${ziele[1]}` : `${ziele.slice(0, -1).join(", ")} und ${ziele.at(-1)}`;
  const text = `Gegeben ist die Differenzialgleichung $${dglTex(m, p)}$ mit $f(0) = ${zT(p.f0)}$. Berechne mit dem Euler-Verfahren und der Schrittweite $Δt = ${zT(dt)}$ Näherungswerte für ${zielText}.${mitExakt ? ` Vergleiche mit dem exakten Wert $f(${zT(T)})$ der Lösung.` : ""}`;
  const exakt = Object.fromEntries(ts.slice(1).map((_, i) => [`f${i + 1}`, ein(w[i + 1])]));
  if (mitExakt) exakt.ex = exaktEin;
  return bau("euler", s, m, text, felderListe, soll, exakt, fallen, weg, { schritt: { m, p, dt }, modell: m, p, dt });
}

export function aufgabe(art, stufe, zufall = zz) {
  const s = stufeIn(stufe);
  if (art === "parameter") return parameterAufgabe(s, zufall);
  if (art === "bestand") return bestandAufgabe(s, zufall);
  if (art === "euler") return eulerAufgabe(s, zufall);
  return dglAufgabe(s, zufall);
}

export const felder = (a) => a.felder;
export const auftrag = (a) => a.text;
export const rechenweg = (a) => a.weg;

/* Prüfen: Auswahl → Index; sonst { feld: Text } → { ok, felder: { feld: bool }, grund }.
   Euler: Ein Wert gilt auch, wenn er aus dem (richtig gerundeten) eigenen Vorwert korrekt weitergerechnet ist. */
export function pruefe(a, eingabe = {}) {
  if (a.mc) {
    const i = Number(eingabe);
    return i === a.richtig ? { ok: true, grund: "" } : { ok: false, grund: a.fehler[i] || tipp(a) };
  }
  const ergebnis = {}, ist = {};
  let vor = a.schritt ? a.schritt.p.f0 : null, vorOk = true;
  for (const [k, , typ] of a.felder) {
    ist[k] = liesWert(eingabe[k]);
    let ok = trifft(ist[k], a.soll[k], typ);
    if (!ok && typ === "euler" && vorOk && ist[k] !== null) ok = trifft(ist[k], eulerSchritt(a.schritt.m, a.schritt.p, vor, a.schritt.dt), "euler");
    ergebnis[k] = ok;
    if (typ === "euler") { vorOk = ok; vor = ist[k]; }
  }
  const ok = Object.values(ergebnis).every(Boolean);
  return { ok, felder: ergebnis, grund: ok ? "" : grundFuer(a, eingabe, ist, ergebnis) };
}

const FAST = {
  wert: "Fast – runde genauer: zwei Nachkommastellen, oder gib den exakten Term ein.",
  zeit: "Fast – runde genauer: zwei Nachkommastellen, oder gib den exakten Term ein.",
  rate: "Fast – runde genauer: drei gültige Ziffern, oder gib den exakten Term ein.",
  anzahl: "Fast – rechne genauer, zum Beispiel mit dem exakten Term.",
  euler: "Fast – rechne mit mehr Nachkommastellen weiter und runde erst das Ergebnis auf zwei Stellen.",
};
function grundFuer(a, eingabe, ist, erg) {
  const [k, , typ] = a.felder.find(([x]) => !erg[x]);
  if (!String(eingabe[k] ?? "").trim()) return "Fülle alle Felder aus.";
  const v = ist[k], soll = a.soll[k];
  if (v === null) return "Gib eine Zahl oder einen Term ohne Variable ein – exakt wie ln(2)/3 oder gerundet wie 0,231.";
  for (const [w, text] of a.fallen[k] || []) if (Number.isFinite(w) && Math.abs(v - w) <= TOLERANZ[typ](w)) return text;
  if (Math.abs(v - soll) <= TOLERANZ[typ](soll) * 10) return FAST[typ];
  if (Math.abs(soll) > 1e-9 && Math.abs(v + soll) <= TOLERANZ[typ](soll)) return "Der Betrag stimmt, das Vorzeichen nicht. Prüfe, ob der Bestand wächst oder abnimmt.";
  return tipp(a);
}

export function tipp(a) {
  if (a.art === "dgl") {
    if (a.kontext === "zuordnen") return "Setze ein: Stimmt f(0) mit dem Anfangswert überein, und ist f′(t) wirklich k · f(t)?";
    if (a.kontext === "modell") return "Bilde Differenzen und Quotienten aufeinanderfolgender Werte und vergleiche sie.";
    return "Einsetzen: f′(t) ausrechnen und mit der rechten Seite vergleichen. Beschränkt: f(t) = S − (S − f(0)) · e^(−kt). Logistisch: Im Exponenten steht k · S.";
  }
  if (a.art === "parameter") return "Schreibe die Angabe als Gleichung und löse mit ln nach k auf: Verdopplung e^(kT) = 2, Halbierung e^(kT) = 0,5. Beim beschränkten Wachstum zählt der Abstand S − f.";
  if (a.art === "bestand") return "Lösungsformel aufstellen, dann einsetzen oder nach t auflösen: e-Term allein stellen, logarithmieren, durch den Faktor vor t teilen.";
  return "Euler: neuer Wert = alter Wert + Δt · Steigung. Die Steigung liefert die DGL aus dem alten Wert – in jedem Schritt neu.";
}

/* ---------- GFS: Gliederung, Tipps, Kolloquium ---------- */
export const GLIEDERUNG = [
  { min: 2, titel: "Einstieg: eine Tasse Tee", text: "Stell eine Tasse heißen Tee aufs Pult und frag: Wie warm ist er in zehn Minuten? Eine Formel kennt niemand – aber jeder ahnt eine Regel: Je heißer er im Vergleich zum Raum ist, desto schneller kühlt er ab. Diese Regel ist eine Differenzialgleichung. Schreib die Leitfrage an." },
  { min: 4, titel: "Was eine DGL ist – exponentielles Wachstum", text: "Definition: eine Gleichung zwischen f und f′. An der Tafel durch Einsetzen prüfen, dass 3e^(0,5t) die DGL f′ = 0,5 · f löst und t² + 3 nicht. Dann f(t) = f(0) · e^(kt) mit Verdopplungszeit ln 2 : k. Für Profis: der Beweis mit h(t) = f(t) · e^(−kt), dass es keine anderen Lösungen gibt." },
  { min: 3, titel: "Beschränktes Wachstum", text: "Newton beim Tee: f′ = k · (S − f). Der Abstand d = S − f erfüllt d′ = −k · d, also wieder exponentiell. Lösung an der Tafel, dann das Zahlenbeispiel: nach zehn Minuten rund 45,75 °C. Kurz die Infusion: Sättigung S = Zufuhr : Abbaurate." },
  { min: 4, titel: "Logistisches Wachstum", text: "Das Gerücht an der Schule: f′ = k · f · (S − f), anfangs fast exponentiell, am Ende fast beschränkt. Die Lösungsformel nennen und den Trick mit g = 1/f zeigen. Höhepunkt: der Wendepunkt bei S/2, begründet über die Parabel f′ in Abhängigkeit von f, mit dem Beispiel 9,19 Tage und 125 pro Tag." },
  { min: 4, titel: "Richtungsfeld, Euler, Grenzen", text: "Das Richtungsfeld im Labor zeigen. Zwei Euler-Schritte an der Tafel, dann die Tabelle: Mit kleinerem Δt nähert sich der Wert 7,06. An Messwerten zeigen, wie Differenzen und Quotienten das Modell verraten, und die Grenzen nennen. Fazit in einem Satz beantwortet die Leitfrage." },
];

export const TIPPS = [
  "Bring ein Thermometer und eine Tasse heißes Wasser mit und lies alle zwei Minuten ab. Mit eigenen Messwerten kannst du am Ende Differenzen bilden und zeigen, dass der Abstand zur Raumtemperatur ungefähr um einen festen Faktor schrumpft.",
  "Rechne an der Tafel genau eine Probe vollständig durch – am besten die beim beschränkten Wachstum. Die Probe der logistischen Lösung gehört aufs Handout; im Vortrag reicht der Wendepunkt mit der Begründung über die Parabel.",
  "Aufs Handout gehören die drei DGLs mit ihren Lösungen, je ein Zahlenbeispiel, die Euler-Formel f(t + Δt) ≈ f(t) + Δt · f′(t) und die Tabelle, wie man an Messwerten das passende Modell erkennt.",
];

export const KOLLOQUIUM = [
  { stufe: "Basis", frage: "Was ist eine Differenzialgleichung, und was ist ihre Lösung?",
    antwort: "Eine Differenzialgleichung verknüpft eine Funktion mit ihrer Ableitung, zum Beispiel f′(t) = 0,5 · f(t). Eine Lösung ist eine Funktion, die die Gleichung für alle t erfüllt – hier etwa f(t) = 3e^(0,5t), denn f′(t) = 1,5e^(0,5t) = 0,5 · f(t). Die Unbekannte ist also keine Zahl, sondern eine ganze Funktion." },
  { stufe: "Basis", frage: "Wie prüfst du, ob eine Funktion eine DGL löst?",
    antwort: "Ich leite die Funktion ab und setze sie in beide Seiten ein. Stimmen beide Seiten für alle t überein, ist sie eine Lösung. Für f(t) = 80 − 50e^(−0,3t) ist f′(t) = 15e^(−0,3t) und 0,3 · (80 − f(t)) = 0,3 · 50e^(−0,3t) = 15e^(−0,3t). Also löst sie f′ = 0,3 · (80 − f)." },
  { stufe: "Basis", frage: "Woran erkennst du an der DGL, welches Wachstum sie beschreibt?",
    antwort: "An der rechten Seite. Ist die Änderungsrate proportional zum Bestand, k · f, ist das Wachstum exponentiell. Ist sie proportional zum Abstand zur Schranke, k · (S − f), ist es beschränkt – die Schranke wird nie ganz erreicht. Ist sie proportional zu beidem, k · f · (S − f), ist es logistisch: anfangs fast exponentiell, am Ende fast beschränkt." },
  { stufe: "Basis", frage: "Warum braucht man neben der DGL noch einen Anfangswert?",
    antwort: "Die DGL sagt nur, wie sich der Bestand ändert, nicht, wo er startet. f′ = k · f wird von jeder Funktion c · e^(kt) gelöst. Erst der Anfangswert legt c = f(0) fest. Im Richtungsfeld heißt das: Jeder Startpunkt liefert eine eigene Lösungskurve." },
  { stufe: "Vertiefung", frage: "Warum ist die Verdopplungszeit beim exponentiellen Wachstum immer gleich?",
    antwort: "Es gilt f(t + T) = f(0) · e^(k(t + T)) = f(t) · e^(kT). Der Faktor e^(kT) hängt nicht von t ab; er ist 2 für T = ln 2 : k – egal, wann man startet. Bei k = ln 2 : 3 ≈ 0,231 pro Stunde verdoppelt sich ein Bestand also alle drei Stunden, am Anfang wie später." },
  { stufe: "Vertiefung", frage: "Wo liegt beim logistischen Wachstum der Wendepunkt, und warum?",
    antwort: "Bei f = S/2. Die Änderungsrate k · f · (S − f) ist als Funktion von f eine nach unten geöffnete Parabel mit den Nullstellen 0 und S; ihr Scheitel liegt in der Mitte. Formal: f″ = k · f′ · (S − 2f) wechselt dort das Vorzeichen, weil f′ > 0 ist. Die größte Änderungsrate ist kS²/4." },
  { stufe: "Vertiefung", frage: "Was zeigt ein Richtungsfeld?",
    antwort: "An jedem Punkt (t | y) ein kurzes Strichstück mit der Steigung, die die DGL dort vorschreibt. Eine Lösungskurve verläuft überall tangential zu diesen Strichen. Bei den drei Wachstumsmodellen hängt die Steigung nur von y ab, deshalb sind alle Striche in einer waagrechten Reihe gleich – und jede Lösung ist eine verschobene Kopie einer anderen." },
  { stufe: "Vertiefung", frage: "Wie funktioniert das Euler-Verfahren, und wie wird es genauer?",
    antwort: "Man geht vom Startwert einen kleinen Schritt Δt entlang der Tangente: f(t + Δt) ≈ f(t) + Δt · f′(t), wobei f′(t) aus der DGL kommt, und wiederholt das. Mit kleinerem Δt wird es genauer, der Fehler ist ungefähr proportional zu Δt. Bei f′ = 0,5 · (10 − f) mit f(0) = 2 liefert Δt = 1 für f(2) den Wert 8, Δt = 0,25 schon 7,25 – exakt sind es 7,06." },
  { stufe: "Vertiefung", frage: "Wie erkennst du an Messwerten, welches Modell passt?",
    antwort: "Bei gleichen Zeitabständen: Sind die Differenzen gleich, ist es linear. Sind die Quotienten gleich, exponentiell. Schrumpfen die Differenzen um einen festen Faktor, ist es beschränkt. Werden die Differenzen erst größer und dann kleiner, passt logistisches Wachstum. Echte Messwerte schwanken, deshalb gilt das immer nur ungefähr." },
  { stufe: "Profi", frage: "Woher weißt du, dass f(0) · e^(kt) die einzige Lösung von f′ = k · f ist?",
    antwort: "Ist g irgendeine Lösung, betrachte ich h(t) = g(t) · e^(−kt). Mit der Produktregel ist h′(t) = (g′(t) − k · g(t)) · e^(−kt) = 0, weil g′ = k · g gilt. Eine Funktion mit Ableitung 0 auf einem Intervall ist konstant, also h(t) = h(0) = g(0). Daraus folgt g(t) = g(0) · e^(kt)." },
  { stufe: "Profi", frage: "Wie kommt man auf die Lösung der logistischen DGL?",
    antwort: "Mit dem Kehrwert g = 1/f, solange f > 0 ist. Dann ist g′ = −f′/f² = −k · (S − f)/f = k − kS · g = kS · (1/S − g). Das ist beschränktes Wachstum mit der Schranke 1/S und der Konstanten kS. Dessen Lösung kenne ich; der Kehrwert ergibt f(t) = S/(1 + (S/f(0) − 1) · e^(−kSt)). Einsetzen bestätigt das Ergebnis." },
  { stufe: "Profi", frage: "Wo stoßen die Modelle an ihre Grenzen?",
    antwort: "Exponentielles Wachstum kann nicht ewig dauern, irgendwann werden Platz oder Nahrung knapp. Die Schranke S ist in der Praxis oft unbekannt und muss geschätzt werden. Die Konstanten bleiben nicht immer gleich, etwa wenn sich die Raumtemperatur ändert. Und Bestände wie Schüler oder Tiere sind ganzzahlig – das stetige Modell ist nur eine Näherung." },
];
