/* ======================================================================
   geoDesktop.jsx – Desktop-Bausteine der Geometrie-Werkzeuge
   (Koordinaten, Flächen, Quader, Winkelsätze, Konstruktion, Kongruenz,
   Thales, Pythagoras, Kathetensatz, Kreis, Körper, Strahlensätze,
   Trigonometrie). Nur im Desktop-Zweig (useDesktop) verwenden – das Handy
   bleibt bei seinen eigenen Bausteinen (Regler, Auswahl, Merke aus geoUi/ui2).
   Stil wie „Ebene vs. Ebene“ (DESKTOP-STIL.md):
     • Themenleiste (Kicker + Chips) über die volle Breite, wie ein Reiter
     • Arbeitsfläche: links Einstellungen (ReglerKarte, WerteKarte), rechts
       das Bild in der BildKarte, darunter die Werkzeugleiste
     • Darunter Erklärungen in feinen Karten (ErklaerKarte)
     • Regler: + oben, Wert in der Mitte, − unten (wie EbenenKarte)
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React from "react";
import { C } from "./base1.jsx";
import { MS } from "./ui2.jsx";
import { zt } from "./ui3.jsx";
import { Arbeitsflaeche, BildKarte, FeinKarte, Kicker, Werkzeugleiste, chipStil, hinweisStil, titelStil } from "./arbeitsflaeche.jsx";

/* ---------- Regler: Name und Schieber links, + / Wert / − rechts untereinander ----------
   aria-labels wie beim Regler aus geoUi („a +“, „a −“, Schieber „a“) */
export function ReglerD({ name, wert, setWert, min, max, schritt, farbe = C.see, format = (v) => zt(v, 1), stellen = 1000 }) {
  const setze = (v) => setWert(Math.round(Math.max(min, Math.min(max, v)) * stellen) / stellen);
  const aus = (d) => (d < 0 && wert <= min + 1e-9) || (d > 0 && wert >= max - 1e-9);
  const knopf = (d, z) => (
    <button type="button" className="eve-knopf" aria-label={`${name} ${d > 0 ? "+" : "−"}`} onClick={() => setze(wert + d * schritt)} disabled={aus(d)}
      style={{ width: "100%", height: 30, borderRadius: 9, border: `1.5px solid ${farbe}55`, background: `${farbe}12`, color: farbe, fontSize: 18, fontWeight: 700,
        fontFamily: "inherit", cursor: aus(d) ? "default" : "pointer", padding: 0, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
        touchAction: "manipulation", opacity: aus(d) ? 0.35 : 1 }}>{z}</button>
  );
  const text = String(format(wert));
  return (
    <div data-regler-d={name} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 74px", columnGap: 14, alignItems: "center" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: farbe, marginBottom: 8, lineHeight: 1.25 }}>{name}</div>
        <input type="range" min={min} max={max} step={schritt} value={wert} onChange={(e) => setze(Number(e.target.value))} aria-label={name}
          style={{ width: "100%", margin: 0, accentColor: farbe, display: "block" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {knopf(1, "+")}
        <span style={{ fontSize: text.length >= 7 ? 13 : 15, fontWeight: 800, color: C.tinte, fontVariantNumeric: "tabular-nums", lineHeight: 1.2, whiteSpace: "nowrap" }}>{text}</span>
        {knopf(-1, "−")}
      </div>
    </div>
  );
}

/* Karte mit Überschrift und Reglern (mit feiner Trennlinie dazwischen) */
export function ReglerKarte({ titel, hinweis, children, ...rest }) {
  const k = React.Children.toArray(children).filter(Boolean);
  return (
    <FeinKarte {...rest}>
      {titel && <p style={{ ...titelStil, marginBottom: 14 }}>{titel}</p>}
      {k.map((c, i) => (
        <div key={i} style={i ? { borderTop: `1px solid ${C.linie}`, marginTop: 14, paddingTop: 14 } : undefined}>{c}</div>
      ))}
      {hinweis && <p style={{ ...hinweisStil, margin: "14px 0 0" }}>{hinweis}</p>}
    </FeinKarte>
  );
}

/* Karte mit Kennzahlen (WertZeilen) */
export function WerteKarte({ titel, children, ...rest }) {
  return (
    <FeinKarte {...rest} style={{ padding: "16px 20px 10px", ...rest.style }}>
      {titel && <p style={{ ...titelStil, marginBottom: 4 }}>{titel}</p>}
      {children}
    </FeinKarte>
  );
}

/* Auswahl als Chips (gleiche Rolle wie Auswahl aus ui2: role=group, aria-pressed) */
export function ChipWahl({ optionen, wert, setWert, label, farbe = C.see }) {
  return (
    <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {optionen.map(([id, text]) => {
        const an = wert === id;
        return (
          <button key={id} type="button" aria-pressed={an} onClick={() => setWert(id)} style={{ ...chipStil(an, farbe), fontWeight: 600 }}>
            <MS s={text} />
          </button>
        );
      })}
    </div>
  );
}

/* Themenleiste über der Arbeitsfläche: wie ein Reiter (Was willst du sehen? / Figur / Fall) */
export function ThemenLeiste({ titel, optionen, wert, setWert, label, unter }) {
  return (
    <div data-themenleiste style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px 14px" }}>
        {titel && <Kicker style={{ marginBottom: 0 }}>{titel}</Kicker>}
        <ChipWahl optionen={optionen} wert={wert} setWert={setWert} label={label} />
      </div>
      {unter && <p style={{ ...hinweisStil, margin: "10px 0 0", color: C.see, fontWeight: 600 }}>{unter}</p>}
    </div>
  );
}

/* Erklärung / Merksatz in einer feinen Karte, links ein schmaler Farbstrich */
export function ErklaerKarte({ titel, farbe = C.see, children, style, ...rest }) {
  return (
    <FeinKarte {...rest} style={{ display: "grid", gridTemplateColumns: "4px minmax(0, 1fr)", columnGap: 16, background: `${farbe}07`, borderColor: `${farbe}22`, ...style }}>
      <span aria-hidden="true" style={{ background: farbe, borderRadius: 4, opacity: 0.8 }} />
      <div style={{ minWidth: 0 }}>
        {titel && <p style={{ ...titelStil, marginBottom: 6 }}>{titel}</p>}
        <div style={{ fontSize: 14, lineHeight: 1.65, color: C.tinte }}>{children}</div>
      </div>
    </FeinKarte>
  );
}

/* Der ganze Desktop-Aufbau eines Entdecken-Teils */
export function GeoDesktop({ thema, links, bild, werkzeuge, unten, bildStil, style, ...rest }) {
  const u = React.Children.toArray(unten).filter(Boolean);
  return (
    <div data-geo-desktop {...rest} style={{ marginTop: 16, ...style }}>
      {thema}
      <Arbeitsflaeche
        links={links}
        rechts={<>
          <BildKarte data-geo-bild style={{ padding: 8, ...bildStil }}>{bild}</BildKarte>
          {werkzeuge && <Werkzeugleiste gruppen={werkzeuge} />}
        </>} />
      {u.length > 0 && <div style={{ display: "grid", gap: 16, marginTop: 20 }}>{u}</div>}
    </div>
  );
}

/* Übung am Desktop: Aufgabe und Schritte links breit, Skizze rechts (300 px) – wie UebenRahmen */
export function AufgabeZweispaltig({ links, skizze }) {
  return (
    <div data-ueben-zweispaltig style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 300px)", gap: 20, alignItems: "start" }}>
      <div style={{ minWidth: 0 }}>{links}</div>
      <div style={{ position: "sticky", top: 76, background: C.sand, borderRadius: 14, padding: 6 }}>{skizze}</div>
    </div>
  );
}
