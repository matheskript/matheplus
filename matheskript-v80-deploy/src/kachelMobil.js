/* Gemeinsame Mobil-Regeln der Kurs-Kacheln auf der Startseite (Differentialrechnung,
   Vektoren, GFS, KI/Claude/Gemini). Gilt NUR unter 840 px (Handy); der Desktop
   (ab 840 px, siehe func10.jsx / func2.jsx) bleibt unverändert.

   Mobil:
   - Das Wort „KURS“ oben (kk-kicker) entfällt.
   - Überschrift deutlich größer (--tf), immer in der Zeilenzahl --zl (am Button gesetzt),
     damit Balken, Modul-Info und Bild bei allen Kacheln auf gleicher Höhe liegen.
   - Der Balken (kk-balken) läuft über die gesamte Breite der Kachel (linke Spalte = 63 %,
     Innenabstand links 16 px + rechts 10 px).
   - Modul-Info (kk-modul) und Bild (kk-grafik) rutschen unter den Balken.
   - „Kurs öffnen“ steht in einer Box mit abgerundeten Enden (kk-knopf). */

export function kachelMobilCss(klasse, gold, schrift = "clamp(19px, 5vw, 26px)") {
  const k = `.${klasse}`;
  return `
        ${k} .kk-mob{display:none}
        @media (max-width:839px){
          ${k}{--tf:${schrift};--bt:calc(14px + var(--zl,2) * 1.12 * var(--tf) + 24px);min-height:calc(var(--bt) + 150px) !important}
          ${k} .kk-kicker{display:none !important}
          ${k} p{margin-bottom:10px !important}
          ${k} h2{font-size:var(--tf) !important;line-height:1.12 !important;margin:0 !important;white-space:normal !important;overflow:visible !important;text-overflow:clip !important;min-height:calc(var(--zl,2) * 1.12 * var(--tf))}
          ${k} .kk-balken{position:relative;z-index:2;width:calc((100% + 26px) / 0.63) !important;height:3px !important;margin:9px 0 0 -16px !important;border-radius:0 !important}
          ${k} .kk-modul{top:var(--bt) !important}
          ${k} .kk-grafik{inset:calc(var(--bt) + 28px) 8px auto 6px !important;height:calc(100% - var(--bt) - 36px) !important}
          ${k} .kk-desk{display:none}
          ${k} .kk-mob{display:inline}
          ${k} .kk-knopf{align-self:flex-start;margin-top:auto !important;padding:8px 14px 8px 16px !important;border:1.6px solid ${gold};border-radius:999px;font-size:13.5px !important}
        }`;
}
