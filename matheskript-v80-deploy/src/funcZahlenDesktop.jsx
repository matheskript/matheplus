/* ============================================================
   Desktop-Bausteine der Gruppe „Zahlen, Terme, Unterstufe“
   (Dezimal, Stellenwert, Ganze Zahlen, Primzahlen, Rechengesetze, Größen,
   Zuordnungen, Prozent, Bruchrechnen, Bruchterme, Terme, Axiome,
   Zahlenräume, Mengen und Logik, Textaufgaben).
   Nur im Desktop-Zweig (ab 840 px, DESKTOP-STIL.md) verwenden – der
   Handy-Zweig der Seiten bleibt unverändert.
   Allgemeine Bausteine stehen in arbeitsflaeche.jsx; hier nur, was mehrere
   Seiten dieser Gruppe gleich brauchen.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";
import { MS, karte } from "./ui2.jsx";
import { Arbeitsflaeche, BildKarte, FeinKarte, Kicker, chipStil, feinKarte, hinweisStil, titelStil, toenKarte, useDesktop } from "./arbeitsflaeche.jsx";

/* Karte: am Desktop mit feinem Rahmen (ohne Schatten), auf dem Handy wie bisher */
export const useKarte = () => (useDesktop() ? feinKarte : karte);

/* Knopf im Stil der EbenenKarte (func19.jsx): Höhe 30, Rundung 9, Farbe der Größe */
const stellKnopf = (f, aus) => ({
  width: "100%", maxWidth: 66, height: 30, borderRadius: 9, border: `1.5px solid ${f}55`, background: `${f}12`,
  color: f, fontSize: 18, fontWeight: 700, fontFamily: "inherit", cursor: aus ? "default" : "pointer", padding: 0, lineHeight: 1,
  display: "flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation", opacity: aus ? 0.35 : 1,
});

/* Stellwerte als getönte Karte: je Größe eine Spalte mit + oben, Wert in der Mitte, − unten.
   werte: [{ name, wert, setWert, min, max, schritt = 1, farbe, format, regler }]
   regler: true → zusätzlich ein Schieberegler unter den Spalten (für große Bereiche).
   kopf: optionale Zeile über den Spalten (z. B. der Bruch), titel: Kicker darüber. */
export function StellKarte({ titel, kopf, farbe = C.see, werte, children, style, ...rest }) {
  const setze = (w, v) => w.setWert(Math.round(Math.max(w.min, Math.min(w.max, v)) * 1000) / 1000);
  const fmt = (w) => (w.format ? w.format(w.wert) : String(w.wert).replace("-", "−"));
  const mitRegler = werte.filter((w) => w.regler);
  return (
    <div {...rest} style={{ ...toenKarte(farbe), ...style }}>
      {titel && <Kicker style={{ color: farbe, marginBottom: 10 }}>{titel}</Kicker>}
      {kopf && <>
        <div style={{ textAlign: "center", fontSize: 18, fontWeight: 800, color: C.tinte, overflowX: "auto" }}>{kopf}</div>
        <div style={{ height: 1, background: `${farbe}22`, margin: "12px 4px" }} />
      </>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${werte.length}, minmax(0, 1fr))`, gap: 6 }}>
        {werte.map((w) => {
          const f = w.farbe || farbe, s = w.schritt ?? 1;
          const obenAus = w.wert >= w.max - 1e-9, untenAus = w.wert <= w.min + 1e-9;
          return (
            <div key={w.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: f, letterSpacing: "0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{w.name}</span>
              <button type="button" className="eve-knopf" aria-label={`${w.name} +`} disabled={obenAus} style={stellKnopf(f, obenAus)} onClick={() => setze(w, w.wert + s)}>+</button>
              <span style={{ fontSize: fmt(w).length >= 6 ? 14 : 16, fontWeight: 800, color: C.tinte, fontVariantNumeric: "tabular-nums", lineHeight: 1.2, whiteSpace: "nowrap" }}>{fmt(w)}</span>
              <button type="button" className="eve-knopf" aria-label={`${w.name} −`} disabled={untenAus} style={stellKnopf(f, untenAus)} onClick={() => setze(w, w.wert - s)}>−</button>
            </div>
          );
        })}
      </div>
      {mitRegler.length > 0 && (
        <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
          {mitRegler.map((w) => (
            <div key={w.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: w.farbe || farbe, minWidth: 24 }}>{w.name}</span>
              <input type="range" min={w.min} max={w.max} step={w.schritt ?? 1} value={w.wert} aria-label={w.name}
                onChange={(e) => setze(w, Number(e.target.value))} style={{ flex: 1, minWidth: 0, accentColor: w.farbe || farbe }} />
            </div>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

/* Chips als Auswahl (role=group, aria-pressed wie Auswahl in ui2.jsx) – für die Werkzeugleiste */
export function ChipAuswahl({ optionen, wert, setWert, label, farbe = C.see }) {
  return (
    <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {optionen.map(([id, t]) => (
        <button key={String(id)} type="button" aria-pressed={wert === id} onClick={() => setWert(id)} style={chipStil(wert === id, farbe)}>
          {typeof t === "string" ? <MS s={t} /> : t}
        </button>
      ))}
    </div>
  );
}

/* Knappe Ergebniskarte links unter den Einstellungen */
export function ErgebnisKarte({ titel, children, style, ...rest }) {
  return (
    <FeinKarte {...rest} style={style}>
      {titel && <p style={titelStil}>{titel}</p>}
      {children}
    </FeinKarte>
  );
}

/* Lange Formel/Tabelle links, kurze Erklärung rechts (Raster minmax(0,1fr) minmax(0,240px)) */
export function ErklaerKarte({ titel, links, rechts, style, ...rest }) {
  return (
    <FeinKarte {...rest} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 240px)", columnGap: 32, alignItems: "center", ...style }}>
      <div style={{ minWidth: 0 }}>
        {titel && <p style={titelStil}>{titel}</p>}
        {links}
      </div>
      <div style={{ borderLeft: `2px solid ${C.linie}`, paddingLeft: 18, ...hinweisStil }}>{rechts}</div>
    </FeinKarte>
  );
}

/* Zwei Aktionsknöpfe nebeneinander (z. B. „Nächster Schritt“ | „Von vorn“) im ruhigen Desktop-Stil */
export function AktionsKnopf({ children, onClick, disabled, haupt, farbe = C.see }) {
  return (
    <button type="button" className="eve-knopf" onClick={onClick} disabled={disabled}
      style={{ width: "100%", minHeight: 42, borderRadius: 12, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: disabled ? "default" : "pointer",
        border: `1.5px solid ${haupt ? farbe : C.linie}`, background: haupt ? farbe : C.weiss, color: haupt ? C.weiss : farbe, opacity: disabled ? 0.45 : 1, padding: "8px 10px" }}>
      {children}
    </button>
  );
}

/* Labor im Desktop-Stil (Mengen und Logik): links Titel, Aufforderung und Einstellungen in einer FeinKarte,
   rechts das Bild in einer BildKarte, darunter optional weitere Ergebnisse. data-labor bleibt für die Tests. */
export function LaborFlaeche({ titel, aufforderung, links, bild, rechts, bildStil }) {
  return (
    <div data-labor style={{ marginTop: 20 }}>
      <Arbeitsflaeche
        links={<FeinKarte>
          {titel && <p style={titelStil}>{titel}</p>}
          {aufforderung && <p style={{ ...hinweisStil, margin: "0 0 14px" }}>{aufforderung}</p>}
          {links}
        </FeinKarte>}
        rechts={<>
          {bild && <BildKarte style={{ padding: 16, ...bildStil }}>{bild}</BildKarte>}
          {rechts}
        </>} />
    </div>
  );
}
