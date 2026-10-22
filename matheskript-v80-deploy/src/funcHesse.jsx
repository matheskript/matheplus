/* ============================================================
   Vektoren-Bereich: Hesse-Normalenform
   Vier Reiter, die man nacheinander durchgeht:
     Normalenvektor   – senkrecht ⇔ Skalarprodukt 0, X in der Ebene verschieben
     Normalenform     – Herleitung (x⃗ − p⃗)·n⃗ = 0 als Zeitleiste, X verlässt die Ebene,
                        Ausmultiplizieren zur Koordinatenform
     Hesse-Normalenform – n⃗₀ = n⃗/|n⃗|, Q einsetzen = Abstand mit Vorzeichen,
                        Schatten von PQ⃗ auf n⃗₀ im Bild
     Trainieren       – Ebene gegeben → HNF → Abstand eines Punktes, mit Vermutung,
                        Eingabe, Prüfen und vollständigem Rechenweg
   Farben: Ebene und Normalenvektor Blau, Punkt (X, Q) Gold, Lot/Ergebnis Smaragd.
   Logik rein in hesseKern.js. Eigenes 3D-Bild (orthografisch wie func16).
   Desktop ab 840 px: VekArbeit links, Bild rechts, Zeitleiste darunter.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useRef, useState } from "react";
import { C, HESSE_VIDEO_ID } from "./base1.jsx";
import { ErklaerVideo } from "./func1.jsx";
import { M } from "./func3.jsx";
import { DrehKnoepfe, FARBE_ACHSE, GRUND_AUS, GrundebenenGitter, GrundebenenSchalter, kamera } from "./func16.jsx";
import { useStateGebucht } from "./buchung.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { WeiterKnopf, WeiterMit } from "./funcWerkzeuge.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { SprachGruppe } from "./funcSprache.jsx";
import { MS } from "./mathText.jsx";
import { FeinKarte, Werkzeugleiste, useDesktop } from "./arbeitsflaeche.jsx";
import {
  BUEHNE, BUEHNE_SVG, Bild, Ergebnis, FallWahl, Fusszeile, HauptKnopf, Hinweis, Legende, ModusReiter, ObjektBox, ObjektReihe,
  RSchritt, Rechenweg, ReglerSpalten, Tafel, TippKacheln, VF, VekArbeit, VekBild, VekSeite,
} from "./vekUi.jsx";
import {
  BEISPIEL_EBENEN, LAGE_TEXT, X_TEX, abstandExakt, abstandTex, aufgabe, beispielEbene, betragKette, betragTex, hnfTex, hnfVektorTex,
  koordTex, laenge, lotfuss, mal, minusV, n0Tex, normalenformTex, orthoBasis, plus, pruefe, punktX, qSkalar, rechenweg, seite,
  skalar, skalarTex, spalteTex, termTex, zahl, zufallsNormale,
} from "./hesseKern.js";
import { q, qAbs, qNum } from "./rechnen2.js";

const BLAU = VF.eins;                 /* Ebene, Normalenvektor */
const BLAU_HELL = C.seeHell;          /* Richtungsvektoren in der Ebene */
const GOLD = VF.zwei, GOLD_TEXT = VF.zweiText;   /* Punkt X bzw. Q */
const SM = VF.drei, SM_TEXT = "#1F6E44";          /* Lot, Schatten, Ergebnis */

/* ---------- kleine Bausteine ---------- */

/* Formelzeile (TeX über M). Lange Zeilen umbrechen in M selbst; overflow nur als Sicherheitsnetz. */
function Formel({ t, gr = 16, farbe = C.tinte, links = false, stil }) {
  return (
    <div style={{ fontSize: gr, fontWeight: 600, color: farbe, lineHeight: 1.55, overflowX: "auto", overflowY: "hidden", padding: "4px 0 2px",
      textAlign: links ? "left" : "center", fontVariantNumeric: "tabular-nums", ...stil }}><M t={t} /></div>
  );
}
/* Vektornamen im Fließtext („n⃗“, „PX⃗“, „n⃗₀“) als echte Formel: der kombinierende Pfeil fehlt in Montserrat */
const vt = (s) => String(s).replace(/([A-Za-z]{1,2})\u20D7(₀)?/g, (_, b, o) => `$\\vec{${b}}${o ? "_0" : ""}$`);
const V = ({ s }) => <MS s={vt(s)} />;
const mitV = (kinder) => React.Children.map(kinder, (c) => (typeof c === "string" && c.includes("\u20D7") ? <V s={c} /> : c));
const Satz = ({ children, stil }) => <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "0 0 8px", ...stil }}>{mitV(children)}</p>;
const HinweisV = ({ art, children }) => <Hinweis art={art}>{mitV(children)}</Hinweis>;
const Abstand = ({ h = 6 }) => <div style={{ height: h }} />;
const punktTex = (name, p) => `${name}(${p.map(zahl).join(" | ")})`;

/* Regler als Spalten: + oben, Wert, − unten (wie die Geschwister am Desktop) */
function Regler({ werte }) {
  return (
    <ReglerSpalten spalten={werte.map((w) => ({
      key: w.name, farbe: w.farbe,
      plus: () => w.setze(Math.min(w.max, w.wert + 1)), minus: () => w.setze(Math.max(w.min, w.wert - 1)),
      plusLabel: `${w.label || w.name} erhöhen`, minusLabel: `${w.label || w.name} verringern`,
      mitte: <span data-hesse-regler={w.label || w.name} style={{ fontSize: 15, fontWeight: 800, color: w.farbe, fontVariantNumeric: "tabular-nums", lineHeight: 1.2, whiteSpace: "nowrap" }}>{w.name} = {zahl(w.wert)}</span>,
    }))} />
  );
}

/* Wie weit ein Parameter laufen darf, damit X im Bild bleibt */
const bereich = (v) => Math.max(1, Math.min(3, Math.floor(5 / laenge(v))));

/* Halbe Kantenlänge eines quadratischen Ebenenstücks um mitte, das alle punkte (in der Ebene) enthält */
function stueckGroesse(n, mitte, punkte, min = 3.5) {
  const [e1, e2] = orthoBasis(n);
  let r = min;
  for (const p of punkte) {
    const w = minusV(p, mitte);
    r = Math.max(r, Math.abs(skalar(w, e1)) + 1.2, Math.abs(skalar(w, e2)) + 1.2);
  }
  return r;
}

/* ---------- 3D-Bild ----------
   n, d: Ebene n⃗·x⃗ = d · stueck: { mitte, r } (quadratisches Stück der Ebene)
   elemente: { art: "punkt", p, farbe, label } | { art: "pfeil" | "strecke", von, bis, farbe, breite, strich, label, deckung }
             | { art: "winkel", an, d1, d2, farbe, gr }
   Was auf der Betrachterseite der Ebene liegt, wird über der Ebene gezeichnet, der Rest darunter. */
function HesseRaum({ n, d, stueck, elemente, legende, grund, W = 360, H = 320 }) {
  const [phi, setPhi] = useState(0.62);
  const [theta, setTheta] = useState(0.36);
  const gross = W > 400;
  const pts = elemente.flatMap((el) => [el.p, el.von, el.bis, el.an].filter(Boolean));
  const maxK = Math.max(3, ...pts.flatMap((p) => p.map(Math.abs)));
  const L = Math.min(9, Math.max(4, Math.ceil(maxK) + 1));
  const s = (Math.min(W, H) / 2 - 16) / (L * 1.5);
  const cam = kamera(phi, theta);
  const P = (p) => { const r = cam.proj(p); return [W / 2 + s * r.u, H / 2 - s * r.v]; };
  const vs = Math.sign(Math.round(skalar(n, cam.blick) * 1e6));
  const vorn = (p) => { const w = skalar(n, p) - d; return vs === 0 || Math.abs(w) < 1e-7 || Math.sign(w) === vs; };
  const mitteVon = (el) => el.p || el.an || el.von.map((x, i) => (x + el.bis[i]) / 2);

  // Ebenenstück
  const [e1, e2] = orthoBasis(n);
  const ecken = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([a, b]) => stueck.mitte.map((m, i) => m + stueck.r * (a * e1[i] + b * e2[i])));
  const pfad = ecken.map((p, k) => `${k ? "L" : "M"}${P(p)[0].toFixed(1)},${P(p)[1].toFixed(1)}`).join(" ") + " Z";

  // Achsen in Stücke vor / hinter der Ebene zerlegen
  const achsen = [0, 1, 2].map((k) => {
    const e = (t) => { const p = [0, 0, 0]; p[k] = t; return p; };
    const grenzen = [-L, L * 1.12];
    if (n[k] !== 0) { const t0 = d / n[k]; if (t0 > -L && t0 < L * 1.12) grenzen.splice(1, 0, t0); }
    const stuecke = [];
    for (let z = 0; z < grenzen.length - 1; z++) stuecke.push({ von: e(grenzen[z]), bis: e(grenzen[z + 1]), vorn: vorn(e((grenzen[z] + grenzen[z + 1]) / 2)) });
    return { k, stuecke, label: e(L * 1.24), spitze: e(L * 1.12) };
  });
  const achsLinie = (st, i, k) => { const [x1, y1] = P(st.von), [x2, y2] = P(st.bis);
    return <line key={`a${k}-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={FARBE_ACHSE[k]} strokeWidth="1.4" opacity="0.75" strokeLinecap="round" />; };

  const beschriftung = (x, y, text, farbe, key) => text ? (
    <text key={key} x={x} y={y} fontSize={gross ? 14 : 12.5} fontWeight="800" fontStyle="italic" fill={farbe} stroke="#fff" strokeWidth="3.2" paintOrder="stroke">{text}</text>
  ) : null;

  const zeichne = (el, key) => {
    if (el.art === "punkt") {
      const [x, y] = P(el.p);
      return (
        <g key={key} data-hesse-punkt={el.label}>
          <circle cx={x} cy={y} r={el.r || 5.2} fill={el.farbe} stroke={C.weiss} strokeWidth="1.8" />
          {beschriftung(x + 8, y - 7, el.label, el.farbe)}
        </g>
      );
    }
    if (el.art === "winkel") {
      const g = el.gr || 0.55;
      const a = el.an, p1 = a.map((v, i) => v + g * el.d1[i]), p2 = a.map((v, i) => v + g * (el.d1[i] + el.d2[i])), p3 = a.map((v, i) => v + g * el.d2[i]);
      const [x1, y1] = P(p1), [x2, y2] = P(p2), [x3, y3] = P(p3);
      return <path key={key} d={`M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} L${x3.toFixed(1)},${y3.toFixed(1)}`} fill="none" stroke={el.farbe} strokeWidth="1.5" />;
    }
    const [x1, y1] = P(el.von), [x2, y2] = P(el.bis);
    const b = el.breite || 2.6;
    const len = Math.hypot(x2 - x1, y2 - y1);
    let kopf = null, xe = x2, ye = y2;
    if (el.art === "pfeil" && len > 2) {
      const w = Math.atan2(y2 - y1, x2 - x1), k = Math.min(b * 3.8 + 2, len * 0.5), h = k * 0.5;
      xe = x2 - k * Math.cos(w); ye = y2 - k * Math.sin(w);
      kopf = <path d={`M${x2.toFixed(1)},${y2.toFixed(1)} L${(xe + h * Math.sin(w)).toFixed(1)},${(ye - h * Math.cos(w)).toFixed(1)} L${(xe - h * Math.sin(w)).toFixed(1)},${(ye + h * Math.cos(w)).toFixed(1)} Z`} fill={el.farbe} />;
    }
    const [lx, ly] = el.labelMitte ? [(x1 + x2) / 2 + 7, (y1 + y2) / 2 + 4] : [x2 + 6, y2 - 5];
    return (
      <g key={key} data-hesse-strecke={el.label || undefined} opacity={el.blass ? 0.55 : 1}>
        {el.deckung !== false && <line x1={x1} y1={y1} x2={xe} y2={ye} stroke="#fff" strokeWidth={b + 2.6} strokeLinecap="round" opacity="0.85" />}
        <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={el.farbe} strokeWidth={b} strokeLinecap={el.strich ? "butt" : "round"} strokeDasharray={el.strich} opacity={el.deckkraft} />
        {kopf}
        {beschriftung(lx, ly, el.label, el.labelFarbe || el.farbe)}
      </g>
    );
  };
  const hinten = elemente.filter((el) => !vorn(mitteVon(el)));
  const vorne = elemente.filter((el) => vorn(mitteVon(el)));

  // Ziehen dreht den Raum
  const ziehen = useRef(null);
  const start = (e) => { ziehen.current = { x: e.clientX, y: e.clientY, phi, theta }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const bewege = (e) => {
    if (!ziehen.current) return;
    setPhi(ziehen.current.phi - (e.clientX - ziehen.current.x) * 0.01);
    setTheta(Math.max(-1.35, Math.min(1.35, ziehen.current.theta + (e.clientY - ziehen.current.y) * 0.01)));
  };
  const ende = () => { ziehen.current = null; };

  return (
    <div data-hesse-bild="" style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={gross ? { ...BUEHNE_SVG, maxWidth: "none" } : BUEHNE_SVG} role="img" aria-label="3D-Bild der Ebene"
        onPointerDown={start} onPointerMove={bewege} onPointerUp={ende} onPointerLeave={ende}>
        <GrundebenenGitter an={grund} P={P} L={L} />
        {achsen.map((a) => a.stuecke.filter((st) => !st.vorn).map((st, i) => achsLinie(st, i, a.k)))}
        {hinten.map((el, i) => zeichne(el, `h${i}`))}
        <path d={pfad} fill={BLAU} fillOpacity="0.17" stroke={BLAU} strokeOpacity="0.55" strokeWidth="1.3" strokeLinejoin="round" />
        {achsen.map((a) => a.stuecke.filter((st) => st.vorn).map((st, i) => achsLinie(st, i, a.k)))}
        {achsen.map((a) => { const [x1, y1] = P(a.stuecke[a.stuecke.length - 1].von), [x2, y2] = P(a.spitze), [lx, ly] = P(a.label);
          return (
            <g key={`s${a.k}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={FARBE_ACHSE[a.k]} strokeWidth="1.4" opacity="0.75" />
              <text x={lx} y={ly + 4} textAnchor="middle" fontSize={gross ? 14 : 12.5} fontWeight="700" fontStyle="italic" fill={FARBE_ACHSE[a.k]}>x{["₁", "₂", "₃"][a.k]}</text>
            </g>
          ); })}
        {(() => { const [x, y] = P([0, 0, 0]); return <circle cx={x} cy={y} r="2.4" fill={C.tinte} />; })()}
        {vorne.map((el, i) => zeichne(el, `v${i}`))}
      </svg>
      {legende && <Legende eintraege={legende} stil={{ position: "absolute", left: 10, top: 10, maxWidth: "calc(60% - 30px)", pointerEvents: "none" }} />}
      <DrehKnoepfe setPhi={setPhi} setTheta={setTheta} zuruecksetzen={() => { setPhi(0.62); setTheta(0.36); }} />
    </div>
  );
}

/* Bild in beiden Zweigen: Desktop in echten Pixeln (VekBild), Handy 360 × 320 in der Bühne */
function BildFlaeche({ desktop, render, werkzeuge }) {
  if (desktop) {
    return (
      <>
        <VekBild>{(br) => render(br, Math.round(br * 0.92))}</VekBild>
        {werkzeuge && <Werkzeugleiste gruppen={werkzeuge} />}
      </>
    );
  }
  return <div style={BUEHNE}>{render(360, 320)}</div>;
}

/* Anordnung: Desktop = links | Bild, darunter volle Breite · Handy = alles untereinander */
function Anordnung({ desktop, oben, links, bild, werkzeuge, handyWerkzeuge, unten }) {
  if (desktop) {
    return (
      <>
        <div data-hesse-arbeit="">
          <VekArbeit links={links} rechts={<BildFlaeche desktop render={bild} werkzeuge={werkzeuge} />} />
        </div>
        {unten && <div>{unten}</div>}
      </>
    );
  }
  return (
    <div>
      {oben}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{links}</div>
      {bild && <div style={{ marginTop: 14 }}><BildFlaeche render={bild} /></div>}
      {handyWerkzeuge && <div style={{ marginTop: 8 }}>{handyWerkzeuge}</div>}
      {unten}
    </div>
  );
}

/* „Weiter mit …“ am Ende eines Reiters */
function WeiterReiter({ text, onClick }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
      <HauptKnopf onClick={onClick} stil={{ height: 44 }}>{text} →</HauptKnopf>
    </div>
  );
}

const hilfeKontext = (modus) => ({
  id: `hesse-${modus}`,
  aufgabe: "Hesse-Normalenform Normalenvektor Normalenform Abstand Punkt Ebene mit Vorzeichen",
  hilfen: {
    verstehen: [
      "Ein Normalenvektor steht senkrecht auf der Ebene – also auf jedem Vektor, der in der Ebene liegt.",
      "Senkrecht heißt: Das Skalarprodukt ist 0.",
      "Die Hesse-Normalenform ist die Normalenform mit einem Normalenvektor der Länge 1.",
    ],
    ansatz: [
      "Welche Länge hat der Normalenvektor?",
      "|n| = √(n₁² + n₂² + n₃²). Teile die Koordinatenform durch |n| – das ist die HNF.",
      "Setze den Punkt in die HNF ein: Der Wert ist der Abstand mit Vorzeichen.",
    ],
    regel: [
      "Normalenform: (x − p) · n = 0.",
      "Koordinatenform: n₁x₁ + n₂x₂ + n₃x₃ = d mit d = n · p.",
      "HNF: (n₁x₁ + n₂x₂ + n₃x₃ − d) / |n| = 0. Einsetzen von Q liefert den Abstand mit Vorzeichen.",
    ],
    pruefen: [
      "Ist |n| positiv? Eine Länge ist nie negativ.",
      "Positives Ergebnis: Q liegt auf der Seite, in die n zeigt. Negativ: Gegenseite. 0: Q liegt in E.",
      "Der Abstand selbst ist der Betrag des Ergebnisses.",
    ],
  },
  regeln: [{ name: "Orthogonalität", bereich: "vektoren" }, { name: "Betrag (Länge)", bereich: "vektoren" }, { name: "Abstand Punkt–Ebene", bereich: "vektoren" }],
  grundlage: { trainer: "wurzeln", name: "Wurzeln", grund: "Für |n| brauchst du sichere Wurzeln." },
  loesung: null,
});

/* ======================================================================
   a) Normalenvektor
   ====================================================================== */

function ReiterNormale({ e, desktop, grund, werkzeuge, handyWerkzeuge, weiter }) {
  const sMax = bereich(e.u), tMax = bereich(e.v);
  const [s, setS] = useState(1);
  const [t, setT] = useState(Math.min(1, tMax));
  const [tipp, setTipp] = useState(null);
  const X = plus(plus(e.P, mal(e.u, s)), mal(e.v, t));
  const PX = minusV(X, e.P);
  const prod = skalar(e.n, PX);
  const n0 = mal(e.n, 1 / e.b);
  const nLang = Math.min(3, e.b);
  const lPX = laenge(PX);

  const stueck = { mitte: e.P, r: stueckGroesse(e.n, e.P, [-1, 1].flatMap((a) => [-1, 1].map((b) => plus(plus(e.P, mal(e.u, a * sMax)), mal(e.v, b * tMax))))) };
  const elemente = [
    { art: "pfeil", von: e.P, bis: plus(e.P, e.u), farbe: BLAU_HELL, breite: 2.2, label: "u" },
    { art: "pfeil", von: e.P, bis: plus(e.P, e.v), farbe: BLAU_HELL, breite: 2.2, label: "v" },
    ...(lPX > 0 ? [{ art: "pfeil", von: e.P, bis: X, farbe: GOLD, breite: 2.8 },
      { art: "winkel", an: e.P, d1: n0, d2: mal(PX, 1 / lPX), farbe: SM, gr: 0.6 }] : []),
    { art: "pfeil", von: e.P, bis: plus(e.P, mal(n0, nLang)), farbe: BLAU, breite: 3.2, label: "n" },
    { art: "punkt", p: e.P, farbe: C.tinte, label: "P" },
    { art: "punkt", p: X, farbe: GOLD, label: lPX > 0 ? "X" : "X = P" },
  ];
  const bild = (W, H) => (
    <HesseRaum n={e.n} d={e.d} stueck={stueck} elemente={elemente} grund={grund} W={W} H={H}
      legende={[{ text: "E", farbe: BLAU, art: "flaeche" }, { text: "n", farbe: BLAU }, { text: "u, v in E", farbe: BLAU_HELL }, { text: "X", farbe: GOLD, art: "punkt" }]} />
  );

  const boxE = (
    <ObjektBox farbe={BLAU} name="E" art="Ebene durch P" innen="10px 12px 12px">
      <Formel t={`\\farbe{u}{\\vec{n} = ${spalteTex(e.n)}}\\quad ${punktTex("P", e.P)}`} />
      <Satz stil={{ margin: "8px 0 2px", fontSize: 12.5 }}>Zwei Richtungsvektoren, die in E liegen:</Satz>
      <Formel t={`\\vec{u} = ${spalteTex(e.u)}\\quad \\vec{v} = ${spalteTex(e.v)}`} gr={15} />
      {e.b > 3 && <Satz stil={{ margin: "8px 0 0", fontSize: 12 }}>Im Bild ist n⃗ auf 3 LE gekürzt – für „senkrecht“ zählt nur die Richtung.</Satz>}
    </ObjektBox>
  );
  const boxX = (
    <ObjektBox farbe={GOLD} name="X" art="Punkt in der Ebene" innen="10px 12px 12px">
      <Formel t={`X = P + s \\cdot \\vec{u} + t \\cdot \\vec{v}`} gr={15} />
      <Abstand h={8} />
      <Regler werte={[{ name: "s", wert: s, setze: setS, min: -sMax, max: sMax, farbe: GOLD_TEXT }, { name: "t", wert: t, setze: setT, min: -tMax, max: tMax, farbe: GOLD_TEXT }]} />
      <Abstand h={8} />
      <Formel t={`\\farbe{v}{${punktTex("X", X)}}\\quad \\vec{PX} = ${spalteTex(PX)}`} gr={15} />
    </ObjektBox>
  );
  const vermutung = (
    <Tafel nr={1} titel="Vermutung" text={<V s="Schieb X in der Ebene herum. Was ergibt das Skalarprodukt n⃗ · PX⃗?" />} stil={desktop ? { marginTop: 0, boxShadow: "none" } : undefined}>
      <TippKacheln label="Vermutung zum Skalarprodukt" wert={tipp} setWert={setTipp} loesung={tipp ? "null" : undefined} spalten={1}
        optionen={[["null", "Immer 0 – egal, wo X liegt", "recht"], ["vz", "Mal positiv, mal negativ", "vektorwinkel"], ["waechst", <V key="w" s="Es wächst mit der Länge von PX⃗" />, "skalar"]]} />
      {tipp && (tipp === "null"
        ? <HinweisV art="gut">Genau. PX⃗ liegt in der Ebene – und n⃗ steht auf allem senkrecht, was in der Ebene liegt.</HinweisV>
        : <HinweisV art="schlecht">Probier es aus: Das Produkt bleibt 0, egal wie weit du X schiebst. PX⃗ liegt immer in der Ebene.</HinweisV>)}
    </Tafel>
  );
  const live = tipp && (
    <div data-hesse-live="normale">
      <Ergebnis titel="Live: Skalarprodukt" bild={<Bild art="recht" breite={44} />}
        zusatz={<V s={lPX > 0 ? "n⃗ und PX⃗ stehen senkrecht aufeinander – das Skalarprodukt ist 0." : "X = P: PX⃗ ist der Nullvektor, das Produkt ist erst recht 0."} />}>
        <Formel t={`\\vec{n} \\cdot \\vec{PX} = ${skalarTex(e.n, PX)} = \\farbe{g}{${zahl(prod)}}`} gr={15} links />
      </Ergebnis>
    </div>
  );
  const kern = (
    <Tafel nr={2} titel="Kernidee: senkrecht ⇔ Skalarprodukt 0" stil={desktop ? { marginTop: 20 } : undefined}>
      <Rechenweg>
        <RSchritt nr={1} titel="Senkrecht heißt Skalarprodukt 0">
          <Formel t={`\\vec{a} \\perp \\vec{b} \\Leftrightarrow \\vec{a} \\cdot \\vec{b} = 0`} />
          <Satz stil={{ margin: "6px 0 0", textAlign: "center" }}>Denn a⃗ · b⃗ = |a⃗| · |b⃗| · cos φ, und cos 90° = 0.</Satz>
        </RSchritt>
        <RSchritt nr={2} titel={<V s="n⃗ steht auf den beiden Richtungsvektoren senkrecht" />}>
          <Formel t={`\\vec{n} \\cdot \\vec{u} = ${skalarTex(e.n, e.u)} = 0`} gr={15} />
          <Formel t={`\\vec{n} \\cdot \\vec{v} = ${skalarTex(e.n, e.v)} = 0`} gr={15} />
        </RSchritt>
        <RSchritt nr={3} titel="Damit auf jedem Vektor der Ebene">
          <Formel t={`\\vec{n} \\cdot (s \\cdot \\vec{u} + t \\cdot \\vec{v}) = s \\cdot \\vec{n} \\cdot \\vec{u} + t \\cdot \\vec{n} \\cdot \\vec{v} = 0`} gr={15} />
          <Satz stil={{ margin: "6px 0 0", textAlign: "center" }}>Jeder Verbindungsvektor PX⃗ zweier Punkte der Ebene ist so ein s · u⃗ + t · v⃗.</Satz>
        </RSchritt>
        <RSchritt nr={4} titel={<V s="Jedes Vielfache k · n⃗ (k ≠ 0) ist auch ein Normalenvektor" />}>
          <Satz stil={{ margin: 0 }}>Es zeigt in dieselbe (oder die Gegen-)Richtung – nur die Länge ändert sich. Genau das nutzt gleich die Hesse-Normalenform.</Satz>
        </RSchritt>
      </Rechenweg>
      {weiter}
    </Tafel>
  );
  return (
    <Anordnung desktop={desktop} bild={bild} werkzeuge={werkzeuge} handyWerkzeuge={handyWerkzeuge}
      links={<>{boxE}{boxX}{desktop && vermutung}{desktop && live}</>}
      unten={<>{!desktop && vermutung}{!desktop && live && <div style={{ marginTop: 14 }}>{live}</div>}{kern}</>} />
  );
}

/* ======================================================================
   b) Normalenform
   ====================================================================== */

function ReiterNormalenform({ e, desktop, grund, werkzeuge, handyWerkzeuge, weiter }) {
  const sMax = bereich(e.u), tMax = bereich(e.v);
  const [s, setS] = useState(1);
  const [t, setT] = useState(0);
  const [h, setH] = useState(0);
  const X = punktX(e, s, t, h);
  const Xz = X.map(qNum);
  const PX = X.map((x, i) => q(x.z - e.P[i] * x.n, x.n));
  const prod = qSkalar(e.n, PX);
  const n0 = mal(e.n, 1 / e.b);
  const fuss = minusV(Xz, mal(n0, h));
  const lPX = laenge(PX.map(qNum));

  const stueck = { mitte: e.P, r: stueckGroesse(e.n, e.P, [-1, 1].flatMap((a) => [-1, 1].map((b) => plus(plus(e.P, mal(e.u, a * sMax)), mal(e.v, b * tMax))))) };
  const elemente = [
    ...(h !== 0 ? [{ art: "strecke", von: fuss, bis: Xz, farbe: SM, breite: 2, strich: "5 4", deckung: false }, { art: "punkt", p: fuss, farbe: SM, r: 3.4 }] : []),
    ...(lPX > 0 ? [{ art: "pfeil", von: e.P, bis: Xz, farbe: GOLD, breite: 2.8 }] : []),
    ...(lPX > 0 && h === 0 ? [{ art: "winkel", an: e.P, d1: n0, d2: mal(PX.map(qNum), 1 / lPX), farbe: SM, gr: 0.6 }] : []),
    { art: "pfeil", von: e.P, bis: plus(e.P, mal(n0, Math.min(3, e.b))), farbe: BLAU, breite: 3.2, label: "n" },
    { art: "punkt", p: e.P, farbe: C.tinte, label: "P" },
    { art: "punkt", p: Xz, farbe: GOLD, label: "X" },
  ];
  const bild = (W, H) => (
    <HesseRaum n={e.n} d={e.d} stueck={stueck} elemente={elemente} grund={grund} W={W} H={H}
      legende={[{ text: "E", farbe: BLAU, art: "flaeche" }, { text: "n", farbe: BLAU }, { text: "X", farbe: GOLD, art: "punkt" }, h !== 0 && { text: "Lot auf E", farbe: SM }]} />
  );
  const inE = prod.z === 0;
  const liveZeile = <Formel t={`(\\vec{x} − \\vec{p}) \\cdot \\vec{n} = ${skalarTex(PX, e.n)} = ${inE ? "\\farbe{g}{0}" : zahl(prod)}`} gr={15} />;
  const liveMeldung = inE
    ? <HinweisV art="gut">X liegt in E – das Produkt ist 0.</HinweisV>
    : <HinweisV art="warn">X liegt {Math.abs(h)} LE {h > 0 ? "über" : "unter"} E. PX⃗ steht nicht mehr senkrecht auf n⃗ – das Produkt ist {zahl(prod)} ≠ 0.</HinweisV>;

  const boxE = (
    <ObjektBox farbe={BLAU} name="E" art="Normalenform" innen="10px 12px 12px">
      <Formel t={`\\farbe{u}{\\vec{n} = ${spalteTex(e.n)}}\\quad ${punktTex("P", e.P)}`} />
      <Abstand h={6} />
      <Formel t={`E: ${normalenformTex(e.n, e.P)}`} gr={15} />
    </ObjektBox>
  );
  const boxX = (
    <ObjektBox farbe={GOLD} name="X" art="Punkt verschieben" innen="10px 12px 12px">
      <Satz stil={{ fontSize: 12.5, margin: "0 0 8px", textAlign: "center" }}>s und t schieben X in der Ebene, h hebt X um h LE aus der Ebene.</Satz>
      <Regler werte={[
        { name: "s", wert: s, setze: setS, min: -sMax, max: sMax, farbe: GOLD_TEXT },
        { name: "t", wert: t, setze: setT, min: -tMax, max: tMax, farbe: GOLD_TEXT },
        { name: "h", wert: h, setze: setH, min: -3, max: 3, farbe: SM_TEXT, label: "Höhe h" },
      ]} />
      <Abstand h={8} />
      <Formel t={`\\farbe{v}{${punktTex("X", X)}}`} gr={15} />
      {liveZeile}
      {liveMeldung}
    </ObjektBox>
  );
  const dTex = `${termTex(e.n)} = ${skalarTex(e.n, e.P)} = ${zahl(e.d)}`;
  const herleitung = (
    <Tafel nr={1} titel="Herleitung Schritt für Schritt" stil={desktop ? { marginTop: 20 } : undefined}>
      <Rechenweg>
        <RSchritt nr={1} titel={<V s="Gegeben: ein fester Aufpunkt P und ein Normalenvektor n⃗" />}>
          <Formel t={`${punktTex("P", e.P)}\\quad \\farbe{u}{\\vec{n} = ${spalteTex(e.n)}}`} />
        </RSchritt>
        <RSchritt nr={2} titel="Ein beliebiger Punkt X(x₁ | x₂ | x₃) der Ebene">
          <Formel t={`\\vec{PX} = \\vec{x} − \\vec{p} = \\spalte{${termTex([1], [X_TEX[0]], -e.P[0])}}{${termTex([1], [X_TEX[1]], -e.P[1])}}{${termTex([1], [X_TEX[2]], -e.P[2])}}`} />
          <Satz stil={{ margin: "6px 0 0", textAlign: "center" }}>x⃗ und p⃗ sind die Ortsvektoren von X und P.</Satz>
        </RSchritt>
        <RSchritt nr={3} titel={<V s="PX⃗ liegt in der Ebene ⇒ PX⃗ steht senkrecht auf n⃗ ⇒ Skalarprodukt 0" />}>
          <Formel t={`(\\vec{x} − \\vec{p}) \\cdot \\vec{n} = 0`} gr={17} />
          <Abstand />
          <Formel t={`E: ${normalenformTex(e.n, e.P)}`} gr={15} farbe={BLAU} />
          <Satz stil={{ margin: "6px 0 0", textAlign: "center" }}>Das ist die Normalenform. Sie gilt für genau die Punkte X, die in E liegen.</Satz>
        </RSchritt>
        <RSchritt nr={4} titel="Probe: X verlässt die Ebene">
          <Satz>{desktop ? "Schieb X links mit s, t und h." : "Schieb X oben mit s, t und h."} Solange h = 0 ist, bleibt das Produkt 0 – sonst nicht.</Satz>
          <div data-hesse-live="normalenform">{liveZeile}</div>
        </RSchritt>
        <RSchritt nr={5} titel="Ausmultiplizieren: die Koordinatenform">
          <Formel t={`\\vec{x} \\cdot \\vec{n} − \\vec{p} \\cdot \\vec{n} = 0 \\quad\\Leftrightarrow\\quad \\vec{x} \\cdot \\vec{n} = \\vec{p} \\cdot \\vec{n}`} gr={15} />
          <Abstand />
          <Formel t={dTex} gr={15} />
        </RSchritt>
      </Rechenweg>
      <Ergebnis titel="Koordinatenform" bild={<Bild art="ebene" breite={44} />}
        zusatz={<V s="Die Zahlen vor x₁, x₂, x₃ sind genau die Koordinaten von n⃗. Rechts steht d = n⃗ · p⃗." />}>
        <span data-hesse-koordform=""><M t={`E: ${koordTex(e.n, e.d)}`} /></span>
      </Ergebnis>
      {weiter}
    </Tafel>
  );
  return (
    <Anordnung desktop={desktop} bild={bild} werkzeuge={werkzeuge} handyWerkzeuge={handyWerkzeuge}
      links={<>{boxE}{boxX}</>} unten={herleitung} />
  );
}

/* ======================================================================
   c) Hesse-Normalenform
   ====================================================================== */

function ReiterHesse({ e, desktop, grund, werkzeuge, handyWerkzeuge, weiter }) {
  const [Q, setQ] = useState(e.Q);
  const setzeQ = (i) => (w) => { const x = [...Q]; x[i] = w; setQ(x); };
  const delta = abstandExakt(e.n, e.d, Q);
  const dz = qNum(delta);
  const n0 = mal(e.n, 1 / e.b);
  const F = lotfuss(e.n, e.d, Q);
  const S = plus(e.P, mal(n0, dz));                 // Ende des Schattens von PQ⃗ auf der n⃗₀-Geraden
  const PQ = minusV(Q, e.P);
  const lage = seite(e.n, e.d, Q);
  const nAus = (k) => plus(e.P, mal(n0, k));
  const rS = Math.hypot(skalar(minusV(F, e.P), orthoBasis(e.n)[0]), skalar(minusV(F, e.P), orthoBasis(e.n)[1]));
  const stueck = { mitte: e.P, r: Math.max(3.5, Math.min(6, rS + 1.5)) };
  const lang = Math.max(3, Math.abs(dz) + 1.2);
  const elemente = [
    { art: "strecke", von: nAus(-lang), bis: nAus(lang), farbe: BLAU_HELL, breite: 1.3, strich: "4 4", deckung: false },
    ...(Math.abs(dz) > 1e-9 ? [
      { art: "strecke", von: e.P, bis: S, farbe: SM, breite: 6, deckkraft: 0.45, deckung: false, label: "δ", labelMitte: true, labelFarbe: SM_TEXT },
      { art: "strecke", von: Q, bis: S, farbe: C.hellgrau, breite: 1.2, strich: "3 3", deckung: false },
      { art: "strecke", von: F, bis: Q, farbe: SM, breite: 2.4 },
      { art: "punkt", p: F, farbe: SM, label: "F", r: 4 },
    ] : []),
    ...(laenge(PQ) > 1e-9 ? [{ art: "pfeil", von: e.P, bis: Q, farbe: GOLD, breite: 2.6 }] : []),
    { art: "pfeil", von: e.P, bis: nAus(1), farbe: BLAU, breite: 3.4, label: "n₀" },
    { art: "punkt", p: e.P, farbe: C.tinte, label: "P" },
    { art: "punkt", p: Q, farbe: GOLD, label: "Q" },
  ];
  const bild = (W, H) => (
    <HesseRaum n={e.n} d={e.d} stueck={stueck} elemente={elemente} grund={grund} W={W} H={H}
      legende={[{ text: "E", farbe: BLAU, art: "flaeche" }, { text: "n₀", farbe: BLAU }, { text: "Q", farbe: GOLD, art: "punkt" }, { text: "Lot δ", farbe: SM }]} />
  );
  const dTex = `\\delta = ${abstandTex(e.n, e.d, Q)}`;
  const lageText = { ueber: "Positiv: Q liegt auf der Seite, in die n⃗₀ zeigt.", unter: "Negativ: Q liegt auf der Gegenseite von n⃗₀.", in: "0: Q liegt in der Ebene." }[lage];

  const boxE = (
    <ObjektBox farbe={BLAU} name="E" art="Hesse-Normalenform" innen="10px 12px 12px">
      <Formel t={`E: ${koordTex(e.n, e.d)}`} gr={15} />
      <Formel t={`|\\vec{n}| = ${betragTex(e.n)}\\quad \\farbe{u}{\\vec{n}_0 = ${n0Tex(e.n)}}`} gr={15} />
      <Abstand h={4} />
      <Formel t={`E: ${hnfTex(e.n, e.d)}`} gr={15} farbe={BLAU} />
    </ObjektBox>
  );
  const boxQ = (
    <ObjektBox farbe={GOLD} name="Q" art="Punkt bewegen" innen="10px 12px 12px">
      <Regler werte={[0, 1, 2].map((i) => ({ name: `q${["₁", "₂", "₃"][i]}`, label: `Koordinate q${i + 1}`, wert: Q[i], setze: setzeQ(i), min: -8, max: 8, farbe: GOLD_TEXT }))} />
      <Abstand h={8} />
      <Formel t={`\\farbe{v}{${punktTex("Q", Q)}}`} gr={15} />
    </ObjektBox>
  );
  const live = (
    <div data-hesse-live="hesse" data-hesse-seite={lage}>
      <Ergebnis titel="Live: Q in die HNF einsetzen" art={lage === "in" ? "info" : "gut"} bild={<Bild art="abstand" breite={44} />}
        zusatz={<V s={`${lageText} Abstand d(Q; E) = |δ| = ${zahl(qAbs(delta)).replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$\\frac{$1}{$2}$")}.`} />}>
        <Formel t={dTex} gr={15} links />
      </Ergebnis>
    </div>
  );
  const warum = (
    <Tafel nr={1} titel="Warum kommt der Abstand heraus?" stil={desktop ? { marginTop: 20 } : undefined}>
      <Rechenweg>
        <RSchritt nr={1} titel="Normalenvektor auf Länge 1 bringen">
          <Formel t={betragKette(e.n)} gr={15} />
          <Abstand />
          <Formel t={`\\vec{n}_0 = ${n0Tex(e.n)}`} gr={15} farbe={BLAU} />
          <Satz stil={{ margin: "6px 0 0", textAlign: "center" }}>n⃗₀ zeigt in dieselbe Richtung wie n⃗, hat aber die Länge 1 (Einheitsvektor).</Satz>
        </RSchritt>
        <RSchritt nr={2} titel={<V s="Hesse-Normalenform: die Normalenform mit n⃗₀" />}>
          <Formel t={`E: ${hnfVektorTex(e.n, e.P)}`} gr={15} />
          <Abstand />
          <Formel t={`E: ${hnfTex(e.n, e.d)}`} gr={15} farbe={BLAU} />
          <Satz stil={{ margin: "6px 0 0", textAlign: "center" }}>Ausmultipliziert: die Koordinatenform, durch |n⃗| geteilt und alles auf eine Seite gebracht.</Satz>
        </RSchritt>
        <RSchritt nr={3} titel="Einen Punkt Q außerhalb einsetzen">
          <Formel t={`\\vec{PQ} = ${spalteTex(PQ)}\\qquad \\vec{PQ} \\cdot \\vec{n}_0 = \\frac{${skalarTex(PQ, e.n)}}{${e.b}} = ${zahl(delta)}`} gr={15} />
          <Satz stil={{ margin: "8px 0 0" }}>
            Das Skalarprodukt mit einem Einheitsvektor ist die Länge des Schattens: |PQ⃗| · cos φ. Der Schatten von PQ⃗ auf die Richtung von n⃗₀
            (im Bild grün auf der gestrichelten Linie) ist genau so lang wie das Lot von Q auf E. Das ist der Abstand.
          </Satz>
        </RSchritt>
        <RSchritt nr={4} titel="Das Vorzeichen verrät die Seite">
          <Satz stil={{ margin: 0 }}>
            Positiv: Q liegt auf der Seite, in die n⃗₀ zeigt. Negativ: auf der Gegenseite. 0: Q liegt in E. Schieb Q durch die Ebene – das Vorzeichen wechselt
            genau beim Durchstoßen. Für den Abstand nimmt man den Betrag: d(Q; E) = |δ|.
          </Satz>
        </RSchritt>
      </Rechenweg>
      <WeiterMit titel="Weiter mit diesem Punkt">
        <WeiterKnopf ziel="abstaende" von="Hesse-Normalenform" daten={{ ebene: [...e.n, e.d], punkt: Q }} zeile="Abstand mit Lotfußpunkt im Werkzeug Abstände nachrechnen" />
      </WeiterMit>
      {weiter}
    </Tafel>
  );
  return (
    <Anordnung desktop={desktop} bild={bild} werkzeuge={werkzeuge} handyWerkzeuge={handyWerkzeuge}
      links={<>{boxE}{boxQ}{desktop && live}</>}
      unten={<>{!desktop && <div style={{ marginTop: 14 }}>{live}</div>}{warum}</>} />
  );
}

/* ======================================================================
   d) Trainieren
   ====================================================================== */

const FELD_STIL = (zustand) => {
  const f = zustand === true ? SM : zustand === false ? C.signal : BLAU;
  return { width: 92, height: 38, textAlign: "center", fontSize: 15.5, fontWeight: 800, fontFamily: "inherit", color: zustand === false ? C.signal : f,
    border: `1.5px solid ${f}${zustand === null || zustand === undefined ? "55" : ""}`, borderRadius: 10, background: `${f}0D`, outline: "none" };
};

function EingabeZeile({ links, wert, setWert, modus, zustand, label, platzhalter }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "6px 0", borderBottom: `1px solid ${C.linie}` }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: C.tinte, minWidth: 0 }}><M t={links} /></span>
      <SprachGruppe abstand={6} groesse={32} farbe={BLAU} titel={`${label}: Zahl sprechen`} stil={{ flexShrink: 0 }}>
        <MatheFeld modus={modus} value={wert} aria-label={label} placeholder={platzhalter}
          onChange={(ev) => setWert(ev.target.value.slice(0, 9))} style={FELD_STIL(zustand)} />
        <span aria-hidden="true" style={{ width: 16, fontWeight: 800, color: zustand === true ? SM : C.signal }}>{zustand === true ? "✓" : zustand === false ? "✗" : ""}</span>
      </SprachGruppe>
    </div>
  );
}

function ReiterTrainieren({ desktop, grund, werkzeuge }) {
  const [a, setA] = useState(() => aufgabe());
  const [tipp, setTipp] = useState(null);
  const leer = { d: "", betrag: "", zaehler: "", abstand: "" };
  const [w, setW] = useState(leer);
  const [befund, setBefund] = useState(null);
  const [gezeigt, setGezeigt] = useState(false);
  const [, setGebucht] = useStateGebucht(null);
  const setze = (k) => (v) => { setW({ ...w, [k]: v }); setBefund(null); };
  const neu = () => { setA(aufgabe()); setTipp(null); setW(leer); setBefund(null); setGezeigt(false); setGebucht(null); };
  const eingaben = a.form === "normal" ? w : { betrag: w.betrag, zaehler: w.zaehler, abstand: w.abstand };
  const pruefen = () => {
    const b = pruefe(a, eingaben);
    setBefund(b);
    if (b.vollstaendig && !gezeigt) { setGezeigt(true); setGebucht({ art: b.alleRichtig ? "gut" : "schlecht" }); }
  };
  const loesungZeigen = () => { setGezeigt(true); setBefund(pruefe(a, eingaben)); };
  const fz = (k) => (befund ? befund.felder[k] : undefined);

  const F = lotfuss(a.n, a.d, a.Q);
  const n0 = mal(a.n, 1 / a.b);
  const dz = qNum(a.abstand);
  const elemente = [
    ...(Math.abs(dz) > 1e-9 ? [{ art: "strecke", von: F, bis: a.Q, farbe: SM, breite: 2.6, label: gezeigt ? `|δ| = ${zahl(qAbs(a.abstand)).replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$1/$2")}` : null, labelMitte: true, labelFarbe: SM_TEXT },
      { art: "winkel", an: F, d1: Math.sign(dz) > 0 ? n0 : mal(n0, -1), d2: orthoBasis(a.n)[0], farbe: SM, gr: 0.5 },
      { art: "punkt", p: F, farbe: SM, label: "F", r: 4 }] : []),
    { art: "pfeil", von: F, bis: plus(F, mal(n0, 2)), farbe: BLAU, breite: 3, label: "n" },
    ...(a.form === "normal" ? [{ art: "punkt", p: a.P, farbe: C.tinte, label: "P" }] : []),
    { art: "punkt", p: a.Q, farbe: GOLD, label: "Q" },
  ];
  const stueck = { mitte: F, r: stueckGroesse(a.n, F, a.form === "normal" ? [a.P] : [], 3.5) };
  const bild = (W, H) => (
    <HesseRaum key={a.Q.join() + a.n.join()} n={a.n} d={a.d} stueck={stueck} elemente={elemente} grund={grund} W={W} H={H}
      legende={[{ text: "E", farbe: BLAU, art: "flaeche" }, { text: "n", farbe: BLAU }, { text: "Q", farbe: GOLD, art: "punkt" }, { text: "Lot", farbe: SM }]} />
  );
  const bildOderHinweis = tipp ? bild : null;

  const boxen = (
    <ObjektReihe min={desktop ? 300 : 260}>
      <ObjektBox farbe={BLAU} name="E" art={a.form === "normal" ? "Ebene in Normalenform" : "Ebene in Koordinatenform"} innen="10px 12px 12px">
        <div data-hesse-aufgabe-ebene=""><Formel t={`E: ${a.form === "normal" ? normalenformTex(a.n, a.P) : koordTex(a.n, a.d)}`} gr={15} /></div>
      </ObjektBox>
      <ObjektBox farbe={GOLD} name="Q" art="Punkt" innen="10px 12px 12px">
        <Formel t={`\\farbe{v}{${punktTex("Q", a.Q)}}`} gr={16} />
      </ObjektBox>
    </ObjektReihe>
  );
  const vermutung = (
    <Tafel nr={1} titel="Vermutung: Wo liegt Q?" text="Setz Q kurz in die linke Seite der Koordinatenform ein und vergleiche mit d."
      stil={desktop ? { marginTop: 0, boxShadow: "none" } : undefined}>
      <TippKacheln label="Vermutung zur Lage von Q" wert={tipp} setWert={setTipp} loesung={tipp ? a.lage : undefined} spalten={3}
        optionen={[["ueber", <V key="u" s="Auf der n⃗-Seite" />, "abstand"], ["in", "In E", "auf"], ["unter", "Auf der Gegenseite", "lot"]]} />
      {tipp && <HinweisV art={tipp === a.lage ? "gut" : "schlecht"}>{tipp === a.lage ? "Richtig vermutet. " : "Nicht ganz. "}<V s={LAGE_TEXT[a.lage]} /></HinweisV>}
    </Tafel>
  );
  const eingabe = (
    <Tafel nr={2} titel="HNF aufstellen und Abstand berechnen" text="Ganze Zahlen oder Brüche wie −2/3. δ ist der Abstand mit Vorzeichen."
      stil={desktop ? { marginTop: 0, boxShadow: "none" } : undefined}>
      <div data-hesse-eingaben="">
        {a.form === "normal" && <EingabeZeile links={`d = \\vec{n} \\cdot \\vec{p} =`} wert={w.d} setWert={setze("d")} modus="ganzvz" zustand={fz("d")} label="d der Koordinatenform" />}
        <EingabeZeile links={`|\\vec{n}| =`} wert={w.betrag} setWert={setze("betrag")} modus="ganz" zustand={fz("betrag")} label="Länge des Normalenvektors" />
        <EingabeZeile links={`\\vec{n} \\cdot \\vec{q} − d =`} wert={w.zaehler} setWert={setze("zaehler")} modus="ganzvz" zustand={fz("zaehler")} label="Zähler der HNF mit Q" />
        <EingabeZeile links={`\\delta =`} wert={w.abstand} setWert={setze("abstand")} modus="bruch" zustand={fz("abstand")} label="Abstand mit Vorzeichen" platzhalter="z. B. −2/3" />
      </div>
      {befund && !befund.vollstaendig && <HinweisV art="warn">Bitte alle Felder ausfüllen – oder „Lösung zeigen“.</HinweisV>}
      {befund && befund.vollstaendig && befund.alleRichtig && <HinweisV art="gut">Alles richtig – HNF und Abstand stimmen.</HinweisV>}
      {befund && befund.hinweise.map((h) => <Hinweis key={h} art="schlecht"><V s={h} /></Hinweis>)}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        <HauptKnopf onClick={pruefen}>Prüfen</HauptKnopf>
        {!gezeigt && <button type="button" onClick={loesungZeigen} data-hesse-loesung=""
          style={{ height: 46, padding: "0 18px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Lösung zeigen</button>}
      </div>
    </Tafel>
  );
  const weg = gezeigt && (
    <Tafel nr={3} titel="Rechenweg" stil={desktop ? { marginTop: 20 } : undefined}>
      <div data-hesse-rechenweg="">
        <Rechenweg>
          {rechenweg(a).map((sch, i) => (
            <RSchritt key={i} nr={i + 1} titel={<V s={sch.titel} />}>
              {sch.text && <Satz stil={{ textAlign: "center" }}><V s={sch.text} /></Satz>}
              {sch.zeilen.map((z) => <Formel key={z} t={z} gr={15} />)}
            </RSchritt>
          ))}
        </Rechenweg>
      </div>
      <Ergebnis titel="Ergebnis" bild={<Bild art="abstand" breite={44} />} zusatz={<V s={LAGE_TEXT[a.lage]} />}>
        <M t={`\\delta = ${zahl(a.abstand)},\\quad d(Q; E) = ${zahl(qAbs(a.abstand))}`} />
      </Ergebnis>
    </Tafel>
  );
  const fuss = <Fusszeile neu={neu} hilfe={<IchHaengeFest kontext={hilfeKontext("trainieren")} />} />;

  if (desktop) {
    return (
      <>
        <div data-hesse-arbeit="">
          <VekArbeit
            links={<>{boxen}{vermutung}{eingabe}</>}
            rechts={bildOderHinweis ? <BildFlaeche desktop render={bildOderHinweis} werkzeuge={werkzeuge} />
              : <FeinKarte data-hesse-bild-warten=""><p style={{ fontSize: 14, color: C.grau, lineHeight: 1.6, margin: 0 }}>Erst vermuten: Auf welcher Seite der Ebene liegt Q? Danach erscheint hier das 3D-Bild mit dem Lot.</p></FeinKarte>} />
        </div>
        {weg && <div>{weg}</div>}
        <div>{fuss}</div>
      </>
    );
  }
  return (
    <div>
      {boxen}
      {vermutung}
      {bildOderHinweis && <div style={{ marginTop: 14 }}><BildFlaeche render={bildOderHinweis} /></div>}
      {eingabe}
      {weg}
      {fuss}
    </div>
  );
}

/* ======================================================================
   Seite
   ====================================================================== */

const MODI = [
  { id: "normale", name: "Normalen\u00ADvektor", bild: "recht" },
  { id: "normalenform", name: "Normalen\u00ADform", bild: "ebene" },
  { id: "hesse", name: "Hesse-Normalen\u00ADform", bild: "abstand" },
  { id: "trainieren", name: "Trai\u00ADnieren", bild: "zufall" },
];
const WEITER_TEXT = { normale: ["normalenform", "Weiter: Normalenform"], normalenform: ["hesse", "Weiter: Hesse-Normalenform"], hesse: ["trainieren", "Weiter: Trainieren"] };

function zufallsEbene() {
  const n = zufallsNormale(Math.random, { faktor: false });
  const r = () => Math.floor(Math.random() * 4) - 1;
  const P = [r(), r(), r()];
  return { id: `z${Date.now()}`, name: "Zufall", ...beispielEbene(n, P) };
}

export function HesseNormalenform({ gehe }) {   // eslint-disable-line no-unused-vars
  const desktop = useDesktop();
  const [modus, setModus] = useState("normale");
  const [ebene, setEbene] = useState(BEISPIEL_EBENEN[0]);
  const [grund, setGrund] = useState(GRUND_AUS);

  const ebenenWahl = (titel) => (
    <FallWahl titel={titel} label="Ebene wählen" wert={BEISPIEL_EBENEN.some((x) => x.id === ebene.id) ? ebene.id : null}
      setWert={(id) => setEbene(id === "zufall" ? zufallsEbene() : BEISPIEL_EBENEN.find((x) => x.id === id))}
      optionen={[...BEISPIEL_EBENEN.map((x) => [x.id, <V key={x.id} s={x.name} />]), ["zufall", "Zufall", "zufall"]]} />
  );
  const werkzeugeMitEbene = [
    { titel: "Ebene", inhalt: ebenenWahl(null) },
    { titel: "Grundebenen einblenden", inhalt: <GrundebenenSchalter an={grund} setAn={setGrund} ohneTitel /> },
  ];
  const werkzeugeOhne = [{ titel: "Grundebenen einblenden", inhalt: <GrundebenenSchalter an={grund} setAn={setGrund} ohneTitel /> }];
  const handyWerkzeuge = <div style={{ display: "flex", flexDirection: "column", gap: 10 }}><GrundebenenSchalter an={grund} setAn={setGrund} />{ebenenWahl("Ebene")}</div>;
  const weiter = WEITER_TEXT[modus] && <WeiterReiter text={WEITER_TEXT[modus][1]} onClick={() => setModus(WEITER_TEXT[modus][0])} />;
  const gemeinsam = { e: ebene, desktop, grund, werkzeuge: werkzeugeMitEbene, handyWerkzeuge, weiter };
  const schluessel = `${modus}-${ebene.id}-${desktop ? "d" : "h"}`;

  return (
    <VekSeite titel="Hesse-Normalenform" text="Vom Normalenvektor über die Normalenform zur Hesse-Normalenform: Setzt man einen Punkt ein, kommt sein Abstand zur Ebene heraus – mit Vorzeichen für die Seite.">
      <div data-hesse-modus={modus}>
        <div style={{ hyphens: "manual" }}><ModusReiter label="Schritt wählen" wert={modus} setWert={setModus} modi={MODI} /></div>
      </div>
      {/* Einführungsvideo nur beim ersten Schritt (Platzhalter: Lektion v5 des Videokurses Vektoren) */}
      {modus === "normale" && <div data-hesse-video="" style={{ marginBottom: 18 }}><ErklaerVideo id={HESSE_VIDEO_ID} titel="Ebenen, Normalenvektor und Normalenform" /></div>}
      {modus === "normale" && <ReiterNormale key={schluessel} {...gemeinsam} />}
      {modus === "normalenform" && <ReiterNormalenform key={schluessel} {...gemeinsam} />}
      {modus === "hesse" && <ReiterHesse key={schluessel} {...gemeinsam} />}
      {modus === "trainieren" && <ReiterTrainieren key={`t-${desktop ? "d" : "h"}`} desktop={desktop} grund={grund} werkzeuge={werkzeugeOhne} />}
      {modus !== "trainieren" && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><IchHaengeFest kontext={hilfeKontext(modus)} /></div>
      )}
    </VekSeite>
  );
}
