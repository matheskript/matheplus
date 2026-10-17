/* ============================================================
   Mittelstufe · Geometrie: Trigonometrie am Dreieck
   · Entdecken – rechtwinkliges Dreieck mit Reglern für α und c,
     Gegenkathete/Ankathete/Hypotenuse farbig, sin/cos/tan live
   · Rechtwinklig – Seite oder Winkel mit sin, cos, tan berechnen
   · Allgemein – Sinussatz und Kosinussatz (SWS, SSS, WSW, SsW)
   Bezeichnungen: Ecken A, B, C; Seite a gegenüber A usw.;
   Winkel α bei A, β bei B, γ bei C. Rechtwinklig: γ = 90°.
   Typische Fehler mit eigener Rückmeldung: Taschenrechner im
   Bogenmaß (RAD statt DEG), falsche Funktion, Kehrwert,
   beim Kosinussatz das „− 2bc · cos α“ vergessen.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { Auswahl, GrosserKnopf, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { wahl } from "./rechnen2.js";
import { Aufklapp, ModusLeiste, Seite, SchrittFolge, zt } from "./ui3.jsx";

let zaehler = 0;
const RAD = Math.PI / 180;
const sinG = (g) => Math.sin(g * RAD), cosG = (g) => Math.cos(g * RAD), tanG = (g) => Math.tan(g * RAD);
const asinG = (x) => Math.asin(x) / RAD, acosG = (x) => Math.acos(x) / RAD, atanG = (x) => Math.atan(x) / RAD;
const r1 = (v) => Math.round(v * 10) / 10;
const z2 = (v) => zt(v, 2);
const grad = (v, st = 1) => `${zt(v, st)}°`;
const T = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700 };

/* ---------- Dreiecksskizze ----------
   ecken: A, B, C als Punkte (Einheiten, y nach oben). beschr: { a, b, c, al, be, ga } (Text, "?" oder null).
   farben: Farbe je Seite. recht: rechter Winkel bei C zeichnen. */
function Dreieck({ A, B, Cc, beschr = {}, farben = {}, recht = false, hoehe = 220, winkelBogen = ["al"] }) {
  const pts = [A, B, Cc];
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const W = 340, rand = 34;
  const br = Math.max(...xs) - Math.min(...xs), ho = Math.max(...ys) - Math.min(...ys);
  const s = Math.min((W - 2 * rand) / br, (hoehe - 2 * rand) / Math.max(ho, 0.3));
  const ox = rand - Math.min(...xs) * s + ((W - 2 * rand) - br * s) / 2;
  const oy = hoehe - rand + Math.min(...ys) * s - ((hoehe - 2 * rand) - ho * s) / 2;
  const P = (p) => [ox + p[0] * s, oy - p[1] * s];
  const [pa, pb, pc] = [P(A), P(B), P(Cc)];
  const mitte = [(pa[0] + pb[0] + pc[0]) / 3, (pa[1] + pb[1] + pc[1]) / 3];
  const seite = (p, q, text, farbe) => {
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    const dx = mx - mitte[0], dy = my - mitte[1], l = Math.hypot(dx, dy) || 1;
    /* Abstand wächst mit der Textbreite, wenn die Seite steil steht (Text sonst auf der Linie) */
    const tb = text == null ? 0 : String(text).length * 7.2;
    const ab = 14 + Math.abs(dx / l) * tb / 2;
    const lx = Math.max(tb / 2 + 4, Math.min(W - tb / 2 - 4, mx + (dx / l) * ab)), ly = my + (dy / l) * ab;
    return (
      <g>
        <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={farbe || C.tinte} strokeWidth={farbe ? 3.4 : 2} strokeLinecap="round" />
        {text != null && (text === "?"
          ? <><rect x={lx - 11} y={ly - 10} width="22" height="19" rx="9.5" fill={C.flaggold} /><text x={lx} y={ly + 4.5} textAnchor="middle" style={{ ...T, fontSize: 12, fill: C.seeTief }}>?</text></>
          : <text x={lx} y={ly + 4.5} textAnchor="middle" style={{ ...T, fontSize: 12.5, fill: farbe || C.tinte }}>{text}</text>)}
      </g>
    );
  };
  /* Winkelbogen an Ecke e zwischen den Richtungen zu u und v */
  const bogen = (e, u, v, text, farbe = C.see) => {
    const w1 = Math.atan2(u[1] - e[1], u[0] - e[0]), w2 = Math.atan2(v[1] - e[1], v[0] - e[0]);
    let d = w2 - w1; while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
    const r = 24, p1 = [e[0] + r * Math.cos(w1), e[1] + r * Math.sin(w1)], p2 = [e[0] + r * Math.cos(w1 + d), e[1] + r * Math.sin(w1 + d)];
    const wm = w1 + d / 2, tx = e[0] + 40 * Math.cos(wm), ty = e[1] + 40 * Math.sin(wm);
    return (
      <g>
        <path d={`M${p1[0]} ${p1[1]} A${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${p2[0]} ${p2[1]}`} fill="none" stroke={farbe} strokeWidth="2" />
        {text != null && (text === "?"
          ? <><rect x={tx - 11} y={ty - 10} width="22" height="19" rx="9.5" fill={C.flaggold} /><text x={tx} y={ty + 4.5} textAnchor="middle" style={{ ...T, fontSize: 12, fill: C.seeTief }}>?</text></>
          : <text x={tx} y={ty + 4.5} textAnchor="middle" style={{ ...T, fontSize: 12, fill: farbe }}>{text}</text>)}
      </g>
    );
  };
  const ecke = (p, n) => {
    const dx = p[0] - mitte[0], dy = p[1] - mitte[1], l = Math.hypot(dx, dy) || 1;
    return <text x={p[0] + (dx / l) * 15} y={p[1] + (dy / l) * 15 + 5} textAnchor="middle" style={{ ...T, fontSize: 14, fill: C.tinte }}>{n}</text>;
  };
  let rechter = null;
  if (recht) {
    const u = [pa[0] - pc[0], pa[1] - pc[1]], v = [pb[0] - pc[0], pb[1] - pc[1]];
    const lu = Math.hypot(...u), lv = Math.hypot(...v), q = 13;
    const e1 = [pc[0] + (u[0] / lu) * q, pc[1] + (u[1] / lu) * q], e2 = [pc[0] + (v[0] / lv) * q, pc[1] + (v[1] / lv) * q];
    rechter = <path d={`M${e1[0]} ${e1[1]} L${e1[0] + e2[0] - pc[0]} ${e1[1] + e2[1] - pc[1]} L${e2[0]} ${e2[1]}`} fill="none" stroke={C.tinte} strokeWidth="1.4" />;
  }
  return (
    <svg viewBox={`0 0 ${W} ${hoehe}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw("Dreieck ABC mit Seiten a, b, c", "Triangle ABC with sides a, b, c")}>
      <path d={`M${pa[0]} ${pa[1]} L${pb[0]} ${pb[1]} L${pc[0]} ${pc[1]} Z`} fill={`${C.see}0D`} />
      {seite(pb, pc, beschr.a, farben.a)}
      {seite(pa, pc, beschr.b, farben.b)}
      {seite(pa, pb, beschr.c, farben.c)}
      {rechter}
      {winkelBogen.includes("al") && bogen(pa, pb, pc, beschr.al)}
      {winkelBogen.includes("be") && bogen(pb, pc, pa, beschr.be)}
      {winkelBogen.includes("ga") && bogen(pc, pa, pb, beschr.ga)}
      {ecke(pa, "A")}{ecke(pb, "B")}{ecke(pc, "C")}
    </svg>
  );
}

/* Rechtwinkliges Dreieck: γ = 90° bei C, α bei A. Seiten a (gegenüber α), b (an α), c (Hypotenuse) */
const rechtEcken = (al, c) => {
  const a = c * sinG(al), b = c * cosG(al);
  return { A: [0, 0], Cc: [b, 0], B: [b, a] };
};

/* ---------- Regler ---------- */
function Regler({ name, wert, setWert, min, max, schritt, farbe = C.see, format }) {
  const knopf = (d, z) => {
    const aus = (d < 0 && wert <= min + 1e-9) || (d > 0 && wert >= max - 1e-9);
    return (
      <button type="button" aria-label={`${name} ${d > 0 ? "+" : "−"}`} disabled={aus} onClick={() => setWert(Math.round(Math.max(min, Math.min(max, wert + d * schritt)) * 100) / 100)}
        style={{ width: 38, height: 30, borderRadius: 9, border: `1.5px solid ${farbe}66`, background: `${farbe}14`, color: farbe, fontSize: 18, fontWeight: 800,
          fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1, touchAction: "manipulation", opacity: aus ? 0.35 : 1 }}>{z}</button>
    );
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: farbe, minWidth: 18 }}>{name}</span>
      <input type="range" min={min} max={max} step={schritt} value={wert} onChange={(e) => setWert(Number(e.target.value))} aria-label={name} style={{ flex: 1, minWidth: 0, accentColor: farbe }} />
      <span style={{ fontSize: 15, fontWeight: 800, color: C.tinte, minWidth: 40, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{format(wert)}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{knopf(1, "+")}{knopf(-1, "−")}</div>
    </div>
  );
}

/* ---------- Modus 1: Entdecken ---------- */
const GK = C.goldWarm, AK = C.smaragd, HY = C.see;
function Entdecken() {
  const [al, setAl] = useState(35);
  const [c, setC] = useState(6);
  const [sicht, setSicht] = useState("al");
  const { A, B, Cc } = rechtEcken(al, c);
  const a = c * sinG(al), b = c * cosG(al);
  const w = sicht === "al" ? al : 90 - al;
  const wn = sicht === "al" ? "α" : "β";
  const gk = sicht === "al" ? "a" : "b", ak = sicht === "al" ? "b" : "a";
  const gkW = sicht === "al" ? a : b, akW = sicht === "al" ? b : a;
  const farben = sicht === "al" ? { a: GK, b: AK, c: HY } : { b: GK, a: AK, c: HY };
  const zeile = (fn, z, n, wert) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.linie}`, flexWrap: "wrap" }}>
      <span style={{ fontSize: 15, color: C.tinte, display: "inline-flex", alignItems: "center", gap: 6 }}>
        <M t={`\\${fn} ${wn} = \\frac{\\text{${z[0]}}}{\\text{${n[0]}}} = \\frac{${z[1]}}{${n[1]}}`} />
      </span>
      <span style={{ fontSize: 15, fontWeight: 800, color: C.see, fontVariantNumeric: "tabular-nums" }}>{zt(wert, 3)}</span>
    </div>
  );
  const GKt = zw("GK", "opp"), AKt = zw("AK", "adj"), HYt = zw("H", "hyp");
  return (
    <>
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={kicker}>{zw("Rechtwinkliges Dreieck", "Right triangle")}</p>
        <Auswahl optionen={[["al", zw("Sicht von α", "Seen from α")], ["be", zw("Sicht von β", "Seen from β")]]} wert={sicht} setWert={setSicht} label={zw("Bezugswinkel", "Reference angle")} />
        <p style={{ fontSize: 13, color: C.see, fontWeight: 600, margin: "14px 0 6px" }}>{zw("Zieh an den Reglern: Die Verhältnisse hängen nur vom Winkel ab, nicht von der Größe.", "Move the sliders: the ratios only depend on the angle, not on the size.")}</p>
        <div style={{ display: "grid", gap: 10 }}>
          <Regler name="α" wert={al} setWert={setAl} min={5} max={85} schritt={1} format={(v) => grad(v, 0)} />
          <Regler name="c" wert={c} setWert={setC} min={2} max={9} schritt={0.5} farbe={HY} format={(v) => zt(v, 1)} />
        </div>
        <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 8 }}>
          <Dreieck A={A} B={B} Cc={Cc} recht farben={farben} winkelBogen={[sicht]}
            beschr={{ a: `a = ${z2(a)}`, b: `b = ${z2(b)}`, c: `c = ${z2(c)}`, al: sicht === "al" ? grad(al, 0) : null, be: sicht === "be" ? grad(90 - al, 0) : null }} />
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8, fontSize: 12.5, fontWeight: 700 }}>
          <span style={{ color: GK }}>■ {zw("Gegenkathete", "opposite")} ({gk})</span>
          <span style={{ color: AK }}>■ {zw("Ankathete", "adjacent")} ({ak})</span>
          <span style={{ color: HY }}>■ {zw("Hypotenuse", "hypotenuse")} (c)</span>
        </div>
      </div>
      <div style={{ ...karte, marginTop: 12 }}>
        <p style={kicker}>{zw("Seitenverhältnisse für ", "Side ratios for ")}<span style={{ textTransform: "none" }}>{wn} = {zt(w, 0)}°</span></p>
        {zeile("sin", [GKt, gk], [HYt, "c"], gkW / c)}
        {zeile("cos", [AKt, ak], [HYt, "c"], akW / c)}
        {zeile("tan", [GKt, gk], [AKt, ak], gkW / akW)}
        <p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.6, margin: "10px 0 0" }}>
          {zw(`Die Hypotenuse liegt immer gegenüber dem rechten Winkel. Welche Kathete „Gegen-“ und welche „An-“kathete ist, hängt vom Winkel ab: Für α ist a die Gegenkathete, für β ist es b. Darum gilt sin α = cos β.`, `The hypotenuse is always opposite the right angle. Which leg is “opposite” and which is “adjacent” depends on the angle: for α, a is opposite; for β, it is b. That is why sin α = cos β.`)}
        </p>
      </div>
    </>
  );
}

/* ---------- Typische Fehler ---------- */
const radFehler = (wert) => ({ wert, toleranz: 0.02, text: zw("Dein Taschenrechner rechnet im Bogenmaß (RAD). Stell ihn auf Grad (DEG) um.", "Your calculator is in radians (RAD). Switch it to degrees (DEG).") });

/* ---------- Modus 2: Rechtwinklig ---------- */
/* rolle: Rolle einer Seite bezüglich α: a = gk, b = ak, c = hy */
const ROLLE = { a: "gk", b: "ak", c: "hy" };
const FUNKTION = (r1, r2) => {
  const s = new Set([r1, r2]);
  if (s.has("gk") && s.has("hy")) return "sin";
  if (s.has("ak") && s.has("hy")) return "cos";
  return "tan";
};
const FN_FORMEL = { sin: "\\sin α = \\frac{a}{c}", cos: "\\cos α = \\frac{b}{c}", tan: "\\tan α = \\frac{a}{b}" };

export function neueRechtAufgabe() {
  const art = Math.random() < 0.6 ? "seite" : "winkel";
  if (art === "seite") {
    const al = 20 + Math.floor(Math.random() * 51);
    const c = wahl([4, 5, 6, 7.5, 8, 10]);
    const exakt = { a: c * sinG(al), b: c * cosG(al), c };
    const geg = wahl(["a", "b", "c"]);
    const ges = wahl(["a", "b", "c"].filter((x) => x !== geg));
    const gWert = r1(exakt[geg]);
    const fn = FUNKTION(ROLLE[geg], ROLLE[ges]);
    /* gesuchte Seite aus der gegebenen (gerundeten) Seite */
    const f = { sin: sinG(al), cos: cosG(al), tan: tanG(al) }[fn];
    const fr = { sin: Math.sin(al), cos: Math.cos(al), tan: Math.tan(al) }[fn];   // Bogenmaß-Fehler
    let wert, radWert, formel, kehr, formelMit;
    const gT = String(zt(gWert, 1)).replace(",", "{,}");
    const zaehlerSeite = fn === "sin" ? "a" : fn === "cos" ? "b" : "a";       // Zähler der Funktion
    if (ges === zaehlerSeite) { wert = gWert * f; radWert = gWert * fr; kehr = gWert / f; formel = `${ges} = ${geg} \\cdot \\${fn} α`; formelMit = `${ges} = ${gT} \\cdot \\${fn} ${al}°`; }
    else { wert = gWert / f; radWert = gWert / fr; kehr = gWert * f; formel = `${ges} = \\frac{${geg}}{\\${fn} α}`; formelMit = `${ges} = \\frac{${gT}}{\\${fn} ${al}°}`; }
    return { id: ++zaehler, art, al, c, geg, ges, gWert, fn, wert, radWert, kehr, formel, formelMit, ecken: rechtEcken(al, c) };
  }
  /* Winkel aus zwei Seiten (ganze Zahlen) */
  const paar = wahl([["a", "c"], ["b", "c"], ["a", "b"]]);
  let a, b, c;
  if (paar[1] === "c") { c = 5 + Math.floor(Math.random() * 8); const k = 2 + Math.floor(Math.random() * (c - 3)); if (paar[0] === "a") { a = k; b = Math.sqrt(c * c - a * a); } else { b = k; a = Math.sqrt(c * c - b * b); } }
  else { a = 2 + Math.floor(Math.random() * 8); b = 2 + Math.floor(Math.random() * 8); if (a === b) b += 1; c = Math.hypot(a, b); }
  const al = atanG(a / b);
  const fn = FUNKTION(ROLLE[paar[0]], ROLLE[paar[1]]);
  const q = { sin: a / c, cos: b / c, tan: a / b }[fn];
  const radWinkel = { sin: Math.asin(q), cos: Math.acos(q), tan: Math.atan(q) }[fn];
  return { id: ++zaehler, art, paar, a, b, c, al, fn, q, radWinkel, ecken: { A: [0, 0], Cc: [b, 0], B: [b, a] } };
}

export function rechtSchritte(au) {
  const fnText = (fn) => <M key={fn} t={FN_FORMEL[fn]} />;
  const optionen = [["sin", fnText("sin")], ["cos", fnText("cos")], ["tan", fnText("tan")]];
  const rolleName = { gk: zw("Gegenkathete", "opposite"), ak: zw("Ankathete", "adjacent"), hy: zw("Hypotenuse", "hypotenuse") };
  if (au.art === "seite") {
    const andere = ["sin", "cos", "tan"].filter((f) => f !== au.fn);
    return [
      { id: "r-fn", titel: zw("Passende Funktion", "Matching function"), typ: "wahl",
        frage: zw(`Gegeben sind α und ${au.geg} (${rolleName[ROLLE[au.geg]]}), gesucht ist ${au.ges} (${rolleName[ROLLE[au.ges]]}). Welche Beziehung verbindet beide?`, `Given α and ${au.geg} (${rolleName[ROLLE[au.geg]]}), you need ${au.ges} (${rolleName[ROLLE[au.ges]]}). Which relation links both?`),
        optionen, richtig: au.fn,
        fehler: andere.map((f) => ({ wahl: f, text: zw(`Bei ${f} kommt eine Seite vor, die weder gegeben noch gesucht ist.`, `${f} uses a side that is neither given nor wanted.`) })),
        hinweise: [zw("Bestimme zuerst für beide Seiten: Gegenkathete, Ankathete oder Hypotenuse – von α aus gesehen.", "First name both sides as opposite, adjacent or hypotenuse – seen from α."), zw("GK/H = sin, AK/H = cos, GK/AK = tan.", "opp/hyp = sin, adj/hyp = cos, opp/adj = tan.")],
        erklaerung: <span>{zw("Passend ist", "The right one is")} <M t={FN_FORMEL[au.fn]} />.</span> },
      { id: "r-wert", titel: zw("Berechnen", "Calculate"), typ: "zahl", text: `${au.ges} ≈`, wert: au.wert, toleranz: 0.02, wertText: z2(au.wert), rundung: zw("Auf zwei Nachkommastellen.", "To two decimals."),
        frage: <span>{zw("Stelle um und berechne", "Rearrange and calculate")} <M t={au.formel} />.</span>,
        fehler: [radFehler(au.radWert), { wert: au.kehr, toleranz: 0.02, text: zw("Falsch umgestellt: Steht die gesuchte Seite im Nenner, wird geteilt – im Zähler wird multipliziert.", "Rearranged wrongly: if the wanted side is in the denominator you divide; in the numerator you multiply.") }],
        hinweise: [<M key="h" t={au.formelMit} />],
        erklaerung: <span><M t={au.formelMit} /> ≈ {z2(au.wert)}</span> },
    ];
  }
  const [s1, s2] = au.paar;
  const wert1 = au[s1], wert2 = au[s2];
  return [
    { id: "w-fn", titel: zw("Passende Funktion", "Matching function"), typ: "wahl",
      frage: zw(`Gegeben sind ${s1} = ${zt(wert1, 2)} und ${s2} = ${zt(wert2, 2)}. Mit welcher Beziehung bekommst du α?`, `Given ${s1} = ${zt(wert1, 2)} and ${s2} = ${zt(wert2, 2)}. Which relation gives you α?`),
      optionen, richtig: au.fn,
      fehler: ["sin", "cos", "tan"].filter((f) => f !== au.fn).map((f) => ({ wahl: f, text: zw(`${f} braucht eine Seite, die hier nicht gegeben ist.`, `${f} needs a side that isn't given here.`) })),
      hinweise: [zw("Von α aus: Welche der beiden Seiten ist Gegenkathete, Ankathete, Hypotenuse?", "From α: which of the two sides is opposite, adjacent, hypotenuse?")],
      erklaerung: <span><M t={FN_FORMEL[au.fn]} /></span> },
    { id: "w-q", titel: zw("Verhältnis", "Ratio"), typ: "zahl", text: `${au.fn} α ≈`, wert: au.q, toleranz: 0.0015, wertText: zt(au.q, 3), rundung: zw("Auf drei Nachkommastellen.", "To three decimals."),
      frage: zw("Berechne den Wert des Verhältnisses.", "Calculate the value of the ratio."),
      fehler: [{ wert: 1 / au.q, toleranz: 0.0015, text: zw("Kehrwert: Zähler und Nenner vertauscht.", "Reciprocal: numerator and denominator swapped.") }],
      hinweise: [zw("Seite durch Seite, wie in der Formel.", "Side divided by side, as in the formula.")], erklaerung: `${au.fn} α ≈ ${zt(au.q, 3)}` },
    { id: "w-al", titel: zw("Winkel", "Angle"), typ: "zahl", text: "α ≈", einheit: "°", wert: au.al, toleranz: 0.1, wertText: zt(au.al, 1), rundung: zw("Auf eine Nachkommastelle.", "To one decimal."),
      frage: zw(`Wende die Umkehrfunktion an: α = ${au.fn}⁻¹(…)`, `Apply the inverse function: α = ${au.fn}⁻¹(…)`),
      fehler: [radFehler(au.radWinkel)],
      hinweise: [zw(`Taschenrechner: SHIFT + ${au.fn}, Modus DEG.`, `Calculator: SHIFT + ${au.fn}, mode DEG.`)], erklaerung: `α = ${au.fn}⁻¹(${zt(au.q, 3)}) ≈ ${zt(au.al, 1)}°` },
    { id: "w-be", titel: zw("Dritter Winkel", "Third angle"), typ: "zahl", text: "β ≈", einheit: "°", wert: 90 - au.al, toleranz: 0.1, wertText: zt(90 - au.al, 1),
      frage: zw("Wie groß ist β?", "How large is β?"),
      fehler: [{ wert: 180 - au.al, toleranz: 0.1, text: zw("Der rechte Winkel γ = 90° gehört auch zur Winkelsumme.", "The right angle γ = 90° also belongs to the angle sum.") }],
      hinweise: [zw("Winkelsumme im Dreieck: α + β + γ = 180°, γ = 90°.", "Angle sum: α + β + γ = 180°, γ = 90°.")], erklaerung: `β = 90° − ${zt(au.al, 1)}° = ${zt(90 - au.al, 1)}°` },
  ];
}

function Rechtwinklig() {
  const [au, setAu] = useState(neueRechtAufgabe);
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(neueRechtAufgabe()); setStand(0); };
  const schritte = useMemo(() => rechtSchritte(au), [au]);
  const { A, B, Cc } = au.ecken;
  const beschr = au.art === "seite"
    ? { [au.geg]: `${au.geg} = ${zt(au.gWert, 1)}`, [au.ges]: "?", al: grad(au.al, 0) }
    : { [au.paar[0]]: `${au.paar[0]} = ${zt(au[au.paar[0]], 2)}`, [au.paar[1]]: `${au.paar[1]} = ${zt(au[au.paar[1]], 2)}`, al: "?" };
  return (
    <div style={{ ...karte, marginTop: 16 }} key={au.id}>
      <p style={kicker}>{au.art === "seite" ? zw("Seite berechnen", "Find a side") : zw("Winkel berechnen", "Find an angle")}</p>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 8 }}>
        {au.art === "seite"
          ? zw(`Im Dreieck ABC ist γ = 90°, α = ${au.al}° und ${au.geg} = ${zt(au.gWert, 1)} cm. Berechne ${au.ges}.`, `In triangle ABC, γ = 90°, α = ${au.al}° and ${au.geg} = ${zt(au.gWert, 1)} cm. Find ${au.ges}.`)
          : zw(`Im Dreieck ABC ist γ = 90°, ${au.paar[0]} = ${zt(au[au.paar[0]], 2)} cm und ${au.paar[1]} = ${zt(au[au.paar[1]], 2)} cm. Berechne α und β.`, `In triangle ABC, γ = 90°, ${au.paar[0]} = ${zt(au[au.paar[0]], 2)} cm and ${au.paar[1]} = ${zt(au[au.paar[1]], 2)} cm. Find α and β.`)}
      </p>
      <div style={{ background: C.sand, borderRadius: 14, padding: 8 }}>
        <Dreieck A={A} B={B} Cc={Cc} recht beschr={beschr} hoehe={200} />
      </div>
      <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Richtig – Seiten zugeordnet, Funktion gewählt, berechnet.", "Correct – sides named, function chosen, calculated.")} />
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New exercise")}</GrosserKnopf>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><IchHaengeFest kontext={hilfeT(`trig-r-${au.art}`)} /></div>
    </div>
  );
}

/* ---------- Modus 3: Sinussatz und Kosinussatz ---------- */
function neuesDreieck() {
  for (;;) {
    const al = 35 + Math.floor(Math.random() * 46), be = 30 + Math.floor(Math.random() * 46), ga = 180 - al - be;
    if (ga < 25) continue;
    const c = wahl([5, 6, 7, 8, 9, 10]);
    return { al, be, ga, c, a: c * sinG(al) / sinG(ga), b: c * sinG(be) / sinG(ga) };
  }
}
export function neueAllgAufgabe() {
  const art = wahl(["kos-seite", "kos-winkel", "sin-seite", "sin-winkel"]);
  const d = neuesDreieck();
  const a = r1(d.a), b = r1(d.b), c = d.c;
  if (art === "kos-seite") {   // SWS: b, c, α → a
    const wert = Math.sqrt(b * b + c * c - 2 * b * c * cosG(d.al));
    return { id: ++zaehler, art, d, b, c, al: d.al, wert, ohne: Math.sqrt(b * b + c * c), rad: Math.sqrt(Math.abs(b * b + c * c - 2 * b * c * Math.cos(d.al))) };
  }
  if (art === "kos-winkel") {   // SSS: a, b, c → α
    const q = (b * b + c * c - a * a) / (2 * b * c);
    return { id: ++zaehler, art, d, a, b, c, q, wert: acosG(q), rad: Math.acos(q) };
  }
  if (art === "sin-seite") {   // WSW: α, β, a → b
    const wert = a * sinG(d.be) / sinG(d.al);
    return { id: ++zaehler, art, d, a, al: d.al, be: d.be, wert, kehr: a * sinG(d.al) / sinG(d.be), rad: a * Math.sin(d.be) / Math.sin(d.al) };
  }
  /* SsW: a, b, α mit a ≥ b → β eindeutig (spitz) */
  let A = a, B = b, AL = d.al, BE = d.be;
  if (a < b) { A = b; B = a; AL = d.be; BE = d.al; }   // Rollen tauschen, damit die größere Seite gegenüber dem gegebenen Winkel liegt
  const q = B * sinG(AL) / A;
  return { id: ++zaehler, art, d, a: A, b: B, al: AL, getauscht: a < b, q, wert: asinG(q), rad: Math.asin(q) };
}

export function allgSchritte(au) {
  const satzFrage = { id: "a-satz", titel: zw("Welcher Satz?", "Which law?"), typ: "wahl",
    frage: zw("Welcher Satz führt hier zum Ziel?", "Which law gets you there?"),
    optionen: [["sin", zw("Sinussatz", "Law of sines")], ["kos", zw("Kosinussatz", "Law of cosines")], ["pyth", zw("Satz des Pythagoras", "Pythagorean theorem")]],
    richtig: au.art.startsWith("kos") ? "kos" : "sin",
    fehler: [{ wahl: "pyth", text: zw("Pythagoras gilt nur im rechtwinkligen Dreieck – hier gibt es keinen rechten Winkel.", "Pythagoras only holds in right triangles – there's no right angle here.") },
      au.art.startsWith("kos")
        ? { wahl: "sin", text: zw("Für den Sinussatz brauchst du ein Paar aus Seite und gegenüberliegendem Winkel – das fehlt hier.", "The law of sines needs a pair of a side and its opposite angle – that's missing here.") }
        : { wahl: "kos", text: zw("Hier kennst du ein Paar aus Seite und gegenüberliegendem Winkel – das ist der Fall für den Sinussatz.", "You know a pair of a side and its opposite angle – that's a case for the law of sines.") }],
    hinweise: [zw("Gibt es ein Paar „Seite + gegenüberliegender Winkel“? Dann Sinussatz. Sonst (SWS oder SSS) Kosinussatz.", "Is there a pair “side + opposite angle”? Then law of sines. Otherwise (SAS or SSS) law of cosines.")],
    erklaerung: au.art.startsWith("kos") ? zw("Kosinussatz: zwei Seiten und der eingeschlossene Winkel (SWS) oder drei Seiten (SSS).", "Law of cosines: two sides and the included angle (SAS) or three sides (SSS).") : zw("Sinussatz: Ein Paar aus Seite und Gegenwinkel ist bekannt.", "Law of sines: a pair of a side and its opposite angle is known.") };
  if (au.art === "kos-seite") return [satzFrage,
    { id: "a-kos-a", titel: zw("Seite a", "Side a"), typ: "zahl", text: "a ≈", einheit: "cm", wert: au.wert, toleranz: 0.02, wertText: z2(au.wert), rundung: zw("Auf zwei Nachkommastellen.", "To two decimals."),
      frage: <M t="a^2 = b^2 + c^2 − 2bc \cdot \cos α" />,
      fehler: [{ wert: au.ohne, toleranz: 0.02, text: zw("Das „− 2bc · cos α“ fehlt – ohne ihn wäre es Pythagoras.", "The “− 2bc · cos α” is missing – without it, it would be Pythagoras.") }, radFehler(au.rad),
        { wert: au.wert * au.wert, toleranz: 0.05, text: zw("Das ist a². Zieh noch die Wurzel.", "That's a². Take the square root.") }],
      hinweise: [<M key="h" t={`a^2 = ${zt(au.b, 1)}^2 + ${au.c}^2 − 2 \\cdot ${zt(au.b, 1)} \\cdot ${au.c} \\cdot \\cos ${au.al}°`} />],
      erklaerung: <span><M t={`a = \\sqrt{${zt(au.b, 1)}^2 + ${au.c}^2 − 2 \\cdot ${zt(au.b, 1)} \\cdot ${au.c} \\cdot \\cos ${au.al}°}`} /> ≈ {z2(au.wert)} cm</span> }];
  if (au.art === "kos-winkel") return [satzFrage,
    { id: "a-kos-q", titel: "cos α", typ: "zahl", text: "cos α ≈", wert: au.q, toleranz: 0.0015, wertText: zt(au.q, 3), rundung: zw("Auf drei Nachkommastellen.", "To three decimals."),
      frage: <span>{zw("Stelle den Kosinussatz nach cos α um:", "Rearrange the law of cosines for cos α:")} <M t="\cos α = \frac{b^2 + c^2 − a^2}{2bc}" /></span>,
      fehler: [{ wert: (au.a * au.a - au.b * au.b - au.c * au.c) / (2 * au.b * au.c), toleranz: 0.0015, text: zw("Vorzeichen: Im Zähler steht b² + c² − a².", "Sign: the numerator is b² + c² − a².") }],
      hinweise: [<M key="h" t={`\\cos α = \\frac{${zt(au.b, 1)}^2 + ${au.c}^2 − ${zt(au.a, 1)}^2}{2 \\cdot ${zt(au.b, 1)} \\cdot ${au.c}}`} />], erklaerung: `cos α ≈ ${zt(au.q, 3)}` },
    { id: "a-kos-al", titel: zw("Winkel α", "Angle α"), typ: "zahl", text: "α ≈", einheit: "°", wert: au.wert, toleranz: 0.1, wertText: zt(au.wert, 1), rundung: zw("Auf eine Nachkommastelle.", "To one decimal."),
      frage: zw("Wende cos⁻¹ an.", "Apply cos⁻¹."), fehler: [radFehler(au.rad)], hinweise: [zw("SHIFT + cos, Modus DEG.", "SHIFT + cos, mode DEG.")], erklaerung: `α = cos⁻¹(${zt(au.q, 3)}) ≈ ${zt(au.wert, 1)}°` }];
  if (au.art === "sin-seite") return [satzFrage,
    { id: "a-sin-b", titel: zw("Seite b", "Side b"), typ: "zahl", text: "b ≈", einheit: "cm", wert: au.wert, toleranz: 0.02, wertText: z2(au.wert), rundung: zw("Auf zwei Nachkommastellen.", "To two decimals."),
      frage: <span><M t="\frac{b}{\sin β} = \frac{a}{\sin α}" /> {zw("– nach b umstellen.", "– solve for b.")}</span>,
      fehler: [{ wert: au.kehr, toleranz: 0.02, text: zw("sin α und sin β vertauscht: b gehört zu β.", "sin α and sin β swapped: b belongs to β.") }, radFehler(au.rad)],
      hinweise: [<M key="h" t={`b = \\frac{${zt(au.a, 1)} \\cdot \\sin ${au.be}°}{\\sin ${au.al}°}`} />],
      erklaerung: <span><M t={`b = \\frac{${zt(au.a, 1)} \\cdot \\sin ${au.be}°}{\\sin ${au.al}°}`} /> ≈ {z2(au.wert)} cm</span> }];
  return [satzFrage,
    { id: "a-sin-q", titel: "sin β", typ: "zahl", text: "sin β ≈", wert: au.q, toleranz: 0.0015, wertText: zt(au.q, 3), rundung: zw("Auf drei Nachkommastellen.", "To three decimals."),
      frage: <span><M t="\frac{\sin β}{b} = \frac{\sin α}{a}" /> {zw("– nach sin β umstellen.", "– solve for sin β.")}</span>,
      fehler: [{ wert: au.a * sinG(au.al) / au.b, toleranz: 0.0015, text: zw("a und b vertauscht – ein Sinus ist nie größer als 1.", "a and b swapped – a sine is never larger than 1.") }],
      hinweise: [<M key="h" t={`\\sin β = \\frac{${zt(au.b, 1)} \\cdot \\sin ${au.al}°}{${zt(au.a, 1)}}`} />], erklaerung: `sin β ≈ ${zt(au.q, 3)}` },
    { id: "a-sin-be", titel: zw("Winkel β", "Angle β"), typ: "zahl", text: "β ≈", einheit: "°", wert: au.wert, toleranz: 0.1, wertText: zt(au.wert, 1), rundung: zw("Auf eine Nachkommastelle.", "To one decimal."),
      frage: zw("Wende sin⁻¹ an. Da b < a, ist β kleiner als α – also spitz und eindeutig.", "Apply sin⁻¹. Since b < a, β is smaller than α – acute and unique."),
      fehler: [radFehler(au.rad), { wert: 180 - au.wert, toleranz: 0.1, text: zw("Das wäre die stumpfe Lösung. Gegenüber der kürzeren Seite liegt der kleinere Winkel – β ist spitz.", "That would be the obtuse solution. The smaller angle is opposite the shorter side – β is acute.") }],
      hinweise: [zw("SHIFT + sin, Modus DEG.", "SHIFT + sin, mode DEG.")], erklaerung: `β = sin⁻¹(${zt(au.q, 3)}) ≈ ${zt(au.wert, 1)}°` }];
}

function Allgemein() {
  const [au, setAu] = useState(neueAllgAufgabe);
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(neueAllgAufgabe()); setStand(0); };
  const schritte = useMemo(() => allgSchritte(au), [au]);
  const d = au.d;
  const ecken = { A: [0, 0], B: [d.c, 0], Cc: [d.b * cosG(d.al), d.b * sinG(d.al)] };
  let beschr, text, boegen;
  if (au.art === "kos-seite") {
    beschr = { a: "?", b: `b = ${zt(au.b, 1)}`, c: `c = ${au.c}`, al: grad(au.al, 0) }; boegen = ["al"];
    text = zw(`Gegeben: b = ${zt(au.b, 1)} cm, c = ${au.c} cm, α = ${au.al}°. Berechne a.`, `Given: b = ${zt(au.b, 1)} cm, c = ${au.c} cm, α = ${au.al}°. Find a.`);
  } else if (au.art === "kos-winkel") {
    beschr = { a: `a = ${zt(au.a, 1)}`, b: `b = ${zt(au.b, 1)}`, c: `c = ${au.c}`, al: "?" }; boegen = ["al"];
    text = zw(`Gegeben: a = ${zt(au.a, 1)} cm, b = ${zt(au.b, 1)} cm, c = ${au.c} cm. Berechne α.`, `Given: a = ${zt(au.a, 1)} cm, b = ${zt(au.b, 1)} cm, c = ${au.c} cm. Find α.`);
  } else if (au.art === "sin-seite") {
    beschr = { a: `a = ${zt(au.a, 1)}`, b: "?", al: grad(au.al, 0), be: grad(au.be, 0) }; boegen = ["al", "be"];
    text = zw(`Gegeben: a = ${zt(au.a, 1)} cm, α = ${au.al}°, β = ${au.be}°. Berechne b.`, `Given: a = ${zt(au.a, 1)} cm, α = ${au.al}°, β = ${au.be}°. Find b.`);
  } else {
    /* bei vertauschten Rollen trotzdem a gegenüber α beschriften: das Dreieck wird gespiegelt gezeichnet */
    const e = au.getauscht ? { A: [d.c, 0], B: [0, 0], Cc: ecken.Cc } : ecken;
    ecken.A = e.A; ecken.B = e.B;
    beschr = { a: `a = ${zt(au.a, 1)}`, b: `b = ${zt(au.b, 1)}`, al: grad(au.al, 0), be: "?" }; boegen = ["al", "be"];
    text = zw(`Gegeben: a = ${zt(au.a, 1)} cm, b = ${zt(au.b, 1)} cm, α = ${au.al}°. Berechne β.`, `Given: a = ${zt(au.a, 1)} cm, b = ${zt(au.b, 1)} cm, α = ${au.al}°. Find β.`);
  }
  return (
    <div style={{ ...karte, marginTop: 16 }} key={au.id}>
      <p style={kicker}>{au.art.startsWith("kos") ? zw("Kosinussatz", "Law of cosines") : zw("Sinussatz", "Law of sines")}</p>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 8 }}>{text} {zw("Die Skizze ist nicht maßstabsgetreu.", "The sketch is not to scale.")}</p>
      <div style={{ background: C.sand, borderRadius: 14, padding: 8 }}>
        <Dreieck A={ecken.A} B={ecken.B} Cc={ecken.Cc} beschr={beschr} winkelBogen={boegen} hoehe={200} />
      </div>
      <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Richtig – Satz gewählt und sauber berechnet.", "Correct – law chosen and calculated.")} />
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New exercise")}</GrosserKnopf>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><IchHaengeFest kontext={hilfeT(`trig-a-${au.art}`)} /></div>
    </div>
  );
}

function hilfeT(id) {
  return hilfeKontext({
    id, aufgabe: "Trigonometrie Sinus Kosinus Tangens Dreieck Winkel Sinussatz Kosinussatz Hypotenuse Kathete",
    verstehen: [
      zw("Trage alle gegebenen Größen in die Skizze ein und markiere die gesuchte.", "Put all given values into the sketch and mark the wanted one."),
      zw("Gibt es einen rechten Winkel? Dann reichen sin, cos, tan.", "Is there a right angle? Then sin, cos, tan are enough."),
    ],
    ansatz: [
      zw("Rechtwinklig: Benenne die Seiten von deinem Winkel aus (Gegen-, Ankathete, Hypotenuse).", "Right triangle: name the sides from your angle (opposite, adjacent, hypotenuse)."),
      zw("Allgemein: Paar aus Seite und Gegenwinkel bekannt → Sinussatz, sonst Kosinussatz.", "General: a side and its opposite angle known → law of sines, else law of cosines."),
    ],
    regel: [
      "sin α = GK/H · cos α = AK/H · tan α = GK/AK",
      zw("Sinussatz: a/sin α = b/sin β = c/sin γ", "Law of sines: a/sin α = b/sin β = c/sin γ"),
      zw("Kosinussatz: a² = b² + c² − 2bc · cos α", "Law of cosines: a² = b² + c² − 2bc · cos α"),
    ],
    pruefen: [
      zw("Taschenrechner auf DEG? Im Bogenmaß kommen völlig andere Werte heraus.", "Calculator in DEG? Radians give completely different values."),
      zw("Größere Seite liegt dem größeren Winkel gegenüber.", "The longer side lies opposite the larger angle."),
      zw("Winkelsumme 180° prüfen.", "Check the angle sum of 180°."),
    ],
  });
}

const MODI = [["entdecken", zw("Entdecken", "Explore")], ["recht", zw("Recht­winklig", "Right triangle")], ["allg", zw("Sinus- & Kosinus­satz", "Sines & cosines")]];

export function TrigonometrieDreieck() {
  const [modus, setModus] = useState("entdecken");
  return (
    <Seite titel={zw("Trigonometrie am Dreieck", "Trigonometry in triangles")}
      text={zw("Mit sin, cos und tan aus einem Winkel und einer Seite die übrigen Seiten berechnen – und mit Sinus- und Kosinussatz auch ohne rechten Winkel.", "Use sin, cos and tan to find the other sides from one angle and one side – and with the laws of sines and cosines even without a right angle.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Trigonometrie", "Trigonometry")} />
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
        <p style={{ margin: "0 0 6px" }}>{zw("Im rechtwinkligen Dreieck (γ = 90°):", "In a right triangle (γ = 90°):")} <M t="\sin α = \frac{a}{c}" />, <M t="\cos α = \frac{b}{c}" />, <M t="\tan α = \frac{a}{b}" /></p>
        <p style={{ margin: "0 0 6px" }}>{zw("Sinussatz:", "Law of sines:")} <M t="\frac{a}{\sin α} = \frac{b}{\sin β} = \frac{c}{\sin γ}" /></p>
        <p style={{ margin: "0 0 6px" }}>{zw("Kosinussatz:", "Law of cosines:")} <M t="a^2 = b^2 + c^2 − 2bc \cdot \cos α" /></p>
        <p style={{ margin: 0 }}>{zw("Taschenrechner immer im Gradmaß (DEG).", "Always use degree mode (DEG) on the calculator.")}</p>
      </Aufklapp>
      <div style={{ display: modus === "entdecken" ? "block" : "none" }}><Entdecken /></div>
      <div style={{ display: modus === "recht" ? "block" : "none" }}><Rechtwinklig /></div>
      <div style={{ display: modus === "allg" ? "block" : "none" }}><Allgemein /></div>
    </Seite>
  );
}
