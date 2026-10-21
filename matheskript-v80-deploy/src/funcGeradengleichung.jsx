/* ============================================================
   Geradentrainer – Grundlagen | Zwei Punkte | Punkt und Steigung
   (Mittelstufe, Beispielkapitel)

   Kompakt wie der Ableitungstrainer: eine Seite ohne Scrollen.
   · Grundlagen – Gerade = Linie im Koordinatensystem, jeder Punkt erfüllt
               y = m·x + c; Regler für m und c, Anleitung in vier Chips
               (Punkte, c, m, Gleichung) mit wandernder Probe-Zahl.
   · Zwei Punkte – Gerade durch zwei Punkte: Koordinaten antippen (kleines
               Zahlenfeld) oder Punkte im Schaubild ziehen, Würfel für
               Zufallspunkte, Steigungsdreieck; dann m, c und die Gleichung.
   · Punkt und Steigung – Gerade durch Punkt und Steigung: c berechnen, Gleichung.
   Zwei Modi wie im Ableitungstrainer (Rechnen | Trainieren):
   · Rechnen (Automatik): alles steht als Musterlösung da, Punkte und
     Steigung bleiben frei änderbar, Rechenweg und Bild laufen live mit.
   · Trainieren: jeder Schritt selbst eintippen, „Lösung zeigen“ je Schritt.
   Mathematik in geradenLogik.js (getestet). Schaubild immer im goldenen
   Schnitt (Breite : Höhe = φ : 1), gleiche Einheit, Ursprung sichtbar.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { buchen } from "./buchung.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { hilfeKontext, zw } from "./ui2.jsx";
import { springe } from "./sprung.js";
import {
  GRENZE, PHI, achsenWeg, achsenabschnitt, bWert, bewerte, bruch, bruchTex, dreieck, dreieckPm,
  einrasten, fehlerFaelleC, fehlerFaelleM, fenster, geradePQ, gleichungTex, gleichungText,
  leseAntwort, linieImFenster, probeText, steigungWeg, tasteAnwenden, zahlText, zufallPQ, zufallPm,
  zuBild, zuMathe,
} from "./geradenLogik.js";
import { Arbeitsflaeche, BildKarte, FeinKarte, Kicker, Werkzeugleiste, chipStil, toenKarte, useBreite, useDesktop } from "./arbeitsflaeche.jsx";
import { ReglerReihe, SenkrechtRegler, kompaktSpalteCss } from "./trainerDesktop.jsx";

const W0 = 360;
const H0 = Math.round((W0 / PHI) * 10) / 10;   // 222,5 – goldener Schnitt
/* Maße des Schaubilds: Handy wie bisher 360 × 222,5 (skaliert per CSS), Desktop in echten Pixeln (gemessene Breite) */
const MassCtx = React.createContext({ W: W0, H: H0, desk: false });
const useMass = () => useContext(MassCtx);
const GOLD = C.gruen;                          // im Farbschema heißt das Gold „gruen“
const mz = (v) => String(v).replace("-", "−");
const LEER = { eing: "", status: null, hinweis: "", falsch: false, versuche: 0, weiter: false };

/* ---------------------------------------------------------------- Zahlenfeld (klein) */
const POS = { "7": [1, 1], "8": [1, 2], "9": [1, 3], "⌫": [1, 4], "4": [2, 1], "5": [2, 2], "6": [2, 3], "±": [2, 4], "1": [3, 1], "2": [3, 2], "3": [3, 3] };

function ZahlPad({ titel, anzeige, mitBruch, onTaste }) {
  const taste = (inhalt, k, st = {}, label) => (
    <button key={k} type="button" data-ger-pad onClick={() => onTaste(k)} aria-label={label || String(inhalt)}
      style={{ height: st.hoch ? "auto" : 38, borderRadius: 11, fontFamily: "inherit", cursor: "pointer", fontSize: st.klein ? 15 : 19, fontWeight: 700, padding: 0,
        border: `1px solid ${st.art === "ok" ? C.smaragd : st.art === "nav" ? C.seeTief : C.linie}`,
        background: st.art === "ok" ? C.smaragd : st.art === "nav" ? C.seeTief : C.weiss,
        color: st.art === "ok" ? C.weiss : st.art === "nav" ? C.flaggold : C.tinte,
        gridColumn: st.spalte, gridRow: st.zeile, touchAction: "manipulation" }}>{inhalt}</button>
  );
  return createPortal(
    <div data-ger-pad role="dialog" aria-label={zw("Zahlenfeld", "Number pad")}
      style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: "max(8px, env(safe-area-inset-bottom))", zIndex: 60,
        width: "min(318px, calc(100vw - 16px))", background: C.weiss, borderRadius: 18, padding: "8px 10px 10px",
        boxShadow: "0 12px 40px rgba(8,23,59,0.34), 0 0 0 1px rgba(15,26,51,0.06)", fontFamily: "Montserrat, system-ui, sans-serif" }}>
      <style>{`.ger-padtaste:active{filter:brightness(.92)}`}</style>
      <div data-ger-pad style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, padding: "0 4px 6px" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.grau, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{titel}</span>
        <span style={{ fontSize: 19, fontWeight: 800, color: C.see, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{anzeige || " "}</span>
      </div>
      <div data-ger-pad style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(4, 38px)", gap: 6 }}>
        {Object.entries(POS).map(([k, [z, s]]) => taste(k, k, { zeile: z, spalte: s, art: k === "⌫" || k === "±" ? "nav" : "zahl" },
          k === "⌫" ? zw("Löschen", "Delete") : k === "±" ? zw("Vorzeichen wechseln", "Change sign") : undefined))}
        {taste("OK", "OK", { art: "ok", zeile: "3 / span 2", spalte: 4 }, "OK")}
        {taste("0", "0", { zeile: 4, spalte: mitBruch ? "1 / span 2" : "1 / span 3" })}
        {mitBruch && taste("/", "/", { zeile: 4, spalte: 3, art: "nav" }, zw("Bruchstrich", "Fraction bar"))}
      </div>
    </div>,
    document.body,
  );
}

/* Eingabe am Zahlenfeld: ein Feld ist offen, Text wird live übernommen */
function usePad() {
  const [offen, setOffen] = useState(null);   // { id, titel, bruch, max, live(text), ok(text) }
  const [text, setText] = useState("");
  const [frisch, setFrisch] = useState(false);
  const oeffnen = (def, start, istFrisch, el) => {
    setOffen(def); setText(start); setFrisch(istFrisch);
    if (el) setTimeout(() => { try { springe("geraden-pad", () => el.scrollIntoView({ block: "nearest", behavior: "smooth" })); } catch (e) { /* ältere Browser */ } }, 40);
  };
  const schliessen = () => setOffen(null);
  const taste = (k) => {
    if (!offen) return;
    if (k === "OK") { const t = text; const ok = offen.ok; setOffen(null); if (ok) ok(t); return; }
    // Erste Taste nach dem Öffnen: Ziffer ersetzt den Wert, ± dreht sein Vorzeichen, ⌫ leert das Feld
    const basis = frisch ? (k === "±" ? text : "") : text;
    const neu = tasteAnwenden(basis, k, { bruch: !!offen.bruch, maxZiffern: offen.max || 2 });
    setText(neu); setFrisch(false);
    if (offen.live) offen.live(neu);
  };
  useEffect(() => {
    if (!offen) return undefined;
    const aussen = (e) => { if (!(e.target.closest && e.target.closest("[data-ger-pad],[data-ger-feld]"))) setOffen(null); };
    const esc = (e) => { if (e.key === "Escape") setOffen(null); };
    document.addEventListener("pointerdown", aussen);
    window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", aussen); window.removeEventListener("keydown", esc); };
  }, [offen]);
  return { offen, text, oeffnen, schliessen, taste };
}

/* ---------------------------------------------------------------- kleine Bausteine */
function Zahl({ wert, aktiv, buf, onKlick, label }) {
  const t = aktiv && buf !== null ? mz(buf) : mz(wert);
  return (
    <button type="button" data-ger-feld className={`ger-feld${aktiv ? " an" : ""}`} aria-label={label} aria-pressed={aktiv} onClick={onKlick}>{t || " "}</button>
  );
}

function Pille({ x, y, t, farbe = C.see, anker = "middle" }) {
  const { desk } = useMass();
  const fs = desk ? 11.5 : 10.5;
  const w = String(t).length * (desk ? 7.1 : 6.4) + 11;
  const x0 = anker === "start" ? x : anker === "end" ? x - w : x - w / 2;
  return (
    <g pointerEvents="none">
      <rect x={x0} y={y - 9} width={w} height={desk ? 18 : 17} rx="8.5" fill="#fff" fillOpacity="0.93" stroke={`${farbe}66`} />
      <text x={x0 + w / 2} y={y + (desk ? 4.1 : 3.7)} textAnchor="middle" style={{ fontSize: fs, fontWeight: 800, fill: farbe, fontFamily: "inherit" }}>{t}</text>
    </g>
  );
}

/* Schaubild: Gitter, Achsen, Beschriftung; f = Fenster (goldener Schnitt, gleiche Einheit) */
function Schaubild({ f, svgRef, label, kinder }) {
  const { W, H, desk } = useMass();
  const fsT = desk ? 10.5 : 9, fsA = desk ? 12.5 : 11;
  const X = (x) => ((x - f.x0) / (f.x1 - f.x0)) * W;
  const Y = (y) => ((f.y1 - y) / (f.y1 - f.y0)) * H;
  const st = f.schritt;
  const jede = (W / (f.x1 - f.x0)) * st < 20 ? 2 : 1;
  const xs = [], ys = [];
  for (let k = Math.ceil(f.x0 / st - 1e-9); k <= Math.floor(f.x1 / st + 1e-9); k++) xs.push(k);
  for (let k = Math.ceil(f.y0 / st - 1e-9); k <= Math.floor(f.y1 / st + 1e-9); k++) ys.push(k);
  const ax = X(0), ay = Y(0);
  const xLabelY = ay > H - 14 ? ay - 4 : ay + 11;
  const yLabelLinks = ax > 26;
  return (
    <div className="ger-bild">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} style={{ display: "block", width: "100%", height: "100%", userSelect: "none" }}>
        <defs><clipPath id="ger-clip"><rect x="0" y="0" width={W} height={H} rx="12" /></clipPath></defs>
        <rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx="12" fill="#fff" stroke={desk ? "none" : C.linie} />
        <g clipPath="url(#ger-clip)">
          {xs.map((k) => k !== 0 && <line key={`gx${k}`} x1={X(k * st)} y1="0" x2={X(k * st)} y2={H} stroke={C.see} strokeOpacity="0.10" />)}
          {ys.map((k) => k !== 0 && <line key={`gy${k}`} x1="0" y1={Y(k * st)} x2={W} y2={Y(k * st)} stroke={C.see} strokeOpacity="0.10" />)}
          <line x1="0" y1={ay} x2={W} y2={ay} stroke={C.tinte} strokeWidth="1.3" />
          <line x1={ax} y1="0" x2={ax} y2={H} stroke={C.tinte} strokeWidth="1.3" />
          {xs.map((k) => k !== 0 && Math.abs(k) % jede === 0 && <text key={`tx${k}`} x={X(k * st)} y={xLabelY} textAnchor="middle" style={{ fontSize: fsT, fill: C.grau, fontFamily: "inherit" }}>{mz(k * st)}</text>)}
          {ys.map((k) => k !== 0 && <text key={`ty${k}`} x={yLabelLinks ? ax - 4 : ax + 4} y={Y(k * st) + 3} textAnchor={yLabelLinks ? "end" : "start"} style={{ fontSize: fsT, fill: C.grau, fontFamily: "inherit" }}>{mz(k * st)}</text>)}
          <text x={W - 8} y={Math.min(Math.max(ay - 5, 10), H - 4)} textAnchor="end" style={{ fontSize: fsA, fontWeight: 700, fill: C.tinte, fontFamily: "inherit" }}>x</text>
          <text x={Math.min(Math.max(ax + 6, 4), W - 12)} y="12" style={{ fontSize: fsA, fontWeight: 700, fill: C.tinte, fontFamily: "inherit" }}>y</text>
          {kinder({ X, Y })}
        </g>
      </svg>
    </div>
  );
}

/* Ziehbarer Punkt im Schaubild (rastet auf ganze Zahlen ein) */
function Griff({ p, f, farbe, name, svgRef, setzen, start, ende, label }) {
  const { W, H } = useMass();
  const [bx, by] = zuBild(p, f, W, H);
  const ziehen = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    if (!r.width) return;
    setzen(einrasten(zuMathe(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H, f, W, H), f));
  };
  const links = bx > W - 44, oben = by < 24;
  const pfeil = (e) => {
    const d = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (!d) return;
    e.preventDefault();
    setzen(einrasten([p[0] + d[0], p[1] + d[1]], f));
  };
  return (
    <g>
      <circle cx={bx} cy={by} r="6.8" fill={farbe} stroke="#fff" strokeWidth="2" pointerEvents="none" />
      <text x={bx + (links ? -10 : 10)} y={by + (oben ? 17 : -9)} textAnchor={links ? "end" : "start"} pointerEvents="none"
        style={{ fontSize: 13, fontWeight: 800, fill: farbe, fontFamily: "inherit" }}>{name}</text>
      <circle className="ger-griff" cx={bx} cy={by} r="20" fill="transparent" tabIndex={0} role="button" aria-label={label}
        style={{ cursor: "grab", touchAction: "none", outline: "none" }}
        onPointerDown={(e) => { e.preventDefault(); try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) { /* egal */ } start(); }}
        onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) ziehen(e); }}
        onPointerUp={(e) => { try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (x) { /* egal */ } ende(); }}
        onPointerCancel={ende} onKeyDown={pfeil} />
    </g>
  );
}

/* Zeile mit Antwortfeld: m = (y_Q − y_P)/(x_Q − x_P) = [ ? ] */
const antwortTex = (t) => {
  if (!t) return null;
  const neg = t.startsWith("-"), rest = neg ? t.slice(1) : t;
  if (!rest.includes("/")) return `${neg ? "−" : ""}${rest}`;
  const [a, b] = rest.split("/");
  return `${neg ? "−" : ""}\\frac{${a || "▯"}}{${b || "▯"}}`;
};

/* Ein Rechenschritt: gesperrt → offen (Eingabe) → gezeigt/richtig (zusammengeklappt) */
function Schritt({ nr, titel, label, formel, st, aktiv, gesperrt, soll, weg, padAktiv, onFeld, onZeigen, onWeiter }) {
  const fertig = st.status === "richtig" || (st.status === "gezeigt" && st.weiter);
  if (fertig) {
    return (
      <div className="ger-karte fertig" data-ger-schritt={label}>
        <span className="ger-nr ok" aria-hidden="true">✓</span>
        <span className="ger-zus"><M t={`${label} = ${bruchTex(soll)}`} /></span>
        {st.status === "gezeigt" && <span className="ger-klein">{zw("Lösung gezeigt", "shown")}</span>}
      </div>
    );
  }
  if (gesperrt || !aktiv) {
    return (
      <div className="ger-karte gesperrt" data-ger-schritt={label}>
        <span className="ger-nr">{nr}</span><span className="ger-karte-titel">{titel}</span>
      </div>
    );
  }
  if (st.status === "gezeigt") {
    return (
      <div className="ger-karte aktiv" data-ger-schritt={label}>
        <div className="ger-kopf"><span className="ger-nr">{nr}</span><span className="ger-karte-titel">{titel}</span></div>
        <div className="ger-weg" data-ger-weg><M t={weg} /></div>
        <button type="button" className="ger-weiter" onClick={onWeiter}>{zw("Weiter", "Next")} <span aria-hidden="true">›</span></button>
      </div>
    );
  }
  const tex = antwortTex(st.eing);
  return (
    <div className="ger-karte aktiv" data-ger-schritt={label}>
      <div className="ger-kopf">
        <span className="ger-nr">{nr}</span><span className="ger-karte-titel">{titel}</span>
        <button type="button" className="ger-zeig" onClick={onZeigen}>{zw("Lösung zeigen", "Show solution")}</button>
      </div>
      <div className="ger-rechnung">
        <span className="ger-label"><M t={label} /> =</span>
        <span className="ger-hint" aria-hidden="true"><M t={formel} /></span>
        <span className="ger-label">=</span>
        <button type="button" data-ger-feld data-ger-antwort={label} className={`ger-antwort${padAktiv ? " an" : ""}${st.falsch ? " falsch" : ""}`}
          aria-label={zw(`Antwort für ${label} eingeben`, `Enter your answer for ${label}`)} onClick={onFeld}>
          {tex ? <M t={tex} /> : <span className="ger-platz">?</span>}
        </button>
      </div>
      {st.hinweis && <p className="ger-fehler" role="status">{st.hinweis}</p>}
    </div>
  );
}

/* Rechnen | Trainieren – dieselben Wörter wie im Ableitungstrainer */
function ModusWahl({ modus, setModus }) {
  return (
    <div className="ger-seg ger-modus" role="group" aria-label={zw("Modus", "Mode")}>
      {[["auto", zw("Rechnen", "Calculate")], ["training", zw("Trainieren", "Practise")]].map(([id, name]) => (
        <button key={id} type="button" data-ger-modus={id} aria-pressed={modus === id} onClick={() => setModus(id)}>{name}</button>
      ))}
    </div>
  );
}

/* Rechnen-Modus: ein Schritt als fertige Musterlösung */
function AutoSchritt({ nr, titel, label, weg }) {
  return (
    <div className="ger-karte ger-auto" data-ger-schritt={label} data-ger-auto role="group" aria-label={titel} title={titel}>
      <span className="ger-nr ok" aria-hidden="true">{nr}</span>
      <div className="ger-weg" data-ger-weg><M t={weg} /></div>
    </div>
  );
}

function Ergebnis({ m, c, onNeu, auto }) {
  return (
    <div className="ger-ergebnis" data-ger-ergebnis>
      <span className="ger-nr ok" aria-hidden="true">✓</span>
      <span className="ger-gleichung"><M t={gleichungTex(m, c)} /></span>
      <button type="button" className="ger-neu" onClick={onNeu}><span aria-hidden="true">🎲</span> {auto ? zw("Neues Beispiel", "New example") : zw("Neue Aufgabe", "New task")}</button>
    </div>
  );
}

/* ---------------------------------------------------------------- Hilfe („Ich hänge fest“) */
function hilfePQ(P, Q, g, istPm, m) {
  const loesung = istPm || !g.senkrecht ? `$${gleichungTex(istPm ? m : g.m, istPm ? achsenabschnitt(P, m) : g.c)}$` : null;
  return hilfeKontext({
    id: istPm ? `gerade-pm-${P}-${bruchTex(m)}` : `gerade-pq-${P}-${Q}`,
    aufgabe: "Geradengleichung aufstellen Steigung y-Achsenabschnitt zwei Punkte Punkt-Steigung",
    verstehen: [
      zw("Gesucht ist die Gleichung y = m·x + c. Zwei Zahlen legen die Gerade fest: die Steigung m und der y-Achsenabschnitt c.", "You need the equation y = m·x + c. Two numbers fix the line: the slope m and the y-intercept c."),
      zw("m sagt, wie weit die Gerade nach oben (oder unten) geht, wenn du 1 nach rechts gehst. c ist die Höhe, in der sie die y-Achse schneidet.", "m says how far the line goes up (or down) when you go 1 to the right. c is the height where it crosses the y-axis."),
      istPm ? zw("Die Steigung ist hier schon gegeben. Du brauchst nur noch c.", "The slope is given here. You only need c.") : zw("Erst m, dann c – die Gleichung ergibt sich am Ende von selbst.", "First m, then c – the equation follows at the end."),
    ],
    ansatz: [
      istPm ? zw("Setze P in y = m·x + c ein und stelle nach c um.", "Put P into y = m·x + c and solve for c.") : zw("Steigung = Höhe durch Breite: $m = \\frac{y_Q − y_P}{x_Q − x_P}$. Im Bild ist das das Steigungsdreieck.", "Slope = rise over run: $m = \\frac{y_Q − y_P}{x_Q − x_P}$. In the picture that is the slope triangle."),
      istPm ? zw("Das ergibt $c = y_P − m \\cdot x_P$.", "That gives $c = y_P − m \\cdot x_P$.") : zw("Schreibe in Zähler und Nenner beide Male Q zuerst – dann stimmt das Vorzeichen.", "Write Q first in both numerator and denominator – then the sign is right."),
      zw("Den y-Achsenabschnitt bekommst du aus einem Punkt: $c = y_P − m \\cdot x_P$.", "You get the y-intercept from one point: $c = y_P − m \\cdot x_P$."),
    ],
    regel: [
      zw("Steigung aus zwei Punkten: $m = \\frac{y_Q − y_P}{x_Q − x_P}$.", "Slope from two points: $m = \\frac{y_Q − y_P}{x_Q − x_P}$."),
      zw("y-Achsenabschnitt: $c = y_P − m \\cdot x_P$.", "y-intercept: $c = y_P − m \\cdot x_P$."),
      zw("Gleichung ohne Reste aufschreiben: y = x statt y = 1x, y = 2x statt y = 2x + 0.", "Write the equation without leftovers: y = x, not y = 1x; y = 2x, not y = 2x + 0."),
    ],
    pruefen: [
      zw("Probe: Setze die Koordinaten von P und Q in deine Gleichung ein. Beide müssen aufgehen.", "Check: put the coordinates of P and Q into your equation. Both must work."),
      zw("Geht die Gerade im Bild nach rechts nach oben, muss m positiv sein; fällt sie, negativ.", "If the line rises to the right, m must be positive; if it falls, negative."),
      zw("Schneidet sie die y-Achse oberhalb des Ursprungs, ist c positiv.", "If it crosses the y-axis above the origin, c is positive."),
    ],
    regeln: [{ name: "Geradengleichung", bereich: "mittelstufe" }],
    loesung,
  });
}

/* ---------------------------------------------------------------- Basics */
function Basics() {
  const { W, H } = useMass();
  const desktop = useDesktop();
  const [m2, setM2] = useState(4);     // m = m2 / 2  →  Steigung in Halbschritten
  const [c, setC] = useState(-1);
  const [guide, setGuide] = useState("punkte");
  const [tx, setTx] = useState(-3);
  const [spiel, setSpiel] = useState(true);
  const svgRef = useRef(null);
  const m = m2 / 2;
  const f = useMemo(() => fenster([[-7, -4], [7, 4]], { rand: 0, minH: 10 }), []);
  const reduziert = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // erlaubte Stellen für T: ganze x, bei denen T noch im Bild liegt
  const stellen = useMemo(() => { const l = []; for (let x = -7; x <= 7; x++) if (Math.abs(m * x + c) <= 4.5) l.push(x); return l; }, [m, c]);
  useEffect(() => { if (!stellen.includes(tx)) setTx(stellen.includes(0) ? 0 : stellen[0]); }, [stellen, tx]);
  useEffect(() => {
    if (guide !== "punkte" || !spiel || reduziert) return undefined;
    let richtung = 1;
    const id = setInterval(() => setTx((x) => {
      const i = stellen.indexOf(x);
      let j = i + richtung;
      if (j < 0 || j >= stellen.length) { richtung = -richtung; j = i + richtung; }
      return stellen[Math.max(0, Math.min(stellen.length - 1, j))];
    }), 950);
    return () => clearInterval(id);
  }, [guide, spiel, stellen, reduziert]);

  const mB = bruch(m2, 2), cB = bruch(c);
  const gl = gleichungTex(mB, cB);
  const ty = m * tx + c;
  const probe = probeText(m, c, tx);
  const linie = linieImFenster(m, c, f);
  const wahl = (g) => { setGuide(g); if (g === "punkte") setSpiel(true); };
  const ziehT = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const x = zuMathe(((e.clientX - r.left) / r.width) * W, 0, f, W, H)[0];
    const nahe = stellen.reduce((b, s) => (Math.abs(s - x) < Math.abs(b - x) ? s : b), stellen[0]);
    setTx(nahe); setSpiel(false);
  };
  const mWort = m === 0 ? zw("waagerecht", "horizontal") : m > 0 ? zw("nach oben", "up") : zw("nach unten", "down");
  const text = {
    punkte: zw("Jeder Punkt T(x | y) auf der Linie passt zur Gleichung: Setze x ein – es kommt genau y heraus.", "Every point T(x | y) on the line fits the equation: put in x and you get exactly y."),
    c: zw("Die Gerade schneidet die y-Achse dort, wo x = 0 ist. Das y dieses Punkts ist c.", "The line crosses the y-axis where x = 0. The y of that point is c."),
    m: zw("Geh 1 nach rechts. Wie weit geht die Gerade dabei nach oben (+) oder unten (−)? Das ist m.", "Go 1 to the right. How far does the line go up (+) or down (−)? That is m."),
    gleichung: zw("Trage m und c ein – fertig ist die Geradengleichung.", "Fill in m and c – that is the equation of the line."),
  }[guide];

  const [x0, y0] = zuBild([0, c], f, W, H);
  const R = zuBild([1, c], f, W, H), Q1 = zuBild([1, c + m], f, W, H);
  const T = zuBild([tx, ty], f, W, H);
  const tLinks = T[0] > W - 70;

  const einleitung = (
      <p className="ger-text">
        {zw("Jede Gerade ist eine Linie im Koordinatensystem – und jeder Punkt auf ihr erfüllt dieselbe Gleichung: ", "Every straight line is a line in the coordinate system – and every point on it satisfies the same equation: ")}
        <span className="ger-formel"><M t="y = m · x + c" /></span>
      </p>
  );
  const bild = (
      <Schaubild f={f} svgRef={svgRef} label={zw("Gerade im Koordinatensystem", "Straight line in the coordinate system")} kinder={({ X, Y }) => (
        <>
          {linie && <line x1={X(linie[0][0])} y1={Y(linie[0][1])} x2={X(linie[1][0])} y2={Y(linie[1][1])} stroke={GOLD} strokeWidth="3.2" strokeLinecap="round" />}
          {guide === "punkte" && (
            <>
              <line x1={T[0]} y1={T[1]} x2={T[0]} y2={Y(0)} stroke={C.see} strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1={T[0]} y1={T[1]} x2={X(0)} y2={T[1]} stroke={C.see} strokeWidth="1.2" strokeDasharray="3 3" />
              <circle cx={T[0]} cy={T[1]} r="6.8" fill={C.see} stroke="#fff" strokeWidth="2" pointerEvents="none" />
              <Pille x={T[0] + (tLinks ? -10 : 10)} y={T[1] - 14} t={`T(${mz(tx)} | ${zahlText(ty)})`} farbe={C.see} anker={tLinks ? "end" : "start"} />
              <circle className="ger-griff" cx={T[0]} cy={T[1]} r="20" fill="transparent" tabIndex={0} role="button" aria-label={zw("Punkt T entlang der Geraden bewegen", "Move point T along the line")}
                style={{ cursor: "grab", touchAction: "none", outline: "none" }}
                onPointerDown={(e) => { e.preventDefault(); try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) { /* egal */ } setSpiel(false); }}
                onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) ziehT(e); }}
                onPointerUp={(e) => { try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (x) { /* egal */ } }}
                onKeyDown={(e) => { const i = stellen.indexOf(tx); if (e.key === "ArrowRight" && i < stellen.length - 1) { setTx(stellen[i + 1]); setSpiel(false); } if (e.key === "ArrowLeft" && i > 0) { setTx(stellen[i - 1]); setSpiel(false); } }} />
            </>
          )}
          {guide === "c" && (
            <>
              <line x1={x0} y1={Y(f.y0)} x2={x0} y2={Y(f.y1)} stroke={GOLD} strokeOpacity="0.35" strokeWidth="6" />
              <circle cx={x0} cy={y0} r="6.8" fill={GOLD} stroke="#fff" strokeWidth="2" />
              <Pille x={x0 + 12} y={y0 + (c > 2.5 ? 16 : -14)} t={`c = ${mz(c)}`} farbe={C.gruenDunkel} anker="start" />
            </>
          )}
          {guide === "m" && (
            <>
              <polygon points={`${x0},${y0} ${R[0]},${R[1]} ${Q1[0]},${Q1[1]}`} fill={`${GOLD}26`} />
              <line x1={x0} y1={y0} x2={R[0]} y2={R[1]} stroke={C.see} strokeWidth="2" strokeDasharray="5 4" />
              <line x1={R[0]} y1={R[1]} x2={Q1[0]} y2={Q1[1]} stroke={C.see} strokeWidth="2" strokeDasharray="5 4" />
              <circle cx={x0} cy={y0} r="5.5" fill={GOLD} stroke="#fff" strokeWidth="2" />
              <Pille x={(x0 + R[0]) / 2} y={R[1] + (m >= 0 ? 15 : -15)} t="1" farbe={C.see} />
              {m !== 0 && <Pille x={R[0] + 10} y={(R[1] + Q1[1]) / 2} t={zahlText(m)} farbe={C.see} anker="start" />}
            </>
          )}
          {guide === "gleichung" && <Pille x={W - 10} y={H - 12} t={gleichungText(mB, cB)} farbe={C.gruenDunkel} anker="end" />}
        </>
      )} />
  );
  const lesenKasten = (
      <div className="ger-lesen" aria-live="polite">
        <p className="ger-lesen-text">{text}</p>
        <div className="ger-lesen-rechnung" data-ger-lesen={guide}>
          {guide === "punkte" && (<>
            <span className="ger-t">T({mz(tx)} | {zahlText(ty)})</span><span className="ger-gr">{probe.text}</span><span className="ger-haken" aria-hidden="true">✓</span>
            <button type="button" className="ger-spiel" onClick={() => setSpiel(!spiel)} aria-label={spiel ? zw("Bewegung anhalten", "Pause") : zw("Bewegung starten", "Play")}>{spiel ? "❚❚" : "▶"}</button>
          </>)}
          {guide === "c" && <span className="ger-gr">S(0 | {mz(c)}) <span aria-hidden="true">→</span> c = {mz(c)}</span>}
          {guide === "m" && <span className="ger-gr">{zw("1 nach rechts", "1 right")}, {m === 0 ? mWort : `${zahlText(Math.abs(m))} ${mWort}`} <span aria-hidden="true">→</span> m = {zahlText(m)}</span>}
          {guide === "gleichung" && <span className="ger-gr"><M t={`y = m · x + c \\;→\\; ${gl}`} /></span>}
        </div>
      </div>
  );
  const reglerBlock = (
      <div className="ger-regler-block">
        <MiniRegler name="m" farbe={C.see} wert={m} setWert={(v) => setM2(Math.round(v * 2))} min={-4} max={4} schritt={0.5} format={zahlText} />
        <MiniRegler name="c" farbe={GOLD} wert={c} setWert={setC} min={-4} max={4} schritt={1} format={zahlText} />
      </div>
  );
  const leitfaden = [["punkte", zw("Punkte", "Points")], ["c", "c"], ["m", "m"], ["gleichung", zw("Gleichung", "Equation")]];
  const leitSeg = (
      <div className="ger-seg ger-seg-klein" role="group" aria-label={zw("So findest du m und c selbst", "How to find m and c yourself")}>
        {leitfaden.map(([id, name], i) => (
          <button key={id} type="button" aria-pressed={guide === id} onClick={() => wahl(id)}><span className="ger-chipnr">{i + 1}</span> {name}</button>
        ))}
      </div>
  );

  /* Desktop: Gleichung und Regler links, Schaubild rechts, Leitfaden als Chips darunter */
  if (desktop) {
    return (
      <div className="ger-inhalt" data-ger-basics>
        <Arbeitsflaeche
          links={<>
            <FeinKarte>{einleitung}</FeinKarte>
            <div style={toenKarte(C.see)} data-ger-regler-desk>
              <ReglerReihe>
                <SenkrechtRegler name="m" farbe={C.see} wert={m} setze={(v) => setM2(Math.round(v * 2))} min={-4} max={4} schritt={0.5} format={zahlText} plusLabel="m +" minusLabel="m −" />
                <SenkrechtRegler name="c" farbe={GOLD} wert={c} setze={setC} min={-4} max={4} schritt={1} format={zahlText} plusLabel="c +" minusLabel="c −" />
              </ReglerReihe>
            </div>
            {lesenKasten}
          </>}
          rechts={<>
            <BildKarte>{bild}</BildKarte>
            <Werkzeugleiste gruppen={[{ titel: zw("So findest du m und c selbst", "How to find m and c yourself"), inhalt: (
              <div className="ger-seg-klein ger-chips" role="group" aria-label={zw("So findest du m und c selbst", "How to find m and c yourself")}>
                {leitfaden.map(([id, name], i) => (
                  <button key={id} type="button" aria-pressed={guide === id} onClick={() => wahl(id)} style={{ ...chipStil(guide === id), flex: "0 0 auto", fontWeight: 600, boxShadow: "none" }}>
                    <span className="ger-chipnr">{i + 1}</span> {name}
                  </button>
                ))}
              </div>
            ) }]} />
          </>} />
      </div>
    );
  }

  return (
    <div className="ger-inhalt" data-ger-basics>
      {einleitung}
      {bild}
      {lesenKasten}
      {reglerBlock}
      {leitSeg}
    </div>
  );
}

function MiniRegler({ name, farbe, wert, setWert, min, max, schritt, format }) {
  const setze = (v) => setWert(Math.round(Math.max(min, Math.min(max, v)) / schritt) * schritt);
  const knopf = (d, z) => {
    const aus = (d < 0 && wert <= min + 1e-9) || (d > 0 && wert >= max - 1e-9);
    return <button type="button" className="ger-rb" onClick={() => setze(wert + d * schritt)} disabled={aus} aria-label={`${name} ${d > 0 ? "+" : "−"}`} style={{ borderColor: `${farbe}66`, color: farbe, background: `${farbe}14` }}>{z}</button>;
  };
  return (
    <div className="ger-regler">
      <span className="ger-rn" style={{ color: farbe }}>{name}</span>
      {knopf(-1, "−")}
      <input type="range" min={min} max={max} step={schritt} value={wert} aria-label={name} onChange={(e) => setze(Number(e.target.value))} style={{ accentColor: farbe }} />
      {knopf(1, "+")}
      <span className="ger-rw">{format(wert)}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- P & Q */
function PundQ({ modus, setModus }) {
  const auto = modus === "auto";
  const { W, H } = useMass();
  const desktop = useDesktop();
  const [{ P, Q }, setPQ] = useState({ P: [1, 3], Q: [3, 7] });
  const [einfrieren, setEinfrieren] = useState(null);
  const [sm, setSm] = useState(LEER);
  const [sc, setSc] = useState(LEER);
  const [gezogen, setGezogen] = useState(false);
  const svgRef = useRef(null);
  const pad = usePad();
  const g = useMemo(() => geradePQ(P, Q), [P, Q]);
  const cImBild = !g.senkrecht && Math.abs(bWert(g.c)) <= 12;
  const fFrei = useMemo(() => fenster([P, Q, ...(cImBild ? [[0, bWert(g.c)]] : [])]), [P, Q, g, cImBild]);
  const f = einfrieren || fFrei;
  const reset = () => { setSm(LEER); setSc(LEER); };
  const setzen = (wer, p) => setPQ((a) => {
    const alt = a[wer];
    if (alt[0] === p[0] && alt[1] === p[1]) return a;
    reset();
    return { ...a, [wer]: p };
  });
  const wuerfeln = () => { pad.schliessen(); reset(); setPQ(zufallPQ()); };
  useEffect(() => { pad.schliessen(); setSm(LEER); setSc(LEER); }, [auto]);   // Moduswechsel: Schritte neu

  const oeffneKoord = (e, wer, ax) => {
    const p = wer === "P" ? P : Q;
    pad.oeffnen({
      id: wer + ax, max: 2,
      titel: zw(`${ax === 0 ? "x" : "y"}-Koordinate von ${wer}`, `${ax === 0 ? "x" : "y"}-coordinate of ${wer}`),
      live: (t) => {
        if (!/^-?\d{1,2}$/.test(t)) return;
        const v = Math.max(-GRENZE, Math.min(GRENZE, Number(t)));
        setPQ((a) => { const n = [...a[wer]]; n[ax] = v; if (n[ax] === a[wer][ax]) return a; reset(); return { ...a, [wer]: n }; });
      },
    }, String(p[ax]), true, e.currentTarget);
  };
  const feld = (wer, ax) => {
    const id = wer + ax, p = wer === "P" ? P : Q;
    return <Zahl wert={p[ax]} aktiv={pad.offen?.id === id} buf={pad.offen?.id === id ? pad.text : null} onKlick={(e) => oeffneKoord(e, wer, ax)}
      label={zw(`${ax === 0 ? "x" : "y"}-Koordinate von ${wer}: ${p[ax]}, ändern`, `${ax === 0 ? "x" : "y"}-coordinate of ${wer}: ${p[ax]}, change`)} />;
  };

  const pruefe = (welche, eing) => {
    const istM = welche === "m";
    const r = bewerte(eing, istM ? g.m : g.c, istM ? fehlerFaelleM(P, Q) : fehlerFaelleC(P, g.m));
    const set = istM ? setSm : setSc;
    const gruppe = istM ? "gerade-steigung" : "gerade-achsenabschnitt";
    if (r.art === "leer") return set((s) => ({ ...s, falsch: false, hinweis: zw("Tippe auf das Feld und gib eine Zahl oder einen Bruch ein.", "Tap the box and enter a number or a fraction.") }));
    if (r.art === "unfertig") return set((s) => ({ ...s, falsch: false, hinweis: zw("Die Eingabe ist noch nicht vollständig – zum Beispiel 3 oder 3/2.", "The entry is not complete yet – for example 3 or 3/2.") }));
    if (r.art === "ungekuerzt") return set((s) => ({ ...s, falsch: false, hinweis: zw(r.hinweis, "The value is right – now reduce the fraction completely.") }));
    if (r.art === "richtig") { set((s) => ({ ...s, status: "richtig", falsch: false, hinweis: "" })); buchen({ richtig: true, gruppe }); return null; }
    set((s) => ({ ...s, falsch: true, versuche: s.versuche + 1,
      hinweis: r.hinweis || (istM ? zw("Noch nicht. Rechne Höhe durch Breite: Δy durch Δx.", "Not yet. Work out rise over run: Δy divided by Δx.") : zw("Noch nicht. Setze P ein: c = y_P − m · x_P.", "Not yet. Put in P: c = y_P − m · x_P.")) }));
    buchen({ richtig: false, gruppe, fehlerart: r.fehler || (istM ? "steigung" : "achsenabschnitt") });
    return null;
  };
  const oeffneAntwort = (e, welche) => {
    const st = welche === "m" ? sm : sc, set = welche === "m" ? setSm : setSc;
    pad.oeffnen({
      id: welche, bruch: true, max: 3,
      titel: welche === "m" ? zw("Steigung m", "Slope m") : zw("y-Achsenabschnitt c", "y-intercept c"),
      live: (t) => set((s) => ({ ...s, eing: t, falsch: false, hinweis: "" })),
      ok: (t) => pruefe(welche, t),
    }, st.eing, false, e.currentTarget);
  };

  const mFertig = auto || sm.status === "richtig" || (sm.status === "gezeigt" && sm.weiter);
  const cFertig = auto || sc.status === "richtig" || (sc.status === "gezeigt" && sc.weiter);
  const fertig = mFertig && cFertig;
  const hilfe = useMemo(() => hilfePQ(P, Q, g, false), [P, Q, g]);
  const zeigeZahlen = !g.senkrecht && (auto || sm.status === "richtig" || sm.status === "gezeigt");
  const linie = fertig && !g.senkrecht ? linieImFenster(bWert(g.m), bWert(g.c), f) : null;
  const dr = dreieck(P, Q);
  const entartet = g.senkrecht;
  const anzeigeText = pad.offen && (pad.offen.id === "m" || pad.offen.id === "c") ? (antwortAnzeige(pad.text)) : mz(pad.text);

  const wuerfelKnopf = <button type="button" className="ger-wuerfel" onClick={wuerfeln} aria-label={zw("Zufällige Punkte würfeln", "Roll random points")} title={zw("Zufällige Punkte", "Random points")}><span aria-hidden="true">🎲</span></button>;
  const punkteZeile = (
      <div className="ger-punkte">
        <span className="ger-pt"><b>P</b>({feld("P", 0)}|{feld("P", 1)})</span>
        <span className="ger-und">{zw("und", "and")}</span>
        <span className="ger-pt"><b>Q</b>({feld("Q", 0)}|{feld("Q", 1)})</span>
      </div>
  );
  const aufgabeKopf = (
    <>
      <div className="ger-zeile1">
        <span className="ger-titel">{zw("Gerade durch zwei Punkte", "Line through two points")}</span>
        <IchHaengeFest kontext={hilfe} />
      </div>
      <div className="ger-zeile2">
        <ModusWahl modus={modus} setModus={setModus} />
        {wuerfelKnopf}
      </div>
      {punkteZeile}
    </>
  );
  /* Desktop: Titel als Kicker, Frage mit Würfel, Punkte groß, Hilfe unten rechts */
  const aufgabeDesk = (
    <>
      <Kicker>{zw("Gerade durch zwei Punkte", "Line through two points")}</Kicker>
      <div className="ger-zeile2">
        <ModusWahl modus={modus} setModus={setModus} />
        {wuerfelKnopf}
      </div>
      {punkteZeile}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><IchHaengeFest kontext={hilfe} /></div>
    </>
  );
  const bild = (
      <Schaubild f={f} svgRef={svgRef} label={zw("Koordinatensystem mit den Punkten P und Q und dem Steigungsdreieck", "Coordinate system with points P and Q and the slope triangle")} kinder={({ X, Y }) => {
        const [pb, qb, rb] = [zuBild(P, f, W, H), zuBild(Q, f, W, H), zuBild(dr.R, f, W, H)];
        const start = () => setEinfrieren(fFrei);
        const ende = () => { setEinfrieren(null); setGezogen(true); };
        return (
          <>
            {entartet && <line x1={pb[0]} y1="0" x2={pb[0]} y2={H} stroke={GOLD} strokeWidth="2.4" strokeDasharray="6 4" />}
            {linie && <line x1={X(linie[0][0])} y1={Y(linie[0][1])} x2={X(linie[1][0])} y2={Y(linie[1][1])} stroke={GOLD} strokeWidth="3.2" strokeLinecap="round" />}
            {!entartet && (
              <>
                <polygon points={`${pb[0]},${pb[1]} ${rb[0]},${rb[1]} ${qb[0]},${qb[1]}`} fill={`${GOLD}22`} />
                <line x1={pb[0]} y1={pb[1]} x2={rb[0]} y2={rb[1]} stroke={C.see} strokeWidth="2" strokeDasharray="5 4" />
                <line x1={rb[0]} y1={rb[1]} x2={qb[0]} y2={qb[1]} stroke={C.see} strokeWidth="2" strokeDasharray="5 4" />
                {!linie && <line x1={pb[0]} y1={pb[1]} x2={qb[0]} y2={qb[1]} stroke={GOLD} strokeWidth="2" strokeOpacity="0.75" />}
                {dr.dx !== 0 && <Pille x={(pb[0] + rb[0]) / 2} y={rb[1] + (dr.dy >= 0 ? 15 : -15)} t={zeigeZahlen ? `Δx = ${mz(dr.dx)}` : "Δx"} farbe={C.see} />}
                {dr.dy !== 0 && <Pille x={rb[0] + (dr.dx >= 0 ? 8 : -8)} y={(rb[1] + qb[1]) / 2} t={zeigeZahlen ? `Δy = ${mz(dr.dy)}` : "Δy"} farbe={C.see} anker={dr.dx >= 0 ? "start" : "end"} />}
              </>
            )}
            {cImBild && (auto || (sc.status && (sc.status === "richtig" || sc.weiter))) && (() => { const [cx, cy] = zuBild([0, bWert(g.c)], f, W, H); return <circle cx={cx} cy={cy} r="5.5" fill={GOLD} stroke="#fff" strokeWidth="2" />; })()}
            <Griff p={P} f={f} farbe={C.see} name="P" svgRef={svgRef} setzen={(p) => setzen("P", p)} start={start} ende={ende} label={zw("Punkt P verschieben", "Move point P")} />
            <Griff p={Q} f={f} farbe={GOLD} name="Q" svgRef={svgRef} setzen={(p) => setzen("Q", p)} start={start} ende={ende} label={zw("Punkt Q verschieben", "Move point Q")} />
            {!gezogen && <Pille x={10} y={H - 12} t={zw("Punkte ziehen", "Drag the points")} farbe={C.grau} anker="start" />}
          </>
        );
      }} />
  );
  const schritteListe = (
      <div className="ger-schritte">
        {entartet ? (
          <div className="ger-karte hinweis" role="status" data-ger-senkrecht>
            {g.gleichePunkte
              ? zw("P und Q sind derselbe Punkt – durch einen Punkt gehen unendlich viele Geraden. Ändere eine Koordinate.", "P and Q are the same point – infinitely many lines pass through one point. Change a coordinate.")
              : zw(`P und Q liegen senkrecht übereinander: Die Gerade x = ${mz(P[0])} hat keine Steigung. Ändere eine x-Koordinate.`, `P and Q lie directly above each other: the line x = ${mz(P[0])} has no slope. Change an x-coordinate.`)}
          </div>
        ) : (
          <>
            {auto ? <>
              <AutoSchritt nr={1} titel={zw("Steigung berechnen", "Work out the slope")} label="m" weg={steigungWeg(P, Q)} />
              <AutoSchritt nr={2} titel={zw("y-Achsenabschnitt berechnen", "Work out the y-intercept")} label="c" weg={achsenWeg(P, g.m)} />
              <Ergebnis m={g.m} c={g.c} onNeu={wuerfeln} auto />
            </> : <>
            <Schritt nr={1} titel={zw("Steigung berechnen", "Work out the slope")} label="m" formel="\frac{y_Q − y_P}{x_Q − x_P}" st={sm} aktiv={!mFertig}
              soll={g.m} weg={steigungWeg(P, Q)} padAktiv={pad.offen?.id === "m"}
              onFeld={(e) => oeffneAntwort(e, "m")} onZeigen={() => { pad.schliessen(); setSm((s) => ({ ...s, status: "gezeigt", hinweis: "", falsch: false })); }}
              onWeiter={() => setSm((s) => ({ ...s, weiter: true }))} />
            <Schritt nr={2} titel={zw("y-Achsenabschnitt berechnen", "Work out the y-intercept")} label="c" formel="y_P − m · x_P" st={sc} aktiv={mFertig && !cFertig} gesperrt={!mFertig}
              soll={g.c} weg={achsenWeg(P, g.m)} padAktiv={pad.offen?.id === "c"}
              onFeld={(e) => oeffneAntwort(e, "c")} onZeigen={() => { pad.schliessen(); setSc((s) => ({ ...s, status: "gezeigt", hinweis: "", falsch: false })); }}
              onWeiter={() => setSc((s) => ({ ...s, weiter: true }))} />
            {fertig ? <Ergebnis m={g.m} c={g.c} onNeu={wuerfeln} />
              : <div className="ger-karte gesperrt" data-ger-schritt="y"><span className="ger-nr">3</span><span className="ger-karte-titel">{zw("Geradengleichung aufschreiben", "Write down the equation")}</span></div>}
            </>}
          </>
        )}
      </div>
  );
  const zahlPad = pad.offen && <ZahlPad titel={pad.offen.titel} anzeige={anzeigeText} mitBruch={!!pad.offen.bruch} onTaste={pad.taste} />;

  /* Desktop: Aufgabe links, Schaubild rechts, Rechenschritte darunter */
  if (desktop) {
    return (
      <div className="ger-inhalt" data-ger-pq style={{ paddingBottom: pad.offen ? 232 : 0 }}>
        <Arbeitsflaeche
          links={<FeinKarte className="ger-aufgabe-desk">{aufgabeDesk}</FeinKarte>}
          rechts={<BildKarte>{bild}</BildKarte>} />
        <FeinKarte style={{ marginTop: 20 }}>
          <Kicker>{zw("Rechenweg", "Working")}</Kicker>
          {schritteListe}
        </FeinKarte>
        {zahlPad}
      </div>
    );
  }

  return (
    <div className="ger-inhalt" data-ger-pq style={{ paddingBottom: pad.offen ? 232 : 0 }}>
      {aufgabeKopf}
      {bild}
      {schritteListe}
      {zahlPad}
    </div>
  );
}

/* Anzeige im Zahlenfeld: − statt Bindestrich, Bruchstrich mit Luft */
const antwortAnzeige = (t) => mz(t).replace("/", " / ");

/* ---------------------------------------------------------------- P & m */
function PundM({ modus, setModus }) {
  const auto = modus === "auto";
  const { W, H } = useMass();
  const desktop = useDesktop();
  const [{ P, m }, setAufg] = useState({ P: [2, 3], m: bruch(2) });
  const [einfrieren, setEinfrieren] = useState(null);
  const [sc, setSc] = useState(LEER);
  const [gezogen, setGezogen] = useState(false);
  const svgRef = useRef(null);
  const pad = usePad();
  const c = useMemo(() => achsenabschnitt(P, m), [P, m]);
  const dr = useMemo(() => dreieckPm(P, m), [P, m]);
  const cImBild = Math.abs(bWert(c)) <= 12;
  const fFrei = useMemo(() => fenster([P, dr.Q, dr.R, ...(cImBild ? [[0, bWert(c)]] : [])]), [P, dr, c, cImBild]);
  const f = einfrieren || fFrei;
  const reset = () => setSc(LEER);
  const setzeP = (p) => setAufg((a) => { if (a.P[0] === p[0] && a.P[1] === p[1]) return a; reset(); return { ...a, P: p }; });
  const wuerfeln = () => { pad.schliessen(); reset(); setAufg(zufallPm()); };
  useEffect(() => { pad.schliessen(); setSc(LEER); }, [auto]);   // Moduswechsel: Schritt neu

  const oeffneKoord = (e, ax) => pad.oeffnen({
    id: `P${ax}`, max: 2,
    titel: zw(`${ax === 0 ? "x" : "y"}-Koordinate von P`, `${ax === 0 ? "x" : "y"}-coordinate of P`),
    live: (t) => {
      if (!/^-?\d{1,2}$/.test(t)) return;
      const v = Math.max(-GRENZE, Math.min(GRENZE, Number(t)));
      setAufg((a) => { const n = [...a.P]; n[ax] = v; if (n[ax] === a.P[ax]) return a; reset(); return { ...a, P: n }; });
    },
  }, String(P[ax]), true, e.currentTarget);
  const oeffneM = (e) => pad.oeffnen({
    id: "m", bruch: true, max: 2, titel: zw("Steigung m", "Slope m"),
    live: (t) => {
      const a = leseAntwort(t);
      if (!a || Math.abs(a.wert.n) > 20 || a.wert.d > 9) return;
      setAufg((alt) => { if (alt.m.n === a.wert.n && alt.m.d === a.wert.d) return alt; reset(); return { ...alt, m: a.wert }; });
    },
  }, m.d === 1 ? String(m.n) : `${m.n}/${m.d}`, true, e.currentTarget);

  const pruefe = (eing) => {
    const r = bewerte(eing, c, fehlerFaelleC(P, m));
    const gruppe = "gerade-achsenabschnitt";
    if (r.art === "leer") return setSc((s) => ({ ...s, falsch: false, hinweis: zw("Tippe auf das Feld und gib eine Zahl oder einen Bruch ein.", "Tap the box and enter a number or a fraction.") }));
    if (r.art === "unfertig") return setSc((s) => ({ ...s, falsch: false, hinweis: zw("Die Eingabe ist noch nicht vollständig – zum Beispiel 3 oder 3/2.", "The entry is not complete yet – for example 3 or 3/2.") }));
    if (r.art === "ungekuerzt") return setSc((s) => ({ ...s, falsch: false, hinweis: zw(r.hinweis, "The value is right – now reduce the fraction completely.") }));
    if (r.art === "richtig") { setSc((s) => ({ ...s, status: "richtig", falsch: false, hinweis: "" })); buchen({ richtig: true, gruppe }); return null; }
    setSc((s) => ({ ...s, falsch: true, versuche: s.versuche + 1, hinweis: r.hinweis || zw("Noch nicht. Setze P ein: c = y_P − m · x_P.", "Not yet. Put in P: c = y_P − m · x_P.") }));
    buchen({ richtig: false, gruppe, fehlerart: r.fehler || "achsenabschnitt" });
    return null;
  };
  const oeffneAntwort = (e) => pad.oeffnen({
    id: "c", bruch: true, max: 3, titel: zw("y-Achsenabschnitt c", "y-intercept c"),
    live: (t) => setSc((s) => ({ ...s, eing: t, falsch: false, hinweis: "" })),
    ok: (t) => pruefe(t),
  }, sc.eing, false, e.currentTarget);

  const fertig = auto || sc.status === "richtig" || (sc.status === "gezeigt" && sc.weiter);
  const hilfe = useMemo(() => hilfePQ(P, null, null, true, m), [P, m]);
  const linie = fertig ? linieImFenster(bWert(m), bWert(c), f) : null;
  const anzeigeText = pad.offen ? antwortAnzeige(pad.text) : "";
  const mTexAnzeige = pad.offen?.id === "m" ? null : bruchTex(m);

  const wuerfelKnopf = <button type="button" className="ger-wuerfel" onClick={wuerfeln} aria-label={zw("Zufälligen Punkt und Steigung würfeln", "Roll a random point and slope")} title={zw("Zufällige Aufgabe", "Random task")}><span aria-hidden="true">🎲</span></button>;
  const punkteZeile = (
      <div className="ger-punkte">
        <span className="ger-pt"><b>P</b>(
          <Zahl wert={P[0]} aktiv={pad.offen?.id === "P0"} buf={pad.offen?.id === "P0" ? pad.text : null} onKlick={(e) => oeffneKoord(e, 0)} label={zw(`x-Koordinate von P: ${P[0]}, ändern`, `x-coordinate of P: ${P[0]}, change`)} />|
          <Zahl wert={P[1]} aktiv={pad.offen?.id === "P1"} buf={pad.offen?.id === "P1" ? pad.text : null} onKlick={(e) => oeffneKoord(e, 1)} label={zw(`y-Koordinate von P: ${P[1]}, ändern`, `y-coordinate of P: ${P[1]}, change`)} />)</span>
        <span className="ger-und">{zw("und", "and")}</span>
        <span className="ger-pt"><b>m</b> =&nbsp;
          <button type="button" data-ger-feld data-ger-m className={`ger-feld${pad.offen?.id === "m" ? " an" : ""}`} aria-pressed={pad.offen?.id === "m"} aria-label={zw(`Steigung m: ${bruchTex(m)}, ändern`, `Slope m: ${bruchTex(m)}, change`)} onClick={oeffneM}>
            {mTexAnzeige === null ? (pad.text ? antwortAnzeige(pad.text) : " ") : <M t={mTexAnzeige} />}
          </button>
        </span>
      </div>
  );
  const aufgabeKopf = (
    <>
      <div className="ger-zeile1">
        <span className="ger-titel">{zw("Gerade durch Punkt und Steigung", "Line through a point and a slope")}</span>
        <IchHaengeFest kontext={hilfe} />
      </div>
      <div className="ger-zeile2">
        <ModusWahl modus={modus} setModus={setModus} />
        {wuerfelKnopf}
      </div>
      {punkteZeile}
    </>
  );
  /* Desktop: Titel als Kicker, Frage mit Würfel, Punkte groß, Hilfe unten rechts */
  const aufgabeDesk = (
    <>
      <Kicker>{zw("Gerade durch Punkt und Steigung", "Line through a point and a slope")}</Kicker>
      <div className="ger-zeile2">
        <ModusWahl modus={modus} setModus={setModus} />
        {wuerfelKnopf}
      </div>
      {punkteZeile}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><IchHaengeFest kontext={hilfe} /></div>
    </>
  );
  const bild = (
      <Schaubild f={f} svgRef={svgRef} label={zw("Koordinatensystem mit dem Punkt P und dem Steigungsdreieck", "Coordinate system with point P and the slope triangle")} kinder={({ X, Y }) => {
        const [pb, qb, rb] = [zuBild(P, f, W, H), zuBild(dr.Q, f, W, H), zuBild(dr.R, f, W, H)];
        const start = () => setEinfrieren(fFrei);
        const ende = () => { setEinfrieren(null); setGezogen(true); };
        const pfeil = dr.dy > 0 ? "↑" : dr.dy < 0 ? "↓" : "";
        return (
          <>
            {linie && <line x1={X(linie[0][0])} y1={Y(linie[0][1])} x2={X(linie[1][0])} y2={Y(linie[1][1])} stroke={GOLD} strokeWidth="3.2" strokeLinecap="round" />}
            <polygon points={`${pb[0]},${pb[1]} ${rb[0]},${rb[1]} ${qb[0]},${qb[1]}`} fill={`${GOLD}22`} />
            <line x1={pb[0]} y1={pb[1]} x2={rb[0]} y2={rb[1]} stroke={C.see} strokeWidth="2" strokeDasharray="5 4" />
            <line x1={rb[0]} y1={rb[1]} x2={qb[0]} y2={qb[1]} stroke={C.see} strokeWidth="2" strokeDasharray="5 4" />
            {!linie && <line x1={pb[0]} y1={pb[1]} x2={qb[0]} y2={qb[1]} stroke={GOLD} strokeWidth="2" strokeOpacity="0.75" />}
            <Pille x={(pb[0] + rb[0]) / 2} y={rb[1] + (dr.dy >= 0 ? 15 : -15)} t={`→ ${dr.dx}`} farbe={C.see} />
            {dr.dy !== 0 && <Pille x={rb[0] + 8} y={(rb[1] + qb[1]) / 2} t={`${pfeil} ${Math.abs(dr.dy)}`} farbe={C.see} anker="start" />}
            {fertig && cImBild && (() => { const [cx, cy] = zuBild([0, bWert(c)], f, W, H); return <circle cx={cx} cy={cy} r="5.5" fill={GOLD} stroke="#fff" strokeWidth="2" />; })()}
            <Griff p={P} f={f} farbe={C.see} name="P" svgRef={svgRef} setzen={setzeP} start={start} ende={ende} label={zw("Punkt P verschieben", "Move point P")} />
            {!gezogen && <Pille x={10} y={H - 12} t={zw("P ziehen", "Drag P")} farbe={C.grau} anker="start" />}
          </>
        );
      }} />
  );
  const schritteListe = (
      <div className="ger-schritte">
        {auto ? <>
          <AutoSchritt nr={1} titel={zw("y-Achsenabschnitt berechnen", "Work out the y-intercept")} label="c" weg={achsenWeg(P, m)} />
          <Ergebnis m={m} c={c} onNeu={wuerfeln} auto />
        </> : <>
        <Schritt nr={1} titel={zw("y-Achsenabschnitt berechnen", "Work out the y-intercept")} label="c" formel="y_P − m · x_P" st={sc} aktiv={!fertig}
          soll={c} weg={achsenWeg(P, m)} padAktiv={pad.offen?.id === "c"}
          onFeld={oeffneAntwort} onZeigen={() => { pad.schliessen(); setSc((s) => ({ ...s, status: "gezeigt", hinweis: "", falsch: false })); }}
          onWeiter={() => setSc((s) => ({ ...s, weiter: true }))} />
        {fertig ? <Ergebnis m={m} c={c} onNeu={wuerfeln} />
          : <div className="ger-karte gesperrt" data-ger-schritt="y"><span className="ger-nr">2</span><span className="ger-karte-titel">{zw("Geradengleichung aufschreiben", "Write down the equation")}</span></div>}
        </>}
      </div>
  );
  const zahlPad = pad.offen && <ZahlPad titel={pad.offen.titel} anzeige={anzeigeText || (pad.offen.id === "m" ? "" : mz(pad.text))} mitBruch={!!pad.offen.bruch} onTaste={pad.taste} />;

  /* Desktop: Aufgabe links, Schaubild rechts, Rechenschritte darunter */
  if (desktop) {
    return (
      <div className="ger-inhalt" data-ger-pm style={{ paddingBottom: pad.offen ? 232 : 0 }}>
        <Arbeitsflaeche
          links={<FeinKarte className="ger-aufgabe-desk">{aufgabeDesk}</FeinKarte>}
          rechts={<BildKarte>{bild}</BildKarte>} />
        <FeinKarte style={{ marginTop: 20 }}>
          <Kicker>{zw("Rechenweg", "Working")}</Kicker>
          {schritteListe}
        </FeinKarte>
        {zahlPad}
      </div>
    );
  }

  return (
    <div className="ger-inhalt" data-ger-pm style={{ paddingBottom: pad.offen ? 232 : 0 }}>
      {aufgabeKopf}
      {bild}
      {schritteListe}
      {zahlPad}
    </div>
  );
}

/* ---------------------------------------------------------------- Seite */
const CSS = `
.ger-seite{background:#fff;overflow-anchor:none}[data-trainings-session] .ger-seite{min-height:calc(100dvh - 61px)}
.ger-innen{max-width:620px;margin:0 auto;padding:10px 16px 24px}
.ger-seg{display:flex;padding:3px;border-radius:999px;background:#EEF2F8;gap:2px;min-height:42px}
.ger-seg button{flex:1;min-width:0;border-radius:999px;border:none;font-family:inherit;font-size:14.5px;font-weight:700;cursor:pointer;background:transparent;color:${C.grau};white-space:nowrap;padding:0 6px;overflow:hidden;text-overflow:ellipsis}
.ger-seg .ger-lang{display:none}@media(min-width:420px){.ger-seg .ger-lang{display:inline}.ger-seg .ger-kurz{display:none}}
.ger-seg button[aria-pressed="true"]{background:#fff;color:${C.see};box-shadow:0 1px 6px rgba(15,26,51,0.12)}
.ger-seg-klein{min-height:38px;margin-top:8px}
.ger-seg-klein{overflow:hidden}
.ger-seg-klein button{font-size:13px;padding:0 2px}
.ger-chipnr{display:inline-flex;width:17px;height:17px;border-radius:50%;align-items:center;justify-content:center;font-size:10.5px;background:${C.himmel};color:${C.see};margin-right:2px}
.ger-seg-klein button[aria-pressed="true"] .ger-chipnr{background:${C.flaggold};color:${C.seeTief}}
.ger-inhalt{margin-top:8px}
.ger-zeile1{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:34px}
.ger-titel{font-size:14px;font-weight:800;color:${C.gruenDunkel};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.ger-zeile2{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:42px}
.ger-frage{font-size:15px;font-weight:600;color:${C.tinte};white-space:nowrap}
.ger-modus{flex:0 1 auto;min-height:40px}
.ger-modus button{flex:0 0 auto;padding:0 14px;font-size:13.5px}
.ger-karte.ger-auto{padding:4px 12px;min-height:46px}
.ger-auto .ger-weg{flex:1;min-width:0;padding:2px 0}
.ger-wuerfel{width:42px;height:42px;flex-shrink:0;padding:0;border-radius:999px;border:none;cursor:pointer;background:${C.flaggold};font-size:21px;line-height:1;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(15,26,51,0.14)}
.ger-punkte{display:flex;align-items:center;justify-content:center;gap:10px;margin:2px 0 8px;white-space:nowrap;overflow-x:auto;scrollbar-width:none}
.ger-punkte::-webkit-scrollbar{display:none}
.ger-pt{font-size:clamp(20px,6.5vw,28px);font-weight:600;color:${C.tinte};display:inline-flex;align-items:center;gap:1px;line-height:1.5}
.ger-pt b{font-weight:800;margin-right:1px}
.ger-und{font-size:15px;font-weight:400;color:${C.grau}}
.ger-feld{font:inherit;font-weight:800;color:${C.see};background:rgba(0,77,152,0.07);border:2px solid transparent;border-radius:9px;padding:0 .16em;min-width:1.15em;line-height:1.3;cursor:pointer;scroll-margin-bottom:250px;display:inline-flex;align-items:center;justify-content:center}
.ger-feld.an{border-color:${GOLD};background:rgba(237,187,0,0.18)}
.ger-feld.an::after{content:"";display:inline-block;width:2px;height:.85em;background:${GOLD};margin-left:2px;animation:gerBlink 1s steps(2,start) infinite}
@keyframes gerBlink{to{visibility:hidden}}
.ger-bild{width:min(100%,max(250px,calc((100dvh - 430px) * ${PHI.toFixed(3)})));aspect-ratio:${PHI.toFixed(4)} / 1;margin:0 auto;background:#fff;border-radius:12px}
.ger-griff:focus-visible{stroke:${C.see};stroke-width:2}
.ger-schritte{margin-top:8px;display:grid;grid-template-columns:minmax(0,1fr);gap:6px}
.ger-karte{border-radius:14px;border:1.5px solid ${C.linie};background:#fff;padding:0 12px;min-height:38px;display:flex;align-items:center;gap:9px;scroll-margin-bottom:250px}
.ger-karte.gesperrt{background:#F6F8FC;color:${C.hellgrau};border-style:dashed}
.ger-karte.fertig{background:#EEF8F2;border-color:#BFE3CF;color:${C.tinte}}
.ger-karte.hinweis{background:#FFF6E0;border-color:#F0D58A;color:${C.tinte};padding:10px 12px;font-size:13.5px;line-height:1.5}
.ger-karte.aktiv{flex-direction:column;align-items:stretch;gap:6px;padding:9px 12px 10px;border-color:${C.see};box-shadow:0 4px 16px rgba(0,77,152,0.12)}
.ger-kopf{display:flex;align-items:center;gap:8px;min-height:30px}
.ger-nr{flex-shrink:0;width:22px;height:22px;border-radius:50%;background:${C.himmel};color:${C.see};font-size:12px;font-weight:800;display:inline-flex;align-items:center;justify-content:center}
.ger-karte.aktiv .ger-nr{background:${C.see};color:#fff}
.ger-nr.ok{background:${C.smaragd};color:#fff}
.ger-karte-titel{flex:1;min-width:0;font-size:14.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ger-karte.gesperrt .ger-karte-titel{font-weight:600}
.ger-zus{font-size:17px;font-weight:700;flex:1;min-width:0}
.ger-klein{font-size:11.5px;color:${C.grau};white-space:nowrap}
.ger-zeig{flex-shrink:0;height:30px;padding:0 12px;border-radius:999px;border:1.5px solid ${C.linie};background:#fff;color:${C.see};font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap}
.ger-rechnung{display:flex;align-items:center;gap:8px;font-size:19px;font-weight:700;overflow-x:auto;scrollbar-width:none;min-height:48px}
.ger-rechnung::-webkit-scrollbar{display:none}
.ger-label{white-space:nowrap}
.ger-hint{opacity:.5;color:${C.grau};font-weight:500;font-size:16px;white-space:nowrap}
.ger-antwort{font:inherit;font-weight:800;color:${C.see};min-width:68px;height:44px;padding:0 10px;border-radius:12px;border:2px dashed ${GOLD};background:rgba(237,187,0,0.08);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;scroll-margin-bottom:250px}
.ger-antwort.an{border-style:solid;background:rgba(237,187,0,0.2)}
.ger-antwort.falsch{border-color:${C.signal};background:rgba(184,92,46,0.08)}
.ger-platz{color:${C.hellgrau};font-weight:700}
.ger-fehler{font-size:13px;line-height:1.45;color:${C.signal};margin:0}
.ger-weg{overflow-x:auto;scrollbar-width:none;white-space:nowrap;font-size:17px;padding:2px 0 4px}
.ger-weg::-webkit-scrollbar{display:none}
.ger-weiter{height:38px;border-radius:12px;border:none;background:${C.see};color:#fff;font-family:inherit;font-size:14.5px;font-weight:700;cursor:pointer}
.ger-ergebnis{display:flex;align-items:center;gap:10px;border-radius:14px;border:2px solid ${C.flaggold};background:#FFFBEA;padding:8px 12px;min-height:58px}
.ger-gleichung{flex:1;min-width:0;font-size:25px;font-weight:800;color:${C.seeTief};overflow-x:auto;white-space:nowrap;scrollbar-width:none}
.ger-neu{flex-shrink:0;height:40px;padding:0 14px;border-radius:999px;border:none;background:${C.flaggold};color:${C.seeTief};font-family:inherit;font-size:13.5px;font-weight:800;cursor:pointer;white-space:nowrap}
.ger-text{font-size:14px;line-height:1.5;color:${C.tinte};margin:0 0 8px}
.ger-formel{font-weight:800;color:${C.see};white-space:nowrap}
.ger-lesen{margin-top:8px;border-radius:14px;background:${C.sand};border:1px solid ${C.linie};padding:8px 12px;min-height:74px}
.ger-lesen-text{font-size:13px;line-height:1.45;color:${C.grau};margin:0 0 4px}
.ger-lesen-rechnung{display:flex;align-items:center;gap:10px;font-size:15.5px;font-weight:800;color:${C.seeTief};min-height:28px;flex-wrap:wrap}
.ger-t{color:${C.see};white-space:nowrap}
.ger-gr{white-space:nowrap}
.ger-haken{color:${C.smaragd}}
.ger-spiel{margin-left:auto;width:30px;height:30px;border-radius:50%;border:1.5px solid ${C.linie};background:#fff;color:${C.see};font-size:11px;cursor:pointer;padding:0}
.ger-regler-block{margin-top:6px;display:grid;gap:2px}
.ger-regler{display:flex;align-items:center;gap:8px;min-height:36px}
.ger-rn{width:14px;font-size:15px;font-weight:800;text-align:center}
.ger-regler input[type=range]{flex:1;min-width:0}
.ger-rb{width:30px;height:30px;border-radius:50%;border:1.5px solid;font-family:inherit;font-size:17px;font-weight:800;line-height:1;cursor:pointer;padding:0;touch-action:manipulation}
.ger-rb:disabled{opacity:.35;cursor:default}
.ger-rw{min-width:34px;text-align:right;font-size:15px;font-weight:800;color:${C.tinte};font-variant-numeric:tabular-nums}
@media (max-width:440px){.ger-chipnr{display:none}}
@media (max-width:440px){.ger-seg:not(.ger-modus) button{font-size:13px;padding:0 4px;white-space:normal;line-height:1.15}}
@media (max-width:380px){.ger-frage{font-size:14px}.ger-seg button{font-size:13.5px}.ger-neu{padding:0 11px;font-size:12.5px}}
@media (min-width:601px){
  .ger-seite{background:transparent}
  .ger-innen{background:#fff;border-radius:16px;padding:16px 18px 22px;margin-top:14px;box-shadow:0 2px 16px rgba(15,26,51,0.07)}
}
/* Desktop (Kurs Mittelstufe, Breite der Kopfleiste): Eingaben und Schritte links, Schaubild rechts (mitlaufend).
   Das Bild überspannt alle Zeilen; die letzte Zeile ist flexibel, damit links keine Lücken entstehen. */
@media (min-width:840px){
  .ger-innen{max-width:none;width:var(--tr-breite);padding:18px 22px 24px}
  .ger-seg:not(.ger-modus){max-width:540px}
  .ger-inhalt{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1.3fr);grid-template-rows:repeat(5,auto) 1fr;column-gap:26px;align-items:start;margin-top:14px}
  .ger-inhalt > *{grid-column:1}
  .ger-inhalt > .ger-bild{grid-column:2;grid-row:1 / -1;width:100%;position:sticky;top:${38 + 14}px}
  .ger-inhalt .ger-punkte{justify-content:flex-start}
  .ger-zeile1{flex-wrap:wrap;row-gap:6px;justify-content:flex-start}
  .ger-zeile1 > .ger-titel{flex:1 0 100%;white-space:normal}
  .ger-inhalt > .ger-text,.ger-inhalt > .ger-lesen{margin-top:0}
  .ger-inhalt > .ger-lesen{margin-bottom:8px}
}
@media (prefers-reduced-motion:reduce){.ger-feld.an::after{animation:none}}
`;

export function Geradengleichung({ start = "basics", startModus = "training" }) {
  const [tab, setTab] = useState(start);
  const [modus, setModus] = useState(startModus === "auto" ? "auto" : "training");   // Standard wie im Ableitungstrainer: Trainieren
  const desktop = useDesktop();
  const [bildRef, bildBreite] = useBreite();
  const reiter = (
    <div className="ger-seg" role="group" aria-label={zw("Geradentrainer", "Line trainer")}>
      {[["basics", "Grundlagen", "Grundlagen"], ["pq", "Zwei Punkte", "P und Q"], ["pm", "Punkt und Steigung", "P und m"]].map(([id, name, kurz]) => (
        <button key={id} type="button" data-ger-tab={id} aria-pressed={tab === id} onClick={() => setTab(id)} title={name}><span className="ger-lang">{name}</span><span className="ger-kurz">{kurz}</span></button>
      ))}
    </div>
  );
  const inhalt = <>
    {tab === "basics" && <Basics />}
    {tab === "pq" && <PundQ modus={modus} setModus={setModus} />}
    {tab === "pm" && <PundM modus={modus} setModus={setModus} />}
  </>;

  /* Desktop: Spalte wie alle Werkzeugseiten, Schaubild in echten Pixeln (Breite der rechten Spalte, goldener Schnitt) */
  if (desktop) {
    const W = Math.max(300, (bildBreite || 442) - 2);   // minus Rahmen der Bildkarte
    const H = Math.round((W / PHI) * 10) / 10;
    return (
      <div className="ger-seite ger-desk" data-ger="breit">
        <style>{CSS}</style>
        <style>{GER_DESK_CSS}</style>
        <div className="ger-innen">
          {reiter}
          {/* Messleiste: so breit wie die rechte Spalte der Arbeitsfläche */}
          <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "minmax(0, 290px) minmax(0, 1fr)", columnGap: 20, height: 0, overflow: "hidden" }}>
            <div /><div ref={bildRef} />
          </div>
          <MassCtx.Provider value={{ W, H, desk: true }}>{inhalt}</MassCtx.Provider>
        </div>
      </div>
    );
  }

  return (
    <div className="ger-seite">
      <style>{CSS}</style>
      <div className="ger-innen">
        {reiter}
        {inhalt}
      </div>
    </div>
  );
}

/* Desktop (ab 840 px): Spalte 783 px, Karten mit feinem Rahmen, Bild über die volle Breite der rechten Spalte */
const GER_DESK_CSS = kompaktSpalteCss("ger-desk") + `
  .ger-desk .ger-innen{max-width:none;background:transparent;border-radius:0;padding:0;margin:0;box-shadow:none}
  .ger-desk .ger-inhalt{margin-top:20px;display:block}   /* Arbeitsfläche regelt die Spalten selbst – das alte Raster (ab 840 px) quetschte sie samt Bild in die linke Spalte */
  .ger-desk .ger-bild{width:100%;border-radius:0}
  .ger-desk .ger-text{margin:0;font-size:14.5px;line-height:1.6}
  .ger-desk .ger-lesen{margin-top:0;background:#fff;border-radius:16px;padding:16px 18px}
  .ger-desk .ger-chips{display:flex;flex-wrap:wrap;gap:6px;min-height:0;margin:0;overflow:visible}
  .ger-desk .ger-chips .ger-chipnr{display:inline-flex}
  .ger-desk .ger-aufgabe-desk .ger-frage{white-space:normal;font-size:14.5px}
  .ger-desk .ger-aufgabe-desk .ger-punkte{flex-direction:column;align-items:flex-start;gap:2px;margin:10px 0 0}
  .ger-desk .ger-aufgabe-desk .ger-pt{font-size:26px}
  .ger-desk .ger-schritte{margin-top:0;gap:8px}
`;
