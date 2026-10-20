/* ============================================================
   Szenen der Gruppe Geometrie (Klasse 5: Größen, Symmetrie und Figuren, Flächen, Körper;
   Klasse 6: Winkel und Kreis). Alle Namen mit Präfix g_. Vertrag siehe kern.jsx.
   ============================================================ */
import React from "react";
import { B, F, Tx, Strich, Pfeil, Sprung, Kasten, Puls, Pille, Tippen, SvgBruch, Spitze, breite, de, mix, klemm, teil, staffel, raus, federnd, sanft, linear } from "./kern.jsx";

/* ---------- lokale Hilfen ---------- */
const rad = (g) => (g * Math.PI) / 180;
/* Punkt auf Kreis (mathematischer Winkel in Grad, gegen den Uhrzeigersinn, y nach oben) */
const pol = (cx, cy, r, g) => [cx + r * Math.cos(rad(g)), cy - r * Math.sin(rad(g))];
const n1 = (v) => Math.round(v * 100) / 100;
function arcA(cx, cy, r, a0, a1) {
  const [x, y] = pol(cx, cy, r, a1);
  return `A${n1(r)} ${n1(r)} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 0 : 1} ${n1(x)} ${n1(y)}`;
}
/* Kreisbogen von a0 nach a1 (Grad) */
function bogen(cx, cy, r, a0, a1) {
  const [x0, y0] = pol(cx, cy, r, a0);
  if (Math.abs(a1 - a0) > 359) { const m = (a0 + a1) / 2; return `M${n1(x0)} ${n1(y0)} ${arcA(cx, cy, r, a0, m)} ${arcA(cx, cy, r, m, a1)}`; }
  return `M${n1(x0)} ${n1(y0)} ${arcA(cx, cy, r, a0, a1)}`;
}
/* Kreisausschnitt */
const sektor = (cx, cy, r, a0, a1) => `M${n1(cx)} ${n1(cy)} L${bogen(cx, cy, r, a0, a1).slice(1)} Z`;
const pts = (liste) => liste.map(([x, y]) => `${n1(x)},${n1(y)}`).join(" ");
const mixP = (a, b, u) => [mix(a[0], b[0], u), mix(a[1], b[1], u)];
/* Linie zeichnet sich über pathLength (für Pfade, Ellipsen, Polygone) */
const zieh = (u) => ({ pathLength: 1, strokeDasharray: "1 2", strokeDashoffset: 1 - klemm(u) });
const zahl = (v) => de(Math.round(v * 1e6) / 1e6);
/* Rechter-Winkel-Zeichen im Scheitel (x,y) zwischen den Richtungen w1 und w2 (Grad): Bogen mit Punkt */
function RechterWinkel({ x, y, w1 = 0, w2 = 90, r = 13, f = F.granat, o = 1 }) {
  if (o <= 0) return null;
  const [px, py] = pol(x, y, r * 0.5, (w1 + w2) / 2);
  return (
    <g opacity={o}>
      <path d={bogen(x, y, r, w1, w2)} fill="none" stroke={f} strokeWidth="1.6" />
      <circle cx={px} cy={py} r="1.8" fill={f} />
    </g>
  );
}
/* Längenmarke (Strich/e) quer zur Strecke */
function Marke({ a, b, n = 1, f = F.granat, o = 1 }) {
  if (o <= 0) return null;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  const ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const s = (i - (n - 1) / 2) * 4;
        return <line key={i} x1={mx + ux * s - nx * 5} y1={my + uy * s - ny * 5} x2={mx + ux * s + nx * 5} y2={my + uy * s + ny * 5} stroke={f} strokeWidth="1.6" strokeLinecap="round" />;
      })}
    </g>
  );
}
/* Parallel-Pfeilchen mitten auf der Strecke */
function ParallelZeichen({ a, b, n = 1, f = F.blau, o = 1 }) {
  if (o <= 0) return null;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, w = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const s = (i - (n - 1) / 2) * 6;
        return <path key={i} d="M-3 -4 L2 0 L-3 4" fill="none" stroke={f} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${n1(mx)} ${n1(my)}) rotate(${n1(w)}) translate(${s} 0)`} />;
      })}
    </g>
  );
}
/* Geschweifte Klammer unter (oder über) einer waagerechten Strecke */
function Klammer({ x1, x2, y, unten = true, f = F.granat, o = 1, b = 1.8 }) {
  if (o <= 0) return null;
  const d = unten ? 1 : -1, m = (x1 + x2) / 2;
  return <path opacity={o} d={`M${x1} ${y} q0 ${5 * d} 6 ${5 * d} H${m - 5} q5 0 5 ${5 * d} q0 ${-5 * d} 5 ${-5 * d} H${x2 - 6} q6 0 6 ${-5 * d}`} fill="none" stroke={f} strokeWidth={b} strokeLinecap="round" strokeLinejoin="round" />;
}

/* ============================================================
   g_lineal – erst schätzen (Daumenbreiten), dann mit dem Lineal messen; Größe = Maßzahl + Einheit
   p: { laenge: 12, schaetz: 10 }
   ============================================================ */
const g_lineal = {
  h: 200,
  label: (p) => `Ein Stift wird geschätzt und gemessen: ${p.laenge} cm`,
  ablauf: (p) => [
    { k: "schaetzen", ms: 1700, text: `Erst schätzen: Eine Daumenbreite ist etwa 1 cm. Der Stift ist etwa ${p.schaetz} Daumen lang.` },
    { k: "lineal", ms: 800, text: "Dann messen: Das Lineal kommt dazu." },
    { k: "anlegen", ms: 1100, text: "Das Ende des Stifts liegt genau an der 0." },
    { k: "ablesen", ms: 1300, text: `An der Spitze ablesen: Der Stift ist ${p.laenge} cm lang.` },
    { k: "groesse", ms: 1700, text: `Größe = Maßzahl + Einheit. Die Schätzung lag nur ${p.laenge - p.schaetz} cm daneben.` },
  ],
  bild: ({ Z, z, p }) => {
    const s = 20.8, X = (v) => 24 + v * s, L = p.laenge, G = p.schaetz, bis = 14;
    const us = z("schaetzen"), ul = Z("lineal"), ua = Z("anlegen"), ur = Z("ablesen"), ug = Z("groesse");
    const dx = 22 * (1 - ua), ry = 84 + 14 * (1 - ul);
    return (
      <>
        {Array.from({ length: G }, (_, i) => {
          const o = staffel(teil(us, 0.12, 0.8), i, G, 0.5);
          return o > 0 && <rect key={i} x={X(i) + 1.5} y={26 - 6 * (1 - o)} width={s - 3} height={13} rx="4" fill={F.goldHell} stroke={F.gold} strokeWidth="1.2" opacity={o} />;
        })}
        <Pille x={X(G) + 10} y={37} a="start" text={`etwa ${G} cm`} o={teil(us, 0.8, 1)} />
        {/* Stift */}
        <g opacity={klemm(us * 5)}>
          <rect x={X(0)} y={54} width={12} height={16} rx="3" fill={F.rosa} />
          <rect x={X(0) + 10} y={54} width={X(L - 1.3) - X(0) - 10} height={16} fill={F.gold} />
          <line x1={X(0) + 14} y1={62} x2={X(L - 1.3)} y2={62} stroke={F.goldDunkel} strokeWidth="1" opacity="0.5" />
          <path d={`M${X(L - 1.3)} 54 L${X(L)} 62 L${X(L - 1.3)} 70 Z`} fill={F.goldHell} />
          <path d={`M${X(L - 0.45)} 59.2 L${X(L)} 62 L${X(L - 0.45)} 64.8 Z`} fill={F.tinte} />
        </g>
        {/* Lineal */}
        <g opacity={ul} transform={`translate(${dx} 0)`}>
          <rect x={X(0) - 10} y={ry} width={X(bis) - X(0) + 20} height={34} rx="5" fill={F.weiss} stroke={F.hell} strokeWidth="1.3" />
          {Array.from({ length: bis * 10 + 1 }, (_, i) => {
            const lang = i % 10 === 0 ? 12 : i % 5 === 0 ? 8 : 4;
            return <line key={i} x1={X(i / 10)} y1={ry} x2={X(i / 10)} y2={ry + lang} stroke={F.tinte} strokeWidth={i % 10 === 0 ? 1.2 : 0.7} />;
          })}
          {Array.from({ length: bis + 1 }, (_, i) => (
            <Tx key={i} x={X(i)} y={ry + 27} g={i === L && ur > 0.3 ? 12 : 10} f={i === L && ur > 0.3 ? F.granat : F.tinte} w={i === L && ur > 0.3 ? 800 : 600}>{i}</Tx>
          ))}
        </g>
        {ur > 0 && <line x1={X(L)} y1={71} x2={X(L)} y2={71 + (ry + 13 - 71) * ur} stroke={F.granat} strokeWidth="1.6" strokeDasharray="3 3" />}
        <Puls x={X(L)} y={ry + 23} u={teil(ur, 0.3, 1)} r={14} />
        {/* Ergebnis */}
        <g opacity={ug} transform={`translate(0 ${(1 - ug) * 8})`}>
          <Kasten x={58} y={140} w={62} h={36} text={L} f={F.granat} rand={F.granat} tf={F.weiss} g={20} />
          <Kasten x={126} y={140} w={62} h={36} text="cm" f={F.blauHell} rand={F.blauHell} tf={F.blau} g={18} />
          <Tx x={89} y={192} g={10.5} f={F.grau} w={700}>Maßzahl</Tx>
          <Tx x={157} y={192} g={10.5} f={F.grau} w={700}>Einheit</Tx>
          <Tx x={226} y={152} g={11} f={F.grau} w={700} a="start">{`geschätzt: ${G} cm`}</Tx>
          <Tx x={226} y={171} g={11} f={F.granat} w={800} a="start">{`gemessen: ${L} cm`}</Tx>
          <Tx x={226} y={190} g={10.5} f={F.goldDunkel} w={700} a="start">{`Unterschied: ${L - G} cm`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_schritte – Schätzen mit Stützvorstellung: Schritte im Klassenzimmer
   p: { schritte: 10, cm: 70 }
   ============================================================ */
const g_schritte = {
  h: 182,
  label: (p) => `${p.schritte} Schritte zu je ${p.cm} cm`,
  ablauf: (p) => [
    { k: "raum", ms: 800, text: "Wie lang ist das Klassenzimmer? Schätzen mit Schritten." },
    { k: "gehen", ms: 2600, text: `Von Wand zu Wand: ${p.schritte} Schritte.` },
    { k: "schritt", ms: 1200, text: `Ein Schritt ist etwa ${p.cm} cm lang.` },
    { k: "rechnen", ms: 1700, text: `${p.schritte} · ${p.cm} cm = ${de(p.schritte * p.cm)} cm = ${de((p.schritte * p.cm) / 100)} m. Das Zimmer ist etwa ${de((p.schritte * p.cm) / 100)} m lang.` },
  ],
  bild: ({ Z, z, p }) => {
    const n = p.schritte, x0 = 30, x1 = 330, sw = (x1 - x0) / n, ur = Z("raum"), ug = z("gehen"), us = Z("schritt"), uq = Z("rechnen");
    const k = Math.min(n, Math.floor(ug * n + 0.0001));
    const m = de((n * p.cm) / 100);
    return (
      <>
        <g opacity={ur}>
          <rect x={x0 - 8} y={62} width={8} height={52} rx="2" fill={F.linie} />
          <rect x={x1} y={62} width={8} height={52} rx="2" fill={F.linie} />
          <line x1={x0 - 8} y1={114} x2={x1 + 8} y2={114} stroke={F.tinte} strokeWidth="1.8" />
        </g>
        {Array.from({ length: n }, (_, i) => {
          const o = klemm(ug * n - i);
          if (o <= 0) return null;
          const cx = x0 + sw * i + sw / 2, cy = i % 2 ? 100 : 86;
          return (
            <g key={i} opacity={o} transform={`translate(${n1(cx)} ${cy}) scale(${0.6 + 0.4 * raus(o)})`}>
              <ellipse cx={-2} cy={0} rx={8} ry={4.6} fill={F.granat} opacity="0.85" />
              <circle cx={8.5} cy={-2.6} r={1.7} fill={F.granat} opacity="0.85" />
              <circle cx={9.2} cy={1} r={1.5} fill={F.granat} opacity="0.85" />
            </g>
          );
        })}
        <Pille x={x0 - 8} y={30} a="start" text={`Schritte: ${k}`} g={12} f={F.granatHell} tf={F.granat} o={klemm(ug * 6)} />
        <g opacity={us}>
          <Klammer x1={x0} x2={x0 + sw} y={120} f={F.gold} />
          <Tx x={x0 + sw / 2 + 4} y={142} g={11} f={F.goldDunkel} w={800} a="start">{`≈ ${p.cm} cm`}</Tx>
        </g>
        <g opacity={uq}>
          <Strich x1={x0} y1={50} x2={x1} y2={50} u={1} f={F.blau} b={1.6} />
          <Spitze x={x1} y={50} f={F.blau} g={7} />
          <Spitze x={x0} y={50} winkel={180} f={F.blau} g={7} />
          <Pille x={(x0 + x1) / 2} y={54} text={`etwa ${m} m`} g={12} f={F.blauHell} tf={F.blau} />
        </g>
        <Tippen x={B / 2} y={170} g={13.5} f={F.granat} w={800} u={uq} text={`${n} · ${p.cm} cm = ${de(n * p.cm)} cm = ${m} m`} />
      </>
    );
  },
};

/* ============================================================
   g_treppe – Einheitentreppe: Die Maßzahl hüpft Stufe für Stufe (· Faktor abwärts, : Faktor aufwärts)
   p: { stufen: ["km","m","dm","cm","mm"], faktor: [1000,10,10,10], wert: 3, von: 0, bis: 3, t0?, schluss? }
   ============================================================ */
function treppenWerte(p) {
  const v = []; v[p.von] = p.wert;
  for (let i = p.von; i < p.stufen.length - 1; i++) v[i + 1] = Math.round(v[i] * p.faktor[i] * 1e6) / 1e6;
  for (let i = p.von; i > 0; i--) v[i - 1] = Math.round((v[i] / p.faktor[i - 1]) * 1e6) / 1e6;
  return v;
}
const g_treppe = {
  h: 214,
  label: (p) => { const v = treppenWerte(p); return `${zahl(v[p.von])} ${p.stufen[p.von]} = ${zahl(v[p.bis])} ${p.stufen[p.bis]}`; },
  ablauf: (p) => {
    const v = treppenWerte(p), runter = p.bis > p.von, d = runter ? 1 : -1;
    const ab = [{ k: "stufen", ms: 1000, text: p.t0 || (runter ? "Die Einheitentreppe: Nach unten werden die Einheiten kleiner – also mal." : "Die Einheitentreppe: Nach oben werden die Einheiten größer – also geteilt.") }];
    for (let i = p.von; i !== p.bis; i += d) {
      const j = i + d, f = p.faktor[Math.min(i, j)];
      ab.push({ k: `h${i}`, ms: 1150, text: `${zahl(v[i])} ${p.stufen[i]} ${runter ? "·" : ":"} ${de(f)} = ${zahl(v[j])} ${p.stufen[j]}` });
    }
    ab.push({ k: "schluss", ms: 1500, text: p.schluss || `${zahl(v[p.von])} ${p.stufen[p.von]} = ${zahl(v[p.bis])} ${p.stufen[p.bis]}` });
    return ab;
  },
  bild: ({ Z, z, p }) => {
    const h = 214, n = p.stufen.length, v = treppenWerte(p), runter = p.bis > p.von, d = runter ? 1 : -1;
    const sw = (B - 28) / n, dh = Math.min(30, (h - 104) / (n - 1));
    const xs = (i) => 14 + i * sw, ys = (i) => 40 + i * dh, cx = (i) => xs(i) + (sw - 3) / 2;
    const lo = Math.min(p.von, p.bis), hi = Math.max(p.von, p.bis);
    const erreicht = (i) => i === p.von ? z("stufen") > 0.5 : (i >= lo && i <= hi && z(`h${i - d}`) > 0.7);
    const us = Z("stufen"), uq = Z("schluss");
    let mark = null;
    for (let i = p.von; i !== p.bis; i += d) {
      const u = z(`h${i}`), j = i + d;
      if (u > 0 && u < 1) {
        const k = sanft(u), a = [cx(i), ys(i) - 6], b = [cx(j), ys(j) - 6], c = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 30];
        mark = [(1 - k) * (1 - k) * a[0] + 2 * (1 - k) * k * c[0] + k * k * b[0], (1 - k) * (1 - k) * a[1] + 2 * (1 - k) * k * c[1] + k * k * b[1]];
      }
    }
    return (
      <>
        {p.stufen.map((e, i) => {
          const o = staffel(us, i, n, 0.6), an = erreicht(i), aktiv = i >= lo && i <= hi;
          const ui = i === p.von ? z("stufen") : z(`h${i - d}`);
          return (
            <g key={i} opacity={o}>
              <rect x={xs(i)} y={ys(i)} width={sw - 3} height={h - 8 - ys(i)} rx="8" fill={an ? F.granatHell : F.flaeche} />
              <Tx x={cx(i)} y={ys(i) + 19} g={n > 6 ? 12 : 13} f={an ? F.granat : aktiv ? F.tinte : F.hell} w={800}>{e}</Tx>
              {an && <Tx x={cx(i)} y={ys(i) + 39} g={n > 6 ? 10.5 : 11.5} f={F.tinte} w={800} opacity={i === p.von ? 1 : teil(ui, 0.7, 1)}>{zahl(v[i])}</Tx>}
              {i !== p.von && aktiv && <Puls x={cx(i)} y={ys(i) + 34} u={teil(ui, 0.7, 1)} r={16} />}
            </g>
          );
        })}
        {p.faktor.map((f, i) => {
          const zw = runter ? i : i + 1, akt = i >= lo && i < hi, u = akt ? z(`h${zw}`) : 0;
          return (
            <Tx key={i} x={xs(i + 1) + 4} y={ys(i) + Math.min(14, dh - 4)} g={10} a="start" w={800}
              f={u > 0.2 ? F.goldDunkel : F.hell} opacity={staffel(us, i + 1, n, 0.6)}>{`${u > 0.2 && !runter ? ":" : "·"} ${de(f)}`}</Tx>
          );
        })}
        {mark && <circle cx={mark[0]} cy={mark[1]} r={6} fill={F.gold} stroke={F.weiss} strokeWidth="2" />}
        <g opacity={uq} transform={`translate(0 ${(1 - uq) * -6})`}>
          <Tx x={B - 14} y={24} g={14} f={F.granat} w={800} a="end">{`${zahl(v[p.von])} ${p.stufen[p.von]} = ${zahl(v[p.bis])} ${p.stufen[p.bis]}`}</Tx>
          <Tx x={B - 14} y={42} g={10.5} f={F.grau} w={700} a="end">{runter ? "kleinere Einheit → größere Maßzahl" : "größere Einheit → kleinere Maßzahl"}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_kommatafel – Größe mit Komma: Ziffern fallen in die Einheiten-Tafel, Lücke wird 0, Komma kommt
   p: { kopf: ["m","dm","cm"], gruppen?: [{ e, von, bis }], ziffern: ["5","0","8"],
        quelle: [{ t: "5 m", sp: [0] }, …], nullen: [1], komma: 0, ergebnis, warnung?, t: { tafel, q: [...], null, komma } }
   ============================================================ */
const g_kommatafel = {
  h: 206,
  label: (p) => p.ergebnis,
  ablauf: (p) => [
    { k: "tafel", ms: 900, text: p.t.tafel },
    ...p.quelle.map((q, i) => ({ k: `q${i}`, ms: 1200, text: p.t.q[i] })),
    { k: "null", ms: 1100, text: p.t.null },
    { k: "komma", ms: 1100, text: p.t.komma },
    { k: "ergebnis", ms: 1500, text: p.t.ergebnis || p.ergebnis },
  ],
  bild: ({ Z, z, p }) => {
    const n = p.kopf.length, w = p.w || 54, x0 = (B - n * w) / 2, cxs = (i) => x0 + i * w + w / 2;
    const ut = Z("tafel"), un = Z("null"), uk = Z("komma"), ue = Z("ergebnis");
    const yk = p.gruppen ? 62 : 56;
    return (
      <>
        {p.gruppen && p.gruppen.map((g, i) => (
          <g key={i} opacity={ut}>
            <path d={`M${x0 + g.von * w + 5} ${yk - 4} v-5 H${x0 + (g.bis + 1) * w - 5} v5`} fill="none" stroke={F.blau} strokeWidth="1.6" strokeLinecap="round" />
            <Tx x={(x0 + g.von * w + x0 + (g.bis + 1) * w) / 2} y={yk - 13} g={11} f={F.blau} w={800}>{g.e}</Tx>
          </g>
        ))}
        {p.kopf.map((k, i) => {
          const o = staffel(ut, i, n, 0.6), nul = p.nullen.includes(i);
          return (
            <g key={i} opacity={o}>
              <rect x={x0 + i * w + 1.5} y={yk} width={w - 3} height={22} rx="6" fill={F.flaeche} />
              <Tx x={cxs(i)} y={yk + 15.5} g={11} f={F.grau} w={800}>{k}</Tx>
              <rect x={x0 + i * w + 1.5} y={yk + 26} width={w - 3} height={46} rx="8" fill={nul && un > 0.3 ? F.goldHell : F.weiss} stroke={F.linie} strokeWidth="1.3" />
            </g>
          );
        })}
        {p.quelle.map((q, i) => {
          const u = z(`q${i}`), qx = q.sp.reduce((s, c) => s + cxs(c), 0) / q.sp.length;
          const ziff = q.sp.map((c) => p.ziffern[c]);
          return (
            <g key={i}>
              <Pille x={qx} y={24} text={q.t} g={13} f={F.granatHell} tf={F.granat} o={ut * (1 - 0.55 * teil(u, 0.6, 1))} />
              {u > 0 && ziff.map((d, j) => {
                const k = sanft(teil(u, 0.1, 0.85)), sx = qx + (j - (ziff.length - 1) / 2) * 10, ex = cxs(q.sp[j]);
                return <Tx key={j} x={mix(sx, ex, k)} y={mix(24, yk + 58, k)} g={mix(13, 24, k)} f={F.tinte} w={800}>{d}</Tx>;
              })}
            </g>
          );
        })}
        {p.nullen.map((c) => (
          <g key={c}>
            <Tx x={cxs(c)} y={yk + 58} g={24} f={F.goldDunkel} w={800} opacity={teil(un, 0.25, 0.7)}>{p.ziffern[c]}</Tx>
            <Puls x={cxs(c)} y={yk + 50} u={teil(un, 0.25, 1)} r={18} />
          </g>
        ))}
        {uk > 0 && (
          <g>
            <line x1={x0 + (p.komma + 1) * w} y1={yk - 2} x2={x0 + (p.komma + 1) * w} y2={yk + 76} stroke={F.granat} strokeWidth="1.6" strokeDasharray="3 3" opacity={uk} />
            <g opacity={klemm(uk * 3)} transform={`translate(${n1(x0 + (p.komma + 1) * w)} ${n1(mix(yk + 20, yk + 64, raus(uk)))})`}>
              <circle cx={0} cy={-3} r={4.2} fill={F.granat} />
              <path d="M2.6 -1 Q2.4 6 -3 10" fill="none" stroke={F.granat} strokeWidth="2.8" strokeLinecap="round" />
            </g>
          </g>
        )}
        <Tippen x={B / 2} y={yk + 108} g={16} f={F.granat} w={800} u={teil(ue, 0, 0.7)} text={p.ergebnis} />
        {p.warnung && <Pille x={B / 2} y={yk + 136} text={p.warnung} g={11} f={F.blauHell} tf={F.blau} o={teil(ue, 0.6, 1)} />}
      </>
    );
  },
};

/* ============================================================
   g_balken – Größen addieren und subtrahieren: erst gleiche Einheit, dann Streifen aneinander / nebeneinander
   p: { a: { roh, w }, b: { roh, w }, e: "g", summe: "4.150 g = 4,15 kg", diff: "450 g", t?: {...} }
   ============================================================ */
const g_balken = {
  h: 206,
  label: (p) => `${p.a.roh} und ${p.b.roh}: zusammen ${p.summe}, Unterschied ${p.diff}`,
  ablauf: (p) => [
    { k: "karten", ms: 1000, text: `${p.a.roh} und ${p.b.roh} – zwei verschiedene Schreibweisen.` },
    { k: "umrechnen", ms: 1400, text: `Erst in dieselbe Einheit: ${de(p.a.w)} ${p.e} und ${de(p.b.w)} ${p.e}.` },
    { k: "balken", ms: 900, text: "Jede Masse als Streifen gezeichnet." },
    { k: "summe", ms: 1600, text: `Zusammen: ${de(p.a.w)} ${p.e} + ${de(p.b.w)} ${p.e} = ${p.summe}.` },
    { k: "diff", ms: 1600, text: `Unterschied: ${de(p.a.w)} ${p.e} − ${de(p.b.w)} ${p.e} = ${p.diff}.` },
  ],
  bild: ({ Z, p }) => {
    const s = 290 / (p.a.w + p.b.w), x0 = 35, wa = p.a.w * s, wb = p.b.w * s;
    const uk = Z("karten"), uu = Z("umrechnen"), ub = Z("balken"), us = Z("summe"), ud = Z("diff");
    const bx = mix(x0, x0 + wa, us), by = mix(96, 60, us);
    const karte = (cx, roh, neu, f, tf) => (
      <g opacity={uk}>
        <rect x={cx - 64} y={12} width={128} height={30} rx="15" fill={f} />
        <g transform={`translate(0 27) scale(1 ${n1(Math.abs(Math.cos(Math.PI * uu)))}) translate(0 -27)`}>
          <Tx x={cx} y={32} g={13} f={tf} w={800}>{uu < 0.5 ? roh : neu}</Tx>
        </g>
      </g>
    );
    const balken = (x, y, w, f, t, o) => (
      <g opacity={o}>
        <rect x={x} y={y} width={w} height={22} rx="5" fill={f} />
        <Tx x={x + w / 2} y={y + 15} g={11} f={F.weiss} w={800}>{t}</Tx>
      </g>
    );
    return (
      <>
        {karte(100, p.a.roh, `${de(p.a.w)} ${p.e}`, F.granatHell, F.granat)}
        {karte(260, p.b.roh, `${de(p.b.w)} ${p.e}`, F.blauHell, F.blau)}
        <g transform={`translate(0 ${(1 - ub) * 8})`}>
          {balken(x0, 60, wa * ub, F.granat, `${de(p.a.w)} ${p.e}`, ub)}
          {balken(bx, by, wb * ub, F.blau, `${de(p.b.w)} ${p.e}`, ub)}
        </g>
        <g opacity={teil(us, 0.6, 1)}>
          <Klammer x1={x0} x2={x0 + wa + wb} y={88} f={F.granat} />
          <Tx x={x0 + (wa + wb) / 2} y={112} g={12.5} f={F.granat} w={800}>{`zusammen: ${p.summe}`}</Tx>
        </g>
        <g opacity={ud} transform={`translate(0 ${(1 - ud) * -10})`}>
          {balken(x0, 130, wa, F.granat, `${de(p.a.w)} ${p.e}`, 1)}
          {balken(x0, 156, wb, F.blau, `${de(p.b.w)} ${p.e}`, 1)}
          <rect x={x0 + wb} y={156} width={(wa - wb) * teil(ud, 0.4, 1)} height={22} rx="4" fill={F.gold} />
          <line x1={x0 + wa} y1={130} x2={x0 + wa} y2={180} stroke={F.goldDunkel} strokeWidth="1.4" strokeDasharray="3 3" />
          <Tx x={x0 + wb + (wa - wb) / 2} y={197} g={11.5} f={F.goldDunkel} w={800} opacity={teil(ud, 0.6, 1)}>{`Unterschied: ${p.diff}`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_zeitspanne – Zeitspanne auf dem Zeitstrahl: bis zur vollen Stunde, ganze Stunden, Rest
   p: { von: [9, 45], bis: [11, 20] }
   ============================================================ */
const uhr = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
const dauer = (m) => { const h = Math.floor(m / 60), r = m % 60; return [h ? `${h} h` : "", r ? `${r} min` : ""].filter(Boolean).join(" "); };
function zeitSpruenge(p) {
  const m0 = p.von[0] * 60 + p.von[1], m1 = p.bis[0] * 60 + p.bis[1];
  const h0 = Math.ceil(m0 / 60) * 60, h1 = Math.floor(m1 / 60) * 60;
  const s = [];
  if (h0 > m0 && h0 <= m1) s.push([m0, h0]);
  if (h1 > Math.max(h0, m0)) s.push([Math.max(h0, m0), h1]);
  const letzt = s.length ? s[s.length - 1][1] : m0;
  if (m1 > letzt) s.push([letzt, m1]);
  return { m0, m1, s };
}
const g_zeitspanne = {
  h: 208,
  label: (p) => { const { m0, m1 } = zeitSpruenge(p); return `Von ${uhr(m0)} Uhr bis ${uhr(m1)} Uhr: ${dauer(m1 - m0)}`; },
  ablauf: (p) => {
    const { m0, m1, s } = zeitSpruenge(p);
    return [
      { k: "achse", ms: 1000, text: `Von ${uhr(m0)} Uhr bis ${uhr(m1)} Uhr – wie lange ist das?` },
      ...s.map(([a, b], i) => ({ k: `s${i}`, ms: 1100, text: b % 60 === 0 && a % 60 !== 0 ? `Bis zur vollen Stunde: ${dauer(b - a)}.` : a % 60 === 0 && b % 60 === 0 ? `Dann ${dauer(b - a)} bis ${uhr(b)} Uhr.` : `Noch ${dauer(b - a)} bis ${uhr(b)} Uhr.` })),
      { k: "summe", ms: 1500, text: `Zusammen: ${s.map(([a, b]) => dauer(b - a)).join(" + ")} = ${dauer(m1 - m0)}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const { m0, m1, s } = zeitSpruenge(p);
    const a0 = Math.floor((m0 - 10) / 15) * 15, a1 = Math.ceil((m1 + 10) / 15) * 15, y = 116;
    const X = (m) => 30 + ((m - a0) / (a1 - a0)) * 300;
    const ua = Z("achse"), uq = Z("summe");
    const ticks = []; for (let m = a0; m <= a1; m += 15) ticks.push(m);
    return (
      <>
        <g opacity={ua}>
          <line x1={20} y1={y} x2={340} y2={y} stroke={F.tinte} strokeWidth="1.6" />
          <Spitze x={346} y={y} f={F.tinte} g={7} />
          {ticks.map((m) => (
            <g key={m}>
              <line x1={X(m)} y1={y - (m % 60 ? 4 : 7)} x2={X(m)} y2={y + (m % 60 ? 4 : 7)} stroke={F.tinte} strokeWidth={m % 60 ? 1 : 1.6} />
              {m % 60 === 0 && <Tx x={X(m)} y={y + 22} g={10.5} f={F.grau} w={700}>{uhr(m)}</Tx>}
            </g>
          ))}
        </g>
        {[m0, m1].map((m, i) => (
          <g key={i} opacity={ua}>
            <circle cx={X(m)} cy={y} r={5} fill={F.granat} />
            <line x1={X(m)} y1={y + 6} x2={X(m)} y2={y + 34} stroke={F.granat} strokeWidth="1.2" strokeDasharray="2 2" />
            <Pille x={X(m)} y={y + 50} text={`${uhr(m)} Uhr`} g={11} f={F.granat} tf={F.weiss} />
          </g>
        ))}
        {s.map(([a, b], i) => {
          const hoch = Math.min(46, 16 + (X(b) - X(a)) * 0.2);
          return <Sprung key={i} xa={X(a)} xb={X(b)} y={y - 2} hoch={hoch} u={z(`s${i}`)} f={i % 2 ? F.blau : F.gold} bf={i % 2 ? F.blau : F.goldDunkel} beschriftung={dauer(b - a)} />;
        })}
        <Tippen x={B / 2} y={30} g={14} f={F.granat} w={800} u={uq} text={`${s.map(([a, b]) => dauer(b - a)).join(" + ")} = ${dauer(m1 - m0)}`} />
      </>
    );
  },
};

/* ============================================================
   g_massstab – Jeder Zentimeter der Karte wird zu einer Strecke in Wirklichkeit
   p: { n: 25000, cm: 6 }
   ============================================================ */
const g_massstab = {
  h: 194,
  label: (p) => `Maßstab 1 : ${de(p.n)}: ${p.cm} cm auf der Karte`,
  ablauf: (p) => {
    const per = p.n / 100, tot = per * p.cm;
    return [
      { k: "karte", ms: 1100, text: `Auf der Karte (Maßstab 1 : ${de(p.n)}) liegen A und B ${p.cm} cm auseinander.` },
      { k: "eins", ms: 1500, text: `1 cm auf der Karte sind ${de(p.n)} cm in Wirklichkeit – das sind ${de(per)} m.` },
      { k: "steine", ms: 1900, text: `Jeder Zentimeter der Karte wird zu ${de(per)} m.` },
      { k: "summe", ms: 1600, text: `${p.cm} · ${de(per)} m = ${de(tot)} m${tot >= 1000 ? ` = ${de(tot / 1000)} km` : ""}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const per = p.n / 100, tot = per * p.cm, sw = 300 / p.cm, X = (i) => 30 + i * sw;
    const uk = Z("karte"), ue = Z("eins"), ust = z("steine"), uq = Z("summe");
    return (
      <>
        <g opacity={uk}>
          <rect x={14} y={8} width={332} height={84} rx="12" fill={F.flaeche} />
          <path d="M14 78 C 90 60, 120 92, 190 70 S 300 40, 346 52" fill="none" stroke={F.blauHell} strokeWidth="9" strokeLinecap="round" />
          <ellipse cx={262} cy={74} rx={30} ry={10} fill={F.gruenHell} />
          <ellipse cx={92} cy={22} rx={26} ry={8} fill={F.gruenHell} />
          <line x1={X(0)} y1={40} x2={X(p.cm)} y2={40} stroke={F.tinte} strokeWidth="1.6" strokeDasharray="5 4" />
          {[["A", X(0)], ["B", X(p.cm)]].map(([t, x]) => (
            <g key={t}><circle cx={x} cy={40} r={5.5} fill={F.granat} stroke={F.weiss} strokeWidth="2" /><Tx x={x} y={28} g={12} f={F.granat} w={800}>{t}</Tx></g>
          ))}
          <Pille x={B / 2} y={27} text={`Maßstab 1 : ${de(p.n)}`} g={11} f={F.weiss} tf={F.tinte} />
          <rect x={X(0) - 6} y={52} width={X(p.cm) - X(0) + 12} height={22} rx="4" fill={F.weiss} stroke={F.hell} strokeWidth="1" />
          {Array.from({ length: p.cm * 2 + 1 }, (_, i) => <line key={i} x1={X(i / 2)} y1={52} x2={X(i / 2)} y2={52 + (i % 2 ? 5 : 9)} stroke={F.tinte} strokeWidth={i % 2 ? 0.8 : 1.2} />)}
          {Array.from({ length: p.cm + 1 }, (_, i) => <Tx key={i} x={X(i)} y={71} g={10} f={F.tinte} w={600}>{i}</Tx>)}
        </g>
        <rect x={X(0)} y={52} width={sw * ue} height={22} rx="3" fill={F.gold} opacity={0.35 * ue * (1 - teil(ust, 0.2, 0.6))} />
        {Array.from({ length: p.cm }, (_, i) => {
          const u = i === 0 ? teil(ue, 0.35, 1) : staffel(ust, i - 1, p.cm - 1, 0.45);
          if (u <= 0) return null;
          const k = raus(u), y = mix(56, 104, k);
          return (
            <g key={i} opacity={klemm(u * 2)}>
              <rect x={X(i) + 2} y={y} width={sw - 4} height={22} rx="5" fill={F.goldHell} stroke={F.gold} strokeWidth="1.2" />
              <Tx x={X(i) + sw / 2} y={y + 15} g={10} f={F.goldDunkel} w={800}>{`${de(per)} m`}</Tx>
            </g>
          );
        })}
        <Tx x={B / 2} y={158} g={12.5} f={F.tinte} w={700} opacity={ue * (1 - teil(uq, 0, 0.4))}>{`1 cm  →  ${de(p.n)} cm = ${de(per)} m`}</Tx>
        <g opacity={uq} transform={`translate(0 ${(1 - uq) * 6})`}>
          <Klammer x1={X(0)} x2={X(p.cm)} y={131} f={F.granat} o={1} />
          <rect x={B / 2 - 120} y={154} width={240} height={30} rx="12" fill={F.granatTief} />
          <Tx x={B / 2} y={174} g={13.5} f={F.goldHell} w={800}>{`${p.cm} · ${de(per)} m = ${de(tot)} m${tot >= 1000 ? ` = ${de(tot / 1000)} km` : ""}`}</Tx>
        </g>
      </>
    );
  },
};

/* ---------- Koordinatengitter ---------- */
function Gitter({ X, Y, x0, x1, y0, y1, o = 1, zahlen = true, yLinks = false, f = F.linie }) {
  if (o <= 0) return null;
  const xs = [], ys = [];
  for (let i = x0; i <= x1; i++) xs.push(i);
  for (let j = y0; j <= y1; j++) ys.push(j);
  return (
    <g opacity={o}>
      {xs.map((i) => <line key={"x" + i} x1={X(i)} y1={Y(y0)} x2={X(i)} y2={Y(y1)} stroke={f} strokeWidth="1" />)}
      {ys.map((j) => <line key={"y" + j} x1={X(x0)} y1={Y(j)} x2={X(x1)} y2={Y(j)} stroke={f} strokeWidth="1" />)}
      {y0 <= 0 && y1 >= 0 && <><line x1={X(x0) - 4} y1={Y(0)} x2={X(x1) + 10} y2={Y(0)} stroke={F.tinte} strokeWidth="1.5" /><Spitze x={X(x1) + 14} y={Y(0)} f={F.tinte} g={7} /></>}
      {x0 <= 0 && x1 >= 0 && <><line x1={X(0)} y1={Y(y0) + 4} x2={X(0)} y2={Y(y1) - 10} stroke={F.tinte} strokeWidth="1.5" /><Spitze x={X(0)} y={Y(y1) - 14} winkel={-90} f={F.tinte} g={7} /></>}
      {zahlen && xs.filter((i) => i !== 0).map((i) => <Tx key={"zx" + i} x={X(i)} y={Y(Math.max(y0, 0)) + 14} g={10} f={F.grau} w={600}>{de(i)}</Tx>)}
      {zahlen && ys.filter((j) => j !== 0).map((j) => <Tx key={"zy" + j} x={(yLinks ? X(x0) : X(Math.max(x0, 0))) - 7} y={Y(j) + 3.5} g={10} f={F.grau} w={600} a="end">{de(j)}</Tx>)}
      {zahlen && x0 <= 0 && y0 <= 0 && <Tx x={X(0) - 7} y={Y(0) + 14} g={10} f={F.grau} w={600} a="end">0</Tx>}
    </g>
  );
}
const koord = (x, y) => `(${de(x)} | ${de(y)})`;

/* ============================================================
   g_linien – Punkt, Strecke, Strahl, Gerade zeichnen sich nacheinander
   ============================================================ */
const g_linien = {
  h: 196,
  label: () => "Punkt, Strecke, Strahl und Gerade",
  ablauf: () => [
    { k: "punkt", ms: 1100, text: "Ein Punkt markiert nur eine Stelle. Er heißt A." },
    { k: "strecke", ms: 1500, text: "Die Strecke AB hat zwei Enden – man kann sie messen." },
    { k: "strahl", ms: 1600, text: "Der Strahl beginnt in A, läuft durch B und hört nie auf." },
    { k: "gerade", ms: 1700, text: "Die Gerade hat weder Anfang noch Ende. Wir sehen nur ein Stück davon." },
    { k: "fertig", ms: 1100, text: "Nur die Strecke hat eine Länge: |AB| = 5 cm." },
  ],
  bild: ({ Z, z }) => {
    const xa = 150, xb = 280, zeilen = [["Punkt", "eine Stelle"], ["Strecke", "zwei Enden"], ["Strahl", "ein Anfang"], ["Gerade", "ohne Ende"]];
    const k = ["punkt", "strecke", "strahl", "gerade"], y = (i) => 34 + i * 44;
    const P = ({ x, yy, t, o = 1 }) => <g opacity={o}><circle cx={x} cy={yy} r={4.5} fill={F.granat} /><Tx x={x} y={yy - 10} g={12} f={F.granat} w={800}>{t}</Tx></g>;
    const punkte = (i, an) => [3, 2, 1].map((d, j) => <circle key={j} cx={an + d * 6 * (an > 200 ? 1 : -1)} cy={y(i)} r={1.6} fill={F.tinte} opacity={0.25 * (j + 1)} />);
    const us = Z("strecke"), ur = Z("strahl"), ug = Z("gerade"), uf = Z("fertig");
    return (
      <>
        {zeilen.map(([n, d], i) => (
          <g key={n} opacity={teil(z(k[i]), 0, 0.3)}>
            <Tx x={16} y={y(i) - 1} g={13} f={F.tinte} w={800} a="start">{n}</Tx>
            <Tx x={16} y={y(i) + 13} g={10} f={F.grau} w={700} a="start">{d}</Tx>
          </g>
        ))}
        <P x={xa} yy={y(0)} t="A" o={Z("punkt", federnd)} />
        <Puls x={xa} y={y(0)} u={z("punkt")} r={12} />
        {/* Strecke */}
        <Strich x1={xa} y1={y(1)} x2={xb} y2={y(1)} u={teil(us, 0.2, 0.9)} b={2.2} />
        <P x={xa} yy={y(1)} t="A" o={teil(us, 0, 0.2)} /><P x={xb} yy={y(1)} t="B" o={teil(us, 0, 0.2)} />
        <g opacity={uf}><Pille x={xb + 14} y={y(1) + 4} a="start" text="5 cm" g={11} f={F.goldHell} tf={F.goldDunkel} /></g>
        {/* Strahl */}
        <Strich x1={xa} y1={y(2)} x2={330} y2={y(2)} u={teil(ur, 0.2, 0.85)} b={2.2} />
        <g opacity={teil(ur, 0.85, 1)}>{punkte(2, 334)}</g>
        <P x={xa} yy={y(2)} t="A" o={teil(ur, 0, 0.2)} /><P x={xb} yy={y(2)} t="B" o={teil(ur, 0, 0.2)} />
        {/* Gerade */}
        <Strich x1={215} y1={y(3)} x2={330} y2={y(3)} u={teil(ug, 0.2, 0.85)} b={2.2} />
        <Strich x1={215} y1={y(3)} x2={118} y2={y(3)} u={teil(ug, 0.2, 0.85)} b={2.2} />
        <g opacity={teil(ug, 0.85, 1)}>{punkte(3, 334)}{punkte(3, 114)}</g>
        <P x={xa} yy={y(3)} t="A" o={teil(ug, 0, 0.2)} /><P x={xb} yy={y(3)} t="B" o={teil(ug, 0, 0.2)} />
      </>
    );
  },
};

/* ============================================================
   g_lot – Senkrechte durch P mit dem Geodreieck, Lotfußpunkt F, Abstand
   ============================================================ */
function Geodreieck({ hyp, o = 1 }) {
  /* hyp: [[x1,y1],[x2,y2]] lange Kante; Spitze links von der Richtung (Seite mit positivem Normalenvektor) */
  if (o <= 0) return null;
  const [a, b] = hyp, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  const s = [mx + dy / 2, my - dx / 2], L = Math.hypot(dx, dy);
  const ticks = [];
  for (let i = 1; i < 20; i++) { const u = i / 20, x = mix(a[0], b[0], u), y = mix(a[1], b[1], u), l = i % 2 ? 4 : 7; ticks.push(<line key={i} x1={x} y1={y} x2={x + (dy / L) * l} y2={y - (dx / L) * l} stroke={F.blau} strokeWidth="0.8" />); }
  return (
    <g opacity={o}>
      <polygon points={pts([a, b, s])} fill={F.blauHell} fillOpacity="0.55" stroke={F.blau} strokeWidth="1.4" strokeLinejoin="round" />
      <line x1={mx} y1={my} x2={s[0]} y2={s[1]} stroke={F.blau} strokeWidth="1" strokeDasharray="3 3" />
      {ticks}
    </g>
  );
}
const g_lot = {
  h: 200,
  label: () => "Senkrechte durch P zur Geraden g und Abstand",
  ablauf: () => [
    { k: "start", ms: 900, text: "Gegeben: die Gerade g und der Punkt P." },
    { k: "legen", ms: 1600, text: "Mittellinie des Geodreiecks auf g legen und verschieben, bis die Kante durch P geht." },
    { k: "zeichnen", ms: 1100, text: "An der Kante entlang zeichnen: die Senkrechte zu g." },
    { k: "winkel", ms: 1100, text: "Sie trifft g im Lotfußpunkt F – im rechten Winkel." },
    { k: "abstand", ms: 1500, text: "|PF| ist der Abstand von P zu g. Jeder schräge Weg ist länger." },
  ],
  bild: ({ Z }) => {
    const gy = 120, px = 214, py = 50, L = 156;
    const ul = Z("legen"), uz = Z("zeichnen"), uw = Z("winkel"), ua = Z("abstand"), us = Z("start");
    const xe = mix(70, px, ul);
    return (
      <>
        <g opacity={us}>
          <line x1={16} y1={gy} x2={344} y2={gy} stroke={F.tinte} strokeWidth="2" />
          <Tx x={334} y={gy - 8} g={13} f={F.tinte} w={800}>g</Tx>
        </g>
        <Geodreieck hyp={[[xe, gy - L / 2], [xe, gy + L / 2]]} o={teil(ul, 0, 0.15) * (1 - teil(uw, 0, 0.6))} />
        <Strich x1={px} y1={py} x2={px} y2={gy} u={uz} f={F.granat} b={2.4} />
        <RechterWinkel x={px} y={gy} w1={90} w2={180} r={16} o={uw} />
        <g opacity={uw}>
          <circle cx={px} cy={gy} r={4} fill={F.granat} />
          <Tx x={px + 10} y={gy + 18} g={12.5} f={F.granat} w={800}>F</Tx>
        </g>
        <g opacity={ua}>
          <line x1={px} y1={py} x2={300} y2={gy} stroke={F.hell} strokeWidth="1.6" strokeDasharray="5 4" />
          <Tx x={300} y={gy + 20} g={10.5} f={F.grau} w={700}>schräg: länger</Tx>
          <rect x={px - 92} y={(py + gy) / 2 - 12} width={80} height={22} rx="11" fill={F.goldHell} />
          <Tx x={px - 52} y={(py + gy) / 2 + 3} g={11} f={F.goldDunkel} w={800}>Abstand</Tx>
        </g>
        <g opacity={us}>
          <circle cx={px} cy={py} r={4.5} fill={F.granat} />
          <Tx x={px + 12} y={py + 4} g={13} f={F.granat} w={800} a="start">P</Tx>
        </g>
        <Tx x={px} y={180} g={14} f={F.granat} w={800} opacity={ua}>PF ⊥ g</Tx>
      </>
    );
  },
};

/* ============================================================
   g_parallel – Geodreieck gleitet am Lineal entlang, Parallele durch P, überall gleicher Abstand
   ============================================================ */
const g_parallel = {
  h: 200,
  label: () => "Parallele zu g durch P",
  ablauf: () => [
    { k: "start", ms: 900, text: "Gegeben: die Gerade g und der Punkt P." },
    { k: "anlegen", ms: 1000, text: "Lange Kante des Geodreiecks an g, das Lineal fest daneben." },
    { k: "schieben", ms: 1600, text: "Geodreieck am Lineal entlang schieben, bis die Kante durch P geht." },
    { k: "zeichnen", ms: 1100, text: "Linie ziehen: h ist parallel zu g." },
    { k: "abstand", ms: 1600, text: "Überall derselbe Abstand – g und h schneiden sich nie: g ∥ h." },
  ],
  bild: ({ Z }) => {
    const gy = 168, py = 74, px = 230, x0 = 70, L = 120;
    const us = Z("start"), ua = Z("anlegen"), uv = Z("schieben"), uz = Z("zeichnen"), ub = Z("abstand");
    const y = mix(gy, py, uv);
    return (
      <>
        <g opacity={us}>
          <line x1={16} y1={gy} x2={344} y2={gy} stroke={F.tinte} strokeWidth="2" />
          <Tx x={334} y={gy - 8} g={13} f={F.tinte} w={800}>g</Tx>
        </g>
        <g opacity={ua * (1 - teil(ub, 0, 0.5))}>
          <rect x={x0 - 14} y={12} width={14} height={180} rx="3" fill={F.flaeche} stroke={F.hell} strokeWidth="1.2" />
          {Array.from({ length: 17 }, (_, i) => <line key={i} x1={x0 - 14} y1={20 + i * 10} x2={x0 - 14 + (i % 2 ? 4 : 7)} y2={20 + i * 10} stroke={F.grau} strokeWidth="0.8" />)}
        </g>
        <g transform={`translate(0 ${(1 - ua) * 10})`}><Geodreieck hyp={[[x0, y], [x0 + L, y]]} o={ua * (1 - teil(ub, 0, 0.5))} /></g>
        <Strich x1={16} y1={py} x2={344} y2={py} u={uz} f={F.granat} b={2.2} />
        <Tx x={334} y={py - 8} g={13} f={F.granat} w={800} opacity={uz}>h</Tx>
        {[110, 200, 290].map((x, i) => (
          <g key={x} opacity={staffel(ub, i, 3, 0.5)}>
            <line x1={x} y1={py + 4} x2={x} y2={gy - 4} stroke={F.gold} strokeWidth="2" />
            <Spitze x={x} y={py + 3} winkel={-90} f={F.gold} g={6} />
            <Spitze x={x} y={gy - 3} winkel={90} f={F.gold} g={6} />
          </g>
        ))}
        <Pille x={250} y={(py + gy) / 2 + 4} text="gleicher Abstand" g={10.5} o={teil(ub, 0.6, 1)} />
        <g opacity={us}>
          <circle cx={px} cy={py} r={4.5} fill={F.granat} />
          <Tx x={px} y={py - 11} g={13} f={F.granat} w={800}>P</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_koordinaten – Punkte eintragen: erst nach rechts (x), dann nach oben (y)
   p: { punkte: [["A",1,1],…], gesucht?: ["D",1,4], fuellen?: true }
   ============================================================ */
const g_koordinaten = {
  h: 214,
  label: (p) => "Punkte im Koordinatensystem: " + p.punkte.map(([n, x, y]) => n + koord(x, y)).join(", "),
  ablauf: (p) => [
    { k: "achsen", ms: 900, text: "x-Achse nach rechts, y-Achse nach oben. Start im Ursprung O(0 | 0)." },
    ...p.punkte.map(([n, x, y], i) => ({ k: `p${i}`, ms: 1500, text: i === 0 ? `${n}${koord(x, y)}: erst ${x} nach rechts, dann ${y} nach oben.` : `${n}${koord(x, y)}: ${x} nach rechts, ${y} nach oben.` })),
    ...(p.gesucht ? [{ k: "gesucht", ms: 1500, text: `${p.gesucht[0]} muss über ${p.punkte[0][0]} liegen und auf der Höhe von ${p.punkte[p.punkte.length - 1][0]}: ${p.gesucht[0]}${koord(p.gesucht[1], p.gesucht[2])}.` }] : []),
    ...(p.fuellen ? [{ k: "fuellen", ms: 1200, text: "Fertig ist das Rechteck." }] : []),
  ],
  bild: ({ Z, z, p }) => {
    const s = 30, ox = 40, oy = 184, X = (v) => ox + v * s, Y = (v) => oy - v * s;
    const alle = p.gesucht ? [...p.punkte, p.gesucht] : p.punkte, n = p.punkte.length;
    const ua = Z("achsen"), uf = Z("fuellen"), ug = Z("gesucht");
    const sichtbar = alle.map((_, i) => (i < n ? z(`p${i}`) : ug));
    return (
      <>
        <Gitter X={X} Y={Y} x0={0} x1={6} y0={0} y1={5} o={ua} />
        <Tx x={X(6) + 14} y={Y(0) + 16} g={11} f={F.tinte} w={800} opacity={ua}>x</Tx>
        <Tx x={X(0) + 12} y={Y(5) - 10} g={11} f={F.tinte} w={800} opacity={ua}>y</Tx>
        {p.fuellen && <polygon points={pts(alle.map(([, x, y]) => [X(x), Y(y)]))} fill={F.granatHell} stroke={F.granat} strokeWidth="2" opacity={uf} strokeLinejoin="round" />}
        {alle.map(([nm, x, y], i) => {
          const u = sichtbar[i];
          if (u <= 0) return null;
          const gs = i === n;
          const ux = sanft(teil(u, 0.05, 0.5)), uy = sanft(teil(u, 0.5, 0.92));
          const cx = X(x * ux), cy = Y(y * uy), fertig = u >= 0.92;
          const alt = (i < n - 1 && z(`p${i + 1}`) > 0.2) || (i === n - 1 && p.gesucht && ug > 0.2) || uf > 0;
          const spur = alt ? 0.25 : 1;
          return (
            <g key={nm}>
              {gs ? (
                <g opacity={teil(u, 0, 0.6)}>
                  <line x1={X(alle[0][1])} y1={Y(alle[0][2])} x2={X(x)} y2={Y(y)} stroke={F.blau} strokeWidth="1.4" strokeDasharray="4 4" />
                  <line x1={X(alle[n - 1][1])} y1={Y(alle[n - 1][2])} x2={X(x)} y2={Y(y)} stroke={F.blau} strokeWidth="1.4" strokeDasharray="4 4" />
                </g>
              ) : (
                <g opacity={spur}>
                  <line x1={X(0)} y1={Y(0)} x2={X(x * ux)} y2={Y(0)} stroke={F.gold} strokeWidth="3.5" strokeLinecap="round" />
                  {uy > 0 && <line x1={X(x)} y1={Y(0)} x2={X(x)} y2={Y(y * uy)} stroke={F.blau} strokeWidth="3.5" strokeLinecap="round" />}
                  {!alt && <Tx x={X(x / 2)} y={Y(0) - 7} g={11} f={F.goldDunkel} w={800} opacity={teil(u, 0.3, 0.5)}>{`${x} →`}</Tx>}
                  {!alt && uy > 0 && <Tx x={X(x) + 8} y={Y(y / 2) + 4} g={11} f={F.blau} w={800} a="start" opacity={teil(u, 0.7, 0.9)}>{`${y} ↑`}</Tx>}
                </g>
              )}
              <circle cx={gs ? X(x) : cx} cy={gs ? Y(y) : cy} r={5.5} fill={gs ? F.blau : F.granat} stroke={F.weiss} strokeWidth="1.8" opacity={gs ? teil(u, 0.4, 0.8) : 1} />
              {(fertig || gs) && <Tx x={X(x) + (x >= 3 ? 10 : -10)} y={Y(y) - 8} g={12.5} f={gs ? F.blau : F.granat} w={800} a={x >= 3 ? "start" : "end"} opacity={gs ? teil(u, 0.6, 1) : teil(u, 0.92, 1)}>{nm}</Tx>}
              <Puls x={X(x)} y={Y(y)} u={gs ? teil(u, 0.5, 1) : teil(u, 0.9, 1)} r={12} />
            </g>
          );
        })}
        <g>
          {alle.map(([nm, x, y], i) => (
            <Tx key={nm} x={262} y={44 + i * 26} g={14} f={i === n ? F.blau : F.granat} w={800} a="start" opacity={i < n ? teil(sichtbar[i], 0.9, 1) : teil(ug, 0.6, 1)}>{nm + koord(x, y)}</Tx>
          ))}
          <g opacity={ua}>
            <rect x={252} y={160} width={98} height={40} rx="10" fill={F.flaeche} />
            <Tx x={301} y={176} g={10} f={F.goldDunkel} w={800}>erst x: rechts</Tx>
            <Tx x={301} y={192} g={10} f={F.blau} w={800}>dann y: hoch</Tx>
          </g>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_spiegeln – Achsenspiegelung an der y-Achse: Figur klappt um, Verbindungen senkrecht, Koordinaten
   p: { fig: [["A",1,1],["B",4,1],["C",2,3]] }
   ============================================================ */
const g_spiegeln = {
  h: 214,
  label: (p) => "Spiegeln an der y-Achse: " + p.fig.map(([n, x, y]) => `${n}${koord(x, y)} → ${n}′${koord(-x, y)}`).join(", "),
  ablauf: () => [
    { k: "figur", ms: 1000, text: "Das Dreieck ABC soll an der y-Achse gespiegelt werden." },
    { k: "klappen", ms: 1900, text: "Falten an der Achse: Das Dreieck klappt auf die andere Seite." },
    { k: "linien", ms: 1500, text: "Jeder Punkt und sein Bildpunkt: gleich weit von der Achse, Verbindung senkrecht." },
    { k: "koord", ms: 1700, text: "Die x-Koordinate wechselt das Vorzeichen, y bleibt gleich." },
  ],
  bild: ({ Z, p }) => {
    const s = 28, ox = 180, oy = 156, X = (v) => ox + v * s, Y = (v) => oy - v * s;
    const uf = Z("figur"), uk = Z("klappen"), ul = Z("linien"), uc = Z("koord");
    const sx = Math.cos(Math.PI * uk);
    const poly = pts(p.fig.map(([, x, y]) => [X(x), Y(y)]));
    const lift = Math.sin(Math.PI * uk) * 0.15;
    return (
      <>
        <Gitter X={X} Y={Y} x0={-5} x1={5} y0={0} y1={4} o={uf} yLinks />
        <line x1={X(0)} y1={Y(4) - 16} x2={X(0)} y2={Y(0)} stroke={F.gold} strokeWidth="3" opacity={uf} />
        <polygon points={poly} fill={F.granatHell} stroke={F.granat} strokeWidth="2" strokeLinejoin="round" opacity={uf} />
        {uk > 0 && (
          <g transform={`translate(${ox} 0) scale(${n1(sx)} 1) translate(${-ox} 0)`}>
            <polygon points={poly} fill={sx < 0 ? F.blauHell : F.granatHell} fillOpacity={0.85 - lift} stroke={sx < 0 ? F.blau : F.granat} strokeWidth="2" strokeLinejoin="round" />
          </g>
        )}
        {p.fig.map(([n, x, y]) => (
          <g key={n}>
            <g opacity={ul}>
              <line x1={X(x)} y1={Y(y)} x2={X(x) + (X(-x) - X(x)) * ul} y2={Y(y)} stroke={F.grau} strokeWidth="1.3" strokeDasharray="3 3" />
              <Marke a={[X(0), Y(y)]} b={[X(x), Y(y)]} n={1} f={F.goldDunkel} o={teil(ul, 0.6, 1)} />
              <Marke a={[X(0), Y(y)]} b={[X(-x), Y(y)]} n={1} f={F.goldDunkel} o={teil(ul, 0.6, 1)} />
            </g>
            <Tx x={X(x) + 8} y={Y(y) - 6} g={12} f={F.granat} w={800} a="start" opacity={uf}>{n}</Tx>
            <Tx x={X(-x) - 8} y={Y(y) - 6} g={12} f={F.blau} w={800} a="end" opacity={teil(uk, 0.85, 1)}>{n + "′"}</Tx>
          </g>
        ))}
        <RechterWinkel x={X(0)} y={Y(p.fig[2][2])} w1={0} w2={90} r={10} f={F.goldDunkel} o={teil(ul, 0.6, 1)} />
        <g opacity={uc}>
          {p.fig.map(([n, x, y], i) => (
            <Tx key={n} x={60 + i * 120} y={194} g={11.5} f={F.blau} w={800}>{`${n}′(${de(-x)} | ${de(y)})`}</Tx>
          ))}
          {p.fig.map(([n, x, y], i) => (
            <Tx key={"o" + n} x={60 + i * 120} y={210} g={10} f={F.grau} w={700}>{`aus ${n}${koord(x, y)}`}</Tx>
          ))}
        </g>
      </>
    );
  },
};

/* ============================================================
   g_drehung – Punktspiegelung = Drehung um 180° um Z
   p: { fig: [["P",2,5],["Q",1,3],["R",3,2]], z: [4,3], spur: "P", notiz: […] , selbst?: true }
   ============================================================ */
const g_drehung = {
  h: 214,
  label: (p) => p.selbst ? "Ein Parallelogramm fällt bei einer halben Drehung auf sich selbst" : `Punktspiegelung an Z${koord(p.z[0], p.z[1])}`,
  ablauf: (p) => p.selbst ? [
    { k: "figur", ms: 1000, text: "Ein Parallelogramm und der Schnittpunkt Z seiner Diagonalen." },
    { k: "drehen", ms: 2400, text: "Eine halbe Drehung um Z – 180°." },
    { k: "linien", ms: 1300, text: "Es fällt genau auf sich selbst: Jede Ecke landet auf der gegenüberliegenden." },
    { k: "koord", ms: 1500, text: "Das Parallelogramm ist punktsymmetrisch – aber nicht achsensymmetrisch." },
  ] : [
    { k: "figur", ms: 1000, text: `Das Dreieck soll am Punkt Z${koord(p.z[0], p.z[1])} gespiegelt werden.` },
    { k: "drehen", ms: 2400, text: "Punktspiegelung heißt: eine halbe Drehung um Z, also 180°." },
    { k: "linien", ms: 1500, text: "Jeder Punkt geht durch Z hindurch und gleich weit weiter." },
    { k: "koord", ms: 1700, text: (() => { const [, x, y] = p.fig[0], [zx, zy] = p.z; return `Von P nach Z: ${zx - x} rechts, ${y - zy} runter. Noch einmal so weit: P′${koord(2 * zx - x, 2 * zy - y)}.`; })() },
  ],
  bild: ({ Z, p }) => {
    const s = 24, ox = 26, oy = 190, X = (v) => ox + v * s, Y = (v) => oy - v * s;
    const [zx, zy] = p.z, uf = Z("figur"), ud = Z("drehen"), ul = Z("linien"), uc = Z("koord");
    const poly = pts(p.fig.map(([, x, y]) => [X(x), Y(y)]));
    const bild = p.fig.map(([n, x, y]) => [n + "′", 2 * zx - x, 2 * zy - y]);
    const [, px, py] = p.fig[0];
    return (
      <>
        <Gitter X={X} Y={Y} x0={0} x1={8} y0={0} y1={6} o={uf} />
        <polygon points={poly} fill={p.selbst ? F.flaeche : F.granatHell} stroke={p.selbst ? F.hell : F.granat} strokeWidth="2" strokeDasharray={p.selbst ? "4 3" : undefined} strokeLinejoin="round" opacity={uf} />
        {ud > 0 && (
          <g transform={`rotate(${n1(-180 * ud)} ${X(zx)} ${Y(zy)})`}>
            <polygon points={poly} fill={ud >= 1 ? F.blauHell : F.granatHell} fillOpacity="0.8" stroke={ud >= 1 ? F.blau : F.granat} strokeWidth="2" strokeLinejoin="round" />
          </g>
        )}
        {ud > 0 && ud < 1 && <path d={bogen(X(zx), Y(zy), 22, 90, 90 + 180 * ud)} fill="none" stroke={F.gold} strokeWidth="2.5" strokeLinecap="round" />}
        {!p.selbst && p.fig.map(([n, x, y]) => (
          <g key={n} opacity={ul}>
            <line x1={X(x)} y1={Y(y)} x2={X(x) + (X(2 * zx - x) - X(x)) * ul} y2={Y(y) + (Y(2 * zy - y) - Y(y)) * ul} stroke={F.grau} strokeWidth="1.2" strokeDasharray="3 3" />
          </g>
        ))}
        {!p.selbst && <><Marke a={[X(px), Y(py)]} b={[X(zx), Y(zy)]} n={2} f={F.goldDunkel} o={teil(ul, 0.6, 1)} /><Marke a={[X(zx), Y(zy)]} b={[X(2 * zx - px), Y(2 * zy - py)]} n={2} f={F.goldDunkel} o={teil(ul, 0.6, 1)} /></>}
        {p.selbst && p.fig.map(([n, x, y], i) => (
          <line key={n} x1={X(x)} y1={Y(y)} x2={X(2 * zx - x)} y2={Y(2 * zy - y)} stroke={F.gold} strokeWidth="1.4" strokeDasharray="4 3" opacity={i < 2 ? ul : 0} />
        ))}
        {p.fig.map(([n, x, y]) => <Tx key={n} x={X(x) + (x < zx ? -8 : 8)} y={Y(y) + (y > zy ? -6 : 14)} g={11.5} f={F.granat} w={800} a={x < zx ? "end" : "start"} opacity={uf}>{n}</Tx>)}
        {bild.map(([n, x, y]) => <Tx key={n} x={X(x) + (x < zx ? -8 : 8)} y={Y(y) + (y > zy ? -6 : 14)} g={11.5} f={F.blau} w={800} a={x < zx ? "end" : "start"} opacity={p.selbst ? 0 : teil(ud, 0.85, 1)}>{n}</Tx>)}
        <g opacity={uf}>
          <circle cx={X(zx)} cy={Y(zy)} r={4.5} fill={F.gold} stroke={F.tinte} strokeWidth="1.4" />
          <Tx x={X(zx) + 8} y={Y(zy) - 7} g={12} f={F.goldDunkel} w={800} a="start">Z</Tx>
        </g>
        <g opacity={uc}>
          {(p.notiz || []).map((t, i) => <Tx key={i} x={248} y={56 + i * 22} g={i === (p.notiz.length - 1) ? 12 : 10.5} f={i === p.notiz.length - 1 ? F.blau : F.tinte} w={800} a="start">{t}</Tx>)}
        </g>
      </>
    );
  },
};

/* ============================================================
   g_vierecke – Quadrat verformt sich nacheinander zu Rechteck, Raute, Parallelogramm, Trapez, Drachen
   ============================================================ */
const VIERECKE = [
  { n: "Quadrat", e: [[-45, 45], [45, 45], [45, -45], [-45, -45]], marke: [[0, 1], [1, 1], [2, 1], [3, 1]], rechte: [0, 1, 2, 3],
    achsen: [[[0, -62], [0, 62]], [[-62, 0], [62, 0]], [[-56, 56], [56, -56]], [[-56, -56], [56, 56]]],
    eig: ["4 gleich lange Seiten", "4 rechte Winkel", "4 Symmetrieachsen"], t: "Das Quadrat: vier gleich lange Seiten und vier rechte Winkel." },
  { n: "Rechteck", e: [[-68, 36], [68, 36], [68, -36], [-68, -36]], marke: [[0, 1], [1, 2], [2, 1], [3, 2]], rechte: [0, 1, 2, 3],
    achsen: [[[0, -52], [0, 52]], [[-82, 0], [82, 0]]],
    eig: ["Gegenseiten gleich lang", "4 rechte Winkel", "2 Symmetrieachsen"], t: "Seiten ziehen: ein Rechteck. Die rechten Winkel bleiben." },
  { n: "Raute", e: [[0, 52], [44, 0], [0, -52], [-44, 0]], marke: [[0, 1], [1, 1], [2, 1], [3, 1]], rechte: [], parallel: [[0, 1], [1, 2], [2, 1], [3, 2]],
    achsen: [[[0, -66], [0, 66]], [[-58, 0], [58, 0]]],
    eig: ["4 gleich lange Seiten", "Gegenseiten parallel", "2 Symmetrieachsen"], t: "Das Quadrat schräg gedrückt: eine Raute. Alle Seiten bleiben gleich lang." },
  { n: "Parallelogramm", e: [[-70, 36], [36, 36], [70, -36], [-36, -36]], marke: [[0, 1], [1, 2], [2, 1], [3, 2]], rechte: [], parallel: [[0, 1], [1, 2], [2, 1], [3, 2]], zentrum: true,
    eig: ["Gegenseiten parallel", "Gegenseiten gleich lang", "punktsymmetrisch"], t: "Das Parallelogramm: gegenüberliegende Seiten parallel und gleich lang." },
  { n: "Trapez", e: [[-70, 36], [70, 36], [34, -36], [-42, -36]], marke: [], rechte: [], parallel: [[0, 1], [2, 1]],
    eig: ["ein Paar paralleler Seiten", "sonst keine Bedingung"], t: "Das Trapez: nur noch ein Paar paralleler Seiten." },
  { n: "Drachen", e: [[-46, -12], [0, 58], [46, -12], [0, -40]], marke: [[0, 2], [1, 2], [2, 1], [3, 1]], rechte: [],
    achsen: [[[0, -56], [0, 72]]],
    eig: ["je 2 Nachbarseiten gleich", "1 Symmetrieachse"], t: "Der Drachen: zwei Paare gleich langer Nachbarseiten." },
];
const g_vierecke = {
  h: 222,
  label: () => "Besondere Vierecke: " + VIERECKE.map((v) => v.n).join(", "),
  ablauf: () => [
    { k: "m0", ms: 1500, text: VIERECKE[0].t },
    ...VIERECKE.slice(1).flatMap((v, i) => [{ k: `m${i + 1}`, ms: 900, text: v.t }, { k: `h${i + 1}`, ms: 700 }]),
    { k: "haus", ms: 1300, text: "Jedes Quadrat ist auch Rechteck, Raute, Parallelogramm und Trapez." },
  ],
  bild: ({ Z, z }) => {
    const cx = 92, cy = 92, N = VIERECKE.length;
    let pos = VIERECKE[0].e.map((p) => p.slice());
    for (let i = 1; i < N; i++) { const u = Z(`m${i}`); if (u > 0) pos = pos.map((p, j) => mixP(p, VIERECKE[i].e[j], u)); }
    let c = 0; for (let i = 1; i < N; i++) if (z(`m${i}`) >= 0.5) c = i;
    const v = VIERECKE[c], fertig = c === 0 ? Z("m0") : teil(z(`m${c}`), 0.75, 1) * 1;
    const welt = pos.map(([x, y]) => [cx + x, cy + y]), W = (q) => [cx + q[0], cy + q[1]];
    const kante = (i) => [welt[i], welt[(i + 1) % 4]];
    const uh = Z("haus");
    return (
      <>
        {(v.achsen || []).map(([a, b], i) => <line key={c + "a" + i} x1={W(a)[0]} y1={W(a)[1]} x2={W(b)[0]} y2={W(b)[1]} stroke={F.gold} strokeWidth="1.6" strokeDasharray="5 4" opacity={fertig} />)}
        <polygon points={pts(welt)} fill={F.granatHell} stroke={F.granat} strokeWidth="2.4" strokeLinejoin="round" opacity={Z("m0")} />
        {v.marke.map(([i, n]) => <Marke key={c + "m" + i} a={kante(i)[0]} b={kante(i)[1]} n={n} f={F.granat} o={fertig} />)}
        {(v.parallel || []).map(([i, n]) => { const [a, b] = kante(i), k = i >= 2; return <ParallelZeichen key={c + "p" + i} a={mixP(a, b, k ? 0.8 : 0.2)} b={mixP(a, b, k ? 0.6 : 0.4)} n={n} o={fertig} />; })}
        {v.rechte.map((i) => { const p = welt[i], a = welt[(i + 1) % 4], b = welt[(i + 3) % 4]; const w1 = (Math.atan2(-(a[1] - p[1]), a[0] - p[0]) * 180) / Math.PI, w2 = (Math.atan2(-(b[1] - p[1]), b[0] - p[0]) * 180) / Math.PI; let lo = Math.min(w1, w2), hi = Math.max(w1, w2); if (hi - lo > 180) { const t = lo; lo = hi; hi = t + 360; } return <RechterWinkel key={c + "r" + i} x={p[0]} y={p[1]} w1={lo} w2={hi} r={12} f={F.blau} o={fertig} />; })}
        {v.zentrum && <circle cx={cx} cy={cy} r={4} fill={F.gold} stroke={F.tinte} strokeWidth="1.2" opacity={fertig} />}
        <g opacity={fertig}>
          <Tx x={190} y={42} g={17} f={F.granat} w={800} a="start">{v.n}</Tx>
          {v.eig.map((t, i) => (
            <g key={c + t}>
              <circle cx={196} cy={66 + i * 24 - 4} r={3} fill={F.gold} />
              <Tx x={206} y={66 + i * 24} g={11} f={F.tinte} w={700} a="start">{t}</Tx>
            </g>
          ))}
        </g>
        {VIERECKE.map((q, i) => {
          const x = 30 + i * 60, an = i <= c, akt = i === c;
          const s = q.n === "Parallelogramm" ? 0.2 : 0.22;
          return (
            <g key={q.n} opacity={Z("m0") * (an ? 1 : 0.35)}>
              <polygon points={pts(q.e.map(([a, b]) => [x + a * s, 176 + b * s]))} fill={akt ? F.granat : an ? F.granatHell : F.flaeche} stroke={an ? F.granat : F.hell} strokeWidth="1.2" strokeLinejoin="round" />
              <Tx x={x} y={206} g={10} f={akt ? F.granat : F.grau} w={800}>{q.n === "Parallelogramm" ? "Parallelogr." : q.n}</Tx>
            </g>
          );
        })}
        <rect x={6} y={150} width={348} height={66} rx="12" fill="none" stroke={F.gold} strokeWidth="1.6" opacity={uh} />
      </>
    );
  },
};

/* ---------- 3D: Drahtmodelle mit Drehung, verdeckte Kanten gestrichelt ---------- */
function projiziere([x, y, z], phi, el) {
  const c = Math.cos(rad(phi)), s = Math.sin(rad(phi));
  const x1 = x * c - z * s, z1 = x * s + z * c;
  const ce = Math.cos(rad(el)), se = Math.sin(rad(el));
  return { x: x1, y: y * ce + z1 * se, d: y * se - z1 * ce };
}
/* Polyeder zeichnen: e = Ecken (Welt), fl = Flächen (Indizes, von außen gegen den Uhrzeigersinn gesehen) */
function Polyeder({ e, fl, phi, el = 22, cx, cy, s, f = F.granat, fuell = F.granatHell, o = 1, u = 1 }) {
  if (o <= 0) return null;
  const P = e.map((p) => projiziere(p, phi, el));
  const sx = (p) => cx + p.x * s, sy = (p) => cy - p.y * s;
  const sicht = fl.map((f2) => {
    const [a, b, c] = f2.map((i) => P[i]);
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 1e-9;
  });
  const kanten = new Map();
  fl.forEach((f2, k) => f2.forEach((i, j) => { const a = i, b = f2[(j + 1) % f2.length], key = a < b ? a + "-" + b : b + "-" + a; kanten.set(key, (kanten.get(key) || false) || sicht[k]); }));
  return (
    <g opacity={o}>
      {fl.map((f2, k) => sicht[k] && <polygon key={k} points={pts(f2.map((i) => [sx(P[i]), sy(P[i])]))} fill={fuell} fillOpacity={0.55} stroke="none" />)}
      {[...kanten].map(([key, vis]) => { const [a, b] = key.split("-").map(Number); return <line key={key} x1={sx(P[a])} y1={sy(P[a])} x2={sx(P[a]) + (sx(P[b]) - sx(P[a])) * u} y2={sy(P[a]) + (sy(P[b]) - sy(P[a])) * u} stroke={vis ? f : F.hell} strokeWidth={vis ? 1.8 : 1.3} strokeDasharray={vis ? undefined : "3 3"} strokeLinecap="round" />; })}
    </g>
  );
}
const KOERPER = (() => {
  const quader = { e: [[-0.8, -0.5, -0.5], [0.8, -0.5, -0.5], [0.8, -0.5, 0.5], [-0.8, -0.5, 0.5], [-0.8, 0.5, -0.5], [0.8, 0.5, -0.5], [0.8, 0.5, 0.5], [-0.8, 0.5, 0.5]],
    fl: [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]] };
  const tri = [0, 120, 240].map((w) => [0.62 * Math.cos(rad(w + 90)), 0.62 * Math.sin(rad(w + 90))]);
  const prisma = { e: [...tri.map(([a, b]) => [-0.8, b, a]), ...tri.map(([a, b]) => [0.8, b, a])], fl: [[0, 1, 2], [3, 5, 4], [0, 3, 4, 1], [1, 4, 5, 2], [2, 5, 3, 0]] };
  const pyramide = { e: [[-0.6, -0.5, -0.6], [0.6, -0.5, -0.6], [0.6, -0.5, 0.6], [-0.6, -0.5, 0.6], [0, 0.65, 0]], fl: [[0, 1, 2, 3], [0, 4, 1], [1, 4, 2], [2, 4, 3], [3, 4, 0]] };
  return { quader, prisma, pyramide };
})();
/* Drehkörper (Zylinder, Kegel, Kugel) als Ellipsen und Umrisse */
function Rund({ art, cx, cy, s, el = 22, phi = 0, o = 1, f = F.granat, fuell = F.granatHell }) {
  if (o <= 0) return null;
  const r = 0.62 * s, h = 1.1 * s, ry = r * Math.sin(rad(el)), hh = (h * Math.cos(rad(el))) / 2;
  const ell = (y, sicht) => (
    <g>
      <path d={`M${n1(cx - r)} ${n1(y)} A${n1(r)} ${n1(ry)} 0 0 0 ${n1(cx + r)} ${n1(y)}`} fill="none" stroke={f} strokeWidth="1.8" />
      <path d={`M${n1(cx - r)} ${n1(y)} A${n1(r)} ${n1(ry)} 0 0 1 ${n1(cx + r)} ${n1(y)}`} fill="none" stroke={sicht ? f : F.hell} strokeWidth={sicht ? 1.8 : 1.3} strokeDasharray={sicht ? undefined : "3 3"} />
    </g>
  );
  const naht = Math.sin(rad(phi)), nx = cx + r * Math.sin(rad(phi + 30)), vorn = Math.cos(rad(phi + 30)) > 0;
  if (art === "zylinder") return (
    <g opacity={o}>
      <path d={`M${n1(cx - r)} ${n1(cy - hh)} V${n1(cy + hh)} A${n1(r)} ${n1(ry)} 0 0 0 ${n1(cx + r)} ${n1(cy + hh)} V${n1(cy - hh)} A${n1(r)} ${n1(ry)} 0 0 1 ${n1(cx - r)} ${n1(cy - hh)} Z`} fill={fuell} fillOpacity="0.55" />
      <ellipse cx={cx} cy={cy - hh} rx={r} ry={ry} fill={fuell} stroke={f} strokeWidth="1.8" />
      <line x1={cx - r} y1={cy - hh} x2={cx - r} y2={cy + hh} stroke={f} strokeWidth="1.8" />
      <line x1={cx + r} y1={cy - hh} x2={cx + r} y2={cy + hh} stroke={f} strokeWidth="1.8" />
      {ell(cy + hh, false)}
      {vorn && <line x1={nx} y1={cy - hh + ry * Math.cos(rad(phi + 30))} x2={nx} y2={cy + hh + ry * Math.cos(rad(phi + 30))} stroke={F.rosa} strokeWidth="1.2" />}
    </g>
  );
  if (art === "kegel") {
    const sp = cy - hh - 4, tx = r * Math.sqrt(Math.max(0, 1 - Math.pow(ry / (cy + hh - sp), 2) * 0)), ty = cy + hh;
    return (
      <g opacity={o}>
        <path d={`M${n1(cx)} ${n1(sp)} L${n1(cx + tx)} ${n1(ty)} A${n1(r)} ${n1(ry)} 0 0 1 ${n1(cx - tx)} ${n1(ty)} Z`} fill={fuell} fillOpacity="0.55" stroke={f} strokeWidth="1.8" strokeLinejoin="round" />
        {ell(ty, false)}
        {vorn && <line x1={cx} y1={sp} x2={nx} y2={ty + ry * Math.cos(rad(phi + 30))} stroke={F.rosa} strokeWidth="1.2" />}
      </g>
    );
  }
  const R = 0.66 * s, rr = R * Math.sin(rad(el));
  return (
    <g opacity={o}>
      <circle cx={cx} cy={cy} r={R} fill={fuell} fillOpacity="0.55" stroke={f} strokeWidth="1.8" />
      <path d={`M${n1(cx - R)} ${n1(cy)} A${n1(R)} ${n1(rr)} 0 0 0 ${n1(cx + R)} ${n1(cy)}`} fill="none" stroke={f} strokeWidth="1.2" opacity="0.7" />
      <path d={`M${n1(cx - R)} ${n1(cy)} A${n1(R)} ${n1(rr)} 0 0 1 ${n1(cx + R)} ${n1(cy)}`} fill="none" stroke={F.hell} strokeWidth="1.1" strokeDasharray="3 3" />
      <ellipse cx={cx} cy={cy} rx={Math.abs(R * naht) + 0.01} ry={R} fill="none" stroke={F.rosa} strokeWidth="1.2" />
    </g>
  );
}
const KOERPER_LISTE = [
  { n: "Quader", k: "quader", z: "8 E · 12 K · 6 F", t: "Quader: 8 Ecken, 12 Kanten, 6 Rechtecke." },
  { n: "Prisma", k: "prisma", z: "6 E · 9 K · 5 F", t: "Dreiseitiges Prisma: zwei Dreiecke, dazwischen Rechtecke." },
  { n: "Pyramide", k: "pyramide", z: "5 E · 8 K · 5 F", t: "Pyramide: Grundfläche und Dreiecke, die sich in der Spitze treffen." },
  { n: "Zylinder", k: "zylinder", z: "2 Kreise + Mantel", t: "Zylinder: zwei Kreise und eine gebogene Mantelfläche." },
  { n: "Kegel", k: "kegel", z: "1 Kreis + Spitze", t: "Kegel: ein Kreis und eine Spitze." },
  { n: "Kugel", k: "kugel", z: "1 Fläche, gewölbt", t: "Kugel: nur eine gebogene Fläche – keine Ecken, keine Kanten." },
];
const g_koerper = {
  h: 230,
  label: () => "Körper: " + KOERPER_LISTE.map((k) => k.n).join(", "),
  ablauf: () => [
    ...KOERPER_LISTE.map((k, i) => ({ k: `k${i}`, ms: 1400, text: k.t })),
    { k: "euler", ms: 1600, text: "Bei Quader, Prisma und Pyramide gilt: Ecken + Flächen = Kanten + 2." },
  ],
  bild: ({ Z, z }) => {
    return (
      <>
        {KOERPER_LISTE.map((k, i) => {
          const sp = i % 3, ze = Math.floor(i / 3), cx = 60 + sp * 120, cy = 50 + ze * 96, u = z(`k${i}`), o = teil(u, 0, 0.25);
          const phi = 32 - 140 * (1 - sanft(u));
          const akt = u > 0 && u < 1;
          return (
            <g key={k.n}>
              {o > 0 && <rect x={cx - 56} y={cy - 44} width={112} height={92} rx="12" fill={akt ? F.goldHell : F.flaeche} opacity={o} />}
              {KOERPER[k.k] ? <Polyeder e={KOERPER[k.k].e} fl={KOERPER[k.k].fl} phi={phi} cx={cx} cy={cy - 6} s={30} o={o} />
                : <Rund art={k.k} cx={cx} cy={cy - 6} s={30} phi={phi} o={o} />}
              <Tx x={cx} y={cy + 32} g={11.5} f={F.granat} w={800} opacity={o}>{k.n}</Tx>
              <Tx x={cx} y={cy + 44} g={10} f={F.grau} w={700} opacity={teil(u, 0.5, 1)}>{k.z}</Tx>
            </g>
          );
        })}
        <Tippen x={B / 2} y={224} g={12} f={F.granat} w={800} u={Z("euler")} text="Quader: 8 + 6 = 12 + 2" />
      </>
    );
  },
};

/* ============================================================
   g_schraegbild – Schrägbild eines Quaders: Vorderseite echt, Tiefe schräg (45°) und halb so lang
   p: { a: 5, b: 3, c: 2 }  (a Länge, b Tiefe, c Höhe; in cm)
   ============================================================ */
const g_schraegbild = {
  h: 214,
  label: (p) => `Schrägbild eines Quaders ${p.a} cm × ${p.b} cm × ${p.c} cm`,
  ablauf: (p) => [
    { k: "vorn", ms: 1400, text: `Die Vorderseite in wahrer Größe: ${p.a} cm breit, ${p.c} cm hoch.` },
    { k: "tief", ms: 1500, text: `Die Tiefe ${p.b} cm schräg nach hinten (45°) und halb so lang: ${de(p.b / 2)} cm.` },
    { k: "hinten", ms: 1200, text: "Die hinteren Kanten verbinden – parallel zu den vorderen." },
    { k: "verdeckt", ms: 1200, text: "Verdeckte Kanten werden gestrichelt." },
    { k: "zaehlen", ms: 1500, text: "Ein Quader hat 8 Ecken, 12 Kanten und 6 Flächen." },
  ],
  bild: ({ Z, p }) => {
    const k = 26, x0 = 54, y0 = 176, A = p.a * k, C = p.c * k, D = (p.b / 2) * k * Math.SQRT1_2;
    const V = [[x0, y0], [x0 + A, y0], [x0 + A, y0 - C], [x0, y0 - C]];
    const H = V.map(([x, y]) => [x + D, y - D]);
    const uv = Z("vorn"), ut = Z("tief"), uh = Z("hinten"), ud = Z("verdeckt"), uz = Z("zaehlen");
    const L = (a, b, u, f = F.granat, dash) => u > 0 && <line x1={a[0]} y1={a[1]} x2={mix(a[0], b[0], u)} y2={mix(a[1], b[1], u)} stroke={f} strokeWidth="2.2" strokeLinecap="round" strokeDasharray={dash} />;
    return (
      <>
        {/* Kästchenpapier */}
        <g opacity={0.8}>
          {Array.from({ length: 13 }, (_, i) => <line key={"v" + i} x1={x0 - 26 + i * 13 * 2} y1={14} x2={x0 - 26 + i * 13 * 2} y2={200} stroke={F.linie} strokeWidth="0.8" />)}
          {Array.from({ length: 8 }, (_, j) => <line key={"h" + j} x1={20} y1={y0 - j * 26} x2={330} y2={y0 - j * 26} stroke={F.linie} strokeWidth="0.8" />)}
        </g>
        <polygon points={pts(V)} fill={F.granatHell} opacity={teil(uv, 0.7, 1) * 0.8} />
        {[0, 1, 2, 3].map((i) => <g key={i}>{L(V[i], V[(i + 1) % 4], staffel(uv, i, 4, 0.3))}</g>)}
        {[1, 2, 3].map((i) => <g key={"t" + i}>{L(V[i], H[i], ut, F.blau)}</g>)}
        {L(H[3], H[2], uh)}{L(H[2], H[1], uh)}
        {[[V[0], H[0]], [H[0], H[1]], [H[0], H[3]]].map(([a, b], i) => <g key={"d" + i}>{L(a, b, ud, F.hell, "4 4")}</g>)}
        <g opacity={teil(uv, 0.6, 1)}>
          <Tx x={x0 + A / 2} y={y0 + 18} g={11.5} f={F.granat} w={800}>{`${p.a} cm`}</Tx>
          <Tx x={x0 - 8} y={y0 - C / 2 + 4} g={11.5} f={F.granat} w={800} a="end">{`${p.c} cm`}</Tx>
        </g>
        <g opacity={teil(ut, 0.5, 1)}>
          <Tx x={x0 + A + D / 2 + 8} y={y0 - D / 2 + 4} g={11.5} f={F.blau} w={800} a="start">{`${de(p.b / 2)} cm`}</Tx>
          <path d={`M${x0 + A + 16} ${y0} A16 16 0 0 0 ${n1(x0 + A + 16 * Math.SQRT1_2)} ${n1(y0 - 16 * Math.SQRT1_2)}`} fill="none" stroke={F.blau} strokeWidth="1.4" />
          <Tx x={x0 + A + 20} y={y0 + 13} g={10} f={F.blau} w={700} a="start">45°</Tx>
          <Pille x={x0 + A + D + 6} y={y0 - C - D - 2} a="start" text="halb so lang" g={10} f={F.blauHell} tf={F.blau} />
        </g>
        <g opacity={uz}>
          {[...V, ...H].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3.2} fill={F.gold} stroke={F.tinte} strokeWidth="0.8" opacity={staffel(uz, i, 8, 0.5)} />)}
          <rect x={22} y={16} width={98} height={62} rx="10" fill={F.weiss} stroke={F.linie} />
          <Tx x={71} y={36} g={11} f={F.tinte} w={800}>8 Ecken</Tx>
          <Tx x={71} y={52} g={11} f={F.tinte} w={800}>12 Kanten</Tx>
          <Tx x={71} y={68} g={11} f={F.tinte} w={800}>6 Flächen</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_dreiecke – Die Spitze C wandert: Dreiecksarten nach Seiten und nach Winkeln
   ============================================================ */
const DREIECK_C = [
  { c: [89, 63.4], t: "Alle Seiten gleich lang, alle Winkel 60°: gleichseitig und spitzwinklig." },
  { c: [154, 72], t: "Ein Winkel ist genau 90°: rechtwinklig." },
  { c: [212, 122], t: "Ein Winkel ist größer als 90°: stumpfwinklig." },
  { c: [89, 30], t: "Zwei Seiten gleich lang: gleichschenklig – die Basiswinkel sind gleich." },
];
function dreieckInfo(A, Bp, C) {
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const w = (p, q, r) => { const a = [q[0] - p[0], q[1] - p[1]], b = [r[0] - p[0], r[1] - p[1]]; return (Math.acos((a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b))) * 180) / Math.PI; };
  const wA = w(A, Bp, C), wB = w(Bp, C, A), wC = 180 - wA - wB;
  const sa = d(Bp, C), sb = d(A, C), sc = d(A, Bp), gl = (x, y) => Math.abs(x - y) < 1.5;
  const seiten = gl(sa, sb) && gl(sb, sc) ? "gleichseitig" : gl(sa, sb) || gl(sb, sc) || gl(sa, sc) ? "gleichschenklig" : "unregelmäßig";
  const m = Math.max(wA, wB, wC);
  const winkel = Math.abs(m - 90) < 0.6 ? "rechtwinklig" : m > 90 ? "stumpfwinklig" : "spitzwinklig";
  return { wA, wB, wC, seiten, winkel };
}
const g_dreiecke = {
  h: 206,
  label: () => "Dreiecksarten nach Seiten und Winkeln",
  ablauf: () => [
    { k: "d0", ms: 1700, text: DREIECK_C[0].t },
    ...DREIECK_C.slice(1).flatMap((q, i) => [{ k: `d${i + 1}`, ms: 1100, text: q.t }, { k: `r${i + 1}`, ms: 900 }]),
  ],
  bild: ({ Z, z }) => {
    const A = [24, 176], Bp = [154, 176];
    let C = DREIECK_C[0].c, st = 0;
    for (let i = 1; i < DREIECK_C.length; i++) { const u = Z(`d${i}`); if (u > 0) C = mixP(C, DREIECK_C[i].c, u); if (z(`d${i}`) >= 0.5) st = i; }
    const ruhig = DREIECK_C.every((_, i) => i === 0 || z(`d${i}`) === 0 || z(`d${i}`) === 1);
    const info = dreieckInfo(A, Bp, C), fest = dreieckInfo(A, Bp, DREIECK_C[st].c), u0 = Z("d0");
    const winkelBogen = (P, Q, R, wert, k) => {
      const a0 = (Math.atan2(-(Q[1] - P[1]), Q[0] - P[0]) * 180) / Math.PI, a1 = (Math.atan2(-(R[1] - P[1]), R[0] - P[0]) * 180) / Math.PI;
      let lo = a0, hi = a1; if (hi < lo) hi += 360; if (hi - lo > 180) { const t = lo; lo = hi; hi = t + 360; }
      const recht = Math.abs(wert - 90) < 0.6 && ruhig, gross = wert > 90.6;
      const [tx, ty] = pol(P[0], P[1], 34, (lo + hi) / 2);
      return (
        <g key={k} opacity={u0}>
          {recht ? <RechterWinkel x={P[0]} y={P[1]} w1={lo} w2={hi} r={16} f={F.granat} /> : <path d={sektor(P[0], P[1], 18, lo, hi)} fill={gross ? F.gold : F.goldHell} stroke={F.goldDunkel} strokeWidth="1" />}
          <Tx x={tx} y={ty + 4} g={10} f={recht ? F.granat : F.goldDunkel} w={800}>{`${Math.round(wert)}°`}</Tx>
        </g>
      );
    };
    const sa = Math.hypot(Bp[0] - C[0], Bp[1] - C[1]), sb = Math.hypot(A[0] - C[0], A[1] - C[1]);
    return (
      <>
        <polygon points={pts([A, Bp, C])} fill={F.granatHell} stroke={F.granat} strokeWidth="2.2" strokeLinejoin="round" opacity={u0} />
        {winkelBogen(A, Bp, C, info.wA, "a")}{winkelBogen(Bp, C, A, info.wB, "b")}{winkelBogen(C, A, Bp, info.wC, "c")}
        {ruhig && info.seiten !== "unregelmäßig" && (
          <g opacity={u0}>
            <Marke a={A} b={C} n={1} />
            <Marke a={Bp} b={C} n={Math.abs(sa - sb) < 1.5 ? 1 : 2} />
            {info.seiten === "gleichseitig" && <Marke a={A} b={Bp} n={1} />}
          </g>
        )}
        {[["A", A, -12, 16], ["B", Bp, 12, 16], ["C", C, 0, -10]].map(([t, P, dx, dy]) => <Tx key={t} x={P[0] + dx} y={P[1] + dy} g={12} f={F.granat} w={800} opacity={u0}>{t}</Tx>)}
        <g opacity={u0 * (ruhig ? 1 : 0.3)}>
          <Tx x={296} y={44} g={10} f={F.grau} w={700}>nach Seiten</Tx>
          <rect x={240} y={52} width={112} height={28} rx="14" fill={F.blauHell} />
          <Tx x={296} y={70} g={10.5} f={F.blau} w={800}>{fest.seiten}</Tx>
          <Tx x={296} y={110} g={10} f={F.grau} w={700}>nach Winkeln</Tx>
          <rect x={240} y={118} width={112} height={28} rx="14" fill={fest.winkel === "spitzwinklig" ? F.goldHell : F.granat} />
          <Tx x={296} y={136} g={10.5} f={fest.winkel === "spitzwinklig" ? F.goldDunkel : F.weiss} w={800}>{fest.winkel}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_zentimeterquadrat – 1 cm² = 100 mm²: zehn Reihen zu je zehn Millimeterquadraten
   ============================================================ */
const g_zentimeterquadrat = {
  h: 210,
  label: () => "1 cm² = 100 mm²",
  ablauf: () => [
    { k: "quadrat", ms: 1000, text: "Ein Quadrat mit 1 cm Seitenlänge: 1 cm². Eine Seite ist 10 mm lang." },
    { k: "reihe", ms: 1100, text: "In eine Reihe passen 10 Millimeterquadrate." },
    { k: "fuellen", ms: 2600, text: "Es gibt 10 solche Reihen: 10 · 10 = 100." },
    { k: "fertig", ms: 1700, text: "Also 1 cm² = 100 mm². Bei Flächen ist der Faktor 100, nicht 10!" },
  ],
  bild: ({ Z, z }) => {
    const x0 = 40, y0 = 30, k = 15, S = 10 * k, uq = Z("quadrat"), ur = z("reihe"), uf = z("fuellen"), ue = Z("fertig");
    const reihen = 1 + Math.floor(uf * 9 + 0.0001);
    return (
      <>
        {Array.from({ length: 10 }, (_, r) => {
          const ro = r === 0 ? 1 : klemm(uf * 9 - (r - 1));
          if (ro <= 0 || ur <= 0) return null;
          return Array.from({ length: 10 }, (_, c) => {
            const o = r === 0 ? klemm(ur * 10 - c) : ro;
            return o > 0 && <rect key={r + "-" + c} x={x0 + c * k + 1} y={y0 + S - (r + 1) * k + 1} width={k - 2} height={k - 2} rx="2" fill={r === 0 ? F.gold : F.goldHell} opacity={o} />;
          });
        })}
        <rect x={x0} y={y0} width={S} height={S} fill="none" stroke={F.granat} strokeWidth="2.4" opacity={uq} />
        <g opacity={uq}>
          <Tx x={x0 + S / 2} y={y0 + S + 18} g={11.5} f={F.granat} w={800}>1 cm = 10 mm</Tx>
        </g>
        <g opacity={teil(ur, 0.5, 1)}>
          <Tx x={x0 + S + 12} y={y0 + S - 4} g={11} f={F.goldDunkel} w={800} a="start">{`10 je Reihe`}</Tx>
        </g>
        <g opacity={klemm(uf * 4)}>
          <Tx x={x0 + S + 12} y={y0 + 16} g={11} f={F.tinte} w={800} a="start">{`Reihen: ${reihen}`}</Tx>
          <Tx x={x0 + S + 12} y={y0 + 36} g={11} f={F.tinte} w={800} a="start">{`Quadrate: ${reihen * 10}`}</Tx>
        </g>
        <g opacity={ue} transform={`translate(0 ${(1 - ue) * 6})`}>
          <rect x={x0 + S + 10} y={y0 + 62} width={136} height={58} rx="12" fill={F.granatTief} />
          <Tx x={x0 + S + 78} y={y0 + 86} g={14} f={F.goldHell} w={800}>1 cm² = 100 mm²</Tx>
          <Tx x={x0 + S + 78} y={y0 + 106} g={11} f={F.rosa} w={700}>10 · 10 = 100</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_rechteck – Einheitsquadrate füllen ein Rechteck Reihe für Reihe: A = a · b
   p: { a: 5, b: 3, e: "cm" }  ·  rückwärts: { a: 6, A: 48, e: "cm", rueck: true }
   ============================================================ */
const g_rechteck = {
  h: 214,
  label: (p) => p.rueck ? `Rückwärts: ${p.A} ${p.e}² : ${p.a} ${p.e} = ${p.A / p.a} ${p.e}` : `Rechteck ${p.a} ${p.e} mal ${p.b} ${p.e}: ${p.a * p.b} ${p.e}²`,
  ablauf: (p) => p.rueck ? [
    { k: "reihe", ms: 1300, text: `Bekannt: A = ${p.A} ${p.e}² und a = ${p.a} ${p.e}. In eine Reihe passen ${p.a} Quadrate.` },
    { k: "fuellen", ms: 2600, text: `Reihe um Reihe, bis ${p.A} Quadrate liegen.` },
    { k: "seite", ms: 1100, text: `Das sind ${p.A / p.a} Reihen – also ist b = ${p.A / p.a} ${p.e}.` },
    { k: "formel", ms: 1500, text: `Rückwärts rechnen: b = A : a = ${p.A} : ${p.a} = ${p.A / p.a}.` },
  ] : [
    { k: "rahmen", ms: 900, text: `Ein Rechteck: ${p.a} ${p.e} lang, ${p.b} ${p.e} breit.` },
    { k: "reihe", ms: 1300, text: `In eine Reihe passen ${p.a} Quadrate zu je 1 ${p.e}².` },
    { k: "fuellen", ms: 2000, text: `Es gibt ${p.b} Reihen.` },
    { k: "formel", ms: 1700, text: `${p.b} Reihen mit je ${p.a} Quadraten: A = ${p.a} · ${p.b} = ${p.a * p.b} ${p.e}².` },
  ],
  bild: ({ Z, z, p }) => {
    const b = p.rueck ? p.A / p.a : p.b, k = Math.min(28, 150 / b, 150 / p.a), W = p.a * k, H = b * k, x0 = 28, y0 = 196 - H;
    const ur = z("reihe"), uf = z("fuellen"), uo = Z("formel"), urah = p.rueck ? 1 : Z("rahmen"), us = p.rueck ? Z("seite") : urah;
    const rN = 1 + Math.floor(uf * (b - 1) + 0.0001), anzahl = ur <= 0 ? 0 : uf <= 0 ? Math.round(klemm(ur) * p.a) : rN * p.a;
    return (
      <>
        {!p.rueck && <rect x={x0} y={y0} width={W} height={H} fill="none" stroke={F.granat} strokeWidth="2.2" opacity={urah} />}
        {Array.from({ length: b }, (_, r) => {
          const ro = r === 0 ? 1 : klemm(uf * (b - 1) - (r - 1));
          if (ro <= 0 || ur <= 0) return null;
          return Array.from({ length: p.a }, (_, c) => {
            const o = r === 0 ? klemm(ur * p.a - c) : ro, dy = (1 - raus(o)) * -10;
            return o > 0 && <rect key={r + "-" + c} x={x0 + c * k + 1.5} y={y0 + H - (r + 1) * k + 1.5 + dy} width={k - 3} height={k - 3} rx="3" fill={r % 2 ? F.goldHell : F.gold} opacity={o} />;
          });
        })}
        {p.rueck && <rect x={x0} y={y0} width={W} height={H} fill="none" stroke={F.granat} strokeWidth="2.2" opacity={us} />}
        <g opacity={urah}>
          <Tx x={x0 + W / 2} y={y0 - 8} g={11.5} f={F.granat} w={800}>{`a = ${p.a} ${p.e}`}</Tx>
        </g>
        <Tx x={x0 + W + 10} y={y0 + H / 2 + 4} g={11.5} f={F.granat} w={800} a="start" opacity={us}>{`b = ${b} ${p.e}`}</Tx>
        <g opacity={klemm(ur * 4)}>
          <rect x={240} y={26} width={112} height={50} rx="12" fill={F.flaeche} />
          <Tx x={296} y={46} g={10} f={F.grau} w={700}>Quadrate</Tx>
          <Tx x={296} y={67} g={17} f={F.tinte} w={800}>{anzahl}</Tx>
        </g>
        <g opacity={uo} transform={`translate(0 ${(1 - uo) * 6})`}>
          <rect x={240} y={100} width={112} height={58} rx="12" fill={F.granatTief} />
          <Tx x={296} y={124} g={13} f={F.goldHell} w={800}>{p.rueck ? "b = A : a" : "A = a · b"}</Tx>
          <Tx x={296} y={145} g={12} f={F.weiss} w={800}>{p.rueck ? `${p.A} : ${p.a} = ${b}` : `${p.a} · ${p.b} = ${p.a * p.b}`}</Tx>
          <Tx x={296} y={178} g={12} f={F.granat} w={800}>{p.rueck ? `b = ${b} ${p.e}` : `A = ${p.a * p.b} ${p.e}²`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_umfang – Ein Punkt läuft einmal außen herum und zählt die Seiten zusammen
   p: { a: 18, b: 12, e: "m", tor: 2 }
   ============================================================ */
const g_umfang = {
  h: 210,
  label: (p) => `Umfang eines Rechtecks ${p.a} ${p.e} mal ${p.b} ${p.e}`,
  ablauf: (p) => [
    { k: "rahmen", ms: 900, text: `Ein Garten: ${p.a} ${p.e} lang, ${p.b} ${p.e} breit. Wie lang ist der Zaun?` },
    { k: "s0", ms: 1100, text: `Einmal außen herum: ${p.a} ${p.e} …` },
    { k: "s1", ms: 900, text: `… + ${p.b} ${p.e} …` },
    { k: "s2", ms: 1100, text: `… + ${p.a} ${p.e} …` },
    { k: "s3", ms: 900, text: `… + ${p.b} ${p.e} = ${2 * (p.a + p.b)} ${p.e}.` },
    { k: "formel", ms: 1500, text: `Kürzer: u = 2 · (${p.a} + ${p.b}) = 2 · ${p.a + p.b} = ${2 * (p.a + p.b)} ${p.e}.` },
    ...(p.tor ? [{ k: "tor", ms: 1500, text: `Ein Tor bleibt frei: ${2 * (p.a + p.b)} ${p.e} − ${p.tor} ${p.e} = ${2 * (p.a + p.b) - p.tor} ${p.e} Zaun.` }] : []),
  ],
  bild: ({ Z, z, p }) => {
    const k = Math.min(8, 160 / p.a), W = p.a * k, H = p.b * k, x0 = 34, y0 = 30;
    const E = [[x0, y0 + H], [x0 + W, y0 + H], [x0 + W, y0], [x0, y0]];
    const L = [p.a, p.b, p.a, p.b], ur = Z("rahmen"), uo = Z("formel"), ut = Z("tor");
    let pos = E[0], sum = 0;
    for (let i = 0; i < 4; i++) { const u = z(`s${i}`); if (u > 0) { pos = mixP(E[i], E[(i + 1) % 4], sanft(u)); sum += L[i] * (u >= 1 ? 1 : 0); } }
    const torW = (p.tor || 0) * k;
    return (
      <>
        <rect x={x0} y={y0} width={W} height={H} fill={F.gruenHell} stroke={F.linie} strokeWidth="1.5" opacity={ur} />
        {E.map((a, i) => {
          const u = z(`s${i}`);
          return u > 0 && <line key={i} x1={a[0]} y1={a[1]} x2={mix(a[0], E[(i + 1) % 4][0], sanft(u))} y2={mix(a[1], E[(i + 1) % 4][1], sanft(u))} stroke={i % 2 ? F.blau : F.granat} strokeWidth="4" strokeLinecap="round" />;
        })}
        {ut > 0 && <line x1={x0 + W / 2 - torW / 2} y1={y0 + H} x2={x0 + W / 2 + torW / 2} y2={y0 + H} stroke={F.gruenHell} strokeWidth="7" opacity={ut} />}
        {ut > 0 && <Tx x={x0 + W / 2} y={y0 + H + 30} g={10.5} f={F.gruen} w={800} opacity={ut}>{`Tor ${p.tor} ${p.e}`}</Tx>}
        <g opacity={ur}>
          <Tx x={x0 + W / 2} y={y0 + H + 17} g={11} f={F.granat} w={800}>{`${p.a} ${p.e}`}</Tx>
          <Tx x={x0 + W + 8} y={y0 + H / 2 + 4} g={11} f={F.blau} w={800} a="start">{`${p.b} ${p.e}`}</Tx>
        </g>
        {z("s0") > 0 && (
          <g transform={`translate(${n1(pos[0])} ${n1(pos[1])})`}>
            <circle r={7} fill={F.gold} stroke={F.weiss} strokeWidth="2" />
          </g>
        )}
        <g opacity={klemm(z("s0") * 4)}>
          <rect x={252} y={26} width={92} height={50} rx="12" fill={F.flaeche} />
          <Tx x={298} y={45} g={10} f={F.grau} w={700}>gelaufen</Tx>
          <Tx x={298} y={66} g={16} f={F.tinte} w={800}>{`${sum} ${p.e}`}</Tx>
        </g>
        <Tippen x={x0} y={182} g={13} f={F.granat} w={800} a="start" u={uo} text={`u = 2 · (${p.a} + ${p.b}) = ${2 * (p.a + p.b)} ${p.e}`} />
        <Tippen x={x0} y={202} g={12} f={F.gruen} w={800} a="start" u={ut} text={`Zaun: ${2 * (p.a + p.b)} − ${p.tor || 0} = ${2 * (p.a + p.b) - (p.tor || 0)} ${p.e}`} />
      </>
    );
  },
};

/* ============================================================
   g_gleicherumfang – Dieselbe Schnur (16 cm) als Rechteck 7 × 1, 6 × 2, 5 × 3, 4 × 4: Umfang gleich, Fläche nicht
   ============================================================ */
const UMF = [[7, 1], [6, 2], [5, 3], [4, 4]];
const g_gleicherumfang = {
  h: 200,
  label: () => "Gleicher Umfang, verschiedene Flächeninhalte",
  ablauf: () => [
    { k: "f0", ms: 1400, text: "Eine Schnur, 16 cm lang, als Rechteck 7 cm × 1 cm: A = 7 cm²." },
    ...UMF.slice(1).map(([a, b], i) => ({ k: `f${i + 1}`, ms: 1300, text: `Dieselbe Schnur als ${a} cm × ${b} cm: u = 16 cm, aber A = ${a * b} cm².` })),
    { k: "fertig", ms: 1500, text: "Gleicher Umfang heißt nicht gleicher Flächeninhalt. Das Quadrat hat den größten." },
  ],
  bild: ({ Z, z }) => {
    const k = 20, cx = 100, cy = 92;
    let a = UMF[0][0], b = UMF[0][1], idx = 0;
    for (let i = 1; i < UMF.length; i++) { const u = Z(`f${i}`); if (u > 0) { a = mix(UMF[i - 1][0], UMF[i][0], u); b = mix(UMF[i - 1][1], UMF[i][1], u); } if (z(`f${i}`) >= 0.5) idx = i; }
    const W = a * k, H = b * k, u0 = Z("f0"), ruhig = Math.abs(a - Math.round(a)) < 0.01;
    return (
      <>
        <rect x={cx - W / 2} y={cy - H / 2} width={W} height={H} fill={F.goldHell} stroke={F.granat} strokeWidth="3" strokeLinejoin="round" opacity={u0} />
        {ruhig && <g opacity={u0}>{Array.from({ length: Math.round(a) - 1 }, (_, i) => <line key={"v" + i} x1={cx - W / 2 + (i + 1) * k} y1={cy - H / 2} x2={cx - W / 2 + (i + 1) * k} y2={cy + H / 2} stroke={F.gold} strokeWidth="1" />)}
          {Array.from({ length: Math.round(b) - 1 }, (_, i) => <line key={"h" + i} x1={cx - W / 2} y1={cy - H / 2 + (i + 1) * k} x2={cx + W / 2} y2={cy - H / 2 + (i + 1) * k} stroke={F.gold} strokeWidth="1" />)}</g>}
        <Tx x={cx} y={cy + H / 2 + 18} g={11} f={F.granat} w={800} opacity={u0 * (ruhig ? 1 : 0.3)}>{`${Math.round(a)} cm`}</Tx>
        <Tx x={cx + W / 2 + 8} y={cy + 4} g={11} f={F.granat} w={800} a="start" opacity={u0 * (ruhig ? 1 : 0.3)}>{`${Math.round(b)} cm`}</Tx>
        <g opacity={u0}>
          <Tx x={244} y={28} g={10} f={F.grau} w={700} a="start">u</Tx>
          <Tx x={310} y={28} g={10} f={F.grau} w={700} a="start">A</Tx>
          {UMF.map(([p, q], i) => {
            const o = i === 0 ? 1 : teil(z(`f${i}`), 0.5, 1), akt = i === idx;
            return (
              <g key={i} opacity={o}>
                {akt && <rect x={196} y={38 + i * 26} width={156} height={22} rx="11" fill={F.granatHell} />}
                <Tx x={204} y={53 + i * 26} g={11} f={F.tinte} w={800} a="start">{`${p} × ${q}`}</Tx>
                <Tx x={244} y={53 + i * 26} g={11} f={F.blau} w={800} a="start">16 cm</Tx>
                <Tx x={310} y={53 + i * 26} g={11} f={F.granat} w={800} a="start">{`${p * q} cm²`}</Tx>
              </g>
            );
          })}
        </g>
        <Pille x={274} y={168} text="u gleich – A verschieden" g={11} o={Z("fertig")} />
      </>
    );
  },
};

/* ============================================================
   g_lfigur – L-Figur: zerlegen (zwei Rechtecke) und ergänzen (großes Rechteck minus Ecke)
   p: { A: 8, B: 6, c: 5, d: 4 }  außen A × B, es fehlt oben rechts c × d
   ============================================================ */
const g_lfigur = {
  h: 214,
  label: (p) => `L-Figur: ${p.A * p.B - p.c * p.d} cm²`,
  ablauf: (p) => {
    const l = p.A - p.c, u = p.B - p.d;
    return [
      { k: "figur", ms: 1000, text: `Eine L-Figur. Außen ${p.A} cm × ${p.B} cm, oben rechts fehlt ${p.c} cm × ${p.d} cm.` },
      { k: "schnitt", ms: 1000, text: "Weg 1: Zerlegen – ein Schnitt teilt das L in zwei Rechtecke." },
      { k: "auseinander", ms: 1200, text: `Links ${l} · ${p.B} = ${l * p.B} cm², unten ${p.c} · ${u} = ${p.c * u} cm².` },
      { k: "zusammen", ms: 1200, text: `Zusammen: ${l * p.B} + ${p.c * u} = ${p.A * p.B - p.c * p.d} cm².` },
      { k: "ergaenzen", ms: 1300, text: `Weg 2: Ergänzen zum großen Rechteck: ${p.A} · ${p.B} = ${p.A * p.B} cm².` },
      { k: "abziehen", ms: 1500, text: `Die Ecke wieder abziehen: ${p.A * p.B} − ${p.c * p.d} = ${p.A * p.B - p.c * p.d} cm². Beide Wege – dasselbe Ergebnis.` },
    ];
  },
  bild: ({ Z, p }) => {
    const k = 18, x0 = 26, y0 = 50, l = p.A - p.c, u = p.B - p.d;
    const us = Z("schnitt"), ua = Z("auseinander"), uz = Z("zusammen"), ue = Z("ergaenzen"), ub = Z("abziehen"), uf = Z("figur");
    const sp = 12 * ua * (1 - uz);
    const X = (v) => x0 + v * k, Y = (v) => y0 + (p.B - v) * k;
    const L = [[X(0), Y(0)], [X(p.A), Y(0)], [X(p.A), Y(u)], [X(l), Y(u)], [X(l), Y(p.B)], [X(0), Y(p.B)]];
    const gesamt = p.A * p.B - p.c * p.d;
    return (
      <>
        <g opacity={uf}>
          <rect x={X(0) - sp} y={Y(p.B)} width={l * k} height={p.B * k} fill={ua > 0 ? F.granatHell : F.flaeche} />
          <rect x={X(l) + sp} y={Y(u) + sp} width={p.c * k} height={u * k} fill={ua > 0 ? F.blauHell : F.flaeche} />
          {ua <= 0 && <polygon points={pts(L)} fill={F.flaeche} />}
        </g>
        <rect x={X(l)} y={Y(p.B)} width={p.c * k} height={p.d * k} fill={F.goldHell} fillOpacity={1 - 0.75 * ub} stroke={F.goldDunkel} strokeWidth="1.6" strokeDasharray="5 4" opacity={ue} />
        <polygon points={pts(L)} fill="none" stroke={F.granat} strokeWidth="2.4" strokeLinejoin="round" opacity={uf * (1 - 0.7 * ua * (1 - uz))} />
        <Strich x1={X(l)} y1={Y(u)} x2={X(l)} y2={Y(0)} u={us} f={F.tinte} b={1.8} strokeDasharray="5 4" />
        <g opacity={ua}>
          <Tx x={X(l / 2) - sp} y={Y(p.B / 2) + 4} g={12} f={F.granat} w={800}>{`${l * p.B} cm²`}</Tx>
          <Tx x={X(l + p.c / 2) + sp} y={Y(u / 2) + 4 + sp} g={12} f={F.blau} w={800}>{`${p.c * u} cm²`}</Tx>
        </g>
        <Tx x={X(l + p.c / 2)} y={Y(p.B - p.d / 2) + 4} g={12} f={F.goldDunkel} w={800} opacity={ue}>{`${ub > 0.3 ? "− " : ""}${p.c * p.d} cm²`}</Tx>
        <g opacity={uf}>
          <Tx x={X(p.A / 2)} y={Y(0) + 17} g={10.5} f={F.grau} w={800}>{`${p.A} cm`}</Tx>
          <Tx x={X(0) - 7} y={Y(p.B / 2) + 4} g={10.5} f={F.grau} w={800} a="end">{`${p.B}`}</Tx>
          <Tx x={X(l / 2)} y={Y(p.B) - 7} g={10.5} f={F.grau} w={800}>{`${l}`}</Tx>
          <Tx x={X(p.A) + 7} y={Y(u / 2) + 4} g={10.5} f={F.grau} w={800} a="start">{`${u}`}</Tx>
        </g>
        <g opacity={uz}>
          <Tx x={208} y={64} g={10} f={F.grau} w={700} a="start">Zerlegen</Tx>
          <Tx x={208} y={84} g={13} f={F.tinte} w={800} a="start">{`${l * p.B} + ${p.c * u} = ${gesamt}`}</Tx>
        </g>
        <g opacity={ue}>
          <Tx x={208} y={124} g={10} f={F.grau} w={700} a="start">Ergänzen</Tx>
          <Tx x={208} y={144} g={13} f={F.tinte} w={800} a="start">{ub > 0.3 ? `${p.A * p.B} − ${p.c * p.d} = ${gesamt}` : `${p.A} · ${p.B} = ${p.A * p.B}`}</Tx>
        </g>
        <Pille x={262} y={186} text={`A = ${gesamt} cm²`} g={13} f={F.granat} tf={F.weiss} o={teil(ub, 0.5, 1)} />
      </>
    );
  },
};

/* ============================================================
   g_parallelogramm – Dreieck abschneiden, rüberschieben → Rechteck: A = g · h
   p: { g: 6, h: 3, v: 2 }   v = Versatz der oberen Seite
   ============================================================ */
const g_parallelogramm = {
  h: 200,
  label: (p) => `Parallelogramm g = ${p.g} cm, h = ${p.h} cm: A = ${p.g * p.h} cm²`,
  ablauf: (p) => [
    { k: "figur", ms: 1000, text: `Ein Parallelogramm mit Grundseite g = ${p.g} cm.` },
    { k: "hoehe", ms: 1200, text: `Die Höhe steht senkrecht auf g: h = ${p.h} cm – nicht die schräge Seite!` },
    { k: "schnitt", ms: 1000, text: "Entlang der Höhe ein Dreieck abschneiden …" },
    { k: "schieben", ms: 1600, text: "… und rechts wieder ansetzen." },
    { k: "formel", ms: 1600, text: `Ein Rechteck ${p.g} cm × ${p.h} cm: A = g · h = ${p.g} · ${p.h} = ${p.g * p.h} cm².` },
  ],
  bild: ({ Z, p }) => {
    const k = 32, x0 = 40, y0 = 160, G = p.g * k, H = p.h * k, V = p.v * k;
    const uf = Z("figur"), uh = Z("hoehe"), us = Z("schnitt"), uv = Z("schieben"), uo = Z("formel");
    const A = [x0, y0], Bp = [x0 + G, y0], C = [x0 + G + V, y0 - H], D = [x0 + V, y0 - H], Fp = [x0 + V, y0];
    const dx = G * uv, lift = Math.sin(Math.PI * uv) * -10;
    return (
      <>
        <polygon points={pts([Fp, Bp, C, D])} fill={F.granatHell} stroke={F.granat} strokeWidth="2.2" strokeLinejoin="round" opacity={uf} />
        <g transform={`translate(${n1(dx)} ${n1(lift)})`}>
          <polygon points={pts([A, Fp, D])} fill={us > 0 ? F.goldHell : F.granatHell} stroke={F.granat} strokeWidth="2.2" strokeLinejoin="round" opacity={uf} />
        </g>
        {uv <= 0 && <line x1={Fp[0]} y1={Fp[1]} x2={D[0]} y2={D[1]} stroke={F.granatHell} strokeWidth="3" opacity={uf * (1 - us)} />}
        <g opacity={uh}>
          <line x1={D[0]} y1={D[1]} x2={Fp[0]} y2={Fp[1]} stroke={F.blau} strokeWidth="2" strokeDasharray={us > 0 ? undefined : "5 4"} />
          <RechterWinkel x={Fp[0]} y={Fp[1]} w1={0} w2={90} r={11} f={F.blau} />
          <Tx x={D[0] + 8} y={y0 - H / 2 + 4} g={12} f={F.blau} w={800} a="start">{`h = ${p.h} cm`}</Tx>
        </g>
        <Tx x={x0 + G / 2 + (uv > 0 ? V : 0) * uv} y={y0 + 18} g={12} f={F.granat} w={800} opacity={uf}>{`g = ${p.g} cm`}</Tx>
        {us > 0 && us < 1 && <path d={`M${Fp[0] + 10} ${y0 - H * us} l-6 -4 m6 4 l-6 4`} stroke={F.tinte} strokeWidth="1.6" fill="none" />}
        <g opacity={uo}>
          <rect x={x0 + V} y={y0 - H} width={G} height={H} fill="none" stroke={F.goldDunkel} strokeWidth="2.4" strokeDasharray="6 4" />
          <Tx x={x0 + V + G / 2} y={30} g={14} f={F.granat} w={800}>{`A = g · h = ${p.g} · ${p.h} = ${p.g * p.h} cm²`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_dreieckflaeche – Zwei gleiche Dreiecke ergeben ein Parallelogramm: A = (g · h) : 2
   p: { g: 8, h: 5, v: 3 }
   ============================================================ */
const g_dreieckflaeche = {
  h: 206,
  label: (p) => `Dreieck g = ${p.g} cm, h = ${p.h} cm: A = ${(p.g * p.h) / 2} cm²`,
  ablauf: (p) => [
    { k: "figur", ms: 1000, text: `Ein Dreieck: Grundseite g = ${p.g} cm, Höhe h = ${p.h} cm.` },
    { k: "kopie", ms: 900, text: "Eine genau gleiche Kopie …" },
    { k: "drehen", ms: 1700, text: "… um eine halbe Drehung gedreht und angelegt." },
    { k: "para", ms: 1300, text: `Zusammen: ein Parallelogramm mit A = g · h = ${p.g} · ${p.h} = ${p.g * p.h} cm².` },
    { k: "halb", ms: 1600, text: `Das Dreieck ist genau die Hälfte: A = ${p.g * p.h} : 2 = ${(p.g * p.h) / 2} cm².` },
  ],
  bild: ({ Z, p }) => {
    const k = 18, x0 = 20, y0 = 172, G = p.g * k, H = p.h * k, V = p.v * k;
    const A = [x0, y0], Bp = [x0 + G, y0], C = [x0 + V, y0 - H];
    const M = [(Bp[0] + C[0]) / 2, (Bp[1] + C[1]) / 2];
    const uf = Z("figur"), uk = Z("kopie"), ud = Z("drehen"), up = Z("para"), uh = Z("halb");
    const off = 26 * (1 - ud);
    return (
      <>
        <polygon points={pts([A, Bp, C])} fill={F.granatHell} stroke={F.granat} strokeWidth="2.2" strokeLinejoin="round" opacity={uf} />
        {uk > 0 && (
          <g transform={`translate(${n1(off)} ${n1(-off * 0.3)}) rotate(${n1(180 * ud)} ${n1(M[0])} ${n1(M[1])})`} opacity={uk}>
            <polygon points={pts([A, Bp, C])} fill={F.blauHell} stroke={F.blau} strokeWidth="2.2" strokeLinejoin="round" fillOpacity={uh > 0 ? 1 - 0.6 * uh : 1} />
          </g>
        )}
        <g opacity={uf}>
          <line x1={C[0]} y1={C[1]} x2={C[0]} y2={y0} stroke={F.tinte} strokeWidth="1.6" strokeDasharray="4 3" />
          <RechterWinkel x={C[0]} y={y0} w1={0} w2={90} r={10} f={F.tinte} />
          <Tx x={C[0] + 6} y={y0 - 16} g={11} f={F.tinte} w={800} a="start">{`h = ${p.h} cm`}</Tx>
          <Tx x={x0 + G / 2} y={y0 + 18} g={11.5} f={F.granat} w={800}>{`g = ${p.g} cm`}</Tx>
        </g>
        <g opacity={up}>
          <Tx x={296} y={40} g={10} f={F.grau} w={700}>Parallelogramm</Tx>
          <Tx x={296} y={60} g={13} f={F.blau} w={800}>{`${p.g} · ${p.h} = ${p.g * p.h}`}</Tx>
        </g>
        <g opacity={uh}>
          <Tx x={296} y={100} g={10} f={F.grau} w={700}>Dreieck</Tx>
          <Tx x={278} y={136} g={14} f={F.granat} w={800} a="end">A =</Tx>
          <SvgBruch x={306} y={132} z="g · h" n="2" g={13} f={F.granat} />
          <Tx x={296} y={178} g={13} f={F.granat} w={800}>{`= ${(p.g * p.h) / 2} cm²`}</Tx>
        </g>
      </>
    );
  },
};

/* ---------- Netz-Faltung (Würfel/Quader) mit echter 3D-Drehung ---------- */
/* Netz-Flächen als Baum: jede Fläche hängt an einer Kante ihres Elternteils und klappt um 90° hoch.
   Rechnung in 3D: Boden in der Ebene y = 0 (x nach rechts, z nach vorn), dann projiziert. */
function rotAchse(p, a, b, w) {
  /* Punkt p um Achse durch a mit Richtung b-a um w Grad drehen (Rodrigues) */
  const k = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...k), u = k.map((v) => v / l);
  const v = [p[0] - a[0], p[1] - a[1], p[2] - a[2]], c = Math.cos(rad(w)), s = Math.sin(rad(w));
  const kreuz = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const pkt = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  return [0, 1, 2].map((i) => a[i] + v[i] * c + kreuz[i] * s + u[i] * pkt * (1 - c));
}
/* Netz: Flächen { id, eltern, kante: [i,j] (Ecken-Indizes des Elternteils), rechteck in Netz-Koordinaten (x,z) } */
function netzFalten(flaechen, winkel) {
  /* flaechen[i].ecken: 4 Punkte [x, 0, z] in der Ebene; Achse = gemeinsame Kante mit Eltern; Rückgabe: 3D-Ecken je Fläche */
  const welt = {};
  const kette = (f) => { const k = []; let g = f; while (g) { k.push(g); g = flaechen.find((h) => h.id === g.eltern); } return k; };
  for (const f of flaechen) {
    let pts3 = f.ecken.map((p) => p.slice());
    /* von innen nach außen: erst die eigene Klappung, dann die der Vorfahren (in Netz-Koordinaten der Vorfahren) */
    const k = kette(f);
    for (const g of k) {
      if (!g.eltern) continue;
      pts3 = pts3.map((p) => rotAchse(p, g.achse[0], g.achse[1], winkel(g.id)));
    }
    welt[f.id] = pts3;
  }
  return welt;
}
/* Kreuz-Netz eines Quaders a (x) × b (z) × c (Höhe) mit Boden in der Mitte */
function kreuzNetz(a, b, c) {
  const R = (x0, z0, x1, z1) => [[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]];
  return [
    { id: "boden", ecken: R(0, 0, a, b) },
    { id: "vorn", eltern: "boden", ecken: R(0, b, a, b + c), achse: [[a, 0, b], [0, 0, b]] },
    { id: "hinten", eltern: "boden", ecken: R(0, -c, a, 0), achse: [[0, 0, 0], [a, 0, 0]] },
    { id: "links", eltern: "boden", ecken: R(-c, 0, 0, b), achse: [[0, 0, b], [0, 0, 0]] },
    { id: "rechts", eltern: "boden", ecken: R(a, 0, a + c, b), achse: [[a, 0, 0], [a, 0, b]] },
    { id: "deckel", eltern: "vorn", ecken: R(0, b + c, a, b + c + b), achse: [[a, 0, b + c], [0, 0, b + c]] },
  ];
}
function Netz3D({ flaechen, winkel, phi, el, cx, cy, s, farbe, mitte, beschrift }) {
  const welt = netzFalten(flaechen, winkel);
  const P = (p) => { const q = projiziere([p[0] - mitte[0], p[1] - mitte[1], p[2] - mitte[2]], phi, el); return { x: cx + q.x * s, y: cy - q.y * s, d: q.d }; };
  const liste = flaechen.map((f) => { const e = welt[f.id].map(P); return { f, e, d: e.reduce((t, q) => t + q.d, 0) / 4 }; });
  liste.sort((a, b) => b.d - a.d);
  return (
    <g>
      {liste.map(({ f, e }) => {
        const m = [e.reduce((t, q) => t + q.x, 0) / 4, e.reduce((t, q) => t + q.y, 0) / 4];
        const fl = Math.abs((e[1].x - e[0].x) * (e[3].y - e[0].y) - (e[1].y - e[0].y) * (e[3].x - e[0].x));
        return (
          <g key={f.id}>
            <polygon points={pts(e.map((q) => [q.x, q.y]))} fill={farbe(f.id)} fillOpacity="0.92" stroke={F.granat} strokeWidth="1.6" strokeLinejoin="round" />
            {beschrift && fl > 260 && <Tx x={m[0]} y={m[1] + 4} g={10} f={F.granatTief} w={800}>{beschrift(f.id)}</Tx>}
          </g>
        );
      })}
    </g>
  );
}

/* ============================================================
   g_wuerfelnetz – Ein Würfelnetz (Kreuz) faltet sich zum Würfel; danach: ein Nicht-Netz
   ============================================================ */
const FARBE6 = { boden: F.goldHell, vorn: F.granatHell, hinten: F.granatHell, links: F.blauHell, rechts: F.blauHell, deckel: F.goldHell };
const g_wuerfelnetz = {
  h: 214,
  label: () => "Ein Würfelnetz wird zum Würfel gefaltet",
  ablauf: () => [
    { k: "netz", ms: 1200, text: "Sechs Quadrate, die zusammenhängen: ein Würfelnetz." },
    { k: "seiten", ms: 1600, text: "Vier Seiten klappen um 90° nach oben." },
    { k: "deckel", ms: 1300, text: "Zum Schluss klappt der Deckel zu." },
    { k: "drehen", ms: 1300, text: "Fertig ist der Würfel: Gegenüberliegende Flächen sind im Netz durch eine Fläche getrennt." },
    { k: "nicht", ms: 2000, text: "Wieder aufgeklappt. Kein Netz sind: fünf in einer Reihe oder ein 2 × 2-Block – dann überlappen sich Flächen." },
  ],
  bild: ({ Z, z }) => {
    const us = Z("seiten"), ud = Z("deckel"), un = Z("netz"), ur = Z("drehen"), ux = Z("nicht");
    const fl = kreuzNetz(1, 1, 1);
    const zu = 1 - ux;
    const winkel = (id) => (id === "deckel" ? 90 * ud * zu : 90 * us * zu);
    const ein = us * zu, el = mix(88, 26, ein), phi = mix(0, 28, ein) + 20 * ur * zu;
    const k = 1 - 0.42 * ux, cx = mix(180, 92, ux), cy = mix(104, 100, ux);
    return (
      <>
        <g opacity={un} transform={`translate(${n1(cx)} ${n1(cy)}) scale(${n1(k)}) translate(${-180} ${-104})`}>
          <Netz3D flaechen={fl} winkel={winkel} phi={phi} el={el} cx={180} cy={106 + 4 * (1 - ein)} s={mix(34, 60, ein) - 10 * Math.sin(Math.PI * ein)} farbe={(id) => FARBE6[id]} mitte={[0.5, ein * 0.5, mix(0.5, 1, 1 - ein)]} />
        </g>
        <g opacity={ux}>
          <Tx x={270} y={26} g={10.5} f={F.grau} w={800}>5 in einer Reihe</Tx>
          {[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [1, 1]].map(([i, j], n) => <rect key={"a" + n} x={210 + i * 24} y={36 + j * 24} width={22} height={22} rx="3" fill={F.flaeche} stroke={F.hell} strokeWidth="1.2" />)}
          <Pille x={270} y={98} text="kein Netz" g={10} f={F.granatHell} tf={F.granat} />
          <Tx x={270} y={128} g={10.5} f={F.grau} w={800}>2 × 2-Block</Tx>
          {[[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]].map(([i, j], n) => <rect key={"b" + n} x={222 + i * 24} y={138 + j * 24} width={22} height={22} rx="3" fill={F.flaeche} stroke={F.hell} strokeWidth="1.2" />)}
          <rect x={220} y={136} width={50} height={50} rx="5" fill="none" stroke={F.granat} strokeWidth="1.6" strokeDasharray="4 3" />
          <Pille x={270} y={202} text="kein Netz" g={10} f={F.granatHell} tf={F.granat} />
          <Pille x={92} y={204} text="Würfelnetz ✓" g={10.5} f={F.goldHell} tf={F.goldDunkel} />
        </g>
      </>
    );
  },
};

/* ============================================================
   g_oberflaeche – Quader klappt auf in sein Netz: drei Rechtecke, jedes doppelt
   p: { a: 5, b: 3, c: 2 }   a Länge, b Breite (Tiefe), c Höhe
   ============================================================ */
const g_oberflaeche = {
  h: 228,
  label: (p) => `Oberfläche eines Quaders ${p.a} × ${p.b} × ${p.c}: ${2 * (p.a * p.b + p.a * p.c + p.b * p.c)} cm²`,
  ablauf: (p) => [
    { k: "quader", ms: 1100, text: `Ein Quader: ${p.a} cm lang, ${p.b} cm breit, ${p.c} cm hoch.` },
    { k: "auf", ms: 2000, text: "Aufklappen: Die sechs Flächen liegen flach als Netz." },
    { k: "paare", ms: 1500, text: "Je zwei Flächen sind gleich groß – drei Paare in drei Farben." },
    { k: "rechnen", ms: 1700, text: `${p.a} · ${p.b} = ${p.a * p.b}, ${p.a} · ${p.c} = ${p.a * p.c}, ${p.b} · ${p.c} = ${p.b * p.c} – jedes doppelt.` },
    { k: "summe", ms: 1600, text: `O = 2 · (${p.a * p.b} + ${p.a * p.c} + ${p.b * p.c}) = 2 · ${p.a * p.b + p.a * p.c + p.b * p.c} = ${2 * (p.a * p.b + p.a * p.c + p.b * p.c)} cm².` },
  ],
  bild: ({ Z, p }) => {
    const uq = Z("quader"), ua = Z("auf"), up = Z("paare"), ur = Z("rechnen"), us = Z("summe");
    const fl = kreuzNetz(p.a, p.b, p.c);
    const winkel = (id) => 90 * (1 - ua);
    const el = mix(28, 90, ua), phi = mix(-30, 0, ua);
    const gruppe = { boden: "ab", deckel: "ab", vorn: "ac", hinten: "ac", links: "bc", rechts: "bc" };
    const farbe = (id) => up > 0.5 ? { ab: F.goldHell, ac: F.granatHell, bc: F.blauHell }[gruppe[id]] : F.flaeche;
    const wert = { ab: p.a * p.b, ac: p.a * p.c, bc: p.b * p.c };
    const s = 15.5;
    const mitteZ = mix(p.b / 2, (p.b + p.c + p.b - p.c) / 2, ua);
    const O = 2 * (wert.ab + wert.ac + wert.bc);
    return (
      <>
        <g opacity={uq}>
          <Netz3D flaechen={fl} winkel={winkel} phi={phi} el={el} cx={128} cy={mix(108, 112, ua)} s={s} farbe={farbe} mitte={[p.a / 2, (p.c / 2) * (1 - ua), mitteZ]}
            beschrift={ur > 0.3 ? (id) => `${wert[gruppe[id]]}` : null} />
        </g>
        <g opacity={teil(ur, 0, 0.6)}>
          {[["ab", F.goldHell, F.goldDunkel, `${p.a} · ${p.b}`], ["ac", F.granatHell, F.granat, `${p.a} · ${p.c}`], ["bc", F.blauHell, F.blau, `${p.b} · ${p.c}`]].map(([g, f, tf, t], i) => (
            <g key={g}>
              <rect x={234} y={30 + i * 34} width={116} height={26} rx="13" fill={f} />
              <Tx x={292} y={47.5 + i * 34} g={11} f={tf} w={800}>{`2 × (${t} = ${wert[g]})`}</Tx>
            </g>
          ))}
        </g>
        <g opacity={us} transform={`translate(0 ${(1 - us) * 6})`}>
          <rect x={234} y={136} width={116} height={50} rx="12" fill={F.granatTief} />
          <Tx x={292} y={157} g={12} f={F.goldHell} w={800}>{`O = 2 · ${wert.ab + wert.ac + wert.bc}`}</Tx>
          <Tx x={292} y={176} g={12} f={F.weiss} w={800}>{`= ${O} cm²`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_kubikdezimeter – 1 dm³ = 1000 cm³: eine Stange, eine Platte, zehn Platten
   ============================================================ */
function Wuerfelchen({ x, y, k, d, f = F.goldHell, rand = F.goldDunkel, o = 1 }) {
  /* kleiner Würfel im Schrägbild: Vorderseite k×k, Tiefe d (nach rechts oben) */
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <polygon points={pts([[x, y], [x + d, y - d], [x + k + d, y - d], [x + k, y]])} fill={F.weiss} stroke={rand} strokeWidth="0.7" />
      <polygon points={pts([[x + k, y], [x + k + d, y - d], [x + k + d, y + k - d], [x + k, y + k]])} fill={F.gold} stroke={rand} strokeWidth="0.7" />
      <rect x={x} y={y} width={k} height={k} fill={f} stroke={rand} strokeWidth="0.7" />
    </g>
  );
}
const g_kubikdezimeter = {
  h: 226,
  label: () => "1 dm³ = 1000 cm³",
  ablauf: () => [
    { k: "stange", ms: 1300, text: "10 Zentimeterwürfel in einer Reihe: eine Stange, 10 cm³." },
    { k: "platte", ms: 1600, text: "10 Stangen nebeneinander: eine Platte, 10 · 10 = 100 cm³." },
    { k: "stapel", ms: 2400, text: "10 Platten übereinander: 10 · 100 = 1000 cm³." },
    { k: "fertig", ms: 1700, text: "Der Würfel ist 1 dm lang, breit und hoch: 1 dm³ = 1000 cm³ = 1 Liter." },
  ],
  bild: ({ z, Z }) => {
    const k = 12, x0 = 34, y0 = 206, us = z("stange"), up = z("platte"), uh = z("stapel"), uf = Z("fertig");
    const reihen = up <= 0 ? 1 : 1 + up * 9;
    const sch = uh <= 0 ? 0 : uh * 9;
    const anzahl = Math.round(us >= 1 ? (up >= 1 ? 100 * (1 + Math.floor(sch + 0.001)) : 10 * Math.floor(reihen + 0.001)) : Math.floor(us * 10 + 0.001));
    const d = k * 0.5 * Math.SQRT1_2 * 1.2;
    const teile = [];
    for (let h = 0; h < 10; h++) {
      const oh = h === 0 ? 1 : klemm(sch - (h - 1));
      if (oh <= 0) continue;
      for (let t = 9; t >= 0; t--) {
        const ot = h > 0 ? 1 : t === 0 ? 1 : klemm(reihen - t);
        if (ot <= 0) continue;
        for (let i = 0; i < 10; i++) {
          const oi = h > 0 || t > 0 ? 1 : klemm(us * 10 - i);
          if (oi <= 0) continue;
          const x = x0 + i * k + t * d, y = y0 - h * k - t * d - k - (h > 0 ? (1 - raus(oh)) * 14 : 0);
          teile.push(<Wuerfelchen key={`${h}-${t}-${i}`} x={x} y={y} k={k} d={d} o={oh * ot * oi} f={h % 2 ? F.goldHell : F.weiss} />);
        }
      }
    }
    return (
      <>
        {teile}
        <g opacity={klemm(us * 4)}>
          <rect x={248} y={24} width={100} height={52} rx="12" fill={F.flaeche} />
          <Tx x={298} y={44} g={10} f={F.grau} w={700}>Zentimeterwürfel</Tx>
          <Tx x={298} y={66} g={16} f={F.tinte} w={800}>{de(anzahl)}</Tx>
        </g>
        <g opacity={teil(Z("platte"), 0, 0.5)}>
          <Tx x={298} y={102} g={11} f={F.tinte} w={800}>{"10 · 10 = 100"}</Tx>
        </g>
        <g opacity={teil(Z("stapel"), 0.6, 1)}>
          <Tx x={298} y={122} g={11} f={F.tinte} w={800}>{"10 · 100 = 1.000"}</Tx>
        </g>
        <g opacity={uf} transform={`translate(0 ${(1 - uf) * 6})`}>
          <rect x={248} y={140} width={100} height={64} rx="12" fill={F.granatTief} />
          <Tx x={298} y={162} g={13} f={F.goldHell} w={800}>1 dm³</Tx>
          <Tx x={298} y={179} g={11} f={F.weiss} w={800}>= 1.000 cm³</Tx>
          <Tx x={298} y={195} g={11} f={F.rosa} w={800}>= 1 Liter</Tx>
          <Tx x={x0 + 60} y={y0 + 14} g={10.5} f={F.granat} w={800}>1 dm = 10 cm</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_volumen – Würfel stapeln sich Schicht für Schicht: V = a · b · c
   p: { a: 4, b: 3, c: 2 }
   ============================================================ */
const g_volumen = {
  h: 214,
  label: (p) => `Quader ${p.a} × ${p.b} × ${p.c}: ${p.a * p.b * p.c} cm³`,
  ablauf: (p) => [
    { k: "boden", ms: 1700, text: `Die unterste Schicht: ${p.a} · ${p.b} = ${p.a * p.b} Würfel – das ist die Grundfläche.` },
    ...Array.from({ length: p.c - 1 }, (_, i) => ({ k: `s${i + 1}`, ms: 1100, text: `Schicht ${i + 2} kommt darauf: noch einmal ${p.a * p.b} Würfel.` })),
    { k: "formel", ms: 1800, text: `${p.c} Schichten zu je ${p.a * p.b}: V = ${p.a} · ${p.b} · ${p.c} = ${p.a * p.b * p.c} cm³.` },
  ],
  bild: ({ z, Z, p }) => {
    const k = 30, x0 = 34, y0 = 190, d = k * 0.5 * Math.SQRT1_2 * 1.3, ub = z("boden"), uf = Z("formel");
    const teile = [];
    let anzahl = 0;
    for (let h = 0; h < p.c; h++) {
      const uh = h === 0 ? ub : z(`s${h}`);
      if (uh <= 0) continue;
      for (let t = p.b - 1; t >= 0; t--) {
        for (let i = 0; i < p.a; i++) {
          const n = (p.b - 1 - t) * p.a + i, o = h === 0 ? klemm(uh * p.a * p.b - n) : 1;
          if (o <= 0) continue;
          if (o >= 1) anzahl += h === 0 ? 1 : 0;
          const drop = h === 0 ? (1 - raus(o)) * 16 : (1 - raus(uh)) * 26;
          teile.push(<Wuerfelchen key={`${h}-${t}-${i}`} x={x0 + i * k + t * d} y={y0 - h * k - t * d - k - drop} k={k} d={d} o={h === 0 ? o : klemm(uh * 2)} f={h % 2 ? F.granatHell : F.goldHell} rand={h % 2 ? F.granat : F.goldDunkel} />);
        }
      }
    }
    for (let h = 1; h < p.c; h++) if (z(`s${h}`) >= 1) anzahl += p.a * p.b;
    return (
      <>
        {teile}
        <g opacity={ub}>
          <Tx x={x0 + (p.a * k) / 2} y={y0 + 16} g={11} f={F.tinte} w={800}>{`a = ${p.a} cm`}</Tx>
          <Tx x={x0 + p.a * k + (p.b * d) / 2 + 6} y={y0 - (p.b * d) / 2 + 12} g={11} f={F.tinte} w={800} a="start">{`b = ${p.b}`}</Tx>
        </g>
        <Tx x={x0 - 6} y={y0 - (p.c * k) / 2 + 4} g={11} f={F.tinte} w={800} a="end" opacity={uf}>{`c = ${p.c}`}</Tx>
        <g opacity={klemm(ub * 4)}>
          <rect x={252} y={24} width={96} height={52} rx="12" fill={F.flaeche} />
          <Tx x={300} y={44} g={10} f={F.grau} w={700}>Würfel</Tx>
          <Tx x={300} y={66} g={16} f={F.tinte} w={800}>{anzahl}</Tx>
        </g>
        <g opacity={uf} transform={`translate(0 ${(1 - uf) * 6})`}>
          <rect x={244} y={96} width={108} height={58} rx="12" fill={F.granatTief} />
          <Tx x={298} y={120} g={12.5} f={F.goldHell} w={800}>V = a · b · c</Tx>
          <Tx x={298} y={141} g={12} f={F.weiss} w={800}>{`${p.a} · ${p.b} · ${p.c} = ${p.a * p.b * p.c}`}</Tx>
          <Tx x={298} y={176} g={12.5} f={F.granat} w={800}>{`V = ${p.a * p.b * p.c} cm³`}</Tx>
        </g>
      </>
    );
  },
};

/* ---------- Winkel-Hilfen ---------- */
const winkelArt = (w) => w < 0.5 ? "Nullwinkel" : w < 89.5 ? "spitzer Winkel" : w < 90.5 ? "rechter Winkel" : w < 179.5 ? "stumpfer Winkel" : w < 180.5 ? "gestreckter Winkel" : w < 359.5 ? "überstumpfer Winkel" : "Vollwinkel";
function WinkelBild({ sx, sy, w, r1 = 120, rb = 34, f = F.granat, fuell = F.granatHell, zahl = true, start = 0, o = 1, buchst }) {
  /* Winkel mit Scheitel (sx,sy), erster Schenkel in Richtung start, zweiter in Richtung start + w (gegen den Uhrzeigersinn) */
  if (o <= 0) return null;
  const [x2, y2] = pol(sx, sy, r1, start + w), [x1, y1] = pol(sx, sy, r1, start);
  const recht = Math.abs(w - 90) < 0.5;
  const [tx, ty] = pol(sx, sy, rb + (w > 300 ? 18 : 20), start + w / 2);
  return (
    <g opacity={o}>
      {w > 0.5 && (recht ? <RechterWinkel x={sx} y={sy} w1={start} w2={start + 90} r={rb * 0.7} f={f} /> :
        <path d={w >= 359.5 ? `M${sx - rb} ${sy} a${rb} ${rb} 0 1 0 ${2 * rb} 0 a${rb} ${rb} 0 1 0 ${-2 * rb} 0 Z` : sektor(sx, sy, rb, start, start + w)} fill={fuell} stroke={f} strokeWidth="1.6" />)}
      <line x1={sx} y1={sy} x2={x1} y2={y1} stroke={F.tinte} strokeWidth="2.2" strokeLinecap="round" />
      <line x1={sx} y1={sy} x2={x2} y2={y2} stroke={f} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx={sx} cy={sy} r={4} fill={F.tinte} />
      {zahl && w > 8 && <Tx x={tx} y={ty + 4} g={11} f={f} w={800}>{buchst || `${Math.round(w)}°`}</Tx>}
    </g>
  );
}

/* ============================================================
   g_winkelteile – Scheitel, Schenkel, Bezeichnung, Grad; Schenkellänge egal
   p: { grad: 50 }
   ============================================================ */
const g_winkelteile = {
  h: 210,
  label: (p) => `Winkel α = ${p.grad}° mit Scheitel S`,
  ablauf: (p) => [
    { k: "scheitel", ms: 900, text: "Ein Punkt S: der Scheitel." },
    { k: "schenkel1", ms: 1000, text: "Von S aus läuft ein Strahl: der erste Schenkel." },
    { k: "drehen", ms: 1700, text: "Der zweite Schenkel dreht sich gegen den Uhrzeigersinn auf." },
    { k: "name", ms: 1300, text: `Das ist der Winkel α = ∠ASB = ${p.grad}°. Der Scheitel steht in der Mitte.` },
    { k: "laenger", ms: 1700, text: "Längere Schenkel? Die Öffnung bleibt gleich – der Winkel auch." },
  ],
  bild: ({ Z, p }) => {
    const sx = 70, sy = 170, us = Z("scheitel", federnd), u1 = Z("schenkel1"), ud = Z("drehen"), un = Z("name"), ul = Z("laenger");
    const w = p.grad * ud, r = mix(130, 200, Math.sin(Math.PI * ul) * 0 + ul), rs = mix(130, 180, ul);
    const [ax, ay] = pol(sx, sy, 100, 0), [bx, by] = pol(sx, sy, 100, p.grad);
    const [e1x, e1y] = pol(sx, sy, rs, 0), [e2x, e2y] = pol(sx, sy, rs, w);
    return (
      <>
        {ud > 0 && <path d={sektor(sx, sy, 38, 0, Math.max(w, 0.01))} fill={F.granatHell} stroke={F.granat} strokeWidth="1.6" />}
        {ud > 0 && <path d={bogen(sx, sy, 100, 0, Math.max(w, 0.01))} fill="none" stroke={F.gold} strokeWidth="1.6" strokeDasharray="3 4" opacity={1 - un} />}
        <Strich x1={sx} y1={sy} x2={e1x} y2={e1y} u={u1} b={2.4} />
        {ud > 0 && <line x1={sx} y1={sy} x2={e2x} y2={e2y} stroke={F.granat} strokeWidth="2.6" strokeLinecap="round" />}
        {ud > 0 && <Tx x={pol(sx, sy, 58, w / 2)[0]} y={pol(sx, sy, 58, w / 2)[1] + 4} g={13} f={F.granat} w={800}>{un > 0.3 ? "α" : `${Math.round(w)}°`}</Tx>}
        <g opacity={un}>
          <circle cx={ax} cy={ay} r={4} fill={F.blau} /><Tx x={ax} y={ay - 9} g={12} f={F.blau} w={800}>A</Tx>
          <circle cx={bx} cy={by} r={4} fill={F.blau} /><Tx x={bx + 9} y={by + 8} g={12} f={F.blau} w={800} a="start">B</Tx>
        </g>
        <g opacity={us}>
          <circle cx={sx} cy={sy} r={5} fill={F.tinte} />
          <Tx x={sx - 10} y={sy + 18} g={12} f={F.tinte} w={800}>S</Tx>
        </g>
        <g opacity={teil(u1, 0.5, 1)}>
          <Tx x={sx + rs} y={sy + 18} g={10.5} f={F.grau} w={700} a="end">Schenkel</Tx>
        </g>
        <g opacity={teil(ud, 0.6, 1)}>
          <Tx x={pol(sx, sy, rs * 0.55, p.grad)[0] - 34} y={pol(sx, sy, rs * 0.55, p.grad)[1] + 4} g={10.5} f={F.grau} w={700} a="end">Schenkel</Tx>
        </g>
        <g opacity={un}>
          <rect x={228} y={22} width={122} height={66} rx="12" fill={F.flaeche} />
          <Tx x={289} y={45} g={14} f={F.granat} w={800}>{`α = ${p.grad}°`}</Tx>
          <Tx x={289} y={66} g={13} f={F.blau} w={800}>∠ASB</Tx>
          <Tx x={289} y={81} g={10} f={F.grau} w={700}>Scheitel in der Mitte</Tx>
        </g>
        <Pille x={289} y={120} text="gleiche Öffnung" g={10.5} o={teil(ul, 0.5, 1)} />
      </>
    );
  },
};

/* ============================================================
   g_winkelarten – Der Schenkel dreht sich von 0° bis 360°; die Winkelart wechselt mit
   ============================================================ */
const STOPPS = [[40, "spitz"], [90, "recht"], [135, "stumpf"], [180, "gestreckt"], [270, "überstumpf"], [360, "voll"]];
const g_winkelarten = {
  h: 228,
  label: () => "Winkelarten von spitz bis Vollwinkel",
  ablauf: () => STOPPS.flatMap(([w], i) => [
    { k: `d${i}`, ms: i === 0 ? 1000 : 900 + (w - STOPPS[i - 1][0]) * 4, text: { 0: "Unter 90°: ein spitzer Winkel.", 1: "Genau 90°: ein rechter Winkel – mit Bogen und Punkt.", 2: "Zwischen 90° und 180°: ein stumpfer Winkel.", 3: "Genau 180°: ein gestreckter Winkel – sieht aus wie eine Gerade.", 4: "Zwischen 180° und 360°: ein überstumpfer Winkel.", 5: "Genau 360°: eine volle Drehung, der Vollwinkel." }[i] },
    { k: `h${i}`, ms: 500 },
  ]),
  bild: ({ Z, z }) => {
    let w = 0;
    STOPPS.forEach(([g], i) => { const u = Z(`d${i}`); if (u > 0) w = mix(i ? STOPPS[i - 1][0] : 0, g, u); });
    const sx = 108, sy = 102, art = winkelArt(w);
    const skala = [0, 90, 180, 270];
    return (
      <>
        <circle cx={sx} cy={sy} r={76} fill="none" stroke={F.linie} strokeWidth="1.2" strokeDasharray="2 4" />
        {skala.map((g) => { const [x, y] = pol(sx, sy, g % 180 ? 86 : 92, g); return <Tx key={g} x={x} y={y + 4} g={10} f={F.hell} w={700}>{`${g}°`}</Tx>; })}
        <WinkelBild sx={sx} sy={sy} w={w} r1={70} rb={28} fuell={w > 180.5 ? F.goldHell : F.granatHell} f={w > 180.5 ? F.goldDunkel : F.granat} />
        <g>
          <rect x={222} y={66} width={128} height={58} rx="12" fill={F.granatTief} />
          <Tx x={286} y={90} g={17} f={F.goldHell} w={800}>{`${Math.round(w)}°`}</Tx>
          <Tx x={286} y={112} g={10.5} f={F.weiss} w={800}>{art}</Tx>
        </g>
        {STOPPS.map(([g, n], i) => {
          const x = 32 + i * 59.2, erreicht = z(`d${i}`) >= 0.98;
          return (
            <g key={g} opacity={erreicht ? 1 : 0.35}>
              <rect x={x - 28} y={202} width={56} height={20} rx="10" fill={erreicht ? F.goldHell : F.flaeche} />
              <Tx x={x} y={216} g={10} f={erreicht ? F.goldDunkel : F.grau} w={800}>{n}</Tx>
            </g>
          );
        })}
      </>
    );
  },
};

/* ============================================================
   g_geodreieck – Winkel messen: Nullpunkt auf den Scheitel, Kante auf den Schenkel, richtige Skala ablesen
   p: { grad: 125 }
   ============================================================ */
const g_geodreieck = {
  h: 214,
  label: (p) => `Ein Winkel von ${p.grad}° wird mit dem Geodreieck gemessen`,
  ablauf: (p) => [
    { k: "winkel", ms: 900, text: `Erst schätzen: Der Winkel ist ${p.grad > 90 ? "stumpf – also über 90°" : "spitz – also unter 90°"}.` },
    { k: "anlegen", ms: 1600, text: "Nullpunkt auf den Scheitel, die Kante an den ersten Schenkel." },
    { k: "skala", ms: 1300, text: "Die Skala, die am ersten Schenkel bei 0 beginnt, wandert mit nach oben." },
    { k: "ablesen", ms: 1500, text: `Am zweiten Schenkel ablesen: ${p.grad}°. Die andere Skala zeigt ${180 - p.grad} – passt nicht zur Schätzung.` },
  ],
  bild: ({ Z, p }) => {
    const sx = 180, sy = 172, R = 150, uw = Z("winkel"), ua = Z("anlegen"), us = Z("skala"), ur = Z("ablesen");
    const dy = (1 - ua) * 40, dx = (1 - ua) * 30;
    const [bx, by] = pol(sx, sy, 165, p.grad);
    const tick = [];
    for (let g = 0; g <= 180; g += 5) {
      const lang = g % 10 === 0 ? 9 : 5, [x1, y1] = pol(sx, sy, R * 0.52, g), [x2, y2] = pol(sx, sy, R * 0.52 - lang, g);
      tick.push(<line key={g} x1={x1} y1={y1} x2={x2} y2={y2} stroke={F.blau} strokeWidth={g % 10 ? 0.7 : 1.1} />);
    }
    const zahlen = [];
    for (let g = 0; g <= 180; g += 30) {
      const [x, y] = pol(sx, sy, R * 0.52 - 18, g), [x2, y2] = pol(sx, sy, R * 0.52 - 32, g);
      zahlen.push(<Tx key={"a" + g} x={x} y={y + 3.5} g={10} f={F.blau} w={800}>{g}</Tx>);
      if (g > 0 && g < 180) zahlen.push(<Tx key={"b" + g} x={x2} y={y2 + 3.5} g={10} f={F.grau} w={600} o={0.75}>{180 - g}</Tx>);
    }
    const [ax, ay] = pol(sx, sy, R * 0.52 - 18, p.grad), [cx2, cy2] = pol(sx, sy, R * 0.52 - 32, p.grad);
    return (
      <>
        <WinkelBild sx={sx} sy={sy} w={p.grad} r1={165} rb={26} zahl={false} start={0} o={uw} />
        <g opacity={ua * 0.95} transform={`translate(${dx} ${dy})`}>
          <path d={`M${sx - R} ${sy} L${sx + R} ${sy} L${sx} ${sy - R} Z`} fill={F.blauHell} fillOpacity="0.6" stroke={F.blau} strokeWidth="1.4" strokeLinejoin="round" />
          {tick}
          {zahlen}
          <line x1={sx} y1={sy} x2={sx} y2={sy - 14} stroke={F.blau} strokeWidth="1.4" />
          <circle cx={sx} cy={sy} r={3} fill="none" stroke={F.blau} strokeWidth="1.2" />
        </g>
        <path d={bogen(sx, sy, R * 0.52 - 18, 0, p.grad)} fill="none" stroke={F.gold} strokeWidth="3.5" strokeLinecap="round" opacity={us} {...zieh(us)} />
        <Puls x={ax} y={ay} u={teil(ur, 0, 0.6)} r={12} />
        <g opacity={ur}>
          <circle cx={ax} cy={ay} r={10} fill="none" stroke={F.granat} strokeWidth="2" />
          <line x1={cx2 - 6} y1={cy2 - 6} x2={cx2 + 6} y2={cy2 + 6} stroke={F.granat} strokeWidth="1.6" />
          <rect x={244} y={12} width={104} height={40} rx="12" fill={F.granatTief} />
          <Tx x={296} y={38} g={15} f={F.goldHell} w={800}>{`α = ${p.grad}°`}</Tx>
          <Tx x={300} y={72} g={10} f={F.grau} w={700}>{`nicht ${180 - p.grad}°:`}</Tx>
          <Tx x={300} y={86} g={10} f={F.grau} w={700}>falsche Skala</Tx>
        </g>
        <Pille x={296} y={36} text={p.grad > 90 ? "Schätzung: stumpf" : "Schätzung: spitz"} g={10.5} o={uw * (1 - teil(us, 0.5, 1))} />
      </>
    );
  },
};

/* ============================================================
   g_winkelzeichnen – α zeichnen: Schenkel, Nullpunkt anlegen, bei α markieren, verbinden
   p: { grad: 70 }
   ============================================================ */
const g_winkelzeichnen = {
  h: 200,
  label: (p) => `Einen Winkel von ${p.grad}° zeichnen`,
  ablauf: (p) => [
    { k: "schenkel", ms: 1000, text: "Einen Schenkel zeichnen und den Scheitel S markieren." },
    { k: "anlegen", ms: 1300, text: "Geodreieck: Nullpunkt auf S, Kante auf den Schenkel." },
    { k: "markieren", ms: 1300, text: `An der Skala bis ${p.grad}° gehen und einen Punkt setzen.` },
    { k: "verbinden", ms: 1400, text: `Geodreieck weg, S mit dem Punkt verbinden – fertig ist α = ${p.grad}°.` },
  ],
  bild: ({ Z, p }) => {
    const sx = 180, sy = 170, R = 140, u1 = Z("schenkel"), ua = Z("anlegen"), um = Z("markieren"), uv = Z("verbinden");
    const [mx, my] = pol(sx, sy, R * 0.52 - 4, p.grad), [ex, ey] = pol(sx, sy, 160, p.grad);
    const tick = [];
    for (let g = 0; g <= 180; g += 10) { const [x1, y1] = pol(sx, sy, R * 0.52, g), [x2, y2] = pol(sx, sy, R * 0.52 - (g % 30 ? 5 : 9), g); tick.push(<line key={g} x1={x1} y1={y1} x2={x2} y2={y2} stroke={F.blau} strokeWidth="1" />); }
    const zahlen = [0, 30, 60, 90, 120, 150, 180].map((g) => { const [x, y] = pol(sx, sy, R * 0.52 - 18, g); return <Tx key={g} x={x} y={y + 3.5} g={10} f={F.blau} w={800}>{g}</Tx>; });
    const [zx, zy] = pol(sx, sy, R * 0.52 - 18, p.grad * um);
    return (
      <>
        <Strich x1={sx} y1={sy} x2={sx + 165} y2={sy} u={u1} b={2.4} />
        <circle cx={sx} cy={sy} r={4.5} fill={F.tinte} opacity={u1} />
        <Tx x={sx - 4} y={sy + 20} g={12} f={F.tinte} w={800} opacity={u1}>S</Tx>
        <g opacity={ua * (1 - uv) * 0.95} transform={`translate(0 ${(1 - ua) * 30})`}>
          <path d={`M${sx - R} ${sy} L${sx + R} ${sy} L${sx} ${sy - R} Z`} fill={F.blauHell} fillOpacity="0.6" stroke={F.blau} strokeWidth="1.4" strokeLinejoin="round" />
          {tick}{zahlen}
        </g>
        {um > 0 && um < 1 && <circle cx={zx} cy={zy} r={9} fill="none" stroke={F.gold} strokeWidth="2.4" />}
        <g opacity={teil(um, 0.8, 1)}>
          <circle cx={mx} cy={my} r={4} fill={F.granat} />
        </g>
        <Strich x1={sx} y1={sy} x2={ex} y2={ey} u={uv} f={F.granat} b={2.6} />
        <g opacity={teil(uv, 0.6, 1)}>
          <path d={sektor(sx, sy, 30, 0, p.grad)} fill={F.granatHell} stroke={F.granat} strokeWidth="1.6" />
          <line x1={sx} y1={sy} x2={sx + 165} y2={sy} stroke={F.tinte} strokeWidth="2.4" strokeLinecap="round" />
          <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={F.granat} strokeWidth="2.6" strokeLinecap="round" />
          <Tx x={pol(sx, sy, 46, p.grad / 2)[0]} y={pol(sx, sy, 46, p.grad / 2)[1] + 4} g={12} f={F.granat} w={800}>{`${p.grad}°`}</Tx>
          <circle cx={sx} cy={sy} r={4.5} fill={F.tinte} />
        </g>
      </>
    );
  },
};

/* ============================================================
   g_ueberstumpf – Winkel über 180°: kleineren Winkel messen, von 360° abziehen
   p: { grad: 250 }
   ============================================================ */
const g_ueberstumpf = {
  h: 206,
  label: (p) => `Überstumpfer Winkel ${p.grad}° = 360° − ${360 - p.grad}°`,
  ablauf: (p) => [
    { k: "gross", ms: 1300, text: `Ein überstumpfer Winkel – größer als 180°. Das Geodreieck reicht nur bis 180°.` },
    { k: "klein", ms: 1300, text: `Also den anderen, kleineren Winkel messen: ${360 - p.grad}°.` },
    { k: "voll", ms: 1300, text: "Beide zusammen ergeben eine volle Drehung: 360°." },
    { k: "rechnen", ms: 1500, text: `360° − ${360 - p.grad}° = ${p.grad}°.` },
  ],
  bild: ({ Z, p }) => {
    const sx = 110, sy = 106, k = 360 - p.grad, ug = Z("gross"), uk = Z("klein"), uv = Z("voll"), ur = Z("rechnen");
    const [x1, y1] = pol(sx, sy, 84, 0), [x2, y2] = pol(sx, sy, 84, p.grad);
    const [tk, tky] = pol(sx, sy, 48, p.grad + k / 2), [tg, tgy] = pol(sx, sy, 50, p.grad / 2);
    return (
      <>
        <path d={sektor(sx, sy, 32, 0, p.grad * ug)} fill={F.goldHell} stroke={F.goldDunkel} strokeWidth="1.4" opacity={ug} />
        <path d={sektor(sx, sy, 24, p.grad, p.grad + k * uk)} fill={F.granatHell} stroke={F.granat} strokeWidth="1.6" opacity={uk} />
        <line x1={sx} y1={sy} x2={x1} y2={y1} stroke={F.tinte} strokeWidth="2.4" strokeLinecap="round" />
        <line x1={sx} y1={sy} x2={x2} y2={y2} stroke={F.tinte} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx={sx} cy={sy} r={4} fill={F.tinte} />
        <Tx x={tg} y={tgy + 4} g={12} f={F.goldDunkel} w={800} opacity={ug}>{ur > 0.4 ? `${p.grad}°` : "?"}</Tx>
        <Tx x={tk + 6} y={tky + 4} g={12} f={F.granat} w={800} a="start" opacity={uk}>{`${k}°`}</Tx>
        <circle cx={sx} cy={sy} r={92} fill="none" stroke={F.blau} strokeWidth="2" opacity={uv} {...zieh(uv)} />
        <g opacity={uv}>
          <rect x={226} y={34} width={120} height={98} rx="12" fill={F.flaeche} />
          <Tx x={286} y={58} g={12} f={F.blau} w={800}>360° (voll)</Tx>
          <Tx x={286} y={80} g={12} f={F.granat} w={800}>{`− ${k}° (gemessen)`}</Tx>
          <line x1={240} y1={90} x2={332} y2={90} stroke={F.tinte} strokeWidth="1.4" />
          <Tx x={286} y={114} g={15} f={F.goldDunkel} w={800} opacity={ur}>{`= ${p.grad}°`}</Tx>
        </g>
        <Pille x={286} y={168} text="überstumpfer Winkel" g={11} o={ur} />
      </>
    );
  },
};

/* ============================================================
   g_scheitelwinkel – Zwei Geraden schneiden sich: Scheitelwinkel gleich, Nebenwinkel zusammen 180°
   p: { alpha: 40 }
   ============================================================ */
const g_scheitelwinkel = {
  h: 214,
  label: (p) => `Scheitel- und Nebenwinkel bei α = ${p.alpha}°`,
  ablauf: (p) => [
    { k: "geraden", ms: 1100, text: "Zwei Geraden schneiden sich – es entstehen vier Winkel." },
    { k: "alpha", ms: 1000, text: `Gegeben: α = ${p.alpha}°.` },
    { k: "scheitel", ms: 1500, text: `Der gegenüberliegende Winkel γ ist sein Scheitelwinkel: auch ${p.alpha}°.` },
    { k: "neben", ms: 1500, text: `β liegt neben α: Zusammen bilden sie einen gestreckten Winkel. β = 180° − ${p.alpha}° = ${180 - p.alpha}°.` },
    { k: "delta", ms: 1300, text: `δ ist der Scheitelwinkel von β: ebenfalls ${180 - p.alpha}°.` },
    { k: "summe", ms: 1500, text: `Alle vier zusammen: ${p.alpha} + ${180 - p.alpha} + ${p.alpha} + ${180 - p.alpha} = 360.` },
  ],
  bild: ({ Z, p }) => {
    const sx = 120, sy = 110, L = 104, a = p.alpha, b = 180 - a;
    const ug = Z("geraden"), ua = Z("alpha"), us = Z("scheitel"), un = Z("neben"), ud = Z("delta"), uq = Z("summe");
    const [g1x, g1y] = pol(sx, sy, L, 0), [g2x, g2y] = pol(sx, sy, L, 180), [h1x, h1y] = pol(sx, sy, L, a), [h2x, h2y] = pol(sx, sy, L, 180 + a);
    const Wk = ({ von, bis, f, fl, t, o, r = 30, tr = 66 }) => {
      if (o <= 0) return null;
      const [tx, ty] = pol(sx, sy, tr, (von + bis) / 2);
      return <g opacity={o}><path d={sektor(sx, sy, r, von, bis)} fill={fl} stroke={f} strokeWidth="1.4" /><Tx x={tx} y={ty + 4} g={11.5} f={f} w={800}>{t}</Tx></g>;
    };
    /* α wird zu γ gedreht (Scheitelwinkel): eine halbe Drehung um S */
    const drehA = 180 * us;
    return (
      <>
        <Strich x1={g2x} y1={g2y} x2={g1x} y2={g1y} u={ug} b={2.2} />
        <Strich x1={h2x} y1={h2y} x2={h1x} y2={h1y} u={ug} b={2.2} f={F.blau} />
        <Wk von={0} bis={a} f={F.granat} fl={F.granatHell} t={`α = ${a}°`} o={ua} r={30} tr={72} />
        {us > 0 && us < 1 && <path d={sektor(sx, sy, 30, drehA, a + drehA)} fill={F.granatHell} stroke={F.granat} strokeWidth="1.4" opacity="0.7" />}
        <Wk von={180} bis={180 + a} f={F.granat} fl={F.granatHell} t={`γ = ${a}°`} o={us >= 1 ? 1 : 0} r={30} tr={72} />
        <Wk von={a} bis={180} f={F.goldDunkel} fl={F.goldHell} t={`β = ${b}°`} o={un} r={22} tr={56} />
        <Wk von={180 + a} bis={360} f={F.goldDunkel} fl={F.goldHell} t={`δ = ${b}°`} o={ud} r={22} tr={56} />
        {un > 0 && <path d={bogen(sx, sy, 88, 0, 180 * teil(un, 0, 0.7))} fill="none" stroke={F.gold} strokeWidth="2" strokeDasharray="4 3" opacity={1 - teil(un, 0.8, 1) * 0.6} />}
        <circle cx={sx} cy={sy} r={4} fill={F.tinte} opacity={ug} />
        <g opacity={un}>
          <Tx x={290} y={34} g={10} f={F.grau} w={700}>Nebenwinkel</Tx>
          <Tx x={290} y={52} g={12} f={F.tinte} w={800}>{`α + β = 180°`}</Tx>
        </g>
        <g opacity={us}>
          <Tx x={290} y={84} g={10} f={F.grau} w={700}>Scheitelwinkel</Tx>
          <Tx x={290} y={102} g={12} f={F.tinte} w={800}>α = γ</Tx>
          <Tx x={290} y={120} g={12} f={F.tinte} w={800} opacity={ud}>β = δ</Tx>
        </g>
        <g opacity={uq}>
          <rect x={232} y={146} width={116} height={52} rx="12" fill={F.granatTief} />
          <Tx x={290} y={168} g={10.5} f={F.rosa} w={700}>alle vier</Tx>
          <Tx x={290} y={188} g={14} f={F.goldHell} w={800}>= 360°</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_zirkel – Zirkel zeichnet den Kreis; Radius und Durchmesser erscheinen; d = 2r
   p: { r: 3 }
   ============================================================ */
const g_zirkel = {
  h: 214,
  label: (p) => `Kreis mit r = ${p.r} cm und d = ${2 * p.r} cm`,
  ablauf: (p) => [
    { k: "mitte", ms: 900, text: "Die Zirkelspitze kommt in den Mittelpunkt M." },
    { k: "oeffnen", ms: 1100, text: `Den Zirkel auf den Radius einstellen: r = ${p.r} cm.` },
    { k: "kreis", ms: 2200, text: `Einmal herum: Jeder Punkt der Kreislinie ist ${p.r} cm von M entfernt.` },
    { k: "durch", ms: 1400, text: `Der Durchmesser geht durch M von Rand zu Rand: d = 2 · r = ${2 * p.r} cm.` },
    { k: "begriffe", ms: 1600, text: "Dazu: Sehne, Kreisbogen und Kreisausschnitt." },
  ],
  bild: ({ Z, p }) => {
    const mx = 120, my = 112, R = 74, um = Z("mitte"), uo = Z("oeffnen"), uk = Z("kreis", linear), ud = Z("durch"), ub = Z("begriffe");
    const w = 360 * uk, rr = R * uo;
    const [px, py] = pol(mx, my, rr, w);
    /* Zirkel: Gelenk über der Mitte zwischen Spitze und Mine */
    const gx = (mx + px) / 2, gy = Math.min(my, py) - 64 + Math.abs(py - my) * 0.3;
    const zirkelSicht = um * (1 - teil(ud, 0, 0.4));
    return (
      <>
        <path d={sektor(mx, my, R, 20, 70)} fill={F.goldHell} opacity={ub} />
        {uk > 0 && <path d={bogen(mx, my, R, 0, Math.max(0.5, w))} fill="none" stroke={F.granat} strokeWidth="2.6" strokeLinecap="round" />}
        <g opacity={ub}>
          <path d={bogen(mx, my, R, 20, 70)} fill="none" stroke={F.gold} strokeWidth="4.5" strokeLinecap="round" />
          <line x1={pol(mx, my, R, 200)[0]} y1={pol(mx, my, R, 200)[1]} x2={pol(mx, my, R, 300)[0]} y2={pol(mx, my, R, 300)[1]} stroke={F.blau} strokeWidth="2" />
        </g>
        <line x1={mx} y1={my} x2={mx + rr} y2={my} stroke={F.gold} strokeWidth="2.4" opacity={uo * (uk >= 1 ? 1 : 0.9)} strokeLinecap="round" />
        <Tx x={mx + rr / 2 + 4} y={my + 17} g={11} f={F.goldDunkel} w={800} opacity={teil(uo, 0.6, 1)}>{`r = ${p.r} cm`}</Tx>
        <g opacity={ud}>
          <line x1={mx - R} y1={my + 0.01} x2={mx - R + 2 * R * ud} y2={my} stroke={F.blau} strokeWidth="2.4" strokeLinecap="round" transform={`rotate(-90 ${mx} ${my})`} />
          <Tx x={mx - 8} y={my - R / 2} g={11} f={F.blau} w={800} a="end">{`d = ${2 * p.r} cm`}</Tx>
        </g>
        <circle cx={mx} cy={my} r={4} fill={F.tinte} opacity={um} />
        <Tx x={mx - 10} y={my + 17} g={12} f={F.tinte} w={800} opacity={um}>M</Tx>
        {zirkelSicht > 0 && (
          <g opacity={zirkelSicht}>
            <line x1={mx} y1={my} x2={gx} y2={gy} stroke={F.grau} strokeWidth="3" strokeLinecap="round" />
            <line x1={gx} y1={gy} x2={px} y2={py} stroke={F.grau} strokeWidth="3" strokeLinecap="round" />
            <circle cx={gx} cy={gy} r={5} fill={F.tinte} />
            <rect x={gx - 2.5} y={gy - 18} width={5} height={13} rx="2" fill={F.tinte} />
            <circle cx={px} cy={py} r={3} fill={F.granat} />
          </g>
        )}
        <g opacity={ub}>
          <path d="M246 140 q8 -8 18 -6" fill="none" stroke={F.gold} strokeWidth="4.5" strokeLinecap="round" />
          <Tx x={274} y={142} g={11} f={F.goldDunkel} w={800} a="start">Kreisbogen</Tx>
          <path d="M246 168 L264 168 L258 154 Z" fill={F.goldHell} />
          <Tx x={274} y={166} g={11} f={F.goldDunkel} w={800} a="start">Ausschnitt</Tx>
          <line x1={246} y1={186} x2={264} y2={182} stroke={F.blau} strokeWidth="2" />
          <Tx x={274} y={189} g={11} f={F.blau} w={800} a="start">Sehne</Tx>
        </g>
        <g opacity={ud}>
          <rect x={236} y={56} width={112} height={56} rx="12" fill={F.granatTief} />
          <Tx x={292} y={80} g={14} f={F.goldHell} w={800}>d = 2 · r</Tx>
          <Tx x={292} y={100} g={11} f={F.weiss} w={800}>{`${2 * p.r} cm = 2 · ${p.r} cm`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_blume – Kreisbögen mit gleichem Radius, der Mittelpunkt wandert: die Blume aus sechs Bögen
   ============================================================ */
const g_blume = {
  h: 214,
  label: () => "Kreisblume aus sechs Bögen",
  ablauf: () => [
    { k: "kreis", ms: 1300, text: "Ein Kreis um M. Den Radius nicht mehr verstellen!" },
    { k: "boegen", ms: 3300, text: "Spitze auf die Kreislinie, Bogen ziehen – vom neuen Schnittpunkt aus weiter." },
    { k: "fertig", ms: 1500, text: "Sechs Bögen, sechs Schritte: Der Radius passt genau sechsmal um den Kreis." },
  ],
  bild: ({ Z, z }) => {
    const mx = 130, my = 108, R = 76, uk = Z("kreis", linear), ub = z("boegen"), uf = Z("fertig");
    return (
      <>
        <path d={bogen(mx, my, R, 0, Math.max(0.5, 360 * uk))} fill="none" stroke={F.granat} strokeWidth="2.2" opacity={uk > 0 ? 1 : 0} />
        <circle cx={mx} cy={my} r={3.5} fill={F.tinte} />
        {Array.from({ length: 6 }, (_, i) => {
          const u = staffel(ub, i, 6, 0.15), w0 = 90 + i * 60, [cx, cy] = pol(mx, my, R, w0);
          if (u <= 0) return null;
          /* Bogen um (cx,cy) mit Radius R durch M: von w0+120 bis w0+240 */
          const a0 = w0 + 120, a1 = w0 + 240;
          return (
            <g key={i}>
              <path d={bogen(cx, cy, R, a0, a0 + (a1 - a0) * sanft(u))} fill="none" stroke={i % 2 ? F.blau : F.gold} strokeWidth="2.4" strokeLinecap="round" />
              <circle cx={cx} cy={cy} r={3.5} fill={F.granat} opacity={u < 1 ? 1 : 0.6} />
              {u < 1 && <Puls x={cx} y={cy} u={u} r={10} f={F.granat} />}
            </g>
          );
        })}
        <g opacity={uf}>
          <rect x={232} y={70} width={116} height={64} rx="12" fill={F.flaeche} />
          <Tx x={290} y={94} g={12} f={F.granat} w={800}>6 Bögen</Tx>
          <Tx x={290} y={114} g={11} f={F.grau} w={700}>immer derselbe r</Tx>
        </g>
      </>
    );
  },
};


export const SZENEN_GEOMETRIE = {
  g_lineal, g_schritte, g_treppe, g_kommatafel, g_balken, g_zeitspanne, g_massstab,
  g_linien, g_lot, g_parallel, g_koordinaten, g_spiegeln, g_drehung,
  g_vierecke, g_koerper, g_schraegbild,
  g_dreiecke, g_zentimeterquadrat, g_rechteck, g_umfang, g_gleicherumfang, g_lfigur, g_parallelogramm, g_dreieckflaeche,
  g_wuerfelnetz, g_oberflaeche, g_kubikdezimeter, g_volumen,
  g_winkelteile, g_winkelarten, g_geodreieck, g_winkelzeichnen, g_ueberstumpf, g_scheitelwinkel, g_zirkel, g_blume,
};
