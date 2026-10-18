/* ============================================================
   Mittelstufe · Geometrie: Strahlensätze
   · Entdecken – V-Figur und X-Figur mit Reglern für SA, SB und
     den Streckfaktor k; alle Längen und Verhältnisse live
   · Üben – Aufgaben zum 1. und 2. Strahlensatz in beiden Figuren,
     mit Abschnitt-Falle (AA′ statt SA′) und Sachaufgabe (Schatten)
   Bezeichnungen: Zwei Strahlen (bzw. Geraden) durch S, auf dem
   ersten liegen A und A′, auf dem zweiten B und B′, AB ∥ A′B′.
     1. Strahlensatz:  SA′ : SA = SB′ : SB
     2. Strahlensatz:  A′B′ : AB = SA′ : SA
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { Auswahl, GrosserKnopf, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { wahl } from "./rechnen2.js";
import { Aufklapp, ModusLeiste, Seite, SchrittFolge, zt } from "./ui3.jsx";
import { GeoAnimation } from "./funcGeoAnimationen.jsx";

let zaehler = 0;
const STRICH = "′";

/* ---------- Geometrie der Figur ----------
   x: true = X-Figur (A′, B′ auf der anderen Seite von S). Längen in Einheiten. */
function figur({ sa, sb, k, x }) {
  const w1 = (42 * Math.PI) / 180, w2 = (-2 * Math.PI) / 180;
  const u1 = [Math.cos(w1), -Math.sin(w1)], u2 = [Math.cos(w2), -Math.sin(w2)];
  const vz = x ? -1 : 1;
  const A = [sa * u1[0], sa * u1[1]], B = [sb * u2[0], sb * u2[1]];
  const A2 = [vz * k * A[0], vz * k * A[1]], B2 = [vz * k * B[0], vz * k * B[1]];
  return { A, B, A2, B2, S: [0, 0], u1, u2, vz };
}
const abst = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);

/* SVG-Skizze. werte: Beschriftungen je Strecke { sa, sa2, aa2, sb, sb2, bb2, ab, a2b2 } (Text oder null) */
function Skizze({ sa, sb, k, x, werte = {}, gesucht = null, hoehe = 230 }) {
  const f = figur({ sa, sb, k, x });
  const pts = [f.S, f.A, f.B, f.A2, f.B2];
  /* Strahlen etwas über die äußeren Punkte hinaus verlängern */
  const weit = (u, t) => [u[0] * t, u[1] * t];
  const ende1 = x ? [weit(f.u1, -(k * sa) - 0.8), weit(f.u1, sa + 0.8)] : [f.S, weit(f.u1, Math.max(sa, k * sa) + 0.9)];
  const ende2 = x ? [weit(f.u2, -(k * sb) - 0.8), weit(f.u2, sb + 0.8)] : [f.S, weit(f.u2, Math.max(sb, k * sb) + 0.9)];
  const alle = [...pts, ...ende1, ...ende2];
  const xs = alle.map((p) => p[0]), ys = alle.map((p) => p[1]);
  const W = 340, rand = 44;
  const breite = Math.max(...xs) - Math.min(...xs), hoeheM = Math.max(...ys) - Math.min(...ys);
  const s = Math.min((W - 2 * rand) / breite, (hoehe - 2 * rand) / Math.max(hoeheM, 0.5));
  const ox = rand - Math.min(...xs) * s + ((W - 2 * rand) - breite * s) / 2;
  const oy = rand - Math.min(...ys) * s + ((hoehe - 2 * rand) - hoeheM * s) / 2;
  const P = (p) => [ox + p[0] * s, oy + p[1] * s];
  const linie = (p, q, farbe, breiteL = 1.6, strich) => {
    const [a, b] = [P(p), P(q)];
    return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={farbe} strokeWidth={breiteL} strokeLinecap="round" strokeDasharray={strich} />;
  };
  const punkt = (p, name, dx = 0, dy = -9, farbe = C.tinte) => {
    const [a, b] = P(p);
    return (
      <g>
        <circle cx={a} cy={b} r="3.6" fill={farbe} />
        <text x={a + dx} y={b + dy} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: farbe, fontFamily: "Montserrat, system-ui, sans-serif" }}>{name}</text>
      </g>
    );
  };
  /* Beschriftung einer Strecke: mittig, senkrecht etwas versetzt */
  const mass = (p, q, text, seite = 1, farbe = C.see, abstand = 13) => {
    if (text == null) return null;
    const [a, b] = [P(p), P(q)];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const ex = -(b[1] - a[1]) / len * seite, ey = (b[0] - a[0]) / len * seite;
    const nx = ex * abstand, ny = ey * abstand;
    const gs = text === "?";
    /* lange Maße (V-Figur, ab S bis zum äußeren Punkt): Maßlinie mit Endstrichen */
    const masslinie = abstand > 20 ? (
      <g stroke={`${farbe}88`} strokeWidth="1">
        <line x1={a[0] + nx} y1={a[1] + ny} x2={b[0] + nx} y2={b[1] + ny} />
        <line x1={a[0] + ex * (abstand - 5)} y1={a[1] + ey * (abstand - 5)} x2={a[0] + ex * (abstand + 5)} y2={a[1] + ey * (abstand + 5)} />
        <line x1={b[0] + ex * (abstand - 5)} y1={b[1] + ey * (abstand - 5)} x2={b[0] + ex * (abstand + 5)} y2={b[1] + ey * (abstand + 5)} />
      </g>
    ) : null;
    return (
      <g>
        {masslinie}
        <rect x={mx + nx - (gs ? 11 : String(text).length * 4 + 6)} y={my + ny - 10} width={gs ? 22 : String(text).length * 8 + 12} height="19" rx="9.5" fill={gs ? C.flaggold : C.weiss} stroke={gs ? C.flaggold : `${farbe}55`} />
        <text x={mx + nx} y={my + ny + 4.5} textAnchor="middle" style={{ fontSize: 12, fontWeight: 800, fill: gs ? C.seeTief : farbe, fontFamily: "Montserrat, system-ui, sans-serif" }}>{text}</text>
      </g>
    );
  };
  const g = (n) => (gesucht === n ? "?" : werte[n] ?? null);
  return (
    <svg viewBox={`0 0 ${W} ${hoehe}`} style={{ width: "100%", height: "auto", display: "block" }} role="img"
      aria-label={x ? zw("X-Figur mit zwei Geraden durch S und zwei parallelen Strecken", "X figure with two lines through S and two parallel segments") : zw("V-Figur mit zwei Strahlen ab S und zwei parallelen Strecken", "V figure with two rays from S and two parallel segments")}>
      {linie(ende1[0], ende1[1], C.hellgrau, 1.3)}
      {linie(ende2[0], ende2[1], C.hellgrau, 1.3)}
      {linie(f.A, f.B, C.smaragd, 2.6)}
      {linie(f.A2, f.B2, C.smaragd, 2.6)}
      {mass(f.S, f.A, g("sa"), -1)}
      {mass(f.S, f.A2, g("sa2"), -1, C.see, x ? 13 : 38)}
      {!x && mass(f.A, f.A2, g("aa2"), -1)}
      {mass(f.S, f.B, g("sb"), 1)}
      {mass(f.S, f.B2, g("sb2"), 1, C.see, x ? 13 : 38)}
      {!x && mass(f.B, f.B2, g("bb2"), -1)}
      {mass(f.A, f.B, g("ab"), x ? 1 : -1, C.smaragd)}
      {mass(f.A2, f.B2, g("a2b2"), x ? -1 : -1, C.smaragd)}
      {punkt(f.S, "S", x ? 0 : -10, x ? -11 : 4)}
      {punkt(f.A, "A", -8, -8)}
      {punkt(f.B, "B", 4, 18)}
      {punkt(f.A2, `A${STRICH}`, -9, -8)}
      {punkt(f.B2, `B${STRICH}`, 6, 18)}
    </svg>
  );
}

/* ---------- Regler im Stil der App ---------- */
function Regler({ name, wert, setWert, min, max, schritt, farbe = C.see, format = (v) => zt(v, 1) }) {
  const knopf = (d, z) => (
    <button type="button" aria-label={`${name} ${d > 0 ? "+" : "−"}`} onClick={() => setWert(Math.round(Math.max(min, Math.min(max, wert + d * schritt)) * 100) / 100)}
      disabled={(d < 0 && wert <= min + 1e-9) || (d > 0 && wert >= max - 1e-9)}
      style={{ width: 38, height: 30, borderRadius: 9, border: `1.5px solid ${farbe}66`, background: `${farbe}14`, color: farbe, fontSize: 18, fontWeight: 800,
        fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1, touchAction: "manipulation", opacity: (d < 0 && wert <= min + 1e-9) || (d > 0 && wert >= max - 1e-9) ? 0.35 : 1 }}>{z}</button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: farbe, minWidth: 44 }}>{name}</span>
      <input type="range" min={min} max={max} step={schritt} value={wert} onChange={(e) => setWert(Number(e.target.value))} aria-label={name}
        style={{ flex: 1, minWidth: 0, accentColor: farbe }} />
      <span style={{ fontSize: 15, fontWeight: 800, color: C.tinte, minWidth: 34, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{format(wert)}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{knopf(1, "+")}{knopf(-1, "−")}</div>
    </div>
  );
}

/* ---------- Modus 1: Entdecken ---------- */
function Entdecken() {
  const [x, setX] = useState(false);
  const [sa, setSa] = useState(3);
  const [sb, setSb] = useState(4);
  const [k, setK] = useState(2);
  const f = figur({ sa, sb, k, x });
  const L = { sa, sb, sa2: k * sa, sb2: k * sb, ab: abst(f.A, f.B), a2b2: abst(f.A2, f.B2), aa2: abst(f.A, f.A2), bb2: abst(f.B, f.B2) };
  const z = (v) => zt(v, 2);
  const zeile = (links, rechts, wert, falsch) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.linie}` }}>
      <span style={{ fontSize: 15, color: falsch ? C.hellgrau : C.tinte }}><M t={`\\frac{${links}}{${rechts}}`} /></span>
      <span style={{ fontSize: 15, fontWeight: 800, color: falsch ? C.hellgrau : C.see, fontVariantNumeric: "tabular-nums" }}>{z(wert)}</span>
    </div>
  );
  const ob = (s) => `\\overline{${s}}`;
  return (
    <>
      <GeoAnimation art="strahlen" offen />
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={kicker}>{zw("Figur einstellen", "Set up the figure")}</p>
        <Auswahl optionen={[["v", zw("V-Figur", "V figure")], ["x", zw("X-Figur", "X figure")]]} wert={x ? "x" : "v"} setWert={(v) => setX(v === "x")} label={zw("Art der Figur", "Type of figure")} />
        <p style={{ fontSize: 13, color: C.see, fontWeight: 600, margin: "14px 0 6px" }}>{zw("Zieh an den Reglern und beobachte die Verhältnisse.", "Move the sliders and watch the ratios.")}</p>
        <div style={{ display: "grid", gap: 10 }}>
          <Regler name="SA" wert={sa} setWert={setSa} min={1} max={5} schritt={0.5} />
          <Regler name="SB" wert={sb} setWert={setSb} min={1} max={5} schritt={0.5} />
          <Regler name="k" wert={k} setWert={setK} min={x ? 0.5 : 1.2} max={3} schritt={0.1} farbe={C.smaragd} />
        </div>
        <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 8 }}>
          <Skizze hoehe={260} sa={sa} sb={sb} k={k} x={x} werte={{ sa: z(L.sa), sb: z(L.sb), sa2: z(L.sa2), sb2: z(L.sb2), ab: z(L.ab), a2b2: z(L.a2b2) }} />
        </div>
      </div>
      <div style={{ ...karte, marginTop: 12 }}>
        <p style={kicker}>{zw("Verhältnisse", "Ratios")}</p>
        {zeile(ob(`SA${STRICH}`), ob("SA"), L.sa2 / L.sa)}
        {zeile(ob(`SB${STRICH}`), ob("SB"), L.sb2 / L.sb)}
        {zeile(ob(`A${STRICH}B${STRICH}`), ob("AB"), L.a2b2 / L.ab)}
        <p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.6, margin: "10px 0 0" }}>
          {zw(`Alle drei Verhältnisse sind gleich dem Streckfaktor k = ${zt(k, 2)}. Das ist der Kern beider Strahlensätze.`, `All three ratios equal the scale factor k = ${zt(k, 2)}. That is the core of both intercept theorems.`)}
        </p>
        {!x && (
          <>
            <p style={{ ...kicker, marginTop: 16, color: C.gruenDunkel }}>{zw("Die häufigste Falle", "The most common trap")}</p>
            {zeile(ob(`A${STRICH}B${STRICH}`), ob("AB"), L.a2b2 / L.ab)}
            {zeile(ob(`SA${STRICH}`), ob(`AA${STRICH}`), L.sa2 / L.aa2, true)}
            <p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.6, margin: "10px 0 0" }}>
              {zw(`Beim 2. Strahlensatz zählen nur Strecken ab S. Der Abschnitt AA′ passt nicht (${zt(L.sa2 / L.aa2, 2)} ≠ ${zt(k, 2)}). Für den 1. Strahlensatz dürfen dagegen auch die Abschnitte verglichen werden: AA′ : SA = BB′ : SB.`, `In the 2nd theorem only segments starting at S count. The piece AA′ does not fit (${zt(L.sa2 / L.aa2, 2)} ≠ ${zt(k, 2)}). For the 1st theorem the pieces may be compared as well: AA′ : SA = BB′ : SB.`)}
            </p>
          </>
        )}
      </div>
    </>
  );
}

/* ---------- Modus 2: Üben ---------- */
const SA_W = [2, 2.5, 3, 4, 5, 6];
const SB_W = [2, 3, 3.5, 4, 4.5, 5];
const AB_W = [1.5, 2, 2.5, 3, 3.5, 4];
const K_W = [1.5, 2, 2.5, 3];

/* Aufgabe: art = sb2 | a2b2 | abschnitt | rueck | xfigur | schatten */
export function neueAufgabe() {
  const art = wahl(["sb2", "a2b2", "abschnitt", "rueck", "xfigur", "schatten"]);
  const sa = wahl(SA_W), sb = wahl(SB_W), ab = wahl(AB_W), k = wahl(K_W);
  if (art === "schatten") {
    const stab = wahl([1, 1.5, 2]), sStab = wahl([0.8, 1.2, 1.5, 2, 2.5]), kk = wahl([4, 5, 6, 8, 10]);
    return { id: ++zaehler, art, stab, sStab, sBaum: sStab * kk, hBaum: stab * kk };
  }
  return { id: ++zaehler, art, sa, sb, ab, k, x: art === "xfigur", sa2: k * sa, sb2: k * sb, a2b2: k * ab, aa2: (k - 1) * sa };
}

const ob = (s) => `\\overline{${s}}`;
const fr = (a, b) => <M t={`\\frac{${ob(a)}}{${ob(b)}}`} />;
const gl = (a, b, c, d) => <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{fr(a, b)} = {fr(c, d)}</span>;
const A2 = `A${STRICH}`, B2 = `B${STRICH}`, SA2 = `SA${STRICH}`, SB2 = `SB${STRICH}`, AA2 = `AA${STRICH}`, A2B2 = `A${STRICH}B${STRICH}`;

export function schritteVon(au) {
  const z = (v) => zt(v, 2);
  if (au.art === "schatten") {
    return [
      { id: "s-ansatz", titel: zw("Verhältnisgleichung", "Proportion"), typ: "wahl",
        frage: zw("Stab und Baum stehen senkrecht, die Sonnenstrahlen sind parallel. Welche Gleichung gilt für die Baumhöhe h?", "The stick and the tree stand upright, the sun rays are parallel. Which equation holds for the tree height h?"),
        optionen: [["a", <M key="a" t={`\\frac{h}{${z(au.stab)}} = \\frac{${z(au.sBaum)}}{${z(au.sStab)}}`} />], ["b", <M key="b" t={`\\frac{h}{${z(au.stab)}} = \\frac{${z(au.sStab)}}{${z(au.sBaum)}}`} />], ["c", <M key="c" t={`h − ${z(au.stab)} = ${z(au.sBaum)} − ${z(au.sStab)}`} />]], richtig: "a",
        fehler: [{ wahl: "b", text: zw("Kehrwert erwischt: Der Baum ist länger als der Stab, also muss auch sein Schatten im Zähler stehen.", "You took the reciprocal: the tree is taller than the stick, so its shadow belongs in the numerator too.") },
          { wahl: "c", text: zw("Strahlensätze vergleichen Verhältnisse (mal), keine Differenzen (minus).", "Intercept theorems compare ratios (times), not differences (minus).") }],
        hinweise: [zw("Der Schatten ist so viel länger wie das Objekt höher ist – mit demselben Faktor.", "The shadow is longer by the same factor as the object is taller.")],
        erklaerung: zw(`Höhe : Höhe = Schatten : Schatten (2. Strahlensatz, Scheitel S an der Schattenspitze).`, `Height : height = shadow : shadow (2nd theorem, apex S at the shadow tip).`) },
      { id: "s-h", titel: zw("Baumhöhe", "Tree height"), typ: "zahl", text: "h =", einheit: "m", wert: au.hBaum, toleranz: 0.011, wertText: z(au.hBaum),
        frage: zw("Berechne die Höhe des Baums.", "Calculate the height of the tree."),
        fehler: [{ wert: au.stab * au.sStab / au.sBaum, toleranz: 0.011, text: zw("Das ist kleiner als der Stab – der Kehrwert ist hineingerutscht.", "That's smaller than the stick – the reciprocal slipped in.") },
          { wert: au.stab + au.sBaum - au.sStab, toleranz: 0.011, text: zw("Du hast Differenzen gerechnet. Nimm mit dem Faktor mal.", "You used differences. Multiply by the factor instead.") }],
        hinweise: [zw(`h = ${z(au.stab)} · ${z(au.sBaum)} : ${z(au.sStab)}`, `h = ${z(au.stab)} · ${z(au.sBaum)} : ${z(au.sStab)}`)],
        erklaerung: `h = ${z(au.stab)} · ${z(au.sBaum)} : ${z(au.sStab)} = ${z(au.hBaum)} m.` },
    ];
  }
  if (au.art === "sb2") {
    return [
      { id: "1-ansatz", titel: zw("Welcher Strahlensatz?", "Which theorem?"), typ: "wahl", frage: zw("Gesucht ist SB′. Welche Gleichung stimmt?", "You need SB′. Which equation is correct?"),
        optionen: [["a", gl(SB2, "SB", SA2, "SA")], ["b", gl(SB2, "SB", "SA", SA2)], ["c", <M key="c" t={`${ob(SB2)} − ${ob("SB")} = ${ob(SA2)} − ${ob("SA")}`} />]], richtig: "a",
        fehler: [{ wahl: "b", text: zw("Rechts steht der Kehrwert: Links lang : kurz, dann auch rechts lang : kurz.", "The right side is the reciprocal: long : short on the left means long : short on the right too.") },
          { wahl: "c", text: zw("Strahlensätze vergleichen Verhältnisse, keine Differenzen.", "Intercept theorems compare ratios, not differences.") }],
        hinweise: [zw("1. Strahlensatz: Die Strecken ab S auf beiden Strahlen stehen im selben Verhältnis.", "1st theorem: the segments from S on both rays have the same ratio.")],
        erklaerung: zw("1. Strahlensatz: SB′ : SB = SA′ : SA.", "1st theorem: SB′ : SB = SA′ : SA.") },
      { id: "1-wert", titel: zw("Berechnen", "Calculate"), typ: "zahl", text: "SB′ =", einheit: "cm", wert: au.sb2, toleranz: 0.011, wertText: z(au.sb2),
        frage: zw("Löse nach SB′ auf.", "Solve for SB′."),
        fehler: [{ wert: au.sb * au.sa / au.sa2, toleranz: 0.011, text: zw("Kehrwert: SB′ muss länger sein als SB.", "Reciprocal: SB′ must be longer than SB.") },
          { wert: au.sb + au.sa2 - au.sa, toleranz: 0.011, text: zw("Du hast den Unterschied addiert statt mit dem Faktor zu multiplizieren.", "You added the difference instead of multiplying by the factor.") }],
        hinweise: [zw(`SB′ = ${z(au.sb)} · ${z(au.sa2)} : ${z(au.sa)}`, `SB′ = ${z(au.sb)} · ${z(au.sa2)} : ${z(au.sa)}`)],
        erklaerung: `SB′ = ${z(au.sb)} · ${z(au.sa2)} : ${z(au.sa)} = ${z(au.sb2)} cm.` },
    ];
  }
  if (au.art === "a2b2" || au.art === "xfigur") {
    return [
      { id: "2-ansatz", titel: zw("Welcher Strahlensatz?", "Which theorem?"), typ: "wahl", frage: zw("Gesucht ist A′B′. Welche Gleichung stimmt?", "You need A′B′. Which equation is correct?"),
        optionen: au.x ? [["a", gl(A2B2, "AB", SA2, "SA")], ["b", gl(A2B2, "AB", "SA", SA2)], ["c", gl(A2B2, "AB", SA2, AA2)]] : [["a", gl(A2B2, "AB", SA2, "SA")], ["b", gl(A2B2, "AB", SA2, AA2)], ["c", gl(A2B2, "AB", "SA", SA2)]],
        richtig: "a",
        fehler: au.x
          ? [{ wahl: "b", text: zw("Kehrwert: A′B′ und SA′ gehören beide zur „großen“ Seite.", "Reciprocal: A′B′ and SA′ both belong to the “large” side.") }, { wahl: "c", text: zw("AA′ geht durch S hindurch – beim 2. Strahlensatz zählen nur Strecken ab S.", "AA′ runs through S – the 2nd theorem only uses segments starting at S.") }]
          : [{ wahl: "b", text: zw("Die Falle: Beim 2. Strahlensatz zählen nur Strecken ab S, nicht der Abschnitt AA′.", "The trap: the 2nd theorem only uses segments from S, not the piece AA′.") }, { wahl: "c", text: zw("Kehrwert: A′B′ und SA′ gehören beide zur „großen“ Seite.", "Reciprocal: A′B′ and SA′ both belong to the “large” side.") }],
        hinweise: [zw("2. Strahlensatz: Parallele Strecken verhalten sich wie die zugehörigen Strecken ab S.", "2nd theorem: parallel segments behave like the corresponding segments from S.")],
        erklaerung: zw("2. Strahlensatz: A′B′ : AB = SA′ : SA.", "2nd theorem: A′B′ : AB = SA′ : SA.") },
      { id: "2-wert", titel: zw("Berechnen", "Calculate"), typ: "zahl", text: "A′B′ =", einheit: "cm", wert: au.a2b2, toleranz: 0.011, wertText: z(au.a2b2),
        frage: zw("Löse nach A′B′ auf.", "Solve for A′B′."),
        fehler: [...(au.x ? [] : [{ wert: au.ab * au.sa2 / au.aa2, toleranz: 0.011, text: zw("Du hast mit AA′ statt SA′ gerechnet.", "You used AA′ instead of SA′.") }]),
          { wert: au.ab * au.sa / au.sa2, toleranz: 0.011, text: zw("Kehrwert: A′B′ muss länger sein als AB.", "Reciprocal: A′B′ must be longer than AB.") }],
        hinweise: [zw(`A′B′ = ${z(au.ab)} · ${z(au.sa2)} : ${z(au.sa)}`, `A′B′ = ${z(au.ab)} · ${z(au.sa2)} : ${z(au.sa)}`)],
        erklaerung: `A′B′ = ${z(au.ab)} · ${z(au.sa2)} : ${z(au.sa)} = ${z(au.a2b2)} cm.` },
    ];
  }
  if (au.art === "abschnitt") {
    return [
      { id: "ab-sa2", titel: zw("Erst die Strecke ab S", "First the segment from S"), typ: "zahl", text: "SA′ =", einheit: "cm", wert: au.sa2, toleranz: 0.011, wertText: z(au.sa2),
        frage: zw("Gegeben ist nur der Abschnitt AA′. Wie lang ist SA′?", "Only the piece AA′ is given. How long is SA′?"),
        fehler: [{ wert: au.aa2, toleranz: 0.011, text: zw("Das ist nur der Abschnitt. SA′ reicht von S bis A′.", "That's only the piece. SA′ goes from S to A′.") }],
        hinweise: [zw("SA′ = SA + AA′", "SA′ = SA + AA′")], erklaerung: `SA′ = ${z(au.sa)} + ${z(au.aa2)} = ${z(au.sa2)} cm.` },
      { id: "ab-ansatz", titel: zw("Welcher Strahlensatz?", "Which theorem?"), typ: "wahl", frage: zw("Gesucht ist A′B′. Welche Gleichung stimmt?", "You need A′B′. Which equation is correct?"),
        optionen: [["a", gl(A2B2, "AB", AA2, "SA")], ["b", gl(A2B2, "AB", SA2, "SA")], ["c", gl(A2B2, "AB", "SA", SA2)]], richtig: "b",
        fehler: [{ wahl: "a", text: zw("Die Falle: Beim 2. Strahlensatz zählen nur Strecken ab S. AA′ beginnt nicht in S.", "The trap: the 2nd theorem only uses segments from S. AA′ does not start at S.") },
          { wahl: "c", text: zw("Kehrwert: A′B′ und SA′ gehören beide zur „großen“ Seite.", "Reciprocal: A′B′ and SA′ both belong to the “large” side.") }],
        hinweise: [zw("Parallele Strecken ↔ Strecken ab S.", "Parallel segments ↔ segments from S.")], erklaerung: zw("2. Strahlensatz: A′B′ : AB = SA′ : SA.", "2nd theorem: A′B′ : AB = SA′ : SA.") },
      { id: "ab-wert", titel: zw("Berechnen", "Calculate"), typ: "zahl", text: "A′B′ =", einheit: "cm", wert: au.a2b2, toleranz: 0.011, wertText: z(au.a2b2),
        frage: zw("Löse nach A′B′ auf.", "Solve for A′B′."),
        fehler: [{ wert: au.ab * au.aa2 / au.sa, toleranz: 0.011, text: zw("Du hast mit AA′ statt SA′ gerechnet.", "You used AA′ instead of SA′.") }],
        hinweise: [zw(`A′B′ = ${z(au.ab)} · ${z(au.sa2)} : ${z(au.sa)}`, `A′B′ = ${z(au.ab)} · ${z(au.sa2)} : ${z(au.sa)}`)],
        erklaerung: `A′B′ = ${z(au.ab)} · ${z(au.sa2)} : ${z(au.sa)} = ${z(au.a2b2)} cm.` },
    ];
  }
  /* rueck: AB gesucht */
  return [
    { id: "r-ansatz", titel: zw("Welcher Strahlensatz?", "Which theorem?"), typ: "wahl", frage: zw("Gesucht ist die kurze Parallele AB. Welche Gleichung stimmt?", "You need the short parallel AB. Which equation is correct?"),
      optionen: [["a", gl("AB", A2B2, SA2, "SA")], ["b", gl("AB", A2B2, "SA", SA2)], ["c", gl("AB", A2B2, "SA", AA2)]], richtig: "b",
      fehler: [{ wahl: "a", text: zw("Links kurz : lang, also rechts auch kurz : lang.", "Short : long on the left, so short : long on the right too.") },
        { wahl: "c", text: zw("Beim 2. Strahlensatz zählen nur Strecken ab S.", "The 2nd theorem only uses segments from S.") }],
      hinweise: [zw("Ordne gleich: kleine Figur oben, große unten.", "Keep the order: small figure on top, large below.")], erklaerung: zw("2. Strahlensatz: AB : A′B′ = SA : SA′.", "2nd theorem: AB : A′B′ = SA : SA′.") },
    { id: "r-wert", titel: zw("Berechnen", "Calculate"), typ: "zahl", text: "AB =", einheit: "cm", wert: au.ab, toleranz: 0.011, wertText: z(au.ab),
      frage: zw("Löse nach AB auf.", "Solve for AB."),
      fehler: [{ wert: au.a2b2 * au.sa2 / au.sa, toleranz: 0.011, text: zw("AB muss kürzer sein als A′B′ – der Kehrwert ist hineingerutscht.", "AB must be shorter than A′B′ – the reciprocal slipped in.") }],
      hinweise: [zw(`AB = ${z(au.a2b2)} · ${z(au.sa)} : ${z(au.sa2)}`, `AB = ${z(au.a2b2)} · ${z(au.sa)} : ${z(au.sa2)}`)],
      erklaerung: `AB = ${z(au.a2b2)} · ${z(au.sa)} : ${z(au.sa2)} = ${z(au.ab)} cm.` },
  ];
}

function aufgabenText(au) {
  const z = (v) => zt(v, 2);
  if (au.art === "schatten") return zw(`Ein ${z(au.stab)} m langer Stab wirft einen ${z(au.sStab)} m langen Schatten. Ein Baum daneben wirft zur selben Zeit einen ${z(au.sBaum)} m langen Schatten. Wie hoch ist der Baum?`, `A stick ${z(au.stab)} m long casts a shadow ${z(au.sStab)} m long. A tree next to it casts a shadow ${z(au.sBaum)} m long at the same time. How tall is the tree?`);
  const par = zw("AB ∥ A′B′. Alle Längen in cm, die Skizze ist nicht maßstabsgetreu.", "AB ∥ A′B′. All lengths in cm, the sketch is not to scale.");
  if (au.art === "sb2") return `${zw(`Gegeben: SA = ${z(au.sa)}, SA′ = ${z(au.sa2)}, SB = ${z(au.sb)}. Berechne SB′.`, `Given: SA = ${z(au.sa)}, SA′ = ${z(au.sa2)}, SB = ${z(au.sb)}. Find SB′.`)} ${par}`;
  if (au.art === "a2b2" || au.art === "xfigur") return `${zw(`Gegeben: SA = ${z(au.sa)}, SA′ = ${z(au.sa2)}, AB = ${z(au.ab)}. Berechne A′B′.`, `Given: SA = ${z(au.sa)}, SA′ = ${z(au.sa2)}, AB = ${z(au.ab)}. Find A′B′.`)} ${par}`;
  if (au.art === "abschnitt") return `${zw(`Gegeben: SA = ${z(au.sa)}, AA′ = ${z(au.aa2)}, AB = ${z(au.ab)}. Berechne A′B′.`, `Given: SA = ${z(au.sa)}, AA′ = ${z(au.aa2)}, AB = ${z(au.ab)}. Find A′B′.`)} ${par}`;
  return `${zw(`Gegeben: SA = ${z(au.sa)}, SA′ = ${z(au.sa2)}, A′B′ = ${z(au.a2b2)}. Berechne AB.`, `Given: SA = ${z(au.sa)}, SA′ = ${z(au.sa2)}, A′B′ = ${z(au.a2b2)}. Find AB.`)} ${par}`;
}

/* Skizze zur Sachaufgabe: Stab und Baum mit gemeinsamer Schattenspitze S */
function SchattenSkizze({ au }) {
  const W = 340, H = 186, x0 = 30, boden = 146;
  const s = Math.min((W - 2 * x0) / au.sBaum, 120 / au.hBaum);
  const xS = x0, xStab = x0 + au.sStab * s, xBaum = x0 + au.sBaum * s;
  const yStab = boden - au.stab * s, yBaum = boden - au.hBaum * s;
  const t = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700 };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw("Skizze: Stab und Baum mit ihren Schatten", "Sketch: stick and tree with their shadows")}>
      <line x1={x0 - 10} y1={boden} x2={W - 10} y2={boden} stroke={C.hellgrau} strokeWidth="1.3" />
      <line x1={xS} y1={boden} x2={xBaum} y2={yBaum} stroke={C.flaggold} strokeWidth="1.6" strokeDasharray="5 4" />
      <line x1={xStab} y1={boden} x2={xStab} y2={yStab} stroke={C.see} strokeWidth="3" strokeLinecap="round" />
      <line x1={xBaum} y1={boden} x2={xBaum} y2={yBaum} stroke={C.smaragd} strokeWidth="5" strokeLinecap="round" />
      <circle cx={xBaum} cy={yBaum + 10} r="13" fill={`${C.smaragd}33`} />
      <circle cx={xS} cy={boden} r="3.6" fill={C.tinte} />
      <text x={xS - 8} y={boden + 5} textAnchor="end" style={{ ...t, fontSize: 13, fill: C.tinte }}>S</text>
      <text x={xStab + 7} y={(boden + yStab) / 2 + 4} style={{ ...t, fontSize: 12, fill: C.see }}>{zt(au.stab, 2)} m</text>
      <text x={xBaum + 9} y={(boden + yBaum) / 2 + 4} style={{ ...t, fontSize: 13, fill: C.seeTief }}>h = ?</text>
      <line x1={xS} y1={boden + 8} x2={xStab} y2={boden + 8} stroke={C.see} strokeWidth="1.2" />
      <text x={xStab + 4} y={boden + 12} style={{ ...t, fontSize: 11, fill: C.see }}>{zt(au.sStab, 2)} m</text>
      <line x1={xS} y1={boden + 20} x2={xBaum} y2={boden + 20} stroke={C.grau} strokeWidth="1.2" />
      <text x={(xS + xBaum) / 2} y={boden + 33} textAnchor="middle" style={{ ...t, fontSize: 11.5, fill: C.grau }}>{zw("Baumschatten", "tree shadow")} {zt(au.sBaum, 2)} m</text>
    </svg>
  );
}

function hilfeS(au) {
  return hilfeKontext({
    id: `strahlen-${au.art}`, aufgabe: "Strahlensatz Strahlensätze Verhältnis Streckfaktor parallel ähnlich",
    verstehen: [
      zw("Zwei Strahlen (oder Geraden) gehen durch S und werden von zwei Parallelen geschnitten.", "Two rays (or lines) go through S and are cut by two parallel lines."),
      zw("Markiere in der Skizze, was gegeben ist und was gesucht ist.", "Mark in the sketch what is given and what you need."),
    ],
    ansatz: [
      zw("Liegen beide Strecken auf den Strahlen? → 1. Strahlensatz. Ist eine Strecke eine der Parallelen? → 2. Strahlensatz.", "Are both segments on the rays? → 1st theorem. Is one of them a parallel? → 2nd theorem."),
      zw("Schreibe die Gleichung so, dass die Unbekannte im Zähler steht.", "Write the equation with the unknown in the numerator."),
    ],
    regel: [
      zw("1. Strahlensatz: SA′ : SA = SB′ : SB", "1st theorem: SA′ : SA = SB′ : SB"),
      zw("2. Strahlensatz: A′B′ : AB = SA′ : SA – nur Strecken ab S!", "2nd theorem: A′B′ : AB = SA′ : SA – only segments from S!"),
    ],
    pruefen: [
      zw("Die große Figur hat die längeren Strecken – passt dein Ergebnis dazu?", "The large figure has the longer segments – does your result fit?"),
      zw("Bilde zur Probe beide Verhältnisse – sie müssen gleich sein.", "Check: both ratios must be equal."),
    ],
  });
}

function Ueben() {
  const [au, setAu] = useState(neueAufgabe);
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(neueAufgabe()); setStand(0); };
  const schritte = useMemo(() => schritteVon(au), [au]);
  const z = (v) => zt(v, 2);
  const werte = au.art === "schatten" ? {} : {
    sb2: { sa: z(au.sa), sa2: z(au.sa2), sb: z(au.sb) },
    a2b2: { sa: z(au.sa), sa2: z(au.sa2), ab: z(au.ab) },
    xfigur: { sa: z(au.sa), sa2: z(au.sa2), ab: z(au.ab) },
    abschnitt: { sa: z(au.sa), aa2: z(au.aa2), ab: z(au.ab) },
    rueck: { sa: z(au.sa), sa2: z(au.sa2), a2b2: z(au.a2b2) },
  }[au.art];
  const gesucht = { sb2: "sb2", a2b2: "a2b2", xfigur: "a2b2", abschnitt: "a2b2", rueck: "ab" }[au.art];
  const titel = { sb2: zw("1. Strahlensatz", "1st theorem"), a2b2: zw("2. Strahlensatz", "2nd theorem"), xfigur: zw("X-Figur", "X figure"), abschnitt: zw("Abschnitt gegeben", "Piece given"), rueck: zw("Rückwärts", "Backwards"), schatten: zw("Sachaufgabe", "Word problem") }[au.art];
  return (
    <div style={{ ...karte, marginTop: 16 }} key={au.id}>
      <p style={kicker}>{titel}</p>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 8 }}>{aufgabenText(au)}</p>
      <div style={{ background: C.sand, borderRadius: 14, padding: 8 }}>
        {au.art === "schatten" ? <SchattenSkizze au={au} />
          : <Skizze sa={au.sa} sb={au.sb} k={au.k} x={au.x} werte={werte} gesucht={gesucht} hoehe={210} />}
      </div>
      <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Richtig gelöst – Verhältnis aufgestellt und berechnet.", "Solved – ratio set up and calculated.")} />
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New exercise")}</GrosserKnopf>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><IchHaengeFest kontext={hilfeS(au)} /></div>
    </div>
  );
}

const MODI = [["entdecken", zw("Entdecken", "Explore")], ["ueben", zw("Üben", "Practise")]];

export function Strahlensaetze() {
  const [modus, setModus] = useState("entdecken");
  return (
    <Seite titel={zw("Strahlensätze", "Intercept theorems")}
      text={zw("Zwei Strahlen, zwei Parallelen, ein Streckfaktor: Wer die Verhältnisse richtig aufstellt, berechnet jede fehlende Länge – auch Baumhöhen aus Schatten.", "Two rays, two parallels, one scale factor: set up the ratios correctly and you can find any missing length – even tree heights from shadows.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Strahlensätze", "Intercept theorems")} />
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
        <p style={{ margin: "0 0 6px" }}>{zw("Werden zwei Strahlen mit gemeinsamem Anfangspunkt S von zwei Parallelen geschnitten, gilt:", "If two rays with common starting point S are cut by two parallel lines:")}</p>
        <p style={{ margin: "0 0 6px" }}><b>{zw("1. Strahlensatz", "1st theorem")}</b> <M t={`\\frac{${ob(SA2)}}{${ob("SA")}} = \\frac{${ob(SB2)}}{${ob("SB")}}`} /></p>
        <p style={{ margin: "0 0 6px" }}><b>{zw("2. Strahlensatz", "2nd theorem")}</b> <M t={`\\frac{${ob(A2B2)}}{${ob("AB")}} = \\frac{${ob(SA2)}}{${ob("SA")}}`} /></p>
        <p style={{ margin: 0 }}>{zw("Beides gilt auch für die X-Figur (Geraden kreuzen sich in S). Beim 2. Strahlensatz nur Strecken verwenden, die in S beginnen.", "Both also hold for the X figure (lines cross at S). In the 2nd theorem only use segments that start at S.")}</p>
      </Aufklapp>
      <div style={{ display: modus === "entdecken" ? "block" : "none" }}><Entdecken /></div>
      <div style={{ display: modus === "ueben" ? "block" : "none" }}><Ueben /></div>
    </Seite>
  );
}
