/* ============================================================
   Motion-Animationen der Unterstufe – gemeinsame Bausteine für alle Szenen.

   SZENEN-VERTRAG (jede Szene ist ein Objekt):
     {
       h: 190,                                   // Höhe der viewBox; Breite ist immer B = 360
       label: (p) => "Kurzbeschreibung",          // für Screenreader (aria-label)
       ablauf: (p) => [                           // Abschnitte nacheinander; ms = Dauer des Abschnitts
         { k: "aufbau", ms: 700 },                //   ohne text: Untertitel bleibt wie vorher
         { k: "springen", ms: 1600, text: "3 Sprünge nach rechts: + 3" },
       ],
       bild: ({ Z, z, p, t }) => <>…SVG…</>,      // rein: hängt nur von Z/z/p ab
     }
   Z("springen")  → Fortschritt 0…1 des Abschnitts, sanft (ease in/out); Z("x", raus) mit eigener Kurve
   z("springen")  → derselbe Fortschritt linear
   Vor dem Abschnitt 0, danach 1. Am Ende (t = dauer) sind alle Abschnitte 1 → das Schlussbild ist
   zugleich das statische Bild (reduzierte Bewegung, Vorschau, Druck).

   Gestaltung: Linien in TINTE, Akzente GRANAT (Kursfarbe) und GOLD, dritte Farbe BLAU. Schrift Montserrat
   über <Tx>. Keine Farben außerhalb von F verwenden.
   ============================================================ */
import React from "react";
import { lesezeitMs, BEWEGUNG_MAX } from "../lesezeit.js";

export const B = 360;   // Breite jeder Szene

export const F = {
  tinte: "#0F1A33",
  grau: "#5A6582",
  hell: "#A3ACC2",
  linie: "#E3E8F2",
  flaeche: "#F4F6FB",
  weiss: "#FFFFFF",
  granat: "#7A0032",
  granatTief: "#3A0019",
  granatHell: "#F9E3EC",
  rosa: "#E9A6BF",
  gold: "#E2B53C",
  goldHell: "#FFF1C7",
  goldDunkel: "#8A6400",
  blau: "#004D98",
  blauHell: "#DCE8F7",
  gruen: "#2F8F5B",
  gruenHell: "#DDF2E5",
};

/* ---------- Kurven ---------- */
export const linear = (u) => u;
export const sanft = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const raus = (u) => 1 - Math.pow(1 - u, 3);
export const federnd = (u) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
export const klemm = (u, a = 0, b = 1) => Math.max(a, Math.min(b, u));
export const mix = (a, b, u) => a + (b - a) * u;
/* Teilbereich eines Fortschritts: teil(u, 0.5, 1) läuft 0…1, während u von 0.5 bis 1 läuft */
export const teil = (u, a, b) => klemm((u - a) / (b - a));
/* i-tes von n Elementen nacheinander einblenden (mit Überlappung) */
export const staffel = (u, i, n, ueberlapp = 0.5) => {
  const breite = 1 / (n - (n - 1) * ueberlapp || 1);
  const start = i * breite * (1 - ueberlapp);
  return klemm((u - start) / breite);
};

/* Zahlen deutsch: 1.000, Minus als echtes Minuszeichen, Komma */
export const de = (n, stellen) => {
  const s = stellen == null ? Number(n).toLocaleString("de-DE", { maximumFractionDigits: 6 }) : Number(n).toLocaleString("de-DE", { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
  return s.replace("-", "−");
};

/* ---------- Ablauf → Zeiten ---------- */
export const NACHLAUF = 1600;   // ms Ruhe am Ende (Schlussbild + Kernsatz lesen)
/* Lesezeit kommt aus src/lesezeit.js (1,2 s + 70 ms je Zeichen, Lesetempo Klasse 5–7) – für alle Animationen gleich.
   Ein Abschnitt mit Text dauert nie kürzer als seine Lesezeit. Die Bewegung darin wird höchstens um BEWEGUNG_MAX
   gestreckt (sonst wirkt sie zäh); danach steht das Bild still, bis der Text gelesen ist (a.bewegt ≤ a.ms). */
export const lesedauer = lesezeitMs;
export function zeitplan(ablauf) {
  let s = 0;
  const abschnitte = ablauf.map((a) => {
    const gezeichnet = a.ms || 0;
    const ms = Math.max(gezeichnet, lesedauer(a.text));
    const bewegt = Math.min(ms, Math.max(gezeichnet * BEWEGUNG_MAX, gezeichnet));
    const o = { ...a, ms, bewegt, start: s, ende: s + ms }; s += ms; return o;
  });
  return { abschnitte, dauer: s + NACHLAUF };
}
export function fortschritt(plan, t) {
  const nach = {};
  for (const a of plan.abschnitte) nach[a.k] = a;
  const z = (k) => { const a = nach[k]; if (!a) return 1; return klemm((t - a.start) / (a.bewegt || a.ende - a.start || 1)); };
  const Z = (k, kurve = sanft) => kurve(z(k));
  return { z, Z };
}
export function untertitel(plan, t) {
  let text = "";
  for (const a of plan.abschnitte) { if (a.start <= t + 1 && a.text) text = a.text; }
  return text;
}

/* ---------- Zeichen-Bausteine ---------- */
const SCHRIFT = { fontFamily: "Montserrat, sans-serif" };

export function Tx({ x, y, children, g = 13, f = F.tinte, w = 700, a = "middle", o = 1, ...rest }) {
  return <text x={x} y={y} fontSize={g} fill={f} fontWeight={w} textAnchor={a} opacity={o} style={SCHRIFT} {...rest}>{children}</text>;
}

/* Linie, die sich von (x1,y1) nach (x2,y2) zeichnet (u = 0…1) */
export function Strich({ x1, y1, x2, y2, u = 1, f = F.tinte, b = 1.8, kappe = "round", ...rest }) {
  if (u <= 0) return null;
  return <line x1={x1} y1={y1} x2={mix(x1, x2, u)} y2={mix(y1, y2, u)} stroke={f} strokeWidth={b} strokeLinecap={kappe} {...rest} />;
}

/* Pfeilspitze an (x,y) in Richtung winkel (Grad, 0 = nach rechts) */
export function Spitze({ x, y, winkel = 0, f = F.tinte, g = 8, o = 1 }) {
  return <path d={`M0 0 L${-g} ${-g * 0.55} L${-g} ${g * 0.55} Z`} fill={f} opacity={o} transform={`translate(${x} ${y}) rotate(${winkel})`} />;
}

/* Gerader Pfeil, wächst mit u */
export function Pfeil({ x1, y1, x2, y2, u = 1, f = F.tinte, b = 2 }) {
  if (u <= 0) return null;
  const x = mix(x1, x2, u), y = mix(y1, y2, u), w = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return <g><line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={b} strokeLinecap="round" /><Spitze x={x} y={y} winkel={w} f={f} /></g>;
}

/* Sprungbogen über einer Zahlengeraden von xa nach xb (Höhe hoch), wächst mit u; Spitze am Ende */
export function Sprung({ xa, xb, y, hoch = 26, u = 1, f = F.gold, b = 2.6, beschriftung, bf }) {
  if (u <= 0) return null;
  const n = 24, pts = [];
  for (let i = 0; i <= n * u; i++) {
    const s = i / n, x = mix(xa, xb, s), yy = y - Math.sin(Math.PI * s) * hoch;
    pts.push(`${x.toFixed(1)},${yy.toFixed(1)}`);
  }
  const s = klemm(u), x = mix(xa, xb, s), yy = y - Math.sin(Math.PI * s) * hoch;
  const dx = xb - xa, dy = -Math.cos(Math.PI * s) * hoch * Math.PI;
  const w = (Math.atan2(dy / (n || 1), dx / (n || 1)) * 180) / Math.PI;
  return (
    <g>
      <polyline points={pts.join(" ")} fill="none" stroke={f} strokeWidth={b} strokeLinecap="round" strokeLinejoin="round" />
      {u > 0.15 && <Spitze x={x} y={yy} winkel={w} f={f} g={7} />}
      {beschriftung && u > 0.5 && <Tx x={(xa + xb) / 2} y={hoch >= 0 ? y - hoch - 6 : y - hoch + 15} g={11.5} f={bf || F.goldDunkel} o={teil(u, 0.5, 0.8)}>{beschriftung}</Tx>}
    </g>
  );
}

/* Zahlengerade/Zahlenstrahl: gibt Achse + Skala; x(v) ist die Umrechnung */
export function achse({ von, bis, x0 = 20, x1 = B - 20 }) {
  return (v) => x0 + ((v - von) / (bis - von)) * (x1 - x0);
}
export function Skala({ von, bis, schritt = 1, y, x, u = 1, beschrift = (v) => de(v), jede = 1, f = F.tinte, neg = F.granat }) {
  const n = Math.round((bis - von) / schritt);
  const xa = x(von) - 10, xb = x(bis) + 12;
  return (
    <g>
      <Strich x1={xa} y1={y} x2={mix(xa, xb, 1)} y2={y} u={u} f={f} b={1.6} />
      {u >= 1 && <Spitze x={xb + 4} y={y} f={f} g={7} />}
      {Array.from({ length: n + 1 }, (_, i) => {
        const v = von + i * schritt, sicht = klemm(u * (n + 1) - i);
        if (sicht <= 0) return null;
        const gross = i % jede === 0;
        return (
          <g key={i} opacity={sicht}>
            <line x1={x(v)} y1={y - (gross ? 6 : 4)} x2={x(v)} y2={y + (gross ? 6 : 4)} stroke={f} strokeWidth={v === 0 ? 2 : 1.2} />
            {gross && <Tx x={x(v)} y={y + 21} g={11} f={v < 0 ? neg : f}>{beschrift(v)}</Tx>}
          </g>
        );
      })}
    </g>
  );
}

/* Kästchen mit Text (für Ziffern, Stellenwerttafeln, Terme) */
export function Kasten({ x, y, w = 30, h = 34, text, f = F.weiss, rand = F.linie, tf = F.tinte, g = 18, r = 7, o = 1, s = 1, gewicht = 800 }) {
  if (o <= 0) return null;
  return (
    <g opacity={o} transform={s !== 1 ? `translate(${x + w / 2} ${y + h / 2}) scale(${s}) translate(${-(x + w / 2)} ${-(y + h / 2)})` : undefined}>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={f} stroke={rand} strokeWidth="1.4" />
      {text != null && <Tx x={x + w / 2} y={y + h / 2 + g * 0.36} g={g} f={tf} w={gewicht}>{text}</Tx>}
    </g>
  );
}

/* Ungefähre Textbreite (Montserrat fett) – für Pillen und Rahmen um Text */
export function breite(text, g = 13) {
  let s = 0;
  for (const c of String(text)) {
    if (c === " ") s += 0.3;
    else if (/[0-9]/.test(c)) s += 0.64;
    else if (/[.,:;·'!|]/.test(c)) s += 0.32;
    else if (/[()[\]]/.test(c)) s += 0.38;
    else if (/[A-ZÄÖÜMW]/.test(c)) s += c === "M" || c === "W" ? 0.92 : 0.72;
    else if (/[mw]/.test(c)) s += 0.9;
    else if (/[il]/.test(c)) s += 0.3;
    else s += 0.62;
  }
  return s * g;
}

/* Pille mit Text (Notiz, Etikett); x = Mitte, wenn a = "middle", sonst linker Rand */
export function Pille({ x, y, text, g = 11.5, f = F.goldHell, tf = F.goldDunkel, a = "middle", o = 1 }) {
  if (o <= 0) return null;
  const w = breite(text, g) + 16, xl = a === "middle" ? x - w / 2 : x;
  return (
    <g opacity={o}>
      <rect x={xl} y={y - g} width={w} height={g + 10} rx={(g + 10) / 2} fill={f} />
      <Tx x={xl + w / 2} y={y + 1} g={g} f={tf}>{text}</Tx>
    </g>
  );
}

/* Hervorhebungs-Puls (Kreis, der aufgeht und verblasst) */
export function Puls({ x, y, u, r = 18, f = F.gold }) {
  if (u <= 0 || u >= 1) return null;
  return <circle cx={x} cy={y} r={r * (0.6 + u)} fill="none" stroke={f} strokeWidth={3 * (1 - u)} opacity={1 - u} />;
}

/* Text, der Zeichen für Zeichen erscheint */
export function Tippen({ text, u, ...rest }) {
  const n = Math.round(String(text).length * klemm(u));
  return <Tx {...rest}>{String(text).slice(0, n)}</Tx>;
}

/* Bruch als gestapelte Schrift in SVG (Zähler über Nenner) */
export function SvgBruch({ x, y, z, n, g = 15, f = F.tinte, o = 1 }) {
  const w = Math.max(String(z).length, String(n).length) * g * 0.62 + 6;
  return (
    <g opacity={o}>
      <Tx x={x} y={y - 4} g={g} f={f}>{z}</Tx>
      <line x1={x - w / 2} y1={y + 1} x2={x + w / 2} y2={y + 1} stroke={f} strokeWidth="1.6" strokeLinecap="round" />
      <Tx x={x} y={y + g + 3} g={g} f={f}>{n}</Tx>
    </g>
  );
}
