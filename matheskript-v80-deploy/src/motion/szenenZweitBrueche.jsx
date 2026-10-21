/* Zweite Animationen (Gruppe Brueche) für Lerneinheiten, die bisher nur eine hatten – Vertrag: siehe kern.jsx
   Regel der Gruppe: Brüche im Bild immer gestapelt (SvgBruch bzw. Reihe unten), nie mit Schrägstrich; in Untertiteln Brüche in Worten. */
import React from "react";
import { B, F, Tx, Strich, Sprung, Spitze, Puls, Pille, SvgBruch, breite, mix, klemm, teil, staffel, sanft } from "./kern.jsx";
import { bw } from "./szenenBrueche.jsx";

/* ---------- Hilfen ---------- */
const PI = Math.PI;
const ZW = ["null", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf"];
const gross = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const gw = (g, z, n) => `${g === 1 ? "ein Ganzes" : ZW[g] + " Ganze"} und ${bw(z, n)}`;
const nennerPl = (n) => bw(2, n).replace(/^zwei /, "");   // „Fünftel“, „Drittel“ …

/* Reihe aus Zahlen/Zeichen, { b: [z, n] } und { gm: [g, z, n] } – gestapelt, y = Höhe des Bruchstrichs */
const bB = (z, n, g) => Math.max(String(z).length, String(n).length) * g * 0.62 + 6;
function tokW(t, g) {
  if (typeof t !== "object") return breite(String(t), g);
  const gg = t.g || g;
  if (t.b) return bB(t.b[0], t.b[1], gg);
  if (t.gm) return breite(String(t.gm[0]), gg * 1.3) + 3 + bB(t.gm[1], t.gm[2], gg);
  return 0;
}
function lage(teile, g, luecke = g * 0.34) {
  const ws = teile.map((t) => tokW(t, g));
  const w = ws.reduce((s, v) => s + v, 0) + luecke * Math.max(0, teile.length - 1);
  let x = -w / 2;
  const xs = [];
  ws.forEach((v) => { xs.push(x + v / 2); x += v + luecke; });
  return { xs, w };
}
function Tok({ t, x, y, g, f = F.tinte }) {
  if (typeof t !== "object") return <Tx x={x} y={y + g * 0.36} g={g} f={f}>{String(t)}</Tx>;
  const gg = t.g || g, ff = t.f || f, oo = t.o == null ? 1 : t.o;
  if (oo <= 0) return null;
  if (t.b) return <SvgBruch x={x} y={y - 1} z={t.b[0]} n={t.b[1]} g={gg} f={ff} o={oo} />;
  const wg = breite(String(t.gm[0]), gg * 1.3), wb = bB(t.gm[1], t.gm[2], gg), xl = x - (wg + 3 + wb) / 2;
  return (
    <g opacity={oo}>
      <Tx x={xl + wg / 2} y={y + gg * 0.47} g={gg * 1.3} f={ff}>{t.gm[0]}</Tx>
      <SvgBruch x={xl + wg + 3 + wb / 2} y={y - 1} z={t.gm[1]} n={t.gm[2]} g={gg} f={ff} />
    </g>
  );
}
function Reihe({ x, y, teile, g = 16, f = F.tinte, o = 1 }) {
  if (o <= 0) return null;
  const L = lage(teile, g);
  return <g opacity={o}>{teile.map((t, i) => (typeof t === "object" && t.o != null && t.o <= 0 ? null : <Tok key={i} t={t} x={x + L.xs[i]} y={y} g={g} f={f} />))}</g>;
}
/* Mitte so wählen, dass die Reihe ganz im Bild bleibt */
const imBild = (x, teile, g) => { const w = lage(teile, g).w; return Math.max(10 + w / 2, Math.min(B - 10 - w / 2, x)); };

/* Kreissektor; Winkel in Grad, 0 = oben, im Uhrzeigersinn */
function sektor(cx, cy, r, a0, a1) {
  const p = (a) => [cx + r * Math.sin((a * PI) / 180), cy - r * Math.cos((a * PI) / 180)];
  if (a1 - a0 >= 359.99) return `M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${cx} ${cy} L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

/* ============================================================
   b2_strahlDoppel – zwei Zahlenstrahlen übereinander: oben Drittel, unten Sechstel.
   Gleiche Stelle = gleicher Bruch; auch über 1 hinaus.
   p: { bis: 2, n: 3, k: 2, ziele: [2, 5] }   (Zähler in Dritteln; unten jeweils k-mal so viele)
   ============================================================ */
const b2_strahlDoppel = {
  h: 196,
  label: (p) => `${gross(nennerPl(p.n))} und ${nennerPl(p.n * p.k)} am Zahlenstrahl`,
  ablauf: (p) => {
    const N = p.n * p.k, [a, b] = p.ziele, g = Math.floor(b / p.n), r = b % p.n;
    return [
      { k: "strahlen", ms: 800, text: `Zwei Zahlenstrahlen von 0 bis ${p.bis}, genau übereinander.` },
      { k: "oben", ms: 1100, text: `Oben: jede Einheit in ${p.n} gleiche Teile – ${nennerPl(p.n)}.` },
      { k: "unten", ms: 1100, text: `Unten: jede Einheit in ${N} gleiche Teile – ${nennerPl(N)}.` },
      { k: "a1", ms: 500 + a * 300, text: `${gross(bw(a, p.n))}: ${a} Schritte oben.` },
      { k: "a2", ms: 500 + a * p.k * 260, text: `${gross(bw(a * p.k, N))}: ${a * p.k} Schritte unten – genau dieselbe Stelle!` },
      { k: "a3", ms: 1300, text: `Also: ${bw(a, p.n)} = ${bw(a * p.k, N)}.` },
      { k: "b1", ms: 500 + b * 260, text: `${gross(bw(b, p.n))}: über die 1 hinaus – der Bruch ist größer als 1.` },
      { k: "b2", ms: 500 + b * p.k * 170, text: `${gross(bw(b * p.k, N))} landen wieder an derselben Stelle.` },
      { k: "ende", ms: 1600, text: `${gross(bw(b, p.n))} = ${bw(b * p.k, N)} = ${gw(g, r, p.n)}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const n = p.n, N = n * p.k, [a, b] = p.ziele;
    const x = (v) => 30 + (v / p.bis) * 300, yo = 70, yu = 130;
    const us = Z("strahlen"), uo = Z("oben"), uu = Z("unten");
    const strahl = (y, teile, ut, farbe) => (
      <g>
        <g opacity={us}>
          <Strich x1={18} y1={y} x2={342} y2={y} u={us} b={1.6} />
          {us >= 1 && <Spitze x={346} y={y} g={7} />}
          {Array.from({ length: p.bis + 1 }, (_, k) => (
            <g key={k}>
              <line x1={x(k)} y1={y - 7} x2={x(k)} y2={y + 7} stroke={F.tinte} strokeWidth="2" />
              <Tx x={x(k)} y={y + 23} g={13} f={F.tinte} w={800}>{k}</Tx>
            </g>
          ))}
        </g>
        {Array.from({ length: p.bis * teile + 1 }, (_, k) => k % teile === 0 ? null : (
          <line key={k} x1={x(k / teile)} y1={y - 5} x2={x(k / teile)} y2={y + 5} stroke={farbe} strokeWidth="1.4" opacity={staffel(ut, k, p.bis * teile + 1, 0.6)} />
        ))}
      </g>
    );
    /* Sprünge: zz Schritte der Länge 1/nn ab 0; bleiben nur während ihres Abschnitts sichtbar */
    const spruenge = (k, zz, nn, y, hoch, aus) => {
      const u = z(k); if (u <= 0) return { hops: 0, el: null };
      const hops = teil(u, 0, 0.85) * zz, bo = 1 - teil(aus, 0, 0.4);
      return {
        hops,
        el: bo > 0 && Array.from({ length: Math.ceil(hops) }, (_, i) => (
          <g key={i} opacity={bo}><Sprung xa={x(i / nn)} xb={x((i + 1) / nn)} y={y} hoch={hoch} u={klemm(hops - i)} b={2} /></g>
        )),
      };
    };
    const sA1 = spruenge("a1", a, n, yo - 2, 12, z("a2"));
    const sA2 = spruenge("a2", a * p.k, N, yu - 2, 11, z("a3"));
    const sB1 = spruenge("b1", b, n, yo - 2, 12, z("b2"));
    const sB2 = spruenge("b2", b * p.k, N, yu - 2, 11, z("ende"));
    const punkt = (hops, nn, y, farbe) => hops > 0 && <circle cx={x(Math.min(hops, 1e9) / nn)} cy={y} r={5.5} fill={farbe} stroke={F.weiss} strokeWidth="1.5" />;
    const gleich = (v, u) => u > 0 && (
      <g opacity={u}>
        <line x1={x(v)} y1={yo + 8} x2={x(v)} y2={yu - 8} stroke={F.gold} strokeWidth="1.8" strokeDasharray="3 3" />
        <circle cx={x(v)} cy={(yo + yu) / 2} r={9} fill={F.goldHell} stroke={F.gold} strokeWidth="1.4" />
        <Tx x={x(v)} y={(yo + yu) / 2 + 4.5} g={13} f={F.goldDunkel} w={800}>=</Tx>
      </g>
    );
    const g = Math.floor(b / n), r = b % n, ue = Z("ende");
    const obenBo = [{ b: [b, n], f: F.granat }, "=", { gm: [g, r, n], f: F.granat }];
    return (
      <>
        <Tx x={18} y={yo - 44} g={10} f={F.granat} a="start" o={uo}>{nennerPl(n).toUpperCase()}</Tx>
        <Tx x={18} y={yu + 58} g={10} f={F.blau} a="start" o={uu}>{nennerPl(N).toUpperCase()}</Tx>
        {strahl(yo, n, uo, F.granat)}
        {strahl(yu, N, uu, F.blau)}
        {sA1.el}{sA2.el}{sB1.el}{sB2.el}
        {gleich(a / n, Z("a3"))}
        {gleich(b / n, teil(z("b2"), 0.85, 1))}
        {punkt(Math.min(sA1.hops, a), n, yo, F.granat)}
        {punkt(Math.min(sA2.hops, a * p.k), N, yu, F.blau)}
        {punkt(Math.min(sB1.hops, b), n, yo, F.granat)}
        {punkt(Math.min(sB2.hops, b * p.k), N, yu, F.blau)}
        <SvgBruch x={x(a / n)} y={yo - 36} z={a} n={n} g={14} f={F.granat} o={teil(sA1.hops, a - 0.5, a)} />
        <SvgBruch x={x(a / n)} y={yu + 38} z={a * p.k} n={N} g={14} f={F.blau} o={teil(sA2.hops, a * p.k - 0.5, a * p.k)} />
        {sB1.hops > 0 && (() => {
          const o = teil(sB1.hops, b - 0.5, b), L = lage(obenBo, 14), xm = imBild(x(b / n) - L.xs[0], obenBo, 14);
          return (
            <g opacity={o}>
              <Tok t={obenBo[0]} x={xm + L.xs[0]} y={yo - 36} g={14} />
              <g opacity={ue}><Tok t="=" x={xm + L.xs[1]} y={yo - 36} g={14} /><Tok t={obenBo[2]} x={xm + L.xs[2]} y={yo - 36} g={14} /></g>
            </g>
          );
        })()}
        <SvgBruch x={x(b / n)} y={yu + 38} z={b * p.k} n={N} g={14} f={F.blau} o={teil(sB2.hops, b * p.k - 0.5, b * p.k)} />
      </>
    );
  },
};

/* ============================================================
   b2_pizzaBuendeln – oben: lose Stücke werden zu ganzen Pizzen gebündelt (unechter Bruch → gemischte Zahl);
   unten umgekehrt: ganze Pizzen werden zerschnitten und alle Stücke gezählt (gemischte Zahl → unechter Bruch).
   p: { z: 11, n: 4, zurueck: [2, 1, 3] }
   ============================================================ */
const b2_pizzaBuendeln = {
  h: 206,
  label: (p) => `${gross(bw(p.z, p.n))} bündeln, ${gw(...p.zurueck)} zerschneiden`,
  ablauf: (p) => {
    const g = Math.floor(p.z / p.n), r = p.z % p.n, [G, Rz, Rn] = p.zurueck, S = G * Rn + Rz;
    return [
      { k: "lose", ms: 1100, text: `${gross(bw(p.z, p.n))}: ${p.z} lose Pizzastücke.` },
      { k: "buendeln", ms: 600 + p.z * 190, text: `Je ${p.n} ${nennerPl(p.n)} bündeln zu einer ganzen Pizza.` },
      { k: "ergA", ms: 1600, text: `${g} ganze Pizzen, ${r} Stücke bleiben: ${bw(p.z, p.n)} = ${gw(g, r, p.n)}.` },
      { k: "zeigeB", ms: 1100, text: `Umgekehrt: ${gw(G, Rz, Rn)}.` },
      { k: "schneiden", ms: 1400, text: `Jede ganze Pizza in ${Rn} gleiche Stücke schneiden.` },
      { k: "zaehlen", ms: 500 + S * 230, text: `Alle Stücke zählen: ${Array(G).fill(Rn).join(" + ")} + ${Rz} = ${S} ${nennerPl(Rn)}.` },
      { k: "ergB", ms: 1700, text: `${gross(gw(G, Rz, Rn))} = ${bw(S, Rn)} – Ganze mal Nenner plus Zähler: ${G} · ${Rn} + ${Rz} = ${S}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const n = p.n, g = Math.floor(p.z / n), r = p.z % n, m = Math.ceil(p.z / n);
    const [G, Rz, Rn] = p.zurueck, S = G * Rn + Rz;
    const R = 25, px = (j) => 46 + j * 66, ya = 50, yb = 158;
    const ul = Z("lose"), ub = z("buendeln"), ua = Z("ergA");
    const uzb = Z("zeigeB"), us = Z("schneiden"), uz = z("zaehlen"), ue = Z("ergB");
    /* Zeile A: lose Stücke → Pizzen */
    const xL = (k) => 20 + k * ((B - 54) / Math.max(1, p.z - 1));
    const stueckeA = Array.from({ length: p.z }, (_, k) => {
      const u = sanft(staffel(ub, k, p.z, 0.55)), j = Math.floor(k / n), slot = k % n;
      const cx = mix(xL(k), px(j), u), cy = mix(ya + 14, ya, u) - Math.sin(PI * u) * 10;
      const a0 = mix(0, (slot * 360) / n, u);
      return <path key={k} d={sektor(cx, cy, R, a0, a0 + 360 / n)} fill={F.granat} stroke={F.weiss} strokeWidth="1.3" opacity={staffel(ul, k, p.z, 0.7)} />;
    });
    const zeileA = [{ b: [p.z, n] }, "=", { gm: [g, r, n], f: F.granat }];
    /* Zeile B: Ganze zerschneiden, Stücke zählen */
    const zaehl = (k) => staffel(uz, k, S, 0.2) > 0.5;
    const stueckeB = [];
    let k = 0;
    for (let j = 0; j <= G; j++) {
      const teile = j < G ? Rn : Rz;
      for (let i = 0; i < teile; i++, k++) {
        const nr = k + 1, an = zaehl(k), a0 = (i * 360) / Rn, a1 = ((i + 1) * 360) / Rn, am = ((a0 + a1) / 2) * PI / 180;
        stueckeB.push(
          <g key={`b${k}`}>
            <path d={sektor(px(j), yb, R, a0, a1)} fill={an ? F.gold : F.blau} stroke={an ? F.gold : F.blau} strokeWidth="0.8" />
            {an && <Tx x={px(j) + R * 0.58 * Math.sin(am)} y={yb - R * 0.58 * Math.cos(am) + 4} g={11} f={F.tinte} w={800}>{nr}</Tx>}
          </g>
        );
      }
    }
    let gezaehlt = 0;
    for (let i = 0; i < S; i++) if (zaehl(i)) gezaehlt++;
    const zeileB = [{ gm: [G, Rz, Rn] }, "=", { b: [S, Rn], f: F.blau }];
    return (
      <>
        {/* Zeile A */}
        {Array.from({ length: m }, (_, j) => (
          <circle key={j} cx={px(j)} cy={ya} r={R} fill="none" stroke={j < g && ua > 0 ? F.gold : F.hell} strokeWidth={j < g && ua > 0 ? 2.6 : 1.3} strokeDasharray={j < g && ua > 0 ? undefined : "3 3"} opacity={teil(ub, 0, 0.15)} />
        ))}
        {stueckeA}
        {Array.from({ length: g }, (_, j) => <Puls key={j} x={px(j)} y={ya} u={teil(ua, j * 0.2, 0.6 + j * 0.2)} r={30} />)}
        {Array.from({ length: g }, (_, j) => <Tx key={j} x={px(j)} y={ya + R + 18} g={15} f={F.granat} w={800} o={ua}>1</Tx>)}
        {r > 0 && <SvgBruch x={px(g)} y={ya + R + 12} z={r} n={n} g={12} f={F.granat} o={ua} />}
        <Reihe x={imBild(px(m - 1) + R + 70, zeileA, 16)} y={ya} g={16} teile={zeileA} o={ua} />
        <line x1={16} y1={114} x2={B - 16} y2={114} stroke={F.linie} strokeWidth="1.5" opacity={uzb} />
        {/* Zeile B */}
        <g opacity={uzb}>
          {Array.from({ length: G }, (_, j) => <circle key={`v${j}`} cx={px(j)} cy={yb} r={R} fill={F.blau} />)}
          {stueckeB}
          {Array.from({ length: G + 1 }, (_, j) => {
            const teile = j < G ? Rn : Rz;
            return <g key={j}>{Array.from({ length: teile + (j < G ? 0 : 1) }, (_, i) => {
              const a = ((i * 360) / Rn) * PI / 180, u = j < G ? staffel(us, j * Rn + i, G * Rn, 0.5) : 1;
              return <Strich key={`${j}-${i}`} x1={px(j)} y1={yb} x2={px(j) + R * Math.sin(a)} y2={yb - R * Math.cos(a)} u={u} f={F.weiss} b={1.6} />;
            })}</g>;
          })}
          {Array.from({ length: G + 1 }, (_, j) => <circle key={j} cx={px(j)} cy={yb} r={R} fill="none" stroke={j < G ? F.tinte : F.hell} strokeWidth={j < G ? 1.6 : 1.3} strokeDasharray={j < G ? undefined : "3 3"} />)}
          <Reihe x={imBild(px(G) + R + 70, zeileB, 16)} y={yb - 14} g={16} teile={zeileB.slice(0, 1)} o={1 - ue} />
        </g>
        <Pille x={imBild(px(G) + R + 70, zeileB, 16)} y={yb + 30} text={`${gezaehlt} ${nennerPl(Rn)}`} f={F.goldHell} tf={F.goldDunkel} o={uz > 0 ? 1 - ue : 0} />
        <Reihe x={imBild(px(G) + R + 70, zeileB, 16)} y={yb - 14} g={16} teile={zeileB} o={ue} />
        <Pille x={imBild(px(G) + R + 70, zeileB, 16)} y={yb + 30} text={`${G} · ${Rn} + ${Rz} = ${S}`} f={F.blauHell} tf={F.blau} o={ue} />
      </>
    );
  },
};

/* ============================================================
   b2_sprungAdd – gleichnamige Brüche addieren auf dem Zahlenstrahl: Sprünge gleicher Länge, der Nenner bleibt
   p: { a: [1, 5], b: [3, 5] }   (gleicher Nenner, Summe ≤ 1)
   ============================================================ */
const b2_sprungAdd = {
  h: 194,
  label: (p) => `${gross(bw(...p.a))} plus ${bw(...p.b)} am Zahlenstrahl`,
  ablauf: (p) => {
    const n = p.a[1], A = p.a[0], Bz = p.b[0], S = A + Bz;
    return [
      { k: "strahl", ms: 1200, text: `Der Zahlenstrahl von 0 bis 1 – eingeteilt in ${nennerPl(n)}.` },
      { k: "a", ms: 500 + A * 450, text: `${gross(bw(A, n))}: ${A === 1 ? "ein Sprung" : `${A} Sprünge`} von der 0 aus.` },
      { k: "b", ms: 500 + Bz * 450, text: `Plus ${bw(Bz, n)}: ${Bz === 1 ? "ein Sprung" : `${Bz} Sprünge`} weiter.` },
      { k: "zaehlen", ms: 1600, text: `Jeder Sprung ist ${bw(1, n)} lang. Gezählt: ${A} + ${Bz} = ${S} Sprünge.` },
      { k: "ergebnis", ms: 1700, text: `${gross(bw(A, n))} plus ${bw(Bz, n)} = ${bw(S, n)}. Der Nenner bleibt ${n}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const n = p.a[1], A = p.a[0], Bz = p.b[0], S = A + Bz;
    const x = (v) => 34 + v * 290, ya = 140;
    const us = Z("strahl"), ua = z("a"), ub = z("b"), uz = Z("zaehlen"), ue = Z("ergebnis");
    const hopsA = teil(ua, 0, 0.9) * A, hopsB = teil(ub, 0, 0.9) * Bz;
    const pos = (hopsA + hopsB) / n;
    const zeile = [
      { b: [A, n], f: F.granat, o: teil(ua, 0, 0.3) },
      { t: "+", o: teil(ub, 0, 0.3) },
      { b: [Bz, n], f: F.goldDunkel, o: teil(ub, 0, 0.3) },
      { t: "=", o: ue },
      { b: [S, n], f: F.granat, o: ue },
    ];
    const L = lage(zeile.map((t) => (t.t ? t.t : t)), 19);
    return (
      <>
        {/* Gleichung oben */}
        {zeile.map((t, i) => t.o > 0 && (
          <g key={i} opacity={t.o}><Tok t={t.t ? t.t : { ...t, o: 1 }} x={B / 2 + L.xs[i]} y={34} g={19} f={t.f || F.tinte} /></g>
        ))}
        {/* Nenner bleibt: Markierung unter den drei Nennern */}
        <Pille x={B / 2} y={76} text={`Nenner bleibt ${n} · Zähler: ${A} + ${Bz} = ${S}`} f={F.blauHell} tf={F.blau} o={ue} />
        {/* Strahl */}
        <g opacity={us}>
          <Strich x1={20} y1={ya} x2={340} y2={ya} u={us} b={1.6} />
          {us >= 1 && <Spitze x={344} y={ya} g={7} />}
        </g>
        {Array.from({ length: n + 1 }, (_, k) => {
          const o = staffel(us, k, n + 1, 0.5), ganz = k === 0 || k === n;
          return (
            <g key={k} opacity={o}>
              <line x1={x(k / n)} y1={ya - (ganz ? 7 : 5)} x2={x(k / n)} y2={ya + (ganz ? 7 : 5)} stroke={F.tinte} strokeWidth={ganz ? 2 : 1.4} />
              {ganz ? <Tx x={x(k / n)} y={ya + 30} g={15} w={800}>{k / n}</Tx> : <SvgBruch x={x(k / n)} y={ya + 26} z={k} n={n} g={12} f={k === S && ue > 0 ? F.granat : F.grau} />}
            </g>
          );
        })}
        {/* Sprünge */}
        {Array.from({ length: Math.ceil(hopsA) }, (_, i) => (
          <Sprung key={`a${i}`} xa={x(i / n)} xb={x((i + 1) / n)} y={ya - 2} hoch={20} u={klemm(hopsA - i)} f={F.granat} b={2.6} />
        ))}
        {Array.from({ length: Math.ceil(hopsB) }, (_, i) => (
          <Sprung key={`b${i}`} xa={x((A + i) / n)} xb={x((A + i + 1) / n)} y={ya - 2} hoch={20} u={klemm(hopsB - i)} f={F.gold} b={2.6} />
        ))}
        {/* Sprungnummern beim Zählen */}
        {Array.from({ length: S }, (_, i) => (
          <Tx key={i} x={(x(i / n) + x((i + 1) / n)) / 2} y={ya - 28} g={11} f={i < A ? F.granat : F.goldDunkel} w={800} o={staffel(uz, i, S, 0.4)}>{i + 1}</Tx>
        ))}
        {ua > 0 && <circle cx={x(pos)} cy={ya} r={5.5} fill={F.granat} stroke={F.weiss} strokeWidth="1.5" />}
        <Puls x={x(S / n)} y={ya} u={ue} r={16} />
      </>
    );
  },
};

/* ============================================================
   b2_uebertrag – gemischte Zahlen addieren mit Streifen: Ganze zusammen, Bruchteile ergeben mehr als ein Ganzes
   → n Teile bündeln zu einem neuen Ganzen (Übertrag)
   p: { a: [1, 3, 5], b: [2, 4, 5] }   (gleicher Nenner, Zähler-Summe > Nenner)
   ============================================================ */
const b2_uebertrag = {
  h: 226,
  label: (p) => `${gross(gw(...p.a))} plus ${gw(...p.b)} mit Übertrag`,
  ablauf: (p) => {
    const n = p.a[2], G = p.a[0] + p.b[0], S = p.a[1] + p.b[1], r = S - n;
    return [
      { k: "zeigen", ms: 1500, text: `${gross(gw(...p.a))} plus ${gw(...p.b)}.` },
      { k: "ganze", ms: 1300, text: `Ganze zu Ganzen: ${p.a[0]} + ${p.b[0]} = ${G}.` },
      { k: "teile", ms: 600 + S * 200, text: `${nennerPl(n)} zu ${nennerPl(n)}n: ${p.a[1]} + ${p.b[1]} = ${S} ${nennerPl(n)} – mehr als ein Ganzes!` },
      { k: "buendeln", ms: 1600, text: `${n} ${nennerPl(n)} bündeln zu einem neuen Ganzen – ${bw(r, n)} bleiben übrig.` },
      { k: "ergebnis", ms: 1800, text: `${G} Ganze plus 1 Ganzes: Ergebnis ${gw(G + 1, r, n)}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const n = p.a[2], G = p.a[0] + p.b[0], S = p.a[1] + p.b[1], r = S - n;
    const w = 54, h = 18, gap = 8, cw = w / n;
    const uz = Z("zeigen"), ug = Z("ganze"), ut = z("teile"), ubn = Z("buendeln"), ue = Z("ergebnis");
    const xq = (i) => 96 + i * (w + gap), ya = 22, yb = 64, yr = 130;
    const xr = (i) => 24 + i * (w + gap);
    const zeilen = [{ m: p.a, y: ya, f: F.granat }, { m: p.b, y: yb, f: F.gold }];
    const balken = (x, y, fuell, o = 1, rand = F.tinte, rb = 1.6) => (
      <g opacity={o}>
        <rect x={x} y={y} width={w} height={h} fill={F.weiss} />
        {fuell}
        {Array.from({ length: n - 1 }, (_, i) => <line key={i} x1={x + (i + 1) * cw} y1={y} x2={x + (i + 1) * cw} y2={y + h} stroke={F.hell} strokeWidth="1" />)}
        <rect x={x} y={y} width={w} height={h} fill="none" stroke={rand} strokeWidth={rb} rx="1.5" />
      </g>
    );
    /* Ganze fliegen nach unten */
    const ganze = [];
    zeilen.forEach((zl, zi) => {
      for (let i = 0; i < zl.m[0]; i++) {
        const ziel = zi === 0 ? i : p.a[0] + i;
        const xx = mix(xq(i), xr(ziel), ug), yy = mix(zl.y, yr, ug) - Math.sin(PI * ug) * 10;
        ganze.push(<g key={`g${zi}${i}`} opacity={uz}>{balken(xx, yy, <rect x={xx} y={yy} width={w} height={h} fill={F.blau} />, 1)}</g>);
      }
    });
    /* Bruchstücke fliegen in die Balken G und G+1 */
    const stuecke = [];
    let idx = 0;
    zeilen.forEach((zl, zi) => {
      for (let i = 0; i < zl.m[1]; i++, idx++) {
        const u = sanft(staffel(ut, idx, S, 0.55)), bal = Math.floor(idx / n), slot = idx % n;
        const x0 = xq(zl.m[0]) + i * cw, x1 = xr(G + bal) + slot * cw;
        const xx = mix(x0, x1, u), yy = mix(zl.y, yr, u) - Math.sin(PI * u) * 12;
        const farbe = bal === 0 && ubn > 0.5 ? F.blau : zl.f;
        stuecke.push(<rect key={`s${idx}`} x={xx + 0.6} y={yy + 0.6} width={cw - 1.2} height={h - 1.2} fill={farbe} opacity={uz} />);
      }
    });
    const zeileE = [{ gm: p.a }, "+", { gm: p.b }, "=", String(G), "+", { b: [S, n], f: F.granat }, "=", { gm: [G + 1, r, n], f: F.granat }];
    const Le = lage(zeileE, 13);
    const sicht = [1, 1, 1, ug, ug, teil(ut, 0.85, 1), teil(ut, 0.85, 1), ue, ue];
    return (
      <>
        {/* oben: die beiden Summanden */}
        {zeilen.map((zl, zi) => (
          <g key={zi} opacity={staffel(uz, zi, 2, 0.5)}>
            <Tok t={{ gm: zl.m, f: zi === 0 ? F.granat : F.goldDunkel }} x={44} y={zl.y + h / 2} g={15} />
            {zi === 1 && <Tx x={14} y={zl.y + h / 2 + 7} g={18} f={F.grau}>+</Tx>}
            {balken(xq(zl.m[0]), zl.y, null, 1 - teil(ut, 0.8, 1))}
          </g>
        ))}
        <line x1={16} y1={102} x2={B - 16} y2={102} stroke={F.linie} strokeWidth="1.5" opacity={ug} />
        {/* unten: leere Balken für die Stücke */}
        {[0, 1].map((j) => <g key={j}>{balken(xr(G + j), yr, null, teil(ut, 0, 0.15), j === 0 && ubn > 0 ? F.gold : F.tinte, j === 0 && ubn > 0 ? 2.6 : 1.6)}</g>)}
        {ganze}
        {stuecke}
        <Puls x={xr(G) + w / 2} y={yr + h / 2} u={ubn} r={30} />
        {/* Klammern unten */}
        <path d={`M${xr(0)} ${yr + h + 8} v5 h${xr(G - 1) + w - xr(0)} v-5`} fill="none" stroke={F.blau} strokeWidth="1.6" opacity={ug * (1 - ubn)} />
        <Tx x={(xr(0) + xr(G - 1) + w) / 2} y={yr + h + 27} g={12} f={F.blau} w={800} o={ug * (1 - ubn)}>{`${G} Ganze`}</Tx>
        <path d={`M${xr(0)} ${yr + h + 8} v5 h${xr(G) + w - xr(0)} v-5`} fill="none" stroke={F.blau} strokeWidth="1.6" opacity={ubn} />
        <Tx x={(xr(0) + xr(G) + w) / 2} y={yr + h + 27} g={12} f={F.blau} w={800} o={ubn}>{`${G} + 1 = ${G + 1} Ganze`}</Tx>
        <SvgBruch x={xr(G + 1) + w / 2} y={yr + h + 22} z={r} n={n} g={12} f={F.granat} o={ubn} />
        <Pille x={xr(G) + w + gap / 2} y={yr - 12} text={`${S} ${nennerPl(n)}`} o={teil(ut, 0.85, 1) * (1 - ubn)} />
        <Pille x={xr(G) + w / 2} y={yr - 12} text={`${n} ${nennerPl(n)} = 1`} o={ubn} />
        {/* Rechnung */}
        {zeileE.map((t, i) => (i < 3 ? uz : sicht[i]) > 0 && <g key={i} opacity={i < 3 ? uz : sicht[i]}><Tok t={t} x={B / 2 + Le.xs[i]} y={204} g={13} /></g>)}
      </>
    );
  },
};

export const SZENEN_ZWEIT_BRUECHE = {
  b2_strahlDoppel,
  b2_pizzaBuendeln,
  b2_sprungAdd,
  b2_uebertrag,
};
