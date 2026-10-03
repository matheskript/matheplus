import { tr } from "./i18n.js";
import React, { useState, useRef } from "react";
import { API_URL, C, DEMO_VIDEO_ID, DIFFQ_TESTPAARE, FUNKTIONEN, HOCH, KOEFF_FARBEN, MMENGEN, MODUL_PDF_URL, MSYM, PARAM_WERTE, PRUEFSTELLEN, Regler, ganz, ganzNZ, zuf } from "./base1.jsx";
import { FormelReihe, KurvendiskussionAnzeige, baueReihe, markanteAllg, nullstellenAllg, schoenerSchritt, zahl } from "./func2.jsx";
import { FR } from "./funcRegistry.jsx";
import { PLATZ, WEG_TYPEN, gleichZahl, istLeer } from "./base2.jsx";
import { kiKopf, kiAntwort } from "./base4.jsx";
import { ErklaerVideo, jsonLesen, parseZahl } from "./func1.jsx";
import { LoesungsWeg } from "./func6.jsx";
import { merken } from "./func5.jsx";
import { termAlsTex } from "./func4.jsx";

/* Kopf des Polynomplotters im Stil der Sinusfunktion: ein gemeinsames 5-Spalten-Raster.
   Oben die Plus/Minus-Knöpfe, darunter die allgemeine Form im grauen Kasten, dann die
   eingesetzte Funktion und ihre Ableitungen — jeder Knopf steht genau über seinem Koeffizienten. */
const POLY_RASTER = "clamp(50px, 14vw, 70px) repeat(5, minmax(0, 1fr))";
const POLY_HOCH = { 4: "⁴", 3: "³", 2: "²", 1: "", 0: "" };

function PolyKnopf({ farbe, onClick, label, children }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}
      style={{ width: "min(34px, 100%)", height: 24, borderRadius: 7, border: `1.5px solid ${farbe}66`, background: `${farbe}14`,
        color: farbe, fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </button>
  );
}

function PolyKopf({ koeff, zeileF, zeileF1, zeileF2, alleLeer }) {
  const raster = { display: "grid", gridTemplateColumns: POLY_RASTER, columnGap: 4, alignItems: "center" };
  const label = (t, stil) => <span style={{ textAlign: "right", paddingRight: 6, whiteSpace: "nowrap", ...stil }}>{t}</span>;
  const termZelle = (t, i, stil) => (
    <span key={i} style={{ textAlign: "center", whiteSpace: "nowrap", ...stil }}>
      {t && <><span>{t.vor}</span>{t.vor ? " " : ""}<span style={{ color: t.farbe }}>{t.text}</span></>}
    </span>
  );
  return (
    <div style={{ minWidth: 0 }}>
      {/* Knöpfe */}
      <div style={{ ...raster, alignItems: "start", marginBottom: 8 }}>
        <span />
        {koeff.map((q) => {
          const farbe = KOEFF_FARBEN[q.k];
          // Feste Auswahl statt Plus/Minus (x⁴-Glied): drei Knöpfe übereinander, aktiver gefüllt.
          if (q.auswahl) {
            return (
              <div key={q.k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0 }}>
                {q.auswahl.map((o) => {
                  const aktiv = q.wert === o.wert;
                  return (
                    <button key={o.wert} type="button" aria-pressed={aktiv} aria-label={`x⁴-Glied: ${o.text}`}
                      onClick={() => q.setzen(o.wert)}
                      style={{ width: "min(44px, 100%)", height: 26, borderRadius: 7, border: `1.5px solid ${aktiv ? farbe : farbe + "66"}`,
                        background: aktiv ? farbe : `${farbe}14`, color: aktiv ? C.weiss : farbe,
                        fontSize: 13, fontWeight: 800, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1,
                        display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" }}>
                      {o.text}
                    </button>
                  );
                })}
              </div>
            );
          }
          return (
            <div key={q.k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: farbe }}>{q.k}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: farbe, fontVariantNumeric: "tabular-nums", minHeight: 20 }}>
                {q.wert > 0 ? `+${q.wert}` : String(q.wert).replace("-", "−")}
              </span>
              <PolyKnopf farbe={farbe} label={`${q.k} erhöhen`} onClick={() => q.setzen(Math.min(q.max, q.wert + 1))}>+</PolyKnopf>
              <PolyKnopf farbe={farbe} label={`${q.k} verringern`} onClick={() => q.setzen(Math.max(q.min, q.wert - 1))}>−</PolyKnopf>
            </div>
          );
        })}
      </div>

      {/* Allgemeine Form im grauen Kasten */}
      <div style={{ ...raster, background: "#EEF1F5", border: `1px solid ${C.linie}`, borderRadius: 10, padding: "5px 0",
        fontSize: "clamp(11px, 3.2vw, 15px)", fontWeight: 800, color: C.tinte, marginBottom: 6 }}>
        {label("f(x) =")}
        {koeff.map((q, i) => (
          <span key={q.k} style={{ textAlign: "center", whiteSpace: "nowrap" }}>
            {i > 0 && "+ "}{q.auswahl
              ? <span style={{ color: KOEFF_FARBEN[q.k] }}>±x{POLY_HOCH[q.pot]}</span>
              : <><span style={{ color: KOEFF_FARBEN[q.k] }}>{q.k}</span>{q.pot > 0 && <>·x{POLY_HOCH[q.pot]}</>}</>}
          </span>
        ))}
      </div>

      {/* Eingesetzte Funktion und Ableitungen */}
      <div style={{ ...raster, fontSize: "clamp(13px, 4.1vw, 21px)", fontWeight: 800, color: C.tinte, fontVariantNumeric: "tabular-nums", padding: "3px 0" }}>
        {label("f(x) =")}
        {alleLeer ? <span style={{ gridColumn: "2 / -1", paddingLeft: 6 }}>0</span> : zeileF.map((t, i) => termZelle(t, i))}
      </div>
      {!alleLeer && (
        <>
          <div style={{ ...raster, fontSize: "clamp(11px, 3.3vw, 14px)", fontWeight: 700, color: C.grau, padding: "2px 0" }}>
            {label("f′(x) =")}
            {zeileF1.map((t, i) => termZelle(t, i))}
          </div>
          <div style={{ ...raster, fontSize: "clamp(11px, 3.3vw, 14px)", fontWeight: 700, color: C.grau, padding: "2px 0" }}>
            {label("f″(x) =")}
            {zeileF2.map((t, i) => termZelle(t, i))}
          </div>
        </>
      )}
    </div>
  );
}

export function Plotter() {
  const [e, setE] = useState(0);
  const [a, setA] = useState(1);
  const [b, setB] = useState(-2);
  const [c, setC] = useState(-1);
  const [d, setD] = useState(2);
  const [zoom, setZoom] = useState(1);

  const f = (x) => e * x ** 4 + a * x ** 3 + b * x ** 2 + c * x + d;
  const fs = (x) => 4 * e * x ** 3 + 3 * a * x ** 2 + 2 * b * x + c;
  const fss = (x) => 12 * e * x ** 2 + 6 * a * x + 2 * b;
  const grad = e !== 0 ? 4 : a !== 0 ? 3 : b !== 0 ? 2 : c !== 0 ? 1 : 0;

  // Weiträumig genug suchen, unabhängig vom später gezeigten Ausschnitt.
  const suchR = 40;
  const ns = grad >= 1 ? nullstellenAllg(f, -suchR, suchR) : [];
  const markante = markanteAllg(f, fs, fss, grad, -suchR, suchR);

  // Zoom setzt sich zurück, sobald sich die Funktion ändert.
  React.useEffect(() => { setZoom(1); }, [e, a, b, c, d]);

  const zeileF = baueReihe([
    { schluessel: "e", wert: e, potenz: 4 }, { schluessel: "a", wert: a, potenz: 3 },
    { schluessel: "b", wert: b, potenz: 2 }, { schluessel: "c", wert: c, potenz: 1 },
    { schluessel: "d", wert: d, potenz: 0 },
  ]);
  const zeileF1 = baueReihe([
    { schluessel: "e", wert: 4 * e, potenz: 3 }, { schluessel: "a", wert: 3 * a, potenz: 2 },
    { schluessel: "b", wert: 2 * b, potenz: 1 }, { schluessel: "c", wert: c, potenz: 0 },
    { schluessel: "d", wert: 0, potenz: 0 },
  ]);
  const zeileF2 = baueReihe([
    { schluessel: "e", wert: 12 * e, potenz: 2 }, { schluessel: "a", wert: 6 * a, potenz: 1 },
    { schluessel: "b", wert: 2 * b, potenz: 0 }, { schluessel: "c", wert: 0, potenz: 0 },
    { schluessel: "d", wert: 0, potenz: 0 },
  ]);
  const alleLeer = zeileF.every((t) => !t);

  // Benötigten Bildausschnitt bestimmen: alle markanten Punkte, Nullstellen und
  // der y-Achsenabschnitt müssen hineinpassen, mit Rand für die Tendenz gegen ±∞.
  const xWerte = [0, ...ns, ...markante.map((p) => p.x)];
  const yWerte = [0, d, ...markante.map((p) => p.y)];
  const noetigX = Math.min(Math.max(Math.max(...xWerte.map(Math.abs), 1e-6) * 1.35 + 1.2, 3), 60);
  const noetigY = Math.min(Math.max(Math.max(...yWerte.map(Math.abs), 1e-6) * 1.3 + 0.8, 2.5), 60);

  // Gleiche Skala für x und y — dafür bestimmt die enger begrenzende Richtung
  // den Maßstab, die andere zeigt dann entsprechend mehr Kontext.
  const Sx = 320, Sy = 224, rand = 14;
  const pxX = Sx / 2 - rand, pxY = Sy / 2 - rand;
  const kAuto = Math.min(pxX / noetigX, pxY / noetigY);
  const k = Math.min(Math.max(kAuto * zoom, 3), 400);

  const Rx = pxX / k, Ry = pxY / k;
  const px = (x) => Sx / 2 + x * k;
  const py = (y) => Sy / 2 - y * k;

  /* Zeichnet eine Kurve und unterbricht sie, wo sie aus dem Bild läuft. */
  const pfadFuer = (fn) => {
    let d = "", offen = false;
    for (let i = 0; i <= 600; i++) {
      const x = -Rx + (i * 2 * Rx) / 600;
      const y = fn(x);
      if (!isFinite(y) || Math.abs(y) > Ry * 1.4) { offen = false; continue; }
      d += `${offen ? "L" : "M"} ${px(x).toFixed(2)} ${py(y).toFixed(2)} `;
      offen = true;
    }
    return d;
  };

  const pfad = pfadFuer(f);
  const schritt = schoenerSchritt(Math.max(Rx, Ry));

  const linienX = []; for (let v = schritt; v <= Rx + 1e-9; v += schritt) linienX.push(Math.round(v * 1000) / 1000);
  const linienY = []; for (let v = schritt; v <= Ry + 1e-9; v += schritt) linienY.push(Math.round(v * 1000) / 1000);

  const farbe = (art) => (art === "Wendepunkt" ? C.tinte : art === "Sattelpunkt" ? C.hellgrau : C.gruenDunkel);

  const zoomen = (faktor) => setZoom((z) => Math.min(Math.max(z * faktor, 0.15), 8));
  const knopfZoom = {
    width: 34, height: 34, background: C.weiss, border: "none", fontSize: 18, color: C.see,
    cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Sieh, was die Koeffizienten tun
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
        Stell die Koeffizienten ein und beobachte, wie sich der Graph verändert. Mitgezeichnet sind die beiden
        Ableitungen: Wo f′ die x-Achse schneidet, hat f einen Extrempunkt — wo f″ sie schneidet, einen Wendepunkt.
      </p>

      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
        <PolyKopf koeff={[
          { k: "e", wert: e, setzen: setE, pot: 4,
            auswahl: [{ wert: 1, text: "+x⁴" }, { wert: -1, text: "−x⁴" }, { wert: 0, text: "0" }] },
          { k: "a", wert: a, setzen: setA, min: -3, max: 3, pot: 3 },
          { k: "b", wert: b, setzen: setB, min: -10, max: 10, pot: 2 },
          { k: "c", wert: c, setzen: setC, min: -10, max: 10, pot: 1 },
          { k: "d", wert: d, setzen: setD, min: -10, max: 10, pot: 0 },
        ]} zeileF={zeileF} zeileF1={zeileF1} zeileF2={zeileF2} alleLeer={alleLeer} />

        <div style={{ position: "relative", marginTop: 14 }}>
          <svg viewBox={`0 0 ${Sx} ${Sy}`} style={{ width: "100%", maxWidth: 360, display: "block", margin: "0 auto" }}>
            <defs><clipPath id="plotfeld"><rect x="0" y="0" width={Sx} height={Sy} /></clipPath></defs>
            {linienX.map((v) => (
              <React.Fragment key={`vx${v}`}>
                <line x1={px(v)} y1={0} x2={px(v)} y2={Sy} stroke={C.linie} strokeWidth="1" />
                <line x1={px(-v)} y1={0} x2={px(-v)} y2={Sy} stroke={C.linie} strokeWidth="1" />
              </React.Fragment>
            ))}
            {linienY.map((v) => (
              <React.Fragment key={`vy${v}`}>
                <line x1={0} y1={py(v)} x2={Sx} y2={py(v)} stroke={C.linie} strokeWidth="1" />
                <line x1={0} y1={py(-v)} x2={Sx} y2={py(-v)} stroke={C.linie} strokeWidth="1" />
              </React.Fragment>
            ))}
            <line x1={0} y1={py(0)} x2={Sx} y2={py(0)} stroke={C.hellgrau} strokeWidth="1.5" />
            <line x1={px(0)} y1={0} x2={px(0)} y2={Sy} stroke={C.hellgrau} strokeWidth="1.5" />
            {linienX.map((v) => (
              <React.Fragment key={`lx${v}`}>
                <text x={px(v)} y={py(0) + 13} fontSize="9" fill={C.hellgrau} textAnchor="middle">{zahl(v)}</text>
                <text x={px(-v)} y={py(0) + 13} fontSize="9" fill={C.hellgrau} textAnchor="middle">−{zahl(v)}</text>
              </React.Fragment>
            ))}
            {linienY.map((v) => (
              <React.Fragment key={`ly${v}`}>
                <text x={px(0) - 6} y={py(v) + 3} fontSize="9" fill={C.hellgrau} textAnchor="end">{zahl(v)}</text>
                <text x={px(0) - 6} y={py(-v) + 3} fontSize="9" fill={C.hellgrau} textAnchor="end">−{zahl(v)}</text>
              </React.Fragment>
            ))}

            <g clipPath="url(#plotfeld)">
              <path d={pfadFuer(fss)} stroke={C.ablGrau} strokeWidth="1.8" fill="none" opacity="0.55"
                strokeDasharray="5 4" strokeLinejoin="round" />
              <path d={pfadFuer(fs)} stroke={C.seeHell} strokeWidth="2" fill="none" opacity="0.7" strokeLinejoin="round" />
              <path d={pfad} stroke={C.see} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
              {ns.map((x, i) => (
                <circle key={`n${i}`} cx={px(x)} cy={py(0)} r="4.5" fill={C.weiss} stroke={C.see} strokeWidth="2.5" />
              ))}
              {markante.map((p, i) => (
                <circle key={`p${i}`} cx={px(p.x)} cy={py(p.y)} r="5.5" fill={farbe(p.art)} />
              ))}
              <circle cx={px(0)} cy={py(d)} r="4" fill={C.see} opacity="0.45" />
            </g>
          </svg>

          <div style={{
            position: "absolute", right: 8, bottom: 8, display: "flex", flexDirection: "column",
            borderRadius: 10, overflow: "hidden", border: `1px solid ${C.linie}`,
            boxShadow: "0 2px 8px rgba(15,26,51,0.18)",
          }}>
            <button onClick={() => zoomen(1.3)} style={{ ...knopfZoom, borderBottom: `1px solid ${C.linie}` }}>+</button>
            <button onClick={() => zoomen(1 / 1.3)} style={knopfZoom}>−</button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center" style={{ gap: 18, marginTop: 8 }}>
          {[["f", C.see, false], ["f′", C.seeHell, false], ["f″", C.ablGrau, true]].map(([n, farbe, gestrichelt]) => (
            <span key={n} className="flex items-center" style={{ gap: 7, fontSize: 12.5, color: C.grau }}>
              <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke={farbe} strokeWidth="2.5"
                strokeDasharray={gestrichelt ? "5 4" : "0"} /></svg>
              {n}
            </span>
          ))}
        </div>

      </div>

      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginTop: 18 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 14 }}>Markante Punkte</p>

        <Zeile marke={<circle cx="7" cy="7" r="4.5" fill={C.weiss} stroke={C.see} strokeWidth="2.5" />}
          titel="Nullstellen"
          wert={ns.length ? ns.map((x, i) => `x${ns.length > 1 ? "₁₂₃₄₅₆"[i] ?? i + 1 : ""} = ${zahl(x)}`).join("   ") : "keine reellen Nullstellen"} />

        {markante.map((p, i) => (
          <Zeile key={i} marke={<circle cx="7" cy="7" r="5" fill={farbe(p.art)} />}
            titel={p.art} wert={`(${zahl(p.x)} | ${zahl(p.y)})`} />
        ))}

        <Zeile marke={<circle cx="7" cy="7" r="4" fill={C.see} opacity="0.45" />}
          titel="y-Achsenabschnitt" wert={`(0 | ${d})`} />

        <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginTop: 14 }}>
          {grad === 4 && "Vierter Grad: f′ hat Grad 3, also höchstens drei Extremstellen — f″ hat Grad 2, also höchstens zwei Wendestellen."}
          {grad === 3 && "Dritter Grad: f′ ist eine Parabel, also höchstens zwei Extremstellen — f″ ist eine Gerade, also genau eine Wendestelle."}
          {grad === 2 && "Eine Parabel: f′ ist eine Gerade mit genau einer Nullstelle, also genau ein Extrempunkt und kein Wendepunkt."}
          {grad === 1 && "Eine Gerade: überall dieselbe Steigung, also weder Extrem- noch Wendepunkt."}
          {grad === 0 && "Eine Konstante: waagerecht, ohne jede Steigung."}
        </p>
      </div>

      <KurvendiskussionAnzeige e={e} a={a} b={b} c={c} d={d} />
    </div>
  );
}


export function Zeile({ marke, titel, wert }) {
  return (
    <div className="flex items-start" style={{ gap: 10, marginBottom: 11 }}>
      <svg width="14" height="14" style={{ marginTop: 3, flexShrink: 0 }}>{marke}</svg>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{titel}</span>
        <span style={{ fontSize: 14, color: C.grau, fontWeight: 300, marginLeft: 8 }}>{wert}</span>
      </div>
    </div>
  );
}


export function mArg(s, i) {
  if (s[i] === "{") { const [t, j] = mLies(s, i + 1, "}"); return [t, j + 1]; }
  const m = /^\\[a-zA-Z]+|^./.exec(s.slice(i));
  if (!m) return [[], i];
  const [t] = mLies(m[0], 0, null);
  return [t, i + m[0].length];
}


export function mRoh(s, i) {
  if (s[i] === "{") { const j = s.indexOf("}", i); return [s.slice(i + 1, j), j + 1]; }
  return [s[i] || "", i + 1];
}


export function mLies(s, i, ende) {
  const teile = [];
  let text = "";
  const raus = () => { if (text) { teile.push(text); text = ""; } };
  while (i < s.length) {
    const ch = s[i];
    if (ende && ch === ende) break;
    if (ch === "\\") {
      const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i));
      if (!m) { text += ch; i++; continue; }
      const name = m[1];
      i += m[0].length;
      if (name === "frac") {
        raus();
        let z, n;
        [z, i] = mArg(s, i);
        [n, i] = mArg(s, i);
        teile.push({ typ: "frac", z, n });
      } else if (name === "sqrt") {
        raus();
        let a; [a, i] = mArg(s, i);
        teile.push({ typ: "sqrt", a });
      } else if (name === "lim") {
        raus();
        let u = null;
        if (s[i] === "_") { i++; [u, i] = mArg(s, i); }
        teile.push({ typ: "lim", u });
      } else if (name === "cursor") {
        raus();
        teile.push({ typ: "cursor" });
        while (s[i] === " ") i++;
      } else if (name === "feld") {
        raus();
        let a; [a, i] = mArg(s, i);
        teile.push({ typ: "feld", a });
      } else if (name === "mathbb") {
        let a; [a, i] = mRoh(s, i);
        text += MMENGEN[a] || a;
      } else if (name === "left" || name === "right") {
        // Klammergröße ignorieren, das Zeichen selbst kommt als Nächstes
      } else {
        text += MSYM[name] !== undefined ? MSYM[name] : name;
      }
    } else if (ch === "^" || ch === "_") {
      raus();
      let a; [a, i] = mArg(s, i + 1);
      teile.push({ typ: ch === "^" ? "sup" : "sub", a });
    } else if (ch === "{") {
      let a; [a, i] = mArg(s, i);
      teile.push({ typ: "grp", a });
    } else { text += ch; i++; }
  }
  raus();
  return [teile, i];
}

/* Höhe eines Teilausdrucks in em. Wird gebraucht, damit bei Doppelbrüchen
   der Hauptbruchstrich in der Mitte des Kastens liegt — und damit auf der
   Höhe des Gleichheitszeichens. */

export function mHoehe(teile) {
  let h = 1;
  for (const t of teile || []) {
    if (typeof t === "string") continue;
    if (t.typ === "frac") h = Math.max(h, mHoehe(t.z) + mHoehe(t.n) + 0.3);
    else if (t.a) h = Math.max(h, mHoehe(t.a));
    else if (t.u) h = Math.max(h, mHoehe(t.u));
  }
  return h;
}


export function mZeichne(teile) {
  return teile.map((t, i) => {
    if (typeof t === "string") return <span key={i}>{t}</span>;
    if (t.typ === "frac") {
      const hz = mHoehe(t.z), hn = mHoehe(t.n);
      const obenAus = Math.max(0, hn - hz).toFixed(2);
      const untenAus = Math.max(0, hz - hn).toFixed(2);
      return (
        <span key={i} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center",
          verticalAlign: "middle", margin: "0 0.22em", lineHeight: 1.16, textAlign: "center" }}>
          <span style={{ padding: `${obenAus}em 0.3em 0.04em`, boxSizing: "border-box" }}>{mZeichne(t.z)}</span>
          <span style={{ borderTop: "1.1px solid currentColor", padding: `0.04em 0.3em ${untenAus}em`,
            width: "100%", boxSizing: "border-box" }}>{mZeichne(t.n)}</span>
        </span>
      );
    }
    if (t.typ === "sup") return <sup key={i} style={{ fontSize: "0.7em", lineHeight: 0 }}>{mZeichne(t.a)}</sup>;
    if (t.typ === "sub") return <sub key={i} style={{ fontSize: "0.7em", lineHeight: 0 }}>{mZeichne(t.a)}</sub>;
    if (t.typ === "sqrt") return (
      <span key={i} style={{ verticalAlign: "middle", display: "inline-block" }}>
        √<span style={{ borderTop: "1.1px solid currentColor", padding: "0.08em 0.12em 0" }}>{mZeichne(t.a)}</span>
      </span>
    );
    if (t.typ === "lim") return (
      <span key={i} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", margin: "0 0.24em", lineHeight: 1.15 }}>
        <span>lim</span>
        <span style={{ fontSize: "0.64em" }}>{t.u ? mZeichne(t.u) : null}</span>
      </span>
    );
    if (t.typ === "grp") return <span key={i}>{mZeichne(t.a)}</span>;
    if (t.typ === "cursor") return (
      <span key={i} className="m-cursor" aria-hidden="true"
        style={{ display: "inline-block", width: "0.12em", height: "1.08em", background: C.gruen, borderRadius: 1.5,
          margin: "0 0.05em", verticalAlign: "middle" }} />
    );
    if (t.typ === "feld") return (
      <span key={i} style={{ background: "#E4E9F1", borderRadius: 5, padding: "0.04em 0.16em", margin: "0 0.03em",
        boxShadow: "inset 0 0 0 1px #D5DDEA", display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
        {mZeichne(t.a)}
      </span>
    );
    return null;
  });
}

/* Inline-Formel */
/* Alle Bestandteile eines Terms stehen auf der Mittellinie: Gleichheitszeichen,
   Operatoren und Bruchstriche liegen damit auf derselben Höhe. */

export function M({ t }) {
  return (
    <span style={{ fontVariantNumeric: "lining-nums", display: "inline-flex", alignItems: "center",
      flexWrap: "wrap", verticalAlign: "middle", lineHeight: 1.35 }}>
      {mZeichne(mLies(String(t), 0, null)[0])}
    </span>
  );
}

/* Fließtext mit eingebetteten Formeln zwischen $ … $ */

export function Text({ s, style }) {
  const stuecke = String(tr(s)).split("$");
  return (
    <p style={style}>
      {stuecke.map((teil, i) => (i % 2 === 1 ? <M key={i} t={teil} /> : <span key={i}>{teil}</span>))}
    </p>
  );
}

/* Abgesetzte Formelzeilen, ohne Kasten, in derselben Schrift */

export function Formel({ titel, zeilen }) {
  return (
    <div style={{ margin: "20px 0 22px" }}>
      {titel && (
        <p style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel, marginBottom: 10, letterSpacing: "0.01em" }}>{titel}</p>
      )}
      {zeilen.map((z, i) => (
        <div key={i} style={{ fontSize: 17, lineHeight: 2.15, color: C.tinte, paddingLeft: 4, overflowX: "auto" }}>
          <M t={z} />
        </div>
      ))}
    </div>
  );
}

/* ---------- Formelparser und Prüfung ---------- */

/* Der Parser wandelt eine Schülereingabe in eine auswertbare Funktion um.
   Geprüft wird anschließend numerisch an mehreren Stellen — dadurch gelten
   e^x+x*e^x und e^x*(1+x) beide als richtig. */


export function normieren(s) {
  let t = String(s).toLowerCase().trim();
  t = t.replace(/^f\s*['′]?\s*\(\s*x\s*\)\s*=/, "").replace(/^y\s*=/, "");
  t = t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => "^" + [...m].map((z) => HOCH[z]).join(""));
  t = t.replace(/[·×]/g, "*").replace(/[−–—]/g, "-").replace(/\*\*/g, "^");
  t = t.replace(/√/g, "sqrt").replace(/π/g, "pi").replace(/,/g, ".");
  t = t.replace(/½/g, "(1/2)").replace(/¼/g, "(1/4)").replace(/⅓/g, "(1/3)").replace(/¾/g, "(3/4)");
  return t.replace(/\s+/g, "");
}


export function zerlegen(t) {
  const marken = [];
  let i = 0;
  while (i < t.length) {
    const ch = t[i];
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < t.length && /[0-9.]/.test(t[j])) j++;
      marken.push({ typ: "zahl", wert: parseFloat(t.slice(i, j)) });
      i = j;
    } else if (/[a-z]/.test(ch)) {
      // "2acos(x)" ist 2 · a · cos(x): Funktionsnamen nur mit Klammer dahinter,
      // alle übrigen Buchstaben einzeln als Faktoren.
      const rest = t.slice(i);
      const fn = ["sqrt", "exp", "sin", "cos", "tan", "log", "ln"].find(
        (name) => rest.startsWith(name) && rest[name.length] === "(");
      if (fn) { marken.push({ typ: "name", wert: fn }); i += fn.length; }
      else if (rest.startsWith("pi")) { marken.push({ typ: "name", wert: "pi" }); i += 2; }
      else { marken.push({ typ: "name", wert: ch }); i += 1; }
    } else if ("+-*/^()".includes(ch)) {
      marken.push({ typ: ch });
      i++;
    } else return null;
  }
  return marken;
}

/* Feste, aber unbekannte Zahlen. Zwei Terme mit Parametern gelten als gleich,
   wenn sie für diese Belegungen überall denselben Wert haben. */

export function baum(marken) {
  let p = 0;
  const schau = () => marken[p];
  const nimm = (typ) => { if (marken[p] && marken[p].typ === typ) { p++; return true; } return false; };

  function ausdruck() {
    let n = produkt();
    if (n === null) return null;
    while (schau() && (schau().typ === "+" || schau().typ === "-")) {
      const op = schau().typ; p++;
      const r = produkt(); if (r === null) return null;
      n = { op, l: n, r };
    }
    return n;
  }
  function produkt() {
    let n = vorzeichen();
    if (n === null) return null;
    for (;;) {
      if (schau() && (schau().typ === "*" || schau().typ === "/")) {
        const op = schau().typ; p++;
        const r = vorzeichen(); if (r === null) return null;
        n = { op, l: n, r };
      } else if (schau() && (schau().typ === "zahl" || schau().typ === "name" || schau().typ === "(")) {
        const r = vorzeichen(); if (r === null) return null;
        n = { op: "*", l: n, r };
      } else return n;
    }
  }
  function vorzeichen() {
    if (nimm("-")) { const n = vorzeichen(); return n === null ? null : { op: "neg", l: n }; }
    if (nimm("+")) return vorzeichen();
    return potenz();
  }
  function potenz() {
    const b = einfach();
    if (b === null) return null;
    if (nimm("^")) { const e = vorzeichen(); return e === null ? null : { op: "^", l: b, r: e }; }
    return b;
  }
  function einfach() {
    const m = schau();
    if (!m) return null;
    if (m.typ === "zahl") { p++; return { op: "zahl", wert: m.wert }; }
    if (m.typ === "(") { p++; const n = ausdruck(); if (n === null || !nimm(")")) return null; return n; }
    if (m.typ === "name") {
      p++;
      const name = m.wert;
      if (FUNKTIONEN[name]) {
        if (!nimm("(")) return null;
        const a = ausdruck(); if (a === null || !nimm(")")) return null;
        return { op: "fn", name, l: a };
      }
      if (name === "x") return { op: "x" };
      if (name === "e") return { op: "zahl", wert: Math.E };
      if (name === "pi") return { op: "zahl", wert: Math.PI };
      if (name.length === 1 && PARAM_WERTE[name] !== undefined) return { op: "param", name };
      return null;
    }
    return null;
  }

  const n = ausdruck();
  return n !== null && p === marken.length ? n : null;
}


export function rechne(n, x) {
  switch (n.op) {
    case "zahl": return n.wert;
    case "x": return x;
    case "neg": return -rechne(n.l, x);
    case "+": return rechne(n.l, x) + rechne(n.r, x);
    case "-": return rechne(n.l, x) - rechne(n.r, x);
    case "*": return rechne(n.l, x) * rechne(n.r, x);
    case "/": return rechne(n.l, x) / rechne(n.r, x);
    case "^": return Math.pow(rechne(n.l, x), rechne(n.r, x));
    case "param": return PARAM_WERTE[n.name];
    case "fn": return FUNKTIONEN[n.name](rechne(n.l, x));
    default: return NaN;
  }
}


export function alsFunktion(text) {
  if (!text || !String(text).trim()) return null;
  const m = zerlegen(normieren(text));
  if (!m) return null;
  const b = baum(m);
  if (!b) return null;
  return (x) => rechne(b, x);
}


export function stimmtUeberein(f, g, tol = 1e-6) {
  let geprueft = 0;
  for (const x of PRUEFSTELLEN) {
    let a, b;
    try { a = f(x); b = g(x); } catch (e) { continue; }
    if (!isFinite(a) || !isFinite(b)) continue;
    geprueft++;
    if (Math.abs(a - b) > tol * (1 + Math.abs(b))) return false;
  }
  return geprueft >= 3;
}


export function numAbleitung(f) {
  const h = 1e-4;
  return (x) => (f(x - 2 * h) - 8 * f(x - h) + 8 * f(x + h) - f(x + 2 * h)) / (12 * h);
}

/* ---------- Differenzenquotient: eigener Parser mit x UND h als freien Variablen ----------
   Der normale Parser oben behandelt "h" als festen, unbekannten Parameter (siehe PARAM_WERTE) —
   genau richtig für gewöhnliche Terme, aber falsch hier, wo h selbst gegen null laufen soll.
   Deshalb ein eigener, unabhängiger Zweig: normieren()/zerlegen() bleiben identisch (sie kennen
   nur Zeichen, keine Bedeutung), nur baum() und rechne() bekommen eine eigene Fassung, die "h"
   wie "x" als gebundene Variable behandelt. Am bestehenden Parser ändert das nichts. */


export function baumXH(marken) {
  let p = 0;
  const schau = () => marken[p];
  const nimm = (typ) => { if (marken[p] && marken[p].typ === typ) { p++; return true; } return false; };

  function ausdruck() {
    let n = produkt();
    if (n === null) return null;
    while (schau() && (schau().typ === "+" || schau().typ === "-")) {
      const op = schau().typ; p++;
      const r = produkt(); if (r === null) return null;
      n = { op, l: n, r };
    }
    return n;
  }
  function produkt() {
    let n = vorzeichen();
    if (n === null) return null;
    for (;;) {
      if (schau() && (schau().typ === "*" || schau().typ === "/")) {
        const op = schau().typ; p++;
        const r = vorzeichen(); if (r === null) return null;
        n = { op, l: n, r };
      } else if (schau() && (schau().typ === "zahl" || schau().typ === "name" || schau().typ === "(")) {
        const r = vorzeichen(); if (r === null) return null;
        n = { op: "*", l: n, r };
      } else return n;
    }
  }
  function vorzeichen() {
    if (nimm("-")) { const n = vorzeichen(); return n === null ? null : { op: "neg", l: n }; }
    if (nimm("+")) return vorzeichen();
    return potenz();
  }
  function potenz() {
    const b = einfach();
    if (b === null) return null;
    if (nimm("^")) { const e = vorzeichen(); return e === null ? null : { op: "^", l: b, r: e }; }
    return b;
  }
  function einfach() {
    const m = schau();
    if (!m) return null;
    if (m.typ === "zahl") { p++; return { op: "zahl", wert: m.wert }; }
    if (m.typ === "(") { p++; const n = ausdruck(); if (n === null || !nimm(")")) return null; return n; }
    if (m.typ === "name") {
      p++;
      const name = m.wert;
      if (FUNKTIONEN[name]) {
        if (!nimm("(")) return null;
        const a = ausdruck(); if (a === null || !nimm(")")) return null;
        return { op: "fn", name, l: a };
      }
      if (name === "x") return { op: "x" };
      if (name === "h") return { op: "h" };
      if (name === "e") return { op: "zahl", wert: Math.E };
      if (name === "pi") return { op: "zahl", wert: Math.PI };
      if (name.length === 1 && PARAM_WERTE[name] !== undefined) return { op: "param", name };
      return null;
    }
    return null;
  }

  const n = ausdruck();
  return n !== null && p === marken.length ? n : null;
}


export function rechneXH(n, x, h) {
  switch (n.op) {
    case "zahl": return n.wert;
    case "x": return x;
    case "h": return h;
    case "neg": return -rechneXH(n.l, x, h);
    case "+": return rechneXH(n.l, x, h) + rechneXH(n.r, x, h);
    case "-": return rechneXH(n.l, x, h) - rechneXH(n.r, x, h);
    case "*": return rechneXH(n.l, x, h) * rechneXH(n.r, x, h);
    case "/": return rechneXH(n.l, x, h) / rechneXH(n.r, x, h);
    case "^": return Math.pow(rechneXH(n.l, x, h), rechneXH(n.r, x, h));
    case "param": return PARAM_WERTE[n.name];
    case "fn": return FUNKTIONEN[n.name](rechneXH(n.l, x, h));
    default: return NaN;
  }
}


export function alsFunktionXH(text) {
  if (!text || !String(text).trim()) return null;
  const m = zerlegen(normieren(text));
  if (!m) return null;
  const b = baumXH(m);
  if (!b) return null;
  return (x, h) => rechneXH(b, x, h);
}

/* Feste Testpaare (x,h) für den Vergleich VOR dem Grenzübergang — h stets ungleich null,
   damit ein noch nicht gekürzter Bruch (mit h im Nenner) einen echten, prüfbaren Wert liefert. */

export function diffqStimmtVorLimes(meinsXH, sollXH, paare = DIFFQ_TESTPAARE) {
  let geprueft = 0;
  for (const { x, h } of paare) {
    let a, b;
    try { a = meinsXH(x, h); b = sollXH(x, h); } catch (e) { continue; }
    if (!isFinite(a) || !isFinite(b)) continue;
    geprueft++;
    if (Math.abs(a - b) > 1e-5 * (1 + Math.abs(b))) return false;
  }
  return geprueft >= 4;
}

/* ---------- Differenzenquotient: Aufgabengenerator ----------
   Fünf Familien, vom linearen Term bis zum gebrochenen. Für die Grade 1-3 wird ein
   gemeinsamer Koeffizienten-Formatierer benutzt (ASCII "^2"/"^3", direkt gültig als
   Anzeige- UND Maschinentext), für die gebrochene Familie ein eigener Zweig. Die
   Lösung nach dem Kürzen (Stufe „Vereinfachen") folgt aus der binomischen Entwicklung
   von f(x+h): für f(x) = a x³ + b x² + c x + d gilt
     (f(x+h) − f(x)) / h = (3a x² + 2b x + c) + (3a x + b)·h + a·h² */


export function diffqGlied(k, pot, erster) {
  if (k === 0) return "";
  const betrag = Math.abs(k);
  const term = pot === 0 ? `${betrag}` : pot === 1 ? (betrag === 1 ? "x" : `${betrag}x`) : (betrag === 1 ? `x^${pot}` : `${betrag}x^${pot}`);
  const vor = erster ? (k < 0 ? "-" : "") : (k < 0 ? " - " : " + ");
  return vor + term;
}

export function diffqPoly(a, b, c, d) {
  let s = "", erster = true;
  [[a, 3], [b, 2], [c, 1], [d, 0]].forEach(([k, pot]) => {
    if (k === 0) return;
    s += diffqGlied(k, pot, erster);
    erster = false;
  });
  return s || "0";
}

export function diffqVerTermeText(teile) {
  let s = "", erster = true;
  teile.forEach(({ k, term }) => {
    if (k === 0) return;
    const betrag = Math.abs(k);
    const zahl = term !== "" && betrag === 1 ? "" : String(betrag);
    const vor = erster ? (k < 0 ? "-" : "") : (k < 0 ? " - " : " + ");
    s += vor + zahl + term;
    erster = false;
  });
  return s || "0";
}


export function diffqAufgabe(stufe) {
  if (stufe === 5) {
    const c = ganz(-4, 4);
    const vorzeichen = c === 0 ? "" : c < 0 ? `- ${-c}` : `+ ${c}`;
    const nenner = c === 0 ? "x" : `x ${vorzeichen}`;
    return { bruch: true, c, f: c === 0 ? "1/x" : `1/(x${c < 0 ? "" : "+"}${c})`, tex: `\\frac{1}{${nenner}}` };
  }
  let a = 0, b = 0, c = 0, d = 0;
  if (stufe === 1) { c = ganzNZ(-4, 4); d = ganz(-5, 5); }
  else if (stufe === 2) { b = 1; d = ganzNZ(-6, 6); }
  else if (stufe === 3) { b = [-2, -1, 1, 2][ganz(0, 3)]; c = ganz(-4, 4); d = ganz(-5, 5); }
  else { a = [-1, 1, 2][ganz(0, 2)]; c = ganzNZ(-4, 4); }
  const text = diffqPoly(a, b, c, d);
  return { bruch: false, a, b, c, d, f: text, tex: text };
}


export function diffqX0(auf) {
  let x0;
  do { x0 = ganz(-3, 3); } while (auf.bruch && x0 === -auf.c);
  return x0;
}

/* Lösung der ersten Stufe ("Vereinfachen") — noch mit h, ohne Grenzübergang. */

export function diffqLoesung1(auf, x0) {
  const stelle = x0 !== null;
  if (auf.bruch) {
    const c = auf.c;
    const nz = (v) => (v === 0 ? "" : v < 0 ? ` - ${-v}` : ` + ${v}`);
    const x1 = stelle ? String(x0) : "x";
    return `-\\frac{1}{(${x1}+h${nz(c)})\\,(${x1}${nz(c)})}`;
  }
  const { a, b, c } = auf;
  if (stelle) {
    const konst = 3 * a * x0 * x0 + 2 * b * x0 + c;
    return diffqVerTermeText([{ k: konst, term: "" }, { k: 3 * a * x0 + b, term: "h" }, { k: a, term: "h^2" }]);
  }
  return diffqVerTermeText([
    { k: 3 * a, term: "x^2" }, { k: 2 * b, term: "x" }, { k: c, term: "" },
    { k: 3 * a, term: "xh" }, { k: b, term: "h" }, { k: a, term: "h^2" },
  ]);
}

/* Lösung der zweiten Stufe ("Grenzwert") — h ist verschwunden. */

export function diffqLoesung2(auf, x0) {
  const stelle = x0 !== null;
  if (auf.bruch) {
    const c = auf.c;
    if (stelle) return String(-1 / ((x0 + c) ** 2));
    const nz = c === 0 ? "" : c < 0 ? ` - ${-c}` : ` + ${c}`;
    return `-\\frac{1}{(x${nz})^2}`;
  }
  const { a, b, c } = auf;
  if (stelle) return String(3 * a * x0 * x0 + 2 * b * x0 + c);
  return diffqPoly(0, 3 * a, 2 * b, c);
}

/* ---------- Inhalte des Moduls ---------- */


export function PdfKnopf({ klein }) {
  const [hinweis, setHinweis] = useState(false);
  const klick = () => (MODUL_PDF_URL ? window.open(MODUL_PDF_URL, "_blank") : setHinweis(true));
  return (
    <div>
      {klein ? (
        <button onClick={klick} style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
          Modul als PDF herunterladen
        </button>
      ) : (
        <button onClick={klick} className="w-full px-5 py-4"
          style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.tinte, display: "block" }}>Das ganze Modul als PDF</span>
          <span style={{ fontSize: 13, color: C.grau, fontWeight: 300, display: "block", marginTop: 3 }}>
            Alle Herleitungen, 60 Aufgaben mit Lösungen — zum Ausdrucken und Danebenlegen.
          </span>
        </button>
      )}
      {hinweis && (
        <p style={{ color: C.grau, fontSize: 12.5, fontWeight: 300, marginTop: 8, lineHeight: 1.6 }}>
          Die PDF wird unter MODUL_PDF_URL hinterlegt.
        </p>
      )}
    </div>
  );
}


export function Uebung({ kapitel }) {
  const [i, setI] = useState(0);
  const [eingabe, setEingabe] = useState("");
  const [stand, setStand] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [kiAufgabe, setKiAufgabe] = useState(null);
  const [laedt, setLaedt] = useState(false);
  const [zaehler, setZaehler] = useState({ n: 0, ok: 0 });

  const aufgabe = kiAufgabe || kapitel.aufgaben[i];
  const zuruecksetzen = () => { setEingabe(""); setStand(null); setZeigen(false); };

  const pruefen = () => {
    const meins = alsFunktion(eingabe);
    if (!meins) { setStand("unlesbar"); return; }
    const soll = alsFunktion(aufgabe.loesung);
    const ok = soll ? stimmtUeberein(meins, soll, aufgabe.tol || 1e-6) : false;
    setStand(ok ? "richtig" : "falsch");
    setZaehler((z) => ({ n: z.n + 1, ok: z.ok + (ok ? 1 : 0) }));
  };

  const weiter = () => {
    if (kiAufgabe) { setKiAufgabe(null); zuruecksetzen(); return; }
    setI((i + 1) % kapitel.aufgaben.length);
    zuruecksetzen();
  };

  const neueVonKi = async () => {
    setLaedt(true); zuruecksetzen();
    const fertig = (a) => { setKiAufgabe(a); setLaedt(false); };
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: kiKopf(),
        body: JSON.stringify({
          model: "claude-sonnet-5-5",
          max_tokens: 300,
          messages: [{
            role: "user",
            content: `Erzeuge eine neue Übungsaufgabe zum Thema: ${kapitel.thema}. Schwierigkeit wie in der Oberstufe, Klasse 11.
Antworte nur mit JSON, ohne Vorrede:
{"frage":"Aufgabentext auf Deutsch. Formeln darin in LaTeX zwischen Dollarzeichen, z.B. $f(x) = 3x^2 + 5x$","f":"die Funktion in Maschinenschreibweise","fs":"ihre Ableitung in Maschinenschreibweise"}
Maschinenschreibweise: Potenzen mit ^, Multiplikation mit *, Funktionen als sin(x), cos(x), ln(x), e^x. Nur die Variable x. Keine Ketten- oder Quotientenregel.`,
          }],
        }),
      });
      const daten = await kiAntwort(res);
      const text = (daten.content || []).map((t) => (t.type === "text" ? t.text : "")).join("");
      const roh = jsonLesen(text);
      const f = alsFunktion(roh.f), fs = alsFunktion(roh.fs);
      if (f && fs && roh.frage && stimmtUeberein(fs, numAbleitung(f), 1e-3)) {
        fertig({ frage: roh.frage, loesung: roh.fs, tol: 1e-4, ki: true });
      } else {
        fertig({ ...kapitel.ersatz(), ersatz: true });
      }
    } catch (e) {
      fertig({ ...kapitel.ersatz(), ersatz: true });
    }
  };

  const randFarbe = stand === "richtig" ? C.gruenDunkel : stand === null ? C.linie : C.signal;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <span style={{ fontSize: 13, fontWeight: 600, color: C.see }}>
          {kiAufgabe ? (kiAufgabe.ersatz ? "Zusatzaufgabe" : "Neu von Mathilda") : `Aufgabe ${i + 1} von ${kapitel.aufgaben.length}`}
        </span>
        {zaehler.n > 0 && <span style={{ fontSize: 12, color: C.hellgrau }}>{zaehler.ok} von {zaehler.n} richtig</span>}
      </div>

      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
        <Text s={aufgabe.frage} style={{ fontSize: 16.5, lineHeight: 1.85, marginBottom: 18 }} />

        {aufgabe.frei ? (
          !zeigen ? (
            <button onClick={() => setZeigen(true)} className="px-6 py-3"
              style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
              Antwort ansehen
            </button>
          ) : (
            <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16 }}>
              <Text s={aufgabe.antwort} style={{ fontSize: 15, lineHeight: 1.85, color: C.tinte }} />
            </div>
          )
        ) : (
          <>
            <div className="flex items-center flex-wrap" style={{ gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 17 }}>f′(x) =</span>
              <input value={eingabe} onChange={(e) => { setEingabe(e.target.value); setStand(null); }}
                placeholder="deine Lösung"
                style={{ flex: 1, minWidth: 150, padding: "10px 12px", fontSize: 16, fontFamily: "inherit",
                  border: `1.5px solid ${randFarbe}`, borderRadius: 12, outline: "none",
                  background: stand === "richtig" ? C.himmel : C.weiss, color: C.tinte }} />
            </div>
            <p style={{ color: C.hellgrau, fontSize: 12, fontWeight: 300, lineHeight: 1.6, marginBottom: 14 }}>
              Schreibweise beim Eintippen: Potenzen mit ^, Produkte mit * oder ohne Zeichen, Funktionen als sin(x), ln(x), e^x.
            </p>

            {stand === null && (
              <button onClick={pruefen} disabled={!eingabe.trim()} className="px-6 py-3"
                style={{ background: eingabe.trim() ? C.see : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: eingabe.trim() ? "pointer" : "default" }}>
                Prüfen
              </button>
            )}

            {stand && (
              <div style={{ borderLeft: `4px solid ${stand === "richtig" ? C.see : C.signal}`, paddingLeft: 16, marginTop: 4 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: stand === "richtig" ? C.see : C.signal, marginBottom: 6 }}>
                  {stand === "richtig" ? "Stimmt." : stand === "unlesbar" ? "Das kann ich nicht lesen." : "Noch nicht."}
                </p>
                <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>
                  {stand === "richtig"
                    ? "Auch umgeformte Schreibweisen werden anerkannt, solange der Wert überall derselbe ist."
                    : stand === "unlesbar"
                      ? "Prüfe die Klammern und schreibe Funktionen mit Argument, also sin(x) statt sin x."
                      : "Geh den Weg noch einmal durch, bevor du die Lösung ansiehst. Meist steckt der Fehler in einem konstanten Faktor."}
                </p>
                {stand !== "richtig" && !zeigen && (
                  <button onClick={() => setZeigen(true)} className="mt-3"
                    style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                    Lösung zeigen
                  </button>
                )}
                {zeigen && (
                  <p style={{ fontSize: 17, color: C.see, fontWeight: 600, marginTop: 12, lineHeight: 2 }}>
                    f′(x) = <M t={aufgabe.zeig || aufgabe.loesung} />
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex flex-wrap gap-3 mt-5">
          <button onClick={weiter} className="px-5 py-3"
            style={{ background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>
            {kiAufgabe ? "Zurück zu den Aufgaben" : "Nächste Aufgabe"}
          </button>
          <button onClick={neueVonKi} disabled={laedt} className="px-5 py-3"
            style={{ background: C.weiss, color: C.gruenDunkel, border: `1px solid ${C.gruenDunkel}`, borderRadius: 999, fontSize: 14, fontFamily: "inherit", cursor: laedt ? "wait" : "pointer" }}>
            {laedt ? "…" : "Neue Aufgabe erzeugen"}
          </button>
        </div>
      </div>
    </div>
  );
}


export function LernModul({ modul, onZurueck, startKapitel }) {
  const einzel = modul.kapitel.length === 1;
  const [kapitel, setKapitel] = useState(
    einzel ? modul.kapitel[0] : (startKapitel ? modul.kapitel.find((k) => k.nr === startKapitel) || null : null));
  const [reiter, setReiter] = useState("theorie");

  if (!kapitel) {
    return (
      <div>
        <button onClick={onZurueck} className="mb-5"
          style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
          ← Trainingsbereich
        </button>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
          {modul.titel}
        </h2>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
          {modul.kurz}
        </p>

        {modul.pdf && <ErklaerVideo id={DEMO_VIDEO_ID} titel="Ableitungsregeln — die Herleitung" />}
        {modul.pdf && <div style={{ marginBottom: 22 }}><PdfKnopf /></div>}

        {modul.kapitel.map((k) => (
          <button key={k.nr} onClick={() => { setKapitel(k); setReiter("theorie"); }} className="w-full px-5 py-5 mb-3"
            style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: C.tinte, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
            <div className="flex">
              <span style={{ color: C.gruenDunkel, fontWeight: 700, fontSize: 14, width: 26, flexShrink: 0 }}>{k.nr}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{k.titel}</p>
                <p style={{ color: C.grau, fontSize: 13, fontWeight: 300, lineHeight: 1.55 }}>{k.kurz}</p>
                <p style={{ color: C.hellgrau, fontSize: 12, marginTop: 8 }}>
                  Herleitung · 2 Beispiele · {k.aufgaben.length} Aufgaben
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => (einzel ? onZurueck() : setKapitel(null))} className="mb-5"
        style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
        {einzel ? "← Trainingsbereich" : "← Alle Kapitel"}
      </button>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 16 }}>
        {kapitel.titel}
      </h2>

      <div className="flex gap-2 mb-6">
        {[["theorie", "Herleitung"], ["beispiele", "Beispiele"], ["ueben", "Üben"]].map(([id, t]) => (
          <button key={id} onClick={() => setReiter(id)} className="px-4 py-2"
            style={{ background: reiter === id ? C.see : C.weiss, color: reiter === id ? C.weiss : C.grau, border: `1px solid ${reiter === id ? C.see : C.linie}`, borderRadius: 999, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>

      {reiter === "theorie" && (
        <div>
          {kapitel.theorie.map((b, i) => {
            if (b.t === "formel") return <Formel key={i} titel={b.titel} zeilen={b.zeilen} />;
            if (b.t === "merk") return (
              <div key={i} style={{ borderLeft: `3px solid ${C.gruen}`, paddingLeft: 16, margin: "20px 0 22px" }}>
                {b.s.split("\n\n").map((abs, j) => (
                  <Text key={j} s={abs} style={{ fontSize: 14.5, lineHeight: 1.85, margin: j === 0 ? 0 : "10px 0 0" }} />
                ))}
              </div>
            );
            return <Text key={i} s={b.s} style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.9, marginBottom: 16 }} />;
          })}
          {modul.pdf && <div style={{ marginTop: 8 }}><PdfKnopf klein /></div>}
        </div>
      )}

      {reiter === "beispiele" && (
        <div>
          {kapitel.beispiele.map((b, i) => (
            <div key={i} style={{ background: C.weiss, borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Beispiel {i + 1} · {b.titel}</p>
              {b.schritte.map((s, j) => (
                <div key={j} style={{ fontSize: 16.5, lineHeight: 2.2, color: C.tinte, overflowX: "auto" }}><M t={s} /></div>
              ))}
              <div style={{ fontSize: 15.5, fontWeight: 600, color: C.gruenDunkel, marginTop: 12, lineHeight: 1.9 }}>
                <M t={b.ergebnis} />
              </div>
            </div>
          ))}
          {modul.pdf && <div style={{ marginTop: 8 }}><PdfKnopf klein /></div>}
        </div>
      )}

      {reiter === "ueben" && <Uebung kapitel={kapitel} />}
    </div>
  );
}

/* ---------- Rechenweg-Motor ---------- */

/* Jeder Aufgabentyp beschreibt nur, welche Meilensteine sein Weg braucht und
   woran man sie erkennt. Die Prüfung selbst ist typunabhängig. */


export function zahlAus(s) {
  const direkt = parseZahl(s);
  if (direkt !== null) return direkt;
  const fn = alsFunktion(s);
  if (!fn) return null;
  const a = fn(1.37), b = fn(2.91);
  if (isFinite(a) && isFinite(b) && Math.abs(a - b) < 1e-9) return a;
  return null;
}


export function parabelErzeugen() {
  const a = zuf([1, -1, 1, -1, 2, -2, 3, -3]);
  const xs = ganz(-4, 4);
  const b = -2 * a * xs;
  const c = ganz(-9, 9);
  const ys = a * xs * xs + b * xs + c;
  const hoch = a < 0;
  return {
    a, b, c, xs, ys, hoch,
    tex: `${a === 1 ? "" : a === -1 ? "-" : a}x^2 ${b === 0 ? "" : (b < 0 ? "- " : "+ ") + Math.abs(b) + "x"} ${c < 0 ? "-" : "+"} ${Math.abs(c)}`,
    f: `${a}x^2+${b}x+${c}`,
    abl: `${2 * a}x+${b}`,
    art: hoch ? "Hochpunkt" : "Tiefpunkt",
  };
}


export function quadratMitNullstellen() {
  const a = zuf([1, 1, -1, 2]);
  const r1 = ganz(-5, 2);
  const r2 = r1 + ganz(1, 5);
  const b = -a * (r1 + r2), c = a * r1 * r2;
  return {
    a, b, c, r1, r2,
    tex: `${a === 1 ? "" : a === -1 ? "-" : a}x^2 ${b < 0 ? "- " : "+ "}${Math.abs(b)}x ${c < 0 ? "- " : "+ "}${Math.abs(c)}`,
    f: `${a}x^2+${b}x+${c}`,
  };
}


export function tangenteErzeugen() {
  const a = zuf([1, 1, -1, 2]);
  const b = ganz(-5, 5), c = ganz(-6, 6);
  const x0 = ganz(-3, 3);
  const m = 2 * a * x0 + b;
  const y0 = a * x0 * x0 + b * x0 + c;
  const n = y0 - m * x0;
  return {
    a, b, c, x0, m, y0, n,
    tex: `${a === 1 ? "" : a === -1 ? "-" : a}x^2 ${b < 0 ? "- " : "+ "}${Math.abs(b)}x ${c < 0 ? "- " : "+ "}${Math.abs(c)}`,
    f: `${a}x^2+${b}x+${c}`,
    abl: `${2 * a}x+${b}`,
    tangente: `${m}x+${n}`,
  };
}


export function wegPruefen(zeilen, typ, a) {
  const regeln = typ.regeln(a);
  const erfuellt = {};
  const fehler = [];
  const lob = [];

  const alsFn = (s) => alsFunktion(s);
  const gleichFn = (s, sollText) => {
    const f1 = alsFn(s), f2 = alsFn(sollText);
    return f1 && f2 && stimmtUeberein(f1, f2, 1e-6);
  };

  zeilen.forEach((roh, idx) => {
    if (istLeer(roh)) return;
    const t = roh.trim();
    const nr = idx + 1;

    // Punktangabe
    const p = t.match(/([A-Z])?\s*\(\s*(-?[\d.,]+)\s*[|;]\s*(-?[\d.,]+)\s*\)\s*$/);
    if (p && /[|;]/.test(t)) {
      const px = parseFloat(p[2].replace(",", ".")), py = parseFloat(p[3].replace(",", "."));
      const punktRegeln = regeln.filter((r) => r.art === "punkt" || r.art === "punktmenge");
      let getroffen = false;
      for (const r of punktRegeln) {
        const liste = r.art === "punkt" ? [r.soll] : r.soll;
        const marken = r.art === "punkt" ? [r.marke] : r.marken;
        liste.forEach((soll, k) => {
          if (gleichZahl(px, soll[0]) && gleichZahl(py, soll[1])) {
            getroffen = true;
            const id = r.teile ? r.teile[k] : r.id;
            erfuellt[id] = true;
            if (marken[k] && p[1] === marken[k]) erfuellt.art = true;
            if (marken[k] && p[1] && p[1] !== marken[k] && "HT".includes(p[1]))
              fehler.push(`Zeile ${nr}: ${r.markeFehler || "Die Art des Punktes stimmt nicht."}`);
          } else if (gleichZahl(px, soll[0])) {
            getroffen = true;
            fehler.push(`Zeile ${nr}: Die Stelle stimmt, der Funktionswert nicht. Setze sie noch einmal in f ein.`);
          }
        });
      }
      if (!getroffen && punktRegeln.length) fehler.push(`Zeile ${nr}: Der angegebene Punkt stimmt nicht.`);
      return;
    }

    const teile = t.split("=").map((s) => s.trim()).filter((s) => s.length);

    // Einzelner Term: Formregeln
    if (teile.length < 2) {
      for (const r of regeln.filter((x) => x.art === "form")) {
        if (gleichFn(t, r.soll) && r.muster.test(t)) {
          erfuellt[r.id] = true;
          (r.erfuelltAuch || []).forEach((id) => { erfuellt[id] = true; });
          if (r.lob) lob.push(r.lob);
        }
      }
      return;
    }

    const kopf = teile[0].replace(/\s/g, "");
    const rest = teile.slice(1);
    const hatNull = rest.some((x) => gleichZahl(zahlAus(x), 0));

    // Regel über den Kopf der Zeile
    const passend = regeln.find((r) => r.kopf && r.kopf.test(kopf));
    if (passend) {
      if (passend.art === "term") {
        const treffer = rest.find((x) => gleichFn(x, passend.soll));
        if (treffer) {
          erfuellt[passend.id] = true;
          if (passend.auchNull && hatNull) erfuellt[passend.auchNull] = true;
        } else fehler.push(`Zeile ${nr}: ${passend.fehler || "Der Term stimmt nicht."}`);
        return;
      }
      if (passend.art === "zahl") {
        const v = zahlAus(rest[rest.length - 1]);
        if (gleichZahl(v, passend.soll)) erfuellt[passend.id] = true;
        else if (v !== null) fehler.push(`Zeile ${nr}: ${passend.fehler || "Die Zahl stimmt nicht."}`);
        return;
      }
      if (passend.art === "zahlmenge") {
        const v = zahlAus(rest[rest.length - 1]);
        const k = passend.soll.findIndex((s) => gleichZahl(v, s));
        if (k >= 0) erfuellt[passend.teile[k]] = true;
        else if (v !== null) fehler.push(`Zeile ${nr}: ${passend.fehler || "Dieser Wert passt nicht."}`);
        return;
      }
    }

    // Gleichung ohne Beschriftung
    if (hatNull) {
      for (const r of regeln.filter((x) => x.art === "nullgleichung")) {
        if (gleichFn(teile[0], r.soll)) { erfuellt[r.id] = true; return; }
      }
      for (const r of regeln.filter((x) => x.art === "falle" && x.wennNull)) {
        if (gleichFn(teile[0], r.soll)) { fehler.push(`Zeile ${nr}: ${r.fehler}`); return; }
      }
    }

    // Kette gleichwertiger Terme
    const fns = teile.map(alsFn);
    if (fns.every(Boolean)) {
      for (let k = 1; k < fns.length; k++) {
        if (!stimmtUeberein(fns[0], fns[k], 1e-6)) {
          fehler.push(`Zeile ${nr}: Die ${k + 1}. Seite hat nicht denselben Wert wie die erste — hier bricht die Umformung.`);
          return;
        }
      }
      for (const r of regeln.filter((x) => x.art === "form")) {
        if (gleichFn(teile[0], r.soll) && r.muster.test(teile[0])) {
          erfuellt[r.id] = true;
          (r.erfuelltAuch || []).forEach((id) => { erfuellt[id] = true; });
          if (r.lob) lob.push(r.lob);
        }
      }
    }
  });

  // Sammelmeilensteine aus Teilen
  typ.schritte.forEach((s) => {
    if (s.id === "x" && erfuellt.x1 && erfuellt.x2) erfuellt.x = true;
    if (s.id === "punkt" && erfuellt.punktH && erfuellt.punktT) erfuellt.punkt = true;
  });

  const offen = typ.schritte.filter((s) => !erfuellt[s.id] && !s.weich);
  return { erfuellt, fehler, offen, lob, vollstaendig: offen.length === 0 && fehler.length === 0 };
}

/* Der nächste sinnvolle Schritt: erster offener Meilenstein. */

export function naechsterSchritt(bericht, typ) {
  if (!bericht) return typ.schritte[0];
  return bericht.offen[0] || typ.schritte.find((s) => s.weich && !bericht.erfuellt[s.id]) || null;
}

/* ---------- Rechenweg-Editor ---------- */


export function zeileSetzen(text) {
  if (istLeer(text)) return null;
  return String(text).split("=").map((teil, i) => {
    const t = teil.trim();
    const tex = termAlsTex(t);
    return (
      <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
        {i > 0 && <span style={{ margin: "0 0.45em" }}>=</span>}
        {tex ? <M t={tex} /> : <span>{t}</span>}
      </span>
    );
  });
}


export function RechenwegEditor({ onZurueck }) {
  const [typ, setTyp] = useState(WEG_TYPEN[0]);
  const [auf, setAuf] = useState(() => WEG_TYPEN[0].erzeugen());
  const [zeilen, setZeilen] = useState(["", ""]);
  const [aktiv, setAktiv] = useState(0);
  const [pos, setPos] = useState(0);
  const [bericht, setBericht] = useState(null);
  const [hilfe, setHilfe] = useState(0);
  const [modus, setModus] = useState("uebung");
  const [grossOffen, setGrossOffen] = useState(false);

  const wert = zeilen[aktiv] || "";

  const setzen = (t, p) => {
    const kopie = [...zeilen];
    kopie[aktiv] = t;
    setZeilen(kopie);
    setPos(Math.max(0, Math.min(p, t.length)));
    setBericht(null);
  };

  const einfuegen = (s) => {
    let t = wert, p = pos;
    if (t[p] === PLATZ) t = t.slice(0, p) + s + t.slice(p + 1);
    else t = t.slice(0, p) + s + t.slice(p);
    const rel = s.indexOf(PLATZ);
    setzen(t, rel >= 0 ? p + rel : p + s.length);
  };

  const bruch = () => {
    let i = pos, tiefe = 0;
    while (i > 0) {
      const ch = wert[i - 1];
      if (ch === ")") { tiefe++; i--; continue; }
      if (ch === "(") { if (tiefe === 0) break; tiefe--; i--; continue; }
      if (tiefe === 0 && "+-=".includes(ch)) break;
      i--;
    }
    const zaehler = wert.slice(i, pos).trim();
    if (!zaehler) { einfuegen(`(${PLATZ})/(${PLATZ})`); return; }
    setzen(wert.slice(0, i) + `(${zaehler})/(${PLATZ})` + wert.slice(pos), i + zaehler.length + 4);
  };

  const raus = () => { const zu = wert.indexOf(")", pos); setPos(zu >= 0 ? zu + 1 : wert.length); };
  const naechsterPlatz = () => {
    const ab = wert.indexOf(PLATZ, pos + 1);
    const idx = ab >= 0 ? ab : wert.indexOf(PLATZ);
    setPos(idx >= 0 ? idx : wert.length);
  };
  const zurueckTaste = () => { if (pos > 0) setzen(wert.slice(0, pos - 1) + wert.slice(pos), pos - 1); };
  const neueZeile = () => {
    const kopie = [...zeilen];
    kopie.splice(aktiv + 1, 0, "");
    setZeilen(kopie); setAktiv(aktiv + 1); setPos(0); setBericht(null);
  };
  const zeileWeg = () => {
    if (zeilen.length <= 1) { setzen("", 0); return; }
    setZeilen(zeilen.filter((_, i) => i !== aktiv));
    setAktiv(Math.max(0, aktiv - 1)); setPos(0); setBericht(null);
  };

  const neueAufgabe = (t) => {
    const art = t || typ;
    setAuf(art.erzeugen()); setZeilen(["", ""]); setAktiv(0); setPos(0); setBericht(null); setHilfe(0);
  };
  const typWechseln = (t) => { setTyp(t); neueAufgabe(t); };

  const pruefen = () => {
    const b = wegPruefen(zeilen, typ, auf);
    setBericht(b); setHilfe(0);
    merken({ bereich: "rechenweg", gruppe: typ.titel, richtig: b.vollstaendig,
      fehlerart: b.vollstaendig ? null : (b.fehler.length ? "regel" : "sonstiges") });
  };

  const laufend = wegPruefen(zeilen, typ, auf);
  const anzeige = modus === "uebung" ? (bericht || laufend) : bericht;
  const jetzigerBericht = bericht || laufend;
  const schritt = naechsterSchritt(jetzigerBericht, typ);

  const tasten = [
    { z: "7", e: "7" }, { z: "8", e: "8" }, { z: "9", e: "9" },
    { z: "(", e: "(", h: 1 }, { z: ")", e: ")", h: 1 }, { z: "÷", fn: bruch, h: 1 },
    { z: "4", e: "4" }, { z: "5", e: "5" }, { z: "6", e: "6" },
    { z: "·", e: "*", h: 1 }, { z: "−", e: "-", h: 1 }, { z: "+", e: "+", h: 1 },
    { z: "1", e: "1" }, { z: "2", e: "2" }, { z: "3", e: "3" },
    { z: "0", e: "0" }, { z: ",", e: "." }, { z: "=", e: "=", h: 1 },
    { z: "x", e: "x", h: 1 }, { z: "x²", e: "x^2", h: 1, k: 1 }, { z: "x³", e: "x^3", h: 1, k: 1 },
    { z: "▯^", e: `^(${PLATZ})`, h: 1, k: 1 }, { z: "1/x", e: "1/x", h: 1, k: 1 },
    { z: "1/▯", e: `1/(${PLATZ})`, h: 1, k: 1 },
    { z: "√x", e: "sqrt(x)", h: 1, k: 1 }, { z: "√▯", e: `sqrt(${PLATZ})`, h: 1, k: 1 },
    { z: "sin", e: "sin(x)", h: 1, k: 1 }, { z: "cos", e: "cos(x)", h: 1, k: 1 },
    { z: "eˣ", e: "e^x", h: 1, k: 1 }, { z: "ln", e: "ln(x)", h: 1, k: 1 },
    { z: "π", e: "pi", h: 1 }, { z: "e", e: "e", h: 1 },
    { z: "f(x)", e: "f(x)", h: 1, k: 1 }, { z: "f(▯)", e: `f(${PLATZ})`, h: 1, k: 1 },
  ].concat(typ.bausteine.map(([z, e]) => ({
    z, k: z.length > 2,
    e: e === "H" || e === "T" ? `${e}(${PLATZ}|${PLATZ})` : e === "±" ? "±" : e.replace("▯", PLATZ), h: 1,
  }))).concat([
    { z: "⌫", fn: zurueckTaste, a: 1 },
    { z: "←", fn: () => setPos(Math.max(0, pos - 1)), a: 1 },
    { z: "→", fn: () => setPos(Math.min(wert.length, pos + 1)), a: 1 },
    { z: "raus", fn: raus, a: 1, k: 1 },
    { z: PLATZ, fn: naechsterPlatz, a: 1 },
  ]);

  return (
    <div>
      <button onClick={onZurueck} className="mb-5"
        style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
        ← Trainingsbereich
      </button>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Nicht das Ergebnis, der Weg
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Schreib die Rechnung Zeile für Zeile auf. Geprüft wird beides: ob jede Zeile stimmt und ob der Weg
        vollständig ist.
      </p>

      <div className="flex gap-2 mb-4">
        {[["uebung", "Übung · sofort prüfen"], ["klausur", "Klausur · erst am Ende"]].map(([id, n]) => (
          <button key={id} onClick={() => { setModus(id); setBericht(null); }} className="px-4 py-2"
            style={{ flex: 1, background: modus === id ? C.gruenDunkel : C.weiss, color: modus === id ? C.weiss : C.grau,
              border: `1px solid ${modus === id ? C.gruenDunkel : C.linie}`, borderRadius: 999, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
            {n}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {WEG_TYPEN.map((t) => (
          <button key={t.id} onClick={() => typWechseln(t)} className="px-4 py-2"
            style={{ background: typ.id === t.id ? C.see : C.weiss, color: typ.id === t.id ? C.weiss : C.grau,
              border: `1px solid ${typ.id === t.id ? C.see : C.linie}`, borderRadius: 999, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
            {t.titel}
          </button>
        ))}
      </div>

      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 8 }}>Aufgabe</p>
        <p style={{ fontSize: 15.5, lineHeight: 1.7, marginBottom: 10 }}>{typ.aufgabe(auf)}</p>
        <div style={{ fontSize: 20, lineHeight: 2 }}>f(x) = <M t={auf.tex} /></div>
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>Dein Rechenweg</p>
      <div style={{ background: C.weiss, borderRadius: 16, padding: 14, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 10 }}>
        {zeilen.map((z, i) => {
          const dran = i === aktiv;
          const stand = anzeige ? (anzeige.fehler.some((f) => f.startsWith(`Zeile ${i + 1}:`)) ? "fehler" : (!istLeer(z) ? "ok" : null)) : null;
          return (
            <div key={i} onClick={() => { setAktiv(i); setPos((zeilen[i] || "").length); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 6,
                borderRadius: 11, cursor: "pointer", background: dran ? C.himmel : "transparent",
                borderLeft: `3px solid ${stand === "fehler" ? C.signal : stand === "ok" ? C.see : dran ? C.see : "transparent"}` }}>
              <span style={{ color: C.hellgrau, fontSize: 11.5, width: 14, flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1, fontSize: 17, lineHeight: 1.9, minHeight: 26, overflowX: "auto" }}>
                {istLeer(z)
                  ? <span style={{ color: C.hellgrau, fontSize: 14, fontWeight: 300 }}>{dran ? "hier schreiben" : "leer"}</span>
                  : zeileSetzen(z)}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 12.5, color: C.hellgrau, fontWeight: 300, marginBottom: 10, wordBreak: "break-all" }}>
        {wert.slice(0, pos)}<span style={{ color: C.gruenDunkel, fontWeight: 700 }}>|</span>{wert.slice(pos)}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 5 }}>
        {tasten.map((t, i) => (
          <button key={i} onClick={() => (t.fn ? t.fn() : einfuegen(t.e))}
            style={{ width: "100%", aspectRatio: "1 / 1",
              background: t.a ? C.see : t.h ? C.himmel : C.weiss, color: t.a ? C.weiss : C.tinte,
              border: `1px solid ${t.a ? C.see : C.linie}`, borderRadius: 12,
              fontSize: t.k ? 11.5 : 16, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", padding: 0,
              display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
            {t.z}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginTop: 5 }}>
        {[{ z: "Neue Zeile", fn: neueZeile }, { z: "Zeile löschen", fn: zeileWeg }].map((t, i) => (
          <button key={i} onClick={t.fn}
            style={{ height: 42, background: C.himmel, color: C.tinte, border: `1px solid ${C.linie}`,
              borderRadius: 12, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>
            {t.z}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        <button onClick={pruefen} className="px-6 py-3"
          style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Rechenweg prüfen
        </button>
        <button onClick={() => setHilfe(hilfe === 0 ? 1 : hilfe + 1)} className="px-6 py-3"
          style={{ background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
          {hilfe === 0 ? "Ich komme nicht weiter" : hilfe === 1 ? "Noch ein Hinweis" : "Zeig mir die Zeile"}
        </button>
        <button onClick={() => neueAufgabe()} className="px-6 py-3"
          style={{ background: "transparent", color: C.grau, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
          Neue Aufgabe
        </button>
        <button onClick={() => setGrossOffen(true)} className="px-6 py-3"
          style={{ background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
          Großer Editor
        </button>
      </div>

      {grossOffen && (
        <LoesungsWeg titelTex={auf.tex} aufgabeText={typ.aufgabe(auf)} typ={typ} auf={auf}
          onSchliessen={() => setGrossOffen(false)} />
      )}

      {/* Sokratische Hilfe zum nächsten offenen Schritt */}
      {hilfe > 0 && schritt && (
        <div style={{ background: C.himmel, borderRadius: 16, padding: 18, marginTop: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 }}>
            Dein nächster Schritt · {schritt.name}
          </p>
          <p style={{ fontSize: 15.5, lineHeight: 1.75, marginBottom: hilfe > 1 ? 14 : 0 }}>{schritt.frage}</p>
          {hilfe > 1 && (
            <p style={{ fontSize: 14.5, lineHeight: 1.75, color: C.grau, fontWeight: 300 }}>{schritt.tipp}</p>
          )}
          {hilfe > 2 && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid #D5DEEE` }}>
              <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, marginBottom: 6 }}>So sähe diese Zeile aus:</p>
              <div style={{ fontSize: 17, lineHeight: 2 }}>{zeileSetzen(schritt.muster(auf))}</div>
              <button onClick={() => { setzen(schritt.muster(auf).replace(/\s/g, ""), 0); setHilfe(0); }}
                className="mt-3 px-5 py-2"
                style={{ background: C.see, color: C.weiss, border: "none", borderRadius: 999, fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                In die Zeile übernehmen
              </button>
            </div>
          )}
        </div>
      )}
      {hilfe > 0 && !schritt && (
        <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginTop: 18 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.see }}>Es ist alles da.</p>
          <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>
            Dein Weg enthält alle nötigen Schritte. Lass ihn prüfen.
          </p>
        </div>
      )}

      {/* Bericht */}
      {bericht && (
        <div style={{ background: C.weiss, borderRadius: 16, padding: 20, marginTop: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: bericht.vollstaendig ? C.see : C.signal, marginBottom: 12 }}>
            {bericht.vollstaendig ? "Der Weg ist vollständig und trägt." : "Der Weg ist noch nicht vollständig."}
            <span style={{ display: "block", fontSize: 13, fontWeight: 400, color: C.grau, marginTop: 4 }}>
              {typ.schritte.filter((sch) => bericht.erfuellt[sch.id]).length} von {typ.schritte.length} Bewertungseinheiten
              {bericht.fehler.length > 0 ? ` · ${bericht.fehler.length} Zeile${bericht.fehler.length > 1 ? "n" : ""} mit Fehler` : ""}
            </span>
          </p>
          {typ.schritte.map((s) => {
            const da = bericht.erfuellt[s.id];
            return (
              <div key={s.id} className="flex items-center" style={{ gap: 10, marginBottom: 8 }}>
                <span style={{ width: 16, textAlign: "center", fontSize: 14,
                  color: da ? C.see : s.weich ? C.hellgrau : C.signal }}>
                  {da ? "✓" : s.weich ? "·" : "○"}
                </span>
                <span style={{ fontSize: 14, color: da ? C.tinte : C.grau, fontWeight: da ? 500 : 300 }}>
                  {s.name}{s.weich && !da ? " (freiwillig)" : ""}
                </span>
              </div>
            );
          })}
          {bericht.lob.map((l, i) => (
            <p key={i} style={{ fontSize: 13.5, color: C.gruenDunkel, fontWeight: 500, lineHeight: 1.7, marginTop: 10 }}>{l}</p>
          ))}
          {bericht.fehler.length > 0 && (
            <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginTop: 14 }}>
              {bericht.fehler.map((f, i) => (
                <p key={i} style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75, marginBottom: 6 }}>{f}</p>
              ))}
            </div>
          )}
          {!bericht.vollstaendig && bericht.fehler.length === 0 && (
            <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.75, marginTop: 14 }}>
              Was du geschrieben hast, stimmt. Es fehlen noch Schritte — ohne sie wäre der Weg in einer Klausur
              unvollständig, selbst wenn das Ergebnis am Ende richtig ist.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Aufgabe abfotografieren ---------- */

FR.parabelErzeugen = parabelErzeugen;
FR.quadratMitNullstellen = quadratMitNullstellen;
FR.tangenteErzeugen = tangenteErzeugen;
