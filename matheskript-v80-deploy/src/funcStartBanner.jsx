import React from "react";
import berg from "./assets/start/berg.jpg";
import bannerMobil from "./assets/start/banner-mobil.jpg";

/* Banner ganz oben auf der Startseite, bündig unter dem Header, randlos über die volle Breite.
   Maße nach den Vorlagen: Handy 615 × 511 (Quadrat-Grafik ohne Header), Breit 766 × 366.
   Alle Größen skalieren mit der Bühnenbreite (cqw). Die Bühne ist maximal 760 px breit
   und sitzt mittig; der Streifen dahinter ist durchgehend nachtblau. */

const PUNKTE = [
  "Mathe interaktiv entdecken",
  "Gezielt Aufgaben trainieren",
  "Rechenwege Schritt für Schritt",
  "In deinem Tempo lernen",
];

const GOLD = "#F2C84B";
const NACHT = "#0A1233";

const CSS = `
.sb-streifen { width: 100%; overflow: hidden; background: linear-gradient(120deg, #0B1640 0%, ${NACHT} 55%, #08102B 100%); }
.sb-wrap { container-type: inline-size; width: 100%; max-width: 760px; margin: 0 auto; }
.sb { position: relative; width: 100%; aspect-ratio: 766 / 366; overflow: hidden; color: #fff; }
.sb-bild { position: absolute; top: 0; right: 0; height: 100%; width: auto; max-width: none;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 9%);
  mask-image: linear-gradient(90deg, transparent 0%, #000 9%);
  pointer-events: none; user-select: none; }
.sb-text { position: relative; z-index: 1; height: 100%; box-sizing: border-box; padding: 2cqw 3.3cqw 0; }
.sb h1 { margin: 0; font-weight: 800; letter-spacing: -0.02em; line-height: 1; font-size: 6.5cqw; text-shadow: 0 2px 12px rgba(0,0,0,0.4); }
.sb h1 .gold { display: block; color: ${GOLD}; }
.sb .unter { margin: 1.6cqw 0 0; font-weight: 300; font-size: 4.7cqw; line-height: 1.15; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.4); }
.sb ul { list-style: none; margin: 2.6cqw 0 0; padding: 0; display: flex; flex-direction: column; gap: 1.33cqw; }
.sb li { display: flex; align-items: center; gap: 1.8cqw; font-size: 2.25cqw; font-weight: 400; line-height: 1.2; color: #F4F6FF; text-shadow: 0 1px 8px rgba(0,0,0,0.55); }
.sb .haken { flex: none; width: 3.5cqw; height: 3.5cqw; border-radius: 50%; background: ${GOLD};
  display: inline-flex; align-items: center; justify-content: center; }
.sb .haken svg { width: 56%; height: 56%; }
@media (min-width: 761px) {
  .sb-bild { -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 9%, #000 90%, transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0%, #000 9%, #000 90%, transparent 100%); }
}
.sb-mobil { display: none; }
@media (max-width: 559px) {
  .sb-wrap { display: none; }
  .sb-mobil { display: block; width: 100%; height: auto; }
  .sb-streifen { background: #0A1233; }
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
    <section className="sb-streifen" aria-label="Mythos Mathe">
      <style>{CSS}</style>
      <img className="sb-mobil" src={bannerMobil} draggable="false"
        alt="Mathe kann jeder verstehen. Hier lernst du wie! Mathe interaktiv entdecken, gezielt Aufgaben trainieren, Rechenwege Schritt für Schritt, in deinem Tempo lernen." />
      <div className="sb-wrap">
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
      </div>
    </section>
  );
}
