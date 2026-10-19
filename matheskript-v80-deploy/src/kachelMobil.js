/* Gemeinsame Mobil-Regeln der Kurs-Kacheln auf der Startseite (Differentialrechnung,
   Vektoren, GFS, KI/Claude/Gemini). Gilt NUR unter 840 px (Handy); der Desktop
   (ab 840 px, siehe func10.jsx / func2.jsx) bleibt unverändert.

   Mobil ist die Kachel oben/unten statt links/rechts geteilt:
   - Kopfzeile: Die Überschrift läuft über die gesamte Breite, auf einem einzigen
     Hintergrund (--kk-kopf, Schrift --kk-kopftext). Darunter der Balken, ebenfalls
     über die volle Breite.
   - Körper: ein heller Hintergrund (--kk-koerper). Links der Infotext (höchstens
     4 Zeilen, Schrift --kk-text) und direkt darunter „Kurs öffnen“ in einer Box mit
     abgerundeten Enden (Rand --kk-rand). Rechts das Bild des Kurses.
   - Das Wort „KURS“ (kk-kicker) und die Modul-Info (kk-modul) entfallen.

   Die Farben setzt jede Kachel über kachelMobilVars() als CSS-Variablen am Button.
   Technik: Die linke Spalte wird per display:contents aufgelöst, damit Überschrift,
   Balken, Text und Knopf direkt im Raster des Buttons liegen. */

export function kachelMobilVars({ kopf, kopfText, koerper, text, rand }) {
  return { "--kk-kopf": kopf, "--kk-kopftext": kopfText, "--kk-koerper": koerper, "--kk-text": text, "--kk-rand": rand };
}

export function kachelMobilCss(klasse) {
  const k = `.${klasse}`;
  return `
        ${k} .kk-mob{display:none}
        @media (max-width:839px){
          ${k}{display:grid !important;grid-template-columns:minmax(0,1fr) 38%;grid-template-rows:auto auto auto auto;align-content:start;min-height:0 !important;background:var(--kk-koerper) !important}
          ${k} > div:first-of-type{display:contents !important}
          ${k} .kk-kicker,${k} .kk-modul{display:none !important}
          ${k} h2{grid-column:1 / -1;grid-row:1;background:var(--kk-kopf);color:var(--kk-kopftext);font-size:clamp(20px, 5.6vw, 26px) !important;line-height:1.12 !important;margin:0 !important;padding:15px 16px 13px;white-space:normal !important;overflow:visible !important;text-overflow:clip !important;text-wrap:balance}
          ${k} .kk-balken{grid-column:1 / -1;grid-row:2;width:auto !important;height:3px !important;margin:0 !important;border-radius:0 !important}
          ${k} p{grid-column:1;grid-row:3;margin:0 !important;padding:13px 6px 0 16px;color:var(--kk-text) !important;font-size:13px !important;line-height:1.42 !important;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;line-clamp:4;overflow:hidden}
          ${k} .kk-knopf{grid-column:1;grid-row:4;align-self:start;justify-self:start;margin:11px 0 15px 16px !important;padding:7px 14px 7px 16px !important;border:1.6px solid var(--kk-rand);border-radius:999px;font-size:13.5px !important;color:var(--kk-text) !important}
          ${k} .kk-knopf svg path{stroke:var(--kk-rand)}
          ${k} > div:last-of-type{grid-column:2;grid-row:3 / span 2;background:transparent !important;border-left:none !important;min-height:112px;flex:none !important}
          ${k} .kk-grafik{inset:12px 12px 12px 4px !important;width:calc(100% - 16px) !important;height:calc(100% - 24px) !important}
          ${k} .kk-desk{display:none}
          ${k} .kk-mob{display:inline}
        }`;
}
