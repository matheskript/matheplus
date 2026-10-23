/* ============================================================
   GFS-TRAINING (ansicht "gfs", Pfad /gfs-trainer)
   Ganz oben im Kopf: Knopf „GFS wählen“ (funcGfsWahl.jsx) – Klasse → Thema → Themenseite,
   derselbe Knopf steht im Kopf jeder Themenseite.
   Aufbau wie die Kurse Differentialrechnung und Vektoren:
     1. Dein Thema: Knopf „Klasse wählen“ rechts neben der Überschrift →
        darunter klappt das Themenfenster der Stufe auf (5–8 GFS-Themen aus
        dem Lambacher Schweizer); fertige Themen öffnen ihre Themenseite,
        die anderen zeigen ihre Kurzbeschreibung („Seite folgt“)
     2. So gehst du eine GFS an: sieben Schritte mit Text, Video-Platz
        und Checkliste
     3. Zeitplaner: vom Termin aus rückwärts
   Farben: Lackschwarz mit Gold, die Bühne (LACKSCHWARZ in kursFarben.js); Kopf,
   Fortschritt und Abschnittsköpfe aus funcKursKopf.jsx. Fortschritt im localStorage.
   Daten und Logik: gfsKurs.js
   ============================================================ */
import React, { useState, useEffect, useRef } from "react";
import { C } from "./base1.jsx";
import { ErklaerVideo } from "./func1.jsx";
import { STUFEN, stufeVon, stufeAusKlasse, stufenText, THEMEN, themenFuer, LEITFADEN, zeitplan, datumSchreiben } from "./gfsKurs.js";
import { LACKSCHWARZ } from "./kursFarben.js";
import { MotivBuehne } from "./funcKursMotive.jsx";
import { KursKopf, FortschrittKarte, KapitelKopf, IconVideo, IconAufgabe, IconUhr } from "./funcKursKopf.jsx";
import { GfsWahl } from "./funcGfsWahl.jsx";

const K = { nacht: C.nachtschwarz, dunkel: C.golddunkel, gold: C.flaggold, goldWarm: C.goldWarm, hell: "#FFF6D6", weiss: C.weiss, text: "#A67C00" };

/* ---------- Fortschritt ---------- */
const SPEICHER = "mm_gfskurs";
const standLesen = () => {
  const leer = { stufe: null, thema: null, haken: {}, offen: {}, termin: "" };
  try {
    const s = { ...leer, ...JSON.parse(localStorage.getItem(SPEICHER) || "{}") };
    if (!s.stufe && typeof s.klasse === "number") s.stufe = stufeAusKlasse(s.klasse);   // Stand vor dem 21.10.
    return s;
  } catch (e) { return leer; }
};
const standSchreiben = (s) => { try { localStorage.setItem(SPEICHER, JSON.stringify(s)); } catch (e) { /* egal */ } };
const schrittFertig = (s, stand) => s.check.every((_, i) => stand.haken[`${s.id}-${i}`]);

/* ---------- Kopf ---------- */
/* oben = Knopf „GFS wählen“ (Klasse → Thema), steht auch im Kopf jeder Themenseite */
export function GfsKursKopf({ oben } = {}) {
  return (
    <KursKopf farben={LACKSCHWARZ} Motiv={MotivBuehne} id="ks-gfs" titel="GFS-Training" oben={oben}
      zeile="Dein Thema aus dem Lambacher Schweizer finden – und in sieben Schritten lernen, wie eine GFS gelingt."
      chips={[
        { icon: <IconAufgabe />, text: `${LEITFADEN.length} Schritte` },
        { icon: <span style={{ display: "inline-flex", width: 14, height: 14, flex: "none" }}><IconVideo /></span>, text: `${THEMEN.length} GFS-Themen` },
        { icon: <IconUhr />, text: "Zeitplan bis zum Termin" },
      ]} />
  );
}

/* ---------- Kleine Bausteine ---------- */
const Abschnitt = ({ nr, titel, text, rechts, children }) => (
  <section style={{ marginBottom: 34 }}>
    <KapitelKopf farben={LACKSCHWARZ} marke={`Teil ${nr}`} titel={titel} rechts={rechts} />
    {text && <p style={{ color: C.grau, fontSize: 14.5, lineHeight: 1.65, margin: "2px 4px 16px", maxWidth: "62ch" }}>{text}</p>}
    {children}
  </section>
);

const Haken = ({ an }) => (
  <span aria-hidden="true" style={{ display: "inline-flex", width: 22, height: 22, borderRadius: 7, flex: "none", alignItems: "center", justifyContent: "center",
    background: an ? K.gold : K.weiss, border: an ? "none" : `1.5px solid ${C.linie}`, transition: "background .15s" }}>
    {an && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2l2.4 2.4 4.6-5" stroke={K.nacht} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
  </span>
);

/* ---------- Teil 1: Dein Thema ---------- */
const Pfeilchen = ({ offen }) => (
  <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" style={{ flex: "none", transform: offen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
    <path d="M3.5 6l4.5 4.5L12.5 6" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const stufenMarke = (st) => (st.id.startsWith("k") ? `K${st.id.slice(1)}` : st.id);

/* Knopf rechts neben „Dein Thema“: öffnet die Liste der Stufen */
function StufenKnopf({ stufe, waehlen }) {
  const [offen, setOffen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!offen) return undefined;
    const weg = (e) => { if (ref.current && !ref.current.contains(e.target)) setOffen(false); };
    const taste = (e) => { if (e.key === "Escape") setOffen(false); };
    document.addEventListener("pointerdown", weg);
    document.addEventListener("keydown", taste);
    return () => { document.removeEventListener("pointerdown", weg); document.removeEventListener("keydown", taste); };
  }, [offen]);
  const st = stufeVon(stufe);
  return (
    <div ref={ref} className="gfs-stufe">
      <button type="button" className={`gfs-stufe-knopf${st ? " gfs-stufe-an" : ""}`} onClick={() => setOffen(!offen)}
        aria-haspopup="listbox" aria-expanded={offen} aria-label={st ? `Klasse wählen – gewählt: ${st.name}` : "Klasse wählen"}>
        <span>{st ? st.name : "Klasse wählen"}</span><Pfeilchen offen={offen} />
      </button>
      {offen && (
        <div className="gfs-stufe-menue" role="listbox" aria-label="Klassenstufe">
          {STUFEN.map((x) => {
            const an = x.id === stufe, zahl = themenFuer(x.id).length;
            return (
              <button key={x.id} type="button" role="option" aria-selected={an} className={`gfs-stufe-wahl${an ? " gfs-an" : ""}`}
                onClick={() => { setOffen(false); waehlen(x.id); }}>
                <span className="gfs-stufe-marke" aria-hidden="true">{stufenMarke(x)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="gfs-stufe-name">{x.name}</span>
                  {x.zusatz && <span className="gfs-stufe-zusatz">{x.zusatz}</span>}
                </span>
                <span className="gfs-stufe-zahl">{zahl}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Das Fenster unter der Überschrift: alle GFS-Themen der gewählten Stufe */
function ThemenFenster({ stufe, stand, setzen, gehe, schliessen }) {
  const st = stufeVon(stufe);
  const [auf, setAuf] = useState(null);   // aufgeklappte Kurzbeschreibung (Thema ohne Seite)
  if (!st) return null;
  const liste = themenFuer(st.id);
  return (
    <div className="gfs-fenster" data-gfs-fenster={st.id}>
      <div className="gfs-fenster-kopf">
        <span className="gfs-fenster-marke" aria-hidden="true">{stufenMarke(st)}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="gfs-fenster-titel">{st.name}</span>
          <span className="gfs-fenster-zeile">{st.kurzZusatz ? `${st.kurzZusatz} · ${liste.length} Themen` : `${liste.length} GFS-Themen aus dem Buch`}</span>
        </span>
        <button type="button" className="gfs-fenster-zu" onClick={schliessen} aria-label="Themenliste schließen">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>
      <ul className="gfs-fenster-liste">
        {liste.map((t) => {
          const fertigT = !!t.ansicht, offen = auf === t.id, gewaehlt = stand.thema === t.id;
          const klick = () => {
            if (fertigT) { setzen({ thema: t.id }); gehe({ ansicht: t.ansicht }); }
            else setAuf(offen ? null : t.id);
          };
          return (
            <li key={t.id}>
              <button type="button" className={`gfs-thema${fertigT ? " gfs-thema-fertig" : ""}${gewaehlt ? " gfs-thema-gewaehlt" : ""}`} onClick={klick}
                aria-expanded={fertigT ? undefined : offen}>
                <span className="gfs-thema-kap" aria-hidden="true">{t.kapitel}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="gfs-thema-titel">{t.kurz}</span>
                  <span className="gfs-thema-meta">{t.kapitelName}</span>
                </span>
                {fertigT
                  ? <span className="gfs-thema-los">Öffnen <span aria-hidden="true">→</span></span>
                  : <span className="gfs-thema-bald"><Pfeilchen offen={offen} /></span>}
              </button>
              {!fertigT && offen && (
                <div className="gfs-thema-mehr">
                  <p>{t.zeile}</p>
                  <span>Themenseite folgt – der Leitfaden unten gilt schon jetzt.</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const THEMEN_STIL = `
  .gfs-stufe{position:relative;flex:none}
  .gfs-stufe-knopf{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px 0 14px;border-radius:999px;cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:800;letter-spacing:-0.01em;white-space:nowrap;
    border:none;color:${K.nacht};background:linear-gradient(135deg,#FFE9A0 0%,${K.gold} 55%,${K.goldWarm} 100%);box-shadow:0 1px 0 rgba(255,255,255,0.5) inset,0 8px 18px -10px rgba(166,124,0,0.9);transition:transform .15s ease}
  .gfs-stufe-knopf.gfs-stufe-an{background:${K.nacht};color:${K.gold};box-shadow:0 0 0 1px rgba(237,187,0,0.45) inset,0 8px 18px -10px rgba(11,12,16,0.8)}
  .gfs-stufe-knopf:active{transform:scale(0.97)}
  .gfs-stufe-knopf:focus-visible,.gfs-stufe-wahl:focus-visible,.gfs-thema:focus-visible,.gfs-fenster-zu:focus-visible{outline:3px solid ${K.gold};outline-offset:2px}
  .gfs-stufe-menue{position:absolute;right:0;top:calc(100% + 8px);z-index:30;width:264px;max-width:calc(100vw - 32px);padding:6px;border-radius:18px;background:${K.nacht};
    border:1px solid rgba(237,187,0,0.35);box-shadow:0 24px 48px -16px rgba(8,10,16,0.65),0 2px 8px rgba(8,10,16,0.3);animation:gfsAuf .16s ease-out}
  .gfs-stufe-wahl{display:flex;align-items:center;gap:11px;width:100%;padding:9px 10px;border:none;border-radius:12px;background:none;cursor:pointer;font-family:inherit;text-align:left;color:${K.weiss}}
  .gfs-stufe-wahl:hover,.gfs-stufe-wahl.gfs-an{background:rgba(237,187,0,0.12)}
  .gfs-stufe-marke{flex:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;font-weight:800;font-size:13px;color:${K.nacht};
    background:linear-gradient(135deg,#FFE9A0 0%,${K.gold} 60%,${K.goldWarm} 100%)}
  .gfs-stufe-name{display:block;font-size:14.5px;font-weight:700;line-height:1.25}
  .gfs-stufe-zusatz{display:block;font-size:11.5px;color:rgba(255,255,255,0.62);margin-top:1px;white-space:nowrap}
  .gfs-stufe-zahl{flex:none;min-width:24px;height:22px;padding:0 7px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:800;
    background:rgba(255,255,255,0.1);color:${K.gold}}
  .gfs-fenster{border-radius:22px;overflow:hidden;background:${K.weiss};border:1px solid rgba(237,187,0,0.55);
    box-shadow:0 1px 2px rgba(15,26,51,0.05),0 18px 40px -22px rgba(15,26,51,0.35);animation:gfsAuf .22s ease-out}
  .gfs-fenster-kopf{display:flex;align-items:center;gap:12px;padding:14px 12px 14px 14px;color:${K.weiss};
    background:radial-gradient(70% 140% at 100% 0%,rgba(237,187,0,0.32) 0%,transparent 60%),linear-gradient(150deg,${K.nacht} 0%,#1A1608 70%,#2E2408 100%)}
  .gfs-fenster-marke{flex:none;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:13px;font-weight:800;font-size:16px;color:${K.nacht};
    background:linear-gradient(135deg,#FFE9A0 0%,${K.gold} 60%,${K.goldWarm} 100%)}
  .gfs-fenster-titel{display:block;font-size:17px;font-weight:800;letter-spacing:-0.02em;line-height:1.2}
  .gfs-fenster-zeile{display:block;font-size:12px;color:rgba(255,255,255,0.7);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .gfs-fenster-zu{flex:none;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:999px;border:1px solid rgba(255,255,255,0.18);
    background:rgba(255,255,255,0.08);color:${K.weiss};cursor:pointer}
  .gfs-fenster-liste{list-style:none;margin:0;padding:4px 0}
  .gfs-fenster-liste li + li{border-top:1px solid ${C.linie}}
  .gfs-thema{display:flex;align-items:center;gap:12px;width:100%;padding:11px 14px 11px 12px;border:none;background:none;cursor:pointer;font-family:inherit;text-align:left;color:${C.tinte};transition:background .15s ease}
  @media (hover:hover){.gfs-thema:hover{background:#FFFBEB}}
  .gfs-thema-kap{flex:none;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:11px;font-weight:800;font-size:12.5px;font-style:italic;
    background:${K.hell};color:${K.text}}
  .gfs-thema-fertig .gfs-thema-kap{background:${K.nacht};color:${K.gold}}
  .gfs-thema-titel{display:block;font-size:15px;font-weight:700;line-height:1.3}
  .gfs-thema-meta{display:block;font-size:12px;color:${C.grau};margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .gfs-thema-los{flex:none;display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 12px;border-radius:999px;font-size:12.5px;font-weight:800;color:${K.nacht};
    background:linear-gradient(135deg,#FFE9A0 0%,${K.gold} 60%,${K.goldWarm} 100%)}
  .gfs-thema-gewaehlt .gfs-thema-titel::after{content:" · dein Thema";font-size:11.5px;font-weight:700;color:${K.text}}
  .gfs-thema-bald{flex:none;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px;color:${C.grau};border:1px solid ${C.linie}}
  .gfs-thema-mehr{padding:0 16px 14px 60px}
  .gfs-thema-mehr p{margin:0 0 6px;font-size:14px;line-height:1.55;color:${C.tinte}}
  .gfs-thema-mehr span{display:inline-block;font-size:11.5px;font-weight:700;color:${K.text};background:${K.hell};border-radius:999px;padding:3px 9px}
  @keyframes gfsAuf{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.gfs-fenster,.gfs-stufe-menue{animation:none}.gfs-thema,.gfs-stufe-knopf{transition:none}}
`;

/* ---------- Teil 2: Leitfaden ---------- */
function Schritt({ s, stand, setzen }) {
  const offen = !!stand.offen[s.id];
  const fertig = schrittFertig(s, stand);
  const erledigt = s.check.filter((_, i) => stand.haken[`${s.id}-${i}`]).length;
  const umschalten = () => setzen({ offen: { ...stand.offen, [s.id]: !offen } });
  const haken = (i) => { const k = `${s.id}-${i}`; setzen({ haken: { ...stand.haken, [k]: !stand.haken[k] } }); };
  return (
    <div style={{ background: K.weiss, border: `1px solid ${fertig ? K.gold : C.linie}`, borderRadius: 18, marginBottom: 10, boxShadow: "0 1px 2px rgba(15,26,51,0.04), 0 6px 18px -10px rgba(15,26,51,0.14)", overflow: "hidden" }}>
      <button type="button" onClick={umschalten} aria-expanded={offen}
        style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "12px 14px 12px 12px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: K.nacht }}>
        <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", width: 46, height: 46, borderRadius: 14,
          background: fertig ? K.gold : K.hell, color: K.nacht, fontWeight: 800, fontSize: 18, transition: "background .15s" }}>{s.nr}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontWeight: 700, fontSize: 15.5, lineHeight: 1.3 }}>{s.titel}</span>
          <span style={{ display: "block", fontSize: 12.5, color: C.grau, marginTop: 3, lineHeight: 1.4 }}>{s.zeile}</span>
        </span>
        <span style={{ flex: "none", fontSize: 12, fontWeight: 700, color: fertig ? K.text : C.hellgrau, whiteSpace: "nowrap" }}>{erledigt}/{s.check.length}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ flex: "none", transform: offen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
          <path d="M3 6l5 5 5-5" stroke={C.grau} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {offen && (
        <div style={{ padding: "0 16px 18px", borderTop: `1px solid ${C.linie}` }}>
          <p style={{ fontSize: 16.5, fontWeight: 700, color: K.nacht, letterSpacing: "-0.01em", lineHeight: 1.3, margin: "16px 0 12px" }}>{s.frage}</p>
          {s.video ? <ErklaerVideo id={s.video} titel={s.titel} /> : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: K.text, background: K.hell, borderRadius: 10, padding: "8px 12px", marginBottom: 14 }}>
              <span style={{ display: "inline-flex", width: 14, height: 14, flex: "none" }}><IconVideo /></span>Video zu diesem Schritt folgt
            </div>
          )}
          {s.absaetze.map((a, i) => <p key={i} style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, margin: "0 0 12px" }}>{a}</p>)}
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: K.text, margin: "16px 0 8px" }}>CHECKLISTE</p>
          {s.check.map((c, i) => {
            const an = !!stand.haken[`${s.id}-${i}`];
            return (
              <button key={c} type="button" onClick={() => haken(i)} aria-pressed={an}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 6px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                <Haken an={an} />
                <span style={{ fontSize: 14.5, color: an ? C.grau : C.tinte, textDecoration: an ? "line-through" : "none", lineHeight: 1.4 }}>{c}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Teil 3: Zeitplaner ---------- */
function Zeitplaner({ stand, setzen }) {
  const heute = datumSchreiben(Date.now() - new Date().getTimezoneOffset() * 60000);
  const plan = stand.termin ? zeitplan(stand.termin, heute) : null;
  return (
    <div style={{ background: K.weiss, borderRadius: 18, padding: "16px 16px 10px", border: `1px solid ${C.linie}`, boxShadow: "0 1px 2px rgba(15,26,51,0.04), 0 6px 18px -10px rgba(15,26,51,0.14)" }}>
      <label style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: plan ? 16 : 4 }}>
        <span style={{ fontSize: 14.5, fontWeight: 600, color: K.nacht }}>Wann ist deine GFS?</span>
        <input type="date" value={stand.termin} min={heute} onChange={(e) => setzen({ termin: e.target.value })} aria-label="Termin der GFS"
          style={{ padding: "9px 12px", fontSize: 15, fontFamily: "inherit", border: `1.5px solid ${C.linie}`, borderRadius: 10, color: C.tinte, background: K.weiss }} />
      </label>
      {plan && plan.vorbei && <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, margin: "0 0 8px" }}>Der Termin liegt in der Vergangenheit – trag den nächsten ein.</p>}
      {plan && !plan.vorbei && (
        <>
          <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, margin: "0 0 12px" }}>
            Noch <b style={{ color: K.nacht, fontWeight: 700 }}>{plan.rest} {plan.rest === 1 ? "Tag" : "Tage"}</b>.
            {plan.gestaucht ? " Weniger als vier Wochen – der Plan ist enger gesetzt, fang heute an." : " Vier Wochen, ein Schritt pro Woche – das reicht gut."}
          </p>
          <div style={{ position: "relative", paddingLeft: 26 }}>
            <div style={{ position: "absolute", left: 7, top: 10, bottom: 10, width: 2, background: C.linie, borderRadius: 2 }} />
            {plan.schritte.map((m) => (
              <div key={m.tage} style={{ position: "relative", display: "flex", gap: 12, alignItems: "baseline", padding: "6px 0" }}>
                <span aria-hidden="true" style={{ position: "absolute", left: -24, top: 11, width: 12, height: 12, borderRadius: 999, border: `2px solid ${m.tage === 0 ? K.nacht : K.gold}`,
                  background: m.vorbei ? K.gold : m.tage === 0 ? K.nacht : K.weiss }} />
                <span style={{ flex: "none", width: 72, fontSize: 13, fontWeight: 700, color: m.heute ? K.text : m.vorbei ? C.hellgrau : K.nacht, fontVariantNumeric: "tabular-nums" }}>{m.anzeige}</span>
                <span style={{ flex: 1, fontSize: 14.5, color: m.vorbei ? C.hellgrau : C.tinte, fontWeight: m.tage === 0 ? 700 : 400, lineHeight: 1.4 }}>
                  {m.titel}{m.heute && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 800, color: K.text }}>HEUTE</span>}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Die Seite ---------- */
export function GfsKursSeite({ gehe }) {
  const [stand, setStand] = useState(standLesen);
  /* Sofort speichern (nicht erst im Updater): beim Wechsel zur Themenseite wird die Seite
     abgebaut, bevor React den Updater ausführen würde */
  const setzen = (teil) => { const neu = { ...stand, ...teil }; standSchreiben(neu); setStand(neu); };
  const [fensterZu, setFensterZu] = useState(false);
  const fertigZahl = LEITFADEN.filter((s) => schrittFertig(s, stand)).length;
  const thema = THEMEN.find((t) => t.id === stand.thema);
  const weiter = LEITFADEN.find((s) => !schrittFertig(s, stand));

  return (
    <>
      <GfsKursKopf oben={<GfsWahl gehe={gehe} stufe={stand.stufe}
        onStufe={(id) => { setFensterZu(false); setzen({ stufe: id }); }}
        onThema={(t) => setzen({ stufe: t.stufe, thema: t.id })} />} />
      <div className="mx-auto px-4 pb-16" style={{ maxWidth: 760 }}>
        <FortschrittKarte farben={LACKSCHWARZ} zahl={fertigZahl} gesamt={LEITFADEN.length} einheit="Schritte" einheitDativ="Schritten"
          zusatz={thema ? <>Dein Thema: <b style={{ color: K.weiss }}>{thema.kurz}</b> ({stufenText(thema)})</> : "Noch kein Thema gewählt – bei „Dein Thema“ die Klasse wählen."}
          knopf={weiter ? (fertigZahl === 0 ? "Kurs starten" : "Weiter mit") : null} ziel={weiter ? `${weiter.nr} ${weiter.titel}` : null}
          onKnopf={() => weiter && setzen({ offen: { ...stand.offen, [weiter.id]: true } })} />

        <style>{THEMEN_STIL}</style>
        <Abschnitt nr="1" titel="Dein Thema"
          rechts={<StufenKnopf stufe={stand.stufe} waehlen={(id) => { setFensterZu(false); setzen({ stufe: id }); }} />}
          text="Zu fast jedem Kapitel im Lambacher Schweizer gibt es ein GFS-Thema. Wähle oben rechts deine Klasse – darunter erscheinen die Themen.">
          {stand.stufe && !fensterZu && <ThemenFenster stufe={stand.stufe} stand={stand} setzen={setzen} gehe={gehe} schliessen={() => setFensterZu(true)} />}
        </Abschnitt>

        <Abschnitt nr="2" titel="So gehst du eine GFS an" text="Sieben Schritte, die für jedes Thema gelten. Lies den Schritt, hake die Checkliste ab – ein Schritt gilt als geschafft, wenn alle Haken sitzen.">
          {LEITFADEN.map((s) => <Schritt key={s.id} s={s} stand={stand} setzen={setzen} />)}
        </Abschnitt>

        <Abschnitt nr="3" titel="Dein Zeitplan" text="Trag den Termin ein – der Plan rechnet vom Tag der GFS aus rückwärts und zeigt dir, bis wann welcher Schritt stehen sollte.">
          <Zeitplaner stand={stand} setzen={setzen} />
        </Abschnitt>
      </div>
    </>
  );
}
