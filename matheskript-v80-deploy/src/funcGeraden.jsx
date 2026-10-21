/* ============================================================
   Vektoren-Bereich: zwei Karten
   · Geraden im Raum: Punktprobe mit beweglichem Parameter, Gerade vs. Gerade
     (identisch, parallel, schneidend, windschief), Gerade vs. Ebene
   · Winkel und Skalarprodukt: Skalarprodukt verstehen, Vektorwinkel,
     Gerade-Ebene-Winkel
   Erst vermuten, dann rechnerisch prüfen. Alle Rechnungen exakt
   (rechnen2.js), 3D-Bild aus func20 (Raum3) wiederverwendet.
   Gestaltung (21.10.): Bausteine aus vekUi.jsx – jedes Objekt in einer
   eigenen Box (g links in Blau, h/E/P rechts in Gold), Vermutung als
   Kacheln mit Bildzeichen, Rechnung als nummerierte Zeitleiste.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useState } from "react";
import { useStateGebucht } from "./buchung.jsx";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Einzeilig } from "./func19.jsx";
import { FS, Gl, Name, Raum3, Vek, koordText, n } from "./func20.jsx";
import { Feld, leseVektor } from "./func23.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { ZahlFeld, hilfeKontext, zw } from "./ui2.jsx";
import { neueLageGE, neueLageGG, neuePunktprobe, neuesVektorPaar } from "./aufgaben2.js";
import {
  dez, laenge, lageGE, lageGG, nullVek, punktprobe, q, qAdd, qGleich, qLies, qMul, qNum, qTex, skalar, winkelGeradeEbene, winkelZwischen,
} from "./rechnen2.js";
import { Bild, Ergebnis, FallWahl, Fusszeile, HauptKnopf, Hinweis, ModusReiter, ObjektBox, ObjektReihe, RSchritt, Rechenweg, Tafel, TippKacheln, VF, VekArbeit, VekBild, VekSeite } from "./vekUi.jsx";
import { useDesktop } from "./arbeitsflaeche.jsx";

/* Objektfarben: g (erstes Objekt) Blau, h / E / P (zweites Objekt) Gold, Ergebnis Smaragd */
const F1 = VF.eins, F2 = VF.zwei, F2T = VF.zweiText;

const zeile = { fontSize: 16.5, lineHeight: 1.9, color: C.tinte, overflowX: "auto", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 };
const erklaer = { fontSize: 13.5, color: C.grau, lineHeight: 1.6, whiteSpace: "normal", margin: "6px 0 0" };
const sp = (v) => `\\spalte{${n(v[0])}}{${n(v[1])}}{${n(v[2])}}`;
const ROEM = ["I", "II", "III"];
const Roem = ({ r }) => (
  <span style={{ minWidth: 28, height: 22, padding: "0 6px", borderRadius: 999, background: C.weiss, border: `1px solid ${C.linie}`, color: C.grau,
    fontSize: 11.5, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ROEM[r]}</span>
);

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
const mkI = (x) => (x < 0 ? `(${n(x)})` : n(x));

/* ---------- Desktop (ab 840 px, DESKTOP-STIL.md) ----------
   Ein Modus: Boxen und Vermutung links (VekArbeit), Bild rechts mit Werkzeugleiste, Rechnung darunter über die volle Breite.
   Tafeln in der Arbeitsfläche ohne Abstand oben und ohne Schatten (feine Karten wie die Geschwister-Seiten). */
const TAFEL_BREIT = { marginTop: 0, boxShadow: "none" };
function ModusBreit({ id, links, rechts, unten, fuss }) {
  return (
    <div data-vek-modus={id} data-ger-breit={id}>
      <VekArbeit linksBreite={360} links={links} rechts={rechts} />
      {unten && <div data-ger-rechnung="" style={{ marginTop: 6 }}>{unten}</div>}
      {fuss}
    </div>
  );
}

/* ---------- Objekt-Boxen ---------- */

function GeradeBox({ name, A, u, farbe, par = "t" }) {
  return (
    <ObjektBox farbe={farbe} name={name} art={zw("Gerade", "Line")}>
      <Einzeilig max={18} min={10}>
        <Name t="x" farbe={C.tinte} /><Gl /><Vek w={A.map(n)} farbe={farbe === F2 ? F2T : farbe} /><span>+ {par} ·</span><Vek w={u.map(n)} farbe={farbe === F2 ? F2T : farbe} />
      </Einzeilig>
    </ObjektBox>
  );
}

function PunktBox({ name, P, farbe }) {
  return (
    <ObjektBox farbe={farbe} name={name} art={zw("Punkt", "Point")}>
      <Einzeilig max={19} min={11}>
        <span style={{ color: farbe === F2 ? F2T : farbe }}>{name}</span>
        <span style={{ color: C.tinte }}>({P.map(n).join(" | ")})</span>
      </Einzeilig>
    </ObjektBox>
  );
}

function EbeneBox({ name, nv, d, farbe }) {
  return (
    <ObjektBox farbe={farbe} name={name} art={zw("Ebene", "Plane")}>
      <Einzeilig max={18} min={10}><span style={{ color: C.tinte }}>{koordText(nv, d)}</span></Einzeilig>
    </ObjektBox>
  );
}

/* ======================================================================
   Punktprobe
   ====================================================================== */

function ProbeZeilen({ A, u, P, pp, punktName = "P" }) {
  return (
    <>
      {pp.zeilen.map((z) => (
        <div key={z.r} style={zeile}>
          <Roem r={z.r} />
          {z.frei
            ? <><M t={`${n(P[z.r])} = ${n(A[z.r])}`} /><span style={{ color: z.ok ? C.smaragd : C.signal, fontWeight: 800 }}>{z.ok ? "✓" : "✗"}</span><span style={{ fontSize: 13, color: C.grau }}>{zw("(t fällt weg)", "(t drops out)")}</span></>
            : <M t={`${n(P[z.r])} = ${lin(A[z.r], u[z.r], "t")} \\Rightarrow t = ${qTex(z.t)}`} />}
        </div>
      ))}
      <p style={erklaer}>
        {pp.ok
          ? zw(`Alle Zeilen passen zum selben Parameter t = ${pp.t ? qTex(pp.t).replace(/\\frac\{(-?\d+)\}\{(\d+)\}/, "$1/$2") : "–"}.`, `All rows give the same parameter t = ${pp.t ? qTex(pp.t).replace(/\\frac\{(-?\d+)\}\{(\d+)\}/, "$1/$2") : "–"}.`)
          : zw("Die Zeilen liefern verschiedene Werte für t – ein Widerspruch.", "The rows give different values for t – a contradiction.")}
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
  const loesung = au.auf ? "auf" : "nicht";
  const richtig = vm === loesung;
  const kurz = (x) => String(Math.round(x * 10) / 10).replace(".", ",").replace("-", "−");
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
  const desktop = useDesktop();
  const boxen = (
    <ObjektReihe>
      <GeradeBox name="g" A={au.A} u={au.u} farbe={F1} />
      <PunktBox name="P" P={au.P} farbe={F2} />
    </ObjektReihe>
  );
  const raum = (breit) => (
    <Raum3 key={[...au.A, ...au.u, ...au.P].join()} gerade={{ p: au.A, r: au.u, farbe: F1 }}
      punkte={[{ p: au.A, label: "A", farbe: F1 }, { p: au.P, label: "P", farbe: F2T }, { p: pt, label: "Aₜ", farbe: FS }]}
      legende={[{ text: "g", farbe: F1 }, { text: "P", farbe: F2, art: "punkt" }, { text: "Aₜ", farbe: FS, art: "punkt" }]} arbeitsflaeche={breit} />
  );
  const regler = (
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 12px", marginTop: desktop ? 0 : 10, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "10px 12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 220px", fontSize: 14, fontWeight: 700, color: C.tinte }}>
          <span style={{ whiteSpace: "nowrap" }}>{zw("Parameter", "Parameter")} t</span>
          <span style={{ minWidth: 42, height: 28, borderRadius: 8, background: VF.dreiHell, color: "#1F6E44", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{kurz(t)}</span>
          <input type="range" min={-4} max={4} step={0.5} value={t} onChange={(e) => setT(Number(e.target.value))} aria-label={zw("Parameter t", "Parameter t")} style={{ flex: 1, minWidth: 80, accentColor: FS }} />
        </label>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: C.grau, whiteSpace: "nowrap" }}>Aₜ({pt.map(kurz).join(" | ")})</span>
      </div>
  );
  const vermutung = (stil) => (
      <Tafel nr={1} titel={zw("Deine Vermutung", "Your guess")} text={zw("Liegt P auf der Geraden g? Bewege t und schau, ob Aₜ den Punkt P trifft.", "Is P on the line g? Move t and see whether Aₜ hits P.")} stil={stil}>
        <TippKacheln label={zw("Vermutung", "Guess")} wert={vm} setWert={setVm} loesung={vm !== null ? loesung : undefined}
          optionen={[["auf", zw("P liegt auf g", "P is on g"), "auf"], ["nicht", zw("P liegt nicht auf g", "P is not on g"), "nicht-auf"]]} />
        {vm !== null && (
          <Hinweis art={richtig ? "gut" : "schlecht"}>
            {richtig ? zw("Deine Vermutung stimmt – die Rechnung beweist es.", "Your guess is right – the calculation proves it.") : zw("Die Vermutung stimmt nicht – an der Rechnung siehst du, welche Zeile den Ausschlag gibt.", "The guess is wrong – the calculation shows which row decides.")}
          </Hinweis>
        )}
      </Tafel>
  );
  const rechnung = vm !== null && (
        <Tafel nr={2} titel={zw("Rechnung", "Calculation")}>
          <Rechenweg>
            <RSchritt nr="1" titel={zw("Ansatz: P = A + t · u", "Set up: P = A + t · u")}>
              <div style={zeile}><M t={`${sp(au.P)} = ${sp(au.A)} + t \\cdot ${sp(au.u)}`} /></div>
            </RSchritt>
            <RSchritt nr="2" titel={zw("Jede Zeile nach t auflösen", "Solve every row for t")}>
              <ProbeZeilen A={au.A} u={au.u} P={au.P} pp={au.pp} />
            </RSchritt>
            <Ergebnis bild={<Bild art={au.auf ? "auf" : "nicht-auf"} breite={44} />} art={au.auf ? "gut" : "info"}>
              {au.auf ? zw("P liegt auf der Geraden g.", "P lies on the line g.") : zw("P liegt nicht auf der Geraden g.", "P does not lie on the line g.")}
            </Ergebnis>
          </Rechenweg>
        </Tafel>
  );
  const fuss = <Fusszeile neu={neu} hilfe={<IchHaengeFest kontext={hilfe} />} />;

  if (desktop) {
    return <ModusBreit id="probe" links={<>{boxen}{regler}{vermutung(TAFEL_BREIT)}</>} rechts={raum(true)} unten={rechnung} fuss={fuss} />;
  }

  return (
    <div data-vek-modus="probe">
      {boxen}
      <div style={{ marginTop: 12 }}>
        {raum(false)}
      </div>
      {regler}

      {vermutung()}

      {rechnung}
      {fuss}
    </div>
  );
}

/* ======================================================================
   Gerade vs. Gerade
   ====================================================================== */

const ART_GG = { identisch: ["identisch", "identical"], parallel: ["echt parallel", "parallel and distinct"], schneidend: ["schneidend", "intersecting"], windschief: ["windschief", "skew"] };
const TIPP_GG = { identisch: ["identisch", "identical"], parallel: ["echt parallel", "parallel"], schneidend: ["schneiden sich", "intersect"], windschief: ["windschief", "skew"] };
const SATZ_GG = {
  identisch: ["Die Geraden sind identisch.", "The lines are identical."],
  parallel: ["Die Geraden sind echt parallel.", "The lines are parallel and distinct."],
  schneidend: ["Die Geraden schneiden sich.", "The lines intersect."],
  windschief: ["Die Geraden sind windschief.", "The lines are skew."],
};

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
  const ab = Object.keys(ART_GG);
  const desktop = useDesktop();
  const fallWahl = (titel) => (
    <FallWahl titel={titel} label={zw("Fall wählen", "Choose a case")} wert={fall} setWert={waehleFall}
      optionen={[["zufall", zw("Zufall", "Random"), "zufall"], ...ab.map((id) => [id, zw(ART_GG[id][0], ART_GG[id][1]), id])]} />
  );
  const boxen = (
    <ObjektReihe>
      <GeradeBox name="g" A={A} u={u} farbe={F1} par="t" />
      <GeradeBox name="h" A={B} u={v} farbe={F2} par="s" />
    </ObjektReihe>
  );
  const raum = (breit) => (
    <Raum3 key={[...A, ...u, ...B, ...v].join()}
      punkte={[{ p: A, label: "A", farbe: F1 }, { p: B, label: "B", farbe: F2T }, ...(L.S && vm ? [{ p: numPunkt(L.S), label: "S", farbe: FS }] : [])]}
      gerade={{ p: A, r: u, farbe: F1, ohnePfeil: true }} gerade2={{ p: B, r: v, farbe: F2 }}
      legende={[{ text: "g", farbe: F1 }, { text: "h", farbe: F2 }, L.S && vm ? { text: "S", farbe: FS, art: "punkt" } : null]}
      arbeitsflaeche={breit} gruppen={breit ? [{ titel: zw("Übungsfall", "Practice case"), inhalt: fallWahl(null) }] : []} />
  );
  const vermutung = (stil) => (
      <Tafel nr={1} titel={zw("Deine Vermutung", "Your guess")} text={zw("Wie liegen g und h zueinander? Dreh das Bild, bevor du dich festlegst.", "How are g and h positioned? Rotate the picture before you decide.")} stil={stil}>
        <TippKacheln label={zw("Vermutung", "Guess")} wert={vm} setWert={setVm} loesung={vm ? au.art : undefined}
          optionen={ab.map((id) => [id, zw(TIPP_GG[id][0], TIPP_GG[id][1]), id])} />
        {vm && (
          <Hinweis art={richtig ? "gut" : "schlecht"}>
            {richtig ? zw(`Richtig: Die Geraden sind ${ART_GG[au.art][0]}. Die Rechnung beweist es.`, `Right: the lines are ${ART_GG[au.art][1]}. The calculation proves it.`)
              : zw(`Nicht ganz: Die Geraden sind ${ART_GG[au.art][0]}. Die Rechnung zeigt, woran man es erkennt.`, `Not quite: the lines are ${ART_GG[au.art][1]}. The calculation shows how to tell.`)}
          </Hinweis>
        )}
      </Tafel>
  );
  const rechnung = vm && (
        <Tafel nr={2} titel={zw("Rechnung", "Calculation")}>
          <Rechenweg>
            {pk ? (
              <>
                <RSchritt nr="1" titel={zw("Sind die Richtungsvektoren Vielfache?", "Are the direction vectors multiples?")}>
                  <div style={zeile}><M t={`${sp(v)} = ${mk(kFaktor)} \\cdot ${sp(u)}`} /></div>
                  <p style={erklaer}>{zw(`Ja, mit k = ${qTex(kFaktor).replace(/\\frac\{(-?\d+)\}\{(\d+)\}/, "$1/$2")}: g und h sind parallel oder identisch.`, `Yes, with k = ${qTex(kFaktor).replace(/\\frac\{(-?\d+)\}\{(\d+)\}/, "$1/$2")}: g and h are parallel or identical.`)}</p>
                </RSchritt>
                <RSchritt nr="2" titel={zw("Liegt B auf g? (Punktprobe)", "Is B on g? (point test)")}>
                  <ProbeZeilen A={A} u={u} P={B} pp={pp} punktName="B" />
                  <p style={erklaer}>{pp.ok ? zw("B liegt auf g – also liegt ganz h auf g.", "B lies on g – so all of h lies on g.") : zw("B liegt nicht auf g – die Geraden haben keinen gemeinsamen Punkt.", "B is not on g – the lines have no common point.")}</p>
                </RSchritt>
              </>
            ) : (
              <>
                <RSchritt nr="1" titel={zw("Sind die Richtungsvektoren Vielfache?", "Are the direction vectors multiples?")}>
                  <div style={zeile}><M t={`\\vec{u} \\times \\vec{v} = ${sp(L.uv)} \\neq \\vec{0}`} /></div>
                  <p style={erklaer}>{zw("Nein: g und h sind nicht parallel. Jetzt gleichsetzen – mit zwei verschiedenen Parametern t und s.", "No: g and h are not parallel. Now set them equal – with two different parameters t and s.")}</p>
                </RSchritt>
                <RSchritt nr="2" titel={zw("g und h gleichsetzen", "Set g and h equal")}>
                  {[0, 1, 2].map((r) => <div key={r} style={zeile}><Roem r={r} /><M t={`${lin(A[r], u[r], "t")} = ${lin(B[r], v[r], "s")}`} /></div>)}
                </RSchritt>
                <RSchritt nr="3" titel={zw(`Zeilen ${ROEM[L.zeilen[0]]} und ${ROEM[L.zeilen[1]]} lösen`, `Solve rows ${ROEM[L.zeilen[0]]} and ${ROEM[L.zeilen[1]]}`)}>
                  <div style={zeile}><M t={`t = ${qTex(L.t)},\\quad s = ${qTex(L.s)}`} /></div>
                </RSchritt>
                <RSchritt nr="4" titel={zw(`Probe in Zeile ${ROEM[L.dritte]}`, `Check in row ${ROEM[L.dritte]}`)}>
                  <div style={zeile}><span style={{ fontSize: 12.5, fontWeight: 700, color: F1, minWidth: 16 }}>g</span><M t={`${n(A[L.dritte])} + ${mk(L.t)} \\cdot ${mkI(u[L.dritte])} = ${qTex(dritteLinks)}`} /></div>
                  <div style={zeile}><span style={{ fontSize: 12.5, fontWeight: 700, color: F2T, minWidth: 16 }}>h</span><M t={`${n(B[L.dritte])} + ${mk(L.s)} \\cdot ${mkI(v[L.dritte])} = ${qTex(dritteRechts)}`} /></div>
                  <p style={erklaer}>
                    {qGleich(dritteLinks, dritteRechts)
                      ? zw("Beide Seiten sind gleich: Die Geraden haben einen gemeinsamen Punkt.", "Both sides are equal: the lines share a point.")
                      : zw("Die Seiten sind verschieden – ein Widerspruch: Es gibt keinen gemeinsamen Punkt.", "The sides differ – a contradiction: there is no common point.")}
                  </p>
                </RSchritt>
              </>
            )}
            <Ergebnis bild={<Bild art={au.art} breite={44} />} art="gut"
              zusatz={L.S ? <span>{zw("Schnittpunkt", "Intersection point")} <M t={`S${punktQ(L.S)}`} /></span> : null}>
              {zw(SATZ_GG[au.art][0], SATZ_GG[au.art][1])}
            </Ergebnis>
          </Rechenweg>
        </Tafel>
  );
  const fuss = <Fusszeile neu={() => neu()} hilfe={<IchHaengeFest kontext={hilfe} />} />;

  if (desktop) {
    return <ModusBreit id="gg" links={<>{boxen}{vermutung(TAFEL_BREIT)}</>} rechts={raum(true)} unten={rechnung} fuss={fuss} />;
  }

  return (
    <div data-vek-modus="gg">
      <div style={{ marginBottom: 12 }}>
        {fallWahl(zw("Übungsfall", "Practice case"))}
      </div>
      {boxen}
      <div style={{ marginTop: 12 }}>
        {raum(false)}
      </div>

      {vermutung()}

      {rechnung}
      {fuss}
    </div>
  );
}

/* ======================================================================
   Gerade vs. Ebene
   ====================================================================== */

const ART_GE = { schneidend: ["Gerade schneidet die Ebene", "line meets the plane"], parallel: ["parallel, ohne Schnitt", "parallel, no intersection"], enthalten: ["Gerade liegt in der Ebene", "line lies in the plane"] };
const TIPP_GE = { schneidend: ["schneidet E", "meets E"], parallel: ["parallel zu E", "parallel to E"], enthalten: ["liegt in E", "lies in E"] };
const SATZ_GE = {
  schneidend: ["g schneidet E in genau einem Punkt.", "g meets E in exactly one point."],
  parallel: ["g ist echt parallel zu E.", "g is parallel to E, with no common point."],
  enthalten: ["g liegt ganz in der Ebene E.", "g lies completely in the plane E."],
};

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
  const desktop = useDesktop();
  const fallWahl = (titel) => (
    <FallWahl titel={titel} label={zw("Fall wählen", "Choose a case")} wert={fall} setWert={waehleFall}
      optionen={[["zufall", zw("Zufall", "Random"), "zufall"], ["schneidend", zw("schneidend", "intersecting"), "ge-schneidend"], ["parallel", zw("parallel", "parallel"), "ge-parallel"], ["enthalten", zw("enthalten", "contained"), "ge-enthalten"]]} />
  );
  const boxen = (
    <ObjektReihe>
      <GeradeBox name="g" A={A} u={u} farbe={F1} par="t" />
      <EbeneBox name="E" nv={nv} d={d} farbe={F2} />
    </ObjektReihe>
  );
  const raum = (breit) => (
    <Raum3 key={[...A, ...u, ...nv, d].join()} punkte={[{ p: A, label: "A", farbe: F1 }, ...(L.S && vm ? [{ p: numPunkt(L.S), label: "S", farbe: FS }] : [])]}
      gerade={{ p: A, r: u, farbe: F1 }} ebene={{ n: nv, d, farbe: F2 }}
      legende={[{ text: "g", farbe: F1 }, { text: "E", farbe: F2, art: "flaeche" }, L.S && vm ? { text: "S", farbe: FS, art: "punkt" } : null]}
      arbeitsflaeche={breit} gruppen={breit ? [{ titel: zw("Übungsfall", "Practice case"), inhalt: fallWahl(null) }] : []} />
  );
  const vermutung = (stil) => (
      <Tafel nr={1} titel={zw("Deine Vermutung", "Your guess")} text={zw("Wie liegt die Gerade g zur Ebene E?", "How does the line g lie relative to the plane E?")} stil={stil}>
        <TippKacheln spalten={3} label={zw("Vermutung", "Guess")} wert={vm} setWert={setVm} loesung={vm ? au.art : undefined}
          optionen={Object.keys(ART_GE).map((id) => [id, zw(TIPP_GE[id][0], TIPP_GE[id][1]), `ge-${id}`])} />
        {vm && (
          <Hinweis art={richtig ? "gut" : "schlecht"}>
            {richtig ? zw("Richtig – die Rechnung beweist es.", "Right – the calculation proves it.") : zw(`Nicht ganz: ${ART_GE[au.art][0]}. Die Rechnung zeigt es.`, `Not quite: ${ART_GE[au.art][1]}. The calculation shows it.`)}
          </Hinweis>
        )}
      </Tafel>
  );
  const rechnung = vm && (
        <Tafel nr={2} titel={zw("Rechnung", "Calculation")}>
          <Rechenweg>
            <RSchritt nr="1" titel={zw("Richtung u gegen Normalenvektor n", "Direction u versus normal vector n")}>
              <div style={zeile}><M t={`\\vec{u} \\cdot \\vec{n} = ${n(u[0])} \\cdot ${mkI(nv[0])} + ${n(u[1])} \\cdot ${mkI(nv[1])} + ${n(u[2])} \\cdot ${mkI(nv[2])} = ${n(L.un)}`} /></div>
              <p style={erklaer}>{L.un !== 0
                ? zw("Ungleich 0: g verläuft nicht parallel zu E – es gibt genau einen Schnittpunkt.", "Not zero: g is not parallel to E – there is exactly one intersection point.")
                : zw("Gleich 0: Die Richtung steht senkrecht auf n – g ist parallel zu E oder liegt in E.", "Zero: the direction is perpendicular to n – g is parallel to E or lies in it.")}</p>
            </RSchritt>
            {L.un !== 0 ? (
              <>
                <RSchritt nr="2" titel={zw("Gerade in die Ebene einsetzen", "Plug the line into the plane")}>
                  <div style={zeile}><M t={`\\vec{n} \\cdot (\\vec{A} + t\\,\\vec{u}) = d`} /></div>
                  <div style={zeile}><M t={`${n(L.An)} + t \\cdot ${mkI(L.un)} = ${n(d)}`} /></div>
                  <div style={zeile}><M t={`t = ${qTex(L.t)}`} /></div>
                </RSchritt>
                <RSchritt nr="3" titel={zw("t in g einsetzen", "Plug t into g")}>
                  <div style={zeile}><M t={`S = ${punktQ(L.S)}`} /></div>
                </RSchritt>
              </>
            ) : (
              <RSchritt nr="2" titel={zw("Stützpunkt A in die Ebene einsetzen", "Plug the support point A into the plane")}>
                <div style={zeile}><M t={`\\vec{n} \\cdot \\vec{A} = ${n(L.An)}\\;\\text{und}\\; d = ${n(d)}`} /></div>
                <p style={erklaer}>{L.An === d ? zw("A liegt in E – und mit A die ganze Gerade.", "A lies in E – and with A the whole line.") : zw("A liegt nicht in E – die Gerade hat keinen Punkt mit E gemeinsam.", "A is not in E – the line has no point in common with E.")}</p>
              </RSchritt>
            )}
            <Ergebnis bild={<Bild art={`ge-${au.art}`} breite={44} />} art="gut"
              zusatz={L.S ? <span>{zw("Schnittpunkt", "Intersection point")} <M t={`S${punktQ(L.S)}`} /></span> : null}>
              {zw(SATZ_GE[au.art][0], SATZ_GE[au.art][1])}
            </Ergebnis>
          </Rechenweg>
        </Tafel>
  );
  const fuss = <Fusszeile neu={() => neu()} hilfe={<IchHaengeFest kontext={hilfe} />} />;

  if (desktop) {
    return <ModusBreit id="ge" links={<>{boxen}{vermutung(TAFEL_BREIT)}</>} rechts={raum(true)} unten={rechnung} fuss={fuss} />;
  }

  return (
    <div data-vek-modus="ge">
      <div style={{ marginBottom: 12 }}>
        {fallWahl(zw("Übungsfall", "Practice case"))}
      </div>
      {boxen}
      <div style={{ marginTop: 12 }}>
        {raum(false)}
      </div>

      {vermutung()}

      {rechnung}
      {fuss}
    </div>
  );
}

/* ======================================================================
   Seite „Geraden im Raum“
   ====================================================================== */

const GERADEN_MODI = [
  { id: "probe", name: ["Punktprobe", "Point test"], bild: "auf" },
  { id: "gg", name: ["Gerade – Gerade", "Line – line"], bild: "schneidend" },
  { id: "ge", name: ["Gerade – Ebene", "Line – plane"], bild: "ge-schneidend" },
];

/* Reiter-Daten für den Hub „Geraden“ (funcVekHub.jsx): id = modus-Prop */
export const GERADEN_MODUS_LISTE = GERADEN_MODI.map((m) => ({ id: m.id, name: m.name[0], bild: m.bild }));

const GERADEN_TITEL = {
  probe: ["Punktprobe", "Point test"],
  gg: ["Lage zweier Geraden", "Two lines"],
  ge: ["Gerade und Ebene", "Line and plane"],
};

/* modus (optional, vom Hub): steuert die Übung von außen; dann ohne eigene Reiter und mit dem Titel der Übung */
export function GeradenImRaum({ modus: modusAussen }) {
  const [modusInnen, setModus] = useState("probe");
  const gesteuert = !!modusAussen;
  const modus = gesteuert ? modusAussen : modusInnen;
  const titel = gesteuert ? zw(...GERADEN_TITEL[modus]) : zw("Geraden im Raum", "Lines in space");
  return (
    <VekSeite titel={titel}
      text={zw("Erst vermuten, dann rechnen: Liegt ein Punkt auf der Geraden, wie liegen zwei Geraden – und wie eine Gerade zur Ebene?", "Guess first, then calculate: is a point on the line, how do two lines lie – and a line relative to a plane?")}>
      {!gesteuert && <ModusReiter label={zw("Geraden-Übungen", "Line exercises")} wert={modus} setWert={setModus}
        modi={GERADEN_MODI.map((m) => ({ id: m.id, name: zw(m.name[0], m.name[1]), bild: m.bild }))} />}
      <div style={{ display: modus === "probe" ? "block" : "none" }}><Punktprobe /></div>
      <div style={{ display: modus === "gg" ? "block" : "none" }}><GeradeVsGerade /></div>
      <div style={{ display: modus === "ge" ? "block" : "none" }}><GeradeVsEbene /></div>
    </VekSeite>
  );
}

/* ======================================================================
   Winkel und Skalarprodukt
   ====================================================================== */

const farbA = F1, farbB = F2;
const bildRahmen = { width: "100%", display: "block", background: "radial-gradient(120% 90% at 50% 40%, #FFFFFF 0%, #F6F8FC 100%)", borderRadius: 18, border: `1px solid ${C.linie}` };
/* 2D-Bilder: Rahmen über die volle Breite, Zeichnung höchstens 460 px breit */
const BildRahmen = ({ children }) => <div style={{ ...bildRahmen, display: "flex", justifyContent: "center" }}><div style={{ width: "100%", maxWidth: 460 }}>{children}</div></div>;

/* Der Winkel zwischen a und b in ihrer gemeinsamen Ebene gezeichnet (Längen im richtigen Verhältnis) */
/* breite (Desktop): gemessene Breite in echten Pixeln – die Zeichnung wächst mit (Faktor f), Schrift und Striche bleiben gleich */
function WinkelBild({ a, b, projektion = false, namen = ["a", "b"], breite = 0 }) {
  const la = laenge(a), lb = laenge(b);
  const phi = (winkelZwischen(a, b) * Math.PI) / 180;
  const f = breite ? breite / 300 : 1;
  const W = 300 * f, H = 170 * f, O = [150 * f, 150 * f], s = (110 * f) / Math.max(la, lb);
  const Ea = [O[0] + s * la, O[1]];
  const Eb = [O[0] + s * lb * Math.cos(phi), O[1] - s * lb * Math.sin(phi)];
  const Fuss = [Eb[0], O[1]];
  const R = 28;
  const bogen = `M${O[0] + R},${O[1]} A${R},${R} 0 0 0 ${O[0] + R * Math.cos(phi)},${O[1] - R * Math.sin(phi)}`;
  const rechter = Math.abs(phi - Math.PI / 2) < 0.002;
  const grad = Math.round((phi * 180) / Math.PI * 10) / 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={zw("Winkel zwischen den Vektoren", "Angle between the vectors")} style={{ width: "100%", display: "block" }}>
      <defs>
        <marker id="pfa" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={farbA} /></marker>
        <marker id="pfb" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={farbB} /></marker>
      </defs>
      {projektion && <line x1={Eb[0]} y1={Eb[1]} x2={Fuss[0]} y2={Fuss[1]} stroke={C.hellgrau} strokeWidth="1.4" strokeDasharray="4 3" />}
      {projektion && <line x1={O[0]} y1={O[1] + 8} x2={Fuss[0]} y2={Fuss[1] + 8} stroke={C.flaggold} strokeWidth="4" strokeLinecap="round" />}
      <path d={`M${O[0]},${O[1]} L${O[0] + R * 1.9},${O[1]} A${R * 1.9},${R * 1.9} 0 0 0 ${O[0] + R * 1.9 * Math.cos(phi)},${O[1] - R * 1.9 * Math.sin(phi)} Z`} fill={VF.dreiHell} />
      <line x1={O[0]} y1={O[1]} x2={Ea[0]} y2={Ea[1]} stroke={farbA} strokeWidth="3" markerEnd="url(#pfa)" />
      <line x1={O[0]} y1={O[1]} x2={Eb[0]} y2={Eb[1]} stroke={farbB} strokeWidth="3" markerEnd="url(#pfb)" />
      {rechter ? <path d={`M${O[0] + 14},${O[1]} v-14 h-14`} fill="none" stroke={C.tinte} strokeWidth="1.6" /> : <path d={bogen} fill="none" stroke={C.tinte} strokeWidth="1.6" />}
      <text x={O[0] + R * 1.25 * Math.cos(phi / 2) + (rechter ? 8 : 4)} y={O[1] - R * 1.25 * Math.sin(phi / 2) + 4} fontSize="12.5" fontWeight="700" fill={C.tinte}>φ = {String(grad).replace(".", ",")}°</text>
      <text x={Ea[0] + 2} y={Ea[1] + 16} fontSize="13" fontWeight="800" fill={farbA} textAnchor="end">{namen[0]}</text>
      <text x={Eb[0] + (Eb[0] >= O[0] ? 6 : -6)} y={Eb[1] - 6} fontSize="13" fontWeight="800" fill={VF.zweiText} textAnchor={Eb[0] >= O[0] ? "start" : "end"}>{namen[1]}</text>
    </svg>
  );
}

/* Gerade und Ebene im Querschnitt: Winkel α zur Ebene, Normale dazu */
function GeBild({ u, nv, breite = 0 }) {
  const alpha = (winkelGeradeEbene(u, nv) * Math.PI) / 180;
  const f = breite ? breite / 300 : 1;          // Desktop: echte Pixel, Schrift bleibt gleich groß
  const W = 300 * f, H = 160 * f, O = [120 * f, 120 * f], L = 100 * f;
  const E = [O[0] + L * Math.cos(alpha), O[1] - L * Math.sin(alpha)];
  const R = 30;
  const grad = Math.round((alpha * 180) / Math.PI * 10) / 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={zw("Winkel zwischen Gerade und Ebene", "Angle between line and plane")} style={{ width: "100%", display: "block" }}>
      <rect x={20 * f} y={O[1]} width={260 * f} height={14} fill={VF.zweiHell} />
      <line x1={20 * f} y1={O[1]} x2={280 * f} y2={O[1]} stroke={VF.zwei} strokeWidth="2.4" />
      <text x={276 * f} y={O[1] + 30} fontSize="12" fontWeight="700" textAnchor="end" fill={VF.zweiText}>E</text>
      <line x1={O[0]} y1={O[1]} x2={O[0]} y2={20 * f} stroke={VF.zwei} strokeWidth="1.6" strokeDasharray="4 3" />
      <text x={O[0] + 6} y={20 * f + 6} fontSize="12" fontWeight="700" fill={VF.zweiText}>n</text>
      <line x1={O[0] - 0.4 * (E[0] - O[0])} y1={O[1] + 0.4 * (O[1] - E[1])} x2={E[0]} y2={E[1]} stroke={farbA} strokeWidth="3" strokeLinecap="round" />
      <text x={E[0] + 6} y={E[1] - 2} fontSize="13" fontWeight="800" fill={farbA}>g</text>
      <path d={`M${O[0] + R},${O[1]} A${R},${R} 0 0 0 ${O[0] + R * Math.cos(alpha)},${O[1] - R * Math.sin(alpha)}`} fill="none" stroke={C.tinte} strokeWidth="1.6" />
      <text x={O[0] + R * 1.35 * Math.cos(alpha / 2) + 4} y={O[1] - R * 1.35 * Math.sin(alpha / 2) + 14} fontSize="12.5" fontWeight="700" fill={C.tinte}>α = {String(grad).replace(".", ",")}°</text>
    </svg>
  );
}

/* zwei bzw. ein Vektor als Eingabe: Werte als Strings, Ergebnis als Zahlenvektoren */
function useVektoren(startAB) {
  const [w, setW] = useState(() => startAB.map((v) => v.map(String)));
  const gelesen = w.map((x) => leseVektor(x.map((s) => String(s).replace("−", "-"))));
  const fehler = gelesen.some((x) => x === null) ? zw("Bitte alle Komponenten als ganze Zahlen eintragen.", "Please enter all components as integers.")
    : gelesen.some((x) => nullVek(x)) ? zw("Der Nullvektor hat keine Richtung – dafür gibt es keinen Winkel.", "The zero vector has no direction – there is no angle for it.") : null;
  return { w, setW, gelesen, fehler };
}

const wirf = (v) => v.map((x) => String(x).replace("-", "−"));

/* Ein Vektor in seiner Box: drei Felder in Klammern */
function VektorBox({ name, art, farbe, werte, setWerte }) {
  const setze = (i) => (v) => { const x = [...werte]; x[i] = v; setWerte(x); };
  return (
    <ObjektBox farbe={farbe} name={<Name t={name} farbe={C.weiss} />} art={art}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <span style={{ display: "inline-flex", flexDirection: "column", gap: 4, padding: "3px 6px", borderLeft: `2px solid ${farbe}`, borderRight: `2px solid ${farbe}`, borderRadius: 10 }}>
          {[0, 1, 2].map((i) => <Feld key={i} wert={werte[i]} setWert={setze(i)} label={`${name} ${zw("Komponente", "component")} ${i + 1}`} farbe={farbe === F2 ? F2T : farbe} breite={52} />)}
        </span>
      </div>
    </ObjektBox>
  );
}

function VektorBoxen({ namen, arten, w, setW, zuruecksetzen }) {
  return (
    <ObjektReihe min={130}>
      {namen.map((nm, i) => (
        <VektorBox key={nm} name={nm} art={arten[i]} farbe={i === 0 ? farbA : farbB} werte={w[i]}
          setWerte={(x) => { const kopie = w.map((v) => [...v]); kopie[i] = x; setW(kopie); zuruecksetzen && zuruecksetzen(); }} />
      ))}
    </ObjektReihe>
  );
}

const WINKELARTEN = [["spitz", ["spitz", "acute"], ["unter 90°", "below 90°"]], ["recht", ["rechtwinklig", "right"], ["genau 90°", "exactly 90°"]], ["stumpf", ["stumpf", "obtuse"], ["über 90°", "above 90°"]]];
const winkelOptionen = () => WINKELARTEN.map(([id, t, z]) => [id, <span key={id}>{zw(t[0], t[1])}<span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: C.grau }}>{zw(z[0], z[1])}</span></span>, id]);

/* ---------- Skalarprodukt verstehen ---------- */

/* Winkel konkret bestimmen – komplette Rechnung mit der Kosinus-Formel (Schritte ab start) */
function WinkelRechnung({ a, b, ab, start = 2 }) {
  const la2 = skalar(a, a), lb2 = skalar(b, b);
  const cosw = ab / (laenge(a) * laenge(b));
  const phi = winkelZwischen(a, b);
  const kl = (v) => (v < 0 ? `(${n(v)})` : n(v));
  const quad = (v) => v.map((x) => `${kl(x)}^2`).join(" + ");
  return (
    <>
      <RSchritt nr={start} titel={zw("Die Formel für den Winkel", "The formula for the angle")}>
        <div style={zeile}><M t={"\\cos\\varphi = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|\\cdot|\\vec{b}|}"} /></div>
        <p style={erklaer}>{zw("Skalarprodukt geteilt durch das Produkt der Längen. Für den spitzen Winkel zwischen zwei Geraden setzt du im Zähler Betragsstriche: |a · b|.", "Dot product divided by the product of the lengths. For the acute angle between two lines, use absolute value bars in the numerator: |a · b|.")}</p>
      </RSchritt>
      <RSchritt nr={start + 1} titel={zw("Die Längen der Vektoren", "The lengths of the vectors")}>
        <div style={zeile}><M t={`|\\vec{a}| = \\sqrt{${quad(a)}} = \\sqrt{${la2}}`} /></div>
        <div style={zeile}><M t={`|\\vec{b}| = \\sqrt{${quad(b)}} = \\sqrt{${lb2}}`} /></div>
      </RSchritt>
      <RSchritt nr={start + 2} titel={zw("Einsetzen", "Plug in")}>
        <div style={zeile}><M t={`\\cos\\varphi = \\frac{${n(ab)}}{\\sqrt{${la2}}\\cdot\\sqrt{${lb2}}} \\approx ${dez(cosw, 4)}`} /></div>
      </RSchritt>
      <RSchritt nr={start + 3} titel={zw("Mit arccos zum Winkel", "Get the angle with arccos")}>
        <div style={zeile}><M t={`\\varphi = \\arccos(${dez(cosw, 4)}) \\approx ${dez(phi, 1)}°`} /></div>
        <p style={erklaer}>{zw("Taschenrechner auf Gradmaß (DEG) stellen.", "Set your calculator to degrees (DEG).")}</p>
      </RSchritt>
    </>
  );
}

function SkalarproduktVerstehen() {
  const start = useState(() => neuesVektorPaar(0.25))[0];
  const { w, setW, gelesen, fehler } = useVektoren([start.a, start.b]);
  const [vm, setVm] = useState(null);
  const [antwort, setAntwort] = useState("");
  const [pr, setPr] = useStateGebucht(null);
  const [winkelAn, setWinkelAn] = useState(false);
  const neu = () => { const p = neuesVektorPaar(0.25); setW([wirf(p.a), wirf(p.b)]); setVm(null); setAntwort(""); setPr(null); setWinkelAn(false); };
  const [a, b] = gelesen;
  const ab = a && b ? skalar(a, b) : null;
  const art = ab === null ? null : ab > 0 ? "spitz" : ab < 0 ? "stumpf" : "recht";
  const geprueft = pr && pr.art !== "warn";
  const pruefen = () => {
    const x = qLies(antwort);
    if (x === null || x.n !== 1) { setPr({ art: "warn", text: zw("Bitte das Skalarprodukt als ganze Zahl eintragen.", "Please enter the dot product as an integer.") }); return; }
    setPr({ art: x.z === ab ? "gut" : "schlecht",
      text: x.z === ab ? zw("Richtig gerechnet!", "Correct!") : zw("Nicht ganz: Multipliziere komponentenweise und addiere die drei Produkte.", "Not quite: multiply component by component and add the three products.") });
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
  const desktop = useDesktop();
  const boxen = <VektorBoxen namen={["a", "b"]} arten={[zw("Vektor", "Vector"), zw("Vektor", "Vector")]} w={w} setW={setW} zuruecksetzen={() => { setPr(null); setVm(null); setWinkelAn(false); }} />;
  const fehlerText = fehler && <Hinweis art="warn">{fehler}</Hinweis>;
  const vermutung = (stil) => (
          <Tafel nr={1} titel={zw("Deine Vermutung", "Your guess")} text={zw("Welcher Winkel liegt zwischen a und b?", "Which angle lies between a and b?")} stil={stil}>
            <TippKacheln spalten={3} label={zw("Winkelart", "Type of angle")} wert={vm} setWert={(v) => { setVm(v); setPr(null); }}
              loesung={geprueft ? art : undefined} optionen={winkelOptionen()} />
          </Tafel>
  );
  const rechnen = (stil) => (
          <Tafel nr={2} titel={zw("Rechne das Skalarprodukt", "Compute the dot product")} stil={stil}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...zeile, fontSize: 17 }}><M t="\vec{a} \cdot \vec{b} =" /></span>
              <ZahlFeld wert={antwort} setWert={(v) => { setAntwort(v); setPr(null); }} label={zw("Skalarprodukt", "Dot product")} onEnter={pruefen} breite={84} />
              <HauptKnopf onClick={pruefen} disabled={vm === null || antwort.trim() === ""} stil={{ marginLeft: "auto" }}>{zw("Prüfen", "Check")}</HauptKnopf>
            </div>
            {vm === null && <p style={{ ...erklaer, fontSize: 12.5 }}>{zw("Wähle zuerst oben deine Vermutung.", "Choose your guess above first.")}</p>}
            {pr && <Hinweis art={pr.art === "warn" ? "warn" : pr.art}>{pr.text}{geprueft && (vm === art ? zw(" Die Winkel-Vermutung stimmt auch.", " Your angle guess was right as well.") : zw(` Der Winkel ist aber ${art === "spitz" ? "spitz" : art === "stumpf" ? "stumpf" : "rechtwinklig"} – das Vorzeichen verrät es.`, ` But the angle is ${art === "spitz" ? "acute" : art === "stumpf" ? "obtuse" : "a right angle"} – the sign tells.`))}</Hinweis>}
          </Tafel>
  );
  const rechnung = geprueft && (
            <Tafel nr={3} titel={zw("Rechnung", "Calculation")}>
              <Rechenweg>
                <RSchritt nr="1" titel={zw("Komponentenweise multiplizieren und addieren", "Multiply component-wise and add")}>
                  <div style={zeile}><M t={`\\vec{a} \\cdot \\vec{b} = ${n(a[0])}\\cdot${mkI(b[0])} + ${n(a[1])}\\cdot${mkI(b[1])} + ${n(a[2])}\\cdot${mkI(b[2])} = ${n(ab)}`} /></div>
                </RSchritt>
                {winkelAn && <WinkelRechnung a={a} b={b} ab={ab} start={2} />}
                <Ergebnis bild={<Bild art={art} breite={44} />} art="gut">
                  {ab > 0 ? zw("Positiv: Der Winkel ist spitz.", "Positive: the angle is acute.") : ab < 0 ? zw("Negativ: Der Winkel ist stumpf.", "Negative: the angle is obtuse.") : zw("Null: Die Vektoren stehen senkrecht aufeinander.", "Zero: the vectors are perpendicular.")}
                </Ergebnis>
              </Rechenweg>
              <button type="button" onClick={() => setWinkelAn((x) => !x)}
                style={{ marginTop: 12, height: 40, padding: "0 14px", borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 13.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                {winkelAn ? zw("Winkelrechnung ausblenden", "Hide the angle calculation") : zw("Und wie groß ist der Winkel genau?", "And what is the exact angle?")}
              </button>
            </Tafel>
  );
  const fuss = <Fusszeile neu={neu} hilfe={<IchHaengeFest kontext={hilfe} />} />;

  if (desktop) {
    return (
      <ModusBreit id="skalar"
        links={<>{boxen}{!fehler && vermutung(TAFEL_BREIT)}</>}
        rechts={fehlerText || <>
          <VekBild>{(br) => <WinkelBild a={a} b={b} projektion={!!geprueft} breite={br} />}</VekBild>
          {rechnen(TAFEL_BREIT)}
        </>}
        unten={!fehler && rechnung} fuss={fuss} />
    );
  }

  return (
    <div data-vek-modus="skalar">
      {boxen}
      <div style={{ marginTop: 12 }}>{fehler ? fehlerText : <BildRahmen><WinkelBild a={a} b={b} projektion={!!geprueft} /></BildRahmen>}</div>
      {!fehler && (
        <>
          {vermutung()}
          {rechnen()}
          {rechnung}
        </>
      )}
      {fuss}
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
  const [pr, setPr] = useStateGebucht(null);
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
  const geprueft = pr && pr.art !== "warn";
  const desktop = useDesktop();
  const boxen = <VektorBoxen namen={["a", "b"]} arten={[zw("Vektor", "Vector"), zw("Vektor", "Vector")]} w={w} setW={setW} zuruecksetzen={() => { setPr(null); setGeschaetzt(false); }} />;
  const fehlerText = fehler && <Hinweis art="warn">{fehler}</Hinweis>;
  const schaetzen = (stil) => (
          <Tafel nr={1} titel={zw("Schätze den Winkel", "Estimate the angle")} text={zw("Schieb den Regler auf den Winkel, den du im Bild siehst.", "Move the slider to the angle you see in the picture.")} stil={stil}>
            <label style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, fontWeight: 700 }}>
              <span style={{ minWidth: 52, height: 30, borderRadius: 8, background: VF.dreiHell, color: "#1F6E44", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{schaetz}°</span>
              <input type="range" min={0} max={180} step={1} value={schaetz} onChange={(e) => { setSchaetz(Number(e.target.value)); setGeschaetzt(true); }} aria-label={zw("Geschätzter Winkel", "Estimated angle")} style={{ flex: 1, accentColor: FS }} />
            </label>
          </Tafel>
  );
  const rechnen = (stil) => (
          <Tafel nr={2} titel={zw("Berechne den Winkel", "Compute the angle")} stil={stil}>
            <div role="group" aria-label={zw("Art des Winkels", "Kind of angle")} style={{ marginBottom: 12 }}>
              <FallWahl wert={gerade ? "gerade" : "vektor"} setWert={(x) => { setGerade(x === "gerade"); setPr(null); }}
                optionen={[["vektor", zw("zwischen Vektoren (bis 180°)", "between vectors (up to 180°)"), "vektorwinkel"], ["gerade", zw("zwischen Geraden (bis 90°)", "between lines (up to 90°)"), "schneidend"]]} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...zeile, fontSize: 17 }}>{gerade ? zw("Schnittwinkel", "Intersection angle") : "φ"} =</span>
              <ZahlFeld wert={antwort} setWert={(v) => { setAntwort(v); setPr(null); }} label={zw("Winkel in Grad", "Angle in degrees")} onEnter={pruefen} breite={92} platzhalter="°" />
              <HauptKnopf onClick={pruefen} disabled={antwort.trim() === ""} stil={{ marginLeft: "auto" }}>{zw("Prüfen", "Check")}</HauptKnopf>
            </div>
            {pr && <Hinweis art={pr.art}>{pr.text}</Hinweis>}
          </Tafel>
  );
  const rechnung = geprueft && (
            <Tafel nr={3} titel={zw("Rechnung", "Calculation")}>
              <Rechenweg>
                <RSchritt nr="1" titel={zw("Skalarprodukt und Längen einsetzen", "Plug in dot product and lengths")}>
                  <div style={zeile}><M t={`\\cos\\varphi = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|\\cdot|\\vec{b}|} = \\frac{${n(ab)}}{\\sqrt{${skalar(a, a)}}\\cdot\\sqrt{${skalar(b, b)}}} \\approx ${dez(ab / (laenge(a) * laenge(b)), 4)}`} /></div>
                </RSchritt>
                <RSchritt nr="2" titel={zw("Mit arccos zum Winkel", "Get the angle with arccos")}>
                  <div style={zeile}><M t={`\\varphi \\approx ${dez(phi, 1)}°`} /></div>
                  {gerade && phi > 90 && <div style={zeile}><M t={`\\text{Schnittwinkel} = 180° - ${dez(phi, 1)}° = ${dez(180 - phi, 1)}°`} /></div>}
                </RSchritt>
                <Ergebnis bild={<Bild art={ziel > 90.05 ? "stumpf" : Math.abs(ziel - 90) <= 0.05 ? "recht" : "spitz"} breite={44} />} art="gut"
                  zusatz={geschaetzt ? zw(`Deine Schätzung: ${schaetz}°`, `Your estimate: ${schaetz}°`) : zw("Zwischen Vektoren zählt der volle Winkel bis 180°, zwischen Geraden der kleinere bis 90°.", "Between vectors the full angle up to 180° counts, between lines the smaller one up to 90°.")}>
                  {gerade ? zw("Schnittwinkel", "Intersection angle") : "φ"} ≈ {dez(ziel, 1)}°
                </Ergebnis>
              </Rechenweg>
            </Tafel>
  );
  const fuss = <Fusszeile neu={neu} hilfe={<IchHaengeFest kontext={hilfe} />} />;

  if (desktop) {
    return (
      <ModusBreit id="winkel"
        links={<>{boxen}{!fehler && schaetzen(TAFEL_BREIT)}</>}
        rechts={fehlerText || <>
          <VekBild>{(br) => <WinkelBild a={a} b={b} breite={br} />}</VekBild>
          {rechnen(TAFEL_BREIT)}
        </>}
        unten={!fehler && rechnung} fuss={fuss} />
    );
  }

  return (
    <div data-vek-modus="winkel">
      {boxen}
      <div style={{ marginTop: 12 }}>{fehler ? fehlerText : <BildRahmen><WinkelBild a={a} b={b} /></BildRahmen>}</div>
      {!fehler && (
        <>
          {schaetzen()}
          {rechnen()}
          {rechnung}
        </>
      )}
      {fuss}
    </div>
  );
}

/* ---------- Gerade-Ebene-Winkel ---------- */

function GeradeEbeneWinkel() {
  const start = useState(() => neuesVektorPaar(0.1))[0];
  const { w, setW, gelesen, fehler } = useVektoren([start.a, start.b]);
  const [formel, setFormel] = useState(null);
  const [antwort, setAntwort] = useState("");
  const [pr, setPr] = useStateGebucht(null);
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
  const geprueft = pr && pr.art !== "warn";
  const desktop = useDesktop();
  const boxen = <VektorBoxen namen={["u", "n"]} arten={[zw("Richtung von g", "Direction of g"), zw("Normale von E", "Normal of E")]} w={w} setW={setW} zuruecksetzen={() => { setPr(null); setFormel(null); }} />;
  const fehlerText = fehler && <Hinweis art="warn">{fehler}</Hinweis>;
  const warum = (
      <details data-ger-warum="" style={{ marginTop: desktop ? 0 : 10, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "4px 14px" }}>
        <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 700, color: C.see, padding: "8px 0", listStylePosition: "inside" }}>{zw("Warum Sinus und nicht Kosinus?", "Why sine and not cosine?")}</summary>
        <div style={{ padding: "2px 0 12px" }}>
          <p style={{ ...erklaer, color: C.tinte, margin: "0 0 6px" }}>
            {zw("Die Kosinus-Formel misst den Winkel zwischen zwei Vektoren. Von der Ebene haben wir aber nur den Normalenvektor n – und der steht senkrecht auf der Ebene. Der Kosinus-Weg liefert also den Winkel θ zwischen u und n, nicht den Winkel zur Ebene.",
              "The cosine formula measures the angle between two vectors. But of the plane we only have the normal vector n – and it stands perpendicular to the plane. The cosine route therefore gives the angle θ between u and n, not the angle to the plane.")}
          </p>
          <p style={{ ...erklaer, color: C.tinte, margin: "0 0 6px" }}>
            {zw("Zwischen n und der Ebene liegen genau 90°. Deshalb gilt α = 90° − θ. Und für Komplementwinkel vertauschen sich Sinus und Kosinus:", "Between n and the plane there are exactly 90°. So α = 90° − θ. And for complementary angles sine and cosine swap:")}
          </p>
          <div style={zeile}><M t={"\\sin\\alpha = \\sin(90° - \\theta) = \\cos\\theta"} /></div>
          <div style={zeile}><M t={"\\cos\\theta = \\frac{|\\vec{u}\\cdot\\vec{n}|}{|\\vec{u}|\\cdot|\\vec{n}|}"} /></div>
          <p style={erklaer}>
            {zw("Der Kosinus von θ steckt also im Bruch – er heißt nur sin α, weil wir den Winkel zur Ebene suchen. Die Betragsstriche sorgen dafür, dass α zwischen 0° und 90° bleibt.",
              "So the cosine of θ is inside the fraction – it is just called sin α because we want the angle to the plane. The absolute value bars keep α between 0° and 90°.")}
          </p>
        </div>
      </details>
  );
  const formelWahl = (stil) => (
          <Tafel nr={1} titel={zw("Welche Formel passt?", "Which formula fits?")} stil={stil}>
            <TippKacheln spalten={1} label={zw("Formel wählen", "Choose formula")} wert={formel} setWert={setFormel} loesung={formel ? "sin" : undefined}
              optionen={[["sin", <span key="s" style={{ fontSize: 18, fontWeight: 400 }}><M t={"\\sin\\alpha = \\frac{|\\vec{u}\\cdot\\vec{n}|}{|\\vec{u}|\\cdot|\\vec{n}|}"} /></span>], ["cos", <span key="c" style={{ fontSize: 18, fontWeight: 400 }}><M t={"\\cos\\alpha = \\frac{|\\vec{u}\\cdot\\vec{n}|}{|\\vec{u}|\\cdot|\\vec{n}|}"} /></span>], ["tan", <span key="t" style={{ fontSize: 18, fontWeight: 400 }}><M t={"\\tan\\alpha = \\frac{|\\vec{u}\\cdot\\vec{n}|}{|\\vec{u}|\\cdot|\\vec{n}|}"} /></span>]]} />
            {formel && <Hinweis art={formel === "sin" ? "gut" : "schlecht"}>{formel === "sin" ? zw("Richtig: der Sinus, weil n senkrecht auf der Ebene steht.", "Right: the sine, because n is perpendicular to the plane.") : zw("Das ist nicht die Formel für den Winkel zur Ebene. Mit dem Kosinus bekommst du den Winkel zwischen u und n – das Komplement von α.", "That is not the formula for the angle to the plane. The cosine gives the angle between u and n – the complement of α.")}</Hinweis>}
          </Tafel>
  );
  const rechnen = (stil) => (
          <Tafel nr={2} titel={zw("Berechne α", "Compute α")} stil={stil}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...zeile, fontSize: 17 }}>α =</span>
              <ZahlFeld wert={antwort} setWert={(v) => { setAntwort(v); setPr(null); }} label={zw("Winkel in Grad", "Angle in degrees")} onEnter={pruefen} breite={92} platzhalter="°" />
              <HauptKnopf onClick={pruefen} disabled={antwort.trim() === ""} stil={{ marginLeft: "auto" }}>{zw("Prüfen", "Check")}</HauptKnopf>
            </div>
            {pr && <Hinweis art={pr.art}>{pr.text}</Hinweis>}
          </Tafel>
  );
  const rechnung = geprueft && (
            <Tafel nr={3} titel={zw("Rechnung", "Calculation")}>
              <Rechenweg>
                <RSchritt nr="1" titel={zw("In die Sinus-Formel einsetzen", "Plug into the sine formula")}>
                  <div style={zeile}><M t={`\\sin\\alpha = \\frac{|\\vec{u}\\cdot\\vec{n}|}{|\\vec{u}|\\cdot|\\vec{n}|} = \\frac{|${n(un)}|}{\\sqrt{${skalar(u, u)}}\\cdot\\sqrt{${skalar(nv, nv)}}} \\approx ${dez(Math.abs(un) / (laenge(u) * laenge(nv)), 4)}`} /></div>
                </RSchritt>
                <RSchritt nr="2" titel={zw("Mit arcsin zum Winkel", "Get the angle with arcsin")}>
                  <div style={zeile}><M t={`\\alpha \\approx ${dez(alpha, 1)}°`} /></div>
                </RSchritt>
                <Ergebnis bild={<Bild art="ge-winkel" breite={44} />} art="gut"
                  zusatz={zw(`Zur Probe: Der Winkel zwischen u und n wäre ${dez(winkelZwischen(u, nv), 1)}°; α ist das Komplement dazu (bis auf das Vorzeichen).`, `Check: the angle between u and n would be ${dez(winkelZwischen(u, nv), 1)}°; α is its complement (up to sign).`)}>
                  α ≈ {dez(alpha, 1)}°
                </Ergebnis>
              </Rechenweg>
            </Tafel>
  );
  const fuss = <Fusszeile neu={neu} hilfe={<IchHaengeFest kontext={hilfe} />} />;

  if (desktop) {
    return (
      <ModusBreit id="ge-winkel"
        links={<>{boxen}{!fehler && formelWahl(TAFEL_BREIT)}</>}
        rechts={<>
          {fehlerText || <VekBild>{(br) => <GeBild u={u} nv={nv} breite={br} />}</VekBild>}
          {!fehler && rechnen(TAFEL_BREIT)}
          {warum}
        </>}
        unten={!fehler && rechnung} fuss={fuss} />
    );
  }

  return (
    <div data-vek-modus="ge-winkel">
      {boxen}
      <div style={{ marginTop: 12 }}>{fehler ? fehlerText : <BildRahmen><GeBild u={u} nv={nv} /></BildRahmen>}</div>
      {warum}
      {!fehler && (
        <>
          {formelWahl()}
          {rechnen()}
          {rechnung}
        </>
      )}
      {fuss}
    </div>
  );
}

/* ======================================================================
   Seite „Winkel und Skalarprodukt“
   ====================================================================== */

const WINKEL_MODI = [
  { id: "skalar", name: ["Skalarprodukt", "Dot product"], bild: "skalar" },
  { id: "winkel", name: ["Vektorwinkel", "Vector angle"], bild: "vektorwinkel" },
  { id: "ge", name: ["Gerade – Ebene", "Line – plane"], bild: "ge-winkel" },
];

export function WinkelSkalarprodukt() {
  const [modus, setModus] = useState("skalar");
  return (
    <VekSeite titel={zw("Winkel und Skalarprodukt", "Angles and the dot product")}
      text={zw("Schätze Winkel am Bild, berechne das Skalarprodukt und leite daraus Winkel zwischen Vektoren, Geraden und Ebenen ab.", "Estimate angles from the picture, compute the dot product and derive angles between vectors, lines and planes.")}>
      <ModusReiter label={zw("Winkel-Übungen", "Angle exercises")} wert={modus} setWert={setModus}
        modi={WINKEL_MODI.map((m) => ({ id: m.id, name: zw(m.name[0], m.name[1]), bild: m.bild }))} />
      <div style={{ display: modus === "skalar" ? "block" : "none" }}><SkalarproduktVerstehen /></div>
      <div style={{ display: modus === "winkel" ? "block" : "none" }}><Vektorwinkel /></div>
      <div style={{ display: modus === "ge" ? "block" : "none" }}><GeradeEbeneWinkel /></div>
    </VekSeite>
  );
}

