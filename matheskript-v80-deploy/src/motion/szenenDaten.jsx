/* ============================================================
   Szenen der Gruppe Daten (Klasse 6: Mittelwert, Zahlenbereiche, Terme und Gleichungen,
   Daten und Zufall, Zuordnungen). Präfix d_. Vertrag siehe kern.jsx.
   Zufall ist hier immer ein fester, deterministischer Pseudo-Zufall (LCG mit Startwert),
   damit jedes Abspielen gleich aussieht.
   ============================================================ */
import React from "react";
import { B, F, Tx, Strich, Pfeil, Spitze, Kasten, Pille, Puls, Tippen, SvgBruch, breite, de, mix, klemm, teil, staffel, raus, sanft, federnd } from "./kern.jsx";

/* ---------- Hilfen ---------- */
const summe = (a) => a.reduce((s, v) => s + v, 0);
/* kleiner LCG: gleiche Folge bei gleichem Startwert */
const lcg = (seed) => { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
/* Mischen mit festem Startwert */
const mischen = (liste, seed) => { const r = lcg(seed), a = [...liste]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const op = (b) => (b < 0 ? `− ${de(-b)}` : `+ ${de(b)}`);
const SCHRIFT = { fontFamily: "Montserrat, sans-serif" };

/* Bogenpfeil neben einer Tabellenspalte (von y1 nach y2), seite −1 = links, 1 = rechts */
function Bogen({ x, y1, y2, seite = -1, u = 1, text, f = F.granat, weite = 15, g = 11.5 }) {
  if (u <= 0) return null;
  const cx = x + seite * weite * 2, cy = (y1 + y2) / 2;
  const w = (Math.atan2(y2 - cy, x - cx) * 180) / Math.PI;
  return (
    <g>
      <path d={`M${x} ${y1} Q${cx} ${cy} ${x} ${y2}`} fill="none" stroke={f} strokeWidth="1.8" strokeLinecap="round" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - klemm(u)} />
      {u > 0.85 && <Spitze x={x} y={y2} winkel={w} f={f} g={6.5} o={teil(u, 0.85, 1)} />}
      {text && <Tx x={x + seite * (weite + 7)} y={cy + 4} g={g} f={f} w={800} a={seite < 0 ? "end" : "start"} o={teil(u, 0.4, 1)}>{text}</Tx>}
    </g>
  );
}
/* Bogen unter einer Tabellenzeile von xa nach xb (nach unten gewölbt) */
function BogenUnten({ xa, xb, y, u = 1, text, f = F.goldDunkel, tiefe = 12 }) {
  if (u <= 0) return null;
  const cx = (xa + xb) / 2, cy = y + tiefe * 2;
  const w = (Math.atan2(y - cy, xb - cx) * 180) / Math.PI;
  return (
    <g>
      <path d={`M${xa} ${y} Q${cx} ${cy} ${xb} ${y}`} fill="none" stroke={f} strokeWidth="1.7" strokeLinecap="round" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - klemm(u)} />
      {u > 0.85 && <Spitze x={xb} y={y} winkel={w} f={f} g={6} o={teil(u, 0.85, 1)} />}
      {text && <Tx x={cx} y={y + tiefe + 17} g={11} f={f} w={800} o={teil(u, 0.4, 1)}>{text}</Tx>}
    </g>
  );
}
/* Koordinatenachsen: X(v), Y(v) Umrechnung; xt/yt = Skalenwerte; u blendet ein */
function Achsen({ X, Y, xv, yv, xt = [], yt = [], u = 1, xName, yName, xf = (v) => de(v), yf = (v) => de(v) }) {
  if (u <= 0) return null;
  const x0 = X(xv[0]), x1 = X(xv[1]) + 10, y0 = Y(yv[0]), y1 = Y(yv[1]) - 10;
  return (
    <g opacity={u}>
      {yt.filter((v) => v !== yv[0]).map((v) => <line key={"gy" + v} x1={x0} x2={X(xv[1])} y1={Y(v)} y2={Y(v)} stroke={F.linie} strokeWidth="1" />)}
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={F.tinte} strokeWidth="1.5" />
      <Spitze x={x1 + 3} y={y0} f={F.tinte} g={6.5} />
      <line x1={x0} y1={y0} x2={x0} y2={y1} stroke={F.tinte} strokeWidth="1.5" />
      <Spitze x={x0} y={y1 - 3} winkel={-90} f={F.tinte} g={6.5} />
      {xt.map((v) => <g key={"x" + v}><line x1={X(v)} x2={X(v)} y1={y0 - 3} y2={y0 + 3} stroke={F.tinte} strokeWidth="1.2" /><Tx x={X(v)} y={y0 + 15} g={10} f={F.grau} w={700}>{xf(v)}</Tx></g>)}
      {yt.filter((v) => v !== yv[0]).map((v) => <g key={"y" + v}><line x1={x0 - 3} x2={x0 + 3} y1={Y(v)} y2={Y(v)} stroke={F.tinte} strokeWidth="1.2" /><Tx x={x0 - 6} y={Y(v) + 3.5} g={10} f={F.grau} w={700} a="end">{yf(v)}</Tx></g>)}
      {xName && <Tx x={x1 + 4} y={y0 - 8} g={10} f={F.tinte} w={800} a="end">{xName}</Tx>}
      {yName && <Tx x={x0 + 8} y={y1 + 4} g={10} f={F.tinte} w={800} a="start">{yName}</Tx>}
    </g>
  );
}

/* ============================================================
   d_ausgleich – Mittelwert: Säulen geben ab und nehmen auf, bis alle gleich hoch sind
   p: { werte: [2, 3, 2, 4, 1], name: "Noten", schluss?: "…" }
   ============================================================ */
function ausgleichsStuecke(w, m) {
  const n = w.length, fehlt = w.map((v) => Math.max(0, m - v)), gefuellt = w.map(() => 0), st = [];
  let j = 0;
  w.forEach((v, i) => {
    let rest = v - m, oben = v;
    while (rest > 1e-9) {
      while (j < n && fehlt[j] - gefuellt[j] <= 1e-9) j++;
      if (j >= n) break;
      const a = Math.min(rest, fehlt[j] - gefuellt[j]);
      st.push({ von: i, nach: j, oben, a, ziel: w[j] + gefuellt[j] });
      oben -= a; rest -= a; gefuellt[j] += a;
    }
  });
  return st;
}
const d_ausgleich = {
  h: 214,
  label: (p) => `Mittelwert von ${p.werte.map((v) => de(v)).join(", ")} durch Ausgleichen`,
  ablauf: (p) => {
    const w = p.werte, n = w.length, s = summe(w), m = s / n;
    return [
      { k: "saeulen", ms: 1300, text: `${p.name}: ${w.map((v) => de(v)).join(", ")} – jeder Wert eine Säule.` },
      { k: "ausgleich", ms: 3400, text: "Hohe Säulen geben ab, niedrige bekommen dazu – bis alle gleich hoch sind." },
      { k: "gleich", ms: 1300, text: `Alle sind gleich hoch: ${de(m)}. Das ist der Mittelwert.` },
      { k: "rechnung", ms: 1700, text: p.schluss || `Gerechnet: Summe ${de(s)} geteilt durch Anzahl ${n} ergibt ${de(m)}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const w = p.werte, n = w.length, s = summe(w), m = s / n;
    const vmax = Math.ceil(Math.max(...w));
    const xa = 52, xb = 344, sw = (xb - xa) / n, bw = Math.min(40, sw * 0.56), y0 = 160, H = 124, k = H / vmax;
    const X = (i) => xa + sw * (i + 0.5), Y = (v) => y0 - v * k;
    const us = Z("saeulen", raus), ua = z("ausgleich"), ug = Z("gleich"), ur = Z("rechnung");
    const st = ausgleichsStuecke(w, m), P = st.length;
    const ym = Y(m);
    return (
      <>
        {/* y-Achse */}
        <line x1={xa - 12} y1={y0} x2={xa - 12} y2={y0 - H - 10} stroke={F.tinte} strokeWidth="1.4" />
        {Array.from({ length: vmax + 1 }, (_, v) => {
          const nah = Math.abs(v - m) < 0.62 ? 1 - ug : 1;
          return (
            <g key={v} opacity={nah}>
              <line x1={xa - 15} x2={xa - 9} y1={Y(v)} y2={Y(v)} stroke={F.tinte} strokeWidth="1.2" />
              <Tx x={xa - 20} y={Y(v) + 4} g={10.5} f={F.grau} w={700} a="end">{v}</Tx>
            </g>
          );
        })}
        <line x1={xa - 12} y1={y0} x2={xb + 4} y2={y0} stroke={F.tinte} strokeWidth="1.5" />
        {/* Säulen (der Teil bis zur Mittelwert-Höhe bleibt stehen) */}
        {w.map((v, i) => {
          const hoch = us < 1 ? v * us : Math.min(v, m);
          return <rect key={i} x={X(i) - bw / 2} y={Y(hoch)} width={bw} height={Math.max(0, hoch * k)} rx="3" fill={F.blauHell} stroke={F.blau} strokeWidth="1.2" />;
        })}
        {/* Vorher: wo die hohen Säulen abgegeben haben, bleibt ein gestrichelter Umriss */}
        {ua > 0 && w.map((v, i) => v > m + 1e-9 && (
          <rect key={"g" + i} x={X(i) - bw / 2} y={Y(v)} width={bw} height={(v - m) * k} rx="3" fill="none" stroke={F.blau} strokeWidth="1.3" strokeDasharray="4 3" opacity={teil(ua, 0, 0.15)} />
        ))}
        {/* die wandernden Stücke werden GOLD, sobald der Ausgleich beginnt */}
        {us >= 1 && st.map((s0, j) => {
          const u = sanft(staffel(ua, j, P, 0.35));
          const x = mix(X(s0.von), X(s0.nach), u), unten = mix(s0.oben - s0.a, s0.ziel, u);
          const hub = Math.sin(Math.PI * u) * 22;
          const an = ua > 0;
          return <rect key={"s" + j} x={x - bw / 2} y={Y(unten + s0.a) - hub} width={bw} height={s0.a * k} rx="3" fill={an ? F.gold : F.blauHell} stroke={an ? F.goldDunkel : F.blau} strokeWidth={an ? 1.2 : 1.2} />;
        })}
        {/* Mittelwert-Linie */}
        {ug > 0 && <line x1={xa - 12} y1={ym} x2={mix(xa - 12, xb + 4, ug)} y2={ym} stroke={F.granat} strokeWidth="2" strokeDasharray="6 4" />}
        <Tx x={xa - 20} y={ym + 4} g={11} f={F.granat} w={800} a="end" o={ug}>{de(m)}</Tx>
        <Pille x={xb - (breite(`Mittelwert ${de(m)}`, 11.5) + 16)} y={22} a="start" text={`Mittelwert ${de(m)}`} f={F.granat} tf={F.weiss} g={11.5} o={ug} />
        {/* Werte unter den Säulen */}
        {w.map((v, i) => <Tx key={"w" + i} x={X(i)} y={y0 + 17} g={13} f={F.tinte} w={800} o={teil(us, 0.3, 1)}>{de(v)}</Tx>)}
        <g opacity={ur} transform={`translate(0 ${(1 - ur) * 6})`}>
          <Tx x={B / 2} y={204} g={13} f={F.tinte} w={700}>
            {`(${w.map((v) => de(v)).join(" + ")}) : ${n} = ${de(s)} : ${n} = `}<tspan fill={F.granat} fontWeight="800">{de(m)}</tspan>
          </Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   d_verteilen – Mittelwert als gerechtes Verteilen: alles auf einen Haufen (Summe), reihum verteilen (: Anzahl).
   Links bleibt das Vorher blass stehen, rechts das Nachher.
   p: { werte: [7, 3, 6, 4], namen: ["Ali", "Ben", "Cem", "Dana"], ding: "Murmeln" }   (Summe durch Anzahl teilbar)
   ============================================================ */
const d_verteilen = {
  h: 214,
  label: (p) => `Mittelwert von ${p.werte.join(", ")} durch Zusammenlegen und gerechtes Verteilen`,
  ablauf: (p) => {
    const w = p.werte, n = w.length, s = summe(w), m = s / n;
    const liste = w.slice(0, -1).join(", ") + " und " + w[n - 1];
    return [
      { k: "sehen", ms: 1500, text: `${n} Kinder haben ${liste} ${p.ding} – ungleich viele.` },
      { k: "sammeln", ms: 2400, text: `Alle ${p.ding} auf einen Haufen: zusammen ${s} – die Summe.` },
      { k: "verteilen", ms: 3200, text: `Reihum gerecht verteilen: ${s} ${p.ding} an ${n} Kinder.` },
      { k: "fertig", ms: 1400, text: `Jeder bekommt ${de(m)}. Das ist der Mittelwert.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const w = p.werte, n = w.length, s = summe(w), m = s / n;
    const us = Z("sehen"), uc = z("sammeln"), uv = z("verteilen"), uf = Z("fertig");
    const yR = (i) => 52 + i * 33, d = 12, r = 4.6;
    const xL = (j) => 54 + j * d, xR = (j) => 256 + j * d;
    const sp = 5, xP = (k) => 198 + ((k % sp) - (sp - 1) / 2) * 11, yP = (k) => 70 + Math.floor(k / sp) * 11;
    const pileUnten = yP(s - 1) + 8;
    /* Murmel k: woher (Kind i, Platz j), wohin (Kind k % n, Platz k / n) */
    const herkunft = []; w.forEach((v, i) => { for (let j = 0; j < v; j++) herkunft.push([i, j]); });
    return (
      <>
        <Tx x={95} y={24} g={10.5} f={F.grau} w={700} o={us}>vorher</Tx>
        <Tx x={285} y={24} g={10.5} f={F.grau} w={700} o={teil(uv, 0, 0.2)}>nachher</Tx>
        {w.map((v, i) => (
          <g key={"n" + i} opacity={us}>
            <Tx x={12} y={yR(i) + 4} g={11} f={F.tinte} w={800} a="start">{p.namen[i]}</Tx>
            <Tx x={xL(Math.max(...w)) + 2} y={yR(i) + 4} g={12} f={F.blau} w={800} a="start">{v}</Tx>
          </g>
        ))}
        {/* Vorher: bleibt blass stehen */}
        {herkunft.map(([i, j], k) => {
          const o = staffel(us, k, s, 0.85), weg = staffel(uc, k, s, 0.85);
          return o > 0 && <circle key={"l" + k} cx={xL(j)} cy={yR(i)} r={r} fill={F.blauHell} stroke={F.blau} strokeWidth="1.2" opacity={o * (1 - 0.6 * weg)} />;
        })}
        {/* Haufen-Beschriftung */}
        <g opacity={teil(uc, 0.7, 1) * (1 - 0.4 * uf)}>
          <Tx x={198} y={pileUnten + 14} g={12} f={F.goldDunkel} w={800}>{`zusammen ${s}`}</Tx>
        </g>
        {w.map((_, i) => <line key={"t" + i} x1={xR(0) - 10} x2={xR(0) - 10} y1={yR(i) - 8} y2={yR(i) + 8} stroke={F.linie} strokeWidth="1.4" opacity={teil(uv, 0, 0.2)} />)}
        {/* wandernde Murmeln: GOLD, angekommen GRANAT */}
        {herkunft.map(([i, j], k) => {
          const u1 = sanft(staffel(uc, k, s, 0.85)), u2 = sanft(staffel(uv, k, s, 0.8));
          if (u1 <= 0) return null;
          const ziel = [xR(Math.floor(k / n)), yR(k % n)];
          let x, y;
          if (u2 <= 0) { x = mix(xL(j), xP(k), u1); y = mix(yR(i), yP(k), u1) - Math.sin(Math.PI * u1) * 16; }
          else { x = mix(xP(k), ziel[0], u2); y = mix(yP(k), ziel[1], u2) - Math.sin(Math.PI * u2) * 16; }
          const da = u2 >= 1;
          return <circle key={"m" + k} cx={x} cy={y} r={r} fill={da ? F.granat : F.gold} stroke={da ? F.granatTief : F.goldDunkel} strokeWidth="1.2" />;
        })}
        {w.map((_, i) => <Tx key={"e" + i} x={xR(m) + 2} y={yR(i) + 4} g={12} f={F.granat} w={800} a="start" o={uf}>{de(m)}</Tx>)}
        <Pille x={B / 2} y={202} text={`Mittelwert: ${s} : ${n} = ${de(m)}`} g={12.5} f={F.granat} tf={F.weiss} o={uf} />
      </>
    );
  },
};

/* ============================================================
   d_zahlenbereiche – ℕ, ℤ, ℚ wachsen ineinander; Beispielzahlen fliegen in ihren Bereich
   p: {}
   ============================================================ */
const RN = { x: 36, y: 72, w: 98, h: 116 }, RZ = { x: 22, y: 42, w: 218, h: 160 }, RQ = { x: 8, y: 10, w: 344, h: 202 };
const rmix = (a, b, u) => ({ x: mix(a.x, b.x, u), y: mix(a.y, b.y, u), w: mix(a.w, b.w, u), h: mix(a.h, b.h, u) });
const ZB_ITEMS = [
  { b: 0, t: "0", x: 62, y: 128 }, { b: 0, t: "1", x: 108, y: 128 }, { b: 0, t: "7", x: 85, y: 166 },
  { b: 1, t: "−2", cap: "3 − 5", x: 188, y: 86 }, { b: 1, t: "−3", x: 188, y: 138 }, { b: 1, t: "−15", x: 188, y: 182 },
  { b: 2, t: "0,75", cap: "3 : 4", x: 296, y: 62 }, { b: 2, bruch: [5, 2], x: 296, y: 116 }, { b: 2, t: "0,3", periode: true, cap: "1 : 3", x: 296, y: 170 },
];
const d_zahlenbereiche = {
  h: 220,
  label: () => "Zahlenbereiche N, Z und Q als ineinander liegende Mengen",
  ablauf: () => [
    { k: "n", ms: 2000, text: "ℕ, die natürlichen Zahlen 0, 1, 2, 3, … – zum Zählen." },
    { k: "z", ms: 2300, text: "3 − 5 geht in ℕ nicht. ℤ nimmt die negativen Zahlen dazu." },
    { k: "q", ms: 2400, text: "3 : 4 geht in ℤ nicht auf. ℚ nimmt alle Brüche dazu." },
    { k: "fertig", ms: 1700, text: "Die 7 liegt in allen dreien: ℕ ⊂ ℤ ⊂ ℚ." },
  ],
  bild: ({ Z, z: zl }) => {
    /* je Abschnitt: erst wächst der Bereich (erste Hälfte), dann fallen seine Zahlen hinein (zweite Hälfte) */
    const un = raus(teil(zl("n"), 0, 0.45)), uz = sanft(teil(zl("z"), 0, 0.45)), uq = sanft(teil(zl("q"), 0, 0.45)), uf = Z("fertig");
    const rz = rmix(RN, RZ, uz), rq = rmix(RZ, RQ, uq);
    const zahlen = ["n", "z", "q"].map((k) => teil(zl(k), 0.5, 1));
    const kasten = (r, fill, rand, o) => <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="16" fill={fill} stroke={rand} strokeWidth="1.8" opacity={o} />;
    return (
      <>
        {uq > 0 && kasten(rq, F.blauHell, F.blau, teil(uq, 0, 0.15))}
        {uz > 0 && kasten(rz, F.goldHell, F.gold, teil(uz, 0, 0.15))}
        <g opacity={un} transform={`translate(${85 * (1 - un)} ${130 * (1 - un)}) scale(${0.0001 + un})`}>{kasten(RN, F.granatHell, F.granat, 1)}</g>
        <Tx x={RQ.x + 12} y={RQ.y + 23} g={18} f={F.blau} w={800} a="start" o={teil(uq, 0.6, 1)}>ℚ</Tx>
        <Tx x={RZ.x + 12} y={RZ.y + 23} g={18} f={F.goldDunkel} w={800} a="start" o={teil(uz, 0.6, 1)}>ℤ</Tx>
        <Tx x={RN.x + 12} y={RN.y + 23} g={18} f={F.granat} w={800} a="start" o={teil(un, 0.5, 1)}>ℕ</Tx>
        {ZB_ITEMS.map((it, i) => {
          const gruppe = ZB_ITEMS.filter((x) => x.b === it.b), j = gruppe.indexOf(it);
          const u = raus(staffel(zahlen[it.b], j, gruppe.length, 0.4));
          if (u <= 0) return null;
          const f = [F.granat, F.goldDunkel, F.blau][it.b];
          const dy = (1 - u) * -26, siebenPuls = it.t === "7" ? z7(uf) : 0;
          return (
            <g key={i} opacity={u} transform={`translate(0 ${dy})`}>
              {it.bruch ? (
                <g>
                  <Tx x={it.x - 13} y={it.y + 6} g={17} f={f} w={800}>−</Tx>
                  <SvgBruch x={it.x + 5} y={it.y - 2} z={it.bruch[0]} n={it.bruch[1]} g={15} f={f} />
                </g>
              ) : (
                <Tx x={it.x} y={it.y + 6} g={17} f={f} w={800}>{it.t}</Tx>
              )}
              {it.periode && <line x1={it.x + breite(it.t, 17) / 2 - 10} x2={it.x + breite(it.t, 17) / 2 - 1} y1={it.y - 9} y2={it.y - 9} stroke={f} strokeWidth="1.6" strokeLinecap="round" />}
              {it.cap && <Tx x={it.x} y={it.y + 22} g={10} f={F.grau} w={700}>{it.cap}</Tx>}
              {siebenPuls > 0 && <Puls x={it.x} y={it.y} u={siebenPuls} r={16} f={F.granat} />}
            </g>
          );
        })}
        <Tx x={210} y={31} g={15} f={F.tinte} w={800} o={uf}>ℕ ⊂ ℤ ⊂ ℚ</Tx>
      </>
    );
  },
};
const z7 = (u) => teil(u, 0.35, 1);

/* ============================================================
   d_einsetzen – Variable als Platzhalter; Zahlen werden eingesetzt, Wertetabelle füllt sich
   p: { a: 3, b: 2, v: "x", werte: [0, 1, 2, 3], muster: true }
   ============================================================ */
const termText = (a, b, v) => `${a === 1 ? "" : de(a)}${v} ${op(b)}`;
const d_einsetzen = {
  h: 212,
  label: (p) => `Einsetzen in den Term ${termText(p.a, p.b, p.v)}`,
  ablauf: (p) => [
    { k: "aufbau", ms: 1200, text: `Die Variable ${p.v} ist ein Platzhalter – ein Kästchen für eine Zahl.` },
    ...p.werte.map((w, i) => ({ k: `e${i}`, ms: 1500, text: `${de(w)} ins Kästchen: ${de(p.a)} · ${de(w)} ${op(p.b)} = ${de(p.a * w + p.b)}` })),
    p.muster
      ? { k: "ende", ms: 1500, text: `Jeder Schritt um 1 bei ${p.v} macht ${de(p.a)} mehr beim Term.` }
      : { k: "ende", ms: 1200, text: "Für jede Zahl ein anderer Wert – der Term ist eine Rechenvorschrift." },
  ],
  bild: ({ Z, z, p }) => {
    const { a, b, v, werte } = p, n = werte.length, erg = werte.map((w) => a * w + b);
    const g = 22, yR = 76;
    const p1 = `${de(a)} ·`, p2 = op(b), wb = 50;
    const p3max = Math.max(...erg.map((r) => breite(`= ${de(r)}`, g)));
    const total = breite(p1, g) + 10 + wb + 10 + breite(p2, g) + 12 + p3max;
    const xs = (B - total) / 2, xBox = xs + breite(p1, g) + 10, x2 = xBox + wb + 10, x3 = x2 + breite(p2, g) + 12;
    const ua = Z("aufbau"), ue = z("ende");
    let akt = -1; werte.forEach((_, i) => { if (z(`e${i}`) >= 0.35) akt = i; });
    if (ue > 0) akt = -1;
    const xL = 20, xT = 118, cw = (346 - xT) / n, cx = (i) => xT + cw * (i + 0.5), yX = 132, yT = 166;
    return (
      <>
        <Tx x={B / 2} y={26} g={13} f={F.grau} w={700} o={ua}>{`Term ${termText(a, b, v)} heißt: ${de(a)} · ${v} ${p2}`}</Tx>
        <g opacity={ua}>
          <Tx x={xs} y={yR} g={g} f={F.tinte} w={800} a="start">{p1}</Tx>
          <rect x={xBox} y={yR - 28} width={wb} height={38} rx="9" fill={akt >= 0 ? F.goldHell : F.weiss} stroke={F.granat} strokeWidth="2" strokeDasharray={akt >= 0 ? "none" : "5 4"} />
          {akt < 0 && <Tx x={xBox + wb / 2} y={yR - 1} g={g} f={F.hell} w={800} style={{ ...SCHRIFT, fontStyle: "italic" }}>{v}</Tx>}
          {akt >= 0 && <Tx x={xBox + wb / 2} y={yR - 1} g={g - 2} f={F.granat} w={800}>{de(werte[akt])}</Tx>}
          <Tx x={x2} y={yR} g={g} f={F.tinte} w={800} a="start">{p2}</Tx>
          {akt >= 0 && <Tx x={x3} y={yR} g={g} f={F.granat} w={800} a="start" o={teil(z(`e${akt}`), 0.35, 0.55)}>{`= ${de(erg[akt])}`}</Tx>}
        </g>
        {/* Tabelle */}
        <g opacity={ua}>
          <rect x={xL - 6} y={yX - 22} width={346 - xL + 6} height={yT - yX + 36} rx="12" fill={F.flaeche} />
          <line x1={xL} x2={346} y1={(yX + yT) / 2 - 3} y2={(yX + yT) / 2 - 3} stroke={F.linie} strokeWidth="1.4" />
          <line x1={xT - 4} x2={xT - 4} y1={yX - 18} y2={yT + 10} stroke={F.linie} strokeWidth="1.4" />
          <Tx x={(xL + xT) / 2 - 2} y={yX + 1} g={15} f={F.tinte} w={800} style={{ ...SCHRIFT, fontStyle: "italic" }}>{v}</Tx>
          <Tx x={(xL + xT) / 2 - 2} y={yT + 1} g={13} f={F.granat} w={800}>{termText(a, b, v)}</Tx>
          {werte.map((w, i) => <Tx key={i} x={cx(i)} y={yX + 1} g={15} f={F.tinte} w={800}>{de(w)}</Tx>)}
        </g>
        {werte.map((w, i) => {
          const u = z(`e${i}`);
          if (u <= 0) return null;
          const hin = sanft(teil(u, 0, 0.35)), runter = raus(teil(u, 0.6, 0.9));
          const spalte = u < 1 ? 1 - teil(u, 0.9, 1) : 0;
          return (
            <g key={"f" + i}>
              {spalte > 0 && <rect x={cx(i) - cw / 2 + 4} y={yX - 17} width={cw - 8} height={yT - yX + 26} rx="8" fill={F.goldHell} opacity={spalte} />}
              {spalte > 0 && <Tx x={cx(i)} y={yX + 1} g={15} f={F.tinte} w={800}>{de(w)}</Tx>}
              {u < 0.35 && <Tx x={mix(cx(i), xBox + wb / 2, hin)} y={mix(yX + 1, yR - 1, hin)} g={15} f={F.granat} w={800}>{de(w)}</Tx>}
              {u >= 0.6 && <Tx x={cx(i)} y={mix(yT - 12, yT + 1, runter)} g={15} f={F.granat} w={800} o={runter}>{de(erg[i])}</Tx>}
            </g>
          );
        })}
        {p.muster && werte.slice(1).map((w, i) => <BogenUnten key={"m" + i} xa={cx(i) + 6} xb={cx(i + 1) - 6} y={yT + 12} tiefe={6} u={staffel(ue, i, n - 1, 0.4)} text={`+ ${de(a * (werte[i + 1] - werte[i]))}`} />)}
      </>
    );
  },
};

/* ============================================================
   d_saeckchen – Variable als Säckchen: 3x + 2 = x + x + x + 2; in jedes Säckchen kommt dieselbe Zahl
   p: { a: 3, b: 2, w: 4, v: "x" }   (a ≤ 4, b ≤ 3, w ≤ 6)
   ============================================================ */
function Sack({ cx, yb, o = 1, v }) {
  if (o <= 0) return null;
  const d = `M${cx - 11} ${yb - 50} Q${cx - 29} ${yb - 40} ${cx - 26} ${yb - 18} Q${cx - 24} ${yb} ${cx} ${yb} Q${cx + 24} ${yb} ${cx + 26} ${yb - 18} Q${cx + 29} ${yb - 40} ${cx + 11} ${yb - 50} Z`;
  return (
    <g opacity={o}>
      <path d={d} fill={F.blauHell} stroke={F.blau} strokeWidth="1.8" strokeLinejoin="round" />
      <path d={`M${cx - 11} ${yb - 50} L${cx - 17} ${yb - 60} M${cx + 11} ${yb - 50} L${cx + 17} ${yb - 60} M${cx - 12} ${yb - 50} H${cx + 12}`} stroke={F.blau} strokeWidth="1.8" strokeLinecap="round" />
      <Tx x={cx} y={yb - 31} g={15} f={F.blau} w={800} style={{ ...SCHRIFT, fontStyle: "italic" }}>{v}</Tx>
    </g>
  );
}
const d_saeckchen = {
  h: 214,
  label: (p) => `Term ${p.a}${p.v} + ${p.b} als Säckchen: für ${p.v} = ${p.w} kommen ${p.w} Murmeln in jedes Säckchen`,
  ablauf: (p) => {
    const r = p.a * p.w + p.b, wort = ["", "ein", "zwei", "drei", "vier"][p.a] || de(p.a);
    return [
      { k: "sehen", ms: 1600, text: `${p.a}${p.v} + ${p.b} heißt: ${Array(p.a).fill(p.v).join(" + ")} + ${p.b} – gleiche Säckchen, ${p.b} Murmeln.` },
      { k: "fuellen", ms: 2600, text: `Für ${p.v} = ${p.w}: in jedes Säckchen kommen ${p.w} Murmeln – in alle gleich viele.` },
      { k: "zaehlen", ms: 1600, text: `${wort[0].toUpperCase() + wort.slice(1)} Säckchen zu je ${p.w} und ${p.b} dazu: ${p.a} · ${p.w} + ${p.b} = ${r}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const { a, b, w, v } = p, r = a * w + b;
    const us = Z("sehen"), uf = z("fuellen"), uz = Z("zaehlen");
    const yb = 150, abst = 70, x0 = 52, sx = (i) => x0 + i * abst, xl = sx(a - 1) + 50;
    const mr = 5.2, proReihe = w > 4 ? 3 : 2;
    const platz = (i, k) => { const reihe = Math.floor(k / proReihe), sp = k % proReihe, inR = Math.min(proReihe, w - reihe * proReihe); return [sx(i) + (sp - (inR - 1) / 2) * 11.5, yb - 9 - reihe * 11]; };
    const Murmel = ({ x, y, f, s, o = 1 }) => <circle cx={x} cy={y} r={mr} fill={f} stroke={s} strokeWidth="1.2" opacity={o} />;
    return (
      <>
        {/* Term oben – bleibt als Vorher stehen */}
        <Tx x={B / 2} y={34} g={22} f={F.tinte} w={800} o={us}>{`${a}`}<tspan fill={F.blau} fontStyle="italic">{v}</tspan>{` + ${b}`}</Tx>
        <Pille x={B / 2 + 74} y={30} a="start" text={`${v} = ${w}`} g={12.5} f={F.goldHell} tf={F.goldDunkel} o={teil(uf, 0, 0.15)} />
        {Array.from({ length: a }, (_, i) => (
          <g key={i}>
            <Sack cx={sx(i)} yb={yb} v={v} o={staffel(us, i, a + 1, 0.5)} />
            {i < a - 1 && <Tx x={(sx(i) + sx(i + 1)) / 2} y={yb - 22} g={18} f={F.grau} w={800} o={staffel(us, i, a + 1, 0.5)}>+</Tx>}
          </g>
        ))}
        <Tx x={sx(a - 1) + 35} y={yb - 22} g={18} f={F.grau} w={800} o={staffel(us, a, a + 1, 0.5)}>+</Tx>
        {Array.from({ length: b }, (_, k) => <Murmel key={"b" + k} x={xl + 6 + (k % 2) * 15} y={yb - 9 - Math.floor(k / 2) * 14} f={F.granatHell} s={F.granat} o={staffel(us, a, a + 1, 0.5)} />)}
        {/* Einfüllen: in alle Säckchen gleichzeitig dieselbe Zahl (GOLD) */}
        {Array.from({ length: a }, (_, i) => Array.from({ length: w }, (_, k) => {
          const u = sanft(staffel(uf, k, w, 0.4));
          if (u <= 0) return null;
          const [x, y] = platz(i, k);
          return <Murmel key={i + "-" + k} x={x} y={mix(52, y, u)} f={F.gold} s={F.goldDunkel} o={klemm(u * 4)} />;
        }))}
        {/* Zählen */}
        {Array.from({ length: a }, (_, i) => <Tx key={"z" + i} x={sx(i)} y={yb + 20} g={14} f={F.granat} w={800} o={uz}>{w}</Tx>)}
        <Tx x={xl + 13} y={yb + 20} g={14} f={F.granat} w={800} o={uz}>{b}</Tx>
        <Pille x={B / 2} y={200} text={`${a} · ${w} + ${b} = ${r}`} g={13} f={F.granat} tf={F.weiss} o={uz} />
      </>
    );
  },
};

/* ============================================================
   d_streichhoelzer – Muster wächst: n Quadrate brauchen 3n + 1 Hölzer
   p: { n: 4 }
   ============================================================ */
function Holz({ x1, y1, x2, y2, u, f }) {
  if (u <= 0) return null;
  const L = Math.hypot(x2 - x1, y2 - y1), ex = (x2 - x1) / L, ey = (y2 - y1) / L;
  const ax = x1 + ex * 4, ay = y1 + ey * 4, bx = mix(ax, x2 - ex * 4, u), by = mix(ay, y2 - ey * 4, u);
  return (
    <g>
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke={f} strokeWidth="5" strokeLinecap="round" />
      <circle cx={bx} cy={by} r="3.6" fill={F.granat} opacity={teil(u, 0.7, 1)} />
    </g>
  );
}
const d_streichhoelzer = {
  h: 204,
  label: (p) => `Streichholzmuster: n Quadrate brauchen 3n + 1 Hölzer`,
  ablauf: (p) => [
    ...Array.from({ length: p.n }, (_, k) => ({
      k: `f${k}`, ms: k === 0 ? 1500 : 1100,
      text: k === 0 ? "Figur 1: ein Quadrat aus 4 Hölzern." : k === 1 ? "Figur 2: nur 3 Hölzer mehr – die linke Wand steht schon." : `Figur ${k + 1}: wieder 3 dazu – ${3 * (k + 1) + 1} Hölzer.`,
    })),
    { k: "term", ms: 1800, text: "Ein Startholz und 3 Hölzer je Quadrat: 1 + 3 · n = 3n + 1." },
    { k: "probe", ms: 1400, text: `Probe mit n = ${p.n}: 3 · ${p.n} + 1 = ${3 * p.n + 1} ✓` },
  ],
  bild: ({ Z, z, p }) => {
    const N = p.n, s = 46, x0 = 22, yt = 40, yb = yt + s, ut = Z("term"), up = Z("probe");
    const hoelzer = [];
    for (let k = 0; k < N; k++) {
      const u = z(`f${k}`), xl = x0 + k * s, xr = xl + s;
      if (k === 0) hoelzer.push({ k: "L", x1: x0, y1: yb, x2: x0, y2: yt, u: sanft(teil(u, 0, 0.3)), f: F.blau });
      const v = k === 0 ? teil(u, 0.25, 1) : u;
      hoelzer.push({ k: `o${k}`, x1: xl, y1: yt, x2: xr, y2: yt, u: sanft(staffel(v, 0, 3, 0.3)), f: F.gold });
      hoelzer.push({ k: `r${k}`, x1: xr, y1: yt, x2: xr, y2: yb, u: sanft(staffel(v, 1, 3, 0.3)), f: F.gold });
      hoelzer.push({ k: `u${k}`, x1: xr, y1: yb, x2: xl, y2: yb, u: sanft(staffel(v, 2, 3, 0.3)), f: F.gold });
    }
    const tx = 252, ty = 318;
    return (
      <>
        {hoelzer.map((h) => <Holz key={h.k} {...h} />)}
        {Array.from({ length: N }, (_, k) => <Tx key={"n" + k} x={x0 + k * s + s / 2} y={yt + s / 2 + 4} g={11} f={F.hell} w={800} o={teil(z(`f${k}`), 0.6, 1) * (1 - ut)}>{k + 1}</Tx>)}
        {/* Zerlegung unter der Figur */}
        <g opacity={ut}>
          <Tx x={x0} y={yb + 24} g={13} f={F.blau} w={800}>1</Tx>
          {Array.from({ length: N }, (_, k) => <Tx key={"d" + k} x={x0 + k * s + s / 2 + 4} y={yb + 24} g={13} f={F.goldDunkel} w={800} o={staffel(ut, k, N, 0.5)}>+ 3</Tx>)}
        </g>
        {/* Tabelle */}
        <Tx x={tx} y={34} g={10.5} f={F.grau} w={700}>Quadrate n</Tx>
        <Tx x={ty} y={34} g={10.5} f={F.grau} w={700}>Hölzer</Tx>
        <line x1={218} x2={352} y1={41} y2={41} stroke={F.linie} strokeWidth="1.4" />
        {Array.from({ length: N }, (_, k) => {
          const o = teil(z(`f${k}`), 0.5, 1), y = 62 + k * 23;
          return (
            <g key={"t" + k} opacity={o}>
              <Tx x={tx} y={y} g={15} f={F.tinte} w={800}>{k + 1}</Tx>
              <Tx x={ty} y={y} g={15} f={F.granat} w={800}>{3 * (k + 1) + 1}</Tx>
              {k > 0 && <Tx x={352} y={y - 9} g={10} f={F.goldDunkel} w={800} a="end">+ 3</Tx>}
            </g>
          );
        })}
        <g opacity={ut} transform={`translate(0 ${(1 - ut) * 8})`}>
          <Tx x={B / 2} y={160} g={19} f={F.tinte} w={800}>
            <tspan fill={F.blau}>1</tspan> + <tspan fill={F.goldDunkel}>3 · n</tspan> = <tspan fill={F.granat}>3n + 1</tspan>
          </Tx>
        </g>
        <Tx x={B / 2} y={192} g={13} f={F.gruen} w={800} o={up}>{`Probe: n = ${N} → 3 · ${N} + 1 = ${3 * N + 1} ✓`}</Tx>
      </>
    );
  },
};

/* ============================================================
   d_tarif – Term aus einem Tarif: fester Block (Grundgebühr) + je Einheit ein gleicher Block; Term abgelesen
   p: { grund: 3, preis: 1.5, n: 4, v: "h", wofuer: "Eintritt", einheit: "Stunde", einheiten: "Stunden" }
   ============================================================ */
const d_tarif = {
  h: 216,
  label: (p) => `Term ${de(p.grund)} + ${de(p.preis)} · ${p.v} aus Grundgebühr und Preis pro ${p.einheit}`,
  ablauf: (p) => {
    const e = (v) => de(v, Number.isInteger(v) ? 0 : 2);
    return [
      { k: "grund", ms: 1500, text: `${e(p.grund)} € ${p.wofuer} zahlt jeder, egal wie lange er bleibt.` },
      { k: "stunden", ms: 3200, text: `Jede ${p.einheit} legt ein gleiches Stück von ${e(p.preis)} € dazu.` },
      { k: "term", ms: 1800, text: `Fest ${e(p.grund)} €, dazu ${p.v} Stücke zu ${e(p.preis)} €: ${de(p.grund)} + ${de(p.preis)} · ${p.v}.` },
      { k: "probe", ms: 1500, text: `Für ${p.n} ${p.einheiten}: ${de(p.grund)} + ${de(p.preis)} · ${p.n} = ${e(p.grund + p.preis * p.n)} € – die längste Reihe.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const { grund, preis, n, v } = p, e = (x) => de(x, Number.isInteger(x) ? 0 : 2);
    const ug = Z("grund"), us = z("stunden"), ut = Z("term"), up = Z("probe");
    const ry = (h) => 26 + h * 26, x0 = 58, k = Math.min(18, 200 / (grund + preis * n)), bh = 20;
    const wg = grund * k, wp = preis * k;
    return (
      <>
        {Array.from({ length: n + 1 }, (_, h) => {
          const o = staffel(ug, h, n + 1, 0.6), letzte = h === n;
          return (
            <g key={h}>
              <Tx x={14} y={ry(h) + 5} g={11.5} f={letzte && up > 0 ? F.granat : F.tinte} w={800} a="start" o={o}>{`${v} = ${h}`}</Tx>
              {letzte && <rect x={x0 - 4} y={ry(h) - bh / 2 - 4} width={wg + wp * n + 70} height={bh + 8} rx="8" fill="none" stroke={F.granat} strokeWidth="2" opacity={up} />}
              <g opacity={o}>
                <rect x={x0} y={ry(h) - bh / 2} width={wg} height={bh} rx="4" fill={F.blauHell} stroke={F.blau} strokeWidth="1.3" />
                <Tx x={x0 + wg / 2} y={ry(h) + 4} g={10.5} f={F.blau} w={800}>{`${e(grund)} €`}</Tx>
              </g>
              {Array.from({ length: h }, (_, j) => {
                /* Reihe h bekommt ihre Stücke nacheinander; alle Reihen wachsen im Gleichschritt Stunde für Stunde */
                const u = raus(staffel(us, j, n, 0.25));
                if (u <= 0) return null;
                const x = x0 + wg + j * wp;
                return (
                  <g key={j} opacity={klemm(u * 2)} transform={`translate(${(1 - u) * 14} 0)`}>
                    <rect x={x} y={ry(h) - bh / 2} width={wp} height={bh} rx="4" fill={F.gold} stroke={F.goldDunkel} strokeWidth="1.2" />
                    <Tx x={x + wp / 2} y={ry(h) + 4} g={9.5} f={F.granatTief} w={800}>{e(preis)}</Tx>
                  </g>
                );
              })}
              <Tx x={x0 + wg + wp * h + 8} y={ry(h) + 5} g={12.5} f={letzte && up > 0 ? F.granat : F.tinte} w={800} a="start" o={h === 0 ? o : teil(us, (h - 1) / n + 0.1, Math.min(1, h / n + 0.05))}>{`${e(grund + preis * h)} €`}</Tx>
            </g>
          );
        })}
        <g opacity={ut} transform={`translate(0 ${(1 - ut) * 6})`}>
          <Tx x={B / 2} y={ry(n) + 40} g={18} f={F.tinte} w={800}>{"Kosten = "}<tspan fill={F.blau}>{de(grund)}</tspan>{" + "}<tspan fill={F.goldDunkel}>{`${de(preis)} · ${v}`}</tspan></Tx>
        </g>
        <Pille x={B / 2} y={ry(n) + 66} text={`${v} = ${n}: ${de(grund)} + ${de(preis)} · ${n} = ${e(grund + preis * n)} €`} g={12} f={F.granat} tf={F.weiss} o={up} />
      </>
    );
  },
};

/* ============================================================
   d_sortieren – gleichartige Glieder sortieren sich und werden zusammengefasst
   p: { glieder: [[5, 1], [3, 0], [2, 1], [-1, 0]], v: "a" }   ([Koeffizient, istVariable])
   ============================================================ */
const gliedText = (k, istVar, v, erst) => {
  const kern = istVar ? (Math.abs(k) === 1 ? v : de(Math.abs(k)) + v) : de(Math.abs(k));
  if (erst) return (k < 0 ? "−" : "") + kern;
  return (k < 0 ? "− " : "+ ") + kern;
};
const d_sortieren = {
  h: 200,
  label: (p) => "Gleichartige Glieder zusammenfassen",
  ablauf: (p) => {
    const gl = p.glieder, v = p.v, kv = summe(gl.filter((x) => x[1]).map((x) => x[0])), kz = summe(gl.filter((x) => !x[1]).map((x) => x[0]));
    const vs = gl.filter((x) => x[1]), zs = gl.filter((x) => !x[1]);
    const orig = gl.map((x, i) => gliedText(x[0], x[1], v, i === 0)).join(" ");
    return [
      { k: "zeigen", ms: 1100, text: `Der Term ${orig} hat ${gl.length} Glieder.` },
      { k: "sortieren", ms: 1700, text: `${v}-Glieder zu ${v}-Gliedern, Zahlen zu Zahlen – samt Rechenzeichen.` },
      { k: "va", ms: 1400, text: `${vs.map((x, i) => gliedText(x[0], 1, v, i === 0)).join(" ")} = ${gliedText(kv, 1, v, true)} – wie ${de(vs[0][0])} Äpfel plus ${de(vs[1][0])} Äpfel.` },
      { k: "za", ms: 1200, text: `Die Zahlen: ${zs.map((x, i) => gliedText(x[0], 0, v, i === 0)).join(" ")} = ${de(kz)}.` },
      { k: "fertig", ms: 1400, text: `Vereinfacht: ${gliedText(kv, 1, v, true)} ${op(kz)} – ${v}-Glied und Zahl bleiben getrennt.` },
    ];
  },
  bild: ({ Z, p }) => {
    const gl = p.glieder, v = p.v, n = gl.length, g = 17, ch = 38, cy = 50;
    const kv = summe(gl.filter((x) => x[1]).map((x) => x[0])), kz = summe(gl.filter((x) => !x[1]).map((x) => x[0]));
    const wk = gl.map((x) => breite(gliedText(x[0], x[1], v, false), g) + 20);
    const reihe = (ord, gruppenLuecke) => {
      const xs = [], luecke = 8;
      let tot = 0; ord.forEach((i, j) => { tot += wk[i] + (j ? luecke : 0); if (j && gl[ord[j - 1]][1] !== gl[i][1]) tot += gruppenLuecke; });
      let x = (B - tot) / 2;
      ord.forEach((i, j) => { if (j) { x += luecke; if (gl[ord[j - 1]][1] !== gl[i][1]) x += gruppenLuecke; } xs[i] = x; x += wk[i]; });
      return xs;
    };
    const ordO = gl.map((_, i) => i), ordS = [...ordO.filter((i) => gl[i][1]), ...ordO.filter((i) => !gl[i][1])];
    const xO = reihe(ordO, 0), xS = reihe(ordS, 30);
    const vIdx = ordS.filter((i) => gl[i][1]), zIdx = ordS.filter((i) => !gl[i][1]);
    const grenzen = (idx) => [xS[idx[0]], xS[idx[idx.length - 1]] + wk[idx[idx.length - 1]]];
    const [va0, va1] = grenzen(vIdx), [za0, za1] = grenzen(zIdx), vMitte = (va0 + va1) / 2, zMitte = (za0 + za1) / 2;
    const u0 = Z("zeigen"), us = Z("sortieren"), uv = Z("va"), uz = Z("za"), uf = Z("fertig");
    const tVar = gliedText(kv, 1, v, true), tZahl = gliedText(kz, 0, v, false);
    const farbe = (istVar) => (istVar ? [F.blauHell, F.blau] : [F.goldHell, F.goldDunkel]);
    const orig = gl.map((x, i) => gliedText(x[0], x[1], v, i === 0)).join(" ");
    return (
      <>
        {gl.map((x, i) => {
          const mitte = x[1] ? vMitte : zMitte, um = x[1] ? uv : uz;
          const xm = mix(xO[i], xS[i], us), xx = mix(xm, mitte - wk[i] / 2, sanft(teil(um, 0, 0.6)));
          const dy = xO[i] !== xS[i] ? (x[1] ? -1 : 1) * Math.sin(Math.PI * us) * 24 : 0;
          const erst = us < 0.5 ? i === 0 : ordS[0] === i;
          const [fl, tf] = farbe(x[1]);
          const o = u0 * (1 - teil(um, 0.5, 0.75));
          return <Kasten key={i} x={xx} y={cy + dy} w={wk[i]} h={ch} text={gliedText(x[0], x[1], v, erst)} f={fl} rand={tf} tf={tf} g={g} r={9} o={o} />;
        })}
        {[[tVar, vMitte, uv, true], [tZahl, zMitte, uz, false]].map(([t, m, um, iv]) => {
          const w = breite(t, g) + 22, [fl, tf] = farbe(iv), o = teil(um, 0.55, 0.85);
          return <Kasten key={t} x={m - w / 2} y={cy} w={w} h={ch} text={t} f={fl} rand={F.granat} tf={tf} g={g} r={9} o={o} s={o > 0 && o < 1 ? federnd(o) : 1} />;
        })}
        {[[va0, va1, `${v}-Glieder`, F.blau, `${vIdx.map((i, j) => gliedText(gl[i][0], 1, v, j === 0)).join(" ")} = ${tVar}`, uv],
          [za0, za1, "Zahlen", F.goldDunkel, `${zIdx.map((i, j) => gliedText(gl[i][0], 0, v, j === 0)).join(" ")} = ${de(kz)}`, uz]].map(([a, b, name, f, rech, um]) => (
          <g key={name}>
            <g opacity={teil(us, 0.75, 1)}>
              <path d={`M${a + 2} ${cy + ch + 8} v6 h${b - a - 4} v-6`} fill="none" stroke={f} strokeWidth="1.8" strokeLinecap="round" />
              <Tx x={(a + b) / 2} y={cy + ch + 30} g={11} f={f} w={800}>{name}</Tx>
            </g>
            <Tx x={(a + b) / 2} y={cy + ch + 50} g={12} f={F.tinte} w={700} o={teil(um, 0.3, 0.8)}>{rech}</Tx>
          </g>
        ))}
        <g opacity={uf} transform={`translate(0 ${(1 - uf) * 6})`}>
          <rect x={B / 2 - (breite(`${orig} = ${tVar} ${tZahl}`, 15) + 24) / 2} y={164} width={breite(`${orig} = ${tVar} ${tZahl}`, 15) + 24} height={30} rx="15" fill={F.flaeche} />
          <Tx x={B / 2} y={184} g={15} f={F.tinte} w={800}>{`${orig} = `}<tspan fill={F.granat}>{`${tVar} ${tZahl}`}</tspan></Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   d_klammer – Klammer auflösen mit Bausteinen: (3x + 4) ist ein Paket, 2 · heißt das Paket zweimal;
   spaltenweise zählen: 2 · 3x = 6x, 2 · 4 = 8; mit dem x dazu 7x + 8
   p: { a: 2, k: 3, c: 4, extra: 1, v: "x" }   → a · (k·v + c) + extra·v
   ============================================================ */
const d_klammer = {
  h: 214,
  label: (p) => `Klammer auflösen: ${p.a} · (${p.k}${p.v} + ${p.c}) + ${p.extra === 1 ? "" : p.extra}${p.v} = ${p.a * p.k + p.extra}${p.v} + ${p.a * p.c}`,
  ablauf: (p) => {
    const { a, k, c, extra, v } = p, wort = ["", "ein", "zwei", "drei", "vier", "fünf"];
    return [
      { k: "sehen", ms: 1400, text: `(${k}${v} + ${c}) ist ein Paket: ${wort[k] || k} ${v} und ${wort[c] || c} Einer.` },
      { k: "doppeln", ms: 2400, text: `${a} · heißt: das ganze Paket ${a}-mal – jedes Glied ${a}-mal.` },
      { k: "zaehlen", ms: 2000, text: `Spaltenweise zählen: ${a} · ${k}${v} = ${a * k}${v} und ${a} · ${c} = ${a * c}.` },
      { k: "fertig", ms: 1700, text: `Mit dem ${extra === 1 ? "" : extra}${v} dazu: ${a * k + extra}${v} + ${a * c}.` },
    ];
  },
  bild: ({ Z, p }) => {
    const { a, k, c, extra, v } = p, kx = a * k + extra, kc = a * c;
    const us = Z("sehen"), ud = Z("doppeln"), uz = Z("zaehlen"), uf = Z("fertig");
    const tw = 28, th = 22, ew = 15, y1 = 66, dy = 40, yr = (r) => y1 + r * dy;
    const xs = 62, xT = (i) => xs + i * (tw + 5), xE0 = xT(k) + 8, xE = (j) => xE0 + j * (ew + 4);
    const kl0 = xs - 14, kl1 = xE(c - 1) + ew + 14, xX = kl1 + 34;
    const Kachel = ({ x, y, o = 1 }) => <g opacity={o}><rect x={x} y={y - th / 2} width={tw} height={th} rx="4" fill={F.blauHell} stroke={F.blau} strokeWidth="1.4" /><Tx x={x + tw / 2} y={y + 4.5} g={12.5} f={F.blau} w={800} style={{ ...SCHRIFT, fontStyle: "italic" }}>{v}</Tx></g>;
    const Einer = ({ x, y, o = 1 }) => <rect x={x} y={y - ew / 2} width={ew} height={ew} rx="3" fill={F.granatHell} stroke={F.granat} strokeWidth="1.3" opacity={o} />;
    const Paket = ({ y, rand, o = 1 }) => (
      <g opacity={o}>
        <rect x={kl0} y={y - th / 2 - 7} width={kl1 - kl0} height={th + 14} rx="12" fill="none" stroke={rand} strokeWidth="1.8" />
        {Array.from({ length: k }, (_, i) => <Kachel key={"t" + i} x={xT(i)} y={y} />)}
        {Array.from({ length: c }, (_, j) => <Einer key={"e" + j} x={xE(j)} y={y} />)}
      </g>
    );
    const kopie = sanft(teil(ud, 0, 0.7));
    const xMitte = (xT(0) + xT(k - 1) + tw) / 2, eMitte = (xE(0) + xE(c - 1) + ew) / 2;
    return (
      <>
        <Tx x={B / 2} y={26} g={19} f={F.tinte} w={800} o={us}>{`${a} · (${k}`}<tspan fill={F.blau}>{v}</tspan>{` + ${c}) + ${extra === 1 ? "" : extra}`}<tspan fill={F.blau}>{v}</tspan></Tx>
        {/* Original-Paket und das zusätzliche x */}
        <Paket y={yr(0)} rand={F.grau} o={us} />
        <Tx x={kl1 + 14} y={yr(0) + 6} g={18} f={F.grau} w={800} o={us}>+</Tx>
        {Array.from({ length: extra }, (_, j) => <Kachel key={"x" + j} x={xX + j * (tw + 5)} y={yr(0)} o={us} />)}
        {/* die weiteren Pakete (GOLD umrandet = der Schritt) */}
        {Array.from({ length: a - 1 }, (_, r) => kopie > 0 && <Paket key={"p" + r} y={mix(yr(0), yr(r + 1), kopie)} rand={F.gold} o={klemm(kopie * 3)} />)}
        <g opacity={teil(ud, 0.6, 1)}>
          <path d={`M${kl0 - 6} ${yr(0) - 16} h-6 V${yr(a - 1) + 16} h6`} fill="none" stroke={F.goldDunkel} strokeWidth="2" strokeLinejoin="round" />
          <Tx x={kl0 - 16} y={(yr(0) + yr(a - 1)) / 2 + 5} g={14} f={F.goldDunkel} w={800} a="end">{`${a} ·`}</Tx>
        </g>
        {/* Zählen je Spalte */}
        <g opacity={uz}>
          <Tx x={xMitte} y={yr(a - 1) + 40} g={14} f={F.blau} w={800}>{`${a} · ${k}${v} = ${a * k}${v}`}</Tx>
          <Tx x={eMitte} y={yr(a - 1) + 40} g={14} f={F.granat} w={800}>{`${a} · ${c} = ${kc}`}</Tx>
          <Tx x={xX + tw / 2} y={yr(a - 1) + 40} g={14} f={F.blau} w={800}>{`+ ${extra === 1 ? "" : extra}${v}`}</Tx>
        </g>
        <g opacity={uf} transform={`translate(0 ${(1 - uf) * 6})`}>
          <Tx x={B / 2 - 40} y={yr(a - 1) + 74} g={16} f={F.tinte} w={800}>{`= ${a * k}${v} + ${kc} + ${extra === 1 ? "" : extra}${v} =`}</Tx>
          <Pille x={B / 2 + 48} y={yr(a - 1) + 74} a="start" text={`${kx}${v} + ${kc}`} g={15} f={F.granat} tf={F.weiss} />
        </g>
      </>
    );
  },
};

/* ============================================================
   d_waage – Gleichung a·x + b = c als Balkenwaage
   p: { a: 3, b: 2, c: 17 }
   ============================================================ */
const d_waage = {
  h: 218,
  label: (p) => `Balkenwaage: ${de(p.a)}x + ${de(p.b)} = ${de(p.c)}`,
  ablauf: (p) => {
    const x = (p.c - p.b) / p.a;
    return [
      { k: "aufbau", ms: 1500, text: `Jede Kiste wiegt x, jede Kugel 1: links ${p.a}x + ${p.b}, rechts ${p.c}.` },
      { k: "kippt", ms: 2200, text: `Nur links ${p.b} Kugeln weg? Die Waage kippt – so geht es nicht.` },
      { k: "beide", ms: 1600, text: `Auf beiden Seiten ${p.b} Kugeln weg – die Waage bleibt im Gleichgewicht.` },
      { k: "teilen", ms: 2000, text: `Beide Seiten durch ${p.a}: eine Kiste wiegt so viel wie ${x} Kugeln.` },
      { k: "probe", ms: 1400, text: `Also x = ${x}. Probe: ${p.a} · ${x} + ${p.b} = ${p.c} ✓` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const { a, b, c } = p, x = (c - b) / a;
    const P = { x: 180, y: 162 }, plY = 152;
    /* kippt: erst kippt die Waage (erste Hälfte), dann wird es zurückgenommen */
    const uk = sanft(teil(z("kippt"), 0, 0.45)), ur = sanft(teil(z("kippt"), 0.6, 1)), ub = Z("beide"), ut = Z("teilen"), upr = Z("probe"), ua = z("aufbau");
    const fall = (i, n) => { const u = raus(staffel(ua, i, n, 0.6)); return { o: klemm(u * 3), dy: (u - 1) * 30 }; };
    const kipp = uk * (1 - ur), winkel = 7 * kipp;
    const weg = Math.max(kipp, ub);   // Kugeln links b: weg
    const wegR = ub;                  // Kugeln rechts b: weg
    const teilSicht = teil(ut, 0, 0.25), aus = teil(ut, 0.25, 0.6), schieb = sanft(teil(ut, 0.6, 1));
    /* links: a Kisten, darüber b Kugeln */
    const kb = 30, kAbst = 38, lx = 95, rx = 265;
    const kistenX = (i) => lx + (i - (a - 1) / 2) * kAbst;
    /* rechts: a Gruppen zu x Kugeln (3er-Reihen), oben b Extra-Kugeln */
    const r = 6, d = 14, proReihe = 3, gw = proReihe * d, gAbst = gw + 8;
    const gruppeX = (j) => rx + (j - (a - 1) / 2) * gAbst;
    const kugeln = [];
    for (let j = 0; j < a; j++) for (let m = 0; m < x; m++) {
      const reihe = Math.floor(m / proReihe), sp = m % proReihe, inReihe = Math.min(proReihe, x - reihe * proReihe);
      kugeln.push({ j, x: gruppeX(j) + (sp - (inReihe - 1) / 2) * d, y: plY - r - 1 - reihe * d });
    }
    const reihenR = Math.ceil(x / proReihe), extraY = plY - r - 1 - reihenR * d - 2;
    const Kugel = ({ cx, cy, o = 1, dy = 0 }) => o > 0 ? <circle cx={cx} cy={cy + dy} r={r} fill={F.gold} stroke={F.goldDunkel} strokeWidth="1" opacity={o} /> : null;
    /* Gleichungskette oben: alle Stufen bleiben stehen (Vorher und Nachher), Umformung in GOLD dazwischen */
    const gg = 16, gl = [`${a}x + ${b} = ${c}`, `${a}x = ${c - b}`, `x = ${x}`], ops = [`| − ${b}`, `| : ${a}`];
    const wGl = gl.map((t) => breite(t, gg)), wOp = ops.map((t) => breite(t, 11) + 14), luft = 8;
    const ges = wGl[0] + wGl[1] + wGl[2] + wOp[0] + wOp[1] + 4 * luft, xg0 = (B - ges) / 2;
    const xGl = [xg0, xg0 + wGl[0] + wOp[0] + 2 * luft, xg0 + wGl[0] + wGl[1] + wOp[0] + wOp[1] + 4 * luft];
    const xOp = [xg0 + wGl[0] + luft, xGl[1] + wGl[1] + luft];
    const oGl = [1, teil(ub, 0.6, 1), teil(ut, 0.6, 1)], oOp = [teil(ub, 0, 0.3), teil(ut, 0, 0.3)];
    return (
      <>
        {gl.map((t, i) => <Tx key={"gl" + i} x={xGl[i]} y={32} g={gg} f={i === 2 ? F.granat : F.tinte} w={800} a="start" o={oGl[i] * klemm(ua * 3)}>{t}</Tx>)}
        {ops.map((t, i) => <Pille key={"op" + i} x={xOp[i]} y={30} a="start" text={t} g={11} f={F.goldHell} tf={F.goldDunkel} o={oOp[i]} />)}
        {uk > 0 && ur < 1 && <Pille x={B / 2} y={66} text="nur links? falsch!" g={11.5} f={F.granatHell} tf={F.granat} o={teil(uk, 0.2, 0.5) * (1 - ur)} />}
        <Tx x={B / 2} y={62} g={12.5} f={F.gruen} w={800} o={upr}>{`Probe: ${a} · ${x} + ${b} = ${c} ✓`}</Tx>
        {/* Ständer */}
        <path d={`M${P.x} ${P.y} L${P.x - 20} 204 L${P.x + 20} 204 Z`} fill={F.tinte} />
        <rect x={P.x - 44} y={204} width={88} height={6} rx="3" fill={F.tinte} />
        <g transform={`rotate(${winkel} ${P.x} ${P.y})`}>
          <rect x={22} y={P.y - 4} width={316} height={7} rx="3.5" fill={F.tinte} />
          <rect x={28} y={plY} width={134} height={6} rx="3" fill={F.hell} />
          <rect x={198} y={plY} width={134} height={6} rx="3" fill={F.hell} />
          {/* links: Kisten */}
          {Array.from({ length: a }, (_, i) => {
            const o = i === 0 ? 1 : 1 - aus, xx = i === 0 ? mix(kistenX(0), lx, schieb) : kistenX(i);
            const fa = fall(i, a + 2);
            return o > 0 && (
              <g key={"k" + i} opacity={o * fa.o} transform={`translate(0 ${fa.dy})`}>
                <rect x={xx - kb / 2} y={plY - kb} width={kb} height={kb} rx="5" fill={F.blauHell} stroke={F.blau} strokeWidth="1.6" />
                <Tx x={xx} y={plY - kb / 2 + 5.5} g={15} f={F.blau} w={800} style={{ ...SCHRIFT, fontStyle: "italic" }}>x</Tx>
              </g>
            );
          })}
          {Array.from({ length: b }, (_, i) => <Kugel key={"lb" + i} cx={lx + (i - (b - 1) / 2) * 17} cy={plY - kb - r - 3} dy={-weg * 40 + fall(a, a + 2).dy} o={(1 - weg) * fall(a, a + 2).o} />)}
          {/* rechts */}
          {kugeln.map((k, i) => {
            const o = k.j === 0 ? 1 : 1 - aus, xx = k.j === 0 ? k.x + (rx - gruppeX(0)) * schieb : k.x;
            const fa = fall(a + 1, a + 2);
            return <Kugel key={"r" + i} cx={xx} cy={k.y} dy={fa.dy} o={o * fa.o} />;
          })}
          {Array.from({ length: b }, (_, i) => <Kugel key={"rb" + i} cx={rx + (i - (b - 1) / 2) * 17} cy={extraY} dy={-wegR * 40 + fall(a + 1, a + 2).dy} o={(1 - wegR) * fall(a + 1, a + 2).o} />)}
          {/* Trennlinien beim Teilen */}
          {teilSicht > 0 && Array.from({ length: a - 1 }, (_, i) => (
            <g key={"t" + i} opacity={teilSicht * (1 - schieb)}>
              <line x1={(kistenX(i) + kistenX(i + 1)) / 2} x2={(kistenX(i) + kistenX(i + 1)) / 2} y1={plY - kb - 6} y2={plY - 2} stroke={F.granat} strokeWidth="1.6" strokeDasharray="3 3" />
              <line x1={(gruppeX(i) + gruppeX(i + 1)) / 2} x2={(gruppeX(i) + gruppeX(i + 1)) / 2} y1={plY - reihenR * d - 6} y2={plY - 2} stroke={F.granat} strokeWidth="1.6" strokeDasharray="3 3" />
            </g>
          ))}
        </g>
        <circle cx={P.x} cy={P.y} r="4" fill={F.gold} />
      </>
    );
  },
};

/* ============================================================
   d_pfeilkette – Rückwärtsrechnen: Rechenkette hin (oben), Umkehrungen zurück (unten)
   p: { v: "x", gleichung: "3x + 2 = 17", ops: [{ hin: "· 3", rueck: ": 3" }, { hin: "+ 2", rueck: "− 2" }],
        werte: [5, 15, 17], probe: "3 · 5 + 2 = 17 ✓", start?: "Untertitel 1" }
   ============================================================ */
const d_pfeilkette = {
  h: 196,
  label: (p) => `Rückwärtsrechnen: ${p.gleichung}`,
  ablauf: (p) => {
    const k = p.ops.length, w = p.werte;
    return [
      { k: "aufbau", ms: 2000 + k * 500, text: p.start || `${p.gleichung}: Aus ${p.v} wird ${de(w[k])} – erst ${p.ops.map((o) => o.hin).join(", dann ")}.` },
      ...p.ops.map((o, i) => k - 1 - i).map((i) => ({ k: `r${i}`, ms: 1500, text: `Rückwärts mit der Umkehrung: ${de(w[i + 1])} ${p.ops[i].rueck} = ${de(w[i])}` })),
      { k: "fertig", ms: 1600, text: `Also ${p.v} = ${de(w[0])}. Probe: ${p.probe}` },
    ];
  },
  bild: ({ Z, p }) => {
    const k = p.ops.length, w = p.werte, bw = 58, bh = 40, y = 92;
    const X = (i) => (k === 1 ? [110, 250][i] : 46 + (i * (B - 92)) / k);
    /* aufbau: erst die Kästchen, dann laufen die Hin-Pfeile */
    const ua = sanft(teil(Z("aufbau", (u) => u), 0, 0.4)), uh = sanft(teil(Z("aufbau", (u) => u), 0.4, 1)), uf = Z("fertig");
    const bekannt = (i) => (i === k ? 1 : Z(`r${i}`));
    return (
      <>
        <Tx x={B / 2} y={30} g={18} f={F.tinte} w={800} o={ua}>{p.gleichung}</Tx>
        {w.map((v, i) => {
          const u = bekannt(i), ziel = i === k, erst = i === 0;
          return (
            <g key={i} opacity={staffel(ua, i, k + 1, 0.5)}>
              <rect x={X(i) - bw / 2} y={y - bh / 2} width={bw} height={bh} rx="10" fill={ziel ? F.granatHell : erst && u > 0.5 ? F.gold : F.weiss} stroke={ziel ? F.granat : erst ? F.blau : F.linie} strokeWidth={erst || ziel ? 2 : 1.4} strokeDasharray={erst && u <= 0.5 ? "5 4" : "none"} />
              {erst && <Tx x={X(i)} y={y - bh / 2 - 7} g={11} f={F.blau} w={800} style={{ ...SCHRIFT, fontStyle: "italic" }} o={teil(u, 0.5, 1)}>{p.v}</Tx>}
              {!ziel && <Tx x={X(i)} y={y + 6} g={17} f={erst ? F.blau : F.hell} w={800} o={1 - teil(u, 0.3, 0.5)} style={erst ? { ...SCHRIFT, fontStyle: "italic" } : undefined}>{erst ? p.v : "?"}</Tx>}
              <Tx x={X(i)} y={y + 6} g={17} f={erst ? F.granatTief : ziel ? F.granat : F.tinte} w={800} o={teil(u, 0.5, 0.8)}>{de(v)}</Tx>
            </g>
          );
        })}
        {p.ops.map((o, i) => {
          const u = staffel(uh, i, k, 0.3), xa = X(i) + bw / 2 + 4, xb = X(i + 1) - bw / 2 - 6;
          return (
            <g key={"h" + i}>
              <Pfeil x1={xa} y1={y} x2={xb} y2={y} u={u} f={F.tinte} b={1.8} />
              <Tx x={(xa + xb) / 2} y={y - 10} g={13} f={F.tinte} w={800} o={teil(u, 0.5, 1)}>{o.hin}</Tx>
            </g>
          );
        })}
        {p.ops.map((o, i) => (
          <BogenUnten key={"r" + i} xa={X(i + 1) - 6} xb={X(i) + 6} y={y + bh / 2 + 4} tiefe={14} u={Z(`r${i}`)} text={o.rueck} f={F.granat} />
        ))}
        <Tx x={B / 2} y={y + bh / 2 + 52} g={10.5} f={F.grau} w={700} o={teil(Z(`r${k - 1}`), 0, 0.5)}>rückwärts: Umkehrungen in umgekehrter Reihenfolge</Tx>
        <g opacity={uf}>
          <Pille x={B / 2} y={184} text={`${p.v} = ${de(w[0])}  ·  Probe: ${p.probe}`} g={12} f={F.granat} tf={F.weiss} />
        </g>
      </>
    );
  },
};

/* ============================================================
   d_formel – Rechteck-Umfang: u = 2 · (a + b), Werte einsetzen, Probe durch Umlaufen
   p: { a: 4, b: 7, einheit: "cm" }
   ============================================================ */
const d_formel = {
  h: 184,
  label: (p) => `Formel u = 2 · (a + b) mit a = ${p.a}, b = ${p.b}`,
  ablauf: (p) => [
    { k: "rechteck", ms: 1100, text: "Ein Rechteck mit den Seiten a und b." },
    { k: "formel", ms: 1300, text: "Die Formel für den Umfang gilt für jedes Rechteck: u = 2 · (a + b)." },
    { k: "einsetzen", ms: 1500, text: `Einsetzen: a = ${de(p.a)} ${p.einheit}, b = ${de(p.b)} ${p.einheit}.` },
    { k: "rechnen", ms: 1500, text: `Erst die Klammer: ${de(p.a)} + ${de(p.b)} = ${de(p.a + p.b)}, dann mal 2.` },
    { k: "umlauf", ms: 2200, text: `Probe: einmal herum ist ${de(p.a)} + ${de(p.b)} + ${de(p.a)} + ${de(p.b)} = ${de(2 * (p.a + p.b))} ${p.einheit} ✓` },
  ],
  bild: ({ Z, z, p }) => {
    const { a, b, einheit: e } = p, k = Math.min(16, 112 / b, 64 / a);
    const rw = b * k, rh = a * k, rx = 76, ry = 46;
    const ur = Z("rechteck"), uf = Z("formel"), ue = Z("einsetzen"), uc = Z("rechnen"), uu = z("umlauf");
    const u = 2 * (a + b);
    /* Umlauf: links hoch (a), oben (b), rechts runter (a), unten (b) */
    const kanten = [
      { x1: rx, y1: ry + rh, x2: rx, y2: ry, f: F.blau, w: a },
      { x1: rx, y1: ry, x2: rx + rw, y2: ry, f: F.goldDunkel, w: b },
      { x1: rx + rw, y1: ry, x2: rx + rw, y2: ry + rh, f: F.blau, w: a },
      { x1: rx + rw, y1: ry + rh, x2: rx, y2: ry + rh, f: F.goldDunkel, w: b },
    ];
    const fx = 280, gF = 15.5;
    const fly = (von, nach, uu2, text, f) => uu2 > 0 && uu2 < 1 && <Tx x={mix(von[0], nach[0], uu2)} y={mix(von[1], nach[1], uu2)} g={gF} f={f} w={800}>{text}</Tx>;
    const z2 = `u = 2 · (${de(a)} + ${de(b)})`, w2 = breite(z2, gF), x2a = fx - w2 / 2;
    const posA = x2a + breite(`u = 2 · (`, gF) + breite(de(a), gF) / 2, posB = x2a + breite(`u = 2 · (${de(a)} + `, gF) + breite(de(b), gF) / 2;
    return (
      <>
        <rect x={rx} y={ry} width={rw * ur} height={rh} rx="2" fill={F.flaeche} stroke={F.tinte} strokeWidth="1.6" opacity={ur} />
        <Tx x={rx - 8} y={ry + rh / 2 + 4} g={13} f={F.blau} w={800} a="end" o={ur}>{ue > 0.05 ? `a = ${de(a)} ${e}` : "a"}</Tx>
        <Tx x={rx + rw / 2} y={ry - 9} g={13} f={F.goldDunkel} w={800} o={ur}>{ue > 0.05 ? `b = ${de(b)} ${e}` : "b"}</Tx>
        {/* Umlauf */}
        {kanten.map((kk, i) => {
          const uk = teil(uu, i * 0.2, (i + 1) * 0.2);
          return <Strich key={i} {...kk} u={uk} b={4.5} />;
        })}
        {uu > 0 && uu < 0.8 && (() => {
          const i = Math.min(3, Math.floor(uu / 0.2)), kk = kanten[i], uk = teil(uu, i * 0.2, (i + 1) * 0.2);
          return <circle cx={mix(kk.x1, kk.x2, uk)} cy={mix(kk.y1, kk.y2, uk)} r="5.5" fill={F.granat} />;
        })()}
        <Tx x={rx + rw / 2} y={ry + rh + 30} g={13} f={F.tinte} w={700} o={teil(uu, 0, 0.1)}>
          {kanten.map((kk, i) => <tspan key={i} fill={kk.f} fontWeight="800" opacity={teil(uu, i * 0.2, i * 0.2 + 0.1)}>{(i ? " + " : "") + de(kk.w)}</tspan>)}
          <tspan opacity={teil(uu, 0.8, 1)}>{` = ${de(u)} ${e} ✓`}</tspan>
        </Tx>
        {/* Formelspalte */}
        <rect x={fx - 76} y={20} width={152} height={34} rx="12" fill={F.granatHell} opacity={uf} />
        <Tx x={fx} y={43} g={gF + 1} f={F.tinte} w={800} o={uf}>u = 2 · (<tspan fill={F.blau}>a</tspan> + <tspan fill={F.goldDunkel}>b</tspan>)</Tx>
        <Tx x={fx} y={86} g={gF} f={F.tinte} w={800} o={teil(ue, 0.1, 0.4)}>
          {"u = 2 · ("}<tspan fill={F.blau} opacity={ue >= 1 ? 1 : 0}>{de(a)}</tspan>{" + "}<tspan fill={F.goldDunkel} opacity={ue >= 1 ? 1 : 0}>{de(b)}</tspan>{")"}
        </Tx>
        {fly([rx - 30, ry + rh / 2 + 4], [posA, 86], sanft(teil(ue, 0.3, 1)), de(a), F.blau)}
        {fly([rx + rw / 2 + 20, ry - 9], [posB, 86], sanft(teil(ue, 0.3, 1)), de(b), F.goldDunkel)}
        <Tx x={fx} y={120} g={gF} f={F.tinte} w={800} o={teil(uc, 0, 0.45)}>{`u = 2 · ${de(a + b)}`}</Tx>
        <g opacity={teil(uc, 0.5, 1)}>
          <rect x={fx - (breite(`u = ${de(u)} ${e}`, 17) + 24) / 2} y={136} width={breite(`u = ${de(u)} ${e}`, 17) + 24} height={32} rx="12" fill="none" stroke={F.granat} strokeWidth="2" />
          <Tx x={fx} y={158} g={17} f={F.granat} w={800}>{`u = ${de(u)} ${e}`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   d_quader – Quaderformel rückwärts: eine Schicht hat a · b Würfel; Schichten stapeln, bis V erreicht ist → c = V : (a · b)
   p: { a: 8, b: 6, V: 480 }   (Schrägbild: Breite a, Tiefe b, Höhe c)
   ============================================================ */
const d_quader = {
  h: 214,
  label: (p) => `Quader mit V = ${p.V} cm³, a = ${p.a} cm, b = ${p.b} cm: Höhe c = ${p.V / (p.a * p.b)} cm`,
  ablauf: (p) => {
    const G = p.a * p.b, c = p.V / G;
    return [
      { k: "sehen", ms: 1500, text: `Ein Quader: ${p.V} cm³, Grundfläche ${p.a} cm mal ${p.b} cm. Wie hoch ist er?` },
      { k: "schicht", ms: 2000, text: `Eine Schicht aus Zentimeterwürfeln: ${p.a} · ${p.b} = ${G} Würfel.` },
      { k: "stapeln", ms: 3200, text: `Schicht auf Schicht, bis ${p.V} cm³ erreicht sind: ${c} Schichten.` },
      { k: "fertig", ms: 1500, text: `Also c = ${p.V} : ${G} = ${c} cm. Probe: ${p.a} · ${p.b} · ${c} = ${p.V} ✓` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const { a, b, V } = p, G = a * b, c = V / G;
    const us = Z("sehen"), ul = Z("schicht"), ust = z("stapeln"), uf = Z("fertig");
    const u = Math.min(9, 92 / c, 80 / a), tx = 0.42 * u * 0.87, ty = -0.42 * u * 0.5;   // Schrägbild: Tiefe nach hinten oben
    const ox = 34, oy = 190, W = a * u, dX = b * tx, dY = b * ty;
    const sichtbar = ul >= 1 ? 1 + Math.floor(ust * (c - 1) + 1e-9) : ul > 0 ? 1 : 0;   // Anzahl Schichten
    const fall = ul >= 1 ? (ust * (c - 1)) % 1 : 1;
    const Schicht = ({ L, gold, oben, dy = 0, o = 1 }) => {
      const yb = oy - L * u + dy, yt = yb - u;
      const fl = gold ? F.goldHell : F.blauHell, st = gold ? F.goldDunkel : F.blau;
      return (
        <g opacity={o}>
          <rect x={ox} y={yt} width={W} height={u} fill={fl} stroke={st} strokeWidth="1" />
          <path d={`M${ox + W} ${yb} L${ox + W + dX} ${yb + dY} L${ox + W + dX} ${yt + dY} L${ox + W} ${yt} Z`} fill={fl} stroke={st} strokeWidth="1" />
          <path d={`M${ox} ${yt} L${ox + W} ${yt} L${ox + W + dX} ${yt + dY} L${ox + dX} ${yt + dY} Z`} fill={fl} stroke={st} strokeWidth="1" />
          {Array.from({ length: a - 1 }, (_, i) => <line key={"v" + i} x1={ox + (i + 1) * u} x2={ox + (i + 1) * u} y1={yt} y2={yb} stroke={st} strokeWidth="0.6" opacity="0.7" />)}
          {oben && Array.from({ length: a - 1 }, (_, i) => <line key={"t" + i} x1={ox + (i + 1) * u} y1={yt} x2={ox + (i + 1) * u + dX} y2={yt + dY} stroke={st} strokeWidth="0.6" opacity="0.7" />)}
          {oben && Array.from({ length: b - 1 }, (_, j) => <line key={"d" + j} x1={ox + (j + 1) * tx} y1={yt + (j + 1) * ty} x2={ox + W + (j + 1) * tx} y2={yt + (j + 1) * ty} stroke={st} strokeWidth="0.6" opacity="0.7" />)}
        </g>
      );
    };
    const hc = c * u, xr = ox + W + dX + 10;
    const zeilen = [
      { t: "V = a · b · c", o: us, f: F.tinte },
      { t: `${V} = ${a} · ${b} · c`, o: teil(us, 0.4, 1), f: F.tinte },
      { t: `${V} = ${G} · c`, o: ul, f: F.tinte },
      { t: `c = ${V} : ${G}`, o: teil(ust, 0.85, 1), f: F.tinte },
    ];
    return (
      <>
        {/* Umriss des ganzen Quaders (gestrichelt) */}
        <g opacity={us * (1 - 0.6 * uf)}>
          <path d={`M${ox} ${oy} H${ox + W} L${ox + W + dX} ${oy + dY} V${oy + dY - hc} L${ox + dX} ${oy + dY - hc} L${ox} ${oy - hc} Z M${ox} ${oy - hc} H${ox + W} L${ox + W + dX} ${oy - hc + dY} M${ox + W} ${oy - hc} V${oy}`} fill="none" stroke={F.grau} strokeWidth="1.2" strokeDasharray="4 3" />
        </g>
        <Tx x={ox + W / 2} y={oy + 16} g={11} f={F.tinte} w={800} o={us}>{`a = ${a} cm`}</Tx>
        <Tx x={ox + W + dX / 2 + 6} y={oy + dY / 2 + 14} g={11} f={F.tinte} w={800} a="start" o={us}>{`b = ${b} cm`}</Tx>
        <Tx x={xr} y={oy + dY - hc / 2 + 4} g={12} f={uf > 0 ? F.granat : F.grau} w={800} a="start" o={us}>{uf > 0.5 ? `c = ${c} cm` : "c = ?"}</Tx>
        {/* Schichten: die erste GOLD mit Würfelraster, darauf die weiteren */}
        {Array.from({ length: sichtbar }, (_, L) => {
          const neu = L === sichtbar - 1 && L > 0 && ust < 1;
          return <Schicht key={L} L={L} gold={L === 0} oben={L >= sichtbar - 2} dy={neu ? -(1 - sanft(fall)) * 16 : 0} o={L === 0 ? klemm(ul * 3) : neu ? klemm(fall * 3) : 1} />;
        })}
        {ul > 0 && <Pille x={ox + W / 2 + 4} y={oy - u - 22 - (sichtbar - 1) * u} text={sichtbar <= 1 ? `${G} Würfel` : `${sichtbar} · ${G} = ${sichtbar * G}`} g={11} f={F.goldHell} tf={F.goldDunkel} o={teil(ul, 0.4, 1) * (1 - uf)} />}
        {/* Rechnung rechts */}
        {zeilen.map((zz, i) => <Tx key={i} x={262} y={44 + i * 28} g={15} f={zz.f} w={800} o={zz.o}>{zz.t}</Tx>)}
        <Pille x={262} y={44 + 4 * 28 + 4} text={`c = ${c} cm`} g={15} f={F.granat} tf={F.weiss} o={uf} />
        <Tx x={262} y={44 + 5 * 28 + 8} g={11.5} f={F.gruen} w={800} o={uf}>{`Probe: ${a} · ${b} · ${c} = ${V} ✓`}</Tx>
      </>
    );
  },
};

/* ============================================================
   d_urliste – Urliste → Strichliste → Säulendiagramm
   p: { daten: [["zu Fuß", "F", 8], …], seed: 7 }
   ============================================================ */
const d_urliste = {
  h: 220,
  label: (p) => "Urliste wird zu Strichliste und Säulendiagramm",
  ablauf: (p) => {
    const d = p.daten, ges = summe(d.map((x) => x[2]));
    return [
      { k: "urliste", ms: 1400, text: `Die Urliste: ${ges} Antworten. ${d.map((x) => `${x[1]} = ${x[0]}`).join(", ")}.` },
      { k: "sammeln", ms: 3400, text: "Jede Antwort wird ein Strich in ihrer Spalte – jeder fünfte geht quer." },
      { k: "zaehlen", ms: 900, text: "Striche zählen: die absoluten Häufigkeiten." },
      { k: "saeulen", ms: 1500, text: "Im Säulendiagramm sieht man die Anzahlen auf einen Blick." },
      { k: "summe", ms: 1400, text: `Zusammen ${d.map((x) => x[2]).join(" + ")} = ${ges} – keine Antwort fehlt.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const d = p.daten, nk = d.length, ges = summe(d.map((x) => x[2])), max = Math.max(...d.map((x) => x[2]));
    const liste = mischen(d.flatMap((x, c) => Array.from({ length: x[2] }, () => c)), p.seed || 7);
    const rang = []; const zaehler = d.map(() => 0); liste.forEach((c, j) => { rang[j] = zaehler[c]++; });
    const proZeile = Math.ceil(ges / 2), dx = Math.min(23.5, 330 / proZeile), x0 = B / 2 - (dx * (proZeile - 1)) / 2;
    const cw = (B - 40) / nk, cx = (c) => 20 + cw * (c + 0.5);
    const strichX = (c, k) => { const bund = Math.floor(k / 5), im = k % 5, nb = Math.ceil(d[c][2] / 5), tw = (nb - 1) * 28 + 17; return { x: cx(c) - tw / 2 + bund * 28 + im * 5.5, quer: im === 4, bx: cx(c) - tw / 2 + bund * 28 }; };
    const uu = Z("urliste"), us = z("sammeln"), uz = Z("zaehlen"), usa = Z("saeulen", raus), um = Z("summe");
    const y0 = 196, hmax = 54, ys1 = 74, ys2 = 94;
    return (
      <>
        {liste.map((c, j) => {
          const zeile = Math.floor(j / proZeile), sp = j % proZeile, x = x0 + sp * dx, y = 22 + zeile * 26;
          const u = staffel(us, j, liste.length, 0.75), ou = staffel(uu, j, liste.length, 0.8);
          const st = strichX(c, rang[j]);
          const fl = sanft(teil(u, 0, 0.8));
          return (
            <g key={j}>
              <g opacity={ou * (u > 0 ? 0.3 : 1)}>
                <rect x={x - 9} y={y - 10} width={18} height={20} rx="5" fill={F.flaeche} stroke={F.linie} strokeWidth="1.2" />
                <Tx x={x} y={y + 4} g={10.5} f={F.grau} w={800}>{d[c][1]}</Tx>
              </g>
              {u > 0 && u < 1 && <g opacity={1 - teil(u, 0.7, 1)}>
                <rect x={mix(x, st.x, fl) - 9} y={mix(y, (ys1 + ys2) / 2, fl) - 10} width={18} height={20} rx="5" fill={F.goldHell} stroke={F.gold} strokeWidth="1.2" />
                <Tx x={mix(x, st.x, fl)} y={mix(y, (ys1 + ys2) / 2, fl) + 4} g={10.5} f={F.goldDunkel} w={800}>{d[c][1]}</Tx>
              </g>}
            </g>
          );
        })}
        {d.map(([name, kurz, w], c) => {
          const striche = [];
          liste.forEach((cc, j) => {
            if (cc !== c) return;
            const u = teil(staffel(us, j, liste.length, 0.75), 0.75, 1);
            if (u <= 0) return;
            const st = strichX(c, rang[j]);
            if (!st.quer) striche.push(<line key={j} x1={st.x} y1={ys1} x2={st.x} y2={mix(ys1, ys2, u)} stroke={F.tinte} strokeWidth="2" strokeLinecap="round" />);
            else striche.push(<line key={j} x1={st.bx - 3} y1={ys2 - 4} x2={mix(st.bx - 3, st.bx + 20, u)} y2={mix(ys2 - 4, ys1 + 4, u)} stroke={F.granat} strokeWidth="2.2" strokeLinecap="round" />);
          });
          const h = (w / max) * hmax * usa, top = y0 - (w / max) * hmax;
          return (
            <g key={name}>
              <g opacity={1 - usa * 0.7}>{striche}</g>
              <rect x={cx(c) - cw * 0.28} y={y0 - h} width={cw * 0.56} height={h} rx="4" fill={w === max ? F.granat : F.gold} opacity={usa > 0 ? 1 : 0} />
              <Tx x={cx(c)} y={mix(116, top - 7, usa)} g={15} f={F.granat} w={800} o={uz}>{w}</Tx>
              <Tx x={cx(c)} y={y0 + 16} g={10.5} f={F.grau} w={700}>{name}</Tx>
            </g>
          );
        })}
        <Strich x1={14} y1={y0} x2={B - 14} y2={y0} f={F.tinte} b={1.5} u={usa > 0 ? 1 : 0} />
        <Pille x={B - 14 - (breite(`zusammen ${ges}`, 11.5) + 16)} y={112} a="start" text={`zusammen ${ges}`} o={um} f={F.granatHell} tf={F.granat} />
      </>
    );
  },
};

/* ============================================================
   d_achse – Täuschende Achse: Achsenbeginn rückt von 0 hoch, kleine Unterschiede wirken riesig
   p: { a: ["Rad", 7], b: ["Bus", 9], ab: 6, max: 10 }
   ============================================================ */
const d_achse = {
  h: 216,
  label: (p) => "Diagramm mit abgeschnittener Achse",
  ablauf: (p) => {
    const rEnd = (p.b[1] - p.ab) / (p.a[1] - p.ab);
    return [
      { k: "ehrlich", ms: 1600, text: `Achse ab 0: ${p.b[0]} ist nur etwas höher als ${p.a[0]}.` },
      { k: "schnitt", ms: 2200, text: `Jetzt beginnt die Achse erst bei ${p.ab} …` },
      { k: "wirkung", ms: 1600, text: `… und die ${p.b[0]}-Säule ist plötzlich ${de(rEnd)}-mal so hoch – bei ${p.b[1]} gegen ${p.a[1]}!` },
      { k: "merke", ms: 1300, text: "Darum immer zuerst prüfen: Wo beginnt die Achse?" },
    ];
  },
  bild: ({ Z, p }) => {
    const ue = Z("ehrlich", raus), us = Z("schnitt"), uw = Z("wirkung"), umk = Z("merke");
    const m = mix(0, p.ab, us), max = p.max, y0 = 168, H = 128, xa = 100;
    const Y = (v) => y0 - ((v - m) / (max - m)) * H;
    const balken = [[p.a, 160], [p.b, 250]];
    const ratio = (p.b[1] - m) / (p.a[1] - m);
    return (
      <>
        <line x1={xa} y1={y0} x2={xa} y2={y0 - H - 12} stroke={F.tinte} strokeWidth="1.5" />
        <Spitze x={xa} y={y0 - H - 14} winkel={-90} f={F.tinte} g={6.5} />
        {Array.from({ length: max + 1 }, (_, v) => {
          if (v < m - 0.01) return null;
          const o = v % 2 === 0 ? 1 : teil(us, 0.6, 1);
          const nahUnten = v > m + 0.01 && Y(v) > y0 - 9 ? 0 : 1;
          return (
            <g key={v} opacity={o * nahUnten}>
              <line x1={xa - 4} x2={xa + 4} y1={Y(v)} y2={Y(v)} stroke={F.tinte} strokeWidth="1.2" />
              <line x1={xa + 4} x2={320} y1={Y(v)} y2={Y(v)} stroke={F.linie} strokeWidth="1" />
              <Tx x={xa - 9} y={Y(v) + 4} g={11} f={us > 0.5 && v === p.ab ? F.granat : F.grau} w={800} a="end">{v}</Tx>
            </g>
          );
        })}
        {balken.map(([[name, v], x]) => {
          const top = mix(y0, Y(v), ue);
          return (
            <g key={name}>
              <rect x={x - 28} y={top} width={56} height={y0 - top} rx="4" fill={name === p.b[0] ? F.granat : F.gold} />
              <Tx x={x} y={top - 7} g={13} f={F.tinte} w={800} o={ue}>{v}</Tx>
              <Tx x={x} y={y0 + 18} g={11} f={F.grau} w={700}>{name}</Tx>
            </g>
          );
        })}
        <line x1={xa - 6} y1={y0} x2={320} y2={y0} stroke={F.tinte} strokeWidth="1.5" />
        {us > 0 && <path d={`M${xa - 7} ${y0 - 4} l4 -4 l6 6 l4 -4`} fill="none" stroke={F.granat} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={teil(us, 0.3, 0.8)} transform={`translate(0 ${-3})`} />}
        <Pille x={330 - (breite(`${p.b[0]} wirkt ${de(Math.round(ratio * 10) / 10)}-mal so hoch`, 11.5) + 16)} y={24} a="start" text={`${p.b[0]} wirkt ${de(Math.round(ratio * 10) / 10)}-mal so hoch`} f={us > 0.5 ? F.granat : F.goldHell} tf={us > 0.5 ? F.weiss : F.goldDunkel} o={ue} />
        <Pille x={205} y={207} text="Achse prüfen!" f={F.granatHell} tf={F.granat} o={umk} g={11} />
        {uw > 0 && uw < 1 && <Puls x={250} y={Y(p.b[1])} u={uw} r={20} f={F.granat} />}
      </>
    );
  },
};

/* ============================================================
   d_kreis – Kreisdiagramm: 1 Person = 360° : Gesamt; Sektoren drehen sich auf
   p: { gesamt: 40, teile: [["Fußball", 16], …] }
   ============================================================ */
const KREIS_F = [[F.granat, F.weiss], [F.gold, F.granatTief], [F.blau, F.weiss], [F.rosa, F.granatTief]];
const sektor = (cx, cy, r, a0, a1) => {
  const p = (a) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  if (a1 - a0 >= 359.99) return `M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
  return `M${cx} ${cy} L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
};
const d_kreis = {
  h: 212,
  label: (p) => `Kreisdiagramm: ${p.teile.map(([n, w]) => `${n} ${w}`).join(", ")} von ${p.gesamt}`,
  ablauf: (p) => {
    const gr = 360 / p.gesamt;
    return [
      { k: "grad", ms: 1700, text: `${p.gesamt} Schüler teilen sich 360°. Einer bekommt 360° : ${p.gesamt} = ${de(gr)}°.` },
      ...p.teile.map(([name, w], i) => ({ k: `s${i}`, ms: 1200, text: `${name}: ${w} · ${de(gr)}° = ${de(w * gr)}°` })),
      { k: "summe", ms: 1300, text: `Zusammen ${p.teile.map(([, w]) => de(w * gr)).join("° + ")}° = 360° – der Kreis ist genau voll.` },
    ];
  },
  bild: ({ Z, p }) => {
    const gr = 360 / p.gesamt, cx = 98, cy = 112, r = 80;
    const ug = Z("grad"), usu = Z("summe");
    let a0 = 0;
    const sek = p.teile.map(([name, w], i) => { const s = { name, w, a0, a: w * gr, i }; a0 += w * gr; return s; });
    const tx = 196;
    return (
      <>
        <circle cx={cx} cy={cy} r={r} fill={F.flaeche} stroke={F.linie} strokeWidth="1.4" opacity={ug} />
        {sek.map((s) => {
          const u = Z(`s${s.i}`);
          if (u <= 0) return null;
          const [fl, tf] = KREIS_F[s.i % 4], m = s.a0 + (s.a * u) / 2, rr = s.a < 50 ? r * 0.72 : r * 0.6;
          return (
            <g key={s.i}>
              <path d={sektor(cx, cy, r, s.a0, s.a0 + s.a * u)} fill={fl} stroke={F.weiss} strokeWidth="2" strokeLinejoin="round" />
              <Tx x={cx + rr * Math.sin((m * Math.PI) / 180)} y={cy - rr * Math.cos((m * Math.PI) / 180) + 4} g={11.5} f={tf} w={800} o={teil(u, 0.6, 1)}>{`${de(s.a)}°`}</Tx>
            </g>
          );
        })}
        <line x1={cx} y1={cy} x2={cx} y2={cy - r} stroke={F.tinte} strokeWidth="1.6" opacity={ug} />
        <circle cx={cx} cy={cy} r="3" fill={F.tinte} opacity={ug} />
        <Pille x={350 - (breite(`1 Schüler: 360° : ${p.gesamt} = ${de(gr)}°`, 11.5) + 16)} y={24} a="start" text={`1 Schüler: 360° : ${p.gesamt} = ${de(gr)}°`} o={ug} />
        {sek.map((s) => {
          const u = Z(`s${s.i}`), y = 60 + 36 * s.i;
          return (
            <g key={"t" + s.i} opacity={teil(u, 0, 0.5)}>
              <rect x={tx} y={y - 22} width={9} height={9} rx="2" fill={KREIS_F[s.i % 4][0]} />
              <Tx x={tx + 14} y={y - 14} g={10.5} f={F.grau} w={700} a="start">{s.name}</Tx>
              <Tx x={tx} y={y + 3} g={13} f={F.tinte} w={800} a="start">{`${s.w} · ${de(gr)}° = `}<tspan fill={F.granat}>{`${de(s.a)}°`}</tspan></Tx>
            </g>
          );
        })}
        <Tx x={tx} y={60 + 36 * sek.length - 4} g={13} f={F.gruen} w={800} a="start" o={usu}>Summe: 360° ✓</Tx>
      </>
    );
  },
};

/* ============================================================
   d_median – Kärtchen sortieren sich, von außen abstreichen, Mitte leuchtet; Spannweite als Klammer
   p: { werte: [3, 7, 2, 9, 5] }
   ============================================================ */
const d_median = {
  h: 172,
  label: (p) => `Median und Spannweite von ${p.werte.map((v) => de(v)).join(", ")}`,
  ablauf: (p) => {
    const s = [...p.werte].sort((a, b) => a - b), n = s.length, gerade = n % 2 === 0;
    const med = gerade ? (s[n / 2 - 1] + s[n / 2]) / 2 : s[(n - 1) / 2];
    const paare = gerade ? n / 2 - 1 : (n - 1) / 2;
    return [
      { k: "zeigen", ms: 1000, text: `${n} Werte, so wie sie erhoben wurden – die Mitte sieht man so nicht.` },
      { k: "sortieren", ms: 1800, text: "Erst sortieren: vom kleinsten zum größten Wert." },
      { k: "abstreichen", ms: 450 + paare * 380, text: "Dann von beiden Enden gleichzeitig abstreichen …" },
      { k: "median", ms: 1600, text: gerade ? `Zwei Werte bleiben übrig: (${de(s[n / 2 - 1])} + ${de(s[n / 2])}) : 2 = ${de(med)}. Das ist der Median.` : `… übrig bleibt der mittlere Wert: Median ${de(med)}.` },
      { k: "spann", ms: 1600, text: `Spannweite: größter minus kleinster Wert, ${de(s[n - 1])} − ${de(s[0])} = ${de(s[n - 1] - s[0])}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const w = p.werte, n = w.length;
    const ord = w.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const platz = []; ord.forEach(([, i], k) => { platz[i] = k; });
    const s = ord.map(([v]) => v), gerade = n % 2 === 0, paare = gerade ? n / 2 - 1 : (n - 1) / 2;
    const med = gerade ? (s[n / 2 - 1] + s[n / 2]) / 2 : s[(n - 1) / 2];
    const cw = n > 6 ? 27 : 40, sp = n > 6 ? 32 : 54, X = (k) => B / 2 + (k - (n - 1) / 2) * sp, y = 40, ch = 38;
    const uz = Z("zeigen"), us = Z("sortieren"), ua = z("abstreichen"), um = Z("median"), usp = Z("spann");
    const mitte = (k) => (gerade ? k === n / 2 - 1 || k === n / 2 : k === (n - 1) / 2);
    const rand = (k) => k === 0 || k === n - 1;
    const medT = gerade ? `Median (${de(s[n / 2 - 1])} + ${de(s[n / 2])}) : 2 = ${de(med)}` : `Median ${de(med)}`;
    return (
      <>
        {w.map((v, i) => {
          const k = platz[i], x = mix(X(i), X(k), us), dy = X(k) > X(i) ? Math.sin(Math.PI * us) * Math.min(42, 14 + Math.abs(X(k) - X(i)) * 0.15) : 0;
          const pj = Math.min(k, n - 1 - k), weg = pj < paare ? staffel(ua, pj, paare, 0.1) : 0;
          const hervor = mitte(k) && um > 0, blau = rand(k) && usp > 0;
          const o = 1 - weg * 0.7 + (blau ? 0.7 * usp : 0);
          return (
            <g key={i} opacity={uz * Math.min(1, o)}>
              <Kasten x={x - cw / 2} y={y + dy} w={cw} h={ch} text={de(v)} g={n > 6 ? 15 : 18} f={hervor ? F.gold : blau ? F.blauHell : F.weiss} rand={hervor ? F.goldDunkel : blau ? F.blau : F.linie} tf={hervor ? F.granatTief : blau ? F.blau : F.tinte} r={7} />
              {weg > 0 && <line x1={x - cw / 2 + 4} y1={y + ch - 6} x2={mix(x - cw / 2 + 4, x + cw / 2 - 4, weg)} y2={y + 6} stroke={F.granat} strokeWidth="2" strokeLinecap="round" opacity={1 - (blau ? usp : 0)} />}
            </g>
          );
        })}
        <Tx x={B / 2} y={y - 12} g={10.5} f={F.grau} w={700} o={teil(us, 0.85, 1)}>sortiert: klein → groß</Tx>
        {um > 0 && <Puls x={B / 2} y={y + ch / 2} u={um} r={gerade ? 26 : 22} f={F.gold} />}
        <g opacity={um}>
          <path d={`M${B / 2} ${y + ch + 4} v10`} stroke={F.goldDunkel} strokeWidth="1.8" />
          <Pille x={B / 2} y={y + ch + 30} text={medT} g={12} f={F.granat} tf={F.weiss} />
        </g>
        <g opacity={usp}>
          <path d={`M${X(0)} ${y + ch + 50} v8 h${(X(n - 1) - X(0)) * usp} v-8`} fill="none" stroke={F.blau} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Tx x={B / 2} y={y + ch + 78} g={12.5} f={F.blau} w={800}>{`Spannweite ${de(s[n - 1])} − ${de(s[0])} = ${de(s[n - 1] - s[0])}`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   d_klassen – relative Häufigkeit: zwei verschieden große Klassen auf gleiche Länge strecken
   p: { a: ["6a", 28, 9], b: ["6b", 32, 10], was: "Bus" }
   ============================================================ */
const d_klassen = {
  h: 200,
  label: (p) => `Relative Häufigkeiten ${p.a[2]} von ${p.a[1]} und ${p.b[2]} von ${p.b[1]} vergleichen`,
  ablauf: (p) => [
    { k: "aufbau", ms: 1700, text: `${p.a[0]}: ${p.a[2]} von ${p.a[1]} fahren ${p.was}. ${p.b[0]}: ${p.b[2]} von ${p.b[1]}.` },
    { k: "frage", ms: 1300, text: `${p.b[2]} ist mehr als ${p.a[2]} – aber die ${p.b[0]} ist auch größer!` },
    { k: "strecken", ms: 1800, text: "Beide Klassen auf dieselbe Länge strecken: jede Klasse ist ein Ganzes." },
    { k: "anteile", ms: 1900, text: `Anteile: ${p.a[2]} : ${p.a[1]} ≈ ${de(p.a[2] / p.a[1], 2)} und ${p.b[2]} : ${p.b[1]} ≈ ${de(p.b[2] / p.b[1], 2)} – die ${p.a[2] / p.a[1] >= p.b[2] / p.b[1] ? p.a[0] : p.b[0]} liegt vorn.` },
  ],
  bild: ({ Z, z, p }) => {
    const ua = z("aufbau"), uf = Z("frage"), us = Z("strecken"), uan = Z("anteile");
    const x0 = 52, zelleAbs = 9, L = 260;
    const reihen = [[p.a, 46], [p.b, 116]];
    const prozent = (v) => `${de(Math.round(v * 100))} %`;
    return (
      <>
        {reihen.map(([[name, n, k], y], r) => {
          const cw = mix(zelleAbs, L / n, us);
          return (
            <g key={name}>
              <Tx x={14} y={y + 18} g={14} f={F.tinte} w={800} a="start">{name}</Tx>
              {Array.from({ length: n }, (_, i) => {
                const o = staffel(ua, i + r * 4, n + 4, 0.85);
                return o > 0 && <rect key={i} x={x0 + i * cw + 0.8} y={y} width={Math.max(0.5, cw - 1.6)} height={26} rx={Math.min(2.5, cw / 3)} fill={i < k ? F.granat : F.flaeche} stroke={i < k ? "none" : F.linie} strokeWidth="1" opacity={o} />;
              })}
              <Tx x={x0} y={y + 46} g={12} f={F.grau} w={700} a="start" o={teil(ua, 0.5, 1) * (1 - teil(uan, 0, 0.35))}>{`${k} von ${n} fahren ${p.was}`}</Tx>
              <Tx x={x0} y={y + 46} g={12.5} f={F.granat} w={800} a="start" o={teil(uan, 0.4, 0.8)}>{`${k} : ${n} ≈ ${de(k / n, 2)} ≈ ${prozent(k / n)}`}</Tx>
            </g>
          );
        })}
        <Pille x={330 - (breite(`${p.b[2]} > ${p.a[2]} – mehr?`, 11.5) + 16)} y={98} a="start" text={`${p.b[2]} > ${p.a[2]} – mehr?`} f={F.granatHell} tf={F.granat} o={uf * (1 - us)} />
        <g opacity={teil(us, 0.6, 1)}>
          {[0, 0.5, 1].map((v) => (
            <g key={v}>
              <line x1={x0 + v * L} x2={x0 + v * L} y1={176} y2={182} stroke={F.grau} strokeWidth="1.2" />
              <Tx x={x0 + v * L} y={195} g={10} f={F.grau} w={700}>{prozent(v)}</Tx>
            </g>
          ))}
          <line x1={x0} x2={x0 + L} y1={179} y2={179} stroke={F.grau} strokeWidth="1.2" />
        </g>
        {uan > 0 && reihen.map(([, y]) => <line key={"g" + y} x1={x0 + (L * p.a[2]) / p.a[1]} x2={x0 + (L * p.a[2]) / p.a[1]} y1={y - 6} y2={y + 32} stroke={F.gold} strokeWidth="2.2" strokeDasharray="4 3" opacity={uan} />)}
      </>
    );
  },
};

/* ============================================================
   d_zwecke – 50 Würfe einer Reißzwecke, relative Häufigkeit als Kurve, Bruch → Dezimal → Prozent
   p: { n: 50, k: 32, seed: 11, ja: "Kopf", nein: "Seite" }
   ============================================================ */
const d_zwecke = {
  h: 206,
  label: (p) => `Relative Häufigkeit: ${p.k} von ${p.n} Würfen`,
  ablauf: (p) => [
    { k: "w1", ms: 2400, text: `${p.n} Würfe mit einer Reißzwecke. Gefüllter Punkt: Sie landet auf dem ${p.ja}.` },
    { k: "w2", ms: 2600, text: `Der Anteil der ${p.ja}-Würfe springt erst hin und her und wird dann ruhiger.` },
    { k: "bruch", ms: 1300, text: `${p.k} von ${p.n} Würfen: als Bruch gekürzt.` },
    { k: "dezimal", ms: 1200, text: `Als Dezimalzahl: ${p.k} : ${p.n} = ${de(p.k / p.n)}.` },
    { k: "prozent", ms: 1500, text: `${de(p.k / p.n)} = ${de((100 * p.k) / p.n)} %. Das ist die relative Häufigkeit für ${p.ja}.` },
  ],
  bild: ({ Z, z, p }) => {
    const N = p.n, K = p.k;
    const folge = mischen(Array.from({ length: N }, (_, i) => (i < K ? 1 : 0)), p.seed || 11);
    const w = Math.round(mix(0, 12, z("w1")) + mix(0, N - 12, Math.pow(z("w2"), 1.3)));
    let k = 0; const pkt = [];
    for (let i = 0; i < w; i++) { k += folge[i]; pkt.push([i + 1, k / (i + 1)]); }
    const proZ = Math.ceil(N / 2), dx = Math.min(13, 324 / proZ);
    const X = (v) => 46 + (v / N) * 196, Y = (v) => 170 - v * 108;
    const ub = Z("bruch"), ud = Z("dezimal"), up = Z("prozent");
    const gk = (a, b) => (b ? gk(b, a % b) : a), t = gk(K, N);
    const rx = 302;
    return (
      <>
        {folge.map((f, i) => {
          const zeile = Math.floor(i / proZ), sp = i % proZ, x = B / 2 + (sp - (proZ - 1) / 2) * dx, y = 16 + zeile * 15;
          const sicht = i < w;
          return <circle key={i} cx={x} cy={y} r="4.6" fill={sicht && f ? F.granat : F.weiss} stroke={sicht ? (f ? F.granat : F.grau) : F.linie} strokeWidth="1.4" />;
        })}
        <Achsen X={X} Y={Y} xv={[0, N]} yv={[0, 1]} xt={[0, 10, 20, 30, 40, 50].filter((v) => v <= N)} yt={[0, 0.5, 1]} />
        <Tx x={X(N) + 12} y={Y(0) - 6} g={10} f={F.tinte} w={800} a="end">Würfe</Tx>
        {pkt.length > 1 && <polyline points={pkt.map(([a, b]) => `${X(a).toFixed(1)},${Y(b).toFixed(1)}`).join(" ")} fill="none" stroke={F.granat} strokeWidth="2" strokeLinejoin="round" />}
        {pkt.length > 0 && <circle cx={X(pkt[pkt.length - 1][0])} cy={Y(pkt[pkt.length - 1][1])} r="4" fill={F.granat} />}
        <line x1={X(0)} x2={X(N)} y1={Y(K / N)} y2={Y(K / N)} stroke={F.gold} strokeWidth="1.8" strokeDasharray="5 4" opacity={ub} />
        {/* rechte Spalte: Bruch live */}
        <Tx x={rx} y={70} g={10.5} f={F.grau} w={700}>{`${p.ja} : alle`}</Tx>
        <SvgBruch x={ub > 0 ? rx - 26 * ub : rx} y={98} z={k} n={Math.max(w, 0)} g={16} f={F.granat} o={w > 0 ? 1 : 0} />
        <g opacity={ub}>
          <Tx x={rx + 2} y={105} g={16} f={F.tinte} w={800}>=</Tx>
          <SvgBruch x={rx + 28} y={98} z={K / t} n={N / t} g={16} f={F.granat} />
        </g>
        <Tx x={rx} y={152} g={16} f={F.tinte} w={800} o={ud}>{`= ${de(K / N)}`}</Tx>
        <g opacity={up}>
          <rect x={rx - 42} y={164} width={84} height={30} rx="12" fill="none" stroke={F.granat} strokeWidth="2" />
          <Tx x={rx} y={185} g={16} f={F.granat} w={800}>{`= ${de((100 * K) / N)} %`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   d_urne – Wahrscheinlichkeit als „Bruch aus Kugeln“: günstige über dem Strich, alle darunter
   p: { kugeln: "brbgrbgbrb" } (r = rot/granat, b = blau, g = grün)
   ============================================================ */
const KUGEL_F = { r: F.granat, b: F.blau, g: F.gruen };
const d_urne = {
  h: 214,
  label: () => "Urne mit 3 roten, 5 blauen und 2 grünen Kugeln",
  ablauf: () => [
    { k: "urne", ms: 1200, text: "In der Urne: 3 rote, 5 blaue und 2 grüne Kugeln." },
    { k: "alle", ms: 2200, text: "Jede der 10 Kugeln kann kommen – alle möglichen unter den Strich." },
    { k: "guenstig", ms: 2000, text: "Günstig für „blau“ sind die 5 blauen – sie kommen über den Strich." },
    { k: "zahl1", ms: 1500, text: "P(blau) = 5 von 10 = ein Halb." },
  ],
  bild: ({ Z }) => {
    const ks = "brbgrbgbrb".split("");
    const pos = [[44, 176], [68, 176], [92, 176], [116, 176], [44, 152], [68, 152], [92, 152], [116, 152], [68, 128], [92, 128]];
    const uu = Z("urne"), ual = z2(Z("alle")), ug = Z("guenstig"), u1 = Z("zahl1");
    const nx = (i, anz) => 258 + (i - (anz - 1) / 2) * 17;
    const blau = ks.map((c, i) => (c === "b" ? i : -1)).filter((i) => i >= 0);
    const Kugel = ({ x, y, c, r = 9.5, o = 1 }) => o > 0 && <g opacity={o}><circle cx={x} cy={y} r={r} fill={KUGEL_F[c]} /><circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.28} fill={F.weiss} opacity="0.45" /></g>;
    const fliege = (i, u, ziel) => ({ x: mix(pos[i][0], ziel[0], sanft(u)), y: mix(pos[i][1], ziel[1], sanft(u)) - Math.sin(Math.PI * u) * 30 });
    const formel = (lab, a, b, c, d, o) => {
      const gs = 13, wl = breite(lab, gs), tot = wl + 8 + 26 + 18 + 22;
      const x0 = 254 - tot / 2;
      return (
        <g opacity={o}>
          <Tx x={x0} y={180} g={gs} f={F.tinte} w={800} a="start">{lab}</Tx>
          <SvgBruch x={x0 + wl + 8 + 11} y={174} z={a} n={b} g={14} f={F.granat} />
          <Tx x={x0 + wl + 8 + 26 + 4} y={180} g={gs} f={F.tinte} w={800}>=</Tx>
          <SvgBruch x={x0 + wl + 8 + 26 + 18 + 8} y={174} z={c} n={d} g={14} f={F.granat} />
        </g>
      );
    };
    return (
      <>
        {/* Urne */}
        <g opacity={uu}>
          <path d="M50 92 L50 104 C24 110 22 130 22 150 L22 182 C22 194 30 200 42 200 L118 200 C130 200 138 194 138 182 L138 150 C138 130 136 110 110 104 L110 92" fill={F.flaeche} stroke={F.grau} strokeWidth="1.8" strokeLinejoin="round" />
          <rect x={44} y={86} width={72} height={8} rx="4" fill={F.grau} />
          {ks.map((c, i) => <Kugel key={i} x={pos[i][0]} y={pos[i][1]} c={c} o={staffel(uu, i, 10, 0.7)} />)}
        </g>
        {/* Bruchstrich aus Kugeln */}
        <line x1={170} x2={346} y1={92} y2={92} stroke={F.tinte} strokeWidth="2.2" strokeLinecap="round" opacity={teil(ual, 0, 0.3)} />
        {ks.map((c, i) => {
          const u = staffel(ual, i, 10, 0.6);
          if (u <= 0) return null;
          const p = fliege(i, u, [nx(i, 10), 114]);
          return <Kugel key={"n" + i} x={p.x} y={p.y} c={c} r={7.5} />;
        })}
        {/* der Schritt: die günstigen Kugeln steigen über den Strich (GOLD-Rahmen) */}
        <rect x={nx(0, blau.length) - 13} y={57} width={nx(blau.length - 1, blau.length) - nx(0, blau.length) + 26} height={26} rx="13" fill={F.goldHell} stroke={F.gold} strokeWidth="1.6" opacity={teil(ug, 0.6, 1)} />
        {blau.map((i, j) => {
          const u = staffel(ug, j, blau.length, 0.5);
          if (u <= 0) return null;
          const p = fliege(i, u, [nx(j, blau.length), 70]);
          return <Kugel key={"b" + i} x={p.x} y={p.y} c="b" r={7.5} />;
        })}
        <Tx x={350} y={50} g={10} f={F.goldDunkel} w={800} a="end" o={ug}>günstig</Tx>
        <Tx x={350} y={138} g={10} f={F.grau} w={700} a="end" o={teil(ual, 0.5, 1)}>alle möglichen</Tx>
        {formel("P(blau) =", 5, 10, 1, 2, u1)}
      </>
    );
  },
};
const z2 = (u) => u;

/* ============================================================
   d_gesetz – Gesetz der großen Zahlen: Anteil der Sechsen nähert sich einem Sechstel
   p: { n: 600, seed: … }
   ============================================================ */
const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
const wuerfelFolge = (n, seed) => { const r = lcg(seed); return Array.from({ length: n }, () => 1 + Math.floor(r() * 6)); };
const d_gesetz = {
  h: 214,
  label: (p) => `${p.n} Würfe: Anteil der Sechsen nähert sich einem Sechstel`,
  ablauf: (p) => {
    const f = wuerfelFolge(p.n, p.seed), k = f.filter((x) => x === 6).length;
    return [
      { k: "start", ms: 1200, text: "Ein fairer Würfel: Die Sechs hat die Wahrscheinlichkeit ein Sechstel." },
      { k: "w1", ms: 2600, text: "Bei wenigen Würfen springt der Anteil der Sechsen stark hin und her." },
      { k: "w2", ms: 3600, text: "Je mehr Würfe, desto ruhiger wird die Kurve …" },
      { k: "ende", ms: 1600, text: `… und nähert sich einem Sechstel: ${k} Sechsen bei ${p.n} Würfen.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const N = p.n, f = wuerfelFolge(N, p.seed);
    const w = Math.round(mix(0, 40, z("w1")) + mix(0, N - 40, Math.pow(z("w2"), 1.6)));
    const X = (v) => 48 + (v / N) * 288, Y = (v) => 186 - v * 240;
    const pts = []; let k = 0;
    for (let i = 0; i < w; i++) { if (f[i] === 6) k++; if (i < 60 || i % 3 === 2 || i === w - 1) pts.push([i + 1, k / (i + 1)]); }
    const ust = Z("start"), ue = Z("ende");
    const akt = w > 0 ? f[w - 1] : 6;
    return (
      <>
        <g opacity={ust}>
          <rect x={18} y={12} width={38} height={38} rx="8" fill={F.weiss} stroke={akt === 6 && w > 0 ? F.granat : F.tinte} strokeWidth="2" />
          {PIPS[akt].map(([a, b], i) => <circle key={i} cx={37 + a * 10} cy={31 + b * 10} r="3.4" fill={akt === 6 && w > 0 ? F.granat : F.tinte} />)}
          <Tx x={68} y={27} g={12} f={F.tinte} w={700} a="start">{`Würfe: ${de(w)}`}</Tx>
          <Tx x={68} y={45} g={12} f={F.granat} w={800} a="start">{`Sechsen: ${de(k)}`}</Tx>
          <Tx x={342} y={38} g={14} f={F.tinte} w={800} a="end">{w > 0 ? `${de(k)} : ${de(w)} ≈ ${de(k / w, 2)}` : "–"}</Tx>
        </g>
        <Achsen X={X} Y={Y} xv={[0, N]} yv={[0, 0.5]} xt={[0, N / 3, (2 * N) / 3, N]} yt={[0, 0.5]} u={ust} />
        <line x1={X(0)} x2={X(N)} y1={Y(1 / 6)} y2={Y(1 / 6)} stroke={F.gold} strokeWidth="2" strokeDasharray="6 4" opacity={ust} />
        <SvgBruch x={30} y={Y(1 / 6) - 3} z={1} n={6} g={12} f={F.goldDunkel} o={ust} />
        {pts.length > 1 && <polyline points={pts.map(([a, b]) => `${X(a).toFixed(1)},${Y(b).toFixed(1)}`).join(" ")} fill="none" stroke={F.granat} strokeWidth="1.9" strokeLinejoin="round" />}
        {pts.length > 0 && <circle cx={X(pts[pts.length - 1][0])} cy={Y(pts[pts.length - 1][1])} r="4" fill={F.granat} />}
        <Pille x={X(N) - (breite("ein Sechstel ≈ 0,17", 11) + 16)} y={Y(1 / 6) - 22} a="start" text="ein Sechstel ≈ 0,17" g={11} o={ue} />
      </>
    );
  },
};

/* ============================================================
   d_wertegraph – Wertetabelle → Punkte fliegen ins Koordinatensystem → Linie, weiterdenken
   p: { xs: [0,2,4,6], ys: [0,30,60,90], weiter: [10,150], xName, yName, xmax, ymax, xt, yt, ex, ey }
   ============================================================ */
const d_wertegraph = {
  h: 244,
  label: (p) => `Tabelle und Graph: ${p.xName} → ${p.yName}`,
  ablauf: (p) => [
    { k: "tabelle", ms: 1300, text: `Die Tabelle: ${p.xName} und ${p.yName}.` },
    { k: "punkte", ms: 2600, text: `Jedes Wertepaar wird ein Punkt: ${p.xName} nach rechts, ${p.yName} nach oben.` },
    { k: "linie", ms: 1300, text: "Das Wasser fließt gleichmäßig – Zwischenwerte gibt es, also verbinden." },
    { k: "weiter", ms: 1800, text: `Je ${de(p.xs[1] - p.xs[0])} ${p.ex} kommen ${de(p.ys[1] - p.ys[0])} ${p.ey} dazu. Nach ${de(p.weiter[0])} ${p.ex}: ${de(p.weiter[1])} ${p.ey}.` },
  ],
  bild: ({ Z, z, p }) => {
    const xs = [...p.xs, p.weiter[0]], ys = [...p.ys, p.weiter[1]], n = xs.length;
    const xL = 14, xT = 120, cw = (348 - xT) / n, cx = (i) => xT + cw * (i + 0.5), r1 = 30, r2 = 58;
    const X = (v) => 56 + (v / p.xmax) * 270, Y = (v) => 212 - (v / p.ymax) * 112;
    const ut = Z("tabelle"), up = z("punkte"), ul = Z("linie"), uw = Z("weiter");
    return (
      <>
        <g opacity={ut}>
          <rect x={xL - 4} y={r1 - 20} width={348 - xL + 6} height={r2 - r1 + 34} rx="12" fill={F.flaeche} />
          <line x1={xL} x2={348} y1={(r1 + r2) / 2 - 4} y2={(r1 + r2) / 2 - 4} stroke={F.linie} strokeWidth="1.4" />
          <line x1={xT - 2} x2={xT - 2} y1={r1 - 16} y2={r2 + 8} stroke={F.linie} strokeWidth="1.4" />
          <Tx x={xL + 4} y={r1} g={11.5} f={F.blau} w={800} a="start">{`${p.xName} in ${p.ex}`}</Tx>
          <Tx x={xL + 4} y={r2} g={11.5} f={F.granat} w={800} a="start">{`${p.yName} in ${p.ey}`}</Tx>
        </g>
        {xs.map((x, i) => {
          const neu = i === n - 1, o = neu ? teil(uw, 0.4, 0.8) : staffel(ut, i, n - 1, 0.5);
          return (
            <g key={i} opacity={o}>
              <Tx x={cx(i)} y={r1} g={14} f={neu ? F.goldDunkel : F.tinte} w={800}>{de(x)}</Tx>
              <Tx x={cx(i)} y={r2} g={14} f={neu ? F.goldDunkel : F.tinte} w={800}>{de(ys[i])}</Tx>
            </g>
          );
        })}
        <Achsen X={X} Y={Y} xv={[0, p.xmax]} yv={[0, p.ymax]} xt={p.xt} yt={p.yt} u={ut} xName={p.ex} yName={p.ey} />
        {ul > 0 && <line x1={X(xs[0])} y1={Y(ys[0])} x2={mix(X(xs[0]), X(xs[n - 2]), ul)} y2={mix(Y(ys[0]), Y(ys[n - 2]), ul)} stroke={F.granat} strokeWidth="2.4" strokeLinecap="round" />}
        {uw > 0 && <line x1={X(xs[n - 2])} y1={Y(ys[n - 2])} x2={mix(X(xs[n - 2]), X(xs[n - 1]), teil(uw, 0, 0.5))} y2={mix(Y(ys[n - 2]), Y(ys[n - 1]), teil(uw, 0, 0.5))} stroke={F.granat} strokeWidth="2.2" strokeDasharray="5 4" strokeLinecap="round" />}
        {xs.slice(0, n - 1).map((x, i) => {
          const u = sanft(staffel(up, i, n - 1, 0.45));
          if (u <= 0) return null;
          const px = mix(cx(i), X(x), u), py = mix((r1 + r2) / 2 - 4, Y(ys[i]), u) - Math.sin(Math.PI * u) * 14;
          return (
            <g key={"p" + i}>
              {u >= 1 && <line x1={X(x)} x2={X(x)} y1={Y(0)} y2={Y(ys[i])} stroke={F.blau} strokeWidth="1" strokeDasharray="2 3" opacity={0.6 * (1 - ul)} />}
              <circle cx={px} cy={py} r="5" fill={F.granat} stroke={F.weiss} strokeWidth="1.5" />
            </g>
          );
        })}
        {uw > 0.45 && <circle cx={X(xs[n - 1])} cy={Y(ys[n - 1])} r="5" fill={F.gold} stroke={F.granat} strokeWidth="1.8" opacity={teil(uw, 0.45, 0.7)} />}
        <Pille x={X(xs[n - 1]) - 12 - (breite(`${de(xs[n - 1])} ${p.ex} → ${de(ys[n - 1])} ${p.ey}`, 11) + 16)} y={Y(ys[n - 1]) - 6} a="start" text={`${de(xs[n - 1])} ${p.ex} → ${de(ys[n - 1])} ${p.ey}`} g={11} o={teil(uw, 0.6, 1)} />
      </>
    );
  },
};

/* ============================================================
   d_temperatur – Graph lesen: steigt, Maximum, fällt, ablesen
   p: { punkte: [[6, 8], …], ablesen: 10 }
   ============================================================ */
function monoton(pts) {
  /* monotone kubische Interpolation (Fritsch–Carlson): keine Überschwinger */
  const n = pts.length, d = [], m = [];
  for (let i = 0; i < n - 1; i++) d.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return (x) => {
    let i = 0; while (i < n - 2 && x > pts[i + 1][0]) i++;
    const h = pts[i + 1][0] - pts[i][0], t = klemm((x - pts[i][0]) / h);
    const h00 = 2 * t ** 3 - 3 * t ** 2 + 1, h10 = t ** 3 - 2 * t ** 2 + t, h01 = -2 * t ** 3 + 3 * t ** 2, h11 = t ** 3 - t ** 2;
    return h00 * pts[i][1] + h10 * h * m[i] + h01 * pts[i + 1][1] + h11 * h * m[i + 1];
  };
}
const d_temperatur = {
  h: 214,
  label: () => "Temperaturverlauf eines Tages: steigen, Maximum, fallen",
  ablauf: (p) => {
    const mx = p.punkte.reduce((a, b) => (b[1] > a[1] ? b : a));
    const ab = p.punkte.find((q) => q[0] === p.ablesen);
    return [
      { k: "achsen", ms: 1100, text: "Temperatur an einem Sommertag: Uhrzeit nach rechts, Temperatur nach oben." },
      { k: "steigt", ms: 2400, text: "Am Vormittag steigt die Kurve – es wird wärmer." },
      { k: "max", ms: 1400, text: `Um ${mx[0]} Uhr ist es am wärmsten: ${mx[1]} °C. Das ist das Maximum.` },
      { k: "faellt", ms: 1800, text: "Danach fällt die Kurve – es wird kühler." },
      { k: "ablesen", ms: 1600, text: `Ablesen: Um ${ab[0]} Uhr waren es ${ab[1]} °C.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const P = p.punkte, f = monoton(P), x0 = P[0][0], x1 = P[P.length - 1][0];
    const mx = P.reduce((a, b) => (b[1] > a[1] ? b : a)), ab = P.find((q) => q[0] === p.ablesen);
    const X = (v) => 52 + ((v - x0) / (x1 - x0)) * 284, Y = (v) => 184 - (v / 25) * 140;
    const ua = Z("achsen"), us = z("steigt"), um = Z("max"), uf = z("faellt"), ul = Z("ablesen");
    const ende = us < 1 ? mix(x0, mx[0], sanft(us)) : mix(mx[0], x1, sanft(uf));
    const pts = []; for (let x = x0; x <= ende + 1e-9; x += 0.1) pts.push(`${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`);
    if (ende > x0) pts.push(`${X(ende).toFixed(1)},${Y(f(ende)).toFixed(1)}`);
    const steigend = ende <= mx[0];
    return (
      <>
        <Achsen X={X} Y={Y} xv={[x0, x1]} yv={[0, 25]} xt={P.map((q) => q[0]).filter((_, i) => i % 2 === 0)} yt={[0, 5, 10, 15, 20, 25]} u={ua} xName="Uhr" yName="°C" />
        {pts.length > 1 && <polyline points={pts.join(" ")} fill="none" stroke={F.granat} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />}
        {ende > x0 && ende < x1 && <circle cx={X(ende)} cy={Y(f(ende))} r="5" fill={F.gold} stroke={F.granat} strokeWidth="1.6" />}
        <Tx x={X((x0 + mx[0]) / 2) + 6} y={Y(f((x0 + mx[0]) / 2)) + 22} g={12} f={F.blau} w={800} a="start" o={teil(us, 0.4, 0.8)}>steigt ↗</Tx>
        <Tx x={X((mx[0] + x1) / 2) + 14} y={Y(f((mx[0] + x1) / 2)) - 10} g={12} f={F.granat} w={800} a="start" o={teil(uf, 0.4, 0.8)}>fällt ↘</Tx>
        <g opacity={um}>
          <circle cx={X(mx[0])} cy={Y(mx[1])} r="5.5" fill={F.gold} stroke={F.granat} strokeWidth="2" />
          <Pille x={X(mx[0])} y={Y(mx[1]) - 14} text={`Maximum ${mx[1]} °C`} g={11} f={F.granat} tf={F.weiss} />
        </g>
        {um > 0 && um < 1 && <Puls x={X(mx[0])} y={Y(mx[1])} u={um} r={16} />}
        <g opacity={ul}>
          <line x1={X(ab[0])} x2={X(ab[0])} y1={Y(0)} y2={mix(Y(0), Y(ab[1]), teil(ul, 0, 0.5))} stroke={F.blau} strokeWidth="1.6" strokeDasharray="4 3" />
          <line x1={X(ab[0])} x2={mix(X(ab[0]), X(x0), teil(ul, 0.5, 1))} y1={Y(ab[1])} y2={Y(ab[1])} stroke={F.blau} strokeWidth="1.6" strokeDasharray="4 3" />
          <circle cx={X(ab[0])} cy={Y(ab[1])} r="4" fill={F.blau} />
          <Tx x={X(x0) + 6} y={Y(ab[1]) - 6} g={11.5} f={F.blau} w={800} a="start" o={teil(ul, 0.8, 1)}>{`${ab[1]} °C`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   d_proportional – Tabelle (doppelt → doppelt), Punkte → Gerade durch den Ursprung, Faktor
   p: { k: 0.45, n: 6, ding: "Brötchen", groesse: "Preis in €" }
   ============================================================ */
const d_proportional = {
  h: 222,
  label: (p) => `Proportionale Zuordnung: y = ${de(p.k)} · x`,
  ablauf: (p) => [
    { k: "tabelle", ms: 1700, text: `Ein ${p.ding} kostet ${de(p.k, 2)} €. So wächst der Preis.` },
    { k: "doppelt", ms: 1600, text: `3 ${p.ding} kosten ${de(3 * p.k, 2)} €, 6 kosten ${de(6 * p.k, 2)} €: doppelte Menge, doppelter Preis.` },
    { k: "punkte", ms: 2000, text: "Jedes Wertepaar wird ein Punkt im Koordinatensystem." },
    { k: "gerade", ms: 1300, text: "Die Punkte liegen auf einer Geraden durch den Ursprung: 0 Stück, 0 €." },
    { k: "faktor", ms: 1700, text: `Preis : Anzahl = ${de(p.k, 2)} in jeder Zeile. Also y = ${de(p.k)} · x.` },
  ],
  bild: ({ Z, z, p }) => {
    const { k, n } = p, xc = 68, yc = 124, ry = (i) => 52 + i * 24;
    const ymax = Math.ceil(k * n);
    const X = (v) => 212 + v * 19, Y = (v) => 190 - (v / ymax) * 144;
    const ut = Z("tabelle"), ud = Z("doppelt"), up = z("punkte"), ug = Z("gerade"), uf = Z("faktor");
    const xEnde = Math.min(n + 0.5, (ymax * 1.0) / k);
    return (
      <>
        <rect x={40} y={20} width={114} height={ry(n - 1) + 14 - 20} rx="10" fill={F.flaeche} opacity={ut} />
        <line x1={(xc + yc) / 2 - 2} x2={(xc + yc) / 2 - 2} y1={24} y2={ry(n - 1) + 8} stroke={F.linie} strokeWidth="1.4" opacity={ut} />
        <Tx x={xc} y={34} g={10.5} f={F.blau} w={800} o={ut}>Anzahl</Tx>
        <Tx x={yc + 2} y={34} g={10.5} f={F.granat} w={800} o={ut}>Preis in €</Tx>
        {Array.from({ length: n }, (_, i) => (
          <g key={i} opacity={staffel(ut, i, n, 0.5)}>
            <Tx x={xc} y={ry(i) + 5} g={14} f={F.tinte} w={800}>{i + 1}</Tx>
            <Tx x={yc + 2} y={ry(i) + 5} g={14} f={F.tinte} w={800}>{de((i + 1) * k, 2)}</Tx>
          </g>
        ))}
        {[2, 5].map((i) => <rect key={"h" + i} x={42} y={ry(i) - 11} width={110} height={22} rx="7" fill="none" stroke={F.gold} strokeWidth="1.8" opacity={ud} />)}
        <Bogen x={40} y1={ry(2)} y2={ry(5)} seite={-1} u={ud} text="· 2" weite={10} />
        <Bogen x={154} y1={ry(2)} y2={ry(5)} seite={1} u={ud} text="· 2" weite={10} />
        <Achsen X={X} Y={Y} xv={[0, n + 0.6]} yv={[0, ymax]} xt={[0, 2, 4, 6].filter((v) => v <= n)} yt={Array.from({ length: ymax + 1 }, (_, v) => v)} u={teil(up, 0, 0.15)} yName="€" />
        <Tx x={X(n + 0.6) + 10} y={Y(0) + 28} g={10} f={F.tinte} w={800} a="end" o={teil(up, 0, 0.15)}>Anzahl</Tx>
        {ug > 0 && <line x1={X(0)} y1={Y(0)} x2={X(xEnde * ug)} y2={Y(k * xEnde * ug)} stroke={F.granat} strokeWidth="2.2" strokeLinecap="round" />}
        {Array.from({ length: n }, (_, i) => {
          const u = sanft(staffel(up, i, n, 0.5));
          if (u <= 0) return null;
          const px = mix((xc + yc) / 2, X(i + 1), u), py = mix(ry(i), Y((i + 1) * k), u) - Math.sin(Math.PI * u) * 16;
          return <circle key={"p" + i} cx={px} cy={py} r="4.6" fill={F.gold} stroke={F.granat} strokeWidth="1.6" />;
        })}
        <circle cx={X(0)} cy={Y(0)} r="4" fill={F.granat} opacity={ug} />
        <Pille x={X(0.5)} y={Y(ymax * 0.87)} a="start" text={`y = ${de(k)} · x`} g={12} f={F.granat} tf={F.weiss} o={uf} />
        <Tx x={97} y={ry(n - 1) + 30} g={11} f={F.granat} w={800} o={uf}>{`Preis : Anzahl = ${de(k, 2)}`}</Tx>
      </>
    );
  },
};

/* ============================================================
   d_dreisatz – drei Zeilen mit Pfeilen an beiden Seiten; Bilder links, Balken rechts
   p: { kopf: ["Hefte", "Preis"], zeilen: [{ l: 4, r: 3.2 }, …], rText: (Liste), ops: [[": 4", ": 4"], ["· 7", "· 7"]],
        bild: "heft" | "maler", texte: [4 Untertitel], eins?: "je 0,80 €" (Pille am einzelnen Bildchen) }
   ============================================================ */
function Bildchen({ art, anzahl, cx, cy, u }) {
  const proReihe = 4, d = 14, reihen = Math.ceil(anzahl / proReihe);
  return (
    <g>
      {Array.from({ length: anzahl }, (_, i) => {
        const o = staffel(u, i, anzahl, 0.5);
        if (o <= 0) return null;
        const r = Math.floor(i / proReihe), sp = i % proReihe, inR = Math.min(proReihe, anzahl - r * proReihe);
        const x = cx + (sp - (inR - 1) / 2) * d, y = cy + (r - (reihen - 1) / 2) * 18;
        return art === "maler" ? (
          <g key={i} opacity={o}><circle cx={x} cy={y - 5} r="3.2" fill={F.blau} /><path d={`M${x - 4.6} ${y + 7} Q${x - 4.6} ${y - 1} ${x} ${y - 1} Q${x + 4.6} ${y - 1} ${x + 4.6} ${y + 7} Z`} fill={F.blau} /></g>
        ) : (
          <g key={i} opacity={o}><rect x={x - 5} y={y - 7.5} width={10} height={15} rx="1.8" fill={F.blauHell} stroke={F.blau} strokeWidth="1.3" /><line x1={x - 2.5} x2={x + 2.5} y1={y - 3} y2={y - 3} stroke={F.blau} strokeWidth="1.1" /><line x1={x - 2.5} x2={x + 2.5} y1={y} y2={y} stroke={F.blau} strokeWidth="1.1" /></g>
        );
      })}
    </g>
  );
}
const d_dreisatz = {
  h: 202,
  label: (p) => `Dreisatz: ${p.zeilen.map((z) => `${z.l} → ${z.rt}`).join(", ")}`,
  ablauf: (p) => [
    { k: "z0", ms: 1300, text: p.texte[0] },
    { k: "op0", ms: 2300, text: p.texte[1] },
    { k: "op1", ms: 2300, text: p.texte[2] },
    { k: "fertig", ms: 1400, text: p.texte[3] },
  ],
  bild: ({ Z, p }) => {
    const zl = p.zeilen, ry = (i) => 70 + i * 50, cl = 150, cr = 236;
    /* je Pfeil-Abschnitt: erst laufen die Pfeile (bis 60 %), dann erscheint die neue Zeile */
    const uo = [sanft(teil(Z("op0", (u) => u), 0, 0.6)), sanft(teil(Z("op1", (u) => u), 0, 0.6))];
    const uz = [Z("z0"), sanft(teil(Z("op0", (u) => u), 0.55, 1)), sanft(teil(Z("op1", (u) => u), 0.55, 1))], uf = Z("fertig");
    return (
      <>
        <Tx x={cl} y={30} g={11} f={F.blau} w={800} o={uz[0]}>{p.kopf[0]}</Tx>
        <Tx x={cr} y={30} g={11} f={F.granat} w={800} o={uz[0]}>{p.kopf[1]}</Tx>
        <line x1={110} x2={276} y1={40} y2={40} stroke={F.linie} strokeWidth="1.4" opacity={uz[0]} />
        <line x1={(cl + cr) / 2} x2={(cl + cr) / 2} y1={44} y2={ry(2) + 16} stroke={F.linie} strokeWidth="1.4" opacity={uz[0]} />
        {zl.map((zz, i) => {
          const u = uz[i], letzte = i === 2;
          return (
            <g key={i}>
              <g opacity={u} transform={`translate(0 ${(1 - raus(u)) * 10})`}>
                {letzte && <rect x={112} y={ry(i) - 19} width={162} height={34} rx="10" fill="none" stroke={F.granat} strokeWidth="2" opacity={uf} />}
                <Tx x={cl} y={ry(i) + 5} g={16} f={F.tinte} w={800}>{de(zz.l)}</Tx>
                <Tx x={cr} y={ry(i) + 5} g={16} f={letzte ? F.granat : F.tinte} w={800}>{zz.rt}</Tx>
              </g>
              {p.bild && <Bildchen art={p.bild} anzahl={zz.l} cx={40} cy={ry(i)} u={u} />}
              {/* der Baustein: was eins kostet bzw. braucht (GOLD) */}
              {i === 1 && p.eins && <Pille x={40} y={ry(1) + 18} text={p.eins} g={10} o={teil(u, 0.5, 1)} />}
            </g>
          );
        })}
        {uo.map((u, i) => (
          <g key={"o" + i}>
            <Bogen x={112} y1={ry(i) + 2} y2={ry(i + 1) - 6} seite={-1} u={u} text={p.ops[i][0]} weite={11} f={F.blau} />
            <Bogen x={274} y1={ry(i) + 2} y2={ry(i + 1) - 6} seite={1} u={u} text={p.ops[i][1]} weite={11} f={F.granat} />
          </g>
        ))}
      </>
    );
  },
};

/* ============================================================
   d_antiprop – Rechtecke gleicher Fläche: mehr Maler → weniger Stunden; Ecken bilden eine Hyperbel
   p: { produkt: 24, schritte: [2, 3, 4, 6, 8, 12], x: "Maler", y: "Stunden" }
   ============================================================ */
const d_antiprop = {
  h: 232,
  label: (p) => `Antiproportional: ${p.x} · ${p.y} = ${p.produkt}`,
  ablauf: (p) => {
    const P = p.produkt, s = p.schritte;
    return [
      { k: "start", ms: 1700, text: `${s[0]} ${p.x} brauchen ${P / s[0]} ${p.y}: ${s[0]} · ${P / s[0]} = ${P} Kästchen Arbeit.` },
      { k: "mehr", ms: 900 * (s.length - 1), text: `Mehr ${p.x}, weniger ${p.y} – die Fläche bleibt immer ${P} Kästchen.` },
      { k: "kurve", ms: 1700, text: "Die Ecken liegen auf einer fallenden Kurve – keine Gerade." },
    ];
  },
  bild: ({ Z, z, p }) => {
    const P = p.produkt, s = p.schritte, m = s.length, e = 12.5, ox = 40, oy = 204, max = 13;
    const X = (v) => ox + v * e, Y = (v) => oy - v * e;
    const ust = Z("start");
    /* mehr: das Rechteck formt sich Stufe für Stufe um, an jeder Tabellenzeile kurz innehalten */
    const ph = z("mehr") * (m - 1), i0 = Math.min(m - 2, Math.floor(ph)), fr = sanft(teil(ph - i0, 0, 0.75));
    const w = Math.exp(mix(Math.log(s[i0]), Math.log(s[i0 + 1]), fr)), h = P / w;
    const uk = Z("kurve");
    const besucht = s.filter((_, i) => i === 0 ? ust >= 1 : ph >= i - 0.25);
    const hyp = []; for (let x = P / max; x <= max + 1e-9; x += 0.1) hyp.push(`${X(x).toFixed(1)},${Y(P / x).toFixed(1)}`);
    const tx1 = 262, tx2 = 318;
    return (
      <>
        <Achsen X={X} Y={Y} xv={[0, max]} yv={[0, max]} xt={[0, 4, 8, 12]} yt={[0, 4, 8, 12]} u={teil(ust, 0, 0.3)} />
        <Tx x={X(max) + 12} y={oy + 26} g={10} f={F.tinte} w={800} a="end" o={teil(ust, 0, 0.3)}>{p.x}</Tx>
        <Tx x={ox + 8} y={Y(max) - 8} g={10} f={F.tinte} w={800} a="start" o={teil(ust, 0, 0.3)}>{p.y}</Tx>
        <g opacity={teil(ust, 0.1, 0.6)}>
          <rect x={X(0)} y={Y(h)} width={w * e} height={h * e} fill={F.granatHell} stroke={F.granat} strokeWidth="1.8" opacity={0.92} />
          {Array.from({ length: Math.ceil(w) - 1 }, (_, i) => <line key={"v" + i} x1={X(i + 1)} x2={X(i + 1)} y1={Y(h)} y2={Y(0)} stroke={F.rosa} strokeWidth="0.9" />)}
          {Array.from({ length: Math.ceil(h) - 1 }, (_, i) => <line key={"h" + i} x1={X(0)} x2={X(w)} y1={Y(i + 1)} y2={Y(i + 1)} stroke={F.rosa} strokeWidth="0.9" />)}
          <Tx x={X(w / 2)} y={Y(h / 2) + 5} g={w < 3 || h < 3 ? 11 : 14} f={F.granat} w={800}>{P}</Tx>
        </g>
        {uk > 0 && <polyline points={hyp.join(" ")} fill="none" stroke={F.gold} strokeWidth="2.6" strokeLinecap="round" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - uk} />}
        {besucht.map((x) => <circle key={x} cx={X(x)} cy={Y(P / x)} r="4.2" fill={F.gold} stroke={F.granat} strokeWidth="1.6" />)}
        <circle cx={X(w)} cy={Y(h)} r="5" fill={F.granat} opacity={teil(ust, 0.5, 1)} />
        {/* Tabelle */}
        <Tx x={tx1} y={34} g={10.5} f={F.blau} w={800} o={ust}>{p.x}</Tx>
        <Tx x={tx2} y={34} g={10.5} f={F.granat} w={800} o={ust}>{p.y}</Tx>
        <line x1={234} x2={350} y1={41} y2={41} stroke={F.linie} strokeWidth="1.4" opacity={ust} />
        {s.map((x, i) => {
          const o = i === 0 ? teil(ust, 0.5, 1) : teil(ph - (i - 1), 0.5, 0.75), y = 62 + i * 21;
          return (
            <g key={"t" + x} opacity={o}>
              <Tx x={tx1} y={y} g={14} f={F.tinte} w={800}>{x}</Tx>
              <Tx x={tx2} y={y} g={14} f={F.tinte} w={800}>{P / x}</Tx>
            </g>
          );
        })}
        <Pille x={350 - (breite(`${p.x} · ${p.y} = ${P}`, 11) + 16)} a="start" y={200} text={`${p.x} · ${p.y} = ${P}`} g={11} o={Math.max(teil(ust, 0.6, 1), 0)} f={F.granatHell} tf={F.granat} />
      </>
    );
  },
};

export const SZENEN_DATEN = {
  d_ausgleich,
  d_verteilen,
  d_zahlenbereiche,
  d_einsetzen,
  d_saeckchen,
  d_streichhoelzer,
  d_tarif,
  d_sortieren,
  d_klammer,
  d_waage,
  d_pfeilkette,
  d_formel,
  d_quader,
  d_urliste,
  d_achse,
  d_kreis,
  d_median,
  d_klassen,
  d_zwecke,
  d_urne,
  d_gesetz,
  d_wertegraph,
  d_temperatur,
  d_proportional,
  d_dreisatz,
  d_antiprop,
};
