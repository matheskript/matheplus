/* ============================================================
   MATHE ABI MASTERCLASS – KURSBEREICH FÜR TEILNEHMER
   (ansicht "mckurs", Pfad /masterclass/kurs; Zugang: ansicht "mczugang", /masterclass/zugang?z=…)

   Bauweise wie der Kurs Differentialrechnung (funcDiffKurs.jsx): Übersicht mit Fortschritt,
   ein Modul je Videolektion, darunter die passenden Werkzeuge als Pop-up-Fenster.
   Dazu für Teilnehmer: Freischaltungen, Live-Termine, Auftrag bis zum nächsten Call,
   Mindset-Impuls und „Mathilda zu dieser Lektion fragen“.

   Inhalte: masterclassDaten.js (die zehn Videos sind Platzhalter).
   Zugang:  masterclassZugang.js + masterclassToken.js, Datenbank supabase/masterclass.sql.
   Fortschritt liegt im localStorage dieses Geräts (mm_masterclass).
   ============================================================ */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { WERKZEUGE } from "./werkzeuge.js";
import { ChunkGrenze } from "./chunkSchutz.jsx";
import { WZ_SEITEN, Laden } from "./funcWerkzeugSeite.jsx";
import { springe } from "./sprung.js";
import { useKonto } from "./konto.js";
import { ExternSchutz } from "./funcExtern.jsx";
import { MathildaChatModal } from "./funcMathildaChat.jsx";
import { KURS_WERKZEUGE as DIFF } from "./funcDiffKurs.jsx";
import { KURS_WERKZEUGE as VEK } from "./funcVekKurs.jsx";
import {
  MC_MONATE, MC_VIDEOS, MC_FREISCHALTUNGEN, MC_LIVE, MC_WERKZEUG_QUELLEN,
  dauerText, gesamtMinuten, istEcht, modulFertig, modulAnteil, naechstesModul, videoNummer,
} from "./masterclassDaten.js";
import {
  masterclassStatus, zugangAbonnieren, gemerkterLink, linkPruefen, linkSpeichern, einloesen,
  vorschauSetzen, VORSCHAU_PASSWORT,
} from "./masterclassZugang.js";
import { tokenAnzeige } from "./masterclassToken.js";

/* ---------- Farben ---------- */
const K = {
  nacht: "#06102A", navy: "#0B1E4A", blau: C.see, gold: C.flaggold, warm: C.goldWarm, goldText: "#8A6A00",
  hell: "#FFF8E1", weiss: C.weiss, tinte: C.tinte, grau: C.grau, linie: C.linie, sand: C.sand,
};
const GOLD = "linear-gradient(150deg, #FFE9A0 0%, #F4CE4A 28%, #EDBB00 55%, #D9A520 78%, #B58612 100%)";
const NACHT = `linear-gradient(165deg, ${K.nacht} 0%, ${K.navy} 55%, #12306E 100%)`;

/* ---------- Werkzeuge ---------- */
const seiteWz = (id) => {
  const w = WERKZEUGE[id] || {};
  const s = WZ_SEITEN[id] || {};
  return { titel: w.name || s.titel || id, zeile: w.zeile || "", zeichen: w.zeichen || "∑", ansicht: id, breit: true,
    render: ({ gehe }) => { const S = WZ_SEITEN[id].Komp; return <S gehe={gehe} ansicht={id} />; } };
};
export const MC_WERKZEUGE = Object.fromEntries(Object.entries(MC_WERKZEUG_QUELLEN).map(([id, q]) => {
  if (q.quelle === "diff") return [id, DIFF[id]];
  if (q.quelle === "vek") return [id, VEK[id]];
  if (q.quelle === "seite") return [id, seiteWz(id)];
  return [id, { ...q }];
}).filter(([, w]) => !!w));

/* ---------- Fortschritt ---------- */
const SPEICHER = "mm_masterclass";
const standLesen = () => { try { return { gesehen: {}, auftrag: {}, ...JSON.parse(localStorage.getItem(SPEICHER) || "{}") }; } catch (e) { return { gesehen: {}, auftrag: {} }; } };
const standSchreiben = (s) => { try { localStorage.setItem(SPEICHER, JSON.stringify(s)); } catch (e) { /* privat */ } };
const nachOben = () => springe("masterclass-modul", () => window.scrollTo({ top: 0, behavior: "auto" }));

function useZugang() {
  const konto = useKonto();
  const [, setN] = useState(0);
  useEffect(() => zugangAbonnieren(() => setN((n) => n + 1)), []);
  return { konto, status: masterclassStatus(konto) };
}

const datum = (d) => { try { return new Date(d).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return ""; } };

/* ---------- Kleine Bausteine ---------- */
function Treppe({ hell }) {
  const f = hell ? K.gold : K.navy;
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" style={{ width: "100%", height: "100%", display: "block" }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={14 + i * 29} y={186 - (i + 1) * 27} width="29" height={(i + 1) * 27} rx="3" fill={f} opacity={0.1 + i * 0.07} />
      ))}
      <path d={`M 14 186 ${[0, 1, 2, 3, 4, 5].map((i) => `L ${14 + i * 29} ${186 - (i + 1) * 27} L ${43 + i * 29} ${186 - (i + 1) * 27}`).join(" ")}`}
        stroke={f} strokeWidth="3.5" fill="none" strokeLinejoin="round" />
      <path d="M 176 6 l 5.6 11.4 l 12.6 1.8 l -9.1 8.9 l 2.1 12.5 l -11.2 -5.9 l -11.2 5.9 l 2.1 -12.5 l -9.1 -8.9 l 12.6 -1.8 z" fill={K.gold} stroke={hell ? "none" : K.navy} strokeWidth="2" />
    </svg>
  );
}

function Haken({ an, gross }) {
  const g = gross ? 26 : 22;
  return (
    <span aria-hidden="true" style={{ display: "inline-flex", width: g, height: g, borderRadius: g / 2, flex: "none", alignItems: "center", justifyContent: "center",
      background: an ? GOLD : "transparent", border: an ? "none" : `1.5px solid ${K.linie}`, boxShadow: an ? "0 2px 6px rgba(181,134,18,0.35)" : "none" }}>
      {an && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2l2.4 2.4 4.6-5" stroke={K.navy} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </span>
  );
}

function Ring({ anteil, groesse = 40, text }) {
  const r = (groesse - 6) / 2, u = 2 * Math.PI * r;
  return (
    <span style={{ position: "relative", width: groesse, height: groesse, flex: "none", display: "inline-block" }}>
      <svg width={groesse} height={groesse} aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={groesse / 2} cy={groesse / 2} r={r} stroke={K.linie} strokeWidth="4" fill="none" />
        <circle cx={groesse / 2} cy={groesse / 2} r={r} stroke={K.gold} strokeWidth="4" fill="none" strokeLinecap="round"
          strokeDasharray={u} strokeDashoffset={u * (1 - anteil)} style={{ transition: "stroke-dashoffset .4s" }} />
      </svg>
      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 800, color: K.navy }}>{text}</span>
    </span>
  );
}

function Kicker({ children, hell }) {
  return <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.16em", color: hell ? K.gold : K.goldText, margin: "0 0 6px" }}>{children}</p>;
}

function Knopf({ children, onClick, art = "gold", breit, ...rest }) {
  const stile = {
    gold: { background: GOLD, color: K.navy, border: "none", boxShadow: "0 6px 18px rgba(181,134,18,0.35)" },
    navy: { background: K.navy, color: K.weiss, border: "none" },
    rand: { background: K.weiss, color: K.navy, border: `1.5px solid ${K.linie}` },
    glas: { background: "rgba(255,255,255,0.1)", color: K.weiss, border: "1px solid rgba(255,255,255,0.25)" },
  };
  return (
    <button type="button" onClick={onClick} {...rest}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 46, padding: "0 20px", borderRadius: 999, cursor: "pointer",
        fontFamily: "inherit", fontWeight: 800, fontSize: 14.5, width: breit ? "100%" : undefined, ...stile[art], ...(rest.style || {}) }}>
      {children}
    </button>
  );
}

/* Motiv je Monat für die Video-Poster */
function Motiv({ monat }) {
  const s = { stroke: K.gold, strokeWidth: 3, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "62%", opacity: 0.9 }}>
      {monat === 1 && <><path d="M30 70 L60 70 L60 50 L90 50 L90 30 L120 30 L120 12" {...s} /><path d="M40 82h90" {...s} strokeWidth="1.5" opacity="0.4" /></>}
      {monat === 2 && <><path d="M8 78 C 40 78, 52 14, 84 22 S 128 70, 156 12" {...s} /><path d="M58 52 L120 6" {...s} strokeWidth="2" stroke="#fff" opacity="0.7" /><circle cx="84" cy="22" r="4" fill={K.gold} /></>}
      {monat === 3 && <><path d="M20 78 C 60 78, 80 20, 150 18" {...s} /><path d="M50 78 L50 66 M65 78 L65 52 M80 78 L80 38 M95 78 L95 30 M110 78 L110 25 M125 78 L125 21" {...s} strokeWidth="2" opacity="0.6" /></>}
      {monat === 4 && <><path d="M40 70 L110 70 L140 40 L70 40 Z" {...s} strokeWidth="2" opacity="0.7" /><path d="M90 55 L90 12" {...s} /><path d="M84 20 L90 12 L96 20" {...s} /><path d="M30 80 L150 30" stroke="#fff" strokeWidth="2" opacity="0.6" /></>}
      {monat === 5 && <><path d="M10 80 C 50 80, 60 14, 85 14 S 120 80, 158 80" {...s} />{[30, 45, 60, 75, 90, 105, 120].map((x, i) => <rect key={x} x={x} y={80 - [6, 18, 40, 62, 44, 20, 7][i]} width="11" height={[6, 18, 40, 62, 44, 20, 7][i]} fill={K.gold} opacity="0.25" />)}</>}
      {monat === 6 && <><path d="M86 8 l 9 18 l 20 3 l -14.5 14 l 3.4 20 l -17.9 -9.4 l -17.9 9.4 l 3.4 -20 l -14.5 -14 l 20 -3 z" {...s} /><path d="M40 84h96" {...s} strokeWidth="1.5" opacity="0.4" /></>}
    </svg>
  );
}

function Poster({ v, kompakt, ohneTitel }) {
  const n = videoNummer(v.id);
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: kompakt ? 12 : 18, overflow: "hidden", background: NACHT, color: K.weiss }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 85% 10%, rgba(237,187,0,0.18) 0%, transparent 60%)" }} />
      <Motiv monat={v.monat} />
      <span aria-hidden="true" style={{ position: "absolute", left: kompakt ? 10 : 18, top: kompakt ? 4 : 10, fontSize: kompakt ? 34 : "clamp(48px, 13vw, 76px)", fontWeight: 800, letterSpacing: "-0.05em",
        color: "transparent", WebkitTextStroke: `1.5px ${K.gold}`, lineHeight: 1 }}>{String(n).padStart(2, "0")}</span>
      {!kompakt && !ohneTitel && (
        <p style={{ position: "absolute", left: 18, right: "38%", bottom: 16, margin: 0, fontSize: "clamp(16px, 4.6vw, 22px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em" }}>{v.titel}</p>
      )}
      <span style={{ position: "absolute", right: kompakt ? 6 : 12, bottom: kompakt ? 6 : 12, fontSize: kompakt ? 10.5 : 12, fontWeight: 700, background: "rgba(6,16,42,0.75)", padding: "3px 7px", borderRadius: 6 }}>{dauerText(v.dauer)}</span>
      {!istEcht(v) && !kompakt && (
        <span style={{ position: "absolute", right: 12, top: 12, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", background: K.gold, color: K.navy, padding: "3px 7px", borderRadius: 999 }}>VIDEO FOLGT</span>
      )}
    </div>
  );
}

/* ---------- Video-Bühne ---------- */
function VideoBuehne({ v, gesehen, onGesehen }) {
  const [t, setT] = useState(0);
  const [laeuft, setLaeuft] = useState(false);
  const [gestartet, setGestartet] = useState(false);
  const ref = useRef(null);
  const tempo = v.dauer / 24;   // Platzhalter-Vorschau: ganze Lektion in etwa 24 Sekunden
  useEffect(() => {
    if (!laeuft) return undefined;
    const id = setInterval(() => {
      setT((alt) => {
        const neu = alt + tempo * 0.1;
        if (neu >= v.dauer) { setLaeuft(false); onGesehen(); return v.dauer; }
        return neu;
      });
    }, 100);
    return () => clearInterval(id);
  }, [laeuft]);   // eslint-disable-line react-hooks/exhaustive-deps

  if (istEcht(v)) {
    const quelle = v.video.youtube
      ? { dienst: "youtube", src: `https://www.youtube-nocookie.com/embed/${v.video.youtube}?rel=0` }
      : { dienst: "bunny", src: `https://iframe.mediadelivery.net/embed/${v.video.bunny}?autoplay=false&preload=true&responsive=true` };
    return (
      <div>
        <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 18, overflow: "hidden", background: K.nacht }}>
          <ExternSchutz dienst={quelle.dienst}>
            <iframe title={v.titel} src={quelle.src} allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
          </ExternSchutz>
        </div>
        {!gesehen && <div style={{ marginTop: 10 }}><Knopf art="rand" onClick={onGesehen}>Als gesehen markieren</Knopf></div>}
      </div>
    );
  }

  const idx = v.marken.reduce((a, m, i) => (t >= m[0] ? i : a), 0);
  const springen = (s) => { setT(s); setGestartet(true); };
  return (
    <div ref={ref}>
      <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", boxShadow: "0 16px 40px rgba(6,16,42,0.35)" }}>
        <Poster v={v} ohneTitel={gestartet} />
        {gestartet && (
          <div aria-live="polite" style={{ position: "absolute", inset: 0, background: "rgba(6,16,42,0.82)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 22px", color: K.weiss }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", color: K.gold, margin: 0 }}>KAPITEL {idx + 1} VON {v.marken.length}</p>
            <p key={idx} className="mck-einblenden" style={{ fontSize: "clamp(18px, 5.2vw, 26px)", fontWeight: 800, lineHeight: 1.2, margin: "6px 0 0", maxWidth: 460 }}>{v.marken[idx][1]}</p>
            <p style={{ fontSize: 12, color: "#C9D6EE", margin: "10px 0 0" }}>Platzhalter-Vorschau · das echte Video folgt</p>
          </div>
        )}
        <button type="button" onClick={() => { if (t >= v.dauer) setT(0); setGestartet(true); setLaeuft(!laeuft); }}
          aria-label={laeuft ? "Pause" : "Abspielen"}
          style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 68, height: 68, borderRadius: 34, border: "none", cursor: "pointer",
            background: GOLD, boxShadow: "0 8px 26px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: laeuft ? 0 : 1, transition: "opacity .2s" }}
          className="mck-play">
          {laeuft
            ? <svg width="22" height="22" viewBox="0 0 22 22"><rect x="4" y="3" width="5" height="16" rx="1.5" fill={K.navy} /><rect x="13" y="3" width="5" height="16" rx="1.5" fill={K.navy} /></svg>
            : <svg width="22" height="24" viewBox="0 0 22 24" style={{ marginLeft: 4 }}><path d="M2 2 L20 12 L2 22 Z" fill={K.navy} /></svg>}
        </button>
      </div>

      {/* Zeitleiste mit Kapitelmarken */}
      <div style={{ marginTop: 12 }}>
        <div style={{ position: "relative", height: 8, borderRadius: 4, background: K.linie, cursor: "pointer" }}
          onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); springen(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * v.dauer); }}
          role="slider" aria-label="Position im Video" aria-valuemin={0} aria-valuemax={v.dauer} aria-valuenow={Math.round(t)} tabIndex={0}
          onKeyDown={(e) => { if (e.key === "ArrowRight") springen(Math.min(v.dauer, t + 30)); if (e.key === "ArrowLeft") springen(Math.max(0, t - 30)); }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(t / v.dauer) * 100}%`, background: GOLD, borderRadius: 4 }} />
          {v.marken.slice(1).map(([s]) => <span key={s} style={{ position: "absolute", left: `${(s / v.dauer) * 100}%`, top: -2, width: 2, height: 12, background: K.navy, opacity: 0.5 }} />)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: K.grau, marginTop: 6, fontWeight: 600 }}>
          <span>{dauerText(Math.round(t))}</span><span>{dauerText(v.dauer)}</span>
        </div>
      </div>

      {/* Kapitel */}
      <div style={{ marginTop: 8, display: "grid", gap: 2 }}>
        {v.marken.map(([s, titel], i) => (
          <button key={s} type="button" onClick={() => springen(s)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 10px", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
              background: gestartet && i === idx ? K.hell : "transparent" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: K.goldText, minWidth: 40, fontVariantNumeric: "tabular-nums" }}>{dauerText(s)}</span>
            <span style={{ fontSize: 14, fontWeight: gestartet && i === idx ? 700 : 500, color: K.tinte }}>{titel}</span>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {gesehen
          ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: K.goldText }}><Haken an /> Gesehen</span>
          : <Knopf art="rand" onClick={onGesehen}>Als gesehen markieren</Knopf>}
      </div>
    </div>
  );
}

/* ---------- Werkzeug-Karte und Fenster ---------- */
function WerkzeugKachel({ w, onClick }) {
  const link = w.quelle === "link";
  return (
    <button type="button" onClick={onClick} className="mck-wz"
      style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "14px", borderRadius: 16, cursor: "pointer", textAlign: "left", fontFamily: "inherit",
        background: K.weiss, border: `1px solid ${K.linie}`, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
      <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", width: 46, height: 46, borderRadius: 13,
        background: NACHT, color: K.gold, fontWeight: 700, fontSize: (w.zeichen || "").length > 4 ? 11.5 : 15, fontStyle: "italic" }}>{w.zeichen}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontWeight: 700, fontSize: 15, color: K.tinte, lineHeight: 1.3 }}>{w.titel}</span>
        {w.zeile && <span style={{ display: "block", fontSize: 12.5, color: K.grau, marginTop: 2 }}>{w.zeile}</span>}
      </span>
      <span style={{ flex: "none", fontSize: 12, fontWeight: 800, color: K.goldText, whiteSpace: "nowrap" }}>{link ? "Öffnen ↗" : "Üben →"}</span>
    </button>
  );
}

function WerkzeugFenster({ w, v, gehe, schliessen }) {
  const zuKnopf = useRef(null);
  useEffect(() => {
    const alt = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const taste = (e) => { if (e.key === "Escape") schliessen(); };
    window.addEventListener("keydown", taste);
    if (zuKnopf.current) zuKnopf.current.focus({ preventScroll: true });
    return () => { document.body.style.overflow = alt; window.removeEventListener("keydown", taste); };
  }, [schliessen]);
  return (
    <div className="mck-fenster-hg" onMouseDown={(e) => { if (e.target === e.currentTarget) schliessen(); }}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(6,16,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12, boxSizing: "border-box" }}>
      <div className="mck-fenster" role="dialog" aria-modal="true" aria-label={w.titel}
        style={{ width: "min(100%, 880px)", maxHeight: "calc(100dvh - 24px)", display: "flex", flexDirection: "column", borderRadius: 20, border: `2px solid ${K.gold}`,
          background: K.sand, overflow: "hidden", boxShadow: "0 24px 70px rgba(6,16,42,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: NACHT, color: K.weiss, flex: "none" }}>
          <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 11, background: GOLD, color: K.navy, fontWeight: 800, fontStyle: "italic", fontSize: (w.zeichen || "").length > 4 ? 11 : 15 }}>{w.zeichen}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.14em", color: K.gold, margin: 0 }}>MASTERCLASS · LEKTION {videoNummer(v.id)}</p>
            <p style={{ fontSize: 16, fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.titel}</p>
          </div>
          <button ref={zuKnopf} type="button" onClick={schliessen} aria-label="Werkzeug schließen"
            style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: K.weiss, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", padding: w.schmal ? "8px 0 24px" : "4px 0 24px" }}>
          <ChunkGrenze>
            <React.Suspense fallback={<Laden />}>
              {w.schmal
                ? <div className="mx-auto px-6" style={{ maxWidth: 620, paddingTop: 16 }}>{w.render({ gehe, zu: schliessen })}</div>
                : w.render({ gehe, zu: schliessen })}
            </React.Suspense>
          </ChunkGrenze>
        </div>
      </div>
    </div>
  );
}

/* ---------- Kopf ---------- */
function Kopf({ status, untertitel, gehe }) {
  const vorname = status.name ? String(status.name).split(" ")[0] : null;
  return (
    <div style={{ background: NACHT, color: K.weiss, position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 100% 0%, rgba(237,187,0,0.22) 0%, transparent 60%)" }} />
      <div aria-hidden="true" className="mck-kopfbild" style={{ position: "absolute", right: 16, top: 26, width: 150, height: 150, opacity: 0.9 }}><Treppe hell /></div>
      <div className="held mx-auto px-6 pt-10 pb-5" style={{ maxWidth: 620, position: "relative" }}>
        {gehe && (
          <button type="button" onClick={() => gehe({ ansicht: "abi" })} data-mck-zur-masterclass
            style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 38, padding: "0 14px 0 10px", margin: "-18px 0 16px -6px", border: "none", borderRadius: 999, background: "rgba(237,187,0,0.14)", color: GOLD, font: "inherit", fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}>
            ← Plan, Abi-Aufgaben, Mia
          </button>
        )}
        <Kicker hell>{status.vorschau ? "VORSCHAU · KURSBEREICH" : "DEIN KURSBEREICH"}</Kicker>
        <h1 style={{ fontWeight: 800, fontSize: "clamp(28px, 8vw, 40px)", letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0,
          background: "linear-gradient(180deg, #FFF 0%, #E3E8EF 45%, #B9C2CE 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Mathe-Abi-<br />Masterclass
        </h1>
        <div style={{ width: 54, height: 4, background: GOLD, borderRadius: 2, marginTop: 16, marginBottom: 14 }} />
        <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.6, margin: 0, maxWidth: 400 }}>
          {vorname ? <><b style={{ color: K.weiss, fontWeight: 700 }}>Hallo {vorname}!</b> </> : null}{untertitel}
        </p>
      </div>
      <div style={{ height: 24, background: K.sand, borderRadius: "20px 20px 0 0", position: "relative" }} />
      <style>{`@media (max-width:520px){.mck-kopfbild{width:96px !important;height:96px !important;top:18px !important;opacity:.55 !important}}`}</style>
    </div>
  );
}

/* ---------- Hinweise zum Zugang (oben in der Übersicht) ---------- */
function ZugangsHinweis({ status, gehe }) {
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState("");
  if (status.vorschau) {
    return (
      <div style={{ ...karte, borderLeft: `4px solid ${K.gold}`, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontSize: 13.5, color: K.tinte, lineHeight: 1.55 }}><b>Vorschau-Modus.</b> So sehen Teilnehmer ihren Kursbereich.</p>
        <Knopf art="rand" onClick={() => vorschauSetzen(false)}>Vorschau beenden</Knopf>
      </div>
    );
  }
  if (status.imKonto) return null;
  if (!status.angemeldet) {
    return (
      <div style={{ ...karte, background: K.hell, border: `1px solid #F1D98A` }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: K.navy }}>Noch ein Schritt: Konto verbinden</p>
        <p style={{ margin: "4px 0 12px", fontSize: 13.5, color: K.grau, lineHeight: 1.55 }}>
          Der Kurs ist auf diesem Gerät offen. Mit Konto wird dein Zugang dauerhaft gespeichert, MathildaAI ohne Tageslimit freigeschaltet und dein Fortschritt gesichert.
        </p>
        <Knopf onClick={() => gehe({ ansicht: "konto" })}>Anmelden oder Konto anlegen</Knopf>
      </div>
    );
  }
  if (status.wartetAufEinloesen) {
    return (
      <div style={{ ...karte, background: K.hell, border: `1px solid #F1D98A` }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: K.navy }}>Zugang mit deinem Konto verbinden</p>
        <p style={{ margin: "4px 0 12px", fontSize: 13.5, color: K.grau, lineHeight: 1.55 }}>Code {tokenAnzeige(status.token)} – danach ist alles in deinem Konto freigeschaltet.</p>
        <Knopf disabled={laedt} onClick={async () => { setLaedt(true); setFehler(""); try { await einloesen(status.token); } catch (e) { setFehler(e.message); } setLaedt(false); }}>
          {laedt ? "Wird verbunden …" : "Jetzt verbinden"}
        </Knopf>
        {fehler && <p role="alert" style={{ color: "#B42318", fontSize: 13, margin: "10px 0 0" }}>{fehler}</p>}
      </div>
    );
  }
  return null;
}

const karte = { background: K.weiss, border: `1px solid ${K.linie}`, borderRadius: 18, padding: "16px 16px", boxShadow: "0 2px 14px rgba(15,26,51,0.06)", marginBottom: 14 };

/* ---------- Übersicht ---------- */
function Uebersicht({ stand, oeffnen, status, gehe }) {
  const zahl = MC_VIDEOS.filter((v) => modulFertig(v, stand)).length;
  const weiter = naechstesModul(stand);
  return (
    <div className="mx-auto px-4 pb-16" style={{ maxWidth: 760 }}>
      <ZugangsHinweis status={status} gehe={gehe} />

      {/* Fortschritt */}
      <div style={{ background: NACHT, color: K.weiss, borderRadius: 20, padding: "18px 18px 16px", marginBottom: 22, boxShadow: "0 10px 30px rgba(6,16,42,0.3)", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 90% at 100% 0%, rgba(237,187,0,0.16), transparent 60%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", color: K.gold, margin: 0 }}>DEIN FORTSCHRITT</p>
            <p style={{ fontSize: 13, color: "#C9D6EE", margin: 0 }}><b style={{ color: K.weiss, fontSize: 18 }}>{zahl}</b> von {MC_VIDEOS.length} Lektionen</p>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.14)", marginTop: 10, overflow: "hidden" }} role="progressbar" aria-valuemin={0} aria-valuemax={MC_VIDEOS.length} aria-valuenow={zahl}>
            <div style={{ height: "100%", width: `${(zahl / MC_VIDEOS.length) * 100}%`, background: GOLD, borderRadius: 4, transition: "width .3s" }} />
          </div>
          <button type="button" onClick={() => oeffnen(weiter.id)}
            style={{ marginTop: 14, width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px 10px 10px", borderRadius: 14, border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.08)", color: K.weiss, fontFamily: "inherit", textAlign: "left" }}>
            <span style={{ width: 92, flex: "none" }}><Poster v={weiter} kompakt /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: K.gold }}>{zahl === 0 ? "JETZT STARTEN" : "WEITER MIT"}</span>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{videoNummer(weiter.id)}. {weiter.titel}</span>
            </span>
            <span aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 18, background: GOLD, color: K.navy, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", fontWeight: 800 }}>▶</span>
          </button>
        </div>
      </div>

      {/* Freischaltungen */}
      <Kicker>FÜR DICH FREIGESCHALTET</Kicker>
      <div className="mck-frei" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginBottom: 24 }}>
        {MC_FREISCHALTUNGEN.map((f) => (
          <button key={f.id} type="button" disabled={!f.ziel} onClick={() => (f.ziel ? gehe(f.ziel) : oeffnen(weiter.id))}
            style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px", borderRadius: 14, border: `1px solid ${K.linie}`, background: K.weiss, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
            <Haken an />
            <span style={{ minWidth: 0 }}>
              <span lang="de" style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: K.tinte, lineHeight: 1.3, hyphens: "auto", overflowWrap: "anywhere" }}>{f.titel}</span>
              <span style={{ display: "block", fontSize: 12, color: K.grau, marginTop: 2, lineHeight: 1.4 }}>{f.zeile}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Live */}
      <Kicker>LIVE MIT BASTI</Kicker>
      <div style={{ ...karte, padding: "6px 16px", marginBottom: 26 }}>
        {MC_LIVE.map((l, i) => (
          <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < MC_LIVE.length - 1 ? `1px solid ${K.linie}` : "none" }}>
            <span aria-hidden="true" style={{ width: 10, height: 10, transform: "rotate(45deg)", background: K.gold, border: `1px solid ${K.navy}`, flex: "none" }} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: K.tinte }}>{l.titel}</span>
              <span style={{ display: "block", fontSize: 12.5, color: K.grau }}>{l.wann}</span>
            </span>
            {l.platzhalter && <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", color: K.goldText, background: K.hell, padding: "3px 8px", borderRadius: 999 }}>BEISPIEL</span>}
          </div>
        ))}
      </div>

      {/* Lektionen nach Monaten */}
      {MC_MONATE.map((m) => {
        const videos = MC_VIDEOS.filter((v) => v.monat === m.id);
        return (
          <section key={m.id} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 4px 10px" }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: K.gold, background: K.navy, padding: "4px 9px", borderRadius: 6 }}>MONAT {m.id}</span>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: K.navy, margin: 0 }}>{m.titel}</h2>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {videos.map((v) => {
                const a = modulAnteil(v, stand);
                return (
                  <button key={v.id} type="button" onClick={() => oeffnen(v.id)} className="mck-modul"
                    style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: 10, borderRadius: 16, cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                      background: K.weiss, border: `1px solid ${a === 1 ? "#E9CF7A" : K.linie}`, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
                    <span style={{ width: "clamp(96px, 28vw, 150px)", flex: "none" }}><Poster v={v} kompakt /></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontWeight: 700, fontSize: 15, color: K.tinte, lineHeight: 1.3 }}>{v.titel}</span>
                      <span className="mck-frage" style={{ display: "block", fontSize: 12.5, color: K.grau, marginTop: 3, lineHeight: 1.45 }}>{v.frage}</span>
                    </span>
                    {a === 1 ? <Haken an gross /> : <Ring anteil={a} groesse={38} text={a > 0 ? `${Math.round(a * 100)}` : ""} />}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
      <p style={{ fontSize: 12.5, color: K.grau, textAlign: "center", margin: "8px 0 0" }}>{MC_VIDEOS.length} Lektionen · rund {gesamtMinuten()} Minuten Video · {status.bis ? `Zugang bis ${datum(status.bis)}` : "sechs Monate"}</p>
      <style>{`.mck-modul,.mck-wz{transition:transform .15s ease, box-shadow .15s ease}
        @media (hover:hover){.mck-modul:hover,.mck-wz:hover{transform:translateY(-1px);box-shadow:0 8px 22px rgba(15,26,51,0.10)}}
        @media (max-width:420px){.mck-frage{display:none !important}}
        @media (min-width:700px){.mck-frei{grid-template-columns:repeat(3, minmax(0, 1fr)) !important}}`}</style>
    </div>
  );
}

/* ---------- Modul (eine Lektion) ---------- */
function Abschnitt({ kicker, titel, children }) {
  return (
    <section style={{ marginTop: 28 }}>
      <Kicker>{kicker}</Kicker>
      {titel && <h3 style={{ fontSize: 19, fontWeight: 800, color: K.navy, margin: "0 0 12px", letterSpacing: "-0.01em" }}>{titel}</h3>}
      {children}
    </section>
  );
}

function Modul({ v, stand, setStand, oeffnen, zurUebersicht, gehe }) {
  const [offen, setOffen] = useState(null);
  const [chat, setChat] = useState(false);
  const i = MC_VIDEOS.indexOf(v);
  const naechstes = MC_VIDEOS[i + 1], voriges = MC_VIDEOS[i - 1];
  const monat = MC_MONATE.find((m) => m.id === v.monat);
  const auftrag = (stand.auftrag && stand.auftrag[v.id]) || [];
  const aendern = (f) => setStand((s) => { const neu = f(s); standSchreiben(neu); return neu; });
  const gesehen = !!stand.gesehen[v.id];
  const fertig = modulFertig(v, stand);
  const werkzeug = (id) => {
    const w = MC_WERKZEUGE[id];
    if (w.quelle === "link") gehe(w.ziel); else setOffen(id);
  };
  const w = offen ? MC_WERKZEUGE[offen] : null;
  const aufgabe = useMemo(() => ({ text: `Masterclass, Monat ${v.monat} (${monat.titel}), Lektion ${i + 1}: „${v.titel}“. Leitfrage: ${v.frage} Lernziele: ${v.lernziele.join(" ")}` }), [v.id]);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto px-5 pb-16" style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.14em", lineHeight: 1.5, color: K.goldText, margin: "2px 0 0" }}>
          <span style={{ display: "block" }}>MONAT {v.monat} · {monat.titel.toUpperCase()}</span>
          <span style={{ display: "block" }}>LEKTION {i + 1} VON {MC_VIDEOS.length}</span>
        </p>
        <button type="button" onClick={zurUebersicht}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px 8px 8px", borderRadius: 10, border: `1px solid ${K.linie}`, background: K.weiss,
            color: K.navy, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
          <span aria-hidden="true">←</span> Alle Lektionen
        </button>
      </div>
      <h2 style={{ fontSize: "clamp(23px, 6.4vw, 30px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15, color: K.navy, margin: "10px 0 6px" }}>{v.titel}</h2>
      <p style={{ fontSize: 15.5, fontStyle: "italic", color: "#2B3A4F", margin: "0 0 16px", lineHeight: 1.5 }}>{v.frage}</p>

      <VideoBuehne key={v.id} v={v} gesehen={gesehen} onGesehen={() => aendern((s) => ({ ...s, gesehen: { ...s.gesehen, [v.id]: true } }))} />

      <Abschnitt kicker="IN DIESER LEKTION" titel="Das kannst du danach">
        <div style={{ ...karte, padding: "4px 16px" }}>
          {v.lernziele.map((z, k) => (
            <div key={z} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: k < v.lernziele.length - 1 ? `1px solid ${K.linie}` : "none" }}>
              <span style={{ flex: "none", width: 24, height: 24, borderRadius: 12, background: K.navy, color: K.gold, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{k + 1}</span>
              <span style={{ fontSize: 14.5, color: K.tinte, lineHeight: 1.55 }}>{z}</span>
            </div>
          ))}
        </div>
      </Abschnitt>

      <Abschnitt kicker="TRAINIEREN" titel="Deine Werkzeuge zu dieser Lektion">
        <div style={{ display: "grid", gap: 10 }}>
          {v.werkzeuge.filter((id) => MC_WERKZEUGE[id]).map((id) => (
            <WerkzeugKachel key={id} w={{ ...MC_WERKZEUGE[id], quelle: MC_WERKZEUG_QUELLEN[id].quelle }} onClick={() => werkzeug(id)} />
          ))}
        </div>
      </Abschnitt>

      <Abschnitt kicker="BIS ZUM NÄCHSTEN CALL" titel="Dein Auftrag">
        <div style={{ ...karte, padding: "4px 6px" }}>
          {v.auftrag.map((a, k) => {
            const an = !!auftrag[k];
            return (
              <label key={a} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 10px", borderBottom: k < v.auftrag.length - 1 ? `1px solid ${K.linie}` : "none", cursor: "pointer" }}>
                <input type="checkbox" checked={an} className="mck-check"
                  onChange={() => aendern((s) => { const l = [...((s.auftrag && s.auftrag[v.id]) || [])]; l[k] = !an; return { ...s, auftrag: { ...s.auftrag, [v.id]: l } }; })} />
                <Haken an={an} />
                <span style={{ fontSize: 14.5, color: an ? K.grau : K.tinte, textDecoration: an ? "line-through" : "none", lineHeight: 1.5 }}>{a}</span>
              </label>
            );
          })}
        </div>
        {fertig && <p role="status" style={{ fontSize: 14, fontWeight: 700, color: K.goldText, margin: "4px 4px 0" }}>Lektion geschafft. Stark!</p>}
      </Abschnitt>

      <Abschnitt kicker="MINDSET">
        <div style={{ borderRadius: 18, padding: "18px 18px", background: GOLD, color: K.navy, boxShadow: "0 10px 28px rgba(181,134,18,0.3)" }}>
          <p style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{v.mindset.titel}</p>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "6px 0 0", color: "#1B2A4F" }}>{v.mindset.text}</p>
        </div>
      </Abschnitt>

      <Abschnitt kicker="MATHILDAAI" titel="Frag Mathilda zu dieser Lektion">
        <div style={{ background: NACHT, color: K.weiss, borderRadius: 18, padding: 18 }}>
          <p style={{ fontSize: 14, color: "#C9D6EE", lineHeight: 1.6, margin: "0 0 10px" }}>Mathilda kennt die Lektion und fragt zurück, bevor sie etwas verrät. Ein Einstieg zum Abschreiben:</p>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "0 0 14px", padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.07)", borderLeft: `3px solid ${K.gold}` }}>{v.mathilda}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Knopf onClick={() => setChat(true)}>Mathilda fragen</Knopf>
            <Knopf art="glas" onClick={() => { try { navigator.clipboard.writeText(v.mathilda); } catch (e) { /* egal */ } setChat(true); }}>Einstieg kopieren</Knopf>
          </div>
        </div>
      </Abschnitt>

      <div style={{ margin: "32px 0 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
        {voriges && (
          <button type="button" onClick={() => oeffnen(voriges.id)}
            style={{ flex: "1 1 200px", padding: "14px 16px", borderRadius: 14, border: `1px solid ${K.linie}`, background: K.weiss, color: K.navy, fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "left" }}>
            <span style={{ display: "block", fontSize: 11.5, color: K.grau, fontWeight: 600 }}>← Vorherige Lektion</span>{voriges.titel}
          </button>
        )}
        {naechstes && (
          <button type="button" onClick={() => oeffnen(naechstes.id)}
            style={{ flex: "1 1 200px", padding: "14px 16px", borderRadius: 14, border: "none", background: NACHT, color: K.weiss, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "right" }}>
            <span style={{ display: "block", fontSize: 11.5, color: K.gold, fontWeight: 600 }}>Nächste Lektion →</span>{naechstes.titel}
          </button>
        )}
      </div>

      {w && <WerkzeugFenster key={offen} w={w} v={v} gehe={gehe} schliessen={() => setOffen(null)} />}
      {chat && <MathildaChatModal aufgabe={aufgabe} schliessen={() => setChat(false)} />}
    </div>
  );
}

/* ---------- Code-Eingabe (Schaufenster und Zugangsseite) ---------- */
function CodeFeld({ onOk, start = "" }) {
  const [text, setText] = useState(start);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState("");
  const pruefen = async () => {
    setLaedt(true); setFehler("");
    const p = await linkPruefen(text);
    setLaedt(false);
    if (!p.gueltig) { setFehler(GRUENDE[p.grund] || GRUENDE.form); return; }
    linkSpeichern(p);
    onOk && onOk(p);
  };
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) pruefen(); }} style={{ display: "grid", gap: 10 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: K.navy }} htmlFor="mck-code">Zugangscode oder Link</label>
      <input id="mck-code" value={text} onChange={(e) => setText(e.target.value)} placeholder="MC7K-2Q9X-FAH3" autoComplete="off" autoCapitalize="characters" spellCheck="false"
        style={{ height: 50, borderRadius: 14, border: `1.5px solid ${fehler ? "#E5484D" : K.linie}`, padding: "0 16px", fontSize: 17, fontFamily: "inherit", letterSpacing: "0.06em", color: K.navy, outline: "none" }} />
      <Knopf type="submit" disabled={laedt || !text.trim()} breit>{laedt ? "Wird geprüft …" : "Freischalten"}</Knopf>
      {fehler && <p role="alert" style={{ color: "#B42318", fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>{fehler}</p>}
    </form>
  );
}
const GRUENDE = {
  form: "Dieser Code stimmt nicht. Prüf bitte jedes Zeichen – oder füge einfach den ganzen Link aus deiner Nachricht ein.",
  unbekannt: "Diesen Code gibt es nicht. Prüf bitte den Link aus deiner Nachricht.",
  gesperrt: "Dieser Zugang ist gesperrt. Melde dich bitte bei uns.",
  abgelaufen: "Dieser Zugang ist abgelaufen.",
  vergeben: "Dieser Code ist schon mit einem anderen Konto verbunden. Jeder Teilnehmer hat seinen eigenen Link.",
  netz: "Gerade keine Verbindung. Bitte versuch es gleich noch einmal.",
};

/* ---------- Schaufenster (ohne Zugang) ---------- */
function Schaufenster({ gehe }) {
  const [pw, setPw] = useState("");
  const [pwOffen, setPwOffen] = useState(false);
  return (
    <div className="mx-auto px-5 pb-16" style={{ maxWidth: 620 }}>
      <div style={{ ...karte, padding: 20 }}>
        <Kicker>NUR FÜR TEILNEHMER</Kicker>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: K.navy, margin: "0 0 6px" }}>Dein persönlicher Zugang</h2>
        <p style={{ fontSize: 14.5, color: K.grau, lineHeight: 1.6, margin: "0 0 16px" }}>
          Als Teilnehmer der Masterclass hast du einen eigenen Link bekommen. Öffne ihn einfach – oder gib deinen Code hier ein.
        </p>
        <CodeFeld onOk={() => nachOben()} />
      </div>

      <Kicker>DAS ERWARTET DICH</Kicker>
      <div style={{ position: "relative" }}>
        <div aria-hidden="true" style={{ display: "grid", gap: 10, filter: "blur(1.5px)", opacity: 0.75, pointerEvents: "none" }}>
          {MC_VIDEOS.slice(0, 4).map((v) => (
            <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, borderRadius: 16, background: K.weiss, border: `1px solid ${K.linie}` }}>
              <span style={{ width: 110, flex: "none" }}><Poster v={v} kompakt /></span>
              <span style={{ fontWeight: 700, fontSize: 14.5, color: K.tinte }}>{v.titel}</span>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 0%, ${K.sand} 92%)` }} />
      </div>
      <div style={{ display: "grid", gap: 8, marginTop: 4 }}>
        {MC_FREISCHALTUNGEN.map((f) => (
          <div key={f.id} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: K.tinte }}><Haken an />{f.titel}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
        <Knopf art="navy" onClick={() => gehe({ ansicht: "masterclass" })}>Programm ansehen</Knopf>
      </div>

      <div style={{ marginTop: 34, textAlign: "center" }}>
        {!pwOffen ? (
          <button type="button" onClick={() => setPwOffen(true)} style={{ background: "none", border: "none", color: K.grau, fontSize: 12.5, textDecoration: "underline", cursor: "pointer", fontFamily: "inherit" }}>Vorschau (intern)</button>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (pw.trim().toLowerCase() === VORSCHAU_PASSWORT) { vorschauSetzen(true); nachOben(); } }} style={{ display: "inline-flex", gap: 8 }}>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Passwort" aria-label="Vorschau-Passwort"
              style={{ height: 40, borderRadius: 10, border: `1px solid ${K.linie}`, padding: "0 12px", fontFamily: "inherit" }} />
            <Knopf art="rand" type="submit" style={{ minHeight: 40 }}>Ansehen</Knopf>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------- Seite: Kursbereich ---------- */
export function MasterclassKursSeite({ gehe }) {
  const { status } = useZugang();
  const [stand, setStand] = useState(standLesen);
  const [modulId, setModulId] = useState(null);
  const v = MC_VIDEOS.find((x) => x.id === modulId);
  const oeffnen = (id) => { setModulId(id); nachOben(); };
  const zurUebersicht = () => { setModulId(null); nachOben(); };
  if (!status.offen) {
    return (
      <>
        <Kopf gehe={gehe} status={{ ...status, name: null }} untertitel="Der Kursbereich für Teilnehmer: Videolektionen, Werkzeuge, Aufträge und MathildaAI." />
        <Schaufenster gehe={gehe} />
      </>
    );
  }
  return (
    <>
      <style>{CSS}</style>
      <Kopf gehe={gehe} status={status} untertitel={v ? `Lektion ${videoNummer(v.id)} · Video ansehen, dann trainieren.` : "Sechs Monate, zehn Lektionen, ein Ziel: dein Mathe-Abi."} />
      {v
        ? <Modul key={v.id} v={v} stand={stand} setStand={setStand} oeffnen={oeffnen} zurUebersicht={zurUebersicht} gehe={gehe} />
        : <Uebersicht stand={stand} oeffnen={oeffnen} status={status} gehe={gehe} />}
    </>
  );
}

/* ---------- Seite: Zugang über den persönlichen Link ---------- */
export function MasterclassZugangSeite({ gehe }) {
  const { status } = useZugang();
  const [pruefung, setPruefung] = useState(null);   // null = läuft, sonst Ergebnis
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState("");
  const gemerkt = gemerkterLink();
  useEffect(() => {
    let aus = false;
    if (!gemerkt || !gemerkt.token) { setPruefung({ gueltig: false, grund: "keiner" }); return undefined; }
    linkPruefen(gemerkt.token).then((p) => {
      if (aus) return;
      if (p.gueltig || p.eingeloest_hier) linkSpeichern({ ...p, gueltig: true });
      setPruefung(p);
    });
    return () => { aus = true; };
  }, [gemerkt && gemerkt.token]);   // eslint-disable-line react-hooks/exhaustive-deps

  const vorname = (pruefung && pruefung.name) || (status.name ? String(status.name).split(" ")[0] : "");
  const ok = pruefung && (pruefung.gueltig || pruefung.eingeloest_hier);
  const verbinden = async () => {
    setLaedt(true); setFehler("");
    try { await einloesen(gemerkt.token); } catch (e) { setFehler(e.message); }
    setLaedt(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ background: NACHT, color: K.weiss, minHeight: "calc(100dvh - 60px)", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 60% at 50% 0%, rgba(237,187,0,0.22) 0%, transparent 65%)" }} />
        <div className="mx-auto px-6" style={{ maxWidth: 520, paddingTop: 40, paddingBottom: 60, position: "relative" }}>
          <div style={{ width: 96, height: 96, margin: "0 auto 18px" }} className="mck-einblenden"><Treppe hell /></div>
          {!pruefung ? (
            <p role="status" style={{ textAlign: "center", color: "#C9D6EE" }}>Dein Zugang wird geprüft …</p>
          ) : ok ? (
            <div className="mck-einblenden" style={{ textAlign: "center" }}>
              <Kicker hell>{(pruefung.gruppe || "MATHE ABI MASTERCLASS").toUpperCase()}</Kicker>
              <h1 style={{ fontSize: "clamp(28px, 8vw, 38px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "4px 0 10px" }}>
                {vorname ? `Willkommen, ${vorname}!` : "Willkommen in der Masterclass!"}
              </h1>
              <p style={{ color: "#C9D6EE", fontSize: 15.5, lineHeight: 1.65, margin: "0 0 24px" }}>
                Dein persönlicher Zugang ist erkannt. Ab jetzt ist alles für dich freigeschaltet{pruefung.bis ? ` – bis ${datum(pruefung.bis)}` : ""}.
              </p>
              <div style={{ textAlign: "left", display: "grid", gap: 8, marginBottom: 26 }}>
                {MC_FREISCHALTUNGEN.map((f, k) => (
                  <div key={f.id} className="mck-einblenden" style={{ animationDelay: `${0.15 + k * 0.08}s`, display: "flex", gap: 12, alignItems: "center", padding: "11px 14px", borderRadius: 14, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <Haken an />
                    <span>
                      <span style={{ display: "block", fontSize: 14.5, fontWeight: 700 }}>{f.titel}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: "#AFC0E0" }}>{f.zeile}</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Schritte */}
              <div style={{ textAlign: "left", background: K.weiss, color: K.tinte, borderRadius: 20, padding: 18, boxShadow: "0 18px 50px rgba(0,0,0,0.35)" }}>
                <Schritt nr={1} fertig titel="Link erkannt" text={`Code ${tokenAnzeige(gemerkt.token)}`} />
                <Schritt nr={2} fertig={status.imKonto} titel="Mit deinem Konto verbinden"
                  text={status.imKonto ? "Erledigt – MathildaAI ist ohne Tageslimit freigeschaltet." : status.angemeldet ? "Ein Tipp genügt." : "Damit dein Zugang auf jedem Gerät gilt und Mathilda frei ist."}>
                  {!status.imKonto && (status.angemeldet
                    ? <Knopf disabled={laedt} onClick={verbinden}>{laedt ? "Wird verbunden …" : "Jetzt verbinden"}</Knopf>
                    : <Knopf onClick={() => gehe({ ansicht: "konto" })}>Anmelden oder Konto anlegen</Knopf>)}
                  {fehler && <p role="alert" style={{ color: "#B42318", fontSize: 13, margin: "8px 0 0" }}>{fehler}</p>}
                </Schritt>
                <Schritt nr={3} letzter titel="Loslegen" text="Lektion 1 wartet auf dich.">
                  <Knopf art="navy" onClick={() => gehe({ ansicht: "mckurs" })}>Zum Kursbereich →</Knopf>
                </Schritt>
              </div>
              {!status.angemeldet && <p style={{ fontSize: 12.5, color: "#AFC0E0", marginTop: 14 }}>Du kannst auch gleich starten – das Konto lässt sich später verbinden.</p>}
            </div>
          ) : (
            <div className="mck-einblenden">
              <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, margin: "0 0 10px" }}>Zugang zur Masterclass</h1>
              <p style={{ textAlign: "center", color: "#C9D6EE", fontSize: 15, lineHeight: 1.6, margin: "0 0 20px" }}>
                {pruefung.grund === "keiner" ? "Gib deinen persönlichen Code ein." : (GRUENDE[pruefung.grund] || GRUENDE.form)}
              </p>
              <div style={{ background: K.weiss, borderRadius: 20, padding: 18 }}>
                <CodeFeld onOk={(p) => setPruefung(p)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Schritt({ nr, titel, text, fertig, letzter, children }) {
  return (
    <div style={{ display: "flex", gap: 14, paddingBottom: letzter ? 0 : 16, marginBottom: letzter ? 0 : 16, borderBottom: letzter ? "none" : `1px solid ${K.linie}` }}>
      <span style={{ flex: "none", width: 30, height: 30, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14,
        background: fertig ? GOLD : K.navy, color: fertig ? K.navy : K.gold }}>{fertig ? "✓" : nr}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15.5, fontWeight: 800, color: K.navy, margin: 0 }}>{titel}</p>
        <p style={{ fontSize: 13.5, color: K.grau, margin: "2px 0 0", lineHeight: 1.5 }}>{text}</p>
        {children && <div style={{ marginTop: 10 }}>{children}</div>}
      </div>
    </div>
  );
}

const CSS = `
  @keyframes mckEin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .mck-einblenden{animation:mckEin .45s ease-out both}
  @media (prefers-reduced-motion:reduce){.mck-einblenden{animation:none}}
  @media (hover:hover){.mck-play:hover{transform:translate(-50%,-50%) scale(1.06) !important}}
  .mck-play:focus-visible{opacity:1 !important;outline:3px solid #fff}
  .mck-check{position:absolute;opacity:0;width:1px;height:1px}
  label:has(.mck-check:focus-visible){outline:2px solid ${K.gold};border-radius:10px}
  @media (max-width:640px){.mck-fenster-hg{padding:0 !important;align-items:flex-end !important}.mck-fenster{max-height:94dvh !important;border-radius:20px 20px 0 0 !important;width:100% !important}}
`;
