import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { Text } from "./func3.jsx";
import { FLIESS, KARTE, ZELLE, Formeln, Schritt, Kasten, Chip, PlusMinus, Kicker, H3, Trenner, Inline, RoterFaden, Kolloquium } from "./funcGfsBausteine.jsx";
import { AnimKarte } from "./funcAnimKarte.jsx";
import { lauf, T } from "./funcErklaeranimation.jsx";
import {
  dk, KOERPER, koerper, dualVon, innenwinkel, NECKE, defizit,
  matMal, matVek, rotX, rotY, rotZ, drehe, START_DREHUNG, NETZ_START, bildpunkt, licht, projiziere, projiziereNetz, schattiere, punkteText,
  NETZE, netzFuer, wuerfelNetz, eckeFlaechen, vek,
  ARTEN, ARTNAME, aufgabe, auftrag, felder, aufgabeTex, pruefe, rechenweg, tipp, grundText,
  BEGRUENDUNGEN, gemischt, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "./gfsPlatonisch.js";

/* ============================================================
   Kurs GFS – Themenseite „Platonische Körper“ (Klasse 9, Kap. VII Körper)
   Aufbau wie die Dosen-Seite: Leitfrage · Herleitung in sechs Schritten
   mit fünf Erkläranimationen · Körper-Labor (drehbare 3D-Ansicht, eigene
   Projektion, Netze falten, Dualkörper, Tabelle mit Euler) · Übungen aus
   vier Generatoren · Begründen (zwei Lückenbeweise) · roter Faden · Kolloquium.
   Logik und Mathe in gfsPlatonisch.js.
   ============================================================ */

const KNOPF = (aktiv = true, farbe = C.see) => ({
  background: aktiv ? farbe : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600,
  fontFamily: "inherit", cursor: aktiv ? "pointer" : "default",
});
const LINK = { background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" };
/* aktuelle Aufgabe für automatische Prüfungen (tests/ui/gfsplatonisch.ui.py) */
const merk = (a) => { if (typeof window !== "undefined") window.__gpAufgabe = a; return a; };
const leiseBewegung = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const PILLE = (an) => ({
  padding: "6px 12px", borderRadius: 999, border: `1px solid ${an ? C.flaggold : C.linie}`, background: an ? "#FFF6D6" : C.weiss,
  color: an ? C.tinte : C.grau, fontSize: 12.5, fontWeight: an ? 600 : 400, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
});
const KANTE = "rgba(15,26,51,0.55)";

/* ======================================================================
   Zeichnen: Körper und Netze (eigene Projektion aus gfsPlatonisch.js)
   ====================================================================== */
function KoerperSvg({ k, R, cx = 180, cy = 150, s = 100, modus = "flaechen", o = 1, dual = false, farbe, kantenFarbe = KANTE, eckenGold = 0, kantenGold = 0, flaechenGold = 0, breite = 1.3 }) {
  if (o <= 0.001) return null;
  const pr = projiziere(k, R, { cx, cy, s });
  const f = farbe || k.farbe;
  const draht = modus === "draht";
  const durch = dual && !draht;
  const dualTeil = dual ? <DualSvg k={k} R={R} cx={cx} cy={cy} s={s} /> : null;
  const goldF = new Set(pr.flaechen.map((x) => x.i).sort((a, b) => a - b).slice(0, Math.round(flaechenGold)));
  const goldK = Math.round(kantenGold), goldE = Math.round(eckenGold);
  return (
    <g opacity={o}>
      {draht && pr.kanten.filter((x) => x.verdeckt).map((x) => (
        <line key={`h${x.i}`} x1={x.a[0]} y1={x.a[1]} x2={x.b[0]} y2={x.b[1]} stroke={x.i < goldK ? C.gold : f} strokeOpacity={x.i < goldK ? 0.9 : 0.45} strokeWidth={breite * 0.9} strokeDasharray="4 3" />
      ))}
      {draht && dualTeil}
      {!draht && durch && pr.flaechen.filter((x) => !x.sichtbar).map((x) => (
        <polygon key={`b${x.i}`} points={punkteText(x.punkte)} fill={schattiere(f, 0.25)} fillOpacity="0.25" stroke={kantenFarbe} strokeOpacity="0.35" strokeWidth={breite * 0.8} strokeLinejoin="round" />
      ))}
      {!draht && durch && dualTeil}
      {!draht && pr.flaechen.filter((x) => x.sichtbar).map((x) => (
        <polygon key={x.i} points={punkteText(x.punkte)} fill={goldF.has(x.i) ? schattiere("#EDBB00", x.licht) : schattiere(f, x.licht)} fillOpacity={durch ? 0.32 : 1}
          stroke={kantenFarbe} strokeWidth={breite} strokeLinejoin="round" />
      ))}
      {draht && pr.kanten.filter((x) => !x.verdeckt).map((x) => (
        <line key={`v${x.i}`} x1={x.a[0]} y1={x.a[1]} x2={x.b[0]} y2={x.b[1]} stroke={x.i < goldK ? C.gold : f} strokeWidth={breite * (x.i < goldK ? 2.2 : 1.7)} strokeLinecap="round" />
      ))}
      {!draht && goldK > 0 && pr.kanten.filter((x) => x.i < goldK && !x.verdeckt).map((x) => (
        <line key={`g${x.i}`} x1={x.a[0]} y1={x.a[1]} x2={x.b[0]} y2={x.b[1]} stroke={C.flaggold} strokeWidth={breite * 2.4} strokeLinecap="round" />
      ))}
      {(draht || goldE > 0) && pr.ecken.map((e) => (
        (draht || e.i < goldE) && <circle key={`e${e.i}`} cx={e.x} cy={e.y} r={e.i < goldE ? 4.2 : 2.6} fill={e.i < goldE ? C.flaggold : f}
          stroke={e.i < goldE ? C.gold : "none"} strokeWidth="1" opacity={e.z < -0.1 && !(e.i < goldE) ? 0.5 : 1} />
      ))}
    </g>
  );
}
/* Dualkörper als Drahtmodell in Gold: Flächenmitten verbunden */
function DualSvg({ k, R, cx, cy, s, skala = 1, o = 1, farbe = C.gold }) {
  const d = dualVon(k);
  const v = d.ecken.map((p) => matVek(R, vek.mal(p, skala)));
  const b = v.map((p) => bildpunkt(p, { cx, cy, s }));
  return (
    <g opacity={o}>
      {d.kanten.map((ka, i) => {
        const hinten = (v[ka.a][2] + v[ka.b][2]) / 2 < -0.04 * skala;
        return <line key={i} x1={b[ka.a][0]} y1={b[ka.a][1]} x2={b[ka.b][0]} y2={b[ka.b][1]} stroke={farbe} strokeWidth={hinten ? 1.3 : 2.2}
          strokeOpacity={hinten ? 0.55 : 1} strokeDasharray={hinten ? "3 3" : undefined} strokeLinecap="round" />;
      })}
      {b.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.2" fill={C.flaggold} stroke={farbe} strokeWidth="1" />)}
    </g>
  );
}
/* Innenseite des Netzes: Körperfarbe, stark aufgehellt */
const aufgehellt = (hex, w = 0.62) => {
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((x) => Math.round(x + (255 - x) * w));
  return `#${c.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};
/* Netz (gefaltet zum Anteil t), beide Seiten sichtbar; rot = Flächen, die aufeinanderliegen */
function NetzSvg({ netz, t, R, cx = 180, cy = 150, s = 120, farbe = C.see, rot = [], o = 1 }) {
  if (o <= 0.001) return null;
  const fl = projiziereNetz(netz, t, R, { cx, cy, s });
  const roteF = new Set(rot);
  return (
    <g opacity={o}>
      {fl.map((x) => (
        <polygon key={x.i} points={punkteText(x.punkte)} strokeLinejoin="round" strokeWidth="1.3" stroke={KANTE}
          fill={roteF.has(x.i) ? schattiere("#D9483B", 0.4 + 0.6 * x.licht) : x.oben ? schattiere(aufgehellt(farbe), 0.45 + 0.55 * x.licht) : schattiere(farbe, x.licht)} fillOpacity={roteF.has(x.i) ? 0.92 : 1} />
      ))}
    </g>
  );
}

/* Ziehen zum Drehen (Maus, Finger, Stift); Pfeiltasten drehen auch */
function useZiehen(setR, beiStart) {
  const zug = useRef(null);
  return {
    onPointerDown: (e) => { zug.current = { x: e.clientX, y: e.clientY }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) { /* egal */ } if (beiStart) beiStart(); },
    onPointerMove: (e) => {
      if (!zug.current) return;
      const dx = e.clientX - zug.current.x, dy = e.clientY - zug.current.y;
      zug.current = { x: e.clientX, y: e.clientY };
      setR((R) => drehe(R, dx * 0.012, dy * 0.012));
    },
    onPointerUp: () => { zug.current = null; },
    onPointerCancel: () => { zug.current = null; },
    onKeyDown: (e) => {
      const m = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] }[e.key];
      if (!m) return;
      e.preventDefault(); if (beiStart) beiStart();
      setR((R) => drehe(R, m[0], m[1]));
    },
  };
}
const BUEHNE = { background: `radial-gradient(120% 90% at 30% 15%, #FFFFFF 0%, ${C.sand} 55%, #EEF2F8 100%)`, borderRadius: 14, border: `1px solid ${C.linie}` };

/* Drehbarer Körper (eigener Zustand, damit beim Drehen nur das Bild neu gezeichnet wird) */
function KoerperBuehne({ k, modus, dual }) {
  const [R, setR] = useState(START_DREHUNG);
  const [auto, setAuto] = useState(() => !leiseBewegung());
  const [imBild, setImBild] = useState(true);
  const rahmen = useRef(null);
  const ziehen = useZiehen(setR, () => setAuto(false));
  /* nur drehen, solange das Labor zu sehen ist */
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !rahmen.current) return undefined;
    const io = new IntersectionObserver(([e]) => setImBild(e.isIntersecting));
    io.observe(rahmen.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!auto || !imBild) return undefined;
    let alt = performance.now(), raf = 0;
    const tick = (jetzt) => {
      const dt = Math.min(0.05, (jetzt - alt) / 1000); alt = jetzt;
      setR((x) => drehe(x, 0.45 * dt, 0));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto, imBild]);
  return (
    <div ref={rahmen} style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={BUEHNE}>
        <svg viewBox="0 0 360 290" style={{ width: "100%", display: "block", touchAction: "none", cursor: "grab", outline: "none" }} tabIndex={0} role="img"
          aria-label={`${k.name} – ${k.f} ${k.flaechenName}, ${k.e} Ecken, ${k.k} Kanten. Ziehen oder Pfeiltasten drehen den Körper.`}
          data-labor-koerper={k.id} data-modus={modus} data-drehung={R[0][0].toFixed(3)} {...ziehen}>
          <KoerperSvg k={k} R={R} cx={180} cy={145} s={112} modus={modus} dual={dual} breite={1.4} />
        </svg>
      </div>
      <div className="flex flex-wrap items-center" style={{ gap: 10, marginTop: 8 }}>
        <span style={{ fontSize: 12.5, color: C.grau }}>Ziehen dreht den Körper</span>
        <button type="button" onClick={() => setAuto((a) => !a)} aria-pressed={auto} style={{ ...LINK, marginLeft: "auto" }}>{auto ? "Drehen anhalten" : "Selbst drehen lassen"}</button>
        <button type="button" onClick={() => { setR(START_DREHUNG); }} style={LINK}>Zurücksetzen</button>
      </div>
    </div>
  );
}

/* Netz mit Falt-Regler und „Falten“-Knopf (Labor und Übung) */
function NetzBuehne({ netz, farbe, rot = [], label = "Faltung", hoehe = 290, start = 0 }) {
  const [R, setR] = useState(NETZ_START);
  const [t, setT] = useState(start);
  const [laeuft, setLaeuft] = useState(false);
  const ziehen = useZiehen(setR);
  const tRef = useRef(t); tRef.current = t;
  useEffect(() => {
    if (!laeuft) return undefined;
    const ziel = tRef.current >= 0.999 ? 0 : 1;
    let alt = performance.now(), raf = 0;
    const tick = (jetzt) => {
      const dt = Math.min(0.05, (jetzt - alt) / 1000); alt = jetzt;
      const neu = Math.max(0, Math.min(1, tRef.current + (ziel ? 1 : -1) * dt / 2.4));
      setT(neu);
      if ((ziel && neu >= 1) || (!ziel && neu <= 0)) { setLaeuft(false); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [laeuft]);
  return (
    <div style={{ maxWidth: hoehe < 290 ? 420 : 520, margin: "0 auto" }}>
      <div style={BUEHNE}>
        <svg viewBox={`0 0 360 ${hoehe}`} style={{ width: "100%", display: "block", touchAction: "none", cursor: "grab", outline: "none" }} tabIndex={0} role="img"
          aria-label={`Netz, zu ${Math.round(t * 100)} Prozent gefaltet. Ziehen dreht das Bild.`} data-netz={t.toFixed(2)} {...ziehen}>
          <NetzSvg netz={netz} t={t} R={R} cx={180} cy={hoehe / 2} s={Math.min(125, hoehe * 0.43)} farbe={farbe} rot={rot} />
        </svg>
      </div>
      <div className="flex items-center" style={{ gap: 12, marginTop: 10 }}>
        <button type="button" onClick={() => setLaeuft((x) => !x)} aria-label={laeuft ? "Anhalten" : t >= 0.999 ? "Aufklappen" : "Zusammenfalten"}
          style={{ width: 40, height: 40, borderRadius: 999, border: "none", background: C.seeTief, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {laeuft ? <svg width="15" height="15" viewBox="0 0 18 18" aria-hidden="true"><rect x="3" y="2.5" width="4" height="13" rx="1.2" fill={C.flaggold} /><rect x="11" y="2.5" width="4" height="13" rx="1.2" fill={C.flaggold} /></svg>
            : <svg width="15" height="15" viewBox="0 0 18 18" aria-hidden="true"><path d="M4.5 2.5v13l11-6.5z" fill={C.flaggold} /></svg>}
        </button>
        <input type="range" min={0} max={1} step={0.01} value={t} aria-label={label} onChange={(e) => { setLaeuft(false); setT(parseFloat(e.target.value)); }}
          style={{ flex: 1, minWidth: 0, accentColor: C.see, cursor: "pointer" }} />
        <span style={{ fontSize: 12.5, color: C.grau, width: 74, textAlign: "right", flexShrink: 0 }}>{t <= 0.001 ? "ausgeklappt" : t >= 0.999 ? "gefaltet" : `${Math.round(t * 100)} %`}</span>
      </div>
    </div>
  );
}

/* ======================================================================
   Kopfbild (viewBox 160 × 120): die fünf Körper, mathematisch exakt projiziert
   ====================================================================== */
const KOPF_LAGE = [
  { id: "tetraeder", x: 29, y: 38, r: 22, R: matMal(rotX(0.5), rotY(2.4)) },
  { id: "wuerfel", x: 80, y: 36, r: 23, R: matMal(rotX(0.5), rotY(-0.6)) },
  { id: "oktaeder", x: 131, y: 38, r: 23, R: matMal(rotX(0.32), rotY(0.4)) },
  { id: "dodekaeder", x: 54, y: 86, r: 25, R: matMal(rotX(0.4), rotY(0.25)) },
  { id: "ikosaeder", x: 106, y: 86, r: 25, R: matMal(rotX(0.3), rotY(-0.35)) },
];
export function PlatonischBild() {
  return (
    <svg className="gtk-bild" viewBox="0 0 160 120" role="img" aria-label="Die fünf platonischen Körper: Tetraeder, Würfel, Oktaeder, Dodekaeder und Ikosaeder">
      <defs>
        <radialGradient id="gtk-pl-glut" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#EDBB00" stopOpacity="0.42" /><stop offset="60%" stopColor="#EDBB00" stopOpacity="0.1" /><stop offset="100%" stopColor="#EDBB00" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse className="gtk-glimmen" cx="80" cy="62" rx="76" ry="56" fill="url(#gtk-pl-glut)" />
      {KOPF_LAGE.map((l, i) => {
        const k = koerper(l.id);
        const pr = projiziere(k, l.R, { cx: l.x, cy: l.y, s: l.r, d: 7 });
        return (
          <g key={l.id} className="gtk-auf" style={{ animationDelay: `${0.09 * i}s` }}>
            {l.y > 60 && <ellipse cx={l.x} cy={l.y + l.r + 2} rx={l.r * 0.72} ry="2.4" fill="#000" opacity="0.4" />}
            {pr.flaechen.filter((x) => x.sichtbar).map((x) => (
              <polygon key={x.i} points={punkteText(x.punkte)} fill={schattiere(k.farbe, x.licht)} stroke="rgba(255,246,214,0.55)" strokeWidth="0.55" strokeLinejoin="round" />
            ))}
          </g>
        );
      })}
      <text x="80" y="117" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="600" fontSize="6.6" fill="rgba(255,255,255,0.62)" letterSpacing="0.02em">genau fünf – und kein sechster</text>
    </svg>
  );
}

/* ======================================================================
   Erkläranimationen (Szenen = reine Funktionen der Zeit, Schlussbild = Standbild)
   ====================================================================== */
const mix = (a, b, p) => a + (b - a) * p;
const fenster = (t, a, b, c, d) => lauf(t, a, b) * (1 - lauf(t, c, d));
function Pille({ x = 180, y, text, o = 1, farbe = C.see, breite, voll = false }) {
  if (o <= 0.001) return null;
  const w = breite || Math.max(70, String(text).length * 7.2 + 24);
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - 17} width={w} height={26} rx="13" fill={voll ? farbe : C.weiss} stroke={farbe} strokeWidth="1.4" />
      <T x={x} y={y + 1} textAnchor="middle" fontSize="13" fontWeight="800" fill={voll ? C.weiss : farbe}>{text}</T>
    </g>
  );
}
const FLAECHEN_FARBE = { 3: "#D4145A", 4: "#1E6BC0", 5: "#D49A00", 6: "#8E97A6" };

/* ---------- 1 · Die fünf Körper ---------- */
const F_DAUER = 24;
const fSchritte = () => [
  { von: 0, text: "Manche Körper sind besonders regelmäßig: Alle Flächen sind gleiche regelmäßige Vielecke, und an jeder Ecke stoßen gleich viele zusammen. Der erste: das Tetraeder aus 4 gleichseitigen Dreiecken, drei an jeder Ecke." },
  { von: 4, text: "Der Würfel aus 6 Quadraten – auch hier treffen sich an jeder Ecke drei Flächen." },
  { von: 8, text: "Das Oktaeder aus 8 gleichseitigen Dreiecken. An jeder Ecke liegen jetzt vier." },
  { von: 12, text: "Das Dodekaeder aus 12 regelmäßigen Fünfecken, drei an jeder Ecke." },
  { von: 16, text: "Das Ikosaeder aus 20 gleichseitigen Dreiecken, fünf an jeder Ecke." },
  { von: 20, text: "Das sind alle. Einen sechsten Körper dieser Art gibt es nicht – egal, wie lange man sucht. Warum, zeigt eine einzige Ecke." },
];
const BESCHR = { tetraeder: "4 Dreiecke · 3 an jeder Ecke", wuerfel: "6 Quadrate · 3 an jeder Ecke", oktaeder: "8 Dreiecke · 4 an jeder Ecke", dodekaeder: "12 Fünfecke · 3 an jeder Ecke", ikosaeder: "20 Dreiecke · 5 an jeder Ecke" };
function fZeichne(t) {
  return (
    <g>
      {KOERPER.map((k, i) => {
        const a = 4 * i, o = i === 0 ? 1 : lauf(t, a, a + 0.7), m = lauf(t, a + 3.1, a + 4);
        if (o <= 0.001) return null;
        const x = mix(180, 36 + i * 72, m), y = mix(102, 258, m), s = mix(70, 23, m);
        const R = matMal(rotX(0.5), rotY(0.55 * t + 2.4 + i * 0.7));
        return (
          <g key={k.id}>
            <KoerperSvg k={k} R={R} cx={x} cy={y} s={s} o={o} breite={mix(1.4, 0.8, m)} />
            <T x="180" y="196" textAnchor="middle" fontSize="18" fontWeight="800" fill={C.tinte} opacity={o * (1 - m)}>{k.name}</T>
            <T x="180" y="215" textAnchor="middle" fontSize="12.5" fontWeight="600" fill={C.grau} opacity={o * (1 - m)}>{BESCHR[k.id]}</T>
            <T x={36 + i * 72} y="296" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.seeTief} opacity={m}>{k.name}</T>
          </g>
        );
      })}
      <Pille x={180} y={110} text="Warum kein sechster?" o={lauf(t, 20.4, 21.4)} farbe={C.gold} breite={200} />
    </g>
  );
}

/* ---------- 2 · Flächen um eine Ecke legen ---------- */
const E_DAUER = 34;
const eSchritte = () => [
  { von: 0, text: "Drei gleichseitige Dreiecke um einen Punkt: zusammen 3 · 60° = 180°. Es bleibt eine Lücke. Klebt man sie zu, klappen die Dreiecke hoch – eine räumliche Ecke entsteht, die Ecke eines Tetraeders." },
  { von: 5.5, text: "Vier Dreiecke ergeben 240°, fünf Dreiecke 300°. Die Lücke wird kleiner, aber sie ist noch da – also gibt es auch diese Ecken: Oktaeder und Ikosaeder." },
  { von: 13.5, text: "Sechs Dreiecke: 6 · 60° = 360°. Keine Lücke mehr – die Dreiecke liegen flach in der Ebene. Daraus wird nie eine Ecke." },
  { von: 17, text: "Quadrate haben 90°. Drei Quadrate: 270°, die Lücke schließt sich zur Würfelecke. Vier Quadrate: genau 360° – wieder flach." },
  { von: 24, text: "Fünfecke haben 108°. Drei Fünfecke: 324° – es reicht knapp für die Ecke des Dodekaeders. Sechsecke haben 120°: Schon drei ergeben 360°, und größere Vielecke haben noch größere Winkel." },
  { von: 31, text: "Übrig bleiben genau fünf mögliche Ecken – und damit höchstens fünf regelmäßige Körper." },
];
const FAELLE = [
  { von: 0, bis: 5.5, p: 3, q: 3, zu: [2.4, 4.4], name: "Tetraeder" },
  { von: 5.5, bis: 9.5, p: 3, q: 4, zu: [6.6, 8.4], name: "Oktaeder" },
  { von: 9.5, bis: 13.5, p: 3, q: 5, zu: [10.6, 12.4], name: "Ikosaeder" },
  { von: 13.5, bis: 17, p: 3, q: 6 },
  { von: 17, bis: 21, p: 4, q: 3, zu: [18.2, 20], name: "Würfel" },
  { von: 21, bis: 24, p: 4, q: 4 },
  { von: 24, bis: 28, p: 5, q: 3, zu: [25.2, 27], name: "Dodekaeder" },
  { von: 28, bis: 31, p: 6, q: 3 },
];
const WEITE = { 3: 1, 4: Math.SQRT2, 5: (1 + Math.sqrt(5)) / 2, 6: 2 };      // größter Abstand von einer Ecke (Seite 1)
function Faecher({ p, q, s, o, cx = 180, cy = 146, groesse = 98 }) {
  if (o <= 0.001) return null;
  const L = 1 / WEITE[p];
  /* Kamera so drehen, dass die Lücke schräg vorn liegt (Mitte der Lücke bei 70°) */
  const S0 = (q * innenwinkel(p) * Math.PI) / 180;
  const FAECHER_R = matMal(rotX(0.62), rotY(S0 < 2 * Math.PI - 1e-9 ? (S0 + 2 * Math.PI) / 2 - (70 * Math.PI) / 180 : 0.5));
  const { flaechen } = eckeFlaechen(p, q, s, L);
  const proj = flaechen.map((poly, i) => {
    const v = poly.map((pt) => matVek(FAECHER_R, pt));
    const n = vek.einheit(vek.kreuz(vek.minus(v[1], v[0]), vek.minus(v[2], v[0])));
    return { i, punkte: v.map((pt) => bildpunkt(pt, { cx, cy, s: groesse })), tiefe: vek.mitte(v)[2], hell: Math.max(licht(n), licht(vek.mal(n, -1))) + 0.15 * Math.abs(n[2]) };
  }).sort((a, b) => a.tiefe - b.tiefe);
  const S = q * innenwinkel(p);
  /* Lücke als Kreisausschnitt in der Ebene */
  const luecke = [];
  if (S < 360 - 1e-9 && s < 0.98) {
    const a0 = (q * innenwinkel(p) * Math.PI) / 180;
    luecke.push([0, 0, 0]);
    for (let w = a0; w <= 2 * Math.PI + 1e-9; w += 0.08) luecke.push([0.42 * Math.cos(w), 0, 0.42 * Math.sin(w)]);
    luecke.push([0.42, 0, 0]);
  }
  const lb = luecke.map((pt) => bildpunkt(matVek(FAECHER_R, pt), { cx, cy, s: groesse }));
  return (
    <g opacity={o}>
      {lb.length > 2 && <polygon points={punkteText(lb)} fill={C.signal} fillOpacity={0.22 * (1 - s)} stroke={C.signal} strokeOpacity={0.6 * (1 - s)} strokeWidth="1.2" strokeDasharray="4 3" />}
      {proj.map((x) => <polygon key={x.i} points={punkteText(x.punkte)} fill={schattiere(FLAECHEN_FARBE[p], Math.min(1, 0.35 + 0.65 * x.hell))} fillOpacity="0.93" stroke={KANTE} strokeWidth="1.2" strokeLinejoin="round" />)}
      <circle cx={cx} cy={cy} r="3.4" fill={C.flaggold} stroke={C.gold} strokeWidth="1" />
    </g>
  );
}
function eZeichne(t) {
  return (
    <g>
      {FAELLE.map((f) => {
        const o = lauf(t, f.von, f.von + 0.6) * (1 - lauf(t, f.bis - 0.5, f.bis));
        if (o <= 0.001) return null;
        const s = f.zu ? lauf(t, f.zu[0], f.zu[1]) : 0;
        const a = innenwinkel(f.p), S = f.q * a;
        const flach = Math.abs(S - 360) < 1e-9;
        return (
          <g key={`${f.p}-${f.q}`}>
            <Faecher p={f.p} q={f.q} s={s} o={o} />
            <T x="180" y="28" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.tinte} opacity={o}>
              {f.q} {NECKE[f.p]}: <tspan fill={FLAECHEN_FARBE[f.p]}>{f.q} · {dk(a)}° = {dk(S)}°</tspan>
            </T>
            {f.zu ? (
              <>
                <Pille x={180} y={272} text={`Lücke ${dk(360 - S)}° → zukleben`} o={o * lauf(t, f.von + 0.7, f.von + 1.3) * (1 - lauf(t, f.zu[1] - 0.4, f.zu[1]))} farbe={C.signal} breite={200} />
                <Pille x={180} y={272} text={`Ecke des ${f.name}s`} o={o * lauf(t, f.zu[1] - 0.3, f.zu[1] + 0.3)} farbe={C.gold} voll breite={200} />
              </>
            ) : (
              <Pille x={180} y={272} text={flach ? "360° – liegt flach, keine Ecke" : "zu viel"} o={o * lauf(t, f.von + 0.7, f.von + 1.3)} farbe={C.signal} breite={240} />
            )}
          </g>
        );
      })}
      {lauf(t, 31, 31.8) > 0.001 && (
        <g opacity={lauf(t, 31, 31.8)}>
          <T x="180" y="40" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.tinte}>Nur diese fünf Ecken gehen:</T>
          {[["3 Dreiecke", "180°", 3], ["4 Dreiecke", "240°", 3], ["5 Dreiecke", "300°", 3], ["3 Quadrate", "270°", 4], ["3 Fünfecke", "324°", 5]].map(([n, w, p], i) => (
            <g key={n} opacity={lauf(t, 31.2 + i * 0.3, 31.8 + i * 0.3)}>
              <rect x="70" y={62 + i * 44} width="220" height="36" rx="12" fill={C.weiss} stroke={FLAECHEN_FARBE[p]} strokeWidth="1.5" />
              <T x="88" y={85 + i * 44} fontSize="14" fontWeight="800" fill={FLAECHEN_FARBE[p]}>{n}</T>
              <T x="272" y={85 + i * 44} textAnchor="end" fontSize="14" fontWeight="700" fill={C.tinte}>{w} &lt; 360°</T>
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

/* ---------- 3 · Das Netz faltet sich ---------- */
const N_DAUER = 22;
const nSchritte = () => [
  { von: 0, text: "Ein Würfel aus Pappe beginnt als ebenes Netz: sechs Quadrate, die an ihren Kanten zusammenhängen." },
  { von: 3, text: "Beim Falten dreht sich jede Fläche um ihre Kante nach oben, bis sie senkrecht auf ihrer Nachbarin steht – der Winkel zwischen zwei Würfelflächen ist 90°." },
  { von: 9, text: "Fertig: Jede der sechs Flächen hat ihren eigenen Platz, keine liegt doppelt. An jeder Ecke treffen sich drei Quadrate." },
  { von: 12, text: "Das Netz des Tetraeders: vier gleichseitige Dreiecke. Die drei äußeren klappen hoch, bis sich ihre Spitzen treffen." },
  { von: 18, text: "An jeder Ecke liegen drei Dreiecke, zusammen 180°. Die Lücke von 180° hat sich beim Falten geschlossen – genau wie im Bild mit den Flächen um eine Ecke." },
];
const N_WUERFEL = netzFuer("wuerfel", "kreuz").netz, N_TETRA = netzFuer("tetraeder", "dreieck").netz;
function nZeichne(t) {
  const o1 = 1 - lauf(t, 11.2, 11.9), o2 = lauf(t, 11.8, 12.5);
  const R = matMal(rotX(-0.95), rotZ(0.3 + 0.07 * t));
  return (
    <g>
      <NetzSvg netz={N_WUERFEL} t={lauf(t, 3.4, 8.6)} R={R} cx={180} cy={140} s={112} farbe={koerper("wuerfel").farbe} o={o1} />
      <NetzSvg netz={N_TETRA} t={lauf(t, 13, 17.4)} R={R} cx={180} cy={140} s={112} farbe={koerper("tetraeder").farbe} o={o2} />
      <Pille x={180} y={22} text="Würfelnetz · Faltwinkel 90°" o={o1 * lauf(t, 0.3, 1)} farbe={koerper("wuerfel").farbe} breite={220} />
      <Pille x={180} y={22} text="Tetraedernetz" o={o2} farbe={koerper("tetraeder").farbe} breite={160} />
      <Pille x={180} y={282} text="6 Flächen, keine doppelt" o={o1 * lauf(t, 9.2, 10)} farbe={C.gold} voll breite={220} />
      <Pille x={180} y={282} text="3 · 60° = 180° → Lücke geschlossen" o={o2 * lauf(t, 18.2, 19)} farbe={C.gold} voll breite={270} />
    </g>
  );
}

/* ---------- 4 · Euler und das Gitter ---------- */
const U_DAUER = 31;
const uSchritte = () => [
  { von: 0, text: "Zählen am Würfel. Zuerst die Ecken: Es sind 8." },
  { von: 4, text: "Dann die Kanten: 12." },
  { von: 8.5, text: "Und die Flächen: 6. Jetzt rechnen wir Ecken minus Kanten plus Flächen: 8 − 12 + 6 = 2." },
  { von: 13, text: "Bei allen fünf Körpern kommt 2 heraus – und bei jedem anderen konvexen Körper auch. Das ist der Eulersche Polyedersatz: e − k + f = 2." },
  { von: 19, text: "Mit p · f = 2k und q · e = 2k folgt daraus (p − 2)(q − 2) < 4. Im Gitter aller Paare (p, q) liegen nur fünf Punkte unter der Grenzkurve – genau die fünf Körper." },
  { von: 26, text: "Auf der Kurve selbst liegen (3, 6), (4, 4) und (6, 3): die drei Fliesenmuster mit genau 360°. Zwei Beweise, ein Ergebnis." },
];
function uZeichne(t) {
  const w = koerper("wuerfel");
  const o1 = 1 - lauf(t, 12.4, 13.1), o2 = fenster(t, 13, 13.7, 18.4, 19.1), o3 = lauf(t, 19, 19.7);
  const R = matMal(rotX(0.42), rotY(-0.62 + 0.12 * t));
  const ne = Math.min(8, Math.floor(mix(0, 8.999, lauf(t, 0.6, 3.6))));
  const nk = Math.min(12, Math.floor(mix(0, 12.999, lauf(t, 4.4, 8))));
  const nf = Math.min(6, Math.floor(mix(0, 6.999, lauf(t, 8.8, 11))));
  const gx = (p) => 64 + (p - 3) * 80, gy = (q) => 252 - (q - 3) * 58;
  const kurve = [];
  for (let p = 2.7; p <= 6.45; p += 0.04) { const q = 2 + 4 / (p - 2); if (q <= 6.45 && q >= 2.7) kurve.push([gx(p), gy(q)]); }
  return (
    <g>
      {o1 > 0.001 && (
        <g opacity={o1}>
          <KoerperSvg k={w} R={R} cx={118} cy={136} s={92} modus="draht" eckenGold={ne} kantenGold={nk} />
          <KoerperSvg k={w} R={R} cx={118} cy={136} s={92} flaechenGold={nf} o={lauf(t, 8.6, 9.2) * 0.85} breite={1.1} />
          {[["e", "Ecken", ne, 0.4], ["k", "Kanten", nk, 4.2], ["f", "Flächen", nf, 8.6]].map(([b, n, z, a], i) => (
            <g key={b} opacity={lauf(t, a, a + 0.6)}>
              <T x="236" y={80 + i * 44} fontSize="14" fontWeight="600" fill={C.grau}>{n}</T>
              <T x="340" y={80 + i * 44} textAnchor="end" fontSize="24" fontWeight="800" fill={C.seeTief}>{z}</T>
            </g>
          ))}
          <T x="180" y="282" textAnchor="middle" fontSize="21" fontWeight="800" fill={C.tinte} opacity={lauf(t, 10.6, 11.6)}>
            e − k + f = 8 − 12 + 6 = <tspan fill={C.gold}>2</tspan>
          </T>
        </g>
      )}
      {o2 > 0.001 && (
        <g opacity={o2}>
          <T x="180" y="34" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.tinte}>e − k + f bei allen fünf</T>
          {KOERPER.map((k, i) => (
            <g key={k.id} opacity={lauf(t, 13.4 + i * 0.6, 14 + i * 0.6)}>
              <rect x="26" y={54 + i * 46} width="308" height="38" rx="12" fill={C.weiss} stroke={C.linie} strokeWidth="1.2" />
              <circle cx="46" cy={73 + i * 46} r="7" fill={k.farbe} />
              <T x="62" y={78 + i * 46} fontSize="14" fontWeight="800" fill={C.tinte}>{k.name}</T>
              <T x="318" y={78 + i * 46} textAnchor="end" fontSize="14" fontWeight="700" fill={C.tinte}>{k.e} − {k.k} + {k.f} = <tspan fill={C.gold} fontWeight="800">2</tspan></T>
            </g>
          ))}
        </g>
      )}
      {o3 > 0.001 && (
        <g opacity={o3}>
          <T x="200" y="24" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.tinte}>(p − 2)(q − 2) &lt; 4</T>
          <line x1={gx(2.7)} y1={gy(2.7)} x2={gx(6.5)} y2={gy(2.7)} stroke={C.tinte} strokeWidth="1.2" />
          <line x1={gx(2.7)} y1={gy(2.7)} x2={gx(2.7)} y2={gy(6.45)} stroke={C.tinte} strokeWidth="1.2" />
          <T x={gx(6.5) + 4} y={gy(2.7) + 4} fontSize="13" fontWeight="800" fill={C.grau}>p</T>
          <T x={gx(2.7)} y={gy(6.45) - 8} textAnchor="middle" fontSize="13" fontWeight="800" fill={C.grau}>q</T>
          {[3, 4, 5, 6].map((p) => <T key={`p${p}`} x={gx(p)} y={gy(2.7) + 15} textAnchor="middle" fontSize="11" fill={C.grau}>{p}</T>)}
          {[3, 4, 5, 6].map((q) => <T key={`q${q}`} x={gx(2.7) - 6} y={gy(q) + 4} textAnchor="end" fontSize="11" fill={C.grau}>{q}</T>)}
          <polyline points={punkteText(kurve.slice(0, Math.max(2, Math.round(kurve.length * lauf(t, 19.6, 21.6)))))} fill="none" stroke={C.signal} strokeWidth="2" strokeDasharray="5 4" />
          {[3, 4, 5, 6].flatMap((p) => [3, 4, 5, 6].map((q) => {
            const w2 = (p - 2) * (q - 2), gut = w2 < 4, grenze = w2 === 4;
            const og = gut ? lauf(t, 22, 23.2) : grenze ? lauf(t, 26.2, 27.2) : 1;
            return (
              <g key={`${p}-${q}`}>
                <circle cx={gx(p)} cy={gy(q)} r={gut ? mix(3, 7, og) : grenze ? mix(3, 6, og) : 3} fill={gut ? (og > 0.5 ? C.flaggold : C.hellgrau) : grenze ? C.weiss : C.linie}
                  stroke={gut ? C.gold : grenze ? (og > 0.5 ? C.signal : C.hellgrau) : C.hellgrau} strokeWidth={grenze ? 2 : 1} />
              </g>
            );
          }))}
          {[["Tetraeder", 3, 3], ["Oktaeder", 3, 4], ["Ikosaeder", 3, 5], ["Würfel", 4, 3], ["Dodekaeder", 5, 3]].map(([n, p, q], i) => (
            <T key={n} x={gx(p) + (p === 3 ? 12 : 0)} y={gy(q) - (p === 3 ? -4 : 12)} textAnchor={p === 3 ? "start" : "middle"} fontSize="10.5" fontWeight="800" fill={C.seeTief} stroke={C.sand} strokeWidth="3" paintOrder="stroke" opacity={lauf(t, 23 + i * 0.4, 23.6 + i * 0.4)}>{n}</T>
          ))}
          {[[6, 3], [4, 4], [3, 6]].map(([p, q]) => (
            <T key={`fl${p}`} x={gx(p) + 10} y={gy(q) - 8} fontSize="10.5" fontWeight="700" fill={C.signal} opacity={lauf(t, 26.6, 27.4)}>flach</T>
          ))}
        </g>
      )}
    </g>
  );
}

/* ---------- 5 · Dualität: Würfel ↔ Oktaeder ---------- */
const D_DAUER = 25;
const dSchritte = () => [
  { von: 0, text: "Ein Würfel hat sechs Flächen. In die Mitte jeder Fläche setzen wir einen Punkt." },
  { von: 4.5, text: "Jetzt verbinden wir die Punkte von Flächen, die eine Kante gemeinsam haben. Es entsteht ein Oktaeder – mitten im Würfel." },
  { von: 10, text: "Der Würfel hat 8 Ecken und 6 Flächen, das Oktaeder 6 Ecken und 8 Flächen. Ecken und Flächen tauschen die Rollen, die 12 Kanten bleiben. Man nennt die beiden Körper dual." },
  { von: 16, text: "Umgekehrt liefern die 8 Flächenmitten des Oktaeders wieder einen Würfel. Genauso gehören Dodekaeder und Ikosaeder zusammen, und das Tetraeder ist zu sich selbst dual." },
];
function dZeichne(t) {
  const w = koerper("wuerfel"), ok = koerper("oktaeder");
  const R = matMal(rotX(0.4), rotY(0.3 + 0.04 * t));
  const ow = 1 - lauf(t, 16.4, 17.6) * 0.85;
  const wachs = mix(1, Math.sqrt(3), lauf(t, 16.4, 18));                 // Flächenmitten des Würfels liegen im Abstand 1 durch Wurzel 3
  const punkte = lauf(t, 0.6, 3.6) * 6;
  const dual = dualVon(w);
  const v = dual.ecken.map((p) => matVek(R, vek.mal(p, wachs)));
  const b = v.map((p) => bildpunkt(p, { cx: 180, cy: 138, s: 96 }));
  const linien = lauf(t, 5, 8.4);
  const zurueck = lauf(t, 18.6, 20.6);
  return (
    <g>
      <KoerperSvg k={w} R={R} cx={180} cy={138} s={96} modus="draht" o={ow} breite={1.2} />
      {dual.kanten.map((ka, i) => {
        const p = Math.max(0, Math.min(1, linien * 12 - i));
        if (p <= 0) return null;
        const hinten = (v[ka.a][2] + v[ka.b][2]) / 2 < -0.05;
        return <line key={i} x1={b[ka.a][0]} y1={b[ka.a][1]} x2={mix(b[ka.a][0], b[ka.b][0], p)} y2={mix(b[ka.a][1], b[ka.b][1], p)} stroke={C.gold}
          strokeWidth={hinten ? 1.4 : 2.4} strokeOpacity={hinten ? 0.55 : 1} strokeDasharray={hinten ? "3 3" : undefined} strokeLinecap="round" />;
      })}
      {b.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3.6 * Math.max(0, Math.min(1, punkte - i))} fill={C.flaggold} stroke={C.gold} strokeWidth="1" />)}
      {zurueck > 0.001 && <DualSvg k={ok} R={R} cx={180} cy={138} s={96} skala={Math.sqrt(3)} o={zurueck} farbe={C.see} />}
      {[["Würfel", 8, 12, 6, C.see, 0], ["Oktaeder", 6, 12, 8, C.gold, 1]].map(([n, e, k, f, fb, i]) => (
        <g key={n} opacity={fenster(t, 10.3 + i * 0.6, 11 + i * 0.6, 23.4, 24)}>
          <rect x={22 + i * 166} y="250" width="150" height="40" rx="12" fill={C.weiss} stroke={fb} strokeWidth="1.5" />
          <T x={97 + i * 166} y="267" textAnchor="middle" fontSize="12" fontWeight="800" fill={fb}>{n}</T>
          <T x={97 + i * 166} y="284" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.tinte}>e {e} · k {k} · f {f}</T>
        </g>
      ))}
      <T x="180" y="276" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.gold} opacity={fenster(t, 11.6, 12.4, 23.4, 24)}>⇄</T>
      <Pille x={180} y={258} text="Dodekaeder ⇄ Ikosaeder" o={lauf(t, 23.6, 24.4)} farbe={C.gold} breite={230} />
      <Pille x={180} y={290} text="Tetraeder ⇄ Tetraeder" o={lauf(t, 23.8, 24.6)} farbe={C.gold} breite={230} />
    </g>
  );
}

export const PLATON_ANIM = {
  fuenf: { titel: () => "Die fünf regelmäßigen Körper", unter: () => "Tetraeder, Würfel, Oktaeder, Dodekaeder, Ikosaeder – und kein sechster",
    szene: () => ({ dauer: F_DAUER, hoehe: 300, schritte: fSchritte(), zeichne: fZeichne,
      beschreibung: "Animation: Die fünf platonischen Körper erscheinen nacheinander, drehen sich und ordnen sich in einer Reihe an: Tetraeder, Würfel, Oktaeder, Dodekaeder, Ikosaeder." }) },
  ecke: { titel: () => "Flächen um eine Ecke legen – bis 360°", unter: () => "Lücke → Ecke, genau 360° → flach: nur fünf Ecken bleiben übrig",
    szene: () => ({ dauer: E_DAUER, hoehe: 300, schritte: eSchritte(), zeichne: eZeichne,
      beschreibung: "Animation: Drei, vier, fünf und sechs Dreiecke, drei und vier Quadrate, drei Fünfecke und drei Sechsecke werden um einen Punkt gelegt. Bleibt eine Lücke unter 360°, klappen die Flächen zu einer Ecke hoch; bei genau 360° liegen sie flach." }) },
  netz: { titel: () => "Das Netz faltet sich", unter: () => "Aus sechs Quadraten wird ein Würfel, aus vier Dreiecken ein Tetraeder",
    szene: () => ({ dauer: N_DAUER, hoehe: 300, schritte: nSchritte(), zeichne: nZeichne,
      beschreibung: "Animation: Ein kreuzförmiges Würfelnetz faltet sich räumlich zu einem Würfel, danach faltet sich ein Netz aus vier Dreiecken zum Tetraeder." }) },
  euler: { titel: () => "Ecken, Kanten, Flächen: e − k + f = 2", unter: () => "Zählen am Würfel, alle fünf Körper – und das Gitter mit nur fünf Punkten",
    szene: () => ({ dauer: U_DAUER, hoehe: 300, schritte: uSchritte(), zeichne: uZeichne,
      beschreibung: "Animation: Am Würfel werden 8 Ecken, 12 Kanten und 6 Flächen gezählt, 8 − 12 + 6 = 2. Eine Tabelle zeigt e − k + f = 2 für alle fünf Körper. Im Gitter der Paare (p, q) liegen nur fünf Punkte unter der Kurve (p − 2)(q − 2) = 4." }) },
  dual: { titel: () => "Dualität: Würfel und Oktaeder", unter: () => "Flächenmitten verbinden – Ecken und Flächen tauschen die Rollen",
    szene: () => ({ dauer: D_DAUER, hoehe: 300, schritte: dSchritte(), zeichne: dZeichne,
      beschreibung: "Animation: In die Flächenmitten eines Würfels werden Punkte gesetzt und verbunden – es entsteht ein Oktaeder. Ecken und Flächen tauschen ihre Anzahl, die Kanten bleiben gleich." }) },
};
export function PlatonAnimation({ art, offen = false }) {
  return <AnimKarte szenen={PLATON_ANIM} art={art} offen={offen} merkmal="data-platon-anim" />;
}

/* ======================================================================
   Körper-Labor
   ====================================================================== */
function Labor() {
  const [id, setId] = useState("wuerfel");
  const [modus, setModus] = useState("flaechen");
  const [dual, setDual] = useState(false);
  const [netzAn, setNetzAn] = useState(false);
  const [netzId, setNetzId] = useState(null);
  const k = koerper(id);
  const hatNetz = !!NETZE[id];
  const zeigeNetz = netzAn && hatNetz;
  const nz = hatNetz ? netzFuer(id, netzId) : null;
  const S = k.q * innenwinkel(k.p);
  const du = koerper(k.dual);
  const waehle = (x) => { setId(x); setNetzId(null); if (!NETZE[x]) setNetzAn(false); };
  return (
    <div>
      <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 10 }} role="group" aria-label="Körper wählen">
        {KOERPER.map((x) => (
          <button key={x.id} type="button" onClick={() => waehle(x.id)} aria-pressed={id === x.id} style={PILLE(id === x.id)}>
            <span aria-hidden="true" style={{ display: "inline-block", width: 8, height: 8, borderRadius: 99, background: x.farbe, marginRight: 6, verticalAlign: "1px" }} />{x.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center" style={{ gap: 6, marginBottom: 12 }}>
        {!zeigeNetz && (
          <>
            <button type="button" onClick={() => setModus("flaechen")} aria-pressed={modus === "flaechen"} style={PILLE(modus === "flaechen")}>Flächen</button>
            <button type="button" onClick={() => setModus("draht")} aria-pressed={modus === "draht"} style={PILLE(modus === "draht")}>Drahtmodell</button>
            <button type="button" onClick={() => setDual((d) => !d)} aria-pressed={dual} style={PILLE(dual)}>Dualkörper</button>
          </>
        )}
        {hatNetz && (
          <button type="button" onClick={() => setNetzAn((n) => !n)} aria-pressed={zeigeNetz} style={{ ...PILLE(zeigeNetz), marginLeft: zeigeNetz ? 0 : "auto" }}>
            {zeigeNetz ? "Zurück zum Körper" : "Netz ausklappen"}
          </button>
        )}
        {zeigeNetz && NETZE[id].map((n) => (
          <button key={n.id} type="button" onClick={() => setNetzId(n.id)} aria-pressed={nz.id === n.id} style={PILLE(nz.id === n.id)}>{n.name}</button>
        ))}
      </div>
      {zeigeNetz
        ? <NetzBuehne key={`${id}-${nz.id}`} netz={nz.netz} farbe={k.farbe} />
        : <KoerperBuehne k={k} modus={modus} dual={dual} />}

      <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.7, margin: "14px 0 2px" }}>
        <b>{k.name}</b>{k.auch ? ` (${k.auch})` : ""}: {k.f} {k.flaechenName}, an jeder Ecke {k.q}. Kurz: {k.schlaefli}.
        {dual && !zeigeNetz && <> In Gold: der Dualkörper, ein {du.name === k.name ? `zweites ${du.name}` : du.name} – {du.e} Ecken, {du.k} Kanten, {du.f} Flächen.</>}
        {zeigeNetz && <> Faltwinkel: {id === "wuerfel" ? "90°" : "≈ 109,47°"} (180° minus dem Winkel zwischen zwei Flächen).</>}
      </p>
      <Formeln zeilen={[
        `${k.q} \\cdot ${dk(innenwinkel(k.p))}° = ${dk(S)}° < 360° \\quad \\text{(Defizit } ${dk(defizit(k))}°)`,
        `e - k + f = ${k.e} - ${k.k} + ${k.f} = 2`,
      ]} max={16} />
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, color: C.tinte, fontVariantNumeric: "tabular-nums" }} data-euler-tabelle="">
          <thead>
            <tr style={{ color: C.grau, fontSize: 12, textAlign: "right" }}>
              <th style={{ textAlign: "left", fontWeight: 600, padding: "6px 4px" }}>Körper</th>
              <th style={{ fontWeight: 600, padding: "6px 4px" }} title="Ecken">e</th>
              <th style={{ fontWeight: 600, padding: "6px 4px" }} title="Kanten">k</th>
              <th style={{ fontWeight: 600, padding: "6px 4px" }} title="Flächen">f</th>
              <th style={{ fontWeight: 600, padding: "6px 4px", whiteSpace: "nowrap" }}>e − k + f</th>
            </tr>
          </thead>
          <tbody>
            {KOERPER.map((x) => {
              const an = x.id === id;
              return (
                <tr key={x.id} style={{ background: an ? "#FFF6D6" : "transparent", borderTop: `1px solid ${C.linie}`, textAlign: "right" }}>
                  <td style={{ textAlign: "left", padding: "7px 4px" }}>
                    <button type="button" onClick={() => waehle(x.id)} style={{ background: "none", border: "none", padding: 0, fontFamily: "inherit", fontSize: 13.5, fontWeight: an ? 700 : 500, color: C.tinte, cursor: "pointer", textAlign: "left" }}>
                      <span aria-hidden="true" style={{ display: "inline-block", width: 8, height: 8, borderRadius: 99, background: x.farbe, marginRight: 6 }} />{x.name}
                      <span style={{ display: "block", fontSize: 11, color: C.grau, fontWeight: 400, paddingLeft: 14 }}>{x.f} {x.flaechenName} · {x.schlaefli}</span>
                    </button>
                  </td>
                  <td style={{ padding: "7px 4px" }}>{x.e}</td>
                  <td style={{ padding: "7px 4px" }}>{x.k}</td>
                  <td style={{ padding: "7px 4px" }}>{x.f}</td>
                  <td style={{ padding: "7px 4px", fontWeight: 700, color: C.gold }}>{x.e - x.k + x.f}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======================================================================
   Übungen
   ====================================================================== */
function Feld({ k, label, einheit, wert, setzen, stand, onEnter, breite = 84 }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 500, color: C.tinte }}>
      <span>{label} =</span>
      <input value={wert} onChange={(e) => setzen(k, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
        inputMode="decimal" aria-label={label} placeholder="?" style={{ ...ZELLE(stand), width: breite }} />
      <span style={{ fontSize: 13.5, color: C.grau }}>{einheit}</span>
    </label>
  );
}
function Stufen({ stufe, setzen }) {
  return (
    <div className="flex items-center flex-wrap" style={{ gap: 10, marginBottom: 16 }}>
      <span style={{ fontSize: 13.5, color: C.grau, fontWeight: 300 }}>Schwierigkeit</span>
      <PlusMinus setzen={(d) => setzen(stufe + d)} label="Schwierigkeit" />
      <div className="flex" style={{ gap: 4 }}>
        {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ width: 9, height: 9, borderRadius: 999, background: s <= stufe ? C.see : C.linie, display: "inline-block" }} />)}
      </div>
      <span style={{ fontSize: 13.5, color: C.gruenDunkel, fontWeight: 600 }}>{stufe} / 5</span>
    </div>
  );
}
/* Hexomino als flache Figur */
function NetzFigur({ zellen, rot = [] }) {
  const w = Math.max(...zellen.map((c) => c[0])) + 1, h = Math.max(...zellen.map((c) => c[1])) + 1;
  const a = Math.min(40, 210 / Math.max(w, h));
  const roteZ = new Set(rot);
  return (
    <svg viewBox={`-4 -4 ${w * a + 8} ${h * a + 8}`} style={{ width: Math.min(260, w * a + 8), maxWidth: "100%", display: "block", margin: "6px auto 14px" }} role="img"
      aria-label={`Figur aus sechs Quadraten, ${w} breit und ${h} hoch`} data-hexomino={zellen.map((c) => c.join(":")).join(" ")}>
      {zellen.map(([x, y], i) => (
        <rect key={i} x={x * a} y={(h - 1 - y) * a} width={a} height={a} rx="2" fill={roteZ.has(i) ? "#F6D3CF" : C.himmel} stroke={roteZ.has(i) ? "#D9483B" : C.see} strokeWidth="1.6" />
      ))}
    </svg>
  );
}
const WAHLEN = ["ecke", "flach", "ueber"];
function Trainer() {
  const [art, setArt] = useState("winkel");
  const [stufe, setStufe] = useState(2);
  const [auf, setAufRoh] = useState(() => merk(aufgabe("winkel", 2)));
  const setAuf = (a) => setAufRoh(merk(a));
  const [ein, setEin] = useState({});
  const [erg, setErg] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });
  const neu = (a = art, s = stufe) => { setAuf(aufgabe(a, s)); setEin({}); setErg(null); setZeigen(false); };
  const artSetzen = (a) => { setArt(a); neu(a, stufe); };
  const stufeSetzen = (s) => { const v = Math.max(1, Math.min(5, s)); setStufe(v); neu(art, v); };
  const setze = (k, v) => { setEin((e) => ({ ...e, [k]: v })); setErg(null); };
  const fe = felder(auf);
  const leer = auf.art === "netz" ? ein.netz === undefined
    : fe.some(([k]) => !String(ein[k] ?? "").trim()) || (auf.art === "winkel" && !ein.wahl);
  const pruefen = () => {
    if (leer) return;
    const e = pruefe(auf, auf.art === "netz" ? ein.netz : ein);
    setErg(e);
    setSerie((x) => ({ n: x.n + 1, ok: x.ok + (e.ok ? 1 : 0) }));
  };
  const weg = rechenweg(auf);
  const netzErklaerung = auf.art === "netz" ? (auf.istNetz ? "Ein Würfelnetz: Beim Falten findet jede Fläche ihren eigenen Platz." : grundText(auf.grund)) : "";
  return (
    <div>
      <p style={{ ...FLIESS, lineHeight: 1.7, marginBottom: 18 }}>
        Vier Aufgabentypen: prüfen, ob Flächen eine Ecke bilden, Ecken und Kanten durch geschicktes Zählen bestimmen,
        mit dem Eulerschen Polyedersatz die fehlende Zahl finden und Würfelnetze erkennen.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ARTEN.map((a) => <Chip key={a.id} aktiv={art === a.id} onClick={() => artSetzen(a.id)}>{a.name}</Chip>)}
      </div>
      <Stufen stufe={stufe} setzen={stufeSetzen} />
      <div style={KARTE} data-mm-karte="" data-platontrainer={auf.art}>
        <p style={{ fontSize: 15, color: C.tinte, fontWeight: 400, lineHeight: 1.7, marginBottom: 4 }}>{auftrag(auf)}</p>
        {auf.art !== "netz" && <Formeln zeilen={[aufgabeTex(auf)]} max={18} />}
        {auf.art === "netz" && <NetzFigur zellen={auf.zellen} rot={erg ? auf.doppelt.flat() : []} />}
        {fe.length > 0 && (
          <div className="flex flex-wrap" style={{ gap: 14, marginBottom: 12 }}>
            {fe.map(([k, label, einheit]) => (
              <Feld key={k} k={k} label={label} einheit={einheit} wert={ein[k] ?? ""} setzen={setze} stand={erg ? erg.felder[k] : null} onEnter={pruefen} />
            ))}
          </div>
        )}
        {auf.art === "winkel" && (
          <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 14 }} role="group" aria-label="Ergebnis an der Ecke">
            {WAHLEN.map((w) => {
              const an = ein.wahl === w, gut = an && erg && erg.felder.wahl, schlecht = an && erg && !erg.felder.wahl;
              return (
                <button key={w} type="button" onClick={() => setze("wahl", w)} aria-pressed={an}
                  style={{ minHeight: 40, padding: "6px 12px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, cursor: "pointer",
                    border: `1.5px solid ${gut ? C.see : schlecht ? C.signal : an ? C.see : C.linie}`, background: gut ? C.himmel : an ? "#F3F7FD" : C.weiss, color: C.tinte }}>
                  {ARTNAME[w]}
                </button>
              );
            })}
          </div>
        )}
        {auf.art === "netz" && (
          <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 14 }} role="group" aria-label="Würfelnetz?">
            {[[true, "Ja, ein Würfelnetz"], [false, "Nein, kein Würfelnetz"]].map(([w, txt]) => {
              const an = ein.netz === w, gut = an && erg && erg.ok, schlecht = an && erg && !erg.ok;
              return (
                <button key={txt} type="button" onClick={() => setze("netz", w)} aria-pressed={an}
                  style={{ minHeight: 40, padding: "6px 14px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, cursor: "pointer",
                    border: `1.5px solid ${gut ? C.see : schlecht ? C.signal : an ? C.see : C.linie}`, background: gut ? C.himmel : an ? "#F3F7FD" : C.weiss, color: C.tinte }}>
                  {txt}
                </button>
              );
            })}
          </div>
        )}
        {erg && erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.see, marginBottom: 2 }}>Stimmt!</p>
            {auf.art === "netz" ? <p style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>{netzErklaerung}</p> : <Formeln zeilen={weg} max={15} farbe={C.see} />}
          </div>
        )}
        {erg && !erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>Stimmt noch nicht.</p>
            <p style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>{erg.grund || tipp(auf)}</p>
            {auf.art !== "netz" && !zeigen && <button onClick={() => setZeigen(true)} className="mt-3" style={LINK}>Rechenweg zeigen</button>}
            {auf.art !== "netz" && zeigen && <Formeln zeilen={weg} max={15} farbe={C.see} />}
          </div>
        )}
        {erg && auf.art === "netz" && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 8 }}>Selbst falten{auf.istNetz ? "" : " – die roten Flächen landen aufeinander"}</p>
            <NetzBuehne key={auf.zellen.map((c) => c.join(":")).join(" ")} netz={wuerfelNetz(auf.zellen)} farbe={koerper("wuerfel").farbe} rot={auf.doppelt.flat()} label="Netz falten" hoehe={250} />
          </div>
        )}
        {!(erg && erg.ok) && <button onClick={pruefen} disabled={leer} className="px-6 py-3" style={KNOPF(!leer)}>Prüfen</button>}
      </div>
      <div className="flex flex-wrap gap-3 mt-5">
        <button onClick={() => neu()} className="px-6 py-3" style={KNOPF(true, C.gruenDunkel)}>Nächste Aufgabe</button>
        {serie.n > 0 && <span className="flex items-center" style={{ fontSize: 13, color: C.grau }}>{serie.ok} von {serie.n} richtig</span>}
      </div>
    </div>
  );
}

/* ---------- Begründen: zwei Lückenbeweise ---------- */
function Begruenden() {
  const [welche, setWelche] = useState(0);
  const [antworten, setAntworten] = useState({});
  const b = BEGRUENDUNGEN[welche];
  const fertig = b.schritte.every((_, i) => antworten[`${b.id}-${i}`] === b.schritte[i].richtig);
  const NAMEN = { winkel: "Mit Winkeln", euler: "Mit Euler" };
  return (
    <div data-begruenden={b.id}>
      <div className="flex flex-wrap gap-2" style={{ marginBottom: 14 }}>
        {BEGRUENDUNGEN.map((x, i) => <Chip key={x.id} aktiv={welche === i} onClick={() => setWelche(i)}>{NAMEN[x.id]}</Chip>)}
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte, lineHeight: 1.35, marginBottom: 4 }}>{b.titel}</p>
      <Formeln zeilen={[b.ziel]} max={17} />
      {b.schritte.map((st, i) => {
        const key = `${b.id}-${i}`, gewaehlt = antworten[key];
        const offen = i === 0 || antworten[`${b.id}-${i - 1}`] === b.schritte[i - 1].richtig;
        if (!offen) return null;
        return (
          <div key={key} className="auftauchen" style={{ borderTop: `1px solid ${C.linie}`, padding: "12px 0 6px" }}>
            <Text s={`${i + 1}. ${st.text}`} style={{ fontSize: 14.5, color: C.tinte, fontWeight: 400, lineHeight: 1.8, marginBottom: 8 }} />
            <div className="flex flex-wrap" style={{ gap: 6 }}>
              {gemischt(st.optionen, i + welche).map((o) => {
                const an = gewaehlt === o, gut = an && o === st.richtig, schlecht = an && o !== st.richtig;
                return (
                  <button key={o} type="button" onClick={() => setAntworten((a) => ({ ...a, [key]: o }))} aria-pressed={an}
                    style={{ minHeight: 40, padding: "6px 12px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, cursor: "pointer", textAlign: "left",
                      border: `1.5px solid ${gut ? C.see : schlecht ? C.signal : C.linie}`, background: gut ? C.himmel : C.weiss, color: C.tinte }}>
                    <Inline s={st.optionen[o]} />
                  </button>
                );
              })}
            </div>
            {gewaehlt !== undefined && gewaehlt !== st.richtig && <p style={{ fontSize: 13, color: C.signal, marginTop: 6 }}>Noch nicht – lies den Satz noch einmal mit dieser Antwort.</p>}
          </div>
        );
      })}
      {fertig && (
        <div className="auftauchen" style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 14, marginTop: 10 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.see }}>Beweis vollständig.</p>
          <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>Für die GFS: Erzähl die Schritte in deinen eigenen Worten an der Tafel nach – zuerst den Winkelbeweis, den Zählbeweis als Zugabe für das Kolloquium.</p>
        </div>
      )}
      <button type="button" onClick={() => setAntworten({})} style={{ ...LINK, marginTop: 12 }}>Von vorn</button>
    </div>
  );
}

/* ======================================================================
   Die Seite
   ====================================================================== */
export function GfsPlatonischSeite({ gehe }) {   // eslint-disable-line no-unused-vars
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Warum gibt es genau fünf regelmäßige Körper?
      </h2>
      <Text s={"Regelmäßige Vielecke gibt es unendlich viele: Dreieck, Quadrat, Fünfeck, Sechseck und so weiter. Man würde erwarten, dass es auch unendlich viele regelmäßige Körper gibt. Doch es sind nur fünf – schon die Griechen der Antike wussten das. Der Grund ist überraschend einfach und passt an eine einzige Ecke."} style={FLIESS} />

      <PlatonAnimation art="fuenf" offen />

      <Schritt nr="1" titel="Was heißt „regelmäßig“?" />
      <Text s={"Ein platonischer Körper erfüllt drei Bedingungen: Er ist konvex (ohne Dellen), alle Flächen sind deckungsgleiche regelmäßige Vielecke, und an jeder Ecke treffen sich gleich viele Flächen. Gibt es $f$ Flächen, die alle $p$-Ecke sind, und treffen sich an jeder Ecke $q$ Flächen, schreibt man kurz $\\{p, q\\}$ – der Würfel ist $\\{4, 3\\}$."} style={FLIESS} />
      <Text s={"Die dritte Bedingung ist wichtig: Klebt man zwei Tetraeder an einer Fläche zusammen, entsteht eine Doppelpyramide aus sechs gleichseitigen Dreiecken. Alle Flächen sind gleich – aber an drei Ecken treffen sich vier Flächen, an zwei Ecken nur drei. Regelmäßig ist sie also nicht."} style={FLIESS} />

      <Schritt nr="2" titel="Der Innenwinkel eines regelmäßigen n-Ecks" />
      <Text s={"Von einer Ecke aus lässt sich jedes $n$-Eck in $n - 2$ Dreiecke zerlegen. Seine Winkelsumme ist deshalb $(n - 2) \\cdot 180°$, und im regelmäßigen $n$-Eck sind alle $n$ Winkel gleich groß:"} style={FLIESS} />
      <Formeln zeilen={[
        "\\alpha_{n} = \\frac{(n - 2) \\cdot 180°}{n}",
        "\\alpha_{3} = 60°, \\quad \\alpha_{4} = 90°, \\quad \\alpha_{5} = 108°",
        "\\alpha_{6} = 120°, \\quad \\alpha_{7} \\approx 128,57°, \\quad \\alpha_{8} = 135°",
      ]} />
      <Text s={"Je mehr Ecken, desto größer der Winkel – er kommt $180°$ immer näher, erreicht ihn aber nie."} style={FLIESS} />

      <Schritt nr="3" titel="Was an einer Ecke passieren muss" />
      <Text s={"Zwei Flächen treffen sich nur in einer Kante. Für eine räumliche Ecke braucht man mindestens drei Flächen: $q \\ge 3$. Legt man sie flach um einen Punkt, entscheidet die Winkelsumme. Bleibt eine Lücke, kann man sie zukleben – dann klappen die Flächen hoch, und es entsteht eine Ecke. Bei genau $360°$ liegen die Flächen flach in der Ebene, bei mehr als $360°$ überlappen sie sich."} style={FLIESS} />
      <Formeln zeilen={["q \\cdot \\alpha_{p} < 360°, \\qquad q \\ge 3"]} max={20} />
      <PlatonAnimation art="ecke" />

      <Schritt nr="4" titel="Alle Fälle durchgehen" />
      <Text s={"Mit mindestens drei Flächen gilt $3 \\cdot \\alpha_{p} < 360°$, also $\\alpha_{p} < 120°$. Das schaffen nur Dreieck, Quadrat und Fünfeck – ab dem Sechseck ist der Winkel mindestens $120°$. Für jede der drei Flächenarten bleibt nur eine kleine Auswahl:"} style={FLIESS} />
      <Formeln zeilen={[
        "p = 3: \\quad q \\cdot 60° < 360° \\;\\Rightarrow\\; q < 6 \\;\\Rightarrow\\; q \\in \\{3, 4, 5\\}",
        "p = 4: \\quad q \\cdot 90° < 360° \\;\\Rightarrow\\; q < 4 \\;\\Rightarrow\\; q = 3",
        "p = 5: \\quad q \\cdot 108° < 360° \\;\\Rightarrow\\; q < 3,\\overline{3} \\;\\Rightarrow\\; q = 3",
        "p \\ge 6: \\quad 3 \\cdot \\alpha_{p} \\ge 360° \\;\\Rightarrow\\; \\text{keine Ecke}",
      ]} />
      <Kasten titel="Ergebnis">
        <Text s={"Es gibt höchstens fünf Möglichkeiten: $\\{3, 3\\}$, $\\{3, 4\\}$, $\\{3, 5\\}$, $\\{4, 3\\}$ und $\\{5, 3\\}$. Mehr regelmäßige Körper kann es nicht geben."}
          style={{ fontSize: 15, color: C.tinte, fontWeight: 500, lineHeight: 1.8, margin: "8px 0 10px" }} />
      </Kasten>

      <Schritt nr="5" titel="Jede Möglichkeit gibt es wirklich" />
      <Text s={"„Höchstens fünf“ heißt noch nicht „genau fünf“ – man muss jeden Körper auch bauen. $\\{3, 3\\}$ ist das Tetraeder, $\\{3, 4\\}$ das Oktaeder, $\\{3, 5\\}$ das Ikosaeder, $\\{4, 3\\}$ der Würfel und $\\{5, 3\\}$ das Dodekaeder. Tetraeder, Würfel und Oktaeder lassen sich direkt aus Netzen falten. Für Dodekaeder und Ikosaeder gibt es genaue Koordinaten mit dem goldenen Schnitt $\\varphi \\approx 1,618$ – das Labor unten zeichnet alle fünf genau daraus."} style={FLIESS} />
      <PlatonAnimation art="netz" />

      <Schritt nr="6" titel="Ein zweiter Blick: Ecken, Kanten, Flächen" />
      <Text s={"Zählt man bei einem Körper die Ecken $e$, die Kanten $k$ und die Flächen $f$, kommt immer dasselbe heraus – das ist der Eulersche Polyedersatz. Er gilt für jeden konvexen Körper, nicht nur für die fünf."} style={FLIESS} />
      <Formeln zeilen={["e - k + f = 2"]} max={20} />
      <Text s={"Daraus folgt ein zweiter Beweis ganz ohne Winkel. Jede Fläche hat $p$ Kanten und jede Kante gehört zu zwei Flächen, also $p \\cdot f = 2k$. Genauso gilt $q \\cdot e = 2k$. Eingesetzt und umgeformt:"} style={FLIESS} />
      <Formeln zeilen={[
        "\\frac{2k}{q} - k + \\frac{2k}{p} = 2 \\;\\Rightarrow\\; \\frac{1}{p} + \\frac{1}{q} = \\frac{1}{2} + \\frac{1}{k} > \\frac{1}{2}",
        "\\Rightarrow\\; (p - 2)(q - 2) < 4",
      ]} />
      <PlatonAnimation art="euler" />
      <Text s={"Verbindet man die Flächenmitten eines Würfels, entsteht ein Oktaeder: Ecken und Flächen tauschen ihre Anzahl, die Kanten bleiben gleich. Diese Dualität erklärt, warum in der Tabelle immer zwei Körper zusammengehören."} style={FLIESS} />
      <PlatonAnimation art="dual" />
      <Text s={"Zum Mitnehmen: An einer Ecke ist weniger als $360°$ Platz, und es müssen mindestens drei Flächen hin. Mehr braucht der Beweis nicht."} style={FLIESS} />

      <div style={{ ...KARTE, margin: "22px 0" }} data-platon-labor="">
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Körper-Labor: wählen, drehen, ausklappen</p>
        <Labor />
      </div>

      <Trenner />

      <Kicker>Jetzt selbst üben</Kicker>
      <H3>Ecken prüfen, zählen, Euler, Würfelnetze</H3>
      <Trainer />

      <div style={{ height: 30 }} />
      <Kicker>Begründen</Kicker>
      <H3>Den Beweis selbst zusammensetzen</H3>
      <div style={KARTE}><Begruenden /></div>

      <Trenner />

      <Kicker>Deine GFS</Kicker>
      <H3>Der rote Faden für den Vortrag</H3>
      <RoterFaden gliederung={GLIEDERUNG} tipps={TIPPS} hinweis="den Abschnitt mit Netzen, Euler und Dualität" />

      <div style={{ height: 8 }} />
      <Kicker>Kolloquium</Kicker>
      <H3>Die Fragen nach dem Vortrag trainieren</H3>
      <Kolloquium fragen={KOLLOQUIUM} speicher="mm-gfs-platonisch-kolloquium" />
    </div>
  );
}
