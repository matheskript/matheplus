import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { L } from "./funcHeadNumbersBasis.jsx";
import { GOLD, NACHT, useBewegung } from "./funcGleichKursBasis.jsx";

/* ======================================================================
   Motion-Film „Wir suchen eine Zahl“
   Sieben Szenen, vom Rechnen (7 · 8 → 56) über die erste Gleichung
   (7 · x = 56 → 8) bis zu x² = 49 und 2^x = 32. Jede Szene zeigt dieselbe
   Idee: eine Information über eine unbekannte Zahl – und der Weg zu ihr.
   Gesteuert über einen Zeitplan je Szene (Phasen), Bühne rein mit React +
   CSS-Übergängen. Bei „weniger Bewegung“ läuft nichts von selbst: Man blättert
   mit „Weiter“ durch die Phasen.
   ====================================================================== */

const sichtbar = (an) => ({ opacity: an ? 1 : 0, transform: an ? "none" : "translateY(10px)", transition: "opacity .5s ease, transform .5s ease" });

/* Kasten für die gesuchte Zahl: zeigt „?“/„x“ und wechselt auf den Wert */
function Feld({ inhalt, gold = false, puls = false }) {
  return (
    <span className={puls ? "gkf-puls" : undefined}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "1.6em", height: "1.45em", padding: "0 .3em", margin: "0 .12em", borderRadius: ".35em", fontWeight: 800,
        border: `2px solid ${GOLD}`, background: gold ? GOLD : "rgba(237,187,0,0.12)", color: gold ? NACHT : GOLD, transition: "background .45s ease, color .45s ease" }}>{inhalt}</span>
  );
}

/* Zeile einer Rechnung auf der dunklen Bühne: l = r | op */
function Z({ l, r, op, an, opAn, loesung }) {
  return (
    <>
      <span style={{ justifySelf: "end", whiteSpace: "nowrap", ...sichtbar(an) }}>{typeof l === "string" ? <M t={l} /> : l}</span>
      <span style={{ color: "rgba(255,255,255,0.55)", ...sichtbar(an) }}>=</span>
      <span style={{ whiteSpace: "nowrap", ...sichtbar(an) }}>{loesung ? <Feld inhalt={<M t={r} />} gold /> : typeof r === "string" ? <M t={r} /> : r}</span>
      <span style={{ whiteSpace: "nowrap", fontSize: ".62em", fontWeight: 700, color: GOLD, paddingLeft: 8, borderLeft: op ? "2px solid rgba(255,255,255,0.18)" : "none", ...sichtbar(opAn) }}>{op ? <M t={op} /> : ""}</span>
    </>
  );
}
const Raster = ({ children, groesse = "clamp(19px, 5.4vw, 26px)" }) => (
  <div style={{ display: "grid", gridTemplateColumns: "auto auto auto auto", columnGap: 10, rowGap: 8, alignItems: "center", justifyContent: "center", fontSize: groesse, color: "#fff", fontWeight: 600 }}>{children}</div>
);
const Info = ({ an, children }) => (
  <p style={{ textAlign: "center", fontSize: "clamp(13.5px, 3.8vw, 15.5px)", color: "#DCE5F6", lineHeight: 1.45, margin: "0 auto 14px", maxWidth: 440, ...sichtbar(an) }}>
    <span style={{ color: GOLD, fontWeight: 700, marginRight: 6 }}>{L("Information:", "We know:")}</span>{children}
  </p>
);
const Notiz = ({ an, children }) => (
  <p style={{ textAlign: "center", marginTop: 12, fontSize: 13.5, color: "rgba(220,229,246,0.9)", ...sichtbar(an) }}>{children}</p>
);

/* ---------------------------------------------------------------- Szenen */
const SZENEN = () => [
  {
    id: "rechnen", chip: L("Rechnen", "Calculating"), grad: 0, dauer: [1500, 1700, 2600],
    text: L("<b>Rechnen:</b> Wir kennen alle Zahlen und machen daraus eine neue. Aus 7 · 8 wird 56.", "<b>Calculating:</b> we know all the numbers and make a new one. 7 · 8 becomes 56."),
    buehne: (p) => (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "clamp(30px, 9vw, 44px)", fontWeight: 700, color: "#fff", ...sichtbar(true) }}>
          7 · 8 = <Feld inhalt={p >= 1 ? "56" : "?"} gold={p >= 1} puls={p === 0} />
        </div>
        <Notiz an={p >= 2}>{L("bekannt  →  neue Zahl", "known  →  new number")}</Notiz>
      </div>
    ),
  },
  {
    id: "gleichung", chip: L("Gleichung", "Equation"), grad: 1, dauer: [1700, 1500, 1300, 1500, 2600],
    text: L("<b>Gleichung:</b> Wir wissen etwas über eine Zahl – sie mal 7 ergibt 56. Gesucht ist die Zahl selbst: 8.", "<b>Equation:</b> we know something about a number – times 7 it gives 56. We are looking for the number itself: 8."),
    buehne: (p) => (
      <>
        <Info an={p >= 0}>{L("Eine Zahl mal 7 ergibt 56.", "A number times 7 gives 56.")}</Info>
        <Raster groesse="clamp(24px, 7vw, 32px)">
          <Z an={p >= 1} l={<span>7 · <Feld inhalt="x" puls={p === 1} /></span>} r="56" op=": 7" opAn={p >= 2} />
          <Z an={p >= 3} l="x" r="8" loesung />
        </Raster>
        <Notiz an={p >= 4}>{L("Probe: 7 · 8 = 56 ✓", "Check: 7 · 8 = 56 ✓")}</Notiz>
      </>
    ),
  },
  {
    id: "zwei", chip: L("Stufe 2 · zwei Schritte", "Level 2 · two steps"), grad: 2, dauer: [1900, 1400, 1500, 1500, 2400],
    text: L("Die Information kann aus <b>mehreren Rechnungen</b> bestehen. Wir gehen sie rückwärts: erst − 5, dann : 3.", "The information can consist of <b>several operations</b>. We walk them backwards: first − 5, then : 3."),
    buehne: (p) => (
      <>
        <Info an={p >= 0}>{L("Eine Zahl mal 3, dann plus 5, ergibt 26.", "A number times 3, then plus 5, gives 26.")}</Info>
        <Raster>
          <Z an={p >= 1} l="3x + 5" r="26" op="− 5" opAn={p >= 2} />
          <Z an={p >= 2} l="3x" r="21" op=": 3" opAn={p >= 3} />
          <Z an={p >= 3} l="x" r="7" loesung />
        </Raster>
      </>
    ),
  },
  {
    id: "beide", chip: L("Stufe 3 · x auf beiden Seiten", "Level 3 · x on both sides"), grad: 3, dauer: [2300, 1300, 1300, 1300, 1400, 2300],
    text: L("Die Zahl darf auch <b>auf beiden Seiten</b> stehen. Erst sammeln wir alle x auf einer Seite.", "The number may appear <b>on both sides</b>. First we gather all x on one side."),
    buehne: (p) => (
      <>
        <Info an={p >= 0}>{L("5-mal die Zahl minus 4 ist so viel wie 2-mal die Zahl plus 11.", "5 times the number minus 4 equals 2 times the number plus 11.")}</Info>
        <Raster>
          <Z an={p >= 1} l="5x − 4" r="2x + 11" op="− 2x" opAn={p >= 2} />
          <Z an={p >= 2} l="3x − 4" r="11" op="+ 4" opAn={p >= 3} />
          <Z an={p >= 3} l="3x" r="15" op=": 3" opAn={p >= 4} />
          <Z an={p >= 4} l="x" r="5" loesung />
        </Raster>
      </>
    ),
  },
  {
    id: "quadrat", chip: L("Stufe 6 · zwei Zahlen passen", "Level 6 · two numbers fit"), grad: 4, dauer: [1900, 1400, 1600, 1600, 2600],
    text: L("Manchmal passen sogar <b>zwei Zahlen</b> zu derselben Information: 7 und −7.", "Sometimes even <b>two numbers</b> fit the same information: 7 and −7."),
    buehne: (p) => (
      <>
        <Info an={p >= 0}>{L("Eine Zahl mit sich selbst malgenommen ergibt 49.", "A number multiplied by itself gives 49.")}</Info>
        <Raster>
          <Z an={p >= 1} l="x^{2}" r="49" op="\sqrt{\;}" opAn={p >= 2} />
          <Z an={p >= 2} l="x_{1}" r="−7" loesung />
          <Z an={p >= 3} l="x_{2}" r="7" loesung />
        </Raster>
        <Notiz an={p >= 4}>(−7) · (−7) = 49 {L("und", "and")} 7 · 7 = 49</Notiz>
      </>
    ),
  },
  {
    id: "exponent", chip: L("Stufe 7 · x im Exponenten", "Level 7 · x in the exponent"), grad: 5, dauer: [2200, 1400, 1700, 1500, 2600],
    text: L("Und manchmal steckt die Zahl <b>ganz woanders</b> – im Exponenten. Die Frage bleibt dieselbe.", "And sometimes the number hides <b>somewhere else</b> – in the exponent. The question stays the same."),
    buehne: (p) => (
      <>
        <Info an={p >= 0}>{L("So viele Zweien miteinander malgenommen ergeben 32.", "That many twos multiplied together give 32.")}</Info>
        <Raster>
          <Z an={p >= 1} l="2^{x}" r="32" op="32 = 2^{5}" opAn={p >= 2} />
          <Z an={p >= 2} l="2^{x}" r="2^{5}" op={L("\\text{Exponenten vergleichen}", "\\text{compare exponents}")} opAn={p >= 3} />
          <Z an={p >= 3} l="x" r="5" loesung />
        </Raster>
      </>
    ),
  },
  {
    id: "finale", chip: L("Das ganze Thema", "The whole topic"), grad: 5, dauer: [1300, 900, 900, 900, 900, 900, 3600],
    text: L("<b>Das ist das ganze Thema Gleichungen:</b> eine Information über eine Zahl – und der Weg zu ihr. Egal wie schwer die Information ist.", "<b>That is the whole topic of equations:</b> information about a number – and the way to it. No matter how hard the information is."),
    buehne: (p) => {
      const reihen = [["7 · x = 56", "8"], ["3x + 5 = 26", "7"], ["5x − 4 = 2x + 11", "5"], ["x^{2} = 49", "±7"], ["2^{x} = 32", "5"]];
      return (
        <div>
          <p style={{ textAlign: "center", color: "#fff", fontSize: "clamp(16px, 4.6vw, 19px)", fontWeight: 700, marginBottom: 12, ...sichtbar(p >= 0) }}>
            {L("Immer dieselbe Frage: ", "Always the same question: ")}<span style={{ color: GOLD }}>{L("Welche Zahl ist es?", "Which number is it?")}</span>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "auto auto auto", columnGap: 12, rowGap: 6, alignItems: "center", justifyContent: "center", fontSize: "clamp(15px, 4.3vw, 19px)", color: "#fff", fontWeight: 600 }}>
            {reihen.map(([g, x], i) => (
              <React.Fragment key={g}>
                <span style={{ justifySelf: "end", whiteSpace: "nowrap", ...sichtbar(p >= i + 1) }}><M t={g} /></span>
                <span style={{ color: GOLD, ...sichtbar(p >= i + 1) }}>⟶</span>
                <span style={{ ...sichtbar(p >= i + 1) }}><Feld inhalt={<M t={`x = ${x}`} />} gold /></span>
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    },
  },
];

export function GleichungsFilm({ onEnde }) {
  const bewegung = useBewegung();
  const szenen = SZENEN();
  const [s, setS] = useState(0);
  const [p, setP] = useState(0);
  const [laeuft, setLaeuft] = useState(true);
  const [ende, setEnde] = useState(false);
  const gemeldet = useRef(false);
  const sz = szenen[s];
  const letzteSzene = s === szenen.length - 1;
  const auto = laeuft && bewegung && !ende;

  const vor = () => {
    if (p + 1 < sz.dauer.length) { setP(p + 1); return; }
    if (!letzteSzene) { setS(s + 1); setP(0); return; }
    setEnde(true);
  };
  useEffect(() => {
    if (!auto) return undefined;
    const id = setTimeout(vor, sz.dauer[p]);
    return () => clearTimeout(id);
  });
  useEffect(() => {
    if (letzteSzene && p >= 3 && !gemeldet.current) { gemeldet.current = true; onEnde && onEnde(); }
  }, [s, p]);

  const springe = (i) => { setS(i); setP(bewegung && laeuft ? 0 : szenen[i].dauer.length - 1); setEnde(false); };
  const neu = () => { setS(0); setP(0); setEnde(false); setLaeuft(true); };
  const fortschritt = (i) => (i < s ? 1 : i > s ? 0 : (p + 1) / sz.dauer.length);

  return (
    <div role="region" aria-label={L("Kurzfilm: Gleichungen – wir suchen eine Zahl", "Short film: equations – we are looking for a number")}
      style={{ borderRadius: 20, overflow: "hidden", background: `linear-gradient(160deg, ${NACHT} 0%, #163A7A 100%)`, padding: "14px 14px 12px", boxShadow: "0 10px 28px rgba(14,30,74,0.25)", marginBottom: 16 }}>
      <style>{`
        @keyframes gkfPuls { 0%,100% { box-shadow: 0 0 0 0 rgba(237,187,0,.55); } 50% { box-shadow: 0 0 0 7px rgba(237,187,0,0); } }
        .gkf-puls { animation: gkfPuls 1.1s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .gkf-puls { animation: none; } }
      `}</style>
      {/* Kopfzeile: Szene und Schwierigkeitsgrad */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span key={sz.id} style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: GOLD, animation: "gkZeile .4s ease both" }}>{sz.chip}</span>
        <span aria-label={`${L("Schwierigkeit", "Difficulty")} ${sz.grad} / 5`} style={{ display: "inline-flex", gap: 3, alignItems: "flex-end" }}>
          {[1, 2, 3, 4, 5].map((g) => <i key={g} style={{ width: 6, height: 5 + g * 2.4, borderRadius: 2, background: g <= sz.grad ? GOLD : "rgba(255,255,255,0.18)", transition: "background .4s ease" }} />)}
        </span>
      </div>
      <style>{`@keyframes gkZeile { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
      {/* Bühne */}
      <div aria-live="polite" style={{ minHeight: 236, display: "flex", flexDirection: "column", justifyContent: "center", padding: "6px 0" }}>
        <div key={sz.id} style={{ animation: "gkZeile .45s ease both" }}>{sz.buehne(p)}</div>
      </div>
      {/* Untertitel */}
      <p key={`t-${sz.id}`} style={{ minHeight: 64, margin: "6px 2px 10px", color: "#DCE5F6", fontSize: 13.5, lineHeight: 1.55, animation: "gkZeile .45s ease both" }}
        dangerouslySetInnerHTML={{ __html: sz.text.replace(/<b>/g, '<b style="color:#fff;font-weight:700">') }} />
      {/* Steuerung */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button type="button" onClick={() => (ende ? neu() : bewegung ? setLaeuft(!laeuft) : vor())}
          aria-label={ende ? L("Noch einmal abspielen", "Play again") : bewegung ? (laeuft ? L("Pause", "Pause") : L("Abspielen", "Play")) : L("Weiter", "Next")}
          style={{ flexShrink: 0, minWidth: 44, height: 44, padding: bewegung && !ende ? 0 : "0 14px", borderRadius: 999, border: "none", background: GOLD, color: NACHT, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
          {ende ? "↻" : bewegung ? (laeuft ? "❚❚" : "▶") : L("Weiter ›", "Next ›")}
        </button>
        <div style={{ flex: 1, display: "flex", gap: 5 }}>
          {szenen.map((x, i) => (
            <button key={x.id} type="button" onClick={() => springe(i)} aria-label={`${L("Szene", "Scene")} ${i + 1}: ${x.chip}`} aria-current={i === s ? "step" : undefined}
              style={{ flex: 1, height: 24, padding: "10px 0", border: "none", background: "transparent", cursor: "pointer" }}>
              <span style={{ display: "block", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: `${fortschritt(i) * 100}%`, background: GOLD, transition: "width .5s ease" }} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
