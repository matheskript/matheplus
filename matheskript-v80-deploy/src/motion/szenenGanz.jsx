/* ============================================================
   Szenen Ganze Zahlen (Klasse 5, Kapitel VIII): Thermometer, Ordnen und Betrag, Plus/Minus als Sprünge,
   Vorzeichenregeln beim Malnehmen. Vertrag siehe kern.jsx. Registriert über szenenZahlen.jsx.
   ============================================================ */
import React from "react";
import { B, F, Tx, Strich, Sprung, Skala, achse, Puls, Pille, Pfeil, de, mix, klemm, teil, staffel, raus, federnd } from "./kern.jsx";

const vz = (n) => (n < 0 ? `−${-n}` : `${n}`);
const kl = (n) => (n < 0 ? `(−${-n})` : `${n}`);

/* ============================================================
   thermometer – Temperatur fällt unter null: die Zahl wird negativ
   p: { start: 3, ende: -8 }
   ============================================================ */
const thermometer = {
  h: 230,
  label: (p) => `Thermometer von ${vz(p.start)} °C auf ${vz(p.ende)} °C`,
  ablauf: (p) => [
    { k: "auf", ms: 900, text: `Mittags ${vz(p.start)} °C.` },
    { k: "fallen", ms: 2400, text: `In der Nacht fällt die Temperatur um ${Math.abs(p.ende - p.start)} Grad.` },
    { k: "null", ms: 1300, text: "Unter null schreibt man ein Minus davor." },
    { k: "ende", ms: 1200, text: `${Math.abs(p.ende)} Grad unter null = ${vz(p.ende)} °C` },
  ],
  bild: ({ Z, p }) => {
    const lo = -12, hi = 12, ytop = 28, ybot = 186, y = (v) => ybot - ((v - lo) / (hi - lo)) * (ybot - ytop);
    const uf = Z("fallen"), t = mix(p.start, p.ende, uf), xm = 120;
    const unter = t < 0;
    return (
      <>
        <g opacity={Z("auf")}>
          <rect x={xm - 9} y={ytop - 8} width={18} height={ybot - ytop + 18} rx="9" fill={F.flaeche} stroke={F.linie} strokeWidth="1.5" />
          <circle cx={xm} cy={ybot + 20} r={16} fill={unter ? F.blau : F.granat} />
          <rect x={xm - 5} y={y(t)} width={10} height={ybot + 10 - y(t)} rx="5" fill={unter ? F.blau : F.granat} />
          {Array.from({ length: (hi - lo) / 2 + 1 }, (_, i) => {
            const v = lo + i * 2;
            return (
              <g key={v}>
                <line x1={xm + 12} y1={y(v)} x2={xm + (v === 0 ? 30 : 20)} y2={y(v)} stroke={v === 0 ? F.tinte : F.hell} strokeWidth={v === 0 ? 2 : 1.2} />
                {v % 4 === 0 && <Tx x={xm + 36} y={y(v) + 4} g={11} f={v < 0 ? F.blau : v > 0 ? F.granat : F.tinte} w={800} a="start">{vz(v)}</Tx>}
              </g>
            );
          })}
          <Tx x={xm + 70} y={y(0) + 4} g={10} f={F.grau} w={700} a="start">Null</Tx>
        </g>
        <g opacity={Z("null")}>
          <rect x={xm - 40} y={y(0)} width={6} height={y(lo) - y(0)} rx="3" fill={F.blau} />
          <Tx x={xm - 50} y={(y(0) + y(lo)) / 2 + 4} g={10.5} f={F.blau} w={800} a="end">unter null:</Tx>
          <Tx x={xm - 50} y={(y(0) + y(lo)) / 2 + 18} g={10.5} f={F.blau} w={800} a="end">negativ</Tx>
          <rect x={xm - 40} y={y(hi)} width={6} height={y(0) - y(hi)} rx="3" fill={F.granat} />
          <Tx x={xm - 50} y={(y(0) + y(hi)) / 2 + 4} g={10.5} f={F.granat} w={800} a="end">über null:</Tx>
          <Tx x={xm - 50} y={(y(0) + y(hi)) / 2 + 18} g={10.5} f={F.granat} w={800} a="end">positiv</Tx>
        </g>
        <g opacity={Z("auf")}>
          <rect x={250} y={y(t) - 17} width={86} height={34} rx="12" fill={unter ? F.blauHell : F.granatHell} />
          <Tx x={293} y={y(t) + 6} g={18} f={unter ? F.blau : F.granat} w={800}>{`${vz(Math.round(t))} °C`}</Tx>
          <line x1={xm + 64} y1={y(t)} x2={248} y2={y(t)} stroke={unter ? F.blau : F.granat} strokeWidth="1.2" strokeDasharray="3 3" />
        </g>
        <Puls x={293} y={y(p.ende)} u={Z("ende")} r={30} f={F.gold} />
      </>
    );
  },
};

/* ============================================================
   ordnenBetrag – Zahlen fliegen auf die Zahlengerade, dann Betrag = Abstand von 0
   p: { zahlen: [4, -9, 0, -3, 7, -1], betrag: -9 }
   ============================================================ */
const ordnenBetrag = {
  h: 214,
  label: (p) => "Ganze Zahlen ordnen und Beträge",
  ablauf: (p) => {
    const s = [...p.zahlen].sort((a, b) => a - b);
    return [
      { k: "gerade", ms: 900, text: "Auf der Zahlengeraden: weiter rechts heißt größer." },
      { k: "fliegen", ms: 2200, text: "Jede Zahl an ihren Platz." },
      { k: "ordnen", ms: 1300, text: s.map((v) => vz(v)).join(" < ") },
      { k: "betrag", ms: 1900, text: `Betrag = Abstand von 0: |${vz(p.betrag)}| = ${Math.abs(p.betrag)} und |${Math.abs(p.betrag)}| = ${Math.abs(p.betrag)}` },
    ];
  },
  bild: ({ Z, p }) => {
    const x = achse({ von: -10, bis: 10, x0: 20, x1: B - 24 }), y = 96, uf = Z("fliegen"), ub = Z("betrag");
    const s = [...p.zahlen].sort((a, b) => a - b), n = p.zahlen.length, b = p.betrag, ab = Math.abs(b);
    return (
      <>
        <Skala von={-10} bis={10} schritt={1} y={y} x={x} u={Z("gerade")} jede={5} beschrift={(v) => vz(v)} neg={F.blau} />
        {p.zahlen.map((v, i) => {
          const u = staffel(uf, i, n, 0.5), xs = 34 + i * ((B - 68) / (n - 1)), ys = 22;
          const rang = s.indexOf(v), eng = s.some((w, j) => j !== rang && Math.abs(x(w) - x(v)) < 34);
          const xx = mix(xs, x(v), raus(u)), yy = mix(ys, y - 24 - (eng && rang % 2 ? 28 : 0), raus(u));
          return (
            <g key={i}>
              <rect x={xx - 16} y={yy - 14} width={32} height={24} rx="8" fill={v < 0 ? F.blauHell : v > 0 ? F.granatHell : F.flaeche} />
              <Tx x={xx} y={yy + 3} g={13} f={v < 0 ? F.blau : v > 0 ? F.granat : F.tinte} w={800}>{vz(v)}</Tx>
              {u > 0.95 && <circle cx={x(v)} cy={y} r={5} fill={v < 0 ? F.blau : v > 0 ? F.granat : F.tinte} />}
            </g>
          );
        })}
        <g opacity={Z("ordnen")}>
          <Pille x={B / 2} y={176} text={s.map((v) => vz(v)).join("  <  ")} f={F.granatTief} tf={F.goldHell} g={12.5} />
        </g>
        {ub > 0 && (
          <g>
            <path d={`M${x(0)} ${y + 36} L${mix(x(0), x(b), ub)} ${y + 36}`} stroke={F.gold} strokeWidth="4" strokeLinecap="round" />
            <path d={`M${x(0)} ${y + 36} L${mix(x(0), x(ab), teil(ub, 0.4, 1))} ${y + 36}`} stroke={F.gold} strokeWidth="4" strokeLinecap="round" opacity={teil(ub, 0.4, 0.5)} />
            <Tx x={(x(0) + x(b)) / 2} y={y + 54} g={11.5} f={F.goldDunkel} w={800} opacity={teil(ub, 0.3, 0.6)}>{`|${vz(b)}| = ${ab}`}</Tx>
            <Tx x={(x(0) + x(ab)) / 2} y={y + 54} g={11.5} f={F.goldDunkel} w={800} opacity={teil(ub, 0.7, 1)}>{`|${ab}| = ${ab}`}</Tx>
          </g>
        )}
        <Pille x={B / 2} y={204} text="gleicher Abstand – gleicher Betrag" f={F.goldHell} tf={F.goldDunkel} o={teil(ub, 0.8, 1)} />
      </>
    );
  },
};

/* ============================================================
   ganzSprung – Plus geht nach rechts, Minus nach links; Minus einer negativen Zahl dreht um
   p: { a: -8, op: "+" | "-", b: 3 }
   ============================================================ */
const ganzSprung = {
  h: 190,
  label: (p) => `${vz(p.a)} ${p.op === "+" ? "+" : "−"} ${kl(p.b)}`,
  ablauf: (p) => {
    const erg = p.op === "+" ? p.a + p.b : p.a - p.b, dreh = p.op === "-" && p.b < 0, plusNeg = p.op === "+" && p.b < 0;
    const ab = [{ k: "start", ms: 1000, text: `Start bei ${vz(p.a)}.` }];
    if (dreh) ab.push({ k: "dreh", ms: 1500, text: `Minus heißt nach links … aber minus ${kl(p.b)}: umdrehen! Minus minus ist plus.` });
    else if (plusNeg) ab.push({ k: "dreh", ms: 1300, text: `Plus ${kl(p.b)} ist dasselbe wie minus ${-p.b}: nach links.` });
    ab.push({ k: "sprung", ms: 1500, text: `${Math.abs(erg - p.a)} Schritte nach ${erg > p.a ? "rechts" : "links"}.` });
    ab.push({ k: "ende", ms: 1100, text: `${vz(p.a)} ${p.op === "+" ? "+" : "−"} ${kl(p.b)} = ${vz(erg)}` });
    return ab;
  },
  bild: ({ Z, p }) => {
    const erg = p.op === "+" ? p.a + p.b : p.a - p.b, dreh = p.op === "-" && p.b < 0;
    const lo = Math.min(-10, Math.floor(Math.min(p.a, erg) / 5) * 5), hi = Math.max(10, Math.ceil(Math.max(p.a, erg) / 5) * 5);
    const x = achse({ von: lo, bis: hi, x0: 18, x1: B - 22 }), y = 116;
    const us = Z("start"), ud = Z("dreh"), uj = Z("sprung"), ue = Z("ende");
    const rechts = erg > p.a;
    return (
      <>
        <Skala von={lo} bis={hi} schritt={1} y={y} x={x} u={us} jede={5} beschrift={(v) => vz(v)} neg={F.blau} />
        <circle cx={x(p.a)} cy={y} r={6} fill={F.tinte} opacity={us} />
        <Tx x={x(p.a)} y={y + 40} g={11} f={F.grau} w={700} opacity={us}>Start</Tx>
        {dreh && ud > 0 && (
          <g>
            <g opacity={1 - teil(ud, 0.55, 0.8)}>
              <Pfeil x1={x(p.a)} y1={y - 70} x2={x(p.a) - 46} y2={y - 70} u={teil(ud, 0, 0.4)} f={F.hell} b={3} />
              <Tx x={x(p.a) - 23} y={y - 80} g={10.5} f={F.grau} w={800}>minus</Tx>
            </g>
            <g opacity={teil(ud, 0.55, 0.8)}>
              <Pfeil x1={x(p.a)} y1={y - 70} x2={x(p.a) + 46} y2={y - 70} u={teil(ud, 0.55, 1)} f={F.gold} b={3} />
              <Tx x={x(p.a) + 23} y={y - 80} g={10.5} f={F.goldDunkel} w={800}>umgedreht</Tx>
            </g>
          </g>
        )}
        <Sprung xa={x(p.a)} xb={x(erg)} y={y - 6} hoch={rechts ? 32 : 32} u={uj} f={rechts ? F.gold : F.blau} bf={rechts ? F.goldDunkel : F.blau}
          beschriftung={`${rechts ? "+" : "−"} ${Math.abs(erg - p.a)}`} />
        {uj > 0.95 && <circle cx={x(erg)} cy={y} r={7} fill={F.granat} stroke={F.weiss} strokeWidth="2" />}
        <g opacity={ue}>
          <Pille x={B / 2} y={176} text={`${vz(p.a)} ${p.op === "+" ? "+" : "−"} ${kl(p.b)} = ${vz(erg)}`} f={F.granatTief} tf={F.goldHell} g={14} />
        </g>
      </>
    );
  },
};

/* ============================================================
   vorzeichen – a · b als a gleiche Sprünge; danach die Vorzeichentafel
   p: { a: 6, b: -7 }  (a > 0)
   ============================================================ */
const vorzeichen = {
  h: 216,
  label: (p) => `${p.a} · ${kl(p.b)} = ${vz(p.a * p.b)}`,
  ablauf: (p) => [
    { k: "start", ms: 800, text: `${p.a} · ${kl(p.b)}: ${p.a}-mal einen Sprung um ${vz(p.b)}.` },
    { k: "spruenge", ms: 400 + p.a * 380, text: `${Array(p.a).fill(kl(p.b)).join(" + ")}` },
    { k: "ergebnis", ms: 1000, text: `${p.a} · ${kl(p.b)} = ${vz(p.a * p.b)}` },
    { k: "regel", ms: 1700, text: "Gleiche Vorzeichen → plus, verschiedene Vorzeichen → minus." },
  ],
  bild: ({ Z, z, p }) => {
    const e = p.a * p.b, lo = Math.min(0, e), hi = Math.max(0, e);
    const x = achse({ von: lo - Math.abs(p.b) * 0.3, bis: hi + Math.abs(p.b) * 0.3, x0: 20, x1: B - 20 }), y = 80;
    const ur = Z("regel");
    return (
      <>
        <Strich x1={14} y1={y} x2={B - 14} y2={y} u={Z("start")} b={1.6} />
        {Array.from({ length: p.a + 1 }, (_, i) => (
          <g key={i} opacity={Z("start")}>
            <line x1={x(i * p.b)} y1={y - 5} x2={x(i * p.b)} y2={y + 5} stroke={F.tinte} strokeWidth="1.3" />
            <Tx x={x(i * p.b)} y={y + 20} g={10} f={i * p.b < 0 ? F.blau : F.tinte} w={800}>{vz(i * p.b)}</Tx>
          </g>
        ))}
        {Array.from({ length: p.a }, (_, i) => (
          <Sprung key={i} xa={x(i * p.b)} xb={x((i + 1) * p.b)} y={y - 5} hoch={20} u={staffel(z("spruenge"), i, p.a, 0.15)} f={p.b < 0 ? F.blau : F.gold} b={2.2} />
        ))}
        <g opacity={Z("ergebnis")}>
          <circle cx={x(e)} cy={y} r={6.5} fill={F.granat} stroke={F.weiss} strokeWidth="2" />
          <Pille x={x(e) + (e < 0 ? 46 : -46)} y={y + 44} text={`= ${vz(e)}`} f={F.granatHell} tf={F.granat} g={13} />
        </g>
        <g opacity={ur}>
          {[["+", "+", "+"], ["+", "−", "−"], ["−", "+", "−"], ["−", "−", "+"]].map(([a, b, c], i) => {
            const xx = 26 + i * 80, gleich = a === b;
            return (
              <g key={i} opacity={staffel(ur, i, 4, 0.5)}>
                <rect x={xx} y={150} width={70} height={46} rx="12" fill={gleich ? F.gruenHell : F.granatHell} />
                <Tx x={xx + 35} y={170} g={13} f={F.tinte} w={800}>{`(${a}) · (${b})`}</Tx>
                <Tx x={xx + 35} y={188} g={13} f={gleich ? F.gruen : F.granat} w={800}>{`→ ${c}`}</Tx>
              </g>
            );
          })}
        </g>
      </>
    );
  },
};

export const SZENEN_GANZ = { thermometer, ordnenBetrag, ganzSprung, vorzeichen };
