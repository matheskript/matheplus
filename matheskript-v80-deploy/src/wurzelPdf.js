/* ======================================================================
   WURZELN IM PDF (jsPDF)

   wurzelnImPdf(doc) erweitert ein jsPDF-Dokument: doc.text und
   doc.getTextWidth verstehen danach Text mit Wurzel-Markierungen
   (W_ANF Radikand W_END, siehe wurzelGeometrie.js). Haken und Überstrich
   werden als EIN Linienzug (doc.lines) gezeichnet – nie als Zeichen „√“
   mit einer zusätzlichen Linie. Verschachtelte Wurzeln bekommen nach außen
   hin höhere Überstriche, Hochzahlen im Radikanden mehr Platz.

   Rein bis auf das übergebene doc-Objekt → mit einem Attrappen-doc testbar.
   ====================================================================== */
import { WURZEL_MASS, W_ANF, W_END, wurzelPunkte, wurzelStuecke, wurzelTiefe } from "./wurzelGeometrie.js";

const PT_MM = 0.3528;
const HOCH = /[⁰¹²³⁴⁵⁶⁷⁸⁹]/;
const flach = (teile) => teile.map((p) => (typeof p === "string" ? p : flach(p.wurzel))).join("");
export const hatWurzel = (t) => typeof t === "string" && (t.includes(W_ANF) || t.includes(W_END));

/* Höhe des Überstrichs über der Grundlinie in em */
export function ueberstrichHoehe(teile) {
  return (HOCH.test(flach(teile)) ? 0.98 : 0.84) + 0.16 * wurzelTiefe(teile);
}

export function wurzelnImPdf(doc) {
  if (doc.__wurzeln) return doc;
  const text0 = doc.text.bind(doc);
  const breite0 = doc.getTextWidth.bind(doc);
  const em = () => doc.getFontSize() * PT_MM;

  const breite = (teile) => teile.reduce((b, p) => b + (typeof p === "string" ? breite0(p)
    : (WURZEL_MASS.haken + WURZEL_MASS.rechts) * em() + breite(p.wurzel)), 0);

  const zeichne = (teile, x, y, opt) => {
    for (const p of teile) {
      if (typeof p === "string") { text0(p, x, y, opt); x += breite0(p); continue; }
      const f = em();
      const w = (WURZEL_MASS.haken + WURZEL_MASS.rechts) * f + breite(p.wurzel);
      const oben = y - ueberstrichHoehe(p.wurzel) * f;
      const unten = y + 0.16 * f;
      const s = Math.max(0.12, f * 0.07);
      const punkte = wurzelPunkte({ w, h: unten - oben, f, s }).map(([px, py]) => [x + px, oben + py]);
      const alt = { farbe: doc.getDrawColor ? doc.getDrawColor() : null, dicke: doc.getLineWidth ? doc.getLineWidth() : null };
      doc.setDrawColor(doc.getTextColor ? doc.getTextColor() : 0);
      doc.setLineWidth(s);
      if (doc.setLineJoin) doc.setLineJoin("round");
      if (doc.setLineCap) doc.setLineCap("round");
      const deltas = punkte.slice(1).map(([px, py], k) => [px - punkte[k][0], py - punkte[k][1]]);
      doc.lines(deltas, punkte[0][0], punkte[0][1], [1, 1], "S", false);
      if (alt.farbe != null) doc.setDrawColor(alt.farbe);
      if (alt.dicke != null) doc.setLineWidth(alt.dicke);
      if (doc.setLineJoin) doc.setLineJoin("miter");
      if (doc.setLineCap) doc.setLineCap("butt");
      zeichne(p.wurzel, x + WURZEL_MASS.haken * f, y, opt);
      x += w;
    }
    return x;
  };

  doc.text = (t, x, y, opt, ...rest) => {
    if (!hatWurzel(t)) return text0(t, x, y, opt, ...rest);
    const teile = wurzelStuecke(t);
    let xs = x;
    const ausrichtung = opt && opt.align;
    if (ausrichtung === "right") xs = x - breite(teile);
    else if (ausrichtung === "center") xs = x - breite(teile) / 2;
    const rest0 = opt ? { ...opt } : undefined;
    if (rest0) delete rest0.align;
    zeichne(teile, xs, y, rest0);
    return doc;
  };
  doc.getTextWidth = (t) => (hatWurzel(t) ? breite(wurzelStuecke(t)) : breite0(t));
  doc.__wurzeln = true;
  return doc;
}
