/* ======================================================================
   FORMELSAMMLUNG · Illustrationen Teil 9: Zahlen, Größen, Prozent, Daten
   (Unterstufe Klasse 5–7)
   ====================================================================== */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { F, Hinweis, Messzeile, Pfeil, Punkt, Regler, Txt, Umschalter, svgStil, koord, Achsen } from "./funcFsBasis.jsx";

/* ---------- Zahlen deutsch formatieren ---------- */
const rund = (v, d = 6) => Math.round(v * 10 ** d) / 10 ** d;
/* Text: 12 345,6 · −3 */
function zt(v, d = 6) {
  const r = rund(v, d);
  const neg = r < 0;
  const [g, n] = String(Math.abs(r)).split(".");
  const gg = g.length > 4 ? g.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : g;
  return (neg ? "−" : "") + gg + (n ? "," + n : "");
}
/* Mini-TeX: 12\,345{,}6 · -3 */
function zx(v, d = 6) {
  const r = rund(v, d);
  const neg = r < 0;
  const [g, n] = String(Math.abs(r)).split(".");
  const gg = g.length > 4 ? g.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : g;
  return (neg ? "-" : "") + gg + (n ? "{,}" + n : "");
}
const kl = (v) => (v < 0 ? `(${zx(v)})` : zx(v));
const ggT = (a, b) => (b ? ggT(b, a % b) : a);
const kgV = (a, b) => (a / ggT(a, b)) * b;

/* Zahlenstrahl als Bausteine */
function Strahl({ lo, hi, x0 = 22, x1 = 318, y, schritt = 1, beschr = 1, gross, fmt = zt, farbe = F.achse }) {
  const px = (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0);
  const striche = [];
  const n = Math.round((hi - lo) / schritt);
  for (let i = 0; i <= n; i++) {
    const v = rund(lo + i * schritt, 9);
    const istB = Math.abs(rund((v - lo) / beschr, 6) - Math.round((v - lo) / beschr)) < 1e-6;
    const istG = gross && Math.abs(rund(v / gross, 6) - Math.round(v / gross)) < 1e-6;
    striche.push(<line key={"s" + i} x1={px(v)} x2={px(v)} y1={y - (istG ? 7 : istB ? 5 : 3)} y2={y + (istG ? 7 : istB ? 5 : 3)} stroke={farbe} strokeWidth={istG ? 1.6 : 1} />);
    if (istB) striche.push(<text key={"t" + i} x={px(v)} y={y + 19} textAnchor="middle" fontSize="9.5" fill={F.grau}>{fmt(v)}</text>);
  }
  return (
    <g>
      <line x1={x0 - 6} x2={x1 + 8} y1={y} y2={y} stroke={farbe} strokeWidth="1.4" />
      <path d={`M${x1 + 12} ${y} l-7 -4 v8 z`} fill={farbe} />
      {striche}
    </g>
  );
}
const strahlPx = (lo, hi, x0 = 22, x1 = 318) => (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0);

/* ======================= Zahlenstrahl ======================= */
function Zahlenstrahl({ modus = "runden" }) {
  const [a, setA] = useState(modus === "runden" ? 3471 : modus === "vielfache" ? 4 : modus === "ueberschlag" ? 387 : modus === "betrag" ? -5 : modus === "negativ" ? -3 : 3);
  const [b, setB] = useState(modus === "vielfache" ? 6 : modus === "ueberschlag" ? 52 : modus === "negativ" ? 2 : -5);
  const [op, setOp] = useState("+");
  const [lupe, setLupe] = useState("drittel");

  if (modus === "runden") {
    const lo = 3400, hi = 3600, px = strahlPx(lo, hi), r = Math.round(a / 100) * 100;
    return (
      <div>
        <Hinweis>Auf Hunderter runden: Liegt die Zahl näher an 3400 oder an 3500? Ab der Mitte (Zehnerziffer 5) wird aufgerundet.</Hinweis>
        <svg viewBox="0 0 340 120" style={svgStil} role="img" aria-label="Zahlenstrahl von 3400 bis 3600 mit Rundungsbereichen">
          <rect x={px(3450)} y={30} width={px(3550) - px(3450)} height={28} rx="6" fill={F.gold} opacity="0.7" />
          <rect x={px(3400)} y={30} width={px(3450) - px(3400)} height={28} rx="6" fill={F.blau} opacity="0.7" />
          <rect x={px(3550)} y={30} width={px(3600) - px(3550)} height={28} rx="6" fill={F.blau} opacity="0.7" />
          <Strahl lo={lo} hi={hi} y={72} schritt={10} beschr={50} gross={100} />
          <Pfeil x1={px(a)} y1={22} x2={px(r)} y2={52} farbe={F.rosaKraeftig} breite={2} />
          <Punkt x={px(a)} y={72} farbe={F.rosaKraeftig} r={6} />
          <Txt x={px(a)} y={16} farbe={F.rosaKraeftig}>{zt(a)}</Txt>
        </svg>
        <Regler label="Zahl" wert={a} setze={setA} min={3400} max={3599} schritt={1} anzeige={zt(a)} />
        <Messzeile><M t={`${zx(a)} \\approx ${zx(r)}`} /> · Zehnerziffer {Math.floor(a / 10) % 10} → {Math.floor(a / 10) % 10 >= 5 ? "aufrunden" : "abrunden"}</Messzeile>
      </div>
    );
  }

  if (modus === "negativ") {
    const px = strahlPx(-10, 10);
    const rel = a < b ? "<" : a > b ? ">" : "=";
    return (
      <div>
        <Hinweis>Links liegt immer die kleinere Zahl. −3 ist kleiner als −1, weil −3 weiter links liegt.</Hinweis>
        <svg viewBox="0 0 340 100" style={svgStil} role="img" aria-label="Zahlenstrahl von −10 bis 10 mit zwei Zahlen">
          <rect x={px(-10) - 4} y={36} width={px(0) - px(-10) + 4} height={20} rx="5" fill={F.rosa} opacity="0.45" />
          <rect x={px(0)} y={36} width={px(10) - px(0) + 4} height={20} rx="5" fill={F.blau} opacity="0.6" />
          <Strahl lo={-10} hi={10} y={46} schritt={1} beschr={2} gross={10} />
          <Punkt x={px(a)} y={46} farbe={F.rosaKraeftig} r={6} />
          <Punkt x={px(b)} y={46} farbe={F.see} r={6} />
          <Txt x={px(a)} y={26} farbe={F.rosaKraeftig}>a</Txt>
          <Txt x={px(b)} y={26} farbe={F.see}>b</Txt>
          <text x={px(-5)} y={90} textAnchor="middle" fontSize="10" fill={F.grau}>negative Zahlen</text>
          <text x={px(5)} y={90} textAnchor="middle" fontSize="10" fill={F.grau}>positive Zahlen</text>
        </svg>
        <Regler label="a" wert={a} setze={setA} min={-10} max={10} schritt={1} anzeige={zt(a)} />
        <Regler label="b" wert={b} setze={setB} min={-10} max={10} schritt={1} anzeige={zt(b)} />
        <Messzeile><M t={`${zx(a)} ${rel} ${zx(b)}`} /></Messzeile>
      </div>
    );
  }

  if (modus === "addieren") {
    const px = strahlPx(-16, 16);
    const bb = op === "+" ? b : -b;
    const e = a + bb;
    return (
      <div>
        <Hinweis>Start bei a. Plus eine positive Zahl: nach rechts. Plus eine negative Zahl: nach links. Minus heißt: Gegenzahl addieren.</Hinweis>
        <svg viewBox="0 0 340 110" style={svgStil} role="img" aria-label="Addition am Zahlenstrahl mit Pfeil">
          <Strahl lo={-16} hi={16} y={70} schritt={1} beschr={4} gross={8} />
          {bb !== 0 && <Pfeil x1={px(a)} y1={44} x2={px(e)} y2={44} farbe={bb > 0 ? F.gruenKraeftig : F.rosaKraeftig} breite={3} />}
          <line x1={px(a)} x2={px(a)} y1={40} y2={70} stroke={F.see} strokeDasharray="3 3" />
          <line x1={px(e)} x2={px(e)} y1={40} y2={70} stroke={F.gold3} strokeDasharray="3 3" />
          <Punkt x={px(a)} y={70} farbe={F.see} r={5.5} />
          <Punkt x={px(e)} y={70} farbe={F.gold3} r={5.5} />
          <Txt x={(px(a) + px(e)) / 2} y={34} gr={11} farbe={bb >= 0 ? F.gruenKraeftig : F.rosaKraeftig}>{bb >= 0 ? "+" : "−"}{zt(Math.abs(bb))}</Txt>
        </svg>
        <Regler label="a" wert={a} setze={setA} min={-8} max={8} schritt={1} anzeige={zt(a)} />
        <Regler label="b" wert={b} setze={setB} min={-8} max={8} schritt={1} anzeige={zt(b)} />
        <Umschalter label="Rechenart" wert={op} setze={setOp} optionen={[["+", "a + b"], ["-", "a − b"]]} />
        <Messzeile>
          {op === "+" ? <M t={`${zx(a)} + ${kl(b)} = ${zx(e)}`} /> : <M t={`${zx(a)} - ${kl(b)} = ${zx(a)} + ${kl(-b)} = ${zx(e)}`} />}
        </Messzeile>
      </div>
    );
  }

  if (modus === "betrag") {
    const px = strahlPx(-10, 10);
    return (
      <div>
        <Hinweis>Zahl und Gegenzahl liegen gleich weit von der 0 entfernt – gespiegelt an der 0. Dieser Abstand ist der Betrag.</Hinweis>
        <svg viewBox="0 0 340 110" style={svgStil} role="img" aria-label="Zahl und Gegenzahl mit gleichem Abstand zur Null">
          <Strahl lo={-10} hi={10} y={74} schritt={1} beschr={2} gross={10} />
          {a !== 0 && <path d={`M${px(0)} 66 Q ${(px(0) + px(a)) / 2} 30 ${px(a)} 66`} fill="none" stroke={F.see} strokeWidth="2" />}
          {a !== 0 && <path d={`M${px(0)} 66 Q ${(px(0) + px(-a)) / 2} 30 ${px(-a)} 66`} fill="none" stroke={F.gold3} strokeWidth="2" />}
          <line x1={px(0)} x2={px(0)} y1={20} y2={84} stroke={F.rosaKraeftig} strokeDasharray="4 3" />
          <Punkt x={px(a)} y={74} farbe={F.see} r={6} />
          <Punkt x={px(-a)} y={74} farbe={F.gold3} r={6} />
          <Txt x={(px(0) + px(a)) / 2} y={36} farbe={F.see} gr={11}>{zt(Math.abs(a))}</Txt>
          <Txt x={(px(0) + px(-a)) / 2} y={36} farbe={F.gold3} gr={11}>{zt(Math.abs(a))}</Txt>
        </svg>
        <Regler label="Zahl" wert={a} setze={setA} min={-9} max={9} schritt={1} anzeige={zt(a)} />
        <Messzeile><M t={`-${kl(a)} = ${zx(-a)}, \\quad |${zx(a)}| = |${zx(-a)}| = ${zx(Math.abs(a))}`} /></Messzeile>
      </div>
    );
  }

  if (modus === "vielfache") {
    const k = kgV(a, b), hi = Math.max(60, Math.ceil(k / 10) * 10), px = strahlPx(0, hi);
    const va = [], vb = [];
    for (let v = a; v <= hi; v += a) va.push(v);
    for (let v = b; v <= hi; v += b) vb.push(v);
    return (
      <div>
        <Hinweis>Oben springen die Vielfachen von a, unten die von b. Wo sie zum ersten Mal zusammentreffen, liegt das kgV.</Hinweis>
        <svg viewBox="0 0 340 130" style={svgStil} role="img" aria-label="Vielfache zweier Zahlen am Zahlenstrahl">
          <Strahl lo={0} hi={hi} y={66} schritt={hi > 60 ? 5 : 2} beschr={hi > 60 ? 20 : 10} />
          {va.map((v, i) => <path key={"a" + v} d={`M${px(v - a)} 60 Q ${(px(v - a) + px(v)) / 2} ${36} ${px(v)} 60`} fill="none" stroke={F.see} strokeWidth="1.6" opacity={v <= k ? 1 : 0.35} />)}
          {vb.map((v) => <path key={"b" + v} d={`M${px(v - b)} 72 Q ${(px(v - b) + px(v)) / 2} ${96} ${px(v)} 72`} fill="none" stroke={F.gold3} strokeWidth="1.6" opacity={v <= k ? 1 : 0.35} />)}
          <circle cx={px(k)} cy={66} r="9" fill="none" stroke={F.rosaKraeftig} strokeWidth="2.4" />
          <Txt x={px(k)} y={120} farbe={F.rosaKraeftig}>kgV = {k}</Txt>
        </svg>
        <Regler label="a" wert={a} setze={setA} min={2} max={9} schritt={1} anzeige={a} />
        <Regler label="b" wert={b} setze={setB} min={2} max={9} schritt={1} anzeige={b} />
        <Messzeile><M t={`\\text{kgV}(${a}, ${b}) = ${k}`} /></Messzeile>
      </div>
    );
  }

  if (modus === "lupe") {
    const drittel = lupe === "drittel";
    const z1 = drittel ? 0.3 : 0.3, z2 = drittel ? 0.33 : 0.37;
    const wert = drittel ? 1 / 3 : 0.375;
    const ebenen = [[0, 1, 0.1], [z1, z1 + 0.1, 0.01], [z2, z2 + 0.01, 0.001]];
    return (
      <div>
        <Hinweis>{drittel ? "Bei 1/3 landet man in jeder Lupe wieder an der dritten Stelle – die 3 wiederholt sich ohne Ende: 0,333…" : "Mit jeder Lupe sieht man eine Nachkommastelle mehr: Zehntel, Hundertstel, Tausendstel."}</Hinweis>
        <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Zahlenstrahl mit drei Vergrößerungsstufen">
          {ebenen.map(([lo, hi, s], i) => {
            const y = 34 + i * 62, px = strahlPx(lo, hi);
            const naechste = ebenen[i + 1];
            return (
              <g key={i}>
                <Strahl lo={lo} hi={hi} y={y} schritt={s} beschr={s * (i === 0 ? 1 : 5)} fmt={(v) => zt(v, 3)} />
                {naechste && <rect x={px(naechste[0])} y={y - 9} width={px(naechste[1]) - px(naechste[0])} height={18} rx="3" fill="none" stroke={F.rosaKraeftig} strokeWidth="1.6" />}
                {naechste && <path d={`M${px(naechste[0])} ${y + 9} L22 ${y + 50} M${px(naechste[1])} ${y + 9} L318 ${y + 50}`} stroke={F.rosaKraeftig} strokeWidth="0.8" strokeDasharray="3 3" fill="none" />}
                <Punkt x={px(wert)} y={y} farbe={F.see} r={5} />
              </g>
            );
          })}
        </svg>
        <Umschalter label="Zahl" wert={lupe} setze={setLupe} optionen={[["drittel", "1/3"], ["achtel", "3/8"]]} />
        <Messzeile>{drittel ? <M t={"\\frac{1}{3} = 0{,}333\\ldots = 0{,}\\overline{3}"} /> : <M t={"\\frac{3}{8} = 0{,}375 = \\frac{3}{10} + \\frac{7}{100} + \\frac{5}{1000}"} />}</Messzeile>
      </div>
    );
  }

  /* ueberschlag */
  const ra = Math.round(a / 100) * 100, rb = Math.round(b / 10) * 10;
  const ex = a * b, ue = ra * rb, hi = 40000, px = strahlPx(0, hi);
  return (
    <div>
      <Hinweis>Beide Faktoren runden, dann im Kopf rechnen. Der Überschlag landet in der Nähe des genauen Ergebnisses – so erkennt man grobe Fehler.</Hinweis>
      <svg viewBox="0 0 340 110" style={svgStil} role="img" aria-label="Genaues Ergebnis und Überschlag am Zahlenstrahl">
        <Strahl lo={0} hi={hi} y={60} schritt={2000} beschr={10000} fmt={(v) => zt(v)} />
        <Punkt x={px(ex)} y={60} farbe={F.see} r={6} />
        <Punkt x={px(ue)} y={60} farbe={F.gold3} r={6} ring />
        <Txt x={px(ex)} y={38} farbe={F.see} gr={11}>genau</Txt>
        <Txt x={px(ue)} y={98} farbe={F.gold3} gr={11}>Überschlag</Txt>
      </svg>
      <Regler label="a" wert={a} setze={setA} min={120} max={480} schritt={1} anzeige={a} />
      <Regler label="b" wert={b} setze={setB} min={21} max={79} schritt={1} anzeige={b} />
      <Messzeile><M t={`${a} \\cdot ${b} \\approx ${ra} \\cdot ${rb} = ${zx(ue)}`} /> · genau: {zt(ex)}</Messzeile>
    </div>
  );
}

/* ======================= Stellenwerttafel ======================= */
const STELLEN_GANZ = [[6, "M"], [5, "HT"], [4, "ZT"], [3, "T"], [2, "H"], [1, "Z"], [0, "E"]];
const STELLEN_KOMMA = [[3, "T"], [2, "H"], [1, "Z"], [0, "E"], [-1, "z"], [-2, "h"], [-3, "t"]];
function StellenwertTafel({ komma = false }) {
  const beispiele = komma ? [["375", -2], ["504", -1], ["2075", -3]] : [["3507", 0], ["1208", 0], ["45", 2]];
  const [bsp, setBsp] = useState(0);
  const [verschub, setVerschub] = useState(0);
  const [ziffern, e0] = beispiele[bsp];
  const e = e0 + verschub;
  const stellen = komma ? STELLEN_KOMMA : STELLEN_GANZ;
  const hoch = ziffern.length - 1 + e;
  const maxS = stellen[0][0], minS = stellen[stellen.length - 1][0];
  const ziffer = (p) => (p > hoch || p < e ? null : Number(ziffern[hoch - p]));
  const wert = Number(ziffern) * 10 ** e;
  /* Ziffer an Stelle p, auch führende/abschließende Nullen bis zur Einerstelle */
  const zeigen = (p) => {
    const d = ziffer(p);
    if (d !== null) return d;
    if (p < hoch && p >= 0 && p >= Math.min(e, 0)) return 0;
    if (p < 0 && p > e) return 0;
    if (p === 0 && hoch < 0) return 0;
    return null;
  };
  const W = 300 / stellen.length;
  const summand = [];
  for (const [p] of stellen) {
    const d = ziffer(p);
    if (d === null || d === 0) continue;
    summand.push(p >= 0 ? `${d} \\cdot ${zx(10 ** p)}` : `${d} \\cdot \\frac{1}{${zx(10 ** -p)}}`);
  }
  const wechsel = (i) => { setBsp(i); setVerschub(0); };
  return (
    <div>
      <Hinweis>Jede Stelle ist zehnmal so viel wert wie die rechts daneben. Mal 10 rückt jede Ziffer eine Stelle nach links.</Hinweis>
      <svg viewBox="0 0 340 120" style={svgStil} role="img" aria-label="Stellenwerttafel mit Ziffern">
        {stellen.map(([p, name], i) => {
          const x = 20 + i * W, d = zeigen(p);
          return (
            <g key={p}>
              <rect x={x} y={14} width={W - 3} height={26} rx="5" fill={p >= 0 ? F.blau : F.gold} />
              <text x={x + W / 2 - 1.5} y={32} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={p >= 0 ? F.see : F.gold3}>{name}</text>
              <rect x={x} y={44} width={W - 3} height={44} rx="6" fill="#F7F9FD" stroke={C.linie} />
              {d !== null && <text x={x + W / 2 - 1.5} y={74} textAnchor="middle" fontSize="22" fontWeight="700" fill={ziffer(p) === null ? F.achse : F.tinte}>{d}</text>}
            </g>
          );
        })}
        {komma && <circle cx={20 + 4 * W - 1.5} cy={84} r="4" fill={F.rosaKraeftig} />}
        <text x={170} y={110} textAnchor="middle" fontSize="10" fill={F.grau}>{komma ? "T Tausender · H Hunderter · Z Zehner · E Einer , z Zehntel · h Hundertstel · t Tausendstel" : "M Million · HT/ZT Hundert-/Zehntausender · T Tausender · H Hunderter · Z Zehner · E Einer"}</text>
      </svg>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button type="button" disabled={e <= minS} onClick={() => setVerschub(verschub - 1)} style={knopf(e <= minS)}>: 10</button>
        <button type="button" disabled={hoch >= maxS} onClick={() => setVerschub(verschub + 1)} style={knopf(hoch >= maxS)}>· 10</button>
      </div>
      <Umschalter label="Beispiel" wert={bsp} setze={wechsel} optionen={beispiele.map(([zf, ee], i) => [i, zt(Number(zf) * 10 ** ee)])} />
      <Messzeile><M t={`${zx(wert)} = ${summand.join(" + ") || "0"}`} /></Messzeile>
    </div>
  );
}
const knopf = (aus) => ({ flex: 1, minHeight: 38, borderRadius: 10, border: `1.5px solid ${aus ? C.linie : C.see}`, background: aus ? C.sand : C.weiss, color: aus ? C.hellgrau : C.see, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: aus ? "default" : "pointer" });

/* ======================= Dezimalkomma ======================= */
function DezimalKomma({ modus = "verschieben" }) {
  const [n, setN] = useState(375);
  const [d, setD] = useState(2);
  const [a, setA] = useState(0.3);
  const [b, setB] = useState(0.4);
  const [bsp, setBsp] = useState(0);
  const [schritt, setSchritt] = useState(0);

  if (modus === "mult") {
    const ia = Math.round(a * 10), ib = Math.round(b * 10), u = 22, X = 60, Y = 10;
    return (
      <div>
        <Hinweis>Ein Quadrat mit Seitenlänge 1, aufgeteilt in 100 Hundertstel. Zehntel mal Zehntel ergibt Hundertstel: 1 + 1 = 2 Nachkommastellen.</Hinweis>
        <svg viewBox="0 0 340 240" style={svgStil} role="img" aria-label="Hunderterquadrat für Dezimalmultiplikation">
          {Array.from({ length: 100 }, (_, i) => {
            const sp = i % 10, ze = Math.floor(i / 10), inA = sp < ia, inB = ze < ib;
            return <rect key={i} x={X + sp * u} y={Y + ze * u} width={u - 2} height={u - 2} rx="2.5" fill={inA && inB ? F.gold2 : inA || inB ? F.blau : "#F4F6FA"} stroke={inA && inB ? F.gold3 : F.achse} strokeWidth="0.5" />;
          })}
          <Txt x={X + (ia * u) / 2} y={Y + 10 * u + 14} gr={11} farbe={F.see}>{zt(a)}</Txt>
          <Txt x={X - 18} y={Y + (ib * u) / 2 + 4} gr={11} farbe={F.see}>{zt(b)}</Txt>
        </svg>
        <Regler label="a" wert={a} setze={setA} min={0.1} max={1} schritt={0.1} anzeige={zt(a)} />
        <Regler label="b" wert={b} setze={setB} min={0.1} max={1} schritt={0.1} anzeige={zt(b)} />
        <Messzeile><M t={`${zx(a)} \\cdot ${zx(b)} = ${zx(a * b, 2)} \\quad (${ia} \\cdot ${ib} = ${ia * ib}, \\; 1 + 1 = 2 \\text{ Stellen})`} /></Messzeile>
      </div>
    );
  }

  if (modus === "div") {
    const aufgaben = [[4.5, 0.15], [7.2, 0.8], [1.26, 0.6]];
    const [x, y] = aufgaben[bsp];
    const stellen = (v) => (String(v).split(".")[1] || "").length;
    const noetig = stellen(y);
    const k = Math.min(schritt, noetig);
    const zeilen = Array.from({ length: k + 1 }, (_, i) => [x * 10 ** i, y * 10 ** i]);
    return (
      <div>
        <Hinweis>Bei beiden Zahlen das Komma gleich weit nach rechts schieben, bis der Teiler eine natürliche Zahl ist. Der Quotient ändert sich dabei nicht.</Hinweis>
        <div style={{ display: "grid", gap: 6, padding: "6px 4px" }}>
          {zeilen.map(([p, q], i) => (
            <div key={i} style={{ fontSize: 17, lineHeight: 1.9, background: i === zeilen.length - 1 ? "#FFF6DA" : C.sand, borderRadius: 10, padding: "2px 12px", color: C.tinte }}>
              <M t={`${zx(p)} : ${zx(q)}${i === noetig ? ` = ${zx(x / y, 4)}` : ""}`} />
              {i > 0 && <span style={{ fontSize: 12, color: C.grau, marginLeft: 8 }}>beide · 10</span>}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <button type="button" disabled={k >= noetig} onClick={() => setSchritt(schritt + 1)} style={knopf(k >= noetig)}>Beide Kommas verschieben</button>
          <button type="button" onClick={() => setSchritt(0)} style={knopf(false)}>Neu</button>
        </div>
        <Umschalter label="Aufgabe" wert={bsp} setze={(i) => { setBsp(i); setSchritt(0); }} optionen={aufgaben.map(([p, q], i) => [i, `${zt(p)} : ${zt(q)}`])} />
        <Messzeile><M t={`${zx(x)} : ${zx(y)} = ${zx(x * 10 ** noetig)} : ${zx(y * 10 ** noetig)} = ${zx(x / y, 4)}`} /></Messzeile>
      </div>
    );
  }

  /* verschieben */
  const wert = n / 10 ** d;
  const roh = String(n).padStart(Math.max(d + 1, 1), "0");
  const ganz = d > 0 ? roh.slice(0, roh.length - d) : roh + "0".repeat(-d);
  const nach = d > 0 ? roh.slice(roh.length - d) : "";
  const zeichen = [...ganz, ...nach];
  const kommaNach = ganz.length;
  const B = 30, X0 = 170 - (zeichen.length * B) / 2;
  const mach = (k) => { let nd = d - k; let nn = n; if (nd < 0) { nn = n * 10 ** -nd; nd = 0; } while (nd > 0 && nn % 10 === 0) { nn /= 10; nd -= 1; } setN(nn); setD(nd); };
  const grenze = (k) => { const nd = d - k; return nd > 5 || (nd < 0 && String(n).length - nd > 8); };
  return (
    <div>
      <Hinweis>Mal 10, 100, 1000: Das Komma rückt um 1, 2, 3 Stellen nach rechts. Geteilt: nach links. Fehlende Stellen füllt man mit Nullen auf.</Hinweis>
      <svg viewBox="0 0 340 90" style={svgStil} role="img" aria-label="Dezimalzahl mit verschiebbarem Komma">
        {zeichen.map((c, i) => (
          <g key={i}>
            <rect x={X0 + i * B} y={18} width={B - 4} height={44} rx="6" fill={i < kommaNach ? F.blau : F.gold} />
            <text x={X0 + i * B + (B - 4) / 2} y={49} textAnchor="middle" fontSize="22" fontWeight="700" fill={F.tinte}>{c}</text>
          </g>
        ))}
        {nach.length > 0 && <circle cx={X0 + kommaNach * B - 2} cy={60} r="4.5" fill={F.rosaKraeftig} style={{ transition: "cx 0.3s" }} />}
      </svg>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 6 }}>
        {[1, 2, 3].map((k) => <button key={"m" + k} type="button" disabled={grenze(k)} onClick={() => mach(k)} style={knopf(grenze(k))}>· {zt(10 ** k)}</button>)}
        {[1, 2, 3].map((k) => <button key={"d" + k} type="button" disabled={grenze(-k)} onClick={() => mach(-k)} style={knopf(grenze(-k))}>: {zt(10 ** k)}</button>)}
      </div>
      <Umschalter label="Start" wert={`${n}|${d}`} setze={(v) => { const [p, q] = v.split("|").map(Number); setN(p); setD(q); }} optionen={[["375|2", "3,75"], ["48|0", "48"], ["5|1", "0,5"]]} />
      <Messzeile><M t={`\\text{Zahl: } ${zx(wert)}`} /></Messzeile>
    </div>
  );
}

/* ======================= Teiler, Vielfache, Primzahlen ======================= */
const teilerVon = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((t) => n % t === 0);
function primfaktoren(n) { const f = []; let m = n; for (let p = 2; p * p <= m; p++) while (m % p === 0) { f.push(p); m /= p; } if (m > 1) f.push(m); return f; }
const pfTex = (n) => {
  const f = primfaktoren(n), z0 = {};
  f.forEach((p) => { z0[p] = (z0[p] || 0) + 1; });
  return Object.entries(z0).map(([p, k]) => (k > 1 ? `${p}^${k}` : p)).join(" \\cdot ") || "1";
};
function Chips({ liste, hervor, gross, farbe }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "4px 0 8px" }}>
      {liste.map((t) => {
        const an = hervor.includes(t), top = t === gross;
        return <span key={t} style={{ minWidth: 26, textAlign: "center", padding: "3px 6px", borderRadius: 8, fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums",
          background: top ? F.rosaKraeftig : an ? F.gold2 : farbe, color: top ? C.weiss : C.tinte, border: `1px solid ${top ? F.rosaKraeftig : an ? F.gold3 : C.linie}` }}>{t}</span>;
      })}
    </div>
  );
}
function TeilerMengen({ modus = "ggt" }) {
  const [a, setA] = useState(modus === "kgv" ? 6 : 24);
  const [b, setB] = useState(modus === "kgv" ? 8 : 36);
  const [stufe, setStufe] = useState(0);

  if (modus === "prim") {
    const sieb = [2, 3, 5, 7];
    const aktiv = sieb.slice(0, stufe);
    const gestrichen = (n) => n === 1 || aktiv.some((p) => n !== p && n % p === 0);
    const vonWem = (n) => aktiv.find((p) => n !== p && n % p === 0);
    const farben = { 2: F.blau, 3: F.gold, 5: F.rosa, 7: F.gruen };
    const fertig = stufe >= 4;
    const primzahlen = Array.from({ length: 59 }, (_, i) => i + 2).filter((n) => primfaktoren(n).length === 1);
    return (
      <div>
        <Hinweis>Sieb des Eratosthenes: Die 2 bleibt, alle anderen Vielfachen von 2 fallen durch. Dann die 3, die 5, die 7. Übrig bleiben die Primzahlen.</Hinweis>
        <svg viewBox="0 0 340 214" style={svgStil} role="img" aria-label="Sieb des Eratosthenes bis 60">
          {Array.from({ length: 60 }, (_, i) => {
            const n = i + 1, x = 20 + (i % 10) * 30.5, y = 8 + Math.floor(i / 10) * 34, weg = gestrichen(n), p = vonWem(n);
            const prim = !weg && (fertig || aktiv.includes(n));
            return (
              <g key={n}>
                <rect x={x} y={y} width={27} height={30} rx="6" fill={weg ? (p ? farben[p] : "#F4F6FA") : prim ? F.gold2 : C.weiss} stroke={prim ? F.gold3 : C.linie} strokeWidth={prim ? 1.8 : 1} opacity={weg ? 0.55 : 1} />
                <text x={x + 13.5} y={y + 20} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={weg ? F.achse : F.tinte} textDecoration={weg ? "line-through" : "none"}>{n}</text>
              </g>
            );
          })}
        </svg>
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <button type="button" disabled={fertig} onClick={() => setStufe(stufe + 1)} style={knopf(fertig)}>{fertig ? "Fertig gesiebt" : `Vielfache von ${sieb[stufe]} streichen`}</button>
          <button type="button" onClick={() => setStufe(0)} style={knopf(false)}>Neu</button>
        </div>
        <Messzeile>{fertig ? <>Primzahlen bis 60: {primzahlen.join(", ")}</> : <>Noch zu sieben: {sieb.slice(stufe).join(", ")} · Warum reicht 7? Weil 11 · 11 = 121 schon über 60 liegt.</>}</Messzeile>
      </div>
    );
  }

  if (modus === "kgv") {
    const k = kgV(a, b);
    const va = [], vb = [];
    for (let v = a; v <= k; v += a) va.push(v);
    for (let v = b; v <= k; v += b) vb.push(v);
    const gem = va.filter((v) => vb.includes(v));
    return (
      <div>
        <Hinweis>Vielfache aufzählen, bis die erste Zahl in beiden Listen auftaucht. Das ist das kleinste gemeinsame Vielfache.</Hinweis>
        <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 700, color: F.see }}>Vielfache von {a}</p>
        <Chips liste={va} hervor={gem} gross={k} farbe={F.blau} />
        <p style={{ margin: "0", fontSize: 13, fontWeight: 700, color: F.gold3 }}>Vielfache von {b}</p>
        <Chips liste={vb} hervor={gem} gross={k} farbe={F.gold} />
        <Regler label="a" wert={a} setze={setA} min={2} max={15} schritt={1} anzeige={a} />
        <Regler label="b" wert={b} setze={setB} min={2} max={15} schritt={1} anzeige={b} />
        <Messzeile><M t={`${a} = ${pfTex(a)}, \\; ${b} = ${pfTex(b)} \\;\\Rightarrow\\; \\text{kgV}(${a}, ${b}) = ${k === 1 ? "1" : pfTex(k)} = ${k}`} /></Messzeile>
      </div>
    );
  }

  const ta = teilerVon(a), tb = teilerVon(b), gem = ta.filter((t) => tb.includes(t)), g = ggT(a, b);
  return (
    <div>
      <Hinweis>Alle Teiler beider Zahlen aufschreiben. Die gemeinsamen sind gold, der größte davon ist der ggT.</Hinweis>
      <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 700, color: F.see }}>Teiler von {a}</p>
      <Chips liste={ta} hervor={gem} gross={g} farbe={F.blau} />
      <p style={{ margin: "0", fontSize: 13, fontWeight: 700, color: F.gold3 }}>Teiler von {b}</p>
      <Chips liste={tb} hervor={gem} gross={g} farbe={F.gold} />
      <Regler label="a" wert={a} setze={setA} min={2} max={60} schritt={1} anzeige={a} />
      <Regler label="b" wert={b} setze={setB} min={2} max={60} schritt={1} anzeige={b} />
      <Messzeile><M t={`${a} = ${pfTex(a)}, \\; ${b} = ${pfTex(b)} \\;\\Rightarrow\\; \\text{ggT}(${a}, ${b}) = ${g}`} /></Messzeile>
    </div>
  );
}

/* ======================= Bruchkreise ======================= */
function Torte({ cx, cy, r, n, z, farbe = F.gold2, rand = F.gold3 }) {
  if (n === 1) return <circle cx={cx} cy={cy} r={r} fill={z >= 1 ? farbe : "#F4F6FA"} stroke={z >= 1 ? rand : F.achse} strokeWidth="1.4" />;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const w1 = -Math.PI / 2 + (i * 2 * Math.PI) / n, w2 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n;
        const p1 = [cx + r * Math.cos(w1), cy + r * Math.sin(w1)], p2 = [cx + r * Math.cos(w2), cy + r * Math.sin(w2)];
        return <path key={i} d={`M${cx} ${cy} L${p1[0]} ${p1[1]} A${r} ${r} 0 ${n === 2 ? 0 : 0} 1 ${p2[0]} ${p2[1]} Z`} fill={i < z ? farbe : "#F4F6FA"} stroke={i < z ? rand : F.achse} strokeWidth="1.2" />;
      })}
    </g>
  );
}
function BruchKreis({ modus = "anteil" }) {
  const [n, setN] = useState(4);
  const [zz, setZ] = useState(3);
  const [g, setG] = useState(2);
  const [n2, setN2] = useState(5);
  const [z2, setZ2] = useState(3);
  const z = Math.min(zz, n), zw = Math.min(z2, n2);
  const setNn = (v) => { setN(v); if (zz > v) setZ(v); };
  const setNn2 = (v) => { setN2(v); if (z2 > v) setZ2(v); };

  if (modus === "gemischt") {
    const zm = Math.min(zz, n - 1);
    const kreise = g + 1, r = Math.min(46, 300 / kreise / 2 - 6);
    return (
      <div>
        <Hinweis>Ganze Pizzen plus ein Rest: Jede ganze Pizza hat {n} Stücke. Alle Stücke zusammengezählt ergeben den Zähler des unechten Bruchs.</Hinweis>
        <svg viewBox="0 0 340 120" style={svgStil} role="img" aria-label="Gemischte Zahl als Pizzen">
          {Array.from({ length: kreise }, (_, i) => <Torte key={i} cx={170 + (i - (kreise - 1) / 2) * (2 * r + 12)} cy={60} r={r} n={n} z={i < g ? n : zm} />)}
        </svg>
        <Regler label="Ganze" wert={g} setze={setG} min={0} max={3} schritt={1} anzeige={g} />
        <Regler label="Nenner" wert={n} setze={setNn} min={2} max={8} schritt={1} anzeige={n} />
        <Regler label="Rest" wert={zm} setze={setZ} min={0} max={n - 1} schritt={1} anzeige={zm} />
        <Messzeile><M t={`${g}\\frac{${zm}}{${n}} = \\frac{${g} \\cdot ${n} + ${zm}}{${n}} = \\frac{${g * n + zm}}{${n}}`} /></Messzeile>
      </div>
    );
  }

  if (modus === "vergleich") {
    const l = z * n2, r = zw * n, rel = l < r ? "<" : l > r ? ">" : "=";
    return (
      <div>
        <Hinweis>Welcher Anteil ist größer? Über Kreuz multiplizieren heißt: beide Brüche auf den Nenner {n} · {n2} = {n * n2} bringen und die Zähler vergleichen.</Hinweis>
        <svg viewBox="0 0 340 130" style={svgStil} role="img" aria-label="Zwei Bruchteile im Vergleich">
          <Torte cx={95} cy={62} r={52} n={n} z={z} farbe={F.blau} rand={F.see} />
          <Torte cx={245} cy={62} r={52} n={n2} z={zw} />
          <Txt x={170} y={70} gr={22}>{rel}</Txt>
        </svg>
        <Regler label="Zähler links" wert={z} setze={setZ} min={0} max={n} schritt={1} anzeige={z} />
        <Regler label="Nenner links" wert={n} setze={setNn} min={2} max={10} schritt={1} anzeige={n} />
        <Regler label="Zähler rechts" wert={zw} setze={setZ2} min={0} max={n2} schritt={1} anzeige={zw} />
        <Regler label="Nenner rechts" wert={n2} setze={setNn2} min={2} max={10} schritt={1} anzeige={n2} />
        <Messzeile><M t={`\\frac{${z}}{${n}} ${rel} \\frac{${zw}}{${n2}}, \\;\\text{ denn } ${z} \\cdot ${n2} = ${l} ${rel} ${r} = ${zw} \\cdot ${n}`} /></Messzeile>
      </div>
    );
  }

  return (
    <div>
      <Hinweis>Der Nenner sagt, in wie viele gleich große Stücke das Ganze geteilt wird. Der Zähler sagt, wie viele Stücke man nimmt.</Hinweis>
      <svg viewBox="0 0 340 140" style={svgStil} role="img" aria-label="Kreis in gleich große Stücke geteilt">
        <Torte cx={170} cy={68} r={60} n={n} z={z} />
      </svg>
      <Regler label="Nenner" wert={n} setze={setNn} min={2} max={12} schritt={1} anzeige={n} />
      <Regler label="Zähler" wert={z} setze={setZ} min={0} max={n} schritt={1} anzeige={z} />
      <Messzeile><M t={`\\frac{${z}}{${n}}`} /> · {z} von {n} gleichen Stücken{z === n ? " – das ist ein Ganzes" : ""}</Messzeile>
    </div>
  );
}

/* ======================= Vorzeichenregeln ======================= */
function VorzeichenTafel() {
  const [feld, setFeld] = useState(3);
  const zellen = [["+", "+", "+"], ["+", "−", "−"], ["−", "+", "−"], ["−", "−", "+"]];
  const fakt = [[3, 2], [3, -2], [-3, 2], [-3, -2]][feld];
  /* Muster: erster Faktor läuft von 3 abwärts, zweiter Faktor fest */
  const reihe = [3, 2, 1, 0, -1, -2, -3].map((x) => (feld < 2 ? [fakt[1] < 0 ? x : x, fakt[1]] : [x, fakt[1]]));
  return (
    <div>
      <Hinweis>Tippe ein Feld an. Die Zahlenreihe zeigt, warum die Regel stimmt: Der erste Faktor wird jeweils um 1 kleiner, das Ergebnis ändert sich immer um denselben Schritt.</Hinweis>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, maxWidth: 360, margin: "0 auto" }}>
        {zellen.map(([p, q, e], i) => {
          const an = i === feld;
          return (
            <button key={i} type="button" aria-pressed={an} onClick={() => setFeld(i)}
              style={{ minHeight: 54, borderRadius: 12, border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss, fontFamily: "inherit", fontSize: 18, fontWeight: 700, color: C.tinte, cursor: "pointer" }}>
              ({p}) · ({q}) = <span style={{ color: e === "+" ? F.gruenKraeftig : F.rosaKraeftig }}>({e})</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "grid", gap: 2, marginTop: 10, padding: "8px 12px", background: C.sand, borderRadius: 12 }}>
        {reihe.map(([x, y]) => {
          const ziel = x === fakt[0];
          return <div key={x} style={{ fontSize: 15, lineHeight: 1.7, fontWeight: ziel ? 700 : 400, color: ziel ? C.see : C.tinte }}><M t={`${kl(x)} \\cdot ${kl(y)} = ${zx(x * y)}`} /></div>;
        })}
      </div>
      <Messzeile>Schritt für Schritt: Jede Zeile ist um <M t={`${zx(-fakt[1])}`} /> größer als die vorige – auch dann, wenn man über die 0 hinaus weiterrechnet.</Messzeile>
    </div>
  );
}

/* ======================= Rechenbaum ======================= */
function Rechenbaum() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [c, setC] = useState(5);
  const [klammer, setKlammer] = useState(false);
  const e = klammer ? (a + b) * c : a + b * c;
  const knoten = (x, y, t, farbe, rand) => (
    <g>
      <circle cx={x} cy={y} r="17" fill={farbe} stroke={rand} strokeWidth="1.6" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={F.tinte}>{t}</text>
    </g>
  );
  const linie = (x1, y1, x2, y2) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={F.achse} strokeWidth="1.6" />;
  return (
    <div>
      <Hinweis>Im Rechenbaum wird von unten nach oben gerechnet. Was zuerst gerechnet wird, steht weiter unten: Punktrechnung bindet stärker – außer eine Klammer sagt etwas anderes.</Hinweis>
      <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Rechenbaum">
        {klammer ? (
          <g>
            {linie(110, 140, 150, 96)}{linie(190, 140, 150, 96)}{linie(150, 96, 200, 46)}{linie(250, 96, 200, 46)}
            {knoten(110, 160, a, F.blau, F.see)}{knoten(190, 160, b, F.blau, F.see)}{knoten(250, 116, c, F.blau, F.see)}
            {knoten(150, 96, `${a + b}`, F.gold, F.gold3)}
            {knoten(200, 40, `${e}`, F.gold2, F.gold3)}
            <Txt x={150} y={72} gr={11} farbe={F.gold3}>+</Txt><Txt x={200} y={18} gr={11} farbe={F.gold3}>·</Txt>
          </g>
        ) : (
          <g>
            {linie(190, 140, 230, 96)}{linie(270, 140, 230, 96)}{linie(230, 96, 170, 46)}{linie(110, 96, 170, 46)}
            {knoten(190, 160, b, F.blau, F.see)}{knoten(270, 160, c, F.blau, F.see)}{knoten(110, 116, a, F.blau, F.see)}
            {knoten(230, 96, `${b * c}`, F.gold, F.gold3)}
            {knoten(170, 40, `${e}`, F.gold2, F.gold3)}
            <Txt x={230} y={72} gr={11} farbe={F.gold3}>·</Txt><Txt x={170} y={18} gr={11} farbe={F.gold3}>+</Txt>
          </g>
        )}
      </svg>
      <Umschalter label="Term" wert={klammer} setze={setKlammer} optionen={[[false, "a + b · c"], [true, "(a + b) · c"]]} />
      <Regler label="a" wert={a} setze={setA} min={1} max={9} schritt={1} anzeige={a} />
      <Regler label="b" wert={b} setze={setB} min={1} max={9} schritt={1} anzeige={b} />
      <Regler label="c" wert={c} setze={setC} min={1} max={9} schritt={1} anzeige={c} />
      <Messzeile>{klammer ? <M t={`(${a} + ${b}) \\cdot ${c} = ${a + b} \\cdot ${c} = ${e}`} /> : <M t={`${a} + ${b} \\cdot ${c} = ${a} + ${b * c} = ${e}`} />}</Messzeile>
    </div>
  );
}

/* ======================= Prozentstreifen ======================= */
function ProzentStreifen({ modus = "grund" }) {
  const [G, setG] = useState(modus === "faktor" ? 200 : 80);
  const [p, setP] = useState(modus === "faktor" ? 20 : 25);
  const [alt, setAlt] = useState(30);
  const [neu, setNeu] = useState(36);
  const [pm, setPm] = useState(5);
  const X = 20, W = 260;

  if (modus === "faktor") {
    const q = 1 + p / 100, Gn = G * q, w = W / 1.5, x2 = X + w * q;
    return (
      <div>
        <Hinweis>{p >= 0 ? "Erhöhen um p %: Der neue Wert ist (100 + p) % des alten. Man rechnet mit dem Faktor 1 + p/100." : "Senken um p %: Übrig bleiben (100 − p) %. Man rechnet mit dem Faktor 1 − p/100."}</Hinweis>
        <svg viewBox="0 0 340 130" style={svgStil} role="img" aria-label="Grundwert und vermehrter oder verminderter Grundwert">
          <rect x={X} y={20} width={w} height={30} rx="6" fill={F.blau} stroke={F.see} />
          <Txt x={X + w / 2} y={40} farbe={F.see}>100 % = {zt(G)}</Txt>
          <rect x={X} y={70} width={Math.max(2, x2 - X)} height={30} rx="6" fill={p >= 0 ? F.gold2 : F.rosa} stroke={p >= 0 ? F.gold3 : F.rosaKraeftig} />
          {p < 0 && <rect x={x2} y={70} width={X + w - x2} height={30} rx="6" fill="none" stroke={F.rosaKraeftig} strokeDasharray="4 3" />}
          <Txt x={X + (x2 - X) / 2} y={90}>{zt(100 + p)} % = {zt(Gn, 2)}</Txt>
          <line x1={X + w} x2={X + w} y1={14} y2={108} stroke={F.achse} strokeDasharray="3 3" />
        </svg>
        <Regler label="Grundwert" wert={G} setze={setG} min={50} max={500} schritt={10} anzeige={zt(G)} />
        <Regler label="Änderung p" wert={p} setze={setP} min={-50} max={50} schritt={5} anzeige={`${p > 0 ? "+" : ""}${zt(p)} %`} />
        <Messzeile><M t={`${zx(G)} \\cdot ${zx(q, 4)} = ${zx(Gn, 2)}`} /> · Wachstumsfaktor <M t={`q = 1 ${p >= 0 ? "+" : "-"} \\frac{${Math.abs(p)}}{100} = ${zx(q, 4)}`} /></Messzeile>
      </div>
    );
  }

  if (modus === "punkte") {
    const diff = neu - alt, rel = (diff / alt) * 100;
    return (
      <div>
        <Hinweis>Steigt ein Anteil von {zt(alt)} % auf {zt(neu)} %, sind das {zt(Math.abs(diff))} Prozentpunkte – aber relativ zum alten Wert ist es eine Änderung um {zt(Math.abs(rel), 1)} %.</Hinweis>
        <svg viewBox="0 0 340 120" style={svgStil} role="img" aria-label="Zwei Anteile im Vergleich">
          {[[alt, 18, F.blau, F.see, "vorher"], [neu, 64, F.gold2, F.gold3, "nachher"]].map(([v, y, f, r, t]) => (
            <g key={t}>
              <rect x={X} y={y} width={W} height={30} rx="6" fill="#F4F6FA" stroke={F.achse} />
              <rect x={X} y={y} width={(W * v) / 100} height={30} rx="6" fill={f} stroke={r} />
              <Txt x={X + (W * v) / 100 + 6} y={y + 20} anker="start" gr={11}>{zt(v)} % {t}</Txt>
            </g>
          ))}
          <line x1={X + (W * alt) / 100} x2={X + (W * alt) / 100} y1={14} y2={100} stroke={F.rosaKraeftig} strokeDasharray="3 3" />
        </svg>
        <Regler label="vorher" wert={alt} setze={setAlt} min={5} max={60} schritt={1} anzeige={`${alt} %`} />
        <Regler label="nachher" wert={neu} setze={setNeu} min={5} max={80} schritt={1} anzeige={`${neu} %`} />
        <Messzeile><M t={`${neu} \\% - ${alt} \\%`.replace(/\\%/g, "%") + ` = ${zx(diff)} \\text{ Prozentpunkte}, \\quad \\frac{${zx(diff)}}{${alt}} \\approx ${zx(rel, 1)} %`} /></Messzeile>
      </div>
    );
  }

  if (modus === "promille") {
    const zellenGefuellt = pm / 10;
    return (
      <div>
        <Hinweis>Ein Prozent ist ein Hundertstel, ein Promille ein Tausendstel. Ein Kästchen ist 1 % – in zehn Streifen geteilt ist jeder Streifen 1 ‰.</Hinweis>
        <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Hunderterfeld mit Promille-Streifen">
          {Array.from({ length: 100 }, (_, i) => {
            const x = 70 + (i % 10) * 20, y = 14 + Math.floor(i / 10) * 20;
            const voll = i < Math.floor(zellenGefuellt), teil = i === Math.floor(zellenGefuellt) ? (zellenGefuellt % 1) : 0;
            return (
              <g key={i}>
                <rect x={x} y={y} width="18" height="18" rx="2" fill={voll ? F.gold2 : "#F4F6FA"} stroke={voll ? F.gold3 : F.achse} strokeWidth="0.6" />
                {teil > 0 && <rect x={x} y={y} width={18 * teil} height="18" fill={F.rosa} stroke={F.rosaKraeftig} strokeWidth="0.6" />}
                {i === 0 && Array.from({ length: 9 }, (_, k) => <line key={k} x1={x + 1.8 * (k + 1)} x2={x + 1.8 * (k + 1)} y1={y} y2={y + 18} stroke={F.rosaKraeftig} strokeWidth="0.3" />)}
              </g>
            );
          })}
        </svg>
        <Regler label="Promille" wert={pm} setze={setPm} min={0} max={30} schritt={1} anzeige={`${pm} ‰`} />
        <Messzeile><M t={`${pm} \\text{ ‰} = \\frac{${pm}}{1000} = ${zx(pm / 10, 2)} % = ${zx(pm / 1000, 3)}`} /></Messzeile>
      </div>
    );
  }

  const Wv = (G * p) / 100;
  return (
    <div>
      <Hinweis>Der ganze Streifen ist der Grundwert G (100 %). Der gefärbte Teil ist der Prozentwert W, sein Anteil der Prozentsatz p %.</Hinweis>
      <svg viewBox="0 0 340 120" style={svgStil} role="img" aria-label="Prozentstreifen mit Grundwert und Prozentwert">
        <rect x={X} y={30} width={W} height={36} rx="7" fill="#F4F6FA" stroke={F.achse} />
        <rect x={X} y={30} width={(W * p) / 100} height={36} rx="7" fill={F.gold2} stroke={F.gold3} />
        {[0, 25, 50, 75, 100].map((v) => <g key={v}><line x1={X + (W * v) / 100} x2={X + (W * v) / 100} y1={70} y2={76} stroke={F.achse} /><text x={X + (W * v) / 100} y={88} textAnchor="middle" fontSize="9.5" fill={F.grau}>{v} %</text></g>)}
        <Txt x={X + W / 2} y={20} gr={11} farbe={F.see}>Grundwert G = {zt(G)}</Txt>
        <Txt x={X + Math.max(30, (W * p) / 200)} y={53} gr={11} farbe={F.gold3}>W = {zt(Wv, 2)}</Txt>
        <Txt x={X + (W * p) / 100} y={108} gr={11} farbe={F.rosaKraeftig}>p = {zt(p)} %</Txt>
      </svg>
      <Regler label="Grundwert G" wert={G} setze={setG} min={20} max={400} schritt={10} anzeige={zt(G)} />
      <Regler label="Prozentsatz p" wert={p} setze={setP} min={0} max={100} schritt={5} anzeige={`${p} %`} />
      <Messzeile><M t={`W = G \\cdot \\frac{p}{100} = ${zx(G)} \\cdot \\frac{${p}}{100} = ${zx(Wv, 2)}`} /></Messzeile>
    </div>
  );
}

/* ======================= Zinsleiste ======================= */
function ZinsLeiste() {
  const [K, setK] = useState(1200);
  const [p, setP] = useState(3);
  const [m, setM] = useState(5);
  const ZJ = (K * p) / 100, t = m * 30, Z = ZJ * (t / 360);
  const X = 20, W = 300;
  return (
    <div>
      <Hinweis>Bankjahr: 12 Monate zu je 30 Tagen = 360 Tage. Liegt das Geld nur einen Teil des Jahres, gibt es nur diesen Teil der Jahreszinsen.</Hinweis>
      <svg viewBox="0 0 340 120" style={svgStil} role="img" aria-label="Zeitleiste über zwölf Monate">
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i}>
            <rect x={X + (i * W) / 12} y={30} width={W / 12 - 3} height={34} rx="5" fill={i < m ? F.gold2 : "#F4F6FA"} stroke={i < m ? F.gold3 : F.achse} />
            <text x={X + (i * W) / 12 + W / 24 - 1.5} y={80} textAnchor="middle" fontSize="9" fill={F.grau}>{i + 1}</text>
          </g>
        ))}
        <Txt x={X + W / 2} y={20} gr={11} farbe={F.see}>Jahreszins {zt(ZJ, 2)} €</Txt>
        <Txt x={X + (m * W) / 24} y={52} gr={11} farbe={F.gold3}>{zt(Z, 2)} €</Txt>
        <text x={X + W / 2} y={104} textAnchor="middle" fontSize="10" fill={F.grau}>Monate</text>
      </svg>
      <Regler label="Kapital K" wert={K} setze={setK} min={100} max={5000} schritt={100} anzeige={`${zt(K)} €`} />
      <Regler label="Zinssatz p" wert={p} setze={setP} min={0.5} max={8} schritt={0.5} anzeige={`${zt(p)} %`} />
      <Regler label="Monate" wert={m} setze={setM} min={1} max={12} schritt={1} anzeige={m} />
      <Messzeile><M t={`Z = ${zx(K)} \\cdot \\frac{${zx(p)}}{100} \\cdot \\frac{${t}}{360} = ${zx(Z, 2)} \\text{ €}`} /></Messzeile>
    </div>
  );
}

/* ======================= Einheitentreppe ======================= */
const TREPPEN = {
  laenge: { e: ["km", "m", "dm", "cm", "mm"], f: [1000, 10, 10, 10], start: [1, 2.5] },
  flaeche: { e: ["km²", "ha", "a", "m²", "dm²", "cm²", "mm²"], f: [100, 100, 100, 100, 100, 100], start: [3, 2] },
  volumen: { e: ["m³", "dm³ = l", "cm³ = ml", "mm³"], f: [1000, 1000, 1000], start: [1, 1.5] },
  masse: { e: ["t", "kg", "g", "mg"], f: [1000, 1000, 1000], start: [1, 2.4] },
  zeit: { e: ["d", "h", "min", "s"], f: [24, 60, 60], start: [1, 2] },
};
function EinheitenTreppe({ art = "laenge" }) {
  const T = TREPPEN[art] || TREPPEN.laenge;
  const [ein, setEin] = useState(T.start[0]);
  const [w, setW] = useState(T.start[1]);
  /* Wert in kleinster Einheit */
  const faktorBis = (i) => T.f.slice(i).reduce((s, f) => s * f, 1);
  const basis = w * faktorBis(ein);
  const n = T.e.length, sb = Math.min(48, 300 / n), sh = Math.min(26, 150 / n);
  return (
    <div>
      <Hinweis>Eine Stufe nach unten (kleinere Einheit): mal Umrechnungszahl. Eine Stufe nach oben: geteilt. {art === "flaeche" ? "Bei Flächen ist es immer 100." : art === "volumen" ? "Bei Volumen ist es immer 1000." : art === "zeit" ? "Bei der Zeit sind es 24 und 60 – keine Zehnerzahlen!" : ""}</Hinweis>
      <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Einheitentreppe">
        {T.e.map((name, i) => {
          const x = 14 + i * sb * 1.12, y = 14 + i * sh;
          return (
            <g key={name}>
              <rect x={x} y={y} width={340 - x - 14} height={sh - 3} rx="5" fill={i === ein ? F.gold2 : i % 2 ? F.blau : "#EAF1FB"} stroke={i === ein ? F.gold3 : "none"} />
              <text x={x + 8} y={y + sh / 2 + 3} fontSize="11.5" fontWeight="700" fill={F.see}>{name}</text>
              <text x={334} y={y + sh / 2 + 3} textAnchor="end" fontSize="11" fontWeight={i === ein ? 700 : 500} fill={F.tinte}>{zt(basis / faktorBis(i), 6)}</text>
              {i < n - 1 && <text x={x + sb * 1.12 - 6} y={y + sh + sh / 2 + 3} textAnchor="end" fontSize="9.5" fontWeight="700" fill={F.rosaKraeftig}>· {T.f[i]}</text>}
            </g>
          );
        })}
      </svg>
      <Umschalter label="Einheit" wert={ein} setze={setEin} optionen={T.e.map((e, i) => [i, e.split(" ")[0]])} />
      <Regler label="Wert" wert={w} setze={setW} min={0.5} max={10} schritt={0.5} anzeige={`${zt(w)} ${T.e[ein].split(" ")[0]}`} />
      <Messzeile>
        {ein < n - 1 ? <M t={`${zx(w)} \\text{ ${T.e[ein].split(" ")[0]}} = ${zx(w * T.f[ein])} \\text{ ${T.e[ein + 1].split(" ")[0]}}`} />
          : <M t={`${zx(w)} \\text{ ${T.e[ein].split(" ")[0]}} = ${zx(w / T.f[ein - 1], 6)} \\text{ ${T.e[ein - 1].split(" ")[0]}}`} />}
      </Messzeile>
    </div>
  );
}

/* ======================= Maßstab ======================= */
function Massstab() {
  const [mi, setMi] = useState(2);
  const [cm, setCm] = useState(4);
  const ms = [100, 1000, 25000, 100000][mi];
  const real = cm * ms; /* in cm */
  const realText = real >= 100000 ? `${zt(real / 100000)} km` : real >= 100 ? `${zt(real / 100)} m` : `${zt(real)} cm`;
  const realTex = real >= 100000 ? `${zx(real / 100000)} \\,\\text{km}` : real >= 100 ? `${zx(real / 100)} \\,\\text{m}` : `${zx(real)} \\,\\text{cm}`;
  const X = 30, s = 28;
  return (
    <div>
      <Hinweis>1 : {zt(ms)} heißt: 1 cm auf der Karte sind {zt(ms)} cm in Wirklichkeit. Alle Längen werden mit derselben Zahl malgenommen.</Hinweis>
      <svg viewBox="0 0 340 130" style={svgStil} role="img" aria-label="Kartenstrecke und wirkliche Strecke">
        <rect x={14} y={10} width={312} height={70} rx="10" fill={F.gruen} opacity="0.6" />
        <path d="M30 60 C 80 20, 140 70, 200 40 S 300 30, 316 50" fill="none" stroke={F.blauMittel} strokeWidth="6" opacity="0.6" />
        <Punkt x={X} y={44} farbe={F.rosaKraeftig} r={6} />
        <Punkt x={X + cm * s} y={44} farbe={F.rosaKraeftig} r={6} />
        <line x1={X} x2={X + cm * s} y1={44} y2={44} stroke={F.rosaKraeftig} strokeWidth="2.4" strokeDasharray="6 3" />
        {Array.from({ length: 11 }, (_, i) => <g key={i}><line x1={X + i * s} x2={X + i * s} y1={88} y2={i % 5 ? 94 : 98} stroke={F.tinte} /><text x={X + i * s} y={110} textAnchor="middle" fontSize="9" fill={F.grau}>{i % 2 ? "" : i}</text></g>)}
        <line x1={X} x2={X + 10 * s} y1={88} y2={88} stroke={F.tinte} />
        <text x={X + 10 * s + 4} y={110} fontSize="9" fill={F.grau}>cm</text>
        <Txt x={X + (cm * s) / 2} y={32} gr={11} farbe={F.rosaKraeftig}>{realText}</Txt>
      </svg>
      <Umschalter label="Maßstab" wert={mi} setze={setMi} optionen={[[0, "1 : 100"], [1, "1 : 1000"], [2, "1 : 25 000"], [3, "1 : 100 000"]]} />
      <Regler label="Karte" wert={cm} setze={setCm} min={1} max={10} schritt={0.5} anzeige={`${zt(cm)} cm`} />
      <Messzeile><M t={`${zx(cm)} \\,\\text{cm} \\cdot ${zx(ms)} = ${zx(real)} \\,\\text{cm} = ${realTex}`} /></Messzeile>
    </div>
  );
}

/* ======================= Dreisatz ======================= */
function DreisatzTabelle({ modus = "proportional" }) {
  const anti = modus === "anti";
  const [x2, setX2] = useState(anti ? 3 : 5);
  const x1 = anti ? 4 : 3, y1 = anti ? 6 : 7.5;
  const yE = anti ? y1 * x1 : y1 / x1;
  const y2 = anti ? yE / x2 : yE * x2;
  const e1 = anti ? "Arbeiter" : "kg", e2 = anti ? "Tage" : "€";
  const zeilen = [[x1, y1], [1, yE], [x2, y2]];
  const opL = [`: ${x1}`, `· ${x2}`], opR = anti ? [`· ${x1}`, `: ${x2}`] : [`: ${x1}`, `· ${x2}`];
  return (
    <div>
      <Hinweis>{anti ? "Antiproportional: Doppelt so viele Arbeiter brauchen halb so lange. Links und rechts wird entgegengesetzt gerechnet." : "Proportional: Doppelt so viel kostet doppelt so viel. Links und rechts wird gleich gerechnet."}</Hinweis>
      <svg viewBox="0 0 340 170" style={svgStil} role="img" aria-label="Dreisatz-Tabelle">
        {zeilen.map(([a, b], i) => (
          <g key={i}>
            <rect x={80} y={14 + i * 52} width={80} height={36} rx="7" fill={i === 1 ? "#F4F6FA" : F.blau} stroke={F.see} strokeWidth="1" />
            <rect x={180} y={14 + i * 52} width={80} height={36} rx="7" fill={i === 2 ? F.gold2 : i === 1 ? "#F4F6FA" : F.blau} stroke={i === 2 ? F.gold3 : F.see} strokeWidth="1" />
            <Txt x={120} y={37 + i * 52} gr={13}>{zt(a)} {e1}</Txt>
            <Txt x={220} y={37 + i * 52} gr={13}>{zt(b, 2)} {e2}</Txt>
          </g>
        ))}
        {[0, 1].map((i) => (
          <g key={i}>
            <path d={`M78 ${36 + i * 52} C 52 ${44 + i * 52}, 52 ${76 + i * 52}, 78 ${84 + i * 52}`} fill="none" stroke={F.rosaKraeftig} strokeWidth="1.6" />
            <path d={`M262 ${36 + i * 52} C 288 ${44 + i * 52}, 288 ${76 + i * 52}, 262 ${84 + i * 52}`} fill="none" stroke={F.rosaKraeftig} strokeWidth="1.6" />
            <Txt x={40} y={64 + i * 52} gr={11} farbe={F.rosaKraeftig}>{opL[i]}</Txt>
            <Txt x={300} y={64 + i * 52} gr={11} farbe={F.rosaKraeftig}>{opR[i]}</Txt>
          </g>
        ))}
      </svg>
      <Regler label={anti ? "Arbeiter" : "Menge"} wert={x2} setze={setX2} min={1} max={anti ? 12 : 10} schritt={1} anzeige={`${x2} ${e1}`} />
      <Messzeile>{anti ? <M t={`${x1} \\cdot ${y1} = ${x2} \\cdot y \\;\\Rightarrow\\; y = \\frac{${x1 * y1}}{${x2}} = ${zx(y2, 2)}`} /> : <M t={`\\frac{${zx(y1)}}{${x1}} = ${zx(yE, 2)}, \\quad ${zx(yE, 2)} \\cdot ${x2} = ${zx(y2, 2)}`} />}</Messzeile>
    </div>
  );
}

/* ======================= Hyperbel ======================= */
function Hyperbel() {
  const [c, setC] = useState(12);
  const [x, setX] = useState(3);
  const k = koord({ x0: 0, x1: 12.5, y0: 0, y1: 12.5, w: 340, h: 240 });
  const y = c / x;
  return (
    <div>
      <Hinweis>Bei einer antiproportionalen Zuordnung ist das Produkt x · y immer gleich. Jedes Rechteck unter dem Graphen hat deshalb dieselbe Fläche c.</Hinweis>
      <svg viewBox="0 0 340 240" style={svgStil} role="img" aria-label="Hyperbel mit Rechteck gleicher Fläche">
        <Achsen k={k} schritt={2} />
        <rect x={k.px(0)} y={k.py(Math.min(y, 12.5))} width={k.px(x) - k.px(0)} height={k.py(0) - k.py(Math.min(y, 12.5))} fill={F.gold} stroke={F.gold3} strokeWidth="1.4" opacity="0.8" />
        <path d={k.kurve((t) => c / t, c / 12.5, 12.5)} fill="none" stroke={F.see} strokeWidth="2.4" />
        <Punkt x={k.px(x)} y={k.py(Math.min(y, 12.5))} farbe={F.rosaKraeftig} r={5.5} />
        <Txt x={k.px(x / 2)} y={k.py(Math.min(y, 12.5) / 2) + 4} gr={12} farbe={F.gold3}>{c}</Txt>
      </svg>
      <Regler label="c" wert={c} setze={setC} min={4} max={24} schritt={1} anzeige={c} />
      <Regler label="x" wert={x} setze={setX} min={1} max={12} schritt={0.5} anzeige={zt(x)} />
      <Messzeile><M t={`x \\cdot y = ${zx(x)} \\cdot ${zx(y, 2)} = ${c}, \\quad y = \\frac{${c}}{x}`} /></Messzeile>
    </div>
  );
}

/* ======================= Säulen / Daten ======================= */
function median(arr) { const s = [...arr].sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
function Saeulen({ zeige = "mittel" }) {
  const startDaten = zeige === "boxplot" ? [3, 7, 4, 9, 5, 6, 12, 5, 8, 4, 6] : zeige === "modus" ? [2, 3, 3, 1, 3, 2, 4, 3, 2, 5] : [4, 7, 3, 6, 5, 2, 8];
  const [werte, setWerte] = useState(startDaten);
  const letzter = werte[werte.length - 1];
  const setzeLetzten = (v) => setWerte([...werte.slice(0, -1), v]);
  const n = werte.length, sum = werte.reduce((s, v) => s + v, 0), mw = sum / n;
  const max = zeige === "modus" ? 6 : 20;

  if (zeige === "modus") {
    const haeuf = [1, 2, 3, 4, 5, 6].map((w) => werte.filter((v) => v === w).length);
    const hm = Math.max(...haeuf), modi = haeuf.map((h, i) => (h === hm ? i + 1 : null)).filter(Boolean);
    return (
      <div>
        <Hinweis>Noten einer Klassenarbeit, als Häufigkeiten gezählt. Der Modus ist der Wert, der am häufigsten vorkommt – die höchste Säule.</Hinweis>
        <svg viewBox="0 0 340 190" style={svgStil} role="img" aria-label="Säulendiagramm der Häufigkeiten">
          {haeuf.map((h, i) => {
            const x = 30 + i * 48, hh = h * 26;
            return (
              <g key={i}>
                <rect x={x} y={160 - hh} width={36} height={hh} rx="4" fill={h === hm ? F.gold2 : F.blau} stroke={h === hm ? F.gold3 : F.see} />
                <text x={x + 18} y={176} textAnchor="middle" fontSize="11" fontWeight="700" fill={F.tinte}>{i + 1}</text>
                {h > 0 && <text x={x + 18} y={154 - hh} textAnchor="middle" fontSize="10" fill={F.grau}>{h}</text>}
              </g>
            );
          })}
          <line x1={22} x2={322} y1={160} y2={160} stroke={F.achse} />
        </svg>
        <Regler label="Note der letzten Arbeit" wert={letzter} setze={setzeLetzten} min={1} max={6} schritt={1} anzeige={letzter} />
        <Messzeile>Daten: {werte.join(", ")} · Modus: {modi.join(" und ")}{modi.length > 1 ? " (zwei Modi)" : ""}</Messzeile>
      </div>
    );
  }

  const sortiert = [...werte].sort((a, b) => a - b);
  const zeigeSortiert = zeige === "median" || zeige === "boxplot" || zeige === "spannweite";
  const liste = zeigeSortiert ? sortiert : werte;
  const bw = Math.min(36, 280 / n), H = 140, Y0 = 160, sk = H / max;
  const med = median(werte);
  const unten = sortiert.slice(0, Math.floor(n / 2)), oben = sortiert.slice(Math.ceil(n / 2));
  const q1 = median(unten), q3 = median(oben);
  const s = Math.sqrt(werte.reduce((a, v) => a + (v - mw) ** 2, 0) / n);
  let markI = [];
  if (zeige === "median") markI = n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2];
  if (zeige === "spannweite") markI = [0, n - 1];

  const hinweis = {
    mittel: "Das arithmetische Mittel ist die Höhe, auf die man alle Säulen ausgleichen könnte: Was über der Linie liegt, füllt genau die Lücken darunter.",
    median: "Für den Median die Werte der Größe nach ordnen. Der mittlere Wert ist der Median – bei gerader Anzahl das Mittel der beiden mittleren.",
    spannweite: "Die Spannweite ist der Abstand zwischen dem größten und dem kleinsten Wert.",
    boxplot: "Geordnet und in vier Viertel geteilt: Q₁ ist der Median der unteren Hälfte, Q₃ der der oberen (der Median selbst gehört bei ungerader Anzahl zu keiner Hälfte).",
    streuung: "Die Standardabweichung misst, wie weit die Werte im Schnitt vom Mittelwert abweichen: Abweichungen quadrieren, mitteln, Wurzel ziehen.",
  }[zeige];
  return (
    <div>
      <Hinweis>{hinweis}</Hinweis>
      <svg viewBox={`0 0 340 ${zeige === "boxplot" ? 236 : 186}`} style={svgStil} role="img" aria-label="Säulendiagramm der Daten">
        {liste.map((v, i) => {
          const x = 30 + i * (280 / n) + (280 / n - bw) / 2, h = v * sk, an = markI.includes(i);
          return (
            <g key={i}>
              <rect x={x} y={Y0 - h} width={bw} height={h} rx="3" fill={an ? F.gold2 : F.blau} stroke={an ? F.gold3 : F.see} strokeWidth="1" />
              <text x={x + bw / 2} y={Y0 - h - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={F.tinte}>{v}</text>
              {zeige === "streuung" && <line x1={x + bw / 2} x2={x + bw / 2} y1={Y0 - h} y2={Y0 - mw * sk} stroke={F.rosaKraeftig} strokeWidth="2" />}
            </g>
          );
        })}
        <line x1={24} x2={318} y1={Y0} y2={Y0} stroke={F.achse} />
        {(zeige === "mittel" || zeige === "streuung") && <g><line x1={24} x2={318} y1={Y0 - mw * sk} y2={Y0 - mw * sk} stroke={F.rosaKraeftig} strokeWidth="2" strokeDasharray="6 4" /><Txt x={320} y={Y0 - mw * sk - 6} anker="end" gr={11} farbe={F.rosaKraeftig}>x̄ = {zt(mw, 2)}</Txt></g>}
        {zeige === "spannweite" && <g><line x1={326} x2={326} y1={Y0 - sortiert[n - 1] * sk} y2={Y0 - sortiert[0] * sk} stroke={F.rosaKraeftig} strokeWidth="2" /><Txt x={322} y={Y0 - ((sortiert[0] + sortiert[n - 1]) / 2) * sk} anker="end" gr={11} farbe={F.rosaKraeftig}>R</Txt></g>}
        {zeige === "boxplot" && (() => {
          const kx = (v) => 30 + (v / max) * 280, yb = 206;
          return (
            <g>
              {[0, 5, 10, 15, 20].map((v) => <text key={v} x={kx(v)} y={232} textAnchor="middle" fontSize="9" fill={F.grau}>{v}</text>)}
              <line x1={kx(sortiert[0])} x2={kx(q1)} y1={yb} y2={yb} stroke={F.see} strokeWidth="1.6" />
              <line x1={kx(q3)} x2={kx(sortiert[n - 1])} y1={yb} y2={yb} stroke={F.see} strokeWidth="1.6" />
              <line x1={kx(sortiert[0])} x2={kx(sortiert[0])} y1={yb - 8} y2={yb + 8} stroke={F.see} strokeWidth="1.6" />
              <line x1={kx(sortiert[n - 1])} x2={kx(sortiert[n - 1])} y1={yb - 8} y2={yb + 8} stroke={F.see} strokeWidth="1.6" />
              <rect x={kx(q1)} y={yb - 13} width={kx(q3) - kx(q1)} height={26} fill={F.gold} stroke={F.gold3} strokeWidth="1.6" />
              <line x1={kx(med)} x2={kx(med)} y1={yb - 13} y2={yb + 13} stroke={F.rosaKraeftig} strokeWidth="2.4" />
              <text x={kx(q1)} y={yb - 17} textAnchor="middle" fontSize="9" fontWeight="700" fill={F.gold3}>Q₁</text>
              <text x={kx(q3)} y={yb - 17} textAnchor="middle" fontSize="9" fontWeight="700" fill={F.gold3}>Q₃</text>
              <text x={kx(med)} y={yb - 17} textAnchor="middle" fontSize="9" fontWeight="700" fill={F.rosaKraeftig}>Median</text>
            </g>
          );
        })()}
      </svg>
      <Regler label="letzter Wert" wert={letzter} setze={setzeLetzten} min={1} max={max} schritt={1} anzeige={letzter} />
      <Messzeile>
        {zeige === "mittel" && <M t={`\\overline{x} = \\frac{${werte.join(" + ")}}{${n}} = \\frac{${sum}}{${n}} \\approx ${zx(mw, 2)}`} />}
        {zeige === "median" && <>Geordnet: {sortiert.join(", ")} · Median = {zt(med)} · zum Vergleich: <M t={`\\overline{x} \\approx ${zx(mw, 2)}`} /></>}
        {zeige === "spannweite" && <M t={`R = x_{max} - x_{min} = ${sortiert[n - 1]} - ${sortiert[0]} = ${sortiert[n - 1] - sortiert[0]}`} />}
        {zeige === "boxplot" && <>Min {sortiert[0]} · Q₁ = {zt(q1)} · Median {zt(med)} · Q₃ = {zt(q3)} · Max {sortiert[n - 1]} · Interquartilsabstand {zt(q3 - q1)}</>}
        {zeige === "streuung" && <M t={`\\overline{x} \\approx ${zx(mw, 2)}, \\quad s = \\sqrt{\\frac{${werte.map((v) => `(${v} - ${zx(mw, 2)})^2`).slice(0, 2).join(" + ")} + \\ldots}{${n}}} \\approx ${zx(s, 2)}`} />}
      </Messzeile>
    </div>
  );
}

/* ======================= Kreisdiagramm ======================= */
function KreisDiagramm() {
  const [w, setW] = useState([12, 8, 6, 4]);
  const namen = ["Bus", "Rad", "zu Fuß", "Auto"];
  const farben = [[F.blau, F.see], [F.gold2, F.gold3], [F.gruen, F.gruenKraeftig], [F.rosa, F.rosaKraeftig]];
  const sum = w.reduce((s, v) => s + v, 0) || 1;
  let w0 = -Math.PI / 2;
  const cx = 110, cy = 100, r = 80;
  const setze = (i) => (v) => setW(w.map((x, j) => (j === i ? v : x)));
  return (
    <div>
      <Hinweis>Wie kommen die Kinder einer Klasse zur Schule? Jeder Anteil bekommt denselben Anteil am vollen Kreis: Winkel = Anteil · 360°.</Hinweis>
      <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Kreisdiagramm">
        {w.map((v, i) => {
          if (v === 0) return null;
          const wi = (v / sum) * 2 * Math.PI, w1 = w0, w2 = w0 + wi; w0 = w2;
          const p1 = [cx + r * Math.cos(w1), cy + r * Math.sin(w1)], p2 = [cx + r * Math.cos(w2), cy + r * Math.sin(w2)];
          const m = (w1 + w2) / 2;
          const d = v === sum ? `M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy} Z` : `M${cx} ${cy} L${p1[0]} ${p1[1]} A${r} ${r} 0 ${wi > Math.PI ? 1 : 0} 1 ${p2[0]} ${p2[1]} Z`;
          return (
            <g key={i}>
              <path d={d} fill={farben[i][0]} stroke={farben[i][1]} strokeWidth="1.4" />
              {wi > 0.35 && <Txt x={cx + r * 0.62 * Math.cos(m)} y={cy + r * 0.62 * Math.sin(m) + 4} gr={10.5}>{zt((v / sum) * 360, 0)}°</Txt>}
            </g>
          );
        })}
        {namen.map((nm, i) => (
          <g key={nm}>
            <rect x={218} y={40 + i * 30} width={14} height={14} rx="3" fill={farben[i][0]} stroke={farben[i][1]} />
            <text x={238} y={52 + i * 30} fontSize="11.5" fontWeight="600" fill={F.tinte}>{nm}: {w[i]}</text>
          </g>
        ))}
      </svg>
      {namen.map((nm, i) => <Regler key={nm} label={nm} wert={w[i]} setze={setze(i)} min={0} max={20} schritt={1} anzeige={w[i]} />)}
      <Messzeile><M t={`${namen[0]}: \\frac{${w[0]}}{${sum}} \\cdot 360° ${(w[0] * 360) % sum === 0 ? "=" : "\\approx"} ${zx((w[0] / sum) * 360, 1)}°`} /></Messzeile>
    </div>
  );
}

export const BILDER_9 = {
  zahlenstrahl: (p) => <Zahlenstrahl {...p} />,
  stellenwertTafel: (p) => <StellenwertTafel {...p} />,
  dezimalKomma: (p) => <DezimalKomma {...p} />,
  teilerMengen: (p) => <TeilerMengen {...p} />,
  bruchKreis: (p) => <BruchKreis {...p} />,
  vorzeichenTafel: (p) => <VorzeichenTafel {...p} />,
  rechenbaum: (p) => <Rechenbaum {...p} />,
  prozentStreifen: (p) => <ProzentStreifen {...p} />,
  zinsLeiste: (p) => <ZinsLeiste {...p} />,
  einheitenTreppe: (p) => <EinheitenTreppe {...p} />,
  massstab: (p) => <Massstab {...p} />,
  dreisatzTabelle: (p) => <DreisatzTabelle {...p} />,
  hyperbel: (p) => <Hyperbel {...p} />,
  saeulen: (p) => <Saeulen {...p} />,
  kreisDiagramm: (p) => <KreisDiagramm {...p} />,
};
