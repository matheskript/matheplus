/* ============================================================
   KopfrechenZentrum — Übersicht mit drei Trainern:
   Primfaktorzerlegung (vorhanden, aus func5), Quadrat- und Kubikzahlen,
   Bruchrechnen und Multiplizieren (inkl. Einmaleins). Die beiden neuen Trainer teilen sich einen Schnellrechen-
   Baustein: Runde mit 10 Aufgaben, großes Zahlenfeld, sofortige
   Rückmeldung, Serie, Zeit und Bestwert.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { GesperrteKurse } from "./func1.jsx";
import { Primfaktoren, merken } from "./func5.jsx";
import { SchriftlichPlusMinus, SchriftlicheDivision } from "./funcSchriftlich.jsx";

const zufall = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const HOCH = { 2: "²", 3: "³" };

/* ---------- Aufgaben-Erzeuger ---------- */

/* Reihenfolge = Raster mit drei Spalten: oben Zahlen + Mix, unten die Wurzeln */
const POTENZ_MODI = [
  { id: "quadrat", name: "Quadrat\u00ADzahlen" },
  { id: "kubik", name: "Kubik\u00ADzahlen" },
  { id: "mix", name: "Mix" },
  { id: "wurzel", name: "√ ≤ 25²", aria: "Quadratwurzeln bis 625" },
  { id: "kwurzel", name: "∛ ≤ 10³", aria: "Kubikwurzeln bis 1000" },
  { id: "wurzel10k", name: "√10k", aria: "Quadratwurzeln bis 10 000", gold: true },
];

function potenzAufgabe(modus) {
  const m = modus === "mix" ? ["quadrat", "kubik", "wurzel", "kwurzel"][zufall(0, 3)] : modus;
  if (m === "quadrat") { const n = zufall(2, 25); return { text: `${n}²`, loesung: n * n }; }
  if (m === "kubik") { const n = zufall(2, 10); return { text: `${n}³`, loesung: n ** 3 }; }
  if (m === "wurzel") { const n = zufall(2, 25); return { text: `√${n * n}`, loesung: n }; }
  // Quadratwurzeln bis 10 000: überwiegend aus dem neuen Bereich 26–100, ab und zu kleinere
  if (m === "wurzel10k") { const n = Math.random() < 0.85 ? zufall(26, 100) : zufall(11, 25); return { text: `√${n * n}`, loesung: n }; }
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

function Schnellrechnen({ erzeugen, gruppe, bestSchluessel, maxLaenge = 6 }) {
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
      if (/^[0-9]$/.test(e.key)) setEingabe((v) => (rueck || v.length >= maxLaenge ? v : v + e.key));
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
          <p style={{ color: C.weiss, fontSize: aufgabe.text.length > 9 ? "clamp(24px, 7.2vw, 40px)" : "clamp(34px, 9vw, 44px)", fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.1, whiteSpace: "nowrap" }}>
            {aufgabe.text} <span style={{ color: C.goldText, fontWeight: 600 }}>=</span>
          </p>
        </div>

        {/* Eingabe */}
        <div className="kr-eingabe" style={{ border: `2.5px solid ${farbe}`, borderRadius: 14, minHeight: 64,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap", padding: "6px 8px",
          background: rueck === "richtig" ? "#EEF8F2" : rueck === "falsch" ? "#FBEFEA" : C.weiss, transition: "all .15s" }}>
          <span style={{ fontSize: eingabe.length > 6 ? 28 : 34, fontWeight: 800, color: C.tinte, minWidth: 20 }}>{eingabe || <span style={{ color: C.hellgrau }}>?</span>}</span>
          {rueck === "richtig" && <span style={{ fontSize: 26, color: C.smaragd, fontWeight: 800 }}>✓</span>}
          {rueck === "falsch" && <span style={{ fontSize: 17, color: C.signal, fontWeight: 700 }}>✗ richtig: {aufgabe.loesung}</span>}
        </div>
      </div>
      <p style={{ fontSize: 12, color: C.hellgrau, textAlign: "center", marginBottom: 12, minHeight: 16 }}>
        {best ? `Bestwert: ${best.richtig}/${RUNDE} in ${String(best.sek).replace(".", ",")} s` : "Tippe die Lösung ein und drücke OK."}
      </p>

      <Zahlenfeld gesperrt={!!rueck}
        onZiffer={(z) => setEingabe((v) => (v.length >= maxLaenge ? v : v + z))}
        onLoeschen={() => setEingabe((v) => v.slice(0, -1))}
        onOk={pruefen} />
    </div>
  );
}

/* Modus-Leiste (Chips) */
function Modi({ liste, wert, setWert, kompakt }) {
  if (kompakt) return (
    // Nur die Namen, alle nebeneinander sichtbar (ohne Unterzeile, ohne Scrollen)
    <div style={{ display: "flex", gap: "clamp(3px, 1vw, 6px)", marginBottom: 14 }}>
      {liste.map((m) => (
        <button key={m.id} onClick={() => setWert(m.id)}
          style={{ flex: "1 1 auto", padding: "8px clamp(3px, 1.2vw, 12px)", borderRadius: 999, fontFamily: "inherit", cursor: "pointer",
            border: `1px solid ${wert === m.id ? C.see : C.linie}`, background: wert === m.id ? C.see : C.weiss,
            color: wert === m.id ? C.weiss : C.see, fontSize: "clamp(10.5px, 3vw, 13.5px)", fontWeight: 600, lineHeight: 1.2, whiteSpace: "nowrap" }}>
          {m.name}
        </button>
      ))}
    </div>
  );
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

/* Potenzen untereinander: eine Spalte je Zehnerblock. Die erste Spalte (1–10) ist breit und groß,
   die weiteren Zehnerschritte stehen schmaler daneben. */
function PotenzSpalten({ hoch, bloecke }) {
  const zeichen = hoch === 2 ? "²" : "³";
  const breiten = bloecke.map((_, i) => (i === 0 ? "2fr" : "1fr")).join(" ");
  return (
    <div style={{ display: "grid", gridTemplateColumns: breiten, gap: 8 }}>
      {bloecke.map(([von, bis], b) => {
        const gross = b === 0;
        return (
          <div key={von} style={{ background: gross ? C.himmel : C.weiss, border: `1px solid ${C.linie}`, borderRadius: 12,
            padding: gross ? "6px 12px" : "6px 8px", minWidth: 0 }}>
            {Array.from({ length: bis - von + 1 }, (_, i) => von + i).map((n, i) => (
              <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4,
                height: 34, borderTop: i ? `1px solid ${C.linie}` : "none",
                fontSize: gross ? "clamp(15px, 4.4vw, 18px)" : "clamp(11.5px, 3.3vw, 14px)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                <span style={{ color: C.see, fontWeight: 700 }}>{n}{zeichen}</span>
                {gross && <span style={{ color: C.hellgrau }}>=</span>}
                <span style={{ fontWeight: 800, color: C.tinte }}>{n ** hoch}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Quadrat- und Kubikzahlen ---------- */

/* Übungsarten als Raster 3 × 2; „Wurzel 10k“ in Schwarz-Gold */
function PotenzModi({ wert, setWert, ids }) {
  const GOLD_VERLAUF = "linear-gradient(180deg,#FFE58A 0%,#EDBB00 45%,#E2B53C 70%,#A67C00 100%)";
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${ids && ids.length === 4 ? 2 : 3}, minmax(0, 1fr))`, gap: 6, marginBottom: 14 }}>
      {POTENZ_MODI.filter((m) => !ids || ids.includes(m.id)).map((m) => {
        const an = wert === m.id;
        const stil = m.gold
          ? { border: "1px solid #EDBB00", background: an ? GOLD_VERLAUF : "radial-gradient(130% 150% at 90% 10%, #2A2210 0%, #0E0C08 55%, #050404 100%)",
              color: an ? "#0E0C08" : "#EDBB00", boxShadow: an ? "0 4px 14px rgba(237,187,0,0.35)" : "0 3px 10px rgba(0,0,0,0.25)" }
          : { border: `1px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see };
        return (
          <button key={m.id} onClick={() => setWert(m.id)} aria-label={m.aria} title={m.aria}
            lang="de" style={{ minHeight: 46, padding: "6px 4px", borderRadius: 14, fontFamily: "inherit", cursor: "pointer", textAlign: "center",
              hyphens: "manual", WebkitHyphens: "manual",
              fontSize: m.aria ? "clamp(15px, 4.4vw, 18px)" : "clamp(11px, 3.3vw, 13.5px)", fontWeight: m.gold ? 800 : 700, lineHeight: 1.2, whiteSpace: m.aria ? "nowrap" : undefined, ...stil }}>
            {m.name}
          </button>
        );
      })}
    </div>
  );
}

/* art: "quadrat" | "kubik" | "wurzel" – jede Kopfrechen-Kachel öffnet ihren Teil; ohne art alles wie bisher */
const POTENZ_GRUPPEN = { quadrat: ["quadrat"], kubik: ["kubik"], wurzel: ["wurzel", "kwurzel", "wurzel10k", "mix"] };
function QuadratKubik({ art }) {
  const ids = art ? POTENZ_GRUPPEN[art] : null;
  const [modus, setModus] = useState(ids ? ids[0] : "quadrat");
  const erzeugen = React.useCallback(() => potenzAufgabe(modus), [modus]);
  return (
    <div>
      <style>{`.kr-details > summary{list-style:none;cursor:pointer;padding:13px 0;font-size:15px;font-weight:700;color:${C.see}}
        .kr-details > summary::-webkit-details-marker{display:none}
        .kr-details > summary::before{content:"›";display:inline-block;margin-right:8px;transition:transform .15s}
        .kr-details[open] > summary::before{transform:rotate(90deg)}
        .kr-details[open]{padding-bottom:14px}`}</style>
      {art !== "kubik" && <details className="kr-details" style={{ marginBottom: 10, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "0 14px" }}>
        <summary>Quadratzahlen · 1² bis 30²</summary>
        <PotenzSpalten hoch={2} bloecke={[[1, 10], [11, 20], [21, 30]]} />
      </details>}
      {art !== "quadrat" && <details className="kr-details" style={{ marginBottom: 22, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "0 14px" }}>
        <summary>Kubikzahlen · 1³ bis 20³</summary>
        <PotenzSpalten hoch={3} bloecke={[[1, 10], [11, 20]]} />
      </details>}
      {art === "quadrat" && <div style={{ height: 12 }} />}
      <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 8 }}>Üben</p>
      {(!ids || ids.length > 1) && <PotenzModi wert={modus} setWert={setModus} ids={ids} />}
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
      <Modi kompakt liste={BRUCH_MODI} wert={modus} setWert={setModus} />
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

/* ---------- Multiplizieren im Kopf ---------- */

/* Bereiche je Faktor: kleine Zahlen fürs Einmaleins, dann beliebige zwei-, drei-, vierstellige */
const BEREICHE = [
  { id: "b5", name: "1–5" }, { id: "b10", name: "1–10" }, { id: "b20", name: "1–20" },
  { id: "d2", name: "2-stellig" }, { id: "d3", name: "3-stellig" }, { id: "d4", name: "4-stellig" },
];

/* Zufallszahl mit genau d Stellen, ohne Endziffer 0 (sonst zu leicht) */
function zahlMitStellen(d) {
  for (;;) { const n = zufall(10 ** (d - 1), 10 ** d - 1); if (n % 10 !== 0) return n; }
}

function zahlAusBereich(id) {
  if (id === "b5") return Math.random() < 0.08 ? 1 : zufall(2, 5);
  if (id === "b10") return Math.random() < 0.05 ? 1 : zufall(2, 10);
  if (id === "b20") return zufall(2, 20);
  return zahlMitStellen(Number(id.slice(1)));
}

function multiAufgabe(a, b, art) {
  const x = zahlAusBereich(a), y = zahlAusBereich(b);
  if (art === "geteilt") return { text: `${x * y} : ${x}`, loesung: y };
  return { text: `${x} · ${y}`, loesung: x * y };
}

function BereichWahl({ label, wert, setWert, farbe }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, width: 56, flexShrink: 0, paddingTop: 9 }}>{label}</span>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6 }}>
        {BEREICHE.map((m) => {
          const an = wert === m.id;
          return (
            <button key={m.id} type="button" onClick={() => setWert(m.id)} aria-pressed={an}
              style={{ height: 38, borderRadius: 999, fontFamily: "inherit", cursor: "pointer", fontSize: "clamp(11.5px, 3.3vw, 13.5px)", fontWeight: 700,
                border: `1.5px solid ${an ? farbe : C.linie}`, background: an ? farbe : C.weiss, color: an ? C.weiss : C.tinte, whiteSpace: "nowrap",
                boxShadow: an ? `0 3px 10px ${farbe}55` : "none" }}>
              {m.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Multiplizieren() {
  const [a, setA] = useState("b10");
  const [b, setB] = useState("b10");
  const [art, setArt] = useState("mal");
  const erzeugen = React.useCallback(() => multiAufgabe(a, b, art), [a, b, art]);
  const stellen = (id) => (id.startsWith("d") ? Number(id.slice(1)) : id === "b5" ? 1 : 2);
  return (
    <div>
      <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.65, marginBottom: 16 }}>
        Wähle für beide Zahlen einen Bereich – vom kleinen Einmaleins bis zu vierstelligen Zahlen. Rechne im Kopf und tippe das Ergebnis ein.
      </p>
      <BereichWahl label="1. Zahl" wert={a} setWert={setA} farbe="#F59E0B" />
      <BereichWahl label="2. Zahl" wert={b} setWert={setB} farbe="#E07A00" />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, width: 56, flexShrink: 0 }}>Aufgabe</span>
        <div role="group" aria-label="Rechenart" style={{ display: "flex", background: "#EEF2F8", borderRadius: 999, padding: 3 }}>
          {[["mal", "Malnehmen"], ["geteilt", "Umkehraufgabe"]].map(([id, name]) => (
            <button key={id} type="button" onClick={() => setArt(id)} aria-pressed={art === id}
              style={{ border: "none", borderRadius: 999, padding: "7px 14px", fontFamily: "inherit", cursor: "pointer", fontSize: 13,
                fontWeight: art === id ? 700 : 500, background: art === id ? C.weiss : "transparent", color: art === id ? C.see : C.grau,
                boxShadow: art === id ? "0 1px 6px rgba(15,26,51,0.12)" : "none" }}>{name}</button>
          ))}
        </div>
      </div>
      <Schnellrechnen erzeugen={erzeugen} gruppe="Multiplizieren" bestSchluessel={`kr-best-multi2-${a}x${b}-${art}`}
        maxLaenge={Math.max(4, stellen(a) + stellen(b))} />
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

/* ---------- Übersicht ---------- */

/* Verbindliche Anordnung (Wunsch vom 04.10.2026, 14:58 – ersetzt Punkt 15 des Entwicklungsbriefs):
   Reihe 1: Plus & Minus | Multiplizieren · Reihe 2: Primfaktoren | Quadrate, Kuben & Wurzeln ·
   Reihe 3: Schriftlich Teilen | Buchrechnung.
   „Buchrechnung" ist die wörtliche Bezeichnung aus dem Auftrag und öffnet vorerst den Bruchrechen-Trainer. */
export const TRAINER = [
  { id: "plusminus", titel: "Schriftlich Plus & Minus", kurzTitel: "Plus & Minus", slogan: "Untereinander rechnen wie im Heft – mit Übertrag.", zeichen: "+ −" },
  { id: "multiplizieren", titel: "Multiplizieren", slogan: "Vom kleinen Einmaleins bis zu vierstelligen Zahlen.", zeichen: "7·8" },
  { id: "primfaktoren", titel: "Primfaktorzerlegung", kurzTitel: "Primfaktoren", slogan: "Primzahlen erkennen und Zahlen zerlegen.", zeichen: "2·3·7" },
  { id: "potenzen", titel: "Quadrate, Kuben & Wurzeln", slogan: "Quadrat-, Kubikzahlen und Wurzeln blitzschnell abrufen.", zeichen: "12²" },
  { id: "division", titel: "Schriftlich Teilen", slogan: "Schritt für Schritt teilen – mit oder ohne Rest.", zeichen: "÷" },
  { id: "bruchrechnen", titel: "Buchrechnung", slogan: "Kürzen, plus, minus, mal, geteilt – mit Lösungsweg.", zeichen: "¾" },
];
const KOPF_REIHEN = [["plusminus", "multiplizieren"], ["primfaktoren", "potenzen"], ["division", "bruchrechnen"]];
/* Alte Kennungen (Links, Sprachwechsel) weiterhin öffnen */
const KOPF_ALT = { plus: "plusminus", minus: "plusminus", quadrate: "potenzen", kuben: "potenzen", wurzeln: "potenzen", einmaleins: "multiplizieren" };


/* Verspielte Farben je Trainer */
/* Kurze Texte für die kleinen Kacheln */
const KACHEL_TEXT = {
  plusminus: ["Plus & Minus", "Schriftlich, mit Übertrag."],
  potenzen: ["Quadrate, Kuben & Wurzeln", "Potenzen und Wurzeln."],
};

const KOPF_LOOK = {
  plusminus: { bg: "linear-gradient(150deg, #7CC8FF 0%, #1D6FD6 100%)", schatten: "rgba(29,111,214,0.32)", akzent: "#14529E", text: "#FFFFFF", r: -6 },
  minus: { bg: "linear-gradient(150deg, #8FD8FF 0%, #0E86B8 100%)", schatten: "rgba(14,134,184,0.32)", akzent: "#0A5F84", text: "#FFFFFF", r: 6 },
  multiplizieren: { bg: "linear-gradient(150deg, #FFE070 0%, #F59E0B 100%)", schatten: "rgba(245,158,11,0.35)", akzent: "#A15C00", text: "#3A2200", r: 8 },
  primfaktoren: { bg: "linear-gradient(150deg, #FF9A76 0%, #F4511E 100%)", schatten: "rgba(244,81,30,0.32)", akzent: "#B33A12", text: "#FFFFFF", r: -7 },
  potenzen: { bg: "linear-gradient(150deg, #B79CFF 0%, #6D28D9 100%)", schatten: "rgba(109,40,217,0.32)", akzent: "#5B21B6", text: "#FFFFFF", r: 6 },
  kuben: { bg: "linear-gradient(150deg, #C9B2FF 0%, #7C3AED 100%)", schatten: "rgba(124,58,237,0.32)", akzent: "#5B21B6", text: "#FFFFFF", r: -5 },
  wurzeln: { bg: "linear-gradient(150deg, #A58BFF 0%, #4C1D95 100%)", schatten: "rgba(76,29,149,0.32)", akzent: "#4C1D95", text: "#FFFFFF", r: 5 },
  division: { bg: "linear-gradient(150deg, #FF9CC9 0%, #D6336C 100%)", schatten: "rgba(214,51,108,0.32)", akzent: "#9E1F4D", text: "#FFFFFF", r: 7 },
  bruchrechnen: { bg: "linear-gradient(150deg, #4FE0CB 0%, #0F8A7E 100%)", schatten: "rgba(15,138,126,0.32)", akzent: "#0B6A61", text: "#FFFFFF", r: -5 },
};

/* Kompakte, bunte Trainer-Kacheln im 2er-Raster — für die Startseite und die Kopfrechen-Übersicht */
export function KopfKacheln({ onWaehle }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <style>{`.kopf-kachel{transition:transform .16s cubic-bezier(.2,.7,.3,1), box-shadow .16s ease}
        .kopf-kachel:active{transform:scale(0.96)}
        .kopf-karte{transition:transform .25s cubic-bezier(.3,1.6,.5,1)}
        @media (hover:hover){.kopf-kachel:hover{transform:translateY(-3px) rotate(-0.6deg)}
          .kopf-kachel:hover .kopf-karte{transform:rotate(0deg) scale(1.12)!important}}
        .kopf-kachel:active .kopf-karte{transform:rotate(0deg) scale(1.12)!important}
        @media (max-width:420px){.kopf-slogan-schmal{display:none!important}}`}</style>
      {KOPF_REIHEN.map((reihe) => (
      <div key={reihe.join("-")} className="kopf-reihe" style={{ display: "grid", gridTemplateColumns: `repeat(${reihe.length}, minmax(0, 1fr))`, gap: 10 }}>
      {reihe.map((id) => TRAINER.find((x) => x.id === id)).map((t) => {
        const f = KOPF_LOOK[t.id] || KOPF_LOOK.multiplizieren;
        const [kTitel, kText] = KACHEL_TEXT[t.id] || [t.kurzTitel || t.titel, t.slogan];
        const schmal = reihe.length >= 3;
        return (
          <button key={t.id} type="button" onClick={() => onWaehle(t.id)} aria-label={`${t.titel} öffnen`} className="kopf-kachel"
            style={{ position: "relative", minHeight: 88, borderRadius: 20, border: "none", padding: schmal ? "10px 9px 11px" : "10px 10px 11px 12px", overflow: "hidden",
              background: f.bg, color: f.text, textAlign: "left", cursor: "pointer", fontFamily: "inherit",
              boxShadow: `0 6px 18px ${f.schatten}, inset 0 0 0 1px rgba(255,255,255,0.25)`, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 5 }}>
            <span aria-hidden="true" style={{ position: "absolute", width: 90, height: 90, borderRadius: 999, right: -28, bottom: -38, background: "rgba(255,255,255,0.16)" }} />
            <span aria-hidden="true" style={{ position: "absolute", width: 34, height: 34, borderRadius: 999, left: -10, top: -12, background: "rgba(255,255,255,0.14)" }} />
            <span style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
              <span style={{ display: "block", flex: 1, minWidth: 0, fontSize: schmal ? "clamp(11px, 3.15vw, 16px)" : "clamp(13.5px, 3.9vw, 16px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.01em",
                paddingTop: 3, overflowWrap: "break-word" }}>{kTitel}</span>
              <span aria-hidden="true" className="kopf-karte"
                style={{ flexShrink: 0, padding: "3px 8px", borderRadius: 10, background: "rgba(255,255,255,0.95)",
                  color: f.akzent, fontSize: t.zeichen.length > 4 ? 13 : 16, fontWeight: 800, boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                  transform: `rotate(${f.r}deg)`, whiteSpace: "nowrap" }}>
                {t.zeichen}
              </span>
            </span>
            <span style={{ position: "relative", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              fontSize: 11.5, fontWeight: 500, lineHeight: 1.3, opacity: 0.92 }} className={schmal ? "kopf-slogan-schmal" : undefined}>{kText}</span>
          </button>
        );
      })}
      </div>
      ))}
    </div>
  );
}

export function KopfrechenZentrum({ start = null }) {
  const [offen, setOffen] = useState(KOPF_ALT[start] || start);
  const t = offen ? TRAINER.find((x) => x.id === offen) : null;

  if (!t) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
          Zahlen, die einfach sitzen
        </h2>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
          Trainer für das Kopfrechnen und schriftliche Rechnen. Wer Zahlen sofort abrufen kann, kürzt schneller, sieht Teiler auf einen
          Blick und hat beim Rechnen den Kopf für das Eigentliche frei.
        </p>
        <KopfKacheln onWaehle={(id) => { setOffen(id); window.scrollTo(0, 0); }} />
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
      {t.id === "primfaktoren" ? <Primfaktoren />
        : t.id === "potenzen" ? <QuadratKubik />
        : t.id === "bruchrechnen" ? <Bruchrechnen />
        : t.id === "plusminus" ? <SchriftlichPlusMinus Zahlenfeld={Zahlenfeld} />
        : t.id === "division" ? <SchriftlicheDivision Zahlenfeld={Zahlenfeld} /> : <Multiplizieren />}
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
  { ansicht: "plotter", titel: "Polynomplotter", slogan: "Graph mit f′ und f″ live – mit Kurvendiskussion und PDF.", kurz: "Koeffizienten einstellen, Graph mit f′ und f″ live sehen — inklusive Kurvendiskussion und PDF.", zeichen: "ax³" },
  { ansicht: "advplotter", titel: "Advanced Plotter", slogan: "Beliebige Funktionen untersuchen – sin, ln, eˣ.", kurz: "Beliebige Funktionen mit sin, cos, ln, eˣ, Wurzeln und Brüchen bauen und untersuchen.", zeichen: "sin" },
  { ansicht: "sinus", titel: "Sinusfunktion", slogan: "a, b, c und d finden, bis der Graph passt.", kurz: "Parameter a, b, c und d finden, bis der Graph passt – mit Periode, Ableitung und Nullstellen.", zeichen: "∿" },
  { ansicht: "steckbrief", titel: "Steckbriefaufgaben", kurzTitel: "Steckbriefe", slogan: "Aus Hochpunkt, Wendepunkt & Co. die Funktion bauen.", kurz: "Bedingungen aufstellen, einsetzen, LGS lösen – mit Schaubild als Probe.", zeichen: "f(?)" },
  { ansicht: "ableitungstrainer", titel: "Ableitungstrainer", slogan: "f′, f″ und f‴ eingeben und sofort prüfen lassen.", kurz: "f′, f″ und f‴ per Tastenfeld eingeben und sofort prüfen lassen.", zeichen: "f′" },
  { ansicht: "integrale", titel: "Integrale", slogan: "Stammfunktionen bilden und bestimmte Integrale berechnen.", zeichen: "∫" },
  { ansicht: "optimierung", titel: "Optimierungswerkstatt", kurzTitel: "Optimierung", slogan: "Vom Text zur Zielfunktion – Schachtel, Fläche, eigener Ansatz.", zeichen: "max" },
  { ansicht: "wachstum", titel: "Wachstum und Logarithmen", kurzTitel: "Wachstum", slogan: "Exponentielle Modelle, Halbwertszeiten und Logarithmen.", zeichen: "aᵗ" },
  { ansicht: "scharen", titel: "Funktionsscharen", slogan: "Parameter per Regler verändern, Punkte und Ortskurven berechnen.", zeichen: "fₐ" },
];

export function AnalysisZentrum({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 className="intro-h2" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        <span className="titel-lang">Funktionen sehen, verstehen, ableiten</span><span className="titel-kurz">Kurven live erleben</span>
      </h2>
      <p className="intro-p" style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
        <span className="titel-lang">Werkzeuge für die Analysis: Graphen live erkunden, komplette Kurvendiskussionen erzeugen,
        Sinusfunktionen anpassen, Funktionen aus Steckbriefen bestimmen, das Ableiten trainieren und integrieren.</span>
        <span className="titel-kurz">Dreh an den Reglern und sieh sofort, was passiert. Mit jeder Ableitung wirst du schneller!</span>
      </p>
      {ANALYSIS.map((x) => (
        <button key={x.ansicht} onClick={() => gehe({ ansicht: x.ansicht })} className="w-full mb-3"
          style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 18,
            textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: C.tinte, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
          <span aria-hidden="true" style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 15,
            background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.flaggold,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, fontStyle: "italic" }}>
            {x.zeichen}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: "clamp(15px, 4.4vw, 17.5px)", fontWeight: 600, lineHeight: 1.25, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.kurzTitel ? <><span className="titel-lang">{x.titel}</span><span className="titel-kurz">{x.kurzTitel}</span></> : x.titel}</span>
            <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.8em", color: C.grau, fontSize: 13.5, fontWeight: 300, lineHeight: 1.4 }}>{x.slogan || x.kurz}</span>
          </span>
        </button>
      ))}
      <GesperrteKurse ids={["analysis1", "analysis2", "analysis3", "analysis4", "analysis5"]} ueberschrift="Die fünf Analysis-Kurse" />
    </div>
  );
}
