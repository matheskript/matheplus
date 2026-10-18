import React from "react";
import { C } from "./base1.jsx";
import { Player, lauf, T } from "./funcErklaeranimation.jsx";

/* ======================================================================
   MOTION-VIDEOS FÜR DEN KOPFRECHENBEREICH
   Je Thema eine kurze, schrittweise Animation im gleichen Player wie die
   Erkläranimationen der Analysis (Abspielen, Pause, Schritt-Knöpfe,
   Zeitleiste, Beschriftung). Szenen:
     plusminus      Schriftlich addieren mit Übertrag, Probe mit Minus
     multiplizieren Flächenmodell: 23 · 14 in vier Teilflächen
     primzahlen     Sieb des Eratosthenes bis 49
     primfaktoren   Faktorbaum von 84
     potenzen       Quadrat, Winkelstreifen, Wurzel und Kubik
     division       Schriftlich teilen: 756 : 4
     bruchrechnen   Kürzen und Addieren am Bruchstreifen
   ====================================================================== */

/* Fenster: erscheint bei a, verschwindet ab b */
const fen = (t, a, b, d = 0.6) => lauf(t, a, a + d) * (1 - lauf(t, b, b + d));

/* Bruch gestapelt im SVG */
function Br({ x, y, z, n, g = 15, fill = C.tinte, o = 1 }) {
  const w = Math.max(String(z).length, String(n).length) * g * 0.36 + 5;
  return (
    <g opacity={o}>
      <T x={x} y={y - 3} textAnchor="middle" fontSize={g} fontWeight="800" fill={fill}>{z}</T>
      <line x1={x - w} x2={x + w} y1={y} y2={y} stroke={fill} strokeWidth="1.8" strokeLinecap="round" />
      <T x={x} y={y + g + 1} textAnchor="middle" fontSize={g} fontWeight="800" fill={fill}>{n}</T>
    </g>
  );
}

/* ======================================================================
   1 · PLUS UND MINUS  (478 + 256 = 734)
   ====================================================================== */
const PM_SCHRITTE = [
  { von: 0, text: "Schreibe die Zahlen so untereinander, dass Einer unter Einer, Zehner unter Zehner und Hunderter unter Hunderter stehen. Gerechnet wird immer von rechts nach links." },
  { von: 5, text: "Einer: 8 + 6 = 14. Schreibe nur die 4 unter den Strich. Die 10 wandert als kleine 1 (Übertrag) in die nächste Spalte." },
  { von: 10, text: "Zehner: 7 + 5 und der Übertrag 1 ergeben 13. Schreibe die 3 unter den Strich, die 1 wandert wieder eine Spalte weiter nach links." },
  { von: 15, text: "Hunderter: 4 + 2 und der Übertrag 1 ergeben 7. Es ist nichts mehr zu übertragen. Das Ergebnis lautet 734." },
  { von: 20, text: "Probe mit der Umkehrung: 734 − 256 = 478. Beim Minus fragst du: Wie viel muss zur unteren Ziffer dazu, damit die obere herauskommt? Reicht sie nicht, ergänzt du bis zum nächsten Zehner und trägst eine 1 weiter." },
];

function pmZeichne(t) {
  const X = [150, 200, 250];
  const A = [4, 7, 8], B = [2, 5, 6];
  const tab = lauf(t, 0.2, 1.2), z1 = lauf(t, 0.6, 1.6), z2 = lauf(t, 1.6, 2.6), strich = lauf(t, 2.6, 3.4);
  const hl = [fen(t, 15.2, 19.4), fen(t, 10.2, 14.4), fen(t, 5.2, 9.4)];
  const blase = [fen(t, 15.8, 19.4), fen(t, 10.8, 14.4), fen(t, 5.8, 9.4)];
  const res = [lauf(t, 17, 17.8), lauf(t, 12, 12.8), lauf(t, 7, 7.8)];
  const uebertrag = [0, lauf(t, 8.4, 9.2), lauf(t, 13.4, 14.2)];
  const text = ["4 + 2 + 1 = 7", "7 + 5 + 1 = 13", "8 + 6 = 14"];
  const box = lauf(t, 18.6, 19.6);
  return (
    <g>
      {X.map((x, i) => (
        <g key={i}>
          <rect x={x - 24} y="44" width="48" height="172" rx="10" fill={C.himmel} opacity={0.95 * hl[i]} />
          <T x={x} y="34" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.hellgrau} opacity={tab}>{["H", "Z", "E"][i]}</T>
          <T x={x} y="110" textAnchor="middle" fontSize="30" fontWeight="800" fill={C.tinte} opacity={z1}>{A[i]}</T>
          <T x={x} y="154" textAnchor="middle" fontSize="30" fontWeight="800" fill={C.tinte} opacity={z2}>{B[i]}</T>
          <T x={x} y="206" textAnchor="middle" fontSize="30" fontWeight="800" fill={C.smaragd} opacity={res[i]}>{[7, 3, 4][i]}</T>
          <T x={x} y="82" textAnchor="middle" fontSize="17" fontWeight="800" fill={C.gold} opacity={uebertrag[i]}>1</T>
          <T x={x} y="246" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.see} opacity={blase[i]}>{text[i]}</T>
        </g>
      ))}
      <T x="98" y="154" textAnchor="middle" fontSize="30" fontWeight="800" fill={C.see} opacity={z2}>+</T>
      <line x1="88" y1="168" x2="278" y2="168" stroke={C.tinte} strokeWidth="2.8" strokeLinecap="round" opacity={strich} />
      <rect x="124" y="180" width="152" height="40" rx="12" fill={C.flaggold} opacity={0.3 * box} />
      <T x="180" y="284" textAnchor="middle" fontSize="19" fontWeight="800" fill={C.tinte} opacity={lauf(t, 20.4, 21.6)}>Probe: 734 − 256 = 478</T>
      <T x="180" y="308" textAnchor="middle" fontSize="12.5" fontWeight="600" fill={C.grau} opacity={lauf(t, 22, 23.2)}>Einer: 6 + 8 = 14 · Zehner: 5 + 1 + 7 = 13</T>
      <T x="180" y="326" textAnchor="middle" fontSize="12.5" fontWeight="600" fill={C.grau} opacity={lauf(t, 23.2, 24.4)}>Hunderter: 2 + 1 + 4 = 7  →  Ergebnis 478</T>
    </g>
  );
}

/* ======================================================================
   2 · MULTIPLIZIEREN  (23 · 14, Flächenmodell)
   ====================================================================== */
const ML_SCHRITTE = [
  { von: 0, text: "Ein Produkt ist eine Fläche: 23 · 14 sind die Kästchen eines Rechtecks mit den Seiten 23 und 14. Wir zerlegen es in Stücke, die du im Kopf kannst." },
  { von: 5.2, text: "Zerlege die erste Zahl nach Stellen: 23 = 20 + 3. Ein senkrechter Schnitt teilt das Rechteck." },
  { von: 9.2, text: "Zerlege auch die zweite Zahl: 14 = 10 + 4. Ein waagerechter Schnitt macht vier Teilflächen." },
  { von: 13.2, text: "Rechne jede Teilfläche einzeln: 20 · 10 = 200, 3 · 10 = 30, 20 · 4 = 80 und 3 · 4 = 12. Mal 10 heißt: eine Null anhängen." },
  { von: 21.6, text: "Addiere die vier Teilergebnisse: 200 + 30 + 80 + 12 = 322. Zur Kontrolle schätzt du: 20 · 15 = 300, das passt zu 322." },
];

function mlZeichne(t) {
  const X0 = 64, Y0 = 56, ES = 8, EH = 10;
  const wA = 20 * ES, wB = 3 * ES, hA = 10 * EH, hB = 4 * EH;
  const W = wA + wB, Hh = hA + hB;
  const aussen = lauf(t, 0.3, 1.5), beschr = lauf(t, 1.4, 2.4);
  const sv = lauf(t, 5.6, 6.9), l1 = lauf(t, 6.9, 7.9);
  const sh = lauf(t, 9.6, 10.9), l2 = lauf(t, 10.9, 11.9);
  const fa = lauf(t, 13.6, 14.6), fb = lauf(t, 15.6, 16.6), fc = lauf(t, 17.6, 18.6), fd = lauf(t, 19.6, 20.6);
  const summe = lauf(t, 22, 23.4), probe = lauf(t, 24, 25.4);
  const ganz = beschr * (1 - l1), ganzL = beschr * (1 - l2);
  return (
    <g>
      <rect x={X0} y={Y0} width={W * aussen} height={Hh * aussen} fill={C.himmel} stroke={C.see} strokeWidth="2" rx="3" />
      <rect x={X0} y={Y0} width={wA} height={hA} fill={C.see} opacity={0.82 * fa} />
      <rect x={X0 + wA} y={Y0} width={wB} height={hA} fill={C.flaggold} opacity={0.9 * fb} />
      <rect x={X0} y={Y0 + hA} width={wA} height={hB} fill={C.seeHell} opacity={0.9 * fc} />
      <rect x={X0 + wA} y={Y0 + hA} width={wB} height={hB} fill={C.signal} opacity={0.85 * fd} />
      <line x1={X0 + wA} y1={Y0} x2={X0 + wA} y2={Y0 + Hh * sv} stroke={C.gold} strokeWidth="2.2" strokeDasharray="5 3" opacity={sv > 0.01 ? 1 : 0} />
      <line x1={X0} y1={Y0 + hA} x2={X0 + W * sh} y2={Y0 + hA} stroke={C.gold} strokeWidth="2.2" strokeDasharray="5 3" opacity={sh > 0.01 ? 1 : 0} />
      <T x={X0 + W / 2} y={Y0 - 14} textAnchor="middle" fontSize="16" fontWeight="800" fill={C.see} opacity={ganz}>23</T>
      <T x={X0 + wA / 2} y={Y0 - 14} textAnchor="middle" fontSize="16" fontWeight="800" fill={C.see} opacity={l1}>20</T>
      <T x={X0 + wA + wB / 2} y={Y0 - 14} textAnchor="middle" fontSize="16" fontWeight="800" fill={C.gold} opacity={l1}>3</T>
      <T x={X0 - 12} y={Y0 + Hh / 2 + 6} textAnchor="end" fontSize="16" fontWeight="800" fill={C.see} opacity={ganzL}>14</T>
      <T x={X0 - 12} y={Y0 + hA / 2 + 6} textAnchor="end" fontSize="16" fontWeight="800" fill={C.see} opacity={l2}>10</T>
      <T x={X0 - 12} y={Y0 + hA + hB / 2 + 6} textAnchor="end" fontSize="16" fontWeight="800" fill={C.gold} opacity={l2}>4</T>
      <T x={X0 + wA / 2} y={Y0 + hA / 2 + 6} textAnchor="middle" fontSize="16" fontWeight="800" fill={C.weiss} opacity={fa}>20 · 10 = 200</T>
      <T x={X0 + wA / 2} y={Y0 + hA + hB / 2 + 6} textAnchor="middle" fontSize="15" fontWeight="800" fill={C.weiss} opacity={fc}>20 · 4 = 80</T>
      <T x={X0 + W + 10} y={Y0 + hA / 2 + 6} fontSize="14" fontWeight="800" fill={C.gold} opacity={fb}>3 · 10 = 30</T>
      <T x={X0 + W + 10} y={Y0 + hA + hB / 2 + 6} fontSize="14" fontWeight="800" fill={C.signal} opacity={fd}>3 · 4 = 12</T>
      <T x="180" y="258" textAnchor="middle" fontSize="21" fontWeight="800" fill={C.tinte} opacity={summe}>200 + 30 + 80 + 12 = <tspan fill={C.smaragd}>322</tspan></T>
      <T x="180" y="284" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.grau} opacity={probe}>Schätzen: 23 · 14 ≈ 20 · 15 = 300 ✓</T>
    </g>
  );
}

/* ======================================================================
   3 · PRIMZAHLEN  (Sieb des Eratosthenes bis 49)
   ====================================================================== */
const PZ_SCHRITTE = [
  { von: 0, text: "Alle Zahlen von 1 bis 49. Eine Primzahl hat genau zwei Teiler: 1 und sich selbst. Die 1 hat nur einen Teiler und wird deshalb zuerst gestrichen." },
  { von: 6, text: "Die 2 ist prim und bleibt. Alle Vielfachen von 2 haben die 2 als Teiler und werden gestrichen: 4, 6, 8 …" },
  { von: 11.6, text: "Die nächste freie Zahl ist die 3. Sie bleibt, ihre Vielfachen fallen weg: 9, 15, 21 … (6, 12, 18 sind schon weg)." },
  { von: 16, text: "Dann 5 und 7. Es genügt, bis √49 = 7 zu sieben: Jede zusammengesetzte Zahl bis 49 hat einen Teiler von höchstens 7. Zuletzt fallen 25, 35 und 49." },
  { von: 20.4, text: "Was übrig bleibt, sind genau die Primzahlen bis 49: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43 und 47. Das sind 15." },
];

function kleinsterTeiler(n) { for (let p = 2; p * p <= n; p++) if (n % p === 0) return p; return n; }
const SIEB_START = { 2: 7.0, 3: 12.4, 5: 16.6, 7: 17.8 };
const SIEB_TAKT = { 2: 0.14, 3: 0.14, 5: 0.3, 7: 0.3 };
const SIEB_KREIS = { 2: 6.3, 3: 11.9, 5: 16.1, 7: 17.3 };

function siebZeichne(t) {
  const z = 34, X0 = 61, Y0 = 34;
  const gitter = lauf(t, 0.2, 1.4);
  const zellen = Array.from({ length: 49 }, (_, i) => i + 1).map((n) => {
    const r = Math.floor((n - 1) / 7), c = (n - 1) % 7;
    const x = X0 + c * z, y = Y0 + r * z;
    let weg = 0, prim = 0;
    if (n === 1) weg = lauf(t, 3, 3.8);
    else {
      const p = kleinsterTeiler(n);
      if (p !== n) weg = lauf(t, SIEB_START[p] + (n / p - p) * SIEB_TAKT[p], SIEB_START[p] + (n / p - p) * SIEB_TAKT[p] + 0.5);
      else prim = n <= 7 ? lauf(t, SIEB_KREIS[n], SIEB_KREIS[n] + 0.6) : lauf(t, 20.8, 21.8);
    }
    return (
      <g key={n} opacity={gitter}>
        <rect x={x + 1.5} y={y + 1.5} width={z - 3} height={z - 3} rx="7" fill={C.weiss} stroke={C.linie} strokeWidth="1.4" />
        <rect x={x + 1.5} y={y + 1.5} width={z - 3} height={z - 3} rx="7" fill="#DCE1EA" opacity={weg} />
        <rect x={x + 1.5} y={y + 1.5} width={z - 3} height={z - 3} rx="7" fill={C.flaggold} opacity={prim} />
        <T x={x + z / 2} y={y + z / 2 + 5.5} textAnchor="middle" fontSize="15" fontWeight="800" fill={prim > 0.5 ? C.seeTief : C.tinte} opacity={1 - 0.62 * weg}>{n}</T>
      </g>
    );
  });
  return (
    <g>
      {zellen}
      <T x="180" y="300" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.grau} opacity={fen(t, 18.4, 20.2)}>bis √49 = 7 sieben genügt</T>
      <T x="180" y="304" textAnchor="middle" fontSize="19" fontWeight="800" fill={C.tinte} opacity={lauf(t, 22, 23.2)}>15 Primzahlen bis 49</T>
      <T x="180" y="326" textAnchor="middle" fontSize="12" fontWeight="600" fill={C.grau} opacity={lauf(t, 22.6, 23.8)}>2 3 5 7 11 13 17 19 23 29 31 37 41 43 47</T>
    </g>
  );
}

/* ======================================================================
   4 · PRIMFAKTOREN  (Faktorbaum von 84)
   ====================================================================== */
const PF_SCHRITTE = [
  { von: 0, text: "Wir zerlegen 84 in Primfaktoren. Ein Faktorbaum spaltet jede Zahl in zwei Faktoren – so lange, bis nur noch Primzahlen übrig sind." },
  { von: 5, text: "Suche den kleinsten Teiler: 2 geht auf. 84 : 2 = 42. Die 2 ist prim und bekommt einen goldenen Ring. Die 42 muss weiter zerlegt werden." },
  { von: 10, text: "Wieder der kleinste Teiler: 42 : 2 = 21. Die zweite 2 ist prim. Die 21 ist noch nicht prim." },
  { von: 15, text: "21 ist nicht durch 2 teilbar, aber durch 3: 21 : 3 = 7. Beide, 3 und 7, sind prim. Der Baum ist fertig." },
  { von: 20, text: "Lies alle goldenen Zahlen ab: 84 = 2 · 2 · 3 · 7. Gleiche Faktoren fasst du zur Potenz zusammen: 2 · 2 = 2². Probe: 2 · 2 · 3 · 7 = 84." },
];

function baumZeichne(t) {
  const K = { w: [150, 44, 84], a: [80, 112, 2], b: [190, 112, 42], c: [140, 182, 2], d: [240, 182, 21], e: [200, 252, 3], f: [280, 252, 7] };
  const kante = (von, nach, p) => {
    const [x1, y1] = K[von], [x2, y2] = K[nach];
    return <line key={von + nach} x1={x1} y1={y1 + 20} x2={x1 + (x2 - x1) * p} y2={y1 + 20 + (y2 - 20 - (y1 + 20)) * p} stroke={C.hellgrau} strokeWidth="2.4" strokeLinecap="round" opacity={p > 0.01 ? 1 : 0} />;
  };
  const p1 = lauf(t, 5.4, 6.8), p2 = lauf(t, 10.4, 11.8), p3 = lauf(t, 15.4, 16.8);
  const vis = { w: lauf(t, 0.4, 1.4), a: lauf(t, 6.6, 7.4), b: lauf(t, 6.6, 7.4), c: lauf(t, 11.6, 12.4), d: lauf(t, 11.6, 12.4), e: lauf(t, 16.6, 17.4), f: lauf(t, 16.6, 17.4) };
  const ring = { a: lauf(t, 7.6, 8.4), c: lauf(t, 12.6, 13.4), e: lauf(t, 17.6, 18.4), f: lauf(t, 17.8, 18.6) };
  const knoten = Object.entries(K).map(([id, [x, y, z]]) => (
    <g key={id} opacity={vis[id]}>
      <circle cx={x} cy={y} r="22" fill={C.himmel} stroke={C.see} strokeWidth="2" />
      <circle cx={x} cy={y} r="22" fill={C.flaggold} stroke={C.gold} strokeWidth="2.6" opacity={ring[id] || 0} />
      <T x={x} y={y + 6} textAnchor="middle" fontSize="18" fontWeight="800" fill={C.seeTief}>{z}</T>
    </g>
  ));
  return (
    <g>
      {kante("w", "a", p1)}{kante("w", "b", p1)}{kante("b", "c", p2)}{kante("b", "d", p2)}{kante("d", "e", p3)}{kante("d", "f", p3)}
      {knoten}
      <T x="218" y="48" fontSize="13" fontWeight="700" fill={C.grau} opacity={lauf(t, 5.8, 6.8)}>84 : 2 = 42</T>
      <T x="226" y="116" fontSize="13" fontWeight="700" fill={C.grau} opacity={lauf(t, 10.8, 11.8)}>42 : 2 = 21</T>
      <T x="272" y="186" fontSize="13" fontWeight="700" fill={C.grau} opacity={lauf(t, 15.8, 16.8)}>21 : 3 = 7</T>
      <T x="180" y="316" textAnchor="middle" fontSize="20" fontWeight="800" fill={C.tinte} opacity={lauf(t, 20.4, 21.6)}>84 = <tspan fill={C.gold}>2 · 2 · 3 · 7</tspan></T>
      <T x="180" y="340" textAnchor="middle" fontSize="20" fontWeight="800" fill={C.tinte} opacity={lauf(t, 22, 23.2)}>= <tspan fill={C.gold}>2² · 3 · 7</tspan></T>
      <T x="180" y="362" textAnchor="middle" fontSize="12.5" fontWeight="600" fill={C.grau} opacity={lauf(t, 23.4, 24.6)}>Probe: 2 · 2 · 3 · 7 = 84 ✓</T>
    </g>
  );
}

/* ======================================================================
   5 · QUADRATE UND WURZELN (mit Kubik)
   ====================================================================== */
const PO_SCHRITTE = [
  { von: 0, text: "Ein Quadrat mit der Seitenlänge 6 besteht aus 6 · 6 = 36 Kästchen. Deshalb ist 6² die Fläche und nicht 2 · 6." },
  { von: 5.6, text: "Wächst die Seite um 1, kommt ein Winkel aus Kästchen dazu: 6 + 6 + 1 = 13. Daraus folgt 7² = 36 + 13 = 49. Dieser Winkel ist immer die nächste ungerade Zahl." },
  { von: 12.4, text: "Die Wurzel dreht die Frage um: Die Fläche ist 49 – wie lang ist die Seite? √49 = 7, denn 7 · 7 = 49. Darum lernst du die Quadratzahlen so gut." },
  { von: 18, text: "Hoch 3 bedeutet drei Faktoren: Erst eine Schicht 3 · 3 = 9, dann drei Schichten übereinander: 3³ = 9 · 3 = 27 Würfel." },
  { von: 24.2, text: "Merke dir: Das Quadrat ist eine Fläche, die Wurzel ist die Seite dazu, der Kubik ist ein Raum aus Schichten." },
];

function poZeichne(t) {
  const z = 26, X0 = 40, Y0 = 36;
  const gitterAus = 1 - lauf(t, 17.6, 18.4);
  const zellen = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
    const innen = r < 6 && c < 6;
    const idx = r === 6 ? c : 6 + r;
    const an = innen ? lauf(t, 0.6 + (r * 6 + c) * 0.045, 0.9 + (r * 6 + c) * 0.045) : lauf(t, 6.4 + idx * 0.14, 6.8 + idx * 0.14);
    const nachBlau = lauf(t, 12.6, 13.6);
    zellen.push(
      <g key={`${r}-${c}`} opacity={gitterAus}>
        <rect x={X0 + c * z + 1} y={Y0 + r * z + 1} width={z - 2} height={z - 2} rx="4" fill={innen ? C.see : C.flaggold} opacity={0.88 * an * (innen ? 1 : 1 - nachBlau)} />
        {!innen && <rect x={X0 + c * z + 1} y={Y0 + r * z + 1} width={z - 2} height={z - 2} rx="4" fill={C.see} opacity={0.88 * an * nachBlau} />}
      </g>,
    );
  }
  const l6 = lauf(t, 3.2, 4.2) * (1 - lauf(t, 10.6, 11.2));
  const l7 = (lauf(t, 10.8, 11.8) * (1 - lauf(t, 14.6, 15.2)) + lauf(t, 15.6, 16.6)) * gitterAus;
  /* Kubik: drei Schichten 3 × 3 */
  const Z = 24, CX = 126, CY = 140;
  const schicht = (k) => {
    const a = lauf(t, 18.8 + k * 1.3, 19.8 + k * 1.3);
    const farben = [C.see, C.seeHell, "#9DB4D6"];
    const rects = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) rects.push(<rect key={`${r}${c}`} x={CX + k * 20 + c * Z + 1} y={CY - k * 20 + r * Z + 1} width={Z - 2} height={Z - 2} rx="3.5" fill={farben[k]} stroke={C.weiss} strokeWidth="1" />);
    return <g key={k} opacity={a}>{rects}</g>;
  };
  return (
    <g>
      {zellen}
      <T x={X0 + 78} y={Y0 - 10} textAnchor="middle" fontSize="15" fontWeight="800" fill={C.see} opacity={l6}>6</T>
      <T x={X0 - 12} y={Y0 + 84} textAnchor="end" fontSize="15" fontWeight="800" fill={C.see} opacity={l6}>6</T>
      <T x={X0 + 91} y={Y0 - 10} textAnchor="middle" fontSize="15" fontWeight="800" fill={C.see} opacity={l7}>7</T>
      <T x={X0 - 12} y={Y0 + 97} textAnchor="end" fontSize="15" fontWeight="800" fill={C.see} opacity={l7}>7</T>
      <T x={X0 + 91} y={Y0 + 98} textAnchor="middle" fontSize="40" fontWeight="800" fill={C.weiss} opacity={lauf(t, 13.4, 14.2) * (1 - lauf(t, 17.2, 17.8))}>49</T>
      <T x="180" y="258" textAnchor="middle" fontSize="19" fontWeight="800" fill={C.tinte} opacity={fen(t, 4, 5.6)}>6² = 6 · 6 = <tspan fill={C.see}>36</tspan></T>
      <T x="180" y="258" textAnchor="middle" fontSize="17" fontWeight="800" fill={C.tinte} opacity={fen(t, 8.4, 12.2)}>7² = 36 + 13 = <tspan fill={C.see}>49</tspan></T>
      <T x="180" y="282" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.grau} opacity={fen(t, 9.2, 12.2)}>13 = 2 · 6 + 1</T>
      <T x="180" y="258" textAnchor="middle" fontSize="16" fontWeight="700" fill={C.grau} opacity={fen(t, 14, 15.8)}>Fläche 49 – wie lang ist die Seite?</T>
      <T x="180" y="258" textAnchor="middle" fontSize="19" fontWeight="800" fill={C.tinte} opacity={lauf(t, 15.8, 16.8) * gitterAus}>√49 = <tspan fill={C.smaragd}>7</tspan></T>
      <T x="180" y="282" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.grau} opacity={lauf(t, 16.4, 17.4) * gitterAus}>weil 7 · 7 = 49</T>
      {[2, 1, 0].map(schicht)}
      <T x="180" y="258" textAnchor="middle" fontSize="19" fontWeight="800" fill={C.tinte} opacity={fen(t, 21.8, 24.2)}>3³ = 3 · 3 · 3 = 9 · 3 = <tspan fill={C.see}>27</tspan></T>
      <T x="180" y="282" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.grau} opacity={fen(t, 22.4, 24.2)}>3 Schichten mit je 3 · 3 = 9 Würfeln</T>
      <T x="180" y="244" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.see} opacity={lauf(t, 24.6, 25.6)}>Quadrat = Fläche</T>
      <T x="180" y="266" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.smaragd} opacity={lauf(t, 25.4, 26.4)}>Wurzel = Seite</T>
      <T x="180" y="288" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.gold} opacity={lauf(t, 26.2, 27.2)}>Kubik = Raum</T>
    </g>
  );
}

/* ======================================================================
   6 · SCHRIFTLICH TEILEN  (756 : 4 = 189)
   ====================================================================== */
const DV_SCHRITTE = [
  { von: 0, text: "Wir teilen 756 durch 4. Immer wieder derselbe Vierklang: Wie oft passt der Teiler? Mal nehmen. Abziehen. Nächste Ziffer herunterholen." },
  { von: 5, text: "Beginne links: Die 7 ist größer als 4. Wie oft passt 4 in 7? 1-mal. Schreibe 1 ins Ergebnis, rechne 1 · 4 = 4 und ziehe ab: 7 − 4 = 3." },
  { von: 11, text: "Hole die nächste Ziffer herunter: die 5. Du hast jetzt 35. Wie oft passt 4 in 35? 8-mal, denn 8 · 4 = 32. Rest: 35 − 32 = 3." },
  { von: 17, text: "Hole die letzte Ziffer herunter: die 6. Du hast jetzt 36. 4 passt 9-mal hinein, denn 9 · 4 = 36. Rest: 36 − 36 = 0." },
  { von: 23, text: "Alle Ziffern sind verbraucht und der Rest ist 0: 756 : 4 = 189. Probe: 189 · 4 = 756. Bliebe ein Rest, schreibst du ihn mit „Rest“ dahinter." },
];

function dvZeichne(t) {
  const col = [100, 130, 160];
  const D = (x, y, s, o, fill = C.tinte, g = 26) => <T x={x} y={y} textAnchor="middle" fontSize={g} fontWeight="800" fill={fill} opacity={o}>{s}</T>;
  const start = lauf(t, 0.3, 1.4);
  const q = [lauf(t, 6.4, 7.2), lauf(t, 12.6, 13.4), lauf(t, 17.8, 18.6)];
  const hl = [fen(t, 5.2, 10.4), fen(t, 11.2, 16.4), fen(t, 17.2, 22.4)];
  const linie = (x1, x2, y, o) => <line x1={x1} x2={x2} y1={y} y2={y} stroke={C.tinte} strokeWidth="2.4" strokeLinecap="round" opacity={o} />;
  return (
    <g>
      {col.map((x, i) => <rect key={i} x={x - 16} y="34" width="32" height="40" rx="8" fill={C.flaggold} opacity={0.35 * hl[i]} />)}
      {D(col[0], 62, "7", start)}{D(col[1], 62, "5", start)}{D(col[2], 62, "6", start)}
      {D(196, 62, ":", start, C.grau)}{D(216, 62, "4", start)}{D(242, 62, "=", start, C.grau)}
      {D(270, 62, "1", q[0], C.smaragd)}{D(300, 62, "8", q[1], C.smaragd)}{D(330, 62, "9", q[2], C.smaragd)}

      {/* 7 : 4 = 1 */}
      {D(70, 104, "−", lauf(t, 7.4, 8.2), C.signal)}{D(col[0], 104, "4", lauf(t, 7.4, 8.2), C.signal)}
      {linie(84, 116, 112, lauf(t, 8.2, 8.8))}
      {D(col[0], 138, "3", lauf(t, 8.8, 9.6))}
      {/* 5 herunterholen */}
      <path d={`M${col[1]} 78 V120`} stroke={C.gold} strokeWidth="2.2" strokeDasharray="4 3" fill="none" opacity={fen(t, 11.2, 12.4)} />
      {D(col[1], 138, "5", lauf(t, 11.8, 12.6), C.gold)}
      {/* 35 : 4 = 8 */}
      {D(70, 172, "−", lauf(t, 13.6, 14.4), C.signal)}{D(col[0], 172, "3", lauf(t, 13.6, 14.4), C.signal)}{D(col[1], 172, "2", lauf(t, 13.6, 14.4), C.signal)}
      {linie(84, 146, 180, lauf(t, 14.4, 15))}
      {D(col[1], 206, "3", lauf(t, 15, 15.8))}
      {/* 6 herunterholen */}
      <path d={`M${col[2]} 78 V188`} stroke={C.gold} strokeWidth="2.2" strokeDasharray="4 3" fill="none" opacity={fen(t, 17.2, 18.2)} />
      {D(col[2], 206, "6", lauf(t, 17.6, 18.4), C.gold)}
      {/* 36 : 4 = 9 */}
      {D(100, 240, "−", lauf(t, 19.2, 20), C.signal)}{D(col[1], 240, "3", lauf(t, 19.2, 20), C.signal)}{D(col[2], 240, "6", lauf(t, 19.2, 20), C.signal)}
      {linie(114, 176, 248, lauf(t, 20, 20.6))}
      {D(col[2], 274, "0", lauf(t, 20.8, 21.6), C.smaragd)}

      <rect x="250" y="38" width="100" height="36" rx="12" fill={C.smaragd} opacity={0.14 * lauf(t, 23, 24)} />
      <T x="180" y="304" textAnchor="middle" fontSize="19" fontWeight="800" fill={C.tinte} opacity={lauf(t, 23.4, 24.6)}>756 : 4 = <tspan fill={C.smaragd}>189</tspan></T>
      <T x="180" y="326" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.grau} opacity={lauf(t, 24.6, 25.8)}>Probe: 189 · 4 = 756 ✓</T>
    </g>
  );
}

/* ======================================================================
   7 · BRUCHRECHNUNG  (6/8 kürzen, 1/2 + 1/3)
   ====================================================================== */
const BR_SCHRITTE = [
  { von: 0, text: "Ein Bruch zeigt Teile eines Ganzen: Der Nenner sagt, in wie viele gleiche Teile das Ganze zerlegt ist, der Zähler, wie viele davon gemeint sind. 6/8 sind sechs von acht Teilen." },
  { von: 5.6, text: "Kürzen: Fasse die Teile zu Paaren zusammen. Aus acht Teilen werden vier, aus sechs gefärbten drei. Du teilst Zähler und Nenner durch dieselbe Zahl, hier durch 2: 6/8 = 3/4. Der Wert bleibt gleich." },
  { von: 11.2, text: "Plus: 1/2 und 1/3 haben verschiedene Nenner, die Teile sind verschieden groß. So kannst du die Zähler nicht einfach addieren." },
  { von: 16.6, text: "Suche den Hauptnenner, das kleinste gemeinsame Vielfache von 2 und 3: 6. Erweitere: 1/2 mal 3 ergibt 3/6, und 1/3 mal 2 ergibt 2/6. Jetzt sind alle Teile gleich groß." },
  { von: 22.4, text: "Addiere nur die Zähler, der Nenner bleibt: 3/6 + 2/6 = 5/6. Prüfe zum Schluss, ob du kürzen kannst: 5 und 6 haben keinen gemeinsamen Teiler, also ist 5/6 das Ergebnis." },
];

function brZeichne(t) {
  const X0 = 66;
  const strip = (teile, breite, y, hoehe, farbe, gefuellt, o, an = 1) => Array.from({ length: teile }, (_, i) => (
    <rect key={i} x={X0 + i * breite + 1} y={y} width={breite - 2} height={hoehe} rx="5" fill={i < gefuellt ? farbe : C.weiss} stroke={i < gefuellt ? farbe : C.hellgrau} strokeWidth="1.6" opacity={o * (i < gefuellt ? an : 1)} />
  ));
  /* Teil 1: Kürzen */
  const o1 = lauf(t, 0.3, 1.2) * (1 - lauf(t, 10.4, 11.2));
  const klammer = lauf(t, 6, 7.4), unten = lauf(t, 7.4, 8.8), gl = lauf(t, 9, 9.9);
  const paare = [0, 1, 2, 3].map((i) => <path key={i} d={`M${X0 + i * 60 + 4} 112 v8 h${52} v-8`} stroke={C.gold} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity={klammer} />);
  /* Teil 2: Addieren */
  const o2 = lauf(t, 11.4, 12.4);
  const teilen = lauf(t, 17.2, 18.4), tags = fen(t, 17.6, 22.2), neu = lauf(t, 18.2, 19.2);
  const lineA = [40, 80, 160, 200].map((dx) => <line key={dx} x1={X0 + dx} x2={X0 + dx} y1="60" y2="94" stroke={C.weiss} strokeWidth="2.6" opacity={teilen} />);
  const lineB = [40, 120, 200].map((dx) => <line key={dx} x1={X0 + dx} x2={X0 + dx} y1="120" y2="154" stroke={C.weiss} strokeWidth="2.6" opacity={teilen} />);
  const c6 = lauf(t, 22.6, 23.8);
  return (
    <g>
      {/* Teil 1 */}
      <g opacity={o1}>
        <Br x={34} y={82} z={6} n={8} />
        {strip(8, 30, 66, 34, C.see, 6, 1)}
        {paare}
        <g opacity={unten}>
          <Br x={34} y={160} z={3} n={4} />
          {strip(4, 60, 144, 34, C.see, 3, 1)}
        </g>
        <T x="180" y="210" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.grau} opacity={fen(t, 8.2, 10.4)}>Zähler und Nenner durch 2 teilen</T>
        <g opacity={gl}>
          <Br x={116} y={262} z={6} n={8} g={17} />
          <T x="158" y="262" textAnchor="middle" fontSize="20" fontWeight="800" fill={C.tinte}>=</T>
          <Br x={200} y={262} z={3} n={4} g={17} fill={C.smaragd} />
        </g>
      </g>
      {/* Teil 2 */}
      <g opacity={o2}>
        <Br x={34} y={82} z={1} n={2} o={1 - neu} />
        <Br x={34} y={82} z={3} n={6} o={neu} />
        {strip(2, 120, 60, 34, C.see, 1, 1)}
        {lineA}
        <Br x={34} y={142} z={1} n={3} o={1 - neu} />
        <Br x={34} y={142} z={2} n={6} o={neu} />
        {strip(3, 80, 120, 34, C.flaggold, 1, 1)}
        {lineB}
        <g opacity={tags}>
          <rect x="306" y="66" width="40" height="24" rx="12" fill={C.see} />
          <T x="326" y="83" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.weiss}>· 3</T>
          <rect x="306" y="126" width="40" height="24" rx="12" fill={C.gold} />
          <T x="326" y="143" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.weiss}>· 2</T>
        </g>
        <T x="180" y="184" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.grau} opacity={fen(t, 17, 22.4)}>Hauptnenner: kleinstes gemeinsames Vielfaches von 2 und 3</T>
        <g opacity={c6}>
          <Br x={34} y={228} z={5} n={6} fill={C.smaragd} />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={X0 + i * 40 + 1} y="206" width="38" height="34" rx="5" fill={i < 3 ? C.see : i < 5 ? C.flaggold : C.weiss} stroke={i < 5 ? (i < 3 ? C.see : C.flaggold) : C.hellgrau} strokeWidth="1.6" />)}
        </g>
        <g opacity={lauf(t, 25.4, 26.8)}>
          <Br x={36} y={292} z={1} n={2} />
          <T x="64" y="292" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.grau}>+</T>
          <Br x={92} y={292} z={1} n={3} />
          <T x="120" y="292" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.grau}>=</T>
          <Br x={148} y={292} z={3} n={6} />
          <T x="176" y="292" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.grau}>+</T>
          <Br x={204} y={292} z={2} n={6} />
          <T x="232" y="292" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.grau}>=</T>
          <Br x={262} y={292} z={5} n={6} fill={C.smaragd} />
        </g>
      </g>
    </g>
  );
}

/* ---------- Auswahl ---------- */
export const KOPF_VIDEO = {
  plusminus: { titel: "Schriftlich Plus und Minus", unter: "Spalte für Spalte, mit Übertrag und Probe", dauer: 25.5, hoehe: 340, schritte: PM_SCHRITTE, zeichne: pmZeichne,
    beschreibung: "Animation: 478 plus 256 wird Spalte für Spalte von rechts nach links addiert, mit zwei Überträgen. Das Ergebnis 734 wird mit der Subtraktion 734 minus 256 geprüft." },
  multiplizieren: { titel: "Multiplizieren am Flächenmodell", unter: "23 · 14 in vier Teilflächen zerlegt", dauer: 26.5, hoehe: 296, schritte: ML_SCHRITTE, zeichne: mlZeichne,
    beschreibung: "Animation: Ein Rechteck mit den Seiten 23 und 14 wird in vier Teilflächen zerlegt. Die Teilprodukte 200, 30, 80 und 12 ergeben zusammen 322." },
  primzahlen: { titel: "Das Sieb der Primzahlen", unter: "Alle Primzahlen bis 49 durch Streichen finden", dauer: 25, hoehe: 340, schritte: PZ_SCHRITTE, zeichne: siebZeichne,
    beschreibung: "Animation: In einer Tabelle von 1 bis 49 werden die 1 und alle Vielfachen von 2, 3, 5 und 7 gestrichen. Übrig bleiben die 15 Primzahlen." },
  primfaktoren: { titel: "Der Faktorbaum", unter: "84 in Primfaktoren zerlegen", dauer: 25.5, hoehe: 374, schritte: PF_SCHRITTE, zeichne: baumZeichne,
    beschreibung: "Animation: Ein Faktorbaum zerlegt 84 in 2 mal 42, dann 42 in 2 mal 21 und 21 in 3 mal 7. Die Primzahlen sind goldene Kreise. Ergebnis: 2 mal 2 mal 3 mal 7." },
  potenzen: { titel: "Quadrat, Wurzel und Kubik", unter: "Fläche, Seitenlänge und Würfelschichten", dauer: 28, hoehe: 304, schritte: PO_SCHRITTE, zeichne: poZeichne,
    beschreibung: "Animation: Ein Quadrat mit Seite 6 hat 36 Kästchen und wächst mit einem Winkel aus 13 Kästchen auf 49. Die Wurzel aus 49 ist die Seite 7. Drei Schichten mit je 9 Würfeln ergeben 27." },
  division: { titel: "Schriftlich teilen", unter: "756 : 4 – wie oft passt, mal nehmen, abziehen, herunterholen", dauer: 26.5, hoehe: 336, schritte: DV_SCHRITTE, zeichne: dvZeichne,
    beschreibung: "Animation: 756 wird schriftlich durch 4 geteilt. Ziffer für Ziffer entstehen die Ergebnisziffern 1, 8 und 9, der Rest ist 0." },
  bruchrechnen: { titel: "Brüche kürzen und addieren", unter: "Bruchstreifen zeigen, warum es funktioniert", dauer: 28, hoehe: 316, schritte: BR_SCHRITTE, zeichne: brZeichne,
    beschreibung: "Animation: Der Bruch 6 Achtel wird am Bruchstreifen zu 3 Viertel gekürzt. Dann werden 1 Halb und 1 Drittel auf den Hauptnenner 6 erweitert und zu 5 Sechsteln addiert." },
};

export function KopfVideo({ id }) {
  const s = KOPF_VIDEO[id];
  if (!s) return null;
  return <Player key={id} szene={{ dauer: s.dauer, hoehe: s.hoehe, schritte: s.schritte, zeichne: s.zeichne, beschreibung: s.beschreibung }} />;
}
