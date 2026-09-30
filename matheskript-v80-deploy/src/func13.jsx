/* ============================================================
   Ableitungstrainer — Variante von „Ableitungen bilden“.
   Eine Funktion f wird vorgegeben (Aufgabentyp je Ableitungsregel,
   Zufallsfunktion oder eigene Funktion). Die Ableitungen werden mit
   demselben Tastenfeld wie im Advanced Plotter eingegeben. Nach OK
   wird geprüft; ist f′ geschafft, öffnet sich automatisch f″, dann f‴.

   Die Prüfung vergleicht die Eingabe numerisch mit der symbolisch
   gebildeten Ableitung — jede gleichwertige Schreibweise zählt.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { ABL_TYPEN } from "./base2.jsx";
import { M } from "./func3.jsx";
import {
  Tastenfeld, ableitung, alsTex, hatBox, kompiliere, ohnePar, parse, zufallsFunktion,
} from "./func12.jsx";

const STRICHE = ["", "′", "″", "‴"];
const endlich = (y) => typeof y === "number" && isFinite(y);

/* Prüfstellen: verteilt, bewusst „krumm“, damit Zufallstreffer ausgeschlossen sind. */
const STELLEN = [-2.73, -1.91, -1.17, -0.61, -0.29, 0.37, 0.83, 1.29, 1.77, 2.41, 3.13, 4.07];

function vergleich(g, soll) {
  let gleich = 0, anders = 0;
  STELLEN.forEach((x) => {
    const s = soll(x), m = g(x);
    if (!endlich(s)) return;
    if (!endlich(m)) { anders++; return; }
    if (Math.abs(m - s) <= 1e-6 * (1 + Math.abs(s))) gleich++; else anders++;
  });
  return { gleich, anders, ok: anders === 0 && gleich >= 4 };
}

/* Kurzer, hilfreicher Hinweis bei falscher Eingabe. */
function diagnose(g, soll, vorher, stufe) {
  const tests = [
    [vorher, stufe === 1 ? "Das ist f selbst — du hast noch nicht abgeleitet." : `Das ist noch f${STRICHE[stufe - 1]} — du hast diese Zeile nicht weiter abgeleitet.`],
    [(x) => -soll(x), "Fast! Alle Vorzeichen sind gedreht — prüfe, wo ein Minus verloren gegangen ist."],
  ];
  for (const [h, text] of tests) if (h && vergleich(g, h).ok) return text;
  const werte = STELLEN.map((x) => ({ m: g(x), s: soll(x) })).filter((w) => endlich(w.m) && endlich(w.s));
  if (werte.length >= 4) {
    const diff = werte.map((w) => w.m - w.s);
    if (Math.max(...diff) - Math.min(...diff) < 1e-6 && Math.abs(diff[0]) > 1e-6)
      return "Du liegst überall um denselben Wert daneben — meist ein stehen gebliebener konstanter Summand.";
    const q = werte.filter((w) => Math.abs(w.s) > 1e-9).map((w) => w.m / w.s);
    if (q.length >= 4 && Math.max(...q) - Math.min(...q) < 1e-6 && Math.abs(q[0] - 1) > 1e-6)
      return `Die Form stimmt, aber ein konstanter Faktor ist falsch (Faktor ${Math.round(q[0] * 100) / 100}).`;
  }
  const x0 = 1.29, mv = g(x0), sv = soll(x0);
  if (endlich(mv) && endlich(sv))
    return `Noch nicht richtig: bei x = 1,29 liefert dein Term ${String(Math.round(mv * 1000) / 1000).replace(".", ",")}, richtig wäre ${String(Math.round(sv * 1000) / 1000).replace(".", ",")}.`;
  return "Noch nicht richtig. Geh die Ableitungsregeln Schritt für Schritt durch.";
}

/* Eine Ableitungszeile: Label, Formelanzeige, Status. */
function Zeile({ stufe, aktiv, eintrag, onKlick }) {
  const baum = eintrag.text ? parse(eintrag.text) : null;
  const tex = baum ? alsTex(baum) : null;
  const farbe = eintrag.status === "richtig" ? C.smaragd : eintrag.status === "falsch" ? C.signal : aktiv ? C.see : C.linie;
  return (
    <div onClick={onKlick}
      style={{ border: `2px solid ${farbe}`, borderRadius: 14, padding: "10px 14px", marginBottom: 10,
        background: eintrag.status === "richtig" ? "#EEF8F2" : aktiv ? C.weiss : C.sand,
        display: "flex", alignItems: "center", gap: 10, overflowX: "auto", cursor: onKlick ? "pointer" : "default",
        boxShadow: aktiv ? "0 4px 16px rgba(0,77,152,0.12)" : "none", transition: "box-shadow .2s, border-color .2s" }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: C.tinte, whiteSpace: "nowrap" }}>f{STRICHE[stufe]}(x) =</span>
      <span style={{ flex: 1, fontSize: 19, lineHeight: 1.9, whiteSpace: "nowrap" }}>
        {eintrag.text ? (tex ? <M t={tex} /> : <span style={{ color: C.signal, fontSize: 15 }}>{eintrag.text}</span>)
          : <span style={{ color: C.hellgrau, fontSize: 14, fontWeight: 300 }}>{aktiv ? "hier eingeben …" : ""}</span>}
      </span>
      {eintrag.status === "richtig" && <span style={{ fontSize: 22, color: C.smaragd, fontWeight: 700 }}>✓</span>}
      {eintrag.status === "falsch" && <span style={{ fontSize: 22, color: C.signal, fontWeight: 700 }}>✗</span>}
      {eintrag.status === "gezeigt" && <span style={{ fontSize: 12, color: C.grau, fontWeight: 600 }}>Lösung</span>}
    </div>
  );
}

const leer = () => ({ text: "", status: null, hinweis: "", versuche: 0 });

export function Ableitungstrainer() {
  const [quelle, setQuelle] = useState("typ");            // typ | zufall | eigen
  const [typ, setTyp] = useState(ABL_TYPEN[0]);
  const [stufeTyp, setStufeTyp] = useState(2);
  const [fText, setFText] = useState(() => ABL_TYPEN[0].mach(2).f);
  const [eigenText, setEigenText] = useState("");
  const [eigenPos, setEigenPos] = useState(0);
  const [eigenOffen, setEigenOffen] = useState(true);
  const [zeilen, setZeilen] = useState([leer()]);
  const [aktiv, setAktiv] = useState(0);
  const [pos, setPos] = useState(0);
  const [tippen, setTippen] = useState(false);
  const [bilanz, setBilanz] = useState({ richtig: 0, gesamt: 0 });

  const fBaum = useMemo(() => {
    const b = parse(fText);
    return b && !hatBox(b) ? ohnePar(b) : null;
  }, [fText]);
  // Symbolische Ableitungen 0 bis 3
  const kette = useMemo(() => {
    if (!fBaum) return null;
    const l = [fBaum];
    for (let i = 1; i <= 3; i++) l.push(ableitung(l[i - 1]));
    return l.map((b) => ({ baum: b, fn: kompiliere(b) }));
  }, [fBaum]);

  const neustart = (text) => { setFText(text); setZeilen([leer()]); setAktiv(0); setPos(0); };
  const neueAufgabe = (t = typ, st = stufeTyp) => neustart(t.mach(st).f);

  const eintrag = zeilen[aktiv];
  const setEintragText = (t) => setZeilen(zeilen.map((z, i) => (i === aktiv ? { ...z, text: t, status: null, hinweis: "" } : z)));

  const pruefen = () => {
    if (!kette || !eintrag) return;
    const stufe = aktiv + 1;
    const b = parse(eintrag.text);
    if (!b || hatBox(b)) {
      setZeilen(zeilen.map((z, i) => (i === aktiv ? { ...z, status: "falsch", hinweis: "Der Term ist noch nicht vollständig — fülle alle Platzhalter ▯ und schließe die Klammern." } : z)));
      return;
    }
    const g = kompiliere(ohnePar(b));
    const soll = kette[stufe].fn, vorher = kette[stufe - 1].fn;
    const erg = vergleich(g, soll);
    setBilanz((bz) => ({ richtig: bz.richtig + (erg.ok ? 1 : 0), gesamt: bz.gesamt + 1 }));
    if (erg.ok) {
      const neu = zeilen.map((z, i) => (i === aktiv ? { ...z, status: "richtig", hinweis: "" } : z));
      if (stufe < 3) { neu.push(leer()); setAktiv(aktiv + 1); setPos(0); }
      setZeilen(neu);
    } else {
      setZeilen(zeilen.map((z, i) => (i === aktiv ? { ...z, status: "falsch", hinweis: diagnose(g, soll, vorher, stufe), versuche: z.versuche + 1 } : z)));
    }
  };

  const loesungZeigen = () => {
    const stufe = aktiv + 1;
    const neu = zeilen.map((z, i) => (i === aktiv ? { ...z, status: "gezeigt", zeig: alsTex(kette[stufe].baum), hinweis: "" } : z));
    if (stufe < 3) { neu.push(leer()); setAktiv(aktiv + 1); setPos(0); }
    setZeilen(neu);
  };

  const fertig = zeilen.length === 3 && ["richtig", "gezeigt"].includes(zeilen[2].status);
  const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
  const chip = (aktivChip) => ({
    padding: "6px 12px", borderRadius: 999, border: `1px solid ${aktivChip ? C.see : C.linie}`,
    background: aktivChip ? C.see : C.weiss, color: aktivChip ? C.weiss : C.see, fontSize: 12.5,
    fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
  });

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        f′, f″, f‴ — Schritt für Schritt
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Bilde die erste Ableitung, tippe auf OK — ist sie richtig, öffnet sich automatisch die nächste.
        Jede gleichwertige Schreibweise zählt.
      </p>

      {/* Funktionsquelle */}
      <div style={karte}>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {[["typ", "Nach Regel"], ["zufall", "🎲 Zufall"], ["eigen", "Eigene Funktion"]].map(([id, n]) => (
            <button key={id} onClick={() => {
              setQuelle(id);
              if (id === "eigen") setEigenOffen(true);
              if (id === "zufall") neustart(zufallsFunktion());
              if (id === "typ") neueAufgabe();
            }} style={{ ...chip(quelle === id), flex: 1, padding: "9px 8px", fontSize: 13 }}>{n}</button>
          ))}
        </div>

        {quelle === "typ" && (
          <>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6 }}>
              {ABL_TYPEN.map((t) => (
                <button key={t.id} onClick={() => { setTyp(t); neueAufgabe(t, stufeTyp); }} style={chip(typ.id === t.id)}>{t.name}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 12.5, color: C.grau, marginRight: 4 }}>Stufe</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => { setStufeTyp(s); neueAufgabe(typ, s); }}
                  style={{ ...chip(stufeTyp === s), width: 34, padding: "6px 0", textAlign: "center" }}>{s}</button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: C.hellgrau, fontWeight: 300, marginTop: 8 }}>{typ.regel}</p>
          </>
        )}

        {quelle === "eigen" && !eigenOffen && (
          <button onClick={() => setEigenOffen(true)}
            style={{ width: "100%", height: 42, borderRadius: 12, border: `1px solid ${C.linie}`, cursor: "pointer",
              fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: C.see, background: C.weiss }}>
            Funktion ändern
          </button>
        )}

        {quelle === "eigen" && eigenOffen && (
          <div>
            <p style={{ fontSize: 13, color: C.grau, marginBottom: 8 }}>Gib deine Funktion ein und tippe auf „Übernehmen“.</p>
            <div style={{ border: `1.5px solid ${C.linie}`, borderRadius: 12, padding: "8px 12px", minHeight: 48,
              display: "flex", alignItems: "center", gap: 8, overflowX: "auto", marginBottom: 8 }}>
              <span style={{ fontWeight: 700 }}>f(x) =</span>
              <span style={{ fontSize: 18, lineHeight: 1.9 }}>
                {eigenText ? (parse(eigenText) ? <M t={alsTex(parse(eigenText))} /> : eigenText)
                  : <span style={{ color: C.hellgrau, fontSize: 14 }}>…</span>}
              </span>
            </div>
            <Tastenfeld wert={eigenText} setWert={setEigenText} pos={eigenPos} setPos={setEigenPos} />
            <button onClick={() => { const b = parse(eigenText); if (b && !hatBox(b)) { neustart(eigenText); setEigenOffen(false); } }}
              style={{ width: "100%", height: 46, marginTop: 10, borderRadius: 12, border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: C.seeTief, background: C.flaggold }}>
              Übernehmen
            </button>
          </div>
        )}

        {quelle === "zufall" && (
          <button onClick={() => neustart(zufallsFunktion())}
            style={{ width: "100%", height: 42, borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit",
              fontSize: 14, fontWeight: 700, color: C.seeTief, background: C.flaggold }}>
            🎲 Neue Zufallsfunktion
          </button>
        )}
      </div>

      {/* Aufgabe und Ableitungszeilen */}
      {kette && !(quelle === "eigen" && eigenOffen) && (
        <div style={{ ...karte, marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel }}>Leite ab</p>
            <span style={{ fontSize: 12.5, color: C.grau }}>
              {bilanz.gesamt ? `${bilanz.richtig} von ${bilanz.gesamt} Versuchen richtig` : ""}
            </span>
          </div>
          <div style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 14,
            padding: "14px 16px", marginBottom: 14, overflowX: "auto" }}>
            <span style={{ color: C.weiss, fontSize: 22, fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1.9 }}>
              <M t={`f(x) = ${alsTex(fBaum)}`} />
            </span>
          </div>

          {zeilen.map((z, i) => (
            <div key={i}>
              <Zeile stufe={i + 1} aktiv={i === aktiv && !fertig} eintrag={z.status === "gezeigt" ? { ...z, text: "" } : z} />
              {z.status === "gezeigt" && (
                <p style={{ fontSize: 16, margin: "-4px 4px 12px", overflowX: "auto", whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: 12.5, color: C.grau, marginRight: 8 }}>Lösung:</span><M t={z.zeig} />
                </p>
              )}
              {z.hinweis && (
                <p style={{ fontSize: 13, color: C.signal, lineHeight: 1.6, margin: "-2px 4px 12px" }}>{z.hinweis}</p>
              )}
            </div>
          ))}

          {!fertig && (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button onClick={pruefen}
                  style={{ flex: 2, height: 50, borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit",
                    fontSize: 18, fontWeight: 800, color: C.weiss, background: C.smaragd, letterSpacing: "0.04em",
                    boxShadow: "0 4px 14px rgba(47,143,91,0.35)" }}>
                  OK
                </button>
                {eintrag && eintrag.versuche > 0 && (
                  <button onClick={loesungZeigen}
                    style={{ flex: 1, height: 50, borderRadius: 12, border: `1px solid ${C.linie}`, cursor: "pointer",
                      fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.see, background: C.weiss }}>
                    Lösung zeigen
                  </button>
                )}
              </div>
              {tippen ? (
                <input value={eintrag.text} onChange={(e) => setEintragText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") pruefen(); }}
                  placeholder="z. B. 2x*cos(x) oder e^(2x)" autoCapitalize="off" autoCorrect="off" spellCheck="false"
                  style={{ width: "100%", boxSizing: "border-box", height: 46, borderRadius: 12, border: `1.5px solid ${C.linie}`,
                    padding: "0 12px", fontSize: 16, fontFamily: "ui-monospace, Menlo, monospace" }} />
              ) : (
                <Tastenfeld wert={eintrag.text} setWert={setEintragText} pos={pos} setPos={setPos} />
              )}
              <button onClick={() => setTippen(!tippen)}
                style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit",
                  cursor: "pointer", marginTop: 10, padding: 0 }}>
                {tippen ? "Tastenfeld benutzen" : "Lieber selbst tippen"}
              </button>
            </>
          )}

          {fertig && (
            <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: C.smaragd, marginBottom: 4 }}>
                {zeilen.every((z) => z.status === "richtig") ? "Alle drei Ableitungen richtig! 🎉" : "Geschafft — alle drei Ableitungen stehen."}
              </p>
              <p style={{ fontSize: 13.5, color: C.grau, marginBottom: 14 }}>Weiter mit einer neuen Funktion?</p>
              <button onClick={() => (quelle === "zufall" ? neustart(zufallsFunktion()) : quelle === "typ" ? neueAufgabe() : neustart(fText))}
                style={{ width: "100%", height: 50, borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 16, fontWeight: 700, color: C.weiss, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` }}>
                {quelle === "eigen" ? "Nochmal von vorn" : "Neue Funktion"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Hochformat-Grafik für die Startseiten-Kachel: f, f′, f″ untereinander. */
export function AbleitungLogoKlein() {
  const W = 230, H = 190;
  const kurve = (g, y0, s) => {
    let d = "";
    for (let i = 0; i <= 120; i++) {
      const x = -3 + (6 * i) / 120, y = g(x);
      d += `${i ? "L" : "M"}${(34 + (x + 3) * 27).toFixed(1)},${(y0 - y * s).toFixed(1)}`;
    }
    return d;
  };
  const zeilen = [
    { g: (x) => x ** 3 / 6 - x, y: 42, farbe: C.weiss, t: "f", s: 7, ok: true },
    { g: (x) => x ** 2 / 2 - 1, y: 100, farbe: C.flaggold, t: "f′", s: 6.5, ok: true },
    { g: (x) => x, y: 158, farbe: C.granaHell, t: "f″", s: 5, ok: false },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {zeilen.map((z, i) => (
        <g key={i}>
          <line x1="34" y1={z.y} x2="196" y2={z.y} stroke="rgba(255,255,255,0.14)" />
          <text x="12" y={z.y + 5} fill={z.farbe} fontSize="15" fontWeight="700" fontStyle="italic">{z.t}</text>
          <path d={kurve(z.g, z.y, z.s)} stroke={z.farbe} strokeWidth={i === 0 ? 2.8 : 2.3} fill="none" strokeLinecap="round" />
          <circle cx="214" cy={z.y - 16} r="9" fill={z.ok ? C.smaragd : "rgba(255,255,255,0.14)"} />
          {z.ok ? <path d={`M209.5,${z.y - 16} l3.2,3.2 l6,-6.5`} stroke={C.weiss} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            : <text x="214" y={z.y - 12} fill={C.weiss} fontSize="12" fontWeight="700" textAnchor="middle">?</text>}
          {i < 2 && <path d={`M115,${z.y + 19} l0,12 m-4,-4 l4,4 l4,-4`} stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" fill="none" />}
        </g>
      ))}
    </svg>
  );
}

/* Logo für die Startseiten-Kachel: f, f′, f″ gestaffelt, mit Häkchen. */
export function AbleitungLogo() {
  const W = 340, H = 170;
  const kurve = (g, y0, s) => {
    let d = "";
    for (let i = 0; i <= 160; i++) {
      const x = -3 + (6 * i) / 160, y = g(x);
      d += `${i ? "L" : "M"}${(40 + (x + 3) * 40).toFixed(1)},${(y0 - y * s).toFixed(1)}`;
    }
    return d;
  };
  const zeilen = [
    { g: (x) => x ** 3 / 6 - x, y: 13, farbe: C.weiss, t: "f", s: 2.8 },
    { g: (x) => x ** 2 / 2 - 1, y: 33, farbe: C.flaggold, t: "f′", s: 2.6 },
    { g: (x) => x, y: 53, farbe: C.granaHell, t: "f″", s: 2 },
  ];
  return (
    <svg viewBox={`0 0 ${W} 64`} preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {zeilen.map((z, i) => (
        <g key={i}>
          <line x1="40" y1={z.y} x2="280" y2={z.y} stroke="rgba(255,255,255,0.14)" />
          <text x="12" y={z.y + 5} fill={z.farbe} fontSize="12" fontWeight="700" fontStyle="italic">{z.t}</text>
          <path d={kurve(z.g, z.y, z.s)} stroke={z.farbe} strokeWidth={i === 0 ? 3 : 2.4} fill="none" strokeLinecap="round" />
          <circle cx="306" cy={z.y} r="7.5" fill={i < 2 ? C.smaragd : "rgba(255,255,255,0.12)"} />
          {i < 2 && <path d={`M302.5,${z.y} l2.5,2.5 l5,-5`} stroke={C.weiss} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          {i === 2 && <text x="306" y={z.y + 5} fill={C.weiss} fontSize="11" fontWeight="700" textAnchor="middle">?</text>}
        </g>
      ))}
    </svg>
  );
}
