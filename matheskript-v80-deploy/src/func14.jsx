/* ============================================================
   KopfrechenZentrum — Übersicht mit drei Trainern:
   Primfaktorzerlegung (vorhanden, aus func5), Quadrat- und Kubikzahlen,
   EinMalEins. Die beiden neuen Trainer teilen sich einen Schnellrechen-
   Baustein: Runde mit 10 Aufgaben, großes Zahlenfeld, sofortige
   Rückmeldung, Serie, Zeit und Bestwert.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { Primfaktoren, merken } from "./func5.jsx";

const zufall = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const HOCH = { 2: "²", 3: "³" };

/* ---------- Aufgaben-Erzeuger ---------- */

const EINMALEINS_MODI = [
  { id: "klein", name: "Kleines 1×1", kurz: "1 bis 10" },
  { id: "gross", name: "Großes 1×1", kurz: "bis 20" },
  { id: "geteilt", name: "Geteilt", kurz: "Umkehraufgaben" },
  { id: "mix", name: "Gemischt", kurz: "alles durcheinander" },
];

function einmaleinsAufgabe(modus, reihe) {
  const m = modus === "mix" ? ["klein", "gross", "geteilt"][zufall(0, 2)] : modus;
  const r = reihe || null;
  if (m === "klein") {
    const a = r || zufall(2, 10), b = zufall(1, 10);
    return Math.random() < 0.5 ? { text: `${a} · ${b}`, loesung: a * b } : { text: `${b} · ${a}`, loesung: a * b };
  }
  if (m === "gross") {
    const a = r || zufall(11, 20), b = zufall(2, r ? 20 : 12);
    return Math.random() < 0.5 ? { text: `${a} · ${b}`, loesung: a * b } : { text: `${b} · ${a}`, loesung: a * b };
  }
  const a = r || zufall(2, 10), b = zufall(2, 10);
  return { text: `${a * b} : ${a}`, loesung: b };
}

const POTENZ_MODI = [
  { id: "quadrat", name: "Quadratzahlen", kurz: "1² bis 25²" },
  { id: "kubik", name: "Kubikzahlen", kurz: "1³ bis 10³" },
  { id: "wurzel", name: "Quadratwurzeln", kurz: "√ bis 625" },
  { id: "kwurzel", name: "Kubikwurzeln", kurz: "∛ bis 1000" },
  { id: "mix", name: "Gemischt", kurz: "alles durcheinander" },
];

function potenzAufgabe(modus) {
  const m = modus === "mix" ? ["quadrat", "kubik", "wurzel", "kwurzel"][zufall(0, 3)] : modus;
  if (m === "quadrat") { const n = zufall(2, 25); return { text: `${n}²`, loesung: n * n }; }
  if (m === "kubik") { const n = zufall(2, 10); return { text: `${n}³`, loesung: n ** 3 }; }
  if (m === "wurzel") { const n = zufall(2, 25); return { text: `√${n * n}`, loesung: n }; }
  const n = zufall(2, 10); return { text: `∛${n ** 3}`, loesung: n };
}

/* ---------- Schnellrechen-Baustein ---------- */

const RUNDE = 10;

function Zahlenfeld({ onZiffer, onLoeschen, onOk, gesperrt }) {
  const taste = (inhalt, onClick, art) => (
    <button key={String(inhalt)} onClick={onClick} disabled={gesperrt} className="kr-taste"
      style={{ height: 58, borderRadius: 14, fontFamily: "inherit", cursor: gesperrt ? "default" : "pointer",
        fontSize: art === "ok" ? 18 : 24, fontWeight: 700, letterSpacing: art === "ok" ? "0.04em" : 0,
        border: `1px solid ${art === "ok" ? C.smaragd : art === "nav" ? C.seeTief : C.linie}`,
        background: art === "ok" ? C.smaragd : art === "nav" ? C.seeTief : C.weiss,
        color: art === "ok" ? C.weiss : art === "nav" ? C.flaggold : C.tinte,
        boxShadow: art === "ok" ? "0 4px 12px rgba(47,143,91,0.3)" : "0 1px 0 rgba(15,26,51,0.06)" }}>
      {inhalt}
    </button>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      <style>{`.kr-taste{transition:transform .08s ease, filter .12s ease}.kr-taste:active{transform:scale(0.94);filter:brightness(0.94)}`}</style>
      {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((z) => taste(z, () => onZiffer(String(z))))}
      {taste("⌫", onLoeschen, "nav")}
      {taste(0, () => onZiffer("0"))}
      {taste("OK", onOk, "ok")}
    </div>
  );
}

function Schnellrechnen({ erzeugen, gruppe, bestSchluessel }) {
  const [nr, setNr] = useState(0);
  const [aufgabe, setAufgabe] = useState(() => erzeugen());
  const [eingabe, setEingabe] = useState("");
  const [rueck, setRueck] = useState(null);           // null | "richtig" | "falsch"
  const [richtig, setRichtig] = useState(0);
  const [serie, setSerie] = useState(0);
  const [start, setStart] = useState(() => Date.now());
  const [aufgStart, setAufgStart] = useState(() => Date.now());
  const [fertig, setFertig] = useState(null);
  const [fehlerListe, setFehlerListe] = useState([]);
  const [best, setBest] = useState(() => {
    try { return JSON.parse(localStorage.getItem(bestSchluessel) || "null"); } catch { return null; }
  });
  const timer = useRef(null);

  const neueRunde = () => {
    clearTimeout(timer.current);
    setNr(0); setAufgabe(erzeugen()); setEingabe(""); setRueck(null); setRichtig(0); setSerie(0);
    setStart(Date.now()); setAufgStart(Date.now()); setFertig(null); setFehlerListe([]);
  };
  // Neuer Modus → neue Runde
  useEffect(neueRunde, [erzeugen]);  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timer.current), []);

  const weiter = (warRichtig) => {
    const n = nr + 1;
    if (n >= RUNDE) {
      const sek = Math.round((Date.now() - start) / 100) / 10;
      const ergebnis = { richtig: richtig + (warRichtig ? 1 : 0), sek };
      setFertig(ergebnis);
      const besser = !best || ergebnis.richtig > best.richtig || (ergebnis.richtig === best.richtig && sek < best.sek);
      if (besser) {
        setBest(ergebnis);
        try { localStorage.setItem(bestSchluessel, JSON.stringify(ergebnis)); } catch { /* optional */ }
      }
      return;
    }
    setNr(n); setAufgabe(erzeugen()); setEingabe(""); setRueck(null); setAufgStart(Date.now());
  };

  const pruefen = () => {
    if (rueck || fertig || eingabe === "") return;
    const ok = Number(eingabe) === aufgabe.loesung;
    const sekunden = Math.round((Date.now() - aufgStart) / 100) / 10;
    try { merken({ gruppe, richtig: ok, sekunden, fehlerart: ok ? null : "rechnen" }); } catch { /* optional */ }
    setRueck(ok ? "richtig" : "falsch");
    if (ok) { setRichtig((r) => r + 1); setSerie((s) => s + 1); }
    else { setSerie(0); setFehlerListe((l) => [...l, { ...aufgabe, eingabe }]); }
    timer.current = setTimeout(() => weiter(ok), ok ? 550 : 1500);
  };

  // Tastatur am Rechner
  useEffect(() => {
    const taste = (e) => {
      if (/^[0-9]$/.test(e.key)) setEingabe((v) => (rueck || v.length >= 6 ? v : v + e.key));
      else if (e.key === "Backspace") setEingabe((v) => (rueck ? v : v.slice(0, -1)));
      else if (e.key === "Enter") pruefen();
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  });

  const karte = { background: C.weiss, borderRadius: 18, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };

  if (fertig) {
    const quote = Math.round((fertig.richtig / RUNDE) * 100);
    return (
      <div style={karte}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 6 }}>Runde geschafft</p>
        <p style={{ fontSize: 44, fontWeight: 800, color: C.tinte, lineHeight: 1.1 }}>
          {fertig.richtig} <span style={{ fontSize: 22, color: C.grau, fontWeight: 600 }}>von {RUNDE}</span>
        </p>
        <p style={{ fontSize: 15, color: C.grau, marginTop: 6 }}>
          in {String(fertig.sek).replace(".", ",")} s · {quote} %
          {best && <span style={{ marginLeft: 8, color: C.see }}>· Bestwert {best.richtig}/{RUNDE} in {String(best.sek).replace(".", ",")} s</span>}
        </p>
        <p style={{ fontSize: 15, fontWeight: 600, color: quote === 100 ? C.smaragd : C.tinte, marginTop: 14 }}>
          {quote === 100 ? "Fehlerfrei! 🎉" : quote >= 80 ? "Stark — fast alles sitzt." : quote >= 50 ? "Gute Basis, weiter üben." : "Dranbleiben — Wiederholung macht schnell."}
        </p>
        {fehlerListe.length > 0 && (
          <div style={{ marginTop: 14, background: C.sand, borderRadius: 12, padding: "10px 14px" }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, marginBottom: 6 }}>Nochmal anschauen</p>
            {fehlerListe.map((f, i) => (
              <p key={i} style={{ fontSize: 15, color: C.tinte, marginBottom: 3 }}>
                {f.text} = <b>{f.loesung}</b> <span style={{ color: C.signal, fontSize: 13, marginLeft: 6 }}>(du: {f.eingabe})</span>
              </p>
            ))}
          </div>
        )}
        <button onClick={neueRunde}
          style={{ width: "100%", height: 52, marginTop: 16, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit",
            fontSize: 16, fontWeight: 700, color: C.weiss, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` }}>
          Neue Runde
        </button>
      </div>
    );
  }

  const farbe = rueck === "richtig" ? C.smaragd : rueck === "falsch" ? C.signal : C.see;
  return (
    <div style={karte}>
      {/* Fortschritt */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, display: "flex", gap: 4 }}>
          {Array.from({ length: RUNDE }, (_, i) => (
            <span key={i} style={{ flex: 1, height: 6, borderRadius: 3,
              background: i < nr ? C.see : i === nr ? C.flaggold : C.linie }} />
          ))}
        </div>
        <span style={{ fontSize: 12.5, color: C.grau, whiteSpace: "nowrap" }}>{nr + 1} / {RUNDE}</span>
        {serie >= 3 && <span style={{ fontSize: 12.5, fontWeight: 700, color: C.gruen, whiteSpace: "nowrap" }}>🔥 {serie}</span>}
      </div>

      {/* Aufgabe */}
      <div style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 16,
        padding: "22px 16px", textAlign: "center", marginBottom: 12 }}>
        <p style={{ color: C.weiss, fontSize: 44, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
          {aufgabe.text} <span style={{ color: C.goldText, fontWeight: 600 }}>=</span>
        </p>
      </div>

      {/* Eingabe */}
      <div style={{ border: `2.5px solid ${farbe}`, borderRadius: 14, height: 64, marginBottom: 6,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        background: rueck === "richtig" ? "#EEF8F2" : rueck === "falsch" ? "#FBEFEA" : C.weiss, transition: "all .15s" }}>
        <span style={{ fontSize: 34, fontWeight: 800, color: C.tinte, minWidth: 20 }}>{eingabe || <span style={{ color: C.hellgrau }}>?</span>}</span>
        {rueck === "richtig" && <span style={{ fontSize: 26, color: C.smaragd, fontWeight: 800 }}>✓</span>}
        {rueck === "falsch" && <span style={{ fontSize: 17, color: C.signal, fontWeight: 700 }}>✗ richtig: {aufgabe.loesung}</span>}
      </div>
      <p style={{ fontSize: 12, color: C.hellgrau, textAlign: "center", marginBottom: 12, minHeight: 16 }}>
        {best ? `Bestwert: ${best.richtig}/${RUNDE} in ${String(best.sek).replace(".", ",")} s` : "Tippe die Lösung ein und drücke OK."}
      </p>

      <Zahlenfeld gesperrt={!!rueck}
        onZiffer={(z) => setEingabe((v) => (v.length >= 6 ? v : v + z))}
        onLoeschen={() => setEingabe((v) => v.slice(0, -1))}
        onOk={pruefen} />
    </div>
  );
}

/* Modus-Leiste (Chips) */
function Modi({ liste, wert, setWert }) {
  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
      {liste.map((m) => (
        <button key={m.id} onClick={() => setWert(m.id)}
          style={{ flexShrink: 0, padding: "7px 12px", borderRadius: 999, fontFamily: "inherit", cursor: "pointer",
            border: `1px solid ${wert === m.id ? C.see : C.linie}`, background: wert === m.id ? C.see : C.weiss,
            color: wert === m.id ? C.weiss : C.see, textAlign: "left", lineHeight: 1.2 }}>
          <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{m.name}</span>
          <span style={{ display: "block", fontSize: 11, opacity: 0.75 }}>{m.kurz}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- EinMalEins ---------- */

function EinMalEins() {
  const [modus, setModus] = useState("klein");
  const [reihe, setReihe] = useState(null);
  const reihen = modus === "gross" ? [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] : [2, 3, 4, 5, 6, 7, 8, 9, 10];
  const erzeugen = React.useCallback(() => einmaleinsAufgabe(modus, reihe), [modus, reihe]);
  return (
    <div>
      <Modi liste={EINMALEINS_MODI} wert={modus} setWert={(m) => { setModus(m); setReihe(null); }} />
      {modus !== "mix" && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ fontSize: 12.5, color: C.grau, marginRight: 4 }}>Reihe</span>
          {[null, ...reihen].map((r) => (
            <button key={String(r)} onClick={() => setReihe(r)}
              style={{ minWidth: 34, height: 30, padding: "0 8px", borderRadius: 999, fontFamily: "inherit", cursor: "pointer",
                fontSize: 12.5, fontWeight: 600, border: `1px solid ${reihe === r ? C.gruen : C.linie}`,
                background: reihe === r ? C.gruen : C.weiss, color: reihe === r ? C.weiss : C.tinte }}>
              {r === null ? "Alle" : r}
            </button>
          ))}
        </div>
      )}
      <Schnellrechnen erzeugen={erzeugen} gruppe="Einmaleins" bestSchluessel={`kr-best-1x1-${modus}-${reihe || "alle"}`} />
    </div>
  );
}

/* ---------- Quadrat- und Kubikzahlen ---------- */

function PotenzTabelle() {
  const [offen, setOffen] = useState(false);
  const zelle = (oben, unten, i) => (
    <div key={i} style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 10, padding: "6px 4px", textAlign: "center" }}>
      <span style={{ display: "block", fontSize: 11.5, color: C.grau }}>{oben}</span>
      <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.tinte }}>{unten}</span>
    </div>
  );
  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={() => setOffen(!offen)}
        style={{ width: "100%", height: 44, borderRadius: 12, border: `1px solid ${C.linie}`, background: C.weiss,
          color: C.see, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        {offen ? "Lerntabelle ausblenden" : "Lerntabelle zum Einprägen anzeigen"}
      </button>
      {offen && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.see, marginBottom: 8 }}>Quadratzahlen</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 14 }}>
            {Array.from({ length: 25 }, (_, i) => zelle(`${i + 1}²`, (i + 1) ** 2, i))}
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.see, marginBottom: 8 }}>Kubikzahlen</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {Array.from({ length: 10 }, (_, i) => zelle(`${i + 1}³`, (i + 1) ** 3, i))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuadratKubik() {
  const [modus, setModus] = useState("quadrat");
  const erzeugen = React.useCallback(() => potenzAufgabe(modus), [modus]);
  return (
    <div>
      <Modi liste={POTENZ_MODI} wert={modus} setWert={setModus} />
      <Schnellrechnen erzeugen={erzeugen} gruppe="Potenzen" bestSchluessel={`kr-best-pot-${modus}`} />
      <PotenzTabelle />
    </div>
  );
}

/* ---------- Übersicht ---------- */

const TRAINER = [
  { id: "primfaktoren", titel: "Primfaktorzerlegung", kurz: "Primzahl erkennen oder vollständig zerlegen — jeden Faktor einzeln.", zeichen: "2·3·7" },
  { id: "potenzen", titel: "Quadrat- und Kubikzahlen", kurz: "Quadrat- und Kubikzahlen sowie ihre Wurzeln blitzschnell abrufen.", zeichen: "12²" },
  { id: "einmaleins", titel: "EinMalEins", kurz: "Kleines und großes Einmaleins, auch als Umkehraufgaben — auf Zeit.", zeichen: "7·8" },
];

export function KopfrechenZentrum() {
  const [offen, setOffen] = useState(null);
  const t = offen ? TRAINER.find((x) => x.id === offen) : null;

  if (!t) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, marginTop: -8 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>KopfrechenZentrum</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
          Zahlen, die einfach sitzen
        </h2>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
          Drei Trainer für das Kopfrechnen. Wer Zahlen sofort abrufen kann, kürzt schneller, sieht Teiler auf einen
          Blick und hat beim Rechnen den Kopf für das Eigentliche frei.
        </p>
        {TRAINER.map((x) => (
          <button key={x.id} onClick={() => { setOffen(x.id); window.scrollTo(0, 0); }} className="w-full px-5 py-5 mb-3"
            style={{ display: "flex", alignItems: "center", gap: 14, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16,
              textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: C.tinte, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 58, height: 58, borderRadius: 14,
              background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.flaggold,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: x.zeichen.length > 4 ? 13 : 18, fontWeight: 800 }}>
              {x.zeichen}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 17.5, fontWeight: 600, marginBottom: 4 }}>{x.titel}</span>
              <span style={{ display: "block", color: C.grau, fontSize: 13.5, fontWeight: 300, lineHeight: 1.6 }}>{x.kurz}</span>
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, marginTop: -8 }}>
      <button onClick={() => setOffen(null)} className="mb-5"
        style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
        ← KopfrechenZentrum
      </button>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>KopfrechenZentrum</p>
      <h2 style={{ fontSize: 25, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>{t.titel}</h2>
      {t.id === "primfaktoren" ? <Primfaktoren /> : t.id === "potenzen" ? <QuadratKubik /> : <EinMalEins />}
    </div>
  );
}

/* Grafik für die Startseiten-Kachel: schwebende Rechenkärtchen. */
export function KopfrechnenLogoKlein() {
  const W = 230, H = 190;
  const karten = [
    { x: 18, y: 26, w: 92, t: "7 · 8", e: "56", f: C.weiss, r: -6 },
    { x: 124, y: 16, w: 88, t: "12²", e: "144", f: C.flaggold, r: 5 },
    { x: 40, y: 104, w: 96, t: "84", e: "2²·3·7", f: C.granaHell, r: 3 },
    { x: 146, y: 108, w: 70, t: "∛27", e: "3", f: C.weiss, r: -4 },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
      {karten.map((k, i) => (
        <g key={i} transform={`rotate(${k.r} ${k.x + k.w / 2} ${k.y + 30})`}>
          <rect x={k.x} y={k.y} width={k.w} height={60} rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" />
          <text x={k.x + k.w / 2} y={k.y + 27} textAnchor="middle" fill={k.f} fontSize="18" fontWeight="800">{k.t}</text>
          <text x={k.x + k.w / 2} y={k.y + 48} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="13" fontWeight="600">= {k.e}</text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- Analysis-Übersicht ---------- */

const ANALYSIS = [
  { ansicht: "plotter", titel: "Polynomplotter", kurz: "Koeffizienten einstellen, Graph mit f′ und f″ live sehen — inklusive Kurvendiskussion und PDF.", zeichen: "ax³" },
  { ansicht: "advplotter", titel: "Advanced Plotter", kurz: "Beliebige Funktionen mit sin, cos, ln, eˣ, Wurzeln und Brüchen bauen und untersuchen.", zeichen: "sin" },
  { ansicht: "ableitungstrainer", titel: "Ableitungstrainer", kurz: "f′, f″ und f‴ per Tastenfeld eingeben und sofort prüfen lassen.", zeichen: "f′" },
];

export function AnalysisZentrum({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, marginTop: -8 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>Analysis</p>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Funktionen sehen, verstehen, ableiten
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
        Drei Werkzeuge für die Analysis: Graphen live erkunden, komplette Kurvendiskussionen erzeugen und das
        Ableiten trainieren.
      </p>
      {ANALYSIS.map((x) => (
        <button key={x.ansicht} onClick={() => gehe({ ansicht: x.ansicht })} className="w-full px-5 py-5 mb-3"
          style={{ display: "flex", alignItems: "center", gap: 14, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16,
            textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: C.tinte, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
          <span aria-hidden="true" style={{ flexShrink: 0, width: 58, height: 58, borderRadius: 14,
            background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.flaggold,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, fontStyle: "italic" }}>
            {x.zeichen}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 17.5, fontWeight: 600, marginBottom: 4 }}>{x.titel}</span>
            <span style={{ display: "block", color: C.grau, fontSize: 13.5, fontWeight: 300, lineHeight: 1.6 }}>{x.kurz}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
