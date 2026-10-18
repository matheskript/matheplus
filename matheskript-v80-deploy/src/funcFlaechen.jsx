/* ============================================================
   Unterstufe/Mittelstufe · Umfang und Flächeninhalt
   · Entdecken – Rechteck, Dreieck, Parallelogramm, Trapez, Drachen mit
     Reglern; jede Formel wird aus dem Rechteck hergeleitet (Zerlegen,
     Umlegen, Verdoppeln)
   · Üben – Umfang und Fläche des Rechtecks, Seite rückwärts, Dreieck,
     Parallelogramm (Falle: schräge Seite), Trapez, Drachen, L-Form
   Mathematik in unterGen.js (getestet).
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Auswahl, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { zt } from "./ui3.jsx";
import { FLAECHE_ARTEN, flaecheAufgabe } from "./unterGen.js";
import { Merke, Regler, UebenRahmen, WertZeile, Zeichenblatt, ZweiModi, ws, zs, EntdeckenZweispaltig } from "./geoUi.jsx";

let zaehler = 0;
const z = (v) => zt(v, 2);
const G = "#8A6A00";

export function Figur({ art, m, beschr = {}, hoehe = 200, idee = false }) {
  let pts, extra = () => null;
  if (art === "rechteck") { pts = [[0, 0], [m.a, 0], [m.a, m.b], [0, m.b]]; }
  else if (art === "dreieck") {
    const t = m.g * 0.35; pts = [[0, 0], [m.g, 0], [t, m.h]];
    extra = (zz) => <>{zz.linie([t, 0], [t, m.h], C.gruen, 1.6, "5 4")}{zz.rechter([t, 0], [m.g, 0], [t, m.h], C.gruen, 8)}{idee && zz.vieleck([[0, 0], [m.g, 0], [m.g, m.h], [0, m.h]], "none", C.hellgrau, 1.2)}</>;
  } else if (art === "parallelogramm") {
    const v = m.v ?? Math.min(m.g * 0.4, 3); pts = [[0, 0], [m.g, 0], [m.g + v, m.h], [v, m.h]];
    extra = (zz) => <>{zz.linie([v, 0], [v, m.h], C.gruen, 1.6, "5 4")}{zz.rechter([v, 0], [m.g, 0], [v, m.h], C.gruen, 8)}{idee && zz.vieleck([[m.g, 0], [m.g + v, 0], [m.g + v, m.h]], `${C.flaggold}33`, C.flaggold, 1.2)}{idee && zz.vieleck([[0, 0], [v, 0], [v, m.h]], `${C.flaggold}22`, C.flaggold, 1.2, "4 3")}</>;
  } else if (art === "trapez") {
    const v = (m.a - m.c) / 2; pts = [[0, 0], [m.a, 0], [v + m.c, m.h], [v, m.h]];
    extra = (zz) => <>{zz.linie([v, 0], [v, m.h], C.gruen, 1.6, "5 4")}{zz.rechter([v, 0], [m.a, 0], [v, m.h], C.gruen, 8)}{idee && zz.vieleck([[m.a, 0], [m.a + m.c, 0], [m.a + v + m.c, m.h], [v + m.c, m.h]], "none", C.hellgrau, 1.2, "4 3")}</>;
  } else if (art === "drachen") {
    const o = m.e * 0.3; pts = [[0, 0], [m.f / 2, o], [0, m.e], [-m.f / 2, o]];
    extra = (zz) => <>{zz.linie([0, 0], [0, m.e], C.gruen, 1.6, "5 4")}{zz.linie([-m.f / 2, o], [m.f / 2, o], C.gruen, 1.6, "5 4")}{idee && zz.vieleck([[-m.f / 2, 0], [m.f / 2, 0], [m.f / 2, m.e], [-m.f / 2, m.e]], "none", C.hellgrau, 1.2)}</>;
  } else {
    /* L-Form: B × H mit ausgeschnittener Ecke b × h oben rechts */
    pts = [[0, 0], [m.B, 0], [m.B, m.H - m.h], [m.B - m.b, m.H - m.h], [m.B - m.b, m.H], [0, m.H]];
    extra = (zz) => zz.vieleck([[m.B - m.b, m.H - m.h], [m.B, m.H - m.h], [m.B, m.H], [m.B - m.b, m.H]], `${C.hellgrau}33`, C.hellgrau, 1, "4 3");
  }
  const alle = art === "parallelogramm" && idee ? [...pts, [m.g + (m.v ?? 3), 0]] : art === "trapez" && idee ? [...pts, [m.a + m.c, 0], [m.a + (m.a - m.c) / 2 + m.c, m.h]] : art === "zusammen" ? [...pts, [m.B, m.H]] : pts;
  return (
    <Zeichenblatt punkte={alle} hoehe={hoehe} rand={30} label={zw("Figur mit Maßen", "Figure with measurements")}
      kinder={(zz) => (
        <>
          {zz.vieleck(pts, `${C.see}18`, C.tinte, 2)}
          {extra(zz)}
          {art === "rechteck" && <>{zz.mass(pts[0], pts[1], beschr.a, 1)}{zz.mass(pts[1], pts[2], beschr.b, 1)}</>}
          {art === "dreieck" && <>{zz.mass(pts[0], pts[1], beschr.g, 1)}{zz.mass([pts[2][0], 0], pts[2], beschr.h, -1, C.gruen, 16)}</>}
          {art === "parallelogramm" && <>{zz.mass(pts[0], pts[1], beschr.g, 1)}{zz.mass([pts[3][0], 0], pts[3], beschr.h, 1, C.gruen, 16)}{zz.mass(pts[1], pts[2], beschr.s, 1, C.grau, 14)}</>}
          {art === "trapez" && <>{zz.mass(pts[0], pts[1], beschr.a, 1)}{zz.mass(pts[3], pts[2], beschr.c, -1)}{zz.mass([pts[3][0], 0], pts[3], beschr.h, 1, C.gruen, 16)}</>}
          {art === "drachen" && <>{zz.mass([0, 0], [0, m.e], beschr.e, -1, C.gruen, 14)}{zz.mass([-m.f / 2, m.e * 0.3], [m.f / 2, m.e * 0.3], beschr.f, 1, C.gruen, 12)}</>}
          {art === "zusammen" && <>{zz.mass(pts[0], pts[1], beschr.B, 1)}{zz.mass(pts[5], pts[0], beschr.H, 1)}{zz.mass(pts[3], pts[2], beschr.b, 1, C.grau, 12)}{zz.mass(pts[2], pts[1], beschr.h0, 1, C.grau, 12)}</>}
        </>
      )} />
  );
}

const IDEE = {
  rechteck: zw("Ein Rechteck aus a Spalten und b Reihen Einheitsquadraten: A = a · b. Umfang: einmal ringsherum, u = 2a + 2b.", "A rectangle made of a columns and b rows of unit squares: A = a · b. Perimeter: once all the way round, u = 2a + 2b."),
  dreieck: zw("Zwei gleiche Dreiecke ergeben ein Rechteck (bzw. Parallelogramm) mit g und h. Ein Dreieck ist die Hälfte: A = g · h : 2.", "Two equal triangles form a rectangle (or parallelogram) with g and h. One triangle is half: A = g · h : 2."),
  parallelogramm: zw("Schneide links das Dreieck ab und lege es rechts an: Es entsteht ein Rechteck mit g und h. A = g · h – die schräge Seite zählt nicht.", "Cut off the triangle on the left and attach it on the right: a rectangle with g and h appears. A = g · h – the slanted side doesn't count."),
  trapez: zw("Zwei gleiche Trapeze, eins gedreht, ergeben ein Parallelogramm mit Grundseite a + c. Ein Trapez ist die Hälfte: A = (a + c) · h : 2.", "Two equal trapezoids, one turned, form a parallelogram with base a + c. One trapezoid is half: A = (a + c) · h : 2."),
  drachen: zw("Der Drachen passt in ein Rechteck aus den Diagonalen e und f – und füllt genau die Hälfte: A = e · f : 2.", "The kite fits in a rectangle made of the diagonals e and f – and fills exactly half: A = e · f : 2."),
};

function Entdecken() {
  const [art, setArt] = useState("parallelogramm");
  const [x, setX] = useState(6);
  const [h, setH] = useState(4);
  const [c, setC] = useState(3);
  const m = { rechteck: { a: x, b: h }, dreieck: { g: x, h }, parallelogramm: { g: x, h, v: 2 }, trapez: { a: x, c: Math.min(c, x - 0.5), h }, drachen: { e: x, f: h } }[art];
  const A = { rechteck: x * h, dreieck: x * h / 2, parallelogramm: x * h, trapez: (x + Math.min(c, x - 0.5)) * h / 2, drachen: x * h / 2 }[art];
  const F = { rechteck: "A = a · b", dreieck: "A = \\frac{g · h}{2}", parallelogramm: "A = g · h", trapez: "A = \\frac{(a + c) · h}{2}", drachen: "A = \\frac{e · f}{2}" }[art];
  const n = { rechteck: ["a", "b"], dreieck: ["g", "h"], parallelogramm: ["g", "h"], trapez: ["a", "h"], drachen: ["e", "f"] }[art];
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <EntdeckenZweispaltig
        steuerung={<>
      <p style={kicker}>{zw("Figur wählen", "Choose a figure")}</p>
      <Auswahl optionen={[["rechteck", zw("Rechteck", "Rectangle")], ["dreieck", zw("Dreieck", "Triangle")], ["parallelogramm", zw("Parallelogramm", "Parallelogram")], ["trapez", zw("Trapez", "Trapezoid")], ["drachen", zw("Drachen", "Kite")]]} wert={art} setWert={setArt} label={zw("Figur", "Figure")} />
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        <Regler name={n[0]} wert={x} setWert={setX} min={2} max={10} schritt={0.5} />
        <Regler name={n[1]} wert={h} setWert={setH} min={1} max={8} schritt={0.5} farbe={C.gruen} />
        {art === "trapez" && <Regler name="c" wert={c} setWert={setC} min={0.5} max={9} schritt={0.5} farbe={G} />}
      </div>
      <WertZeile links={<M t={F} />} rechts={z(A)} farbe={C.gruen} />
        </>}
        bild={
      <div style={{ background: C.sand, borderRadius: 14, padding: 6 }}>
        <Figur art={art} m={m} idee hoehe={220} beschr={{ a: "a", b: "b", g: "g", h: "h", c: "c", e: "e", f: "f", s: null }} />
      </div>
        }
        unten={<>
      <Merke>{IDEE[art]}</Merke>
        </>}
      />
    </div>
  );
}

const TITEL = { rechteckU: ["Umfang Rechteck", "Rectangle perimeter"], rechteckA: ["Fläche Rechteck", "Rectangle area"], rueck: ["Seite aus Fläche", "Side from area"], dreieck: ["Dreieck", "Triangle"], parallelogramm: ["Parallelogramm", "Parallelogram"], trapez: ["Trapez", "Trapezoid"], drachen: ["Drachen", "Kite"], zusammen: ["Zusammengesetzte Figur", "Composite figure"] };
const neue = (art) => ({ id: ++zaehler, ...flaecheAufgabe(art) });

function schritte(a) {
  switch (a.art) {
    case "rechteckU": return [zs("fl-u", zw("Umfang", "Perimeter"), "u =", a.U, zw("Berechne den Umfang.", "Calculate the perimeter."), { einheit: "cm", fehler: [{ wert: a.A, text: zw("Das ist die Fläche. Umfang heißt: einmal außen herum.", "That's the area. Perimeter means once around the outside.") }, { wert: a.a + a.b, text: zw("Jede Seite kommt zweimal vor.", "Each side appears twice.") }], hinweis: `2 · ${a.a} + 2 · ${a.b}`, erkl: `u = 2 · ${a.a} + 2 · ${a.b} = ${a.U} cm` })];
    case "rechteckA": return [zs("fl-a", zw("Fläche", "Area"), "A =", a.A, zw("Berechne den Flächeninhalt.", "Calculate the area."), { einheit: "cm²", fehler: [{ wert: a.U, text: zw("Das ist der Umfang.", "That's the perimeter.") }], hinweis: `${a.a} · ${a.b}`, erkl: `A = ${a.a} · ${a.b} = ${a.A} cm²` })];
    case "rueck": return [zs("fl-r", zw("Fehlende Seite", "Missing side"), "b =", a.b, zw("Wie lang ist die andere Seite?", "How long is the other side?"), { einheit: "cm", fehler: [{ wert: a.A * a.a, text: zw("Teilen, nicht malnehmen: b = A : a.", "Divide, don't multiply: b = A : a.") }, { wert: a.A - a.a, text: zw("Fläche ist ein Produkt – rückwärts wird geteilt.", "Area is a product – backwards you divide.") }], hinweis: `${a.A} : ${a.a}`, erkl: `b = ${a.A} : ${a.a} = ${a.b} cm` })];
    case "dreieck": return [zs("fl-d", zw("Fläche", "Area"), "A =", a.A, zw("Berechne den Flächeninhalt.", "Calculate the area."), { einheit: "cm²", fehler: [{ wert: a.g * a.h, text: zw("Das ist das ganze Rechteck – das Dreieck ist die Hälfte.", "That's the whole rectangle – the triangle is half.") }], hinweis: `${a.g} · ${a.h} : 2`, erkl: `A = ${a.g} · ${a.h} : 2 = ${z(a.A)} cm²` })];
    case "parallelogramm": return [
      ws("fl-p1", zw("Welche Maße?", "Which measures?"), zw("Welche Längen braucht die Formel?", "Which lengths does the formula need?"), [["gh", zw("Grundseite und Höhe", "base and height")], ["gs", zw("Grundseite und schräge Seite", "base and slanted side")], ["alle", zw("alle Seiten", "all sides")]], "gh", { fehler: [{ wahl: "gs", text: zw("Die schräge Seite ist länger als die Höhe. Beim Umlegen zum Rechteck zählt nur h.", "The slanted side is longer than the height. When rearranging into a rectangle only h counts.") }, { wahl: "alle", text: zw("Alle Seiten zusammen ergeben den Umfang, nicht die Fläche.", "All sides together give the perimeter, not the area.") }], hinweis: zw("Höhe = senkrechter Abstand.", "Height = perpendicular distance."), erkl: "A = g · h" }),
      zs("fl-p2", zw("Fläche", "Area"), "A =", a.A, zw("Berechne den Flächeninhalt.", "Calculate the area."), { einheit: "cm²", fehler: [{ wert: a.g * a.s, text: zw("Mit der schrägen Seite wird die Fläche zu groß.", "With the slanted side the area comes out too large.") }], hinweis: `${a.g} · ${a.h}`, erkl: `A = ${a.g} · ${a.h} = ${a.A} cm²` }),
    ];
    case "trapez": return [
      zs("fl-t1", zw("Mittellinie", "Midline"), "(a + c) : 2 =", (a.a + a.c) / 2, zw("Berechne den Mittelwert der parallelen Seiten.", "Calculate the average of the parallel sides."), { hinweis: `(${a.a} + ${a.c}) : 2`, erkl: z((a.a + a.c) / 2) }),
      zs("fl-t2", zw("Fläche", "Area"), "A =", a.A, zw("Berechne den Flächeninhalt.", "Calculate the area."), { einheit: "cm²", fehler: [{ wert: (a.a + a.c) * a.h, text: zw("Noch durch 2 teilen.", "Still divide by 2.") }, { wert: a.a * a.h, text: zw("Die obere Seite c fehlt.", "The top side c is missing.") }], hinweis: `${z((a.a + a.c) / 2)} · ${a.h}`, erkl: `A = (${a.a} + ${a.c}) · ${a.h} : 2 = ${z(a.A)} cm²` }),
    ];
    case "drachen": return [zs("fl-dr", zw("Fläche", "Area"), "A =", a.A, zw("Berechne den Flächeninhalt aus den Diagonalen.", "Calculate the area from the diagonals."), { einheit: "cm²", fehler: [{ wert: a.e * a.f, text: zw("Das ist das umgebende Rechteck – der Drachen füllt die Hälfte.", "That's the surrounding rectangle – the kite fills half of it.") }], hinweis: `${a.e} · ${a.f} : 2`, erkl: `A = ${a.e} · ${a.f} : 2 = ${z(a.A)} cm²` })];
    default: return [
      zs("fl-z1", zw("Großes Rechteck", "Large rectangle"), "A₁ =", a.B * a.H, zw("Berechne zuerst das ganze Rechteck (ohne Ausschnitt).", "First calculate the whole rectangle (without the cut-out)."), { einheit: "cm²", hinweis: `${a.B} · ${a.H}`, erkl: `${a.B} · ${a.H} = ${a.B * a.H} cm²` }),
      zs("fl-z2", zw("Ausschnitt abziehen", "Subtract the cut-out"), "A =", a.A, zw("Ziehe die ausgeschnittene Ecke ab.", "Subtract the cut-out corner."), { einheit: "cm²", fehler: [{ wert: a.B * a.H + a.b * a.h, text: zw("Die Ecke fehlt – abziehen, nicht addieren.", "The corner is missing – subtract, don't add.") }], hinweis: `${a.B * a.H} − ${a.b} · ${a.h}`, erkl: `A = ${a.B * a.H} − ${a.b * a.h} = ${a.A} cm²` }),
      zs("fl-z3", zw("Umfang", "Perimeter"), "u =", a.U, zw("Wie lang ist der Umfang der L-Form?", "How long is the perimeter of the L-shape?"), { einheit: "cm", fehler: [{ wert: a.U - 2 * a.b, text: zw("Verschiebe die Kanten der Ecke nach außen: Der Umfang ist so groß wie beim ganzen Rechteck.", "Push the corner's edges outwards: the perimeter equals that of the whole rectangle.") }], hinweis: zw("Die Stufen-Kanten ergänzen sich genau zu den fehlenden Rechteckseiten.", "The step edges add up exactly to the missing rectangle sides."), erkl: zw(`u = 2 · ${a.B} + 2 · ${a.H} = ${a.U} cm (wie beim ganzen Rechteck)`, `u = 2 · ${a.B} + 2 · ${a.H} = ${a.U} cm (same as the whole rectangle)`) }),
    ];
  }
}

function text(a) {
  const R = zw("Ein Rechteck", "A rectangle");
  switch (a.art) {
    case "rechteckU": case "rechteckA": return zw(`${R} ist ${a.a} cm lang und ${a.b} cm breit.`, `${R} is ${a.a} cm long and ${a.b} cm wide.`);
    case "rueck": return zw(`${R} hat die Fläche ${a.A} cm² und die Seite a = ${a.a} cm.`, `${R} has area ${a.A} cm² and side a = ${a.a} cm.`);
    case "dreieck": return zw(`Ein Dreieck hat die Grundseite g = ${a.g} cm und die Höhe h = ${a.h} cm.`, `A triangle has base g = ${a.g} cm and height h = ${a.h} cm.`);
    case "parallelogramm": return zw(`Ein Parallelogramm: g = ${a.g} cm, Höhe h = ${a.h} cm, schräge Seite s = ${a.s} cm.`, `A parallelogram: g = ${a.g} cm, height h = ${a.h} cm, slanted side s = ${a.s} cm.`);
    case "trapez": return zw(`Ein Trapez hat die parallelen Seiten a = ${a.a} cm und c = ${a.c} cm und die Höhe h = ${a.h} cm.`, `A trapezoid has parallel sides a = ${a.a} cm and c = ${a.c} cm and height h = ${a.h} cm.`);
    case "drachen": return zw(`Ein Drachenviereck hat die Diagonalen e = ${a.e} cm und f = ${a.f} cm.`, `A kite has diagonals e = ${a.e} cm and f = ${a.f} cm.`);
    default: return zw(`Aus einem Rechteck (${a.B} cm × ${a.H} cm) wurde oben rechts eine Ecke (${a.b} cm × ${a.h} cm) ausgeschnitten.`, `A corner (${a.b} cm × ${a.h} cm) was cut from the top right of a rectangle (${a.B} cm × ${a.H} cm).`);
  }
}

function skizze(a) {
  switch (a.art) {
    case "rechteckU": case "rechteckA": return <Figur art="rechteck" m={a} beschr={{ a: `${a.a}`, b: `${a.b}` }} hoehe={170} />;
    case "rueck": return <Figur art="rechteck" m={a} beschr={{ a: `${a.a}`, b: "?" }} hoehe={170} />;
    case "dreieck": return <Figur art="dreieck" m={a} beschr={{ g: `${a.g}`, h: `${a.h}` }} hoehe={170} />;
    case "parallelogramm": return <Figur art="parallelogramm" m={{ ...a, v: Math.sqrt(a.s * a.s - a.h * a.h) }} beschr={{ g: `${a.g}`, h: `${a.h}`, s: `${a.s}` }} hoehe={170} />;
    case "trapez": return <Figur art="trapez" m={a} beschr={{ a: `${a.a}`, c: `${a.c}`, h: `${a.h}` }} hoehe={170} />;
    case "drachen": return <Figur art="drachen" m={a} beschr={{ e: `${a.e}`, f: `${a.f}` }} hoehe={190} />;
    default: return <Figur art="zusammen" m={a} beschr={{ B: `${a.B}`, H: `${a.H}`, b: `${a.b}`, h0: `${a.h}` }} hoehe={190} />;
  }
}

const hilfe = (a) => hilfeKontext({
  id: `flaeche-${a.art}`, aufgabe: "Flächeninhalt Umfang Rechteck Dreieck Parallelogramm Trapez Drachen zusammengesetzte Figur",
  verstehen: [zw("Fläche = was innen liegt (cm²). Umfang = Weg außen herum (cm).", "Area = what's inside (cm²). Perimeter = the way around the outside (cm).")],
  ansatz: [zw("Jede Formel kommt vom Rechteck: zerlegen, umlegen oder verdoppeln.", "Every formula comes from the rectangle: split, rearrange or double.")],
  regel: ["A = a · b, A = g · h : 2, A = g · h, A = (a + c) · h : 2, A = e · f : 2"],
  pruefen: [zw("Einheit: Flächen in cm², Längen in cm.", "Units: areas in cm², lengths in cm.")],
});

export function UmfangFlaeche() {
  return (
    <ZweiModi titel={zw("Umfang und Flächeninhalt", "Perimeter and area")}
      text={zw("Rechteck, Dreieck, Parallelogramm, Trapez und Drachen – jede Formel siehst du aus dem Rechteck entstehen. Dazu zusammengesetzte Figuren.", "Rectangle, triangle, parallelogram, trapezoid and kite – you see every formula emerge from the rectangle. Plus composite figures.")}
      kurz={<p style={{ margin: 0 }}>{zw("Rechteck A = a · b, u = 2a + 2b · Dreieck A = g · h : 2 · Parallelogramm A = g · h · Trapez A = (a + c) · h : 2 · Drachen A = e · f : 2. Die Höhe steht immer senkrecht auf der Grundseite.", "Rectangle A = a · b, u = 2a + 2b · triangle A = g · h : 2 · parallelogram A = g · h · trapezoid A = (a + c) · h : 2 · kite A = e · f : 2. The height is always perpendicular to the base.")}</p>}
      entdecken={<Entdecken />}
      ueben={<UebenRahmen titel={TITEL} arten={FLAECHE_ARTEN} neue={neue} schritte={schritte} text={text} skizze={skizze} hilfe={hilfe} />} />
  );
}
