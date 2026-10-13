import React, { useEffect, useRef } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { lernAendern, useLern } from "./func6.jsx";
import { normiere } from "./trainingDaten.js";
import { kurzStand, normiereKopf } from "./headNumbers.js";

/* Gemeinsame Bausteine von Head & Numbers: Texte, Speicher, kleine Komponenten. */

/* Zeitmesser mit Pause: Liefert eine Funktion, die die Millisekunden zurückgibt, in denen der Tab versteckt war
   (Wechsel der App, Bildschirm aus). Diese Zeit zählt nicht als Rechenzeit. */
export function useZeitMesser() {
  const pause = useRef(0), seit = useRef(null);
  useEffect(() => {
    const h = () => {
      if (document.hidden) { if (seit.current === null) seit.current = Date.now(); }
      else if (seit.current !== null) { pause.current += Date.now() - seit.current; seit.current = null; }
    };
    document.addEventListener("visibilitychange", h);
    return () => document.removeEventListener("visibilitychange", h);
  }, []);
  return () => pause.current + (seit.current !== null ? Date.now() - seit.current : 0);
}
export const PAUSE_SCHWELLE_MS = 1500;   // ab dieser versteckten Zeit gilt die Aufgabe als unterbrochen (kein Tempo-Beleg)

/* Eine kurze, freundliche Hilfe je Fehlerart (Texte werden beim Anzeigen ausgewertet) */
export const FEHLER_TIPP = (art) => ({
  nachbar: L("Kontrolliere vor dem Antworten kurz die Endziffer.", "Quickly check the last digit before you answer."),
  addiert: L("7 · 8 heißt: acht Siebener. Plus und mal bewusst unterscheiden.", "7 · 8 means eight sevens. Keep plus and times apart on purpose."),
  faktor: L("Lies noch einmal, was gesucht ist: die fehlende Zahl, nicht ein Faktor, der schon dasteht.", "Re-read what is asked: the missing number, not a factor already given."),
  potenz: L("² heißt zwei gleiche Faktoren (n · n), ³ heißt drei (n · n · n).", "² means two equal factors (n · n), ³ means three (n · n · n)."),
  verdoppelt: L("Quadrieren ist n · n, nicht n + n.", "Squaring is n · n, not n + n."),
  malDrei: L("Hoch 3 heißt n · n · n, nicht 3 · n.", "Cubed means n · n · n, not 3 · n."),
  halbiert: L("Wurzel ziehen heißt: Welche Zahl mit sich selbst malgenommen ergibt das? Nicht halbieren.", "Taking the root means: which number times itself gives this? Do not halve."),
  drittel: L("Kubikwurzel: Welche Zahl dreimal mit sich selbst malgenommen ergibt das?", "Cube root: which number multiplied by itself three times gives this?"),
  zahlendreher: L("Sprich die Zahl beim Eintippen leise nach: erst Zehner, dann Einer.", "Say the number quietly as you type: tens first, then ones."),
  zehner: L("Schätze zuerst die Größenordnung: Wie viele Stellen muss das Ergebnis haben?", "Estimate the size first: how many digits must the result have?"),
  knapp: L("Rechne den letzten Schritt noch einmal in Ruhe nach.", "Redo the last step calmly."),
}[art] || "");

/* Aufgabe für Screenreader vorlesbar machen */
export const gesprochen = (t) => String(t || "").replace(/·/g, L(" mal ", " times ")).replace(/ : /g, L(" geteilt durch ", " divided by ")).replace(/√/g, L("Wurzel aus ", "square root of ")).replace(/∛/g, L("dritte Wurzel aus ", "cube root of ")).replace(/²/g, L(" hoch 2", " squared")).replace(/³/g, L(" hoch 3", " cubed")).replace(/\?/g, L("gesucht", "unknown"));

export const L = (de, en) => (englisch() ? en : de);
export const NAVY = C.seeTief;
export const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
export const MAL = "·";
export const formatZahl = (n) => String(n).replace(".", ",");

/* ---------------------------------------------------------------- Speicher */
export const kopfAendern = (fn) => lernAendern((X) => {
  X.training = normiere(X.training);
  X.training.kopf = normiereKopf(X.training.kopf);
  fn(X.training.kopf);
  X.training.kopf.stand = kurzStand(X.training.kopf);   // Kurzstand für Lernlandkarte und Mathilda, ohne die Logik zu laden
});
export const useKopf = () => { const lern = useLern(); return normiereKopf(lern.training && lern.training.kopf); };

/* ---------------------------------------------------------------- Beschriftungen */
export const modulInfo = (m) => ({
  einmaleins: { id: "einmaleins", zeichen: "7·8", titel: L("Das Einmaleins bis 100", "The times tables up to 100"), kurz: L("Alle Aufgaben a · b mit Faktoren von 1 bis 10", "All problems a · b with factors from 1 to 10"),
    gruppe: L("Einmaleins", "Times tables"), farbe: "#E07A00", einheit: L("Aufgaben", "problems") },
  quadrate: { id: "quadrate", zeichen: "12²", titel: L("Quadratzahlen bis 625", "Square numbers up to 625"), kurz: L("1² bis 25² kennen und wiedererkennen", "Know and recognise 1² to 25²"),
    gruppe: L("Quadratzahlen", "Square numbers"), farbe: "#6D28D9", einheit: L("Quadratzahlen", "square numbers") },
  kubik: { id: "kubik", zeichen: "5³", titel: L("Kubikzahlen bis 1000", "Cube numbers up to 1000"), kurz: L("1³ bis 10³ kennen und wiedererkennen", "Know and recognise 1³ to 10³"),
    gruppe: L("Kubikzahlen", "Cube numbers"), farbe: "#0F8A7E", einheit: L("Kubikzahlen", "cube numbers") },
  gemischt: { id: "gemischt", zeichen: "Mix", titel: L("Gemischtes Training", "Mixed training"), kurz: L("Einmaleins, Quadrat- und Kubikzahlen im Wechsel", "Times tables, squares and cubes in turn"),
    gruppe: L("Gemischt", "Mixed"), farbe: C.see, einheit: L("Zahlenbeziehungen", "number facts") },
}[m]);

export const stufeInfo = (s) => ({
  verstehen: { nr: 1, name: L("Verstehen", "Understand"), text: L("Zusammenhänge und Muster entdecken – ganz ohne Druck.", "Discover connections and patterns – no pressure.") },
  unterstuetzt: { nr: 2, name: L("Mit Unterstützung", "With support"), text: L("Auswahl, Zuordnung und Tipps helfen dir beim Lösen.", "Choices, matching and hints help you solve.") },
  selbst: { nr: 3, name: L("Selbstständig", "On your own"), text: L("Du tippst die Ergebnisse selbst ein – in deinem Tempo.", "You type the results yourself – at your own pace.") },
  schnell: { nr: 4, name: L("Schnell abrufen", "Quick recall"), text: L("Das Ergebnis sofort wissen. Richtigkeit zählt zuerst.", "Know the result at once. Being correct comes first.") },
  wiederholen: { nr: 5, name: L("Wiederholen", "Review"), text: L("Unsicheres und Fälliges gezielt noch einmal üben.", "Practise what is shaky or due once more.") },
  challenge: { nr: 6, name: L("Challenge", "Challenge"), text: L("Gemischte Runde: zeigt, was wirklich sitzt.", "Mixed round: shows what really sticks.") },
}[s]);

export const STATUS_NAME = () => ({ neu: L("neu", "new"), gesehen: L("gesehen", "seen"), unsicher: L("unsicher", "shaky"), aufbau: L("im Aufbau", "building"), sicher: L("sicher", "secure"), automatisiert: L("automatisiert", "automatic") });
export const STATUS_FARBE = { neu: "#CDD5E4", gesehen: "#9DB4D6", unsicher: C.signal, aufbau: C.seeHell, sicher: C.smaragd, automatisiert: C.flaggold };
export const RICHTUNG_NAME = (r) => (r === "v" ? L("vorwärts", "forwards") : L("rückwärts", "backwards"));

/* ---------------------------------------------------------------- kleine Bausteine */
export const Kicker = ({ children }) => <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 6 }}>{children}</p>;
export const H2 = ({ children, style }) => <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12, ...style }}>{children}</h2>;
export const Absatz = ({ children, style }) => <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 14, ...style }}>{children}</p>;
export const Zurueck = ({ onClick, children }) => (
  <button type="button" onClick={onClick}
    style={{ background: "none", border: "none", color: C.see, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: "10px 0", minHeight: 44 }}>
    ← {children}
  </button>
);
export const Knopf = ({ onClick, children, haupt = true, style, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled}
    style={{ minHeight: 52, padding: "12px 20px", borderRadius: 14, fontFamily: "inherit", fontSize: 15.5, fontWeight: 700, cursor: disabled ? "default" : "pointer",
      border: haupt ? "none" : `1.5px solid ${C.linie}`, opacity: disabled ? 0.5 : 1,
      background: haupt ? `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` : C.weiss, color: haupt ? C.weiss : C.see,
      boxShadow: haupt ? "0 4px 14px rgba(0,77,152,0.25)" : "none", ...style }}>{children}</button>
);

export function StandBalken({ zaehler, gesamt, hoehe = 10 }) {
  const reihenfolge = ["automatisiert", "sicher", "aufbau", "gesehen", "unsicher", "neu"];
  const namen = STATUS_NAME();
  const text = reihenfolge.map((s) => `${zaehler[s] || 0} ${namen[s]}`).join(", ");
  return (
    <div role="img" aria-label={text} title={text} style={{ display: "flex", height: hoehe, borderRadius: 999, overflow: "hidden", background: "#E6EBF4" }}>
      {reihenfolge.map((s) => (zaehler[s] ? <span key={s} style={{ width: `${(zaehler[s] / gesamt) * 100}%`, background: STATUS_FARBE[s] }} /> : null))}
    </div>
  );
}
export function Legende({ zaehler }) {
  const namen = STATUS_NAME();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 10 }}>
      {["automatisiert", "sicher", "aufbau", "gesehen", "unsicher", "neu"].map((s) => (
        <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.grau }}>
          <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 3, background: STATUS_FARBE[s] }} />{namen[s]} <b style={{ color: C.tinte }}>{zaehler[s] || 0}</b>
        </span>
      ))}
    </div>
  );
}
