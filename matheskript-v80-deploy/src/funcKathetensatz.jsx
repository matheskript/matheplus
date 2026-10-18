/* ============================================================
   Mittelstufe · Geometrie: Kathetensatz und Höhensatz
   (Satzgruppe des Pythagoras)
   · Entdecken – Hypotenuse c und Lage des Höhenfußpunkts einstellen;
     Kathetenquadrat a² neben Rechteck c · p (Kathetensatz) bzw.
     Höhenquadrat h² neben Rechteck p · q (Höhensatz), flächengleich
   · Üben – Höhe aus p und q, Kathete aus c und p, Abschnitt aus a und c,
     fehlender Abschnitt aus h und p, Höhe über die Fläche
   Mathematik in geoMittel2.js (getestet).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Auswahl, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { Aufklapp, ModusLeiste, Seite, zt } from "./ui3.jsx";
import { KATH_ARTEN, kathAufgabe } from "./geoMittel2.js";
import { EntdeckenZweispaltig, Merke, Regler, UebenRahmen, WertZeile, Zeichenblatt, tolRund } from "./geoUi.jsx";

let zaehler = 0;
const z2 = (v) => zt(v, 2);
const G = "#8A6A00";

/* ---------- Entdecken ---------- */
function Entdecken() {
  const [c, setC] = useState(6);
  const [t, setT] = useState(0.36);
  const [satz, setSatz] = useState("kathete");
  const p = c * t, q = c - p, h = Math.sqrt(p * q);
  const a = Math.sqrt(c * p), b = Math.sqrt(c * q);
  /* A links, B rechts, C oben, Höhenfußpunkt F; q bei A, p bei B */
  const A = [0, 0], B = [c, 0], F = [q, 0], Cp = [q, h];
  /* Quadrat über a nach außen (rechts oben) */
  const da = [Cp[0] - B[0], Cp[1] - B[1]];
  const na = [da[1], -da[0]];   // nach außen (weg von A)
  const qa = [B, Cp, [Cp[0] + na[0], Cp[1] + na[1]], [B[0] + na[0], B[1] + na[1]]];
  const rechteckP = [F, B, [c, -c], [q, -c]];                       // p × c unter der Hypotenuse
  const qh = [F, Cp, [q - h, h], [q - h, 0]];                        // Quadrat über h nach links
  const rechteckPQ = [[q, 0], [c, 0], [c, -q], [q, -q]];             // p × q unter dem Abschnitt p
  const kath = satz === "kathete";
  const pts = kath ? [...qa, ...rechteckP, A] : [...qh, ...rechteckPQ, A, B];
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <EntdeckenZweispaltig
        steuerung={<>
      <p style={kicker}>{zw("Satz wählen", "Choose a theorem")}</p>
      <Auswahl optionen={[["kathete", zw("Kathetensatz", "Leg theorem")], ["hoehe", zw("Höhensatz", "Altitude theorem")]]} wert={satz} setWert={setSatz} label={zw("Satz", "Theorem")} />
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        <Regler name="c" wert={c} setWert={setC} min={4} max={8} schritt={0.5} />
        <Regler name={zw("Fußpunkt", "Foot")} wert={t} setWert={setT} min={0.15} max={0.85} schritt={0.01} farbe={C.gruen} format={(v) => `p = ${zt(c * v, 2)}`} breiteName={66} />
      </div>
      <WertZeile links="a, b, c" rechts={`${z2(a)} | ${z2(b)} | ${z2(c)}`} />
      <WertZeile links="p, q, h" rechts={`${z2(p)} | ${z2(q)} | ${z2(h)}`} />
        </>}
        bild={
      <div style={{ background: C.sand, borderRadius: 14, padding: 6 }}>
        <Zeichenblatt punkte={pts} hoehe={300} rand={14} label={zw("Rechtwinkliges Dreieck mit flächengleichem Quadrat und Rechteck", "Right triangle with a square and a rectangle of equal area")}
          kinder={(zz) => (
            <>
              {kath ? <>{zz.vieleck(qa, `${C.flaggold}55`, C.flaggold, 1.4)}{zz.vieleck(rechteckP, `${C.flaggold}55`, C.flaggold, 1.4)}
                {zz.text([(qa[0][0] + qa[2][0]) / 2, (qa[0][1] + qa[2][1]) / 2], `a² = ${z2(a * a)}`, G, 12)}
                {zz.text([(q + c) / 2, -c / 2], `c · p = ${z2(c * p)}`, G, 12)}</>
                : <>{zz.vieleck(qh, `${C.see}33`, C.see, 1.4)}{zz.vieleck(rechteckPQ, `${C.see}33`, C.see, 1.4)}
                  {zz.text([q - h / 2, h / 2], `h² = ${z2(h * h)}`, C.seeTief, 12)}
                  {zz.text([(q + c) / 2, -q / 2], `p · q = ${z2(p * q)}`, C.seeTief, 12)}</>}
              {zz.vieleck([A, B, Cp], C.weiss, C.tinte, 2.2)}
              {zz.linie(Cp, F, C.gruen, 1.8, "5 4")}
              {zz.rechter(Cp, A, B, C.tinte, 11)}
              {zz.mass(A, F, "q", 1, C.gruen, 11)}{zz.mass(F, B, "p", 1, C.gruen, 11)}
              {zz.punkt(A, "A", -8, 14)}{zz.punkt(B, "B", 8, 14)}{zz.punkt(Cp, "C", 0, -10)}
            </>
          )} />
      </div>
        }
        unten={
      <Merke farbe={kath ? C.flaggold : C.see}>
        {kath
          ? zw("Kathetensatz: Das Quadrat über der Kathete a ist so groß wie das Rechteck aus der Hypotenuse c und dem anliegenden Abschnitt p: a² = c · p (ebenso b² = c · q). Addiert man beide, entsteht a² + b² = c · (p + q) = c² – Pythagoras.",
            "Leg theorem: the square on leg a has the same area as the rectangle from hypotenuse c and the adjacent segment p: a² = c · p (likewise b² = c · q). Adding both gives a² + b² = c · (p + q) = c² – Pythagoras.")
          : zw("Höhensatz: Das Quadrat über der Höhe h ist so groß wie das Rechteck aus den beiden Hypotenusenabschnitten: h² = p · q.",
            "Altitude theorem: the square on the altitude h has the same area as the rectangle from the two hypotenuse segments: h² = p · q.")}
      </Merke>
        }
      />
    </div>
  );
}

/* ---------- Üben ---------- */
const TITEL = { hoehe: ["Höhe aus p und q", "Altitude from p and q"], kathete: ["Kathete aus c und p", "Leg from c and p"], abschnitt: ["Abschnitt aus a und c", "Segment from a and c"], rueck: ["Abschnitt aus h und p", "Segment from h and p"], flaeche: ["Höhe über die Fläche", "Altitude via the area"] };
const neue = (art) => ({ id: ++zaehler, ...kathAufgabe(art) });

const FORMELN = (richtig) => ({
  id: "ka-formel", titel: zw("Passender Satz", "Matching theorem"), typ: "wahl", frage: zw("Welche Gleichung hilft hier?", "Which equation helps here?"),
  optionen: [["h", <M key="h" t="h² = p · q" />], ["a", <M key="a" t="a² = c · p" />], ["b", <M key="b" t="a² + b² = c²" />]], richtig,
  fehler: [
    ...(richtig !== "h" ? [{ wahl: "h", text: zw("Der Höhensatz verbindet h mit den beiden Abschnitten – hier kommt eine Kathete vor.", "The altitude theorem links h with both segments – here a leg is involved.") }] : []),
    ...(richtig !== "a" ? [{ wahl: "a", text: zw("Der Kathetensatz braucht eine Kathete. Hier geht es um die Höhe.", "The leg theorem needs a leg. Here it's about the altitude.") }] : []),
    { wahl: "b", text: zw("Pythagoras geht auch, braucht aber hier einen Umweg. Es gibt eine direkte Gleichung.", "Pythagoras works too but takes a detour here. There is a direct equation.") }],
  hinweise: [zw("Welche Größen sind gegeben, welche gesucht? Wähle den Satz, der genau diese verbindet.", "Which quantities are given and which wanted? Pick the theorem that links exactly these.")],
  erklaerung: richtig === "h" ? zw("Höhensatz: h² = p · q", "Altitude theorem: h² = p · q") : zw("Kathetensatz: a² = c · p", "Leg theorem: a² = c · p"),
});

function schritte(au) {
  if (au.art === "hoehe") {
    return [FORMELN("h"),
      { id: "ka-h", titel: zw("Höhe", "Altitude"), typ: "zahl", text: "h =", einheit: "cm", wert: au.h, toleranz: 1e-9, wertText: String(au.h),
        frage: zw("Berechne h.", "Calculate h."),
        fehler: [{ wert: au.p * au.q, text: zw("Das ist h². Zieh die Wurzel.", "That's h². Take the root.") }, { wert: (au.p + au.q) / 2, text: zw("Das ist der Mittelwert – gesucht ist die Wurzel aus dem Produkt.", "That's the average – you need the root of the product.") }],
        hinweise: [`h = √(${au.p} · ${au.q})`], erklaerung: `h = √(${au.p} · ${au.q}) = √${au.p * au.q} = ${au.h} cm` }];
  }
  if (au.art === "rueck") {
    return [FORMELN("h"),
      { id: "ka-r", titel: zw("Zweiter Abschnitt", "Second segment"), typ: "zahl", text: "q =", einheit: "cm", wert: au.q, toleranz: 1e-9, wertText: String(au.q),
        frage: zw("Stelle h² = p · q nach q um.", "Rearrange h² = p · q for q."),
        fehler: [{ wert: au.h / au.p, toleranz: 1e-9, text: zw("h muss quadriert werden: q = h² : p.", "h must be squared: q = h² : p.") }],
        hinweise: [`q = ${au.h}² : ${au.p}`], erklaerung: `q = ${au.h}² : ${au.p} = ${au.h * au.h} : ${au.p} = ${au.q} cm` }];
  }
  if (au.art === "kathete") {
    const a2 = au.c * au.p;
    return [FORMELN("a"),
      { id: "ka-a2", titel: zw("Quadrat", "Square"), typ: "zahl", text: "a² =", wert: a2, toleranz: tolRund(a2), wertText: z2(a2),
        frage: zw("Berechne a² = c · p.", "Calculate a² = c · p."), hinweise: [`${au.c} · ${z2(au.p)}`], erklaerung: `a² = ${au.c} · ${z2(au.p)} = ${z2(a2)}` },
      { id: "ka-a", titel: zw("Kathete", "Leg"), typ: "zahl", text: "a =", einheit: "cm", wert: au.a, toleranz: 0.011, wertText: z2(au.a),
        frage: zw("Berechne a.", "Calculate a."), fehler: [{ wert: a2, toleranz: tolRund(a2), text: zw("Noch die Wurzel ziehen.", "Still take the root.") }],
        hinweise: [`√${z2(a2)}`], erklaerung: `a = √${z2(a2)} = ${z2(au.a)} cm` }];
  }
  if (au.art === "abschnitt") {
    return [FORMELN("a"),
      { id: "ka-p", titel: zw("Abschnitt", "Segment"), typ: "zahl", text: "p =", einheit: "cm", wert: au.p, toleranz: 0.011, wertText: z2(au.p),
        frage: zw("Stelle a² = c · p nach p um.", "Rearrange a² = c · p for p."),
        fehler: [{ wert: au.a / au.c, toleranz: 0.011, text: zw("a muss quadriert werden: p = a² : c.", "a must be squared: p = a² : c.") }, { wert: au.c / (au.a * au.a), toleranz: 0.011, text: zw("Umgekehrt: p = a² : c.", "The other way round: p = a² : c.") }],
        hinweise: [`p = ${au.a}² : ${au.c}`], erklaerung: `p = ${au.a}² : ${au.c} = ${au.a * au.a} : ${au.c} = ${z2(au.p)} cm` }];
  }
  /* flaeche: h = a · b : c */
  return [
    { id: "ka-f-a", titel: zw("Fläche über die Katheten", "Area via the legs"), typ: "zahl", text: "A =", einheit: "cm²", wert: (au.a * au.b) / 2, toleranz: 1e-9, wertText: z2((au.a * au.b) / 2),
      frage: zw("Die Katheten stehen senkrecht aufeinander. Berechne die Fläche.", "The legs are perpendicular. Calculate the area."),
      fehler: [{ wert: au.a * au.b, text: zw("Das ist das Rechteck. Das Dreieck ist halb so groß.", "That's the rectangle. The triangle is half of it.") }],
      hinweise: [`${au.a} · ${au.b} : 2`], erklaerung: `A = ${au.a} · ${au.b} : 2 = ${z2((au.a * au.b) / 2)} cm²` },
    { id: "ka-f-h", titel: zw("Höhe auf c", "Altitude on c"), typ: "zahl", text: "h =", einheit: "cm", wert: au.h, toleranz: 0.011, wertText: z2(au.h),
      frage: zw(`Dieselbe Fläche ist auch c · h : 2 mit c = ${au.c} cm. Berechne h.`, `The same area is also c · h : 2 with c = ${au.c} cm. Calculate h.`),
      fehler: [{ wert: (au.a * au.b) / 2 / au.c, toleranz: 0.011, text: zw("Das „: 2“ steht auf beiden Seiten – h = a · b : c.", "The “: 2” is on both sides – h = a · b : c.") }],
      hinweise: [`h = ${au.a} · ${au.b} : ${au.c}`], erklaerung: `h = ${au.a} · ${au.b} : ${au.c} = ${z2(au.h)} cm` },
  ];
}

function text(au) {
  if (au.art === "hoehe") return zw(`Rechtwinkliges Dreieck: Die Höhe h teilt die Hypotenuse in p = ${au.p} cm und q = ${au.q} cm.`, `Right triangle: the altitude h splits the hypotenuse into p = ${au.p} cm and q = ${au.q} cm.`);
  if (au.art === "rueck") return zw(`Rechtwinkliges Dreieck: h = ${au.h} cm, p = ${au.p} cm. Wie lang ist q?`, `Right triangle: h = ${au.h} cm, p = ${au.p} cm. How long is q?`);
  if (au.art === "kathete") return zw(`Rechtwinkliges Dreieck: c = ${au.c} cm, p = ${z2(au.p)} cm. Wie lang ist die Kathete a?`, `Right triangle: c = ${au.c} cm, p = ${z2(au.p)} cm. How long is leg a?`);
  if (au.art === "abschnitt") return zw(`Rechtwinkliges Dreieck: a = ${au.a} cm, c = ${au.c} cm. Wie lang ist der Abschnitt p unter a?`, `Right triangle: a = ${au.a} cm, c = ${au.c} cm. How long is segment p below a?`);
  return zw(`Rechtwinkliges Dreieck mit den Katheten a = ${au.a} cm und b = ${au.b} cm. Wie lang ist die Höhe auf die Hypotenuse?`, `Right triangle with legs a = ${au.a} cm and b = ${au.b} cm. How long is the altitude onto the hypotenuse?`);
}

function skizze(au) {
  const c = 6, p = c * (au.p && au.c ? au.p / au.c : au.p / (au.p + au.q)), q = c - p, h = Math.sqrt(p * q);
  const A = [0, 0], B = [c, 0], F = [q, 0], Cp = [q, h];
  const w = {
    hoehe: { p: `p = ${au.p}`, q: `q = ${au.q}`, h: "?" }, rueck: { p: `p = ${au.p}`, q: "?", h: `h = ${au.h}` },
    kathete: { p: `p = ${z2(au.p)}`, a: "?", c: `c = ${au.c}` }, abschnitt: { p: "?", a: `a = ${au.a}`, c: `c = ${au.c}` }, flaeche: { a: `a = ${au.a}`, b: `b = ${au.b}`, h: "?" },
  }[au.art];
  return (
    <Zeichenblatt punkte={[[-0.4, -1], [6.4, h + 0.4]]} hoehe={180} rand={22} label={zw("Rechtwinkliges Dreieck mit Höhe", "Right triangle with altitude")}
      kinder={(zz) => (
        <>
          {zz.vieleck([A, B, Cp], `${C.see}10`, C.tinte, 2)}
          {zz.linie(Cp, F, C.gruen, 1.8, "5 4")}
          {zz.rechter(Cp, A, B, C.tinte, 10)}{zz.rechter(F, B, Cp, C.gruen, 8)}
          {w.c ? zz.mass(A, B, w.c, 1, C.tinte, 26) : null}
          {zz.mass(A, F, w.q ?? null, 1, C.gruen, 12)}{zz.mass(F, B, w.p ?? null, 1, C.gruen, 12)}
          {zz.mass(F, Cp, w.h ?? null, -1, C.gruen, 26)}
          {zz.mass(B, Cp, w.a ?? null, 1, G, 14)}{zz.mass(A, Cp, w.b ?? null, -1, G, 14)}
          {zz.punkt(A, "A", -8, 14)}{zz.punkt(B, "B", 8, 14)}{zz.punkt(Cp, "C", 0, -10)}
        </>
      )} />
  );
}

const hilfe = (au) => hilfeKontext({
  id: `kathetensatz-${au.art}`, aufgabe: "Kathetensatz Höhensatz Satzgruppe des Pythagoras Hypotenusenabschnitt Höhe rechtwinklig",
  verstehen: [zw("Die Höhe h auf die Hypotenuse teilt c in q (bei A) und p (bei B).", "The altitude h onto the hypotenuse splits c into q (at A) and p (at B).")],
  ansatz: [zw("Höhe und Abschnitte → Höhensatz. Kathete, Hypotenuse und ein Abschnitt → Kathetensatz.", "Altitude and segments → altitude theorem. Leg, hypotenuse and a segment → leg theorem.")],
  regel: ["h² = p · q", "a² = c · p, b² = c · q"],
  pruefen: [zw("p + q = c? Die Höhe ist kürzer als beide Katheten.", "p + q = c? The altitude is shorter than both legs.")],
});

const MODI = [["entdecken", zw("Entdecken", "Explore")], ["ueben", zw("Üben", "Practise")]];

export function Kathetensatz() {
  const [modus, setModus] = useState("entdecken");
  return (
    <Seite titel={zw("Kathetensatz und Höhensatz", "Leg and altitude theorems")}
      text={zw("Die Höhe teilt jedes rechtwinklige Dreieck in zwei ähnliche Dreiecke. Daraus folgen zwei Flächensätze – und mit ihnen auch der Satz des Pythagoras.",
        "The altitude splits every right triangle into two similar triangles. Two area theorems follow from that – and with them Pythagoras' theorem too.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Kathetensatz und Höhensatz", "Leg and altitude theorems")} />
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
        <p style={{ margin: "0 0 6px" }}>{zw("Im rechtwinkligen Dreieck mit γ = 90° teilt die Höhe h die Hypotenuse c in die Abschnitte q (bei A) und p (bei B).", "In a right triangle with γ = 90°, the altitude h splits the hypotenuse c into segments q (at A) and p (at B).")}</p>
        <p style={{ margin: "0 0 4px" }}><b>{zw("Kathetensatz:", "Leg theorem:")}</b> <M t="a² = c · p" />, <M t="b² = c · q" /></p>
        <p style={{ margin: 0 }}><b>{zw("Höhensatz:", "Altitude theorem:")}</b> <M t="h² = p · q" /></p>
      </Aufklapp>
      <div style={{ display: modus === "entdecken" ? "block" : "none" }}><Entdecken /></div>
      <div style={{ display: modus === "ueben" ? "block" : "none" }}>
        <UebenRahmen titel={TITEL} arten={KATH_ARTEN} neue={neue} schritte={schritte} text={text} skizze={skizze} hilfe={hilfe} />
      </div>
    </Seite>
  );
}
