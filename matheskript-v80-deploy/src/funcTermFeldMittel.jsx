/* ============================================================
   TermFeldMittel – Termeingabe für die Mittelstufe (seit 22.10.)
   Der Term steht beim Tippen schon als Mathe da: Bruchstrich,
   hochgestellte Zahl, leere Kästchen als Platzhalter – keine
   „Gelesen als“-Zeile. Tastenfeld nur mit dem, was Klasse 7–10
   braucht (Ziffern, x, + − · :, Klammern, x², xⁿ, Bruch).
   Modell rein in termFeldMittel.js; geprüft wird mit dem
   bestehenden Formel-Parser über ref.lesen() → { text } | { fehler }.
   Kein automatisches Scrollen der Seite (Sprung-Regel): nur das
   Feld selbst rollt waagrecht zur Schreibmarke.
   ============================================================ */

import React, { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { zw } from "./ui2.jsx";
import { neuesModell, taste, alsText, tasteAus, TASTEN_MITTEL, istBaustein, klammerInfo, istLeer, FEHLER_TEXT } from "./termFeldMittel.js";

const CSS = `
.tm-feld{position:relative;min-height:60px;border:1.5px solid ${C.linie};border-radius:14px;padding:10px 14px;font-size:24px;color:${C.tinte};
  display:flex;align-items:center;overflow-x:auto;overflow-y:hidden;cursor:text;background:${C.weiss};outline:none;transition:border-color .15s,box-shadow .15s;scrollbar-width:thin}
.tm-feld.aktiv{border-color:${C.see};box-shadow:0 0 0 3px ${C.himmel}}
.tm-feld.wackeln{animation:tm-wackeln .45s;border-color:#C6332F}
@keyframes tm-wackeln{20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
.tm-leer{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:${C.hellgrau};font-size:15px;pointer-events:none}
.tm-zeile{display:inline-flex;align-items:center;white-space:nowrap;min-height:1.2em}
.tm-a{display:inline-block;line-height:1.15}
.tm-a.var{font-style:italic;padding:0 .02em}
.tm-a.op{margin:0 .2em}
.tm-a.op.vz{margin:0 .05em 0 .02em}
.tm-a.kl{padding:0 .03em}
.tm-a.geist{color:${C.hellgrau}}
.tm-a.falsch{color:#C6332F}
.tm-marke{display:inline-block;width:2px;height:1.15em;background:${C.see};margin:0 -1px;vertical-align:middle;border-radius:1px;animation:tm-blink 1.05s steps(1) infinite}
.tm-feld:not(.aktiv) .tm-marke{visibility:hidden}
@keyframes tm-blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.tm-marke{animation:none}.tm-feld.wackeln{animation:none}}
.tm-kasten{display:inline-flex;align-items:center;justify-content:center;min-width:.72em;min-height:1em;border:1.5px dashed ${C.hellgrau};border-radius:4px;margin:0 .05em}
.tm-kasten.hier{border-style:solid;border-color:${C.see};background:${C.himmel}}
.tm-bruch{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 .12em;font-size:.9em;line-height:1.1}
.tm-bruch>.tm-zeile{padding:.04em .2em;justify-content:center}
.tm-bruch>.oben{border-bottom:1.6px solid currentColor;padding-bottom:.08em}
.tm-bruch>.unten{padding-top:.1em}
.tm-hoch{display:inline-flex;align-items:center;font-size:.62em;position:relative;top:-.72em;margin:0 .08em 0 .04em;line-height:1}
.tm-tasten{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;margin-top:10px;max-width:460px}
.tm-taste{height:46px;border:0;border-radius:12px;background:${C.weiss};color:${C.tinte};box-shadow:0 1px 0 #C9D3E3,0 0 0 1px ${C.linie} inset;
  font-size:20px;font-weight:500;font-family:inherit;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none;display:grid;place-items:center;padding:0;transition:transform .06s}
.tm-taste:active{transform:scale(.95)}
.tm-taste.op{background:${C.sand};font-size:22px}
.tm-taste.var{font-style:italic;font-weight:700;color:${C.see};background:${C.himmel}}
.tm-taste.nav{background:${C.sand};font-size:18px}
.tm-taste.loesch{background:${C.seeTief};color:${C.flaggold}}
.tm-taste:focus-visible{outline:2px solid ${C.flaggold};outline-offset:2px}
.tm-feld:focus-visible{outline:none}
.tm-taste .k{font-size:.6em;vertical-align:.55em}
.tm-taste .b{display:inline-flex;flex-direction:column;align-items:center;font-size:12px;line-height:1.1;font-style:italic}
.tm-taste .b i{border-bottom:1.5px solid currentColor;padding:0 3px}
@media (min-width:840px){.tm-taste{height:44px}}
`;

const ART = (t) => (/^[0-9,]$/.test(t) ? "" : t === "x" ? "var" : t === "⌫" ? "loesch" : t === "←" || t === "→" ? "nav" : "op");
const BESCHRIFTUNG = {
  "x²": <span><i>x</i><span className="k">2</span></span>,
  "xⁿ": <span><i>x</i><span className="k">n</span></span>,
  bruch: <span className="b"><i>a</i><span>b</span></span>,
  x: "x",
};
const ARIA = { "⌫": "Löschen", "←": "Schreibmarke nach links", "→": "Schreibmarke nach rechts", "x²": "hoch 2", "xⁿ": "Hochzahl", bruch: "Bruch", "·": "mal", ":": "geteilt durch", "−": "minus", "+": "plus", ",": "Komma", "(": "Klammer auf", ")": "Klammer zu" };
const WIEDERHOLEN = new Set(["⌫", "←", "→"]);

export const TermFeldMittel = forwardRef(function TermFeldMittel({ label, platzhalter, onAenderung, onOk }, ref) {
  const modell = useRef(null);
  if (!modell.current) modell.current = neuesModell();
  const m = modell.current;
  const [, neuZeichnen] = useState(0);
  const [aktiv, setAktiv] = useState(false);
  const feldRef = useRef(null);
  const halten = useRef(null);

  const geaendert = () => { neuZeichnen((n) => n + 1); onAenderung?.({ leer: istLeer(m) }); };
  const druecke = (t) => { taste(m, t); geaendert(); };

  useImperativeHandle(ref, () => ({
    /* { text } zum Prüfen – oder { fehler } mit Text; die Marke springt an die leere Stelle */
    lesen() {
      if (istLeer(m)) return { leer: true };
      const r = alsText(m);
      if (r.text != null) return { text: r.text };
      m.marke = { zeile: r.zeile, idx: Math.min(r.idx, r.zeile.length) };
      setAktiv(true); neuZeichnen((n) => n + 1);
      const f = feldRef.current;
      if (f) { f.classList.remove("wackeln"); void f.offsetWidth; f.classList.add("wackeln"); f.focus({ preventScroll: true }); }
      return { fehler: zw(...FEHLER_TEXT[r.fehler]) };
    },
  }), [m]);

  /* Feld rollt waagrecht zur Marke – nie die Seite */
  useLayoutEffect(() => {
    const f = feldRef.current; const mk = f && f.querySelector(".tm-marke"); if (!mk) return;
    const a = f.getBoundingClientRect(), b = mk.getBoundingClientRect();
    if (b.right > a.right - 16) f.scrollLeft += b.right - a.right + 24;
    else if (b.left < a.left + 16) f.scrollLeft -= a.left - b.left + 24;
  });

  const setzeMarke = (zeile, idx) => { m.marke = { zeile, idx }; setAktiv(true); neuZeichnen((n) => n + 1); };

  function zeileZeigen(zeile, klasse = "", key) {
    const hier = m.marke.zeile === zeile;
    if (zeile.length === 0 && zeile.eltern) {
      return (
        <span key={key} className={`tm-zeile tm-kasten${hier ? " hier" : ""} ${klasse}`}
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); feldRef.current?.focus({ preventScroll: true }); setzeMarke(zeile, 0); }}>
          {hier && <span className="tm-marke" />}
        </span>
      );
    }
    const { offen, falsch } = klammerInfo(zeile);
    const teile = [];
    zeile.forEach((it, i) => {
      if (hier && m.marke.idx === i) teile.push(<span key={`m${i}`} className="tm-marke" />);
      const tippen = (e) => {
        e.preventDefault(); e.stopPropagation(); feldRef.current?.focus({ preventScroll: true });
        if (istBaustein(it)) return;
        const r = e.currentTarget.getBoundingClientRect();
        setzeMarke(zeile, i + (e.clientX > r.left + r.width / 2 ? 1 : 0));
      };
      if (istBaustein(it)) {
        teile.push(it.t === "bruch"
          ? <span key={i} className="tm-bruch">{zeileZeigen(it.zaehler, "oben", "z")}{zeileZeigen(it.nenner, "unten", "n")}</span>
          : <span key={i} className="tm-hoch">{zeileZeigen(it.inhalt, "", "h")}</span>);
        return;
      }
      const vor = zeile[i - 1];
      const k = ["tm-a"];
      if (it === "x") k.push("var");
      else if ("+−·:".includes(it)) { k.push("op"); if ((it === "−" || it === "+") && (i === 0 || vor === "(" || "+−·:".includes(vor))) k.push("vz"); }
      else if (it === "(" || it === ")") { k.push("kl"); if (falsch.has(i)) k.push("falsch"); }
      teile.push(<span key={i} className={k.join(" ")} onPointerDown={tippen}>{it}</span>);
    });
    if (hier && m.marke.idx === zeile.length) teile.push(<span key="mEnde" className="tm-marke" />);
    for (let j = 0; j < offen; j++) teile.push(<span key={`g${j}`} className="tm-a kl geist" aria-hidden="true">)</span>);
    return (
      <span key={key} className={`tm-zeile ${klasse}`}
        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); feldRef.current?.focus({ preventScroll: true }); setzeMarke(zeile, zeile.length); }}>
        {teile}
      </span>
    );
  }

  const tasteDruck = (t) => (e) => {
    e.preventDefault();
    feldRef.current?.focus({ preventScroll: true }); setAktiv(true);
    druecke(t);
    if (WIEDERHOLEN.has(t)) {
      clearTimeout(halten.current);
      halten.current = setTimeout(function wieder() { druecke(t); halten.current = setTimeout(wieder, 70); }, 420);
    }
  };
  const loslassen = () => clearTimeout(halten.current);

  return (
    <div data-termfeld-mittel>
      <style>{CSS}</style>
      <div ref={feldRef} className={`tm-feld${aktiv ? " aktiv" : ""}`} tabIndex={0} role="textbox" aria-label={label}
        data-tm-feld onFocus={() => setAktiv(true)} onBlur={() => setAktiv(false)} onAnimationEnd={(e) => e.currentTarget.classList.remove("wackeln")}
        onPointerDown={(e) => { e.preventDefault(); feldRef.current?.focus({ preventScroll: true }); setzeMarke(m.wurzel, m.wurzel.length); }}
        onKeyDown={(e) => {
          if (e.metaKey || e.ctrlKey || e.altKey) return;
          if (e.key === "Enter") { e.preventDefault(); onOk?.(); return; }
          if (e.key === "Escape") { e.preventDefault(); druecke("leeren"); return; }
          const t = tasteAus(e.key);
          if (t) { e.preventDefault(); druecke(t); }
        }}>
        {zeileZeigen(m.wurzel)}
        {istLeer(m) && <span className="tm-leer">{platzhalter || zw("Tippe deinen Term …", "Type your term …")}</span>}
      </div>
      <div className="tm-tasten" role="group" aria-label={zw("Tastenfeld", "Keypad")} onPointerUp={loslassen} onPointerCancel={loslassen} onPointerLeave={loslassen}>
        {TASTEN_MITTEL.map(([t]) => (
          <button key={t} type="button" className={`tm-taste ${ART(t)}`} data-tm-taste={t} aria-label={ARIA[t] || t}
            onPointerDown={tasteDruck(t)}
            onClick={(e) => { if (e.detail === 0) druecke(t); }}>
            {BESCHRIFTUNG[t] ?? t}
          </button>
        ))}
      </div>
    </div>
  );
});
