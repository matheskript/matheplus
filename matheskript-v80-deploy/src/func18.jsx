/* ============================================================
   Vier-Felder-Tafel (Stochastik)
   Zwei Varianten:
   - Absolute Häufigkeiten: vier Anzahlen, Randsummen und Gesamtzahl
   - Wahrscheinlichkeiten: vier Anteile, die sich zu 100 % ergänzen
   Dazu: Einheitsquadrat (Flächendiagramm), Baumdiagramm und
   umgekehrtes Baumdiagramm, alle bedingten Wahrscheinlichkeiten mit
   Rechenweg (inkl. Satz von Bayes) und die Prüfung auf Unabhängigkeit.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";

const pr = (v, st = 1) => `${(v * 100).toFixed(st).replace(".", ",")} %`;
const dz = (v, st = 3) => v.toFixed(st).replace(".", ",");
const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
const bruch = (z, n) => { if (!n) return "–"; const g = ggT(z, n) || 1; return n / g === 1 ? `${z / g}` : `${z / g}/${n / g}`; };

const VORLAGEN = [
  { id: "test", name: "Medizinischer Test", a: "krank", an: "gesund", b: "Test positiv", bn: "Test negativ",
    abs: [19, 1, 49, 931], text: "1000 Personen werden getestet. Die Krankheit ist selten, der Test ist gut – trotzdem überrascht P_B(A)." },
  { id: "verein", name: "Sportverein", a: "Mädchen", an: "Junge", b: "im Verein", bn: "nicht im Verein",
    abs: [9, 7, 8, 6], text: "Eine Klasse mit 30 Schülerinnen und Schülern: Wer ist im Sportverein?" },
  { id: "unabh", name: "Münze & Würfel", a: "Kopf", an: "Zahl", b: "gerade Zahl", bn: "ungerade Zahl",
    abs: [50, 50, 50, 50], text: "Münze und Würfel beeinflussen sich nicht – die Tafel zeigt Unabhängigkeit." },
  { id: "abi", name: "Abi-Vorbereitung", a: "mit Lernplan", an: "ohne Lernplan", b: "bestanden", bn: "nicht bestanden",
    abs: [54, 6, 72, 18], text: "150 Abiturientinnen und Abiturienten: Hilft ein Lernplan?" },
];

const FARBE = { A: "#004D98", An: "#5B8FD1", B: "#A50044", Bn: "#D4145A", rand: "#C99A00" };

/* ---------- Eingabezelle ---------- */

function Zelle({ wert, setzen, modus, aktiv, markiert, gesperrt, anteil }) {
  const schritt = modus === "abs" ? 1 : 0.01;
  const anzeige = modus === "abs" ? `${wert}` : pr(wert);
  const knopf = { width: 24, height: 24, borderRadius: 7, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see,
    fontSize: 15, fontWeight: 700, cursor: "pointer", padding: 0, lineHeight: 1, fontFamily: "inherit" };
  return (
    <div style={{ borderRadius: 12, padding: "8px 4px 7px", textAlign: "center", transition: "all .15s",
      background: markiert ? "#FFF3C4" : aktiv ? "#FFF9E5" : C.weiss,
      border: `2px solid ${markiert ? C.flaggold : aktiv ? "#F0DC8A" : C.linie}` }}>
      <div style={{ fontSize: "clamp(14px, 4vw, 22px)", whiteSpace: "nowrap", fontWeight: 800, color: C.tinte, fontVariantNumeric: "tabular-nums" }}>{anzeige}</div>
      {modus === "abs" && <div style={{ fontSize: 10.5, color: C.hellgrau, marginTop: 1 }}>≙ {pr(anteil)}</div>}
      {gesperrt ? (
        <div style={{ fontSize: 10.5, color: C.hellgrau, marginTop: 4 }}>ergibt sich</div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 4 }}>
          <button aria-label="verringern" style={knopf} onClick={() => setzen(Math.max(0, Math.round((wert - schritt) * 1e6) / 1e6))}>−</button>
          <button aria-label="erhöhen" style={knopf} onClick={() => setzen(Math.round((wert + schritt) * 1e6) / 1e6)}>+</button>
        </div>
      )}
    </div>
  );
}

function Summe({ wert, modus, anteil, stark, markiert }) {
  return (
    <div style={{ borderRadius: 12, padding: "8px 4px", textAlign: "center",
      background: stark ? C.seeTief : markiert ? "#FFF3C4" : "#FBF3DC",
      border: `2px solid ${markiert ? C.flaggold : stark ? C.seeTief : "#F0DC8A"}` }}>
      <div style={{ fontSize: "clamp(13px, 3.8vw, 20px)", whiteSpace: "nowrap", fontWeight: 800, color: stark ? C.weiss : "#7A5E00", fontVariantNumeric: "tabular-nums" }}>
        {modus === "abs" ? wert : pr(wert)}
      </div>
      {modus === "abs" && <div style={{ fontSize: 10.5, color: stark ? C.goldText : "#A08A45", marginTop: 1 }}>≙ {pr(anteil)}</div>}
    </div>
  );
}

/* ---------- Einheitsquadrat ---------- */

function Einheitsquadrat({ P, namen }) {
  const W = 320, H = 200, l = 6, o = 22;
  const b = W - 2 * l, h = H - o - 26;
  const wA = b * P.A;
  const hAB = h * (P.A ? P.AB / P.A : 0), hAnB = h * (P.An ? P.AnB / P.An : 0);
  const feld = (x, y, w, hh, farbe, t) => w > 0.5 && hh > 0.5 && (
    <g>
      <rect x={x} y={y} width={w} height={hh} fill={farbe} stroke={C.weiss} strokeWidth="2" rx="3" />
      {w > 44 && hh > 20 && <text x={x + w / 2} y={y + hh / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.weiss}>{t}</text>}
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <text x={wA < 90 ? l : l + wA / 2} y={14} textAnchor={wA < 90 ? "start" : "middle"} fontSize="11" fontWeight="700" fill={FARBE.A}>{namen.a} · {pr(P.A, 0)}</text>
      <text x={b - wA < 90 ? W - l : l + wA + (b - wA) / 2} y={14} textAnchor={b - wA < 90 ? "end" : "middle"} fontSize="11" fontWeight="700" fill={FARBE.An}>{namen.an} · {pr(P.An, 0)}</text>
      {feld(l, o, wA, hAB, FARBE.B, pr(P.AB))}
      {feld(l, o + hAB, wA, h - hAB, "#E4A6BE", pr(P.ABn))}
      {feld(l + wA, o, b - wA, hAnB, FARBE.B, pr(P.AnB))}
      {feld(l + wA, o + hAnB, b - wA, h - hAnB, "#E4A6BE", pr(P.AnBn))}
      <g fontSize="10.5" fill={C.grau}>
        <rect x={l} y={H - 16} width="10" height="10" rx="2" fill={FARBE.B} />
        <text x={l + 14} y={H - 7}>{namen.b}</text>
        <rect x={l + 130} y={H - 16} width="10" height="10" rx="2" fill="#E4A6BE" />
        <text x={l + 144} y={H - 7}>{namen.bn}</text>
      </g>
    </svg>
  );
}

/* ---------- Baumdiagramm ---------- */

function Baum({ ersteStufe, P, namen }) {
  // ersteStufe "A": A → B, sonst B → A (umgekehrter Baum)
  const W = 320, H = 210;
  const o = ersteStufe === "A";
  const s1 = o ? [[namen.a, P.A], [namen.an, P.An]] : [[namen.b, P.B], [namen.bn, P.Bn]];
  const pfade = o
    ? [[P.AB, P.A], [P.ABn, P.A], [P.AnB, P.An], [P.AnBn, P.An]]
    : [[P.AB, P.B], [P.AnB, P.B], [P.ABn, P.Bn], [P.AnBn, P.Bn]];
  const s2 = o ? [namen.b, namen.bn, namen.b, namen.bn] : [namen.a, namen.an, namen.a, namen.an];
  const x0 = 14, x1 = 110, x2 = 212, y0 = H / 2;
  const y1 = [58, 152], y2 = [26, 88, 124, 186];
  const kurz = (t) => (t.length > 13 ? `${t.slice(0, 12)}…` : t);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <circle cx={x0} cy={y0} r="4" fill={C.tinte} />
      {s1.map(([name, p], i) => (
        <g key={`a${i}`}>
          <line x1={x0} y1={y0} x2={x1 - 4} y2={y1[i]} stroke={C.hellgrau} strokeWidth="1.5" />
          <text x={(x0 + x1) / 2 - 4} y={(y0 + y1[i]) / 2 + (i ? 14 : -6)} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.see}>{pr(p)}</text>
          <text x={x1} y={y1[i] + 4} fontSize="10.5" fontWeight="700" fill={C.tinte}>{kurz(name)}</text>
        </g>
      ))}
      {pfade.map(([pAB, pErst], j) => {
        const i = j < 2 ? 0 : 1;
        const bedingt = pErst ? pAB / pErst : 0;
        return (
          <g key={`b${j}`}>
            <line x1={x1 + 54} y1={y1[i]} x2={x2 - 4} y2={y2[j]} stroke={C.hellgrau} strokeWidth="1.5" />
            <text x={(x1 + 54 + x2) / 2 - 2} y={(y1[i] + y2[j]) / 2 + (j % 2 ? 12 : -4)} textAnchor="middle" fontSize="9.5" fill={C.gruen} fontWeight="700">{pr(bedingt)}</text>
            <text x={x2} y={y2[j] + 4} fontSize="10" fill={C.tinte}>{kurz(s2[j])}</text>
            <text x={W - 4} y={y2[j] + 4} textAnchor="end" fontSize="10" fontWeight="800" fill={C.see}>{pr(pAB)}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Hauptkomponente ---------- */

export function Vierfeldertafel() {
  const [vorlage, setVorlage] = useState(VORLAGEN[0]);
  const [namen, setNamen] = useState({ a: VORLAGEN[0].a, an: VORLAGEN[0].an, b: VORLAGEN[0].b, bn: VORLAGEN[0].bn });
  const [modus, setModus] = useState("abs");
  const [abs, setAbs] = useState(VORLAGEN[0].abs);                     // [A∩B, A∩B̄, Ā∩B, Ā∩B̄]
  const [rel, setRel] = useState(() => { const s = VORLAGEN[0].abs.reduce((x, y) => x + y, 0); return VORLAGEN[0].abs.map((v) => Math.round((v / s) * 1000) / 1000); });
  const [frage, setFrage] = useState({ ereignis: "A", bedingung: "B" });
  const [baum, setBaum] = useState("A");

  const laden = (v) => {
    setVorlage(v); setNamen({ a: v.a, an: v.an, b: v.b, bn: v.bn }); setAbs(v.abs);
    const s = v.abs.reduce((x, y) => x + y, 0);
    const r = v.abs.map((x) => Math.round((x / s) * 1000) / 1000);
    r[3] = Math.round((1 - r[0] - r[1] - r[2]) * 1000) / 1000;
    setRel(r);
  };
  const wechsel = (m) => {
    if (m === "rel" && modus === "abs") {
      const s = abs.reduce((x, y) => x + y, 0) || 1;
      const r = abs.map((x) => Math.round((x / s) * 1000) / 1000);
      r[3] = Math.max(0, Math.round((1 - r[0] - r[1] - r[2]) * 1000) / 1000);
      setRel(r);
    }
    setModus(m);
  };

  // Relativ: drei Felder frei, das vierte ergänzt zu 100 %
  const setzeRel = (i, v) => {
    const r = rel.slice();
    const andere = [0, 1, 2].filter((k) => k !== i).reduce((s, k) => s + r[k], 0);
    r[i] = Math.max(0, Math.min(1 - andere, v));
    r[3] = Math.max(0, Math.round((1 - r[0] - r[1] - r[2]) * 1e6) / 1e6);
    setRel(r);
  };

  const N = abs.reduce((x, y) => x + y, 0);
  const zellen = modus === "abs" ? abs.map((v) => (N ? v / N : 0)) : rel;
  const P = useMemo(() => {
    const [AB, ABn, AnB, AnBn] = zellen;
    return { AB, ABn, AnB, AnBn, A: AB + ABn, An: AnB + AnBn, B: AB + AnB, Bn: ABn + AnBn };
  }, [zellen]);  // eslint-disable-line react-hooks/exhaustive-deps

  // bedingte Wahrscheinlichkeit der gewählten Frage
  const schnitt = (e1, e2) => {
    const a = [e1, e2].find((e) => e === "A" || e === "An"), b = [e1, e2].find((e) => e === "B" || e === "Bn");
    return { key: (a === "A" ? "A" : "An") + (b === "B" ? "B" : "Bn"), a, b };
  };
  const { ereignis, bedingung } = frage;
  const s = schnitt(ereignis, bedingung);
  const pSchnitt = P[s.key], pBed = P[bedingung];
  const ergebnis = pBed ? pSchnitt / pBed : NaN;
  const zelleIdx = { AB: 0, ABn: 1, AnB: 2, AnBn: 3 }[s.key];
  const name = (e) => ({ A: namen.a, An: namen.an, B: namen.b, Bn: namen.bn }[e]);
  const sym = (e) => ({ A: "A", An: "Ā", B: "B", Bn: "B̄" }[e]);
  const absWert = (key) => ({ AB: abs[0], ABn: abs[1], AnB: abs[2], AnBn: abs[3], A: abs[0] + abs[1], An: abs[2] + abs[3], B: abs[0] + abs[2], Bn: abs[1] + abs[3] }[key]);

  // Unabhängigkeit
  const produkt = P.A * P.B;
  const tol = modus === "abs" ? 1e-12 : 0.0005;
  const unabhaengig = modus === "abs" ? abs[0] * N === (abs[0] + abs[1]) * (abs[0] + abs[2]) : Math.abs(P.AB - produkt) < tol;

  const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
  const kopfZelle = (t, farbe, sub) => (
    <div style={{ textAlign: "center", padding: "4px 2px", minWidth: 0 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: farbe }}>{t}</div>
      <div style={{ fontSize: 10.5, color: C.grau, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>
    </div>
  );
  const chip = (aktiv, farbe = C.see) => ({
    padding: "6px 10px", borderRadius: 999, fontFamily: "inherit", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
    border: `1px solid ${aktiv ? farbe : C.linie}`, background: aktiv ? farbe : C.weiss, color: aktiv ? C.weiss : farbe,
  });
  const inZeile = bedingung === "A" || bedingung === "An";
  const markiertSumme = (k) => k === bedingung;

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, marginTop: -8 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>Vier-Felder-Tafel</p>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Zwei Merkmale, vier Felder
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Stell die vier inneren Felder ein – Randsummen, Baumdiagramme und alle bedingten Wahrscheinlichkeiten
        rechnen sich live mit. Wahlweise mit <b>absoluten Häufigkeiten</b> oder mit <b>Wahrscheinlichkeiten</b>, die sich zu 100 % ergänzen.
      </p>

      {/* Variante */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: C.weiss, borderRadius: 14, padding: 5, boxShadow: "0 2px 12px rgba(15,26,51,0.06)" }}>
        {[["abs", "Absolut (Anzahl)"], ["rel", "Relativ (in %)"]].map(([id, t]) => (
          <button key={id} onClick={() => wechsel(id)}
            style={{ flex: 1, height: 42, borderRadius: 10, border: "none", fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700,
              background: modus === id ? `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` : "transparent",
              color: modus === id ? C.weiss : C.see }}>{t}</button>
        ))}
      </div>

      {/* Beispiele */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 6 }}>
        {VORLAGEN.map((v) => (
          <button key={v.id} onClick={() => laden(v)} style={{ ...chip(vorlage.id === v.id), flexShrink: 0, whiteSpace: "nowrap", fontWeight: 600 }}>{v.name}</button>
        ))}
      </div>
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.55, marginBottom: 12 }}>{vorlage.text}</p>

      {/* Tafel */}
      <div style={karte}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(58px, 0.8fr) 1fr 1fr 1fr", gap: 6, alignItems: "stretch" }}>
          <div />
          {kopfZelle("B", FARBE.B, namen.b)}
          {kopfZelle("B̄", FARBE.Bn, namen.bn)}
          {kopfZelle("Σ", "#7A5E00", "Summe")}

          {kopfZelle("A", FARBE.A, namen.a)}
          <Zelle modus={modus} wert={modus === "abs" ? abs[0] : rel[0]} anteil={P.AB} markiert={zelleIdx === 0}
            setzen={(v) => (modus === "abs" ? setAbs([v, abs[1], abs[2], abs[3]]) : setzeRel(0, v))} />
          <Zelle modus={modus} wert={modus === "abs" ? abs[1] : rel[1]} anteil={P.ABn} markiert={zelleIdx === 1}
            setzen={(v) => (modus === "abs" ? setAbs([abs[0], v, abs[2], abs[3]]) : setzeRel(1, v))} />
          <Summe modus={modus} wert={modus === "abs" ? abs[0] + abs[1] : P.A} anteil={P.A} markiert={markiertSumme("A")} />

          {kopfZelle("Ā", FARBE.An, namen.an)}
          <Zelle modus={modus} wert={modus === "abs" ? abs[2] : rel[2]} anteil={P.AnB} markiert={zelleIdx === 2}
            setzen={(v) => (modus === "abs" ? setAbs([abs[0], abs[1], v, abs[3]]) : setzeRel(2, v))} />
          <Zelle modus={modus} wert={modus === "abs" ? abs[3] : rel[3]} anteil={P.AnBn} markiert={zelleIdx === 3} gesperrt={modus === "rel"}
            setzen={(v) => setAbs([abs[0], abs[1], abs[2], v])} />
          <Summe modus={modus} wert={modus === "abs" ? abs[2] + abs[3] : P.An} anteil={P.An} markiert={markiertSumme("An")} />

          {kopfZelle("Σ", "#7A5E00", "Summe")}
          <Summe modus={modus} wert={modus === "abs" ? abs[0] + abs[2] : P.B} anteil={P.B} markiert={markiertSumme("B")} />
          <Summe modus={modus} wert={modus === "abs" ? abs[1] + abs[3] : P.Bn} anteil={P.Bn} markiert={markiertSumme("Bn")} />
          <Summe modus={modus} wert={modus === "abs" ? N : 1} anteil={1} stark />
        </div>

        {/* Namen anpassen */}
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.see }}>Merkmale umbenennen</summary>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            {[["a", "A"], ["an", "Ā"], ["b", "B"], ["bn", "B̄"]].map(([k, t]) => (
              <label key={k} style={{ fontSize: 12, color: C.grau }}>
                {t}
                <input value={namen[k]} onChange={(e) => setNamen({ ...namen, [k]: e.target.value.slice(0, 24) })}
                  style={{ width: "100%", boxSizing: "border-box", height: 36, borderRadius: 10, border: `1.5px solid ${C.linie}`,
                    padding: "0 10px", fontSize: 14, fontFamily: "inherit", marginTop: 3 }} />
              </label>
            ))}
          </div>
        </details>
        {modus === "rel" && (
          <p style={{ fontSize: 12.5, color: C.hellgrau, marginTop: 10, lineHeight: 1.5 }}>
            Die vier inneren Felder ergänzen sich immer zu 100 % – das Feld Ā ∩ B̄ ergibt sich deshalb aus den anderen drei.
          </p>
        )}
      </div>

      {/* Bedingte Wahrscheinlichkeit */}
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 10 }}>Bedingte Wahrscheinlichkeit</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: C.grau, minWidth: 74 }}>Gesucht:</span>
          {(inZeile ? ["B", "Bn"] : ["A", "An"]).map((e) => (
            <button key={e} onClick={() => setFrage({ ...frage, ereignis: e })} style={chip(ereignis === e, e.startsWith("A") ? FARBE.A : FARBE.B)}>{sym(e)} · {name(e)}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: C.grau, minWidth: 74 }}>unter der Bedingung:</span>
          {["A", "An", "B", "Bn"].map((e) => (
            <button key={e} onClick={() => {
              const neuZeile = e === "A" || e === "An";
              setFrage({ bedingung: e, ereignis: neuZeile ? (ereignis.startsWith("B") ? ereignis : "B") : (ereignis.startsWith("A") ? ereignis : "A") });
            }} style={chip(bedingung === e, e.startsWith("A") ? FARBE.A : FARBE.B)}>{sym(e)}</button>
          ))}
        </div>
        <div style={{ background: C.sand, borderRadius: 12, padding: "12px 14px" }}>
          <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.5 }}>
            Wie wahrscheinlich ist <b style={{ color: C.tinte }}>{name(ereignis)}</b>, wenn man schon weiß: <b style={{ color: C.tinte }}>{name(bedingung)}</b>?
          </p>
          <p style={{ fontSize: 15.5, fontWeight: 700, color: C.tinte, marginTop: 8, overflowX: "auto", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
            P<sub>{sym(bedingung)}</sub>({sym(ereignis)}) = P({sym(ereignis)} ∩ {sym(bedingung)}) / P({sym(bedingung)})
          </p>
          <p style={{ fontSize: 15, color: C.grau, marginTop: 4, overflowX: "auto", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
            {modus === "abs"
              ? `= ${absWert(s.key)} / ${absWert(bedingung)} = ${bruch(absWert(s.key), absWert(bedingung))}`
              : `= ${dz(pSchnitt)} / ${dz(pBed)}`}
          </p>
          <p style={{ fontSize: 26, fontWeight: 800, color: C.see, marginTop: 4 }}>{Number.isFinite(ergebnis) ? `≈ ${pr(ergebnis)}` : "nicht definiert (Bedingung hat Wahrscheinlichkeit 0)"}</p>
          <p style={{ fontSize: 12.5, color: C.hellgrau, marginTop: 6, lineHeight: 1.5 }}>
            In der Tafel markiert: das Schnittfeld (Zähler) und die Randsumme der Bedingung (Nenner). Man rechnet nur noch
            in der {inZeile ? "Zeile" : "Spalte"} der Bedingung – sie ist die neue Gesamtheit.
          </p>
        </div>
      </div>

      {/* Einheitsquadrat */}
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 8 }}>Einheitsquadrat</p>
        <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.55, marginBottom: 10 }}>
          Die Breite zeigt P(A) und P(Ā), die Höhe darin den Anteil von B. Jede Fläche ist eine Schnittwahrscheinlichkeit.
        </p>
        <Einheitsquadrat P={P} namen={namen} />
      </div>

      {/* Baumdiagramm */}
      <div style={{ ...karte, marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.see }}>Baumdiagramm</p>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setBaum("A")} style={chip(baum === "A")}>erst A</button>
            <button onClick={() => setBaum("B")} style={chip(baum === "B")}>umgekehrt: erst B</button>
          </div>
        </div>
        <Baum ersteStufe={baum} P={P} namen={namen} />
        <p style={{ fontSize: 12.5, color: C.hellgrau, marginTop: 6, lineHeight: 1.5 }}>
          Blau: Wahrscheinlichkeiten der ersten Stufe und Pfadwahrscheinlichkeiten (= innere Felder). Rot: bedingte Wahrscheinlichkeiten
          auf der zweiten Stufe. Der umgekehrte Baum ist der Kern des Satzes von Bayes.
        </p>
      </div>

      {/* Unabhängigkeit */}
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 8 }}>Stochastische Unabhängigkeit</p>
        <p style={{ fontSize: 14.5, color: C.tinte, fontVariantNumeric: "tabular-nums", lineHeight: 1.7 }}>
          P(A) · P(B) = {dz(P.A)} · {dz(P.B)} = <b>{dz(produkt, 4)}</b><br />
          P(A ∩ B) = <b>{dz(P.AB, 4)}</b>
        </p>
        <div style={{ marginTop: 10, borderRadius: 12, padding: "10px 14px",
          background: unabhaengig ? "#EEF8F2" : "#FBEFEA", color: unabhaengig ? C.smaragd : C.signal, fontWeight: 700, fontSize: 14.5 }}>
          {unabhaengig
            ? "Gleich → A und B sind stochastisch unabhängig. Das Wissen über A ändert nichts an der Wahrscheinlichkeit von B."
            : "Verschieden → A und B sind abhängig. P_A(B) und P(B) unterscheiden sich."}
        </div>
        {!unabhaengig && P.A > 0 && (
          <p style={{ fontSize: 13, color: C.grau, marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
            Vergleich: P<sub>A</sub>(B) ≈ {pr(P.AB / P.A)} gegenüber P(B) ≈ {pr(P.B)}.
          </p>
        )}
      </div>

      {/* Merkkarte */}
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 }}>Das Wichtigste zur Vier-Felder-Tafel</p>
        {[
          ["Innere Felder", "sind Schnittwahrscheinlichkeiten wie P(A ∩ B) – die Pfadwahrscheinlichkeiten im Baumdiagramm."],
          ["Randsummen", "sind P(A), P(Ā), P(B), P(B̄). Zeilen und Spalten addieren sich, alles zusammen ergibt 100 % bzw. die Gesamtzahl."],
          ["Bedingte Wahrscheinlichkeit", "P_A(B) = P(A ∩ B) / P(A): Man rechnet nur in der Zeile (bzw. Spalte) der Bedingung."],
          ["Unabhängigkeit", "A und B sind unabhängig genau dann, wenn P(A ∩ B) = P(A) · P(B) – gleichwertig: P_A(B) = P(B)."],
          ["Umgekehrter Baum", "Aus P(A) und P_A(B) lässt sich über die Tafel P_B(A) bestimmen (Satz von Bayes)."],
        ].map(([t, x]) => (
          <p key={t} style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 6 }}><b style={{ color: C.tinte }}>{t}:</b> {x}</p>
        ))}
      </div>
    </div>
  );
}
