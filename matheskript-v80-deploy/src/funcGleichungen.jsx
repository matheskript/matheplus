import React, { useState, useRef, useEffect } from "react";
import { C } from "./base1.jsx";
import { merken } from "./func5.jsx";
import * as G from "./gleichungen/engine.js";

/* ======================================================================
   GLEICHUNGSLÖSER
   Der Schüler sieht eine Gleichung und tippt Äquivalenzumformungen ein
   („−5“, „+6x“, „:3“, „ln“ …). Die App führt sie auf beiden Seiten aus,
   vereinfacht und schreibt die neue Zeile darunter — mit der Randnotiz
   „| −5“ wie im Heft und den Gleichheitszeichen untereinander.
   Der Rechenkern steht in ./gleichungen/engine.js.
   ====================================================================== */

const GL_CSS = `
.gl-heft{display:grid;grid-template-columns:auto auto auto auto;column-gap:8px;row-gap:12px;align-items:center;width:max-content;min-width:100%}
.gl-bruch{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 .1em;font-size:.84em;line-height:1.2}
.gl-oben{padding:0 .22em .1em;border-bottom:1.5px solid currentColor}
.gl-unten{padding:.1em .22em 0}
.gl-hoch{font-size:.64em;position:relative;top:-.62em;vertical-align:baseline;line-height:0;margin-left:.04em}
.gl-tief{font-size:.64em;position:relative;top:.28em;vertical-align:baseline;line-height:0}
.gl-wurzel{display:inline-flex;align-items:flex-end;white-space:nowrap}
.gl-wz{font-size:1.04em;line-height:1;margin-right:.02em}
.gl-rad{border-top:1.5px solid currentColor;padding:.04em .1em 0;line-height:1.15}
.gl-x{font-style:italic;font-weight:600;padding-right:.05em}
.gl-taste{transition:transform .08s ease, background .12s ease}
.gl-taste:active{transform:scale(.94)}
@media (hover:hover){.gl-taste:hover{filter:brightness(0.97)}}
.gl-zeile-neu{animation:glNeu .38s cubic-bezier(.2,.7,.3,1) both}
@keyframes glNeu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.gl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.gl-scroll::-webkit-scrollbar{height:4px}.gl-scroll::-webkit-scrollbar-thumb{background:${C.linie};border-radius:4px}
`;

/* Darstellungsbaum aus dem Rechenkern → JSX */
export function Baum({ n }) {
  if (!n) return null;
  switch (n.t) {
    case "txt": return n.v;
    case "var": return <i className="gl-x">x</i>;
    case "reihe": return <>{n.c.map((c, i) => <Baum key={i} n={c} />)}</>;
    case "klammer": return <>(<Baum n={n.c} />)</>;
    case "tief": return <><Baum n={n.b} /><sub className="gl-tief"><Baum n={n.i} /></sub></>;
    case "wurzel": return <span className="gl-wurzel"><span className="gl-wz">√</span><span className="gl-rad"><Baum n={n.c} /></span></span>;
    case "bruch": return <span className="gl-bruch"><span className="gl-oben"><Baum n={n.o} /></span><span className="gl-unten"><Baum n={n.u} /></span></span>;
    case "hoch": return <><Baum n={n.b} /><sup className="gl-hoch"><Baum n={n.e} /></sup></>;
    default: return null;
  }
}
const Ausdruck = ({ s }) => <Baum n={G.sumBaum(s)} />;
const komma = (v, stellen = 3) => (Number.isFinite(v) ? (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(stellen).replace(".", ",").replace(/0+$/, "").replace(/,$/, "")).replace("-", "−") : "—");

const WERKZEUGE = [
  { id: "mitternacht", name: "Mitternachtsformel", kurz: "für ax² + bx + c = 0", haupt: true, formel: "x₁,₂ = (−b ± √(b² − 4ac)) / 2a" },
  { id: "wurzel", name: "Wurzel ziehen ±", kurz: "wenn ein Quadrat allein steht" },
  { id: "ausmult", name: "Ausmultiplizieren", kurz: "Klammern auflösen" },
  { id: "ausklam", name: "x ausklammern", kurz: "x² − 5x = x(x − 5)" },
  { id: "nullprod", name: "Nullprodukt", kurz: "Produkt = 0" },
];
const WERKZEUG_NAME = Object.fromEntries(WERKZEUGE.map((w) => [`#${w.id}`, w.name]));

function ersterStart(art, stufe) {
  const g = G.erzeugen(art, stufe);
  return { start: { l: g.l, r: g.r }, zeilen: [{ zweige: [G.status({ l: g.l, r: g.r })], op: null }] };
}

/* ---------- Darstellung ---------- */

const Randnotiz = ({ op }) => {
  if (!op) return <span />;
  let inhalt;
  if (op.art === "exp") inhalt = <>{op.b === "e" ? "e" : G.bruchText(op.b)}<sup className="gl-hoch">( )</sup></>;
  else inhalt = <Baum n={G.opBaum(op)} />;
  const lang = ["mitternacht", "ausmult", "ausklam", "nullprod"].includes(op.art);
  return (
    <span style={{ borderLeft: `1.5px solid ${C.hellgrau}`, paddingLeft: 10, color: C.gruen, fontWeight: 600,
      fontSize: lang ? 11.5 : "0.86em", whiteSpace: lang ? "normal" : "nowrap", display: "inline-block", maxWidth: lang ? 84 : "none", lineHeight: lang ? 1.25 : "inherit", hyphens: "manual" }}>
      {inhalt}
    </span>
  );
};

const MitternachtsKasten = ({ d }) => {
  const { a, b, c, D } = d;
  const neg = (r) => ({ n: -r.n, d: r.d });
  const zwei = { n: 2 * a.n, d: a.d };
  const Zahl = ({ r, klammer }) => {
    const t = <Baum n={G.bruchBaum(r)} />;
    return klammer && (r.n < 0 || r.d !== 1) ? <>({t})</> : t;
  };
  const zeile = { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, fontSize: 16, lineHeight: 1.9 };
  return (
    <div className="gl-zeile-neu" style={{ gridColumn: "1 / -1", width: 0, minWidth: "100%", boxSizing: "border-box", overflowX: "auto", background: C.himmel, borderRadius: 14, padding: "14px 16px", margin: "2px 0 4px" }}>
      <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", color: C.see, marginBottom: 6 }}>MITTERNACHTSFORMEL</p>
      <div style={{ ...zeile, fontSize: 14, color: C.grau }}>
        <span><i className="gl-x" style={{ fontStyle: "normal" }}>a</i> = <Zahl r={a} /></span>
        <span style={{ marginLeft: 10 }}>b = <Zahl r={b} /></span>
        <span style={{ marginLeft: 10 }}>c = <Zahl r={c} /></span>
      </div>
      <div style={zeile}>
        <span><i className="gl-x">x</i><sub className="gl-tief">1,2</sub> =</span>
        <span className="gl-bruch"><span className="gl-oben">−b ± <span className="gl-wurzel"><span className="gl-wz">√</span><span className="gl-rad">b² − 4ac</span></span></span><span className="gl-unten">2a</span></span>
        <span>=</span>
        <span className="gl-bruch">
          <span className="gl-oben"><Zahl r={neg(b)} /> ± <span className="gl-wurzel"><span className="gl-wz">√</span><span className="gl-rad"><Zahl r={b} klammer />² − 4·<Zahl r={a} klammer />·<Zahl r={c} klammer /></span></span></span>
          <span className="gl-unten">2·<Zahl r={a} klammer /></span>
        </span>
      </div>
      <div style={zeile}>
        <span style={{ color: C.grau, fontSize: 14 }}>Diskriminante</span>
        <span>D = b² − 4ac = <b style={{ fontWeight: 600 }}><Zahl r={D} /></b></span>
        {D.n > 0 && <span>→ <i className="gl-x">x</i><sub className="gl-tief">1,2</sub> = <span className="gl-bruch"><span className="gl-oben"><Zahl r={neg(b)} /> ± {d.wurzelD ? <Ausdruck s={d.wurzelD} /> : "√D"}</span><span className="gl-unten"><Zahl r={zwei} /></span></span></span>}
      </div>
      <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: 4 }}>
        {D.n > 0 ? "D > 0: zwei Lösungen." : D.n === 0 ? "D = 0: genau eine Lösung." : "D < 0: Unter der Wurzel steht etwas Negatives — keine reelle Lösung."}
      </p>
    </div>
  );
};

const Heft = ({ zeilen: zs, fertig }) => (
  <div className="gl-heft" style={{ fontSize: "clamp(17px, 4.7vw, 20px)", color: C.tinte, fontWeight: 500 }}>
    {zs.map((zeile, i) => {
      const letzte = i === zs.length - 1;
      const farbe = letzte ? C.tinte : "#3B4763";
      return (
        <React.Fragment key={i}>
          {zeile.zweige.map((z, j) => {
            const geloest = z.status === "geloest" && letzte;
            const keine = z.status === "keine";
            const oder = j > 0 ? <span style={{ fontSize: 11.5, color: C.hellgrau, fontWeight: 500, marginRight: 10 }}>oder</span> : null;
            if (keine) {
              return (
                <React.Fragment key={j}>
                  <div className={letzte ? "gl-zeile-neu" : ""} style={{ gridColumn: "1 / 4", fontSize: 14, color: C.signal, fontWeight: 500, lineHeight: 1.5, whiteSpace: "normal", maxWidth: 380 }}>
                    {oder}keine Lösung <span style={{ color: C.grau, fontWeight: 300 }}>— {z.grund}</span>
                  </div>
                  <span />
                </React.Fragment>
              );
            }
            return (
              <React.Fragment key={j}>
                <div className={letzte ? "gl-zeile-neu" : ""} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", whiteSpace: "nowrap", color: geloest ? C.see : farbe }}>{oder || <span />}<span><Ausdruck s={z.l} /></span></div>
                <div className={letzte ? "gl-zeile-neu" : ""} style={{ color: geloest ? C.see : C.hellgrau, fontWeight: 400 }}>=</div>
                <div className={letzte ? "gl-zeile-neu" : ""} style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", color: geloest ? C.see : farbe }}>
                  <Ausdruck s={z.r} />
                  {geloest && fertig && (
                    <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginLeft: 8, flexShrink: 0 }} aria-label="gelöst">
                      <circle cx="9" cy="9" r="9" fill={C.smaragd} />
                      <path d="M5 9.2 l2.6 2.6 l5.2 -5.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                {j === 0 ? <Randnotiz op={zeile.op} /> : <span />}
              </React.Fragment>
            );
          })}
          {zeile.op && zeile.op.art === "mitternacht" && zeile.detail && <MitternachtsKasten d={zeile.detail} />}
        </React.Fragment>
      );
    })}
  </div>
);

const Taste = ({ label, wert, ton, onClick, breit, aria, tippe }) => (
  <button type="button" className="gl-taste" aria-label={aria || (typeof label === "string" ? label : wert)}
    onClick={onClick || (() => tippe(wert))}
    style={{ gridColumn: breit ? "span 2" : "auto", height: 48, borderRadius: 14, fontFamily: "inherit", cursor: "pointer", padding: 0,
      fontSize: ton === "fn" || ton === "aktion" ? 15 : 19, fontWeight: ton === "aktion" ? 600 : 500,
      background: ton === "aktion" ? C.gruen : ton === "fn" ? C.himmel : ton === "op" ? "#F1F4FA" : C.weiss,
      color: ton === "aktion" ? C.weiss : ton === "fn" ? C.see : C.tinte,
      border: `1px solid ${ton === "aktion" ? C.gruen : C.linie}`,
      boxShadow: ton === "aktion" ? "0 4px 14px rgba(165,0,68,0.25)" : "0 1px 0 rgba(15,26,51,0.04)",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
    {label}
  </button>
);

const Pille = ({ aktiv, onClick, children }) => (
  <button type="button" onClick={onClick} className="px-4 py-2"
    style={{ background: aktiv ? C.see : C.weiss, color: aktiv ? C.weiss : C.grau, border: `1px solid ${aktiv ? C.see : C.linie}`,
      borderRadius: 999, fontSize: 13.5, fontWeight: aktiv ? 600 : 400, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}>
    {children}
  </button>
);


export function Gleichungsloeser() {
  const [art, setArt] = useState("linear");
  const [stufe, setStufe] = useState(1);
  const [stand, setStand] = useState(() => ersterStart("linear", 1));
  const [eingabe, setEingabe] = useState("");
  const [meldung, setMeldung] = useState(null);     // { art: "fehler" | "info", text }
  const [tippStufe, setTippStufe] = useState(0);
  const [tippsGenutzt, setTippsGenutzt] = useState(0);
  const [eigenText, setEigenText] = useState("");
  const [eigenFehler, setEigenFehler] = useState("");
  const [muster, setMuster] = useState(null);
  const startZeit = useRef(Date.now());
  const gemerkt = useRef(false);
  const feldRef = useRef(null);
  const heftRef = useRef(null);

  const { start, zeilen } = stand;
  const aktuell = zeilen[zeilen.length - 1].zweige;
  const L = G.loesung(aktuell, start);
  const schritte = zeilen.length - 1;
  const tipp = L ? null : G.tipp(aktuell);

  useEffect(() => {
    if (heftRef.current) heftRef.current.scrollLeft = 0;
  }, [zeilen.length]);

  useEffect(() => {
    if (L && !gemerkt.current) {
      gemerkt.current = true;
      try {
        merken({ bereich: "gleichungen", gruppe: art === "eigen" ? "eigene" : art, stufe, richtig: true,
          sekunden: Math.max(1, Math.round((Date.now() - startZeit.current) / 1000)), fehlerart: null });
      } catch (e) { /* Protokoll ist optional */ }
    }
  }, [L, art, stufe]);

  const zuruecksetzen = (neu) => {
    setStand(neu);
    setEingabe(""); setMeldung(null); setTippStufe(0); setTippsGenutzt(0); setMuster(null);
    startZeit.current = Date.now(); gemerkt.current = false;
  };
  const neueGleichung = (a = art, s = stufe) => {
    if (a === "eigen") return;
    zuruecksetzen(ersterStart(a, s));
  };
  const artWaehlen = (a) => { setArt(a); setEigenFehler(""); if (a !== "eigen") neueGleichung(a, stufe); };
  const stufeWaehlen = (s) => { setStufe(s); if (art !== "eigen") neueGleichung(art, s); };

  const eigeneUebernehmen = () => {
    try {
      const g = G.gleichungLesen(eigenText);
      const z = G.status({ l: g.l, r: g.r });
      if (z.status !== "offen") { setEigenFehler("Diese Gleichung ist schon gelöst — schreib eine, in der noch etwas zu tun ist."); return; }
      setEigenFehler("");
      zuruecksetzen({ start: { l: g.l, r: g.r }, zeilen: [{ zweige: [z], op: null }] });
    } catch (e) {
      setEigenFehler(e instanceof G.Fehler || e instanceof G.Undefiniert ? e.message : "Die Gleichung lässt sich nicht lesen.");
    }
  };

  const ausfuehren = (op) => {
    try {
      const vorher = G.komplexitaet(aktuell);
      const erg = G.anwenden(aktuell, op);
      const neuZeilen = zeilen.slice(0, -1).concat([{ ...zeilen[zeilen.length - 1], op, detail: erg.detail }, { zweige: erg.zweige, op: null }]);
      setStand({ start, zeilen: neuZeilen });
      setEingabe(""); setTippStufe(0);
      const nachher = G.komplexitaet(erg.zweige);
      const werkzeug = ["mitternacht", "ausmult", "ausklam", "nullprod", "wurzel"].includes(op.art);
      if (!werkzeug && erg.zweige.some((z) => z.status === "offen") && nachher >= vorher + 3) {
        setMeldung({ art: "info", text: "Das war eine gültige Umformung — aber jetzt steht mehr da als vorher. Mit „Rückgängig“ gehst du einen Schritt zurück." });
      } else setMeldung(null);
    } catch (e) {
      if (e instanceof G.Fehler || e instanceof G.Undefiniert) setMeldung({ art: "fehler", text: e.message });
      else { setMeldung({ art: "fehler", text: "Das konnte ich nicht rechnen. Prüfe die Eingabe." }); console.error(e); }
    }
  };

  const eingabeAusfuehren = () => {
    if (L) return;
    try { ausfuehren(G.opLesen(eingabe)); }
    catch (e) { setMeldung({ art: "fehler", text: e instanceof G.Fehler || e instanceof G.Undefiniert ? e.message : "Die Eingabe lässt sich nicht lesen." }); }
  };

  const rueckgaengig = () => {
    if (zeilen.length < 2) return;
    const neu = zeilen.slice(0, -1);
    neu[neu.length - 1] = { ...neu[neu.length - 1], op: null, detail: null };
    setStand({ start, zeilen: neu });
    setMeldung(null); setTippStufe(0);
    gemerkt.current = false;
  };

  /* Tastenfeld: Funktionstasten fügen am Anfang die Umformung ein („ln“),
     mitten in einer Eingabe die Funktion mit Klammer („:ln(“). */
  const tippe = (s) => {
    setMeldung(null);
    setEingabe((alt) => {
      const leer = alt.trim() === "";
      if (s === "ln" || s === "lg") return leer ? s : `${alt}${s}(`;
      if (s === "log_") return leer ? "log_" : `${alt}log_`;
      if (s === "e^") return leer ? "e^" : `${alt}e^(`;
      if (s === "10^") return leer ? "10^" : `${alt}10^(`;
      return alt + s;
    });
    if (feldRef.current && window.matchMedia && window.matchMedia("(hover:hover)").matches) feldRef.current.focus();
  };
  const loeschen = () => setEingabe((alt) => {
    for (const t of ["log_", "ln(", "lg(", "e^(", "10^("]) if (alt.endsWith(t)) return alt.slice(0, -t.length);
    return alt.slice(0, -1);
  });

  const tippKnopf = () => {
    if (!tipp) return;
    if (tippStufe === 0) setTippsGenutzt((n) => n + 1);
    setTippStufe((s) => Math.min(2, s + 1));
  };

  const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <style>{GL_CSS}</style>

      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Du sagst, was passiert. Die App rechnet.
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 20 }}>
        Tippe unten eine Äquivalenzumformung ein — zum Beispiel <b style={{ fontWeight: 600, color: C.tinte }}>−5</b>,{" "}
        <b style={{ fontWeight: 600, color: C.tinte }}>+6x</b>, <b style={{ fontWeight: 600, color: C.tinte }}>:3</b> oder{" "}
        <b style={{ fontWeight: 600, color: C.tinte }}>ln</b>. Sie wird auf beiden Seiten ausgeführt, die neue Zeile erscheint
        darunter. Welche Umformung die richtige ist, entscheidest du.
      </p>

      {/* Auswahl: Art und Stufe */}
      <div className="gl-scroll" style={{ margin: "0 -24px", padding: "0 24px 4px" }}>
        <div className="flex" style={{ gap: 8, width: "max-content" }}>
          {G.ARTEN.map((a) => <Pille key={a.id} aktiv={art === a.id} onClick={() => artWaehlen(a.id)}>{a.name}</Pille>)}
          <Pille aktiv={art === "eigen"} onClick={() => artWaehlen("eigen")}>Eigene Gleichung</Pille>
        </div>
      </div>

      {art !== "eigen" ? (
        <div className="flex items-center flex-wrap" style={{ gap: 10, marginTop: 14, marginBottom: 18 }}>
          <div className="flex" role="group" aria-label="Schwierigkeit" style={{ background: "#EEF2F8", borderRadius: 999, padding: 3 }}>
            {G.STUFEN.map((s) => (
              <button key={s.id} type="button" onClick={() => stufeWaehlen(s.id)}
                style={{ border: "none", borderRadius: 999, padding: "7px 14px", fontFamily: "inherit", cursor: "pointer", fontSize: 13,
                  fontWeight: stufe === s.id ? 600 : 400, background: stufe === s.id ? C.weiss : "transparent",
                  color: stufe === s.id ? C.see : C.grau, boxShadow: stufe === s.id ? "0 1px 6px rgba(15,26,51,0.12)" : "none" }}>
                {s.name}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 13, color: C.hellgrau, fontWeight: 300 }}>{G.ARTEN.find((a) => a.id === art)?.kurz}</span>
        </div>
      ) : (
        <div style={{ ...karte, padding: 18, marginTop: 14, marginBottom: 18 }}>
          <label htmlFor="gl-eigen" style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 8 }}>
            Deine Gleichung aus Heft oder Buch
          </label>
          <div className="flex" style={{ gap: 8 }}>
            <input id="gl-eigen" value={eigenText} onChange={(e) => setEigenText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") eigeneUebernehmen(); }}
              placeholder="z. B. 2x² − 8 = 0" autoComplete="off" spellCheck={false}
              style={{ flex: 1, minWidth: 0, border: `1px solid ${C.linie}`, borderRadius: 12, padding: "11px 14px", fontSize: 16,
                fontFamily: "inherit", color: C.tinte, outline: "none" }} />
            <button type="button" onClick={eigeneUebernehmen}
              style={{ background: C.see, color: C.weiss, border: "none", borderRadius: 12, padding: "0 18px", fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
              Los
            </button>
          </div>
          <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: 8 }}>
            Schreibweise: x^2 oder x², 2^x, e^(2x), ln(x), lg(x), log_3(x), Brüche mit / und Kommazahlen mit Komma.
          </p>
          {eigenFehler && <p style={{ fontSize: 13, color: C.signal, marginTop: 6, lineHeight: 1.5 }}>{eigenFehler}</p>}
        </div>
      )}

      {/* Das Heft */}
      <div style={{ ...karte, padding: "18px 0 20px", position: "relative", overflow: "hidden" }}>
        <div className="flex justify-between items-center" style={{ padding: "0 20px", marginBottom: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: C.hellgrau }}>
            {schritte === 0 ? "AUSGANGSGLEICHUNG" : `${schritte} ${schritte === 1 ? "SCHRITT" : "SCHRITTE"}`}
          </span>
          {art !== "eigen" && (
            <button type="button" onClick={() => neueGleichung()}
              style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Neue Gleichung
            </button>
          )}
        </div>
        <div ref={heftRef} className="gl-scroll" style={{ padding: "4px 20px 6px" }}>
          <Heft zeilen={zeilen} fertig={!!L} />
        </div>

        {L && (
          <div className="gl-zeile-neu" style={{ margin: "18px 20px 0", padding: "16px 18px", borderRadius: 14,
            background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: C.flaggold, marginBottom: 6 }}>LÖSUNGSMENGE</p>
            <p style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.5 }}>
              𝕃 = {L.alle ? "ℝ" : L.werte.length === 0 ? "{ }" : (
                <>{"{ "}{L.werte.map((w, i) => <React.Fragment key={i}>{i > 0 && " ; "}<Ausdruck s={w.s} /></React.Fragment>)}{" }"}</>
              )}
            </p>
            {L.alle && <p style={{ fontSize: 13.5, color: "#C9D6EE", fontWeight: 300, marginTop: 4 }}>Wahre Aussage: Jede Zahl erfüllt die Gleichung.</p>}
            {!L.alle && L.werte.length === 0 && <p style={{ fontSize: 13.5, color: "#C9D6EE", fontWeight: 300, marginTop: 4 }}>Die Gleichung hat keine Lösung.</p>}
            {L.werte.some((w) => !w.exakt) && (
              <p style={{ fontSize: 14, color: "#C9D6EE", fontWeight: 300, marginTop: 4 }}>
                {L.werte.map((w, i) => <span key={i} style={{ marginRight: 14, whiteSpace: "nowrap" }}><i className="gl-x">x</i>{L.werte.length > 1 && <sub className="gl-tief">{i + 1}</sub>} ≈ {komma(w.v)}</span>)}
              </p>
            )}
            {L.werte.length > 0 && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.15)", fontSize: 13, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.7 }}>
                <b style={{ color: C.weiss, fontWeight: 600 }}>Probe</b> in der Ausgangsgleichung:{" "}
                {L.werte.map((w, i) => (
                  <span key={i} style={{ display: "block" }}>
                    {!w.definiert ? `x = ${komma(w.v)} entfällt — dort ist die Gleichung nicht definiert.`
                      : <>x = {komma(w.v)}: links {komma(w.probeL, 4)}, rechts {komma(w.probeR, 4)} {w.probe ? "✓" : "✗"}</>}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center" style={{ gap: 10, marginTop: 14 }}>
              {art !== "eigen" && (
                <button type="button" onClick={() => neueGleichung()}
                  style={{ background: C.gruen, color: C.weiss, border: "none", borderRadius: 999, padding: "10px 20px", fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                  Nächste Gleichung
                </button>
              )}
              <button type="button" onClick={() => setMuster(muster ? null : G.musterweg(start))}
                style={{ background: "transparent", color: C.weiss, border: "1px solid rgba(255,255,255,0.35)", borderRadius: 999, padding: "9px 16px", fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
                {muster ? "Musterweg ausblenden" : "Musterweg ansehen"}
              </button>
              <span style={{ fontSize: 12.5, color: "#C9D6EE", fontWeight: 300 }}>
                {schritte} {schritte === 1 ? "Schritt" : "Schritte"}{tippsGenutzt ? ` · ${tippsGenutzt} Tipp${tippsGenutzt > 1 ? "s" : ""}` : ""}
              </span>
            </div>
          </div>
        )}
      </div>

      {muster && (
        <div className="gl-zeile-neu" style={{ ...karte, padding: "16px 0 18px", marginTop: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: C.hellgrau, padding: "0 20px", marginBottom: 12 }}>
            MUSTERWEG · {muster.schritte.length} {muster.schritte.length === 1 ? "SCHRITT" : "SCHRITTE"}
          </p>
          <div className="gl-scroll" style={{ padding: "0 20px" }}>
            <Heft zeilen={[...muster.schritte.map((s) => ({ zweige: s.zweigeVorher, op: s.op, detail: s.detail })), { zweige: muster.ende, op: null }]} fertig />
          </div>
        </div>
      )}

      {/* Eingabe */}
      {!L && (
        <div style={{ marginTop: 16 }}>
          <div style={{ ...karte, padding: 14 }}>
            <div className="flex items-center" style={{ gap: 10, background: C.sand, border: `1.5px solid ${meldung?.art === "fehler" ? C.signal : C.linie}`, borderRadius: 14, padding: "4px 6px 4px 14px" }}>
              <span aria-hidden="true" style={{ fontSize: 22, color: C.hellgrau, fontWeight: 300 }}>|</span>
              <input ref={feldRef} value={eingabe} inputMode="none" autoComplete="off" spellCheck={false} aria-label="Umformung"
                onChange={(e) => { setEingabe(e.target.value); setMeldung(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") eingabeAusfuehren(); }}
                placeholder="z. B. −5"
                style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", outline: "none", fontSize: 21, fontWeight: 600,
                  color: C.gruen, fontFamily: "inherit", padding: "8px 0" }} />
              <button type="button" onClick={loeschen} aria-label="Zeichen löschen" className="gl-taste"
                style={{ width: 44, height: 40, border: "none", background: "transparent", color: C.grau, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="18" viewBox="0 0 24 18" aria-hidden="true"><path d="M8 1h13a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8L1 9z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" /><path d="M11 6l6 6M17 6l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </button>
            </div>

            {meldung && (
              <p role="status" style={{ fontSize: 13.5, lineHeight: 1.55, marginTop: 10, padding: "0 4px",
                color: meldung.art === "fehler" ? C.signal : C.grau, fontWeight: meldung.art === "fehler" ? 500 : 300 }}>
                {meldung.text}
              </p>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 7, marginTop: 12 }}>
              <Taste tippe={tippe} ton="fn" wert="ln" label="ln" />
              <Taste tippe={tippe} ton="fn" wert="lg" label="lg" />
              <Taste tippe={tippe} ton="fn" wert="log_" label={<>log<sub className="gl-tief">a</sub></>} aria="Logarithmus zur Basis a" />
              <Taste tippe={tippe} ton="fn" wert="e^" label={<>e<sup className="gl-hoch">x</sup></>} aria="e hoch" />
              <Taste tippe={tippe} ton="fn" wert="10^" label={<>10<sup className="gl-hoch">x</sup></>} aria="10 hoch" />
              <Taste tippe={tippe} ton="fn" wert="√" label="√" aria="Wurzel" />

              <Taste tippe={tippe} wert="7" label="7" /><Taste tippe={tippe} wert="8" label="8" /><Taste tippe={tippe} wert="9" label="9" />
              <Taste tippe={tippe} ton="op" wert="+" label="+" aria="plus" />
              <Taste tippe={tippe} ton="op" wert="(" label="(" /><Taste tippe={tippe} ton="op" wert=")" label=")" />

              <Taste tippe={tippe} wert="4" label="4" /><Taste tippe={tippe} wert="5" label="5" /><Taste tippe={tippe} wert="6" label="6" />
              <Taste tippe={tippe} ton="op" wert="−" label="−" aria="minus" />
              <Taste tippe={tippe} ton="op" wert="x" label={<i className="gl-x">x</i>} aria="x" />
              <Taste tippe={tippe} ton="op" wert="²" label={<><i className="gl-x">x</i><sup className="gl-hoch">2</sup></>} aria="hoch zwei" />

              <Taste tippe={tippe} wert="1" label="1" /><Taste tippe={tippe} wert="2" label="2" /><Taste tippe={tippe} wert="3" label="3" />
              <Taste tippe={tippe} ton="op" wert="·" label="·" aria="mal" />
              <Taste tippe={tippe} ton="op" wert="e" label="e" />
              <Taste tippe={tippe} ton="op" wert="^" label="^" aria="hoch" />

              <Taste tippe={tippe} wert="0" label="0" /><Taste tippe={tippe} wert="," label="," aria="Komma" />
              <Taste tippe={tippe} ton="op" wert="/" label="/" aria="Bruchstrich" />
              <Taste tippe={tippe} ton="op" wert=":" label=":" aria="geteilt durch" />
              <Taste tippe={tippe} ton="aktion" breit label="Ausführen" onClick={eingabeAusfuehren} />
            </div>
          </div>

          {/* Werkzeuge */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginTop: 12 }}>
            {WERKZEUGE.map((w) => (
              <button key={w.id} type="button" className="gl-taste" onClick={() => ausfuehren({ art: w.id })}
                style={{ gridColumn: w.haupt ? "1 / -1" : "auto", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                  padding: w.haupt ? "14px 18px" : "11px 14px", borderRadius: 14,
                  background: w.haupt ? `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` : C.weiss,
                  border: w.haupt ? "none" : `1px solid ${C.linie}`,
                  boxShadow: w.haupt ? "0 6px 20px rgba(0,77,152,0.25)" : "0 1px 0 rgba(15,26,51,0.04)" }}>
                <span style={{ display: "block", fontSize: w.haupt ? 16.5 : 14, fontWeight: 600, color: w.haupt ? C.weiss : C.tinte }}>
                  {w.name}
                </span>
                {w.formel && <span style={{ display: "block", color: C.flaggold, fontWeight: 500, fontSize: 13.5, marginTop: 3 }}>{w.formel}</span>}
                <span style={{ display: "block", fontSize: 12, fontWeight: 300, color: w.haupt ? "#C9D6EE" : C.grau, marginTop: 2 }}>{w.kurz}</span>
              </button>
            ))}
          </div>

          {/* Tipp und Rückgängig */}
          <div className="flex items-center flex-wrap" style={{ gap: 10, marginTop: 14 }}>
            <button type="button" onClick={tippKnopf} disabled={!tipp || tippStufe >= 2}
              style={{ display: "flex", alignItems: "center", gap: 8, background: C.weiss, border: `1px solid ${C.goldWarm}`, color: C.tinte,
                borderRadius: 999, padding: "9px 16px", fontSize: 13.5, fontWeight: 500, fontFamily: "inherit",
                cursor: tipp && tippStufe < 2 ? "pointer" : "default", opacity: tipp && tippStufe < 2 ? 1 : 0.55 }}>
              <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5a4.5 4.5 0 0 0-2.6 8.2V12h5.2V9.7A4.5 4.5 0 0 0 8 1.5zM6 14h4" stroke={C.goldWarm} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {tippStufe === 0 ? "Tipp" : "Zeig mir den Schritt"}
            </button>
            <button type="button" onClick={rueckgaengig} disabled={schritte === 0}
              style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: `1px solid ${C.linie}`, color: schritte === 0 ? C.hellgrau : C.grau,
                borderRadius: 999, padding: "9px 16px", fontSize: 13.5, fontFamily: "inherit", cursor: schritte === 0 ? "default" : "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3L1.5 6.5 5 10M2 6.5h8a4.5 4.5 0 0 1 0 9H7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Rückgängig
            </button>
          </div>

          {tipp && tippStufe > 0 && (
            <div className="gl-zeile-neu" style={{ marginTop: 12, padding: "14px 16px", borderRadius: 14, background: "#FDF8EA", border: `1px solid ${C.goldWarm}55` }}>
              <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.65, fontWeight: 400 }}>{tipp.text}</p>
              {tippStufe > 1 && tipp.op && (
                <div className="flex items-center flex-wrap" style={{ gap: 10, marginTop: 10 }}>
                  <span style={{ fontSize: 13, color: C.grau, fontWeight: 300 }}>Nächster Schritt:</span>
                  {tipp.op.startsWith("#") ? (
                    <button type="button" onClick={() => ausfuehren(G.tippAlsOp(tipp.op))}
                      style={{ background: C.see, color: C.weiss, border: "none", borderRadius: 999, padding: "7px 14px", fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                      {WERKZEUG_NAME[tipp.op]}
                    </button>
                  ) : (
                    <button type="button" onClick={() => { setEingabe(tipp.op); setMeldung(null); }}
                      style={{ background: C.weiss, color: C.gruen, border: `1px solid ${C.linie}`, borderRadius: 999, padding: "6px 14px", fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}
                      title="In das Eingabefeld übernehmen">
                      | {tipp.op}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <details style={{ marginTop: 22 }}>
            <summary style={{ fontSize: 13.5, color: C.see, cursor: "pointer", fontWeight: 500 }}>Was kann ich eintippen?</summary>
            <div style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.8, marginTop: 10 }}>
              <p><b style={{ color: C.tinte, fontWeight: 600 }}>+ oder −</b> eine Zahl oder einen Term: −5, +6x, −x², +ln(3)</p>
              <p><b style={{ color: C.tinte, fontWeight: 600 }}>· oder :</b> eine Zahl: :3, ·2, ·(−1), :ln(2). Mit x malnehmen oder durch x teilen ist keine sichere Äquivalenzumformung und wird abgelehnt.</p>
              <p><b style={{ color: C.tinte, fontWeight: 600 }}>ln, lg, log_2</b> allein: beide Seiten logarithmieren.</p>
              <p><b style={{ color: C.tinte, fontWeight: 600 }}>e^ oder 10^</b> allein: beide Seiten als Exponent nehmen — die Umkehrung des Logarithmus.</p>
              <p><b style={{ color: C.tinte, fontWeight: 600 }}>Werkzeuge</b>: Wurzel ziehen liefert beide Lösungen (±), die Mitternachtsformel braucht auf einer Seite eine 0.</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

/* Grafik für die Startseiten-Kachel: Heftzeilen mit Gleichheitszeichen untereinander und Randnotiz. */
export function GleichungenLogoKlein() {
  const W = 230, H = 190;
  const T = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700 };
  const zeilen = [
    { y: 54, l: "3x + 5", r: "20", op: "−5" },
    { y: 94, l: "3x", r: "15", op: ":3" },
    { y: 134, l: "x", r: "5", op: null },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
      {zeilen.map((z, i) => (
        <g key={i} {...T} fontSize="21">
          <text x="100" y={z.y} textAnchor="end" fill={i === 2 ? C.flaggold : C.weiss}>{z.l}</text>
          <text x="112" y={z.y} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontWeight="500">=</text>
          <text x="124" y={z.y} fill={i === 2 ? C.flaggold : C.weiss}>{z.r}</text>
          {z.op && <>
            <line x1="165" y1={z.y - 17} x2="165" y2={z.y + 4} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            <text x="174" y={z.y} fill={C.flaggold} fontSize="18">{z.op}</text>
          </>}
        </g>
      ))}
      <line x1="84" y1="143" x2="144" y2="143" stroke={C.flaggold} strokeWidth="2" />
      <line x1="84" y1="148" x2="144" y2="148" stroke={C.flaggold} strokeWidth="2" />
      {["+", "−", "·", ":"].map((k, i) => (
        <g key={k} transform={`translate(${34 + i * 42} 160)`}>
          <rect width="34" height="24" rx="7" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" />
          <text x="17" y="17.5" textAnchor="middle" fill={C.weiss} fontSize="15" {...T} fontWeight="600">{k}</text>
        </g>
      ))}
    </svg>
  );
}
