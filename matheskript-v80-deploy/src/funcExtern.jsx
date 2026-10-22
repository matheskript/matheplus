import React, { useState, useSyncExternalStore } from "react";
import { C } from "./base1.jsx";
import { FR } from "./funcRegistry.jsx";
import { DIENSTE, dienstErlaubt, dienstSetzen, medienAbonnieren, medienLesen } from "./externeMedien.js";

/* Platzhalter statt Fremd-Video, bis der Nutzer es freigibt.
   Liegt in einer Box mit festem Seitenverhältnis (position: relative) und füllt sie ganz aus.
   ohneRahmen: rendert seine eigene 16:9-Box (für Stellen ohne umgebende Box). */
export function ExternSchutz({ dienst, children, ohneRahmen }) {
  const erlaubtDauerhaft = useSyncExternalStore(medienAbonnieren, () => dienstErlaubt(dienst), () => false);
  const [einmal, setEinmal] = useState(false);
  const [merken, setMerken] = useState(false);
  if (erlaubtDauerhaft || einmal) return children;
  const d = DIENSTE[dienst] || { name: dienst, firma: "", art: "Inhalt" };
  const laden = () => { if (merken) dienstSetzen(dienst, true); setEinmal(true); };
  const flaeche = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 18px",
      background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss, textAlign: "center", overflow: "auto" }}>
      <button type="button" onClick={laden}
        style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 44, padding: "0 20px", borderRadius: 999, border: "none", background: C.flaggold, color: C.seeTief,
          fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", flexShrink: 0 }}>
        <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true"><path d="M0 0 L14 8 L0 16 Z" fill="currentColor" /></svg>
        {d.art} laden
      </button>
      <p style={{ fontSize: 12, lineHeight: 1.5, color: "#C9D6EE", maxWidth: 420, margin: 0 }}>
        Das {d.art} kommt von {d.name}. Beim Laden werden Daten wie deine IP-Adresse an {d.firma} übertragen.{" "}
        <button type="button" onClick={() => FR.gehe && FR.gehe({ ansicht: "datenschutz" })}
          style={{ background: "none", border: "none", padding: 0, color: C.flaggold, textDecoration: "underline", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>Mehr</button>
      </p>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#C9D6EE", cursor: "pointer" }}>
        <input type="checkbox" checked={merken} onChange={(e) => setMerken(e.target.checked)} style={{ accentColor: C.flaggold }} />
        {d.name} immer laden
      </label>
    </div>
  );
  if (!ohneRahmen) return flaeche;
  return (
    <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>{flaeche}</div>
  );
}

/* Für die Datenschutzseite: dauerhafte Freigaben auf diesem Gerät ansehen und zurücknehmen */
export function MedienEinstellungen() {
  const stand = useSyncExternalStore(medienAbonnieren, () => JSON.stringify(medienLesen()), () => "{}");
  const an = JSON.parse(stand);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {Object.entries(DIENSTE).map(([id, d]) => (
        <label key={id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, color: C.tinte, cursor: "pointer" }}>
          <input type="checkbox" checked={!!an[id]} onChange={(e) => dienstSetzen(id, e.target.checked)} style={{ width: 18, height: 18, accentColor: C.see }} />
          {d.einstellung || `${d.name}-Videos automatisch laden`}
        </label>
      ))}
    </div>
  );
}
