/* ============================================================
   Schreibmarke im Formel-Eingabefeld (reine Logik, kein React, kein DOM)
   · Pfeiltasten springen über zusammengehörige Zeichen (sin(, ^(, log[ …) wie über ein Zeichen
   · „▯ →“ geht zum nächsten Platzhalter, danach aus der Klammer heraus
   · Ein Klick in die Formel wird zu einer Stelle im Eingabetext – auch „hinter die Klammer“
   Die Anzeige (Marke, markierter Platzhalter, graue Klammer) steckt in formelEngine.js (alsTexPos).
   ============================================================ */

export const PLATZ = "▯";

/* Zeichenfolgen, die für die Schreibmarke ein einziger Schritt sind */
const EINHEITEN = ["sqrt(", "sin(", "cos(", "tan(", "ln(", "log[", "log(", "^(", "](", "pi"];

const klemm = (text, pos) => Math.max(0, Math.min(pos == null ? text.length : pos, text.length));

/* Eine Stelle nach rechts / links */
export function stelleRechts(text, pos) {
  const p = klemm(text, pos);
  if (p >= text.length) return text.length;
  const e = EINHEITEN.find((u) => text.startsWith(u, p));
  return p + (e ? e.length : 1);
}
export function stelleLinks(text, pos) {
  const p = klemm(text, pos);
  if (p <= 0) return 0;
  const vorne = text.slice(0, p);
  const e = EINHEITEN.find((u) => vorne.endsWith(u));
  return p - (e ? e.length : 1);
}

/* Stelle direkt hinter der Klammer, in der die Schreibmarke steckt (−1, wenn sie in keiner steckt) */
export function hinterKlammer(text, pos) {
  const p = klemm(text, pos);
  const stapel = [];
  for (let i = 0; i < p; i++) {
    if (text[i] === "(" || text[i] === "[") stapel.push(text[i]);
    else if ((text[i] === ")" || text[i] === "]") && stapel.length) stapel.pop();
  }
  if (!stapel.length) return -1;
  let tiefe = 0;
  for (let i = p; i < text.length; i++) {
    if (text[i] === "(" || text[i] === "[") tiefe++;
    else if (text[i] === ")" || text[i] === "]") {
      if (tiefe === 0) return i + 1;
      tiefe--;
    }
  }
  return text.length;   // die Klammer ist noch offen: hinter den ganzen Text
}

/* Taste „▯ →“: zum nächsten Platzhalter; ist keiner mehr offen, aus der Klammer heraus (sonst ans Ende).
   Steht die Marke auf einem Platzhalter, zählt der nicht als „nächster“. */
export function naechsterPlatz(text, pos) {
  const p = klemm(text, pos);
  const ab = text[p] === PLATZ ? p + 1 : p;
  const spaeter = text.indexOf(PLATZ, ab);
  if (spaeter >= 0) return spaeter;
  const frueher = text.indexOf(PLATZ);
  if (frueher >= 0 && frueher !== p) return frueher;
  const raus = hinterKlammer(text, p);
  return raus >= 0 ? raus : text.length;
}

/* Klick in die Formel → Stelle im Text.
   blaetter: sichtbare Stücke { s, e (Stellen im Text), l, r, t, b (Rechteck auf dem Bildschirm),
   gruppen: [{ ge, r }] (umgebende Gruppen wie Exponent oder Wurzelinhalt, innerste zuerst; ge = Stelle hinter der Klammer) }.
   Das nächstgelegene Stück gewinnt (waagerecht und senkrecht), die Hälfte, in die geklickt wurde, entscheidet über Anfang
   oder Ende. Klickt man rechts neben eine Gruppe, landet die Marke hinter ihrer Klammer – so kommt man aus Exponenten
   und Wurzeln heraus. */
export function stelleAusKlick(x, y, blaetter, laenge = 0) {
  if (!blaetter || !blaetter.length) return laenge;
  let best = null, bestD = Infinity, bestDx = Infinity;
  for (const b of blaetter) {
    const dx = x < b.l ? b.l - x : x > b.r ? x - b.r : 0;
    const dy = y < b.t ? b.t - y : y > b.b ? y - b.b : 0;
    const d = dx * dx + (2 * dy) * (2 * dy);
    if (d < bestD - 1e-9 || (Math.abs(d - bestD) <= 1e-9 && dx < bestDx)) { best = b; bestD = d; bestDx = dx; }
  }
  let p = x < (best.l + best.r) / 2 ? best.s : best.e;
  if (p === best.e) {
    for (const g of best.gruppen || []) {
      if (x > g.r + 0.5) p = g.ge; else break;
    }
  }
  return p;
}
