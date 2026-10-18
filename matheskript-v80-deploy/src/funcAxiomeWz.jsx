/* ============================================================
   Axiome und Rechenregeln  (Bereich „Fundament“, Station 1)
   Der Schlüsselbereich: neun Spielregeln für zwei Rechenarten –
   daraus folgt jede Rechnung der Schulmathematik.
   · Entdecken – Warum das Fundament? · Gesetz-Probe (alle neun Axiome,
     Zahlenbeispiel mit Probe) · Nur zwei Rechenarten · Rechenwege, in
     denen jeder Schritt ein Axiom ist (Gleichungen, geschickt rechnen,
     binomische Formel, −(−a) = a) · Lernmodul (zehn Phasen, Mathe
     entdecken) · Weiter zum Aufbaukurs Zahlenräume
   · Üben – Gesetz erkennen (Zahlen / Terme), Schritt begründen, Inverse,
     Minus und Geteilt umschreiben, verkleidete 0 und 1, geschickt
     rechnen mit dem Distributivgesetz, ausklammern
   Mathematik in axiomeGen.js (getestet: tests/axiomeGen.test.mjs).
   ============================================================ */
import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Auswahl, GrosserKnopf, MS, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { Merke, UebenRahmen, ZweiModi, misch, ws, zs } from "./geoUi.jsx";
import { AX_ARTEN, KETTEN, KZ, KZ_FORMEL, KZ_NAME, axAufgabe, axBeispiel } from "./axiomeGen.js";
import { AXIOM_PHASEN_ANZAHL, entdeckenHoeren, entdeckenStand, statusAxiome } from "./entdeckenSpeicher.js";
import { qNum, qTex } from "./rechnen2.js";

/* Farbcode wie im Lernmodul: Addition blau, Multiplikation Grana, Distributivgesetz Gold */
const FAMILIE = { A: { f: C.see, bg: "#D6E4F7", t: C.seeTief }, M: { f: C.gruen, bg: "#F7D3E0", t: "#6E0F30" }, D: { f: C.flaggold, bg: "#FFF1BF", t: "#6B5200" } };
const fam = (kz) => FAMILIE[kz[0]];
const kzName = (kz) => zw(KZ_NAME[kz][0], KZ_NAME[kz][1]);

function Chip({ kz, klein }) {
  const F = fam(kz);
  return <span style={{ display: "inline-block", fontSize: klein ? 11 : 12, fontWeight: 800, padding: klein ? "1px 7px" : "2px 9px", borderRadius: 999, background: F.bg, color: F.t, border: `1.5px solid ${F.f}`, whiteSpace: "nowrap" }}>{kz}</span>;
}

/* ---------- Gesetz-Probe ---------- */
function GesetzProbe() {
  const [kz, setKz] = useState("D");
  const [b, setB] = useState(() => axBeispiel("D"));
  const waehle = (k) => { setKz(k); setB(axBeispiel(k)); };
  const F = fam(kz);
  const gruppen = [["A", zw("Addition", "Addition"), ["A1", "A2", "A3", "A4"]], ["M", zw("Multiplikation", "Multiplication"), ["M1", "M2", "M3", "M4"]], ["D", zw("Brücke", "Bridge"), ["D"]]];
  const zahl = (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 1e6) / 1e6).replace(".", ",")).replace("-", "−");
  return (
    <div style={{ ...karte, marginTop: 16 }} data-gesetzprobe>
      <p style={kicker}>{zw("Die neun Axiome – tippe eins an", "The nine axioms – tap one")}</p>
      <div style={{ display: "grid", gap: 10 }}>
        {gruppen.map(([g, titel, liste]) => (
          <div key={g} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: FAMILIE[g].t, minWidth: 104 }}>{titel}</span>
            {liste.map((k) => {
              const an = k === kz, Fk = fam(k);
              return (
                <button key={k} type="button" aria-pressed={an} onClick={() => waehle(k)} title={kzName(k)}
                  style={{ minWidth: 46, height: 38, borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 800, cursor: "pointer",
                    border: `1.5px solid ${Fk.f}`, background: an ? Fk.f : Fk.bg, color: an ? (g === "D" ? C.tinte : C.weiss) : Fk.t }}>{k}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, borderRadius: 14, padding: "14px 14px 12px", background: F.bg, borderLeft: `4px solid ${F.f}` }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: F.t }}>{kz} · {kzName(kz)}</p>
        <div style={{ fontSize: 21, color: C.tinte, margin: "6px 0 2px", overflowX: "auto" }}><M t={KZ_FORMEL[kz]} /></div>
        <p style={{ margin: "0 0 8px", fontSize: 13.5, lineHeight: 1.6, color: C.tinte }}>{ERKLAERT[kz]()}</p>
        <div style={{ background: C.weiss, borderRadius: 10, padding: "8px 10px" }}>
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: C.grau, textTransform: "uppercase", letterSpacing: "0.08em" }}>{zw("Probe mit Zahlen", "Check with numbers")}</p>
          <div style={{ fontSize: 17, color: C.tinte, overflowX: "auto", margin: "4px 0" }}><M t={b.tex} /></div>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#0F7A4D" }}>{zw("links", "left")} = {zahl(b.l)} · {zw("rechts", "right")} = {zahl(b.r)} ✓</p>
        </div>
      </div>
      <GrosserKnopf ghost onClick={() => setB(axBeispiel(kz))}>{zw("Andere Zahlen", "Other numbers")}</GrosserKnopf>
    </div>
  );
}
const ERKLAERT = {
  A1: () => zw("Bei der Addition dürfen Klammern wandern. Darum darf man a + b + c ohne Klammern schreiben.", "In addition, brackets may move. That is why we may write a + b + c without brackets."),
  A2: () => zw("Die Reihenfolge der Summanden ist egal – du darfst tauschen.", "The order of the summands doesn't matter – you may swap."),
  A3: () => zw("Die 0 verändert bei der Addition nichts. Sie ist das neutrale Element.", "0 changes nothing in addition. It is the identity element."),
  A4: () => zw("Zu jeder Zahl a gibt es die Gegenzahl −a. Zusammen ergeben sie das neutrale Element 0.", "Every number a has an opposite −a. Together they give the identity 0."),
  M1: () => zw("Auch bei der Multiplikation dürfen Klammern wandern.", "Brackets may move in multiplication as well."),
  M2: () => zw("Die Reihenfolge der Faktoren ist egal.", "The order of the factors doesn't matter."),
  M3: () => zw("Die 1 verändert bei der Multiplikation nichts. Sie ist das neutrale Element.", "1 changes nothing in multiplication. It is the identity element."),
  M4: () => zw("Zu jeder Zahl a ≠ 0 gibt es den Kehrwert 1/a. Zusammen ergeben sie das neutrale Element 1. Für 0 gibt es keinen Kehrwert.", "Every number a ≠ 0 has a reciprocal 1/a. Together they give the identity 1. 0 has no reciprocal."),
  D: () => zw("Die einzige Regel, in der + und · zusammen vorkommen. Ausmultiplizieren (von links nach rechts) und Ausklammern (von rechts nach links) sind dieselbe Regel.", "The only rule in which + and · appear together. Multiplying out (left to right) and factoring (right to left) are the same rule."),
};

/* ---------- Rechenwege: jeder Schritt ein Axiom ---------- */
function Rechenwege() {
  const [id, setId] = useState(KETTEN[0].id);
  const [n, setN] = useState(1);
  const k = KETTEN.find((x) => x.id === id);
  useEffect(() => { setN(1); }, [id]);
  return (
    <div style={{ ...karte, marginTop: 16 }} data-rechenwege>
      <p style={kicker}>{zw("Jeder Rechenschritt ist ein Axiom", "Every step is an axiom")}</p>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "0 0 10px" }}>{zw("Was du sonst „einfach so“ machst, wird hier sichtbar: Hinter jeder Umformung steht genau eine Spielregel.", "What you usually do “just like that” becomes visible here: behind every step there is exactly one rule.")}</p>
      <Auswahl optionen={KETTEN.map((x) => [x.id, zw(x.titel[0], x.titel[1])])} wert={id} setWert={setId} label={zw("Rechnung", "Calculation")} />
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: "6px 12px" }}>
        {k.zeilen.slice(0, n).map((z, i) => (
          <div key={i} style={{ padding: "8px 0", borderTop: i ? `1px solid ${C.linie}` : "none" }}>
            <div style={{ fontSize: 18, color: i === n - 1 ? C.tinte : C.grau, overflowX: "auto", paddingBottom: 1 }}><M t={z.tex} /></div>
            {i > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                {z.kz ? <><Chip kz={z.kz} klein /><span style={{ fontSize: 12.5, color: C.grau }}>{kzName(z.kz)}</span></>
                  : <span style={{ fontSize: 12.5, color: C.grau }}>{z.schritt ? zw(z.schritt[0], z.schritt[1]) : zw("ausrechnen", "calculate")}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <GrosserKnopf onClick={() => setN(n + 1)} disabled={n >= k.zeilen.length}>{zw("Nächster Schritt", "Next step")}</GrosserKnopf>
        <GrosserKnopf ghost onClick={() => setN(n >= k.zeilen.length ? 1 : k.zeilen.length)}>{n >= k.zeilen.length ? zw("Von vorn", "Restart") : zw("Alles zeigen", "Show all")}</GrosserKnopf>
      </div>
    </div>
  );
}

/* ---------- Lernmodul (Mathe entdecken) ---------- */
function useAxStand() {
  const [, setZ] = useState(0);
  useEffect(() => entdeckenHoeren(() => setZ((z) => z + 1)), []);
  return { status: statusAxiome(), phase: Math.min((entdeckenStand().axiome.phase || 0) + 1, AXIOM_PHASEN_ANZAHL) };
}
function ModulKarte({ gehe }) {
  const { status, phase } = useAxStand();
  const zeile = status === "fertig" ? zw("Abgeschlossen – du kannst es jederzeit wiederholen.", "Completed – you can repeat it any time.")
    : status === "arbeit" ? zw(`Du bist bei Phase ${phase} von ${AXIOM_PHASEN_ANZAHL}.`, `You are at phase ${phase} of ${AXIOM_PHASEN_ANZAHL}.`) : zw("Zehn Phasen, etwa 45 Minuten.", "Ten phases, about 45 minutes.");
  return (
    <div style={{ ...karte, marginTop: 16, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }} data-axiom-modul>
      <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.flaggold, margin: "0 0 6px" }}>{zw("Lernmodul", "Learning module")}</p>
      <p style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.3 }}>{zw("Axiome – das Fundament der Mathematik", "Axioms – the foundation of mathematics")}</p>
      <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.65, margin: "0 0 4px", color: "#C9D6EE" }}>{zw("Von den Spielregeln zu deinen ersten eigenen Beweisen: a · 0 = 0, warum es kein 1/0 gibt, und alle drei binomischen Formeln – nur aus den Axiomen.", "From the rules to your first own proofs: a · 0 = 0, why there is no 1/0, and all three binomial formulas – from the axioms alone.")}</p>
      <p style={{ fontSize: 12.5, fontWeight: 600, margin: "0 0 2px", color: C.flaggold }}>{zeile}</p>
      <GrosserKnopf gold onClick={() => gehe && gehe({ ansicht: "entdecken", seite: "axiome" })}>{status === "offen" ? zw("Lernmodul starten", "Start the module") : zw("Lernmodul öffnen", "Open the module")}</GrosserKnopf>
    </div>
  );
}

function Entdecken({ gehe }) {
  return (
    <div>
      <div style={{ ...karte, marginTop: 16, borderLeft: `4px solid ${C.flaggold}` }}>
        <p style={kicker}>{zw("Warum das Fundament?", "Why the foundation?")}</p>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: C.tinte }}>
          {zw("Brüche kürzen, Gleichungen lösen, ausmultiplizieren, ableiten: Alles beruht auf neun Spielregeln für nur zwei Rechenarten. Wer sie kennt, muss nichts mehr auswendig lernen – er kann jeden Rechenschritt begründen und Fehler selbst finden.", "Reducing fractions, solving equations, multiplying out, differentiating: everything rests on nine rules for just two operations. Whoever knows them no longer has to memorise – they can justify every step and find mistakes themselves.")}
        </p>
      </div>
      <GesetzProbe />
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={kicker}>{zw("Es gibt nur zwei Rechenarten", "There are only two operations")}</p>
        <div style={{ display: "grid", gap: 10 }}>
          {[[C.see, "#D6E4F7", "a − b = a + (−b)", zw("Minus ist Plus mit der Gegenzahl (A4).", "Minus is plus with the opposite (A4).")],
            [C.gruen, "#F7D3E0", "a : b = a \\cdot \\frac{1}{b} \\quad (b \\neq 0)", zw("Geteilt ist Mal mit dem Kehrwert (M4).", "Divided is times the reciprocal (M4).")]].map(([f, bg, t, s]) => (
            <div key={t} style={{ background: bg, borderLeft: `4px solid ${f}`, borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ fontSize: 19, color: C.tinte, overflowX: "auto" }}><M t={t} /></div>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: C.tinte }}>{s}</p>
            </div>
          ))}
        </div>
        <Merke><MS s={zw("Darum gelten Kommutativ- und Assoziativgesetz nicht für − und : ($8 − 3 \\neq 3 − 8$). Schreibst du Minus als Plus und Geteilt als Mal, darfst du wieder tauschen und Klammern versetzen.", "That is why the commutative and associative laws do not hold for − and : ($8 − 3 \\neq 3 − 8$). If you write minus as plus and divided as times, you may swap and regroup again.")} /></Merke>
      </div>
      <Rechenwege />
      <ModulKarte gehe={gehe} />
      <button type="button" onClick={() => gehe && gehe({ ansicht: "zahlenraeume" })} data-weiter-zahlenraeume
        style={{ ...karte, marginTop: 16, width: "100%", display: "flex", alignItems: "center", gap: 14, textAlign: "left", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
        <span aria-hidden="true" style={{ flexShrink: 0, width: 50, height: 50, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: C.weiss,
          background: `linear-gradient(135deg, ${C.see}, ${C.lila} 45%, ${C.gold} 75%, ${C.smaragd})` }}>ℕℝ</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel }}>{zw("Aufbaukurs · Station 2", "Next course · Station 2")}</span>
          <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{zw("Zahlenräume: von ℕ bis ℝ", "Number spaces: from ℕ to ℝ")}</span>
          <span style={{ display: "block", fontSize: 13, color: C.grau, lineHeight: 1.45, marginTop: 2 }}>{zw("Wo fehlen Inverse? Warum entstehen ℤ, ℚ und ℝ?", "Where are inverses missing? Why do ℤ, ℚ and ℝ arise?")}</span>
        </span>
        <span aria-hidden="true" style={{ color: C.see, fontSize: 20, fontWeight: 700 }}>→</span>
      </button>
    </div>
  );
}

/* ======================================================================
   ÜBEN
   ====================================================================== */
let zaehler = 0;
const neue = (art) => ({ id: ++zaehler, ...axAufgabe(art) });
const TITEL = {
  gesetz: ["Gesetz erkennen (Zahlen)", "Spot the law (numbers)"], term: ["Gesetz erkennen (Terme)", "Spot the law (terms)"], kette: ["Schritt begründen", "Justify a step"],
  invers: ["Inverse Elemente", "Inverse elements"], umschreiben: ["Minus und Geteilt umschreiben", "Rewrite minus and divided"], verkleidet: ["Verkleidete 0 und 1", "Disguised 0 and 1"],
  distributiv: ["Geschickt rechnen", "Clever calculation"], ausklammern: ["Ausklammern", "Factoring"],
};
const KURZ = {
  A1: () => zw("Klammern versetzen bei +", "regrouping with +"), A2: () => zw("Tauschen bei +", "swapping with +"), A3: () => zw("+ 0 ändert nichts", "+ 0 changes nothing"), A4: () => zw("a + (−a) ergibt 0", "a + (−a) gives 0"),
  M1: () => zw("Klammern versetzen bei ·", "regrouping with ·"), M2: () => zw("Tauschen bei ·", "swapping with ·"), M3: () => zw("· 1 ändert nichts", "· 1 changes nothing"), M4: () => zw("a · 1/a ergibt 1", "a · 1/a gives 1"),
  D: () => zw("+ und · zusammen: ausmultiplizieren bzw. ausklammern", "+ and · together: multiplying out or factoring"),
};
const gesetzOpt = (a) => misch(a.wahl.map((k) => [k, `${k} · ${kzName(k)}`]), a.id);
const gesetzFehler = (a) => a.wahl.slice(1).map((k) => ({ wahl: k, text: zw(`${k} heißt: ${KURZ[k]()} – $${KZ_FORMEL[k]}$. Hier passiert aber: ${KURZ[a.kz]()}.`, `${k} means: ${KURZ[k]()} – $${KZ_FORMEL[k]}$. Here, however: ${KURZ[a.kz]()}.`) }));
const tq = (x, kl) => { const t = qTex(x); return kl && x.z < 0 ? `(${t})` : t; };

function schritte(a) {
  switch (a.art) {
    case "gesetz":
    case "term":
      return [ws("ax-g", zw("Welches Gesetz?", "Which law?"), zw(`Welches Axiom zeigt $${a.tex}$?`, `Which axiom does $${a.tex}$ show?`), gesetzOpt(a), a.kz,
        { fehler: gesetzFehler(a), hinweis: zw("Was passiert von links nach rechts: tauschen, Klammern versetzen, 0 oder 1 verschwindet, Inverses, oder + und · zusammen?", "What happens left to right: swapping, regrouping, a 0 or 1 vanishes, an inverse, or + and · together?"),
          erkl: zw(`${a.kz} · ${kzName(a.kz)}: $${KZ_FORMEL[a.kz]}$${a.rueck ? " (hier von rechts nach links: ausklammern)" : ""}`, `${a.kz} · ${kzName(a.kz)}: $${KZ_FORMEL[a.kz]}$${a.rueck ? " (right to left here: factoring)" : ""}`) })];
    case "kette": {
      const k = KETTEN.find((x) => x.id === a.kette);
      return [ws("ax-k", zw("Begründung", "Justification"), zw(`Welches Axiom erlaubt den Schritt von $${k.zeilen[a.i - 1].tex}$ zu $${k.zeilen[a.i].tex}$?`, `Which axiom allows the step from $${k.zeilen[a.i - 1].tex}$ to $${k.zeilen[a.i].tex}$?`), gesetzOpt(a), a.kz,
        { fehler: gesetzFehler(a), hinweis: zw("Vergleiche die beiden Zeilen: Was hat sich genau verändert?", "Compare the two lines: what exactly changed?"), erkl: zw(`${a.kz} · ${kzName(a.kz)}: $${KZ_FORMEL[a.kz]}$`, `${a.kz} · ${kzName(a.kz)}: $${KZ_FORMEL[a.kz]}$`) })];
    }
    case "invers": {
      const was = a.plus ? zw("Gegenzahl (Inverses der Addition)", "opposite (additive inverse)") : zw("Kehrwert (Inverses der Multiplikation)", "reciprocal (multiplicative inverse)");
      const op = a.plus ? "+" : "\\cdot";
      return [
        zs("ax-i1", zw("Inverses", "Inverse"), zw("Inverses:", "Inverse:"), qNum(a.inv), zw(`Gib die ${was} von $${a.xTex}$ an (Brüche als 3/8).`, `Give the ${was} of $${a.xTex}$ (fractions as 3/8).`),
          { wertText: `$${a.invTex}$`, fehler: [{ wert: qNum(a.falsch), text: a.plus ? zw("Das ist der Kehrwert – gesucht ist die Gegenzahl für die Addition.", "That is the reciprocal – we want the opposite for addition.") : zw("Das ist die Gegenzahl – gesucht ist der Kehrwert für die Multiplikation.", "That is the opposite – we want the reciprocal for multiplication.") }],
            hinweis: a.plus ? zw("Welche Zahl ergibt zusammen mit x die 0?", "Which number gives 0 together with x?") : zw("Welche Zahl ergibt mal x die 1? Zähler und Nenner tauschen.", "Which number times x gives 1? Swap numerator and denominator."), erkl: `$${a.xTex} ${op} ${tq(a.inv, true)} = ${a.neutral}$` }),
        zs("ax-i2", zw("Probe", "Check"), `$${a.xTex} ${op} ${tq(a.inv, true)} =$`, a.neutral, zw("Was kommt heraus?", "What is the result?"),
          { fehler: [{ wert: 1 - a.neutral, text: zw("Das neutrale Element der anderen Rechenart.", "That is the identity of the other operation.") }], erkl: zw(`Das neutrale Element der ${a.plus ? "Addition" : "Multiplikation"}: ${a.neutral}`, `The identity of ${a.plus ? "addition" : "multiplication"}: ${a.neutral}`) }),
      ];
    }
    case "umschreiben": {
      const opt = a.minus
        ? [["r", `$${a.a} + (−${a.b})$`], ["f1", `$(−${a.a}) + ${a.b}$`], ["f2", `$${a.b} + (−${a.a})$`]]
        : [["r", `$${a.a} \\cdot \\frac{1}{${a.b}}$`], ["f1", `$\\frac{1}{${a.a}} \\cdot ${a.b}$`], ["f2", `$${a.a} \\cdot ${a.b}$`]];
      const term = a.minus ? `${a.a} − ${a.b}` : `${a.a} : ${a.b}`;
      return [
        ws("ax-u1", zw("Umschreiben", "Rewrite"), zw(`Schreibe $${term}$ als ${a.minus ? "Addition" : "Multiplikation"}.`, `Write $${term}$ as ${a.minus ? "an addition" : "a multiplication"}.`), misch(opt, a.id), "r",
          { fehler: [{ wahl: "f1", text: zw("Das Inverse gehört zur zweiten Zahl, nicht zur ersten.", "The inverse belongs to the second number, not the first.") }, { wahl: "f2", text: a.minus ? zw("Die Reihenfolge ist vertauscht – bei Minus darf man nicht tauschen.", "The order is swapped – with minus you may not swap.") : zw("Es fehlt der Kehrwert.", "The reciprocal is missing.") }],
            hinweis: a.minus ? "a − b = a + (−b)" : "a : b = a · 1/b", erkl: `$${term} = ${a.minus ? `${a.a} + (−${a.b})` : `${a.a} \\cdot \\frac{1}{${a.b}}`}$` }),
        zs("ax-u2", zw("Ergebnis", "Result"), `$${term} =$`, qNum(a.wert), zw("Rechne aus (Brüche als 3/8, vollständig gekürzt).", "Calculate (fractions as 3/8, fully reduced)."), { gekuerzt: true, wertText: `$${a.wertTex}$`, erkl: `$${term} = ${a.wertTex}$` }),
      ];
    }
    case "verkleidet": {
      const opt = misch(a.optionen.map((t, i) => [String(i), `$${t}$`]), a.id);
      const r = String(a.optionen.indexOf(a.richtig));
      const ziel = a.ziel === "eins" ? "1" : "0";
      return [ws("ax-v", zw("Verkleidet", "Disguised"), zw(`Welcher Ausdruck ist eine verkleidete ${ziel}?`, `Which expression is a disguised ${ziel}?`), opt, r,
        { hinweis: a.ziel === "eins" ? zw("Eine verkleidete 1 ist a · 1/a – z. B. ein Bruch mit gleichem Zähler und Nenner (≠ 0).", "A disguised 1 is a · 1/a – e.g. a fraction with equal numerator and denominator (≠ 0).") : zw("Eine verkleidete 0 ist a + (−a) – etwas minus sich selbst.", "A disguised 0 is a + (−a) – something minus itself."),
          erkl: zw(`$${a.richtig} = ${ziel}$. Multiplizierst du mit einer verkleideten 1 oder addierst eine verkleidete 0, ändert sich der Wert nicht – so funktionieren Erweitern und quadratische Ergänzung.`, `$${a.richtig} = ${ziel}$. Multiplying by a disguised 1 or adding a disguised 0 doesn't change the value – that is how expanding fractions and completing the square work.`) })];
    }
    case "distributiv": {
      const vz = a.plus ? "+" : "−";
      return [
        ws("ax-d1", zw("Zerlegen", "Split"), zw(`Wie zerlegst du ${a.n} geschickt?`, `How do you split ${a.n} cleverly?`), misch([["r", `$${a.rund} ${vz} ${a.d}$`], ["f1", `$${a.n - 1} + 1$`], ["f2", `$${a.rund} ${a.plus ? "−" : "+"} ${a.d}$`]], a.id), "r",
          { fehler: [{ wahl: "f2", text: zw("Das ergibt nicht " + a.n + ".", "That does not give " + a.n + ".") }, { wahl: "f1", text: zw("Stimmt, ist aber nicht geschickt – suche eine runde Zahl.", "Correct, but not clever – look for a round number.") }], erkl: `$${a.n} = ${a.rund} ${vz} ${a.d}$` }),
        zs("ax-d2", zw("Erster Teil", "First part"), `$${a.a} \\cdot ${a.rund} =$`, a.teil1, zw("Distributivgesetz: Jeder Summand wird mit " + a.a + " multipliziert.", "Distributive law: each summand is multiplied by " + a.a + "."), { erkl: String(a.teil1) }),
        zs("ax-d3", zw("Zweiter Teil", "Second part"), `$${a.a} \\cdot ${a.d} =$`, a.teil2, zw("Und der zweite Summand?", "And the second summand?"), { erkl: String(a.teil2) }),
        zs("ax-d4", zw("Ergebnis", "Result"), `$${a.a} \\cdot ${a.n} =$`, a.wert, zw("Zusammenrechnen.", "Combine."),
          { fehler: [{ wert: a.plus ? a.teil1 + a.d : a.teil1 - a.d, text: zw(`Auch die ${a.d} muss mit ${a.a} multipliziert werden.`, `The ${a.d} must also be multiplied by ${a.a}.`) }], erkl: `$${a.a} \\cdot (${a.rund} ${vz} ${a.d}) = ${a.teil1} ${vz} ${a.teil2} = ${a.wert}$` }),
      ];
    }
    default: {
      const kc = a.k * a.c, km = a.k * a.m;
      const cx = a.c === 1 ? "x" : `${a.c}x`;
      const kand = [["r", `$${a.k} \\cdot (${cx} + ${a.m})$`], ["f1", `$${kc} \\cdot (x + ${a.m})$`], ["f2", a.c !== a.k ? `$${a.c} \\cdot (${a.k}x + ${a.m})$` : `$${a.k} \\cdot (${cx} + ${km})$`]];
      return [
        ws("ax-a1", zw("Ausklammern", "Factor out"), zw(`Klammere den größten gemeinsamen Faktor aus: $${kc}x + ${km}$`, `Factor out the greatest common factor: $${kc}x + ${km}$`), misch(kand, a.id), "r",
          { fehler: [{ wahl: "f1", text: zw(`Ausmultipliziert gibt das $${kc}x + ${kc * a.m}$ – nicht ${km}.`, `Multiplied out this gives $${kc}x + ${kc * a.m}$ – not ${km}.`) }, { wahl: "f2", text: zw("Multipliziere zur Probe aus – stimmt das Ergebnis mit dem Term überein?", "Multiply out to check – does it match the term?") }],
            hinweis: zw(`Welche Zahl teilt sowohl ${kc} als auch ${km}?`, `Which number divides both ${kc} and ${km}?`), erkl: `$${kc}x + ${km} = ${a.k} \\cdot ${cx} + ${a.k} \\cdot ${a.m} = ${a.k} \\cdot (${cx} + ${a.m})$` }),
        ws("ax-a2", zw("Welches Gesetz?", "Which law?"), zw("Welches Axiom steckt hinter dem Ausklammern?", "Which axiom is behind factoring?"), misch([["D", `D · ${kzName("D")}`], ["M1", `M1 · ${kzName("M1")}`], ["A2", `A2 · ${kzName("A2")}`]], a.id + 1), "D",
          { erkl: zw("Das Distributivgesetz, von rechts nach links gelesen: $a \\cdot b + a \\cdot c = a \\cdot (b + c)$.", "The distributive law read from right to left: $a \\cdot b + a \\cdot c = a \\cdot (b + c)$.") }),
      ];
    }
  }
}
function text(a) {
  switch (a.art) {
    case "gesetz": return zw("Diese Gleichung ist ein Beispiel für genau ein Axiom.", "This equation is an example of exactly one axiom.");
    case "term": return zw("Auch mit Variablen gelten dieselben Spielregeln.", "The same rules hold with variables.");
    case "kette": { const k = KETTEN.find((x) => x.id === a.kette); return zw(k.titel[0], k.titel[1]); }
    case "invers": return zw(`Zu $${a.xTex}$ gibt es ein inverses Element der ${a.plus ? "Addition" : "Multiplikation"}.`, `$${a.xTex}$ has an inverse element for ${a.plus ? "addition" : "multiplication"}.`);
    case "umschreiben": return zw("Es gibt nur zwei Rechenarten: Minus ist Plus mit der Gegenzahl, Geteilt ist Mal mit dem Kehrwert.", "There are only two operations: minus is plus with the opposite, divided is times the reciprocal.");
    case "verkleidet": return zw("0 und 1 verkleiden sich gern.", "0 and 1 like to wear disguises.");
    case "distributiv": return zw(`Rechne im Kopf: $${a.a} \\cdot ${a.n}$.`, `Calculate mentally: $${a.a} \\cdot ${a.n}$.`);
    default: return zw("Ausklammern ist das Distributivgesetz rückwärts.", "Factoring is the distributive law backwards.");
  }
}
const hilfe = (a) => hilfeKontext({
  id: `axiome-${a.art}`, aufgabe: "Axiome Rechengesetze Kommutativgesetz Assoziativgesetz Distributivgesetz neutrales Element inverses Element Gegenzahl Kehrwert",
  verstehen: [zw("Vergleiche links und rechts: Was ist anders?", "Compare left and right: what is different?")],
  ansatz: [zw("Tauschen → Kommutativ, Klammern → Assoziativ, 0/1 → neutral, −a bzw. 1/a → invers, + und · zusammen → Distributiv.", "Swap → commutative, brackets → associative, 0/1 → identity, −a or 1/a → inverse, + and · together → distributive.")],
  regel: KZ.map((k) => `${k}: ${KZ_FORMEL[k].replace(/\\cdot/g, "·").replace(/\\frac\{1\}\{a\}/g, "1/a")}`),
  pruefen: [zw("Setze Zahlen ein: Sind beide Seiten gleich?", "Plug in numbers: are both sides equal?")],
});

export function AxiomeRechenregeln({ gehe }) {
  return (
    <ZweiModi titel={zw("Axiome und Rechenregeln", "Axioms and rules of arithmetic")}
      text={zw("Das Fundament für alles: neun Spielregeln für Plus und Mal. Hier erkennst du sie, begründest Rechenschritte damit und trainierst sie an Zahlen und Termen.", "The foundation of everything: nine rules for plus and times. Here you spot them, justify steps with them and train them on numbers and terms.")}
      kurz={<div style={{ display: "grid", gap: 4 }}>{KZ.map((k) => <div key={k} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><Chip kz={k} klein /><M t={KZ_FORMEL[k]} /></div>)}</div>}
      entdecken={<Entdecken gehe={gehe} />}
      ueben={<UebenRahmen titel={TITEL} arten={AX_ARTEN} neue={neue} schritte={schritte} text={text} hilfe={hilfe} />} />
  );
}
