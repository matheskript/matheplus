import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { ANLEITUNG_BILDER } from "./anleitung/daten.js";

/* ======================================================================
   „SO NUTZT DU DIE APP“
   Aufklappbare Box auf der Startseite mit einem Karussell (wie bei
   Instagram): echte Screenshots der App, die wichtige Stelle ist
   jeweils golden markiert. Bilder und Markierungen erzeugt das Skript
   scripts/anleitung-screenshots.py → src/anleitung/.
   ====================================================================== */

const KAPITEL = [
  { id: "ueberblick", name: "Überblick" },
  { id: "kopf", name: "Kopfrechnen" },
  { id: "kurve", name: "Kurvendiskussion" },
];

const FOLIEN = [
  { id: "ueberblick-1", kap: "ueberblick", titel: "Oben: dein Trainingsbereich",
    text: "Die blauen Kacheln sind der Trainingsbereich. Hier rechnest, plottest und übst du direkt – jede Kachel klappt auf, wenn du sie antippst." },
  { id: "ueberblick-2", kap: "ueberblick", titel: "Unten: die Kurse",
    text: "Weiter unten liegen die Kurse. Die sind gerade noch in Arbeit und deshalb mit einem Schloss markiert. Konzentrier dich also erstmal auf die blauen Kacheln oben." },
  { id: "kopf-1", kap: "kopf", titel: "Kopfrechnen aufklappen",
    text: "Tippe auf die Kachel „Kopfrechnen“. Darunter erscheinen die vier Kopfrechen-Trainer." },
  { id: "kopf-2", kap: "kopf", titel: "Multiplizieren wählen",
    text: "Für dieses Beispiel nehmen wir „Multiplizieren“ – vom kleinen Einmaleins bis zu vierstelligen Zahlen." },
  { id: "kopf-3", kap: "kopf", titel: "Schwierigkeit einstellen",
    text: "Stell für die 1. und die 2. Zahl jeweils „2-stellig“ ein. Sofort kommt eine passende Aufgabe." },
  { id: "kopf-4", kap: "kopf", titel: "Im Kopf rechnen, Lösung eintippen",
    text: "Rechne die Aufgabe im Kopf, tippe das Ergebnis über das Tastenfeld ein und drücke OK." },
  { id: "kopf-5", kap: "kopf", titel: "Sofort Rückmeldung",
    text: "Die App prüft dein Ergebnis direkt. Zehn Aufgaben pro Runde – danach siehst du, wie schnell und sicher du warst." },
  { id: "kurve-1", kap: "kurve", titel: "Mathe-Training → Analysis",
    text: "Klapp „Mathe-Training“ auf und tippe auf „Analysis“." },
  { id: "kurve-2", kap: "kurve", titel: "Kurvendiskussion → Polynome",
    text: "Tippe auf „Kurvendiskussion“ und dann auf „Polynome“. Damit öffnest du den Polynomplotter." },
  { id: "kurve-3", kap: "kurve", titel: "Funktion einstellen",
    text: "Mit + und − stellst du die Koeffizienten a, b, c, d ein. Der Graph und seine Ableitungen ändern sich live mit." },
  { id: "kurve-4", kap: "kurve", titel: "Die komplette Kurvendiskussion",
    text: "Weiter unten steht die vollständige Kurvendiskussion für genau deine Funktion – Nullstellen, Extrempunkte, Wendepunkte, Schritt für Schritt." },
  { id: "kurve-5", kap: "kurve", titel: "Als PDF herunterladen",
    text: "Ganz unten lädst du die komplette Kurvendiskussion als PDF herunter – zum Ausdrucken oder zum Vergleichen mit deiner eigenen Lösung." },
];

const CSS = `
.anl-koerper{display:grid;grid-template-rows:0fr;transition:grid-template-rows .34s cubic-bezier(.2,.7,.3,1)}
.anl-koerper.auf{grid-template-rows:1fr}
.anl-koerper>div{overflow:hidden}
.anl-band{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;overscroll-behavior-x:contain}
.anl-band::-webkit-scrollbar{display:none}
.anl-folie{flex:0 0 100%;scroll-snap-align:center;scroll-snap-stop:always}
.anl-ring{animation:anlPuls 1.8s ease-in-out infinite}
@keyframes anlPuls{0%,100%{box-shadow:0 0 0 3px rgba(237,187,0,0.35),0 0 0 9999px rgba(14,30,74,0.28)}50%{box-shadow:0 0 0 8px rgba(237,187,0,0.12),0 0 0 9999px rgba(14,30,74,0.28)}}
.anl-pfeil{transition:transform .12s ease, opacity .2s ease}
.anl-pfeil:active{transform:scale(.92)}
`;

function Folie({ f, nr, gesamt }) {
  const bild = ANLEITUNG_BILDER[f.id];
  const kap = KAPITEL.find((k) => k.id === f.kap);
  const imKap = FOLIEN.filter((x) => x.kap === f.kap);
  const stelle = imKap.indexOf(f) + 1;
  return (
    <div className="anl-folie" aria-roledescription="Folie" aria-label={`${nr} von ${gesamt}: ${f.titel}`}>
      <div style={{ padding: "0 4px" }}>
        {/* Bild im Handyrahmen */}
        <div style={{ position: "relative", margin: "0 auto", maxWidth: 300, borderRadius: 26, padding: 7,
          background: `linear-gradient(160deg, #22325E 0%, ${C.seeTief} 100%)`, boxShadow: "0 14px 30px -12px rgba(14,30,74,0.55), inset 0 1px 0 rgba(255,255,255,0.12)" }}>
          <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: C.sand, aspectRatio: bild ? `${bild.w} / ${bild.h}` : "390 / 640" }}>
            {bild && <img src={bild.src} alt={f.titel} loading="lazy" draggable="false" style={{ width: "100%", height: "100%", display: "block", objectFit: "cover", userSelect: "none" }} />}
            {bild && bild.box && (
              <span aria-hidden="true" className="anl-ring" style={{ position: "absolute", left: `${bild.box[0]}%`, top: `${bild.box[1]}%`, width: `${bild.box[2]}%`, height: `${bild.box[3]}%`,
                borderRadius: 12, border: `2.5px solid ${C.flaggold}`, pointerEvents: "none" }} />
            )}
          </div>
        </div>
        {/* Text */}
        <div style={{ padding: "16px 6px 0", textAlign: "left", maxWidth: 420, margin: "0 auto" }}>
          <p style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.08em", color: C.gruen, marginBottom: 5 }}>
            {kap.name.toUpperCase()} · SCHRITT {stelle} VON {imKap.length}
          </p>
          <h4 style={{ fontSize: 17.5, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3, color: C.tinte, marginBottom: 6 }}>{f.titel}</h4>
          <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.65, color: C.grau, minHeight: "4.95em" }}>{f.text}</p>
        </div>
      </div>
    </div>
  );
}

function Pfeil({ richtung, onClick, aus }) {
  return (
    <button type="button" className="anl-pfeil" onClick={onClick} disabled={aus} aria-label={richtung < 0 ? "Vorherige Folie" : "Nächste Folie"}
      style={{ position: "absolute", top: "calc(50% - 70px)", [richtung < 0 ? "left" : "right"]: -2, width: 40, height: 40, borderRadius: 999, border: "none",
        background: C.weiss, boxShadow: "0 4px 14px rgba(15,26,51,0.18)", cursor: aus ? "default" : "pointer", opacity: aus ? 0 : 1,
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
      <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
        <path d={richtung < 0 ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"} stroke={C.see} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function AppAnleitung() {
  const [auf, setAuf] = useState(false);
  const [akt, setAkt] = useState(0);
  const band = useRef(null);

  const geheZu = (i) => {
    const el = band.current; if (!el) return;
    const z = Math.max(0, Math.min(FOLIEN.length - 1, i));
    el.scrollTo({ left: z * el.clientWidth, behavior: "smooth" });
    setAkt(z);
  };
  const beimScrollen = () => {
    const el = band.current; if (!el) return;
    const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    if (i !== akt) setAkt(i);
  };
  useEffect(() => {
    if (!auf) return;
    const taste = (e) => { if (e.key === "ArrowRight") geheZu(akt + 1); if (e.key === "ArrowLeft") geheZu(akt - 1); };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [auf, akt]);

  const kapAkt = FOLIEN[akt].kap;

  return (
    <div style={{ background: C.weiss, borderRadius: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", margin: "18px 0 14px", overflow: "hidden",
      border: `1px solid ${auf ? "rgba(0,77,152,0.18)" : C.linie}` }}>
      <style>{CSS}</style>
      <button type="button" onClick={() => setAuf(!auf)} aria-expanded={auf}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", background: C.weiss, border: "none",
          cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: C.tinte }}>
        <span aria-hidden="true" style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(165deg, #FFE7A0 0%, #F3C93A 40%, #C99A00 100%)", boxShadow: "0 4px 10px rgba(150,110,0,0.3), inset 0 1px 0 rgba(255,255,255,0.7)" }}>
          <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
            <rect x="3" y="1.5" width="14" height="19" rx="3" stroke={C.seeTief} strokeWidth="1.8" />
            <path d="M8 17.5h4" stroke={C.seeTief} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M8.3 7.2l3.6 2.3-3.6 2.3z" fill={C.seeTief} />
          </svg>
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>So nutzt du die App</span>
          <span style={{ display: "block", fontSize: 12.5, fontWeight: 300, color: C.grau, marginTop: 2 }}>In {FOLIEN.length} Bildern durchgeklickt</span>
        </span>
        <span aria-hidden="true" style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
          background: auf ? C.see : "#EEF2F8", transition: "background .2s ease" }}>
          <svg width="13" height="13" viewBox="0 0 14 14" style={{ transform: auf ? "rotate(180deg)" : "none", transition: "transform .25s ease" }}>
            <path d="M3 5l4 4 4-4" stroke={auf ? C.weiss : C.see} strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <div className={`anl-koerper${auf ? " auf" : ""}`} aria-hidden={!auf}>
        <div>
          <div style={{ borderTop: `1px solid ${C.linie}`, padding: "14px 12px 18px" }}>
            {/* Kapitel */}
            <div role="tablist" aria-label="Kapitel" style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
              {KAPITEL.map((k) => {
                const an = k.id === kapAkt;
                return (
                  <button key={k.id} type="button" role="tab" aria-selected={an} onClick={() => geheZu(FOLIEN.findIndex((x) => x.kap === k.id))}
                    style={{ padding: "6px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: an ? 700 : 500, fontFamily: "inherit", cursor: "pointer",
                      border: `1px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.grau, whiteSpace: "nowrap" }}>
                    {k.name}
                  </button>
                );
              })}
            </div>

            <div style={{ position: "relative" }}>
              {auf && (
                <div ref={band} className="anl-band" onScroll={beimScrollen} aria-roledescription="Karussell" aria-label="So nutzt du die App">
                  {FOLIEN.map((f, i) => <Folie key={f.id} f={f} nr={i + 1} gesamt={FOLIEN.length} />)}
                </div>
              )}
              <Pfeil richtung={-1} aus={akt === 0} onClick={() => geheZu(akt - 1)} />
              <Pfeil richtung={1} aus={akt === FOLIEN.length - 1} onClick={() => geheZu(akt + 1)} />
            </div>

            {/* Punkte */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5, marginTop: 14 }}>
              {FOLIEN.map((f, i) => (
                <button key={f.id} type="button" onClick={() => geheZu(i)} aria-label={`Zu Folie ${i + 1}`}
                  style={{ width: i === akt ? 18 : 6, height: 6, borderRadius: 999, border: "none", padding: 0, cursor: "pointer",
                    background: i === akt ? C.see : f.kap === kapAkt ? "#9DB6D8" : C.linie, transition: "width .25s ease, background .25s ease" }} />
              ))}
            </div>
            {akt === FOLIEN.length - 1 && (
              <p style={{ textAlign: "center", fontSize: 13, color: C.see, fontWeight: 500, marginTop: 12 }}>
                Jetzt bist du dran – such dir unten eine blaue Kachel aus.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
