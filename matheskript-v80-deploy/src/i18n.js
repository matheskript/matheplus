import { kdText } from "./kdEnglisch.js";
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

const norm = (s) => s.replace(/\u00AD/g, "").replace(/\s+/g, " ").trim();   // weiche Trennstriche ignorieren
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
  "TICKET": "TICKET", "pro Person": "per person", "INKLUSIVE": "INCLUDED",
  "Kursmaterialien: Block, Heft und Stift": "Course materials: notepad, exercise book and pen",
  "Quadratwurzel bis 625": "Square roots up to 625", "Kubikwurzel bis 1000": "Cube roots up to 1000", "Wurzel 10k": "Root 10k", "Quadratwurzeln bis 625": "Square roots up to 625", "Kubikwurzeln bis 1000": "Cube roots up to 1000", "Quadratwurzeln bis 10 000": "Square roots up to 10,000", "Mix": "Mix",
  "Multiplizieren im Kopf": "Mental Multiplication", "Multiplizieren": "Multiplication",
  "Zwei-, drei- und vierstellige Zahlen im Kopf malnehmen.": "Multiply two-, three- and four-digit numbers in your head.",
  "Wähle, wie viele Stellen die beiden Zahlen haben. Rechne im Kopf und tippe das Ergebnis ein.": "Choose how many digits the two numbers have. Work it out in your head and type in the result.",
  "Die Knöpfe zeigen die Anzahl der Stellen.": "The buttons show the number of digits.",
  "1. Zahl": "1st number", "2. Zahl": "2nd number", "1-stellig": "1-digit", "2-stellig": "2-digit", "3-stellig": "3-digit", "4-stellig": "4-digit",
  "Fünf Trainer für das Kopfrechnen. Wer Zahlen sofort abrufen kann, kürzt schneller, sieht Teiler auf einen Blick und hat beim Rechnen den Kopf für das Eigentliche frei.": "Five trainers for mental math. If you can recall numbers instantly, you simplify faster, spot divisors at a glance and keep your mind free for what really matters when calculating.",
  "Übersicht Analysis": "Calculus overview", "Übersicht Vektoren": "Vectors overview", "Übersicht Stochastik": "Probability overview",
  "Primfaktoren, Quadratzahlen, Brüche, Einmaleins – auf Zeit.": "Prime factors, square numbers, fractions, times tables – against the clock.",
  "Quadrate & Kuben": "Squares & cubes",
  "Mathe-Wettbewerbe": "Math Competitions", "Landeswettbewerbe": "State Competitions", "Landeswettbewerb": "State competition",
  "Bundeswettbewerb Mathematik und Landeswettbewerbe.": "Bundeswettbewerb Mathematik and state competitions.",
  "Bundeswettbewerb Mathematik öffnen": "Open Bundeswettbewerb Mathematik", "Bundeswettbewerb Mathematik": "Bundeswettbewerb Mathematik",
  "Die nächste 1. Runde und die Aufgaben mit Lösungen vom letzten Jahr.": "The next first round and last year's tasks with solutions.",
  "Deutschlandkarte: Tippe auf dein Bundesland.": "Map of Germany: tap your state.",
  "MATHE-WETTBEWERBE": "MATH COMPETITIONS", "LANDESWETTBEWERB": "STATE COMPETITION",
  "Drei Runden, echte Probleme, saubere Beweise – der große Mathe-Wettbewerb für die Oberstufe.": "Three rounds, real problems, clean proofs – the big math competition for upper-school students.",
  "Von Baden-Württemberg bis Thüringen: der Mathe-Wettbewerb in deinem Bundesland.": "From Baden-Württemberg to Thuringia: the math competition in your state.",
  "Der Mathematik-Wettbewerb des Landes – Termine, Aufgaben und Lösungen.": "The state's mathematics competition – dates, tasks and solutions.",
  "Die Landesrunde der Mathematik-Olympiade – Termine, Aufgaben und Lösungen.": "The state round of the Mathematical Olympiad – dates, tasks and solutions.",
  "Kurvendiskussion": "Curve sketching", "Polynome": "Polynomials", "Beliebige Funktionen": "Any function",
  "Graph, Ableitungen und PDF auf Knopfdruck": "Graph, derivatives and PDF at the push of a button",
  "Ganzrationale Funktionen bis Grad 4": "Polynomial functions up to degree 4", "Mit sin, ln, eˣ, Wurzeln und Brüchen": "With sin, ln, eˣ, roots and fractions",
  "f′, f″ und f‴ eingeben und prüfen": "Enter and check f′, f″ and f‴", "Ebenen live im Raum drehen": "Rotate planes live in space",
  "Schnittgerade und Schnittwinkel": "Line of intersection and angle", "Immer neue Rechnungen mit Rechenweg": "Endless new exercises with worked solutions",
  "a × b – Formel, eingesetzt, Ergebnis": "a × b – formula, substituted, result", "Fünf Lektionen mit Kurz-Checks": "Five lessons with quick checks",
  "Binomialverteilung live simulieren": "Simulate the binomial distribution live", "Mit Baumdiagramm und bedingter WKT": "With tree diagram and conditional probability",
  "Vom Baumdiagramm zum Hypothesentest": "From tree diagram to hypothesis test", "Du formst um, die App rechnet mit": "You transform, the app does the arithmetic",
  "Mit drei Variablen": "With three variables",
  "Kurvendiskussion, Sinus und Ableitungen – live.": "Curve sketching, sine and derivatives – live.",
  /* Steckbriefaufgaben (Funktionen aus Eigenschaften bestimmen) */
  "Steckbriefaufgaben": "Function Reconstruction", "Steckbrief": "Reconstruction", "Steckbriefe": "Reconstruction",
  "Aus Eigenschaften die Funktion bestimmen": "Determine the function from its properties",
  "Kurvendiskussion, Steckbriefe, Sinus und Ableitungen – live.": "Curve sketching, function reconstruction, sine and derivatives – live.",
  "Aus Hochpunkt, Wendepunkt & Co. die Funktion bauen.": "Build the function from maximum points, inflection points & co.",
  "Bedingungen aufstellen, einsetzen, LGS lösen – mit Schaubild als Probe.": "Set up conditions, substitute, solve the linear system – with the graph as a check.",
  "Fünf Werkzeuge für die Analysis: Graphen live erkunden, komplette Kurvendiskussionen erzeugen, Sinusfunktionen anpassen, Funktionen aus Steckbriefen bestimmen und das Ableiten trainieren.":
    "Five tools for calculus: explore graphs live, generate complete curve sketches, fit sine functions, reconstruct functions from their properties and practice differentiating.",
  "Vom kleinen Einmaleins bis zu vierstelligen Zahlen.": "From times tables to four-digit numbers.",
  "Wähle für beide Zahlen einen Bereich – vom kleinen Einmaleins bis zu vierstelligen Zahlen. Rechne im Kopf und tippe das Ergebnis ein.": "Choose a range for both numbers – from times tables to four-digit numbers. Work it out in your head and type in the result.",
  "Vier Trainer für das Kopfrechnen. Wer Zahlen sofort abrufen kann, kürzt schneller, sieht Teiler auf einen Blick und hat beim Rechnen den Kopf für das Eigentliche frei.": "Four trainers for mental math. If you can recall numbers instantly, you simplify faster, spot divisors at a glance and keep your mind free for what really matters when calculating.",
  "Aufgabe": "Task", "Malnehmen": "Multiply", "Umkehraufgabe": "Inverse task",
  "Primfaktoren": "Prime factors", "Zahlen blitzschnell zerlegen.": "Break numbers down in a flash.",
  "Potenzen und Wurzeln.": "Powers and roots.", "Kürzen, plus, minus, mal, geteilt.": "Simplify, add, subtract, multiply, divide.",
  "Vom 1×1 bis vierstellig.": "From times tables to four digits.",
  "Schriftlich Plus & Minus": "Written Addition & Subtraction", "Schriftliche Division": "Written Division", "Schriftlich teilen": "Long division",
  "Schriftlich untereinander.": "Written in columns.", "Mit und ohne Rest.": "With and without remainder.",
  "Sechs Trainer für das Kopfrechnen und schriftliche Rechnen. Wer Zahlen sofort abrufen kann, kürzt schneller, sieht Teiler auf einen Blick und hat beim Rechnen den Kopf für das Eigentliche frei.": "Six trainers for mental and written arithmetic. If you can recall numbers instantly, you simplify faster, spot divisors at a glance and keep your mind free for what really matters when calculating.",
  /* --- Nachtrag: Sprachprüfung Okt. --- */
  "Werkzeuge für die Analysis: Graphen live erkunden, komplette Kurvendiskussionen erzeugen, Sinusfunktionen anpassen, Funktionen aus Steckbriefen bestimmen, das Ableiten trainieren und integrieren.": "Tools for calculus: explore graphs live, generate complete curve sketches, fit sine functions, determine functions from conditions, practise differentiating and integrating.",
  "Seite wechseln": "Switch page", "Mathe-Training aufklappen": "Expand maths training", "Mathematik aufklappen": "Expand mathematics",
  "Mathe-Wettbewerbe aufklappen": "Expand maths competitions", "Kopfrechnen aufklappen": "Expand mental arithmetic", "Analysis aufklappen": "Expand analysis",
  "Ich hänge fest": "I'm stuck", "k verringern": "Decrease k", "p verringern": "Decrease p", "Nenner verringern": "Decrease denominator",
  "genau 2": "exactly 2", "× Sechs": "× six", "Rechnen mit Vektoren": "Calculating with vectors", "Zwei Punkte – eine Gerade": "Two points – one line",
  "2 Punkte": "2 points", "Drei Punkte – eine Ebene": "Three points – one plane", "3 Punkte": "3 points", "Drei Punkte": "Three points", "Abstände": "Distances",
  "Grundebenen anzeigen": "Show coordinate planes", "Grundebenen": "Coordinate planes", "x₁-x₂-Ebene": "x₁-x₂ plane", "x₂-x₃-Ebene": "x₂-x₃ plane", "x₁-x₃-Ebene": "x₁-x₃ plane",
  "Parallel": "Parallel", "x⁴-Glied": "x⁴ term", "positiv": "positive", "· Demo": "· Demo",
  "A ± B, k · A und k · A + j · B mit Rechenweg.": "A ± B, k · A and k · A + j · B with worked steps.",
  "Geradengleichung aus zwei Punkten – auf zwei Wegen.": "Line equation from two points – in two ways.",
  "Drei Wege zur Ebene, mit Koordinatenform.": "Three ways to a plane, with coordinate form.",
  "Punkt, Gerade, Ebene – jede Kombination mit 3D-Bild.": "Point, line, plane – every combination with a 3D picture.",
  "Vektor A ± Vektor B": "Vector A ± vector B", "k · Vektor A": "k · vector A", "Weitere Beispiele": "More examples",
  "Gleichungen": "Equations", "Mathe-Training": "Math Training", "Mathematik": "Mathematics", "Definitionen": "Definitions", "Sätze": "Theorems",
  "Formelsammlung, Definitionen und Sätze – zum Nachschlagen.": "Formulas, definitions and theorems – for reference.",
  "Alle wichtigen Begriffe der Oberstufe – präzise definiert.": "All key terms of upper-level math – precisely defined.",
  "Die zentralen Sätze der Oberstufe – klar formuliert.": "The central theorems of upper-level math – clearly stated.", "Gleichungen lösen": "Solving equations",
  "Gleichungen umformen und Gleichungssysteme lösen – mit Musterlösung.": "Transform equations and solve systems of equations – with model solutions.",
  "Analysis, Vektoren, Stochastik und Gleichungen live erleben.": "Experience calculus, vectors, probability and equations live.",
  "Frag Mathilda AI": "Ask Mathilda AI", "Frag Mathilda AI öffnen": "Open Ask Mathilda AI",
  "Ticket buchen –": "Book ticket –", "Elternabend ·": "Parents' evening ·",
  "Sonntag, 1. November 2026": "Sunday, November 1, 2026", "Sonntag, 1. November": "Sunday, November 1",
  "Die Bestätigung kommt per E-Mail. Wir freuen uns auf dich am": "The confirmation arrives by email. We look forward to seeing you on",
  "in Evelyn's Café.": "at Evelyn's Café.",
  "Zwei Getränke": "Two drinks", "Ein Snack": "One snack", "Kreditkarte": "Credit card", "Jetzt buchen": "Book now", "Ticket buchen": "Book ticket",
  "Sichere Zahlung über Stripe. Mehrere Tickets in einem Schritt möglich, die Bestätigung kommt per E-Mail.": "Secure payment via Stripe. You can book several tickets at once; the confirmation arrives by email.",
  "Danke, dein Ticket ist gebucht!": "Thank you, your ticket is booked!",
  "Die Plätze im Café sind begrenzt – sichern Sie sich Ihr Ticket.": "Seats in the café are limited – secure your ticket now.",
  "Getränke, Snack und erstes Kennenlernen": "Drinks, a snack and getting to know each other",
};

/* Fachbegriffe in berechneten Texten (Kurvendiskussion usw.) */
const GLOSSAR = [
  ["da f eine ganzrationale Funktion (ein Polynom) ist", "since f is a polynomial function"],
  ["alle reellen Zahlen", "all real numbers"],
  ["streng monoton steigend", "strictly increasing"], ["streng monoton fallend", "strictly decreasing"],
  ["monoton steigend", "increasing"], ["monoton fallend", "decreasing"],
  ["Rechtskurve (konkav)", "concave down"], ["Linkskurve (konvex)", "concave up"],
  ["Rechtskurve", "concave down"], ["Linkskurve", "concave up"], ["konkav", "concave"], ["konvex", "convex"],
  ["senkrechte Asymptote", "vertical asymptote"], ["Senkrechte Asymptote", "Vertical asymptote"],
  ["Waagerechte Asymptote", "Horizontal asymptote"], ["waagerechte Asymptote", "horizontal asymptote"],
  ["am Rand des Definitionsbereichs", "at the edge of the domain"], ["im Untersuchungsbereich", "in the examined range"],
  ["Quadratische Gleichung", "Quadratic equation"], ["Lineare Gleichung", "Linear equation"],
  ["Hochpunkt", "maximum point"], ["Tiefpunkt", "minimum point"], ["Sattelpunkt", "saddle point"],
  ["Wendepunkte", "inflection points"], ["Wendepunkt", "inflection point"], ["Extrempunkte", "extreme points"], ["Wendestelle", "inflection point"],
  ["Nullstellen", "zeros"], ["Nullstelle", "zero"], ["Polstelle", "pole"], ["Lücken", "gaps"], ["Lücke", "gap"],
  ["Negativ bedeutet", "Negative means"], ["Positiv bedeutet", "Positive means"],
  ["keine", "no"], ["kein", "no"], ["hat", "has"], ["ist", "is"], ["eine", "a"], ["und", "and"], ["oder", "or"],
  ["für", "for"], ["am", "at"], ["da", "since"], ["Ausprobieren", "Trial"], ["Gleichung", "equation"],
].map(([de, en]) => [new RegExp("(?<![\\p{L}])" + esc(de) + "(?![\\p{L}])", "gu"), en]);

/* Bleiben nach dem Glossar noch deutsche Wörter übrig, wäre das Ergebnis ein
   Sprachmix („The graph … has im Punkt …“) – dann lieber gar nicht übersetzen. */
const NOCH_DEUTSCH = /[äöüÄÖÜß]|(?<![\p{L}])(der|die|das|den|dem|des|ein|einen|einem|einer|im|zum|zur|vom|mit|bei|nach|auf|durch|sich|wird|sind|nicht|noch|auch|nur|dort|hier|dann|wenn|also|liegt|verläuft|schneidet|Punkt|Punkte|Stelle|Graph|Graphen|Funktion|Bedingung|Steigung|Gleichung|Lösung|gesucht|Gesucht)(?![\p{L}])/u;

function glossar(s) {
  if (!/[=⇒<>|(]|\d/.test(s)) return null;
  let t = kdText(s);
  for (const [re, en] of GLOSSAR) t = t.replace(re, en);
  if (t === s || NOCH_DEUTSCH.test(t)) return null;
  return t;
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
          return vor + tr(w);
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
    acceptNode: (n) => {
      if (n.nodeType === 1 && (AUSLASSEN.has(n.tagName) || n.hasAttribute("data-kein-i18n"))) {
        if (n.tagName === "TEXTAREA" && !gesperrt(n.parentNode)) attrKnoten(n, "placeholder");
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
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
      else if (m.type === "attributes") {
        const t = m.target;
        if (!gesperrt(t) || (t.tagName === "TEXTAREA" && m.attributeName === "placeholder" && !gesperrt(t.parentNode))) attrKnoten(t, m.attributeName);
      }
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
