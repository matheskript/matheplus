import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { merken } from "./func5.jsx";
import { GLEICHUNG_CSS, Zahlenfeld } from "./func14.jsx";
import { useKopfEinstellungen, AufgabenKarte } from "./kopfTraining.jsx";
import { ALLE_ITEMS, BLOECKE, ITEM_INFO, MODULE, offeneBloecke, aufgabeFuer, buche, bucheFehler, bucheVerstehen, fehlerName, haeufigeFehlerarten, itemText, RANG, setzeBest, status, wertung } from "./headNumbers.js";
import { L, karte, formatZahl, kopfAendern, useKopf, modulInfo, stufeInfo, STATUS_NAME, RICHTUNG_NAME, Kicker, Knopf, useZeitMesser, PAUSE_SCHWELLE_MS, gesprochen } from "./funcHeadNumbersBasis.jsx";

/* ======================================================================
   RUNDE – adaptive Aufgabenrunde
   Gleiche Optik wie der Schnellrechen-Baustein (func14): großes Zahlenfeld,
   Gleichungs-Layout, sofortige Rückmeldung. Zusätzlich: Auswahlaufgaben,
   Tipps (zählen als Hilfe), Wiederholung eines Fehlers in derselben Runde,
   Verbuchung je Zahlenbeziehung und eine Auswertung ohne Zeit-Rangliste.
   ====================================================================== */
const SR_NUR = { position: "absolute", width: 1, height: 1, margin: -1, padding: 0, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 };
const snapshot = (K) => Object.fromEntries(ALLE_ITEMS.map((k) => [k, status(K.items[k])]));

export function Runde({ aufgaben, modul, stufe, onNochmal, onZurueck, nochmalText, onStand = null }) {
  const K = useKopf();
  const [einst] = useKopfEinstellungen();
  const turbo = einst.turbo;
  const info = modulInfo(modul);
  const en = englisch();
  const mitTipp = stufe !== "schnell";
  const [queue, setQueue] = useState(aufgaben);
  const [idx, setIdx] = useState(0);
  const [eingabe, setEingabe] = useState("");
  const [gewaehlt, setGewaehlt] = useState(null);
  const [rueck, setRueck] = useState(null);
  const [tipp, setTipp] = useState(0);
  const [serie, setSerie] = useState(0);
  const [laengste, setLaengste] = useState(0);
  const [punkte, setPunkte] = useState(0);
  const [ergebnisse, setErgebnisse] = useState([]);
  const [abschluss, setAbschluss] = useState(null);
  const [fehlerHinweis, setFehlerHinweis] = useState(null);   // erkannte Fehlerart der letzten falschen Antwort
  const pauseJetzt = useZeitMesser();
  const aufgPause = useRef(0);
  const vorher = useRef(null);
  const vorherOffen = useRef(null);
  const start = useRef(Date.now());
  const aufgStart = useRef(Date.now());
  const timer = useRef(null);
  const weiterRef = useRef(null);
  if (vorher.current === null) vorher.current = snapshot(K);
  if (vorherOffen.current === null) vorherOffen.current = Object.fromEntries(MODULE.map((m) => [m, offeneBloecke(K, m)]));
  useEffect(() => { aufgStart.current = Date.now(); aufgPause.current = pauseJetzt(); }, [idx]);
  /* Stand nach außen (Vollbild-Kopf): Aufgabe, Anzahl, Serie */
  useEffect(() => { if (onStand) onStand({ nr: idx, gesamt: queue.length, serie, fertig: !!abschluss }); }, [idx, queue.length, serie, abschluss]);  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timer.current), []);

  const a = queue[idx];

  const beenden = (ergs, punkteGesamt) => {
    const erst = ergs.filter((e) => !e.retry);
    const richtig = erst.filter((e) => e.ok).length;
    const rundenPause = pauseJetzt();
    const sek = Math.round(Math.max(0, Date.now() - start.current - rundenPause) / 100) / 10;   // ohne Zeit bei verstecktem Tab
    const rundeUnterbrochen = rundenPause > PAUSE_SCHWELLE_MS;
    let neuerBest = false, bestVorher = null;
    if (stufe !== "verstehen") {
      kopfAendern((Kp) => {
        Kp.runden += 1; Kp.punkte += punkteGesamt;
        bestVorher = Kp.best[`${modul}:${stufe}`] || null;
        neuerBest = setzeBest(Kp, `${modul}:${stufe}`, { richtig, gesamt: erst.length, sek: stufe === "schnell" && !rundeUnterbrochen ? sek : null });
      });
    }
    setAbschluss({ richtig, gesamt: erst.length, sek, neuerBest: neuerBest && (!bestVorher || richtig / erst.length > bestVorher.richtig / bestVorher.gesamt), bestVorher });
  };

  const weiter = () => {
    clearTimeout(timer.current);
    if (idx + 1 >= queue.length) { beenden(ergebnisse, punkte); return; }
    setIdx(idx + 1); setEingabe(""); setGewaehlt(null); setRueck(null); setTipp(0); setFehlerHinweis(null);
  };
  weiterRef.current = weiter;

  const pruefen = (antwort) => {
    if (rueck || !a) return;
    const pausiert = pauseJetzt() - aufgPause.current;
    const unterbrochen = pausiert > PAUSE_SCHWELLE_MS;      // Tab war versteckt: kein Tempo-Beleg
    const sek = Math.round(Math.max(0, Date.now() - aufgStart.current - pausiert) / 100) / 10;
    const verstehen = a.modus === "verstehen";
    const w = verstehen ? { ok: String(Number(antwort)) === String(a.loesung) && String(antwort).trim() !== "", items: [] } : wertung(a, antwort);
    const hilfe = a.retry ? 3 : tipp;
    const gewinn = w.ok ? (hilfe === 0 ? 10 : 5) : 0;
    kopfAendern((Kp) => {
      if (verstehen) bucheVerstehen(Kp, a.verstehensId, w.ok);
      else {
        for (const key of w.items) buche(Kp, key, w.ok, { sek: a.art === "zahl" && !unterbrochen ? sek : null, hilfe: w.ok ? hilfe : 0, modus: a.modus });
        if (w.fehler) bucheFehler(Kp, w.fehler.art, a.key, antwort);
      }
    });
    try { merken({ gruppe: `Head & Numbers · ${info.gruppe}`, richtig: w.ok, sekunden: w.ok && hilfe === 0 && a.art === "zahl" && !unterbrochen ? sek : undefined, fehlerart: w.ok ? null : `kopf_${w.fehler ? w.fehler.art : "rechnen"}` }); } catch (e) { /* optional */ }
    const neueErgs = [...ergebnisse, { a, ok: w.ok, retry: !!a.retry, antwort, fehler: w.fehler || null }];
    setErgebnisse(neueErgs);
    setPunkte(punkte + gewinn);
    setRueck(w.ok ? "richtig" : "falsch");
    setFehlerHinweis(w.ok ? null : w.fehler || null);
    if (a.art === "wahl") setGewaehlt(String(antwort));
    if (w.ok) {
      const s = serie + 1; setSerie(s); setLaengste(Math.max(laengste, s));
      timer.current = setTimeout(() => {
        // Tempo: Weitergehen sofort, sonst kurz Zeit für das Häkchen
        if (idx + 1 >= queue.length) beenden(neueErgs, punkte + gewinn); else weiterRef.current();
      }, turbo ? 250 : stufe === "schnell" ? 450 : 650);
    } else {
      setSerie(0);
      if (!a.retry && !verstehen) {
        const neu = { ...aufgabeFuer(a.key, a.format, { en }), retry: true };
        setQueue((q) => { const kopie = [...q]; kopie.splice(Math.min(idx + 3, kopie.length), 0, neu); return kopie; });
      }
    }
  };

  /* Turbo: Steht die richtige Zahl im Feld, zählt sie sofort – ohne OK */
  useEffect(() => {
    if (turbo && !rueck && a && a.art === "zahl" && eingabe !== "" && String(Number(eingabe)) === String(a.loesung)) pruefen(eingabe);
  }, [eingabe]);  // eslint-disable-line react-hooks/exhaustive-deps

  /* Tastatur: Ziffern, Rücktaste, Enter; 1–4 wählen bei Auswahlaufgaben */
  useEffect(() => {
    if (abschluss) return undefined;
    const taste = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (rueck === "falsch" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); weiterRef.current(); return; }
      if (rueck || !a) return;
      if (a.art === "zahl") {
        if (/^[0-9]$/.test(e.key)) setEingabe((v) => (v.length >= 5 ? v : v + e.key));
        else if (e.key === "Backspace") setEingabe((v) => v.slice(0, -1));
        else if (e.key === "Enter" && eingabe !== "") pruefen(eingabe);
      } else if (/^[1-9]$/.test(e.key) && a.optionen[Number(e.key) - 1]) pruefen(a.optionen[Number(e.key) - 1].wert);
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  });

  /* ---- Auswertung ---- */
  if (abschluss) {
    const erst = ergebnisse.filter((e) => !e.retry);
    const falsche = erst.filter((e) => !e.ok);
    const nachher = snapshot(K);
    const namen = STATUS_NAME();
    const aenderungen = ALLE_ITEMS.filter((k) => nachher[k] !== vorher.current[k]).map((k) => ({ k, von: vorher.current[k], nach: nachher[k], besser: RANG[nachher[k]] > RANG[vorher.current[k]] }))
      .sort((x, y) => Number(y.besser) - Number(x.besser)).slice(0, 8);
    const beruehrt = new Set(ergebnisse.map((e) => e.a && e.a.key).filter(Boolean));
    const nurGesehen = [...beruehrt].filter((k) => nachher[k] === "gesehen").length;
    const neuePakete = MODULE.flatMap((m) => offeneBloecke(K, m).filter((i) => !vorherOffen.current[m].includes(i)).map((i) => ({ m, i })));
    const quote = abschluss.gesamt ? abschluss.richtig / abschluss.gesamt : 0;
    const lob = quote === 1 ? L("Fehlerfrei – stark!", "No mistakes – well done!") : quote >= 0.8 ? L("Fast alles sitzt.", "Almost everything sticks.")
      : quote >= 0.5 ? L("Eine gute Basis. Das Unsichere kommt wieder – so wird es sicher.", "A good base. What is shaky will come back – that is how it becomes secure.")
        : L("Genau dafür ist das Training da. Das Unsichere kommt gleich wieder dran.", "That is exactly what practice is for. What is shaky will come back soon.");
    const best = K.best[`${modul}:${stufe}`];
    return (
      <div style={{ ...karte, padding: 22 }} role="status">
        <Kicker>{L("Runde geschafft", "Round complete")} · {stufeInfo(stufe).name}</Kicker>
        <p style={{ fontSize: 46, fontWeight: 800, color: C.tinte, lineHeight: 1.05 }}>
          {abschluss.richtig} <span style={{ fontSize: 22, color: C.grau, fontWeight: 600 }}>{L("von", "of")} {abschluss.gesamt}</span>
        </p>
        <p style={{ fontSize: 15, color: C.grau, marginTop: 8 }}>
          {L("beim ersten Versuch richtig", "right on the first try")}{stufe === "schnell" ? ` · ${formatZahl(abschluss.sek)} s` : ""} · <b style={{ color: C.tinte }}>+{punkte}</b> {L("Punkte", "points")}
        </p>
        <p style={{ fontSize: 15.5, fontWeight: 600, color: quote === 1 ? C.smaragd : C.tinte, marginTop: 12 }}>{lob}</p>
        {abschluss.neuerBest && <p style={{ fontSize: 14, fontWeight: 700, color: C.gruenDunkel, marginTop: 6 }}>{L("Neue persönliche Bestleistung in dieser Stufe.", "New personal best at this level.")}</p>}
        {!abschluss.neuerBest && best && <p style={{ fontSize: 13, color: C.grau, marginTop: 6 }}>{L("Deine beste Runde hier", "Your best round here")}: {best.richtig}/{best.gesamt}</p>}
        {laengste >= 3 && <p style={{ fontSize: 13, color: C.grau, marginTop: 6 }}>{L("Längste Serie in dieser Runde", "Longest streak this round")}: {laengste}. {L("Eine Serie zeigt den Tag – gesichert ist etwas erst, wenn es an mehreren Tagen sitzt.", "A streak shows today – something is only secured once it sticks across several days.")}</p>}

        {neuePakete.length > 0 && (
          <div style={{ marginTop: 16, background: "#EAF6EF", border: `1.5px solid ${C.smaragd}`, borderRadius: 14, padding: "12px 14px" }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.gruenDunkel, marginBottom: 6 }}>{neuePakete.length === 1 ? L("Neues Paket freigeschaltet", "New set unlocked") : L("Neue Pakete freigeschaltet", "New sets unlocked")}</p>
            {neuePakete.map(({ m, i }) => <p key={`${m}${i}`} style={{ fontSize: 14.5, color: C.tinte, marginBottom: 2 }}><b>{modulInfo(m).gruppe}</b> · {L(BLOECKE[m][i].de, BLOECKE[m][i].en)}</p>)}
          </div>
        )}
        {aenderungen.length > 0 && (
          <div style={{ marginTop: 16, background: C.sand, borderRadius: 14, padding: "12px 14px" }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, marginBottom: 8 }}>{L("Dein Lernstand hat sich verändert", "Your progress changed")}</p>
            {aenderungen.map(({ k, von, nach, besser }) => (
              <p key={k} style={{ fontSize: 14.5, color: C.tinte, marginBottom: 4, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "baseline" }}>
                <b>{itemText(k)}</b><span style={{ color: C.hellgrau, fontSize: 12.5 }}>{RICHTUNG_NAME(ITEM_INFO.get(k).richtung)}</span>
                <span style={{ color: besser ? C.smaragd : C.signal, fontSize: 13.5 }}>{namen[von]} → {namen[nach]}</span>
              </p>
            ))}
          </div>
        )}
        {nurGesehen > 0 && (
          <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginTop: 14 }}>
            {nurGesehen === 1
              ? L("1 Zahlenbeziehung ist erst gesehen.", "1 number fact is only seen so far.")
              : L(`${nurGesehen} Zahlenbeziehungen sind erst gesehen.`, `${nurGesehen} number facts are only seen so far.`)}{" "}
            {L("Zwei saubere, selbst gerechnete Antworten in Folge machen daraus „im Aufbau“, an mehreren Tagen wird es „sicher“. Ein einzelner Treffer, Raten oder ein Tipp reicht dafür nicht.", "Two clean answers in a row, worked out yourself, make it “building”; across several days it becomes “secure”. A single hit, a guess or a hint is not enough.")}
          </p>
        )}
        {falsche.length > 0 && (
          <div style={{ marginTop: 14, background: C.sand, borderRadius: 14, padding: "12px 14px" }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, marginBottom: 8 }}>{L("Noch einmal anschauen", "Take another look")}</p>
            {falsche.map((e, i) => (
              <p key={i} style={{ fontSize: 14.5, color: C.tinte, marginBottom: 6 }}>
                {e.a.erklaerung}
                {e.fehler && <span style={{ display: "block", fontSize: 13, color: C.grau, marginTop: 2 }}>{fehlerName(e.fehler.art, en)}: {e.fehler.text}</span>}
              </p>
            ))}
          </div>
        )}
        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          <Knopf onClick={onNochmal}>{nochmalText || L("Noch eine Runde", "Another round")}</Knopf>
          <Knopf haupt={false} onClick={onZurueck}>{L("Zurück zur Übersicht", "Back to overview")}</Knopf>
        </div>
      </div>
    );
  }

  if (!a) return null;
  const farbe = rueck === "richtig" ? C.smaragd : rueck === "falsch" ? C.signal : C.see;
  const hilfen = a.hilfen || [];
  const tippMoeglich = mitTipp && !rueck && tipp < hilfen.length && a.modus !== "verstehen";
  const zeigeFrage = a.frage && a.art === "zahl" ? a.frage : null;
  return (
    <div style={onStand ? { display: "flex", flexDirection: "column", flex: "1 0 auto" } : { ...karte, padding: 18 }}>
      {!onStand && <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, display: "flex", gap: 4 }} aria-hidden="true">
          {queue.map((q, i) => <span key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < idx ? C.see : i === idx ? C.flaggold : C.linie, opacity: q.retry && i > idx ? 0.6 : 1 }} />)}
        </div>
        <span style={{ fontSize: 12.5, color: C.grau, whiteSpace: "nowrap" }}>{idx + 1} / {queue.length}</span>
        {serie >= 3 && <span style={{ fontSize: 12.5, fontWeight: 700, color: C.gruenDunkel, whiteSpace: "nowrap" }}>{L("Serie", "Streak")} {serie}</span>}
      </div>}
      {a.retry && <p style={{ fontSize: 12.5, fontWeight: 700, color: C.gruenDunkel, marginBottom: 8 }}>{L("Noch einmal – diese Aufgabe war eben dran", "Once more – this one came up earlier")}</p>}
      <p role="status" aria-live="polite" style={SR_NUR}>
        {rueck === "richtig" ? L("Richtig.", "Correct.") : rueck === "falsch" ? "" : `${L("Aufgabe", "Problem")} ${idx + 1} ${L("von", "of")} ${queue.length}: ${a.frage ? a.frage + " " : ""}${gesprochen(a.text)}`}
      </p>
      {zeigeFrage && <p style={{ fontSize: 13.5, fontWeight: 600, color: C.grau, marginBottom: 8 }}>{zeigeFrage}</p>}

      {a.art === "zahl" ? (
        <>
          <style>{GLEICHUNG_CSS}</style>
          <div className="kr-gleichung" style={onStand ? { flex: "1 0 auto" } : undefined}>
            <AufgabenKarte style={onStand ? { flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center" } : { padding: "20px 18px" }}>
              <p style={{ color: C.weiss, fontSize: a.text.length > 9 ? "clamp(26px, 7.6vw, 46px)" : "clamp(38px, 11vw, 58px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, whiteSpace: "nowrap" }}>
                {a.text}{!a.ohneGleich && <> <span style={{ color: C.flaggold, fontWeight: 600 }}>=</span></>}
              </p>
            </AufgabenKarte>
            <div className="kr-eingabe" aria-live="polite" style={{ border: `2.5px solid ${farbe}`, borderRadius: 14, minHeight: 64, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap", padding: "6px 8px",
              background: rueck === "richtig" ? "#EEF8F2" : rueck === "falsch" ? "#FBEFEA" : C.weiss, transition: "all .15s" }}>
              <span style={{ fontSize: eingabe.length > 6 ? 28 : 34, fontWeight: 800, color: C.tinte, minWidth: 20 }}>{eingabe || <span style={{ color: C.hellgrau }}>?</span>}</span>
              {rueck === "richtig" && <span style={{ fontSize: 26, color: C.smaragd, fontWeight: 800 }}>✓</span>}
              {rueck === "falsch" && <span style={{ fontSize: 17, color: C.signal, fontWeight: 700 }}>{L("richtig", "correct")}: {a.loesung}</span>}
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 16, padding: "18px 18px", marginBottom: 12, textAlign: "center" }}>
            {a.frage && <p style={{ color: C.goldText, fontSize: 14.5, fontWeight: 600, lineHeight: 1.4, marginBottom: a.text && a.text !== "?" ? 8 : 0 }}>{a.frage}</p>}
            {a.text && a.text !== "?" && <p style={{ color: C.weiss, fontSize: "clamp(30px, 8.5vw, 42px)", fontWeight: 800, lineHeight: 1.1 }}>{a.text}</p>}
          </div>
          <div role="group" aria-label={L("Antworten", "Answers")} style={{ display: "grid", gridTemplateColumns: a.optionen.some((o) => o.text.length > 14) || a.optionen.length === 3 ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 10 }}>
            {a.optionen.map((o, i) => {
              const istRichtig = String(o.wert) === String(a.loesung), gewahl = gewaehlt === String(o.wert);
              const stil = rueck ? (istRichtig ? { border: `2.5px solid ${C.smaragd}`, background: "#EEF8F2" } : gewahl ? { border: `2.5px solid ${C.signal}`, background: "#FBEFEA" } : { border: `1.5px solid ${C.linie}`, background: C.weiss, opacity: 0.6 })
                : { border: `1.5px solid ${C.linie}`, background: C.weiss };
              return (
                <button key={o.wert} type="button" disabled={!!rueck} onClick={() => pruefen(o.wert)}
                  style={{ minHeight: 56, padding: "10px 14px", borderRadius: 14, fontFamily: "inherit", fontSize: 19, fontWeight: 700, color: C.tinte, cursor: rueck ? "default" : "pointer", ...stil }}>
                  <span style={{ color: C.hellgrau, fontSize: 12, fontWeight: 600, marginRight: 8 }}>{i + 1}</span>{o.text}
                </button>
              );
            })}
          </div>
        </>
      )}

      {tipp > 0 && !rueck && (
        <div style={{ background: "#FFF8DC", border: `1px solid ${C.flaggold}`, borderRadius: 12, padding: "10px 14px", marginBottom: 10 }}>
          {hilfen.slice(0, tipp).map((h, i) => <p key={i} style={{ fontSize: 14, color: C.tinte, lineHeight: 1.5, marginBottom: i < tipp - 1 ? 6 : 0 }}>{h}</p>)}
        </div>
      )}
      {rueck === "falsch" && (
        <div role="alert" style={{ background: "#FBEFEA", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.signal, marginBottom: 4 }}>{L("Noch nicht ganz – so passt es:", "Not quite – here is how it fits:")}</p>
          <p style={{ fontSize: 15, color: C.tinte, lineHeight: 1.5 }}>{a.erklaerung}</p>
          {fehlerHinweis && <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.5, marginTop: 6 }}><b>{fehlerName(fehlerHinweis.art, en)}.</b> {fehlerHinweis.text}</p>}
          {!a.retry && a.modus !== "verstehen" && <p style={{ fontSize: 12.5, color: C.grau, marginTop: 6 }}>{L("Die Aufgabe kommt gleich noch einmal.", "This one will come back shortly.")}</p>}
        </div>
      )}
      {rueck === "falsch" && <Knopf onClick={weiter} style={{ width: "100%", marginBottom: 6 }}>{L("Weiter", "Continue")}</Knopf>}
      {tippMoeglich && (
        <button type="button" onClick={() => setTipp(tipp + 1)}
          style={{ width: "100%", minHeight: 44, borderRadius: 12, border: `1.5px dashed ${C.silberDunkel}`, background: "transparent", color: C.see, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>
          {tipp === 0 ? L("Tipp anzeigen", "Show a hint") : L("Noch ein Tipp", "Another hint")}
        </button>
      )}
      {a.art === "zahl" && (
        <Zahlenfeld gesperrt={!!rueck} turbo={turbo} labelLoeschen={L("Letzte Ziffer löschen", "Delete last digit")} labelOk={L("Antwort prüfen", "Check answer")}
          onZiffer={(z) => setEingabe((v) => (v.length >= 5 ? v : v + z))}
          onLoeschen={() => setEingabe((v) => v.slice(0, -1))}
          onOk={() => { if (eingabe !== "") pruefen(eingabe); }} />
      )}
      <p style={{ fontSize: 12, color: C.hellgrau, textAlign: "center", marginTop: 10, flex: "none" }}>
        {turbo ? L("Turbo: Die richtige Zahl zählt sofort.", "Turbo: the right number counts at once.") : stufe === "schnell" ? L("Erst richtig, dann schnell.", "Correct first, then fast.") : L("Du brauchst kein Tempo – genau und sicher zählt.", "No rush – accuracy and certainty count.")}
      </p>
    </div>
  );
}

