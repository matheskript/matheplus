import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { suche, BEISPIELE } from "./suche.js";

/* ======================================================================
   SUCHFELD „Was möchtest du trainieren?“
   Mobil über „So nutzt du die App“, am Desktop über „Mathematik entdecken“
   (beides steht an derselben Stelle der Startseite, siehe func2.jsx).

   Eingabe → Enter → die Box wächst nach unten:
     · klares Thema      → Werkzeuge, Kurse, Formeln (suche.js)
     · zu breit          → Gegenfrage mit Auswahl („Was genau meinst du?“)
     · mehrdeutig/Tippfehler → Vorschläge, danach erst die Werkzeuge
   Die Logik steht in suche.js (reine Funktionen, getestet).
   ====================================================================== */

const L = (de, en) => (englisch() ? en : de);
const T = (paar) => (englisch() ? paar[1] : paar[0]);

const CSS = `
.such-koerper { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .38s cubic-bezier(.3,.7,.2,1); }
.such-koerper.auf { grid-template-rows: 1fr; }
.such-koerper > div { overflow: hidden; min-height: 0; }
.such-chip { font-family: inherit; cursor: pointer; border: 1px solid #D5DEEE; background: #F8FAFD; color: #004D98; border-radius: 999px;
  padding: 9px 14px; font-size: 13.5px; font-weight: 500; line-height: 1.3; text-align: left; transition: background .15s ease, border-color .15s ease; }
.such-chip:hover, .such-chip:focus-visible { background: #E8EFF9; border-color: #8FB0DE; outline: none; }
.such-zeile { font-family: inherit; cursor: pointer; width: 100%; display: flex; align-items: center; gap: 12px; text-align: left; background: #FFFFFF;
  border: 1px solid #E3E8F2; border-radius: 14px; padding: 12px 14px; color: #0F1A33; transition: border-color .15s ease, box-shadow .15s ease; }
.such-zeile:hover, .such-zeile:focus-visible { border-color: #8FB0DE; box-shadow: 0 2px 10px rgba(0,77,152,0.10); outline: none; }
.such-eingabe:focus-within { border-color: #004D98 !important; box-shadow: 0 0 0 3px rgba(0,77,152,0.14); }
.such-eingabe input::placeholder { color: #A3ACC2; font-weight: 300; }
.such-eingabe input::-webkit-search-cancel-button { display: none; }
@media (prefers-reduced-motion: reduce) { .such-koerper { transition: none; } }
`;

const MARKEN = {
  Trainieren: "Trainieren", Entdecken: "Entdecken", Rechnen: "Rechnen", Videokurs: "Videokurs", Formelsammlung: "Formel",
  "Mathe entdecken": "Mathe entdecken", Lernseite: "Lernseite", Programm: "Programm", Prüfung: "Prüfung", "Nach Klasse": "Nach Klasse",
};

function Lupe({ groesse = 20, farbe = C.seeTief }) {
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="9.5" cy="9.5" r="6.2" stroke={farbe} strokeWidth="2" />
      <path d="M14.2 14.2L19 19" stroke={farbe} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function Chip({ o, onWaehle }) {
  return <button type="button" className="such-chip" onClick={() => onWaehle(o.anfrage)}>{T(o.text)}</button>;
}

function Chips({ optionen, onWaehle }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {optionen.map((o) => <Chip key={o.anfrage + o.text[0]} o={o} onWaehle={onWaehle} />)}
    </div>
  );
}

function Frage({ text, children, fuss }) {
  return (
    <div style={{ background: C.himmel, borderRadius: 16, padding: "14px 14px 16px" }}>
      <p style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, lineHeight: 1.5, color: C.tinte }}>{text}</p>
      {children}
      {fuss}
    </div>
  );
}

function Treffer({ x, gehe }) {
  return (
    <button type="button" className="such-zeile" onClick={() => gehe(x.ziel)}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: C.see, background: C.himmel, borderRadius: 999, padding: "3px 8px" }}>
            {MARKEN[x.marke] || x.marke}
          </span>
          {x.typ === "formel" && x.ort && <span style={{ fontSize: 11.5, fontWeight: 400, color: C.hellgrau }}>{x.ort}</span>}
        </span>
        <span style={{ display: "block", fontSize: 15, fontWeight: 600, lineHeight: 1.35, color: C.tinte }}>{x.titel}</span>
        {x.zeile && <span style={{ display: "block", fontSize: 12.5, fontWeight: 300, lineHeight: 1.45, color: C.grau, marginTop: 2 }}>{x.zeile}</span>}
      </span>
      <svg width="9" height="15" viewBox="0 0 9 15" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M1.5 1.5 L7.5 7.5 L1.5 13.5" fill="none" stroke={C.see} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function Gruppe({ g, gehe }) {
  const [alle, setAlle] = useState(false);
  const liste = alle ? [...g.eintraege, ...g.mehr] : g.eintraege;
  return (
    <section style={{ marginTop: 18 }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel }}>{T(g.titel)}</h3>
      <div style={{ display: "grid", gap: 8 }}>
        {liste.map((x) => <Treffer key={x.id} x={x} gehe={gehe} />)}
      </div>
      {g.mehr.length > 0 && !alle && (
        <button type="button" onClick={() => setAlle(true)}
          style={{ fontFamily: "inherit", cursor: "pointer", background: "none", border: "none", padding: "10px 2px 0", fontSize: 13, fontWeight: 600, color: C.see }}>
          {L(`Noch ${g.mehr.length} weitere anzeigen`, `Show ${g.mehr.length} more`)}
        </button>
      )}
    </section>
  );
}

function Ergebnis({ erg, onWaehle, onAlle, gehe }) {
  const q = erg.eingabe;
  const alleZeigen = (
    <button type="button" onClick={onAlle}
      style={{ fontFamily: "inherit", cursor: "pointer", background: "none", border: "none", padding: "12px 2px 0", fontSize: 13, fontWeight: 600, color: C.see, textAlign: "left" }}>
      {L(`Trotzdem alle Treffer zu „${q}“ zeigen`, `Show all results for “${q}” anyway`)}
    </button>
  );

  if (erg.art === "rueckfrage") {
    return (
      <Frage text={T(erg.frage)} fuss={<p style={{ margin: "12px 0 0", fontSize: 12.5, fontWeight: 300, color: C.grau, lineHeight: 1.5 }}>{L("Tippe auf einen Vorschlag oder schreib oben genauer, was du meinst.", "Tap a suggestion or type above what you mean.")}</p>}>
        <Chips optionen={erg.optionen} onWaehle={onWaehle} />
      </Frage>
    );
  }
  if (erg.art === "mehrdeutig" || erg.art === "vorschlag") {
    return (
      <Frage text={T(erg.frage)} fuss={alleZeigen}>
        <Chips optionen={erg.optionen} onWaehle={onWaehle} />
      </Frage>
    );
  }
  if (erg.art === "nichts") {
    return (
      <Frage text={L(`Zu „${q}“ habe ich noch nichts gefunden.`, `I haven't found anything for “${q}” yet.`)}
        fuss={<p style={{ margin: "12px 0 0", fontSize: 12.5, fontWeight: 300, color: C.grau, lineHeight: 1.5 }}>{L("Schreib es etwas anders, zum Beispiel als Thema oder Fachbegriff.", "Try wording it differently, for example as a topic or technical term.")}</p>}>
        <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 300, color: C.grau }}>{L("Wie wäre es mit:", "How about:")}</p>
        <Chips optionen={erg.optionen} onWaehle={onWaehle} />
      </Frage>
    );
  }
  /* Treffer */
  const unbekannt = erg.unbekannt && erg.unbekannt.length && q.split(/\s+/).length <= 4 ? erg.unbekannt : [];
  return (
    <>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 300, color: C.grau, lineHeight: 1.55 }}>
        {L(`Das gibt es zu „${q}“:`, `Here is what there is for “${q}”:`)}
        {unbekannt.length > 0 && <span> {L(`Zu „${unbekannt.join(" ")}“ habe ich nichts gefunden.`, `Nothing found for “${unbekannt.join(" ")}”.`)}</span>}
      </p>
      {erg.gruppen.map((g) => <Gruppe key={g.id + q} g={g} gehe={gehe} />)}
    </>
  );
}

export function SuchBox({ gehe }) {
  const [eingabe, setEingabe] = useState("");
  const [abfrage, setAbfrage] = useState(null);       // { text, erzwingen } nach Enter
  const feld = useRef(null);
  const ergebnisRef = useRef(null);

  const erg = useMemo(() => (abfrage ? suche(abfrage.text, { erzwingen: abfrage.erzwingen }) : { art: "leer" }), [abfrage]);
  const auf = erg.art !== "leer";

  const absenden = (text, erzwingen = false) => {
    const t = String(text ?? "").trim();
    setEingabe(t);
    setAbfrage(t ? { text: t, erzwingen } : null);
    /* Handy: Tastatur einklappen, damit man die Antwort sieht */
    if (t && typeof window !== "undefined" && window.innerWidth < 700 && feld.current) feld.current.blur();
  };
  const leeren = () => { setEingabe(""); setAbfrage(null); if (feld.current) feld.current.focus(); };

  /* Nach jeder neuen Antwort in Sicht holen (die Box wächst nach unten) */
  useEffect(() => {
    if (!abfrage || !ergebnisRef.current) return;
    const id = setTimeout(() => {
      try { ergebnisRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) { /* alte Browser */ }
    }, 120);
    return () => clearTimeout(id);
  }, [abfrage]);

  return (
    <div role="search" data-such-box style={{ background: C.weiss, borderRadius: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", margin: "6px 0 14px", overflow: "hidden",
      border: `1px solid ${auf ? "rgba(0,77,152,0.18)" : C.linie}` }}>
      <style>{CSS}</style>
      <div style={{ padding: "16px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
          <span aria-hidden="true" style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(165deg, #FFE7A0 0%, #F3C93A 40%, #C99A00 100%)", boxShadow: "0 4px 10px rgba(150,110,0,0.3), inset 0 1px 0 rgba(255,255,255,0.7)" }}>
            <Lupe />
          </span>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3, color: C.tinte }}>{L("Was möchtest du gerne trainieren?", "What would you like to practise?")}</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, fontWeight: 300, lineHeight: 1.4, color: C.grau }}>{L("Oder wobei wünschst du dir gerade Hilfe?", "Or where could you use some help right now?")}</p>
          </div>
        </div>

        <form onSubmit={(ev) => { ev.preventDefault(); absenden(eingabe); }} className="such-eingabe"
          style={{ display: "flex", alignItems: "center", gap: 4, background: C.sand, border: `1.5px solid ${C.linie}`, borderRadius: 14, padding: "4px 4px 4px 14px", transition: "border-color .15s ease, box-shadow .15s ease" }}>
          <input ref={feld} type="search" value={eingabe} onChange={(ev) => setEingabe(ev.target.value)}
            onKeyDown={(ev) => { if (ev.key === "Escape") leeren(); }}
            placeholder={L("z. B. Kettenregel, Brüche …", "e.g. chain rule, fractions …")}
            aria-label={L("Was möchtest du trainieren oder wobei brauchst du Hilfe?", "What would you like to practise or what do you need help with?")}
            enterKeyHint="search" autoComplete="off" autoCapitalize="off" spellCheck={false} data-kein-i18n
            style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 16, fontWeight: 500, color: C.tinte, padding: "10px 0" }} />
          {eingabe && (
            <button type="button" onClick={leeren} aria-label={L("Eingabe löschen", "Clear input")}
              style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 999, border: "none", background: "transparent", cursor: "pointer", color: C.grau, fontSize: 20, lineHeight: 1, fontFamily: "inherit" }}>×</button>
          )}
          <button type="submit" aria-label={L("Suchen", "Search")}
            style={{ flexShrink: 0, width: 44, height: 40, borderRadius: 11, border: "none", cursor: "pointer", background: C.see, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lupe groesse={19} farbe={C.weiss} />
          </button>
        </form>

        {!auf && (
          <div style={{ marginTop: 12 }}>
            <p style={{ margin: "0 0 8px", fontSize: 12.5, fontWeight: 300, color: C.grau }}>{L("Zum Beispiel:", "For example:")}</p>
            <Chips optionen={BEISPIELE} onWaehle={(a) => absenden(a)} />
          </div>
        )}
      </div>

      <div className={`such-koerper${auf ? " auf" : ""}`} aria-hidden={!auf}>
        <div>
          <div ref={ergebnisRef} aria-live="polite" style={{ borderTop: `1px solid ${C.linie}`, padding: "16px 14px 20px", display: auf ? "block" : "none" }}>
            {auf && <Ergebnis erg={erg} onWaehle={(a) => absenden(a)} onAlle={() => absenden(abfrage.text, true)} gehe={gehe} />}
          </div>
        </div>
      </div>
    </div>
  );
}
