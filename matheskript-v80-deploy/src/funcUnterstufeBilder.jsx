/* ============================================================
   Modul Unterstufe – die Skizzen zu den Lerneinheiten (reine SVG-Bausteine).
   Aufruf: <UnterBild bild={{ art: "zahlenstrahl", … }} />  (Feld bild in unterstufeDaten5/6.js)
   Alle Bilder laufen auf voller Breite (viewBox), Beschriftungen in Montserrat,
   Farben aus C: Tinte für Linien, Grana (C.gruen) und Gold als Akzente.
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";
import { SvgZahl } from "./mathText.jsx";

const T = { fontFamily: "Montserrat, sans-serif", fontWeight: 700 };
const GRANA = C.gruen, GOLD = C.flaggold;
const de = (n) => Number(n).toLocaleString("de-DE");

function Rahmen({ w = 360, h = 120, label, children }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} style={{ width: "100%", height: "auto", display: "block" }}>
      {children}
    </svg>
  );
}

/* ---------- Zahlen ---------- */
function Zahlenstrahl({ von = 0, bis = 1000, schritt = 100, marken = [] }) {
  const n = Math.round((bis - von) / schritt), W = 360, x = (v) => 24 + ((v - von) / (bis - von)) * (W - 48);
  return (
    <Rahmen h={92} label="Zahlenstrahl">
      <line x1="10" y1="48" x2={W - 6} y2="48" stroke={C.tinte} strokeWidth="1.6" />
      <path d={`M${W - 12} 43 L${W - 4} 48 L${W - 12} 53`} fill="none" stroke={C.tinte} strokeWidth="1.6" strokeLinecap="round" />
      {Array.from({ length: n + 1 }, (_, i) => {
        const v = von + i * schritt, gross = i % 5 === 0 || i === n;
        return (
          <g key={i}>
            <line x1={x(v)} y1={gross ? 40 : 43} x2={x(v)} y2={gross ? 56 : 53} stroke={C.tinte} strokeWidth={gross ? 1.6 : 1} />
            {gross && <text x={x(v)} y="74" textAnchor="middle" fontSize="11" style={T} fill={C.tinte}>{de(v)}</text>}
          </g>
        );
      })}
      {marken.map(([v, l], i) => (
        <g key={`m${i}`}>
          <path d={`M${x(v)} 30 l-5 -9 h10 z`} fill={GRANA} />
          <text x={x(v)} y="16" textAnchor="middle" fontSize="11.5" style={T} fill={GRANA}>{l}</text>
        </g>
      ))}
    </Rahmen>
  );
}

function Zahlengerade({ von = -6, bis = 6, punkte = [], pfeil = null }) {
  const W = 360, x = (v) => 20 + ((v - von) / (bis - von)) * (W - 40);
  return (
    <Rahmen h={96} label="Zahlengerade">
      <line x1="6" y1="52" x2={W - 6} y2="52" stroke={C.tinte} strokeWidth="1.6" />
      <path d={`M${W - 12} 47 L${W - 4} 52 L${W - 12} 57`} fill="none" stroke={C.tinte} strokeWidth="1.6" strokeLinecap="round" />
      {Array.from({ length: bis - von + 1 }, (_, i) => {
        const v = von + i;
        return (
          <g key={i}>
            <line x1={x(v)} y1={v === 0 ? 42 : 46} x2={x(v)} y2={v === 0 ? 62 : 58} stroke={C.tinte} strokeWidth={v === 0 ? 1.8 : 1} />
            <text x={x(v)} y="78" textAnchor="middle" fontSize="11" style={T} fill={v < 0 ? GRANA : C.tinte}>{v < 0 ? `−${-v}` : v}</text>
          </g>
        );
      })}
      {pfeil && (
        <g>
          <path d={`M${x(pfeil[0])} 30 Q ${(x(pfeil[0]) + x(pfeil[1])) / 2} 6 ${x(pfeil[1])} 30`} fill="none" stroke={GOLD} strokeWidth="2.6" strokeLinecap="round" />
          <path d={`M${x(pfeil[1])} 30 l${pfeil[1] > pfeil[0] ? -8 : 8} -3 l${pfeil[1] > pfeil[0] ? 1 : -1} 8 z`} fill={GOLD} />
          <text x={(x(pfeil[0]) + x(pfeil[1])) / 2} y="14" textAnchor="middle" fontSize="11" style={T} fill={C.golddunkel}>{pfeil[1] - pfeil[0] > 0 ? `+ ${pfeil[1] - pfeil[0]}` : `− ${pfeil[0] - pfeil[1]}`}</text>
        </g>
      )}
      {punkte.map(([v, l], i) => (
        <g key={`p${i}`}>
          <circle cx={x(v)} cy="52" r="5" fill={GRANA} stroke={C.weiss} strokeWidth="1.5" />
          <text x={x(v)} y="36" textAnchor="middle" fontSize="11.5" style={T} fill={GRANA}>{l}</text>
        </g>
      ))}
    </Rahmen>
  );
}

function Stellentafel({ zahl = 3407250 }) {
  const namen = ["M", "HT", "ZT", "T", "H", "Z", "E"];
  const ziffern = String(zahl).padStart(7, " ").split("");
  const W = 360, bw = (W - 20) / 7;
  return (
    <Rahmen h={92} label="Stellenwerttafel">
      {namen.map((n, i) => {
        const x = 10 + i * bw, tausender = i >= 3 && i <= 5, mio = i === 0;
        return (
          <g key={n}>
            <rect x={x} y="8" width={bw - 3} height="26" rx="6" fill={mio ? `${GOLD}44` : tausender ? `${GOLD}22` : `${C.see}12`} />
            <text x={x + (bw - 3) / 2} y="26" textAnchor="middle" fontSize="11.5" style={T} fill={i <= 2 ? C.golddunkel : C.see}>{n}</text>
            <rect x={x} y="40" width={bw - 3} height="40" rx="8" fill={C.weiss} stroke={C.linie} />
            <text x={x + (bw - 3) / 2} y="68" textAnchor="middle" fontSize="24" style={T} fill={C.tinte}>{ziffern[i].trim()}</text>
          </g>
        );
      })}
    </Rahmen>
  );
}

/* ---------- Daten ---------- */
function Saeulen({ titel, daten = [] }) {
  const W = 360, H = 150, max = Math.max(...daten.map((d) => d[1]), 1), n = daten.length, bw = Math.min(44, (W - 60) / n - 10);
  return (
    <Rahmen h={H} label={titel || "Säulendiagramm"}>
      {titel && <text x="8" y="14" fontSize="11.5" style={T} fill={C.grau}>{titel}</text>}
      <line x1="30" y1="24" x2="30" y2="118" stroke={C.tinte} strokeWidth="1.2" />
      <line x1="30" y1="118" x2={W - 8} y2="118" stroke={C.tinte} strokeWidth="1.2" />
      {Array.from({ length: Math.ceil(max / 2) + 1 }, (_, i) => i * 2).filter((v) => v <= max).map((v) => (
        <g key={v}><line x1="27" y1={118 - (v / max) * 86} x2="33" y2={118 - (v / max) * 86} stroke={C.tinte} /><text x="22" y={121 - (v / max) * 86} textAnchor="end" fontSize="9.5" style={T} fill={C.grau}>{v}</text></g>
      ))}
      {daten.map(([name, wert], i) => {
        const x = 44 + i * ((W - 60) / n), h = (wert / max) * 86;
        return (
          <g key={name}>
            <rect x={x} y={118 - h} width={bw} height={h} rx="4" fill={i % 2 ? C.see : GRANA} />
            <text x={x + bw / 2} y={112 - h} textAnchor="middle" fontSize="10.5" style={T} fill={C.tinte}>{wert}</text>
            <text x={x + bw / 2} y="134" textAnchor="middle" fontSize="9.5" style={T} fill={C.grau}>{name}</text>
          </g>
        );
      })}
    </Rahmen>
  );
}

function Kreisdiagramm({ teile = [] }) {
  const summe = teile.reduce((s, t) => s + t[1], 0) || 1, cx = 90, cy = 72, r = 56;
  const farben = [GRANA, C.see, GOLD, C.tuerkis, C.lila, C.smaragd];
  let winkel = -90;
  const stuecke = teile.map(([name, wert], i) => {
    const a0 = winkel, a1 = winkel + (wert / summe) * 360;
    winkel = a1;
    const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1), gross = a1 - a0 > 180 ? 1 : 0;
    return { name, wert, d: `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${gross} 1 ${x1} ${y1} Z`, grad: Math.round((wert / summe) * 360), farbe: farben[i % farben.length] };
  });
  return (
    <Rahmen h={144} label="Kreisdiagramm">
      {stuecke.map((s) => <path key={s.name} d={s.d} fill={s.farbe} stroke={C.weiss} strokeWidth="2" />)}
      {stuecke.map((s, i) => (
        <g key={`l${i}`}>
          <rect x="170" y={18 + i * 26} width="14" height="14" rx="3" fill={s.farbe} />
          <text x="192" y={30 + i * 26} fontSize="11.5" style={T} fill={C.tinte}>{s.name}</text>
          <text x="352" y={30 + i * 26} textAnchor="end" fontSize="11.5" style={T} fill={C.grau}>{s.wert} → {s.grad}°</text>
        </g>
      ))}
    </Rahmen>
  );
}

function Graph({ punkte = [], xName = "x", yName = "y", max = [5, 5] }) {
  const W = 360, H = 170, x = (v) => 40 + (v / max[0]) * (W - 60), y = (v) => 140 - (v / max[1]) * 120;
  return (
    <Rahmen h={H} label="Graph einer Zuordnung">
      <line x1="40" y1="140" x2={W - 8} y2="140" stroke={C.tinte} strokeWidth="1.2" />
      <line x1="40" y1="140" x2="40" y2="10" stroke={C.tinte} strokeWidth="1.2" />
      {Array.from({ length: max[0] }, (_, i) => i + 1).map((v) => <g key={`x${v}`}><line x1={x(v)} y1="137" x2={x(v)} y2="143" stroke={C.tinte} /><text x={x(v)} y="156" textAnchor="middle" fontSize="10" style={T} fill={C.grau}>{v}</text></g>)}
      {[max[1] / 5, (2 * max[1]) / 5, (3 * max[1]) / 5, (4 * max[1]) / 5, max[1]].map((v) => <g key={`y${v}`}><line x1="37" y1={y(v)} x2="43" y2={y(v)} stroke={C.tinte} /><text x="32" y={y(v) + 3.5} textAnchor="end" fontSize="9.5" style={T} fill={C.grau}>{de(Math.round(v * 100) / 100)}</text></g>)}
      <text x={W - 8} y="166" textAnchor="end" fontSize="10" style={T} fill={C.grau}>{xName}</text>
      <text x="46" y="12" fontSize="10" style={T} fill={C.grau}>{yName}</text>
      <path d={punkte.map(([a, b], i) => `${i ? "L" : "M"}${x(a)} ${y(b)}`).join(" ")} fill="none" stroke={`${GRANA}66`} strokeWidth="1.4" strokeDasharray="3 3" />
      {punkte.map(([a, b], i) => <circle key={i} cx={x(a)} cy={y(b)} r="4.5" fill={GRANA} stroke={C.weiss} strokeWidth="1.5" />)}
    </Rahmen>
  );
}

/* ---------- Geometrie ---------- */
function Linien() {
  return (
    <Rahmen h={128} label="Punkt, Strecke, Strahl und Gerade">
      {[["Punkt", 22], ["Strecke", 50], ["Strahl", 78], ["Gerade", 106]].map(([n, y]) => <text key={n} x="8" y={y + 4} fontSize="11.5" style={T} fill={C.grau}>{n}</text>)}
      <circle cx="140" cy="22" r="3.5" fill={C.tinte} /><text x="148" y="18" fontSize="11" style={T} fill={C.tinte}>P</text>
      <line x1="90" y1="50" x2="250" y2="50" stroke={C.tinte} strokeWidth="2" /><circle cx="90" cy="50" r="3.5" fill={GRANA} /><circle cx="250" cy="50" r="3.5" fill={GRANA} />
      <text x="86" y="42" fontSize="11" style={T} fill={GRANA}>A</text><text x="246" y="42" fontSize="11" style={T} fill={GRANA}>B</text>
      <line x1="90" y1="78" x2="340" y2="78" stroke={C.tinte} strokeWidth="2" /><path d="M334 73 L342 78 L334 83" fill="none" stroke={C.tinte} strokeWidth="2" strokeLinecap="round" /><circle cx="90" cy="78" r="3.5" fill={GRANA} />
      <line x1="80" y1="106" x2="352" y2="106" stroke={C.tinte} strokeWidth="2" /><path d="M86 101 L78 106 L86 111 M346 101 L354 106 L346 111" fill="none" stroke={C.tinte} strokeWidth="2" strokeLinecap="round" /><text x="340" y="98" fontSize="11" fontStyle="italic" style={T} fill={C.tinte}>g</text>
    </Rahmen>
  );
}

function SenkrechtParallel() {
  return (
    <Rahmen h={130} label="Senkrechte und parallele Geraden">
      <line x1="20" y1="100" x2="170" y2="100" stroke={C.tinte} strokeWidth="2" /><line x1="95" y1="20" x2="95" y2="120" stroke={GRANA} strokeWidth="2" />
      <path d="M95 86 h14 v14" fill="none" stroke={GRANA} strokeWidth="1.4" /><circle cx="102" cy="93" r="1.6" fill={GRANA} />
      <text x="22" y="92" fontSize="11" fontStyle="italic" style={T} fill={C.tinte}>g</text><text x="100" y="30" fontSize="11" fontStyle="italic" style={T} fill={GRANA}>h</text>
      <text x="40" y="124" fontSize="11.5" style={T} fill={C.grau}>g ⊥ h</text>
      <line x1="200" y1="40" x2="350" y2="40" stroke={C.tinte} strokeWidth="2" /><line x1="200" y1="96" x2="350" y2="96" stroke={C.tinte} strokeWidth="2" />
      <line x1="275" y1="40" x2="275" y2="96" stroke={GOLD} strokeWidth="2" strokeDasharray="4 3" /><path d="M275 48 h8 v-8" fill="none" stroke={GOLD} strokeWidth="1.3" />
      <text x="282" y="72" fontSize="10.5" style={T} fill={C.golddunkel}>Abstand</text>
      <text x="202" y="32" fontSize="11" fontStyle="italic" style={T} fill={C.tinte}>g</text><text x="202" y="112" fontSize="11" fontStyle="italic" style={T} fill={C.tinte}>h</text>
      <text x="300" y="124" fontSize="11.5" style={T} fill={C.grau}>g ∥ h</text>
    </Rahmen>
  );
}

function Koordinaten({ punkte = [], spiegel = null, max = 6 }) {
  const neg = spiegel === "y" || spiegel === "o" || punkte.some((p) => p[0] < 0 || p[1] < 0);
  const H = 190, W = 360, min = neg ? -max : 0, cx = 180, cy = neg ? 95 : 160, e = neg ? 150 / (2 * max) : 140 / max;
  const x = (v) => cx + (neg ? v * e : (v - max / 2) * e), y = (v) => cy - v * e;
  const xs = [], ys = [];
  for (let v = min; v <= max; v++) { xs.push(v); ys.push(v); }
  return (
    <Rahmen h={H} label="Koordinatensystem">
      {xs.map((v) => <line key={`gx${v}`} x1={x(v)} y1={y(min)} x2={x(v)} y2={y(max)} stroke={C.linie} strokeWidth="0.8" />)}
      {ys.map((v) => <line key={`gy${v}`} x1={x(min)} y1={y(v)} x2={x(max)} y2={y(v)} stroke={C.linie} strokeWidth="0.8" />)}
      <line x1={x(min)} y1={y(0)} x2={x(max) + 8} y2={y(0)} stroke={C.tinte} strokeWidth="1.4" /><path d={`M${x(max) + 2} ${y(0) - 4} L${x(max) + 9} ${y(0)} L${x(max) + 2} ${y(0) + 4}`} fill="none" stroke={C.tinte} strokeWidth="1.4" />
      <line x1={x(0)} y1={y(min)} x2={x(0)} y2={y(max) - 8} stroke={C.tinte} strokeWidth="1.4" /><path d={`M${x(0) - 4} ${y(max) - 2} L${x(0)} ${y(max) - 9} L${x(0) + 4} ${y(max) - 2}`} fill="none" stroke={C.tinte} strokeWidth="1.4" />
      {xs.filter((v) => v !== 0).map((v) => <text key={`tx${v}`} x={x(v)} y={y(0) + 13} textAnchor="middle" fontSize="9" style={T} fill={C.grau}>{v < 0 ? `−${-v}` : v}</text>)}
      {ys.filter((v) => v !== 0).map((v) => <text key={`ty${v}`} x={x(0) - 6} y={y(v) + 3} textAnchor="end" fontSize="9" style={T} fill={C.grau}>{v < 0 ? `−${-v}` : v}</text>)}
      <text x={x(max) + 4} y={y(0) - 8} fontSize="11" fontStyle="italic" style={T} fill={C.tinte}>x</text>
      <text x={x(0) + 8} y={y(max) - 2} fontSize="11" fontStyle="italic" style={T} fill={C.tinte}>y</text>
      {spiegel === "y" && <line x1={x(0)} y1={y(min)} x2={x(0)} y2={y(max)} stroke={GOLD} strokeWidth="3" strokeOpacity="0.7" />}
      {spiegel === "x" && <line x1={x(min)} y1={y(0)} x2={x(max)} y2={y(0)} stroke={GOLD} strokeWidth="3" strokeOpacity="0.7" />}
      {spiegel === "o" && <circle cx={x(0)} cy={y(0)} r="6" fill="none" stroke={GOLD} strokeWidth="2.4" />}
      {spiegel && punkte.length >= 2 && <line x1={x(punkte[0][0])} y1={y(punkte[0][1])} x2={x(punkte[1][0])} y2={y(punkte[1][1])} stroke={C.grau} strokeWidth="1" strokeDasharray="3 3" />}
      {punkte.map(([a, b, l], i) => (
        <g key={i}>
          <line x1={x(a)} y1={y(b)} x2={x(a)} y2={y(0)} stroke={`${GRANA}55`} strokeWidth="1" strokeDasharray="2 2" /><line x1={x(a)} y1={y(b)} x2={x(0)} y2={y(b)} stroke={`${GRANA}55`} strokeWidth="1" strokeDasharray="2 2" />
          <circle cx={x(a)} cy={y(b)} r="4.5" fill={i === 0 ? GRANA : C.see} stroke={C.weiss} strokeWidth="1.5" />
          <text x={x(a) + 7} y={y(b) - 6} fontSize="11" style={T} fill={i === 0 ? GRANA : C.see}>{l}({a < 0 ? `−${-a}` : a} | {b < 0 ? `−${-b}` : b})</text>
        </g>
      ))}
    </Rahmen>
  );
}

function Vierecke() {
  const F = [
    ["Quadrat", "M10 60 h50 v-50 h-50 z"], ["Rechteck", "M10 60 h60 v-36 h-60 z"], ["Raute", "M40 60 l-30 -24 l30 -24 l30 24 z"],
    ["Parallelogramm", "M10 60 h44 l18 -40 h-44 z"], ["Trapez", "M8 60 h66 l-16 -40 h-34 z"], ["Drachen", "M38 62 l-26 -28 l26 -30 l26 30 z"],
  ];
  return (
    <Rahmen h={176} label="Besondere Vierecke">
      {F.map(([n, d], i) => (
        <g key={n} transform={`translate(${(i % 3) * 120} ${Math.floor(i / 3) * 86})`}>
          <path d={d} fill={`${i % 2 ? C.see : GRANA}1A`} stroke={i % 2 ? C.see : GRANA} strokeWidth="2" strokeLinejoin="round" />
          <text x="40" y="80" textAnchor="middle" fontSize="10.5" style={T} fill={C.grau}>{n}</text>
        </g>
      ))}
    </Rahmen>
  );
}

function Rechteck({ a = 5, b = 3, einheit = "cm", raster = true }) {
  const e = 36, x0 = 60, y0 = 24, W = 360;
  return (
    <Rahmen h={y0 + b * e + 40} label="Rechteck">
      <rect x={x0} y={y0} width={a * e} height={b * e} fill={`${C.see}14`} stroke={C.see} strokeWidth="2" />
      {raster && Array.from({ length: a - 1 }, (_, i) => <line key={`v${i}`} x1={x0 + (i + 1) * e} y1={y0} x2={x0 + (i + 1) * e} y2={y0 + b * e} stroke={C.see} strokeOpacity="0.35" />)}
      {raster && Array.from({ length: b - 1 }, (_, i) => <line key={`h${i}`} x1={x0} y1={y0 + (i + 1) * e} x2={x0 + a * e} y2={y0 + (i + 1) * e} stroke={C.see} strokeOpacity="0.35" />)}
      <text x={x0 + (a * e) / 2} y={y0 + b * e + 20} textAnchor="middle" fontSize="12" style={T} fill={GRANA}>a = {a} {einheit}</text>
      <text x={x0 - 8} y={y0 + (b * e) / 2 + 4} textAnchor="end" fontSize="12" style={T} fill={GRANA}>b = {b} {einheit}</text>
      <text x={W - 8} y={y0 + 16} textAnchor="end" fontSize="11.5" style={T} fill={C.grau}>{a} · {b} = {a * b} Quadrate</text>
      <text x={W - 8} y={y0 + 34} textAnchor="end" fontSize="11.5" style={T} fill={C.grau}>A = {a * b} {einheit}²</text>
    </Rahmen>
  );
}

function Parallelogramm({ g = 6, h = 3 }) {
  const e = 30, x0 = 30, y0 = 20, s = 40;
  return (
    <Rahmen h={y0 + h * e + 36} label="Parallelogramm wird zum Rechteck">
      <path d={`M${x0} ${y0 + h * e} h${g * e} l${s} ${-h * e} h${-g * e} z`} fill={`${GRANA}14`} stroke={GRANA} strokeWidth="2" strokeLinejoin="round" />
      <path d={`M${x0 + g * e} ${y0 + h * e} l${s} ${-h * e} v${h * e} z`} fill={`${GOLD}55`} stroke={C.golddunkel} strokeWidth="1.2" strokeDasharray="4 3" />
      <path d={`M${x0} ${y0 + h * e} l${s} ${-h * e} v${h * e} z`} fill={`${GOLD}55`} stroke={C.golddunkel} strokeWidth="1.2" strokeDasharray="4 3" />
      <line x1={x0 + s} y1={y0} x2={x0 + s} y2={y0 + h * e} stroke={C.see} strokeWidth="2" /><path d={`M${x0 + s} ${y0 + h * e - 10} h10 v10`} fill="none" stroke={C.see} strokeWidth="1.2" />
      <text x={x0 + s + 6} y={y0 + (h * e) / 2} fontSize="12" style={T} fill={C.see}>h = {h}</text>
      <text x={x0 + (g * e) / 2} y={y0 + h * e + 20} textAnchor="middle" fontSize="12" style={T} fill={GRANA}>g = {g}</text>
      <text x="352" y={y0 + 14} textAnchor="end" fontSize="11.5" style={T} fill={C.grau}>Dreieck abschneiden,</text>
      <text x="352" y={y0 + 30} textAnchor="end" fontSize="11.5" style={T} fill={C.grau}>rechts ansetzen → A = g · h = {g * h}</text>
    </Rahmen>
  );
}

function Quader({ a = 5, b = 3, c = 2, wuerfel = false }) {
  const e = 30, x0 = 50, y0 = 100, dx = 0.5 * e * b, dy = 0.5 * e * b;
  const P = (x, y, z) => [x0 + x * e + z * dx / b, y0 - y * e - z * dy / b];
  const p = (pt) => pt.join(" ");
  const A = P(0, 0, 0), B = P(a, 0, 0), Cc = P(a, c, 0), D = P(0, c, 0), E = P(0, 0, b), F = P(a, 0, b), G = P(a, c, b), Hh = P(0, c, b);
  return (
    <Rahmen h={140} label="Quader">
      <path d={`M${p(A)} L${p(B)} L${p(Cc)} L${p(D)} Z`} fill={`${C.see}1A`} stroke={C.see} strokeWidth="2" strokeLinejoin="round" />
      <path d={`M${p(D)} L${p(Cc)} L${p(G)} L${p(Hh)} Z`} fill={`${C.see}30`} stroke={C.see} strokeWidth="2" strokeLinejoin="round" />
      <path d={`M${p(B)} L${p(F)} L${p(G)} L${p(Cc)} Z`} fill={`${C.see}48`} stroke={C.see} strokeWidth="2" strokeLinejoin="round" />
      <path d={`M${p(A)} L${p(E)} L${p(F)} M${p(E)} L${p(Hh)}`} fill="none" stroke={C.see} strokeWidth="1.4" strokeDasharray="4 3" />
      {wuerfel && Array.from({ length: a - 1 }, (_, i) => <line key={`w${i}`} x1={P(i + 1, 0, 0)[0]} y1={P(i + 1, 0, 0)[1]} x2={P(i + 1, c, 0)[0]} y2={P(i + 1, c, 0)[1]} stroke={C.see} strokeOpacity="0.4" />)}
      {wuerfel && Array.from({ length: c - 1 }, (_, i) => <line key={`h${i}`} x1={P(0, i + 1, 0)[0]} y1={P(0, i + 1, 0)[1]} x2={P(a, i + 1, 0)[0]} y2={P(a, i + 1, 0)[1]} stroke={C.see} strokeOpacity="0.4" />)}
      <text x={(A[0] + B[0]) / 2} y={A[1] + 16} textAnchor="middle" fontSize="12" style={T} fill={GRANA}>a = {a}</text>
      <text x={B[0] + 12} y={(B[1] + F[1]) / 2 + 10} fontSize="12" style={T} fill={GRANA}>b = {b}</text>
      <text x={A[0] - 8} y={(A[1] + D[1]) / 2 + 4} textAnchor="end" fontSize="12" style={T} fill={GRANA}>c = {c}</text>
      <text x="352" y="24" textAnchor="end" fontSize="11.5" style={T} fill={C.grau}>{wuerfel ? `${a} · ${b} = ${a * b} Würfel je Schicht` : "6 Flächen, 12 Kanten, 8 Ecken"}</text>
      <text x="352" y="42" textAnchor="end" fontSize="11.5" style={T} fill={C.grau}>{wuerfel ? `${c} Schichten → V = ${a * b * c}` : `O = 2 · (${a}·${b} + ${a}·${c} + ${b}·${c}) = ${2 * (a * b + a * c + b * c)}`}</text>
    </Rahmen>
  );
}

function Netz() {
  const z = 26, F = [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]];
  const N = [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1]];
  return (
    <Rahmen h={110} label="Würfelnetz und kein Würfelnetz">
      {F.map(([x, y], i) => <rect key={i} x={30 + x * z} y={12 + y * z} width={z} height={z} fill={`${GRANA}22`} stroke={GRANA} strokeWidth="1.6" />)}
      <text x={30 + 2 * z} y="104" textAnchor="middle" fontSize="11" style={T} fill={GRANA}>Würfelnetz ✓</text>
      {N.map(([x, y], i) => <rect key={i} x={210 + x * z} y={26 + y * z} width={z} height={z} fill={`${C.grau}22`} stroke={C.grau} strokeWidth="1.6" />)}
      <text x={210 + 2 * z} y="104" textAnchor="middle" fontSize="11" style={T} fill={C.grau}>kein Netz (2 × 2-Block) ✗</text>
    </Rahmen>
  );
}

/* ---------- Brüche ---------- */
function Bruch({ z = 3, n = 8 }) {
  const cx = 70, cy = 66, r = 50;
  const stuecke = Array.from({ length: n }, (_, i) => {
    const a0 = -90 + (i / n) * 360, a1 = -90 + ((i + 1) / n) * 360, p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`;
  });
  const bw = 200 / n;
  return (
    <Rahmen h={132} label={`Bruch ${z}/${n} als Kreis und Streifen`}>
      {stuecke.map((d, i) => <path key={i} d={d} fill={i < z ? GRANA : C.weiss} stroke={C.tinte} strokeWidth="1.2" />)}
      {Array.from({ length: n }, (_, i) => <rect key={`s${i}`} x={150 + i * bw} y="44" width={bw} height="40" fill={i < z ? GRANA : C.weiss} stroke={C.tinte} strokeWidth="1.2" />)}
      <SvgZahl x={250} y={30} t={`${z}/${n}`} size={14} fill={GRANA} />
      <text x="250" y="110" textAnchor="middle" fontSize="11" style={T} fill={C.grau}>{z} von {n} gleichen Teilen</text>
    </Rahmen>
  );
}

function Bruchstrahl({ n = 4, marken = [] }) {
  const W = 360, x = (k) => 24 + (k / (2 * n)) * (W - 48);
  return (
    <Rahmen h={92} label="Brüche auf dem Zahlenstrahl">
      <line x1="10" y1="48" x2={W - 6} y2="48" stroke={C.tinte} strokeWidth="1.6" />
      {Array.from({ length: 2 * n + 1 }, (_, k) => (
        <g key={k}>
          <line x1={x(k)} y1={k % n ? 43 : 38} x2={x(k)} y2={k % n ? 53 : 58} stroke={C.tinte} strokeWidth={k % n ? 1 : 1.8} />
          {k % n === 0 && <text x={x(k)} y="76" textAnchor="middle" fontSize="12" style={T} fill={C.tinte}>{k / n}</text>}
        </g>
      ))}
      {marken.map(([k, l], i) => (
        <g key={`m${i}`}>
          <circle cx={x(k)} cy="48" r="5" fill={GRANA} stroke={C.weiss} strokeWidth="1.5" />
          <SvgZahl x={x(k)} y={28} t={l} size={12} fill={GRANA} />
        </g>
      ))}
    </Rahmen>
  );
}

function Prozentstreifen({ p = 25 }) {
  return (
    <Rahmen h={78} label={`${p} Prozent als Streifen`}>
      <rect x="10" y="20" width="340" height="30" rx="6" fill={C.weiss} stroke={C.tinte} strokeWidth="1.4" />
      <rect x="10" y="20" width={3.4 * p} height="30" rx="6" fill={GRANA} />
      {[25, 50, 75].map((m) => <line key={m} x1={10 + 3.4 * m} y1="20" x2={10 + 3.4 * m} y2="50" stroke={C.tinte} strokeOpacity="0.4" />)}
      {[0, 25, 50, 75, 100].map((m) => <text key={m} x={10 + 3.4 * m} y="66" textAnchor="middle" fontSize="10.5" style={T} fill={C.grau}>{m} %</text>)}
      <text x={10 + 1.7 * p} y="40" textAnchor="middle" fontSize="12" style={T} fill={p >= 15 ? C.weiss : GRANA}>{p} %</text>
    </Rahmen>
  );
}

function BruchMal({ a = [1, 2], b = [1, 3] }) {
  const sp = a[1], ze = b[1], w = 160 / sp, h = 110 / ze;
  return (
    <Rahmen h={134} label="Bruch mal Bruch am Rechteck">
      {Array.from({ length: ze }, (_, r) => Array.from({ length: sp }, (_, c) => (
        <rect key={`${r}-${c}`} x={20 + c * w} y={10 + r * h} width={w} height={h} fill={c < a[0] && r < b[0] ? GRANA : c < a[0] ? `${GRANA}44` : r < b[0] ? `${C.see}33` : C.weiss} stroke={C.tinte} strokeWidth="1.2" />
      )))}
      <SvgZahl x={100} y={132} t={`${a[0]}/${a[1]}`} size={12} fill={GRANA} />
      <SvgZahl x={8} y={70} t={`${b[0]}/${b[1]}`} size={12} fill={C.see} anchor="start" />
      <text x="230" y="48" fontSize="11.5" style={T} fill={C.grau}>{sp} Spalten · {ze} Zeilen</text>
      <text x="230" y="66" fontSize="11.5" style={T} fill={C.grau}>= {sp * ze} Felder</text>
      <text x="230" y="90" fontSize="11.5" style={T} fill={GRANA}>{a[0] * b[0]} Feld{a[0] * b[0] > 1 ? "er" : ""} doppelt gefärbt</text>
      <SvgZahl x={230} y={116} t={`${a[0] * b[0]}/${sp * ze}`} size={14} fill={GRANA} anchor="start" />
    </Rahmen>
  );
}

/* ---------- Winkel und Kreis ---------- */
function Winkel({ grad = 50 }) {
  const cx = 90, cy = 96, r = 70, p = (a, rr = r) => [cx + rr * Math.cos((-a * Math.PI) / 180), cy + rr * Math.sin((-a * Math.PI) / 180)];
  const [x1, y1] = p(grad), [bx, by] = p(grad, 28), [mx, my] = p(grad / 2, 40);
  return (
    <Rahmen h={120} label={`Winkel mit ${grad} Grad`}>
      <line x1={cx} y1={cy} x2={cx + r + 20} y2={cy} stroke={C.tinte} strokeWidth="2" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={x1 + (x1 - cx) * 0.25} y2={y1 + (y1 - cy) * 0.25} stroke={C.tinte} strokeWidth="2" strokeLinecap="round" />
      <path d={`M${cx + 28} ${cy} A28 28 0 0 0 ${bx} ${by}`} fill={`${GOLD}55`} stroke={C.golddunkel} strokeWidth="1.6" />
      <circle cx={cx} cy={cy} r="3.5" fill={GRANA} />
      <text x={cx - 4} y={cy + 16} fontSize="11" style={T} fill={GRANA}>S (Scheitel)</text>
      <text x={mx + 6} y={my + 4} fontSize="12" fontStyle="italic" style={T} fill={C.golddunkel}>α = {grad}°</text>
      <text x={cx + r - 10} y={cy - 8} fontSize="11" style={T} fill={C.grau}>Schenkel</text>
      <text x={x1 - 40} y={y1 - 6} fontSize="11" style={T} fill={C.grau}>Schenkel</text>
      <text x="352" y="24" textAnchor="end" fontSize="11.5" style={T} fill={C.grau}>gemessen gegen den Uhrzeigersinn</text>
    </Rahmen>
  );
}

function Winkelarten() {
  const L = [["spitz", 40], ["recht", 90], ["stumpf", 130], ["gestreckt", 180], ["überstumpf", 250], ["voll", 360]];
  return (
    <Rahmen h={100} label="Die sechs Winkelarten">
      {L.map(([n, g], i) => {
        const cx = 30 + i * 60, cy = 56, r = 20, a = (-g * Math.PI) / 180, x1 = cx + 22 * Math.cos(a), y1 = cy + 22 * Math.sin(a);
        const gross = g > 180 ? 1 : 0;
        return (
          <g key={n}>
            {g < 360 ? <path d={`M${cx} ${cy} L${cx + r} ${cy} A${r} ${r} 0 ${gross} 0 ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)} Z`} fill={`${GOLD}66`} stroke={C.golddunkel} strokeWidth="1.2" /> : <circle cx={cx} cy={cy} r={r} fill={`${GOLD}66`} stroke={C.golddunkel} strokeWidth="1.2" />}
            <line x1={cx} y1={cy} x2={cx + 26} y2={cy} stroke={C.tinte} strokeWidth="1.6" />
            {g < 360 && <line x1={cx} y1={cy} x2={x1} y2={y1} stroke={C.tinte} strokeWidth="1.6" />}
            {g === 90 && <path d={`M${cx + 7} ${cy} v-7 h-7`} fill="none" stroke={C.tinte} strokeWidth="1" />}
            <text x={cx} y="92" textAnchor="middle" fontSize="10" style={T} fill={C.grau}>{n}</text>
            <text x={cx} y="22" textAnchor="middle" fontSize="10.5" style={T} fill={C.golddunkel}>{g === 40 ? "< 90°" : g === 130 ? "90°–180°" : g === 250 ? "180°–360°" : `${g}°`}</text>
          </g>
        );
      })}
    </Rahmen>
  );
}

function Scheitelwinkel({ alpha = 40 }) {
  const cx = 180, cy = 64, a = (-alpha * Math.PI) / 180, L = 150;
  const bogen = (von, bis, r, farbe) => {
    const p = (g) => [cx + r * Math.cos((-g * Math.PI) / 180), cy + r * Math.sin((-g * Math.PI) / 180)];
    const [x0, y0] = p(von), [x1, y1] = p(bis);
    return <path d={`M${x0} ${y0} A${r} ${r} 0 ${bis - von > 180 ? 1 : 0} 0 ${x1} ${y1}`} fill="none" stroke={farbe} strokeWidth="2" />;
  };
  const lab = (g, r, t, farbe) => <text x={cx + r * Math.cos((-g * Math.PI) / 180)} y={cy + r * Math.sin((-g * Math.PI) / 180) + 4} textAnchor="middle" fontSize="12" fontStyle="italic" style={T} fill={farbe}>{t}</text>;
  return (
    <Rahmen h={128} label="Scheitel- und Nebenwinkel">
      <line x1={cx - L} y1={cy} x2={cx + L} y2={cy} stroke={C.tinte} strokeWidth="2" />
      <line x1={cx - L * Math.cos(a)} y1={cy - L * Math.sin(a)} x2={cx + L * Math.cos(a)} y2={cy + L * Math.sin(a)} stroke={C.tinte} strokeWidth="2" />
      {bogen(0, alpha, 26, GRANA)}{bogen(180, 180 + alpha, 26, GRANA)}
      {bogen(alpha, 180, 34, C.see)}{bogen(180 + alpha, 360, 34, C.see)}
      {lab(alpha / 2, 44, `α = ${alpha}°`, GRANA)}{lab(180 + alpha / 2, 44, `γ = ${alpha}°`, GRANA)}
      {lab(90 + alpha / 2, 50, `β = ${180 - alpha}°`, C.see)}{lab(270 + alpha / 2, 50, `δ = ${180 - alpha}°`, C.see)}
      <text x="8" y="120" fontSize="10.5" style={T} fill={C.grau}>Scheitelwinkel α = γ, β = δ · Nebenwinkel α + β = 180°</text>
    </Rahmen>
  );
}

function Kreis() {
  const cx = 100, cy = 70, r = 56;
  return (
    <Rahmen h={140} label="Begriffe am Kreis">
      <circle cx={cx} cy={cy} r={r} fill={`${C.see}0E`} stroke={C.tinte} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="3" fill={GRANA} /><text x={cx + 5} y={cy - 5} fontSize="11" style={T} fill={GRANA}>M</text>
      <line x1={cx} y1={cy} x2={cx + r * Math.cos(-0.6)} y2={cy + r * Math.sin(-0.6)} stroke={GRANA} strokeWidth="2" /><text x={cx + 18} y={cy - 22} fontSize="11.5" fontStyle="italic" style={T} fill={GRANA}>r</text>
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={C.see} strokeWidth="2" strokeDasharray="5 3" /><text x={cx - 30} y={cy + 14} fontSize="11.5" fontStyle="italic" style={T} fill={C.see}>d = 2r</text>
      <line x1={cx - 40} y1={cy + 39} x2={cx + 40} y2={cy + 39} stroke={C.golddunkel} strokeWidth="2" /><text x={cx} y={cy + 52} textAnchor="middle" fontSize="10.5" style={T} fill={C.golddunkel}>Sehne</text>
      <path d={`M${cx + r * Math.cos(0.9)} ${cy + r * Math.sin(0.9)} A${r} ${r} 0 0 1 ${cx + r * Math.cos(1.9)} ${cy + r * Math.sin(1.9)}`} fill="none" stroke={GOLD} strokeWidth="4" />
      <text x="222" y="30" fontSize="11.5" style={T} fill={C.tinte}>Mittelpunkt M</text>
      <text x="222" y="50" fontSize="11.5" style={T} fill={GRANA}>Radius r</text>
      <text x="222" y="70" fontSize="11.5" style={T} fill={C.see}>Durchmesser d = 2 · r</text>
      <text x="222" y="90" fontSize="11.5" style={T} fill={C.golddunkel}>Sehne: Strecke im Kreis</text>
      <text x="222" y="110" fontSize="11.5" style={T} fill={C.golddunkel}>Kreisbogen: Stück der Linie</text>
    </Rahmen>
  );
}

const BILDER = {
  zahlenstrahl: Zahlenstrahl, zahlengerade: Zahlengerade, stellentafel: Stellentafel, saeulen: Saeulen, kreisdiagramm: Kreisdiagramm, graph: Graph,
  linien: Linien, senkrechtparallel: SenkrechtParallel, koordinaten: Koordinaten, vierecke: Vierecke, rechteck: Rechteck, parallelogramm: Parallelogramm, quader: Quader, netz: Netz,
  bruch: Bruch, bruchstrahl: Bruchstrahl, prozentstreifen: Prozentstreifen, bruchmal: BruchMal,
  winkel: Winkel, winkelarten: Winkelarten, scheitelwinkel: Scheitelwinkel, kreis: Kreis,
};
export const BILD_ARTEN = Object.keys(BILDER);

export function UnterBild({ bild }) {
  if (!bild || !BILDER[bild.art]) return null;
  const Komp = BILDER[bild.art];
  const { art, ...rest } = bild;
  return <Komp {...rest} />;
}
