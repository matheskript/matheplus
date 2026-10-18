import React, { useState } from "react";
import { C } from "./base1.jsx";
import { karte, Kicker } from "./funcKontoRollen.jsx";
import { SPENDEN, euro, wege, mindestensEinWeg } from "./spenden.js";

/* ======================================================================
   Spenden für die KI-Kosten (Elternkonto). Logik und Zahlungsdaten: spenden.js
   Freiwillig, ohne Gegenleistung, keine Spendenquittung.
   ====================================================================== */

const NAVY = "#0B1E4A";
const text = { fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.65 };

const betragKnopf = (an) => ({
  height: 64, borderRadius: 16, cursor: "pointer", fontFamily: "inherit", fontSize: 24, fontWeight: 800, letterSpacing: "-0.01em",
  border: `2px solid ${an ? C.flaggold : C.linie}`, background: an ? "#FFF8DD" : C.weiss, color: an ? NAVY : C.tinte,
  boxShadow: an ? "0 2px 12px rgba(237,187,0,0.25)" : "none", transition: "border-color .15s, background .15s",
});

const wegZeile = { display: "flex", alignItems: "center", gap: 12, width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 14, border: `1.5px solid ${C.linie}`, background: C.weiss, fontFamily: "inherit", textAlign: "left", textDecoration: "none", color: C.tinte };

function Pfeil() {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function SepaBox({ weg }) {
  const [kopiert, setKopiert] = useState("");
  const kopieren = async (was, t) => {
    try { await navigator.clipboard.writeText(t); setKopiert(was); setTimeout(() => setKopiert(""), 1800); } catch (e) { /* manuell markieren */ }
  };
  const zeile = (was, label, wert) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: `1px solid ${C.linie}` }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", color: C.hellgrau }}>{label}</span>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: C.tinte, wordBreak: "break-all" }}>{wert}</span>
      </span>
      <button type="button" onClick={() => kopieren(was, wert)} style={{ height: 36, padding: "0 14px", borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
        {kopiert === was ? "Kopiert ✓" : "Kopieren"}
      </button>
    </div>
  );
  return (
    <div style={{ background: C.sand, borderRadius: 14, padding: "6px 14px 8px", marginTop: 8 }}>
      {zeile("empf", "EMPFÄNGER", weg.empfaenger)}
      {zeile("iban", "IBAN", weg.iban)}
      {zeile("zweck", "VERWENDUNGSZWECK", weg.verwendung)}
    </div>
  );
}

export function SpendenKarte({ cfg = SPENDEN }) {
  const [betrag, setBetrag] = useState(cfg.vorgewaehlt);
  const [sepaOffen, setSepaOffen] = useState(false);
  const liste = wege(betrag, cfg);
  const paypal = liste[0];
  const andere = liste.slice(1);
  const live = mindestensEinWeg(cfg);

  return (
    <div style={{ ...karte, padding: 18, marginBottom: 14, border: `1.5px solid ${C.flaggold}` }}>
      <Kicker>BETRAG WÄHLEN</Kicker>
      <p id="spenden-betrag" style={{ fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.55, marginBottom: 10 }}>Jeder Betrag hilft. Du wählst, wie viel du geben möchtest.</p>
      <div role="radiogroup" aria-labelledby="spenden-betrag" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {cfg.betraege.map((b) => (
          <button key={b} type="button" role="radio" aria-checked={betrag === b} onClick={() => setBetrag(b)} style={betragKnopf(betrag === b)}>{euro(b)}</button>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        {paypal.bereit ? (
          <a href={paypal.href} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 52, borderRadius: 999, background: C.flaggold, color: NAVY, fontSize: 16, fontWeight: 800, textDecoration: "none", fontFamily: "inherit" }}>
            Mit PayPal {euro(betrag)} spenden <Pfeil />
          </a>
        ) : (
          <button type="button" disabled aria-disabled="true" style={{ width: "100%", height: 52, borderRadius: 999, border: "none", background: C.silberHell, color: C.silberDunkel, fontSize: 16, fontWeight: 800, fontFamily: "inherit", cursor: "default" }}>
            PayPal · Link folgt
          </button>
        )}
      </div>

      <p style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", color: C.hellgrau, margin: "16px 0 8px" }}>ODER ANDERS</p>
      <div style={{ display: "grid", gap: 8 }}>
        {andere.map((w) => {
          const inhalt = (
            <>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700 }}>{w.name}</span>
                <span style={{ display: "block", fontSize: 12.5, color: C.grau, marginTop: 1 }}>{w.bereit ? w.zeile : "Link folgt"}</span>
              </span>
              {w.bereit && <span style={{ color: C.see, display: "flex" }}><Pfeil /></span>}
            </>
          );
          if (!w.bereit) return <div key={w.id} aria-disabled="true" style={{ ...wegZeile, opacity: 0.55, background: C.sand }}>{inhalt}</div>;
          if (w.art === "link") return <a key={w.id} href={w.href} target="_blank" rel="noopener noreferrer" style={{ ...wegZeile, cursor: "pointer" }}>{inhalt}</a>;
          return (
            <div key={w.id}>
              <button type="button" aria-expanded={sepaOffen} onClick={() => setSepaOffen((o) => !o)} style={{ ...wegZeile, cursor: "pointer" }}>{inhalt}</button>
              {sepaOffen && <SepaBox weg={w} />}
            </div>
          );
        })}
      </div>

      {!live && <p role="status" style={{ fontSize: 12.5, color: "#6B5310", background: "#FFF8DD", borderRadius: 10, padding: "8px 12px", marginTop: 12, lineHeight: 1.5 }}>Vorschau: Die Zahlungswege sind noch nicht eingetragen, deshalb sind die Knöpfe gesperrt.</p>}

      <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.linie}` }}>
        <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6 }}>
          Freiwillig: Eine Spende schaltet heute nichts frei, Mythos Mathe bleibt für alle gleich nutzbar. Es gibt keine Spendenquittung, der Betrag ist nicht steuerlich absetzbar. Deine Zahlungsdaten gibst du nur beim gewählten Anbieter ein.
        </p>
      </div>
    </div>
  );
}

/* Kleine Karte im Elternkonto: führt zur Seite /spenden */
export function SpendenTeaser({ gehe }) {
  return (
    <div style={{ ...karte, padding: 18, marginBottom: 14, background: `linear-gradient(155deg, ${C.see} 0%, ${NAVY} 100%)`, color: C.weiss }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.flaggold, marginBottom: 6 }}>FREIWILLIG</p>
      <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Hilf mit, die KI-Kosten zu tragen</p>
      <p style={{ fontSize: 14, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.6, marginBottom: 12 }}>Mathilda und die Weiterentwicklung der Seite kosten laufend Geld. Wenn du magst, unterstützt du uns mit 10, 20, 50 oder 100 Euro.</p>
      <button type="button" onClick={() => gehe({ ansicht: "spenden" })} style={{ height: 44, padding: "0 22px", borderRadius: 999, border: "none", background: C.flaggold, color: NAVY, fontSize: 14.5, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>Donate</button>
    </div>
  );
}
