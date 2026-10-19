/* ======================================================================
   Gemeinsamer Rahmen für Lernmodule in „Mathe entdecken“
   (Phasenleiste, Fortschrittsbalken, geführte Schritte, Navigation,
   Abschlusskarte, Neubeginn). Aufbau wie das Pythagoras-Modul.
   Der Stand liegt in entdeckenSpeicher.js unter module[id];
   die Anzahl der Phasen steht in entdeckenMerge.js → MODULE.
   phasen: [{ titel, intro, bild, schritte, fertig, abschluss?, info? }]
   info: true = reine Infoseite ohne Aufgaben (schritte: []), z. B. die erste Seite
   eines Personen-Moduls („Wer war …?“). Im Reiter steht dann „i“.
   ====================================================================== */
import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { GrosserKnopf, KleinerLink, Rueck, karte } from "./ui2.jsx";
import { SchrittFolge } from "./ui3.jsx";
import { MODUL_PHASEN, modulFertigSetzen, modulPhaseSetzen, modulStand, modulStandSetzen, modulZuruecksetzen } from "./entdeckenSpeicher.js";

import { springe } from "./sprung.js";
/* Text mit eingebetteten Formeln zwischen $…$ */
export const T = ({ s }) => <>{String(s).split("$").map((x, i) => (i % 2 ? <M key={i} t={x} /> : <span key={i}>{x}</span>))}</>;
export const Aufforderung = ({ children }) => <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "0 0 10px" }}>{children}</p>;
export const BildKarte = ({ children }) => <div style={{ ...karte, padding: 16, marginTop: 14 }}>{children}</div>;

/* Plus/Minus-Regler (+ oben, − unten) mit Schieber */
export function Regler({ name, wert, setWert, min, max, schritt = 1, farbe = C.see, format = (v) => String(v).replace(".", ",").replace("-", "−") }) {
  const setze = (v) => setWert(Math.round(Math.max(min, Math.min(max, v)) * 1000) / 1000);
  const knopf = (d, z) => {
    const aus = (d < 0 && wert <= min + 1e-9) || (d > 0 && wert >= max - 1e-9);
    return (
      <button type="button" aria-label={`${name} ${d > 0 ? "+" : "−"}`} disabled={aus} onClick={() => setze(wert + d * schritt)}
        style={{ width: 38, height: 30, borderRadius: 9, border: `1.5px solid ${farbe}66`, background: `${farbe}14`, color: farbe, fontSize: 18, fontWeight: 800,
          fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1, touchAction: "manipulation", opacity: aus ? 0.35 : 1 }}>{z}</button>
    );
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: farbe, minWidth: 18 }}>{name}</span>
      <input type="range" min={min} max={max} step={schritt} value={wert} onChange={(e) => setze(Number(e.target.value))} aria-label={name} style={{ flex: 1, minWidth: 0, accentColor: farbe }} />
      <span style={{ fontSize: 15, fontWeight: 800, color: C.tinte, minWidth: 46, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{format(wert)}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{knopf(1, "+")}{knopf(-1, "−")}</div>
    </div>
  );
}

export function EntdeckenModul({ id, titel, untertitel, phasen, abschlussTitel, abschlussText, abschlussFormel, onZurueck }) {
  const N = MODUL_PHASEN[id];
  const [stand, setStandLok] = useState(() => modulStand(id).stand.slice());
  const fertigePhase = (k) => stand[k] >= phasen[k].schritte.length;
  const ersteOffene = (() => { const i = phasen.findIndex((_, k) => !fertigePhase(k)); return i < 0 ? N - 1 : i; })();
  const alleFertig = phasen.every((_, k) => fertigePhase(k));
  const [phase, setPhase] = useState(() => Math.min(modulStand(id).phase || 0, N - 1));
  const [bestaetige, setBestaetige] = useState(false);
  const aktuell = Math.min(phase, Math.max(ersteOffene, 0));

  useEffect(() => { springe("entdecken-phasen", () => window.scrollTo(0, 0)); }, [aktuell]);
  useEffect(() => { if (alleFertig && !modulStand(id).fertig) modulFertigSetzen(id, true); }, [alleFertig, id]);

  const gehePhase = (k) => { setPhase(k); modulPhaseSetzen(id, k); setBestaetige(false); };
  const setterFuer = (k) => (f) => {
    const neu = typeof f === "function" ? f(stand[k]) : f;
    if (neu > stand[k]) {
      modulStandSetzen(id, k, neu);
      setStandLok((s) => { const c = s.slice(); c[k] = Math.max(c[k], neu); return c; });
    }
  };

  const p = phasen[aktuell];
  const fertigDiese = fertigePhase(aktuell);
  const gesamt = phasen.reduce((s, ph, k) => s + Math.min(stand[k], ph.schritte.length), 0);
  const anzahlSchritte = phasen.reduce((s, ph) => s + ph.schritte.length, 0);

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <button type="button" onClick={onZurueck}
        style={{ fontFamily: "inherit", cursor: "pointer", background: "none", border: "none", padding: "6px 0", marginBottom: 10, fontSize: 13.5, fontWeight: 600, color: C.see }}>
        ← Mathe entdecken
      </button>
      <h2 style={{ fontSize: "clamp(20px, 6.2vw, 25px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, color: C.tinte, marginBottom: 6 }}>{titel}</h2>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 14 }}>{untertitel}</p>

      <div role="tablist" aria-label="Phasen" style={{ display: "grid", gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))`, gap: 6 }}>
        {phasen.map((ph, k) => {
          const an = k === aktuell, ok = fertigePhase(k), offen = k <= ersteOffene;
          return (
            <button key={k} type="button" role="tab" aria-selected={an} aria-label={`Phase ${k + 1}: ${ph.titel}${ok && !ph.info ? " (abgeschlossen)" : ""}`} disabled={!offen}
              onClick={() => gehePhase(k)}
              style={{ height: 40, borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: offen ? "pointer" : "default",
                border: `1.5px solid ${an ? C.see : ok ? "#0F7A4D" : C.linie}`, background: an ? C.see : ok ? "#E6F6EF" : C.weiss,
                color: an ? C.weiss : ok ? "#0F7A4D" : offen ? C.see : C.hellgrau, opacity: offen ? 1 : 0.6 }}>
              {ph.info ? "i" : ok && !an ? "✓" : k + 1}
            </button>
          );
        })}
      </div>
      <div aria-hidden="true" style={{ height: 5, borderRadius: 3, background: C.linie, marginTop: 10, overflow: "hidden" }}>
        <div style={{ width: `${(gesamt / anzahlSchritte) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.see}, ${C.gruen})`, transition: "width .3s ease" }} />
      </div>

      <div style={{ marginTop: 22 }}>
        <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 6 }}>Phase {aktuell + 1} von {N}</p>
        <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, color: C.tinte, marginBottom: 12 }}>{p.titel}</h3>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, margin: 0 }}><T s={p.intro} /></p>
        {p.bild}

        {!p.info && (
          <div style={{ ...karte, marginTop: 18 }}>
            <SchrittFolge key={aktuell} schritte={p.schritte} stand={stand[aktuell]} setStand={setterFuer(aktuell)} fertigText={p.fertig} />
          </div>
        )}
        {fertigDiese && p.abschluss && <div style={{ ...karte, marginTop: 14, borderLeft: `4px solid ${C.flaggold}` }}>{p.abschluss}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {aktuell > 0 && <div style={{ flex: "0 0 38%" }}><GrosserKnopf ghost onClick={() => gehePhase(aktuell - 1)}>← Zurück</GrosserKnopf></div>}
          {fertigDiese && aktuell < N - 1 && (
            <div style={{ flex: 1 }}><GrosserKnopf onClick={() => gehePhase(aktuell + 1)}>Weiter zu Phase {aktuell + 2} →</GrosserKnopf></div>
          )}
        </div>

        {alleFertig && aktuell === N - 1 && (
          <div style={{ ...karte, marginTop: 20, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.flaggold, margin: "0 0 6px" }}>Modul abgeschlossen</p>
            <p style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px", lineHeight: 1.3 }}>{abschlussTitel}</p>
            <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.65, margin: "0 0 8px", color: "#C9D6EE" }}>{abschlussText}</p>
            {abschlussFormel && <div style={{ fontSize: 18, color: C.weiss, display: "grid", gap: 6, margin: "6px 0 4px" }}>{abschlussFormel.map((f) => <M key={f} t={f} />)}</div>}
            <GrosserKnopf gold onClick={onZurueck}>Zurück zu Mathe entdecken</GrosserKnopf>
          </div>
        )}

        {gesamt > 0 && (
          <div style={{ marginTop: 22, textAlign: "center" }}>
            {!bestaetige
              ? <KleinerLink onClick={() => setBestaetige(true)}>Modul von vorn beginnen</KleinerLink>
              : (
                <Rueck art="warn">
                  Dein Fortschritt in diesem Modul wird gelöscht.
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <div style={{ flex: 1 }}><GrosserKnopf ghost onClick={() => setBestaetige(false)}>Abbrechen</GrosserKnopf></div>
                    <div style={{ flex: 1 }}><GrosserKnopf onClick={() => { modulZuruecksetzen(id); setStandLok(Array(N).fill(0)); setPhase(0); setBestaetige(false); springe("entdecken-phasen", () => window.scrollTo(0, 0)); }}>Ja, neu beginnen</GrosserKnopf></div>
                  </div>
                </Rueck>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
