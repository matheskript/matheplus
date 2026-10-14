/* ======================================================================
   FORMELSAMMLUNG · Illustrationen Teil 7: Kopfrechnen, Teilbarkeit, Brüche, Logik, Beweise
   Jede Illustration ist interaktiv und rechnet mit den gezeigten Zahlen.
   ====================================================================== */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { F, Hinweis, Messzeile, Regler, Txt, Umschalter, svgStil } from "./funcFsBasis.jsx";

const ziffern = (n) => String(n).split("").map(Number);
const qs = (n) => ziffern(n).reduce((a, b) => a + b, 0);

const WTxt = ({ x, y, children, gr = 12, anker = "middle" }) => (
  <text x={x} y={y} textAnchor={anker} fontSize={gr} fontWeight={700} fill="#fff">{children}</text>
);

/* ---------- Assoziativgesetz: Quader schichtweise oder säulenweise ---------- */
function Assoziativ() {
  const [a, setA] = useState(3), [b, setB] = useState(2), [c, setC] = useState(4);
  const [wie, setWie] = useState("ab");
  const w = 16;
  return (
    <div>
      <Hinweis>Ein Quader aus a · b · c Würfeln. Ob du erst a · b rechnest und dann mal c, oder erst b · c und dann mal a – es sind dieselben Würfel.</Hinweis>
      <svg viewBox="0 0 340 170" style={svgStil} role="img" aria-label="Würfelquader">
        {Array.from({ length: c }, (_, k) => (
          <g key={k} transform={`translate(${24 + k * 14} ${96 - k * 11})`}>
            {Array.from({ length: a }, (_, i) => Array.from({ length: b }, (_, j) => (
              <rect key={`${i}-${j}`} x={i * w} y={j * w} width={w - 1.5} height={w - 1.5} rx={3}
                fill={wie === "ab" ? (k % 2 ? F.rosaKraeftig : F.see) : (i % 2 ? F.rosaKraeftig : F.see)} opacity={0.35 + 0.6 * ((wie === "ab" ? k : i) % 2 ? 0.7 : 1)} stroke={C.weiss} />
            )))}
          </g>
        ))}
        <Txt x={250} y={90} gr={13}>{wie === "ab" ? `${a} · ${b} = ${a * b} pro Schicht` : `${b} · ${c} = ${b * c} pro Säule`}</Txt>
        <Txt x={250} y={112} gr={13} farbe={F.see}>{wie === "ab" ? `${c} Schichten` : `${a} Säulen`}</Txt>
      </svg>
      <Umschalter label="Zählweise" wert={wie} setze={setWie} optionen={[["ab", "(a · b) · c"], ["bc", "a · (b · c)"]]} />
      <Regler label="a" wert={a} setze={setA} min={1} max={5} schritt={1} anzeige={a} />
      <Regler label="b" wert={b} setze={setB} min={1} max={4} schritt={1} anzeige={b} />
      <Regler label="c" wert={c} setze={setC} min={1} max={5} schritt={1} anzeige={c} />
      <Messzeile>
        <div><M t={`(${a} \\cdot ${b}) \\cdot ${c} = ${a * b} \\cdot ${c} = ${a * b * c}`} /></div>
        <div><M t={`${a} \\cdot (${b} \\cdot ${c}) = ${a} \\cdot ${b * c} = ${a * b * c}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Mal 11 ---------- */
function Mal11() {
  const [n, setN] = useState(43);
  const a = Math.floor(n / 10), b = n % 10, s = a + b;
  const erg = n * 11;
  return (
    <div>
      <Hinweis>Wähle eine zweistellige Zahl. Die Ziffernsumme kommt in die Mitte – bei Übertrag wandert eine 1 nach vorn.</Hinweis>
      <svg viewBox="0 0 340 120" style={svgStil} role="img" aria-label="Ziffernschema">
        {[[a, 60, F.see], [s % 10, 170, F.gold3], [b, 280, F.rosaKraeftig]].map(([v, x, f], i) => (
          <g key={i}>
            <rect x={x - 28} y={20} width={56} height={56} rx={12} fill={F.blau} stroke={f} strokeWidth="2" />
            <Txt x={x} y={58} gr={30} farbe={f}>{String(v)}</Txt>
          </g>
        ))}
        <Txt x={115} y={55} gr={22}>·</Txt>
        <Txt x={60} y={98} gr={11} farbe={F.see}>Zehner a</Txt>
        <Txt x={170} y={98} gr={11} farbe={F.gold3}>{`a + b = ${s}`}</Txt>
        <Txt x={280} y={98} gr={11} farbe={F.rosaKraeftig}>Einer b</Txt>
      </svg>
      <Regler label="Zahl" wert={n} setze={setN} min={10} max={99} schritt={1} anzeige={n} />
      <Messzeile>
        <div><M t={`${n} \\cdot 11 = 100 \\cdot ${a} + 10 \\cdot ${s} + ${b} = ${erg}`} /></div>
        {s >= 10 && <div style={{ color: F.rosaKraeftig, fontWeight: 700 }}>Übertrag: {s} Zehner sind 1 Hunderter und {s - 10} Zehner.</div>}
      </Messzeile>
    </div>
  );
}

/* ---------- Mal 5 und Mal 25 ---------- */
function MalZehnHalb({ f = 5 }) {
  const [n, setN] = useState(f === 5 ? 68 : 36);
  const grund = f === 5 ? 10 : 100, teil = f === 5 ? 2 : 4;
  const gross = n * grund, ergebnis = gross / teil;
  const sk = 300 / Math.max(gross, 1);
  return (
    <div>
      <Hinweis>{f === 5 ? "5 ist die Hälfte von 10: erst mal 10 (Null anhängen), dann halbieren." : "25 ist ein Viertel von 100: erst mal 100 (zwei Nullen anhängen), dann durch 4."}</Hinweis>
      <svg viewBox="0 0 340 110" style={svgStil} role="img" aria-label="Balken geteilt">
        <rect x={20} y={14} width={300} height={26} rx={6} fill={F.see} opacity="0.85" />
        <WTxt x={170} y={32} gr={12} >{`${n} · ${grund} = ${gross}`}</WTxt>
        <rect x={20} y={56} width={300 / teil} height={26} rx={6} fill={F.gold3} />
        <rect x={20 + 300 / teil} y={56} width={300 - 300 / teil} height={26} rx={6} fill={F.blau} stroke={F.achse} strokeDasharray="4 3" />
        <Txt x={20 + 150 / teil} y={74} gr={12}>{String(ergebnis)}</Txt>
        <Txt x={170} y={102} gr={11} farbe={F.see}>{`: ${teil}`}</Txt>
      </svg>
      <Regler label="Zahl" wert={n} setze={setN} min={4} max={f === 5 ? 98 : 96} schritt={f === 5 ? 2 : 4} anzeige={n} />
      <Messzeile><M t={`${n} \\cdot ${f} = \\frac{${n} \\cdot ${grund}}{${teil}} = \\frac{${gross}}{${teil}} = ${ergebnis}`} /></Messzeile>
    </div>
  );
}

/* ---------- Nahe an 100 ---------- */
function Nahe100() {
  const [a, setA] = useState(3), [b, setB] = useState(7);
  const x = 100 - a, y = 100 - b;
  const vorn = x - b, hinten = a * b;
  const w = 3;
  return (
    <div>
      <Hinweis>Zwei Zahlen knapp unter 100. Die Abstände a und b zu 100 sind die Schlüssel: erste Zahl minus Abstand der zweiten, dahinter das Produkt der Abstände.</Hinweis>
      <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Rechteck 100 mal 100 mit Abständen">
        <rect x={20} y={14} width={x * w} height={y * w * 0.55} fill={F.see} opacity="0.85" />
        <rect x={20 + x * w} y={14} width={a * w} height={y * w * 0.55} fill={F.gold3} opacity="0.7" />
        <rect x={20} y={14 + y * w * 0.55} width={x * w} height={b * w * 0.55} fill={F.gold3} opacity="0.7" />
        <rect x={20 + x * w} y={14 + y * w * 0.55} width={a * w} height={b * w * 0.55} fill={F.rosaKraeftig} />
        <WTxt x={20 + (x * w) / 2} y={14 + (y * w * 0.55) / 2 + 4}  gr={12}>{`${x} · ${y}`}</WTxt>
        <Txt x={20 + x * w + (a * w) / 2} y={14 + (y * w * 0.55) / 2 + 4} gr={11}>{`${a}`}</Txt>
        <Txt x={170} y={184} gr={11}>{`Abstände ${a} und ${b} → Produkt ${hinten}`}</Txt>
      </svg>
      <Regler label="Abstand a" wert={a} setze={setA} min={1} max={9} schritt={1} anzeige={a} />
      <Regler label="Abstand b" wert={b} setze={setB} min={1} max={9} schritt={1} anzeige={b} />
      <Messzeile>
        <div><M t={`${x} \\cdot ${y}: \\quad ${x} - ${b} = ${vorn}, \\quad ${a} \\cdot ${b} = ${hinten}`} /></div>
        <div><M t={`${x} \\cdot ${y} = ${vorn} \\cdot 100 + ${hinten} = ${x * y}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Teilbarkeitsregeln ---------- */
function TeilCheck({ regel = "39" }) {
  const [n, setN] = useState(regel === "11" ? 918082 : regel === "6" ? 4572 : regel === "48" ? 7316 : 4572);
  const d = ziffern(n);
  const ja = (t) => <b style={{ color: t ? "#1a7f4b" : F.rosaKraeftig }}>{t ? "ja" : "nein"}</b>;
  const alt = d.slice().reverse().reduce((s, v, i) => s + (i % 2 ? -v : v), 0);
  const rest2 = n % 100, rest3 = n % 1000;
  const aussage = {
    "2510": [`Endziffer ${d[d.length - 1]}`, [["durch 2", d[d.length - 1] % 2 === 0], ["durch 5", [0, 5].includes(d[d.length - 1])], ["durch 10", d[d.length - 1] === 0]]],
    "39": [`Quersumme ${d.join(" + ")} = ${qs(n)}`, [["durch 3", qs(n) % 3 === 0], ["durch 9", qs(n) % 9 === 0]]],
    "48": [`letzte Ziffern: ${rest2} (zwei), ${rest3} (drei)`, [["durch 4", rest2 % 4 === 0], ["durch 8", rest3 % 8 === 0]]],
    "6": [`Endziffer ${d[d.length - 1]}, Quersumme ${qs(n)}`, [["durch 2", n % 2 === 0], ["durch 3", qs(n) % 3 === 0], ["durch 6", n % 6 === 0]]],
    "11": [`von rechts abwechselnd: ${alt}`, [["durch 11", alt % 11 === 0]]],
  }[regel];
  const max = regel === "11" ? 999999 : 99999;
  return (
    <div>
      <Hinweis>Stelle eine Zahl ein. Die Regel prüft nur die markierten Ziffern – und die echte Division bestätigt das Ergebnis.</Hinweis>
      <svg viewBox="0 0 340 90" style={svgStil} role="img" aria-label="Ziffern der Zahl">
        {d.map((v, i) => {
          const von = d.length - 1 - i; /* Stelle von rechts */
          const wichtig = regel === "2510" ? von === 0 : regel === "48" ? von < (rest2 ? 3 : 2) : regel === "6" ? true : true;
          const alternierend = regel === "11" ? (von % 2 ? F.rosaKraeftig : F.see) : F.see;
          const x = 170 + (i - (d.length - 1) / 2) * 42;
          const farbe = regel === "11" ? alternierend : regel === "2510" ? (von === 0 ? F.gold3 : F.achse) : regel === "48" ? (von < 2 ? F.gold3 : von < 3 ? F.rosaKraeftig : F.achse) : F.see;
          return (
            <g key={i} opacity={wichtig ? 1 : 0.4}>
              <rect x={x - 17} y={14} width={34} height={44} rx={8} fill={F.blau} stroke={farbe} strokeWidth="2" />
              <Txt x={x} y={45} gr={22} farbe={farbe}>{String(v)}</Txt>
              {regel === "11" && <Txt x={x} y={76} gr={12} farbe={farbe}>{von % 2 ? "−" : "+"}</Txt>}
            </g>
          );
        })}
      </svg>
      <Regler label="Zahl" wert={n} setze={(v) => setN(Math.round(v))} min={regel === "11" ? 100 : 10} max={max} schritt={1} anzeige={n} />
      <Messzeile>
        <div>{aussage[0]}</div>
        {aussage[1].map(([t, w]) => <div key={t}>{t}: {ja(w)}</div>)}
        <div style={{ color: C.grau, fontSize: 12.5 }}>Kontrolle: {regel === "11" ? `${n} : 11 = ${z2(n / 11)}` : regel === "48" ? `${n} : 4 = ${z2(n / 4)}, ${n} : 8 = ${z2(n / 8)}` : regel === "2510" ? `${n} : 2 = ${z2(n / 2)}, ${n} : 5 = ${z2(n / 5)}` : regel === "6" ? `${n} : 6 = ${z2(n / 6)}` : `${n} : 3 = ${z2(n / 3)}, ${n} : 9 = ${z2(n / 9)}`}</div>
      </Messzeile>
    </div>
  );
}
const z2 = (v) => String(Math.round(v * 100) / 100).replace(".", ",");

/* ---------- Bruchdivision: Wie oft passt der Teiler hinein? ---------- */
function BruchDiv() {
  const [n1, setN1] = useState(3), [d1, setD1] = useState(1), [d2, setD2] = useState(4);
  const wert = n1 / d1, teiler = 1 / d2;
  const anz = Math.round(wert / teiler);
  const breite = 300 * wert / 4;
  return (
    <div>
      <Hinweis>Wie oft passt ein Stück 1/n in die Zahl a? So viele Stücke wie n · a – das ist die Division durch einen Bruch.</Hinweis>
      <svg viewBox="0 0 340 90" style={svgStil} role="img" aria-label="Streifen unterteilt in Bruchstücke">
        <rect x={20} y={20} width={breite} height={32} rx={6} fill={F.blau} stroke={F.see} strokeWidth="1.6" />
        {Array.from({ length: anz }, (_, i) => (
          <rect key={i} x={20 + (i * breite) / anz + 1} y={22} width={breite / anz - 2} height={28} rx={3} fill={i % 2 ? F.gold3 : F.rosaKraeftig} opacity="0.85" />
        ))}
        <Txt x={20 + breite / 2} y={76} gr={12}>{`${anz} Stücke der Größe 1/${d2}`}</Txt>
      </svg>
      <Regler label="Zahl a" wert={n1} setze={setN1} min={1} max={4} schritt={1} anzeige={n1} />
      <Regler label="Stückgröße 1/n, n =" wert={d2} setze={setD2} min={2} max={8} schritt={1} anzeige={d2} />
      <Messzeile>
        <div><M t={`${n1} : \\frac{1}{${d2}} = ${n1} \\cdot ${d2} = ${n1 * d2}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Leere Menge ---------- */
function LeereMenge() {
  const [menge, setMenge] = useState("A");
  const elems = menge === "A" ? [2, 4, 6] : menge === "B" ? [1] : [];
  const nameMenge = menge === "leer" ? "∅" : menge === "A" ? "{2; 4; 6}" : "{1}";
  return (
    <div>
      <Hinweis>Prüfe die Aussage »Jedes Element von X liegt in A« für verschiedene X. Bei der leeren Menge gibt es nichts zu prüfen – die Aussage ist wahr.</Hinweis>
      <svg viewBox="0 0 340 130" style={svgStil} role="img" aria-label="Mengen A und X">
        <ellipse cx={200} cy={65} rx={110} ry={52} fill={F.blau} stroke={F.see} strokeWidth="2" />
        <Txt x={270} y={40} farbe={F.see} gr={14}>A = {"{2; 4; 6; 8}"}</Txt>
        <ellipse cx={90} cy={65} rx={55} ry={38} fill="none" stroke={F.rosaKraeftig} strokeWidth="2" strokeDasharray={menge === "leer" ? "5 4" : undefined} />
        <Txt x={90} y={30} farbe={F.rosaKraeftig} gr={13}>{`X = ${nameMenge}`}</Txt>
        {elems.map((e, i) => <Txt key={i} x={70 + i * 22} y={72} gr={16}>{String(e)}</Txt>)}
      </svg>
      <Umschalter label="Menge X" wert={menge} setze={setMenge} optionen={[["A", "X = {2; 4; 6}"], ["B", "X = {1}"], ["leer", "X = ∅"]]} />
      <Messzeile>
        {menge === "leer"
          ? <div>Kein Element von ∅ muss geprüft werden – es gibt keinen Fall, in dem die Aussage falsch wird. Also ist <b>∅ ⊆ A</b> wahr.</div>
          : elems.every((e) => [2, 4, 6, 8].includes(e))
            ? <div>Alle Elemente liegen in A: X ⊆ A ist wahr.</div>
            : <div>Die 1 liegt nicht in A: X ⊆ A ist falsch.</div>}
      </Messzeile>
    </div>
  );
}

/* ---------- Äquivalenz: Wahrheitstafel ---------- */
function AequivalenzTafel() {
  const [zeile, setZeile] = useState(0);
  const zeilen = [[true, true], [true, false], [false, true], [false, false]];
  const w = (b) => (b ? "w" : "f");
  return (
    <div>
      <Hinweis>A ⇔ B ist genau dann wahr, wenn A und B denselben Wahrheitswert haben. Tippe auf eine Zeile: Beide Richtungen müssen stimmen.</Hinweis>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", margin: "0 auto", fontSize: 14, fontWeight: 600 }}>
          <thead><tr>{["A", "B", "A ⇒ B", "B ⇒ A", "A ⇔ B"].map((h) => <th key={h} style={{ padding: "6px 12px", borderBottom: `2px solid ${F.see}`, color: F.see }}>{h}</th>)}</tr></thead>
          <tbody>
            {zeilen.map(([a, b], i) => {
              const ab = !a || b, ba = !b || a;
              return (
                <tr key={i} onClick={() => setZeile(i)} style={{ cursor: "pointer", background: i === zeile ? F.gold3 + "33" : "transparent" }}>
                  {[a, b, ab, ba, ab && ba].map((v, j) => <td key={j} style={{ padding: "7px 12px", textAlign: "center", color: v ? "#1a7f4b" : F.rosaKraeftig }}>{w(v)}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Messzeile>
        {(() => { const [a, b] = zeilen[zeile]; const e = (!a || b) && (!b || a);
          return <div>A = {w(a)}, B = {w(b)}: {e ? <b>Äquivalenz wahr – beide Richtungen gelten.</b> : <b style={{ color: F.rosaKraeftig }}>Äquivalenz falsch – mindestens eine Richtung scheitert.</b>}</div>; })()}
      </Messzeile>
    </div>
  );
}

/* ---------- Quantoren ---------- */
function QuantorenBild() {
  const [bed, setBed] = useState("gerade");
  const [alle, setAlle] = useState(true);
  const zahlen = [2, 4, 6, 8, 10, 12, 14, 16];
  const [fehler, setFehler] = useState(false);
  const liste = fehler ? [2, 4, 6, 9, 10, 12, 14, 16] : zahlen;
  const ok = (n) => (bed === "gerade" ? n % 2 === 0 : n > 5);
  const treffer = liste.filter(ok);
  const gilt = alle ? treffer.length === liste.length : treffer.length > 0;
  return (
    <div>
      <Hinweis>Ein einziges Gegenbeispiel kippt eine Allaussage. Für »es gibt« genügt dagegen ein einziger Treffer.</Hinweis>
      <svg viewBox="0 0 340 90" style={svgStil} role="img" aria-label="Zahlen mit Eigenschaft">
        {liste.map((n, i) => {
          const x = 24 + i * 38, t = ok(n);
          return (
            <g key={i}>
              <circle cx={x} cy={38} r={16} fill={t ? F.gold3 : F.rosaKraeftig} opacity="0.85" />
              <WTxt x={x} y={43} gr={13} >{String(n)}</WTxt>
            </g>
          );
        })}
        <Txt x={170} y={80} gr={12}>{`${treffer.length} von ${liste.length} erfüllen: ${bed === "gerade" ? "n ist gerade" : "n > 5"}`}</Txt>
      </svg>
      <Umschalter label="Eigenschaft" wert={bed} setze={setBed} optionen={[["gerade", "n ist gerade"], ["gross", "n > 5"]]} />
      <Umschalter label="Quantor" wert={alle} setze={setAlle} optionen={[[true, "für alle ∀"], [false, "es gibt ∃"]]} />
      <Umschalter label="Zahlenliste" wert={fehler} setze={setFehler} optionen={[[false, "nur gerade Zahlen"], [true, "mit Ausreißer 9"]]} />
      <Messzeile>
        <div>{alle ? "∀ n: " : "∃ n: "}{bed === "gerade" ? "n ist gerade" : "n > 5"} → <b style={{ color: gilt ? "#1a7f4b" : F.rosaKraeftig }}>{gilt ? "wahr" : "falsch"}</b></div>
        <div style={{ color: C.grau, fontSize: 12.5 }}>Verneinung: {alle ? "∃ n: nicht (Eigenschaft) – ein Gegenbeispiel" : "∀ n: nicht (Eigenschaft) – kein einziger Treffer"}</div>
      </Messzeile>
    </div>
  );
}

/* ---------- Beweisketten: direkt und Widerspruch ---------- */
function BeweisKette({ art = "direkt" }) {
  const [k, setK] = useState(3), [m, setM] = useState(5);
  const [p, setP] = useState(7), [q, setQ] = useState(5);
  if (art === "direkt") {
    const a = 2 * k, b = 2 * m;
    return (
      <div>
        <Hinweis>Direkter Beweis: Starte bei der Voraussetzung und gehe Schritt für Schritt zur Behauptung. Probiere beliebige k und m – die Kette hält immer.</Hinweis>
        <svg viewBox="0 0 340 110" style={svgStil} role="img" aria-label="Kette von Schlüssen">
          {[["a, b gerade", F.see], ["a=2k, b=2m", F.gold3], ["a+b=2(k+m)", F.rosaKraeftig], ["a+b gerade", "#1a7f4b"]].map(([t, f], i) => (
            <g key={i}>
              <rect x={6 + i * 84} y={30} width={76} height={46} rx={10} fill={F.blau} stroke={f} strokeWidth="2" />
              <Txt x={44 + i * 84} y={57} gr={8.5} farbe={F.tinte}>{t}</Txt>
              {i < 3 && <Txt x={82 + i * 84} y={57} gr={14} farbe={F.achse}>⇒</Txt>}
            </g>
          ))}
        </svg>
        <Regler label="k" wert={k} setze={setK} min={1} max={20} schritt={1} anzeige={k} />
        <Regler label="m" wert={m} setze={setM} min={1} max={20} schritt={1} anzeige={m} />
        <Messzeile>
          <div><M t={`a = 2 \\cdot ${k} = ${a}, \\quad b = 2 \\cdot ${m} = ${b}`} /></div>
          <div><M t={`a + b = ${a + b} = 2 \\cdot (${k} + ${m}) = 2 \\cdot ${k + m}`} /></div>
        </Messzeile>
      </div>
    );
  }
  /* Widerspruch: √2 ≈ p/q — p² und 2q² stimmen nie überein */
  const l = p * p, r = 2 * q * q;
  return (
    <div>
      <Hinweis>Widerspruchsbeweis: Angenommen √2 = p/q. Dann müsste p² = 2q² gelten. Suche p und q – es klappt nie, die beiden Seiten verfehlen sich immer.</Hinweis>
      <svg viewBox="0 0 340 100" style={svgStil} role="img" aria-label="p Quadrat gegen 2 q Quadrat">
        <rect x={20} y={14} width={Math.min(300, l * 1.2)} height={26} rx={6} fill={F.see} opacity="0.85" />
        <WTxt x={24} y={32} gr={12}  anker="start">{`p² = ${l}`}</WTxt>
        <rect x={20} y={52} width={Math.min(300, r * 1.2)} height={26} rx={6} fill={F.rosaKraeftig} opacity="0.85" />
        <WTxt x={24} y={70} gr={12}  anker="start">{`2q² = ${r}`}</WTxt>
        <Txt x={170} y={94} gr={12}>{l === r ? "gleich" : `Unterschied ${Math.abs(l - r)}`}</Txt>
      </svg>
      <Regler label="p" wert={p} setze={setP} min={1} max={30} schritt={1} anzeige={p} />
      <Regler label="q" wert={q} setze={setQ} min={1} max={30} schritt={1} anzeige={q} />
      <Messzeile>
        <div><M t={`\\frac{${p}}{${q}} \\approx ${z2(p / q)}, \\quad \\sqrt{2} \\approx 1{,}4142`} /></div>
        <div>p² ist {l % 2 ? "ungerade" : "gerade"}, 2q² ist immer gerade – ist p ungerade, kann es nie passen. Ist p gerade, geht es mit gekürzten Zahlen ebenfalls nicht auf.</div>
      </Messzeile>
    </div>
  );
}

export const BILDER_7 = {
  assoziativBild: (p) => <Assoziativ {...p} />,
  mal11Bild: (p) => <Mal11 {...p} />,
  malZehnHalb: (p) => <MalZehnHalb {...p} />,
  nahe100Bild: (p) => <Nahe100 {...p} />,
  teilCheck: (p) => <TeilCheck {...p} />,
  bruchDiv: (p) => <BruchDiv {...p} />,
  leereMenge: (p) => <LeereMenge {...p} />,
  aequivalenzTafel: (p) => <AequivalenzTafel {...p} />,
  quantorenBild: (p) => <QuantorenBild {...p} />,
  beweisKette: (p) => <BeweisKette {...p} />,
};
