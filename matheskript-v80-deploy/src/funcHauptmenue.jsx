/* ======================================================================
   HAUPTMENÜ in der Kopfleiste (Oberfläche). Daten und Logik: hauptmenue.js.

   Zeile 1 (neben dem Logo): ein normaler Menü-Knopf ☰. Sein Fenster (⅔ der Breite,
   rechts) hat 5–6 einzeilige Punkte: Konto, Pro, Datenschutz … und „Abmelden“ (mit Bestätigung).
   Zeile 2: Mathilda · Meine Kurse · Klasse 10 (G9) ▾ · Mein Training · Mathematik · Suche.
   Jeder Punkt klappt ein Fenster auf; ein Klick daneben oder Esc schließt es.
   ====================================================================== */
import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { useKonto, abmelden } from "./konto.js";
import { SuchBox } from "./funcSuche.jsx";
import { SCHULARTEN, klassenBoxen } from "./schulbuch.js";
import {
  LEISTE, KI_MENUE, TRAINING, KURSE, BALD_KURSE, kontoEintraege, klasseErmitteln, klasseLabel,
  klassenInhalt, mathematikEintraege, aktiverPunkt,
} from "./hauptmenue.js";

const QF = "matheplus-quickfinder";
const qfLesen = () => { try { return JSON.parse(localStorage.getItem(QF) || "null"); } catch (e) { return null; } };
const qfSchreiben = (teil) => {
  try { localStorage.setItem(QF, JSON.stringify({ ...(qfLesen() || {}), ...teil, kapitel: null, teil: null })); } catch (e) { /* privat */ }
};

const CSS = `
.hm-leiste{position:relative;z-index:4;display:flex;align-items:center;gap:4px;overflow-x:auto;scrollbar-width:none;padding:0 0 8px}
.hm-leiste::-webkit-scrollbar{display:none}
.hm-punkt{flex:0 0 auto;display:inline-flex;align-items:center;gap:5px;height:34px;padding:0 11px;border-radius:999px;border:1.5px solid transparent;
  background:rgba(255,255,255,0.07);color:#fff;font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .12s ease,border-color .12s ease}
.hm-punkt:hover{background:rgba(255,255,255,0.14)}
.hm-punkt[aria-expanded="true"]{border-color:${C.flaggold};background:rgba(237,187,0,0.16);color:${C.flaggold}}
.hm-punkt[data-aktiv]{color:${C.flaggold}}
.hm-punkt.hm-klasse{background:rgba(237,187,0,0.14);border-color:rgba(237,187,0,0.55);color:${C.flaggold};font-weight:700}
.hm-lupe{width:34px;padding:0;justify-content:center;margin-left:auto}
.hm-fenster{position:absolute;left:12px;right:12px;top:calc(100% - 2px);z-index:3;background:${C.weiss};color:${C.tinte};border-radius:16px;
  box-shadow:0 18px 44px rgba(8,23,59,0.34);max-height:min(72vh,620px);overflow-y:auto;padding:8px;font-family:Montserrat,system-ui,sans-serif}
@media (min-width:700px){.hm-fenster{left:var(--hm-x,12px);right:auto;width:400px}.hm-fenster.hm-breit{width:520px}}
.hm-eintrag{display:flex;width:100%;align-items:center;gap:10px;text-align:left;padding:9px 11px;border-radius:10px;border:none;background:transparent;
  font-family:inherit;cursor:pointer;color:${C.tinte}}
.hm-eintrag:hover{background:${C.himmel}}
.hm-eintrag[aria-current="page"]{background:rgba(237,187,0,0.14)}
.hm-kicker{font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${C.grau};padding:10px 11px 4px;margin:0}
.hm-menueknopf{width:40px;height:40px;border-radius:999px;border:1.5px solid rgba(255,255,255,0.45);background:transparent;color:#fff;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;padding:0;position:relative}
.hm-menueknopf:hover,.hm-menueknopf[aria-expanded="true"]{background:rgba(255,255,255,0.12);border-color:${C.flaggold}}
.hm-fenster.hm-menue{left:auto;right:12px;width:min(66.667vw,320px);padding:6px}
@media (min-width:700px){.hm-fenster.hm-menue{left:auto;right:12px;width:300px}}
.hm-menue .hm-eintrag{padding:12px 13px;font-size:15px;font-weight:700}
`;

/* ---------- kleine Bausteine ---------- */
function Pfeil({ auf, farbe = "currentColor" }) {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" style={{ transition: "transform .15s ease", transform: auf ? "rotate(180deg)" : "none" }}>
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke={farbe} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Bald() {
  return <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", padding: "3px 7px", borderRadius: 999, background: C.himmel, color: C.grau }}>BALD</span>;
}
function Eintrag({ e, gehe, aktuell, aktion }) {
  const an = aktuell && e.ziel && e.ziel.ansicht === aktuell.ansicht && (!e.ziel.foto || e.ziel.foto === aktuell.foto) && (!e.ziel.seite || e.ziel.seite === aktuell.seite);
  return (
    <button type="button" className="hm-eintrag" onClick={() => { if (e.bald) return; if (e.aktion) aktion && aktion(e.aktion); else gehe(e.ziel); }} aria-disabled={e.bald || undefined} aria-current={an ? "page" : undefined}
      style={e.bald ? { cursor: "default", opacity: 0.62 } : e.gold ? { background: "linear-gradient(165deg,#FFE7A0 0%,#F3C93A 55%,#E2B53C 100%)", marginTop: 4 } : undefined}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 700, lineHeight: 1.25, color: e.gold ? C.seeTief : C.tinte }}>{e.name}</span>
        {e.zeile && <span style={{ display: "block", fontSize: 12, fontWeight: 500, lineHeight: 1.3, color: e.gold ? "rgba(14,30,74,0.78)" : C.grau, marginTop: 1 }}>{e.zeile}</span>}
      </span>
      {e.aktion === "abmelden" && (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.grau} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5" /><path d="M5 12h11" />
        </svg>
      )}
      {e.bald && <Bald />}
    </button>
  );
}
const Kicker = ({ children, normal }) => <p className="hm-kicker" style={normal ? { textTransform: "none", letterSpacing: "0.02em", fontSize: 12 } : undefined}>{children}</p>;

/* ---------- Klasse: Auswahl, falls noch keine gewählt ist ---------- */
function KlasseWaehlen({ setze, schulartStart }) {
  const [sa, setSa] = useState(schulartStart || "g9");
  return (
    <div style={{ padding: "4px 6px 8px" }}>
      <p style={{ margin: "6px 5px 10px", fontSize: 14, fontWeight: 600, color: C.tinte, lineHeight: 1.4 }}>In welche Klasse gehst du? Dann zeige ich dir hier dein Schulbuch.</p>
      <div role="group" aria-label="Schulart" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, padding: 4, borderRadius: 12, background: C.see }}>
        {SCHULARTEN.map((s) => (
          <button key={s.id} type="button" aria-pressed={s.id === sa} onClick={() => setSa(s.id)} title={s.zeile} data-kein-i18n
            style={{ height: 32, borderRadius: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 800, cursor: "pointer", color: C.weiss,
              border: `2px solid ${s.id === sa ? C.weiss : "transparent"}`, background: s.id === sa ? "rgba(255,255,255,0.14)" : "transparent" }}>{s.name}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 8 }}>
        {klassenBoxen(sa).map((b) => (
          <button key={b.id} type="button" onClick={() => setze(sa, b.id)} data-kein-i18n
            style={{ height: 40, borderRadius: 10, fontFamily: "inherit", fontSize: 15, fontWeight: 800, cursor: "pointer",
              border: `1.5px solid ${b.gold ? C.flaggold : C.linie}`, background: b.gold ? "rgba(237,187,0,0.12)" : C.weiss, color: C.seeTief }}>{b.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Klasse: Schulbuch-Kapitel + unsere Kurse ---------- */
function KlassenFenster({ klasse, ausProfil, gehe, aendern }) {
  const [offen, setOffen] = useState(null);
  const inhalt = klassenInhalt(klasse);
  return (
    <>
      <Kicker>Dein Schulbuch</Kicker>
      {inhalt.kapitel.length === 0 && <p style={{ margin: "2px 11px 8px", fontSize: 13, color: C.grau }}>Für diese Klasse sind noch keine Kapitel hinterlegt.</p>}
      {inhalt.kapitel.map((k) => {
        const auf = offen === k.id;
        return (
          <div key={k.id}>
            <button type="button" className="hm-eintrag" onClick={() => setOffen(auf ? null : k.id)} aria-expanded={auf} data-kein-scroll>
              <span style={{ flexShrink: 0, width: 30, fontSize: 12, fontWeight: 800, color: C.see }} data-kein-i18n>{k.nr}</span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.25 }}>{k.titel}</span>
              <Pfeil auf={auf} farbe={C.see} />
            </button>
            {auf && (
              <div style={{ margin: "0 4px 6px 22px", paddingLeft: 8, borderLeft: `2px solid ${C.flaggold}` }}>
                <button type="button" className="hm-eintrag" onClick={() => gehe(k.trainieren)}>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: C.see }}>Dieses Kapitel trainieren →</span>
                </button>
                {k.hilfen.map((h) => <Eintrag key={h.id} e={h} gehe={gehe} />)}
              </div>
            )}
          </div>
        );
      })}
      {(inhalt.kurse.length > 0 || inhalt.bald.length > 0) && <Kicker>Unser Kurs dazu</Kicker>}
      {inhalt.kurse.map((k) => <Eintrag key={k.id} e={k} gehe={gehe} />)}
      {inhalt.bald.map((k) => <Eintrag key={k.id} e={k} gehe={gehe} />)}
      <div style={{ height: 1, background: C.linie, margin: "8px 6px" }} />
      <button type="button" className="hm-eintrag" onClick={ausProfil ? () => gehe({ ansicht: "konto" }) : aendern}>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.grau }}>{ausProfil ? "Klasse im Konto ändern" : "Andere Klasse wählen"}</span>
      </button>
    </>
  );
}

/* ---------- Abmelden mit Bestätigung ---------- */
function AbmeldenFrage({ ja, nein, laeuft }) {
  useEffect(() => {
    const t = (e) => { if (e.key === "Escape") nein(); };
    window.addEventListener("keydown", t);
    return () => window.removeEventListener("keydown", t);
  }, []);
  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="hm-ab-titel" onClick={nein}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(8,23,59,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(380px, 100%)", background: C.weiss, borderRadius: 18, padding: "22px 20px 18px", boxShadow: "0 24px 60px rgba(8,23,59,0.4)", color: C.tinte, fontFamily: "Montserrat, system-ui, sans-serif" }}>
        <p id="hm-ab-titel" style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Wirklich abmelden?</p>
        <p style={{ margin: "8px 0 18px", fontSize: 14, lineHeight: 1.5, color: C.grau }}>Dein Lernstand bleibt im Konto gespeichert. Zum Weitermachen meldest du dich einfach wieder an.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={nein} autoFocus style={{ height: 42, padding: "0 16px", borderRadius: 12, border: `1.5px solid ${C.linie}`, background: C.weiss, fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: C.tinte, cursor: "pointer" }}>Abbrechen</button>
          <button type="button" onClick={ja} disabled={laeuft} data-hm-abmelden-ja style={{ height: 42, padding: "0 16px", borderRadius: 12, border: "none", background: C.seeTief, fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: C.weiss, cursor: "pointer", opacity: laeuft ? 0.6 : 1 }}>
            {laeuft ? "Einen Moment …" : "Abmelden"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Menü-Knopf ☰ (Zeile 1) – das Fenster rendert HauptMenue ---------- */
export function KontoBereich({ offen, setOffen }) {
  const auf = offen === "konto";
  return (
    <button type="button" className="hm-menueknopf" onClick={() => setOffen(auf ? null : "konto")} aria-expanded={auf} aria-haspopup="true"
      aria-label="Menü" title="Menü" data-kein-scroll data-hm-menue>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        {auf ? <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
      </svg>
    </button>
  );
}

/* ---------- Leiste (Zeile 2) mit den Fenstern ---------- */
export function HauptMenue({ gehe, ansicht, foto, seite, offen, setOffen }) {
  const konto = useKonto();
  const [qf, setQf] = useState(qfLesen);
  const [waehlen, setWaehlen] = useState(false);
  const [frage, setFrage] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const leisteRef = useRef(null);
  const [x, setX] = useState(12);
  const ausProfil = !!(konto.profil && konto.profil.schulform && konto.profil.klasse);
  const klasse = klasseErmitteln(konto.profil, qf);
  const stufe = klasse ? klassenInhalt(klasse).stufe : "alle";
  const aktiv = aktiverPunkt(ansicht, seite || foto);

  useEffect(() => {
    if (!offen) return;
    setQf(qfLesen());   // Quickfinder auf der Startseite könnte die Klasse inzwischen geändert haben
    const t = (e) => { if (e.key === "Escape") setOffen(null); };
    window.addEventListener("keydown", t);
    return () => window.removeEventListener("keydown", t);
  }, [offen]);
  useEffect(() => { if (offen !== "klasse") setWaehlen(false); }, [offen]);

  const umschalten = (id, ev) => {
    if (offen === id) { setOffen(null); return; }
    try {
      const knopf = ev.currentTarget.getBoundingClientRect();
      const rahmen = leisteRef.current.getBoundingClientRect();
      const breite = id === "suche" ? 520 : 400;
      setX(Math.max(12, Math.min(knopf.left - rahmen.left, rahmen.width - breite)));
    } catch (e) { setX(12); }
    setOffen(id);
  };
  const geh = (ziel) => { setOffen(null); gehe(ziel); };
  const aktion = (was) => { if (was === "abmelden") { setOffen(null); setFrage(true); } };
  const raus = async () => {
    setLaeuft(true);
    try { await abmelden(); } catch (e) { /* trotzdem schließen */ }
    setLaeuft(false); setFrage(false); setOffen(null);
    gehe({ ansicht: "start" });
  };
  const aktuell = { ansicht, foto, seite };
  const klasseSetzen = (schulart, box) => { qfSchreiben({ schulart, klasse: box }); setQf(qfLesen()); setWaehlen(false); };

  const inhalt = () => {
    if (offen === "konto") return <>{kontoEintraege(konto.profil, !!konto.nutzer).map((e) => <Eintrag key={e.id} e={e} gehe={geh} aktuell={aktuell} aktion={aktion} />)}</>;
    if (offen === "mathilda") return <><Kicker normal>Mathilda AI</Kicker>{KI_MENUE.map((e) => <Eintrag key={e.id} e={e} gehe={geh} aktuell={aktuell} />)}</>;
    if (offen === "kurse") return (
      <>
        <Kicker>Meine Kurse</Kicker>
        {KURSE.map((e) => <Eintrag key={e.id} e={e} gehe={geh} aktuell={aktuell} />)}
        <Kicker>Bald</Kicker>
        {BALD_KURSE.map((e) => <Eintrag key={e.id} e={e} gehe={geh} />)}
      </>
    );
    if (offen === "klasse") return (!klasse || waehlen)
      ? <KlasseWaehlen setze={klasseSetzen} schulartStart={klasse && klasse.schulart} />
      : <KlassenFenster klasse={klasse} ausProfil={ausProfil} gehe={geh} aendern={() => setWaehlen(true)} />;
    if (offen === "training") return <><Kicker>Mein Training</Kicker>{TRAINING.map((e) => <Eintrag key={e.id} e={e} gehe={geh} aktuell={aktuell} />)}</>;
    if (offen === "mathematik") {
      const liste = mathematikEintraege(stufe);
      return (
        <>
          <Kicker>Mathematik</Kicker>
          {liste.filter((e) => !e.abi).map((e) => <Eintrag key={e.id} e={e} gehe={geh} aktuell={aktuell} />)}
          {liste.some((e) => e.abi) && <Kicker>Abi-Vorbereitung</Kicker>}
          {liste.filter((e) => e.abi).map((e) => <Eintrag key={e.id} e={e} gehe={geh} aktuell={aktuell} />)}
        </>
      );
    }
    if (offen === "suche") return <div style={{ padding: "2px 2px 0" }}><SuchBox gehe={geh} /></div>;
    return null;
  };

  return (
    <div ref={leisteRef} style={{ position: "relative" }}>
      <style>{CSS}</style>
      <nav className="hm-leiste" aria-label="Hauptmenü" data-hauptmenue>
        {LEISTE.map((p) => {
          const titel = p.id === "klasse" ? klasseLabel(klasse) : p.name;
          return (
            <button key={p.id} type="button" className={"hm-punkt" + (p.id === "klasse" ? " hm-klasse" : "")} data-hm={p.id} data-kein-scroll
              onClick={(ev) => umschalten(p.id, ev)} aria-expanded={offen === p.id} aria-haspopup="true" data-aktiv={aktiv === p.id ? "" : undefined}
              {...(p.id === "klasse" ? { "data-kein-i18n": true } : {})}>
              {p.id === "mathilda" && <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 999, background: C.flaggold }} />}
              <span>{titel}</span>
              <Pfeil auf={offen === p.id} />
            </button>
          );
        })}
        <button type="button" className="hm-punkt hm-lupe" data-hm="suche" data-kein-scroll onClick={(ev) => umschalten("suche", ev)} aria-expanded={offen === "suche"}
          aria-label="Suche: Was möchtest du lernen?" title="Suche">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
        </button>
      </nav>
      {offen && (
        <>
          <div onClick={() => setOffen(null)} aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 2 }} />
          <div role="dialog" aria-label="Menü" data-sprung="hauptmenue" data-scroll-box className={"hm-fenster" + (offen === "suche" ? " hm-breit" : "") + (offen === "konto" ? " hm-menue" : "")}
            style={{ "--hm-x": `${x}px` }}>
            {inhalt()}
          </div>
        </>
      )}
      {frage && <AbmeldenFrage ja={raus} nein={() => setFrage(false)} laeuft={laeuft} />}
    </div>
  );
}
