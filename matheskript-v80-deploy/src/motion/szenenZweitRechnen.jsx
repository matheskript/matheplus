/* Zweite Animationen (Gruppe Rechnen) für Lerneinheiten, die bisher nur eine hatten – Vertrag: siehe kern.jsx
   flaechenMal (Rechteckmodell), buendelTeilen (Verteilen mit Umtauschen), endstellen (Teilbarkeit am Ende),
   primLeiter (Leiter + Teilerzahl), gegensinnig (398 + 247 = 400 + 245), rechenbaumWachsen (Baum wächst von unten). */
import React from "react";
import { B, F, Tx, Strich, Kasten, Pille, Puls, de, mix, teil, staffel, raus, federnd } from "./kern.jsx";

const SCHRIFT = { fontFamily: "Montserrat, sans-serif" };
const oderListe = (l) => (l.length < 2 ? String(l[0]) : `${l.slice(0, -1).join(", ")} oder ${l[l.length - 1]}`);

/* ============================================================
   flaechenMal – 528 · 34 als Rechteck: beide Faktoren nach Stellen zerlegen, Teilflächen, Reihen, Summe
   p: { a: 528, b: 34 }
   ============================================================ */
const stellenTeile = (n) => { const s = String(n); return s.split("").map((c, i) => Number(c) * 10 ** (s.length - 1 - i)).filter((v) => v > 0); };
const flaechenMal = {
  h: 236,
  label: (p) => `${p.a} · ${p.b} als Rechteck in Teilflächen`,
  ablauf: (p) => {
    const A = stellenTeile(p.a), Bt = stellenTeile(p.b);
    const reihe = (j) => (Bt.length === 2 ? (j ? "Untere Reihe" : "Obere Reihe") : `Reihe ${j + 1}`);
    return [
      { k: "auf", ms: 1000, text: `${de(p.a)} · ${p.b} als Rechteck: ${de(p.a)} breit, ${p.b} hoch.` },
      { k: "zer", ms: 1300, text: `Beide Seiten nach Stellen zerlegen: ${A.map((v) => de(v)).join(" + ")} und ${Bt.join(" + ")}.` },
      ...Bt.map((y, j) => ({ k: `r${j}`, ms: 400 + A.length * 700, text: `${reihe(j)}: ${A.map((x) => de(x * y)).join(" + ")} = ${de(p.a * y)}` })),
      { k: "summe", ms: 1500, text: `Die Reihen sind die Teilprodukte: zusammen ${de(p.a * p.b)}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const A = stellenTeile(p.a), Bt = stellenTeile(p.b);
    const W = 236, H = 118, x0 = 34, y0 = 50;
    const bw = A.length === 3 ? [136, 56, 44] : A.length === 2 ? [156, 80] : A.map(() => W / A.length);
    const bh = Bt.length === 2 ? [84, 34] : Bt.map(() => H / Bt.length);
    const xs = [x0]; bw.forEach((w) => xs.push(xs[xs.length - 1] + w));
    const ys = [y0]; bh.forEach((h) => ys.push(ys[ys.length - 1] + h));
    const ua = Z("auf"), uz = Z("zer"), us = Z("summe");
    const reiheF = (j) => (j % 2 ? F.blau : F.goldDunkel);
    return (
      <>
        {/* Ganzes Rechteck und ungeteilte Seitenlängen */}
        <rect x={x0} y={y0} width={W} height={H} rx="4" fill={F.flaeche} stroke={F.tinte} strokeWidth="1.8" opacity={ua} />
        <Tx x={x0 + W / 2} y={y0 - 12} g={14} f={F.tinte} w={800} o={ua * (1 - uz)}>{de(p.a)}</Tx>
        <Tx x={x0 - 8} y={y0 + H / 2 + 5} g={14} f={F.tinte} w={800} a="end" o={ua * (1 - uz)}>{p.b}</Tx>
        {/* Zellen */}
        {Bt.map((yv, j) => A.map((xv, i) => {
          const k = j * A.length + i, ur = z(`r${j}`), u = raus(staffel(teil(ur, 0, 0.7), i, A.length, 0.3)), akt = u > 0 && u < 1;
          const w = bw[i], h = bh[j], wert = de(xv * yv), g = Math.min(13, (w - 6) / (String(wert).length * 0.66), h * 0.5);
          return (
            <g key={k}>
              <rect x={xs[i] + 1} y={ys[j] + 1} width={w - 2} height={h - 2} rx="3" fill={j % 2 ? F.blauHell : F.goldHell} opacity={u} />
              {akt && <rect x={xs[i] + 1} y={ys[j] + 1} width={w - 2} height={h - 2} rx="3" fill="none" stroke={F.gold} strokeWidth="2.6" />}
              <Tx x={xs[i] + w / 2} y={ys[j] + h / 2 + g * 0.36} g={g} f={reiheF(j)} w={800} o={teil(u, 0.3, 0.8)}>{wert}</Tx>
            </g>
          );
        }))}
        {/* Trennlinien und Teil-Seitenlängen */}
        {xs.slice(1, -1).map((x, i) => <Strich key={`v${i}`} x1={x} y1={y0} x2={x} y2={y0 + H} u={uz} f={F.tinte} b={1.4} />)}
        {ys.slice(1, -1).map((y, j) => <Strich key={`h${j}`} x1={x0} y1={y} x2={x0 + W} y2={y} u={uz} f={F.tinte} b={1.4} />)}
        {A.map((v, i) => <Tx key={`a${i}`} x={xs[i] + bw[i] / 2} y={y0 - 12} g={13} f={F.tinte} w={800} o={uz}>{de(v)}</Tx>)}
        {Bt.map((v, j) => <Tx key={`b${j}`} x={x0 - 8} y={ys[j] + bh[j] / 2 + 5} g={13} f={F.tinte} w={800} a="end" o={uz}>{v}</Tx>)}
        {/* Reihensummen */}
        {Bt.map((v, j) => {
          const u = teil(z(`r${j}`), 0.7, 1);
          return (
            <g key={`s${j}`} opacity={u}>
              {u < 1 && <rect x={x0} y={ys[j]} width={W} height={bh[j]} rx="3" fill="none" stroke={F.granat} strokeWidth="2.4" />}
              <Tx x={x0 + W + 8} y={ys[j] + bh[j] / 2 + 5} g={12.5} f={reiheF(j)} w={800} a="start">{`= ${de(p.a * v)}`}</Tx>
            </g>
          );
        })}
        <g opacity={us}>
          <Tx x={B / 2} y={y0 + H + 28} g={15} f={F.tinte} w={800}>{`${Bt.map((v) => de(p.a * v)).join(" + ")} = ${de(p.a * p.b)}`}</Tx>
          <Pille x={B / 2} y={y0 + H + 58} text={`${de(p.a)} · ${p.b} = ${de(p.a * p.b)}`} f={F.granatTief} tf={F.goldHell} g={13} />
        </g>
      </>
    );
  },
};

/* ============================================================
   buendelTeilen – 756 : 3 als gerechtes Verteilen: Hunderter, Zehner, Einer; Rest wird umgetauscht
   p: { a: 756, b: 3 }   (a < 1000)
   ============================================================ */
const NAMEN = ["Hunderter", "Zehner", "Einer"];
function verteilen(a, b) {
  const d = String(a).padStart(3, "0").split("").map(Number);
  let rest = 0; const st = [];
  d.forEach((dig, k) => { const neu = rest * 10, n = dig + neu, je = Math.floor(n / b), r = n % b; st.push({ dig, neu, n, je, r }); rest = r; });
  return st;
}
const buendelTeilen = {
  h: 248,
  label: (p) => `${p.a} : ${p.b} durch Verteilen von Hundertern, Zehnern und Einern`,
  ablauf: (p) => {
    const st = verteilen(p.a, p.b), q = Math.floor(p.a / p.b), rest = p.a % p.b;
    const liste = [{ k: "auf", ms: 1100, text: `${de(p.a)} : ${p.b} – Hunderter, Zehner und Einer auf ${p.b} Gruppen verteilen.` }];
    st.forEach((s, k) => {
      if (s.n > 0) liste.push({ k: `v${k}`, ms: 1500, text: `${s.n} ${NAMEN[k]}: jede Gruppe bekommt ${s.je}` + (s.r ? `, ${s.r} bleib${s.r > 1 ? "en" : "t"} übrig.` : ".") });
      if (k < 2 && s.r > 0) liste.push({ k: `t${k}`, ms: 1400, text: `${s.r} ${NAMEN[k]} in ${s.r * 10} ${NAMEN[k + 1]} umtauschen.` });
    });
    liste.push({ k: "ende", ms: 1300, text: `Jede Gruppe hat ${de(q)}. Also ${de(p.a)} : ${p.b} = ${de(q)}` + (rest ? ` Rest ${rest}.` : ".") });
    return liste;
  },
  bild: ({ Z, z, p }) => {
    const st = verteilen(p.a, p.b), q = Math.floor(p.a / p.b), rest = p.a % p.b, b = p.b;
    const ua = Z("auf"), ue = Z("ende");
    const XH = 20, XZ = XH + Math.max(1, st[0].n) * 17 + 14, XE = XZ + Math.max(1, st[1].n) * 7 + 14;
    const lager = [(j) => ({ x: XH + j * 17, y: 32 }), (j) => ({ x: XZ + j * 7, y: 32 }), (j) => ({ x: XE + j * 9, y: 36 })];
    const GW = (B - 24 - (b - 1) * 8) / b, gx = (g) => 12 + g * (GW + 8), GY = 76;
    const platz = [(g, s) => ({ x: gx(g) + 10 + s * 18, y: 102 }), (g, s) => ({ x: gx(g) + 10 + s * 8, y: 124 }), (g, s) => ({ x: gx(g) + 10 + s * 9, y: 150 })];
    const form = (k, x, y, key, o) => {
      if (k === 0) return <rect key={key} x={x} y={y} width={14} height={14} rx="2" fill={F.goldHell} stroke={F.goldDunkel} strokeWidth="1.2" opacity={o} />;
      if (k === 1) return <rect key={key} x={x} y={y} width={4} height={14} rx="1" fill={F.blau} opacity={o} />;
      return <rect key={key} x={x} y={y} width={6} height={6} rx="1" fill={F.granat} opacity={o} />;
    };
    const teile = [];
    st.forEach((s, k) => {
      const uv = s.n > 0 ? Z(`v${k}`) : 0, vergeben = b * s.je;
      const uNeu = k > 0 && st[k - 1].r > 0 ? teil(Z(`t${k - 1}`), 0.4, 1) : 0;
      const uWeg = k < 2 && s.r > 0 ? Z(`t${k}`) : 0;
      for (let j = 0; j < s.n; j++) {
        const a = lager[k](j);
        let o = j < s.dig ? ua : uNeu, x = a.x, y = a.y;
        if (j < vergeben) {
          const u = raus(staffel(uv, j, vergeben, 0.6)), zz = platz[k](j % b, Math.floor(j / b));
          x = mix(a.x, zz.x, u); y = mix(a.y, zz.y, u);
        } else if (uWeg > 0) o *= 1 - teil(uWeg, 0, 0.45);
        if (o > 0) teile.push(form(k, x, y, `${k}-${j}`, o));
      }
    });
    const tauschPuls = [0, 1].map((k) => (st[k].r > 0 ? <Puls key={k} x={k ? XE - 7 : XZ - 7} y={39} u={teil(Z(`t${k}`), 0, 0.7)} r={16} f={F.gold} /> : null));
    return (
      <>
        <g opacity={ua}>
          {NAMEN.map((n, k) => <Tx key={n} x={[XH, XZ, XE][k]} y={22} g={9.5} f={F.grau} w={700} a="start">{n}</Tx>)}
          {Array.from({ length: b }, (_, g) => (
            <g key={g}>
              <rect x={gx(g)} y={GY} width={GW} height={122} rx="10" fill={F.flaeche} stroke={F.linie} strokeWidth="1.4" />
              <Tx x={gx(g) + GW / 2} y={GY + 15} g={9.5} f={F.grau} w={700}>{`Gruppe ${g + 1}`}</Tx>
            </g>
          ))}
        </g>
        {tauschPuls}
        {teile}
        <g opacity={ue}>
          {Array.from({ length: b }, (_, g) => <Tx key={g} x={gx(g) + GW / 2} y={GY + 112} g={18} f={F.granat} w={800}>{de(q)}</Tx>)}
          {rest > 0 && <Tx x={XE + rest * 9 + 6} y={42} g={10} f={F.granat} w={800} a="start">Rest</Tx>}
          <Pille x={B / 2} y={234} text={`${de(p.a)} : ${b} = ${de(q)}` + (rest ? ` Rest ${rest}` : "")} f={F.granatTief} tf={F.goldHell} g={13} />
        </g>
      </>
    );
  },
};

/* ============================================================
   endstellen – Teilbarkeit durch 4 an den letzten zwei Ziffern (100 = 4 · 25),
   durch 2, 5, 10 an der Endziffer (10 = 2 · 5)
   p: { zahl: 7316 }
   ============================================================ */
const endstellen = {
  h: 218,
  label: (p) => `Teilbarkeit von ${p.zahl} an den Endziffern`,
  ablauf: (p) => {
    const n = p.zahl, r2 = n % 100, h = n - r2, r1 = n % 10, h1 = n - r1, ja = (t) => (n % t === 0 ? "ja" : "nein");
    return [
      { k: "zahl", ms: 900, text: `Durch 4? Durch 2, 5, 10? Dafür reicht das Ende von ${de(n)}.` },
      { k: "s4", ms: 2600, text: `${de(n)} = ${de(h)} + ${r2}. Volle Hunderter sind durch 4 teilbar: 100 = 4 · 25.` },
      { k: "c4", ms: 1400, text: r2 % 4 === 0 ? `Bleibt ${r2}: ${r2} : 4 = ${r2 / 4}, also ist ${de(n)} durch 4 teilbar.` : `Bleibt ${r2}: nicht durch 4 teilbar, also ${de(n)} auch nicht.` },
      { k: "s10", ms: 2600, text: `${de(n)} = ${de(h1)} + ${r1}. Volle Zehner sind durch 2, 5, 10 teilbar.` },
      { k: "c10", ms: 1500, text: `Bleibt ${r1}: durch 2 ${ja(2)}, durch 5 ${ja(5)}, durch 10 ${ja(10)}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const n = p.zahl, d = String(n).split(""), m = d.length, r2 = n % 100, h = n - r2, r1 = n % 10, h1 = n - r1;
    const cw = 34, x0 = B / 2 - ((m - 1) * cw) / 2;
    const u4 = teil(Z("s4"), 0, 0.45), uh4 = teil(Z("s4"), 0.5, 1), uc4 = Z("c4"), u10 = teil(Z("s10"), 0, 0.45), uh10 = teil(Z("s10"), 0.5, 1), uc10 = Z("c10");
    const xl = 92, xr = 268, ok4 = r2 % 4 === 0;
    return (
      <>
        {d.map((c, i) => {
          const end2 = i >= m - 2 && z("s4") > 0, end1 = i === m - 1 && z("s10") > 0;
          return (
            <g key={i} opacity={Z("zahl")}>
              <rect x={x0 + i * cw - 15} y={12} width={30} height={40} rx="9" fill={end1 ? F.blauHell : end2 ? F.goldHell : F.flaeche} stroke={end2 ? F.gold : "none"} strokeWidth="2" />
              <Tx x={x0 + i * cw} y={41} g={26} f={F.tinte} w={800}>{c}</Tx>
            </g>
          );
        })}
        {/* Karte durch 4 */}
        <g opacity={u4}>
          <rect x={8} y={64} width={168} height={146} rx="12" fill={F.weiss} stroke={F.gold} strokeWidth="1.6" />
          <Tx x={xl} y={84} g={11} f={F.goldDunkel} w={800}>durch 4: zwei Endziffern</Tx>
          <Tx x={xl} y={110} g={13} f={F.tinte} w={800}>{`${de(n)} = ${de(h)} + ${r2}`}</Tx>
        </g>
        <g opacity={uh4}>
          <Tx x={xl} y={134} g={11.5} f={F.grau} w={700}>{`${de(h)} = ${de(h / 100)} · 100`}</Tx>
          <Tx x={xl} y={153} g={11.5} f={F.grau} w={700}>100 = 4 · 25</Tx>
        </g>
        <Pille x={xl} y={190} o={uc4} text={ok4 ? `${r2} : 4 = ${r2 / 4} ✓` : `${r2} : 4 geht nicht ✗`} f={ok4 ? F.gruenHell : F.flaeche} tf={ok4 ? F.gruen : F.grau} g={12.5} />
        {/* Karte durch 2, 5, 10 */}
        <g opacity={u10}>
          <rect x={184} y={64} width={168} height={146} rx="12" fill={F.weiss} stroke={F.blau} strokeWidth="1.6" />
          <Tx x={xr} y={84} g={11} f={F.blau} w={800}>durch 2, 5, 10: Endziffer</Tx>
          <Tx x={xr} y={110} g={13} f={F.tinte} w={800}>{`${de(n)} = ${de(h1)} + ${r1}`}</Tx>
        </g>
        <g opacity={uh10}>
          <Tx x={xr} y={134} g={11.5} f={F.grau} w={700}>{`${de(h1)} = ${de(h1 / 10)} · 10`}</Tx>
          <Tx x={xr} y={153} g={11.5} f={F.grau} w={700}>10 = 2 · 5</Tx>
        </g>
        {[2, 5, 10].map((t, i) => {
          const ok = r1 % t === 0, x = xr - 52 + i * 52, u = staffel(uc10, i, 3, 0.5);
          return (
            <g key={t} opacity={u}>
              <rect x={x - 22} y={174} width={44} height={24} rx="12" fill={ok ? F.gruenHell : F.flaeche} />
              <Tx x={x} y={191} g={12.5} f={ok ? F.gruen : F.grau} w={800}>{`${t} ${ok ? "✓" : "✗"}`}</Tx>
            </g>
          );
        })}
      </>
    );
  },
};

/* ============================================================
   primLeiter – Primfaktorzerlegung als Leiter (fortgesetztes Teilen), dann Teilerzahl aus den Faktoren
   p: { zahl: 252 }
   ============================================================ */
const HOCH = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
const hoch = (e) => String(e).split("").map((c) => HOCH[c]).join("");
function leiterSchritte(n) { const st = []; let r = n, t = 2; while (r > 1) { if (r % t === 0) { st.push({ z: r, p: t }); r /= t; } else t++; } return st; }
function potenzListe(st) { const m = new Map(); st.forEach((s) => m.set(s.p, (m.get(s.p) || 0) + 1)); return [...m.entries()]; }
const potText = ([q, e]) => (e > 1 ? `${q}${hoch(e)}` : `${q}`);
const auswahl = ([q, e]) => Array.from({ length: e + 1 }, (_, i) => q ** i);
const primLeiter = {
  h: 242,
  label: (p) => `Primfaktorzerlegung von ${p.zahl} als Leiter und Anzahl der Teiler`,
  ablauf: (p) => {
    const st = leiterSchritte(p.zahl), pl = potenzListe(st), anz = pl.map(([, e]) => e + 1), T = anz.reduce((a, b) => a * b, 1);
    return [
      { k: "teilen", ms: 600 + st.length * 650, text: `${p.zahl} immer durch die kleinste Primzahl teilen, die passt – bis 1 bleibt.` },
      { k: "sammeln", ms: 1400, text: `Rechts stehen die Primfaktoren: ${p.zahl} = ${pl.map(potText).join(" · ")}` },
      ...pl.map((pe, j) => ({ k: `t${j}`, ms: 1200, text: `${j ? "Aus" : "Ein Teiler nimmt aus"} ${potText(pe)}: ${oderListe(auswahl(pe))} – ${pe[1] + 1} Wahlen.` })),
      { k: "anzahl", ms: 1600, text: `${anz.join(" · ")} = ${T} Kombinationen – so viele Teiler hat ${p.zahl}.` },
    ];
  },
  bild: ({ Z, p }) => {
    const st = leiterSchritte(p.zahl), pl = potenzListe(st), anz = pl.map(([, e]) => e + 1), T = anz.reduce((a, b) => a * b, 1);
    const reihen = st.length + 1, dy = Math.min(26, 140 / (reihen - 1)), yr = (i) => 38 + i * dy, yl = yr(reihen - 1);
    const XL = 106, us = Z("sammeln"), ua = Z("anzahl");
    const S = (i) => raus(staffel(Z("teilen"), i, st.length, 0.15));
    const sichtZahl = (i) => (i === 0 ? teil(Z("teilen"), 0, 0.1) : teil(S(i - 1), 0.45, 1));
    return (
      <>
        <Strich x1={XL + 8} y1={20} x2={XL + 8} y2={yl + 8} u={teil(Z("teilen"), 0, 0.2)} f={F.tinte} b={1.8} />
        {us > 0 && <rect x={XL + 13} y={20} width={30} height={yl - 20 - dy + 14} rx="7" fill={F.goldHell} opacity={us} />}
        {Array.from({ length: reihen }, (_, i) => {
          const w = i < st.length ? st[i].z : 1;
          return (
            <g key={i}>
              <Tx x={XL} y={yr(i) + 5} g={14} f={i === reihen - 1 ? F.grau : F.tinte} w={800} a="end" o={sichtZahl(i)}>{w}</Tx>
              {i < st.length && <Tx x={XL + 28} y={yr(i) + 5} g={14} f={F.goldDunkel} w={800} o={teil(S(i), 0, 0.45)}>{st[i].p}</Tx>}
            </g>
          );
        })}
        <Pille x={76} y={yl + 34} text={`${p.zahl} = ${pl.map(potText).join(" · ")}`} f={F.goldHell} tf={F.goldDunkel} g={12.5} o={us * (1 - ua)} />
        {/* Teiler zählen */}
        <Tx x={268} y={38} g={12} f={F.granat} w={800} o={Z("t0")}>Teiler zählen</Tx>
        {pl.map((pe, j) => {
          const u = Z(`t${j}`), y = 70 + j * 30;
          return (
            <g key={j} opacity={u}>
              <Tx x={186} y={y} g={11.5} f={F.grau} w={700} a="start">{`aus ${potText(pe)}:`}</Tx>
              <Tx x={234} y={y} g={13} f={F.tinte} w={800} a="start">{auswahl(pe).join(", ")}</Tx>
              <circle cx={336} cy={y - 4.5} r={11} fill={F.goldHell} stroke={F.gold} strokeWidth="1.4" />
              <Tx x={336} y={y} g={12.5} f={F.goldDunkel} w={800}>{pe[1] + 1}</Tx>
            </g>
          );
        })}
        <g opacity={ua}>
          <line x1={196} y1={70 + pl.length * 30 - 14} x2={350} y2={70 + pl.length * 30 - 14} stroke={F.linie} strokeWidth="1.4" />
          <Tx x={268} y={70 + pl.length * 30 + 8} g={16} f={F.granat} w={800}>{`${anz.join(" · ")} = ${T}`}</Tx>
          <Tx x={268} y={70 + pl.length * 30 + 26} g={10} f={F.grau} w={700}>je eine Zahl pro Zeile malnehmen</Tx>
          <Pille x={B / 2} y={232} text={`${p.zahl} = ${pl.map(potText).join(" · ")} hat ${T} Teiler`} f={F.granatTief} tf={F.goldHell} g={13} />
        </g>
      </>
    );
  },
};

/* ============================================================
   gegensinnig – 398 + 247 = 400 + 245: was der eine Summand bekommt, gibt der andere ab
   p: { a: 398, b: 247 }   (optional rund: Zielzahl für a)
   ============================================================ */
const gegensinnig = {
  h: 202,
  label: (p) => `${p.a} + ${p.b} gegensinnig verändert`,
  ablauf: (p) => {
    const rund = p.rund || Math.ceil(p.a / 100) * 100, d = rund - p.a;
    return [
      { k: "auf", ms: 1100, text: `${p.a} + ${p.b}: ${p.a} liegt knapp unter ${rund}.` },
      { k: "nimm", ms: 1600, text: `${d} von ${p.b} wegnehmen und zu ${p.a} legen.` },
      { k: "neu", ms: 1400, text: `Die Summe bleibt gleich: ${rund} + ${p.b - d}.` },
      { k: "ende", ms: 1300, text: `${rund} + ${p.b - d} = ${de(p.a + p.b)} – im Kopf ganz leicht.` },
    ];
  },
  bild: ({ Z, p }) => {
    const rund = p.rund || Math.ceil(p.a / 100) * 100, d = rund - p.a;
    const ua = Z("auf"), un = Z("nimm"), uneu = Z("neu"), ue = Z("ende"), raus1 = 1 - teil(uneu, 0, 0.45), rein = teil(uneu, 0.55, 1);
    const xa = B / 2 - 64, xb = B / 2 + 64, yT = 62;
    const X0 = 24, X1 = B - 24, PW = 18, wa = ((X1 - X0 - PW) * p.a) / (p.a + p.b - d), xs = X0 + wa, yS = 100, hS = 26;
    const hub = Math.sin(Math.PI * un) * 12;
    return (
      <>
        {/* Terme */}
        <g opacity={ua}>
          <Tx x={xa} y={yT - (1 - raus1) * 8} g={28} f={F.goldDunkel} w={800} o={raus1}>{p.a}</Tx>
          <Tx x={xb} y={yT - (1 - raus1) * 8} g={28} f={F.blau} w={800} o={raus1}>{p.b}</Tx>
          <Tx x={B / 2} y={yT} g={26} f={F.tinte} w={800}>+</Tx>
        </g>
        <Tx x={xa} y={yT + (1 - rein) * 8} g={28} f={F.goldDunkel} w={800} o={rein}>{rund}</Tx>
        <Tx x={xb} y={yT + (1 - rein) * 8} g={28} f={F.blau} w={800} o={rein}>{p.b - d}</Tx>
        <Pille x={xa} y={22} text={`+ ${d}`} f={F.goldHell} tf={F.goldDunkel} g={12} o={teil(un, 0, 0.3)} />
        <Pille x={xb} y={22} text={`− ${d}`} f={F.blauHell} tf={F.blau} g={12} o={teil(un, 0, 0.3)} />
        {/* Streifen: Gesamtlänge bleibt gleich */}
        <g opacity={ua}>
          <rect x={X0} y={yS} width={wa} height={hS} rx="4" fill={F.goldHell} stroke={F.gold} strokeWidth="1.4" />
          <rect x={xs + PW} y={yS} width={X1 - xs - PW} height={hS} rx="4" fill={F.blauHell} stroke={F.blau} strokeWidth="1.4" />
        </g>
        <g opacity={ua} transform={`translate(0 ${-hub})`}>
          <rect x={xs} y={yS} width={PW} height={hS} rx="3" fill={F.blauHell} stroke={F.blau} strokeWidth="1.4" opacity={1 - teil(un, 0.3, 0.7)} />
          <rect x={xs} y={yS} width={PW} height={hS} rx="3" fill={F.gold} stroke={F.goldDunkel} strokeWidth="1.4" opacity={teil(un, 0.3, 0.7)} />
          <Tx x={xs + PW / 2} y={yS + hS / 2 + 4} g={11} f={F.tinte} w={800}>{d}</Tx>
        </g>
        <line x1={mix(xs, xs + PW, un)} y1={yS - 7} x2={mix(xs, xs + PW, un)} y2={yS + hS + 7} stroke={F.tinte} strokeWidth="2.6" strokeLinecap="round" opacity={ua} />
        <g opacity={ua * raus1}>
          <Tx x={(X0 + xs) / 2} y={yS + hS + 22} g={13} f={F.goldDunkel} w={800}>{p.a}</Tx>
          <Tx x={(xs + X1) / 2} y={yS + hS + 22} g={13} f={F.blau} w={800}>{p.b}</Tx>
        </g>
        <g opacity={rein}>
          <Tx x={(X0 + xs + PW) / 2} y={yS + hS + 22} g={13} f={F.goldDunkel} w={800}>{rund}</Tx>
          <Tx x={(xs + PW + X1) / 2} y={yS + hS + 22} g={13} f={F.blau} w={800}>{p.b - d}</Tx>
        </g>
        <Pille x={B / 2} y={186} text={`${p.a} + ${p.b} = ${rund} + ${p.b - d} = ${de(p.a + p.b)}`} f={F.granatTief} tf={F.goldHell} g={13} o={ue} />
      </>
    );
  },
};

/* ============================================================
   rechenbaumWachsen – Rechenbaum: unten die Zahlen, jedes Rechenzeichen verbindet zwei Äste;
   ausgerechnet wird in der Reihenfolge Klammer, Punkt, Strich – der Baum wächst nach oben zusammen
   p: { term: "(12 − 4) · 3 + 18 : 6", baum: ["+", ["·", ["−", 12, 4, "k"], 3], [":", 18, 6]] }
   ============================================================ */
const rechne = (op, a, b) => (op === "+" ? a + b : op === "−" ? a - b : op === "·" ? a * b : a / b);
function baumAuf(t) {
  const blaetter = [], knoten = [];
  const geh = (s) => {
    if (!Array.isArray(s)) { const o = { blatt: true, w: s, i: blaetter.length, h: 0, links: blaetter.length }; blaetter.push(o); return o; }
    const l = geh(s[1]), r = geh(s[2]);
    const o = { op: s[0], l, r, w: rechne(s[0], l.w, r.w), k: s[3] === "k", h: 1 + Math.max(l.h, r.h), links: l.links };
    knoten.push(o); return o;
  };
  const wurzel = geh(t);
  const rang = (n) => (n.k ? 0 : n.op === "·" || n.op === ":" ? 1 : 2);
  const folge = [], fertig = new Set();
  const bereit = (n) => (n.l.blatt || fertig.has(n.l)) && (n.r.blatt || fertig.has(n.r));
  while (folge.length < knoten.length) {
    const kand = knoten.filter((n) => !fertig.has(n) && bereit(n)).sort((a, b) => rang(a) - rang(b) || a.links - b.links);
    folge.push(kand[0]); fertig.add(kand[0]);
  }
  folge.forEach((n, i) => { n.nr = i; n.rang = rang(n); });
  return { blaetter, knoten, wurzel, folge };
}
const VORSATZ = ["Klammer zuerst: ", "Punkt vor Strich: ", "Strich zuletzt: "];
const rechenbaumWachsen = {
  h: 212,
  label: (p) => `Rechenbaum für ${p.term}`,
  ablauf: (p) => {
    const { folge, wurzel } = baumAuf(p.baum), gesehen = new Set();
    return [
      { k: "term", ms: 1000, text: `${p.term}: unten stehen die Zahlen.` },
      { k: "bau", ms: 1400, text: "Jedes Rechenzeichen verbindet zwei Äste." },
      ...folge.map((n, i) => {
        const v = gesehen.has(n.rang) ? "" : VORSATZ[n.rang]; gesehen.add(n.rang);
        return { k: `e${i}`, ms: 1300, text: `${v}${de(n.l.w)} ${n.op} ${de(n.r.w)} = ${de(n.w)}` };
      }),
      { k: "ende", ms: 1100, text: `Oben steht das Ergebnis: ${p.term} = ${de(wurzel.w)}` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const { blaetter, knoten, wurzel } = baumAuf(p.baum), nb = blaetter.length, H = wurzel.h;
    const yB = 190, dy = Math.min(46, 130 / H);
    blaetter.forEach((b) => { b.x = 40 + (b.i * (B - 80)) / Math.max(1, nb - 1); b.y = yB; });
    const setze = (n) => { if (n.blatt) return n.x; n.x = (setze(n.l) + setze(n.r)) / 2; n.y = yB - n.h * dy; return n.x; };
    setze(wurzel);
    const ut = Z("term"), ub = Z("bau"), ue = Z("ende");
    const ebene = (h) => staffel(ub, h - 1, H, 0.3);
    return (
      <>
        <text x={B / 2} y={24} textAnchor="middle" fontSize="15" fontWeight="800" style={SCHRIFT} fill={F.tinte} opacity={ut}>
          {p.term}<tspan fill={F.granat} opacity={ue}>{` = ${de(wurzel.w)}`}</tspan>
        </text>
        {knoten.map((n, i) => {
          const u = ebene(n.h);
          return (
            <g key={`k${i}`}>
              {[n.l, n.r].map((c, j) => <Strich key={j} x1={c.x} y1={c.y - 13} x2={n.x} y2={n.y + 11} u={u} f={F.hell} b={1.6} />)}
            </g>
          );
        })}
        {blaetter.map((b, i) => <Kasten key={`b${i}`} x={b.x - 18} y={b.y - 13} w={36} h={26} text={de(b.w)} g={14} o={staffel(ut, i, nb, 0.5)} rand={F.hell} />)}
        {knoten.map((n, i) => {
          const u = Z(`e${n.nr}`), uk = teil(u, 0.35, 0.8), sicht = ebene(n.h), wurz = n === wurzel;
          const cx = mix(n.x, n.x - 31, raus(uk)), r = mix(11, 8, uk);
          const akt = z(`e${n.nr}`) > 0 && z(`e${n.nr}`) < 1;
          return (
            <g key={`n${i}`}>
              {akt && <Puls x={n.x} y={n.y} u={teil(u, 0, 0.7)} r={20} f={F.gold} />}
              {akt && [n.l, n.r].map((c, j) => <rect key={j} x={c.x - 21} y={c.y - 15} width={42} height={30} rx="9" fill="none" stroke={F.gold} strokeWidth="2.2" />)}
              <Kasten x={n.x - 20} y={n.y - 13} w={40} h={26} text={de(n.w)} g={14} o={uk} s={mix(0.6, 1, federnd(uk))}
                f={wurz ? F.granatTief : F.weiss} rand={wurz ? F.granat : F.gold} tf={wurz ? F.goldHell : F.tinte} />
              <g opacity={sicht}>
                <circle cx={cx} cy={n.y} r={r} fill={F.goldHell} stroke={F.gold} strokeWidth="1.4" />
                <Tx x={cx} y={n.y + r * 0.42} g={r * 1.3} f={F.goldDunkel} w={800}>{n.op}</Tx>
              </g>
            </g>
          );
        })}
      </>
    );
  },
};

export const SZENEN_ZWEIT_RECHNEN = { flaechenMal, buendelTeilen, endstellen, primLeiter, gegensinnig, rechenbaumWachsen };
