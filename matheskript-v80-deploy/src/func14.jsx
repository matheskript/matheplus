/* ============================================================
   KopfrechenZentrum — Übersicht mit drei Trainern:
   Primfaktorzerlegung (vorhanden, aus func5), Quadrat- und Kubikzahlen,
   Bruchrechnen und Multiplizieren (inkl. Einmaleins). Die beiden neuen Trainer teilen sich einen Schnellrechen-
   Baustein: Runde mit 10 Aufgaben, großes Zahlenfeld, sofortige
   Rückmeldung, Serie, Zeit und Bestwert.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useRef, useState } from "react";
import { ZentrumListe } from "./funcWerkzeuge.jsx";
import { MS } from "./mathText.jsx";
import { MitWurzeln } from "./wurzelZeichen.jsx";
const bT = (z, n) => (n === 1 ? `${z}` : `$\\frac{${z}}{${n}}$`);
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { GesperrteKurse } from "./func1.jsx";
import { Primfaktoren, merken } from "./func5.jsx";
import { SchriftlichPlusMinus, SchriftlicheDivision } from "./funcSchriftlich.jsx";
import { ErklaerAnimation } from "./funcErklaeranimation.jsx";
import { wegPrimzahl } from "./kopfWeg.js";

import { springe } from "./sprung.js";
import { KopfrechnenKopf, KopfKarte, KARTEN_CSS } from "./funcKopfrechnenKopf.jsx";
import { useKopfEinstellungen, RundenStart, Vollbild, Ergebnis, AufgabenKarte, StartKnopf, ZweitKnopf, useTimer, GOLD_PILLE, NACHT_VERLAUF } from "./kopfTraining.jsx";
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
export const GLEICHUNG_CSS = `
  .kr-gleichung{display:flex;align-items:stretch;gap:16px;margin-bottom:6px}
  .kr-gleichung > *{flex:1 1 auto;min-width:0}
  .kr-aufgabe{display:flex;align-items:center;justify-content:center;text-align:center}
  .kr-eingabe{min-width:150px}
  @media (max-width:560px){
    .kr-gleichung{flex-direction:column;gap:12px}
    .kr-eingabe{min-width:0}
  }`;

/* ---------- Schnellrechen-Baustein ---------- */

export function Zahlenfeld({ onZiffer, onLoeschen, onOk, gesperrt, labelLoeschen, labelOk, turbo = false }) {
  const taste = (inhalt, onClick, art, label) => (
    <button key={String(inhalt)} onClick={onClick} disabled={gesperrt} className="kr-taste" type="button" aria-label={label}
      style={{ height: "clamp(44px, 7.2vh, 60px)", borderRadius: 14, fontFamily: "inherit", cursor: gesperrt ? "default" : "pointer",
        fontSize: art === "ok" ? 18 : 24, fontWeight: 700, letterSpacing: art === "ok" ? "0.04em" : 0,
        border: `1px solid ${art === "ok" ? (turbo ? C.linie : C.smaragd) : art === "nav" ? C.seeTief : C.linie}`,
        background: art === "ok" ? (turbo ? C.weiss : C.smaragd) : art === "nav" ? C.seeTief : C.weiss,
        color: art === "ok" ? (turbo ? C.smaragd : C.weiss) : art === "nav" ? C.flaggold : C.tinte,
        boxShadow: art === "ok" && !turbo ? "0 4px 12px rgba(47,143,91,0.3)" : "0 1px 0 rgba(15,26,51,0.06)" }}>
      {inhalt}
    </button>
  );
  return (
    <div data-kr-zahlenfeld style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      <style>{`.kr-taste{transition:transform .08s ease, filter .12s ease}.kr-taste:active{transform:scale(0.94);filter:brightness(0.94)}`}</style>
      {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((z) => taste(z, () => onZiffer(String(z))))}
      {taste("⌫", onLoeschen, "nav", labelLoeschen)}
      {taste(0, () => onZiffer("0"))}
      {taste("OK", onOk, "ok", labelOk)}
    </div>
  );
}

/* Eine Runde Schnellrechnen im Vollbild. erzeugen() liefert { text, loesung }.
   Rundenlänge und Turbo kommen aus den Kopfrechen-Einstellungen (kopfTraining.jsx). */
function Schnellrechnen({ erzeugen, gruppe, bestSchluessel, maxLaenge = 6, titel, untertitel, onEnde }) {
  const [einst] = useKopfEinstellungen();
  const RUNDE = einst.runde;
  const turbo = einst.turbo;
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
  const schluessel = `${bestSchluessel}-${RUNDE}`;
  const [best, setBest] = useState(() => {
    try { return JSON.parse(localStorage.getItem(schluessel) || "null"); } catch { return null; }
  });
  const timer = useTimer();

  const neueRunde = () => {
    clearTimeout(timer.current);
    setNr(0); setAufgabe(erzeugen()); setEingabe(""); setRueck(null); setRichtig(0); setSerie(0);
    setStart(Date.now()); setAufgStart(Date.now()); setFertig(null); setFehlerListe([]);
  };
  // Neuer Modus → neue Runde
  useEffect(neueRunde, [erzeugen]);  // eslint-disable-line react-hooks/exhaustive-deps

  const weiter = (warRichtig) => {
    const n = nr + 1;
    if (n >= RUNDE) {
      const sek = Math.round((Date.now() - start) / 100) / 10;
      const ergebnis = { richtig: richtig + (warRichtig ? 1 : 0), sek, gesamt: RUNDE };
      setFertig(ergebnis);
      const besser = !best || ergebnis.richtig > best.richtig || (ergebnis.richtig === best.richtig && sek < best.sek);
      if (besser) {
        setBest(ergebnis);
        try { localStorage.setItem(schluessel, JSON.stringify(ergebnis)); } catch { /* optional */ }
      }
      return;
    }
    setNr(n); setAufgabe(erzeugen()); setEingabe(""); setRueck(null); setAufgStart(Date.now());
  };

  const pruefen = (wert = eingabe) => {
    if (rueck || fertig || wert === "") return;
    const ok = Number(wert) === aufgabe.loesung;
    const sekunden = Math.round((Date.now() - aufgStart) / 100) / 10;
    try { merken({ gruppe, richtig: ok, sekunden, fehlerart: ok ? null : "rechnen" }); } catch { /* optional */ }
    setRueck(ok ? "richtig" : "falsch");
    if (ok) { setRichtig((r) => r + 1); setSerie((s) => s + 1); }
    else { setSerie(0); setFehlerListe((l) => [...l, { ...aufgabe, eingabe: wert }]); }
    timer.current = setTimeout(() => weiter(ok), ok ? (turbo ? 220 : 550) : 1500);
  };

  // Turbo: Steht die richtige Lösung im Feld, zählt sie sofort – ohne OK.
  useEffect(() => {
    if (turbo && !rueck && !fertig && eingabe !== "" && Number(eingabe) === aufgabe.loesung) pruefen(eingabe);
  }, [eingabe]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Tastatur am Rechner
  useEffect(() => {
    const taste = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) setEingabe((v) => (rueck || v.length >= maxLaenge ? v : v + e.key));
      else if (e.key === "Backspace") setEingabe((v) => (rueck ? v : v.slice(0, -1)));
      else if (e.key === "Enter") pruefen();
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  });

  if (fertig) {
    return (
      <Vollbild titel={titel} untertitel={untertitel} onEnde={onEnde}>
        <Ergebnis richtig={fertig.richtig} gesamt={RUNDE} sek={fertig.sek} best={best} onNochmal={neueRunde} onEnde={onEnde}
          fehler={fehlerListe.length ? fehlerListe.map((f, i) => (
            <p key={i} style={{ fontSize: 15, color: C.tinte }}>
              <MitWurzeln text={f.text} /> = <b>{f.loesung}</b> <span style={{ color: C.signal, fontSize: 13, marginLeft: 6 }}>(du: {f.eingabe})</span>
            </p>
          )) : null} />
      </Vollbild>
    );
  }

  const farbe = rueck === "richtig" ? C.smaragd : rueck === "falsch" ? C.signal : C.see;
  return (
    <Vollbild titel={titel} untertitel={untertitel} nr={nr} gesamt={RUNDE} serie={serie} onEnde={onEnde}>
      <style>{GLEICHUNG_CSS}</style>
      <div className="kr-gleichung" style={{ flex: 1, minHeight: 0 }}>
        {/* Aufgabe: endet mit „=“ */}
        <AufgabenKarte style={{ flex: "1 1 auto" }}>
          <p style={{ color: C.weiss, fontSize: aufgabe.text.length > 9 ? "clamp(26px, 7.6vw, 46px)" : "clamp(38px, 11vw, 58px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, whiteSpace: "nowrap" }}>
            <MitWurzeln text={aufgabe.text} /> <span style={{ color: C.flaggold, fontWeight: 600 }}>=</span>
          </p>
        </AufgabenKarte>

        {/* Eingabe */}
        <div className="kr-eingabe" data-kr-eingabe style={{ border: `2.5px solid ${farbe}`, borderRadius: 16, minHeight: 68,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap", padding: "6px 8px",
          background: rueck === "richtig" ? "#EEF8F2" : rueck === "falsch" ? "#FBEFEA" : C.weiss, transition: "all .15s", boxShadow: "0 2px 12px rgba(15,26,51,0.06)" }}>
          <span style={{ fontSize: eingabe.length > 6 ? 30 : 38, fontWeight: 800, color: C.tinte, minWidth: 20, fontVariantNumeric: "tabular-nums" }}>{eingabe || <span style={{ color: C.hellgrau }}>?</span>}</span>
          {rueck === "richtig" && <span style={{ fontSize: 28, color: C.smaragd, fontWeight: 800 }}>✓</span>}
          {rueck === "falsch" && <span style={{ fontSize: 17, color: C.signal, fontWeight: 700 }}>✗ richtig: {aufgabe.loesung}</span>}
        </div>
      </div>
      <p style={{ fontSize: 12, color: C.hellgrau, textAlign: "center", margin: "8px 0 10px", minHeight: 16, flex: "none" }}>
        {best ? `Bestwert: ${best.richtig}/${RUNDE} in ${String(best.sek).replace(".", ",")} s` : turbo ? "Turbo: Die richtige Zahl zählt sofort." : "Tippe die Lösung ein und drücke OK."}
      </p>

      <div style={{ flex: "none" }}>
        <Zahlenfeld gesperrt={!!rueck} turbo={turbo}
          onZiffer={(z) => setEingabe((v) => (v.length >= maxLaenge ? v : v + z))}
          onLoeschen={() => setEingabe((v) => v.slice(0, -1))}
          onOk={() => pruefen()} />
      </div>
    </Vollbild>
  );
}

/* Setup + Runde: vor dem Start die Auswahl (kinder) und die Optionen, dann das Vollbild */
function SchnellTrainer({ titel, untertitel, kinder, hinweis, ...rest }) {
  const [laeuft, setLaeuft] = useState(false);
  const [lauf, setLauf] = useState(0);
  if (!laeuft) return <RundenStart kinder={kinder} hinweis={hinweis} onStart={() => { setLauf((l) => l + 1); setLaeuft(true); }} />;
  return <Schnellrechnen key={lauf} titel={titel} untertitel={untertitel} onEnde={() => setLaeuft(false)} {...rest} />;
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
export function PotenzSpalten({ hoch, bloecke }) {
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
  const m = POTENZ_MODI.find((x) => x.id === modus);
  return (
    <div>
      <style>{`.kr-details > summary{list-style:none;cursor:pointer;padding:13px 0;font-size:15px;font-weight:700;color:${C.see}}
        .kr-details > summary::-webkit-details-marker{display:none}
        .kr-details[open]{padding-bottom:14px}`}</style>
      <SchnellTrainer titel="Quadrate und Wurzeln" untertitel={(m.aria || m.name).replace("\u00AD", "")}
        erzeugen={erzeugen} gruppe="Potenzen" bestSchluessel={`kr-best-pot-${modus}`}
        kinder={(
          <>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 8 }}>Üben</p>
            {(!ids || ids.length > 1) && <PotenzModi wert={modus} setWert={setModus} ids={ids} />}
            {modus === "wurzel10k" && <ErklaerAnimation art="wurzel" style={{ marginTop: 4, marginBottom: 14 }} />}
          </>
        )} />
      <div style={{ height: 16 }} />
      {art !== "kubik" && <details className="kr-details" style={{ marginBottom: 10, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "0 14px" }}>
        <summary>Quadratzahlen · 1² bis 30²</summary>
        <PotenzSpalten hoch={2} bloecke={[[1, 10], [11, 20], [21, 30]]} />
      </details>}
      {art !== "quadrat" && <details className="kr-details" style={{ marginBottom: 10, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "0 14px" }}>
        <summary>Kubikzahlen · 1³ bis 20³</summary>
        <PotenzSpalten hoch={3} bloecke={[[1, 10], [11, 20]]} />
      </details>}
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
    const erw = a.n === b.n ? "Gleiche Nenner: nur die Zähler verrechnen." : `Hauptnenner ${hn}: $\\frac{${za}}{${hn}} ${minus ? "−" : "+"} \\frac{${zb}}{${hn}}$.`;
    const erg = (minus ? za - zb : za + zb);
    const kz = ggT(erg, hn) > 1 ? ` = $\\frac{${erg}}{${hn}}$, gekürzt ${bT(loes.z, loes.n)}.` : ` = $\\frac{${erg}}{${hn}}$.`;
    return { a, b, op: minus ? "−" : "+", loes, weg: erw + kz };
  }
  if (m === "mal") {
    const loes = kuerze(a.z * b.z, a.n * b.n);
    const roh = bT(a.z * b.z, a.n * b.n), lt = bT(loes.z, loes.n);
    return { a, b, op: "·", loes, weg: `Zähler mal Zähler, Nenner mal Nenner: ${roh}${roh === lt ? "" : ` → gekürzt ${lt}. Tipp: vorher über Kreuz kürzen`}.` };
  }
  const loes = kuerze(a.z * b.n, a.n * b.z);
  const roh = bT(a.z * b.n, a.n * b.z), lt = bT(loes.z, loes.n);
  return { a, b, op: ":", loes, weg: `Mit dem Kehrwert multiplizieren: $\\frac{${a.z}}{${a.n}} \\cdot \\frac{${b.n}}{${b.z}}$ = ${roh}${roh === lt ? "" : ` → gekürzt ${lt}`}.` };
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

function BruchZahlenfeld({ onZiffer, onLoeschen, onWechsel, onOk, gesperrt, turbo }) {
  const taste = (inhalt, onClick, art, span) => (
    <button key={String(inhalt)} onClick={onClick} disabled={gesperrt} className="kr-taste" type="button"
      style={{ gridColumn: span ? `span ${span}` : undefined, height: "clamp(42px, 6.6vh, 54px)", borderRadius: 14, fontFamily: "inherit",
        cursor: gesperrt ? "default" : "pointer", fontSize: art === "ok" ? 18 : art === "wechsel" ? 14 : 24, fontWeight: 700,
        border: `1px solid ${art === "ok" ? (turbo ? C.linie : C.smaragd) : art === "nav" || art === "wechsel" ? C.seeTief : C.linie}`,
        background: art === "ok" ? (turbo ? C.weiss : C.smaragd) : art === "nav" || art === "wechsel" ? C.seeTief : C.weiss,
        color: art === "ok" ? (turbo ? C.smaragd : C.weiss) : art === "nav" || art === "wechsel" ? C.flaggold : C.tinte,
        boxShadow: art === "ok" && !turbo ? "0 4px 12px rgba(47,143,91,0.3)" : "0 1px 0 rgba(15,26,51,0.06)" }}>
      {inhalt}
    </button>
  );
  return (
    <div data-kr-zahlenfeld style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      <style>{`.kr-taste{transition:transform .08s ease, filter .12s ease}.kr-taste:active{transform:scale(0.94);filter:brightness(0.94)}`}</style>
      {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((z) => taste(z, () => onZiffer(String(z))))}
      {taste("⌫", onLoeschen, "nav")}
      {taste(0, () => onZiffer("0"))}
      {taste("Zähler ⇅ Nenner", onWechsel, "wechsel")}
      {taste("OK", onOk, "ok", 3)}
    </div>
  );
}

function BruchRunde({ modus, stufe, titel, untertitel, onEnde }) {
  const [einst] = useKopfEinstellungen();
  const BRUCH_RUNDE = einst.runde;
  const turbo = einst.turbo;
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
  const schluessel = `kr-best-bruch-${modus}-${stufe}-${BRUCH_RUNDE}`;
  const [best, setBest] = useState(() => { try { return JSON.parse(localStorage.getItem(schluessel) || "null"); } catch { return null; } });
  const timer = useTimer();

  const neueRunde = () => {
    clearTimeout(timer.current);
    setNr(0); setAuf(erzeugen()); setZ(""); setN(""); setFeld("z"); setRueck(null); setRichtig(0); setSerie(0);
    setStart(Date.now()); setAufgStart(Date.now()); setFertig(null); setFehler([]);
    try { setBest(JSON.parse(localStorage.getItem(schluessel) || "null")); } catch { setBest(null); }
  };
  useEffect(neueRunde, [modus, stufe]);  // eslint-disable-line react-hooks/exhaustive-deps

  const weiter = (warRichtig) => {
    const k = nr + 1;
    if (k >= BRUCH_RUNDE) {
      const sek = Math.round((Date.now() - start) / 100) / 10;
      const erg = { richtig: richtig + (warRichtig ? 1 : 0), sek, gesamt: BRUCH_RUNDE };
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
    if (ok) { setRichtig((r) => r + 1); setSerie((s) => s + 1); timer.current = setTimeout(() => weiter(true), turbo ? 260 : 650); }
    else { setSerie(0); setFehler((l) => [...l, { ...auf, eingabe: n === "" || n === "1" ? z : `$\\frac{${z}}{${n}}$` }]); }
  };

  // Turbo: Zähler und Nenner stimmen (vollständig gekürzt) → sofort weiter
  useEffect(() => {
    if (!turbo || fertig || (rueck && rueck !== "kuerzen") || z === "") return;
    const ez = Number(z), en = n === "" ? 1 : Number(n);
    if (en !== 0 && ez * auf.loes.n === en * auf.loes.z && ggT(ez, en) === 1) pruefen();
  }, [z, n]);  // eslint-disable-line react-hooks/exhaustive-deps

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
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) ziffer(e.key);
      else if (e.key === "Backspace") loeschen();
      else if (e.key === "/" || e.key === "Tab" || e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); wechsel(); }
      else if (e.key === "Enter") { if (rueck === "falsch") weiter(false); else pruefen(); }
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  });

  const bText = (b) => bT(b.z, b.n);

  if (fertig) {
    return (
      <Vollbild titel={titel} untertitel={untertitel} onEnde={onEnde}>
        <Ergebnis richtig={fertig.richtig} gesamt={BRUCH_RUNDE} sek={fertig.sek} best={best} onNochmal={neueRunde} onEnde={onEnde}
          text={fertig.richtig === BRUCH_RUNDE ? "Fehlerfrei! 🎉" : fertig.richtig / BRUCH_RUNDE >= 0.8 ? "Stark — Brüche sitzen." : fertig.richtig / BRUCH_RUNDE >= 0.5 ? "Gute Basis, weiter üben." : "Dranbleiben — Schritt für Schritt wird’s sicher."}
          fehler={fehler.length ? fehler.map((f, i) => (
            <p key={i} style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.5 }}>
              <MS s={f.op ? `${bText(f.a)} ${f.op} ${bText(f.b)}` : `${bText(f.a)} kürzen`} /> = <b><MS s={bText(f.loes)} /></b>
              <span style={{ color: C.signal, fontSize: 13, marginLeft: 6 }}>(du: <MS s={f.eingabe} />)</span>
            </p>
          )) : null} />
      </Vollbild>
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
    <Vollbild titel={titel} untertitel={untertitel} nr={nr} gesamt={BRUCH_RUNDE} serie={serie} onEnde={onEnde} scrollbar>
      <style>{GLEICHUNG_CSS}</style>
      <div className="kr-gleichung" style={{ flex: "1 0 auto" }}>
        {/* Aufgabe: endet mit „=“. Beide Blöcke vertikal zentriert, Bruchstriche auf gleicher Höhe. */}
        <AufgabenKarte style={{ padding: "14px 16px", gap: 6, flexWrap: "nowrap", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {!auf.op && <span style={{ color: C.flaggold, fontSize: 15, fontWeight: 600, marginRight: 6 }}>Kürze</span>}
          <Bruch z={auf.a.z} n={auf.a.n} />
          {auf.op && <span style={{ color: C.flaggold, fontSize: 34, fontWeight: 800, margin: "0 4px" }}>{auf.op}</span>}
          {auf.op && <Bruch z={auf.b.z} n={auf.b.n} />}
          <span style={{ color: C.flaggold, fontSize: 34, fontWeight: 700, marginLeft: 6 }}>=</span>
        </AufgabenKarte>

        {/* Eingabe als Bruch */}
        <div className="kr-eingabe" data-kr-eingabe style={{ border: `2.5px solid ${rahmen}`, borderRadius: 16, padding: "10px 14px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12, transition: "all .15s", boxShadow: "0 2px 12px rgba(15,26,51,0.06)",
          background: rueck === "richtig" ? "#EEF8F2" : rueck === "falsch" ? "#FBEFEA" : C.weiss }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="kr-bruchfeld" onClick={() => setFeld("z")} style={feldStil(feld === "z")}>{z || <span style={{ color: C.hellgrau, fontSize: 18 }}>Zähler</span>}</div>
            <div style={{ alignSelf: "stretch", height: 4, background: C.tinte, borderRadius: 2, margin: "6px 0" }} />
            <div className="kr-bruchfeld" onClick={() => setFeld("n")} style={feldStil(feld === "n")}>{n || <span style={{ color: C.hellgrau, fontSize: 18 }}>Nenner</span>}</div>
          </div>
          {rueck === "richtig" && <span style={{ fontSize: 30, color: C.smaragd, fontWeight: 800 }}>✓</span>}
          {rueck === "falsch" && (
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: C.signal, fontWeight: 700 }}>
              ✗ <Bruch z={auf.loes.z} n={auf.loes.n} gross={26} farbe={C.signal} />
            </span>
          )}
        </div>
      </div>

      <div className="kr-hinweis-box" style={{ minHeight: 20, margin: "8px 2px 10px", flex: "none" }}>
        {rueck === "kuerzen" && <p style={{ fontSize: 13.5, color: C.gruenDunkel, fontWeight: 600 }}>Der Wert stimmt — aber noch nicht vollständig gekürzt.</p>}
        {rueck === "null" && <p style={{ fontSize: 13.5, color: C.signal, fontWeight: 600 }}>Der Nenner darf nicht 0 sein.</p>}
        {rueck === "falsch" && <p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.55 }}><b>So geht’s:</b> <MS s={auf.weg} /></p>}
        {!rueck && <p className="kr-hinweis" style={{ fontSize: 12, color: C.hellgrau, textAlign: "center" }}>
          {best ? `Bestwert: ${best.richtig}/${BRUCH_RUNDE} in ${String(best.sek).replace(".", ",")} s · ` : ""}Ergebnis vollständig gekürzt eingeben. Ganze Zahl: Nenner leer lassen.
        </p>}
      </div>

      <div style={{ flex: "none" }}>
        {rueck === "falsch" ? (
          <StartKnopf onClick={() => weiter(false)} style={{ height: 54 }}>Weiter →</StartKnopf>
        ) : (
          <BruchZahlenfeld gesperrt={rueck === "richtig"} turbo={turbo} onZiffer={ziffer} onLoeschen={loeschen} onWechsel={wechsel} onOk={pruefen} />
        )}
      </div>
    </Vollbild>
  );
}

function Bruchrechnen() {
  const [modus, setModus] = useState("kuerzen");
  const [stufe, setStufe] = useState(1);
  const [laeuft, setLaeuft] = useState(false);
  const [lauf, setLauf] = useState(0);
  const name = BRUCH_MODI.find((m) => m.id === modus).name;
  if (laeuft) return <BruchRunde key={lauf} modus={modus} stufe={stufe} titel={`Bruchrechnung · ${name}`} untertitel={`Stufe ${stufe} · ${BRUCH_STUFEN.find((s) => s.id === stufe).name}`} onEnde={() => setLaeuft(false)} />;
  return (
    <div>
      <RundenStart onStart={() => { setLauf((l) => l + 1); setLaeuft(true); }} kinder={(
        <>
          <Modi kompakt liste={BRUCH_MODI} wert={modus} setWert={setModus} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 12.5, color: C.grau, marginRight: 4 }}>Stufe</span>
            {BRUCH_STUFEN.map((s) => (
              <button key={s.id} onClick={() => setStufe(s.id)}
                style={{ height: 32, padding: "0 14px", borderRadius: 999, fontFamily: "inherit", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                  border: `1px solid ${stufe === s.id ? C.gruen : C.linie}`, background: stufe === s.id ? C.gruen : C.weiss,
                  color: stufe === s.id ? C.weiss : C.tinte }}>{s.name}</button>
            ))}
          </div>
        </>
      )} />
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
  const bereichName = (id) => BEREICHE.find((x) => x.id === id).name;
  return (
    <div>
      <SchnellTrainer titel={art === "mal" ? "Multiplizieren" : "Multiplizieren · Umkehraufgabe"} untertitel={`${bereichName(a)} · ${bereichName(b)}`}
        erzeugen={erzeugen} gruppe="Multiplizieren" bestSchluessel={`kr-best-multi2-${a}x${b}-${art}`} maxLaenge={Math.max(4, stellen(a) + stellen(b))}
        kinder={(
          <>
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
          </>
        )} />
      <details className="kr-details" style={{ marginTop: 16, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "0 14px" }}>
        <style>{`.kr-details > summary{list-style:none;cursor:pointer;padding:13px 0;font-size:14px;font-weight:600;color:${C.see}}
          .kr-details > summary::-webkit-details-marker{display:none}
          .kr-details[open]{padding-bottom:14px}`}</style>
        <summary>Alle Produkte von 1·1 bis 10·10 anzeigen</summary>
        <EinmaleinsSchachbrett />
      </details>
    </div>
  );
}

/* ---------- Primzahlen-Trainer: zehn Zahlen, prim oder nicht prim, mit Lösungsweg ---------- */
const PRIMEN_BIS_200 = Array.from({ length: 199 }, (_, k) => k + 2).filter((n) => wegPrimzahl(n).prim);
const TRICK_ZAHLEN = Array.from({ length: 199 }, (_, k) => k + 2).filter((n) => n > 20 && n % 2 && n % 5 && !wegPrimzahl(n).prim);
const ziehe = (liste) => liste[Math.floor(Math.random() * liste.length)];
const neueZahl = () => (Math.random() < 0.5 ? ziehe(PRIMEN_BIS_200.filter((p) => p > 10)) : Math.random() < 0.7 ? ziehe(TRICK_ZAHLEN) : 2 + Math.floor(Math.random() * 98));

/* Runde im Vollbild: prim oder nicht prim, mit Lösungsweg. Turbo: richtige Antwort geht sofort weiter. */
function PrimzahlRunde({ onEnde }) {
  const [einst] = useKopfEinstellungen();
  const RUNDE = einst.runde;
  const turbo = einst.turbo;
  const [n, setN] = useState(neueZahl);
  const [nr, setNr] = useState(1);
  const [antwort, setAntwort] = useState(null);   // true = „prim“ gewählt
  const [richtig, setRichtig] = useState(0);
  const [serie, setSerie] = useState(0);
  const [fehler, setFehler] = useState([]);
  const [fertig, setFertig] = useState(false);
  const timer = useTimer();
  const weg = wegPrimzahl(n);
  const gewertet = antwort !== null;
  const stimmt = gewertet && antwort === weg.prim;
  const weiter = () => { clearTimeout(timer.current); if (nr >= RUNDE) { setFertig(true); return; } setNr((x) => x + 1); setN(neueZahl()); setAntwort(null); };
  const waehle = (a) => {
    if (gewertet) return;
    setAntwort(a);
    const ok = a === weg.prim;
    try { merken({ gruppe: "Primzahlen", richtig: ok, fehlerart: ok ? null : "rechnen" }); } catch { /* optional */ }
    if (ok) { setRichtig((r) => r + 1); setSerie((s) => s + 1); if (turbo) timer.current = setTimeout(weiter, 350); }
    else { setSerie(0); setFehler((l) => [...l, { n, prim: weg.prim }]); }
  };
  const neu = () => { clearTimeout(timer.current); setNr(1); setRichtig(0); setSerie(0); setFehler([]); setFertig(false); setAntwort(null); setN(neueZahl()); };
  useEffect(() => {
    const taste = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (gewertet && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); weiter(); }
      else if (!gewertet && (e.key === "j" || e.key === "p" || e.key === "1")) waehle(true);
      else if (!gewertet && (e.key === "n" || e.key === "2")) waehle(false);
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  });
  const knopf = (a, text) => {
    const gewaehlt = gewertet && antwort === a;
    const korrekt = gewertet && weg.prim === a;
    return (
      <button type="button" onClick={() => waehle(a)} disabled={gewertet}
        style={{ minHeight: 64, borderRadius: 16, fontFamily: "inherit", fontSize: 17, fontWeight: 800, cursor: gewertet ? "default" : "pointer",
          border: `2px solid ${korrekt ? C.smaragd : gewaehlt ? C.signal : C.linie}`, background: korrekt ? "#E7F4EC" : gewaehlt ? "#FBEBE3" : C.weiss, color: C.see,
          boxShadow: gewertet ? "none" : "0 2px 12px rgba(15,26,51,0.06)" }}>{text}</button>
    );
  };
  if (fertig) {
    return (
      <Vollbild titel="Primzahlen" onEnde={onEnde}>
        <Ergebnis richtig={richtig} gesamt={RUNDE} onNochmal={neu} onEnde={onEnde}
          text={richtig === RUNDE ? "Alle richtig – stark! 🎉" : richtig / RUNDE >= 0.7 ? "Gut gemacht." : "Schau dir die Anleitung unter Entdecken noch einmal an."}
          fehler={fehler.length ? fehler.map((f, i) => <p key={i} style={{ fontSize: 15, color: C.tinte }}>{f.n} ist <b>{f.prim ? "eine Primzahl" : "keine Primzahl"}</b>{!f.prim && <span style={{ color: C.grau }}> · {wegPrimzahl(f.n).ergebnis}</span>}</p>) : null} />
      </Vollbild>
    );
  }
  return (
    <Vollbild titel="Primzahlen" untertitel="Prim oder nicht prim?" nr={nr - 1} gesamt={RUNDE} serie={serie} onEnde={onEnde} scrollbar>
      <div data-primzahl-trainer style={{ display: "flex", flexDirection: "column", flex: "1 0 auto" }}>
        <AufgabenKarte style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "22px 16px" }}>
          <p style={{ fontSize: 12.5, color: "#C9D6EE", fontWeight: 400, marginBottom: 8 }}>Ist die Zahl eine Primzahl?</p>
          <p data-kr-zahl style={{ fontSize: "clamp(56px, 16vw, 84px)", fontWeight: 800, color: C.weiss, lineHeight: 1, letterSpacing: "-0.03em" }}>{n}</p>
        </AufgabenKarte>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12, flex: "none" }}>{knopf(true, "Primzahl")}{knopf(false, "Keine Primzahl")}</div>
        {gewertet && (
          <div role="status" style={{ marginTop: 12, background: C.weiss, borderRadius: 16, padding: "12px 14px", border: `1px solid ${C.linie}`, flex: "none" }}>
            <p style={{ fontSize: 15.5, fontWeight: 800, color: stimmt ? C.smaragd : C.signal, margin: "0 0 6px" }}>{stimmt ? "Richtig." : "Nicht ganz."}</p>
            {!(turbo && stimmt) && (
              <>
                <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
                  {weg.schritte.map((st, k) => <p key={k} style={{ fontSize: 14, color: C.tinte, lineHeight: 1.55, margin: 0 }}>{st.text}</p>)}
                </div>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.seeTief, margin: "0 0 12px" }}>{weg.ergebnis}</p>
                <StartKnopf onClick={weiter} style={{ height: 52 }}>{nr >= RUNDE ? "Ergebnis ansehen" : "Weiter"}</StartKnopf>
              </>
            )}
          </div>
        )}
      </div>
    </Vollbild>
  );
}

export function PrimzahlTrainer() {
  const [laeuft, setLaeuft] = useState(false);
  const [lauf, setLauf] = useState(0);
  if (laeuft) return <PrimzahlRunde key={lauf} onEnde={() => setLaeuft(false)} />;
  return (
    <RundenStart onStart={() => { setLauf((l) => l + 1); setLaeuft(true); }}
      hinweis="Tastatur: P oder 1 = Primzahl, N oder 2 = keine Primzahl."
      kinder={(
        <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.65, marginBottom: 16 }}>
          Zehn oder zwanzig Zahlen bis 200: Ist sie prim oder nicht? Nach jeder Antwort siehst du den Weg – bis zur Wurzel testen, Teiler finden oder keinen.
        </p>
      )} />
  );
}

/* ---------- Übersicht ---------- */

/* Anordnung (Wunsch vom 18.10.2026): Plus und Minus | Multiplizieren · Quadrate und Wurzeln | Primzahlen ·
   Primfaktoren | Schriftlich teilen · Bruchrechnung. Kuben stehen im Text unter „Quadrate und Wurzeln“. */
export const TRAINER = [
  { id: "plusminus", titel: "Schriftlich Plus & Minus", kurzTitel: "Plus und Minus", slogan: "Schriftlich untereinander, mit Übertrag.", zeichen: "+−" },
  { id: "multiplizieren", titel: "Multiplizieren", slogan: "Vom kleinen Einmaleins bis vierstellig.", zeichen: "7·8" },
  { id: "potenzen", titel: "Quadrate und Wurzeln", kurzTitel: "Quadrate & Wurzeln", slogan: "Hoch zwei, hoch drei – und wieder zurück.", zeichen: "12²" },
  { id: "primzahlen", titel: "Primzahlen", slogan: "Teilbar oder nicht – auf einen Blick.", zeichen: "13" },
  { id: "primfaktoren", titel: "Primfaktoren", slogan: "Zerlegen ohne Umweg, Teiler für Teiler.", zeichen: "2·3·7" },
  { id: "division", titel: "Schriftlich teilen", slogan: "Ziffer für Ziffer – Ergebnis und Rest.", zeichen: "÷" },
  { id: "bruchrechnen", titel: "Bruchrechnung", slogan: "Kürzen und alle vier Grundrechenarten.", zeichen: "¾" },
];
const KOPF_REIHEN = [["plusminus", "multiplizieren"], ["potenzen", "primzahlen"], ["primfaktoren", "division"], ["bruchrechnen"]];
/* Alte Kennungen (Links, Sprachwechsel) weiterhin öffnen */
const KOPF_ALT = { plus: "plusminus", minus: "plusminus", quadrate: "potenzen", kuben: "potenzen", wurzeln: "potenzen", einmaleins: "multiplizieren" };

/* Trainerfarben: hell (Lichtkante der Ziffer) und kräftig (Verlaufsende, Lichthof, Rand beim Hover).
   bg/text = gefüllte Plakette im Seitenkopf der Trainerseite. Sieben klar unterscheidbare Töne. */
const farbe = (hell, kraeftig, text = "#FFFFFF") => ({ hell, kraeftig, text, bg: `linear-gradient(150deg, ${hell} 0%, ${kraeftig} 100%)` });
const KOPF_LOOK = {
  plusminus: farbe("#9FD3FF", "#3B82F6"),
  multiplizieren: farbe("#FFD49A", "#F97316", "#3A1A00"),
  potenzen: farbe("#D6C8FF", "#8B5CF6"),
  primzahlen: farbe("#FFB3BE", "#F43F5E"),
  primfaktoren: farbe("#FFE89A", "#EDBB00", "#3A2900"),
  division: farbe("#F5C2FF", "#C026D3"),
  bruchrechnen: farbe("#9FF3E3", "#14B8A6", "#03322C"),
};

/* Trainer-Kacheln „Leuchtziffern“ (funcKopfrechnenKopf.jsx): zwei Spalten, die letzte Kachel
   quer über die volle Breite. Ziffer im Farbverlauf der Trainerfarbe. */
export function KopfKacheln({ onWaehle }) {
  return (
    <div data-kopf-kacheln>
      <style>{KARTEN_CSS}</style>
      <div className="kr-karten">
        {KOPF_REIHEN.flat().map((id) => {
          const t = TRAINER.find((x) => x.id === id);
          const f = KOPF_LOOK[t.id] || KOPF_LOOK.multiplizieren;
          const breit = KOPF_REIHEN.find((r) => r.includes(id)).length === 1;
          return (
            <KopfKarte key={t.id} titel={t.kurzTitel || t.titel} slogan={t.slogan} zeichen={t.zeichen} hell={f.hell} kraeftig={f.kraeftig} breit={breit} onClick={() => onWaehle(t.id)} label={`${t.titel} öffnen`} />
          );
        })}
      </div>
    </div>
  );
}

function TrainerInhalt({ id }) {
  return id === "primzahlen" ? <PrimzahlTrainer />
    : id === "primfaktoren" ? <Primfaktoren />
    : id === "potenzen" ? <QuadratKubik />
    : id === "bruchrechnen" ? <Bruchrechnen />
    : id === "plusminus" ? <SchriftlichPlusMinus Zahlenfeld={Zahlenfeld} />
    : id === "division" ? <SchriftlicheDivision Zahlenfeld={Zahlenfeld} /> : <Multiplizieren />;
}

/* Trainerseite. Mit onZurueck (eigene Seite unter /kopfrechnen/…) bekommt sie den dunklen Kopf;
   eingebettet (Hilfe, Übersicht) bleibt sie kompakt. */
export function KopfrechenZentrum({ start = null, gehe = null, eingebettet = false, onZurueck = null }) {
  const [offen, setOffen] = useState(KOPF_ALT[start] || start);
  const t = offen ? TRAINER.find((x) => x.id === offen) : null;

  if (!t) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: eingebettet ? 8 : 30 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
          {eingebettet ? "Weitere Trainer" : "Zahlen, die einfach sitzen"}
        </h2>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
          Trainer für das Kopfrechnen und schriftliche Rechnen. Wer Zahlen sofort abrufen kann, kürzt schneller, sieht Teiler auf einen
          Blick und hat beim Rechnen den Kopf für das Eigentliche frei.
        </p>
        {gehe && (
          <button type="button" onClick={() => gehe({ ansicht: "headnumbers" })} aria-label="Kopfrechnen öffnen"
            style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", marginBottom: 14, padding: 14, borderRadius: 18,
              border: `2px solid ${C.flaggold}`, background: C.weiss, color: C.tinte, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 14, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.flaggold,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800 }}>7·8</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 16.5, fontWeight: 700, lineHeight: 1.25 }}>Kopfrechnen</span>
              <span style={{ display: "block", fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.4, marginTop: 2 }}>Einmaleins, Quadrat- und Kubikzahlen – mit Lernpfad, Spielen und Wiederholung.</span>
            </span>
          </button>
        )}
        <div style={{ background: NACHT_VERLAUF, borderRadius: 22, padding: 14 }}>
          <KopfKacheln onWaehle={(id) => { setOffen(id); springe("kurse", () => window.scrollTo(0, 0)); }} />
        </div>
      </div>
    );
  }

  if (onZurueck) {
    const f = KOPF_LOOK[t.id] || KOPF_LOOK.multiplizieren;
    return (
      <div data-kr-trainerseite>
        <KopfrechnenKopf kompakt kicker="Kopfrechnen · Training" zurueck="Alle Trainer" onZurueck={onZurueck}
          badge={{ zeichen: t.zeichen, farbe: f.bg, text: f.text }} titel={t.kurzTitel || t.titel} satz={t.slogan} />
        <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 18 }}>
          <TrainerInhalt id={t.id} />
        </div>
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
      <TrainerInhalt id={t.id} />
    </div>
  );
}

/* Ein einzelner Trainer ohne Rahmen – zum Einbetten in Lernseiten (Modul Unterstufe) */
export function KopfTrainer({ id }) {
  const t = TRAINER.find((x) => x.id === (KOPF_ALT[id] || id));
  if (!t) return null;
  return <TrainerInhalt id={t.id} />;
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

/* Die Werkzeuge stehen jetzt in werkzeuge.js (Stationen) */

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
      <ZentrumListe bereichId="analysis" gehe={gehe} />
      <GesperrteKurse ids={["analysis1", "analysis2", "analysis3", "analysis4", "analysis5"]} ueberschrift="Die fünf Analysis-Kurse" />
    </div>
  );
}
