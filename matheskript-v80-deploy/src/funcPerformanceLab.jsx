import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useKonto } from "./konto.js";
import { MathildaName } from "./mathildaName.jsx";
import { FEHLERTYPEN_TAX, HAUPTKATEGORIEN, kontextName, typName, untertypName } from "./perfTaxonomie.js";
import {
  MUSTER_NAMEN, QUELLEN, SCHWELLEN, STATUS_NAMEN, TAG, baueCluster, clusterTeilen, ereignisKorrigieren, fehlerquote, rueckfall,
  trainingsEffekt, trainingsVorschlaege, verlaufAussage, zaehlt, zurKlaerung,
} from "./perfKern.js";
import { RUNDEN_FUER_BADGE, trainingsStand } from "./perfTraining.js";
import { perfAendern, perfNutzerId, usePerf } from "./perfSpeicher.js";
import { BadgeUebersicht, Historie, TrainingsBereich } from "./funcPerfTraining.jsx";
import { Quellen } from "./funcPerfQuellen.jsx";
import { Absatz, Balken, Chip, Formel, KANAL_FARBE, Karte, Kicker, Knopf, L, MUSTER_FARBE, PerfStyles, Ring, STATUS_FARBE, Titel, datum, datumKurz, prozent } from "./perfUi.jsx";

/* ======================================================================
   PERFORMANCE-LAB  (Testbereich auf der Landingpage)
   Trainings- und Interaktionsebene eines dauerhaft gespeicherten Fehlerdiagnosesystems.
   Interner Projektname: „Fehlerschmiede“.

   Aufbau: Übersicht · Fehlerprofil · Verlauf · Training · Badges · Historie · Quellen
   Logik: perfTaxonomie.js, perfKern.js, perfAlgebra.js, perfAufgaben.js, perfTraining.js (alles ohne React, getestet in tests/)
   Speicher: perfSpeicher.js · Bausteine: perfUi.jsx
   ====================================================================== */

const TABS = [["uebersicht", "Übersicht"], ["profil", "Fehlerprofil"], ["verlauf", "Verlauf"], ["training", "Training"], ["badges", "Badges"], ["historie", "Historie"], ["quellen", "Quellen testen"]];

export function PerformanceLab() {
  const konto = useKonto();
  const nutzerId = perfNutzerId(konto);
  const { P, v } = usePerf();
  const [tab, setTab] = useState("uebersicht");
  const [startTyp, setStartTyp] = useState(null);
  const [analyseId, setAnalyseId] = useState(null);

  const daten = useMemo(() => ({
    cluster: baueCluster(P, nutzerId),
    klaerung: zurKlaerung(P, nutzerId),
    vorschlaege: trainingsVorschlaege(P, nutzerId),
    ereignisse: P.ereignisse.filter((e) => e.nutzerId === nutzerId),
  }), [P, v, nutzerId]);

  const trainingStarten = (typ) => { setStartTyp({ typ, nonce: Date.now() }); setTab("training"); };

  return (
    <section id="performance-lab" className="perf-lab" data-kein-i18n style={{ background: `linear-gradient(180deg, ${L.bg} 0%, ${L.bg2} 100%)`, color: L.text, fontFamily: "inherit" }}>
      <PerfStyles />
      <div className="mx-auto px-5" style={{ maxWidth: 980, paddingTop: 44, paddingBottom: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <Chip farbe={L.orange} voll>Testbereich</Chip>
          <Chip farbe={L.tuerkis}>Daten bleiben auf diesem Gerät</Chip>
        </div>
        <h2 style={{ margin: 0, fontSize: "clamp(30px, 8vw, 44px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.05, color: L.text }}>
          Performance-<span style={{ background: `linear-gradient(90deg, ${L.blau}, ${L.tuerkis})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Lab</span>
        </h2>
        <p style={{ margin: "14px 0 22px", maxWidth: 640, fontSize: 16, fontWeight: 400, lineHeight: 1.7, color: L.ged }}>
          Ein gemeinsames Fehlergedächtnis für digitales und handschriftliches Lernen. <MathildaName dunkel /> erkennt Muster – du trainierst gezielt dagegen.
        </p>

        <div role="tablist" aria-label="Performance-Lab" className="perf-tabs" style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 24, paddingBottom: 4, position: "sticky", top: 0, zIndex: 5, background: `${L.bg}ee`, backdropFilter: "blur(8px)", paddingTop: 8 }}>
          {TABS.map(([id, n]) => {
            const an = tab === id;
            const zahl = id === "profil" && daten.klaerung.length ? daten.klaerung.length : 0;
            return (
              <button key={id} role="tab" aria-selected={an} onClick={() => setTab(id)}
                style={{ fontFamily: "inherit", cursor: "pointer", flex: "0 0 auto", minHeight: 42, padding: "0 16px", borderRadius: 999, fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap",
                  color: an ? L.bg : L.ged, background: an ? `linear-gradient(135deg, ${L.blau}, ${L.tuerkis})` : "rgba(255,255,255,0.06)", border: `1px solid ${an ? "transparent" : L.linie}` }}>
                {n}{zahl ? <span style={{ marginLeft: 6, background: L.orange, color: L.bg, borderRadius: 999, padding: "1px 7px", fontSize: 11.5 }}>{zahl}</span> : null}
              </button>
            );
          })}
        </div>

        {tab === "uebersicht" && <Uebersicht P={P} nutzerId={nutzerId} daten={daten} setTab={setTab} trainingStarten={trainingStarten} />}
        {tab === "profil" && <Fehlerprofil P={P} nutzerId={nutzerId} daten={daten} setTab={setTab} onAnalyse={setAnalyseId} trainingStarten={trainingStarten} />}
        {tab === "verlauf" && <Verlauf P={P} nutzerId={nutzerId} daten={daten} setTab={setTab} />}
        {tab === "training" && <TrainingsBereich nutzerId={nutzerId} startTyp={startTyp} startHandled={() => setStartTyp(null)} />}
        {tab === "badges" && <BadgeUebersicht nutzerId={nutzerId} />}
        {tab === "historie" && <Historie nutzerId={nutzerId} />}
        {tab === "quellen" && <Quellen nutzerId={nutzerId} onAnalyse={(id) => setAnalyseId(id)} />}
      </div>
      {analyseId && <Analyse P={P} nutzerId={nutzerId} id={analyseId} onZu={() => setAnalyseId(null)} />}
    </section>
  );
}

/* ---------------------------------------------------------------- Übersicht */
function Zahl({ wert, label, farbe = L.tuerkis }) {
  return (
    <Karte style={{ padding: "16px 18px" }}>
      <p style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: farbe, lineHeight: 1 }}>{wert}</p>
      <p style={{ margin: "8px 0 0", fontSize: 13, color: L.ged, lineHeight: 1.45 }}>{label}</p>
    </Karte>
  );
}

function Uebersicht({ P, nutzerId, daten, setTab, trainingStarten }) {
  const { cluster, klaerung, vorschlaege, ereignisse } = daten;
  const zaehlend = ereignisse.filter(zaehlt);
  const muster = cluster.filter((c) => c.status === "wiederkehrend" || c.status === "gestuetzt");
  const moegl = cluster.filter((c) => c.status === "moeglich");
  const st = trainingsStand(P, nutzerId, "vorzeichen");
  const top = vorschlaege[0];
  const [offen, setOffen] = useState(null);
  const leer = !ereignisse.length;

  return (
    <div className="perf-rein">
      <div className="perf-raster" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: 14 }}>
        <Zahl wert={zaehlend.length} label="Fehlerereignisse im Profil" farbe={L.blau} />
        <Zahl wert={muster.length} label="wiederkehrende Muster" farbe={L.orange} />
        <Zahl wert={moegl.length} label="mögliche Muster" farbe={L.tuerkis} />
        <Zahl wert={klaerung.length} label="warten auf Klärung" farbe={L.violett} />
      </div>

      <div className="perf-raster">
        <Karte hoch style={{ borderColor: top ? `${L.orange}77` : L.linie }}>
          <Kicker farbe={L.orange}>Dein nächster Trainingsschritt</Kicker>
          {top ? (
            <>
              <Titel>{top.name}</Titel>
              <Absatz>{top.grund}</Absatz>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                <Chip farbe={MUSTER_FARBE[top.status]}>{MUSTER_NAMEN[top.status]}</Chip>
                {top.kanaele.map((k) => <Chip key={k} farbe={KANAL_FARBE[k]}>{QUELLEN[k]}</Chip>)}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {top.trainierbar ? <Knopf art="orange" onClick={() => trainingStarten(top.typ)}>Training starten</Knopf> : <Chip farbe={L.still}>Training in Vorbereitung</Chip>}
                <Knopf art="sekundaer" onClick={() => setOffen(offen === top.typ ? null : top.typ)}>Wie wurde das berechnet?</Knopf>
              </div>
              {offen === top.typ && <Berechnung v={top} />}
            </>
          ) : (
            <>
              <Titel>{leer ? "Noch keine Daten" : "Noch kein Muster erkennbar"}</Titel>
              <Absatz>{leer
                ? "Sobald Fehler aus Übungen, von eingescannten Blättern oder von dir selbst gemeldet vorliegen, schlägt dir das Lab passende Trainings vor. Mit Testdaten siehst du sofort, wie es aussieht."
                : "Ein einzelner Fehler ist noch kein Muster. Vorschläge erscheinen, sobald sich ein Fehlertyp an mehreren Stellen wiederholt."}</Absatz>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Knopf onClick={() => setTab("quellen")}>Quellen testen</Knopf>
                <Knopf art="sekundaer" onClick={() => setTab("training")}>Selbst einen Typ wählen</Knopf>
              </div>
            </>
          )}
        </Karte>

        <Karte>
          <Kicker farbe={L.violett}>Skill-Badge</Kicker>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Ring wert={st.erfolgreicheRunden} max={RUNDEN_FUER_BADGE} groesse={104} dicke={10} farbe={L.orange} farbe2={L.violett} label={`${st.erfolgreicheRunden} von ${RUNDEN_FUER_BADGE} Runden`}>
              <span style={{ fontSize: 24, fontWeight: 800 }}>{st.badge ? "±" : `${st.erfolgreicheRunden}/${RUNDEN_FUER_BADGE}`}</span>
            </Ring>
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{st.badgeName}</p>
              <p style={{ margin: "4px 0 10px", fontSize: 13.5, color: L.ged, lineHeight: 1.55 }}>{st.badge ? `Freigeschaltet am ${datum(st.badge.zeit)}.` : `${st.erfolgreicheRunden} von ${RUNDEN_FUER_BADGE} erfolgreichen Runden.`}</p>
              <Knopf klein art="violett" onClick={() => trainingStarten("vorzeichen")}>{st.laufend ? "Runde fortsetzen" : "Runde starten"}</Knopf>
            </div>
          </div>
        </Karte>

        <Karte>
          <Kicker>Zwei Lernkanäle, ein Gedächtnis</Kicker>
          {["digital", "scan"].map((k) => {
            const n = zaehlend.filter((e) => e.quelle === k).length;
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: KANAL_FARBE[k], flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14.5, color: L.text }}>{k === "digital" ? "Digitale Übungen" : "Eingescannte Blätter"}</span>
                <b style={{ fontSize: 18, color: KANAL_FARBE[k] }}>{n}</b>
              </div>
            );
          })}
          <Knopf klein art="geist" onClick={() => setTab("quellen")}>Scan oder Übung testen</Knopf>
        </Karte>
      </div>

      {vorschlaege.length > 1 && (
        <div style={{ marginTop: 22 }}>
          <Kicker>Weitere Vorschläge</Kicker>
          <div className="perf-raster">
            {vorschlaege.slice(1, 5).map((v) => (
              <Karte key={v.typ} style={{ padding: 16 }}>
                <p style={{ margin: "0 0 4px", fontSize: 15.5, fontWeight: 700 }}>{v.name}</p>
                <p style={{ margin: "0 0 10px", fontSize: 13.5, color: L.ged, lineHeight: 1.6 }}>{v.grund}</p>
                {v.trainierbar && <Knopf klein onClick={() => trainingStarten(v.typ)}>Training starten</Knopf>}
              </Karte>
            ))}
          </div>
        </div>
      )}
      <p style={{ margin: "22px 0 0", fontSize: 12.5, color: L.still, lineHeight: 1.7, maxWidth: 700 }}>
        Vorschläge entstehen nach festen, sichtbaren Regeln – nicht aus einer undurchsichtigen KI-Rangliste. Ein einzelnes Ereignis begründet keine Schwächenaussage; Muster werden erst nach mehreren passenden Beobachtungen so genannt.
      </p>
    </div>
  );
}

function Berechnung({ v }) {
  return (
    <div className="perf-rein" style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: `1px solid ${L.linie}` }}>
      {v.teile.map(([n, p], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13.5, color: L.ged, padding: "3px 0" }}>
          <span>{n}</span><b style={{ color: p < 0 ? L.rot : L.gruen }}>{p > 0 ? `+${p}` : p}</b>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: L.text, borderTop: `1px solid ${L.linie}`, marginTop: 6, paddingTop: 6 }}><b>Summe</b><b>{v.punkte} Punkte</b></div>
    </div>
  );
}

/* ---------------------------------------------------------------- Fehlerprofil */
const MUSTER_ERKLAERUNG = {
  einzeln: "Erst eine Beobachtung. Das ist noch kein Muster und sagt nichts über eine Schwäche aus.",
  moeglich: `Zwei Beobachtungen: möglich, aber noch nicht belegt. Ein wiederkehrendes Muster braucht mindestens ${SCHWELLEN.wiederkehrend} Beobachtungen an ${SCHWELLEN.wiederkehrendTage} Tagen in ${SCHWELLEN.wiederkehrendAufgaben} verschiedenen Aufgaben, davon ${SCHWELLEN.wiederkehrendSicher} sichere.`,
  wiederkehrend: "Der Fehler ist an mehreren Tagen in verschiedenen Aufgaben aufgetreten und durch sichere Beobachtungen belegt.",
  gestuetzt: `Zusätzlich durch viele Beobachtungen (≥ ${SCHWELLEN.gestuetzt} an ≥ ${SCHWELLEN.gestuetztTage} Tagen) oder durch beide Lernkanäle (≥ ${SCHWELLEN.gestuetztKanalMin}) gestützt.`,
};

function Fehlerprofil({ P, nutzerId, daten, onAnalyse, trainingStarten, setTab }) {
  const { cluster, klaerung, ereignisse } = daten;
  const [offen, setOffen] = useState(null);
  const [teilen, setTeilen] = useState({});
  const evById = (id) => ereignisse.find((e) => e.id === id);

  return (
    <div className="perf-rein">
      <Kicker>Fehlerprofil</Kicker>
      <Titel>Deine Fehlermuster – mit Quelle und Begründung</Titel>
      <Absatz>Jedes Cluster fasst Fehler desselben Typs und Untertyps zusammen. Gleiche falsche Ergebnisse allein reichen dafür nicht – es zählt die belegte Ursache. Du kannst jede Zuordnung korrigieren.</Absatz>

      {!cluster.length && (
        <Karte><Absatz>Noch keine zählenden Fehlerereignisse. Lade Testdaten oder teste einen Scan im Tab „Quellen testen“.</Absatz><Knopf onClick={() => setTab("quellen")}>Zu den Quellen</Knopf></Karte>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {cluster.map((c) => {
          const auf = offen === c.id;
          const sel = Object.keys(teilen).filter((k) => teilen[k] && c.ereignisIds.includes(k));
          const q = fehlerquote(P, nutzerId, c.typ);
          const trainierbar = FEHLERTYPEN_TAX[c.typ]?.training;
          return (
            <Karte key={c.id} style={{ padding: 18, borderColor: `${MUSTER_FARBE[c.status]}66` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div style={{ minWidth: 0, flex: "1 1 260px" }}>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }}>{typName(c.typ)}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 13.5, color: L.ged, lineHeight: 1.5 }}>
                    {HAUPTKATEGORIEN[c.haupt]?.name}{c.untertyp !== "allgemein" ? ` · ${untertypName(c.typ, c.untertyp)}` : ""}
                  </p>
                </div>
                <Chip farbe={MUSTER_FARBE[c.status]} voll={c.status === "gestuetzt" || c.status === "wiederkehrend"}>{MUSTER_NAMEN[c.status]}</Chip>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
                <Chip farbe={L.blau}>{c.haeufigkeit} Beobachtung{c.haeufigkeit === 1 ? "" : "en"}</Chip>
                <Chip farbe={L.blau}>{c.tage} Tag{c.tage === 1 ? "" : "e"}</Chip>
                <Chip farbe={L.blau}>{c.aufgabenAnzahl} Aufgabe{c.aufgabenAnzahl === 1 ? "" : "n"}</Chip>
                <Chip farbe={L.tuerkis}>Sicherheit {prozent(c.konfidenz)}</Chip>
                {c.themen.map((t) => <Chip key={t} farbe={L.still}>{kontextName(t)}</Chip>)}
              </div>

              <div aria-label={`Quellen: ${c.quellen.digital} digital, ${c.quellen.scan} Scan, ${c.quellen.manuell} manuell`} style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,0.08)", marginBottom: 6 }}>
                {["digital", "scan", "manuell"].map((k) => c.quellen[k] ? <span key={k} style={{ flex: c.quellen[k], background: KANAL_FARBE[k] }} /> : null)}
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 12.5, color: L.ged }}>
                Herkunft: {["digital", "scan", "manuell"].filter((k) => c.quellen[k]).map((k) => `${c.quellen[k]}× ${QUELLEN[k]}`).join(" · ")}
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 13.5, color: L.ged, lineHeight: 1.65 }}><b style={{ color: L.text }}>Warum „{MUSTER_NAMEN[c.status]}“? </b>{MUSTER_ERKLAERUNG[c.status]}</p>

              {c.letzteTraining && <p style={{ margin: "0 0 12px", fontSize: 13, color: L.ged }}>Letzte erfolgreiche Trainingsrunde: {datum(c.letzteTraining)}. Letzte Beobachtung: {datum(c.letzte)}.</p>}
              {q.aufgaben > 0 && <p style={{ margin: "0 0 12px", fontSize: 13, color: L.ged }}>Fehlerquote in vergleichbaren digitalen Aufgaben: {q.fehler} von {q.aufgaben}.</p>}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Knopf klein art="sekundaer" onClick={() => setOffen(auf ? null : c.id)} aria-expanded={auf}>{auf ? "Beobachtungen ausblenden" : "Beobachtungen und Gründe"}</Knopf>
                {trainierbar && (c.status !== "einzeln") && <Knopf klein art="orange" onClick={() => trainingStarten(c.typ)}>Training starten</Knopf>}
              </div>

              {auf && (
                <div className="perf-rein" style={{ marginTop: 14 }}>
                  {c.gruende.slice().reverse().map((g) => {
                    const e = evById(g.id); if (!e) return null;
                    return (
                      <div key={g.id} style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", marginBottom: 8 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                          {c.haeufigkeit > 1 && c.ereignisIds.length > 1 && (
                            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: L.ged, minHeight: 32 }}>
                              <input type="checkbox" checked={!!teilen[g.id]} onChange={(ev) => setTeilen({ ...teilen, [g.id]: ev.target.checked })} aria-label="Zum Abtrennen auswählen" />abtrennen
                            </label>
                          )}
                          <Chip farbe={KANAL_FARBE[e.quelle]}>{QUELLEN[e.quelle]}</Chip>
                          <Chip farbe={STATUS_FARBE[e.status]}>{STATUS_NAMEN[e.status]}</Chip>
                          {e.demo && <Chip farbe={L.orange}>Test</Chip>}
                          <span style={{ fontSize: 12, color: L.still }}>{datum(e.zeit)}</span>
                        </div>
                        {e.schritt && <div style={{ overflowX: "auto", marginBottom: 4 }}><Formel t={e.schritt} /></div>}
                        <p style={{ margin: "0 0 6px", fontSize: 12.5, color: L.ged, lineHeight: 1.55 }}>{g.text}</p>
                        <Knopf klein art="geist" onClick={() => onAnalyse(e.id)}>Analyse öffnen</Knopf>
                      </div>
                    );
                  })}
                  {c.ereignisIds.length > 1 && (
                    <div style={{ marginTop: 6 }}>
                      <p style={{ margin: "0 0 8px", fontSize: 12.5, color: L.still, lineHeight: 1.6 }}>Mischt dieses Cluster verschiedene Ursachen? Wähle Beobachtungen aus und trenne sie ab – sie bilden dann ein eigenes Cluster.</p>
                      <Knopf klein art="sekundaer" disabled={!sel.length || sel.length >= c.ereignisIds.length} onClick={() => { perfAendern((Pm) => clusterTeilen(Pm, nutzerId, c.id, sel)); setTeilen({}); }}>Auswahl abtrennen ({sel.length})</Knopf>
                    </div>
                  )}
                </div>
              )}
            </Karte>
          );
        })}
      </div>

      {klaerung.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <Kicker farbe={L.orange}>Zur Klärung</Kicker>
          <Absatz>Diese Stellen sind unsicher, zum Beispiel wegen schwer lesbarer Handschrift. Sie zählen erst, wenn du sie bestätigst – sonst verfälschen sie dein Profil nicht.</Absatz>
          <div style={{ display: "grid", gap: 10 }}>
            {klaerung.map((e) => (
              <Karte key={e.id} style={{ padding: 16, borderColor: `${L.orange}66` }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                  <Chip farbe={KANAL_FARBE[e.quelle]}>{QUELLEN[e.quelle]}</Chip><Chip farbe={L.orange}>Sicherheit {prozent(e.konfidenz)}</Chip>
                  <span style={{ fontSize: 12, color: L.still }}>{datum(e.zeit)}</span>
                </div>
                <div style={{ overflowX: "auto", marginBottom: 8 }}><Formel t={e.schritt} /></div>
                <p style={{ margin: "0 0 10px", fontSize: 13.5, color: L.ged }}>Mögliche Ursache: {e.typ ? `${typName(e.typ)}${e.untertyp !== "allgemein" ? `, ${untertypName(e.typ, e.untertyp)}` : ""}` : "offen"}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {e.typ && <Knopf klein onClick={() => perfAendern((Pm) => ereignisKorrigieren(Pm, nutzerId, e.id, { status: "bestaetigt" }))}>Ja, bestätigen</Knopf>}
                  <Knopf klein art="geist" onClick={() => onAnalyse(e.id)}>Analyse öffnen</Knopf>
                  <Knopf klein art="gefahr" onClick={() => perfAendern((Pm) => ereignisKorrigieren(Pm, nutzerId, e.id, { status: "verworfen" }))}>Verwerfen</Knopf>
                </div>
              </Karte>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Verlauf */
function Verlauf({ P, nutzerId, daten, setTab }) {
  const { cluster } = daten;
  const typen = [...new Set([...cluster.map((c) => c.typ), ...P.aufgaben.filter((a) => a.nutzerId === nutzerId).flatMap((a) => a.testet)])].filter((t) => FEHLERTYPEN_TAX[t]);
  return (
    <div className="perf-rein">
      <Kicker>Verlauf</Kicker>
      <Titel>Wie entwickeln sich deine Fehler?</Titel>
      <Absatz>Aussagen zur Entwicklung gibt es nur, wenn genug vergleichbare Aufgaben vorliegen. Weniger Fehler bei deutlich weniger Übung gelten nicht als Verbesserung, und ein einzelnes erfolgreiches Training beweist keine dauerhafte Sicherheit.</Absatz>
      {!typen.length && <Karte><Absatz>Noch keine Daten für einen Verlauf.</Absatz><Knopf onClick={() => setTab("quellen")}>Daten erzeugen</Knopf></Karte>}
      <div style={{ display: "grid", gap: 12 }}>
        {typen.map((typ) => {
          const cs = cluster.filter((c) => c.typ === typ);
          const wochen = cs[0]?.verlauf.map((w, i) => ({ woche: w.woche, n: cs.reduce((s, c) => s + c.verlauf[i].n, 0) })) || Array.from({ length: 12 }, (_, i) => ({ woche: i, n: 0 }));
          const training = P.runden.filter((r) => r.nutzerId === nutzerId && r.typ === typ && r.status === "erfolgreich").map((r) => Math.floor(((r.ende || r.zeit) / TAG + 3) / 7));
          const a = verlaufAussage(P, nutzerId, typ), eff = trainingsEffekt(P, nutzerId, typ), rf = rueckfall(P, nutzerId, typ), q = fehlerquote(P, nutzerId, typ);
          return (
            <Karte key={typ}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{typName(typ)}</p>
                <span style={{ fontSize: 12.5, color: L.still }}>letzte 12 Wochen · orange Rahmen = erfolgreiches Training</span>
              </div>
              <Balken daten={wochen} farbe={L.blau} markiere={training} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: L.still, margin: "4px 0 12px" }}><span>vor 12 Wochen</span><span>diese Woche</span></div>
              <p style={{ margin: "0 0 8px", fontSize: 14, color: L.text, lineHeight: 1.65 }}>{a.text}</p>
              {q.aufgaben > 0 && <p style={{ margin: "0 0 8px", fontSize: 13, color: L.ged }}>Insgesamt {q.fehler} Fehler in {q.aufgaben} vergleichbaren digitalen Aufgaben.</p>}
              {eff && <p style={{ margin: "0 0 8px", fontSize: 13.5, color: L.ged, lineHeight: 1.65 }}><b style={{ color: L.violett }}>Nach dem Training: </b>{eff.text}</p>}
              {rf && <p style={{ margin: 0, fontSize: 13.5, color: L.orange, lineHeight: 1.65 }}>Erneut aufgetreten nach {rf.nachTagen} Tagen ohne diesen Fehler – am {datum(rf.zeit)}.</p>}
            </Karte>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Analyse eines Fehlers */
function Analyse({ P, nutzerId, id, onZu }) {
  const e = P.ereignisse.find((x) => x.id === id && x.nutzerId === nutzerId);
  const [typ, setTyp] = useState(e?.typ || "vorzeichen");
  const [unter, setUnter] = useState(e?.untertyp || "allgemein");
  if (!e) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Analyse eines Fehlers" onClick={onZu}
      data-kein-i18n style={{ fontFamily: "Montserrat, system-ui, sans-serif", position: "fixed", inset: 0, zIndex: 70, background: "rgba(6,12,32,0.8)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0 }}>
      <div onClick={(ev) => ev.stopPropagation()} className="perf-lab" style={{ background: L.bg2, color: L.text, width: "100%", maxWidth: 720, maxHeight: "92vh", overflowY: "auto", borderRadius: "24px 24px 0 0", padding: "22px 20px 30px", border: `1px solid ${L.linieStark}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Kicker style={{ margin: 0 }}>Analyse des Fehlers</Kicker>
          <Knopf klein art="sekundaer" onClick={onZu} aria-label="Schließen">Schließen</Knopf>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <Chip farbe={KANAL_FARBE[e.quelle]}>{QUELLEN[e.quelle]}</Chip><Chip farbe={STATUS_FARBE[e.status]} voll>{STATUS_NAMEN[e.status]}</Chip>
          <Chip farbe={L.tuerkis}>Sicherheit {prozent(e.konfidenz)}</Chip>{e.demo && <Chip farbe={L.orange}>Testdaten</Chip>}
        </div>

        <Block titel="1 · Beobachtung" farbe={L.tuerkis}>
          <p style={{ margin: "0 0 8px", fontSize: 14, color: L.ged, lineHeight: 1.6 }}>{e.beobachtung}</p>
          <div style={{ overflowX: "auto", padding: "10px 12px", background: L.bg, borderRadius: 12, marginBottom: 6 }}>
            <p style={{ margin: "0 0 4px", fontSize: 11.5, color: L.still }}>Fehlerhafter Schritt{e.stelle ? ` (${e.stelle})` : ""}</p><Formel t={e.schritt} gross />
          </div>
          {e.korrekt && <div style={{ overflowX: "auto", padding: "10px 12px", background: L.bg, borderRadius: 12 }}><p style={{ margin: "0 0 4px", fontSize: 11.5, color: L.still }}>Richtig wäre</p><Formel t={e.korrekt} gross farbe={L.gruen} /></div>}
        </Block>
        <Block titel="2 · Mathematische Prüfung" farbe={L.tuerkis}><p style={{ margin: 0, fontSize: 14, color: L.ged, lineHeight: 1.65 }}>{e.pruefung || "Keine automatische Prüfung gespeichert."}</p></Block>
        <Block titel="3 · Ursachenhypothesen" farbe={L.tuerkis}>
          {e.hypothesen?.length ? e.hypothesen.map((h, i) => (
            <p key={i} style={{ margin: "0 0 6px", fontSize: 14, color: L.ged, lineHeight: 1.6 }}><b style={{ color: L.text }}>{typName(h.typ)}{h.untertyp && h.untertyp !== "allgemein" ? ` · ${untertypName(h.typ, h.untertyp) || h.untertyp}` : ""}</b> – {prozent(h.konfidenz)}. {h.grund}</p>
          )) : <p style={{ margin: 0, fontSize: 14, color: L.ged }}>Keine weiteren Hypothesen gespeichert.</p>}
        </Block>
        <Block titel="4 · Einordnung und Herkunft" farbe={L.tuerkis}>
          <p style={{ margin: 0, fontSize: 14, color: L.ged, lineHeight: 1.75 }}>
            <b style={{ color: L.text }}>Typ:</b> {e.typ ? `${typName(e.typ)} (${HAUPTKATEGORIEN[e.haupt]?.name})` : "noch offen"}{e.untertyp && e.untertyp !== "allgemein" ? ` · ${untertypName(e.typ, e.untertyp)}` : ""}<br />
            <b style={{ color: L.text }}>Kontext:</b> {kontextName(e.aufgabe.kontext)}<br />
            <b style={{ color: L.text }}>Zeit:</b> {datum(e.zeit)} · <b style={{ color: L.text }}>Ursprung:</b> {e.ursprung.art} · Taxonomie v{e.taxonomie}<br />
            <b style={{ color: L.text }}>Zuordnung:</b> {e.zuordnung}
          </p>
        </Block>

        <Block titel="Zuordnung korrigieren" farbe={L.orange}>
          <div className="perf-raster">
            <select aria-label="Fehlertyp" value={typ} onChange={(ev) => { setTyp(ev.target.value); setUnter("allgemein"); }} style={sel}>
              {Object.entries(HAUPTKATEGORIEN).map(([h, hn]) => <optgroup key={h} label={hn.name}>{Object.entries(FEHLERTYPEN_TAX).filter(([, t]) => t.haupt === h).map(([i, t]) => <option key={i} value={i}>{t.name}</option>)}</optgroup>)}
            </select>
            <select aria-label="Untertyp" value={unter} onChange={(ev) => setUnter(ev.target.value)} style={sel}>{Object.entries(FEHLERTYPEN_TAX[typ].untertypen).map(([i, n]) => <option key={i} value={i}>{n}</option>)}</select>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <Knopf klein onClick={() => perfAendern((Pm) => ereignisKorrigieren(Pm, nutzerId, e.id, { typ, untertyp: unter }))}>Neu zuordnen</Knopf>
            {e.typ && e.status !== "bestaetigt" && <Knopf klein art="violett" onClick={() => perfAendern((Pm) => ereignisKorrigieren(Pm, nutzerId, e.id, { status: "bestaetigt" }))}>Bestätigen</Knopf>}
            {e.status !== "verworfen" ? <Knopf klein art="gefahr" onClick={() => perfAendern((Pm) => ereignisKorrigieren(Pm, nutzerId, e.id, { status: "verworfen" }))}>Verwerfen</Knopf>
              : <Knopf klein art="geist" onClick={() => perfAendern((Pm) => ereignisKorrigieren(Pm, nutzerId, e.id, { status: e.typ ? "bestaetigt" : "unsicher" }))}>Wiederherstellen</Knopf>}
          </div>
        </Block>
      </div>
    </div>, document.body);
}
const sel = { fontFamily: "inherit", fontSize: 14.5, color: L.text, background: L.bg, border: `1.5px solid ${L.linieStark}`, borderRadius: 12, padding: "11px 12px", minHeight: 46, width: "100%", boxSizing: "border-box" };
function Block({ titel, farbe, children }) {
  return <div style={{ marginBottom: 16 }}><p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: farbe }}>{titel}</p>{children}</div>;
}
