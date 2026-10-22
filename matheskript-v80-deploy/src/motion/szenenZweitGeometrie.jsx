/* Zweite Animationen (Gruppe Geometrie) für Lerneinheiten, die bisher nur eine hatten – Vertrag: siehe kern.jsx */
import React from "react";
import { B, F, Tx, Strich, Pille, Puls, Spitze, mix, klemm, teil, staffel, raus, sanft } from "./kern.jsx";

/* ---------- lokale Hilfen (wie in szenenGeometrie.jsx, dort nicht exportiert) ---------- */
const rad = (g) => (g * Math.PI) / 180;
/* Punkt auf Kreis (mathematischer Winkel in Grad, gegen den Uhrzeigersinn, y nach oben) */
const pol = (cx, cy, r, g) => [cx + r * Math.cos(rad(g)), cy - r * Math.sin(rad(g))];
const n1 = (v) => Math.round(v * 100) / 100;
function arcA(cx, cy, r, a0, a1) {
  const [x, y] = pol(cx, cy, r, a1);
  return `A${n1(r)} ${n1(r)} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 0 : 1} ${n1(x)} ${n1(y)}`;
}
function bogen(cx, cy, r, a0, a1) {
  const [x0, y0] = pol(cx, cy, r, a0);
  return `M${n1(x0)} ${n1(y0)} ${arcA(cx, cy, r, a0, a1)}`;
}
const sektor = (cx, cy, r, a0, a1) => `M${n1(cx)} ${n1(cy)} L${bogen(cx, cy, r, a0, a1).slice(1)} Z`;
const pts = (liste) => liste.map(([x, y]) => `${n1(x)},${n1(y)}`).join(" ");
const mixP = (a, b, u) => [mix(a[0], b[0], u), mix(a[1], b[1], u)];
const zieh = (u) => ({ pathLength: 1, strokeDasharray: "1 2", strokeDashoffset: 1 - klemm(u) });

/* ============================================================
   3D-Faltung beliebiger Würfelnetze
   Zellen [i, j] (Spalte, Zeile) liegen in der Ebene y = 0: x = i … i+1, z = j … j+1.
   Baum per Breitensuche ab der Wurzel; jede Fläche klappt an der gemeinsamen Kante mit ihrem Elternteil um 90° nach oben.
   ============================================================ */
function rotAchse(p, a, b, w) {
  const k = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...k), u = k.map((v) => v / l);
  const v = [p[0] - a[0], p[1] - a[1], p[2] - a[2]], c = Math.cos(rad(w)), s = Math.sin(rad(w));
  const kreuz = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const pkt = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  return [0, 1, 2].map((i) => a[i] + v[i] * c + kreuz[i] * s + u[i] * pkt * (1 - c));
}
function netzBaum(zellen, wurzel = 0) {
  const fl = zellen.map(([i, j], n) => ({ n, i, j, ecken: [[i, 0, j], [i + 1, 0, j], [i + 1, 0, j + 1], [i, 0, j + 1]] }));
  const besucht = new Set([wurzel]), schlange = [wurzel];
  while (schlange.length) {
    const e = fl[schlange.shift()];
    for (const f of fl) {
      if (besucht.has(f.n) || Math.abs(f.i - e.i) + Math.abs(f.j - e.j) !== 1) continue;
      const nx = f.i - e.i, nz = f.j - e.j, m = [e.i + 0.5 + nx / 2, 0, e.j + 0.5 + nz / 2], d = [-nz, 0, nx];
      /* Achsrichtung d mit d × n = +y: dann klappt die Fläche bei positivem Winkel nach oben */
      f.eltern = e.n;
      f.achse = [[m[0] - d[0] / 2, 0, m[2] - d[2] / 2], [m[0] + d[0] / 2, 0, m[2] + d[2] / 2]];
      besucht.add(f.n); schlange.push(f.n);
    }
  }
  return fl;
}
function netzFalten(fl, winkel) {
  return fl.map((f) => {
    let p3 = f.ecken.map((p) => p.slice());
    for (let g = f; g && g.eltern != null; g = fl[g.eltern]) p3 = p3.map((p) => rotAchse(p, g.achse[0], g.achse[1], winkel));
    return p3;
  });
}
/* Projektion: Drehung phi um die y-Achse, Kamera von schräg oben (Höhe el) und vorn (+z) */
function kamera(phi, el, cx, cy, s, mitte) {
  const cp = Math.cos(rad(phi)), sp = Math.sin(rad(phi)), ce = Math.cos(rad(el)), se = Math.sin(rad(el));
  return (p) => {
    const x = p[0] - mitte[0], y = p[1] - mitte[1], z = p[2] - mitte[2];
    const x1 = x * cp + z * sp, z1 = -x * sp + z * cp;
    return { x: cx + x1 * s, y: cy - (y * ce - z1 * se) * s, d: y * se + z1 * ce };
  };
}
function mitteVon(welt) {
  const alle = welt.flat(), mm = [0, 1, 2].map((k) => [Math.min(...alle.map((p) => p[k])), Math.max(...alle.map((p) => p[k]))]);
  return mm.map(([a, b]) => (a + b) / 2);
}
/* Indizes der Flächen, die nach dem vollständigen Falten auf derselben Würfelseite liegen */
function ueberlapp(fl) {
  const welt = netzFalten(fl, 90), schl = welt.map((e) => [0, 1, 2].map((k) => Math.round((e.reduce((t, p) => t + p[k], 0) / 4) * 10)).join(","));
  return new Set(schl.flatMap((s, n) => (schl.filter((t) => t === s).length > 1 ? [n] : [])));
}
function NetzBild({ fl, winkel, phi, el, cx, cy, s, fuell, rand, o = 1 }) {
  if (o <= 0) return null;
  const welt = netzFalten(fl, winkel), P = kamera(phi, el, cx, cy, s, mitteVon(welt));
  const liste = welt.map((e, n) => { const q = e.map(P); return { n, q, d: q.reduce((t, a) => t + a.d, 0) / 4 }; }).sort((a, b) => a.d - b.d);
  return (
    <g opacity={o}>
      {liste.map(({ n, q }) => <polygon key={n} points={pts(q.map((a) => [a.x, a.y]))} fill={fuell(n)} fillOpacity="0.94" stroke={rand(n)} strokeWidth="1.6" strokeLinejoin="round" />)}
    </g>
  );
}

/* ============================================================
   g_netzwahl – Zwei Netze, eins wird zum Würfel, beim anderen landen zwei Flächen auf derselben Seite
   Netz A (1-4-1): Viererreihe, oben links eine, unten rechts eine. Netz B: Viererreihe, zwei oben auf derselben Seite.
   ============================================================ */
const NETZ_A = netzBaum([[1, 1], [0, 1], [2, 1], [3, 1], [0, 0], [3, 2]]);
const NETZ_B = netzBaum([[1, 1], [0, 1], [2, 1], [3, 1], [0, 0], [2, 0]]);
const NETZ_B_DOPPELT = ueberlapp(NETZ_B);
const g_netzwahl = {
  h: 222,
  label: () => "Zwei Netze werden gefaltet: Netz A ergibt einen Würfel, Netz B nicht",
  ablauf: () => [
    { k: "netze", ms: 1400, text: "Zwei Netze aus je sechs Quadraten. Welches wird ein Würfel?" },
    { k: "faltA", ms: 2200, text: "Netz A falten: Alle Flächen klappen um 90° hoch." },
    { k: "okA", ms: 1300, text: "Jede Würfelseite ist genau einmal bedeckt: ein Würfelnetz." },
    { k: "faltB", ms: 2200, text: "Jetzt Netz B falten …" },
    { k: "ueber", ms: 1700, text: "Zwei Flächen landen aufeinander – dafür bleibt ein Loch." },
    { k: "zurueck", ms: 1700, text: "Aufgeklappt: Die roten Flächen sind die doppelten." },
  ],
  bild: ({ Z }) => {
    const un = Z("netze"), ua = Z("faltA"), uok = Z("okA"), ub = Z("faltB"), uu = Z("ueber"), uz = Z("zurueck");
    const fB = ub * (1 - uz);
    const ansicht = (u) => ({ phi: 32 * u, el: mix(90, 30, u), s: mix(24, 44, u) });
    const vA = ansicht(ua), vB = ansicht(fB), rot = uu > 0.4;
    return (
      <>
        <g opacity={un}>
          <Tx x={95} y={24} g={13} f={F.goldDunkel} w={800}>A</Tx>
          <Tx x={265} y={24} g={13} f={F.blau} w={800}>B</Tx>
          <line x1={180} y1={30} x2={180} y2={180} stroke={F.linie} strokeWidth="1.2" />
        </g>
        <NetzBild fl={NETZ_A} winkel={90 * ua} phi={vA.phi} el={vA.el} cx={95} cy={108} s={vA.s} o={un}
          fuell={() => F.goldHell} rand={() => F.goldDunkel} />
        <NetzBild fl={NETZ_B} winkel={90 * fB} phi={vB.phi} el={vB.el} cx={265} cy={108} s={vB.s} o={un}
          fuell={(n) => (rot && NETZ_B_DOPPELT.has(n) ? F.granatHell : F.blauHell)} rand={(n) => (rot && NETZ_B_DOPPELT.has(n) ? F.granat : F.blau)} />
        <Puls x={265} y={96} u={teil(uu, 0.2, 0.9)} r={30} f={F.granat} />
        <Pille x={95} y={206} text="Würfelnetz ✓" g={11} f={F.goldHell} tf={F.goldDunkel} o={uok} />
        <Pille x={265} y={206} text={uz > 0.3 ? "kein Würfelnetz" : "überlappt!"} g={11} f={F.granatHell} tf={F.granat} o={uu} />
      </>
    );
  },
};

/* ============================================================
   g_flaechenpaare – Gegenüberliegende Flächen sind gleich groß: O = 2 · (ab + ac + bc)
   p: { a: 4, b: 3, c: 2 }   a Länge, b Breite (Tiefe), c Höhe
   ============================================================ */
const g_flaechenpaare = {
  h: 224,
  label: (p) => `Quader ${p.a} × ${p.b} × ${p.c}: drei Flächenpaare, O = ${2 * (p.a * p.b + p.a * p.c + p.b * p.c)} cm²`,
  ablauf: (p) => [
    { k: "quader", ms: 1300, text: `Ein Quader: ${p.a} cm lang, ${p.b} cm breit, ${p.c} cm hoch – sechs Flächen.` },
    { k: "p0", ms: 1700, text: `Oben und unten liegen sich gegenüber: gleich groß, je ${p.a} · ${p.b} = ${p.a * p.b} cm².` },
    { k: "p1", ms: 1700, text: `Vorn und hinten: je ${p.a} · ${p.c} = ${p.a * p.c} cm².` },
    { k: "p2", ms: 1700, text: `Rechts und links: je ${p.b} · ${p.c} = ${p.b * p.c} cm².` },
    { k: "summe", ms: 2000, text: `Jedes Paar zählt doppelt: O = 2 · (${p.a * p.b} + ${p.a * p.c} + ${p.b * p.c}) = ${2 * (p.a * p.b + p.a * p.c + p.b * p.c)} cm².` },
  ],
  bild: ({ Z, p }) => {
    const { a, b, c } = p, uq = Z("quader"), up = [Z("p0"), Z("p1"), Z("p2")], us = Z("summe");
    const k = 30, dd = k * 0.5 * Math.SQRT1_2, x0 = 44, y0 = 182;
    const S = (x, y, z) => [x0 + x * k + z * dd, y0 - y * k - z * dd];
    const P = (liste) => pts(liste.map((q) => S(...q)));
    const PAAR = [
      { n: "oben = unten", w: a * b, ab: `${a} · ${b}`, f: F.goldHell, r: F.goldDunkel, rw: [a, b],
        sicht: [[0, c, 0], [a, c, 0], [a, c, b], [0, c, b]], verdeckt: [[0, 0, 0], [a, 0, 0], [a, 0, b], [0, 0, b]] },
      { n: "vorn = hinten", w: a * c, ab: `${a} · ${c}`, f: F.granatHell, r: F.granat, rw: [a, c],
        sicht: [[0, 0, 0], [a, 0, 0], [a, c, 0], [0, c, 0]], verdeckt: [[0, 0, b], [a, 0, b], [a, c, b], [0, c, b]] },
      { n: "rechts = links", w: b * c, ab: `${b} · ${c}`, f: F.blauHell, r: F.blau, rw: [b, c],
        sicht: [[a, 0, 0], [a, 0, b], [a, c, b], [a, c, 0]], verdeckt: [[0, 0, 0], [0, 0, b], [0, c, b], [0, c, 0]] },
    ];
    const summe = PAAR.reduce((t, q) => t + q.w, 0);
    const verdecktKanten = [[[0, 0, b], [a, 0, b]], [[0, 0, b], [0, c, b]], [[0, 0, b], [0, 0, 0]]];
    const mitte = (liste) => { const q = liste.map((v) => S(...v)); return [q.reduce((t, v) => t + v[0], 0) / 4, q.reduce((t, v) => t + v[1], 0) / 4]; };
    return (
      <>
        <g opacity={uq}>
          {verdecktKanten.map(([u, v], i) => { const [xa, ya] = S(...u), [xb, yb] = S(...v); return <line key={i} x1={xa} y1={ya} x2={xb} y2={yb} stroke={F.hell} strokeWidth="1.3" strokeDasharray="3 3" />; })}
          {PAAR.map((q, i) => (
            <polygon key={"s" + i} points={P(q.sicht)} fill={up[i] > 0.3 ? q.f : F.flaeche} fillOpacity="0.88" stroke={F.tinte} strokeWidth="1.7" strokeLinejoin="round" />
          ))}
          {PAAR.map((q, i) => up[i] > 0 && up[i] < 1 && (
            <polygon key={"v" + i} points={P(q.verdeckt)} fill={q.f} fillOpacity={0.55 * Math.sin(Math.PI * up[i])} stroke={q.r} strokeWidth="1.6" strokeDasharray="4 3" />
          ))}
          {PAAR.map((q, i) => { const [mx, my] = mitte(q.sicht); return <Tx key={"t" + i} x={mx} y={my + 4} g={11} f={q.r} w={800} o={teil(up[i], 0.4, 0.9)}>{`${q.w} cm²`}</Tx>; })}
          <Tx x={x0 + (a * k) / 2} y={y0 + 17} g={11} f={F.tinte} w={800}>{`${a} cm`}</Tx>
          <Tx x={x0 - 6} y={y0 - (c * k) / 2 + 4} g={11} f={F.tinte} w={800} a="end">{`${c} cm`}</Tx>
          <Tx x={S(a, 0, b / 2)[0] + 8} y={S(a, 0, b / 2)[1] + 10} g={11} f={F.tinte} w={800} a="start">{`${b} cm`}</Tx>
        </g>
        {PAAR.map((q, i) => {
          const y = 22 + i * 48, m = 6, [w, h] = q.rw;
          return (
            <g key={"r" + i} opacity={teil(up[i], 0.3, 0.8)}>
              <Tx x={228} y={y} g={9.5} f={F.grau} w={700} a="start">{q.n}</Tx>
              <rect x={228} y={y + 6} width={w * m} height={h * m} fill={q.f} stroke={q.r} strokeWidth="1.2" />
              <rect x={232 + w * m} y={y + 6} width={w * m} height={h * m} fill={q.f} stroke={q.r} strokeWidth="1.2" />
              <Tx x={350} y={y + 20} g={12} f={q.r} w={800} a="end">{`2 · ${q.w}`}</Tx>
            </g>
          );
        })}
        <g opacity={us} transform={`translate(0 ${(1 - us) * 6})`}>
          <rect x={222} y={164} width={132} height={52} rx="12" fill={F.granatTief} />
          <Tx x={288} y={185} g={11.5} f={F.weiss} w={800}>
            {"O = 2 · ("}<tspan fill={F.gold}>{PAAR[0].w}</tspan>{" + "}<tspan fill={F.rosa}>{PAAR[1].w}</tspan>{" + "}<tspan fill={F.blauHell}>{PAAR[2].w}</tspan>{")"}
          </Tx>
          <Tx x={288} y={205} g={13} f={F.goldHell} w={800}>{`= 2 · ${summe} = ${2 * summe} cm²`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_kantedoppelt – Einheitswürfel zählen; eine Kante verdoppeln → Volumen doppelt, zwei Kanten → vierfach
   p: { a: 3, b: 2, c: 1 }
   ============================================================ */
function Wuerfel({ x, y, k, d, f, rand, o = 1 }) {
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <polygon points={pts([[x, y], [x + d, y - d], [x + k + d, y - d], [x + k, y]])} fill={F.weiss} stroke={rand} strokeWidth="0.8" />
      <polygon points={pts([[x + k, y], [x + k + d, y - d], [x + k + d, y + k - d], [x + k, y + k]])} fill={rand} fillOpacity="0.35" stroke={rand} strokeWidth="0.8" />
      <rect x={x} y={y} width={k} height={k} fill={f} stroke={rand} strokeWidth="0.8" />
    </g>
  );
}
const g_kantedoppelt = {
  h: 222,
  label: (p) => `Quader ${p.a} × ${p.b} × ${p.c}: Länge verdoppelt → doppeltes Volumen, auch Höhe verdoppelt → vierfaches Volumen`,
  ablauf: (p) => {
    const V = p.a * p.b * p.c;
    return [
      { k: "start", ms: 1700, text: `Ein Quader aus ${V} Zentimeterwürfeln: V = ${p.a} · ${p.b} · ${p.c} = ${V} cm³.` },
      { k: "laenger", ms: 2200, text: `Länge verdoppeln: Ein zweiter, gleicher Block kommt dazu – ${2 * V} cm³.` },
      { k: "hoeher", ms: 2200, text: `Auch die Höhe verdoppeln: Alles noch einmal obendrauf – ${4 * V} cm³.` },
      { k: "regel", ms: 1500, text: "Jede verdoppelte Kante verdoppelt das Volumen noch einmal." },
    ];
  },
  bild: ({ Z, z, p }) => {
    const { a, b, c } = p, V = a * b * c;
    const us = z("start"), ul = Z("laenger"), ud = teil(z("laenger"), 0.75, 1), uh = Z("hoeher"), uz = teil(z("hoeher"), 0.75, 1), uv = Z("regel");
    const k = 25, d = k * 0.5 * Math.SQRT1_2 * 1.3, x0 = 42, y0 = 192;
    const teile = [];
    const n0 = a * b * c;
    for (let h = 0; h < 2 * c; h++) {
      for (let t = b - 1; t >= 0; t--) {
        for (let i = 0; i < 2 * a; i++) {
          const neuL = i >= a, neuH = h >= c;
          let o, dx = 0, dy = 0, f, r;
          if (neuH) {
            o = teil(uh, 0.1, 0.6); dy = -(1 - raus(teil(uh, 0, 0.8))) * 34; f = F.blauHell; r = F.blau;
          } else if (neuL) {
            o = teil(ul, 0.05, 0.5); dx = (1 - raus(teil(ul, 0, 0.85))) * 40; f = F.granatHell; r = F.granat;
          } else {
            const nr = h * a * b + (b - 1 - t) * a + i;
            o = klemm(us * n0 * 1.15 - nr); f = F.goldHell; r = F.goldDunkel;
          }
          if (o <= 0) continue;
          teile.push(<Wuerfel key={`${h}-${t}-${i}`} x={x0 + i * k + t * d + dx} y={y0 - h * k - t * d - k + dy} k={k} d={d} o={o} f={f} rand={r} />);
        }
      }
    }
    const zeilen = [
      { t: `${a} · ${b} · ${c} = ${V}`, z: "", f: F.goldDunkel, o: klemm(us * 3) },
      { t: `${2 * a} · ${b} · ${c} = ${2 * V}`, z: "· 2", f: F.granat, o: ud },
      { t: `${2 * a} · ${b} · ${2 * c} = ${4 * V}`, z: "· 4", f: F.blau, o: uz },
    ];
    const laenge = ul > 0.5 ? 2 * a : a, hoehe = uh > 0.5 ? 2 * c : c;
    return (
      <>
        {teile}
        <Tx x={x0 + (laenge * k) / 2} y={y0 + 16} g={11} f={ul > 0.5 ? F.granat : F.tinte} w={800} o={klemm(us * 3)}>{`Länge ${laenge} cm`}</Tx>
        <Tx x={x0 - 4} y={y0 - (hoehe * k) / 2 + 4} g={11} f={uh > 0.5 ? F.blau : F.tinte} w={800} a="end" o={klemm(us * 3)}>{`${hoehe} cm`}</Tx>
        <g>
          <Tx x={290} y={24} g={10} f={F.grau} w={700}>Volumen in cm³</Tx>
          {zeilen.map((q, i) => (
            <g key={i} opacity={q.o}>
              <rect x={226} y={34 + i * 36} width={128} height={28} rx="14" fill={F.flaeche} />
              <Tx x={236} y={52.5 + i * 36} g={12} f={q.f} w={800} a="start">{q.t}</Tx>
              {q.z && <Tx x={346} y={52.5 + i * 36} g={11} f={q.f} w={800} a="end">{q.z}</Tx>}
            </g>
          ))}
        </g>
        <g opacity={uv} transform={`translate(0 ${(1 - uv) * 6})`}>
          <rect x={226} y={150} width={128} height={56} rx="12" fill={F.granatTief} />
          <Tx x={290} y={173} g={10.5} f={F.goldHell} w={800}>1 Kante · 2 → V · 2</Tx>
          <Tx x={290} y={192} g={10.5} f={F.weiss} w={800}>2 Kanten · 2 → V · 4</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_winkeldrehung – Ein Winkel ist eine Drehung um den Scheitel: Minutenzeiger, 1 min = 6°
   ============================================================ */
const g_winkeldrehung = {
  h: 214,
  label: () => "Der Minutenzeiger dreht sich um 60°, 90° und 120°: Ein Winkel ist eine Drehung um den Scheitel",
  ablauf: () => [
    { k: "uhr", ms: 1100, text: "Der Minutenzeiger einer Uhr dreht sich um die Mitte." },
    { k: "start", ms: 1100, text: "Er startet bei der 12 – diese Lage bleibt als Schenkel stehen." },
    { k: "d10", ms: 1900, text: "10 Minuten: 60°. Eine Stunde sind 360°, also 6° je Minute." },
    { k: "d15", ms: 1300, text: "15 Minuten: eine Vierteldrehung, 90°." },
    { k: "d20", ms: 1300, text: "20 Minuten: 20 · 6° = 120°." },
    { k: "namen", ms: 1900, text: "Drehpunkt = Scheitel, Anfang und Ende der Drehung = Schenkel." },
  ],
  bild: ({ Z, z }) => {
    const cx = 108, cy = 110, R = 84, uu = Z("uhr"), ust = Z("start"), un = Z("namen");
    const w = 60 * Z("d10") + 30 * Z("d15") + 30 * Z("d20");
    const ticks = Array.from({ length: 60 }, (_, m) => {
      const g = 90 - 6 * m, lang = m % 5 === 0, [x1, y1] = pol(cx, cy, R, g), [x2, y2] = pol(cx, cy, R - (lang ? 9 : 4), g);
      return <line key={m} x1={x1} y1={y1} x2={x2} y2={y2} stroke={lang ? F.tinte : F.hell} strokeWidth={lang ? 1.6 : 1} />;
    });
    const ziffern = [[12, 0], [3, 15], [6, 30], [9, 45]].map(([t, m]) => { const [x, y] = pol(cx, cy, R - 20, 90 - 6 * m); return <Tx key={t} x={x} y={y + 4} g={11} f={F.grau} w={800}>{t}</Tx>; });
    const [ex, ey] = pol(cx, cy, 72, 90 - w), [mx, my] = pol(cx, cy, 50, 90 - w / 2);
    const recht = Math.abs(w - 90) < 0.5;
    const tabelle = [[10, 60, "d10"], [15, 90, "d15"], [20, 120, "d20"]];
    return (
      <>
        <g opacity={uu}>
          <circle cx={cx} cy={cy} r={R} fill={F.flaeche} stroke={F.tinte} strokeWidth="2" />
          {ticks}{ziffern}
        </g>
        {w > 0.5 && (recht
          ? <g><path d={bogen(cx, cy, 24, 0, 90)} fill="none" stroke={F.granat} strokeWidth="1.6" /><circle cx={pol(cx, cy, 12, 45)[0]} cy={pol(cx, cy, 12, 45)[1]} r="1.8" fill={F.granat} /></g>
          : <path d={sektor(cx, cy, 30, 90 - w, 90)} fill={F.granatHell} stroke={F.granat} strokeWidth="1.6" />)}
        {w > 0.5 && <path d={bogen(cx, cy, 62, 90, 90 - w)} fill="none" stroke={F.gold} strokeWidth="2.4" strokeDasharray="4 3" />}
        <Strich x1={cx} y1={cy} x2={cx} y2={cy - 72} u={ust} f={F.tinte} b={2.6} />
        <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={F.granat} strokeWidth="3.2" strokeLinecap="round" opacity={uu} />
        <circle cx={cx} cy={cy} r={4.5} fill={F.tinte} opacity={uu} />
        {w > 12 && <Tx x={mx} y={my + 4} g={12} f={F.granat} w={800}>{`${Math.round(w)}°`}</Tx>}
        <g opacity={un}>
          <Tx x={cx - 8} y={cy + 20} g={10.5} f={F.tinte} w={800} a="end">Scheitel</Tx>
          <Tx x={cx - 6} y={cy - 46} g={10.5} f={F.tinte} w={700} a="end">Schenkel</Tx>
          <Tx x={pol(cx, cy, R + 6, 90 - w)[0]} y={pol(cx, cy, R + 6, 90 - w)[1] + 12} g={10.5} f={F.granat} w={700} a="start">Schenkel</Tx>
        </g>
        <Pille x={290} y={34} text="1 min = 6°" g={11.5} o={teil(Z("d10"), 0.4, 1)} />
        {tabelle.map(([m, g, k], i) => (
          <g key={m} opacity={z(k) >= 0.98 ? 1 : 0.3}>
            <rect x={232} y={56 + i * 32} width={116} height={24} rx="12" fill={z(k) >= 0.98 ? F.granatHell : F.flaeche} />
            <Tx x={246} y={72 + i * 32} g={11} f={F.tinte} w={800} a="start">{`${m} min`}</Tx>
            <Tx x={338} y={72 + i * 32} g={11} f={F.granat} w={800} a="end">{`${g}°`}</Tx>
          </g>
        ))}
        <g opacity={un}>
          <rect x={232} y={160} width={116} height={40} rx="12" fill={F.granatTief} />
          <Tx x={290} y={177} g={10} f={F.goldHell} w={800}>Winkel = Drehung</Tx>
          <Tx x={290} y={192} g={10} f={F.weiss} w={700}>um den Scheitel</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   g_winkelschaetzen – Drei Winkel einordnen: jeder dreht sich an zwei Hilfslinien (90° und 180°) vorbei;
   die überschrittene Linie leuchtet Gold, dann fällt der Winkel auf die Skala 0°–360°.
   p: { winkel: [65, 140, 250], schaetz: [60, 135, 240] }
   ============================================================ */
const ART = (w) => (w < 90 ? "spitz" : w < 180 ? "stumpf" : "überstumpf");
const ART_FARBE = (w) => (w < 90 ? [F.granat, F.granatHell] : w < 180 ? [F.goldDunkel, F.goldHell] : [F.blau, F.blauHell]);
const g_winkelschaetzen = {
  h: 236,
  label: (p) => `Winkel ${p.winkel.join("°, ")}° mit dem rechten und dem gestreckten Winkel vergleichen und einordnen`,
  ablauf: (p) => [
    { k: "ref", ms: 1400, text: "Zwei Hilfslinien zum Vergleich: der rechte Winkel und die Gerade." },
    ...p.winkel.map((w, i) => {
      const s = p.schaetz[i];
      return { k: `w${i}`, ms: 1800, text: w < 90 ? `Bleibt unter der 90°-Linie: spitz, etwa ${s}°. Gemessen: ${w}°.`
        : w < 180 ? `Über 90°, aber unter der Geraden: stumpf, etwa ${s}°. Gemessen: ${w}°.`
          : `Über die Gerade hinaus: überstumpf, etwa ${s}°. Gemessen: ${w}°.` };
    }),
  ],
  bild: ({ Z, z, p }) => {
    const L = 46, cy = 88, ys = 200, X = (v) => 20 + (v / 360) * 320, ur = Z("ref");
    return (
      <>
        {p.winkel.map((W, i) => {
          const cx = 60 + i * 120, u = z(`w${i}`), ud = sanft(teil(u, 0, 0.6)), w = W * ud;
          const [fl, fh] = ART_FARBE(W), [ex, ey] = pol(cx, cy, L, w), aktiv = u > 0 && u < 1;
          const linie = (grenze) => (aktiv && w > grenze ? F.gold : F.hell);
          return (
            <g key={i}>
              {/* Hilfslinien 90° (hoch) und 180° (nach links) */}
              <g opacity={ur}>
                <line x1={cx} y1={cy} x2={cx} y2={cy - L} stroke={linie(90)} strokeWidth={aktiv && w > 90 ? 2.4 : 1.4} strokeDasharray="4 3" />
                <line x1={cx} y1={cy} x2={cx - L} y2={cy} stroke={linie(180)} strokeWidth={aktiv && w > 180 ? 2.4 : 1.4} strokeDasharray="4 3" />
                <Tx x={cx + 3} y={cy - L - 4} g={9} f={F.grau} w={700} a="start">90°</Tx>
                <Tx x={cx - L} y={cy - 5} g={9} f={F.grau} w={700} a="start">180°</Tx>
                <line x1={cx} y1={cy} x2={cx + L} y2={cy} stroke={F.tinte} strokeWidth="2.2" strokeLinecap="round" />
                <circle cx={cx} cy={cy} r={3.5} fill={F.tinte} />
              </g>
              {u > 0 && (
                <g>
                  <path d={sektor(cx, cy, 17, 0, Math.max(w, 0.5))} fill={fh} stroke={fl} strokeWidth="1.4" />
                  <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={fl} strokeWidth="2.6" strokeLinecap="round" />
                  <circle cx={cx} cy={cy} r={3.5} fill={F.tinte} />
                </g>
              )}
              <g opacity={teil(u, 0.6, 0.85)}>
                <Tx x={cx} y={150} g={12} f={fl} w={800}>{ART(W)}</Tx>
                <Tx x={cx} y={164} g={9.5} f={F.grau} w={700}>{`geschätzt ≈ ${p.schaetz[i]}°`}</Tx>
                <Tx x={cx} y={176} g={9.5} f={F.tinte} w={800}>{`gemessen ${W}°`}</Tx>
              </g>
            </g>
          );
        })}
        {/* Skala 0° … 360° */}
        <g opacity={ur}>
          <rect x={X(0)} y={ys - 6} width={X(90) - X(0)} height={12} fill={F.granatHell} />
          <rect x={X(90)} y={ys - 6} width={X(180) - X(90)} height={12} fill={F.goldHell} />
          <rect x={X(180)} y={ys - 6} width={X(360) - X(180)} height={12} fill={F.blauHell} />
          {[0, 90, 180, 360].map((v) => <line key={v} x1={X(v)} y1={ys - 8} x2={X(v)} y2={ys + 8} stroke={F.tinte} strokeWidth="1.4" />)}
          <Tx x={X(45)} y={ys + 22} g={10} f={F.granat} w={800}>spitz</Tx>
          <Tx x={X(135)} y={ys + 22} g={10} f={F.goldDunkel} w={800}>stumpf</Tx>
          <Tx x={X(270)} y={ys + 22} g={10} f={F.blau} w={800}>überstumpf</Tx>
          <Tx x={X(90)} y={ys + 22} g={8.5} f={F.grau} w={700}>90°</Tx>
          <Tx x={X(180)} y={ys + 22} g={8.5} f={F.grau} w={700}>180°</Tx>
        </g>
        {p.winkel.map((v, j) => {
          const u = teil(z(`w${j}`), 0.6, 1), x = X(v);
          if (u <= 0) return null;
          const y = mix(182, ys - 9, raus(u));
          return (
            <g key={j} opacity={klemm(u * 2)}>
              <path d={`M${n1(x)} ${n1(y)} l-5 -8 h10 Z`} fill={F.tinte} />
            </g>
          );
        })}
      </>
    );
  },
};

/* ============================================================
   g_stufenwinkel – Zwei Parallelen, eine Schneidende: Kreuzung verschieben → Stufenwinkel gleich,
   Scheitelwinkel daneben → Wechselwinkel gleich; kippt h, gilt das nicht mehr
   p: { alpha: 55 }
   ============================================================ */
const g_stufenwinkel = {
  h: 214,
  label: (p) => `Stufen- und Wechselwinkel an Parallelen: alle ${p.alpha}°`,
  ablauf: (p) => [
    { k: "geraden", ms: 1200, text: "Zwei Parallelen g und h, eine dritte Gerade schneidet beide." },
    { k: "alpha", ms: 1000, text: `An der oberen Kreuzung: α = ${p.alpha}°.` },
    { k: "schieben", ms: 2000, text: "Die obere Kreuzung nach unten schieben – sie passt genau." },
    { k: "stufen", ms: 1300, text: `Gleiche Lage unten: Stufenwinkel, auch ${p.alpha}°.` },
    { k: "wechsel", ms: 1700, text: `Gegenüber am Scheitel: Wechselwinkel, auch ${p.alpha}°.` },
    { k: "kipp", ms: 2600, text: "Kippt h, passt die Kreuzung nicht mehr – nur an Parallelen gleich." },
  ],
  bild: ({ Z, p }) => {
    const a = p.alpha, ug = Z("geraden"), ua = Z("alpha"), us = Z("schieben"), ust = Z("stufen"), uw = Z("wechsel");
    const tau = -14 * Math.sin(Math.PI * Z("kipp", (u) => u));
    const Q = [118, 152], P = [118 + 82 / Math.tan(rad(a)), 70];
    const dir = [Math.cos(rad(a)), -Math.sin(rad(a))];
    const T0 = [Q[0] - 52 * dir[0], Q[1] - 52 * dir[1]], T1 = [Q[0] + 150 * dir[0], Q[1] + 150 * dir[1]];
    const [hl, hly] = pol(Q[0], Q[1], Q[0] - 14, 180 + tau), [hr, hry] = pol(Q[0], Q[1], 250 - Q[0], tau);
    const stufe = 180 + a - (180 + tau), wechsel = a - tau;
    const kopie = mixP(P, Q, us);
    const Wk = ({ c, von, bis, f, fl, t, o, r = 24, tr = 40 }) => {
      if (o <= 0) return null;
      const [tx, ty] = pol(c[0], c[1], tr, (von + bis) / 2);
      return <g opacity={o}><path d={sektor(c[0], c[1], r, von, bis)} fill={fl} stroke={f} strokeWidth="1.5" />{t && <Tx x={tx} y={ty + 4} g={11} f={f} w={800}>{t}</Tx>}</g>;
    };
    const PZ = ({ x, y, w = 0 }) => <path d="M-3 -4 L2 0 L-3 4" fill="none" stroke={F.blau} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${n1(x)} ${n1(y)}) rotate(${n1(-w)})`} />;
    const parallel = Math.abs(tau) < 0.5;
    return (
      <>
        <Strich x1={14} y1={P[1]} x2={250} y2={P[1]} u={ug} f={F.blau} b={2.2} />
        <line x1={hl} y1={hly} x2={hr} y2={hry} stroke={F.blau} strokeWidth="2.2" strokeLinecap="round" opacity={ug} />
        <Strich x1={T0[0]} y1={T0[1]} x2={T1[0]} y2={T1[1]} u={ug} b={2.2} />
        <g opacity={ug}>
          <Tx x={252} y={P[1] - 8} g={12} f={F.blau} w={800} a="end">g</Tx>
          <Tx x={hr} y={hry - 8} g={12} f={F.blau} w={800} a="end">h</Tx>
          <PZ x={40} y={P[1]} />
          {parallel && <PZ x={40} y={Q[1]} />}
        </g>
        <Wk c={P} von={180} bis={180 + a} f={F.granat} fl={F.granatHell} t={`α = ${a}°`} o={ua} tr={48} />
        {us > 0 && us < 1 && (
          <g opacity={0.8}>
            <line x1={kopie[0] - 46} y1={kopie[1]} x2={kopie[0] + 46} y2={kopie[1]} stroke={F.granat} strokeWidth="1.6" strokeDasharray="4 3" />
            <path d={sektor(kopie[0], kopie[1], 24, 180, 180 + a)} fill={F.granatHell} stroke={F.granat} strokeWidth="1.5" strokeDasharray="3 2" />
          </g>
        )}
        <Wk c={Q} von={180 + tau} bis={180 + a} f={F.granat} fl={F.granatHell} t={`${Math.round(stufe)}°`} o={ust} />
        <Puls x={pol(Q[0], Q[1], 14, 180 + a / 2)[0]} y={pol(Q[0], Q[1], 14, 180 + a / 2)[1]} u={teil(ust, 0, 0.8)} r={18} f={F.granat} />
        <Wk c={Q} von={tau} bis={a} f={F.goldDunkel} fl={F.goldHell} t={`${Math.round(wechsel)}°`} o={uw} />
        <circle cx={P[0]} cy={P[1]} r={3.5} fill={F.tinte} opacity={ug} />
        <circle cx={Q[0]} cy={Q[1]} r={3.5} fill={F.tinte} opacity={ug} />
        <g opacity={ust}>
          <rect x={262} y={20} width={92} height={42} rx="10" fill={F.granatHell} />
          <Tx x={308} y={37} g={10} f={F.granat} w={800}>Stufenwinkel</Tx>
          <Tx x={308} y={53} g={11} f={F.granat} w={800}>{parallel ? "gleich" : "ungleich"}</Tx>
        </g>
        <g opacity={uw}>
          <rect x={262} y={70} width={92} height={42} rx="10" fill={F.goldHell} />
          <Tx x={308} y={87} g={10} f={F.goldDunkel} w={800}>Wechselwinkel</Tx>
          <Tx x={308} y={103} g={11} f={F.goldDunkel} w={800}>{parallel ? "gleich" : "ungleich"}</Tx>
        </g>
        <g opacity={teil(Z("kipp"), 0.2, 0.6)}>
          <rect x={262} y={150} width={92} height={42} rx="10" fill={F.granatTief} />
          <Tx x={308} y={167} g={10} f={F.goldHell} w={800}>gilt nur, wenn</Tx>
          <Tx x={308} y={183} g={11} f={F.weiss} w={800}>g ∥ h</Tx>
        </g>
      </>
    );
  },
};

export const SZENEN_ZWEIT_GEOMETRIE = {
  g_netzwahl, g_flaechenpaare, g_kantedoppelt, g_winkeldrehung, g_winkelschaetzen, g_stufenwinkel,
};
