/* ============================================================
   Zusätzliche Szenen (Präfix x_): Sieb des Eratosthenes, Prozentrechnung (Prozentwert, Grundwert, Rabatt,
   Zinseszins) für die Unterstufen-Werkzeuge sowie zweite Animationen für Geometrie-Einheiten
   (vergrößernder Maßstab, Geraden durch Punkte, Koordinaten ablesen, Falten an der Achse, Treppenfigur).
   Vertrag siehe kern.jsx. Registriert in funcUnterstufeMotion.jsx.
   ============================================================ */
import React from "react";
import { B, F, Tx, Strich, Pfeil, Kasten, Puls, Pille, Tippen, breite, de, mix, klemm, teil, staffel, raus, federnd, sanft } from "./kern.jsx";

const HOCH = { 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", 10: "¹⁰" };
const euro = (v) => `${de(Math.round(v * 100) / 100, Number.isInteger(Math.round(v * 100) / 100) ? 0 : 2)} €`;

/* ============================================================
   x_sieb – Sieb des Eratosthenes: Vielfache von 2, 3, 5, 7 streichen, übrig bleiben die Primzahlen
   p: { bis: 50 }
   ============================================================ */
const istPrim = (n) => { if (n < 2) return false; for (let t = 2; t * t <= n; t++) if (n % t === 0) return false; return true; };
const SIEB_FARBE = { 2: F.blau, 3: F.gold, 5: F.gruen, 7: F.rosa };
const x_sieb = {
  h: 236,
  label: (p) => `Sieb des Eratosthenes bis ${p.bis}`,
  ablauf: (p) => {
    const tt = [2, 3, 5, 7].filter((t) => t * t <= p.bis);
    return [
      { k: "zahlen", ms: 900, text: `Alle Zahlen von 1 bis ${p.bis}. Die 1 ist keine Primzahl.` },
      ...tt.map((t) => ({ k: `t${t}`, ms: 1300, text: `${t} bleibt – alle anderen Vielfachen von ${t} werden gestrichen.` })),
      { k: "rest", ms: 1500, text: `Übrig bleiben die Primzahlen: ${Array.from({ length: p.bis }, (_, i) => i + 1).filter(istPrim).length} Stück bis ${p.bis}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const sp = 10, zeilen = Math.ceil(p.bis / sp), w = 32, hz = Math.min(36, 184 / zeilen), x0 = (B - sp * w) / 2, y0 = 16;
    const tt = [2, 3, 5, 7].filter((t) => t * t <= p.bis);
    const ur = Z("rest");
    return (
      <>
        {Array.from({ length: p.bis }, (_, i) => {
          const n = i + 1, r = Math.floor(i / sp), c = i % sp, x = x0 + c * w, y = y0 + r * hz;
          const u0 = staffel(Z("zahlen"), i, p.bis, 0.9);
          const teiler = tt.find((t) => n !== t && n % t === 0);
          const uStr = teiler ? staffel(z(`t${teiler}`), Math.floor(n / teiler) - 2, Math.floor(p.bis / teiler) - 1, 0.7) : 0;
          const prim = istPrim(n), eins = n === 1;
          const ganz = tt.some((t) => t === n) && Z(`t${n}`) > 0;
          return (
            <g key={n} opacity={u0}>
              <rect x={x + 2} y={y + 2} width={w - 4} height={hz - 4} rx="7"
                fill={prim && (ur > 0 || ganz) ? (ur > 0.3 ? F.granat : F.granatHell) : F.flaeche} stroke={ganz ? SIEB_FARBE[n] : "none"} strokeWidth="2" />
              <Tx x={x + w / 2} y={y + hz / 2 + 4.5} g={12} f={prim && ur > 0.3 ? F.weiss : uStr > 0.5 || eins ? F.hell : F.tinte} w={800}>{n}</Tx>
              {teiler && uStr > 0 && <line x1={x + 6} y1={y + hz - 8} x2={mix(x + 6, x + w - 6, uStr)} y2={mix(y + hz - 8, y + 8, uStr)} stroke={SIEB_FARBE[teiler]} strokeWidth="2.4" strokeLinecap="round" />}
              {eins && Z("zahlen") > 0.9 && <line x1={x + 6} y1={y + hz - 8} x2={x + w - 6} y2={y + 8} stroke={F.hell} strokeWidth="2" strokeLinecap="round" />}
            </g>
          );
        })}
        <g opacity={ur}>
          <Tx x={x0} y={y0 + zeilen * hz + 14} g={10} f={F.grau} w={700} a="start">Gestrichen:</Tx>
          {tt.map((t, i) => (
            <g key={t}>
              <rect x={x0 + 70 + i * 62} y={y0 + zeilen * hz + 8} width={12} height={4} rx="2" fill={SIEB_FARBE[t]} />
              <Tx x={x0 + 70 + i * 62 + 16} y={y0 + zeilen * hz + 14} g={10} f={F.grau} w={700} a="start">{`von ${t}`}</Tx>
            </g>
          ))}
        </g>
      </>
    );
  },
};

/* ============================================================
   x_prozentwert – Prozentstreifen: Grundwert = 100 %, 1 % bzw. 10 %, dann der gesuchte Anteil
   p: { G: 80, p: 35, einheit: "€" }
   ============================================================ */
const x_prozentwert = {
  h: 200,
  label: (p) => `${p.p} % von ${p.G} ${p.einheit || ""}`,
  ablauf: (p) => [
    { k: "streifen", ms: 1000, text: `Der ganze Streifen ist der Grundwert: ${de(p.G)} ${p.einheit || ""} = 100 %.` },
    { k: "zehntel", ms: 1300, text: `In 10 gleiche Teile: 10 % sind ${de(p.G / 10)} ${p.einheit || ""}.` },
    { k: "fuellen", ms: 1500, text: `${p.p} % sind ${de(p.p / 10)}-mal so viel: ${de(p.G / 10)} · ${de(p.p / 10)}` },
    { k: "ergebnis", ms: 1200, text: `Prozentwert: ${p.p} % von ${de(p.G)} ${p.einheit || ""} = ${de((p.G * p.p) / 100)} ${p.einheit || ""}` },
  ],
  bild: ({ Z, p }) => {
    const x0 = 24, W = B - 48, y = 70, h = 40, uf = Z("fuellen"), uz = Z("zehntel");
    const pw = (p.G * p.p) / 100, e = p.einheit ? ` ${p.einheit}` : "";
    return (
      <>
        <rect x={x0} y={y} width={W * Z("streifen")} height={h} rx="8" fill={F.flaeche} stroke={F.tinte} strokeWidth="1.6" />
        <rect x={x0} y={y} width={W * (p.p / 100) * uf} height={h} rx="8" fill={F.gold} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={x0 + ((i + 1) * W) / 10} y1={y} x2={x0 + ((i + 1) * W) / 10} y2={y + h} stroke={F.tinte} strokeWidth="1" opacity={staffel(uz, i, 9, 0.6) * 0.6} />)}
        <g opacity={Z("streifen")}>
          <Tx x={x0} y={y - 12} g={11} f={F.grau} w={800} a="start">0 %</Tx>
          <Tx x={x0 + W} y={y - 12} g={11} f={F.grau} w={800} a="end">100 %</Tx>
          <Tx x={x0} y={y + h + 20} g={11} f={F.grau} w={800} a="start">{`0${e}`}</Tx>
          <Tx x={x0 + W} y={y + h + 20} g={12} f={F.tinte} w={800} a="end">{`${de(p.G)}${e}`}</Tx>
        </g>
        <g opacity={uz}>
          <path d={`M${x0} ${y + h + 30} v6 h${W / 10} v-6`} fill="none" stroke={F.blau} strokeWidth="1.6" />
          <Tx x={x0 + W / 20} y={y + h + 50} g={10.5} f={F.blau} w={800}>{`10 % = ${de(p.G / 10)}${e}`}</Tx>
        </g>
        <g opacity={teil(uf, 0.6, 1)}>
          <Tx x={x0 + W * (p.p / 100)} y={y - 12} g={12} f={F.granat} w={800}>{`${p.p} %`}</Tx>
          <line x1={x0 + W * (p.p / 100)} y1={y - 6} x2={x0 + W * (p.p / 100)} y2={y + h + 6} stroke={F.granat} strokeWidth="2" />
        </g>
        <g opacity={Z("ergebnis")}>
          <Pille x={B / 2} y={184} text={`${p.p} % von ${de(p.G)}${e} = ${de(pw)}${e}`} f={F.granatTief} tf={F.goldHell} g={13} />
        </g>
      </>
    );
  },
};

/* ============================================================
   x_grundwert – rückwärts: p % sind W → 1 % → 100 % (Dreisatz im Prozentstreifen)
   p: { p: 30, W: 24, einheit: "Schüler" }
   ============================================================ */
const x_grundwert = {
  h: 214,
  label: (p) => `${p.p} % sind ${p.W} – wie viel sind 100 %?`,
  ablauf: (p) => [
    { k: "teil", ms: 1200, text: `Bekannt: ${p.p} % sind ${de(p.W)} ${p.einheit || ""}. Gesucht ist das Ganze.` },
    { k: "eins", ms: 1400, text: `1 % ist der ${p.p}. Teil: ${de(p.W)} : ${p.p} = ${de(p.W / p.p)}` },
    { k: "ganz", ms: 1500, text: `100 % sind hundertmal so viel: ${de(p.W / p.p)} · 100 = ${de((p.W / p.p) * 100)}` },
  ],
  bild: ({ Z, p }) => {
    const G = (p.W / p.p) * 100, x0 = 24, W = B - 48, y = 58, h = 36, ut = Z("teil"), ue = Z("eins"), ug = Z("ganz");
    const e = p.einheit ? ` ${p.einheit}` : "";
    const zeile = (y, a, b, f, o) => (
      <g opacity={o}>
        <Tx x={70} y={y} g={14} f={f} w={800} a="end">{a}</Tx>
        <Tx x={92} y={y} g={14} f={F.grau} w={700}>≙</Tx>
        <Tx x={114} y={y} g={14} f={f} w={800} a="start">{b}</Tx>
      </g>
    );
    return (
      <>
        <rect x={x0} y={y} width={W} height={h} rx="8" fill={F.flaeche} stroke={F.linie} strokeWidth="1.4" strokeDasharray={ug > 0 ? "none" : "5 4"} />
        <rect x={x0} y={y} width={W * (p.p / 100) * ut} height={h} rx="8" fill={F.gold} />
        <rect x={x0} y={y} width={W * ug} height={h} rx="8" fill="none" stroke={F.granat} strokeWidth="2.4" />
        <Tx x={x0 + (W * p.p) / 200} y={y + h / 2 + 5} g={12} f={F.granatTief} w={800} opacity={ut}>{`${p.p} %`}</Tx>
        <Tx x={x0 + W - 8} y={y + h / 2 + 5} g={12} f={F.granat} w={800} a="end" opacity={ug}>100 %</Tx>
        {zeile(132, `${p.p} %`, `${de(p.W)}${e}`, F.goldDunkel, ut)}
        {zeile(160, "1 %", de(p.W / p.p), F.blau, ue)}
        {zeile(188, "100 %", `${de(G)}${e}`, F.granat, ug)}
        <g opacity={ue}><Tx x={300} y={148} g={11} f={F.blau} w={800}>{`: ${p.p}`}</Tx><Pfeil x1={286} y1={134} x2={286} y2={156} f={F.blau} b={1.6} u={ue} /></g>
        <g opacity={ug}><Tx x={300} y={176} g={11} f={F.granat} w={800}>· 100</Tx><Pfeil x1={286} y1={162} x2={286} y2={184} f={F.granat} b={1.6} u={ug} /></g>
      </>
    );
  },
};

/* ============================================================
   x_rabatt – Rabatt abziehen bzw. Mehrwertsteuer aufschlagen: Streifen schrumpft/wächst
   p: { G: 60, p: 20, art: "rabatt" | "mwst" }
   ============================================================ */
const x_rabatt = {
  h: 196,
  label: (p) => (p.art === "mwst" ? `${p.p} % Mehrwertsteuer auf ${p.G} €` : `${p.p} % Rabatt auf ${p.G} €`),
  ablauf: (p) => {
    const d = (p.G * p.p) / 100, neu = p.art === "mwst" ? p.G + d : p.G - d;
    return [
      { k: "preis", ms: 1000, text: `Der Preis: ${euro(p.G)} sind 100 %.` },
      { k: "anteil", ms: 1400, text: p.art === "mwst" ? `Dazu kommen ${p.p} %: ${euro(d)}.` : `${p.p} % Rabatt: ${euro(d)} gehen weg.` },
      { k: "neu", ms: 1300, text: `Neuer Preis: ${euro(neu)} – das sind ${p.art === "mwst" ? 100 + p.p : 100 - p.p} % vom alten.` },
      { k: "kurz", ms: 1200, text: p.art === "mwst" ? `Kurz: ${euro(p.G)} · ${de(1 + p.p / 100)} = ${euro(neu)}` : `Kurz: ${euro(p.G)} · ${de(1 - p.p / 100)} = ${euro(neu)}` },
    ];
  },
  bild: ({ Z, p }) => {
    const mw = p.art === "mwst", d = (p.G * p.p) / 100, neu = mw ? p.G + d : p.G - d;
    const sk = (B - 60) / (mw ? 100 + p.p : 100), x0 = 24, y = 64, h = 40;
    const ua = Z("anteil"), un = Z("neu");
    const w100 = 100 * sk, wd = p.p * sk;
    return (
      <>
        <rect x={x0} y={y} width={(mw ? w100 : w100 - wd * teil(ua, 0.5, 1)) * Z("preis")} height={h} rx="8" fill={F.goldHell} stroke={F.gold} strokeWidth="1.6" />
        <Tx x={x0 + (mw ? w100 : w100 - wd) / 2} y={y + h / 2 + 5} g={13} f={F.goldDunkel} w={800} opacity={Z("preis")}>{!mw && ua > 0.6 ? euro(neu) : `${euro(p.G)} = 100 %`}</Tx>
        {mw ? (
          <g opacity={ua} transform={`translate(${(1 - raus(ua)) * 30} 0)`}>
            <rect x={x0 + w100} y={y} width={wd} height={h} rx="6" fill={F.blau} />
            <Tx x={x0 + w100 + wd / 2} y={y - 10} g={11} f={F.blau} w={800}>{`+ ${p.p} %`}</Tx>
          </g>
        ) : (
          <g opacity={1 - teil(ua, 0.6, 1) * 0.65} transform={`translate(${raus(ua) * 14} ${raus(ua) * -8})`}>
            <rect x={x0 + w100 - wd} y={y} width={wd} height={h} rx="6" fill={F.rosa} stroke={F.granat} strokeWidth="1.6" strokeDasharray="4 3" opacity={ua > 0 ? 1 : 0} />
            <Tx x={x0 + w100 - wd / 2} y={y - 10} g={11} f={F.granat} w={800} opacity={ua}>{`− ${p.p} %`}</Tx>
          </g>
        )}
        <g opacity={un}>
          <path d={`M${x0} ${y + h + 10} v6 h${mw ? w100 + wd : w100 - wd} v-6`} fill="none" stroke={F.granat} strokeWidth="2" />
          <Tx x={x0 + (mw ? w100 + wd : w100 - wd) / 2} y={y + h + 34} g={13} f={F.granat} w={800}>{`${euro(neu)} = ${mw ? 100 + p.p : 100 - p.p} %`}</Tx>
        </g>
        <g opacity={Z("kurz")}>
          <Pille x={B / 2} y={182} text={`${euro(p.G)} · ${de(mw ? 1 + p.p / 100 : 1 - p.p / 100)} = ${euro(neu)}`} f={F.granatTief} tf={F.goldHell} g={13} />
        </g>
      </>
    );
  },
};

/* ============================================================
   x_zinseszins – Kapital wächst Jahr für Jahr um p % (Zinsen werden mitverzinst)
   p: { K: 1000, p: 5, n: 3 }
   ============================================================ */
const x_zinseszins = {
  h: 214,
  label: (p) => `${p.K} € mit ${p.p} % Zinseszins über ${p.n} Jahre`,
  ablauf: (p) => {
    let k = p.K;
    return [
      { k: "start", ms: 900, text: `Startkapital ${euro(p.K)}.` },
      ...Array.from({ length: p.n }, (_, i) => { const z = (k * p.p) / 100; k += z; return { k: `j${i}`, ms: p.n > 4 ? 750 : 1300, text: `Jahr ${i + 1}: ${p.p} % Zinsen = ${euro(z)} → ${euro(k)}` }; }),
      { k: "ende", ms: 1300, text: `Die Zinsen wachsen mit: ${euro(p.K)} · ${de(1 + p.p / 100)}${HOCH[p.n] || "^" + p.n} ≈ ${euro(p.K * Math.pow(1 + p.p / 100, p.n))}` },
    ];
  },
  bild: ({ Z, p }) => {
    const ks = [p.K]; for (let i = 0; i < p.n; i++) ks.push(ks[i] * (1 + p.p / 100));
    const max = ks[p.n], hmax = 130, yb = 176, sw = Math.min(64, (B - 60) / (p.n + 1)), gap = ((B - 40) - sw * (p.n + 1)) / p.n;
    const jahrText = p.n > 4;
    return (
      <>
        <Strich x1={16} y1={yb} x2={B - 16} y2={yb} u={Z("start")} b={1.6} />
        {ks.map((k, i) => {
          const u = i === 0 ? Z("start", raus) : Z(`j${i - 1}`, raus), x = 20 + i * (sw + gap);
          const basis = i === 0 ? k : ks[i - 1], hb = (basis / max) * hmax, hk = (k / max) * hmax;
          return (
            <g key={i} opacity={u > 0 ? 1 : 0}>
              <rect x={x} y={yb - hb * (i === 0 ? u : 1)} width={sw} height={hb * (i === 0 ? u : 1)} rx="5" fill={F.goldHell} stroke={F.gold} strokeWidth="1.4" />
              {i > 0 && <rect x={x} y={yb - hb - (hk - hb) * u} width={sw} height={(hk - hb) * u} rx="3" fill={F.granat} />}
              {(p.n <= 4 || i % 2 === 0 || i === p.n) && <Tx x={x + sw / 2} y={yb - hk - 8} g={p.n > 4 ? 9.5 : 10.5} f={F.tinte} w={800} opacity={teil(u, 0.6, 1)}>{p.n > 4 ? de(Math.round(k)) : euro(k)}</Tx>}
              <Tx x={x + sw / 2} y={yb + 16} g={10} f={F.grau} w={700}>{i === 0 ? "Start" : p.n > 4 ? i : `Jahr ${i}`}</Tx>
            </g>
          );
        })}
        <g opacity={Z("ende")}>
          <rect x={B - 112} y={16} width={10} height={10} rx="2" fill={F.granat} />
          <Tx x={B - 96} y={25} g={10} f={F.grau} w={700} a="start">Zinsen des Jahres</Tx>
          {jahrText && <Tx x={20} y={25} g={10} f={F.grau} w={700} a="start">Kapital in € nach … Jahren</Tx>}
        </g>
      </>
    );
  },
};

/* ============================================================
   x_massstabGross – vergrößernder Maßstab (z. B. 5 : 1): Bild größer als die Wirklichkeit
   p: { n: 5, mm: 8, ding: "Ameise" }
   ============================================================ */
const x_massstabGross = {
  h: 206,
  label: (p) => `Maßstab ${p.n} : 1`,
  ablauf: (p) => [
    { k: "echt", ms: 1100, text: `Der ${p.ding} ist in Wirklichkeit ${p.mm} mm lang.` },
    { k: "gross", ms: 1700, text: `Maßstab ${p.n} : 1 heißt: Im Bild ist alles ${p.n}-mal so groß.` },
    { k: "rechnen", ms: 1300, text: `${p.mm} mm · ${p.n} = ${p.mm * p.n} mm = ${de((p.mm * p.n) / 10)} cm im Bild.` },
  ],
  bild: ({ Z, p }) => {
    const ue = Z("echt"), ug = Z("gross", federnd), us = Z("gross"), ur = Z("rechnen");
    const l0 = 26, l1 = Math.min(150, l0 * p.n), lg = mix(l0, l1, klemm(ug, 0, 1.04));
    /* Marienkäfer von oben, Länge l (Kopf links) */
    const kaefer = (x, y, l) => {
      const r = l * 0.42, cx = x + l * 0.58;
      return (
        <g>
          <circle cx={x + l * 0.14} cy={y} r={l * 0.16} fill={F.tinte} />
          <circle cx={cx} cy={y} r={r} fill={F.granat} />
          <line x1={cx - r} y1={y} x2={cx + r} y2={y} stroke={F.tinte} strokeWidth={Math.max(1, l / 40)} />
          {[[-0.35, -0.45], [0.3, -0.5], [-0.3, 0.45], [0.35, 0.5], [0.05, -0.15], [0.05, 0.15]].map(([dx, dy], i) => <circle key={i} cx={cx + dx * r} cy={y + dy * r} r={r * 0.16} fill={F.tinte} />)}
        </g>
      );
    };
    const yb = 112, kb = (l) => yb + l * 0.42 + 10;
    return (
      <>
        <g opacity={ue}>
          <Tx x={30} y={60} g={11} f={F.grau} w={700} a="start">Wirklichkeit</Tx>
          {kaefer(30, yb, l0)}
          <path d={`M30 ${kb(l0)} v5 h${l0} v-5`} fill="none" stroke={F.blau} strokeWidth="1.4" />
          <Tx x={30 + l0 / 2} y={kb(l0) + 20} g={10.5} f={F.blau} w={800}>{`${p.mm} mm`}</Tx>
        </g>
        <g opacity={teil(us, 0, 0.15)}>
          <Tx x={176} y={28} g={11} f={F.grau} w={700} a="start">{`Bild (${p.n} : 1)`}</Tx>
          {kaefer(176, yb, lg)}
          <path d={`M176 ${kb(lg)} v5 h${lg} v-5`} fill="none" stroke={F.granat} strokeWidth="1.6" />
          <Tx x={176 + lg / 2} y={kb(lg) + 21} g={11.5} f={F.granat} w={800} opacity={ur}>{`${p.mm * p.n} mm`}</Tx>
        </g>
        <g opacity={teil(us, 0, 0.3)}>
          <Pfeil x1={74} y1={yb} x2={160} y2={yb} f={F.granat} b={2} u={teil(ug, 0, 0.6)} />
          <Pille x={117} y={yb - 18} text={`· ${p.n}`} g={13} f={F.granatHell} tf={F.granat} />
        </g>
      </>
    );
  },
};

/* ============================================================
   x_geradenPunkte – durch einen Punkt gehen unendlich viele Geraden, durch zwei genau eine
   ============================================================ */
const x_geradenPunkte = {
  h: 196,
  label: () => "Geraden durch einen und durch zwei Punkte",
  ablauf: () => [
    { k: "punkt", ms: 800, text: "Ein Punkt P." },
    { k: "drehen", ms: 2400, text: "Durch P passen unendlich viele Geraden – sie lässt sich drehen." },
    { k: "zweiter", ms: 1000, text: "Jetzt kommt ein zweiter Punkt Q dazu." },
    { k: "fest", ms: 1400, text: "Durch P und Q geht genau eine Gerade. Zwischen P und Q liegt die Strecke PQ." },
  ],
  bild: ({ Z, p }) => {
    const P = [130, 120], Q = [250, 70], wQ = Math.atan2(-(Q[1] - P[1]), Q[0] - P[0]);
    const ud = Z("drehen", (u) => u), uz = Z("zweiter"), uf = Z("fest");
    const w = mix(-0.4, 2.6, ud) * (uf > 0 ? 1 - uf : 1) + wQ * uf;
    const L = 220, gerade = (ww, o, f, b) => <line x1={P[0] - Math.cos(ww) * L} y1={P[1] + Math.sin(ww) * L} x2={P[0] + Math.cos(ww) * L} y2={P[1] - Math.sin(ww) * L} stroke={f} strokeWidth={b} opacity={o} strokeLinecap="round" />;
    return (
      <>
        {ud > 0 && [0.2, 0.45, 0.7, 0.95].map((s, i) => ud > s && gerade(mix(-0.4, 2.6, s), (1 - uf) * 0.25, F.hell, 1.4))}
        {ud > 0 && gerade(w, 1, uf > 0.5 ? F.granat : F.blau, 2)}
        {uf > 0.6 && <line x1={P[0]} y1={P[1]} x2={Q[0]} y2={Q[1]} stroke={F.gold} strokeWidth="5" strokeLinecap="round" opacity={teil(uf, 0.6, 1)} />}
        <circle cx={P[0]} cy={P[1]} r={5} fill={F.tinte} opacity={Z("punkt")} />
        <Tx x={P[0] - 4} y={P[1] + 22} g={13} f={F.tinte} w={800} opacity={Z("punkt")}>P</Tx>
        <g opacity={uz} transform={`translate(0 ${(1 - raus(uz)) * -14})`}>
          <circle cx={Q[0]} cy={Q[1]} r={5} fill={F.tinte} />
          <Tx x={Q[0] + 4} y={Q[1] + 22} g={13} f={F.tinte} w={800}>Q</Tx>
        </g>
        <Pille x={B / 2} y={186} text="genau eine Gerade durch P und Q" o={teil(uf, 0.5, 1)} f={F.granatHell} tf={F.granat} />
      </>
    );
  },
};

/* ============================================================
   x_ablesen – Koordinaten ablesen: vom Punkt senkrecht zur x-Achse, waagrecht zur y-Achse
   p: { punkte: [["P", 4, 3], ["Q", 1, 5], ["R", 6, 0]] }
   ============================================================ */
const koord = (x, y) => `(${x} | ${y})`;
const x_ablesen = {
  h: 216,
  label: (p) => "Koordinaten ablesen: " + p.punkte.map(([n, x, y]) => n + koord(x, y)).join(", "),
  ablauf: (p) => [
    { k: "achsen", ms: 700, text: "Gegeben sind Punkte – wo liegen sie genau?" },
    ...p.punkte.map(([n, x, y], i) => ({ k: `p${i}`, ms: 1700, text: y === 0 ? `${n} liegt auf der x-Achse: ${n}${koord(x, y)}.` : x === 0 ? `${n} liegt auf der y-Achse: ${n}${koord(x, y)}.` : `${n}: hinunter zur x-Achse → ${x}, hinüber zur y-Achse → ${y}. Also ${n}${koord(x, y)}.` })),
  ],
  bild: ({ Z, p }) => {
    const s = 30, ox = 40, oy = 184, X = (v) => ox + v * s, Y = (v) => oy - v * s, ua = Z("achsen");
    return (
      <>
        <g opacity={ua}>
          {Array.from({ length: 7 }, (_, i) => <line key={`v${i}`} x1={X(i)} y1={Y(0)} x2={X(i)} y2={Y(5)} stroke={F.linie} strokeWidth="1" />)}
          {Array.from({ length: 6 }, (_, i) => <line key={`h${i}`} x1={X(0)} y1={Y(i)} x2={X(6)} y2={Y(i)} stroke={F.linie} strokeWidth="1" />)}
          <Pfeil x1={X(0)} y1={Y(0)} x2={X(6) + 14} y2={Y(0)} b={1.6} />
          <Pfeil x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(5) - 14} b={1.6} />
          {Array.from({ length: 7 }, (_, i) => <Tx key={`x${i}`} x={X(i)} y={Y(0) + 16} g={10} f={F.grau} w={700}>{i}</Tx>)}
          {Array.from({ length: 5 }, (_, i) => <Tx key={`y${i}`} x={X(0) - 10} y={Y(i + 1) + 4} g={10} f={F.grau} w={700}>{i + 1}</Tx>)}
          {p.punkte.map(([n, x, y]) => (
            <g key={n}><circle cx={X(x)} cy={Y(y)} r={5} fill={F.granat} /><Tx x={X(x) + 10} y={Y(y) - 7} g={12} f={F.granat} w={800} a="start">{n}</Tx></g>
          ))}
        </g>
        {p.punkte.map(([n, x, y], i) => {
          const u = Z(`p${i}`), ux = teil(u, 0, 0.45), uy = teil(u, 0.45, 0.9);
          return u > 0 && (
            <g key={n}>
              {y !== 0 && <line x1={X(x)} y1={Y(y)} x2={X(x)} y2={mix(Y(y), Y(0), ux)} stroke={F.blau} strokeWidth="2" strokeDasharray="4 3" />}
              {x !== 0 && <line x1={X(x)} y1={Y(y)} x2={mix(X(x), X(0), uy)} y2={Y(y)} stroke={F.gold} strokeWidth="2" strokeDasharray="4 3" />}
              {ux > 0.95 && <circle cx={X(x)} cy={Y(0)} r={4} fill={F.blau} />}
              {uy > 0.95 && <circle cx={X(0)} cy={Y(y)} r={4} fill={F.gold} />}
              <Tx x={258} y={44 + i * 28} g={14} f={F.granat} w={800} a="start" opacity={teil(u, 0.85, 1)}>{`${n}${koord(x, y)}`}</Tx>
            </g>
          );
        })}
      </>
    );
  },
};

/* ============================================================
   x_falten – Achsensymmetrie durch Falten: die Hälfte klappt um die Achse und deckt sich genau
   ============================================================ */
const x_falten = {
  h: 200,
  label: () => "Achsensymmetrie durch Falten",
  ablauf: () => [
    { k: "haelfte", ms: 1100, text: "Eine halbe Figur und eine Faltachse." },
    { k: "falten", ms: 1900, text: "Am Faltknick umklappen …" },
    { k: "fertig", ms: 1300, text: "… die beiden Hälften liegen genau aufeinander: die Figur ist achsensymmetrisch." },
    { k: "abstand", ms: 1300, text: "Jeder Punkt und sein Spiegelpunkt sind gleich weit von der Achse entfernt." },
  ],
  bild: ({ Z }) => {
    const ax = 180, half = [[ax, 30], [ax - 50, 54], [ax - 92, 44], [ax - 70, 104], [ax - 104, 160], [ax - 30, 136], [ax, 170]];
    const uf = Z("falten"), uh = Z("haelfte"), ua = Z("abstand");
    const sx = Math.cos(Math.PI * uf);   // 1 → −1
    const geklappt = half.map(([x, y]) => [ax + (x - ax) * sx, y]);
    const pts = (l) => l.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const P = half[2], Pp = [2 * ax - P[0], P[1]];
    return (
      <>
        <line x1={ax} y1={14} x2={ax} y2={186} stroke={F.blau} strokeWidth="2" strokeDasharray="6 4" opacity={uh} />
        <polygon points={pts(half)} fill={F.granatHell} stroke={F.granat} strokeWidth="2" strokeLinejoin="round" opacity={uh} />
        {uf > 0 && <polygon points={pts(geklappt)} fill={uf > 0.5 ? F.goldHell : F.rosa} stroke={F.gold} strokeWidth="2" strokeLinejoin="round" opacity={0.85} />}
        <g opacity={ua}>
          <circle cx={P[0]} cy={P[1]} r={4.5} fill={F.granat} /><circle cx={Pp[0]} cy={Pp[1]} r={4.5} fill={F.goldDunkel} />
          <Tx x={P[0] - 10} y={P[1] - 8} g={12} f={F.granat} w={800}>P</Tx><Tx x={Pp[0] + 12} y={Pp[1] - 8} g={12} f={F.goldDunkel} w={800}>P′</Tx>
          <line x1={P[0]} y1={P[1]} x2={Pp[0]} y2={Pp[1]} stroke={F.tinte} strokeWidth="1.2" strokeDasharray="3 3" />
          <Tx x={(P[0] + ax) / 2} y={P[1] + 16} g={11} f={F.tinte} w={800}>a</Tx><Tx x={(Pp[0] + ax) / 2} y={P[1] + 16} g={11} f={F.tinte} w={800}>a</Tx>
        </g>
        <Pille x={300} y={100} text="Faltachse" g={11} f={F.blauHell} tf={F.blau} o={uh} />
      </>
    );
  },
};

/* ============================================================
   x_treppe – Treppenfigur in drei Rechtecke zerlegen und Flächen addieren
   p: { stufen: [[6, 2], [4, 2], [2, 2]] }  (Breite, Höhe je Stufe von unten, linksbündig)
   ============================================================ */
const x_treppe = {
  h: 216,
  label: () => "Treppenfigur zerlegen",
  ablauf: (p) => [
    { k: "figur", ms: 1000, text: "Eine Treppenfigur – keine Formel passt direkt." },
    ...p.stufen.map(([b, h], i) => ({ k: `s${i}`, ms: 1100, text: `Rechteck ${i + 1}: ${b} cm · ${h} cm = ${b * h} cm²` })),
    { k: "summe", ms: 1300, text: `Zusammen: ${p.stufen.map(([b, h]) => b * h).join(" + ")} = ${p.stufen.reduce((s, [b, h]) => s + b * h, 0)} cm²` },
  ],
  bild: ({ Z, p }) => {
    const k = 24, x0 = 30, yb = 176, uf = Z("figur");
    let y = yb;
    const rechtecke = p.stufen.map(([b, h]) => { const r = { x: x0, y: y - h * k, w: b * k, h: h * k, b, hh: h }; y -= h * k; return r; });
    const farben = [F.goldHell, F.blauHell, F.granatHell], rand = [F.gold, F.blau, F.granat];
    const umriss = (() => { const pkt = [[x0, yb]]; let yy = yb; p.stufen.forEach(([b, h]) => { pkt.push([x0 + b * k, yy]); pkt.push([x0 + b * k, yy - h * k]); yy -= h * k; }); pkt.push([x0, yy]); return pkt.map(([a, b]) => `${a},${b}`).join(" "); })();
    const summe = p.stufen.reduce((s, [b, h]) => s + b * h, 0);
    return (
      <>
        <polygon points={umriss} fill={F.flaeche} stroke={F.tinte} strokeWidth="2" strokeLinejoin="round" opacity={uf} />
        {rechtecke.map((r, i) => {
          const u = Z(`s${i}`, raus);
          return (
            <g key={i} opacity={u}>
              <rect x={r.x + 2} y={r.y + 2} width={r.w - 4} height={r.h - 4} rx="3" fill={farben[i % 3]} stroke={rand[i % 3]} strokeWidth="1.6" />
              <Tx x={r.x + r.w / 2} y={r.y + r.h / 2 + 5} g={12} f={rand[i % 3] === F.gold ? F.goldDunkel : rand[i % 3]} w={800}>{`${r.b * r.hh} cm²`}</Tx>
              <Tx x={r.x + r.w + 8} y={r.y + r.h / 2 + 4} g={10} f={F.grau} w={700} a="start">{`${r.b} · ${r.hh}`}</Tx>
            </g>
          );
        })}
        <g opacity={Z("summe")}>
          <Pille x={B - 84} y={60} text={`A = ${summe} cm²`} g={14} f={F.granatTief} tf={F.goldHell} />
        </g>
      </>
    );
  },
};

export const SZENEN_EXTRA = { x_sieb, x_prozentwert, x_grundwert, x_rabatt, x_zinseszins, x_massstabGross, x_geradenPunkte, x_ablesen, x_falten, x_treppe };
