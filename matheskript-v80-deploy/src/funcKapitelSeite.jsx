/* ======================================================================
   KAPITELSEITE – eine Grundseite für jedes Schulbuchkapitel
   Aufruf: ☰-Menü → Dein Schulbuch → Kapitel aufklappen → „Kapitelseite“ (links neben „Trainieren“),
   Direktlink /kapitel/<id>. Daten: kapitelSeite.js (rein, getestet).
   Aufbau: Kopf (römische Nummer, Titel, Klasse) → Aktionen (Trainieren, ins Mathe-Training,
   Formeln & Testklausur) → „Was im Kapitel steckt“ (Unterthemen als Zeitleiste) →
   Werkzeuge, Nachschlagen, Kurs dazu → vorheriges/nächstes Kapitel.
   Desktop ab 900 px: Zeitleiste links, Werkzeuge rechts.
   ====================================================================== */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { kapitelUebersicht, kapitelSeitenZiel } from "./kapitelSeite.js";
import { kapitelFuer, klassenBoxen, roemisch, SCHULART_STANDARD } from "./schulbuch.js";
import { quickfinderLesen } from "./funcQuickfinder.jsx";
import { themenUebernehmen } from "./meinTrainingSpeicher.js";

const GOLD = `linear-gradient(135deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`;
const ETIKETT_FARBE = { entdecken: C.flaggold, rechnen: C.seeHell, trainieren: "#D14D85" };
const ETIKETT_NAME = { entdecken: "Entdecken", rechnen: "Rechnen", trainieren: "Trainieren" };

const CSS = `
.ks-seite{max-width:980px;margin:0 auto;padding:0 16px 56px}
.ks-raster{display:grid;gap:18px;grid-template-columns:minmax(0,1fr)}
@media (min-width:900px){.ks-raster{grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);align-items:start}}
.ks-karte{background-color:#fff;border-radius:18px;box-shadow:0 2px 16px rgba(15,26,51,0.07);padding:18px}
.ks-kicker{margin:0 0 12px;font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${C.gruenDunkel}}
.ks-knopf{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:46px;padding:0 16px;border-radius:14px;border:none;cursor:pointer;
  font:inherit;font-size:14.5px;font-weight:800;letter-spacing:-0.005em;transition:transform .12s ease,filter .12s ease,background .12s ease}
.ks-knopf:active{transform:scale(.975)}
.ks-gold{background:${GOLD};color:${C.seeTief};box-shadow:0 8px 18px -8px rgba(237,187,0,0.8),inset 0 1px 0 rgba(255,255,255,0.6)}
.ks-gold:hover{filter:brightness(1.04)}
.ks-glas{background:rgba(255,255,255,0.1);color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.28)}
.ks-glas:hover{background:rgba(255,255,255,0.16)}
.ks-teil{position:relative;display:grid;grid-template-columns:34px minmax(0,1fr);gap:12px;padding:0 0 16px}
.ks-teil:last-child{padding-bottom:0}
.ks-teil:not(:last-child)::before{content:"";position:absolute;left:16px;top:34px;bottom:2px;width:2px;background:${C.linie}}
.ks-nr{width:34px;height:34px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;
  background:${C.seeTief};color:${C.flaggold};box-shadow:inset 0 0 0 1.5px rgba(237,187,0,0.55)}
.ks-chip{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 11px;border-radius:999px;border:none;cursor:pointer;font:inherit;
  font-size:12.5px;font-weight:700;transition:background .12s ease}
.ks-chip-ueben{background:rgba(237,187,0,0.16);color:${C.gruenDunkel}}
.ks-chip-ueben:hover{background:rgba(237,187,0,0.28)}
.ks-chip-wz{background:#EEF3FB;color:${C.seeTief}}
.ks-chip-wz:hover{background:#E1EAF7}
.ks-wz{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:10px;border-radius:14px;border:none;cursor:pointer;font:inherit;
  background:transparent;transition:background .12s ease}
.ks-wz:hover{background:#F3F6FB}
.ks-wz > span{overflow-wrap:break-word;hyphens:auto}
.ks-wz-zeichen{flex-shrink:0;width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:800;
  letter-spacing:-0.03em;color:#fff;background:linear-gradient(160deg,${C.see} 0%,${C.seeTief} 100%)}
.ks-nav{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}
.ks-nav button{display:flex;flex-direction:column;gap:2px;min-height:64px;padding:10px 14px;border-radius:16px;border:none;cursor:pointer;font:inherit;
  background-color:#fff;box-shadow:0 2px 12px rgba(15,26,51,0.06);color:${C.seeTief};text-align:left}
.ks-nav button:hover{box-shadow:0 4px 18px rgba(15,26,51,0.1)}
.ks-zwei{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
`;

function Pfeil({ links }) {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={links ? "M14.5 6l-6 6 6 6" : "M9.5 6l6 6-6 6"} /></svg>;
}
function Play() {
  return <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M8 5.5v13l10-6.5z" fill="currentColor" /></svg>;
}

/* Schulart und Klasse: aus dem Ziel, sonst aus der Auswahl im Quickfinder */
function zielMitKlasse(ziel) {
  const q = (() => { try { return quickfinderLesen() || {}; } catch { return {}; } })();
  return {
    kapitel: ziel && ziel.kapitel,
    schulart: (ziel && ziel.schulart) || q.schulart || SCHULART_STANDARD,
    klasse: (ziel && ziel.klasse) || q.klasse || null,
  };
}

/* Ohne Kapitel: die Kapitel der gewählten Klasse zum Aussuchen */
function KapitelWahl({ schulart, klasse, gehe }) {
  const box = klassenBoxen(schulart).find((b) => b.id === klasse) || null;
  const liste = box ? kapitelFuer(schulart, box.id) : [];
  return (
    <div className="ks-karte" style={{ marginTop: 4 }}>
      <p className="ks-kicker">{box ? `Klasse ${box.label}` : "Kapitel wählen"}</p>
      {liste.length === 0 && <p style={{ margin: 0, fontSize: 14, color: C.grau, lineHeight: 1.55 }}>Wähle im Menü ☰ unter „Meine Klasse“ deine Klasse, dann stehen hier ihre Kapitel.</p>}
      {liste.map((k) => (
        <button key={k.id} type="button" className="ks-wz" onClick={() => gehe(kapitelSeitenZiel(k.id, schulart, box.id))}>
          <span className="ks-nr" data-kein-i18n>{roemisch(k.nr)}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 14.5, fontWeight: 800, color: C.seeTief }}>{k.titel}</span>
            <span className="ks-zwei" style={{ fontSize: 12.5, color: C.grau, marginTop: 2 }}>{k.zeile}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function Kopf({ info, children }) {
  return (
    <div className="kopfblock" style={{ position: "relative", overflow: "hidden", background: `radial-gradient(90% 120% at 100% 0%, rgba(237,187,0,0.18) 0%, rgba(237,187,0,0) 55%), linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
      <div className="held mx-auto" style={{ maxWidth: 980, padding: "36px 16px 18px", position: "relative" }}>
        <p style={{ margin: "0 0 10px", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.flaggold }}>
          {info ? <>Kapitel{info.nr ? <span data-kein-i18n> {info.nr}</span> : null}{info.klasseLabel ? <> · Klasse <span data-kein-i18n>{info.klasseLabel} ({info.schulartName})</span></> : null}</> : "Schulbuch"}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {info && info.nr && (
            <span aria-hidden="true" data-kein-i18n style={{ flexShrink: 0, width: "clamp(46px, 9vw, 58px)", height: "clamp(46px, 9vw, 58px)", borderRadius: 999,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(17px, 3.4vw, 22px)", fontWeight: 800, letterSpacing: "-0.02em",
              color: C.seeTief, background: GOLD, boxShadow: "0 0 0 4px rgba(237,187,0,0.18), 0 10px 22px -10px rgba(237,187,0,0.9), inset 0 1px 0 rgba(255,255,255,0.6)" }}>{info.nr}</span>
          )}
          <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: "clamp(25px, 5.4vw, 36px)", letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0, maxWidth: 640, minWidth: 0, overflowWrap: "break-word", hyphens: "auto" }} lang="de">
            {info ? info.titel : "Deine Kapitel"}
          </h1>
        </div>
        <div style={{ width: 54, height: 4, background: GOLD, borderRadius: 2, margin: "16px 0 14px" }} />
        {info && <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 400, lineHeight: 1.55, margin: 0, maxWidth: 560 }}>{info.zeile}</p>}
        {children}
      </div>
      <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
    </div>
  );
}

export function KapitelSeite({ ziel, gehe }) {
  const z = zielMitKlasse(ziel);
  const info = z.kapitel ? kapitelUebersicht(z.kapitel, z.schulart, z.klasse) : null;
  const [aufgenommen, setAufgenommen] = useState(null);

  if (!info) {
    return (
      <>
        <style>{CSS}</style>
        <Kopf info={null} />
        <div className="ks-seite" style={{ paddingTop: 18 }}><KapitelWahl schulart={z.schulart} klasse={z.klasse} gehe={gehe} /></div>
      </>
    );
  }

  const insTraining = () => {
    const r = themenUebernehmen({ kapitel: info.id, schulart: info.schulart, klasse: info.box });
    setAufgenommen(r.aufgenommen.length ? "neu" : "schon");
  };
  const teilUeben = (t) => gehe({ ...info.trainieren, teil: t.id });

  return (
    <>
      <style>{CSS}</style>
      <Kopf info={info}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
          <button type="button" className="ks-knopf ks-gold" data-ks-trainieren onClick={() => gehe(info.trainieren)} style={{ flex: "1 1 210px" }}>
            <Play /> Kapitel trainieren
          </button>
          <button type="button" className="ks-knopf ks-glas" data-ks-training onClick={insTraining} style={{ flex: "1 1 210px" }} aria-live="polite">
            {aufgenommen === "neu" ? "✓ Im Mathe-Training" : aufgenommen === "schon" ? "✓ Schon im Mathe-Training" : "Ins Mathe-Training aufnehmen"}
          </button>
          <button type="button" className="ks-knopf ks-glas" data-ks-formeln onClick={() => gehe(info.formeln)} style={{ flex: "1 1 210px" }}>
            Formeln & Testklausur
          </button>
        </div>
      </Kopf>

      <div className="ks-seite" style={{ paddingTop: 10 }}>
        <div className="ks-raster">
          {/* Links: Was im Kapitel steckt */}
          <section className="ks-karte" aria-labelledby="ks-teile">
            <p className="ks-kicker" id="ks-teile">Was im Kapitel steckt</p>
            {info.teile.length === 0 && <p style={{ margin: 0, fontSize: 14, color: C.grau }}>Die Unterthemen dieses Kapitels folgen.</p>}
            {info.teile.map((t) => (
              <div key={t.id} className="ks-teil" data-ks-teil={t.id}>
                <span className="ks-nr" data-kein-i18n>{t.nr}</span>
                <div style={{ minWidth: 0, paddingTop: 5 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{t.titel}</p>
                  {(t.ueben || t.werkzeug) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {t.ueben && <button type="button" className="ks-chip ks-chip-ueben" onClick={() => teilUeben(t)}><Play /> Üben</button>}
                      {t.werkzeug && (
                        <button type="button" className="ks-chip ks-chip-wz" onClick={() => gehe(t.werkzeug.ziel)}>
                          <span data-kein-i18n style={{ fontWeight: 800, color: C.see }}>{t.werkzeug.zeichen}</span> {t.werkzeug.name}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {info.uebbar > 0 && (
              <p style={{ margin: "14px 0 0", fontSize: 12.5, color: C.grau, lineHeight: 1.5 }}>
                „Üben“ startet fünf Aufgaben genau zu diesem Unterthema. Was du falsch hast, kommt im Mathe-Training wieder.
              </p>
            )}
          </section>

          {/* Rechts: Werkzeuge, Nachschlagen, Kurs */}
          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "minmax(0,1fr)", minWidth: 0 }}>
            {info.werkzeuge.length > 0 && (
              <section className="ks-karte" style={{ padding: "18px 8px 8px" }} aria-labelledby="ks-wz">
                <p className="ks-kicker" id="ks-wz" style={{ padding: "0 10px" }}>Werkzeuge zum Kapitel</p>
                {info.werkzeuge.map((w) => (
                  <button key={w.id} type="button" className="ks-wz" onClick={() => gehe(w.ziel)} data-ks-werkzeug={w.id}>
                    <span className="ks-wz-zeichen" data-kein-i18n style={{ fontSize: [...w.zeichen].length <= 2 ? 17 : 13,
                      boxShadow: `inset 0 -3px 0 ${ETIKETT_FARBE[w.etikett] || "transparent"}` }}>{w.zeichen}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14.5, fontWeight: 800, color: C.seeTief, lineHeight: 1.25 }}>{w.name}</span>
                      <span className="ks-zwei" style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.35, marginTop: 1 }}>{w.zeile}</span>
                    </span>
                    {w.etikett && <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: ETIKETT_FARBE[w.etikett] }}>{ETIKETT_NAME[w.etikett]}</span>}
                  </button>
                ))}
              </section>
            )}
            {info.seiten.length > 0 && (
              <section className="ks-karte" style={{ padding: "18px 8px 8px" }} aria-labelledby="ks-seiten">
                <p className="ks-kicker" id="ks-seiten" style={{ padding: "0 10px" }}>Nachschlagen und entdecken</p>
                {info.seiten.map((s) => (
                  <button key={s.id} type="button" className="ks-wz" onClick={() => gehe(s.ziel)}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.seeTief }}>{s.name}</span>
                      <span className="ks-zwei" style={{ fontSize: 12.5, color: C.grau, marginTop: 1 }}>{s.zeile}</span>
                    </span>
                    <span style={{ color: C.hellgrau || C.grau }}><Pfeil /></span>
                  </button>
                ))}
              </section>
            )}
            {info.kurse.map((k) => (
              <button key={k.id} type="button" onClick={() => gehe(k.ziel)} data-ks-kurs={k.id}
                style={{ display: "block", width: "100%", textAlign: "left", border: "none", cursor: "pointer", font: "inherit", borderRadius: 18, padding: "16px 18px",
                  color: "#fff", background: `radial-gradient(90% 90% at 100% 0%, rgba(237,187,0,0.28) 0%, rgba(237,187,0,0) 60%), linear-gradient(160deg, #1B2C55 0%, ${C.seeTief} 100%)`,
                  boxShadow: "0 12px 26px -14px rgba(8,26,72,0.7)" }}>
                <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.flaggold }}>Unser Kurs dazu</span>
                <span style={{ display: "block", fontSize: 16, fontWeight: 800, marginTop: 4, letterSpacing: "-0.01em" }}>{k.name}</span>
                <span style={{ display: "block", fontSize: 13, color: "#C9D6EE", marginTop: 3, lineHeight: 1.4 }}>{k.zeile}</span>
              </button>
            ))}
          </div>
        </div>

        {(info.vor || info.nach) && (
          <nav className="ks-nav" aria-label="Weitere Kapitel">
            {info.vor ? (
              <button type="button" onClick={() => gehe(kapitelSeitenZiel(info.vor.id, info.schulart, info.box))}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C.grau }}><Pfeil links /> Kapitel <span data-kein-i18n>{info.vor.nr}</span></span>
                <span className="ks-zwei" style={{ fontSize: 14, fontWeight: 800 }}>{info.vor.titel}</span>
              </button>
            ) : <span />}
            {info.nach ? (
              <button type="button" onClick={() => gehe(kapitelSeitenZiel(info.nach.id, info.schulart, info.box))} style={{ alignItems: "flex-end", textAlign: "right" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C.grau }}>Kapitel <span data-kein-i18n>{info.nach.nr}</span> <Pfeil /></span>
                <span className="ks-zwei" style={{ fontSize: 14, fontWeight: 800 }}>{info.nach.titel}</span>
              </button>
            ) : <span />}
          </nav>
        )}
      </div>
    </>
  );
}
