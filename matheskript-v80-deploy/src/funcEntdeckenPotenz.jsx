import React, { useEffect, useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M, Formel } from "./func3.jsx";
import { GrosserKnopf, KleinerLink, Rueck, karte } from "./ui2.jsx";
import { Aufklapp, FunktionsBild, SchrittFolge, zt } from "./ui3.jsx";
import { PHASEN_ANZAHL, entdeckenStand, potenzFertigSetzen, potenzPhaseSetzen, potenzStandSetzen, potenzZuruecksetzen } from "./entdeckenSpeicher.js";

/* ======================================================================
   ENTDECKE DIE POTENZREGEL – VOM PASCALSCHEN DREIECK ZUR ABLEITUNG
   Siebenphasiges, interaktives Lernmodul (Teil von „Mathe entdecken“):
     1 Die erste binomische Formel
     2 Die Entwicklung der dritten Potenz
     3 Das Pascalsche Dreieck entdecken
     4 Die allgemeine binomische Formel
     5 Der Differenzenquotient
     6 Die Potenzregel selbst herleiten
     7 Die Potenzregel anwenden und überprüfen
   Jede Phase: kurze Einführung, ein Schaubild zum Ausprobieren und geführte
   Schritte (Eingabe oder Auswahl, gestufte Hinweise, gezielte Rückmeldung bei
   typischen Denkfehlern, Lösung nur auf Wunsch). Der Stand wird je Schritt
   gespeichert (entdeckenSpeicher.js).
   ====================================================================== */

/* Text mit Formeln zwischen $ … $ (als Fließtext, ohne eigenen Absatz) */
const T = ({ s }) => (
  <>{String(s).split("$").map((x, i) => (i % 2 ? <M key={i} t={x} /> : <span key={i}>{x}</span>))}</>
);

/* ---------- Mathematik ---------- */
export const pascalZeile = (n) => {
  let r = [1];
  for (let i = 0; i < n; i++) {
    const s = [1];
    for (let k = 1; k < r.length; k++) s.push(r[k - 1] + r[k]);
    s.push(1);
    r = s;
  }
  return r;
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const mische = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* (a+b)^n als TeX: Koeffizienten aus dem Pascalschen Dreieck */
const entwicklungTex = (n) => {
  const z = pascalZeile(n);
  const teile = z.map((c, k) => {
    const pa = n - k, pb = k;
    const koef = c === 1 && (pa > 0 || pb > 0) ? "" : String(c);
    const a = pa === 0 ? "" : pa === 1 ? "a" : `a^{${pa}}`;
    const b = pb === 0 ? "" : pb === 1 ? "b" : `b^{${pb}}`;
    return `${koef}${a}${b}` || "1";
  });
  return `(a+b)^{${n}} = ${teile.join(" + ")}`;
};

/* ---------- kleine Bedienelemente ---------- */
function Zaehler({ label, wert, setWert, min, max, anzeige }) {
  const knopf = (t, d, lab) => (
    <button type="button" aria-label={lab} disabled={wert + d < min || wert + d > max} onClick={() => setWert(wert + d)}
      style={{ width: 44, height: 44, borderRadius: 12, border: `1.5px solid ${C.see}`, background: C.weiss, color: C.see, fontSize: 20, fontWeight: 700,
        fontFamily: "inherit", cursor: "pointer", opacity: wert + d < min || wert + d > max ? 0.35 : 1 }}>{t}</button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: C.grau, minWidth: 28 }}>{label}</span>
      {knopf("−", -1, `${label} verkleinern`)}
      <span style={{ minWidth: 34, textAlign: "center", fontSize: 17, fontWeight: 700, color: C.tinte }}>{anzeige ?? wert}</span>
      {knopf("+", 1, `${label} vergrößern`)}
    </div>
  );
}

const Aufforderung = ({ children }) => <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "0 0 10px" }}>{children}</p>;
const BildKarte = ({ children }) => <div style={{ ...karte, padding: 16, marginTop: 14 }}>{children}</div>;

/* ---------- Phase 1: Quadrat aus Teilflächen ---------- */
function QuadratBild() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const g = a + b, s = 200 / g, x0 = 40, y0 = 26;
  const feld = (x, y, w, h, fuell, rand, name, wert) => (
    <g>
      <rect x={x0 + x} y={y0 + y} width={w} height={h} fill={fuell} stroke={rand} strokeWidth="1.5" />
      <text x={x0 + x + w / 2} y={y0 + y + h / 2 + (Math.min(w, h) > 44 ? -2 : 5)} textAnchor="middle" fontSize="14" fontWeight="700" fill={C.tinte}>{name}</text>
      {Math.min(w, h) > 44 && <text x={x0 + x + w / 2} y={y0 + y + h / 2 + 15} textAnchor="middle" fontSize="11.5" fill={C.grau}>{wert}</text>}
    </g>
  );
  return (
    <BildKarte>
      <Aufforderung>Verändere a und b und beobachte die vier Teilflächen des großen Quadrats.</Aufforderung>
      <svg viewBox="0 0 280 250" role="img" aria-label="Quadrat mit Seitenlänge a plus b, zerlegt in vier Teilflächen" style={{ width: "100%", maxWidth: 340, display: "block", margin: "0 auto" }}>
        {feld(0, 0, a * s, a * s, "#D6E4F7", C.see, "a²", a * a)}
        {feld(a * s, 0, b * s, a * s, "#FFF1BF", C.flaggold, "ab", a * b)}
        {feld(0, a * s, a * s, b * s, "#FFF1BF", C.flaggold, "ab", a * b)}
        {feld(a * s, a * s, b * s, b * s, "#F7D3E0", C.gruen, "b²", b * b)}
        <text x={x0 + (a * s) / 2} y={y0 - 8} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.see}>a</text>
        <text x={x0 + a * s + (b * s) / 2} y={y0 - 8} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.gruen}>b</text>
        <text x={x0 - 10} y={y0 + (a * s) / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.see}>a</text>
        <text x={x0 - 10} y={y0 + a * s + (b * s) / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.gruen}>b</text>
      </svg>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", marginTop: 12 }}>
        <Zaehler label="a" wert={a} setWert={setA} min={1} max={6} />
        <Zaehler label="b" wert={b} setWert={setB} min={1} max={6} />
      </div>
      <div style={{ textAlign: "center", fontSize: 16, marginTop: 12, overflowX: "auto" }}>
        <T s={"$(" + a + "+" + b + ")^2 = " + a * a + " + " + 2 * a * b + " + " + b * b + " = " + (a + b) ** 2 + "$"} />
      </div>
    </BildKarte>
  );
}

/* ---------- Phase 2: Kästchen-Multiplikation (auf Wunsch) ---------- */
function Kaestchen() {
  const zelle = (t, f) => <div style={{ background: f, borderRadius: 8, padding: "8px 4px", textAlign: "center", fontSize: 15 }}><M t={t} /></div>;
  const k0 = "#D6E4F7", k1 = "#FFF1BF", k2 = "#F7D3E0", k3 = "#E4E8F0";
  const kopf = (t) => <div style={{ textAlign: "center", fontSize: 14, fontWeight: 700, color: C.see, padding: "6px 0" }}><M t={t} /></div>;
  return (
    <Aufklapp titel="Hilfe: Ausmultiplizieren im Kästchenraster">
      <p style={{ margin: "0 0 10px", color: C.grau }}>Jeder Summand der ersten Klammer wird mit jedem Summanden der zweiten multipliziert. Gleiche Farben bedeuten gleiche Sorte von Termen.</p>
      <div style={{ display: "grid", gridTemplateColumns: "36px repeat(3, minmax(0, 1fr))", gap: 6, alignItems: "stretch" }}>
        <div />{kopf("a^2")}{kopf("2ab")}{kopf("b^2")}
        {kopf("a")}{zelle("a^3", k0)}{zelle("2a^2b", k1)}{zelle("ab^2", k2)}
        {kopf("b")}{zelle("a^2b", k1)}{zelle("2ab^2", k2)}{zelle("b^3", k3)}
      </div>
    </Aufklapp>
  );
}

/* ---------- Phase 3: Pascalsches Dreieck zum Antippen ---------- */
function Dreieck({ start = 4, max = 9, auswahlHinweis = true }) {
  const [zeilen, setZeilen] = useState(start);
  const [sel, setSel] = useState(null);       // [zeile, stelle]
  const W = 360, dx = 36, dy = 34, T0 = 22;
  const H = T0 + zeilen * dy;
  const zl = Array.from({ length: zeilen }, (_, i) => pascalZeile(i));
  const pos = (i, k) => [W / 2 + (k - i / 2) * dx + 8, T0 + i * dy];
  const eltern = (i, k) => {
    if (i === 0) return [];
    const r = [];
    if (k - 1 >= 0) r.push([i - 1, k - 1]);
    if (k <= i - 1) r.push([i - 1, k]);
    return r;
  };
  const istEltern = (i, k) => sel && eltern(sel[0], sel[1]).some(([a, b]) => a === i && b === k);
  const erklaerung = () => {
    if (!sel) return "Tippe auf eine Zahl im Dreieck.";
    const [i, k] = sel, v = zl[i][k], e = eltern(i, k);
    if (e.length === 2) return "$" + v + " = " + zl[e[0][0]][e[0][1]] + " + " + zl[e[1][0]][e[1][1]] + "$";
    return i === 0 ? "Ganz oben beginnt das Dreieck mit einer 1." : "Am Rand steht immer eine 1.";
  };
  return (
    <BildKarte>
      <Aufforderung>{auswahlHinweis ? "Tippe auf eine Zahl und sieh, woher sie kommt. Mit „Zeile hinzufügen“ wächst das Dreieck." : "Das Pascalsche Dreieck."}</Aufforderung>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Pascalsches Dreieck" style={{ width: "100%", display: "block" }}>
        {zl.map((z, i) => (
          <g key={i}>
            <text x="8" y={T0 + i * dy + 4.5} fontSize="11" fill={C.hellgrau}>{i}</text>
            {z.map((v, k) => {
              const [x, y] = pos(i, k);
              const s = sel && sel[0] === i && sel[1] === k, e = istEltern(i, k);
              return (
                <g key={k} onClick={() => setSel(s ? null : [i, k])} style={{ cursor: "pointer" }} role="button" aria-label={`Zeile ${i}, Stelle ${k}: ${v}`}>
                  <rect x={x - dx / 2} y={y - dy / 2} width={dx} height={dy} fill="transparent" />
                  <circle cx={x} cy={y} r="14.5" fill={s ? C.gruen : e ? C.flaggold : "#E8F0FB"} stroke={s ? C.gruen : e ? C.flaggold : "#B9CBE6"} strokeWidth="1.2" />
                  <text x={x} y={y + 4.5} textAnchor="middle" fontSize={String(v).length > 2 ? 11 : 13} fontWeight="700" fill={s ? C.weiss : e ? C.seeTief : C.see}>{v}</text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
      <div style={{ minHeight: 30, textAlign: "center", fontSize: 16, marginTop: 6 }} aria-live="polite"><T s={erklaerung()} /></div>
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <div style={{ flex: 1 }}><GrosserKnopf ghost disabled={zeilen >= max} onClick={() => { setZeilen(zeilen + 1); }}>Zeile hinzufügen</GrosserKnopf></div>
        <div style={{ flex: 1 }}><GrosserKnopf ghost disabled={zeilen <= 2} onClick={() => { setZeilen(zeilen - 1); setSel(null); }}>Zeile entfernen</GrosserKnopf></div>
      </div>
    </BildKarte>
  );
}

/* ---------- Phase 4: Entwicklung (a+b)^n neben der Dreieckszeile ---------- */
function Entwicklung() {
  const [n, setN] = useState(5);
  const z = pascalZeile(n);
  return (
    <BildKarte>
      <Aufforderung>Wähle den Exponenten n und vergleiche die Zahlen vor den Termen mit Zeile n des Dreiecks.</Aufforderung>
      <Zaehler label="n" wert={n} setWert={setN} min={0} max={7} />
      <div style={{ fontSize: 16, margin: "14px 0 10px", overflowX: "auto", lineHeight: 2 }}><M t={entwicklungTex(n)} /></div>
      <p style={{ margin: 0, fontSize: 13.5, color: C.grau }}>Zeile {n} im Dreieck: <b style={{ color: C.tinte }}>{z.join(" · ")}</b></p>
    </BildKarte>
  );
}

/* ---------- Phase 5 und 7: Sekante und Differenzenquotient ---------- */
const H_WERTE = [1, 0.5, 0.25, 0.1, 0.01, 0.001, 0.0001];
const hoch = (n) => ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"][n] || `^${n}`;
const dq = (n, x, h) => ((x + h) ** n - x ** n) / h;
const hText = (h) => String(h).replace(".", ",");

function Sekante({ n0 = 3, x00 = 2, mitBild = true }) {
  const [n, setN] = useState(n0);
  const [x, setX] = useState(x00);
  const [hi, setHi] = useState(0);
  const h = H_WERTE[hi];
  const q = dq(n, x, h), t = n * x ** (n - 1);
  const f = (u) => u ** n, y0 = f(x);
  return (
    <BildKarte>
      <Aufforderung>Schiebe h nach rechts. Der Punkt Q rückt an P heran – und die Sekante dreht sich.</Aufforderung>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginBottom: 12 }}>
        <Zaehler label="n" wert={n} setWert={setN} min={2} max={5} />
        <Zaehler label="x" wert={x} setWert={setX} min={1} max={3} />
      </div>
      {mitBild && (
        <FunktionsBild x0={Math.max(0, x - 1.5)} x1={x + 1.5} hoehe={210}
          kurven={[
            { f, farbe: C.see, name: `f(x) = x${hoch(n)}` },
            { f: (u) => y0 + t * (u - x), farbe: C.hellgrau, gestrichelt: true, breite: 1.6 },
            { f: (u) => y0 + q * (u - x), farbe: C.gruen, breite: 2.2 },
          ]}
          punkte={[{ x, y: y0, farbe: C.tinte, name: "P" }, { x: x + h, y: f(x + h), farbe: C.gruen, name: "Q" }]} />
      )}
      <label style={{ display: "block", marginTop: 12, fontSize: 13.5, fontWeight: 600, color: C.grau }}>
        Abstand h = <b style={{ color: C.tinte }}>{hText(h)}</b>
        <input type="range" min="0" max={H_WERTE.length - 1} step="1" value={hi} onChange={(e) => setHi(Number(e.target.value))} aria-label="Abstand h"
          style={{ width: "100%", accentColor: C.see, height: 36 }} />
      </label>
      <div style={{ background: C.sand, borderRadius: 12, padding: "10px 14px", marginTop: 6, fontSize: 14.5, lineHeight: 1.8 }}>
        <div>Differenzenquotient: <b style={{ color: C.gruenDunkel }}>{zt(q, 4)}</b></div>
        <div style={{ color: C.grau }}>Steigung der Tangente (Ziel): <b style={{ color: C.tinte }}>{zt(t, 4)}</b></div>
      </div>
    </BildKarte>
  );
}

/* ---------- Phase 7: Rechenprobe ---------- */
function Rechenprobe({ n, x }) {
  const t = n * x ** (n - 1);
  return (
    <BildKarte>
      <Aufforderung>Rechenprobe: Stimmt die Regel mit dem Differenzenquotienten überein?</Aufforderung>
      <p style={{ margin: "0 0 10px", fontSize: 14, color: C.grau }}>Für <T s={"$f(x)=x^" + n + "$"} /> an der Stelle <T s={"$x=" + x + "$"} />:</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 14 }}>
        <div style={{ fontWeight: 700, color: C.see }}>Abstand h</div><div style={{ fontWeight: 700, color: C.see }}>Differenzenquotient</div>
        {[0.1, 0.01, 0.001].map((h) => (
          <React.Fragment key={h}><div>{hText(h)}</div><div>{zt(dq(n, x, h), 4)}</div></React.Fragment>
        ))}
        <div style={{ fontWeight: 700, color: C.gruenDunkel, borderTop: `1px solid ${C.linie}`, paddingTop: 6 }}>Potenzregel</div>
        <div style={{ fontWeight: 700, color: C.gruenDunkel, borderTop: `1px solid ${C.linie}`, paddingTop: 6 }}>{zt(t, 4)}</div>
      </div>
    </BildKarte>
  );
}

/* ---------- Schritte je Phase ---------- */
function bauePhasen(z) {
  const { n7, x7, m7, k7 } = z;
  const a7 = n7 * x7 ** (n7 - 1);
  const fehler7 = [];
  if (n7 * x7 ** n7 !== a7) fehler7.push({ wert: n7 * x7 ** n7, text: "Der Exponent wurde nicht um 1 verkleinert. Aus xⁿ wird x hoch (n − 1)." });
  if (x7 ** (n7 - 1) !== a7) fehler7.push({ wert: x7 ** (n7 - 1), text: "Der Faktor n fehlt: Der alte Exponent wird zum Vorfaktor." });
  if ((n7 - 1) * x7 ** (n7 - 1) !== a7) fehler7.push({ wert: (n7 - 1) * x7 ** (n7 - 1), text: "Vorfaktor ist der alte Exponent n, nicht n − 1. Die Verkleinerung um 1 betrifft nur den Exponenten." });
  const opt7 = mische([
    ["r", `$${m7}x^{${m7 - 1}}$`], ["f1", `$${m7}x^{${m7}}$`], ["f2", `$${m7 - 1}x^{${m7}}$`], ["f3", `$x^{${m7 - 1}}$`],
  ]).map(([id, t]) => [id, <T key={id} s={t} />]);

  return [
    {
      titel: "Die erste binomische Formel", kurz: "(a+b)²",
      intro: "Du kennst sie schon: $(a+b)^2 = a^2 + 2ab + b^2$. Aber warum steht in der Mitte $2ab$ – und nicht einfach nur $a^2 + b^2$? Das Bild zeigt die Antwort.",
      bild: <QuadratBild />,
      fertig: "Geschafft: (a+b)² hat vier Teilflächen – a², b² und zweimal ab. Zusammengefasst stehen vor a², ab, b² die Zahlen 1, 2, 1.",
      schritte: [
        { id: "p1a", titel: "Ausmultiplizieren", typ: "zahl", frage: <T s="Multipliziere $(x+3)\cdot(x+3)$ aus. Welche Zahl steht in der Summe vor dem $x$?" />, text: "Zahl vor x:", wert: 6, breite: 96,
          hinweise: ["Multipliziere jeden Summanden der ersten Klammer mit jedem der zweiten: x·x, x·3, 3·x, 3·3.", "x·3 und 3·x sind beide 3x. Zusammen ergibt das …"],
          fehler: [{ wert: 3, text: "Du hast nur ein Mal 3x gezählt. Beim Ausmultiplizieren entstehen x·3 und 3·x." }, { wert: 9, text: "Die 9 ist der Term ohne x (3·3), nicht der Faktor vor x." }],
          erklaerung: <T s="$(x+3)(x+3) = x^2 + 3x + 3x + 9 = x^2 + 6x + 9$. Vor dem $x$ steht die 6." /> },
        { id: "p1b", titel: "Die vier Teilflächen", typ: "wahl", frage: <T s="Das große Quadrat hat die Seitenlänge $a+b$. Aus welchen Teilflächen setzt es sich zusammen?" />, richtig: "r",
          optionen: [["f", <T key="f" s="$a^2 + b^2$" />], ["r", <T key="r" s="$a^2 + ab + ab + b^2$" />], ["g", <T key="g" s="$a^2 + 2a + b^2$" />], ["h", <T key="h" s="$a^2 + ab + b^2$" />]],
          fehler: [{ wahl: "f", text: "Der Klassiker: (a+b)² ist nicht a² + b². Im Bild fehlen die beiden Rechtecke ab." }, { wahl: "h", text: "Fast: Es gibt zwei gleiche Rechtecke mit den Seiten a und b – oben rechts und unten links." }],
          hinweise: ["Zähle im Bild die Teilflächen und lies ihre Seiten ab."],
          erklaerung: <T s="Zwei Quadrate ($a^2$ und $b^2$) und zwei gleiche Rechtecke ($a\cdot b$) – zusammen $a^2 + 2ab + b^2$." /> },
        { id: "p1c", titel: "Mit Zahlen", typ: "zahl", frage: <T s="Berechne $(2x+5)^2$. Welche Zahl steht vor dem $x$?" />, text: "Zahl vor x:", wert: 20, breite: 96,
          hinweise: ["Der mittlere Term ist 2·a·b mit a = 2x und b = 5.", "2 · 2x · 5 = ?"],
          fehler: [{ wert: 10, text: "10 ist nur 2·5. Der Faktor 2 von 2x multipliziert noch einmal: 2·(2x)·5." }, { wert: 25, text: "25 ist b², der Term ohne x." }, { wert: 4, text: "4 ist der Faktor vor x² (nämlich (2x)² = 4x²)." }],
          erklaerung: <T s="$(2x+5)^2 = (2x)^2 + 2\cdot 2x\cdot 5 + 5^2 = 4x^2 + 20x + 25$." /> },
        { id: "p1d", titel: "Die Zahlen davor", typ: "wahl", frage: <T s="Wie lauten die Zahlen vor $a^2$, $ab$ und $b^2$ in $(a+b)^2$?" />, richtig: "r",
          optionen: [["f", "1 · 1 · 1"], ["g", "2 · 1 · 2"], ["r", "1 · 2 · 1"], ["h", "1 · 2 · 2"]],
          fehler: [{ wahl: "f", text: "a² und b² stehen je einmal da – aber ab kommt zweimal vor." }],
          erklaerung: "a² und b² kommen je einmal vor, ab zweimal: 1 · 2 · 1. Merke dir diese Zahlenreihe – wir suchen gleich weitere." },
      ],
    },
    {
      titel: "Die Entwicklung der dritten Potenz", kurz: "(a+b)³",
      intro: "Jetzt eine Stufe höher: $(a+b)^3 = (a+b)\\cdot(a+b)^2$. Multipliziere selbst aus und achte besonders auf die Zahlen vor den Termen.",
      bild: <Kaestchen />,
      fertig: "Du hast selbst gefunden: (a+b)³ = a³ + 3a²b + 3ab² + b³. Die Zahlen davor lauten 1 · 3 · 3 · 1.",
      schritte: [
        { id: "p2a", titel: "Wie oft entsteht a²b?", typ: "zahl", frage: <T s="Rechne $(a+b)\cdot(a^2+2ab+b^2)$ aus. Wie oft entsteht der Term $a^2b$ insgesamt?" />, text: "a²b entsteht", einheit: "-mal", wert: 3, breite: 80,
          hinweise: ["Multipliziere erst a mit jedem Summanden, dann b mit jedem.", "a · 2ab = 2a²b und b · a² = a²b."],
          fehler: [{ wert: 2, text: "Die 2 kommt von a·2ab. Dazu kommt noch b·a² – das ergibt ein weiteres a²b." }, { wert: 1, text: "Nur b·a² gezählt. Auch a·2ab liefert a²b, sogar zweimal." }],
          erklaerung: <T s="$a\cdot 2ab = 2a^2b$ und $b\cdot a^2 = a^2b$. Zusammen $3a^2b$." /> },
        { id: "p2b", titel: "Wie oft entsteht ab²?", typ: "zahl", frage: <T s="Und wie oft entsteht $ab^2$?" />, text: "ab² entsteht", einheit: "-mal", wert: 3, breite: 80,
          hinweise: ["a · b² ergibt ab². Welche Rechnung mit b liefert noch ab²?", "b · 2ab = 2ab²."],
          fehler: [{ wert: 2, text: "b·2ab gibt 2ab². Vergiss nicht a·b², das ergibt einmal ab²." }],
          erklaerung: <T s="$a\cdot b^2 = ab^2$ und $b\cdot 2ab = 2ab^2$. Zusammen $3ab^2$." /> },
        { id: "p2c", titel: "Das Ergebnis", typ: "wahl", frage: <T s="Wie lautet $(a+b)^3$ ausmultipliziert?" />, richtig: "r",
          optionen: [["f", <T key="f" s="$a^3 + b^3$" />], ["g", <T key="g" s="$a^3 + 3ab + b^3$" />], ["h", <T key="h" s="$a^3 + 2a^2b + 2ab^2 + b^3$" />], ["r", <T key="r" s="$a^3 + 3a^2b + 3ab^2 + b^3$" />]],
          fehler: [{ wahl: "f", text: "Wie bei (a+b)²: Die gemischten Terme fehlen." }, { wahl: "g", text: "Die Exponenten stimmen nicht: In jedem Term muss insgesamt Grad 3 stehen, also a²b und ab²." }],
          erklaerung: <T s="$(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$. Zahlen davor: 1 · 3 · 3 · 1." /> },
        { id: "p2d", titel: "Mit Zahlen", typ: "zahl", frage: <T s="Berechne $(x+2)^3$. Welche Zahl steht vor $x^2$?" />, text: "Zahl vor x²:", wert: 6, breite: 96,
          hinweise: ["Setze a = x und b = 2 in 3a²b ein.", "3 · x² · 2 = ?"],
          fehler: [{ wert: 3, text: "Die 3 stammt aus der Formel – aber b = 2 multipliziert noch mit: 3·x²·2." }, { wert: 12, text: "12 ist der Faktor vor x (3·x·2², also 3·4)." }, { wert: 8, text: "8 ist 2³, der Term ohne x." }],
          erklaerung: <T s="$(x+2)^3 = x^3 + 3\cdot x^2\cdot 2 + 3\cdot x\cdot 4 + 8 = x^3 + 6x^2 + 12x + 8$." /> },
        { id: "p2e", titel: "Ein Muster ahnen", typ: "wahl", frage: <T s="Bisher: $(a+b)^1$ hat 1 · 1, $(a+b)^2$ hat 1 · 2 · 1, $(a+b)^3$ hat 1 · 3 · 3 · 1. Wie könnten die Zahlen vor den Termen von $(a+b)^4$ beginnen und enden?" />, richtig: "r",
          optionen: [["f", "mit 4 und enden mit 4"], ["r", "mit 1 und enden mit 1"], ["g", "mit 1 und enden mit 4"], ["h", "mit 2 und enden mit 2"]],
          fehler: [{ wahl: "f", text: "a⁴ und b⁴ kommen jeweils nur auf einem einzigen Weg zustande: a·a·a·a. Außen steht also immer 1." }],
          erklaerung: "Am Rand steht immer 1: a⁴ entsteht nur, wenn man in jeder Klammer a wählt – und b⁴ nur mit b. Was in der Mitte steht, untersuchst du als Nächstes." },
      ],
    },
    {
      titel: "Das Pascalsche Dreieck entdecken", kurz: "Dreieck",
      intro: "Schreibe die Zahlen vor den Termen untereinander: 1 · 1 / 1 · 2 · 1 / 1 · 3 · 3 · 1. Das ist der Anfang des Pascalschen Dreiecks. Entdecke, nach welcher Regel es wächst.",
      bild: <Dreieck />,
      fertig: "Das Pascalsche Dreieck wächst Zeile für Zeile: Jede Zahl ist die Summe der beiden Zahlen darüber, am Rand steht 1. Und jede Zeile ist spiegelsymmetrisch.",
      schritte: [
        { id: "p3a", titel: "Die Bildungsregel", typ: "wahl", frage: "Zeilen 2 und 3 lauten 1 · 2 · 1 und 1 · 3 · 3 · 1. Wie könnte die 3 aus der Zeile darüber entstehen?", richtig: "r",
          optionen: [["f", "Es ist die Nummer der Zeile"], ["r", "Summe der beiden Zahlen schräg darüber (1 + 2)"], ["g", "Produkt der beiden Zahlen darüber"]],
          fehler: [{ wahl: "f", text: "Das passt an dieser Stelle zufällig – aber nicht für die Mitte der nächsten Zeile. Teste deine Vermutung im nächsten Schritt." }, { wahl: "g", text: "1 · 2 ergibt 2, nicht 3." }],
          erklaerung: "Die 3 ist 1 + 2. Tippe im Dreieck auf eine Zahl: Du siehst die beiden Zahlen, aus denen sie entsteht." },
        { id: "p3b", titel: "Zeile 4", typ: "zahl", frage: "Zeile 4 beginnt mit 1 · 4 · … und endet mit … · 4 · 1. Welche Zahl steht in der Mitte?", text: "Mitte von Zeile 4:", wert: 6, breite: 96,
          hinweise: ["Die Mitte liegt unter den beiden 3 aus Zeile 3.", "Summe der beiden Zahlen darüber."],
          fehler: [{ wert: 4, text: "4 ist die Zeilennummer. Die Summenregel liefert für die Mitte 3 + 3." }, { wert: 3, text: "Die 3 steht darüber. Gesucht ist die Summe der beiden Zahlen darüber." }],
          erklaerung: "3 + 3 = 6. Zeile 4 lautet 1 · 4 · 6 · 4 · 1." },
        { id: "p3c", titel: "Zeile 5", typ: "zahl", frage: "Zeile 5 beginnt mit 1 · 5 · … Welche Zahl steht an der dritten Stelle?", text: "Dritte Zahl:", wert: 10, breite: 96,
          hinweise: ["Die Zahl steht unter 4 und 6 aus Zeile 4.", "4 + 6 = ?"],
          fehler: [{ wert: 6, text: "Die 6 steht in der Zeile darüber. Gesucht ist die Summe 4 + 6." }, { wert: 5, text: "5 ist die zweite Zahl in Zeile 5. Die dritte steht unter 4 und 6." }],
          erklaerung: "4 + 6 = 10. Zeile 5 lautet 1 · 5 · 10 · 10 · 5 · 1." },
        { id: "p3d", titel: "Zeile 6", typ: "zahl", frage: "Zeile 6 lautet 1 · 6 · 15 · … · 15 · 6 · 1. Welche Zahl steht in der Mitte?", text: "Mitte von Zeile 6:", wert: 20, breite: 96,
          hinweise: ["Die Mitte liegt unter den beiden 10 aus Zeile 5.", "10 + 10 = ?"],
          fehler: [{ wert: 10, text: "Die 10 steht darüber. Die Summe der beiden Zahlen darüber ist gesucht." }, { wert: 30, text: "30 wäre 15 + 15 – das sind aber Zahlen derselben Zeile. Gemeint sind die Zahlen darüber (aus Zeile 5)." }],
          erklaerung: "10 + 10 = 20. Zeile 6 lautet 1 · 6 · 15 · 20 · 15 · 6 · 1." },
        { id: "p3e", titel: "Vorhersage", typ: "zahl", frage: <T s="Sage voraus, ohne auszumultiplizieren: Welche Zahl steht in $(a+b)^4$ vor $a^2b^2$?" />, text: "Zahl vor a²b²:", wert: 6, breite: 96,
          hinweise: ["Die Zahlen vor den Termen von (a+b)⁴ stehen in Zeile 4 des Dreiecks.", "a²b² ist der mittlere Term."],
          fehler: [{ wert: 4, text: "4 gehört zu a³b. Der Term a²b² steht in der Mitte der Zeile." }],
          erklaerung: <T s="Mitte von Zeile 4: 6. Kontrolle: $(a+b)\cdot(a^3+3a^2b+3ab^2+b^3)$ liefert $a^2b^2$ zweimal mit dem Faktor 3, also $6a^2b^2$." /> },
        { id: "p3f", titel: "Eine Eigenschaft", typ: "wahl", frage: "Welche Eigenschaft hat jede Zeile des Dreiecks?", richtig: "r",
          optionen: [["f", "Alle Zahlen in einer Zeile sind gleich"], ["r", "Sie liest sich von links und von rechts gleich"], ["g", "Die Zahlen werden von links nach rechts immer größer"]],
          fehler: [{ wahl: "g", text: "Sie steigen bis zur Mitte und sinken dann wieder – denk an 1 · 4 · 6 · 4 · 1." }],
          erklaerung: <T s="Das Dreieck ist spiegelsymmetrisch, weil $a$ und $b$ in $(a+b)^n$ ihre Rollen tauschen können." /> },
      ],
    },
    {
      titel: "Die allgemeine binomische Formel", kurz: "(a+b)ⁿ",
      intro: "Das Muster trägt weiter: Zeile $n$ des Dreiecks liefert die Zahlen vor den Termen von $(a+b)^n$. Prüfe es unten und finde heraus, was an der zweiten Stelle jeder Zeile steht.",
      bild: <Entwicklung />,
      fertig: "Jetzt hast du die Formel: (a+b)ⁿ = aⁿ + n·aⁿ⁻¹b + … + bⁿ. Der zweite Term enthält immer den Faktor n – genau er wird gleich wichtig.",
      schritte: [
        { id: "p4a", titel: "Welche Zeile?", typ: "wahl", frage: <T s="Aus welcher Zeile des Dreiecks stammen die Zahlen vor den Termen von $(a+b)^5$? (Gezählt wird ab Zeile 0.)" />, richtig: "r",
          optionen: [["f", "Zeile 4: 1 · 4 · 6 · 4 · 1"], ["g", "Zeile 6: 1 · 6 · 15 · 20 · 15 · 6 · 1"], ["r", "Zeile 5: 1 · 5 · 10 · 10 · 5 · 1"]],
          fehler: [{ wahl: "f", text: "Zeile 4 gehört zu (a+b)⁴. Die Zeilennummer ist der Exponent – und die oberste Zeile ist Zeile 0." }],
          erklaerung: "Die Zeilennummer ist der Exponent: Zeile 5 gehört zu (a+b)⁵." },
        { id: "p4b", titel: "Ein Koeffizient", typ: "zahl", frage: <T s="Welche Zahl steht in $(a+b)^5$ vor $a^3b^2$?" />, text: "Zahl vor a³b²:", wert: 10, breite: 96,
          hinweise: ["Zeile 5: 1 · 5 · 10 · 10 · 5 · 1 – die Terme laufen von a⁵ bis b⁵.", "Die Hochzahl von b zeigt, wie weit du in der Zeile gehst: b² ist die dritte Zahl."],
          fehler: [{ wert: 5, text: "5 gehört zu a⁴b. Bei a³b² ist b² dabei – das ist die dritte Zahl der Zeile." }],
          erklaerung: <T s="Terme von $a^5$ bis $b^5$ entsprechen 1 · 5 · 10 · 10 · 5 · 1. Der Term $a^3b^2$ steht an dritter Stelle: $10a^3b^2$." /> },
        { id: "p4c", titel: "Die zweite Stelle", typ: "zahl", frage: <T s="Zeile 6 lautet 1 · 6 · 15 · 20 · 15 · 6 · 1. Welche Zahl steht in $(a+b)^6$ vor $a^5b$?" />, text: "Zahl vor a⁵b:", wert: 6, breite: 96,
          hinweise: ["a⁵b ist der Term direkt nach a⁶."],
          fehler: [{ wert: 1, text: "Die 1 gehört zu a⁶. Der nächste Term ist a⁵b." }, { wert: 15, text: "15 gehört zu a⁴b²." }],
          erklaerung: <T s="Direkt nach $a^6$ kommt $6a^5b$." /> },
        { id: "p4d", titel: "Allgemein", typ: "wahl", frage: <T s="Welche Zahl steht in $(a+b)^n$ immer vor $a^{n-1}b$?" />, richtig: "r",
          optionen: [["f", <T key="f" s="$n-1$" />], ["g", "1"], ["h", <T key="h" s="$n\cdot(n-1)$" />], ["r", <T key="r" s="$n$" />]],
          fehler: [{ wahl: "f", text: "Prüfe an (a+b)⁶: vor a⁵b steht 6, nicht 5." }, { wahl: "g", text: "1 steht nur vor aⁿ und bⁿ am Rand." }],
          erklaerung: <T s="Der Term $a^{n-1}b$ entsteht, wenn man aus genau einer der $n$ Klammern $b$ wählt und aus allen anderen $a$ – das geht auf $n$ Arten. Also: $(a+b)^n = a^n + n\cdot a^{n-1}b + \ldots + b^n$." /> },
      ],
      abschlussFormel: { titel: "Allgemeine binomische Formel", zeilen: ["(a+b)^n = a^n + n\\cdot a^{n-1}b + \\binom{n}{2}a^{n-2}b^2 + \\ldots + b^n"] },
    },
    {
      titel: "Der Differenzenquotient", kurz: "Sekante",
      intro: "Jetzt zur Analysis: Für $f(x)=x^n$ ist die Steigung der Sekante durch $P(x\\,|\\,x^n)$ und $Q(x+h\\,|\\,(x+h)^n)$ der Differenzenquotient $\\frac{(x+h)^n - x^n}{h}$. Verkleinere $h$ und beobachte, welcher Zahl sich der Wert nähert.",
      bild: <Sekante />,
      fertig: "Der Differenzenquotient wird für kleines h zur Tangentensteigung. Entscheidend ist, nach dem Ausmultiplizieren durch h zu teilen – danach lässt sich h gegen 0 schicken.",
      schritte: [
        { id: "p5a", titel: "Aufstellen", typ: "wahl", frage: <T s="Wie lautet der Differenzenquotient von $f(x)=x^3$?" />, richtig: "r",
          optionen: [["f", <T key="f" s="$\frac{x^3+h^3}{h}$" />], ["g", <T key="g" s="$\frac{(x+h)^3}{h}$" />], ["r", <T key="r" s="$\frac{(x+h)^3-x^3}{h}$" />], ["h", <T key="h" s="$\frac{(x+h)^3-x}{h}$" />]],
          fehler: [{ wahl: "f", text: "(x+h)³ ist nicht x³ + h³ – die gemischten Terme aus Phase 2 fehlen." }, { wahl: "g", text: "Es fehlt die Differenz: Man vergleicht f(x+h) mit f(x), also (x+h)³ − x³." }],
          erklaerung: <T s="Steigung = Höhenunterschied durch Abstand: $\frac{f(x+h)-f(x)}{h} = \frac{(x+h)^3-x^3}{h}$." /> },
        { id: "p5b", titel: "Kürzen", typ: "wahl", frage: <T s="Mit der Entwicklung aus Phase 2 gilt $(x+h)^3 - x^3 = 3x^2h + 3xh^2 + h^3$. Was steht nach dem Teilen durch $h$ da?" />, richtig: "r",
          optionen: [["f", <T key="f" s="$3x^2 + 3xh + h^2$" />], ["g", <T key="g" s="$3x^2h + 3xh^2 + h^3$" />], ["r", <T key="r" s="$3x^2 + 3xh + h^2$" />]].slice(0, 0).concat([["g", <T key="g" s="$3x^2h + 3xh^2 + h^3$" />], ["r", <T key="r" s="$3x^2 + 3xh + h^2$" />], ["h", <T key="h" s="$3x^2 + 3x + 1$" />]]),
          fehler: [{ wahl: "g", text: "Es wurde nicht geteilt: Jeder Summand im Zähler verliert einen Faktor h." }, { wahl: "h", text: "h verschwindet nicht einfach – es bleibt als Faktor stehen: 3xh und h²." }],
          erklaerung: <T s="$\frac{3x^2h + 3xh^2 + h^3}{h} = 3x^2 + 3xh + h^2$." /> },
        { id: "p5c", titel: "h gegen 0", typ: "zahl", frage: <T s="Setze $x=2$: Der Quotient ist $12 + 6h + h^2$. Welchem Wert nähert er sich für $h\to 0$?" />, text: "Grenzwert:", wert: 12, breite: 96,
          hinweise: ["Für h → 0 verschwinden alle Terme mit h."],
          fehler: [{ wert: 0, text: "Nur die Terme mit h verschwinden. Die 12 hat kein h und bleibt." }],
          erklaerung: <T s="$12 + 6h + h^2 \to 12$ für $h\to 0$. Das ist die Tangentensteigung von $x^3$ an der Stelle 2." /> },
        { id: "p5d", titel: "Vierte Potenz", typ: "zahl", frage: <T s="Für $f(x)=x^4$ gilt nach dem Kürzen $4x^3 + 6x^2h + 4xh^2 + h^3$. Welchem Wert nähert sich der Quotient bei $x=2$ für $h\to 0$?" />, text: "Grenzwert:", wert: 32, breite: 96,
          hinweise: ["Welche Terme bleiben bei h → 0 übrig?", "Nur 4x³. Setze x = 2 ein."],
          fehler: [{ wert: 4, text: "4 ist nur der Vorfaktor. Es bleibt 4x³ – mit x = 2 also 4·8." }, { wert: 0, text: "Der Term 4x³ enthält kein h und bleibt stehen." }, { wert: 16, text: "Das wäre 4·2² – der Exponent von x ist aber 3." }],
          erklaerung: <T s="$4x^3 = 4\cdot 2^3 = 32$. Die Zahlen 4, 6, 4, 1 stammen aus Zeile 4 des Dreiecks." /> },
        { id: "p5e", titel: "Im Schaubild ablesen", typ: "zahl", frage: <T s="Stelle oben $n=3$, $x=2$ und $h=0{,}01$ ein. Lies den Differenzenquotienten ab und runde auf eine ganze Zahl." />, text: "Gerundet:", wert: 12, breite: 96,
          hinweise: ["Das Schaubild zeigt für h = 0,01 den Wert 12,0601. Runde auf eine ganze Zahl."],
          fehler: [{ wert: 8, text: "8 ist der Funktionswert f(2) = 2³, nicht die Steigung." }],
          erklaerung: "Der Differenzenquotient ist 12,0601 – gerundet 12. Er liegt schon sehr nah an der Tangentensteigung." },
      ],
    },
    {
      titel: "Die Potenzregel selbst herleiten", kurz: "Herleitung",
      intro: "Jetzt setzt du alles zusammen: die allgemeine binomische Formel aus Phase 4 im Differenzenquotienten aus Phase 5. Führe die Herleitung Schritt für Schritt selbst.",
      bild: null,
      fertig: "Das war der ganze Beweis: Binomische Formel einsetzen, durch h teilen, h gegen 0 schicken – übrig bleibt n·xⁿ⁻¹.",
      schritte: [
        { id: "p6a", titel: "Die Entwicklung einsetzen", typ: "wahl", frage: <T s="Nach der allgemeinen binomischen Formel gilt $(x+h)^n = x^n + \square + (\text{Terme mit } h^2, h^3, \ldots)$. Was steht an der Stelle $\square$?" />, richtig: "r",
          optionen: [["f", <T key="f" s="$x^{n-1}h$" />], ["g", <T key="g" s="$n\cdot x^{n}h$" />], ["r", <T key="r" s="$n\cdot x^{n-1}h$" />], ["h", <T key="h" s="$n\cdot x\,h^{n-1}$" />]],
          fehler: [{ wahl: "f", text: "Der Faktor n fehlt: In Phase 4 hast du gesehen, dass vor a^(n−1)b immer n steht." }, { wahl: "g", text: "Die Exponenten müssen zusammen n ergeben: x hoch (n−1) und h hoch 1." }, { wahl: "h", text: "x und h sind vertauscht: x trägt den großen Exponenten n−1, h die 1." }],
          erklaerung: <T s="Mit $a = x$ und $b = h$: $(x+h)^n = x^n + n\cdot x^{n-1}h + \ldots + h^n$." /> },
        { id: "p6b", titel: "Zähler und Teilen durch h", typ: "wahl", frage: <T s="Im Zähler $(x+h)^n - x^n$ hebt sich $x^n$ weg. Was bleibt nach dem Teilen durch $h$ übrig?" />, richtig: "r",
          optionen: [["f", <T key="f" s="$n\cdot x^{n-1}h + \ldots$" />], ["g", <T key="g" s="$n\cdot x^{n-1}$" />], ["r", <T key="r" s="$n\cdot x^{n-1} + h\cdot(\ldots)$" />]],
          fehler: [{ wahl: "f", text: "Es wurde nicht durch h geteilt: Jeder Term verliert einen Faktor h." }, { wahl: "g", text: "Die übrigen Terme verschwinden nicht von allein – sie haben noch mindestens einen Faktor h." }],
          erklaerung: <T s="$\frac{n x^{n-1}h + \binom{n}{2}x^{n-2}h^2 + \ldots + h^n}{h} = n x^{n-1} + h\cdot(\ldots)$. Alle übrigen Terme enthalten noch h." /> },
        { id: "p6c", titel: "h gegen 0", typ: "wahl", frage: <T s="Was passiert mit $h\cdot(\ldots)$, wenn $h$ gegen 0 geht?" />, richtig: "r",
          optionen: [["r", "Es wird 0 – die Klammer bleibt endlich"], ["f", "Es wird unendlich groß"], ["g", "Es bleibt unverändert"]],
          erklaerung: "Ein Faktor, der gegen 0 geht, mal eine endliche Klammer, geht gegen 0." },
        { id: "p6d", titel: "Das Ergebnis", typ: "wahl", frage: <T s="Damit gilt für $f(x)=x^n$: Die Ableitung $f′(x)$ ist …" />, richtig: "r",
          optionen: [["f", <T key="f" s="$(n-1)\cdot x^{n}$" />], ["g", <T key="g" s="$n\cdot x^{n}$" />], ["h", <T key="h" s="$x^{n-1}$" />], ["r", <T key="r" s="$n\cdot x^{n-1}$" />]],
          fehler: [{ wahl: "f", text: "Verwechslung: Der alte Exponent n wird zum Vorfaktor, der neue Exponent ist n − 1." }, { wahl: "g", text: "Der Exponent muss um 1 kleiner werden: n − 1." }, { wahl: "h", text: "Der Vorfaktor n bleibt stehen – er kam aus dem zweiten Term der binomischen Formel." }],
          erklaerung: <T s="Für $h\to 0$ bleibt nur $n\cdot x^{n-1}$ übrig: $f′(x) = n\cdot x^{n-1}$." /> },
      ],
      abschlussPotenzregel: true,
    },
    {
      titel: "Die Potenzregel anwenden und überprüfen", kurz: "Anwenden",
      intro: "Jetzt gehört die Regel dir: anwenden, rückwärts denken und mit dem Differenzenquotienten nachprüfen. Die Aufgaben sind jedes Mal anders.",
      bild: <Rechenprobe n={n7} x={x7} />,
      fertig: "Du kannst die Potenzregel nicht nur anwenden, sondern auch herleiten und nachprüfen. Das ist der Unterschied zwischen Auswendiglernen und Verstehen.",
      schritte: [
        { id: "p7a", titel: "Anwenden", typ: "zahl", frage: <T s={"Gegeben ist $f(x)=x^" + n7 + "$. Berechne $f′(" + x7 + ")$. Die Rechenprobe unten hilft beim Kontrollieren."} />, text: `f′(${x7}) =`, wert: a7, breite: 110,
          hinweise: ["Erst f′(x) = n·x^(n−1) bilden, dann die Stelle einsetzen.", `f′(x) = ${n7}·x^${n7 - 1}`],
          fehler: fehler7,
          erklaerung: <T s={"$f′(x)=" + n7 + "x^{" + (n7 - 1) + "}$, also $f′(" + x7 + ") = " + n7 + "\\cdot " + x7 + "^{" + (n7 - 1) + "} = " + a7 + "$."} /> },
        { id: "p7b", titel: "Die richtige Ableitung", typ: "wahl", frage: <T s={"Welche Ableitung hat $f(x)=x^{" + m7 + "}$?"} />, richtig: "r", optionen: opt7,
          fehler: [{ wahl: "f1", text: "Der Exponent muss um 1 sinken." }, { wahl: "f2", text: "Vorfaktor ist der alte Exponent, also nicht eins weniger." }, { wahl: "f3", text: "Der Vorfaktor fehlt." }],
          erklaerung: <T s={"$f′(x)=" + m7 + "x^{" + (m7 - 1) + "}$."} /> },
        { id: "p7c", titel: "Rückwärts denken", typ: "zahl", frage: <T s={"Für $f(x)=x^n$ gilt $f′(x)=" + k7 + "x^{" + (k7 - 1) + "}$. Wie groß ist $n$?"} />, text: "n =", wert: k7, breite: 96,
          hinweise: ["Der Vorfaktor der Ableitung ist der ursprüngliche Exponent."],
          fehler: [{ wert: k7 - 1, text: "n − 1 ist der Exponent der Ableitung. Der Vorfaktor verrät n selbst." }],
          erklaerung: <T s={"Der Vorfaktor ist $n$: $n=" + k7 + "$. Kontrolle: Der Exponent der Ableitung ist " + (k7 - 1) + " = n − 1."} /> },
      ],
      abschluss: true,
    },
  ];
}

/* ---------- Anzeige der Potenzregel ---------- */
function PotenzregelAnzeige({ gross = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "16px 0" }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: C.gruenDunkel }}>Potenzregel:</span>
      <span style={{ fontSize: gross ? 22 : 18, color: C.tinte }}><M t="f′(x)=n\cdot x^{n-1}" /></span>
    </div>
  );
}
export { PotenzregelAnzeige };

/* ---------- Das Modul ---------- */
export function PotenzModul({ onZurueck }) {
  const zuf = useMemo(() => ({ n7: pick([3, 4, 5, 6]), x7: pick([1, 2, 3]), m7: pick([5, 6, 7, 8]), k7: pick([6, 7, 8, 9]) }), []);
  const phasen = useMemo(() => bauePhasen(zuf), [zuf]);
  const [stand, setStandLok] = useState(() => entdeckenStand().potenz.stand.slice());
  const fertigePhase = (k) => stand[k] >= phasen[k].schritte.length;
  const ersteOffene = (() => { const i = phasen.findIndex((_, k) => !fertigePhase(k)); return i < 0 ? PHASEN_ANZAHL - 1 : i; })();
  const alleFertig = phasen.every((_, k) => fertigePhase(k));
  const [phase, setPhase] = useState(() => Math.min(entdeckenStand().potenz.phase || 0, PHASEN_ANZAHL - 1));
  const [bestaetige, setBestaetige] = useState(false);
  const aktuell = Math.min(phase, Math.max(ersteOffene, 0));

  useEffect(() => { window.scrollTo(0, 0); }, [aktuell]);
  useEffect(() => { if (alleFertig) potenzFertigSetzen(true); }, [alleFertig]);

  const gehePhase = (k) => { setPhase(k); potenzPhaseSetzen(k); setBestaetige(false); };
  const setterFuer = (k) => (f) => {
    const neu = typeof f === "function" ? f(stand[k]) : f;
    if (neu > stand[k]) {
      potenzStandSetzen(k, neu);
      setStandLok((s) => { const c = s.slice(); c[k] = Math.max(c[k], neu); return c; });
    }
  };

  const p = phasen[aktuell];
  const fertigDiese = fertigePhase(aktuell);
  const gesamt = phasen.reduce((s, ph, k) => s + Math.min(stand[k], ph.schritte.length), 0);
  const anzahlSchritte = phasen.reduce((s, ph) => s + ph.schritte.length, 0);

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <button type="button" onClick={onZurueck}
        style={{ fontFamily: "inherit", cursor: "pointer", background: "none", border: "none", padding: "6px 0", marginBottom: 10, fontSize: 13.5, fontWeight: 600, color: C.see }}>
        ← Mathe entdecken
      </button>
      <h2 style={{ fontSize: "clamp(20px, 6.2vw, 25px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, color: C.tinte, marginBottom: 6 }}>
        Entdecke die Potenzregel – vom Pascalschen Dreieck zur Ableitung
      </h2>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 14 }}>
        Sieben Phasen, ein Gedankengang. Du rechnest selbst, ergänzt Formeln und bekommst bei Bedarf schrittweise Hilfe.
      </p>

      {/* Phasenleiste */}
      <div role="tablist" aria-label="Phasen" style={{ display: "grid", gridTemplateColumns: `repeat(${PHASEN_ANZAHL}, minmax(0, 1fr))`, gap: 6 }}>
        {phasen.map((ph, k) => {
          const an = k === aktuell, ok = fertigePhase(k), offen = k <= ersteOffene;
          return (
            <button key={k} type="button" role="tab" aria-selected={an} aria-label={`Phase ${k + 1}: ${ph.titel}${ok ? " (abgeschlossen)" : ""}`} disabled={!offen}
              onClick={() => gehePhase(k)}
              style={{ height: 40, borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: offen ? "pointer" : "default",
                border: `1.5px solid ${an ? C.see : ok ? "#0F7A4D" : C.linie}`, background: an ? C.see : ok ? "#E6F6EF" : C.weiss,
                color: an ? C.weiss : ok ? "#0F7A4D" : offen ? C.see : C.hellgrau, opacity: offen ? 1 : 0.6 }}>
              {ok && !an ? "✓" : k + 1}
            </button>
          );
        })}
      </div>
      <div aria-hidden="true" style={{ height: 5, borderRadius: 3, background: C.linie, marginTop: 10, overflow: "hidden" }}>
        <div style={{ width: `${(gesamt / anzahlSchritte) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.see}, ${C.gruen})`, transition: "width .3s ease" }} />
      </div>

      {/* Aktuelle Phase */}
      <div style={{ marginTop: 22 }}>
        <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 6 }}>Phase {aktuell + 1} von {PHASEN_ANZAHL}</p>
        <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, color: C.tinte, marginBottom: 12 }}>{p.titel}</h3>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, margin: 0 }}><T s={p.intro} /></p>
        {p.bild}

        <div style={{ ...karte, marginTop: 18 }}>
          <SchrittFolge key={aktuell} schritte={p.schritte} stand={stand[aktuell]} setStand={setterFuer(aktuell)} fertigText={p.fertig} />
        </div>

        {fertigDiese && p.abschlussFormel && <div style={{ marginTop: 6 }}><Formel titel={p.abschlussFormel.titel} zeilen={p.abschlussFormel.zeilen} /></div>}
        {fertigDiese && p.abschlussPotenzregel && (
          <div style={{ ...karte, marginTop: 14, borderLeft: `4px solid ${C.flaggold}` }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, margin: 0 }}>Das hast du selbst hergeleitet:</p>
            <PotenzregelAnzeige />
            <Formel zeilen={[
              "\\frac{(x+h)^n-x^n}{h} = \\frac{n\\,x^{n-1}h + \\binom{n}{2}x^{n-2}h^2 + \\ldots + h^n}{h}",
              "= n\\,x^{n-1} + h\\cdot(\\ldots) \\;\\to\\; n\\,x^{n-1} \\quad (h \\to 0)",
            ]} />
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {aktuell > 0 && <div style={{ flex: "0 0 38%" }}><GrosserKnopf ghost onClick={() => gehePhase(aktuell - 1)}>← Zurück</GrosserKnopf></div>}
          {fertigDiese && aktuell < PHASEN_ANZAHL - 1 && (
            <div style={{ flex: 1 }}><GrosserKnopf onClick={() => gehePhase(aktuell + 1)}>Weiter zu Phase {aktuell + 2} →</GrosserKnopf></div>
          )}
        </div>

        {alleFertig && aktuell === PHASEN_ANZAHL - 1 && (
          <div style={{ ...karte, marginTop: 20, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.flaggold, margin: "0 0 6px" }}>Modul abgeschlossen</p>
            <p style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px", lineHeight: 1.3 }}>Du hast die Potenzregel entdeckt.</p>
            <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.65, margin: "0 0 4px", color: "#C9D6EE" }}>
              Von der binomischen Formel über das Pascalsche Dreieck zum Differenzenquotienten – und am Ende steht eine Regel, die du selbst begründen kannst.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "10px 0 4px", color: C.weiss }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.flaggold }}>Potenzregel:</span>
              <span style={{ fontSize: 22 }}><M t="f′(x)=n\cdot x^{n-1}" /></span>
            </div>
            <GrosserKnopf gold onClick={onZurueck}>Zurück zu Mathe entdecken</GrosserKnopf>
          </div>
        )}

        {gesamt > 0 && (
          <div style={{ marginTop: 22, textAlign: "center" }}>
            {!bestaetige
              ? <KleinerLink onClick={() => setBestaetige(true)}>Modul von vorn beginnen</KleinerLink>
              : (
                <Rueck art="warn">
                  Dein Fortschritt in diesem Modul wird gelöscht.
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <div style={{ flex: 1 }}><GrosserKnopf ghost onClick={() => setBestaetige(false)}>Abbrechen</GrosserKnopf></div>
                    <div style={{ flex: 1 }}><GrosserKnopf onClick={() => { potenzZuruecksetzen(); setStandLok(Array(PHASEN_ANZAHL).fill(0)); setPhase(0); setBestaetige(false); window.scrollTo(0, 0); }}>Ja, neu beginnen</GrosserKnopf></div>
                  </div>
                </Rueck>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

export const POTENZ_PHASEN = ["Die erste binomische Formel", "Die Entwicklung der dritten Potenz", "Das Pascalsche Dreieck entdecken", "Die allgemeine binomische Formel", "Der Differenzenquotient", "Die Potenzregel selbst herleiten", "Die Potenzregel anwenden und überprüfen"];
