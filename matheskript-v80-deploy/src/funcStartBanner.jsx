import React from "react";
import { C } from "./base1.jsx";
import berg from "./assets/start/berg.jpg";

/* Banner ganz oben auf der Startseite (unter dem Header).
   Breites Format ab 560 px Viewport-Breite, quadratisches Format auf dem Handy.
   Alle Größen skalieren mit der Banner-Breite (Container-Query-Einheiten cqw). */

const PUNKTE = [
  "Mathe interaktiv entdecken",
  "Gezielt Aufgaben trainieren",
  "Rechenwege Schritt für Schritt",
  "In deinem Tempo lernen",
];

const CSS = `
.sb-wrap { container-type: inline-size; width: 100%; }
.sb {
  position: relative; overflow: hidden; border-radius: 18px;
  background: linear-gradient(135deg, #0B1840 0%, #0A1236 55%, #070D26 100%);
  box-shadow: 0 6px 26px rgba(8, 16, 42, 0.28);
  aspect-ratio: 766 / 411; color: #fff;
}
.sb-bild {
  position: absolute; top: 0; right: 0; height: 100%; width: auto; max-width: none;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 34%);
  mask-image: linear-gradient(90deg, transparent 0%, #000 34%);
  pointer-events: none; user-select: none;
}
.sb-text { position: relative; z-index: 1; height: 100%; box-sizing: border-box; padding: 4.6cqw 4.2cqw 3.6cqw; display: flex; flex-direction: column; }
.sb h1 { margin: 0; font-weight: 800; letter-spacing: -0.025em; line-height: 1.04; font-size: 6.4cqw; text-shadow: 0 2px 14px rgba(0,0,0,0.35); }
.sb h1 .gold { display: block; color: ${C.flaggold}; }
.sb .unter { margin: 1.6cqw 0 0; font-weight: 300; font-size: 4.6cqw; line-height: 1.15; color: #fff; }
.sb ul { list-style: none; margin: auto 0 0; padding: 0; display: flex; flex-direction: column; gap: 1.55cqw; }
.sb li { display: flex; align-items: center; gap: 1.7cqw; font-size: 2.35cqw; font-weight: 400; line-height: 1.2; color: #F2F5FF; }
.sb .haken { flex: none; width: 3.6cqw; height: 3.6cqw; border-radius: 50%; background: ${C.flaggold};
  display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 0 0 0.25cqw rgba(237,187,0,0.25); }
.sb .haken svg { width: 58%; height: 58%; }
@media (max-width: 559px) {
  .sb { aspect-ratio: 615 / 599; border-radius: 20px; }
  .sb-bild { width: 62%; object-fit: cover; object-position: 55% 20%;
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 42%); mask-image: linear-gradient(90deg, transparent 0%, #000 42%); }
  .sb-text { padding: 6.4cqw 5.8cqw 5.4cqw; }
  .sb h1 { font-size: 8.2cqw; }
  .sb .unter { font-size: 6cqw; margin-top: 2.6cqw; }
  .sb ul { gap: 3.2cqw; }
  .sb li { font-size: 3.9cqw; gap: 3.2cqw; }
  .sb .haken { width: 6.6cqw; height: 6.6cqw; }
}
`;

function Haken() {
  return (
    <span className="haken" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="#0E1E4A" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.8l4.4 4.4L19 7.4" />
      </svg>
    </span>
  );
}

export default function StartBanner() {
  return (
    <section className="sb-wrap" aria-label="Mythos Mathe" style={{ paddingTop: 18, paddingBottom: 6 }}>
      <style>{CSS}</style>
      <div className="sb">
        <img className="sb-bild" src={berg} alt="" aria-hidden="true" draggable="false" />
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
    </section>
  );
}
