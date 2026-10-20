import React from "react";
import { C } from "./base1.jsx";
import { DOKUMENTE, dokumenteUebersicht } from "./dokumente.js";

/* ======================================================================
   SEITE „DOKUMENTE“ (Ansicht "dokumente", hinter dem gemeinsamen Passwort).
   Eine Box je Dokument: was es ist, wie viele Seiten, wofür es gedacht ist.
   Die Liste steht in src/dokumente.js.
   ====================================================================== */

const SCHATTEN = "0 2px 14px rgba(14,30,74,0.09)";

/* Farbe der Zweck-Marke: Amazon = Gold, Seite = Blau, Investoren = Dunkelblau, Intern = Grau */
const MARKE = {
  "Amazon": { bg: "#FBF0C8", fg: "#5A4300" },
  "Hier auf der Seite": { bg: C.himmel, fg: C.see },
  "Investoren": { bg: C.seeTief, fg: "#fff" },
  "Intern": { bg: C.silberHell, fg: C.grau },
};

function Box({ d }) {
  const seiten = d.seiten ? `${d.seiten} ${d.seiten === 1 ? "Seite" : "Seiten"}` : "Seitenzahl offen";
  return (
    <article data-dokument={d.id} style={{ background: C.weiss, borderRadius: 18, boxShadow: SCHATTEN, padding: "20px 20px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {d.zwecke.map((z) => (
          <span key={z} style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", padding: "4px 10px", borderRadius: 999, background: (MARKE[z] || MARKE.Intern).bg, color: (MARKE[z] || MARKE.Intern).fg }}>{z}</span>
        ))}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.01em", color: C.tinte, margin: 0 }}>{d.titel}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 13.5, color: C.grau }}>
        <span>{d.art}</span>
        <span data-dokument-seiten style={{ fontWeight: 700, color: C.tinte }}>{seiten}</span>
        {d.stand ? <span>Stand {d.stand}</span> : null}
      </div>
      <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.7, color: C.grau, margin: 0 }}>{d.zweck}</p>
      {d.datei ? (
        <a href={d.datei} target="_blank" rel="noopener noreferrer" data-dokument-oeffnen
          style={{ alignSelf: "flex-start", marginTop: 2, display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 20px", borderRadius: 999, background: C.flaggold, color: C.seeTief, fontSize: 14.5, fontWeight: 800, textDecoration: "none" }}>
          PDF öffnen <span aria-hidden="true">→</span>
        </a>
      ) : (
        <span data-dokument-ohne-datei style={{ alignSelf: "flex-start", marginTop: 2, fontSize: 13, color: C.hellgrau }}>Datei noch nicht hier abgelegt</span>
      )}
    </article>
  );
}

export function DokumenteSeite() {
  const u = dokumenteUebersicht();
  return (
    <>
      <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
        <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
          <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 29, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Dokumente</h1>
          <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
          <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
            Alle Dokumente an einem Ort: was es ist, wie viele Seiten es hat und wofür es gedacht ist.
          </p>
        </div>
        <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
      </div>
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 24 }}>
        <p data-dokumente-summe style={{ fontSize: 13, color: C.hellgrau, marginBottom: 18 }}>
          {u.anzahl} Dokumente · {u.seiten} Seiten insgesamt{u.ohneDatei ? ` · bei ${u.ohneDatei} liegt die Datei noch nicht hier` : ""}
        </p>
        <div style={{ display: "grid", gap: 16 }}>
          {DOKUMENTE.map((d) => <Box key={d.id} d={d} />)}
        </div>
      </div>
    </>
  );
}
