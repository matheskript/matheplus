import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { merken } from "./func5.jsx";
import { lernAendern, useLern } from "./func6.jsx";
import { normiere } from "./trainingDaten.js";
import { EinmaleinsSchachbrett, GLEICHUNG_CSS, PotenzSpalten, Zahlenfeld } from "./func14.jsx";
import {
  ALLE_ITEMS, BLOECKE, ITEMS, ITEM_INFO, MODULE, STUFEN, offeneBloecke,
  aufgabeFuer, baueRunde, buche, bucheVerstehen, empfehlung, gesamtUebersicht, itemText, markiereEntdeckt, modulUebersicht, musterAufgabe,
  normiereKopf, paarRunde, RANG, schwacheGrundlagen, setzeBest, status, stufenStand, mischen, wertung,
} from "./headNumbers.js";

/* ======================================================================
   HEAD & NUMBERS
   Kopfrechnen als eigene Grundfertigkeit: Einmaleins bis 100, Quadratzahlen
   bis 625, Kubikzahlen bis 1000 und ein gemischtes Training.

   Aufbau der Seite
     Start      Einleitung, die vier Bereiche mit Lernstand, heute Fälliges
     Bereich    Lernstand, Lernpfad in sechs Stufen, Blockauswahl,
                Spiele, offene Herausforderungen, Nachschlagen
     Runde      adaptive Aufgabenrunde (Zahlenfeld, Auswahl, Tipps)
     Spiele     Zuordnung und Zahlenmemory
     Verstehen  Muster und Zusammenhänge zum Entdecken

   Die Mathematik und der Lernstand stehen in headNumbers.js (getestet).
   Der Lernstand liegt im vorhandenen Lernstand unter training.kopf und wird
   mit dem vorhandenen Speicher (func6: lernAendern) gesichert. Übungen
   fließen zusätzlich über merken() in Protokoll, Fortschritt und Aktivität ein.
   Alle Texte sind zweisprachig: L(deutsch, englisch).
   ====================================================================== */

const L = (de, en) => (englisch() ? en : de);
const NAVY = C.seeTief;
const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
const MAL = "·";
const formatZahl = (n) => String(n).replace(".", ",");

/* ---------------------------------------------------------------- Speicher */
const kopfAendern = (fn) => lernAendern((X) => {
  X.training = normiere(X.training);
  X.training.kopf = normiereKopf(X.training.kopf);
  fn(X.training.kopf);
});
const useKopf = () => { const lern = useLern(); return normiereKopf(lern.training && lern.training.kopf); };

/* ---------------------------------------------------------------- Beschriftungen */
const modulInfo = (m) => ({
  einmaleins: { id: "einmaleins", zeichen: "7·8", titel: L("Das Einmaleins bis 100", "The times tables up to 100"), kurz: L("Alle Aufgaben a · b mit Faktoren von 1 bis 10", "All problems a · b with factors from 1 to 10"),
    gruppe: L("Einmaleins", "Times tables"), farbe: "#E07A00", einheit: L("Aufgaben", "problems") },
  quadrate: { id: "quadrate", zeichen: "12²", titel: L("Quadratzahlen bis 625", "Square numbers up to 625"), kurz: L("1² bis 25² kennen und wiedererkennen", "Know and recognise 1² to 25²"),
    gruppe: L("Quadratzahlen", "Square numbers"), farbe: "#6D28D9", einheit: L("Quadratzahlen", "square numbers") },
  kubik: { id: "kubik", zeichen: "5³", titel: L("Kubikzahlen bis 1000", "Cube numbers up to 1000"), kurz: L("1³ bis 10³ kennen und wiedererkennen", "Know and recognise 1³ to 10³"),
    gruppe: L("Kubikzahlen", "Cube numbers"), farbe: "#0F8A7E", einheit: L("Kubikzahlen", "cube numbers") },
  gemischt: { id: "gemischt", zeichen: "Mix", titel: L("Gemischtes Training", "Mixed training"), kurz: L("Einmaleins, Quadrat- und Kubikzahlen im Wechsel", "Times tables, squares and cubes in turn"),
    gruppe: L("Gemischt", "Mixed"), farbe: C.see, einheit: L("Zahlenbeziehungen", "number facts") },
}[m]);

const stufeInfo = (s) => ({
  verstehen: { nr: 1, name: L("Verstehen", "Understand"), text: L("Zusammenhänge und Muster entdecken – ganz ohne Druck.", "Discover connections and patterns – no pressure.") },
  unterstuetzt: { nr: 2, name: L("Mit Unterstützung", "With support"), text: L("Auswahl, Zuordnung und Tipps helfen dir beim Lösen.", "Choices, matching and hints help you solve.") },
  selbst: { nr: 3, name: L("Selbstständig", "On your own"), text: L("Du tippst die Ergebnisse selbst ein – in deinem Tempo.", "You type the results yourself – at your own pace.") },
  schnell: { nr: 4, name: L("Schnell abrufen", "Quick recall"), text: L("Das Ergebnis sofort wissen. Richtigkeit zählt zuerst.", "Know the result at once. Being correct comes first.") },
  wiederholen: { nr: 5, name: L("Wiederholen", "Review"), text: L("Unsicheres und Fälliges gezielt noch einmal üben.", "Practise what is shaky or due once more.") },
  challenge: { nr: 6, name: L("Challenge", "Challenge"), text: L("Gemischte Runde: zeigt, was wirklich sitzt.", "Mixed round: shows what really sticks.") },
}[s]);

const STATUS_NAME = () => ({ neu: L("neu", "new"), gesehen: L("gesehen", "seen"), unsicher: L("unsicher", "shaky"), aufbau: L("im Aufbau", "building"), sicher: L("sicher", "secure"), automatisiert: L("automatisiert", "automatic") });
const STATUS_FARBE = { neu: "#CDD5E4", gesehen: "#9DB4D6", unsicher: C.signal, aufbau: C.seeHell, sicher: C.smaragd, automatisiert: C.flaggold };
const RICHTUNG_NAME = (r) => (r === "v" ? L("vorwärts", "forwards") : L("rückwärts", "backwards"));

/* ---------------------------------------------------------------- kleine Bausteine */
const Kicker = ({ children }) => <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 6 }}>{children}</p>;
const H2 = ({ children, style }) => <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12, ...style }}>{children}</h2>;
const Absatz = ({ children, style }) => <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 14, ...style }}>{children}</p>;
const Zurueck = ({ onClick, children }) => (
  <button type="button" onClick={onClick}
    style={{ background: "none", border: "none", color: C.see, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: "10px 0", minHeight: 44 }}>
    ← {children}
  </button>
);
const Knopf = ({ onClick, children, haupt = true, style, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled}
    style={{ minHeight: 52, padding: "12px 20px", borderRadius: 14, fontFamily: "inherit", fontSize: 15.5, fontWeight: 700, cursor: disabled ? "default" : "pointer",
      border: haupt ? "none" : `1.5px solid ${C.linie}`, opacity: disabled ? 0.5 : 1,
      background: haupt ? `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` : C.weiss, color: haupt ? C.weiss : C.see,
      boxShadow: haupt ? "0 4px 14px rgba(0,77,152,0.25)" : "none", ...style }}>{children}</button>
);

function StandBalken({ zaehler, gesamt, hoehe = 10 }) {
  const reihenfolge = ["automatisiert", "sicher", "aufbau", "gesehen", "unsicher", "neu"];
  const namen = STATUS_NAME();
  const text = reihenfolge.map((s) => `${zaehler[s] || 0} ${namen[s]}`).join(", ");
  return (
    <div role="img" aria-label={text} title={text} style={{ display: "flex", height: hoehe, borderRadius: 999, overflow: "hidden", background: "#E6EBF4" }}>
      {reihenfolge.map((s) => (zaehler[s] ? <span key={s} style={{ width: `${(zaehler[s] / gesamt) * 100}%`, background: STATUS_FARBE[s] }} /> : null))}
    </div>
  );
}
function Legende({ zaehler }) {
  const namen = STATUS_NAME();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 10 }}>
      {["automatisiert", "sicher", "aufbau", "gesehen", "unsicher", "neu"].map((s) => (
        <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.grau }}>
          <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 3, background: STATUS_FARBE[s] }} />{namen[s]} <b style={{ color: C.tinte }}>{zaehler[s] || 0}</b>
        </span>
      ))}
    </div>
  );
}

/* Logo für die Startseiten-Kachel: Karten mit Aufgabe und Ergebnis */
export function HeadNumbersLogoKlein() {
  const W = 230, H = 190;
  const karten = [
    { x: 16, y: 22, w: 96, t: "7 · 8", e: "56", f: C.weiss, r: -6 },
    { x: 124, y: 14, w: 92, t: "17²", e: "289", f: C.flaggold, r: 5 },
    { x: 30, y: 104, w: 84, t: "5³", e: "125", f: C.granaHell, r: 4 },
    { x: 130, y: 108, w: 84, t: "∛512", e: "8", f: C.weiss, r: -4 },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
      {karten.map((k, i) => (
        <g key={i} transform={`rotate(${k.r} ${k.x + k.w / 2} ${k.y + 30})`}>
          <rect x={k.x} y={k.y} width={k.w} height={60} rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" />
          <text x={k.x + k.w / 2} y={k.y + 27} textAnchor="middle" fill={k.f} fontSize="18" fontWeight="800">{k.t}</text>
          <text x={k.x + k.w / 2} y={k.y + 48} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="13" fontWeight="600">= {k.e}</text>
        </g>
      ))}
    </svg>
  );
}

/* ======================================================================
   RUNDE – adaptive Aufgabenrunde
   Gleiche Optik wie der Schnellrechen-Baustein (func14): großes Zahlenfeld,
   Gleichungs-Layout, sofortige Rückmeldung. Zusätzlich: Auswahlaufgaben,
   Tipps (zählen als Hilfe), Wiederholung eines Fehlers in derselben Runde,
   Verbuchung je Zahlenbeziehung und eine Auswertung ohne Zeit-Rangliste.
   ====================================================================== */
const snapshot = (K) => Object.fromEntries(ALLE_ITEMS.map((k) => [k, status(K.items[k])]));

function Runde({ aufgaben, modul, stufe, onNochmal, onZurueck, nochmalText }) {
  const K = useKopf();
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
  const vorher = useRef(null);
  const vorherOffen = useRef(null);
  const start = useRef(Date.now());
  const aufgStart = useRef(Date.now());
  const timer = useRef(null);
  const weiterRef = useRef(null);
  if (vorher.current === null) vorher.current = snapshot(K);
  if (vorherOffen.current === null) vorherOffen.current = Object.fromEntries(MODULE.map((m) => [m, offeneBloecke(K, m)]));
  useEffect(() => { aufgStart.current = Date.now(); }, [idx]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const a = queue[idx];

  const beenden = (ergs, punkteGesamt) => {
    const erst = ergs.filter((e) => !e.retry);
    const richtig = erst.filter((e) => e.ok).length;
    const sek = Math.round((Date.now() - start.current) / 100) / 10;
    let neuerBest = false, bestVorher = null;
    if (stufe !== "verstehen") {
      kopfAendern((Kp) => {
        Kp.runden += 1; Kp.punkte += punkteGesamt;
        bestVorher = Kp.best[`${modul}:${stufe}`] || null;
        neuerBest = setzeBest(Kp, `${modul}:${stufe}`, { richtig, gesamt: erst.length, sek: stufe === "schnell" ? sek : null });
      });
    }
    setAbschluss({ richtig, gesamt: erst.length, sek, neuerBest: neuerBest && (!bestVorher || richtig / erst.length > bestVorher.richtig / bestVorher.gesamt), bestVorher });
  };

  const weiter = () => {
    clearTimeout(timer.current);
    if (idx + 1 >= queue.length) { beenden(ergebnisse, punkte); return; }
    setIdx(idx + 1); setEingabe(""); setGewaehlt(null); setRueck(null); setTipp(0);
  };
  weiterRef.current = weiter;

  const pruefen = (antwort) => {
    if (rueck || !a) return;
    const sek = Math.round((Date.now() - aufgStart.current) / 100) / 10;
    const verstehen = a.modus === "verstehen";
    const w = verstehen ? { ok: String(Number(antwort)) === String(a.loesung) && String(antwort).trim() !== "", items: [] } : wertung(a, antwort);
    const hilfe = a.retry ? 3 : tipp;
    const gewinn = w.ok ? (hilfe === 0 ? 10 : 5) : 0;
    kopfAendern((Kp) => {
      if (verstehen) bucheVerstehen(Kp, a.verstehensId, w.ok);
      else for (const key of w.items) buche(Kp, key, w.ok, { sek: a.art === "zahl" ? sek : null, hilfe: w.ok ? hilfe : 0, modus: a.modus });
    });
    try { merken({ gruppe: `Head & Numbers · ${info.gruppe}`, richtig: w.ok, sekunden: w.ok && hilfe === 0 && a.art === "zahl" ? sek : undefined, fehlerart: w.ok ? null : "rechnen" }); } catch (e) { /* optional */ }
    const neueErgs = [...ergebnisse, { a, ok: w.ok, retry: !!a.retry, antwort }];
    setErgebnisse(neueErgs);
    setPunkte(punkte + gewinn);
    setRueck(w.ok ? "richtig" : "falsch");
    if (a.art === "wahl") setGewaehlt(String(antwort));
    if (w.ok) {
      const s = serie + 1; setSerie(s); setLaengste(Math.max(laengste, s));
      timer.current = setTimeout(() => {
        // Tempo: Weitergehen sofort, sonst kurz Zeit für das Häkchen
        if (idx + 1 >= queue.length) beenden(neueErgs, punkte + gewinn); else weiterRef.current();
      }, stufe === "schnell" ? 450 : 650);
    } else {
      setSerie(0);
      if (!a.retry && !verstehen) {
        const neu = { ...aufgabeFuer(a.key, a.format, { en }), retry: true };
        setQueue((q) => { const kopie = [...q]; kopie.splice(Math.min(idx + 3, kopie.length), 0, neu); return kopie; });
      }
    }
  };

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
            {falsche.map((e, i) => <p key={i} style={{ fontSize: 14.5, color: C.tinte, marginBottom: 4 }}>{e.a.erklaerung}</p>)}
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
    <div style={{ ...karte, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, display: "flex", gap: 4 }} aria-hidden="true">
          {queue.map((q, i) => <span key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < idx ? C.see : i === idx ? C.flaggold : C.linie, opacity: q.retry && i > idx ? 0.6 : 1 }} />)}
        </div>
        <span style={{ fontSize: 12.5, color: C.grau, whiteSpace: "nowrap" }}>{idx + 1} / {queue.length}</span>
        {serie >= 3 && <span style={{ fontSize: 12.5, fontWeight: 700, color: C.gruenDunkel, whiteSpace: "nowrap" }}>{L("Serie", "Streak")} {serie}</span>}
      </div>
      {a.retry && <p style={{ fontSize: 12.5, fontWeight: 700, color: C.gruenDunkel, marginBottom: 8 }}>{L("Noch einmal – diese Aufgabe war eben dran", "Once more – this one came up earlier")}</p>}
      {zeigeFrage && <p style={{ fontSize: 13.5, fontWeight: 600, color: C.grau, marginBottom: 8 }}>{zeigeFrage}</p>}

      {a.art === "zahl" ? (
        <>
          <style>{GLEICHUNG_CSS}</style>
          <div className="kr-gleichung">
            <div className="kr-aufgabe" style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 16, padding: "20px 18px", minHeight: 96 }}>
              <p style={{ color: C.weiss, fontSize: a.text.length > 9 ? "clamp(24px, 7.2vw, 40px)" : "clamp(34px, 9vw, 44px)", fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.1, whiteSpace: "nowrap" }}>
                {a.text}{!a.ohneGleich && <> <span style={{ color: C.goldText, fontWeight: 600 }}>=</span></>}
              </p>
            </div>
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
        <Zahlenfeld gesperrt={!!rueck}
          onZiffer={(z) => setEingabe((v) => (v.length >= 5 ? v : v + z))}
          onLoeschen={() => setEingabe((v) => v.slice(0, -1))}
          onOk={() => { if (eingabe !== "") pruefen(eingabe); }} />
      )}
      <p style={{ fontSize: 12, color: C.hellgrau, textAlign: "center", marginTop: 12 }}>
        {stufe === "schnell" ? L("Erst richtig, dann schnell.", "Correct first, then fast.") : L("Du brauchst kein Tempo – genau und sicher zählt.", "No rush – accuracy and certainty count.")}
      </p>
    </div>
  );
}

/* ======================================================================
   SPIELE – Zuordnung und Zahlenmemory
   ====================================================================== */
function Zuordnung({ modul, bloecke, onZurueck }) {
  const K = useKopf();
  const [runde, setRunde] = useState(0);
  const spiel = useMemo(() => paarRunde(K, { modul, anzahl: 6, richtung: "mix", bloecke }), [runde]); // eslint-disable-line react-hooks/exhaustive-deps
  const rechts = useMemo(() => mischen(spiel.paare.map((p, i) => ({ ...p, i }))), [spiel]);
  const [links, setLinks] = useState(null);
  const [fertig, setFertig] = useState({});
  const [fehl, setFehl] = useState({});
  const [zeigeFalsch, setZeigeFalsch] = useState(null);
  const info = modulInfo(modul);
  const alle = Object.keys(fertig).length === spiel.paare.length;
  useEffect(() => { setLinks(null); setFertig({}); setFehl({}); }, [spiel]);

  const waehleRechts = (r) => {
    if (links === null || fertig[r.i]) return;
    const p = spiel.paare[links];
    if (r.i === links) {
      const hilfe = fehl[links] ? 1 : 0;
      kopfAendern((Kp) => buche(Kp, p.key, true, { modus: "erkennen", hilfe }));
      try { merken({ gruppe: `Head & Numbers · ${info.gruppe}`, richtig: true }); } catch (e) { /* optional */ }
      setFertig((f) => ({ ...f, [links]: true })); setLinks(null);
    } else {
      if (!fehl[links]) {
        kopfAendern((Kp) => buche(Kp, p.key, false, { modus: "erkennen" }));
        try { merken({ gruppe: `Head & Numbers · ${info.gruppe}`, richtig: false, fehlerart: "rechnen" }); } catch (e) { /* optional */ }
      }
      setFehl((f) => ({ ...f, [links]: (f[links] || 0) + 1 }));
      setZeigeFalsch(r.i); setTimeout(() => setZeigeFalsch(null), 600);
    }
  };
  const fehler = Object.keys(fehl).length;
  const zelle = (aktiv, fertigFlag, falsch) => ({
    minHeight: 54, padding: "8px 10px", borderRadius: 14, fontFamily: "inherit", fontSize: "clamp(16px, 4.6vw, 20px)", fontWeight: 700, whiteSpace: "nowrap", cursor: fertigFlag ? "default" : "pointer",
    border: `2px solid ${fertigFlag ? C.smaragd : falsch ? C.signal : aktiv ? C.flaggold : C.linie}`, background: fertigFlag ? "#EEF8F2" : aktiv ? "#FFF8DC" : C.weiss, color: C.tinte, opacity: fertigFlag ? 0.7 : 1,
  });
  return (
    <div>
      <Zurueck onClick={onZurueck}>{info.titel}</Zurueck>
      <H2 style={{ fontSize: 22 }}>{L("Zuordnungsspiel", "Matching game")}</H2>
      <Absatz>{L("Tippe links eine Karte an und dann rechts die passende. Ein Fehlgriff kostet nichts – er merkt sich nur, was du noch einmal anschauen solltest.", "Tap a card on the left, then the matching one on the right. A wrong tap costs nothing – it only remembers what to look at again.")}</Absatz>
      <div style={{ ...karte, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ display: "grid", gap: 8 }}>
            {spiel.paare.map((p, i) => <button key={p.key} type="button" disabled={!!fertig[i]} aria-pressed={links === i} onClick={() => setLinks(i)} style={zelle(links === i, fertig[i], false)}>{p.links}</button>)}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {rechts.map((r) => <button key={r.key} type="button" disabled={!!fertig[r.i] || links === null} onClick={() => waehleRechts(r)} style={zelle(false, fertig[r.i], zeigeFalsch === r.i)}>{r.rechts}</button>)}
          </div>
        </div>
        {alle && (
          <div style={{ marginTop: 16 }} role="status">
            <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte }}>{fehler === 0 ? L("Alle Paare gefunden – ohne Fehlgriff!", "All pairs found – no wrong taps!") : L(`Alle Paare gefunden. ${fehler} Paar${fehler === 1 ? "" : "e"} zum Nochmal-Anschauen.`, `All pairs found. ${fehler} pair${fehler === 1 ? "" : "s"} to look at again.`)}</p>
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              <Knopf onClick={() => setRunde(runde + 1)}>{L("Neue Karten", "New cards")}</Knopf>
              <Knopf haupt={false} onClick={onZurueck}>{L("Zurück zur Übersicht", "Back to overview")}</Knopf>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Memory({ modul, bloecke, onZurueck }) {
  const K = useKopf();
  const [runde, setRunde] = useState(0);
  const spiel = useMemo(() => paarRunde(K, { modul, anzahl: 6, richtung: "mix", bloecke }), [runde]); // eslint-disable-line react-hooks/exhaustive-deps
  const karten = useMemo(() => mischen(spiel.paare.flatMap((p, i) => [{ id: `${i}a`, paar: i, text: p.links, key: p.key }, { id: `${i}b`, paar: i, text: p.rechts, key: p.key }])), [spiel]);
  const [offen, setOffen] = useState([]);
  const [gefunden, setGefunden] = useState([]);
  const [zuege, setZuege] = useState(0);
  const timer = useRef(null);
  const info = modulInfo(modul);
  useEffect(() => { setOffen([]); setGefunden([]); setZuege(0); }, [spiel]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const alle = gefunden.length === spiel.paare.length;

  const dreh = (k) => {
    if (offen.length >= 2 || offen.includes(k.id) || gefunden.includes(k.paar)) return;
    const neu = [...offen, k.id];
    setOffen(neu);
    if (neu.length === 2) {
      setZuege((z) => z + 1);
      const [x, y] = neu.map((id) => karten.find((c) => c.id === id));
      if (x.paar === y.paar) {
        kopfAendern((Kp) => buche(Kp, x.key, true, { modus: "erkennen" }));
        try { merken({ gruppe: `Head & Numbers · ${info.gruppe}`, richtig: true }); } catch (e) { /* optional */ }
        timer.current = setTimeout(() => { setGefunden((g) => [...g, x.paar]); setOffen([]); }, 450);
      } else timer.current = setTimeout(() => setOffen([]), 1000);
    }
  };
  return (
    <div>
      <Zurueck onClick={onZurueck}>{info.titel}</Zurueck>
      <H2 style={{ fontSize: 22 }}>{L("Zahlenmemory", "Number memory")}</H2>
      <Absatz>{L("Finde die zusammengehörigen Karten. Zeit spielt keine Rolle – nur das Merken.", "Find the cards that belong together. Time does not matter – only remembering.")}</Absatz>
      <div style={{ ...karte, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {karten.map((k) => {
            const auf = offen.includes(k.id) || gefunden.includes(k.paar);
            const gef = gefunden.includes(k.paar);
            return (
              <button key={k.id} type="button" aria-label={auf ? k.text : L("verdeckte Karte", "face-down card")} onClick={() => dreh(k)}
                style={{ minHeight: 70, borderRadius: 14, fontFamily: "inherit", fontSize: "clamp(16px, 4.6vw, 20px)", fontWeight: 800, whiteSpace: "nowrap", cursor: auf ? "default" : "pointer",
                  border: gef ? `2px solid ${C.smaragd}` : "none", color: auf ? C.tinte : C.flaggold,
                  background: gef ? "#EEF8F2" : auf ? "#FFF8DC" : `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, transition: "background .15s" }}>
                {auf ? k.text : "?"}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 13, color: C.grau, marginTop: 12 }}>{L("Züge", "Moves")}: <b style={{ color: C.tinte }}>{zuege}</b> · {L("gefunden", "found")}: <b style={{ color: C.tinte }}>{gefunden.length}/{spiel.paare.length}</b></p>
        {alle && (
          <div style={{ display: "grid", gap: 10, marginTop: 14 }} role="status">
            <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte }}>{L(`Geschafft in ${zuege} Zügen.`, `Done in ${zuege} moves.`)}</p>
            <Knopf onClick={() => setRunde(runde + 1)}>{L("Neue Karten", "New cards")}</Knopf>
            <Knopf haupt={false} onClick={onZurueck}>{L("Zurück zur Übersicht", "Back to overview")}</Knopf>
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================================================================
   VERSTEHEN – Muster und Zusammenhänge
   ====================================================================== */
function Regler({ wert, setWert, min, max, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0 6px" }}>
      <button type="button" aria-label={L("kleiner", "smaller")} onClick={() => setWert(Math.max(min, wert - 1))} style={pfeil}>−</button>
      <input type="range" min={min} max={max} value={wert} aria-label={label} onChange={(e) => setWert(Number(e.target.value))} style={{ flex: 1, accentColor: C.see, height: 32 }} />
      <button type="button" aria-label={L("größer", "larger")} onClick={() => setWert(Math.min(max, wert + 1))} style={pfeil}>+</button>
    </div>
  );
}
const pfeil = { width: 44, height: 44, borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 22, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", lineHeight: 1 };
const Gleichung = ({ children }) => <p style={{ fontSize: "clamp(17px, 4.8vw, 21px)", fontWeight: 800, color: C.tinte, lineHeight: 1.5, textAlign: "center", margin: "6px 0 2px", fontVariantNumeric: "tabular-nums" }}>{children}</p>;
const Abschnitt = ({ titel, children }) => (
  <section style={{ ...karte, padding: 18, marginBottom: 14 }}>
    <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte, marginBottom: 8 }}>{titel}</p>{children}
  </section>
);

function QuadratBild({ n }) {
  const m = n + 1, S = 260, z = S / m;
  return (
    <svg viewBox={`0 0 ${S} ${S}`} style={{ width: "100%", maxWidth: 280, display: "block", margin: "8px auto" }} role="img"
      aria-label={L(`Quadrat mit Seitenlänge ${n}: ${n * n} Kästchen, dazu ${2 * n + 1} für das nächste Quadrat`, `Square with side ${n}: ${n * n} cells, plus ${2 * n + 1} for the next square`)}>
      <rect x="0" y="0" width={n * z} height={n * z} fill={C.see} />
      <rect x={n * z} y="0" width={z} height={m * z} fill={C.flaggold} />
      <rect x="0" y={n * z} width={n * z} height={z} fill={C.flaggold} />
      {Array.from({ length: m + 1 }, (_, i) => (
        <g key={i}><line x1={i * z} y1="0" x2={i * z} y2={S} stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" /><line x1="0" y1={i * z} x2={S} y2={i * z} stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" /></g>
      ))}
    </svg>
  );
}

function WuerfelBild({ n }) {
  const W = 260, H = 240, k = 0.45;
  const z = 170 / (n * (1 + k)), a = z * k;
  const x0 = 20, y0 = H - 22 - n * z;                             // Vorderseite links unten, y0 = oberer Rand
  const gitter = [];
  for (let i = 0; i <= n; i++) {
    gitter.push(<line key={`fv${i}`} x1={x0 + i * z} y1={y0} x2={x0 + i * z} y2={y0 + n * z} />);
    gitter.push(<line key={`fh${i}`} x1={x0} y1={y0 + i * z} x2={x0 + n * z} y2={y0 + i * z} />);
    gitter.push(<line key={`tt${i}`} x1={x0 + i * a} y1={y0 - i * a} x2={x0 + i * a + n * z} y2={y0 - i * a} />);
    gitter.push(<line key={`td${i}`} x1={x0 + i * z} y1={y0} x2={x0 + i * z + n * a} y2={y0 - n * a} />);
    gitter.push(<line key={`sd${i}`} x1={x0 + n * z} y1={y0 + i * z} x2={x0 + n * z + n * a} y2={y0 + i * z - n * a} />);
    gitter.push(<line key={`sv${i}`} x1={x0 + n * z + i * a} y1={y0 - i * a} x2={x0 + n * z + i * a} y2={y0 + n * z - i * a} />);
  }
  const P = (pts, f) => <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={f} />;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 280, display: "block", margin: "8px auto" }} role="img"
      aria-label={L(`Würfel aus ${n} Schichten mit je ${n} mal ${n} Würfelchen: ${n ** 3} Würfelchen`, `Cube of ${n} layers with ${n} by ${n} blocks each: ${n ** 3} blocks`)}>
      {P([[x0, y0], [x0 + n * z, y0], [x0 + n * z, y0 + n * z], [x0, y0 + n * z]], C.see)}
      {P([[x0, y0], [x0 + n * z, y0], [x0 + n * z + n * a, y0 - n * a], [x0 + n * a, y0 - n * a]], C.flaggold)}
      {P([[x0 + n * z, y0], [x0 + n * z + n * a, y0 - n * a], [x0 + n * z + n * a, y0 + n * z - n * a], [x0 + n * z, y0 + n * z]], C.seeHell)}
      <g stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8">{gitter}</g>
    </svg>
  );
}

function MusterCheck({ id, fragen, onFertig }) {
  const [antworten, setAntworten] = useState({});
  const beantwortet = Object.keys(antworten).length;
  const richtig = Object.entries(antworten).filter(([i, v]) => v === fragen[i].richtig).length;
  const waehle = (i, o) => {
    if (antworten[i] !== undefined) return;
    setAntworten((x) => ({ ...x, [i]: o }));
    kopfAendern((Kp) => bucheVerstehen(Kp, `${id}:${i}`, o === fragen[i].richtig));
  };
  return (
    <div>
      {fragen.map((f, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.tinte, lineHeight: 1.5, marginBottom: 8 }}>{i + 1}. {f.frage}</p>
          <div style={{ display: "grid", gap: 6 }}>
            {f.optionen.map((o, j) => {
              const hat = antworten[i] !== undefined, istR = j === f.richtig, gew = antworten[i] === j;
              return (
                <button key={j} type="button" disabled={hat} onClick={() => waehle(i, j)}
                  style={{ minHeight: 46, padding: "8px 14px", borderRadius: 12, textAlign: "left", fontFamily: "inherit", fontSize: 14.5, fontWeight: 600, color: C.tinte, cursor: hat ? "default" : "pointer",
                    border: `2px solid ${hat ? (istR ? C.smaragd : gew ? C.signal : C.linie) : C.linie}`, background: hat ? (istR ? "#EEF8F2" : gew ? "#FBEFEA" : C.weiss) : C.weiss, opacity: hat && !istR && !gew ? 0.6 : 1 }}>{o}</button>
              );
            })}
          </div>
          {antworten[i] !== undefined && <p style={{ fontSize: 13.5, color: antworten[i] === f.richtig ? C.smaragd : C.signal, marginTop: 6, lineHeight: 1.5 }}>{antworten[i] === f.richtig ? L("Richtig. ", "Correct. ") : L("Nicht ganz. ", "Not quite. ")}{f.erklaerung}</p>}
        </div>
      ))}
      {beantwortet === fragen.length && (
        <p style={{ fontSize: 14.5, fontWeight: 700, color: C.tinte }} role="status">{L(`${richtig} von ${fragen.length} richtig.`, `${richtig} of ${fragen.length} correct.`)}</p>
      )}
    </div>
  );
}

function Verstehen({ modul, onZurueck, onUeben, onMuster }) {
  const info = modulInfo(modul);
  const [n, setN] = useState(modul === "kubik" ? 4 : 7);
  const [reihe, setReihe] = useState(9);
  const [fa, setFa] = useState(6), [fb, setFb] = useState(7);
  useEffect(() => { kopfAendern((Kp) => markiereEntdeckt(Kp, `${modul}:start`)); }, [modul]);
  const REIHEN = {
    1: L("Die Zahl bleibt gleich.", "The number stays the same."),
    2: L("Verdoppeln – alle Ergebnisse sind gerade.", "Doubling – every result is even."),
    3: L("Die Quersumme jedes Ergebnisses ist durch 3 teilbar.", "The digit sum of every result is divisible by 3."),
    4: L("Zweimal verdoppeln.", "Double twice."),
    5: L("Endet immer auf 0 oder 5 – die Hälfte von mal 10.", "Always ends in 0 or 5 – half of times 10."),
    6: L("Alle Ergebnisse sind gerade und durch 3 teilbar, denn 6 = 2 · 3.", "Every result is even and divisible by 3, since 6 = 2 · 3."),
    7: L("Zerlege: 7 · n = 5 · n + 2 · n.", "Split it: 7 · n = 5 · n + 2 · n."),
    8: L("Dreimal verdoppeln: 8 = 2 · 2 · 2.", "Double three times: 8 = 2 · 2 · 2."),
    9: L("Mal 10 minus die Zahl – und die Quersumme jedes Ergebnisses ist 9.", "Times 10 minus the number – and the digit sum of every result is 9."),
    10: L("Hänge einfach eine Null an.", "Just append a zero."),
  };
  const p = fa * fb;

  const Fuss = (
    <div style={{ display: "grid", gap: 10, marginTop: 6 }}>
      <Knopf onClick={onUeben}>{L("Jetzt mit Unterstützung üben", "Now practise with support")}</Knopf>
      <Knopf haupt={false} onClick={onZurueck}>{L("Zurück zur Übersicht", "Back to overview")}</Knopf>
    </div>
  );

  if (modul === "einmaleins") {
    return (
      <div>
        <Zurueck onClick={onZurueck}>{info.titel}</Zurueck>
        <H2>{L("Verstehen: Muster im Einmaleins", "Understand: patterns in the times tables")}</H2>
        <Absatz>{L("Bevor du abrufst, lohnt ein Blick auf die Ordnung dahinter. Vieles musst du gar nicht einzeln lernen.", "Before you recall, it pays to see the order behind it. Much of it needs no separate learning.")}</Absatz>
        <Abschnitt titel={L("Das Schachbrett: nur 55 von 100 Aufgaben", "The grid: only 55 of 100 problems")}>
          <Absatz style={{ marginBottom: 10 }}>{L("Das Brett ist an der gelben Diagonale gespiegelt: 7 · 8 und 8 · 7 sind dieselbe Tatsache. Wer 55 Aufgaben kennt, kennt alle 100.", "The grid is mirrored on the gold diagonal: 7 · 8 and 8 · 7 are the same fact. Knowing 55 problems means knowing all 100.")}</Absatz>
          <EinmaleinsSchachbrett />
        </Abschnitt>
        <Abschnitt titel={L("Eine Reihe genauer ansehen", "Look at one table closely")}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((r) => (
              <button key={r} type="button" aria-pressed={reihe === r} onClick={() => setReihe(r)}
                style={{ width: 44, height: 44, borderRadius: 999, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${reihe === r ? C.see : C.linie}`, background: reihe === r ? C.see : C.weiss, color: reihe === r ? C.weiss : C.see }}>{r}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 6 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((k) => (
              <div key={k} style={{ background: C.himmel, borderRadius: 10, padding: "7px 10px", fontSize: 14.5, display: "flex", justifyContent: "space-between", fontVariantNumeric: "tabular-nums" }}>
                <span style={{ color: C.see, fontWeight: 700 }}>{reihe} {MAL} {k}</span><span style={{ fontWeight: 800 }}>{reihe * k}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, marginTop: 12 }}><b>{L(`${reihe}er-Reihe:`, `${reihe} times table:`)}</b> {REIHEN[reihe]}</p>
        </Abschnitt>
        <Abschnitt titel={L("Zahlenfamilien: vier Gleichungen, eine Tatsache", "Number families: four equations, one fact")}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            {[[fa, setFa], [fb, setFb]].map(([w, set], i) => (
              <label key={i} style={{ fontSize: 13.5, color: C.grau, display: "flex", alignItems: "center", gap: 8 }}>
                {i === 0 ? L("1. Faktor", "1st factor") : L("2. Faktor", "2nd factor")}
                <select value={w} onChange={(e) => set(Number(e.target.value))} style={{ minHeight: 40, borderRadius: 10, border: `1.5px solid ${C.linie}`, fontFamily: "inherit", fontSize: 15, fontWeight: 700, padding: "0 10px" }}>
                  {Array.from({ length: 10 }, (_, j) => j + 1).map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </label>
            ))}
          </div>
          <Gleichung>{fa} {MAL} {fb} = {p}</Gleichung>
          {fa !== fb && <Gleichung>{fb} {MAL} {fa} = {p}</Gleichung>}
          <Gleichung>{p} : {fa} = {fb}</Gleichung>
          {fa !== fb && <Gleichung>{p} : {fb} = {fa}</Gleichung>}
          <Absatz style={{ marginTop: 8, marginBottom: 0 }}>{L("Wer die Multiplikation kennt, kennt die Division gleich mit – und umgekehrt.", "Knowing the multiplication means knowing the division too – and the other way round.")}</Absatz>
        </Abschnitt>
        <Abschnitt titel={L("Probier es aus", "Try it")}>
          <MusterCheck id="einmaleins" fragen={[
            { frage: L("Welche Quersumme haben alle Ergebnisse der 9er-Reihe (9 bis 90)?", "What digit sum do all results of the 9 times table (9 to 90) have?"), optionen: ["9", "10", "18", L("jedes Ergebnis eine andere", "a different one each time")], richtig: 0, erklaerung: L("18 → 1 + 8 = 9, 27 → 2 + 7 = 9, 36 → 9 … immer 9.", "18 → 1 + 8 = 9, 27 → 2 + 7 = 9, 36 → 9 … always 9.") },
            { frage: L("Womit enden alle Ergebnisse der 5er-Reihe?", "What do all results of the 5 times table end in?"), optionen: [L("mit 0 oder 5", "0 or 5"), L("mit 5 oder 6", "5 or 6"), L("mit 2 oder 7", "2 or 7"), L("mit jeder Ziffer", "any digit")], richtig: 0, erklaerung: L("5 · n ist die Hälfte von 10 · n: also …0 oder …5.", "5 · n is half of 10 · n: so …0 or …5.") },
            { frage: L("Warum musst du 7 · 8 und 8 · 7 nicht getrennt lernen?", "Why do you not need to learn 7 · 8 and 8 · 7 separately?"), optionen: [L("Die Reihenfolge der Faktoren ändert das Ergebnis nicht.", "The order of the factors does not change the result."), L("8 · 7 ist viel leichter.", "8 · 7 is much easier."), L("Beide sind nie dran.", "Neither ever comes up."), L("Eine der beiden ist falsch.", "One of them is wrong.")], richtig: 0, erklaerung: L("Beide ergeben 56 – das Schachbrett ist an der Diagonale gespiegelt.", "Both give 56 – the grid is mirrored on its diagonal.") },
            { frage: L("Aus 6 · 7 = 42 folgt …", "From 6 · 7 = 42 it follows …"), optionen: ["42 : 6 = 7", "42 : 6 = 8", "42 − 6 = 7", "6 + 7 = 42"], richtig: 0, erklaerung: L("Division ist die Umkehrung der Multiplikation.", "Division is the reverse of multiplication.") },
          ]} />
        </Abschnitt>
        {Fuss}
      </div>
    );
  }

  if (modul === "quadrate") {
    const summe = Array.from({ length: Math.min(n, 8) }, (_, i) => 2 * i + 1);
    return (
      <div>
        <Zurueck onClick={onZurueck}>{info.titel}</Zurueck>
        <H2>{L("Verstehen: Quadratzahlen wachsen mit ungeraden Zahlen", "Understand: square numbers grow by odd numbers")}</H2>
        <Absatz>{L("n² ist die Fläche eines Quadrats mit der Seitenlänge n. Wenn die Seite um 1 wächst, kommt ein Winkel aus Kästchen dazu – und dessen Größe folgt einem festen Muster.", "n² is the area of a square with side n. When the side grows by 1, an L-shaped strip of cells is added – and its size follows a fixed pattern.")}</Absatz>
        <Abschnitt titel={L("Vom Quadrat zum nächsten Quadrat", "From one square to the next")}>
          <QuadratBild n={n} />
          <Regler wert={n} setWert={setN} min={1} max={24} label={L("Seitenlänge", "Side length")} />
          <Gleichung>{n}² = {n * n}</Gleichung>
          <Gleichung>{n + 1}² = {n}² + 2 {MAL} {n} + 1 = {n * n} + {2 * n + 1} = {(n + 1) ** 2}</Gleichung>
          <Absatz style={{ marginTop: 10, marginBottom: 0 }}>{L(`Der gelbe Winkel hat 2 · ${n} + 1 = ${2 * n + 1} Kästchen: immer die nächste ungerade Zahl.`, `The gold strip has 2 · ${n} + 1 = ${2 * n + 1} cells: always the next odd number.`)}</Absatz>
        </Abschnitt>
        <Abschnitt titel={L("Die Treppe der ungeraden Zahlen", "The staircase of odd numbers")}>
          <Gleichung>{summe.join(" + ")}{n > 8 ? " + …" : ""} = {n}²</Gleichung>
          <Absatz style={{ marginTop: 8, marginBottom: 0 }}>{L("Die Summe der ersten n ungeraden Zahlen ist n². Daraus findest du jedes Quadrat vom Nachbarn: 17² = 16² + 33 = 256 + 33 = 289.", "The sum of the first n odd numbers is n². From that you get any square from its neighbour: 17² = 16² + 33 = 256 + 33 = 289.")}</Absatz>
        </Abschnitt>
        <Abschnitt titel={L("Zwei Kniffe fürs Kopfrechnen", "Two tricks for mental maths")}>
          <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.65, marginBottom: 10 }}><b>{L("Zahlen mit Endziffer 5:", "Numbers ending in 5:")}</b> {L("Rechne k · (k + 1) und hänge 25 an. 15²: 1 · 2 = 2 → 225. 25²: 2 · 3 = 6 → 625.", "Work out k · (k + 1) and append 25. 15²: 1 · 2 = 2 → 225. 25²: 2 · 3 = 6 → 625.")}</p>
          <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.65 }}><b>{L("Zerlegen:", "Splitting:")}</b> {L("(a + b)² = a² + 2ab + b². 23² = 20² + 2 · 20 · 3 + 3² = 400 + 120 + 9 = 529.", "(a + b)² = a² + 2ab + b². 23² = 20² + 2 · 20 · 3 + 3² = 400 + 120 + 9 = 529.")}</p>
        </Abschnitt>
        <Abschnitt titel={L("Probier es aus", "Try it")}>
          <MusterCheck id="quadrate" fragen={[
            { frage: L("Welche Endziffer kann eine Quadratzahl nie haben?", "Which last digit can a square number never have?"), optionen: ["3", "5", "6", "1"], richtig: 0, erklaerung: L("Quadratzahlen enden nur auf 0, 1, 4, 5, 6 oder 9.", "Square numbers only end in 0, 1, 4, 5, 6 or 9.") },
            { frage: L("Wie viel kommt von 9² auf 10² dazu?", "How much is added from 9² to 10²?"), optionen: ["18", "19", "20", "10"], richtig: 1, erklaerung: L("2 · 9 + 1 = 19: 81 + 19 = 100.", "2 · 9 + 1 = 19: 81 + 19 = 100.") },
            { frage: L("Was ist 15² mit dem 5er-Trick?", "What is 15² using the trick for 5s?"), optionen: ["215", "225", "235", "255"], richtig: 1, erklaerung: L("1 · 2 = 2, dann 25 anhängen: 225.", "1 · 2 = 2, then append 25: 225.") },
          ]} />
          <div style={{ marginTop: 6 }}><Knopf haupt={false} onClick={onMuster} style={{ width: "100%" }}>{L("Drei Muster-Aufgaben rechnen", "Work three pattern problems")}</Knopf></div>
        </Abschnitt>
        <Abschnitt titel={L("Alle Quadratzahlen im Überblick", "All square numbers at a glance")}>
          <PotenzSpalten hoch={2} bloecke={[[1, 10], [11, 20], [21, 25]]} />
        </Abschnitt>
        {Fuss}
      </div>
    );
  }

  const w = Math.min(n, 10);
  return (
    <div>
      <Zurueck onClick={onZurueck}>{info.titel}</Zurueck>
      <H2>{L("Verstehen: Was eine Kubikzahl ist", "Understand: what a cube number is")}</H2>
      <Absatz>{L("n³ ist die Zahl der Würfelchen in einem Würfel mit der Kantenlänge n – also n Schichten, jede mit n · n Würfelchen. Potenzen sind nur eine kurze Schreibweise für wiederholtes Malnehmen.", "n³ is the number of blocks in a cube with edge length n – so n layers, each with n · n blocks. Powers are just a short way to write repeated multiplication.")}</Absatz>
      <Abschnitt titel={L("Schicht für Schicht", "Layer by layer")}>
        <WuerfelBild n={w} />
        <Regler wert={w} setWert={setN} min={1} max={10} label={L("Kantenlänge", "Edge length")} />
        <Gleichung>{w}³ = {w} {MAL} {w} {MAL} {w}</Gleichung>
        <Gleichung>= {w * w} {MAL} {w} = {w ** 3}</Gleichung>
        <Absatz style={{ marginTop: 10, marginBottom: 0 }}>{L(`Erst eine Schicht (${w} · ${w} = ${w * w}), dann ${w} Schichten übereinander.`, `First one layer (${w} · ${w} = ${w * w}), then ${w} layers stacked.`)}</Absatz>
      </Abschnitt>
      <Abschnitt titel={L("Quadrat und Kubik zugleich", "Square and cube at once")}>
        <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.65 }}>{L("Manche Zahlen sind beides: 1 = 1² = 1³ und 64 = 8² = 4³. (Auch 729 = 27² = 9³ – aber 27² liegt außerhalb der Quadratzahlen bis 625.) Beim Zuordnen von Zahlen lohnt sich deshalb immer die Frage: Quadrat, Kubik oder beides?", "Some numbers are both: 1 = 1² = 1³ and 64 = 8² = 4³. (Also 729 = 27² = 9³ – but 27² lies beyond the squares up to 625.) So when classifying numbers, always ask: square, cube or both?")}</p>
      </Abschnitt>
      <Abschnitt titel={L("Probier es aus", "Try it")}>
        <MusterCheck id="kubik" fragen={[
          { frage: L("Was bedeutet 5³?", "What does 5³ mean?"), optionen: ["5 · 5 · 5 = 125", "5 · 3 = 15", "5 + 5 + 5 = 15", "3 · 3 · 3 · 3 · 3 = 243"], richtig: 0, erklaerung: L("Die 3 sagt, wie oft die 5 als Faktor vorkommt.", "The 3 tells you how many times 5 appears as a factor.") },
          { frage: L("Welche Zahl ist Quadrat- und Kubikzahl zugleich?", "Which number is both a square and a cube?"), optionen: ["27", "64", "100", "125"], richtig: 1, erklaerung: L("64 = 8² = 4³. 27 und 125 sind nur Kubikzahlen, 100 nur eine Quadratzahl.", "64 = 8² = 4³. 27 and 125 are only cubes, 100 only a square.") },
          { frage: L("Die Kante eines Würfels wird verdoppelt (2³ → 4³). Wie viel mal so viele Würfelchen sind es?", "The edge of a cube is doubled (2³ → 4³). How many times as many blocks is that?"), optionen: [L("2-mal", "2 times"), L("4-mal", "4 times"), L("8-mal", "8 times"), L("6-mal", "6 times")], richtig: 2, erklaerung: L("8 → 64, das ist das 8-Fache: 2 · 2 · 2.", "8 → 64, which is 8 times as many: 2 · 2 · 2.") },
        ]} />
      </Abschnitt>
      <Abschnitt titel={L("Alle Kubikzahlen im Überblick", "All cube numbers at a glance")}>
        <PotenzSpalten hoch={3} bloecke={[[1, 10]]} />
      </Abschnitt>
      {Fuss}
    </div>
  );
}

/* ======================================================================
   BEREICH – Übersicht eines Moduls
   ====================================================================== */
function Stufenzeile({ stufe, stand, empfohlen, onStart, modul }) {
  const s = stufeInfo(stufe);
  const st = stand[stufe] || { offen: true };
  const offen = st.offen;
  let hinweis = null;
  if (!offen && stufe === "schnell") hinweis = L(`Wird frei, sobald etwa die Hälfte der freigeschalteten Aufgaben im Aufbau ist (noch ${st.fehlt}).`, `Unlocks once about half of the open problems are in progress (${st.fehlt} to go).`);
  if (!offen && stufe === "challenge") hinweis = L("Wird frei, sobald rund 70 % im Aufbau und ein Drittel sicher ist.", "Unlocks once about 70 % are in progress and a third is secure.");
  if (!offen && stufe === "wiederholen") hinweis = L("Gerade ist nichts zu wiederholen.", "Nothing to review right now.");
  if (offen && stufe === "wiederholen" && st.anzahl) hinweis = L(`${st.anzahl} Aufgabe${st.anzahl === 1 ? "" : "n"} unsicher oder fällig.`, `${st.anzahl} problem${st.anzahl === 1 ? "" : "s"} shaky or due.`);
  return (
    <button type="button" disabled={!offen} onClick={onStart} aria-label={`${s.nr}. ${s.name}`}
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "12px 14px", marginBottom: 8, borderRadius: 16, fontFamily: "inherit",
        cursor: offen ? "pointer" : "default", background: offen ? C.weiss : "#F1F4F9", border: `2px solid ${empfohlen && offen ? C.flaggold : C.linie}`, opacity: offen ? 1 : 0.8 }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800,
        background: offen ? `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` : "#D5DBE8", color: offen ? C.flaggold : "#fff" }}>{offen ? s.nr : "🔒"}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15.5, fontWeight: 700, color: C.tinte }}>{s.name}</span>
          {empfohlen && offen && <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", background: C.flaggold, color: NAVY, borderRadius: 999, padding: "2px 8px" }}>{L("Nächster Schritt", "Next step")}</span>}
        </span>
        <span style={{ display: "block", fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.4, marginTop: 2 }}>{hinweis || s.text}</span>
      </span>
    </button>
  );
}

function BereichSeite({ modul, onZurueck, onStart, gehe }) {
  const K = useKopf();
  const info = modulInfo(modul);
  const gemischt = modul === "gemischt";
  const jetzt = Date.now();
  const u = gemischt ? null : modulUebersicht(K, modul, jetzt);
  const g = gesamtUebersicht(K, jetzt);
  const stand = stufenStand(K, modul, jetzt);
  const rec = empfehlung(K, modul, jetzt);
  const stufen = gemischt ? ["selbst", "schnell", "wiederholen", "challenge"] : STUFEN;
  const [auswahl, setAuswahl] = useState(null);       // null = alle freigeschalteten Blöcke
  const [referenz, setReferenz] = useState(false);
  const zaehler = gemischt ? g.module.reduce((z, m) => { for (const s of Object.keys(m.zaehler)) z[s] = (z[s] || 0) + m.zaehler[s]; return z; }, {}) : u.zaehler;
  const gesamt = gemischt ? g.gesamt : u.gesamt;
  const sicher = (zaehler.sicher || 0) + (zaehler.automatisiert || 0);
  const faellig = gemischt ? g.faellig : u.faellig;
  const unsicherListe = gemischt ? ALLE_ITEMS.filter((k) => status(K.items[k]) === "unsicher") : u.unsicher;
  const bloeckeFuerRunde = !gemischt && auswahl && auswahl.length ? [...auswahl].sort((a, b) => a - b) : null;
  const start = (art, extra = {}) => onStart({ art, modul, bloecke: bloeckeFuerRunde, ...extra });
  const hn = L("Head & Numbers", "Head & Numbers");

  return (
    <div>
      <Zurueck onClick={onZurueck}>{hn}</Zurueck>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <span aria-hidden="true" style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 16, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.flaggold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, fontWeight: 800 }}>{info.zeichen}</span>
        <div><H2 style={{ marginBottom: 2, fontSize: 23 }}>{info.titel}</H2><p style={{ fontSize: 14, color: C.grau, fontWeight: 300 }}>{info.kurz}</p></div>
      </div>

      <section style={{ ...karte, padding: 18, marginBottom: 14 }}>
        <p style={{ fontSize: 14, color: C.grau, marginBottom: 8 }}><b style={{ color: C.tinte, fontSize: 22 }}>{sicher}</b> {L(`von ${gesamt} ${info.einheit} sicher abrufbar (beide Richtungen einzeln gezählt)`, `of ${gesamt} ${info.einheit} securely recalled (both directions counted separately)`)}</p>
        <StandBalken zaehler={zaehler} gesamt={gesamt} />
        <Legende zaehler={zaehler} />
        {faellig > 0 && <p style={{ fontSize: 13.5, color: C.tinte, marginTop: 12 }}><b>{faellig}</b> {L(faellig === 1 ? "Aufgabe ist zum Wiederholen fällig." : "Aufgaben sind zum Wiederholen fällig.", faellig === 1 ? "problem is due for review." : "problems are due for review.")}</p>}
        <p style={{ fontSize: 12.5, color: C.hellgrau, marginTop: 10, lineHeight: 1.5 }}>{L("„Sicher“ heißt: mehrfach richtig abgerufen, verteilt auf mindestens zwei Tage. Einmal richtig reicht nicht – und langsam ist nicht schlechter, nur noch nicht automatisiert.", "“Secure” means recalled correctly several times across at least two days. Once is not enough – and slower is not worse, just not yet automatic.")}</p>
      </section>

      {gemischt && (
        <section style={{ ...karte, padding: 18, marginBottom: 14 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 10 }}>{L("Die drei Bereiche im Mix", "The three areas in the mix")}</p>
          {g.module.map((m) => (
            <div key={m.modul} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{modulInfo(m.modul).gruppe}</span><span style={{ color: C.grau }}>{m.sicher}/{m.gesamt}</span></div>
              <StandBalken zaehler={m.zaehler} gesamt={m.gesamt} hoehe={7} />
            </div>
          ))}
        </section>
      )}

      <Kicker>{L("Dein Lernpfad", "Your learning path")}</Kicker>
      <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.55, marginBottom: 10 }}>{L("Die Reihenfolge ist ein Vorschlag, keine Pflicht. Tempo-Stufen schalten sich frei, wenn die Grundlage da ist.", "The order is a suggestion, not a rule. Speed levels unlock once the foundation is there.")}</p>
      {stufen.map((s) => (
        <Stufenzeile key={s} stufe={s} stand={stand} empfohlen={rec === s} modul={modul}
          onStart={() => (s === "verstehen" ? onStart({ art: "verstehen", modul }) : start("runde", { stufe: s }))} />
      ))}

      {!gemischt && (
        <>
          <Kicker>{L("Bereiche zum Üben", "Areas to practise")}</Kicker>
          <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.55, marginBottom: 10 }}>{L("Zu Beginn sind die leichteren Pakete offen; die nächsten öffnen sich mit dem Fortschritt. Du kannst auch gezielt auswählen.", "At first the easier sets are open; the next ones open as you progress. You can also choose directly.")}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {u.bloecke.map((b) => {
              const an = auswahl ? auswahl.includes(b.index) : b.offen;
              const gut = b.zaehler.aufbau + b.zaehler.sicher + b.zaehler.automatisiert;
              return (
                <button key={b.id} type="button" aria-pressed={an} onClick={() => { const aktuell = auswahl || u.offen; setAuswahl(aktuell.includes(b.index) ? (aktuell.length > 1 ? aktuell.filter((x) => x !== b.index) : aktuell) : [...aktuell, b.index]); }}
                  style={{ minHeight: 56, padding: "8px 14px", borderRadius: 14, fontFamily: "inherit", textAlign: "left", cursor: "pointer", border: `2px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss, color: C.tinte }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{!b.offen && !an ? "🔒 " : ""}{L(b.de, b.en)}</span>
                  <span style={{ display: "block", fontSize: 12, color: C.grau }}>{gut}/{b.gesamt} {L("im Aufbau oder besser", "building or better")}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <Kicker>{L("Spielen", "Play")}</Kicker>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 18 }}>
        <Knopf haupt={false} onClick={() => start("zuordnung")}>{L("Zuordnungsspiel", "Matching game")}</Knopf>
        <Knopf haupt={false} onClick={() => start("memory")}>{L("Zahlenmemory", "Number memory")}</Knopf>
      </div>

      <Kicker>{L("Offene Herausforderungen", "Open challenges")}</Kicker>
      <section style={{ ...karte, padding: 18, marginBottom: 18 }}>
        {unsicherListe.length === 0 && faellig === 0 ? (
          <p style={{ fontSize: 14.5, color: C.grau, lineHeight: 1.6 }}>{L("Gerade ist nichts unsicher oder fällig. Neue Aufgaben findest du in den Stufen oben.", "Nothing is shaky or due right now. Find new problems in the levels above.")}</p>
        ) : (
          <>
            {unsicherListe.length > 0 && (
              <>
                <p style={{ fontSize: 14, color: C.tinte, marginBottom: 8 }}>{L("Noch unsicher:", "Still shaky:")}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {unsicherListe.slice(0, 18).map((k) => (
                    <span key={k} title={RICHTUNG_NAME(ITEM_INFO.get(k).richtung)} style={{ background: "#FBEFEA", color: C.signal, borderRadius: 999, padding: "5px 12px", fontSize: 14, fontWeight: 700 }}>{itemText(k)}</span>
                  ))}
                  {unsicherListe.length > 18 && <span style={{ fontSize: 13, color: C.grau, alignSelf: "center" }}>+{unsicherListe.length - 18}</span>}
                </div>
              </>
            )}
            <Knopf onClick={() => start("runde", { stufe: "wiederholen" })} style={{ width: "100%" }}>{L("Gezielt wiederholen", "Review now")}</Knopf>
          </>
        )}
      </section>

      {!gemischt && (
        <>
          <button type="button" aria-expanded={referenz} onClick={() => setReferenz(!referenz)}
            style={{ width: "100%", minHeight: 48, textAlign: "left", padding: "10px 16px", borderRadius: 14, border: `1.5px solid ${C.linie}`, background: C.weiss, fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: C.see, cursor: "pointer", marginBottom: 10 }}>
            {referenz ? "− " : "+ "}{L("Nachschlagen: alle Zahlen", "Look up: all numbers")}
          </button>
          {referenz && (
            <div style={{ marginBottom: 14 }}>
              {modul === "einmaleins" && <EinmaleinsSchachbrett />}
              {modul === "quadrate" && <PotenzSpalten hoch={2} bloecke={[[1, 10], [11, 20], [21, 25]]} />}
              {modul === "kubik" && <PotenzSpalten hoch={3} bloecke={[[1, 10]]} />}
            </div>
          )}
          <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, marginTop: 6 }}>
            {L("Weitere Rechentrainer dazu – zum Beispiel Mal bis vierstellig oder Wurzeln bis 10 000 – findest du im ", "More arithmetic trainers for this – for example multiplication up to four digits or roots up to 10 000 – are in ")}
            <button type="button" onClick={() => gehe({ ansicht: "kopf", trainer: modul === "einmaleins" ? "multiplizieren" : "potenzen" })} style={{ background: "none", border: "none", padding: 0, color: C.see, fontWeight: 700, fontFamily: "inherit", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>{L("Kopfrechnen-Bereich", "mental arithmetic section")}</button>.
          </p>
        </>
      )}
    </div>
  );
}

/* ======================================================================
   START
   ====================================================================== */
function StartSeite({ onWaehle, onStart, gehe }) {
  const K = useKopf();
  const jetzt = Date.now();
  const g = gesamtUebersicht(K, jetzt);
  const hinweis = schwacheGrundlagen(K);
  const faelligGesamt = g.faellig + g.unsicher;
  return (
    <div>
      <section style={{ ...karte, padding: 22, marginBottom: 18 }}>
        <Kicker>{L("Zu diesem Kurs", "About this course")}</Kicker>
        <H2>{L("Kopfrechnen: eine Grundlage, die einfach sitzen sollte", "Mental arithmetic: a foundation that should simply be there")}</H2>
        <Absatz>{L("Kopfrechnen ist eine wichtige Grundlage in der Mathematik. Es sollte einfach verfügbar und gut trainiert sein, damit es dir keine Schwierigkeiten macht, wenn es in einer Aufgabe darauf ankommt.", "Mental arithmetic is an important foundation in mathematics. It should be readily available and well practised, so that it causes you no trouble when it matters in a problem.")}</Absatz>
        <Absatz>{L("Gleichzeitig ist es eine ganz eigene Aufgabe – sehr getrennt von den wirklichen Fähigkeiten in der Mathematik, mit denen es häufig verwechselt wird. Wir wollen es deshalb als zusätzliche Fähigkeit beherrschen.", "At the same time it is a task of its own – very separate from the real skills in mathematics, with which it is often confused. So we want to master it as an additional skill.")}</Absatz>
        <div style={{ background: "#FFF8DC", borderLeft: `4px solid ${C.flaggold}`, borderRadius: "4px 14px 14px 4px", padding: "14px 16px", marginBottom: 14 }}>
          <p style={{ fontSize: 15, color: C.tinte, lineHeight: 1.75, fontWeight: 400 }}>{L("Stell dir einen Koch vor: Er sollte auch seine Küche sauber halten können. Das hat mit Kochen direkt nichts zu tun – und ist trotzdem eine wichtige Fähigkeit, um eine Küche sauber führen zu können.", "Picture a cook: they should also be able to keep their kitchen clean. That has nothing directly to do with cooking – and yet it is an important skill for running a kitchen cleanly.")}</p>
        </div>
        <Absatz style={{ marginBottom: 0 }}>{L("Genau dafür ist Head & Numbers da: Einmaleins, Quadratzahlen und Kubikzahlen einmal sauber trainieren – spielerisch, mit Verständnis und ohne Zeitdruck.", "That is exactly what Head & Numbers is for: practise the times tables, square numbers and cube numbers properly once – playfully, with understanding and without time pressure.")}</Absatz>
      </section>

      {faelligGesamt > 0 && (
        <section style={{ ...karte, padding: 18, marginBottom: 18, border: `2px solid ${C.flaggold}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>{L("Heute zum Wiederholen", "For review today")}</p>
          <p style={{ fontSize: 14, color: C.grau, marginBottom: 12 }}>{L(`${faelligGesamt} Zahlenbeziehung${faelligGesamt === 1 ? " ist" : "en sind"} unsicher oder fällig – quer durch alle Bereiche.`, `${faelligGesamt} number fact${faelligGesamt === 1 ? " is" : "s are"} shaky or due – across all areas.`)}</p>
          <Knopf onClick={() => onStart({ art: "runde", modul: "gemischt", stufe: "wiederholen", bloecke: null })} style={{ width: "100%" }}>{L("Gemischt wiederholen", "Review mixed")}</Knopf>
        </section>
      )}

      <Kicker>{L("Wähle deinen Bereich", "Choose your area")}</Kicker>
      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        {[...MODULE, "gemischt"].map((m) => {
          const info = modulInfo(m);
          const z = m === "gemischt" ? g.module.reduce((acc, x) => { for (const s of Object.keys(x.zaehler)) acc[s] = (acc[s] || 0) + x.zaehler[s]; return acc; }, {}) : modulUebersicht(K, m, jetzt).zaehler;
          const gesamt = m === "gemischt" ? g.gesamt : ITEMS[m].length;
          const sicher = (z.sicher || 0) + (z.automatisiert || 0);
          const f = m === "gemischt" ? g.faellig : modulUebersicht(K, m, jetzt).faellig;
          return (
            <button key={m} type="button" onClick={() => onWaehle(m)} aria-label={info.titel}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, textAlign: "left", fontFamily: "inherit", cursor: "pointer", color: C.tinte, ...karte, border: `1px solid ${C.linie}` }}>
              <span aria-hidden="true" style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 15, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.flaggold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: m === "gemischt" ? 18 : 21, fontWeight: 800 }}>{info.zeichen}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "clamp(15px, 4.4vw, 17.5px)", fontWeight: 700, lineHeight: 1.25, marginBottom: 2 }}>{info.titel}</span>
                <span style={{ display: "block", fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.4, marginBottom: 8 }}>{info.kurz}</span>
                <StandBalken zaehler={z} gesamt={gesamt} hoehe={7} />
                <span style={{ display: "block", fontSize: 12, color: C.grau, marginTop: 6 }}>{sicher}/{gesamt} {L("sicher", "secure")}{f > 0 ? ` · ${f} ${L("fällig", "due")}` : ""}</span>
              </span>
            </button>
          );
        })}
      </div>

      <section style={{ ...karte, padding: 18, marginBottom: 18 }}>
        <Kicker>{L("So lernst du hier", "How you learn here")}</Kicker>
        <ol style={{ margin: 0, paddingLeft: 22, listStyle: "decimal", color: C.tinte, fontSize: 14.5, lineHeight: 1.75 }}>
          {["verstehen", "unterstuetzt", "selbst", "schnell", "wiederholen", "challenge"].map((s) => <li key={s}><b>{stufeInfo(s).name}</b> – <span style={{ color: C.grau, fontWeight: 300 }}>{stufeInfo(s).text}</span></li>)}
        </ol>
        <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, marginTop: 10 }}>{L("Tempo ist nie das einzige Maß: Zuerst zählt, dass etwas stimmt und sicher sitzt. Fehler kosten keine Punkte – sie kommen einfach noch einmal dran.", "Speed is never the only measure: first it matters that something is right and secure. Mistakes cost no points – they simply come back.")}</p>
      </section>

      {hinweis.genug && (
        <section style={{ ...karte, padding: 18, marginBottom: 18 }}>
          <Kicker>{L("Hinweis zu deinen Grundlagen", "Note on your foundations")}</Kicker>
          <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.6, marginBottom: 8 }}>
            {L("Diese Zahlenbeziehungen waren im Training bisher mehrfach falsch:", "These number facts have been wrong several times in training so far:")}{" "}
            {hinweis.treffer.slice(0, 6).map((t) => `${itemText(t.key)} (${RICHTUNG_NAME(t.richtung)})`).join(", ")}
          </p>
          <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.55 }}>{L("Das ist nur ein Hinweis auf deinen Trainingsstand – keine Diagnose, warum eine Aufgabe in einem anderen Thema schiefgeht.", "This is only a note on your training status – not a diagnosis of why a problem goes wrong in another topic.")}</p>
        </section>
      )}

      <section style={{ ...karte, padding: 18 }}>
        <Kicker>{L("Zusammen mit Pen & Paper", "Together with Pen & Paper")}</Kicker>
        <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.65, marginBottom: 12 }}>{L("Head & Numbers trainiert den sicheren Abruf von Zahlen im Kopf. Pen & Paper trainiert die saubere schriftliche Darstellung deiner Lösungswege. Beide ergänzen sich.", "Head & Numbers trains secure recall of numbers in your head. Pen & Paper trains the clean written presentation of your solution paths. They complement each other.")}</p>
        <Knopf haupt={false} onClick={() => gehe({ ansicht: "penpaperkurs" })}>{L("Zum Pen-&-Paper-Kurs", "To the Pen & Paper course")}</Knopf>
      </section>
    </div>
  );
}

/* ======================================================================
   SEITE – Navigation innerhalb von Head & Numbers
   ====================================================================== */
export function HeadNumbersSeite({ gehe, start = null }) {
  const K = useKopf();
  const [ansicht, setAnsicht] = useState(start && modulInfo(start) ? { typ: "bereich", modul: start } : { typ: "start" });
  const [zaehler, setZaehler] = useState(0);
  const oben = () => { try { window.scrollTo(0, 0); } catch (e) { /* egal */ } };
  const zu = (a) => { setAnsicht(a); oben(); };
  const bereich = (m) => zu({ typ: "bereich", modul: m });
  const en = englisch();

  const starten = (cfg) => {
    if (cfg.art === "verstehen") return zu({ typ: "verstehen", modul: cfg.modul });
    if (cfg.art === "zuordnung") return zu({ typ: "zuordnung", modul: cfg.modul, bloecke: cfg.bloecke });
    if (cfg.art === "memory") return zu({ typ: "memory", modul: cfg.modul, bloecke: cfg.bloecke });
    if (cfg.art === "muster") {
      return zu({ typ: "runde", modul: cfg.modul, stufe: "verstehen", aufgaben: [1, 2, 3].map(() => musterAufgabe("q-diff", { en })), cfg });
    }
    const aufgaben = baueRunde(K, { modul: cfg.modul, stufe: cfg.stufe, bloecke: cfg.bloecke, en });
    if (!aufgaben.length) return zu({ typ: "leer", modul: cfg.modul, stufe: cfg.stufe });
    setZaehler((z) => z + 1);
    return zu({ typ: "runde", modul: cfg.modul, stufe: cfg.stufe, aufgaben, cfg });
  };

  const wrap = (kinder) => <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 18 }}>{kinder}</div>;

  if (ansicht.typ === "start") return wrap(<StartSeite onWaehle={bereich} onStart={starten} gehe={gehe} />);
  if (ansicht.typ === "bereich") return wrap(<BereichSeite modul={ansicht.modul} onZurueck={() => zu({ typ: "start" })} onStart={starten} gehe={gehe} />);
  if (ansicht.typ === "verstehen") {
    return wrap(<Verstehen modul={ansicht.modul} onZurueck={() => bereich(ansicht.modul)}
      onUeben={() => starten({ art: "runde", modul: ansicht.modul, stufe: "unterstuetzt", bloecke: null })}
      onMuster={() => starten({ art: "muster", modul: ansicht.modul })} />);
  }
  if (ansicht.typ === "zuordnung") return wrap(<Zuordnung modul={ansicht.modul} bloecke={ansicht.bloecke} onZurueck={() => bereich(ansicht.modul)} />);
  if (ansicht.typ === "memory") return wrap(<Memory modul={ansicht.modul} bloecke={ansicht.bloecke} onZurueck={() => bereich(ansicht.modul)} />);
  if (ansicht.typ === "leer") {
    return wrap(
      <div>
        <Zurueck onClick={() => bereich(ansicht.modul)}>{modulInfo(ansicht.modul).titel}</Zurueck>
        <div style={{ ...karte, padding: 22 }}>
          <H2 style={{ fontSize: 21 }}>{L("Gerade ist nichts zu wiederholen", "Nothing to review right now")}</H2>
          <Absatz>{L("Nichts ist unsicher oder fällig – das ist ein gutes Zeichen. Übe etwas Neues oder spiele eine gemischte Runde.", "Nothing is shaky or due – a good sign. Practise something new or play a mixed round.")}</Absatz>
          <div style={{ display: "grid", gap: 10 }}>
            <Knopf onClick={() => starten({ art: "runde", modul: ansicht.modul, stufe: ansicht.modul === "gemischt" ? "challenge" : "selbst", bloecke: null })}>{L("Eine Runde üben", "Practise a round")}</Knopf>
            <Knopf haupt={false} onClick={() => bereich(ansicht.modul)}>{L("Zurück zur Übersicht", "Back to overview")}</Knopf>
          </div>
        </div>
      </div>,
    );
  }
  /* Runde */
  const { modul, stufe, aufgaben, cfg } = ansicht;
  return wrap(
    <div>
      <Zurueck onClick={() => bereich(modul)}>{modulInfo(modul).titel} · {stufeInfo(stufe).name}</Zurueck>
      <Runde key={`${modul}-${stufe}-${zaehler}-${aufgaben[0] && aufgaben[0].id}`} aufgaben={aufgaben} modul={modul} stufe={stufe}
        onZurueck={() => bereich(modul)}
        nochmalText={stufe === "verstehen" ? L("Zurück zum Verstehen", "Back to understanding") : null}
        onNochmal={() => (stufe === "verstehen" ? zu({ typ: "verstehen", modul }) : starten({ ...cfg, art: "runde" }))} />
    </div>,
  );
}
