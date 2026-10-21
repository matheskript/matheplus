import React from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { DOKUMENTE, dokumenteUebersicht, vollTitel } from "./dokumente.js";
import { PORZELLAN, TIEFBLAU, GRANAT, LACKSCHWARZ, NACHTBLAU, GOLD_PILLE } from "./kursFarben.js";
import { DokumentMotiv } from "./funcDokumentMotive.jsx";

/* ======================================================================
   SEITE „DOKUMENTE“ (Ansicht "dokumente", hinter dem gemeinsamen Passwort).
   Eine kompakte Karte je Dokument in der Optik der Kurs-Kacheln („Lack und Goldfolie“):
   Oben die Reihe klein in Gold („Schulbuch Band 2“), darunter der Titel groß in Weiß, Motiv rechts oben;
   darunter Art · Seiten, ganz unten die Knöpfe (Öffnen · Download · bei Druckausgaben Cover),
   daneben die Zweck-Marken (Amazon · Hier auf der Seite · Intern …) und der Pfeil. Der Pfeil klappt Zweck und Stand auf – sonst kein Fließtext.
   Die Liste steht in src/dokumente.js.
   ====================================================================== */

const PALETTE = { porzellan: PORZELLAN, tiefblau: TIEFBLAU, granat: GRANAT, lackschwarz: LACKSCHWARZ, nachtblau: NACHTBLAU };
/* Strichfarbe und dunkle Füllung der Motive passend zum Lack */
const MOTIV_TON = {
  porzellan: { linie: C.nachtschwarz, tief: C.nachtschwarz },
  tiefblau: { linie: "#FFFFFF", tief: C.vkNacht },
  granat: { linie: "#FFFFFF", tief: "#3A0019" },
  lackschwarz: { linie: "#FFFFFF", tief: "#141005" },
  nachtblau: { linie: "#FFFFFF", tief: "#06102A" },
};
/* Download-Knopf: Granat-Pink, auf dem Granat-Lack Blau-Violett (sonst verschwindet er) */
const LADEN = {
  standard: ["linear-gradient(135deg,#7A0032 0%,#A50044 45%,#D4145A 80%,#FF5A8A 100%)", "rgba(212,20,90,0.8)"],
  granat: ["linear-gradient(135deg,#1A3E96 0%,#2457C5 40%,#5B5BF0 75%,#9B6BFF 100%)", "rgba(91,91,240,0.8)"],
};
/* Punktfarbe je Zweck-Marke */
const MARKE_PUNKT = { "Amazon": "#FF9900", "Hier auf der Seite": "#4FC3F7", "Investoren": "#EDBB00", "Intern": "#B9C2D3" };

const STIL_ID = "dk-stil";
const STIL = `
  .dk-gitter{display:grid;gap:14px;grid-template-columns:minmax(0,1fr)}
  @media (min-width:760px){.dk-gitter{grid-template-columns:repeat(2,minmax(0,1fr))}.dk-gitter--eins{grid-template-columns:minmax(0,1fr)}}
  .dk{position:relative;isolation:isolate;overflow:hidden;border:1px solid transparent;border-radius:22px;padding:14px 14px 13px;
    background:var(--dk-lack) padding-box,var(--dk-rand) border-box;color:var(--dk-text);
    box-shadow:0 1px 0 var(--dk-kante) inset,0 18px 36px -18px var(--dk-schatten),0 2px 6px rgba(8,14,32,0.12);
    transition:transform .18s ease,box-shadow .18s ease;align-self:start}
  .dk::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;
    background:linear-gradient(118deg,var(--dk-glanz) 0%,transparent 42%),radial-gradient(60% 80% at 95% 0%,var(--dk-schein) 0%,transparent 60%)}
  .dk > *{position:relative;z-index:1}
  @media (hover:hover){.dk:hover{transform:translateY(-2px);box-shadow:0 1px 0 var(--dk-kante) inset,0 26px 44px -18px var(--dk-schatten),0 4px 10px rgba(8,14,32,0.14)}}
  .dk-motiv{position:absolute;z-index:0;top:4px;right:-6px;width:112px;height:auto;pointer-events:none}
  .dk-kopf{padding-right:98px;min-height:84px}
  .dk-reihe{margin:2px 0 6px;font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;line-height:1.35;color:var(--dk-akzent)}
  .dk-marken{display:flex;flex-wrap:wrap;gap:5px}
  .dk-marke{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:700;letter-spacing:0.03em;padding:3px 8px 3px 7px;border-radius:999px;
    background:var(--dk-chip);border:1px solid var(--dk-chiprand);color:var(--dk-titel);white-space:nowrap}
  .dk-marke i{width:6px;height:6px;border-radius:50%;flex:none}
  .dk-titel{margin:0;font-size:36px;font-weight:800;letter-spacing:-0.035em;line-height:1.04;color:var(--dk-titel);text-wrap:balance}
  .dk-meta{margin:12px 0 0;font-size:12.5px;font-weight:600;color:var(--dk-text);display:flex;flex-wrap:wrap;gap:2px 10px}
  .dk-meta b{color:var(--dk-akzent);font-weight:800}
  .dk-knoepfe{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:12px}
  .dk-k{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:34px;padding:0 13px 0 11px;border-radius:999px;border:0;
    font-family:inherit;font-size:13px;font-weight:800;letter-spacing:-0.01em;text-decoration:none;cursor:pointer;white-space:nowrap;
    transition:transform .15s ease,box-shadow .15s ease,filter .15s ease}
  .dk-k::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;pointer-events:none;
    background:linear-gradient(100deg,transparent,rgba(255,255,255,0.55),transparent);transform:skewX(-20deg);transition:left .5s ease}
  @media (hover:hover){.dk-k:hover{transform:translateY(-1px);filter:saturate(1.15)}.dk-k:hover::after{left:120%}}
  .dk-k:active{transform:scale(0.96)}
  .dk-k:focus-visible{outline:3px solid ${C.flaggold};outline-offset:2px}
  .dk-oeffnen{background:${GOLD_PILLE};color:#2A1F00;box-shadow:0 6px 16px -6px rgba(237,187,0,0.75),0 1px 0 rgba(255,255,255,0.6) inset}
  .dk-laden{background:var(--dk-laden);color:#fff;box-shadow:0 6px 16px -6px var(--dk-ladenschatten),0 1px 0 rgba(255,255,255,0.35) inset}
  .dk-pfeil{margin-left:auto;width:34px;padding:0;flex:none;background:var(--dk-chip);border:1px solid var(--dk-chiprand);color:var(--dk-titel)}
  .dk-pfeil svg{transition:transform .25s ease}
  .dk-pfeil[aria-expanded="true"] svg{transform:rotate(180deg)}
  .dk-fehlt{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 11px;border-radius:999px;font-size:12px;font-weight:700;
    border:1px dashed var(--dk-chiprand);color:var(--dk-text);opacity:0.85}
  .dk-mehr{margin-top:12px;padding:11px 12px;border-radius:14px;background:var(--dk-chip);border:1px solid var(--dk-chiprand)}
  .dk-mehr p{margin:0;font-size:13px;line-height:1.6;font-weight:400;color:var(--dk-text)}
  .dk-mehr .dk-stand{margin-top:8px;font-size:11.5px;font-weight:700;color:var(--dk-akzent)}
  @media (max-width:440px){.dk-knoepfe--cover{gap:6px}.dk-knoepfe--cover .dk-k:not(.dk-pfeil){padding:0 10px 0 8px;gap:4px;font-size:12.5px}}
  @media (max-width:440px){.dk-titel{font-size:31px}}
  @media (max-width:380px){.dk-k{padding:0 11px 0 9px;font-size:12.5px}.dk-kopf{padding-right:86px}.dk-motiv{width:100px}}
  @media (prefers-reduced-motion:reduce){.dk,.dk-k,.dk-k::after,.dk-pfeil svg{transition:none}}
`;
function stilSetzen() {
  if (typeof document === "undefined" || document.getElementById(STIL_ID)) return;
  const el = document.createElement("style");
  el.id = STIL_ID;
  el.textContent = STIL;
  document.head.appendChild(el);
}

const IconAuge = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8 12.1 12.5 8 12.5 1.5 8 1.5 8z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="8" cy="8" r="2.1" fill="currentColor" /></svg>
);
const IconLaden = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8M4.5 6.8 8 10.3l3.5-3.5M2.5 13.5h11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconPfeil = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/* Titel groß lassen, aber kein Wort über den Rand: Schrift Pixel für Pixel verkleinern (höchstens bis 20 px). */
function useTitelPasst() {
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const passen = () => {
      el.style.fontSize = "";
      let g = parseFloat(getComputedStyle(el).fontSize) || 36;
      while (el.scrollWidth > el.clientWidth + 1 && g > 20) { g -= 1; el.style.fontSize = `${g}px`; }
    };
    passen();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(passen);
    ro.observe(el.parentElement || el);
    return () => ro.disconnect();
  }, []);
  return ref;
}

const dateiName = (pfad) => decodeURIComponent(pfad.split("/").pop() || "dokument.pdf");

function Karte({ d }) {
  const [offen, setOffen] = React.useState(false);
  const titelRef = useTitelPasst();
  const name = vollTitel(d);
  const f = PALETTE[d.farbe] || NACHTBLAU;
  const ton = MOTIV_TON[d.farbe] || MOTIV_TON.nachtblau;
  const vars = {
    "--dk-lack": f.lack, "--dk-rand": f.rand, "--dk-glanz": f.glanz, "--dk-schein": f.schein, "--dk-kante": f.kante, "--dk-schatten": f.schatten,
    "--dk-titel": f.titel, "--dk-text": f.text, "--dk-akzent": f.akzent, "--dk-chip": f.chip, "--dk-chiprand": f.chipRand,
    "--dk-laden": (LADEN[d.farbe] || LADEN.standard)[0], "--dk-ladenschatten": (LADEN[d.farbe] || LADEN.standard)[1],
  };
  // Seitenzahl nicht über das Wörterbuch („Seiten“ sind in der Geometrie „sides“)
  const seiten = d.seiten ? (englisch() ? `${d.seiten} ${d.seiten === 1 ? "page" : "pages"}` : `${d.seiten} ${d.seiten === 1 ? "Seite" : "Seiten"}`) : (englisch() ? "Page count open" : "Seitenzahl offen");
  const mehrId = `dk-mehr-${d.id}`;
  return (
    <article data-dokument={d.id} className="dk" style={vars}>
      <DokumentMotiv name={d.motiv} id={`dkm-${d.id}`} klasse="dk-motiv" linie={ton.linie} tief={ton.tief} />
      <div className="dk-kopf">
        {d.reihe ? <div className="dk-reihe" data-dokument-reihe>{d.reihe}</div> : null}
        <h3 className="dk-titel" ref={titelRef} data-dokument-titel aria-label={name}>{d.titel}</h3>
      </div>
      <p className="dk-meta"><span>{d.art}</span><b data-dokument-seiten>{seiten}</b></p>
      <div className={d.cover ? "dk-knoepfe dk-knoepfe--cover" : "dk-knoepfe"}>
        {d.datei ? (
          <>
            <a className="dk-k dk-oeffnen" href={d.datei} target="_blank" rel="noopener noreferrer" data-dokument-oeffnen aria-label={`${name} öffnen`}>
              <IconAuge />Öffnen
            </a>
            <a className="dk-k dk-laden" href={d.datei} download={dateiName(d.datei)} data-dokument-laden aria-label={`${name} herunterladen`}>
              <IconLaden />Download
            </a>
            {d.cover ? (
              <a className="dk-k dk-laden" href={d.cover} download={dateiName(d.cover)} data-dokument-cover aria-label={`Cover zu ${name} herunterladen`}>
                <IconLaden />Cover
              </a>
            ) : null}
          </>
        ) : (
          <span className="dk-fehlt" data-dokument-ohne-datei>Datei noch nicht hier</span>
        )}
        <span className="dk-marken" data-dokument-marken>
          {d.zwecke.map((z) => <span key={z} className="dk-marke"><i style={{ background: MARKE_PUNKT[z] || MARKE_PUNKT.Intern }} />{z}</span>)}
        </span>
        <button type="button" className="dk-k dk-pfeil" aria-expanded={offen} aria-controls={mehrId} aria-label={offen ? "Infos zuklappen" : "Infos aufklappen"}
          data-dokument-mehr onClick={() => setOffen((o) => !o)}>
          <IconPfeil />
        </button>
      </div>
      {offen && (
        <div className="dk-mehr" id={mehrId} data-dokument-info>
          <p>{d.zweck}</p>
          {d.stand ? <div className="dk-stand">Stand {d.stand}</div> : null}
        </div>
      )}
    </article>
  );
}

/* Das Kartenraster allein (Stil inklusive) – von der Seite „Dokumente“ und vom Ende der Blog-Übersicht genutzt.
   eins = eine Spalte (im schmalen Blog-Streifen). */
export function DokumenteKarten({ eins = false }) {
  React.useInsertionEffect(stilSetzen, []);
  return (
    <div className={eins ? "dk-gitter dk-gitter--eins" : "dk-gitter"} data-dokumente-karten>
      {DOKUMENTE.map((d) => <Karte key={d.id} d={d} />)}
    </div>
  );
}

export function DokumenteSeite() {
  const u = dokumenteUebersicht();
  return (
    <>
      <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
        <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 920 }}>
          <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 29, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Dokumente</h1>
          <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 14 }} />
          <p data-dokumente-summe style={{ color: "#C9D6EE", fontSize: 13.5, fontWeight: 400, lineHeight: 1.6 }}>
            {u.anzahl} Dokumente · {u.seiten} Seiten{u.ohneDatei ? ` · ${u.ohneDatei} ohne Datei` : ""}
          </p>
        </div>
        <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
      </div>
      <div className="mx-auto px-4 pb-16" style={{ maxWidth: 920, paddingTop: 16 }}>
        <DokumenteKarten />
      </div>
    </>
  );
}
