/* ============================================================
   vekUi.jsx – gemeinsame Gestaltung der Vektor-Werkzeuge
   (Rechnen mit Vektoren, Kreuzprodukt, Winkel, Zwei/Drei Punkte,
   Ebenen-Visualizer, Geraden im Raum, Ebene vs. Ebene, Abstände)

   Leitidee: Jedes mathematische Objekt hat eine Farbe und eine
   eigene Box – überall gleich (Box, Gleichung, 3D-Bild, Legende):
     Objekt 1 (g, a⃗, E₁, A)  Blau   · Objekt 2 (h, b⃗, E₂, B)  Gold
     Ergebnis (S, n⃗, C)        Smaragd
   Bausteine:
     VekSeite      Seitenrahmen mit Titel und kurzem Einleitungssatz
     ModusReiter   Reiter mit Bildzeichen (Punktprobe | Gerade – Gerade …)
     ObjektReihe   Boxen nebeneinander (g links, h rechts), schmal untereinander
     ObjektBox     eine Box mit farbigem Kopf: Kennbuchstabe + Art
     FallWahl      kleine Chips „Übungsfall“ mit Bildzeichen
     TippKacheln   Vermutung als Kacheln mit Bildzeichen
     Rechenweg/RSchritt  nummerierte Schritte als Zeitleiste
     Ergebnis      Ergebnis-Band am Ende der Rechnung
     Tafel         Abschnitt (weiße Fläche) für Vermutung, Rechnung …
     Legende       Farbzuordnung über dem 3D-Bild
     Fusszeile     „Neue Aufgabe“ + Hilfe
     Bild          kleine Bildzeichen (Lagebeziehungen, Winkel, Objekte)
   Desktop (ab 840 px, DESKTOP-STIL.md):
     VekArbeit     Arbeitsfläche: Objekt-Boxen/Einstellungen links (VEK_LINKS), Bild rechts
     VekBild       3D-/2D-Bild rechts in einer BildKarte, in echten Pixeln gemessen
     ReglerSpalten Koeffizienten/Koordinaten als Spalten: + oben, Wert in der Mitte, − unten
   Importiert nur base1, i18n und arbeitsflaeche – darf von func16/19/20/23/24 und
   funcGeraden benutzt werden, ohne Kreise zu bilden.
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { Arbeitsflaeche, BildKarte, useBreite } from "./arbeitsflaeche.jsx";

const zw = (de, en) => (englisch() ? en : de);

/* Objektfarben – überall dieselben */
export const VF = {
  eins: C.see, einsHell: "#EEF4FB", einsRand: "#C9DAEF",
  zwei: "#B98A00", zweiText: "#8A6D00", zweiHell: "#FBF6E7", zweiRand: "#EADBB0",
  drei: C.smaragd, dreiHell: "#EAF6EF", dreiRand: "#BFE0CD",
  flaeche: "#F5F7FB",
};

/* Farbsatz zu einer Objektfarbe */
export function farbSatz(farbe) {
  if (farbe === VF.zwei || farbe === C.gruen || farbe === VF.zweiText) return { voll: VF.zwei, text: VF.zweiText, hell: VF.zweiHell, rand: VF.zweiRand };
  if (farbe === VF.drei || farbe === C.smaragd) return { voll: VF.drei, text: "#1F6E44", hell: VF.dreiHell, rand: VF.dreiRand };
  if (farbe === C.see || farbe === VF.eins) return { voll: VF.eins, text: VF.eins, hell: VF.einsHell, rand: VF.einsRand };
  return { voll: farbe, text: farbe, hell: `${farbe}10`, rand: `${farbe}44` };
}

/* ---------- Bildzeichen ---------- */

const W = 44, H = 30;
const L = (x1, y1, x2, y2, farbe, b = 3, extra = {}) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={farbe} strokeWidth={b} strokeLinecap="round" {...extra} />;
const Punkt = (x, y, farbe, r = 3.2) => <circle cx={x} cy={y} r={r} fill={farbe} stroke="#fff" strokeWidth="1.4" />;
const Ebene = (farbe = VF.zwei) => <path d="M4 25 L28 25 L40 12 L16 12 Z" fill={farbe} fillOpacity="0.2" stroke={farbe} strokeWidth="1.4" strokeLinejoin="round" />;
const Pfeil = (x1, y1, x2, y2, farbe) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 5.5;
  const p = (w) => `${(x2 - s * Math.cos(a - w)).toFixed(1)},${(y2 - s * Math.sin(a - w)).toFixed(1)}`;
  return <g>{L(x1, y1, x2 - 2 * Math.cos(a), y2 - 2 * Math.sin(a), farbe, 2.6)}<path d={`M${p(0.5)} L${x2},${y2} L${p(-0.5)}`} fill="none" stroke={farbe} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></g>;
};
const Bogen = (cx, cy, r, w1, w2, farbe = C.tinte) => {
  const P = (w) => [cx + r * Math.cos(w), cy - r * Math.sin(w)];
  const [x1, y1] = P(w1), [x2, y2] = P(w2);
  return <path d={`M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 0 ${x2.toFixed(1)} ${y2.toFixed(1)}`} fill="none" stroke={farbe} strokeWidth="1.6" />;
};

function bildInhalt(art, f1, f2) {
  switch (art) {
    case "zufall": return (
      <g>
        <rect x="13" y="4" width="21" height="21" rx="5.5" fill="#fff" stroke={C.tinte} strokeWidth="1.8" transform="rotate(-8 23.5 14.5)" />
        {[[18.5, 10], [23.5, 14.5], [28.5, 19]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.9" fill={C.tinte} />)}
      </g>
    );
    case "identisch": return <g>{L(6, 24, 38, 6, f1, 6, { strokeOpacity: 0.85 })}{L(6, 24, 38, 6, f2, 2.2, { strokeDasharray: "4 3.5" })}</g>;
    case "parallel": return <g>{L(5, 21, 30, 6, f1)}{L(14, 26, 39, 11, f2)}</g>;
    case "schneidend": return <g>{L(5, 24, 39, 6, f1)}{L(5, 8, 39, 24, f2)}{Punkt(21, 15.5, VF.drei)}</g>;
    case "windschief": return <g>{L(5, 8, 39, 24, f2)}{L(5, 24, 39, 6, "#fff", 8)}{L(5, 24, 39, 6, f1)}</g>;
    case "ge-schneidend": return <g>{L(18.5, 2.5, 22, 18, f1, 3, { strokeOpacity: 1 })}{Ebene(f2)}{L(22, 18, 24, 28, f1, 3, { strokeDasharray: "2.5 3" })}{Punkt(22, 18, VF.drei)}</g>;
    case "ge-parallel": return <g>{Ebene(f2)}{L(10, 6, 36, 6, f1)}</g>;
    case "ge-enthalten": return <g>{Ebene(f2)}{L(9, 21.5, 34, 15.5, f1)}</g>;
    case "auf": return <g>{L(5, 24, 39, 6, f1)}{Punkt(22, 15, f2, 3.8)}</g>;
    case "nicht-auf": return <g>{L(5, 24, 39, 6, f1)}{Punkt(14, 7, f2, 3.8)}</g>;
    case "spitz": return <g>{L(7, 24, 39, 24, f1)}{L(7, 24, 31, 5, f2)}{Bogen(7, 24, 12, 0, 0.67)}</g>;
    case "recht": return <g>{L(11, 24, 39, 24, f1)}{L(11, 24, 11, 3, f2)}<path d="M11 17 h7 v7" fill="none" stroke={C.tinte} strokeWidth="1.5" /></g>;
    case "stumpf": return <g>{L(24, 24, 41, 24, f1)}{L(24, 24, 4, 8, f2)}{Bogen(24, 24, 9, 0, 2.47)}</g>;
    case "skalar": return <g>{Pfeil(7, 24, 39, 24, f1)}{Pfeil(7, 24, 25, 5, f2)}<circle cx="31" cy="11" r="2" fill={C.tinte} /></g>;
    case "vektorwinkel": return <g>{Pfeil(7, 24, 39, 24, f1)}{Pfeil(7, 24, 30, 6, f2)}{Bogen(7, 24, 13, 0, 0.66, VF.drei)}</g>;
    case "ge-winkel": return <g>{Ebene(f2)}{L(12, 21, 34, 3, f1)}{Bogen(12, 21, 9, 0, 0.7, VF.drei)}</g>;
    case "ee-schnitt": return (
      <g>
        <path d="M3 22 L25 22 L37 10 L15 10 Z" fill={f1} fillOpacity="0.2" stroke={f1} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M12 3 L12 25 L32 19 L32 -3 Z" transform="translate(0 4)" fill={f2} fillOpacity="0.2" stroke={f2} strokeWidth="1.3" strokeLinejoin="round" />
        {L(12, 20.2, 32, 14.2, VF.drei, 2.6)}
      </g>
    );
    case "ee-parallel": return (
      <g>
        <path d="M3 27 L25 27 L37 17 L15 17 Z" fill={f1} fillOpacity="0.2" stroke={f1} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M7 13 L29 13 L41 3 L19 3 Z" fill={f2} fillOpacity="0.2" stroke={f2} strokeWidth="1.3" strokeLinejoin="round" />
      </g>
    );
    case "ee-identisch": return (
      <g>
        <path d="M4 22 L27 22 L39 9 L16 9 Z" fill={f1} fillOpacity="0.28" stroke={f1} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M4 22 L27 22 L39 9 L16 9 Z" fill="none" stroke={f2} strokeWidth="1.3" strokeDasharray="3 3" strokeLinejoin="round" />
      </g>
    );
    case "abstand": return <g>{Ebene(f2)}{L(22, 3.5, 22, 18, VF.drei, 2, { strokeDasharray: "2.6 2.4" })}<path d="M22 14.5 h3.4 v3.5" fill="none" stroke={VF.drei} strokeWidth="1.2" />{Punkt(22, 4, f1, 3.6)}{Punkt(22, 18, VF.drei, 2.4)}</g>;
    case "lot": return <g>{L(4, 25, 40, 14, f2)}{L(16, 5, 21.6, 19.6, VF.drei, 2, { strokeDasharray: "2.6 2.4" })}{Punkt(16, 5, f1, 3.6)}{Punkt(21.6, 19.6, VF.drei, 3)}</g>;
    case "punkt": return <g>{L(14, 15, 30, 15, `${f1}55`, 1.2)}{L(22, 7, 22, 23, `${f1}55`, 1.2)}{Punkt(22, 15, f1, 4.6)}</g>;
    case "gerade": return <g>{L(5, 25, 39, 5, f1)}</g>;
    case "ebene": return Ebene(f1);
    case "kreuz": return <g>{Pfeil(10, 24, 38, 24, f1)}{Pfeil(10, 24, 22, 13, f2)}{Pfeil(10, 24, 10, 3, VF.drei)}</g>;
    case "summe": return <g>{Pfeil(5, 25, 20, 9, f1)}{Pfeil(20, 9, 39, 14, f2)}{Pfeil(5, 25, 39, 14, VF.drei)}</g>;
    case "linear": return <g><path d="M5 26 L19 8 L39 13 L25 31" fill="none" stroke={C.linie} strokeWidth="1.2" strokeDasharray="2.5 2.5" />{Pfeil(5, 26, 19, 8, f1)}{Pfeil(5, 26, 25, 31, f2)}{Pfeil(5, 26, 38, 13.5, VF.drei)}</g>;
    case "vielfaches": return <g>{Pfeil(5, 26, 17, 15, f1)}{Pfeil(11, 28, 37, 5, VF.drei)}</g>;
    default: return null;
  }
}

/* art: Name des Bildzeichens; farbe/farbe2 überschreiben Blau/Gold (z. B. für die Box „Bis“) */
export function Bild({ art, breite = 44, farbe = VF.eins, farbe2 = VF.zwei, titel }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={breite} height={(breite * H) / W} role={titel ? "img" : undefined} aria-label={titel} aria-hidden={titel ? undefined : true}
      style={{ display: "block", flexShrink: 0, overflow: "visible" }}>
      {bildInhalt(art, farbe, farbe2)}
    </svg>
  );
}

const Wuerfel = ({ groesse = 18 }) => (
  <svg viewBox="0 0 24 24" width={groesse} height={groesse} aria-hidden="true" style={{ flexShrink: 0 }}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
    {[[8.5, 8.5], [12, 12], [15.5, 15.5]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.6" fill="currentColor" />)}
  </svg>
);

/* ---------- Seite ---------- */

export function VekSeite({ titel, text, children, oben = 28 }) {
  return (
    <div className="mx-auto px-6 pb-16" data-vek-seite="" style={{ maxWidth: 620, paddingTop: oben }}>
      {/* Titel in einem div: die Desktop-Regel in index.css (… > div) rückt ihn dann genauso ein wie die Boxen */}
      {(titel || text) && (
        <div>
          {titel && <h1 style={{ fontSize: "clamp(23px, 6.2vw, 28px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.15, color: C.tinte, margin: "0 0 8px" }}>{titel}</h1>}
          {text && <p style={{ color: C.grau, fontSize: 15, lineHeight: 1.6, margin: "0 0 20px", maxWidth: 540 }}>{text}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

/* ---------- Reiter mit Bildzeichen ---------- */

/* modi: [{ id, name, bild }] */
/* stapel (nur Desktop, linke Spalte): Reiter untereinander, Bildzeichen links neben dem Namen */
export function ModusReiter({ modi, wert, setWert, label, stapel = false }) {
  return (
    <div role="tablist" aria-label={label} style={{ display: "grid", gridTemplateColumns: stapel ? "minmax(0, 1fr)" : `repeat(${modi.length}, minmax(0, 1fr))`, gap: 8, marginBottom: stapel ? 0 : 18 }}>
      {modi.map((m) => {
        const an = wert === m.id;
        return (
          <button key={m.id} type="button" role="tab" aria-selected={an} onClick={() => setWert(m.id)} data-vek-reiter={m.id}
            style={{ display: "flex", flexDirection: stapel ? "row" : "column", alignItems: "center", justifyContent: stapel ? "flex-start" : "center", gap: stapel ? 12 : 6,
              minHeight: stapel ? 56 : 80, padding: stapel ? "8px 14px 8px 10px" : "10px 6px 9px",
              borderRadius: 16, fontFamily: "inherit", cursor: "pointer", textAlign: "center",
              border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? VF.einsHell : C.weiss,
              boxShadow: an ? "0 0 0 3px rgba(0,77,152,0.10)" : "none", transition: "background .15s, border-color .15s" }}>
            {m.bild && <Bild art={m.bild} breite={40} />}
            <span style={{ fontSize: stapel ? 14 : "clamp(11.5px, 3.3vw, 13.5px)", fontWeight: 700, lineHeight: 1.2, color: an ? C.see : C.tinte }}>{m.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Objekt-Boxen ---------- */

/* Boxen nebeneinander, sobald jede mindestens `min` px breit sein kann – sonst untereinander */
export function ObjektReihe({ children, min = 150, abstand = 10, stil }) {
  return (
    <div data-vek-reihe="" style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: abstand, alignItems: "stretch", ...stil }}>
      {children}
    </div>
  );
}

/* name: Kennbuchstabe (Text oder Element), art: „Gerade“, rechts: kleiner Zusatz oben rechts */
export function ObjektBox({ farbe = VF.eins, name, art, rechts, children, innen = "10px 10px 12px", fuss, stil, kopfInhalt }) {
  const f = farbSatz(farbe);
  return (
    <div data-vek-box="" style={{ backgroundColor: C.weiss, border: `1.5px solid ${f.rand}`, borderRadius: 16, overflow: "hidden", minWidth: 0,
      display: "flex", flexDirection: "column", boxShadow: "0 1px 2px rgba(15,26,51,0.04)", ...stil }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: f.hell, borderBottom: `1px solid ${f.rand}`, minHeight: 42 }}>
        {name !== undefined && name !== null && (
          <span style={{ minWidth: 26, height: 26, padding: "0 7px", borderRadius: 8, background: f.voll, color: C.weiss, fontSize: 14.5, fontWeight: 800,
            display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0, whiteSpace: "nowrap" }}>{name}</span>
        )}
        {art && <span style={{ fontSize: 13.5, fontWeight: 700, color: f.text, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{art}</span>}
        {kopfInhalt}
        {rechts && <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: C.grau, whiteSpace: "nowrap" }}>{rechts}</span>}
      </div>
      <div style={{ padding: innen, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>{children}</div>
      {fuss && <div style={{ padding: "0 10px 10px", fontSize: 12, color: C.grau, lineHeight: 1.45 }}>{fuss}</div>}
    </div>
  );
}

/* ---------- Auswahl ---------- */

/* Kleine Chips: optionen [[id, text, bild?]] */
export function FallWahl({ optionen, wert, setWert, label, titel }) {
  return (
    <div>
      {titel && <p style={{ fontSize: 12.5, fontWeight: 600, color: C.grau, margin: "0 0 6px" }}>{titel}</p>}
      <div role="group" aria-label={label || titel} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
        {optionen.map(([id, text, bild]) => {
          const an = wert === id;
          return (
            <button key={id} type="button" aria-pressed={an} onClick={() => setWert(id)} data-vek-fall={id}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: bild ? "0 11px 0 7px" : "0 12px", borderRadius: 999,
                fontFamily: "inherit", fontSize: 12.5, fontWeight: an ? 700 : 600, cursor: "pointer", whiteSpace: "nowrap",
                border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? VF.einsHell : C.weiss, color: an ? C.see : C.tinte }}>
              {bild && <Bild art={bild} breite={26} />}{text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Vermutung als Kacheln: optionen [[id, text, bild]]; loesung = richtige id (nach der Wahl hervorgehoben) */
export function TippKacheln({ optionen, wert, setWert, loesung, label, spalten = 2 }) {
  const gewaehlt = wert !== null && wert !== undefined;
  const stapel = spalten >= 3;
  return (
    <div role="group" aria-label={label} style={{ display: "grid", gridTemplateColumns: `repeat(${spalten}, minmax(0, 1fr))`, gap: 8 }}>
      {optionen.map(([id, text, bild]) => {
        const an = wert === id, richtig = id === loesung;
        // ohne loesung (noch nicht aufgedeckt): die Wahl ist nur markiert, nicht bewertet
        const z = !gewaehlt ? "neutral" : loesung === undefined || loesung === null ? (an ? "gewaehlt" : "neutral")
          : an ? (richtig ? "gut" : "schlecht") : richtig ? "loesung" : "aus";
        const rand = { neutral: C.linie, gewaehlt: C.see, gut: C.smaragd, schlecht: C.signal, loesung: C.smaragd, aus: C.linie }[z];
        const grund = { neutral: C.weiss, gewaehlt: VF.einsHell, gut: VF.dreiHell, schlecht: "#FCEFE8", loesung: C.weiss, aus: C.weiss }[z];
        return (
          <button key={id} type="button" aria-pressed={an} onClick={() => setWert(id)} data-vek-tipp={id}
            style={{ position: "relative", display: "flex", flexDirection: stapel ? "column" : "row", alignItems: "center", justifyContent: stapel ? "center" : "flex-start",
              gap: stapel ? 6 : 10, minHeight: stapel ? 86 : 58, padding: stapel ? "10px 6px" : "8px 12px 8px 8px", borderRadius: 14, fontFamily: "inherit", cursor: "pointer",
              textAlign: stapel ? "center" : "left", border: `1.5px ${z === "loesung" ? "dashed" : "solid"} ${rand}`, background: grund,
              opacity: z === "aus" ? 0.55 : 1, transition: "background .15s, border-color .15s, opacity .15s" }}>
            {bild && <span style={{ width: 46, height: 34, borderRadius: 10, background: z === "neutral" || z === "aus" ? VF.flaeche : C.weiss,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Bild art={bild} breite={38} /></span>}
            <span style={{ fontSize: stapel ? "clamp(11.5px, 3.2vw, 13.5px)" : 14, fontWeight: 700, lineHeight: 1.25, color: C.tinte, minWidth: 0 }}>{text}</span>
            {(z === "gut" || z === "schlecht" || z === "loesung") && (
              <span aria-hidden="true" style={{ position: "absolute", top: -7, right: -6, minWidth: 20, height: 20, padding: "0 5px", borderRadius: 999, fontSize: 11.5, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center", color: C.weiss, background: z === "schlecht" ? C.signal : C.smaragd, boxShadow: "0 0 0 2px #fff" }}>
                {z === "schlecht" ? "✗" : "✓"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Abschnitt ----------
   backgroundColor statt background: Werkzeugseiten (html[data-wz-voll], index.css) ziehen direkte Kinder mit
   „background: rgb(255, 255, 255)“ randlos über die ganze Breite. Tafel und Box sollen Karten mit Rand bleiben. */

export function Tafel({ titel, text, rechts, children, stil, nr }) {
  return (
    <div role="region" aria-label={typeof titel === "string" ? titel : undefined} data-vek-tafel="" style={{ backgroundColor: C.weiss, borderRadius: 22, padding: "18px 16px 18px", border: `1px solid ${C.linie}`,
      boxShadow: "0 10px 30px -18px rgba(15,26,51,0.25)", marginTop: 14, ...stil }}>
      {(titel || rechts) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: text ? 4 : 12 }}>
          {titel && (
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em", color: C.tinte, margin: 0, lineHeight: 1.3 }}>
              {nr !== undefined && <span style={{ width: 24, height: 24, borderRadius: 999, background: C.tinte, color: C.weiss, fontSize: 12.5, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{nr}</span>}
              {titel}
            </h3>
          )}
          {rechts}
        </div>
      )}
      {text && <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.55, margin: "0 0 14px" }}>{text}</p>}
      {children}
    </div>
  );
}

/* ---------- Rechenweg ---------- */

export function Rechenweg({ children, stil }) {
  return <div data-vek-rechenweg="" style={{ marginTop: 4, ...stil }}>{children}</div>;
}

/* Ein Schritt der Zeitleiste: Nummer links, Titel und Rechnung rechts */
export function RSchritt({ nr, titel, children, ohneFlaeche = false }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "26px minmax(0, 1fr)", columnGap: 10 }}>
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ width: 24, height: 24, borderRadius: 999, background: C.see, color: C.weiss, fontSize: 12, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{nr}</span>
        <span style={{ flex: 1, width: 2, marginTop: 4, borderRadius: 2, background: `linear-gradient(${C.linie}, ${C.linie} 75%, transparent)` }} />
      </div>
      <div style={{ minWidth: 0, paddingBottom: 16 }}>
        {titel && <p style={{ fontSize: 14, fontWeight: 700, color: C.tinte, lineHeight: 1.4, margin: "3px 0 8px" }}>{titel}</p>}
        {ohneFlaeche ? children : (
          <div style={{ background: VF.flaeche, border: `1px solid ${C.linie}`, borderRadius: 12, padding: "10px 12px", minWidth: 0 }}>{children}</div>
        )}
      </div>
    </div>
  );
}

/* Ergebnis-Band: art gut | info | warn */
export function Ergebnis({ titel = zw("Ergebnis", "Result"), children, bild, art = "gut", zusatz }) {
  const f = { gut: [VF.dreiHell, VF.dreiRand, "#1F6E44"], info: [VF.einsHell, VF.einsRand, C.see], warn: ["#FFF6DD", "#EFD893", "#7A5A00"] }[art];
  return (
    <div data-vek-ergebnis="" role="status" style={{ display: "flex", alignItems: "center", gap: 12, background: f[0], border: `1.5px solid ${f[1]}`, borderRadius: 16, padding: "12px 14px", marginTop: 2 }}>
      {bild && <span style={{ width: 56, height: 42, borderRadius: 12, background: C.weiss, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{bild}</span>}
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 12.5, fontWeight: 700, color: f[2], margin: "0 0 2px" }}>{titel}</p>
        <div style={{ fontSize: 16.5, fontWeight: 800, color: C.tinte, lineHeight: 1.35 }}>{children}</div>
        {zusatz && <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.5, margin: "4px 0 0" }}>{zusatz}</p>}
      </div>
    </div>
  );
}

/* Kurze Rückmeldung zur Vermutung */
export function Hinweis({ art = "info", children }) {
  const f = { gut: [VF.dreiHell, "#1F6E44"], schlecht: ["#FCEFE8", "#8E3F17"], info: [VF.einsHell, C.see], warn: ["#FFF6DD", "#7A5A00"] }[art];
  return (
    <div role={art === "schlecht" || art === "warn" ? "alert" : "status"}
      style={{ background: f[0], color: f[1], borderRadius: 12, padding: "10px 12px", fontSize: 13.5, lineHeight: 1.55, fontWeight: 600, marginTop: 10 }}>{children}</div>
  );
}

/* ---------- 3D-Bild ---------- */

/* Rahmen für 3D-Bilder: der Rahmen läuft über die volle Breite, das Bild selbst bleibt auf großen Bildschirmen
   bei höchstens 560 px (sonst wird es höher als der Bildschirm) */
export const BUEHNE = { position: "relative", background: "radial-gradient(120% 90% at 50% 40%, #FFFFFF 0%, #F6F8FC 100%)", border: `1px solid ${C.linie}`, borderRadius: 18 };
export const BUEHNE_SVG = { width: "100%", maxWidth: 560, margin: "0 auto", display: "block", touchAction: "none", cursor: "grab" };

/* eintraege: [{ text, farbe, art: "linie" | "punkt" | "flaeche" }] */
export function Legende({ eintraege, stil }) {
  return (
    <div aria-hidden="true" style={{ display: "flex", flexWrap: "wrap", gap: 5, ...stil }}>
      {eintraege.filter(Boolean).map((e) => (
        <span key={e.text} style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 8px", borderRadius: 999,
          background: "rgba(255,255,255,0.94)", border: `1px solid ${C.linie}`, fontSize: 12, fontWeight: 700, color: C.tinte, whiteSpace: "nowrap" }}>
          {e.art === "punkt" ? <span style={{ width: 8, height: 8, borderRadius: 999, background: e.farbe }} />
            : e.art === "flaeche" ? <span style={{ width: 11, height: 9, borderRadius: 2, background: `${e.farbe}44`, border: `1.5px solid ${e.farbe}` }} />
            : <span style={{ width: 14, height: 3, borderRadius: 2, background: e.farbe }} />}
          {e.text}
        </span>
      ))}
    </div>
  );
}

/* ---------- Fußzeile ---------- */

export function Fusszeile({ neu, neuText = zw("Neue Aufgabe", "New problem"), hilfe, stil }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 18, ...stil }}>
      {neu && (
        <button type="button" onClick={neu} data-vek-neu=""
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, height: 46, padding: "0 20px", borderRadius: 999,
            border: "none", background: C.flaggold, color: C.seeTief, fontSize: 15, fontWeight: 800, fontFamily: "inherit", cursor: "pointer",
            boxShadow: "0 6px 16px -6px rgba(185,138,0,0.55)", flex: "1 1 180px", maxWidth: 320 }}>
          <Wuerfel />{neuText}
        </button>
      )}
      {hilfe && <div style={{ marginLeft: "auto" }}>{hilfe}</div>}
    </div>
  );
}

/* Kleiner Würfel-Knopf für „Neue Punkte“ direkt bei den Eingaben */
export function WuerfelKnopf({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} data-vek-neu=""
      style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 36, padding: "0 14px 0 11px", borderRadius: 999, border: "none",
        background: C.flaggold, color: C.seeTief, fontSize: 13.5, fontWeight: 800, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
        boxShadow: "0 4px 12px -6px rgba(185,138,0,0.6)" }}>
      <Wuerfel groesse={16} />{children}
    </button>
  );
}

/* Gold-Knopf (z. B. „Prüfen“) passend zur Fußzeile */
export function HauptKnopf({ children, onClick, disabled, art = "gruen", stil }) {
  const f = art === "gold" ? [C.flaggold, C.seeTief, "rgba(185,138,0,0.55)"] : [C.see, C.weiss, "rgba(0,77,152,0.5)"];
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, height: 46, padding: "0 22px", borderRadius: 999, border: "none",
        background: f[0], color: f[1], fontSize: 15, fontWeight: 800, fontFamily: "inherit", cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1, boxShadow: disabled ? "none" : `0 6px 16px -6px ${f[2]}`, ...stil }}>{children}</button>
  );
}

/* ======================================================================
   Desktop (ab 840 px) – Anordnung nach DESKTOP-STIL.md
   ====================================================================== */

/* Linke Spalte der Vektor-Werkzeuge: fast so breit wie die Handy-Spalte (340 px), damit die Objekt-Boxen
   dort genauso stehen wie am Handy – zwei Boxen (g | h, a⃗ | b⃗, A | B) passen nebeneinander. */
export const VEK_LINKS = 340;

export function VekArbeit({ links, rechts, stil, linksBreite = VEK_LINKS }) {
  return <Arbeitsflaeche linksBreite={linksBreite} links={links} rechts={rechts} style={stil} />;
}

/* Bild rechts: BildKarte mit dem Bühnen-Verlauf; children(breite) zeichnet in echten Pixeln
   (breite = gemessene Innenbreite, 0 vor der ersten Messung → dann nichts zeichnen) */
export function VekBild({ children, stil }) {
  const [ref, breite] = useBreite();
  return (
    <BildKarte data-vek-bild="" style={{ background: BUEHNE.background, ...stil }}>
      <div ref={ref} style={{ position: "relative" }}>{breite > 0 && children(breite)}</div>
    </BildKarte>
  );
}

/* Spalten aus + (oben) · Wert (Mitte) · − (unten) – wie die Ebenen-Karten in „Ebene vs. Ebene“.
   spalten: [{ key, kopf?, mitte, farbe, plus, minus, plusLabel, minusLabel }] */
export function ReglerSpalten({ spalten, abstand = 6 }) {
  const knopf = (f) => ({
    width: "100%", maxWidth: 66, height: 30, borderRadius: 9, border: `1.5px solid ${f}55`, background: `${f}12`,
    color: f, fontSize: 18, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation",
  });
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${spalten.length}, minmax(0, 1fr))`, gap: abstand }}>
      {spalten.map((sp) => (
        <div key={sp.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
          {sp.kopf}
          <button type="button" className="eve-knopf" aria-label={sp.plusLabel} style={knopf(sp.farbe)} onClick={sp.plus}>+</button>
          {sp.mitte}
          <button type="button" className="eve-knopf" aria-label={sp.minusLabel} style={knopf(sp.farbe)} onClick={sp.minus}>−</button>
        </div>
      ))}
    </div>
  );
}
