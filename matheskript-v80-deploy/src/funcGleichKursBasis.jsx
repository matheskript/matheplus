import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { lernAendern, useLern } from "./func6.jsx";
import { normiere } from "./trainingDaten.js";
import { M } from "./func3.jsx";
import { kurzStand, normiereGleich } from "./gleichKurs.js";
import { L, karte } from "./funcHeadNumbersBasis.jsx";

/* ======================================================================
   Gemeinsame Bausteine des Bereichs „Gleichungen“:
   Speicher, Texte, Rechnungsblatt (Gleichheitszeichen untereinander),
   Rechenkette, Tastatur mit Minus, Logo.
   ====================================================================== */

/* zweisprachige Objekte { de, en } bzw. reine Zeichenketten */
export const tx = (o) => (o == null ? "" : typeof o === "string" ? o : englisch() ? o.en : o.de);

/* ---------------------------------------------------------------- Speicher */
export const gleichAendern = (fn) => lernAendern((X) => {
  X.training = normiere(X.training);
  X.training.gleich = normiereGleich(X.training.gleich);
  fn(X.training.gleich);
  X.training.gleich.stand = kurzStand(X.training.gleich);
});
export const useGleich = () => { const lern = useLern(); return normiereGleich(lern.training && lern.training.gleich); };

/* ---------------------------------------------------------------- Farben */
export const NACHT = C.seeTief;
export const GOLD = C.flaggold;
export const STATUS_FARBE = { neu: "#CDD5E4", unsicher: C.signal, aufbau: C.seeHell, sicher: C.smaragd };
export const STATUS_NAME = () => ({ neu: L("neu", "new"), unsicher: L("unsicher", "shaky"), aufbau: L("im Aufbau", "building"), sicher: L("sicher", "secure") });

/* ---------------------------------------------------------------- Rechnungsblatt
   Eine Zeile pro Schritt, Gleichheitszeichen untereinander (Pen & Paper A6),
   rechts am Rand die Umformung („| − 5“). neu = Index der zuletzt erschienenen Zeile.
   ziel = true: darunter eine leere nächste Zeile als Zielfeld des Modus „Üben“ (Klasse uw-ziel aus
   funcUebenWahl.jsx, data-ueben-ziel) – in sie zieht die gewählte Umformung ein. */
export function Rechnung({ zeilen, neu = -1, opBis = zeilen.length - 1, gross = false, markiereLoesung = true, ziel = false }) {
  const fs = gross ? "clamp(20px, 5.6vw, 26px)" : "clamp(17px, 4.6vw, 21px)";
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", padding: "4px 2px" }}>
      <style>{`@keyframes gkZeile { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
      <div role="list" style={{ display: "grid", gridTemplateColumns: "auto auto auto 1fr", columnGap: 12, rowGap: 6, alignItems: "center", fontSize: fs, color: C.tinte, width: "max-content", minWidth: "100%" }}>
        {zeilen.map((z, i) => {
          const loesung = markiereLoesung && /^x(_\{\d\})?$/.test(z.l);
          const anim = i === neu ? { animation: "gkZeile .45s ease both" } : null;
          const op = i <= opBis && z.op ? (typeof z.op.kurz === "string" ? z.op.kurz : tx(z.op.kurz)) : null;
          return (
            <React.Fragment key={i}>
              <span role="listitem" style={{ justifySelf: "end", whiteSpace: "nowrap", ...anim, ...(loesung ? { fontWeight: 700 } : null) }}><M t={z.l} /></span>
              <span style={{ ...anim, color: C.grau }}>=</span>
              <span style={{ whiteSpace: "nowrap", ...anim, ...(loesung ? { fontWeight: 700, background: "#FFF3C4", borderRadius: 8, padding: "0 8px", boxShadow: `inset 0 0 0 1.5px ${GOLD}` } : null) }}><M t={z.r} /></span>
              <span style={{ whiteSpace: "nowrap", fontSize: "0.72em", color: C.see, fontWeight: 600, paddingLeft: 6, borderLeft: op ? `2px solid ${C.linie}` : "none", ...anim }}>
                {op ? (/^[a-zäöü ]+$/i.test(op) ? op : <M t={op} />) : ""}
              </span>
            </React.Fragment>
          );
        })}
        {ziel && (
          <span role="listitem" className="uw-ziel" data-ueben-ziel aria-label={L("Nächste Zeile – wähle unten die Umformung", "Next line – pick the step below")}
            style={{ gridColumn: "1 / span 3", minHeight: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: "0.95em", padding: "4px 14px" }}>
            <span className="uw-platz">?</span><span style={{ color: C.grau, fontWeight: 400 }}>=</span><span className="uw-platz">?</span>
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Rechenkette
   x → · 3 → 21 → + 5 → 26, darunter rückwärts mit den Umkehrungen.
   schritt: wie viele Rückwärtsschritte schon gezeigt sind (0 … n). */
export function Rechenkette({ kette, schritt = null, ergebnis }) {
  const n = kette.schritte.length;
  const s = schritt === null ? n : schritt;
  const werte = [ergebnis, ...kette.schritte.map((x) => x.wert)];          // werte[0] = x, werte[i] = nach Schritt i
  const kasten = (inhalt, { gold = false, aktiv = false, frage = false } = {}) => (
    <span style={{ minWidth: 46, height: 44, padding: "0 10px", borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, flexShrink: 0,
      background: gold ? "#FFF3C4" : C.weiss, color: frage ? C.see : C.tinte, border: `2px solid ${gold ? GOLD : aktiv ? C.see : C.linie}`, transition: "all .35s ease" }}>{inhalt}</span>
  );
  const pfeil = (op, unten, sichtbar = true) => (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", minWidth: 54, flexShrink: 0, opacity: sichtbar ? 1 : 0.15, transition: "opacity .35s ease" }}>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: unten ? C.gruenDunkel : C.see, whiteSpace: "nowrap" }}><M t={op} /></span>
      <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1, color: unten ? GOLD : C.seeHell }}>{unten ? "⟵" : "⟶"}</span>
    </span>
  );
  const fmt = (v) => String(v).replace("-", "−");
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 10, minWidth: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} aria-label={L("Vorwärts gerechnet", "Calculated forwards")}>
          {kasten("x", { frage: true })}
          {kette.schritte.map((st, i) => <React.Fragment key={i}>{pfeil(st.vor, false)}{kasten(fmt(st.wert), { aktiv: i === n - 1 })}</React.Fragment>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} aria-label={L("Rückwärts gerechnet", "Calculated backwards")}>
          {kasten(s >= n ? fmt(werte[0]) : "?", { gold: s >= n })}
          {kette.schritte.map((st, i) => {
            /* rückwärts von rechts nach links: Pfeil i (zwischen Kasten i und i+1) erscheint, sobald s ≥ n − i */
            const pfeilDa = s >= n - i;
            const kastenDa = i + 1 >= n - s;
            return <React.Fragment key={i}>{pfeil(st.rueck, true, pfeilDa)}{kasten(kastenDa ? fmt(werte[i + 1]) : "", { aktiv: i === n - 1 })}</React.Fragment>;
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Tastatur mit Minus */
export function GleichTastatur({ onZeichen, onLoeschen, onOk, gesperrt }) {
  const t = (inhalt, onClick, art, label, extra) => (
    <button key={label || String(inhalt)} type="button" disabled={gesperrt} onClick={onClick} aria-label={label || String(inhalt)} className="gk-taste"
      style={{ minHeight: 54, borderRadius: 14, fontFamily: "inherit", fontSize: art === "ok" ? 17 : 23, fontWeight: 700, cursor: gesperrt ? "default" : "pointer",
        border: `1px solid ${art === "ok" ? C.smaragd : art === "nav" ? NACHT : C.linie}`,
        background: art === "ok" ? C.smaragd : art === "nav" ? NACHT : C.weiss, color: art === "ok" ? C.weiss : art === "nav" ? GOLD : C.tinte, ...extra }}>{inhalt}</button>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
      <style>{`.gk-taste{transition:transform .08s ease, filter .12s ease}.gk-taste:active{transform:scale(0.94);filter:brightness(0.94)}`}</style>
      {[7, 8, 9].map((z) => t(z, () => onZeichen(String(z))))}
      {t("⌫", onLoeschen, "nav", L("Löschen", "Delete"))}
      {[4, 5, 6].map((z) => t(z, () => onZeichen(String(z))))}
      {t("−", () => onZeichen("−"), "nav", L("Minus", "Minus"))}
      {[1, 2, 3].map((z) => t(z, () => onZeichen(String(z))))}
      {t("OK", onOk, "ok", L("Prüfen", "Check"), { gridRow: "span 2" })}
      {t(0, () => onZeichen("0"), null, "0", { gridColumn: "span 3" })}
    </div>
  );
}
/* Eingabe ergänzen: Minus nur vorn, höchstens 4 Ziffern */
export const eingeben = (alt, z) => {
  if (z === "−") return alt.startsWith("−") ? alt.slice(1) : `−${alt}`;
  const ziffern = alt.replace("−", "");
  if (ziffern.length >= 4) return alt;
  if (ziffern === "0") return alt.replace("0", z);
  return alt + z;
};

/* ---------------------------------------------------------------- kleine Bausteine */
/* optionen: [[id, name, nr], …]; titel(id) → Tooltip (z. B. der Satz des Modus). Ab vier Reitern wird die
   Schrift am Handy kleiner, die Nummer verschwindet unter 420 px und die Spalten folgen dem Inhalt
   („Understand“ bekommt mehr Platz als „Auto“), damit jede Beschriftung in einer Zeile bleibt. */
export function Reiter({ wert, onWahl, optionen, titel = null }) {
  const viele = optionen.length >= 4;
  return (
    <div role="tablist" aria-label={L("Bereich wählen", "Choose section")} className={viele ? "gk-reiter gk-reiter-viele" : "gk-reiter"}
      style={{ display: "grid", gridTemplateColumns: `repeat(${optionen.length}, ${viele ? "auto" : "minmax(0, 1fr)"})`, gap: 4, padding: 4, borderRadius: 16, background: "#E9EEF6", marginBottom: 18 }}>
      {viele && <style>{`@media (max-width: 419px){.gk-reiter-viele .gk-reiter-nr{display:none}}`}</style>}
      {optionen.map(([id, name, nr]) => {
        const an = id === wert;
        return (
          <button key={id} type="button" role="tab" aria-selected={an} onClick={() => onWahl(id)} title={titel ? titel(id) : undefined}
            style={{ minHeight: 46, minWidth: 0, padding: viele ? "0 2px" : undefined, borderRadius: 12, border: "none", fontFamily: "inherit", cursor: "pointer", fontSize: viele ? "clamp(12.5px, 3.6vw, 14.5px)" : 14.5, fontWeight: 700, whiteSpace: "nowrap",
              background: an ? `linear-gradient(155deg, ${C.see} 0%, ${NACHT} 100%)` : "transparent", color: an ? C.weiss : C.see, boxShadow: an ? "0 3px 10px rgba(0,77,152,0.25)" : "none" }}>
            <span className="gk-reiter-nr" style={{ color: an ? GOLD : C.hellgrau, marginRight: 6, fontWeight: 800 }}>{nr}</span>{name}
          </button>
        );
      })}
    </div>
  );
}

export function StufenChips({ wert, onWahl, stufen, info, status }) {
  const ref = useRef(null);
  useEffect(() => {
    /* Nur die Chip-Leiste waagerecht verschieben, die Seite selbst bleibt stehen */
    const el = ref.current && ref.current.querySelector("[aria-pressed='true']");
    const box = ref.current;
    if (el && box && box.scrollWidth > box.clientWidth) {
      const ziel = box.scrollLeft + el.getBoundingClientRect().left - box.getBoundingClientRect().left - (box.clientWidth - el.offsetWidth) / 2;
      try { box.scrollTo({ left: Math.max(0, ziel), behavior: "smooth" }); } catch (e) { box.scrollLeft = Math.max(0, ziel); }   // sprung-frei: nur waagerecht in der Leiste
    }
  }, [wert]);
  return (
    <div ref={ref} style={{ display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", padding: "2px 2px 8px", margin: "0 -2px 8px" }}>
      {stufen.map((s) => {
        const an = s === wert;
        const st = status ? status[s] : null;
        return (
          <button key={s} type="button" aria-pressed={an} onClick={() => onWahl(s)} aria-label={`${L("Stufe", "Level")} ${info[s].nr}: ${tx(info[s].titel)}`}
            style={{ flexShrink: 0, minHeight: 44, padding: "6px 14px", borderRadius: 999, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700,
              border: `2px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss, color: C.tinte, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.see }}>{info[s].nr}</span>
            <span style={{ fontWeight: 600, color: C.grau }}><M t={info[s].beispiel} /></span>
            {st && st !== "neu" && <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 99, background: STATUS_FARBE[st] }} />}
          </button>
        );
      })}
    </div>
  );
}

export function InfoKarte({ info, children }) {
  return (
    <div style={{ background: "#FFF8DC", borderLeft: `4px solid ${GOLD}`, borderRadius: "4px 14px 14px 4px", padding: "12px 14px", marginBottom: 14 }}>
      <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 4 }}>{L("Das wissen wir über die Zahl", "What we know about the number")}</p>
      <p style={{ fontSize: 15.5, color: C.tinte, lineHeight: 1.55, fontWeight: 500 }}>{tx(info)}</p>
      {children}
    </div>
  );
}

export function GleichungGross({ a }) {
  return (
    <div style={{ textAlign: "center", fontSize: "clamp(24px, 7vw, 32px)", fontWeight: 600, color: C.tinte, padding: "8px 0 4px", overflowX: "auto" }}>
      <span style={{ whiteSpace: "nowrap" }}><M t={`${a.gl[0]} = ${a.gl[1]}`} /></span>
    </div>
  );
}

export const Karte = ({ children, style }) => <section style={{ ...karte, padding: 18, marginBottom: 14, ...style }}>{children}</section>;

export function useBewegung() {
  const [an, setAn] = useState(true);
  useEffect(() => {
    let mq; try { mq = window.matchMedia("(prefers-reduced-motion: reduce)"); } catch { return undefined; }
    const f = () => setAn(!mq.matches);
    f();
    mq.addEventListener ? mq.addEventListener("change", f) : mq.addListener(f);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", f) : mq.removeListener(f));
  }, []);
  return an;
}
