import React, { forwardRef, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import {
  BUCHSTABEN_DE, BUCHSTABEN_EN, FORMEL_FUNKTION, FORMEL_HAUPT, Z, einfuegen, loeschen, zahlenTasten, zeigeAutomatisch,
} from "./matheTastaturLogik.js";

/* ======================================================================
   Mathe-Tastatur
   Überall, wo Zahlen oder Formeln eingegeben werden, öffnet sich auf dem Handy nicht die normale
   Text-Tastatur, sondern dieses Tastenfeld:
     · Zahlen-Modi (ganz, ganzvz, zahl, bruch, datum): Ziffern, Minus, Komma, Bruchstrich
     · Formel-Modus: Ziffern und Rechenzeichen, x, Potenzen, Wurzel, π, dazu eine Ebene mit
       sin, cos, tan, ln, log, e^, f(x), f′(x) … und eine Buchstaben-Ebene, damit nichts unmöglich bleibt.
   Aufbau: <MatheFeld modus="…"> ersetzt <input> (gleiche Eigenschaften, gleiche onChange-Ereignisse);
   <MatheTastaturHost /> hängt das Tastenfeld einmal im App-Wurzelbaustein ein.
   Die Logik (Einfügen, Löschen, Tastenbelegung) steht in matheTastaturLogik.js und ist getestet.
   ====================================================================== */

/* ---------------------------------------------------------------- gemeinsamer Zustand: welches Feld ist aktiv? */
let aktiv = null;                       // { el, modus, enter }
const hoerer = new Set();
const abonnieren = (h) => { hoerer.add(h); return () => hoerer.delete(h); };
const lesen = () => aktiv;
function aktivSetzen(a) {
  if (aktiv === a) return;
  aktiv = a;
  hoerer.forEach((h) => h());
}

const grobZeiger = () => {
  try {
    return (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) || ("ontouchstart" in window && window.innerWidth < 820);
  } catch (e) { return false; }
};

/* Wert eines Eingabefelds so setzen, dass React sein onChange auslöst (alle vorhandenen Filter und Zähler laufen weiter) */
function setzeNativ(el, wert) {
  const proto = typeof HTMLTextAreaElement !== "undefined" && el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, wert);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}
function bearbeite(el, f) {
  const w = el.value, von = el.selectionStart ?? w.length, bis = el.selectionEnd ?? von;
  const r = f(w, von, bis);
  if (r.wert !== w) setzeNativ(el, r.wert);
  requestAnimationFrame(() => { try { el.setSelectionRange(r.pos, r.pos); } catch (e) { /* Feldtyp ohne Auswahl */ } });
}

/* ---------------------------------------------------------------- das Eingabefeld */
export const MatheFeld = forwardRef(function MatheFeld({ modus = "formel", inputMode, onFocus, onBlur, onKeyDown, disabled, ...rest }, ref) {
  const knoten = useRef(null);
  const eintrag = useRef(null);
  const tasteRef = useRef(onKeyDown);
  tasteRef.current = onKeyDown;
  const setRef = (n) => { knoten.current = n; if (typeof ref === "function") ref(n); else if (ref) ref.current = n; };
  useEffect(() => () => { if (aktiv && aktiv === eintrag.current) aktivSetzen(null); }, []);

  const fokus = (e) => {
    if (onFocus) onFocus(e);
    if (disabled || !zeigeAutomatisch(modus, grobZeiger())) return;
    const el = e.target;
    eintrag.current = {
      el, modus,
      enter: () => { const h = tasteRef.current; if (h) h({ key: "Enter", code: "Enter", target: el, currentTarget: el, preventDefault() {}, stopPropagation() {}, persist() {} }); },
      hatEnter: () => !!tasteRef.current,
    };
    aktivSetzen(eintrag.current);
  };
  const verlassen = (e) => {
    if (onBlur) onBlur(e);
    const el = e.target;
    setTimeout(() => {
      const f = document.activeElement;
      if (aktiv && aktiv.el === el && f !== el && !(f && f.closest && f.closest("[data-mathe-tastatur]"))) aktivSetzen(null);
    }, 160);
  };
  return (
    <input autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="done"
      {...rest} ref={setRef} disabled={disabled} inputMode="none" data-mathe-modus={modus} onFocus={fokus} onBlur={verlassen} onKeyDown={onKeyDown} />
  );
});

/* ---------------------------------------------------------------- Beschriftungen für Vorlese-Programme */
const EN_LABEL = { "Löschen": "Delete", "Fertig": "Done", "Minus": "Minus", "Plus": "Plus", "Mal": "Times", "Geteilt": "Divided by", "Hoch": "Power", "Komma": "Comma", "Punkt": "Point",
  "Bruchstrich": "Fraction bar", "Schrägstrich": "Slash", "Klammer auf": "Open bracket", "Klammer zu": "Close bracket", "Pi": "Pi", "hoch 2": "squared", "hoch 3": "cubed", "Wurzel": "Square root",
  "Sinus": "Sine", "Kosinus": "Cosine", "Tangens": "Tangent", "natürlicher Logarithmus": "Natural logarithm", "Logarithmus": "Logarithm", "e hoch": "e to the power", "hoch n": "to the power of n",
  "Kehrwert": "Reciprocal", "Eulersche Zahl": "Euler's number", "f von x": "f of x", "f Strich von x": "f prime of x", "g von x": "g of x", "Gleichheitszeichen": "Equals sign" };
const beschriftung = (t) => { const l = t.label || t.anz; return englisch() ? EN_LABEL[l] || l : l; };

/* ---------------------------------------------------------------- das Tastenfeld */
const taste = (ton) => ({
  minHeight: 46, borderRadius: 12, fontFamily: "inherit", fontSize: 19, fontWeight: 600, cursor: "pointer", padding: 0, touchAction: "manipulation", userSelect: "none", WebkitUserSelect: "none",
  border: `1px solid ${ton === "ok" ? C.smaragd : ton === "nav" ? C.seeTief : C.linie}`,
  background: ton === "ok" ? C.smaragd : ton === "nav" ? C.seeTief : ton === "hell" ? C.himmel : C.weiss,
  color: ton === "ok" ? C.weiss : ton === "nav" ? C.flaggold : C.tinte,
  boxShadow: "0 1px 0 rgba(15,26,51,0.08)",
});

function sichtbarMachen(el, hoehe) {
  try {
    const r = el.getBoundingClientRect();
    const frei = window.innerHeight - hoehe - 14;
    if (r.bottom > frei) window.scrollBy({ top: r.bottom - frei + 6, behavior: "smooth" });
    else if (r.top < 64) window.scrollBy({ top: r.top - 84, behavior: "smooth" });
  } catch (e) { /* ohne Scrollen */ }
}

export function MatheTastaturHost() {
  const a = useSyncExternalStore(abonnieren, lesen, () => null);
  const [ebene, setEbene] = useState("haupt");   // haupt | funk | abc
  const [gross, setGross] = useState(false);
  const blatt = useRef(null);
  const wiederholen = useRef(null);
  const en = englisch();
  const dez = en ? "." : ",";
  const el = a ? a.el : null;

  useEffect(() => { setEbene("haupt"); setGross(false); }, [el]);

  /* Platz schaffen: Seite unten auffüllen und das Feld in Sicht halten */
  useEffect(() => {
    if (!a) return undefined;
    const alt = document.body.style.paddingBottom;
    const hoehe = () => (blatt.current ? blatt.current.offsetHeight : 0);
    const setze = () => { document.body.style.paddingBottom = `${hoehe()}px`; };
    setze();
    const t = setTimeout(() => sichtbarMachen(a.el, hoehe()), 70);
    let ro = null;
    if (typeof ResizeObserver !== "undefined" && blatt.current) { ro = new ResizeObserver(setze); ro.observe(blatt.current); }
    const esc = (e) => { if (e.key === "Escape") { aktivSetzen(null); a.el.blur(); } };
    window.addEventListener("keydown", esc);
    return () => { clearTimeout(t); if (ro) ro.disconnect(); window.removeEventListener("keydown", esc); document.body.style.paddingBottom = alt; };
  }, [a, ebene]);

  useEffect(() => () => clearInterval(wiederholen.current), []);

  if (!a) return null;

  const schliessen = () => { const f = a.el; aktivSetzen(null); try { f.blur(); } catch (e) { /* weg */ } };
  const fertig = () => {
    try { if (a.hatEnter()) a.enter(); } catch (e) { /* Prüfen darf nie die Tastatur blockieren */ }
    schliessen();
  };
  const loescheEins = () => bearbeite(a.el, (w, v, b) => loeschen(w, v, b));
  const druecke = (t) => {
    if (t.aktion === "weg") { loescheEins(); return; }
    if (t.aktion === "ok") { fertig(); return; }
    let text = t.dez ? dez : t.text;
    if (t.buchstabe && gross) { text = text.toUpperCase(); setGross(false); }
    bearbeite(a.el, (w, v, b) => einfuegen(w, v, b, text, t.zurueck || 0));
  };

  /* Löschen: gedrückt halten wiederholt */
  const startWeg = (e) => {
    e.preventDefault();
    loescheEins();
    clearInterval(wiederholen.current);
    const t0 = setTimeout(() => { wiederholen.current = setInterval(loescheEins, 70); }, 380);
    wiederholen.current = t0;
  };
  const stopWeg = () => { clearTimeout(wiederholen.current); clearInterval(wiederholen.current); wiederholen.current = null; };

  const Taste = ({ t, ton, stil }) => {
    const art = t.aktion === "ok" ? "ok" : t.aktion === "weg" ? "nav" : ton;
    const gesetzt = { ...taste(art), ...stil };
    if (t.aktion === "weg") {
      return (
        <button type="button" aria-label={beschriftung(t)} style={gesetzt} onPointerDown={startWeg} onPointerUp={stopWeg} onPointerLeave={stopWeg} onPointerCancel={stopWeg}
          onClick={(e) => { if (e.detail === 0) loescheEins(); }} onMouseDown={(e) => e.preventDefault()}>{t.anz}</button>
      );
    }
    return (
      <button type="button" aria-label={beschriftung(t)} style={gesetzt} onMouseDown={(e) => e.preventDefault()} onClick={() => druecke(t)}>
        {t.dez ? dez : t.buchstabe && gross ? t.anz.toUpperCase() : t.anz}
      </button>
    );
  };

  const zahlModus = a.modus !== "formel";
  const ok = { id: "ok", anz: "OK", aktion: "ok", label: "Fertig" };
  const weg = { id: "weg", anz: "⌫", aktion: "weg", label: "Löschen" };
  const reihen = en ? BUCHSTABEN_EN : BUCHSTABEN_DE;

  let inhalt;
  if (zahlModus) {
    const zt = zahlenTasten(a.modus, dez);
    inhalt = (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        {["7", "8", "9"].map((n) => <Taste key={n} t={Z(n)} />)}<Taste t={weg} />
        {["4", "5", "6"].map((n) => <Taste key={n} t={Z(n)} />)}{zt.minus ? <Taste t={zt.minus} ton="hell" /> : <span />}
        {["1", "2", "3"].map((n) => <Taste key={n} t={Z(n)} />)}{zt.dez ? <Taste t={zt.dez} ton="hell" /> : <span />}
        <Taste t={Z("0")} stil={{ gridColumn: zt.bruch ? "span 2" : "span 3" }} />{zt.bruch ? <Taste t={zt.bruch} ton="hell" /> : null}<Taste t={ok} />
      </div>
    );
  } else if (ebene === "abc") {
    inhalt = (
      <div style={{ display: "grid", gap: 6 }}>
        {reihen.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${r.length}, 1fr)`, gap: 5, padding: i === 1 ? "0 4%" : 0 }}>
            {r.map((b) => <Taste key={b} t={{ id: b, anz: b, text: b, label: gross ? b.toUpperCase() : b, buchstabe: true }} stil={{ fontSize: 17, padding: 0 }} />)}
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 3fr 1fr 1fr 1.4fr", gap: 5 }}>
          <button type="button" aria-pressed={gross} aria-label={en ? "Capital letter" : "Großbuchstabe"} style={{ ...taste(gross ? "nav" : "hell"), fontSize: 17 }} onMouseDown={(e) => e.preventDefault()} onClick={() => setGross(!gross)}>⇧</button>
          <Taste t={{ id: "komma", anz: dez, text: dez, label: "Komma" }} ton="hell" />
          <Taste t={{ id: "leer", anz: en ? "space" : "Leerzeichen", text: " ", label: en ? "Space" : "Leerzeichen" }} stil={{ fontSize: 14 }} />
          <Taste t={{ id: "strich", anz: "′", text: "'", label: en ? "Prime" : "Strich" }} ton="hell" />
          <Taste t={weg} /><Taste t={ok} />
        </div>
      </div>
    );
  } else {
    const liste = ebene === "funk" ? FORMEL_FUNKTION : FORMEL_HAUPT;
    inhalt = (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 5 }}>
        {liste.map((t) => <Taste key={t.id} t={t} ton={/^[0-9]$/.test(t.anz) ? "weiss" : "hell"} stil={t.anz.length > 3 ? { fontSize: 15 } : t.anz.length > 1 && t.aktion !== "ok" ? { fontSize: 16 } : undefined} />)}
      </div>
    );
  }

  const tab = (id, text) => (
    <button key={id} type="button" aria-pressed={ebene === id} onMouseDown={(e) => e.preventDefault()} onClick={() => setEbene(id)}
      style={{ flex: 1, minHeight: 34, borderRadius: 999, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
        border: `1px solid ${ebene === id ? C.see : C.linie}`, background: ebene === id ? C.see : C.weiss, color: ebene === id ? C.weiss : C.grau }}>{text}</button>
  );

  return (
    <div ref={blatt} data-mathe-tastatur role="group" aria-label={en ? "Math keypad" : "Mathe-Tastatur"}
      style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 100000, background: "#E9EDF5", borderTop: `1px solid ${C.linie}`, boxShadow: "0 -6px 24px rgba(15,26,51,0.16)",
        padding: "8px 8px calc(8px + env(safe-area-inset-bottom, 0px))" }}
      onMouseDown={(e) => e.preventDefault()}>
      <style>{"[data-mathe-tastatur] button:active{filter:brightness(0.93);transform:scale(0.97)}"}</style>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
          {zahlModus ? <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: C.grau, paddingLeft: 6 }}>{en ? "Enter a number" : "Zahl eingeben"}</span>
            : [tab("haupt", "123"), tab("funk", "f(x)"), tab("abc", "abc")]}
          <button type="button" aria-label={en ? "Close keypad" : "Tastatur schließen"} onMouseDown={(e) => e.preventDefault()} onClick={schliessen}
            style={{ width: 44, minHeight: 34, borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: C.grau, fontSize: 16, fontFamily: "inherit", cursor: "pointer" }}>⌄</button>
        </div>
        {inhalt}
      </div>
    </div>
  );
}
