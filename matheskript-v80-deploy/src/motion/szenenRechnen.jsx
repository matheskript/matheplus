/* ============================================================
   Szenen Rechnen (Klasse 5): schriftliche Verfahren, Teiler, Teilbarkeit, Primfaktoren, ggT und kgV.
   Vertrag siehe kern.jsx. Wird über szenenZahlen.jsx registriert.
   ============================================================ */
import React from "react";
import { B, F, Tx, Strich, Sprung, Skala, achse, Kasten, Puls, Pille, Tippen, breite, de, mix, klemm, teil, staffel, raus, federnd } from "./kern.jsx";

const ziffern = (n) => String(n).split("").map(Number);
const SCHRIFT = { fontFamily: "Montserrat, sans-serif" };

/* ============================================================
   schriftlich – Addieren / Subtrahieren (Ergänzungsverfahren), Stelle unter Stelle, von rechts
   p: { art: "plus" | "minus", a: 4758, b: 2697 }
   ============================================================ */
function schrittePlusMinus(p) {
  const A = ziffern(p.a).reverse(), Bz = ziffern(p.b).reverse(), n = Math.max(A.length, Bz.length);
  const st = []; let ue = 0;
  for (let i = 0; i < n; i++) {
    const a = A[i] || 0, b = Bz[i] || 0;
    if (p.art === "plus") {
      const s = a + b + ue, text = `${a} + ${b}${ue ? " + 1" : ""} = ${s}` + (s >= 10 ? ` → ${s % 10} schreiben, 1 übertragen` : ` → ${s} schreiben`);
      st.push({ ziffer: s % 10, ue: s >= 10 ? 1 : 0, text }); ue = s >= 10 ? 1 : 0;
    } else {
      const unten = b + ue, oben = a < unten ? a + 10 : a, d = oben - unten;
      const text = `${b}${ue ? " + 1 = " + unten : ""} und wie viel ist ${oben}? ${d}` + (a < unten ? " – 1 übertragen" : "");
      st.push({ ziffer: d, ue: a < unten ? 1 : 0, text }); ue = a < unten ? 1 : 0;
    }
  }
  if (p.art === "plus" && ue) st.push({ ziffer: 1, ue: 0, text: "Übertrag 1 nach vorn schreiben" });
  return st;
}
const schriftlich = {
  h: 176,
  label: (p) => `Schriftlich ${p.art === "plus" ? "addieren" : "subtrahieren"}: ${p.a} ${p.art === "plus" ? "+" : "−"} ${p.b}`,
  ablauf: (p) => [
    { k: "auf", ms: 1000, text: "Stelle unter Stelle schreiben: Einer unter Einer." },
    ...schrittePlusMinus(p).map((s, i) => ({ k: `s${i}`, ms: 1250, text: s.text })),
    { k: "ende", ms: 1100, text: p.art === "plus"
      ? `Ergebnis ${de(p.a + p.b)} – der Überschlag ${de(Math.round(p.a / 100) * 100 + Math.round(p.b / 100) * 100)} passt.`
      : `Ergebnis ${de(p.a - p.b)}. Probe: ${de(p.a - p.b)} + ${de(p.b)} = ${de(p.a)}` },
  ],
  bild: ({ Z, z, p }) => {
    const st = schrittePlusMinus(p), n = Math.max(String(p.a).length, String(p.b).length, st.length) + 1;
    const cw = 30, xr = B / 2 + (n * cw) / 2 - cw / 2;   // Mitte der Einerspalte
    const xc = (i) => xr - i * cw;                          // i = Stelle von rechts
    const ua = Z("auf"), ue = Z("ende");
    const zeile = (zahl, y, f = F.tinte) => ziffern(zahl).reverse().map((d, i) => <Tx key={i} x={xc(i)} y={y} g={23} f={f} w={800}>{d}</Tx>);
    const akt = st.findIndex((_, i) => z(`s${i}`) > 0 && z(`s${i}`) < 1);
    return (
      <>
        {akt >= 0 && <rect x={xc(akt) - cw / 2 + 2} y={22} width={cw - 4} height={130} rx="8" fill={F.goldHell} />}
        <g opacity={ua}>
          {Array.from({ length: n - 1 }, (_, i) => <Tx key={`k${i}`} x={xc(i)} y={15} g={9.5} f={F.grau} w={800}>{["E", "Z", "H", "T", "ZT", "HT"][i]}</Tx>)}
          {zeile(p.a, 50)}
          {zeile(p.b, 84)}
          <Tx x={xc(n - 1) - 4} y={84} g={23} f={F.granat} w={800}>{p.art === "plus" ? "+" : "−"}</Tx>
          <Strich x1={xc(n - 1) - 18} y1={108} x2={xr + 18} y2={108} u={ua} b={2.4} />
        </g>
        {st.map((s, i) => {
          const u = Z(`s${i}`);
          return (
            <g key={i}>
              {s.ue > 0 && <Tx x={xc(i + 1)} y={101} g={11.5} f={F.granat} w={800} opacity={teil(u, 0.55, 0.9)}>1</Tx>}
              {/* der volle Zehner wandert als Übertrag eine Spalte nach links */}
              {s.ue > 0 && u > 0.3 && u < 1 && (
                <path d={`M${xc(i) - 6} 126 Q ${xc(i) - cw * 0.7} 118 ${xc(i + 1) + 5} 104`} fill="none" stroke={F.gold} strokeWidth="2.2" strokeLinecap="round"
                  strokeDasharray="40" strokeDashoffset={40 * (1 - teil(u, 0.3, 0.6))} opacity={1 - teil(u, 0.85, 1)} />
              )}
              <Tx x={xc(i)} y={140 + (1 - raus(teil(u, 0.3, 0.8))) * -10} g={23} f={F.granat} w={800} opacity={teil(u, 0.3, 0.7)}>{s.ziffer}</Tx>
            </g>
          );
        })}
        <g opacity={ue}>
          <rect x={xc(st.length - 1) - cw / 2 - 2} y={117} width={st.length * cw + 4} height={32} rx="9" fill="none" stroke={F.granat} strokeWidth="2" />
          <Tx x={B - 14} y={170} g={11} f={F.grau} w={700} a="end">{p.art === "plus" ? "Überschlag: " + de(Math.round(p.a / 100) * 100) + " + " + de(Math.round(p.b / 100) * 100) + " = " + de(Math.round(p.a / 100) * 100 + Math.round(p.b / 100) * 100) : "Probe: " + de(p.a - p.b) + " + " + de(p.b) + " = " + de(p.a)}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   schriftlichMal – Teilprodukte, jedes eine Stelle versetzt, dann addieren
   p: { a: 528, b: 34 }
   ============================================================ */
const schriftlichMal = {
  h: 214,
  label: (p) => `Schriftlich multiplizieren: ${p.a} · ${p.b}`,
  ablauf: (p) => {
    const bz = ziffern(p.b);
    return [
      { k: "auf", ms: 900, text: `${de(p.a)} · ${p.b}: Ziffer für Ziffer von ${p.b} malnehmen.` },
      ...bz.map((d, i) => {
        const st = bz.length - 1 - i;
        return { k: `t${i}`, ms: 1600, text: st > 0
          ? `${de(p.a)} · ${d} = ${de(p.a * d)}. Die ${d} meint ${d}${"0".repeat(st)}: ${st === 1 ? "eine Stelle" : `${st} Stellen`} nach links.`
          : `${de(p.a)} · ${d} = ${de(p.a * d)}, die Einer stehen ganz rechts.` };
      }),
      { k: "summe", ms: 1500, text: `Die Teilprodukte addieren: ${de(p.a * p.b)}.` },
    ];
  },
  bild: ({ Z, p }) => {
    const az = String(p.a), bzs = String(p.b), bz = ziffern(p.b);
    const top = `${az}·${bzs}`;                          // Spalten 0 … top.length-1
    const ende = top.length - 1, teile = bz.map((d, i) => ({ zahl: String(p.a * d), endCol: ende - (bz.length - 1 - i) }));
    const summe = String(p.a * p.b);
    const minCol = Math.min(0, ...teile.map((t) => t.endCol - t.zahl.length + 1), ende - summe.length + 1);
    const cw = 24, sp = ende - minCol + 1, x0 = B / 2 - (sp * cw) / 2 + cw / 2;
    const xc = (col) => x0 + (col - minCol) * cw;
    const ua = Z("auf"), us = Z("summe");
    const zeile = (txt, endCol, y, f, u = 1) => txt.split("").map((c, k) => {
      const col = endCol - txt.length + 1 + k, uu = staffel(u, txt.length - 1 - k, txt.length, 0.5);
      return <Tx key={k} x={xc(col)} y={y} g={21} f={f} w={800} opacity={uu}>{c}</Tx>;
    });
    return (
      <>
        <g opacity={ua}>{zeile(top, ende, 40, F.tinte)}</g>
        <Strich x1={xc(minCol) - 14} y1={52} x2={xc(ende) + 14} y2={52} u={ua} b={2.2} />
        {teile.map((t, i) => {
          const u = Z(`t${i}`), col = ende - (bz.length - 1 - i);
          return (
            <g key={i}>
              {u > 0 && u < 1 && <rect x={xc(col) - cw / 2 + 1} y={22} width={cw - 2} height={26} rx="6" fill={F.goldHell} />}
              {zeile(t.zahl, t.endCol, 80 + i * 30, i % 2 ? F.blau : F.goldDunkel, teil(u, 0.2, 1))}
              {/* die weggelassenen Nullen: darum rückt die Zeile nach links */}
              {Array.from({ length: ende - t.endCol }, (_, k) => (
                <g key={`n${k}`} opacity={teil(u, 0.6, 0.9)}>
                  <rect x={xc(t.endCol + 1 + k) - cw / 2 + 2} y={80 + i * 30 - 19} width={cw - 4} height={25} rx="6" fill="none" stroke={F.gold} strokeWidth="2" strokeDasharray="3 2" />
                  <Tx x={xc(t.endCol + 1 + k)} y={80 + i * 30} g={21} f={F.gold} w={800}>0</Tx>
                </g>
              ))}
              {u > 0 && <Tx x={xc(col)} y={40} g={21} f={F.granat} w={800} opacity={u < 1 ? 1 : 0}>{bzs[i]}</Tx>}
            </g>
          );
        })}
        <Strich x1={xc(minCol) - 14} y1={80 + (bz.length - 1) * 30 + 12} x2={xc(ende) + 14} y2={80 + (bz.length - 1) * 30 + 12} u={us} b={2.2} />
        <g>{zeile(summe, ende, 80 + bz.length * 30 + 8, F.granat, teil(us, 0.2, 1))}</g>
        <g opacity={teil(us, 0.6, 1)}>
          <Tx x={B / 2} y={206} g={11} f={F.grau} w={700}>{`Überschlag: ${de(Math.round(p.a / 100) * 100)} · ${p.b} = ${de(Math.round(p.a / 100) * 100 * p.b)}`}</Tx>
        </g>
      </>
    );
  },
};

/* ============================================================
   schriftlichGeteilt – von links: wie oft passt der Divisor? zurückrechnen, abziehen, herunterholen
   p: { a: 9435, b: 15 }
   ============================================================ */
function teilSchritte(a, b) {
  const d = String(a); let i = 0, rest = 0; const st = [];
  let teil = 0;
  while (i < d.length && teil < b) { teil = teil * 10 + Number(d[i]); i++; }
  let quot = "";
  for (;;) {
    const q = Math.floor(teil / b), prod = q * b, r = teil - prod;
    quot += q;
    st.push({ teil, q, prod, rest: r, endCol: i - 1, holt: i < d.length ? d[i] : null });
    if (i >= d.length) { rest = r; break; }
    teil = r * 10 + Number(d[i]); i++;
  }
  return { st, quot: Number(quot), rest };
}
const schriftlichGeteilt = {
  h: 236,
  label: (p) => `Schriftlich dividieren: ${p.a} : ${p.b}`,
  ablauf: (p) => {
    const { st } = teilSchritte(p.a, p.b);
    return [
      { k: "auf", ms: 900, text: `${de(p.a)} : ${p.b} – von links anfangen.` },
      ...st.flatMap((s, i) => [
        { k: `q${i}`, ms: 1100, text: `${s.teil} : ${p.b} = ${s.q}, denn ${s.q} · ${p.b} = ${s.prod}.` },
        { k: `r${i}`, ms: 1100, text: s.holt != null ? `${s.teil} − ${s.prod} = ${s.rest}, die ${s.holt} herunterholen.` : `${s.teil} − ${s.prod} = ${s.rest}. Fertig.` },
      ]),
      { k: "ende", ms: 1100, text: `Ergebnis ${de(teilSchritte(p.a, p.b).quot)}. Probe: ${teilSchritte(p.a, p.b).quot} · ${p.b} = ${de(p.a)}` },
    ];
  },
  bild: ({ Z, p }) => {
    const { st, quot } = teilSchritte(p.a, p.b), d = String(p.a), cw = 19, g = 18;
    const kopf = `${d} : ${p.b} = `, q = String(quot);
    const x0 = B / 2 - (breite(kopf, g) + q.length * cw) / 2 + 4;
    const xc = (col) => x0 + col * cw + cw / 2;
    const ua = Z("auf");
    let y = 64;
    const zeilen = [];
    st.forEach((s, i) => {
      const uq = Z(`q${i}`), ur = Z(`r${i}`);
      const pr = String(s.prod), endCol = s.endCol;
      zeilen.push(
        <g key={`p${i}`} opacity={teil(uq, 0.4, 1)}>
          <Tx x={xc(endCol - pr.length + 1) - cw * 0.75} y={y} g={g} f={F.blau} w={800}>−</Tx>
          {pr.split("").map((c, k) => <Tx key={k} x={xc(endCol - pr.length + 1 + k)} y={y} g={g} f={F.blau} w={800}>{c}</Tx>)}
          <line x1={xc(endCol - Math.max(pr.length, String(s.teil).length) + 1) - cw * 0.9} y1={y + 6} x2={xc(endCol) + cw / 2} y2={y + 6} stroke={F.tinte} strokeWidth="1.6" />
        </g>,
      );
      y += 26;
      const restTxt = String(s.rest) + (s.holt != null ? s.holt : ""), rEnd = s.holt != null ? endCol + 1 : endCol;
      zeilen.push(
        <g key={`r${i}`} opacity={teil(ur, 0, 0.5)}>
          {restTxt.split("").map((c, k) => {
            const geholt = s.holt != null && k === restTxt.length - 1;
            const yy = geholt ? mix(30, y, raus(teil(ur, 0.4, 1))) : y;
            return <Tx key={k} x={xc(rEnd - restTxt.length + 1 + k)} y={yy} g={g} f={geholt ? F.granat : F.tinte} w={800} opacity={geholt ? teil(ur, 0.4, 0.6) : 1}>{c}</Tx>;
          })}
        </g>,
      );
      y += 26;
    });
    return (
      <>
        <g opacity={ua}>
          {d.split("").map((c, k) => <Tx key={k} x={xc(k)} y={34} g={g} f={F.tinte} w={800}>{c}</Tx>)}
          <Tx x={xc(d.length - 1) + cw / 2 + 4} y={34} g={g} f={F.tinte} w={800} a="start">{`: ${p.b} =`}</Tx>
        </g>
        {q.split("").map((c, i) => <Tx key={i} x={xc(d.length - 1) + cw / 2 + 8 + breite(`: ${p.b} =`, g) + i * cw + cw / 2} y={34} g={g} f={F.granat} w={800} opacity={teil(Z(`q${i}`), 0, 0.4)}>{c}</Tx>)}
        {zeilen}
        <g opacity={Z("ende")}>
          <Pille x={B / 2} y={226} text={`${de(p.a)} : ${p.b} = ${de(quot)}`} f={F.granatTief} tf={F.goldHell} g={12.5} />
        </g>
      </>
    );
  },
};

/* ============================================================
   teilerbogen – Teilerpaare als Bögen: 1 mit n, 2 mit n/2 … bis sie sich treffen
   p: { n: 60 }
   ============================================================ */
const teilerVon = (n) => { const t = []; for (let i = 1; i <= n; i++) if (n % i === 0) t.push(i); return t; };
const teilerbogen = {
  h: 188,
  label: (p) => `Teiler von ${p.n} als Paare`,
  ablauf: (p) => {
    const t = teilerVon(p.n), paare = Math.ceil(t.length / 2);
    return [
      { k: "zahl", ms: 700, text: `Teiler von ${p.n} suchen – immer als Paar.` },
      ...Array.from({ length: paare }, (_, i) => ({ k: `p${i}`, ms: 850, text: t[i] === p.n / t[i] ? `${t[i]} · ${t[i]} = ${p.n} – ein Teiler ohne Partner.` : `${t[i]} · ${p.n / t[i]} = ${p.n}: ein Paar` })),
      { k: "treffen", ms: 1200, text: "Die Paare treffen sich – mehr gibt es nicht." },
      { k: "menge", ms: 1200, text: `${p.n} hat ${t.length} Teiler.` },
    ];
  },
  bild: ({ Z, p }) => {
    const t = teilerVon(p.n), m = t.length, dx = Math.min(28, (B - 30) / m), x0 = B / 2 - (dx * (m - 1)) / 2, y = 128;
    const paare = Math.ceil(m / 2);
    const sichtbar = (k) => { const i = Math.min(k, m - 1 - k); return Z(`p${i}`); };
    return (
      <>
        {Array.from({ length: paare }, (_, i) => {
          const j = m - 1 - i; if (i === j) return null;
          const xa = x0 + i * dx, xb = x0 + j * dx, r = (xb - xa) / 2, u = Z(`p${i}`);
          const len = Math.PI * r;
          return <path key={i} d={`M${xa} ${y - 14} A ${r} ${Math.min(r * 0.62, 88)} 0 0 1 ${xb} ${y - 14}`} fill="none" stroke={i % 2 ? F.blau : F.gold} strokeWidth="2.4" strokeLinecap="round"
            strokeDasharray={len * 1.3} strokeDashoffset={len * 1.3 * (1 - u)} />;
        })}
        {t.map((v, k) => {
          const u = sichtbar(k);
          return (
            <g key={v} opacity={0.15 + 0.85 * u}>
              <Kasten x={x0 + k * dx - dx / 2 + 1.5} y={y - 12} w={dx - 3} h={26} text={v} g={v > 99 ? 9.5 : 11.5} f={u > 0.5 ? F.weiss : F.flaeche} rand={u > 0.5 ? (Math.min(k, m - 1 - k) % 2 ? F.blau : F.gold) : F.linie} />
            </g>
          );
        })}
        <Puls x={B / 2} y={y} u={Z("treffen")} r={22} f={F.granat} />
        <g opacity={Z("menge")}>
          <Pille x={B / 2} y={176} text={`Teiler von ${p.n}: ${t.join(", ")}`} f={F.granatHell} tf={F.granat} g={t.length > 10 ? 10.5 : 11.5} />
        </g>
      </>
    );
  },
};

/* ============================================================
   punktrechtecke – n Punkte ordnen sich zu Rechtecken um; jede Reihenlänge, die aufgeht, ist ein Teiler.
   Dann ein Versuch, der nicht aufgeht (kleinster Nicht-Teiler): die letzte Reihe bleibt unvollständig.
   Unten sammeln sich alle Versuche als kleine Bilder.
   p: { n: 12 }
   ============================================================ */
const nichtTeiler = (n) => { for (let k = 2; k < n; k++) if (n % k) return k; return null; };
const punktrechtecke = {
  h: 210,
  label: (p) => `${p.n} Punkte als Rechtecke: Teiler ${teilerVon(p.n).join(", ")}`,
  ablauf: (p) => {
    const r = teilerVon(p.n).filter((d) => d * d <= p.n), k = nichtTeiler(p.n);
    return [
      ...r.map((d, i) => ({ k: `l${i}`, ms: i ? 1400 : 1000, text: d === 1
        ? `${p.n} Punkte in einer Reihe: 1 · ${p.n}. Also sind 1 und ${p.n} Teiler.`
        : `${d} Reihen zu je ${p.n / d} – das Rechteck geht auf: ${d} und ${p.n / d} sind Teiler.` })),
      ...(k ? [{ k: "probe", ms: 2200, text: `Reihen zu ${k}? ${Math.floor(p.n / k)} volle Reihen, dann bleiben ${p.n % k} übrig – eine Lücke!` }] : []),
      { k: "ende", ms: 1400, text: k ? `${k} ist kein Teiler. Teiler von ${p.n}: ${teilerVon(p.n).join(", ")}` : `Teiler von ${p.n}: ${teilerVon(p.n).join(", ")}` },
    ];
  },
  bild: ({ Z, p }) => {
    const n = p.n, r = teilerVon(n).filter((d) => d * d <= n), k = nichtTeiler(n);
    /* Anordnung: sp Punkte je Reihe */
    const formen = [...r.map((d) => n / d), ...(k ? [k] : [])];
    const lage = (sp, i, g, cx, cy) => { const zeilen = Math.ceil(n / sp); return { x: cx - ((sp - 1) * g) / 2 + (i % sp) * g, y: cy - ((zeilen - 1) * g) / 2 + Math.floor(i / sp) * g }; };
    const schritte = [...r.map((_, i) => `l${i}`), ...(k ? ["probe"] : [])];
    let akt = 0, u = 1;
    schritte.forEach((s, i) => { if (Z(s) > 0) { akt = i; u = Z(s); } });
    const von = formen[Math.max(0, akt - 1)], nach = formen[akt];
    const G = (sp) => Math.min(22, (B - 60) / Math.max(1, sp - 1)), CY = 56;
    const up = k ? Z("probe") : 0, ue = Z("ende");
    /* kleine Bilder unten */
    const slots = formen.length, sw = (B - 20) / slots;
    return (
      <>
        {Array.from({ length: n }, (_, i) => {
          const a = lage(von, i, G(von), B / 2, CY), b = lage(nach, i, G(nach), B / 2, CY), uu = akt === 0 ? 1 : u;
          const reihe = Math.floor(i / nach);
          const rr = akt === 0 ? 8 * raus(staffel(Z("l0"), i, n, 0.7)) : 8;
          return <circle key={i} cx={mix(a.x, b.x, uu)} cy={mix(a.y, b.y, uu)} r={rr} fill={reihe % 2 ? F.granat : F.gold} />;
        })}
        {/* die Lücke beim Nicht-Teiler */}
        {k && up > 0 && Array.from({ length: (k - (n % k)) % k }, (_, j) => {
          const b = lage(k, n + j, G(k), B / 2, CY);
          return <circle key={`l${j}`} cx={b.x} cy={b.y} r={8} fill="none" stroke={F.gold} strokeWidth="2.2" strokeDasharray="3 3" opacity={teil(up, 0.6, 0.9)} />;
        })}
        {k && <Puls x={lage(k, n, G(k), B / 2, CY).x + ((k - (n % k) - 1) * G(k)) / 2} y={lage(k, n, G(k), B / 2, CY).y} u={teil(up, 0.65, 1)} r={22} f={F.gold} />}
        {formen.map((sp, j) => {
          const s = schritte[j], us = teil(Z(s), 0.85, 1), ok = !(k && j === formen.length - 1);
          const cx = 10 + sw * j + sw / 2, g = Math.min(6.5, (sw - 14) / Math.max(1, sp - 1));
          return (
            <g key={`t${j}`} opacity={us}>
              <rect x={cx - sw / 2 + 4} y={132} width={sw - 8} height={58} rx="9" fill={ok ? F.flaeche : F.goldHell} />
              {Array.from({ length: n }, (_, i) => { const q = lage(sp, i, g, cx, 154); return <circle key={i} cx={q.x} cy={q.y} r={2.3} fill={ok ? F.tinte : F.goldDunkel} />; })}
              <Tx x={cx} y={184} g={10.5} f={ok ? F.tinte : F.goldDunkel} w={800}>{ok ? `${n / sp} · ${sp}` : `Reihen zu ${sp} ✗`}</Tx>
            </g>
          );
        })}
        <Pille x={B / 2} y={119} text={`Teiler von ${n}: ${teilerVon(n).join(", ")}`} f={F.granatTief} tf={F.goldHell} g={12} o={ue} />
      </>
    );
  },
};

/* ============================================================
   quersumme – warum die Quersummenregel stimmt: jeder Tausender ist 999 + 1, jeder Hunderter 99 + 1,
   jeder Zehner 9 + 1. Die Neunerpäckchen sind immer durch 9 (und 3) teilbar, übrig bleiben die Ziffern.
   p: { zahl: 7236 }
   ============================================================ */
const STELLE_KURZ = ["E", "Z", "H", "T", "ZT", "HT"];
const STELLE_LANG = ["Einer", "Zehner", "Hunderter", "Tausender", "Zehntausender", "Hunderttausender"];
const quersumme = {
  h: 214,
  label: (p) => `Quersummenregel für ${de(p.zahl)}`,
  ablauf: (p) => {
    const z = ziffern(p.zahl), m = z.length, qs = z.reduce((s, d) => s + d, 0);
    const teil9 = qs % 9 === 0, teil3 = qs % 3 === 0;
    return [
      { k: "zahl", ms: 1200, text: `${de(p.zahl)} = ${z.map((d, i) => `${d} ${STELLE_LANG[m - 1 - i]}`).join(", ")}.` },
      { k: "neuner", ms: 2600, text: "Jeder Tausender ist 999 + 1, jeder Hunderter 99 + 1, jeder Zehner 9 + 1." },
      { k: "weg", ms: 1600, text: "999, 99 und 9 sind immer durch 9 teilbar – die stören nie." },
      { k: "rest", ms: 1800, text: `Übrig bleiben die Ziffern selbst: ${z.join(" + ")} = ${qs}, die Quersumme.` },
      { k: "urteil", ms: 1500, text: teil9 ? `${qs} ist durch 9 teilbar – also auch ${de(p.zahl)}. Bei 3 genauso.`
        : teil3 ? `${qs} ist durch 3 teilbar, aber nicht durch 9 – genauso ${de(p.zahl)}.` : `${qs} ist weder durch 3 noch durch 9 teilbar – ${de(p.zahl)} auch nicht.` },
    ];
  },
  bild: ({ Z, p }) => {
    const z = ziffern(p.zahl), m = z.length, qs = z.reduce((s, d) => s + d, 0);
    const sp = Math.min(72, 280 / m), cx = (i) => B / 2 - 28 + (i - (m - 1) / 2) * sp;
    const uz = Z("zahl"), un = Z("neuner"), uw = Z("weg"), ur = Z("rest"), uu = Z("urteil");
    const yA = 70, yR = 124;
    return (
      <>
        {z.map((d, i) => {
          const st = m - 1 - i, x = cx(i), nn = "9".repeat(st);
          const ua = staffel(uz, i, m, 0.5), fall = raus(teil(un, 0.45, 1));
          return (
            <g key={i}>
              <Tx x={x} y={14} g={9.5} f={F.grau} w={800}>{STELLE_KURZ[st]}</Tx>
              <rect x={x - 17} y={20} width={34} height={40} rx="9" fill={F.flaeche} />
              <Tx x={x} y={49} g={26} f={F.tinte} w={800}>{d}</Tx>
              {st > 0 && (
                <>
                  <Tx x={x} y={yA} g={13} f={F.tinte} w={800} o={ua * (1 - teil(un, 0, 0.3))}>{`${d} · ${de(10 ** st)}`}</Tx>
                  <Tx x={x} y={yA} g={13} f={F.blau} w={800} o={teil(un, 0.25, 0.5) * (1 - 0.55 * uw)}>{`${d} · ${nn}`}</Tx>
                </>
              )}
              {/* der Rest jedes Päckchens ist die Ziffer selbst – sie fällt nach unten */}
              <Tx x={x} y={mix(st > 0 ? yA + 18 : yA, yR, fall)} g={st > 0 ? mix(13, 20, fall) : mix(13, 20, fall)} f={st > 0 || un > 0.45 ? F.goldDunkel : F.tinte} w={800}
                o={st > 0 ? teil(un, 0.35, 0.55) : ua}>{st > 0 ? `+ ${d}` .replace("+ ", fall > 0.9 ? "" : "+ ") : d}</Tx>
              {i < m - 1 && <Tx x={x + sp / 2} y={yR} g={16} f={F.grau} w={700} o={teil(ur, 0, 0.4)}>+</Tx>}
            </g>
          );
        })}
        <g opacity={uw}>
          <line x1={cx(0) - 30} y1={yA + 9} x2={cx(m - 2) + 30} y2={yA + 9} stroke={F.blau} strokeWidth="2" strokeLinecap="round" />
          <Tx x={(cx(0) + cx(m - 2)) / 2} y={yA + 24} g={10.5} f={F.blau} w={800}>Neunerpäckchen: immer durch 9 teilbar</Tx>
        </g>
        <rect x={cx(0) - 24} y={yR - 22} width={cx(m - 1) - cx(0) + 48} height={32} rx="11" fill="none" stroke={F.gold} strokeWidth="2.2" opacity={teil(ur, 0.2, 0.5)} />
        <Pille x={cx(m - 1) + 30} y={yR} a="start" text={`= ${qs}`} g={16} f={F.gold} tf={F.tinte} o={teil(ur, 0.4, 0.8)} />
        <Puls x={cx(m - 1) + 54} y={yR - 6} u={teil(ur, 0.5, 1)} r={22} f={F.gold} />
        {[9, 3].map((t, j) => {
          const ok = p.zahl % t === 0, x = B / 2 + (j ? 74 : -74);
          return (
            <g key={t} opacity={staffel(uu, j, 2, 0.5)}>
              <rect x={x - 66} y={164} width={132} height={36} rx="12" fill={ok ? F.gruenHell : F.flaeche} stroke={ok ? F.gruen : F.hell} strokeWidth="1.6" />
              <Tx x={x} y={187} g={13} f={ok ? F.gruen : F.grau} w={800}>{`durch ${t} ${ok ? "✓" : "✗"}`}</Tx>
            </g>
          );
        })}
      </>
    );
  },
};

/* ============================================================
   faktorbaum – immer durch die kleinste Primzahl teilen, bis eine Primzahl übrig bleibt
   p: { zahl: 360 }
   ============================================================ */
function primKette(n) {
  const k = []; let r = n, t = 2;
  while (r > 1 && t * t <= r) { if (r % t === 0) { k.push({ p: t, rest: r / t }); r /= t; } else t++; }
  return k;
}
const faktorbaum = {
  h: 250,
  label: (p) => `Primfaktorzerlegung von ${p.zahl}`,
  ablauf: (p) => {
    const k = primKette(p.zahl);
    return [
      { k: "start", ms: 700, text: `${p.zahl} zerlegen: durch die kleinste passende Primzahl teilen.` },
      ...k.map((s, i) => ({ k: `s${i}`, ms: 950, text: `Durch ${s.p}: ${i ? k[i - 1].rest : p.zahl} : ${s.p} = ${s.rest}` + (i === k.length - 1 ? ` – ${s.rest} ist eine Primzahl.` : "") })),
      { k: "ende", ms: 1500, text: "Alle Primfaktoren einsammeln und Gleiche als Potenz schreiben." },
    ];
  },
  bild: ({ Z, p }) => {
    const k = primKette(p.zahl), n = k.length, dx = Math.min(46, 250 / n), dy = Math.min(26, 130 / n);
    const x0 = 50, y0 = 26;
    const knoten = [{ x: x0, y: y0, w: p.zahl }];
    k.forEach((s, i) => knoten.push({ x: x0 + (i + 1) * dx, y: y0 + (i + 1) * dy, w: s.rest }));
    const faktoren = k.map((s) => s.p).concat(k.length ? [k[k.length - 1].rest] : []);
    const potenzen = {}; faktoren.forEach((f) => { potenzen[f] = (potenzen[f] || 0) + 1; });
    const ue = Z("ende");
    return (
      <>
        <Tx x={x0} y={y0 + 5} g={16} f={F.tinte} w={800} opacity={Z("start")}>{p.zahl}</Tx>
        {k.map((s, i) => {
          const u = Z(`s${i}`, raus), a = knoten[i], b = knoten[i + 1], xl = a.x - 22, yl = b.y;
          const letzt = i === n - 1;
          return (
            <g key={i}>
              <Strich x1={a.x - 4} y1={a.y + 7} x2={xl + 4} y2={yl - 9} u={u} f={F.hell} b={1.5} />
              <Strich x1={a.x + 4} y1={a.y + 7} x2={b.x - 4} y2={b.y - 11} u={u} f={F.hell} b={1.5} />
              <g opacity={u}>
                <circle cx={xl} cy={yl} r={10} fill={F.gold} />
                <Tx x={xl} y={yl + 4.5} g={12} f={F.granatTief} w={800}>{s.p}</Tx>
                {letzt ? (
                  <><circle cx={b.x} cy={b.y} r={10} fill={F.gold} /><Tx x={b.x} y={b.y + 4.5} g={12} f={F.granatTief} w={800}>{b.w}</Tx></>
                ) : <Tx x={b.x} y={b.y + 5} g={14} f={F.tinte} w={800}>{b.w}</Tx>}
              </g>
            </g>
          );
        })}
        <g opacity={ue}>
          <Tx x={B / 2} y={y0 + n * dy + 42} g={13} f={F.tinte} w={800}>{`${p.zahl} = ${faktoren.join(" · ")}`}</Tx>
          <text x={B / 2} y={y0 + n * dy + 74} textAnchor="middle" fontSize="20" fontWeight="800" style={SCHRIFT} fill={F.granat}>
            {`${p.zahl} = `}
            {Object.entries(potenzen).map(([f, e], i) => (
              <React.Fragment key={f}>{i > 0 && <tspan> · </tspan>}<tspan>{f}</tspan>{e > 1 && <tspan fontSize="12" dy="-9">{e}</tspan>}{e > 1 && <tspan dy="9"> </tspan>}</React.Fragment>
            ))}
          </text>
        </g>
      </>
    );
  },
};

/* ============================================================
   kgv – zwei Sprungfolgen (Vielfache) auf dem Zahlenstrahl, erstes gemeinsames Ziel
   p: { a: 12, b: 20, einheit?: "min", text?: "…" }
   ============================================================ */
const ggT = (a, b) => (b ? ggT(b, a % b) : a);
const kgv = {
  h: 196,
  label: (p) => `kgV von ${p.a} und ${p.b}`,
  ablauf: (p) => {
    const k = (p.a * p.b) / ggT(p.a, p.b);
    return [
      { k: "strahl", ms: 800, text: `Zwei Takte auf einem Zahlenstrahl: ${p.a} und ${p.b}.` },
      { k: "a", ms: 400 + (k / p.a) * 450, text: `Oben die Vielfachen von ${p.a}: ${p.a}, ${2 * p.a}, ${3 * p.a}, …` },
      { k: "b", ms: 400 + (k / p.b) * 450, text: `Unten die Vielfachen von ${p.b}: ${p.b}, ${2 * p.b}, ${3 * p.b}, …` },
      { k: "treffen", ms: 1500, text: p.text || `Das erste gemeinsame Vielfache: kgV(${p.a}, ${p.b}) = ${k}` },
    ];
  },
  bild: ({ Z, z, p }) => {
    const k = (p.a * p.b) / ggT(p.a, p.b), x = achse({ von: 0, bis: k, x0: 24, x1: B - 30 }), y = 104;
    const na = k / p.a, nb = k / p.b, ut = Z("treffen");
    const ein = p.einheit ? ` ${p.einheit}` : "";
    return (
      <>
        <Skala von={0} bis={k} schritt={ggT(p.a, p.b)} y={y} x={x} u={Z("strahl")} beschrift={() => ""} jede={1} />
        <Tx x={x(0)} y={y + 4} g={0}>{""}</Tx>
        {Array.from({ length: na }, (_, i) => (
          <g key={`a${i}`}>
            <Sprung xa={x(i * p.a)} xb={x((i + 1) * p.a)} y={y - 6} hoch={26} u={staffel(z("a"), i, na, 0.1)} f={F.gold} />
            <Tx x={x((i + 1) * p.a)} y={y - 40} g={11} f={F.goldDunkel} w={800} opacity={teil(staffel(z("a"), i, na, 0.1), 0.8, 1)}>{(i + 1) * p.a}</Tx>
          </g>
        ))}
        {Array.from({ length: nb }, (_, i) => (
          <g key={`b${i}`}>
            <Sprung xa={x(i * p.b)} xb={x((i + 1) * p.b)} y={y + 6} hoch={-26} u={staffel(z("b"), i, nb, 0.1)} f={F.blau} />
            <Tx x={x((i + 1) * p.b)} y={y + 50} g={11} f={F.blau} w={800} opacity={teil(staffel(z("b"), i, nb, 0.1), 0.8, 1)}>{(i + 1) * p.b}</Tx>
          </g>
        ))}
        <Tx x={x(0)} y={y + 22} g={11} f={F.tinte} w={800}>0</Tx>
        <Puls x={x(k)} y={y} u={ut} r={20} f={F.granat} />
        {ut > 0 && <circle cx={x(k)} cy={y} r={7} fill={F.granat} opacity={ut} />}
        <g opacity={teil(ut, 0.3, 1)}>
          <Pille x={B / 2} y={186} text={`kgV(${p.a}, ${p.b}) = ${k}${ein}`} f={F.granatTief} tf={F.goldHell} g={13} />
        </g>
      </>
    );
  },
};

/* ============================================================
   ggt – Teilerlisten beider Zahlen, gemeinsame leuchten, der größte gewinnt
   p: { a: 12, b: 20 }
   ============================================================ */
const ggt = {
  h: 178,
  label: (p) => `ggT von ${p.a} und ${p.b}`,
  ablauf: (p) => [
    { k: "ta", ms: 1100, text: `Teiler von ${p.a}: ${teilerVon(p.a).join(", ")}` },
    { k: "tb", ms: 1100, text: `Teiler von ${p.b}: ${teilerVon(p.b).join(", ")}` },
    { k: "gemein", ms: 1300, text: `Gemeinsame Teiler: ${teilerVon(p.a).filter((t) => p.b % t === 0).join(", ")}` },
    { k: "groesst", ms: 1200, text: `Der größte gemeinsame Teiler: ggT(${p.a}, ${p.b}) = ${ggT(p.a, p.b)}` },
  ],
  bild: ({ Z, p }) => {
    const ta = teilerVon(p.a), tb = teilerVon(p.b), g = ggT(p.a, p.b), ug = Z("gemein"), um = Z("groesst");
    const reihe = (t, y, u, f, name) => (
      <g>
        <Tx x={16} y={y + 5} g={14} f={f} w={800} a="start" opacity={u}>T<tspan fontSize="10" dy="4">{name}</tspan></Tx>
        {t.map((v, i) => {
          const gem = (p.a % v === 0) && (p.b % v === 0), x = 92 + i * 38, uu = staffel(u, i, t.length, 0.5);
          return (
            <g key={v} opacity={uu} transform={v === g && um > 0 ? `translate(0 ${-4 * Math.sin(Math.PI * um)})` : undefined}>
              <rect x={x - 16} y={y - 13} width={32} height={26} rx="8" fill={gem && ug > 0.4 ? (v === g && um > 0.3 ? F.granat : F.goldHell) : F.flaeche} stroke={gem && ug > 0.4 ? F.gold : "none"} strokeWidth="1.6" />
              <Tx x={x} y={y + 5} g={12.5} f={v === g && um > 0.3 ? F.weiss : F.tinte} w={800}>{v}</Tx>
            </g>
          );
        })}
      </g>
    );
    return (
      <>
        {reihe(ta, 38, Z("ta"), F.goldDunkel, p.a)}
        {reihe(tb, 90, Z("tb"), F.blau, p.b)}
        <g opacity={um}>
          <Pille x={B / 2} y={150} text={`ggT(${p.a}, ${p.b}) = ${g}`} f={F.granatTief} tf={F.goldHell} g={13} />
        </g>
      </>
    );
  },
};

export const SZENEN_RECHNEN = { schriftlich, schriftlichMal, schriftlichGeteilt, teilerbogen, punktrechtecke, quersumme, faktorbaum, kgv, ggt };
