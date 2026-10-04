/* ============================================================
   Vektoren-Bereich: zwei neue Karten
   · Geraden im Raum: Gerade aus zwei Punkten (das vorhandene Tool),
     Punktprobe mit beweglichem Parameter, Gerade vs. Gerade
     (identisch, parallel, schneidend, windschief), Gerade vs. Ebene
   · Winkel und Skalarprodukt: Skalarprodukt verstehen, Vektorwinkel,
     Gerade-Ebene-Winkel
   Erst vermuten, dann rechnerisch prüfen. Alle Rechnungen exakt
   (rechnen2.js), 3D-Bild aus func20 (Raum3) wiederverwendet.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Einzeilig } from "./func19.jsx";
import { FA, FB, FE, FS, Gl, Name, Raum3, Vek, koordText, n } from "./func20.jsx";
import { VektorFeld, ZweiPunkteGerade, leseVektor } from "./func23.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { Auswahl, GrosserKnopf, KleinerLink, Rueck, ZahlFeld, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { neueLageGE, neueLageGG, neuePunktprobe, neuesVektorPaar } from "./aufgaben2.js";
import {
  dez, laenge, lageGE, lageGG, nullVek, punktprobe, q, qAdd, qGleich, qLies, qMul, qNum, qTex, skalar, winkelGeradeEbene, winkelZwischen,
} from "./rechnen2.js";

const zeile = { fontSize: 16.5, lineHeight: 1.9, color: C.tinte, overflowX: "auto", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 };
const box = { background: C.sand, borderRadius: 14, padding: "10px 14px", marginTop: 12 };
const schritt = (nr, titel) => (
  <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, margin: "14px 0 8px" }}>
    <span style={{ display: "inline-flex", width: 20, height: 20, borderRadius: 999, background: C.himmel, color: C.see, alignItems: "center", justifyContent: "center", fontSize: 11.5, marginRight: 6 }}>{nr}</span>{titel}
  </p>
);
const sp = (v) => `\\spalte{${n(v[0])}}{${n(v[1])}}{${n(v[2])}}`;
const ROEM = ["I", "II", "III"];

/* c0 + c1·v als Text, mit Vorzeichen-Logik */
const lin = (c0, c1, v) => {
  if (c1 === 0) return n(c0);
  const betrag = Math.abs(c1) === 1 ? "" : String(Math.abs(c1));
  if (c0 === 0) return `${c1 < 0 ? "−" : ""}${betrag}${v}`;
  return `${n(c0)} ${c1 < 0 ? "−" : "+"} ${betrag}${v}`;
};
const mk = (x) => (x.z < 0 ? `(${qTex(x)})` : qTex(x));
const punktQ = (S) => `(${S.map((x) => qTex(x)).join(" | ")})`;
const numPunkt = (S) => S.map(qNum);

const GeradeZeile = ({ name, A, u, farbe, par = "t" }) => (
  <Einzeilig max={16}><span style={{ color: farbe }}>{name}:</span><Name t="x" farbe={farbe} /><Gl /><Vek w={A.map(n)} farbe={farbe} /><span>+ {par} ·</span><Vek w={u.map(n)} farbe={farbe} /></Einzeilig>
);

/* ======================================================================
   Punktprobe
   ====================================================================== */

function ProbeZeilen({ A, u, P, pp, punktName = "P" }) {
  return (
    <>
      {pp.zeilen.map((z) => (
        <div key={z.r} style={zeile}>
          <span style={{ minWidth: 26, color: C.grau, fontSize: 14 }}>{ROEM[z.r]}</span>
          {z.frei
            ? <><M t={`${n(P[z.r])} = ${n(A[z.r])}`} /><span style={{ color: z.ok ? C.smaragd : C.signal, fontWeight: 800 }}>{z.ok ? "✓" : "✗"}</span><span style={{ fontSize: 13, color: C.grau }}>{zw("(t fällt weg: Richtungskomponente 0)", "(t drops out: direction component 0)")}</span></>
            : <M t={`${n(P[z.r])} = ${lin(A[z.r], u[z.r], "t")} \\Rightarrow t = ${qTex(z.t)}`} />}
        </div>
      ))}
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginTop: 6, whiteSpace: "normal" }}>
        {pp.ok
          ? zw(`Alle Zeilen passen zum selben Parameter t = ${pp.t ? qTex(pp.t).replace(/\\frac\{(-?\d+)\}\{(\d+)\}/, "$1/$2") : "–"}: ${punktName} liegt auf der Geraden.`, `All rows give the same parameter t = ${pp.t ? qTex(pp.t).replace(/\\frac\{(-?\d+)\}\{(\d+)\}/, "$1/$2") : "–"}: ${punktName} lies on the line.`)
          : zw(`Die Zeilen widersprechen sich: ${punktName} liegt nicht auf der Geraden.`, `The rows contradict each other: ${punktName} is not on the line.`)}
      </p>
    </>
  );
}

function Punktprobe() {
  const [au, setAu] = useState(neuePunktprobe);
  const [t, setT] = useState(0);
  const [vm, setVm] = useState(null);
  const neu = () => { setAu(neuePunktprobe()); setT(0); setVm(null); };
  const pt = au.A.map((a, i) => a + t * au.u[i]);
  const richtig = vm !== null && (vm === "auf") === au.auf;
  const hilfe = hilfeKontext({
    id: `probe-${au.A}-${au.u}-${au.P}`,
    aufgabe: "Punktprobe Gerade Parameter Stützvektor Richtungsvektor",
    verstehen: [
      zw("Ein Punkt liegt auf g, wenn es einen Parameter t gibt, für den g genau diesen Punkt liefert.", "A point lies on g if there is a parameter t for which g gives exactly this point."),
      zw("Alle drei Koordinaten müssen zum selben t passen.", "All three coordinates must fit the same t."),
      zw("Bewege den Regler: Der Punkt Aₜ wandert auf der Geraden.", "Move the slider: the point Aₜ travels along the line."),
    ],
    ansatz: [zw("Welche Gleichung entsteht, wenn P = A + t·u gelten soll?", "Which equation arises if P = A + t·u is to hold?"), zw("Das sind drei Gleichungen, eine je Zeile.", "That is three equations, one per row."), zw("Löse jede Zeile nach t auf und vergleiche.", "Solve every row for t and compare.")],
    regel: [zw("Wie löst man p = a + t·u nach t?", "How do you solve p = a + t·u for t?"), zw("t = (p − a) / u – nur wenn u ≠ 0.", "t = (p − a) / u – only if u ≠ 0."), zw("Ist u = 0, muss p = a gelten, sonst gibt es keinen Punkt.", "If u = 0 then p = a must hold, otherwise there is no point.")],
    pruefen: [zw("Haben alle Zeilen dasselbe t?", "Do all rows have the same t?"), zw("Setze das t in die Gerade ein: Kommt P heraus?", "Plug t into the line: does P come out?"), zw("Ein einziger Widerspruch genügt für „nicht auf g“.", "A single contradiction is enough for “not on g”.")],
    regeln: [],
  });
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Punktprobe", "Point test")}</p>
        <IchHaengeFest kontext={hilfe} />
      </div>
      <p style={hinweis}>{zw("Bewege den Parameter und sieh, wo Aₜ liegt. Dann vermute: Liegt P auf g?", "Move the parameter and see where Aₜ is. Then guess: is P on g?")}</p>
      <GeradeZeile name="g" A={au.A} u={au.u} farbe={FA} />
      <p style={{ textAlign: "center", fontWeight: 800, color: FB, margin: "6px 0 10px" }}>P({au.P.map(n).join(" | ")})</p>
      <Raum3 key={[...au.A, ...au.u, ...au.P].join()} punkte={[{ p: au.A, label: "A", farbe: FA }, { p: au.P, label: "P", farbe: FB }, { p: pt, label: "Aₜ", farbe: FS }]} gerade={{ p: au.A, r: au.u }} />
      <div style={{ marginTop: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700, color: C.tinte }}>
          t = <span style={{ minWidth: 34, color: C.see }}>{String(t).replace(".", ",").replace("-", "−")}</span>
          <input type="range" min={-4} max={4} step={0.5} value={t} onChange={(e) => setT(Number(e.target.value))} aria-label={zw("Parameter t", "Parameter t")} style={{ flex: 1, accentColor: C.see }} />
        </label>
        <p style={{ fontSize: 13.5, color: C.grau, marginTop: 4 }}>Aₜ({pt.map((x) => String(Math.round(x * 10) / 10).replace(".", ",").replace("-", "−")).join(" | ")})</p>
      </div>
      {schritt(1, zw("Vermutung: Liegt P auf g?", "Guess: is P on g?"))}
      <Auswahl label={zw("Vermutung", "Guess")} wert={vm} setWert={setVm} optionen={[["auf", zw("P liegt auf g", "P is on g")], ["nicht", zw("P liegt nicht auf g", "P is not on g")]]}
        status={vm !== null ? (richtig ? "gut" : "schlecht") : undefined} />
      {vm !== null && (
        <>
          <Rueck art={richtig ? "gut" : "schlecht"}>{richtig ? zw("Deine Vermutung stimmt – hier die Rechnung dazu.", "Your guess is right – here is the calculation.") : zw("Die Vermutung stimmt nicht – prüfe an der Rechnung, welche Zeile widerspricht.", "The guess is wrong – check which row contradicts.")}</Rueck>
          <div style={box}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, marginBottom: 4 }}>{zw("Punktprobe: P = A + t · u, Zeile für Zeile", "Point test: P = A + t · u, row by row")}</p>
            <ProbeZeilen A={au.A} u={au.u} P={au.P} pp={au.pp} />
          </div>
        </>
      )}
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

/* ======================================================================
   Gerade vs. Gerade
   ====================================================================== */

const ART_GG = { identisch: ["identisch", "identical"], parallel: ["echt parallel", "parallel and distinct"], schneidend: ["schneidend", "intersecting"], windschief: ["windschief", "skew"] };

function GeradeVsGerade() {
  const [fall, setFall] = useState("zufall");
  const [au, setAu] = useState(() => neueLageGG());
  const [vm, setVm] = useState(null);
  const neu = (f = fall) => { setAu(neueLageGG(f === "zufall" ? undefined : f)); setVm(null); };
  const waehleFall = (f) => { setFall(f); neu(f); };
  const { A, u, B, v, L } = au;
  const richtig = vm === au.art;
  const pk = L.art === "identisch" || L.art === "parallel";
  const kFaktor = pk ? (() => { const i = u.findIndex((x) => x !== 0); return q(v[i], u[i]); })() : null;
  const pp = pk ? punktprobe(A, u, B) : null;
  const hilfe = hilfeKontext({
    id: `gg-${A}-${u}-${B}-${v}`,
    aufgabe: "Lagebeziehung Gerade Gerade windschief parallel identisch schneidend Parameter",
    verstehen: [
      zw("Zwei Geraden im Raum können identisch, echt parallel, schneidend oder windschief sein.", "Two lines in space can be identical, parallel and distinct, intersecting or skew."),
      zw("Windschief heißt: nicht parallel und kein gemeinsamer Punkt – das gibt es nur im Raum.", "Skew means: not parallel and no common point – this only exists in space."),
      zw("Beide Geraden brauchen einen eigenen Parameter (t und s).", "Both lines need their own parameter (t and s)."),
    ],
    ansatz: [
      zw("Sind die Richtungsvektoren Vielfache voneinander?", "Are the direction vectors multiples of each other?"),
      zw("Ja: Prüfe, ob der Stützpunkt der einen Geraden auf der anderen liegt. Nein: Setze die Geraden gleich.", "Yes: check whether the support point of one line is on the other. No: set the lines equal."),
      zw("Gleichsetzen ergibt drei Gleichungen mit t und s: Löse zwei, prüfe die dritte.", "Setting equal gives three equations in t and s: solve two, check the third."),
    ],
    regel: [zw("Welche Regel entscheidet?", "Which rule decides?"), zw("Parallel genau dann, wenn v = k·u. Schneidend genau dann, wenn das Gleichungssystem eine Lösung hat.", "Parallel exactly if v = k·u. Intersecting exactly if the system has a solution."), zw("Passt die dritte Zeile nicht, sind die Geraden windschief.", "If the third row does not fit, the lines are skew.")],
    pruefen: [zw("Hast du für beide Geraden unterschiedliche Buchstaben benutzt?", "Did you use different letters for the two lines?"), zw("Setze t und s in beide Geraden ein: Kommt derselbe Punkt heraus?", "Plug t and s into both lines: do you get the same point?"), zw("Steht im Ergebnis nur ein Punkt, nicht eine Gerade?", "Is the result a single point, not a line?")],
    regeln: [{ name: "Kreuzprodukt", bereich: "vektoren" }],
  });
  const dritteLinks = L.t ? qAdd(q(A[L.dritte]), qMul(L.t, q(u[L.dritte]))) : null;
  const dritteRechts = L.s ? qAdd(q(B[L.dritte]), qMul(L.s, q(v[L.dritte]))) : null;
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Gerade vs. Gerade", "Line vs. line")}</p>
        <IchHaengeFest kontext={hilfe} />
      </div>
      <p style={hinweis}>{zw("Erst vermuten, dann Parallelität und Schnitt rechnerisch prüfen.", "First guess, then check parallelism and intersection by calculation.")}</p>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: C.grau, marginBottom: 6 }}>{zw("Üben:", "Practise:")}</p>
        <Auswahl label={zw("Fall wählen", "Choose a case")} wert={fall} setWert={waehleFall}
          optionen={[["zufall", zw("Zufall", "Random")], ...Object.entries(ART_GG).map(([id, t]) => [id, zw(t[0], t[1])])]} />
      </div>
      <GeradeZeile name="g" A={A} u={u} farbe={FA} par="t" />
      <GeradeZeile name="h" A={B} u={v} farbe={C.see} par="s" />
      <div style={{ marginTop: 10 }}>
        <Raum3 key={[...A, ...u, ...B, ...v].join()} punkte={[{ p: A, label: "A", farbe: FA }, { p: B, label: "B", farbe: FB }, ...(L.S ? [{ p: numPunkt(L.S), label: "S", farbe: FS }] : [])]} gerade={{ p: A, r: u }} gerade2={{ p: B, r: v }} />
      </div>
      {schritt(1, zw("Vermutung: Wie liegen die Geraden zueinander?", "Guess: how are the lines positioned?"))}
      <Auswahl label={zw("Vermutung", "Guess")} wert={vm} setWert={setVm}
        optionen={Object.entries(ART_GG).map(([id, t]) => [id, zw(t[0], t[1])])} status={vm ? (richtig ? "gut" : "schlecht") : undefined} />
      {vm && (
        <>
          <Rueck art={richtig ? "gut" : "schlecht"}>
            {richtig ? zw(`Richtig: Die Geraden sind ${zw(ART_GG[au.art][0], ART_GG[au.art][1])}. Hier die Rechnung, die das beweist.`, `Right: the lines are ${ART_GG[au.art][1]}. Here is the calculation that proves it.`)
              : zw(`Nicht ganz: Die Geraden sind ${ART_GG[au.art][0]}. Die Rechnung zeigt, woran man es erkennt.`, `Not quite: the lines are ${ART_GG[au.art][1]}. The calculation shows how to tell.`)}
          </Rueck>
          <div style={box}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, marginBottom: 4 }}>{zw("Schritt 1 – Parallel?", "Step 1 – parallel?")}</p>
            {pk ? (
              <>
                <div style={zeile}><M t={`\\vec{v} = k \\cdot \\vec{u}\\;\\text{mit}\\; k = ${qTex(kFaktor)}`} /></div>
                <div style={zeile}><M t={`${sp(v)} = ${mk(kFaktor)} \\cdot ${sp(u)}`} /></div>
                <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, whiteSpace: "normal" }}>{zw("Die Richtungsvektoren sind Vielfache: Die Geraden sind parallel oder identisch.", "The direction vectors are multiples: the lines are parallel or identical.")}</p>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, margin: "10px 0 4px" }}>{zw("Schritt 2 – Liegt B auf g? (Punktprobe)", "Step 2 – is B on g? (point test)")}</p>
                <ProbeZeilen A={A} u={u} P={B} pp={pp} punktName="B" />
              </>
            ) : (
              <>
                <div style={zeile}><M t={`\\vec{u} \\times \\vec{v} = ${sp(L.uv)} \\neq \\vec{0}`} /></div>
                <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, whiteSpace: "normal" }}>{zw("Kein Vielfaches: Die Geraden sind nicht parallel. Jetzt Gleichsetzen – mit zwei verschiedenen Parametern t und s.", "No multiple: the lines are not parallel. Now set equal – with two different parameters t and s.")}</p>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, margin: "10px 0 4px" }}>{zw("Schritt 2 – g = h gleichsetzen", "Step 2 – set g = h")}</p>
                {[0, 1, 2].map((r) => <div key={r} style={zeile}><span style={{ minWidth: 26, color: C.grau, fontSize: 14 }}>{ROEM[r]}</span><M t={`${lin(A[r], u[r], "t")} = ${lin(B[r], v[r], "s")}`} /></div>)}
                <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, margin: "10px 0 4px" }}>{zw(`Schritt 3 – Zeilen ${ROEM[L.zeilen[0]]} und ${ROEM[L.zeilen[1]]} lösen`, `Step 3 – solve rows ${ROEM[L.zeilen[0]]} and ${ROEM[L.zeilen[1]]}`)}</p>
                <div style={zeile}><M t={`t = ${qTex(L.t)},\\quad s = ${qTex(L.s)}`} /></div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, margin: "10px 0 4px" }}>{zw(`Schritt 4 – Probe in Zeile ${ROEM[L.dritte]}`, `Step 4 – check in row ${ROEM[L.dritte]}`)}</p>
                <div style={zeile}><M t={`${n(A[L.dritte])} + ${mk(L.t)} \\cdot ${n(u[L.dritte])} = ${qTex(dritteLinks)}`} /></div>
                <div style={zeile}><M t={`${n(B[L.dritte])} + ${mk(L.s)} \\cdot ${n(v[L.dritte])} = ${qTex(dritteRechts)}`} /></div>
                <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, whiteSpace: "normal" }}>
                  {qGleich(dritteLinks, dritteRechts)
                    ? zw("Beide Seiten sind gleich: Die Geraden schneiden sich.", "Both sides are equal: the lines intersect.")
                    : zw("Die Seiten sind verschieden – ein Widerspruch: Die Geraden sind windschief.", "The sides differ – a contradiction: the lines are skew.")}
                </p>
                {L.S && <div style={zeile}><M t={`S = ${punktQ(L.S)}`} /></div>}
              </>
            )}
            <div style={{ ...zeile, marginTop: 6, fontWeight: 800 }}>{zw("Ergebnis:", "Result:")} <span style={{ color: C.see }}>{zw(ART_GG[au.art][0], ART_GG[au.art][1])}</span></div>
          </div>
        </>
      )}
      <GrosserKnopf ghost onClick={() => neu()}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

/* ======================================================================
   Gerade vs. Ebene
   ====================================================================== */

const ART_GE = { schneidend: ["Gerade schneidet die Ebene", "line meets the plane"], parallel: ["parallel, ohne Schnitt", "parallel, no intersection"], enthalten: ["Gerade liegt in der Ebene", "line lies in the plane"] };

function GeradeVsEbene() {
  const [fall, setFall] = useState("zufall");
  const [au, setAu] = useState(() => neueLageGE());
  const [vm, setVm] = useState(null);
  const neu = (f = fall) => { setAu(neueLageGE(f === "zufall" ? undefined : f)); setVm(null); };
  const waehleFall = (f) => { setFall(f); neu(f); };
  const { A, u, n: nv, d, L } = au;
  const richtig = vm === au.art;
  const hilfe = hilfeKontext({
    id: `ge-${A}-${u}-${nv}-${d}`,
    aufgabe: "Lagebeziehung Gerade Ebene Schnittpunkt Normalenvektor Skalarprodukt parallel enthalten",
    verstehen: [
      zw("Eine Gerade kann eine Ebene schneiden, parallel dazu verlaufen oder in ihr liegen.", "A line can meet a plane, run parallel to it or lie in it."),
      zw("Der Normalenvektor n steht senkrecht auf der Ebene.", "The normal vector n is perpendicular to the plane."),
      zw("Verläuft die Gerade parallel zur Ebene, steht ihre Richtung senkrecht auf n.", "If the line is parallel to the plane, its direction is perpendicular to n."),
    ],
    ansatz: [zw("Was sagt u · n über die Richtung der Geraden?", "What does u · n say about the direction of the line?"), zw("u · n = 0: parallel oder enthalten. u · n ≠ 0: Schnittpunkt.", "u · n = 0: parallel or contained. u · n ≠ 0: intersection point."), zw("Bei u · n = 0 den Stützpunkt in die Ebene einsetzen.", "If u · n = 0, plug the support point into the plane.")],
    regel: [zw("Wie findet man den Schnittpunkt?", "How do you find the intersection point?"), zw("Gerade A + t·u in die Ebenengleichung einsetzen und nach t auflösen.", "Plug the line A + t·u into the plane equation and solve for t."), zw("t in die Gerade einsetzen ergibt den Schnittpunkt.", "Plugging t into the line gives the intersection point.")],
    pruefen: [zw("Erfüllt der Schnittpunkt die Ebenengleichung?", "Does the intersection point satisfy the plane equation?"), zw("Liegt er auf der Geraden (mit dem t)?", "Is it on the line (with that t)?"), zw("Bei 0 = 0 ist die Gerade enthalten, bei 0 = Zahl ≠ 0 parallel.", "0 = 0 means contained, 0 = non-zero number means parallel.")],
    regeln: [{ name: "Orthogonalität", bereich: "vektoren" }],
  });
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Gerade vs. Ebene", "Line vs. plane")}</p>
        <IchHaengeFest kontext={hilfe} />
      </div>
      <p style={hinweis}>{zw("Erst vermuten, dann mit dem Skalarprodukt u · n entscheiden.", "First guess, then decide with the dot product u · n.")}</p>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: C.grau, marginBottom: 6 }}>{zw("Üben:", "Practise:")}</p>
        <Auswahl label={zw("Fall wählen", "Choose a case")} wert={fall} setWert={waehleFall}
          optionen={[["zufall", zw("Zufall", "Random")], ["schneidend", zw("schneidend", "intersecting")], ["parallel", zw("parallel", "parallel")], ["enthalten", zw("enthalten", "contained")]]} />
      </div>
      <GeradeZeile name="g" A={A} u={u} farbe={FA} par="t" />
      <p style={{ textAlign: "center", fontWeight: 700, color: C.see, margin: "4px 0 10px" }}>E: {koordText(nv, d)}</p>
      <Raum3 key={[...A, ...u, ...nv, d].join()} punkte={[{ p: A, label: "A", farbe: FA }, ...(L.S ? [{ p: numPunkt(L.S), label: "S", farbe: FS }] : [])]} gerade={{ p: A, r: u }} ebene={{ n: nv, d }} />
      {schritt(1, zw("Vermutung: Wie liegen Gerade und Ebene?", "Guess: how are line and plane positioned?"))}
      <Auswahl label={zw("Vermutung", "Guess")} wert={vm} setWert={setVm}
        optionen={Object.entries(ART_GE).map(([id, t]) => [id, zw(t[0], t[1])])} status={vm ? (richtig ? "gut" : "schlecht") : undefined} />
      {vm && (
        <>
          <Rueck art={richtig ? "gut" : "schlecht"}>
            {richtig ? zw("Richtig – hier die Rechnung dazu.", "Right – here is the calculation.") : zw(`Nicht ganz: ${ART_GE[au.art][0]}. Die Rechnung zeigt es.`, `Not quite: ${ART_GE[au.art][1]}. The calculation shows it.`)}
          </Rueck>
          <div style={box}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, marginBottom: 4 }}>{zw("Schritt 1 – Richtung gegen Normalenvektor", "Step 1 – direction versus normal vector")}</p>
            <div style={zeile}><M t={`\\vec{u} \\cdot \\vec{n} = ${n(u[0])} \\cdot ${mkI(nv[0])} + ${n(u[1])} \\cdot ${mkI(nv[1])} + ${n(u[2])} \\cdot ${mkI(nv[2])} = ${n(L.un)}`} /></div>
            {L.un !== 0 ? (
              <>
                <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, whiteSpace: "normal" }}>{zw("Ungleich 0: Die Gerade verläuft nicht parallel zur Ebene – sie schneidet sie in genau einem Punkt.", "Not zero: the line is not parallel to the plane – it meets it in exactly one point.")}</p>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, margin: "10px 0 4px" }}>{zw("Schritt 2 – Gerade in die Ebene einsetzen", "Step 2 – plug the line into the plane")}</p>
                <div style={zeile}><M t={`\\vec{n} \\cdot (\\vec{A} + t\\,\\vec{u}) = d`} /></div>
                <div style={zeile}><M t={`${n(L.An)} + t \\cdot ${mkI(L.un)} = ${n(d)}`} /></div>
                <div style={zeile}><M t={`t = ${qTex(L.t)}`} /></div>
                <div style={zeile}><M t={`S = ${punktQ(L.S)}`} /></div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, whiteSpace: "normal" }}>{zw("Gleich 0: Die Richtung steht senkrecht auf n – die Gerade ist parallel zur Ebene oder liegt in ihr.", "Zero: the direction is perpendicular to n – the line is parallel to the plane or lies in it.")}</p>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, margin: "10px 0 4px" }}>{zw("Schritt 2 – Stützpunkt A in die Ebene einsetzen", "Step 2 – plug the support point A into the plane")}</p>
                <div style={zeile}><M t={`\\vec{n} \\cdot \\vec{A} = ${n(L.An)}\\;\\text{und}\\; d = ${n(d)}`} /></div>
                <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, whiteSpace: "normal" }}>
                  {L.An === d ? zw("A liegt in der Ebene: Die ganze Gerade liegt in E.", "A lies in the plane: the whole line lies in E.") : zw("A liegt nicht in der Ebene: Die Gerade ist echt parallel, es gibt keinen Schnittpunkt.", "A does not lie in the plane: the line is parallel and distinct, there is no intersection point.")}
                </p>
              </>
            )}
          </div>
        </>
      )}
      <GrosserKnopf ghost onClick={() => neu()}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}
const mkI = (x) => (x < 0 ? `(${n(x)})` : n(x));

/* ======================================================================
   Karte „Geraden im Raum“
   ====================================================================== */

const GERADEN_MODI = [
  { id: "zwei", name: ["Gerade aus zwei Punkten", "Line from two points"] },
  { id: "probe", name: ["Punktprobe", "Point test"] },
  { id: "gg", name: ["Gerade vs. Gerade", "Line vs. line"] },
  { id: "ge", name: ["Gerade vs. Ebene", "Line vs. plane"] },
];

export function GeradenImRaum() {
  const [modus, setModus] = useState("zwei");
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>{zw("Geraden im Raum", "Lines in space")}</h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        {zw("Aus Punkten Stütz- und Richtungsvektor bestimmen, einen Parameter bewegen und Lagebeziehungen erst vermuten, dann rechnerisch prüfen.", "Find the support and direction vectors from points, move a parameter, and first guess then calculate positions.")}
      </p>
      <div role="tablist" aria-label={zw("Geraden-Übungen", "Line exercises")} style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        {GERADEN_MODI.map((m) => {
          const an = modus === m.id;
          return (
            <button key={m.id} type="button" role="tab" aria-selected={an} onClick={() => setModus(m.id)}
              style={{ minHeight: 48, padding: "8px 10px", borderRadius: 14, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700,
                border: `1px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see, boxShadow: an ? "0 4px 14px rgba(0,77,152,0.25)" : "none" }}>
              {zw(m.name[0], m.name[1])}
            </button>
          );
        })}
      </div>
      <div style={{ display: modus === "zwei" ? "block" : "none", marginTop: 16 }}>
        <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 12 }}>{zw("Dieses Werkzeug gibt es auch eigenständig im Vektoren-Menü: „Zwei Punkte – eine Gerade“.", "This tool is also available on its own in the vectors menu: “Two points – one line”.")}</p>
        <ZweiPunkteGerade />
      </div>
      <div style={{ display: modus === "probe" ? "block" : "none" }}><Punktprobe /></div>
      <div style={{ display: modus === "gg" ? "block" : "none" }}><GeradeVsGerade /></div>
      <div style={{ display: modus === "ge" ? "block" : "none" }}><GeradeVsEbene /></div>
    </div>
  );
}

/* ======================================================================
   Winkel und Skalarprodukt
   ====================================================================== */

const farbA = C.see, farbB = C.gruen;

/* Der Winkel zwischen a und b in ihrer gemeinsamen Ebene gezeichnet (Längen im richtigen Verhältnis) */
function WinkelBild({ a, b, projektion = false }) {
  const la = laenge(a), lb = laenge(b);
  const phi = (winkelZwischen(a, b) * Math.PI) / 180;
  const W = 300, H = 170, O = [150, 150], s = 110 / Math.max(la, lb);
  const Ea = [O[0] + s * la, O[1]];
  const Eb = [O[0] + s * lb * Math.cos(phi), O[1] - s * lb * Math.sin(phi)];
  const Fuss = [Eb[0], O[1]];
  const R = 28;
  const bogen = `M${O[0] + R},${O[1]} A${R},${R} 0 0 0 ${O[0] + R * Math.cos(phi)},${O[1] - R * Math.sin(phi)}`;
  const rechter = Math.abs(phi - Math.PI / 2) < 0.002;
  const grad = Math.round((phi * 180) / Math.PI * 10) / 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={zw("Winkel zwischen den Vektoren", "Angle between the vectors")} style={{ width: "100%", display: "block", background: C.weiss, borderRadius: 14, border: `1px solid ${C.linie}` }}>
      <defs>
        <marker id="pfa" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={farbA} /></marker>
        <marker id="pfb" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={farbB} /></marker>
      </defs>
      {projektion && <line x1={Eb[0]} y1={Eb[1]} x2={Fuss[0]} y2={Fuss[1]} stroke={C.hellgrau} strokeWidth="1.4" strokeDasharray="4 3" />}
      {projektion && <line x1={O[0]} y1={O[1] + 8} x2={Fuss[0]} y2={Fuss[1] + 8} stroke={C.flaggold} strokeWidth="4" strokeLinecap="round" />}
      <line x1={O[0]} y1={O[1]} x2={Ea[0]} y2={Ea[1]} stroke={farbA} strokeWidth="2.8" markerEnd="url(#pfa)" />
      <line x1={O[0]} y1={O[1]} x2={Eb[0]} y2={Eb[1]} stroke={farbB} strokeWidth="2.8" markerEnd="url(#pfb)" />
      {rechter ? <path d={`M${O[0] + 14},${O[1]} v-14 h-14`} fill="none" stroke={C.tinte} strokeWidth="1.6" /> : <path d={bogen} fill="none" stroke={C.tinte} strokeWidth="1.6" />}
      <text x={O[0] + R * 1.25 * Math.cos(phi / 2) + (rechter ? 8 : 4)} y={O[1] - R * 1.25 * Math.sin(phi / 2) + 4} fontSize="12.5" fontWeight="700" fill={C.tinte}>φ = {String(grad).replace(".", ",")}°</text>
      <text x={Ea[0] + 2} y={Ea[1] + 16} fontSize="13" fontWeight="700" fill={farbA} textAnchor="end">a</text>
      <text x={Eb[0] + (Eb[0] >= O[0] ? 6 : -6)} y={Eb[1] - 6} fontSize="13" fontWeight="700" fill={farbB} textAnchor={Eb[0] >= O[0] ? "start" : "end"}>b</text>
    </svg>
  );
}

/* Gerade und Ebene im Querschnitt: Winkel α zur Ebene, Normale dazu */
function GeBild({ u, nv }) {
  const alpha = (winkelGeradeEbene(u, nv) * Math.PI) / 180;
  const W = 300, H = 160, O = [120, 120], L = 100;
  const E = [O[0] + L * Math.cos(alpha), O[1] - L * Math.sin(alpha)];
  const R = 30;
  const grad = Math.round((alpha * 180) / Math.PI * 10) / 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={zw("Winkel zwischen Gerade und Ebene", "Angle between line and plane")} style={{ width: "100%", display: "block", background: C.weiss, borderRadius: 14, border: `1px solid ${C.linie}` }}>
      <line x1={20} y1={O[1]} x2={280} y2={O[1]} stroke={C.tinte} strokeWidth="2.4" />
      <text x={278} y={O[1] + 16} fontSize="12" textAnchor="end" fill={C.grau}>E</text>
      <line x1={O[0]} y1={O[1]} x2={O[0]} y2={20} stroke={C.hellgrau} strokeWidth="1.6" strokeDasharray="4 3" />
      <text x={O[0] + 6} y={26} fontSize="12" fill={C.grau}>n</text>
      <line x1={O[0] - 0.4 * (E[0] - O[0])} y1={O[1] + 0.4 * (O[1] - E[1])} x2={E[0]} y2={E[1]} stroke={farbA} strokeWidth="2.8" />
      <text x={E[0] + 6} y={E[1] - 2} fontSize="13" fontWeight="700" fill={farbA}>g</text>
      <path d={`M${O[0] + R},${O[1]} A${R},${R} 0 0 0 ${O[0] + R * Math.cos(alpha)},${O[1] - R * Math.sin(alpha)}`} fill="none" stroke={C.tinte} strokeWidth="1.6" />
      <text x={O[0] + R * 1.35 * Math.cos(alpha / 2) + 4} y={O[1] - R * 1.35 * Math.sin(alpha / 2) + 14} fontSize="12.5" fontWeight="700" fill={C.tinte}>α = {String(grad).replace(".", ",")}°</text>
    </svg>
  );
}

/* zwei bzw. ein Vektor als Eingabe: Werte als Strings, Ergebnis als Zahlenvektoren */
function useVektoren(startAB, namen) {
  const [w, setW] = useState(() => startAB.map((v) => v.map(String)));
  const gelesen = w.map((x) => leseVektor(x.map((s) => String(s).replace("−", "-"))));
  const fehler = gelesen.some((x) => x === null) ? zw("Bitte alle Komponenten als ganze Zahlen eintragen.", "Please enter all components as integers.")
    : gelesen.some((x) => nullVek(x)) ? zw("Der Nullvektor hat keine Richtung – dafür gibt es keinen Winkel.", "The zero vector has no direction – there is no angle for it.") : null;
  return { w, setW, gelesen, fehler };
}

const wirf = (v) => v.map((x) => String(x).replace("-", "−"));

function EingabeVektoren({ namen, w, setW, farben, zuruecksetzen }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 28, margin: "12px 0" }}>
      {namen.map((nm, i) => (
        <VektorFeld key={nm} name={nm} farbe={farben[i]} werte={w[i]} setWerte={(x) => { const kopie = w.map((v) => [...v]); kopie[i] = x; setW(kopie); zuruecksetzen && zuruecksetzen(); }} />
      ))}
    </div>
  );
}

/* ---------- Skalarprodukt verstehen ---------- */

function SkalarproduktVerstehen() {
  const start = useState(() => neuesVektorPaar(0.25))[0];
  const { w, setW, gelesen, fehler } = useVektoren([start.a, start.b]);
  const [vm, setVm] = useState(null);
  const [antwort, setAntwort] = useState("");
  const [pr, setPr] = useState(null);
  const neu = () => { const p = neuesVektorPaar(0.25); setW([wirf(p.a), wirf(p.b)]); setVm(null); setAntwort(""); setPr(null); };
  const [a, b] = gelesen;
  const ab = a && b ? skalar(a, b) : null;
  const art = ab === null ? null : ab > 0 ? "spitz" : ab < 0 ? "stumpf" : "recht";
  const pruefen = () => {
    const x = qLies(antwort);
    if (x === null || x.n !== 1) { setPr({ art: "warn", text: zw("Bitte das Skalarprodukt als ganze Zahl eintragen.", "Please enter the dot product as an integer.") }); return; }
    setPr({ art: x.z === ab ? "gut" : "schlecht", rechnung: true,
      text: x.z === ab ? zw("Richtig!", "Correct!") : zw("Nicht ganz: Multipliziere komponentenweise und addiere die drei Produkte.", "Not quite: multiply component by component and add the three products.") });
  };
  const hilfe = hilfeKontext({
    id: `skalar-${w.flat().join(",")}`,
    aufgabe: "Skalarprodukt Winkel spitz stumpf orthogonal",
    verstehen: [
      zw("Das Skalarprodukt ist eine Zahl, kein Vektor.", "The dot product is a number, not a vector."),
      zw("Sein Vorzeichen verrät den Winkel: positiv spitz, null rechtwinklig, negativ stumpf.", "Its sign reveals the angle: positive acute, zero right angle, negative obtuse."),
      zw("Das Bild zeigt den echten Winkel zwischen a und b.", "The picture shows the true angle between a and b."),
    ],
    ansatz: [zw("Welche Rechnung liefert das Skalarprodukt?", "Which calculation gives the dot product?"), zw("a · b = a₁b₁ + a₂b₂ + a₃b₃.", "a · b = a₁b₁ + a₂b₂ + a₃b₃."), zw("Schau erst aufs Vorzeichen, dann auf den Betrag.", "Look at the sign first, then at the size.")],
    regel: [zw("Welche Regel passt?", "Which rule fits?"), zw("a · b = |a|·|b|·cos φ.", "a · b = |a|·|b|·cos φ."), zw("cos φ > 0 für φ < 90°, = 0 für 90°, < 0 für φ > 90°.", "cos φ > 0 for φ < 90°, = 0 for 90°, < 0 for φ > 90°.")],
    pruefen: [zw("Passt das Vorzeichen zum Bild?", "Does the sign match the picture?"), zw("Rechne die drei Produkte einzeln nach.", "Recompute the three products one by one."), zw("Bei 0 muss das Bild einen rechten Winkel zeigen.", "At 0 the picture must show a right angle.")],
    regeln: [{ name: "Orthogonalität", bereich: "vektoren" }],
  });
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Skalarprodukt verstehen", "Understanding the dot product")}</p>
        <IchHaengeFest kontext={hilfe} />
      </div>
      <p style={hinweis}>{zw("Das Skalarprodukt zweier Vektoren ist eine Zahl. Ihr Vorzeichen sagt dir, ob der Winkel spitz, recht oder stumpf ist.", "The dot product of two vectors is a number. Its sign tells you whether the angle is acute, right or obtuse.")}</p>
      <EingabeVektoren namen={["a", "b"]} w={w} setW={setW} farben={[farbA, farbB]} zuruecksetzen={() => { setPr(null); setVm(null); }} />
      {fehler ? <Rueck art="warn">{fehler}</Rueck> : <WinkelBild a={a} b={b} projektion={!!pr} />}
      {!fehler && (
        <>
          {schritt(1, zw("Vermutung: Welcher Winkel liegt zwischen a und b?", "Guess: which angle lies between a and b?"))}
          <Auswahl label={zw("Winkelart", "Type of angle")} wert={vm} setWert={(v) => { setVm(v); setPr(null); }}
            optionen={[["spitz", zw("spitz (< 90°)", "acute (< 90°)")], ["recht", zw("rechtwinklig (90°)", "right (90°)")], ["stumpf", zw("stumpf (> 90°)", "obtuse (> 90°)")]]}
            status={pr && pr.art !== "warn" ? (vm === art ? "gut" : "schlecht") : undefined} />
          {schritt(2, zw("Rechne das Skalarprodukt", "Compute the dot product"))}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ ...zeile, fontSize: 17 }}><M t="\vec{a} \cdot \vec{b} =" /></span>
            <ZahlFeld wert={antwort} setWert={(v) => { setAntwort(v); setPr(null); }} label={zw("Skalarprodukt", "Dot product")} onEnter={pruefen} breite={84} />
          </div>
          <GrosserKnopf onClick={pruefen} disabled={vm === null || antwort.trim() === ""}>{zw("Prüfen", "Check")}</GrosserKnopf>
          {pr && <Rueck art={pr.art}>{pr.text}</Rueck>}
          {pr && pr.art !== "warn" && (
            <>
              <Rueck art={vm === art ? "gut" : "schlecht"}>
                {vm === art ? zw("Die Winkel-Vermutung stimmt.", "The angle guess was right.")
                  : zw(`Der Winkel ist ${art === "spitz" ? "spitz" : art === "stumpf" ? "stumpf" : "rechtwinklig"}: Das Vorzeichen des Skalarprodukts verrät es.`, `The angle is ${art === "spitz" ? "acute" : art === "stumpf" ? "obtuse" : "a right angle"}: the sign of the dot product tells.`)}
              </Rueck>
              <div style={box}>
                <div style={zeile}><M t={`\\vec{a} \\cdot \\vec{b} = ${n(a[0])}\\cdot${mkI(b[0])} + ${n(a[1])}\\cdot${mkI(b[1])} + ${n(a[2])}\\cdot${mkI(b[2])} = ${n(ab)}`} /></div>
                <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, whiteSpace: "normal" }}>
                  {ab > 0 ? zw("Positiv: Der Winkel ist spitz.", "Positive: the angle is acute.") : ab < 0 ? zw("Negativ: Der Winkel ist stumpf.", "Negative: the angle is obtuse.") : zw("Null: Die Vektoren stehen senkrecht aufeinander (orthogonal).", "Zero: the vectors are perpendicular (orthogonal).")}
                </p>
              </div>
            </>
          )}
        </>
      )}
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Vektorwinkel ---------- */

function Vektorwinkel() {
  const start = useState(() => neuesVektorPaar(0.1))[0];
  const { w, setW, gelesen, fehler } = useVektoren([start.a, start.b]);
  const [schaetz, setSchaetz] = useState(90);
  const [geschaetzt, setGeschaetzt] = useState(false);
  const [antwort, setAntwort] = useState("");
  const [gerade, setGerade] = useState(false);
  const [pr, setPr] = useState(null);
  const neu = () => { const p = neuesVektorPaar(0.1); setW([wirf(p.a), wirf(p.b)]); setSchaetz(90); setGeschaetzt(false); setAntwort(""); setPr(null); };
  const [a, b] = gelesen;
  const phi = a && b ? winkelZwischen(a, b) : null;
  const ziel = phi === null ? null : gerade ? Math.min(phi, 180 - phi) : phi;
  const pruefen = () => {
    const x = qLies(antwort);
    if (x === null) { setPr({ art: "warn", text: zw("Bitte den Winkel als Zahl eintragen (in Grad, z. B. 53,1).", "Please enter the angle as a number (in degrees, e.g. 53.1).") }); return; }
    const v = qNum(x);
    if (Math.abs(v - ziel) <= 0.15) { setPr({ art: "gut", text: zw("Richtig!", "Correct!") }); return; }
    let text = zw("Nicht ganz. Nutze cos φ = (a · b) / (|a| · |b|) und arccos – auf eine Nachkommastelle runden.", "Not quite. Use cos φ = (a · b) / (|a| · |b|) and arccos – round to one decimal place.");
    if (gerade && Math.abs(v - phi) <= 0.15 && phi > 90) text = zw("Du hast den Winkel zwischen den Vektoren genommen. Bei Geraden ist der Schnittwinkel der kleinere der beiden Winkel: 180° − φ.", "You gave the angle between the vectors. For lines the intersection angle is the smaller of the two: 180° − φ.");
    else if (!gerade && Math.abs(v - (180 - phi)) <= 0.15) text = zw("Das ist der Nebenwinkel 180° − φ. Der Winkel zwischen zwei Vektoren kann auch stumpf sein.", "That is the supplementary angle 180° − φ. The angle between two vectors can be obtuse.");
    setPr({ art: "schlecht", text });
  };
  const hilfe = hilfeKontext({
    id: `vwinkel-${w.flat().join(",")}`,
    aufgabe: "Winkel zwischen Vektoren Skalarprodukt Betrag Kosinus",
    verstehen: [
      zw("Gesucht ist der Winkel φ zwischen den beiden Pfeilen, wenn sie am selben Punkt starten.", "You need the angle φ between the two arrows when they start at the same point."),
      zw("Er liegt immer zwischen 0° und 180°.", "It always lies between 0° and 180°."),
      zw("Bei zwei Geraden zählt der kleinere der beiden Winkel (höchstens 90°).", "For two lines the smaller of the two angles counts (at most 90°)."),
    ],
    ansatz: [zw("Welche Formel verbindet Skalarprodukt und Winkel?", "Which formula links dot product and angle?"), zw("cos φ = (a · b) / (|a| · |b|).", "cos φ = (a · b) / (|a| · |b|)."), zw("Rechne zuerst a · b, dann beide Beträge, dann arccos.", "Compute a · b first, then both lengths, then arccos.")],
    regel: [zw("Wie berechnet man den Betrag?", "How do you compute the length?"), zw("|a| = √(a₁² + a₂² + a₃²).", "|a| = √(a₁² + a₂² + a₃²)."), zw("Taschenrechner auf Gradmaß (DEG) stellen.", "Set the calculator to degrees (DEG).")],
    pruefen: [zw("Ist cos φ zwischen −1 und 1?", "Is cos φ between −1 and 1?"), zw("Passt dein Winkel zum Bild (spitz/stumpf)?", "Does your angle fit the picture (acute/obtuse)?"), zw("Vorzeichen des Skalarprodukts und Winkelart müssen zusammenpassen.", "Sign of the dot product and type of angle must agree.")],
    regeln: [{ name: "Orthogonalität", bereich: "vektoren" }],
  });
  const ab = a && b ? skalar(a, b) : 0;
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Vektorwinkel", "Angle between vectors")}</p>
        <IchHaengeFest kontext={hilfe} />
      </div>
      <p style={hinweis}>{zw("Schätze den Winkel am Bild, dann berechne ihn mit dem Skalarprodukt.", "Estimate the angle from the picture, then compute it with the dot product.")}</p>
      <EingabeVektoren namen={["a", "b"]} w={w} setW={setW} farben={[farbA, farbB]} zuruecksetzen={() => { setPr(null); setGeschaetzt(false); }} />
      {fehler ? <Rueck art="warn">{fehler}</Rueck> : <WinkelBild a={a} b={b} />}
      {!fehler && (
        <>
          {schritt(1, zw("Schätze den Winkel", "Estimate the angle"))}
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700 }}>
            <span style={{ minWidth: 46, color: C.see }}>{schaetz}°</span>
            <input type="range" min={0} max={180} step={1} value={schaetz} onChange={(e) => { setSchaetz(Number(e.target.value)); setGeschaetzt(true); }} aria-label={zw("Geschätzter Winkel", "Estimated angle")} style={{ flex: 1, accentColor: C.see }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.tinte, cursor: "pointer", minHeight: 40, marginTop: 6 }}>
            <input type="checkbox" checked={gerade} onChange={(e) => { setGerade(e.target.checked); setPr(null); }} style={{ width: 18, height: 18 }} />
            {zw("Richtungsvektoren zweier Geraden (Schnittwinkel ≤ 90°)", "Direction vectors of two lines (intersection angle ≤ 90°)")}
          </label>
          {schritt(2, zw("Berechne den Winkel (in Grad)", "Compute the angle (in degrees)"))}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ ...zeile, fontSize: 17 }}>{gerade ? zw("Schnittwinkel", "Intersection angle") : "φ"} =</span>
            <ZahlFeld wert={antwort} setWert={(v) => { setAntwort(v); setPr(null); }} label={zw("Winkel in Grad", "Angle in degrees")} onEnter={pruefen} breite={92} platzhalter="°" />
          </div>
          <GrosserKnopf onClick={pruefen} disabled={antwort.trim() === ""}>{zw("Prüfen", "Check")}</GrosserKnopf>
          {pr && <Rueck art={pr.art}>{pr.text}</Rueck>}
          {pr && pr.art !== "warn" && (
            <div style={box}>
              {geschaetzt && <p style={{ fontSize: 13, color: C.grau, marginBottom: 6 }}>{zw(`Deine Schätzung: ${schaetz}° – exakt: ${dez(phi, 1)}°.`, `Your estimate: ${schaetz}° – exact: ${dez(phi, 1)}°.`)}</p>}
              <div style={zeile}><M t={`\\cos\\varphi = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|\\cdot|\\vec{b}|} = \\frac{${n(ab)}}{\\sqrt{${skalar(a, a)}}\\cdot\\sqrt{${skalar(b, b)}}} \\approx ${dez(ab / (laenge(a) * laenge(b)), 4)}`} /></div>
              <div style={zeile}><M t={`\\varphi \\approx ${dez(phi, 1)}°`} /></div>
              {gerade && phi > 90 && <div style={zeile}><M t={`\\text{Schnittwinkel} = 180° - ${dez(phi, 1)}° = ${dez(180 - phi, 1)}°`} /></div>}
              <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, marginTop: 4 }}>{zw("Zwischen Vektoren zählt der volle Winkel bis 180°, zwischen Geraden der kleinere Schnittwinkel bis 90°.", "Between vectors the full angle up to 180° counts, between lines the smaller intersection angle up to 90°.")}</p>
            </div>
          )}
        </>
      )}
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Gerade-Ebene-Winkel ---------- */

function GeradeEbeneWinkel() {
  const start = useState(() => neuesVektorPaar(0.1))[0];
  const { w, setW, gelesen, fehler } = useVektoren([start.a, start.b]);
  const [formel, setFormel] = useState(null);
  const [antwort, setAntwort] = useState("");
  const [pr, setPr] = useState(null);
  const neu = () => { const p = neuesVektorPaar(0.1); setW([wirf(p.a), wirf(p.b)]); setFormel(null); setAntwort(""); setPr(null); };
  const [u, nv] = gelesen;
  const alpha = u && nv ? winkelGeradeEbene(u, nv) : null;
  const pruefen = () => {
    const x = qLies(antwort);
    if (x === null) { setPr({ art: "warn", text: zw("Bitte den Winkel als Zahl eintragen (in Grad).", "Please enter the angle as a number (in degrees).") }); return; }
    const v = qNum(x);
    if (Math.abs(v - alpha) <= 0.15) { setPr({ art: "gut", text: zw("Richtig!", "Correct!") }); return; }
    setPr({ art: "schlecht", text: Math.abs(v - (90 - alpha)) <= 0.15
      ? zw("Das ist der Winkel zwischen u und n (cos-Formel). Der Winkel zur Ebene ist das Komplement: 90° minus dieser Winkel – oder direkt mit sin rechnen.", "That is the angle between u and n (cos formula). The angle to the plane is the complement: 90° minus that angle – or compute directly with sin.")
      : zw("Nicht ganz. Nutze sin α = |u · n| / (|u| · |n|) und arcsin – auf eine Nachkommastelle runden.", "Not quite. Use sin α = |u · n| / (|u| · |n|) and arcsin – round to one decimal place.") });
  };
  const hilfe = hilfeKontext({
    id: `gewinkel-${w.flat().join(",")}`,
    aufgabe: "Winkel Gerade Ebene Normalenvektor Sinus Komplementwinkel",
    verstehen: [
      zw("Der Winkel α zwischen Gerade und Ebene ist der kleinste Winkel zur Ebene – er liegt zwischen 0° und 90°.", "The angle α between line and plane is the smallest angle to the plane – between 0° and 90°."),
      zw("Der Normalenvektor steht senkrecht auf der Ebene, nicht in ihr.", "The normal vector is perpendicular to the plane, not in it."),
      zw("Darum ist α das Komplement des Winkels zwischen u und n.", "That is why α is the complement of the angle between u and n."),
    ],
    ansatz: [zw("Welche beiden Vektoren brauchst du?", "Which two vectors do you need?"), zw("Richtungsvektor u der Geraden und Normalenvektor n der Ebene.", "The direction vector u of the line and the normal vector n of the plane."), zw("Rechne mit dem Sinus statt dem Kosinus.", "Compute with the sine instead of the cosine.")],
    regel: [zw("Welche Formel?", "Which formula?"), zw("sin α = |u · n| / (|u| · |n|).", "sin α = |u · n| / (|u| · |n|)."), zw("Betragsstriche im Zähler sichern α ≤ 90°.", "Absolute value bars in the numerator ensure α ≤ 90°.")],
    pruefen: [zw("Ist α höchstens 90°?", "Is α at most 90°?"), zw("Bei u · n = 0 muss α = 0° herauskommen (Gerade parallel zur Ebene).", "For u · n = 0 you must get α = 0° (line parallel to the plane)."), zw("Bei u parallel zu n muss α = 90° herauskommen.", "For u parallel to n you must get α = 90°.")],
    regeln: [{ name: "Orthogonalität", bereich: "vektoren" }],
  });
  const un = u && nv ? skalar(u, nv) : 0;
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Gerade-Ebene-Winkel", "Line–plane angle")}</p>
        <IchHaengeFest kontext={hilfe} />
      </div>
      <p style={hinweis}>{zw("Der Winkel zwischen Gerade und Ebene wird mit dem Sinus berechnet – nicht mit dem Kosinus.", "The angle between line and plane is computed with the sine – not with the cosine.")}</p>
      <EingabeVektoren namen={["u", "n"]} w={w} setW={setW} farben={[farbA, farbB]} zuruecksetzen={() => { setPr(null); setFormel(null); }} />
      {fehler ? <Rueck art="warn">{fehler}</Rueck> : <GeBild u={u} nv={nv} />}
      <p style={{ fontSize: 12.5, color: C.hellgrau, marginTop: 6 }}>{zw("u: Richtungsvektor der Geraden · n: Normalenvektor der Ebene", "u: direction vector of the line · n: normal vector of the plane")}</p>
      {!fehler && (
        <>
          {schritt(1, zw("Welche Formel passt?", "Which formula fits?"))}
          <Auswahl label={zw("Formel wählen", "Choose formula")} wert={formel} setWert={setFormel}
            optionen={[["sin", "sin α = |u·n| / (|u|·|n|)"], ["cos", "cos α = |u·n| / (|u|·|n|)"], ["tan", "tan α = |u·n| / (|u|·|n|)"]]}
            status={formel ? (formel === "sin" ? "gut" : "schlecht") : undefined} />
          {formel && <Rueck art={formel === "sin" ? "gut" : "schlecht"}>{formel === "sin" ? zw("Richtig: Der Sinus, weil n senkrecht auf der Ebene steht.", "Right: the sine, because n is perpendicular to the plane.") : zw("Das ist nicht die Formel für den Winkel zur Ebene. Mit dem Kosinus bekommst du den Winkel zwischen u und n – das Komplement von α.", "That is not the formula for the angle to the plane. The cosine gives the angle between u and n – the complement of α.")}</Rueck>}
          {schritt(2, zw("Berechne α (in Grad)", "Compute α (in degrees)"))}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ ...zeile, fontSize: 17 }}>α =</span>
            <ZahlFeld wert={antwort} setWert={(v) => { setAntwort(v); setPr(null); }} label={zw("Winkel in Grad", "Angle in degrees")} onEnter={pruefen} breite={92} platzhalter="°" />
          </div>
          <GrosserKnopf onClick={pruefen} disabled={antwort.trim() === ""}>{zw("Prüfen", "Check")}</GrosserKnopf>
          {pr && <Rueck art={pr.art}>{pr.text}</Rueck>}
          {pr && pr.art !== "warn" && (
            <div style={box}>
              <div style={zeile}><M t={`\\sin\\alpha = \\frac{|\\vec{u}\\cdot\\vec{n}|}{|\\vec{u}|\\cdot|\\vec{n}|} = \\frac{|${n(un)}|}{\\sqrt{${skalar(u, u)}}\\cdot\\sqrt{${skalar(nv, nv)}}} \\approx ${dez(Math.abs(un) / (laenge(u) * laenge(nv)), 4)}`} /></div>
              <div style={zeile}><M t={`\\alpha \\approx ${dez(alpha, 1)}°`} /></div>
              <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, marginTop: 4 }}>{zw(`Zur Probe: Der Winkel zwischen u und n wäre ${dez(winkelZwischen(u, nv), 1)}°; α ist das Komplement dazu (bis auf das Vorzeichen).`, `Check: the angle between u and n would be ${dez(winkelZwischen(u, nv), 1)}°; α is its complement (up to sign).`)}</p>
            </div>
          )}
        </>
      )}
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

/* ======================================================================
   Karte „Winkel und Skalarprodukt“
   ====================================================================== */

const WINKEL_MODI = [
  { id: "skalar", name: ["Skalarprodukt verstehen", "Understanding the dot product"] },
  { id: "winkel", name: ["Vektorwinkel", "Angle between vectors"] },
  { id: "ge", name: ["Gerade-Ebene-Winkel", "Line–plane angle"] },
];

export function WinkelSkalarprodukt() {
  const [modus, setModus] = useState("skalar");
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>{zw("Winkel und Skalarprodukt", "Angles and the dot product")}</h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        {zw("Schätze Winkel am Bild, berechne das Skalarprodukt und leite daraus Winkel zwischen Vektoren, Geraden und Ebenen ab.", "Estimate angles from the picture, compute the dot product and derive angles between vectors, lines and planes.")}
      </p>
      <div role="tablist" aria-label={zw("Winkel-Übungen", "Angle exercises")} style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        {WINKEL_MODI.map((m) => {
          const an = modus === m.id;
          return (
            <button key={m.id} type="button" role="tab" aria-selected={an} onClick={() => setModus(m.id)}
              style={{ minHeight: 48, padding: "8px 10px", borderRadius: 14, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700,
                border: `1px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see, boxShadow: an ? "0 4px 14px rgba(0,77,152,0.25)" : "none" }}>
              {zw(m.name[0], m.name[1])}
            </button>
          );
        })}
      </div>
      <div style={{ display: modus === "skalar" ? "block" : "none" }}><SkalarproduktVerstehen /></div>
      <div style={{ display: modus === "winkel" ? "block" : "none" }}><Vektorwinkel /></div>
      <div style={{ display: modus === "ge" ? "block" : "none" }}><GeradeEbeneWinkel /></div>
    </div>
  );
}
