import React from "react";
import { C } from "./base1.jsx";
import { MathildaName } from "./mathildaName.jsx";
import { SPENDEN, euro } from "./spenden.js";

/* Startseite, ganz unten: Donate-Bereich. Führt zur Seite /spenden (funcSpendenSeite.jsx). */

const NAVY = "#0B1E4A";

export function SpendenBereich({ gehe }) {
  const los = () => gehe({ ansicht: "spenden" });
  return (
    <section aria-labelledby="spenden-titel" style={{ marginTop: 22, borderRadius: 20, padding: "20px 18px 18px", color: C.weiss, position: "relative", overflow: "hidden",
      background: `radial-gradient(120% 140% at 100% 0%, #1D4790 0%, ${C.see} 40%, ${NAVY} 100%)`, boxShadow: "0 10px 28px rgba(14,30,74,0.22)" }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: C.flaggold }}>DONATE · FREIWILLIG</p>
      <h2 id="spenden-titel" style={{ margin: "6px 0 0", fontSize: 21, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.02em" }}>Hilf mit, die KI-Kosten zu tragen</h2>
      <p style={{ margin: "8px 0 14px", fontSize: 14, fontWeight: 300, lineHeight: 1.6, color: "#C9D6EE" }}>
        Für <MathildaName dunkel /> kaufen wir laufend KI-Credits, und die Weiterentwicklung der Seite entsteht mit Claude. Wenn du magst, trägst du einen Teil davon.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {SPENDEN.betraege.map((b) => (
          <button key={b} type="button" onClick={los} aria-label={`${euro(b)} spenden`}
            style={{ height: 46, borderRadius: 12, border: `1.5px solid ${b === SPENDEN.vorgewaehlt ? C.flaggold : "rgba(255,255,255,0.35)"}`, background: b === SPENDEN.vorgewaehlt ? "rgba(237,187,0,0.16)" : "rgba(255,255,255,0.06)",
              color: C.weiss, fontSize: 16, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>{euro(b)}</button>
        ))}
      </div>
    </section>
  );
}
