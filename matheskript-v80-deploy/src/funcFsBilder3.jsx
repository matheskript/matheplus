/* ======================================================================
   FORMELSAMMLUNG · Illustrationen Teil 3: Stochastik, Logik, Zahlen
   ====================================================================== */
import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { F, Hinweis, Messzeile, Punkt, Regler, Txt, Umschalter, svgStil, z } from "./funcFsBasis.jsx";

const binom = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
const bpdf = (n, p, k) => binom(n, k) * p ** k * (1 - p) ** (n - k);
const prozent = (v) => `${z(v * 100)} %`;

/* ---------- Laplace: zwei Würfel ---------- */
function Laplace() {
  const [summe, setSumme] = useState(7);
  const zellen = [];
  let treffer = 0;
  for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) {
    const an = i + j === summe;
    if (an) treffer++;
    zellen.push(
      <g key={`${i}-${j}`}>
        <rect x={52 + (j - 1) * 40} y={22 + (i - 1) * 30} width="36" height="26" rx="6" fill={an ? F.gold2 : F.blau} stroke={an ? F.gold3 : "none"} strokeWidth="1.5" />
        <text x={70 + (j - 1) * 40} y={39 + (i - 1) * 30} textAnchor="middle" fontSize="11" fill={F.tinte}>{`${i}|${j}`}</text>
      </g>
    );
  }
  return (
    <div>
      <Hinweis>Alle 36 Paare zweier Würfel sind gleich wahrscheinlich. Wähle eine Augensumme und zähle die günstigen Felder.</Hinweis>
      <svg viewBox="0 0 340 210" style={svgStil} role="img" aria-label="Tabelle aller 36 Würfelpaare mit markierter Augensumme">
        {[1, 2, 3, 4, 5, 6].map((j) => <text key={"s" + j} x={70 + (j - 1) * 40} y={14} textAnchor="middle" fontSize="11" fontWeight="700" fill={F.grau}>{j}</text>)}
        {[1, 2, 3, 4, 5, 6].map((i) => <text key={"z" + i} x={38} y={39 + (i - 1) * 30} textAnchor="middle" fontSize="11" fontWeight="700" fill={F.grau}>{i}</text>)}
        {zellen}
      </svg>
      <Regler label="Augensumme" wert={summe} setze={setSumme} min={2} max={12} schritt={1} anzeige={summe} />
      <Messzeile>Augensumme {summe}: <M t={`P = \\frac{${treffer}}{36} \\approx ${z(treffer / 36)}`} /></Messzeile>
    </div>
  );
}

/* ---------- Venn-Diagramme ---------- */
const VENN_HINWEIS = { gegen: "Das Gegenereignis Ā ist alles, was nicht in A liegt.", element: "x liegt in A, y nicht.", teilmenge: "A liegt ganz in B: Jedes Element von A ist auch in B.", vereinigung: "Gefärbt ist alles, was in A oder in B (oder in beiden) liegt.", schnitt: "Gefärbt ist nur, was in A und zugleich in B liegt.", differenz: "Gefärbt ist A ohne die Elemente von B." };
function Venn({ modus = "addition" }) {
  const [teil, setTeil] = useState(modus === "demorgan" ? "links" : "a");
  const A = { cx: 128, cy: 104, r: 62 }, B = { cx: 212, cy: 104, r: 62 };
  const id = `venn-${modus}`;
  const zeige = {
    gegen: teil === "a" ? ["A"] : ["nichtA"],
    addition: teil === "a" ? ["A"] : teil === "b" ? ["B"] : teil === "schnitt" ? ["AB"] : ["A", "B"],
    element: ["A"], teilmenge: ["A"], vereinigung: ["A", "B"], schnitt: ["AB"], differenz: ["AohneB"],
    demorgan: ["nichtAoderB"],
  }[modus] || ["A"];
  const istTeil = modus === "teilmenge";
  const a = istTeil ? { cx: 170, cy: 110, r: 42 } : A, b = istTeil ? { cx: 170, cy: 104, r: 82 } : B;
  return (
    <div>
      {VENN_HINWEIS[modus] && <Hinweis>{VENN_HINWEIS[modus]}</Hinweis>}
      {modus === "addition" && <Hinweis>Zähle A und B zusammen: Die Mitte wird doppelt erfasst – deshalb wird sie einmal abgezogen.</Hinweis>}
      {modus === "demorgan" && <Hinweis>Links: alles außerhalb von A ∪ B. Rechts: was außerhalb von A und zugleich außerhalb von B liegt. Es ist dieselbe Fläche.</Hinweis>}
      <svg viewBox="0 0 340 210" style={svgStil} role="img" aria-label="Mengendiagramm">
        <defs>
          <clipPath id={`${id}-a`}><circle cx={a.cx} cy={a.cy} r={a.r} /></clipPath>
          <clipPath id={`${id}-b`}><circle cx={b.cx} cy={b.cy} r={b.r} /></clipPath>
          <mask id={`${id}-ohneB`}><rect width="340" height="210" fill="white" /><circle cx={b.cx} cy={b.cy} r={b.r} fill="black" /></mask>
          <mask id={`${id}-aussen`}><rect width="340" height="210" fill="white" /><circle cx={a.cx} cy={a.cy} r={a.r} fill="black" />{modus !== "gegen" && <circle cx={b.cx} cy={b.cy} r={b.r} fill="black" />}</mask>
        </defs>
        <rect x="14" y="10" width="312" height="190" rx="14" fill="#FBFCFE" stroke={F.achse} />
        {(zeige.includes("nichtA") || zeige.includes("nichtAoderB")) && <rect x="14" y="10" width="312" height="190" rx="14" fill={F.gold2} mask={`url(#${id}-aussen)`} />}
        {zeige.includes("A") && <circle cx={a.cx} cy={a.cy} r={a.r} fill={F.blau} />}
        {zeige.includes("B") && <circle cx={b.cx} cy={b.cy} r={b.r} fill={F.rosa} opacity={zeige.includes("A") ? 0.75 : 1} />}
        {zeige.includes("AB") && <circle cx={b.cx} cy={b.cy} r={b.r} fill={F.gold2} clipPath={`url(#${id}-a)`} />}
        {modus === "addition" && teil === "beide" && <circle cx={b.cx} cy={b.cy} r={b.r} fill={F.lila} opacity="0.4" clipPath={`url(#${id}-a)`} />}
        {zeige.includes("AohneB") && <circle cx={a.cx} cy={a.cy} r={a.r} fill={F.blau} mask={`url(#${id}-ohneB)`} />}
        <circle cx={a.cx} cy={a.cy} r={a.r} fill="none" stroke={F.see} strokeWidth="2" />
        {modus !== "gegen" && modus !== "element" && <circle cx={b.cx} cy={b.cy} r={b.r} fill="none" stroke={F.rosaKraeftig} strokeWidth="2" />}
        <Txt x={istTeil ? a.cx : a.cx - 30} y={istTeil ? a.cy + 5 : a.cy - a.r + 22} farbe={F.see} gr={15}>A</Txt>
        {modus !== "gegen" && modus !== "element" && <Txt x={istTeil ? b.cx + 52 : b.cx + 30} y={istTeil ? b.cy - 50 : b.cy - b.r + 22} farbe={F.rosaKraeftig} gr={15}>B</Txt>}
        {modus === "element" && <><Punkt x={110} y={118} farbe={F.tinte} /><Txt x={110} y={108} gr={12}>x</Txt><Punkt x={268} y={60} farbe={F.tinte} /><Txt x={268} y={50} gr={12}>y</Txt></>}
        {modus === "gegen" && <Txt x={290} y={186} farbe={F.gold3} gr={13}>Ā</Txt>}
        {modus === "addition" && teil === "beide" && <Txt x={170} y={110} farbe={F.lila} gr={11}>2×</Txt>}
      </svg>
      {modus === "gegen" && <Umschalter label="Ereignis" wert={teil} setze={setTeil} optionen={[["a", "A"], ["nicht", "Gegenereignis Ā"]]} />}
      {modus === "addition" && <Umschalter label="Teil" wert={teil} setze={setTeil} optionen={[["a", "P(A)"], ["b", "P(B)"], ["beide", "P(A) + P(B)"], ["schnitt", "P(A ∩ B)"]]} />}
      {modus === "addition" && <Messzeile>{teil === "beide" ? "Die Mitte ist doppelt gefärbt – einmal abziehen." : teil === "schnitt" ? "Diesen Teil zieht der Additionssatz ab." : "Jede Menge für sich."}</Messzeile>}
      {modus === "demorgan" && <Messzeile><M t={"\\overline{A \\cup B} = \\overline{A} \\cap \\overline{B}"} /></Messzeile>}
    </div>
  );
}

/* ---------- Baumdiagramme ---------- */
function Baum({ modus = "pfad" }) {
  const [p, setP] = useState(modus === "bayes" ? 0.1 : 0.6);
  const [q1, setQ1] = useState(modus === "bayes" ? 0.9 : 0.5);
  const [q2, setQ2] = useState(modus === "bayes" ? 0.2 : 0.25);
  const [n, setN] = useState(3);
  if (modus === "mindestens") {
    const pp = 1 / 6;
    const tiefe = n;
    const knoten = [];
    const brk = (x, y, d, nur) => {
      if (d === tiefe) return;
      const dy = 120 / 2 ** (d + 0.2);
      const ys = [y - dy * 0.55, y + dy * 0.55];
      [0, 1].forEach((s) => {
        const niete = s === 1;
        const x2 = x + 300 / tiefe, y2 = ys[s];
        const hervor = nur && niete;
        knoten.push(<line key={`${d}-${x}-${y}-${s}`} x1={x} y1={y} x2={x2} y2={y2} stroke={hervor ? F.rosaKraeftig : F.achse} strokeWidth={hervor ? 2.6 : 1.2} />);
        if (d < 3 || tiefe <= 3) knoten.push(<circle key={`c${d}-${x}-${y}-${s}`} cx={x2} cy={y2} r={hervor ? 4 : 2.5} fill={hervor ? F.rosaKraeftig : F.achse} />);
        brk(x2, y2, d + 1, hervor);
      });
    };
    brk(20, 120, 0, true);
    return (
      <div>
        <Hinweis>Nur der rosa Pfad enthält gar keinen Treffer. Alle anderen Pfade sind »mindestens einmal« – deshalb rechnet man 1 minus diesen einen Pfad.</Hinweis>
        <svg viewBox="0 0 340 240" style={svgStil} role="img" aria-label="Baumdiagramm mit hervorgehobenem Pfad ohne Treffer">{knoten}</svg>
        <Regler label="Anzahl der Würfe n" wert={n} setze={setN} min={1} max={6} schritt={1} anzeige={n} />
        <Messzeile>Mindestens eine Sechs: <M t={`1 - \\left(\\frac{5}{6}\\right)^{${n}} = ${z(1 - (1 - pp) ** n)}`} /></Messzeile>
      </div>
    );
  }
  const A = modus === "bayes" ? "K" : "A", nA = modus === "bayes" ? "K̄" : "Ā", B = modus === "bayes" ? "+" : "B", nB = modus === "bayes" ? "−" : "B̄";
  const pfade = [[p * q1, A, B], [p * (1 - q1), A, nB], [(1 - p) * q2, nA, B], [(1 - p) * (1 - q2), nA, nB]];
  const hl = (i) => (modus === "total" || modus === "bayes" ? i === 0 || i === 2 : modus === "pfad" ? i === 0 : false);
  const pB = p * q1 + (1 - p) * q2;
  const Y = [44, 92, 148, 196];
  return (
    <div>
      <Hinweis>{modus === "bayes" ? "Von allen Positiven (gold) ist nur der obere Pfad wirklich krank. Verändere die Basisrate und beobachte P(K | +)."
        : modus === "total" ? "Zwei Pfade führen zu B – ihre Wahrscheinlichkeiten werden addiert."
          : "Entlang eines Pfades wird multipliziert. Die vier Pfade zusammen ergeben 1."}</Hinweis>
      <svg viewBox="0 0 340 240" style={svgStil} role="img" aria-label="Zweistufiges Baumdiagramm">
        <circle cx="20" cy="120" r="4" fill={F.tinte} />
        {[[68, A, p], [172, nA, 1 - p]].map(([y, name, w], i) => (
          <g key={name}>
            <line x1="20" y1="120" x2="120" y2={y} stroke={F.see} strokeWidth="1.8" />
            <Txt x={64} y={(120 + y) / 2 + (i ? 16 : -6)} gr={11} farbe={F.see}>{z(w)}</Txt>
            <circle cx="120" cy={y} r="13" fill={C.weiss} stroke={F.see} strokeWidth="1.5" />
            <Txt x={120} y={y + 4} gr={12}>{name}</Txt>
          </g>
        ))}
        {pfade.map(([w, a, b], i) => {
          const y0 = i < 2 ? 68 : 172, wk = i % 2 === 0 ? (i < 2 ? q1 : q2) : (i < 2 ? 1 - q1 : 1 - q2);
          return (
            <g key={i}>
              <line x1="133" y1={y0} x2="222" y2={Y[i]} stroke={hl(i) ? F.gold3 : F.see} strokeWidth={hl(i) ? 3 : 1.6} />
              <Txt x={176} y={(y0 + Y[i]) / 2 + (i % 2 ? 14 : -5)} gr={10.5} farbe={F.see}>{z(wk)}</Txt>
              <circle cx="232" cy={Y[i]} r="11" fill={hl(i) ? F.gold : C.weiss} stroke={hl(i) ? F.gold3 : F.see} strokeWidth="1.5" />
              <Txt x={232} y={Y[i] + 4} gr={11}>{b}</Txt>
              <Txt x={252} y={Y[i] + 4} anker="start" gr={11} farbe={hl(i) ? F.gold3 : F.grau}>{z(w)}</Txt>
            </g>
          );
        })}
      </svg>
      <Regler label={modus === "bayes" ? "P(K) Basisrate" : "P(A)"} wert={p} setze={setP} min={0.01} max={0.99} anzeige={z(p)} />
      <Regler label={modus === "bayes" ? "P(+ | K)" : "P(B | A)"} wert={q1} setze={setQ1} min={0} max={1} anzeige={z(q1)} />
      <Regler label={modus === "bayes" ? "P(+ | K̄)" : "P(B | Ā)"} wert={q2} setze={setQ2} min={0} max={1} anzeige={z(q2)} />
      <Messzeile>
        {modus === "pfad" && <M t={`P(A \\cap B) = ${z(p)} \\cdot ${z(q1)} = ${z(p * q1)}`} />}
        {modus === "total" && <M t={`P(B) = ${z(p * q1)} + ${z((1 - p) * q2)} = ${z(pB)}`} />}
        {modus === "bayes" && <M t={`P(K | +) = \\frac{${z(p * q1)}}{${z(pB)}} = ${z(pB ? (p * q1) / pB : 0)}`} />}
      </Messzeile>
    </div>
  );
}

/* ---------- Vier-Felder-Tafel ---------- */
function VierFelder({ modus }) {
  const [pa, setPa] = useState(0.4);
  const [pb, setPb] = useState(0.5);
  const [pab, setPab] = useState(modus === "unabh" ? 0.2 : 0.3);
  const [fokus, setFokus] = useState("zeile");
  const ab = Math.min(pab, pa, pb), anb = pa - ab, nab = pb - ab, nanb = 1 - pa - pb + ab;
  const ok = nanb >= -1e-9;
  const feld = (x, y, w, txt, an, farbe = F.blau) => (
    <g>
      <rect x={x} y={y} width={w} height="38" rx="8" fill={an ? farbe : "#F4F6FA"} stroke={an ? F.see : "none"} strokeWidth="1.4" />
      <Txt x={x + w / 2} y={y + 24} gr={13} farbe={F.tinte}>{txt}</Txt>
    </g>
  );
  const bed = modus === "bedingt";
  const unab = Math.abs(ab - pa * pb) < 0.005;
  return (
    <div>
      <Hinweis>{bed ? "Bei einer bedingten Wahrscheinlichkeit wird nur noch eine Zeile (oder Spalte) betrachtet – sie wird zur neuen Gesamtheit."
        : modus === "unabh" ? "Unabhängig heißt: Jedes Feld ist das Produkt seiner Randwerte. Stell P(A ∩ B) so ein, dass es passt."
          : "Innen die vier Schnittwahrscheinlichkeiten, außen die Summen. Alles zusammen ergibt 1."}</Hinweis>
      <svg viewBox="0 0 340 190" style={svgStil} role="img" aria-label="Vier-Felder-Tafel">
        <Txt x={128} y={22} gr={12}>B</Txt><Txt x={208} y={22} gr={12}>B̄</Txt><Txt x={290} y={22} gr={11} farbe={F.grau}>Σ</Txt>
        <Txt x={40} y={56} gr={12}>A</Txt><Txt x={40} y={100} gr={12}>Ā</Txt><Txt x={40} y={150} gr={11} farbe={F.grau}>Σ</Txt>
        {feld(90, 32, 76, z(ab), bed ? fokus === "zeile" || fokus === "spalte" : true, bed ? F.gold2 : F.blau)}
        {feld(170, 32, 76, z(anb), bed ? fokus === "zeile" : true, bed ? F.blau : F.blau)}
        {feld(90, 76, 76, z(nab), bed ? fokus === "spalte" : true)}
        {feld(170, 76, 76, ok ? z(nanb) : "–", !bed)}
        {feld(258, 32, 64, z(pa), bed && fokus === "zeile", F.rosa)}
        {feld(258, 76, 64, z(1 - pa), false)}
        {feld(90, 126, 76, z(pb), bed && fokus === "spalte", F.rosa)}
        {feld(170, 126, 76, z(1 - pb), false)}
        {feld(258, 126, 64, "1", false)}
      </svg>
      {bed && <Umschalter label="Bedingung" wert={fokus} setze={setFokus} optionen={[["zeile", "unter der Bedingung A"], ["spalte", "unter der Bedingung B"]]} />}
      <Regler label="P(A)" wert={pa} setze={setPa} min={0.05} max={0.95} schritt={0.05} anzeige={z(pa)} />
      <Regler label="P(B)" wert={pb} setze={setPb} min={0.05} max={0.95} schritt={0.05} anzeige={z(pb)} />
      <Regler label="P(A ∩ B)" wert={pab} setze={setPab} min={0} max={0.9} schritt={0.01} anzeige={z(ab)} />
      <Messzeile>
        {!ok && <div style={{ color: F.rosaKraeftig }}>Diese Kombination ist unmöglich – ein Feld würde negativ.</div>}
        {bed && ok && (fokus === "zeile" ? <M t={`P_A(B) = \\frac{${z(ab)}}{${z(pa)}} = ${z(ab / pa)}`} /> : <M t={`P_B(A) = \\frac{${z(ab)}}{${z(pb)}} = ${z(ab / pb)}`} />)}
        {modus === "unabh" && ok && <div><M t={`P(A) \\cdot P(B) = ${z(pa * pb)}`} /> · <b style={{ color: unab ? F.gruenKraeftig : F.rosaKraeftig }}>{unab ? "unabhängig" : "abhängig"}</b></div>}
        {!bed && modus !== "unabh" && ok && <M t={`P(A) = ${z(ab)} + ${z(anb)} = ${z(pa)}`} />}
      </Messzeile>
    </div>
  );
}

/* ---------- Urne und Zählen ---------- */
function Urne({ modus = "mo" }) {
  const [n, setN] = useState(modus === "om" ? 3 : 5);
  const [k, setK] = useState(3);
  const kk = Math.min(k, modus === "mm" || modus === "om" ? 6 : n);
  const farben = ["#004D98", "#B98A00", "#C2557A", "#2F8F5B", "#7B4FA0", "#0E8A9B", "#B85C2E", "#5A6582"];
  const plaetze = [];
  let produkt = 1;
  const faktoren = [];
  for (let i = 0; i < (modus === "perm" ? n : kk); i++) {
    const moeglich = modus === "mm" ? n : modus === "perm" || modus === "mo" ? n - i : null;
    if (moeglich !== null) { produkt *= moeglich; faktoren.push(moeglich); }
    plaetze.push(
      <g key={i}>
        <rect x={20 + i * 50} y={110} width="42" height="42" rx="10" fill={F.blau} stroke={F.see} />
        {moeglich !== null && <Txt x={41 + i * 50} y={137} gr={15} farbe={F.see}>{moeglich}</Txt>}
        <text x={41 + i * 50} y={170} fontSize="10" textAnchor="middle" fill={F.grau}>{`${i + 1}.`}</text>
      </g>
    );
  }
  const anzahl = modus === "om" ? binom(n + kk - 1, kk) : modus === "hyper" ? binom(n, kk) : produkt;
  return (
    <div>
      <Hinweis>{modus === "mm" ? "Bei jeder Ziehung stehen wieder alle n Möglichkeiten zur Verfügung."
        : modus === "om" ? "Nur die Anzahl je Sorte zählt. Sterne für die Kugeln, Striche als Trennwände zwischen den Sorten."
          : modus === "hyper" ? "Alle Kugeln liegen in einer Urne; gezogen wird ohne Zurücklegen."
            : "Jeder Platz hat eine Möglichkeit weniger als der vorige."}</Hinweis>
      <svg viewBox="0 0 340 190" style={svgStil} role="img" aria-label="Urne und Plätze für die gezogenen Kugeln">
        <path d="M120 14 h100 l-8 76 h-84 z" fill="#F4F6FA" stroke={F.achse} strokeWidth="1.5" />
        {Array.from({ length: n }, (_, i) => <circle key={i} cx={140 + (i % 5) * 15} cy={36 + Math.floor(i / 5) * 18} r="7" fill={farben[i % farben.length]} opacity="0.9" />)}
        {modus === "om" ? (
          <g>
            {(() => { const teile = []; let pos = 0; const anteile = [2, 1, kk - 3 >= 0 ? kk - 3 : 0].slice(0, n); const verteilung = []; let rest = kk; for (let s = 0; s < n; s++) { const v = s === n - 1 ? rest : Math.min(rest, anteile[s] ?? 0); verteilung.push(v); rest -= v; }
              verteilung.forEach((v, s) => { for (let j = 0; j < v; j++) teile.push(<Txt key={`s${s}-${j}`} x={30 + pos++ * 24} y={140} gr={20} farbe={farben[s]}>∗</Txt>); if (s < n - 1) teile.push(<line key={`t${s}`} x1={30 + pos * 24 - 4} x2={30 + pos++ * 24 - 4} y1={118} y2={150} stroke={F.tinte} strokeWidth="2.4" />); });
              return teile; })()}
          </g>
        ) : modus === "hyper" ? null : plaetze}
      </svg>
      <Regler label="n" wert={n} setze={setN} min={2} max={8} schritt={1} anzeige={n} />
      {modus !== "perm" && <Regler label="k" wert={k} setze={setK} min={1} max={modus === "mm" || modus === "om" ? 6 : n} schritt={1} anzeige={kk} />}
      <Messzeile>
        {modus === "om" ? <M t={`\\binom{${n} + ${kk} - 1}{${kk}} = \\binom{${n + kk - 1}}{${kk}} = ${anzahl}`} />
          : modus === "hyper" ? <M t={`\\binom{${n}}{${kk}} = ${anzahl}`} />
            : <M t={`${faktoren.join(" \\cdot ")} = ${anzahl}`} />}
      </Messzeile>
    </div>
  );
}

/* ---------- Pascalsches Dreieck ---------- */
function Pascal() {
  const [wahl, setWahl] = useState([4, 2]);
  const zeilen = 7;
  const elemente = [];
  for (let n = 0; n < zeilen; n++) for (let k = 0; k <= n; k++) {
    const x = 170 + (k - n / 2) * 42, y = 22 + n * 30;
    const an = wahl[0] === n && wahl[1] === k;
    const quelle = wahl[0] - 1 === n && (wahl[1] - 1 === k || wahl[1] === k);
    elemente.push(
      <g key={`${n}-${k}`} onClick={() => setWahl([n, k])} style={{ cursor: "pointer" }}>
        <circle cx={x} cy={y} r="15" fill={an ? F.gold2 : quelle ? F.blau : "#F4F6FA"} stroke={an ? F.gold3 : quelle ? F.see : "none"} strokeWidth="1.5" />
        <Txt x={x} y={y + 4} gr={12} farbe={F.tinte}>{binom(n, k)}</Txt>
      </g>
    );
  }
  const [n, k] = wahl;
  return (
    <div>
      <Hinweis>Tippe auf eine Zahl: Sie ist die Summe der beiden Zahlen darüber (blau).</Hinweis>
      <svg viewBox="0 0 340 215" style={svgStil} role="img" aria-label="Pascalsches Dreieck">{elemente}</svg>
      <Messzeile>
        {n > 0 && k > 0 && k < n ? <M t={`\\binom{${n}}{${k}} = \\binom{${n - 1}}{${k - 1}} + \\binom{${n - 1}}{${k}} = ${binom(n - 1, k - 1)} + ${binom(n - 1, k)} = ${binom(n, k)}`} />
          : <M t={`\\binom{${n}}{${k}} = ${binom(n, k)}`} />}
      </Messzeile>
    </div>
  );
}

/* ---------- Erwartungswert als Schwerpunkt ---------- */
function Erwartung({ fair = false, streuung = false }) {
  const [ein, setEin] = useState(1);
  const werte = fair ? [{ x: 5 - ein, p: 1 / 6 }, { x: -ein, p: 5 / 6 }] : [{ x: 1, p: 0.1 }, { x: 2, p: 0.2 }, { x: 3, p: 0.4 }, { x: 4, p: 0.2 }, { x: 6, p: 0.1 }];
  const mu = werte.reduce((s, w) => s + w.x * w.p, 0);
  const V = werte.reduce((s, w) => s + (w.x - mu) ** 2 * w.p, 0);
  const x0 = fair ? -3 : 0, x1 = fair ? 6 : 7;
  const px = (x) => 24 + ((x - x0) / (x1 - x0)) * 292;
  const pmax = Math.max(...werte.map((w) => w.p)), hs = 100 / pmax;
  const balken = werte.map((w, i) => (
    <g key={i}>
      <rect x={px(w.x) - 12} y={140 - w.p * hs} width="24" height={w.p * hs} rx="4" fill={F.blau} stroke={F.see} />
      <Txt x={px(w.x)} y={132 - w.p * hs} gr={10} farbe={F.see}>{z(w.p)}</Txt>
      {streuung && <line x1={px(mu)} x2={px(w.x)} y1={150 + i * 5} y2={150 + i * 5} stroke={F.rosaKraeftig} strokeWidth={1 + w.p * 10} opacity="0.55" />}
    </g>
  ));
  const neigung = Math.max(-12, Math.min(12, (fair ? mu : mu - 3.15) * 6));
  return (
    <div>
      <Hinweis>{fair ? "Verschiebe den Einsatz, bis die Wippe im Gleichgewicht ist: Dort ist der Erwartungswert 0 – das Spiel ist fair."
        : streuung ? "Die rosa Striche zeigen die Abstände zu μ, ihre Dicke die Wahrscheinlichkeit. Die Varianz mittelt die Quadrate dieser Abstände."
          : "Die Wahrscheinlichkeiten sind Gewichte auf einem Lineal. Der Erwartungswert ist der Punkt, an dem es balanciert."}</Hinweis>
      <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Wahrscheinlichkeitsverteilung als Gewichte auf einer Wippe">
        <g transform={fair ? `rotate(${-neigung * 0} 170 140)` : undefined}>
          {balken}
          <line x1={20} x2={320} y1={140} y2={140} stroke={F.tinte} strokeWidth="2" />
          {Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i).map((x) => <text key={x} x={px(x)} y={186} fontSize="9.5" textAnchor="middle" fill={F.achse}>{z(x)}</text>)}
        </g>
        <path d={`M${px(mu)} 141 l-10 16 h20 z`} fill={fair && Math.abs(mu) < 0.02 ? F.gruenKraeftig : F.gold3} />
        <Txt x={px(mu)} y={174} gr={11} farbe={F.gold3}>μ</Txt>
        {fair && <line x1={px(0)} x2={px(0)} y1={20} y2={140} stroke={F.achse} strokeDasharray="3 3" />}
      </svg>
      {fair && <Regler label="Einsatz e" wert={ein} setze={setEin} min={0} max={2} schritt={0.01} anzeige={`${z(ein)} €`} />}
      <Messzeile>
        <div><M t={`μ = ${werte.map((w, i) => `${i === 0 ? (w.x < 0 ? "-" : "") : w.x < 0 ? " - " : " + "}${z(Math.abs(w.x))} \\cdot ${z(w.p)}`).join("")} = ${z(mu)}`} /></div>
        {streuung && <div><M t={`V(X) = ${z(V)}, \\quad σ = ${z(Math.sqrt(V))}`} /></div>}
        {fair && <div><b style={{ color: Math.abs(mu) < 0.02 ? F.gruenKraeftig : F.grau }}>{Math.abs(mu) < 0.02 ? "fair" : mu > 0 ? "günstig für den Spieler" : "günstig für die Bank"}</b> · fairer Einsatz ≈ 0,83 €</div>}
      </Messzeile>
    </div>
  );
}

/* ---------- Binomialverteilung ---------- */
function Binomial({ modus = "pdf", band = false }) {
  const [n, setN] = useState(modus === "lln" ? 20 : modus === "sigma" ? 40 : 10);
  const [p, setP] = useState(modus === "lln" ? 0.3 : 0.5);
  const [kk, setKk] = useState(4);
  const mu = n * p, sigma = Math.sqrt(n * p * (1 - p));
  const werte = useMemo(() => Array.from({ length: n + 1 }, (_, k) => bpdf(n, p, k)), [n, p]);
  const max = Math.max(...werte);
  const lln = modus === "lln";
  const W = 312, x0 = 18, bw = W / (n + 1);
  const cum = werte.slice(0, kk + 1).reduce((s, v) => s + v, 0);
  const inBand = werte.reduce((s, v, k) => s + (Math.abs(k - mu) <= 2 * sigma ? v : 0), 0);
  return (
    <div>
      <Hinweis>{lln ? "Rechts ist auf relative Häufigkeiten umgerechnet: Mit größerem n wird die Verteilung um p immer schmaler."
        : modus === "kumuliert" ? "Gefärbt ist P(X ≤ k). Der Rest ist P(X ≥ k + 1) = 1 − P(X ≤ k)."
          : modus === "sigma" ? "μ liegt in der Mitte, σ misst die Breite. Ungefähr 95 % liegen innerhalb von 2σ."
            : "Verändere n und p: Die Balken zeigen P(X = k) für jedes k."}</Hinweis>
      <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label={`Binomialverteilung mit n = ${n} und p = ${z(p)}`}>
        <line x1={x0} x2={x0 + W} y1={170} y2={170} stroke={F.achse} />
        {(modus === "sigma" && band) && <rect x={x0 + (mu - 2 * sigma) * bw} y={14} width={4 * sigma * bw + bw} height={156} fill={F.gold} opacity="0.6" />}
        {werte.map((v, k) => {
          const an = modus === "kumuliert" ? k <= kk : modus === "sigma" && band ? Math.abs(k - mu) <= 2 * sigma : false;
          return <rect key={k} x={x0 + k * bw + bw * 0.1} y={170 - (v / max) * 148} width={bw * 0.8} height={(v / max) * 148} fill={an ? F.gold2 : F.blau} stroke={an ? F.gold3 : F.see} strokeWidth="0.8" />;
        })}
        {Array.from({ length: n + 1 }, (_, k) => k).filter((k) => (lln ? k % Math.max(1, Math.round(n / 5)) === 0 : n <= 20 || k % 10 === 0)).map((k) => (
          <text key={k} x={x0 + k * bw + bw / 2} y={183} fontSize="9" textAnchor="middle" fill={F.achse}>{lln ? z(k / n) : k}</text>
        ))}
        {(modus === "sigma") && (
          <g>
            <line x1={x0 + mu * bw + bw / 2} x2={x0 + mu * bw + bw / 2} y1={10} y2={170} stroke={F.rosaKraeftig} strokeWidth="1.8" />
            <line x1={x0 + (mu - sigma) * bw + bw / 2} x2={x0 + (mu + sigma) * bw + bw / 2} y1={22} y2={22} stroke={F.rosaKraeftig} strokeWidth="2" />
            <Txt x={x0 + mu * bw + bw / 2} y={16} gr={11} farbe={F.rosaKraeftig}>μ</Txt>
            <Txt x={x0 + (mu + sigma) * bw + bw / 2 + 4} y={26} gr={10} anker="start" farbe={F.rosaKraeftig}>σ</Txt>
          </g>
        )}
        {lln && <line x1={x0 + p * n * bw + bw / 2} x2={x0 + p * n * bw + bw / 2} y1={10} y2={170} stroke={F.rosaKraeftig} strokeWidth="1.6" strokeDasharray="4 3" />}
      </svg>
      <Regler label="n" wert={n} setze={(v) => { setN(v); setKk((x) => Math.min(x, v)); }} min={lln ? 5 : 2} max={lln ? 200 : 100} schritt={1} anzeige={n} />
      <Regler label="p" wert={p} setze={setP} min={0.02} max={0.98} schritt={0.01} anzeige={z(p)} />
      {modus === "kumuliert" && <Regler label="k" wert={kk} setze={setKk} min={0} max={n} schritt={1} anzeige={kk} />}
      <Messzeile>
        {modus === "kumuliert" ? <M t={`P(X \\leq ${kk}) = ${z(cum)}, \\quad P(X \\geq ${kk + 1}) = ${z(1 - cum)}`} />
          : <M t={`μ = ${z(mu)}, \\quad σ = ${z(sigma)}${band ? `, \\quad P(|X - μ| \\leq 2σ) = ${z(inBand)}` : ""}`} />}
        {lln && <div style={{ fontSize: 13, color: C.grau }}>Streuung der relativen Häufigkeit: <M t={`\\frac{σ}{n} = ${z(sigma / n)}`} /></div>}
      </Messzeile>
    </div>
  );
}

/* ---------- Hypothesentest ---------- */
function Hypothese({ beta = false }) {
  const n = 50, p0 = 0.5;
  const [alpha, setAlpha] = useState(0.05);
  const [p1, setP1] = useState(0.7);
  const w0 = Array.from({ length: n + 1 }, (_, k) => bpdf(n, p0, k));
  const w1 = Array.from({ length: n + 1 }, (_, k) => bpdf(n, p1, k));
  let k0 = n + 1, tail = 0;
  for (let k = n; k >= 0; k--) { if (tail + w0[k] > alpha) break; tail += w0[k]; k0 = k; }
  const betaW = w1.slice(0, k0).reduce((s, v) => s + v, 0);
  const max = Math.max(...w0, ...(beta ? w1 : [0]));
  const bw = 312 / (n + 1), x0 = 18;
  return (
    <div>
      <Hinweis>{beta ? "Blau: Verteilung unter H₀. Grün: unter der wahren Wahrscheinlichkeit p₁. β ist der Teil der grünen Verteilung im Annahmebereich."
        : "Rechtsseitiger Test von H₀: p = 0,5 mit n = 50. Der Ablehnungsbereich (rosa) hat unter H₀ höchstens die Wahrscheinlichkeit α."}</Hinweis>
      <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Binomialverteilung unter der Nullhypothese mit Ablehnungsbereich">
        <rect x={x0 + k0 * bw} y={10} width={x0 + 312 - (x0 + k0 * bw)} height={160} fill={F.rosa} opacity="0.35" />
        <line x1={18} x2={330} y1={170} y2={170} stroke={F.achse} />
        {w0.map((v, k) => <rect key={k} x={x0 + k * bw + bw * 0.12} y={170 - (v / max) * 145} width={bw * 0.76} height={(v / max) * 145} fill={k >= k0 ? F.rosaKraeftig : F.blauMittel} opacity={beta ? 0.6 : 1} />)}
        {beta && w1.map((v, k) => <rect key={"b" + k} x={x0 + k * bw + bw * 0.3} y={170 - (v / max) * 145} width={bw * 0.4} height={(v / max) * 145} fill={k < k0 ? F.gruenKraeftig : "#A8D5B8"} />)}
        {[0, 10, 20, 30, 40, 50].map((k) => <text key={k} x={x0 + k * bw + bw / 2} y={183} fontSize="9" textAnchor="middle" fill={F.achse}>{k}</text>)}
        <line x1={x0 + k0 * bw} x2={x0 + k0 * bw} y1={10} y2={172} stroke={F.rosaKraeftig} strokeWidth="1.6" strokeDasharray="4 3" />
        <Txt x={x0 + k0 * bw + 4} y={24} anker="start" gr={11} farbe={F.rosaKraeftig}>{`Ā = {${k0}; …; ${n}}`}</Txt>
      </svg>
      <Umschalter label="Signifikanzniveau" wert={alpha} setze={setAlpha} optionen={[[0.01, "α = 1 %"], [0.05, "α = 5 %"], [0.1, "α = 10 %"]]} />
      {beta && <Regler label="wahres p₁" wert={p1} setze={setP1} min={0.5} max={0.9} schritt={0.01} anzeige={z(p1)} />}
      <Messzeile>
        <div><M t={`P_{H_0}(X \\geq ${k0}) = ${z(tail)} \\leq ${z(alpha)}`} /></div>
        {beta && <div><M t={`β = P_{p_1}(X \\leq ${k0 - 1}) = ${z(betaW)}`} /></div>}
      </Messzeile>
    </div>
  );
}

/* ---------- Wahrheitstafeln ---------- */
function Wahrheit({ op = "und" }) {
  const W = (b) => (b ? "w" : "f");
  const zeilen = [[true, true], [true, false], [false, true], [false, false]];
  const spalten = {
    und: [["A ∧ B", (a, b) => a && b], ["A ∨ B", (a, b) => a || b], ["¬A", (a) => !a]],
    impl: [["A ⇒ B", (a, b) => !a || b], ["¬A ∨ B", (a, b) => !a || b]],
    kontra: [["A ⇒ B", (a, b) => !a || b], ["¬B ⇒ ¬A", (a, b) => b || !a], ["B ⇒ A", (a, b) => !b || a]],
    demorgan: [["¬(A ∧ B)", (a, b) => !(a && b)], ["¬A ∨ ¬B", (a, b) => !a || !b]],
  }[op];
  const [zeile, setZeile] = useState(op === "impl" ? 1 : null);
  const breite = 56, X0 = 20;
  const gesamt = 2 + spalten.length;
  const cw = Math.min(breite + 24, (320 - X0) / gesamt);
  return (
    <div>
      <Hinweis>{op === "impl" ? "Tippe auf eine Zeile. Die Implikation ist nur in einer einzigen Zeile falsch: A wahr, B falsch."
        : op === "kontra" ? "A ⇒ B und ¬B ⇒ ¬A haben dieselbe Spalte. Die Umkehrung B ⇒ A nicht."
          : "w = wahr, f = falsch. Tippe auf eine Zeile, um sie hervorzuheben."}</Hinweis>
      <svg viewBox={`0 0 340 ${40 + 4 * 32}`} style={svgStil} role="img" aria-label="Wahrheitstafel">
        {["A", "B", ...spalten.map((s) => s[0])].map((t, i) => <Txt key={i} x={X0 + cw * i + cw / 2} y={24} gr={12} farbe={i < 2 ? F.grau : F.see}>{t}</Txt>)}
        {zeilen.map(([a, b], r) => {
          const y = 36 + r * 32;
          const werte = [a, b, ...spalten.map((s) => s[1](a, b))];
          return (
            <g key={r} onClick={() => setZeile(r)} style={{ cursor: "pointer" }}>
              <rect x={X0 - 6} y={y} width={cw * gesamt + 12} height="28" rx="8" fill={zeile === r ? F.gold : r % 2 ? "#F7F9FC" : "#FBFCFE"} />
              {werte.map((v, i) => <Txt key={i} x={X0 + cw * i + cw / 2} y={y + 19} gr={13} farbe={i < 2 ? F.tinte : v ? F.gruenKraeftig : F.rosaKraeftig}>{W(v)}</Txt>)}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------- Zahlbereiche und Intervalle ---------- */
function Zahlbereiche({ modus }) {
  const [a, setA] = useState(-1);
  const [b, setB] = useState(2);
  const [la, setLa] = useState(true);
  const [rb, setRb] = useState(false);
  if (modus === "intervall") {
    const px = (x) => 30 + ((x + 4) / 9) * 280;
    return (
      <div>
        <Hinweis>Schalte die Grenzen um: Ein voller Punkt gehört dazu (eckige Klammer nach innen), ein leerer nicht.</Hinweis>
        <svg viewBox="0 0 340 90" style={svgStil} role="img" aria-label="Intervall auf dem Zahlenstrahl">
          <line x1={20} x2={320} y1={50} y2={50} stroke={F.achse} strokeWidth="1.4" />
          {Array.from({ length: 10 }, (_, i) => i - 4).map((x) => <g key={x}><line x1={px(x)} x2={px(x)} y1={45} y2={55} stroke={F.achse} /><text x={px(x)} y={72} fontSize="10" textAnchor="middle" fill={F.achse}>{z(x)}</text></g>)}
          <line x1={px(a)} x2={px(b)} y1={50} y2={50} stroke={F.see} strokeWidth="5" />
          <Punkt x={px(a)} y={50} farbe={F.see} r={6} ring={!la} />
          <Punkt x={px(b)} y={50} farbe={F.see} r={6} ring={!rb} />
        </svg>
        <Regler label="a" wert={a} setze={(v) => setA(Math.min(v, b - 0.5))} min={-4} max={4} schritt={0.5} anzeige={z(a)} />
        <Regler label="b" wert={b} setze={(v) => setB(Math.max(v, a + 0.5))} min={-3.5} max={5} schritt={0.5} anzeige={z(b)} />
        <Umschalter label="linke Grenze" wert={la} setze={setLa} optionen={[[true, "a gehört dazu"], [false, "a gehört nicht dazu"]]} />
        <Umschalter label="rechte Grenze" wert={rb} setze={setRb} optionen={[[true, "b gehört dazu"], [false, "b gehört nicht dazu"]]} />
        <Messzeile><M t={`${la ? "[" : "]"}${z(a)} ; ${z(b)}${rb ? "]" : "["} = \\{ x \\mid ${z(a)} ${la ? "\\leq" : "<"} x ${rb ? "\\leq" : "<"} ${z(b)} \\}`} /></Messzeile>
      </div>
    );
  }
  const ringe = [["ℂ", "−1 = i²", 150], ["ℝ", "√2, π", 122], ["ℚ", "½, −0,75", 94], ["ℤ", "−3", 66], ["ℕ", "0, 1, 2", 38]];
  return (
    <div>
      <Hinweis>Jeder Zahlbereich steckt im nächstgrößeren. Jede Erweiterung macht eine Rechnung möglich, die vorher nicht ging.</Hinweis>
      <svg viewBox="0 0 340 220" style={svgStil} role="img" aria-label="Verschachtelte Zahlbereiche">
        {ringe.map(([name, bsp, r], i) => (
          <g key={name}>
            <ellipse cx={170} cy={112} rx={r * 1.08} ry={r * 0.68} fill={[F.gold, F.blau, F.rosa, F.gruen, F.gold2][i]} stroke={[F.gold3, F.see, F.rosaKraeftig, F.gruenKraeftig, F.gold3][i]} strokeWidth="1.4" />
            <Txt x={170} y={112 - r * 0.68 + 16} gr={13}>{name}</Txt>
            {i < 4 && <text x={170} y={112 + r * 0.68 - 7} fontSize="9.5" textAnchor="middle" fill={F.grau}>{bsp}</text>}
          </g>
        ))}
        <text x={170} y={124} fontSize="10" textAnchor="middle" fill={F.grau}>{ringe[4][1]}</text>
      </svg>
    </div>
  );
}

/* ---------- Domino (Induktion) ---------- */
function Domino() {
  const [t, setT] = useState(0);
  const steine = 9;
  return (
    <div>
      <Hinweis>Der erste Stein fällt (Anfang), und jeder fallende Stein stößt den nächsten an (Schritt). Schiebe den Regler.</Hinweis>
      <svg viewBox="0 0 340 130" style={svgStil} role="img" aria-label="Fallende Dominosteine">
        <line x1="10" x2="330" y1="110" y2="110" stroke={F.achse} strokeWidth="1.5" />
        {Array.from({ length: steine }, (_, i) => {
          const fall = Math.max(0, Math.min(1, t * steine - i));
          const x = 28 + i * 34;
          return (
            <g key={i} transform={`rotate(${fall * 62} ${x + 9} 110)`}>
              <rect x={x} y={52} width="9" height="58" rx="2" fill={i === 0 ? F.gold2 : F.blau} stroke={i === 0 ? F.gold3 : F.see} strokeWidth="1.3" />
              <text x={x + 4.5} y={46} fontSize="9.5" textAnchor="middle" fill={F.grau} transform={`rotate(${-fall * 62} ${x + 4.5} 46)`}>{i + 1}</text>
            </g>
          );
        })}
      </svg>
      <Regler label="Zeit" wert={t} setze={setT} min={0} max={1} />
    </div>
  );
}

/* ---------- Gaußsche Summe: zwei Treppen ---------- */
function Treppe() {
  const [n, setN] = useState(6);
  const s = Math.min(22, 250 / (n + 1));
  const X = (340 - (n + 1) * s) / 2, Y = 16;
  const kaesten = [];
  for (let zz = 0; zz < n; zz++) for (let sp = 0; sp <= n; sp++) {
    const links = sp < zz + 1;
    kaesten.push(<rect key={`${zz}-${sp}`} x={X + sp * s} y={Y + zz * s} width={s - 2} height={s - 2} rx="3" fill={links ? F.blau : F.gold2} stroke={links ? F.see : F.gold3} strokeWidth="0.8" />);
  }
  return (
    <div>
      <Hinweis>Blau ist die Treppe 1 + 2 + … + n, gold dieselbe Treppe gedreht. Zusammen: ein Rechteck aus n · (n + 1) Kästchen.</Hinweis>
      <svg viewBox={`0 0 340 ${Y + n * s + 22}`} style={svgStil} role="img" aria-label="Zwei Treppen aus Kästchen, die ein Rechteck bilden">
        {kaesten}
        <Txt x={X + ((n + 1) * s) / 2} y={Y + n * s + 16} gr={11}>{`n + 1 = ${n + 1}`}</Txt>
        <Txt x={X - 14} y={Y + (n * s) / 2 + 4} gr={11}>{`n = ${n}`}</Txt>
      </svg>
      <Regler label="n" wert={n} setze={setN} min={2} max={12} schritt={1} anzeige={n} />
      <Messzeile><M t={`1 + 2 + \\ldots + ${n} = \\frac{${n} \\cdot ${n + 1}}{2} = ${(n * (n + 1)) / 2}`} /></Messzeile>
    </div>
  );
}

/* ---------- Primfaktorbaum ---------- */
function Primbaum() {
  const [zahl, setZahl] = useState(360);
  const zerlege = (m) => { for (let p = 2; p * p <= m; p++) if (m % p === 0) return [p, m / p]; return null; };
  const knoten = [];
  const faktoren = [];
  const bau = (m, x, y, tiefe, breite) => {
    const z2 = zerlege(m);
    const prim = !z2;
    knoten.push(<g key={`${m}-${x}-${y}`}><circle cx={x} cy={y} r="15" fill={prim ? F.gold2 : F.blau} stroke={prim ? F.gold3 : F.see} strokeWidth="1.4" /><Txt x={x} y={y + 4} gr={m > 99 ? 10.5 : 12}>{m}</Txt></g>);
    if (prim) { faktoren.push(m); return; }
    const [a, b] = z2;
    const dx = breite;
    knoten.push(<line key={`l${m}-${x}-${y}`} x1={x} y1={y + 15} x2={x - dx} y2={y + 31} stroke={F.achse} />, <line key={`r${m}-${x}-${y}`} x1={x} y1={y + 15} x2={x + dx * 0.6} y2={y + 31} stroke={F.achse} />);
    bau(a, x - dx, y + 44, tiefe + 1, breite);
    bau(b, x + dx * 0.6, y + 44, tiefe + 1, breite * 0.92);
  };
  bau(zahl, 110, 22, 0, 30);
  const zaehl = {}; faktoren.forEach((f) => { zaehl[f] = (zaehl[f] || 0) + 1; });
  const tex = Object.entries(zaehl).map(([p, e]) => (e > 1 ? `${p}^${e}` : p)).join(" \\cdot ");
  const teiler = Object.values(zaehl).reduce((s, e) => s * (e + 1), 1);
  return (
    <div>
      <Hinweis>Zerlege, bis nur Primzahlen (gold) übrig sind. Wähle eine Zahl.</Hinweis>
      <svg viewBox="0 0 340 300" style={svgStil} role="img" aria-label="Primfaktorbaum">{knoten}</svg>
      <Umschalter label="Zahl" wert={zahl} setze={setZahl} optionen={[[360, "360"], [84, "84"], [1001, "1001"], [256, "256"]]} />
      <Messzeile><M t={`${zahl} = ${tex}`} /> · {teiler} Teiler</Messzeile>
    </div>
  );
}

/* ---------- Waage (Äquivalenzumformung) ---------- */
function Waage() {
  const [schritt, setSchritt] = useState(0);
  const st = [["3x + 2", "11", "Ausgangsgleichung"], ["3x", "9", "auf beiden Seiten − 2"], ["x", "3", "beide Seiten : 3"]][schritt];
  return (
    <div>
      <Hinweis>Was auf einer Seite passiert, passiert auch auf der anderen – dann bleibt die Waage im Gleichgewicht.</Hinweis>
      <svg viewBox="0 0 340 170" style={svgStil} role="img" aria-label="Balkenwaage im Gleichgewicht">
        <path d="M170 150 L150 160 H190 Z" fill={F.tinte} />
        <line x1="170" y1="150" x2="170" y2="60" stroke={F.tinte} strokeWidth="3" />
        <line x1="60" y1="60" x2="280" y2="60" stroke={F.tinte} strokeWidth="3" />
        {[[60, st[0], F.blau, F.see], [280, st[1], F.gold, F.gold3]].map(([x, t, f, r], i) => (
          <g key={i}>
            <line x1={x} y1={60} x2={x - 30} y2={100} stroke={F.achse} /><line x1={x} y1={60} x2={x + 30} y2={100} stroke={F.achse} />
            <rect x={x - 46} y={100} width="92" height="34" rx="10" fill={f} stroke={r} strokeWidth="1.5" />
            <Txt x={x} y={122} gr={15}>{t}</Txt>
          </g>
        ))}
      </svg>
      <Umschalter label="Schritt" wert={schritt} setze={setSchritt} optionen={[[0, "Start"], [1, "− 2"], [2, ": 3"]]} />
      <Messzeile><M t={`${st[0]} = ${st[1]}`} /> <span style={{ color: C.grau, fontSize: 13 }}>· {st[2]}</span></Messzeile>
    </div>
  );
}

/* ---------- Gauß-Verfahren: Stufenform ---------- */
function GaussStufen() {
  const [s, setS] = useState(0);
  const stufen = [
    [["1", "1", "1", "6"], ["2", "−1", "1", "3"], ["1", "2", "−1", "2"]],
    [["1", "1", "1", "6"], ["0", "−3", "−1", "−9"], ["0", "1", "−2", "−4"]],
    [["1", "1", "1", "6"], ["0", "−3", "−1", "−9"], ["0", "0", "−7", "−21"]],
  ];
  const text = ["Ausgangssystem", "II − 2·I, III − I: x₁ ist aus II und III verschwunden", "3·III + II: auch x₂ ist aus III verschwunden – Stufenform"];
  const m = stufen[s];
  return (
    <div>
      <Hinweis>Schritt für Schritt entstehen Nullen unter der Diagonale. Dann rechnet man von unten nach oben.</Hinweis>
      <svg viewBox="0 0 340 150" style={svgStil} role="img" aria-label="Koeffizientenmatrix des Gleichungssystems">
        {["x₁", "x₂", "x₃", ""].map((t, j) => <Txt key={j} x={92 + j * 56} y={18} gr={11} farbe={F.grau}>{t}</Txt>)}
        {m.map((zeile, i) => zeile.map((v, j) => {
          const null0 = v === "0" && j < i;
          return (
            <g key={`${i}-${j}`}>
              <rect x={66 + j * 56} y={28 + i * 38} width="52" height="32" rx="8" fill={null0 ? F.gruen : j === 3 ? F.gold : "#F4F6FA"} stroke={null0 ? F.gruenKraeftig : "none"} />
              <Txt x={92 + j * 56} y={49 + i * 38} gr={13}>{v}</Txt>
            </g>
          );
        }))}
        {["I", "II", "III"].map((t, i) => <Txt key={t} x={44} y={49 + i * 38} gr={12} farbe={F.see}>{t}</Txt>)}
        <line x1={286} x2={286} y1={28} y2={138} stroke={F.achse} />
      </svg>
      <Umschalter label="Schritt" wert={s} setze={setS} optionen={[[0, "Start"], [1, "Schritt 1"], [2, "Schritt 2"]]} />
      <Messzeile>{text[s]}{s === 2 && <div><M t={"x_3 = 3, \\; x_2 = 2, \\; x_1 = 1"} /></div>}</Messzeile>
    </div>
  );
}

export const BILDER_3 = {
  laplace: (p) => <Laplace {...p} />,
  venn: (p) => <Venn {...p} />,
  baum: (p) => <Baum {...p} />,
  vierfelder: (p) => <VierFelder {...p} />,
  urne: (p) => <Urne {...p} />,
  pascal: (p) => <Pascal {...p} />,
  erwartung: (p) => <Erwartung {...p} />,
  binomial: (p) => <Binomial {...p} />,
  hypothese: (p) => <Hypothese {...p} />,
  wahrheit: (p) => <Wahrheit {...p} />,
  zahlbereiche: (p) => <Zahlbereiche {...p} />,
  domino: (p) => <Domino {...p} />,
  treppe: (p) => <Treppe {...p} />,
  primbaum: (p) => <Primbaum {...p} />,
  waage: (p) => <Waage {...p} />,
  gaussStufen: (p) => <GaussStufen {...p} />,
};
