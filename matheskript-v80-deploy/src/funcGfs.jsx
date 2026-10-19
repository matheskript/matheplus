import React, { useState, useRef, useEffect } from "react";
import { C, PASCAL_VIDEO_ID } from "./base1.jsx";
import { ErklaerVideo } from "./func1.jsx";
import { M, Text } from "./func3.jsx";
import {
  binom, zeile, ARTEN, aufgabe, aufgabeTex, pruefe, rechenweg, tipp,
  GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "./gfsPascal.js";

/* ============================================================
   GFS-Trainer
   Übersicht aller GFS-Themen (Lambacher Schweizer, Baden-Württemberg)
   und je Thema eine Seite nach dem Muster der Themenseiten:
   Leitfrage · Video · Herleitung · Visualisierung · Übung,
   dazu der GFS-Teil: roter Faden für den Vortrag und Kolloquium-Training.
   ============================================================ */

export const GFS_THEMEN = [
  { ansicht: "gfs-pascal", titel: "Pascal’sches Dreieck und Binomialkoeffizienten", kapitel: "Kapitel V · Binomialverteilung",
    stufe: "Kursstufe", text: "Warum im Zahlendreieck genau die Binomialkoeffizienten stehen – mit Beweis, Mustern und Anwendungen." },
];

const FLIESS = { color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 16 };
const KARTE = { background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };

/* ---------- Kleine Bausteine ---------- */

/* Formelzeilen, gemeinsam so verkleinert, dass die längste Zeile in die Breite passt */
function Formeln({ titel, zeilen, max = 17, min = 10.5, farbe = C.tinte }) {
  const rahmen = useRef(null), innen = useRef(null);
  const [gr, setGr] = useState(max);
  useEffect(() => {
    const anpassen = () => {
      if (!rahmen.current || !innen.current) return;
      const breite = innen.current.scrollWidth * (max / parseFloat(getComputedStyle(innen.current).fontSize));
      setGr(Math.max(min, Math.min(max, Math.floor((max * (rahmen.current.clientWidth - 4) / breite) * 10) / 10)));
    };
    anpassen();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(anpassen) : null;
    if (ro && rahmen.current) ro.observe(rahmen.current);
    return () => { if (ro) ro.disconnect(); };
  });
  return (
    <div style={{ margin: "14px 0 18px" }}>
      {titel && <p style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8, letterSpacing: "0.01em" }}>{titel}</p>}
      <div ref={rahmen} style={{ overflowX: "auto", overflowY: "hidden" }}>
        <div ref={innen} style={{ width: "max-content", fontSize: gr, color: farbe, paddingLeft: 4 }}>
          {zeilen.map((z, i) => (
            <div key={i} style={{ lineHeight: 2.4, whiteSpace: "nowrap" }}><M t={z} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Schritt({ nr, titel }) {
  return (
    <div className="flex items-center" style={{ gap: 12, margin: "30px 0 12px" }}>
      <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 999, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`,
        color: C.flaggold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800 }}>{nr}</span>
      <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, color: C.tinte }}>{titel}</h3>
    </div>
  );
}

function Kasten({ titel, children }) {
  return (
    <div style={{ background: C.weiss, borderLeft: `4px solid ${C.flaggold}`, borderRadius: 12, padding: "12px 16px 4px", margin: "6px 0 18px",
      boxShadow: "0 2px 12px rgba(15,26,51,0.05)" }}>
      <p style={{ fontSize: 12.5, fontWeight: 700, color: "#A67C00", letterSpacing: "0.02em", textTransform: "uppercase" }}>{titel}</p>
      {children}
    </div>
  );
}

function Chip({ aktiv, onClick, children }) {
  return (
    <button onClick={onClick} className="px-4 py-2"
      style={{ background: aktiv ? C.see : C.weiss, color: aktiv ? C.weiss : C.grau, border: `1px solid ${aktiv ? C.see : C.linie}`,
        borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
      {children}
    </button>
  );
}

function PlusMinus({ setzen, label }) {
  const knopf = (zeichen, delta) => (
    <button onClick={() => setzen(delta)} aria-label={`${label} ${delta > 0 ? "erhöhen" : "verringern"}`}
      style={{ width: 30, height: 24, borderRadius: 8, border: "none", background: delta > 0 ? C.see : C.seeTief, color: C.weiss,
        fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1 }}>{zeichen}</button>
  );
  return <div className="flex flex-col" style={{ gap: 4 }}>{knopf("+", 1)}{knopf("−", -1)}</div>;
}

const Kicker = ({ children }) => <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>{children}</p>;
const H3 = ({ children }) => <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 14 }}>{children}</h3>;
const Trenner = () => <div style={{ height: 1, background: C.linie, margin: "30px 0 26px" }} />;

/* ---------- Übersicht ---------- */

export function GfsUebersicht({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12 }}>
        Deine GFS in Mathe
      </h2>
      <p style={FLIESS}>
        Zu fast jedem Kapitel im Lambacher Schweizer gibt es ein GFS-Thema. Hier findest du zu jedem Thema alles,
        was du für eine starke GFS brauchst: die Herleitung, ein Bild zum Ausprobieren, Übungsaufgaben,
        einen roten Faden für den Vortrag und ein Training für die Fragen im Kolloquium.
      </p>
      <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 22 }}>
        {["Verstehen", "Üben", "Vortragen", "Fragen beantworten"].map((t) => (
          <span key={t} style={{ fontSize: 12.5, fontWeight: 600, color: C.see, background: C.himmel, borderRadius: 999, padding: "5px 12px" }}>{t}</span>
        ))}
      </div>
      {GFS_THEMEN.map((t) => (
        <button key={t.ansicht} onClick={() => gehe({ ansicht: t.ansicht })} className="w-full px-5 py-5 mb-3"
          style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, textAlign: "left", cursor: "pointer",
            fontFamily: "inherit", color: C.tinte, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.gruenDunkel, letterSpacing: "0.02em", marginBottom: 6 }}>{t.stufe} · {t.kapitel}</p>
          <p style={{ fontSize: 17.5, fontWeight: 600, lineHeight: 1.3, marginBottom: 6 }}>{t.titel}</p>
          <p style={{ color: C.grau, fontSize: 13.5, fontWeight: 300, lineHeight: 1.6 }}>{t.text}</p>
        </button>
      ))}
      <p style={{ color: C.hellgrau, fontSize: 13, fontWeight: 300, marginTop: 12, textAlign: "center" }}>Weitere Themen folgen Kapitel für Kapitel.</p>
    </div>
  );
}

/* ---------- Visualisierung: das Dreieck zum Antippen ---------- */

const MUSTER = [
  { id: "summe", name: "Summenregel" },
  { id: "symmetrie", name: "Symmetrie" },
  { id: "dreieck", name: "Dreieckszahlen" },
  { id: "zeilensumme", name: "Zeilensumme" },
  { id: "ungerade", name: "Ungerade Zahlen" },
];

function VisDreieck() {
  const [nMax, setNMax] = useState(6);
  const [ansicht, setAnsicht] = useState("zahlen");
  const [muster, setMuster] = useState("summe");
  const [wahl, setWahl] = useState({ n: 5, k: 3 });
  const n = Math.min(wahl.n, nMax), k = Math.min(wahl.k, n);

  const zeilenSetzen = (d) => setNMax((v) => Math.max(2, Math.min(15, v + d)));
  const musterSetzen = (m) => {
    setMuster(m);
    if (m === "dreieck") setWahl({ n: Math.min(nMax, Math.max(2, n)), k: 2 });
    if (m === "ungerade") setNMax((v) => Math.max(v, 15));
  };

  const W = 340, cw = W / (nMax + 1), ch = cw * 0.86, H = (nMax + 1) * ch + 4;
  const x = (r, s) => (W - (r + 1) * cw) / 2 + s * cw + cw / 2;
  const y = (r) => r * ch + ch / 2 + 2;

  const rolle = (r, s) => {
    const w = binom(r, s);
    if (muster === "ungerade") return w % 2 === 1 ? "gold" : "blass";
    if (muster === "summe") {
      if (r === n && s === k) return "gold";
      if (n >= 1 && k >= 1 && k <= n - 1 && r === n - 1 && (s === k - 1 || s === k)) return "blau";
      return "normal";
    }
    if (muster === "symmetrie") {
      if (r === n && (s === k || s === n - k)) return "gold";
      if (r === n) return "hell";
      return "normal";
    }
    if (muster === "dreieck") {
      if (r === n && s === 2) return "gold";
      if (s === 2 && r >= 2) return "blau";
      if (s === 1 && r >= 1 && r < n) return "hell";
      return "normal";
    }
    if (muster === "zeilensumme") return r === n ? "gold" : "normal";
    return "normal";
  };
  const STIL = {
    gold: { fill: `url(#gfsGold)`, stroke: "#B8860B", text: C.tinte, fw: 700 },
    blau: { fill: C.see, stroke: C.see, text: C.weiss, fw: 700 },
    hell: { fill: C.himmel, stroke: C.seeHell, text: C.see, fw: 600 },
    blass: { fill: C.sand, stroke: C.linie, text: C.hellgrau, fw: 400 },
    normal: { fill: C.weiss, stroke: C.linie, text: C.tinte, fw: 500 },
  };

  const zellen = [];
  for (let r = 0; r <= nMax; r++) for (let s = 0; s <= r; s++) {
    const st = STIL[rolle(r, s)];
    const w = binom(r, s), ziffern = String(w).length;
    const fs = Math.min(cw * 0.42, (cw - 5) / (ziffern * 0.62));
    zellen.push(
      <g key={`${r}-${s}`} onClick={() => setWahl({ n: r, k: muster === "dreieck" ? 2 : s })} style={{ cursor: "pointer" }}>
        <rect x={x(r, s) - cw / 2 + 1.2} y={y(r) - ch / 2 + 1.2} width={cw - 2.4} height={ch - 2.4} rx={Math.min(8, cw * 0.22)}
          fill={st.fill} stroke={st.stroke} strokeWidth="1" />
        {ansicht === "zahlen" || muster === "ungerade" ? (
          <text x={x(r, s)} y={y(r) + fs * 0.36} textAnchor="middle" fontSize={fs} fontWeight={st.fw} fill={st.text}
            style={{ fontFamily: "Montserrat, sans-serif", fontVariantNumeric: "tabular-nums" }}>{w}</text>
        ) : (
          <BinomSvg cx={x(r, s)} cy={y(r)} n={r} k={s} cw={cw} farbe={st.text} fw={st.fw} />
        )}
      </g>
    );
  }

  /* Text unter dem Dreieck */
  let erklaerung;
  if (muster === "summe") {
    erklaerung = k === 0 || k === n
      ? { satz: "Am Rand steht immer eine 1 – das gilt für das Dreieck und für die Formel.", zeilen: [`\\binom{${n}}{${k}} = \\frac{${n}!}{${k}! \\cdot ${n - k}!} = 1`] }
      : { satz: "Die blau markierten Zahlen ergeben zusammen die goldene:", zeilen: [
          `\\binom{${n}}{${k}} = \\binom{${n - 1}}{${k - 1}} + \\binom{${n - 1}}{${k}}`,
          `${binom(n, k)} = ${binom(n - 1, k - 1)} + ${binom(n - 1, k)}`,
        ] };
  } else if (muster === "symmetrie") {
    erklaerung = { satz: k === n - k ? "Die Mitte ist ihr eigenes Spiegelbild." : "Die Zeile ist ein Palindrom – links und rechts stehen dieselben Zahlen:",
      zeilen: [`\\binom{${n}}{${k}} = \\binom{${n}}{${n - k}} = ${binom(n, k)}`] };
  } else if (muster === "dreieck") {
    const glieder = Array.from({ length: n - 1 }, (_, i) => i + 1);
    erklaerung = { satz: "In der dritten Diagonale stehen die Dreieckszahlen: Es kommt jedes Mal die nächste natürliche Zahl dazu.",
      zeilen: n < 2 ? ["\\binom{2}{2} = 1"] : [`\\binom{${n}}{2} = ${glieder.length > 6 ? `1 + 2 + \\ldots + ${n - 1}` : glieder.join(" + ")} = ${binom(n, 2)}`] };
  } else if (muster === "zeilensumme") {
    const z = zeile(n);
    erklaerung = { satz: `Die Summe der Zeile ${n} ist die Anzahl aller Treffer-Nieten-Ketten der Länge ${n}:`,
      zeilen: [`${z.length > 7 ? `${z.slice(0, 3).join(" + ")} + \\ldots + ${z.slice(-2).join(" + ")}` : z.join(" + ")} = ${2 ** n} = 2^{${n}}`] };
  } else {
    erklaerung = { satz: "Nur die ungeraden Zahlen sind golden – es entsteht das Sierpinski-Dreieck: Dreiecke aus Dreiecken aus Dreiecken.", zeilen: [] };
  }

  return (
    <div>
      <div className="flex items-center" style={{ gap: 14, marginBottom: 12 }}>
        <PlusMinus setzen={zeilenSetzen} label="Zeilen" />
        <div style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.4 }}>
          Zeilen<br /><span style={{ fontSize: 18, fontWeight: 700, color: C.see }}>0 bis {nMax}</span>
        </div>
        <div className="flex" style={{ marginLeft: "auto", gap: 6 }}>
          {[["zahlen", "123"], ["binom", "(n k)"]].map(([id, t]) => (
            <button key={id} onClick={() => setAnsicht(id)} aria-label={id === "zahlen" ? "Zahlen zeigen" : "Binomialkoeffizienten zeigen"}
              style={{ padding: "6px 10px", borderRadius: 10, border: `1px solid ${ansicht === id ? C.see : C.linie}`, background: ansicht === id ? C.see : C.weiss,
                color: ansicht === id ? C.weiss : C.grau, fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>{t}</button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 14 }}>
        {MUSTER.map((m) => (
          <button key={m.id} onClick={() => musterSetzen(m.id)}
            style={{ padding: "6px 11px", borderRadius: 999, border: `1px solid ${muster === m.id ? C.flaggold : C.linie}`,
              background: muster === m.id ? "#FFF6D6" : C.weiss, color: muster === m.id ? C.tinte : C.grau, fontSize: 12.5,
              fontWeight: muster === m.id ? 600 : 400, fontFamily: "inherit", cursor: "pointer" }}>{m.name}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }} role="img" aria-label={`Pascal’sches Dreieck, Zeilen 0 bis ${nMax}`}>
        <defs>
          <linearGradient id="gfsGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE58A" /><stop offset="100%" stopColor={C.flaggold} />
          </linearGradient>
        </defs>
        {zellen}
      </svg>

      <div style={{ marginTop: 14 }}>
        <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.65 }}>
          {muster !== "ungerade" && muster !== "dreieck" && <span style={{ fontWeight: 600, color: C.see }}>Zeile {n}{muster === "zeilensumme" ? "" : `, Stelle ${k}`} · </span>}
          {erklaerung.satz}
        </p>
        {erklaerung.zeilen.length > 0 && <Formeln zeilen={erklaerung.zeilen} max={17} />}
      </div>
    </div>
  );
}

/* Binomialkoeffizient als kleine SVG-Gruppe: n über k in runden Klammern */
function BinomSvg({ cx, cy, n, k, cw, farbe, fw }) {
  const fs = Math.min(cw * 0.3, (cw - 10) / (Math.max(String(n).length, String(k).length) * 0.62));
  const hh = fs * 1.05, b = Math.max(String(n).length, String(k).length) * fs * 0.32 + fs * 0.32;
  return (
    <g fill={farbe} style={{ fontFamily: "Montserrat, sans-serif" }}>
      <text x={cx} y={cy - hh * 0.12} textAnchor="middle" fontSize={fs} fontWeight={fw}>{n}</text>
      <text x={cx} y={cy + hh * 0.86} textAnchor="middle" fontSize={fs} fontWeight={fw}>{k}</text>
      <path d={`M ${cx - b} ${cy - hh} Q ${cx - b - fs * 0.45} ${cy} ${cx - b} ${cy + hh}`} stroke={farbe} strokeWidth={Math.max(0.6, fs * 0.08)} fill="none" />
      <path d={`M ${cx + b} ${cy - hh} Q ${cx + b + fs * 0.45} ${cy} ${cx + b} ${cy + hh}`} stroke={farbe} strokeWidth={Math.max(0.6, fs * 0.08)} fill="none" />
    </g>
  );
}

/* ---------- Übung ---------- */

function PascalTrainer() {
  const [art, setArt] = useState("berechnen");
  const [stufe, setStufe] = useState(2);
  const [auf, setAuf] = useState(() => aufgabe("berechnen", 2));
  const [eingabe, setEingabe] = useState("");
  const [nk, setNk] = useState({ n: "", k: "" });
  const [stand, setStand] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });

  const neu = (a = art, s = stufe) => { setAuf(aufgabe(a, s)); setEingabe(""); setNk({ n: "", k: "" }); setStand(null); setZeigen(false); };
  const stufeSetzen = (s) => { const v = Math.max(1, Math.min(5, s)); setStufe(v); neu(art, v); };
  const artSetzen = (a) => { setArt(a); neu(a, stufe); };

  const leer = auf.art === "rueckwaerts" ? !nk.n.trim() || !nk.k.trim() : !eingabe.trim();
  const pruefen = () => {
    const e = pruefe(auf, auf.art === "rueckwaerts" ? nk : eingabe);
    setStand(e);
    if (e === "ok" || e === "nein") setSerie((s) => ({ n: s.n + 1, ok: s.ok + (e === "ok" ? 1 : 0) }));
  };

  const feld = (wert, setzen, platz, breite) => (
    <input value={wert} onChange={(ev) => { setzen(ev.target.value); setStand(null); }} onKeyDown={(ev) => { if (ev.key === "Enter" && !leer) pruefen(); }}
      inputMode="numeric" placeholder={platz} aria-label={platz}
      style={{ width: breite, boxSizing: "border-box", padding: "10px 12px", fontSize: 17, fontFamily: "inherit", textAlign: "center",
        border: `1.5px solid ${stand === "ok" ? C.see : stand && stand !== "ok" ? C.signal : C.linie}`, borderRadius: 12, outline: "none",
        background: stand === "ok" ? C.himmel : C.weiss, color: C.tinte }} />
  );

  const AUFTRAG = {
    berechnen: "Berechne den Binomialkoeffizienten – mit der Formel oder aus dem Dreieck.",
    rueckwaerts: "Schreibe die Zahl als Binomialkoeffizienten. Nicht am Rand und nicht in der zweiten Diagonale: 2 ≤ k ≤ n − 2.",
    binomisch: "Bestimme den Koeffizienten beim Ausmultiplizieren.",
  };

  return (
    <div>
      <p style={{ ...FLIESS, lineHeight: 1.7, marginBottom: 18 }}>
        Drei Aufgabenarten wie im Buch: Binomialkoeffizienten berechnen, eine Zahl im Dreieck wiederfinden
        und Koeffizienten der binomischen Formel bestimmen.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ARTEN.map((a) => <Chip key={a.id} aktiv={art === a.id} onClick={() => artSetzen(a.id)}>{a.name}</Chip>)}
      </div>
      <div className="flex items-center flex-wrap" style={{ gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 13.5, color: C.grau, fontWeight: 300 }}>Schwierigkeit</span>
        <PlusMinus setzen={(d) => stufeSetzen(stufe + d)} label="Schwierigkeit" />
        <div className="flex" style={{ gap: 4 }}>
          {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ width: 9, height: 9, borderRadius: 999, background: s <= stufe ? C.see : C.linie, display: "inline-block" }} />)}
        </div>
        <span style={{ fontSize: 13.5, color: C.gruenDunkel, fontWeight: 600 }}>{stufe} / 5</span>
      </div>

      <div style={KARTE}>
        <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginBottom: 4 }}>{AUFTRAG[auf.art]}</p>
        <Formeln zeilen={[aufgabeTex(auf)]} max={22} />

        {auf.art === "rueckwaerts" ? (
          <div className="flex items-center" style={{ gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 500 }}>n =</span>{feld(nk.n, (v) => setNk((s) => ({ ...s, n: v })), "n", 78)}
            <span style={{ fontSize: 16, fontWeight: 500, marginLeft: 6 }}>k =</span>{feld(nk.k, (v) => setNk((s) => ({ ...s, k: v })), "k", 78)}
          </div>
        ) : (
          <div style={{ marginBottom: 12 }}>{feld(eingabe, setEingabe, "Ergebnis", "100%")}</div>
        )}

        {stand === "ok" && (
          <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.see, marginBottom: 2 }}>Stimmt!</p>
            <Formeln zeilen={rechenweg(auf)} max={15} farbe={C.see} />
          </div>
        )}
        {stand && stand !== "ok" && (
          <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>
              {stand === "rand" ? "Fast – aber das liegt am Rand." : "Stimmt noch nicht."}
            </p>
            <p style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>
              {stand === "unlesbar" ? "Bitte nur ganze Zahlen eingeben."
                : stand === "rand" ? "Gesucht ist eine Stelle mit 2 ≤ k ≤ n − 2. Die Darstellungen mit k = 1 oder k = n − 1 funktionieren für jede Zahl."
                : tipp(auf)}
            </p>
            {!zeigen && stand !== "unlesbar" && (
              <button onClick={() => setZeigen(true)} className="mt-3"
                style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                Rechenweg zeigen
              </button>
            )}
            {zeigen && <Formeln zeilen={rechenweg(auf)} max={15} farbe={C.see} />}
          </div>
        )}
        {stand !== "ok" && (
          <button onClick={pruefen} disabled={leer} className="px-6 py-3"
            style={{ background: leer ? C.hellgrau : C.see, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: leer ? "default" : "pointer" }}>
            Prüfen
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        <button onClick={() => neu()} className="px-6 py-3"
          style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Nächste Aufgabe
        </button>
        {serie.n > 0 && <span className="flex items-center" style={{ fontSize: 13, color: C.grau }}>{serie.ok} von {serie.n} richtig</span>}
      </div>
    </div>
  );
}

/* ---------- GFS-Teil: roter Faden ---------- */

function RoterFaden() {
  const summe = GLIEDERUNG.reduce((s, g) => s + g.min, 0);
  return (
    <div>
      <p style={{ ...FLIESS, marginBottom: 18 }}>
        Rund {summe} Minuten Vortrag in fünf Abschnitten. Die Minuten sind ein Richtwert – frag deine Lehrkraft,
        wie lang die GFS sein soll, und strecke oder kürze vor allem den Abschnitt mit den Mustern.
      </p>
      <div style={{ position: "relative", paddingLeft: 30 }}>
        <div style={{ position: "absolute", left: 11, top: 8, bottom: 8, width: 2, background: C.linie, borderRadius: 2 }} />
        {GLIEDERUNG.map((g, i) => (
          <div key={g.titel} style={{ position: "relative", marginBottom: 14 }}>
            <span style={{ position: "absolute", left: -30, top: 14, width: 24, height: 24, borderRadius: 999, background: C.seeTief, color: C.flaggold,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{i + 1}</span>
            <div style={{ ...KARTE, padding: "14px 16px" }}>
              <div className="flex items-baseline" style={{ gap: 10, marginBottom: 4 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte }}>{g.titel}</p>
                <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: C.see, whiteSpace: "nowrap" }}>{g.min} min</span>
              </div>
              <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.65 }}>{g.text}</p>
            </div>
          </div>
        ))}
      </div>
      <Kasten titel="Drei Tipps für den Vortrag">
        <ul style={{ margin: "8px 0 10px", paddingLeft: 18, listStyle: "disc" }}>
          {TIPPS.map((t) => <li key={t} style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.7, marginBottom: 6 }}>{t}</li>)}
        </ul>
      </Kasten>
    </div>
  );
}

/* ---------- GFS-Teil: Kolloquium-Training ---------- */

const SPEICHER = "mm-gfs-pascal-kolloquium";
const lesen = () => { try { return JSON.parse(localStorage.getItem(SPEICHER) || "[]"); } catch (e) { return []; } };
const schreiben = (l) => { try { localStorage.setItem(SPEICHER, JSON.stringify(l)); } catch (e) { /* ohne Speicher geht es auch */ } };

function Kolloquium() {
  const [gekonnt, setGekonnt] = useState(() => new Set(lesen()));
  const [idx, setIdx] = useState(0);
  const [offen, setOffen] = useState(false);
  const [alle, setAlle] = useState(false);
  const f = KOLLOQUIUM[idx];

  const merken = (ok) => {
    const s = new Set(gekonnt);
    if (ok) s.add(idx); else s.delete(idx);
    setGekonnt(s); schreiben([...s]);
    /* nächste Frage, die noch nicht sitzt */
    const rest = KOLLOQUIUM.map((_, i) => i).filter((i) => !s.has(i) && i !== idx);
    setIdx(rest.length ? rest[Math.floor(Math.random() * rest.length)] : (idx + 1) % KOLLOQUIUM.length);
    setOffen(false);
  };
  const zuruecksetzen = () => { setGekonnt(new Set()); schreiben([]); setIdx(0); setOffen(false); };

  const anteil = gekonnt.size / KOLLOQUIUM.length;
  const stufenFarbe = { Basis: C.see, Vertiefung: C.gruenDunkel, Profi: C.signal };

  return (
    <div>
      <p style={{ ...FLIESS, marginBottom: 16 }}>
        Nach dem Vortrag kommen Fragen. Lies die Frage, antworte laut in zwei, drei Sätzen – erst dann aufdecken
        und ehrlich einschätzen. Was noch nicht sitzt, kommt wieder.
      </p>

      <div className="flex items-center" style={{ gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 8, background: C.linie, borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${anteil * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, transition: "width .3s" }} />
        </div>
        <span style={{ fontSize: 13, color: C.grau, whiteSpace: "nowrap" }}>{gekonnt.size} von {KOLLOQUIUM.length} sitzen</span>
      </div>

      <div style={{ ...KARTE, background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss }}>
        <div className="flex items-center" style={{ gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: C.flaggold }}>Frage {idx + 1} · {f.stufe}</span>
          {gekonnt.has(idx) && <span style={{ marginLeft: "auto", fontSize: 12, color: C.goldText }}>sitzt schon</span>}
        </div>
        <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.4, marginBottom: 16 }}>{f.frage}</p>
        {offen ? (
          <>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", color: C.flaggold, marginBottom: 6 }}>SO KANNST DU ANTWORTEN</p>
              <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.75, color: "#E6ECF8" }}>{f.antwort}</p>
            </div>
            <div className="flex flex-wrap" style={{ gap: 10 }}>
              <button onClick={() => merken(true)} className="px-5 py-3"
                style={{ background: C.flaggold, color: C.tinte, border: "none", borderRadius: 999, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                Konnte ich
              </button>
              <button onClick={() => merken(false)} className="px-5 py-3"
                style={{ background: "transparent", color: C.weiss, border: "1px solid rgba(255,255,255,0.45)", borderRadius: 999, fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                Noch nicht
              </button>
            </div>
          </>
        ) : (
          <button onClick={() => setOffen(true)} className="px-5 py-3"
            style={{ background: C.weiss, color: C.see, border: "none", borderRadius: 999, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
            Antwort aufdecken
          </button>
        )}
      </div>

      <div className="flex flex-wrap" style={{ gap: 16, marginTop: 14 }}>
        <button onClick={() => setAlle(!alle)}
          style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
          {alle ? "Liste schließen" : "Alle Fragen auf einen Blick"}
        </button>
        {gekonnt.size > 0 && (
          <button onClick={zuruecksetzen}
            style={{ background: "none", border: "none", color: C.grau, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
            Von vorn beginnen
          </button>
        )}
      </div>

      {alle && (
        <div style={{ marginTop: 14 }}>
          {KOLLOQUIUM.map((q, i) => (
            <button key={q.frage} onClick={() => { setIdx(i); setOffen(false); }} className="w-full"
              style={{ display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left", background: i === idx ? C.himmel : C.weiss,
                border: `1px solid ${C.linie}`, borderRadius: 12, padding: "10px 12px", marginBottom: 6, fontFamily: "inherit", cursor: "pointer", color: C.tinte }}>
              <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: 999, marginTop: 7, background: gekonnt.has(i) ? C.flaggold : C.linie }} />
              <span style={{ flex: 1, fontSize: 14, lineHeight: 1.5 }}>{q.frage}</span>
              <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: stufenFarbe[q.stufe], marginTop: 3 }}>{q.stufe}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Die Seite ---------- */

export function GfsPascalSeite({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      {gehe && (
        <button onClick={() => gehe({ ansicht: "gfs" })} className="mb-5"
          style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
          ← Alle GFS-Themen
        </button>
      )}
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Warum stehen im Pascal’schen Dreieck genau die Binomialkoeffizienten?
      </h2>

      <ErklaerVideo id={PASCAL_VIDEO_ID} titel="Pascal’sches Dreieck und Binomialkoeffizienten" />

      <div style={{ marginTop: 20 }}>
        <Text s="Zwei völlig verschiedene Bauanleitungen liefern dieselben Zahlen. Das Pascal’sche Dreieck entsteht durch
          Addieren: Jede Zeile beginnt und endet mit einer 1, und jede Zahl dazwischen ist die Summe der beiden Zahlen
          schräg darüber. Zeilen und Stellen zählt man dabei ab 0." style={FLIESS} />
        <Text s="Der Binomialkoeffizient $\binom{n}{k}$ dagegen zählt: Er gibt an, auf wie viele Arten man aus $n$ Plätzen genau
          $k$ auswählen kann – zum Beispiel die Plätze der Treffer in einer Kette aus $n$ Versuchen. Berechnet wird er mit
          Fakultäten:" style={FLIESS} />
        <Formeln zeilen={["\\binom{n}{k} = \\frac{n!}{k! \\cdot (n-k)!} \\qquad (0 \\le k \\le n)"]} max={19} />
        <Text s="Dass in Zeile $n$ an Stelle $k$ genau $\binom{n}{k}$ steht, ist kein Zufall. Wir zeigen: Beide Dreiecke haben
          denselben Rand und gehorchen derselben Additionsregel – dann müssen sie übereinstimmen." style={FLIESS} />

        <Schritt nr="1" titel="Gleicher Rand" />
        <Text s="Man legt $0! = 1$ fest. Dann gilt für jede Zeile $n$:" style={FLIESS} />
        <Formeln zeilen={[
          "\\binom{n}{0} = \\frac{n!}{0! \\cdot n!} = 1 \\qquad \\binom{n}{n} = \\frac{n!}{n! \\cdot 0!} = 1",
        ]} />
        <Text s="Ganz oben steht $\binom{0}{0} = 1$, und jede Zeile beginnt und endet mit 1 – genau wie im Zahlendreieck." style={FLIESS} />

        <Schritt nr="2" titel="Erst ein Beispiel" />
        <Text s="Im Zahlendreieck ist die 10 in Zeile 5 die Summe von 6 und 4 aus Zeile 4. Gilt das auch für die
          Binomialkoeffizienten, also $\binom{5}{3} = \binom{4}{2} + \binom{4}{3}$? Wir bringen beide Brüche auf den Nenner $3! \cdot 2!$:" style={FLIESS} />
        <Formeln zeilen={[
          "\\binom{4}{2} + \\binom{4}{3} = \\frac{4!}{2! \\cdot 2!} + \\frac{4!}{3! \\cdot 1!}",
          "= \\frac{4! \\cdot 3}{3! \\cdot 2!} + \\frac{4! \\cdot 2}{3! \\cdot 2!} = \\frac{4! \\cdot 5}{3! \\cdot 2!}",
          "= \\frac{5!}{3! \\cdot 2!} = \\binom{5}{3}",
        ]} />

        <Schritt nr="3" titel="Die Pascal-Regel allgemein" />
        <Text s="Jetzt dasselbe mit Buchstaben, für $n \ge 2$ und $1 \le k \le n - 1$. Den ersten Bruch erweitern wir mit $k$,
          denn $k \cdot (k-1)! = k!$. Den zweiten erweitern wir mit $n - k$, denn $(n-k) \cdot (n-k-1)! = (n-k)!$:" style={FLIESS} />
        <Formeln zeilen={[
          "\\binom{n-1}{k-1} + \\binom{n-1}{k} = \\frac{(n-1)!}{(k-1)! \\cdot (n-k)!} + \\frac{(n-1)!}{k! \\cdot (n-k-1)!}",
          "= \\frac{(n-1)! \\cdot k}{k! \\cdot (n-k)!} + \\frac{(n-1)! \\cdot (n-k)}{k! \\cdot (n-k)!}",
          "= \\frac{(n-1)! \\cdot (k + n - k)}{k! \\cdot (n-k)!} = \\frac{(n-1)! \\cdot n}{k! \\cdot (n-k)!}",
          "= \\frac{n!}{k! \\cdot (n-k)!} = \\binom{n}{k}",
        ]} />
        <Kasten titel="Pascal-Regel">
          <Formeln zeilen={["\\binom{n}{k} = \\binom{n-1}{k-1} + \\binom{n-1}{k} \\qquad (1 \\le k \\le n-1)"]} max={18} />
        </Kasten>
        <Text s="Warum die Einschränkung $1 \le k \le n - 1$? Für $k = 0$ oder $k = n$ käme rechts ein Binomialkoeffizient vor,
          der gar nicht definiert ist. Die Ränder haben wir aber schon in Schritt 1 erledigt." style={FLIESS} />

        <Schritt nr="4" titel="Zeile für Zeile" />
        <Text s="Zeile 0 stimmt überein. Stimmt eine Zeile überein, dann auch die nächste: Ihre Ränder sind in beiden Dreiecken 1,
          und jede innere Zahl entsteht in beiden Dreiecken auf dieselbe Weise aus denselben zwei Zahlen darüber.
          Das ist vollständige Induktion über die Zeilen." style={FLIESS} />
        <Kasten titel="Ergebnis">
          <Text s="Im Pascal’schen Dreieck steht in Zeile $n$ an Stelle $k$ der Binomialkoeffizient $\binom{n}{k}$."
            style={{ fontSize: 15, color: C.tinte, fontWeight: 500, lineHeight: 1.8, margin: "8px 0 10px" }} />
        </Kasten>

        <Schritt nr="5" titel="Bonus: Beweis ohne Bruchrechnung" />
        <Text s="Für die GFS lohnt sich ein zweiter, eleganter Blick. Aus $n$ Personen sollen $k$ ausgewählt werden, und eine davon
          heißt Anna. Entweder Anna ist dabei – dann fehlen noch $k - 1$ aus den übrigen $n - 1$. Oder Anna ist nicht dabei –
          dann kommen alle $k$ aus den übrigen $n - 1$. Beide Fälle zusammen ergeben genau die Pascal-Regel, ganz ohne Fakultäten." style={FLIESS} />
      </div>

      <div style={{ ...KARTE, margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Tippe auf eine Zahl und wähle ein Muster</p>
        <VisDreieck />
      </div>

      <Trenner />

      <Kicker>Jetzt selbst üben</Kicker>
      <H3>Binomialkoeffizienten berechnen, wiederfinden und anwenden</H3>
      <PascalTrainer />

      <Trenner />

      <Kicker>Deine GFS</Kicker>
      <H3>Der rote Faden für den Vortrag</H3>
      <RoterFaden />

      <div style={{ height: 8 }} />
      <Kicker>Kolloquium</Kicker>
      <H3>Die Fragen nach dem Vortrag trainieren</H3>
      <Kolloquium />
    </div>
  );
}
