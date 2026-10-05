/* ============================================================
   Analysis: Parabeln – alles über f(x) = ax² + bx + c
   · Scheitelpunkt  – Parabel einstellen, Normalform ↔ Scheitelform, Rechenweg
   · Scheitelform   – Übung in beide Richtungen mit gezielten Denkfehler-Rückmeldungen
   · Nullstellen    – Mitternachtsformel oder Satz von Vieta (umschaltbar)
   · Brennpunkt     – Formel, Strahl vom Brennpunkt, Tangente und Normale,
                      Spiegelung an der Normalen: Ausblick zur Ableitung (Scheinwerfer)
   Jedes Schaubild: beide Achsen im Maßstab 1 : 1, von −10 bis 10, Einheiten markiert.
   Alle Parabeln haben ihren Scheitel in [−5, 5] × [−5, 5].
   Die Mathematik steht in parabel.js (exakte Brüche).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useId, useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { Auswahl, GrosserKnopf, Rueck, Stufe, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { Aufklapp, ModusLeiste, Seite, SchrittFolge, minusZ, zt } from "./ui3.jsx";
import { q, qAdd, qDiv, qGleich, qMul, qNeg, qNull, qNum, qSub, qTex, qText } from "./rechnen2.js";
import {
  FENSTER, ausScheitel, brennpunkt, f as fVon, maxS, normalTex, nullstellen, parabel, scheitelTex,
  zufallParabel, zufallScheitelAufgabe, zufallVieta,
} from "./parabel.js";

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const wahl = (l) => l[Math.floor(Math.random() * l.length)];
const mischen = (l) => { const k = [...l]; for (let i = k.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [k[i], k[j]] = [k[j], k[i]]; } return k; };
let zaehler = 0;

/* ---------- kleine Textbausteine ---------- */
const neg = (x) => qNum(x) < 0;
const betrag = (x) => (neg(x) ? qNeg(x) : x);
const kl = (x) => (neg(x) ? `(${qTex(x)})` : qTex(x));                 // negative Zahlen in Klammern
const vz = (x) => (neg(x) ? "−" : "+");
const pre = (a) => (qGleich(a, q(1)) ? "" : qGleich(a, q(-1)) ? "−" : qTex(a));
const qt = (x) => minusZ(qText(x));
const sup2 = "²";
/* Scheitelform als reiner Text (für Auswahlknöpfe) */
function scheitelText(a, d, e) {
  const A = qGleich(a, q(1)) ? "" : qGleich(a, q(-1)) ? "−" : qNum(a) % 1 === 0 ? String(qNum(a)).replace("-", "−") : `(${qText(a)})`;
  const klam = qNull(d) ? "x" : `(x ${neg(d) ? "+" : "−"} ${qText(betrag(d))})`;
  const rest = qNull(e) ? "" : ` ${neg(e) ? "−" : "+"} ${qText(betrag(e))}`;
  return `${A}${klam}${sup2}${rest}`;
}
const fehlerListe = (korrekt, liste) => {
  const gesehen = [];
  return liste.filter((x) => {
    if (!isFinite(x.wert) || Math.abs(x.wert - korrekt) < 1e-9 || gesehen.some((g) => Math.abs(g - x.wert) < 1e-9)) return false;
    gesehen.push(x.wert); return true;
  });
};

/* ============================================================
   Schaubild: gleiche Einheit auf beiden Achsen (1 : 1), Fenster −10 … 10
   ============================================================ */
function ParabelBild({ kurven = [], punkte = [], linien = [], senkrechte = [], waagerechte = [], legende = [], beschr }) {
  const W = 380, L = 28, R = 12, T = 14, B = 26;
  const pw = W - L - R, H = T + pw + B, E = pw / (2 * FENSTER);          // E = Pixel je Einheit – für x UND y gleich
  const sx = (x) => L + (x + FENSTER) * E, sy = (y) => T + (FENSTER - y) * E;
  const ticks = Array.from({ length: 2 * FENSTER + 1 }, (_, i) => i - FENSTER);
  const klipp = useId().replace(/:/g, "k");
  const pfad = (fn) => {
    let d = "", an = false;
    for (let i = 0; i <= 500; i++) {
      const x = -FENSTER + (2 * FENSTER * i) / 500, y = fn(x);
      if (!isFinite(y) || Math.abs(y) > 60) { an = false; continue; }
      d += `${an ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`; an = true;
    }
    return d;
  };
  const kopf = (x2, y2, dx, dy, farbe) => {          // Pfeilspitze in Bildschirmrichtung (dx, −dy)
    const l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = -dy / l, g = 9, br = 4.2;
    const px = sx(x2), py = sy(y2);
    return <polygon points={`${px},${py} ${px - ux * g - uy * br},${py - uy * g + ux * br} ${px - ux * g + uy * br},${py - uy * g - ux * br}`} fill={farbe} />;
  };
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={beschr || zw("Schaubild mit gleich skalierten Achsen (1 : 1)", "Graph with equally scaled axes (1 : 1)")}
        style={{ width: "100%", display: "block", background: C.weiss, borderRadius: 14, border: `1px solid ${C.linie}` }}>
        <defs><clipPath id={klipp}><rect x={L} y={T} width={pw} height={pw} /></clipPath></defs>
        {ticks.map((v) => (
          <g key={`g${v}`}>
            <line x1={sx(v)} x2={sx(v)} y1={T} y2={T + pw} stroke={v % 5 === 0 ? "#D5DBE8" : "#EAEEF5"} strokeWidth="1" />
            <line y1={sy(v)} y2={sy(v)} x1={L} x2={L + pw} stroke={v % 5 === 0 ? "#D5DBE8" : "#EAEEF5"} strokeWidth="1" />
          </g>
        ))}
        <line x1={L} x2={L + pw} y1={sy(0)} y2={sy(0)} stroke={C.tinte} strokeWidth="1.4" />
        <line x1={sx(0)} x2={sx(0)} y1={T} y2={T + pw} stroke={C.tinte} strokeWidth="1.4" />
        {ticks.filter((v) => v !== 0).map((v) => (
          <g key={`t${v}`}>
            <line x1={sx(v)} x2={sx(v)} y1={sy(0) - 3} y2={sy(0) + 3} stroke={C.tinte} strokeWidth="1" />
            <line y1={sy(v)} y2={sy(v)} x1={sx(0) - 3} x2={sx(0) + 3} stroke={C.tinte} strokeWidth="1" />
            <text x={sx(v)} y={sy(0) + 14} fontSize="8.6" textAnchor="middle" fill={C.grau}>{String(v).replace("-", "−")}</text>
            <text x={sx(0) - 6} y={sy(v) + 3} fontSize="8.6" textAnchor="end" fill={C.grau}>{String(v).replace("-", "−")}</text>
          </g>
        ))}
        <text x={L + pw - 2} y={sy(0) - 6} fontSize="11" fontStyle="italic" fontWeight="700" textAnchor="end" fill={C.tinte}>x</text>
        <text x={sx(0) + 7} y={T + 10} fontSize="11" fontStyle="italic" fontWeight="700" fill={C.tinte}>y</text>
        <g clipPath={`url(#${klipp})`}>
          {senkrechte.map((s, i) => <line key={`s${i}`} x1={sx(s.x)} x2={sx(s.x)} y1={T} y2={T + pw} stroke={s.farbe || C.hellgrau} strokeWidth="1.5" strokeDasharray="6 4" />)}
          {waagerechte.map((w, i) => <line key={`w${i}`} x1={L} x2={L + pw} y1={sy(w.y)} y2={sy(w.y)} stroke={w.farbe || C.hellgrau} strokeWidth="1.5" strokeDasharray="6 4" />)}
          {kurven.map((k, i) => <path key={`k${i}`} d={pfad(k.f)} fill="none" stroke={k.farbe || C.see} strokeWidth="2.6" strokeLinejoin="round" />)}
          {linien.map((l, i) => {
            const [x1, y1] = l.von, [x2, y2] = l.nach, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
            const a = l.unendlich ? [x1 - (dx / len) * 60, y1 - (dy / len) * 60] : [x1, y1];
            const b = l.unendlich ? [x1 + (dx / len) * 60, y1 + (dy / len) * 60] : [x2, y2];
            return (
              <g key={`l${i}`}>
                <line x1={sx(a[0])} y1={sy(a[1])} x2={sx(b[0])} y2={sy(b[1])} stroke={l.farbe || C.tinte} strokeWidth={l.breite || 2} strokeDasharray={l.gestrichelt ? "7 5" : undefined} strokeLinecap="round" />
                {l.pfeil && kopf(x2, y2, dx, dy, l.farbe || C.tinte)}
              </g>
            );
          })}
          {punkte.map((p, i) => (
            <circle key={`p${i}`} cx={sx(p.x)} cy={sy(p.y)} r="5" fill={p.hohl ? C.weiss : p.farbe || C.tinte} stroke={p.hohl ? p.farbe || C.tinte : "#fff"} strokeWidth={p.hohl ? 2.2 : 1.6} />
          ))}
        </g>
        {punkte.filter((p) => p.name && Math.abs(p.x) <= FENSTER && Math.abs(p.y) <= FENSTER).map((p, i) => (
          <text key={`n${i}`} x={Math.max(L + 2, Math.min(L + pw - 4, sx(p.x) + (p.links ? -8 : 8)))} y={Math.max(T + 11, Math.min(T + pw - 3, sy(p.y) + (p.unten ? 16 : -8)))}
            fontSize="11.5" fontWeight="800" textAnchor={p.links ? "end" : "start"} fill={p.farbe || C.tinte} stroke="#fff" strokeWidth="3" paintOrder="stroke">{p.name}</text>
        ))}
      </svg>
      {legende.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 8, fontSize: 12, color: C.grau, fontWeight: 600 }}>
          {legende.map(([farbe, text, gestrichelt, punkt]) => (
            <span key={text} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {punkt
                ? <span style={{ width: 11, height: 11, borderRadius: 99, background: farbe, display: "inline-block" }} />
                : <span style={{ width: 20, height: 0, borderTop: `3px ${gestrichelt ? "dashed" : "solid"} ${farbe}`, display: "inline-block" }} />}
              {text}
            </span>
          ))}
        </div>
      )}
      <p style={{ fontSize: 11.5, color: C.hellgrau, margin: "6px 0 0" }}>{zw("Beide Achsen im Maßstab 1 : 1 – eine Einheit ist auf x- und y-Achse gleich lang.", "Both axes use a 1 : 1 scale – one unit is equally long on the x- and the y-axis.")}</p>
    </div>
  );
}

const Formel = ({ t, gross }) => <div style={{ fontSize: gross ? 19 : 16.5, color: C.tinte, margin: "4px 0", overflowX: "auto", whiteSpace: "nowrap" }}><M t={t} /></div>;
const Rechenschritt = ({ nr, titel, children }) => (
  <div style={{ ...karte, marginTop: 12, padding: 16 }}>
    <p style={{ ...kicker, color: C.see, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 22, height: 22, borderRadius: 99, background: C.see, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, letterSpacing: 0 }}>{nr}</span>{titel}
    </p>
    {children}
  </div>
);
const Text = ({ children }) => <p style={{ fontSize: 14, lineHeight: 1.65, color: C.tinte, margin: "4px 0" }}>{children}</p>;

/* ============================================================
   1  Scheitelpunkt
   ============================================================ */
const A_WAHL = [["-2", "−2"], ["-1", "−1"], ["-1/2", "−½"], ["1/2", "½"], ["1", "1"], ["2", "2"]];
const aVon = (id) => { const [z, n] = id.split("/"); return q(+z, n ? +n : 1); };

function Rechenweg({ p }) {
  const { a, b, c, d, e } = p;
  if (qNull(b)) return <Text>{zw("Hier ist b = 0: Die Parabel ist schon in Scheitelform, der Scheitel liegt auf der y-Achse bei S(0 | c).", "Here b = 0: the parabola is already in vertex form, its vertex lies on the y-axis at S(0 | c).")}</Text>;
  const pA = qDiv(b, a), half = qDiv(pA, q(2)), quad = qMul(half, half);
  const klam = `x ${vz(half)} ${qTex(betrag(half))}`;
  const cRest = qNull(c) ? "" : ` ${vz(c)} ${qTex(betrag(c))}`;
  const eins = qGleich(a, q(1));
  return (
    <>
      <Text><b>{zw("Weg 1 – Formeln", "Way 1 – formulas")}</b></Text>
      <Formel t={`d = −\\frac{b}{2a} = −\\frac{${qTex(b)}}{2 \\cdot ${kl(a)}} = ${qTex(d)}`} />
      <Formel t={`e = f(d) = f(${qTex(d)}) = ${qTex(e)}`} />
      <Text><b>{zw("Weg 2 – quadratische Ergänzung", "Way 2 – completing the square")}</b></Text>
      <Formel t={`f(x) = ${normalTex(p)}`} />
      {!eins && <Formel t={`= ${pre(a)}\\left(x^2 ${vz(pA)} ${qTex(betrag(pA))}x\\right)${cRest}`} />}
      <Formel t={`= ${pre(a)}\\left(\\left(${klam}\\right)^2 − ${qTex(quad)}\\right)${cRest}`} />
      <Formel t={`= ${pre(a)}\\left(${klam}\\right)^2 ${vz(e)} ${qTex(betrag(e))}`} />
      <Text>{zw("Die Zahl in der Klammer hat das umgekehrte Vorzeichen von d – darum ist der Scheitel", "The number in the bracket has the opposite sign of d – so the vertex is")} <b>S({qt(d)} | {qt(e)})</b>.</Text>
    </>
  );
}

function ScheitelErkunden() {
  const [aId, setAId] = useState("1");
  const [d, setD] = useState(2);
  const [e, setE] = useState(-3);
  const a = aVon(aId);
  const p = useMemo(() => ausScheitel(a, d, e), [aId, d, e]);
  const zufall = () => { setAId(wahl(A_WAHL)[0]); setD(rnd(-5, 5)); setE(rnd(-5, 5)); };
  return (
    <>
      <div style={karte}>
        <p style={kicker}>{zw("Stelle die Parabel ein", "Set up the parabola")}</p>
        <Text>{zw("Mit a drehst du die Öffnung und stauchst oder streckst, d schiebt nach rechts, e nach oben. Der Scheitel bleibt immer zwischen −5 und 5.", "a flips the opening and stretches or squashes, d shifts to the right, e upwards. The vertex always stays between −5 and 5.")}</Text>
        <div style={{ margin: "8px 0 12px" }}><Auswahl optionen={A_WAHL} wert={aId} setWert={setAId} label="a" /></div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center" }}>
          <Stufe wert={d} setWert={setD} min={-5} max={5} label="d" text="d" />
          <Stufe wert={e} setWert={setE} min={-5} max={5} label="e" text="e" />
        </div>
        <GrosserKnopf ghost onClick={zufall}>🎲 {zw("Zufällige Parabel", "Random parabola")}</GrosserKnopf>
      </div>

      <div style={{ ...karte, marginTop: 12 }}>
        <ParabelBild kurven={[{ f: fVon(p), farbe: C.see }]} senkrechte={[{ x: d }]}
          punkte={[{ x: d, y: e, farbe: C.flaggold, name: `S(${d}|${e})`.replace(/-/g, "−"), unten: qNum(a) < 0 ? false : true }]}
          legende={[[C.see, "f"], [C.hellgrau, zw("Symmetrieachse", "axis of symmetry"), true], [C.flaggold, zw("Scheitelpunkt", "vertex"), false, true]]} />
        <div style={{ marginTop: 12 }}>
          <Formel gross t={`f(x) = ${scheitelTex(a, d, e)}`} />
          <Formel gross t={`f(x) = ${normalTex(p)}`} />
          <Text>{zw("Scheitelpunkt", "Vertex")} <b>S({minusZ(d)} | {minusZ(e)})</b> · {qNum(a) > 0 ? zw("nach oben geöffnet (a > 0): Tiefpunkt", "opens upwards (a > 0): minimum") : zw("nach unten geöffnet (a < 0): Hochpunkt", "opens downwards (a < 0): maximum")}</Text>
        </div>
        <Aufklapp titel={zw("Von der Normalform zum Scheitelpunkt – so rechnest du", "From normal form to the vertex – how to calculate it")}>
          <Rechenweg p={p} />
        </Aufklapp>
      </div>
    </>
  );
}

/* ============================================================
   2  Scheitelform üben
   ============================================================ */
function hilfeForm(aufg, richtung) {
  const { p } = aufg;
  return hilfeKontext({
    id: `parabel-${richtung}-${normalTex(p)}`,
    aufgabe: "Parabel Scheitelpunkt Scheitelform Normalform",
    verstehen: richtung === "nf" ? [
      zw("Gesucht ist der Scheitelpunkt S(d | e) und danach die Form a(x − d)² + e.", "You need the vertex S(d | e) and then the form a(x − d)² + e."),
      zw("d ist die x-Koordinate des Scheitels, e die y-Koordinate. a ist die Zahl vor x² und bleibt gleich.", "d is the x-coordinate of the vertex, e the y-coordinate. a is the number in front of x² and stays the same."),
      zw("Die Parabel ist symmetrisch: Der Scheitel liegt genau in der Mitte zwischen zwei gleich hohen Punkten.", "The parabola is symmetric: the vertex lies exactly halfway between two points of equal height."),
    ] : [
      zw("Gesucht sind b und c in f(x) = ax² + bx + c – du multiplizierst die Scheitelform aus.", "You need b and c in f(x) = ax² + bx + c – expand the vertex form."),
      zw("Zuerst die binomische Formel: (x − d)² = x² − 2dx + d².", "First the binomial formula: (x − d)² = x² − 2dx + d²."),
      zw("Dann alles mit a multiplizieren und e dazuaddieren.", "Then multiply everything by a and add e."),
    ],
    ansatz: richtung === "nf" ? [
      zw("Welche Formel liefert d direkt aus a und b?", "Which formula gives d directly from a and b?"),
      "d = −b / (2a).",
      zw("Setze danach d in f ein: e = f(d).", "Then insert d into f: e = f(d)."),
    ] : [
      zw("Wie lautet (x − d)² ausmultipliziert?", "What is (x − d)² expanded?"),
      zw("a·(x² − 2dx + d²) + e = a·x² − 2ad·x + (a·d² + e).", "a·(x² − 2dx + d²) + e = a·x² − 2ad·x + (a·d² + e)."),
      "b = −2ad,  c = a·d² + e.",
    ],
    pruefen: [
      zw("Zeichne die Parabel im Schaubild: Liegt der Scheitel dort, wo du ihn berechnet hast?", "Look at the graph: is the vertex where you calculated it?"),
      zw("Vorzeichen: In der Klammer steht (x − d), bei positivem d also ein Minus.", "Signs: the bracket contains (x − d), so a minus for positive d."),
      zw("Setze x = 0 ein: Du musst c erhalten.", "Insert x = 0: you must get c."),
    ],
    regeln: [],
    grundlage: null,
    loesung: `S(${qText(p.d)} | ${qText(p.e)}),  f(x) = ${scheitelText(p.a, p.d, p.e)}`,
  });
}

function neueFormAufgabe(richtung) {
  if (richtung === "sf") { const t = zufallScheitelAufgabe(); return { ...t, id: ++zaehler }; }
  const t = Math.random() < 0.55 ? zufallScheitelAufgabe() : null;
  const p = t ? t.p : zufallParabel({ aListe: [1, -1, 2, -2], fall: "egal" });
  return { p, a: p.a, d: p.d, e: p.e, id: ++zaehler };
}

function formSchritte(aufg, richtung) {
  const { p, a, d, e, id } = aufg;
  const A = qNum(a), B = qNum(p.b), Cc = qNum(p.c), D = qNum(d), E = qNum(e);
  if (richtung === "sf") {
    return [
      { id: `${id}b`, typ: "zahl", titel: zw("Koeffizient b", "Coefficient b"), text: "b =", wert: B, wertText: qt(p.b),
        frage: zw("Multipliziere die Scheitelform aus. Welche Zahl steht vor dem x? (Binomische Formel!)", "Expand the vertex form. Which number stands in front of x? (Binomial formula!)"),
        fehler: fehlerListe(B, [
          { wert: -B, text: zw("Das Vorzeichen ist vertauscht: (x − d)² = x² − 2dx + d², also b = −2ad.", "The sign is flipped: (x − d)² = x² − 2dx + d², so b = −2ad.") },
          { wert: -A * D, text: zw("Der Faktor 2 aus der binomischen Formel fehlt: (x − d)² = x² − 2dx + d².", "The factor 2 from the binomial formula is missing: (x − d)² = x² − 2dx + d².") },
          { wert: -2 * D, text: zw("Das a vor der Klammer muss auch mit dem mittleren Term multipliziert werden.", "The a in front of the bracket must also be multiplied with the middle term.") },
        ]),
        hinweise: [zw("(x − d)² = x² − 2dx + d². Welche Zahl steht dort vor x?", "(x − d)² = x² − 2dx + d². Which number is in front of x?"), zw("Alles mit a multiplizieren: b = −2·a·d.", "Multiply everything by a: b = −2·a·d."), `b = −2 · ${kl(a)} · ${kl(d)}`],
        erklaerung: `b = −2·a·d = ${qt(p.b)}` },
      { id: `${id}c`, typ: "zahl", titel: zw("Konstante c", "Constant c"), text: "c =", wert: Cc, wertText: qt(p.c),
        frage: zw("Welche Zahl bleibt ohne x übrig? Denke an a·d² und an e.", "Which number is left without x? Think of a·d² and e."),
        fehler: fehlerListe(Cc, [
          { wert: D * D + E, text: zw("Das a vor der Klammer wirkt auch auf d²: c = a·d² + e.", "The a in front of the bracket also acts on d²: c = a·d² + e.") },
          { wert: A * D * D, text: zw("Die Verschiebung nach oben, e, kommt noch dazu: c = a·d² + e.", "The upward shift e still has to be added: c = a·d² + e.") },
          { wert: E, text: zw("e ist nur die y-Koordinate des Scheitels. Für c musst du d² mit a rechnen und e addieren.", "e is only the y-coordinate of the vertex. For c you need a·d² plus e.") },
        ]),
        hinweise: [zw("Setze x = 0 in die Scheitelform ein.", "Insert x = 0 into the vertex form."), "c = a·d² + e.", `c = ${kl(a)} · ${kl(d)}² + ${kl(e)}`],
        erklaerung: `c = a·d² + e = ${qt(p.c)}` },
    ];
  }
  /* Normalform → Scheitelform */
  const plain = scheitelText(a, d, e);
  const falschD = qNeg(d);
  const optionen = [["ok", plain], ["vz", scheitelText(a, falschD, e)], ["e", scheitelText(a, d, qNeg(e))],
    [qGleich(a, q(1)) ? "tausch" : "a", qGleich(a, q(1)) ? scheitelText(q(1), e, d) : scheitelText(q(1), d, e)]];
  const eindeutig = optionen.filter((o, i) => optionen.findIndex((x) => x[1] === o[1]) === i);
  const mitFalsch = eindeutig.length >= 3 ? eindeutig : [["ok", plain], ["vz", scheitelText(a, falschD, e)], ["a2", scheitelText(qNeg(a), d, e)]];
  return [
    { id: `${id}d`, typ: "zahl", titel: zw("x-Koordinate des Scheitels", "x-coordinate of the vertex"), text: "d =", wert: D, wertText: qt(d),
      frage: zw("Berechne d = −b / (2a).", "Calculate d = −b / (2a)."),
      fehler: fehlerListe(D, [
        { wert: -D, text: zw("Vorzeichen: d = −b/(2a) – vor dem Bruch steht ein Minus.", "Sign: d = −b/(2a) – there is a minus in front of the fraction.") },
        { wert: -B / A, text: zw("Im Nenner fehlt die 2: d = −b/(2a).", "The 2 in the denominator is missing: d = −b/(2a).") },
        { wert: -B / 2, text: zw("Du musst auch durch a teilen: d = −b/(2a).", "You also have to divide by a: d = −b/(2a).") },
      ]),
      hinweise: [zw("Lies a und b aus f(x) = ax² + bx + c ab.", "Read a and b from f(x) = ax² + bx + c."), "d = −b / (2a).", `d = −${kl(p.b)} / (2 · ${kl(a)})`],
      erklaerung: `d = −b/(2a) = ${qt(d)}` },
    { id: `${id}e`, typ: "zahl", titel: zw("y-Koordinate des Scheitels", "y-coordinate of the vertex"), text: "e =", wert: E, wertText: qt(e),
      frage: zw("Setze d in die Funktion ein: e = f(d).", "Insert d into the function: e = f(d)."),
      fehler: fehlerListe(E, [
        { wert: Cc, text: zw("c ist der y-Achsenabschnitt (bei x = 0), nicht der Scheitel. Setze d ein.", "c is the y-intercept (at x = 0), not the vertex. Insert d.") },
        { wert: A * D * D + B * (-D) + Cc, text: zw("Beim Einsetzen von d ist das Vorzeichen verrutscht – setze genau d ein, nicht −d.", "A sign slipped while inserting d – insert exactly d, not −d.") },
      ]),
      hinweise: [zw("Rechne f(d) = a·d² + b·d + c mit deinem d aus.", "Calculate f(d) = a·d² + b·d + c with your d."), zw("Achte auf Klammern bei negativem d.", "Use brackets for a negative d."), `f(${qt(d)}) = ${kl(a)}·${kl(d)}² + ${kl(p.b)}·${kl(d)} + ${kl(p.c)}`],
      erklaerung: `e = f(d) = ${qt(e)}` },
    { id: `${id}f`, typ: "wahl", titel: zw("Scheitelform", "Vertex form"), optionen: mischen(mitFalsch), richtig: "ok",
      frage: zw("Welche Scheitelform gehört zu f?", "Which vertex form belongs to f?"),
      fehler: [
        { wahl: "vz", text: zw("In der Klammer steht (x − d): Für d > 0 ist das ein Minus, die Parabel wandert nach rechts.", "The bracket contains (x − d): for d > 0 that is a minus, the parabola moves to the right.") },
        { wahl: "e", text: zw("e ist die y-Koordinate und wird mit eigenem Vorzeichen addiert.", "e is the y-coordinate and is added with its own sign.") },
        { wahl: "a", text: zw("Der Faktor a vor der Klammer bleibt erhalten – er bestimmt Öffnung und Form.", "The factor a in front of the bracket stays – it determines opening and shape.") },
        { wahl: "tausch", text: zw("d gehört in die Klammer, e dahinter.", "d goes into the bracket, e after it.") },
        { wahl: "a2", text: zw("Prüfe das Vorzeichen von a: Es ist dasselbe wie in der Normalform.", "Check the sign of a: it is the same as in the normal form.") },
      ],
      hinweise: [zw("Die Form ist a·(x − d)² + e.", "The form is a·(x − d)² + e."), zw("Setze a, d und e aus deinen Ergebnissen ein.", "Insert a, d and e from your results."), plain],
      erklaerung: `f(x) = ${plain}` },
  ];
}

function ScheitelUebung() {
  const [richtung, setRichtung] = useState("nf");
  const [aufg, setAufg] = useState(() => neueFormAufgabe("nf"));
  const [stand, setStand] = useState(0);
  const neu = (r = richtung) => { setAufg(neueFormAufgabe(r)); setStand(0); };
  const wechsel = (r) => { setRichtung(r); neu(r); };
  const schritte = useMemo(() => formSchritte(aufg, richtung), [aufg, richtung]);
  const { p, a, d, e } = aufg;
  const gegeben = richtung === "nf" ? `f(x) = ${normalTex(p)}` : `f(x) = ${scheitelTex(a, d, e)}`;
  const vertexSichtbar = richtung === "sf" || stand >= 2;
  return (
    <>
      <div style={karte}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
          <p style={kicker}>{zw("Übung", "Exercise")}</p>
          <IchHaengeFest kontext={hilfeForm(aufg, richtung)} />
        </div>
        <Auswahl optionen={[["nf", zw("Normalform → Scheitelform", "Normal form → vertex form")], ["sf", zw("Scheitelform → Normalform", "Vertex form → normal form")]]} wert={richtung} setWert={wechsel} label={zw("Richtung", "Direction")} />
        <Text>{richtung === "nf"
          ? zw("Bestimme den Scheitelpunkt und schreibe f in Scheitelform. Rechne auf Papier und gib die Ergebnisse ein.", "Find the vertex and write f in vertex form. Calculate on paper and enter the results.")
          : zw("Multipliziere die Scheitelform aus und gib b und c der Normalform ax² + bx + c ein.", "Expand the vertex form and enter b and c of the normal form ax² + bx + c.")}</Text>
        <div style={{ background: C.sand, borderRadius: 12, padding: "6px 12px", margin: "8px 0" }}><Formel gross t={gegeben} /></div>
        <SchrittFolge key={`${aufg.id}-${richtung}`} schritte={schritte} stand={stand} setStand={setStand}
          fertigText={<>{zw("Geschafft: ", "Done: ")}<M t={`f(x) = ${normalTex(p)} = ${scheitelTex(a, d, e)}`} />{" · "}<b>S({qt(d)} | {qt(e)})</b></>} />
        <GrosserKnopf gold onClick={() => neu()}>{zw("Neue Aufgabe", "New exercise")}</GrosserKnopf>
      </div>
      <div style={{ ...karte, marginTop: 12 }}>
        <ParabelBild kurven={[{ f: fVon(p), farbe: C.see }]} senkrechte={vertexSichtbar ? [{ x: qNum(d) }] : []}
          punkte={vertexSichtbar ? [{ x: qNum(d), y: qNum(e), farbe: C.flaggold, name: `S(${qt(d)}|${qt(e)})` }] : []}
          legende={vertexSichtbar ? [[C.see, "f"], [C.flaggold, zw("Scheitelpunkt", "vertex"), false, true]] : [[C.see, "f"]]} />
        {!vertexSichtbar && <Text>{zw("Der Scheitelpunkt erscheint, sobald du d und e gefunden hast.", "The vertex appears as soon as you have found d and e.")}</Text>}
      </div>
    </>
  );
}

/* ============================================================
   3  Nullstellen – Mitternachtsformel oder Vieta
   ============================================================ */
function neueNullAufgabe(verf) {
  if (verf === "vieta") { const v = zufallVieta(); return { verf, id: ++zaehler, p: v.p, art: "zwei", r1: v.r1, r2: v.r2 }; }
  const r = Math.random();
  const art = r < 0.12 ? "keine" : r < 0.26 ? "eine" : "zwei";
  const exakt = art === "zwei" ? Math.random() < 0.65 : false;
  return { verf, id: ++zaehler, p: zufallParabel({ fall: art, exakt }), art };
}

const faktorTex = (a, r1, r2) => {
  const f1 = (r) => (r === 0 ? "x" : `(x ${r < 0 ? "+" : "−"} ${Math.abs(r)})`);
  return `${qGleich(a, q(1)) ? "" : qGleich(a, q(-1)) ? "−" : qTex(a)}${f1(r1)}${f1(r2)}`;
};

function nullSchritte(aufg) {
  const { p, art, id } = aufg;
  const A = qNum(p.a), B = qNum(p.b), Cc = qNum(p.c), D = qNum(p.D);
  const n = nullstellen(p);
  const tol = (x) => (Number.isInteger(Math.round(x * 1e9) / 1e9) ? 1e-9 : 0.006);
  const wz = (x, i) => (n.exakt ? qt(n.exakt[i]) : zt(x, 2));
  const s = [];
  if (aufg.verf === "vieta") {
    const { r1, r2 } = aufg;
    const P = qDiv(p.b, p.a), Q = qDiv(p.c, p.a);
    if (!qGleich(p.a, q(1))) {
      s.push({ id: `${id}p`, typ: "zahl", titel: zw("Gleichung normieren: p", "Normalise: p"), text: "p =", wert: qNum(P), wertText: qt(P),
        frage: zw("Teile die Gleichung durch a, damit sie die Form x² + px + q = 0 hat. Wie groß ist p?", "Divide the equation by a so it has the form x² + px + q = 0. What is p?"),
        fehler: fehlerListe(qNum(P), [{ wert: B, text: zw("Auch b muss durch a geteilt werden: p = b/a.", "b must be divided by a as well: p = b/a.") }]),
        hinweise: [zw("Teile jeden Summanden der Gleichung ax² + bx + c = 0 durch a.", "Divide every term of ax² + bx + c = 0 by a."), "p = b / a", `p = ${qt(p.b)} / ${kl(p.a)}`], erklaerung: `p = b/a = ${qt(P)}` });
      s.push({ id: `${id}q`, typ: "zahl", titel: zw("Gleichung normieren: q", "Normalise: q"), text: "q =", wert: qNum(Q), wertText: qt(Q),
        frage: zw("Und q?", "And q?"),
        fehler: fehlerListe(qNum(Q), [{ wert: Cc, text: zw("Auch c muss durch a geteilt werden: q = c/a.", "c must be divided by a as well: q = c/a.") }]),
        hinweise: [zw("Wie bei p: durch a teilen.", "As with p: divide by a."), "q = c / a", `q = ${qt(p.c)} / ${kl(p.a)}`], erklaerung: `q = c/a = ${qt(Q)}` });
    }
    s.push({ id: `${id}sum`, typ: "zahl", titel: zw("Summe der Nullstellen", "Sum of the roots"), text: "x₁ + x₂ =", wert: -qNum(P), wertText: qt(qNeg(P)),
      frage: zw("Nach Vieta gilt x₁ + x₂ = −p. Wie groß ist die Summe?", "By Vieta, x₁ + x₂ = −p. What is the sum?"),
      fehler: fehlerListe(-qNum(P), [{ wert: qNum(P), text: zw("Vorzeichen: x₁ + x₂ = −p (mit Minus).", "Sign: x₁ + x₂ = −p (with a minus).") }]),
      hinweise: [zw("Satz von Vieta: x₁ + x₂ = −p und x₁ · x₂ = q.", "Vieta's theorem: x₁ + x₂ = −p and x₁ · x₂ = q."), zw("Setze dein p ein.", "Insert your p."), `−(${qt(P)})`], erklaerung: `x₁ + x₂ = −p = ${qt(qNeg(P))}` });
    s.push({ id: `${id}prod`, typ: "zahl", titel: zw("Produkt der Nullstellen", "Product of the roots"), text: "x₁ · x₂ =", wert: qNum(Q), wertText: qt(Q),
      frage: zw("Nach Vieta gilt x₁ · x₂ = q.", "By Vieta, x₁ · x₂ = q."),
      fehler: fehlerListe(qNum(Q), [{ wert: -qNum(Q), text: zw("Das Produkt ist +q, ohne Minus.", "The product is +q, without a minus.") }]),
      hinweise: [zw("Das Produkt ist einfach q.", "The product is simply q."), zw("Setze dein q ein.", "Insert your q."), qt(Q)], erklaerung: `x₁ · x₂ = q = ${qt(Q)}` });
    s.push({ id: `${id}r1`, typ: "zahl", titel: zw("Kleinere Nullstelle", "Smaller root"), text: "x₁ =", wert: r1, wertText: String(r1).replace("-", "−"),
      frage: zw("Suche zwei ganze Zahlen mit dieser Summe und diesem Produkt. Wie heißt die kleinere?", "Find two integers with this sum and product. What is the smaller one?"),
      fehler: fehlerListe(r1, [{ wert: r2, text: zw("Das ist die größere – hier ist die kleinere gefragt.", "That is the larger one – here the smaller one is asked.") }, { wert: -r1, text: zw("Vorzeichen prüfen: Die Summe muss −p ergeben.", "Check the sign: the sum must equal −p.") }]),
      hinweise: [zw("Zerlege das Produkt in Faktorpaare – auch negative.", "Split the product into factor pairs – negative ones too."), zw("Welches Paar hat die richtige Summe?", "Which pair has the right sum?"), `${r1}  ·  ${r2}`],
      erklaerung: `x₁ = ${r1}` });
    s.push({ id: `${id}r2`, typ: "zahl", titel: zw("Größere Nullstelle", "Larger root"), text: "x₂ =", wert: r2, wertText: String(r2).replace("-", "−"),
      frage: zw("Und die größere?", "And the larger one?"),
      fehler: fehlerListe(r2, [{ wert: r1, text: zw("Das ist die kleinere.", "That is the smaller one.") }, { wert: -r2, text: zw("Vorzeichen prüfen.", "Check the sign.") }]),
      hinweise: [zw("Summe minus x₁.", "Sum minus x₁."), zw("Probe: x₁ + x₂ = −p und x₁ · x₂ = q.", "Check: x₁ + x₂ = −p and x₁ · x₂ = q."), `${r2}`], erklaerung: `x₂ = ${r2}` });
    return s;
  }
  /* Mitternachtsformel */
  s.push({ id: `${id}D`, typ: "zahl", titel: zw("Diskriminante", "Discriminant"), text: "D =", wert: D, wertText: qt(p.D),
    frage: zw("Berechne D = b² − 4ac.", "Calculate D = b² − 4ac."),
    fehler: fehlerListe(D, [
      { wert: B * B + 4 * A * Cc, text: zw("Vorzeichen: D = b² − 4ac – das Minus gehört vor 4ac, dort stecken die Vorzeichen von a und c.", "Sign: D = b² − 4ac – the minus belongs in front of 4ac, which contains the signs of a and c.") },
      { wert: B - 4 * A * Cc, text: zw("Das b muss quadriert werden: b².", "b has to be squared: b².") },
      { wert: B * B - A * Cc, text: zw("Der Faktor 4 fehlt: D = b² − 4ac.", "The factor 4 is missing: D = b² − 4ac.") },
      { wert: B * B - 2 * A * Cc, text: zw("Es heißt 4ac, nicht 2ac.", "It is 4ac, not 2ac.") },
    ]),
    hinweise: [zw("Lies a, b und c mit Vorzeichen ab.", "Read a, b and c with their signs."), zw("Setze in D = b² − 4·a·c ein, negative Zahlen in Klammern.", "Insert into D = b² − 4·a·c, negative numbers in brackets."), `D = ${kl(p.b)}² − 4 · ${kl(p.a)} · ${kl(p.c)}`],
    erklaerung: `D = ${kl(p.b)}² − 4·${kl(p.a)}·${kl(p.c)} = ${qt(p.D)}` });
  s.push({ id: `${id}Z`, typ: "wahl", titel: zw("Anzahl der Nullstellen", "Number of roots"), richtig: art,
    optionen: [["zwei", zw("Zwei Nullstellen (D > 0)", "Two roots (D > 0)")], ["eine", zw("Genau eine (D = 0)", "Exactly one (D = 0)")], ["keine", zw("Keine (D < 0)", "None (D < 0)")]],
    frage: zw("Was sagt D über die Nullstellen?", "What does D tell you about the roots?"),
    fehler: [{ wahl: "zwei", text: zw("Bei D > 0 gibt es zwei Lösungen – prüfe das Vorzeichen deiner Diskriminante.", "D > 0 gives two solutions – check the sign of your discriminant.") },
      { wahl: "eine", text: zw("Genau eine Nullstelle gibt es nur bei D = 0: Die Parabel berührt die x-Achse im Scheitel.", "Exactly one root only occurs for D = 0: the parabola touches the x-axis at its vertex.") },
      { wahl: "keine", text: zw("Keine Nullstelle gibt es nur bei D < 0. Vergleiche mit deinem D.", "No root only occurs for D < 0. Compare with your D.") }],
    hinweise: [zw("Unter der Wurzel steht D. Wann gibt es eine Wurzel?", "D is under the square root. When does a root exist?"), zw("D > 0: zwei, D = 0: eine, D < 0: keine.", "D > 0: two, D = 0: one, D < 0: none."), `D = ${qt(p.D)}`],
    erklaerung: art === "keine" ? zw("D < 0: Die Wurzel existiert nicht, die Parabel schneidet die x-Achse nicht.", "D < 0: the square root does not exist, the parabola does not meet the x-axis.") : art === "eine" ? zw("D = 0: eine doppelte Nullstelle, die Parabel berührt die x-Achse im Scheitel.", "D = 0: one double root, the parabola touches the x-axis at its vertex.") : zw("D > 0: zwei verschiedene Nullstellen.", "D > 0: two different roots.") });
  if (art === "eine") {
    const x0 = n.xs[0];
    s.push({ id: `${id}x0`, typ: "zahl", titel: zw("Doppelte Nullstelle", "Double root"), text: "x₀ =", wert: x0, toleranz: tol(x0), wertText: wz(x0, 0),
      frage: zw("Für D = 0 fällt die Wurzel weg: x₀ = −b/(2a).", "For D = 0 the root disappears: x₀ = −b/(2a)."),
      fehler: fehlerListe(x0, [{ wert: -x0, text: zw("Vorzeichen: im Zähler steht −b.", "Sign: the numerator is −b.") }]),
      hinweise: [zw("Setze D = 0 in die Mitternachtsformel ein.", "Insert D = 0 into the quadratic formula."), "x₀ = −b / (2a)", `x₀ = −${kl(p.b)} / (2 · ${kl(p.a)})`], erklaerung: `x₀ = −b/(2a) = ${wz(x0, 0)}` });
  } else if (art === "zwei") {
    [0, 1].forEach((i) => {
      const x = n.xs[i], andere = n.xs[1 - i];
      s.push({ id: `${id}x${i}`, typ: "zahl", titel: zw(i === 0 ? "Kleinere Nullstelle" : "Größere Nullstelle", i === 0 ? "Smaller root" : "Larger root"), text: `x${i === 0 ? "₁" : "₂"} =`,
        wert: x, toleranz: n.exakt ? tol(x) : 0.011, wertText: wz(x, i), rundung: n.exakt ? (Number.isInteger(x) ? null : zw("Bruch oder Dezimalzahl mit drei Stellen.", "Fraction or decimal with three places.")) : zw("Auf zwei Nachkommastellen runden.", "Round to two decimal places."),
        frage: zw("Setze in x = (−b ± √D) / (2a) ein: Die beiden Vorzeichen vor der Wurzel liefern die beiden Nullstellen.", "Insert into x = (−b ± √D) / (2a): the two signs in front of the root give the two roots."),
        fehler: fehlerListe(x, [{ wert: -x, text: zw("Vorzeichen: im Zähler steht −b.", "Sign: the numerator is −b.") }, { wert: andere, text: zw("Das ist die andere Lösung – hier ist die andere Größe gefragt.", "That is the other solution – the other one is asked here.") },
          { wert: (-B + (i === 0 ? -1 : 1) * Math.sqrt(D)) / A, text: zw("Im Nenner steht 2a, nicht nur a.", "The denominator is 2a, not just a.") }]),
        hinweise: [zw("Die Mitternachtsformel steht unten unter „Kurz erklärt“.", "The quadratic formula is shown below under “In short”."), zw("Wurzel aus D, dann −b ± Wurzel, dann durch 2a.", "Square root of D, then −b ± root, then divide by 2a."), `x = (${qt(qNeg(p.b))} ± √${qt(p.D)}) / ${qt(qMul(q(2), p.a))}`],
        erklaerung: `x${i === 0 ? "₁" : "₂"} = ${wz(x, i)}` });
    });
  }
  return s;
}

function hilfeNull(aufg) {
  const { p } = aufg;
  return hilfeKontext({
    id: `nullstellen-${aufg.verf}-${normalTex(p)}`,
    aufgabe: "Nullstellen quadratische Gleichung Mitternachtsformel Vieta",
    verstehen: [zw("Gesucht sind alle x mit f(x) = 0 – die Schnittpunkte mit der x-Achse.", "You need all x with f(x) = 0 – the intersections with the x-axis."),
      zw("Eine Parabel hat zwei, eine oder keine Nullstelle.", "A parabola has two, one or no roots."), zw("Das Schaubild zeigt dir, ob deine Anzahl plausibel ist.", "The graph shows whether your number is plausible.")],
    ansatz: aufg.verf === "vieta"
      ? [zw("Teile erst durch a, damit vorn x² steht.", "First divide by a so that x² stands alone."), "x₁ + x₂ = −p,  x₁ · x₂ = q.", zw("Suche ganze Zahlen mit diesem Produkt und dieser Summe.", "Find integers with this product and this sum.")]
      : [zw("Berechne zuerst D = b² − 4ac.", "First calculate D = b² − 4ac."), "x = (−b ± √D) / (2a).", zw("D < 0 heißt: keine Nullstelle.", "D < 0 means: no root.")],
    pruefen: [zw("Setze deine Nullstelle in f ein: Es muss 0 herauskommen.", "Insert your root into f: you must get 0."), zw("Liegt sie im Schaubild auf der x-Achse?", "Does it lie on the x-axis in the graph?"), zw("Die Nullstellen liegen symmetrisch zum Scheitel.", "The roots lie symmetrically to the vertex.")],
    regeln: [], grundlage: null, loesung: null,
  });
}

function NullstellenSeite() {
  const [verf, setVerf] = useState("mitternacht");
  const [aufg, setAufg] = useState(() => neueNullAufgabe("mitternacht"));
  const [stand, setStand] = useState(0);
  const neu = (v = verf) => { setAufg(neueNullAufgabe(v)); setStand(0); };
  const wechsel = (v) => { setVerf(v); neu(v); };
  const schritte = useMemo(() => nullSchritte(aufg), [aufg]);
  const { p } = aufg;
  const n = nullstellen(p);
  const fertig = stand >= schritte.length;
  const probe = (() => {
    if (aufg.verf === "vieta") {
      return <>{zw("Probe: ", "Check: ")}<M t={`x_1 + x_2 = ${aufg.r1} + ${kl(q(aufg.r2))} = ${aufg.r1 + aufg.r2} = −p`} />{" · "}<M t={`x_1 \\cdot x_2 = ${kl(q(aufg.r1))} \\cdot ${kl(q(aufg.r2))} = ${aufg.r1 * aufg.r2} = q`} /><br /><M t={`f(x) = ${faktorTex(p.a, aufg.r1, aufg.r2)}`} /></>;
    }
    if (n.anzahl === 2 && n.exakt) {
      const s1 = qAdd(n.exakt[0], n.exakt[1]), pr = qMul(n.exakt[0], n.exakt[1]);
      return <>{zw("Probe mit Vieta: ", "Check with Vieta: ")}<M t={`x_1 + x_2 = ${qTex(s1)} = −\\frac{b}{a}`} />{" · "}<M t={`x_1 \\cdot x_2 = ${qTex(pr)} = \\frac{c}{a}`} /></>;
    }
    if (n.anzahl === 0) return zw("Die Parabel schneidet die x-Achse nicht – es gibt keine reelle Nullstelle.", "The parabola does not meet the x-axis – there is no real root.");
    if (n.anzahl === 1) return zw("Die Parabel berührt die x-Achse genau im Scheitel.", "The parabola touches the x-axis exactly at its vertex.");
    return zw("Fertig.", "Done.");
  })();
  const roots = fertig ? n.xs.map((x, i) => ({ x, y: 0, farbe: C.gruen, name: n.anzahl === 1 ? "N" : `N${i === 0 ? "₁" : "₂"}`, links: n.anzahl === 2 && i === 0, unten: true })) : [];
  return (
    <>
      <div style={karte}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
          <p style={kicker}>{zw("Nullstellen bestimmen", "Find the roots")}</p>
          <IchHaengeFest kontext={hilfeNull(aufg)} />
        </div>
        <Auswahl optionen={[["mitternacht", zw("Mitternachtsformel", "Quadratic formula")], ["vieta", zw("Satz von Vieta", "Vieta's theorem")]]} wert={verf} setWert={wechsel} label={zw("Verfahren", "Method")} />
        <Text>{verf === "vieta"
          ? zw("Vieta ist der schnelle Weg, wenn die Nullstellen ganze Zahlen sind: Summe und Produkt verraten sie.", "Vieta is the quick way when the roots are integers: sum and product reveal them.")
          : zw("Die Mitternachtsformel funktioniert immer – D verrät vorher, wie viele Nullstellen es gibt.", "The quadratic formula always works – D tells you beforehand how many roots there are.")}</Text>
        <div style={{ background: C.sand, borderRadius: 12, padding: "6px 12px", margin: "8px 0" }}>
          <Formel gross t={`f(x) = ${normalTex(p)}`} />
          <div style={{ fontSize: 13, color: C.grau }}>a = {qt(p.a)}, b = {qt(p.b)}, c = {qt(p.c)}</div>
        </div>
        <SchrittFolge key={aufg.id} schritte={schritte} stand={stand} setStand={setStand} fertigText={probe} />
        <GrosserKnopf gold onClick={() => neu()}>{zw("Neue Aufgabe", "New exercise")}</GrosserKnopf>
        <Aufklapp titel={zw("Kurz erklärt", "In short")}>
          {verf === "vieta" ? (
            <>
              <Text>{zw("Hat die Gleichung die Form x² + px + q = 0 und die Nullstellen x₁, x₂, dann gilt:", "If the equation has the form x² + px + q = 0 and the roots x₁, x₂, then:")}</Text>
              <Formel t="x_1 + x_2 = −p \quad\text{und}\quad x_1 \cdot x_2 = q" />
              <Text>{zw("Gilt a ≠ 1, teile zuerst durch a. Dann suchst du ganze Zahlen mit dem Produkt q und der Summe −p.", "If a ≠ 1, divide by a first. Then look for integers with product q and sum −p.")}</Text>
            </>
          ) : (
            <>
              <Formel t="x_{1,2} = \frac{−b \pm \sqrt{b^2 − 4ac}}{2a}" />
              <Text>{zw("Unter der Wurzel steht die Diskriminante D = b² − 4ac: D > 0 zwei Nullstellen, D = 0 eine, D < 0 keine.", "Under the root is the discriminant D = b² − 4ac: D > 0 two roots, D = 0 one, D < 0 none.")}</Text>
            </>
          )}
        </Aufklapp>
      </div>
      <div style={{ ...karte, marginTop: 12 }}>
        <ParabelBild kurven={[{ f: fVon(p), farbe: C.see }]}
          punkte={[{ x: qNum(p.d), y: qNum(p.e), farbe: C.flaggold, hohl: true, name: "S", unten: qNum(p.a) < 0 ? false : true }, ...roots]}
          legende={[[C.see, "f"], [C.flaggold, zw("Scheitelpunkt", "vertex"), false, true], ...(fertig && n.anzahl > 0 ? [[C.gruen, zw("Nullstellen", "roots"), false, true]] : [])]} />
        {!fertig && <Text>{zw("Die Nullstellen erscheinen im Schaubild, sobald du sie gefunden hast.", "The roots appear in the graph as soon as you have found them.")}</Text>}
      </div>
    </>
  );
}

/* ============================================================
   4  Brennpunkt – Ausblick zur Ableitung
   ============================================================ */
const A_BRENN = [["1/4", "¼"], ["1/2", "½"], ["1", "1"], ["2", "2"]];
const vTex = (v) => `(${qTex(v.x)} \\,|\\, ${qTex(v.y)})`;

function BrennpunktSeite() {
  const [aId, setAId] = useState("1/2");
  const [d, setD] = useState(-1);
  const [e, setE] = useState(-2);
  const [s, setS] = useState(2);
  const a = aVon(aId);
  const mx = maxS(a, q(d), q(e));
  const sK = Math.max(-mx, Math.min(mx, s));
  const u = d + sK;
  const b = useMemo(() => brennpunkt(a, d, e, u), [aId, d, e, u]);
  const p = useMemo(() => ausScheitel(a, d, e), [aId, d, e]);
  const zufall = () => {
    const na = wahl(A_BRENN)[0], nd = rnd(-5, 5), ne = rnd(-5, 4), m2 = maxS(aVon(na), q(nd), q(ne));
    setAId(na); setD(nd); setE(ne); setS(m2 === 0 ? 0 : rnd(-m2, m2));
  };
  const yP = qNum(b.P.y), Fy = qNum(b.F.y);
  const mN = qNum(b.m);
  const tText = `y = ${qNull(b.m) ? "" : `${qTex(b.m)} \\cdot x`}${qNull(b.m) ? qTex(b.t0) : qNull(b.t0) ? "" : ` ${vz(b.t0)} ${qTex(betrag(b.t0))}`}`;
  const nText = b.nQ ? `y = ${qTex(b.nQ)} \\cdot x${qNull(b.n0) ? "" : ` ${vz(b.n0)} ${qTex(betrag(b.n0))}`}` : `x = ${qTex(b.P.x)}`;
  return (
    <>
      <div style={karte}>
        <p style={kicker}>{zw("Parabel und Lichtpunkt wählen", "Choose parabola and point")}</p>
        <Text>{zw("Eine Lampe im Brennpunkt F: Jeder Strahl, der von F auf die Parabel trifft, wird so gespiegelt, dass er parallel zur Symmetrieachse nach oben läuft – so funktioniert ein Scheinwerfer.", "A lamp at the focus F: every ray from F that hits the parabola is reflected so that it travels upwards, parallel to the axis of symmetry – this is how a headlight works.")}</Text>
        <div style={{ margin: "8px 0 12px" }}><Auswahl optionen={A_BRENN} wert={aId} setWert={setAId} label="a" /></div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
          <Stufe wert={d} setWert={setD} min={-5} max={5} label="d" text="d" />
          <Stufe wert={e} setWert={setE} min={-5} max={5} label="e" text="e" />
          <Stufe wert={sK} setWert={setS} min={-mx} max={mx} label={zw("Abstand von P zur Achse", "Distance of P from the axis")} text="P" />
        </div>
        <GrosserKnopf ghost onClick={zufall}>🎲 {zw("Zufällige Parabel und Punkt", "Random parabola and point")}</GrosserKnopf>
      </div>

      <div style={{ ...karte, marginTop: 12 }}>
        <ParabelBild kurven={[{ f: fVon(p), farbe: C.see }]}
          senkrechte={[{ x: d }]} waagerechte={[{ y: qNum(b.leit), farbe: C.signal }]}
          linien={[
            { von: [u, yP], nach: [u + 1, yP + mN], farbe: C.see, gestrichelt: true, unendlich: true, breite: 1.8 },
            ...(b.nQ ? [{ von: [u, yP], nach: [u + 1, yP + qNum(b.nQ)], farbe: C.grau, gestrichelt: true, unendlich: true, breite: 1.8 }]
              : [{ von: [u, yP], nach: [u, yP + 1], farbe: C.grau, gestrichelt: true, unendlich: true, breite: 1.8 }]),
            { von: [d, Fy], nach: [u, yP], farbe: C.gruen, pfeil: true, breite: 2.6 },
            { von: [u, yP], nach: [u, FENSTER - 0.2], farbe: C.goldWarm, pfeil: true, breite: 2.8 },
          ]}
          punkte={[
            { x: d, y: Fy, farbe: C.gruen, name: `F(${qt(b.F.x)}|${qt(b.F.y)})`, unten: false, links: u > d },
            { x: u, y: yP, farbe: C.flaggold, name: "P", links: u < d, unten: true },
          ]}
          legende={[[C.see, "f"], [C.gruen, zw("Strahl F → P", "ray F → P")], [C.goldWarm, zw("gespiegelter Strahl", "reflected ray")], [C.see, zw("Tangente", "tangent"), true], [C.grau, zw("Normale", "normal"), true], [C.signal, zw("Leitlinie", "directrix"), true], [C.hellgrau, zw("Symmetrieachse", "axis"), true]]} />
      </div>

      <Rechenschritt nr="1" titel={zw("Brennpunkt und Leitlinie", "Focus and directrix")}>
        <Text>{zw("Für f(x) = a(x − d)² + e liegt der Brennpunkt senkrecht über dem Scheitel, im Abstand p = 1/(4a):", "For f(x) = a(x − d)² + e the focus lies directly above the vertex at distance p = 1/(4a):")}</Text>
        <Formel gross t="F\left(d \,|\, e + \frac{1}{4a}\right)" />
        <Formel t={`p = \\frac{1}{4a} = \\frac{1}{4 \\cdot ${kl(a)}} = ${qTex(b.p)}`} />
        <Formel t={`F(${qTex(b.F.x)} \\,|\\, ${kl(q(e))} + ${qTex(b.p)}) = F(${qTex(b.F.x)} \\,|\\, ${qTex(b.F.y)})`} />
        <Text>{zw("Die Leitlinie liegt ebenso weit unter dem Scheitel:", "The directrix lies just as far below the vertex:")} <M t={`y = e − p = ${qTex(b.leit)}`} /></Text>
      </Rechenschritt>

      <Rechenschritt nr="2" titel={zw("Der Punkt P auf der Parabel", "The point P on the parabola")}>
        <Formel t={`f(${qTex(q(u))}) = ${kl(a)} \\cdot (${qTex(q(u))} − ${kl(q(d))})^2 + ${kl(q(e))} = ${qTex(b.P.y)}`} />
        <Text>→ <b>P({minusZ(u)} | {qt(b.P.y)})</b></Text>
      </Rechenschritt>

      <Rechenschritt nr="3" titel={zw("Tangente und Normale – hier kommt die Ableitung", "Tangent and normal – here the derivative comes in")}>
        <Formel t="f′(x) = 2a(x − d)" />
        <Formel t={`m = f′(${qTex(q(u))}) = 2 \\cdot ${kl(a)} \\cdot (${qTex(q(u))} − ${kl(q(d))}) = ${qTex(b.m)}`} />
        <Text>{zw("Tangente in P (Steigung m):", "Tangent at P (slope m):")} <M t={`t:\\; ${tText}`} /></Text>
        <Text>{qNull(b.m) ? zw("Die Tangente ist waagerecht, die Normale steht senkrecht darauf:", "The tangent is horizontal, the normal is vertical:") : zw("Die Normale steht senkrecht auf der Tangente (Steigung −1/m):", "The normal is perpendicular to the tangent (slope −1/m):")} <M t={`n:\\; ${nText}`} /></Text>
      </Rechenschritt>

      <Rechenschritt nr="4" titel={zw("Die Linie von P zum Brennpunkt", "The line from P to the focus")}>
        <Formel t={`\\vec{w} = \\vec{PF} = F − P = ${vTex(b.w)}`} />
      </Rechenschritt>

      <Rechenschritt nr="5" titel={zw("An der Normalen spiegeln", "Reflect in the normal")}>
        <Text>{zw("Die Normale hat den Richtungsvektor n = (−m | 1). Spiegelt man w an der Geraden mit Richtung n, erhält man:", "The normal has direction vector n = (−m | 1). Reflecting w in the line with direction n gives:")}</Text>
        <Formel t="\vec{r} = 2 \cdot \frac{\vec{w} \cdot \vec{n}}{\vec{n} \cdot \vec{n}} \cdot \vec{n} − \vec{w}" />
        <Formel t={`\\vec{n} = ${vTex(b.n)}`} />
        <Formel t={`\\vec{w} \\cdot \\vec{n} = ${kl(b.w.x)} \\cdot ${kl(b.n.x)} + ${kl(b.w.y)} \\cdot 1 = ${qTex(b.wn)}`} />
        <Formel t={`\\vec{n} \\cdot \\vec{n} = ${qTex(b.nn)}`} />
        <Formel t={`\\vec{r} = 2 \\cdot \\frac{${qTex(b.wn)}}{${qTex(b.nn)}} \\cdot ${vTex(b.n)} − ${vTex(b.w)}`} />
        <Formel t={`\\vec{r} = ${vTex(b.r)}`} />
      </Rechenschritt>

      <Rechenschritt nr="6" titel={zw("Ergebnis: Der Strahl läuft senkrecht nach oben", "Result: the ray runs straight upwards")}>
        <Rueck art="gut">{zw("Die x-Komponente von r ist 0: Der gespiegelte Strahl ist senkrecht und damit parallel zur Symmetrieachse x = ", "The x-component of r is 0: the reflected ray is vertical and therefore parallel to the axis x = ")}{qt(q(d))}{zw(". Die y-Komponente ist positiv: Er läuft nach oben.", ". The y-component is positive: it runs upwards.")}</Rueck>
        <Text>{zw("Bonus: Die Länge bleibt beim Spiegeln gleich – |r| = |w| =", "Bonus: reflecting keeps the length – |r| = |w| =")} <b>{qt(b.laenge)}</b> {zw("= Abstand von P zur Leitlinie.", "= distance of P from the directrix.")}</Text>
        <Aufklapp titel={zw("Gilt das für jeden Punkt? Beweis mit s = u − d", "Does it hold for every point? Proof with s = u − d")}>
          <Formel t="P(d + s \,|\, e + as^2),\quad F\left(d \,|\, e + \frac{1}{4a}\right)" />
          <Formel t="\vec{w} = \left(−s \,|\, \frac{1}{4a} − as^2\right),\quad \vec{n} = (−2as \,|\, 1)" />
          <Formel t="\vec{w} \cdot \vec{n} = 2as^2 + \frac{1}{4a} − as^2 = as^2 + \frac{1}{4a}" />
          <Formel t="\vec{n} \cdot \vec{n} = 4a^2s^2 + 1 = 4a\left(as^2 + \frac{1}{4a}\right)" />
          <Formel t="\Rightarrow\; 2 \cdot \frac{\vec{w} \cdot \vec{n}}{\vec{n} \cdot \vec{n}} = \frac{1}{2a}" />
          <Formel t="\vec{r} = \frac{1}{2a}(−2as \,|\, 1) − \vec{w} = \left(0 \,|\, as^2 + \frac{1}{4a}\right)" />
          <Text>{zw("Für jedes s ist die x-Komponente 0 und die y-Komponente positiv (a > 0): Alle Strahlen aus dem Brennpunkt laufen parallel nach oben. Umgekehrt bündelt eine Satellitenschüssel parallel einfallende Signale im Brennpunkt.", "For every s the x-component is 0 and the y-component positive (a > 0): all rays from the focus run upwards in parallel. Conversely, a satellite dish gathers parallel incoming signals at the focus.")}</Text>
        </Aufklapp>
      </Rechenschritt>
    </>
  );
}

/* ============================================================
   Seite
   ============================================================ */
export function Parabeln() {
  const [modus, setModus] = useState("scheitel");
  return (
    <Seite titel={zw("Quadratische Funktionen", "Quadratic functions")}
      text={zw("Alles über f(x) = ax² + bx + c: Scheitelpunkt, Scheitelform, Nullstellen und Brennpunkt. Jedes Schaubild hat gleich skalierte Achsen.", "Everything about f(x) = ax² + bx + c: vertex, vertex form, roots and focus. Every graph has equally scaled axes.")}>
      <ModusLeiste modi={[["scheitel", zw("Scheitel\u00ADpunkt", "Vertex")], ["form", zw("Scheitel\u00ADform", "Vertex form")], ["null", zw("Null\u00ADstellen", "Roots")], ["brenn", zw("Brenn\u00ADpunkt", "Focus")]]}
        modus={modus} setModus={setModus} label={zw("Bereich der Parabeln", "Parabola topic")} />
      <div style={{ marginTop: 14 }}>
        {modus === "scheitel" && <ScheitelErkunden />}
        {modus === "form" && <ScheitelUebung />}
        {modus === "null" && <NullstellenSeite />}
        {modus === "brenn" && <BrennpunktSeite />}
      </div>
    </Seite>
  );
}
