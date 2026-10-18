/* ============================================================
   ZOOM-FILM – „Jede glatte Kurve wird beim Hineinzoomen zur Geraden“
   Animation für das Kapitel „Das Tangentenproblem“ (Kurs Differentialrechnung).
   Der Film zoomt exponentiell von 1× bis 1000× auf einen Punkt P des Graphen.
   Dabei werden angezeigt: Zoomfaktor, die Steigung des sichtbaren Ausschnitts
   (Sekante zwischen linkem und rechtem Bildrand) und am Ende die Tangente.
   Bedienung: Abspielen/Pause, Neustart, Regler zum Spulen, Kurvenwahl.
   prefers-reduced-motion: Der Film startet nicht von selbst.
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";

/* Kurven: f, Ableitung df (nur für die Tangente am Ende), Punkt x0, Startfenster (halbe Breite) */
export const ZOOM_KURVEN = [
  { id: "parabel", name: "Parabel", term: "f(x) = ½x²", f: (x) => 0.5 * x * x, df: (x) => x, x0: 1, w0: 2.6 },
  { id: "kubisch", name: "Kubische Kurve", term: "f(x) = x³ − 3x", f: (x) => x * x * x - 3 * x, df: (x) => 3 * x * x - 3, x0: 1.6, w0: 2.6 },
  { id: "sinus", name: "Sinus", term: "f(x) = sin x", f: (x) => Math.sin(x), df: (x) => Math.cos(x), x0: 2.2, w0: 3.2 },
];

const DAUER = 9000;       // ms für 1× → 1000×
const ZMAX = 1000;
const halten = (v) => Math.min(1, Math.max(0, v));
const zahl = (v, st = 3) => {
  const r = Math.round(v * 10 ** st) / 10 ** st;
  return (r < 0 ? "−" : "") + String(Math.abs(r)).replace(".", ",");
};

/* „Schöne“ Gitterweite für ein Fenster der Breite w */
function gitterweite(w) {
  const roh = w / 4;
  const p = 10 ** Math.floor(Math.log10(roh));
  const n = roh / p;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p;
}

/* Fortschritt t ∈ [0,1] → Zoomfaktor (exponentiell) */
const zoomAus = (t) => Math.pow(ZMAX, halten(t));

function zeichnen(cv, kurve, t, mitTangente) {
  const ctx = cv.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const B = cv.clientWidth, H = cv.clientHeight;
  if (cv.width !== Math.round(B * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(B * dpr); cv.height = Math.round(H * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const z = zoomAus(t);
  const w = kurve.w0 / z;                  // halbe Fensterbreite in x
  const hw = w * (H / B);                  // halbe Fensterhöhe (gleicher Maßstab)
  const x0 = kurve.x0, y0 = kurve.f(x0);
  const X = (x) => ((x - (x0 - w)) / (2 * w)) * B;
  const Y = (y) => H - ((y - (y0 - hw)) / (2 * hw)) * H;

  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, B, H);

  // Gitter
  const g = gitterweite(2 * w);
  ctx.strokeStyle = "#E3E8F2"; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = Math.ceil((x0 - w) / g) * g; x <= x0 + w; x += g) { const px = Math.round(X(x)) + 0.5; ctx.moveTo(px, 0); ctx.lineTo(px, H); }
  for (let y = Math.ceil((y0 - hw) / g) * g; y <= y0 + hw; y += g) { const py = Math.round(Y(y)) + 0.5; ctx.moveTo(0, py); ctx.lineTo(B, py); }
  ctx.stroke();

  // Achsen, falls sichtbar
  ctx.strokeStyle = C.seeTief; ctx.lineWidth = 1.4;
  ctx.beginPath();
  if (y0 - hw < 0 && y0 + hw > 0) { ctx.moveTo(0, Y(0)); ctx.lineTo(B, Y(0)); }
  if (x0 - w < 0 && x0 + w > 0) { ctx.moveTo(X(0), 0); ctx.lineTo(X(0), H); }
  ctx.stroke();

  // Graph
  ctx.strokeStyle = C.see; ctx.lineWidth = 3.2; ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.beginPath();
  const n = 360;
  for (let i = 0; i <= n; i++) {
    const x = x0 - w + (2 * w * i) / n;
    const py = Y(kurve.f(x));
    if (i === 0) ctx.moveTo(0, py); else ctx.lineTo((i / n) * B, py);
  }
  ctx.stroke();

  // Tangente (blendet gegen Ende ein)
  const m = kurve.df(x0);
  const tanAlpha = mitTangente ? halten((t - 0.72) / 0.18) : 0;
  if (tanAlpha > 0) {
    ctx.save(); ctx.globalAlpha = tanAlpha; ctx.strokeStyle = C.flaggold; ctx.lineWidth = 3; ctx.setLineDash([10, 7]);
    ctx.beginPath(); ctx.moveTo(0, Y(y0 + m * (x0 - w - x0))); ctx.lineTo(B, Y(y0 + m * (x0 + w - x0))); ctx.stroke(); ctx.restore();
  }

  // Sekante von P zum rechten Bildrand: ein Differenzenquotient mit h = halbe Fensterbreite
  const sek = (kurve.f(x0 + w) - kurve.f(x0)) / w;
  ctx.save(); ctx.globalAlpha = 0.9 * (1 - tanAlpha); ctx.strokeStyle = "#A50044"; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(0, Y(y0 - sek * w)); ctx.lineTo(B, Y(y0 + sek * w)); ctx.stroke(); ctx.restore();
  // Punkt P
  ctx.fillStyle = "#A50044"; ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(X(x0), Y(y0), 7, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#A50044"; ctx.font = "700 15px Montserrat, sans-serif"; ctx.fillText("P", X(x0) + 10, Y(y0) - 10);

  // Maßstab unten links
  const lg = Math.max(12, (g / (2 * w)) * B);
  ctx.strokeStyle = C.seeTief; ctx.lineWidth = 2; ctx.beginPath();
  const my = 62;
  ctx.moveTo(14, my); ctx.lineTo(14 + lg, my); ctx.moveTo(14, my - 4); ctx.lineTo(14, my + 4); ctx.moveTo(14 + lg, my - 4); ctx.lineTo(14 + lg, my + 4); ctx.stroke();
  ctx.fillStyle = C.seeTief; ctx.font = "600 12px Montserrat, sans-serif"; ctx.fillText(zahl(g, 6), 14, my + 17);

  return { z, sek, m };
}

/* Bildunterschrift je nach Fortschritt */
function text(t, mit) {
  if (t < 0.12) return "Ein gekrümmter Graph. Wir zoomen auf den Punkt P.";
  if (t < 0.4) return "Je näher wir herangehen, desto weniger sieht man von der Krümmung …";
  if (t < 0.72) return "… bis der Graph aussieht wie eine Gerade.";
  if (!mit || t < 0.95) return "Die Gerade, die wir sehen, ist die Tangente in P.";
  return "Lokal ist jede glatte Kurve eine Gerade – ihre Steigung ist die Ableitung f′(x₀).";
}

export function ZoomFilm() {
  const leinwand = React.useRef(null);
  const [kurveId, setKurveId] = React.useState("parabel");
  const [t, setT] = React.useState(0);
  const [laeuft, setLaeuft] = React.useState(false);
  const [mitTangente, setMitTangente] = React.useState(true);
  const [werte, setWerte] = React.useState({ z: 1, sek: 0, m: 0 });
  const kurve = ZOOM_KURVEN.find((k) => k.id === kurveId);
  const tRef = React.useRef(0);

  // Automatisch starten (außer bei reduzierter Bewegung)
  React.useEffect(() => {
    let ruhig = false;
    try { ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* egal */ }
    if (!ruhig) setLaeuft(true);
  }, []);

  // Abspielen
  React.useEffect(() => {
    if (!laeuft) return undefined;
    let id, letzte = null;
    const schritt = (jetzt) => {
      if (letzte !== null) {
        const neu = Math.min(1, tRef.current + (jetzt - letzte) / DAUER);
        tRef.current = neu; setT(neu);
        if (neu >= 1) { setLaeuft(false); return; }
      }
      letzte = jetzt; id = requestAnimationFrame(schritt);
    };
    id = requestAnimationFrame(schritt);
    return () => cancelAnimationFrame(id);
  }, [laeuft]);

  // Zeichnen
  React.useEffect(() => {
    const cv = leinwand.current; if (!cv) return undefined;
    const malen = () => setWerte(zeichnen(cv, kurve, t, mitTangente));
    malen();
    window.addEventListener("resize", malen);
    return () => window.removeEventListener("resize", malen);
  }, [t, kurve, mitTangente]);

  const neustart = () => { tRef.current = 0; setT(0); setLaeuft(true); };
  const spulen = (v) => { setLaeuft(false); tRef.current = v; setT(v); };
  const knopf = (aktiv) => ({ padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${aktiv ? C.seeTief : C.linie}`, background: aktiv ? C.seeTief : C.weiss,
    color: aktiv ? C.weiss : C.tinte, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer" });

  return (
    <div className="mx-auto px-4" style={{ maxWidth: 760, paddingTop: 12 }}>
      <p style={{ color: C.grau, fontSize: 15, lineHeight: 1.75, fontWeight: 300, margin: "0 0 12px" }}>
        Der Film vergrößert den Graphen immer weiter um den Punkt <b style={{ color: C.tinte, fontWeight: 600 }}>P</b> – bis zum 1000-Fachen.
        Beobachte, was aus der Krümmung wird und welcher Steigung sich der sichtbare Ausschnitt nähert.
      </p>

      <div role="group" aria-label="Kurve wählen" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {ZOOM_KURVEN.map((k) => (
          <button key={k.id} type="button" aria-pressed={k.id === kurveId} onClick={() => { setKurveId(k.id); tRef.current = 0; setT(0); setLaeuft(true); }} style={knopf(k.id === kurveId)}>
            {k.name} <span style={{ fontWeight: 400, opacity: 0.8 }}>· {k.term}</span>
          </button>
        ))}
      </div>

      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(15,26,51,0.10)", border: `1px solid ${C.linie}`, background: C.weiss }}>
        <canvas ref={leinwand} role="img" aria-label={`Graph von ${kurve.term}, ${Math.round(werte.z)}-fach vergrößert um P`}
          style={{ display: "block", width: "100%", height: "min(62vw, 420px)", minHeight: 240 }} />
        <div style={{ position: "absolute", top: 10, left: 10, background: C.seeTief, color: C.weiss, borderRadius: 8, padding: "4px 10px", fontWeight: 800, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
          {werte.z < 10 ? zahl(werte.z, 1) : Math.round(werte.z)}×
        </div>
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.92)", border: `1px solid ${C.linie}`, borderRadius: 10, padding: "6px 10px", fontSize: 12.5, color: C.tinte, lineHeight: 1.5, fontVariantNumeric: "tabular-nums" }}>
          <div style={{ color: "#A50044" }}>Sekante von P zum Rand: <b>{zahl(werte.sek, 4)}</b></div>
          {mitTangente && t > 0.72 && <div style={{ color: "#8C6A00" }}>Steigung der Tangente: <b>{zahl(werte.m, 4)}</b></div>}
        </div>
        <p aria-live="polite" style={{ position: "absolute", left: 0, right: 0, bottom: 0, margin: 0, padding: "10px 14px", background: "linear-gradient(0deg, rgba(14,30,74,0.88), rgba(14,30,74,0.70))",
          color: C.weiss, fontSize: 14, fontWeight: 500, lineHeight: 1.45 }}>{text(t, mitTangente)}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <button type="button" onClick={() => (t >= 1 ? neustart() : setLaeuft(!laeuft))} aria-label={laeuft ? "Pause" : "Abspielen"}
          style={{ width: 44, height: 44, borderRadius: 22, border: "none", background: C.see, color: C.weiss, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          {laeuft
            ? <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" rx="1" fill="#fff" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="#fff" /></svg>
            : <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9.5-5.5z" fill="#fff" /></svg>}
        </button>
        <button type="button" onClick={neustart} style={knopf(false)}>Von vorn</button>
        <input type="range" min="0" max="1000" value={Math.round(t * 1000)} onChange={(e) => spulen(+e.target.value / 1000)} aria-label="Zoom spulen"
          style={{ flex: "1 1 160px", accentColor: C.see }} />
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: C.tinte, cursor: "pointer" }}>
          <input type="checkbox" checked={mitTangente} onChange={(e) => setMitTangente(e.target.checked)} /> Tangente zeigen
        </label>
      </div>

      <div style={{ background: C.weiss, borderRadius: 16, padding: "14px 16px", marginTop: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "0 0 6px" }}>Was du gerade siehst</p>
        <p style={{ fontSize: 14.5, color: C.grau, lineHeight: 1.7, margin: 0 }}>
          Die rote Gerade ist die Sekante von P zum Punkt des Graphen am rechten Bildrand. Ihre Steigung ist ein Differenzenquotient – mit <i>h</i> = halbe Bildbreite.
          Je weiter wir zoomen, desto kleiner wird <i>h</i> und desto näher kommt diese Zahl der Tangentensteigung im Punkt P.
          Genau diesen Grenzübergang macht die Ableitung exakt.
        </p>
      </div>
    </div>
  );
}
