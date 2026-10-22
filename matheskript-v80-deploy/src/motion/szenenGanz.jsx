/* ============================================================
   Szenen Ganze Zahlen (Klasse 5, Kapitel VIII): Thermometer, Ordnen, Plus/Minus als Sprünge,
   Vorzeichenregel beim Malnehmen als Umklappen an der 0. Vertrag siehe kern.jsx. Registriert über szenenZahlen.jsx.
   ============================================================ */
import React from "react";
import { B, F, Tx, Strich, Sprung, Skala, achse, Puls, Pille, Pfeil, de, mix, klemm, teil, staffel, raus, linear } from "./kern.jsx";

const vz = (n) => (n < 0 ? `−${-n}` : `${n}`);
const kl = (n) => (n < 0 ? `(−${-n})` : `${n}`);

/* ============================================================
   thermometer – Temperatur fällt bis null und darunter: unter null steht ein Minus davor
   p: { start: 3, ende: -8 }  (start > 0 > ende)
   ============================================================ */
const countdown = (n) => (n <= 5 ? Array.from({ length: n + 1 }, (_, i) => n - i).join(", ") : `${n}, ${n - 1}, … 0`);
const thermometer = {
  h: 230,
  label: (p) => `Thermometer von ${vz(p.start)} °C auf ${vz(p.ende)} °C`,
  ablauf: (p) => [
    { k: "auf", ms: 900, text: `Mittags zeigt das Thermometer ${p.start} Grad über null.` },
    { k: "bisNull", ms: 1700, text: `Es wird kälter: ${countdown(p.start)} – jetzt steht die Säule auf null.` },
    { k: "unter", ms: 2800, text: "Es fällt weiter. Unter null steht ein Minus vor der Zahl." },
    { k: "ende", ms: 1500, text: `${vz(p.ende)} °C heißt: ${-p.ende} Grad unter null.` },
  ],
  bild: ({ Z, p }) => {
    const lo = -12, hi = 12, ytop = 28, ybot = 186, y = (v) => ybot - ((v - lo) / (hi - lo)) * (ybot - ytop);
    const ub = Z("bisNull"), uu = Z("unter"), ue = Z("ende"), ua = Z("auf");
    const t = uu > 0 ? mix(0, p.ende, uu) : mix(p.start, 0, ub), xm = 150;
    const unter = t < -0.05, farbe = unter ? F.blau : F.granat;
    const anzeige = Math.round(t) === 0 ? 0 : Math.round(t);
    const geist = teil(uu, 0.45, 0.8);
    return (
      <>
        <g opacity={ua}>
          <rect x={xm - 9} y={ytop - 8} width={18} height={ybot - ytop + 18} rx="9" fill={F.flaeche} stroke={F.linie} strokeWidth="1.5" />
          <circle cx={xm} cy={ybot + 20} r={16} fill={farbe} />
          <rect x={xm - 5} y={y(t)} width={10} height={ybot + 10 - y(t)} rx="5" fill={farbe} />
          {Array.from({ length: (hi - lo) / 2 + 1 }, (_, i) => {
            const v = lo + i * 2;
            return (
              <g key={v}>
                <line x1={xm + 12} y1={y(v)} x2={xm + (v === 0 ? 30 : 20)} y2={y(v)} stroke={v === 0 ? F.tinte : F.hell} strokeWidth={v === 0 ? 2 : 1.2} />
                {v % 4 === 0 && <Tx x={xm + 36} y={y(v) + 4} g={11} f={v < 0 ? F.blau : v > 0 ? F.granat : F.tinte} w={800} a="start">{vz(v)}</Tx>}
              </g>
            );
          })}
        </g>
        {/* Kern-Moment: die Säule geht durch die Null */}
        <line x1={xm - 14} y1={y(0)} x2={xm + 30} y2={y(0)} stroke={F.gold} strokeWidth="3" strokeLinecap="round" opacity={teil(uu, 0, 0.15) * (1 - teil(uu, 0.5, 0.8))} />
        <Puls x={xm} y={y(0)} u={teil(uu, 0.05, 0.45)} r={24} f={F.gold} />
        {/* Mittags-Wert bleibt als Erinnerung stehen */}
        <g opacity={geist}>
          <line x1={xm + 12} y1={y(p.start)} x2={250} y2={y(p.start)} stroke={F.granat} strokeWidth="1.2" strokeDasharray="3 3" />
          <rect x={252} y={y(p.start) - 15} width={88} height={30} rx="11" fill={F.granatHell} />
          <Tx x={296} y={y(p.start) + 1} g={14} f={F.granat} w={800}>{`${vz(p.start)} °C`}</Tx>
          <Tx x={296} y={y(p.start) + 11} g={8.5} f={F.granat} w={700}>mittags</Tx>
        </g>
        {/* laufende Anzeige */}
        <g opacity={ua}>
          <line x1={xm + 64} y1={y(t)} x2={250} y2={y(t)} stroke={farbe} strokeWidth="1.2" strokeDasharray="3 3" />
          <rect x={252} y={y(t) - 17} width={88} height={34} rx="12" fill={unter ? F.blauHell : F.granatHell} />
          <Tx x={296} y={y(t) + (uu >= 1 ? 2 : 6)} g={18} f={farbe} w={800}>{`${vz(anzeige)} °C`}</Tx>
          {uu >= 1 && <Tx x={296} y={y(t) + 13} g={8.5} f={F.blau} w={700}>nachts</Tx>}
        </g>
        {/* Erkennen: Abstand von der Null, oben positiv, unten mit Minus */}
        <g opacity={ue}>
          <path d={`M${xm - 22} ${y(0)} h-8 V${y(p.start)} h8`} fill="none" stroke={F.granat} strokeWidth="2.2" strokeLinejoin="round" />
          <Tx x={xm - 38} y={(y(0) + y(p.start)) / 2 - 2} g={11} f={F.granat} w={800} a="end">{`${p.start} Grad über null`}</Tx>
          <Tx x={xm - 38} y={(y(0) + y(p.start)) / 2 + 11} g={9.5} f={F.grau} w={700} a="end">{`positiv: ${p.start}`}</Tx>
          <path d={`M${xm - 22} ${y(0)} h-8 V${y(p.ende)} h8`} fill="none" stroke={F.blau} strokeWidth="2.2" strokeLinejoin="round" />
          <Tx x={xm - 38} y={(y(0) + y(p.ende)) / 2 - 2} g={11} f={F.blau} w={800} a="end">{`${-p.ende} Grad unter null`}</Tx>
          <Tx x={xm - 38} y={(y(0) + y(p.ende)) / 2 + 11} g={9.5} f={F.grau} w={700} a="end">{`negativ: ${vz(p.ende)}`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   ordnenBetrag – Zahlen fliegen auf die Zahlengerade; von links nach rechts gelesen sind sie geordnet.
   p.betrag: die negative Zahl, die „groß aussieht“ und doch die kleinste ist (Hervorhebung)
   p: { zahlen: [4, -9, 0, -3, 7, -1], betrag: -9 }
   ============================================================ */
const ordnenBetrag = {
  h: 214,
  label: (p) => "Ganze Zahlen ordnen: " + [...p.zahlen].sort((a, b) => a - b).map((v) => vz(v)).join(" < "),
  ablauf: (p) => {
    const s = [...p.zahlen].sort((a, b) => a - b), b = p.betrag ?? s[0];
    return [
      { k: "gerade", ms: 900, text: "Sechs Zahlen, kreuz und quer. Welche ist die kleinste?" },
      { k: "fliegen", ms: 2400, text: "Jede Zahl an ihren Platz – die negativen landen links von 0." },
      { k: "lesen", ms: 2200, text: "Von links nach rechts gelesen: Jede Zahl ist größer als die davor." },
      { k: "falle", ms: 1600, text: `${vz(b)} liegt ganz links – die kleinste, obwohl ${-b} groß aussieht.` },
    ];
  },
  bild: ({ Z, p }) => {
    const x = achse({ von: -10, bis: 10, x0: 20, x1: B - 24 }), y = 112, uf = Z("fliegen"), ul = Z("lesen"), uk = Z("falle");
    const s = [...p.zahlen].sort((a, b) => a - b), n = p.zahlen.length, bz = p.betrag ?? s[0];
    return (
      <>
        <Skala von={-10} bis={10} schritt={1} y={y} x={x} u={Z("gerade")} jede={5} beschrift={(v) => vz(v)} neg={F.blau} />
        {/* Lesepfeil: weiter rechts = größer */}
        <g opacity={teil(ul, 0, 0.3)}>
          <Pfeil x1={x(-10)} y1={y + 34} x2={x(10)} y2={y + 34} u={raus(ul)} f={F.tinte} b={2.4} />
          <Tx x={x(-10)} y={y + 50} g={10.5} f={F.grau} w={800} a="start">kleiner</Tx>
          <Tx x={x(10)} y={y + 50} g={10.5} f={F.tinte} w={800} a="end">größer</Tx>
        </g>
        {p.zahlen.map((v, i) => {
          const u = staffel(uf, i, n, 0.5), xs = 34 + i * ((B - 68) / (n - 1)), ys = 26;
          const rang = s.indexOf(v), eng = s.some((w, j) => j !== rang && Math.abs(x(w) - x(v)) < 34);
          const xx = mix(xs, x(v), raus(u)), yy = mix(ys, y - 24 - (eng && rang % 2 ? 28 : 0), raus(u));
          const fall = v === bz && uk > 0;
          return (
            <g key={i}>
              <rect x={xx - 16} y={yy - 14} width={32} height={24} rx="8" fill={fall ? F.gold : v < 0 ? F.blauHell : v > 0 ? F.granatHell : F.flaeche} />
              <Tx x={xx} y={yy + 3} g={13} f={fall ? F.tinte : v < 0 ? F.blau : v > 0 ? F.granat : F.tinte} w={800}>{vz(v)}</Tx>
              {u > 0.95 && <circle cx={x(v)} cy={y} r={5} fill={v < 0 ? F.blau : v > 0 ? F.granat : F.tinte} />}
            </g>
          );
        })}
        <Puls x={x(bz)} y={y} u={teil(uk, 0, 0.7)} r={16} f={F.gold} />
        <Pille x={B / 2} y={196} text={s.map((v) => vz(v)).join("  <  ")} f={F.granatTief} tf={F.goldHell} g={12.5} o={teil(ul, 0.5, 1)} />
      </>
    );
  },
};

/* ============================================================
   ganzSprung – Plus geht nach rechts, Minus nach links; Minus einer negativen Zahl dreht um.
   Geht der Sprung über die 0, sieht man beide Teile (bis 0, dann weiter).
   p: { a: -8, op: "+" | "-", b: 3 }
   ============================================================ */
function sprungDaten(p) {
  const erg = p.op === "+" ? p.a + p.b : p.a - p.b;
  const dreh = p.op === "-" && p.b < 0, plusNeg = p.op === "+" && p.b < 0;
  const geist = dreh ? p.a + p.b : plusNeg ? p.a - p.b : null;   // wohin die Regel ohne Umdrehen zeigen würde
  const ueber = p.a !== 0 && erg !== 0 && Math.sign(p.a) !== Math.sign(erg);
  return { erg, dreh, plusNeg, geist, ueber };
}
const ganzSprung = {
  h: 196,
  label: (p) => `${vz(p.a)} ${p.op === "+" ? "+" : "−"} ${kl(p.b)}`,
  ablauf: (p) => {
    const { erg, dreh, plusNeg, ueber } = sprungDaten(p), n = Math.abs(erg - p.a), rechts = erg > p.a;
    const ab = [{ k: "start", ms: 1000, text: `Die Rechnung beginnt bei ${vz(p.a)} auf der Zahlengeraden.` }];
    if (dreh) {
      ab.push({ k: "richtung", ms: 1500, text: `Minus heißt eigentlich: ${-p.b} nach links …` });
      ab.push({ k: "dreh", ms: 1800, text: `… aber hier wird ${kl(p.b)} abgezogen: die Richtung dreht sich um.` });
    } else if (plusNeg) {
      ab.push({ k: "richtung", ms: 1500, text: `Plus heißt eigentlich: ${-p.b} nach rechts …` });
      ab.push({ k: "dreh", ms: 1800, text: `… aber ${kl(p.b)} ist ein Schritt rückwärts: also nach links.` });
    } else {
      ab.push({ k: "richtung", ms: 1400, text: p.op === "+" ? "Plus heißt: nach rechts gehen." : "Minus heißt: nach links gehen." });
    }
    ab.push({ k: "sprung", ms: 1800, text: ueber ? `${Math.abs(p.a)} Schritte bis zur 0, dann noch ${Math.abs(erg)} weiter.` : `${n} Schritte nach ${rechts ? "rechts" : "links"}.` });
    ab.push({ k: "ende", ms: 1100, text: `Angekommen bei ${vz(erg)}: ${vz(p.a)} ${p.op === "+" ? "+" : "−"} ${kl(p.b)} = ${vz(erg)}` });
    return ab;
  },
  bild: ({ Z, p }) => {
    const { erg, dreh, plusNeg, geist, ueber } = sprungDaten(p), umkehr = dreh || plusNeg;
    const werte = [p.a, erg, ...(geist != null ? [geist] : [])];
    const lo = Math.min(-10, Math.floor(Math.min(...werte) / 5) * 5), hi = Math.max(10, Math.ceil(Math.max(...werte) / 5) * 5);
    const x = achse({ von: lo, bis: hi, x0: 18, x1: B - 22 }), y = 124;
    const us = Z("start"), ur = Z("richtung"), ud = Z("dreh"), uj = Z("sprung"), ue = Z("ende");
    const rechts = erg > p.a, fs = rechts ? F.gold : F.blau, fb = rechts ? F.goldDunkel : F.blau;
    const plus = p.op === "+", aktiv = umkehr ? !plus : plus;   // welche Richtung am Ende gilt: rechts = true
    const hoch = (xa, xb) => Math.min(44, 14 + Math.abs(xb - xa) * 0.28);
    const zeichen = (d) => `${d > 0 ? "+" : "−"} ${Math.abs(d)}`;
    return (
      <>
        {/* Richtungs-Schilder: plus rechts, minus links */}
        <g opacity={us}>
          {[["← minus: links", 96, !plus], ["plus: rechts →", B - 96, plus]].map(([t, xx, an]) => {
            const leuchtet = an && ur > 0 && !(umkehr && ud > 0.6), fertig = aktiv === (xx > B / 2) && (umkehr ? ud > 0.6 : ur > 0);
            return <Pille key={t} x={xx} y={24} text={t} g={11} f={fertig ? F.gold : leuchtet ? F.goldHell : F.flaeche} tf={fertig ? F.tinte : leuchtet ? F.goldDunkel : F.grau} />;
          })}
        </g>
        <Skala von={lo} bis={hi} schritt={1} y={y} x={x} u={us} jede={5} beschrift={(v) => vz(v)} neg={F.blau} />
        <circle cx={x(p.a)} cy={y} r={6} fill={F.tinte} opacity={us} />
        <Tx x={x(p.a)} y={y + 40} g={11} f={F.grau} w={700} opacity={us}>Start</Tx>
        {/* Umkehr: der Sprung, den man erwarten würde, bleibt gestrichelt stehen */}
        {umkehr && ur > 0 && (
          <g opacity={0.6 + 0.4 * (1 - teil(ud, 0, 0.5))} strokeDasharray="5 4">
            <Sprung xa={x(p.a)} xb={x(geist)} y={y - 6} hoch={hoch(x(p.a), x(geist))} u={ur} f={F.hell} b={2.2} beschriftung={zeichen(geist - p.a)} bf={F.grau} />
          </g>
        )}
        {umkehr && <Puls x={x(p.a)} y={y} u={teil(ud, 0.2, 0.9)} r={26} f={F.gold} />}
        {umkehr && ud > 0 && (
          <g opacity={teil(ud, 0.3, 0.6)}>
            <Pfeil x1={x(p.a)} y1={y - 58} x2={x(p.a) + (rechts ? 46 : -46)} y2={y - 58} u={teil(ud, 0.3, 1)} f={F.gold} b={3} />
            <Tx x={x(p.a) + (rechts ? 23 : -23)} y={y - 66} g={10.5} f={F.goldDunkel} w={800}>umgedreht</Tx>
          </g>
        )}
        {/* der Sprung – über die 0 in zwei Teilen */}
        {ueber ? (
          <>
            <Sprung xa={x(p.a)} xb={x(0)} y={y - 6} hoch={hoch(x(p.a), x(0))} u={teil(uj, 0, 0.55)} f={fs} bf={fb} beschriftung={zeichen(-p.a)} />
            <Sprung xa={x(0)} xb={x(erg)} y={y - 6} hoch={hoch(x(0), x(erg))} u={teil(uj, 0.5, 1)} f={fs} bf={fb} beschriftung={zeichen(erg)} />
            <circle cx={x(0)} cy={y} r={4} fill={fs} opacity={teil(uj, 0.45, 0.55)} />
          </>
        ) : (
          <Sprung xa={x(p.a)} xb={x(erg)} y={y - 6} hoch={hoch(x(p.a), x(erg))} u={uj} f={fs} bf={fb} beschriftung={zeichen(erg - p.a)} />
        )}
        {uj > 0.95 && <circle cx={x(erg)} cy={y} r={7} fill={F.granat} stroke={F.weiss} strokeWidth="2" />}
        <Pille x={B / 2} y={184} text={`${vz(p.a)} ${plus ? "+" : "−"} ${kl(p.b)} = ${vz(erg)}`} f={F.granatTief} tf={F.goldHell} g={14} o={ue} />
      </>
    );
  },
};

/* ============================================================
   vorzeichen – a · b als a gleiche Sprünge; das Minus am ersten Faktor klappt alle Sprünge an der 0 um:
   (−a) · b ist die Gegenzahl von a · b. Darum ergibt minus mal minus plus.
   p: { a: 6, b: -7 }  (a > 0)
   ============================================================ */
const vorzeichen = {
  h: 216,
  label: (p) => `${p.a} · ${kl(p.b)} = ${vz(p.a * p.b)}, umgeklappt: (−${p.a}) · ${kl(p.b)} = ${vz(-p.a * p.b)}`,
  ablauf: (p) => [
    { k: "start", ms: 900, text: `${p.a} · ${kl(p.b)} heißt: ${p.a}-mal ein Sprung um ${vz(p.b)}.` },
    { k: "spruenge", ms: 600 + p.a * 380, text: `${p.a} Sprünge nach ${p.b < 0 ? "links" : "rechts"} – Ankunft bei ${vz(p.a * p.b)}.` },
    { k: "dreh", ms: 2600, text: `(−${p.a}) · ${kl(p.b)}: Das Minus vorn klappt alle Sprünge an der 0 um.` },
    { k: "ergebnis", ms: 1500, text: `Gespiegelt: (−${p.a}) · ${kl(p.b)} = ${vz(-p.a * p.b)}. Zweimal Minus – wieder ${p.b < 0 ? "rechts" : "links"}.` },
  ],
  bild: ({ Z, z, p }) => {
    const e = p.a * p.b, m = Math.abs(e) + Math.abs(p.b) * 0.6;
    const x = achse({ von: -m, bis: m, x0: 16, x1: B - 16 }), y = 112;
    const us = Z("start"), ud = Z("dreh"), ue = Z("ergebnis");
    const zweig = ud > 0;
    const k = Math.cos(Math.PI * ud);                 // 1 → −1: die Kopie klappt um die 0
    const xk = (v) => x(0) + (x(v) - x(0)) * k;
    const hoch = Math.min(24, Math.abs(x(p.b) - x(0)) * 0.55);
    const fo = p.b < 0 ? F.blau : F.gold;            // Farbe der ersten Kette
    return (
      <>
        <Strich x1={10} y1={y} x2={B - 10} y2={y} u={us} b={1.6} />
        {Array.from({ length: 2 * p.a + 1 }, (_, i) => {
          const v = (i - p.a) * Math.abs(p.b), rand = Math.abs(v) === Math.abs(e);
          return (
            <g key={i} opacity={us}>
              <line x1={x(v)} y1={y - (v === 0 ? 7 : 4)} x2={x(v)} y2={y + (v === 0 ? 7 : 4)} stroke={F.tinte} strokeWidth={v === 0 ? 2 : 1.2} />
              {(v === 0 || rand) && <Tx x={x(v)} y={y + 22} g={11} f={v < 0 ? F.blau : v > 0 ? F.granat : F.tinte} w={800}>{vz(v)}</Tx>}
            </g>
          );
        })}
        {/* erste Kette: a Sprünge um b (oben) */}
        {Array.from({ length: p.a }, (_, i) => (
          <Sprung key={i} xa={x(i * p.b)} xb={x((i + 1) * p.b)} y={y - 5} hoch={hoch} u={staffel(z("spruenge"), i, p.a, 0.15)} f={fo} b={2.2} />
        ))}
        <g opacity={Z("spruenge")}>
          <circle cx={x(e)} cy={y} r={6} fill={fo} stroke={F.weiss} strokeWidth="2" />
          <Pille x={x(e) + (e < 0 ? 52 : -52)} y={y - hoch - 22} text={`${p.a} · ${kl(p.b)} = ${vz(e)}`} f={p.b < 0 ? F.blauHell : F.goldHell} tf={p.b < 0 ? F.blau : F.goldDunkel} g={12} />
        </g>
        {/* Spiegel an der 0 und die umklappende Kopie (unten) */}
        <line x1={x(0)} y1={y - 44} x2={x(0)} y2={y + 44} stroke={F.gold} strokeWidth="2" strokeDasharray="5 4" opacity={teil(ud, 0, 0.2)} />
        <Puls x={x(0)} y={y} u={teil(ud, 0.3, 0.9)} r={22} f={F.gold} />
        {zweig && Array.from({ length: p.a }, (_, i) => {
          const xa = xk(i * p.b), xb = xk((i + 1) * p.b);
          if (Math.abs(xb - xa) < 0.5) return null;
          return <Sprung key={`k${i}`} xa={xa} xb={xb} y={y + 5} hoch={-hoch * Math.max(0.15, Math.abs(k))} u={1} f={F.gold} b={2.4} />;
        })}
        {zweig && <circle cx={xk(e)} cy={y} r={6.5} fill={ud >= 1 ? F.granat : F.gold} stroke={F.weiss} strokeWidth="2" />}
        <Pille x={x(-e) + (e < 0 ? -58 : 58)} y={y + hoch + 34} text={`(−${p.a}) · ${kl(p.b)} = ${vz(-e)}`} f={F.granatTief} tf={F.goldHell} g={12.5} o={ue} />
        <g opacity={ue}>
          <Tx x={x(0)} y={196} g={10.5} f={F.goldDunkel} w={800}>Spiegel an der 0</Tx>
        </g>
      </>
    );
  },
};

export const SZENEN_GANZ = { thermometer, ordnenBetrag, ganzSprung, vorzeichen };
