/* ============================================================
   GFS-Training – Knopf „GFS wählen“ (oben auf jeder Seite des Kurses)
   Steht im Kopf der Kursseite (/gfs-trainer) und im Kopf jeder Themenseite.
   Ablauf im Menü: 1. Klasse wählen → 2. alle GFS-Themen dieser Klasse;
   fertige Themen öffnen ihre Themenseite, die anderen klappen ihre
   Kurzbeschreibung auf („Themenseite folgt“).
   Ist die Klasse schon bekannt (Speicher mm_gfskurs), öffnet das Menü gleich
   bei ihren Themen – „← Klassen“ führt zurück zur Klassenwahl.
   Das Menü liegt per Portal im <body> (die Köpfe schneiden mit overflow:hidden ab)
   und scrollt mit der Seite.
   Kursseite: stufe/onStufe/onThema kommen aus ihrem Zustand (Teil 1 bleibt synchron);
   Themenseiten: der Knopf liest und schreibt den Speicher selbst.
   Daten: gfsKurs.js
   ============================================================ */
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { C } from "./base1.jsx";
import { STUFEN, stufeVon, stufeAusKlasse, THEMEN, themenFuer } from "./gfsKurs.js";

const SPEICHER = "mm_gfskurs";
const speicherLesen = () => {
  try {
    const s = JSON.parse(localStorage.getItem(SPEICHER) || "{}") || {};
    if (!s.stufe && typeof s.klasse === "number") s.stufe = stufeAusKlasse(s.klasse);
    return s;
  } catch (e) { return {}; }
};
const speicherSetzen = (teil) => {
  try { localStorage.setItem(SPEICHER, JSON.stringify({ ...speicherLesen(), ...teil })); } catch (e) { /* egal */ }
};
const stufenMarke = (st) => (st.id.startsWith("k") ? `K${st.id.slice(1)}` : st.id);

const Pfeilchen = ({ offen }) => (
  <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" style={{ flex: "none", transform: offen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
    <path d="M3.5 6l4.5 4.5L12.5 6" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Zurueck = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H4M7.5 4l-4 4 4 4" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Buch = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M2.5 3.2c1.9-.7 3.8-.6 5.5.6v9.3c-1.7-1.2-3.6-1.3-5.5-.6V3.2zM13.5 3.2c-1.9-.7-3.8-.6-5.5.6v9.3c1.7-1.2 3.6-1.3 5.5-.6V3.2z"
      stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
  </svg>
);

const STIL = `
  .gw{position:relative;flex:none}
  .gw-knopf{display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 12px 0 13px;border-radius:999px;cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:800;letter-spacing:-0.01em;white-space:nowrap;
    border:none;color:${C.nachtschwarz};background:linear-gradient(135deg,#FFE9A0 0%,${C.flaggold} 55%,${C.goldWarm} 100%);
    box-shadow:0 1px 0 rgba(255,255,255,0.5) inset,0 8px 18px -10px rgba(166,124,0,0.9);transition:transform .15s ease}
  .gw-knopf:active{transform:scale(0.97)}
  .gw-knopf:focus-visible,.gw-menue button:focus-visible{outline:3px solid ${C.flaggold};outline-offset:2px}
  .gw-menue{position:absolute;z-index:1200;display:flex;flex-direction:column;border-radius:20px;overflow:hidden;background:${C.nachtschwarz};color:${C.weiss};
    border:1px solid rgba(237,187,0,0.38);box-shadow:0 26px 52px -16px rgba(8,10,16,0.7),0 2px 8px rgba(8,10,16,0.3);animation:gwAuf .16s ease-out;font-family:Montserrat,sans-serif}
  .gw-kopf{flex:none;display:flex;align-items:center;gap:10px;padding:12px 12px 10px 14px;border-bottom:1px solid rgba(255,255,255,0.08);
    background:radial-gradient(70% 140% at 100% 0%,rgba(237,187,0,0.26) 0%,transparent 60%)}
  .gw-schritt{display:block;font-size:10.5px;font-weight:800;letter-spacing:0.09em;text-transform:uppercase;color:${C.flaggold}}
  .gw-titel{display:block;font-size:16px;font-weight:800;letter-spacing:-0.02em;line-height:1.2;margin-top:2px}
  .gw-zeile{display:block;font-size:11.5px;color:rgba(255,255,255,0.62);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .gw-klein{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:5px;height:30px;padding:0 10px;border-radius:999px;cursor:pointer;font-family:inherit;
    font-size:12px;font-weight:700;color:rgba(255,255,255,0.9);background:rgba(255,255,255,0.08);border:1px solid rgba(237,187,0,0.3)}
  .gw-zu{width:30px;padding:0}
  .gw-liste{list-style:none;margin:0;padding:6px;overflow-y:auto;overscroll-behavior:contain}
  .gw-stufe,.gw-thema{display:flex;align-items:center;gap:11px;width:100%;padding:9px 10px;border:none;border-radius:12px;background:none;cursor:pointer;font-family:inherit;text-align:left;color:${C.weiss}}
  @media (hover:hover){.gw-stufe:hover,.gw-thema:hover{background:rgba(237,187,0,0.12)}}
  .gw-stufe.gw-an,.gw-thema.gw-hier{background:rgba(237,187,0,0.14)}
  .gw-marke{flex:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;font-weight:800;font-size:13px;color:${C.nachtschwarz};
    background:linear-gradient(135deg,#FFE9A0 0%,${C.flaggold} 60%,${C.goldWarm} 100%)}
  .gw-name{display:block;font-size:14.5px;font-weight:700;line-height:1.25}
  .gw-zusatz{display:block;font-size:11.5px;color:rgba(255,255,255,0.6);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .gw-zahl{flex:none;display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;color:${C.flaggold}}
  .gw-zahl i{font-style:normal;min-width:22px;height:22px;padding:0 7px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.1)}
  .gw-kap{flex:none;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;font-weight:800;font-size:12px;font-style:italic;
    background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7)}
  .gw-fertig .gw-kap{background:linear-gradient(135deg,#FFE9A0 0%,${C.flaggold} 60%,${C.goldWarm} 100%);color:${C.nachtschwarz}}
  .gw-thema:not(.gw-fertig) .gw-name{color:rgba(255,255,255,0.78);font-weight:600}
  .gw-los{flex:none;display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 11px;border-radius:999px;font-size:12px;font-weight:800;color:${C.nachtschwarz};
    background:linear-gradient(135deg,#FFE9A0 0%,${C.flaggold} 60%,${C.goldWarm} 100%)}
  .gw-hier-marke{flex:none;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${C.flaggold}}
  .gw-bald{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;color:rgba(255,255,255,0.55);border:1px solid rgba(255,255,255,0.16)}
  .gw-mehr{padding:0 12px 10px 55px}
  .gw-mehr p{margin:0 0 6px;font-size:13.5px;line-height:1.5;color:rgba(255,255,255,0.82)}
  .gw-mehr span{display:inline-block;font-size:11px;font-weight:700;color:${C.flaggold};background:rgba(237,187,0,0.12);border-radius:999px;padding:3px 9px}
  @keyframes gwAuf{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.gw-menue{animation:none}.gw-knopf{transition:none}}
`;

/* Lage des Menüs: rechtsbündig unter dem Knopf, nie über den Rand (12 px Abstand) */
function lageBerechnen(knopf) {
  const r = knopf.getBoundingClientRect();
  const vw = document.documentElement.clientWidth, vh = window.innerHeight;
  const breite = Math.min(360, vw - 24);
  const links = Math.max(12, Math.min(r.right - breite, vw - 12 - breite));
  const hoehe = Math.max(260, Math.min(540, vh - r.bottom - 20));
  return { left: links + window.scrollX, top: r.bottom + 8 + window.scrollY, width: breite, maxHeight: hoehe };
}

/* stufe/onStufe/onThema: von der Kursseite (sonst Speicher). ansicht = die Themenseite, auf der der Knopf gerade steht */
export function GfsWahl({ gehe, ansicht, stufe: stufeVonAussen, onStufe, onThema }) {
  const hier = THEMEN.find((t) => t.ansicht && t.ansicht === ansicht) || null;
  const [offen, setOffen] = useState(false);
  const [schritt, setSchritt] = useState("klasse");   // "klasse" | "thema"
  const [stufe, setStufe] = useState(null);
  const [auf, setAuf] = useState(null);               // aufgeklappte Kurzbeschreibung
  const [lage, setLage] = useState(null);
  const knopfRef = useRef(null), menueRef = useRef(null);

  const oeffnen = () => {
    const bekannt = stufeVonAussen !== undefined ? stufeVonAussen : (hier ? hier.stufe : speicherLesen().stufe);
    const st = stufeVon(bekannt);
    setStufe(st ? st.id : null); setSchritt(st ? "thema" : "klasse"); setAuf(null);
    setLage(lageBerechnen(knopfRef.current)); setOffen(true);
  };
  const schliessen = (fokus) => { setOffen(false); if (fokus && knopfRef.current) knopfRef.current.focus(); };

  useEffect(() => {
    if (!offen) return undefined;
    const weg = (e) => {
      if (menueRef.current && menueRef.current.contains(e.target)) return;
      if (knopfRef.current && knopfRef.current.contains(e.target)) return;
      setOffen(false);
    };
    const taste = (e) => { if (e.key === "Escape") schliessen(true); };
    const neu = () => knopfRef.current && setLage(lageBerechnen(knopfRef.current));
    document.addEventListener("pointerdown", weg);
    document.addEventListener("keydown", taste);
    window.addEventListener("resize", neu);
    return () => { document.removeEventListener("pointerdown", weg); document.removeEventListener("keydown", taste); window.removeEventListener("resize", neu); };
  }, [offen]);

  /* Fokus beim Öffnen und bei jedem Schritt auf den ersten Eintrag */
  useLayoutEffect(() => {
    if (!offen || !menueRef.current) return;
    const ziel = menueRef.current.querySelector(".gw-an, .gw-hier, .gw-liste button");
    if (ziel) ziel.focus({ preventScroll: true });
  }, [offen, schritt, stufe]);

  const klasseWaehlen = (id) => {
    setStufe(id); setSchritt("thema"); setAuf(null);
    if (onStufe) onStufe(id); else speicherSetzen({ stufe: id });
  };
  const themaWaehlen = (t) => {
    if (!t.ansicht) { setAuf(auf === t.id ? null : t.id); return; }
    if (onThema) onThema(t); else speicherSetzen({ stufe: t.stufe, thema: t.id });
    setOffen(false);
    if (t.ansicht !== ansicht) gehe({ ansicht: t.ansicht });
  };

  const st = stufeVon(stufe);
  const liste = st ? themenFuer(st.id) : [];
  const fertigZahl = (id) => themenFuer(id).filter((t) => t.ansicht).length;

  const menue = offen && lage ? (
    <div ref={menueRef} className="gw-menue" data-gfs-wahl-menue={schritt} role="dialog" aria-label="GFS wählen"
      style={{ left: lage.left, top: lage.top, width: lage.width, maxHeight: lage.maxHeight }}>
      {schritt === "klasse" || !st ? (
        <>
          <div className="gw-kopf">
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="gw-schritt">Schritt 1 von 2</span>
              <span className="gw-titel">Welche Klasse?</span>
            </span>
            <button type="button" className="gw-klein gw-zu" onClick={() => schliessen(true)} aria-label="Schließen">
              <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
          <ul className="gw-liste">
            {STUFEN.map((x) => {
              const zahl = themenFuer(x.id).length, fertig = fertigZahl(x.id);
              return (
                <li key={x.id}>
                  <button type="button" className={`gw-stufe${x.id === stufe ? " gw-an" : ""}`} data-gfs-wahl-stufe={x.id} onClick={() => klasseWaehlen(x.id)}
                    aria-label={`${x.name}: ${zahl} Themen${fertig ? `, ${fertig} mit Themenseite` : ""}`}>
                    <span className="gw-marke" aria-hidden="true">{stufenMarke(x)}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="gw-name">{x.name}</span>
                      <span className="gw-zusatz">{x.zusatz || `${zahl} GFS-Themen`}</span>
                    </span>
                    <span className="gw-zahl" aria-hidden="true"><i>{zahl}</i></span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <>
          <div className="gw-kopf">
            <button type="button" className="gw-klein" onClick={() => { setSchritt("klasse"); setAuf(null); }} data-gfs-wahl-zurueck="">
              <Zurueck /> Klassen
            </button>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="gw-schritt">Schritt 2 von 2</span>
              <span className="gw-titel">{st.name}</span>
              <span className="gw-zeile">{liste.length} Themen · {fertigZahl(st.id)} fertig</span>
            </span>
            <button type="button" className="gw-klein gw-zu" onClick={() => schliessen(true)} aria-label="Schließen">
              <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
          <ul className="gw-liste" data-gfs-wahl-themen={st.id}>
            {/* fertige Themen zuerst, sonst Buchreihenfolge */}
            {[...liste.filter((t) => t.ansicht), ...liste.filter((t) => !t.ansicht)].map((t) => {
              const fertig = !!t.ansicht, istHier = hier && hier.id === t.id, mehr = auf === t.id;
              return (
                <li key={t.id}>
                  <button type="button" className={`gw-thema${fertig ? " gw-fertig" : ""}${istHier ? " gw-hier" : ""}`} data-gfs-wahl-thema={t.id}
                    onClick={() => themaWaehlen(t)} aria-expanded={fertig ? undefined : mehr} aria-current={istHier ? "page" : undefined}>
                    <span className="gw-kap" aria-hidden="true">{t.kapitel}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="gw-name">{t.kurz}</span>
                      <span className="gw-zusatz">{t.kapitelName}</span>
                    </span>
                    {istHier ? <span className="gw-hier-marke">Hier</span>
                      : fertig ? <span className="gw-los">Öffnen <span aria-hidden="true">→</span></span>
                        : <span className="gw-bald"><Pfeilchen offen={mehr} /></span>}
                  </button>
                  {!fertig && mehr && (
                    <div className="gw-mehr">
                      <p>{t.zeile}</p>
                      <span>Themenseite folgt</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  ) : null;

  return (
    <div className="gw">
      <style>{STIL}</style>
      <button ref={knopfRef} type="button" className="gw-knopf" data-gfs-wahl="" onClick={() => (offen ? schliessen(false) : oeffnen())}
        aria-haspopup="dialog" aria-expanded={offen} aria-label="GFS wählen: erst die Klasse, dann das Thema">
        <Buch /><span>GFS wählen</span><Pfeilchen offen={offen} />
      </button>
      {menue && typeof document !== "undefined" ? createPortal(menue, document.body) : null}
    </div>
  );
}
