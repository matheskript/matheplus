/* ======================================================================
   lernwegUi.jsx – gemeinsame Bausteine für Werkzeuge mit Lernweg
   (Ungleichungen und Beträge · Mengen und Logik · Funktionen: Grundlagen)
   · LernwegSeite   – Kapitel-Leiste (gespeichert), Inhalt, „Weiter mit Kapitel n“
   · Einfuehrung    – jede Einführung in drei Stufen: Einstieg (anschaulich),
                      Standard (wie im Unterricht), Vertiefung (mit Begründung);
                      die gewählte Stufe gilt für alle Kapitel und Werkzeuge
   · Leitfrage, Absatz, FormelBlock, Aufforderung, Trenner, UebenKopf, Labor
   · UebenDaten     – Übungsrahmen für Aufgaben im Datenformat
                      (ungleichGen.js, mengenLogik.js, funktionenGen.js)
   · MengenStrahl   – Teilmengen von ℝ auf der Zahlengeraden
   · VennBild       – zwei Mengen als Kreise, optional mit Zahlen
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { MS, karte, kicker, zw } from "./ui2.jsx";
import { Seite, liesZahl } from "./ui3.jsx";
import { UebenRahmen, ws, zs } from "./geoUi.jsx";
import { enthaelt, zText } from "./mengenRechnen.js";

const SCHRIFT = "Montserrat, system-ui, sans-serif";
/* Zweisprachiges Paar [de, en] → Text der aktuellen Sprache; Strings bleiben */
export const L = (p) => (Array.isArray(p) ? zw(p[0], p[1]) : p);

/* ---------- Kapitelkopf und Fließtext ---------- */
export const Leitfrage = ({ nr, von, children }) => (
  <>
    <p style={{ ...kicker, marginTop: 22 }}>{zw(`Kapitel ${nr} von ${von}`, `Chapter ${nr} of ${von}`)}</p>
    <h3 style={{ fontSize: "clamp(20px, 5.6vw, 24px)", fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em", lineHeight: 1.25, margin: "0 0 10px" }}>{children}</h3>
  </>
);
export const Absatz = ({ children }) => <p style={{ fontSize: 15, color: C.grau, lineHeight: 1.8, margin: "0 0 12px" }}>{typeof children === "string" ? <MS s={children} /> : children}</p>;
export const FormelBlock = ({ t }) => (
  <div style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "12px 14px", margin: "4px 0 14px", fontSize: 17, color: C.tinte, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16, overflowX: "auto" }}>
    {t.map((z, i) => <M key={i} t={z} />)}
  </div>
);
export const Aufforderung = ({ children }) => <p style={{ fontSize: 13, color: C.see, fontWeight: 600, margin: "0 0 10px" }}>{children}</p>;
export const Trenner = () => <div style={{ height: 1, background: C.linie, margin: "30px 0 26px" }} />;
export const UebenKopf = ({ children }) => (
  <>
    <p style={{ fontSize: 13, fontWeight: 600, color: C.gruen, margin: "0 0 4px" }}>{zw("Jetzt selbst üben", "Practise now")}</p>
    <h3 style={{ fontSize: 21, fontWeight: 700, color: C.tinte, margin: "0 0 4px", letterSpacing: "-0.01em" }}>{children}</h3>
  </>
);
/* Weiße Karte für ein interaktives Labor */
export function Labor({ titel, aufforderung, children }) {
  return (
    <div style={{ ...karte, marginTop: 14 }} data-labor>
      {titel && <p style={kicker}>{titel}</p>}
      {aufforderung && <Aufforderung>{aufforderung}</Aufforderung>}
      {children}
    </div>
  );
}
/* Kleiner Umschalter (Pillen) */
export function Schalter({ optionen, wert, setWert, farbe = C.see, label }) {
  return (
    <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {optionen.map(([id, t]) => {
        const an = wert === id;
        return (
          <button key={String(id)} type="button" aria-pressed={an} onClick={() => setWert(id)}
            style={{ minHeight: 36, padding: "5px 12px", borderRadius: 999, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
              border: `1.5px solid ${an ? farbe : C.linie}`, background: an ? farbe : C.weiss, color: an ? C.weiss : farbe }}>{typeof t === "string" ? <MS s={t} /> : t}</button>
        );
      })}
    </div>
  );
}

/* ---------- Einführung in drei Stufen ---------- */
const STUFEN_SPEICHER = "matheplus-einfuehrung-stufe";
const STUFEN = () => [
  { id: "einstieg", name: zw("Einstieg", "First steps"), zeile: zw("anschaulich, ohne Formeln", "visual, no formulas") },
  { id: "standard", name: zw("Standard", "Standard"), zeile: zw("wie im Unterricht", "as in class") },
  { id: "vertiefung", name: zw("Vertiefung", "Deeper"), zeile: zw("mit Begründung", "with reasons") },
];
const ladeStufe = () => { try { const s = localStorage.getItem(STUFEN_SPEICHER); return ["einstieg", "standard", "vertiefung"].includes(s) ? s : "standard"; } catch (e) { return "standard"; } };
/* Alle Einführungen der Seite folgen derselben Stufe (Ereignis zum Abgleich) */
const STUFEN_EREIGNIS = "matheplus-einfuehrung-stufe";
export function Einfuehrung({ einstieg, standard, vertiefung }) {
  const [stufe, setStufeRoh] = useState(ladeStufe);
  useEffect(() => {
    const h = (e) => setStufeRoh(e.detail);
    window.addEventListener(STUFEN_EREIGNIS, h);
    return () => window.removeEventListener(STUFEN_EREIGNIS, h);
  }, []);
  const setStufe = (s) => {
    setStufeRoh(s);
    try { localStorage.setItem(STUFEN_SPEICHER, s); } catch (e) { /* ohne Speicher */ }
    try { window.dispatchEvent(new CustomEvent(STUFEN_EREIGNIS, { detail: s })); } catch (e) { /* egal */ }
  };
  const inhalt = { einstieg, standard, vertiefung }[stufe];
  const farbe = stufe === "einstieg" ? C.smaragd : stufe === "standard" ? C.see : C.lila;
  return (
    <div style={{ marginTop: 6 }} data-einfuehrung={stufe}>
      <div role="tablist" aria-label={zw("Stufe der Einführung", "Level of the introduction")} style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, background: C.himmel, padding: 4, borderRadius: 14 }}>
        {STUFEN().map((s) => {
          const an = s.id === stufe;
          return (
            <button key={s.id} type="button" role="tab" aria-selected={an} onClick={() => setStufe(s.id)} data-stufe={s.id}
              style={{ minHeight: 48, borderRadius: 11, border: "none", cursor: "pointer", fontFamily: "inherit", padding: "6px 4px", textAlign: "center",
                background: an ? C.weiss : "transparent", boxShadow: an ? "0 2px 8px rgba(15,26,51,0.10)" : "none" }}>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: an ? C.tinte : C.see }}>{s.name}</span>
              <span style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: C.grau, lineHeight: 1.25 }}>{s.zeile}</span>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 12, paddingLeft: 14, borderLeft: `3px solid ${farbe}` }}>{inhalt}</div>
    </div>
  );
}

/* ---------- Lernweg-Seite ---------- */
export function LernwegSeite({ titel, text, kapitel, speicher }) {
  const [kap, setKapRoh] = useState(() => {
    try { const k = localStorage.getItem(speicher); return kapitel.some(([id]) => id === k) ? k : kapitel[0][0]; } catch (e) { return kapitel[0][0]; }
  });
  const oben = useRef(null);
  const erstes = useRef(true);
  const setKap = (k) => { setKapRoh(k); try { localStorage.setItem(speicher, k); } catch (e) { /* ohne Speicher */ } };
  useEffect(() => {
    if (erstes.current) { erstes.current = false; return; }
    try { oben.current?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { /* egal */ }
  }, [kap]);
  const idx = Math.max(0, kapitel.findIndex(([id]) => id === kap));
  const Inhalt = kapitel[idx][2];
  const naechstes = kapitel[idx + 1];
  return (
    <Seite titel={titel} text={text}>
      <div ref={oben} style={{ scrollMarginTop: 80 }} />
      <nav aria-label={zw("Kapitel", "Chapters")} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginTop: 4 }}>
        {kapitel.map(([id, name], i) => {
          const an = kap === id;
          return (
            <button key={id} type="button" aria-current={an ? "step" : undefined} onClick={() => setKap(id)} data-kapitel={id}
              style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 52, padding: "8px 10px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800,
                background: an ? C.flaggold : C.himmel, color: C.seeTief }}>{i + 1}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.25, hyphens: "manual", overflowWrap: "break-word", minWidth: 0 }}>{name}</span>
            </button>
          );
        })}
      </nav>
      <div key={kap}><Inhalt nr={idx + 1} von={kapitel.length} /></div>
      {naechstes && (
        <button type="button" onClick={() => setKap(naechstes[0])} data-weiter-kapitel
          style={{ width: "100%", marginTop: 26, minHeight: 56, borderRadius: 16, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", padding: "12px 18px",
            background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span>
            <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.flaggold }}>{zw(`Weiter mit Kapitel ${idx + 2}`, `On to chapter ${idx + 2}`)}</span>
            <span style={{ display: "block", fontSize: 16, fontWeight: 700 }}>{naechstes[1].replace(/­/g, "")}</span>
          </span>
          <span aria-hidden="true" style={{ fontSize: 22, color: C.flaggold }}>→</span>
        </button>
      )}
    </Seite>
  );
}

/* ---------- Übungen im Datenformat ---------- */
/* Datenschritte → Schritte für SchrittFolge (geoUi: zs / ws). gegen(ids, n) prüft Gegenbeispiele. */
export function datenSchritte(au, gegen) {
  return au.schritte.map((st) => {
    const fehler = (st.fehler || []).map((f) => ({ ...f, text: L(f.text) }));
    const o = { hinweis: st.hinweis ? L(st.hinweis) : undefined, erkl: L(st.erkl || ""), fehler };
    if (st.typ === "wahl") return ws(st.id, L(st.titel), L(st.frage), st.optionen.map(([k, t]) => [k, L(t)]), st.richtig, o);
    const s = zs(st.id, L(st.titel), L(st.text || ""), st.wert, L(st.frage), { ...o, einheit: st.einheit ? L(st.einheit) : undefined, gekuerzt: st.gekuerzt, breite: st.breite });
    if (st.gegen && gegen) {
      s.lies = (t) => {
        const v = liesZahl(t);
        if (v === null) return { warn: zw("Bitte eine Zahl eingeben.", "Please enter a number.") };
        return { wert: gegen(st.gegen, v) ? st.wert : NaN };
      };
    }
    return s;
  });
}
let zaehler = 0;
/* titel: { art: [de, en] }, erzeuge(art | null) → Aufgabe, skizze(au) → JSX | null */
export function UebenDaten({ titel, arten, erzeuge, skizze, hilfe, gegen, fertig }) {
  return (
    <UebenRahmen titel={titel} arten={arten}
      neue={(art) => ({ ...erzeuge(art || arten[Math.floor(Math.random() * arten.length)]), id: ++zaehler })}
      schritte={(au) => datenSchritte(au, gegen)}
      text={(au) => L(au.text)} skizze={skizze} hilfe={hilfe} fertig={fertig} />
  );
}

/* ---------- Zahlengerade mit Teilmengen von ℝ ----------
   mengen: [{ menge, farbe, name }] – je Menge eine Zeile; lo/hi: sichtbarer Bereich (sonst automatisch)
   punkte: [{ x, farbe, name }] zusätzliche Marken (z. B. Testpunkt) */
function grenzenVon(m, l = []) {
  if (!m) return l;
  if (m.art === "iv") { [m.lo, m.hi].forEach((g) => isFinite(g) && l.push(g)); }
  if (m.art === "ver") m.teile.forEach((t) => grenzenVon(t, l));
  if (m.art === "ohne" || m.art === "pkt") l.push(...m.pkt);
  if (m.art === "ivOhne") { grenzenVon(m.iv, l); l.push(...m.pkt); }
  return l;
}
export function MengenStrahl({ mengen = [], lo, hi, punkte = [], label, hoeheZeile = 30 }) {
  const W = 360, Lr = 16, Rr = 16;
  const alle = mengen.flatMap((m) => grenzenVon(m.menge)).concat(punkte.map((p) => p.x));
  let a = lo, b = hi;
  if (a === undefined || b === undefined) {
    const mn = alle.length ? Math.min(...alle) : -5, mx = alle.length ? Math.max(...alle) : 5;
    const rand = Math.max(2, Math.ceil((mx - mn) * 0.25));
    a = a ?? Math.floor(mn - rand); b = b ?? Math.ceil(mx + rand);
    if (b - a < 8) { const d = 8 - (b - a); a -= Math.floor(d / 2); b += Math.ceil(d / 2); }
  }
  const sx = (x) => Lr + ((Math.max(a - 0.6, Math.min(b + 0.6, x)) - a) / (b - a)) * (W - Lr - Rr);
  const zeilen = Math.max(1, mengen.length);
  const oben = 14;
  const achseY = oben + zeilen * hoeheZeile + 4;
  const H = achseY + 26;
  const schritt = b - a <= 16 ? 1 : b - a <= 34 ? 2 : 5;
  const ticks = [];
  for (let t = Math.ceil(a / schritt) * schritt; t <= b; t += schritt) ticks.push(t);
  const kreis = (x, y, zu, farbe, key) => <circle key={key} cx={sx(x)} cy={y} r="5.2" fill={zu ? farbe : C.weiss} stroke={farbe} strokeWidth="2.2" />;
  const zeichne = (m, y, farbe, k) => {
    const teile = [];
    const strecke = (x1, x2, key) => <line key={key} x1={sx(x1)} x2={sx(x2)} y1={y} y2={y} stroke={farbe} strokeWidth="6" strokeLinecap="butt" opacity="0.85" />;
    const pfeil = (rechts, key) => {
      const x = rechts ? W - Rr + 6 : Lr - 6;
      return <path key={key} d={rechts ? `M ${x - 9} ${y - 7} L ${x} ${y} L ${x - 9} ${y + 7}` : `M ${x + 9} ${y - 7} L ${x} ${y} L ${x + 9} ${y + 7}`} fill="none" stroke={farbe} strokeWidth="2.6" strokeLinejoin="round" />;
    };
    const ivZeichnen = (t, key) => {
      const l = isFinite(t.lo) ? t.lo : a - 0.6, r = isFinite(t.hi) ? t.hi : b + 0.6;
      teile.push(strecke(l, r, `${key}s`));
      if (!isFinite(t.lo)) teile.push(pfeil(false, `${key}pl`)); else teile.push(kreis(t.lo, y, t.loZu, farbe, `${key}kl`));
      if (!isFinite(t.hi)) teile.push(pfeil(true, `${key}pr`)); else teile.push(kreis(t.hi, y, t.hiZu, farbe, `${key}kr`));
    };
    if (m.art === "R") { teile.push(strecke(a - 0.6, b + 0.6, "r")); teile.push(pfeil(false, "rl"), pfeil(true, "rr")); }
    else if (m.art === "leer") teile.push(<text key="l" x={W / 2} y={y + 5} textAnchor="middle" style={{ fontSize: 15, fontWeight: 800, fill: farbe, fontFamily: SCHRIFT }}>∅</text>);
    else if (m.art === "iv") ivZeichnen(m, "i");
    else if (m.art === "ver") m.teile.forEach((t, i) => ivZeichnen(t, `v${i}`));
    else if (m.art === "ohne") { teile.push(strecke(a - 0.6, b + 0.6, "o")); teile.push(pfeil(false, "ol"), pfeil(true, "or")); m.pkt.forEach((p, i) => teile.push(kreis(p, y, false, farbe, `op${i}`))); }
    else if (m.art === "pkt") m.pkt.forEach((p, i) => teile.push(kreis(p, y, true, farbe, `pp${i}`)));
    else if (m.art === "ivOhne") { ivZeichnen(m.iv, "io"); m.pkt.forEach((p, i) => teile.push(kreis(p, y, false, farbe, `iop${i}`))); }
    return <g key={k}>{teile}</g>;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }} role="img" aria-label={label || zw("Zahlengerade", "Number line")}>
      {mengen.map((m, i) => {
        const y = oben + i * hoeheZeile + hoeheZeile / 2;
        return (
          <g key={i}>
            {m.name && <text x={Lr - 2} y={y - 9} style={{ fontSize: 11.5, fontWeight: 800, fill: m.farbe || C.see, fontFamily: SCHRIFT }}>{m.name}</text>}
            {zeichne(m.menge, y, m.farbe || C.see, `m${i}`)}
          </g>
        );
      })}
      <line x1={Lr - 8} x2={W - Rr + 8} y1={achseY} y2={achseY} stroke={C.tinte} strokeWidth="1.4" />
      <path d={`M ${W - Rr + 2} ${achseY - 5} L ${W - Rr + 9} ${achseY} L ${W - Rr + 2} ${achseY + 5}`} fill="none" stroke={C.tinte} strokeWidth="1.4" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={sx(t)} x2={sx(t)} y1={achseY - 4} y2={achseY + 4} stroke={C.tinte} strokeWidth={t === 0 ? 1.8 : 1} />
          <text x={sx(t)} y={achseY + 17} textAnchor="middle" style={{ fontSize: 10.5, fill: t === 0 ? C.tinte : C.grau, fontWeight: t === 0 ? 800 : 500, fontFamily: SCHRIFT }}>{zText(t)}</text>
        </g>
      ))}
      {punkte.map((p, i) => (
        <g key={`p${i}`}>
          <line x1={sx(p.x)} x2={sx(p.x)} y1={oben - 4} y2={achseY} stroke={p.farbe || C.flaggold} strokeWidth="1.5" strokeDasharray="3 3" />
          <path d={`M ${sx(p.x) - 6} ${oben - 10} L ${sx(p.x) + 6} ${oben - 10} L ${sx(p.x)} ${oben - 2} Z`} fill={p.farbe || C.flaggold} />
        </g>
      ))}
    </svg>
  );
}
/* Hilfsfunktion: liegt x in der Menge? (für Testpunkte in Laboren) */
export const drin = enthaelt;

/* ---------- Mengenbild (Venn) ----------
   zahlen: [{ n, a, b }] – Zahlen werden in ihren Bereich gesetzt; markiert(a, b) → Bereich hervorheben */
export function VennBild({ nameA = "A", nameB = "B", zahlen = [], markiert, farbeA = C.see, farbeB = C.gold, label }) {
  const W = 340, H = 236;
  const A = { x: 130, y: 112, r: 82 }, B = { x: 210, y: 112, r: 82 };
  const bereiche = { a: [], b: [], ab: [], k: [] };
  zahlen.forEach((z) => bereiche[z.a && z.b ? "ab" : z.a ? "a" : z.b ? "b" : "k"].push(z.n));
  const an = (r) => (markiert ? markiert(r === "a" || r === "ab", r === "b" || r === "ab") : false);
  const clipA = `vennA${nameA}${nameB}`.replace(/\W/g, ""), clipB = `vennB${nameA}${nameB}`.replace(/\W/g, "");
  const raster = (liste, cx, cy, breite, spalten) => liste.map((n, i) => {
    const zeilen = Math.ceil(liste.length / spalten);
    const sp = i % spalten, ze = Math.floor(i / spalten);
    const x = cx + (sp - (Math.min(spalten, liste.length) - 1) / 2) * (breite / spalten);
    const y = cy + (ze - (zeilen - 1) / 2) * 17;
    return <text key={n} x={x} y={y + 4} textAnchor="middle" style={{ fontSize: 12.5, fontWeight: 700, fill: C.tinte, fontFamily: SCHRIFT }}>{n}</text>;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 420, display: "block", margin: "0 auto" }} role="img" aria-label={label || zw("Mengenbild", "Venn diagram")}>
      <defs>
        <clipPath id={clipA}><circle cx={A.x} cy={A.y} r={A.r} /></clipPath>
        <clipPath id={clipB}><circle cx={B.x} cy={B.y} r={B.r} /></clipPath>
      </defs>
      <rect x="4" y="16" width={W - 8} height={H - 22} rx="14" fill={an("k") ? `${C.flaggold}30` : C.sand} stroke={C.linie} />
      <text x="16" y="34" style={{ fontSize: 12, fontWeight: 800, fill: C.grau, fontFamily: SCHRIFT }}>G</text>
      <circle cx={A.x} cy={A.y} r={A.r} fill={an("a") ? `${C.flaggold}55` : C.weiss} />
      <circle cx={B.x} cy={B.y} r={B.r} fill={an("b") ? `${C.flaggold}55` : C.weiss} />
      <g clipPath={`url(#${clipA})`}><circle cx={B.x} cy={B.y} r={B.r} fill={an("ab") ? `${C.flaggold}88` : `${C.himmel}`} clipPath={`url(#${clipB})`} /></g>
      <circle cx={A.x} cy={A.y} r={A.r} fill="none" stroke={farbeA} strokeWidth="2.4" />
      <circle cx={B.x} cy={B.y} r={B.r} fill="none" stroke={farbeB} strokeWidth="2.4" />
      <text x={A.x - A.r - 2} y={A.y - 52} textAnchor="end" style={{ fontSize: 15, fontWeight: 800, fill: farbeA, fontFamily: SCHRIFT }}>{nameA}</text>
      <text x={B.x + B.r + 2} y={B.y - 52} style={{ fontSize: 15, fontWeight: 800, fill: farbeB, fontFamily: SCHRIFT }}>{nameB}</text>
      {raster(bereiche.a, A.x - 38, A.y, 64, 3)}
      {raster(bereiche.ab, (A.x + B.x) / 2, A.y, 36, 2)}
      {raster(bereiche.b, B.x + 38, B.y, 64, 3)}
      {raster(bereiche.k, W / 2, H - 14, 300, 12)}
    </svg>
  );
}
