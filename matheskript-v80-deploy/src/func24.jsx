/* ============================================================
   Vektoren-Bereich: Abstände – ein gemeinsames Tool
   Links Punkt | Gerade | Ebene, mittig „zu“, rechts dieselben drei.
   Alle neun Kombinationen; umgekehrte Reihenfolgen nutzen dieselbe
   Abstandslogik. Rechnung exakt mit Brüchen, Ergebnis als Wurzel
   bzw. Bruch mit Näherung. Schneidende oder enthaltene Objekte haben
   Abstand 0; bei windschiefen Geraden wird die gemeinsame Senkrechte
   (beide Lotfußpunkte) bestimmt.
   Zusatzmodus „Lotfußpunkt üben“ für Punkt–Gerade und Punkt–Ebene.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useState } from "react";
import { C } from "./base1.jsx";
import { Bruch, Einzeilig, Wurzel, Zahl, ggT, kreuz, skalar } from "./func19.jsx";
import { FA, FB, FE, Gl, Name, Raum3, Schritt, Vek, k, koordText, n, neueAufgabe } from "./func20.jsx";
import { Feld, Knopf, Meldung, PunktEingabe, VektorFeld, leseVektor } from "./func23.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";

/* Lernhilfe je Kombination */
const ABSTAND_WEG = {
  "punkt-punkt": ["Wie lang ist der Weg von einem Punkt zum anderen?", "Der Abstand ist die Länge des Verbindungsvektors: |PQ| = √((q₁ − p₁)² + (q₂ − p₂)² + (q₃ − p₃)²).", "Berechne zuerst PQ = Q − P und dann seine Länge."],
  "punkt-gerade": ["Wo trifft das kürzeste Lot vom Punkt auf die Gerade?", "Ein allgemeiner Punkt der Geraden ist Fₜ = A + t·u. Der Vektor von P nach Fₜ muss senkrecht zum Richtungsvektor stehen: PFₜ · u = 0.", "Löse PFₜ · u = 0 nach t auf, setze t in Fₜ ein (Lotfußpunkt F) und berechne |PF|."],
  "punkt-ebene": ["Welche Form der Ebenengleichung macht den Abstand am einfachsten?", "Hessesche Normalform: d(P; E) = |n₁p₁ + n₂p₂ + n₃p₃ − d| / |n|.", "Setze P in die linke Seite der Koordinatenform ein, ziehe d ab, nimm den Betrag und teile durch die Länge des Normalenvektors."],
  "gerade-gerade": ["Sind die Richtungsvektoren parallel?", "Parallel: Abstand Punkt–Gerade mit einem Stützpunkt. Nicht parallel: gemeinsamer Normalenvektor n = u × v und d = |AB · n| / |n|. Ist das 0, schneiden sich die Geraden.", "Berechne zuerst u × v. Ist das der Nullvektor, sind die Geraden parallel – sonst projiziere AB auf n."],
  "gerade-ebene": ["Ist die Gerade parallel zur Ebene?", "Parallel genau dann, wenn u · n = 0. Sonst schneidet die Gerade die Ebene – Abstand 0.", "Berechne u · n. Ist es 0, nimm den Stützpunkt der Geraden und rechne Abstand Punkt–Ebene."],
  "ebene-ebene": ["Sind die Normalenvektoren Vielfache voneinander?", "Nur parallele Ebenen haben einen Abstand > 0. Sonst schneiden sie sich in einer Geraden.", "Wähle einen Punkt von E₂ (z. B. zwei Koordinaten 0 setzen) und rechne Abstand Punkt–Ebene zu E₁."],
};
function abstandHilfe(kombi) {
  const w = ABSTAND_WEG[kombi];
  return {
    id: `abst-${kombi}`,
    aufgabe: `Abstand ${kombi.replace("-", " ")} Lotfußpunkt Normalenvektor ${kombi === "gerade-gerade" ? "windschief" : ""}`,
    hilfen: {
      verstehen: [
        "Abstand heißt immer: kürzeste Entfernung. Sie wird senkrecht gemessen und ist nie negativ.",
        "Schneiden sich die Objekte oder liegt eines im anderen, ist der Abstand 0.",
        "Mach dir eine Skizze: Wo verläuft die kürzeste Verbindung?",
      ],
      ansatz: w,
      regel: [
        "Welche Formel misst Längen, welche prüft Senkrechtstehen?",
        "Länge: |v| = √(v₁² + v₂² + v₃²). Senkrecht: a · b = 0. Gemeinsame Senkrechte zweier Richtungen: a × b.",
        w[1],
      ],
      pruefen: [
        "Ist dein Abstand positiv (oder 0 bei Schnitt)? Ein negativer Abstand ist immer ein Rechenfehler.",
        "Steht das Lot wirklich senkrecht? Prüfe mit dem Skalarprodukt.",
        "Liegt dein Lotfußpunkt auf der Geraden bzw. in der Ebene? Setze ihn ein.",
      ],
    },
    regeln: [{ name: "Betrag (Länge)", bereich: "vektoren" }, { name: "Orthogonalität", bereich: "vektoren" },
      ...(kombi.includes("ebene") ? [{ name: "Abstand Punkt–Ebene", bereich: "vektoren" }] : []),
      ...(kombi === "gerade-gerade" ? [{ name: "Kreuzprodukt", bereich: "vektoren" }] : [])],
    grundlage: { trainer: "wurzeln", name: "Wurzeln", grund: "Abstände enden fast immer mit einer Wurzel. Eine schnelle Runde Wurzeln hilft." },
    loesung: null,
  };
}

/* ---------- exakte Bruchrechnung ---------- */

export const q = (z, nn = 1) => {
  if (nn < 0) { z = -z; nn = -nn; }
  const g = ggT(z, nn) || 1;
  return { z: z / g, n: nn / g };
};
const qAdd = (a, b) => q(a.z * b.n + b.z * a.n, a.n * b.n);
const qMul = (a, b) => q(a.z * b.z, a.n * b.n);
const qWert = (a) => a.z / a.n;
const qGleich0 = (a) => a.z === 0;
const ganz = (x) => q(x, 1);
const qVek = (v) => v.map(ganz);
// Punkt + t·Richtung mit rationalem t
const qPunkt = (A, t, u) => A.map((a, i) => qAdd(ganz(a), qMul(t, ganz(u[i]))));
const qDiff = (P, Q) => Q.map((x, i) => qAdd(x, qMul(ganz(-1), P[i])));    // Q − P
const qBetragQuadrat = (v) => v.reduce((s, x) => qAdd(s, qMul(x, x)), ganz(0));
const dez = (x) => String(Math.round(x * 1000) / 1000).replace(".", ",").replace("-", "−");
const isqrt = (x) => { const r = Math.round(Math.sqrt(x)); return r * r === x ? r : null; };
const Z = ({ w }) => <Zahl q={w} />;
const zk = (w) => (w.z < 0 ? <span style={{ display: "inline-flex", alignItems: "center" }}>(<Zahl q={w} />)</span> : <Zahl q={w} />);

/* Abstand aus d² = N / D exakt darstellen: ganze Zahl, Bruch oder (teilweise) gezogene Wurzel – mit Näherung */
export function WurzelWert({ d2, farbe = FE }) {
  const N = d2.z, D = d2.n;
  if (N === 0) return <span style={{ color: farbe }}>0 LE</span>;
  const sN = isqrt(N), sD = isqrt(D);
  if (sN !== null && sD !== null) {
    const w = q(sN, sD);
    return <span style={{ color: farbe, display: "inline-flex", alignItems: "center", gap: "0.25em" }}><Zahl q={w} />{w.n !== 1 && <span style={{ color: C.tinte }}>≈ {dez(qWert(w))}</span>} LE</span>;
  }
  // √(N/D) = √(N·D) / D = a·√b / D
  let rad = N * D, a = 1;
  for (let f = 2; f * f <= rad; f++) while (rad % (f * f) === 0) { rad /= f * f; a *= f; }
  const g = ggT(a, D) || 1;
  const oben = a / g, unten = D / g;
  const wurzelTeil = <span style={{ display: "inline-flex", alignItems: "center" }}>{oben !== 1 && <span>{oben}</span>}<Wurzel>{rad}</Wurzel></span>;
  return (
    <span style={{ color: farbe, display: "inline-flex", alignItems: "center", gap: "0.3em" }}>
      {unten === 1 ? wurzelTeil : <Bruch oben={wurzelTeil} unten={unten} />}
      <span style={{ color: C.tinte }}>≈ {dez(Math.sqrt(N / D))} LE</span>
    </span>
  );
}

/* ---------- Objekte ---------- */

const TYPEN = [
  { id: "punkt", name: "Punkt" },
  { id: "gerade", name: "Gerade" },
  { id: "ebene", name: "Ebene" },
];

const START = {
  links: { typ: "punkt", punkt: ["3", "4", "5"], stuetz: ["1", "2", "0"], richtung: ["1", "0", "2"], ebene: ["2", "-1", "2", "6"] },
  rechts: { typ: "ebene", punkt: ["1", "0", "-1"], stuetz: ["0", "1", "3"], richtung: ["2", "1", "0"], ebene: ["2", "-1", "2", "-3"] },
};

function namen(l, r) {
  const gleich = l === r;
  const nm = (typ, seite) => ({
    punkt: gleich ? (seite === 0 ? "P" : "Q") : "P",
    gerade: gleich ? (seite === 0 ? "g" : "h") : "g",
    ebene: gleich ? (seite === 0 ? "E₁" : "E₂") : "E",
  })[typ];
  return [nm(l, 0), nm(r, 1)];
}

/* Objekt aus den Eingaben lesen; null bei unvollständiger oder unzulässiger Eingabe */
function lese(o) {
  if (o.typ === "punkt") { const p = leseVektor(o.punkt); return p ? { typ: "punkt", p } : { fehler: "Bitte alle Koordinaten des Punktes als ganze Zahlen eintragen." }; }
  if (o.typ === "gerade") {
    const a = leseVektor(o.stuetz), u = leseVektor(o.richtung);
    if (!a || !u) return { fehler: "Bitte Stütz- und Richtungsvektor der Geraden vollständig eintragen." };
    if (u.every((x) => x === 0)) return { fehler: "Der Richtungsvektor darf nicht der Nullvektor sein." };
    return { typ: "gerade", a, u };
  }
  const w = leseVektor(o.ebene);
  if (!w) return { fehler: "Bitte a, b, c und d der Ebene als ganze Zahlen eintragen." };
  if (w.slice(0, 3).every((x) => x === 0)) return { fehler: "Der Normalenvektor (a | b | c) darf nicht der Nullvektor sein." };
  return { typ: "ebene", nv: w.slice(0, 3), d: w[3] };
}

/* ---------- Auswahl links | zu | rechts ---------- */

function Auswahl({ wert, setWert, seite }) {
  return (
    <div role="radiogroup" aria-label={seite === 0 ? "Erstes Objekt" : "Zweites Objekt"} style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
      {TYPEN.map((t) => {
        const an = wert === t.id;
        return (
          <button key={t.id} type="button" role="radio" aria-checked={an} onClick={() => setWert(t.id)}
            style={{ minHeight: 46, borderRadius: 14, fontFamily: "inherit", cursor: "pointer", fontSize: 15, fontWeight: 700,
              border: `1px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see,
              boxShadow: an ? "0 4px 14px rgba(0,77,152,0.25)" : "none" }}>
            {t.name}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Eingabe eines Objekts ---------- */

function ObjektEingabe({ o, setO, name, farbe }) {
  const setze = (feld) => (w) => setO({ ...o, [feld]: w });
  if (o.typ === "punkt") return <PunktEingabe name={name} farbe={farbe} werte={o.punkt} setWerte={setze("punkt")} />;
  if (o.typ === "gerade") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: farbe }}>
        <span>{name}: x =</span>
        <VektorFeld name="" farbe={farbe} werte={o.stuetz} setWerte={setze("stuetz")} />
        <span>+ {name === "h" ? "s" : "t"} ·</span>
        <VektorFeld name="" farbe={farbe} werte={o.richtung} setWerte={setze("richtung")} />
      </div>
    );
  }
  const w = o.ebene;
  const s = (i) => (v) => { const x = [...w]; x[i] = v; setO({ ...o, ebene: x }); };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 800, color: farbe }}>
      <span>{name}:</span>
      <Feld wert={w[0]} setWert={s(0)} label={`${name} a`} farbe={farbe} /><span>x₁ +</span>
      <Feld wert={w[1]} setWert={s(1)} label={`${name} b`} farbe={farbe} /><span>x₂ +</span>
      <Feld wert={w[2]} setWert={s(2)} label={`${name} c`} farbe={farbe} /><span>x₃ =</span>
      <Feld wert={w[3]} setWert={s(3)} label={`${name} d`} farbe={farbe} breite={48} />
    </div>
  );
}

/* ---------- Gleichungen anzeigen ---------- */

const GeradeText = ({ name, a, u, farbe, par = "t" }) => (
  <Einzeilig max={16}><span style={{ color: farbe }}>{name}:</span><Name t="x" farbe={farbe} /><Gl /><Vek w={a.map(n)} farbe={farbe} /><span>+ {par} ·</span><Vek w={u.map(n)} farbe={farbe} /></Einzeilig>
);
const qVekAnzeige = (v, farbe) => <Vek w={v.map((x, i) => <Z key={i} w={x} />)} farbe={farbe} />;
const qPunktText = (name, v) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2em" }}>{name}(
    {v.map((x, i) => <React.Fragment key={i}>{i > 0 && <span style={{ color: C.hellgrau }}>|</span>}<Z w={x} /></React.Fragment>)})</span>
);
const Erg = ({ links, d2, text }) => (
  <Schritt titel="Ergebnis">
    <Einzeilig max={18}><span>{links} =</span><WurzelWert d2={d2} /></Einzeilig>
    {text && <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.55, marginTop: 8, textAlign: "center" }}>{text}</p>}
  </Schritt>
);

/* ---------- Die einzelnen Rechnungen ---------- */

function PunktPunkt({ P, Q, nP, nQ }) {
  const v = Q.map((x, i) => x - P[i]);
  const d2 = q(skalar(v, v), 1);
  return (
    <>
      <Schritt nr="1" titel={`Verbindungsvektor von ${nP} nach ${nQ}`}>
        <Einzeilig max={16}><Name t={nP + nQ} farbe={FE} /><Gl /><Vek w={Q.map(n)} farbe={FB} /><span>−</span><Vek w={P.map(n)} farbe={FA} /><Gl /><Vek w={v.map(n)} farbe={FE} /></Einzeilig>
      </Schritt>
      <Schritt nr="2" titel="Länge des Verbindungsvektors">
        <Einzeilig max={17}><span>|</span><Name t={nP + nQ} farbe={FE} /><span>| =</span><Wurzel>{v.map((x) => `${k(x)}²`).join(" + ")}</Wurzel><Gl /><Wurzel>{d2.z}</Wurzel></Einzeilig>
      </Schritt>
      <Erg links={`d(${nP}; ${nQ})`} d2={d2} text={d2.z === 0 ? "Die Punkte sind gleich." : null} />
      <Raum3 punkte={[{ p: P, label: nP, farbe: FA }, { p: Q, label: nQ, farbe: FB }]} lot={[P, Q]} />
    </>
  );
}

/* Lotfußpunkt von P auf g: A + t·u */
function lotAufGerade(P, A, u) {
  const AP = A.map((x, i) => x - P[i]);                 // Vektor von P nach A
  const t0 = q(-skalar(AP, u), skalar(u, u));
  const F = qPunkt(A, t0, u);
  const PF = qDiff(qVek(P), F);
  return { AP, t0, F, PF, d2: qBetragQuadrat(PF) };
}

function PunktGerade({ P, A, u, nP, nG }) {
  const { AP, t0, F, PF, d2 } = lotAufGerade(P, A, u);
  const lin = (c, t) => (t === 0 ? n(c) : `${n(c)} ${t < 0 ? "−" : "+"} ${Math.abs(t) === 1 ? "" : Math.abs(t)}t`);
  const kU = skalar(u, u), kA = skalar(AP, u);
  return (
    <>
      <Schritt nr="1" titel={`Allgemeiner Punkt Fₜ auf ${nG} und Verbindungsvektor von ${nP}`}>
        <Einzeilig max={16}><Name t={nP + "Fₜ"} farbe={FE} /><Gl /><Vek w={A.map((x, i) => lin(x - P[i], u[i]))} /></Einzeilig>
      </Schritt>
      <Schritt nr="2" titel="Lotbedingung: Verbindungsvektor senkrecht zum Richtungsvektor">
        <Einzeilig max={16}><Name t={nP + "Fₜ"} farbe={FE} /><span>·</span><Vek w={u.map(n)} farbe={FA} /><span>= 0</span></Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={16}><span>{u.map((c, i) => `${k(c)}·(${lin(AP[i], u[i])})`).join(" + ")} = 0</span></Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={16}>
          <span>{n(kA)} {kU >= 0 ? "+" : "−"} {Math.abs(kU)}t = 0</span><span style={{ color: C.hellgrau }}>⇔</span><span style={{ color: FE }}>t =</span><span style={{ color: FE }}><Z w={t0} /></span>
        </Einzeilig>
      </Schritt>
      <Schritt nr="3" titel="Lotfußpunkt F und Verbindungsvektor">
        <Einzeilig max={16}>{qPunktText("F", F)}<span style={{ color: C.hellgrau }}>⇒</span><Name t={nP + "F"} farbe={FE} /><Gl />{qVekAnzeige(PF, FE)}</Einzeilig>
      </Schritt>
      <Erg links={`d(${nP}; ${nG}) = |${nP}F|`} d2={d2} text={d2.z === 0 ? `${nP} liegt auf ${nG} – der Abstand ist 0.` : null} />
      <Raum3 punkte={[{ p: P, label: nP, farbe: FB }, { p: F.map(qWert), label: "F", farbe: C.gruen }, { p: A, label: "A", farbe: FA }]}
        gerade={{ p: A, r: u }} lot={[P, F.map(qWert)]} />
    </>
  );
}

function PunktEbene({ P, nv, d, nP, nE }) {
  const z = skalar(nv, P) - d, qq = skalar(nv, nv);
  const lam = q(-z, qq);
  const F = qPunkt(P, lam, nv);
  return (
    <>
      <Schritt nr="1" titel="Hessesche Normalform: Punkt einsetzen und durch |n| teilen">
        <Einzeilig max={17}><span>d({nP}; {nE}) =</span>
          <Bruch oben={<span>|{nv.map((x, i) => `${k(x)}·${k(P[i])}`).join(" + ")} − {k(d)}|</span>} unten={<Wurzel>{nv.map((x) => `${k(x)}²`).join(" + ")}</Wurzel>} />
          <Gl /><Bruch oben={<span>|{n(z)}|</span>} unten={<Wurzel>{qq}</Wurzel>} />
        </Einzeilig>
      </Schritt>
      <Schritt nr="2" titel={`Lotfußpunkt: Lotgerade durch ${nP} mit Richtung n schneidet ${nE}`}>
        <Einzeilig max={16}><span>l:</span><Name t="x" /><Gl /><Vek w={P.map(n)} farbe={FB} /><span>+ λ ·</span><Vek w={nv.map(n)} farbe={FA} /></Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={16}><span>einsetzen: {n(skalar(nv, P))} {qq >= 0 ? "+" : "−"} {qq}λ = {n(d)}</span><span style={{ color: C.hellgrau }}>⇔</span><span style={{ color: FE }}>λ =</span><span style={{ color: FE }}><Z w={lam} /></span></Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={16}>{qPunktText("F", F)}</Einzeilig>
      </Schritt>
      <Erg links={`d(${nP}; ${nE})`} d2={q(z * z, qq)}
        text={z === 0 ? `${nP} liegt in ${nE} – der Abstand ist 0.` : `Der Betrag sorgt dafür, dass der Abstand nie negativ ist; das Vorzeichen von ${n(z)} verrät nur die Seite der Ebene.`} />
      <Raum3 punkte={[{ p: P, label: nP, farbe: FB }, { p: F.map(qWert), label: "F", farbe: C.gruen }]} ebene={{ n: nv, d }} lot={[P, F.map(qWert)]} />
    </>
  );
}

function GeradeGerade({ A, u, B, v, nG, nH }) {
  const nv = kreuz(u, v);
  const AB = B.map((x, i) => x - A[i]);
  const paare = [[1, 2], [2, 0], [0, 1]];
  const parallel = nv.every((x) => x === 0);
  const kopf = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
      <GeradeText name={nG} a={A} u={u} farbe={FA} par="r" />
      <GeradeText name={nH} a={B} u={v} farbe={C.see} par="s" />
    </div>
  );
  const kreuzSchritt = (
    <Schritt nr="1" titel="Richtungsvektoren vergleichen: Kreuzprodukt">
      <Einzeilig max={15}><Name t="n" farbe={FE} /><Gl /><Vek w={u.map(n)} farbe={FA} /><span>×</span><Vek w={v.map(n)} farbe={C.see} /><Gl />
        <Vek w={paare.map(([i, j]) => `${k(u[i])}·${k(v[j])} − ${k(u[j])}·${k(v[i])}`)} /><Gl /><Vek w={nv.map(n)} farbe={FE} /></Einzeilig>
    </Schritt>
  );
  if (parallel) {
    const { d2, F } = lotAufGerade(B, A, u);
    return (
      <>
        {kreuzSchritt}
        <Schritt nr="2" titel="Die Richtungsvektoren sind parallel">
          <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6 }}>
            {d2.z === 0
              ? `Der Stützpunkt von ${nH} liegt auf ${nG} – die Geraden sind identisch.`
              : `Die Geraden sind echt parallel. Ihr Abstand ist der Abstand des Stützpunkts B von ${nH} zur Geraden ${nG} (Lotfußpunkt-Verfahren Punkt–Gerade).`}
          </p>
          {d2.z !== 0 && <><div style={{ height: 6 }} /><Einzeilig max={16}><span>Lotfußpunkt von B auf {nG}:</span>{qPunktText("F", F)}</Einzeilig></>}
        </Schritt>
        <Erg links={`d(${nG}; ${nH})`} d2={d2} text={d2.z === 0 ? "Identische Geraden haben den Abstand 0." : null} />
        <Raum3 punkte={[{ p: A, label: "A", farbe: FA }, { p: B, label: "B", farbe: C.see }]} gerade={{ p: A, r: u, ohnePfeil: true }} gerade2={{ p: B, r: v }}
          lot={d2.z ? [B, F.map(qWert)] : null} />
      </>
    );
  }
  const z = skalar(AB, nv), qq = skalar(nv, nv);
  // Gemeinsame Senkrechte: (A + r·u − B − s·v) ⟂ u und ⟂ v  →  2×2-LGS (Cramer)
  const uu = skalar(u, u), vv = skalar(v, v), uv = skalar(u, v), wu = skalar(AB, u), wv = skalar(AB, v);
  // r·uu − s·uv = wu ;  r·uv − s·vv = wv
  const det = -uu * vv + uv * uv;
  const r = q(wu * -vv - -uv * wv, det), s = q(uu * wv - uv * wu, det);
  const Fg = qPunkt(A, r, u), Fh = qPunkt(B, s, v);
  return (
    <>
      {kreuzSchritt}
      <Schritt nr="2" titel="Abstand: Verbindungsvektor auf den gemeinsamen Normalenvektor projizieren">
        <Einzeilig max={16}><Name t="AB" farbe={FE} /><Gl /><Vek w={AB.map(n)} farbe={FE} /></Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={17}><span>d({nG}; {nH}) =</span>
          <Bruch oben={<span>|{AB.map((x, i) => `${k(x)}·${k(nv[i])}`).join(" + ")}|</span>} unten={<Wurzel>{nv.map((x) => `${k(x)}²`).join(" + ")}</Wurzel>} />
          <Gl /><Bruch oben={<span>|{n(z)}|</span>} unten={<Wurzel>{qq}</Wurzel>} />
        </Einzeilig>
      </Schritt>
      <Schritt nr="3" titel={z === 0 ? "Schnittpunkt" : "Gemeinsame Senkrechte: beide Lotfußpunkte"}>
        <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.55, marginBottom: 6, textAlign: "center" }}>
          Bedingung: Der Vektor von F₂ (auf {nH}) nach F₁ (auf {nG}) steht senkrecht auf beiden Richtungsvektoren.
        </p>
        <Einzeilig max={16}><span>r =</span><Z w={r} /><span>,</span><span>s =</span><Z w={s} /></Einzeilig>
        <div style={{ height: 6 }} />
        {z === 0
          ? <Einzeilig max={16}>{qPunktText("S", Fg)}</Einzeilig>
          : <Einzeilig max={16}>{qPunktText("F₁", Fg)}<span style={{ margin: "0 0.3em" }} />{qPunktText("F₂", Fh)}</Einzeilig>}
      </Schritt>
      <Erg links={`d(${nG}; ${nH})`} d2={q(z * z, qq)}
        text={z === 0 ? "Die Geraden schneiden sich – Abstand 0." : "Die Richtungen sind nicht parallel und die Geraden schneiden sich nicht – sie sind windschief. Der Abstand ist die Länge der gemeinsamen Senkrechten."} />
      <Raum3 punkte={[{ p: A, label: "A", farbe: FA }, { p: B, label: "B", farbe: C.see }, ...(z === 0 ? [{ p: Fg.map(qWert), label: "S", farbe: C.gruen }] : [{ p: Fg.map(qWert), label: "F₁", farbe: C.gruen }, { p: Fh.map(qWert), label: "F₂", farbe: C.gruen }])]}
        gerade={{ p: A, r: u, ohnePfeil: true }} gerade2={{ p: B, r: v }} lot={z === 0 ? null : [Fg.map(qWert), Fh.map(qWert)]} />
    </>
  );
}

function GeradeEbene({ A, u, nv, d, nG, nE }) {
  const nu = skalar(nv, u), nA = skalar(nv, A);
  const kopf = <div style={{ marginBottom: 12 }}><GeradeText name={nG} a={A} u={u} farbe={FB} /><p style={{ textAlign: "center", fontWeight: 700, color: FA, marginTop: 8 }}>{nE}: {koordText(nv, d)}</p></div>;
  const s1 = (
    <Schritt nr="1" titel="Richtungsvektor · Normalenvektor">
      <Einzeilig max={16}><Vek w={u.map(n)} farbe={FB} /><span>·</span><Vek w={nv.map(n)} farbe={FA} /><Gl /><span>{u.map((x, i) => `${k(x)}·${k(nv[i])}`).join(" + ")}</span><Gl /><span style={{ color: FE }}>{n(nu)}</span></Einzeilig>
    </Schritt>
  );
  if (nu !== 0) {
    const t = q(d - nA, nu);
    const S = qPunkt(A, t, u);
    return (
      <>
        {s1}
        <Schritt nr="2" titel={`Nicht 0: ${nG} ist nicht parallel zu ${nE} und schneidet die Ebene`}>
          <Einzeilig max={16}><span>einsetzen: {n(nA)} {nu > 0 ? "+" : "−"} {Math.abs(nu)}t = {n(d)}</span><span style={{ color: C.hellgrau }}>⇔</span><span>t =</span><Z w={t} /></Einzeilig>
          <div style={{ height: 6 }} /><Einzeilig max={16}>{qPunktText("S", S)}</Einzeilig>
        </Schritt>
        <Erg links={`d(${nG}; ${nE})`} d2={q(0)} text="Gerade und Ebene schneiden sich – Abstand 0. Ein Abstand ist nur bei Parallelität sinnvoll." />
        <Raum3 punkte={[{ p: A, label: "A", farbe: FB }, { p: S.map(qWert), label: "S", farbe: C.gruen }]} gerade={{ p: A, r: u }} ebene={{ n: nv, d }} />
      </>
    );
  }
  const z = nA - d, qq = skalar(nv, nv);
  return (
    <>
      {s1}
      <Schritt nr="2" titel={`0: ${nG} ist parallel zu ${nE} (oder liegt in ${nE})`}>
        <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 6 }}>Jeder Punkt von {nG} hat denselben Abstand – nimm den Stützpunkt A und rechne Punkt–Ebene:</p>
        <Einzeilig max={17}><span>d(A; {nE}) =</span>
          <Bruch oben={<span>|{nv.map((x, i) => `${k(x)}·${k(A[i])}`).join(" + ")} − {k(d)}|</span>} unten={<Wurzel>{nv.map((x) => `${k(x)}²`).join(" + ")}</Wurzel>} />
          <Gl /><Bruch oben={<span>|{n(z)}|</span>} unten={<Wurzel>{qq}</Wurzel>} />
        </Einzeilig>
      </Schritt>
      <Erg links={`d(${nG}; ${nE})`} d2={q(z * z, qq)} text={z === 0 ? `A liegt in ${nE}, also liegt die ganze Gerade in der Ebene – Abstand 0.` : null} />
      <Raum3 punkte={[{ p: A, label: "A", farbe: FB }]} gerade={{ p: A, r: u }} ebene={{ n: nv, d }} />
    </>
  );
}

function EbeneEbene({ n1, d1, n2, d2, nE1, nE2 }) {
  const kr = kreuz(n1, n2);
  const kopf = (
    <div style={{ textAlign: "center", fontWeight: 700, marginBottom: 12, lineHeight: 1.8 }}>
      <div style={{ color: FA }}>{nE1}: {koordText(n1, d1)}</div><div style={{ color: C.gruen }}>{nE2}: {koordText(n2, d2)}</div>
    </div>
  );
  const s1 = (
    <Schritt nr="1" titel="Normalenvektoren vergleichen: Kreuzprodukt">
      <Einzeilig max={16}><Vek w={n1.map(n)} farbe={FA} /><span>×</span><Vek w={n2.map(n)} farbe={C.gruen} /><Gl /><Vek w={kr.map(n)} farbe={FE} /></Einzeilig>
    </Schritt>
  );
  if (kr.some((x) => x !== 0)) {
    return (
      <>
        {s1}
        <Erg links={`d(${nE1}; ${nE2})`} d2={q(0)} text="Die Normalenvektoren sind nicht parallel – die Ebenen schneiden sich in einer Geraden. Abstand 0." />
        <Raum3 punkte={[]} ebene={{ n: n1, d: d1 }} ebene2={{ n: n2, d: d2 }} />
      </>
    );
  }
  // Parallel: Punkt P auf E₂ wählen (eine Koordinate ≠ 0), dann Punkt–Ebene mit E₁
  const i = [0, 1, 2].find((j) => n2[j] !== 0);
  const P = [ganz(0), ganz(0), ganz(0)]; P[i] = q(d2, n2[i]);
  const zahlZ = n1[i] * d2 - d1 * n2[i];            // |n1·P − d1| = |zahlZ| / |n2_i|
  const qq = skalar(n1, n1);
  return (
    <>
      {s1}
      <Schritt nr="2" titel={`Parallel: Punkt auf ${nE2} wählen und Punkt–Ebene rechnen`}>
        <Einzeilig max={16}><span>Punkt auf {nE2}:</span>{qPunktText("P", P)}</Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={17}><span>d(P; {nE1}) =</span>
          <Bruch oben={<span>|{n1.map((x, j) => `${k(x)}·`).map((t, j) => <React.Fragment key={j}>{j > 0 && " + "}{t}{zk(P[j])}</React.Fragment>)} − {k(d1)}|</span>} unten={<Wurzel>{n1.map((x) => `${k(x)}²`).join(" + ")}</Wurzel>} />
        </Einzeilig>
      </Schritt>
      <Erg links={`d(${nE1}; ${nE2})`} d2={q(zahlZ * zahlZ, n2[i] * n2[i] * qq)} text={zahlZ === 0 ? "Die Ebenen sind identisch – Abstand 0." : "Die Ebenen sind echt parallel."} />
      <Raum3 punkte={[{ p: P.map(qWert), label: "P", farbe: C.gruen }]} ebene={{ n: n1, d: d1 }} ebene2={{ n: n2, d: d2 }} />
    </>
  );
}

/* ---------- Lotfußpunkt üben ---------- */

const qLesen = (s) => {
  const t = String(s).replace("−", "-").replace(",", ".").trim();
  const m = t.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (m) return Number(m[2]) === 0 ? null : Number(m[1]) / Number(m[2]);
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
};

function lotHilfe(art) {
  const h = abstandHilfe(art === "pg" ? "punkt-gerade" : "punkt-ebene");
  return { ...h, id: `lot-${art}`, hilfen: { ...h.hilfen, verstehen: [
    "Gesucht ist der Punkt F, an dem das Lot von P auftrifft – nicht der Abstand.",
    art === "pg" ? "F liegt auf der Geraden, und der Vektor PF steht senkrecht auf dem Richtungsvektor." : "F liegt in der Ebene, und PF ist ein Vielfaches des Normalenvektors.",
    art === "pg" ? "Setze F = A + t·u an und bestimme t aus PF · u = 0." : "Lotgerade l: x = P + λ·n in die Ebene einsetzen, λ bestimmen, in l einsetzen.",
  ] } };
}

function LotUeben({ art }) {
  const neu = () => neueAufgabe(art === "pg" ? "abstandPG" : "abstandPE");
  const [a, setA] = useState(neu);
  const [w, setW] = useState(["", "", ""]);
  const [erg, setErg] = useState(null);
  const F = art === "pg" ? a.F : (() => { const z = skalar(a.n, a.P) - a.d, qq = skalar(a.n, a.n); return a.P.map((x, i) => x - (z / qq) * a.n[i]); })();
  const pruefen = () => {
    const v = w.map(qLesen);
    if (v.some((x) => x === null)) return setErg({ art: "warn", text: "Bitte alle drei Koordinaten eintragen (ganze Zahl, Dezimalzahl oder Bruch wie 3/2)." });
    if (v.every((x, i) => Math.abs(x - F[i]) < 1e-9)) return setErg({ art: "gut", text: "Richtig – das ist der Lotfußpunkt." });
    const inObjekt = art === "pg"
      ? kreuz(v.map((x, i) => x - a.A[i]), a.u).every((x) => Math.abs(x) < 1e-9)
      : Math.abs(skalar(a.n, v) - a.d) < 1e-9;
    return setErg({ art: "schlecht", text: inObjekt
      ? `Dein Punkt liegt zwar ${art === "pg" ? "auf der Geraden" : "in der Ebene"}, aber das Lot steht dort nicht senkrecht. Prüfe die Lotbedingung.`
      : `Dein Punkt liegt nicht ${art === "pg" ? "auf der Geraden" : "in der Ebene"}. Setze ihn zur Probe ein.` });
  };
  const naechste = () => { setA(neu()); setW(["", "", ""]); setErg(null); };
  return (
    <div>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 12 }}>
        Bestimme den Lotfußpunkt F von P auf {art === "pg" ? "die Gerade g" : "die Ebene E"}. Der Rechenweg erscheint erst nach dem Prüfen.
      </p>
      <p style={{ textAlign: "center", fontWeight: 800, color: FB, marginBottom: 8 }}>P({a.P.map(n).join(" | ")})</p>
      {art === "pg" ? <GeradeText name="g" a={a.A} u={a.u} farbe={FA} /> : <p style={{ textAlign: "center", fontWeight: 700, color: FA }}>E: {koordText(a.n, a.d)}</p>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 17, fontWeight: 800, margin: "14px 0" }}>
        <span>F(</span>
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: C.hellgrau, fontWeight: 400 }}>|</span>}
            <input value={w[i]} aria-label={`F Koordinate x${i + 1}`} inputMode="text"
              onChange={(e) => { const x = [...w]; x[i] = e.target.value.slice(0, 7); setW(x); setErg(null); }}
              style={{ width: 52, height: 36, textAlign: "center", fontSize: 15, fontWeight: 800, fontFamily: "inherit", color: C.see,
                border: `1.5px solid ${C.see}55`, borderRadius: 9, background: `${C.see}0D`, outline: "none" }} />
          </React.Fragment>
        ))}
        <span>)</span>
      </div>
      {erg && <Meldung art={erg.art}>{erg.text}</Meldung>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: erg ? 14 : 0 }}>
        <Knopf gold onClick={pruefen}>Prüfen</Knopf>
        <Knopf onClick={naechste}>Neue Aufgabe</Knopf>
      </div>
      {erg && erg.art !== "warn" && (
        <details style={{ marginTop: 6 }}>
          <summary style={{ cursor: "pointer", color: C.see, fontWeight: 600, fontSize: 14, padding: "8px 0" }}>Rechenweg anzeigen</summary>
          <div style={{ marginTop: 8 }}>
            {art === "pg" ? <PunktGerade P={a.P} A={a.A} u={a.u} nP="P" nG="g" /> : <PunktEbene P={a.P} nv={a.n} d={a.d} nP="P" nE="E" />}
          </div>
        </details>
      )}
    </div>
  );
}

/* ---------- Seite ---------- */

export function Abstaende() {
  const [links, setLinks] = useState(START.links);
  const [rechts, setRechts] = useState(START.rechts);
  const [modus, setModus] = useState("rechnen");
  const [nL, nR] = namen(links.typ, rechts.typ);
  const oL = lese(links), oR = lese(rechts);
  const kombi = [links.typ, rechts.typ].sort((a, b) => TYPEN.findIndex((t) => t.id === a) - TYPEN.findIndex((t) => t.id === b)).join("-");
  const lotArt = kombi === "punkt-gerade" ? "pg" : kombi === "punkt-ebene" ? "pe" : null;
  const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };

  // Objekte in Standardreihenfolge (Punkt < Gerade < Ebene) – umgekehrte Auswahl nutzt dieselbe Logik
  let rechnung = null;
  if (!oL.fehler && !oR.fehler) {
    const tausch = TYPEN.findIndex((t) => t.id === links.typ) > TYPEN.findIndex((t) => t.id === rechts.typ);
    const [x, y] = tausch ? [oR, oL] : [oL, oR];
    const [nx, ny] = tausch ? [nR, nL] : [nL, nR];
    const sch = [kombi, x, y, nx, ny].join("|") + JSON.stringify([x, y]);
    if (kombi === "punkt-punkt") rechnung = <PunktPunkt key={sch} P={x.p} Q={y.p} nP={nx} nQ={ny} />;
    else if (kombi === "punkt-gerade") rechnung = <PunktGerade key={sch} P={x.p} A={y.a} u={y.u} nP={nx} nG={ny} />;
    else if (kombi === "punkt-ebene") rechnung = <PunktEbene key={sch} P={x.p} nv={y.nv} d={y.d} nP={nx} nE={ny} />;
    else if (kombi === "gerade-gerade") rechnung = <GeradeGerade key={sch} A={x.a} u={x.u} B={y.a} v={y.u} nG={nx} nH={ny} />;
    else if (kombi === "gerade-ebene") rechnung = <GeradeEbene key={sch} A={x.a} u={x.u} nv={y.nv} d={y.d} nG={nx} nE={ny} />;
    else rechnung = <EbeneEbene key={sch} n1={x.nv} d1={x.d} n2={y.nv} d2={y.d} nE1={nx} nE2={ny} />;
  }

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>Wie weit ist es von … bis …?</h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Wähle links und rechts je ein Objekt. Du bekommst Eingabefelder, die passende Rechnung und das 3D-Bild.
        Schneiden sich die Objekte oder liegt eines im anderen, ist der Abstand 0.
      </p>

      <div style={karte}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <IchHaengeFest kontext={modus === "lot" && lotArt ? lotHilfe(lotArt) : abstandHilfe(kombi)} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <Auswahl wert={links.typ} setWert={(t) => { setLinks({ ...links, typ: t }); setModus("rechnen"); }} seite={0} />
          <span style={{ fontSize: 15, fontWeight: 700, color: C.grau, flexShrink: 0 }}>zu</span>
          <Auswahl wert={rechts.typ} setWert={(t) => { setRechts({ ...rechts, typ: t }); setModus("rechnen"); }} seite={1} />
        </div>

        {lotArt && (
          <div role="tablist" aria-label="Modus" style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {[["rechnen", "Abstand berechnen"], ["lot", "Lotfußpunkt üben"]].map(([id, t]) => (
              <button key={id} type="button" role="tab" aria-selected={modus === id} onClick={() => setModus(id)}
                style={{ padding: "7px 14px", borderRadius: 999, fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                  border: `1px solid ${modus === id ? C.see : C.linie}`, background: modus === id ? C.himmel : C.weiss, color: C.see, fontWeight: modus === id ? 700 : 500 }}>{t}</button>
            ))}
          </div>
        )}

        {modus === "lot" && lotArt ? <LotUeben key={lotArt} art={lotArt} /> : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${C.linie}` }}>
              <ObjektEingabe o={links} setO={setLinks} name={nL} farbe={C.see} />
              <ObjektEingabe o={rechts} setO={setRechts} name={nR} farbe={C.gruen} />
            </div>
            {oL.fehler || oR.fehler ? <Meldung art="warn">{oL.fehler || oR.fehler}</Meldung> : rechnung}
          </>
        )}
      </div>
    </div>
  );
}
