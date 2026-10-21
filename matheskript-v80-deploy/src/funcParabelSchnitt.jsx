/* ============================================================
   Parabeln · Schnittpunkte von Parabel und Gerade (Mittelstufe)
   Gleichsetzen → Normalform x² + px + q = 0 → Diskriminante
   (Anzahl der Schnittpunkte) → pq-Formel → y-Werte einsetzen.
   Aufgaben haben ganzzahlige Schnittstellen; auch Berührpunkt
   (Tangente) und „kein Schnittpunkt“ kommen vor.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { GrosserKnopf, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { wahl } from "./rechnen2.js";
import { FunktionsBild, SchrittFolge, zt } from "./ui3.jsx";
import { Arbeitsflaeche, FeinKarte } from "./arbeitsflaeche.jsx";

let zaehler = 0;
const zufall = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

/* Term a·x² + b·x + c in Standardschreibweise (kein 1x, kein +0, Minus als −) */
export function polyTex(koeff) {
  const grad = koeff.length - 1;
  let t = "";
  koeff.forEach((k, i) => {
    if (k === 0) return;
    const e = grad - i;
    const betrag = Math.abs(k);
    const zahl = e > 0 && betrag === 1 ? "" : zt(betrag, 4).replace(",", "{,}");
    const x = e === 0 ? "" : e === 1 ? "x" : `x^${e}`;
    if (t === "") t = (k < 0 ? "−" : "") + zahl + x;
    else t += ` ${k < 0 ? "−" : "+"} ${zahl}${x}`;
  });
  return t || "0";
}

export function neueAufgabe() {
  const art = wahl(["zwei", "zwei", "zwei", "eins", "keine"]);
  const a = wahl([1, 1, -1, 2]);
  const m = zufall(-2, 2), n = zufall(-3, 3);
  let p, q, r1 = null, r2 = null;
  if (art === "zwei") { r1 = zufall(-4, 3); r2 = zufall(r1 + 1, 4); p = -(r1 + r2); q = r1 * r2; }
  else if (art === "eins") { r1 = r2 = zufall(-3, 3); p = -2 * r1; q = r1 * r1; }
  else { const h = zufall(-3, 3), k = zufall(1, 3); p = -2 * h; q = h * h + k; }
  /* f(x) = g(x) + a·(x² + px + q) */
  const f = [a, m + a * p, n + a * q];
  return { id: ++zaehler, art, a, m, n, p, q, r1, r2, f };
}

const g = (au, x) => au.m * x + au.n;
const kl = (v) => (v < 0 ? `(${zt(v, 2)})` : zt(v, 2));
/* g(x₀) = m · x₀ + n, eingesetzt (m = 0 und m = ±1 sauber) */
const einsetzen = (au, x) => {
  const teil = au.m === 0 ? "" : au.m === 1 ? kl(x) : au.m === -1 ? `−${kl(x)}` : `${au.m < 0 ? "−" : ""}${Math.abs(au.m)} \\cdot ${kl(x)}`;
  const nT = au.n === 0 ? "" : teil === "" ? zt(au.n, 2) : ` ${au.n < 0 ? "−" : "+"} ${Math.abs(au.n)}`;
  return `g(${zt(x, 2)}) = ${teil}${nT || (teil === "" ? "0" : "")}`;
};
const f = (au, x) => au.f[0] * x * x + au.f[1] * x + au.f[2];

export function schritteVon(au) {
  const D = (au.p / 2) ** 2 - au.q;
  const fT = polyTex(au.f), gT = polyTex([au.m, au.n]);
  const liste = [
    { id: "ps-ansatz", titel: zw("Ansatz", "Set-up"), typ: "wahl", frage: zw("Wie findest du die Schnittstellen von f und g?", "How do you find where f and g intersect?"),
      optionen: [["gleich", <M key="1" t="f(x) = g(x)" />], ["null", <M key="2" t="f(x) = 0" />], ["summe", <M key="3" t="f(x) + g(x) = 0" />]], richtig: "gleich",
      fehler: [{ wahl: "null", text: zw("f(x) = 0 liefert die Nullstellen von f – also die Schnittpunkte mit der x-Achse, nicht mit g.", "f(x) = 0 gives the roots of f – where it meets the x-axis, not g.") },
        { wahl: "summe", text: zw("An einem Schnittpunkt haben beide Funktionen denselben y-Wert: f(x) = g(x), also f(x) − g(x) = 0.", "At an intersection both functions have the same y-value: f(x) = g(x), i.e. f(x) − g(x) = 0.") }],
      hinweise: [zw("Schnittpunkt heißt: gleiches x, gleiches y.", "Intersection means: same x, same y.")],
      erklaerung: <span><M t={`${fT} = ${gT}`} /></span> },
    { id: "ps-p", titel: zw("Normalform: p", "Normal form: p"), typ: "zahl", text: "p =", wert: au.p,
      frage: <span>{zw("Bring alles auf eine Seite und teile durch den Faktor vor x². Du erhältst", "Move everything to one side and divide by the factor of x². You get")} <M t="x^2 + p x + q = 0" />. {zw("Wie groß ist p?", "What is p?")}</span>,
      fehler: [{ wert: au.f[1] / au.a, text: zw("Das m·x der Geraden muss auch auf die linke Seite: Ziehe es vom x-Glied ab.", "The m·x of the line has to move to the left too: subtract it from the x term.") },
        ...(au.a !== 1 ? [{ wert: au.f[1] - au.m, text: zw(`Noch durch ${au.a === -1 ? "−1" : au.a} teilen – vor x² muss eine 1 stehen.`, `Still divide by ${au.a === -1 ? "−1" : au.a} – the factor of x² must be 1.`) }] : [])],
      hinweise: [<M key="h" t={`${polyTex([au.f[0], au.f[1] - au.m, au.f[2] - au.n])} = 0`} />],
      erklaerung: <span><M t={`${polyTex([au.f[0], au.f[1] - au.m, au.f[2] - au.n])} = 0`} />{au.a !== 1 ? <> {zw(`| : ${au.a === -1 ? "(−1)" : au.a}`, `| ÷ ${au.a === -1 ? "(−1)" : au.a}`)}</> : null} ⇒ <M t={`${polyTex([1, au.p, au.q])} = 0`} /></span> },
    { id: "ps-q", titel: zw("Normalform: q", "Normal form: q"), typ: "zahl", text: "q =", wert: au.q,
      frage: zw("Und q?", "And q?"),
      fehler: [{ wert: au.f[2] / au.a, text: zw("Das n der Geraden muss mit auf die linke Seite.", "The n of the line has to move to the left side as well.") }],
      hinweise: [zw("q ist die Zahl ohne x, nachdem du durch den Faktor vor x² geteilt hast.", "q is the number without x after dividing by the factor of x².")],
      erklaerung: <M t={`${polyTex([1, au.p, au.q])} = 0`} /> },
    { id: "ps-d", titel: zw("Wie viele Schnittpunkte?", "How many intersections?"), typ: "wahl",
      frage: <span>{zw("Berechne die Diskriminante", "Compute the discriminant")} <M t="D = \left(\frac{p}{2}\right)^2 − q" />.</span>,
      optionen: [["zwei", zw("D > 0: zwei Schnittpunkte", "D > 0: two intersections")], ["eins", zw("D = 0: ein Berührpunkt", "D = 0: one point of contact")], ["keine", zw("D < 0: kein Schnittpunkt", "D < 0: no intersection")]], richtig: au.art,
      hinweise: [<M key="h" t={`D = \\left(\\frac{${zt(au.p, 2).replace(",", "{,}")}}{2}\\right)^2 − ${au.q < 0 ? `(${zt(au.q, 2)})` : zt(au.q, 2)}`} />],
      erklaerung: <span>D = {zt(D, 2)} ⇒ {au.art === "zwei" ? zw("zwei Schnittpunkte", "two intersections") : au.art === "eins" ? zw("Die Gerade berührt die Parabel (Tangente).", "The line touches the parabola (tangent).") : zw("Gerade und Parabel schneiden sich nicht.", "The line and the parabola do not meet.")}</span> },
  ];
  if (au.art === "keine") return liste;
  if (au.art === "eins") {
    return [...liste,
      { id: "ps-x0", titel: zw("Berührstelle", "Point of contact"), typ: "zahl", text: "x₀ =", wert: au.r1,
        frage: <span><M t="x_0 = −\frac{p}{2}" /></span>, fehler: [{ wert: au.p / 2, text: zw("Vorzeichen: x₀ = −p/2.", "Sign: x₀ = −p/2.") }],
        hinweise: [zw("Bei D = 0 fällt die Wurzel weg.", "With D = 0 the root vanishes.")], erklaerung: `x₀ = ${zt(au.r1, 2)}` },
      { id: "ps-y0", titel: zw("y-Wert", "y-value"), typ: "zahl", text: "y₀ =", wert: g(au, au.r1),
        frage: zw("Setze x₀ in die Gerade ein (das ist am einfachsten).", "Plug x₀ into the line (easiest)."),
        hinweise: [<M key="h" t={einsetzen(au, au.r1)} />],
        erklaerung: `B(${zt(au.r1, 2)} | ${zt(g(au, au.r1), 2)})` },
    ];
  }
  return [...liste,
    { id: "ps-x1", titel: zw("Kleinere Schnittstelle", "Smaller intersection"), typ: "zahl", text: "x₁ =", wert: au.r1,
      frage: <span><M t="x_{1,2} = −\frac{p}{2} \pm \sqrt{D}" /> – {zw("gib zuerst die kleinere Lösung an.", "enter the smaller solution first.")}</span>,
      fehler: [{ wert: -au.r2, text: zw("Vorzeichen: Es heißt −p/2 ± √D.", "Sign: it is −p/2 ± √D.") }],
      hinweise: [<M key="h" t={`x_{1,2} = ${zt(-au.p / 2, 2).replace(",", "{,}")} \\pm \\sqrt{${zt(D, 2).replace(",", "{,}")}}`} />], erklaerung: `x₁ = ${zt(au.r1, 2)}` },
    { id: "ps-x2", titel: zw("Größere Schnittstelle", "Larger intersection"), typ: "zahl", text: "x₂ =", wert: au.r2, frage: zw("Und die größere?", "And the larger one?"),
      fehler: [{ wert: -au.r1, text: zw("Vorzeichen: Es heißt −p/2 ± √D.", "Sign: it is −p/2 ± √D.") }], hinweise: [zw("Diesmal + √D.", "This time + √D.")], erklaerung: `x₂ = ${zt(au.r2, 2)}` },
    { id: "ps-y1", titel: zw("y-Werte", "y-values"), typ: "zahl", text: "y₁ =", wert: g(au, au.r1),
      frage: zw("Setze x₁ in g ein.", "Plug x₁ into g."),
      fehler: [{ wert: au.r1, text: zw("Das ist der x-Wert. Gesucht ist g(x₁).", "That's the x-value. You need g(x₁).") }],
      hinweise: [<M key="h" t={einsetzen(au, au.r1)} />], erklaerung: `S₁(${zt(au.r1, 2)} | ${zt(g(au, au.r1), 2)})` },
    { id: "ps-y2", titel: zw("Zweiter y-Wert", "Second y-value"), typ: "zahl", text: "y₂ =", wert: g(au, au.r2),
      frage: zw("Setze x₂ in g ein.", "Plug x₂ into g."),
      hinweise: [<M key="h" t={einsetzen(au, au.r2)} />], erklaerung: `S₂(${zt(au.r2, 2)} | ${zt(g(au, au.r2), 2)})` },
  ];
}

function hilfeP(au) {
  return hilfeKontext({
    id: `parabel-schnitt-${au.art}`, aufgabe: "Parabel Gerade Schnittpunkt gleichsetzen pq-Formel Diskriminante quadratische Gleichung",
    verstehen: [zw("Gesucht sind die Punkte, die auf beiden Graphen liegen.", "You need the points that lie on both graphs."), zw("Gleiches x und gleiches y – also f(x) = g(x).", "Same x and same y – so f(x) = g(x).")],
    ansatz: [zw("Gleichsetzen, alles auf eine Seite, durch den Faktor vor x² teilen.", "Set equal, move everything to one side, divide by the factor of x²."), zw("Dann pq-Formel.", "Then the pq formula.")],
    regel: ["x² + px + q = 0  ⇒  x = −p/2 ± √((p/2)² − q)", zw("D > 0: zwei, D = 0: eine, D < 0: keine Lösung", "D > 0: two, D = 0: one, D < 0: no solution")],
    pruefen: [zw("Setze x in f und in g ein – beide müssen denselben y-Wert liefern.", "Plug x into f and into g – both must give the same y-value.")],
  });
}

export function ParabelSchnitt({ kopf } = {}) {
  const [au, setAu] = useState(neueAufgabe);
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(neueAufgabe()); setStand(0); };
  const schritte = useMemo(() => schritteVon(au), [au]);
  const fertig = stand >= schritte.length;
  const punkte = fertig && au.art !== "keine"
    ? (au.art === "eins" ? [au.r1] : [au.r1, au.r2]).map((x, i) => ({ x, y: g(au, x), farbe: C.flaggold, name: au.art === "eins" ? "B" : `S${i + 1}` }))
    : [];
  const xs = au.art === "keine" ? [-au.p / 2] : [au.r1, au.r2];
  const x0 = Math.min(-5, Math.min(...xs) - 2), x1 = Math.max(5, Math.max(...xs) + 2);
  const yWerte = [];
  for (let x = x0; x <= x1; x += 0.25) { yWerte.push(f(au, x), g(au, x)); }
  const y0 = Math.max(-12, Math.min(...yWerte, -2)), y1 = Math.min(12, Math.max(...yWerte, 2));
  const aufgabe = (
    <>
      <p style={kicker}>{zw("Parabel trifft Gerade", "Parabola meets line")}</p>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 4 }}>{zw("Berechne die gemeinsamen Punkte von", "Find the common points of")}</p>
      <div style={{ fontSize: 17, color: C.tinte, display: "grid", gap: 4, margin: "2px 0 10px" }}>
        <M t={`f(x) = ${polyTex(au.f)}`} />
        <M t={`g(x) = ${polyTex([au.m, au.n])}`} />
      </div>
    </>
  );
  const bild = (hoehe) => (
    <FunktionsBild x0={x0} x1={x1} y0={y0} y1={y1} hoehe={hoehe}
      kurven={[{ f: (x) => f(au, x), farbe: C.see, name: "f" }, { f: (x) => g(au, x), farbe: C.smaragd, name: "g" }]} punkte={punkte} />
  );
  const schritteListe = (
    <SchrittFolge schritte={schritte} stand={stand} setStand={setStand}
      fertigText={au.art === "keine" ? zw("Richtig: Die Gerade verläuft an der Parabel vorbei.", "Correct: the line misses the parabola.") : zw("Alle Schnittpunkte bestimmt – Probe: f und g liefern dort denselben y-Wert.", "All intersections found – check: f and g give the same y-value there.")} />
  );
  const neuKnopf = <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New exercise")}</GrosserKnopf>;
  const hilfeZeile = <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><IchHaengeFest kontext={hilfeP(au)} /></div>;

  /* Desktop: links die Einstellungen des Trainers und „Neue Aufgabe“, rechts die Aufgabe mit f und g –
     ab Schritt 4 (Anzahl der Schnittpunkte) darunter das Schaubild, Rechenweg unter der Arbeitsfläche */
  if (kopf) {
    return (
      <div key={au.id}>
        <Arbeitsflaeche
          links={<>{kopf}<FeinKarte style={{ paddingTop: 6 }}>{neuKnopf}</FeinKarte></>}
          rechts={<>
            <FeinKarte>{aufgabe}</FeinKarte>
            {stand >= 4 && bild(240)}
          </>} />
        <FeinKarte style={{ marginTop: 20 }}>
          <p style={kicker}>{zw("Rechenweg", "Working")}</p>
          {schritteListe}
          {hilfeZeile}
        </FeinKarte>
      </div>
    );
  }

  return (
    <div style={{ ...karte, marginTop: 16 }} key={au.id}>
      {aufgabe}
      {stand >= 4 && bild(220)}
      {schritteListe}
      {neuKnopf}
      {hilfeZeile}
    </div>
  );
}
