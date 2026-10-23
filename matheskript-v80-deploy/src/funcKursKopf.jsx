/* ============================================================
   Gemeinsame Bausteine der Kursseiten (Differentialrechnung, Vektoren,
   GFS, Mathe mit KI lernen) – dieselbe Gestaltung „Lack und Goldfolie“ wie
   die Startseiten-Kacheln (funcKursKachel.jsx), Farben aus kursFarben.js.

     KursKopf         lackierter Kopf mit Titel, Zeile, Fakten-Chips und Motiv
     FortschrittKarte dunkle Karte mit Ring, Stand und „Weiter mit …“ – liegt
                      ein Stück über der Unterkante des Kopfes
     KapitelKopf      Kapitel-Plakette, Titel, Linie
     ModulKarte       eine Zeile der Modulliste (Plakette, Titel, Fakten, Haken)
     Hinweis          kurzer erklärender Absatz

   Die Stilregeln (Klassen ks-…) kommen einmal in den <head>.
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";

const STIL_ID = "ks-stil";
const STIL = `
  .ks-kopf{position:relative;overflow:hidden;color:var(--ks-titel);background:var(--ks-lack)}
  .ks-kopf::before{content:"";position:absolute;inset:0;pointer-events:none;
    background:linear-gradient(118deg,var(--ks-glanz) 0%,transparent 40%),radial-gradient(60% 80% at 100% 90%,var(--ks-schein) 0%,transparent 60%)}
  .ks-kopf-innen{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 42%;grid-template-rows:auto 1fr;column-gap:10px;align-items:end;padding-top:30px;padding-bottom:50px}
  .ks-kopf-text{grid-column:1;grid-row:2;min-width:0;padding-bottom:6px;align-self:end}
  .ks-titel{grid-column:1 / -1;grid-row:1;margin:0;font-size:clamp(28px,8vw,40px);font-weight:800;letter-spacing:-0.035em;line-height:1.04;text-wrap:balance;color:var(--ks-titel)}
  .ks-zeile{margin:10px 0 0;font-size:15px;line-height:1.55;color:var(--ks-text);max-width:38ch}
  .ks-chips{list-style:none;margin:14px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
  .ks-chips li{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:-0.01em;white-space:nowrap;
    color:var(--ks-titel);background:var(--ks-chip);border:1px solid var(--ks-chiprand)}
  .ks-chips svg{width:13px;height:13px;flex:none}
  .ks-motiv{grid-column:2;grid-row:2;width:calc(100% + 30px);height:auto;margin:6px -22px -2px 0;align-self:end;justify-self:end;overflow:visible}
  .ks-kopf-flach .ks-kopf-innen{padding-bottom:26px}
  .ks-oben{position:relative;z-index:2;display:flex;justify-content:flex-end;padding-top:16px}
  .ks-mit-oben .ks-kopf-innen{padding-top:12px}
  .ks-kopf-kompakt .ks-kopf-innen{padding-top:22px;padding-bottom:20px;grid-template-columns:minmax(0,1fr)}
  .ks-kopf-kompakt .ks-titel{font-size:clamp(22px,6vw,28px)}
  .ks-kopf-kompakt .ks-zeile{margin-top:6px;font-size:14px}
  .ks-kopf-kompakt .ks-motiv,.ks-kopf-kompakt .ks-chips{display:none}
  .ks-kurve{height:24px;background:${C.sand};border-radius:24px 24px 0 0;position:relative}
  /* buendig: größerer Radius (36) – Inhalt darunter rückt 20 px hoch, Karten mit Radius 20 und 16 px Rand liegen dann konzentrisch zur Kurve */
  .ks-kopf-buendig .ks-kurve{height:36px;border-radius:36px 36px 0 0}
  .ks-kopf-buendig.ks-kopf-kompakt .ks-kopf-innen{padding-bottom:10px}
  .ks-titelzeile{grid-column:1 / -1;grid-row:1;display:flex;align-items:flex-start;gap:12px;min-width:0}
  .ks-titelzeile .ks-titel{flex:1;min-width:0;hyphens:auto;-webkit-hyphens:auto;overflow-wrap:break-word}
  .ks-zeile-eine{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:none}
  .ks-kopf-kompakt .ks-zeile-eine{font-size:13px;margin-top:8px}
  /* kompakt mit Aktion: Knopf rechts über Titel UND Zeile (vertikal mittig), damit er die Titelzeile nicht aufbläht */
  .ks-kopf-kompakt.ks-mit-aktion .ks-kopf-innen{grid-template-columns:minmax(0,1fr) auto;align-items:center}
  .ks-kopf-kompakt.ks-mit-aktion .ks-titelzeile{display:contents}
  .ks-kopf-kompakt.ks-mit-aktion .ks-titel{grid-column:1;grid-row:1;align-self:end}
  .ks-kopf-kompakt.ks-mit-aktion .ks-kopf-text{grid-column:1;grid-row:2;align-self:start;padding-bottom:0}
  .ks-kopf-kompakt.ks-mit-aktion .ks-aktion{grid-column:2;grid-row:1 / span 2;align-self:center;margin-top:0}
  .ks-kopf-kompakt.ks-mit-aktion .ks-zeile-eine{margin-top:4px}
  .ks-aktion{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;width:50px;height:50px;margin-top:-2px;border-radius:15px;cursor:pointer;font-family:inherit;
    color:var(--ks-titel);background:var(--ks-chip);border:1px solid var(--ks-chiprand);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
    box-shadow:0 1px 0 rgba(255,255,255,0.16) inset,0 10px 22px -14px rgba(0,0,0,0.6);transition:transform .15s ease,background .15s ease}
  .ks-aktion svg{width:19px;height:19px;color:var(--ks-akzent)}
  .ks-aktion span{font-size:9.5px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;line-height:1}
  .ks-aktion:active{transform:scale(0.96)}
  .ks-aktion:focus-visible{outline:3px solid var(--ks-akzent);outline-offset:3px}
  @media (hover:hover){.ks-aktion:hover{transform:translateY(-1px);background:rgba(255,255,255,0.18)}}
  .ks-fortschritt{position:relative;z-index:2;margin:-48px 0 22px;padding:18px 18px 16px;border-radius:22px;color:var(--ks-dunkeltext);
    border:1px solid transparent;background:var(--ks-dunkel) padding-box,var(--ks-rand) border-box;
    box-shadow:0 1px 0 rgba(255,255,255,0.14) inset,0 24px 48px -20px rgba(8,14,32,0.75),0 2px 8px rgba(8,14,32,0.18)}
  .ks-fortschritt-kopf{display:flex;align-items:center;gap:16px}
  .ks-ring{position:relative;flex:none;width:72px;height:72px}
  .ks-ring svg{position:absolute;inset:0;transform:rotate(-90deg)}
  .ks-ring-zahl{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:19px;letter-spacing:-0.03em;line-height:1}
  .ks-ring-zahl small{font-size:11px;font-weight:700;opacity:.7;margin-left:1px}
  .ks-fortschritt-text{min-width:0;flex:1}
  .ks-fortschritt-label{margin:0;font-size:12px;font-weight:700;letter-spacing:0.02em;opacity:.72}
  .ks-fortschritt-stand{margin:3px 0 0;font-size:17px;font-weight:800;letter-spacing:-0.02em;line-height:1.2}
  .ks-fortschritt-zusatz{margin:5px 0 0;font-size:13px;line-height:1.5;opacity:.86}
  .ks-weiter{margin-top:14px;width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:46px;padding:10px 16px 10px 18px;border-radius:999px;border:none;cursor:pointer;
    background:var(--ks-dunkelknopf);color:var(--ks-dunkelknopftext);font-family:inherit;font-weight:800;font-size:14.5px;text-align:left;letter-spacing:-0.01em;
    box-shadow:0 10px 24px -10px rgba(0,0,0,0.55),0 1px 0 rgba(255,255,255,0.35) inset;transition:transform .15s ease,box-shadow .15s ease}
  .ks-weiter-text{min-width:0;display:flex;flex-direction:column;gap:1px}
  .ks-weiter-label{display:block;font-size:12px;font-weight:700;letter-spacing:0.02em;opacity:.78}
  .ks-weiter-ziel{display:block;font-size:15px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ks-weiter-text > span:only-child{font-size:14.5px;opacity:1}
  .ks-weiter svg{flex:none;transition:transform .18s ease}
  .ks-weiter:active{transform:scale(0.99)}
  @media (hover:hover){.ks-weiter:hover{transform:translateY(-1px)}.ks-weiter:hover svg{transform:translateX(3px)}}
  .ks-weiter:focus-visible,.ks-modul:focus-visible,.ks-medaille:focus-visible{outline:3px solid ${C.flaggold};outline-offset:3px}
  .ks-hinweis{margin:0 4px 22px;font-size:14.5px;line-height:1.65;color:${C.grau};max-width:62ch}
  .ks-kapitel{display:flex;align-items:center;gap:10px;margin:0 2px 10px;min-width:0}
  .ks-kapitel-marke{flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:30px;padding:0 8px;border-radius:9px;font-size:12.5px;font-weight:800;letter-spacing:0.04em;
    background:var(--ks-badge);color:var(--ks-badgetext)}
  .ks-kapitel h2{margin:0;font-size:17px;font-weight:700;letter-spacing:-0.015em;color:${C.tinte};min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ks-kapitel-linie{flex:1;height:1px;background:${C.linie};min-width:18px}
  .ks-liste{display:grid;gap:10px;margin-bottom:26px}
  .ks-modul{display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;padding:12px 14px 12px 12px;border-radius:18px;cursor:pointer;text-align:left;font-family:inherit;
    background:${C.weiss};border:1px solid ${C.linie};box-shadow:0 1px 2px rgba(15,26,51,0.04),0 6px 18px -10px rgba(15,26,51,0.14);transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease}
  .ks-modul-ok{border-color:var(--ks-liniefertig)}
  @media (hover:hover){.ks-modul:hover{transform:translateY(-1px);box-shadow:0 1px 2px rgba(15,26,51,0.04),0 12px 26px -12px rgba(15,26,51,0.24)}}
  .ks-medaille{flex:none;display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:14px;padding:0;border:none;cursor:pointer;font-family:inherit;
    background:var(--ks-medaille);color:var(--ks-medailletext);font-weight:800;font-size:18px;letter-spacing:-0.02em;transition:background .15s ease,color .15s ease}
  .ks-medaille-klein{font-size:12.5px;letter-spacing:0.02em}
  .ks-modul-ok .ks-medaille{background:var(--ks-fertig);color:var(--ks-fertigtext)}
  .ks-modul-text{flex:1;min-width:0}
  .ks-modul-titel{display:block;font-weight:700;font-size:15.5px;line-height:1.3;color:${C.tinte};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ks-modul-meta{display:flex;align-items:center;gap:12px;margin-top:4px;font-size:12.5px;color:${C.grau};white-space:nowrap;overflow:hidden}
  .ks-modul-meta span{display:inline-flex;align-items:center;gap:4px}
  .ks-modul-meta svg{width:14px;height:14px;flex:none}
  /* Handy/Tablet: Modulzeilen passen in die Breite – Titel und Angaben brechen um, statt die Seite breiter zu machen (vorher 436 px bei 360/390) */
  @media (max-width:839px){.ks-liste{grid-template-columns:minmax(0,1fr)}.ks-modul{min-width:0}
    .ks-modul-titel{white-space:normal;overflow-wrap:break-word}.ks-modul-meta{flex-wrap:wrap;white-space:normal;gap:4px 12px}}
  .ks-haken{flex:none;display:inline-flex;width:24px;height:24px;border-radius:12px;align-items:center;justify-content:center;border:1.5px solid ${C.linie};color:${C.hellgrau}}
  .ks-modul-ok .ks-haken{border-color:transparent;background:var(--ks-fertig);color:var(--ks-fertigtext)}
  @media (min-width:840px){.ks-kopf-innen{grid-template-columns:minmax(0,1fr) 34%;grid-template-rows:auto auto;padding-top:44px;padding-bottom:58px;column-gap:24px}
    .ks-titel{grid-column:1;font-size:44px}.ks-kopf-kompakt .ks-kopf-innen{padding-top:26px;padding-bottom:22px}.ks-kopf-kompakt .ks-titel{font-size:30px}.ks-motiv{grid-row:1 / span 2;width:calc(100% + 28px);max-width:300px;margin:0 -16px -4px 0}.ks-zeile{font-size:16px;margin-top:14px}
    .ks-oben{padding-top:22px}.ks-mit-oben .ks-kopf-innen{padding-top:18px}
    .ks-fortschritt{padding:22px 22px 20px}.ks-fortschritt-kopf{gap:20px}.ks-ring{width:80px;height:80px}.ks-ring-zahl{font-size:21px}.ks-fortschritt-stand{font-size:18px}}
  @media (prefers-reduced-motion:reduce){.ks-weiter,.ks-weiter svg,.ks-modul,.ks-medaille{transition:none}.ks-weiter:hover,.ks-modul:hover{transform:none}}
`;

function stilSetzen() {
  if (typeof document === "undefined" || document.getElementById(STIL_ID)) return;
  const el = document.createElement("style");
  el.id = STIL_ID;
  el.textContent = STIL;
  document.head.appendChild(el);
}

export function kursVars(f) {
  return {
    "--ks-lack": f.lack, "--ks-rand": f.rand, "--ks-glanz": f.glanz, "--ks-schein": f.schein, "--ks-titel": f.titel, "--ks-text": f.text, "--ks-akzent": f.akzent,
    "--ks-chip": f.chip, "--ks-chiprand": f.chipRand, "--ks-dunkel": f.dunkel, "--ks-dunkeltext": f.dunkelText, "--ks-ring": f.ring, "--ks-ringspur": f.ringSpur,
    "--ks-dunkelknopf": f.dunkelKnopf, "--ks-dunkelknopftext": f.dunkelKnopfText, "--ks-medaille": f.medaille, "--ks-medailletext": f.medailleText,
    "--ks-fertig": f.fertig, "--ks-fertigtext": f.fertigText, "--ks-badge": f.badge, "--ks-badgetext": f.badgeText, "--ks-liniefertig": f.linieFertig,
  };
}

/* ---------- Icons ---------- */
export const IconBuch = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5C4.7 19 4 18.3 4 17.5zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5c.8 0 1.5-.7 1.5-1.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
);
export const IconWerkzeug = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6.2a4 4 0 0 0 4.9 4.9l-9.3 9.3a2.2 2.2 0 0 1-3.1-3.1l9.3-9.3a4 4 0 0 0-1.8-1.8z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" /></svg>
);
export const IconVideo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M10.2 9.6v4.8l4.2-2.4z" fill="currentColor" /></svg>
);
export const IconAufgabe = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6.5h14M5 12h9M5 17.5h11" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
);
export const IconUhr = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M12 8v4.4l2.8 1.8" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>
);
const Pfeil = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Haekchen = () => (
  <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2l2.4 2.4 4.6-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Chevron = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5l4.5 4.5L6 12.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/* ---------- Kopf ---------- */
/* chips = [{ icon, text }, …] – die Fakten des Kurses (Module, Kapitel, Lesen und Trainieren …) */
/* kompakt = in der Modulansicht: nur Titel und Zeile, ohne Chips und Motiv. flach = ohne Fortschrittskarte darunter */
/* aktion = { text, label, icon, onClick }: Knopf oben rechts neben dem Titel. einzeilig = Zeile nie umbrechen. buendig = Kurve mit Radius 36 (konzentrische Karten)
   oben = Element in einer eigenen Zeile über dem Titel, rechtsbündig (z. B. „GFS wählen“ im GFS-Training) */
export function KursKopf({ farben, Motiv, id, titel, zeile, chips = [], kompakt, flach, kennung, aktion, einzeilig, buendig, oben }) {
  React.useInsertionEffect(stilSetzen, []);
  const zeileRef = React.useRef(null);
  /* einzeilig: Schrift schrittweise verkleinern (bis 11 px), bis die Zeile passt; Auslassungspunkte nur als letzte Rettung */
  React.useLayoutEffect(() => {
    const el = zeileRef.current;
    if (!einzeilig || !el) return undefined;
    const passen = () => {
      el.style.fontSize = "";
      let g = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.clientWidth + 0.5 && g > 11) { g -= 0.5; el.style.fontSize = `${g}px`; }
    };
    passen();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(passen); ro.observe(el);
    return () => ro.disconnect();
  }, [einzeilig, zeile]);
  return (
    <div className={`ks-kopf${kompakt ? " ks-kopf-kompakt" : ""}${flach ? " ks-kopf-flach" : ""}${buendig ? " ks-kopf-buendig" : ""}${aktion ? " ks-mit-aktion" : ""}${oben ? " ks-mit-oben" : ""}`} style={kursVars(farben)} {...kennung}>
      {oben && <div className="mx-auto px-6 ks-oben" style={{ maxWidth: 620 }}>{oben}</div>}
      <div className="mx-auto px-6 ks-kopf-innen" style={{ maxWidth: 620 }}>
        {aktion ? (
          <div className="ks-titelzeile">
            <h1 className="ks-titel">{titel}</h1>
            <button type="button" className="ks-aktion" onClick={aktion.onClick} aria-label={aktion.label} title={aktion.label} {...aktion.kennung}>
              {aktion.icon}<span>{aktion.text}</span>
            </button>
          </div>
        ) : <h1 className="ks-titel">{titel}</h1>}
        <div className="ks-kopf-text">
          {zeile && <p ref={zeileRef} className={`ks-zeile${einzeilig ? " ks-zeile-eine" : ""}`} title={einzeilig ? zeile : undefined}>{zeile}</p>}
          {chips.length > 0 && (
            <ul className="ks-chips" aria-label="Kurs auf einen Blick">
              {chips.map((c, i) => <li key={i}>{c.icon}{c.text}</li>)}
            </ul>
          )}
        </div>
        {Motiv && <Motiv id={id} klasse="ks-motiv" />}
      </div>
      <div className="ks-kurve" />
    </div>
  );
}

/* ---------- Fortschritt ---------- */
/* einheit = Mehrzahl („Module“), einheitDativ = „von 21 Modulen“; knopf = Beschriftung („Kurs starten“, „Weiter mit“), ziel = womit es weitergeht (zweite Zeile) */
export function FortschrittKarte({ farben, zahl, gesamt, einheit, einheitDativ = einheit, knopf, ziel, onKnopf, zusatz, kennung }) {
  React.useInsertionEffect(stilSetzen, []);
  const r = 31, umfang = 2 * Math.PI * r, anteil = gesamt ? zahl / gesamt : 0;
  return (
    <div className="ks-fortschritt" style={kursVars(farben)} {...kennung}>
      <div className="ks-fortschritt-kopf">
        <div className="ks-ring" role="progressbar" aria-valuemin={0} aria-valuemax={gesamt} aria-valuenow={zahl} aria-label={`${zahl} von ${gesamt} ${einheitDativ}`}>
          <svg viewBox="0 0 72 72" width="100%" height="100%">
            <circle cx="36" cy="36" r={r} fill="none" stroke="var(--ks-ringspur)" strokeWidth="6" />
            <circle cx="36" cy="36" r={r} fill="none" stroke="var(--ks-ring)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={umfang} strokeDashoffset={umfang * (1 - anteil)} style={{ transition: "stroke-dashoffset .4s ease" }} />
          </svg>
          <span className="ks-ring-zahl" aria-hidden="true">{zahl}<small>/{gesamt}</small></span>
        </div>
        <div className="ks-fortschritt-text">
          <p className="ks-fortschritt-label">Dein Fortschritt</p>
          <p className="ks-fortschritt-stand">{zahl === 0 ? `${gesamt} ${einheit} liegen vor dir` : zahl === gesamt ? `Alle ${gesamt} ${einheit} geschafft` : `${zahl} von ${gesamt} ${einheitDativ} geschafft`}</p>
          {zusatz && <p className="ks-fortschritt-zusatz">{zusatz}</p>}
        </div>
      </div>
      {knopf && (
        <button type="button" className="ks-weiter" onClick={onKnopf}>
          <span className="ks-weiter-text">
            <span className="ks-weiter-label">{knopf}</span>
            {ziel && <span className="ks-weiter-ziel">{ziel}</span>}
          </span>
          <Pfeil />
        </button>
      )}
    </div>
  );
}

/* ---------- Hinweis, Kapitel, Modul ---------- */
export function Hinweis({ children }) {
  return <p className="ks-hinweis">{children}</p>;
}

/* rechts = optionales Element am Ende der Zeile (z. B. ein Auswahlknopf) */
export function KapitelKopf({ farben, marke, titel, voll, rechts }) {
  return (
    <div className="ks-kapitel" style={kursVars(farben)}>
      {marke && <span className="ks-kapitel-marke">{marke}</span>}
      <h2 title={voll || titel} style={rechts ? { flex: "none" } : undefined}>{titel}</h2>
      <span className="ks-kapitel-linie" aria-hidden="true" style={rechts ? { minWidth: 0 } : undefined} />
      {rechts}
    </div>
  );
}

/* nr = Zahl auf der Plakette (sonst zeichen, z. B. „T“ oder „✓“). meta = [{ icon, text, label }, …]. klasse = zusätzliche Klasse (z. B. dk-modul für die Browser-Tests).
   onHaken: Antippen der Plakette setzt den Haken von Hand (dann ist die Zeile ein div mit Tastaturbedienung). */
export function ModulKarte({ farben, nr, zeichen, titel, voll, meta = [], ok, onClick, onHaken, hakenLabel, klasse, kennung }) {
  const inhalt = (
    <>
      {onHaken ? (
        <button type="button" className={`ks-medaille${nr ? "" : " ks-medaille-klein"}`} onClick={(e) => { e.stopPropagation(); onHaken(); }} aria-pressed={ok} aria-label={hakenLabel}>
          {nr || zeichen}
        </button>
      ) : (
        <span className={`ks-medaille${nr ? "" : " ks-medaille-klein"}`} aria-hidden="true">{nr || zeichen}</span>
      )}
      <span className="ks-modul-text">
        <span className="ks-modul-titel" title={voll || titel}>{titel}</span>
        {meta.length > 0 && (
          <span className="ks-modul-meta">
            {meta.map((m, i) => <span key={i} aria-label={m.label}>{m.icon}{m.text}</span>)}
          </span>
        )}
      </span>
      <span className="ks-haken" aria-hidden="true">{ok ? <Haekchen /> : <Chevron />}</span>
    </>
  );
  const klassen = `ks-modul${ok ? " ks-modul-ok" : ""}${klasse ? " " + klasse : ""}`;
  if (onHaken) {
    return (
      <div className={klassen} style={kursVars(farben)} role="button" tabIndex={0} onClick={onClick} {...kennung}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}>
        {inhalt}
      </div>
    );
  }
  return <button type="button" className={klassen} style={kursVars(farben)} onClick={onClick} {...kennung}>{inhalt}</button>;
}

/* Ein Abschnitt der Modulliste */
export function ModulListe({ children }) {
  return <div className="ks-liste">{children}</div>;
}
