/* ======================================================================
   SCHRIFTLICH RECHNEN — Plus & Minus untereinander und schriftliche
   Division, wie man es in der Grundschule auf Kästchenpapier lernt.
   Das Zahlenfeld (Tastenblock) wird aus func14 übergeben, damit diese
   Datei nichts aus func14 importieren muss.
   ====================================================================== */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";

const L = (de, en) => (englisch() ? en : de);
const zufall = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const mitStellen = (d) => zufall(d === 1 ? 2 : 10 ** (d - 1), 10 ** d - 1);

/* ---------- Kästchenpapier ----------
   zeilen: [{ zellen: { spalte: { t, farbe, fett, klein } }, linie: [von, bis], doppelt }]
   Jede Zeile ist eine Kästchenreihe; „linie“ zieht den Strich über die Reihe. */
function Kaestchen({ spalten, zeilen, gross }) {
  const g = `min(${gross ? 36 : 32}px, calc((100vw - 92px) / ${spalten}))`;
  return (
    <div style={{ display: "flex", justifyContent: "center", overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${spalten}, ${g})`, gridAutoRows: g,
        borderTop: "1px solid #D3E0F2", borderLeft: "1px solid #D3E0F2", backgroundColor: "#FBFDFF", fontVariantNumeric: "tabular-nums" }}>
        {zeilen.map((z, r) => Array.from({ length: spalten }, (_, c) => {
          const zelle = z.zellen[c];
          const strich = z.linie && c >= z.linie[0] && c <= z.linie[1];
          return (
            <span key={`${r}-${c}`} style={{ display: "flex", alignItems: zelle?.klein ? "flex-start" : "center", justifyContent: zelle?.klein ? "flex-end" : "center",
              padding: zelle?.klein ? "1px 3px 0 0" : 0, boxSizing: "border-box",
              borderRight: "1px solid #D3E0F2", borderBottom: "1px solid #D3E0F2",
              borderTop: strich ? `${z.doppelt ? 4 : 2}px ${z.doppelt ? "double" : "solid"} ${C.tinte}` : "none",
              fontSize: zelle?.klein ? `calc(${g} * 0.38)` : `calc(${g} * 0.62)`, fontWeight: zelle?.fett ? 800 : 600,
              color: zelle?.farbe || C.tinte, lineHeight: 1 }}>
              {zelle?.t ?? ""}
            </span>
          );
        }))}
      </div>
    </div>
  );
}

/* Auswahl-Chips (Stellen, Art, Rest) */
function Chips({ label, optionen, wert, setWert, gesperrt = () => false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
      <span style={{ fontSize: 12.5, color: C.grau, width: 70, flexShrink: 0, lineHeight: 1.2 }}>{label}</span>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${optionen.length}, minmax(0, 1fr))`, gap: 5 }}>
        {optionen.map(([w, text]) => {
          const zu = gesperrt(w), an = wert === w;
          return (
            <button key={w} onClick={() => !zu && setWert(w)} disabled={zu}
              style={{ height: 36, borderRadius: 999, fontFamily: "inherit", cursor: zu ? "not-allowed" : "pointer", fontSize: "clamp(11.5px, 3.3vw, 13.5px)", fontWeight: 600,
                border: `1px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : zu ? "#B8C1CE" : C.see, whiteSpace: "nowrap", padding: "0 4px" }}>
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const karte = { background: C.weiss, borderRadius: 18, padding: "18px 16px", boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };

function Zaehler({ richtig, gesamt, serie }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontSize: 13, color: C.grau }}>
      <span>{L("Richtig", "Correct")}: <b style={{ color: C.tinte }}>{richtig}</b> {L("von", "of")} {gesamt}</span>
      {serie >= 3 && <span style={{ fontWeight: 700, color: C.gruen }}>🔥 {serie}</span>}
    </div>
  );
}

function Rueckmeldung({ rueck, text }) {
  if (!rueck) return null;
  const ok = rueck === "richtig";
  return (
    <p style={{ marginTop: 12, textAlign: "center", fontSize: 15.5, fontWeight: 700, color: ok ? C.smaragd : C.signal }}>
      {ok ? L("Richtig! ✓", "Correct! ✓") : text}
    </p>
  );
}

const weiterKnopf = { width: "100%", height: 50, marginTop: 12, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit",
  fontSize: 16, fontWeight: 700, color: C.weiss, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` };

/* Tastatur am Rechner: Ziffern, Rücktaste, Enter */
function useTastatur(onZiffer, onLoeschen, onOk) {
  useEffect(() => {
    const taste = (e) => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (/^[0-9]$/.test(e.key)) onZiffer(e.key);
      else if (e.key === "Backspace") onLoeschen();
      else if (e.key === "Enter") onOk();
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  });
}

/* ====================================================================
   1) SCHRIFTLICH PLUS & MINUS
   ==================================================================== */
function plusMinusAufgabe(art, stellen) {
  const op = art === "mix" ? (Math.random() < 0.5 ? "+" : "−") : art === "plus" ? "+" : "−";
  let a = mitStellen(stellen), b = mitStellen(Math.max(1, stellen - (Math.random() < 0.35 ? 1 : 0)));
  if (op === "−" && b > a) [a, b] = [b, a];
  if (op === "−" && a === b) a += 1;
  return { a, b, op, ergebnis: op === "+" ? a + b : a - b };
}

/* Überträge spaltenweise (von rechts): Addition klassisch, Subtraktion im Ergänzungsverfahren */
function uebertraege(a, b, op, breite) {
  const A = String(a).padStart(breite, "0"), B = String(b).padStart(breite, "0");
  const u = Array(breite).fill(0);
  let c = 0;
  for (let i = breite - 1; i >= 0; i--) {
    const x = Number(A[i]), y = Number(B[i]) + c;
    if (op === "+") { c = x + y >= 10 ? 1 : 0; } else { c = y > x ? 1 : 0; }
    if (i > 0) u[i - 1] = c;
  }
  return u;
}

export function SchriftlichPlusMinus({ Zahlenfeld }) {
  const [art, setArt] = useState("plus");
  const [stellen, setStellen] = useState(3);
  const neu = useCallback(() => plusMinusAufgabe(art, stellen), [art, stellen]);
  const [aufg, setAufg] = useState(() => neu());
  const [eingabe, setEingabe] = useState("");          // von rechts nach links geschrieben
  const [rueck, setRueck] = useState(null);
  const [stand, setStand] = useState({ richtig: 0, gesamt: 0, serie: 0 });
  const timer = useRef(null);

  useEffect(() => { clearTimeout(timer.current); setAufg(neu()); setEingabe(""); setRueck(null); }, [neu]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const weiter = () => { clearTimeout(timer.current); setAufg(neu()); setEingabe(""); setRueck(null); };
  const breite = Math.max(String(aufg.a).length, String(aufg.b).length, String(aufg.ergebnis).length);
  const spalten = breite + 1;
  // Ziffer kommt links vor die bisherigen – so wie man von den Einern aus nach links schreibt
  const ziffer = (z) => { if (!rueck) setEingabe((v) => (v.length >= breite ? v : z + v)); };
  const loeschen = () => { if (!rueck) setEingabe((v) => v.slice(1)); };
  const pruefen = () => {
    if (rueck || !eingabe) return;
    const ok = Number(eingabe) === aufg.ergebnis;
    setRueck(ok ? "richtig" : "falsch");
    setStand((s) => ({ richtig: s.richtig + (ok ? 1 : 0), gesamt: s.gesamt + 1, serie: ok ? s.serie + 1 : 0 }));
    if (ok) timer.current = setTimeout(weiter, 1100);
  };
  useTastatur(ziffer, loeschen, rueck === "falsch" ? weiter : pruefen);

  const zeileZahl = (n, extra = {}) => {
    const s = String(n), z = {};
    [...s].forEach((ch, i) => { z[spalten - s.length + i] = { t: ch, ...extra }; });
    return z;
  };
  const ue = uebertraege(aufg.a, aufg.b, aufg.op, breite);
  const ueZeile = {};
  if (rueck) ue.forEach((u, i) => { if (u) ueZeile[i + 1] = { t: "1", farbe: C.signal, klein: true }; });
  const eZeile = {};
  [...eingabe].forEach((ch, i) => { eZeile[spalten - eingabe.length + i] = { t: ch, fett: true, farbe: rueck === "richtig" ? C.smaragd : rueck === "falsch" ? C.signal : C.see }; });
  if (!rueck && eingabe.length < breite) eZeile[spalten - eingabe.length - 1] = { t: "▮", farbe: "rgba(0,77,152,0.35)" };

  const zeilen = [
    { zellen: zeileZahl(aufg.a) },
    { zellen: { 0: { t: aufg.op, farbe: C.see }, ...zeileZahl(aufg.b) } },
    { zellen: ueZeile },
    { zellen: eZeile, linie: [0, spalten - 1], doppelt: true },
  ];
  if (rueck === "falsch") zeilen.push({ zellen: zeileZahl(aufg.ergebnis, { farbe: C.smaragd, fett: true }) });

  return (
    <div>
      <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.65, marginBottom: 14 }}>
        {L("Rechne untereinander wie im Heft: Beginne rechts bei den Einern und schreibe nach links. Überträge merkst du dir – nach dem Prüfen siehst du sie klein in Rot.",
          "Calculate in columns like in your exercise book: start on the right with the ones and write to the left. Keep carries in mind – after checking you see them small in red.")}
      </p>
      <Chips label={L("Rechenart", "Operation")} optionen={[["plus", "Plus"], ["minus", "Minus"], ["mix", L("Gemischt", "Mixed")]]} wert={art} setWert={setArt} />
      <Chips label={L("Stellen", "Digits")} optionen={[2, 3, 4, 5, 6].map((d) => [d, String(d)])} wert={stellen} setWert={setStellen} />
      <div style={{ ...karte, marginTop: 6 }}>
        <Zaehler {...stand} />
        <Kaestchen spalten={spalten} zeilen={zeilen} gross />
        <Rueckmeldung rueck={rueck} text={L(`Leider nicht – richtig ist ${aufg.ergebnis}. Schau dir die Überträge an.`, `Not quite – the answer is ${aufg.ergebnis}. Look at the carries.`)} />
        <p style={{ fontSize: 12, color: C.hellgrau, textAlign: "center", margin: "10px 0 12px" }}>
          {L("Tippe die Ziffern von rechts nach links ein.", "Type the digits from right to left.")}
        </p>
        {rueck === "falsch" ? <button onClick={weiter} style={weiterKnopf}>{L("Nächste Aufgabe", "Next task")}</button>
          : <Zahlenfeld gesperrt={!!rueck} onZiffer={ziffer} onLoeschen={loeschen} onOk={pruefen} />}
      </div>
    </div>
  );
}

/* ====================================================================
   2) SCHRIFTLICHE DIVISION
   ==================================================================== */
function divisionAufgabe(stDividend, stDivisor, mitRest) {
  for (let versuch = 0; versuch < 400; versuch++) {
    const d = mitStellen(stDivisor);
    if (!mitRest) {
      const qMin = Math.max(2, Math.ceil(10 ** (stDividend - 1) / d)), qMax = Math.floor((10 ** stDividend - 1) / d);
      if (qMin > qMax) continue;
      const q = zufall(qMin, qMax);
      return { n: q * d, d, q, r: 0 };
    }
    const n = mitStellen(stDividend);
    if (n < d || n % d === 0) continue;
    return { n, d, q: Math.floor(n / d), r: n % d };
  }
  return { n: 84, d: 4, q: 21, r: 0 };
}

/* Rechenweg der schriftlichen Division: Teilschritte mit Endspalte im Dividenden */
function divisionsSchritte(n, d) {
  const s = String(n);
  let pos = 0, cur = Number(s[0]);
  while (cur < d && pos < s.length - 1) { pos++; cur = cur * 10 + Number(s[pos]); }
  const schritte = [];
  for (;;) {
    const qz = Math.floor(cur / d), prod = qz * d, rest = cur - prod;
    schritte.push({ ende: pos, cur, prod, rest });
    if (pos >= s.length - 1) break;
    pos++;
    schritte.push({ nachunten: true, ende: pos, text: String(rest) === "0" ? "0" + s[pos] : String(rest) + s[pos] });
    cur = rest * 10 + Number(s[pos]);
  }
  return schritte;
}

export function SchriftlicheDivision({ Zahlenfeld }) {
  const [stDividend, setStDividend] = useState(3);
  const [stDivisor, setStDivisor] = useState(1);
  const [rest, setRest] = useState(false);
  const neu = useCallback(() => divisionAufgabe(stDividend, Math.min(stDivisor, stDividend), rest), [stDividend, stDivisor, rest]);
  const [aufg, setAufg] = useState(() => neu());
  const [q, setQ] = useState("");
  const [r, setR] = useState("");
  const [feld, setFeld] = useState("q");
  const [rueck, setRueck] = useState(null);
  const [wegAuf, setWegAuf] = useState(false);
  const [stand, setStand] = useState({ richtig: 0, gesamt: 0, serie: 0 });
  const timer = useRef(null);

  const zuruecksetzen = (a) => { clearTimeout(timer.current); setAufg(a); setQ(""); setR(""); setFeld("q"); setRueck(null); setWegAuf(false); };
  useEffect(() => { if (stDivisor > stDividend) setStDivisor(stDividend); }, [stDividend]);  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { zuruecksetzen(neu()); }, [neu]);  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timer.current), []);
  const weiter = () => zuruecksetzen(neu());

  const ziffer = (z) => { if (rueck) return; if (feld === "q") setQ((v) => (v.length >= 6 ? v : v + z)); else setR((v) => (v.length >= 4 ? v : v + z)); };
  const loeschen = () => { if (rueck) return; if (feld === "q") setQ((v) => v.slice(0, -1)); else setR((v) => v.slice(0, -1)); };
  const pruefen = () => {
    if (rueck || !q) return;
    if (rest && feld === "q" && r === "") { setFeld("r"); return; }   // erst noch den Rest eintragen
    const ok = Number(q) === aufg.q && (rest ? Number(r || 0) === aufg.r : true);
    setRueck(ok ? "richtig" : "falsch");
    setStand((s) => ({ richtig: s.richtig + (ok ? 1 : 0), gesamt: s.gesamt + 1, serie: ok ? s.serie + 1 : 0 }));
    if (ok) timer.current = setTimeout(weiter, 1300); else setWegAuf(true);
  };
  useTastatur(ziffer, loeschen, rueck === "falsch" ? weiter : pruefen);

  /* Kästchen: Spalte 0 frei (für das Minuszeichen), dann Dividend, „:“, Divisor, „=“, Quotient, ggf. „R“ Rest */
  const N = String(aufg.n), D = String(aufg.d), Q = String(aufg.q);
  const zeigeLoesung = wegAuf || rueck;
  const oben = {};
  let c = 1;
  [...N].forEach((ch) => { oben[c++] = { t: ch, fett: true }; });
  oben[c++] = { t: ":" };
  [...D].forEach((ch) => { oben[c++] = { t: ch, fett: true }; });
  oben[c++] = { t: "=" };
  if (zeigeLoesung) {
    [...Q].forEach((ch) => { oben[c++] = { t: ch, fett: true, farbe: C.smaragd }; });
    if (aufg.r || rest) { oben[c++] = { t: "R", farbe: C.signal }; [...String(aufg.r)].forEach((ch) => { oben[c++] = { t: ch, fett: true, farbe: C.signal }; }); }
  }
  const spalten = Math.max(c, 1 + N.length + 1 + D.length + 1 + Q.length + (rest ? 1 + String(aufg.r).length : 0));
  const zeilen = [{ zellen: oben }];
  if (zeigeLoesung) {
    // Ziffer i des Dividenden steht in Spalte 1 + i; Text endet rechtsbündig unter Ziffer „ende“
    const rb = (text, ende, extra = {}) => { const z = {}; [...text].forEach((ch, k) => { z[1 + ende - text.length + 1 + k] = { t: ch, ...extra }; }); return z; };
    const schritte = divisionsSchritte(aufg.n, aufg.d);
    for (let k = 0; k < schritte.length; k++) {
      const st = schritte[k];
      if (st.nachunten) continue;
      const p = String(st.prod);
      const z = rb(p, st.ende, { farbe: C.see });
      z[1 + st.ende - p.length] = { t: "−", farbe: C.see };
      zeilen.push({ zellen: z });
      const breiteStrich = Math.max(p.length, String(st.cur).length);
      const linie = [1 + st.ende - breiteStrich + 1, 1 + st.ende];
      const naechste = schritte[k + 1];
      if (naechste && naechste.nachunten) zeilen.push({ zellen: rb(naechste.text, naechste.ende), linie });
      else zeilen.push({ zellen: rb(String(st.rest), st.ende, { farbe: C.signal, fett: true }), linie });
    }
  }

  const feldStil = (aktiv, wert, ok) => ({
    flex: 1, minHeight: 58, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: rueck ? "default" : "pointer",
    border: `2.5px solid ${rueck ? (ok ? C.smaragd : C.signal) : aktiv ? C.see : C.linie}`, background: rueck ? (ok ? "#EEF8F2" : "#FBEFEA") : C.weiss,
    fontFamily: "inherit", padding: "4px 10px",
  });
  const qOk = Number(q) === aufg.q, rOk = Number(r || 0) === aufg.r;

  return (
    <div>
      <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.65, marginBottom: 14 }}>
        {L("Teile schriftlich wie im Heft: Stelle für Stelle teilen, malnehmen, abziehen, die nächste Ziffer herunterholen. Wähle, wie viele Stellen Dividend und Divisor haben.",
          "Divide in writing like in your exercise book: divide digit by digit, multiply, subtract, bring down the next digit. Choose how many digits the dividend and divisor have.")}
      </p>
      <Chips label={L("Dividend", "Dividend")} optionen={[2, 3, 4, 5].map((n) => [n, L(`${n}-stellig`, `${n}-digit`)])} wert={stDividend} setWert={setStDividend} />
      <Chips label={L("Divisor", "Divisor")} optionen={[1, 2, 3].map((n) => [n, L(`${n}-stellig`, `${n}-digit`)])} wert={stDivisor} setWert={setStDivisor} gesperrt={(n) => n > stDividend} />
      <Chips label={L("Rest", "Remainder")} optionen={[[false, L("ohne Rest", "no remainder")], [true, L("mit Rest", "with remainder")]]} wert={rest} setWert={setRest} />
      <div style={{ ...karte, marginTop: 6 }}>
        <Zaehler {...stand} />
        <Kaestchen spalten={spalten} zeilen={zeilen} />
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button type="button" onClick={() => !rueck && setFeld("q")} style={feldStil(feld === "q", q, qOk)}>
            <span style={{ fontSize: 12, color: C.grau }}>{L("Ergebnis", "Result")}</span>
            <span style={{ fontSize: 30, fontWeight: 800, color: C.tinte }}>{q || <span style={{ color: C.hellgrau }}>?</span>}</span>
          </button>
          {rest && (
            <button type="button" onClick={() => !rueck && setFeld("r")} style={{ ...feldStil(feld === "r", r, rOk), flex: "0 0 36%" }}>
              <span style={{ fontSize: 12, color: C.grau }}>{L("Rest", "Rem.")}</span>
              <span style={{ fontSize: 30, fontWeight: 800, color: C.tinte }}>{r || <span style={{ color: C.hellgrau }}>?</span>}</span>
            </button>
          )}
        </div>
        <Rueckmeldung rueck={rueck} text={L(`Leider nicht – richtig ist ${aufg.q}${rest ? ` Rest ${aufg.r}` : ""}. Oben siehst du den Rechenweg.`,
          `Not quite – the answer is ${aufg.q}${rest ? ` remainder ${aufg.r}` : ""}. The working is shown above.`)} />
        {!rueck && (
          <button type="button" onClick={() => setWegAuf(!wegAuf)}
            style={{ display: "block", margin: "10px auto 12px", background: "none", border: "none", color: C.see, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {wegAuf ? L("Rechenweg ausblenden", "Hide working") : L("Rechenweg zeigen", "Show working")}
          </button>
        )}
        {rueck === "falsch" ? <button onClick={weiter} style={weiterKnopf}>{L("Nächste Aufgabe", "Next task")}</button>
          : <Zahlenfeld gesperrt={!!rueck} onZiffer={ziffer} onLoeschen={loeschen} onOk={pruefen} />}
        {rest && !rueck && <p style={{ fontSize: 12, color: C.hellgrau, textAlign: "center", marginTop: 10 }}>
          {L("Erst das Ergebnis, dann OK – danach den Rest eintragen.", "First the result, then OK – then enter the remainder.")}
        </p>}
      </div>
    </div>
  );
}
