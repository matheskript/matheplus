/* ============================================================
   Szenen der Gruppe Brüche und Dezimalzahlen (Klasse 6) – Vertrag siehe kern.jsx.
   Regel der Gruppe: Brüche im Bild immer gestapelt (SvgBruch bzw. Tok/Reihe unten), nie mit Schrägstrich;
   in Untertiteln Brüche in Worten (bw()).
   Alle Szenennamen beginnen mit „b_“.
   ============================================================ */
import React from "react";
import { B, F, Tx, Strich, Pfeil, Sprung, Spitze, Puls, Pille, SvgBruch, breite, de, mix, klemm, teil, staffel, raus, sanft } from "./kern.jsx";

/* ---------- Hilfen ---------- */
const minus = (s) => String(s).replace(/-/g, "−");
const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
const kgV = (a, b) => (a / ggT(a, b)) * b;
const PI = Math.PI;

/* Zahlwörter und Brüche in Worten (für Untertitel) */
const EIN = ["null", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
const ZEHNER = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
function zahlwort(n) {
  if (n < 20) return EIN[n];
  if (n < 100) { const e = n % 10; return (e ? EIN[e] + "und" : "") + ZEHNER[Math.floor(n / 10)]; }
  if (n === 100) return "hundert";
  return String(n);
}
const gross = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function nennerWort(n) {
  if (n === 3) return "Drittel";
  if (n === 7) return "Siebtel";
  if (n === 8) return "Achtel";
  if (n === 100) return "Hundertstel";
  if (n === 1000) return "Tausendstel";
  if (n < 20) return gross(EIN[n]) + "tel";
  return gross(zahlwort(n)) + "stel";
}
/* „drei Achtel“, „ein Halb“ */
export function bw(z, n) {
  if (n === 2) return z === 1 ? "ein Halb" : `${zahlwort(z)} Halbe`;
  return `${zahlwort(z)} ${nennerWort(n)}`;
}
/* „drei Ganze und fünf Sechstel“ */
const gw = (g, z, n) => `${g === 1 ? "ein Ganzes" : zahlwort(g) + " Ganze"} und ${bw(z, n)}`;

/* ---------- Brüche und Terme gestapelt setzen ----------
   Teile einer Reihe: Zahl/Text ("+", "3", "(" …), { b: [z, n] } Bruch, { gm: [g, z, n] } gemischte Zahl,
   jeweils optional mit f (Farbe), o (Deckkraft), g (Schriftgröße). y = Höhe des Bruchstrichs (Mitte der Reihe). */
const bB = (z, n, g) => Math.max(String(z).length, String(n).length) * g * 0.62 + 6;
const istKl = (t) => t === "(" || t === ")";
function tokW(t, g) {
  if (t == null) return 0;
  if (typeof t !== "object") return istKl(t) ? g * 0.5 : breite(minus(t), g);
  const gg = t.g || g;
  if (t.b) return bB(t.b[0], t.b[1], gg);
  if (t.gm) return breite(String(t.gm[0]), gg * 1.3) + 3 + bB(t.gm[1], t.gm[2], gg);
  if (t.t != null) return tokW(t.t, gg);
  return 0;
}
function lage(teile, g, luecke = g * 0.34) {
  const ws = teile.map((t) => tokW(t, g));
  const w = ws.reduce((s, v) => s + v, 0) + luecke * Math.max(0, teile.length - 1);
  let x = -w / 2;
  const xs = [];
  ws.forEach((v) => { xs.push(x + v / 2); x += v + luecke; });
  return { xs, ws, w };
}
function Tok({ t, x, y, g, f = F.tinte, o = 1 }) {
  if (t == null || o <= 0) return null;
  if (typeof t !== "object") {
    const s = minus(t);
    if (istKl(t)) return <Tx x={x} y={y + g * 0.52} g={g * 1.75} f={f} w={400} o={o}>{s}</Tx>;
    return <Tx x={x} y={y + g * 0.36} g={g} f={f} o={o}>{s}</Tx>;
  }
  const gg = t.g || g, ff = t.f || f, oo = o * (t.o == null ? 1 : t.o);
  if (oo <= 0) return null;
  if (t.b) return <SvgBruch x={x} y={y - 1} z={minus(t.b[0])} n={minus(t.b[1])} g={gg} f={ff} o={oo} />;
  if (t.gm) {
    const wg = breite(String(t.gm[0]), gg * 1.3), wb = bB(t.gm[1], t.gm[2], gg), w = wg + 3 + wb, xl = x - w / 2;
    return (
      <g opacity={oo}>
        <Tx x={xl + wg / 2} y={y + gg * 0.47} g={gg * 1.3} f={ff}>{t.gm[0]}</Tx>
        <SvgBruch x={xl + wg + 3 + wb / 2} y={y - 1} z={t.gm[1]} n={t.gm[2]} g={gg} f={ff} />
      </g>
    );
  }
  if (t.t != null) return <Tok t={t.t} x={x} y={y} g={gg} f={ff} o={oo} />;
  return null;
}
function Reihe({ x, y, teile, g = 16, f = F.tinte, o = 1, luecke }) {
  if (o <= 0) return null;
  const L = lage(teile, g, luecke);
  return <g opacity={o}>{teile.map((t, i) => <Tok key={i} t={t} x={x + L.xs[i]} y={y} g={g} f={f} />)}</g>;
}

/* ---------- Flächen ---------- */
/* Rechteck in sp × ze Zellen. zelle(i, j) → null | { f, o }. linieV(i)/linieH(j) → { u, o } (Wachsen/Deckkraft der inneren Linien).
   Linien zwischen zwei gefärbten Zellen sind weiß, sonst Tinte. */
function Raster({ x, y, w, h, sp, ze, zelle, linieV, linieH, rand = F.tinte, b = 1.3, o = 1 }) {
  if (o <= 0) return null;
  const cw = w / sp, ch = h / ze;
  const c = (i, j) => (i >= 0 && j >= 0 && i < sp && j < ze ? zelle(i, j) : null);
  const voll = (i, j) => { const k = c(i, j); return !!k && k.o > 0.5; };
  const el = [];
  for (let j = 0; j < ze; j++) for (let i = 0; i < sp; i++) {
    const k = c(i, j);
    if (k && k.o > 0) el.push(<rect key={`c${i}-${j}`} x={x + i * cw} y={y + j * ch} width={cw + 0.3} height={ch + 0.3} fill={k.f} opacity={k.o} />);
  }
  for (let i = 1; i < sp; i++) {
    const L = linieV ? linieV(i) : { u: 1, o: 1 };
    if (L.u <= 0 || (L.o != null && L.o <= 0)) continue;
    const ende = y + h * L.u;
    for (let j = 0; j < ze; j++) {
      const y0 = y + j * ch; if (y0 >= ende) break;
      const y1 = Math.min(y0 + ch, ende);
      el.push(<line key={`v${i}-${j}`} x1={x + i * cw} y1={y0} x2={x + i * cw} y2={y1} stroke={voll(i - 1, j) && voll(i, j) ? F.weiss : F.tinte} strokeWidth={b} opacity={L.o == null ? 1 : L.o} />);
    }
  }
  for (let j = 1; j < ze; j++) {
    const L = linieH ? linieH(j) : { u: 1, o: 1 };
    if (L.u <= 0 || (L.o != null && L.o <= 0)) continue;
    const ende = x + w * L.u;
    for (let i = 0; i < sp; i++) {
      const x0 = x + i * cw; if (x0 >= ende) break;
      const x1 = Math.min(x0 + cw, ende);
      el.push(<line key={`h${i}-${j}`} x1={x0} y1={y + j * ch} x2={x1} y2={y + j * ch} stroke={voll(i, j - 1) && voll(i, j) ? F.weiss : F.tinte} strokeWidth={b} opacity={L.o == null ? 1 : L.o} />);
    }
  }
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} fill={F.weiss} />
      {el}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={rand} strokeWidth="1.8" rx="1.5" />
    </g>
  );
}

/* Kreissektor; Winkel in Grad, 0 = oben, im Uhrzeigersinn */
function sektor(cx, cy, r, a0, a1) {
  const p = (a) => [cx + r * Math.sin((a * PI) / 180), cy - r * Math.cos((a * PI) / 180)];
  if (a1 - a0 >= 359.99) return `M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${cx} ${cy} L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}
/* Kreis mit n Teilen; voll(i) → Farbe oder null; linien u = Schnittfortschritt */
function Torte({ cx, cy, r, n, farbe, u = 1, o = 1, ring }) {
  if (o <= 0) return null;
  const f = (i) => farbe(((i % n) + n) % n);
  return (
    <g opacity={o}>
      <circle cx={cx} cy={cy} r={r} fill={F.weiss} />
      {Array.from({ length: n }, (_, i) => { const k = f(i); return k ? <path key={i} d={sektor(cx, cy, r, (i * 360) / n, ((i + 1) * 360) / n)} fill={k} /> : null; })}
      {n > 1 && Array.from({ length: n }, (_, i) => {
        const a = ((i * 360) / n) * PI / 180, ui = staffel(u, i, n, 0.5);
        return <Strich key={`l${i}`} x1={cx} y1={cy} x2={cx + r * Math.sin(a)} y2={cy - r * Math.cos(a)} u={ui} f={f(i) && f(i - 1) ? F.weiss : F.tinte} b={1.3} />;
      })}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={ring || F.tinte} strokeWidth={ring ? 2.6 : 1.8} />
    </g>
  );
}

/* Bogen (Pfeil) zwischen zwei Punkten, nach oben (hoch > 0) oder unten (hoch < 0), mit Beschriftung */
function Bogen({ xa, xb, y, hoch, u, f = F.gold, text, tf = F.goldDunkel }) {
  if (u <= 0) return null;
  const n = 24, pts = [];
  for (let i = 0; i <= n * u; i++) { const s = i / n; pts.push(`${mix(xa, xb, s).toFixed(1)},${(y - Math.sin(PI * s) * hoch).toFixed(1)}`); }
  const s = klemm(u), x = mix(xa, xb, s), yy = y - Math.sin(PI * s) * hoch;
  const w = (Math.atan2(-Math.cos(PI * s) * hoch * PI, xb - xa) * 180) / PI;
  return (
    <g>
      <polyline points={pts.join(" ")} fill="none" stroke={f} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {u > 0.2 && <Spitze x={x} y={yy} winkel={w} f={f} g={6} />}
      {text && <Tx x={(xa + xb) / 2} y={hoch > 0 ? y - hoch - 6 : y - hoch + 14} g={12} f={tf} w={800} o={teil(u, 0.4, 0.9)}>{text}</Tx>}
    </g>
  );
}

/* Dezimalzahl-Zeichenkette zerlegen: "4,08" → { int: "4", dez: "08" } */
const zerlege = (s) => { const [i, d = ""] = String(s).split(","); return { int: i, dez: d }; };
const ohneKomma = (s) => { const { int, dez } = zerlege(s); return parseInt(int + dez, 10); };
const ZIFFERWORT = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"];
const dezLesen = (s) => { const { int, dez } = zerlege(s); return `${zahlwort(parseInt(int, 10)) === "ein" ? "eins" : zahlwort(parseInt(int, 10))} Komma ${dez.split("").map((c) => ZIFFERWORT[+c]).join(" ")}`; };

/* ============================================================
   b_anteil – Ganzes wird in n gleiche Teile geschnitten, z Teile färben sich, der Zähler zählt mit
   p: { z: 3, n: 8, form: "kreis" }  oder  { z: 5, n: 12, form: "rechteck", raster: [4, 3] }
   ============================================================ */
const b_anteil = {
  h: 190,
  label: (p) => `${gross(bw(p.z, p.n))} als Anteil eines Ganzen`,
  ablauf: (p) => [
    { k: "ganz", ms: 700, text: p.form === "kreis" ? "Das ist ein Ganzes – eine ganze Pizza." : "Das ist ein Ganzes." },
    { k: "schneiden", ms: 1400, text: `In ${p.n} gleich große Teile schneiden – das sagt der Nenner.` },
    { k: "faerben", ms: 300 + p.z * 420, text: `${p.z} Teile davon nehmen – die zählt der Zähler.` },
    { k: "bruch", ms: 1500, text: `${gross(bw(p.z, p.n))}: ${p.z} von ${p.n} gleich großen Teilen.` },
  ],
  bild: ({ Z, z, p }) => {
    const { n } = p, uf = z("faerben"), ug = Z("ganz"), us = Z("schneiden"), ub = Z("bruch");
    const ui = (i) => (i < p.z ? staffel(uf, i, p.z, 0.25) : 0);
    let zaehler = 0;
    for (let i = 0; i < p.z; i++) if (ui(i) > 0.5) zaehler++;
    let figur;
    if (p.form === "kreis") {
      const cx = 104, cy = 95, r = 68;
      figur = (
        <g opacity={ug}>
          <circle cx={cx} cy={cy} r={r} fill={F.weiss} />
          {Array.from({ length: p.z }, (_, i) => {
            const u = ui(i); if (u <= 0) return null;
            const a0 = (i * 360) / n, a1 = ((i + 1) * 360) / n, m = ((a0 + a1) / 2) * PI / 180, d = Math.sin(PI * u) * 8;
            return <path key={i} d={sektor(cx + d * Math.sin(m), cy - d * Math.cos(m), r, a0, a1)} fill={F.granat} opacity={klemm(u * 2.5)} />;
          })}
          {Array.from({ length: n }, (_, i) => {
            const a = ((i * 360) / n) * PI / 180, links = (i - 1 + n) % n;
            const weiss = ui(i) > 0.9 && ui(links) > 0.9;
            return <Strich key={`l${i}`} x1={cx} y1={cy} x2={cx + r * Math.sin(a)} y2={cy - r * Math.cos(a)} u={staffel(us, i, n, 0.5)} f={weiss ? F.weiss : F.tinte} b={1.4} />;
          })}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={F.tinte} strokeWidth="2" />
        </g>
      );
    } else {
      const [sp, ze] = p.raster;
      figur = (
        <Raster x={30} y={35} w={150} h={(150 * ze) / sp} sp={sp} ze={ze} o={ug}
          zelle={(i, j) => { const k = j * sp + i, u = ui(k); return u > 0 ? { f: F.granat, o: klemm(u * 2.5) } : null; }}
          linieV={(i) => ({ u: staffel(teil(us, 0, 0.6), i - 1, sp - 1, 0.5) })}
          linieH={(j) => ({ u: staffel(teil(us, 0.4, 1), j - 1, ze - 1, 0.5) })} />
      );
    }
    const xb = 246, yb = 86;
    return (
      <>
        {figur}
        <g opacity={teil(us, 0.3, 1)}>
          {uf > 0 && <Tx x={xb} y={yb - 6} g={34} f={F.granat} w={800}>{zaehler}</Tx>}
          <line x1={xb - 22} y1={yb + 1} x2={xb + 22} y2={yb + 1} stroke={F.tinte} strokeWidth="2.4" strokeLinecap="round" />
          <Tx x={xb} y={yb + 38} g={34} f={F.tinte} w={800}>{n}</Tx>
          <Pille x={xb + 32} y={yb + 28} a="start" text="Nenner" f={F.flaeche} tf={F.grau} />
        </g>
        <Pille x={xb + 32} y={yb - 14} a="start" text="Zähler" f={F.granatHell} tf={F.granat} o={teil(uf, 0, 0.3)} />
        <g opacity={ub} transform={`translate(0 ${(1 - ub) * 8})`}>
          <rect x={xb - 62} y={150} width={124} height={28} rx="14" fill={F.granatTief} />
          <Tx x={xb} y={169} g={13} f={F.goldHell} w={800}>{bw(p.z, n)}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   b_vonGroesse – Bruchteil einer Größe: Streifen = Ganzes, durch Nenner teilen, mit Zähler malnehmen
   p: { z: 5, n: 6, ganz: 42, einheit: "min", wort: "Minuten" }
   ============================================================ */
const b_vonGroesse = {
  h: 190,
  label: (p) => `${bw(p.z, p.n)} von ${p.ganz} ${p.wort}`,
  ablauf: (p) => {
    const t = p.ganz / p.n, e = t * p.z;
    return [
      { k: "ganz", ms: 800, text: `Der ganze Streifen sind ${de(p.ganz)} ${p.wort}.` },
      { k: "teilen", ms: 1500, text: `Durch den Nenner teilen: ${de(p.ganz)} : ${p.n} = ${de(t)}. Ein Teil sind ${de(t)} ${p.wort}.` },
      { k: "nehmen", ms: 400 + p.z * 300, text: `Mit dem Zähler malnehmen: ${p.z} Teile sind ${p.z} · ${de(t)} = ${de(e)} ${p.wort}.` },
      { k: "ergebnis", ms: 1400, text: `${gross(bw(p.z, p.n))} von ${de(p.ganz)} ${p.wort} sind ${de(e)} ${p.wort}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const t = p.ganz / p.n, e = t * p.z, x0 = 30, w = 300, y0 = 50, hh = 36, cw = w / p.n;
    const ug = Z("ganz"), ut = Z("teilen"), un = z("nehmen"), ue = Z("ergebnis");
    const ui = (i) => staffel(un, i, p.z, 0.3);
    const E = p.einheit;
    return (
      <>
        <g opacity={ug}>
          <path d={`M${x0} 40 v-6 h${w} v6`} fill="none" stroke={F.grau} strokeWidth="1.5" strokeLinecap="round" />
          <rect x={B / 2 - 34} y={20} width={68} height={20} fill={F.weiss} />
          <Tx x={B / 2} y={35} g={13} f={F.tinte} w={800}>{`${de(p.ganz)} ${E}`}</Tx>
        </g>
        <Raster x={x0} y={y0} w={w} h={hh} sp={p.n} ze={1} o={ug}
          zelle={(i) => (i < p.z && ui(i) > 0 ? { f: F.granat, o: klemm(ui(i) * 2) } : null)}
          linieV={(i) => ({ u: staffel(ut, i - 1, p.n - 1, 0.5) })} />
        {Array.from({ length: p.n }, (_, i) => (
          <Tx key={i} x={x0 + (i + 0.5) * cw} y={y0 + hh / 2 + 4} g={11} f={i < p.z && ui(i) > 0.5 ? F.weiss : F.grau} w={800} o={teil(ut, 0.5, 1)}>{`${de(t)} ${E}`}</Tx>
        ))}
        <g opacity={teil(un, 0, 0.4)}>
          <path d={`M${x0 + 2} 94 v6 h${p.z * cw - 4} v-6`} fill="none" stroke={F.granat} strokeWidth="2" strokeLinecap="round" />
        </g>
        <Pille x={x0 + 80} y={122} text={`${de(p.ganz)} ${E} : ${p.n} = ${de(t)} ${E}`} o={teil(ut, 0.3, 1)} />
        <Pille x={x0 + w - 70} y={122} text={`${p.z} · ${de(t)} ${E} = ${de(e)} ${E}`} f={F.granatHell} tf={F.granat} o={teil(un, 0.5, 1)} />
        <g opacity={ue} transform={`translate(0 ${(1 - ue) * 8})`}>
          <rect x={B / 2 - 112} y={146} width={224} height={40} rx="14" fill={F.flaeche} />
          <Reihe x={B / 2} y={166} g={16} teile={[{ b: [p.z, p.n] }, "von", `${de(p.ganz)} ${E}`, "=", { t: `${de(e)} ${E}`, f: F.granat }]} />
        </g>
      </>
    );
  },
};

/* ============================================================
   b_strahl – Einheit in n Teile teilen, Punkt springt z Schritte; gleichwertige Brüche, Brüche über 1
   p: { n: 6, bis: 2, ziele: [{ z: 5, text }, { z: 3, gleich: [1, 2], text }, { z: 8, gemischt: true, text }] }
   ============================================================ */
const b_strahl = {
  h: 172,
  label: (p) => `Brüche am Zahlenstrahl in ${nennerWort(p.n)}n`,
  ablauf: (p) => [
    { k: "strahl", ms: 700, text: `Der Zahlenstrahl von 0 bis ${p.bis}.` },
    { k: "teilen", ms: 1300, text: `Jede Einheit in ${p.n} gleiche Teile teilen – das sind ${nennerWort(p.n)}.` },
    ...p.ziele.map((zl, i) => ({ k: `z${i}`, ms: 500 + zl.z * 230, text: zl.text || `${gross(bw(zl.z, p.n))}: ${zl.z} Schritte von der 0.` })),
    { k: "ende", ms: 700 },
  ],
  bild: ({ Z, z, p }) => {
    const x = (v) => 30 + (v / p.bis) * 300, ya = 130, n = p.n;
    const us = Z("strahl"), ut = Z("teilen");
    const m = p.ziele.length;
    return (
      <>
        <g opacity={us}>
          <Strich x1={18} y1={ya} x2={342} y2={ya} u={us} b={1.6} />
          {us >= 1 && <Spitze x={346} y={ya} g={7} />}
          {Array.from({ length: p.bis + 1 }, (_, k) => (
            <g key={k}>
              <line x1={x(k)} y1={ya - 7} x2={x(k)} y2={ya + 7} stroke={F.tinte} strokeWidth="2" />
              <Tx x={x(k)} y={ya + 25} g={14} f={F.tinte} w={800}>{k}</Tx>
            </g>
          ))}
        </g>
        {Array.from({ length: p.bis * n + 1 }, (_, k) => k % n === 0 ? null : (
          <line key={k} x1={x(k / n)} y1={ya - 4.5} x2={x(k / n)} y2={ya + 4.5} stroke={F.tinte} strokeWidth="1.2" opacity={staffel(ut, k, p.bis * n + 1, 0.6)} />
        ))}
        {p.ziele.map((zl, i) => {
          const u = z(`z${i}`); if (u <= 0) return null;
          const hops = teil(u, 0, 0.8) * zl.z, fertig = teil(u, 0.8, 1);
          const naechst = i + 1 < m ? z(`z${i + 1}`) : z("ende");
          const bo = 1 - teil(naechst, 0, 0.4);
          const s = Math.min(hops, zl.z), xp = x(s / n);
          const zaehler = Math.max(1, Math.min(zl.z, Math.floor(hops + 0.001)));
          const zus = zl.gleich ? ["=", { b: zl.gleich, f: F.blau }] : zl.gemischt ? ["=", { gm: [Math.floor(zl.z / n), zl.z % n, n], f: F.blau }] : [];
          const teile = [{ b: [zaehler, n], f: F.granat }, ...zus.map((t) => (typeof t === "object" ? { ...t, o: fertig } : { t, o: fertig }))];
          const L = lage(teile, 16), xl = clampX(xp - L.xs[0], L.w), yl = zl.y || 82;
          return (
            <g key={i}>
              {bo > 0 && Array.from({ length: Math.ceil(hops) }, (_, k) => (
                <g key={k} opacity={bo}><Sprung xa={x(k / n)} xb={x((k + 1) / n)} y={ya - 2} hoch={11} u={klemm(hops - k)} b={2} /></g>
              ))}
              <line x1={xp} y1={yl + 23} x2={xp} y2={ya - 8} stroke={F.hell} strokeWidth="1.2" strokeDasharray="3 3" opacity={klemm(hops)} />
              <circle cx={xp} cy={ya} r={5.5} fill={F.granat} stroke={F.weiss} strokeWidth="1.5" />
              <Reihe x={fertig > 0 ? xl : xp} y={yl} g={16} o={teil(hops, 0.5, 1)} teile={fertig > 0 ? teile : [teile[0]]} />
            </g>
          );
        })}
      </>
    );
  },
};
/* Reihe so verschieben, dass sie ganz in der viewBox bleibt (Mitte x, Breite w) */
const clampX = (x, w) => Math.max(12 + w / 2, Math.min(B - 12 - w / 2, x));

/* ============================================================
   b_verfeinern – Erweitern (feiner schneiden) bzw. Kürzen (Teile bündeln): der gefärbte Anteil bleibt
   p: { z: 2, n: 3, k: 4 } (erweitern)  oder  { z: 3, n: 4, k: 6, kuerzen: true } (18/24 → 3/4)
   ============================================================ */
const b_verfeinern = {
  h: 190,
  label: (p) => (p.kuerzen ? `${gross(bw(p.z * p.k, p.n * p.k))} kürzen` : `${gross(bw(p.z, p.n))} erweitern`),
  ablauf: (p) => {
    const { z: a, n, k } = p, A = a * k, N = n * k;
    return p.kuerzen ? [
      { k: "start", ms: 1000, text: `${gross(bw(A, N))}: ${A} von ${N} Teilen sind gefärbt.` },
      { k: "aendern", ms: 1500, text: `Je ${k} Teile übereinander zu einem Streifen bündeln.` },
      { k: "zaehlen", ms: 1400, text: `Jetzt sind es ${a} von ${n} Streifen: Zähler und Nenner durch ${k}.` },
      { k: "gleich", ms: 1200, text: `Gleicher Anteil: ${bw(A, N)} = ${bw(a, n)}.` },
    ] : [
      { k: "start", ms: 1000, text: `${gross(bw(a, n))}: ${a} von ${n} Streifen sind gefärbt.` },
      { k: "aendern", ms: 1500, text: `Quer in ${k} Reihen schneiden – die gefärbte Fläche bleibt gleich.` },
      { k: "zaehlen", ms: 1400, text: `Jetzt sind es ${A} von ${N} Teilen: Zähler und Nenner mal ${k}.` },
      { k: "gleich", ms: 1200, text: `Gleicher Anteil: ${bw(a, n)} = ${bw(A, N)}.` },
    ];
  },
  bild: ({ Z, p }) => {
    const { z: a, n, k } = p, A = a * k, N = n * k;
    const us = Z("start"), ua = Z("aendern"), uz = Z("zaehlen"), ug = Z("gleich");
    const links = p.kuerzen ? [A, N] : [a, n], rechts = p.kuerzen ? [a, n] : [A, N];
    const op = p.kuerzen ? `: ${k}` : `· ${k}`;
    const xl = 236, xr = 314, yb = 104, g = 24;
    const wl = bB(links[0], links[1], g), wr = bB(rechts[0], rechts[1], g);
    return (
      <>
        <Raster x={24} y={34} w={150} h={120} sp={n} ze={k} o={us}
          zelle={(i) => (i < a ? { f: F.granat, o: 1 } : null)}
          linieH={(j) => (p.kuerzen ? { u: 1, o: 1 - ua } : { u: staffel(ua, j - 1, k - 1, 0.5) })} />
        <rect x={22} y={32} width={(150 * a) / n + 4} height={124} rx="3" fill="none" stroke={F.gold} strokeWidth="3" opacity={ug} />
        <SvgBruch x={xl} y={yb - 1} z={links[0]} n={links[1]} g={g} o={us} />
        <Tx x={(xl + wl / 2 + xr - wr / 2) / 2} y={yb + 9} g={24} f={F.tinte} o={uz}>=</Tx>
        <SvgBruch x={xr} y={yb - 1} z={rechts[0]} n={rechts[1]} g={g} f={F.granat} o={uz} />
        <Bogen xa={xl + 4} xb={xr - 4} y={70} hoch={16} u={uz} text={op} />
        <Bogen xa={xl + 4} xb={xr - 4} y={138} hoch={-16} u={uz} text={op} />
        <Pille x={99} y={178} text="gleiche Fläche" o={ug} />
      </>
    );
  },
};

/* ============================================================
   b_vergleich – zwei Streifen untereinander; auf gemeinsamen Nenner verfeinern und zählen
   p: { a: [2, 3], b: [3, 5] }  oder  { a: [1, 3], b: [1, 5], fein: false }
   ============================================================ */
const b_vergleich = {
  h: 188,
  label: (p) => `${gross(bw(...p.a))} und ${bw(...p.b)} vergleichen`,
  ablauf: (p) => {
    const N = kgV(p.a[1], p.b[1]), za = (p.a[0] * N) / p.a[1], zb = (p.b[0] * N) / p.b[1];
    const gr = p.a[0] * p.b[1] > p.b[0] * p.a[1];
    const [G, K] = gr ? [p.a, p.b] : [p.b, p.a];
    if (p.fein === false) return [
      { k: "streifen", ms: 1100, text: `${gross(bw(...p.a))} und ${bw(...p.b)} – welcher Anteil ist größer?` },
      { k: "vergleich", ms: 1600, text: `Gleich viele Teile – aber ${nennerWort(G[1])} sind größere Stücke als ${nennerWort(K[1])}.` },
      { k: "ergebnis", ms: 1500, text: `${gross(bw(...G))} ist größer als ${bw(...K)} – obwohl ${G[1]} kleiner ist als ${K[1]}.` },
    ];
    return [
      { k: "streifen", ms: 1100, text: `${gross(bw(...p.a))} und ${bw(...p.b)} – welcher Anteil ist größer?` },
      { k: "fein", ms: 1700, text: `Beide feiner schneiden, bis die Stücke gleich groß sind: ${nennerWort(N)}.` },
      { k: "zaehlen", ms: 1300, text: `Oben ${za} Stücke, unten ${zb} Stücke – gleiche Sorte, also einfach zählen.` },
      { k: "vergleich", ms: 1100 },
      { k: "ergebnis", ms: 1400, text: `Also ist ${bw(...G)} größer als ${bw(...K)}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const fein = p.fein !== false;
    const N = fein ? kgV(p.a[1], p.b[1]) : 0;
    const x0 = 24, w = 236, hh = 30, ys = [36, 94];
    const ust = Z("streifen"), uf = fein ? Z("fein") : 0, uz = fein ? Z("zaehlen") : 0, uv = Z("vergleich"), ue = Z("ergebnis");
    const gr = p.a[0] * p.b[1] > p.b[0] * p.a[1];
    const streifen = (bruch, y, farbe, i) => {
      const [zz, nn] = bruch, sp = fein ? N : nn, f = fein ? N / nn : 1;
      return (
        <Raster key={i} x={x0} y={y} w={w} h={hh} sp={sp} ze={1} o={staffel(ust, i, 2, 0.5)}
          zelle={(c) => (c < zz * f ? { f: farbe, o: 1 } : null)}
          linieV={(c) => (c % f === 0 ? { u: 1 } : { u: staffel(uf, (c % f) - 1, f - 1, 0.4) })} />
      );
    };
    const ende = (b) => x0 + (w * b[0]) / b[1];
    const xg = Math.max(ende(p.a), ende(p.b)), xk = Math.min(ende(p.a), ende(p.b));
    const yGross = gr ? ys[0] : ys[1];
    const label = (b, y, i, farbe) => {
      const zN = fein ? (b[0] * N) / b[1] : 0;
      const zEr = Math.round(uz * zN);
      return (
        <g key={i} opacity={staffel(ust, i, 2, 0.5)}>
          <SvgBruch x={fein ? 288 : 300} y={y + hh / 2 - 1} z={b[0]} n={b[1]} g={18} f={farbe} />
          {fein && <Tx x={308} y={y + hh / 2 + 7} g={18} f={F.tinte} o={uf}>=</Tx>}
          {fein && <SvgBruch x={332} y={y + hh / 2 - 1} z={uz > 0 ? zEr : "?"} n={N} g={18} f={farbe} o={uf} />}
        </g>
      );
    };
    const sym = gr ? ">" : "<";
    return (
      <>
        {streifen(p.a, ys[0], F.granat, 0)}
        {streifen(p.b, ys[1], F.blau, 1)}
        {label(p.a, ys[0], 0, F.granat)}
        {label(p.b, ys[1], 1, F.blau)}
        <g opacity={uv}>
          <line x1={xk} y1={ys[0] - 6} x2={xk} y2={ys[1] + hh + 6} stroke={F.gold} strokeWidth="2" strokeDasharray="4 3" />
          <rect x={xk} y={yGross - 3} width={(xg - xk) * uv} height={hh + 6} rx="3" fill="none" stroke={F.gold} strokeWidth="3" />
        </g>
        <g opacity={ue} transform={`translate(0 ${(1 - ue) * 8})`}>
          <rect x={B / 2 - 70} y={140} width={140} height={44} rx="14" fill={F.flaeche} />
          <Reihe x={B / 2} y={162} g={18} teile={[{ b: p.a, f: F.granat }, { t: sym, f: F.gold, g: 22 }, { b: p.b, f: F.blau }]} />
        </g>
      </>
    );
  },
};

/* ============================================================
   b_gemischt – unechter Bruch: Stücke füllen ganze Pizzen, Rest bleibt; z : n = g Rest r
   p: { z: 23, n: 6 }
   ============================================================ */
const b_gemischt = {
  h: 204,
  label: (p) => `${gross(bw(p.z, p.n))} als gemischte Zahl`,
  ablauf: (p) => {
    const g = Math.floor(p.z / p.n), r = p.z % p.n;
    return [
      { k: "fuellen", ms: 600 + p.z * 110, text: `${gross(bw(p.z, p.n))}: Stück für Stück in Pizzen legen – ${p.n} Stücke machen eine ganze.` },
      { k: "ganze", ms: 1500, text: `${g} ganze Pizzen sind voll, ${r} Stücke bleiben übrig: ${p.z} : ${p.n} = ${g} Rest ${r}.` },
      { k: "ergebnis", ms: 1400, text: `${gross(bw(p.z, p.n))} = ${gw(g, r, p.n)}.` },
      { k: "zurueck", ms: 1400, text: `Rückweg: ${g} · ${p.n} + ${r} = ${p.z} – Ganze mal Nenner plus Zähler.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const { n } = p, g = Math.floor(p.z / n), r = p.z % n, m = Math.ceil(p.z / n);
    const sp = 82, x0 = B / 2 - ((m - 1) * sp) / 2, cy = 50, rad = 32;
    const uf = z("fuellen"), ug = Z("ganze"), ue = Z("ergebnis"), ur = Z("zurueck");
    const ui = (k) => staffel(uf, k, p.z, 0.3);
    let gelegt = 0;
    for (let k = 0; k < p.z; k++) if (ui(k) > 0.5) gelegt++;
    return (
      <>
        {Array.from({ length: m }, (_, j) => {
          const cx = x0 + j * sp, voll = j < g;
          return (
            <g key={j}>
              <Torte cx={cx} cy={cy} r={rad} n={n} farbe={(i) => { const k = j * n + i; return k < p.z && ui(k) > 0.5 ? (voll ? F.granat : F.gold) : null; }} ring={voll && ug > 0.3 ? F.gold : null} />
              {voll ? <Tx x={cx} y={112} g={18} f={F.granat} w={800} o={ug}>1</Tx> : <SvgBruch x={cx} y={106} z={r} n={n} g={15} f={F.goldDunkel} o={ug} />}
            </g>
          );
        })}
        <Pille x={B / 2} y={150} text={`${gelegt} ${nennerWort(n)}`} f={F.flaeche} tf={F.grau} o={uf > 0 ? 1 - teil(ug, 0, 0.4) : 0} />
        <Pille x={B / 2 - 82} y={150} text={`${p.z} : ${n} = ${g} Rest ${r}`} o={ug} />
        <Pille x={B / 2 + 82} y={150} text={`${g} · ${n} + ${r} = ${p.z}`} f={F.blauHell} tf={F.blau} o={ur} />
        <g opacity={ue} transform={`translate(0 ${(1 - ue) * 6})`}>
          <Reihe x={B / 2} y={182} g={17} teile={[{ b: [p.z, n] }, "=", { gm: [g, r, n], f: F.granat }]} />
        </g>
      </>
    );
  },
};

/* ============================================================
   b_prozent – Raster mit n Feldern, z gefärbt; jedes Feld wird zerteilt → 100 Felder → Prozent
   p: { z: 7, n: 25, raster: [5, 5] }  (raster = grobe Spalten/Zeilen; 10 muss durch beide teilbar sein)
   ============================================================ */
const b_prozent = {
  h: 188,
  label: (p) => `${gross(bw(p.z, p.n))} in Prozent`,
  ablauf: (p) => {
    const k = 100 / p.n, P = p.z * k;
    return [
      { k: "raster", ms: 1300, text: `${p.n} gleiche Felder – ${p.z} davon sind gefärbt: ${bw(p.z, p.n)}.` },
      { k: "teilen", ms: 1500, text: `Jedes Feld in ${k} kleine Felder teilen: Jetzt sind es 100 Felder.` },
      { k: "zaehlen", ms: 1300, text: `Gefärbt sind ${p.z} · ${k} = ${P} von 100 kleinen Feldern.` },
      { k: "prozent", ms: 1400, text: `${P} von 100 heißt ${P} Prozent.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const [cs, rs] = p.raster, fx = 10 / cs, fy = 10 / rs, k = 100 / p.n, P = p.z * k;
    const ur = z("raster"), ut = Z("teilen"), uz = Z("zaehlen"), up = Z("prozent");
    const gi = (i, j) => Math.floor(j / fy) * cs + Math.floor(i / fx);
    const x0 = 22, y0 = 22, s = 144;
    const xc = 270, yr = 72, xa = xc - 40, xb = xc + 40;
    return (
      <>
        <Raster x={x0} y={y0} w={s} h={s} sp={10} ze={10}
          zelle={(i, j) => { const g = gi(i, j); return g < p.z ? { f: F.granat, o: staffel(ur, g, p.z, 0.4) } : null; }}
          linieV={(i) => (i % fx === 0 ? { u: klemm(ur * 3) } : { u: ut, o: 0.9 })}
          linieH={(j) => (j % fy === 0 ? { u: klemm(ur * 3) } : { u: ut, o: 0.9 })} b={1.1} />
        <SvgBruch x={xa} y={yr - 1} z={p.z} n={p.n} g={19} o={klemm(ur * 2)} />
        <Tx x={xc} y={yr + 7} g={19} o={uz}>=</Tx>
        <SvgBruch x={xb} y={yr - 1} z={Math.round(uz * P)} n={100} g={19} f={F.granat} o={uz} />
        <Bogen xa={xa + 2} xb={xb - 2} y={44} hoch={13} u={uz} text={`· ${k}`} />
        <Bogen xa={xa + 2} xb={xb - 2} y={102} hoch={-13} u={uz} text={`· ${k}`} />
        <g opacity={up} transform={`translate(0 ${(1 - up) * 6})`}>
          <Tx x={xc - 44} y={153} g={19}>=</Tx>
          <rect x={xc - 28} y={134} width={84} height={30} rx="12" fill={F.granatTief} />
          <Tx x={xc + 14} y={155} g={19} f={F.goldHell} w={800}>{`${P} %`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   b_stellen – Stellenwerttafel mit Komma; Ziffern fallen hinein, dann zerfallen sie in ihre Werte
   p: { zahl: "2,375" }
   ============================================================ */
const KOPF_INT = ["E", "Z", "H"], KOPF_DEZ = ["z", "h", "t"];
const b_stellen = {
  h: 204,
  label: (p) => `${p.zahl} in der Stellenwerttafel`,
  ablauf: (p) => {
    const { int, dez } = zerlege(p.zahl);
    return [
      { k: "tafel", ms: 1000, text: "Hinter dem Komma geht die Tafel weiter: Zehntel, Hundertstel, Tausendstel." },
      { k: "ziffern", ms: 400 + (int.length + dez.length) * 280, text: `Die Ziffern von ${p.zahl} kommen in ihre Spalten.` },
      { k: "werte", ms: 600 + dez.length * 450, text: "Jede Ziffer zählt Teile ihrer Stelle: Zehntel, Hundertstel, Tausendstel." },
      { k: "lesen", ms: 1500, text: `Man liest: ${dezLesen(p.zahl)}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const { int, dez } = zerlege(p.zahl);
    const ni = Math.max(2, int.length), nd = 3, cw = 46, kw = 16;
    const W = (ni + nd) * cw + kw, x0 = B / 2 - W / 2;
    const xs = (c) => x0 + c * cw + (c >= ni ? kw : 0) + cw / 2;   // c = Spalte von links
    const ut = Z("tafel"), uw = z("werte"), ul = Z("lesen");
    const ziff = [...int.split("").map((d, i) => ({ d, c: ni - int.length + i, e: int.length - 1 - i })), ...dez.split("").map((d, i) => ({ d, c: ni + i, e: -(i + 1) }))];
    /* Werte-Reihe */
    const werte = ziff.filter((q) => q.d !== "0" || (q.e === 0 && dez.replace(/0/g, "") === "")).map((q) => (q.e >= 0 ? { t: String(+q.d * 10 ** q.e), q } : { b: [q.d, 10 ** -q.e], q }));
    const teile = []; werte.forEach((w, i) => { if (i) teile.push("+"); teile.push(w); });
    const L = lage(teile, 15);
    return (
      <>
        {Array.from({ length: ni + nd }, (_, c) => {
          const d = c >= ni, x = xs(c);
          return (
            <g key={c} opacity={staffel(ut, c, ni + nd, 0.6)}>
              <rect x={x - cw / 2 + 1.5} y={14} width={cw - 3} height={22} rx="6" fill={d ? F.blauHell : F.flaeche} />
              <Tx x={x} y={29.5} g={12} f={d ? F.blau : F.grau} w={800}>{d ? KOPF_DEZ[c - ni] : KOPF_INT[ni - 1 - c]}</Tx>
              <rect x={x - cw / 2 + 1.5} y={40} width={cw - 3} height={52} rx="8" fill={F.weiss} stroke={F.linie} strokeWidth="1.3" />
            </g>
          );
        })}
        <Tx x={x0 + ni * cw + kw / 2} y={80} g={34} f={F.gold} w={800} o={ut}>,</Tx>
        {ziff.map((q, i) => {
          const u = staffel(z("ziffern"), i, ziff.length, 0.5), y = mix(56, 76, raus(u));
          return u > 0 ? <Tx key={i} x={xs(q.c)} y={y} g={28} f={q.e < 0 ? F.blau : F.tinte} w={800} o={klemm(u * 2)}>{q.d}</Tx> : null;
        })}
        {teile.map((t, i) => {
          if (typeof t === "string") {
            const o = teil(uw, 0.5, 1);
            return <Tok key={i} t="+" x={B / 2 + L.xs[i]} y={140} g={15} f={F.grau} o={o} />;
          }
          const k = werte.indexOf(t), u = staffel(uw, k, werte.length, 0.4), uu = raus(u);
          const xa = xs(t.q.c), xe = B / 2 + L.xs[i];
          return u > 0 ? <Tok key={i} t={t.b ? { b: t.b } : t.t} x={mix(xa, xe, uu)} y={mix(98, 140, uu)} g={15} f={t.q.e < 0 ? F.blau : F.tinte} o={klemm(u * 2)} /> : null;
        })}
        <g opacity={ul} transform={`translate(0 ${(1 - ul) * 8})`}>
          <rect x={30} y={170} width={B - 60} height={28} rx="14" fill={F.granatTief} />
          <Tx x={B / 2} y={189} g={13} f={F.goldHell} w={800}>{dezLesen(p.zahl)}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   b_groessen – Stellentafel für Längen (m | dm | cm), Komma springt beim Umrechnen
   p: { wert: "4,08", spalten: ["m", "dm", "cm"], grund: "m", ziel: "cm" }
   ============================================================ */
const b_groessen = {
  h: 190,
  label: (p) => `${p.wert} ${p.grund} in ${p.ziel}`,
  ablauf: (p) => {
    const { dez } = zerlege(p.wert), s = p.spalten.length - 1, ganz = String(ohneKomma(p.wert));
    const teile = [`${zerlege(p.wert).int} ${p.spalten[0]}`, ...dez.split("").map((d, i) => (d !== "0" ? `${d} ${p.spalten[i + 1]}` : null)).filter(Boolean)];
    return [
      { k: "tafel", ms: 900, text: `Eine Stellentafel für Längen: ${p.spalten.join(", ")}.` },
      { k: "ziffern", ms: 1100, text: `${p.wert} ${p.grund}: Das Komma steht hinter den ${p.grund === "m" ? "Metern" : p.grund}.` },
      { k: "lesen", ms: 1500, text: `Also ${teile.join(" und ")}.` },
      { k: "wandern", ms: 500 + s * 550, text: `In ${p.ziel}: Das Komma springt ${s} Stellen nach rechts.` },
      { k: "fertig", ms: 1300, text: `${p.wert} ${p.grund} = ${ganz} ${p.ziel}` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const { int, dez } = zerlege(p.wert), sp = p.spalten, n = sp.length, s = n - 1;
    const cw = 66, x0 = B / 2 - (n * cw) / 2, xs = (c) => x0 + c * cw + cw / 2;
    const ut = Z("tafel"), uz = Z("ziffern"), ul = Z("lesen"), uw = z("wandern"), uf = Z("fertig");
    const ziff = [int, ...dez.split("")];
    const pos = teil(uw, 0, 1) * s;  // Komma-Position in Spalten hinter Spalte 0
    const k = Math.min(s - 1, Math.floor(pos)), fr = pos - k;
    const kx = mix(x0 + (k + 1) * cw, x0 + (k + 2) * cw, sanft(klemm(fr)));
    const ky = 96 - Math.sin(PI * klemm(fr)) * (uw > 0 && uw < 1 ? 12 : 0);
    const ganz = String(ohneKomma(p.wert));
    return (
      <>
        {sp.map((e, c) => (
          <g key={c} opacity={staffel(ut, c, n, 0.5)}>
            <rect x={xs(c) - cw / 2 + 2} y={14} width={cw - 4} height={24} rx="6" fill={c === 0 ? F.granatHell : F.flaeche} />
            <Tx x={xs(c)} y={30.5} g={12.5} f={c === 0 ? F.granat : F.grau} w={800}>{e}</Tx>
            <rect x={xs(c) - cw / 2 + 2} y={42} width={cw - 4} height={66} rx="8" fill={F.weiss} stroke={F.linie} strokeWidth="1.3" />
          </g>
        ))}
        {ziff.map((d, c) => <Tx key={c} x={xs(c)} y={mix(60, 96, raus(uz))} g={32} f={F.tinte} w={800} o={uz}>{d}</Tx>)}
        {Array.from({ length: Math.ceil(pos + 0.001) }, (_, j) => (
          <g key={j} opacity={1 - uf}><Bogen xa={x0 + (j + 1) * cw} xb={x0 + (j + 2) * cw} y={112} hoch={-14} u={klemm(pos - j)} /></g>
        ))}
        <Tx x={kx} y={ky} g={36} f={F.gold} w={800} o={uz * (1 - teil(uf, 0, 0.6))}>,</Tx>
        {sp.map((e, c) => (
          <Tx key={c} x={xs(c)} y={132} g={12.5} f={ziff[c] === "0" ? F.hell : F.granat} w={800} o={ul * (1 - teil(uw, 0, 0.3))}>{`${ziff[c]} ${e}`}</Tx>
        ))}
        <Pille x={B / 2} y={143} text={`· ${10 ** s} – Komma ${s} Stellen nach rechts`} o={teil(uw, 0.3, 0.6) * (1 - uf)} />
        <g opacity={uf} transform={`translate(0 ${(1 - uf) * 6})`}>
          <rect x={B / 2 - 100} y={154} width={200} height={30} rx="15" fill={F.granatTief} />
          <Tx x={B / 2} y={174} g={14} f={F.goldHell} w={800}>{`${p.wert} ${p.grund} = ${ganz} ${p.ziel}`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   b_uhr – Dezimalzahlen bei der Zeit: 0,75 h = drei Viertel einer Stunde = 45 min
   p: { wert: "0,75", z: 3, n: 4 }
   ============================================================ */
const b_uhr = {
  h: 190,
  label: (p) => `${p.wert} Stunden in Minuten`,
  ablauf: (p) => {
    const m = (60 / p.n) * p.z;
    return [
      { k: "uhr", ms: 900, text: "Eine ganze Stunde: einmal ganz herum, 60 Minuten." },
      { k: "bruch", ms: 1300, text: `${p.wert} h sind ${bw(p.z, p.n)} einer Stunde.` },
      { k: "fuellen", ms: 1900, text: `${gross(bw(p.z, p.n))} von 60 Minuten: 60 : ${p.n} · ${p.z} = ${m} Minuten.` },
      { k: "fertig", ms: 1400, text: `Also ${p.wert} h = ${m} min – nicht ${zerlege(p.wert).dez} min! Eine Stunde hat 60 Minuten, nicht 100.` },
    ];
  },
  bild: ({ Z, p }) => {
    const cx = 100, cy = 96, r = 64, m = (60 / p.n) * p.z;
    const uu = Z("uhr"), ub = Z("bruch"), uf = Z("fuellen"), ue = Z("fertig");
    const winkel = 360 * (p.z / p.n) * uf;
    const pt = (a, rr) => [cx + rr * Math.sin((a * PI) / 180), cy - rr * Math.cos((a * PI) / 180)];
    const [hx, hy] = pt(winkel, r - 10);
    return (
      <>
        <g opacity={uu}>
          <circle cx={cx} cy={cy} r={r} fill={F.weiss} stroke={F.tinte} strokeWidth="2" />
          {Array.from({ length: 60 }, (_, i) => {
            const [x1, y1] = pt(i * 6, r - (i % 5 === 0 ? 9 : 5)), [x2, y2] = pt(i * 6, r - 1.5);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 5 === 0 ? F.tinte : F.hell} strokeWidth={i % 5 === 0 ? 1.8 : 1} />;
          })}
        </g>
        {uf > 0 && <path d={sektor(cx, cy, r - 2, 0, Math.max(0.5, winkel))} fill={F.goldHell} />}
        {Array.from({ length: p.n }, (_, i) => {
          const [x2, y2] = pt((i * 360) / p.n, r - 1);
          return <Strich key={i} x1={cx} y1={cy} x2={x2} y2={y2} u={staffel(ub, i, p.n, 0.5)} f={F.granat} b={1.6} strokeDasharray="4 3" />;
        })}
        {[15, 30, 45].map((mm) => { const [x, y] = pt(mm * 6, r + 14); return <Tx key={mm} x={x} y={y + 4} g={11} f={F.goldDunkel} w={800} o={ub}>{mm}</Tx>; })}
        <Tx x={cx} y={cy - r - 7} g={11} f={F.goldDunkel} w={800} o={ub}>60</Tx>
        {uf > 0 && <line x1={cx} y1={cy} x2={hx} y2={hy} stroke={F.granat} strokeWidth="3.2" strokeLinecap="round" />}
        <circle cx={cx} cy={cy} r={4} fill={F.granat} opacity={uu} />
        <Tx x={262} y={58} g={20} f={F.tinte} w={800} o={uu}>{`${p.wert} h`}</Tx>
        <Reihe x={262} y={100} g={20} o={ub} teile={["=", { b: [p.z, p.n], f: F.granat }, "h"]} />
        <g opacity={ue}>
          <rect x={262 - 62} y={128} width={124} height={32} rx="12" fill={F.granatTief} />
          <Tx x={262} y={150} g={18} f={F.goldHell} w={800}>{`= ${m} min`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   b_zuDezimal – Bruch auf Hundertstel erweitern → Dezimalzahl → Punkt am Zahlenstrahl
   p: { z: 9, n: 25 }   (n muss 100 teilen)
   ============================================================ */
const b_zuDezimal = {
  h: 196,
  label: (p) => `${gross(bw(p.z, p.n))} als Dezimalzahl`,
  ablauf: (p) => {
    const k = 100 / p.n, H = p.z * k, d = de(H / 100), zt = Math.floor(H / 10), hu = H % 10;
    return [
      { k: "bruch", ms: 900, text: `${gross(bw(p.z, p.n))} – wie schreibt man das als Dezimalzahl?` },
      { k: "erweitern", ms: 1500, text: `Auf Hundertstel erweitern: Zähler und Nenner mal ${k}.` },
      { k: "dezimal", ms: 1200, text: `${H} Hundertstel schreibt man ${d}.` },
      { k: "strahl", ms: 900 + zt * 300, text: `Am Zahlenstrahl: ${zt} Zehntel und ${hu} Hundertstel.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const k = 100 / p.n, H = p.z * k, d = de(H / 100), zt = Math.floor(H / 10), hu = H % 10;
    const ub = Z("bruch"), ue = Z("erweitern"), ud = Z("dezimal"), us = z("strahl");
    const teile = [{ b: [p.z, p.n] }, "=", { b: [H, 100], f: F.granat }, "=", { t: d, f: F.granat, g: 22 }];
    const L = lage(teile, 20), yr = 58, xa = B / 2 + L.xs[0], xb = B / 2 + L.xs[2];
    const ya = 160, X = (v) => 30 + v * 300;
    const nh = zt + (hu ? 1 : 0), hop = teil(us, 0.15, 1) * nh;
    const wert = hop <= zt ? hop / 10 : zt / 10 + ((hop - zt) * hu) / 100;
    return (
      <>
        <Tok t={teile[0]} x={xa} y={yr} g={20} o={ub} />
        <Tok t="=" x={B / 2 + L.xs[1]} y={yr} g={20} o={ue} />
        <SvgBruch x={xb} y={yr - 1} z={Math.round(ue * H)} n={100} g={20} f={F.granat} o={ue} />
        <Bogen xa={xa + 2} xb={xb - 2} y={30} hoch={12} u={ue} text={`· ${k}`} />
        <Bogen xa={xa + 2} xb={xb - 2} y={86} hoch={-12} u={ue} />
        <Tok t="=" x={B / 2 + L.xs[3]} y={yr} g={20} o={ud} />
        <Tok t={teile[4]} x={B / 2 + L.xs[4]} y={yr} g={20} o={ud} />
        <g opacity={teil(us, 0, 0.15)}>
          <Strich x1={20} y1={ya} x2={342} y2={ya} b={1.6} />
          <Spitze x={346} y={ya} g={7} />
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i}>
              <line x1={X(i / 10)} y1={ya - (i % 5 === 0 ? 7 : 5)} x2={X(i / 10)} y2={ya + (i % 5 === 0 ? 7 : 5)} stroke={F.tinte} strokeWidth={i % 5 === 0 ? 2 : 1.3} />
              <Tx x={X(i / 10)} y={ya + 22} g={10} f={F.grau} w={700}>{de(i / 10)}</Tx>
            </g>
          ))}
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={X(zt / 10 + (i + 1) / 100)} y1={ya - 3} x2={X(zt / 10 + (i + 1) / 100)} y2={ya + 3} stroke={F.blau} strokeWidth="1" />)}
        </g>
        {Array.from({ length: Math.ceil(hop) }, (_, j) => {
          const a = j < zt ? j / 10 : zt / 10, b = j < zt ? (j + 1) / 10 : zt / 10 + hu / 100;
          return <Sprung key={j} xa={X(a)} xb={X(b)} y={ya - 2} hoch={j < zt ? 13 : 9} u={klemm(hop - j)} b={2} f={j < zt ? F.gold : F.blau} />;
        })}
        {us > 0.15 && <circle cx={X(wert)} cy={ya} r={5.5} fill={F.granat} stroke={F.weiss} strokeWidth="1.5" />}
        <Pille x={X(H / 100)} y={128} text={d} g={12} f={F.granat} tf={F.weiss} o={teil(us, 0.9, 1)} />
      </>
    );
  },
};

/* ============================================================
   b_teilen – schriftlich teilen Zeile für Zeile; Reste sammeln, Rest wiederholt sich → Periode
   p: { a: 3, b: 8 } (bricht ab)  ·  { a: 7, b: 12 } (gemischt-periodisch)  ·  { a: 2, b: 11 } (periodisch)
   ============================================================ */
function division(a, b, max = 6) {
  const zeilen = [];
  let r = a % b;
  zeilen.push({ d: a, q: Math.floor(a / b), r, neu: false });
  const gesehen = { [r]: 0 };
  let per = null;
  while (r !== 0 && zeilen.length < max) {
    const d = r * 10, q = Math.floor(d / b);
    r = d % b;
    zeilen.push({ d, q, r, neu: true });
    const i = zeilen.length - 1;
    if (r !== 0 && gesehen[r] != null) { per = { von: gesehen[r] + 1, bis: i, j: gesehen[r] }; break; }
    gesehen[r] = i;
  }
  return { zeilen, per };
}
const b_teilen = {
  h: 182,
  label: (p) => `${p.a} : ${p.b} schriftlich`,
  ablauf: (p) => {
    const { zeilen, per } = division(p.a, p.b), n = zeilen.length;
    const ziffern = zeilen.slice(1).map((q) => q.q).join("");
    const ab = [{ k: "start", ms: 900, text: `${gross(bw(p.a, p.b))} heißt ${p.a} : ${p.b}.` }];
    zeilen.forEach((q, i) => {
      let t = `${q.d} : ${p.b} = ${q.q}, Rest ${q.r}.`;
      if (i === 0) t = `${p.a} : ${p.b} = ${q.q}, Rest ${q.r}. Komma setzen, eine Null anhängen.`;
      else if (q.r === 0) t = `${q.d} : ${p.b} = ${q.q}, Rest 0 – die Division geht auf.`;
      else if (per && i === n - 1) t = `${q.d} : ${p.b} = ${q.q}, Rest ${q.r} – diesen Rest hatten wir schon!`;
      ab.push({ k: `r${i}`, ms: i === 0 ? 1500 : 1150, text: t });
    });
    if (per) {
      const pz = zeilen.slice(per.von, per.bis + 1).map((q) => q.q).join("");
      ab.push({ k: "kreis", ms: 1300, text: `Gleicher Rest, gleiche Rechnung: Ab hier wiederholt sich alles.` });
      ab.push({ k: "ende", ms: 1500, text: `Die ${pz} wiederholt sich immer wieder – sie bekommt den Periodenstrich.` });
    } else ab.push({ k: "ende", ms: 1300, text: `${gross(bw(p.a, p.b))} = 0,${ziffern}` });
    return ab;
  },
  bild: ({ Z, z, p }) => {
    const { zeilen, per } = division(p.a, p.b), n = zeilen.length;
    const ust = Z("start"), uk = per ? Z("kreis") : 0, ue = Z("ende");
    /* Kopfzeile: a : b = q0, z1 z2 … */
    const kopf = `${p.a} : ${p.b} = `, g = 22;
    const teile = [{ s: kopf, f: F.tinte, o: ust }, { s: String(zeilen[0].q), f: F.granat, o: Z("r0") }, { s: ",", f: F.gold, o: Z("r0") }];
    zeilen.slice(1).forEach((q, i) => teile.push({ s: String(q.q), f: F.granat, o: Z(`r${i + 1}`), zeile: i + 1 }));
    const ws = teile.map((t) => breite(t.s, g));
    const gesamt = ws.reduce((s, v) => s + v, 0) + (per ? 0 : 0);
    let x = B / 2 - gesamt / 2;
    const xk = teile.map((t, i) => { const v = x; x += ws[i]; return v; });
    const yZ = (i) => 66 + i * 27;
    const perX = per ? [xk[per.von + 2], xk[per.bis + 2] + ws[per.bis + 2]] : null;
    return (
      <>
        {teile.map((t, i) => <Tx key={i} x={xk[i]} y={32} g={g} f={t.f} w={800} a="start" o={t.o}>{t.s}</Tx>)}
        {per && <line x1={perX[0] + 1} y1={10} x2={mix(perX[0] + 1, perX[1] - 1, ue)} y2={10} stroke={F.granat} strokeWidth="2.6" strokeLinecap="round" opacity={ue > 0 ? 1 : 0} />}
        <line x1={40} y1={44} x2={B - 40} y2={44} stroke={F.linie} strokeWidth="1.5" opacity={ust} />
        {zeilen.map((q, i) => {
          const u = Z(`r${i}`); if (u <= 0) return null;
          const y = yZ(i) + (1 - u) * 8;
          const wieder = per && (i === per.j || i === n - 1);
          const ds = String(q.d);
          return (
            <g key={i} opacity={u}>
              <text x={70} y={y} fontSize={15} fontWeight="700" style={{ fontFamily: "Montserrat, sans-serif" }} fill={F.tinte}>
                <tspan fill={q.neu ? F.blau : F.tinte}>{q.neu ? ds.slice(0, -1) : ds}</tspan>{q.neu && <tspan fill={F.gold} fontWeight="800">0</tspan>}
                <tspan>{` : ${p.b} = `}</tspan><tspan fill={F.granat} fontWeight="800">{q.q}</tspan>
              </text>
              <Pille x={226} y={y - 1} a="start" text={`Rest ${q.r}`} g={11.5}
                f={wieder && uk > 0.3 ? F.granat : q.r === 0 ? F.gruenHell : F.blauHell} tf={wieder && uk > 0.3 ? F.weiss : q.r === 0 ? F.gruen : F.blau} />
            </g>
          );
        })}
        {per && uk > 0 && (() => {
          const ya = yZ(n - 1) - 5, yb = yZ(per.j) - 5, xr = 226 + breite(`Rest ${zeilen[per.j].r}`, 11.5) + 22;
          const pts = []; const m = 30;
          for (let i = 0; i <= m * uk; i++) { const s = i / m; pts.push(`${(xr + Math.sin(PI * s) * 30).toFixed(1)},${mix(ya, yb, s).toFixed(1)}`); }
          return (
            <g>
              <polyline points={pts.join(" ")} fill="none" stroke={F.granat} strokeWidth="2" strokeLinecap="round" />
              {uk >= 1 && <Spitze x={xr} y={yb} winkel={200} f={F.granat} g={7} />}
            </g>
          );
        })()}
      </>
    );
  },
};

/* ============================================================
   b_lupe – Zahlenstrahl mit Lupe: Zehntel-Abschnitt auf Hundertstel vergrößert; runden oder vergleichen
   p: { art: "runden", oben: [4, 5], lupe: [4.3, 4.4], wert: "4,378", ergebnis: "4,4" }
      { art: "vergleich", oben: [0, 1], lupe: [0.4, 0.5], werte: ["0,405", "0,45"] }
   ============================================================ */
const zahl = (s) => parseFloat(String(s).replace(",", "."));
const b_lupe = {
  h: 196,
  label: (p) => (p.art === "runden" ? `${p.wert} runden` : `${p.werte.join(" und ")} vergleichen`),
  ablauf: (p) => {
    const [l0, l1] = p.lupe.map((v) => de(v));
    if (p.art === "runden") {
      const v = zahl(p.wert), mitte = (p.lupe[0] + p.lupe[1]) / 2, auf = v >= mitte;
      return [
        { k: "oben", ms: 1000, text: `${p.wert} liegt zwischen ${l0} und ${l1}.` },
        { k: "lupe", ms: 1300, text: `Mit der Lupe: Zwischen ${l0} und ${l1} liegen die Hundertstel.` },
        { k: "punkt", ms: 1300, text: `Hier liegt ${p.wert}.` },
        { k: "mitte", ms: 1300, text: `Die Mitte ist ${de(mitte)}. ${p.wert} liegt ${auf ? "rechts" : "links"} davon.` },
        { k: "runden", ms: 1400, text: `Also ${auf ? "aufrunden" : "abrunden"}: ${p.wert} ≈ ${p.ergebnis}.` },
      ];
    }
    const [a, b] = p.werte, kl = zahl(a) < zahl(b) ? a : b, gr = kl === a ? b : a;
    return [
      { k: "oben", ms: 1000, text: `Beide Zahlen liegen zwischen ${l0} und ${l1}.` },
      { k: "lupe", ms: 1300, text: `Mit der Lupe: Zwischen ${l0} und ${l1} liegen die Hundertstel.` },
      { k: "punkt", ms: 1600, text: `${kl} liegt ganz links, ${gr} weiter rechts.` },
      { k: "runden", ms: 1500, text: `Also ist ${kl} kleiner als ${gr} – die Zahl der Stellen sagt nichts über die Größe.` },
    ];
  },
  bild: ({ Z, p }) => {
    const [o0, o1] = p.oben, [l0, l1] = p.lupe;
    const XO = (v) => 30 + ((v - o0) / (o1 - o0)) * 300, XL = (v) => 30 + ((v - l0) / (l1 - l0)) * 300;
    const yo = 40, yl = 124;
    const uo = Z("oben"), ul = Z("lupe"), up = Z("punkt"), um = Z("mitte"), ur = Z("runden");
    const werte = p.art === "runden" ? [p.wert] : p.werte;
    const farben = [F.granat, F.blau];
    const mitte = (l0 + l1) / 2;
    const v = p.art === "runden" ? zahl(p.wert) : 0, auf = v >= mitte;
    const ziel = auf ? l1 : l0;
    const ox = (s) => <Tx x={XO(s)} y={yo - 12} g={11} f={s === l0 || s === l1 ? F.granat : F.grau} w={800}>{de(s)}</Tx>;
    return (
      <>
        <g opacity={uo}>
          <Strich x1={20} y1={yo} x2={340} y2={yo} b={1.5} />
          {Array.from({ length: 11 }, (_, i) => { const s = o0 + (i * (o1 - o0)) / 10; return <line key={i} x1={XO(s)} y1={yo - (i % 10 === 0 ? 6 : 4)} x2={XO(s)} y2={yo + (i % 10 === 0 ? 6 : 4)} stroke={F.tinte} strokeWidth={i % 10 === 0 ? 2 : 1.2} />; })}
          {ox(o0)}{ox(o1)}
          {Math.abs(l0 - o0) > 0.15 && ox(l0)}
          {Math.abs(o1 - l1) > 0.15 && ox(l1)}
          <rect x={XO(l0)} y={yo - 6} width={XO(l1) - XO(l0)} height={12} rx="3" fill={F.gold} opacity={0.45} />
        </g>
        <g opacity={ul}>
          <path d={`M${XO(l0)} ${yo + 7} L30 ${yl - 8} L330 ${yl - 8} L${XO(l1)} ${yo + 7} Z`} fill={F.goldHell} opacity={0.55} />
          <line x1={XO(l0)} y1={yo + 7} x2={30} y2={yl - 8} stroke={F.gold} strokeWidth="1.2" />
          <line x1={XO(l1)} y1={yo + 7} x2={330} y2={yl - 8} stroke={F.gold} strokeWidth="1.2" />
          <Strich x1={22} y1={yl} x2={338} y2={yl} b={1.6} />
          {Array.from({ length: 11 }, (_, i) => {
            const s = l0 + (i * (l1 - l0)) / 10;
            return <line key={i} x1={XL(s)} y1={yl - (i % 10 === 0 ? 7 : i === 5 ? 6 : 4.5)} x2={XL(s)} y2={yl + (i % 10 === 0 ? 7 : i === 5 ? 6 : 4.5)} stroke={F.tinte} strokeWidth={i % 10 === 0 ? 2 : 1.2} opacity={staffel(ul, i, 11, 0.6)} />;
          })}
          <Tx x={30} y={yl + 22} g={12} f={F.granat} w={800}>{de(l0)}</Tx>
          <Tx x={330} y={yl + 22} g={12} f={F.granat} w={800}>{de(l1)}</Tx>
        </g>
        {p.art === "runden" && (
          <g opacity={um}>
            <line x1={XL(mitte)} y1={yl - 22} x2={XL(mitte)} y2={yl + 8} stroke={F.blau} strokeWidth="1.6" strokeDasharray="3 3" />
            <Tx x={XL(mitte)} y={yl + 22} g={11} f={F.blau} w={800}>{`Mitte ${de(mitte)}`}</Tx>
          </g>
        )}
        {werte.map((w, i) => {
          const u = staffel(up, i, werte.length, 0.4), x = XL(zahl(w));
          return (
            <g key={i} opacity={u}>
              <circle cx={x} cy={yl} r={5.5} fill={farben[i]} stroke={F.weiss} strokeWidth="1.5" />
              <Pille x={x} y={yl - 24 - (werte.length > 1 && i === 1 ? 0 : 0)} text={w} f={farben[i]} tf={F.weiss} g={11.5} />
            </g>
          );
        })}
        {p.art === "runden" && <Pfeil x1={XL(v)} y1={yl + 10} x2={XL(ziel) + (auf ? -2 : 2)} y2={yl + 10} u={ur} f={F.granat} b={2.2} />}
        <g opacity={ur} transform={`translate(0 ${(1 - ur) * 6})`}>
          <rect x={B / 2 - 70} y={160} width={140} height={30} rx="15" fill={F.granatTief} />
          <Tx x={B / 2} y={180} g={14} f={F.goldHell} w={800}>
            {p.art === "runden" ? `${p.wert} ≈ ${p.ergebnis}` : (() => { const [a, b] = p.werte; return zahl(a) < zahl(b) ? `${a} < ${b}` : `${b} < ${a}`; })()}
          </Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   b_addStreifen – Brüche addieren: (ggf. auf Hauptnenner verfeinern) Stücke schieben sich in einen Streifen
   p: { a: [3, 8], b: [2, 8] }  ·  { a: [1, 2], b: [1, 3] }   (Summe ≤ 1)
   ============================================================ */
const b_addStreifen = {
  h: 190,
  label: (p) => `${gross(bw(...p.a))} plus ${bw(...p.b)}`,
  ablauf: (p) => {
    const N = kgV(p.a[1], p.b[1]), za = (p.a[0] * N) / p.a[1], zb = (p.b[0] * N) / p.b[1], S = za + zb, g = ggT(S, N);
    const glN = p.a[1] === p.b[1];
    const erg = g > 1 ? ` = ${bw(S / g, N / g)}` : "";
    const ab = [{ k: "zeigen", ms: 1100, text: glN ? `${gross(bw(...p.a))} und ${bw(...p.b)} – beides sind ${nennerWort(N)}.` : `${gross(bw(...p.a))} plus ${bw(...p.b)} – verschieden große Stücke.` }];
    if (!glN) ab.push({ k: "fein", ms: 1700, text: `Beide in ${nennerWort(N)} schneiden: ${N} ist der Hauptnenner von ${p.a[1]} und ${p.b[1]}.` });
    ab.push({ k: "schieben", ms: 1900, text: `${glN ? "Die Stücke zusammenschieben" : "Jetzt passen die Stücke zusammen"}: ${za} + ${zb} = ${S} ${nennerWort(N)}.` });
    ab.push({ k: "ergebnis", ms: 1500, text: glN ? `${gross(bw(S, N))}${erg}. Der Nenner bleibt – er sagt nur, wie groß die Stücke sind.` : `${gross(bw(...p.a))} plus ${bw(...p.b)} = ${bw(S, N)}${erg}.` });
    return ab;
  },
  bild: ({ Z, z, p }) => {
    const N = kgV(p.a[1], p.b[1]), za = (p.a[0] * N) / p.a[1], zb = (p.b[0] * N) / p.b[1], S = za + zb, g = ggT(S, N);
    const glN = p.a[1] === p.b[1];
    const x0 = 24, w = 236, hh = 28, cw = w / N, ya = 22, yb = 72, yr = 140;
    const uz = Z("zeigen"), uf = glN ? 1 : Z("fein"), us = z("schieben"), ue = Z("ergebnis");
    const quelle = (bruch, y, farbe, i) => {
      const [zz, nn] = bruch, f = N / nn;
      const geist = teil(us, 0, 0.2);
      return (
        <Raster key={i} x={x0} y={y} w={w} h={hh} sp={N} ze={1} o={staffel(uz, i, 2, 0.5)}
          zelle={(c) => (c < zz * f ? { f: geist > 0 ? F.flaeche : farbe, o: 1 } : null)}
          linieV={(c) => (c % f === 0 ? { u: 1 } : { u: glN ? 1 : staffel(uf, (c % f) - 1, f - 1, 0.4) })} />
      );
    };
    const stueck = (k, ziel, y0, farbe, idx, anz) => {
      const u = sanft(staffel(teil(us, 0.1, 1), idx, anz, 0.7));
      if (us <= 0) return null;
      const x = mix(x0 + k * cw, x0 + ziel * cw, u), y = mix(y0, yr, u) - Math.sin(PI * u) * 8;
      return <rect key={`${farbe}${k}`} x={x + 0.8} y={y + 0.8} width={cw - 1.6} height={hh - 1.6} rx="2" fill={farbe} />;
    };
    const lab = (t, y, o) => <Reihe x={312} y={y + hh / 2} g={17} o={o} teile={t} />;
    const ergT = g > 1 ? [{ b: [S, N], f: F.granat }, "=", { b: [S / g, N / g], f: F.granat }] : [{ b: [S, N], f: F.granat }];
    return (
      <>
        {quelle(p.a, ya, F.granat, 0)}
        {quelle(p.b, yb, F.gold, 1)}
        {!glN ? (
          <>
            {lab([{ b: p.a, f: F.granat }], ya, staffel(uz, 0, 2, 0.5) * (1 - uf))}
            {lab([{ b: [za, N], f: F.granat }], ya, uf)}
            {lab(["+", { b: p.b, f: F.goldDunkel }], yb, staffel(uz, 1, 2, 0.5) * (1 - uf))}
            {lab(["+", { b: [zb, N], f: F.goldDunkel }], yb, uf)}
          </>
        ) : (
          <>
            {lab([{ b: p.a, f: F.granat }], ya, staffel(uz, 0, 2, 0.5))}
            {lab(["+", { b: p.b, f: F.goldDunkel }], yb, staffel(uz, 1, 2, 0.5))}
          </>
        )}
        <line x1={x0} y1={118} x2={x0 + w} y2={118} stroke={F.linie} strokeWidth="1.5" opacity={teil(us, 0, 0.2)} />
        <Raster x={x0} y={yr} w={w} h={hh} sp={N} ze={1} o={teil(us, 0, 0.2)} zelle={() => null} />
        {Array.from({ length: za }, (_, k) => stueck(k, k, ya, F.granat, k, S))}
        {Array.from({ length: zb }, (_, k) => stueck(k, za + k, yb, F.gold, za + k, S))}
        {us >= 1 && Array.from({ length: N - 1 }, (_, i) => <line key={i} x1={x0 + (i + 1) * cw} y1={yr} x2={x0 + (i + 1) * cw} y2={yr + hh} stroke={i + 1 < S ? F.weiss : F.tinte} strokeWidth="1.3" />)}
        {us >= 1 && <rect x={x0} y={yr} width={w} height={hh} fill="none" stroke={F.tinte} strokeWidth="1.8" rx="1.5" />}
        <g opacity={ue}>
          <Reihe x={x0 + 2 + breite("=", 17) / 2 + w + 10 + lage(["=", ...ergT], 17).w / 2 - 6} y={yr + hh / 2} g={17} teile={["=", ...ergT]} />
        </g>
      </>
    );
  },
};

/* ============================================================
   b_gemischtAdd – gemischte Zahlen addieren: Ganze zu Ganzen, Bruchstücke zusammen, Übertrag
   p: { a: [1, 3, 4], b: [2, 1, 2] }   (Ganze, Zähler, Nenner)
   ============================================================ */
const b_gemischtAdd = {
  h: 190,
  label: (p) => `${gw(...p.a)} plus ${gw(...p.b)}`,
  ablauf: (p) => {
    const N = kgV(p.a[2], p.b[2]), za = (p.a[1] * N) / p.a[2], zb = (p.b[1] * N) / p.b[2], S = za + zb;
    const G = p.a[0] + p.b[0], ue = Math.floor(S / N), r = S % N;
    const ab = [{ k: "zeigen", ms: 1200, text: `${gross(gw(...p.a))} plus ${gw(...p.b)}.` }];
    if (p.a[2] !== N || p.b[2] !== N) ab.push({ k: "gleich", ms: 1300, text: `Erst gleichnamig machen: Alles in ${nennerWort(N)}.` });
    ab.push({ k: "ganze", ms: 1300, text: `Ganze zu Ganzen: ${p.a[0]} + ${p.b[0]} = ${G}.` });
    ab.push({ k: "brueche", ms: 1900, text: `${nennerWort(N)} zu ${nennerWort(N)}n: ${za} + ${zb} = ${S} ${nennerWort(N)}.` });
    if (ue) ab.push({ k: "uebertrag", ms: 1400, text: `${N} ${nennerWort(N)} füllen ein neues Ganzes – ${r ? `${bw(r, N)} bleibt übrig` : "nichts bleibt übrig"}.` });
    ab.push({ k: "ergebnis", ms: 1300, text: `Ergebnis: ${r ? gw(G + ue, r, N) : `${zahlwort(G + ue)} Ganze`}.` });
    return ab;
  },
  bild: ({ Z, z, p }) => {
    const N = kgV(p.a[2], p.b[2]), za = (p.a[1] * N) / p.a[2], zb = (p.b[1] * N) / p.b[2], S = za + zb;
    const G = p.a[0] + p.b[0], ue = Math.floor(S / N), r = S % N, m = Math.ceil(S / N);
    const R = 19, sp = 46;
    const uz = Z("zeigen"), ugl = Z("gleich"), ug = Z("ganze"), ub = z("brueche"), uu = Z("uebertrag"), ue2 = Z("ergebnis");
    /* oben */
    const nOben = p.a[0] + 1 + p.b[0] + 1, wO = nOben * sp + 30, xo = B / 2 - wO / 2 + sp / 2;
    const xA = (i) => xo + i * sp, xPlus = xA(p.a[0]) + sp / 2 + 15, xB = (i) => xA(p.a[0] + 1) + 30 + i * sp;
    const yo = 40, yu = 140;
    /* unten */
    const nUnten = G + m, xu0 = 32;
    const xU = (i) => xu0 + i * sp;
    const wholeA = Array.from({ length: p.a[0] }, (_, i) => ({ von: xA(i), nach: xU(i) }));
    const wholeB = Array.from({ length: p.b[0] }, (_, i) => ({ von: xB(i), nach: xU(p.a[0] + i) }));
    const ganzO = (w, i) => { const x = mix(w.von, w.nach, ug), y = mix(yo, yu, ug) - Math.sin(PI * ug) * 10; return <Torte key={i} cx={x} cy={y} r={R} n={1} farbe={() => F.blau} o={uz} />; };
    const pieA = xA(p.a[0]), pieB = xB(p.b[0]);
    const stuecke = [];
    for (let k = 0; k < za; k++) stuecke.push({ cx: pieA, slot: k, f: F.granat });
    for (let k = 0; k < zb; k++) stuecke.push({ cx: pieB, slot: k, f: F.gold });
    const lageA = lage([{ gm: p.a }], 13), lageB = lage([{ gm: p.b }], 13);
    const voll = ue > 0 && uu > 0.5;
    const xEnde = xU(nUnten - 1) + R;
    return (
      <>
        {/* Teller oben – verblassen, sobald alles unten liegt */}
        <g opacity={uz * (1 - teil(ub, 0.7, 1))}>
          <circle cx={pieA} cy={yo} r={R} fill={F.weiss} stroke={F.linie} strokeWidth="1.4" />
          <circle cx={pieB} cy={yo} r={R} fill={F.weiss} stroke={F.linie} strokeWidth="1.4" />
          {Array.from({ length: N }, (_, i) => {
            const a = ((i * 360) / N) * PI / 180;
            return [pieA, pieB].map((cx, j) => {
              const nn = j === 0 ? p.a[2] : p.b[2], grob = (i * nn) % N === 0;
              const o = grob ? 1 : (p.a[2] === N && j === 0) || (p.b[2] === N && j === 1) ? 1 : ugl;
              return <line key={`${i}-${j}`} x1={cx} y1={yo} x2={cx + R * Math.sin(a)} y2={yo - R * Math.cos(a)} stroke={F.hell} strokeWidth="1" opacity={o} />;
            });
          })}
          <Tx x={xPlus} y={yo + 7} g={20} f={F.grau}>+</Tx>
        </g>
        <Tok t={{ gm: p.a }} x={(xA(0) + pieA) / 2} y={84} g={13} o={uz * (1 - teil(ug, 0, 0.5))} />
        <Tok t={{ gm: p.b }} x={(xB(0) + pieB) / 2} y={84} g={13} o={uz * (1 - teil(ug, 0, 0.5))} />
        {/* Teller unten */}
        {Array.from({ length: m }, (_, j) => (
          <g key={j} opacity={teil(ub, 0, 0.15)}>
            <circle cx={xU(G + j)} cy={yu} r={R} fill={F.weiss} stroke={F.linie} strokeWidth="1.4" />
          </g>
        ))}
        {wholeA.map(ganzO)}
        {wholeB.map((w, i) => ganzO(w, 100 + i))}
        {stuecke.map((s, idx) => {
          const u = sanft(staffel(ub, idx, S, 0.6));
          const zielPie = Math.floor(idx / N), zielSlot = idx % N;
          const cx = mix(s.cx, xU(G + zielPie), u), cy = mix(yo, yu, u) - Math.sin(PI * u) * 12;
          const a0 = mix((s.slot * 360) / N, (zielSlot * 360) / N, u);
          const farbe = voll && zielPie < ue ? F.blau : s.f;
          return <path key={idx} d={sektor(cx, cy, R, a0, a0 + 360 / N)} fill={farbe} stroke={F.weiss} strokeWidth="1.2" opacity={uz} />;
        })}
        {Array.from({ length: m }, (_, j) => <circle key={j} cx={xU(G + j)} cy={yu} r={R} fill="none" stroke={j < ue && uu > 0 ? F.gold : F.tinte} strokeWidth={j < ue && uu > 0 ? 2.6 : 1.4} opacity={teil(ub, 0, 0.15)} />)}
        {ue > 0 && <Puls x={xU(G)} y={yu} u={uu} r={26} />}
        {/* Beschriftungen unten */}
        <path d={`M${xU(0) - R} ${yu + 28} v5 h${xU(G - 1) - xU(0) + 2 * R} v-5`} fill="none" stroke={F.blau} strokeWidth="1.6" opacity={ug * (1 - uu)} />
        <Tx x={(xU(0) + xU(G - 1)) / 2} y={yu + 48} g={12} f={F.blau} w={800} o={ug * (1 - uu)}>{`${G} Ganze`}</Tx>
        <path d={`M${xU(0) - R} ${yu + 28} v5 h${xU(G + ue - 1) - xU(0) + 2 * R} v-5`} fill="none" stroke={F.blau} strokeWidth="1.6" opacity={uu} />
        <Tx x={(xU(0) + xU(G + ue - 1)) / 2} y={yu + 48} g={12} f={F.blau} w={800} o={uu}>{`${G} + ${ue} = ${G + ue} Ganze`}</Tx>
        <Tok t={{ b: [S, N], f: F.granat }} x={xU(G + m - 1) + (m > 1 ? 0 : 0)} y={yu - 38} g={13} o={teil(ub, 0.9, 1) * (1 - uu)} />
        <g opacity={ue2}>
          <Tx x={xEnde + 18} y={yu + 7} g={20} f={F.tinte}>=</Tx>
          <Tok t={r ? { gm: [G + ue, r, N], f: F.granat } : String(G + ue)} x={xEnde + 34 + tokW(r ? { gm: [G + ue, r, N] } : String(G + ue), 18) / 2} y={yu} g={18} f={F.granat} />
        </g>
      </>
    );
  },
};

/* ============================================================
   b_kommaUnterKomma – schriftlich addieren/subtrahieren: erst falsch rechtsbündig, dann Komma unter Komma
   p: { a: "45,08", b: "7,935", op: "+" }  ·  { a: "20", b: "13,47", op: "−" }
   ============================================================ */
function schriftlich(a, b, op) {
  const A = zerlege(a), Bz = zerlege(b), D = Math.max(A.dez.length, Bz.dez.length);
  const ai = BigInt(A.int + A.dez.padEnd(D, "0")), bi = BigInt(Bz.int + Bz.dez.padEnd(D, "0"));
  const ri = op === "+" ? ai + bi : ai - bi;  // op "−" = minus
  const rs = ri.toString().padStart(D + 1, "0");
  const rInt = rs.slice(0, rs.length - D), rDez = rs.slice(rs.length - D);
  const I = Math.max(A.int.length, Bz.int.length, rInt.length);
  /* Spalten-Ziffern (Index 0 = ganz links), Überträge */
  const sp = I + D;
  const ziff = (s, int) => { const { int: i, dez } = zerlege(s); return { int: i, dez, voll: i.padStart(I, " ") + dez.padEnd(D, "_") }; };
  const za = ziff(a), zb = ziff(b);
  const erg = (rInt.padStart(I, " ") + rDez);
  const uebertrag = Array(sp).fill(0);
  let c = 0;
  for (let k = sp - 1; k >= 0; k--) {
    const da = +(za.voll[k] === " " || za.voll[k] === "_" ? 0 : za.voll[k]), db = +(zb.voll[k] === " " || zb.voll[k] === "_" ? 0 : zb.voll[k]);
    let s = op === "+" ? da + db + c : da - db - c;
    if (op === "+") { c = s >= 10 ? 1 : 0; } else { c = s < 0 ? 1 : 0; }
    if (k > 0) uebertrag[k - 1] = c;
  }
  return { I, D, sp, za, zb, erg, rInt: String(BigInt(rInt)), rDez, uebertrag };
}
const b_kommaUnterKomma = {
  h: 196,
  label: (p) => `${p.a} ${p.op} ${p.b} schriftlich`,
  ablauf: (p) => {
    const s = schriftlich(p.a, p.b, p.op), res = s.rInt + (s.D ? "," + s.rDez : "");
    return [
      { k: "zeigen", ms: 1300, text: "Nicht einfach rechtsbündig untereinanderschreiben – dann stehen die Stellen durcheinander." },
      { k: "ausrichten", ms: 1300, text: "Komma unter Komma: Jetzt stehen Zehntel unter Zehnteln, Hundertstel unter Hundertsteln." },
      { k: "nullen", ms: 1100, text: "Leere Stellen mit Nullen auffüllen – das ändert den Wert nicht." },
      { k: "rechnen", ms: 400 + s.sp * 480, text: `Von rechts nach links Spalte für Spalte rechnen${s.uebertrag.some(Boolean) ? ", Übertrag beachten" : ""}.` },
      { k: "fertig", ms: 1300, text: `${p.a} ${p.op} ${p.b} = ${res}` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const s = schriftlich(p.a, p.b, p.op), { I, D, sp } = s;
    const cw = 24, kw = 12, W = sp * cw + kw, x0 = B / 2 - W / 2 + 10;
    const X = (k) => x0 + k * cw + (k >= I ? kw : 0) + cw / 2;
    const xKomma = x0 + I * cw + kw / 2;
    const uz = Z("zeigen"), ua = Z("ausrichten"), un = Z("nullen"), ur = z("rechnen"), uf = Z("fertig");
    const ya = 62, yb = 98, yl = 110, yu = 126, ye = 152, g = 22;
    /* falsche Verschiebung von b: letzte Zeichen bündig */
    const lenRechts = (q) => q.dez.length ? q.dez.length * cw + kw : 0;
    const versatz = (lenRechts(s.za) - (s.za.dez.length ? 0 : 0)) - lenRechts(s.zb);
    const dx = mix(versatz, 0, ua);
    const zeile = (q, y, verschiebe, farbe) => (
      <g transform={`translate(${verschiebe} 0)`}>
        {q.voll.split("").map((c, k) => {
          if (c === " ") return null;
          if (c === "_") return <Tx key={k} x={X(k)} y={y} g={g} f={F.gold} w={800} o={un}>0</Tx>;
          return <Tx key={k} x={X(k)} y={y} g={g} f={farbe} w={800}>{c}</Tx>;
        })}
        {q.dez.length > 0 ? <Tx x={xKomma} y={y} g={g} f={F.granat} w={800}>,</Tx> : D > 0 && <Tx x={xKomma} y={y} g={g} f={F.gold} w={800} o={un}>,</Tx>}
      </g>
    );
    const KOPF = [...Array(I)].map((_, k) => ["E", "Z", "H", "T"][I - 1 - k]).concat(["z", "h", "t"].slice(0, D));
    return (
      <>
        <g opacity={ua}>
          {KOPF.map((h, k) => <Tx key={k} x={X(k)} y={26} g={11} f={k >= I ? F.blau : F.grau} w={800}>{h}</Tx>)}
          <line x1={xKomma} y1={34} x2={xKomma} y2={ye + 8} stroke={F.granatHell} strokeWidth="10" opacity={0.7} />
        </g>
        <g opacity={uz}>
          {zeile(s.za, ya, 0, F.tinte)}
          {zeile(s.zb, yb, dx, F.tinte)}
          <Tx x={x0 - 16 + dx} y={yb} g={g} f={F.tinte} w={800}>{minus(p.op)}</Tx>
          <line x1={x0 - 28} y1={yl} x2={x0 + W + 4} y2={yl} stroke={F.tinte} strokeWidth="2" />
        </g>
        {ua < 0.5 && uz > 0 && <Pille x={X(sp - 1) + 30} y={yb - 6} a="start" text="?" f={F.granatHell} tf={F.granat} o={uz * (1 - ua * 2)} />}
        {s.erg.split("").map((c, k) => {
          const j = sp - 1 - k, u = staffel(ur, j, sp, 0.35);
          if (c === " " || u <= 0) return null;
          const fuehrendeNull = k < I - 1 && s.erg.slice(0, k + 1).trim().replace(/^0+/, "") === "" ;
          if (fuehrendeNull) return null;
          return <Tx key={k} x={X(k)} y={mix(ye - 10, ye, raus(u))} g={g} f={F.granat} w={800} o={klemm(u * 2)}>{c}</Tx>;
        })}
        {D > 0 && <Tx x={xKomma} y={ye} g={g} f={F.granat} w={800} o={staffel(ur, D - 1, sp, 0.35) > 0.5 ? 1 : 0}>,</Tx>}
        {s.uebertrag.map((c, k) => c ? <Tx key={k} x={X(k) - 7} y={yu} g={11} f={F.goldDunkel} w={800} o={staffel(ur, sp - 1 - k - 1, sp, 0.35) > 0.6 ? 1 : 0}>1</Tx> : null)}
        <g opacity={uf}>
          <rect x={x0 - 34} y={ye - 22} width={W + 46} height={32} rx="10" fill="none" stroke={F.granat} strokeWidth="2" />
        </g>
      </>
    );
  },
};

/* ============================================================
   b_partner – geschickt rechnen: Partner suchen, vertauschen, bündeln
   p: { terme: ["2,35", "4,8", "1,65"], partner: [0, 2], zwischen: "4", ergebnis: "8,8", texte: [5 Untertitel] }
      Terme dürfen Brüche sein: { b: [5, 12] }; ergebnis z. B. { gm: [1, 2, 3] }
   ============================================================ */
const b_partner = {
  h: 196,
  label: () => "Geschickt rechnen mit Partnern",
  ablauf: (p) => ["zeigen", "finden", "tauschen", "buendeln", "rest"].map((k, i) => ({ k, ms: [1100, 1300, 1400, 1400, 1500][i], text: p.texte[i] })),
  bild: ({ Z, p }) => {
    const g = 17, pad = 12, luecke = 30;
    const T = p.terme, ws = T.map((t) => tokW(t, g) + 2 * pad);
    const [pa, pb] = p.partner, rest = [0, 1, 2].find((i) => i !== pa && i !== pb);
    const reihenfolge0 = [0, 1, 2], reihenfolge1 = [pa, pb, rest];
    const xsVon = (ord) => { const w = ord.reduce((s, i) => s + ws[i], 0) + luecke * 2; let x = B / 2 - w / 2; const r = {}; ord.forEach((i) => { r[i] = x + ws[i] / 2; x += ws[i] + luecke; }); return r; };
    const A = xsVon(reihenfolge0), E = xsVon(reihenfolge1);
    const uz = Z("zeigen"), uf = Z("finden"), ut = Z("tauschen"), ub = Z("buendeln"), ur = Z("rest");
    const y = 52, hh = 46;
    const plusX = (u) => { const pos = {}; [0, 1, 2].forEach((i) => { pos[i] = mix(A[i], E[i], u); }); const sorted = [0, 1, 2].sort((a, b) => pos[a] - pos[b]); return [0, 1].map((k) => (pos[sorted[k]] + ws[sorted[k]] / 2 + pos[sorted[k + 1]] - ws[sorted[k + 1]] / 2) / 2); };
    const pl = plusX(ut);
    const xL = E[pa] - ws[pa] / 2, xR = E[pb] + ws[pb] / 2;
    return (
      <>
        {[0, 1, 2].map((i) => {
          const istP = i === pa || i === pb;
          const x = mix(A[i], E[i], ut), dy = (i === pb ? -1 : i === rest ? 1 : 0) * Math.sin(PI * ut) * 24;
          return (
            <g key={i} opacity={uz}>
              <rect x={x - ws[i] / 2} y={y - hh / 2 + dy} width={ws[i]} height={hh} rx="12" fill={istP && uf > 0.3 ? F.goldHell : F.flaeche} stroke={istP && uf > 0.3 ? F.gold : F.linie} strokeWidth={istP && uf > 0.3 ? 2 : 1.4} />
              <Tok t={T[i]} x={x} y={y + dy} g={g} />
            </g>
          );
        })}
        {pl.map((x, k) => <Tx key={k} x={x} y={y + 7} g={20} f={F.grau} o={uz}>+</Tx>)}
        <g opacity={ub}>
          <path d={`M${xL + 4} ${y + hh / 2 + 6} v8 h${xR - xL - 8} v-8`} fill="none" stroke={F.gold} strokeWidth="2.2" strokeLinecap="round" />
          <Reihe x={(xL + xR) / 2} y={y + hh / 2 + 34} g={16} teile={["=", { t: p.zwischen, f: F.goldDunkel }]} />
        </g>
        <g opacity={ur} transform={`translate(0 ${(1 - ur) * 6})`}>
          <rect x={B / 2 - 110} y={140} width={220} height={46} rx="14" fill={F.granatTief} />
          <Reihe x={B / 2} y={163} g={17} f={F.goldHell} teile={[p.zwischen, "+", T[rest], "=", p.ergebnis]} />
        </g>
      </>
    );
  },
};

/* ============================================================
   b_malZahl – k · (z/n): k Kopien des Anteils werden aneinandergereiht
   p: { k: 3, z: 2, n: 7 }   (k·z ≤ n)
   ============================================================ */
const b_malZahl = {
  h: 214,
  label: (p) => `${p.k} mal ${bw(p.z, p.n)}`,
  ablauf: (p) => [
    { k: "zeigen", ms: 1100, text: `${p.k}-mal ${bw(p.z, p.n)}.` },
    { k: "reihen", ms: 600 + p.k * 600, text: `Die Stücke aneinanderlegen: ${Array(p.k).fill(p.z).join(" + ")} = ${p.k * p.z} ${nennerWort(p.n)}.` },
    { k: "formel", ms: 1500, text: `Der Zähler wird mal ${p.k} genommen, der Nenner bleibt: ${bw(p.k * p.z, p.n)}.` },
  ],
  bild: ({ Z, z, p }) => {
    const { k, z: zz, n } = p, F3 = [F.granat, F.gold, F.blau, F.granatTief, F.goldDunkel];
    const W = 294, cw = W / n, x0 = B / 2 - W / 2, yr = 108, hh = 28;
    const gw0 = zz * cw, gap = Math.min(22, (W - k * gw0) / Math.max(1, k - 1)), wGes = k * gw0 + (k - 1) * gap, xg = (i) => B / 2 - wGes / 2 + i * (gw0 + gap);
    const uz = Z("zeigen"), ur = z("reihen"), uf = Z("formel");
    return (
      <>
        <Raster x={x0} y={yr} w={W} h={hh} sp={n} ze={1} o={uz} zelle={() => null} />
        {Array.from({ length: k }, (_, i) => {
          const u = sanft(staffel(ur, i, k, 0.3)), xs = mix(xg(i), x0 + i * gw0, u), ys = mix(42, yr, u) - Math.sin(PI * u) * 10;
          return (
            <g key={i} opacity={staffel(uz, i, k, 0.5)}>
              <SvgBruch x={xg(i) + gw0 / 2} y={20} z={zz} n={n} g={12} f={F3[i % 5]} o={1 - u} />
              {Array.from({ length: zz }, (_, j) => <rect key={j} x={xs + j * cw + 0.8} y={ys + 0.8} width={cw - 1.6} height={hh - 1.6} rx="2" fill={F3[i % 5]} />)}
            </g>
          );
        })}
        <rect x={x0} y={yr} width={W} height={hh} fill="none" stroke={F.tinte} strokeWidth="1.8" rx="1.5" opacity={uz} />
        <Tx x={x0 + W + 4} y={yr + hh + 16} g={11} f={F.grau} w={700} a="end" o={uz}>{`1 Ganzes = ${n} ${nennerWort(n)}`}</Tx>
        <g opacity={uf} transform={`translate(0 ${(1 - uf) * 6})`}>
          <Reihe x={B / 2} y={186} g={18} teile={[String(k), "·", { b: [zz, n] }, "=", { b: [`${k} · ${zz}`, n] }, "=", { b: [k * zz, n], f: F.granat }]} />
        </g>
      </>
    );
  },
};

/* ============================================================
   b_durchZahl – (z/n) : k: jedes Stück wird in k Teile geschnitten, man nimmt eines davon
   p: { z: 3, n: 5, k: 2 }
   ============================================================ */
const b_durchZahl = {
  h: 190,
  label: (p) => `${gross(bw(p.z, p.n))} geteilt durch ${p.k}`,
  ablauf: (p) => [
    { k: "zeigen", ms: 1000, text: `${gross(bw(p.z, p.n))} sollen durch ${p.k} geteilt werden.` },
    { k: "teilen", ms: 1500, text: `Jedes ${nennerWort(p.n)} in ${p.k} Teile schneiden – es entstehen ${nennerWort(p.n * p.k)}.` },
    { k: "nehmen", ms: 1400, text: `Von jedem Stück nur ein Teil: ${bw(p.z, p.n * p.k)}.` },
    { k: "formel", ms: 1500, text: `Der Nenner wird mal ${p.k} genommen: ${bw(p.z, p.n)} durch ${p.k} = ${bw(p.z, p.n * p.k)}.` },
  ],
  bild: ({ Z, p }) => {
    const { z: zz, n, k } = p;
    const uz = Z("zeigen"), ut = Z("teilen"), un = Z("nehmen"), uf = Z("formel");
    return (
      <>
        <Raster x={24} y={36} w={190} h={110} sp={n} ze={k} o={uz}
          zelle={(i, j) => (i < zz ? { f: j === 0 ? F.granat : un > 0.3 ? F.granatHell : F.granat, o: 1 } : null)}
          linieH={(j) => ({ u: staffel(ut, j - 1, k - 1, 0.5) })} />
        <Pille x={119} y={172} text={`${zz} von ${n * k} Teilen`} f={F.granatHell} tf={F.granat} o={un} />
        <Reihe x={288} y={56} g={20} o={uz} teile={[{ b: [zz, n] }, ":", String(k)]} />
        <Reihe x={288} y={108} g={20} o={uf} teile={["=", { b: [zz, `${n} · ${k}`] }]} />
        <Reihe x={288} y={160} g={20} o={uf} teile={["=", { b: [zz, n * k], f: F.granat }]} />
      </>
    );
  },
};

/* ============================================================
   b_rechteckMal – Rechteckmodell: (a/b) von (c/d) → Überlappung zählt
   p: { a: [2, 3], b: [4, 5] }  (a = Zeilen-Anteil, b = Spalten-Anteil)
   ============================================================ */
const b_rechteckMal = {
  h: 196,
  label: (p) => `${gross(bw(...p.a))} mal ${bw(...p.b)}`,
  ablauf: (p) => {
    const Zz = p.a[0] * p.b[0], Nn = p.a[1] * p.b[1], g = ggT(Zz, Nn);
    return [
      { k: "spalten", ms: 1400, text: `${gross(bw(...p.b))}: ${p.b[0]} von ${p.b[1]} Spalten.` },
      { k: "zeilen", ms: 1400, text: `Davon ${bw(...p.a)}: ${p.a[0]} von ${p.a[1]} Zeilen.` },
      { k: "treffer", ms: 1600, text: `Doppelt gefärbt: ${p.a[0]} · ${p.b[0]} = ${Zz} Felder – von ${p.a[1]} · ${p.b[1]} = ${Nn} Feldern.` },
      { k: "formel", ms: 1500, text: `Zähler mal Zähler, Nenner mal Nenner: ${bw(Zz, Nn)}${g > 1 ? ` = ${bw(Zz / g, Nn / g)}` : ""}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const [az, an] = p.a, [bz, bn] = p.b, Zz = az * bz, Nn = an * bn, g = ggT(Zz, Nn);
    const us = Z("spalten"), uze = Z("zeilen"), ut = z("treffer"), uf = Z("formel");
    const s = 156, x0 = 22, y0 = 20;
    return (
      <>
        <Raster x={x0} y={y0} w={s} h={s} sp={bn} ze={an}
          zelle={(i, j) => {
            const sp = i < bz, ze = j < az;
            if (sp && ze) { const u = staffel(ut, (j * bz + i), Zz, 0.5); return { f: u > 0.5 ? F.granat : F.blauHell, o: us }; }
            if (sp) return { f: F.blauHell, o: us };
            if (ze) return { f: F.goldHell, o: uze };
            return null;
          }}
          linieV={() => ({ u: us })} linieH={() => ({ u: uze })} />
        {Array.from({ length: az }, (_, j) => <rect key={j} x={x0 + 1} y={y0 + (j * s) / an + 1} width={s - 2} height={s / an - 2} fill="none" stroke={F.gold} strokeWidth="2.6" opacity={uze * (1 - teil(ut, 0, 0.5))} />)}
        <Reihe x={274} y={56} g={20} teile={[{ b: p.a, f: F.goldDunkel, o: uze }, { t: "·", o: uze }, { b: p.b, f: F.blau, o: us }]} />
        <Reihe x={274} y={118} g={20} o={teil(ut, 0.4, 1)} teile={["=", { b: [`${az} · ${bz}`, `${an} · ${bn}`] }]} />
        <Reihe x={274} y={172} g={20} o={uf} teile={g > 1 ? ["=", { b: [Zz, Nn] }, "=", { b: [Zz / g, Nn / g], f: F.granat }] : ["=", { b: [Zz, Nn], f: F.granat }]} />
      </>
    );
  },
};

/* ============================================================
   b_passtRein – a : (z/n): Wie oft passt der Bruch in a Ganze? Stücke zählen, dann Kehrbruch
   p: { a: 3, z: 1, n: 4 }  ·  { a: 6, z: 3, n: 4, ding: "Flaschen" }
   ============================================================ */
const b_passtRein = {
  h: 196,
  label: (p) => `${p.a} geteilt durch ${bw(p.z, p.n)}`,
  ablauf: (p) => {
    const q = (p.a * p.n) / p.z;
    return [
      { k: "ganze", ms: 1000, text: `${p.a} Ganze – wie oft passt ${bw(p.z, p.n)} hinein?` },
      { k: "schneiden", ms: 1300, text: `Jedes Ganze in ${nennerWort(p.n)} schneiden: ${p.a} · ${p.n} = ${p.a * p.n} ${nennerWort(p.n)}.` },
      { k: "zaehlen", ms: 500 + q * 220, text: p.z === 1 ? `Zählen: ${bw(1, p.n)} passt ${q}-mal hinein.` : `Immer ${p.z} ${nennerWort(p.n)} bilden ein Stück: ${q}-mal.` },
      { k: "regel", ms: 1900, text: p.z === 1 ? `Durch ${bw(1, p.n)} teilen ist dasselbe wie mal ${p.n}: ${p.a} · ${p.n} = ${q}.` : `Durch ${bw(p.z, p.n)} teilen heißt: mit dem Kehrbruch ${bw(p.n, p.z)} malnehmen. Ergebnis ${q}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const { a, z: zz, n } = p, q = (a * n) / zz;
    const gap = 6, W = 316, bw0 = (W - (a - 1) * gap) / a, x0 = B / 2 - W / 2, y0 = 34, hh = 32, cw = bw0 / n;
    const ug = Z("ganze"), us = Z("schneiden"), uz = z("zaehlen"), ur = Z("regel");
    const xStueck = (k) => { const g = Math.floor(k / n), i = k % n; return x0 + g * (bw0 + gap) + i * cw; };
    const F2 = [F.granat, F.gold];
    return (
      <>
        {Array.from({ length: a }, (_, g) => (
          <Raster key={g} x={x0 + g * (bw0 + gap)} y={y0} w={bw0} h={hh} sp={n} ze={1} o={staffel(ug, g, a, 0.5)}
            zelle={(i) => { const k = g * n + i, grp = Math.floor(k / zz), u = staffel(uz, grp, q, 0.3); return u > 0.3 ? { f: F2[grp % 2], o: 1 } : null; }}
            linieV={(i) => ({ u: staffel(us, g, a, 0.5) })} />
        ))}
        {Array.from({ length: a }, (_, g) => <Tx key={g} x={x0 + g * (bw0 + gap) + bw0 / 2} y={y0 - 8} g={10} f={F.grau} w={700} o={ug}>{`${g + 1}. Ganzes`}</Tx>).filter((_, g) => a <= 4)}
        {Array.from({ length: q }, (_, j) => {
          const u = staffel(uz, j, q, 0.3); if (u <= 0.3) return null;
          const xa = xStueck(j * zz), xb = xStueck(j * zz + zz - 1) + cw;
          const zerfaellt = Math.floor((j * zz) / n) !== Math.floor((j * zz + zz - 1) / n);
          return (
            <g key={j} opacity={teil(u, 0.3, 0.7)}>
              {zerfaellt
                ? <path d={`M${xa + 1.5} ${y0 + hh + 5} v5 h${xb - xa - 3} v-5`} fill="none" stroke={F2[j % 2]} strokeWidth="1.6" />
                : <path d={`M${xa + 1.5} ${y0 + hh + 5} v5 h${xb - xa - 3} v-5`} fill="none" stroke={F2[j % 2]} strokeWidth="1.6" />}
              <Tx x={(xa + xb) / 2} y={y0 + hh + 24} g={11} f={j % 2 ? F.goldDunkel : F.granat} w={800}>{j + 1}</Tx>
            </g>
          );
        })}
        <g opacity={ur} transform={`translate(0 ${(1 - ur) * 6})`}>
          <rect x={B / 2 - 150} y={118} width={300} height={56} rx="16" fill={F.flaeche} />
          <Reihe x={B / 2} y={146} g={19} teile={zz === 1
            ? [String(a), ":", { b: [1, n] }, "=", String(a), "·", String(n), "=", { t: String(q), f: F.granat }]
            : [String(a), ":", { b: [zz, n] }, "=", String(a), "·", { b: [n, zz], f: F.blau }, "=", { b: [a * n, zz] }, "=", { t: String(q), f: F.granat }]} />
        </g>
      </>
    );
  },
};

/* ============================================================
   b_kommaWandern – Stellentafel H Z E , z h t: Ziffern rücken bei · 10/100 nach links, bei : 10/100 nach rechts
   p: { zahl: "3,47", op: "·", s: 2 }  ·  { zahl: "8,3", op: ":", s: 2 }
   ============================================================ */
const b_kommaWandern = {
  h: 196,
  label: (p) => `${p.zahl} ${p.op} ${10 ** p.s}`,
  ablauf: (p) => {
    const erg = kommaErgebnis(p);
    const ab = [
      { k: "tafel", ms: 900, text: "Die Stellentafel – das Komma bleibt fest an seinem Platz." },
      { k: "ziffern", ms: 1000, text: `${p.zahl} kommt in die Tafel.` },
      { k: "schieben", ms: 400 + p.s * 650, text: p.op === "·" ? `Mal ${10 ** p.s}: Jede Ziffer rückt ${p.s} Stellen nach links – zehnmal so viel wert je Stelle.` : `Durch ${10 ** p.s}: Jede Ziffer rückt ${p.s} Stellen nach rechts.` },
    ];
    if (erg.nullen.length) ab.push({ k: "nullen", ms: 1000, text: "Leere Stellen bis zum Komma mit Nullen füllen." });
    ab.push({ k: "fertig", ms: 1400, text: `${p.zahl} ${p.op} ${de(10 ** p.s)} = ${erg.text}. Kurz: Das Komma wandert ${p.s} Stellen nach ${p.op === "·" ? "rechts" : "links"}.` });
    return ab;
  },
  bild: ({ Z, z, p }) => {
    const erg = kommaErgebnis(p);
    const KOPF = ["H", "Z", "E", "z", "h", "t"], cw = 46, kw = 16, W = 6 * cw + kw, x0 = B / 2 - W / 2;
    const X = (e) => { const c = 2 - e; return x0 + c * cw + (c >= 3 ? kw : 0) + cw / 2; };   // e = Stellenexponent
    const ut = Z("tafel"), uz = Z("ziffern"), us = z("schieben"), un = Z("nullen"), uf = Z("fertig");
    const richtung = p.op === "·" ? 1 : -1;
    const schritt = teil(us, 0, 1) * p.s;
    const k = Math.floor(schritt), fr = sanft(schritt - k);
    const verschiebung = (k + fr) * richtung;
    const hub = us > 0 && us < 1 ? Math.sin(PI * (schritt - k)) * 8 : 0;
    return (
      <>
        {KOPF.map((h, c) => {
          const d = c >= 3, x = x0 + c * cw + (d ? kw : 0) + cw / 2;
          return (
            <g key={c} opacity={staffel(ut, c, 6, 0.6)}>
              <rect x={x - cw / 2 + 1.5} y={14} width={cw - 3} height={22} rx="6" fill={d ? F.blauHell : F.flaeche} />
              <Tx x={x} y={29.5} g={12} f={d ? F.blau : F.grau} w={800}>{h}</Tx>
              <rect x={x - cw / 2 + 1.5} y={40} width={cw - 3} height={52} rx="8" fill={F.weiss} stroke={F.linie} strokeWidth="1.3" />
            </g>
          );
        })}
        <Tx x={x0 + 3 * cw + kw / 2} y={80} g={34} f={F.gold} w={800} o={ut}>,</Tx>
        {erg.ziffern.map((q, i) => {
          const e = q.e + verschiebung, xx = mix(X(q.e) + (richtung > 0 ? 0 : 0), X(Math.round(q.e)), 0);
          const xPos = (() => { const e0 = Math.floor(e), f0 = e - e0; return mix(X(e0), X(e0 + 1), f0); })();
          return <Tx key={i} x={xPos} y={mix(40, 76, raus(uz)) - hub} g={28} f={F.tinte} w={800} o={uz}>{q.d}</Tx>;
        })}
        {erg.nullen.map((e, i) => <Tx key={`n${i}`} x={X(e)} y={76} g={28} f={F.gold} w={800} o={staffel(un, i, erg.nullen.length, 0.4)}>0</Tx>)}
        {us > 0 && us < 1 && (
          <Pfeil x1={B / 2 + (richtung > 0 ? 40 : -40)} y1={108} x2={B / 2 + (richtung > 0 ? -40 : 40)} y2={108} u={1} f={F.gold} b={2.4} />
        )}
        <Tx x={B / 2} y={128} g={11.5} f={F.goldDunkel} w={800} o={us > 0 && uf < 1 ? 1 - uf : 0}>{`${p.op} ${de(10 ** p.s)}: ${p.s} Stellen nach ${richtung > 0 ? "links" : "rechts"}`}</Tx>
        <g opacity={uf} transform={`translate(0 ${(1 - uf) * 6})`}>
          <rect x={B / 2 - 105} y={140} width={210} height={34} rx="17" fill={F.granatTief} />
          <Tx x={B / 2} y={162} g={15} f={F.goldHell} w={800}>{`${p.zahl} ${p.op} ${de(10 ** p.s)} = ${erg.text}`}</Tx>
        </g>
      </>
    );
  },
};
function kommaErgebnis(p) {
  const { int, dez } = zerlege(p.zahl);
  const ziffern = [...int.split("").map((d, i) => ({ d, e: int.length - 1 - i })), ...dez.split("").map((d, i) => ({ d, e: -(i + 1) }))]
    .filter((q, i, arr) => !(q.e > 0 && q.d === "0" && arr.slice(0, i).every((r) => r.d === "0")));
  const r = p.op === "·" ? 1 : -1;
  const neu = ziffern.map((q) => q.e + r * p.s);
  const hoch = Math.max(...neu), tief = Math.min(...neu);
  const nullen = [];
  for (let e = Math.max(hoch, 0); e >= Math.min(tief, 0); e--) if (!neu.includes(e) && (e >= 0 || e > tief)) nullen.push(e);
  /* Ergebnis als Text */
  const wert = Number((zahl(p.zahl) * (r > 0 ? 10 ** p.s : 1 / 10 ** p.s)).toFixed(6));
  return { ziffern, nullen: nullen.filter((e) => e <= 0 || e < hoch), text: de(wert) };
}

/* ============================================================
   b_dezMal – Dezimalzahlen multiplizieren: ohne Komma rechnen, Nachkommastellen zählen, Komma setzen
   p: { a: "4,8", b: "3,5", ueberschlag: "5 · 3 = 15" }
   ============================================================ */
const b_dezMal = {
  h: 206,
  label: (p) => `${p.a} · ${p.b}`,
  ablauf: (p) => {
    const A = zerlege(p.a), Bz = zerlege(p.b), nk = A.dez.length + Bz.dez.length;
    const ai = ohneKomma(p.a), bi = ohneKomma(p.b), pr = ai * bi;
    const erg = de(Number((zahl(p.a) * zahl(p.b)).toFixed(nk)));
    const roh = rohErgebnis(pr, nk);
    return [
      { k: "zeigen", ms: 1000, text: `${p.a} · ${p.b} – erst einmal ohne Komma rechnen.` },
      { k: "ohne", ms: 1400, text: `${ai} · ${bi} = ${pr}` },
      { k: "zaehlen", ms: 1400, text: `Nachkommastellen zählen: ${A.dez.length} + ${Bz.dez.length} = ${nk}.` },
      { k: "komma", ms: 500 + nk * 500, text: `Das Ergebnis bekommt ${nk} Nachkommastellen: Das Komma springt von rechts ${nk} Stellen nach links${roh.vorn ? " – vorne fehlen Ziffern, also Nullen davor" : ""}.` },
      { k: "fertig", ms: 1500, text: `${p.a} · ${p.b} = ${erg}${p.ueberschlag ? `. Überschlag: ${p.ueberschlag} – passt.` : ""}` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const A = zerlege(p.a), Bz = zerlege(p.b), nk = A.dez.length + Bz.dez.length;
    const ai = ohneKomma(p.a), bi = ohneKomma(p.b), pr = ai * bi;
    const roh = rohErgebnis(pr, nk), erg = de(Number((zahl(p.a) * zahl(p.b)).toFixed(nk)));
    const uz = Z("zeigen"), uo = Z("ohne"), uza = Z("zaehlen"), uk = z("komma"), uf = Z("fertig");
    const g = 22;
    /* Zeile 1: a · b mit Kommas, die verblassen */
    const faktor = (s, x, farbe) => {
      const { int, dez } = zerlege(s);
      const zu = uo * (1 - uf);   // Komma weg während des Rechnens, im Schlussbild wieder da
      const wInt = breite(int, g), wK = breite(",", g) * (1 - zu), wD = breite(dez, g);
      const w = wInt + wK + wD, xl = x - w / 2;
      const ganz = int + dez, lz = ganz.length - ganz.replace(/^0+/, "").length;
      const blass = mix(1, 0.22, zu);
      return (
        <g>
          <Tx x={xl} y={44} g={g} a="start" f={F.tinte} w={800} o={lz > 0 ? blass : 1}>{int}</Tx>
          <Tx x={xl + wInt} y={44} g={g} a="start" f={F.gold} w={800} o={1 - zu}>,</Tx>
          <text x={xl + wInt + wK} y={44} fontSize={g} fontWeight="800" fill={farbe} style={{ fontFamily: "Montserrat, sans-serif" }}>
            {dez.split("").map((c, i) => <tspan key={i} opacity={int.length + i < lz ? blass : 1}>{c}</tspan>)}
          </text>
          <path d={`M${xl + wInt + wK + 1} 54 v4 h${wD - 2} v-4`} fill="none" stroke={farbe} strokeWidth="1.8" opacity={uza} />
          <Tx x={xl + wInt + wK + wD / 2} y={72} g={11} f={farbe} w={800} o={uza}>{`${dez.length} ${dez.length === 1 ? "Stelle" : "Stellen"}`}</Tx>
        </g>
      );
    };
    /* Zeile 3: Ergebnisziffern, Komma springt */
    const ziff = roh.s.split(""), cw = 20, W = ziff.length * cw, xr0 = B / 2 - W / 2 - 30;
    const XZ = (i) => xr0 + i * cw + cw / 2;
    const hop = uk * nk, hk = Math.min(nk - 1, Math.floor(hop)), hf = hop - hk;
    const grenze = (j) => xr0 + W - j * cw;  // Grenze j Stellen von rechts
    const kx = uk > 0 ? mix(grenze(hk), grenze(hk + 1), sanft(klemm(hf))) : grenze(0);
    const ky = 150 - Math.sin(PI * klemm(hf)) * (uk > 0 && uk < 1 ? 22 : 0);
    return (
      <>
        <g opacity={uz}>
          {faktor(p.a, B / 2 - 60, F.granat)}
          <Tx x={B / 2} y={44} g={g} f={F.grau}>·</Tx>
          {faktor(p.b, B / 2 + 60, F.blau)}
        </g>
        <Pille x={B / 2} y={104} text={`${ai} · ${bi} = ${pr}`} g={13} f={F.flaeche} tf={F.tinte} o={uo} />
        <g opacity={uza}>
          {ziff.map((d, i) => <Tx key={i} x={XZ(i)} y={150} g={g} f={i < roh.vorn ? F.gold : F.tinte} w={800} o={i < roh.vorn ? teil(uk, 0, 0.3) : 1}>{d}</Tx>)}
          {Array.from({ length: Math.ceil(hop - 0.001) }, (_, j) => <Sprung key={j} xa={grenze(j)} xb={grenze(j + 1)} y={130} hoch={10} u={klemm(hop - j)} b={1.8} f={F.gold} />)}
          <Tx x={kx} y={ky} g={g} f={F.granat} w={800} o={uk > 0 ? 1 : 0}>,</Tx>
        </g>
        <Pille x={xr0 + W / 2} y={182} text={`${nk} Nachkommastellen`} f={F.goldHell} o={uk > 0 ? teil(uk, 0, 0.3) * (1 - teil(uf, 0, 0.5)) : 0} />
        <g opacity={uf}>
          <Tx x={xr0 + W + 16} y={150} g={g} f={F.tinte} a="start">=</Tx>
          <rect x={xr0 + W + 34} y={128} width={breite(erg, g) + 20} height={32} rx="10" fill={F.granatTief} />
          <Tx x={xr0 + W + 44} y={151} g={g} f={F.goldHell} w={800} a="start">{erg}</Tx>
        </g>
        {p.ueberschlag && <Tx x={B / 2} y={194} g={11.5} f={F.grau} w={700} o={teil(uf, 0.5, 1)}>{`Überschlag: ${p.ueberschlag}`}</Tx>}
      </>
    );
  },
};
function rohErgebnis(pr, nk) {
  let s = String(pr), vorn = 0;
  while (s.length < nk + 1) { s = "0" + s; vorn++; }
  return { s, vorn };
}

/* ============================================================
   b_dezTeilen – durch eine Dezimalzahl teilen: Komma bei beiden gleich weit schieben, bis der Divisor ganz ist
   p: { a: "1,56", b: "0,12" }  ·  { a: "3,6", b: "0,25" }
   ============================================================ */
const b_dezTeilen = {
  h: 190,
  label: (p) => `${p.a} : ${p.b}`,
  ablauf: (p) => {
    const s = zerlege(p.b).dez.length, f = 10 ** s;
    const an = Number((zahl(p.a) * f).toFixed(6)), bn = Number((zahl(p.b) * f).toFixed(6)), q = Number((an / bn).toFixed(6));
    return [
      { k: "zeigen", ms: 1000, text: `${p.a} : ${p.b} – durch eine Dezimalzahl teilen.` },
      { k: "schieben", ms: 500 + s * 650, text: `Das Komma bei beiden um ${s} ${s === 1 ? "Stelle" : "Stellen"} nach rechts – bis der Divisor eine ganze Zahl ist.` },
      { k: "rechnen", ms: 1500, text: `${de(an)} : ${de(bn)} = ${de(q)} – beide wurden mal ${f} genommen, der Quotient bleibt gleich.` },
      { k: "fertig", ms: 1200, text: `Also ${p.a} : ${p.b} = ${de(q)}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const s = zerlege(p.b).dez.length, f = 10 ** s;
    const an = Number((zahl(p.a) * f).toFixed(6)), bn = Number((zahl(p.b) * f).toFixed(6)), q = Number((an / bn).toFixed(6));
    const uz = Z("zeigen"), us = z("schieben"), ur = Z("rechnen"), uf = Z("fertig");
    const g = 26, cw = 20, y = 66;
    const zahlBild = (str, xr, farbe, links) => {
      /* xr = rechter Rand der Ziffern (inkl. angehängter Nullen) */
      const { int, dez } = zerlege(str);
      const anh = Math.max(0, s - dez.length);
      const ziff = (int + dez + "0".repeat(anh)).split("");
      const n = ziff.length, x0 = xr - n * cw;
      const XZ = (i) => x0 + i * cw + cw / 2;
      const hop = us * s, hk = Math.min(s - 1, Math.floor(hop)), hf = hop - hk;
      const grenze = (j) => x0 + (int.length + j) * cw;
      const kx = us > 0 ? mix(grenze(hk), grenze(hk + 1), sanft(klemm(hf))) : grenze(0);
      const ky = y + 4 - Math.sin(PI * klemm(hf)) * (us > 0 && us < 1 ? 24 : 0);
      const fuehrend = (i) => { const vorne = ziff.slice(0, i + 1).join(""); return /^0+$/.test(vorne) && i < int.length + s - 1; };
      return (
        <g>
          {ziff.map((d, i) => {
            const angehaengt = i >= int.length + dez.length;
            const o = angehaengt ? teil(us, 0.5, 1) : fuehrend(i) ? 1 - teil(us, 0.6, 1) : 1;
            return <Tx key={i} x={XZ(i)} y={y} g={g} f={angehaengt ? F.gold : farbe} w={800} o={o}>{d}</Tx>;
          })}
          <g opacity={1 - ur}>{Array.from({ length: Math.ceil(hop - 0.001) }, (_, j) => <Sprung key={j} xa={grenze(j)} xb={grenze(j + 1)} y={y - 22} hoch={9} u={klemm(hop - j)} b={1.6} f={F.gold} />)}</g>
          <Tx x={kx} y={ky} g={g} f={F.gold} w={800} o={us >= 1 ? 1 - teil(us, 0.9, 1) : 1}>,</Tx>
        </g>
      );
    };
    return (
      <>
        <g opacity={uz}>
          {zahlBild(p.a, B / 2 - 22, F.tinte, true)}
          <Tx x={B / 2} y={y} g={g} f={F.grau}>:</Tx>
          {(() => { const { int, dez } = zerlege(p.b); const n = int.length + dez.length; return zahlBild(p.b, B / 2 + 22 + n * cw, F.blau, false); })()}
        </g>
        <Pille x={B / 2} y={108} text={`beide · ${f}`} o={teil(us, 0.2, 0.6)} />
        <g opacity={ur} transform={`translate(0 ${(1 - ur) * 6})`}>
          <rect x={B / 2 - 100} y={124} width={200} height={34} rx="17" fill={F.flaeche} />
          <Tx x={B / 2} y={147} g={17} f={F.tinte} w={800}>{`${de(an)} : ${de(bn)} = `}<tspan fill={F.granat}>{de(q)}</tspan></Tx>
        </g>
        <Tx x={B / 2} y={180} g={12} f={F.granat} w={800} o={uf}>{`${p.a} : ${p.b} = ${de(q)}`}</Tx>
      </>
    );
  },
};

/* ============================================================
   b_umformung3/4/5 – Rechenweg Zeile für Zeile mit gestapelten Brüchen; markierter Teil leuchtet, Notiz rechts
   p: { zeilen: [{ t: ["(", {b:[3,4]}, "−", {b:[1,2]}, ")", …], m: [0, 4], n: "Klammer zuerst" }, …], text: [Untertitel je Zeile] }
   m = [erster, letzter] Index der markierten Teile
   ============================================================ */
const ZH = 54;
const b_umformung = {
  label: (p) => "Rechenweg mit Brüchen",
  ablauf: (p) => p.zeilen.flatMap((zl, i) => [
    { k: `z${i}`, ms: 700, text: (p.text && p.text[i]) || zl.n || (i === p.zeilen.length - 1 ? "Ergebnis" : undefined) },
    { k: `m${i}`, ms: zl.m ? 1000 : 300 },
  ]),
  bild: ({ Z, p }) => {
    const n = p.zeilen.length, g = 16;
    return (
      <>
        {p.zeilen.map((zl, i) => {
          const u = Z(`z${i}`, raus), um = Z(`m${i}`), letzte = i === n - 1;
          const y = 32 + i * ZH + (1 - u) * 12;
          const L = lage(zl.t, g), x0 = 32 + L.w / 2;
          let mark = null;
          if (zl.m) {
            const [a, b] = zl.m, xa = x0 + L.xs[a] - L.ws[a] / 2 - 5, xb = x0 + L.xs[b] + L.ws[b] / 2 + 5;
            const hoch = zl.t.slice(a, b + 1).some((t) => typeof t === "object" && (t.b || t.gm)) ? 21 : 13;
            mark = <rect x={xa} y={y - hoch} width={(xb - xa) * um} height={hoch * 2} rx="8" fill={F.goldHell} />;
          }
          const hochL = zl.t.some((t) => typeof t === "object" && (t.b || t.gm)) ? 21 : 13;
          return (
            <g key={i} opacity={u}>
              {i > 0 && <Tx x={16} y={y + g * 0.36} g={g} f={F.grau}>=</Tx>}
              {mark}
              {letzte && <rect x={26} y={y - hochL} width={L.w + 12} height={hochL * 2} rx="8" fill="none" stroke={F.granat} strokeWidth="2" opacity={teil(u, 0.4, 1)} />}
              <Reihe x={x0} y={y} g={g} f={letzte ? F.granat : F.tinte} teile={zl.t} />
              {zl.n && <Pille x={B - 12 - (breite(zl.n, 11) + 16)} y={y + 4} a="start" text={zl.n} g={11} o={teil(um || u, 0.2, 1)} />}
            </g>
          );
        })}
      </>
    );
  },
};
const umformungMit = (zeilenMax) => ({ ...b_umformung, h: 10 + zeilenMax * ZH });

export const SZENEN_BRUECHE = {
  b_anteil,
  b_vonGroesse,
  b_strahl,
  b_verfeinern,
  b_vergleich,
  b_gemischt,
  b_prozent,
  b_stellen,
  b_groessen,
  b_uhr,
  b_zuDezimal,
  b_teilen,
  b_lupe,
  b_addStreifen,
  b_gemischtAdd,
  b_kommaUnterKomma,
  b_partner,
  b_malZahl,
  b_durchZahl,
  b_rechteckMal,
  b_passtRein,
  b_kommaWandern,
  b_dezMal,
  b_dezTeilen,
  b_umformung3: umformungMit(3),
  b_umformung4: umformungMit(4),
};
