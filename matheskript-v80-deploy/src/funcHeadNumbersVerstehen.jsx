import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { EinmaleinsSchachbrett, PotenzSpalten } from "./func14.jsx";
import { bucheVerstehen, markiereEntdeckt, status } from "./headNumbers.js";
import { L, karte, MAL, kopfAendern, modulInfo, H2, Absatz, Zurueck, Knopf } from "./funcHeadNumbersBasis.jsx";

/* ======================================================================
   VERSTEHEN – Muster und Zusammenhänge
   ====================================================================== */
function Regler({ wert, setWert, min, max, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0 6px" }}>
      <button type="button" aria-label={L("kleiner", "smaller")} onClick={() => setWert(Math.max(min, wert - 1))} style={pfeil}>−</button>
      <input type="range" min={min} max={max} value={wert} aria-label={label} onChange={(e) => setWert(Number(e.target.value))} style={{ flex: 1, accentColor: C.see, height: 32 }} />
      <button type="button" aria-label={L("größer", "larger")} onClick={() => setWert(Math.min(max, wert + 1))} style={pfeil}>+</button>
    </div>
  );
}
const pfeil = { width: 44, height: 44, borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 22, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", lineHeight: 1 };
const Gleichung = ({ children }) => <p style={{ fontSize: "clamp(17px, 4.8vw, 21px)", fontWeight: 800, color: C.tinte, lineHeight: 1.5, textAlign: "center", margin: "6px 0 2px", fontVariantNumeric: "tabular-nums" }}>{children}</p>;
const Abschnitt = ({ titel, children }) => (
  <section style={{ ...karte, padding: 18, marginBottom: 14 }}>
    <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte, marginBottom: 8 }}>{titel}</p>{children}
  </section>
);

function QuadratBild({ n }) {
  const m = n + 1, S = 260, z = S / m;
  return (
    <svg viewBox={`0 0 ${S} ${S}`} style={{ width: "100%", maxWidth: 280, display: "block", margin: "8px auto" }} role="img"
      aria-label={L(`Quadrat mit Seitenlänge ${n}: ${n * n} Kästchen, dazu ${2 * n + 1} für das nächste Quadrat`, `Square with side ${n}: ${n * n} cells, plus ${2 * n + 1} for the next square`)}>
      <rect x="0" y="0" width={n * z} height={n * z} fill={C.see} />
      <rect x={n * z} y="0" width={z} height={m * z} fill={C.flaggold} />
      <rect x="0" y={n * z} width={n * z} height={z} fill={C.flaggold} />
      {Array.from({ length: m + 1 }, (_, i) => (
        <g key={i}><line x1={i * z} y1="0" x2={i * z} y2={S} stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" /><line x1="0" y1={i * z} x2={S} y2={i * z} stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" /></g>
      ))}
    </svg>
  );
}

function WuerfelBild({ n }) {
  const W = 260, H = 240, k = 0.45;
  const z = 170 / (n * (1 + k)), a = z * k;
  const x0 = 20, y0 = H - 22 - n * z;                             // Vorderseite links unten, y0 = oberer Rand
  const gitter = [];
  for (let i = 0; i <= n; i++) {
    gitter.push(<line key={`fv${i}`} x1={x0 + i * z} y1={y0} x2={x0 + i * z} y2={y0 + n * z} />);
    gitter.push(<line key={`fh${i}`} x1={x0} y1={y0 + i * z} x2={x0 + n * z} y2={y0 + i * z} />);
    gitter.push(<line key={`tt${i}`} x1={x0 + i * a} y1={y0 - i * a} x2={x0 + i * a + n * z} y2={y0 - i * a} />);
    gitter.push(<line key={`td${i}`} x1={x0 + i * z} y1={y0} x2={x0 + i * z + n * a} y2={y0 - n * a} />);
    gitter.push(<line key={`sd${i}`} x1={x0 + n * z} y1={y0 + i * z} x2={x0 + n * z + n * a} y2={y0 + i * z - n * a} />);
    gitter.push(<line key={`sv${i}`} x1={x0 + n * z + i * a} y1={y0 - i * a} x2={x0 + n * z + i * a} y2={y0 + n * z - i * a} />);
  }
  const P = (pts, f) => <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={f} />;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 280, display: "block", margin: "8px auto" }} role="img"
      aria-label={L(`Würfel aus ${n} Schichten mit je ${n} mal ${n} Würfelchen: ${n ** 3} Würfelchen`, `Cube of ${n} layers with ${n} by ${n} blocks each: ${n ** 3} blocks`)}>
      {P([[x0, y0], [x0 + n * z, y0], [x0 + n * z, y0 + n * z], [x0, y0 + n * z]], C.see)}
      {P([[x0, y0], [x0 + n * z, y0], [x0 + n * z + n * a, y0 - n * a], [x0 + n * a, y0 - n * a]], C.flaggold)}
      {P([[x0 + n * z, y0], [x0 + n * z + n * a, y0 - n * a], [x0 + n * z + n * a, y0 + n * z - n * a], [x0 + n * z, y0 + n * z]], C.seeHell)}
      <g stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8">{gitter}</g>
    </svg>
  );
}

export function MusterCheck({ id, fragen, onFertig }) {
  const [antworten, setAntworten] = useState({});
  const beantwortet = Object.keys(antworten).length;
  const richtig = Object.entries(antworten).filter(([i, v]) => v === fragen[i].richtig).length;
  const waehle = (i, o) => {
    if (antworten[i] !== undefined) return;
    setAntworten((x) => ({ ...x, [i]: o }));
    kopfAendern((Kp) => bucheVerstehen(Kp, `${id}:${i}`, o === fragen[i].richtig));
  };
  return (
    <div>
      {fragen.map((f, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.tinte, lineHeight: 1.5, marginBottom: 8 }}>{i + 1}. {f.frage}</p>
          <div style={{ display: "grid", gap: 6 }}>
            {f.optionen.map((o, j) => {
              const hat = antworten[i] !== undefined, istR = j === f.richtig, gew = antworten[i] === j;
              return (
                <button key={j} type="button" disabled={hat} onClick={() => waehle(i, j)}
                  style={{ minHeight: 46, padding: "8px 14px", borderRadius: 12, textAlign: "left", fontFamily: "inherit", fontSize: 14.5, fontWeight: 600, color: C.tinte, cursor: hat ? "default" : "pointer",
                    border: `2px solid ${hat ? (istR ? C.smaragd : gew ? C.signal : C.linie) : C.linie}`, background: hat ? (istR ? "#EEF8F2" : gew ? "#FBEFEA" : C.weiss) : C.weiss, opacity: hat && !istR && !gew ? 0.6 : 1 }}>{o}</button>
              );
            })}
          </div>
          {antworten[i] !== undefined && <p style={{ fontSize: 13.5, color: antworten[i] === f.richtig ? C.smaragd : C.signal, marginTop: 6, lineHeight: 1.5 }}>{antworten[i] === f.richtig ? L("Richtig. ", "Correct. ") : L("Nicht ganz. ", "Not quite. ")}{f.erklaerung}</p>}
        </div>
      ))}
      {beantwortet === fragen.length && (
        <p style={{ fontSize: 14.5, fontWeight: 700, color: C.tinte }} role="status">{L(`${richtig} von ${fragen.length} richtig.`, `${richtig} of ${fragen.length} correct.`)}</p>
      )}
    </div>
  );
}

export function Verstehen({ modul, onZurueck, onUeben, onMuster }) {
  const info = modulInfo(modul);
  const [n, setN] = useState(modul === "kubik" ? 4 : 7);
  const [reihe, setReihe] = useState(9);
  const [fa, setFa] = useState(6), [fb, setFb] = useState(7);
  useEffect(() => { kopfAendern((Kp) => markiereEntdeckt(Kp, `${modul}:start`)); }, [modul]);
  const REIHEN = {
    1: L("Die Zahl bleibt gleich.", "The number stays the same."),
    2: L("Verdoppeln – alle Ergebnisse sind gerade.", "Doubling – every result is even."),
    3: L("Die Quersumme jedes Ergebnisses ist durch 3 teilbar.", "The digit sum of every result is divisible by 3."),
    4: L("Zweimal verdoppeln.", "Double twice."),
    5: L("Endet immer auf 0 oder 5 – die Hälfte von mal 10.", "Always ends in 0 or 5 – half of times 10."),
    6: L("Alle Ergebnisse sind gerade und durch 3 teilbar, denn 6 = 2 · 3.", "Every result is even and divisible by 3, since 6 = 2 · 3."),
    7: L("Zerlege: 7 · n = 5 · n + 2 · n.", "Split it: 7 · n = 5 · n + 2 · n."),
    8: L("Dreimal verdoppeln: 8 = 2 · 2 · 2.", "Double three times: 8 = 2 · 2 · 2."),
    9: L("Mal 10 minus die Zahl – und die Quersumme jedes Ergebnisses ist 9.", "Times 10 minus the number – and the digit sum of every result is 9."),
    10: L("Hänge einfach eine Null an.", "Just append a zero."),
  };
  const p = fa * fb;

  const Fuss = (
    <div style={{ display: "grid", gap: 10, marginTop: 6 }}>
      <Knopf onClick={onUeben}>{L("Jetzt mit Unterstützung üben", "Now practise with support")}</Knopf>
      <Knopf haupt={false} onClick={onZurueck}>{L("Zurück zur Übersicht", "Back to overview")}</Knopf>
    </div>
  );

  if (modul === "einmaleins") {
    return (
      <div>
        <Zurueck onClick={onZurueck}>{info.titel}</Zurueck>
        <H2>{L("Verstehen: Muster im Einmaleins", "Understand: patterns in the times tables")}</H2>
        <Absatz>{L("Bevor du abrufst, lohnt ein Blick auf die Ordnung dahinter. Vieles musst du gar nicht einzeln lernen.", "Before you recall, it pays to see the order behind it. Much of it needs no separate learning.")}</Absatz>
        <Abschnitt titel={L("Das Schachbrett: nur 55 von 100 Aufgaben", "The grid: only 55 of 100 problems")}>
          <Absatz style={{ marginBottom: 10 }}>{L("Das Brett ist an der gelben Diagonale gespiegelt: 7 · 8 und 8 · 7 sind dieselbe Tatsache. Wer 55 Aufgaben kennt, kennt alle 100.", "The grid is mirrored on the gold diagonal: 7 · 8 and 8 · 7 are the same fact. Knowing 55 problems means knowing all 100.")}</Absatz>
          <EinmaleinsSchachbrett />
        </Abschnitt>
        <Abschnitt titel={L("Eine Reihe genauer ansehen", "Look at one table closely")}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((r) => (
              <button key={r} type="button" aria-pressed={reihe === r} onClick={() => setReihe(r)}
                style={{ width: 44, height: 44, borderRadius: 999, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${reihe === r ? C.see : C.linie}`, background: reihe === r ? C.see : C.weiss, color: reihe === r ? C.weiss : C.see }}>{r}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 6 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((k) => (
              <div key={k} style={{ background: C.himmel, borderRadius: 10, padding: "7px 10px", fontSize: 14.5, display: "flex", justifyContent: "space-between", fontVariantNumeric: "tabular-nums" }}>
                <span style={{ color: C.see, fontWeight: 700 }}>{reihe} {MAL} {k}</span><span style={{ fontWeight: 800 }}>{reihe * k}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, marginTop: 12 }}><b>{L(`${reihe}er-Reihe:`, `${reihe} times table:`)}</b> {REIHEN[reihe]}</p>
        </Abschnitt>
        <Abschnitt titel={L("Zahlenfamilien: vier Gleichungen, eine Tatsache", "Number families: four equations, one fact")}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            {[[fa, setFa], [fb, setFb]].map(([w, set], i) => (
              <label key={i} style={{ fontSize: 13.5, color: C.grau, display: "flex", alignItems: "center", gap: 8 }}>
                {i === 0 ? L("1. Faktor", "1st factor") : L("2. Faktor", "2nd factor")}
                <select value={w} onChange={(e) => set(Number(e.target.value))} style={{ minHeight: 40, borderRadius: 10, border: `1.5px solid ${C.linie}`, fontFamily: "inherit", fontSize: 15, fontWeight: 700, padding: "0 10px" }}>
                  {Array.from({ length: 10 }, (_, j) => j + 1).map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </label>
            ))}
          </div>
          <Gleichung>{fa} {MAL} {fb} = {p}</Gleichung>
          {fa !== fb && <Gleichung>{fb} {MAL} {fa} = {p}</Gleichung>}
          <Gleichung>{p} : {fa} = {fb}</Gleichung>
          {fa !== fb && <Gleichung>{p} : {fb} = {fa}</Gleichung>}
          <Absatz style={{ marginTop: 8, marginBottom: 0 }}>{L("Wer die Multiplikation kennt, kennt die Division gleich mit – und umgekehrt.", "Knowing the multiplication means knowing the division too – and the other way round.")}</Absatz>
        </Abschnitt>
        <Abschnitt titel={L("Probier es aus", "Try it")}>
          <MusterCheck id="einmaleins" fragen={[
            { frage: L("Welche Quersumme haben alle Ergebnisse der 9er-Reihe (9 bis 90)?", "What digit sum do all results of the 9 times table (9 to 90) have?"), optionen: ["9", "10", "18", L("jedes Ergebnis eine andere", "a different one each time")], richtig: 0, erklaerung: L("18 → 1 + 8 = 9, 27 → 2 + 7 = 9, 36 → 9 … immer 9.", "18 → 1 + 8 = 9, 27 → 2 + 7 = 9, 36 → 9 … always 9.") },
            { frage: L("Womit enden alle Ergebnisse der 5er-Reihe?", "What do all results of the 5 times table end in?"), optionen: [L("mit 0 oder 5", "0 or 5"), L("mit 5 oder 6", "5 or 6"), L("mit 2 oder 7", "2 or 7"), L("mit jeder Ziffer", "any digit")], richtig: 0, erklaerung: L("5 · n ist die Hälfte von 10 · n: also …0 oder …5.", "5 · n is half of 10 · n: so …0 or …5.") },
            { frage: L("Warum musst du 7 · 8 und 8 · 7 nicht getrennt lernen?", "Why do you not need to learn 7 · 8 and 8 · 7 separately?"), optionen: [L("Die Reihenfolge der Faktoren ändert das Ergebnis nicht.", "The order of the factors does not change the result."), L("8 · 7 ist viel leichter.", "8 · 7 is much easier."), L("Beide sind nie dran.", "Neither ever comes up."), L("Eine der beiden ist falsch.", "One of them is wrong.")], richtig: 0, erklaerung: L("Beide ergeben 56 – das Schachbrett ist an der Diagonale gespiegelt.", "Both give 56 – the grid is mirrored on its diagonal.") },
            { frage: L("Aus 6 · 7 = 42 folgt …", "From 6 · 7 = 42 it follows …"), optionen: ["42 : 6 = 7", "42 : 6 = 8", "42 − 6 = 7", "6 + 7 = 42"], richtig: 0, erklaerung: L("Division ist die Umkehrung der Multiplikation.", "Division is the reverse of multiplication.") },
          ]} />
        </Abschnitt>
        {Fuss}
      </div>
    );
  }

  if (modul === "quadrate") {
    const summe = Array.from({ length: Math.min(n, 8) }, (_, i) => 2 * i + 1);
    return (
      <div>
        <Zurueck onClick={onZurueck}>{info.titel}</Zurueck>
        <H2>{L("Verstehen: Quadratzahlen wachsen mit ungeraden Zahlen", "Understand: square numbers grow by odd numbers")}</H2>
        <Absatz>{L("n² ist die Fläche eines Quadrats mit der Seitenlänge n. Wenn die Seite um 1 wächst, kommt ein Winkel aus Kästchen dazu – und dessen Größe folgt einem festen Muster.", "n² is the area of a square with side n. When the side grows by 1, an L-shaped strip of cells is added – and its size follows a fixed pattern.")}</Absatz>
        <Abschnitt titel={L("Vom Quadrat zum nächsten Quadrat", "From one square to the next")}>
          <QuadratBild n={n} />
          <Regler wert={n} setWert={setN} min={1} max={24} label={L("Seitenlänge", "Side length")} />
          <Gleichung>{n}² = {n * n}</Gleichung>
          <Gleichung>{n + 1}² = {n}² + 2 {MAL} {n} + 1 = {n * n} + {2 * n + 1} = {(n + 1) ** 2}</Gleichung>
          <Absatz style={{ marginTop: 10, marginBottom: 0 }}>{L(`Der gelbe Winkel hat 2 · ${n} + 1 = ${2 * n + 1} Kästchen: immer die nächste ungerade Zahl.`, `The gold strip has 2 · ${n} + 1 = ${2 * n + 1} cells: always the next odd number.`)}</Absatz>
        </Abschnitt>
        <Abschnitt titel={L("Die Treppe der ungeraden Zahlen", "The staircase of odd numbers")}>
          <Gleichung>{summe.join(" + ")}{n > 8 ? " + …" : ""} = {n}²</Gleichung>
          <Absatz style={{ marginTop: 8, marginBottom: 0 }}>{L("Die Summe der ersten n ungeraden Zahlen ist n². Daraus findest du jedes Quadrat vom Nachbarn: 17² = 16² + 33 = 256 + 33 = 289.", "The sum of the first n odd numbers is n². From that you get any square from its neighbour: 17² = 16² + 33 = 256 + 33 = 289.")}</Absatz>
        </Abschnitt>
        <Abschnitt titel={L("Zwei Kniffe fürs Kopfrechnen", "Two tricks for mental maths")}>
          <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.65, marginBottom: 10 }}><b>{L("Zahlen mit Endziffer 5:", "Numbers ending in 5:")}</b> {L("Rechne k · (k + 1) und hänge 25 an. 15²: 1 · 2 = 2 → 225. 25²: 2 · 3 = 6 → 625.", "Work out k · (k + 1) and append 25. 15²: 1 · 2 = 2 → 225. 25²: 2 · 3 = 6 → 625.")}</p>
          <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.65 }}><b>{L("Zerlegen:", "Splitting:")}</b> {L("(a + b)² = a² + 2ab + b². 23² = 20² + 2 · 20 · 3 + 3² = 400 + 120 + 9 = 529.", "(a + b)² = a² + 2ab + b². 23² = 20² + 2 · 20 · 3 + 3² = 400 + 120 + 9 = 529.")}</p>
        </Abschnitt>
        <Abschnitt titel={L("Probier es aus", "Try it")}>
          <MusterCheck id="quadrate" fragen={[
            { frage: L("Welche Endziffer kann eine Quadratzahl nie haben?", "Which last digit can a square number never have?"), optionen: ["3", "5", "6", "1"], richtig: 0, erklaerung: L("Quadratzahlen enden nur auf 0, 1, 4, 5, 6 oder 9.", "Square numbers only end in 0, 1, 4, 5, 6 or 9.") },
            { frage: L("Wie viel kommt von 9² auf 10² dazu?", "How much is added from 9² to 10²?"), optionen: ["18", "19", "20", "10"], richtig: 1, erklaerung: L("2 · 9 + 1 = 19: 81 + 19 = 100.", "2 · 9 + 1 = 19: 81 + 19 = 100.") },
            { frage: L("Was ist 15² mit dem 5er-Trick?", "What is 15² using the trick for 5s?"), optionen: ["215", "225", "235", "255"], richtig: 1, erklaerung: L("1 · 2 = 2, dann 25 anhängen: 225.", "1 · 2 = 2, then append 25: 225.") },
          ]} />
          <div style={{ marginTop: 6 }}><Knopf haupt={false} onClick={onMuster} style={{ width: "100%" }}>{L("Drei Muster-Aufgaben rechnen", "Work three pattern problems")}</Knopf></div>
        </Abschnitt>
        <Abschnitt titel={L("Alle Quadratzahlen im Überblick", "All square numbers at a glance")}>
          <PotenzSpalten hoch={2} bloecke={[[1, 10], [11, 20], [21, 25]]} />
        </Abschnitt>
        {Fuss}
      </div>
    );
  }

  const w = Math.min(n, 10);
  return (
    <div>
      <Zurueck onClick={onZurueck}>{info.titel}</Zurueck>
      <H2>{L("Verstehen: Was eine Kubikzahl ist", "Understand: what a cube number is")}</H2>
      <Absatz>{L("n³ ist die Zahl der Würfelchen in einem Würfel mit der Kantenlänge n – also n Schichten, jede mit n · n Würfelchen. Potenzen sind nur eine kurze Schreibweise für wiederholtes Malnehmen.", "n³ is the number of blocks in a cube with edge length n – so n layers, each with n · n blocks. Powers are just a short way to write repeated multiplication.")}</Absatz>
      <Abschnitt titel={L("Schicht für Schicht", "Layer by layer")}>
        <WuerfelBild n={w} />
        <Regler wert={w} setWert={setN} min={1} max={10} label={L("Kantenlänge", "Edge length")} />
        <Gleichung>{w}³ = {w} {MAL} {w} {MAL} {w}</Gleichung>
        <Gleichung>= {w * w} {MAL} {w} = {w ** 3}</Gleichung>
        <Absatz style={{ marginTop: 10, marginBottom: 0 }}>{L(`Erst eine Schicht (${w} · ${w} = ${w * w}), dann ${w} Schichten übereinander.`, `First one layer (${w} · ${w} = ${w * w}), then ${w} layers stacked.`)}</Absatz>
      </Abschnitt>
      <Abschnitt titel={L("Quadrat und Kubik zugleich", "Square and cube at once")}>
        <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.65 }}>{L("Manche Zahlen sind beides: 1 = 1² = 1³ und 64 = 8² = 4³. (Auch 729 = 27² = 9³ – aber 27² liegt außerhalb der Quadratzahlen bis 625.) Beim Zuordnen von Zahlen lohnt sich deshalb immer die Frage: Quadrat, Kubik oder beides?", "Some numbers are both: 1 = 1² = 1³ and 64 = 8² = 4³. (Also 729 = 27² = 9³ – but 27² lies beyond the squares up to 625.) So when classifying numbers, always ask: square, cube or both?")}</p>
      </Abschnitt>
      <Abschnitt titel={L("Probier es aus", "Try it")}>
        <MusterCheck id="kubik" fragen={[
          { frage: L("Was bedeutet 5³?", "What does 5³ mean?"), optionen: ["5 · 5 · 5 = 125", "5 · 3 = 15", "5 + 5 + 5 = 15", "3 · 3 · 3 · 3 · 3 = 243"], richtig: 0, erklaerung: L("Die 3 sagt, wie oft die 5 als Faktor vorkommt.", "The 3 tells you how many times 5 appears as a factor.") },
          { frage: L("Welche Zahl ist Quadrat- und Kubikzahl zugleich?", "Which number is both a square and a cube?"), optionen: ["27", "64", "100", "125"], richtig: 1, erklaerung: L("64 = 8² = 4³. 27 und 125 sind nur Kubikzahlen, 100 nur eine Quadratzahl.", "64 = 8² = 4³. 27 and 125 are only cubes, 100 only a square.") },
          { frage: L("Die Kante eines Würfels wird verdoppelt (2³ → 4³). Wie viel mal so viele Würfelchen sind es?", "The edge of a cube is doubled (2³ → 4³). How many times as many blocks is that?"), optionen: [L("2-mal", "2 times"), L("4-mal", "4 times"), L("8-mal", "8 times"), L("6-mal", "6 times")], richtig: 2, erklaerung: L("8 → 64, das ist das 8-Fache: 2 · 2 · 2.", "8 → 64, which is 8 times as many: 2 · 2 · 2.") },
        ]} />
      </Abschnitt>
      <Abschnitt titel={L("Alle Kubikzahlen im Überblick", "All cube numbers at a glance")}>
        <PotenzSpalten hoch={3} bloecke={[[1, 10]]} />
      </Abschnitt>
      {Fuss}
    </div>
  );
}

