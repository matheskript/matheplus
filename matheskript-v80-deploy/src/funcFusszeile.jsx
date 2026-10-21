/* Fußzeile auf jeder Ansicht – aus funcRecht.jsx ausgelagert (21.10.2026), damit der Startchunk nicht
   Impressum, AGB, Widerruf und Datenschutzerklärung mitlädt (die Seiten laden lazy in func10). */
import React from "react";
import { MarkenLogo } from "./markenLogo.jsx";
import { C } from "./base1.jsx";
import { springe } from "./sprung.js";
import { ANGEBOT } from "./angebot.js";

export function Fusszeile({ gehe, arbeitsmenue }) {
  const link = (ansicht, text) => (
    <button type="button" onClick={() => { gehe({ ansicht }); springe("seitenwechsel", () => window.scrollTo(0, 0)); }}
      style={{ background: "none", border: "none", padding: "4px 0", color: "#C9D6EE", fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
      {text}
    </button>
  );
  return (
    <footer className="seiten-fuss" style={{ background: C.seeTief, marginTop: 24 }}>
      <div className="mx-auto px-6" style={{ maxWidth: 620, padding: "26px 24px 30px" }}>
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ lineHeight: 1 }}><MarkenLogo groesse="min(36px, 8.4vw)" /></p>
          <p style={{ fontSize: "min(21px, 4.9vw)", fontWeight: 600, marginTop: 2, lineHeight: 1, letterSpacing: "0.03em", color: "#FFFFFF", whiteSpace: "nowrap" }}>
            System <span className="fuss-zeichen" style={{ color: C.flaggold }}>+</span> Freude <span className="fuss-zeichen" style={{ color: C.flaggold }}>=</span> Erfolg
          </p>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.12)", margin: "16px 0 12px" }} />
        <nav aria-label="Rechtliches" className="flex flex-wrap" style={{ columnGap: 20, rowGap: 2 }}>
          {link("impressum", "Impressum")}
          {link("datenschutz", "Datenschutz")}
          {ANGEBOT.agb && link("agb", "AGB")}
          {arbeitsmenue && arbeitsmenue({ background: "none", border: "none", padding: "4px 0", color: C.flaggold, fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" })}
          {ANGEBOT.agb && link("widerruf", "Widerrufsbelehrung")}
          {link("lehrkraefte", "Für Lehrkräfte")}
          {link("spenden", "Unterstützen")}
        </nav>
        <p style={{ fontSize: 12.5, color: "#8FA3C8", marginTop: 12 }}>© 2026 Mythos Mathe · Alle Rechte vorbehalten.</p>
      </div>
    </footer>
  );
}

