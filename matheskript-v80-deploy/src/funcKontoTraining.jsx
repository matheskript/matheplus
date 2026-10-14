/* ======================================================================
   MEIN TRAINING im Kontobereich (Schüler)
   Kompakte Übersicht über alles, was bisher geübt wurde:
   Kennzahlen · Zeitleiste der letzten 12 Wochen (Häufigkeit je Tag,
   Anteil richtig je Woche) · Bereiche · häufigste Fehler · Verlauf.
   Die Auswertung selbst steckt in trainingStatistik.js.
   ====================================================================== */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { FEHLERARTEN, PROTOKOLL } from "./base2.jsx";
import { LERN } from "./base3.jsx";
import { useLern } from "./func6.jsx";
import { FEHLERTYPEN } from "./trainingDaten.js";
import { trainingStatistik, dauerKurz, dauerKachel } from "./trainingStatistik.js";
import { englisch } from "./i18n.js";

const NAVY = "#0B1E4A";
const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
const GOLD_DUNKEL = "#9A7400";

const FEHLER_NAMEN = (() => {
  const n = { rechnen: "Rechenfehler" };
  Object.entries(FEHLERARTEN).forEach(([k, v]) => { n[k] = v.charAt(0).toUpperCase() + v.slice(1); });
  Object.entries(FEHLERTYPEN).forEach(([k, v]) => { n[k] = v.name; });
  return n;
})();

/* Farbe für den Anteil richtig */
export const quoteFarbe = (q) => (q === null || q === undefined ? C.hellgrau : q >= 80 ? C.smaragd : q >= 60 ? GOLD_DUNKEL : C.signal);
/* Blaustufen für die Häufigkeit je Tag */
const STUFEN = [
  { ab: 0, farbe: "#EDF1F7" },
  { ab: 1, farbe: "#C7D8F0" },
  { ab: 5, farbe: "#86AEE0" },
  { ab: 10, farbe: "#3D78C2" },
  { ab: 20, farbe: "#004D98" },
];
const stufeVon = (n) => [...STUFEN].reverse().find((s) => n >= s.ab);

const loc = () => (englisch() ? "en-GB" : "de-DE");
const wt = (ts) => new Date(ts).toLocaleDateString(loc(), { weekday: "short" }).replace(".", "");
const datumKurz = (ts) => new Date(ts).toLocaleDateString(loc(), { day: "2-digit", month: "2-digit" });
const uhrzeit = (ts) => new Date(ts).toLocaleTimeString(loc(), { hour: "2-digit", minute: "2-digit" });
const monat = (ts) => new Date(ts).toLocaleDateString(loc(), { month: "short" }).replace(".", "");
function tagName(ts) {
  const d = new Date(ts); d.setHours(0, 0, 0, 0);
  const h = new Date(); h.setHours(0, 0, 0, 0);
  const diff = Math.round((h - d) / 86400000);
  if (diff === 0) return englisch() ? "Today" : "Heute";
  if (diff === 1) return englisch() ? "Yesterday" : "Gestern";
  return `${wt(ts)}, ${datumKurz(ts)}`;
}

const Kicker = ({ children, rechts }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
    <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", color: C.hellgrau }}>{children}</p>
    {rechts}
  </div>
);

/* Veränderung zur Vorwoche als kleiner Pfeil */
function Trend({ jetzt, vorher, prozent = false }) {
  if (jetzt === null || vorher === null || jetzt === undefined || vorher === undefined) return null;
  const d = jetzt - vorher;
  if (!prozent && vorher === 0 && jetzt === 0) return null;
  if (d === 0) return <span style={{ color: C.hellgrau, fontWeight: 600 }}> ±0</span>;
  const gut = d > 0;
  return (
    <span style={{ color: gut ? C.smaragd : C.signal, fontWeight: 700, whiteSpace: "nowrap" }} title="im Vergleich zu den 7 Tagen davor">
      {" "}{gut ? "▲" : "▼"} {Math.abs(d)}{prozent ? " %" : ""}
    </span>
  );
}

/* ---------- Kennzahlen ---------- */
function Kennzahl({ wert, einheit, label, unten }) {
  return (
    <div style={{ background: "#F6F8FC", borderRadius: 14, padding: "12px 12px 11px", minWidth: 0 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: C.hellgrau, marginBottom: 4, textTransform: "uppercase" }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
        {wert}{einheit && <span style={{ fontSize: 14, fontWeight: 700, color: C.grau }}>{einheit}</span>}
      </p>
      <p style={{ fontSize: 12, color: C.grau, marginTop: 4, lineHeight: 1.35 }}>{unten}</p>
    </div>
  );
}

/* ---------- Zeitleiste: 12 Wochen × 7 Tage + Anteil richtig je Woche ---------- */
const LABEL_W = 22;     // Spalte für Wochentage
const GAP = 3;

function Zeitleiste({ raster, wahl, setWahl }) {
  const n = raster.length;
  const alleTage = raster.flatMap((w) => w.tage);
  const gewaehlt = alleTage.find((t) => t.key === wahl) || alleTage.find((t) => t.heute);
  const gewaehltW = gewaehlt ? raster.find((w) => w.tage.some((t) => t.key === gewaehlt.key)) : null;
  const monate = raster.map((w, i) => {
    const m = new Date(w.start).getMonth();
    const vorher = i > 0 ? new Date(raster[i - 1].start).getMonth() : null;
    return i === 0 || m !== vorher ? monat(w.tage[3].ts) : "";
  });
  const spalten = `${LABEL_W}px repeat(${n}, minmax(0, 1fr))`;

  /* Linie: Anteil richtig je Woche (nur Wochen mit mindestens 3 Aufgaben) */
  const W = 300, H = 64, oben = 8, unten = 8;
  const x = (i) => ((i + 0.5) / n) * W;
  const y = (q) => oben + (1 - q / 100) * (H - oben - unten);
  const punkte = raster.map((w, i) => ({ i, q: w.aufgaben >= 3 ? w.quote : null, w }));
  const segmente = [];
  let akt = [];
  punkte.forEach((p) => { if (p.q === null) { if (akt.length) segmente.push(akt); akt = []; } else akt.push(p); });
  if (akt.length) segmente.push(akt);
  const zeilen = englisch() ? ["Mon", "", "Wed", "", "Fri", "", "Sun"] : ["Mo", "", "Mi", "", "Fr", "", "So"];

  return (
    <div className="flex flex-wrap" style={{ gap: "14px 22px", alignItems: "flex-start" }}>
      <div style={{ flex: "1 1 260px", maxWidth: 380, minWidth: 0 }}>
      {/* Monate */}
      <div data-kein-i18n="" style={{ display: "grid", gridTemplateColumns: spalten, columnGap: GAP, marginBottom: 4 }} aria-hidden="true">
        <span />
        {monate.map((m, i) => <span key={i} style={{ fontSize: 10.5, color: C.hellgrau, fontWeight: 600, whiteSpace: "nowrap", overflow: "visible" }}>{m}</span>)}
      </div>
      {/* Raster */}
      <div style={{ display: "grid", gridTemplateColumns: spalten, gridTemplateRows: "repeat(7, auto)", gridAutoFlow: "column", gap: GAP }}
        role="group" aria-label="Aktivität der letzten 12 Wochen">
        {zeilen.map((z, r) => (
          <span key={`l${r}`} data-kein-i18n="" aria-hidden="true" style={{ fontSize: 10, color: C.hellgrau, lineHeight: 1, alignSelf: "center" }}>{z}</span>
        ))}
        {alleTage.map((t) => {
          const an = gewaehlt && t.key === gewaehlt.key;
          const st = stufeVon(t.aufgaben);
          return (
            <button key={t.key} type="button" disabled={t.zukunft} onClick={() => setWahl(t.key)}
              aria-label={`${tagName(t.ts)}: ${t.aufgaben} ${englisch() ? (t.aufgaben === 1 ? "exercise" : "exercises") : t.aufgaben === 1 ? "Aufgabe" : "Aufgaben"}`} data-kein-i18n="" aria-pressed={an}
              style={{ aspectRatio: "1 / 1", width: "100%", padding: 0, borderRadius: 4, cursor: t.zukunft ? "default" : "pointer",
                background: t.zukunft ? "transparent" : st.farbe,
                border: t.zukunft ? `1px dashed ${C.linie}` : an ? `2px solid ${C.flaggold}` : t.heute ? `1.5px solid ${NAVY}` : "none",
                boxShadow: an ? "0 0 0 1px #FFF inset" : "none" }} />
          );
        })}
      </div>

      {/* Anteil richtig je Woche */}
      <div style={{ display: "grid", gridTemplateColumns: `${LABEL_W}px 1fr`, columnGap: GAP, marginTop: 10, alignItems: "stretch" }}>
        <div style={{ position: "relative" }} aria-hidden="true">
          <span style={{ position: "absolute", top: 0, fontSize: 9.5, color: C.hellgrau }}>100</span>
          <span style={{ position: "absolute", bottom: 0, fontSize: 9.5, color: C.hellgrau }}>0</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
          role="img" aria-label="Anteil richtiger Antworten je Woche">
          {[0, 50, 100].map((g) => <line key={g} x1="0" x2={W} y1={y(g)} y2={y(g)} stroke={C.linie} strokeWidth="1" strokeDasharray={g === 50 ? "3 3" : "none"} />)}
          <rect x="0" y={y(100)} width={W} height={y(80) - y(100)} fill={C.smaragd} opacity="0.06" />
          {segmente.map((seg, k) => (
            <polyline key={k} points={seg.map((p) => `${x(p.i).toFixed(1)},${y(p.q).toFixed(1)}`).join(" ")} fill="none" stroke={C.see} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {punkte.filter((p) => p.q !== null).map((p) => (
            <circle key={p.i} cx={x(p.i)} cy={y(p.q)} r="3.6" fill={quoteFarbe(p.q)} stroke="#FFF" strokeWidth="1.4">
              <title>{`${datumKurz(p.w.start)}: ${p.q} % richtig (${p.w.aufgaben} Aufgaben)`}</title>
            </circle>
          ))}
        </svg>
      </div>

      </div>
      <div style={{ flex: "1 1 170px", minWidth: 0 }}>
      {/* Legende */}
      <div className="flex flex-wrap items-center" style={{ gap: "6px 14px", fontSize: 11, color: C.hellgrau }}>
        <span className="flex items-center" style={{ gap: 4 }}>
          <span>wenig</span>
          {STUFEN.map((s) => <span key={s.ab} style={{ width: 10, height: 10, borderRadius: 2.5, background: s.farbe }} />)}
          <span>viel</span>
        </span>
        <span className="flex items-center" style={{ gap: 5 }}>
          <span style={{ width: 14, height: 2, background: C.see, borderRadius: 1 }} />
          <span>richtig pro Woche</span>
        </span>
      </div>

      {/* Ausgewählter Tag */}
      {gewaehlt && (
        <div style={{ marginTop: 10, background: "#F6F8FC", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: "4px 10px", flexWrap: "wrap" }} aria-live="polite">
          <span style={{ fontSize: 13.5, fontWeight: 700, color: NAVY }} data-kein-i18n="">{tagName(gewaehlt.ts)}</span>
          {gewaehlt.aufgaben > 0 ? (
            <span style={{ fontSize: 13, color: C.grau }}>
              <b style={{ color: C.tinte }}>{gewaehlt.aufgaben}</b> {gewaehlt.aufgaben === 1 ? "Aufgabe" : "Aufgaben"}
              {" · "}<b style={{ color: quoteFarbe(gewaehlt.quote) }}>{gewaehlt.quote} %</b> richtig
              {gewaehlt.sekunden >= 60 && <>{" · "}{dauerKurz(gewaehlt.sekunden)}</>}
            </span>
          ) : (
            <span style={{ fontSize: 13, color: C.hellgrau }}>kein Training</span>
          )}
        </div>
      )}
      {/* Wochenwerte der gewählten Woche */}
      {gewaehltW && gewaehltW.aufgaben > 0 && (
        <p style={{ fontSize: 12.5, color: C.grau, marginTop: 8, lineHeight: 1.5 }}>
          Woche: <b style={{ color: C.tinte }}>{gewaehltW.aufgaben}</b> {gewaehltW.aufgaben === 1 ? "Aufgabe" : "Aufgaben"} an <b style={{ color: C.tinte }}>{gewaehltW.aktiveTage}</b> {gewaehltW.aktiveTage === 1 ? "Tag" : "Tagen"}{" · "}<b style={{ color: quoteFarbe(gewaehltW.quote) }}>{gewaehltW.quote} %</b> richtig
        </p>
      )}
      </div>
    </div>
  );
}

/* ---------- Bereiche ---------- */
function Bereiche({ themen, staerke, baustelle, gehe }) {
  const [alle, setAlle] = useState(false);
  const liste = alle ? themen : themen.slice(0, 5);
  const max = Math.max(...themen.map((t) => t.aufgaben), 1);
  return (
    <div>
      {liste.map((t) => {
        const marke = staerke && t.id === staerke.id ? { text: "Stärke", farbe: C.smaragd, bg: "#E9F6EF" }
          : baustelle && t.id === baustelle.id ? { text: "Üben", farbe: C.signal, bg: "#FBEFE8" } : null;
        const Tag = t.ziel ? "button" : "div";
        return (
          <Tag key={t.id} type={t.ziel ? "button" : undefined} onClick={t.ziel ? () => gehe(t.ziel) : undefined}
            style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderTop: `1px solid ${C.linie}`,
              padding: "9px 0", fontFamily: "inherit", cursor: t.ziel ? "pointer" : "default", color: C.tinte }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
              {marke && <span style={{ fontSize: 10.5, fontWeight: 700, color: marke.farbe, background: marke.bg, borderRadius: 999, padding: "2px 8px" }}>{marke.text}</span>}
              <span style={{ fontSize: 12.5, color: C.grau, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                {t.aufgaben} <span style={{ color: C.hellgrau }}>·</span> <b style={{ color: quoteFarbe(t.quote) }}>{t.quote} %</b>
                {t.trend !== null && t.trend !== 0 && <span style={{ color: t.trend > 0 ? C.smaragd : C.signal, fontWeight: 700 }}> {t.trend > 0 ? "▲" : "▼"}</span>}
              </span>
            </span>
            {/* Balken: Länge = Menge, gefüllter Teil = richtig */}
            <span style={{ display: "block", height: 6, background: C.himmel, borderRadius: 999, width: `${Math.max(8, (t.aufgaben / max) * 100)}%` }}>
              <span style={{ display: "block", height: 6, borderRadius: 999, width: `${t.quote}%`, background: quoteFarbe(t.quote) }} />
            </span>
          </Tag>
        );
      })}
      {themen.length > 5 && (
        <button type="button" onClick={() => setAlle(!alle)}
          style={{ marginTop: 4, background: "none", border: "none", padding: "8px 0", color: C.see, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
          {alle ? "Weniger anzeigen" : `Alle ${themen.length} Bereiche`}
        </button>
      )}
    </div>
  );
}

/* ---------- Verlauf ---------- */
function Verlauf({ sitzungen, gehe }) {
  const [anzahl, setAnzahl] = useState(5);
  const liste = sitzungen.slice(0, anzahl);
  let letzterTag = null;
  return (
    <div>
      <div style={{ position: "relative", paddingLeft: 18 }}>
        <span aria-hidden="true" style={{ position: "absolute", left: 5, top: 8, bottom: 8, width: 2, background: C.linie, borderRadius: 1 }} />
        {liste.map((s, i) => {
          const tag = tagName(s.start);
          const neuerTag = tag !== letzterTag;
          letzterTag = tag;
          return (
            <div key={`${s.start}-${i}`} style={{ position: "relative", padding: neuerTag && i > 0 ? "10px 0 6px" : "2px 0 6px" }}>
              {neuerTag && <p data-kein-i18n="" style={{ fontSize: 11.5, fontWeight: 700, color: C.hellgrau, marginBottom: 4, letterSpacing: "0.02em" }}>{tag}</p>}
              <div style={{ position: "relative" }}>
              <span aria-hidden="true" style={{ position: "absolute", left: -17, top: 4, width: 10, height: 10, borderRadius: 999,
                background: quoteFarbe(s.quote), border: "2px solid #FFF", boxShadow: `0 0 0 1px ${C.linie}` }} />
              <button type="button" onClick={s.ziel ? () => gehe(s.ziel) : undefined} disabled={!s.ziel}
                style={{ display: "flex", width: "100%", alignItems: "baseline", gap: 8, background: "none", border: "none", padding: 0, textAlign: "left",
                  fontFamily: "inherit", cursor: s.ziel ? "pointer" : "default", color: C.tinte }}>
                <span data-kein-i18n="" style={{ fontSize: 12, color: C.hellgrau, width: 40, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{uhrzeit(s.start)}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                <span style={{ fontSize: 12.5, color: C.grau, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                  {s.richtig}/{s.aufgaben} <b style={{ color: quoteFarbe(s.quote) }}>{s.quote} %</b>
                </span>
              </button>
              </div>
            </div>
          );
        })}
      </div>
      {sitzungen.length > anzahl && (
        <button type="button" onClick={() => setAnzahl(anzahl + 10)}
          style={{ marginTop: 4, background: "none", border: "none", padding: "8px 0", color: C.see, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
          Mehr anzeigen
        </button>
      )}
    </div>
  );
}

/* ---------- Karte ---------- */
export function MeinTrainingKarte({ gehe }) {
  useLern();
  const [offen, setOffen] = useState(true);
  const [wahl, setWahl] = useState(null);
  const s = trainingStatistik({ protokoll: PROTOKOLL, aktivitaet: LERN.aktivitaet || {}, fehlerNamen: FEHLER_NAMEN });
  const knopf = { height: 40, padding: "0 16px", borderRadius: 999, fontSize: 13.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" };
  const abschnitt = { borderTop: `1px solid ${C.linie}`, marginTop: 18, paddingTop: 16 };

  return (
    <div style={{ ...karte, marginBottom: 14, overflow: "hidden" }}>
      <button type="button" onClick={() => setOffen(!offen)} aria-expanded={offen} aria-controls="mein-training-inhalt"
        style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", gap: 10, padding: offen ? "18px 18px 6px" : "18px",
          background: "none", border: "none", fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: offen ? C.hellgrau : C.see }}>MEIN TRAINING</span>
        <span className="flex items-center" style={{ gap: 10 }}>
          {!offen && !s.leer && (
            <span style={{ fontSize: 12.5, color: C.grau, fontVariantNumeric: "tabular-nums" }}>
              {s.gesamt.aufgaben} <span style={{ color: C.hellgrau }}>·</span> <b style={{ color: quoteFarbe(s.gesamt.quote) }}>{s.gesamt.quote} %</b>
            </span>
          )}
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke={C.see} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: offen ? "rotate(180deg)" : "none", transition: "transform .2s" }}><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </button>

      {offen && (
        <div id="mein-training-inhalt" style={{ padding: "0 18px 18px" }}>
          {s.leer ? (
            <>
              <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginBottom: 14 }}>
                Hier siehst du bald, wie oft du trainierst, wie viel du richtig hast und wo du dich verbesserst. Jede geprüfte Aufgabe in der App zählt.
              </p>
              <div className="flex flex-wrap" style={{ gap: 8 }}>
                <button type="button" onClick={() => gehe({ ansicht: "warmup" })} style={{ ...knopf, border: "none", background: C.see, color: C.weiss }}>5 Minuten Mathe</button>
                <button type="button" onClick={() => gehe({ ansicht: "start" })} style={{ ...knopf, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see }}>Zum Training</button>
              </div>
            </>
          ) : (
            <>
              {/* Kennzahlen */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))", gap: 8, marginTop: 6 }}>
                <Kennzahl label="Aufgaben" wert={s.gesamt.aufgaben}
                  unten={<>7 Tage: <b style={{ color: C.tinte }}>{s.letzte7.aufgaben}</b><Trend jetzt={s.letzte7.aufgaben} vorher={s.vorige7.aufgaben} /></>} />
                <Kennzahl label="Richtig" wert={s.gesamt.quote} einheit=" %"
                  unten={s.letzte7.quote !== null
                    ? <>7 Tage: <b style={{ color: quoteFarbe(s.letzte7.quote) }}>{s.letzte7.quote} %</b><Trend jetzt={s.letzte7.quote} vorher={s.vorige7.quote} prozent /></>
                    : <>7 Tage: –</>} />
                <Kennzahl label="Aktive Tage" wert={s.letzte30.aktiveTage} einheit=" / 30"
                  unten={<>Serie: <b style={{ color: s.serie >= 3 ? GOLD_DUNKEL : C.tinte }}>{s.serie}</b> {s.serie === 1 ? "Tag" : "Tage"}</>} />
                <Kennzahl label="Lernzeit" wert={dauerKachel(s.gesamt.sekunden)}
                  unten={<>7 Tage: <b style={{ color: C.tinte }}>{dauerKurz(s.letzte7.sekunden)}</b></>} />
              </div>

              {/* Zeitleiste */}
              <div style={abschnitt}>
                <Kicker>ZEITLEISTE · 12 WOCHEN</Kicker>
                <Zeitleiste raster={s.raster} wahl={wahl} setWahl={setWahl} />
              </div>

              {/* Bereiche */}
              {s.themen.length > 0 && (
                <div style={abschnitt}>
                  <Kicker rechts={<span style={{ fontSize: 11, color: C.hellgrau }}>Aufgaben · richtig</span>}>NACH BEREICH</Kicker>
                  <Bereiche themen={s.themen} staerke={s.staerke} baustelle={s.baustelle} gehe={gehe} />
                </div>
              )}

              {/* Fehler */}
              {s.fehler.length > 0 && (
                <div style={abschnitt}>
                  <Kicker>HÄUFIGSTE FEHLER · 30 TAGE</Kicker>
                  <div className="flex flex-wrap" style={{ gap: 6 }}>
                    {s.fehler.slice(0, 4).map((f) => (
                      <span key={f.art} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FBF3E8", color: "#7A4A1E", borderRadius: 999, padding: "5px 6px 5px 11px", fontSize: 12.5, fontWeight: 600, maxWidth: "100%" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                        <span style={{ background: C.weiss, borderRadius: 999, padding: "0 7px", fontSize: 12, fontWeight: 800, color: C.signal }}>{f.anzahl}</span>
                      </span>
                    ))}
                  </div>
                  <button type="button" onClick={() => gehe({ ansicht: "fehlertraining" })}
                    style={{ marginTop: 10, background: "none", border: "none", padding: "6px 0", color: C.see, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                    Meine Fehler üben ▸
                  </button>
                </div>
              )}

              {/* Verlauf */}
              {s.sitzungen.length > 0 && (
                <div style={abschnitt}>
                  <Kicker rechts={<span style={{ fontSize: 11, color: C.hellgrau }}>richtig / Aufgaben</span>}>VERLAUF</Kicker>
                  <Verlauf sitzungen={s.sitzungen} gehe={gehe} />
                </div>
              )}

              <p style={{ fontSize: 11.5, color: C.hellgrau, lineHeight: 1.55, marginTop: 14 }}>
                Gezählt wird jede geprüfte Antwort in der App. Die Lernzeit wird aus den Abständen zwischen den Aufgaben geschätzt.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
