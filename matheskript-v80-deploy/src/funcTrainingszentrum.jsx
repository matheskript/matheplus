/* ======================================================================
   TRAININGSZENTRUM – ein Ort für alles, was du selbst rechnest (/trainingszentrum)
   Kopf, dann das Untermenü (Heute · Programme · Werkzeuge · Prüfung), darunter
   Karten in EINER Gestaltung. Jede Karte startet eine Vollbild-Session
   (funcTrainingsSession.jsx) oder führt zu einer Seite der App.
   Daten und Programme: trainingszentrum.js. Keine base-Datei importiert
   diese Datei.
   ====================================================================== */
import React, { useEffect, useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { useStartStufe } from "./func2.jsx";
import { useTraining } from "./funcTraining.jsx";
import { TrainingsSession } from "./funcTrainingsSession.jsx";
import { FEHLERTYPEN, THEMEN, generatorenFuerFehler, neueAufgabe, warmupAuswahl, wiederkehrende } from "./trainingDaten.js";
import { EXTRA, PROGRAMME, REITER, programmeFuer, sessionAusAufgaben, sessionAusProgramm, sessionAusWerkzeug, sessionVon, trainierBereiche, zuletztLesen } from "./trainingszentrum.js";

const REITER_SPEICHER = "matheplus-tz-reiter";
const STUFEN = [["alle", "Alle"], ["mittel", "Mittelstufe"], ["ober", "Oberstufe"]];

const STIL = `
.tz-kopf { background: linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%); color: ${C.weiss}; }
.tz-kopf-innen { max-width: 760px; margin: 0 auto; padding: 36px 24px 22px; }
.tz-menue { position: sticky; top: var(--kopf-h, 56px); z-index: 40; background: ${C.sand}; padding: 10px 16px 8px; }
.tz-reiter { max-width: 728px; margin: 0 auto; position: relative; display: grid; grid-template-columns: repeat(4, 1fr); background: ${C.seeTief}; border-radius: 999px; padding: 4px;
  box-shadow: 0 10px 28px rgba(14,30,74,.22); }
.tz-reiter::before { content: ""; position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(25% - 2px); border-radius: 999px;
  background: linear-gradient(135deg, #F8D23A 0%, ${C.flaggold} 55%, #D9A600 100%); box-shadow: 0 4px 12px rgba(237,187,0,.4);
  transform: translateX(calc(var(--i, 0) * 100%)); transition: transform .3s cubic-bezier(.2,.7,.3,1); }
.tz-reiter button { position: relative; z-index: 1; height: 44px; border: none; background: transparent; border-radius: 999px; font-family: inherit; font-size: 13px; font-weight: 700;
  color: ${C.silber}; cursor: pointer; padding: 0 4px; transition: color .2s; white-space: nowrap; }
.tz-reiter button[aria-selected="true"] { color: ${C.seeTief}; }
.tz-reiter button:focus-visible { outline: 3px solid ${C.weiss}; outline-offset: -3px; }
.tz-inhalt { max-width: 760px; margin: 0 auto; padding: 8px 16px 64px; }
.tz-zeile { font-size: 13.5px; color: ${C.grau}; line-height: 1.6; margin: 6px 0 14px; }
.tz-chips { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 10px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.tz-chips::-webkit-scrollbar { display: none; }
.tz-chip { flex: 0 0 auto; height: 38px; padding: 0 14px; border-radius: 999px; border: 1.5px solid ${C.linie}; background: ${C.weiss}; color: ${C.see}; font-family: inherit; font-size: 13.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.tz-chip[aria-pressed="true"] { background: ${C.see}; border-color: ${C.see}; color: ${C.weiss}; }
.tz-chip small { font-weight: 600; opacity: .7; }
.tz-raster { display: grid; gap: 12px; grid-template-columns: 1fr; }
@media (min-width: 600px) { .tz-raster { grid-template-columns: 1fr 1fr; } }
@media (min-width: 420px) { .tz-reiter button { font-size: 14px; } }
@media (max-width: 374px) { .tz-reiter button { font-size: 12px; letter-spacing: -.01em; } }
.tz-karte { text-align: left; width: 100%; background: ${C.weiss}; border: 1px solid ${C.linie}; border-radius: 18px; padding: 14px 14px 14px; box-shadow: 0 2px 16px rgba(15,26,51,0.06);
  display: grid; grid-template-columns: 52px 1fr; gap: 12px; align-items: start; cursor: pointer; font-family: inherit; color: ${C.tinte}; transition: transform .16s, box-shadow .16s, border-color .16s; }
.tz-karte:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(15,26,51,0.12); border-color: rgba(237,187,0,.6); }
.tz-karte:active { transform: scale(.99); }
.tz-karte:focus-visible { outline: 3px solid ${C.flaggold}; outline-offset: 2px; }
.tz-karte.gross { grid-template-columns: 1fr; background: linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%); color: ${C.weiss}; border: none; box-shadow: 0 12px 32px rgba(14,30,74,.28); }
.tz-zeichen { width: 52px; height: 52px; border-radius: 14px; background: ${C.seeTief}; color: ${C.flaggold}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 17px; letter-spacing: -.02em; flex-shrink: 0; }
.tz-zeichen.hell { background: rgba(255,255,255,.12); }
.tz-titel { font-size: 16px; font-weight: 800; line-height: 1.2; letter-spacing: -.01em; margin: 2px 0 3px; }
.tz-text { font-size: 13.5px; line-height: 1.5; color: ${C.grau}; margin: 0; }
.tz-karte.gross .tz-text { color: #C9D6EE; }
.tz-pillen { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; align-items: center; }
.tz-pille { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${C.gruenDunkel}; background: rgba(237,187,0,.14); border-radius: 999px; padding: 4px 9px; }
.tz-pille.blau { color: ${C.see}; background: ${C.himmel}; }
.tz-karte.gross .tz-pille { color: ${C.flaggold}; background: rgba(255,255,255,.1); }
.tz-start { margin-left: auto; font-size: 13px; font-weight: 800; color: ${C.see}; display: inline-flex; align-items: center; gap: 4px; }
.tz-karte.gross .tz-start { color: ${C.flaggold}; }
.tz-ablauf { display: flex; gap: 4px; margin-top: 10px; align-items: center; }
.tz-schritt { height: 24px; min-width: 24px; padding: 0 7px; border-radius: 8px; background: ${C.himmel}; color: ${C.see}; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; }
.tz-schritt.film { background: #FFF2C2; color: ${C.gruenDunkel}; }
.tz-schritt.werkzeug { background: ${C.seeTief}; color: ${C.flaggold}; }
.tz-schritt.auswertung { background: #E3F4EA; color: ${C.smaragd}; }
.tz-abschnitt { font-size: 11.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: ${C.gruenDunkel}; margin: 22px 0 10px; }
.tz-abschnitt:first-child { margin-top: 10px; }
`;

const ABLAUF_ZEICHEN = { intro: "i", film: "▶", aufgaben: "✎", werkzeug: "⚙", auswertung: "✓" };
const ABLAUF_NAME = { intro: "Einstieg", film: "Film", aufgaben: "Aufgaben", werkzeug: "Werkzeug", auswertung: "Auswertung" };

function Ablauf({ seiten }) {
  return (
    <div className="tz-ablauf" aria-label={`Ablauf: ${seiten.map((s) => ABLAUF_NAME[s.art]).join(", ")}`}>
      {seiten.map((s, k) => <span key={k} className={`tz-schritt ${s.art}`} title={ABLAUF_NAME[s.art]}>{s.art === "aufgaben" ? `${ABLAUF_ZEICHEN.aufgaben} ${(s.gen || s.aufgaben || []).length}` : ABLAUF_ZEICHEN[s.art]}</span>)}
    </div>
  );
}

function Karte({ zeichen, titel, text, pillen = [], gross = false, ablauf = null, onClick, startText = "Vollbild starten", ziel = null }) {
  return (
    <button type="button" className={`tz-karte${gross ? " gross" : ""}`} onClick={onClick} data-tz-karte={titel}>
      {!gross && <span className="tz-zeichen" aria-hidden="true" style={String(zeichen).length > 4 ? { fontSize: 11.5, lineHeight: 1.1, textAlign: "center", padding: "0 3px" } : undefined}>{zeichen}</span>}
      <span style={{ minWidth: 0 }}>
        {gross && <span className="tz-zeichen hell" aria-hidden="true" style={{ marginBottom: 12 }}>{zeichen}</span>}
        <span className="tz-titel" style={{ display: "block" }}>{titel}</span>
        <span className="tz-text" style={{ display: "block" }}>{text}</span>
        {ablauf && <Ablauf seiten={ablauf} />}
        <span className="tz-pillen">
          {pillen.map((p, k) => <span key={k} className={`tz-pille${k > 0 ? " blau" : ""}`}>{p}</span>)}
          <span className="tz-start">{ziel ? "Öffnen" : startText}<span aria-hidden="true">›</span></span>
        </span>
      </span>
    </button>
  );
}

/* ---------- Heute ---------- */
function Heute({ T, starten, gehe, zuletzt }) {
  const wk = wiederkehrende(T);
  const zusammensetzung = useMemo(() => {
    const z = ["Grundlagen zum Warmwerden"];
    if (T.zuletzt && THEMEN[T.zuletzt]) z.push(`dein letztes Thema: ${THEMEN[T.zuletzt].name}`);
    if (wk[0]) z.push(`ein Fehlertyp, der öfter vorkam: ${FEHLERTYPEN[wk[0].id].name}`);
    return z.join(" · ");
  }, [T, wk]);
  const warmup = () => starten(sessionAusAufgaben("warmup", "5 Minuten Mathe", warmupAuswahl(T, 5).map((g) => neueAufgabe(g.id)), "Heute"), "warmup");
  const fehler = (id) => {
    const gens = generatorenFuerFehler(id);
    if (!gens.length) return;
    const auf = [];
    for (let k = 0; k < 6; k++) {
      const g = gens[k % gens.length];
      let a = null;
      for (let v = 0; v < 40; v++) { a = neueAufgabe(g.id); if (a.fehler.some((f) => f.typ === id)) break; }
      auf.push(a);
    }
    starten(sessionAusAufgaben(`fehler-${id}`, `Fehler üben: ${FEHLERTYPEN[id].name}`, auf, "Heute"), "fehlertraining");
  };
  const weiter = zuletzt && !zuletzt.fertig ? sessionVon(zuletzt.kennung) : null;
  return (
    <>
      {weiter && (
        <>
          <p className="tz-abschnitt">Weitermachen</p>
          <Karte zeichen="↻" titel={weiter.titel} text={`Seite ${(zuletzt.seite || 0) + 1} von ${weiter.seiten.length} – da, wo du aufgehört hast.`} pillen={[weiter.kicker]}
            onClick={() => starten(weiter, "trainingszentrum", zuletzt.seite || 0)} startText="Fortsetzen" />
        </>
      )}
      <p className="tz-abschnitt">Kurz und passend</p>
      <div className="tz-raster">
        <Karte gross zeichen="5′" titel="5 Minuten Mathe" text={`Fünf kurze Aufgaben: ${zusammensetzung}. Kein Zwang, keine Serie.`} pillen={["Heute", "≈ 5 Min"]} onClick={warmup} />
        {wk.length > 0 ? wk.slice(0, 3).map((w) => (
          <Karte key={w.id} zeichen="!" titel={`Fehler üben: ${FEHLERTYPEN[w.id].name}`} text={FEHLERTYPEN[w.id].tipp || "Sechs neue Aufgaben, in denen genau dieser Fehler lauert."} pillen={["Meine Fehler", "6 Aufgaben"]} onClick={() => fehler(w.id)} />
        )) : (
          <Karte zeichen="!" titel="Meine Fehler üben" text="Noch kein Muster erkannt. Ein Fehler zählt erst, wenn er dreimal an zwei Tagen vorkommt – rechne ein paar Runden, dann erscheint er hier." pillen={["Meine Fehler"]} onClick={warmup} startText="Erst warmwerden" />
        )}
      </div>
      <p className="tz-abschnitt">Dein Plan</p>
      <div className="tz-raster">
        <Karte zeichen="Tag" titel="Mein Mathe-Training" text="Tagesplan, deine Themen, Wiederholungen nach Ebbinghaus – an einem Ort." pillen={["Seite"]} ziel onClick={() => gehe({ ansicht: "meintraining" })} />
        <Karte zeichen="1" titel="Eine Sache trainieren" text="Genau ein Buchkapitel oder Unterthema: fünf Aufgaben, Hinweise, Lösungsweg, Auswertung." pillen={["Seite"]} ziel onClick={() => gehe({ ansicht: "trainieren" })} />
      </div>
    </>
  );
}

/* ---------- Programme ---------- */
function Programme({ stufe, starten }) {
  const liste = programmeFuer(stufe);
  return (
    <>
      <p className="tz-zeile">Ein Programm ist eine Session mit festem Ablauf: Film, Aufgaben, Werkzeug, Auswertung – jede Seite im Vollbild, von Seite zu Seite.</p>
      <div className="tz-raster">
        {liste.map((p) => (
          <Karte key={p.id} zeichen={p.zeichen} titel={p.titel} text={p.zeile} ablauf={p.seiten} pillen={["Programm", `≈ ${p.dauer} Min`]} onClick={() => starten(sessionAusProgramm(p.id), "trainingszentrum")} />
        ))}
        {liste.length < PROGRAMME.length && <p className="tz-text" style={{ gridColumn: "1 / -1" }}>{PROGRAMME.length - liste.length} weitere Programme bei „Alle“ Stufen.</p>}
      </div>
    </>
  );
}

/* ---------- Werkzeuge ---------- */
function Werkzeuge({ stufe, starten }) {
  const bereiche = useMemo(() => trainierBereiche(stufe), [stufe]);
  const [bereich, setBereich] = useState("alle");
  useEffect(() => { if (bereich !== "alle" && !bereiche.some((b) => b.id === bereich)) setBereich("alle"); }, [bereiche, bereich]);
  const gezeigt = bereich === "alle" ? bereiche : bereiche.filter((b) => b.id === bereich);
  const gesamt = bereiche.reduce((s, b) => s + b.werkzeuge.length, 0);
  return (
    <>
      <div className="tz-chips" role="group" aria-label="Bereich">
        <button type="button" className="tz-chip" aria-pressed={bereich === "alle"} onClick={() => setBereich("alle")}>Alle <small>{gesamt}</small></button>
        {bereiche.map((b) => <button key={b.id} type="button" className="tz-chip" aria-pressed={bereich === b.id} onClick={() => setBereich(b.id)}>{b.titel} <small>{b.werkzeuge.length}</small></button>)}
      </div>
      {gezeigt.map((b) => (
        <React.Fragment key={b.id}>
          <p className="tz-abschnitt">{b.titel}</p>
          <div className="tz-raster">
            {b.werkzeuge.map((w) => (
              <Karte key={w.id} zeichen={w.zeichen} titel={w.name} text={w.zeile} pillen={["Trainieren", w.stufe === "ober" ? "Oberstufe" : w.stufe === "mittel" ? "Mittelstufe" : w.stufe === "unter" ? "Unterstufe" : "Alle Stufen"]}
                onClick={() => starten(sessionAusWerkzeug(w.id), "trainingszentrum")} />
            ))}
          </div>
        </React.Fragment>
      ))}
    </>
  );
}

/* ---------- Prüfung ---------- */
function Pruefung({ starten, gehe }) {
  return (
    <>
      <p className="tz-zeile">Wie am Tag davor: ohne Hilfen, mit Uhr und Punkten. Rückmeldung erst nach der Abgabe.</p>
      <div className="tz-raster">
        {Object.entries(EXTRA).map(([id, e]) => (
          <Karte key={id} zeichen={e.zeichen} titel={e.name} text={e.zeile} pillen={["Prüfung", `≈ ${e.dauer} Min`]} onClick={() => starten(sessionAusWerkzeug(id), "pruefung")} />
        ))}
        <Karte zeichen="⏳" titel="Prüfungsmodus" text="Themen, Dauer und Schwierigkeit wählen – mit Timer und automatischer Abgabe." pillen={["Seite"]} ziel onClick={() => gehe({ ansicht: "pruefung" })} />
        <Karte zeichen="Abi" titel="Probeabitur" text="Teil A und B mit Uhr und Notenpunkten." pillen={["Seite"]} ziel onClick={() => gehe({ ansicht: "abitur" })} />
        <Karte zeichen="↩" titel="Klausur nachbereiten" text="Verlorene Punkte erfassen und daraus einen Plan machen." pillen={["Seite"]} ziel onClick={() => gehe({ ansicht: "klausurnach" })} />
      </div>
    </>
  );
}

/* ---------- Seite ---------- */
export function Trainingszentrum({ gehe, start = null }) {
  const T = useTraining();
  const { stufe, setzen } = useStartStufe();
  const [reiter, setReiter] = useState(() => { try { const r = sessionStorage.getItem(REITER_SPEICHER); return REITER.some((x) => x.id === r) ? r : "heute"; } catch (e) { return "heute"; } });
  const [session, setSession] = useState(null);   // { session, quelle, seite }
  const [zuletzt, setZuletzt] = useState(() => zuletztLesen(localStorage));
  useEffect(() => { try { sessionStorage.setItem(REITER_SPEICHER, reiter); } catch (e) { /* privat */ } }, [reiter]);

  const starten = (s, quelle = "trainingszentrum", seite = 0) => { if (s) setSession({ session: s, quelle, seite, zeit: Date.now() }); };
  const schliessen = () => { setSession(null); setZuletzt(zuletztLesen(localStorage)); };

  /* Direktstart: gehe({ ansicht: "trainingszentrum", start: "programm:ableiten-zehn" }) */
  useEffect(() => { if (start) { const s = sessionVon(start); if (s) starten(s); } }, [start]);   // eslint-disable-line react-hooks/exhaustive-deps

  const iReiter = Math.max(0, REITER.findIndex((r) => r.id === reiter));
  const aktuell = REITER[iReiter];
  const zeigtStufe = reiter === "programme" || reiter === "werkzeuge";

  return (
    <div data-trainingszentrum>
      <style>{STIL}</style>
      <div className="tz-kopf">
        <div className="tz-kopf-innen held">
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".16em", color: C.flaggold, margin: "0 0 8px" }}>MYTHOS MATHE · TRAINING</p>
          <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: "clamp(28px, 8vw, 40px)", letterSpacing: "-0.03em", lineHeight: 1.02, margin: 0 }}>Trainingszentrum</h1>
          <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, margin: "16px 0 14px" }} />
          <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65, margin: 0 }}>Ein Ort für alles, was du selbst rechnest. Wählen, starten, Vollbild – und von Seite zu Seite.</p>
        </div>
      </div>

      <div className="tz-menue">
        <div className="tz-reiter" role="tablist" aria-label="Trainingsbereiche" style={{ "--i": iReiter }}>
          {REITER.map((r) => (
            <button key={r.id} type="button" role="tab" aria-selected={reiter === r.id} aria-controls={`tz-${r.id}`} onClick={() => setReiter(r.id)}>{r.name}</button>
          ))}
        </div>
      </div>

      <div className="tz-inhalt" id={`tz-${aktuell.id}`} role="tabpanel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
          <p className="tz-zeile" style={{ margin: 0 }}>{aktuell.zeile}</p>
          {zeigtStufe && (
            <div role="group" aria-label="Stufe" style={{ display: "inline-flex", gap: 4, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 999, padding: 3 }}>
              {STUFEN.map(([id, name]) => (
                <button key={id} type="button" aria-pressed={stufe === id || (id === "alle" && stufe === "unter")} onClick={() => setzen(id)}
                  style={{ height: 30, padding: "0 11px", borderRadius: 999, border: "none", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                    background: stufe === id || (id === "alle" && stufe === "unter") ? C.seeTief : "transparent", color: stufe === id || (id === "alle" && stufe === "unter") ? C.flaggold : C.grau }}>{name}</button>
              ))}
            </div>
          )}
        </div>
        <div style={{ height: 8 }} />
        {reiter === "heute" && <Heute T={T} starten={starten} gehe={gehe} zuletzt={zuletzt} />}
        {reiter === "programme" && <Programme stufe={stufe === "unter" ? "alle" : stufe} starten={starten} />}
        {reiter === "werkzeuge" && <Werkzeuge stufe={stufe} starten={starten} />}
        {reiter === "pruefung" && <Pruefung starten={starten} gehe={gehe} />}
      </div>

      {session && <TrainingsSession key={session.zeit} session={session.session} quelle={session.quelle} startSeite={session.seite} onSchliessen={schliessen} gehe={gehe} />}
    </div>
  );
}
