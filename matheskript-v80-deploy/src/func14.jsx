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

/* ---------- Gleichungs-Layout ----------
   Aufgabe links, Eingabe rechts auf gleicher Höhe — liest sich wie eine Gleichung.
   Das Breitenverhältnis passt sich dem Inhalt an: Jede Box startet mit der Breite
   ihres Inhalts, der freie Platz wird gleichmäßig verteilt. Viel Inhalt in der
   Aufgabe → breitere Aufgabe; wenig Inhalt → beide etwa gleich breit.
   Inhalt immer mittig. Unter 560 px Breite rutscht die Eingabe unter die Aufgabe. */
const GLEICHUNG_CSS = `
  .kr-gleichung{display:flex;align-items:stretch;gap:16px;margin-bottom:6px}
  .kr-gleichung > *{flex:1 1 auto;min-width:0}
  .kr-aufgabe{display:flex;align-items:center;justify-content:center;text-align:center}
  .kr-eingabe{min-width:150px}
  @media (max-width:560px){
    .kr-gleichung{flex-direction:column;gap:12px}
    .kr-eingabe{min-width:0}
  }`;

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

      <style>{GLEICHUNG_CSS}</style>
      <div className="kr-gleichung">
        {/* Aufgabe: rechtsbündig, endet mit „=“ */}
        <div className="kr-aufgabe" style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 16,
          padding: "20px 18px", minHeight: 96 }}>
          <p style={{ color: C.weiss, fontSize: "clamp(34px, 9vw, 44px)", fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.1, whiteSpace: "nowrap" }}>
            {aufgabe.text} <span style={{ color: C.goldText, fontWeight: 600 }}>=</span>
          </p>
        </div>

        {/* Eingabe */}
        <div className="kr-eingabe" style={{ border: `2.5px solid ${farbe}`, borderRadius: 14, minHeight: 64,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap", padding: "6px 8px",
          background: rueck === "richtig" ? "#EEF8F2" : rueck === "falsch" ? "#FBEFEA" : C.weiss, transition: "all .15s" }}>
          <span style={{ fontSize: 34, fontWeight: 800, color: C.tinte, minWidth: 20 }}>{eingabe || <span style={{ color: C.hellgrau }}>?</span>}</span>
          {rueck === "richtig" && <span style={{ fontSize: 26, color: C.smaragd, fontWeight: 800 }}>✓</span>}
          {rueck === "falsch" && <span style={{ fontSize: 17, color: C.signal, fontWeight: 700 }}>✗ richtig: {aufgabe.loesung}</span>}
        </div>
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

/* ---------- Übersichten zum Anschauen ---------- */

function UebersichtKopf({ titel, text }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel }}>Übersicht</p>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.tinte, marginTop: 2 }}>{titel}</p>
      {text && <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.55, marginTop: 2 }}>{text}</p>}
    </div>
  );
}

/* 1×1 als Schachbrett: 10×10 Produkte, Zeilen/Spalten beschriftet, Diagonale hervorgehoben. */
export function EinmaleinsSchachbrett() {
  const zahlen = Array.from({ length: 10 }, (_, i) => i + 1);
  const zelle = { display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "1 / 1",
    fontSize: "clamp(10px, 2.9vw, 14px)", fontVariantNumeric: "tabular-nums" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 2, background: C.weiss,
      borderRadius: 14, padding: 6, boxShadow: "0 2px 14px rgba(15,26,51,0.06)", border: `1px solid ${C.linie}` }}>
      <div style={{ ...zelle, color: C.gruen, fontWeight: 800 }}>·</div>
      {zahlen.map((s) => (
        <div key={`k${s}`} style={{ ...zelle, fontWeight: 800, color: C.gruen }}>{s}</div>
      ))}
      {zahlen.map((z) => (
        <React.Fragment key={`z${z}`}>
          <div style={{ ...zelle, fontWeight: 800, color: C.gruen }}>{z}</div>
          {zahlen.map((s) => {
            const diag = z === s, dunkel = (z + s) % 2 === 1;
            return (
              <div key={`${z}-${s}`} title={`${z} · ${s} = ${z * s}`}
                style={{ ...zelle, borderRadius: 4, fontWeight: diag ? 800 : 600,
                  background: diag ? C.flaggold : dunkel ? C.see : C.himmel,
                  color: diag ? C.seeTief : dunkel ? C.weiss : C.tinte,
                  boxShadow: diag ? "inset 0 0 0 1.5px rgba(14,30,74,0.35)" : "none" }}>
                {z * s}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

/* Liste „n² = Wert“ bzw. „n³ = Wert“ */
function PotenzListe({ bis, hoch }) {
  const zeichen = hoch === 2 ? "²" : "³";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))", gap: 6 }}>
      {Array.from({ length: bis }, (_, i) => i + 1).map((n) => (
        <div key={n} style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 10, padding: "7px 10px",
          fontSize: 15, color: C.tinte, fontVariantNumeric: "tabular-nums", display: "flex", justifyContent: "space-between", gap: 6 }}>
          <span style={{ color: C.see, fontWeight: 700 }}>{n}{zeichen}</span>
          <span style={{ color: C.hellgrau }}>=</span>
          <span style={{ fontWeight: 800 }}>{n ** hoch}</span>
        </div>
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
      <details className="kr-details" style={{ marginTop: 16, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "0 14px" }}>
        <style>{`.kr-details > summary{list-style:none;cursor:pointer;padding:13px 0;font-size:14px;font-weight:600;color:${C.see}}
          .kr-details > summary::-webkit-details-marker{display:none}
          .kr-details > summary::before{content:"›";display:inline-block;margin-right:8px;transition:transform .15s}
          .kr-details[open] > summary::before{transform:rotate(90deg)}
          .kr-details[open]{padding-bottom:14px}`}</style>
        <summary>Alle Produkte von 1·1 bis 10·10 anzeigen</summary>
        <EinmaleinsSchachbrett />
      </details>
    </div>
  );
}

/* ---------- Quadrat- und Kubikzahlen ---------- */

function QuadratKubik() {
  const [modus, setModus] = useState("quadrat");
  const erzeugen = React.useCallback(() => potenzAufgabe(modus), [modus]);
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <UebersichtKopf titel="Quadratzahlen" text="Von 1² bis 25²." />
        <PotenzListe bis={25} hoch={2} />
      </div>
      <div style={{ marginBottom: 22 }}>
        <UebersichtKopf titel="Kubikzahlen" text="Von 1³ bis 10³." />
        <PotenzListe bis={10} hoch={3} />
      </div>
      <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 8 }}>Üben</p>
      <Modi liste={POTENZ_MODI} wert={modus} setWert={setModus} />
      <Schnellrechnen erzeugen={erzeugen} gruppe="Potenzen" bestSchluessel={`kr-best-pot-${modus}`} />
    </div>
  );
}

/* ---------- Bruchrechnen ---------- */

const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
const kgV = (a, b) => Math.abs(a * b) / ggT(a, b);
const kuerze = (z, n) => { const g = ggT(z, n) || 1; const s = n < 0 ? -1 : 1; return { z: (s * z) / g, n: (s * n) / g }; };
const waehle = (l) => l[zufall(0, l.length - 1)];

const BRUCH_MODI = [
  { id: "kuerzen", name: "Kürzen", kurz: "vollständig kürzen" },
  { id: "plusminus", name: "Plus & Minus", kurz: "Hauptnenner finden" },
  { id: "mal", name: "Mal", kurz: "Zähler · Zähler" },
  { id: "geteilt", name: "Geteilt", kurz: "mal Kehrwert" },
  { id: "mix", name: "Gemischt", kurz: "alles durcheinander" },
];

const BRUCH_STUFEN = [
  { id: 1, name: "Leicht" },
  { id: 2, name: "Mittel" },
  { id: 3, name: "Schwer" },
];

/* Erzeugt einen gekürzten echten Bruch mit Nenner aus der Liste. */
function echterBruch(nenner) {
  const n = waehle(nenner);
  let z = zufall(1, n - 1);
  while (ggT(z, n) !== 1) z = zufall(1, n - 1);
  return { z, n };
}

export function bruchAufgabe(modus, stufe) {
  const m = modus === "mix" ? waehle(["kuerzen", "plusminus", "mal", "geteilt"]) : modus;
  const nenner = stufe === 1 ? [2, 3, 4, 5, 6, 8, 10] : stufe === 2 ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 12] : [3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 18, 20];

  if (m === "kuerzen") {
    const b = echterBruch(stufe === 1 ? [2, 3, 4, 5, 6] : stufe === 2 ? [3, 4, 5, 6, 7, 8, 9] : [5, 7, 8, 9, 11, 12, 13]);
    const k = stufe === 1 ? zufall(2, 5) : stufe === 2 ? zufall(3, 9) : waehle([6, 8, 9, 12, 14, 15, 16, 18]);
    const g = k;
    return { a: { z: b.z * k, n: b.n * k }, op: null, loes: b, weg: `ggT(${b.z * k}; ${b.n * k}) = ${g} → Zähler und Nenner durch ${g} teilen.` };
  }

  let a = echterBruch(nenner), b = echterBruch(nenner);
  if (stufe === 1 && m === "plusminus") b = { z: zufall(1, a.n - 1), n: a.n };          // gleichnamig
  if (stufe === 3 && Math.random() < 0.5) a = { z: a.z + a.n * zufall(1, 2), n: a.n };  // unechter Bruch

  if (m === "plusminus") {
    let minus = Math.random() < 0.5;
    if (minus && a.z / a.n < b.z / b.n) [a, b] = [b, a];
    if (minus && a.z * b.n === b.z * a.n) minus = false;
    const hn = kgV(a.n, b.n);
    const za = a.z * (hn / a.n), zb = b.z * (hn / b.n);
    const loes = kuerze(minus ? za - zb : za + zb, hn);
    const erw = a.n === b.n ? "Gleiche Nenner: nur die Zähler verrechnen." : `Hauptnenner ${hn}: ${za}/${hn} ${minus ? "−" : "+"} ${zb}/${hn}.`;
    const erg = (minus ? za - zb : za + zb);
    const kz = ggT(erg, hn) > 1 ? ` = ${erg}/${hn}, gekürzt ${loes.n === 1 ? loes.z : `${loes.z}/${loes.n}`}.` : ` = ${erg}/${hn}.`;
    return { a, b, op: minus ? "−" : "+", loes, weg: erw + kz };
  }
  if (m === "mal") {
    const loes = kuerze(a.z * b.z, a.n * b.n);
    const roh = `${a.z * b.z}/${a.n * b.n}`, lt = loes.n === 1 ? `${loes.z}` : `${loes.z}/${loes.n}`;
    return { a, b, op: "·", loes, weg: `Zähler mal Zähler, Nenner mal Nenner: ${roh}${roh === lt ? "" : ` → gekürzt ${lt}. Tipp: vorher über Kreuz kürzen`}.` };
  }
  const loes = kuerze(a.z * b.n, a.n * b.z);
  const roh = `${a.z * b.n}/${a.n * b.z}`, lt = loes.n === 1 ? `${loes.z}` : `${loes.z}/${loes.n}`;
  return { a, b, op: ":", loes, weg: `Mit dem Kehrwert multiplizieren: ${a.z}/${a.n} · ${b.n}/${b.z} = ${roh}${roh === lt ? "" : ` → gekürzt ${lt}`}.` };
}

/* Gesetzter Bruch */
function Bruch({ z, n, gross = 40, farbe = C.weiss }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle",
      margin: "0 4px", lineHeight: 1.05, fontSize: gross, fontWeight: 800, color: farbe }}>
      <span style={{ padding: "0 6px" }}>{z}</span>
      <span style={{ alignSelf: "stretch", height: Math.max(3, gross / 13), background: farbe, borderRadius: 2, margin: "3px 0" }} />
      <span style={{ padding: "0 6px" }}>{n}</span>
    </span>
  );
}

function BruchZahlenfeld({ onZiffer, onLoeschen, onWechsel, onOk, gesperrt }) {
  const taste = (inhalt, onClick, art, span) => (
    <button key={String(inhalt)} onClick={onClick} disabled={gesperrt} className="kr-taste"
      style={{ gridColumn: span ? `span ${span}` : undefined, height: 54, borderRadius: 14, fontFamily: "inherit",
        cursor: gesperrt ? "default" : "pointer", fontSize: art === "ok" ? 18 : art === "wechsel" ? 14 : 24, fontWeight: 700,
        border: `1px solid ${art === "ok" ? C.smaragd : art === "nav" || art === "wechsel" ? C.seeTief : C.linie}`,
        background: art === "ok" ? C.smaragd : art === "nav" || art === "wechsel" ? C.seeTief : C.weiss,
        color: art === "ok" ? C.weiss : art === "nav" || art === "wechsel" ? C.flaggold : C.tinte,
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
      {taste("Zähler ⇅ Nenner", onWechsel, "wechsel")}
      {taste("OK", onOk, "ok", 3)}
    </div>
  );
}

const BRUCH_RUNDE = 10;

function BruchRunde({ modus, stufe }) {
  const erzeugen = () => bruchAufgabe(modus, stufe);
  const [nr, setNr] = useState(0);
  const [auf, setAuf] = useState(erzeugen);
  const [z, setZ] = useState("");
  const [n, setN] = useState("");
  const [feld, setFeld] = useState("z");
  const [rueck, setRueck] = useState(null);          // null | richtig | falsch | kuerzen
  const [richtig, setRichtig] = useState(0);
  const [serie, setSerie] = useState(0);
  const [start, setStart] = useState(() => Date.now());
  const [aufgStart, setAufgStart] = useState(() => Date.now());
  const [fertig, setFertig] = useState(null);
  const [fehler, setFehler] = useState([]);
  const schluessel = `kr-best-bruch-${modus}-${stufe}`;
  const [best, setBest] = useState(() => { try { return JSON.parse(localStorage.getItem(schluessel) || "null"); } catch { return null; } });
  const timer = useRef(null);

  const neueRunde = () => {
    clearTimeout(timer.current);
    setNr(0); setAuf(erzeugen()); setZ(""); setN(""); setFeld("z"); setRueck(null); setRichtig(0); setSerie(0);
    setStart(Date.now()); setAufgStart(Date.now()); setFertig(null); setFehler([]);
    try { setBest(JSON.parse(localStorage.getItem(schluessel) || "null")); } catch { setBest(null); }
  };
  useEffect(neueRunde, [modus, stufe]);  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timer.current), []);

  const weiter = (warRichtig) => {
    const k = nr + 1;
    if (k >= BRUCH_RUNDE) {
      const sek = Math.round((Date.now() - start) / 100) / 10;
      const erg = { richtig: richtig + (warRichtig ? 1 : 0), sek };
      setFertig(erg);
      if (!best || erg.richtig > best.richtig || (erg.richtig === best.richtig && sek < best.sek)) {
        setBest(erg);
        try { localStorage.setItem(schluessel, JSON.stringify(erg)); } catch { /* optional */ }
      }
      return;
    }
    setNr(k); setAuf(erzeugen()); setZ(""); setN(""); setFeld("z"); setRueck(null); setAufgStart(Date.now());
  };

  const pruefen = () => {
    if (fertig || (rueck && rueck !== "kuerzen")) return;
    if (z === "") return;
    const ez = Number(z), en = n === "" ? 1 : Number(n);
    if (en === 0) { setRueck("null"); return; }
    const sekunden = Math.round((Date.now() - aufgStart) / 100) / 10;
    const wertGleich = ez * auf.loes.n === en * auf.loes.z;
    const gekuerzt = ggT(ez, en) === 1;
    if (wertGleich && !gekuerzt) { setRueck("kuerzen"); return; }   // nochmal versuchen, zählt nicht als Fehler
    const ok = wertGleich && gekuerzt;
    try { merken({ gruppe: "Bruchrechnen", richtig: ok, sekunden, fehlerart: ok ? null : "rechnen" }); } catch { /* optional */ }
    setRueck(ok ? "richtig" : "falsch");
    if (ok) { setRichtig((r) => r + 1); setSerie((s) => s + 1); timer.current = setTimeout(() => weiter(true), 650); }
    else { setSerie(0); setFehler((l) => [...l, { ...auf, eingabe: n === "" || n === "1" ? z : `${z}/${n}` }]); }
  };

  const ziffer = (d) => {
    if (rueck && rueck !== "kuerzen" && rueck !== "null") return;
    if (rueck) setRueck(null);
    if (feld === "z") setZ((v) => (v.length >= 4 ? v : v + d)); else setN((v) => (v.length >= 4 ? v : v + d));
  };
  const loeschen = () => {
    if (rueck && rueck !== "kuerzen" && rueck !== "null") return;
    if (rueck) setRueck(null);
    if (feld === "n") { if (n === "") setFeld("z"); else setN((v) => v.slice(0, -1)); }
    else setZ((v) => v.slice(0, -1));
  };
  const wechsel = () => setFeld((f) => (f === "z" ? "n" : "z"));

  useEffect(() => {
    const taste = (e) => {
      if (/^[0-9]$/.test(e.key)) ziffer(e.key);
      else if (e.key === "Backspace") loeschen();
      else if (e.key === "/" || e.key === "Tab" || e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); wechsel(); }
      else if (e.key === "Enter") { if (rueck === "falsch") weiter(false); else pruefen(); }
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  });

  const karte = { background: C.weiss, borderRadius: 18, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
  const bText = (b) => (b.n === 1 ? `${b.z}` : `${b.z}/${b.n}`);

  if (fertig) {
    const quote = Math.round((fertig.richtig / BRUCH_RUNDE) * 100);
    return (
      <div style={karte}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 6 }}>Runde geschafft</p>
        <p style={{ fontSize: 44, fontWeight: 800, color: C.tinte, lineHeight: 1.1 }}>
          {fertig.richtig} <span style={{ fontSize: 22, color: C.grau, fontWeight: 600 }}>von {BRUCH_RUNDE}</span>
        </p>
        <p style={{ fontSize: 15, color: C.grau, marginTop: 6 }}>
          in {String(fertig.sek).replace(".", ",")} s · {quote} %
          {best && <span style={{ marginLeft: 8, color: C.see }}>· Bestwert {best.richtig}/{BRUCH_RUNDE} in {String(best.sek).replace(".", ",")} s</span>}
        </p>
        <p style={{ fontSize: 15, fontWeight: 600, color: quote === 100 ? C.smaragd : C.tinte, marginTop: 14 }}>
          {quote === 100 ? "Fehlerfrei! 🎉" : quote >= 80 ? "Stark — Brüche sitzen." : quote >= 50 ? "Gute Basis, weiter üben." : "Dranbleiben — Schritt für Schritt wird’s sicher."}
        </p>
        {fehler.length > 0 && (
          <div style={{ marginTop: 14, background: C.sand, borderRadius: 12, padding: "10px 14px" }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, marginBottom: 6 }}>Nochmal anschauen</p>
            {fehler.map((f, i) => (
              <p key={i} style={{ fontSize: 14.5, color: C.tinte, marginBottom: 4, lineHeight: 1.5 }}>
                {f.op ? `${bText(f.a)} ${f.op} ${bText(f.b)}` : `${bText(f.a)} kürzen`} = <b>{bText(f.loes)}</b>
                <span style={{ color: C.signal, fontSize: 13, marginLeft: 6 }}>(du: {f.eingabe})</span>
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

  const rahmen = rueck === "richtig" ? C.smaragd : rueck === "falsch" ? C.signal : rueck ? C.flaggold : C.see;
  const feldStil = (aktiv) => ({
    minWidth: 66, height: 50, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 30, fontWeight: 800, color: C.tinte, cursor: "pointer",
    border: `2px ${aktiv && !(rueck === "richtig" || rueck === "falsch") ? "solid" : "dashed"} ${aktiv ? rahmen : C.linie}`,
    background: aktiv ? C.weiss : C.sand, padding: "0 10px",
  });

  return (
    <div style={karte}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, display: "flex", gap: 4 }}>
          {Array.from({ length: BRUCH_RUNDE }, (_, i) => (
            <span key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < nr ? C.see : i === nr ? C.flaggold : C.linie }} />
          ))}
        </div>
        <span style={{ fontSize: 12.5, color: C.grau, whiteSpace: "nowrap" }}>{nr + 1} / {BRUCH_RUNDE}</span>
        {serie >= 3 && <span style={{ fontSize: 12.5, fontWeight: 700, color: C.gruen, whiteSpace: "nowrap" }}>🔥 {serie}</span>}
      </div>

      <style>{GLEICHUNG_CSS}</style>
      <div className="kr-gleichung">
      {/* Aufgabe: rechtsbündig, endet mit „=“. Beide Blöcke gleich hoch und vertikal zentriert,
          dadurch liegen die Bruchstriche von Aufgabe und Eingabe auf derselben Höhe. */}
      <div className="kr-aufgabe" style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 16,
        padding: "14px 16px", gap: 6, flexWrap: "nowrap" }}>
        {!auf.op && <span style={{ color: C.goldText, fontSize: 15, fontWeight: 600, marginRight: 6 }}>Kürze</span>}
        <Bruch z={auf.a.z} n={auf.a.n} />
        {auf.op && <span style={{ color: C.flaggold, fontSize: 34, fontWeight: 800, margin: "0 4px" }}>{auf.op}</span>}
        {auf.op && <Bruch z={auf.b.z} n={auf.b.n} />}
        <span style={{ color: C.goldText, fontSize: 34, fontWeight: 700, marginLeft: 6 }}>=</span>
      </div>

      {/* Eingabe als Bruch */}
      <div className="kr-eingabe" style={{ border: `2.5px solid ${rahmen}`, borderRadius: 14, padding: "10px 14px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12, transition: "all .15s",
        background: rueck === "richtig" ? "#EEF8F2" : rueck === "falsch" ? "#FBEFEA" : C.weiss }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div onClick={() => setFeld("z")} style={feldStil(feld === "z")}>{z || <span style={{ color: C.hellgrau, fontSize: 18 }}>Zähler</span>}</div>
          <div style={{ alignSelf: "stretch", height: 4, background: C.tinte, borderRadius: 2, margin: "6px 0" }} />
          <div onClick={() => setFeld("n")} style={feldStil(feld === "n")}>{n || <span style={{ color: C.hellgrau, fontSize: 18 }}>Nenner</span>}</div>
        </div>
        {rueck === "richtig" && <span style={{ fontSize: 30, color: C.smaragd, fontWeight: 800 }}>✓</span>}
        {rueck === "falsch" && (
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: C.signal, fontWeight: 700 }}>
            ✗ <Bruch z={auf.loes.z} n={auf.loes.n} gross={26} farbe={C.signal} />
          </span>
        )}
      </div>
      </div>

      <div style={{ minHeight: 20, margin: "6px 2px 12px" }}>
        {rueck === "kuerzen" && <p style={{ fontSize: 13.5, color: C.gruenDunkel, fontWeight: 600 }}>Der Wert stimmt — aber noch nicht vollständig gekürzt.</p>}
        {rueck === "null" && <p style={{ fontSize: 13.5, color: C.signal, fontWeight: 600 }}>Der Nenner darf nicht 0 sein.</p>}
        {rueck === "falsch" && <p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.55 }}><b>So geht’s:</b> {auf.weg}</p>}
        {!rueck && <p style={{ fontSize: 12, color: C.hellgrau, textAlign: "center" }}>
          {best ? `Bestwert: ${best.richtig}/${BRUCH_RUNDE} in ${String(best.sek).replace(".", ",")} s · ` : ""}Ergebnis vollständig gekürzt eingeben. Ganze Zahl: Nenner leer lassen.
        </p>}
      </div>

      {rueck === "falsch" ? (
        <button onClick={() => weiter(false)}
          style={{ width: "100%", height: 54, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit",
            fontSize: 17, fontWeight: 700, color: C.weiss, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` }}>
          Weiter →
        </button>
      ) : (
        <BruchZahlenfeld gesperrt={rueck === "richtig"} onZiffer={ziffer} onLoeschen={loeschen} onWechsel={wechsel} onOk={pruefen} />
      )}
    </div>
  );
}

function Bruchrechnen() {
  const [modus, setModus] = useState("kuerzen");
  const [stufe, setStufe] = useState(1);
  return (
    <div>
      <Modi liste={BRUCH_MODI} wert={modus} setWert={setModus} />
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <span style={{ fontSize: 12.5, color: C.grau, marginRight: 4 }}>Stufe</span>
        {BRUCH_STUFEN.map((s) => (
          <button key={s.id} onClick={() => setStufe(s.id)}
            style={{ height: 30, padding: "0 12px", borderRadius: 999, fontFamily: "inherit", cursor: "pointer", fontSize: 12.5, fontWeight: 600,
              border: `1px solid ${stufe === s.id ? C.gruen : C.linie}`, background: stufe === s.id ? C.gruen : C.weiss,
              color: stufe === s.id ? C.weiss : C.tinte }}>{s.name}</button>
        ))}
      </div>
      <BruchRunde modus={modus} stufe={stufe} />
      <div style={{ marginTop: 16, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "12px 14px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.see, marginBottom: 6 }}>Die Regeln auf einen Blick</p>
        {[
          ["Kürzen", "Zähler und Nenner durch dieselbe Zahl teilen — am schnellsten durch den ggT."],
          ["Plus & Minus", "Erst auf den Hauptnenner (kgV der Nenner) erweitern, dann nur die Zähler verrechnen."],
          ["Mal", "Zähler mal Zähler, Nenner mal Nenner. Vorher über Kreuz kürzen spart Arbeit."],
          ["Geteilt", "Durch einen Bruch teilen heißt: mit seinem Kehrwert multiplizieren."],
        ].map(([t, s]) => (
          <p key={t} style={{ fontSize: 13, color: C.grau, lineHeight: 1.55, marginBottom: 4 }}><b style={{ color: C.tinte }}>{t}:</b> {s}</p>
        ))}
      </div>
    </div>
  );
}

/* ---------- Übersicht ---------- */

const TRAINER = [
  { id: "primfaktoren", titel: "Primfaktorzerlegung", kurz: "Primzahl erkennen oder vollständig zerlegen — jeden Faktor einzeln.", zeichen: "2·3·7" },
  { id: "potenzen", titel: "Quadrat- und Kubikzahlen", kurz: "Quadrat- und Kubikzahlen sowie ihre Wurzeln blitzschnell abrufen.", zeichen: "12²" },
  { id: "bruchrechnen", titel: "Bruchrechnen", kurz: "Kürzen, Plus, Minus, Mal und Geteilt — mit Lösungsweg bei jedem Fehler.", zeichen: "¾" },
  { id: "einmaleins", titel: "EinMalEins", kurz: "Kleines und großes Einmaleins, auch als Umkehraufgaben — auf Zeit.", zeichen: "7·8" },
];

export function KopfrechenZentrum() {
  const [offen, setOffen] = useState(null);
  const t = offen ? TRAINER.find((x) => x.id === offen) : null;

  if (!t) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
          Zahlen, die einfach sitzen
        </h2>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
          Vier Trainer für das Kopfrechnen. Wer Zahlen sofort abrufen kann, kürzt schneller, sieht Teiler auf einen
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
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <button onClick={() => setOffen(null)} className="mb-5"
        style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
        ← Kopfrechnen
      </button>
      <h2 style={{ fontSize: 25, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>{t.titel}</h2>
      {t.id === "primfaktoren" ? <Primfaktoren /> : t.id === "potenzen" ? <QuadratKubik /> : t.id === "bruchrechnen" ? <Bruchrechnen /> : <EinMalEins />}
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
  { ansicht: "sinus", titel: "Sinusfunktion", kurz: "Parameter a, b, c und d finden, bis der Graph passt – mit Periode, Ableitung und Nullstellen.", zeichen: "∿" },
  { ansicht: "ableitungstrainer", titel: "Ableitungstrainer", kurz: "f′, f″ und f‴ per Tastenfeld eingeben und sofort prüfen lassen.", zeichen: "f′" },
];

export function AnalysisZentrum({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Funktionen sehen, verstehen, ableiten
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
        Vier Werkzeuge für die Analysis: Graphen live erkunden, komplette Kurvendiskussionen erzeugen,
        Sinusfunktionen anpassen und das Ableiten trainieren.
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
