/* ============================================================
   Desktop-Bausteine der Trainer (Analysis und Gleichungen), ergänzend zu arbeitsflaeche.jsx:
   · SenkrechtRegler / ReglerReihe – Regler im Stil der EbenenKarte (func19.jsx, DESKTOP-STIL.md):
     + oben, Wert in der Mitte, − unten; Höhe 30, Rundung 9, Farbe der Größe, Klasse eve-knopf.
     aria-labels kommen vom Aufrufer, damit sie mit dem Handy-Regler übereinstimmen.
   · kompaktSpalteCss – Seiten mit eigener schlanker Kopfleiste (KompaktKopf in func10.jsx:
     Ableiten, Hauptsatz, Geraden, Parabeln) haben keinen Standard-Rahmen. Ab 840 px bekommen
     Inhalt und Kopfleiste dieselbe Spalte wie alle Werkzeugseiten (783 px, 24 px Rand).
   Nur in Desktop-Zweigen verwenden – das Handy bleibt, wie es ist.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";

export const reglerKnopf = (f) => ({
  width: "100%", maxWidth: 66, height: 30, borderRadius: 9, border: `1.5px solid ${f}55`, background: `${f}12`,
  color: f, fontSize: 18, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1,
  display: "flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation",
});

/* Eine Spalte: + / „a = 3“ / −. setze(neu) bekommt den neuen Wert (schon begrenzt). */
export function SenkrechtRegler({ name, wert, setze, min, max, schritt = 1, farbe = C.see, format = (v) => String(v).replace("-", "−"),
  plusLabel, minusLabel, mitName = true }) {
  const aus = (d) => (d < 0 && wert <= min + 1e-9) || (d > 0 && wert >= max - 1e-9);
  const schritte = (d) => setze(Math.round(Math.max(min, Math.min(max, wert + d * schritt)) * 1000) / 1000);
  const text = `${mitName ? `${name} = ` : ""}${format(wert)}`;
  return (
    <div data-regler-senkrecht={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
      <button type="button" className="eve-knopf" aria-label={plusLabel} disabled={aus(1)} onClick={() => schritte(1)}
        style={{ ...reglerKnopf(farbe), opacity: aus(1) ? 0.35 : 1 }}>+</button>
      <span style={{ fontSize: text.length >= 8 ? 14 : 15.5, fontWeight: 800, color: farbe, fontVariantNumeric: "tabular-nums", lineHeight: 1.2, whiteSpace: "nowrap" }}>{text}</span>
      <button type="button" className="eve-knopf" aria-label={minusLabel} disabled={aus(-1)} onClick={() => schritte(-1)}
        style={{ ...reglerKnopf(farbe), opacity: aus(-1) ? 0.35 : 1 }}>−</button>
    </div>
  );
}

/* Mehrere Regler nebeneinander in gleich breiten Spalten (wie die Koeffizienten der EbenenKarte) */
export function ReglerReihe({ children, spalten }) {
  const n = spalten || React.Children.toArray(children).filter(Boolean).length;
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gap: 6 }}>{children}</div>;
}

/* Spalte 783 px ab der Textkante des Seitentitels (wie func10.jsx), Inhalt mit 16 px Innenrand → 24 px wie EbeneVsEbene.
   klasse: Wurzel-Klasse des Desktop-Zweigs. Gilt nur, solange die Seite eingehängt ist. */
export const kompaktSpalteCss = (klasse) => `
  .${klasse}{background:transparent;width:783px;max-width:calc(100vw - 32px);margin-left:calc(50% - 379px);padding:24px 16px 56px;box-sizing:border-box}
  [data-kompakt-kopf] > .mx-auto{max-width:783px !important;width:783px;margin-left:calc(50% - 379px) !important;margin-right:0 !important;padding:0 16px !important}
`;

/* Aufgaben-Trainer am Desktop (DESKTOP-STIL.md, Punkt 3): Aufgabe und Schritte links breit,
   rechts (300 px, mitlaufend) Hilfen und – sobald vorhanden – Skizze bzw. Schaubild. */
export function TrainerRaster({ links, rechts, breiteRechts = 300, style }) {
  return (
    <div data-trainer-raster style={{ display: "grid", gridTemplateColumns: `minmax(0, 1fr) minmax(0, ${breiteRechts}px)`, gap: 20, alignItems: "start", ...style }}>
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>{links}</div>
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 76 }}>{rechts}</div>
    </div>
  );
}
