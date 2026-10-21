/* ============================================================
   Ungleichungen und Beträge (Bereich „Gleichungen“, Station 3)
   Lernweg in fünf Kapiteln, jede Einführung in drei Stufen
   (Einstieg · Standard · Vertiefung), dazu ein Labor und Übungen:
     1 Lineare Ungleichungen – Zeichen dreht bei negativem Faktor
     2 Betrag und Betragsgleichungen – Betrag als Abstand
     3 Betragsungleichungen – innen und außen
     4 Quadratische Ungleichungen – Parabel lesen, Vorzeichentabelle
     5 Alles gemischt
   Mathematik und Aufgaben: ungleichGen.js, mengenRechnen.js (getestet).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { MS, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { Aufklapp, FunktionsBild, zt } from "./ui3.jsx";
import { Merke, Regler } from "./geoUi.jsx";
import { Absatz, Einfuehrung, FormelBlock, Labor, Leitfrage, LernwegSeite, MengenStrahl, Schalter, Trenner, UebenDaten, UebenKopf } from "./lernwegUi.jsx";
import {
  DREH, LEER, R, REL_TEX, abstandTex, gilt, halbIntervall, istStreng, iv, linTex, loesTex, mengeTex, ohne, pktMenge, quadTex, ver, zTex,
} from "./mengenRechnen.js";
import { KAPITEL_ARTEN, UG_TITEL, ugAufgabe } from "./ungleichGen.js";
import { Arbeitsflaeche, FeinKarte, Werkzeugleiste, toenKarte, useDesktop } from "./arbeitsflaeche.jsx";
import { ReglerReihe, SenkrechtRegler } from "./trainerDesktop.jsx";

/* Desktop-Labor (DESKTOP-STIL.md): Einstellungen links (Regler + oben / − unten), Bild rechts mit Werkzeugleiste,
   Rechnung darunter. data-labor wie beim Handy-Labor (lernwegUi.jsx), damit Tests beide finden. */
function DeskLabor({ titel, aufforderung, regler, leiste, links, bild, unten }) {
  return (
    <FeinKarte data-labor style={{ marginTop: 14 }}>
      <p style={kicker}>{titel}</p>
      <p style={{ fontSize: 13, color: C.see, fontWeight: 600, margin: "0 0 14px" }}>{aufforderung}</p>
      <Arbeitsflaeche linksBreite={270}
        links={<>
          <div style={toenKarte(C.see)}><ReglerReihe spalten={React.Children.toArray(regler.props.children).length}>{regler}</ReglerReihe></div>
          {links}
        </>}
        rechts={<>
          <div style={{ minWidth: 0 }}>{bild}</div>
          {leiste && <Werkzeugleiste gruppen={leiste} />}
        </>} />
      {unten && <div style={{ marginTop: 16 }}>{unten}</div>}
    </FeinKarte>
  );
}

const GRUEN = "#0F7A4D";
const REL_OPT = [["<", "$<$"], ["<=", "$\\le$"], [">", "$>$"], [">=", "$\\ge$"]];

/* Hilfe für „Ich hänge fest“ */
const hilfe = (au) => hilfeKontext({
  id: `ungleichungen-${au.art}`, aufgabe: "Ungleichungen Betrag Betragsgleichung Betragsungleichung quadratische Ungleichung Lösungsmenge Intervall",
  verstehen: [zw("Steht dort =, <, ≤, > oder ≥? Kommt ein Betrag vor?", "Is it =, <, ≤, > or ≥? Is there an absolute value?")],
  ansatz: [
    zw("Linear: wie eine Gleichung umformen – bei Mal/Geteilt mit einer negativen Zahl das Zeichen drehen.", "Linear: rearrange like an equation – flip the sign when multiplying/dividing by a negative number."),
    zw("Betrag: |x − m| ist der Abstand von x zu m. < heißt innen, > heißt außen.", "Absolute value: |x − m| is the distance from x to m. < means inside, > means outside."),
    zw("Quadratisch: Nullstellen bestimmen, Öffnung der Parabel ansehen, Bereich ablesen.", "Quadratic: find the roots, look at the opening, read off the region."),
  ],
  regel: ["c < 0: a < b ⇒ a·c > b·c", "|x − m| < r ⇔ m − r < x < m + r", zw("< und >: Grenze ausgeschlossen ]…[, ≤ und ≥: eingeschlossen […]", "< and >: bound excluded ]…[, ≤ and ≥: included […]")],
  pruefen: [zw("Probe mit einer Zahl aus der Lösungsmenge und einer von außerhalb.", "Check with one number inside the solution set and one outside.")],
});
const skizze = (au) => (au.skizze?.menge ? <MengenStrahl mengen={[{ menge: au.skizze.menge, farbe: C.see, name: "L" }]} /> : null);
const ueben = (arten) => <UebenDaten titel={UG_TITEL} arten={arten} erzeuge={(a) => ugAufgabe(a)} skizze={skizze} hilfe={hilfe} />;

/* Probe-Zeile im Labor */
function Probe({ ok, children }) {
  return (
    <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 12, background: ok ? "#E6F6EF" : "#FCEFE8", color: ok ? GRUEN : C.signal, fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
      {children} {ok ? zw("– wahr, x gehört zur Lösungsmenge.", "– true, x belongs to the solution set.") : zw("– falsch, x gehört nicht dazu.", "– false, x is not in it.")}
    </div>
  );
}
/* a · t + b mit eingesetztem t (ohne 1 · und + 0) */
function probeTerm(a, b, t) {
  if (a === 0) return zTex(b);
  const tt = t < 0 ? `(${zTex(t)})` : zTex(t);
  const vorn = a === 1 ? tt : a === -1 ? `−${tt}` : `${zTex(a)} \\cdot ${tt}`;
  return `${vorn}${b > 0 ? ` + ${b}` : b < 0 ? ` − ${-b}` : ""}`;
}
const zeile = { fontSize: 18, color: C.tinte, padding: "6px 0", overflowX: "auto" };

/* ============================================================
   KAPITEL 1 · LINEARE UNGLEICHUNGEN
   ============================================================ */
function LinLabor() {
  const [a, setA] = useState(-2), [b, setB] = useState(3), [c, setC] = useState(9), [rel, setRel] = useState("<"), [t, setT] = useState(0);
  let L, schritte;
  if (a === 0) {
    L = gilt(b, rel, c) ? R() : LEER();
    schritte = [`${zTex(b)} ${REL_TEX[rel]} ${zTex(c)}`];
  } else {
    const g = (c - b) / a, rel2 = a < 0 ? DREH[rel] : rel;
    L = halbIntervall(rel2, g);
    schritte = [`${linTex(a, b)} ${REL_TEX[rel]} ${zTex(c)}`];
    if (b !== 0) schritte.push(`${linTex(a, 0)} ${REL_TEX[rel]} ${zTex(c - b)}`);
    if (a !== 1) schritte.push(loesTex(rel2, g));
  }
  const ok = gilt(a * t + b, rel, c);
  const desktop = useDesktop();
  const titel = zw("Labor: Ungleichung lösen", "Lab: solve an inequality");
  const aufforderung = zw("Stell a auf eine negative Zahl und beobachte das Zeichen in der letzten Zeile.", "Set a to a negative number and watch the sign in the last line.");
  const rechnung = (
    <div style={{ background: C.sand, borderRadius: 14, padding: "8px 14px", marginTop: desktop ? 0 : 12 }}>
      {schritte.map((s, i) => (
        <div key={i} style={{ ...zeile, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <M t={s} />
          {i === schritte.length - 1 && a < 0 && schritte.length > 1 && <span style={{ fontSize: 11.5, fontWeight: 800, color: C.signal, background: `${C.signal}14`, padding: "3px 8px", borderRadius: 999 }}>{zw("Zeichen gedreht!", "sign flipped!")}</span>}
        </div>
      ))}
      {a === 0 && <p style={{ fontSize: 13.5, color: C.grau, margin: "4px 0 0" }}>{zw("Ohne x bleibt eine Aussage übrig: Sie ist für alle x wahr (L = ℝ) oder für keines (L = ∅).", "Without x a statement remains: true for all x (L = ℝ) or for none (L = ∅).")}</p>}
      <div style={{ ...zeile, fontWeight: 700, color: C.see }}><M t={`L = ${mengeTex(L)}`} /></div>
    </div>
  );
  const strahl = <MengenStrahl mengen={[{ menge: L, farbe: C.see, name: "L" }]} lo={-10} hi={10} punkte={[{ x: t, farbe: ok ? GRUEN : C.signal }]} />;
  const probe = <Probe ok={ok}><M t={`${probeTerm(a, b, t)} = ${zTex(a * t + b)} ${REL_TEX[rel]} ${zTex(c)}`} /></Probe>;
  const relSchalter = <Schalter optionen={REL_OPT} wert={rel} setWert={setRel} label={zw("Zeichen", "Sign")} />;
  if (desktop) {
    return (
      <DeskLabor titel={titel} aufforderung={aufforderung}
        regler={<>
          <SenkrechtRegler name="a" wert={a} setze={setA} min={-5} max={5} plusLabel="a +" minusLabel="a −" />
          <SenkrechtRegler name="b" wert={b} setze={setB} min={-10} max={10} farbe={C.gold} plusLabel="b +" minusLabel="b −" />
          <SenkrechtRegler name="c" wert={c} setze={setC} min={-10} max={10} farbe={C.smaragd} plusLabel="c +" minusLabel="c −" />
        </>}
        links={rechnung}
        bild={<>{strahl}<div style={{ marginTop: 6 }}><Regler name={zw("Probe x", "Test x")} wert={t} setWert={setT} min={-10} max={10} schritt={0.5} format={(v) => zt(v)} farbe={C.flaggold} breiteName={64} /></div>{probe}</>}
        leiste={[{ titel: zw("Zeichen", "Sign"), inhalt: relSchalter }]} />
    );
  }
  return (
    <Labor titel={zw("Labor: Ungleichung lösen", "Lab: solve an inequality")} aufforderung={zw("Stell a auf eine negative Zahl und beobachte das Zeichen in der letzten Zeile.", "Set a to a negative number and watch the sign in the last line.")}>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name="a" wert={a} setWert={setA} min={-5} max={5} schritt={1} format={(v) => zt(v)} />
        <Regler name="b" wert={b} setWert={setB} min={-10} max={10} schritt={1} format={(v) => zt(v)} farbe={C.gold} />
        <Regler name="c" wert={c} setWert={setC} min={-10} max={10} schritt={1} format={(v) => zt(v)} farbe={C.smaragd} />
        <Schalter optionen={REL_OPT} wert={rel} setWert={setRel} label={zw("Zeichen", "Sign")} />
      </div>
      <div style={{ background: C.sand, borderRadius: 14, padding: "8px 14px", marginTop: 12 }}>
        {schritte.map((s, i) => (
          <div key={i} style={{ ...zeile, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <M t={s} />
            {i === schritte.length - 1 && a < 0 && schritte.length > 1 && <span style={{ fontSize: 11.5, fontWeight: 800, color: C.signal, background: `${C.signal}14`, padding: "3px 8px", borderRadius: 999 }}>{zw("Zeichen gedreht!", "sign flipped!")}</span>}
          </div>
        ))}
        {a === 0 && <p style={{ fontSize: 13.5, color: C.grau, margin: "4px 0 0" }}>{zw("Ohne x bleibt eine Aussage übrig: Sie ist für alle x wahr (L = ℝ) oder für keines (L = ∅).", "Without x a statement remains: true for all x (L = ℝ) or for none (L = ∅).")}</p>}
        <div style={{ ...zeile, fontWeight: 700, color: C.see }}><M t={`L = ${mengeTex(L)}`} /></div>
      </div>
      <MengenStrahl mengen={[{ menge: L, farbe: C.see, name: "L" }]} lo={-10} hi={10} punkte={[{ x: t, farbe: ok ? GRUEN : C.signal }]} />
      <Regler name={zw("Probe x", "Test x")} wert={t} setWert={setT} min={-10} max={10} schritt={0.5} format={(v) => zt(v)} farbe={C.flaggold} breiteName={64} />
      <Probe ok={ok}><M t={`${probeTerm(a, b, t)} = ${zTex(a * t + b)} ${REL_TEX[rel]} ${zTex(c)}`} /></Probe>
    </Labor>
  );
}

function KapitelLinear({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Was ist an Ungleichungen anders als an Gleichungen?", "What is different about inequalities compared to equations?")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("Du hast 20 € und ein Kinoticket kostet 7 €. Wie viele Tickets kannst du kaufen? Nicht „genau so viele“, sondern „höchstens so viele“: 7 · x ≤ 20. Das ist eine Ungleichung.", "You have €20 and a cinema ticket costs €7. How many tickets can you buy? Not “exactly so many” but “at most so many”: 7 · x ≤ 20. That's an inequality.")}</Absatz>
          <Absatz>{zw("Eine Gleichung hat meist eine einzige Lösung. Eine Ungleichung hat meist einen ganzen Bereich von Lösungen – auf der Zahlengeraden ein Stück, das ins Unendliche weiterläuft oder zwischen zwei Grenzen liegt.", "An equation usually has one solution. An inequality usually has a whole range of solutions – on the number line a piece that runs off to infinity or lies between two bounds.")}</Absatz>
          <Absatz>{zw("Gerechnet wird fast wie bei Gleichungen. Es gibt nur eine Falle: Teilst du durch eine negative Zahl, kippt das Zeichen. Probier es im Labor aus.", "You calculate almost like with equations. There's only one trap: if you divide by a negative number, the sign flips. Try it in the lab.")}</Absatz>
        </>}
        standard={<>
          <Absatz>{zw("Eine lineare Ungleichung löst du mit denselben Umformungen wie eine Gleichung – mit einer Ausnahme:", "You solve a linear inequality with the same steps as an equation – with one exception:")}</Absatz>
          <FormelBlock t={["a < b \\Rightarrow a + c < b + c", "c > 0:\\; a < b \\Rightarrow a \\cdot c < b \\cdot c", "c < 0:\\; a < b \\Rightarrow a \\cdot c > b \\cdot c"]} />
          <Absatz>{zw("Beispiel: $−3x + 4 > 10$. Minus 4: $−3x > 6$. Geteilt durch $−3$ – Zeichen dreht: $x < −2$. Die Lösungsmenge ist $L = ]−\\infty; −2[$.", "Example: $−3x + 4 > 10$. Minus 4: $−3x > 6$. Divided by $−3$ – the sign flips: $x < −2$. The solution set is $L = ]−\\infty; −2[$.")}</Absatz>
          <Absatz>{zw("In der Intervallschreibweise zeigt die Klammer, ob die Grenze dazugehört: bei < und > zeigt sie nach außen, bei ≤ und ≥ zur Zahl hin. Am Unendlichen steht immer eine offene Klammer.", "In interval notation the bracket shows whether the bound is included: with < and > it points outwards, with ≤ and ≥ towards the number. At infinity there is always an open bracket.")}</Absatz>
        </>}
        vertiefung={<>
          <Absatz>{zw("Warum dreht das Zeichen? $a < b$ heißt: $b − a$ ist positiv. Multiplizierst du mit $c < 0$, wird aus dem positiven $b − a$ das negative $(b − a) \\cdot c = bc − ac$. Also ist $bc < ac$, und das heißt $ac > bc$.", "Why does the sign flip? $a < b$ means $b − a$ is positive. Multiplying by $c < 0$ turns the positive $b − a$ into the negative $(b − a) \\cdot c = bc − ac$. So $bc < ac$, i.e. $ac > bc$.")}</Absatz>
          <Absatz>{zw("Anschaulich ist Malnehmen mit −1 eine Spiegelung an der 0: Was vorher rechts lag, liegt danach links. 2 < 5, aber −2 > −5.", "Visually, multiplying by −1 reflects in 0: what was on the right is now on the left. 2 < 5, but −2 > −5.")}</Absatz>
          <Absatz>{zw("Daraus folgt eine wichtige Warnung: Durch einen Term mit unbekanntem Vorzeichen (etwa x oder x − 2) darfst du nicht einfach teilen. Dann brauchst du eine Fallunterscheidung – das ist genau die Technik der Betrags- und Bruchungleichungen.", "An important warning follows: you may not simply divide by a term of unknown sign (like x or x − 2). Then you need a case distinction – exactly the technique for absolute value and fractional inequalities.")}</Absatz>
        </>}
      />
      <LinLabor />
      <Merke farbe={C.see}><MS s={zw("Plus und Minus ändern das Ungleichheitszeichen nie. Mal und Geteilt mit einer positiven Zahl auch nicht. Nur Mal oder Geteilt mit einer negativen Zahl dreht es: $<$ wird $>$, $\\le$ wird $\\ge$.", "Plus and minus never change the inequality sign. Neither do times and divide by a positive number. Only times or divide by a negative number flips it: $<$ becomes $>$, $\\le$ becomes $\\ge$.")} /></Merke>
      <Trenner />
      <UebenKopf>{zw("Lineare Ungleichungen lösen", "Solve linear inequalities")}</UebenKopf>
      {ueben(KAPITEL_ARTEN.lin)}
    </>
  );
}

/* ============================================================
   KAPITEL 2 + 3 · BETRAG
   ============================================================ */
function betragLoesung(m, r, rel) {
  if (rel === "=") return r > 0 ? pktMenge(m - r, m + r) : r === 0 ? pktMenge(m) : LEER();
  if (rel === "<") return r > 0 ? iv(m - r, m + r, false, false) : LEER();
  if (rel === "<=") return r > 0 ? iv(m - r, m + r, true, true) : r === 0 ? pktMenge(m) : LEER();
  if (rel === ">") return r > 0 ? ver(iv(-Infinity, m - r, false, false), iv(m + r, Infinity, false, false)) : r === 0 ? ohne(m) : R();
  return r > 0 ? ver(iv(-Infinity, m - r, false, true), iv(m + r, Infinity, true, false)) : R();
}
const BET_REL = [["=", "$=$"], ...REL_OPT];
function BetragLabor({ start = "=" }) {
  const [m, setM] = useState(2), [r, setR] = useState(3), [rel, setRel] = useState(start);
  const Lm = betragLoesung(m, r, rel);
  const relTex = rel === "=" ? "=" : REL_TEX[rel];
  const desktop = useDesktop();
  if (desktop) {
    return (
      <DeskLabor titel={zw("Labor: Betrag als Abstand", "Lab: absolute value as distance")} aufforderung={zw("Verschiebe den Mittelpunkt m und den Abstand r – und wechsle das Zeichen.", "Move the centre m and the distance r – and switch the sign.")}
        regler={<>
          <SenkrechtRegler name="m" wert={m} setze={setM} min={-5} max={5} plusLabel="m +" minusLabel="m −" />
          <SenkrechtRegler name="r" wert={r} setze={setR} min={-2} max={6} farbe={C.gold} plusLabel="r +" minusLabel="r −" />
        </>}
        links={<FeinKarte style={{ padding: "14px 16px" }}>
          <div style={{ ...zeile, textAlign: "center", fontWeight: 700 }}><M t={`|${abstandTex(m)}| ${relTex} ${zTex(r)}`} /></div>
          <p style={{ fontSize: 13.5, color: C.grau, margin: "0 0 6px", textAlign: "center", lineHeight: 1.55 }}>
            {r < 0 ? zw("Ein Abstand ist nie negativ.", "A distance is never negative.")
              : zw(`Abstand von x zu ${zt(m)} ${rel === "=" ? "genau" : rel === "<" ? "kleiner als" : rel === "<=" ? "höchstens" : rel === ">" ? "größer als" : "mindestens"} ${zt(r)}`, `Distance from x to ${zt(m)} ${rel === "=" ? "exactly" : rel === "<" ? "less than" : rel === "<=" ? "at most" : rel === ">" ? "greater than" : "at least"} ${zt(r)}`)}
          </p>
          <div style={{ ...zeile, fontWeight: 700, color: C.see, textAlign: "center" }}><M t={`L = ${mengeTex(Lm)}`} /></div>
        </FeinKarte>}
        bild={<>
          <MengenStrahl mengen={[{ menge: Lm, farbe: C.see, name: "L" }]} lo={-10} hi={10} punkte={[{ x: m, farbe: C.flaggold }]} />
          <div style={{ marginTop: 8 }}>
            <FunktionsBild x0={-10} x1={10} y0={-3} y1={10}
              kurven={[{ f: (x) => Math.abs(x - m), farbe: C.see, name: `y = |${abstandTex(m).replace(/−/g, "−")}|` }]}
              waagerechte={[{ y: r, farbe: C.gold, text: `y = ${zt(r)}` }]}
              punkte={r > 0 ? [{ x: m - r, y: r, farbe: C.gold }, { x: m + r, y: r, farbe: C.gold }] : r === 0 ? [{ x: m, y: 0, farbe: C.gold }] : []} />
          </div>
          <p style={{ fontSize: 12.5, color: C.grau, margin: "6px 2px 0", lineHeight: 1.55 }}>{zw("Der Graph von |x − m| ist ein V mit der Spitze bei m. Wo das V unter der goldenen Linie liegt, ist der Abstand kleiner als r.", "The graph of |x − m| is a V with its tip at m. Where the V lies below the gold line, the distance is less than r.")}</p>
        </>}
        leiste={[{ titel: zw("Zeichen", "Sign"), inhalt: <Schalter optionen={BET_REL} wert={rel} setWert={setRel} label={zw("Zeichen", "Sign")} /> }]} />
    );
  }
  return (
    <Labor titel={zw("Labor: Betrag als Abstand", "Lab: absolute value as distance")} aufforderung={zw("Verschiebe den Mittelpunkt m und den Abstand r – und wechsle das Zeichen.", "Move the centre m and the distance r – and switch the sign.")}>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name="m" wert={m} setWert={setM} min={-5} max={5} schritt={1} format={(v) => zt(v)} />
        <Regler name="r" wert={r} setWert={setR} min={-2} max={6} schritt={1} format={(v) => zt(v)} farbe={C.gold} />
        <Schalter optionen={BET_REL} wert={rel} setWert={setRel} label={zw("Zeichen", "Sign")} />
      </div>
      <div style={{ ...zeile, textAlign: "center", fontWeight: 700, marginTop: 8 }}><M t={`|${abstandTex(m)}| ${relTex} ${zTex(r)}`} /></div>
      <p style={{ fontSize: 13.5, color: C.grau, margin: "0 0 6px", textAlign: "center", lineHeight: 1.55 }}>
        {r < 0 ? zw("Ein Abstand ist nie negativ.", "A distance is never negative.")
          : zw(`Abstand von x zu ${zt(m)} ${rel === "=" ? "genau" : rel === "<" ? "kleiner als" : rel === "<=" ? "höchstens" : rel === ">" ? "größer als" : "mindestens"} ${zt(r)}`, `Distance from x to ${zt(m)} ${rel === "=" ? "exactly" : rel === "<" ? "less than" : rel === "<=" ? "at most" : rel === ">" ? "greater than" : "at least"} ${zt(r)}`)}
      </p>
      <MengenStrahl mengen={[{ menge: Lm, farbe: C.see, name: "L" }]} lo={-10} hi={10} punkte={[{ x: m, farbe: C.flaggold }]} />
      <div style={{ ...zeile, fontWeight: 700, color: C.see, textAlign: "center" }}><M t={`L = ${mengeTex(Lm)}`} /></div>
      <div style={{ marginTop: 8 }}>
        <FunktionsBild x0={-10} x1={10} y0={-3} y1={10}
          kurven={[{ f: (x) => Math.abs(x - m), farbe: C.see, name: `y = |${abstandTex(m).replace(/−/g, "−")}|` }]}
          waagerechte={[{ y: r, farbe: C.gold, text: `y = ${zt(r)}` }]}
          punkte={r > 0 ? [{ x: m - r, y: r, farbe: C.gold }, { x: m + r, y: r, farbe: C.gold }] : r === 0 ? [{ x: m, y: 0, farbe: C.gold }] : []} />
      </div>
      <p style={{ fontSize: 12.5, color: C.grau, margin: "6px 2px 0", lineHeight: 1.55 }}>{zw("Der Graph von |x − m| ist ein V mit der Spitze bei m. Wo das V unter der goldenen Linie liegt, ist der Abstand kleiner als r.", "The graph of |x − m| is a V with its tip at m. Where the V lies below the gold line, the distance is less than r.")}</p>
    </Labor>
  );
}

function KapitelBetrag({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Wie weit ist eine Zahl von einer anderen entfernt?", "How far is one number from another?")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("−7 °C ist genauso weit von 0 °C entfernt wie +7 °C: sieben Grad. Genau das misst der Betrag. Er vergisst das Vorzeichen und zählt nur die Entfernung zur Null: $|−7| = 7$ und $|7| = 7$.", "−7 °C is just as far from 0 °C as +7 °C: seven degrees. That's exactly what the absolute value measures. It forgets the sign and only counts the distance to zero: $|−7| = 7$ and $|7| = 7$.")}</Absatz>
          <Absatz>{zw("Noch nützlicher: $|x − 3|$ ist die Entfernung von x zur 3 – wie die Zahl der Häuser zwischen zwei Hausnummern. $|x − 3| = 2$ fragt also: Welche Zahlen sind genau 2 Schritte von der 3 entfernt? Antwort: die 1 und die 5.", "Even more useful: $|x − 3|$ is the distance from x to 3 – like counting houses between two house numbers. $|x − 3| = 2$ asks: which numbers are exactly 2 steps from 3? Answer: 1 and 5.")}</Absatz>
        </>}
        standard={<>
          <FormelBlock t={[zw("|x| = x \\text{ für } x \\ge 0", "|x| = x \\text{ for } x \\ge 0"), zw("|x| = −x \\text{ für } x < 0", "|x| = −x \\text{ for } x < 0")]} />
          <Absatz>{zw("$|x − a|$ ist der Abstand von x und a auf der Zahlengeraden. Daher hat $|x − a| = r$ für $r > 0$ zwei Lösungen, $x = a − r$ und $x = a + r$; für $r = 0$ eine; für $r < 0$ keine.", "$|x − a|$ is the distance between x and a on the number line. So $|x − a| = r$ has two solutions for $r > 0$, $x = a − r$ and $x = a + r$; one for $r = 0$; none for $r < 0$.")}</Absatz>
          <Absatz>{zw("Allgemein löst du $|ax + b| = c$ (mit $c > 0$) in zwei Fällen: Fall 1: $ax + b = c$, Fall 2: $ax + b = −c$. Beispiel: $|2x − 4| = 6$ ⇒ $2x − 4 = 6$, also $x = 5$, oder $2x − 4 = −6$, also $x = −1$.", "In general you solve $|ax + b| = c$ (with $c > 0$) in two cases: case 1: $ax + b = c$, case 2: $ax + b = −c$. Example: $|2x − 4| = 6$ ⇒ $2x − 4 = 6$, so $x = 5$, or $2x − 4 = −6$, so $x = −1$.")}</Absatz>
        </>}
        vertiefung={<>
          <Absatz>{zw("Steht auch rechts ein Term mit x, reicht „plus oder minus“ nicht mehr. Dann wird nach dem Vorzeichen des Inhalts unterschieden – mit Bedingung. Beispiel $|x − 1| = 2x$:", "If the right side also contains x, “plus or minus” is no longer enough. Then you distinguish by the sign of the inside – with a condition. Example $|x − 1| = 2x$:")}</Absatz>
          <FormelBlock t={[zw("x \\ge 1:\\; x − 1 = 2x \\Rightarrow x = −1 \\; (\\text{widerspricht } x \\ge 1)", "x \\ge 1:\\; x − 1 = 2x \\Rightarrow x = −1 \\; (\\text{contradicts } x \\ge 1)"), "x < 1:\\; −x + 1 = 2x \\Rightarrow x = \\frac{1}{3} \\; ✓"]} />
          <Absatz>{zw("Also $L = \\{\\frac{1}{3}\\}$. Jede Fall-Lösung muss zu ihrer Bedingung passen – sonst wird sie verworfen. Nützliche Regeln: $|a \\cdot b| = |a| \\cdot |b|$ und die Dreiecksungleichung $|a + b| \\le |a| + |b|$.", "So $L = \\{\\frac{1}{3}\\}$. Each case's solution has to fit its condition – otherwise it is discarded. Useful rules: $|a \\cdot b| = |a| \\cdot |b|$ and the triangle inequality $|a + b| \\le |a| + |b|$.")}</Absatz>
        </>}
      />
      <BetragLabor start="=" />
      <Merke farbe={C.see}><MS s={zw("$|x − a|$ ist der Abstand von x zu a. $|T| = c$ mit $c > 0$: $T = c$ oder $T = −c$. Ist $c < 0$, gibt es keine Lösung, denn ein Betrag ist nie negativ.", "$|x − a|$ is the distance from x to a. $|T| = c$ with $c > 0$: $T = c$ or $T = −c$. If $c < 0$ there is no solution, since an absolute value is never negative.")} /></Merke>
      <Trenner />
      <UebenKopf>{zw("Beträge und Betragsgleichungen", "Absolute values and equations")}</UebenKopf>
      {ueben(KAPITEL_ARTEN.bet)}
    </>
  );
}

function KapitelBetragsungleichung({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Welche Zahlen liegen nah an m – und welche weit weg?", "Which numbers are close to m – and which are far away?")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("Ein Brett soll 50 cm lang sein, der Schreiner erlaubt höchstens 2 mm Abweichung. Erlaubt ist also alles, was höchstens 0,2 cm von 50 entfernt ist: $|L − 50| \\le 0{,}2$. Das sind alle Längen von 49,8 cm bis 50,2 cm.", "A board should be 50 cm long; the carpenter allows at most 2 mm deviation. So everything at most 0.2 cm from 50 is fine: $|L − 50| \\le 0.2$. That's all lengths from 49.8 cm to 50.2 cm.")}</Absatz>
          <Absatz>{zw("Merk dir ein Bild: „Abstand kleiner“ heißt drinnen – ein Stück um m herum. „Abstand größer“ heißt draußen – zwei Stücke, die nach links und rechts ins Unendliche laufen.", "Remember a picture: “distance less” means inside – a piece around m. “Distance greater” means outside – two pieces running off to the left and right.")}</Absatz>
        </>}
        standard={<>
          <FormelBlock t={["|x − m| < r \\Leftrightarrow m − r < x < m + r", "|x − m| > r \\Leftrightarrow x < m − r \\lor x > m + r"]} />
          <Absatz>{zw("Mit ≤ bzw. ≥ gehören die Grenzen dazu. Steht im Betrag $ax + b$, schreibst du zuerst eine Doppelungleichung: $|2x − 6| \\le 4$ ⇔ $−4 \\le 2x − 6 \\le 4$ ⇔ $2 \\le 2x \\le 10$ ⇔ $1 \\le x \\le 5$, also $L = [1; 5]$.", "With ≤ or ≥ the bounds are included. If the absolute value contains $ax + b$, first write a double inequality: $|2x − 6| \\le 4$ ⇔ $−4 \\le 2x − 6 \\le 4$ ⇔ $2 \\le 2x \\le 10$ ⇔ $1 \\le x \\le 5$, so $L = [1; 5]$.")}</Absatz>
          <Absatz>{zw("Bei „größer“ entstehen zwei Teile, die du mit ∪ verbindest: $|x + 1| > 3$ ⇒ $L = ]−\\infty; −4[ \\cup ]2; \\infty[$.", "With “greater” there are two parts joined by ∪: $|x + 1| > 3$ ⇒ $L = ]−\\infty; −4[ \\cup ]2; \\infty[$.")}</Absatz>
        </>}
        vertiefung={<>
          <Absatz>{zw("Die Merkregeln folgen aus einer Fallunterscheidung. $|x − 2| < 3$:", "The rules follow from a case distinction. $|x − 2| < 3$:")}</Absatz>
          <FormelBlock t={["x \\ge 2:\\; x − 2 < 3 \\Rightarrow 2 \\le x < 5", "x < 2:\\; −x + 2 < 3 \\Rightarrow −1 < x < 2"]} />
          <Absatz>{zw("Die Vereinigung beider Fälle ist $]−1; 5[$. Achte auf die Sonderfälle mit $r \\le 0$: $|T| < 0$ hat keine Lösung, $|T| \\ge 0$ gilt immer ($L = \\mathbb{R}$), und $|x − m| > 0$ gilt für alle x außer m: $L = \\mathbb{R} \\setminus \\{m\\}$.", "The union of both cases is $]−1; 5[$. Watch the special cases with $r \\le 0$: $|T| < 0$ has no solution, $|T| \\ge 0$ always holds ($L = \\mathbb{R}$), and $|x − m| > 0$ holds for all x except m: $L = \\mathbb{R} \\setminus \\{m\\}$.")}</Absatz>
        </>}
      />
      <BetragLabor start="<" />
      <Merke farbe={C.see}><MS s={zw("Kleiner: innen, ein Intervall $]m − r; m + r[$. Größer: außen, zwei Teile $]−\\infty; m − r[ \\cup ]m + r; \\infty[$. Mit ≤ bzw. ≥ werden die Klammern zu den Grenzen hin gedreht.", "Less: inside, one interval $]m − r; m + r[$. Greater: outside, two parts $]−\\infty; m − r[ \\cup ]m + r; \\infty[$. With ≤ or ≥ the brackets turn towards the bounds.")} /></Merke>
      <Trenner />
      <UebenKopf>{zw("Betragsungleichungen lösen", "Solve absolute value inequalities")}</UebenKopf>
      {ueben(KAPITEL_ARTEN.bu)}
    </>
  );
}

/* ============================================================
   KAPITEL 4 · QUADRATISCHE UNGLEICHUNGEN
   ============================================================ */
function quadLoesung(a, x1, x2, rel) {
  const lo = Math.min(x1, x2), hi = Math.max(x1, x2);
  const zu = !istStreng(rel);
  const positiv = rel === ">" || rel === ">=";
  if (lo === hi) {
    /* a(x − d)² */
    const oben = a > 0;
    if (oben === positiv) return zu ? R() : ohne(lo);
    return zu ? pktMenge(lo) : LEER();
  }
  return (a > 0) === positiv ? ver(iv(-Infinity, lo, false, zu), iv(hi, Infinity, zu, false)) : iv(lo, hi, zu, zu);
}
function QuadLabor() {
  const [x1, setX1] = useState(-2), [x2, setX2] = useState(3), [a, setA] = useState(1), [rel, setRel] = useState(">");
  const f = (x) => a * (x - x1) * (x - x2);
  const Lq = quadLoesung(a, x1, x2, rel);
  const b = -a * (x1 + x2), c = a * x1 * x2;
  const lo = Math.min(x1, x2), hi = Math.max(x1, x2);
  const desktop = useDesktop();
  if (desktop) {
    return (
      <DeskLabor titel={zw("Labor: Parabel lesen", "Lab: read the parabola")} aufforderung={zw("Verschiebe die Nullstellen, öffne die Parabel nach unten – und lies ab, wo sie über bzw. unter der x-Achse liegt.", "Move the roots, open the parabola downwards – and read off where it lies above or below the x-axis.")}
        regler={<>
          <SenkrechtRegler name="x₁" wert={x1} setze={setX1} min={-6} max={6} plusLabel="x₁ +" minusLabel="x₁ −" />
          <SenkrechtRegler name="x₂" wert={x2} setze={setX2} min={-6} max={6} plusLabel="x₂ +" minusLabel="x₂ −" />
        </>}
        links={<FeinKarte style={{ padding: "14px 16px" }}>
          <div style={{ ...zeile, textAlign: "center", fontWeight: 700 }}><M t={`${quadTex(a, b, c)} ${REL_TEX[rel]} 0`} /></div>
          <div style={{ ...zeile, fontWeight: 700, color: C.see, textAlign: "center" }}><M t={`L = ${mengeTex(Lq)}`} /></div>
          <p style={{ fontSize: 12.5, color: C.grau, margin: "4px 2px 0", lineHeight: 1.55 }}>
            {lo === hi ? zw("Doppelte Nullstelle: Die Parabel berührt die x-Achse nur.", "Double root: the parabola only touches the x-axis.")
              : zw(`Nach ${a > 0 ? "oben" : "unten"} geöffnet: zwischen den Nullstellen ${a > 0 ? "unter" : "über"}, außerhalb ${a > 0 ? "über" : "unter"} der x-Achse.`, `Opening ${a > 0 ? "up" : "down"}: between the roots ${a > 0 ? "below" : "above"}, outside ${a > 0 ? "above" : "below"} the x-axis.`)}
          </p>
        </FeinKarte>}
        bild={<>
          <FunktionsBild x0={-8} x1={8} y0={-10} y1={12} kurven={[{ f, farbe: C.see }]} punkte={[{ x: lo, y: 0, farbe: C.gold }, { x: hi, y: 0, farbe: C.gold }]}
            senkrechte={[{ x: lo, farbe: `${C.gold}88` }, { x: hi, farbe: `${C.gold}88` }]} />
          <MengenStrahl mengen={[{ menge: Lq, farbe: C.see, name: "L" }]} lo={-8} hi={8} />
        </>}
        leiste={[
          { titel: "a", inhalt: <Schalter optionen={[[1, "1"], [2, "2"], [-1, "−1"], [-0.5, "$−\\frac{1}{2}$"]]} wert={a} setWert={setA} label="a" /> },
          { titel: zw("Zeichen", "Sign"), inhalt: <Schalter optionen={REL_OPT} wert={rel} setWert={setRel} label={zw("Zeichen", "Sign")} /> },
        ]} />
    );
  }
  return (
    <Labor titel={zw("Labor: Parabel lesen", "Lab: read the parabola")} aufforderung={zw("Verschiebe die Nullstellen, öffne die Parabel nach unten – und lies ab, wo sie über bzw. unter der x-Achse liegt.", "Move the roots, open the parabola downwards – and read off where it lies above or below the x-axis.")}>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name="x₁" wert={x1} setWert={setX1} min={-6} max={6} schritt={1} format={(v) => zt(v)} />
        <Regler name="x₂" wert={x2} setWert={setX2} min={-6} max={6} schritt={1} format={(v) => zt(v)} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.see }}>a</span>
          <Schalter optionen={[[1, "1"], [2, "2"], [-1, "−1"], [-0.5, "$−\\frac{1}{2}$"]]} wert={a} setWert={setA} label="a" />
        </div>
        <Schalter optionen={REL_OPT} wert={rel} setWert={setRel} label={zw("Zeichen", "Sign")} />
      </div>
      <div style={{ ...zeile, textAlign: "center", fontWeight: 700, marginTop: 8 }}><M t={`${quadTex(a, b, c)} ${REL_TEX[rel]} 0`} /></div>
      <FunktionsBild x0={-8} x1={8} y0={-10} y1={12} kurven={[{ f, farbe: C.see }]} punkte={[{ x: lo, y: 0, farbe: C.gold }, { x: hi, y: 0, farbe: C.gold }]}
        senkrechte={[{ x: lo, farbe: `${C.gold}88` }, { x: hi, farbe: `${C.gold}88` }]} />
      <MengenStrahl mengen={[{ menge: Lq, farbe: C.see, name: "L" }]} lo={-8} hi={8} />
      <div style={{ ...zeile, fontWeight: 700, color: C.see, textAlign: "center" }}><M t={`L = ${mengeTex(Lq)}`} /></div>
      <p style={{ fontSize: 12.5, color: C.grau, margin: "4px 2px 0", lineHeight: 1.55 }}>
        {lo === hi ? zw("Doppelte Nullstelle: Die Parabel berührt die x-Achse nur.", "Double root: the parabola only touches the x-axis.")
          : zw(`Nach ${a > 0 ? "oben" : "unten"} geöffnet: zwischen den Nullstellen ${a > 0 ? "unter" : "über"}, außerhalb ${a > 0 ? "über" : "unter"} der x-Achse.`, `Opening ${a > 0 ? "up" : "down"}: between the roots ${a > 0 ? "below" : "above"}, outside ${a > 0 ? "above" : "below"} the x-axis.`)}
      </p>
    </Labor>
  );
}

function Vorzeichentabelle() {
  const zeilen = [["x + 2", ["−", "0", "+", "+", "+"]], ["x − 3", ["−", "−", "−", "0", "+"]], ["(x + 2)(x − 3)", ["+", "0", "−", "0", "+"]]];
  const kopf = ["x < −2", "−2", "−2 < x < 3", "3", "x > 3"];
  return (
    <div style={{ ...karte, marginTop: 10, padding: 0, overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 320, fontSize: 13.5, color: C.tinte }}>
        <thead><tr style={{ background: C.sand }}><th style={{ padding: 8 }} />{kopf.map((k) => <th key={k} style={{ padding: "8px 6px", fontSize: 12, color: C.grau, whiteSpace: "nowrap" }}>{k}</th>)}</tr></thead>
        <tbody>
          {zeilen.map(([t, w], i) => (
            <tr key={t} style={{ borderTop: `1px solid ${C.linie}`, fontWeight: i === 2 ? 800 : 500 }}>
              <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>{t}</td>
              {w.map((v, j) => <td key={j} style={{ padding: 8, textAlign: "center", color: v === "+" ? GRUEN : v === "−" ? C.signal : C.grau, fontSize: 16 }}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KapitelQuadratisch({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Wo liegt die Parabel über der x-Achse?", "Where does the parabola lie above the x-axis?")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("Ein Ball wird hochgeworfen. Seine Höhe beschreibt eine Parabel. Wann ist er höher als 2 Meter? Nicht zu einem Zeitpunkt, sondern in einem ganzen Zeitraum: zwischen dem Moment, in dem er die 2 m nach oben passiert, und dem, in dem er wieder herunterkommt.", "A ball is thrown up. Its height follows a parabola. When is it higher than 2 metres? Not at one moment but during a whole period: between passing 2 m on the way up and coming back down.")}</Absatz>
          <Absatz>{zw("Bei quadratischen Ungleichungen hilft fast immer ein Bild: Wo schneidet die Parabel die x-Achse, und ist sie nach oben oder unten geöffnet? Dann siehst du sofort, wo sie oberhalb (> 0) und wo unterhalb (< 0) liegt.", "With quadratic inequalities a picture almost always helps: where does the parabola cross the x-axis, and does it open up or down? Then you see at once where it lies above (> 0) and below (< 0).")}</Absatz>
        </>}
        standard={<>
          <Absatz>{zw("Das Verfahren in vier Schritten:", "The method in four steps:")}</Absatz>
          <ol style={{ margin: "0 0 12px", paddingLeft: 22, fontSize: 15, color: C.grau, lineHeight: 1.8 }}>
            <li>{zw("Alles auf eine Seite bringen: … > 0 oder … < 0.", "Bring everything to one side: … > 0 or … < 0.")}</li>
            <li>{zw("Nullstellen bestimmen (pq- bzw. abc-Formel oder ablesen).", "Find the roots (quadratic formula or read off).")}</li>
            <li>{zw("Öffnung am Vorzeichen von a erkennen.", "Read the opening from the sign of a.")}</li>
            <li>{zw("Bereich ablesen: nach oben geöffnet ist > 0 außen, < 0 innen.", "Read off the region: opening up, > 0 is outside, < 0 is inside.")}</li>
          </ol>
          <Absatz>{zw("Beispiel: $x^2 − x − 6 > 0$. Nullstellen $x_1 = −2$ und $x_2 = 3$. Die Parabel ist nach oben geöffnet, also gilt die Ungleichung außen: $L = ]−\\infty; −2[ \\cup ]3; \\infty[$.", "Example: $x^2 − x − 6 > 0$. Roots $x_1 = −2$ and $x_2 = 3$. The parabola opens upwards, so the inequality holds outside: $L = ]−\\infty; −2[ \\cup ]3; \\infty[$.")}</Absatz>
        </>}
        vertiefung={<>
          <Absatz>{zw("Ohne Bild geht es mit einer Vorzeichentabelle. Zerlege in Linearfaktoren: $x^2 − x − 6 = (x + 2)(x − 3)$. Jeder Faktor wechselt an seiner Nullstelle das Vorzeichen; das Produkt ist positiv, wenn eine gerade Anzahl Faktoren negativ ist.", "Without a picture, use a sign table. Factor into linear factors: $x^2 − x − 6 = (x + 2)(x − 3)$. Each factor changes sign at its root; the product is positive when an even number of factors is negative.")}</Absatz>
          <Vorzeichentabelle />
          <Absatz>{zw("Das funktioniert genauso für mehr Faktoren, etwa $(x − 1)(x + 2)(x − 4) > 0$. Und eine Warnung: Bei $x^2 > 3x$ nie durch x teilen – du verlierst Lösungen. Richtig: $x^2 − 3x > 0$ ⇔ $x(x − 3) > 0$ ⇔ $x < 0 \\lor x > 3$.", "This works the same for more factors, e.g. $(x − 1)(x + 2)(x − 4) > 0$. And a warning: with $x^2 > 3x$ never divide by x – you lose solutions. Correct: $x^2 − 3x > 0$ ⇔ $x(x − 3) > 0$ ⇔ $x < 0 \\lor x > 3$.")}</Absatz>
        </>}
      />
      <QuadLabor />
      <Merke farbe={C.see}><MS s={zw("Nullstellen + Öffnung genügen. Für $a > 0$: $> 0$ außerhalb, $< 0$ zwischen den Nullstellen. Für $a < 0$ umgekehrt. Ohne Nullstelle gilt die Ungleichung für alle x oder für keins.", "Roots + opening are enough. For $a > 0$: $> 0$ outside, $< 0$ between the roots. For $a < 0$ the other way round. Without roots the inequality holds for all x or none.")} /></Merke>
      <Trenner />
      <UebenKopf>{zw("Quadratische Ungleichungen lösen", "Solve quadratic inequalities")}</UebenKopf>
      {ueben(KAPITEL_ARTEN.qu)}
    </>
  );
}

/* ============================================================
   KAPITEL 5 · ALLES GEMISCHT
   ============================================================ */
function KapitelMix({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Alles gemischt – wie in der Klassenarbeit", "Everything mixed – like in a test")}</Leitfrage>
      <Absatz>{zw("Jetzt kommen alle Aufgabentypen durcheinander. Die eigentliche Kunst ist, zu erkennen, welche Sorte vor dir liegt: linear, mit Betrag oder quadratisch.", "Now all exercise types come in random order. The real skill is recognising which kind is in front of you: linear, with absolute value or quadratic.")}</Absatz>
      <div style={{ ...karte, marginTop: 6 }}>
        <p style={kicker}>{zw("Spickzettel", "Cheat sheet")}</p>
        <div style={{ display: "grid", gap: 10, fontSize: 15, color: C.tinte }}>
          <M t="c < 0:\; a < b \Rightarrow a \cdot c > b \cdot c" />
          <M t="|x − m| < r \Leftrightarrow x \in ]m − r; m + r[" />
          <M t="|x − m| > r \Leftrightarrow x \in ]−\infty; m − r[ \cup ]m + r; \infty[" />
          <M t="a(x − x_1)(x − x_2) > 0,\; a > 0:\; x < x_1 \lor x > x_2" />
        </div>
      </div>
      <Aufklapp titel={zw("Häufige Fehler", "Common mistakes")}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>{zw("Zeichen beim Teilen durch eine negative Zahl nicht gedreht.", "Sign not flipped when dividing by a negative number.")}</li>
          <li><MS s={zw("$|x + 2|$ als Abstand zu $+2$ gelesen – es ist der Abstand zu $−2$.", "$|x + 2|$ read as distance to $+2$ – it is the distance to $−2$.")} /></li>
          <li>{zw("Innen und außen verwechselt: „kleiner“ ist innen.", "Inside and outside mixed up: “less” is inside.")}</li>
          <li>{zw("Durch x geteilt statt auszuklammern – dabei gehen Lösungen verloren.", "Divided by x instead of factoring – solutions get lost.")}</li>
        </ul>
      </Aufklapp>
      <Trenner />
      <UebenKopf>{zw("Gemischtes Training", "Mixed training")}</UebenKopf>
      {ueben([...KAPITEL_ARTEN.lin, ...KAPITEL_ARTEN.bet, ...KAPITEL_ARTEN.bu, ...KAPITEL_ARTEN.qu])}
    </>
  );
}

const KAPITEL = [
  ["linear", zw("Lineare Ungleichungen", "Linear inequalities"), KapitelLinear],
  ["betrag", zw("Betrag und Betrags­gleichungen", "Absolute value"), KapitelBetrag],
  ["betragsungl", zw("Betrags­ungleichungen", "Absolute value inequalities"), KapitelBetragsungleichung],
  ["quadratisch", zw("Quadratische Ungleichungen", "Quadratic inequalities"), KapitelQuadratisch],
  ["mix", zw("Alles gemischt", "All mixed"), KapitelMix],
];

export function Ungleichungen() {
  return (
    <LernwegSeite speicher="matheplus-ungleichungen-kapitel" kapitel={KAPITEL}
      titel={zw("Ungleichungen und Beträge", "Inequalities and absolute values")}
      text={zw("Von „höchstens 20 €“ bis zur Parabel über der x-Achse: Lösungsmengen finden, auf der Zahlengeraden sehen und als Intervall schreiben – linear, mit Betrag und quadratisch.",
        "From “at most €20” to the parabola above the x-axis: find solution sets, see them on the number line and write them as intervals – linear, with absolute values and quadratic.")} />
  );
}
