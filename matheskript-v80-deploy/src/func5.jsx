import React, { useState, useRef } from "react";
import { API_URL, C, DEMO_VIDEO_ID, DIFFQ_TESTPAARE, DIFFQ_VIDEO_ID, Regler, ganz } from "./base1.jsx";
import { ABL_TYPEN, FEHLERARTEN, GEN_MODULE, KOPF_WERKZEUGE, PF_STUFEN, PRIMLISTE, PROTOKOLL, WEG_TYPEN } from "./base2.jsx";
import { LERN } from "./base3.jsx";
import { kiKopf } from "./base4.jsx";
import { ErklaerVideo, KIAufgaben, dekodieren, jsonLesen, parseZahl, rendern } from "./func1.jsx";
import { hoch, termText } from "./func2.jsx";
import { Formel, M, Text, Zeile, alsFunktion, alsFunktionXH, diffqAufgabe, diffqLoesung1, diffqLoesung2, diffqStimmtVorLimes, diffqX0, numAbleitung, stimmtUeberein, wegPruefen, zeileSetzen, zerlegen } from "./func3.jsx";
import { AbleitungsGenerator, MiniGraph, TermTastatur, kubischErzeugen } from "./func4.jsx";
import { LoesungsWeg, VisSekante, lernAusUebung, lernSpeichern } from "./func6.jsx";
import { aktivitaetMelden } from "./func8.jsx";
import { Auswertung } from "./func9.jsx";
import { Mathilda } from "./func10.jsx";

export function KurvenGenerator() {
  const [auf, setAuf] = useState(() => kubischErzeugen());
  const [e, setE] = useState({});
  const [geprueft, setGeprueft] = useState(false);
  const [wegOffen, setWegOffen] = useState(false);

  const { a, b, c, d, f } = auf;
  const punktsym = b === 0 && d === 0;

  const felder = [
    { id: "def", nr: 1, titel: "Definitionsbereich", typ: "wahl",
      optionen: ["ℝ", "ℝ ohne die Null", "nur x > 0"], richtig: 0 },
    { id: "sym", nr: 2, titel: "Symmetrie", typ: "wahl",
      optionen: ["keine", "achsensymmetrisch", "punktsymmetrisch"], richtig: punktsym ? 2 : 0 },
    { id: "sy", nr: 3, titel: "y-Achsenabschnitt", typ: "zahl", richtig: d, hilfe: "f(0)" },
    { id: "ns", nr: 4, titel: "Eine Nullstelle", typ: "nullstelle", hilfe: "eine ist ganzzahlig" },
    { id: "gv", nr: 5, titel: "Grenzverhalten", typ: "wahl",
      optionen: ["links unten → rechts oben", "links oben → rechts unten", "beide Äste nach oben"],
      richtig: a > 0 ? 0 : 1 },
    { id: "fs", nr: 6, titel: "f′(x)", typ: "term", richtig: auf.fs },
    { id: "fss", nr: 6, titel: "f″(x)", typ: "term", richtig: auf.fss },
    { id: "e1", nr: 7, titel: "kleinere Extremstelle", typ: "zahl", richtig: auf.klein },
    { id: "e2", nr: 7, titel: "größere Extremstelle", typ: "zahl", richtig: auf.gross },
    { id: "art", nr: 7, titel: "Art der kleineren Stelle", typ: "wahl",
      optionen: ["Hochpunkt", "Tiefpunkt"], richtig: auf.hoch === auf.klein ? 0 : 1 },
    { id: "mon", nr: 8, titel: "zwischen den Extremstellen", typ: "wahl",
      optionen: ["steigend", "fallend"], richtig: a > 0 ? 1 : 0 },
    { id: "wp", nr: 9, titel: "Wendestelle", typ: "zahl", richtig: auf.wende },
  ];

  const stimmt = (feld) => {
    const w = e[feld.id];
    if (w === undefined || String(w).trim() === "") return false;
    if (feld.typ === "wahl") return w === feld.richtig;
    if (feld.typ === "zahl") { const v = parseZahl(w); return v !== null && Math.abs(v - feld.richtig) < 1e-6; }
    if (feld.typ === "nullstelle") { const v = parseZahl(w); return v !== null && Math.abs(f(v)) < 1e-6; }
    const meins = alsFunktion(w), soll = alsFunktion(feld.richtig);
    return !!meins && !!soll && stimmtUeberein(meins, soll);
  };

  const richtige = geprueft ? felder.filter(stimmt).length : 0;

  const neu = () => { setAuf(kubischErzeugen()); setE({}); setGeprueft(false); };

  const marken = [
    { x: auf.hoch, y: f(auf.hoch), farbe: C.gruenDunkel },
    { x: auf.tief, y: f(auf.tief), farbe: C.gruenDunkel },
    { x: auf.wende, y: f(auf.wende), farbe: C.tinte },
  ];

  return (
    <div>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Führe die Diskussion vollständig auf Papier durch und trage dann alle Ergebnisse ein.
        Geprüft wird erst am Schluss — wie auf dem Klausurblatt.
      </p>

      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 16 }}>
        <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, marginBottom: 6 }}>Untersuche vollständig</p>
        <div style={{ fontSize: 19, lineHeight: 1.9 }}>
          f(x) = <M t={termText(a, b, c, d).replace(/x²/g, "x^2").replace(/x³/g, "x^3")} />
        </div>
      </div>

      {felder.map((feld) => {
        const ok = geprueft && stimmt(feld);
        const rand = !geprueft ? C.linie : ok ? C.see : C.signal;
        return (
          <div key={feld.id} style={{ background: C.weiss, borderRadius: 14, padding: "14px 16px", marginBottom: 10,
            boxShadow: "0 2px 12px rgba(15,26,51,0.06)", borderLeft: `4px solid ${rand}` }}>
            <div className="flex justify-between items-baseline" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{feld.titel}</span>
              <span style={{ fontSize: 11, color: C.hellgrau }}>Schritt {feld.nr}</span>
            </div>

            {feld.typ === "wahl" ? (
              <div className="flex flex-wrap gap-2">
                {feld.optionen.map((o, k) => {
                  const gew = e[feld.id] === k;
                  const zeig = geprueft && k === feld.richtig;
                  return (
                    <button key={k} onClick={() => !geprueft && setE({ ...e, [feld.id]: k })} className="px-3 py-2"
                      style={{ background: zeig ? C.himmel : C.weiss,
                        color: zeig ? C.gruenDunkel : gew ? C.see : C.grau,
                        border: `1.5px solid ${zeig ? C.gruenDunkel : gew ? C.see : C.linie}`,
                        borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: geprueft ? "default" : "pointer" }}>
                      {o}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center" style={{ gap: 8 }}>
                <input value={e[feld.id] || ""} disabled={geprueft}
                  onChange={(ev) => setE({ ...e, [feld.id]: ev.target.value })}
                  placeholder={feld.hilfe || (feld.typ === "term" ? "z. B. 3x^2-6x" : "Zahl")}
                  style={{ flex: 1, padding: "9px 12px", fontSize: 15.5, fontFamily: "inherit",
                    border: `1.5px solid ${!geprueft ? C.linie : ok ? C.see : C.signal}`,
                    borderRadius: 11, outline: "none", background: geprueft && ok ? C.himmel : C.weiss, color: C.tinte }} />
              </div>
            )}

            {geprueft && !ok && feld.typ !== "wahl" && (
              <p style={{ fontSize: 13, color: C.see, marginTop: 8 }}>
                Lösung: {feld.typ === "nullstelle" ? String(auf.r ?? "") : <M t={String(feld.richtig)} />}
              </p>
            )}
          </div>
        );
      })}

      {!geprueft ? (
        <button onClick={() => setGeprueft(true)} className="w-full px-6 py-4 mt-3"
          style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Alles prüfen
        </button>
      ) : (
        <>
          <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 16, padding: 22, marginTop: 6, marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.gruen, marginBottom: 8 }}>Auswertung</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: C.weiss }}>{richtige} von {felder.length} richtig</p>
            <p style={{ fontSize: 14, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.75, marginTop: 10 }}>
              Der Graph entsteht aus den berechneten Punkten — hier zur Kontrolle, nicht als Ersatz für die Rechnung.
            </p>
          </div>
          <div style={{ background: C.weiss, borderRadius: 16, padding: 14, marginBottom: 16 }}>
            <div style={{ maxWidth: 300, margin: "0 auto" }}>
              <MiniGraph fn={f} hoehe={200} breite={280} markieren={marken} />
            </div>
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-3 mt-2">
        <button onClick={neu} className="px-6 py-3"
          style={{ background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
          Neue Funktion
        </button>
        <button onClick={() => setWegOffen(true)} className="px-6 py-3"
          style={{ background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
          Lösungsweg schreiben
        </button>
      </div>

      {wegOffen && (
        <LoesungsWeg titelTex={termText(a, b, c, d).replace(/x²/g, "x^2").replace(/x³/g, "x^3")}
          aufgabeText="Führe die Kurvendiskussion hier schriftlich durch."
          typ={WEG_TYPEN.find((t) => t.id === "extrem")} auf={auf}
          onSchliessen={() => setWegOffen(false)} />
      )}
    </div>
  );
}

/* ---------- Differenzenquotient: Werkzeug und Einleitungsseite ----------
   Zwei Stufen pro Aufgabe: erst den Differenzenquotienten kürzen (noch mit h),
   dann den Grenzwert h → 0 bilden. Stufe 1 ist erst dann wirklich bestanden,
   wenn der eingegebene Term bei h = 0 einen endlichen Wert liefert — ein noch
   nicht gekürzter Bruch mit h im Nenner fällt damit automatisch durch. */


export function DiffqStufenknopf({ zeichen, onClick }) {
  return (
    <button onClick={onClick}
      style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${C.linie}`, background: C.weiss,
        color: C.see, fontSize: 17, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
      {zeichen}
    </button>
  );
}


export function DifferenzenquotientGenerator() {
  const [stufe, setStufe] = useState(2);
  const [modus, setModus] = useState("funktion"); // "funktion" | "stelle"
  const [auf, setAuf] = useState(() => diffqAufgabe(2));
  const [x0, setX0] = useState(() => diffqX0(diffqAufgabe(2)));
  const [phase, setPhase] = useState("vereinfachen"); // "vereinfachen" | "grenzwert" | "fertig"
  const [e1, setE1] = useState("");
  const [e2, setE2] = useState("");
  const [stand1, setStand1] = useState(null);
  const [stand2, setStand2] = useState(null);
  const [hinweis, setHinweis] = useState("");
  const [zeigen1, setZeigen1] = useState(false);
  const [zeigen2, setZeigen2] = useState(false);
  const [tippen, setTippen] = useState(false);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });
  const [start, setStart] = useState(() => Date.now());

  const neu = (s, m) => {
    const stufeNeu = s ?? stufe, modusNeu = m ?? modus;
    const a = diffqAufgabe(stufeNeu);
    setAuf(a);
    if (modusNeu === "stelle") setX0(diffqX0(a));
    setPhase("vereinfachen");
    setE1(""); setE2(""); setStand1(null); setStand2(null); setHinweis("");
    setZeigen1(false); setZeigen2(false); setStart(Date.now());
  };
  const stufeSetzen = (s) => { const v = Math.max(1, Math.min(5, s)); setStufe(v); neu(v); };
  const modusSetzen = (m) => { setModus(m); neu(stufe, m); };
  const x0Setzen = (delta) => {
    let v = x0 + delta;
    if (auf.bruch) { let schutz = 0; while (v === -auf.c && schutz < 12) { v += delta || 1; schutz++; } }
    setX0(v); setPhase("vereinfachen"); setE1(""); setE2(""); setStand1(null); setStand2(null); setHinweis("");
    setZeigen1(false); setZeigen2(false); setStart(Date.now());
  };

  const stelle = modus === "stelle" ? x0 : null;
  const fFun = React.useMemo(() => alsFunktion(auf.f), [auf]);
  const abl = React.useMemo(() => numAbleitung(fFun), [fFun]);

  const pruefen1 = () => {
    const meins = alsFunktionXH(e1);
    if (!meins) {
      setStand1("nein");
      setHinweis("Der Term lässt sich nicht lesen — achte auf die Klammern und darauf, dass h wirklich vorkommt.");
      return;
    }
    const soll = (x, h) => (fFun(x + h) - fFun(x)) / h;
    const paare = stelle !== null ? DIFFQ_TESTPAARE.map((t) => ({ x: stelle, h: t.h })) : DIFFQ_TESTPAARE;
    const ok = diffqStimmtVorLimes((x, h) => meins(x, h), soll, paare);
    setStand1(ok ? "ok" : "nein");
    if (!ok) {
      const beiNull = meins(stelle ?? 1.23, 0);
      setHinweis(isFinite(beiNull)
        ? "Rechnerisch stimmt der Term noch nicht mit dem Differenzenquotienten überein. Setz f(x+h) und f(x) noch einmal sauber ein."
        : "Der Term steht noch nicht gekürzt da — bei h = 0 stünde h weiterhin im Nenner. Kürze, bis h nur noch außerhalb eines Bruchs vorkommt.");
    } else {
      setHinweis("");
      setPhase("grenzwert");
    }
  };

  const pruefen2 = () => {
    let ok;
    if (stelle !== null) {
      const wert = parseZahl(e2);
      const soll = abl(stelle);
      ok = wert !== null && isFinite(soll) && Math.abs(wert - soll) < 1e-3 * (1 + Math.abs(soll));
      if (!ok) setHinweis(wert === null ? "Trag eine einzelne Zahl ein — den Wert von f′ an dieser Stelle." : "Setz in deinem Term aus Stufe 1 einfach h = 0 ein, das ist schon die Lösung.");
    } else {
      const meins = alsFunktion(e2);
      ok = !!meins && stimmtUeberein(meins, abl, 1e-3);
      if (!ok) setHinweis(meins ? "Das ist noch nicht f′(x). Setz in deinem Term aus Stufe 1 einfach h = 0 ein." : "Der Term lässt sich nicht lesen. Er darf jetzt kein h mehr enthalten.");
    }
    setStand2(ok ? "ok" : "nein");
    if (ok) setPhase("fertig");
    setSerie((s) => ({ n: s.n + 1, ok: s.ok + (ok ? 1 : 0) }));
    merken({
      bereich: "diffquotient", gruppe: modus, stufe, richtig: ok,
      sekunden: Math.max(1, Math.round((Date.now() - start) / 1000)),
      fehlerart: ok ? null : "grenzuebergang",
    });
  };

  const stelleTxt = stelle !== null ? String(stelle) : "x";
  const templateTex = `\\lim_{h \\to 0} \\frac{f(${stelleTxt}+h) - f(${stelleTxt})}{h}`;

  return (
    <div>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Wähle eine Funktionsfamilie und ob du allgemein ableitest oder an einer festen Stelle. Erst wird
        gekürzt, dann der Grenzwert gebildet — genau wie auf dem Klausurblatt.
      </p>

      <div className="flex gap-2 mb-4">
        {[["funktion", "Ableitungsfunktion"], ["stelle", "An einer Stelle"]].map(([id, n]) => (
          <button key={id} onClick={() => modusSetzen(id)} className="px-4 py-2"
            style={{ background: modus === id ? C.see : C.weiss, color: modus === id ? C.weiss : C.grau,
              border: `1px solid ${modus === id ? C.see : C.linie}`, borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
            {n}
          </button>
        ))}
      </div>

      <div className="flex items-center flex-wrap" style={{ gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 13.5, color: C.grau, fontWeight: 300 }}>Schwierigkeit</span>
        <DiffqStufenknopf zeichen="−" onClick={() => stufeSetzen(stufe - 1)} />
        <div className="flex" style={{ gap: 4 }}>
          {[1, 2, 3, 4, 5].map((k) => (
            <span key={k} style={{ width: 9, height: 9, borderRadius: 999,
              background: k <= stufe ? C.see : C.linie, display: "inline-block" }} />
          ))}
        </div>
        <DiffqStufenknopf zeichen="+" onClick={() => stufeSetzen(stufe + 1)} />
        <span style={{ fontSize: 13.5, color: C.gruenDunkel, fontWeight: 600 }}>{stufe} / 5</span>

        {modus === "stelle" && (
          <div className="flex items-center" style={{ gap: 8, marginLeft: 8 }}>
            <span style={{ fontSize: 13.5, color: C.grau, fontWeight: 300 }}>Stelle x₀ =</span>
            <DiffqStufenknopf zeichen="−" onClick={() => x0Setzen(-1)} />
            <span style={{ fontSize: 14, fontWeight: 600, color: C.tinte, minWidth: 18, textAlign: "center" }}>{x0}</span>
            <DiffqStufenknopf zeichen="+" onClick={() => x0Setzen(1)} />
          </div>
        )}
      </div>

      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
        <div style={{ fontSize: 19, lineHeight: 2.1, marginBottom: 6 }}>
          f(x) = <M t={auf.tex} />
        </div>

        <Formel titel="Differenzenquotient" zeilen={[templateTex]} />

        {phase === "vereinfachen" && (
          <>
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
              1. Kürze den Bruch, bis h nicht mehr im Nenner steht:
            </p>
            {tippen ? (
              <input value={e1} onChange={(e) => { setE1(e.target.value); setStand1(null); }}
                placeholder={stelle !== null ? "Term mit h" : "Term mit x und h"}
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 16, fontFamily: "inherit",
                  border: `1.5px solid ${stand1 === "ok" ? C.see : stand1 ? C.signal : C.linie}`,
                  borderRadius: 12, outline: "none", background: stand1 === "ok" ? C.himmel : C.weiss, color: C.tinte, marginBottom: 8 }} />
            ) : (
              <TermTastatur wert={e1} setWert={(w) => { setE1(w); setStand1(null); }} />
            )}
            <button onClick={() => setTippen(!tippen)} className="mt-2"
              style={{ background: "none", border: "none", color: C.see, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
              {tippen ? "Tastenfeld benutzen" : "Lieber selbst tippen"}
            </button>
            <div style={{ height: 12 }} />

            {stand1 === "nein" && (
              <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginBottom: 14 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>Stimmt noch nicht.</p>
                <p style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>{hinweis}</p>
                {!zeigen1 && (
                  <button onClick={() => setZeigen1(true)} className="mt-3"
                    style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                    Lösung zeigen
                  </button>
                )}
                {zeigen1 && (
                  <p style={{ fontSize: 17, color: C.see, fontWeight: 600, marginTop: 12, lineHeight: 2 }}>
                    = <M t={diffqLoesung1(auf, stelle)} />
                  </p>
                )}
              </div>
            )}
            <button onClick={pruefen1} disabled={!e1.trim()} className="px-6 py-3"
              style={{ background: e1.trim() ? C.see : C.hellgrau, color: C.weiss, border: "none",
                borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
              Prüfen
            </button>
          </>
        )}

        {phase !== "vereinfachen" && (
          <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 18 }}>
            <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 4 }}>Gekürzt:</p>
            <p style={{ fontSize: 16, color: C.see, fontWeight: 600 }}><M t={e1} /></p>
          </div>
        )}

        {phase !== "vereinfachen" && (
          <>
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
              2. Bilde jetzt den Grenzwert für h → 0:
            </p>
            {stelle !== null ? (
              <input value={e2} onChange={(e) => { setE2(e.target.value); setStand2(null); }}
                placeholder="f′(x₀) als Zahl"
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 16, fontFamily: "inherit",
                  border: `1.5px solid ${stand2 === "ok" ? C.see : stand2 ? C.signal : C.linie}`,
                  borderRadius: 12, outline: "none", background: stand2 === "ok" ? C.himmel : C.weiss, color: C.tinte, marginBottom: 8 }} />
            ) : tippen ? (
              <input value={e2} onChange={(e) => { setE2(e.target.value); setStand2(null); }}
                placeholder="f′(x)"
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 16, fontFamily: "inherit",
                  border: `1.5px solid ${stand2 === "ok" ? C.see : stand2 ? C.signal : C.linie}`,
                  borderRadius: 12, outline: "none", background: stand2 === "ok" ? C.himmel : C.weiss, color: C.tinte, marginBottom: 8 }} />
            ) : (
              <TermTastatur wert={e2} setWert={(w) => { setE2(w); setStand2(null); }} />
            )}
            <div style={{ height: 12 }} />

            {stand2 === null ? (
              <button onClick={pruefen2} disabled={!e2.trim()} className="px-6 py-3"
                style={{ background: e2.trim() ? C.see : C.hellgrau, color: C.weiss, border: "none",
                  borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                Prüfen
              </button>
            ) : stand2 === "ok" ? (
              <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: C.see }}>
                  Stimmt — {stelle !== null ? `f′(${stelle})` : "f′(x)"} = <M t={e2} />
                </p>
              </div>
            ) : (
              <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>Stimmt noch nicht.</p>
                <p style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>{hinweis}</p>
                {!zeigen2 && (
                  <button onClick={() => setZeigen2(true)} className="mt-3"
                    style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                    Lösung zeigen
                  </button>
                )}
                {zeigen2 && (
                  <p style={{ fontSize: 17, color: C.see, fontWeight: 600, marginTop: 12, lineHeight: 2 }}>
                    {stelle !== null ? `f′(${stelle})` : "f′(x)"} = <M t={diffqLoesung2(auf, stelle)} />
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        <button onClick={() => neu()} className="px-6 py-3"
          style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Nächste Aufgabe
        </button>
        {serie.n > 0 && (
          <span className="flex items-center" style={{ fontSize: 13, color: C.grau }}>{serie.ok} von {serie.n} richtig</span>
        )}
      </div>
    </div>
  );
}

/* Die vollständige Einleitungsseite: Video, Tangentenproblem mit Sekanten-Visualisierung,
   danach direkt das Werkzeug. Über NAV ("Üben") und die Startseite ("Werkzeuge") erreichbar. */

export function DifferenzenquotientSeite() {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Vom Tangentenproblem zum Differenzenquotienten
      </h2>

      <ErklaerVideo id={DIFFQ_VIDEO_ID} titel="Differenzenquotient — Einführung" />

      <div style={{ marginTop: 20 }}>
        <Text s="Eine Gerade lässt sich immer durch zwei Punkte legen — ihre Steigung ist dann nur noch
          Dreiecksrechnung. Eine Tangente an einen Funktionsgraphen kennt aber von Anfang an nur
          einen einzigen Punkt. Ihre Steigung ist genau die Zahl, die wir suchen, und wir haben zunächst
          keine Möglichkeit, sie direkt auszurechnen." style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 16 }} />
        <Text s="Der Ausweg: Man nimmt trotzdem zwei Punkte — den interessierenden Punkt $P(x_0 \, | \, f(x_0))$
          und einen zweiten, der um $h$ daneben liegt. Die Gerade durch beide heißt Sekante, ihre Steigung
          ist der Differenzenquotient." style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 16 }} />
        <Formel zeilen={["m_S = \\frac{f(x_0+h) - f(x_0)}{h}"]} />
        <Text s="Lässt man $h$ immer kleiner werden, rückt der zweite Punkt an den ersten heran — aus der
          Sekante wird die Tangente. Ihre Steigung, der Grenzwert für $h \to 0$, ist die gesuchte Ableitung."
          style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 4 }} />
      </div>

      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 }}>Zieh am Regler und beobachte, wie aus der Sekante die Tangente wird</p>
        <VisSekante />
      </div>

      <div style={{ height: 1, background: C.linie, margin: "30px 0 26px" }} />

      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>Jetzt selbst üben</p>
      <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 14 }}>
        Differenzenquotient bilden und kürzen
      </h3>
      <DifferenzenquotientGenerator />
    </div>
  );
}

/* ---------- Hub des Aufgabengenerators ---------- */


export function GeneratorHub({ ziel, setZiel }) {
  const offen = ziel ? GEN_MODULE.find((m) => m.id === ziel) : null;
  const setOffen = (m) => setZiel(m ? m.id : null);

  if (!offen) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
          So viele Aufgaben, wie du willst
        </h2>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
          Drei Bereiche, in jedem werden die Aufgaben neu erzeugt. Geprüft wird deine Eingabe,
          nicht deine Handschrift — gerechnet wird trotzdem auf Papier.
        </p>
        {GEN_MODULE.map((m) => (
          <button key={m.id} onClick={() => setOffen(m)} className="w-full px-5 py-5 mb-3"
            style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, textAlign: "left",
              cursor: "pointer", fontFamily: "inherit", color: C.tinte, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
            <p style={{ fontSize: 17.5, fontWeight: 600, marginBottom: 4 }}>{m.titel}</p>
            <p style={{ color: C.grau, fontSize: 13.5, fontWeight: 300, lineHeight: 1.6 }}>{m.kurz}</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <button onClick={() => setOffen(null)} className="mb-5"
        style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
        ← Alle Bereiche
      </button>
      <h2 style={{ fontSize: 25, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        {offen.titel}
      </h2>
      {offen.id === "ableiten" && <ErklaerVideo id={DEMO_VIDEO_ID} titel="Ableitungen bilden" />}
      {offen.id === "gerade" ? <KIAufgaben eingebettet />
        : offen.id === "ableiten" ? <AbleitungsGenerator />
        : offen.id === "blatt" ? <Arbeitsblatt />
        : <KurvenGenerator />}
    </div>
  );
}

/* ---------- Kopfrechnen · Primfaktorzerlegung ---------- */


export function istPrim(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let t = 3; t * t <= n; t += 2) if (n % t === 0) return false;
  return true;
}


export function kleinsterFaktor(n) {
  if (n % 2 === 0) return 2;
  for (let t = 3; t * t <= n; t += 2) if (n % t === 0) return t;
  return n;
}


export function zerlegung(n) {
  const f = [];
  let rest = n;
  while (rest > 1) { const p = kleinsterFaktor(rest); f.push(p); rest /= p; }
  return f;
}


export function potenzform(faktoren) {
  const zaehl = {};
  faktoren.forEach((p) => { zaehl[p] = (zaehl[p] || 0) + 1; });
  return Object.keys(zaehl).map(Number).sort((a, b) => a - b)
    .map((p) => (zaehl[p] === 1 ? `${p}` : `${p}^{${zaehl[p]}}`))
    .join(" \\cdot ");
}

/* Alle Primzahlen bis 500 — das Tastenfeld zeigt sie der Größe nach. */

export function naechsteQuadratzahl(n) {
  const k = Math.floor(Math.sqrt(n)) + 1;
  return { k, q: k * k };
}


export function pfErzeugen(stufe) {
  for (let versuch = 0; versuch < 500; versuch++) {
    const n = ganz(stufe.von, stufe.bis);
    if (zerlegung(n).length >= 2) return { n, faktoren: zerlegung(n) };
  }
  const n = stufe.von % 2 === 0 ? stufe.von : stufe.von + 1;
  return { n, faktoren: zerlegung(n) };
}


export function Primfaktoren() {
  const [stufe, setStufe] = useState(PF_STUFEN[0]);
  const [auf, setAuf] = useState(() => pfErzeugen(PF_STUFEN[0]));
  const [faktoren, setFaktoren] = useState([]);
  const [sichtbar, setSichtbar] = useState(20);
  const [meldung, setMeldung] = useState(null);
  const [stand, setStand] = useState(null);
  const [hilfe, setHilfe] = useState(0);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });
  const [autoletzter, setAutoletzter] = useState(null);

  const produkt = faktoren.reduce((p, k) => p * k, 1);
  const rest = auf.n / produkt;
  const fertig = stand !== null;

  /* Die Leiter: jede Zeile spaltet einen Faktor vom Rest ab. */
  const leiter = [];
  let laufend = auf.n;
  const gezeigt = autoletzter ? faktoren.slice(0, -1) : faktoren;
  gezeigt.forEach((k) => { leiter.push({ von: laufend, faktor: k, rest: laufend / k }); laufend /= k; });

  const neu = (s) => {
    const art = s || stufe;
    setAuf(pfErzeugen(art)); setFaktoren([]); setSichtbar(20);
    setMeldung(null); setStand(null); setHilfe(0); setAutoletzter(null);
  };
  const stufeWechseln = (s) => { setStufe(s); neu(s); };

  const faktorNehmen = (k) => {
    if (rest % k !== 0) {
      setMeldung({ art: "warn", text: `${k} ist kein Teiler von ${rest}.` });
      return;
    }
    const liste = [...faktoren, k];
    const neuerRest = rest / k;
    setMeldung(null);
    aktivitaetMelden({ ok: null });
    if (neuerRest > 1 && istPrim(neuerRest)) {
      aktivitaetMelden({ ok: true });
      liste.push(neuerRest);
      setAutoletzter(neuerRest);
      setFaktoren(liste);
      setStand("ok"); setSerie((s) => ({ n: s.n + 1, ok: s.ok + 1 }));
      return;
    }
    setFaktoren(liste);
    if (neuerRest === 1) { setStand("ok"); setSerie((s) => ({ n: s.n + 1, ok: s.ok + 1 })); aktivitaetMelden({ ok: true }); }
  };

  const letztenWeg = () => {
    setFaktoren(faktoren.slice(0, autoletzter ? -2 : -1));
    setAutoletzter(null); setMeldung(null); setStand(null);
  };

  const grenze = Math.floor(Math.sqrt(rest));
  const hilfeTexte = [
    rest % 2 === 0
      ? `${rest} ist gerade — dann ist 2 auf jeden Fall ein Faktor.`
      : `${rest} ist ungerade, 2 fällt also weg. Geh die Primzahlen der Reihe nach durch: 3, 5, 7, 11, 13 …`,
    `Du musst nur bis zur Wurzel testen, hier also bis etwa ${grenze}. Findest du bis dahin keinen Teiler, ist ${rest} prim.`,
    rest > 1 && !istPrim(rest)
      ? `Der kleinste Primfaktor von ${rest} ist ${kleinsterFaktor(rest)}.`
      : rest > 1 ? `${rest} ist selbst schon prim — das ist dein letzter Faktor.` : "Du bist bereits fertig.",
  ];

  return (
    <div>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Spalte einen Primfaktor nach dem anderen ab, bis nichts mehr übrig bleibt — jeden einzeln,
        also 2 · 2 · 2 · 5 und nicht 2³ · 5.
      </p>

      <div className="flex gap-2 mb-5">
        {PF_STUFEN.map((s) => (
          <button key={s.id} onClick={() => stufeWechseln(s)} className="px-4 py-2"
            style={{ flex: 1, background: stufe.id === s.id ? C.see : C.weiss, color: stufe.id === s.id ? C.weiss : C.grau,
              border: `1px solid ${stufe.id === s.id ? C.see : C.linie}`, borderRadius: 999, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
            {s.name}
          </button>
        ))}
      </div>

      {/* Die Zahl, an der gerade gearbeitet wird */}
      <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 18,
        padding: "24px 20px", textAlign: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 12.5, color: "#C9D6EE", fontWeight: 300, marginBottom: 6 }}>
          Zerlege in Primfaktoren
        </p>
        <p style={{ fontSize: 52, fontWeight: 700, color: C.weiss, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {auf.n}
        </p>
        <p style={{ fontSize: 12.5, color: "#C9D6EE", fontWeight: 300, marginTop: 10, lineHeight: 1.6 }}>
          {naechsteQuadratzahl(auf.n).k} · {naechsteQuadratzahl(auf.n).k} = {naechsteQuadratzahl(auf.n).q} —
          du musst nur bis {naechsteQuadratzahl(auf.n).k - 1} testen.
        </p>
        {faktoren.length > 0 && (
          <p style={{ fontSize: 14, color: C.gruen, fontWeight: 600, marginTop: 10 }}>
            Faktoren: {[...faktoren].sort((a, b) => a - b).join(" · ")}
          </p>
        )}
        {serie.n > 0 && (
          <p style={{ fontSize: 12.5, color: "#C9D6EE", fontWeight: 300, marginTop: 8 }}>
            {serie.ok} von {serie.n} richtig
          </p>
        )}
      </div>

      {/* Die Zerlegungsleiter */}
      <div style={{ background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 12 }}>
        {leiter.length === 0 ? (
          <p style={{ color: C.hellgrau, fontSize: 14, fontWeight: 300 }}>
            Tipp eine Primzahl ein, die {auf.n} teilt.
          </p>
        ) : (
          <>
            {leiter.map((z, i) => (
              <div key={i} style={{ fontSize: 19, lineHeight: 2, color: C.tinte,
                paddingLeft: i * 14, opacity: i === leiter.length - 1 ? 1 : 0.75 }}>
                <M t={`${z.von} = ${z.faktor} \\cdot ${z.rest}`} />
              </div>
            ))}
            {autoletzter ? (
              <p style={{ fontSize: 16, color: C.gruenDunkel, fontWeight: 600, lineHeight: 1.8, marginTop: 4 }}>
                {autoletzter} ist selbst prim — damit ist die Zerlegung vollständig.
              </p>
            ) : rest > 1 ? (
              <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginTop: 8, lineHeight: 1.7 }}>
                Jetzt {rest} weiter zerlegen · {naechsteQuadratzahl(rest).k} · {naechsteQuadratzahl(rest).k} = {naechsteQuadratzahl(rest).q},
                also nur bis {naechsteQuadratzahl(rest).k - 1} testen.
              </p>
            ) : null}
          </>
        )}

      </div>

      {meldung && (
        <div style={{ borderLeft: `4px solid ${meldung.art === "warn" ? C.signal : C.see}`, paddingLeft: 16, marginBottom: 12 }}>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>{meldung.text}</p>
        </div>
      )}

      {stand === "ok" && (
        <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 14 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.see, marginBottom: 6 }}>Stimmt.</p>
          <div style={{ fontSize: 17, lineHeight: 2.1 }}>
            <M t={`${auf.n} = ${[...faktoren].sort((a, b) => a - b).join(" \\cdot ")} = ${potenzform(auf.faktoren)}`} />
          </div>
        </div>
      )}

      {!fertig && (
        <>
          <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, marginBottom: 8 }}>
            Tippe die Primzahl an, die du abspalten willst.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {PRIMLISTE.slice(0, sichtbar).map((p) => (
              <button key={p} onClick={() => faktorNehmen(p)}
                style={{ width: "100%", height: 44, background: C.weiss, color: C.tinte,
                  border: `1px solid ${C.linie}`, borderRadius: 12, fontSize: p > 99 ? 14 : 16.5,
                  fontWeight: 500, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
                {p}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
            <button onClick={() => setSichtbar(Math.min(sichtbar + 20, PRIMLISTE.length))}
              disabled={sichtbar >= PRIMLISTE.length}
              style={{ height: 44, background: C.himmel, color: sichtbar >= PRIMLISTE.length ? C.hellgrau : C.see,
                border: `1px solid ${C.linie}`, borderRadius: 12, fontSize: 13, fontWeight: 500,
                fontFamily: "inherit", cursor: sichtbar >= PRIMLISTE.length ? "default" : "pointer" }}>
              mehr Primzahlen
            </button>
            <button onClick={letztenWeg} disabled={!faktoren.length}
              style={{ height: 44, background: C.himmel, color: faktoren.length ? C.tinte : C.hellgrau,
                border: `1px solid ${C.linie}`, borderRadius: 12, fontSize: 13, fontWeight: 500,
                fontFamily: "inherit", cursor: faktoren.length ? "pointer" : "default" }}>
              letzten Faktor zurück
            </button>
          </div>

        </>
      )}

      <div className="flex flex-wrap gap-3 mt-5">
        <button onClick={() => neu()} className="px-6 py-3"
          style={{ background: fertig ? C.gruenDunkel : C.weiss, color: fertig ? C.weiss : C.see,
            border: fertig ? "none" : `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15,
            fontWeight: fertig ? 600 : 400, fontFamily: "inherit", cursor: "pointer" }}>
          Neue Zahl
        </button>
        {!fertig && (
          <button onClick={() => setHilfe(Math.min(hilfe + 1, 3))} className="px-6 py-3"
            style={{ background: "transparent", color: C.grau, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
            {hilfe === 0 ? "Ich komme nicht weiter" : "Noch ein Hinweis"}
          </button>
        )}
      </div>

      {hilfe > 0 && !fertig && (
        <div style={{ background: C.himmel, borderRadius: 16, padding: 18, marginTop: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 }}>Hinweis {hilfe} von 3</p>
          {hilfeTexte.slice(0, hilfe).map((t, i) => (
            <p key={i} style={{ fontSize: 14.5, lineHeight: 1.75, marginBottom: 8 }}>{t}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Bereich Kopfrechnen ---------- */


export function Kopfrechnen() {
  const [offen, setOffen] = useState(null);

  if (!offen) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
          Sicherheit im Umgang mit Zahlen
        </h2>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
          Wer Zahlen zerlegen kann, kürzt Brüche schneller, sieht Teiler sofort und hat beim Rechnen den Kopf
          für das Eigentliche frei.
        </p>
        {KOPF_WERKZEUGE.map((w) => (
          <button key={w.id} onClick={() => setOffen(w)} className="w-full px-5 py-5 mb-3"
            style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, textAlign: "left",
              cursor: "pointer", fontFamily: "inherit", color: C.tinte, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
            <p style={{ fontSize: 17.5, fontWeight: 600, marginBottom: 4 }}>{w.titel}</p>
            <p style={{ color: C.grau, fontSize: 13.5, fontWeight: 300, lineHeight: 1.6 }}>{w.kurz}</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <button onClick={() => setOffen(null)} className="mb-5"
        style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
        ← Kopfrechnen
      </button>
      <h2 style={{ fontSize: 25, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        {offen.titel}
      </h2>
      <Primfaktoren />
    </div>
  );
}

/* ---------- Protokoll: Grundlage für Fehlerprofil und Tempo ---------- */

/* Läuft im Arbeitsspeicher der Sitzung. Mit Nutzerkonten wandert das später
   in die Datenbank — die Auswertung darüber bleibt dieselbe. */

export function merken(eintrag) {
  PROTOKOLL.push({ zeit: Date.now(), ...eintrag });
  try { lernAusUebung(eintrag); } catch (e) { /* Lernstand ist optional */ }
  try { aktivitaetMelden({ ok: eintrag.richtig ?? null, fehlerart: eintrag.fehlerart || null }); } catch (e) { /* optional */ }
  if (PROTOKOLL.length > 500) PROTOKOLL.splice(0, PROTOKOLL.length - 500);
  if (LERN.geladen) lernSpeichern();
}


export function profilAuswertung() {
  const alle = PROTOKOLL.filter((p) => p.richtig !== undefined);
  const gesamt = alle.length;
  const treffer = alle.filter((p) => p.richtig).length;

  const proGruppe = {};
  alle.forEach((p) => {
    const g = p.gruppe || "übrige";
    proGruppe[g] = proGruppe[g] || { n: 0, ok: 0, zeiten: [] };
    proGruppe[g].n++;
    if (p.richtig) proGruppe[g].ok++;
    if (p.sekunden) proGruppe[g].zeiten.push(p.sekunden);
  });

  const fehler = {};
  alle.filter((p) => !p.richtig && p.fehlerart).forEach((p) => {
    fehler[p.fehlerart] = (fehler[p.fehlerart] || 0) + 1;
  });

  const zeiten = alle.filter((p) => p.richtig && p.sekunden).map((p) => p.sekunden).sort((a, b) => a - b);
  const median = zeiten.length ? zeiten[Math.floor(zeiten.length / 2)] : null;
  const letzte = alle.filter((p) => p.sekunden).slice(-20);

  return { gesamt, treffer, proGruppe, fehler, median, letzte, zeiten };
}

/* ---------- Bereich Fortschritt ---------- */


export function Fortschritt() {
  const a = profilAuswertung();
  const quote = a.gesamt ? Math.round((a.treffer / a.gesamt) * 100) : 0;
  const fehlerListe = Object.entries(a.fehler).sort((x, y) => y[1] - x[1]);
  const maxZeit = Math.max(...a.letzte.map((l) => l.sekunden), 1);

  if (!a.gesamt) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75 }}>
          Hier steht bald, wie weit du ohne Hilfe kommst, welche Fehlerarten sich wiederholen und wie schnell
          dir das Ableiten von der Hand geht. Rechne ein paar Aufgaben im Aufgabengenerator, dann füllt sich diese Seite.
        </p>
        <p style={{ color: C.hellgrau, fontSize: 12.5, fontWeight: 300, lineHeight: 1.7, marginTop: 16 }}>
          Die Daten liegen auf diesem Gerät. Mit Nutzerkonten sind sie später auf jedem Gerät da.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 18, padding: 24, marginBottom: 18 }}>
        <p style={{ fontSize: 12.5, color: "#C9D6EE", fontWeight: 300, marginBottom: 8 }}>Eigenständigkeit</p>
        <p style={{ fontSize: 46, fontWeight: 700, color: C.weiss, letterSpacing: "-0.03em", lineHeight: 1 }}>{quote}</p>
        <p style={{ fontSize: 14, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.7, marginTop: 10 }}>
          Du hast {a.treffer} von {a.gesamt} Aufgaben ohne Hilfe richtig gelöst.
          {a.median ? ` Im Mittel brauchst du ${a.median} Sekunden pro Aufgabe.` : ""}
        </p>
      </div>

      {/* Fehlerarten */}
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 10 }}>Woran es hakt</p>
      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 18 }}>
        {fehlerListe.length === 0 ? (
          <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>
            Noch kein wiederkehrender Fehler erkennbar.
          </p>
        ) : (
          fehlerListe.map(([art, n]) => {
            const anteil = Math.round((n / Math.max(a.gesamt - a.treffer, 1)) * 100);
            return (
              <div key={art} style={{ marginBottom: 14 }}>
                <div className="flex justify-between items-baseline mb-2">
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{FEHLERARTEN[art] || art}</span>
                  <span style={{ fontSize: 12.5, color: C.hellgrau }}>{n}×</span>
                </div>
                <div style={{ height: 5, background: C.himmel, borderRadius: 999 }}>
                  <div style={{ height: 5, borderRadius: 999, width: `${anteil}%`, background: C.signal }} />
                </div>
              </div>
            );
          })
        )}
        <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, lineHeight: 1.7, marginTop: 6 }}>
          Nicht wie viele Fehler, sondern welche — daran arbeitet man gezielt.
        </p>
      </div>

      {/* Nach Regelgruppe */}
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 10 }}>Nach Themen</p>
      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 18 }}>
        {Object.entries(a.proGruppe).map(([g, w]) => {
          const p = Math.round((w.ok / w.n) * 100);
          const med = w.zeiten.length ? w.zeiten.slice().sort((x, y) => x - y)[Math.floor(w.zeiten.length / 2)] : null;
          return (
            <div key={g} style={{ marginBottom: 16 }}>
              <div className="flex justify-between items-baseline mb-2">
                <span style={{ fontSize: 14, fontWeight: 500 }}>{g}</span>
                <span style={{ fontSize: 12.5, color: C.hellgrau }}>
                  {w.ok}/{w.n}{med ? ` · ${med} s` : ""}
                </span>
              </div>
              <div style={{ height: 5, background: C.himmel, borderRadius: 999 }}>
                <div style={{ height: 5, borderRadius: 999, width: `${p}%`, background: p >= 70 ? C.see : C.signal }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tempo */}
      {a.letzte.length > 2 && (
        <>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 10 }}>Tempo</p>
          <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
            <div className="flex items-end" style={{ gap: 4, height: 70 }}>
              {a.letzte.map((l, i) => (
                <div key={i} title={`${l.sekunden} s`}
                  style={{ flex: 1, height: `${Math.max(6, (l.sekunden / maxZeit) * 100)}%`,
                    background: l.richtig ? C.see : C.signal, borderRadius: 3, minWidth: 4 }} />
              ))}
            </div>
            <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginTop: 10 }}>
              Sekunden pro Aufgabe, die letzten {a.letzte.length}. Blau steht für richtig, rostbraun für daneben.
              Ableiten soll irgendwann so schnell gehen wie das kleine Einmaleins — kürzere Balken sind das Ziel.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Arbeitsblatt zum Ausdrucken ---------- */


export function Arbeitsblatt() {
  const [typ, setTyp] = useState(ABL_TYPEN[0]);
  const [stufe, setStufe] = useState(2);
  const [anzahl, setAnzahl] = useState(12);
  const [blatt, setBlatt] = useState(null);

  const erzeugen = () => {
    const liste = [];
    for (let i = 0; i < anzahl; i++) liste.push(typ.mach(stufe));
    setBlatt({ liste, typ: typ.name, regel: typ.regel, stufe });
  };

  return (
    <div>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Erzeuge ein Arbeitsblatt im Matheskript-Layout — mit Rand für Nebenrechnungen und einem Lösungsteil
        auf der Rückseite. Zum Ausdrucken oder als PDF sichern.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {ABL_TYPEN.map((t) => (
          <button key={t.id} onClick={() => { setTyp(t); setBlatt(null); }} className="px-4 py-2"
            style={{ background: typ.id === t.id ? C.see : C.weiss, color: typ.id === t.id ? C.weiss : C.grau,
              border: `1px solid ${typ.id === t.id ? C.see : C.linie}`, borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
            {t.name}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 8 }}>Schwierigkeitsstufe</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map((k) => (
          <button key={k} onClick={() => { setStufe(k); setBlatt(null); }}
            style={{ height: 44, borderRadius: 12, border: `1px solid ${stufe === k ? C.gruenDunkel : C.linie}`,
              background: stufe === k ? C.gruenDunkel : C.weiss, color: stufe === k ? C.weiss : C.grau,
              fontSize: 15, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>{k}</button>
        ))}
      </div>

      <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginBottom: 8 }}>Anzahl der Aufgaben</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 20 }}>
        {[8, 12, 16, 20].map((k) => (
          <button key={k} onClick={() => { setAnzahl(k); setBlatt(null); }}
            style={{ height: 44, borderRadius: 12, border: `1px solid ${anzahl === k ? C.see : C.linie}`,
              background: anzahl === k ? C.see : C.weiss, color: anzahl === k ? C.weiss : C.grau,
              fontSize: 15, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>{k}</button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={erzeugen} className="px-6 py-3"
          style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Arbeitsblatt erzeugen
        </button>
        {blatt && (
          <button onClick={() => window.print()} className="px-6 py-3"
            style={{ background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
            Drucken oder als PDF sichern
          </button>
        )}
      </div>

      {blatt && (
        <div className="druckblatt" style={{ background: C.weiss, borderRadius: 16, padding: 26, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
          <div style={{ borderBottom: `3px solid ${C.gruen}`, paddingBottom: 10, marginBottom: 18 }}>
            <p style={{ fontSize: 10.5, letterSpacing: "1.6px", color: C.gruenDunkel, fontWeight: 600 }}>
              MYTHOS MATHE · MATHESKRIPT
            </p>
            <p style={{ fontSize: 21, fontWeight: 700, color: C.see, marginTop: 4 }}>
              Ableiten · {blatt.typ}
            </p>
            <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, marginTop: 3 }}>
              {blatt.regel} · Stufe {blatt.stufe} · {blatt.liste.length} Aufgaben
            </p>
          </div>

          <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginBottom: 16 }}>
            Ein Gedanke pro Zeile. Nebenrechnungen in den rechten Rand, Endergebnis markieren.
          </p>

          {blatt.liste.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 12, paddingBottom: 12, marginBottom: 12,
              borderBottom: `1px solid ${C.linie}` }}>
              <span style={{ color: C.gruenDunkel, fontWeight: 700, fontSize: 13, width: 22, flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1, fontSize: 16, lineHeight: 1.9 }}>f(x) = <M t={a.tex} /></div>
              <div style={{ width: 70, borderLeft: `1px dashed ${C.linie}` }} />
            </div>
          ))}

          <div className="seitenumbruch" style={{ marginTop: 26, paddingTop: 16, borderTop: `2px solid ${C.gruen}` }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>
              Lösungen zur Selbstkontrolle
            </p>
            <div style={{ fontSize: 13.5, lineHeight: 2.1, color: C.tinte }}>
              {blatt.liste.map((a, i) => (
                <span key={i} style={{ marginRight: 16, display: "inline-block" }}>
                  <span style={{ color: C.hellgrau, marginRight: 5 }}>{i + 1}</span>
                  <M t={a.zeig} />
                </span>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 10.5, color: C.hellgrau, fontWeight: 300, marginTop: 20, textAlign: "center" }}>
            matheskript.de · Mathe ist kein Talenttest.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------- Rechenweg vom Foto ---------- */

/* Baut aus erkannten Koeffizienten dieselbe Aufgabenstruktur, die auch der
   Generator liefert — damit läuft der normale Prüfmotor darüber. */

export function ausKoeffizienten(typId, k) {
  const z = (v, s) => (typeof v === "number" && isFinite(v) ? v : s);
  if (typId === "scheitel" || typId === "nullstellen" || typId === "tangente") {
    const a = z(k.a, 1), b = z(k.b, 0), c = z(k.c, 0);
    if (a === 0) return null;
    const tex = `${a === 1 ? "" : a === -1 ? "-" : a}x^2 ${b < 0 ? "- " : "+ "}${Math.abs(b)}x ${c < 0 ? "- " : "+ "}${Math.abs(c)}`;
    const basis = { a, b, c, tex, f: `${a}x^2+${b}x+${c}`, abl: `${2 * a}x+${b}` };
    if (typId === "scheitel") {
      const xs = -b / (2 * a), ys = a * xs * xs + b * xs + c;
      return { ...basis, xs, ys, hoch: a < 0, art: a < 0 ? "Hochpunkt" : "Tiefpunkt" };
    }
    if (typId === "nullstellen") {
      const d = b * b - 4 * a * c;
      if (d < 0) return null;
      const w = Math.sqrt(d);
      return { ...basis, r1: (-b - w) / (2 * a), r2: (-b + w) / (2 * a) };
    }
    const x0 = z(k.x0, 0);
    const m = 2 * a * x0 + b, y0 = a * x0 * x0 + b * x0 + c;
    return { ...basis, x0, m, y0, n: y0 - m * x0, tangente: `${m}x+${y0 - m * x0}` };
  }
  if (typId === "extrem") {
    const a = z(k.a, 1), b = z(k.b, 0), c = z(k.c, 0), d = z(k.d, 0);
    if (a === 0) return null;
    const disk = 4 * b * b - 12 * a * c;
    if (disk <= 0) return null;
    const w = Math.sqrt(disk);
    const x1 = (-2 * b - w) / (6 * a), x2 = (-2 * b + w) / (6 * a);
    const klein = Math.min(x1, x2), gross = Math.max(x1, x2);
    const f = (x) => a * x ** 3 + b * x ** 2 + c * x + d;
    const f2 = (x) => 6 * a * x + 2 * b;
    return {
      a, b, c, d, f, klein, gross,
      hoch: f2(klein) < 0 ? klein : gross,
      tief: f2(klein) < 0 ? gross : klein,
      wende: -b / (3 * a),
      fs: `${3 * a}x^2+${2 * b}x+${c}`,
      fss: `${6 * a}x+${2 * b}`,
      tex: `${a}x^3+${b}x^2+${c}x+${d}`,
    };
  }
  return null;
}


export function WegVomBlatt() {
  const [bild, setBild] = useState(null);
  const [b64, setB64] = useState(null);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState(null);
  const [zeilen, setZeilen] = useState(null);
  const [kopf, setKopf] = useState(null);
  const [bericht, setBericht] = useState(null);
  const kameraRef = useRef(null);
  const galerieRef = useRef(null);

  const waehlen = async (file) => {
    if (!file) return;
    setFehler(null); setZeilen(null); setBericht(null); setKopf(null);
    try {
      const src = await dekodieren(file, () => {});
      const r = rendern(src, 0);
      setB64(r.b64); setBild(r.vorschau);
    } catch (e) { setFehler(e.message); }
  };

  const lesen = async () => {
    if (!b64) return;
    setLaedt(true); setFehler(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST", headers: kiKopf(),
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } },
            { type: "text", text: `Auf dem Blatt steht ein handschriftlicher Rechenweg zu einer Mathematikaufgabe.

Antworte nur mit JSON:
{"typ":"scheitel|nullstellen|tangente|extrem|unbekannt","a":Zahl,"b":Zahl,"c":Zahl,"d":Zahl,"x0":Zahl,"zeilen":["Zeile 1","Zeile 2"]}

typ bezeichnet die Aufgabenart. a, b, c, d sind die Koeffizienten der untersuchten Funktion (fehlende weglassen), x0 nur bei Tangentenaufgaben.
Jede geschriebene Zeile kommt als eigener Eintrag in "zeilen", in Maschinenschreibweise: ^ für Potenzen, * für Produkte, / für Brüche, f′(x)= als Beschriftung, Punkte als H(2|3). Nichts ergänzen, nichts korrigieren — schreib genau das auf, was dasteht.` },
          ] }],
        }),
      });
      const daten = await res.json();
      if (daten.error) throw new Error(`Die API hat abgelehnt: ${daten.error.message}`);
      const text = (daten.content || []).map((t) => (t.type === "text" ? t.text : "")).join("");
      const roh = jsonLesen(text);
      setZeilen(roh.zeilen || []);
      const typ = WEG_TYPEN.find((t) => t.id === roh.typ);
      const auf = typ ? ausKoeffizienten(roh.typ, roh) : null;
      setKopf(typ && auf ? { typ, auf } : null);
      setBericht(null);
    } catch (e) {
      setFehler(e.message || "Der Weg konnte nicht gelesen werden.");
    } finally { setLaedt(false); }
  };

  const pruefen = () => {
    if (kopf) setBericht(wegPruefen(zeilen, kopf.typ, kopf.auf));
    else {
      // Ohne erkannten Aufgabentyp bleibt die Prüfung der Umformungen
      const f = [];
      zeilen.forEach((z, i) => {
        const teile = String(z).split("=").map((s) => s.trim()).filter(Boolean);
        if (teile.length < 2) return;
        const fns = teile.map((s) => alsFunktion(s));
        if (!fns.every(Boolean)) return;
        for (let k = 1; k < fns.length; k++)
          if (!stimmtUeberein(fns[0], fns[k], 1e-6))
            f.push(`Zeile ${i + 1}: Die Seiten haben nicht denselben Wert — hier bricht die Umformung.`);
      });
      setBericht({ erfuellt: {}, fehler: f, offen: [], lob: [], vollstaendig: f.length === 0, nurZeilen: true });
    }
  };

  const zeileAendern = (i, wert) => {
    const kopie = [...zeilen]; kopie[i] = wert; setZeilen(kopie); setBericht(null);
  };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 20 }}>
        Fotografiere deinen Rechenweg. Mathilda überträgt ihn Zeile für Zeile — du korrigierst, wo sie sich
        verlesen hat, und lässt den Weg dann prüfen wie im Editor.
      </p>

      {!bild && (
        <div>
          <button onClick={() => kameraRef.current?.click()} className="w-full px-6 py-7"
            style={{ background: C.see, border: "none", borderRadius: 16, textAlign: "left", cursor: "pointer", color: C.weiss, fontFamily: "inherit" }}>
            <span style={{ fontSize: 17, fontWeight: 600 }}>Rechenweg fotografieren</span>
            <span className="block mt-2" style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.6, opacity: 0.85 }}>
              Ein Blatt, von oben, gutes Licht.
            </span>
          </button>
          <button onClick={() => galerieRef.current?.click()} className="w-full px-6 py-7 mt-3"
            style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, textAlign: "left", cursor: "pointer", color: C.tinte, fontFamily: "inherit" }}>
            <span style={{ fontSize: 17, fontWeight: 600 }}>Aus der Galerie wählen</span>
          </button>
        </div>
      )}

      <input ref={kameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => waehlen(e.target.files?.[0])} />
      <input ref={galerieRef} type="file" accept="image/*,.heic,.heif" className="hidden"
        onChange={(e) => waehlen(e.target.files?.[0])} />

      {bild && !zeilen && (
        <>
          <img src={bild} alt="Rechenweg" style={{ width: "100%", borderRadius: 16, border: `2px solid ${C.see}` }} />
          <div className="flex flex-wrap gap-3 mt-4">
            <button onClick={lesen} disabled={laedt} className="px-6 py-3"
              style={{ background: laedt ? C.hellgrau : C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: laedt ? "wait" : "pointer" }}>
              {laedt ? "Mathilda liest…" : "Weg übertragen"}
            </button>
            <button onClick={() => { setBild(null); setB64(null); }} className="px-6 py-3"
              style={{ background: "transparent", color: C.grau, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
              Anderes Blatt
            </button>
          </div>
        </>
      )}

      {fehler && (
        <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginTop: 18 }}>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>{fehler}</p>
        </div>
      )}

      {zeilen && (
        <>
          <div style={{ background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 4 }}>
              {kopf ? kopf.typ.titel : "Aufgabentyp nicht erkannt"}
            </p>
            <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>
              {kopf
                ? "Der Weg wird auf Korrektheit und Vollständigkeit geprüft."
                : "Ohne erkannten Aufgabentyp werden nur die Umformungen geprüft, nicht die Vollständigkeit."}
            </p>
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>
            Das habe ich gelesen — korrigier, was nicht stimmt
          </p>
          {zeilen.map((z, i) => (
            <div key={i} style={{ background: C.weiss, borderRadius: 12, padding: "10px 14px", marginBottom: 8,
              boxShadow: "0 2px 12px rgba(15,26,51,0.05)",
              borderLeft: `3px solid ${bericht && bericht.fehler.some((f) => f.startsWith(`Zeile ${i + 1}:`)) ? C.signal : C.linie}` }}>
              <div style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 6 }}>{zeileSetzen(z)}</div>
              <input value={z} onChange={(e) => zeileAendern(i, e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", padding: "7px 10px", fontSize: 13.5,
                  fontFamily: "ui-monospace, monospace", border: `1px solid ${C.linie}`, borderRadius: 9,
                  outline: "none", color: C.grau }} />
            </div>
          ))}

          <div className="flex flex-wrap gap-3 mt-4">
            <button onClick={pruefen} className="px-6 py-3"
              style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
              Weg prüfen
            </button>
            <button onClick={() => { setZeilen(null); setBild(null); setB64(null); setBericht(null); }} className="px-6 py-3"
              style={{ background: "transparent", color: C.grau, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
              Anderes Blatt
            </button>
          </div>
        </>
      )}

      {bericht && (
        <div style={{ background: C.weiss, borderRadius: 16, padding: 20, marginTop: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: bericht.vollstaendig ? C.see : C.signal, marginBottom: 12 }}>
            {bericht.vollstaendig
              ? (bericht.nurZeilen ? "Alle Umformungen tragen." : "Der Weg ist vollständig und trägt.")
              : "Der Weg ist noch nicht vollständig."}
          </p>
          {kopf && kopf.typ.schritte.map((s) => {
            const da = bericht.erfuellt[s.id];
            return (
              <div key={s.id} className="flex items-center" style={{ gap: 10, marginBottom: 8 }}>
                <span style={{ width: 16, textAlign: "center", fontSize: 14,
                  color: da ? C.see : s.weich ? C.hellgrau : C.signal }}>
                  {da ? "✓" : s.weich ? "·" : "○"}
                </span>
                <span style={{ fontSize: 14, color: da ? C.tinte : C.grau, fontWeight: da ? 500 : 300 }}>{s.name}</span>
              </div>
            );
          })}
          {bericht.fehler.length > 0 && (
            <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginTop: 14 }}>
              {bericht.fehler.map((f, i) => (
                <p key={i} style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75, marginBottom: 6 }}>{f}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Lösungsweg-Generator ---------- */

/* Mehrzeiliger Editor für ganze Rechenwege. Jedes Element wird über ein
   Tastenfeld eingefügt, das sich in Untergruppen öffnet. */


