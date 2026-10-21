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

/* ---------- Löschen: nie eine halbe Gruppe stehen lassen ----------
   Ein Tastenfeld fügt ganze Gruppen ein: ^(▯), sqrt(▯), (▯)/(▯), log[▯](▯) … Löscht man davon nur das ^( oder nur das ),
   bleibt Schrott wie „(x+h)▯)“ zurück. Darum:
   · ⌫ direkt hinter einem Öffner (^(, sin(, (, … ) nimmt die ganze Gruppe bis zur schließenden Klammer weg.
     Leere Gruppe (nur ▯ oder nichts): komplett weg, bei einem Bruch auch die leere andere Hälfte.
     Gruppe mit Inhalt: Klammern und Funktionsname weg, der Inhalt bleibt (sin(2x) → 2x) – nur beim Exponenten ^( … )
     verschwindet der Inhalt mit, denn „x2x“ wäre sinnlos.
   · ⌫ direkt hinter einer schließenden Klammer: leere Gruppe → ganz weg; sonst springt die Marke in die Gruppe hinein.
   · Sonst wie gewohnt ein Zeichen (pi, e^( usw. als Einheit). */
const OEFFNER = ["sqrt(", "sin(", "cos(", "tan(", "log[", "log(", "ln(", "e^(", "1/(", "^(", "](", "(", "["];
const PAAR = { "(": ")", "[": "]" };
const istLeer = (s) => s === "" || s === PLATZ;

/* Stelle der passenden schließenden Klammer zu der öffnenden an Stelle i (−1: keine) */
export function schliesser(text, i) {
  const zu = PAAR[text[i]];
  if (!zu) return -1;
  let tiefe = 0;
  for (let j = i + 1; j < text.length; j++) {
    const c = text[j];
    if (c === "(" || c === "[") tiefe++;
    else if (c === ")" || c === "]") { if (tiefe === 0) return c === zu ? j : -1; tiefe--; }
  }
  return -1;
}
/* Stelle der passenden öffnenden Klammer zu der schließenden an Stelle j (−1: keine) */
export function oeffner(text, j) {
  const zu = text[j];
  const auf = zu === ")" ? "(" : zu === "]" ? "[" : null;
  if (!auf) return -1;
  let tiefe = 0;
  for (let i = j - 1; i >= 0; i--) {
    const c = text[i];
    if (c === ")" || c === "]") tiefe++;
    else if (c === "(" || c === "[") { if (tiefe === 0) return c === auf ? i : -1; tiefe--; }
  }
  return -1;
}

/* Gruppe, deren öffnende Klammer an Stelle auf steht, entfernen (siehe oben). */
function gruppeEntfernen(text, auf) {
  const davor = text.slice(0, auf + 1);
  const u = OEFFNER.find((o) => davor.endsWith(o)) || text[auf];
  const zu = schliesser(text, auf);
  if (zu < 0) {   // noch keine schließende Klammer: nur den Öffner weg
    const start = auf + 1 - u.length;
    return { text: text.slice(0, start) + text.slice(auf + 1), pos: start };
  }
  let start = auf + 1 - u.length, ende = zu + 1;
  const inhalt = text.slice(auf + 1, zu);
  let mitte = istLeer(inhalt) || u === "^(" ? "" : inhalt;
  if (u === "log[") {   // Basis von log[…](…): das Argument gehört dazu
    if (text[zu + 1] === "(") {
      const argZu = schliesser(text, zu + 1);
      if (argZu >= 0) { const arg = text.slice(zu + 2, argZu); ende = argZu + 1; mitte = istLeer(arg) ? "" : arg; }
    }
  } else if (u === "](") {   // Argument von log[…](…): die Basis gehört dazu
    const basisAuf = oeffner(text, auf - 1);
    if (basisAuf >= 3 && text.slice(basisAuf - 3, basisAuf) === "log") start = basisAuf - 3;
  }
  if (mitte === "") {   // leere Gruppe: beim Bruch auch die leere andere Hälfte mitnehmen
    if (text.startsWith("/(", ende)) {
      const z2 = schliesser(text, ende + 1);
      if (z2 >= 0 && istLeer(text.slice(ende + 2, z2))) ende = z2 + 1;
    } else if (text[start - 1] === "/" && text[start - 2] === ")") {
      const a2 = oeffner(text, start - 2);
      if (a2 >= 0 && istLeer(text.slice(a2 + 1, start - 2))) start = a2;
    }
  }
  return { text: text.slice(0, start) + mitte + text.slice(ende), pos: start };
}

/* Taste ⌫ bzw. Rücktaste: ein Schritt nach links löschen */
export function loescheZurueck(text, pos) {
  const p = klemm(text, pos);
  if (p === 0) return { text, pos: 0 };
  const vorne = text.slice(0, p);
  const c = text[p - 1];
  if (c === "(" || c === "[") return gruppeEntfernen(text, p - 1);
  if (c === ")" || c === "]") {
    const auf = oeffner(text, p - 1);
    if (auf >= 0) {
      if (istLeer(text.slice(auf + 1, p - 1))) return gruppeEntfernen(text, auf);
      return { text, pos: p - 1 };   // Gruppe mit Inhalt: hinein, nicht kaputt machen
    }
  }
  const n = vorne.endsWith("pi") ? 2 : 1;
  return { text: text.slice(0, p - n) + text.slice(p), pos: p - n };
}

/* Entf-Taste: ein Schritt nach rechts löschen (gleiche Regeln) */
export function loescheVor(text, pos) {
  const p = klemm(text, pos);
  if (p >= text.length) return { text, pos: p };
  const q = stelleRechts(text, p);
  const r = loescheZurueck(text, q);
  return r.text === text ? { text, pos: p } : r;
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
