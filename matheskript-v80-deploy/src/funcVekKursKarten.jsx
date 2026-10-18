/* Werkzeug-Karten des Kurses Vektoren, Geraden und Ebenen – gleicher Aufbau wie
   funcDiffKursKarten.jsx (Kopf · Text · Knopf · Skizze), in Dunkelblau mit warmem Gold. */
import React from "react";
import { C } from "./base1.jsx";

const N = C.vkNacht, T = C.vkTief, L = C.vkBlau, H = C.vkHell, NB = C.vkNebel, G = C.vkGold;

export const KARTEN = {
  geraden2d: { art: "Rechnen und Üben", text: "Geraden in der Ebene: y = m · x + c aus Punkt und Steigung oder aus zwei Punkten – der Start, bevor es mit Gleichungssystemen in den Raum geht." },
  lgs: { art: "Rechnen und Üben", text: "Drei Gleichungen, drei Unbekannte: Du löst mit dem Gauß-Verfahren Schritt für Schritt und siehst, wann es keine, eine oder unendlich viele Lösungen gibt." },
  vektorgenerator: { art: "Trainieren", text: "Addieren, Vervielfachen, Linearkombination und Skalarprodukt – immer neue Beispiele, jeweils mit vollständigem Rechenweg." },
  zweipunkte: { art: "Rechnen und Üben", text: "Aus zwei Punkten wird eine Gerade: Stützvektor plus Vielfaches des Richtungsvektors – auf zwei Wegen, mit Bild." },
  dreipunkte: { art: "Rechnen und Üben", text: "Drei Punkte legen eine Ebene fest: Parameterform, Normalenvektor über das Kreuzprodukt und Koordinatenform – drei Wege im Vergleich." },
  ebenen: { art: "Entdecken", text: "Du gibst eine Ebene in Koordinatenform ein und drehst sie live im Raum – mit Spurpunkten und Spurgeraden." },
  geraden: { art: "Entdecken und Üben", text: "Punktprobe und Lage zweier Geraden: schneidend, parallel, identisch oder windschief – mit 3D-Bild." },
  winkel: { art: "Entdecken und Üben", text: "Was das Skalarprodukt über den Winkel verrät: senkrecht prüfen und Winkel zwischen Vektoren berechnen." },
  kreuzprodukt: { art: "Rechnen", text: "Zwei Vektoren eingeben – Formel, eingesetzte Zahlen und Ergebnis. Der neue Vektor steht auf beiden senkrecht." },
  ebenevsebene: { art: "Entdecken und Üben", text: "Zwei Ebenen im Raum: Schnittgerade, Schnittwinkel oder parallel – Schritt für Schritt und im Bild." },
  abstaende: { art: "Rechnen und Üben", text: "Punkt, Gerade, Ebene – jede Kombination: Lotfußpunkt, Hessesche Normalform und Abstand windschiefer Geraden, jeweils mit 3D-Bild." },
};

/* ---------- Kleine Skizzen ---------- */
const Achsen = () => (
  <path d="M40 78 V16 M40 78 H112 M40 78 L14 98" stroke="rgba(6,18,46,0.28)" strokeWidth="1.4" fill="none" />
);
const Pfeil = ({ x1, y1, x2, y2, f = N, b = 2.6 }) => {
  const w = Math.atan2(y2 - y1, x2 - x1), s = 7;
  const p = (d) => `${x2 - s * Math.cos(w + d)},${y2 - s * Math.sin(w + d)}`;
  return <g><line x1={x1} y1={y1} x2={x2 - 3 * Math.cos(w)} y2={y2 - 3 * Math.sin(w)} stroke={f} strokeWidth={b} strokeLinecap="round" /><polygon points={`${x2},${y2} ${p(0.45)} ${p(-0.45)}`} fill={f} /></g>;
};
const Ebene = ({ d = "M22 88 L92 74 L114 30 L44 44 Z" }) => <path d={d} fill="rgba(36,87,197,0.16)" stroke={L} strokeWidth="1.4" />;

const BILDER = {
  geraden2d: () => (<><path d="M14 80 H114 M30 96 V8" stroke="rgba(6,18,46,0.3)" strokeWidth="1.3" /><line x1="18" y1="92" x2="110" y2="18" stroke={N} strokeWidth="2.8" strokeLinecap="round" /><line x1="14" y1="40" x2="114" y2="70" stroke={L} strokeWidth="2.8" strokeLinecap="round" /><circle cx="64" cy="55" r="5" fill={G} stroke="#fff" strokeWidth="1.5" /></>),
  lgs: () => (<><text x="18" y="32" fontSize="13" fontWeight="700" fill={N} fontFamily="Montserrat, sans-serif">I</text><text x="14" y="56" fontSize="13" fontWeight="700" fill={N} fontFamily="Montserrat, sans-serif">II</text><text x="10" y="80" fontSize="13" fontWeight="700" fill={N} fontFamily="Montserrat, sans-serif">III</text>
    <path d="M36 22 H110 M50 46 H110 M64 70 H110" stroke={L} strokeWidth="5" strokeLinecap="round" /><path d="M36 46 H44 M36 70 H44 M50 70 H58" stroke={H} strokeWidth="5" strokeLinecap="round" /><circle cx="104" cy="92" r="5" fill={G} /></>),
  vektorgenerator: () => (<><Achsen /><Pfeil x1={40} y1={78} x2={78} y2={50} /><Pfeil x1={78} y1={50} x2={104} y2={60} f={L} /><Pfeil x1={40} y1={78} x2={104} y2={60} f={G} b={2.2} /></>),
  zweipunkte: () => (<><Achsen /><line x1="10" y1="90" x2="118" y2="20" stroke={N} strokeWidth="2.6" strokeLinecap="round" /><circle cx="44" cy="68" r="4.5" fill={L} /><circle cx="88" cy="39.5" r="4.5" fill={L} /><Pfeil x1={44} y1={68} x2={86} y2={41} f={G} b={2.2} /></>),
  dreipunkte: () => (<><Ebene /><circle cx="40" cy="72" r="4.5" fill={N} /><circle cx="90" cy="64" r="4.5" fill={N} /><circle cx="78" cy="42" r="4.5" fill={N} /><path d="M40 72 L90 64 L78 42 Z" fill="none" stroke={G} strokeWidth="1.8" /></>),
  ebenen: () => (<><Achsen /><Ebene d="M18 92 L60 74 L104 30 L58 44 Z" /><circle cx="40" cy="58" r="3.5" fill={G} /><circle cx="18" cy="92" r="3.5" fill={G} /><circle cx="104" cy="30" r="3.5" fill={G} /></>),
  geraden: () => (<><Achsen /><line x1="12" y1="30" x2="116" y2="90" stroke={N} strokeWidth="2.6" strokeLinecap="round" /><line x1="22" y1="96" x2="104" y2="14" stroke={L} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="0" /><circle cx="64" cy="60" r="5" fill={G} stroke="#fff" strokeWidth="1.5" /></>),
  winkel: () => (<><Pfeil x1={30} y1={84} x2={112} y2={84} /><Pfeil x1={30} y1={84} x2={84} y2={20} f={L} /><path d="M58 84 A28 28 0 0 0 48 63" stroke={G} strokeWidth="2.4" fill="none" /><text x="62" y="76" fontSize="13" fontStyle="italic" fontWeight="700" fill={T} fontFamily="Montserrat, sans-serif">φ</text></>),
  kreuzprodukt: () => (<><Ebene d="M16 92 L84 80 L112 50 L44 62 Z" /><Pfeil x1={58} y1={74} x2={98} y2={68} /><Pfeil x1={58} y1={74} x2={40} y2={66} f={L} /><Pfeil x1={58} y1={74} x2={60} y2={14} f={G} b={2.8} /></>),
  ebenevsebene: () => (<><Ebene d="M10 86 L84 86 L116 46 L42 46 Z" /><path d="M40 98 L58 20 L92 8 L76 88 Z" fill="rgba(242,193,78,0.22)" stroke={G} strokeWidth="1.4" /><line x1="50" y1="66" x2="84" y2="66" stroke={N} strokeWidth="2.8" strokeLinecap="round" /></>),
  abstaende: () => (<><Ebene d="M10 92 L84 92 L116 56 L42 56 Z" /><circle cx="64" cy="18" r="5" fill={N} /><line x1="64" y1="22" x2="64" y2="72" stroke={G} strokeWidth="2.2" strokeDasharray="4 3" /><circle cx="64" cy="74" r="4" fill={L} /><text x="70" y="50" fontSize="13" fontStyle="italic" fontWeight="700" fill={T} fontFamily="Montserrat, sans-serif">d</text></>),
};

function KartenBild({ id, titel }) {
  const Bild = BILDER[id];
  return (
    <svg role="img" aria-label={titel} viewBox="0 0 128 104" preserveAspectRatio="xMidYMid meet" style={{ display: "block", width: "100%", height: "100%" }}>
      {Bild ? <Bild /> : <Pfeil x1={30} y1={80} x2={100} y2={24} />}
    </svg>
  );
}

/* ---------- Die Karte ---------- */
const CSS = `
.vkk{position:relative;display:grid;grid-template-columns:240px minmax(0,1fr) 172px;grid-template-rows:auto 1fr;grid-template-areas:"kopf text bild" "knopf text bild";
  column-gap:18px;row-gap:12px;min-height:140px;padding:16px;border-radius:22px;background:#fff;border:1.5px solid ${C.linie};box-shadow:0 4px 20px rgba(6,18,46,.07);
  cursor:pointer;transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;box-sizing:border-box}
@media (hover:hover){.vkk:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(13,39,102,.16);border-color:${L}}}
.vkk-kopf{grid-area:kopf;display:flex;align-items:flex-start;gap:12px;min-width:0}
.vkk-titel{font-size:15.5px;font-weight:800;letter-spacing:-0.01em;line-height:1.22;color:${N};margin:0;overflow-wrap:break-word}
.vkk-art{font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${T};margin:0 0 3px}
.vkk-text{grid-area:text;align-self:center;margin:0;font-size:13.5px;line-height:1.55;color:#26314C}
.vkk-knopf-feld{grid-area:knopf;display:flex;align-items:flex-end}
.vkk-bild{grid-area:bild;align-self:stretch;min-height:108px;border-radius:16px;overflow:hidden;border:1.5px solid ${H};padding:6px;box-sizing:border-box;
  background-image:linear-gradient(rgba(36,87,197,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(36,87,197,.12) 1px,transparent 1px),linear-gradient(150deg,#fff 0%,${NB} 100%);
  background-size:18px 18px,18px 18px,auto}
.vkk-knopf{position:relative;display:inline-flex;align-items:center;gap:12px;padding:6px 6px 6px 18px;border:0;border-radius:999px;cursor:pointer;font-family:inherit;font-weight:800;font-size:14px;letter-spacing:.01em;color:#fff;
  background:linear-gradient(135deg,${L} 0%,${T} 100%);box-shadow:0 8px 18px rgba(36,87,197,.42), inset 0 1px 0 rgba(255,255,255,.25);
  transition:transform .16s ease, box-shadow .16s ease, background .2s ease, color .2s ease}
.vkk-knopf .vkk-pfeil{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:${G};color:${N};transition:transform .2s ease, background .2s ease}
@media (hover:hover){.vkk-knopf:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(36,87,197,.55), inset 0 1px 0 rgba(255,255,255,.3)}
  .vkk-knopf:hover .vkk-pfeil{transform:translateX(3px) rotate(-8deg)}}
.vkk-knopf:active{transform:scale(.96)}
.vkk-knopf:focus-visible{outline:3px solid ${G};outline-offset:3px}
.vkk-knopf[aria-expanded="true"]{background:${N};color:#fff;box-shadow:0 8px 18px rgba(6,18,46,.35)}
.vkk-knopf[aria-expanded="true"] .vkk-pfeil{background:${H};color:${N}}
@media (max-width:820px){
  .vkk{grid-template-columns:minmax(0,1fr) 150px;grid-template-rows:auto auto auto;grid-template-areas:"kopf bild" "text text" "knopf knopf";column-gap:14px}
  .vkk-bild{min-height:100px;height:100%}
  .vkk-text{margin:2px 0}
}
@media (max-width:560px){
  .vkk{grid-template-columns:minmax(0,1fr) 142px;grid-template-rows:auto 1fr auto;grid-template-areas:"kopf bild" "text bild" "text knopf";padding:14px;column-gap:12px;row-gap:10px}
  .vkk-zeichen{display:none}
  .vkk-text{align-self:start;margin:0;font-size:13px}
  .vkk-knopf-feld{align-self:end}
  .vkk-knopf{width:100%;justify-content:space-between;gap:6px;padding:5px 5px 5px 13px;font-size:12.5px;box-sizing:border-box;white-space:nowrap}
  .vkk-knopf .vkk-pfeil{width:28px;height:28px;flex:none}
}
@media (prefers-reduced-motion:reduce){.vkk,.vkk-knopf,.vkk-pfeil{transition:none !important}}
`;

export function WerkzeugKarte({ id, t, an, oeffnen, schliessen, Zeichen }) {
  const info = KARTEN[id] || {};
  const klick = () => (an ? schliessen() : oeffnen(id));
  return (
    <div className="vkk" role="group" aria-label={t.titel} onClick={(e) => { if (!e.target.closest("button")) klick(); }}>
      <div className="vkk-kopf">
        <span className="vkk-zeichen"><Zeichen text={t.zeichen} /></span>
        <div style={{ minWidth: 0 }}>
          {info.art && <p className="vkk-art">{info.art}</p>}
          <p className="vkk-titel" style={t.titel.split(" ").some((wort) => wort.length > 17) ? { fontSize: 14 } : undefined}>{t.titel}</p>
        </div>
      </div>
      <p className="vkk-text">{info.text || t.zeile}</p>
      <div className="vkk-knopf-feld">
        <button type="button" className="vkk-knopf" onClick={(e) => { e.stopPropagation(); klick(); }} aria-haspopup="dialog" aria-expanded={an}>
          <span>{an ? "Schließen" : "Jetzt öffnen"}</span>
          <span className="vkk-pfeil" aria-hidden="true">
            {an
              ? <svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
              : <svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </span>
        </button>
      </div>
      <div className="vkk-bild"><KartenBild id={id} titel={`Skizze zu ${t.titel}`} /></div>
    </div>
  );
}

export function KartenStil() { return <style>{CSS}</style>; }
