/* ======================================================================
   ui3.jsx – gemeinsame Bausteine der Etappe-3-Fachkarten
   (Erwartungswert, Kombinatorik, Hypothesentests, Wachstum, Funktionsscharen):
   · Schritt / SchrittFolge – geführte Aufgabe in Einzelschritten
     (Auswahl oder Zahl, gestufte Hinweise, typische Denkfehler gezielt benennen,
     Lösung eines Schritts nur auf ausdrücklichen Wunsch)
   · ModusLeiste, Abschnitt – Bedienung wie in der Optimierungswerkstatt
   · FunktionsBild – Graphen beliebiger Funktionen (gleiche Einheiten möglich)
   · Balken – Histogramm mit markierten Bereichen
   · Verlauf – laufender Mittelwert einer Simulation gegen den exakten Wert
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React, { useId, useState } from "react";
import { C } from "./base1.jsx";
import { Auswahl, GrosserKnopf, KleinerLink, Rueck, ZahlFeld, hinweis, zw } from "./ui2.jsx";
import { qLies, qNum } from "./rechnen2.js";

/* ---------- Zahlen anzeigen ---------- */
export const minusZ = (s) => String(s).replace(/-/g, "−");
/* gerundet, deutsches Komma, überflüssige Nullen weg */
export const zt = (v, st = 4) => {
  if (!isFinite(v)) return "–";
  const r = Math.round(v * 10 ** st) / 10 ** st;
  return minusZ(String(Object.is(r, -0) ? 0 : r).replace(".", ","));
};
/* feste Nachkommastellen (für Wahrscheinlichkeiten) */
export const zf = (v, st = 4) => minusZ(v.toFixed(st).replace(".", ","));
export const pr = (v, st = 2) => `${zt(v * 100, st)} %`;
export const euro = (v) => `${minusZ((Math.round(v * 100) / 100).toFixed(2).replace(".", ","))} €`;
export const bruchText = (z, n) => (n === 1 ? minusZ(z) : `${minusZ(z)}/${n}`);

/* Eingabe lesen: Bruch, Dezimalzahl mit Komma oder Punkt */
export function liesZahl(s) {
  const t = String(s).replace(/−/g, "-").replace(/\s/g, "");
  if (!t) return null;
  const q = qLies(t);
  if (q !== null) return qNum(q);
  const v = Number(t.replace(",", "."));
  return isFinite(v) ? v : null;
}

const loesungBox = { background: C.sand, borderRadius: 14, padding: "10px 14px", marginTop: 10, fontSize: 14, lineHeight: 1.6, color: C.tinte };

/* ---------- Ein Schritt ----------
   st: { id, titel, frage, typ: "wahl" | "zahl",
         optionen, richtig            (wahl)
         wert, toleranz, text, einheit, wertText   (zahl)
         fehler: [{ wahl | wert, text }]  – typische Denkfehler mit gezielter Rückmeldung
         hinweise: [..], erklaerung }                                               */
export function Schritt({ st, nr, aktiv, fertig, onFertig }) {
  const [eing, setEing] = useState("");
  const [versuche, setVersuche] = useState(0);
  const [rueck, setRueck] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [ok, setOk] = useState(false);
  const tol = st.toleranz ?? 1e-9;
  const pruefen = () => {
    let r, v = null;
    if (st.typ === "wahl") r = eing === st.richtig;
    else {
      v = liesZahl(eing);
      if (v === null) { setRueck({ art: "warn", text: zw("Bitte eine Zahl eingeben (Bruch wie 3/8 oder Dezimalzahl wie 0,375).", "Please enter a number (fraction like 3/8 or decimal like 0.375).") }); return; }
      r = Math.abs(v - st.wert) <= tol + 1e-12;
    }
    if (r) { setOk(true); setRueck(null); onFertig(); return; }
    const n = versuche + 1; setVersuche(n);
    const typisch = (st.fehler || []).find((f) => (st.typ === "wahl" ? f.wahl === eing : Math.abs(v - f.wert) <= (f.toleranz ?? tol) + 1e-12));
    const h = st.hinweise?.[Math.min(n - 1, (st.hinweise?.length || 1) - 1)];
    if (typisch) { setRueck({ art: "schlecht", text: `${zw("Denkfehler:", "Mistake:")} ${typisch.text}` }); return; }
    setRueck({ art: "schlecht", text: `${zw("Noch nicht.", "Not yet.")} ${h ? `${zw("Hinweis", "Hint")} ${Math.min(n, st.hinweise.length)}/${st.hinweise.length}: ${h}` : ""}` });
  };
  const zusammen = fertig || ok;
  const kopf = (
    <p style={{ fontSize: 13, fontWeight: 700, color: zusammen ? "#0F7A4D" : C.grau, margin: "14px 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ display: "inline-flex", width: 20, height: 20, borderRadius: 999, background: zusammen ? "#E6F6EF" : C.himmel, color: zusammen ? "#0F7A4D" : C.see, alignItems: "center", justifyContent: "center", fontSize: 11.5, flexShrink: 0 }}>{zusammen ? "✓" : nr}</span>
      {st.titel}
    </p>
  );
  if (!aktiv && !zusammen) return null;
  if (zusammen) {
    const wahlText = st.typ === "wahl" ? st.optionen.find((o) => o[0] === st.richtig)?.[1] : null;
    return (
      <div>
        {kopf}
        <p style={{ fontSize: 14, color: C.tinte, margin: "0 0 0 26px", lineHeight: 1.55 }}>
          {st.typ === "zahl" ? <>{st.text} <b>{st.wertText ?? zt(st.wert)}</b> {st.einheit}</> : <b>{wahlText}</b>}
        </p>
        {st.erklaerung && <p style={{ fontSize: 12.5, color: C.grau, margin: "2px 0 0 26px", lineHeight: 1.55 }}>{st.erklaerung}</p>}
      </div>
    );
  }
  return (
    <div>
      {kopf}
      <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, margin: "0 0 8px" }}>{st.frage}</p>
      {st.typ === "wahl" && <Auswahl optionen={st.optionen} wert={eing} setWert={(v) => { setEing(v); setRueck(null); }} label={st.titel} />}
      {st.typ === "zahl" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {st.text && <span style={{ fontSize: 16, fontWeight: 700, color: C.tinte }}>{st.text}</span>}
          <ZahlFeld wert={eing} setWert={(v) => { setEing(v); setRueck(null); }} label={st.titel} onEnter={pruefen} breite={st.breite || 104} />
          {st.einheit && <span style={{ fontSize: 15, color: C.grau }}>{st.einheit}</span>}
        </div>
      )}
      {st.typ === "zahl" && st.rundung && <p style={{ fontSize: 12.5, color: C.hellgrau, margin: "6px 0 0" }}>{st.rundung}</p>}
      <GrosserKnopf onClick={pruefen} disabled={!eing.trim()}>{zw("Schritt prüfen", "Check step")}</GrosserKnopf>
      {rueck && <Rueck art={rueck.art}>{rueck.text}</Rueck>}
      {!zeigen
        ? <KleinerLink onClick={() => setZeigen(true)}>{zw("Lösung dieses Schritts zeigen", "Show the solution of this step")}</KleinerLink>
        : (
          <div style={loesungBox}>
            <p style={{ margin: 0 }}>{st.erklaerung}</p>
            <div style={{ marginTop: 8 }}><GrosserKnopf ghost onClick={() => { setOk(true); onFertig(); }}>{zw("Weiter zum nächsten Schritt", "Continue to the next step")}</GrosserKnopf></div>
          </div>
        )}
    </div>
  );
}

/* Folge von Schritten; meldet den Stand nach außen (z. B. für Schaubilder) */
export function SchrittFolge({ schritte, stand, setStand, fertigText }) {
  const fertig = stand >= schritte.length;
  return (
    <>
      {schritte.map((st, i) => (
        <Schritt key={st.id} st={st} nr={i + 1} aktiv={i === stand} fertig={i < stand} onFertig={() => setStand((n) => Math.max(n, i + 1))} />
      ))}
      {fertig && fertigText && <Rueck art="gut">{fertigText}</Rueck>}
    </>
  );
}

/* ---------- Seitenrahmen und Modusleiste ---------- */
export function Seite({ titel, text, children }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 24 }}>
      <h2 style={{ fontSize: "clamp(20px, 6.2vw, 24px)", fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 8 }}>{titel}</h2>
      <p style={{ ...hinweis, marginBottom: 14 }}>{text}</p>
      {children}
    </div>
  );
}

export function ModusLeiste({ modi, modus, setModus, label }) {
  return (
    <div role="tablist" aria-label={label} style={{ display: "grid", gridTemplateColumns: `repeat(${modi.length}, minmax(0, 1fr))`, gap: 8 }}>
      {modi.map(([id, text]) => {
        const an = modus === id;
        return (
          <button key={id} type="button" role="tab" aria-selected={an} onClick={() => setModus(id)}
            style={{ minHeight: 52, padding: "8px 6px", borderRadius: 14, fontFamily: "inherit", cursor: "pointer", fontSize: 13.5, fontWeight: 700, lineHeight: 1.25, textAlign: "center", hyphens: "manual", overflowWrap: "break-word",
              border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see }}>{text}</button>
        );
      })}
    </div>
  );
}

/* Einklappbarer Erklärkasten („Kurz erklärt“, „Beispiel“) */
export function Aufklapp({ titel, children, start = false }) {
  const [auf, setAuf] = useState(start);
  return (
    <div style={{ border: `1px solid ${C.linie}`, borderRadius: 14, marginTop: 10, background: C.weiss }}>
      <button type="button" aria-expanded={auf} onClick={() => setAuf(!auf)}
        style={{ width: "100%", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 14px", background: "none",
          border: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: C.see, cursor: "pointer", textAlign: "left" }}>
        <span>{titel}</span><span aria-hidden="true" style={{ transform: auf ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▾</span>
      </button>
      {auf && <div style={{ padding: "0 14px 12px", fontSize: 14, lineHeight: 1.65, color: C.tinte }}>{children}</div>}
    </div>
  );
}

/* Kleine Marke „Simulation“ bzw. „exakt“ – beides soll sichtbar unterschieden werden */
export function Marke({ art }) {
  const sim = art === "sim";
  return (
    <span style={{ display: "inline-block", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 6,
      background: sim ? "#FFF4D6" : C.himmel, color: sim ? "#7A5A00" : C.see, verticalAlign: "middle" }}>{sim ? zw("Simulation", "Simulation") : zw("exakt", "exact")}</span>
  );
}

/* ---------- Achsenteilung ---------- */
export const teilung = (lo, hi, ziel = 6) => {
  const rng = hi - lo || 1;
  const roh = rng / ziel, mag = 10 ** Math.floor(Math.log10(roh));
  const s = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((x) => x >= roh) || mag * 10;
  const t = [];
  for (let v = Math.ceil(lo / s - 1e-9) * s; v <= hi + 1e-9; v += s) t.push(Math.round(v / s) * s);
  return t.map((v) => Math.round(v * 1e9) / 1e9);
};

/* ---------- Funktionsgraphen ----------
   kurven: [{ f, farbe, name, gestrichelt, breite, a, b }]  (a, b: Teilbereich)
   punkte: [{ x, y, farbe, name, hohl }]   senkrechte/waagerechte: [{ x | y, farbe, text }]
   gleicheEinheit: y-Bereich so wählen, dass eine Einheit auf beiden Achsen gleich lang ist */
export function FunktionsBild({ kurven = [], punkte = [], senkrechte = [], waagerechte = [], x0 = -5, x1 = 5, y0, y1, hoehe = 230, gleicheEinheit = false, einheitX = "", einheitY = "" }) {
  const W = 360, L = 34, R = 10, T = 12, B = 22;
  let H = hoehe, lo = y0, hi = y1;
  const pw = W - L - R;
  if (lo === undefined || hi === undefined) {
    let a = Infinity, b = -Infinity;
    kurven.forEach((k) => { for (let i = 0; i <= 120; i++) { const x = x0 + ((x1 - x0) * i) / 120; const y = k.f(x); if (isFinite(y) && Math.abs(y) < 1e6) { a = Math.min(a, y); b = Math.max(b, y); } } });
    if (!isFinite(a)) { a = -1; b = 1; }
    a = Math.min(a, 0); b = Math.max(b, 0);
    const pad = (b - a || 2) * 0.1;
    lo = lo ?? a - pad; hi = hi ?? b + pad;
  }
  if (gleicheEinheit) {
    const proEinheit = pw / (x1 - x0);
    H = Math.max(160, Math.min(320, (hi - lo) * proEinheit + T + B));
    const mitte = (hi + lo) / 2, halb = (H - T - B) / proEinheit / 2;
    lo = mitte - halb; hi = mitte + halb;
  }
  const sx = (x) => L + ((x - x0) / (x1 - x0)) * pw;
  const sy = (y) => T + ((hi - y) / (hi - lo)) * (H - T - B);
  const N = 240;
  const pfad = (k) => {
    const a = k.a ?? x0, b = k.b ?? x1;
    let d = "", an = false, yAlt = null;
    for (let i = 0; i <= N; i++) {
      const x = a + ((b - a) * i) / N, y = k.f(x);
      const gut = isFinite(y) && y > lo - (hi - lo) * 3 && y < hi + (hi - lo) * 3;
      const sprung = yAlt !== null && gut && Math.abs(y - yAlt) > (hi - lo) * 1.5;
      if (!gut || sprung) { an = false; if (!gut) { yAlt = null; continue; } }
      d += `${an ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`;
      an = true; yAlt = y;
    }
    return d;
  };
  const xt = teilung(x0, x1), yt = teilung(lo, hi, Math.max(4, Math.round((H - T - B) / 36)));
  const klipp = useId().replace(/:/g, "k");
  const nullY = Math.max(T, Math.min(H - B, sy(0))), nullX = Math.max(L, Math.min(W - R, sx(0)));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={zw("Schaubild", "Graph")} style={{ width: "100%", display: "block", background: C.weiss, borderRadius: 14, border: `1px solid ${C.linie}` }}>
      <defs><clipPath id={klipp}><rect x={L} y={T} width={pw} height={H - T - B} /></clipPath></defs>
      {xt.map((v) => <line key={`gx${v}`} x1={sx(v)} x2={sx(v)} y1={T} y2={H - B} stroke="#E6EAF2" strokeWidth="1" />)}
      {yt.map((v) => <line key={`gy${v}`} y1={sy(v)} y2={sy(v)} x1={L} x2={W - R} stroke="#E6EAF2" strokeWidth="1" />)}
      <line x1={L} x2={W - R} y1={nullY} y2={nullY} stroke={C.tinte} strokeWidth="1.3" />
      <line x1={nullX} x2={nullX} y1={T} y2={H - B} stroke={C.tinte} strokeWidth="1.3" />
      {xt.map((v) => v !== 0 && <text key={`tx${v}`} x={sx(v)} y={Math.min(H - B + 14, nullY + 14)} fontSize="10.5" textAnchor="middle" fill={C.grau}>{zt(v, 3)}</text>)}
      {yt.map((v) => v !== 0 && <text key={`ty${v}`} x={nullX - 5 < L + 4 ? L - 4 : nullX - 5} y={sy(v) + 3.5} fontSize="10.5" textAnchor="end" fill={C.grau}>{zt(v, 3)}</text>)}
      {einheitX && <text x={W - R} y={H - 4} fontSize="10.5" textAnchor="end" fill={C.grau}>{einheitX}</text>}
      {einheitY && <text x={L + 4} y={T + 9} fontSize="10.5" fill={C.grau}>{einheitY}</text>}
      <g clipPath={`url(#${klipp})`}>
        {waagerechte.map((w, i) => <line key={`w${i}`} x1={L} x2={W - R} y1={sy(w.y)} y2={sy(w.y)} stroke={w.farbe || C.grau} strokeWidth="1.4" strokeDasharray="5 4" />)}
        {senkrechte.map((s, i) => <line key={`s${i}`} x1={sx(s.x)} x2={sx(s.x)} y1={T} y2={H - B} stroke={s.farbe || C.grau} strokeWidth="1.4" strokeDasharray="5 4" />)}
        {kurven.map((k, i) => <path key={`k${i}`} d={pfad(k)} fill="none" stroke={k.farbe || C.see} strokeWidth={k.breite || 2.4} strokeDasharray={k.gestrichelt ? "6 5" : undefined} strokeLinejoin="round" opacity={k.blass ? 0.28 : 1} />)}
        {punkte.filter((p) => isFinite(p.x) && isFinite(p.y)).map((p, i) => (
          <circle key={`p${i}`} cx={sx(p.x)} cy={sy(p.y)} r="4.6" fill={p.hohl ? C.weiss : p.farbe || C.tinte} stroke={p.hohl ? p.farbe || C.tinte : "#fff"} strokeWidth={p.hohl ? 2 : 1.5} />
        ))}
      </g>
      {punkte.filter((p) => p.name && isFinite(p.x) && isFinite(p.y) && p.y <= hi && p.y >= lo).map((p, i) => (
        <text key={`pn${i}`} x={Math.min(W - R - 20, sx(p.x) + 7)} y={Math.max(T + 10, sy(p.y) - 7)} fontSize="11.5" fontWeight="700" fill={p.farbe || C.tinte}>{p.name}</text>
      ))}
      {waagerechte.filter((w) => w.text).map((w, i) => <text key={`wt${i}`} x={W - R - 4} y={sy(w.y) - 5} fontSize="11" fontWeight="700" textAnchor="end" fill={w.farbe || C.grau}>{w.text}</text>)}
      {kurven.filter((k) => k.name && !k.blass).map((k, i) => <text key={`n${i}`} x={L + 6} y={T + 12 + i * 14} fontSize="12" fontWeight="700" fill={k.farbe || C.see}>{k.name}</text>)}
    </svg>
  );
}

/* ---------- Histogramm ----------
   werte: [{ x, h, farbe? }]  markiert: (x) => Farbe | null  linien: [{ x, farbe, text }]
   werte2: zweite Verteilung als Umriss (z. B. unter der Alternative) */
export function Balken({ werte, werte2, markiert, linien = [], hoehe = 200, yMax, xBeschriftung = "k", label, legende }) {
  const W = 360, L = 38, R = 8, T = 12, B = 24;
  const n = werte.length;
  const max = yMax ?? Math.max(...werte.map((w) => w.h), ...(werte2 || []).map((w) => w.h), 1e-9) * 1.1;
  const bw = (W - L - R) / n;
  const sy = (y) => T + (1 - y / max) * (hoehe - T - B);
  const yt = teilung(0, max, 4).filter((v) => v <= max);
  const schritt = Math.max(1, Math.ceil(n / 12));
  return (
    <svg viewBox={`0 0 ${W} ${hoehe}`} role="img" aria-label={label || zw("Histogramm", "Histogram")} style={{ width: "100%", display: "block", background: C.weiss, borderRadius: 14, border: `1px solid ${C.linie}` }}>
      {yt.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={sy(v)} y2={sy(v)} stroke="#E6EAF2" />
          <text x={L - 4} y={sy(v) + 3.5} fontSize="10" textAnchor="end" fill={C.grau}>{zt(v, 3)}</text>
        </g>
      ))}
      {werte.map((w, i) => {
        const f = markiert ? markiert(w.x) : null;
        return <rect key={i} x={L + i * bw + bw * 0.08} y={sy(w.h)} width={bw * 0.84} height={Math.max(0, hoehe - B - sy(w.h))} rx={Math.min(3, bw * 0.2)}
          fill={w.farbe || f || "#C9D6EE"} stroke={f ? f : "#9DB2D6"} strokeWidth="0.8" />;
      })}
      {werte2 && werte2.map((w, i) => (
        <rect key={`z${i}`} x={L + i * bw + bw * 0.08} y={sy(w.h)} width={bw * 0.84} height={Math.max(0, hoehe - B - sy(w.h))} fill="none" stroke={C.gruen} strokeWidth="1.4" strokeDasharray="3 2" />
      ))}
      <line x1={L} x2={W - R} y1={hoehe - B} y2={hoehe - B} stroke={C.tinte} strokeWidth="1.2" />
      {werte.map((w, i) => (i % schritt === 0 ? <text key={`t${i}`} x={L + i * bw + bw / 2} y={hoehe - B + 13} fontSize="10" textAnchor="middle" fill={C.grau}>{minusZ(w.x)}</text> : null))}
      <text x={W - R} y={hoehe - 2} fontSize="10" textAnchor="end" fill={C.grau}>{xBeschriftung}</text>
      {linien.map((l, i) => {
        const idx = werte.findIndex((w) => w.x === l.x);
        if (idx < 0) return null;
        const x = L + idx * bw + (l.rechts ? bw : 0);
        return (
          <g key={`l${i}`}>
            <line x1={x} x2={x} y1={T} y2={hoehe - B} stroke={l.farbe || C.tinte} strokeWidth="1.6" strokeDasharray="4 3" />
            {l.text && <text x={x + (l.rechts ? 4 : -4)} y={T + 10} fontSize="10.5" fontWeight="700" textAnchor={l.rechts ? "start" : "end"} fill={l.farbe || C.tinte}>{l.text}</text>}
          </g>
        );
      })}
      {legende && <text x={W - R - 4} y={T + 10} fontSize="10.5" fontWeight="700" textAnchor="end" fill={C.grau}>{legende}</text>}
    </svg>
  );
}

/* ---------- Laufender Mittelwert gegen exakten Wert ---------- */
export function Verlauf({ werte, ziel, zielText, y0, y1, hoehe = 180, einheit = "" }) {
  const W = 360, L = 42, R = 10, T = 12, B = 22;
  const n = werte.length;
  let lo = y0, hi = y1;
  if (lo === undefined || hi === undefined) {
    const alle = [...werte, ziel];
    lo = Math.min(...alle); hi = Math.max(...alle);
    const pad = (hi - lo || 1) * 0.15; lo -= pad; hi += pad;
  }
  const sx = (i) => L + (n <= 1 ? 0 : (i / (n - 1)) * (W - L - R));
  const sy = (y) => T + ((hi - Math.max(lo, Math.min(hi, y))) / (hi - lo)) * (hoehe - T - B);
  const schritt = Math.max(1, Math.floor(n / 400));
  let d = "";
  for (let i = 0; i < n; i += schritt) d += `${i ? "L" : "M"}${sx(i).toFixed(1)},${sy(werte[i]).toFixed(1)}`;
  if (n > 1) d += `L${sx(n - 1).toFixed(1)},${sy(werte[n - 1]).toFixed(1)}`;
  const yt = teilung(lo, hi, 4);
  return (
    <svg viewBox={`0 0 ${W} ${hoehe}`} role="img" aria-label={zw("Verlauf des Mittelwerts", "Running mean")} style={{ width: "100%", display: "block", background: C.weiss, borderRadius: 14, border: `1px solid ${C.linie}` }}>
      {yt.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={sy(v)} y2={sy(v)} stroke="#E6EAF2" />
          <text x={L - 4} y={sy(v) + 3.5} fontSize="10" textAnchor="end" fill={C.grau}>{zt(v, 3)}</text>
        </g>
      ))}
      <line x1={L} x2={W - R} y1={sy(ziel)} y2={sy(ziel)} stroke={C.see} strokeWidth="1.6" strokeDasharray="6 4" />
      <text x={W - R - 4} y={sy(ziel) - 5} fontSize="10.5" fontWeight="700" textAnchor="end" fill={C.see}>{zielText || zw("exakt", "exact")}</text>
      {n > 0 && <path d={d} fill="none" stroke={C.gruen} strokeWidth="2" strokeLinejoin="round" />}
      <line x1={L} x2={W - R} y1={hoehe - B} y2={hoehe - B} stroke={C.tinte} strokeWidth="1" />
      <text x={L} y={hoehe - 6} fontSize="10" fill={C.grau}>1</text>
      <text x={W - R} y={hoehe - 6} fontSize="10" textAnchor="end" fill={C.grau}>{n} {einheit}</text>
    </svg>
  );
}

/* ---------- Zufall ---------- */
export const ziehe = (wkt) => { let u = Math.random(), s = 0; for (let i = 0; i < wkt.length; i++) { s += wkt[i]; if (u < s) return i; } return wkt.length - 1; };
