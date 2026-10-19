/* ======================================================================
   ENTDECKE CARL FRIEDRICH GAUSS – DREI IDEEN, EIN SCHEIN
   Vierphasiges Lernmodul in „Mathe entdecken“ (Kennung „gauss“):
     1 Der kleine Gauß: 1 + 2 + … + n als Treppe, die zum Rechteck wird
     2 Das Gauß-Verfahren: eine Unbekannte verschwinden lassen
     3 Die Glocke auf dem Zehn-Mark-Schein: μ, σ, Wendestellen
     4 Alles zusammen: drei Aufgaben, drei Ideen
   Bild des Scheins: public/gauss/zehn-mark-schein.webp
   ====================================================================== */
import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { FR } from "./funcRegistry.jsx";
import { GrosserKnopf } from "./ui2.jsx";
import { Aufforderung, BildKarte, EntdeckenModul, Regler, T } from "./funcEntdeckenModul.jsx";

const ID = "gauss";
const GOLD = "#FFF1BF", BLAU = "#D6E4F7";
const svgStil = { width: "100%", maxWidth: 340, display: "block", margin: "0 auto" };
const txt = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700 };
const opt = (liste) => liste.map(([id, s]) => [id, <T key={id} s={s} />]);
const kommaZahl = (x) => String(x).replace(".", ",");

/* ---------- Phase 1: Treppe + Treppe = Rechteck ---------- */
function TreppeBild() {
  const [n, setN] = useState(6);
  const s = Math.min(236 / n, 224 / (n + 1)), x0 = 52, y0 = 18;
  const zellen = [];
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j <= n; j++) {
      const gold = j < i; // Spalte i: unten i goldene Kästchen, darüber blau
      zellen.push(<rect key={`${i}-${j}`} x={x0 + (i - 1) * s} y={y0 + (n - j) * s} width={s} height={s}
        fill={gold ? GOLD : BLAU} stroke={C.tinte} strokeWidth="0.8" />);
    }
  }
  const S = (n * (n + 1)) / 2;
  return (
    <BildKarte>
      <Aufforderung>Die goldene Treppe ist die Summe 1 + 2 + … + n. Die blaue Treppe ist ihr Spiegelbild. Zusammen füllen sie ein Rechteck.</Aufforderung>
      <svg viewBox="0 0 340 290" style={svgStil} role="img" aria-label={`Rechteck aus ${n} mal ${n + 1} Kästchen, geteilt in zwei gleiche Treppen`}>
        {zellen}
        <text x={x0 + (n * s) / 2} y={y0 - 5} textAnchor="middle" style={{ ...txt, fontSize: 13, fill: C.see }}>n = {n}</text>
        <text x={x0 - 8} y={y0 + ((n + 1) * s) / 2 + 4} textAnchor="end" style={{ ...txt, fontSize: 13, fill: C.smaragd }}>n + 1</text>
        <text x={170} y={282} textAnchor="middle" style={{ ...txt, fontSize: 13, fill: C.tinte }}>2 · S = {n} · {n + 1} = {n * (n + 1)}, also S = {S}</text>
      </svg>
      <div style={{ marginTop: 12 }}>
        <Regler name="n" wert={n} setWert={setN} min={2} max={12} />
      </div>
    </BildKarte>
  );
}

/* ---------- Phase 2: zwei Geraden, ein Schnittpunkt ---------- */
function VerfahrenBild() {
  const [d, setD] = useState(2);
  const x = (6 + d) / 2, y = (6 - d) / 2;
  const xl = d < 0 ? 8 + d - 0.5 : 7.4; // Beschriftung von Gerade II bleibt auf der sichtbaren Linie
  const L = 28, B = 270, H = 200, X = 8, Y = 8; // Zeichenfläche
  const px = (v) => L + (v / X) * B;
  const py = (v) => 12 + H - (v / Y) * H;
  const klemme = (f) => { // Gerade y = f(x) auf 0 ≤ y ≤ 8 beschneiden
    const pts = [];
    for (let v = 0; v <= X + 1e-9; v += 0.05) { const w = f(v); if (w >= -1e-9 && w <= Y + 1e-9) pts.push(`${px(v).toFixed(1)},${py(w).toFixed(1)}`); }
    return pts.join(" ");
  };
  return (
    <BildKarte>
      <Aufforderung>Jede Gleichung ist eine Gerade. Die Lösung des Systems ist der Punkt, in dem sich beide schneiden.</Aufforderung>
      <svg viewBox="0 0 340 250" style={svgStil} role="img" aria-label="Zwei Geraden x plus y gleich 6 und x minus y gleich d mit ihrem Schnittpunkt">
        <line x1={L} y1={py(0)} x2={L + B} y2={py(0)} stroke={C.hellgrau} strokeWidth="1.2" />
        <line x1={L} y1={py(0)} x2={L} y2={py(Y)} stroke={C.hellgrau} strokeWidth="1.2" />
        {[2, 4, 6, 8].map((t) => <text key={t} x={px(t)} y={py(0) + 14} textAnchor="middle" style={{ ...txt, fontSize: 10.5, fontWeight: 600, fill: C.hellgrau }}>{t}</text>)}
        {[2, 4, 6, 8].map((t) => <text key={t} x={L - 6} y={py(t) + 4} textAnchor="end" style={{ ...txt, fontSize: 10.5, fontWeight: 600, fill: C.hellgrau }}>{t}</text>)}
        <polyline points={klemme((v) => 6 - v)} fill="none" stroke={C.see} strokeWidth="2.4" />
        <polyline points={klemme((v) => v - d)} fill="none" stroke={C.smaragd} strokeWidth="2.4" />
        <text x={px(0.3)} y={py(5.4)} style={{ ...txt, fontSize: 12.5, fill: C.see }}>I</text>
        <text x={px(xl)} y={py(xl - d) - 6} style={{ ...txt, fontSize: 12.5, fill: C.smaragd }}>II</text>
        <line x1={px(x)} y1={py(y)} x2={px(x)} y2={py(0)} stroke={C.flaggold} strokeWidth="1.2" strokeDasharray="4 4" />
        <line x1={px(x)} y1={py(y)} x2={px(0)} y2={py(y)} stroke={C.flaggold} strokeWidth="1.2" strokeDasharray="4 4" />
        <circle cx={px(x)} cy={py(y)} r="6" fill={C.flaggold} stroke={C.tinte} strokeWidth="1.5" />
        <text x={170} y={244} textAnchor="middle" style={{ ...txt, fontSize: 12.5, fill: C.tinte }}>
          I + II: 2x = {6 + d}, also x = {kommaZahl(x)} und y = {kommaZahl(y)}
        </text>
      </svg>
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, margin: "8px 0 0" }}>
        (I) x + y = 6 <br />(II) x − y = <b>{d}</b> – verschiebe die zweite Gerade mit dem Regler.
      </p>
      <div style={{ marginTop: 12 }}>
        <Regler name="d" wert={d} setWert={setD} min={-4} max={6} schritt={2} farbe={C.smaragd} />
      </div>
    </BildKarte>
  );
}

/* ---------- Phase 3: Foto vom Schein + Glocke mit μ und σ ---------- */
const phi = (x, mu, sg) => Math.exp(-0.5 * ((x - mu) / sg) ** 2) / (sg * Math.sqrt(2 * Math.PI));

function SchneinFoto() {
  return (
    <figure style={{ margin: 0 }}>
      <img src="/gauss/zehn-mark-schein.webp" alt="Zehn-Mark-Schein der Deutschen Bundesbank mit dem Porträt von Carl Friedrich Gauß und einer Glockenkurve mit Formel"
        width="600" height="308" loading="lazy" style={{ width: "100%", height: "auto", display: "block", borderRadius: 12, border: `1px solid ${C.linie}` }} />
      <figcaption style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.55, marginTop: 8 }}>
        Zehn-Mark-Schein der Deutschen Bundesbank (Datum 1. Oktober 1993) mit Carl Friedrich Gauß, 1777–1855. Links neben ihm: die Glockenkurve mit ihrer Formel.
      </figcaption>
    </figure>
  );
}

function GlockenBild() {
  const [mu, setMu] = useState(5);
  const [sg, setSg] = useState(1);
  const L = 20, B = 300, H = 150, X = 10, Ymax = 0.85;
  const px = (v) => L + (v / X) * B;
  const py = (v) => 14 + H - (v / Ymax) * H;
  const kurve = useMemo(() => {
    const pts = [];
    for (let v = 0; v <= X + 1e-9; v += 0.1) pts.push([px(v), py(phi(v, mu, sg))]);
    return pts;
  }, [mu, sg]);
  const pfad = kurve.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const a = Math.max(0, mu - sg), b = Math.min(X, mu + sg);
  const flaeche = [`M${px(a).toFixed(1)},${py(0)}`];
  for (let v = a; v <= b + 1e-9; v += 0.05) flaeche.push(`L${px(v).toFixed(1)},${py(phi(v, mu, sg)).toFixed(1)}`);
  flaeche.push(`L${px(b).toFixed(1)},${py(0)} Z`);
  return (
    <BildKarte>
      <SchneinFoto />
      <div style={{ marginTop: 18 }}>
        <Aufforderung>Verschiebe die Glocke mit μ und mach sie mit σ breiter oder schmaler.</Aufforderung>
        <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label={`Glockenkurve mit Erwartungswert ${mu} und Standardabweichung ${kommaZahl(sg)}`}>
          <line x1={L} y1={py(0)} x2={L + B} y2={py(0)} stroke={C.hellgrau} strokeWidth="1.2" />
          <path d={flaeche.join(" ")} fill={GOLD} opacity="0.9" />
          <path d={pfad} fill="none" stroke={C.see} strokeWidth="2.6" />
          <line x1={px(mu)} y1={py(0)} x2={px(mu)} y2={py(phi(mu, mu, sg))} stroke={C.tinte} strokeWidth="1.2" strokeDasharray="4 4" />
          {[mu - sg, mu + sg].map((w, i) => w >= 0 && w <= X && (
            <circle key={i} cx={px(w)} cy={py(phi(w, mu, sg))} r="5" fill={C.smaragd} stroke={C.tinte} strokeWidth="1.3" />
          ))}
          {[0, 2, 4, 6, 8, 10].map((t) => <text key={t} x={px(t)} y={py(0) + 14} textAnchor="middle" style={{ ...txt, fontSize: 10.5, fontWeight: 600, fill: C.hellgrau }}>{t}</text>)}
          <text x={170} y={194} textAnchor="middle" style={{ ...txt, fontSize: 12.5, fill: C.tinte }}>
            μ = {mu}, σ = {kommaZahl(sg)} · Wendestellen bei {kommaZahl(mu - sg)} und {kommaZahl(mu + sg)}
          </text>
        </svg>
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <Regler name="μ" wert={mu} setWert={setMu} min={3} max={7} />
          <Regler name="σ" wert={sg} setWert={setSg} min={0.5} max={2} schritt={0.5} farbe={C.smaragd} />
        </div>
        <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, margin: "10px 0 0" }}>
          Die Fläche unter der Glocke ist immer genau 1. Die goldene Fläche zwischen den grünen Punkten (μ − σ bis μ + σ) ist etwa 68,3 % davon.
        </p>
      </div>
    </BildKarte>
  );
}

/* ---------- Phase 4: Überblick ---------- */
function UeberblickKarte() {
  const z = { fontSize: 15, color: C.tinte, padding: "8px 0", borderBottom: `1px solid ${C.linie}`, lineHeight: 1.55 };
  return (
    <BildKarte>
      <Aufforderung>Drei Ideen von Gauß – du hast alle drei selbst aufgebaut.</Aufforderung>
      <div style={z}><b>Summen:</b> <T s="$1 + 2 + \ldots + n = \frac{n(n+1)}{2}$" /></div>
      <div style={z}><b>Gleichungssysteme:</b> <T s="Gleichungen so addieren, dass eine Unbekannte wegfällt" /></div>
      <div style={{ ...z, borderBottom: "none" }}><b>Glocke:</b> <T s="$\varphi(x) = \frac{1}{\sigma\sqrt{2\pi}} \cdot e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}$" /></div>
    </BildKarte>
  );
}

function AbschlussKnoepfe() {
  const gehe = (z) => FR.gehe && FR.gehe(z);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.65, margin: 0 }}>Jede der drei Ideen hat ein eigenes Werkzeug, in dem du beliebig viele Aufgaben bekommst.</p>
      <GrosserKnopf gold onClick={() => gehe({ ansicht: "lgs" })}>Gleichungssysteme üben →</GrosserKnopf>
      <GrosserKnopf ghost onClick={() => gehe({ ansicht: "normalverteilung" })}>Normalverteilung erkunden →</GrosserKnopf>
      <GrosserKnopf ghost onClick={() => gehe({ ansicht: "formeln", bereich: "stochastik", formel: "normalverteilung" })}>Glockenkurve in der Formelsammlung →</GrosserKnopf>
    </div>
  );
}

function bauePhasen(r) {
  return [
    {
      titel: "Der kleine Gauß – eine Treppe wird zum Rechteck",
      intro: "Erzählt wird: Ein Lehrer wollte seine Klasse beschäftigen und ließ alle Zahlen von 1 bis 100 addieren. Der junge Gauß war nach kurzer Zeit fertig. Sein Trick: Eine Summe als Treppe zeichnen und die Treppe verdoppeln.",
      bild: <TreppeBild />,
      fertig: "Geschafft: Zwei gleiche Treppen ergeben ein Rechteck n mal (n + 1). Eine Treppe ist die Hälfte davon.",
      schritte: [
        { id: "g1a", titel: "Das ganze Rechteck", typ: "zahl", frage: <T s="Stelle $n = 6$ ein. Wie viele Kästchen hat das Rechteck mit $6$ mal $7$ Kästchen?" />, text: "Kästchen:", wert: 42, breite: 96,
          fehler: [{ wert: 36, text: "36 wäre 6 · 6. Das Rechteck ist eine Zeile höher, also 6 · 7." }],
          hinweise: ["Breite n = 6, Höhe n + 1 = 7."], erklaerung: <T s="$6 \cdot 7 = 42$" /> },
        { id: "g1b", titel: "Eine Treppe", typ: "zahl", frage: <T s="Das Rechteck besteht aus zwei gleichen Treppen. Wie groß ist die goldene Treppe, also $1 + 2 + 3 + 4 + 5 + 6$?" />, text: "Summe:", wert: 21, breite: 96,
          fehler: [{ wert: 42, text: "42 ist das ganze Rechteck, also beide Treppen. Eine Treppe ist die Hälfte." }],
          hinweise: ["42 geteilt durch 2"], erklaerung: <T s="$1 + 2 + 3 + 4 + 5 + 6 = 21 = 42 : 2$" /> },
        { id: "g1c", titel: "Die Formel", typ: "wahl", frage: <T s="Welche Formel gilt für jedes $n$?" />, richtig: "r",
          optionen: opt([["f", "$1 + 2 + \\ldots + n = \\frac{n^2}{2}$"], ["r", "$1 + 2 + \\ldots + n = \\frac{n(n+1)}{2}$"], ["g", "$1 + 2 + \\ldots + n = n(n+1)$"]]),
          fehler: [{ wahl: "f", text: "Für n = 6 gäbe das 18. Die Summe ist aber 21 – das Rechteck hat n + 1 Zeilen." }, { wahl: "g", text: "n(n + 1) ist das ganze Rechteck, also die doppelte Summe." }],
          hinweise: ["Rechteck n · (n + 1), davon die Hälfte."], erklaerung: <T s="$S = \frac{n(n+1)}{2}$" /> },
        { id: "g1d", titel: "Der kleine Gauß", typ: "zahl", frage: <T s="Jetzt dein Trick auf die Aufgabe aus der Geschichte: $1 + 2 + \ldots + 100$." />, text: "Summe:", wert: 5050, breite: 112,
          fehler: [{ wert: 10100, text: "10100 ist das ganze Rechteck 100 · 101. Du musst noch halbieren." }, { wert: 5000, text: "5000 wäre 50 · 100. Die Paare 1 + 100, 2 + 99, … ergeben jeweils 101." }],
          hinweise: ["100 · 101 geteilt durch 2"], erklaerung: <T s="$\frac{100 \cdot 101}{2} = 5050$" /> },
      ],
    },
    {
      titel: "Das Gauß-Verfahren – eine Unbekannte verschwindet",
      intro: "Zwei Gleichungen, zwei Unbekannte. Statt zu raten, addieren wir die Gleichungen so, dass eine Unbekannte wegfällt. Das Verfahren ist älter als Gauß; er hat es für seine Rechnungen mit Messdaten ausgebaut, deshalb trägt es seinen Namen.",
      bild: <VerfahrenBild />,
      fertig: "Geschafft: Addieren lässt y verschwinden, dann ist es nur noch eine Gleichung mit einer Unbekannten.",
      schritte: [
        { id: "g2a", titel: "Addieren", typ: "zahl", frage: <T s="Stelle $d = 2$ ein. Addiere (I) $x + y = 6$ und (II) $x − y = 2$. Links steht dann $2x$. Was steht rechts?" />, text: "2x =", wert: 8, breite: 96,
          fehler: [{ wert: 4, text: "4 ist die Differenz 6 − 2. Beim Addieren rechnest du 6 + 2." }],
          hinweise: ["Rechte Seiten addieren: 6 + 2"], erklaerung: <T s="$(x + y) + (x − y) = 6 + 2$, also $2x = 8$" /> },
        { id: "g2b", titel: "Erste Unbekannte", typ: "zahl", frage: <T s="Löse $2x = 8$ nach $x$." />, text: "x =", wert: 4, breite: 96,
          fehler: [{ wert: 8, text: "Du musst noch durch 2 teilen." }],
          hinweise: ["8 geteilt durch 2"], erklaerung: <T s="$x = 4$" /> },
        { id: "g2c", titel: "Zweite Unbekannte", typ: "zahl", frage: <T s="Setze $x = 4$ in (I) ein: $4 + y = 6$." />, text: "y =", wert: 2, breite: 96,
          fehler: [{ wert: 10, text: "10 ist 4 + 6. Du musst 4 von 6 abziehen." }],
          hinweise: ["6 − 4"], erklaerung: <T s="$y = 6 − 4 = 2$. Im Bild ist das der goldene Punkt (4 | 2)." /> },
        { id: "g2d", titel: "Warum klappt das?", typ: "wahl", frage: "Warum fällt y beim Addieren weg?", richtig: "r",
          optionen: [["r", "In (I) steht + y und in (II) steht − y. Beide heben sich auf."], ["f", "Weil beide Gleichungen dieselbe Gerade beschreiben."], ["g", "Weil y immer 0 ist."]],
          fehler: [{ wahl: "f", text: "Die beiden Geraden sind verschieden, sie schneiden sich in genau einem Punkt." }, { wahl: "g", text: "y ist hier 2. Es fällt nur beim Addieren aus der Rechnung heraus." }],
          hinweise: ["Was ergibt + y plus − y?"], erklaerung: "+y und −y ergeben zusammen 0 – so wird aus zwei Gleichungen eine." },
      ],
    },
    {
      titel: "Die Glocke vom Zehn-Mark-Schein",
      intro: "Auf dem alten Zehn-Mark-Schein ist Gauß abgebildet, daneben eine Glockenkurve mit ihrer Formel. Sie beschreibt, wie Messwerte um einen Mittelwert streuen: die Normalverteilung, auch Gaußsche Glockenkurve genannt.",
      bild: <GlockenBild />,
      fertig: "Geschafft: μ legt fest, wo die Glocke steht, σ legt fest, wie breit sie ist. Die Wendestellen liegen bei μ − σ und μ + σ.",
      schritte: [
        { id: "g3a", titel: "Hochpunkt", typ: "zahl", frage: <T s="Stelle $\mu = 5$ und $\sigma = 1$ ein. Bei welchem $x$ liegt der Hochpunkt?" />, text: "x =", wert: 5, breite: 96,
          fehler: [{ wert: 1, text: "1 ist σ, die Breite. Der Hochpunkt liegt bei μ." }],
          hinweise: ["Der Gipfel steht über dem Erwartungswert μ."], erklaerung: <T s="Hochpunkt bei $x = \mu = 5$." /> },
        { id: "g3b", titel: "Wendestelle", typ: "zahl", frage: <T s="Bei $\mu = 5$ und $\sigma = 1$: Wo liegt die rechte Wendestelle (grüner Punkt)?" />, text: "x =", wert: 6, breite: 96,
          fehler: [{ wert: 4, text: "4 ist die linke Wendestelle. Die rechte liegt bei μ + σ." }],
          hinweise: ["μ + σ"], erklaerung: <T s="$\mu + \sigma = 5 + 1 = 6$" /> },
        { id: "g3c", titel: "Breitere Glocke", typ: "zahl", frage: <T s="Stelle $\sigma = 2$ ein, $\mu$ bleibt 5. Wo liegt jetzt die rechte Wendestelle?" />, text: "x =", wert: 7, breite: 96,
          fehler: [{ wert: 6, text: "6 gehörte zu σ = 1. Jetzt ist σ = 2." }],
          hinweise: ["5 + 2"], erklaerung: <T s="$\mu + \sigma = 5 + 2 = 7$" /> },
        { id: "g3d", titel: "Was σ bewirkt", typ: "wahl", frage: <T s="Was passiert mit der Glocke, wenn $\sigma$ größer wird?" />, richtig: "r",
          optionen: [["r", "Sie wird breiter und flacher. Die Fläche bleibt 1."], ["f", "Sie wird schmaler und höher."], ["g", "Sie wandert nach rechts."]],
          fehler: [{ wahl: "f", text: "Das passiert bei kleinerem σ. Probiere beide Richtungen mit dem Regler." }, { wahl: "g", text: "Das Verschieben macht μ. σ ändert nur die Breite." }],
          hinweise: ["Die Fläche unter der Glocke bleibt 1: Wird sie breiter, muss sie niedriger werden."], erklaerung: "Größeres σ streckt die Glocke in die Breite; damit die Fläche 1 bleibt, sinkt die Höhe." },
        { id: "g3e", titel: "Die 68-Prozent-Regel", typ: "zahl", frage: <T s="Etwa wie viel Prozent der Fläche liegen zwischen $\mu − \sigma$ und $\mu + \sigma$? (ganze Prozent)" />, text: "Prozent:", wert: 68, toleranz: 0.6, breite: 96,
          fehler: [{ wert: 95, text: "95 % gehören zum Bereich μ ± 2σ." }, { wert: 50, text: "50 % wäre die Hälfte der Fläche, also alles links oder rechts von μ." }],
          hinweise: ["Die goldene Fläche im Bild."], erklaerung: <T s="Zwischen $\mu − \sigma$ und $\mu + \sigma$ liegen etwa $68{,}3$ % der Fläche." /> },
      ],
    },
    {
      titel: "Alles zusammen: drei Ideen, drei Aufgaben",
      intro: "Jetzt wendest du alle drei Ideen von Gauß noch einmal an: die Summenformel, das Gauß-Verfahren und die Glocke.",
      bild: <UeberblickKarte />,
      fertig: "Geschafft: Summen, Gleichungssysteme und die Glocke – drei Ideen, die bis heute überall gebraucht werden.",
      abschluss: <AbschlussKnoepfe />,
      schritte: [
        { id: "g4a", titel: `Summe bis ${r.n}`, typ: "zahl", frage: <T s={`Berechne $1 + 2 + \\ldots + ${r.n}$.`} />, text: "Summe:", wert: (r.n * (r.n + 1)) / 2, breite: 104,
          fehler: [{ wert: r.n * (r.n + 1), text: `${r.n * (r.n + 1)} ist das ganze Rechteck ${r.n} · ${r.n + 1}. Halbiere es.` }],
          hinweise: [<T key="h" s={`$\\frac{${r.n} \\cdot ${r.n + 1}}{2}$`} />], erklaerung: <T s={`$\\frac{${r.n} \\cdot ${r.n + 1}}{2} = ${(r.n * (r.n + 1)) / 2}$`} /> },
        { id: "g4b", titel: "Gleichungssystem", typ: "zahl", frage: <T s={`Löse mit dem Gauß-Verfahren: (I) $x + y = ${r.s}$ und (II) $x − y = ${r.d}$. Wie groß ist $x$?`} />, text: "x =", wert: (r.s + r.d) / 2, breite: 96,
          fehler: [{ wert: (r.s - r.d) / 2, text: "Das ist y. Für x addierst du die Gleichungen: 2x = " + (r.s + r.d) + "." }],
          hinweise: ["I + II ergibt 2x."], erklaerung: <T s={`$2x = ${r.s} + ${r.d} = ${r.s + r.d}$, also $x = ${(r.s + r.d) / 2}$`} /> },
        { id: "g4c", titel: "Streuung ablesen", typ: "zahl", frage: <T s="Eine Glocke hat $\mu = 100$ und ihre Wendestellen liegen bei 85 und 115. Wie groß ist $\sigma$?" />, text: "σ =", wert: 15, breite: 96,
          fehler: [{ wert: 30, text: "30 ist der Abstand der beiden Wendestellen. σ ist der Abstand von μ zu einer Wendestelle, also die Hälfte." }],
          hinweise: ["Wendestellen bei μ − σ und μ + σ."], erklaerung: <T s="$100 + \sigma = 115$, also $\sigma = 15$ (wie bei den IQ-Werten)." /> },
      ],
    },
  ];
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
/* s und d haben dieselbe Parität, damit x und y ganzzahlig sind */
export const GAUSS_ZUFALL = () => ({ n: pick([20, 30, 40, 50, 60]), s: pick([10, 12, 14, 16]), d: pick([2, 4, 6]) });

export function GaussModul({ onZurueck }) {
  const r = useMemo(GAUSS_ZUFALL, []);
  const phasen = useMemo(() => bauePhasen(r), [r]);
  return (
    <EntdeckenModul id={ID} phasen={phasen} onZurueck={onZurueck}
      titel="Entdecke Carl Friedrich Gauß – drei Ideen auf einem Schein"
      untertitel="Vier Phasen: die Summenformel des kleinen Gauß, das Gauß-Verfahren und die Glocke vom Zehn-Mark-Schein. Jede Idee baust du selbst auf."
      abschlussTitel="Du hast drei Ideen von Gauß entdeckt."
      abschlussText="Eine Treppe, zwei Gleichungen und eine Glocke – und alle drei stecken noch heute in Schule und Studium."
      abschlussFormel={["1 + 2 + \\ldots + n = \\frac{n(n+1)}{2}", "\\varphi(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} \\cdot e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}"]} />
  );
}
export const GAUSS_PHASEN = ["Summenformel", "Gauß-Verfahren", "Glocke", "Alles zusammen"];
export { bauePhasen as gaussPhasen };
