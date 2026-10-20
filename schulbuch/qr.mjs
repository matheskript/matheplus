// QR-Codes in den Schulbüchern (beide Bände). Aufruf aus build.mjs, nachdem die Seiten gebaut sind.
//
// Jede rechnerische Aufgabe, die in der App einen Aufgabentyp hat (BUCH_TYPEN der Kurse), bekommt einen
// QR-Code: er führt auf den festen Kurzlink mythosmathe.de/b<Band>/<Seite>-<Nr> (pfade.js in der App)
// und liefert ein Blatt mit neuen Aufgaben dieses Typs samt Lösungen – zum Ausdrucken oder zum Bearbeiten
// im PDF. Der „In der App“-Kasten jeder Seite bekommt einen Code auf /b<Band>/s<Seite>: die Seitenübersicht
// in der App mit dem Werkzeug der Stunde und allen Aufgabentypen der Seite.
// Die Seitenzahlen sind die gedruckten, darum bleiben die Codes auch bei späteren Auflagen gültig.
//
// Platz: build.mjs misst vor dem Einbau den freien Platz je Seite (render.py --messen → dist/platz.json)
// und wählt je Seite die Form, die hineinpasst:
//   zwei   Randspalte, 2 Spalten, Codes 13,5 mm      eng    Randspalte, 3 Spalten, 10,6 mm
//   mini   Randspalte, 4 Spalten, 8,4 mm             unten  Leiste unter den Aufgaben in der Hauptspalte
//   kasten nur der Code im „In der App“-Kasten (führt zur Seitenübersicht mit allen Aufgabentypen)
import { createRequire } from "node:module";
import path from "node:path";
// qrcode liegt in den node_modules des jeweiligen Buchordners (build.mjs läuft dort)
const QRCode = createRequire(path.join(process.cwd(), "package.json"))("qrcode");

export const DOMAIN = "mythosmathe.de";

// Großschreibung: so passt die Adresse in den alphanumerischen QR-Modus (kleinerer Code, leichter zu scannen).
// Die App schreibt Pfade ohnehin klein (pfadNormal in pfade.js).
export async function qrSvg(pfad) {
  const url = `HTTPS://${DOMAIN}${pfad}`.toUpperCase();
  const svg = await QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#0E1E4A", light: "#FFFFFF" } });
  return svg.replace(/<svg [^>]*>/, (t) => t.replace(/ width="[^"]*"| height="[^"]*"/g, "").replace("<svg", '<svg class="qr" role="img" aria-label="QR-Code ' + pfad + '"'));
}

const aufgabenNummern = (haupt) => {
  const out = [];
  const re = /<div class="auf">\s*<div class="anr">[\s\S]*?<span class="z[^"]*">([^<]+)<\/span>/g;
  let m;
  while ((m = re.exec(haupt))) out.push(m[1].trim());
  return out;
};

export const QR_CSS = `
.rand .notiz.qr { border: 0.3mm solid var(--kap); border-radius: 2mm; padding: 1.8mm 2mm 1.4mm; margin-top: 2.5mm; background: #fff; }
.rand .notiz.qr p { margin: 0 0 1.4mm; font-size: 6.9pt; line-height: 1.38; }
.rand .notiz.qr .link { font-size: 6.6pt; color: var(--seeTief); font-weight: 700; }
.rand .qr-raster { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.4mm 1.6mm; }
.rand .qr-raster.eng { grid-template-columns: repeat(3, 1fr); gap: 1mm 1mm; }
.rand .qr-raster.mini { grid-template-columns: repeat(4, 1fr); gap: 0.8mm 0.6mm; }
.rand .qr-raster figure { margin: 0; text-align: center; }
.rand .qr-raster svg.qr { width: 13.5mm; height: 13.5mm; display: block; margin: 0 auto; }
.rand .qr-raster.eng svg.qr { width: 10.6mm; height: 10.6mm; }
.rand .qr-raster.mini svg.qr { width: 8.4mm; height: 8.4mm; }
.rand .qr-raster figcaption { font-size: 7.2pt; font-weight: 800; color: var(--kap); line-height: 1.15; margin-top: 0.5mm; }
.rand .qr-raster.mini figcaption { font-size: 6.4pt; margin-top: 0.3mm; }
.haupt .qr-leiste { display: flex; align-items: flex-start; gap: 1.8mm; border-top: 0.3mm solid var(--kap); padding-top: 1.6mm; margin-top: 2.5mm; }
.haupt .qr-leiste-text { flex: 1 1 auto; font-size: 6.9pt; line-height: 1.38; color: var(--mild); padding-right: 1mm; }
.haupt .qr-leiste-text b { display: block; font-size: 7pt; letter-spacing: 0.1em; text-transform: uppercase; color: var(--kap); margin-bottom: 0.6mm; }
.haupt .qr-leiste figure { margin: 0; text-align: center; flex: 0 0 auto; }
.haupt .qr-leiste svg.qr { width: 10.6mm; height: 10.6mm; display: block; }
.haupt .qr-leiste figcaption { font-size: 6.8pt; font-weight: 800; color: var(--kap); line-height: 1.1; margin-top: 0.4mm; }
.rand .notiz.mathilda .qr-app { display: flex; align-items: center; gap: 2mm; margin-top: 1.8mm; }
.rand .notiz.mathilda .qr-app .qr-weiss { background: #fff; border-radius: 1mm; padding: 0.9mm; flex: 0 0 auto; }
.rand .notiz.mathilda .qr-app svg.qr { width: 11mm; height: 11mm; display: block; }
.rand .notiz.mathilda .qr-app span { font-size: 6.5pt; line-height: 1.35; color: #C9D2DE; min-width: 0; overflow-wrap: anywhere; }
.rand .notiz.mathilda .qr-app span b { display: block; color: #fff; font-size: 6.8pt; }
.rand .notiz.mathilda .qr-link { font-size: 6.5pt; color: #fff; font-weight: 700; margin-top: 1mm; }
`;

/* Platzbedarf in CSS-Pixeln der Messung (Seite 210 mm = 794 px), im Browser nachgemessen:
   Kasten-Code im „In der App“-Kasten 95 px; Aufgaben-Box 150 px plus je Zeile 68 (zwei) / 56 (eng) / 46 (mini) px; Leiste unten 72 px. */
const APP_QR = 95;
const BEDARF = {
  zwei: (k) => 150 + 68 * Math.ceil(k / 2),
  eng: (k) => 150 + 56 * Math.ceil(k / 3),
  mini: (k) => 150 + 46 * Math.ceil(k / 4),
  knapp: (k) => 75 + 46 * Math.ceil(k / 4),   // mini ohne Erklärtext
  unten: () => 72,
};

/* seiten: [{ nr, haupt, rand, meta }], buchTypen: { "25-1": "typ" },
   platz: { "25": { rand: px, haupt: px } } aus render.py --messen (fehlt es, bleibt nur der Kasten-Code),
   form: { 25: "eng" } erzwingt eine Form für einzelne Seiten. */
export async function qrEinbauen(seiten, { band, buchTypen, platz = null, form = {} }) {
  const stat = { codes: 0, kaesten: 0, formen: {} };
  for (const s of seiten) {
    if (!s.rand || !s.rand.trim()) continue;
    const nummern = aufgabenNummern(s.haupt).filter((n) => buchTypen[`${s.nr}-${n}`]);
    const hatKasten = /<div class="notiz mathilda">/.test(s.rand);
    // 1) „In der App“-Kasten → /b1/s25 (Seitenübersicht: Werkzeug + alle Aufgabentypen der Seite)
    if (hatKasten) {
      const svg = await qrSvg(`/b${band}/s${s.nr}`);
      const text = nummern.length ? "Werkzeug der Stunde und neue Aufgaben zu jeder Nummer dieser Seite" : "Werkzeug der Stunde öffnen";
      s.rand = s.rand.replace(/(<div class="notiz mathilda">[\s\S]*?)(<\/div>)/, (ganz, inhalt, ende) =>
        `${inhalt}<div class="qr-app"><div class="qr-weiss">${svg}</div><span><b>Scannen und loslegen</b>${text}</span></div><div class="qr-link">${DOMAIN}/b${band}/s${s.nr}</div>${ende}`);
      stat.kaesten++;
    }
    if (!nummern.length) continue;
    // 2) Aufgaben mit Typ → /b1/25-1, in der Form, die auf die Seite passt
    const k = nummern.length;
    const p = (platz && platz[String(s.nr)]) || { rand: 0, haupt: 0 };
    const frei = p.rand - (hatKasten ? APP_QR : 0) - 30;   // der Kasten-Code braucht selbst Platz; 30 px Sicherheit
    let modus = form[s.nr];
    if (!modus) {
      if (frei >= BEDARF.zwei(k)) modus = "zwei";
      else if (frei >= BEDARF.eng(k)) modus = "eng";
      else if (frei >= BEDARF.mini(k)) modus = "mini";
      else if (frei >= BEDARF.knapp(k)) modus = "knapp";
      else if (p.haupt >= BEDARF.unten(k) && k <= 9) modus = "unten";
      else modus = "kasten";
    }
    stat.formen[s.nr] = modus;
    if (modus === "kasten") continue;   // der Kasten-Code führt zur Seitenübersicht mit allen Nummern
    const figuren = [];
    for (const n of nummern) {
      figuren.push(`<figure>${await qrSvg(`/b${band}/${s.nr}-${n.toLowerCase()}`)}<figcaption>${n}</figcaption></figure>`);
      stat.codes++;
    }
    if (modus === "unten") {
      s.haupt += `
<div class="qr-leiste"><div class="qr-leiste-text"><b>Neue Aufgaben zum Üben</b>Code scannen → Blatt mit neuen Aufgaben dieses Typs und Lösungen. Ausdrucken und mit Stift rechnen – oder im PDF. Ohne Scanner: ${DOMAIN}/b${band}/${s.nr}-<i>Nr</i></div>${figuren.join("")}</div>`;
      continue;
    }
    const text = modus === "knapp" ? "" : `<p>Scannen → Blatt mit <b>neuen Aufgaben dieses Typs</b> + Lösungen. Ausdrucken, mit Stift rechnen – oder im PDF.</p>`;
    s.rand += `
<div class="notiz qr"><span class="t">Neue Aufgaben: scannen</span>${text}
<div class="qr-raster${modus === "zwei" ? "" : " " + (modus === "knapp" ? "mini" : modus)}">${figuren.join("")}</div>
<p class="link" style="margin:1.4mm 0 0">${DOMAIN}/b${band}/${s.nr}-<i>Nr</i></p>
</div>`;
  }
  return stat;
}
