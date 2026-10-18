/* ============================================================
   KURS DIFFERENTIALRECHNUNG – Werkzeug-Karten
   Eine Karte je Werkzeug im Modul: volle Breite, links Titel, Beschreibung
   („Was bekommst du in der Übung?“) und der Öffnen-Knopf, rechts eine
   erklärende Grafik. Die Grafiken sind reine SVG-Zeichnungen (kein Bild-
   Download); Beschriftungen in den Grafiken bleiben Text.
   Neues Werkzeug im Kurs = Eintrag in KARTEN (Text + Art) und in BILDER.
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";

const I = C.nachtschwarz, B1 = C.babyblau, B2 = C.babyblauTief, BH = C.babyblauHell, G = C.flaggold, S = C.see;
const FONT = "Montserrat, sans-serif";

/* ---------- Texte: was bekommt man in der Übung? ---------- */
export const KARTEN = {
  zoomfilm: { art: "Film", text: "Ein Film zoomt Schritt für Schritt in den Graphen hinein – bis zum 1000-Fachen. Du siehst selbst, wie die Kurve zur Geraden wird und die Tangente auftaucht." },
  geradenBasics: { art: "Entdecken", text: "Mit Reglern verstellst du Steigung m und Achsenabschnitt c und siehst sofort, wie sich die Gerade dreht und verschiebt – die Grundlage für alles Weitere." },
  geraden: { art: "Rechnen und Üben", text: "Du findest die Gleichung y = m · x + c aus einem Punkt und der Steigung – mit Rechenweg und Aufgaben zum Üben." },
  geradenPQ: { art: "Rechnen und Üben", text: "Gerade durch zwei Punkte: erst die Steigung aus Δy und Δx, dann c. Genau die Sekante, die du später für die Ableitung brauchst." },
  diffq: { art: "Entdecken und Üben", text: "Zwei Punkte auf dem Graphen, eine Sekante – und ein h, das du schrumpfen lässt. Du übst die h-Methode und siehst, wie sich die Sekantensteigung einem Wert nähert." },
  grenzwert: { art: "Entdecken", text: "Die Sekante rutscht immer näher an den Berührpunkt, bis sie zur Tangente wird. Schritt für Schritt, mit Regler und Live-Grafik." },
  pascal: { art: "Entdecken", text: "Vom Zahlenmuster zur Potenzregel: Das Pascalsche Dreieck liefert die Faktoren, die beim Ausmultiplizieren von (x + h)ⁿ entstehen." },
  potenzregel: { art: "Beweis und Übung", text: "Warum wird aus xⁿ die Ableitung n · xⁿ⁻¹? Beweis, Bild dazu und Übungsaufgaben." },
  ableitungstrainer: { art: "Trainieren", text: "Du gibst f′, f″ oder f‴ selbst ein, die App prüft sofort und zeigt, wo es hakt. Die Regel, die du üben willst, wählst du frei." },
  graphzuordnung: { art: "Trainieren", text: "Mehrere Graphen stehen zur Wahl, einer davon ist f′. So lernst du, die Steigung eines Graphen zu lesen, ohne zu rechnen." },
  rechenweg: { art: "Trainieren", text: "Du schreibst ganze Rechenwege Zeile für Zeile selbst, die App prüft den Weg – so wie in der Klausur." },
  plotter: { art: "Werkzeug", text: "Graph, Ableitungen und komplette Kurvendiskussion für Polynome: Nullstellen, Extrem- und Wendepunkte – auf Wunsch als PDF." },
  advplotter: { art: "Werkzeug", text: "Beliebige Funktionen eintippen: Die App leitet ab, zeichnet und findet Definitionsbereich, Pole, Asymptoten, Extrema und Wendepunkte." },
  parabeln: { art: "Trainieren", text: "Normalform, Scheitelform und Nullstellen trainieren – mit Zielgraph, Runden zu zehn Aufgaben und Sternen." },
  funktionen: { art: "Entdecken und Üben", text: "Funktionsbegriff, Potenz- und Wurzelfunktionen, Umkehrung und Verkettung – dazu ein eigenes Training zu Definitions- und Wertebereich." },
  terme: { art: "Üben", text: "Vereinfachen, ausklammern, binomische Formeln und Potenzen – das Handwerkszeug, das beim Ableiten ständig gebraucht wird." },
  bruchterme: { art: "Üben", text: "x im Nenner: Definitionsmenge bestimmen, richtig kürzen und Bruchgleichungen ohne Scheinlösung lösen – wichtig für die Quotientenregel." },
  trigonometrie: { art: "Lernweg", text: "Vom Einheitskreis über Bogenmaß und Tangens bis zum Kosinussatz: erst verstehen, dann rechnen – die Basis für die Ableitung von Sinus und Kosinus." },
  sinus: { art: "Trainieren", text: "Du verstellst a, b, c und d, bis der Graph zum Zielgraphen passt, und siehst, was jeder Parameter mit der Welle macht." },
  wachstum: { art: "Entdecken und Üben", text: "Messwerte, Halbwertszeit und Zielwert: exponentielle Modelle verstehen und mit Logarithmen rechnen – der Weg zu eˣ und ln x." },
  optimierung: { art: "Werkstatt", text: "Vom Text zur Zielfunktion: Schachtel, Fläche oder eigener Ansatz – dann ableiten und das Maximum finden." },
  steckbrief: { art: "Üben", text: "Aus Hochpunkt, Wendepunkt und Co. die Funktionsgleichung bauen: Bedingungen aufstellen und das Gleichungssystem lösen." },
  scharen: { art: "Entdecken", text: "Parameter per Regler verändern, besondere Punkte und Ortskurven berechnen." },
  heftSekante: { art: "Arbeitsheft", text: "Baustein 02 zum Mitschreiben: Herleitung von Sekante und Tangente mit Aufgaben." },
  heftRegeln: { art: "Arbeitsheft", text: "Baustein 03 – das Handwerk: die Ableitungsregeln der Reihe nach, mit Aufgaben." },
};

/* ---------- Zeichen-Helfer ---------- */
const pfad = (f, a, b, X, Y, n = 56) => {
  let d = "";
  for (let k = 0; k <= n; k++) {
    const x = a + ((b - a) * k) / n;
    d += `${k ? "L" : "M"}${X(x).toFixed(1)} ${Y(f(x)).toFixed(1)}`;
  }
  return d;
};
const T = ({ x, y, size = 14, w = 700, fill = I, anchor = "start", children, ...r }) => (
  <text x={x} y={y} fontSize={size} fontWeight={w} fill={fill} textAnchor={anchor} fontFamily={FONT} {...r}>{children}</text>
);
const Punkt = ({ x, y, r = 5, fill = G }) => <circle cx={x} cy={y} r={r} fill={fill} stroke={I} strokeWidth="2" />;
const Linie = ({ x1, y1, x2, y2, w = 2.5, c = I, strich, op = 1 }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeLinecap="round" strokeDasharray={strich} opacity={op} />
);
const Achsen = ({ ox, oy, x0 = 12, x1 = 228, y0 = 8, y1 = 142 }) => (
  <g stroke={I} strokeWidth="1.6" strokeLinecap="round" opacity="0.55">
    <line x1={x0} y1={oy} x2={x1} y2={oy} /><line x1={ox} y1={y0} x2={ox} y2={y1} />
  </g>
);

function Rahmen({ children, titel }) {
  return (
    <svg viewBox="0 0 240 150" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label={titel} style={{ display: "block" }}>
      {children}
    </svg>
  );
}

/* ---------- Die Grafiken ---------- */
const BILDER = {
  geradenBasics: () => (
    <>
      <Achsen ox={50} oy={118} />
      <Linie x1={20} y1={103.6} x2={215} y2={28} w={4} />
      <Linie x1={110} y1={68.7} x2={170} y2={68.7} w={2.5} c={S} strich="5 4" />
      <Linie x1={170} y1={68.7} x2={170} y2={45.4} w={2.5} c={S} strich="5 4" />
      <T x={140} y={84} size={14} anchor="middle" fill={S}>Δx</T>
      <T x={182} y={61} size={14} fill={S}>Δy</T>
      <Punkt x={50} y={92} />
      <T x={58} y={110} size={14}>c</T>
      <T x={22} y={30} size={15}>m = Δy / Δx</T>
    </>
  ),
  geraden: () => (
    <>
      <Achsen ox={40} oy={120} />
      <Linie x1={20} y1={118} x2={225} y2={30} w={4} />
      <Punkt x={110} y={79.5} r={6} />
      <T x={118} y={100} size={15}>P</T>
      <Linie x1={110} y1={79.5} x2={160} y2={79.5} c={S} strich="5 4" w={2.2} />
      <Linie x1={160} y1={79.5} x2={160} y2={58} c={S} strich="5 4" w={2.2} />
      <T x={22} y={30} size={15}>y = m · x + c</T>
    </>
  ),
  geradenPQ: () => (
    <>
      <Achsen ox={40} oy={122} />
      <Linie x1={22} y1={118} x2={225} y2={26} w={4} />
      <Linie x1={82} y1={91} x2={168} y2={91} c={S} strich="5 4" w={2.2} />
      <Linie x1={168} y1={91} x2={168} y2={52} c={S} strich="5 4" w={2.2} />
      <Punkt x={82} y={91} r={6} /><Punkt x={168} y={52} r={6} />
      <T x={70} y={111} size={15}>P</T><T x={176} y={46} size={15}>Q</T>
      <T x={125} y={108} size={14} anchor="middle" fill={S}>Δx</T>
      <T x={180} y={76} size={14} fill={S}>Δy</T>
    </>
  ),
  diffq: () => {
    const X = (x) => 120 + x * 38, Y = (y) => 132 - y * 17;
    return (
      <>
        <Achsen ox={120} oy={132} y1={140} />
        <path d={pfad((x) => x * x, -2.7, 2.7, X, Y)} fill="none" stroke={I} strokeWidth="3.5" strokeLinecap="round" />
        <Linie x1={X(-0.1)} y1={Y(0.36 + 2.5 * -0.7)} x2={X(2.4)} y2={Y(0.36 + 2.5 * 1.8)} c={S} w={3} />
        <Linie x1={X(0.6)} y1={Y(0.36)} x2={X(1.9)} y2={Y(0.36)} c={I} strich="4 4" w={2} />
        <Linie x1={X(1.9)} y1={Y(0.36)} x2={X(1.9)} y2={Y(3.61)} c={I} strich="4 4" w={2} />
        <Punkt x={X(0.6)} y={Y(0.36)} r={5.5} /><Punkt x={X(1.9)} y={Y(3.61)} r={5.5} />
        <T x={(X(0.6) + X(1.9)) / 2} y={Y(0.36) + 16} size={14} anchor="middle">h</T>
        <T x={X(1.9) + 8} y={(Y(0.36) + Y(3.61)) / 2 + 5} size={14}>Δy</T>
      </>
    );
  },
  zoomfilm: () => {
    const X = (x) => 20 + x * 70, Y = (y) => 120 - y * 18, f = (x) => 0.8 + 2.6 * Math.sin(x * 1.05);
    return (
      <>
        <path d={pfad(f, 0, 3, X, Y)} fill="none" stroke={I} strokeWidth="3.5" strokeLinecap="round" />
        <Linie x1={110} y1={86} x2={132} y2={108} w={7} />
        <circle cx={90} cy={65} r={27} fill="#fff" fillOpacity="0.85" stroke={I} strokeWidth="3.5" />
        <Linie x1={72} y1={71.3} x2={108} y2={58.7} c={S} w={3.5} />
        <Punkt x={90} y={65} r={5} />
        <rect x={150} y={18} width={78} height={30} rx={15} fill={I} />
        <T x={189} y={39} size={16} fill={B1} anchor="middle" w={800}>1000×</T>
      </>
    );
  },
  grenzwert: () => {
    const X = (x) => 120 + x * 38, Y = (y) => 132 - y * 17, p = 1.0;
    const sek = (q, op) => {
      const m = p + q; /* Sekantensteigung der Parabel zwischen p und q: p + q */
      const y = (x) => p * p + m * (x - p);
      return <Linie key={q} x1={X(-0.3)} y1={Y(y(-0.3))} x2={X(2.7)} y2={Y(y(2.7))} c={B2} w={2.5} op={op} />;
    };
    return (
      <>
        <Achsen ox={120} oy={132} y1={140} />
        <path d={pfad((x) => x * x, -2.7, 2.7, X, Y)} fill="none" stroke={I} strokeWidth="3.5" strokeLinecap="round" />
        {sek(2.2, 0.35)}{sek(1.5, 0.5)}{sek(0.9, 0.7)}
        <Linie x1={X(-0.3)} y1={Y(p * p + 2 * p * -1.3)} x2={X(2.6)} y2={Y(p * p + 2 * p * 1.6)} c={S} w={4} />
        <Punkt x={X(p)} y={Y(p * p)} r={6} />
        <T x={X(p) - 6} y={Y(p * p) + 20} size={14} anchor="end">P</T>
        <T x={196} y={40} size={14} fill={S} anchor="end">Tangente</T>
      </>
    );
  },
  pascal: () => {
    const zeilen = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]];
    return (
      <>
        {zeilen.map((z, r) => z.map((n, k) => {
          const x = 120 + (k - (z.length - 1) / 2) * 31, y = 22 + r * 26.5;
          return (
            <g key={r + "-" + k}>
              <circle cx={x} cy={y} r={12.5} fill={r === 3 ? G : B1} stroke={I} strokeWidth="2" />
              <T x={x} y={y + 5} size={14} anchor="middle" w={800}>{n}</T>
            </g>
          );
        }))}
      </>
    );
  },
  potenzregel: () => (
    <>
      <T x={22} y={72} size={34} w={800}>xⁿ</T>
      <path d="M92 60 H128 M118 50 L130 60 L118 70" fill="none" stroke={S} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <T x={140} y={72} size={25} w={800}>n · xⁿ⁻¹</T>
      <rect x={52} y={96} width={136} height={34} rx={17} fill="#fff" stroke={I} strokeWidth="2.5" />
      <T x={120} y={119} size={17} anchor="middle" w={800}>x³  →  3x²</T>
    </>
  ),
  ableitungstrainer: () => (
    <>
      <rect x={24} y={20} width={192} height={44} rx={12} fill="#fff" stroke={I} strokeWidth="2.5" />
      <T x={38} y={48} size={17} w={800}>f(x) = x³ − 3x</T>
      <rect x={24} y={82} width={192} height={44} rx={12} fill="#fff" stroke={S} strokeWidth="3" />
      <T x={38} y={110} size={17} w={800} fill={S}>f′(x) = 3x² − 3</T>
      <circle cx={198} cy={104} r={13} fill={G} stroke={I} strokeWidth="2.5" />
      <path d="M191 104 l5 5 l9 -10" fill="none" stroke={I} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  graphzuordnung: () => {
    const kasten = (y, hell, inhalt, k) => (
      <g key={k}>
        <rect x={138} y={y} width={80} height={36} rx={9} fill="#fff" stroke={hell ? I : B2} strokeWidth={hell ? 3 : 1.8} />
        {hell && <rect x={138} y={y} width={80} height={36} rx={9} fill={G} fillOpacity="0.28" />}
        {inhalt}
      </g>
    );
    const X = (x) => 24 + (x + 2.2) * 19, Y = (y) => 76 - y * 7.2;
    return (
      <>
        <rect x={14} y={20} width={96} height={112} rx={12} fill="#fff" stroke={I} strokeWidth="2.5" />
        <path d={pfad((x) => x * x * x - 3 * x, -2.1, 2.1, X, Y)} fill="none" stroke={I} strokeWidth="3.5" strokeLinecap="round" />
        <T x={24} y={40} size={15} w={800}>f</T>
        <path d="M116 76 h16 M126 69 l7 7 l-7 7" fill="none" stroke={S} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {kasten(14, false, <path d="M150 42 Q178 4 206 42" fill="none" stroke={B2} strokeWidth="3" strokeLinecap="round" />, "a")}
        {kasten(57, true, <path d="M150 64 Q178 108 206 64" fill="none" stroke={I} strokeWidth="3" strokeLinecap="round" />, "b")}
        {kasten(100, false, <path d="M150 128 L206 108" fill="none" stroke={B2} strokeWidth="3" strokeLinecap="round" />, "c")}
      </>
    );
  },
  rechenweg: () => (
    <>
      <rect x={14} y={14} width={212} height={122} rx={12} fill="#fff" stroke={I} strokeWidth="2.5" />
      <T x={28} y={46} size={16} w={800}>x² · (3x + 1)</T>
      <T x={28} y={80} size={16} w={800}>= 3x³ + x²</T>
      <T x={28} y={114} size={16} w={800} fill={S}>f′ = 9x² + 2x</T>
      {[40, 74].map((y) => (
        <g key={y}>
          <circle cx={204} cy={y} r={11} fill={G} stroke={I} strokeWidth="2.2" />
          <path d={`M198 ${y} l4 4 l8 -9`} fill="none" stroke={I} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <circle cx={204} cy={108} r={11} fill="#fff" stroke={S} strokeWidth="2.5" strokeDasharray="4 3" />
    </>
  ),
  plotter: () => {
    const X = (x) => 120 + x * 40, Y = (y) => 76 - y * 14, f = (x) => x * x * x - 3 * x;
    return (
      <>
        <Achsen ox={120} oy={76} />
        <path d={pfad(f, -2.1, 2.1, X, Y)} fill="none" stroke={I} strokeWidth="3.5" strokeLinecap="round" />
        <Punkt x={X(-1)} y={Y(2)} r={6} /><Punkt x={X(1)} y={Y(-2)} r={6} /><Punkt x={X(0)} y={Y(0)} r={6} fill={S} />
        <T x={X(-1) - 10} y={Y(2) - 6} size={14} anchor="end">H</T>
        <T x={X(1) + 10} y={Y(-2) + 17} size={14}>T</T>
        <T x={X(0) + 10} y={Y(0) - 8} size={14}>W</T>
      </>
    );
  },
  advplotter: () => {
    const X = (x) => 120 + x * 40, Y = (y) => 76 - y * 22;
    return (
      <>
        <Achsen ox={120} oy={76} />
        <Linie x1={120} y1={8} x2={120} y2={142} c={G} w={2.5} strich="6 5" />
        <path d={pfad((x) => 1 / x, 0.38, 2.7, X, Y, 40)} fill="none" stroke={I} strokeWidth="3.5" strokeLinecap="round" />
        <path d={pfad((x) => 1 / x, -2.7, -0.38, X, Y, 40)} fill="none" stroke={I} strokeWidth="3.5" strokeLinecap="round" />
        <T x={112} y={24} size={13} anchor="end">Pol</T>
        <T x={226} y={96} size={13} anchor="end">Asymptote</T>
        <T x={20} y={30} size={15}>f(x) = 1/x</T>
      </>
    );
  },
  parabeln: () => {
    const X = (x) => 120 + x * 40, Y = (y) => 52 - y * 14;
    return (
      <>
        <Achsen ox={120} oy={52} y1={140} />
        <path d={pfad((x) => x * x - 3, -2.45, 2.45, X, Y)} fill="none" stroke={I} strokeWidth="3.5" strokeLinecap="round" />
        <Punkt x={X(0)} y={Y(-3)} r={6} />
        <T x={X(0)} y={Y(-3) + 24} size={14} anchor="middle">Scheitel</T>
        <Punkt x={X(-Math.sqrt(3))} y={52} r={5.5} fill={S} /><Punkt x={X(Math.sqrt(3))} y={52} r={5.5} fill={S} />
        <T x={X(-Math.sqrt(3)) - 6} y={44} size={13} anchor="end">x₁</T>
        <T x={X(Math.sqrt(3)) + 6} y={44} size={13}>x₂</T>
      </>
    );
  },
  funktionen: () => {
    const X = (x) => 40 + x * 40, Y = (y) => 132 - y * 40;
    return (
      <>
        <Achsen ox={40} oy={132} x0={20} y0={8} />
        <Linie x1={X(0)} y1={Y(0)} x2={X(3.05)} y2={Y(3.05)} c={B2} w={2.2} strich="6 5" />
        <path d={pfad((x) => x * x, 0, 1.75, X, Y)} fill="none" stroke={I} strokeWidth="3.5" strokeLinecap="round" />
        <path d={pfad((t) => t, 0, 1.75, (t) => X(t * t), (t) => Y(t))} fill="none" stroke={S} strokeWidth="3.5" strokeLinecap="round" />
        <T x={X(1.5) + 8} y={Y(2.25) + 4} size={15}>f</T>
        <T x={X(3.0) - 4} y={Y(1.73) - 8} size={15} fill={S}>f⁻¹</T>
      </>
    );
  },
  terme: () => (
    <>
      <rect x={14} y={22} width={60} height={60} fill={B1} stroke={I} strokeWidth="2.5" />
      <rect x={74} y={22} width={40} height={60} fill={BH} stroke={I} strokeWidth="2.5" />
      <rect x={14} y={82} width={60} height={40} fill={BH} stroke={I} strokeWidth="2.5" />
      <rect x={74} y={82} width={40} height={40} fill={G} stroke={I} strokeWidth="2.5" />
      <T x={44} y={58} size={16} anchor="middle" w={800}>a²</T><T x={94} y={58} size={14} anchor="middle" w={800}>ab</T>
      <T x={44} y={107} size={14} anchor="middle" w={800}>ab</T><T x={94} y={107} size={16} anchor="middle" w={800}>b²</T>
      <T x={128} y={58} size={15}>(a + b)²</T>
      <T x={128} y={86} size={15} fill={S}>= a² + 2ab</T>
      <T x={128} y={108} size={15} fill={S}>+ b²</T>
    </>
  ),
  bruchterme: () => (
    <>
      <T x={14} y={62} size={15}>(x+1)</T><T x={70} y={62} size={15}>(x−1)</T>
      <Linie x1={12} y1={72} x2={118} y2={72} w={3} />
      <T x={70} y={98} size={15}>(x−1)</T>
      <Linie x1={66} y1={68} x2={114} y2={50} c={G} w={4} />
      <Linie x1={66} y1={104} x2={114} y2={86} c={G} w={4} />
      <T x={132} y={82} size={20} w={800} fill={S}>= x + 1</T>
      <T x={14} y={132} size={13}>nur Faktoren kürzen</T>
    </>
  ),
  trigonometrie: () => {
    const cx = 80, cy = 78, r = 52, a = (40 * Math.PI) / 180, px = cx + r * Math.cos(a), py = cy - r * Math.sin(a);
    return (
      <>
        <circle cx={cx} cy={cy} r={r} fill="#fff" fillOpacity="0.7" stroke={I} strokeWidth="3" />
        <Achsen ox={cx} oy={cy} x0={20} x1={146} y0={14} y1={142} />
        <Linie x1={cx} y1={cy} x2={px} y2={py} w={3.5} />
        <Linie x1={px} y1={py} x2={px} y2={cy} c={S} w={3.5} />
        <Linie x1={cx} y1={cy} x2={px} y2={cy} c={G} w={4} />
        <path d={`M${cx + 20} ${cy} A20 20 0 0 0 ${cx + 20 * Math.cos(a)} ${cy - 20 * Math.sin(a)}`} fill="none" stroke={I} strokeWidth="2.2" />
        <Punkt x={px} y={py} r={5.5} />
        <T x={px + 6} y={(py + cy) / 2 + 5} size={12} fill={S}>sin α</T>
        <T x={cx + 4} y={cy + 17} size={13}>cos α</T>
        <T x={172} y={62} size={14} w={800}>sin² α</T><T x={172} y={82} size={14} w={800}>+ cos² α</T><T x={172} y={104} size={16} w={800} fill={S}>= 1</T>
      </>
    );
  },
  sinus: () => {
    const X = (x) => 14 + x * 34, Y = (y) => 76 - y * 38;
    return (
      <>
        <Achsen ox={14} oy={76} />
        <path d={pfad((x) => 0.5 * Math.sin(2 * (x - 0.6)), 0, 6.6, X, Y, 80)} fill="none" stroke={B2} strokeWidth="3" strokeLinecap="round" />
        <path d={pfad(Math.sin, 0, 6.6, X, Y, 80)} fill="none" stroke={I} strokeWidth="3.5" strokeLinecap="round" />
        <Linie x1={X(Math.PI / 2)} y1={76} x2={X(Math.PI / 2)} y2={Y(1)} c={S} w={2.5} strich="4 4" />
        <Punkt x={X(Math.PI / 2)} y={Y(1)} r={5.5} />
        <T x={X(Math.PI / 2) + 9} y={58} size={14} fill={S}>a</T>
        <T x={X(Math.PI)} y={Y(-1) + 22} size={13} anchor="middle">Periode</T>
      </>
    );
  },
  wachstum: () => {
    const X = (x) => 22 + x * 35, Y = (y) => 128 - y * 16.5, f = (x) => 0.6 * Math.pow(1.5, x);
    const flaeche = pfad(f, 0, 6, X, Y) + `L${X(6)} 128 L${X(0)} 128 Z`;
    return (
      <>
        <path d={flaeche} fill={B1} fillOpacity="0.55" />
        <Achsen ox={22} oy={128} y1={140} />
        <path d={pfad(f, 0, 6, X, Y)} fill="none" stroke={I} strokeWidth="3.5" strokeLinecap="round" />
        {[0, 1.71, 3.42].map((x) => (
          <g key={x}>
            <Linie x1={X(x)} y1={Y(f(x))} x2={X(x)} y2={128} c={I} w={1.8} strich="4 4" op={0.7} />
            <Punkt x={X(x)} y={Y(f(x))} r={5.5} />
          </g>
        ))}
        <T x={X(0.85)} y={Y(1.15) - 34} size={14} anchor="middle" fill={S}>×2</T>
        <T x={X(2.55)} y={Y(2.3) - 34} size={14} anchor="middle" fill={S}>×2</T>
      </>
    );
  },
  optimierung: () => {
    const X = (x) => 24 + x * 62, Y = (y) => 128 - y * 6, f = (x) => x * (6 - 2 * x) * (6 - 2 * x) / 2;
    return (
      <>
        <Achsen ox={24} oy={128} y1={140} />
        <path d={pfad(f, 0, 3, X, Y)} fill="none" stroke={I} strokeWidth="3.5" strokeLinecap="round" />
        <Linie x1={X(1)} y1={Y(f(1))} x2={X(1)} y2={128} c={I} w={1.8} strich="4 4" op={0.7} />
        <Linie x1={24} y1={Y(f(1))} x2={X(1)} y2={Y(f(1))} c={I} w={1.8} strich="4 4" op={0.7} />
        <Punkt x={X(1)} y={Y(f(1))} r={6.5} />
        <T x={X(1) + 11} y={Y(f(1)) - 8} size={14} w={800}>Max</T>
        <polygon points="170,40 196,40 196,64 170,64" fill={B1} stroke={I} strokeWidth="2.2" />
        <polygon points="170,40 180,31 206,31 196,40" fill={BH} stroke={I} strokeWidth="2.2" />
        <polygon points="196,40 206,31 206,55 196,64" fill={B2} stroke={I} strokeWidth="2.2" />
      </>
    );
  },
  steckbrief: () => {
    const X = (x) => 56 + x * 22, Y = (y) => 82 - y * 11, f = (x) => x * x * x - 3 * x;
    return (
      <>
        <Achsen ox={56} oy={82} x0={10} x1={108} y0={14} y1={142} />
        <path d={pfad(f, -2.05, 2.05, X, Y)} fill="none" stroke={I} strokeWidth="3.5" strokeLinecap="round" />
        <Punkt x={X(-1)} y={Y(2)} r={5.5} /><Punkt x={X(0)} y={Y(0)} r={5.5} fill={S} />
        <rect x={122} y={22} width={104} height={30} rx={10} fill="#fff" stroke={I} strokeWidth="2.2" />
        <T x={174} y={42} size={14} anchor="middle" w={800}>H(−1 | 2)</T>
        <rect x={122} y={62} width={104} height={30} rx={10} fill="#fff" stroke={I} strokeWidth="2.2" />
        <T x={174} y={82} size={14} anchor="middle" w={800}>W(0 | 0)</T>
        <rect x={122} y={102} width={104} height={30} rx={10} fill={G} stroke={I} strokeWidth="2.5" />
        <T x={174} y={122} size={14} anchor="middle" w={800}>f(x) = ?</T>
      </>
    );
  },
  scharen: () => {
    const X = (x) => 120 + x * 40, Y = (y) => 132 - y * 14;
    return (
      <>
        <Achsen ox={120} oy={132} y1={142} />
        <path d={pfad((x) => 1.5 * x * x, -1.9, 1.9, X, Y)} fill="none" stroke={I} strokeWidth="3.2" strokeLinecap="round" />
        <path d={pfad((x) => 0.8 * x * x, -2.4, 2.4, X, Y)} fill="none" stroke={S} strokeWidth="3.2" strokeLinecap="round" />
        <path d={pfad((x) => 0.4 * x * x, -2.8, 2.8, X, Y)} fill="none" stroke={B2} strokeWidth="3.2" strokeLinecap="round" />
        <Punkt x={120} y={132} r={6} />
        <T x={18} y={30} size={15}>fₐ(x) = a · x²</T>
      </>
    );
  },
  heftSekante: () => (
    <>
      <rect x={46} y={10} width={150} height={130} rx={8} fill="#fff" stroke={I} strokeWidth="2.5" />
      {[28, 52, 76, 100, 124].map((y) => <circle key={y} cx={46} cy={y} r={4.5} fill={B1} stroke={I} strokeWidth="2" />)}
      <path d={pfad((x) => x * x, 0, 2.6, (x) => 64 + x * 38, (y) => 80 - y * 9)} fill="none" stroke={I} strokeWidth="3" strokeLinecap="round" />
      <Linie x1={62} y1={80} x2={176} y2={22} c={S} w={2.8} />
      <Punkt x={85} y={78} r={4.5} /><Punkt x={150} y={44} r={4.5} />
      <Linie x1={64} y1={100} x2={178} y2={100} c={B2} w={4} op={0.7} />
      <Linie x1={64} y1={114} x2={150} y2={114} c={B2} w={4} op={0.7} />
      <Linie x1={64} y1={128} x2={168} y2={128} c={B2} w={4} op={0.7} />
    </>
  ),
  heftRegeln: () => (
    <>
      <rect x={46} y={10} width={150} height={130} rx={8} fill="#fff" stroke={I} strokeWidth="2.5" />
      {[28, 52, 76, 100, 124].map((y) => <circle key={y} cx={46} cy={y} r={4.5} fill={B1} stroke={I} strokeWidth="2" />)}
      <T x={62} y={40} size={13} w={800}>(c · f)′ = c · f′</T>
      <T x={62} y={72} size={13} w={800}>(f + g)′ = f′ + g′</T>
      <T x={62} y={104} size={13} w={800} fill={S}>(xⁿ)′ = n · xⁿ⁻¹</T>
      <Linie x1={62} y1={122} x2={176} y2={122} c={G} w={5} />
    </>
  ),
};

/* Reserve, falls ein Werkzeug noch keine eigene Grafik hat */
const Ersatz = () => {
  const X = (x) => 120 + x * 40, Y = (y) => 120 - y * 20;
  return (
    <>
      <Achsen ox={120} oy={120} />
      <path d={pfad((x) => 1.2 + Math.sin(x * 1.3) * 1.5, -2.6, 2.6, X, Y)} fill="none" stroke={I} strokeWidth="3.5" strokeLinecap="round" />
    </>
  );
};

export function KartenBild({ id, titel }) {
  const Bild = BILDER[id] || Ersatz;
  return <Rahmen titel={titel}><Bild /></Rahmen>;
}

/* ---------- Die Karte ---------- */
const CSS = `
.dkk{position:relative;display:grid;grid-template-columns:240px minmax(0,1fr) 172px;grid-template-rows:auto 1fr;grid-template-areas:"kopf text bild" "knopf text bild";
  column-gap:18px;row-gap:12px;min-height:140px;padding:16px;border-radius:22px;background:#fff;border:1.5px solid ${C.linie};box-shadow:0 4px 20px rgba(15,26,51,.07);
  cursor:pointer;transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;box-sizing:border-box}
@media (hover:hover){.dkk:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(15,26,51,.13);border-color:${B2}}}
.dkk-kopf{grid-area:kopf;display:flex;align-items:flex-start;gap:12px;min-width:0}
.dkk-titel{font-size:15.5px;font-weight:800;letter-spacing:-0.01em;line-height:1.22;color:${I};margin:0;overflow-wrap:break-word}
.dkk-art{font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${C.golddunkel};margin:0 0 3px}
.dkk-text{grid-area:text;align-self:center;margin:0;font-size:13.5px;line-height:1.55;color:#2B3A4F}
.dkk-knopf-feld{grid-area:knopf;display:flex;align-items:flex-end}
.dkk-bild{grid-area:bild;align-self:stretch;min-height:108px;border-radius:16px;overflow:hidden;border:1.5px solid ${B1};
  background-image:linear-gradient(rgba(127,194,236,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(127,194,236,.3) 1px,transparent 1px),linear-gradient(150deg,${BH} 0%,${B1} 100%);
  background-size:18px 18px,18px 18px,auto}
.dkk-knopf{position:relative;display:inline-flex;align-items:center;gap:12px;padding:6px 6px 6px 18px;border:0;border-radius:999px;cursor:pointer;font-family:inherit;font-weight:800;font-size:14px;letter-spacing:.01em;color:${I};
  background:linear-gradient(135deg,${B1} 0%,${B2} 100%);box-shadow:0 8px 18px rgba(127,194,236,.6), inset 0 1px 0 rgba(255,255,255,.75);
  transition:transform .16s ease, box-shadow .16s ease, background .2s ease, color .2s ease}
.dkk-knopf .dkk-pfeil{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:${I};color:${B1};transition:transform .2s ease, background .2s ease}
@media (hover:hover){.dkk-knopf:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(127,194,236,.75), inset 0 1px 0 rgba(255,255,255,.8)}
  .dkk-knopf:hover .dkk-pfeil{transform:translateX(3px) rotate(-8deg)}}
.dkk-knopf:active{transform:scale(.96)}
.dkk-knopf:focus-visible{outline:3px solid ${G};outline-offset:3px}
.dkk-knopf[aria-expanded="true"]{background:${I};color:#fff;box-shadow:0 8px 18px rgba(11,12,16,.35)}
.dkk-knopf[aria-expanded="true"] .dkk-pfeil{background:${B1};color:${I}}
@media (max-width:820px){
  .dkk{grid-template-columns:minmax(0,1fr) 150px;grid-template-rows:auto auto auto;grid-template-areas:"kopf bild" "text text" "knopf knopf";column-gap:14px}
  .dkk-bild{min-height:100px;height:100%}
  .dkk-text{margin:2px 0}
}
@media (max-width:560px){
  .dkk{grid-template-columns:minmax(0,1fr) 112px;padding:14px;column-gap:12px}
  .dkk-zeichen{display:none}
  .dkk-knopf{width:100%;justify-content:space-between}
}
@media (prefers-reduced-motion:reduce){.dkk,.dkk-knopf,.dkk-pfeil{transition:none !important}}
`;

export function WerkzeugKarte({ id, t, an, oeffnen, schliessen, Zeichen }) {
  const info = KARTEN[id] || {};
  const klick = () => (an ? schliessen() : oeffnen(id));
  return (
    <div className="dkk" role="group" aria-label={t.titel} onClick={(e) => { if (!e.target.closest("button")) klick(); }}>
      <div className="dkk-kopf">
        <span className="dkk-zeichen"><Zeichen text={t.zeichen} /></span>
        <div style={{ minWidth: 0 }}>
          {info.art && <p className="dkk-art">{info.art}</p>}
          <p className="dkk-titel" style={t.titel.split(" ").some((wort) => wort.length > 17) ? { fontSize: 14 } : undefined}>{t.titel}</p>
        </div>
      </div>
      <p className="dkk-text">{info.text || t.zeile}</p>
      <div className="dkk-knopf-feld">
        <button type="button" className="dkk-knopf" onClick={(e) => { e.stopPropagation(); klick(); }} aria-haspopup="dialog" aria-expanded={an}>
          <span>{an ? "Schließen" : "Jetzt öffnen"}</span>
          <span className="dkk-pfeil" aria-hidden="true">
            {an
              ? <svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
              : <svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </span>
        </button>
      </div>
      <div className="dkk-bild"><KartenBild id={id} titel={`Skizze zu ${t.titel}`} /></div>
    </div>
  );
}

export function KartenStil() { return <style>{CSS}</style>; }
