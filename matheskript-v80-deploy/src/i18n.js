/* ======================================================================
   SPRACHE: Deutsch (Original) oder Englisch.
   Die App ist auf Deutsch geschrieben. Im englischen Modus wird das
   Wörterbuch src/i18n/en.json nachgeladen und jeder sichtbare Text im
   Dokument übersetzt – exakt über das Wörterbuch oder über Muster mit
   Platzhaltern ({0}, {1} …) für zusammengesetzte Texte.
   Elemente mit dem Attribut data-kein-i18n werden nicht angefasst.
   ====================================================================== */

const SPEICHER = "mm-sprache";
let lang = "de";
try { lang = localStorage.getItem(SPEICHER) === "en" ? "en" : "de"; } catch (e) { /* privat */ }
try { const p = new URLSearchParams(window.location.search).get("lang"); if (p === "en" || p === "de") lang = p; } catch (e) { /* egal */ }

export const sprache = () => lang;
export const englisch = () => lang === "en";

let EXAKT = null;      // Map deutsch -> englisch
let MUSTER = [];       // [{ re, en }]
const CACHE = new Map();
const FEHLT = new Set();   // zur Kontrolle: window.__i18nFehlt
try { window.__i18nFehlt = FEHLT; } catch (e) { /* egal */ }

const norm = (s) => s.replace(/\s+/g, " ").trim();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function musterBauen(liste) {
  return liste
    .map(([de, en]) => {
      const teile = de.split(/(\{\d+\})/);
      const nummern = [];
      const quelle = teile.map((t) => {
        const m = t.match(/^\{(\d+)\}$/);
        if (m) { nummern.push(Number(m[1])); return "(.+?)"; }
        return esc(t);
      }).join("");
      let re;
      try { re = new RegExp("^" + quelle + "$", "s"); } catch (e) { return null; }
      return { re, en, nummern, literal: de.replace(/\{\d+\}/g, "").length };
    })
    .filter(Boolean)
    .sort((a, b) => b.literal - a.literal);
}

/* Ergänzungen, die im Wörterbuch fehlen */
const ZUSATZ = {
  "Bald verfügbar": "Coming soon",
  "Foto vom Blatt – Mathilda prüft deinen Weg.": "Snap your worksheet – Mathilda checks your work.",
  "sichtbar": "visible",
  "Eingabe einklappen": "Collapse input",
  "Extrempunkte:": "Extreme points:",
  "Wendepunkte:": "Inflection points:",
  "§ 1 Anbieter und Geltungsbereich": "§ 1 Provider and scope",
  "§ 2 Vertragspartner und Schüler": "§ 2 Contracting parties and students",
  "§ 3 Leistungsumfang": "§ 3 Scope of services",
  "§ 4 Bestellung und Vertragsschluss": "§ 4 Ordering and conclusion of contract",
  "§ 5 Preise und Zahlung": "§ 5 Prices and payment",
  "§ 6 Digitale Materialien und technische Voraussetzungen": "§ 6 Digital materials and technical requirements",
  "§ 7 Live-Termine und Ausfälle": "§ 7 Live sessions and cancellations",
  "§ 8 Kundenkonto und Sicherheit": "§ 8 Customer account and security",
  "§ 9 Nutzungsrechte und Uploads": "§ 9 Usage rights and uploads",
  "§ 10 Kostenlose KI-Funktionen": "§ 10 Free AI features",
  "§ 11 Vertragsende": "§ 11 End of contract",
  "§ 12 Widerruf und gesetzliche Rechte": "§ 12 Withdrawal and statutory rights",
  "§ 13 Haftung": "§ 13 Liability",
  "§ 14 Anwendbares Recht": "§ 14 Applicable law",
  "§ 15 Verbraucherschlichtung": "§ 15 Consumer dispute resolution",
  "Zähler verringern": "Decrease counter",
  "[Straße und Hausnummer], [PLZ und Ort], Deutschland": "[Street and number], [Postcode and city], Germany",
  "SONNTAG, 1. NOVEMBER 2026": "SUNDAY, NOVEMBER 1, 2026",
  "Evelyn's Café in Dingelsdorf": "Evelyn's Café in Dingelsdorf",
  "BEGRÜNDEN": "JUSTIFY",
  "ZEIGEN": "SHOW",
  "1 · Verstehen": "1 · Understand",
  "a verringern": "Decrease a", "b verringern": "Decrease b", "c verringern": "Decrease c",
  "d verringern": "Decrease d", "e verringern": "Decrease e", "verringern": "decrease",
  "gesichert": "mastered", "offen": "open", "neu": "new", "krank": "ill", "gesund": "healthy",
  "hoch": "power", "plus": "plus", "minus": "minus", "mal": "times", "oder": "or", "und": "and", "von": "of",
  "Lineare": "Linear", "Exponentiell": "Exponential",
  "Kl. 8–11 · 5 Videos": "Gr. 8–11 · 5 videos", "Kl. 9–12 · 5 Videos": "Gr. 9–12 · 5 videos",
  "Kl. 10–13 · 5 Videos": "Gr. 10–13 · 5 videos", "Kl. 11–13 · 5 Videos": "Gr. 11–13 · 5 videos",
  "Kl. 8–13 · 7 Videos · 100 €": "Gr. 8–13 · 7 videos · €100", "Kl. 11–13 · 5 Videos · 100 €": "Gr. 11–13 · 5 videos · €100",
  "EinMalEins": "Times tables",
};

/* Fachbegriffe in berechneten Texten (Kurvendiskussion usw.) */
const GLOSSAR = [
  ["da f eine ganzrationale Funktion (ein Polynom) ist", "since f is a polynomial function"],
  ["alle reellen Zahlen", "all real numbers"],
  ["streng monoton steigend", "strictly increasing"], ["streng monoton fallend", "strictly decreasing"],
  ["monoton steigend", "increasing"], ["monoton fallend", "decreasing"],
  ["Rechtskurve", "right-hand curve"], ["Linkskurve", "left-hand curve"], ["konkav", "concave"], ["konvex", "convex"],
  ["senkrechte Asymptote", "vertical asymptote"], ["Senkrechte Asymptote", "Vertical asymptote"],
  ["Waagerechte Asymptote", "Horizontal asymptote"], ["waagerechte Asymptote", "horizontal asymptote"],
  ["am Rand des Definitionsbereichs", "at the edge of the domain"], ["im Untersuchungsbereich", "in the examined range"],
  ["Quadratische Gleichung", "Quadratic equation"], ["Lineare Gleichung", "Linear equation"],
  ["Hochpunkt", "maximum point"], ["Tiefpunkt", "minimum point"], ["Sattelpunkt", "saddle point"],
  ["Wendepunkte", "inflection points"], ["Wendepunkt", "inflection point"], ["Extrempunkte", "extreme points"],
  ["Nullstellen", "zeros"], ["Nullstelle", "zero"], ["Polstelle", "pole"], ["Lücken", "gaps"], ["Lücke", "gap"],
  ["Negativ bedeutet", "Negative means"], ["Positiv bedeutet", "Positive means"],
  ["keine", "no"], ["kein", "no"], ["hat", "has"], ["ist", "is"], ["eine", "a"], ["und", "and"], ["oder", "or"],
  ["für", "for"], ["am", "at"], ["da", "since"], ["Ausprobieren", "Trial"], ["Gleichung", "equation"],
].map(([de, en]) => [new RegExp("(?<![\\p{L}])" + esc(de) + "(?![\\p{L}])", "gu"), en]);

function glossar(s) {
  if (!/[=⇒<>|(]|\d/.test(s)) return null;
  let t = s;
  for (const [re, en] of GLOSSAR) t = t.replace(re, en);
  return t === s ? null : t;
}

/* Übersetzt einen Text; unbekannte Texte bleiben unverändert. */
export function tr(text) {
  if (lang !== "en" || !EXAKT || text == null) return text;
  const s = String(text);
  const kern = norm(s);
  if (!kern || !/[A-Za-zÄÖÜäöüß]/.test(kern)) return s;
  let en = CACHE.get(kern);
  if (en === undefined) {
    en = EXAKT.get(kern) ?? ZUSATZ[kern] ?? null;
    if (en === null && kern.length < 600) {
      for (const m of MUSTER) {
        const treffer = kern.match(m.re);
        if (!treffer) continue;
        const werte = {};
        m.nummern.forEach((n, i) => { werte[n] = treffer[i + 1]; });
        en = m.en.replace(/(\p{L}?)\{(\d+)\}/gu, (_, vor, n) => {
          const w = werte[n] ?? "";
          // deutsche Pluralendung als Platzhalter („Schritt{1}“) → englisches „s“
          if (vor && /^(e|en|n|er|s)?$/.test(w)) return vor + (w ? "s" : "");
          return vor + (EXAKT.get(norm(w)) ?? w);
        });
        break;
      }
    }
    if (en === null) en = glossar(kern);
    CACHE.set(kern, en);
    if (en === null) FEHLT.add(kern);
  }
  if (en === null) return s;
  const vorne = s.match(/^\s*/)[0], hinten = s.match(/\s*$/)[0];
  return vorne + en + hinten;
}

/* ---------- DOM-Übersetzung ---------- */
const ATTRIBUTE = ["placeholder", "title", "aria-label", "alt"];
const AUSLASSEN = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE", "NOSCRIPT"]);

function gesperrt(el) {
  for (let e = el; e && e.nodeType === 1; e = e.parentNode) {
    if (AUSLASSEN.has(e.tagName) || e.hasAttribute("data-kein-i18n") || e.isContentEditable) return true;
  }
  return false;
}

function textKnoten(n) {
  const alt = n.data;
  if (alt === n.__en) return;
  if (!n.parentNode || gesperrt(n.parentNode)) return;
  const neu = tr(alt);
  n.__de = alt;
  n.__en = neu;
  if (neu !== alt) n.data = neu;
}

function attrKnoten(el, a) {
  const v = el.getAttribute(a);
  if (v == null || v === el["__en_" + a]) return;
  const neu = tr(v);
  el["__en_" + a] = neu;
  if (neu !== v) el.setAttribute(a, neu);
}

function baum(wurzel) {
  if (wurzel.nodeType === 3) { textKnoten(wurzel); return; }
  if (wurzel.nodeType !== 1 || gesperrt(wurzel)) return;
  const w = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: (n) => (n.nodeType === 1 && (AUSLASSEN.has(n.tagName) || n.hasAttribute("data-kein-i18n"))
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n = wurzel; n; n = w.nextNode()) {
    if (n.nodeType === 3) textKnoten(n);
    else ATTRIBUTE.forEach((a) => n.hasAttribute(a) && attrKnoten(n, a));
  }
}

function beobachten() {
  baum(document.body);
  if (document.title) document.title = tr(document.title);
  new MutationObserver((liste) => {
    for (const m of liste) {
      if (m.type === "characterData") textKnoten(m.target);
      else if (m.type === "attributes") { if (!gesperrt(m.target)) attrKnoten(m.target, m.attributeName); }
      else m.addedNodes.forEach(baum);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTE });
}

/* Vor dem ersten Rendern aufrufen. */
export async function spracheStarten() {
  document.documentElement.lang = lang;
  if (lang !== "en") return;
  try {
    const d = (await import("./i18n/en.json")).default;
    EXAKT = new Map(Object.entries(d.exakt));
    MUSTER = musterBauen(d.muster);
    if (document.body) beobachten();
    else document.addEventListener("DOMContentLoaded", beobachten);
  } catch (e) { /* ohne Wörterbuch bleibt die Seite deutsch */ }
}

export function spracheWechseln() {
  const neu = lang === "en" ? "de" : "en";
  try { localStorage.setItem(SPEICHER, neu); } catch (e) { /* privat */ }
  const u = new URL(window.location.href);
  u.searchParams.delete("lang");
  window.location.replace(u.toString());
}
