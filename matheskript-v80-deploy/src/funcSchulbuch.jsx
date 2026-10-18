/* ============================================================
   SCHULBUCH – das eigene Mythos-Mathe-Schulbuch, blätterbar in der App
   Band 1: Ableitungen (36 Seiten). Das Buch liegt fertig gesetzt unter
   public/buecher/ableitungen/ (index.html + viewer.js, erzeugt aus dem
   Buch-Quelltext) und wird hier im Rahmen gezeigt. Die Kapitelkarten
   schlagen das Buch per postMessage an der richtigen Seite auf; die
   „In der App öffnen“-Knöpfe im Buch schicken umgekehrt mm-gehe.
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";

/* Kapitelfarbe II aus dem gedruckten Buch (Grana) – damit Karten und Buchseiten gleich aussehen */
const BUCH_GRANA = "#A50044";

export const BUCH_ABLEITUNGEN = {
  pfad: "/buecher/ableitungen/index.html",
  pdf: "/buecher/ableitungen/Ableitungen.pdf",
  seiten: 36,
  kapitel: [
    { nr: "I", titel: "Die Ableitung", farbe: C.see, einheiten: [
      { nr: "1", titel: "Mittlere Änderungsrate", seite: 4 },
      { nr: "2", titel: "Von der Sekante zur Tangente", seite: 6 },
      { nr: "3", titel: "Die Ableitungsfunktion", seite: 8 },
      { nr: "", titel: "Training I", seite: 10 },
    ] },
    { nr: "II", titel: "Ableitungsregeln", farbe: BUCH_GRANA, einheiten: [
      { nr: "4", titel: "Faktorregel", seite: 12 },
      { nr: "5", titel: "Summenregel", seite: 14 },
      { nr: "6", titel: "Produktregel", seite: 16 },
      { nr: "7", titel: "Potenzregel", seite: 18 },
      { nr: "8", titel: "Quotientenregel", seite: 20 },
      { nr: "9", titel: "Kettenregel", seite: 22 },
      { nr: "10", titel: "sin, cos, eˣ und ln x", seite: 24 },
      { nr: "", titel: "Training II", seite: 26 },
    ] },
    { nr: "III", titel: "Anwenden und Üben", farbe: C.seeTief, einheiten: [
      { nr: "11", titel: "Tangente und Normale", seite: 28 },
      { nr: "12", titel: "Vermischte Übungen", seite: 30 },
      { nr: "", titel: "Rückblick", seite: 31 },
      { nr: "", titel: "Lösungen", seite: 32 },
    ] },
  ],
};

const MERK = "mm_schulbuch_ableitungen_seite";
const merkLesen = () => { try { return Math.max(1, parseInt(localStorage.getItem(MERK), 10) || 1); } catch (e) { return 1; } };

export function SchulbuchSeite({ gehe }) {
  const B = BUCH_ABLEITUNGEN;
  const rahmen = React.useRef(null);
  const [seite, setSeite] = React.useState(merkLesen);
  const startSeite = React.useRef(seite);

  React.useEffect(() => {
    const hoeren = (e) => {
      if (e.origin !== window.location.origin || !e.data) return;
      if (e.data.typ === "mm-schulbuch-seite" && e.data.buch === "ableitungen") {
        setSeite(e.data.seite);
        try { localStorage.setItem(MERK, String(e.data.seite)); } catch (err) { /* egal */ }
      }
      if (e.data.typ === "mm-gehe" && e.data.ziel && typeof e.data.ziel.ansicht === "string") gehe(e.data.ziel);
    };
    window.addEventListener("message", hoeren);
    return () => window.removeEventListener("message", hoeren);
  }, [gehe]);

  const aufschlagen = (s) => {
    const w = rahmen.current && rahmen.current.contentWindow;
    if (w) w.postMessage({ typ: "mm-schulbuch-zeige", seite: s }, window.location.origin);
    if (rahmen.current) rahmen.current.focus();
  };

  const aktivEinheit = (() => {
    let a = null;
    for (const k of B.kapitel) for (const e of k.einheiten) if (e.seite <= seite) a = e;
    return a;
  })();

  return (
    <div className="mx-auto px-4 pb-16" style={{ maxWidth: 1180 }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em", lineHeight: 1.25, margin: "4px 0 12px" }}>
          Unser eigenes Schulbuch – jede Regel hergeleitet
        </h2>
        <p style={{ color: C.grau, fontSize: 15, lineHeight: 1.8, fontWeight: 300, marginBottom: 22 }}>
          Jedes Unterkapitel ist eine Unterrichtsstunde auf einer Doppelseite: Einstieg, Herleitung, Merkkasten, Beispiele und Aufgaben in drei Stufen.
          Die Kästen „Für Interessierte“ liefern die exakten Beweise, hinten stehen alle Lösungen.
        </p>
      </div>

      <div className="schulbuch-kapitel" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 22 }}>
        {B.kapitel.map((k) => (
          <div key={k.nr} style={{ background: C.weiss, borderRadius: 16, padding: "16px 16px 10px", boxShadow: "0 2px 16px rgba(15,26,51,0.07)", borderTop: `4px solid ${k.farbe}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: k.farbe, marginBottom: 2 }}>KAPITEL {k.nr}</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte, marginBottom: 8 }}>{k.titel}</p>
            {k.einheiten.map((e) => {
              const an = aktivEinheit === e;
              return (
                <button key={e.titel} type="button" onClick={() => aufschlagen(e.seite)} aria-current={an ? "true" : undefined}
                  style={{ display: "flex", width: "100%", alignItems: "baseline", gap: 10, padding: "8px 8px", margin: "0 -8px", border: 0, borderRadius: 8, cursor: "pointer", textAlign: "left",
                    background: an ? C.silberHell : "transparent", boxShadow: an ? `inset 3px 0 0 ${C.flaggold}` : "none", fontFamily: "inherit" }}>
                  <span style={{ width: 22, fontWeight: 700, fontSize: 13, color: k.farbe }}>{e.nr}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: an ? 700 : 500, color: C.tinte }}>{e.titel}</span>
                  <span style={{ fontSize: 12, color: C.grau }}>S. {e.seite}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <p style={{ color: C.see, fontSize: 13, fontWeight: 600, flex: "1 1 220px" }}>Blättern mit den Pfeilen, Wischen oder den Pfeiltasten.</p>
        <a href={B.pfad + "#" + seite} target="_blank" rel="noopener" style={{ fontSize: 13, fontWeight: 600, color: C.see, textDecoration: "none", padding: "8px 14px", borderRadius: 10, border: `1px solid ${C.linie}`, background: C.weiss }}>Vollbild ↗</a>
        <a href={B.pdf} download style={{ fontSize: 13, fontWeight: 700, color: C.seeTief, textDecoration: "none", padding: "8px 14px", borderRadius: 10, background: C.flaggold }}>PDF herunterladen</a>
      </div>

      <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(15,26,51,0.10)", background: "#E4E9F2" }}>
        <iframe ref={rahmen} title="Schulbuch Ableitungen" src={B.pfad + "#" + startSeite.current}
          style={{ display: "block", width: "100%", height: "min(86vh, 900px, calc((100vw - 32px) * 1.414 + 150px))", minHeight: 420, border: 0 }} />
      </div>
    </div>
  );
}
