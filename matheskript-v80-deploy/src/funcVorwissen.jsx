import React, { useState } from "react";
import { C } from "./base1.jsx";
import { AufklappZeichen } from "./aufklappen.jsx";

/* ======================================================================
   DEFINITIONEN UND VORWISSEN
   Aufklappbare Karte oben in den Rechenwerkzeugen. Die Hülle
   (<Vorwissen>) ist für alle Tools gleich; der Inhalt kommt je Thema
   (z. B. <BernoulliVorwissen />).
   ====================================================================== */

const VW_CSS = `
.vw-kopf{transition:background .15s ease}
@media (hover:hover){.vw-kopf:hover{background:#F4F7FC}}
.vw-koerper{display:grid;grid-template-rows:0fr;transition:grid-template-rows .32s cubic-bezier(.2,.7,.3,1)}
.vw-koerper.auf{grid-template-rows:1fr}
.vw-koerper>div{overflow:hidden}
.vw-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
`;

export function Vorwissen({ children, untertitel, startOffen = false }) {
  const [auf, setAuf] = useState(startOffen);
  return (
    <div style={{ background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 26, overflow: "hidden",
      border: `1px solid ${auf ? "rgba(0,77,152,0.18)" : "transparent"}` }}>
      <style>{VW_CSS}</style>
      <button type="button" className="vw-kopf" onClick={() => setAuf(!auf)} aria-expanded={auf}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", background: C.weiss, border: "none",
          cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: C.tinte }}>
        <span aria-hidden="true" style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
          background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, boxShadow: "0 3px 10px rgba(0,77,152,0.25), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
          <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
            <path d="M10 3.2C8.2 1.8 5.6 1.3 2 1.5v12.8c3.6-.2 6.2.3 8 1.7 1.8-1.4 4.4-1.9 8-1.7V1.5c-3.6-.2-6.2.3-8 1.7z" stroke={C.flaggold} strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M10 3.2V16" stroke={C.flaggold} strokeWidth="1.6" />
          </svg>
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, letterSpacing: "-0.01em" }}>Definitionen und Vorwissen</span>
          <span style={{ display: "block", fontSize: 12.5, fontWeight: 300, color: C.grau, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {untertitel || "Was du für dieses Thema wissen musst"}
          </span>
        </span>
        <AufklappZeichen art="badge" auf={auf} />
      </button>
      <div className={`vw-koerper${auf ? " auf" : ""}`} aria-hidden={!auf} data-aufklapp-inhalt>
        <div>
          <div style={{ padding: "4px clamp(16px, 4.5vw, 22px) 22px", borderTop: `1px solid ${C.linie}` }}>{auf && children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Bausteine für die Inhalte ---------- */
export const VwTitel = ({ children, erster }) => (
  <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: C.hellgrau, margin: erster ? "16px 0 8px" : "24px 0 8px" }}>{children}</p>
);
export const VwText = ({ children, style }) => (
  <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.75, color: C.grau, marginBottom: 10, ...style }}>{children}</p>
);
const B = ({ children, farbe }) => <b style={{ fontWeight: 600, color: farbe || C.tinte }}>{children}</b>;

const KL = { fontWeight: 300, lineHeight: 1, transform: "scaleY(1.85)", display: "inline-block", margin: "0 1px" };

export function Binom({ o, u, farbeO, farbeU }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
      <span style={KL}>(</span>
      <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.12, fontSize: "0.9em" }}>
        <span style={{ color: farbeO }}>{o}</span><span style={{ color: farbeU }}>{u}</span>
      </span>
      <span style={KL}>)</span>
    </span>
  );
}

export function Bruch({ z, n, farbe }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", lineHeight: 1.08, fontSize: "0.86em", color: farbe, margin: "0 2px" }}>
      <span style={{ padding: "0 2px" }}>{z}</span>
      <span style={{ borderTop: "0.09em solid currentColor", padding: "0 2px", alignSelf: "stretch", textAlign: "center" }}>{n}</span>
    </span>
  );
}

/* Potenz: Basis in Klammern, Exponent oben an der Klammer */
function Pot({ basis, exp, farbeExp, klammer = true }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-start", verticalAlign: "middle" }}>
      <span style={{ display: "inline-flex", alignItems: "center" }}>
        {klammer && <span style={{ ...KL, color: C.tinte }}>(</span>}{basis}{klammer && <span style={{ ...KL, color: C.tinte }}>)</span>}
      </span>
      <sup style={{ fontSize: "0.62em", fontWeight: 700, color: farbeExp, marginLeft: 1, marginTop: -2, lineHeight: 1 }}>{exp}</sup>
    </span>
  );
}

const Zeile = ({ children, gross, einzug }) => (
  <div className="vw-scroll">
    <div style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", fontSize: gross ? "clamp(17px, 5vw, 22px)" : "clamp(14px, 4.1vw, 18px)",
      fontWeight: gross ? 700 : 500, color: C.tinte, minHeight: gross ? 50 : 48, width: "max-content", paddingLeft: einzug ? "1.2em" : 0, fontVariantNumeric: "lining-nums tabular-nums" }}>
      {children}
    </div>
  </div>
);
const Gl = () => <span style={{ color: C.grau, fontWeight: 400, margin: "0 3px" }}>=</span>;
const PX = ({ k }) => <span>P(X = <span style={{ color: FB.k }}>{k}</span>)</span>;
const Mal = () => <span style={{ color: C.grau, fontWeight: 400 }}>·</span>;

/* ======================================================================
   Bernoulli-Kette
   ====================================================================== */
const FB = { n: "#004D98", p: "#A50044", k: "#C99A00" };

/* Alle Reihenfolgen mit genau k Treffern unter n Würfen */
function reihenfolgen(n, k) {
  const erg = [];
  const lauf = (start, rest, akt) => {
    if (rest === 0) { erg.push(akt); return; }
    for (let i = start; i <= n - rest; i++) lauf(i + 1, rest - 1, [...akt, i]);
  };
  lauf(0, k, []);
  return erg.map((pos) => Array.from({ length: n }, (_, i) => pos.includes(i)));
}

function Wuerfelreihe({ muster, nr }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 20, fontSize: 11, fontWeight: 600, color: C.hellgrau, textAlign: "right" }}>{nr}</span>
      {muster.map((sechs, i) => (
        <span key={i} style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12.5, fontWeight: 700, background: sechs ? FB.k : "#EEF2F8", color: sechs ? C.weiss : C.hellgrau,
          boxShadow: sechs ? "0 2px 5px rgba(201,154,0,0.35), inset 0 1px 0 rgba(255,255,255,0.35)" : "inset 0 0 0 1px #DCE3EF" }}>
          {sechs ? "6" : "–"}
        </span>
      ))}
    </div>
  );
}

export function BernoulliVorwissen() {
  const muster = reihenfolgen(5, 2);
  const n = <span style={{ color: FB.n }}>n</span>, k = <span style={{ color: FB.k }}>k</span>, p = <span style={{ color: FB.p }}>p</span>;
  const kasten = { background: C.sand, borderRadius: 14, padding: "8px 12px" };
  return (
    <div>
      <VwTitel erster>DEFINITION</VwTitel>
      <VwText>
        Ein <B>Bernoulli-Experiment</B> hat genau zwei Ausgänge: <B>Treffer</B> oder <B>Niete</B>. Die Wahrscheinlichkeit für einen Treffer
        heißt <B farbe={FB.p}>p</B>, für eine Niete also 1 − <B farbe={FB.p}>p</B>.
      </VwText>
      <VwText>
        Wiederholt man es <B farbe={FB.n}>n</B>-mal unabhängig – und <B farbe={FB.p}>p</B> bleibt dabei gleich –, spricht man von einer
        <B> Bernoulli-Kette der Länge <span style={{ color: FB.n }}>n</span></B>. Die Zufallsgröße <B>X</B> zählt die Treffer.
      </VwText>

      <VwTitel>BERNOULLI-FORMEL</VwTitel>
      <div style={{ ...kasten, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss, padding: "4px 14px", boxShadow: "0 6px 18px -6px rgba(14,30,74,0.5)" }}>
        <div className="vw-scroll">
          <div style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", fontSize: "clamp(15px, 4.4vw, 22px)", fontWeight: 700, minHeight: 62, width: "max-content", color: C.weiss }}>
            <span>P(X = <span style={{ color: C.flaggold }}>k</span>)</span>
            <span style={{ fontWeight: 400, margin: "0 2px", color: C.goldText }}>=</span>
            <Binom o="n" u="k" farbeO="#9CC3F0" farbeU={C.flaggold} />
            <span style={{ color: C.goldText, fontWeight: 400 }}>·</span>
            <span>p<sup style={{ fontSize: "0.62em", color: C.flaggold }}>k</sup></span>
            <span style={{ color: C.goldText, fontWeight: 400 }}>·</span>
            <span>(1 − p)<sup style={{ fontSize: "0.62em" }}><span style={{ color: "#9CC3F0" }}>n</span> − <span style={{ color: C.flaggold }}>k</span></sup></span>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 6, margin: "12px 2px 0" }}>
        {[[FB.n, "n", "Anzahl der Versuche (Länge der Kette)"], [FB.k, "k", "gewünschte Anzahl an Treffern"], [FB.p, "p", "Trefferwahrscheinlichkeit bei einem Versuch"]].map(([f, b, t]) => (
          <div key={b} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.grau, fontWeight: 300 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: `${f}14`, color: f, fontWeight: 700, fontStyle: "italic", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{b}</span>
            {t}
          </div>
        ))}
      </div>

      <VwTitel>BEISPIEL: FÜNFMAL WÜRFELN</VwTitel>
      <VwText>
        Du würfelst <B farbe={FB.n}>5</B>-mal. Treffer ist eine Sechs, also <B farbe={FB.p}>p = 1/6</B>. Wie wahrscheinlich sind
        genau <B farbe={FB.k}>2</B> Sechsen?
      </VwText>
      <div style={kasten}>
        <Zeile>
          <PX k="2" /><Gl />
          <Binom o="5" u="2" farbeO={FB.n} farbeU={FB.k} /><Mal />
          <Pot basis={<Bruch z="1" n="6" farbe={FB.p} />} exp="2" farbeExp={FB.k} /><Mal />
          <Pot basis={<Bruch z="5" n="6" farbe={FB.p} />} exp={<span style={{ whiteSpace: "nowrap" }}><span style={{ color: FB.n }}>5</span>−<span style={{ color: FB.k }}>2</span></span>} />
        </Zeile>
        <Zeile einzug><Gl />10<Mal /><Bruch z="1" n="36" /><Mal /><Bruch z="125" n="216" /></Zeile>
        <Zeile einzug><Gl /><Bruch z="1250" n="7776" /><span style={{ color: C.grau, fontWeight: 400, margin: "0 3px" }}>≈</span>0,1608</Zeile>
        <Zeile gross einzug><span style={{ color: C.see }}>≈ 16,1 %</span></Zeile>
      </div>
      <VwText style={{ marginTop: 12 }}>
        Das ist die Wahrscheinlichkeit, bei 5-mal Würfeln – <B>in welcher Reihenfolge auch immer</B> – genau 2 Sechsen zu würfeln.
      </VwText>

      <VwTitel>WARUM DIE FORMEL SO AUSSIEHT</VwTitel>
      <VwText>
        <B>1. Eine feste Reihenfolge.</B> Nimm zuerst nur „Sechs, Sechs, keine, keine, keine“. Die beiden Sechsen haben je die
        Wahrscheinlichkeit 1/6, die drei anderen Würfe je 5/6. Mit der Pfadregel wird multipliziert:
      </VwText>
      <div style={kasten}>
        <Zeile>
          <Bruch z="1" n="6" farbe={FB.p} /><Mal /><Bruch z="1" n="6" farbe={FB.p} /><Mal /><Bruch z="5" n="6" /><Mal /><Bruch z="5" n="6" /><Mal /><Bruch z="5" n="6" />
        </Zeile>
        <Zeile einzug>
          <Gl /><Pot basis={<Bruch z="1" n="6" farbe={FB.p} />} exp="2" farbeExp={FB.k} /><Mal />
          <Pot basis={<Bruch z="5" n="6" />} exp="3" farbeExp={FB.n} />
          <Gl /><Bruch z="125" n="7776" />
        </Zeile>
      </div>
      <VwText style={{ marginTop: 10 }}>
        Genau das sind die beiden Potenzen der Formel: {p}<sup style={{ color: FB.k, fontSize: "0.7em" }}>k</sup> steht für die {k} Treffer,
        <span style={{ whiteSpace: "nowrap" }}>(1 − {p})<sup style={{ fontSize: "0.7em" }}><span style={{ color: FB.n }}>n</span> − <span style={{ color: FB.k }}>k</span></sup></span> für
        die übrigen {n} − {k} = 3 Nieten.
      </VwText>

      <VwText style={{ marginTop: 16 }}>
        <B>2. Alle Reihenfolgen zählen.</B> Die zwei Sechsen können an verschiedenen Stellen liegen. Jede Reihenfolge hat dieselbe
        Wahrscheinlichkeit 125/7776 – es gibt genau so viele, wie man 2 Plätze aus 5 auswählen kann:
      </VwText>
      <div style={{ ...kasten, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "8px 18px", justifyItems: "start" }}>
        {muster.map((m, i) => <Wuerfelreihe key={i} muster={m} nr={i + 1} />)}
      </div>
      <VwText style={{ marginTop: 12 }}>
        Das sind <Binom o="5" u="2" farbeO={FB.n} farbeU={FB.k} /> = 10 Reihenfolgen – der Binomialkoeffizient
        „{n} über {k}“ zählt sie. Deshalb:
      </VwText>
      <div style={kasten}>
        <Zeile>
          <PX k="2" /><Gl />10<Mal /><Bruch z="125" n="7776" /><Gl /><Bruch z="1250" n="7776" />
        </Zeile>
        <Zeile gross einzug><span style={{ color: C.see }}>≈ 16,1 %</span>
        </Zeile>
      </div>

      <VwTitel>AUF EINEN BLICK</VwTitel>
      <div style={{ display: "grid", gap: 8 }}>
        {[
          [<Binom o="n" u="k" farbeO={FB.n} farbeU={FB.k} />, "Wie viele Reihenfolgen gibt es für die Treffer?"],
          [<span>{p}<sup style={{ color: FB.k, fontSize: "0.7em" }}>k</sup></span>, "Alle k Treffer treten ein."],
          [<span>(1 − {p})<sup style={{ fontSize: "0.7em" }}><span style={{ color: FB.n }}>n</span>−<span style={{ color: FB.k }}>k</span></sup></span>, "Alle übrigen Versuche sind Nieten."],
        ].map(([f, t], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 14px", borderRadius: 12, border: `1px solid ${C.linie}` }}>
            <span style={{ flex: "0 0 74px", fontSize: 18, fontWeight: 700, color: C.tinte, display: "flex", justifyContent: "center" }}>{f}</span>
            <span style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.5 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
