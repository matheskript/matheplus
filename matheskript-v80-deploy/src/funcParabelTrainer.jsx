/* ============================================================
   Parabel-Trainer – eigenständiges Werkzeug wie der Ableitungstrainer
   Kopf: links Entdecken | Training, Stufe und Würfel,
         rechts der blaue Kasten „Parabeln üben“ mit der Themenwahl
         (Kern: Normalform, Scheitelform, Nullstellen;
          Fortgeschritten: Brennpunkt, Schnittpunkte)
   Darunter die Aufgabentypen als Chips und die Trainingskarte:
   Graph und Aufgabe auf einem Bildschirm, Teile gehen nacheinander auf,
   Runden zu 10 Aufgaben mit Serie und Punkten, Zielgraph-Spiel.
   Die Aufgabenlogik steht in parabelTrainer.js (Node-getestet).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { MS } from "./mathText.jsx";
import { buchen } from "./buchung.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { hilfeKontext, zw } from "./ui2.jsx";
import { POP_CSS, PopupWahl } from "./funcRegelwerk.jsx";
import { BrennpunktSeite, NullstellenSeite, ScheitelErkunden } from "./funcParabeln.jsx";
import { ParabelSchnitt } from "./funcParabelSchnitt.jsx";
import { fokus, springe } from "./sprung.js";
import {
  THEMEN, TYPEN, loesungText, neueAufgabe, pruefeTeil, reglerKurve, reglerTex, themaName, typName,
} from "./parabelTrainer.js";
import { Arbeitsflaeche, FeinKarte, Kicker, useDesktop } from "./arbeitsflaeche.jsx";
import { kompaktSpalteCss } from "./trainerDesktop.jsx";

const SPEICHER = "matheplus-parabeltrainer";
const RUNDE = 10;
const lesen = () => { try { return JSON.parse(localStorage.getItem(SPEICHER)) || {}; } catch (e) { return {}; } };
const schreiben = (o) => { try { localStorage.setItem(SPEICHER, JSON.stringify(o)); } catch (e) { /* privat */ } };
const wertAn = (k, x) => k.a * x * x + k.b * x + k.c;
const minus = (s) => String(s).replace(/-/g, "−");
const zahlText = (v) => minus(String(Math.round(v * 100) / 100).replace(".", zw(",", ".")));

/* ============================================================
   Schaubild: x von −10 bis 10, gleiche Einheit auf beiden Achsen.
   Die Höhe kommt vom Platz (CSS), der y-Ausschnitt richtet sich
   nach den wichtigen Punkten (Scheitel, y-Achsenabschnitt, Marken).
   ============================================================ */
function TrainerBild({ kurven = [], punkte = [], verdeckt = false, mini = false, wichtig = [], klasse = "", beschr }) {
  const box = useRef(null);
  const [mass, setMass] = useState({ w: 340, h: 220 });
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const lies = () => { const r = el.getBoundingClientRect(); if (r.width > 20 && r.height > 20) setMass({ w: Math.round(r.width), h: Math.round(r.height) }); };
    lies();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(lies); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { w, h } = mass;
  const XR = mini ? 8 : 10;
  const E = w / (2 * XR);
  const spanne = h / E;
  /* y-Mitte: alle wichtigen y-Werte und die x-Achse möglichst im Bild */
  const ys = [0, ...wichtig];
  let lo = Math.min(...ys), hi = Math.max(...ys);
  const mitte = (lo + hi) / 2;
  const y0 = mitte - spanne / 2, y1 = mitte + spanne / 2;
  const sx = (x) => (x + XR) * E, sy = (y) => (y1 - y) * E;
  const pfad = (k) => {
    let d = "", an = false;
    for (let i = 0; i <= 240; i++) {
      const x = -XR + (2 * XR * i) / 240, y = wertAn(k, x);
      if (y < y0 - 40 || y > y1 + 40) { an = false; continue; }
      d += `${an ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`; an = true;
    }
    return d;
  };
  /* Beschriftung dorthin, wo die Kurve nicht verläuft */
  const unten = () => kurven.length > 0 && kurven[kurven.length - 1].k.a > 0;    // nach oben geöffnet: Platz liegt unter dem Punkt
  const ticksX = Array.from({ length: 2 * XR + 1 }, (_, i) => i - XR);
  const ticksY = []; for (let v = Math.ceil(y0); v <= Math.floor(y1); v++) ticksY.push(v);
  const schritt = mini ? 99 : 2;
  return (
    <div ref={box} className={`pt-bild ${klasse}`} style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label={beschr || zw("Schaubild der Parabel", "Graph of the parabola")} style={{ display: "block", width: "100%", height: "100%" }}>
        {ticksX.map((v) => <line key={`x${v}`} x1={sx(v)} x2={sx(v)} y1={0} y2={h} stroke={v % 5 === 0 ? "#DCE2EE" : "#EEF1F7"} strokeWidth="1" />)}
        {ticksY.map((v) => <line key={`y${v}`} y1={sy(v)} y2={sy(v)} x1={0} x2={w} stroke={v % 5 === 0 ? "#DCE2EE" : "#EEF1F7"} strokeWidth="1" />)}
        {y0 < 0 && y1 > 0 && <line x1={0} x2={w} y1={sy(0)} y2={sy(0)} stroke={C.tinte} strokeWidth="1.3" />}
        <line x1={sx(0)} x2={sx(0)} y1={0} y2={h} stroke={C.tinte} strokeWidth="1.3" />
        {!mini && ticksX.filter((v) => v && v % schritt === 0).map((v) => (
          <text key={`tx${v}`} x={sx(v)} y={Math.min(h - 3, Math.max(11, sy(0) + 12))} fontSize="9.5" textAnchor="middle" fill={C.grau}>{minus(v)}</text>
        ))}
        {!mini && ticksY.filter((v) => v && v % schritt === 0).map((v) => (
          <text key={`ty${v}`} x={sx(0) - 5} y={sy(v) + 3.5} fontSize="9.5" textAnchor="end" fill={C.grau}>{minus(v)}</text>
        ))}
        {!verdeckt && kurven.map((k, i) => (
          <path key={`${i}-${k.k.a}-${k.k.b}-${k.k.c}`} className={k.malen ? "pt-malen" : undefined} pathLength={k.malen ? 1 : undefined} d={pfad(k.k)} fill="none"
            stroke={k.farbe || C.see} strokeWidth={k.breite || (mini ? 2.4 : 2.8)} strokeDasharray={k.gestrichelt ? "7 6" : undefined} strokeLinecap="round" strokeLinejoin="round" opacity={k.blass ? 0.55 : 1} />
        ))}
        {!verdeckt && punkte.map((p, i) => (
          <g key={`p${i}`}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={5} fill={p.hohl ? C.weiss : p.farbe || C.tinte} stroke={p.hohl ? p.farbe || C.tinte : "#fff"} strokeWidth={p.hohl ? 2.2 : 1.6} />
            {p.name && <text x={sx(p.x) + 9} y={sy(p.y) + (unten() ? 18 : -9)} textAnchor="start" fontSize="12.5" fontWeight="800" fill={p.farbe || C.tinte} stroke="#fff" strokeWidth="4" paintOrder="stroke">{p.name}</text>}
          </g>
        ))}
      </svg>
      {verdeckt && (
        <div className="pt-verdeckt" aria-hidden="true"><span>?</span><small>{zw("Der Graph erscheint, sobald du es gelöst hast.", "The graph appears once you have solved it.")}</small></div>
      )}
    </div>
  );
}

/* ---------- Eingaben ---------- */
function ZahlZeile({ teil, werte, setWerte, onEnter, aus, status }) {
  const ref0 = useRef(null);
  useEffect(() => { if (!aus && ref0.current && window.matchMedia && window.matchMedia("(pointer: fine)").matches) fokus(ref0.current, "parabel-fokus"); }, [teil, aus]);
  const feld = (f, i) => (
    <label key={i} className="pt-feld" data-status={status || undefined}>
      {f.name && <span className="pt-feldname"><M t={f.name} /> =</span>}
      <MatheFeld ref={i === 0 ? ref0 : undefined} modus="bruch" value={werte[i] ?? ""} disabled={aus}
        onChange={(e) => { const n = [...werte]; n[i] = e.target.value; setWerte(n); }}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onEnter(); } }}
        aria-label={`${f.name || zw("Wert", "value")} ${zw("eingeben", "enter")}`} placeholder="?" />
    </label>
  );
  if (teil.punkt) {
    return (
      <div className="pt-felder pt-punkt">
        <span className="pt-punktname">{teil.punkt}(</span>{feld(teil.felder[0], 0)}<span className="pt-punktname">|</span>{feld(teil.felder[1], 1)}<span className="pt-punktname">)</span>
      </div>
    );
  }
  return <div className="pt-felder">{teil.felder.map(feld)}</div>;
}

function WahlKnoepfe({ teil, gewaehlt, falsch, onWahl, aus }) {
  return (
    <div className="pt-wahl" role="group" aria-label={zw("Antwort wählen", "Choose an answer")}>
      {teil.optionen.map((o) => (
        <button key={o.id} type="button" disabled={aus} onClick={() => onWahl(o.id)}
          data-zustand={gewaehlt === o.id ? (falsch.includes(o.id) ? "falsch" : "richtig") : falsch.includes(o.id) ? "falsch" : undefined}>
          {o.tex ? <M t={o.tex} /> : o.text}
        </button>
      ))}
    </div>
  );
}

function GraphKacheln({ teil, gewaehlt, falsch, onWahl, aus, geloest }) {
  return (
    <div className="pt-kacheln" role="group" aria-label={zw("Graph wählen", "Choose a graph")}>
      {teil.optionen.map((o, i) => {
        const zustand = geloest && o.id === teil.richtig ? "richtig" : falsch.includes(o.id) ? "falsch" : gewaehlt === o.id ? "gewaehlt" : undefined;
        return (
          <button key={o.id} type="button" disabled={aus} onClick={() => onWahl(o.id)} data-zustand={zustand} aria-label={`${zw("Graph", "Graph")} ${"ABCD"[i]}`}>
            <span className="pt-kachelname">{"ABCD"[i]}</span>
            <TrainerBild mini kurven={[{ k: o.kurve, farbe: zustand === "falsch" ? C.hellgrau : C.see }]} wichtig={[o.kurve.c, wertAn(o.kurve, -o.kurve.b / (2 * o.kurve.a))]} klasse="pt-minibild" />
          </button>
        );
      })}
    </div>
  );
}

/* Zielgraph: Parameter mit − / +, Live-Formel und Wärme-Anzeige */
function ReglerTeil({ teil, werte, setWerte, aus }) {
  const k = reglerKurve(teil.form, werte), z = reglerKurve(teil.form, teil.ziel);
  let summe = 0; for (let x = -6; x <= 6; x += 0.5) summe += Math.min(8, Math.abs(wertAn(k, x) - wertAn(z, x)));
  const naehe = Math.max(0, Math.round(100 - (summe / 25) * 12.5));
  const farbe = { a: C.gruen, b: C.tuerkis || C.see, c: C.smaragd, d: C.see, e: C.smaragd };
  return (
    <div className="pt-regler">
      <div className="pt-reglerformel"><M t={reglerTex(teil.form, werte)} /></div>
      <div className="pt-waerme" aria-label={`${zw("Nähe zum Ziel", "Closeness to target")}: ${naehe} %`}>
        <span style={{ width: `${naehe}%`, background: naehe > 92 ? C.smaragd : naehe > 60 ? C.flaggold : C.granaHell }} />
        <em>{naehe >= 100 ? zw("Treffer!", "Hit!") : naehe > 85 ? zw("Ganz heiß!", "Very hot!") : naehe > 60 ? zw("Warm", "Warm") : zw("Kalt", "Cold")}</em>
      </div>
      <div className="pt-stepper">
        {teil.params.map((p) => (
          <div key={p} className="pt-step" style={{ "--f": farbe[p] }}>
            <span><i>{p}</i> = {zahlText(werte[p])}</span>
            <div>
              <button type="button" disabled={aus} aria-label={`${p} −`} onClick={() => setWerte({ ...werte, [p]: Math.round((werte[p] - teil.schritt[p]) * 2) / 2 || (p === "a" ? -teil.schritt[p] : 0) })}>−</button>
              <button type="button" disabled={aus} aria-label={`${p} +`} onClick={() => setWerte({ ...werte, [p]: Math.round((werte[p] + teil.schritt[p]) * 2) / 2 || (p === "a" ? teil.schritt[p] : 0) })}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Training
   ============================================================ */
const leerTeil = (t) => ({ werte: t.art === "zahl" ? t.felder.map(() => "") : t.art === "regler" ? { ...t.start } : null, versuche: 0, falsch: [], text: "", fertig: false, gezeigt: false });

function Training({ thema, typ, stufe, wurf, links = null, desktop = false }) {
  const [aufg, setAufg] = useState(() => neueAufgabe(thema, typ, stufe));
  const [nr, setNr] = useState(0);
  const [teile, setTeile] = useState(() => aufg.teile.map(leerTeil));
  const [runde, setRunde] = useState([]);                // je Aufgabe: "perfekt" | "geschafft" | "gezeigt"
  const [serie, setSerie] = useState(0);
  const [stand, setStand] = useState(0);
  const [weg, setWeg] = useState(false);
  const [plus, setPlus] = useState(null);
  const [auswertung, setAuswertung] = useState(false);
  const erster = useRef(true);

  const neu = (rundeNeu = false) => {
    const a = neueAufgabe(thema, typ, stufe);
    setAufg(a); setNr(0); setTeile(a.teile.map(leerTeil)); setWeg(false); setPlus(null);
    if (rundeNeu) { setRunde([]); setStand(0); setSerie(0); setAuswertung(false); }
  };
  useEffect(() => { if (erster.current) { erster.current = false; return; } neu(true); }, [thema, typ, stufe]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (wurf) neu(false); }, [wurf]);                                                           // eslint-disable-line react-hooks/exhaustive-deps

  const fertig = teile.every((t) => t.fertig);
  const rundeVorbei = auswertung;
  const weiterKlick = () => (runde.length >= RUNDE ? setAuswertung(true) : neu(false));
  const teil = aufg.teile[nr], st = teile[nr];
  const setSt = (patch) => setTeile((alt) => alt.map((t, i) => (i === nr ? { ...t, ...patch } : t)));

  const abschliessen = (neueTeile) => {
    const ergebnis = neueTeile.some((t) => t.gezeigt) ? "gezeigt" : neueTeile.every((t) => t.versuche === 0) ? "perfekt" : "geschafft";
    const p = ergebnis === "perfekt" ? 10 * neueTeile.length + Math.min(serie, 5) * 2 : ergebnis === "geschafft" ? 5 * neueTeile.length : 0;
    setRunde((r) => [...r, ergebnis]);
    setStand((x) => x + p);
    setSerie((s) => (ergebnis === "perfekt" ? s + 1 : 0));
    setPlus(p);
  };

  const gehWeiter = (neueTeile) => {
    if (nr < aufg.teile.length - 1) setNr(nr + 1);
    else abschliessen(neueTeile);
  };

  const pruefen = (eingabe = st.werte) => {
    if (!teil || st.fertig) return;
    const r = pruefeTeil(teil, eingabe);
    if (r.leer && teil.art !== "wahl") { setSt({ text: r.text }); return; }
    if (r.leer) return;
    buchen({ richtig: !!r.ok, gruppe: `parabel-${aufg.typ}`, fehlerart: r.ok ? null : r.fehlerart || "parabel", stufe });
    if (r.ok) {
      const neueTeile = teile.map((t, i) => (i === nr ? { ...t, werte: eingabe, fertig: true, text: "" } : t));
      setTeile(neueTeile);
      gehWeiter(neueTeile);
    } else {
      setSt({ werte: eingabe, versuche: st.versuche + 1, text: r.text, falsch: teil.art === "wahl" ? [...st.falsch, eingabe] : st.falsch });
    }
  };

  const zeigen = () => {
    const l = loesungText(teil);
    const neueTeile = teile.map((t, i) => (i === nr ? { ...t, werte: teil.art === "zahl" ? l : teil.art === "regler" ? { ...teil.ziel } : l, fertig: true, gezeigt: true, text: "" } : t));
    setTeile(neueTeile);
    buchen({ richtig: false, gruppe: `parabel-${aufg.typ}`, fehlerart: "loesung-gezeigt", stufe });
    gehWeiter(neueTeile);
  };

  /* Zielgraph: Treffer wird sofort erkannt */
  useEffect(() => {
    if (teil && teil.art === "regler" && !st.fertig && pruefeTeil(teil, st.werte).ok) {
      const neueTeile = teile.map((t, i) => (i === nr ? { ...t, fertig: true } : t));
      buchen({ richtig: true, gruppe: `parabel-${aufg.typ}`, stufe });
      setTeile(neueTeile); gehWeiter(neueTeile);
    }
  }, [st && st.werte]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* Gelöst: Tastenfeld schließen und nach oben, damit der aufgedeckte Graph im Bild ist */
  useEffect(() => {
    if (!fertig) return;
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) { /* egal */ }
    requestAnimationFrame(() => springe("parabel-geloest", () => window.scrollTo({ top: 0, behavior: "smooth" })));
  }, [fertig]);
  /* Für automatische Prüfungen (wie window.__mmGehe): die aktuelle Aufgabe */
  useEffect(() => { try { window.__ptAufgabe = { aufg, nr }; } catch (e) { /* egal */ } }, [aufg, nr]);

  /* Enter auf der Tastatur: nach dem Lösen weiter */
  useEffect(() => {
    if (!fertig) return undefined;
    const t = (e) => { if (e.key === "Enter" && !(e.target && e.target.tagName === "INPUT")) { e.preventDefault(); if (rundeVorbei) neu(true); else weiterKlick(); } };
    window.addEventListener("keydown", t);
    return () => window.removeEventListener("keydown", t);
  });

  /* ---------- Bild ---------- */
  const b = aufg.bild || {};
  const regler = teil && teil.art === "regler" ? st : aufg.teile[0].art === "regler" ? teile[0] : null;
  const kacheln = aufg.teile[0].art === "wahl" && aufg.teile[0].kacheln && !fertig;
  const kurven = [];
  if (b.ziel) kurven.push({ k: b.ziel, farbe: C.flaggold, gestrichelt: true, breite: 3.2 });
  if (regler) kurven.push({ k: reglerKurve(aufg.teile[0].form, regler.werte), farbe: fertig ? C.smaragd : C.see });
  else if (b.kurve || fertig) kurven.push({ k: aufg.kurve, farbe: C.see, malen: b.zeigen !== true });
  const punkte = (b.punkte || []).map((p) => ({ ...p, farbe: p.name === "S" ? C.gruen : C.tinte }));
  const sichtbar = b.zeigen === true || fertig || regler;
  const k = aufg.kurve, xs = -k.b / (2 * k.a);
  const wichtig = [wertAn(k, xs), ...(aufg.typ === "n-ablesen" ? [k.c] : []), ...punkte.map((p) => p.y)];

  const kontext = hilfeKontext({
    id: aufg.id, aufgabe: `${aufg.frage} ${aufg.formel || ""}`,
    verstehen: aufg.hilfe.verstehen, ansatz: aufg.hilfe.ansatz, regel: aufg.hilfe.regel, pruefen: aufg.hilfe.pruefen,
    regeln: [{ name: zw("Quadratische Funktionen", "Quadratic functions"), bereich: "analysis" }],
    loesung: aufg.loesung.map((l) => `$${l}$`).join("  "),
  });

  const sterne = runde.filter((r) => r === "perfekt").length >= 9 ? 3 : runde.filter((r) => r === "perfekt").length >= 6 ? 2 : runde.filter((r) => r !== "gezeigt").length >= 5 ? 1 : 0;

  /* ---------- Gemeinsame Teile (Handy und Desktop, DESKTOP-STIL.md) ---------- */
  const rundenKopf = (
    <div className="pt-runde">
      <div className="pt-punkte" aria-label={zw(`Aufgabe ${Math.min(runde.length + (fertig ? 0 : 1), RUNDE)} von ${RUNDE}`, `Task ${Math.min(runde.length + (fertig ? 0 : 1), RUNDE)} of ${RUNDE}`)}>
        {Array.from({ length: RUNDE }, (_, i) => <i key={i} data-r={runde[i] || (i === runde.length && !fertig ? "jetzt" : undefined)} />)}
      </div>
      <div className="pt-stand">
        {serie >= 2 && <span className="pt-serie" title={zw("Serie ohne Fehler", "Streak without mistakes")}>🔥 {serie}</span>}
        <span>{stand} {zw("P.", "pts")}</span>
      </div>
    </div>
  );
  const ende = (
    <div className="pt-ende">
      <div className="pt-sterne" aria-label={`${sterne} ${zw("von 3 Sternen", "of 3 stars")}`}>{[0, 1, 2].map((i) => <span key={i} data-an={i < sterne || undefined}>★</span>)}</div>
      <p className="pt-endetitel">{sterne === 3 ? zw("Meisterhaft!", "Masterful!") : sterne === 2 ? zw("Stark gemacht!", "Strong work!") : sterne === 1 ? zw("Runde geschafft!", "Round complete!") : zw("Runde beendet", "Round finished")}</p>
      <p className="pt-endetext">{zw(`${runde.filter((r) => r === "perfekt").length} von ${RUNDE} ohne Fehler · ${stand} Punkte`, `${runde.filter((r) => r === "perfekt").length} of ${RUNDE} without mistakes · ${stand} points`)}</p>
      <button type="button" className="pt-weiter" onClick={() => neu(true)}>{zw("Neue Runde", "New round")} <span aria-hidden="true">↻</span></button>
    </div>
  );
  const formel = aufg.formel && <div className="pt-formel"><M t={aufg.formel} /></div>;
  const bild = kacheln
    ? <GraphKacheln teil={aufg.teile[0]} gewaehlt={st.werte} falsch={st.falsch} onWahl={(id) => pruefen(id)} aus={st.fertig} geloest={fertig} />
    : <TrainerBild kurven={kurven} punkte={sichtbar ? punkte : []} verdeckt={!sichtbar} wichtig={wichtig} klasse={aufg.formel ? "" : "pt-bild-gross"} />;
  const aufgabe = (
    <>
      <p className="pt-frage"><MS s={aufg.frage} /></p>
      {!fertig && (
        <div className="pt-leiste">
          <div className="pt-teile">
            {aufg.teile.length > 1 && aufg.teile.map((t, i) => <span key={i} data-z={teile[i].fertig ? (teile[i].gezeigt ? "gezeigt" : "ok") : i === nr ? "jetzt" : undefined}>{teile[i].fertig ? (teile[i].gezeigt ? "•" : "✓") : i + 1}</span>)}
          </div>
          <div className="pt-hilfen">
            {(st.versuche > 0 || (st.klicks || 0) >= 8) && <button type="button" className="pt-zeigen" onClick={zeigen}>{zw("Lösung zeigen", "Show solution")}</button>}
            <IchHaengeFest kontext={kontext} />
          </div>
        </div>
      )}

      {!fertig && teil && (
        <div className="pt-teil" key={`${aufg.id}-${nr}`}>
          {teil.art !== "regler" && <p className="pt-teilfrage"><MS s={teil.frage} /></p>}
          {teil.art === "zahl" && (
            <div className="pt-eingabe">
              <ZahlZeile teil={teil} werte={st.werte} setWerte={(w) => setSt({ werte: w, text: "" })} onEnter={() => pruefen()} aus={st.fertig} status={st.text && st.versuche ? "falsch" : null} />
              <button type="button" className="pt-pruefen" onClick={() => pruefen()}>{zw("Prüfen", "Check")}</button>
            </div>
          )}
          {teil.art === "wahl" && !teil.kacheln && <WahlKnoepfe teil={teil} gewaehlt={st.werte} falsch={st.falsch} onWahl={(id) => pruefen(id)} aus={st.fertig} />}
          {teil.art === "regler" && <ReglerTeil teil={teil} werte={st.werte} setWerte={(w) => setSt({ werte: w, klicks: (st.klicks || 0) + 1 })} aus={st.fertig} />}
          {st.text && <p className="pt-rueck" role="status"><MS s={st.text} /></p>}
        </div>
      )}

      {fertig && (
        <div className="pt-geschafft">
          <p className="pt-jubel" data-art={runde[runde.length - 1]}>
            {runde[runde.length - 1] === "perfekt" ? zw("Perfekt! ", "Perfect! ") : runde[runde.length - 1] === "geschafft" ? zw("Richtig! ", "Correct! ") : zw("Lösung angesehen. ", "Solution shown. ")}
            {plus ? <b>+{plus}</b> : null}
          </p>
          <button type="button" className="pt-weglink" aria-expanded={weg} onClick={() => setWeg(!weg)}>{weg ? zw("Rechenweg ausblenden", "Hide working") : zw("Rechenweg ansehen", "Show working")}</button>
          {weg && <div className="pt-weg">{aufg.loesung.map((l, i) => <div key={i}><M t={l} /></div>)}</div>}
          <button type="button" className="pt-weiter" onClick={weiterKlick}>
            {runde.length >= RUNDE ? zw("Zur Auswertung", "See results") : zw("Nächste Aufgabe", "Next task")} <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </>
  );

  /* Desktop (ab 840 px): links Modus, Stufe, Thema, Aufgabentyp und die ganze Aufgabe mit allen Eingaben,
     rechts das Schaubild (bzw. die vier Graph-Kacheln) groß in echten Pixeln */
  if (desktop) {
    return (
      <Arbeitsflaeche linksBreite={352}
        links={<>
          {links}
          <div className="pt-karte" data-pt-aufgabe>
            {rundenKopf}
            {rundeVorbei ? ende : <div className="pt-rechts">{formel}{aufgabe}</div>}
          </div>
        </>}
        rechts={<div className="pt-desk-bild" data-kacheln={kacheln || undefined}>{bild}</div>} />
    );
  }

  return (
    <div className="pt-karte">
      {/* Kopfzeile der Runde */}
      {rundenKopf}

      {rundeVorbei ? ende : (
        <div className="pt-raster" data-kacheln={kacheln || undefined}>
          {/* Links (Handy: oben): Formel und Graph */}
          <div className="pt-links">
            {formel}
            {bild}
          </div>

          {/* Rechts (Handy: unten): Aufgabe */}
          <div className="pt-rechts">
            {aufgabe}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Seite
   ============================================================ */
export function ParabelTrainer() {
  const gemerkt = useMemo(lesen, []);
  const [thema, setThema] = useState(THEMEN.some((t) => t.id === gemerkt.thema) ? gemerkt.thema : "normal");
  const [modus, setModus] = useState(gemerkt.modus === "entdecken" ? "entdecken" : "training");
  const [stufe, setStufe] = useState([1, 2, 3].includes(gemerkt.stufe) ? gemerkt.stufe : 1);
  const [typ, setTyp] = useState(gemerkt.typ || "mix");
  const [wurf, setWurf] = useState(0);
  const kern = THEMEN.find((t) => t.id === thema).kern;
  const typen = TYPEN[thema] || [];
  const typOk = typ === "mix" || typen.some((t) => t.id === typ) ? typ : "mix";
  useEffect(() => { schreiben({ thema, modus, stufe, typ: typOk }); }, [thema, modus, stufe, typOk]);

  const festhalten = (fn) => {
    const y = window.scrollY; fn();
    const z = () => window.scrollTo(0, y);   // sprung-frei: hält die Position fest
    requestAnimationFrame(() => { z(); requestAnimationFrame(z); });
  };
  const themaWahl = (id) => { setThema(id); setTyp("mix"); springe("parabel-thema", () => window.scrollTo(0, 0)); };
  const optionen = THEMEN.map((t) => ({ id: t.id, name: t.kern ? themaName(t) : `${themaName(t)} · ${zw("Extra", "Extra")}` }));

  const desktop = useDesktop();
  const modusSeg = (
    <div className="pt-seg" role="group" aria-label={zw("Modus", "Mode")} data-aus={!kern || undefined}>
      {[["entdecken", zw("Entdecken", "Explore")], ["training", zw("Trainieren", "Train")]].map(([id, name]) => (
        <button key={id} type="button" aria-pressed={kern ? modus === id : id === "entdecken"} disabled={!kern} onClick={() => festhalten(() => setModus(id))}>{name}</button>
      ))}
    </div>
  );
  const stufeWahl = (
    <PopupWahl className={`pt-stufe${kern && modus === "training" ? "" : " aus"}`} wert={stufe} label={zw("Stufe wählen", "Choose level")}
      optionen={[1, 2, 3].map((s) => ({ id: s, name: `${zw("Stufe", "Level")} ${s}` }))} kopf={(o) => (o ? o.name : "")}
      onWaehle={(s) => festhalten(() => setStufe(s))} />
  );
  const wuerfel = (
    <button type="button" className="pt-wuerfel" aria-label={zw("Neue Aufgabe würfeln", "Roll a new task")} title={zw("Neue Aufgabe", "New task")}
      disabled={!(kern && modus === "training")} onClick={() => festhalten(() => setWurf((w) => w + 1))}><span aria-hidden="true">🎲</span></button>
  );
  const themaBox = (rechts) => (
    <div className="pt-thema">
      <span>{zw("Parabeln üben", "Practise parabolas")}</span>
      <PopupWahl className="pt-themamenue" knopfClass="pt-themaknopf" rechts={rechts} wert={thema} label={zw("Was möchtest du üben?", "What do you want to practise?")}
        optionen={optionen} onWaehle={themaWahl} />
    </div>
  );
  const training = kern && modus === "training";
  const typChips = training && (
    <div className="pt-chipwrap">
      <div className="pt-chips" role="group" aria-label={zw("Aufgabentyp", "Task type")} data-aufgabentyp>
        {[{ id: "mix", name: zw("🔀 Gemischt", "🔀 Mixed") }, ...typen.map((t) => ({ id: t.id, name: typName(t) }))].map((t) => (
          <button key={t.id} type="button" className="pt-chip" aria-pressed={typOk === t.id} onClick={() => festhalten(() => setTyp(t.id))}>{t.name}</button>
        ))}
      </div>
    </div>
  );
  const trainer = training && <Training key={`${thema}`} thema={thema} typ={typOk} stufe={stufe} wurf={wurf} />;

  /* ---------- Desktop: Einstellungen links, Aufgabe bzw. Schaubild rechts (DESKTOP-STIL.md) ---------- */
  if (desktop) {
    const kopf = (
      <div className="pt-kopf">
        {themaBox(false)}
        <FeinKarte>
          <Kicker>{zw("Modus", "Mode")}</Kicker>
          {modusSeg}
          {training && <>
            <Kicker style={{ marginTop: 14 }}>{zw("Stufe", "Level")}</Kicker>
            <div className="pt-reihe">{stufeWahl}{wuerfel}</div>
          </>}
        </FeinKarte>
        {training && <FeinKarte><Kicker>{zw("Aufgabentyp", "Task type")}</Kicker>{typChips}</FeinKarte>}
      </div>
    );
    /* Im Training stehen links auch Aufgabe und Eingaben – deshalb Modus, Stufe und Aufgabentyp in EINER kompakten Karte,
       damit die Aufgabe ohne Scrollen im Bild ist */
    const kopfTraining = (
      <div className="pt-kopf">
        {themaBox(false)}
        <FeinKarte className="pt-einst">
          {modusSeg}
          <div className="pt-reihe">{stufeWahl}{wuerfel}</div>
          {typChips}
        </FeinKarte>
      </div>
    );
    return (
      <div className="pt-seite pt-desk" data-pt="breit">
        <style>{POP_CSS}</style>
        <style>{CSS}</style>
        <style>{PT_DESK_CSS}</style>
        {/* Training: links Kopf (Thema, Modus, Stufe, Aufgabentyp) und die ganze Aufgabe mit allen Eingaben, rechts das Schaubild */}
        {training && <Training key={`${thema}`} thema={thema} typ={typOk} stufe={stufe} wurf={wurf} desktop links={kopfTraining} />}
        {kern && modus === "entdecken" && (
          <div className="pt-entdecken">{thema === "null" ? <NullstellenSeite kopf={kopf} /> : <ScheitelErkunden kopf={kopf} />}</div>
        )}
        {!kern && <div className="pt-entdecken">{thema === "brenn" ? <BrennpunktSeite kopf={kopf} /> : <ParabelSchnitt kopf={kopf} />}</div>}
      </div>
    );
  }

  return (
    <div className="pt-seite">
      <style>{POP_CSS}</style>
      <style>{CSS}</style>
      <div className="pt-innen">
        <div className="pt-kopf">
          <div className="pt-kopflinks">
            {modusSeg}
            <div className="pt-reihe">
              {stufeWahl}
              {wuerfel}
            </div>
          </div>
          {themaBox(true)}
        </div>

        {typChips}

        {trainer}
        {kern && modus === "entdecken" && (
          <div className="pt-entdecken">{thema === "null" ? <NullstellenSeite /> : <ScheitelErkunden />}</div>
        )}
        {!kern && <div className="pt-entdecken">{thema === "brenn" ? <BrennpunktSeite /> : <ParabelSchnitt />}</div>}
      </div>
    </div>
  );
}

/* Desktop (ab 840 px): Spalte 783 px, linke Spalte 290 px mit Thema, Modus, Stufe und Aufgabentyp,
   Trainingskarte rechts als eine Spalte (Formel, Schaubild, Aufgabe), Karten mit feinem Rahmen */
const PT_DESK_CSS = kompaktSpalteCss("pt-desk") + `
  .pt-desk .pt-kopf{display:flex;flex-direction:column;gap:12px;margin:0;max-width:none}
  .pt-desk .pt-thema{min-height:84px;box-shadow:none}
  .pt-desk .pt-seg{flex:none;min-height:40px}
  .pt-desk .pt-reihe{flex:none;min-height:40px}
  .pt-desk .pt-chipwrap{margin:0}
  .pt-desk .pt-chipwrap::after{display:none}
  .pt-desk .pt-chips{flex-wrap:wrap;overflow:visible;padding:0;gap:6px;justify-content:flex-start}
  .pt-desk .pt-chip{height:34px;padding:0 13px;font-size:13px}
  .pt-desk .pt-karte{background:#fff;border:1px solid ${C.linie};border-radius:16px;padding:18px 20px;box-shadow:none}
  .pt-desk [data-pt-aufgabe]{padding:16px 18px}
  .pt-desk .pt-einst{display:flex;flex-direction:column;gap:10px;padding:14px 16px}
  .pt-desk .pt-kopf:has(.pt-einst) .pt-thema{min-height:64px;padding:6px}
  .pt-desk-bild{position:sticky;top:76px}
  .pt-desk .pt-desk-bild .pt-bild,.pt-desk .pt-desk-bild .pt-bild-gross{height:clamp(340px,calc(100dvh - 190px),520px);border-radius:16px}
  .pt-desk .pt-kacheln{gap:10px}
  .pt-desk .pt-kacheln .pt-minibild{height:clamp(160px,calc(50dvh - 100px),250px)}
  .pt-desk .pt-entdecken{max-width:none;margin:0}
`;

/* ---------- Aussehen (wie Ableitungstrainer: weiß auf dem Handy, Karte am Desktop) ---------- */
const CSS = `
.pt-seite{background:#fff}[data-trainings-session] .pt-seite{min-height:calc(100dvh - 61px)}
.pt-seite,.pt-seite *{overflow-anchor:none}
.pt-innen{max-width:620px;margin:0 auto;padding:12px 16px 32px}
.pt-kopf{display:grid;grid-template-columns:1.18fr 1fr;gap:8px;align-items:stretch;margin-bottom:10px}
.pt-kopflinks{display:flex;flex-direction:column;gap:8px;min-width:0}
.pt-reihe{display:flex;gap:8px;align-items:stretch;flex:1;min-height:42px}
.pt-seg{display:flex;padding:3px;border-radius:999px;background:#EEF2F8;gap:2px;flex:1;min-height:42px}
.pt-seg button{flex:1;min-width:0;border-radius:999px;border:none;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;background:transparent;color:${C.grau};white-space:nowrap;padding:0 6px}
.pt-seg button[aria-pressed="true"]{background:#fff;color:${C.see};box-shadow:0 1px 6px rgba(15,26,51,0.12)}
.pt-seg[data-aus]{opacity:.45}
.pt-seg button:disabled{cursor:default}
.pt-stufe{flex:1;min-width:0;display:flex}
.pt-stufe .wk-pop-knopf{flex:1;min-width:0;height:auto;min-height:42px;justify-content:space-between;padding:0 12px 0 14px;font-size:14.5px}
.pt-stufe.aus{opacity:.4;pointer-events:none}
.pt-wuerfel{width:46px;flex-shrink:0;padding:0;border-radius:999px;border:none;cursor:pointer;background:${C.flaggold};font-size:22px;line-height:1;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(15,26,51,0.14)}
.pt-wuerfel:disabled{opacity:.4;cursor:default}
.pt-wuerfel:not(:disabled):active{transform:rotate(-20deg) scale(.94)}
.pt-thema{min-width:0;border-radius:18px;background:linear-gradient(155deg,${C.see} 0%,${C.seeTief} 100%);color:#fff;box-shadow:0 4px 12px rgba(0,77,152,0.25);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px;text-align:center}
.pt-thema>span{font-size:15.5px;font-weight:700;line-height:1.2}
.pt-themamenue{max-width:100%}
.pt-thema .pt-themaknopf{height:34px;padding:0 6px 0 10px;gap:6px;border:none;background:transparent;color:${C.goldText};font-size:13.5px;font-weight:600;max-width:100%}
.pt-thema .pt-themaknopf span{overflow:hidden;text-overflow:ellipsis}
.pt-chipwrap{position:relative;margin:0 -16px 10px}
.pt-chips{display:flex;gap:8px;overflow-x:auto;padding:2px 16px 4px;scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;scroll-padding-left:16px}
.pt-chips::-webkit-scrollbar{display:none}
.pt-chipwrap::after{content:"";position:absolute;right:0;top:0;bottom:4px;width:34px;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,0),#fff)}
.pt-chip{flex:0 0 auto;scroll-snap-align:start;height:40px;padding:0 16px;border-radius:999px;font-family:inherit;font-size:14.5px;font-weight:600;cursor:pointer;white-space:nowrap;border:1.5px solid ${C.linie};background:#fff;color:${C.see}}
.pt-chip[aria-pressed="true"]{background:${C.see};border-color:${C.see};color:#fff}
.pt-karte{background:transparent}
.pt-runde{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
.pt-punkte{display:flex;gap:5px;align-items:center}
.pt-punkte i{width:9px;height:9px;border-radius:99px;background:#E3E8F2;display:block;transition:background .3s,transform .3s}
.pt-punkte i[data-r="perfekt"]{background:${C.smaragd}}
.pt-punkte i[data-r="geschafft"]{background:${C.flaggold}}
.pt-punkte i[data-r="gezeigt"]{background:${C.hellgrau}}
.pt-punkte i[data-r="jetzt"]{background:#fff;box-shadow:0 0 0 2px ${C.see};transform:scale(1.15)}
.pt-stand{display:flex;gap:10px;align-items:center;font-size:13px;font-weight:700;color:${C.seeTief};white-space:nowrap}
.pt-serie{color:#B5470B;animation:pt-puls 1.2s ease-in-out infinite}
@keyframes pt-puls{50%{transform:scale(1.12)}}
.pt-raster{display:flex;flex-direction:column;gap:10px}
.pt-links{display:flex;flex-direction:column;gap:8px;min-width:0}
.pt-formel{background:linear-gradient(155deg,${C.see} 0%,${C.seeTief} 100%);color:#fff;border-radius:14px;padding:8px 14px;font-size:20px;font-weight:700;line-height:1.7;overflow-x:auto;white-space:nowrap;text-align:center}
.pt-bild{height:clamp(140px,27dvh,290px);border-radius:14px;border:1px solid ${C.linie};overflow:hidden;background:#fff}
.pt-bild-gross{height:clamp(160px,31dvh,340px)}
.pt-minibild{height:auto;aspect-ratio:4/3;border:none;border-radius:10px}
.pt-verdeckt{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:rgba(248,250,253,0.72);backdrop-filter:blur(1.5px)}
.pt-verdeckt span{font-size:42px;font-weight:800;color:${C.see};opacity:.3;line-height:1}
.pt-verdeckt small{font-size:12px;color:${C.grau};padding:0 20px;text-align:center}
.pt-malen{stroke-dasharray:1;stroke-dashoffset:1;animation:pt-malen 1.1s cubic-bezier(.4,0,.2,1) forwards}
@keyframes pt-malen{to{stroke-dashoffset:0}}
.pt-kacheln{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pt-kacheln button{position:relative;padding:0;border-radius:12px;border:2px solid ${C.linie};background:#fff;cursor:pointer;overflow:hidden;transition:border-color .2s,transform .12s}
.pt-kacheln button:active{transform:scale(.98)}
.pt-kacheln button[data-zustand="falsch"]{border-color:${C.signal};opacity:.6;animation:pt-wackeln .35s}
.pt-kacheln button[data-zustand="richtig"]{border-color:${C.smaragd};box-shadow:0 0 0 3px ${C.smaragd}33}
.pt-kachelname{position:absolute;left:7px;top:5px;font-size:12px;font-weight:800;color:${C.grau};z-index:1}
.pt-kacheln .pt-minibild{height:clamp(96px,17dvh,150px);aspect-ratio:auto}
@keyframes pt-wackeln{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.pt-rechts{min-width:0;display:flex;flex-direction:column;gap:6px}
.pt-frage{font-size:15px;font-weight:700;color:${C.tinte};line-height:1.35;margin:2px 0 0}
.pt-leiste{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:34px}
.pt-teile{display:flex;gap:6px}
.pt-hilfen{display:flex;gap:6px;align-items:center;margin-left:auto}
.pt-teile span{width:24px;height:24px;border-radius:99px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;background:#EEF2F8;color:${C.grau}}
.pt-teile span[data-z="jetzt"]{background:${C.see};color:#fff}
.pt-teile span[data-z="ok"]{background:${C.smaragd};color:#fff}
.pt-teile span[data-z="gezeigt"]{background:${C.hellgrau};color:#fff}
.pt-teil{animation:pt-auf .3s cubic-bezier(.2,.7,.3,1) both}
@keyframes pt-auf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.pt-teilfrage{font-size:14.5px;color:${C.tinte};line-height:1.5;margin:0 0 8px}
.pt-eingabe{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.pt-felder{display:flex;gap:8px;align-items:center;flex:1;min-width:0;flex-wrap:wrap}
.pt-punkt{flex-wrap:nowrap;gap:4px}
.pt-punktname{font-size:20px;font-weight:700;color:${C.gruen}}
.pt-feld{display:flex;align-items:center;gap:6px;min-width:0;flex:1}
.pt-feldname{font-size:16px;font-weight:700;color:${C.tinte};white-space:nowrap}
.pt-feld input{flex:1;min-width:52px;width:100%;height:46px;border-radius:12px;border:1.5px solid ${C.linie};font-family:inherit;font-size:19px;font-weight:700;text-align:center;color:${C.seeTief};outline:none;background:#fff;padding:0 4px}
.pt-feld input:focus{border-color:${C.see};box-shadow:0 0 0 3px rgba(0,77,152,0.15)}
.pt-feld[data-status="falsch"] input{border-color:${C.signal};background:#FBF1EC}
.pt-pruefen{height:46px;padding:0 20px;border-radius:999px;border:none;cursor:pointer;font-family:inherit;font-size:15.5px;font-weight:700;color:${C.seeTief};background:${C.flaggold};box-shadow:0 2px 8px rgba(15,26,51,0.12);flex-shrink:0}
.pt-wahl{display:flex;flex-wrap:wrap;gap:8px}
.pt-wahl button{flex:1 1 auto;min-height:46px;padding:4px 14px;border-radius:14px;border:1.5px solid ${C.linie};background:#fff;color:${C.seeTief};font-family:inherit;font-size:16px;font-weight:700;cursor:pointer;transition:border-color .2s}
.pt-wahl button[data-zustand="falsch"]{border-color:${C.signal};color:${C.hellgrau};animation:pt-wackeln .35s}
.pt-wahl button:hover:not(:disabled){border-color:${C.see}}
.pt-rueck{font-size:14px;color:${C.signal};line-height:1.55;margin:8px 2px 0}
.pt-regler{display:flex;flex-direction:column;gap:8px}
.pt-reglerformel{font-size:19px;font-weight:700;text-align:center;color:${C.seeTief};overflow-x:auto;white-space:nowrap;min-height:32px}
.pt-waerme{position:relative;height:18px;border-radius:99px;background:#EEF2F8;overflow:hidden}
.pt-waerme span{position:absolute;left:0;top:0;bottom:0;border-radius:99px;transition:width .35s,background .35s}
.pt-waerme em{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:11.5px;font-weight:800;color:${C.seeTief};letter-spacing:.04em}
.pt-stepper{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.pt-step{display:flex;flex-direction:column;align-items:stretch;gap:4px;border-radius:14px;padding:6px;background:#F6F8FC;border:1.5px solid color-mix(in srgb,var(--f) 30%,transparent)}
.pt-step span{text-align:center;font-size:16px;font-weight:800;color:var(--f);white-space:nowrap}
.pt-step span i{font-style:italic}
.pt-step div{display:flex;gap:4px}
.pt-step button{flex:1;min-width:0;height:38px;border-radius:10px;border:none;background:color-mix(in srgb,var(--f) 14%,#fff);color:var(--f);font-size:22px;font-weight:800;font-family:inherit;cursor:pointer;touch-action:manipulation}
.pt-step button:active{transform:scale(.95)}
.pt-geschafft{display:flex;flex-direction:column;gap:8px;animation:pt-auf .35s both}
.pt-jubel{font-size:19px;font-weight:800;color:${C.smaragd};margin:4px 0 0}
.pt-jubel[data-art="gezeigt"]{color:${C.grau}}
.pt-jubel b{display:inline-block;margin-left:4px;padding:1px 9px;border-radius:99px;background:${C.flaggold};color:${C.seeTief};font-size:15px;animation:pt-hoch .6s cubic-bezier(.2,.7,.3,1.4) both}
@keyframes pt-hoch{from{transform:translateY(8px) scale(.6);opacity:0}}
.pt-weglink{align-self:flex-start;background:none;border:none;padding:0;cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:700;color:${C.see};text-decoration:underline;text-underline-offset:3px}
.pt-weg{background:${C.sand};border-radius:12px;padding:8px 12px;font-size:15.5px;line-height:1.9;overflow-x:auto;white-space:nowrap}
.pt-weiter{height:52px;border-radius:14px;border:none;cursor:pointer;font-family:inherit;font-size:16.5px;font-weight:700;color:#fff;background:linear-gradient(155deg,${C.see} 0%,${C.seeTief} 100%);display:inline-flex;align-items:center;justify-content:center;gap:8px}
.pt-zeigen{height:34px;padding:0 12px;border-radius:999px;border:1px solid ${C.linie};background:#fff;color:${C.grau};font-size:13px;font-weight:600;font-family:inherit;cursor:pointer}
.pt-ende{text-align:center;padding:26px 8px 10px;animation:pt-auf .4s both}
.pt-sterne{font-size:46px;letter-spacing:6px;color:#E3E8F2}
.pt-sterne span[data-an]{color:${C.flaggold};display:inline-block;animation:pt-hoch .7s cubic-bezier(.2,.7,.3,1.4) both}
.pt-sterne span:nth-child(2){animation-delay:.15s}.pt-sterne span:nth-child(3){animation-delay:.3s}
.pt-endetitel{font-size:24px;font-weight:800;color:${C.seeTief};margin:6px 0 4px}
.pt-endetext{font-size:14.5px;color:${C.grau};margin:0 0 18px}
.pt-ende .pt-weiter{width:100%}
.pt-entdecken{margin-top:4px}
@media (max-width:380px){.pt-seg button{font-size:12.5px}.pt-thema>span{font-size:14.5px}.pt-formel{font-size:18px}.pt-chip{font-size:13.5px;padding:0 13px}}
@media (min-width:601px){
  .pt-seite{background:transparent}
  .pt-chipwrap{margin:0 0 12px}
  .pt-chipwrap::after{display:none}
  .pt-chips{flex-wrap:wrap;overflow:visible;padding:0}
  .pt-karte{background:#fff;border-radius:16px;padding:16px 18px;box-shadow:0 2px 16px rgba(15,26,51,0.07)}
}
@media (min-width:900px){
  .pt-innen{max-width:980px}
  .pt-kopf{max-width:620px;margin:0 auto 12px}
  .pt-chips{justify-content:center}
  .pt-raster{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:20px;align-items:start}
  .pt-bild,.pt-bild-gross{height:clamp(240px,52dvh,420px)}
  .pt-kacheln .pt-minibild{height:clamp(120px,24dvh,190px)}
  .pt-entdecken{max-width:620px;margin:4px auto 0}
}
`;
