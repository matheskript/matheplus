/* ============================================================
   Abi-Zentrum – gemeinsame Gestaltung in Gold
   Goldlack-Kopf (Palette GOLDLACK aus kursFarben.js, Siegel MotivAbi), cremefarbenes
   Papier, Karten mit Goldfolien-Kante, dunkle Karten in Nachtschwarz mit Gold.
   Genutzt von funcAbiZentrum.jsx, funcAbiTraining.jsx, funcMia.jsx, funcLernpartner.jsx.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React from "react";
import { GOLDLACK, GOLD_PILLE } from "./kursFarben.js";
import { MotivAbi } from "./funcKursMotive.jsx";

export const GOLD = "#EDBB00", SCHWARZ = "#0B0C10", PRAEG = "#5A4300", TINTE = "#1B1606", PAPIER = "#FFFDF6", CREME = "#FBF5E3";
export { GOLD_PILLE };

const STIL_ID = "abi-stil";
const STIL = `
.abi{--abi-linie:rgba(90,67,0,0.16);position:relative;min-height:100vh;padding-bottom:72px;color:${TINTE};font-family:inherit;
  background:radial-gradient(1100px 520px at 88% -8%,rgba(237,187,0,0.16),transparent 62%),linear-gradient(180deg,${CREME} 0%,${PAPIER} 38%,${CREME} 100%)}
.abi *{box-sizing:border-box}
.abi-innen{max-width:1040px;margin:0 auto;padding:0 16px}
@media (min-width:840px){.abi-innen{padding:0 28px}}
.abi-kopf{position:relative;isolation:isolate;overflow:hidden;background:${GOLDLACK.lack};color:${SCHWARZ}}
.abi-kopf::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
  background:linear-gradient(118deg,rgba(255,255,255,0.55) 0%,transparent 38%),radial-gradient(60% 90% at 90% 110%,rgba(255,246,214,0.6) 0%,transparent 60%)}
.abi-kopf-innen{position:relative;padding-top:18px;padding-bottom:26px}
.abi-zurueck{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 14px 0 10px;margin-left:-6px;border:none;border-radius:999px;background:rgba(11,12,16,0.08);
  color:${SCHWARZ};font:inherit;font-size:13.5px;font-weight:800;cursor:pointer}
.abi-zurueck:hover{background:rgba(11,12,16,0.14)}
.abi-eyebrow{display:block;margin:0;font-size:11.5px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#7A5C00}
.abi-kopf .abi-eyebrow{color:${PRAEG};margin-top:14px}
.abi-kopf h1{margin:6px 0 0;max-width:15ch;font-size:clamp(36px,10vw,60px);font-weight:900;letter-spacing:-0.045em;line-height:0.98;color:${SCHWARZ};text-wrap:balance}
.abi-kopf.kompakt h1{font-size:clamp(28px,7.6vw,44px);max-width:18ch}
.abi-kopf .abi-zeile-kopf{margin:12px 0 0;max-width:46ch;font-size:15.5px;line-height:1.55;color:#2A1F00}
.abi-kopf-motiv{position:absolute;right:0;bottom:-34px;width:min(40vw,270px);height:auto;opacity:0.92;z-index:-1;pointer-events:none}
.abi-kopf.kompakt .abi-kopf-motiv{width:min(30vw,190px);bottom:-26px}
@media (max-width:599px){.abi-kopf-motiv,.abi-kopf.kompakt .abi-kopf-motiv{opacity:0.3;right:-28px;top:26px;bottom:auto;width:170px}}
.abi ul:not([style*="list-style"]){list-style:disc}
.abi ol:not([style*="list-style"]){list-style:decimal}
.abi-karte.dunkel li::marker{color:${GOLD};font-weight:800}
.mia-kopf-deko{display:none}
@media (min-width:840px){.mia-kopf-deko{display:block}}
.abi-vorschlag{min-height:0}
@media (min-width:840px){.abi-vorschlag{min-height:128px}}
.abi-kopf-linie{height:3px;background:linear-gradient(90deg,#2A1F00,${PRAEG} 50%,#2A1F00)}
.abi-kopf-rechts{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.abi-countdown{display:inline-flex;align-items:baseline;gap:8px;padding:10px 16px 11px;border-radius:16px;background:${SCHWARZ};color:#fff;box-shadow:0 14px 28px -16px rgba(11,12,16,0.8)}
.abi-countdown b{font-size:30px;font-weight:900;letter-spacing:-0.03em;color:${GOLD};line-height:1}
.abi-countdown span{font-size:13px;font-weight:600;color:rgba(255,255,255,0.82)}
.abi-pille{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 14px;border-radius:999px;background:rgba(255,255,255,0.42);border:1px solid rgba(90,67,0,0.28);font-size:13px;font-weight:700;color:#2A1F00}
.abi-abschnitt{margin-top:36px}
.abi-h2{margin:4px 0 0;font-size:clamp(22px,5.8vw,30px);font-weight:800;letter-spacing:-0.035em;line-height:1.1;color:${SCHWARZ};text-wrap:balance}
.abi-strich{display:block;width:40px;height:3px;border-radius:2px;margin:10px 0 16px;background:linear-gradient(90deg,${PRAEG},${GOLD})}
.abi-text{margin:0;font-size:15px;line-height:1.6;color:#3A3010}
.abi-klein{margin:0;font-size:12.5px;line-height:1.5;color:#6B5A26}
.abi-karte{position:relative;border:1px solid transparent;border-radius:20px;padding:18px;
  background:${PAPIER} padding-box,linear-gradient(135deg,rgba(255,233,160,0.95),rgba(201,154,12,0.5) 50%,rgba(90,67,0,0.45)) border-box;
  box-shadow:0 18px 36px -26px rgba(90,67,0,0.5),0 1px 0 rgba(255,255,255,0.9) inset}
.abi-karte.dunkel{color:#fff;background:linear-gradient(150deg,${SCHWARZ} 0%,#1E1A0E 100%) padding-box,linear-gradient(135deg,rgba(255,233,160,0.9),rgba(237,187,0,0.28) 55%,rgba(237,187,0,0.6)) border-box;
  box-shadow:0 24px 44px -24px rgba(11,12,16,0.75)}
.abi-karte.dunkel .abi-text{color:rgba(255,255,255,0.84)}
.abi-karte.dunkel .abi-klein{color:rgba(255,255,255,0.6)}
.abi-karte.dunkel .abi-eyebrow{color:${GOLD}}
.abi-karte.gold{color:${SCHWARZ};background:${GOLDLACK.lack} padding-box,${GOLDLACK.rand} border-box;box-shadow:0 22px 40px -24px rgba(154,116,0,0.7),0 1px 0 rgba(255,255,255,0.7) inset}
.abi-karte.gold .abi-eyebrow{color:${PRAEG}}
.abi-karte.gold .abi-text{color:#2A1F00}
.abi-karte h3{margin:0;font-size:18px;font-weight:800;letter-spacing:-0.02em;line-height:1.2}
.abi-raster{display:grid;gap:14px}
@media (min-width:840px){.abi-raster.zwei{grid-template-columns:1fr 1fr}.abi-raster.drei{grid-template-columns:repeat(3,1fr)}.abi-raster.vier{grid-template-columns:repeat(4,1fr)}}
@media (min-width:600px) and (max-width:839px){.abi-raster.drei,.abi-raster.vier{grid-template-columns:1fr 1fr}}
.abi-knopf{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 20px;border:none;border-radius:999px;
  font:inherit;font-size:15px;font-weight:800;letter-spacing:-0.01em;cursor:pointer;text-align:center;transition:transform .15s ease,filter .15s ease}
.abi-knopf.gold{background:${GOLD_PILLE};color:${SCHWARZ};box-shadow:0 10px 24px -10px rgba(237,187,0,0.85),inset 0 1px 0 rgba(255,255,255,0.6)}
.abi-knopf.dunkel{background:${SCHWARZ};color:${GOLD};box-shadow:0 10px 22px -12px rgba(11,12,16,0.75)}
.abi-knopf.rand{background:transparent;color:inherit;box-shadow:inset 0 0 0 1.5px rgba(90,67,0,0.45)}
.abi-karte.dunkel .abi-knopf.rand{box-shadow:inset 0 0 0 1.5px rgba(237,187,0,0.55);color:${GOLD}}
.abi-knopf.breit{width:100%}
.abi-knopf.klein{min-height:38px;padding:0 14px;font-size:13.5px}
.abi-knopf:disabled{opacity:0.45;cursor:default}
.abi-knopf:not(:disabled):active{transform:scale(0.98)}
@media (hover:hover){.abi-knopf:not(:disabled):hover{filter:brightness(1.06);transform:translateY(-1px)}}
.abi-knopf:focus-visible,.abi-chip:focus-visible,.abi-zeile:focus-visible,.abi-zurueck:focus-visible{outline:3px solid ${SCHWARZ};outline-offset:2px}
.abi-karte.dunkel .abi-knopf:focus-visible{outline-color:${GOLD}}
.abi-chips{display:flex;flex-wrap:wrap;gap:8px}
.abi-chip{display:inline-flex;align-items:center;gap:6px;min-height:38px;padding:0 14px;border-radius:999px;border:1px solid rgba(90,67,0,0.25);background:#FFF8DC;
  color:#2A1F00;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;text-align:left}
.abi-chip[aria-pressed="true"],.abi-chip[aria-checked="true"]{background:${SCHWARZ};border-color:${SCHWARZ};color:${GOLD}}
.abi-chips.zeile{flex-wrap:nowrap}
.abi-chips.zeile .abi-chip{flex:1 1 0;min-width:0;justify-content:center;padding:0 8px;white-space:nowrap;text-align:center}
.abi-chip:disabled{opacity:0.38;cursor:default}
.abi-jahre{display:flex;align-items:center;gap:8px}
.abi-jahre .abi-chips{flex:1;min-width:0}
.abi-pfeil{flex:0 0 38px;height:38px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;border:1px solid rgba(90,67,0,0.25);background:transparent;color:#2A1F00;font:inherit;font-size:18px;font-weight:800;cursor:pointer;padding:0}
.abi-pfeil:focus-visible{outline:3px solid ${SCHWARZ};outline-offset:2px}
.abi-karte.dunkel .abi-chip{background:rgba(255,255,255,0.06);border-color:rgba(237,187,0,0.3);color:#fff}
.abi-karte.dunkel .abi-chip[aria-pressed="true"]{background:${GOLD};color:${SCHWARZ};border-color:${GOLD}}
.abi-zeile{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:12px 2px;border:none;border-bottom:1px solid var(--abi-linie);background:none;
  color:inherit;font:inherit;text-align:left;cursor:pointer}
.abi-zeile:last-child{border-bottom:none}
.abi-zeile b{display:block;font-size:15px;font-weight:800;letter-spacing:-0.01em}
.abi-zeile .z{display:block;margin-top:2px;font-size:13px;line-height:1.4;color:#6B5A26}
.abi-karte.dunkel .abi-zeile{border-bottom-color:rgba(237,187,0,0.18)}
.abi-karte.dunkel .abi-zeile .z{color:rgba(255,255,255,0.62)}
.abi-zeile .pf{margin-left:auto;flex:none;opacity:0.7;transition:transform .15s ease}
@media (hover:hover){.abi-zeile:hover .pf{transform:translateX(3px);opacity:1}}
.abi-feld{display:block}
.abi-feld>span{display:block;margin-bottom:6px;font-size:12.5px;font-weight:800;color:${PRAEG}}
.abi-feld select,.abi-feld input,.abi-feld textarea{width:100%;min-height:46px;padding:0 14px;border:1px solid rgba(90,67,0,0.3);border-radius:12px;background:${PAPIER};
  color:${SCHWARZ};font:inherit;font-size:15px}
.abi-feld textarea{padding:10px 14px;min-height:90px;resize:vertical}
.abi-feld select:focus,.abi-feld input:focus,.abi-feld textarea:focus{outline:2px solid ${GOLD};outline-offset:1px;border-color:${PRAEG}}
.abi-be{display:inline-flex;align-items:center;justify-content:center;min-width:46px;height:26px;padding:0 9px;border-radius:999px;background:${SCHWARZ};color:${GOLD};
  font-size:12.5px;font-weight:800;white-space:nowrap;flex:none}
.abi-balken{display:block;height:6px;border-radius:999px;background:rgba(90,67,0,0.14);overflow:hidden}
.abi-balken i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,${PRAEG},${GOLD})}
.abi-karte.dunkel .abi-balken{background:rgba(255,255,255,0.14)}
.abi-hinweis{padding:12px 14px;border-radius:14px;background:#FFF4CC;border:1px solid rgba(201,154,12,0.45);font-size:13.5px;line-height:1.5;color:#3A2E00}
.abi-warn{padding:12px 14px;border-radius:14px;background:#FCE8EE;border:1px solid rgba(165,0,68,0.3);font-size:13.5px;line-height:1.5;color:#5A0024}
.abi-reiter{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:4px;margin:0 -4px;border-radius:999px}
.abi-reiter::-webkit-scrollbar{display:none}
.abi-reiter button{flex:none;min-height:42px;padding:0 16px;border:none;border-radius:999px;background:rgba(255,255,255,0.5);color:#2A1F00;font:inherit;font-size:14px;font-weight:800;cursor:pointer;white-space:nowrap}
.abi-reiter button[aria-selected="true"]{background:${SCHWARZ};color:${GOLD}}
.abi-puls{animation:abiPuls 1.4s ease-in-out infinite}
@keyframes abiPuls{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(0.9);opacity:0.75}}
@media (prefers-reduced-motion:reduce){.abi-knopf,.abi-zeile .pf{transition:none}.abi-puls{animation:none}}
`;
function stilSetzen() {
  if (typeof document === "undefined" || document.getElementById(STIL_ID)) return;
  const el = document.createElement("style");
  el.id = STIL_ID; el.textContent = STIL;
  document.head.appendChild(el);
}
export const useAbiStil = () => React.useInsertionEffect(stilSetzen, []);

export function AbiSeite({ children, kennung }) {
  useAbiStil();
  return <div className="abi" {...kennung}>{children}</div>;
}

export function Pfeil({ farbe = "currentColor", groesse = 16 }) {
  return <svg className="pf" width={groesse} height={groesse} viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" stroke={farbe} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/* Goldlack-Kopf. zurueck = { text, onClick }; rechts = Inhalt unter der Zeile (Countdown, Pillen) */
export function AbiKopf({ eyebrow, titel, zeile, zurueck, rechts, kompakt, id = "abi-kopf", breite }) {
  return (
    <header className={kompakt ? "abi-kopf kompakt" : "abi-kopf"}>
      <div className="abi-innen abi-kopf-innen" style={breite ? { maxWidth: breite } : undefined}>
        <MotivAbi id={id} klasse="abi-kopf-motiv" />
        {zurueck && (
          <button type="button" className="abi-zurueck" onClick={zurueck.onClick}>
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H4M7.5 4L3.5 8l4 4" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {zurueck.text}
          </button>
        )}
        {eyebrow && <span className="abi-eyebrow">{eyebrow}</span>}
        <h1>{titel}</h1>
        {zeile && <p className="abi-zeile-kopf">{zeile}</p>}
        {rechts && <div className="abi-kopf-rechts">{rechts}</div>}
      </div>
      <div className="abi-kopf-linie" />
    </header>
  );
}

export function Abschnitt({ eyebrow, titel, children, kennung, rechts }) {
  return (
    <section className="abi-abschnitt" {...kennung}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>{eyebrow && <span className="abi-eyebrow">{eyebrow}</span>}<h2 className="abi-h2">{titel}</h2></div>
        {rechts}
      </div>
      <span className="abi-strich" aria-hidden="true" />
      {children}
    </section>
  );
}

export function BeBalken({ be, max, label }) {
  const anteil = max ? Math.max(0, Math.min(100, Math.round((be / max) * 100))) : 0;
  return <span className="abi-balken" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={be}><i style={{ width: `${anteil}%` }} /></span>;
}

export const zeitText = (sek) => {
  const s = Math.max(0, Math.round(sek));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
};

/* Mia: Medaille in Goldfolie, Monogramm in Nachtschwarz, Stern oben */
export function MiaEmblem({ groesse = 56, id = "mia" }) {
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 64 64" aria-hidden="true" style={{ display: "block", flex: "none" }}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF3C4" /><stop offset="30%" stopColor="#F2C14E" /><stop offset="58%" stopColor="#D9A520" /><stop offset="78%" stopColor="#FFE9A0" /><stop offset="100%" stopColor="#B58612" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill={`url(#${id}-g)`} />
      <circle cx="32" cy="32" r="26" fill={SCHWARZ} />
      <circle cx="32" cy="32" r="22.5" fill="none" stroke={`url(#${id}-g)`} strokeWidth="0.9" strokeDasharray="1.6 2.2" />
      <text x="32" y="39.5" textAnchor="middle" fontSize="19" fontWeight="900" letterSpacing="-0.6" fill={`url(#${id}-g)`} fontFamily="Montserrat, sans-serif">Mia</text>
      <path d="M32 11.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill={`url(#${id}-g)`} />
    </svg>
  );
}

/* Vor jeder KI-Anfrage: Einwilligung da? Sonst Fenster öffnen und danach automatisch weitermachen. */
export function mitEinwilligung(da, los) {
  if (da()) { los(); return; }
  const ja = () => { window.removeEventListener("mm-ki-einwilligung-erteilt", ja); setTimeout(los, 0); };
  window.addEventListener("mm-ki-einwilligung-erteilt", ja);
  try { window.dispatchEvent(new CustomEvent("mm-ki-einwilligung")); } catch (e) { /* kein Browser */ }
}
