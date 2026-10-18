import React, { useState, useSyncExternalStore } from "react";
import { C } from "./base1.jsx";
import { MitWurzeln } from "./wurzelZeichen.jsx";
import { penpaperHoeren, uebungBuchen, uebungStand } from "./penpaperSpeicher.js";
import "@fontsource/patrick-hand/400.css";
import "@fontsource/caveat/600.css";

/* ======================================================================
   PEN-&-PAPER-KURS: Bausteine und Übungs-Maschinen
     Tok / Bruch / Term     – Terme als antippbare Bausteine (Häuser, Zäune, Super-Operator)
     Blatt / Zeile          – nachgebaute Heftseiten (Blanko in Druck-Handschrift, Karo in Schreibschrift)
     ZaunMarkierer          – Übung: Final Operatoren („Gartenzäune“) antippen
     Wahl                   – Übung: Auswahlfragen mit sofortiger Rückmeldung
     ResteFinder            – Übung: unvereinfachte Reste antippen und ersetzen
     Haken                  – abhakbare Liste
   Jede Übung bucht ihren Stand über penpaperSpeicher.js (uebungBuchen).
   ====================================================================== */

export const NAVY = C.seeTief;
export const GOLD = C.flaggold;
export const LABEL = "#626D8A";
export const GOLDHELL = "#FFF7D6";
export const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };

export function useUebung(id) {
  return useSyncExternalStore(penpaperHoeren, () => uebungStand(id).geloest, () => false);
}

/* ---------------------------------------------------------------- Term-Bausteine */

/* Text mit ^2 bzw. ^{…} hochgestellt und _1 bzw. _{…} tiefgestellt; Wurzeln √(…) über MitWurzeln */
export function Tok({ s }) {
  const teile = String(s).split(/(\^\{[^}]*\}|\^[^\s{]|_\{[^}]*\}|_[^\s{])/);
  return teile.map((t, i) => {
    if (!t) return null;
    if (t[0] === "^") return <sup key={i} style={{ fontSize: "0.62em", lineHeight: 0, position: "relative", top: "-0.55em", marginLeft: 1 }}>{t.replace(/^\^\{?|\}$/g, "")}</sup>;
    if (t[0] === "_") return <sub key={i} style={{ fontSize: "0.62em", lineHeight: 0, position: "relative", bottom: "-0.25em" }}>{t.replace(/^_\{?|\}$/g, "")}</sub>;
    return t.includes("√") ? <MitWurzeln key={i} text={t} /> : <React.Fragment key={i}>{t}</React.Fragment>;
  });
}

/* Gestapelter Bruch, Bruchstrich auf der Mittellinie */
export function Bruch({ z, n, klein, farbe }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", lineHeight: 1.1, fontSize: klein ? "0.82em" : "0.92em", margin: "0 0.1em" }}>
      <span style={{ padding: "0 0.3em 0.1em" }}><Tok s={z} /></span>
      <span style={{ padding: "0.1em 0.3em 0", borderTop: `1.6px solid ${farbe || "currentColor"}`, marginTop: "-0.8px" }}><Tok s={n} /></span>
    </span>
  );
}

/* Ein Baustein: { t } Text · { f: [z, n] } Bruch · { op, zaun } Operator · { sup: "=" } Super-Operator */
function Baustein({ b }) {
  if (b.f) return <Bruch z={b.f[0]} n={b.f[1]} />;
  if (b.t !== undefined) return <Tok s={b.t} />;
  if (b.op) return <>{b.op}</>;
  if (b.sup) return <>{b.sup}</>;
  return null;
}

/* Term aus Bausteinen.
   modus "neutral": alles mit gleichem Abstand (Ausgangslage der Übungen)
   modus "schoen":  Pen-&-Paper-Abstände (Zäune weit, Garten eng, Häuser als Blöcke)
   modus "markiert": wie schoen, zusätzlich Häuser und Zäune farbig hervorgehoben
   gewaehlt: Set von Indizes (angetippte Operatoren) · onTippe(i): Operator antippbar · loesung: Set richtiger Zäune (zeigt ✓/✗ je Tipp) */
export function Term({ teile, modus = "neutral", gewaehlt, onTippe, loesung, groesse = 22, farbe, nowrap }) {
  const tinte = farbe || C.tinte;
  const haeuser = [];
  if (modus === "markiert") {
    /* Häuser gibt es nur rechts vom Super-Operator (links steht z. B. f(x)) */
    const start = teile.findIndex((b) => b.sup);
    let akt = [];
    teile.forEach((b, i) => {
      if (i < start) return;
      if (b.sup || (b.op && b.zaun)) { if (akt.length) haeuser.push(akt); akt = []; }
      else akt.push(i);
    });
    if (akt.length) haeuser.push(akt);
  }
  const hausVon = (i) => haeuser.findIndex((h) => h.includes(i));
  return (
    <span style={{ display: "inline-flex", flexWrap: nowrap ? "nowrap" : "wrap", whiteSpace: nowrap ? "nowrap" : "normal", alignItems: "center", fontSize: groesse, fontWeight: 500, color: tinte, lineHeight: 1.5, fontVariantNumeric: "lining-nums" }}>
      {teile.map((b, i) => {
        const zaun = !!(b.op && b.zaun);
        const tippbar = !!((onTippe || loesung) && b.op);
        const an = gewaehlt && gewaehlt.has(i);
        let rand = null;
        if (loesung) rand = loesung.has(i) === !!an ? "ok" : "falsch";
        const weite = modus === "neutral" ? "0.32em" : b.sup ? "0.7em" : zaun ? "0.55em" : b.op ? "0.12em" : 0;
        const h = modus === "markiert" ? hausVon(i) : -1;
        const inHaus = h >= 0;
        const ersteImHaus = inHaus && haeuser[h][0] === i, letzteImHaus = inHaus && haeuser[h][haeuser[h].length - 1] === i;
        const stil = {
          margin: `0 ${weite}`, padding: inHaus ? "0.08em 0" : 0,
          paddingLeft: ersteImHaus ? "0.25em" : inHaus ? 0 : undefined, paddingRight: letzteImHaus ? "0.25em" : inHaus ? 0 : undefined,
          background: inHaus ? GOLDHELL : "transparent",
          borderTop: inHaus ? "1.4px dashed #C7A200" : "none", borderBottom: inHaus ? "1.4px dashed #C7A200" : "none",
          borderLeft: ersteImHaus ? "1.4px dashed #C7A200" : "none", borderRight: letzteImHaus ? "1.4px dashed #C7A200" : "none",
          borderRadius: ersteImHaus && letzteImHaus ? 6 : ersteImHaus ? "6px 0 0 6px" : letzteImHaus ? "0 6px 6px 0" : 0,
          color: modus === "markiert" && zaun ? C.gruenDunkel : b.sup ? C.see : tinte,
          fontWeight: (modus === "markiert" && zaun) || b.sup ? 700 : 500,
        };
        if (b.mark) Object.assign(stil, { background: GOLD, color: NAVY, borderRadius: 999, padding: "0 0.38em", fontWeight: 800, margin: "0 0.3em", boxShadow: "0 0 0 3px rgba(237,187,0,0.3)" });
        if (tippbar) {
          return (
            <button key={i} type="button" onClick={onTippe ? () => onTippe(i) : undefined} disabled={!onTippe} aria-pressed={!!an} aria-label={`Zeichen ${b.op}`}
              style={{ ...stil, fontFamily: "inherit", fontSize: "inherit", cursor: onTippe ? "pointer" : "default", lineHeight: 1,
                width: "1.5em", height: "1.5em", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 999,
                border: `1.8px solid ${rand === "ok" ? C.smaragd : rand === "falsch" ? C.signal : an ? NAVY : C.linie}`,
                background: an ? GOLD : "#fff", color: an ? NAVY : C.grau, fontWeight: 800,
                boxShadow: an ? "0 2px 8px rgba(181,134,18,0.35)" : "none", transition: "background .15s, border-color .15s" }}>
              {b.op}
            </button>
          );
        }
        return <span key={i} style={stil}><Baustein b={b} /></span>;
      })}
    </span>
  );
}

/* Kurzschreibweise für Bausteine: "3x^2 | − | 5x | + | 2"  → Zaun-Operatoren mit „|“, Garten-Operatoren mit „‹+›“ im Text */
export function T(s) {
  return s.split("|").map((x) => x.trim()).filter(Boolean).map((x) => {
    if (x === "+" || x === "−") return { op: x, zaun: true };
    if (x === "(+)" || x === "(−)") return { op: x[1], zaun: false };
    if (x === "=") return { sup: "=" };
    const f = x.match(/^\{(.*)\}\/\{(.*)\}$/);
    if (f) return { f: [f[1], f[2]] };
    return { t: x };
  });
}

/* ---------------------------------------------------------------- Heftseiten */

const HAND_BLANKO = { fontFamily: "'Patrick Hand', 'Segoe Print', sans-serif", fontWeight: 400, color: "#101827" };
const HAND_KARO = { fontFamily: "'Caveat', 'Bradley Hand', cursive", fontWeight: 600, color: "#1D3C7A", fontStyle: "italic" };

export function Blatt({ karo, children, minHoehe = 110, groesse, style }) {
  return (
    <div style={{ position: "relative", borderRadius: 12, border: `1px solid ${C.linie}`, padding: karo ? "10px 12px" : "12px 14px", minHeight: minHoehe, background: "#fff",
      ...(karo ? { backgroundImage: "linear-gradient(#C9D7EA 1px, transparent 1px), linear-gradient(90deg, #C9D7EA 1px, transparent 1px)", backgroundSize: "20px 20px", backgroundPosition: "-2px -2px" } : {}),
      ...(karo ? HAND_KARO : HAND_BLANKO), fontSize: groesse || (karo ? 21 : 21), lineHeight: karo ? "20px" : 1.5, letterSpacing: karo ? "-0.4px" : "0.2px", wordSpacing: karo ? "-3px" : "4px", ...style }}>
      {children}
    </div>
  );
}
export const Zeile = ({ children, einr, style }) => <span style={{ display: "block", paddingLeft: einr ? 26 : 0, whiteSpace: "nowrap", ...style }}>{children}</span>;
export const Kasten = ({ children }) => <span style={{ border: "1.8px solid currentColor", borderRadius: 5, padding: "0 7px" }}>{children}</span>;
export const Nebenbox = ({ children, fest }) => (
  <span style={{ ...(fest ? { display: "inline-block", alignSelf: "flex-start" } : { position: "absolute", right: 10, top: 10 }), border: "1.6px solid currentColor", borderRadius: 6, padding: "2px 9px", fontSize: "0.72em", lineHeight: 1.3, textAlign: "left" }}>
    <i style={{ fontStyle: "normal", display: "block", fontSize: "0.68em", letterSpacing: "0.1em" }}>NR</i>{children}
  </span>
);
/* Handschriftlicher Bruch auf dem Blatt */
export const HBruch = ({ z, n }) => (
  <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", lineHeight: 1.05, fontSize: "0.85em", position: "relative", top: "-0.05em", margin: "0 2px" }}>
    <span style={{ padding: "0 3px 1px" }}>{z}</span><span style={{ padding: "1px 3px 0", borderTop: "1.5px solid currentColor" }}>{n}</span>
  </span>
);
/* Handschriftliche Wurzel: ein Linienzug (wurzelZeichen.jsx) */
export const HWurzel = ({ text }) => <MitWurzeln text={`√(${text})`} />;

/* ---------------------------------------------------------------- Rahmen für Übungen */

export function UebungRahmen({ nr, titel, kinder, geloest, children }) {
  return (
    <div style={{ ...karte, padding: "16px 16px 18px", marginTop: 18, borderLeft: `4px solid ${geloest ? C.smaragd : GOLD}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.12em", color: geloest ? C.smaragd : C.gruenDunkel }}>ÜBUNG {nr}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.grau }}>{titel}</span>
        {geloest && <span aria-label="gelöst" style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: C.smaragd }}>✓ gelöst</span>}
      </div>
      {children}
    </div>
  );
}

const knopf = (voll) => ({
  padding: "10px 16px", borderRadius: 999, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer",
  border: `1.5px solid ${NAVY}`, background: voll ? NAVY : "#fff", color: voll ? GOLD : NAVY,
});
export const Rueck = ({ ok, children }) => (
  <p aria-live="polite" style={{ marginTop: 12, padding: "10px 13px", borderRadius: 10, fontSize: 14, lineHeight: 1.6, color: C.tinte,
    background: ok ? "#EAF6EF" : "#FBEFE8", borderLeft: `3px solid ${ok ? C.smaragd : C.signal}` }}>
    <b style={{ color: ok ? C.smaragd : C.signal }}>{ok ? "Richtig. " : "Noch nicht. "}</b>{children}
  </p>
);
const Fortschritt = ({ i, n }) => (
  <div aria-hidden="true" style={{ display: "flex", gap: 4, marginBottom: 12 }}>
    {Array.from({ length: n }, (_, k) => <span key={k} style={{ flex: 1, height: 4, borderRadius: 2, background: k < i ? GOLD : k === i ? NAVY : C.linie }} />)}
  </div>
);

/* ---------------------------------------------------------------- Übung: Zäune antippen */

/* items: [{ teile, hinweis }] – Zäune stecken in teile (op.zaun). Der Schüler tippt alle Zäune an, dann „Prüfen“. */
export function ZaunMarkierer({ id, items, aufgabe }) {
  const [i, setI] = useState(0);
  const [wahl, setWahl] = useState(new Set());
  const [geprueft, setGeprueft] = useState(false);
  const [fertig, setFertig] = useState(false);
  const it = items[i];
  const loesung = new Set(it.teile.map((b, k) => (b.op && b.zaun ? k : -1)).filter((k) => k >= 0));
  const richtig = geprueft && wahl.size === loesung.size && [...wahl].every((k) => loesung.has(k));
  const tippe = (k) => { if (geprueft) return; const n = new Set(wahl); n.has(k) ? n.delete(k) : n.add(k); setWahl(n); };
  const pruefe = () => { setGeprueft(true); if (i === items.length - 1 && wahl.size === loesung.size && [...wahl].every((k) => loesung.has(k))) { setFertig(true); uebungBuchen(id, true); } };
  const weiter = () => { if (i < items.length - 1) { setI(i + 1); setWahl(new Set()); setGeprueft(false); } };
  const nochmal = () => { setWahl(new Set()); setGeprueft(false); };
  const vonVorn = () => { setI(0); setWahl(new Set()); setGeprueft(false); setFertig(false); };
  return (
    <>
      <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, marginBottom: 10 }}>{aufgabe}</p>
      <Fortschritt i={i} n={items.length} />
      <div style={{ padding: "16px 14px", borderRadius: 12, background: "#FAFBFE", border: `1px solid ${C.linie}`, overflowX: "auto" }}>
        <Term teile={it.teile} modus={geprueft && richtig ? "markiert" : "neutral"} gewaehlt={wahl} onTippe={geprueft ? null : tippe} loesung={geprueft ? loesung : null} />
      </div>
      <p style={{ fontSize: 12.5, color: LABEL, margin: "6px 0 0" }}>{wahl.size} angetippt{geprueft && richtig ? ` · ${loesung.size} ${loesung.size === 1 ? "Zaun" : "Zäune"}, also ${loesung.size + 1} Häuser` : ""}</p>
      {geprueft && <Rueck ok={richtig}>{richtig ? it.hinweis : it.fehler || it.hinweis}</Rueck>}
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        {!geprueft && <button type="button" onClick={pruefe} style={knopf(true)}>Prüfen</button>}
        {geprueft && !richtig && <button type="button" onClick={nochmal} style={knopf(true)}>Noch einmal</button>}
        {geprueft && richtig && i < items.length - 1 && <button type="button" onClick={weiter} style={knopf(true)}>Nächster Term</button>}
        {(fertig || (geprueft && richtig && i === items.length - 1)) && <button type="button" onClick={vonVorn} style={knopf(false)}>Von vorn</button>}
      </div>
      {fertig && <p style={{ marginTop: 10, fontSize: 14, fontWeight: 600, color: C.smaragd }}>Alle {items.length} Terme richtig zerlegt.</p>}
    </>
  );
}

/* ---------------------------------------------------------------- Übung: Auswahl */

/* items: [{ frage: node, optionen: [node], richtig: index, erklaerung }] */
export function Wahl({ id, items, aufgabe, spalten = 1 }) {
  const [i, setI] = useState(0);
  const [tipp, setTipp] = useState(null);
  const [fehler, setFehler] = useState(0);
  const [fertig, setFertig] = useState(false);
  const it = items[i];
  const ok = tipp !== null && tipp === it.richtig;
  const waehle = (k) => {
    if (tipp !== null && ok) return;
    setTipp(k);
    if (k !== it.richtig) setFehler(fehler + 1);
    else if (i === items.length - 1) { setFertig(true); uebungBuchen(id, fehler === 0); }
  };
  const weiter = () => { setI(i + 1); setTipp(null); };
  const vonVorn = () => { setI(0); setTipp(null); setFehler(0); setFertig(false); };
  return (
    <>
      {aufgabe && <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, marginBottom: 10 }}>{aufgabe}</p>}
      <Fortschritt i={i} n={items.length} />
      <div style={{ fontSize: 16, color: C.tinte, lineHeight: 1.6, marginBottom: 12, minHeight: 28 }}>{it.frage}</div>
      <div style={{ display: "grid", gridTemplateColumns: spalten === 3 ? "repeat(auto-fill, minmax(92px, 1fr))" : `repeat(${spalten}, minmax(0, 1fr))`, gap: 8 }}>
        {it.optionen.map((o, k) => {
          const gew = tipp === k;
          const farbe = gew ? (k === it.richtig ? C.smaragd : C.signal) : ok && k === it.richtig ? C.smaragd : C.linie;
          return (
            <button key={k} type="button" onClick={() => waehle(k)} aria-pressed={gew}
              style={{ textAlign: "left", padding: "11px 13px", borderRadius: 12, fontFamily: "inherit", fontSize: 16, color: C.tinte, cursor: "pointer",
                border: `1.8px solid ${farbe}`, background: gew ? (k === it.richtig ? "#EAF6EF" : "#FBEFE8") : "#fff", display: "flex", alignItems: "center", gap: 10, minHeight: 46 }}>
              <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: 999, flexShrink: 0, border: `1.6px solid ${farbe === C.linie ? C.hellgrau : farbe}`, background: gew ? farbe : "transparent", color: "#fff", fontSize: 12, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {gew ? (k === it.richtig ? "✓" : "✗") : ""}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", flexWrap: "wrap", minWidth: 0 }}>{o}</span>
            </button>
          );
        })}
      </div>
      {tipp !== null && <Rueck ok={ok}>{ok ? it.erklaerung : it.falsch || "Schau noch einmal hin."}</Rueck>}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {ok && i < items.length - 1 && <button type="button" onClick={weiter} style={knopf(true)}>Weiter</button>}
        {fertig && <button type="button" onClick={vonVorn} style={knopf(false)}>Von vorn</button>}
      </div>
      {fertig && <p style={{ marginTop: 10, fontSize: 14, fontWeight: 600, color: C.smaragd }}>{fehler === 0 ? "Alles auf Anhieb richtig." : `Geschafft – ${fehler} ${fehler === 1 ? "Fehlversuch" : "Fehlversuche"}. Noch einmal ohne?`}</p>}
    </>
  );
}

/* ---------------------------------------------------------------- Übung: Reste finden */

/* items: [{ teile, rest: index des Bausteins, der nicht stehen bleiben darf, optionen: [node], richtig, erklaerung }] */
export function ResteFinder({ id, items, aufgabe }) {
  const [i, setI] = useState(0);
  const [tipp, setTipp] = useState(null);        // angetippter Baustein
  const [wahl, setWahl] = useState(null);        // gewählte Korrektur
  const [fehler, setFehler] = useState(0);
  const [fertig, setFertig] = useState(false);
  const it = items[i];
  const restOk = tipp === it.rest;
  const wahlOk = wahl !== null && wahl === it.richtig;
  const tippe = (k) => { if (restOk) return; setTipp(k); if (k !== it.rest) setFehler(fehler + 1); };
  const waehle = (k) => {
    if (wahlOk) return;
    setWahl(k);
    if (k !== it.richtig) setFehler(fehler + 1);
    else if (i === items.length - 1) { setFertig(true); uebungBuchen(id, fehler === 0); }
  };
  const weiter = () => { setI(i + 1); setTipp(null); setWahl(null); };
  const vonVorn = () => { setI(0); setTipp(null); setWahl(null); setFehler(0); setFertig(false); };
  return (
    <>
      <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, marginBottom: 10 }}>{aufgabe}</p>
      <Fortschritt i={i} n={items.length} />
      <div style={{ padding: "14px 12px", borderRadius: 12, background: "#FAFBFE", border: `1px solid ${C.linie}`, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 4px", fontSize: 22, color: C.tinte, fontWeight: 500 }}>
        {it.teile.map((b, k) => {
          const an = tipp === k;
          const farbe = an ? (k === it.rest ? C.smaragd : C.signal) : C.linie;
          return (
            <button key={k} type="button" onClick={() => tippe(k)} aria-pressed={an} disabled={restOk && !an}
              style={{ fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit", color: "inherit", cursor: restOk ? "default" : "pointer", padding: "4px 8px", borderRadius: 9,
                border: `1.8px solid ${farbe}`, background: an ? (k === it.rest ? "#EAF6EF" : "#FBEFE8") : "#fff", lineHeight: 1.4 }}>
              <Baustein b={b} />
            </button>
          );
        })}
      </div>
      {tipp !== null && !restOk && <Rueck ok={false}>Das darf so stehen. Was darf nicht stehen bleiben?</Rueck>}
      {restOk && (
        <>
          <p style={{ fontSize: 14, color: C.tinte, margin: "12px 0 8px" }}><b>Gefunden.</b> Und wie muss es heißen?</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
            {it.optionen.map((o, k) => {
              const gew = wahl === k;
              const farbe = gew ? (k === it.richtig ? C.smaragd : C.signal) : C.linie;
              return (
                <button key={k} type="button" onClick={() => waehle(k)} aria-pressed={gew}
                  style={{ padding: "10px 6px", borderRadius: 12, fontFamily: "inherit", fontSize: 19, fontWeight: 500, color: C.tinte, cursor: "pointer",
                    border: `1.8px solid ${farbe}`, background: gew ? (k === it.richtig ? "#EAF6EF" : "#FBEFE8") : "#fff" }}>
                  {o}
                </button>
              );
            })}
          </div>
          {wahl !== null && <Rueck ok={wahlOk}>{wahlOk ? it.erklaerung : "Das ist noch nicht die kürzeste Form."}</Rueck>}
        </>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {wahlOk && i < items.length - 1 && <button type="button" onClick={weiter} style={knopf(true)}>Weiter</button>}
        {fertig && <button type="button" onClick={vonVorn} style={knopf(false)}>Von vorn</button>}
      </div>
      {fertig && <p style={{ marginTop: 10, fontSize: 14, fontWeight: 600, color: C.smaragd }}>{fehler === 0 ? "Kein Rest ist dir entgangen." : `Alle Reste gefunden – ${fehler} ${fehler === 1 ? "Fehlversuch" : "Fehlversuche"}.`}</p>}
    </>
  );
}

/* ---------------------------------------------------------------- Abhakliste */

export function Haken({ punkte, an, schalte, spalten = 1 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${spalten}, minmax(0, 1fr))`, gap: "6px 14px" }}>
      {punkte.map((p, k) => {
        const a = an(k);
        return (
          <label key={k} style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", fontSize: 14.5, lineHeight: 1.5, color: C.tinte, padding: "6px 0" }}>
            <input type="checkbox" checked={a} onChange={() => schalte(k, !a)} style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} />
            <span aria-hidden="true" style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 7, marginTop: 1, border: `1.8px solid ${a ? NAVY : C.hellgrau}`, background: a ? NAVY : "#fff", color: GOLD, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>{a ? "✓" : ""}</span>
            <span style={{ textDecoration: a ? "line-through" : "none", textDecorationColor: C.hellgrau, color: a ? C.grau : C.tinte }}>{p}</span>
          </label>
        );
      })}
    </div>
  );
}
