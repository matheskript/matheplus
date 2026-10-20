/* ============================================================
   Szenen der Gruppe Zahlen und Rechnen (Klasse 5: natürliche Zahlen, Rechnen, Teilbarkeit, ganze Zahlen)
   und die allgemeine Szene „umformung“ (Rechenschritte Zeile für Zeile), die alle Gruppen nutzen dürfen.
   Vertrag siehe kern.jsx.
   ============================================================ */
import React from "react";
import { SZENEN_RECHNEN } from "./szenenRechnen.jsx";
import { SZENEN_GANZ } from "./szenenGanz.jsx";
import { B, F, Tx, Strich, Pfeil, Sprung, Skala, achse, Kasten, Puls, Pille, Tippen, breite, de, mix, klemm, teil, staffel, raus, federnd, sanft, Spitze } from "./kern.jsx";

/* ---------- Hilfen ---------- */
const ROEM = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
export function roemGruppen(n) {
  const g = [];
  for (const [w, z] of ROEM) while (n >= w) { g.push({ z, w }); n -= w; }
  return g;
}
const minus = (s) => String(s).replace(/-/g, "−");

/* ============================================================
   umformung – Rechenweg Zeile für Zeile; der markierte Teil leuchtet auf, Notiz rechts
   p: { zeilen: [{ t: "3 + 4 · (6 − 1)", m: "(6 − 1)", n: "Klammer zuerst" }, …], text?: [Untertitel je Zeile] }
   ============================================================ */
const umformung = {
  h: 0,
  label: (p) => "Rechenweg: " + p.zeilen.map((z) => z.t).join(" = "),
  ablauf: (p) => p.zeilen.flatMap((z, i) => [
    { k: `z${i}`, ms: 650, text: (p.text && p.text[i]) || z.n || (i === p.zeilen.length - 1 ? "Ergebnis" : undefined) },
    { k: `m${i}`, ms: z.m ? 900 : 300 },
  ]),
  bild: ({ Z, p }) => {
    const n = p.zeilen.length, g = p.gross || 19;
    return (
      <>
        {p.zeilen.map((z, i) => {
          const u = Z(`z${i}`, raus), um = Z(`m${i}`);
          const y = 40 + i * 38 + (1 - u) * 14;
          const t = minus(z.t), m = z.m ? minus(z.m) : null;
          const k = m ? t.indexOf(m) : -1;
          const vor = k >= 0 ? t.slice(0, k) : t, mit = k >= 0 ? m : "", nach = k >= 0 ? t.slice(k + m.length) : "";
          const x0 = 30;
          const xm = x0 + breite(vor, g), wm = breite(mit, g);
          const letzte = i === n - 1;
          return (
            <g key={i} opacity={u}>
              {i > 0 && <Tx x={14} y={y} g={g} f={F.grau} w={700}>=</Tx>}
              {k >= 0 && <rect x={xm - 4} y={y - g * 0.95} width={(wm + 8) * um} height={g * 1.35} rx="7" fill={F.goldHell} />}
              {letzte && <rect x={x0 - 6} y={y - g * 0.95} width={breite(t, g) + 12} height={g * 1.35} rx="7" fill="none" stroke={F.granat} strokeWidth="2" opacity={teil(u, 0.4, 1)} />}
              <text x={x0} y={y} fontSize={g} fontWeight="800" style={{ fontFamily: "Montserrat, sans-serif" }} fill={letzte ? F.granat : F.tinte}>
                <tspan>{vor}</tspan><tspan fill={k >= 0 && um > 0.3 ? F.granat : undefined}>{mit}</tspan><tspan>{nach}</tspan>
              </text>
              {z.n && <Pille x={B - 12 - (breite(z.n, 11) + 16)} y={y - 5} a="start" text={z.n} o={teil(um || u, 0.2, 1)} />}
            </g>
          );
        })}
      </>
    );
  },
};
/* Höhe hängt von der Zeilenzahl ab → feste Varianten umformung3/4/5 (höchstens so viele Zeilen) */
const umformungMit = (zeilenMax) => ({ ...umformung, h: 26 + zeilenMax * 38 });

/* ============================================================
   roemisch – Zeichen erscheinen, Werte darunter, dann die Summe
   p: { zahl: 2026 }
   ============================================================ */
const roemisch = {
  h: 200,
  label: (p) => `Römische Zahl für ${p.zahl}`,
  ablauf: (p) => {
    const g = roemGruppen(p.zahl), sub = g.some((x) => x.z.length > 1);
    return [
      { k: "legende", ms: 900, text: "I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000" },
      { k: "zeichen", ms: 300 + g.length * 260, text: `So schreibt man ${de(p.zahl)} römisch.` },
      { k: "werte", ms: 400 + g.length * 320, text: sub ? "Steht ein kleineres Zeichen links vom größeren, wird es abgezogen." : "Jedes Zeichen hat seinen Wert – von groß nach klein." },
      { k: "summe", ms: 1500, text: `Alles addieren: ${g.map((x) => de(x.w)).join(" + ")} = ${de(p.zahl)}` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const g = roemGruppen(p.zahl), n = g.length;
    const spalte = Math.min(56, (B - 30) / n), x0 = B / 2 - (spalte * n) / 2 + spalte / 2;
    const LEG = [["I", 1], ["V", 5], ["X", 10], ["L", 50], ["C", 100], ["D", 500], ["M", 1000]];
    const ul = Z("legende");
    return (
      <>
        {LEG.map(([zch, w], i) => {
          const o = staffel(ul, i, 7, 0.6), x = 30 + i * 50;
          return (
            <g key={zch} opacity={o}>
              <rect x={x - 21} y={8} width={42} height={30} rx="8" fill={F.flaeche} />
              <Tx x={x} y={22} g={12.5} f={F.granat} w={800}>{zch}</Tx>
              <Tx x={x} y={34} g={9.5} f={F.grau} w={700}>{de(w)}</Tx>
            </g>
          );
        })}
        {g.map((gr, i) => {
          const x = x0 + i * spalte;
          const uz = staffel(z("zeichen"), i, n, 0.4), uw = staffel(z("werte"), i, n, 0.45);
          const zahl = gr.z.length > 1;
          return (
            <g key={i}>
              <g opacity={raus(uz)} transform={`translate(0 ${(1 - raus(uz)) * -16})`}>
                <Tx x={x} y={88} g={zahl ? 25 : 30} f={F.tinte} w={800} style={{ fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "0.04em" }}>{gr.z}</Tx>
                {zahl && <rect x={x - spalte / 2 + 5} y={96} width={spalte - 10} height={3} rx="1.5" fill={F.gold} opacity={raus(uw)} />}
              </g>
              <Pfeil x1={x} y1={104} x2={x} y2={120} u={raus(uw)} f={F.hell} b={1.5} />
              <g opacity={raus(uw)}>
                <Tx x={x} y={141} g={15} f={F.granat} w={800}>{de(gr.w)}</Tx>
                {zahl && <Tx x={x} y={156} g={9.5} f={F.grau} w={700}>{`${de(ROEM.find(([, s]) => s === gr.z[1])[0])} − ${de(ROEM.find(([, s]) => s === gr.z[0])[0])}`}</Tx>}
              </g>
            </g>
          );
        })}
        {z("summe") > 0 && (() => {
          const kette = `${g.map((x) => de(x.w)).join(" + ")} =`, gs = n > 6 ? 11.5 : 13;
          const wk = breite(kette, gs), wp = breite(de(p.zahl), 14) + 16, xa = (B - wk - 8 - wp) / 2;
          return (
            <g>
              <Tippen x={xa} y={184} g={gs} f={F.tinte} w={700} u={teil(z("summe"), 0, 0.7)} text={kette} a="start" />
              <Pille x={xa + wk + 8} y={184} a="start" text={de(p.zahl)} g={14} f={F.granat} tf={F.weiss} o={teil(z("summe"), 0.65, 0.9)} />
            </g>
          );
        })()}
      </>
    );
  },
};

/* ============================================================
   zweier – Zahl ins Zweiersystem: Stellen 16, 8, 4, 2, 1 von links füllen
   p: { zahl: 19 }
   ============================================================ */
const zweierStellen = (n) => { const s = []; let w = 1; while (w * 2 <= n) w *= 2; for (; w >= 1; w /= 2) s.push(w); return s.length ? s : [1]; };
const zweier = {
  h: 196,
  label: (p) => `${p.zahl} im Zweiersystem`,
  ablauf: (p) => {
    const st = zweierStellen(p.zahl);
    let rest = p.zahl;
    const ab = [{ k: "stellen", ms: 900, text: "Stellen im Zweiersystem: jede ist das Doppelte der rechten Nachbarin." }];
    st.forEach((w, i) => {
      const passt = w <= rest; const vor = rest; if (passt) rest -= w;
      ab.push({ k: `s${i}`, ms: 900, text: passt ? `Passt ${w} in ${vor}? Ja → Ziffer 1, Rest ${rest}.` : `Passt ${w} in ${vor}? Nein → Ziffer 0.` });
    });
    ab.push({ k: "fertig", ms: 1300, text: `Also ${p.zahl} = ${st.map((w) => (p.zahl & w ? 1 : 0)).join("")} im Zweiersystem.` });
    return ab;
  },
  bild: ({ Z, z, p }) => {
    const st = zweierStellen(p.zahl), n = st.length;
    const w = Math.min(58, (B - 40) / n), x0 = B / 2 - (w * n) / 2;
    let rest = p.zahl;
    const zust = st.map((s, i) => { const passt = s <= rest; if (passt) rest -= s; return { passt, rest }; });
    let aktRest = p.zahl;
    st.forEach((s, i) => { if (z(`s${i}`) >= 0.5) aktRest = zust[i].rest; });
    const uf = Z("fertig");
    return (
      <>
        {st.map((s, i) => {
          const x = x0 + i * w, us = staffel(Z("stellen"), n - 1 - i, n, 0.5), ui = Z(`s${i}`), an = zust[i].passt;
          const voll = ui > 0.35;
          return (
            <g key={s} opacity={us}>
              <Tx x={x + w / 2} y={30} g={13} f={F.blau} w={800}>{s}</Tx>
              {i < n - 1 && <Tx x={x + w} y={30} g={9} f={F.hell} w={700}>· 2</Tx>}
              <rect x={x + 4} y={42} width={w - 8} height={50} rx="10" fill={voll && an ? F.gold : F.weiss} stroke={ui > 0 && ui < 1 ? F.granat : F.linie} strokeWidth={ui > 0 && ui < 1 ? 2.4 : 1.4} />
              {voll && <Tx x={x + w / 2} y={77} g={26} f={an ? F.granatTief : F.hell} w={800} opacity={teil(ui, 0.35, 0.7)}>{an ? 1 : 0}</Tx>}
              <Puls x={x + w / 2} y={67} u={an ? teil(ui, 0.35, 1) : 0} r={22} />
              {an && voll && <Tx x={x + w / 2} y={112} g={11} f={F.goldDunkel} w={800} opacity={teil(ui, 0.5, 0.9)}>+{s}</Tx>}
            </g>
          );
        })}
        <g opacity={teil(Z("stellen"), 0.6, 1)}>
          <rect x={B / 2 - 70} y={124} width={140} height={28} rx="14" fill={F.flaeche} />
          <Tx x={B / 2} y={143} g={13} f={F.tinte} w={700}>Rest: {aktRest}</Tx>
        </g>
        <g opacity={uf}>
          <Tx x={B / 2} y={182} g={18} f={F.granat} w={800}>{`${p.zahl} = ${st.map((s) => (p.zahl & s ? 1 : 0)).join("")}`}<tspan fontSize="11" dy="5">2</tspan></Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   stellentafel – Ziffern fallen in die Stellenwerttafel, dann wird in Dreiergruppen gelesen
   p: { zahl: 3407250 }
   ============================================================ */
const KOPF = ["E", "Z", "H", "T", "ZT", "HT", "M", "ZM", "HM", "Md"];
const stellentafel = {
  h: 196,
  label: (p) => `${de(p.zahl)} in der Stellenwerttafel`,
  ablauf: (p) => {
    const n = String(p.zahl).length;
    return [
      { k: "tafel", ms: 800, text: "Jede Stelle ist zehnmal so viel wert wie die rechts daneben." },
      { k: "ziffern", ms: 400 + n * 280, text: `Die Ziffern von ${de(p.zahl)} kommen in ihre Spalten.` },
      { k: "gruppen", ms: 1300, text: "Von rechts in Dreiergruppen bündeln: Einer, Tausender, Millionen." },
      { k: "lesen", ms: 1600, text: lesen(p.zahl) },
    ];
  },
  bild: ({ Z, z, p }) => {
    const ziff = String(p.zahl).split("").map(Number), n = ziff.length;
    const sp = Math.max(n, 4), w = Math.min(46, (B - 24) / sp), x0 = B / 2 - (w * sp) / 2;
    const ug = Z("gruppen"), ul = Z("lesen");
    const farbe = (stelle) => (stelle >= 6 ? F.granat : stelle >= 3 ? F.blau : F.tinte);
    const grund = (stelle) => (stelle >= 6 ? F.granatHell : stelle >= 3 ? F.blauHell : F.flaeche);
    return (
      <>
        {Array.from({ length: sp }, (_, i) => {
          const stelle = sp - 1 - i, x = x0 + i * w, u = staffel(Z("tafel"), i, sp, 0.6);
          return (
            <g key={i} opacity={u}>
              <rect x={x + 1.5} y={22} width={w - 3} height={22} rx="6" fill={ug > 0 ? grund(stelle) : F.flaeche} />
              <Tx x={x + w / 2} y={37.5} g={11} f={ug > 0.3 ? farbe(stelle) : F.grau} w={800}>{KOPF[stelle]}</Tx>
              <rect x={x + 1.5} y={48} width={w - 3} height={52} rx="8" fill={F.weiss} stroke={F.linie} strokeWidth="1.3" />
            </g>
          );
        })}
        {ziff.map((d, i) => {
          const stelle = n - 1 - i, spalte = sp - 1 - stelle, x = x0 + spalte * w + w / 2;
          const u = staffel(z("ziffern"), i, n, 0.5), y = mix(-10, 84, raus(u));
          return u > 0 && <Tx key={i} x={x} y={y} g={28} f={ug > 0.3 ? farbe(stelle) : F.tinte} w={800} opacity={klemm(u * 3)}>{d}</Tx>;
        })}
        {[0, 3, 6].filter((s) => s < n).map((s, j) => {
          const bis = Math.min(s + 2, sp - 1), xa = x0 + (sp - 1 - bis) * w + 4, xb = x0 + (sp - s) * w - 4;
          const name = ["Einer", "Tausender", "Millionen"][j];
          return (
            <g key={s} opacity={staffel(ug, j, 3, 0.4)}>
              <path d={`M${xa} 108 v6 h${xb - xa} v-6`} fill="none" stroke={farbe(s)} strokeWidth="2" strokeLinecap="round" />
              <Tx x={(xa + xb) / 2} y={130} g={10.5} f={farbe(s)} w={800}>{name}</Tx>
            </g>
          );
        })}
        <g opacity={ul} transform={`translate(0 ${(1 - ul) * 8})`}>
          <rect x={14} y={146} width={B - 28} height={36} rx="12" fill={F.granatTief} />
          <Tx x={B / 2} y={169} g={13} f={F.goldHell} w={800}>{lesen(p.zahl)}</Tx>
        </g>
      </>
    );
  },
};
function lesen(n) {
  const mio = Math.floor(n / 1e6), tsd = Math.floor((n % 1e6) / 1000), rest = n % 1000;
  const t = [];
  if (mio) t.push(`${mio} ${mio === 1 ? "Million" : "Millionen"}`);
  if (tsd) t.push(`${tsd} Tausend`);
  if (rest || !t.length) t.push(String(rest));
  return t.join(" ");
}


/* ============================================================
   strichliste – Striche sammeln sich (Fünferbündel), dann wachsen daraus Säulen
   p: { daten: [["Hund", 7], …], frage?: "Welches Haustier hast du?" }
   ============================================================ */
const strichliste = {
  h: 214,
  label: (p) => "Strichliste wird zum Säulendiagramm: " + p.daten.map(([n, w]) => `${n} ${w}`).join(", "),
  ablauf: (p) => {
    const max = Math.max(...p.daten.map(([, w]) => w)), top = p.daten.find(([, w]) => w === max)[0];
    return [
      { k: "striche", ms: 2600, text: "Strichliste: Jeder fünfte Strich geht quer durch die vier davor." },
      { k: "zahlen", ms: 900, text: "Striche zählen ergibt die Häufigkeit." },
      { k: "saeulen", ms: 1700, text: "Jede Häufigkeit wird zur Säule – je höher, desto häufiger." },
      { k: "max", ms: 1100, text: `Am häufigsten: ${top} mit ${max}.` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const d = p.daten, n = d.length, max = Math.max(...d.map(([, w]) => w));
    const gesamt = d.reduce((s, [, w]) => s + w, 0);
    const us = z("striche"), uz = Z("zahlen"), usa = Z("saeulen", raus), um = Z("max");
    const sw = (B - 40) / n, y0 = 186, hmax = 92;
    let schon = 0;
    return (
      <>
        {d.map(([name, w], i) => {
          const x = 20 + i * sw + sw / 2;
          const sichtbar = Math.round(klemm(us * gesamt - schon, 0, w)); schon += w;
          const striche = [];
          for (let k = 0; k < sichtbar; k++) {
            const bund = Math.floor(k / 5), im = k % 5, bx = x - 26 + bund * 30 + (bund > 0 ? 0 : 0);
            if (im < 4) striche.push(<line key={k} x1={bx + im * 5.5} y1={18} x2={bx + im * 5.5} y2={38} stroke={F.tinte} strokeWidth="2" strokeLinecap="round" />);
            else striche.push(<line key={k} x1={bx - 3} y1={34} x2={bx + 20} y2={21} stroke={F.granat} strokeWidth="2.2" strokeLinecap="round" />);
          }
          const h = (w / max) * hmax * usa, top = w === max;
          return (
            <g key={name}>
              <g opacity={1 - usa * 0.75}>{striche}</g>
              <Tx x={x} y={60} g={16} f={F.granat} w={800} opacity={uz}>{w}</Tx>
              <rect x={x - sw * 0.3} y={y0 - h} width={sw * 0.6} height={h} rx="5" fill={top && um > 0 ? F.granat : F.gold} opacity={usa > 0 ? 1 : 0} />
              {top && <Puls x={x} y={y0 - hmax - 8} u={um} r={16} f={F.granat} />}
              <Tx x={x} y={y0 + 16} g={10.5} f={F.grau} w={700}>{name}</Tx>
            </g>
          );
        })}
        <Strich x1={14} y1={y0} x2={B - 14} y2={y0} f={F.tinte} b={1.5} u={usa > 0 ? 1 : 0} />
      </>
    );
  },
};

/* ============================================================
   zahlenlupe – Zahlen auf dem Zahlenstrahl, eng beieinander liegende unter der Lupe
   p: { von, bis, schritt, zahlen: [..], lupe: [von, bis, schritt] }
   ============================================================ */
const zahlenlupe = {
  h: 214,
  label: (p) => "Zahlen ordnen auf dem Zahlenstrahl: " + [...p.zahlen].sort((a, b) => a - b).map((v) => de(v)).join(" < "),
  ablauf: (p) => [
    { k: "strahl", ms: 900, text: "Auf dem Zahlenstrahl liegt die größere Zahl weiter rechts." },
    { k: "grob", ms: 1500, text: "Grob eingetragen – drei Zahlen liegen fast übereinander." },
    { k: "lupe", ms: 1300, text: "Mit der Lupe: genauer hinsehen." },
    { k: "fein", ms: 1500, text: "Jetzt sieht man die Reihenfolge." },
    { k: "ergebnis", ms: 1300, text: [...p.zahlen].sort((a, b) => a - b).map((v) => de(v)).join(" < ") },
  ],
  bild: ({ Z, z, p }) => {
    const x = achse({ von: p.von, bis: p.bis, x0: 24, x1: B - 30 });
    const [lv, lb, ls] = p.lupe, xl = achse({ von: lv, bis: lb, x0: 30, x1: B - 34 });
    const sortiert = [...p.zahlen].sort((a, b) => a - b);
    const ul = Z("lupe"), uf = z("fein"), ue = Z("ergebnis");
    const farbe = (v) => [F.granat, F.blau, F.goldDunkel, F.gruen, F.tinte][sortiert.indexOf(v) % 5];
    return (
      <>
        <Skala von={p.von} bis={p.bis} schritt={p.schritt} y={52} x={x} u={Z("strahl")} jede={p.jede || 2} />
        {p.zahlen.map((v, i) => {
          const u = staffel(Z("grob", raus), i, p.zahlen.length, 0.4);
          const imLupe = v >= lv && v <= lb;
          return (
            <g key={v} opacity={u}>
              <circle cx={x(v)} cy={52} r={5} fill={farbe(v)} stroke={F.weiss} strokeWidth="1.5" />
              {!imLupe && <Tx x={x(v)} y={30} g={12} f={farbe(v)} w={800}>{de(v)}</Tx>}
            </g>
          );
        })}
        <g opacity={ul}>
          <rect x={x(lv) - 6} y={40} width={x(lb) - x(lv) + 12} height={24} rx="6" fill="none" stroke={F.gold} strokeWidth="2" />
          <path d={`M${x(lv) - 6} 64 L 22 ${mix(64, 112, ul)} M${x(lb) + 6} 64 L ${B - 22} ${mix(64, 112, ul)}`} stroke={F.gold} strokeWidth="1.4" strokeDasharray="4 4" fill="none" />
          <rect x={14} y={112} width={B - 28} height={70} rx="14" fill={F.goldHell} opacity={0.55} />
        </g>
        {ul > 0.6 && <Skala von={lv} bis={lb} schritt={ls} y={150} x={xl} u={teil(ul, 0.6, 1)} jede={p.lupeJede || 2} />}
        {p.zahlen.filter((v) => v >= lv && v <= lb).map((v, i, arr) => {
          const u = staffel(uf, i, arr.length, 0.5);
          return (
            <g key={v} opacity={u}>
              <circle cx={xl(v)} cy={150} r={6} fill={farbe(v)} stroke={F.weiss} strokeWidth="1.5" />
              <Tx x={xl(v)} y={134 - (i % 2) * 0} g={12.5} f={farbe(v)} w={800}>{de(v)}</Tx>
            </g>
          );
        })}
        <g opacity={ue}>
          <rect x={14} y={190} width={B - 28} height={22} rx="11" fill={F.granatTief} />
          <Tx x={B / 2} y={205} g={12} f={F.goldHell} w={800}>{sortiert.map((v) => de(v)).join("  <  ")}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   runden – Zahl auf dem Strahl zwischen zwei Rundungszahlen, die Mitte entscheidet
   p: { zahl: 84739, stelle: 1000 }
   ============================================================ */
const STELLE_NAME = { 10: "Zehner", 100: "Hunderter", 1000: "Tausender", 10000: "Zehntausender", 100000: "Hunderttausender" };
const runden = {
  h: 196,
  label: (p) => `${de(p.zahl)} auf ${STELLE_NAME[p.stelle]} runden`,
  ablauf: (p) => {
    const unten = Math.floor(p.zahl / p.stelle) * p.stelle, mitte = unten + p.stelle / 2, auf = p.zahl >= mitte;
    const ziffer = Math.floor((p.zahl % p.stelle) / (p.stelle / 10));
    return [
      { k: "nachbarn", ms: 1100, text: `${de(p.zahl)} liegt zwischen ${de(unten)} und ${de(unten + p.stelle)}.` },
      { k: "zahl", ms: 1000 },
      { k: "mitte", ms: 1200, text: `Die Mitte ist ${de(mitte)}. Rechts neben der Rundungsstelle steht ${ziffer}.` },
      { k: "rund", ms: 1300, text: `${ziffer} ${auf ? "≥ 5 → aufrunden" : "≤ 4 → abrunden"}: ${de(p.zahl)} ≈ ${de(auf ? unten + p.stelle : unten)}` },
    ];
  },
  bild: ({ Z, p }) => {
    const unten = Math.floor(p.zahl / p.stelle) * p.stelle, oben = unten + p.stelle, mitte = unten + p.stelle / 2, auf = p.zahl >= mitte;
    const ziel = auf ? oben : unten;
    const x = achse({ von: unten, bis: oben, x0: 40, x1: B - 40 });
    const un = Z("nachbarn"), uz = Z("zahl", federnd), um = Z("mitte"), ur = Z("rund");
    const s = de(p.zahl), roh = String(p.zahl), zpos = roh.length - String(p.stelle).length;
    /* Index der n-ten Ziffer in der formatierten Zahl (Tausenderpunkte überspringen) */
    const idx = (n) => { let k = -1; for (let i = 0; i < s.length; i++) { if (/\d/.test(s[i])) k++; if (k === n) return i; } return -1; };
    const pos = idx(zpos), rechts = idx(zpos + 1);
    return (
      <>
        <Skala von={unten} bis={oben} schritt={p.stelle / 10} y={110} x={x} u={un} jede={10} />
        <g opacity={um}>
          <line x1={x(mitte)} y1={92} x2={x(mitte)} y2={128} stroke={F.blau} strokeWidth="2" strokeDasharray="4 3" />
          <Tx x={x(mitte)} y={146} g={11} f={F.blau} w={800}>Mitte {de(mitte)}</Tx>
        </g>
        <g opacity={klemm(uz)}>
          <circle cx={x(p.zahl)} cy={110} r={6.5} fill={F.granat} stroke={F.weiss} strokeWidth="2" transform={`translate(0 ${(1 - uz) * -30})`} />
        </g>
        {ur > 0 && <Sprung xa={x(p.zahl)} xb={x(ziel)} y={104} hoch={30} u={ur} f={F.gold} />}
        {ur > 0.9 && <circle cx={x(ziel)} cy={110} r={7} fill={F.gold} stroke={F.weiss} strokeWidth="2" />}
        <g opacity={teil(un, 0.3, 1)}>
          <text x={B / 2} y={40} textAnchor="middle" fontSize="24" fontWeight="800" style={{ fontFamily: "Montserrat, sans-serif" }} fill={F.tinte}>
            {s.split("").map((c, i) => <tspan key={i} fill={i === pos && um > 0 ? F.granat : i === rechts && um > 0 ? F.blau : undefined}
              textDecoration={i === pos && um > 0 ? "underline" : undefined}>{c}</tspan>)}
            <tspan fill={F.grau} fontSize="16" dx="8">≈</tspan>
            <tspan fill={F.granat} dx="8" opacity={ur}>{de(ziel)}</tspan>
          </text>
          <Tx x={B / 2} y={62} g={10.5} f={F.grau} w={700}>auf {STELLE_NAME[p.stelle]} runden</Tx>
        </g>
        <g opacity={ur}>
          <Pille x={B / 2} y={182} text={auf ? "aufrunden: 5, 6, 7, 8, 9" : "abrunden: 0, 1, 2, 3, 4"} f={F.granatHell} tf={F.granat} g={11.5} />
        </g>
      </>
    );
  },
};

/* ============================================================
   rechenstrich – Kopfrechnen am leeren Zahlenstrahl: Start, Sprünge, Ergebnis
   p: { aufgabe: "296 + 457", start: 457, spruenge: [300, -4] }
   ============================================================ */
const rechenstrich = {
  h: 170,
  label: (p) => `Rechenstrich: ${p.aufgabe}`,
  ablauf: (p) => {
    let w = p.start;
    return [
      { k: "start", ms: 1000, text: p.starttext || `Start bei ${de(p.start)}.` },
      ...p.spruenge.map((s, i) => { w += s; return { k: `j${i}`, ms: 1300, text: `${s > 0 ? "+" : "−"} ${de(Math.abs(s))} → ${de(w)}` }; }),
      { k: "ende", ms: 1000, text: `${minus(p.aufgabe)} = ${de(w)}` },
    ];
  },
  bild: ({ Z, p }) => {
    const pts = [p.start]; p.spruenge.forEach((s) => pts.push(pts[pts.length - 1] + s));
    /* leerer Rechenstrich: nicht maßstäblich – kleine Sprünge bekommen Mindestbreite */
    const groesst = Math.max(...p.spruenge.map(Math.abs));
    const vis = [0]; p.spruenge.forEach((s) => vis.push(vis[vis.length - 1] + Math.sign(s) * Math.max(Math.abs(s) / groesst, 0.28)));
    const lo = Math.min(...vis), hi = Math.max(...vis);
    const xv = (i) => 36 + ((vis[i] - lo) / (hi - lo || 1)) * (B - 72);
    const x = (v) => xv(pts.indexOf(v));
    const y = 100, ue = Z("ende");
    return (
      <>
        <Strich x1={12} y1={y} x2={B - 12} y2={y} u={Z("start")} b={2} />
        {pts.map((v, i) => {
          const u = i === 0 ? Z("start") : Z(`j${i - 1}`);
          const letzte = i === pts.length - 1;
          return (
            <g key={i} opacity={teil(u, 0.7, 1)}>
              <line x1={xv(i)} y1={y - 7} x2={xv(i)} y2={y + 7} stroke={letzte ? F.granat : F.tinte} strokeWidth="2" />
              <Tx x={xv(i)} y={i > 0 && p.spruenge[i - 1] < 0 ? y - 14 : y + 24} g={letzte ? 14 : 12} f={letzte ? F.granat : F.tinte} w={800}>{de(v)}</Tx>
            </g>
          );
        })}
        {p.spruenge.map((s, i) => (
          <Sprung key={i} xa={xv(i)} xb={xv(i + 1)} y={s > 0 ? y - 4 : y + 4} hoch={(s > 0 ? 1 : -1) * Math.min(52, 16 + Math.abs(xv(i + 1) - xv(i)) * 0.22)} u={Z(`j${i}`)}
            f={s > 0 ? F.gold : F.blau} bf={s > 0 ? F.goldDunkel : F.blau} beschriftung={`${s > 0 ? "+" : "−"} ${de(Math.abs(s))}`} />
        ))}
        <g opacity={ue}>
          <Pille x={B / 2} y={162} text={`${minus(p.aufgabe)} = ${de(pts[pts.length - 1])}`} f={F.granatTief} tf={F.goldHell} g={13} />
        </g>
      </>
    );
  },
};

/* ============================================================
   malfeld – Punktefeld: a Reihen mit je b Punkten; dann geteilt (Umkehraufgabe)
   p: { a: 3, b: 8 }
   ============================================================ */
const malfeld = {
  h: 196,
  label: (p) => `${p.a} · ${p.b} = ${p.a * p.b} als Punktefeld`,
  ablauf: (p) => [
    ...Array.from({ length: p.a }, (_, i) => ({ k: `r${i}`, ms: 520, text: i === 0 ? `Eine Reihe mit ${p.b} Punkten …` : `${i + 1} Reihen mit je ${p.b} Punkten` })),
    { k: "mal", ms: 1100, text: `${p.a} · ${p.b} = ${p.a * p.b}` },
    { k: "teilen", ms: 1500, text: `Umgekehrt: ${p.a * p.b} Punkte in Reihen zu ${p.b} → ${p.a * p.b} : ${p.b} = ${p.a}` },
  ],
  bild: ({ Z, p }) => {
    const d = Math.min(28, (B - 120) / p.b, 120 / p.a), x0 = (B - d * p.b) / 2 + d / 2, y0 = 34;
    const um = Z("mal"), ut = Z("teilen");
    return (
      <>
        {Array.from({ length: p.a }, (_, r) => {
          const u = Z(`r${r}`, raus);
          return (
            <g key={r}>
              {Array.from({ length: p.b }, (_, c) => {
                const uu = staffel(u, c, p.b, 0.7);
                return <circle key={c} cx={x0 + c * d} cy={y0 + r * d + (1 - uu) * -10} r={d * 0.32 * uu} fill={r % 2 ? F.granat : F.gold} />;
              })}
              <rect x={x0 - d / 2 - 4} y={y0 + r * d - d / 2 + 1} width={d * p.b + 8} height={d - 2} rx={d / 2} fill="none" stroke={F.blau} strokeWidth="1.6" opacity={ut} />
              <Tx x={x0 - d / 2 - 14} y={y0 + r * d + 4} g={11} f={F.blau} w={800} a="end" opacity={ut}>{r + 1}</Tx>
            </g>
          );
        })}
        <g opacity={um} transform={`translate(0 ${(1 - um) * 6})`}>
          <Tx x={B / 2} y={y0 + p.a * d + 24} g={18} f={F.tinte} w={800}>{`${p.a} · ${p.b} = ${p.a * p.b}`}</Tx>
          <Tx x={B / 2} y={y0 + p.a * d + 40} g={10} f={F.grau} w={700}>Faktor · Faktor = Produkt</Tx>
        </g>
        <g opacity={ut}>
          <Pille x={B / 2} y={y0 + p.a * d + 66} text={`${p.a * p.b} : ${p.b} = ${p.a}`} f={F.blauHell} tf={F.blau} g={14} />
        </g>
      </>
    );
  },
};

/* ============================================================
   distributiv – Rechteckmodell: a · (100 − b) = a · 100 − a · b
   p: { a: 12, gross: 100, klein: 2 }  (klein > 0 → minus)
   ============================================================ */
const distributiv = {
  h: 200,
  label: (p) => `${p.a} · ${p.gross - p.klein} mit dem Distributivgesetz`,
  ablauf: (p) => [
    { k: "feld", ms: 1300, text: `${p.a} · ${p.gross - p.klein} ist ein Rechteck: ${p.a} hoch, ${p.gross - p.klein} breit.` },
    { k: "voll", ms: 1300, text: `Leichter: das volle Rechteck ${p.a} · ${p.gross} = ${de(p.a * p.gross)} …` },
    { k: "weg", ms: 1400, text: `… minus den schmalen Streifen ${p.a} · ${p.klein} = ${p.a * p.klein}.` },
    { k: "ergebnis", ms: 1200, text: `${p.a} · ${p.gross - p.klein} = ${de(p.a * p.gross)} − ${p.a * p.klein} = ${de(p.a * (p.gross - p.klein))}` },
  ],
  bild: ({ Z, p }) => {
    const W = 236, Hh = 74, x0 = 42, y0 = 46, ws = Math.max(12, (p.klein / p.gross) * W);
    const uf = Z("feld"), uv = Z("voll"), uw = Z("weg"), ue = Z("ergebnis");
    return (
      <>
        <rect x={x0} y={y0} width={(W - ws) * uf} height={Hh} rx="4" fill={F.goldHell} stroke={F.gold} strokeWidth="1.6" />
        <g opacity={uv}>
          <rect x={x0} y={y0} width={W} height={Hh} rx="4" fill="none" stroke={F.granat} strokeWidth="2" strokeDasharray="6 4" />
          <Tx x={x0 + W / 2} y={y0 - 10} g={12} f={F.granat} w={800}>{p.gross}</Tx>
        </g>
        <g opacity={uw} transform={`translate(${uw * 18} ${uw * -6})`}>
          <rect x={x0 + W - ws} y={y0} width={ws} height={Hh} rx="3" fill={F.rosa} stroke={F.granat} strokeWidth="1.6" />
          <Tx x={x0 + W - ws / 2} y={y0 + Hh + 16} g={11} f={F.granat} w={800}>{p.klein}</Tx>
          <Tx x={x0 + W + 12} y={y0 + Hh / 2 + 4} g={11} f={F.granat} w={800} a="start">−{p.a * p.klein}</Tx>
        </g>
        <g opacity={uf}>
          <Tx x={x0 - 10} y={y0 + Hh / 2 + 5} g={13} f={F.tinte} w={800} a="end">{p.a}</Tx>
          <Tx x={x0 + (W - ws) / 2} y={y0 + Hh / 2 + 6} g={15} f={F.goldDunkel} w={800} opacity={uv > 0.5 ? 0 : 1}>{p.gross - p.klein}</Tx>
          <Tx x={x0 + (W - ws) / 2} y={y0 + Hh / 2 + 6} g={15} f={F.goldDunkel} w={800} opacity={teil(uv, 0.5, 1)}>{de(p.a * p.gross)}</Tx>
        </g>
        <g opacity={ue}>
          <Pille x={B / 2} y={182} text={`${p.a} · ${p.gross - p.klein} = ${de(p.a * p.gross)} − ${p.a * p.klein} = ${de(p.a * (p.gross - p.klein))}`} f={F.granatTief} tf={F.goldHell} g={12.5} />
        </g>
      </>
    );
  },
};

/* ============================================================
   quadrat – Quadratzahl als Quadrat aus Einheitskästchen, Reihe für Reihe
   p: { n: 5 }
   ============================================================ */
const quadrat = {
  h: 200,
  label: (p) => `${p.n}² = ${p.n * p.n}`,
  ablauf: (p) => [
    { k: "seite", ms: 900, text: `Ein Quadrat mit der Seite ${p.n}.` },
    { k: "fuellen", ms: 400 + p.n * 300, text: `${p.n} Reihen mit je ${p.n} Kästchen.` },
    { k: "potenz", ms: 1300, text: `${p.n} · ${p.n} = ${p.n}² = ${p.n * p.n}. Der Exponent 2 zählt die Faktoren.` },
    { k: "reihe", ms: 1300, text: "Quadratzahlen: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 …" },
  ],
  bild: ({ Z, z, p }) => {
    const n = p.n, d = Math.min(24, 130 / n), x0 = 40, y0 = 30;
    const us = Z("seite"), uf = z("fuellen"), up = Z("potenz"), ur = Z("reihe");
    return (
      <>
        <rect x={x0} y={y0} width={n * d * us} height={n * d} rx="4" fill="none" stroke={F.tinte} strokeWidth="2" opacity={us > 0 ? 1 : 0} />
        {Array.from({ length: n * n }, (_, k) => {
          const r = Math.floor(k / n), c = k % n, u = staffel(uf, k, n * n, 0.75);
          return u > 0 && <rect key={k} x={x0 + c * d + 1.5} y={y0 + r * d + 1.5} width={d - 3} height={d - 3} rx="3" fill={r % 2 ? F.granat : F.gold} opacity={u} />;
        })}
        <g opacity={us}>
          <Tx x={x0 + (n * d) / 2} y={y0 - 8} g={12} f={F.blau} w={800}>{n}</Tx>
          <Tx x={x0 - 10} y={y0 + (n * d) / 2 + 4} g={12} f={F.blau} w={800} a="end">{n}</Tx>
        </g>
        <g opacity={up} transform={`translate(${(1 - up) * 10} 0)`}>
          <Tx x={x0 + n * d + 26} y={y0 + 40} g={22} f={F.granat} w={800} a="start">{n}<tspan fontSize="13" dy="-10">2</tspan><tspan dy="10"> = {n * n}</tspan></Tx>
          <Tx x={x0 + n * d + 26} y={y0 + 62} g={11.5} f={F.grau} w={700} a="start">{`${n} · ${n} = ${n * n}`}</Tx>
        </g>
        <g opacity={ur}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k, i) => (
            <g key={k} opacity={staffel(ur, i, 10, 0.6)}>
              <rect x={12 + i * 34} y={168} width={30} height={24} rx="7" fill={k === n ? F.granat : F.flaeche} />
              <Tx x={27 + i * 34} y={184} g={11} f={k === n ? F.weiss : F.tinte} w={800}>{k * k}</Tx>
            </g>
          ))}
        </g>
      </>
    );
  },
};

export const SZENEN_ZAHLEN = {
  ...SZENEN_RECHNEN,
  ...SZENEN_GANZ,
  strichliste, zahlenlupe, runden, rechenstrich, malfeld, distributiv, quadrat,
  umformung3: umformungMit(3),
  umformung4: umformungMit(4),
  umformung5: umformungMit(5),
  roemisch,
  zweier,
  stellentafel,
};
