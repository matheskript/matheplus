import React, { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FEHLERTYPEN_TAX, HAUPTKATEGORIEN, untertypName } from "./perfTaxonomie.js";
import { AUFGABEN, aufgabeVon, hilfeText, loesungsWeg } from "./perfAufgaben.js";
import { trainingsVorschlaege, hashId } from "./perfKern.js";
import {
  BADGES, MAX_HILFE, RUNDEN_FUER_BADGE, RUNDE_GROESSE, antworten, badgeName, badgeSymbol, badgesVon, hilfeNehmen, laufendeRunde, loesungAufdecken,
  rundeAbbrechen, rundenHistorie, starteRunde, trainingsStand,
} from "./perfTraining.js";
import { perfAendern, usePerf } from "./perfSpeicher.js";
import { Absatz, Chip, Formel, Formeleingabe, Karte, Kicker, Knopf, Konfetti, L, MText, Ring, Titel, datum } from "./perfUi.jsx";

/* ======================================================================
   Training, Skill-Badges und Historie des Performance-Labs.
   Der Zustand einer Runde liegt vollständig im Fehlergedächtnis (perfTraining.js):
   Wer die Seite neu lädt, macht genau dort weiter, wo er war.
   ====================================================================== */

const MAX_VORSCHLAG = 3;
const RUNDEN_STATUS_FARBE = { laufend: L.blau, erfolgreich: L.gruen, nicht_geschafft: L.orange, abgebrochen: L.still };
const RUNDEN_STATUS_TEXT = { laufend: "läuft", erfolgreich: "erfolgreich", nicht_geschafft: "nicht geschafft", abgebrochen: "abgebrochen" };

/* ---------------------------------------------------------------- Auswahl */
export function TrainingsBereich({ nutzerId, startTyp, startHandled }) {
  const { P } = usePerf();
  const [aktiv, setAktiv] = useState(null);               // Runden-ID, die gerade angezeigt wird
  const [schwerpunkt, setSchwerpunkt] = useState({});     // typ → untertyp
  const [meldung, setMeldung] = useState("");
  const gestartetVon = useRef(null);

  const start = (typ) => {
    const r = perfAendern((Pm) => starteRunde(Pm, nutzerId, typ, { untertyp: schwerpunkt[typ] || undefined }));
    if (!r.ok) { setMeldung(r.grund); return; }
    setMeldung(""); setAktiv(r.runde.id);
  };

  /* Sprung vom Dashboard: „Training starten“ für einen bestimmten Typ (nur einmal pro Anfrage) */
  React.useEffect(() => {
    if (startTyp && gestartetVon.current !== startTyp.nonce) {
      gestartetVon.current = startTyp.nonce;
      start(startTyp.typ);
      startHandled && startHandled();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTyp]);

  const lauf = aktiv ? P.runden.find((r) => r.id === aktiv && r.nutzerId === nutzerId) : null;
  if (lauf) return <Runde nutzerId={nutzerId} rundeId={lauf.id} onZurueck={() => setAktiv(null)} onNaechste={(typ) => { setAktiv(null); setTimeout(() => start(typ), 0); }} />;

  const vorschlaege = trainingsVorschlaege(P, nutzerId).filter((v) => v.trainierbar).slice(0, MAX_VORSCHLAG);
  const gruppen = Object.entries(HAUPTKATEGORIEN).map(([id, h]) => ({ id, h, typen: Object.entries(FEHLERTYPEN_TAX).filter(([, t]) => t.haupt === id) }));

  return (
    <div className="perf-rein">
      <Kicker>Training</Kicker>
      <Titel>Wähle einen Fehlertyp und trainiere gezielt</Titel>
      <Absatz>
        Eine Runde besteht aus {RUNDE_GROESSE} geprüften Aufgaben desselben Fehlertyps. Du gibst den korrigierten Term selbst ein.
        {" "}Nach {RUNDEN_FUER_BADGE} erfolgreichen Runden ({RUNDEN_FUER_BADGE * RUNDE_GROESSE} gelöste Aufgaben) wird das Skill-Badge freigeschaltet.
      </Absatz>

      {vorschlaege.length > 0 && (
        <Karte style={{ marginBottom: 16, borderColor: `${L.orange}66` }}>
          <Kicker farbe={L.orange}>Für dich vorgeschlagen</Kicker>
          {vorschlaege.map((v) => (
            <div key={v.typ} style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 6 }}>
              <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: L.text }}>{v.name}</p>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: L.ged }}>{v.grund}</p>
              </div>
              <Knopf art="orange" klein onClick={() => start(v.typ)}>Training starten</Knopf>
            </div>
          ))}
        </Karte>
      )}

      <p style={{ margin: "18px 0 10px", fontSize: 13.5, color: L.ged }}>
        <b style={{ color: L.text }}>Manuell wählen:</b> Du kannst jeden Fehlertyp unabhängig von automatischen Vorschlägen auswählen.
      </p>
      {meldung && <p role="status" style={{ color: L.orange, fontSize: 14, margin: "0 0 12px" }}>{meldung}</p>}

      {gruppen.map(({ id, h, typen }) => (
        <section key={id} style={{ marginBottom: 22 }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: L.text }}>{h.name}</p>
          <p style={{ margin: "0 0 10px", fontSize: 12.5, color: L.still, lineHeight: 1.5 }}>{h.kurz}</p>
          <div className="perf-raster">
            {typen.map(([typ, t]) => {
              const st = trainingsStand(P, nutzerId, typ);
              const untertypen = t.training ? [...new Set((AUFGABEN[typ] || []).map((a) => a.untertyp))] : [];
              return (
                <Karte key={typ} style={{ padding: 16, opacity: t.training ? 1 : 0.7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: L.text, lineHeight: 1.35 }}>{t.name}</p>
                    {t.training ? <Chip farbe={L.tuerkis}>trainierbar</Chip> : <Chip farbe={L.still}>in Vorbereitung</Chip>}
                  </div>
                  {t.training && (
                    <>
                      <p style={{ margin: "8px 0 10px", fontSize: 12.5, color: L.ged }}>{st.erfolgreicheRunden} von {st.noetig} erfolgreichen Runden{st.badge ? " · Badge freigeschaltet" : ""}</p>
                      {untertypen.length > 1 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }} role="group" aria-label="Schwerpunkt wählen">
                          {[["", "Gemischt"], ...untertypen.map((u) => [u, untertypName(typ, u)])].map(([u, n]) => {
                            const an = (schwerpunkt[typ] || "") === u;
                            return (
                              <button key={u || "gemischt"} type="button" onClick={() => setSchwerpunkt({ ...schwerpunkt, [typ]: u })} aria-pressed={an}
                                style={{ fontFamily: "inherit", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "6px 10px", borderRadius: 999, minHeight: 34,
                                  color: an ? L.bg : L.ged, background: an ? L.tuerkis : "rgba(255,255,255,0.06)", border: `1px solid ${an ? L.tuerkis : L.linie}` }}>{n}</button>
                            );
                          })}
                        </div>
                      )}
                      <Knopf klein onClick={() => start(typ)}>{st.laufend ? "Runde fortsetzen" : "Training starten"}</Knopf>
                    </>
                  )}
                  {!t.training && <p style={{ margin: "8px 0 0", fontSize: 12.5, color: L.still, lineHeight: 1.55 }}>Dafür gibt es noch keine mathematisch geprüften Aufgaben. Ein freier Aufgabengenerator wird erst genutzt, wenn jede Aufgabe vor dem Einsatz zuverlässig validiert wird.</p>}
                </Karte>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Runde */
function Runde({ nutzerId, rundeId, onZurueck, onNaechste }) {
  const { P } = usePerf();
  const r = P.runden.find((x) => x.id === rundeId && x.nutzerId === nutzerId);
  const [sel, setSel] = useState(null);
  const [eingabe, setEingabe] = useState("");
  const [rueck, setRueck] = useState(null);         // letzte Bewertung (nur Anzeige)
  const [weg, setWeg] = useState(null);
  const [badge, setBadge] = useState(null);
  const [bestaetigeLoesung, setBestaetigeLoesung] = useState(false);
  const sperre = useRef({ k: "", t: 0 });

  if (!r) return null;
  const offenPos = r.aufgaben.findIndex((s) => s.status === "offen");
  const pos = sel != null && r.aufgaben[sel] ? sel : offenPos >= 0 ? offenPos : r.aufgaben.length - 1;
  const slot = r.aufgaben[pos];
  const a = aufgabeVon(slot.id);
  const st = trainingsStand(P, nutzerId, r.typ);
  const geloest = r.aufgaben.filter((s) => s.status === "geloest").length;
  const beendet = r.status !== "laufend";

  const waehle = (i) => { setSel(i); setEingabe(""); setRueck(null); setWeg(null); setBestaetigeLoesung(false); };

  const pruefen = () => {
    if (slot.status !== "offen") return;
    const k = `${r.id}:${pos}:${eingabe.trim()}`;
    const jetzt = Date.now();
    if (sperre.current.k === k && jetzt - sperre.current.t < 900) return;       // Doppelklick
    sperre.current = { k, t: jetzt };
    const res = perfAendern((Pm) => antworten(Pm, nutzerId, r.id, pos, eingabe, { anfrageId: hashId(r.id, pos, slot.versuche.length, eingabe.trim()) }));
    setRueck(res.bewertung || null);
    if (res.neuesBadge) setBadge(res.neuesBadge);
    if (res.bewertung && res.bewertung.art === "richtig") { setEingabe(""); }
  };
  const hilfe = () => { perfAendern((Pm) => hilfeNehmen(Pm, nutzerId, r.id, pos)); };
  const loesung = () => {
    const res = perfAendern((Pm) => loesungAufdecken(Pm, nutzerId, r.id, pos));
    setWeg(res.weg || null); setBestaetigeLoesung(false); setEingabe(""); setRueck(null);
  };
  const abbrechen = () => { perfAendern((Pm) => rundeAbbrechen(Pm, nutzerId, r.id)); onZurueck(); };

  /* ---- Rundenende ---- */
  if (beendet) {
    const ok = r.status === "erfolgreich";
    return (
      <div className="perf-rein" style={{ position: "relative" }}>
        {ok && <Konfetti />}
        {badge && <BadgeOverlay badge={badge} onZu={() => setBadge(null)} />}
        <Karte hoch style={{ textAlign: "center", padding: "30px 20px" }}>
          <div className={ok ? "perf-erfolg" : ""} style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Ring wert={r.aufgaben.filter((s) => s.status === "geloest").length} max={RUNDE_GROESSE} groesse={116} dicke={11} farbe={ok ? L.gruen : L.orange} farbe2={ok ? L.tuerkis : L.violett}
              label={`${geloest} von ${RUNDE_GROESSE} Aufgaben gelöst`}>
              <span style={{ fontSize: 26, fontWeight: 800 }}>{geloest}/{RUNDE_GROESSE}</span>
            </Ring>
          </div>
          <Titel>{ok ? "Runde geschafft" : r.status === "abgebrochen" ? "Runde abgebrochen" : "Diese Runde zählt nicht als erfolgreich"}</Titel>
          <Absatz style={{ maxWidth: 520, margin: "0 auto 18px" }}>
            {ok && (st.badge
              ? `Du hast ${st.erfolgreicheRunden} Runden dieses Fehlertyps erfolgreich abgeschlossen. Dein Badge „${st.badgeName}“ ist freigeschaltet.`
              : `Das ist Runde ${st.erfolgreicheRunden} von ${RUNDEN_FUER_BADGE} für „${st.badgeName}“. Noch ${RUNDEN_FUER_BADGE - st.erfolgreicheRunden} Runde${RUNDEN_FUER_BADGE - st.erfolgreicheRunden === 1 ? "" : "n"}.`)}
            {r.status === "nicht_geschafft" && "Du hast bei mindestens einer Aufgabe die Lösung angesehen. Das ist völlig in Ordnung – lernen heißt auch nachschauen. Gezählt wird eine Runde aber nur, wenn du alle drei Aufgaben selbst löst."}
            {r.status === "abgebrochen" && "Abgebrochene Runden zählen nicht. Du kannst jederzeit eine neue starten."}
          </Absatz>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Knopf art={ok ? "orange" : "primaer"} onClick={() => onNaechste(r.typ)}>Nächste Runde</Knopf>
            <Knopf art="sekundaer" onClick={onZurueck}>Zur Auswahl</Knopf>
          </div>
          {ok && <p style={{ margin: "18px 0 0", fontSize: 12.5, color: L.still, lineHeight: 1.6 }}>Ein Badge zeigt eine erreichte Trainingsleistung. Er sagt nicht, dass der Fehler für immer verschwunden ist – deshalb schaut das Fehlerprofil weiter auf neue Aufgaben.</p>}
        </Karte>
      </div>
    );
  }

  const hinweise = Array.from({ length: slot.hilfe }, (_, i) => hilfeText(a, i + 1));
  const w = slot.status === "aufgedeckt" ? loesungsWeg(a) : weg;

  return (
    <div className="perf-rein">
      {badge && <BadgeOverlay badge={badge} onZu={() => setBadge(null)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div>
          <Kicker style={{ marginBottom: 4 }}>Runde {r.nr} · {FEHLERTYPEN_TAX[r.typ].name}</Kicker>
          <div role="group" aria-label="Fortschritt der Runde" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {r.aufgaben.map((s, i) => {
              const farbe = s.status === "geloest" ? L.gruen : s.status === "aufgedeckt" ? L.orange : L.blau;
              return (
                <button key={i} type="button" onClick={() => waehle(i)} aria-label={`Aufgabe ${i + 1}: ${s.status === "geloest" ? "gelöst" : s.status === "aufgedeckt" ? "Lösung angesehen" : "offen"}`} aria-current={i === pos ? "step" : undefined}
                  style={{ width: 38, height: 38, borderRadius: 999, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 800, color: s.status === "offen" ? (i === pos ? L.bg : L.ged) : L.bg,
                    background: s.status === "offen" ? (i === pos ? L.tuerkis : "rgba(255,255,255,0.07)") : farbe, border: `2px solid ${i === pos ? L.tuerkis : "transparent"}` }}>
                  {s.status === "geloest" ? "✓" : i + 1}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Ring wert={st.erfolgreicheRunden} max={RUNDEN_FUER_BADGE} groesse={62} dicke={7} farbe={L.orange} farbe2={L.violett} label={`${st.erfolgreicheRunden} von ${RUNDEN_FUER_BADGE} Runden bis zum Badge`}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>{st.erfolgreicheRunden}/{RUNDEN_FUER_BADGE}</span>
          </Ring>
          <span style={{ fontSize: 12, color: L.ged, lineHeight: 1.4, maxWidth: 90 }}>Runden bis zum Badge</span>
        </div>
      </div>

      <Karte hoch style={{ padding: "22px 20px" }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: L.violett }}>Aufgabe {pos + 1} von {RUNDE_GROESSE} · Schwierigkeit {"●".repeat(a.schwierigkeit)}{"○".repeat(3 - a.schwierigkeit)}</p>
        <p style={{ margin: "0 0 12px", fontSize: 15, color: L.ged, lineHeight: 1.6 }}><MText s={a.auftrag} /></p>
        <div style={{ padding: "16px 14px", borderRadius: 14, background: L.bg, border: `1px solid ${L.linie}`, overflowX: "auto", marginBottom: 16 }}>
          <Formel t={a.start} gross />
        </div>

        {slot.status === "offen" && (
          <>
            <Formeleingabe wert={eingabe} setWert={(t) => { setEingabe(t); if (rueck) setRueck(null); }} onEnter={pruefen}
              label={a.art === "gleichung" ? "Deine umgeformte Gleichung" : a.art === "ableitung" ? "Deine Ableitung f′(x)" : "Dein korrigierter Term"} placeholder={a.art === "gleichung" ? "z. B. 2x = 6" : "z. B. 2x + 3"} />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <Knopf onClick={pruefen} disabled={!eingabe.trim()}>Prüfen</Knopf>
              <Knopf art="geist" onClick={hilfe} disabled={slot.hilfe >= MAX_HILFE}>Hinweis {slot.hilfe < MAX_HILFE ? `(${slot.hilfe}/${MAX_HILFE})` : "(alle gezeigt)"}</Knopf>
              {!bestaetigeLoesung
                ? <Knopf art="sekundaer" onClick={() => setBestaetigeLoesung(true)}>Lösung ansehen</Knopf>
                : <Knopf art="gefahr" onClick={loesung}>Ja, Lösung zeigen (zählt nicht)</Knopf>}
            </div>
            {bestaetigeLoesung && <p role="status" style={{ margin: "10px 0 0", fontSize: 13, color: L.orange }}>Wenn du die Lösung ansiehst, wird diese Aufgabe ohne Erfolg beendet und die Runde zählt nicht fürs Badge.</p>}
          </>
        )}

        {rueck && slot.status === "offen" && (
          <div role="status" className="perf-rein" style={{ marginTop: 16, padding: "14px 16px", borderRadius: 14, lineHeight: 1.65, fontSize: 14.5,
            background: rueck.art === "richtig" ? `${L.gruen}1f` : rueck.zaehlt ? `${L.orange}1a` : "rgba(255,255,255,0.06)", border: `1px solid ${rueck.art === "richtig" ? L.gruen : rueck.zaehlt ? L.orange : L.linieStark}66`, color: L.text }}>
            <b style={{ color: rueck.art === "richtig" ? L.gruen : rueck.zaehlt ? L.orange : L.ged }}>
              {rueck.art === "richtig" ? "Richtig. " : rueck.art === "typisch" ? "Noch nicht – hier steckt ein typischer Fehler. " : rueck.art === "form" ? "Fast. " : rueck.zaehlt ? "Noch nicht. " : "Das zählt noch nicht als Versuch. "}
            </b>
            <MText s={rueck.text} />
          </div>
        )}

        {hinweise.length > 0 && slot.status === "offen" && (
          <div style={{ marginTop: 14 }}>
            {hinweise.map((h, i) => (
              <p key={i} className="perf-rein" style={{ margin: "0 0 8px", padding: "10px 14px", borderRadius: 12, background: `${L.violett}1c`, border: `1px solid ${L.violett}55`, fontSize: 14, lineHeight: 1.65, color: L.text }}>
                <b style={{ color: L.violett }}>Hinweis {i + 1}: </b><MText s={h} />
              </p>
            ))}
          </div>
        )}

        {slot.status === "geloest" && (
          <div role="status" className="perf-erfolg" style={{ marginTop: 6, padding: "14px 16px", borderRadius: 14, background: `${L.gruen}1f`, border: `1px solid ${L.gruen}66` }}>
            <b style={{ color: L.gruen }}>Gelöst{slot.hilfe === 0 ? " – ganz ohne Hilfe." : "."}</b>
            <span style={{ color: L.ged, fontSize: 14 }}> {slot.versuche.length} Versuch{slot.versuche.length === 1 ? "" : "e"}{slot.hilfe ? `, ${slot.hilfe} Hinweis${slot.hilfe === 1 ? "" : "e"}` : ""}.</span>
            {offenPos >= 0 && <div style={{ marginTop: 10 }}><Knopf klein onClick={() => waehle(offenPos)}>Nächste Aufgabe</Knopf></div>}
          </div>
        )}

        {w && (
          <div className="perf-rein" style={{ marginTop: 16, padding: "16px", borderRadius: 14, background: "rgba(255,255,255,0.05)", border: `1px solid ${L.linieStark}` }}>
            <Kicker farbe={L.orange}>Lösungsweg</Kicker>
            {w.zeilen.map((z, i) => <div key={i} style={{ margin: "6px 0", overflowX: "auto" }}><Formel roh t={z.replace(/^\$|\$$/g, "")} /></div>)}
            <p style={{ margin: "12px 0 6px", fontSize: 14, color: L.ged, lineHeight: 1.65 }}><b style={{ color: L.text }}>Typischer Fehler: </b><MText s={w.erklaerung} /></p>
            <p style={{ margin: 0, fontSize: 14, color: L.ged, lineHeight: 1.65 }}><b style={{ color: L.text }}>Regel: </b><MText s={w.regel} /></p>
            {offenPos >= 0 && <div style={{ marginTop: 12 }}><Knopf klein onClick={() => waehle(offenPos)}>Weiter</Knopf></div>}
          </div>
        )}
      </Karte>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, flexWrap: "wrap", gap: 8 }}>
        <Knopf art="geist" klein onClick={onZurueck}>Pausieren (Runde bleibt gespeichert)</Knopf>
        <Knopf art="gefahr" klein onClick={abbrechen}>Runde abbrechen</Knopf>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Badge-Moment */
function BadgeOverlay({ badge, onZu }) {
  /* Portal: sonst bindet die Einblend-Animation des Elternelements „fixed“ an die Sektion */
  return createPortal(
    <div className="perf-lab" role="dialog" aria-modal="true" aria-label="Skill-Badge freigeschaltet" onClick={onZu}
      data-kein-i18n style={{ fontFamily: "Montserrat, system-ui, sans-serif", position: "fixed", inset: 0, zIndex: 80, background: "rgba(6,12,32,0.82)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: 420, width: "100%", textAlign: "center", background: L.karteHoch, border: `1px solid ${L.violett}88`, borderRadius: 26, padding: "34px 24px 26px" }}>
        <Konfetti />
        <div className="perf-erfolg perf-glanz" style={{ width: 120, height: 120, borderRadius: 999, margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center",
          background: `linear-gradient(135deg, ${L.violett} 0%, ${L.orange} 100%)`, fontSize: 56, fontWeight: 800, color: "#fff" }}>{badgeSymbol(badge.typ)}</div>
        <Kicker farbe={L.orange} style={{ textAlign: "center" }}>Skill-Badge freigeschaltet</Kicker>
        <Titel>{badge.name}</Titel>
        <Absatz>Du hast {RUNDEN_FUER_BADGE} Runden mit {badge.aufgaben} Aufgaben geschafft – {badge.ohneHilfe} davon ganz ohne Hinweis. Das Badge zeigt deine Trainingsleistung. Ob der Fehler im Alltag verschwindet, zeigen die nächsten echten Aufgaben.</Absatz>
        <Knopf art="orange" onClick={onZu}>Weiter</Knopf>
      </div>
    </div>, document.body);
}

/* ---------------------------------------------------------------- Badge-Übersicht */
export function BadgeUebersicht({ nutzerId }) {
  const { P } = usePerf();
  const badges = badgesVon(P, nutzerId);
  const typen = Object.keys(FEHLERTYPEN_TAX);
  const trainierbar = typen.filter((t) => FEHLERTYPEN_TAX[t].training);
  const bald = typen.filter((t) => !FEHLERTYPEN_TAX[t].training).slice(0, 6);
  return (
    <div className="perf-rein">
      <Kicker>Skill-Badges</Kicker>
      <Titel>Deine freigeschalteten Skills</Titel>
      <Absatz>Ein Badge dokumentiert eine erreichte Trainingsleistung: {RUNDEN_FUER_BADGE} erfolgreiche Runden mit je {RUNDE_GROESSE} selbst gelösten Aufgaben. Es ist kein Beweis, dass eine Schwäche dauerhaft beseitigt ist – spätere Fehler aktualisieren dein Profil weiterhin.</Absatz>
      <div className="perf-raster">
        {trainierbar.map((typ) => {
          const st = trainingsStand(P, nutzerId, typ);
          const b = badges.find((x) => x.typ === typ);
          return (
            <Karte key={typ} hoch={!!b} style={{ borderColor: b ? `${L.violett}88` : L.linie }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div className={b ? "perf-glanz" : ""} style={{ width: 84, height: 84, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 800,
                  background: b ? `linear-gradient(135deg, ${L.violett} 0%, ${L.orange} 100%)` : "rgba(255,255,255,0.06)", color: b ? "#fff" : L.still, border: b ? "none" : `2px dashed ${L.linieStark}` }}>
                  {b ? badgeSymbol(typ) : "🔒"}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: L.text }}>{b ? b.name : badgeName(typ)}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: L.ged, lineHeight: 1.5 }}>{b ? `Freigeschaltet am ${datum(b.zeit)}` : `${st.erfolgreicheRunden} von ${RUNDEN_FUER_BADGE} Runden`}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 14 }} aria-label={`${st.erfolgreicheRunden} von ${RUNDEN_FUER_BADGE} Runden geschafft`}>
                {Array.from({ length: RUNDEN_FUER_BADGE }, (_, i) => (
                  <span key={i} style={{ flex: 1, height: 8, borderRadius: 999, background: i < st.erfolgreicheRunden ? `linear-gradient(90deg, ${L.orange}, ${L.violett})` : "rgba(255,255,255,0.1)" }} />
                ))}
              </div>
              {b && (
                <div style={{ marginTop: 14, fontSize: 13, color: L.ged, lineHeight: 1.65 }}>
                  <b style={{ color: L.text }}>Lernhistorie:</b> {b.aufgaben} Aufgaben in {b.rundenIds.length} Runden, {b.versuche} Versuche, {b.hilfen} Hinweis{b.hilfen === 1 ? "" : "e"}, {b.ohneHilfe} Aufgaben ohne Hilfe.
                  {b.demo && <span style={{ color: L.orange }}> (Testdaten)</span>}
                </div>
              )}
              {!b && st.hatTraining && <div style={{ marginTop: 14 }}><Chip farbe={L.tuerkis}>Training im Tab „Training“</Chip></div>}
            </Karte>
          );
        })}
        {bald.map((typ) => (
          <Karte key={typ} style={{ opacity: 0.55, padding: 16 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 999, border: `2px dashed ${L.linieStark}`, display: "flex", alignItems: "center", justifyContent: "center", color: L.still }}>🔒</div>
              <div>
                <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: L.text }}>{badgeName(typ)}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: L.still }}>kommt, sobald geprüfte Aufgaben vorliegen</p>
              </div>
            </div>
          </Karte>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Historie */
export function Historie({ nutzerId }) {
  const { P } = usePerf();
  const liste = useMemo(() => rundenHistorie(P, nutzerId), [P, nutzerId, P.runden.length, P.protokoll.length]);
  return (
    <div className="perf-rein">
      <Kicker>Historie</Kicker>
      <Titel>Deine bisherigen Trainingsrunden</Titel>
      {!liste.length && <Absatz>Noch keine Runde gespielt. Starte im Tab „Training“ deine erste.</Absatz>}
      <div style={{ display: "grid", gap: 10 }}>
        {liste.map((h) => (
          <Karte key={h.id} style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: L.text }}>{h.name} · Runde {h.nr}{h.demo && <span style={{ color: L.orange, fontWeight: 600 }}> · Testdaten</span>}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12.5, color: L.still }}>{datum(h.zeit)}</p>
              </div>
              <Chip farbe={RUNDEN_STATUS_FARBE[h.status]}>{RUNDEN_STATUS_TEXT[h.status]}</Chip>
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 13.5, color: L.ged, lineHeight: 1.6 }}>
              {h.geloest} von {RUNDE_GROESSE} gelöst · {h.ohneHilfe} ohne Hilfe · {h.hilfen} Hinweis{h.hilfen === 1 ? "" : "e"} · {h.versuche} Versuche{h.aufgedeckt ? ` · ${h.aufgedeckt}× Lösung angesehen` : ""}
            </p>
          </Karte>
        ))}
      </div>
    </div>
  );
}
