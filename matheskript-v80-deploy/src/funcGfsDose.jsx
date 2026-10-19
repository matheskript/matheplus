import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M, Text } from "./func3.jsx";
import { FLIESS, KARTE, ZELLE, Formeln, Schritt, Kasten, Chip, PlusMinus, Kicker, H3, Trenner, Inline, RoterFaden, Kolloquium } from "./funcGfsBausteine.jsx";
import { DoseAnimation } from "./funcGfsDoseAnimationen.jsx";
import {
  dk, optimaleDose, oberflaeche, hoeheAus, mehrverbrauch,
  ARTEN, aufgabe, aufgabeTex, pruefe, rechenweg, tipp,
  BUCH_ARTEN, buchAufgabe, buchAuftrag, buchFelder, buchPruefe, buchRechenweg, buchTipp, buchHinweis,
  BEGRUENDUNGEN, gemischt, ADAPTION, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "./gfsDose.js";

/* ============================================================
   Kurs GFS – Themenseite „Die optimale Dose“
   (Lambacher Schweizer Kursstufe, Kapitel I; G8 Klasse 11, G9 Klasse 12)
   Aufbau wie die Pascal-Seite: Leitfrage · Herleitung in fünf Schritten mit
   sechs Erkläranimationen · Dosen-Labor · Übung (Grundtypen) · Übungen zu
   den Aufgaben der GFS-Seite (Adaptionen) · Begründen · roter Faden · Kolloquium.
   Logik in gfsDose.js, Animationen in funcGfsDoseAnimationen.jsx.
   ============================================================ */

const KNOPF = (aktiv = true, farbe = C.see) => ({
  background: aktiv ? farbe : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600,
  fontFamily: "inherit", cursor: aktiv ? "pointer" : "default",
});
/* aktuelle Aufgabe für automatische Prüfungen (tests/ui/gfsdose.ui.py) */
const merk = (a, k = "__gdAufgabe") => { if (typeof window !== "undefined") window[k] = a; return a; };
const LINK = { background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" };

/* Eingabefeld „r = [   ] cm“ */
function Feld({ k, label, einheit, wert, setzen, stand, onEnter, breite = 92 }) {
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

/* ---------- Dosen-Labor ---------- */
const VOLUMEN_LABOR = [150, 330, 500, 1000];
function DosenLabor() {
  const [V, setV] = useState(330);
  const [r, setR] = useState(2.6);
  const opt = optimaleDose(V);
  const h = hoeheAus(r, V), O = oberflaeche(r, V), mehr = mehrverbrauch(r, V);
  const rMax = 9;
  const S = Math.min(10, 120 / Math.max(opt.h, 4));   // Maßstab so, dass die optimale Dose gut ins Bild passt
  const cx = 70, cy = 150;
  const hB = Math.min(135, h * S), rB = Math.max(2, r * S);
  /* kleiner Graph */
  const GX = 150, GY = 150, GW = 190, GH = 120, OMAX = opt.O * 2.6;
  const gx = (x) => GX + (x / rMax) * GW, gy = (o) => GY - Math.min(OMAX, o) / OMAX * GH;
  const pts = [];
  for (let x = 0.6; x <= rMax; x += 0.1) pts.push(`${gx(x).toFixed(1)},${gy(oberflaeche(x, V)).toFixed(1)}`);
  const istOptimal = Math.abs(r - opt.r) < 0.03;
  return (
    <div>
      <div className="flex flex-wrap items-center" style={{ gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: C.grau, marginRight: 4 }}>Inhalt</span>
        {VOLUMEN_LABOR.map((v) => (
          <button key={v} type="button" onClick={() => setV(v)} aria-pressed={V === v}
            style={{ padding: "6px 11px", borderRadius: 999, border: `1px solid ${V === v ? C.flaggold : C.linie}`, background: V === v ? "#FFF6D6" : C.weiss,
              color: V === v ? C.tinte : C.grau, fontSize: 12.5, fontWeight: V === v ? 600 : 400, fontFamily: "inherit", cursor: "pointer" }}>{v} ml</button>
        ))}
      </div>
      <svg viewBox="0 0 360 200" style={{ width: "100%", display: "block" }} role="img"
        aria-label={`Dose mit Radius ${dk(r, 2)} cm und Höhe ${dk(h, 2)} cm bei ${V} ml, Oberfläche ${dk(O, 1)} cm²`}>
        <defs><linearGradient id="gfsDoseGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFE58A" /><stop offset="100%" stopColor={C.flaggold} /></linearGradient></defs>
        <g>
          <ellipse cx={cx} cy={cy} rx={rB} ry={Math.max(2, rB * 0.32)} fill={istOptimal ? C.flaggold : C.see} />
          <rect x={cx - rB} y={cy - hB} width={2 * rB} height={hB} fill={istOptimal ? "url(#gfsDoseGold)" : C.himmel} stroke={istOptimal ? C.gold : C.see} strokeWidth="1.3" />
          <ellipse cx={cx} cy={cy - hB} rx={rB} ry={Math.max(2, rB * 0.32)} fill={C.weiss} stroke={istOptimal ? C.gold : C.see} strokeWidth="1.3" />
          {h * S > 135 && <text x={cx} y={cy - hB - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill={C.grau} fontFamily="inherit">⋯ höher als das Bild</text>}
          <text x={cx} y={cy + 24} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={C.see} fontFamily="inherit">r = {dk(r, 2)} cm</text>
          <text x={cx} y={cy + 40} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={C.see} fontFamily="inherit">h = {dk(h, 2)} cm</text>
        </g>
        <line x1={GX} y1={GY} x2={GX + GW} y2={GY} stroke={C.tinte} strokeWidth="1" />
        <line x1={GX} y1={GY} x2={GX} y2={GY - GH - 6} stroke={C.tinte} strokeWidth="1" />
        <text x={GX + GW} y={GY + 13} textAnchor="end" fontSize="10" fill={C.grau} fontFamily="inherit">r</text>
        <text x={GX - 4} y={GY - GH - 2} textAnchor="end" fontSize="10" fill={C.grau} fontFamily="inherit">O</text>
        <polyline points={pts.join(" ")} fill="none" stroke={C.tinte} strokeWidth="2" strokeLinecap="round" />
        <line x1={gx(opt.r)} y1={gy(opt.O)} x2={gx(opt.r)} y2={GY} stroke={C.gold} strokeWidth="1" strokeDasharray="3 3" />
        <circle cx={gx(opt.r)} cy={gy(opt.O)} r="4" fill={C.flaggold} stroke={C.gold} strokeWidth="1.2" />
        <circle cx={gx(r)} cy={gy(O)} r="5" fill={istOptimal ? C.flaggold : C.see} stroke={C.weiss} strokeWidth="1.5" />
        <text x={gx(r)} y={gy(O) - 10} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.see} fontFamily="inherit">{dk(O, 0)}</text>
        <text x={gx(opt.r)} y={GY + 13} textAnchor="middle" fontSize="10" fontWeight="700" fill={C.gold} fontFamily="inherit">{dk(opt.r, 2)}</text>
        <text x={GX + GW} y={GY + 26} textAnchor="end" fontSize="10.5" fontWeight="600" fill={C.grau} fontFamily="inherit">V = {V} cm³</text>
      </svg>
      <input type="range" min={0.6} max={rMax} step={0.01} value={r} onChange={(e) => setR(parseFloat(e.target.value))} aria-label="Radius"
        style={{ width: "100%", accentColor: C.see, margin: "6px 0 10px", cursor: "pointer" }} />
      <div className="flex flex-wrap items-center" style={{ gap: 12, fontSize: 13.5, color: C.tinte }}>
        <span>O = <b>{dk(O, 1)} cm²</b></span>
        <span style={{ color: istOptimal ? C.gold : C.signal, fontWeight: 600 }}>{istOptimal ? "Optimum: h = 2r" : `+${dk(mehr, 1)} % gegenüber dem Optimum`}</span>
        <button type="button" onClick={() => setR(Math.round(opt.r * 100) / 100)} style={{ ...LINK, marginLeft: "auto" }}>Zum Optimum springen</button>
      </div>
      <Formeln zeilen={[`r_{1} = \\sqrt[3]{\\frac{${V}}{2\\pi}} \\approx ${dk(opt.r)}, \\quad h = 2r_{1} \\approx ${dk(opt.h)}, \\quad O_{\\min} \\approx ${dk(opt.O)}`]} max={15} />
    </div>
  );
}

/* ---------- Übung: Grundtypen ---------- */
const FELDER = {
  dose: [["r", "r", "cm"], ["h", "h", "cm"], ["O", "O", "cm²"]],
  rueckwaerts: [["V", "V", "cm³"], ["h", "h", "cm"]],
  vergleich: [["h", "h", "cm"], ["O", "O", "cm²"], ["prozent", "Mehrverbrauch", "%"]],
};
const AUFTRAG = {
  zielfunktion: "Welche Zielfunktion entsteht, wenn du die Nebenbedingung in O einsetzt? Tippe die richtige an.",
  dose: "Für welche Werte von r und h ist die Oberfläche der geschlossenen Dose minimal, und wie groß ist sie dann? (auf zwei Nachkommastellen)",
  rueckwaerts: "Eine Dose mit diesem Radius ist optimal gebaut. Welches Volumen fasst sie, und wie hoch ist sie?",
  vergleich: "Eine echte Dose hat diesen Radius. Berechne ihre Höhe, ihre Oberfläche und um wie viel Prozent sie mehr Blech braucht als die optimale Dose.",
};

function DoseTrainer() {
  const [art, setArt] = useState("zielfunktion");
  const [stufe, setStufe] = useState(2);
  const [auf, setAufRoh] = useState(() => merk(aufgabe("zielfunktion", 2)));
  const setAuf = (a) => setAufRoh(merk(a));
  const [ein, setEin] = useState({});
  const [wahl, setWahl] = useState(null);
  const [erg, setErg] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });
  const neu = (a = art, s = stufe) => { setAuf(aufgabe(a, s)); setEin({}); setWahl(null); setErg(null); setZeigen(false); };
  const artSetzen = (a) => { setArt(a); neu(a, stufe); };
  const stufeSetzen = (s) => { const v = Math.max(1, Math.min(5, s)); setStufe(v); neu(art, v); };
  const setze = (k, v) => { setEin((e) => ({ ...e, [k]: v })); setErg(null); };
  const felder = FELDER[auf.art] || [];
  const leer = auf.art === "zielfunktion" ? wahl === null : felder.some(([k]) => !String(ein[k] ?? "").trim());
  const pruefen = () => {
    if (leer) return;
    const e = pruefe(auf, auf.art === "zielfunktion" ? wahl : ein);
    setErg(e);
    setSerie((x) => ({ n: x.n + 1, ok: x.ok + (e.ok ? 1 : 0) }));
  };
  return (
    <div>
      <p style={{ ...FLIESS, lineHeight: 1.7, marginBottom: 18 }}>
        Vier Grundtypen: die Zielfunktion erkennen, die optimale Dose berechnen, von der Form auf das Volumen schließen
        und eine echte Dose mit der optimalen vergleichen.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ARTEN.map((a) => <Chip key={a.id} aktiv={art === a.id} onClick={() => artSetzen(a.id)}>{a.name}</Chip>)}
      </div>
      <Stufen stufe={stufe} setzen={stufeSetzen} />
      <div style={KARTE} data-mm-karte="" data-dosetrainer="">
        <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginBottom: 4 }}>{AUFTRAG[auf.art]}</p>
        <Formeln zeilen={[aufgabeTex(auf)]} max={19} />
        {auf.art === "zielfunktion" ? (
          <div className="flex flex-col" style={{ gap: 8, marginBottom: 12 }}>
            {auf.reihenfolge.map((i) => {
              const an = wahl === i, gut = an && erg && erg.ok, schlecht = an && erg && !erg.ok;
              return (
                <button key={i} type="button" onClick={() => { setWahl(i); setErg(null); }} aria-pressed={an}
                  style={{ textAlign: "left", padding: "10px 12px", borderRadius: 12, fontFamily: "inherit", cursor: "pointer", fontSize: 16,
                    border: `1.5px solid ${gut ? C.see : schlecht ? C.signal : an ? C.see : C.linie}`, background: gut ? C.himmel : an ? "#F3F7FD" : C.weiss, color: C.tinte }}>
                  <M t={auf.optionen[i]} />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap" style={{ gap: 14, marginBottom: 12 }}>
            {felder.map(([k, label, einheit]) => (
              <Feld key={k} k={k} label={label} einheit={einheit} wert={ein[k] ?? ""} setzen={setze} stand={erg ? erg.felder[k] : null} onEnter={pruefen} />
            ))}
          </div>
        )}
        {erg && erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.see, marginBottom: 2 }}>Stimmt!</p>
            <Formeln zeilen={rechenweg(auf)} max={15} farbe={C.see} />
          </div>
        )}
        {erg && !erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>Stimmt noch nicht.</p>
            <p style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>{erg.grund || tipp(auf)}</p>
            {!zeigen && <button onClick={() => setZeigen(true)} className="mt-3" style={LINK}>Rechenweg zeigen</button>}
            {zeigen && <Formeln zeilen={rechenweg(auf)} max={15} farbe={C.see} />}
          </div>
        )}
        {!(erg && erg.ok) && (
          <button onClick={pruefen} disabled={leer} className="px-6 py-3" style={KNOPF(!leer)}>Prüfen</button>
        )}
      </div>
      <div className="flex flex-wrap gap-3 mt-5">
        <button onClick={() => neu()} className="px-6 py-3" style={KNOPF(true, C.gruenDunkel)}>Nächste Aufgabe</button>
        {serie.n > 0 && <span className="flex items-center" style={{ fontSize: 13, color: C.grau }}>{serie.ok} von {serie.n} richtig</span>}
      </div>
    </div>
  );
}

/* ---------- Übungen zu den Aufgaben der GFS-Seite ---------- */

function Begruenden() {
  const [welche, setWelche] = useState(0);
  const [antworten, setAntworten] = useState({});
  const b = BEGRUENDUNGEN[welche];
  const fertig = b.schritte.every((_, i) => antworten[`${b.id}-${i}`] === b.schritte[i].richtig);
  const NAMEN = { doppelt: "h = 2r", global: "Globales Minimum", quadrat: "Quadrat" };
  return (
    <div>
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
          <p style={{ fontSize: 15, fontWeight: 600, color: C.see }}>Begründung vollständig.</p>
          <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>Für die GFS: Erzähl die Schritte in deinen eigenen Worten an der Tafel nach – mit dem allgemeinen V, nicht mit einer Zahl.</p>
        </div>
      )}
      <button type="button" onClick={() => setAntworten({})} style={{ ...LINK, marginTop: 12 }}>Von vorn</button>
    </div>
  );
}

/* Kleine Skizze zur Buchübung */
function Skizze({ a }) {
  const f = C.see, g = C.gold, w = 120, hh = 70;
  if (a.art === "flugzeug") return (
    <svg viewBox="0 0 120 80" width="110" role="img" aria-label="Dose">
      <ellipse cx="60" cy="66" rx="26" ry="8" fill={f} /><rect x="34" y="18" width="52" height="48" fill={C.himmel} stroke={f} strokeWidth="1.3" />
      <ellipse cx="60" cy="18" rx="26" ry="8" fill={a.variante === "offen" ? C.sand : C.weiss} stroke={a.variante === "dick" ? g : f} strokeWidth={a.variante === "dick" ? 3 : 1.3} />
    </svg>
  );
  if (a.art === "zaun" || a.art === "beet") return (
    <svg viewBox={`0 0 ${w} 80`} width="110" role="img" aria-label="Rechteck">
      <rect x="18" y="14" width="84" height="52" fill={C.himmel} stroke={f} strokeWidth="1.5" />
      {a.variante !== "frei" && <rect x="12" y="8" width="96" height="7" fill={C.grau} />}
      <text x="60" y="78" textAnchor="middle" fontSize="11" fontFamily="inherit" fontWeight="700" fill={f}>a</text>
      <text x="110" y="44" textAnchor="middle" fontSize="11" fontFamily="inherit" fontWeight="700" fill={f}>b</text>
    </svg>
  );
  if (a.art === "quader") return (
    <svg viewBox="0 0 120 90" width="110" role="img" aria-label="Quader">
      <path d="M22 30 L66 30 L66 80 L22 80 Z" fill={C.himmel} stroke={f} strokeWidth="1.3" />
      <path d="M22 30 L42 14 L86 14 L66 30 Z" fill={a.variante === "offen" ? C.sand : C.weiss} stroke={a.variante === "dick" ? g : f} strokeWidth={a.variante === "dick" ? 3 : 1.3} />
      <path d="M66 30 L86 14 L86 64 L66 80 Z" fill="#DCE6F5" stroke={f} strokeWidth="1.3" />
      <text x="44" y="89" textAnchor="middle" fontSize="11" fontFamily="inherit" fontWeight="700" fill={f}>a</text>
      <text x="10" y="58" textAnchor="middle" fontSize="11" fontFamily="inherit" fontWeight="700" fill={f}>h</text>
    </svg>
  );
  if (a.art === "zelt") return (
    <svg viewBox="0 0 120 90" width="110" role="img" aria-label="Zelt">
      {a.variante === "pyramide"
        ? <g><path d="M14 72 L60 84 L108 66 L72 58 Z" fill={C.himmel} stroke={f} strokeWidth="1.2" /><path d="M14 72 L60 10 L108 66 M60 84 L60 10 M72 58 L60 10" fill="none" stroke={f} strokeWidth="1.3" /></g>
        : <g><ellipse cx="60" cy="72" rx="46" ry="12" fill={C.himmel} stroke={f} strokeWidth="1.2" /><path d="M14 72 L60 10 L106 72" fill="none" stroke={f} strokeWidth="1.3" /></g>}
      <line x1="60" y1="10" x2="60" y2="72" stroke={g} strokeWidth="1.5" strokeDasharray="3 2" />
      <text x="66" y="46" fontSize="11" fontFamily="inherit" fontWeight="700" fill={g}>h</text>
    </svg>
  );
  if (a.art === "dreieck") return (
    <svg viewBox="0 0 120 80" width="110" role="img" aria-label="Dreieck">
      <path d="M8 72 L112 72 L70 8 Z" fill={C.himmel} stroke={f} strokeWidth="1.3" />
      {a.variante === "dreieck"
        ? <g><line x1="39" y1="40" x2="91" y2="40" stroke={g} strokeWidth="1.6" /><path d="M39 40 L91 40 L60 72 Z" fill={C.flaggold} opacity="0.5" /><text x="60" y="80" fontSize="9" fontFamily="inherit" fontWeight="700" fill={g}>M</text></g>
        : <rect x="39" y="40" width="52" height="32" fill={C.flaggold} opacity="0.55" stroke={g} strokeWidth="1.2" />}
      <text x="116" y="58" fontSize="10" fontFamily="inherit" fontWeight="700" fill={g}>x</text>
    </svg>
  );
  return null;
}

function BuchUebungen() {
  const [art, setArt] = useState("flugzeug");
  const [stufe, setStufe] = useState(2);
  const [auf, setAufRoh] = useState(() => merk(buchAufgabe("flugzeug", 2), "__gdBuch"));
  const setAuf = (a) => setAufRoh(merk(a, "__gdBuch"));
  const [ein, setEin] = useState({});
  const [erg, setErg] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });
  const neu = (a = art, s = stufe) => { setAuf(buchAufgabe(a, s)); setEin({}); setErg(null); setZeigen(false); };
  const artSetzen = (a) => { setArt(a); neu(a, stufe); };
  const stufeSetzen = (s) => { const v = Math.max(1, Math.min(5, s)); setStufe(v); neu(art, v); };
  const setze = (k, v) => { setEin((e) => ({ ...e, [k]: v })); setErg(null); };
  const felder = buchFelder(auf);
  const leer = felder.some(([k]) => !String(ein[k] ?? "").trim());
  const pruefen = () => {
    if (leer) return;
    const e = buchPruefe(auf, ein);
    setErg(e);
    setSerie((x) => ({ n: x.n + 1, ok: x.ok + (e.ok ? 1 : 0) }));
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {BUCH_ARTEN.map((a) => <Chip key={a.id} aktiv={art === a.id} onClick={() => artSetzen(a.id)}>{a.name}</Chip>)}
      </div>
      {art === "begruenden" ? <div style={KARTE}><Begruenden /></div> : (
        <>
          <Stufen stufe={stufe} setzen={stufeSetzen} />
          <div style={KARTE} data-mm-karte="" data-buchuebung="">
            <div className="flex" style={{ gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 210px", minWidth: 0 }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: "#A67C00", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>{buchHinweis(auf)}</p>
                <p style={{ fontSize: 15, color: C.tinte, fontWeight: 400, lineHeight: 1.7, marginBottom: 12 }}>{buchAuftrag(auf)}</p>
              </div>
              <div style={{ flex: "none" }}><Skizze a={auf} /></div>
            </div>
            <div className="flex flex-wrap" style={{ gap: 14, marginBottom: 12 }}>
              {felder.map(([k, label, einheit], i) => (
                <Feld key={k} k={k} label={label} einheit={einheit} wert={ein[k] ?? ""} setzen={setze} stand={erg ? erg.felder[i] : null} onEnter={pruefen} />
              ))}
            </div>
            {erg && erg.ok && (
              <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 14 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: C.see, marginBottom: 2 }}>Stimmt!</p>
                <Formeln zeilen={buchRechenweg(auf)} max={15} farbe={C.see} />
              </div>
            )}
            {erg && !erg.ok && (
              <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginBottom: 14 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>{erg.vertauscht ? "Fast – a und b sind vertauscht." : "Stimmt noch nicht."}</p>
                <p style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>
                  {erg.vertauscht ? "Die Seite a liegt an der Wand bzw. Mauer – schau in der Skizze nach, welche Seite gemeint ist." : buchTipp(auf)}
                </p>
                {!zeigen && <button onClick={() => setZeigen(true)} className="mt-3" style={LINK}>Rechenweg zeigen</button>}
                {zeigen && <Formeln zeilen={buchRechenweg(auf)} max={15} farbe={C.see} />}
              </div>
            )}
            {!(erg && erg.ok) && <button onClick={pruefen} disabled={leer} className="px-6 py-3" style={KNOPF(!leer)}>Prüfen</button>}
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            <button onClick={() => neu()} className="px-6 py-3" style={KNOPF(true, C.gruenDunkel)}>Nächste Aufgabe</button>
            {serie.n > 0 && <span className="flex items-center" style={{ fontSize: 13, color: C.grau }}>{serie.ok} von {serie.n} richtig</span>}
          </div>
        </>
      )}
    </div>
  );
}

/* Gegenüberstellung: so wurden die Buchaufgaben adaptiert (aufklappbar) */
function Adaption() {
  const [offen, setOffen] = useState(false);
  return (
    <div style={{ marginTop: 18 }}>
      <button type="button" onClick={() => setOffen((o) => !o)} aria-expanded={offen} style={LINK}>
        {offen ? "Gegenüberstellung schließen" : "Wie wir die Buchaufgaben adaptiert haben – Idee übernehmen, Ausdruck neu schaffen"}
      </button>
      {offen && (
        <div className="auftauchen" style={{ marginTop: 12 }}>
          <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginBottom: 10 }}>
            Das Schulbuch ist ein unabhängiges Werk des Verlags (Lambacher Schweizer, Marke von Klett). Wir übernehmen nur die mathematische Idee jeder Aufgabe –
            nie Text, Zahlen, Abbildungen oder Lösungen. Jede Übung hier hat einen eigenen Generator, eigene Worte, eine eigene Rückmeldung und eine Stufe mehr Tiefe.
          </p>
          {ADAPTION.map((z) => (
            <div key={z.buch} style={{ borderTop: `1px solid ${C.linie}`, padding: "10px 0" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#A67C00", marginBottom: 2 }}>{z.buch} · Idee: {z.idee}</p>
              <p style={{ fontSize: 13.5, color: C.tinte, fontWeight: 300, lineHeight: 1.7 }}>{z.wie}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Die Seite ---------- */

export function GfsDoseSeite({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      {gehe && (
        <button onClick={() => gehe({ ansicht: "gfs" })} className="mb-5" style={{ ...LINK, textDecoration: "none" }}>← Zurück zum Kurs GFS</button>
      )}
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Wie muss eine Dose aussehen, damit sie bei festem Inhalt am wenigsten Blech braucht?
      </h2>
      <Text s="Zwei Dosen mit demselben Inhalt können völlig verschieden aussehen: schlank und hoch oder breit und flach. Beide
        halten 330 ml – aber nicht beide brauchen gleich viel Blech. Die Frage nach der sparsamsten Form ist ein
        Extremwertproblem mit Nebenbedingung: Eine Größe soll möglichst klein werden (die Oberfläche), während eine andere
        festliegt (das Volumen)." style={FLIESS} />

      <DoseAnimation art="abwickeln" offen />

      <Text s="Solche Aufgaben löst man immer nach derselben Strategie in fünf Schritten. Wir gehen sie an der Dose
        durch – mit dem allgemeinen Volumen $V$, damit am Ende eine Form herauskommt und nicht nur eine Zahl." style={FLIESS} />

      <Schritt nr="1" titel="Zielgröße: Was soll minimal werden?" />
      <Text s="Das Blech der Dose ist ihre Oberfläche. Boden und Deckel sind Kreise mit Radius $r$, der Mantel ist ein
        Rechteck mit der Breite $2\pi r$ (dem Umfang) und der Höhe $h$:" style={FLIESS} />
      <Formeln zeilen={["O = 2\\pi r^{2} + 2\\pi r h"]} max={20} />
      <Text s="Dieser Term hängt von zwei Variablen ab. Ableiten können wir aber nur nach einer – wir brauchen eine
        zweite Gleichung, die $r$ und $h$ verbindet." style={FLIESS} />

      <Schritt nr="2" titel="Nebenbedingung: Was liegt fest?" />
      <Text s="Das Volumen ist vorgegeben: $V = \pi r^{2} h$. Diese Gleichung heißt Nebenbedingung. Nach $h$ aufgelöst:" style={FLIESS} />
      <Formeln zeilen={["h = \\frac{V}{\\pi r^{2}}"]} max={20} />
      <DoseAnimation art="nebenbedingung" />

      <Schritt nr="3" titel="Zielfunktion mit Definitionsmenge" />
      <Text s="Jetzt ersetzen wir $h$ in der Zielgröße. Der Mantel $2\pi r h$ wird zu $2\pi r \cdot \frac{V}{\pi r^{2}} = \frac{2V}{r}$ – das $\pi$ und ein $r$ kürzen sich:" style={FLIESS} />
      <Formeln zeilen={["O(r) = 2\\pi r^{2} + \\frac{2V}{r} \\qquad D = (0;\\, \\infty)"]} max={19} />
      <Text s="Ein Radius ist positiv, also $r > 0$; nach oben gibt es keine Grenze. Für $V = 330$ lautet die Zielfunktion
        $O(r) = 2\pi r^{2} + \frac{660}{r}$." style={FLIESS} />

      <Schritt nr="4" titel="Extremwert – und die Ränder nicht vergessen" />
      <Text s="Die Potenzregel gilt auch für $\frac{2V}{r} = 2V \cdot r^{-1}$:" style={FLIESS} />
      <Formeln zeilen={[
        "O'(r) = 4\\pi r - \\frac{2V}{r^{2}}, \\qquad O''(r) = 4\\pi + \\frac{4V}{r^{3}}",
        "O'(r) = 0 \\;\\Rightarrow\\; 4\\pi r = \\frac{2V}{r^{2}} \\;\\Rightarrow\\; r^{3} = \\frac{V}{2\\pi} \\;\\Rightarrow\\; r_{1} = \\sqrt[3]{\\frac{V}{2\\pi}}",
      ]} />
      <Text s="Wegen $O''(r_{1}) > 0$ liegt bei $r_{1}$ ein lokales Minimum. Global wird es erst durch die Ränder: Für $r \to 0$
        wächst $\frac{2V}{r}$ über alle Grenzen (der Mantel wird endlos lang), für $r \to \infty$ wächst $2\pi r^{2}$ über alle
        Grenzen (Boden und Deckel werden riesig). Da $O'$ nur eine Nullstelle hat, ist $O(r_{1})$ der kleinste Wert überhaupt." style={FLIESS} />
      <DoseAnimation art="graph" />

      <Schritt nr="5" titel="Ergebnis: eine Form, keine Zahl" />
      <Text s="Aus $r_{1}^{3} = \frac{V}{2\pi}$ folgt $V = 2\pi r_{1}^{3}$. Das setzen wir in die Nebenbedingung ein:" style={FLIESS} />
      <Formeln zeilen={["h = \\frac{V}{\\pi r_{1}^{2}} = \\frac{2\\pi r_{1}^{3}}{\\pi r_{1}^{2}} = 2 r_{1}"]} max={20} />
      <Kasten titel="Ergebnis">
        <Text s="Die sparsamste Dose ist genau so hoch wie breit: $h = 2r$. Für $V = 330\,\text{cm}^{3}$ ergibt das
          $r \approx 3{,}74\,\text{cm}$, $h \approx 7{,}49\,\text{cm}$ und $O \approx 264{,}36\,\text{cm}^{2}$."
          style={{ fontSize: 15, color: C.tinte, fontWeight: 500, lineHeight: 1.8, margin: "8px 0 10px" }} />
      </Kasten>
      <DoseAnimation art="formen" />
      <DoseAnimation art="echt" />
      <Text s="Zum Mitnehmen: Die fünf Schritte sind das Werkzeug für jedes Extremwertproblem mit Nebenbedingung – ob
        Dose, Zaun, Karton oder Zelt." style={FLIESS} />
      <DoseAnimation art="fuenf" />

      <div style={{ ...KARTE, margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Dosen-Labor: Inhalt wählen, Radius ziehen</p>
        <DosenLabor />
      </div>

      <Trenner />

      <Kicker>Jetzt selbst üben</Kicker>
      <H3>Zielfunktion, optimale Maße, rückwärts, echte Dose</H3>
      <DoseTrainer />

      <div style={{ height: 30 }} />
      <Kicker>Passend zu den Aufgaben deiner GFS-Seite</Kicker>
      <H3>Kleine Dose, Zaun, Beet, Karton, Zelt, Dreieck, begründen</H3>
      <p style={{ ...FLIESS, lineHeight: 1.7, marginBottom: 18 }}>
        Zu jeder Aufgabe auf der GFS-Seite gibt es hier eine Übung mit derselben Idee – mit immer neuen Zahlen, eigenen
        Kontexten und ab Stufe 3 einer Variante, die im Buch nicht steht. Wer diese Übungen sicher kann, löst auch die Aufgaben im Buch.
      </p>
      <BuchUebungen />
      <Adaption />

      {gehe && (
        <div style={{ ...KARTE, marginTop: 22, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>Mehr Extremwertaufgaben</p>
            <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>Die Optimierungswerkstatt führt Schritt für Schritt durch Schachtel, Fläche und eigenen Ansatz – mit Hinweisen auf jeder Stufe.</p>
          </div>
          <button type="button" onClick={() => gehe({ ansicht: "optimierung" })} className="px-5 py-3" style={KNOPF(true)}>Zur Optimierungswerkstatt</button>
        </div>
      )}

      <Trenner />

      <Kicker>Deine GFS</Kicker>
      <H3>Der rote Faden für den Vortrag</H3>
      <RoterFaden gliederung={GLIEDERUNG} tipps={TIPPS} hinweis="den Abschnitt mit den Varianten" />

      <div style={{ height: 8 }} />
      <Kicker>Kolloquium</Kicker>
      <H3>Die Fragen nach dem Vortrag trainieren</H3>
      <Kolloquium fragen={KOLLOQUIUM} speicher="mm-gfs-dose-kolloquium" />
    </div>
  );
}
