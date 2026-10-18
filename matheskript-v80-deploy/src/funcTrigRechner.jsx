/* ======================================================================
   funcTrigRechner.jsx – Eingabe mit Trig-Rechner
   · TrigFeld      Eingabefeld mit eigenem Tastenfeld (sin, cos, tan,
                   sin⁻¹ …, π, °, √, x²). Schreibt man eine Rechnung wie
                   „7,5 · sin(35)“, steht darunter sofort das Ergebnis.
   · WinkelSchalter DEG | RAD – dieselbe Einstellung wie im Tastenfeld
   · trigLies      liest eine Eingabe für einen Übungsschritt (Schritt in
                   ui3.jsx: feld + lies). Gerechnet wird im eingestellten
                   Modus – auf RAD kommt also der typische Bogenmaß-Fehler
                   heraus, den die Übungen dann gezielt ansprechen.
   · TrigRechnerKarte  freier Rechner zum Ausprobieren
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React, { useState, useSyncExternalStore } from "react";
import { C } from "./base1.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { karte, kicker, zw } from "./ui2.jsx";
import { trigAuswerten, istTerm, zt } from "./trigMittel.js";
import { setzeWinkelModus, winkelAbo, winkelModus } from "./winkelModus.js";

export const useWinkelModus = () => useSyncExternalStore(winkelAbo, winkelModus, () => "deg");

const FEHLER = {
  syntax: () => zw("Die Rechnung ist noch nicht vollständig.", "The expression isn't complete yet."),
  bereich: () => zw("Mathe-Fehler: sin⁻¹ und cos⁻¹ gibt es nur für Werte zwischen −1 und 1, Wurzeln nur für Zahlen ≥ 0.", "Math error: sin⁻¹ and cos⁻¹ only exist for values between −1 and 1, roots only for numbers ≥ 0."),
  undefiniert: () => zw("Mathe-Fehler: nicht definiert (z. B. tan 90° oder durch 0 geteilt).", "Math error: undefined (e.g. tan 90° or division by 0)."),
};

/* Für Übungsschritte: Zahl oder Rechnung → { wert } bzw. { warn } */
export function trigLies(text) {
  const r = trigAuswerten(text, winkelModus());
  if (r.fehler === "leer") return { warn: zw("Bitte eine Zahl oder Rechnung eingeben.", "Please enter a number or an expression.") };
  if (r.fehler) return { warn: FEHLER[r.fehler]() };
  return { wert: r.wert };
}

export function WinkelSchalter({ klein = false }) {
  const wm = useWinkelModus();
  return (
    <div role="group" aria-label={zw("Winkelmodus des Rechners", "Calculator angle mode")}
      style={{ display: "inline-flex", borderRadius: 999, border: `1.5px solid ${C.linie}`, overflow: "hidden", background: C.weiss, flexShrink: 0 }}>
      {[["deg", "DEG"], ["rad", "RAD"]].map(([m, t]) => (
        <button key={m} type="button" aria-pressed={wm === m} onClick={() => setzeWinkelModus(m)}
          style={{ minWidth: klein ? 44 : 52, height: klein ? 30 : 36, border: "none", fontFamily: "inherit", fontSize: klein ? 11.5 : 12.5, fontWeight: 800, letterSpacing: "0.05em", cursor: "pointer",
            background: wm === m ? (m === "rad" ? C.gruen : C.see) : "transparent", color: wm === m ? C.weiss : C.grau }}>{t}</button>
      ))}
    </div>
  );
}

/* Eingabefeld mit Live-Ergebnis */
export function TrigFeld({ wert, setWert, label, onEnter, breite = "100%", platzhalter }) {
  const wm = useWinkelModus();
  const r = trigAuswerten(wert, wm);
  const rechnung = istTerm(wert);
  return (
    <div style={{ width: breite, maxWidth: 340, minWidth: 0, flex: "1 1 220px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <MatheFeld modus="trig" value={wert} aria-label={label} placeholder={platzhalter ?? zw("Zahl oder Rechnung", "Number or expression")}
          onChange={(e) => setWert(e.target.value.slice(0, 60))}
          onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
          style={{ flex: 1, minWidth: 0, height: 44, boxSizing: "border-box", padding: "0 12px", fontSize: 16, fontWeight: 700, fontFamily: "inherit", color: C.see,
            border: `1.5px solid ${C.see}66`, borderRadius: 11, background: `${C.see}0D`, outline: "none" }} />
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginTop: 5 }}>
      <div aria-live="polite" style={{ minHeight: 20, paddingTop: 6, fontSize: 13, fontWeight: 600, color: r.fehler && r.fehler !== "leer" ? "#9A3412" : C.grau, fontVariantNumeric: "tabular-nums", minWidth: 0 }}>
        {rechnung && r.wert !== undefined && <>= <b style={{ color: C.tinte }}>{zt(r.wert, 6)}</b> <span style={{ fontSize: 11.5, fontWeight: 700, color: wm === "rad" ? C.gruen : C.hellgrau }}>{wm.toUpperCase()}</span></>}
        {rechnung && r.fehler && r.fehler !== "leer" && r.fehler !== "syntax" && FEHLER[r.fehler]()}
      </div>
      <WinkelSchalter klein />
      </div>
    </div>
  );
}

/* Freier Rechner mit Beispielen */
const BEISPIELE = ["sin(30)", "cos(60)", "tan(45)", "sin⁻¹(0,5)", "7,5·sin(35)", "8÷tan(40)", "sin(30)²+cos(30)²", "sin(π÷6)"];
export function TrigRechnerKarte() {
  const [ein, setEin] = useState("sin(30)");
  const wm = useWinkelModus();
  return (
    <div style={{ ...karte, marginTop: 14 }}>
      <p style={kicker}>{zw("Dein Trig-Rechner", "Your trig calculator")}</p>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "0 0 10px" }}>
        {zw("In allen Übungen darfst du statt einer Zahl auch die Rechnung eintippen – so wie im Heft: ", "In all exercises you may type the calculation instead of a number – just like in your notebook: ")}
        <b style={{ color: C.tinte }}>7,5 · sin(35)</b>. {zw("Der Rechner rechnet sie aus. Achte oben rechts auf DEG (Grad) oder RAD (Bogenmaß) – genau wie beim Taschenrechner.", "The calculator works it out. Watch DEG (degrees) or RAD (radians) at the top right – just like on a real calculator.")}
      </p>
      <TrigFeld wert={ein} setWert={setEin} label={zw("Rechnung", "Expression")} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {BEISPIELE.map((b) => (
          <button key={b} type="button" onClick={() => setEin(b)}
            style={{ padding: "5px 10px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{b}</button>
        ))}
      </div>
      {wm === "rad" && (
        <p style={{ fontSize: 12.5, color: C.gruen, fontWeight: 600, lineHeight: 1.55, margin: "10px 0 0" }}>
          {zw("RAD ist eingestellt: sin(30) bedeutet jetzt „Sinus von 30 Bogenmaß“ – das sind fast fünf volle Umdrehungen. Für Winkel in Grad stell auf DEG oder schreib 30°.", "RAD is on: sin(30) now means “sine of 30 radians” – almost five full turns. For angles in degrees switch to DEG or type 30°.")}
        </p>
      )}
    </div>
  );
}
