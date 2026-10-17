/* ======================================================================
   ENTDECKE DIE BINOMISCHEN FORMELN – AUS FLÄCHEN GEBAUT
   Vierphasiges Lernmodul in „Mathe entdecken“ (Kennung „binomisch“):
     1 (a + b)² als Quadrat aus vier Teilflächen
     2 (a − b)² – Streifen abschneiden, Ecke zurückgeben
     3 (a + b)(a − b) – ein L umlegen zum Rechteck
     4 Anwenden: Kopfrechnen und Faktorisieren
   Jede Formel entsteht aus einem Bild mit Reglern; die Schritte prüfen
   Zahlenwerte und benennen typische Fehler (a² + b², vergessenes 2ab,
   falsches Vorzeichen bei b²).
   ====================================================================== */
import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { Aufforderung, BildKarte, EntdeckenModul, Regler, T } from "./funcEntdeckenModul.jsx";

const ID = "binomisch";
const GOLD = "#FFF1BF", BLAU = "#D6E4F7", GRUEN = "#D7F0E3", ROSA = "#F7D3E0";
const svgStil = { width: "100%", maxWidth: 340, display: "block", margin: "0 auto" };
const txt = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700 };
const opt = (liste) => liste.map(([id, s]) => [id, <T key={id} s={s} />]);

function Feld({ x, y, w, h, fuell, name, wert, s }) {
  if (w <= 0 || h <= 0) return null;
  const klein = Math.min(w, h) < 26;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={fuell} stroke={C.tinte} strokeWidth="1.4" />
      {!klein && <text x={x + w / 2} y={y + h / 2 + (wert ? -2 : 5)} textAnchor="middle" style={{ ...txt, fontSize: s || 15, fill: C.tinte }}>{name}</text>}
      {!klein && wert && <text x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle" style={{ ...txt, fontSize: 11.5, fontWeight: 600, fill: C.grau }}>{wert}</text>}
    </g>
  );
}

/* ---------- Phase 1 ---------- */
function PlusBild() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const s = 230 / (a + b), x0 = 60, y0 = 24, A = a * s, B = b * s;
  return (
    <BildKarte>
      <Aufforderung>Verändere a und b: Die vier Teile füllen immer genau das große Quadrat.</Aufforderung>
      <svg viewBox="0 0 340 290" style={svgStil} role="img" aria-label="Quadrat mit Seite a plus b, zerlegt in a², zweimal ab und b²">
        <Feld x={x0} y={y0} w={A} h={A} fuell={GOLD} name="a²" wert={`${a * a}`} />
        <Feld x={x0 + A} y={y0} w={B} h={A} fuell={BLAU} name="ab" wert={`${a * b}`} />
        <Feld x={x0} y={y0 + A} w={A} h={B} fuell={BLAU} name="ab" wert={`${a * b}`} />
        <Feld x={x0 + A} y={y0 + A} w={B} h={B} fuell={GRUEN} name="b²" wert={`${b * b}`} />
        <text x={x0 + A / 2} y={y0 - 7} textAnchor="middle" style={{ ...txt, fontSize: 13, fill: C.see }}>a = {a}</text>
        <text x={x0 + A + B / 2} y={y0 - 7} textAnchor="middle" style={{ ...txt, fontSize: 13, fill: C.smaragd }}>b = {b}</text>
        <text x={x0 - 8} y={y0 + A / 2 + 4} textAnchor="end" style={{ ...txt, fontSize: 13, fill: C.see }}>a</text>
        <text x={x0 - 8} y={y0 + A + B / 2 + 4} textAnchor="end" style={{ ...txt, fontSize: 13, fill: C.smaragd }}>b</text>
        <text x={x0 + 115} y={282} textAnchor="middle" style={{ ...txt, fontSize: 13, fill: C.tinte }}>({a} + {b})² = {(a + b) ** 2} = {a * a} + {2 * a * b} + {b * b}</text>
      </svg>
      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <Regler name="a" wert={a} setWert={setA} min={1} max={8} />
        <Regler name="b" wert={b} setWert={setB} min={1} max={6} farbe={C.smaragd} />
      </div>
    </BildKarte>
  );
}

/* ---------- Phase 2 ---------- */
function MinusBild() {
  const [a, setA] = useState(5);
  const [b, setB] = useState(2);
  const bb = Math.min(b, a - 1);
  const s = 230 / a, x0 = 60, y0 = 24, A = a * s, B = bb * s, R = A - B;
  return (
    <BildKarte>
      <Aufforderung>Vom Quadrat a² werden rechts und unten Streifen der Breite b abgeschnitten. Gesucht ist das gelbe Quadrat.</Aufforderung>
      <svg viewBox="0 0 340 290" style={svgStil} role="img" aria-label="Quadrat a² mit zwei Streifen a mal b, die sich in einem Quadrat b² überlappen">
        <Feld x={x0} y={y0} w={R} h={R} fuell={GOLD} name="(a − b)²" s={14} wert={`${(a - bb) ** 2}`} />
        <rect x={x0 + R} y={y0} width={B} height={A} fill={BLAU} opacity="0.85" stroke={C.tinte} strokeWidth="1.4" />
        <rect x={x0} y={y0 + R} width={A} height={B} fill={BLAU} opacity="0.85" stroke={C.tinte} strokeWidth="1.4" />
        <rect x={x0 + R} y={y0 + R} width={B} height={B} fill={ROSA} stroke={C.gruenDunkel} strokeWidth="2" />
        {B >= 26 && <text x={x0 + R + B / 2} y={y0 + R + B / 2 + 5} textAnchor="middle" style={{ ...txt, fontSize: 13, fill: C.gruenDunkel }}>b²</text>}
        {B >= 22 && <text x={x0 + R + B / 2} y={y0 + R / 2 + 5} textAnchor="middle" style={{ ...txt, fontSize: 12.5, fill: C.see }}>ab</text>}
        {B >= 22 && <text x={x0 + R / 2} y={y0 + R + B / 2 + 5} textAnchor="middle" style={{ ...txt, fontSize: 12.5, fill: C.see }}>ab</text>}
        <text x={x0 + A / 2} y={y0 - 7} textAnchor="middle" style={{ ...txt, fontSize: 13, fill: C.see }}>a = {a}</text>
        <text x={x0 + R + B / 2} y={y0 + A + 16} textAnchor="middle" style={{ ...txt, fontSize: 13, fill: C.smaragd }}>b = {bb}</text>
        <text x={x0 + 115} y={282} textAnchor="middle" style={{ ...txt, fontSize: 13, fill: C.tinte }}>{a * a} − {a * bb} − {a * bb} + {bb * bb} = {(a - bb) ** 2}</text>
      </svg>
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, margin: "8px 0 0" }}>Die rosa Ecke liegt in <b>beiden</b> blauen Streifen – wer zweimal a · b abzieht, nimmt sie doppelt weg.</p>
      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <Regler name="a" wert={a} setWert={(v) => { setA(v); if (b >= v) setB(v - 1); }} min={2} max={9} />
        <Regler name="b" wert={bb} setWert={setB} min={1} max={a - 1} farbe={C.smaragd} />
      </div>
    </BildKarte>
  );
}

/* ---------- Phase 3 ---------- */
function MalBild() {
  const [a, setA] = useState(5);
  const [b, setB] = useState(2);
  const [umgelegt, setUmgelegt] = useState(false);
  const bb = Math.min(b, a - 1);
  const s = 200 / (a + bb), x0 = 40, y0 = 24, A = a * s, B = bb * s, R = A - B;
  const knopf = { minHeight: 40, padding: "6px 14px", borderRadius: 999, fontFamily: "inherit", cursor: "pointer", fontSize: 13.5, fontWeight: 700, border: `1.5px solid ${C.see}`, background: umgelegt ? C.see : C.weiss, color: umgelegt ? C.weiss : C.see };
  return (
    <BildKarte>
      <Aufforderung>Aus dem Quadrat a² fehlt die Ecke b². Leg den grünen Streifen um – welche Form entsteht?</Aufforderung>
      <svg viewBox="0 0 340 290" style={svgStil} role="img" aria-label="L-förmige Fläche a² minus b², umgelegt zu einem Rechteck a plus b mal a minus b">
        {!umgelegt && <rect x={x0 + R} y={y0 + R} width={B} height={B} fill="none" stroke={C.hellgrau} strokeWidth="1.2" strokeDasharray="4 4" />}
        <Feld x={x0} y={y0} w={A} h={R} fuell={GOLD} name="a · (a − b)" s={13} />
        {umgelegt
          ? <g style={{ transition: "all .4s" }}><Feld x={x0 + A} y={y0} w={B} h={R} fuell={GRUEN} name="" /></g>
          : <Feld x={x0} y={y0 + R} w={R} h={B} fuell={GRUEN} name="" />}
        <text x={x0 + (umgelegt ? A + B : A) / 2} y={y0 - 7} textAnchor="middle" style={{ ...txt, fontSize: 13, fill: C.see }}>{umgelegt ? `a + b = ${a + bb}` : `a = ${a}`}</text>
        <text x={x0 - 6} y={y0 + R / 2 + 4} textAnchor="end" style={{ ...txt, fontSize: 12, fill: C.see }}>a − b</text>
        {!umgelegt && <text x={x0 + R + B / 2} y={y0 + R + B / 2 + 5} textAnchor="middle" style={{ ...txt, fontSize: 12, fill: C.hellgrau }}>b²</text>}
        <text x={170} y={282} textAnchor="middle" style={{ ...txt, fontSize: 13, fill: C.tinte }}>
          {umgelegt ? `(${a} + ${bb}) · (${a} − ${bb}) = ${(a + bb) * (a - bb)}` : `${a}² − ${bb}² = ${a * a} − ${bb * bb} = ${a * a - bb * bb}`}
        </text>
      </svg>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
        <button type="button" aria-pressed={umgelegt} onClick={() => setUmgelegt(!umgelegt)} style={knopf}>{umgelegt ? "Zurücklegen" : "Streifen umlegen"}</button>
      </div>
      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <Regler name="a" wert={a} setWert={(v) => { setA(v); if (b >= v) setB(v - 1); }} min={2} max={9} />
        <Regler name="b" wert={bb} setWert={setB} min={1} max={a - 1} farbe={C.smaragd} />
      </div>
    </BildKarte>
  );
}

/* ---------- Phase 4: Formelkarte ---------- */
function FormelKarte() {
  const z = { fontSize: 17, color: C.tinte, padding: "6px 0", borderBottom: `1px solid ${C.linie}` };
  return (
    <BildKarte>
      <Aufforderung>Deine drei Formeln – jetzt als Werkzeug zum Kopfrechnen und Faktorisieren.</Aufforderung>
      <div style={z}><T s="$(a + b)^2 = a^2 + 2ab + b^2$" /></div>
      <div style={z}><T s="$(a − b)^2 = a^2 − 2ab + b^2$" /></div>
      <div style={{ ...z, borderBottom: "none" }}><T s="$(a + b)(a − b) = a^2 − b^2$" /></div>
    </BildKarte>
  );
}

function bauePhasen(r) {
  return [
    {
      titel: "(a + b)² – ein Quadrat aus vier Teilen",
      intro: "Wie groß ist ein Quadrat mit der Seite $a + b$? Statt zu rechnen, zerlegen wir es: Jede Seite besteht aus einem Stück a und einem Stück b.",
      bild: <PlusBild />,
      fertig: "Geschafft: Das Quadrat besteht aus a², zweimal ab und b². Das ist die erste binomische Formel.",
      schritte: [
        { id: "b1a", titel: "Ganzes Quadrat", typ: "zahl", frage: <T s="Stelle $a = 3$ und $b = 2$ ein. Wie groß ist das ganze Quadrat $(3 + 2)^2$?" />, text: "Fläche:", wert: 25, breite: 96,
          fehler: [{ wert: 13, text: "13 ist 3² + 2² – da fehlen die beiden blauen Rechtecke." }, { wert: 10, text: "10 ist 2 · 5. Die Seite ist 5, die Fläche 5 · 5." }],
          hinweise: ["Die Seite ist 3 + 2 = 5."], erklaerung: <T s="$(3+2)^2 = 5^2 = 25$." /> },
        { id: "b1b", titel: "Die vier Teile", typ: "zahl", frage: "Addiere die vier Teilflächen im Bild: gelb + blau + blau + grün.", text: "Summe:", wert: 25, breite: 96,
          fehler: [{ wert: 19, text: "Du hast nur ein blaues Rechteck gezählt. Es gibt zwei davon." }, { wert: 13, text: "Die blauen Rechtecke fehlen." }],
          hinweise: ["9 + 6 + 6 + 4"], erklaerung: <T s="$9 + 6 + 6 + 4 = 25$ – genau das ganze Quadrat." /> },
        { id: "b1c", titel: "Die Formel", typ: "wahl", frage: <T s="Welche Formel beschreibt das Bild für beliebige $a$ und $b$?" />, richtig: "r",
          optionen: opt([["f", "$(a+b)^2 = a^2 + b^2$"], ["r", "$(a+b)^2 = a^2 + 2ab + b^2$"], ["g", "$(a+b)^2 = a^2 + ab + b^2$"]]),
          fehler: [{ wahl: "f", text: "Der häufigste Fehler überhaupt: Die beiden blauen Rechtecke fehlen. Prüfe mit 3 und 2: 25 ≠ 13." }, { wahl: "g", text: "Es gibt zwei blaue Rechtecke, also 2ab." }],
          hinweise: ["Zähle die Teile im Bild: ein gelbes, zwei blaue, ein grünes."], erklaerung: <T s="$(a+b)^2 = a^2 + 2ab + b^2$" /> },
        { id: "b1d", titel: "Mit Variablen", typ: "wahl", frage: <T s="Multipliziere $(x + 4)^2$ aus." />, richtig: "r",
          optionen: opt([["f", "$x^2 + 16$"], ["g", "$x^2 + 4x + 16$"], ["r", "$x^2 + 8x + 16$"]]),
          fehler: [{ wahl: "f", text: "Das mittlere Glied 2 · x · 4 fehlt." }, { wahl: "g", text: "Das mittlere Glied ist 2ab = 2 · x · 4 = 8x." }],
          hinweise: ["a = x, b = 4: a² + 2ab + b²"], erklaerung: <T s="$x^2 + 2\cdot x\cdot 4 + 4^2 = x^2 + 8x + 16$" /> },
      ],
    },
    {
      titel: "(a − b)² – zweimal abgeschnitten, einmal zurück",
      intro: "Jetzt wird es kleiner: Vom Quadrat mit der Seite $a$ schneiden wir rechts und unten je einen Streifen der Breite $b$ ab. Übrig bleibt ein Quadrat mit der Seite $a − b$.",
      bild: <MinusBild />,
      fertig: "Geschafft: (a − b)² = a² − 2ab + b². Das +b² gibt die Ecke zurück, die doppelt abgezogen wurde.",
      schritte: [
        { id: "b2a", titel: "Gelbes Quadrat", typ: "zahl", frage: <T s="Mit $a = 5$ und $b = 2$: Wie groß ist $(5 − 2)^2$?" />, text: "Fläche:", wert: 9, breite: 96,
          fehler: [{ wert: 21, text: "21 ist 5² − 2². Das wäre die dritte Formel, nicht (5 − 2)²." }],
          hinweise: ["Die Seite ist 5 − 2 = 3."], erklaerung: <T s="$(5−2)^2 = 3^2 = 9$" /> },
        { id: "b2b", titel: "Nur abziehen?", typ: "zahl", frage: "Rechne 25 − 10 − 10, also a² minus zwei Streifen a · b.", text: "Ergebnis:", wert: 5, breite: 96,
          hinweise: ["25 − 20"], erklaerung: "25 − 10 − 10 = 5 – das ist zu wenig, gelb ist 9." },
        { id: "b2c", titel: "Warum zu wenig?", typ: "wahl", frage: "Warum fehlen genau 4 = b²?", richtig: "r",
          optionen: [["r", "Die rosa Ecke liegt in beiden Streifen und wurde zweimal abgezogen."], ["f", "Die Streifen sind eigentlich schmaler als b."], ["g", "Man muss a² verdoppeln."]],
          fehler: [{ wahl: "f", text: "Die Streifen sind genau b breit. Schau auf die rosa Ecke: Sie gehört zu beiden Streifen." }, { wahl: "g", text: "a² ist das große Quadrat, das bleibt einmal." }],
          hinweise: ["Wo überlappen sich die beiden blauen Streifen?"], erklaerung: "Die Ecke b² wurde doppelt abgezogen – also einmal + b² zurückgeben." },
        { id: "b2d", titel: "Die Formel", typ: "wahl", frage: "Welche Formel stimmt?", richtig: "r",
          optionen: opt([["f", "$(a−b)^2 = a^2 − b^2$"], ["g", "$(a−b)^2 = a^2 − 2ab − b^2$"], ["r", "$(a−b)^2 = a^2 − 2ab + b^2$"]]),
          fehler: [{ wahl: "f", text: "Das mittlere Glied fehlt. Prüfe: (5 − 2)² = 9, aber 25 − 4 = 21." }, { wahl: "g", text: "Vorzeichen bei b²: Die Ecke wird zurückgegeben, also + b². Prüfe: 25 − 20 − 4 = 1 ≠ 9." }],
          hinweise: ["a² − 2ab und dann die doppelt abgezogene Ecke zurück."], erklaerung: <T s="$(a−b)^2 = a^2 − 2ab + b^2$" /> },
      ],
    },
    {
      titel: "(a + b)(a − b) – das L wird zum Rechteck",
      intro: "Die dritte Formel verbindet ein Produkt mit einer Differenz von Quadraten. Aus dem Quadrat $a^2$ fehlt die Ecke $b^2$ – übrig bleibt ein L.",
      bild: <MalBild />,
      fertig: "Geschafft: Das L hat die Fläche a² − b². Umgelegt ist es ein Rechteck mit den Seiten a + b und a − b.",
      schritte: [
        { id: "b3a", titel: "Fläche des L", typ: "zahl", frage: <T s="Mit $a = 5$ und $b = 2$: Wie groß ist die L-Fläche $a^2 − b^2$?" />, text: "Fläche:", wert: 21, breite: 96,
          fehler: [{ wert: 9, text: "9 ist (5 − 2)². Hier fehlt nur die Ecke b² = 4." }],
          hinweise: ["25 − 4"], erklaerung: <T s="$25 − 4 = 21$" /> },
        { id: "b3b", titel: "Seiten nach dem Umlegen", typ: "wahl", frage: "Leg den grünen Streifen um. Welche Seiten hat das Rechteck?", richtig: "r",
          optionen: opt([["r", "$a + b$ und $a − b$"], ["f", "$a$ und $a − b$"], ["g", "$a + b$ und $b$"]]),
          fehler: [{ wahl: "f", text: "Der Streifen hängt sich rechts an – die Breite wächst um b." }, { wahl: "g", text: "Die Höhe ist die des gelben Streifens: a − b." }],
          hinweise: ["Breite: a plus der Streifen b. Höhe: unverändert."], erklaerung: <T s="Breite $a + b$, Höhe $a − b$." /> },
        { id: "b3c", titel: "Probe", typ: "zahl", frage: <T s="Rechne $(5 + 2)\cdot(5 − 2)$." />, text: "Produkt:", wert: 21, breite: 96,
          hinweise: ["7 · 3"], erklaerung: <T s="$7\cdot 3 = 21 = 5^2 − 2^2$ ✓" /> },
        { id: "b3d", titel: "Mit Variablen", typ: "wahl", frage: <T s="Multipliziere $(x + 6)(x − 6)$ aus." />, richtig: "r",
          optionen: opt([["f", "$x^2 − 12x − 36$"], ["r", "$x^2 − 36$"], ["g", "$x^2 + 36$"]]),
          fehler: [{ wahl: "f", text: "+6x und −6x heben sich auf – es bleibt kein x-Glied." }, { wahl: "g", text: "6 · (−6) = −36." }],
          hinweise: ["a² − b² mit a = x, b = 6."], erklaerung: <T s="$x^2 − 6^2 = x^2 − 36$" /> },
      ],
    },
    {
      titel: "Anwenden: Kopfrechnen und Faktorisieren",
      intro: "Die Formeln funktionieren in beide Richtungen. Von links nach rechts helfen sie beim Kopfrechnen, von rechts nach links beim Faktorisieren.",
      bild: <FormelKarte />,
      fertig: "Geschafft: Du rechnest Quadrate im Kopf und erkennst binomische Formeln auch rückwärts.",
      abschluss: <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.65, margin: 0 }}>Weiter geht es im Werkzeug <b>Terme und Potenzgesetze</b> (Modus „Binomische Formeln“) – dort bekommst du beliebig viele Aufgaben.</p>,
      schritte: [
        { id: "b4a", titel: `${r.p}² im Kopf`, typ: "zahl", frage: <T s={`$${r.p}^2 = (${r.p - 1} + 1)^2$. Rechne mit der ersten Formel.`} />, text: `${r.p}² =`, wert: r.p * r.p, breite: 104,
          fehler: [{ wert: (r.p - 1) ** 2 + 1, text: "Das mittlere Glied 2 · a · 1 fehlt." }],
          hinweise: [<T key="h" s={`$${r.p - 1}^2 + 2\\cdot ${r.p - 1}\\cdot 1 + 1^2$`} />], erklaerung: <T s={`$${(r.p - 1) ** 2} + ${2 * (r.p - 1)} + 1 = ${r.p * r.p}$`} /> },
        { id: "b4b", titel: `${r.m}² im Kopf`, typ: "zahl", frage: <T s={`$${r.m}^2 = (${r.m + 1} − 1)^2$. Rechne mit der zweiten Formel.`} />, text: `${r.m}² =`, wert: r.m * r.m, breite: 104,
          fehler: [{ wert: (r.m + 1) ** 2 - 1, text: "Das mittlere Glied −2 · a · 1 fehlt." }, { wert: (r.m + 1) ** 2 - 2 * (r.m + 1) - 1, text: "Vorzeichen: + 1² am Ende." }],
          hinweise: [<T key="h" s={`$${r.m + 1}^2 − 2\\cdot ${r.m + 1} + 1$`} />], erklaerung: <T s={`$${(r.m + 1) ** 2} − ${2 * (r.m + 1)} + 1 = ${r.m * r.m}$`} /> },
        { id: "b4c", titel: "Produkt im Kopf", typ: "zahl", frage: <T s={`$${r.z + r.d}\\cdot ${r.z - r.d} = (${r.z} + ${r.d})(${r.z} − ${r.d})$`} />, text: "Produkt =", wert: r.z * r.z - r.d * r.d, breite: 104,
          fehler: [{ wert: r.z * r.z + r.d * r.d, text: "Minus: a² − b²." }],
          hinweise: [<T key="h" s={`$${r.z}^2 − ${r.d}^2$`} />], erklaerung: <T s={`$${r.z * r.z} − ${r.d * r.d} = ${r.z * r.z - r.d * r.d}$`} /> },
        { id: "b4d", titel: "Rückwärts: faktorisieren", typ: "wahl", frage: <T s={`Schreibe $x^2 − ${2 * r.f}x + ${r.f * r.f}$ als Produkt.`} />, richtig: "r",
          optionen: opt([["r", `$(x − ${r.f})^2$`], ["f", `$(x + ${r.f})^2$`], ["g", `$(x − ${r.f})(x + ${r.f})$`]]),
          fehler: [{ wahl: "f", text: `Das mittlere Glied ist negativ – also zweite Formel.` }, { wahl: "g", text: `Das ergäbe x² − ${r.f * r.f} ohne x-Glied.` }],
          hinweise: [<T key="h" s={`$${r.f * r.f} = ${r.f}^2$ und $${2 * r.f}x = 2\\cdot x\\cdot ${r.f}$`} />], erklaerung: <T s={`$x^2 − ${2 * r.f}x + ${r.f * r.f} = (x − ${r.f})^2$`} /> },
        { id: "b4e", titel: "Differenz von Quadraten", typ: "wahl", frage: <T s={`Faktorisiere $${r.k * r.k}x^2 − ${r.q * r.q}$.`} />, richtig: "r",
          optionen: opt([["f", `$(${r.k}x − ${r.q})^2$`], ["r", `$(${r.k}x + ${r.q})(${r.k}x − ${r.q})$`], ["g", `$${r.k * r.k}(x − ${r.q})(x + ${r.q})$`]]),
          fehler: [{ wahl: "f", text: "Ein Quadrat hätte ein x-Glied. Hier steht a² − b²." }, { wahl: "g", text: `Ausmultipliziert ergäbe das ${r.k * r.k}x² − ${r.k * r.k * r.q * r.q}.` }],
          hinweise: [<T key="h" s={`$${r.k * r.k}x^2 = (${r.k}x)^2$, $${r.q * r.q} = ${r.q}^2$`} />], erklaerung: <T s={`$(${r.k}x)^2 − ${r.q}^2 = (${r.k}x + ${r.q})(${r.k}x − ${r.q})$`} /> },
      ],
    },
  ];
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const BINOMISCH_ZUFALL = () => ({ p: pick([21, 31, 41, 51, 61, 71]), m: pick([19, 29, 39, 49, 59, 99]), z: pick([20, 30, 40, 50]), d: pick([1, 2, 3, 4]), f: pick([3, 4, 5, 6, 7]), k: pick([2, 3]), q: pick([5, 7]) });

export function BinomischModul({ onZurueck }) {
  const r = useMemo(BINOMISCH_ZUFALL, []);
  const phasen = useMemo(() => bauePhasen(r), [r]);
  return (
    <EntdeckenModul id={ID} phasen={phasen} onZurueck={onZurueck}
      titel="Entdecke die binomischen Formeln – aus Flächen gebaut"
      untertitel="Vier Phasen: Jede Formel entsteht aus einem Bild, das du selbst veränderst. Am Ende rechnest du Quadrate im Kopf."
      abschlussTitel="Du hast alle drei binomischen Formeln entdeckt."
      abschlussText="Aus Quadraten und Rechtecken – nicht auswendig gelernt, sondern selbst gesehen."
      abschlussFormel={["(a + b)^2 = a^2 + 2ab + b^2", "(a − b)^2 = a^2 − 2ab + b^2", "(a + b)(a − b) = a^2 − b^2"]} />
  );
}
export const BINOMISCH_PHASEN = ["(a + b)²", "(a − b)²", "(a + b)(a − b)", "Anwenden"];
export { bauePhasen as binomischPhasen };
