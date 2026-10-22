/* Zweite Animationen (Gruppe Zahlen) für Lerneinheiten, die bisher nur eine hatten – Vertrag: siehe kern.jsx */
import React from "react";
import { B, F, Tx, Strich, Skala, achse, Puls, Pille, Pfeil, Spitze, de, mix, klemm, teil, staffel, raus } from "./kern.jsx";

const vz = (n) => (n < 0 ? `−${-n}` : `${n}`);
const vzp = (n) => (n < 0 ? `−${-n}` : n > 0 ? `+${n}` : "0");
const kl = (n) => (n < 0 ? `(−${-n})` : `${n}`);

/* ============================================================
   meeresspiegel – Höhen über und unter dem Meeresspiegel: positive und negative Zahlen senkrecht
   p: { oben: 30, unten: -20 }
   ============================================================ */
const meeresspiegel = {
  h: 224,
  label: (p) => `Möwe bei ${vzp(p.oben)} m, Taucher bei ${vz(p.unten)} m, Unterschied ${p.oben - p.unten} m`,
  ablauf: (p) => [
    { k: "meer", ms: 1000, text: "Der Meeresspiegel ist die Null." },
    { k: "moewe", ms: 1300, text: `Eine Möwe fliegt ${p.oben} m über dem Meer: ${vzp(p.oben)} m.` },
    { k: "taucher", ms: 1900, text: `Ein Taucher sinkt ${-p.unten} m unter den Meeresspiegel: ${vz(p.unten)} m.` },
    { k: "abstand", ms: 2400, text: `Von ${vz(p.unten)} m bis ${vzp(p.oben)} m: ${-p.unten} m bis zur Null, dann ${p.oben} m darüber.` },
    { k: "summe", ms: 1200, text: `Zusammen ${p.oben - p.unten} m – beide Teile zählen.` },
  ],
  bild: ({ Z, p }) => {
    const ytop = 24, ybot = 200, y = (v) => ybot - ((v + 40) / 80) * (ybot - ytop), xa = 150, xm = 240;
    const um = Z("meer"), uo = Z("moewe", raus), ut = Z("taucher"), ua = Z("abstand");
    const tief = mix(0, p.unten, ut), y0 = y(0);
    const welle = Array.from({ length: 23 }, (_, i) => `${i === 0 ? "M" : "L"}${14 + i * 15} ${y0 + (i % 2 ? 2.5 : -2.5)}`).join(" ");
    return (
      <>
        <g opacity={um}>
          <rect x={14} y={y0} width={B - 28} height={214 - y0} rx="6" fill={F.blauHell} />
          <path d={welle} fill="none" stroke={F.blau} strokeWidth="2" strokeLinejoin="round" />
          <Tx x={B - 18} y={y0 - 8} g={10} f={F.blau} w={800} a="end">Meeresspiegel: 0 m</Tx>
          <line x1={xa} y1={ytop - 6} x2={xa} y2={ybot + 4} stroke={F.tinte} strokeWidth="1.6" />
          <Spitze x={xa} y={ytop - 10} winkel={-90} f={F.tinte} g={7} />
          {Array.from({ length: 9 }, (_, i) => {
            const v = -40 + i * 10;
            return (
              <g key={v}>
                <line x1={xa - (v === 0 ? 7 : 4)} y1={y(v)} x2={xa + (v === 0 ? 7 : 4)} y2={y(v)} stroke={F.tinte} strokeWidth={v === 0 ? 2 : 1.2} />
                {v % 20 === 0 && v !== 0 && <Tx x={xa - 10} y={y(v) + 4} g={10.5} f={v < 0 ? F.blau : F.granat} w={800} a="end">{`${vzp(v)} m`}</Tx>}
              </g>
            );
          })}
          <Tx x={22} y={y(26)} g={10.5} f={F.granat} w={800} a="start">über dem Meer:</Tx>
          <Tx x={22} y={y(26) + 14} g={10.5} f={F.granat} w={800} a="start">positiv</Tx>
          <Tx x={22} y={y(-26)} g={10.5} f={F.blau} w={800} a="start">unter dem Meer:</Tx>
          <Tx x={22} y={y(-26) + 14} g={10.5} f={F.blau} w={800} a="start">negativ</Tx>
        </g>
        {uo > 0 && (
          <g opacity={klemm(uo * 2)}>
            <line x1={xa} y1={y(p.oben)} x2={xm - 14} y2={y(p.oben)} stroke={F.granat} strokeWidth="1.2" strokeDasharray="3 3" opacity={teil(uo, 0.6, 1)} />
            <g transform={`translate(${xm} ${mix(y(p.oben) + 30, y(p.oben), uo)})`}>
              <path d="M-12 0 Q-6 -8 0 0 Q6 -8 12 0" fill="none" stroke={F.tinte} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <Pille x={xm + 58} y={y(p.oben) + 4} text={`${vzp(p.oben)} m`} f={F.granatHell} tf={F.granat} g={13} o={teil(uo, 0.5, 1)} />
          </g>
        )}
        {ut > 0 && (
          <g>
            <line x1={xa} y1={y(tief)} x2={xm - 14} y2={y(tief)} stroke={F.blau} strokeWidth="1.2" strokeDasharray="3 3" />
            <g transform={`translate(${xm} ${y(tief)})`}>
              <ellipse cx={0} cy={0} rx={11} ry={4.2} fill={F.tinte} />
              <circle cx={-13} cy={-1} r={4.6} fill={F.tinte} />
              <path d="M11 0 L18 -4 M11 0 L18 4" stroke={F.tinte} strokeWidth="2" strokeLinecap="round" />
            </g>
            <Pille x={xm + 58} y={y(tief) + 4} text={`${vz(Math.round(tief))} m`} f={F.weiss} tf={F.blau} g={13} />
          </g>
        )}
        {ua > 0 && (
          <g>
            {/* erst unten bis zur Null, dann oben weiter */}
            <line x1={196} y1={y(p.unten)} x2={196} y2={mix(y(p.unten), y(0), teil(ua, 0, 0.45))} stroke={F.goldDunkel} strokeWidth="4" strokeLinecap="round" />
            {ua > 0.5 && <line x1={196} y1={y(0)} x2={196} y2={mix(y(0), y(p.oben), teil(ua, 0.5, 0.95))} stroke={F.gold} strokeWidth="4" strokeLinecap="round" />}
            <line x1={190} y1={y(p.unten)} x2={202} y2={y(p.unten)} stroke={F.goldDunkel} strokeWidth="2" />
            <line x1={190} y1={y(p.oben)} x2={202} y2={y(p.oben)} stroke={F.goldDunkel} strokeWidth="2" opacity={teil(ua, 0.9, 1)} />
            <Tx x={190} y={y(p.unten / 2) + 4} g={11.5} f={F.goldDunkel} w={800} a="end" opacity={teil(ua, 0.3, 0.5)}>{`${-p.unten} m`}</Tx>
            <Tx x={190} y={y(p.oben / 2) + 4} g={11.5} f={F.goldDunkel} w={800} a="end" opacity={teil(ua, 0.8, 1)}>{`${p.oben} m`}</Tx>
            <Puls x={196} y={y(0)} u={teil(ua, 0.4, 0.8)} r={16} f={F.gold} />
          </g>
        )}
        <Pille x={250} y={214} text={`${-p.unten} m + ${p.oben} m = ${p.oben - p.unten} m`} f={F.gold} tf={F.tinte} g={12} o={Z("summe")} />
      </>
    );
  },
};

/* ============================================================
   betragAbstand – Betrag als Abstand zur 0: Gegenzahlen gleich lang; bei negativen Zahlen
   heißt größerer Betrag kleinere Zahl
   p: { paar: 6, a: -8, b: -3 }  (a < b < 0)
   ============================================================ */
const betragAbstand = {
  h: 212,
  label: (p) => `|−${p.paar}| = |${p.paar}| = ${p.paar}; ${vz(p.a)} < ${vz(p.b)}, obwohl |${vz(p.a)}| > |${vz(p.b)}|`,
  ablauf: (p) => [
    { k: "gerade", ms: 800, text: "Der Betrag ist der Abstand einer Zahl von 0." },
    { k: "paar", ms: 2000, text: `−${p.paar} und ${p.paar} sind gleich weit von 0 entfernt: |−${p.paar}| = |${p.paar}| = ${p.paar}` },
    { k: "zwei", ms: 2000, text: `${vz(p.a)} ist weiter weg von 0 als ${vz(p.b)}: |${vz(p.a)}| = ${-p.a}, |${vz(p.b)}| = ${-p.b}` },
    { k: "ordnen", ms: 1700, text: `Aber ${vz(p.a)} liegt weiter links. Also ${vz(p.a)} < ${vz(p.b)}.` },
  ],
  bild: ({ Z, p }) => {
    const x = achse({ von: -10, bis: 10, x0: 20, x1: B - 24 }), y = 72;
    const ug = Z("gerade"), up = Z("paar"), uz = Z("zwei"), uo = Z("ordnen");
    const arm = (wert, yy, u, f, txt, to, rechts) => (
      <g>
        <Pfeil x1={x(0)} y1={yy} x2={x(wert)} y2={yy} u={u} f={f} b={3} />
        {rechts
          ? <Tx x={x(0) + 10} y={yy + 4} g={11.5} f={f} w={800} a="start" opacity={to}>{txt}</Tx>
          : <Tx x={(x(0) + x(wert)) / 2} y={yy - 8} g={11.5} f={f} w={800} opacity={to}>{txt}</Tx>}
      </g>
    );
    return (
      <>
        <Skala von={-10} bis={10} schritt={1} y={y} x={x} u={ug} jede={5} beschrift={(v) => vz(v)} neg={F.blau} />
        {up > 0 && (
          <g>
            {arm(-p.paar, 36, up, F.blau, `|−${p.paar}| = ${p.paar}`, teil(up, 0.6, 1))}
            {arm(p.paar, 36, up, F.granat, `|${p.paar}| = ${p.paar}`, teil(up, 0.6, 1))}
            <circle cx={x(-p.paar)} cy={y} r={5} fill={F.blau} opacity={teil(up, 0.8, 1)} />
            <circle cx={x(p.paar)} cy={y} r={5} fill={F.granat} opacity={teil(up, 0.8, 1)} />
            <Tx x={x(-p.paar)} y={y - 12} g={11} f={F.blau} w={800} opacity={teil(up, 0.8, 1)}>{`−${p.paar}`}</Tx>
            <Tx x={x(p.paar)} y={y - 12} g={11} f={F.granat} w={800} opacity={teil(up, 0.8, 1)}>{`${p.paar}`}</Tx>
          </g>
        )}
        {uz > 0 && (
          <g>
            {arm(p.a, 124, teil(uz, 0, 0.6), F.blau, `|${vz(p.a)}| = ${-p.a}`, teil(uz, 0.4, 0.7), true)}
            {arm(p.b, 154, teil(uz, 0.3, 0.9), F.blau, `|${vz(p.b)}| = ${-p.b}`, teil(uz, 0.7, 1), true)}
            <line x1={x(0)} y1={y + 8} x2={x(0)} y2={162} stroke={F.hell} strokeWidth="1.2" strokeDasharray="3 3" />
          </g>
        )}
        {uo > 0 && (
          <g>
            {[p.a, p.b].map((v, i) => (
              <g key={i}>
                <line x1={x(v)} y1={y} x2={x(v)} y2={i ? 154 : 124} stroke={F.granat} strokeWidth="1.2" strokeDasharray="3 3" opacity={teil(uo, 0, 0.4)} />
                <circle cx={x(v)} cy={y} r={6} fill={F.granat} stroke={F.weiss} strokeWidth="2" opacity={teil(uo, 0, 0.4)} />
              </g>
            ))}
            <Puls x={x(p.a)} y={y} u={teil(uo, 0.1, 0.7)} r={14} f={F.granat} />
            <Pille x={B / 2} y={198} text={`${vz(p.a)} < ${vz(p.b)}, obwohl |${vz(p.a)}| > |${vz(p.b)}|`} f={F.granatTief} tf={F.goldHell} g={12.5} o={teil(uo, 0.4, 1)} />
          </g>
        )}
      </>
    );
  },
};

/* ============================================================
   vorzeichenMuster – Malreihen laufen über null weiter: 3 · 2, 3 · 1, 3 · 0, 3 · (−1) …
   und (−3) · 2 … (−3) · (−2): minus mal minus ist plus
   p: { a: 3, von: 2, bis: -2 }
   ============================================================ */
const vorzeichenMuster = {
  h: 226,
  label: (p) => `Muster: ${p.a} · ${kl(p.bis)} = ${vz(p.a * p.bis)} und ${kl(-p.a)} · ${kl(p.bis)} = ${vz(p.a * -p.bis)}`,
  ablauf: (p) => [
    { k: "links", ms: 1700, text: `Der zweite Faktor wird um 1 kleiner – das Ergebnis jedes Mal um ${p.a}.` },
    { k: "linksNeg", ms: 1700, text: `Das Muster läuft über null weiter: ${p.a} · (−1) = −${p.a}` },
    { k: "rechts", ms: 1700, text: `Bei ${kl(-p.a)} wird das Ergebnis immer um ${p.a} größer.` },
    { k: "rechtsNeg", ms: 1800, text: `Weiter über null: ${kl(-p.a)} · (−1) = ${p.a}. Minus mal minus ist plus.` },
    { k: "regel", ms: 1200, text: "Gleiche Vorzeichen ergeben plus, verschiedene ergeben minus." },
  ],
  bild: ({ Z, z, p }) => {
    const fakt = []; for (let b = p.von; b >= p.bis; b--) fakt.push(b);
    const nPos = fakt.filter((b) => b >= 0).length, n = fakt.length;
    const y0 = 34, dy = 26;
    const spalte = (a, xc, uPos, uNeg, schritt) => (
      <g>
        {fakt.map((b, i) => {
          const neg = b < 0, u = neg ? staffel(uNeg, i - nPos, n - nPos, 0.4) : staffel(uPos, i, nPos, 0.4);
          const e = a * b, yy = y0 + i * dy;
          return (
            <g key={i} opacity={u} transform={`translate(0 ${(1 - raus(u)) * -8})`}>
              {neg && <rect x={xc - 72} y={yy - 16} width={144} height={23} rx="8" fill={F.blauHell} />}
              <Tx x={xc + 8} y={yy} g={14} f={F.tinte} w={800} a="end">{`${kl(a)} · ${kl(b)}`}</Tx>
              <Tx x={xc + 18} y={yy} g={14} f={F.grau} w={700}>=</Tx>
              <Tx x={xc + 52} y={yy} g={14} f={e < 0 ? F.blau : e > 0 ? F.granat : F.tinte} w={800} a="end">{vz(e)}</Tx>
              {i > 0 && <Tx x={xc + 78} y={yy - dy / 2 + 1} g={10} f={F.goldDunkel} w={800} a="start" opacity={teil(u, 0.5, 1)}>{schritt}</Tx>}
            </g>
          );
        })}
      </g>
    );
    const ur = Z("regel");
    const yn = y0 + nPos * dy - 18;
    return (
      <>
        <line x1={B / 2} y1={16} x2={B / 2} y2={y0 + (n - 1) * dy + 8} stroke={F.linie} strokeWidth="1.4" />
        <line x1={14} y1={yn} x2={B - 14} y2={yn} stroke={F.hell} strokeWidth="1.2" strokeDasharray="4 4" opacity={Z("linksNeg")} />
        {spalte(p.a, 86, Z("links"), Z("linksNeg"), `−${p.a}`)}
        {spalte(-p.a, 266, Z("rechts"), Z("rechtsNeg"), `+${p.a}`)}
        {/* Kern-Moment: das Muster springt über null ins Plus */}
        <rect x={266 - 72} y={y0 + nPos * dy - 16} width={144} height={23} rx="8" fill="none" stroke={F.gold} strokeWidth="2.4" opacity={teil(Z("rechtsNeg"), 0, 0.3)} />
        <Puls x={266 + 40} y={y0 + nPos * dy - 5} u={teil(Z("rechtsNeg"), 0.05, 0.6)} r={18} f={F.gold} />
        <Pille x={86} y={204} text="plus · minus = minus" f={F.blauHell} tf={F.blau} g={11.5} o={ur} />
        <Pille x={266} y={204} text="minus · minus = plus" f={F.granatTief} tf={F.goldHell} g={11.5} o={ur} />
      </>
    );
  },
};

/* ============================================================
   skalaAblesen – dieselbe Strichstelle auf Zahlenstrahlen mit verschiedener Einteilung
   p: { reihen: [[von, bis, strich], …], teile: 10 }
   ============================================================ */
const skalaAblesen = {
  h: 220,
  label: (p) => "Skala ablesen: " + p.reihen.map(([a, b, k]) => `${de(a + ((b - a) / (p.teile || 10)) * k)}`).join(", "),
  ablauf: (p) => {
    const t = p.teile || 10, [a, b, k] = p.reihen[0], s = (b - a) / t;
    return [
      { k: "strahlen", ms: 1100, text: "Drei Zahlenstrahlen, jeder mit gleich vielen Abschnitten." },
      { k: "schritt", ms: 1900, text: `Erst die Einteilung: ${de(b - a)} auf ${t} Abschnitte, also 1 Strich = ${de(s)}.` },
      { k: "ablesen", ms: 2000, text: `Dann abzählen: ${k} Striche · ${de(s)} = ${de(k * s)}` },
      { k: "fazit", ms: 1400, text: "Gleiche Stelle – andere Zahl. Die Einteilung entscheidet." },
    ];
  },
  bild: ({ Z, p }) => {
    const t = p.teile || 10, us = Z("strahlen"), uw = Z("schritt"), ua = Z("ablesen"), uf = Z("fazit");
    const x0 = 24, x1 = 232;
    return (
      <>
        <line x1={x0 + ((x1 - x0) * (p.reihen[0][2])) / t} y1={20} x2={x0 + ((x1 - x0) * (p.reihen[0][2])) / t} y2={176} stroke={F.gold} strokeWidth="1.4" strokeDasharray="4 4" opacity={uf * 0.9} />
        {p.reihen.map(([a, b, k], r) => {
          const y = 46 + r * 56, s = (b - a) / t, x = achse({ von: a, bis: b, x0, x1 }), v = a + k * s;
          const ur = staffel(us, r, p.reihen.length, 0.5), uwr = staffel(uw, r, p.reihen.length, 0.5), uar = staffel(ua, r, p.reihen.length, 0.5);
          return (
            <g key={r}>
              <Strich x1={x0 - 8} y1={y} x2={x1 + 10} y2={y} u={ur} b={1.6} />
              {ur >= 1 && <Spitze x={x1 + 14} y={y} g={7} />}
              {Array.from({ length: t + 1 }, (_, i) => {
                const vv = a + i * s, ende = i === 0 || i === t, sicht = klemm(ur * (t + 1) - i);
                return sicht > 0 && (
                  <g key={i} opacity={sicht}>
                    <line x1={x(vv)} y1={y - (ende ? 7 : 4.5)} x2={x(vv)} y2={y + (ende ? 7 : 4.5)} stroke={F.tinte} strokeWidth={ende ? 1.8 : 1.2} />
                    {ende && <Tx x={x(vv)} y={y + 21} g={11} f={F.tinte} w={800}>{de(vv)}</Tx>}
                  </g>
                );
              })}
              {uwr > 0 && (
                <g opacity={uwr}>
                  <path d={`M${x(a)} ${y - 9} q0 -5 4 -5 h${x(a + s) - x(a) - 8} q4 0 4 5`} fill="none" stroke={F.blau} strokeWidth="1.6" />
                  <Tx x={x1 + 24} y={y + 4} g={10.5} f={F.blau} w={800} a="start">{`1 Strich = ${de(s)}`}</Tx>
                </g>
              )}
              {uar > 0 && (
                <g>
                  <Spitze x={x(v)} y={y - 8} winkel={90} f={F.granat} g={9} o={uar} />
                  <line x1={x(v)} y1={y - 22} x2={x(v)} y2={y - 14} stroke={F.granat} strokeWidth="2" opacity={uar} />
                  <Pille x={x(v)} y={y - 28} text={de(Math.round(mix(a, v, uar)))} f={F.granatHell} tf={F.granat} g={11.5} />
                </g>
              )}
            </g>
          );
        })}
        <Pille x={B / 2} y={208} text="gleiche Stelle – andere Zahl" f={F.granatTief} tf={F.goldHell} g={12} o={uf} />
      </>
    );
  },
};

/* ============================================================
   buendeln – zehn Einer werden zu einem Zehner, zehn Zehner zu einem Hunderter
   p: { z: 9, e: 14 }  (z = 9, 10 ≤ e ≤ 19)
   ============================================================ */
const S7 = 7;
const buendeln = {
  h: 234,
  label: (p) => `${p.z} Zehner und ${p.e} Einer gebündelt: ${p.z * 10 + p.e}`,
  ablauf: (p) => {
    const w = p.z * 10 + p.e, h = Math.floor(w / 100), zz = Math.floor((w % 100) / 10), ee = w % 10;
    return [
      { k: "start", ms: 1300, text: `${p.z} Zehner und ${p.e} Einer – zu viele Einer für eine Stelle.` },
      { k: "einer", ms: 2000, text: "10 Einer bündeln: 1 Zehner." },
      { k: "zehner", ms: 2000, text: "Jetzt sind es 10 Zehner. Bündeln: 1 Hunderter." },
      { k: "zahl", ms: 1500, text: `${h} H, ${zz} Z, ${ee} E: das ist ${w}.` },
    ];
  },
  bild: ({ Z, p }) => {
    const w = p.z * 10 + p.e, h = Math.floor(w / 100), zz = Math.floor((w % 100) / 10), ee = w % 10;
    const ue = Z("einer"), uz = Z("zehner"), un = Z("zahl"), u0 = Z("start");
    const cw = (B - 28) / 3, xc = [14 + cw / 2, 14 + cw * 1.5, 14 + cw * 2.5], yt = 62;
    const rodX = (i) => xc[1] - (10 * S7 + 9 * 3) / 2 + i * 10;
    const gridX = (k) => xc[2] - (5 * S7 + 4 * 4) / 2 + (k % 5) * 11, gridY = (k) => yt + 4 + Math.floor(k / 5) * 11;
    const flatX = xc[0] - 5 * S7;
    const zaehl = [uz >= 1 ? 1 : 0, ue < 1 ? p.z : uz < 1 ? p.z + 1 : 0, ue < 1 ? p.e : p.e - 10];
    const voll = (i) => zaehl[i] > 9;
    const rod = (x, y, key, o = 1, f = F.blau) => (
      <g key={key} opacity={o}>
        <rect x={x} y={y} width={S7} height={10 * S7} fill={F.blauHell} stroke={f} strokeWidth="1" />
        {Array.from({ length: 9 }, (_, j) => <line key={j} x1={x} y1={y + (j + 1) * S7} x2={x + S7} y2={y + (j + 1) * S7} stroke={f} strokeWidth="0.5" />)}
      </g>
    );
    const wuerfel = (x, y, key, o = 1) => <rect key={key} x={x} y={y} width={S7} height={S7} fill={F.goldHell} stroke={F.goldDunkel} strokeWidth="1" opacity={o} />;
    /* Einer: 10 fliegen zur Stange, übrige rücken auf */
    const einer = [];
    for (let k = 0; k < p.e; k++) {
      const u = k < 10 ? staffel(ue, k, 10, 0.75) : teil(ue, 0.7, 1);
      const tx = k < 10 ? rodX(p.z) : gridX(k - 10), ty = k < 10 ? yt + k * S7 : gridY(k - 10);
      if (k < 10 && ue >= 1) continue;
      einer.push(wuerfel(mix(gridX(k), tx, raus(u)), mix(gridY(k), ty, raus(u)), k));
    }
    /* Zehner: Stangen (inkl. neuer) fliegen zur Hunderterplatte */
    const zehner = [];
    if (uz > 0) for (let i = 0; i <= p.z; i++) {
      const u = staffel(uz, i, p.z + 1, 0.8);
      if (uz < 1) zehner.push(rod(mix(rodX(i), flatX + i * S7, raus(u)), yt, i));
    }
    else for (let i = 0; i < p.z; i++) zehner.push(rod(rodX(i), yt, i));
    return (
      <>
        <g opacity={u0}>
          {["Hunderter", "Zehner", "Einer"].map((t, i) => (
            <g key={t}>
              <rect x={14 + i * cw + 2} y={16} width={cw - 4} height={24} rx="7" fill={[F.granatHell, F.blauHell, F.goldHell][i]} />
              <Tx x={xc[i]} y={32.5} g={11} f={[F.granat, F.blau, F.goldDunkel][i]} w={800}>{t}</Tx>
              <rect x={14 + i * cw + 2} y={46} width={cw - 4} height={102} rx="9" fill="none" stroke={F.linie} strokeWidth="1.3" />
            </g>
          ))}
        </g>
        {uz >= 1 && (
          <g>
            <rect x={flatX} y={yt} width={10 * S7} height={10 * S7} fill={F.granatHell} stroke={F.granat} strokeWidth="1.2" />
            {Array.from({ length: 9 }, (_, j) => (
              <g key={j}>
                <line x1={flatX + (j + 1) * S7} y1={yt} x2={flatX + (j + 1) * S7} y2={yt + 10 * S7} stroke={F.granat} strokeWidth="0.5" />
                <line x1={flatX} y1={yt + (j + 1) * S7} x2={flatX + 10 * S7} y2={yt + (j + 1) * S7} stroke={F.granat} strokeWidth="0.5" />
              </g>
            ))}
          </g>
        )}
        <g opacity={u0}>{zehner}</g>
        {ue >= 1 && uz <= 0 && rod(rodX(p.z), yt, "neu", 1, F.goldDunkel)}
        <g opacity={u0}>{einer}</g>
        <Puls x={rodX(p.z) + S7 / 2} y={yt + 35} u={teil(ue, 0.85, 1)} r={22} f={F.gold} />
        <Puls x={flatX + 35} y={yt + 35} u={teil(uz, 0.85, 1)} r={34} f={F.granat} />
        {[0, 1, 2].map((i) => (
          <g key={i} opacity={u0}>
            <Tx x={xc[i]} y={174} g={voll(i) ? 18 : 24} f={voll(i) ? F.granat : F.tinte} w={800}>{zaehl[i]}</Tx>
            {voll(i) && <Tx x={xc[i]} y={190} g={9.5} f={F.granat} w={800}>mehr als 9!</Tx>}
          </g>
        ))}
        <g opacity={un}>
          <rect x={14} y={198} width={B - 28} height={28} rx="12" fill={F.granatTief} />
          <Tx x={B / 2} y={217} g={12} f={F.goldHell} w={800}>{`${p.z} Z + ${p.e} E = ${h} H ${zz} Z ${ee} E = ${w}`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   bilddiagramm – ein Symbol steht für mehrere Stimmen; halbe Symbole, ablesen und summieren
   p: { je: 4, daten: [["Fußball", 12], …], frage?: "Lieblingssport" }
   ============================================================ */
const bilddiagramm = {
  h: 216,
  label: (p) => `Bilddiagramm, ein Symbol = ${p.je}: ` + p.daten.map(([n, w]) => `${n} ${w}`).join(", "),
  ablauf: (p) => {
    const halb = p.daten.find(([, w]) => w % p.je !== 0), summe = p.daten.reduce((s, [, w]) => s + w, 0);
    const ab = [
      { k: "legende", ms: 1100, text: `Erst die Legende lesen: Ein Symbol steht für ${p.je} Kinder.` },
      { k: "reihen", ms: 2000, text: "Jede Zeile zeigt eine Sportart." },
      { k: "ablesen", ms: 2200, text: halb ? `Ein halbes Symbol sind ${p.je / 2} Kinder. ${halb[0]}: ${Math.floor(halb[1] / p.je)} · ${p.je} + ${p.je / 2} = ${halb[1]}` : `Symbole zählen, mal ${p.je} rechnen.` },
      { k: "summe", ms: 1300, text: `Zusammen: ${p.daten.map(([, w]) => w).join(" + ")} = ${summe} Kinder` },
    ];
    return ab;
  },
  bild: ({ Z, p }) => {
    const ul = Z("legende"), ur = Z("reihen"), ua = Z("ablesen"), us = Z("summe");
    const summe = p.daten.reduce((s, [, w]) => s + w, 0), r = 9, n = p.daten.length;
    const sym = (cx, cy, halb, key, o = 1) => halb
      ? <path key={key} d={`M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} Z`} fill={F.granat} opacity={o} />
      : <circle key={key} cx={cx} cy={cy} r={r} fill={F.granat} opacity={o} />;
    return (
      <>
        <g opacity={ul}>
          <rect x={B - 150} y={10} width={136} height={26} rx="13" fill={F.goldHell} />
          {sym(B - 132, 23, false, "l")}
          <Tx x={B - 116} y={27.5} g={11.5} f={F.goldDunkel} w={800} a="start">{`= ${p.je} Kinder`}</Tx>
          <Tx x={14} y={28} g={12} f={F.tinte} w={800} a="start">{p.frage || "Lieblingssport"}</Tx>
        </g>
        {p.daten.map(([name, w], i) => {
          const y = 60 + i * 30, voll = Math.floor(w / p.je), halb = w % p.je !== 0, m = voll + (halb ? 1 : 0);
          const ui = staffel(ur, i, n, 0.5);
          return (
            <g key={name}>
              <line x1={14} y1={y + 15} x2={B - 14} y2={y + 15} stroke={F.linie} strokeWidth="1" opacity={ui} />
              <Tx x={18} y={y + 4} g={11.5} f={F.tinte} w={700} a="start" opacity={ui}>{name}</Tx>
              {Array.from({ length: m }, (_, j) => sym(112 + j * 24, y, halb && j === m - 1, j, staffel(ui, j, m, 0.4)))}
              {halb && <Pille x={112 + (m - 1) * 24 + 12} y={y + 3} text={`halb = ${p.je / 2}`} g={9.5} a="start" o={teil(ua, 0.2, 0.5)} />}
              <Tx x={B - 20} y={y + 5} g={14} f={F.granat} w={800} a="end" opacity={staffel(ua, i, n, 0.5)}>{w}</Tx>
            </g>
          );
        })}
        <g opacity={us}>
          <rect x={14} y={182} width={B - 28} height={26} rx="12" fill={F.granatTief} />
          <Tx x={B / 2} y={199.5} g={12} f={F.goldHell} w={800}>{`Zusammen ${summe} Kinder`}</Tx>
        </g>
      </>
    );
  },
};

export const SZENEN_ZWEIT_ZAHLEN = { meeresspiegel, betragAbstand, vorzeichenMuster, skalaAblesen, buendeln, bilddiagramm };
