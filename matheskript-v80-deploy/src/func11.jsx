/* PDF-Export der Kurvendiskussion (Matheskript-Layout).
   Wird nur bei Bedarf per dynamischem import() geladen, damit jsPDF und die
   Schrift nicht die normale App verlangsamen. Keine base-Datei darf diese
   Datei importieren. */

import { jsPDF } from "jspdf";
import fontRegularUrl from "dejavu-fonts-ttf/ttf/DejaVuSans.ttf?url";
import fontBoldUrl from "dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf?url";
import fontMonoUrl from "dejavu-fonts-ttf/ttf/DejaVuSansMono.ttf?url";
import fontMonoBoldUrl from "dejavu-fonts-ttf/ttf/DejaVuSansMono-Bold.ttf?url";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { kdInhalt, kdText } from "./kdEnglisch.js";
import {
  baueKurvendiskussionInhaltK, horner, polyAbleitungen, hochZiffer, markanteAllg, nullstellenAllg, polyTextPdf,
  schoenText, schoenerSchritt, tiefZiffer, zahl,
} from "./func2.jsx";

/* ---------- Schrift ---------- */

let schriftCache = null;
async function ladeSchriften() {
  if (schriftCache) return schriftCache;
  const alsBase64 = async (url) => {
    const buf = await (await fetch(url)).arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = "";
    const STUECK = 0x8000;
    for (let i = 0; i < bytes.length; i += STUECK) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + STUECK));
    return btoa(bin);
  };
  const [reg, bold, mono, monoBold] = await Promise.all(
    [fontRegularUrl, fontBoldUrl, fontMonoUrl, fontMonoBoldUrl].map(alsBase64));
  schriftCache = { reg, bold, mono, monoBold };
  return schriftCache;
}

function schriftenEinbinden(doc, s) {
  doc.addFileToVFS("DejaVuSans.ttf", s.reg);
  doc.addFont("DejaVuSans.ttf", "Sans", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", s.bold);
  doc.addFont("DejaVuSans-Bold.ttf", "Sans", "bold");
  doc.addFileToVFS("DejaVuSansMono.ttf", s.mono);
  doc.addFont("DejaVuSansMono.ttf", "Mono", "normal");
  doc.addFileToVFS("DejaVuSansMono-Bold.ttf", s.monoBold);
  doc.addFont("DejaVuSansMono-Bold.ttf", "Mono", "bold");
}

/* ---------- Text-Aufbereitung ---------- */

const striche = (t) => t.replace(/''/g, "″").replace(/'/g, "′");
const pdfText = (t) => striche(schoenText(t));

/* Wandelt die LaTeX-Zeilen (Mitternachtsformel) in gut lesbaren Klartext. */
function latexZuText(t) {
  let i = 0;
  const gruppe = () => {
    if (t[i] !== "{") { const z = t[i]; i++; return z; }
    let tiefe = 0, start = i + 1;
    for (; i < t.length; i++) {
      if (t[i] === "{") tiefe++;
      else if (t[i] === "}") { tiefe--; if (tiefe === 0) { i++; return t.slice(start, i - 1); } }
    }
    return t.slice(start);
  };
  const einfach = (s) => /^-?[\w.,√·²³⁴⁵⁶⁷⁸⁹⁰¹]+$/.test(s);
  let aus = "";
  while (i < t.length) {
    if (t.startsWith("\\frac", i)) {
      i += 5;
      const z = latexZuText(gruppe()), n = latexZuText(gruppe());
      aus += `${einfach(z) ? z : `(${z})`} / ${einfach(n) ? n : `(${n})`}`;
    } else if (t.startsWith("\\sqrt", i)) {
      i += 5;
      let wurzelIndex = "";
      if (t[i] === "[") { const j = t.indexOf("]", i); wurzelIndex = hochZiffer(t.slice(i + 1, j)); i = j + 1; }   // \sqrt[4]{…}
      const r = latexZuText(gruppe());
      aus += wurzelIndex + (einfach(r) ? `√${r}` : `√(${r})`);
    } else if (t.startsWith("\\text", i) && t[i + 5] === "{") {
      i += 5;
      aus += gruppe();
    } else if (t.startsWith("\\pm", i)) { i += 3; aus += "±"; }
    else if (t.startsWith("\\cdot", i)) { i += 5; aus += "·"; }
    else if (t.startsWith("\\Rightarrow", i)) { i += 11; aus += "⇒"; }
    else if (t.startsWith("\\quad", i)) { i += 5; aus += "  "; }
    else if (t[i] === "_") {
      i++;
      aus += gruppe().split("").map((z) => (/\d/.test(z) ? tiefZiffer(z) : z)).join("");
    } else if (t[i] === "^") {
      i++;
      aus += hochZiffer(gruppe());
    } else if (t[i] === "\\") { i++; }
    else { aus += t[i]; i++; }
  }
  return aus.replace(/\s+/g, " ").replace(/ - /g, " − ").trim();
}

/* ---------- Farben ---------- */

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const setzeFuell = (doc, hex) => doc.setFillColor(...rgb(hex));
const setzeStrich = (doc, hex) => doc.setDrawColor(...rgb(hex));
const setzeText = (doc, hex) => doc.setTextColor(...rgb(hex));

/* ---------- Layout-Konstanten (mm) ---------- */

const SEITE_B = 210, SEITE_H = 297;
const RAND = 12;
const SPALTE_ABSTAND = 7;
const SPALTE_B = (SEITE_B - 2 * RAND - SPALTE_ABSTAND) / 2;
const FUSS_Y = SEITE_H - 9;
/* Skalierung für Schrift und Zeilenabstände. Der Generator verkleinert sie
   schrittweise, bis die ganze Kurvendiskussion auf eine einzige Seite passt. */
let SK = 1;
/* Zeilenabstand-Faktor: > 1, wenn die Seite genug Platz lässt (entspannteres Schriftbild). */
let ZA = 1;
const INHALT_UNTEN = SEITE_H - 15;

function kopfleiste(doc, gross, untertitel = "Kurvendiskussion · Polynomplotter") {
  const h = gross ? 20 : 13;
  setzeFuell(doc, C.seeTief);
  doc.rect(0, 0, SEITE_B, h, "F");
  // Gold-Streifen
  setzeFuell(doc, C.gruen);
  doc.rect(0, h, SEITE_B / 2, 1.1, "F");
  setzeFuell(doc, C.flaggold);
  doc.rect(SEITE_B / 2, h, SEITE_B / 2, 1.1, "F");
  // Logo MATHESKRIPT.DE
  const gr = gross ? 17 : 12;
  doc.setFont("Sans", "bold");
  doc.setFontSize(gr);
  const y = gross ? 13 : 8.8;
  let x = RAND;
  [["MATHE", C.granaHell], ["SKRIPT", C.weiss], [".DE", C.flaggold]].forEach(([t, f]) => {
    setzeText(doc, f);
    doc.text(t, x, y);
    x += doc.getTextWidth(t);
  });
  doc.setFont("Sans", "normal");
  doc.setFontSize(gross ? 9 : 8);
  setzeText(doc, C.goldText);
  doc.text(untertitel, SEITE_B - RAND, y, { align: "right" });
  return h + 1.1;
}

/* Achsenbeschriftung: im Englischen mit Dezimalpunkt */
const achsZahl = (v) => (englisch() ? zahl(v).replace(/(\d),(\d)/g, "$1.$2") : zahl(v));

/* ---------- Schaubild ---------- */

/* Modell für ein Polynom (Polynomplotter). */
function polyModell(K6) {
  const { D1, D2 } = polyAbleitungen(K6);
  const f = (x) => horner(K6, x);
  const fs = (x) => horner(D1, x);
  const fss = (x) => horner(D2, x);
  const ersterIdx = K6.findIndex((v) => v !== 0);
  const grad = ersterIdx === -1 ? 0 : 5 - ersterIdx;
  const ns = grad >= 1 ? nullstellenAllg(f, -40, 40).sort((p, q) => p - q) : [];
  const mark = markanteAllg(f, fs, fss, grad, -40, 40);
  return { f, ns, mark, yAchse: K6[5] };
}

/* Zeichnet das Schaubild eines beliebigen Modells:
   { f, ns: Nullstellen, mark: [{x, y, art}], yAchse: f(0) oder null,
     integrale: [[x1, x2], …] (Standard: zwischen benachbarten Nullstellen),
     fenster: {xMin, xMax} (optional, Untersuchungsbereich) } */
function schaubild(doc, x0, y0, B, H, modell) {
  const { f, mark } = modell;
  const ns = modell.ns.slice().sort((p, q) => p - q);
  const yAchse = modell.yAchse;
  const ok = (y) => typeof y === "number" && isFinite(y);

  // Ausschnitt: alle interessanten Stellen plus Rand
  const xs = [...(ok(yAchse) ? [0] : []), ...ns, ...mark.map((p) => p.x)];
  let xMin, xMax;
  if (xs.length) {
    xMin = Math.min(...xs); xMax = Math.max(...xs);
    const spanne = Math.max(xMax - xMin, 2);
    xMin -= spanne * 0.18 + 0.5; xMax += spanne * 0.18 + 0.5;
  } else { xMin = -5; xMax = 5; }
  if (modell.fenster) {
    xMin = Math.max(xMin, modell.fenster.xMin); xMax = Math.min(xMax, modell.fenster.xMax);
    if (xMax - xMin < 1) { xMin = modell.fenster.xMin; xMax = modell.fenster.xMax; }
  }
  const yWerte = [0, ...(ok(yAchse) ? [yAchse] : []), ...mark.map((p) => p.y)].filter(ok);
  let yMin = Math.min(...yWerte), yMax = Math.max(...yWerte);
  // Kurvenenden nur begrenzt einbeziehen, damit die markanten Punkte groß genug bleiben.
  const grenze = Math.max(yMax - yMin, 2) * 0.6;
  const yUnten = yMin - grenze, yOben = yMax + grenze;
  for (let i = 0; i <= 200; i++) {
    const y = f(xMin + ((xMax - xMin) * i) / 200);
    if (ok(y) && y >= yUnten && y <= yOben) { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
  }
  const ySpanne = Math.max(yMax - yMin, 2);
  yMin -= ySpanne * 0.12; yMax += ySpanne * 0.12;

  const px = (x) => x0 + ((x - xMin) / (xMax - xMin)) * B;
  const py = (y) => y0 + H - ((y - yMin) / (yMax - yMin)) * H;

  // Rahmen und Raster
  setzeFuell(doc, C.weiss);
  setzeStrich(doc, C.linie);
  doc.setLineWidth(0.2);
  doc.roundedRect(x0, y0, B, H, 2, 2, "FD");
  const sx = schoenerSchritt((xMax - xMin) / 2), sy = schoenerSchritt((yMax - yMin) / 2);
  doc.setFont("Sans", "normal");
  doc.setFontSize(6);
  for (let v = Math.ceil(xMin / sx) * sx; v <= xMax; v += sx) {
    const vv = Math.round(v * 1000) / 1000;
    doc.line(px(vv), y0, px(vv), y0 + H);
  }
  for (let v = Math.ceil(yMin / sy) * sy; v <= yMax; v += sy) {
    const vv = Math.round(v * 1000) / 1000;
    doc.line(x0, py(vv), x0 + B, py(vv));
  }

  // Nullstellenintegrale als Flächen
  const farben = [C.see, C.gruen, C.tuerkis, C.smaragd, C.lila];
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 0.22 }));
  const integrale = modell.integrale || ns.slice(0, -1).map((x1, i) => [x1, ns[i + 1]]);
  for (let i = 0; i < integrale.length; i++) {
    const [x1, x2] = integrale[i];
    const pts = [[px(x1), py(0)]];
    for (let j = 0; j <= 60; j++) { const x = x1 + ((x2 - x1) * j) / 60; const y = f(x); if (ok(y)) pts.push([px(x), py(Math.min(Math.max(y, yMin), yMax))]); }
    pts.push([px(x2), py(0)]);
    const rel = pts.slice(1).map((p, j) => [p[0] - pts[j][0], p[1] - pts[j][1]]);
    setzeFuell(doc, farben[i % farben.length]);
    doc.lines(rel, pts[0][0], pts[0][1], [1, 1], "F", true);
  }
  doc.restoreGraphicsState();

  // Achsen mit Beschriftung
  setzeStrich(doc, C.hellgrau);
  doc.setLineWidth(0.35);
  if (yMin <= 0 && yMax >= 0) doc.line(x0, py(0), x0 + B, py(0));
  if (xMin <= 0 && xMax >= 0) doc.line(px(0), y0, px(0), y0 + H);
  setzeText(doc, C.hellgrau);
  const xAchsePos = yMin <= 0 && yMax >= 0 ? py(0) : y0 + H;
  for (let v = Math.ceil(xMin / sx) * sx; v <= xMax; v += sx) {
    const vv = Math.round(v * 1000) / 1000;
    if (Math.abs(vv) < 1e-9) continue;
    doc.text(achsZahl(vv), px(vv), Math.min(xAchsePos + 3, y0 + H - 1), { align: "center" });
  }
  const xAchse = xMin <= 0 && xMax >= 0 ? px(0) : x0;
  for (let v = Math.ceil(yMin / sy) * sy; v <= yMax; v += sy) {
    const vv = Math.round(v * 1000) / 1000;
    if (Math.abs(vv) < 1e-9) continue;
    doc.text(achsZahl(vv), Math.max(xAchse - 1, x0 + 4), py(vv) + 1, { align: "right" });
  }

  // Kurve (auf das Feld beschnitten)
  setzeStrich(doc, C.see);
  doc.setLineWidth(0.6);
  // Lücken (nicht definiert) und Sprünge an Polstellen unterbrechen die Linie.
  let vorher = null;
  const hoehe = yMax - yMin;
  for (let i = 0; i <= 800; i++) {
    const x = xMin + ((xMax - xMin) * i) / 800;
    const y = f(x);
    if (!ok(y)) { vorher = null; continue; }
    const innen = y >= yMin && y <= yMax;
    const p = [px(x), py(Math.min(Math.max(y, yMin), yMax))];
    const sprung = vorher && Math.abs(y - vorher.y) > hoehe * 1.5 && Math.sign(y) !== Math.sign(vorher.y);
    if (vorher && !sprung && (innen || vorher.innen)) doc.line(vorher.p[0], vorher.p[1], p[0], p[1]);
    vorher = { p, innen, y };
  }

  // Punkte
  const punktFarbe = (art) => (art === "Hochpunkt" || art === "Tiefpunkt" ? C.gruen : art === "Wendepunkt" ? C.flaggold : C.see);
  ns.forEach((x) => {
    setzeFuell(doc, C.weiss); setzeStrich(doc, C.see); doc.setLineWidth(0.45);
    doc.circle(px(x), py(0), 0.95, "FD");
  });
  mark.forEach((p) => {
    if (p.y < yMin || p.y > yMax) return;
    setzeFuell(doc, punktFarbe(p.art));
    doc.circle(px(p.x), py(p.y), 1.05, "F");
  });
  if (ok(yAchse) && yAchse >= yMin && yAchse <= yMax && xMin <= 0 && xMax >= 0) {
    setzeFuell(doc, C.seeHell);
    doc.circle(px(0), py(yAchse), 0.85, "F");
  }

  // Legende
  doc.setFontSize(6.5);
  const leg = englisch()
    ? [["Zero", C.weiss, C.see], ["Extreme point", C.gruen], ["Inflection point", C.flaggold], ["y-intercept", C.seeHell]]
    : [["Nullstelle", C.weiss, C.see], ["Extrempunkt", C.gruen], ["Wendepunkt", C.flaggold], ["y-Achse", C.seeHell]];
  let lx = x0 + 3;
  const ly = y0 + H + 4;
  leg.forEach(([t, fill, stroke]) => {
    setzeFuell(doc, fill);
    if (stroke) { setzeStrich(doc, stroke); doc.setLineWidth(0.35); doc.circle(lx, ly - 0.9, 0.9, "FD"); }
    else doc.circle(lx, ly - 0.9, 0.9, "F");
    setzeText(doc, C.grau);
    doc.text(t, lx + 2, ly);
    lx += doc.getTextWidth(t) + 7;
  });
  return y0 + H + 6;
}

/* ---------- Fließtext in zwei Spalten ---------- */

function spaltenSetzer(obenLinks, obenRechts) {
  const zustand = { spalte: 0, y: obenLinks, ueberlauf: false };
  const x = () => RAND + zustand.spalte * (SPALTE_B + SPALTE_ABSTAND);
  const weiter = () => {
    if (zustand.spalte === 0) { zustand.spalte = 1; zustand.y = obenRechts; }
    else zustand.ueberlauf = true; // passt nicht auf eine Seite → kleiner neu setzen
  };
  const platz = (h) => { if (zustand.y + h > INHALT_UNTEN) weiter(); };
  return { zustand, x, platz, weiter };
}

/* Setzt eine Zeile ein; lange Rechenzeilen werden verkleinert statt umbrochen. */
function rechenZeile(doc, s, txt, { fett, farbe, mono, notiz }) {
  const schrift = mono ? "Mono" : "Sans";
  let gr = (mono ? 7.4 : 8.2) * SK;
  doc.setFont(schrift, fett ? "bold" : "normal");
  doc.setFontSize(gr);
  // Randbemerkung (z. B. „(nächster Term)“) steht mit deutlichem Abstand rechts daneben
  const ABSTAND = 12;
  const breite = () => doc.getTextWidth(txt) + (notiz ? ABSTAND + doc.getTextWidth(notiz) * 0.9 : 0);
  while (breite() > SPALTE_B - 2 && gr > 4) { gr -= 0.2; doc.setFontSize(gr); }
  const basis = gr * 0.46, h = basis * ZA;
  s.platz(h);
  setzeText(doc, farbe);
  const yText = s.zustand.y + (h - basis) / 2 + basis * 0.78;
  doc.text(txt, s.x(), yText);
  if (notiz) {
    const xn = s.x() + doc.getTextWidth(txt) + ABSTAND;
    doc.setFont("Sans", "normal");
    doc.setFontSize(gr * 0.9);
    setzeText(doc, C.hellgrau);
    doc.text(notiz, xn, yText);
  }
  s.zustand.y += h;
}

/* Zerlegt eine LaTeX-Zeile an ihren Brüchen der obersten Ebene:
   [{ text }, { zaehler, nenner }, { text } …]. Brüche im Zähler oder Nenner
   bleiben dort als Klartext stehen. */
function formelTeile(t) {
  const teile = [];
  let rest = 0, i = 0;
  const gruppe = () => {
    if (t[i] !== "{") { const z = t[i]; i++; return z; }
    let tiefe = 0; const start = i + 1;
    for (; i < t.length; i++) {
      if (t[i] === "{") tiefe++;
      else if (t[i] === "}") { tiefe--; if (tiefe === 0) { i++; return t.slice(start, i - 1); } }
    }
    return t.slice(start);
  };
  while (i < t.length) {
    if (t.startsWith("\\frac", i)) {
      if (i > rest) teile.push({ text: t.slice(rest, i) });
      i += 5;
      const z = gruppe(), n = gruppe();
      teile.push({ zaehler: z, nenner: n });
      rest = i;
    } else i++;
  }
  if (rest < t.length) teile.push({ text: t.slice(rest) });
  return teile;
}

/* Eine Formelzeile mit echten, gestapelten Brüchen (Zähler, Bruchstrich, Nenner). */
function formelZeile(doc, s, latex, { fett, farbe }) {
  const teile = formelTeile(latex);
  if (!teile.some((p) => p.zaehler !== undefined)) return rechenZeile(doc, s, latexZuText(latex), { fett, farbe });
  const BR = 0.88;                       // Schriftgröße von Zähler und Nenner relativ zur Zeile
  const luecke = (gr) => gr * 0.3528 * 0.22;
  let gr = 8.2 * SK;
  doc.setFont("Sans", fett ? "bold" : "normal");
  const vorbereitet = teile.map((p) => {
    if (p.zaehler === undefined) {
      const roh = latexZuText(p.text);
      return { text: roh, vorn: /^\s/.test(p.text), hinten: /\s$/.test(p.text) };
    }
    return { zaehler: latexZuText(p.zaehler), nenner: latexZuText(p.nenner) };
  });
  const breite = () => {
    doc.setFontSize(gr);
    const leer = doc.getTextWidth(" ");
    return vorbereitet.reduce((sum, p) => {
      if (p.text !== undefined) return sum + doc.getTextWidth(p.text) + (p.vorn ? leer : 0) + (p.hinten ? leer : 0);
      doc.setFontSize(gr * BR);
      const w = Math.max(doc.getTextWidth(p.zaehler), doc.getTextWidth(p.nenner));
      doc.setFontSize(gr);
      return sum + w + 2 * luecke(gr) + 1;
    }, 0);
  };
  while (breite() > SPALTE_B - 2 && gr > 4) gr -= 0.2;
  const em = gr * 0.3528, emB = em * BR;
  const achse = 0.28 * em;                                  // Höhe des Bruchstrichs über der Grundlinie
  const hZaehler = achse + 0.22 * emB + 0.78 * emB;         // Oberkante des Zählers über der Grundlinie
  const hNenner = -achse + 0.85 * emB + 0.2 * emB;          // Unterkante des Nenners unter der Grundlinie
  const hNormal = gr * 0.46 * ZA;
  const h = Math.max(hNormal, hZaehler + Math.max(hNenner, 0) + 1.2 * SK);
  s.platz(h);
  setzeText(doc, farbe);
  const grundlinie = s.zustand.y + (h - (hZaehler + Math.max(hNenner, 0))) / 2 + hZaehler;
  let x = s.x();
  doc.setFont("Sans", fett ? "bold" : "normal");
  doc.setFontSize(gr);
  const leer = doc.getTextWidth(" ");
  vorbereitet.forEach((p) => {
    if (p.text !== undefined) {
      if (p.vorn) x += leer;
      doc.setFontSize(gr);
      doc.text(p.text, x, grundlinie);
      x += doc.getTextWidth(p.text) + (p.hinten ? leer : 0);
    } else {
      doc.setFontSize(gr * BR);
      const wz = doc.getTextWidth(p.zaehler), wn = doc.getTextWidth(p.nenner);
      const w = Math.max(wz, wn);
      const l = luecke(gr) + 0.5;
      doc.text(p.zaehler, x + l + (w - wz) / 2, grundlinie - achse - 0.22 * emB);
      doc.text(p.nenner, x + l + (w - wn) / 2, grundlinie - achse + 0.85 * emB);
      setzeStrich(doc, farbe);
      doc.setLineWidth(0.18 * SK + 0.06);
      doc.line(x + l * 0.6, grundlinie - achse, x + l * 1.4 + w, grundlinie - achse);
      x += w + 2 * l;
      doc.setFontSize(gr);
    }
  });
  s.zustand.y += h;
}

function prosaZeile(doc, s, txt, { fett, farbe }) {
  doc.setFont("Sans", fett ? "bold" : "normal");
  doc.setFontSize(8 * SK);
  const zeilen = doc.splitTextToSize(txt, SPALTE_B - 1);
  const basis = 3.9 * SK, h = basis * ZA;
  zeilen.forEach((z) => {
    s.platz(h);
    setzeText(doc, farbe);
    doc.text(z, s.x(), s.zustand.y + (h - basis) / 2 + basis * 0.77);
    s.zustand.y += h;
  });
}

function zeileSetzen(doc, s, zl, mono = false) {
  const farbe = zl.fett ? C.tinte : C.grau;
  if (zl.formel) formelZeile(doc, s, zl.txt, { fett: zl.fett, farbe });
  else if (zl.prosa) prosaZeile(doc, s, pdfText(zl.txt), { fett: zl.fett, farbe });
  else if (mono) rechenZeile(doc, s, pdfText(zl.txt), { fett: zl.fett, farbe, mono: true, notiz: zl.notiz });
  else {
    // Eingerückte Zeilen (z. B. Punkteliste) mit echtem Einzug statt Leerzeichen
    const einzug = /^\s+/.test(zl.txt);
    const xAlt = s.x;
    if (einzug) s.x = () => xAlt() + 3;
    rechenZeile(doc, s, pdfText(zl.txt.trim()), { fett: zl.fett, farbe });
    s.x = xAlt;
  }
}

function polynomdivisionSetzen(doc, s, block) {
  const zeilen = [block.anfang, ...block.mitte, ...block.ende];
  // Block möglichst in einer Spalte zusammenhalten
  s.platz(zeilen.length * 3.5 * SK + 7 * SK);
  const yStart = s.zustand.y;
  const spalteStart = s.zustand.spalte;
  s.zustand.y += 1.2 * SK;
  doc.setFont("Sans", "bold");
  doc.setFontSize(6.5 * SK);
  setzeText(doc, C.see);
  doc.text(englisch() ? "POLYNOMIAL DIVISION" : "POLYNOMDIVISION", s.x() + 3, s.zustand.y + 2.4 * SK);
  s.zustand.y += 3.6 * SK;
  const xAlt = s.x;
  s.x = () => xAlt() + 3;
  zeilen.forEach((zl, i) => zeileSetzen(doc, s, zl, i > 0 && i < zeilen.length - block.ende.length));
  s.x = xAlt;
  s.zustand.y += 1.2 * SK;
  if (s.zustand.spalte === spalteStart) {
    setzeFuell(doc, C.see);
    doc.rect(s.x(), yStart, 0.7, s.zustand.y - yStart, "F");
  }
  s.zustand.y += 1 * SK;
}

/* ---------- Hauptfunktion ---------- */

/* Setzt die komplette Seite mit Skalierung SK; meldet, ob etwas überläuft. */
function seiteSetzen(doc, inhalt, kopf, modell) {
  // Kopf: Logo; darunter links Titel, f, f′, f″ — rechts daneben ganz oben das Schaubild
  const kopfUnten = kopfleiste(doc, true, kopf.untertitel);
  let y = kopfUnten + 8;
  const xRechts = RAND + SPALTE_B + SPALTE_ABSTAND;
  const boxH = Math.max(42, 62 * SK);
  const unterSchaubild = schaubild(doc, xRechts, kopfUnten + 4, SPALTE_B, boxH, modell) + 3;

  doc.setFont("Sans", "bold");
  doc.setFontSize(20);
  setzeText(doc, C.tinte);
  doc.text(englisch() ? "Curve Sketching" : "Kurvendiskussion", RAND, y);
  setzeFuell(doc, C.gruen);
  doc.rect(RAND, y + 2.2, 14, 0.9, "F");
  y += 9;
  // Funktion so groß wie möglich, aber nie breiter als die linke Spalte
  const fText = kopf.f;
  let grF = 13;
  doc.setFontSize(grF);
  while (doc.getTextWidth(fText) > SPALTE_B && grF > 8) { grF -= 0.5; doc.setFontSize(grF); }
  doc.text(fText, RAND, y);
  y += 5.5;
  doc.setFont("Sans", "normal");
  doc.setFontSize(9);
  setzeText(doc, C.grau);
  // Lange Ableitungen (Advanced Plotter) werden verkleinert, damit sie in die Spalte passen
  [kopf.f1, kopf.f2].forEach((t) => {
    let g = 9;
    doc.setFontSize(g);
    while (doc.getTextWidth(t) > SPALTE_B && g > 5) { g -= 0.25; doc.setFontSize(g); }
    doc.text(t, RAND, y);
    y += 4.4;
  });
  y += 1.6;

  // Text: links direkt unter dem Kopf, rechts unter dem Schaubild
  const s = spaltenSetzer(y, unterSchaubild);
  inhalt.abschnitte.forEach((sek) => {
    s.platz((5.5 + 4 * Math.min(sek.zeilen.length, 2)) * SK);
    doc.setFont("Sans", "bold");
    doc.setFontSize(9.2 * SK);
    setzeText(doc, C.see);
    doc.text(sek.titel, s.x(), s.zustand.y + 3.4 * SK);
    setzeStrich(doc, C.linie);
    doc.setLineWidth(0.25);
    doc.line(s.x(), s.zustand.y + 4.8 * SK, s.x() + SPALTE_B, s.zustand.y + 4.8 * SK);
    s.zustand.y += 6.6 * SK + 1.2 * (ZA - 1) * 4;
    sek.zeilen.forEach((zl) => (zl.pd ? polynomdivisionSetzen(doc, s, zl) : zeileSetzen(doc, s, zl)));
    s.zustand.y += 3 * SK * ZA;
  });

  // Fußzeile
  setzeStrich(doc, C.linie);
  doc.setLineWidth(0.25);
  doc.line(RAND, FUSS_Y - 4, SEITE_B - RAND, FUSS_Y - 4);
  doc.setFont("Sans", "normal");
  doc.setFontSize(7);
  setzeText(doc, C.hellgrau);
  doc.text(kopf.fuss, RAND, FUSS_Y);
  doc.text("matheskript.de", SEITE_B - RAND, FUSS_Y, { align: "right" });

  return s.zustand.ueberlauf;
}

/* Generischer Export: kopf = { f, f1, f2, fuss, untertitel } (fertige Texte),
   inhalt = { abschnitte }, modell für das Schaubild (siehe schaubild()). */
export async function allgemeinesPdf({ kopf, inhalt, modell, dateiname }) {
  if (englisch()) {
    // Englische Seite: Rechenweg, Kopf, Fußzeile und Dateiname auf Englisch
    inhalt = kdInhalt(inhalt);
    kopf = {
      ...kopf,
      fuss: kopf.fuss.replace(/^Kurvendiskussion für/, "Curve sketching for"),
      untertitel: kopf.untertitel.replace("Kurvendiskussion", "Curve Sketching").replace("Polynomplotter", "Polynomial Plotter"),
    };
    dateiname = dateiname.replace(/^Kurvendiskussion_/, "Curve_Sketching_");
  }
  const schriften = await ladeSchriften();
  // Ausnahmslos eine Seite: so lange kleiner setzen, bis nichts mehr überläuft.
  let doc = null;
  const versuch = () => {
    const d = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
    schriftenEinbinden(d, schriften);
    return { d, ueber: seiteSetzen(d, inhalt, kopf, modell) };
  };
  ZA = 1;
  for (SK = 1; SK >= 0.4; SK = Math.round((SK - 0.04) * 100) / 100) {
    const v = versuch();
    doc = v.d;
    if (!v.ueber) break;
  }
  // Viel Platz übrig? Dann Zeilen etwas lockerer setzen — aber nie bis an den Rand:
  // größten passenden Faktor (max. 1,35) suchen und davon nur 70 % nutzen.
  if (SK === 1) {
    let zaMax = 1;
    for (let z = 1.35; z > 1.001; z = Math.round((z - 0.05) * 100) / 100) {
      ZA = z;
      if (!versuch().ueber) { zaMax = z; break; }
    }
    if (zaMax > 1) {
      ZA = Math.round((1 + (zaMax - 1) * 0.7) * 100) / 100;
      doc = versuch().d;
    }
  }
  SK = 1; ZA = 1;
  doc.save(dateiname);
}

/* Entweder k (Koeffizienten von x⁵ bis x⁰) oder e, a, b, c, d (x⁴ bis x⁰) angeben. */
export async function kurvendiskussionPdf({ k, e, a, b, c, d, untertitel = "Kurvendiskussion · Polynomplotter" }) {
  const K6 = k ? [...Array(Math.max(6 - k.length, 0)).fill(0), ...k].slice(-6) : [0, e, a, b, c, d];
  const { D1, D2 } = polyAbleitungen(K6);
  const poly = polyTextPdf(K6);
  await allgemeinesPdf({
    kopf: {
      f: pdfText(`f(x) = ${poly}`),
      f1: pdfText(`f'(x) = ${polyTextPdf(D1)}`),
      f2: pdfText(`f''(x) = ${polyTextPdf(D2)}`),
      fuss: pdfText(`Kurvendiskussion für f(x) = ${poly}`),
      untertitel,
    },
    inhalt: baueKurvendiskussionInhaltK(K6),
    modell: polyModell(K6),
    dateiname: `Kurvendiskussion_${poly.replace(/\s+/g, "").replace(/\^/g, "").replace(/[^\w+\-]/g, "")}.pdf`,
  });
}
