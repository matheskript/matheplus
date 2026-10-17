/* ======================================================================
   PDF AUS BLÖCKEN – setzt fertig gestaltete DOM-Blöcke als Bilder auf
   A4-Seiten (jsPDF + html-to-image, beide erst bei Bedarf geladen).
   html-to-image lässt den Browser selbst zeichnen (SVG foreignObject) –
   html2canvas setzte Text und Brüche um einige Pixel versetzt.
   Formeln sehen dadurch im PDF genau so aus wie in der App (Brüche,
   Wurzelzeichen aus einem Linienzug, Vektorpfeile).
   - Ein Block wird nie zerschnitten; passt er nicht mehr, beginnt eine neue Seite.
   - kopf: Block, der auf jeder Folgeseite oben wiederholt wird (optional).
   - neueSeite: Blöcke mit data-pdf-neue-seite beginnen immer oben auf einer Seite.
   - halteMitNaechstem: Blöcke mit data-pdf-mit-naechstem (Überschriften) stehen nie allein unten.
   ====================================================================== */

const SEITE_B = 210, SEITE_H = 297, RAND = 12, FUSS = 10;

async function bild(hti, el, fontEmbedCSS) {
  const canvas = await hti.toCanvas(el, { pixelRatio: 2.4, backgroundColor: "#FFFFFF", cacheBust: false, fontEmbedCSS });
  return { daten: canvas.toDataURL("image/jpeg", 0.93), w: canvas.width, h: canvas.height };
}

export async function pdfAusBloecken({ bloecke, kopf = null, fuss = "mythosmathe.de", dateiname = "mythosmathe.pdf" }) {
  const [{ jsPDF }, hti] = await Promise.all([import("jspdf"), import("html-to-image")]);
  /* Formeln (inline-flex mit Umbruch) im Bild nie umbrechen: Die Kopie übernimmt feste Breiten,
     schon ein halbes Pixel Unterschied würde sonst eine Hochzahl in die nächste Zeile schieben. */
  [kopf, ...bloecke].filter(Boolean).forEach((b) => b.querySelectorAll("span").forEach((s) => {
    if (getComputedStyle(s).flexWrap === "wrap") s.style.flexWrap = "nowrap";
  }));
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) { /* egal */ } }
  let fontEmbedCSS;
  try { fontEmbedCSS = await hti.getFontEmbedCSS(bloecke[0]); } catch (e) { fontEmbedCSS = ""; }
  /* Safari lädt Schriften im SVG erst beim zweiten Zeichnen – ein Probelauf vorweg */
  try { await hti.toCanvas(bloecke[0], { pixelRatio: 1, fontEmbedCSS }); } catch (e) { /* egal */ }

  const breite = SEITE_B - 2 * RAND;
  const unten = SEITE_H - FUSS - 4;
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });

  const kopfBild = kopf ? await bild(hti, kopf, fontEmbedCSS) : null;
  const kopfH = kopfBild ? (kopfBild.h / kopfBild.w) * breite : 0;
  const bilder = [];
  for (const el of bloecke) {
    const b = await bild(hti, el, fontEmbedCSS);
    bilder.push({ ...b, mm: (b.h / b.w) * breite, neu: el.hasAttribute("data-pdf-neue-seite"), halten: el.hasAttribute("data-pdf-mit-naechstem") });
  }

  let y = RAND, seite = 1;
  const neueSeite = () => {
    doc.addPage(); seite += 1; y = RAND;
    if (kopfBild) { doc.addImage(kopfBild.daten, "JPEG", RAND, y, breite, kopfH); y += kopfH + 3; }
  };
  bilder.forEach((b, i) => {
    let h = b.mm, w = breite;
    const platz = unten - RAND - (kopfBild ? kopfH + 3 : 0);
    if (h > platz) { w = breite * (platz / h); h = platz; }   // übergroßer Block: verkleinern statt schneiden
    const naechster = bilder[i + 1];
    const brauchtDazu = b.halten && naechster ? Math.min(naechster.mm, platz - h) : 0;   // Überschrift wandert mit ihrem Block
    if ((b.neu && i > 0) || (y + h + brauchtDazu > unten && y > RAND + (seite > 1 && kopfBild ? kopfH + 3 : 0) + 0.5)) neueSeite();
    doc.addImage(b.daten, "JPEG", RAND + (breite - w) / 2, y, w, h);
    y += h;
  });

  const seiten = doc.getNumberOfPages();
  for (let s = 1; s <= seiten; s++) {
    doc.setPage(s);
    doc.setDrawColor(227, 232, 242); doc.setLineWidth(0.25);
    doc.line(RAND, SEITE_H - FUSS - 1, SEITE_B - RAND, SEITE_H - FUSS - 1);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(163, 172, 194);
    doc.text(fuss, RAND, SEITE_H - FUSS + 3);
    doc.text(`${s} / ${seiten}`, SEITE_B - RAND, SEITE_H - FUSS + 3, { align: "right" });
  }
  doc.save(dateiname);
}

/* Umlaute und Sonderzeichen für Dateinamen */
export const dateiName = (t) => String(t)
  .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss")
  .replace(/[^\w\-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
