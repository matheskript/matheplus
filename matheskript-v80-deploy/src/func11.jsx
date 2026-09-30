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
import {
  baueKurvendiskussionInhalt, hochZiffer, markanteAllg, nullstellenAllg, polyTextPdf,
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
      const r = latexZuText(gruppe());
      aus += einfach(r) ? `√${r}` : `√(${r})`;
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
  // Grana-Gold-Streifen
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

/* ---------- Schaubild ---------- */

/* Modell für ein Polynom (Polynomplotter). */
function polyModell(e, a, b, c, d) {
  const f = (x) => e * x ** 4 + a * x ** 3 + b * x ** 2 + c * x + d;
  const fs = (x) => 4 * e * x ** 3 + 3 * a * x ** 2 + 2 * b * x + c;
  const fss = (x) => 12 * e * x ** 2 + 6 * a * x + 2 * b;
  const grad = e !== 0 ? 4 : a !== 0 ? 3 : b !== 0 ? 2 : c !== 0 ? 1 : 0;
  const ns = grad >= 1 ? nullstellenAllg(f, -40, 40).sort((p, q) => p - q) : [];
  const mark = markanteAllg(f, fs, fss, grad, -40, 40);
  return { f, ns, mark, yAchse: d };
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
  const farben = [C.see, C.gruen, C.gold, C.smaragd, C.lila];
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
    doc.text(zahl(vv), px(vv), Math.min(xAchsePos + 3, y0 + H - 1), { align: "center" });
  }
  const xAchse = xMin <= 0 && xMax >= 0 ? px(0) : x0;
  for (let v = Math.ceil(yMin / sy) * sy; v <= yMax; v += sy) {
    const vv = Math.round(v * 1000) / 1000;
    if (Math.abs(vv) < 1e-9) continue;
    doc.text(zahl(vv), Math.max(xAchse - 1, x0 + 4), py(vv) + 1, { align: "right" });
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
  const leg = [["Nullstelle", C.weiss, C.see], ["Extrempunkt", C.gruen], ["Wendepunkt", C.flaggold], ["y-Achse", C.seeHell]];
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
function rechenZeile(doc, s, txt, { fett, farbe, mono }) {
  const schrift = mono ? "Mono" : "Sans";
  let gr = (mono ? 7.4 : 8.2) * SK;
  doc.setFont(schrift, fett ? "bold" : "normal");
  doc.setFontSize(gr);
  while (doc.getTextWidth(txt) > SPALTE_B - 2 && gr > 4) { gr -= 0.2; doc.setFontSize(gr); }
  const basis = gr * 0.46, h = basis * ZA;
  s.platz(h);
  setzeText(doc, farbe);
  doc.text(txt, s.x(), s.zustand.y + (h - basis) / 2 + basis * 0.78);
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
  if (zl.formel) rechenZeile(doc, s, latexZuText(zl.txt), { fett: zl.fett, farbe });
  else if (zl.prosa) prosaZeile(doc, s, pdfText(zl.txt), { fett: zl.fett, farbe });
  else if (mono) rechenZeile(doc, s, pdfText(zl.txt), { fett: zl.fett, farbe, mono: true });
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
  doc.text("POLYNOMDIVISION", s.x() + 3, s.zustand.y + 2.4 * SK);
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
  doc.text("Kurvendiskussion", RAND, y);
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

export async function kurvendiskussionPdf({ e, a, b, c, d }) {
  const poly = polyTextPdf([e, a, b, c, d]);
  await allgemeinesPdf({
    kopf: {
      f: pdfText(`f(x) = ${poly}`),
      f1: pdfText(`f'(x) = ${polyTextPdf([4 * e, 3 * a, 2 * b, c])}`),
      f2: pdfText(`f''(x) = ${polyTextPdf([12 * e, 6 * a, 2 * b])}`),
      fuss: pdfText(`Kurvendiskussion für f(x) = ${poly}`),
      untertitel: "Kurvendiskussion · Polynomplotter",
    },
    inhalt: baueKurvendiskussionInhalt(e, a, b, c, d),
    modell: polyModell(e, a, b, c, d),
    dateiname: `Kurvendiskussion_${poly.replace(/\s+/g, "").replace(/\^/g, "").replace(/[^\w+\-]/g, "")}.pdf`,
  });
}
