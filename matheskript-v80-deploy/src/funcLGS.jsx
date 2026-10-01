import React, { useState, useRef, useEffect } from "react";
import { C } from "./base1.jsx";
import { merken } from "./func5.jsx";
import { DrehKnoepfe, ebenenPolygon, kamera } from "./func16.jsx";

/* ======================================================================
   LINEARE GLEICHUNGSSYSTEME (3 Unbekannte)
   Der Schüler bildet aus dem aktuellen System I, II, III ein neues System
   aus drei Gleichungen — jede ist eine Kopie („III“) oder eine
   Linearkombination („II − 3·III“, „(2·I + II) : 3“). Die App rechnet,
   schreibt das neue System ins Heft und notiert die Kombination am Rand.
   Musterlösungen: Gauß-Verfahren (Treppenform) und direkter Weg.
   ====================================================================== */

const VARS = ["x", "y", "z"];
const ROEM = ["I", "II", "III", "IV", "V", "VI"];

/* ---------- Ganzzahl-Hilfen ---------- */
const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const kgV = (a, b) => Math.abs(a * b) / ggT(a, b);
const zz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const det3 = (m) =>
  m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
  m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
  m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
const zeilenGgT = (r) => r.reduce((g, v) => ggT(g, v), 0);
const minus = (s) => String(s).replace(/-/g, "−");
const zahlK = (v) => (v < 0 ? `(${minus(v)})` : String(v));   // in Klammern, wenn negativ

/* ---------- Aufgaben erzeugen ---------- */
export const LGS_STUFEN = [
  { id: 1, name: "Einfach" },
  { id: 2, name: "Mittel" },
  { id: 3, name: "Schwer" },
];

export function lgsErzeugen(stufe) {
  const kMax = stufe === 1 ? 3 : stufe === 2 ? 5 : 8;
  const lMax = stufe === 1 ? 5 : 9;
  for (let versuch = 0; versuch < 2000; versuch++) {
    const loesung = [0, 1, 2].map(() => { let v = 0; while (v === 0 && Math.random() < 0.85) v = zz(-lMax, lMax); return v; });
    const A = [0, 1, 2].map(() => [0, 1, 2].map(() => zz(-kMax, kMax)));
    if (stufe === 1) A[0][0] = 1;
    const nullen = A.flat().filter((v) => v === 0).length;
    if (nullen > (stufe === 1 ? 1 : stufe === 2 ? 1 : 0)) continue;
    if (A.some((r) => r.filter((v) => v !== 0).length < 2)) continue;
    if (Math.abs(det3(A)) < (stufe === 3 ? 4 : 1)) continue;
    if (A.some((r) => zeilenGgT(r) > 1)) continue;
    const rows = A.map((r) => [...r, r[0] * loesung[0] + r[1] * loesung[1] + r[2] * loesung[2]]);
    if (rows.some((r) => Math.abs(r[3]) > (stufe === 3 ? 99 : 40))) continue;
    if (stufe < 3 && A.flat().filter((v) => Math.abs(v) === 1).length < 3) continue;
    return { rows, loesung };
  }
  return { rows: [[1, 1, 1, 6], [1, -1, 2, 5], [2, 1, -1, 1]], loesung: [1, 2, 3] };
}

/* ---------- Kombinations-Ausdruck lesen: „2·I − (II + III) : 3“ ---------- */
export class KombiFehler extends Error {}

function kombiLesen(text) {
  const s = String(text).replace(/[−–]/g, "-").replace(/[·*×]/g, "*").replace(/\s+/g, "").toUpperCase();
  if (!s) throw new KombiFehler("Die Zeile ist noch leer.");
  let i = 0;
  const zahl = () => { let j = i; while (j < s.length && /[0-9]/.test(s[j])) j++; if (j === i) return null; const v = parseInt(s.slice(i, j), 10); i = j; return v; };
  const roem = () => {
    for (const [t, k] of [["III", 2], ["II", 1], ["I", 0]]) if (s.startsWith(t, i)) { i += t.length; return k; }
    return null;
  };
  const vec = (k, f = 1) => [0, 1, 2].map((j) => (j === k ? f : 0));
  const plus = (a, b, f = 1) => a.map((v, j) => v + f * b[j]);
  const faktor = () => {
    if (s[i] === "(") { i++; const v = summe(); if (s[i] !== ")") throw new KombiFehler("Eine Klammer ist nicht geschlossen."); i++; return v; }
    const k = roem(); if (k !== null) return vec(k);
    throw new KombiFehler("Hier fehlt eine Gleichung (I, II oder III).");
  };
  const term = () => {
    const z = zahl();
    if (z !== null) {
      if (s[i] === "*") i++;
      if (i >= s.length || !(s[i] === "(" || s[i] === "I")) throw new KombiFehler("Nach einer Zahl muss eine Gleichung kommen, z. B. 3·II.");
      return faktor().map((v) => v * z);
    }
    return faktor();
  };
  const summe = () => {
    let vz = 1;
    if (s[i] === "+" || s[i] === "-") { vz = s[i] === "-" ? -1 : 1; i++; }
    let v = term().map((x) => x * vz);
    while (s[i] === "+" || s[i] === "-") {
      const f = s[i] === "-" ? -1 : 1; i++;
      v = plus(v, term(), f);
    }
    return v;
  };
  const v = summe();
  let teiler = 1;
  if (s[i] === ":" || s[i] === "/") {
    i++; const t = zahl();
    if (!t) throw new KombiFehler("Nach „:“ gehört eine Zahl ungleich 0.");
    teiler = t;
  }
  if (i < s.length) throw new KombiFehler(`„${minus(s.slice(i))}“ verstehe ich nicht.`);
  if (v.every((x) => x === 0)) throw new KombiFehler("Diese Kombination ergibt 0 = 0 — da geht alle Information verloren.");
  return { vec: v, teiler };
}

/* Wendet eine Kombination auf das aktuelle System an */
export function kombiAnwenden(rows, text) {
  const { vec, teiler } = kombiLesen(text);
  const r = [0, 1, 2, 3].map((j) => vec.reduce((s, c, k) => s + c * rows[k][j], 0));
  if (r.some((v) => v % teiler !== 0)) throw new KombiFehler(`Nicht alle Zahlen sind durch ${teiler} teilbar.`);
  const erg = r.map((v) => v / teiler);
  if (erg.slice(0, 3).every((v) => v === 0)) throw new KombiFehler(erg[3] === 0 ? "Hier bleibt nur 0 = 0 übrig — diese Gleichung trägt keine Information mehr." : "Widerspruch 0 = " + minus(erg[3]) + " — da ist etwas schiefgelaufen.");
  return { row: erg, vec };
}

/* ---------- Darstellung ---------- */
const Var = ({ v }) => <i style={{ fontStyle: "italic", fontWeight: 600 }}>{v}</i>;

function termTeil(c, v, erster) {
  if (c === 0) return null;
  const b = Math.abs(c);
  const k = b === 1 ? "" : String(b);
  if (erster) return <>{c < 0 ? "−" : ""}{k}<Var v={v} /></>;
  return <><span style={{ margin: "0 0.28em 0 0" }}>{c < 0 ? "−" : "+"}</span>{k}<Var v={v} /></>;
}

/* Gleichung als Fließtext, z. B. „2x − y + 3z = 7“ */
export function GlText({ row }) {
  let erster = true;
  const teile = [];
  row.slice(0, 3).forEach((c, j) => {
    if (c === 0) return;
    teile.push(<React.Fragment key={j}>{!erster && " "}{termTeil(c, VARS[j], erster)}</React.Fragment>);
    erster = false;
  });
  return <span style={{ whiteSpace: "nowrap" }}>{teile}{" = "}{minus(row[3])}</span>;
}

/* Ein System als Heftblock mit Spalten für x, y, z, =, rechte Seite und Randnotiz */
function SystemBlock({ rows, labels = ["I", "II", "III"], notizen, hervor, neu }) {
  return (
    <div className={neu ? "lgs-neu" : ""} style={{ display: "grid", gridTemplateColumns: "auto auto auto auto auto auto auto", columnGap: 7, rowGap: 6, alignItems: "center", width: "max-content" }}>
      {rows.map((r, i) => {
        const ersterIdx = r.slice(0, 3).findIndex((c) => c !== 0);
        return (
          <React.Fragment key={i}>
            <span style={{ fontSize: "0.68em", fontWeight: 700, color: hervor === i ? C.see : C.hellgrau, minWidth: 20, letterSpacing: "0.02em" }}>{labels[i]}</span>
            {[0, 1, 2].map((j) => (
              <span key={j} style={{ textAlign: "right", whiteSpace: "nowrap", minWidth: "2.2em" }}>{termTeil(r[j], VARS[j], j === ersterIdx)}</span>
            ))}
            <span style={{ color: C.grau }}>=</span>
            <span style={{ textAlign: "right", minWidth: "1.6em", whiteSpace: "nowrap" }}>{minus(r[3])}</span>
            <span style={{ paddingLeft: notizen && notizen[i] ? 10 : 0, borderLeft: notizen && notizen[i] ? `1.5px solid ${C.hellgrau}` : "none",
              color: C.gruen, fontWeight: 600, fontSize: "0.74em", whiteSpace: "nowrap" }}>
              {notizen && notizen[i] ? minus(notizen[i]) : ""}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* Ist das System gelöst (jede Zeile genau eine Variable, alle verschieden)? */
function geloest(rows) {
  const vars = rows.map((r) => { const nz = [0, 1, 2].filter((j) => r[j] !== 0); return nz.length === 1 ? nz[0] : -1; });
  return vars.every((v) => v >= 0) && new Set(vars).size === 3 ? vars : null;
}
function treppe(rows) {
  const erste = rows.map((r) => [0, 1, 2].findIndex((j) => r[j] !== 0)).sort();
  return erste[0] === 0 && erste[1] === 1 && erste[2] === 2 && !geloest(rows);
}

/* ---------- Musterlösungen ---------- */

/* Eliminiert Variable j aus Zeile a mit Hilfe von Zeile p; liefert Zeile und Notiz */
function eliminiere(a, p, j, nameA, nameP) {
  const ca = a[j], cp = p[j];
  const l = kgV(ca, cp);
  let ma = l / ca, mp = l / cp;      // ma·a − mp·p
  if (ma < 0) { ma = -ma; mp = -mp; }
  const row = a.map((v, k) => ma * v - mp * p[k]);
  const g = zeilenGgT(row);
  const teil = (m, n, erster) => {
    if (m === 0) return "";
    const b = Math.abs(m);
    const s = `${b === 1 ? "" : `${b}·`}${n}`;
    return erster ? (m < 0 ? `−${s}` : s) : (m < 0 ? ` − ${s}` : ` + ${s}`);
  };
  let notiz = teil(ma, nameA, true) + teil(-mp, nameP, false);
  const gg = g > 1 ? g : 1;
  const erg = row.map((v) => v / gg);
  if (gg > 1) notiz = `(${notiz}) : ${gg}`;
  return { row: erg, notiz };
}

function aufloesen(row, j, bekannt) {
  // row: [a,b,c,d], j: gesuchte Variable, bekannt: {idx: wert}
  const rest = [0, 1, 2].filter((k) => k !== j && row[k] !== 0);
  const zeilen = [];
  let rechts = row[3];
  if (rest.length) {
    // Einsetzen
    const einsetz = (
      <>
        {termTeil(row[j], VARS[j], true)}
        {rest.map((k) => (
          <React.Fragment key={k}> {row[k] < 0 ? "−" : "+"} {Math.abs(row[k]) === 1 ? "" : `${Math.abs(row[k])}·`}{zahlK(bekannt[k])}</React.Fragment>
        ))}
        {" = "}{minus(row[3])}
      </>
    );
    zeilen.push(einsetz);
    const summe = rest.reduce((s, k) => s + row[k] * bekannt[k], 0);
    rechts = row[3] - summe;
    if (summe !== 0) zeilen.push(<>{termTeil(row[j], VARS[j], true)} {summe < 0 ? "−" : "+"} {Math.abs(summe)}{" = "}{minus(row[3])}</>);
    if (row[j] !== 1) zeilen.push(<>{termTeil(row[j], VARS[j], true)}{" = "}{minus(rechts)}</>);
  }
  if (!rest.length && row[j] !== 1) zeilen.push(<>{termTeil(row[j], VARS[j], true)}{" = "}{minus(row[3])}</>);
  const wert = rechts / row[j];
  zeilen.push(<b style={{ color: C.see }}><Var v={VARS[j]} /> = {minus(wert)}</b>);
  return { wert, zeilen };
}

export function gaussWeg(start) {
  const schritte = [];
  let R = start.map((r) => [...r]);
  // Schritt 1: x eliminieren
  let p = R.findIndex((r) => Math.abs(r[0]) === 1);
  if (p < 0) p = R.reduce((best, r, i) => (r[0] !== 0 && (best < 0 || Math.abs(r[0]) < Math.abs(R[best][0])) ? i : best), -1);
  const andere = [0, 1, 2].filter((i) => i !== p);
  const neu1 = [R[p]], not1 = [ROEM[p]];
  andere.forEach((i) => {
    if (R[i][0] === 0) { neu1.push(R[i]); not1.push(ROEM[i]); }
    else { const e = eliminiere(R[i], R[p], 0, ROEM[i], ROEM[p]); neu1.push(e.row); not1.push(e.notiz); }
  });
  schritte.push({ titel: `x aus II und III eliminieren${p !== 0 ? ` (Gleichung ${ROEM[p]} nach oben)` : ""}`, rows: neu1, notizen: not1 });
  R = neu1;
  // Schritt 2: y aus III eliminieren
  let q = 1;
  if (R[1][1] === 0) q = 2;
  const r3 = q === 1 ? 2 : 1;
  const neu2 = [R[0], R[q]], not2 = ["I", ROEM[q]];
  if (R[r3][1] === 0) { neu2.push(R[r3]); not2.push(ROEM[r3]); }
  else { const e = eliminiere(R[r3], R[q], 1, ROEM[r3], ROEM[q]); neu2.push(e.row); not2.push(e.notiz); }
  schritte.push({ titel: "y aus III eliminieren — die Treppenform steht", rows: neu2, notizen: not2 });
  R = neu2;
  // Rückwärts einsetzen
  const bekannt = {};
  const rueck = [];
  const z = aufloesen(R[2], 2, bekannt); bekannt[2] = z.wert; rueck.push({ titel: "III nach z auflösen", zeilen: z.zeilen });
  const y = aufloesen(R[1], 1, bekannt); bekannt[1] = y.wert; rueck.push({ titel: "z in II einsetzen", zeilen: y.zeilen });
  const x = aufloesen(R[0], 0, bekannt); bekannt[0] = x.wert; rueck.push({ titel: "y und z in I einsetzen", zeilen: x.zeilen });
  return { schritte, rueck, loesung: [bekannt[0], bekannt[1], bekannt[2]] };
}

export function direkterWeg(start) {
  const R = start.map((r) => [...r]);
  // 1. Variable wählen, die sich am leichtesten eliminieren lässt
  const kosten = (j) => {
    const nz = [0, 1, 2].filter((i) => R[i][j] !== 0);
    if (nz.length < 2) return 0;
    const p = nz.reduce((b, i) => (Math.abs(R[i][j]) < Math.abs(R[b][j]) ? i : b), nz[0]);
    return nz.filter((i) => i !== p).reduce((s, i) => s + kgV(R[i][j], R[p][j]) / Math.abs(R[p][j]) + kgV(R[i][j], R[p][j]) / Math.abs(R[i][j]), 0);
  };
  const v1 = [0, 1, 2].reduce((b, j) => (kosten(j) < kosten(b) ? j : b), 0);
  const mitV = [0, 1, 2].filter((i) => R[i][v1] !== 0);
  const ohneV = [0, 1, 2].filter((i) => R[i][v1] === 0);
  const zwei = [], notiz = [];
  ohneV.forEach((i) => { zwei.push(R[i]); notiz.push(ROEM[i]); });
  const p = mitV.reduce((b, i) => (Math.abs(R[i][v1]) < Math.abs(R[b][v1]) ? i : b), mitV[0]);
  mitV.filter((i) => i !== p).forEach((i) => {
    if (zwei.length >= 2) return;
    const e = eliminiere(R[i], R[p], v1, ROEM[i], ROEM[p]);
    zwei.push(e.row); notiz.push(e.notiz);
  });
  const block1 = { titel: `Zwei Gleichungspaare kombinieren: ${VARS[v1]} eliminieren`, rows: zwei.slice(0, 2), labels: ["IV", "V"], notizen: notiz.slice(0, 2) };
  const [IV, V] = zwei;
  // 2. In IV und V eine weitere Variable eliminieren
  const rest = [0, 1, 2].filter((j) => j !== v1);
  let VI, notizVI, v3;
  const einzel = [IV, V].findIndex((r) => rest.filter((j) => r[j] !== 0).length === 1);
  if (einzel >= 0) {
    VI = [IV, V][einzel]; notizVI = einzel === 0 ? "IV" : "V";
    v3 = rest.find((j) => VI[j] !== 0);
  } else {
    const kost = (j) => kgV(IV[j], V[j]) / Math.abs(IV[j]) + kgV(IV[j], V[j]) / Math.abs(V[j]);
    const v2 = kost(rest[0]) <= kost(rest[1]) ? rest[0] : rest[1];
    const e = eliminiere(IV, V, v2, "IV", "V");
    VI = e.row; notizVI = e.notiz;
    v3 = rest.find((j) => j !== v2);
  }
  const block2 = { titel: `Aus IV und V eine Gleichung mit nur einer Unbekannten`, rows: [VI], labels: ["VI"], notizen: [notizVI] };
  // 3. Auflösen und einsetzen
  const bekannt = {};
  const rueck = [];
  const a = aufloesen(VI, v3, bekannt); bekannt[v3] = a.wert; rueck.push({ titel: `VI nach ${VARS[v3]} auflösen`, zeilen: a.zeilen });
  const v2b = rest.find((j) => j !== v3);
  const quelle = [IV, V].findIndex((r) => r[v2b] !== 0);
  const b = aufloesen([IV, V][quelle], v2b, bekannt); bekannt[v2b] = b.wert;
  rueck.push({ titel: `${VARS[v3]} in ${quelle === 0 ? "IV" : "V"} einsetzen`, zeilen: b.zeilen });
  const c = aufloesen(R[p], v1, bekannt); bekannt[v1] = c.wert;
  rueck.push({ titel: `${VARS[v3]} und ${VARS[v2b]} in ${ROEM[p]} einsetzen`, zeilen: c.zeilen });
  return { bloecke: [block1, block2], rueck, loesung: [bekannt[0], bekannt[1], bekannt[2]] };
}

/* ---------- UI-Bausteine ---------- */
const LGS_CSS = `
.lgs-taste{transition:transform .08s ease, background .12s ease}
.lgs-taste:active{transform:scale(.94)}
@media (hover:hover){.lgs-taste:hover{filter:brightness(0.97)}}
.lgs-neu{animation:lgsNeu .38s cubic-bezier(.2,.7,.3,1) both}
@keyframes lgsNeu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.lgs-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.lgs-scroll::-webkit-scrollbar{height:4px}.lgs-scroll::-webkit-scrollbar-thumb{background:${C.linie};border-radius:4px}
`;

const Taste = ({ label, wert, ton, onClick, breit, aria, tippe }) => (
  <button type="button" className="lgs-taste" aria-label={aria || (typeof label === "string" ? label : wert)}
    onClick={onClick || (() => tippe(wert))}
    style={{ gridColumn: breit ? "span 2" : "auto", height: 48, borderRadius: 14, fontFamily: "inherit", cursor: "pointer", padding: 0,
      fontSize: ton === "aktion" ? 15 : ton === "gl" ? 16 : 19, fontWeight: ton === "aktion" || ton === "gl" ? 700 : 500,
      background: ton === "aktion" ? C.gruen : ton === "gl" ? `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` : ton === "op" ? "#F1F4FA" : C.weiss,
      color: ton === "aktion" ? C.weiss : ton === "gl" ? C.flaggold : C.tinte,
      border: `1px solid ${ton === "aktion" ? C.gruen : ton === "gl" ? C.seeTief : C.linie}`,
      boxShadow: ton === "aktion" ? "0 4px 14px rgba(165,0,68,0.25)" : "0 1px 0 rgba(15,26,51,0.04)",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
    {label}
  </button>
);

const Pille = ({ aktiv, onClick, children }) => (
  <button type="button" onClick={onClick}
    style={{ border: "none", borderRadius: 999, padding: "7px 14px", fontFamily: "inherit", cursor: "pointer", fontSize: 13,
      fontWeight: aktiv ? 600 : 400, background: aktiv ? C.weiss : "transparent",
      color: aktiv ? C.see : C.grau, boxShadow: aktiv ? "0 1px 6px rgba(15,26,51,0.12)" : "none" }}>
    {children}
  </button>
);

function Rueckwaerts({ rueck }) {
  return (
    <div style={{ marginTop: 12 }}>
      {rueck.map((r, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.hellgrau, letterSpacing: "0.04em", marginBottom: 3 }}>{r.titel}</p>
          <div className="lgs-scroll" style={{ fontSize: 16, lineHeight: 1.9, color: C.tinte }}>
            {r.zeilen.map((z, k) => (
              <div key={k} style={{ whiteSpace: "nowrap" }}>{k > 0 && <span style={{ color: C.hellgrau, marginRight: 6 }}>⇒</span>}{z}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Geometrische Deutung: Lösung = Schnittpunkt dreier Ebenen ----------
   Jede Zeile des Ausgangssystems ist eine Ebenengleichung E₁, E₂, E₃.
   Die Lösung (x | y | z) ist der gemeinsame Punkt S der drei Ebenen. */

const EBENEN_FARBEN = [C.see, C.gruen, "#C99A00"];
/* Lösung per Cramer-Regel (det ≠ 0 ist durch den Generator garantiert) */
const cramer = (rows) => {
  const A = rows.map((r) => r.slice(0, 3)), D = det3(A);
  return [0, 1, 2].map((k) => Math.round((det3(A.map((r, i) => r.map((v, j) => (j === k ? rows[i][3] : v)))) / D) * 1000) / 1000);
};
const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/* E mit tiefgestelltem Index als HTML */
export function EName({ i, farbe }) {
  return (
    <span style={{ color: farbe, fontWeight: 700, whiteSpace: "nowrap" }}>
      E<sub style={{ fontSize: "0.68em", position: "relative", top: "0.32em", verticalAlign: "baseline", lineHeight: 0, marginLeft: "0.04em" }}>{i}</sub>
    </span>
  );
}

/* Gerade p + t·r auf den Quader M ± L zuschneiden */
function strahlImQuader(p, r, M, L) {
  let t0 = -Infinity, t1 = Infinity;
  for (let k = 0; k < 3; k++) {
    if (Math.abs(r[k]) < 1e-12) { if (Math.abs(p[k] - M[k]) > L) return null; continue; }
    const a = (M[k] - L - p[k]) / r[k], b = (M[k] + L - p[k]) / r[k];
    t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
  }
  if (t0 > t1) return null;
  return [p.map((v, k) => v + t0 * r[k]), p.map((v, k) => v + t1 * r[k])];
}

function DreiEbenenRaum({ rows, S, zeigeS, phi, theta, setPhi, setTheta }) {
  const W = 360, H = 330;
  const M = S.map((v) => v / 2);
  const L = Math.max(5, Math.ceil(Math.max(...S.map(Math.abs)) / 2 + 3));
  const sk = (Math.min(W, H) / 2 - 16) / (L * 1.55);
  const cam = kamera(phi, theta);
  const P = (p) => { const q = cam.proj([p[0] - M[0], p[1] - M[1], p[2] - M[2]]); return [W / 2 + sk * q.u, H / 2 - sk * q.v]; };
  const tiefe = (p) => cam.proj([p[0] - M[0], p[1] - M[1], p[2] - M[2]]).t;
  const pfad = (pts) => pts.map((p, k) => `${k ? "L" : "M"}${P(p)[0].toFixed(1)},${P(p)[1].toFixed(1)}`).join(" ") + " Z";

  const ebenen = rows.map((r, i) => {
    const n = r.slice(0, 3);
    const dVersch = r[3] - (n[0] * M[0] + n[1] * M[1] + n[2] * M[2]);
    const poly = ebenenPolygon(n, dVersch, L).map((q) => q.map((v, k) => v + M[k]));
    const t = poly.length ? poly.reduce((s, p) => s + tiefe(p), 0) / poly.length : 0;
    return { i, poly, t, farbe: EBENEN_FARBEN[i] };
  }).sort((a, b) => a.t - b.t);

  const geraden = [[0, 1], [0, 2], [1, 2]].map(([a, b]) => strahlImQuader(S, kreuz(rows[a].slice(0, 3), rows[b].slice(0, 3)), M, L)).filter(Boolean);
  const achsen = [0, 1, 2].map((k) => { const r = [0, 0, 0]; r[k] = 1; return { k, seg: strahlImQuader([0, 0, 0], r, M, L) }; });

  const ziehen = useRef(null);
  const start = (e) => { e.preventDefault(); ziehen.current = { x: e.clientX, y: e.clientY, phi, theta }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const bewege = (e) => {
    if (!ziehen.current) return;
    const dx = e.clientX - ziehen.current.x, dy = e.clientY - ziehen.current.y;
    setPhi(ziehen.current.phi - dx * 0.01);
    setTheta(Math.max(-1.35, Math.min(1.35, ziehen.current.theta + dy * 0.01)));
  };
  const ende = () => { ziehen.current = null; };

  const [sx, sy] = P(S);
  const linie = (a, b, props) => { const [x1, y1] = P(a), [x2, y2] = P(b); return <line x1={x1} y1={y1} x2={x2} y2={y2} {...props} />; };
  const fuss = [S[0], S[1], 0];
  const sText = `S(${S.map(minus).join(" | ")})`;
  const rechts = sx < W - 150;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", touchAction: "none", cursor: "grab", background: C.weiss, borderRadius: 14, userSelect: "none", WebkitUserSelect: "none" }}
      onPointerDown={start} onPointerMove={bewege} onPointerUp={ende} onPointerLeave={ende}
      role="img" aria-label={zeigeS ? `Drei Ebenen E1, E2 und E3, die sich im Punkt ${sText} schneiden` : "Drei Ebenen E1, E2 und E3, die sich in einem Punkt S schneiden"}>
      <defs>
        <marker id="lgsAchsPfeil" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={C.ablGrau} />
        </marker>
      </defs>
      {/* Achsen */}
      {achsen.map(({ k, seg }) => {
        if (!seg) return null;
        const [a, b] = seg;
        const [lx, ly] = P(b.map((v, j) => (j === k ? v + L * 0.1 : v)));
        return (
          <g key={k}>
            {linie(a, b, { stroke: C.ablGrau, strokeWidth: 1.4, markerEnd: "url(#lgsAchsPfeil)" })}
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize="13" fontWeight="700" fontStyle="italic" fill={C.grau}>{VARS[k]}</text>
          </g>
        );
      })}
      {(() => { const [x, y] = P([0, 0, 0]); return <circle cx={x} cy={y} r="2.4" fill={C.grau} />; })()}
      {/* Ebenen, hintere zuerst */}
      {ebenen.map((e) => e.poly.length >= 3 && (
        <path key={e.i} d={pfad(e.poly)} fill={e.farbe} fillOpacity="0.17" stroke={e.farbe} strokeOpacity="0.8" strokeWidth="1.4" strokeLinejoin="round" />
      ))}
      {/* Schnittgeraden je zweier Ebenen — alle drei laufen durch S */}
      {geraden.map((g, i) => <g key={i}>{linie(g[0], g[1], { stroke: C.tinte, strokeWidth: 1.6, strokeDasharray: "5 4", opacity: 0.55 })}</g>)}
      {/* Koordinaten-Hilfslinien und Punkt */}
      {zeigeS && (
        <g stroke={C.grau} strokeWidth="1.1" strokeDasharray="2 3" opacity="0.8">
          {linie(S, fuss, {})}
          {linie(fuss, [S[0], 0, 0], {})}
          {linie(fuss, [0, S[1], 0], {})}
        </g>
      )}
      <circle cx={sx} cy={sy} r={zeigeS ? 9 : 7} fill={C.flaggold} opacity="0.3" />
      <circle cx={sx} cy={sy} r={zeigeS ? 5.5 : 4.5} fill={zeigeS ? C.flaggold : C.weiss} stroke={C.seeTief} strokeWidth="2" />
      {zeigeS ? (
        <text x={rechts ? sx + 12 : sx - 12} y={sy - 10} textAnchor={rechts ? "start" : "end"} fontSize="14" fontWeight="700" fill={C.seeTief}
          stroke={C.weiss} strokeWidth="4" paintOrder="stroke" strokeLinejoin="round">{sText}</text>
      ) : (
        <text x={rechts ? sx + 12 : sx - 12} y={sy - 10} textAnchor={rechts ? "start" : "end"} fontSize="14" fontWeight="700" fill={C.seeTief}
          stroke={C.weiss} strokeWidth="4" paintOrder="stroke" strokeLinejoin="round">S(? | ? | ?)</text>
      )}
      {/* Legende mit tiefgestellten Indizes */}
      <g fontSize="13" fontWeight="700">
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${12 + i * 46} 12)`}>
            <rect width="11" height="11" rx="2.5" fill={EBENEN_FARBEN[i]} opacity="0.55" />
            <text x="16" y="10.5" fill={EBENEN_FARBEN[i]}>E<tspan fontSize="9" dy="3.5">{i + 1}</tspan></text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function EbenenDeutung({ rows, loesung, aufgedeckt }) {
  const [phi, setPhi] = useState(0.62);
  const [theta, setTheta] = useState(0.42);
  const [zeigen, setZeigen] = useState(false);
  const zeigeS = aufgedeckt || zeigen;
  const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ height: 1, background: C.linie, marginBottom: 26 }} />
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>Geometrisch gedeutet</p>
      <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 10 }}>
        Die Lösung ist der Schnittpunkt dreier Ebenen
      </h3>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 16 }}>
        Jede Gleichung des Ausgangssystems ist eine Ebenengleichung. Ein Punkt (<i>x</i> | <i>y</i> | <i>z</i>) erfüllt
        eine Gleichung genau dann, wenn er auf dieser Ebene liegt. Die Lösung des Systems erfüllt alle drei
        Gleichungen — sie ist also der Punkt <b style={{ color: C.tinte, fontWeight: 600 }}>S</b>, den alle drei Ebenen gemeinsam haben.
      </p>

      <div style={{ ...karte, padding: "16px 20px", marginBottom: 14 }}>
        <div className="lgs-scroll">
          <div style={{ display: "grid", gridTemplateColumns: "auto auto", columnGap: 12, rowGap: 8, alignItems: "baseline", fontSize: "clamp(15px, 4.4vw, 18px)", color: C.tinte, fontWeight: 500, width: "max-content" }}>
            {rows.map((r, i) => (
              <React.Fragment key={i}>
                <span style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                  <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 3, background: EBENEN_FARBEN[i], opacity: 0.6, alignSelf: "center" }} />
                  <EName i={i + 1} farbe={EBENEN_FARBEN[i]} /><span style={{ color: C.grau, marginLeft: -3 }}>:</span>
                </span>
                <GlText row={r} />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...karte, padding: 12, position: "relative", userSelect: "none", WebkitUserSelect: "none" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "4px 6px 8px" }}>Zieh am Bild, um die Ebenen im Raum zu drehen</p>
        <div style={{ position: "relative" }}>
          <DreiEbenenRaum rows={rows} S={loesung} zeigeS={zeigeS} phi={phi} theta={theta} setPhi={setPhi} setTheta={setTheta} />
          <DrehKnoepfe setPhi={setPhi} setTheta={setTheta} zuruecksetzen={() => { setPhi(0.62); setTheta(0.42); }} />
        </div>
        <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, margin: "10px 6px 2px" }}>
          Gestrichelt: Je zwei Ebenen schneiden sich in einer Geraden. Alle drei Schnittgeraden laufen durch denselben Punkt — das ist S.
        </p>
      </div>

      <div className="lgs-neu" style={{ ...karte, padding: "14px 18px", marginTop: 14, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        {zeigeS ? (
          <>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.seeTief }}>
              <EName i={1} farbe={EBENEN_FARBEN[0]} /> ∩ <EName i={2} farbe={EBENEN_FARBEN[1]} /> ∩ <EName i={3} farbe={EBENEN_FARBEN[2]} /> = {"{ "}S{" }"}
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.tinte }}>S({loesung.map(minus).join(" | ")})</span>
            <span style={{ fontSize: 13, color: C.grau, fontWeight: 300, flexBasis: "100%", lineHeight: 1.6 }}>
              Die Koordinaten von S sind genau die Lösung des Gleichungssystems:{" "}{VARS.map((v, k) => <span key={v} style={{ whiteSpace: "nowrap" }}><i>{v}</i> = {minus(loesung[k])}{k < 2 ? ", " : "."}</span>)}
            </span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.6, flex: "1 1 220px" }}>
              Löse das System — dann stehen hier die Koordinaten von S.
            </span>
            <button type="button" onClick={() => setZeigen(true)}
              style={{ background: "none", border: `1px solid ${C.linie}`, color: C.see, borderRadius: 999, padding: "8px 14px", fontSize: 13.5, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>
              Schnittpunkt zeigen
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Hauptkomponente ---------- */
export function LGSLoeser() {
  const [stufe, setStufe] = useState(1);
  const [aufgabe, setAufgabe] = useState(() => lgsErzeugen(1));
  const [bloecke, setBloecke] = useState(() => [{ rows: aufgabe.rows, notizen: null }]);
  const [felder, setFelder] = useState(["", "", ""]);
  const [aktiv, setAktiv] = useState(0);
  const [frisch, setFrisch] = useState([false, false, false]);
  const [meldung, setMeldung] = useState(null);
  const [muster, setMuster] = useState(null);   // "gauss" | "direkt" | null
  const startZeit = useRef(Date.now());
  const gemerkt = useRef(false);
  const heftRef = useRef(null);

  const aktuell = bloecke[bloecke.length - 1].rows;
  const fertig = geloest(aktuell);
  const schritte = bloecke.length - 1;

  const neu = (s = stufe) => {
    const a = lgsErzeugen(s);
    setAufgabe(a); setBloecke([{ rows: a.rows, notizen: null }]);
    setFelder(["", "", ""]); setFrisch([false, false, false]); setAktiv(0); setMeldung(null); setMuster(null);
    startZeit.current = Date.now(); gemerkt.current = false;
  };
  const stufeWaehlen = (s) => { setStufe(s); neu(s); };

  useEffect(() => {
    if (fertig && !gemerkt.current) {
      gemerkt.current = true;
      try { merken({ bereich: "lgs", gruppe: "lgs3", stufe, richtig: true, sekunden: Math.max(1, Math.round((Date.now() - startZeit.current) / 1000)), fehlerart: null }); }
      catch (e) { /* optional */ }
    }
  }, [fertig, stufe]);

  useEffect(() => { if (heftRef.current) heftRef.current.scrollLeft = 0; }, [bloecke.length]);

  /* Vorschau jeder Zeile */
  const vorschau = felder.map((f) => {
    try { return { ok: true, ...kombiAnwenden(aktuell, f) }; }
    catch (e) { return { ok: false, fehler: e instanceof KombiFehler ? e.message : "Nicht lesbar." }; }
  });

  const tippe = (w) => {
    setMeldung(null);
    const ersetzen = frisch[aktiv] && /^[0-9I(]/.test(w);
    setFrisch((alt) => alt.map((v, i) => (i === aktiv ? false : v)));
    setFelder((alt) => alt.map((f0, i) => {
      if (i !== aktiv) return f0;
      const f = ersetzen ? "" : f0;
      // Gleichungsnamen mit Malpunkt an eine Zahl hängen
      if (["I", "II", "III"].includes(w) && /[0-9]$/.test(f)) return `${f}·${w}`;
      if (["I", "II", "III"].includes(w) && /I$/.test(f)) return `${f} + ${w}`;
      if (["+", "−"].includes(w)) return `${f} ${w} `;
      if (w === ":") return f.trim() && !/^\(.*\)$/.test(f.trim()) && /[+−-]/.test(f.trim().slice(1)) ? `(${f.trim()}) : ` : `${f} : `;
      return f + w;
    }));
  };
  const zurueck = () => setFrisch((a) => a.map((v, i) => (i === aktiv ? false : v))) || setFelder((alt) => alt.map((f, i) => (i === aktiv ? f.replace(/\s+$/, "").slice(0, -1).replace(/\s+$/, "").replace(/·$/, "") : f)));
  const leeren = () => setFrisch((a) => a.map((v, i) => (i === aktiv ? false : v))) || setFelder((alt) => alt.map((f, i) => (i === aktiv ? "" : f)));

  const uebernehmen = () => {
    if (vorschau.some((v) => !v.ok)) {
      const i = vorschau.findIndex((v) => !v.ok);
      setAktiv(i);
      setMeldung({ art: "fehler", text: `${ROEM[i]} neu: ${vorschau[i].fehler}${felder[i].trim() ? "" : " Soll sie unverändert bleiben, tippe einfach " + ROEM[i] + "."}` });
      return;
    }
    const M = vorschau.map((v) => v.vec);
    if (det3(M) === 0) {
      setMeldung({ art: "fehler", text: "So geht Information verloren: Die drei neuen Gleichungen hängen voneinander ab. Jede alte Gleichung muss sich aus den neuen zurückgewinnen lassen — nimm z. B. eine der alten Gleichungen unverändert mit." });
      return;
    }
    const rows = vorschau.map((v) => v.row);
    const notizen = felder.map((f) => f.trim().replace(/\s+/g, " "));
    if (rows.every((r, i) => r.every((v, j) => v === aktuell[i][j]))) {
      setMeldung({ art: "info", text: "Das ist dasselbe System wie vorher. Ersetze mindestens eine Gleichung durch eine Kombination, z. B. II − I." });
      return;
    }
    setBloecke((b) => [...b, { rows, notizen }]);
    setFelder(["", "", ""]); setFrisch([false, false, false]); setAktiv(0);
    const g = geloest(rows);
    if (g) setMeldung(null);
    else if (treppe(rows)) setMeldung({ art: "info", text: "Treppenform erreicht! Jetzt von unten nach oben weiter eliminieren — oder die letzte Zeile auflösen und einsetzen." });
    else setMeldung(null);
  };

  const rueckgaengig = () => {
    if (bloecke.length < 2) return;
    setBloecke((b) => b.slice(0, -1)); setMeldung(null); gemerkt.current = false;
  };

  const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
  const gauss = muster === "gauss" ? gaussWeg(bloecke[0].rows) : null;
  const direkt = muster === "direkt" ? direkterWeg(bloecke[0].rows) : null;
  const L = fertig ? [0, 1, 2].map((v) => { const i = fertig.indexOf(v); return aktuell[i][3] / aktuell[i][v]; }) : null;

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <style>{LGS_CSS}</style>

      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        <span className="titel-lang">Drei Gleichungen, drei Unbekannte</span><span className="titel-kurz">Knack das System!</span>
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 20 }}>
        <span className="titel-lang">
          Bilde aus I, II und III ein neues System: Übernimm eine Gleichung unverändert oder kombiniere sie,
          z. B. <b style={{ fontWeight: 600, color: C.tinte }}>II − I</b> oder <b style={{ fontWeight: 600, color: C.tinte }}>2·I + 3·III</b>.
          Die App rechnet, du entscheidest — bis x, y und z einzeln dastehen.
        </span>
        <span className="titel-kurz">
          Kombiniere die Gleichungen geschickt, z. B. <b style={{ fontWeight: 600, color: C.tinte }}>II − I</b>, bis x, y und z einzeln dastehen. Du entscheidest, die App rechnet.
        </span>
      </p>

      <div className="flex items-center flex-wrap" style={{ gap: 10, marginBottom: 16 }}>
        <div className="flex" role="group" aria-label="Schwierigkeit" style={{ background: "#EEF2F8", borderRadius: 999, padding: 3 }}>
          {LGS_STUFEN.map((s) => <Pille key={s.id} aktiv={stufe === s.id} onClick={() => stufeWaehlen(s.id)}>{s.name}</Pille>)}
        </div>
        <button type="button" onClick={() => neu()}
          style={{ marginLeft: "auto", background: "none", border: "none", color: C.see, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Neues System
        </button>
      </div>

      {/* Das Heft */}
      <div style={{ ...karte, padding: "18px 0 18px" }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: C.hellgrau, padding: "0 20px", marginBottom: 12 }}>
          {schritte === 0 ? "AUSGANGSSYSTEM" : `${schritte} ${schritte === 1 ? "SCHRITT" : "SCHRITTE"}`}
        </p>
        <div ref={heftRef} className="lgs-scroll" style={{ padding: "0 20px 4px" }}>
          <div style={{ fontSize: "clamp(14.5px, 4.2vw, 19px)", color: C.tinte, fontWeight: 500 }}>
            {bloecke.map((b, i) => (
              <div key={i} style={{ paddingTop: i ? 12 : 0, marginTop: i ? 12 : 0, borderTop: i ? `1px dashed ${C.linie}` : "none", opacity: i === bloecke.length - 1 ? 1 : 0.62 }}>
                <SystemBlock rows={b.rows} notizen={b.notizen} neu={i > 0 && i === bloecke.length - 1} />
              </div>
            ))}
          </div>
        </div>

        {fertig && (
          <div className="lgs-neu" style={{ margin: "18px 20px 0", padding: "16px 18px", borderRadius: 14, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: C.flaggold, marginBottom: 6 }}>GELÖST · LÖSUNGSMENGE</p>
            <p style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.5 }}>𝕃 = {"{ ("}{L.map((v, i) => <React.Fragment key={i}>{i > 0 && " | "}{minus(v)}</React.Fragment>)}{") }"}</p>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.15)", fontSize: 13, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.8 }}>
              <b style={{ color: C.weiss, fontWeight: 600 }}>Probe</b> im Ausgangssystem:
              {bloecke[0].rows.map((r, i) => {
                const links = r[0] * L[0] + r[1] * L[1] + r[2] * L[2];
                return <span key={i} style={{ display: "block" }}>{ROEM[i]}: {minus(links)} = {minus(r[3])} {links === r[3] ? "✓" : "✗"}</span>;
              })}
            </div>
            <div className="flex flex-wrap items-center" style={{ gap: 10, marginTop: 14 }}>
              <button type="button" onClick={() => neu()}
                style={{ background: C.gruen, color: C.weiss, border: "none", borderRadius: 999, padding: "10px 20px", fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                Nächstes System
              </button>
              <span style={{ fontSize: 12.5, color: "#C9D6EE", fontWeight: 300 }}>{schritte} {schritte === 1 ? "Schritt" : "Schritte"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Neues System bilden */}
      {!fertig && (
        <div style={{ ...karte, padding: 14, marginTop: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: C.hellgrau, margin: "2px 4px 10px" }}>NEUES SYSTEM BILDEN</p>
          {felder.map((f, i) => {
            const v = vorschau[i];
            const an = aktiv === i;
            return (
              <button key={i} type="button" onClick={() => setAktiv(i)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer",
                  background: an ? C.sand : C.weiss, border: `1.5px solid ${an ? (v.ok || !f ? C.see : C.signal) : C.linie}`, borderRadius: 14,
                  padding: "8px 12px", marginBottom: 8, minHeight: 58 }}>
                <span style={{ flexShrink: 0, width: 50, fontSize: 15, fontWeight: 500, color: C.hellgrau, whiteSpace: "nowrap" }}>
                  {ROEM[i]}<sub style={{ fontSize: "0.68em", position: "relative", top: "0.3em", verticalAlign: "baseline", lineHeight: 0, marginLeft: "0.08em" }}>neu</sub>
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 19, fontWeight: 700, color: C.gruen, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {f ? minus(f) : null}
                    {an && <span className="pulsieren" style={{ color: C.see, fontWeight: 300 }}>|</span>}
                  </span>
                  <span style={{ display: "block", fontSize: 13.5, color: v.ok ? C.grau : C.signal, fontWeight: v.ok ? 400 : 300, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {v.ok ? <GlText row={v.row} /> : f ? v.fehler : ""}
                  </span>
                </span>
              </button>
            );
          })}

          {meldung && (
            <p role="status" style={{ fontSize: 13.5, lineHeight: 1.55, margin: "4px 4px 8px", color: meldung.art === "fehler" ? C.signal : C.see, fontWeight: meldung.art === "fehler" ? 500 : 400 }}>
              {meldung.text}
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 7, marginTop: 6 }}>
            <Taste tippe={tippe} ton="gl" wert="I" label="I" aria="Gleichung eins" />
            <Taste tippe={tippe} ton="gl" wert="II" label="II" aria="Gleichung zwei" />
            <Taste tippe={tippe} ton="gl" wert="III" label="III" aria="Gleichung drei" />
            <Taste tippe={tippe} ton="op" wert="+" label="+" aria="plus" />
            <Taste tippe={tippe} ton="op" wert="−" label="−" aria="minus" />
            <Taste tippe={tippe} ton="op" wert="·" label="·" aria="mal" />

            <Taste tippe={tippe} wert="7" label="7" /><Taste tippe={tippe} wert="8" label="8" /><Taste tippe={tippe} wert="9" label="9" />
            <Taste tippe={tippe} ton="op" wert="(" label="(" /><Taste tippe={tippe} ton="op" wert=")" label=")" />
            <Taste tippe={tippe} ton="op" wert=":" label=":" aria="geteilt durch" />

            <Taste tippe={tippe} wert="4" label="4" /><Taste tippe={tippe} wert="5" label="5" /><Taste tippe={tippe} wert="6" label="6" />
            <Taste ton="op" label="C" aria="Zeile leeren" onClick={leeren} />
            <Taste ton="op" breit aria="Zeichen löschen" onClick={zurueck}
              label={<svg width="24" height="18" viewBox="0 0 24 18" aria-hidden="true"><path d="M8 1h13a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8L1 9z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" /><path d="M11 6l6 6M17 6l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>} />

            <Taste tippe={tippe} wert="1" label="1" /><Taste tippe={tippe} wert="2" label="2" /><Taste tippe={tippe} wert="3" label="3" />
            <Taste tippe={tippe} wert="0" label="0" />
            <Taste ton="aktion" breit label="Neues System" onClick={uebernehmen} />
          </div>

          <div className="flex items-center flex-wrap" style={{ gap: 10, marginTop: 12 }}>
            <button type="button" onClick={rueckgaengig} disabled={schritte === 0}
              style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: `1px solid ${C.linie}`, color: schritte === 0 ? C.hellgrau : C.grau,
                borderRadius: 999, padding: "9px 16px", fontSize: 13.5, fontFamily: "inherit", cursor: schritte === 0 ? "default" : "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3L1.5 6.5 5 10M2 6.5h8a4.5 4.5 0 0 1 0 9H7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Rückgängig
            </button>
            <span style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300 }}>Tippe eine Zeile an und baue sie mit den Tasten.</span>
          </div>
        </div>
      )}

      {/* Musterlösungen */}
      <div style={{ marginTop: 22 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>Musterlösung</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
          {[["gauss", "Gauß-Verfahren", "Treppenform, dann rückwärts einsetzen"], ["direkt", "Direkter Weg", "Paare kombinieren, eliminieren, einsetzen"]].map(([id, n, k]) => (
            <button key={id} type="button" className="lgs-taste" onClick={() => setMuster(muster === id ? null : id)}
              style={{ textAlign: "left", cursor: "pointer", fontFamily: "inherit", padding: "12px 14px", borderRadius: 14,
                background: muster === id ? `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` : C.weiss,
                border: muster === id ? "none" : `1px solid ${C.linie}`, boxShadow: muster === id ? "0 6px 20px rgba(0,77,152,0.25)" : "0 1px 0 rgba(15,26,51,0.04)" }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: muster === id ? C.weiss : C.tinte }}>{n}</span>
              <span style={{ display: "block", fontSize: 12, fontWeight: 300, color: muster === id ? "#C9D6EE" : C.grau, marginTop: 2, lineHeight: 1.4 }}>{k}</span>
            </button>
          ))}
        </div>

        {gauss && (
          <div className="lgs-neu" style={{ ...karte, padding: "16px 20px 14px", marginTop: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: C.hellgrau, marginBottom: 10 }}>GAUSS-VERFAHREN</p>
            <div className="lgs-scroll" style={{ fontSize: "clamp(14px, 4vw, 18px)", color: C.tinte, fontWeight: 500 }}>
              <SystemBlock rows={bloecke[0].rows} />
              {gauss.schritte.map((s, i) => (
                <div key={i} style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${C.linie}` }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.see, marginBottom: 6, fontFamily: "inherit" }}>{i + 1}. {s.titel}</p>
                  <SystemBlock rows={s.rows} notizen={s.notizen} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${C.linie}` }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.see, marginBottom: 2 }}>3. Rückwärts einsetzen</p>
              <Rueckwaerts rueck={gauss.rueck} />
              <p style={{ fontSize: 16, fontWeight: 700, color: C.see }}>𝕃 = {"{ ("}{gauss.loesung.map(minus).join(" | ")}{") }"}</p>
            </div>
          </div>
        )}

        {direkt && (
          <div className="lgs-neu" style={{ ...karte, padding: "16px 20px 14px", marginTop: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: C.hellgrau, marginBottom: 10 }}>DIREKTER WEG</p>
            <div className="lgs-scroll" style={{ fontSize: "clamp(14px, 4vw, 18px)", color: C.tinte, fontWeight: 500 }}>
              <SystemBlock rows={bloecke[0].rows} />
              {direkt.bloecke.map((b, i) => (
                <div key={i} style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${C.linie}` }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.see, marginBottom: 6 }}>{i + 1}. {b.titel}</p>
                  <SystemBlock rows={b.rows} labels={b.labels} notizen={b.notizen} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${C.linie}` }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.see, marginBottom: 2 }}>3. Auflösen und einsetzen</p>
              <Rueckwaerts rueck={direkt.rueck} />
              <p style={{ fontSize: 16, fontWeight: 700, color: C.see }}>𝕃 = {"{ ("}{direkt.loesung.map(minus).join(" | ")}{") }"}</p>
            </div>
          </div>
        )}
      </div>

      <EbenenDeutung key={bloecke[0].rows.flat().join(",")} rows={bloecke[0].rows} loesung={cramer(bloecke[0].rows)}
        aufgedeckt={!!fertig || !!muster} />

      <details style={{ marginTop: 22 }}>
        <summary style={{ fontSize: 13.5, color: C.see, cursor: "pointer", fontWeight: 500 }}>Was kann ich eingeben?</summary>
        <div style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.8, marginTop: 10 }}>
          <p><b style={{ color: C.tinte, fontWeight: 600 }}>Kopie</b>: einfach I, II oder III — so kannst du auch die Reihenfolge ändern.</p>
          <p><b style={{ color: C.tinte, fontWeight: 600 }}>Kombination</b>: z. B. II − I, 2·I + III, 3·II − 2·III.</p>
          <p><b style={{ color: C.tinte, fontWeight: 600 }}>Kürzen</b>: mit „:“ teilst du die ganze Gleichung, z. B. (II − I) : 2 oder III : 3.</p>
          <p>Damit nichts verloren geht, müssen die drei neuen Gleichungen zusammen wieder das ganze System enthalten — sonst lehnt die App ab.</p>
        </div>
      </details>
    </div>
  );
}

/* Grafik für die Startseiten-Kachel: drei Gleichungen mit I, II, III und Klammer */
export function LGSLogoKlein() {
  const W = 230, H = 190;
  const T = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700 };
  const z = [
    { y: 58, n: "I", t: "x + y + z = 6" },
    { y: 98, n: "II", t: "2x − y + z = 3" },
    { y: 138, n: "III", t: "x + 2y − z = 2" },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
      <path d="M 44 36 Q 34 36 34 48 L 34 86 Q 34 98 26 98 Q 34 98 34 110 L 34 148 Q 34 160 44 160" stroke={C.flaggold} strokeWidth="2.5" fill="none" />
      {z.map((r, i) => (
        <g key={i} {...T}>
          <text x="52" y={r.y} fill={C.flaggold} fontSize="13">{r.n}</text>
          <text x="80" y={r.y} fill={C.weiss} fontSize="15.5">{r.t}</text>
        </g>
      ))}
      <g transform="translate(52 168)">
        <rect width="126" height="20" rx="6" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" />
        <text x="63" y="14.5" textAnchor="middle" fill={C.flaggold} fontSize="12.5" {...T}>II − 2·I</text>
      </g>
    </svg>
  );
}
