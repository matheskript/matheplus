/* ============================================================
   Zahlenräume: ℕ → ℤ → ℚ → ℝ  (Bereich „Fundament“, Station 2)
   Aufbaukurs nach „Axiome und Rechenregeln“.
   · Entdecken – eine Reise in fünf Stationen. Jede Station: Erkläranimation,
     Abgeschlossenheits-Tester („Bleibt das Ergebnis drin?“), Merke.
     ℝ: Widerspruchsbeweis „√2 ist irrational“ Zeile für Zeile,
     Näherungsbrüche für √2. Überblick: Mengenbild zum Antippen.
   · Üben – Einordnen, Element?, Abgeschlossen?, Welche Rechnung führt
     hinaus?, Gleichung und Zahlenraum, Wahr/Falsch, Dezimalzahl als
     Bruch, Wurzel rational?, Widerspruchsbeweis.
   Mathematik in zahlraum.js (getestet: tests/zahlraum.test.mjs).
   ============================================================ */
import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { GrosserKnopf, MS, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { Aufklapp } from "./ui3.jsx";
import { Merke, Pille, UebenRahmen, ZweiModi, misch, ws, zs } from "./geoUi.jsx";
import { RAUM_FARBE, ZahlraumAnimation } from "./funcZahlenraumAnimation.jsx";
import { q, qNum, qTex } from "./rechnen2.js";
import { springe } from "./sprung.js";
import { Arbeitsflaeche, BildKarte, ErgebnisReihe, FeinKarte, Werkzeugleiste, hinweisStil, titelStil, useDesktop } from "./arbeitsflaeche.jsx";
import { AktionsKnopf, useKarte } from "./funcZahlenDesktop.jsx";
import {
  ABGESCHLOSSEN, NAMEN, OPS, RAEUME, ZEICHEN, ZR_ARTEN, ergebnisRaum, kleinsterRaum, naeherungenWurzel2, rechne, stufe, wurzelVon, zrAufgabe, zufallAus,
} from "./zahlraum.js";

const ROT = C.signal;   /* Fehlerfarbe: verlässt den Zahlenraum */
const name = (r) => zw(NAMEN[r][0], NAMEN[r][1]);
const zt = (s) => <MS s={s} />;
/* Zahl in Formel: negative Zahlen in Klammern, wenn sie rechts von einem Rechenzeichen stehen */
const tq = (x, klammer = false) => { const t = qTex(x); return klammer && x.z < 0 ? `(${t})` : t; };
const ab = (x, an = true) => <span style={{ fontWeight: 800, color: RAUM_FARBE[x] }}>{an ? "∈" : "∉"} {ZEICHEN[x]}</span>;

/* ---------- Kopf je Station ---------- */
const STATIONEN = [
  { id: "N", titel: () => zw("Die natürlichen Zahlen", "The natural numbers") },
  { id: "Z", titel: () => zw("Die ganzen Zahlen", "The integers") },
  { id: "Q", titel: () => zw("Die rationalen Zahlen", "The rational numbers") },
  { id: "R", titel: () => zw("Die reellen Zahlen", "The real numbers") },
  { id: "alle", titel: () => zw("Überblick", "Overview") },
];

/* ---------- Abgeschlossenheits-Tester ---------- */
function Tester({ raum }) {
  const ops = Object.keys(OPS);
  const [op, setOp] = useState(raum === "N" ? "minus" : raum === "Z" ? "geteilt" : "plus");
  const [paar, setPaar] = useState(() => [zufallAus(raum), zufallAus(raum)]);
  const [a, b] = paar;
  const r = rechne(a, op, b);
  const rr = ergebnisRaum(r);
  const drin = stufe(rr) <= stufe(raum);
  const neu = () => {
    /* Bei nicht abgeschlossenen Rechenarten öfter ein Beispiel, das hinausführt */
    for (let i = 0; i < 40; i++) {
      const x = zufallAus(raum), y = zufallAus(raum), e = rechne(x, op, y);
      if (e.z === 0) continue;
      if (ABGESCHLOSSEN[raum][op] || i > 30 || Math.random() < 0.5 || stufe(ergebnisRaum(e)) > stufe(raum)) { setPaar([x, y]); return; }
    }
  };
  const farbe = RAUM_FARBE[raum];
  const desktop = useDesktop();
  const karte = useKarte();
  const pillen = (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }} role="group" aria-label={zw("Rechenart", "Operation")}>
      {ops.map((o) => <Pille key={o} an={op === o} onClick={() => setOp(o)} farbe={farbe}>{OPS[o]}</Pille>)}
    </div>
  );
  const rechnung = <>
    <div style={{ fontSize: desktop ? 30 : 24, color: C.tinte, overflowX: "auto" }}><M t={`${tq(a)} ${OPS[op]} ${tq(b, true)} = ${tq(r)}`} /></div>
    <p style={{ margin: "8px 0 0", fontSize: 15, fontWeight: 700, color: drin ? farbe : ROT }} aria-live="polite">
      {drin
        ? <>{zw("Das Ergebnis liegt in", "The result is in")} {ZEICHEN[raum]} ✓</>
        : <>{zw("Das Ergebnis liegt nicht in", "The result is not in")} {ZEICHEN[raum]} – {zw("erst in", "only in")} <span style={{ color: RAUM_FARBE[rr] }}>{ZEICHEN[rr]}</span></>}
    </p>
  </>;
  const tafel = (spalten) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${spalten}, minmax(0, 1fr))`, gap: 6, marginTop: 12 }}>
      {ops.map((o) => {
        const ok = ABGESCHLOSSEN[raum][o];
        return (
          <div key={o} style={{ textAlign: "center", borderRadius: 10, padding: "6px 2px", background: ok ? `${farbe}12` : `${ROT}10`, border: `1px solid ${ok ? farbe : ROT}44` }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.tinte }}>{OPS[o]}</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: ok ? farbe : ROT }}>{ok ? zw("bleibt drin", "stays in") : zw("führt raus", "leads out")}</div>
          </div>
        );
      })}
    </div>
  );
  const erkl = zw("„Bleibt drin“ heißt: für alle Zahlen aus dem Zahlenraum (beim Teilen außer durch 0). Ein einziges Gegenbeispiel genügt für „führt raus“.", "“Stays in” means: for all numbers of the space (when dividing, except by 0). A single counterexample is enough for “leads out”.");
  if (desktop) {
    return (
      <div style={{ marginTop: 20 }} data-tester={raum}>
        <Arbeitsflaeche
          links={<FeinKarte>
            <p style={titelStil}>{zw("Probier selbst: Bleibt das Ergebnis drin?", "Try it: does the result stay inside?")}</p>
            {pillen}
            <AktionsKnopf onClick={neu}>{zw("Neue Zahlen aus", "New numbers from")} {ZEICHEN[raum]}</AktionsKnopf>
            {tafel(2)}
          </FeinKarte>}
          rechts={<>
            <BildKarte style={{ padding: "36px 20px", textAlign: "center", background: C.sand, minHeight: 150, display: "flex", flexDirection: "column", justifyContent: "center" }}>{rechnung}</BildKarte>
            <p style={{ ...hinweisStil, margin: "0 2px" }}>{erkl}</p>
          </>} />
      </div>
    );
  }
  return (
    <div style={{ ...karte, marginTop: 14 }} data-tester={raum}>
      <p style={kicker}>{zw("Probier selbst: Bleibt das Ergebnis drin?", "Try it: does the result stay inside?")}</p>
      {pillen}
      <div style={{ background: C.sand, borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
        {rechnung}
      </div>
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Zahlen aus", "New numbers from")} {ZEICHEN[raum]}</GrosserKnopf>
      {tafel(4)}
      <p style={{ fontSize: 12, color: C.grau, margin: "8px 2px 0", lineHeight: 1.5 }}>{erkl}</p>
    </div>
  );
}

/* ---------- Widerspruchsbeweis: √2 ist irrational ---------- */
const BEWEIS = () => [
  { tex: "\\sqrt{2} = \\frac{p}{q}", text: zw("Annahme (das Gegenteil): √2 ist rational. Dann gibt es p ∈ ℤ und q ∈ ℕ mit √2 = p/q, und der Bruch ist vollständig gekürzt – p und q haben keinen gemeinsamen Teiler außer 1.", "Assumption (the opposite): √2 is rational. Then there are p ∈ ℤ and q ∈ ℕ with √2 = p/q, and the fraction is fully reduced – p and q have no common divisor except 1.") },
  { tex: "2 = \\frac{p^2}{q^2} \\;\\Rightarrow\\; p^2 = 2q^2", text: zw("Beide Seiten quadrieren und mit q² malnehmen.", "Square both sides and multiply by q².") },
  { tex: "p^2 \\text{ gerade} \\;\\Rightarrow\\; p = 2k", text: zw("p² = 2q² ist eine gerade Zahl. Dann ist auch p gerade (das Quadrat einer ungeraden Zahl ist ungerade). Also p = 2k mit k ∈ ℤ.", "p² = 2q² is even. Then p is even too (the square of an odd number is odd). So p = 2k with k ∈ ℤ.") },
  { tex: "(2k)^2 = 2q^2 \\;\\Rightarrow\\; 4k^2 = 2q^2 \\;\\Rightarrow\\; q^2 = 2k^2", text: zw("p = 2k einsetzen und durch 2 teilen.", "Substitute p = 2k and divide by 2.") },
  { tex: "q^2 \\text{ gerade} \\;\\Rightarrow\\; q \\text{ gerade}", text: zw("Genauso wie eben: q² ist gerade, also ist auch q gerade.", "Just as before: q² is even, so q is even.") },
  { tex: "\\text{Widerspruch!}", text: zw("p und q sind beide gerade – man könnte durch 2 kürzen. Aber der Bruch war vollständig gekürzt. Die Annahme war falsch: √2 ist nicht rational, also irrational. ∎", "p and q are both even – you could cancel by 2. But the fraction was fully reduced. The assumption was wrong: √2 is not rational, so it is irrational. ∎") },
];
function Beweis() {
  const [n, setN] = useState(1);
  const zeilen = BEWEIS();
  const desktop = useDesktop();
  const karte = useKarte();
  const satz = <p style={{ fontSize: 17, fontWeight: 700, color: C.tinte, margin: "0 0 4px" }}>{zw("Es gibt keine rationale Zahl, deren Quadrat 2 ist.", "There is no rational number whose square is 2.")}</p>;
  const idee = zw("Idee: Wir nehmen das Gegenteil an und rechnen so lange, bis etwas Unmögliches herauskommt. Dann muss die Annahme falsch gewesen sein.", "Idea: we assume the opposite and calculate until something impossible comes out. Then the assumption must have been wrong.");
  const liste = (
    <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {zeilen.slice(0, n).map((z, i) => (
        <li key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: i ? `1px solid ${C.linie}` : "none" }}>
          <span aria-hidden="true" style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 999, background: i === zeilen.length - 1 ? ROT : C.smaragd, color: C.weiss, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, color: i === zeilen.length - 1 ? ROT : C.tinte, overflowX: "auto", paddingBottom: 2 }}><M t={z.tex} /></div>
            <p style={{ margin: "2px 0 0", fontSize: 13.5, color: C.grau, lineHeight: 1.6 }}>{z.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
  const ende = n >= zeilen.length;
  const aufklapp1 = (
    <Aufklapp titel={zw("Warum ist p gerade, wenn p² gerade ist?", "Why is p even if p² is even?")}>
      <MS s={zw("Wäre p ungerade, also $p = 2m + 1$, dann wäre $p^2 = 4m^2 + 4m + 1 = 2 \\cdot (2m^2 + 2m) + 1$ – eine ungerade Zahl. Ein gerades p² kann also nur von einem geraden p kommen.", "If p were odd, i.e. $p = 2m + 1$, then $p^2 = 4m^2 + 4m + 1 = 2 \\cdot (2m^2 + 2m) + 1$ – an odd number. So an even p² can only come from an even p.")} />
    </Aufklapp>
  );
  const aufklapp2 = (
    <Aufklapp titel={zw("Geht das auch mit √3, √5, …?", "Does this work for √3, √5, …?")}>
      <MS s={zw("Ja. Für jede Primzahl p läuft der Beweis genauso, nur mit „durch p teilbar“ statt „gerade“. Allgemein gilt: $\\sqrt{n}$ ist genau dann rational, wenn n eine Quadratzahl ist. $\\sqrt{9} = 3$ ist rational, $\\sqrt{8}$ nicht.", "Yes. For every prime p the proof works the same way, with “divisible by p” instead of “even”. In general: $\\sqrt{n}$ is rational exactly when n is a perfect square. $\\sqrt{9} = 3$ is rational, $\\sqrt{8}$ is not.")} />
    </Aufklapp>
  );
  if (desktop) {
    return (
      <div style={{ marginTop: 20 }} data-beweis>
        <Arbeitsflaeche
          links={<FeinKarte>
            <p style={titelStil}>{zw("Beweis durch Widerspruch", "Proof by contradiction")}</p>
            {satz}
            <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, margin: "6px 0 14px" }}>{idee}</p>
            <div style={{ display: "grid", gap: 8 }}>
              <AktionsKnopf haupt farbe={C.smaragd} onClick={() => setN(n + 1)} disabled={ende}>{zw("Nächster Schritt", "Next step")}</AktionsKnopf>
              <AktionsKnopf onClick={() => setN(ende ? 1 : zeilen.length)}>{ende ? zw("Von vorn", "Restart") : zw("Alles zeigen", "Show all")}</AktionsKnopf>
            </div>
          </FeinKarte>}
          rechts={<BildKarte style={{ padding: "6px 20px", minHeight: 220 }}>{liste}</BildKarte>} />
        <ErgebnisReihe style={{ marginTop: 4 }}>{aufklapp1}{aufklapp2}</ErgebnisReihe>
      </div>
    );
  }
  return (
    <div style={{ ...karte, marginTop: 14 }} data-beweis>
      <p style={kicker}>{zw("Beweis durch Widerspruch", "Proof by contradiction")}</p>
      {satz}
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "0 0 10px" }}>{idee}</p>
      {liste}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <GrosserKnopf onClick={() => setN(n + 1)} disabled={ende}>{zw("Nächster Schritt", "Next step")}</GrosserKnopf>
        <GrosserKnopf ghost onClick={() => setN(ende ? 1 : zeilen.length)}>{ende ? zw("Von vorn", "Restart") : zw("Alles zeigen", "Show all")}</GrosserKnopf>
      </div>
      {aufklapp1}
      {aufklapp2}
    </div>
  );
}

/* ---------- Näherungsbrüche für √2 ---------- */
function Naeherung() {
  const l = useMemo(() => naeherungenWurzel2(8), []);
  const [k, setK] = useState(3);
  const [p, qq] = l[k];
  const quad = (p * p) / (qq * qq);
  const fmt = (v, st) => v.toFixed(st).replace(".", ",");
  const desktop = useDesktop();
  const karte = useKarte();
  const text = zw("Jeder Bruch ist näher an √2 als der vorige. Trotzdem ist das Quadrat nie genau 2: Es liegt immer um genau 1/q² daneben.", "Each fraction is closer to √2 than the one before. Still the square is never exactly 2: it is always off by exactly 1/q².");
  const pillen = (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {l.map(([a, b], i) => <Pille key={i} an={i === k} onClick={() => setK(i)} farbe={C.gold}>{a}/{b}</Pille>)}
    </div>
  );
  const formel = <>
    <M t={`\\left(\\frac{${p}}{${qq}}\\right)^2 = \\frac{${p * p}}{${qq * qq}} \\approx ${fmt(quad, 8)}`} />
    <span style={{ fontSize: 14, fontWeight: 700, color: quad < 2 ? C.see : ROT }}>
      {quad < 2 ? zw("etwas zu klein", "slightly too small") : zw("etwas zu groß", "slightly too big")} · {zw("Abstand zu 2:", "distance to 2:")} <M t={`\\frac{1}{${qq * qq}}`} />
    </span>
  </>;
  if (desktop) {
    return (
      <div style={{ marginTop: 20 }}>
        <Arbeitsflaeche
          links={<FeinKarte>
            <p style={titelStil}>{zw("Immer näher – nie genau", "Ever closer – never exact")}</p>
            <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, margin: 0 }}>{text}</p>
          </FeinKarte>}
          rechts={<>
            <BildKarte style={{ padding: "24px 20px", background: C.sand, fontSize: 21, color: C.tinte, display: "grid", gap: 8, textAlign: "center" }}>{formel}</BildKarte>
            <Werkzeugleiste gruppen={[{ titel: zw("Näherungsbruch", "Approximation"), inhalt: pillen }]} />
          </>} />
      </div>
    );
  }
  return (
    <div style={{ ...karte, marginTop: 14 }}>
      <p style={kicker}>{zw("Immer näher – nie genau", "Ever closer – never exact")}</p>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "0 0 10px" }}>{text}</p>
      {pillen}
      <div style={{ background: C.sand, borderRadius: 14, padding: "12px 14px", marginTop: 12, fontSize: 18, color: C.tinte, display: "grid", gap: 4 }}>
        {formel}
      </div>
    </div>
  );
}

/* ---------- Mengenbild zum Antippen ---------- */
const BEISPIELE = [
  ["7", { art: "q", q: q(7) }], ["−3", { art: "q", q: q(-3) }], ["\\frac{2}{5}", { art: "q", q: q(2, 5) }], ["0{,}75", { art: "q", q: q(3, 4) }],
  ["\\sqrt{9}", wurzelVon(9)], ["−\\frac{12}{4}", { art: "q", q: q(-3) }], ["0{,}\\overline{3}", { art: "q", q: q(1, 3) }], ["\\sqrt{2}", wurzelVon(2)], ["\\pi", { art: "pi" }], ["\\sqrt{50}", wurzelVon(50)],
];
function Mengenbild() {
  const [w, setW] = useState(7);
  const [tex, x] = BEISPIELE[w];
  const r = kleinsterRaum(x);
  const S = [["R", 180, 92, 168, 82], ["Q", 158, 98, 128, 64], ["Z", 136, 104, 88, 46], ["N", 114, 110, 50, 28]];
  const pos = { N: [108, 114], Z: [174, 112], Q: [242, 104], R: [312, 92] }[r];
  const desktop = useDesktop();
  const karte = useKarte();
  const knoepfe = (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {BEISPIELE.map(([t], i) => (
        <button key={i} type="button" aria-pressed={i === w} onClick={() => setW(i)}
          style={{ minHeight: 40, minWidth: 48, padding: "4px 10px", borderRadius: 12, fontFamily: "inherit", fontSize: 15, cursor: "pointer",
            border: `1.5px solid ${i === w ? C.see : C.linie}`, background: i === w ? C.himmel : C.weiss, color: C.tinte }}><M t={t} /></button>
      ))}
    </div>
  );
  /* Mengenbild mit fester Geometrie: am Desktop auf natürliche Größe begrenzt (DESKTOP-STIL.md) */
  const bild = (
    <svg viewBox="0 0 360 190" width="100%" style={{ display: "block", maxWidth: 440, margin: desktop ? "0 auto" : "12px auto 0" }} role="img" aria-label={zw("Mengenbild ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ", "Set diagram ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ")}>
      {S.map(([kk, cx, cy, rx, ry]) => {
        const an = stufe(kk) >= stufe(r);
        return (
          <g key={kk}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={RAUM_FARBE[kk]} opacity={an ? 0.13 : 0.03} stroke={RAUM_FARBE[kk]} strokeWidth={kk === r ? 3 : 1.6} />
            <text x={cx + rx - 18} y={cy - ry + 26} textAnchor="middle" fontSize="17" fontWeight="800" fill={RAUM_FARBE[kk]} fontFamily="inherit">{ZEICHEN[kk]}</text>
          </g>
        );
      })}
      <circle cx={pos[0]} cy={pos[1]} r="7" fill={C.flaggold} stroke={C.tinte} strokeWidth="1.5" />
    </svg>
  );
  const satz = (
    <p style={{ margin: "6px 0 0", fontSize: 14.5, lineHeight: 1.6, color: C.tinte, textAlign: "center" }}>
      <M t={tex} /> {zw("liegt in", "is in")} {RAEUME.filter((kk) => stufe(kk) >= stufe(r)).map((kk, i) => <span key={kk}>{i ? ", " : " "}<b style={{ color: RAUM_FARBE[kk] }}>{ZEICHEN[kk]}</b></span>)}
      {r !== "N" && <> – {zw("nicht in", "not in")} {RAEUME.filter((kk) => stufe(kk) < stufe(r)).map((kk, i) => <span key={kk}>{i ? ", " : " "}<b style={{ color: C.grau }}>{ZEICHEN[kk]}</b></span>)}</>}
    </p>
  );
  if (desktop) {
    return (
      <div style={{ marginTop: 20 }} data-mengenbild>
        <Arbeitsflaeche
          links={<FeinKarte>
            <p style={titelStil}>{zw("Wo wohnt die Zahl?", "Where does the number live?")}</p>
            {knoepfe}
          </FeinKarte>}
          rechts={<BildKarte style={{ padding: "16px 16px 14px" }}>{bild}{satz}</BildKarte>} />
      </div>
    );
  }
  return (
    <div style={{ ...karte, marginTop: 14 }} data-mengenbild>
      <p style={kicker}>{zw("Wo wohnt die Zahl?", "Where does the number live?")}</p>
      {knoepfe}
      {bild}
      {satz}
    </div>
  );
}

/* ---------- Die Reise: fünf Stationen ---------- */
function StationKopf({ nr, raum, titel, menge }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800,
        color: C.weiss, background: raum === "alle" ? `linear-gradient(135deg, ${C.see}, ${C.lila} 40%, ${C.gold} 70%, ${C.smaragd})` : RAUM_FARBE[raum] }}>{raum === "alle" ? "⊂" : ZEICHEN[raum]}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ ...kicker, marginBottom: 2 }}>{zw("Station", "Station")} {nr} {zw("von", "of")} 5</p>
        <p style={{ fontSize: 19, fontWeight: 700, color: C.tinte, margin: 0, lineHeight: 1.25 }}>{titel}</p>
        {menge && <div style={{ fontSize: 15, color: raum === "alle" ? C.tinte : RAUM_FARBE[raum], marginTop: 2 }}><M t={menge} /></div>}
      </div>
    </div>
  );
}
const P = ({ children }) => <p style={{ fontSize: 15, fontWeight: 300, color: C.grau, lineHeight: 1.75, margin: "12px 0 0" }}>{children}</p>;

function Entdecken({ gehe }) {
  const [s, setS] = useState(0);
  const karte = useKarte();   // Desktop: feiner Rahmen statt Schatten
  const st = STATIONEN[s];
  const weiter = (
    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
      {s > 0 && <div style={{ flex: "0 0 36%" }}><GrosserKnopf ghost onClick={() => { setS(s - 1); springe("entdecken-phasen", () => window.scrollTo(0, 0)); }}>← {s === 4 ? "ℝ" : ZEICHEN[RAEUME[s - 1]]}</GrosserKnopf></div>}
      {s < 4 && <div style={{ flex: 1 }}><GrosserKnopf onClick={() => { setS(s + 1); springe("entdecken-phasen", () => window.scrollTo(0, 0)); }}>{zw("Weiter zu", "On to")} {s === 3 ? zw("Überblick", "overview") : ZEICHEN[RAEUME[s + 1]]} →</GrosserKnopf></div>}
    </div>
  );
  return (
    <div>
      {/* Reiseleiste */}
      <div role="tablist" aria-label={zw("Stationen", "Stations")} style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 6, marginTop: 16 }}>
        {STATIONEN.map((x, i) => {
          const an = i === s, f = x.id === "alle" ? C.see : RAUM_FARBE[x.id];
          return (
            <button key={x.id} type="button" role="tab" aria-selected={an} aria-label={x.titel()} onClick={() => setS(i)}
              style={{ height: 48, borderRadius: 12, fontFamily: "inherit", fontSize: x.id === "alle" ? 18 : 22, fontWeight: 800, cursor: "pointer",
                border: `1.5px solid ${an ? f : C.linie}`, background: an ? f : C.weiss, color: an ? C.weiss : f }}>{x.id === "alle" ? "⊂" : ZEICHEN[x.id]}</button>
          );
        })}
      </div>

      {st.id === "N" && (
        <>
          <StationKopf nr={1} raum="N" titel={st.titel()} menge={"\\mathbb{N} = \\{1, 2, 3, 4, \\dots\\}"} />
          <P>{zw("Mit den natürlichen Zahlen fängt alles an: Wir zählen. Die erste Frage an jeden Zahlenraum lautet: Welche Rechnungen kann ich darin ausführen, ohne ihn zu verlassen?", "Everything starts with the natural numbers: we count. The first question for every number space is: which calculations can I do inside it without leaving it?")}</P>
          <ZahlraumAnimation art="natuerlich" offen />
          <Tester key="N" raum="N" />
          <Merke farbe={RAUM_FARBE.N}><b>{zw("Abgeschlossen", "Closed")}</b> {zw("heißt: Rechnest du mit zwei Zahlen aus dem Zahlenraum, liegt das Ergebnis wieder darin. ℕ ist abgeschlossen bezüglich + und ·, aber nicht bezüglich − und :.", "means: if you calculate with two numbers from the space, the result lies in it again. ℕ is closed under + and ·, but not under − and :.")}</Merke>
          <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.55, margin: "10px 2px 0" }}>{zw("Ob die 0 zu ℕ gehört, ist Vereinbarungssache. Hier gilt ℕ = {1, 2, 3, …} und ℕ₀ = {0, 1, 2, …}. Schau nach, wie es dein Schulbuch schreibt – an den Ideen ändert sich nichts.", "Whether 0 belongs to ℕ is a matter of convention. Here ℕ = {1, 2, 3, …} and ℕ₀ = {0, 1, 2, …}. Check how your textbook writes it – the ideas stay the same.")}</p>
        </>
      )}

      {st.id === "Z" && (
        <>
          <StationKopf nr={2} raum="Z" titel={st.titel()} menge={"\\mathbb{Z} = \\{\\dots, −2, −1, 0, 1, 2, \\dots\\}"} />
          <P>{zw("Jetzt nehmen wir die Subtraktion als dritte Rechenart dazu. 7 − 2 = 5 klappt. Aber 2 − 7? In ℕ gibt es kein Ergebnis – wir verlassen den Zahlenraum. Damit die Subtraktion immer ein Ergebnis hat, entstehen die ganzen Zahlen.", "Now we add subtraction as a third operation. 7 − 2 = 5 works. But 2 − 7? In ℕ there is no result – we leave the number space. So that subtraction always has a result, the integers are created.")}</P>
          <ZahlraumAnimation art="ganz" offen />
          <Tester key="Z" raum="Z" />
          <Merke farbe={RAUM_FARBE.Z}><MS s={zw("ℤ entsteht aus ℕ durch die Gegenzahlen −1, −2, −3, … und die 0. In ℤ führen +, − und · nie hinaus. Die Subtraktion ist dabei nichts Neues: $a − b = a + (−b)$ – Addition des Inversen.", "ℤ arises from ℕ by adding the opposites −1, −2, −3, … and 0. In ℤ, +, − and · never lead out. Subtraction is nothing new: $a − b = a + (−b)$ – adding the inverse.")} /></Merke>
        </>
      )}

      {st.id === "Q" && (
        <>
          <StationKopf nr={3} raum="Q" titel={st.titel()} menge={"\\mathbb{Q} = \\{\\frac{p}{q} \\mid p \\in \\mathbb{Z},\\, q \\in \\mathbb{N}\\}"} />
          <P>{zw("Als vierte Rechenart kommt die Division dazu. 10 : 5 = 2 bleibt in ℤ, aber 2 : 5 verlässt ℤ. Deshalb brauchen wir die rationalen Zahlen: Jede rationale Zahl ist eine ganze Zahl geteilt durch eine natürliche Zahl.", "Division joins as the fourth operation. 10 : 5 = 2 stays in ℤ, but 2 : 5 leaves ℤ. That is why we need the rational numbers: every rational number is an integer divided by a natural number.")}</P>
          <ZahlraumAnimation art="rational" offen />
          <Tester key="Q" raum="Q" />
          <Merke farbe={RAUM_FARBE.Q}><MS s={zw("In ℚ sind alle vier Grundrechenarten abgeschlossen – nur durch 0 darf man nicht teilen. Genau deshalb gibt es die Bruchrechnung: Sie ist das Rechnen in ℚ. Rationale Zahlen haben eine abbrechende ($\\frac{3}{4} = 0{,}75$) oder periodische ($\\frac{1}{3} = 0{,}\\overline{3}$) Dezimaldarstellung.", "In ℚ all four basic operations are closed – only division by 0 is not allowed. That is exactly why fraction arithmetic exists: it is calculating in ℚ. Rational numbers have a terminating ($\\frac{3}{4} = 0.75$) or repeating ($\\frac{1}{3} = 0.\\overline{3}$) decimal expansion.")} /></Merke>
          <div style={{ ...karte, marginTop: 14 }}>
            <p style={kicker}>{zw("Warum ist der Nenner eine natürliche Zahl?", "Why is the denominator a natural number?")}</p>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: C.tinte }}><MS s={zw("Das Vorzeichen steckt im Zähler: $\\frac{2}{−5} = \\frac{−2}{5}$. Und $q = 0$ ist verboten, weil es kein $\\frac{1}{0}$ gibt (das hast du bei den Axiomen bewiesen). Mit $q \\in \\mathbb{N}$ ist beides auf einmal geregelt.", "The sign goes in the numerator: $\\frac{2}{−5} = \\frac{−2}{5}$. And $q = 0$ is forbidden because there is no $\\frac{1}{0}$ (you proved that with the axioms). With $q \\in \\mathbb{N}$ both are settled at once.")} /></p>
          </div>
        </>
      )}

      {st.id === "R" && (
        <>
          <StationKopf nr={4} raum="R" titel={st.titel()} menge={zw("\\mathbb{R} = \\mathbb{Q} \\cup \\{\\text{irrationale Zahlen}\\}", "\\mathbb{R} = \\mathbb{Q} \\cup \\{\\text{irrational numbers}\\}")} />
          <P>{zw("In ℚ können wir uneingeschränkt rechnen. Sind das also alle Zahlen? Nein – sobald wir Gleichungen wie x² = 2 lösen wollen, reicht ℚ nicht mehr. Die Lösung √2 gibt es als Länge, aber nicht als Bruch.", "In ℚ we can calculate without restriction. So are these all numbers? No – as soon as we want to solve equations like x² = 2, ℚ is not enough. The solution √2 exists as a length, but not as a fraction.")}</P>
          <ZahlraumAnimation art="reell" offen />
          <Beweis />
          <Naeherung />
          <Merke farbe={RAUM_FARBE.R}><MS s={zw("Zahlen, die keine Brüche sind, heißen irrational – z. B. $\\sqrt{2}$, $\\sqrt{3}$, $\\pi$. Ihre Dezimaldarstellung ist unendlich und nicht periodisch. Rationale und irrationale Zahlen zusammen bilden die reellen Zahlen ℝ: die lückenlose Zahlengerade. Das sind alle Zahlen, die du in der Schule brauchst.", "Numbers that are not fractions are called irrational – e.g. $\\sqrt{2}$, $\\sqrt{3}$, $\\pi$. Their decimal expansion is infinite and non-repeating. Rational and irrational numbers together form the real numbers ℝ: the gapless number line. These are all the numbers you need at school.")} /></Merke>
        </>
      )}

      {st.id === "alle" && (
        <>
          <StationKopf nr={5} raum="alle" titel={st.titel()} menge={"\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}"} />
          <P>{zw("Jeder Zahlenraum ist entstanden, weil eine Rechnung im alten Raum kein Ergebnis hatte. Tippe eine Zahl an und sieh, in welchen Zahlenräumen sie liegt.", "Each number space was created because a calculation had no result in the old one. Tap a number and see which spaces it lies in.")}</P>
          <Mengenbild />
          <div style={{ ...karte, marginTop: 14, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, color: C.tinte }}>
              <thead>
                <tr style={{ background: C.sand }}>
                  {[zw("Raum", "Space"), zw("entsteht, weil …", "created because …"), zw("abgeschlossen bzgl.", "closed under")].map((h) => <th key={h} style={{ textAlign: "left", padding: "10px 10px", fontSize: 12, color: C.grau }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ["N", zw("wir zählen", "we count"), "+ ·"],
                  ["Z", "2 − 7 ∉ ℕ", "+ − ·"],
                  ["Q", "2 : 5 ∉ ℤ", "+ − · :"],
                  ["R", "x² = 2 " + zw("hat keine Lösung in ℚ", "has no solution in ℚ"), "+ − · :"],
                ].map(([k, w, o]) => (
                  <tr key={k} style={{ borderTop: `1px solid ${C.linie}` }}>
                    <td style={{ padding: "10px", fontSize: 20, fontWeight: 800, color: RAUM_FARBE[k] }}>{ZEICHEN[k]}</td>
                    <td style={{ padding: "10px", lineHeight: 1.45 }}>{w}</td>
                    <td style={{ padding: "10px", fontWeight: 700, whiteSpace: "nowrap" }}>{o}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ ...karte, marginTop: 14, borderLeft: `4px solid ${C.flaggold}` }}>
            <p style={kicker}>{zw("Zurück zum Fundament", "Back to the foundation")}</p>
            <p style={{ margin: "0 0 4px", fontSize: 14, lineHeight: 1.65, color: C.tinte }}><MS s={zw("ℚ und ℝ erfüllen alle neun Axiome – dort gibt es zu jeder Zahl ein Inverses: $−a$ und (für $a \\neq 0$) $\\frac{1}{a}$. In ℕ fehlen beide, in ℤ fehlt $\\frac{1}{a}$. Genau deshalb erweitern wir die Zahlenräume.", "ℚ and ℝ satisfy all nine axioms – every number has an inverse: $−a$ and (for $a \\neq 0$) $\\frac{1}{a}$. In ℕ both are missing, in ℤ $\\frac{1}{a}$ is missing. That is exactly why we extend the number spaces.")} /></p>
            <GrosserKnopf ghost onClick={() => gehe && gehe({ ansicht: "axiome" })}>{zw("Axiome und Rechenregeln ansehen", "Look at the axioms")}</GrosserKnopf>
          </div>
        </>
      )}
      {weiter}
    </div>
  );
}

/* ======================================================================
   ÜBEN
   ====================================================================== */
let zaehler = 0;
const neue = (art) => ({ id: ++zaehler, ...zrAufgabe(art) });
const TITEL = {
  einordnen: ["Einordnen", "Classify"], element: ["Element oder nicht?", "Element or not?"], abgeschlossen: ["Bleibt es drin?", "Does it stay inside?"],
  rauswerfer: ["Welche Rechnung führt hinaus?", "Which calculation leads out?"], gleichung: ["Gleichung und Zahlenraum", "Equation and number space"],
  wahrfalsch: ["Wahr oder falsch?", "True or false?"], dezimal: ["Dezimalzahl als Bruch", "Decimal as a fraction"], wurzel: ["Wurzel rational?", "Root rational?"],
  beweis: ["Widerspruchsbeweis", "Proof by contradiction"],
};
const raumOpt = () => RAEUME.map((k) => [k, `${ZEICHEN[k]} – ${name(k)}`]);
const jaNein = () => [["ja", zw("Ja", "Yes")], ["nein", zw("Nein", "No")]];

function schritte(a) {
  switch (a.art) {
    case "einordnen": {
      const fehler = RAEUME.filter((k) => k !== a.raum).map((k) => ({ wahl: k,
        text: stufe(k) > stufe(a.raum)
          ? (a.falle === "wurzel" || a.falle === "bruch" ? zw("Rechne die Zahl erst aus – die Schreibweise täuscht.", "Work the number out first – the notation is deceptive.") : zw(`Die Zahl liegt zwar auch in ${ZEICHEN[k]}, gesucht ist aber der kleinste Zahlenraum.`, `The number is also in ${ZEICHEN[k]}, but we want the smallest space.`))
          : a.raum === "R" ? zw("Diese Zahl lässt sich nicht als Bruch schreiben.", "This number cannot be written as a fraction.")
            : a.raum === "Q" ? zw("Das ist kein ganzzahliges Ergebnis.", "That is not a whole number.") : zw("Negative Zahlen liegen nicht in ℕ.", "Negative numbers are not in ℕ.") }));
      const erkl = a.raum === "R" ? zw(`$${a.tex}$ ist irrational, liegt also nur in ℝ.`, `$${a.tex}$ is irrational, so it is only in ℝ.`)
        : zw(`$${a.tex} = ${qTex(rationalVon(a))}$ liegt in ${ZEICHEN[a.raum]} (und damit in allen größeren Zahlenräumen).`, `$${a.tex} = ${qTex(rationalVon(a))}$ is in ${ZEICHEN[a.raum]} (and therefore in all larger spaces).`);
      return [ws("zr-e", zw("Kleinster Zahlenraum", "Smallest space"), zw(`In welchem kleinsten Zahlenraum liegt $${a.tex}$?`, `What is the smallest number space containing $${a.tex}$?`), raumOpt(), a.raum,
        { fehler, hinweis: zw("Erst ausrechnen bzw. vereinfachen, dann einordnen: Ganz? Positiv? Als Bruch schreibbar?", "Simplify first, then classify: whole? positive? writable as a fraction?"), erkl })];
    }
    case "element": {
      const r = a.raum;
      return [ws("zr-el", zw("Element?", "Element?"), zw(`Gilt $${a.tex} \\in \\mathbb{${a.frageRaum}}$?`, `Is $${a.tex} \\in \\mathbb{${a.frageRaum}}$?`), jaNein(), a.drin ? "ja" : "nein",
        { hinweis: zw("ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ: Was in einem kleinen Zahlenraum liegt, liegt auch in allen größeren.", "ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ: what is in a small space is also in all larger ones."),
          fehler: [{ wahl: a.drin ? "nein" : "ja", text: a.drin ? zw(`Die Zahl liegt in ${ZEICHEN[r]} – und ${ZEICHEN[r]} steckt in ${ZEICHEN[a.frageRaum]}.`, `The number is in ${ZEICHEN[r]} – and ${ZEICHEN[r]} is inside ${ZEICHEN[a.frageRaum]}.`) : zw(`Der kleinste Zahlenraum der Zahl ist ${ZEICHEN[r]} – größer als ${ZEICHEN[a.frageRaum]}.`, `The number's smallest space is ${ZEICHEN[r]} – larger than ${ZEICHEN[a.frageRaum]}.`) }],
          erkl: zw(`Kleinster Zahlenraum: ${ZEICHEN[r]}. Also $${a.tex} ${a.drin ? "\\in" : "\\notin"} \\mathbb{${a.frageRaum}}$.`, `Smallest space: ${ZEICHEN[r]}. So $${a.tex} ${a.drin ? "\\in" : "\\notin"} \\mathbb{${a.frageRaum}}$.`) })];
    }
    case "abgeschlossen": {
      const term = `${tq(a.a)} ${OPS[a.op]} ${tq(a.b, true)}`;
      const v = qNum(a.r);
      return [
        zs("zr-a1", zw("Ausrechnen", "Calculate"), `$${term} =$`, v, zw("Rechne aus (Brüche als 3/8 eingeben).", "Calculate (enter fractions like 3/8)."),
          { wertText: `$${qTex(a.r)}$`, erkl: `$${term} = ${qTex(a.r)}$`, tol: 1e-9 }),
        ws("zr-a2", zw("Drin oder raus?", "In or out?"), zw(`Liegt das Ergebnis in ${ZEICHEN[a.raum]}?`, `Is the result in ${ZEICHEN[a.raum]}?`), jaNein(), a.drin ? "ja" : "nein",
          { erkl: a.drin ? zw(`Ja – $${qTex(a.r)} \\in \\mathbb{${a.raum}}$.`, `Yes – $${qTex(a.r)} \\in \\mathbb{${a.raum}}$.`) : zw(`Nein – $${qTex(a.r)}$ liegt erst in ${ZEICHEN[a.ergRaum]}. ${ZEICHEN[a.raum]} ist bezüglich ${OPS[a.op]} nicht abgeschlossen.`, `No – $${qTex(a.r)}$ is only in ${ZEICHEN[a.ergRaum]}. ${ZEICHEN[a.raum]} is not closed under ${OPS[a.op]}.`),
            hinweis: zw("Ganze Zahl? Positiv? Bruch?", "Whole number? Positive? Fraction?") }),
      ];
    }
    case "rauswerfer": {
      const opt = misch(a.optionen.map((o, i) => [String(i), `$${o.tex}$`]), a.id);
      const r = String(a.optionen.findIndex((o) => o.raus));
      return [ws("zr-r", zw("Raus!", "Out!"), zw(`Alle Zahlen stammen aus ${ZEICHEN[a.raum]}. Welche Rechnung führt aus ${ZEICHEN[a.raum]} hinaus?`, `All numbers come from ${ZEICHEN[a.raum]}. Which calculation leads out of ${ZEICHEN[a.raum]}?`), opt, r,
        { hinweis: zw("Rechne jede Möglichkeit kurz aus.", "Work out each option briefly."), erkl: zw(`$${a.optionen[r].tex}$ – das Ergebnis liegt nicht in ${ZEICHEN[a.raum]}.`, `$${a.optionen[r].tex}$ – the result is not in ${ZEICHEN[a.raum]}.`) })];
    }
    case "gleichung": {
      const gl = a.typ === "plus" ? `x + ${a.a} = ${a.b}` : a.typ === "mal" ? `${a.a} \\cdot x = ${a.b}` : `x^2 = ${a.n}`;
      const loes = a.x.art === "q" ? qTex(a.x.q) : `\\sqrt{${a.n}}`;
      const st = [ws("zr-g1", zw("Zahlenraum", "Number space"), zw(`In welchem kleinsten Zahlenraum hat $${gl}$ eine Lösung${a.typ === "quadrat" ? " (die positive)" : ""}?`, `In which smallest space does $${gl}$ have a solution${a.typ === "quadrat" ? " (the positive one)" : ""}?`), raumOpt(), a.raum,
        { hinweis: zw("Löse die Gleichung und ordne die Lösung ein.", "Solve the equation and classify the solution."), erkl: zw(`$x = ${loes}$ liegt in ${ZEICHEN[a.raum]}.`, `$x = ${loes}$ is in ${ZEICHEN[a.raum]}.`) })];
      if (a.x.art === "q") st.unshift(zs("zr-g0", zw("Lösung", "Solution"), "x =", qNum(a.x.q), zw("Löse die Gleichung.", "Solve the equation."), { wertText: `$${loes}$`, erkl: `$x = ${loes}$` }));
      return st;
    }
    case "wahrfalsch":
      return [ws("zr-w", zw("Wahr oder falsch?", "True or false?"), zw(a.de, a.en), [["w", zw("Wahr", "True")], ["f", zw("Falsch", "False")]], a.wahr ? "w" : "f",
        { hinweis: zw("Suche ein Gegenbeispiel – eins reicht, um eine Allaussage zu widerlegen.", "Look for a counterexample – one is enough to disprove a universal statement."), erkl: zw(a.gde, a.gen) })];
    case "dezimal": {
      const g = ggTq(a.zaehler, a.nenner);
      if (a.typ === "abbrechend") return [zs("zr-d", zw("Als Bruch", "As a fraction"), `$${a.tex} =$`, a.zaehler / a.nenner, zw("Schreibe die Zahl als vollständig gekürzten Bruch.", "Write the number as a fully reduced fraction."),
        { gekuerzt: true, wertText: `$\\frac{${a.zaehler}}{${a.nenner}}$`, hinweis: zw("Erst als Zehnerbruch schreiben (Nenner 10, 100, 1000), dann kürzen.", "First write it with denominator 10, 100 or 1000, then reduce."), erkl: `$${a.tex} = \\frac{${a.zaehler}}{${a.nenner}}$` })];
      const k = a.nenner === 9 ? 1 : 2;
      const st = [zs("zr-d1", zw("Zähler über 9…", "Numerator over 9…"), `$${a.tex} = \\frac{?}{${a.nenner}}$, ? =`, a.zaehler, zw(`Die Periode hat ${k} Stelle${k > 1 ? "n" : ""}. Dann gilt: $0{,}\\overline{ab} = \\frac{ab}{99}$ bzw. $0{,}\\overline{a} = \\frac{a}{9}$.`, `The period has ${k} digit${k > 1 ? "s" : ""}. Then $0.\\overline{ab} = \\frac{ab}{99}$ or $0.\\overline{a} = \\frac{a}{9}$.`),
        { hinweis: zw(`Trick: $10^${k} \\cdot x − x$ = Periode.`, `Trick: $10^${k} \\cdot x − x$ = period.`), erkl: `$${a.tex} = \\frac{${a.zaehler}}{${a.nenner}}$` })];
      if (g > 1) st.push(zs("zr-d2", zw("Kürzen", "Reduce"), `$\\frac{${a.zaehler}}{${a.nenner}} =$`, a.zaehler / a.nenner, zw("Kürze vollständig.", "Reduce fully."),
        { gekuerzt: true, wertText: `$\\frac{${a.zaehler / g}}{${a.nenner / g}}$`, erkl: zw(`Durch ${g} kürzen: $\\frac{${a.zaehler / g}}{${a.nenner / g}}$`, `Divide by ${g}: $\\frac{${a.zaehler / g}}{${a.nenner / g}}$`) }));
      return st;
    }
    case "wurzel": {
      const st = [ws("zr-wu1", zw("Rational?", "Rational?"), zw(`Ist $\\sqrt{${a.n}}$ eine rationale Zahl?`, `Is $\\sqrt{${a.n}}$ a rational number?`), jaNein(), a.rational ? "ja" : "nein",
        { hinweis: zw("√n ist genau dann rational, wenn n eine Quadratzahl ist.", "√n is rational exactly when n is a perfect square."),
          erkl: a.rational ? zw(`$${a.n} = ${a.k}^2$, also $\\sqrt{${a.n}} = ${a.k}$.`, `$${a.n} = ${a.k}^2$, so $\\sqrt{${a.n}} = ${a.k}$.`) : zw(`${a.n} ist keine Quadratzahl, also ist $\\sqrt{${a.n}}$ irrational.`, `${a.n} is not a perfect square, so $\\sqrt{${a.n}}$ is irrational.`) })];
      st.push(a.rational
        ? zs("zr-wu2", zw("Wert", "Value"), `$\\sqrt{${a.n}} =$`, a.k, zw("Welche Zahl ist es?", "Which number is it?"), { erkl: `$\\sqrt{${a.n}} = ${a.k}$` })
        : zs("zr-wu2", zw("Einschachteln", "Bracketing"), "k =", a.k, zw(`Zwischen welchen natürlichen Zahlen liegt $\\sqrt{${a.n}}$? Gib k an mit $k < \\sqrt{${a.n}} < k + 1$.`, `Between which natural numbers is $\\sqrt{${a.n}}$? Enter k with $k < \\sqrt{${a.n}} < k + 1$.`),
          { fehler: [{ wert: a.k + 1, text: zw(`$${a.k + 1}^2 = ${(a.k + 1) ** 2}$ ist schon größer als ${a.n}.`, `$${a.k + 1}^2 = ${(a.k + 1) ** 2}$ is already larger than ${a.n}.`) }], hinweis: zw("Suche die Quadratzahlen links und rechts von n.", "Find the perfect squares on either side of n."), erkl: `$${a.k}^2 = ${a.k * a.k} < ${a.n} < ${(a.k + 1) ** 2} = ${a.k + 1}^2$` }));
      return st;
    }
    default: {
      const p = a.p;
      const teilbar = p === 2 ? zw("gerade", "even") : zw(`durch ${p} teilbar`, `divisible by ${p}`);
      return [
        ws("zr-b1", zw("Annahme", "Assumption"), zw("Womit beginnt der Widerspruchsbeweis?", "How does the proof by contradiction start?"),
          misch([["r", zw(`Annahme: $\\sqrt{${p}} = \\frac{a}{b}$ mit $a \\in \\mathbb{Z}$, $b \\in \\mathbb{N}$, vollständig gekürzt`, `Assume $\\sqrt{${p}} = \\frac{a}{b}$ with $a \\in \\mathbb{Z}$, $b \\in \\mathbb{N}$, fully reduced`)],
            ["f1", zw(`Annahme: $\\sqrt{${p}}$ ist irrational`, `Assume $\\sqrt{${p}}$ is irrational`)], ["f2", zw(`Wir tippen $\\sqrt{${p}}$ in den Taschenrechner`, `We type $\\sqrt{${p}}$ into a calculator`)]], a.id), "r",
          { fehler: [{ wahl: "f1", text: zw("Man nimmt das Gegenteil dessen an, was man zeigen will.", "You assume the opposite of what you want to show.") }, { wahl: "f2", text: zw("Ein Taschenrechner zeigt nur endlich viele Stellen – das beweist nichts.", "A calculator only shows finitely many digits – that proves nothing.") }],
            erkl: zw("Wir nehmen das Gegenteil an: √" + p + " ist ein vollständig gekürzter Bruch.", "We assume the opposite: √" + p + " is a fully reduced fraction.") }),
        ws("zr-b2", zw("Quadrieren", "Squaring"), zw(`Was folgt aus $\\sqrt{${p}} = \\frac{a}{b}$?`, `What follows from $\\sqrt{${p}} = \\frac{a}{b}$?`),
          misch([["r", `$a^2 = ${p}b^2$`], ["f1", `$a = ${p}b^2$`], ["f2", `$a^2 = ${p}b$`]], a.id + 1), "r",
          { fehler: [{ wahl: "f1", text: zw("Links wurde nicht quadriert.", "The left side was not squared.") }, { wahl: "f2", text: zw("Auch der Nenner b wird quadriert.", "The denominator b is squared too.") }],
            erkl: `$${p} = \\frac{a^2}{b^2} \\Rightarrow a^2 = ${p}b^2$` }),
        ws("zr-b3", zw("Folgerung für a", "Consequence for a"), zw(`$a^2 = ${p}b^2$. Was folgt für a?`, `$a^2 = ${p}b^2$. What follows for a?`),
          misch([["r", zw(`a² ist ${teilbar}, also auch a: $a = ${p}k$`, `a² is ${teilbar}, so a is too: $a = ${p}k$`)], ["f1", zw("a ist ungerade", "a is odd")], ["f2", zw(`b ist ${teilbar}`, `b is ${teilbar}`)]], a.id + 2), "r",
          { fehler: [{ wahl: "f2", text: zw("Über b wissen wir an dieser Stelle noch nichts – erst kommt a dran.", "We know nothing about b yet – a comes first.") }],
            erkl: zw(`Weil ${p} eine Primzahl ist: Teilt ${p} das Quadrat a², dann teilt ${p} auch a.`, `Because ${p} is prime: if ${p} divides a², then ${p} divides a.`) }),
        ws("zr-b4", zw("Einsetzen", "Substitute"), zw(`Setze $a = ${p}k$ in $a^2 = ${p}b^2$ ein. Was folgt?`, `Substitute $a = ${p}k$ into $a^2 = ${p}b^2$. What follows?`),
          misch([["r", zw(`$b^2 = ${p}k^2$, also ist auch b ${teilbar}`, `$b^2 = ${p}k^2$, so b is ${teilbar} too`)], ["f1", `$b^2 = k^2$`], ["f2", `$${p} = k^2$`]], a.id + 3), "r",
          { erkl: `$${p * p}k^2 = ${p}b^2 \\Rightarrow b^2 = ${p}k^2$` }),
        ws("zr-b5", zw("Widerspruch", "Contradiction"), zw("Wo steckt der Widerspruch?", "Where is the contradiction?"),
          misch([["r", zw(`a und b sind beide ${teilbar} – der Bruch war aber vollständig gekürzt.`, `a and b are both ${teilbar} – but the fraction was fully reduced.`)], ["f1", zw("a² wäre negativ.", "a² would be negative.")], ["f2", zw(`Es gibt keinen – $\\sqrt{${p}}$ ist doch rational.`, `There is none – $\\sqrt{${p}}$ is rational after all.`)]], a.id + 4), "r",
          { erkl: zw(`Also war die Annahme falsch: $\\sqrt{${p}}$ ist irrational. ∎`, `So the assumption was false: $\\sqrt{${p}}$ is irrational. ∎`) }),
      ];
    }
  }
}
const ggTq = (x, y) => (y ? ggTq(y, x % y) : Math.abs(x));
const rationalVon = (a) => (a.x.art === "q" ? a.x.q : q(0));

function text(a) {
  switch (a.art) {
    case "einordnen": return zw(`Ordne die Zahl $${a.tex}$ ein.`, `Classify the number $${a.tex}$.`);
    case "element": return zw("Liegt die Zahl im angegebenen Zahlenraum?", "Is the number in the given number space?");
    case "abgeschlossen": return zw(`Zwei Zahlen aus ${ZEICHEN[a.raum]} werden verrechnet.`, `Two numbers from ${ZEICHEN[a.raum]} are combined.`);
    case "rauswerfer": return zw(`Nur eine Rechnung verlässt ${ZEICHEN[a.raum]}.`, `Only one calculation leaves ${ZEICHEN[a.raum]}.`);
    case "gleichung": return zw("Manche Gleichungen brauchen einen größeren Zahlenraum.", "Some equations need a larger number space.");
    case "wahrfalsch": return zw("Entscheide und begründe für dich.", "Decide and justify it to yourself.");
    case "dezimal": return zw(`Zeige, dass $${a.tex}$ rational ist: Schreibe die Zahl als Bruch.`, `Show that $${a.tex}$ is rational: write it as a fraction.`);
    case "wurzel": return zw(`Untersuche $\\sqrt{${a.n}}$.`, `Examine $\\sqrt{${a.n}}$.`);
    default: return zw(`Beweise Schritt für Schritt: $\\sqrt{${a.p}}$ ist irrational.`, `Prove step by step: $\\sqrt{${a.p}}$ is irrational.`);
  }
}
const hilfe = (a) => hilfeKontext({
  id: `zahlenraeume-${a.art}`, aufgabe: "Zahlenräume natürliche ganze rationale reelle Zahlen abgeschlossen irrational Wurzel Widerspruchsbeweis",
  verstehen: [zw("Welche Zahl bzw. welcher Zahlenraum ist gemeint?", "Which number or number space is meant?")],
  ansatz: [zw("Erst ausrechnen bzw. vereinfachen, dann einordnen.", "Work out or simplify first, then classify.")],
  regel: [zw("ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ; ℚ = {p/q | p ∈ ℤ, q ∈ ℕ}; √n rational ⇔ n Quadratzahl", "ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ; ℚ = {p/q | p ∈ ℤ, q ∈ ℕ}; √n rational ⇔ n perfect square")],
  pruefen: [zw("Ein Gegenbeispiel genügt, um „immer“ zu widerlegen.", "One counterexample is enough to disprove “always”.")],
});

export function Zahlenraeume({ gehe }) {
  return (
    <ZweiModi werkzeug="zahlenraeume" titel={zw("Zahlenräume: von ℕ bis ℝ", "Number spaces: from ℕ to ℝ")}
      text={zw("Warum gibt es negative Zahlen, Brüche und Wurzeln? Weil jede neue Rechenart den alten Zahlenraum sprengt. Du gehst den Weg ℕ → ℤ → ℚ → ℝ selbst und erkennst am Ende jede Zahl.", "Why are there negative numbers, fractions and roots? Because every new operation bursts the old number space. You walk the path ℕ → ℤ → ℚ → ℝ yourself and can classify every number at the end.")}
      kurz={<p style={{ margin: 0 }}><MS s={zw("ℕ = {1, 2, 3, …}: abgeschlossen bzgl. + und ·. ℤ: zusätzlich −. ℚ = $\\{\\frac{p}{q} \\mid p \\in \\mathbb{Z}, q \\in \\mathbb{N}\\}$: zusätzlich : (nicht durch 0). ℝ: zusätzlich irrationale Zahlen wie $\\sqrt{2}$ und $\\pi$. Es gilt ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ.", "ℕ = {1, 2, 3, …}: closed under + and ·. ℤ: also −. ℚ = $\\{\\frac{p}{q} \\mid p \\in \\mathbb{Z}, q \\in \\mathbb{N}\\}$: also : (not by 0). ℝ: also irrational numbers like $\\sqrt{2}$ and $\\pi$. ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ.")} /></p>}
      entdecken={<Entdecken gehe={gehe} />}
      ueben={<UebenRahmen titel={TITEL} arten={ZR_ARTEN} neue={neue} schritte={schritte} text={text} hilfe={hilfe} />} />
  );
}
