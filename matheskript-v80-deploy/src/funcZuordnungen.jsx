/* ============================================================
   Unterstufe (Kl. 7) · Zuordnungen und Dreisatz
   · Entdecken – proportional (y = k · x) gegen antiproportional
     (y = k : x): Tabelle und Graph live, Quotient bzw. Produkt bleibt gleich
   · Üben – Zuordnung erkennen (Tabelle, Graph), Dreisatz proportional
     und antiproportional, Proportionalitätsfaktor, Lücke in der Tabelle
   Mathematik in unterGen.js (getestet).
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { Auswahl, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { zt } from "./ui3.jsx";
import { ZUORD_ARTEN, zuordAufgabe } from "./unterGen.js";
import { Merke, Regler, UebenRahmen, ZweiModi, ws, zs } from "./geoUi.jsx";
import { werkzeugAnimationen } from "./unterstufeMedien.js";
import { Arbeitsflaeche, BildKarte, FeinKarte, Werkzeugleiste, titelStil, useBreite, useDesktop } from "./arbeitsflaeche.jsx";
import { ChipAuswahl, StellKarte } from "./funcZahlenDesktop.jsx";

let zaehler = 0;
const z = (v) => zt(v, 2);

export function WerteTabelle({ xs, ys, kx = "x", ky = "y", luecke = -1, extra = null }) {
  const zelle = { padding: "7px 10px", textAlign: "center", borderLeft: `1px solid ${C.linie}`, fontVariantNumeric: "tabular-nums" };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 14.5, background: C.weiss, borderRadius: 10 }}>
        <tbody>
          <tr style={{ background: `${C.see}12` }}><th style={{ ...zelle, borderLeft: "none", textAlign: "left", color: C.see }}>{kx}</th>{xs.map((x, i) => <td key={i} style={zelle}>{z(x)}</td>)}</tr>
          <tr><th style={{ ...zelle, borderLeft: "none", textAlign: "left", color: C.see }}>{ky}</th>{ys.map((y, i) => <td key={i} style={{ ...zelle, fontWeight: i === luecke ? 800 : 500, color: i === luecke ? "#8A6A00" : C.tinte }}>{i === luecke ? "?" : z(y)}</td>)}</tr>
          {extra && <tr style={{ background: C.sand }}><th style={{ ...zelle, borderLeft: "none", textAlign: "left", color: C.gruen, fontSize: 12.5 }}>{extra.name}</th>{extra.werte.map((w, i) => <td key={i} style={{ ...zelle, color: C.gruen, fontWeight: 700 }}>{z(w)}</td>)}</tr>}
        </tbody>
      </table>
    </div>
  );
}

function Graph({ xs, ys, kurve, hoehe = 200 }) {
  // Echte Pixel am Desktop (DESKTOP-STIL.md): gemessene Breite, Höhe ≈ 0,62 · W; Handy unverändert 320 × hoehe
  const [ref, breite] = useBreite();
  const desktop = useDesktop();
  const fs = desktop && breite ? 12.5 : 11;
  const W = desktop && breite ? breite : 320, H = desktop && breite ? Math.round(Math.max(hoehe, breite * 0.62)) : hoehe, x1 = Math.max(...xs) + 1, y1 = Math.max(...ys) * 1.15 || 1;
  const X = (x) => 30 + (x / x1) * (W - 40), Y = (y) => H - 24 - (y / y1) * (H - 40);
  const pfad = kurve ? Array.from({ length: 80 }, (_, i) => { const x = 0.15 + (x1 - 0.15) * i / 79; const y = kurve(x); return y > y1 * 1.05 ? null : `${X(x)},${Y(y)}`; }).filter(Boolean).join(" ") : null;
  return (
    <div ref={ref}><svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw("Graph der Zuordnung", "Graph of the assignment")}>
      <line x1="30" y1={H - 24} x2={W - 6} y2={H - 24} stroke={C.hellgrau} /><line x1="30" y1={H - 24} x2="30" y2="8" stroke={C.hellgrau} />
      {pfad && <polyline points={pfad} fill="none" stroke={`${C.see}88`} strokeWidth="2" />}
      {xs.map((x, i) => <circle key={i} cx={X(x)} cy={Y(ys[i])} r="5" fill={C.flaggold} stroke={C.seeTief} strokeWidth="1.2" />)}
      {xs.map((x, i) => <text key={`t${i}`} x={X(x)} y={H - 8} textAnchor="middle" style={{ fontSize: fs, fill: C.grau, fontFamily: "inherit" }}>{z(x)}</text>)}
      <text x="24" y="16" textAnchor="end" style={{ fontSize: fs, fill: C.grau }}>y</text><text x={W - 8} y={H - 30} textAnchor="end" style={{ fontSize: fs, fill: C.grau }}>x</text>
    </svg></div>
  );
}

function Entdecken() {
  const [typ, setTyp] = useState("prop");
  const [k, setK] = useState(typ === "prop" ? 2 : 12);
  const xs = [1, 2, 3, 4, 6];
  const ys = xs.map((x) => (typ === "prop" ? k * x : k / x));
  const desktop = useDesktop();
  const arten = [["prop", zw("proportional", "proportional")], ["anti", zw("antiproportional", "inversely proportional")]];
  const waehleTyp = (t) => { setTyp(t); setK(t === "prop" ? 2 : 12); };
  const extra = typ === "prop" ? { name: "y : x", werte: ys.map((y, i) => y / xs[i]) } : { name: "x · y", werte: ys.map((y, i) => y * xs[i]) };
  const kurve = (x) => (typ === "prop" ? k * x : k / x);
  const merke = <Merke>{typ === "prop"
    ? zw("Proportional: Doppelt so viel x → doppelt so viel y. Der Quotient y : x ist immer gleich (k). Der Graph ist eine Gerade durch den Ursprung.", "Proportional: twice as much x → twice as much y. The quotient y : x is always the same (k). The graph is a straight line through the origin.")
    : zw("Antiproportional: Doppelt so viel x → halb so viel y. Das Produkt x · y ist immer gleich (k). Der Graph ist eine Hyperbel.", "Inversely proportional: twice as much x → half as much y. The product x · y is always the same (k). The graph is a hyperbola.")}</Merke>;
  if (desktop) {
    return (
      <div style={{ marginTop: 16 }} data-zuord="breit">
        <Arbeitsflaeche
          links={<>
            <StellKarte titel={zw("Faktor", "Factor")} kopf={typ === "prop" ? "y = k · x" : "y = k : x"} werte={[{ name: "k", wert: k, setWert: setK, min: typ === "prop" ? 0.5 : 6, max: typ === "prop" ? 5 : 24, schritt: typ === "prop" ? 0.5 : 1, format: (v) => zt(v, 1), regler: true }]} />
            <FeinKarte><p style={titelStil}>{typ === "prop" ? zw("Quotient bleibt gleich", "Quotient stays the same") : zw("Produkt bleibt gleich", "Product stays the same")}</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.gruen, textAlign: "center" }}>{extra.name} = {z(extra.werte[0])}</p>
            </FeinKarte>
          </>}
          rechts={<>
            <BildKarte style={{ padding: "8px 8px 4px" }}><Graph xs={xs} ys={ys} kurve={kurve} /></BildKarte>
            <Werkzeugleiste gruppen={[{ titel: zw("Art der Zuordnung", "Kind of assignment"), inhalt: <ChipAuswahl optionen={arten} wert={typ} setWert={waehleTyp} label={zw("Art", "Kind")} /> }]} />
          </>} />
        <FeinKarte style={{ marginTop: 20 }}>
          <p style={titelStil}>{zw("Wertetabelle", "Table of values")}</p>
          <WerteTabelle xs={xs} ys={ys} extra={extra} />
          {merke}
        </FeinKarte>
      </div>
    );
  }
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Art der Zuordnung", "Kind of assignment")}</p>
      <Auswahl optionen={arten} wert={typ} setWert={waehleTyp} label={zw("Art", "Kind")} />
      <div style={{ marginTop: 12 }}><Regler name="k" wert={k} setWert={setK} min={typ === "prop" ? 0.5 : 6} max={typ === "prop" ? 5 : 24} schritt={typ === "prop" ? 0.5 : 1} /></div>
      <div style={{ marginTop: 12 }}>
        <WerteTabelle xs={xs} ys={ys} extra={extra} />
      </div>
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 6 }}><Graph xs={xs} ys={ys} kurve={kurve} /></div>
      {merke}
    </div>
  );
}

const TITEL = { erkennen: ["Zuordnung erkennen", "Spot the assignment"], prop: ["Dreisatz proportional", "Rule of three (direct)"], anti: ["Dreisatz antiproportional", "Rule of three (inverse)"], faktor: ["Proportionalitätsfaktor", "Constant of proportionality"], luecke: ["Lücke in der Tabelle", "Gap in the table"], graph: ["Graph deuten", "Read the graph"] };
const neue = (art) => ({ id: ++zaehler, ...zuordAufgabe(art) });
const TYP_OPT = [["prop", zw("proportional", "proportional")], ["anti", zw("antiproportional", "inversely proportional")], ["keine", zw("keins von beiden", "neither")]];

function schritte(a) {
  if (a.art === "erkennen" || a.art === "graph") {
    const qs = a.xs.map((x, i) => a.ys[i] / x), ps = a.xs.map((x, i) => a.ys[i] * x);
    return [ws("zu-typ", zw("Art bestimmen", "Determine the kind"), a.art === "graph" ? zw("Welche Zuordnung zeigt der Graph?", "Which assignment does the graph show?") : zw("Welche Zuordnung zeigt die Tabelle?", "Which assignment does the table show?"), TYP_OPT, a.typ,
      { fehler: TYP_OPT.filter(([k]) => k !== a.typ).map(([k]) => ({ wahl: k, text: k === "prop" ? zw(`Prüfe die Quotienten y : x: ${qs.map(z).join(", ")} – nicht alle gleich.`, `Check the quotients y : x: ${qs.map(z).join(", ")} – not all equal.`) : k === "anti" ? zw(`Prüfe die Produkte x · y: ${ps.map(z).join(", ")} – nicht alle gleich.`, `Check the products x · y: ${ps.map(z).join(", ")} – not all equal.`) : zw("Doch – prüfe Quotienten und Produkte.", "There is one – check quotients and products.") })),
        hinweis: zw("Proportional: y : x immer gleich. Antiproportional: x · y immer gleich.", "Proportional: y : x always equal. Inverse: x · y always equal."),
        erkl: a.typ === "prop" ? zw(`y : x = ${z(qs[0])} überall → proportional`, `y : x = ${z(qs[0])} everywhere → proportional`) : a.typ === "anti" ? zw(`x · y = ${z(ps[0])} überall → antiproportional`, `x · y = ${z(ps[0])} everywhere → inverse`) : zw("Weder Quotient noch Produkt bleiben gleich.", "Neither quotient nor product stays the same.") })];
  }
  if (a.art === "prop") return [
    zs("zu-p1", zw("Auf eins schließen", "Work out one"), zw("1 kostet", "1 costs"), a.eins, zw(`${a.a} ${a.ding} kosten ${z(a.preisA)} €. Was kostet eins?`, `${a.a} ${a.ding} cost €${z(a.preisA)}. What does one cost?`), { einheit: "€", tol: 0.0051, fehler: [{ wert: a.preisA * a.a, text: zw("Weniger Stück → weniger Geld: teilen.", "Fewer items → less money: divide.") }], hinweis: `${z(a.preisA)} : ${a.a}`, erkl: `${z(a.preisA)} : ${a.a} = ${z(a.eins)} €` }),
    zs("zu-p2", zw("Auf die Menge schließen", "Scale up"), `${a.b} ${zw("kosten", "cost")}`, a.ergebnis, zw(`Was kosten ${a.b} ${a.ding}?`, `What do ${a.b} ${a.ding} cost?`), { einheit: "€", tol: 0.0051, fehler: [{ wert: a.preisA / a.b, text: zw("Mehr Stück → mehr Geld: malnehmen.", "More items → more money: multiply.") }], hinweis: `${z(a.eins)} · ${a.b}`, erkl: `${z(a.eins)} · ${a.b} = ${z(a.ergebnis)} €` }),
  ];
  if (a.art === "anti") return [
    ws("zu-a0", zw("Art erkennen", "Spot the kind"), zw("Mehr Arbeiter – was passiert mit der Zeit?", "More workers – what happens to the time?"), [["anti", zw("sie wird kürzer (antiproportional)", "it gets shorter (inverse)")], ["prop", zw("sie wird länger (proportional)", "it gets longer (proportional)")]], "anti", { hinweis: zw("Doppelt so viele helfen → halb so lange.", "Twice as many help → half as long."), erkl: zw("antiproportional", "inversely proportional") }),
    zs("zu-a1", zw("Gesamtarbeit", "Total work"), zw("Arbeitstage gesamt =", "Total work days ="), a.gesamt, zw("Wie viele Tage bräuchte eine Person allein?", "How many days would one person need alone?"), { fehler: [{ wert: a.tA / a.a, text: zw("Eine Person braucht länger, nicht kürzer: malnehmen.", "One person takes longer, not shorter: multiply.") }], hinweis: `${a.a} · ${a.tA}`, erkl: `${a.a} · ${a.tA} = ${a.gesamt}` }),
    zs("zu-a2", zw("Neue Dauer", "New duration"), zw("Tage =", "Days ="), a.tB, zw(`Wie lange brauchen ${a.b} Personen?`, `How long do ${a.b} people take?`), { fehler: [{ wert: a.tA * a.b / a.a, text: zw("Das wäre proportional gerechnet. Hier gilt: mehr Leute, weniger Zeit.", "That's the proportional way. Here: more people, less time.") }], hinweis: `${a.gesamt} : ${a.b}`, erkl: `${a.gesamt} : ${a.b} = ${a.tB}` }),
  ];
  if (a.art === "faktor") return [zs("zu-k", zw("Faktor", "Factor"), "k =", a.k, zw("Die Zuordnung ist proportional. Wie groß ist der Faktor k mit y = k · x?", "The assignment is proportional. What is k in y = k · x?"), { fehler: [{ wert: a.xs[0] / a.ys[0], text: zw("Umgekehrt: k = y : x.", "The other way round: k = y : x.") }], hinweis: `${z(a.ys[0])} : ${a.xs[0]}`, erkl: `k = ${z(a.ys[0])} : ${a.xs[0]} = ${z(a.k)}` })];
  const ref = a.fehlt === 0 ? 1 : 0;
  return [
    ws("zu-l1", zw("Art", "Kind"), zw("Ist die Zuordnung proportional oder antiproportional?", "Is the assignment proportional or inverse?"), TYP_OPT.slice(0, 2), a.anti ? "anti" : "prop", { hinweis: zw("Vergleiche zwei vollständige Wertepaare.", "Compare two complete value pairs."), erkl: a.anti ? zw("x · y bleibt gleich → antiproportional", "x · y stays the same → inverse") : zw("y : x bleibt gleich → proportional", "y : x stays the same → proportional") }),
    zs("zu-l2", zw("Fehlender Wert", "Missing value"), "y =", a.wert, zw("Welcher Wert gehört in die Lücke?", "Which value goes into the gap?"), { fehler: [{ wert: a.anti ? a.ys[ref] / a.xs[ref] * a.xs[a.fehlt] : a.ys[ref] * a.xs[ref] / a.xs[a.fehlt], text: zw("Falsche Art der Zuordnung verwendet.", "You used the wrong kind of assignment.") }], hinweis: a.anti ? `${z(a.xs[ref] * a.ys[ref])} : ${a.xs[a.fehlt]}` : `${z(a.ys[ref] / a.xs[ref])} · ${a.xs[a.fehlt]}`, erkl: `y = ${z(a.wert)}` }),
  ];
}

function text(a) {
  if (a.art === "erkennen") return <><p style={{ margin: "0 0 8px" }}>{zw("Untersuche die Wertetabelle.", "Examine the table of values.")}</p><WerteTabelle xs={a.xs} ys={a.ys} /></>;
  if (a.art === "graph") return zw("Der Graph zeigt eine Zuordnung x → y.", "The graph shows an assignment x → y.");
  if (a.art === "prop") return zw(`${a.a} ${a.ding} kosten ${z(a.preisA)} €.`, `${a.a} ${a.ding} cost €${z(a.preisA)}.`);
  if (a.art === "anti") return zw(`${a.a} Personen streichen einen Zaun in ${a.tA} Tagen. Alle arbeiten gleich schnell.`, `${a.a} people paint a fence in ${a.tA} days. Everyone works at the same speed.`);
  if (a.art === "faktor") return <><p style={{ margin: "0 0 8px" }}>{zw("Proportionale Zuordnung:", "Proportional assignment:")}</p><WerteTabelle xs={a.xs} ys={a.ys} /></>;
  return <><p style={{ margin: "0 0 8px" }}>{zw("Ergänze die Tabelle.", "Complete the table.")}</p><WerteTabelle xs={a.xs} ys={a.ys} luecke={a.fehlt} /></>;
}

const skizze = (a) => (a.art === "graph" ? <Graph xs={a.xs} ys={a.ys} /> : null);

const hilfe = (a) => hilfeKontext({
  id: `zuordnung-${a.art}`, aufgabe: "Zuordnung proportional antiproportional Dreisatz Quotientengleichheit Produktgleichheit",
  verstehen: [zw("Was passiert mit y, wenn x verdoppelt wird?", "What happens to y when x doubles?")],
  ansatz: [zw("Dreisatz: erst auf 1 schließen, dann auf die gesuchte Menge.", "Rule of three: first work out 1, then the wanted amount.")],
  regel: [zw("Proportional: y : x konstant. Antiproportional: x · y konstant.", "Proportional: y : x constant. Inverse: x · y constant.")],
  pruefen: [zw("Mehr → mehr oder mehr → weniger? Passt dein Ergebnis dazu?", "More → more or more → less? Does your result match?")],
});

export function Zuordnungen() {
  return (
    <ZweiModi werkzeug="zuordnungen" animationen={werkzeugAnimationen("zuordnungen")} titel={zw("Zuordnungen und Dreisatz", "Assignments and the rule of three")}
      text={zw("Proportional oder antiproportional? An Tabelle und Graph erkennen, mit dem Dreisatz rechnen – und nie wieder falsch herum.", "Proportional or inverse? Spot it in tables and graphs, calculate with the rule of three – and never the wrong way round again.")}
      kurz={<p style={{ margin: 0 }}>{zw("Proportional: y = k · x, Quotientengleichheit, Ursprungsgerade. Antiproportional: y = k : x, Produktgleichheit, Hyperbel. Dreisatz: gegebene Menge → 1 → gesuchte Menge.", "Proportional: y = k · x, equal quotients, line through the origin. Inverse: y = k : x, equal products, hyperbola. Rule of three: given amount → 1 → wanted amount.")}</p>}
      entdecken={<Entdecken />}
      ueben={<UebenRahmen titel={TITEL} arten={ZUORD_ARTEN} neue={neue} schritte={schritte} text={text} skizze={skizze} hilfe={hilfe} />} />
  );
}
