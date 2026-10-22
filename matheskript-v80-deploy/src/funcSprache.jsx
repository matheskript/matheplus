/* ======================================================================
   SPRACHEINGABE (22.10.2026) – Mikrofon-Knopf für Zahlenfelder
   Ein gesprochener Satz („drei zwei minus eins“) füllt die Felder einer Gruppe in ihrer Reihenfolge;
   die Übersetzung macht sprache.js (reine Logik, getestet). Geprüft wird erst mit „Prüfen“ – ein
   Hörfehler bleibt sichtbar und korrigierbar.
     · <SprachGruppe> … </SprachGruppe>  – Felder + Mikrofon-Knopf dahinter (Vektoren, Punkte, Ebenen, Einzelwerte)
     · <SprachKnopf ziel={() => el} />    – Knopf allein (Mathe-Tastatur: füllt das aktive Feld und die folgenden seiner Gruppe)
   Der Knopf erscheint nur, wenn der Browser die Web Speech API hat (Chrome, Edge, Safari – nicht Firefox).
   Die Erkennung macht der Browser (Chrome/Android: Google, Safari/iPhone: Apple): vor dem ersten Mal die
   Zwei-Klick-Freigabe wie bei YouTube (DIENSTE.sprache in externeMedien.js, Widerruf auf der Datenschutzseite).
   Bedienung: tippen → hört zu (roter Puls), spricht man nicht mehr, endet die Aufnahme von selbst; erneut tippen stoppt.
   Browser-Test nur von Hand (Playwright hat kein Mikrofon); die Verteilung auf Felder ist in tests/sprache.test.mjs
   (Logik) und tests/eingabeFelder.test.mjs (Einbau) geprüft.
   ====================================================================== */
import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { C } from "./base1.jsx";
import { DIENSTE, dienstErlaubt, dienstSetzen, medienAbonnieren } from "./externeMedien.js";
import { setzeFeldWert } from "./feldWert.js";
import { sprachUnterstuetzt, zahlenAusSprache } from "./sprache.js";

const FEHLER_TEXT = {
  "not-allowed": "Mikrofon nicht erlaubt – bitte in den Browser-Einstellungen freigeben.",
  "service-not-allowed": "Spracherkennung ist in diesem Browser gesperrt.",
  "no-speech": "Nichts gehört – noch einmal tippen und sprechen.",
  "audio-capture": "Kein Mikrofon gefunden.",
  network: "Keine Verbindung zur Spracherkennung.",
  aborted: null,
};

/* Alle Zahlenfelder einer Gruppe in Dokument-Reihenfolge (sichtbar, nicht gesperrt) */
export function felderDerGruppe(gruppe) {
  if (!gruppe) return [];
  return [...gruppe.querySelectorAll("input[data-mathe-modus]")].filter((el) => !el.disabled && el.offsetParent !== null);
}

/* Werte auf die Felder verteilen: ab dem Startfeld (oder dem ersten) in Reihenfolge, überzählige Werte fallen weg.
   Liefert, wie viele Felder gefüllt wurden. */
export function werteVerteilen(felder, werte, start = null) {
  let i = start ? Math.max(0, felder.indexOf(start)) : 0;
  let n = 0;
  for (const w of werte) {
    if (i >= felder.length) break;
    setzeFeldWert(felder[i], w);
    i += 1; n += 1;
  }
  return n;
}

function erkennungStarten({ onZwischen, onErgebnis, onFehler, onEnde }) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const r = new SR();
  r.lang = "de-DE";
  r.interimResults = true;
  r.continuous = false;
  r.maxAlternatives = 1;
  let text = "", geliefert = false;
  r.onresult = (e) => {
    let s = "";
    for (let i = 0; i < e.results.length; i++) s += `${e.results[i][0].transcript} `;
    text = s.trim();
    onZwischen(text);
    if (e.results[e.results.length - 1].isFinal) { geliefert = true; onErgebnis(text); }
  };
  r.onerror = (e) => { onFehler(e.error); };
  /* iPhone liefert das Ergebnis oft erst beim Ende – dann hier */
  r.onend = () => { if (!geliefert && text) { geliefert = true; onErgebnis(text); } onEnde(); };
  try { r.start(); } catch (e) { onFehler("aborted"); }
  return r;
}

const MikroZeichen = ({ g = 16 }) => (
  <svg viewBox="0 0 24 24" width={g} height={g} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" stroke="none" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
  </svg>
);

/* Freigabe vor dem ersten Mal (Zwei-Klick wie bei Videos) */
/* Lage eines schwebenden Kästchens unter dem Knopf (fest im Fenster, damit overflow:hidden der Boxen es nicht abschneidet) */
function lageUnter(knopf, breite) {
  if (!knopf) return { top: 80, left: 16 };
  const r = knopf.getBoundingClientRect();
  const vb = window.innerWidth;
  const left = Math.max(8, Math.min(r.right - breite, vb - breite - 8));
  return { top: r.bottom + 8, left };
}

function Freigabe({ onJa, onNein, knopf }) {
  const [merken, setMerken] = useState(true);
  const d = DIENSTE.sprache;
  const breite = Math.min(300, window.innerWidth - 32);
  const { top, left } = lageUnter(knopf, breite);
  return createPortal(
    <div role="dialog" aria-label="Spracheingabe erlauben" data-sprach-freigabe
      style={{ position: "fixed", zIndex: 100001, top, left, width: breite, boxSizing: "border-box", padding: "12px 14px", borderRadius: 14, fontFamily: "Montserrat, system-ui, sans-serif",
        background: C.seeTief, color: C.weiss, boxShadow: "0 14px 40px rgba(8,23,59,0.3)", textAlign: "left", whiteSpace: "normal", fontWeight: 400 }}>
      <p style={{ fontSize: 13, lineHeight: 1.5, margin: "0 0 10px", color: "#DCE5F5" }}>
        Die Spracherkennung macht dein Browser – {d.firma}. Dein gesprochener Satz wird dorthin übertragen, sonst nichts.
      </p>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#DCE5F5", cursor: "pointer", marginBottom: 10 }}>
        <input type="checkbox" checked={merken} onChange={(e) => setMerken(e.target.checked)} style={{ accentColor: C.flaggold }} />
        Auf diesem Gerät merken
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => { if (merken) dienstSetzen("sprache", true); onJa(); }}
          style={{ flex: 1, height: 38, borderRadius: 999, border: "none", background: C.flaggold, color: C.seeTief, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Erlauben</button>
        <button type="button" onClick={onNein}
          style={{ height: 38, padding: "0 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.35)", background: "transparent", color: C.weiss, fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Nicht jetzt</button>
      </div>
    </div>,
    document.body,
  );
}

/* Rückmeldung unter dem Knopf („Ich höre …“, erkannter Text, Fehler) – ebenfalls fest im Fenster */
function Meldung({ meldung, knopf }) {
  const breite = Math.min(280, window.innerWidth - 32);
  const { top, left } = lageUnter(knopf, breite);
  return createPortal(
    <span role="status" data-sprach-meldung={meldung.art}
      style={{ position: "fixed", zIndex: 100001, top, left, maxWidth: breite, width: "max-content", boxSizing: "border-box", padding: "6px 10px", borderRadius: 10, fontFamily: "Montserrat, system-ui, sans-serif",
        background: meldung.art === "fehler" ? "#FCEFE8" : C.weiss, border: `1px solid ${meldung.art === "fehler" ? C.signal : C.linie}`, color: meldung.art === "fehler" ? "#8E3F17" : C.tinte,
        fontSize: 12.5, fontWeight: 600, lineHeight: 1.4, whiteSpace: "normal", textAlign: "left", boxShadow: "0 6px 18px rgba(15,26,51,0.12)", pointerEvents: "none" }}>
      {meldung.text}
    </span>,
    document.body,
  );
}

/* ziel(): Startfeld (aktives Feld der Tastatur) oder null · gruppe(): Element mit den Feldern (sonst die Gruppe des Startfelds)
   groesse: Knopfgröße · farbe: Rand/Zeichen · onWerte(werte, gefuellt): nach dem Verteilen (optional) */
export function SprachKnopf({ ziel, gruppe, groesse = 36, farbe = C.see, stil, titel = "Zahlen sprechen", onWerte }) {
  const kann = sprachUnterstuetzt();
  const erlaubt = useSyncExternalStore(medienAbonnieren, () => dienstErlaubt("sprache"), () => false);
  const [einmal, setEinmal] = useState(false);
  const [frage, setFrage] = useState(false);
  const [hoert, setHoert] = useState(false);
  const [meldung, setMeldung] = useState(null);      // { art: "hoert" | "text" | "fehler", text }
  const erk = useRef(null);
  const timer = useRef(null);
  const knopfRef = useRef(null);
  useEffect(() => () => { clearTimeout(timer.current); try { erk.current && erk.current.abort(); } catch (e) { /* schon zu */ } }, []);
  if (!kann) return null;

  const zeige = (m, dauer) => {
    clearTimeout(timer.current);
    setMeldung(m);
    if (dauer) timer.current = setTimeout(() => setMeldung(null), dauer);
  };
  const verteile = (text) => {
    const werte = zahlenAusSprache(text);
    const start = ziel ? ziel() : null;
    const g = (gruppe && gruppe()) || (start && start.closest("[data-sprach-gruppe]")) || null;
    const felder = g ? felderDerGruppe(g) : start ? [start] : [];
    const n = werte.length ? werteVerteilen(felder, werte, start) : 0;
    if (!werte.length) zeige({ art: "fehler", text: `Verstanden: „${text}“ – keine Zahl erkannt.` }, 4000);
    else zeige({ art: "text", text: `„${text}“ → ${werte.slice(0, n || werte.length).join(" | ")}` }, 3500);
    if (onWerte) onWerte(werte, n);
  };
  const starten = () => {
    if (hoert) { try { erk.current && erk.current.stop(); } catch (e) { /* weg */ } return; }
    setHoert(true);
    zeige({ art: "hoert", text: "Ich höre … sprich die Zahlen." });
    erk.current = erkennungStarten({
      onZwischen: (t) => zeige({ art: "hoert", text: t || "Ich höre …" }),
      onErgebnis: verteile,
      onFehler: (code) => { const t = FEHLER_TEXT[code] === undefined ? `Spracherkennung: ${code}` : FEHLER_TEXT[code]; if (t) zeige({ art: "fehler", text: t }, 5000); else setMeldung(null); },
      onEnde: () => { setHoert(false); erk.current = null; setMeldung((m) => (m && m.art === "hoert" ? null : m)); },
    });
  };
  const klick = () => {
    if (erlaubt || einmal) { starten(); return; }
    setFrage(true);
  };
  return (
    <span data-sprach-knopf style={{ position: "relative", display: "inline-flex", flexShrink: 0, ...stil }}>
      <style>{`@keyframes sprach-puls{0%,100%{box-shadow:0 0 0 0 rgba(184,92,46,0.45)}50%{box-shadow:0 0 0 7px rgba(184,92,46,0)}}`}</style>
      <button type="button" ref={knopfRef} onClick={klick} aria-label={hoert ? "Aufnahme beenden" : titel} title={hoert ? "Aufnahme beenden" : `${titel} – z. B. „drei zwei minus eins“`} aria-pressed={hoert}
        onMouseDown={(e) => e.preventDefault()}
        style={{ width: groesse, height: groesse, borderRadius: 999, border: `1.5px solid ${hoert ? C.signal : `${farbe}66`}`, background: hoert ? C.signal : `${farbe}0D`,
          color: hoert ? C.weiss : farbe, cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation",
          animation: hoert ? "sprach-puls 1.1s ease-out infinite" : "none" }}>
        <MikroZeichen g={Math.round(groesse * 0.46)} />
      </button>
      {frage && <Freigabe knopf={knopfRef.current} onJa={() => { setFrage(false); setEinmal(true); starten(); }} onNein={() => setFrage(false)} />}
      {meldung && !frage && <Meldung meldung={meldung} knopf={knopfRef.current} />}
    </span>
  );
}

/* Felder + Mikrofon: die Kinder bleiben, wie sie sind; dahinter steht der Knopf. abstand = Lücke zum Knopf. */
export function SprachGruppe({ children, stil, abstand = 8, groesse = 34, farbe = C.see, titel, block = false }) {
  const ref = useRef(null);
  return (
    <span ref={ref} data-sprach-gruppe style={{ display: block ? "flex" : "inline-flex", alignItems: "center", gap: abstand, minWidth: 0, ...stil }}>
      {children}
      <SprachKnopf gruppe={() => ref.current} groesse={groesse} farbe={farbe} titel={titel} />
    </span>
  );
}
