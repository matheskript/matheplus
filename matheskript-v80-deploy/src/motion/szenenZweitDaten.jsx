/* Zweite Animationen (Gruppe Daten) für Lerneinheiten, die bisher nur eine hatten – Vertrag: siehe kern.jsx */
import React from "react";
import { B, F, Tx, Spitze, Sprung, Pille, Puls, SvgBruch, breite, de, mix, klemm, teil, staffel, raus, sanft } from "./kern.jsx";

/* Bogenpfeil neben einer Tabellenspalte (von y1 nach y2), seite −1 = links, 1 = rechts */
function Bogen({ x, y1, y2, seite = -1, u = 1, text, f = F.granat, weite = 9, g = 10.5 }) {
  if (u <= 0) return null;
  const cx = x + seite * weite * 2, cy = (y1 + y2) / 2;
  const w = (Math.atan2(y2 - cy, x - cx) * 180) / Math.PI;
  return (
    <g>
      <path d={`M${x} ${y1} Q${cx} ${cy} ${x} ${y2}`} fill="none" stroke={f} strokeWidth="1.8" strokeLinecap="round" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - klemm(u)} />
      {u > 0.85 && <Spitze x={x} y={y2} winkel={w} f={f} g={6} o={teil(u, 0.85, 1)} />}
      {text && <Tx x={x + seite * (weite + 7)} y={cy + 4} g={g} f={f} w={800} a={seite < 0 ? "end" : "start"} o={teil(u, 0.4, 1)}>{text}</Tx>}
    </g>
  );
}

/* ============================================================
   dz_bereich_rechnen – Zahlenstrahl: 3 − 5 hat in ℕ keinen Platz → Strahl nach links (ℤ);
   3 : 4 teilt die Strecke 0…3 in 4 Teile, Ende bei 0,75 → ℚ
   p: {}
   ============================================================ */
const ZX = (v) => 30 + (v + 4) * (300 / 9);   // −4 … 5
const dz_bereich_rechnen = {
  h: 200,
  label: () => "Zahlenbereiche erweitern: 3 − 5 führt zu ℤ, 3 : 4 führt zu ℚ",
  ablauf: () => [
    { k: "n", ms: 1200, text: "ℕ auf dem Zahlenstrahl beginnt bei 0." },
    { k: "rueck", ms: 2000, text: "3 − 5: fünf Schritte nach links – nach drei ist bei 0 Schluss." },
    { k: "z", ms: 2600, text: "ℤ verlängert den Strahl nach links. Jetzt geht 3 − 5 = −2." },
    { k: "teil", ms: 1900, text: "3 : 4 heißt: die Strecke von 0 bis 3 in 4 gleiche Teile." },
    { k: "q", ms: 1700, text: "Ein Teil endet bei drei Vierteln – keine ganze Zahl. Dafür gibt es ℚ." },
    { k: "fertig", ms: 1500, text: "Jede Erweiterung macht eine neue Rechnung möglich." },
  ],
  bild: ({ Z, z }) => {
    /* Abschnitt z: erst wächst der Strahl nach links, dann folgen die letzten zwei Schritte */
    const y = 88, un = Z("n", raus), ur = z("rueck"), uz = sanft(teil(z("z"), 0, 0.45)), ue = teil(z("z"), 0.5, 1), ut = Z("teil"), uq = Z("q"), uf = Z("fertig");
    const xl = mix(ZX(0) - 8, ZX(-4) - 10, uz), xr = ZX(5) + 12;
    const dimm = 1 - 0.6 * teil(ut, 0, 0.3) * (1 - uf);
    const sprung = (a, b, u, key) => <Sprung key={key} xa={ZX(a)} xb={ZX(b)} y={y - 3} hoch={20} u={u} f={F.gold} b={2.4} />;
    const yb = 136;
    return (
      <>
        {/* Strahl */}
        <g opacity={un}>
          <line x1={xl} y1={y} x2={xr} y2={y} stroke={F.tinte} strokeWidth="1.6" strokeLinecap="round" />
          <Spitze x={xr + 4} y={y} f={F.tinte} g={7} />
          {[0, 1, 2, 3, 4, 5].map((v) => (
            <g key={v}>
              <line x1={ZX(v)} x2={ZX(v)} y1={y - 6} y2={y + 6} stroke={F.tinte} strokeWidth={v === 0 ? 2 : 1.2} />
              <Tx x={ZX(v)} y={y + 21} g={11} f={F.granat}>{v}</Tx>
            </g>
          ))}
        </g>
        {[-1, -2, -3, -4].map((v, i) => {
          const o = staffel(uz, i, 4, 0.5);
          if (o <= 0) return null;
          return (
            <g key={v} opacity={o}>
              <line x1={ZX(v)} x2={ZX(v)} y1={y - 6} y2={y + 6} stroke={F.tinte} strokeWidth="1.2" />
              <Tx x={ZX(v)} y={y + 21} g={11} f={F.goldDunkel}>{de(v)}</Tx>
            </g>
          );
        })}
        {/* Bereichs-Schilder */}
        <Pille x={ZX(5) + 8} y={y - 22} text="ℕ" g={12} f={F.granatHell} tf={F.granat} o={un * (1 - uz)} />
        <Pille x={ZX(-4) + 2} y={y - 22} text="ℤ" g={12} f={F.goldHell} tf={F.goldDunkel} o={uz} />
        {/* 3 − 5 */}
        <g opacity={dimm}>
          {[0, 1, 2].map((i) => sprung(3 - i, 2 - i, sanft(staffel(teil(ur, 0, 0.7), i, 3, 0.2)), "a" + i))}
          {[0, 1].map((i) => sprung(-i, -1 - i, sanft(staffel(ue, i, 2, 0.2)), "b" + i))}
          <circle cx={ZX(3)} cy={y} r="4.5" fill={F.granat} opacity={teil(ur, 0, 0.1)} />
          {ue >= 0.85 && <circle cx={ZX(-2)} cy={y} r="5" fill={F.gold} stroke={F.granat} strokeWidth="1.6" opacity={teil(ue, 0.85, 1)} />}
        </g>
        <Tx x={ZX(-0.6)} y={y - 16} g={20} f={F.granat} w={800} o={teil(ur, 0.75, 1) * (1 - uz)}>?</Tx>
        <Pille x={ZX(0.5)} y={30} text="3 − 5 = ?" g={12} f={F.granatHell} tf={F.granat} o={teil(ur, 0, 0.2) * (1 - teil(ue, 0.8, 1))} />
        <Pille x={ZX(0.5)} y={30} text="3 − 5 = −2" g={12} f={F.goldHell} tf={F.goldDunkel} o={teil(ue, 0.8, 1) * dimm} />
        {/* 3 : 4 */}
        {ut > 0 && (
          <g>
            <rect x={ZX(0)} y={yb} width={(ZX(3) - ZX(0)) * teil(ut, 0, 0.4)} height={14} rx="3" fill={F.blauHell} stroke={F.blau} strokeWidth="1.4" />
            <Tx x={ZX(0) - 8} y={yb + 11} g={11} f={F.blau} w={800} a="end" o={teil(ut, 0, 0.3)}>3</Tx>
            {[1, 2, 3].map((k) => <line key={k} x1={ZX(0.75 * k)} x2={ZX(0.75 * k)} y1={yb - 3} y2={yb + 17} stroke={F.blau} strokeWidth="2" opacity={staffel(teil(ut, 0.45, 0.8), k - 1, 3, 0.4)} />)}
            {[0, 1, 2, 3].map((k) => <Tx key={"l" + k} x={ZX(0.75 * k + 0.375)} y={yb + 30} g={9.5} f={F.blau} w={800} o={staffel(teil(ut, 0.7, 1), k, 4, 0.4)}>0,75</Tx>)}
          </g>
        )}
        {uq > 0 && (
          <g>
            <line x1={ZX(0.75)} x2={ZX(0.75)} y1={yb - 3} y2={y + 2} stroke={F.blau} strokeWidth="1.4" strokeDasharray="3 3" opacity={teil(uq, 0, 0.4)} />
            <rect x={ZX(0)} y={yb} width={ZX(0.75) - ZX(0)} height={14} rx="3" fill={F.blau} opacity={teil(uq, 0, 0.4)} />
            <circle cx={ZX(0.75)} cy={y} r="5" fill={F.blau} stroke={F.weiss} strokeWidth="1.4" opacity={teil(uq, 0.3, 0.6)} />
            <Puls x={ZX(0.75)} y={y} u={teil(uq, 0.3, 1)} r={16} f={F.blau} />
            <g opacity={teil(uq, 0.5, 1)}>
              <Tx x={318} y={40} g={14} f={F.blau} w={800} a="end">3 : 4 = 0,75 =</Tx>
              <SvgBruch x={333} y={32} z={3} n={4} g={13} f={F.blau} />
              <Pille x={ZX(-4) + 26} y={y - 22} text="ℚ" g={12} f={F.blauHell} tf={F.blau} />
            </g>
          </g>
        )}
        {/* Schluss */}
        <g opacity={uf}>
          <Tx x={B / 2 - 44} y={190} g={17} f={F.granat} w={800}>ℕ</Tx>
          <Tx x={B / 2 - 22} y={190} g={15} f={F.grau} w={700}>⊂</Tx>
          <Tx x={B / 2} y={190} g={17} f={F.goldDunkel} w={800}>ℤ</Tx>
          <Tx x={B / 2 + 22} y={190} g={15} f={F.grau} w={700}>⊂</Tx>
          <Tx x={B / 2 + 44} y={190} g={17} f={F.blau} w={800}>ℚ</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   dz_streifen_kreis – Streifendiagramm rollt sich zum Ring (Länge = Umfang), Ring füllt sich zum Kreis;
   Winkel = Anteil · 360°
   p: { gesamt: 40, teile: [["Fußball", 16], …] }
   ============================================================ */
const SK_F = [[F.granat, F.weiss], [F.gold, F.granatTief], [F.blau, F.weiss], [F.rosa, F.granatTief]];
const SK_R = 48, SK_D = 10, SK_L = 2 * Math.PI * SK_R, SK_TOP = 46;
const pol = (cx, cy, r, phi) => [cx + r * Math.sin(phi), cy - r * Math.cos(phi)];
const f2 = (v) => v.toFixed(2);
function ringStueck(cx, cy, ri, ro, p0, p1) {
  const gross = p1 - p0 > Math.PI ? 1 : 0;
  const [ax, ay] = pol(cx, cy, ro, p0), [bx, by] = pol(cx, cy, ro, p1);
  if (ri < 0.3) return `M${f2(cx)} ${f2(cy)} L${f2(ax)} ${f2(ay)} A${f2(ro)} ${f2(ro)} 0 ${gross} 1 ${f2(bx)} ${f2(by)} Z`;
  const [ix, iy] = pol(cx, cy, ri, p1), [jx, jy] = pol(cx, cy, ri, p0);
  return `M${f2(ax)} ${f2(ay)} A${f2(ro)} ${f2(ro)} 0 ${gross} 1 ${f2(bx)} ${f2(by)} L${f2(ix)} ${f2(iy)} A${f2(ri)} ${f2(ri)} 0 ${gross} 0 ${f2(jx)} ${f2(jy)} Z`;
}
const dz_streifen_kreis = {
  h: 214,
  label: (p) => `Vom Streifendiagramm zum Kreisdiagramm: ${p.teile.map(([n, w]) => `${n} ${w}`).join(", ")} von ${p.gesamt}`,
  ablauf: (p) => {
    const pr = p.teile.map(([, w]) => (w / p.gesamt) * 100);
    return [
      { k: "streifen", ms: 1500, text: `Ein Streifendiagramm: ${p.gesamt} Schüler, jede Sportart ein Abschnitt.` },
      { k: "anteile", ms: 1700, text: `${p.teile[0][0]}: ${p.teile[0][1]} von ${p.gesamt} sind ${de(pr[0])} % des Streifens.` },
      { k: "rollen", ms: 3700, text: "Der Streifen rollt sich zum Ring, dann zum Kreis – die Anteile bleiben." },
      { k: "winkel", ms: 2200, text: `Der Kreis hat 360°: ${de(pr[0])} % von 360° sind ${de((pr[0] / 100) * 360)}°.` },
      { k: "fertig", ms: 1400, text: "Zusammen 360° – Streifen und Kreis zeigen dieselben Anteile." },
    ];
  },
  bild: ({ Z, z, p }) => {
    /* rollen: erst biegt sich der Streifen zum Ring (bis 60 %), dann füllt sich der Ring zum Kreis */
    const us = Z("streifen"), ua = Z("anteile"), ur = sanft(teil(z("rollen"), 0, 0.6)), uf = sanft(teil(z("rollen"), 0.65, 1)), uw = Z("winkel"), ue = Z("fertig");
    const G = p.gesamt;
    let s = 0;
    const seg = p.teile.map(([name, w], i) => { const o = { name, w, s0: s, s1: s + w / G, i, pr: (w / G) * 100, gr: (w / G) * 360 }; s += w / G; return o; });
    const cx = mix(B / 2, 98, uf);
    const gerade = ur < 1e-3;
    const th = 2 * Math.PI * ur, R = gerade ? 0 : SK_L / th, cy = SK_TOP + R;
    const ro = gerade ? 0 : R + SK_D, ri = gerade ? 0 : mix(R - SK_D, 0, uf);
    const phi = (t) => (t - 0.5) * th + Math.PI * uf;   // beim Füllen dreht der Kreis, bis die Naht oben liegt
    const xs = cx - SK_L / 2;
    const tx = 178;
    return (
      <>
        {seg.map((g) => {
          const [fl] = SK_F[g.i % 4], o = staffel(us, g.i, seg.length, 0.5);
          if (o <= 0) return null;
          const d = gerade
            ? `M${f2(xs + g.s0 * SK_L)} ${SK_TOP - SK_D} H${f2(xs + g.s1 * SK_L)} V${SK_TOP + SK_D} H${f2(xs + g.s0 * SK_L)} Z`
            : ringStueck(cx, cy, ri, ro, phi(g.s0), phi(g.s1));
          return <path key={g.i} d={d} fill={fl} stroke={F.weiss} strokeWidth="1.6" strokeLinejoin="round" opacity={o} />;
        })}
        {/* Prozent auf Streifen/Ring */}
        {seg.map((g) => {
          const o = ua * (1 - teil(ur, 0, 0.35));
          if (o <= 0) return null;
          const m = (g.s0 + g.s1) / 2, [px, py] = gerade ? [xs + m * SK_L, SK_TOP] : pol(cx, cy, R, phi(m));
          return <Tx key={"p" + g.i} x={px} y={py + 3.6} g={10} f={SK_F[g.i % 4][1]} w={800} o={o}>{`${de(g.pr)} %`}</Tx>;
        })}
        {/* Winkel */}
        {uw > 0 && <circle cx={cx} cy={cy} r="2.6" fill={F.tinte} opacity={teil(uw, 0, 0.3)} />}
        {seg.map((g) => {
          const o = staffel(uw, g.i, seg.length, 0.4);
          if (o <= 0) return null;
          const m = (g.s0 + g.s1) / 2, rr = g.gr < 50 ? ro * 0.74 : ro * 0.6, [px, py] = pol(cx, cy, rr, phi(m));
          return <Tx key={"w" + g.i} x={px} y={py + 4} g={11} f={SK_F[g.i % 4][1]} w={800} o={o}>{`${de(g.gr)}°`}</Tx>;
        })}
        {seg.map((g) => {
          const o = staffel(uw, g.i, seg.length, 0.4), y = 66 + g.i * 25;
          if (o <= 0) return null;
          return (
            <g key={"t" + g.i} opacity={o}>
              <rect x={tx} y={y - 9} width={9} height={9} rx="2" fill={SK_F[g.i % 4][0]} />
              <Tx x={tx + 15} y={y} g={12} f={F.tinte} w={800} a="start">{`${de(g.pr)} % · 360° = `}<tspan fill={F.granat}>{`${de(g.gr)}°`}</tspan></Tx>
            </g>
          );
        })}
        <Tx x={tx + 15} y={66 + seg.length * 25} g={12} f={F.gruen} w={800} a="start" o={ue}>Summe: 360° ✓</Tx>
        {/* Vorher: der Streifen erscheint am Ende noch einmal klein unter dem Kreis */}
        {ue > 0 && seg.map((g) => {
          const xa = (B - SK_L) / 2;
          return <rect key={"v" + g.i} x={xa + g.s0 * SK_L} y={170} width={(g.s1 - g.s0) * SK_L} height={10} fill={SK_F[g.i % 4][0]} stroke={F.weiss} strokeWidth="1.2" opacity={ue} />;
        })}
        {/* Legende */}
        {(() => {
          const g = 10, ws = seg.map((x) => 13 + breite(x.name, g)), gap = 12, tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
          let x = (B - tot) / 2;
          return seg.map((sg, i) => {
            const x0 = x; x += ws[i] + gap;
            return (
              <g key={"l" + i} opacity={staffel(us, i, seg.length, 0.5)}>
                <rect x={x0} y={196} width={8} height={8} rx="2" fill={SK_F[i % 4][0]} />
                <Tx x={x0 + 12} y={204} g={g} f={F.grau} w={700} a="start">{sg.name}</Tx>
              </g>
            );
          });
        })()}
      </>
    );
  },
};

/* ============================================================
   dz_ursprungsgerade – Wertetabelle → Punkte; Linien vom Ursprung zu jedem Punkt fallen zusammen;
   Quotient y : x bleibt gleich, Steigungsdreiecke 1 nach rechts, k nach oben
   p: { k: 2.5, n: 4, xE: "kg", yE: "€", ding: "Äpfel" }
   ============================================================ */
const dz_ursprungsgerade = {
  h: 214,
  label: (p) => `Proportionale Zuordnung als Ursprungsgerade: y = ${de(p.k)} · x`,
  ablauf: (p) => [
    { k: "tabelle", ms: 1500, text: `1 ${p.xE} ${p.ding} kostet ${de(p.k, 2)} ${p.yE}. Die Wertetabelle.` },
    { k: "punkte", ms: 1900, text: "Jedes Wertepaar wird ein Punkt im Koordinatensystem." },
    { k: "quotient", ms: 3400, text: `Ab dem Ursprung: 1 ${p.xE} nach rechts, ${de(p.k, 2)} ${p.yE} nach oben – immer gleich.` },
    { k: "gerade", ms: 1600, text: "Gleiche Stufen ergeben eine Gerade – sie startet im Ursprung." },
    { k: "fertig", ms: 1400, text: `Gleicher Quotient, Gerade durch den Ursprung: y = ${de(p.k)} · x.` },
  ],
  bild: ({ Z, z, p }) => {
    const { k, n } = p, xmax = n + 0.6, ymax = Math.ceil(k * xmax);
    const X = (v) => 178 + v * 34, Y = (v) => 190 - v * (148 / ymax);
    /* quotient: Stufe für Stufe ab dem Ursprung (GOLD), daneben füllt sich die Quotienten-Spalte */
    const ut = Z("tabelle"), up = z("punkte"), ug = Z("gerade"), uq = z("quotient"), uf = Z("fertig");
    const cx = 40, cy = 80, cq = 124, ry = (i) => 70 + i * 28;
    const yt = []; for (let v = 0; v <= ymax + 1e-9; v += k) yt.push(v);
    const xEnde = Math.min(xmax, ymax / k);
    return (
      <>
        {/* Tabelle */}
        <rect x={14} y={30} width={146} height={ry(n - 1) + 16 - 30} rx="10" fill={F.flaeche} opacity={ut} />
        <Tx x={cx} y={46} g={10.5} f={F.blau} w={800} o={ut}>{p.xE}</Tx>
        <Tx x={cy} y={46} g={10.5} f={F.granat} w={800} o={ut}>{p.yE}</Tx>
        <Tx x={cq} y={46} g={10.5} f={F.goldDunkel} w={800} o={teil(uq, 0, 0.15)}>{`${p.yE} : ${p.xE}`}</Tx>
        <line x1={60} x2={60} y1={36} y2={ry(n - 1) + 10} stroke={F.linie} strokeWidth="1.4" opacity={ut} />
        <line x1={100} x2={100} y1={36} y2={ry(n - 1) + 10} stroke={F.linie} strokeWidth="1.4" opacity={teil(uq, 0, 0.15)} />
        {Array.from({ length: n }, (_, i) => (
          <g key={i}>
            <g opacity={staffel(ut, i, n, 0.5)}>
              <Tx x={cx} y={ry(i) + 5} g={14} f={F.tinte} w={800}>{i + 1}</Tx>
              <Tx x={cy} y={ry(i) + 5} g={14} f={F.tinte} w={800}>{de((i + 1) * k)}</Tx>
            </g>
            <Tx x={cq} y={ry(i) + 5} g={14} f={F.goldDunkel} w={800} o={teil(staffel(uq, i, n, 0.15), 0.7, 1)}>{de(k)}</Tx>
          </g>
        ))}
        {/* Achsen */}
        <g opacity={teil(up, 0, 0.15)}>
          {yt.slice(1).map((v) => <line key={"gy" + v} x1={X(0)} x2={X(xmax)} y1={Y(v)} y2={Y(v)} stroke={F.linie} strokeWidth="1" />)}
          <line x1={X(0)} y1={Y(0)} x2={X(xmax) + 10} y2={Y(0)} stroke={F.tinte} strokeWidth="1.5" />
          <Spitze x={X(xmax) + 13} y={Y(0)} f={F.tinte} g={6.5} />
          <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(ymax) - 10} stroke={F.tinte} strokeWidth="1.5" />
          <Spitze x={X(0)} y={Y(ymax) - 13} winkel={-90} f={F.tinte} g={6.5} />
          {Array.from({ length: n }, (_, i) => <g key={"xt" + i}><line x1={X(i + 1)} x2={X(i + 1)} y1={Y(0) - 3} y2={Y(0) + 3} stroke={F.tinte} strokeWidth="1.2" /><Tx x={X(i + 1)} y={Y(0) + 15} g={10} f={F.grau} w={700}>{i + 1}</Tx></g>)}
          {yt.slice(1).map((v) => <Tx key={"yl" + v} x={X(0) - 6} y={Y(v) + 3.5} g={10} f={F.grau} w={700} a="end">{de(v)}</Tx>)}
          <Tx x={X(xmax) + 14} y={Y(0) - 8} g={10} f={F.tinte} w={800} a="end">{p.xE}</Tx>
          <Tx x={X(0) + 8} y={Y(ymax) - 8} g={10} f={F.tinte} w={800} a="start">{p.yE}</Tx>
        </g>
        {ug > 0 && <line x1={X(0)} y1={Y(0)} x2={X(xEnde * ug)} y2={Y(k * xEnde * ug)} stroke={F.granat} strokeWidth="2.2" strokeLinecap="round" />}
        {/* Stufen: 1 nach rechts, k nach oben – jede landet genau auf dem nächsten Punkt */}
        {Array.from({ length: n }, (_, i) => {
          const u = staffel(uq, i, n, 0.15);
          if (u <= 0) return null;
          const ur = teil(u, 0, 0.5), uo = teil(u, 0.5, 1);
          return (
            <g key={"d" + i}>
              <path d={`M${X(i)} ${Y(i * k)} H${mix(X(i), X(i + 1), ur)}${uo > 0 ? ` V${mix(Y(i * k), Y((i + 1) * k), uo)}` : ""}`} fill="none" stroke={F.gold} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
              {i === 0 && <Tx x={X(0.5)} y={Y(0) - 5} g={10} f={F.goldDunkel} w={800} o={ur}>1</Tx>}
              {i === 0 && <Tx x={X(1) + 4} y={Y(k / 2) + 3.5} g={10} f={F.goldDunkel} w={800} a="start" o={uo}>{de(k)}</Tx>}
            </g>
          );
        })}
        <circle cx={X(0)} cy={Y(0)} r="4" fill={F.granat} opacity={ug} />
        <Puls x={X(0)} y={Y(0)} u={ug} r={14} f={F.granat} />
        {Array.from({ length: n }, (_, i) => {
          const u = sanft(staffel(up, i, n, 0.5));
          if (u <= 0) return null;
          const px = mix(cy, X(i + 1), u), py = mix(ry(i), Y((i + 1) * k), u) - Math.sin(Math.PI * u) * 16;
          return <circle key={"p" + i} cx={px} cy={py} r="4.6" fill={F.gold} stroke={F.granat} strokeWidth="1.6" />;
        })}
        <Pille x={X(0.4)} y={Y(ymax * 0.86)} a="start" text={`y = ${de(k)} · x`} g={12} f={F.granat} tf={F.weiss} o={uf} />
        <Tx x={87} y={ry(n - 1) + 40} g={11} f={F.goldDunkel} w={800} o={teil(uq, 0.85, 1)}>Quotient immer gleich</Tx>
      </>
    );
  },
};

/* ============================================================
   dz_zwei_wege – Dreisatz zweimal nebeneinander: über die 1 und über einen gemeinsamen Teiler;
   Pfeile auf beiden Seiten der Tabelle
   p: { kopf: ["Hefte", "Preis"], a: [8, 1, 12], b: [8, 4, 12], k: 0.75, opsA: [": 8", "· 12"], opsB: [": 2", "· 3"], teiler: 4 }
   ============================================================ */
const euro = (v) => `${de(v, Number.isInteger(v) ? 0 : 2)} €`;
function Weg({ px, titel, zahlen, k, ops, kopf, uz, uo, uf }) {
  const cl = px + 56, cr = px + 104, ry = (i) => 82 + i * 42;
  return (
    <g>
      <Pille x={px + 80} y={22} text={titel} g={11} f={F.blauHell} tf={F.blau} o={uz[0]} />
      <Tx x={cl} y={54} g={10.5} f={F.blau} w={800} o={uz[0]}>{kopf[0]}</Tx>
      <Tx x={cr} y={54} g={10.5} f={F.granat} w={800} o={uz[0]}>{kopf[1]}</Tx>
      <line x1={px + 30} x2={px + 132} y1={62} y2={62} stroke={F.linie} strokeWidth="1.4" opacity={uz[0]} />
      <line x1={px + 71} x2={px + 71} y1={66} y2={ry(2) + 14} stroke={F.linie} strokeWidth="1.4" opacity={uz[0]} />
      {zahlen.map((l, i) => {
        const u = uz[i], letzte = i === 2;
        if (u <= 0) return null;
        return (
          <g key={i} opacity={u} transform={`translate(0 ${(1 - raus(u)) * 8})`}>
            {letzte && <rect x={px + 32} y={ry(i) - 17} width={98} height={30} rx="9" fill="none" stroke={F.granat} strokeWidth="2" opacity={uf} />}
            <Tx x={cl} y={ry(i) + 5} g={15} f={F.tinte} w={800}>{de(l)}</Tx>
            <Tx x={cr} y={ry(i) + 5} g={14} f={letzte ? F.granat : F.tinte} w={800}>{euro(l * k)}</Tx>
          </g>
        );
      })}
      {uo.map((u, i) => (
        <g key={"o" + i}>
          <Bogen x={px + 34} y1={ry(i) + 2} y2={ry(i + 1) - 8} seite={-1} u={u} text={ops[i]} f={F.blau} />
          <Bogen x={px + 128} y1={ry(i) + 2} y2={ry(i + 1) - 8} seite={1} u={u} text={ops[i]} f={F.granat} />
        </g>
      ))}
    </g>
  );
}
const dz_zwei_wege = {
  h: 214,
  label: (p) => `Dreisatz auf zwei Wegen: über die 1 und über die ${p.teiler}`,
  ablauf: (p) => {
    const [l0, , l2] = p.a, k = p.k, wort = (o) => o.replace(": ", "durch ").replace("· ", "mal ");
    return [
      { k: "auf", ms: 1500, text: `${l0} ${p.kopf[0]} kosten ${euro(l0 * k)}. Was kosten ${l2} ${p.kopf[0]}?` },
      { k: "a1", ms: 1500, text: `Weg 1 über die 1: beide Seiten ${wort(p.opsA[0])} – ein Heft kostet ${euro(k)}.` },
      { k: "a2", ms: 1400, text: `Dann beide Seiten ${wort(p.opsA[1])}: ${euro(l2 * k)}.` },
      { k: "b1", ms: 1900, text: `Weg 2 über die ${p.teiler}: beide Seiten ${wort(p.opsB[0])} – ${p.b[1]} ${p.kopf[0]} kosten ${euro(p.b[1] * k)}.` },
      { k: "b2", ms: 1400, text: `Dann beide Seiten ${wort(p.opsB[1])}: wieder ${euro(l2 * k)}.` },
      { k: "fertig", ms: 1500, text: "Gleiches Ergebnis. Über die gemeinsame Zahl bleiben die Zahlen glatt." },
    ];
  },
  bild: ({ Z, p }) => {
    const uauf = Z("auf"), a1 = Z("a1"), a2 = Z("a2"), b1 = Z("b1"), b2 = Z("b2"), uf = Z("fertig");
    const zeile = (u) => teil(u, 0.55, 1), pfeil = (u) => teil(u, 0, 0.6);
    return (
      <>
        <Weg px={2} titel="Über die 1" zahlen={p.a} k={p.k} ops={p.opsA} kopf={p.kopf} uz={[uauf, zeile(a1), zeile(a2)]} uo={[pfeil(a1), pfeil(a2)]} uf={uf} />
        <Weg px={180} titel={`Über die ${p.teiler}`} zahlen={p.b} k={p.k} ops={p.opsB} kopf={p.kopf} uz={[uauf, zeile(b1), zeile(b2)]} uo={[pfeil(b1), pfeil(b2)]} uf={uf} />
        <line x1={B / 2} x2={B / 2} y1={14} y2={176} stroke={F.linie} strokeWidth="1.4" opacity={uauf} />
        <Tx x={B / 2} y={204} g={12.5} f={F.gruen} w={800} o={uf}>{`Beide Wege: ${p.a[2]} ${p.kopf[0]} kosten ${euro(p.a[2] * p.k)} ✓`}</Tx>
      </>
    );
  },
};

export const SZENEN_ZWEIT_DATEN = {
  dz_bereich_rechnen,
  dz_streifen_kreis,
  dz_ursprungsgerade,
  dz_zwei_wege,
};
