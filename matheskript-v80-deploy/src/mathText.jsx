/* Text mit $…$-Formeln. Brüche werden in der ganzen App als echte, gestapelte Brüche
   gesetzt – im Fließtext steht nie „3/4“ oder „(3/4)“. Wer einen Bruch in einen Text
   schreibt, setzt ihn in $…$: „Es gilt $p = \frac{1}{6}$.“ Ohne „$“ bleibt der Text
   unverändert (auch Zahlen, Einheiten wie km/h und Zähler wie „2/5“ bleiben Text). */
import React from "react";
import { M } from "./func3.jsx";

export function MS({ s }) {
  if (typeof s !== "string" || !s.includes("$")) return s ?? null;
  return <>{s.split("$").map((t, i) => (i % 2 ? <M key={i} t={t} /> : <React.Fragment key={i}>{t}</React.Fragment>))}</>;
}

/* Bruch als $…$-Formel: bruchS(1, 6) → "$\frac{1}{6}$"; ganze Zahlen bleiben ohne Formel. */
export function bruchS(z, n = 1) {
  if (n === 1) return String(z).replace("-", "−");
  return `$${z < 0 ? "−" : ""}\\frac{${Math.abs(z)}}{${n}}$`;
}

/* Beschriftung in einer SVG-Grafik: Ein Bruch („3/8“, „-1/2“) wird gestapelt mit Bruchstrich gezeichnet,
   alles andere bleibt gewöhnlicher SVG-Text. (x, y) ist Mitte bzw. Anfang/Ende der Grundlinie. */
export function SvgZahl({ x, y, t, size = 11, fill = "currentColor", weight = 700, anchor = "middle", ...rest }) {
  const m = /^\s*(-|−)?\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(String(t ?? ""));
  if (!m) return <text x={x} y={y} fontSize={size} fontWeight={weight} textAnchor={anchor} fill={fill} {...rest}>{t}</text>;
  const kl = size * 0.92, breite = Math.max(m[2].length, m[3].length) * kl * 0.62 + 3;
  const vz = m[1] ? "−" : "";
  const vzB = vz ? kl * 0.7 : 0;
  const gesamt = breite + vzB;
  const x0 = anchor === "middle" ? x - gesamt / 2 : anchor === "end" ? x - gesamt : x;
  const mitte = x0 + vzB + breite / 2, achse = y - size * 0.3;
  return (
    <g fill={fill} fontWeight={weight} {...rest}>
      {vz && <text x={x0} y={achse + kl * 0.34} fontSize={kl}>{vz}</text>}
      <text x={mitte} y={achse - kl * 0.18} fontSize={kl} textAnchor="middle">{m[2]}</text>
      <line x1={x0 + vzB} x2={x0 + vzB + breite} y1={achse} y2={achse} stroke={fill} strokeWidth={Math.max(0.9, size * 0.08)} />
      <text x={mitte} y={achse + kl * 0.86} fontSize={kl} textAnchor="middle">{m[3]}</text>
    </g>
  );
}
