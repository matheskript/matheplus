import React from "react";

/* Banner ganz oben auf der Startseite, bündig unter dem Header, über die volle Breite.
   Hell: weißer Hintergrund, Text in Blau, Akzente in Gold. Rechts ein reduzierter Berg
   als SVG, nur in Blau und Gold (Weg zum Gipfel). Alle Größen skalieren mit der
   Bühnenbreite (cqw); die Bühne ist maximal 760 px breit und sitzt mittig. */

const PUNKTE = [
  "Mathe interaktiv entdecken",
  "Gezielt Aufgaben trainieren",
  "Rechenwege Schritt für Schritt",
  "In deinem Tempo lernen",
];

const GOLD = "#EDBB00";
const GOLD_HELL = "#F7D44A";
const BLAU = "#004D98";
const BLAU_TIEF = "#0E1E4A";
const BLAU_MITTEL = "#2563B8";
const BLAU_HELL = "#9DBDE8";
const BLAU_ZART = "#DCE8F7";

const CSS = `
.sb-streifen { width: 100%; overflow: hidden; background: #fff; border-bottom: 1px solid ${BLAU_ZART}; }
.sb-wrap { container-type: inline-size; width: 100%; max-width: 760px; margin: 0 auto; }
.sb { position: relative; width: 100%; aspect-ratio: 766 / 366; overflow: hidden; color: ${BLAU_TIEF}; }
.sb-berg { position: absolute; top: 0; right: 0; height: 100%; width: auto; pointer-events: none; user-select: none; }
.sb-text { position: relative; z-index: 1; height: 100%; box-sizing: border-box; padding: 2.2cqw 3.3cqw 0; }
.sb h1 { margin: 0; font-weight: 800; letter-spacing: -0.02em; line-height: 1; font-size: 6.5cqw; color: ${BLAU}; }
.sb h1 .gold { display: block; color: ${GOLD}; }
.sb .unter { margin: 1.6cqw 0 0; font-weight: 300; font-size: 4.7cqw; line-height: 1.15; color: ${BLAU_TIEF}; }
.sb ul { list-style: none; margin: 2.6cqw 0 0; padding: 0; display: flex; flex-direction: column; gap: 1.33cqw; }
.sb li { display: flex; align-items: center; gap: 1.8cqw; font-size: 2.25cqw; font-weight: 500; line-height: 1.2; color: ${BLAU_TIEF}; }
.sb .haken { flex: none; width: 3.5cqw; height: 3.5cqw; border-radius: 50%; background: ${GOLD};
  display: inline-flex; align-items: center; justify-content: center; }
.sb .haken svg { width: 56%; height: 56%; }
@media (max-width: 559px) {
  .sb { aspect-ratio: 766 / 400; }
  .sb-berg { height: 86%; top: auto; bottom: 0; right: 0; opacity: 0.92; }
  .sb h1 { font-size: 7.4cqw; }
  .sb .unter { font-size: 5.2cqw; }
  .sb li { font-size: 2.9cqw; }
  .sb .haken { width: 4.2cqw; height: 4.2cqw; }
}
`;

function Haken() {
  return (
    <span className="haken" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke={BLAU_TIEF} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.8l4.4 4.4L19 7.4" />
      </svg>
    </span>
  );
}

/* Reduzierter Berg: goldener Serpentinenweg, zwei Hügel im Hintergrund,
   zwei leichte Wolken. Nur Blau- und Goldtöne auf Weiß. */
const WEG = "M150 366 C 170 340, 330 338, 322 312 S 182 290, 190 266 S 316 250, 308 228 S 208 212, 214 192 S 296 180, 290 164 S 228 152, 236 140 S 268 142, 264 132";

function Berg() {
  return (
    <svg className="sb-berg" viewBox="0 0 400 366" aria-hidden="true" focusable="false">
      {/* Wolken */}
      <g fill="none" stroke={BLAU_HELL} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M140 150c-10 0-16-7-14-15 2-10 14-13 21-8 3-9 17-11 23-3 9-3 18 3 16 12 0 9-7 14-14 14H140z" />
        <path d="M352 196c-8 0-13-6-11-12 2-8 11-10 17-6 2-7 13-9 18-2 7-2 14 2 13 9 0 7-6 11-11 11h-26z" />
      </g>

      {/* Berge im Hintergrund */}
      <path d="M-10 366 L80 236 L130 276 L176 252 L230 310 L280 272 L400 366 Z" fill={BLAU_ZART} />
      <path d="M-10 366 L50 300 L96 330 L128 306 L190 366 Z" fill={BLAU_HELL} opacity="0.6" />

      {/* Hauptberg: breit, Gipfel bei (264|110) */}
      <path d="M60 366 L264 110 L400 366 Z" fill={BLAU} />
      {/* Schattenflanke rechts */}
      <path d="M264 110 L400 366 L286 366 L276 300 L302 252 L270 200 L288 160 Z" fill={BLAU_TIEF} />
      {/* Lichtflanke links */}
      <path d="M264 110 L236 160 L254 206 L216 258 L240 304 L204 366 L60 366 Z" fill={BLAU_MITTEL} />
      {/* Gipfelfacette */}
      <path d="M264 110 L236 160 L264 150 L288 160 Z" fill={BLAU_HELL} />

      {/* Weg zum Gipfel */}
      <path d={WEG} fill="none" stroke={GOLD} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d={WEG} fill="none" stroke={GOLD_HELL} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StartBanner() {
  return (
    <section className="sb-streifen" aria-label="Mythos Mathe">
      <style>{CSS}</style>
      <div className="sb-wrap">
        <div className="sb">
          <Berg />
          <div className="sb-text">
            <h1>
              Mathe kann
              <span className="gold">jeder verstehen</span>
            </h1>
            <p className="unter">Hier lernst du wie!</p>
            <ul>
              {PUNKTE.map((p) => (
                <li key={p}><Haken /><span>{p}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
