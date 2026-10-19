/* ======================================================================
   HAUPTMENÜ in der Kopfleiste (Oberfläche). Daten und Logik: hauptmenue.js.

   Es gibt nur noch EINE Kopfzeile: Logo · Konto-Chip (Anfangsbuchstabe, nur angemeldet) · Menü-Knopf ☰.
   Das ☰-Fenster (rechts) enthält alles in einer Liste:
     Suche · Mathilda ▾ · Meine Kurse ▾ · Klasse 10 (G9) ▾ · Mein Training ▾ · Mathematik ▾
     darunter die Konto-Punkte (Mein Konto, Fortschritt, Pro, Datenschutz …)
     und ganz unten „Abmelden“ (mit Bestätigung) bzw. „Anmelden“.
   Die Abschnitte klappen im Fenster auf (immer nur einer offen); Klick daneben oder Esc schließt.
   ====================================================================== */
import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { useKonto, abmelden } from "./konto.js";
import { SuchBox } from "./funcSuche.jsx";
import { SCHULARTEN, klassenBoxen } from "./schulbuch.js";
import {
  LEISTE, KI_MENUE, TRAINING, KURSE, BALD_KURSE, kontoEintraege, zugangEintrag, klasseErmitteln, klasseLabel,
  klassenInhalt, mathematikEintraege, aktiverPunkt,
} from "./hauptmenue.js";

const QF = "matheplus-quickfinder";
const qfLesen = () => { try { return JSON.parse(localStorage.getItem(QF) || "null"); } catch (e) { return null; } };
const qfSchreiben = (teil) => {
  try { localStorage.setItem(QF, JSON.stringify({ ...(qfLesen() || {}), ...teil, kapitel: null, teil: null })); } catch (e) { /* privat */ }
};

const CSS = `
.hm-fenster{position:absolute;right:12px;top:2px;z-index:3;width:min(88vw,360px);background:${C.weiss};color:${C.tinte};border-radius:16px;
  box-shadow:0 18px 44px rgba(8,23,59,0.34);max-height:min(80vh,700px);overflow-y:auto;padding:6px;font-family:Montserrat,system-ui,sans-serif}
@media (min-width:700px){.hm-fenster{width:360px}}
.hm-eintrag{display:flex;width:100%;align-items:center;gap:10px;text-align:left;padding:9px 11px;border-radius:10px;border:none;background:transparent;
  font-family:inherit;cursor:pointer;color:${C.tinte}}
.hm-eintrag:hover{background:${C.himmel}}
.hm-eintrag[aria-current="page"]{background:rgba(237,187,0,0.14)}
.hm-kicker{font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${C.grau};padding:10px 11px 4px;margin:0}
.hm-menueknopf{width:40px;height:40px;border-radius:999px;border:1.5px solid rgba(255,255,255,0.45);background:transparent;color:#fff;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;padding:0;position:relative}
.hm-menueknopf:hover,.hm-menueknopf[aria-expanded="true"]{background:rgba(255,255,255,0.12);border-color:${C.flaggold}}
.hm-chip{width:40px;height:40px;border-radius:999px;border:2px solid ${C.flaggold};background:${C.seeTief};color:${C.flaggold};cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;padding:0;font-family:inherit;font-size:17px;font-weight:800;line-height:1}
.hm-chip:hover{background:rgba(237,187,0,0.16)}
.hm-ak{display:flex;width:100%;align-items:center;gap:8px;text-align:left;padding:13px 12px;border-radius:10px;border:none;background:transparent;
  font-family:inherit;font-size:15px;font-weight:700;color:${C.tinte};cursor:pointer}
.hm-ak:hover{background:${C.himmel}}
.hm-ak[aria-expanded="true"]{background:rgba(237,187,0,0.14)}
.hm-ak[data-aktiv]{color:${C.see}}
.hm-ak.hm-klasse{background:rgba(237,187,0,0.14);box-shadow:inset 0 0 0 1.5px rgba(237,187,0,0.6);margin:3px 0}
.hm-ak-inhalt{margin:2px 4px 8px 14px;padding-left:6px;border-left:2px solid ${C.flaggold}}
.hm-linie{height:1px;background:${C.linie};margin:6px 8px}
.hm-konto .hm-eintrag{padding:10px 12px}
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
      {e.id === "anmelden" && (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.grau} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 7l5 5-5 5" /><path d="M15 12H4" />
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


/* ---------- Kopfzeile: Konto-Chip (nur angemeldet) + Menü-Knopf ☰ ---------- */
export function KontoBereich({ offen, setOffen, gehe }) {
  const konto = useKonto();
  const auf = offen === "menue";
  const quelle = (konto.profil && konto.profil.name) || (konto.nutzer && konto.nutzer.email) || "";
  const anfang = (String(quelle).trim().charAt(0) || "·").toLocaleUpperCase("de-DE");
  return (
    <>
      <style>{CSS}</style>
      {konto.nutzer && (
        <button type="button" className="hm-chip" onClick={() => { setOffen(null); gehe && gehe({ ansicht: "konto" }); }}
          aria-label="Mein Konto" title="Mein Konto" data-kein-scroll data-kein-i18n data-hm-chip>{anfang}</button>
      )}
      <button type="button" className="hm-menueknopf" onClick={() => setOffen(auf ? null : "menue")} aria-expanded={auf} aria-haspopup="true"
        aria-label="Menü" title="Menü" data-kein-scroll data-hm-menue>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          {auf ? <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
        </svg>
      </button>
    </>
  );
}

/* ---------- Aufklapp-Zeile im Menü ---------- */
function Abschnitt({ id, titel, offen, setze, aktiv, klasse, children, ...rest }) {
  const auf = offen === id;
  return (
    <div>
      <button type="button" className={"hm-ak" + (klasse ? " hm-klasse" : "")} data-hm={id} data-kein-scroll aria-expanded={auf} aria-haspopup="true"
        data-aktiv={aktiv ? "" : undefined} onClick={() => setze(auf ? null : id)} {...rest}>
        {id === "mathilda" && <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 999, background: C.flaggold, flexShrink: 0 }} />}
        {id === "suche" && (
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
        )}
        <span style={{ flex: 1, minWidth: 0 }}>{titel}</span>
        <Pfeil auf={auf} farbe={C.see} />
      </button>
      {auf && <div className="hm-ak-inhalt">{children}</div>}
    </div>
  );
}

/* ---------- Das Menü (Fenster hinter ☰) ---------- */
export function HauptMenue({ gehe, ansicht, foto, seite, offen, setOffen }) {
  const konto = useKonto();
  const [qf, setQf] = useState(qfLesen);
  const [abschnitt, setAbschnitt] = useState(null);
  const [waehlen, setWaehlen] = useState(false);
  const [frage, setFrage] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const ausProfil = !!(konto.profil && konto.profil.schulform && konto.profil.klasse);
  const klasse = klasseErmitteln(konto.profil, qf);
  const stufe = klasse ? klassenInhalt(klasse).stufe : "alle";
  const aktiv = aktiverPunkt(ansicht, seite || foto);
  const istOffen = offen === "menue";

  useEffect(() => {
    if (!istOffen) { setAbschnitt(null); setWaehlen(false); return; }
    setQf(qfLesen());   // Quickfinder auf der Startseite könnte die Klasse inzwischen geändert haben
    const t = (e) => { if (e.key === "Escape") setOffen(null); };
    window.addEventListener("keydown", t);
    return () => window.removeEventListener("keydown", t);
  }, [istOffen]);

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
  const liste = (eintraege) => eintraege.map((e) => <Eintrag key={e.id} e={e} gehe={geh} aktuell={aktuell} />);

  const inhalt = (id) => {
    if (id === "suche") return <div style={{ padding: "2px 2px 0" }}><SuchBox gehe={geh} /></div>;
    if (id === "mathilda") return <>{liste(KI_MENUE)}</>;
    if (id === "kurse") return (
      <>
        {liste(KURSE)}
        <Kicker>Bald</Kicker>
        {BALD_KURSE.map((e) => <Eintrag key={e.id} e={e} gehe={geh} />)}
      </>
    );
    if (id === "klasse") return (!klasse || waehlen)
      ? <KlasseWaehlen setze={klasseSetzen} schulartStart={klasse && klasse.schulart} />
      : <KlassenFenster klasse={klasse} ausProfil={ausProfil} gehe={geh} aendern={() => setWaehlen(true)} />;
    if (id === "training") return <>{liste(TRAINING)}</>;
    if (id === "mathematik") {
      const eintraege = mathematikEintraege(stufe);
      return (
        <>
          {liste(eintraege.filter((e) => !e.abi))}
          {eintraege.some((e) => e.abi) && <Kicker>Abi-Vorbereitung</Kicker>}
          {liste(eintraege.filter((e) => e.abi))}
        </>
      );
    }
    return null;
  };

  return (
    <div style={{ position: "relative", height: 0 }}>
      <style>{CSS}</style>
      {istOffen && (
        <>
          <div onClick={() => setOffen(null)} aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 2 }} />
          <div role="dialog" aria-label="Menü" data-sprung="hauptmenue" data-scroll-box className="hm-fenster hm-menue" data-hauptmenue>
            <Abschnitt id="suche" titel="Was möchtest du lernen?" offen={abschnitt} setze={setAbschnitt}>{inhalt("suche")}</Abschnitt>
            {LEISTE.map((p) => (
              <Abschnitt key={p.id} id={p.id} titel={p.id === "klasse" ? klasseLabel(klasse) : p.name} offen={abschnitt} setze={setAbschnitt}
                aktiv={aktiv === p.id} klasse={p.id === "klasse"} {...(p.id === "klasse" ? { "data-kein-i18n": true } : {})}>
                {inhalt(p.id)}
              </Abschnitt>
            ))}
            <div className="hm-linie" />
            <div className="hm-konto">
              <Kicker>Konto</Kicker>
              {kontoEintraege(konto.profil, !!konto.nutzer).map((e) => <Eintrag key={e.id} e={e} gehe={geh} aktuell={aktuell} />)}
            </div>
            <div className="hm-linie" />
            <div className="hm-konto"><Eintrag e={zugangEintrag(!!konto.nutzer)} gehe={geh} aktuell={aktuell} aktion={aktion} /></div>
          </div>
        </>
      )}
      {frage && <AbmeldenFrage ja={raus} nein={() => setFrage(false)} laeuft={laeuft} />}
    </div>
  );
}
