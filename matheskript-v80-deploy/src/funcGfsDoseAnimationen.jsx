/* ======================================================================
   GFS · Die optimale Dose – sechs Erkläranimationen („Motion-Videos“)
   Gleicher Player wie alle Erkläranimationen (funcErklaeranimation.jsx).
     abwickeln     – Dose → Netz: zwei Kreise und ein Rechteck, O = 2πr² + 2πrh
     formen        – gleicher Inhalt, verschiedene Form: wie viel Blech braucht jede?
     nebenbedingung– V bleibt fest: wächst r, schrumpft h – h = V/(πr²)
     graph         – O(r) = 2πr² + 2V/r als Summe aus Parabel und Hyperbel, Tiefpunkt, Ränder
     fuenf         – die Fünf-Schritte-Strategie als Kette
     echt          – echte Dose gegen optimale Dose: nur wenig mehr Blech
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React from "react";
import { C } from "./base1.jsx";
import { lauf } from "./funcErklaeranimation.jsx";
import { AnimKarte } from "./funcAnimKarte.jsx";
import { optimaleDose, oberflaeche, hoeheAus, dk } from "./gfsDose.js";

const T = (props) => <text fontFamily="inherit" {...props} />;
const fenster = (t, a, b, c, d) => lauf(t, a, b) * (1 - lauf(t, c, d));
const mix = (a, b, p) => a + (b - a) * p;
const V0 = 330;
const OPT = optimaleDose(V0);

/* Dose: Mittelpunkt des Bodens (cx, cy), Radius r, Höhe h (Bildmaße); Ellipsen zeigen die Perspektive */
function Dose({ cx, cy, r, h, o = 1, fuell = 0, farbe = C.see, hell = C.himmel, gold = false, strich }) {
  if (o <= 0.001 || r <= 0 || h <= 0) return null;
  const e = Math.max(3, r * 0.32);
  const f1 = gold ? "#FFE58A" : hell, f2 = gold ? C.flaggold : farbe;
  return (
    <g opacity={o}>
      <ellipse cx={cx} cy={cy} rx={r} ry={e} fill={f2} stroke={f2} strokeWidth="1.2" />
      <rect x={cx - r} y={cy - h} width={2 * r} height={h} fill={f1} stroke={f2} strokeWidth="1.3" strokeDasharray={strich} />
      {fuell > 0 && <rect x={cx - r + 1.5} y={cy - h * fuell} width={2 * r - 3} height={h * fuell} fill={f2} opacity="0.35" />}
      <line x1={cx - r} y1={cy} x2={cx - r} y2={cy - h} stroke={f2} strokeWidth="1.3" />
      <line x1={cx + r} y1={cy} x2={cx + r} y2={cy - h} stroke={f2} strokeWidth="1.3" />
      <ellipse cx={cx} cy={cy - h} rx={r} ry={e} fill={gold ? "#FFF3C4" : C.weiss} stroke={f2} strokeWidth="1.3" />
    </g>
  );
}
function Pille({ x = 180, y, text, o = 1, farbe = C.see, breite }) {
  if (o <= 0.001) return null;
  const w = breite || Math.max(70, String(text).length * 7.2 + 24);
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - 17} width={w} height={26} rx="13" fill={C.weiss} stroke={farbe} strokeWidth="1.4" />
      <T x={x} y={y + 1} textAnchor="middle" fontSize="13" fontWeight="800" fill={farbe}>{text}</T>
    </g>
  );
}
function Mass({ x1, y1, x2, y2, text, o = 1, farbe = C.gold, dx = 0, dy = -6 }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={farbe} strokeWidth="1.6" />
      <circle cx={x1} cy={y1} r="2.2" fill={farbe} /><circle cx={x2} cy={y2} r="2.2" fill={farbe} />
      <T x={(x1 + x2) / 2 + dx} y={(y1 + y2) / 2 + dy} textAnchor="middle" fontSize="13" fontWeight="800" fill={farbe}>{text}</T>
    </g>
  );
}

/* ======================================================================
   1 · Abwickeln
   ====================================================================== */
const A_DAUER = 21;
const aSchritte = () => [
  { von: 0, text: "Eine Dose ist ein Zylinder. Ihr Blech besteht aus drei Teilen: Boden, Deckel und Mantel. Wie viel Blech das ist, sieht man erst, wenn man die Dose auseinandernimmt." },
  { von: 4.5, text: "Boden und Deckel sind zwei Kreise mit dem Radius r. Jeder hat die Fläche πr² – zusammen 2πr²." },
  { von: 9, text: "Der Mantel wird aufgeschnitten und ausgerollt: ein Rechteck. Seine Höhe ist h, seine Breite ist der Umfang des Kreises, 2πr. Fläche des Mantels: 2πr · h." },
  { von: 14.5, text: "Zusammen: O = 2πr² + 2πrh. Das ist die Zielgröße – sie soll so klein wie möglich werden. Aber sie hängt von zwei Variablen ab, r und h. Dafür brauchen wir die Nebenbedingung." },
];
function aZeichne(t) {
  const r = 34, h = 86, cx = 72, cy = 196;
  const stehen = lauf(t, 0, 1.2);
  const kreise = lauf(t, 4.8, 7);
  const rollen = lauf(t, 9.4, 13);
  const formel = lauf(t, 14.8, 16.2);
  const warn = lauf(t, 17.5, 19);
  const kx = 190, ky = 70;
  const mx = 170, my = 212, mb = 2 * Math.PI * r * 0.62, mh = 72;   // Rechteck (Breite gestaucht, damit es ins Bild passt)
  return (
    <g>
      <Dose cx={cx} cy={cy} r={r} h={h} o={stehen} />
      <Mass x1={cx - r} y1={cy + 22} x2={cx + r} y2={cy + 22} text="2r" o={stehen * (1 - kreise)} dy={16} />
      <Mass x1={cx + r + 10} y1={cy} x2={cx + r + 10} y2={cy - h} text="h" o={stehen} dx={12} dy={4} />
      {/* Boden und Deckel schweben nach rechts oben */}
      {kreise > 0.001 && (
        <g>
          <circle cx={mix(cx, kx, kreise)} cy={mix(cy - h, ky, kreise)} r={r * mix(0.4, 1, kreise)} fill={C.himmel} stroke={C.see} strokeWidth="1.4" />
          <circle cx={mix(cx, kx + 90, kreise)} cy={mix(cy, ky, kreise)} r={r * mix(0.4, 1, kreise)} fill={C.himmel} stroke={C.see} strokeWidth="1.4" />
          <T x={kx} y={ky + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={C.seeTief} opacity={lauf(t, 6.6, 7.4)}>πr²</T>
          <T x={kx + 90} y={ky + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={C.seeTief} opacity={lauf(t, 6.6, 7.4)}>πr²</T>
          <T x={kx + 45} y={ky + 54} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.see} opacity={lauf(t, 7.4, 8.2)}>Boden + Deckel = 2πr²</T>
        </g>
      )}
      {/* Mantel rollt aus */}
      {rollen > 0.001 && (
        <g>
          <rect x={mx} y={my - mh} width={mb * rollen} height={mh} fill={C.flaggold} stroke={C.gold} strokeWidth="1.4" rx="2" opacity="0.9" />
          <Mass x1={mx} y1={my + 18} x2={mx + mb} y2={my + 18} text="2πr" o={lauf(t, 12.4, 13.4)} dy={16} />
          <Mass x1={mx + mb + 10} y1={my} x2={mx + mb + 10} y2={my - mh} text="h" o={lauf(t, 12.4, 13.4)} dx={12} dy={4} />
          <T x={mx + mb / 2} y={my - mh / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={C.seeTief} opacity={lauf(t, 13, 13.8)}>2πr · h</T>
        </g>
      )}
      <T x="180" y="268" textAnchor="middle" fontSize="19" fontWeight="800" fill={C.tinte} opacity={formel}>
        O = <tspan fill={C.see}>2πr²</tspan> + <tspan fill={C.gold}>2πrh</tspan>
      </T>
      <Pille x={180} y={294} text="zwei Variablen: r und h → Nebenbedingung" o={warn} farbe={C.signal} breite={290} />
    </g>
  );
}

/* ======================================================================
   2 · Gleicher Inhalt, verschiedene Form
   ====================================================================== */
const F_DAUER = 22;
const RADIEN = [1.6, 2.5, OPT.r, 5.4, 8];
const fSchritte = () => [
  { von: 0, text: "Fünf Dosen, alle mit demselben Inhalt von 330 ml. Von links nach rechts wird der Radius größer – und damit die Höhe kleiner, denn der Inhalt bleibt gleich." },
  { von: 7, text: "Für jede Dose rechnen wir das Blech aus: O = 2πr² + 2πrh. Die Balken zeigen die Oberfläche in cm²." },
  { von: 14, text: "Die schlanke Dose verschwendet Blech am Mantel, die flache am Boden und Deckel. Die mittlere braucht am wenigsten – und bei ihr ist die Höhe genau doppelt so groß wie der Radius." },
];
function fZeichne(t) {
  const S = 3.4, cy = 150;   // Bildmaßstab: 1 cm = 3,4 Bildpunkte
  const xs = [38, 92, 166, 252, 330];
  const O = RADIEN.map((r) => oberflaeche(r, V0));
  const oMax = Math.max(...O);
  return (
    <g>
      {RADIEN.map((r, i) => {
        const h = hoeheAus(r, V0);
        const o = lauf(t, 0.4 + i * 1.1, 1.4 + i * 1.1);
        const bal = lauf(t, 7.4 + i * 0.8, 8.4 + i * 0.8);
        const best = i === 2;
        const bh = (O[i] / oMax) * 70 * bal;
        return (
          <g key={i}>
            <Dose cx={xs[i]} cy={cy} r={r * S} h={h * S} o={o} gold={best && t > 14.3} fuell={0.7} />
            <T x={xs[i]} y={cy + 24} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.grau} opacity={o}>r = {dk(r, 1)}</T>
            {bal > 0.001 && (
              <g>
                <rect x={xs[i] - 13} y={262 - bh} width="26" height={bh} rx="3" fill={best ? C.flaggold : C.see} opacity="0.9" />
                <T x={xs[i]} y={262 - bh - 5} textAnchor="middle" fontSize="11.5" fontWeight="800" fill={best ? C.gold : C.seeTief} opacity={bal}>{Math.round(O[i])}</T>
              </g>
            )}
          </g>
        );
      })}
      <line x1="16" y1="262" x2="344" y2="262" stroke={C.linie} strokeWidth="1" opacity={lauf(t, 7, 8)} />
      <T x="180" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.see} opacity={lauf(t, 0.2, 1)}>V = 330 cm³ für alle fünf</T>
      <Pille x={180} y={290} text="Minimum: h = 2r" o={lauf(t, 15, 16.2)} farbe={C.gold} breite={150} />
    </g>
  );
}

/* ======================================================================
   3 · Die Nebenbedingung
   ====================================================================== */
const N_DAUER = 20;
const nSchritte = () => [
  { von: 0, text: "Das Volumen ist vorgegeben: V = πr²h = 330 cm³. Der Inhalt darf sich nicht ändern – egal, welche Form die Dose hat." },
  { von: 5, text: "Wird der Radius größer, muss die Höhe kleiner werden, sonst passt mehr hinein. Wird der Radius kleiner, muss die Dose höher werden. r und h hängen zusammen." },
  { von: 11, text: "Die Nebenbedingung nach h aufgelöst: h = V/(πr²). Damit ist h kein freier Wert mehr – jede Wahl von r legt h fest." },
  { von: 15.5, text: "Genau das setzen wir in O ein. Danach hängt die Oberfläche nur noch von r ab, und wir können ableiten." },
];
function nZeichne(t) {
  const S = 6, cy = 180, cx = 100;
  const p = t < 5 ? 0 : t < 11 ? 0.5 - 0.5 * Math.cos(((t - 5) / 6) * Math.PI * 2) : 0.5 - 0.5 * Math.cos(((11 - 5) / 6) * Math.PI * 2);
  const r = mix(2.2, 6.5, t < 5 ? 0.33 : p);
  const h = hoeheAus(r, V0);
  const formel = lauf(t, 11.4, 12.8);
  const ein = lauf(t, 15.8, 17.2);
  return (
    <g>
      <Dose cx={cx} cy={cy} r={r * S} h={h * S} fuell={0.72} />
      <Mass x1={cx - r * S} y1={cy + 22} x2={cx + r * S} y2={cy + 22} text={`r = ${dk(r, 1)}`} dy={16} />
      <Mass x1={cx + r * S + 12} y1={cy} x2={cx + r * S + 12} y2={cy - h * S} text={`h = ${dk(h, 1)}`} dx={30} dy={4} />
      <T x="250" y="60" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.seeTief} opacity={lauf(t, 0.3, 1.2)}>V = πr²h = 330</T>
      <T x="250" y="84" textAnchor="middle" fontSize="12.5" fontWeight="600" fill={C.grau} opacity={lauf(t, 0.3, 1.2)}>bleibt immer gleich</T>
      <T x="250" y="128" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.see} opacity={fenster(t, 5.5, 6.5, 11, 12)}>{p > 0.5 ? "r wächst → h schrumpft" : "r schrumpft → h wächst"}</T>
      <g opacity={formel}>
        <rect x="186" y="150" width="130" height="48" rx="12" fill={C.weiss} stroke={C.gold} strokeWidth="1.6" />
        <T x="251" y="169" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.gold}>NEBENBEDINGUNG</T>
        <T x="251" y="190" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.tinte}>h = 330 / (πr²)</T>
      </g>
      <T x="251" y="236" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.tinte} opacity={ein}>
        O(r) = 2πr² + 2πr · <tspan fill={C.gold}>330/(πr²)</tspan>
      </T>
      <T x="251" y="260" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.seeTief} opacity={lauf(t, 17.4, 18.6)}>= 2πr² + 660/r</T>
    </g>
  );
}

/* ======================================================================
   4 · Der Graph der Zielfunktion
   ====================================================================== */
const G_DAUER = 26;
const gSchritte = () => [
  { von: 0, text: "Die Zielfunktion O(r) = 2πr² + 660/r besteht aus zwei Teilen. Der erste, 2πr², ist eine Parabel: Boden und Deckel werden mit wachsendem Radius schnell teurer." },
  { von: 5.5, text: "Der zweite Teil, 660/r, ist eine Hyperbel: der Mantel. Für kleine Radien wird er riesig – eine schlanke Dose hat einen langen Mantel." },
  { von: 11, text: "Die Summe beider Kurven ist die Oberfläche. Sie fällt zuerst (der Mantel schrumpft), steigt dann wieder (Boden und Deckel wachsen) – dazwischen liegt ein Tiefpunkt." },
  { von: 17, text: "Am Tiefpunkt ist die Tangente waagerecht: O′(r) = 0. Das liefert r ≈ 3,74 cm und O ≈ 264 cm²." },
  { von: 21.5, text: "An beiden Rändern von D = (0; ∞) geht O gegen unendlich. Deshalb ist der Tiefpunkt nicht nur ein lokales, sondern das globale Minimum." },
];
const GX0 = 46, GY0 = 236, GW = 290, GH = 190, RMAX = 10, OMAX = 700;
const gx = (r) => GX0 + (r / RMAX) * GW;
const gy = (o) => GY0 - Math.min(OMAX, o) / OMAX * GH;
function kurve(f, bis, farbe, b = 2.2, strich) {
  const pts = [];
  for (let r = 0.9; r <= RMAX * bis + 1e-9; r += 0.08) pts.push(`${gx(r).toFixed(1)},${gy(f(r)).toFixed(1)}`);
  if (pts.length < 2) return null;
  return <polyline points={pts.join(" ")} fill="none" stroke={farbe} strokeWidth={b} strokeLinecap="round" strokeDasharray={strich} />;
}
function gZeichne(t) {
  const p1 = lauf(t, 0.6, 4);
  const p2 = lauf(t, 6, 9.5);
  const p3 = lauf(t, 11.4, 15.5);
  const tief = lauf(t, 17.4, 18.6);
  const rand = lauf(t, 21.8, 23.5);
  const r1 = OPT.r;
  return (
    <g>
      <line x1={GX0} y1={GY0} x2={GX0 + GW + 8} y2={GY0} stroke={C.tinte} strokeWidth="1.3" />
      <line x1={GX0} y1={GY0} x2={GX0} y2={GY0 - GH - 10} stroke={C.tinte} strokeWidth="1.3" />
      <T x={GX0 + GW + 10} y={GY0 + 14} textAnchor="end" fontSize="11.5" fontWeight="700" fill={C.grau}>r in cm</T>
      <T x={GX0 - 6} y={GY0 - GH - 14} textAnchor="start" fontSize="11.5" fontWeight="700" fill={C.grau}>O in cm²</T>
      {[2, 4, 6, 8, 10].map((r) => <T key={r} x={gx(r)} y={GY0 + 14} textAnchor="middle" fontSize="10.5" fill={C.grau}>{r}</T>)}
      {[200, 400, 600].map((o) => <T key={o} x={GX0 - 5} y={gy(o) + 4} textAnchor="end" fontSize="10.5" fill={C.grau}>{o}</T>)}
      {kurve((r) => 2 * Math.PI * r * r, p1, C.see, 2, "5 4")}
      <T x={gx(8.6)} y={gy(2 * Math.PI * 8.6 * 8.6) + 18} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.see} opacity={lauf(t, 3, 4)}>2πr²</T>
      {kurve((r) => 660 / r, p2, C.gold, 2, "5 4")}
      <T x={gx(1.6)} y={gy(660 / 1.6) - 8} textAnchor="start" fontSize="12.5" fontWeight="800" fill={C.gold} opacity={lauf(t, 8.5, 9.5)}>660/r</T>
      {kurve((r) => oberflaeche(r, V0), p3, C.tinte, 3)}
      <T x={gx(6.3)} y={gy(oberflaeche(6.3, V0)) - 12} textAnchor="middle" fontSize="13" fontWeight="800" fill={C.tinte} opacity={lauf(t, 14.5, 15.5)}>O(r)</T>
      {tief > 0.001 && (
        <g opacity={tief}>
          <line x1={gx(r1) - 46} y1={gy(OPT.O)} x2={gx(r1) + 46} y2={gy(OPT.O)} stroke={C.signal} strokeWidth="2" />
          <circle cx={gx(r1)} cy={gy(OPT.O)} r="5" fill={C.flaggold} stroke={C.gold} strokeWidth="1.5" />
          <line x1={gx(r1)} y1={gy(OPT.O)} x2={gx(r1)} y2={GY0} stroke={C.gold} strokeWidth="1" strokeDasharray="3 3" />
          <T x={gx(r1)} y={GY0 - 6} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.gold}>3,74</T>
          <T x={gx(r1) + 54} y={gy(OPT.O) + 4} textAnchor="start" fontSize="12" fontWeight="800" fill={C.signal}>O′ = 0</T>
          <T x={gx(r1) + 54} y={gy(OPT.O) + 20} textAnchor="start" fontSize="11.5" fontWeight="700" fill={C.tinte}>O ≈ 264</T>
        </g>
      )}
      {rand > 0.001 && (
        <g opacity={rand}>
          <T x={gx(1.1)} y={gy(OMAX) - 6} fontSize="16" fontWeight="800" fill={C.signal}>↑ ∞</T>
          <T x={gx(9.3)} y={gy(OMAX) - 6} fontSize="16" fontWeight="800" fill={C.signal}>↑ ∞</T>
          <Pille x={200} y={gy(OMAX) + 36} text="beide Ränder → ∞: globales Minimum" o={rand} farbe={C.signal} breite={272} />
        </g>
      )}
    </g>
  );
}

/* ======================================================================
   5 · Die fünf Schritte
   ====================================================================== */
const S_DAUER = 23;
const SCHRITTE5 = [
  ["1 · Zielgröße", "O = 2πr² + 2πrh", "Was soll minimal werden?"],
  ["2 · Nebenbedingung", "V = πr²h = 330", "Was liegt fest?"],
  ["3 · Zielfunktion", "O(r) = 2πr² + 660/r, D = (0; ∞)", "nur noch eine Variable"],
  ["4 · Extremwert + Ränder", "O′(r) = 0 → r₁ ≈ 3,74; O″ > 0; Ränder → ∞", "→ globales Minimum"],
  ["5 · Antwortsatz", "r ≈ 3,74 cm, h ≈ 7,49 cm, O ≈ 264,36 cm²", "mit Einheiten"],
];
const sSchritte = () => [
  { von: 0, text: "Jedes Extremwertproblem mit Nebenbedingung läuft nach derselben Strategie – fünf Schritte, immer in dieser Reihenfolge." },
  { von: 4, text: "Erst die Zielgröße: der Term für das, was minimal oder maximal werden soll. Dann die Nebenbedingung: die Gleichung, die festliegt." },
  { von: 9, text: "Nebenbedingung einsetzen – aus zwei Variablen wird eine. Jetzt heißt es Zielfunktion, und sie bekommt eine Definitionsmenge." },
  { von: 14, text: "Schritt 4 ist Kurvendiskussion: Ableitung null setzen, zweite Ableitung prüfen – und nie die Ränder vergessen." },
  { von: 19, text: "Zum Schluss der Antwortsatz mit Einheiten. Wer diese fünf Schritte beherrscht, löst Dose, Zaun, Karton und Zelt mit demselben Werkzeug." },
];
function sZeichne(t) {
  const zeit = [0.4, 4.4, 9.4, 14.4, 19.4];
  return (
    <g>
      {SCHRITTE5.map(([kopf, formel, unter], i) => {
        const o = lauf(t, zeit[i], zeit[i] + 1);
        const y = 14 + i * 56;
        const aktiv = t >= zeit[i] && (i === 4 || t < zeit[i + 1]);
        return (
          <g key={kopf} opacity={o} transform={`translate(0 ${(1 - o) * 8})`}>
            <rect x="18" y={y} width="324" height="46" rx="12" fill={aktiv ? C.seeTief : C.weiss} stroke={aktiv ? C.seeTief : C.linie} strokeWidth="1.3" />
            <T x="30" y={y + 18} fontSize="11.5" fontWeight="800" fill={aktiv ? C.flaggold : C.see}>{kopf}</T>
            <T x="30" y={y + 36} fontSize="12.5" fontWeight="700" fill={aktiv ? C.weiss : C.tinte}>{formel}</T>
            <T x="332" y={y + 18} textAnchor="end" fontSize="10.5" fontWeight="600" fill={aktiv ? "#C9D6EE" : C.grau}>{unter}</T>
            {i < 4 && <T x="180" y={y + 54} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.gold} opacity={lauf(t, zeit[i + 1] - 0.3, zeit[i + 1] + 0.4)}>▼</T>}
          </g>
        );
      })}
    </g>
  );
}

/* ======================================================================
   6 · Echte Dose gegen optimale Dose
   ====================================================================== */
const E_DAUER = 20;
const REAL_R = 3.3, REAL_H = hoeheAus(REAL_R, V0), REAL_O = oberflaeche(REAL_R, V0);
const eSchritte = () => [
  { von: 0, text: "Links die optimale Dose für 330 ml: Radius 3,74 cm, Höhe 7,49 cm – so hoch wie breit. Rechts eine handelsübliche Dose mit Radius 3,3 cm: deutlich schlanker." },
  { von: 6, text: "Wie viel Blech braucht jede? Optimal: 264 cm². Die schlanke: etwa 268 cm². Der Unterschied ist winzig – nur rund 1,5 Prozent." },
  { von: 12, text: "Der Grund steckt im Graphen: Nahe am Minimum ist die Kurve sehr flach. Kleine Abweichungen vom Optimum kosten fast nichts – und dafür liegt die Dose besser in der Hand und passt in jeden Automaten." },
];
function eZeichne(t) {
  const S = 9, cy = 150;
  const o1 = lauf(t, 0.3, 1.3), o2 = lauf(t, 1.8, 2.8);
  const bal = lauf(t, 6.4, 8);
  const proz = lauf(t, 9, 10);
  const fl = lauf(t, 12.4, 14);
  const bh = (o) => (o / 300) * 70;
  return (
    <g>
      <Dose cx={92} cy={cy} r={OPT.r * S} h={OPT.h * S} o={o1} gold fuell={0.7} />
      <T x="92" y={cy + 26} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.gold} opacity={o1}>optimal · h = 2r</T>
      <T x="92" y={cy + 42} textAnchor="middle" fontSize="11" fontWeight="600" fill={C.grau} opacity={o1}>r = 3,74 · h = 7,49</T>
      <Dose cx={240} cy={cy} r={REAL_R * S} h={REAL_H * S} o={o2} fuell={0.7} />
      <T x="240" y={cy + 26} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.see} opacity={o2}>handelsüblich</T>
      <T x="240" y={cy + 42} textAnchor="middle" fontSize="11" fontWeight="600" fill={C.grau} opacity={o2}>r = 3,3 · h = {dk(REAL_H, 2)}</T>
      {bal > 0.001 && (
        <g opacity={bal}>
          <rect x="300" y={262 - bh(OPT.O) * bal} width="18" height={bh(OPT.O) * bal} rx="3" fill={C.flaggold} />
          <rect x="324" y={262 - bh(REAL_O) * bal} width="18" height={bh(REAL_O) * bal} rx="3" fill={C.see} />
          <T x="309" y={262 - bh(OPT.O) - 5} textAnchor="middle" fontSize="10.5" fontWeight="800" fill={C.gold}>{Math.round(OPT.O)}</T>
          <T x="333" y={262 - bh(REAL_O) - 5} textAnchor="middle" fontSize="10.5" fontWeight="800" fill={C.seeTief}>{Math.round(REAL_O)}</T>
          <T x="321" y="276" textAnchor="middle" fontSize="10" fontWeight="600" fill={C.grau}>O in cm²</T>
        </g>
      )}
      <Pille x={166} y={250} text={`nur ${dk((REAL_O / OPT.O - 1) * 100, 1)} % mehr Blech`} o={proz} farbe={C.signal} breite={190} />
      {fl > 0.001 && (
        <g opacity={fl}>
          <polyline points={Array.from({ length: 30 }, (_, i) => { const r = 2.8 + i * 0.06; return `${20 + i * 5},${296 - (oberflaeche(r, V0) - 262) * 1.6}`; }).join(" ")} fill="none" stroke={C.tinte} strokeWidth="2" />
          <circle cx={20 + ((OPT.r - 2.8) / 0.06) * 5} cy={296 - (OPT.O - 262) * 1.6} r="3.5" fill={C.flaggold} stroke={C.gold} />
          <circle cx={20 + ((REAL_R - 2.8) / 0.06) * 5} cy={296 - (REAL_O - 262) * 1.6} r="3.5" fill={C.see} />
          <T x="180" y="312" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={C.tinte}>nahe am Minimum ist O(r) sehr flach</T>
        </g>
      )}
    </g>
  );
}

export const DOSE_ANIM = {
  abwickeln: { titel: () => "Wo steckt das Blech? Die Dose auseinandernehmen", unter: () => "Zwei Kreise und ein Rechteck: O = 2πr² + 2πrh",
    szene: () => ({ dauer: A_DAUER, hoehe: 308, schritte: aSchritte(), zeichne: aZeichne,
      beschreibung: "Animation: Boden und Deckel einer Dose lösen sich als Kreise mit Fläche πr², der Mantel rollt zu einem Rechteck 2πr mal h aus. Zusammen O = 2πr² + 2πrh." }) },
  formen: { titel: () => "Gleicher Inhalt, verschiedene Form", unter: () => "Fünf Dosen mit 330 ml – welche braucht am wenigsten Blech?",
    szene: () => ({ dauer: F_DAUER, hoehe: 300, schritte: fSchritte(), zeichne: fZeichne,
      beschreibung: "Animation: Fünf Dosen mit gleichem Volumen von schlank bis flach, darunter Balken mit ihrer Oberfläche. Die mittlere Dose mit h = 2r hat die kleinste Oberfläche." }) },
  nebenbedingung: { titel: () => "Die Nebenbedingung: V bleibt fest", unter: () => "Wächst r, schrumpft h – und h = V/(πr²) macht aus zwei Variablen eine",
    szene: () => ({ dauer: N_DAUER, hoehe: 280, schritte: nSchritte(), zeichne: nZeichne,
      beschreibung: "Animation: Eine Dose verändert ihren Radius, das Volumen bleibt 330 cm³, die Höhe passt sich an. Die Nebenbedingung wird nach h aufgelöst und in O eingesetzt: O(r) = 2πr² + 660/r." }) },
  graph: { titel: () => "Parabel plus Hyperbel: der Graph von O(r)", unter: () => "Tiefpunkt bei r ≈ 3,74 – und beide Ränder gehen gegen unendlich",
    szene: () => ({ dauer: G_DAUER, hoehe: 260, schritte: gSchritte(), zeichne: gZeichne,
      beschreibung: "Animation: Die Zielfunktion O(r) = 2πr² + 660/r entsteht als Summe einer Parabel und einer Hyperbel. Am Tiefpunkt ist die Tangente waagerecht; an beiden Rändern von (0; ∞) wächst O über alle Grenzen." }) },
  fuenf: { titel: () => "Die Fünf-Schritte-Strategie", unter: () => "Zielgröße · Nebenbedingung · Zielfunktion · Extremwert und Ränder · Antwortsatz",
    szene: () => ({ dauer: S_DAUER, hoehe: 300, schritte: sSchritte(), zeichne: sZeichne,
      beschreibung: "Animation: Fünf Karten erscheinen nacheinander – Zielgröße, Nebenbedingung, Zielfunktion mit Definitionsmenge, Extremwert mit Randbetrachtung, Antwortsatz." }) },
  echt: { titel: () => "Echte Dose gegen optimale Dose", unter: () => "Nur 1,5 % mehr Blech – warum Marketing die Form bestimmt",
    szene: () => ({ dauer: E_DAUER, hoehe: 322, schritte: eSchritte(), zeichne: eZeichne,
      beschreibung: "Animation: Die optimale 330-ml-Dose neben einer handelsüblichen schlanken Dose. Balken vergleichen die Oberflächen (264 gegen 268 cm²); ein Ausschnitt des Graphen zeigt, wie flach O(r) nahe am Minimum ist." }) },
};

export function DoseAnimation({ art, offen = false }) {
  return <AnimKarte szenen={DOSE_ANIM} art={art} offen={offen} merkmal="data-dose-anim" />;
}
