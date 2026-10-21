/* ============================================================
   Kurs GFS – gemeinsame Bausteine aller Themenseiten
   (Pascal’sches Dreieck, Die optimale Dose, …): Formelzeilen, Schritt,
   Kasten, Chips, Roter Faden für den Vortrag, Kolloquium-Training.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useState, useRef, useEffect } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";

export const FLIESS = { color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 16 };
export const KARTE = { background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };

/* ---------- Kleine Bausteine ---------- */

/* Formelzeilen, gemeinsam so verkleinert, dass die längste Zeile in die Breite passt */
export function Formeln({ titel, zeilen, max = 17, min = 10.5, farbe = C.tinte }) {
  const rahmen = useRef(null), innen = useRef(null);
  const [gr, setGr] = useState(max);
  useEffect(() => {
    const anpassen = () => {
      if (!rahmen.current || !innen.current) return;
      const breite = innen.current.scrollWidth * (max / parseFloat(getComputedStyle(innen.current).fontSize));
      const neu = Math.max(min, Math.min(max, Math.floor((max * (rahmen.current.clientWidth - 4) / breite) * 10) / 10));
      setGr((alt) => (Math.abs(alt - neu) < 0.25 ? alt : neu));   // kleine Rundungssprünge ignorieren – sonst Pendeln 12 ↔ 11,9 px
    };
    anpassen();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(anpassen) : null;
    if (ro && rahmen.current) ro.observe(rahmen.current);
    return () => { if (ro) ro.disconnect(); };
  }, [zeilen.join("\n"), max, min]);
  return (
    <div style={{ margin: "14px 0 18px" }}>
      {titel && <p style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8, letterSpacing: "0.01em" }}>{titel}</p>}
      <div ref={rahmen} style={{ overflowX: "auto", overflowY: "hidden" }}>
        <div ref={innen} style={{ width: "max-content", fontSize: gr, color: farbe, paddingLeft: 4 }}>
          {zeilen.map((z, i) => (
            <div key={i} style={{ lineHeight: 2.4, whiteSpace: "nowrap" }}><M t={z} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Schritt({ nr, titel }) {
  return (
    <div className="flex items-center" style={{ gap: 12, margin: "30px 0 12px" }}>
      <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 999, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`,
        color: C.flaggold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800 }}>{nr}</span>
      <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, color: C.tinte }}>{titel}</h3>
    </div>
  );
}

export function Kasten({ titel, children }) {
  return (
    <div style={{ background: C.weiss, borderLeft: `4px solid ${C.flaggold}`, borderRadius: 12, padding: "12px 16px 4px", margin: "6px 0 18px",
      boxShadow: "0 2px 12px rgba(15,26,51,0.05)" }}>
      <p style={{ fontSize: 12.5, fontWeight: 700, color: "#A67C00", letterSpacing: "0.02em", textTransform: "uppercase" }}>{titel}</p>
      {children}
    </div>
  );
}

export function Chip({ aktiv, onClick, children }) {
  return (
    <button onClick={onClick} className="px-4 py-2"
      style={{ background: aktiv ? C.see : C.weiss, color: aktiv ? C.weiss : C.grau, border: `1px solid ${aktiv ? C.see : C.linie}`,
        borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
      {children}
    </button>
  );
}

export function PlusMinus({ setzen, label }) {
  const knopf = (zeichen, delta) => (
    <button onClick={() => setzen(delta)} aria-label={`${label} ${delta > 0 ? "erhöhen" : "verringern"}`}
      style={{ width: 30, height: 24, borderRadius: 8, border: "none", background: delta > 0 ? C.see : C.seeTief, color: C.weiss,
        fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1 }}>{zeichen}</button>
  );
  return <div className="flex flex-col" style={{ gap: 4 }}>{knopf("+", 1)}{knopf("−", -1)}</div>;
}

export const Kicker = ({ children }) => <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>{children}</p>;
export const H3 = ({ children }) => <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 14 }}>{children}</h3>;
export const Trenner = () => <div style={{ height: 1, background: C.linie, margin: "30px 0 26px" }} />;

export const ZELLE = (stand) => ({
  width: 64, boxSizing: "border-box", padding: "8px 6px", fontSize: 16, fontFamily: "inherit", textAlign: "center", borderRadius: 10, outline: "none",
  border: `1.5px solid ${stand === true ? C.see : stand === false ? C.signal : C.linie}`, background: stand === true ? C.himmel : C.weiss, color: C.tinte,
});

/* Text mit $…$-Formeln innerhalb einer Zeile (z. B. in Knöpfen, wo kein <p> stehen darf) */
export const Inline = ({ s }) => <>{String(s).split("$").map((t, i) => (i % 2 === 1 ? <M key={i} t={t} /> : <span key={i}>{t}</span>))}</>;

/* ---------- GFS-Teil: roter Faden ---------- */

export function RoterFaden({ gliederung = [], tipps = [], hinweis }) {
  const summe = gliederung.reduce((s, g) => s + g.min, 0);
  return (
    <div>
      <p style={{ ...FLIESS, marginBottom: 18 }}>
        Rund {summe} Minuten Vortrag in fünf Abschnitten. Die Minuten sind ein Richtwert – frag deine Lehrkraft,
        wie lang die GFS sein soll, und strecke oder kürze vor allem {hinweis || "den Abschnitt mit den Mustern"}.
      </p>
      <div style={{ position: "relative", paddingLeft: 30 }}>
        <div style={{ position: "absolute", left: 11, top: 8, bottom: 8, width: 2, background: C.linie, borderRadius: 2 }} />
        {gliederung.map((g, i) => (
          <div key={g.titel} style={{ position: "relative", marginBottom: 14 }}>
            <span style={{ position: "absolute", left: -30, top: 14, width: 24, height: 24, borderRadius: 999, background: C.seeTief, color: C.flaggold,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{i + 1}</span>
            <div style={{ ...KARTE, padding: "14px 16px" }}>
              <div className="flex items-baseline" style={{ gap: 10, marginBottom: 4 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte }}>{g.titel}</p>
                <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: C.see, whiteSpace: "nowrap" }}>{g.min} min</span>
              </div>
              <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.65 }}>{g.text}</p>
            </div>
          </div>
        ))}
      </div>
      <Kasten titel="Drei Tipps für den Vortrag">
        <ul style={{ margin: "8px 0 10px", paddingLeft: 18, listStyle: "disc" }}>
          {tipps.map((t) => <li key={t} style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.7, marginBottom: 6 }}>{t}</li>)}
        </ul>
      </Kasten>
    </div>
  );
}

/* ---------- GFS-Teil: Kolloquium-Training ---------- */

const lesen = (SPEICHER) => { try { return JSON.parse(localStorage.getItem(SPEICHER) || "[]"); } catch (e) { return []; } };
const schreiben = (SPEICHER, l) => { try { localStorage.setItem(SPEICHER, JSON.stringify(l)); } catch (e) { /* ohne Speicher geht es auch */ } };

export function Kolloquium({ fragen: KOLLOQUIUM, speicher: SPEICHER }) {
  const [gekonnt, setGekonnt] = useState(() => new Set(lesen(SPEICHER)));
  const [idx, setIdx] = useState(0);
  const [offen, setOffen] = useState(false);
  const [alle, setAlle] = useState(false);
  const f = KOLLOQUIUM[idx];

  const merken = (ok) => {
    const s = new Set(gekonnt);
    if (ok) s.add(idx); else s.delete(idx);
    setGekonnt(s); schreiben(SPEICHER, [...s]);
    /* nächste Frage, die noch nicht sitzt */
    const rest = KOLLOQUIUM.map((_, i) => i).filter((i) => !s.has(i) && i !== idx);
    setIdx(rest.length ? rest[Math.floor(Math.random() * rest.length)] : (idx + 1) % KOLLOQUIUM.length);
    setOffen(false);
  };
  const zuruecksetzen = () => { setGekonnt(new Set()); schreiben(SPEICHER, []); setIdx(0); setOffen(false); };

  const anteil = gekonnt.size / KOLLOQUIUM.length;
  const stufenFarbe = { Basis: C.see, Vertiefung: C.gruenDunkel, Profi: C.signal };

  return (
    <div>
      <p style={{ ...FLIESS, marginBottom: 16 }}>
        Nach dem Vortrag kommen Fragen. Lies die Frage, antworte laut in zwei, drei Sätzen – erst dann aufdecken
        und ehrlich einschätzen. Was noch nicht sitzt, kommt wieder.
      </p>

      <div className="flex items-center" style={{ gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 8, background: C.linie, borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${anteil * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, transition: "width .3s" }} />
        </div>
        <span style={{ fontSize: 13, color: C.grau, whiteSpace: "nowrap" }}>{gekonnt.size} von {KOLLOQUIUM.length} sitzen</span>
      </div>

      <div style={{ ...KARTE, background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss }}>
        <div className="flex items-center" style={{ gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: C.flaggold }}>Frage {idx + 1} · {f.stufe}</span>
          {gekonnt.has(idx) && <span style={{ marginLeft: "auto", fontSize: 12, color: C.goldText }}>sitzt schon</span>}
        </div>
        <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.4, marginBottom: 16 }}>{f.frage}</p>
        {offen ? (
          <>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", color: C.flaggold, marginBottom: 6 }}>SO KANNST DU ANTWORTEN</p>
              <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.75, color: "#E6ECF8" }}>{f.antwort}</p>
            </div>
            <div className="flex flex-wrap" style={{ gap: 10 }}>
              <button onClick={() => merken(true)} className="px-5 py-3"
                style={{ background: C.flaggold, color: C.tinte, border: "none", borderRadius: 999, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                Konnte ich
              </button>
              <button onClick={() => merken(false)} className="px-5 py-3"
                style={{ background: "transparent", color: C.weiss, border: "1px solid rgba(255,255,255,0.45)", borderRadius: 999, fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                Noch nicht
              </button>
            </div>
          </>
        ) : (
          <button onClick={() => setOffen(true)} className="px-5 py-3"
            style={{ background: C.weiss, color: C.see, border: "none", borderRadius: 999, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
            Antwort aufdecken
          </button>
        )}
      </div>

      <div className="flex flex-wrap" style={{ gap: 16, marginTop: 14 }}>
        <button onClick={() => setAlle(!alle)}
          style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
          {alle ? "Liste schließen" : "Alle Fragen auf einen Blick"}
        </button>
        {gekonnt.size > 0 && (
          <button onClick={zuruecksetzen}
            style={{ background: "none", border: "none", color: C.grau, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
            Von vorn beginnen
          </button>
        )}
      </div>

      {alle && (
        <div style={{ marginTop: 14 }}>
          {KOLLOQUIUM.map((q, i) => (
            <button key={q.frage} onClick={() => { setIdx(i); setOffen(false); }} className="w-full"
              style={{ display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left", background: i === idx ? C.himmel : C.weiss,
                border: `1px solid ${C.linie}`, borderRadius: 12, padding: "10px 12px", marginBottom: 6, fontFamily: "inherit", cursor: "pointer", color: C.tinte }}>
              <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: 999, marginTop: 7, background: gekonnt.has(i) ? C.flaggold : C.linie }} />
              <span style={{ flex: 1, fontSize: 14, lineHeight: 1.5 }}>{q.frage}</span>
              <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: stufenFarbe[q.stufe], marginTop: 3 }}>{q.stufe}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
